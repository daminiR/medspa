/**
 * Appointments API Routes
 *
 * Full CRUD operations for appointment management:
 * - List/search appointments with filtering
 * - Get single appointment
 * - Create appointment with conflict detection
 * - Update appointment
 * - Cancel/delete appointment
 * - Status transitions
 * - Reschedule
 * - Conflict checking
 * - Availability calculation
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, optionalAuthMiddleware, requirePermission } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { Prisma, AppointmentStatus as PrismaAppointmentStatus } from '@prisma/client';

const appointments = new Hono();

// ===================
// Types
// ===================

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  practitionerId: string;
  practitionerName: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  locationId?: string;
  roomId?: string;
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  status: AppointmentStatus;
  color: string;
  notes?: string;
  internalNotes?: string;
  bookingType: 'scheduled' | 'walk_in' | 'express_booking' | 'from_waitlist';
  groupBookingId?: string;
  isGroupCoordinator?: boolean;
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: string;
  overriddenConflicts?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProviderSchedule {
  practitionerId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export interface Break {
  id: string;
  practitionerId: string;
  startTime: Date;
  endTime: Date;
  type: 'lunch' | 'personal' | 'meeting' | 'training' | 'out_of_office' | 'other';
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  practitionerId: string;
  practitionerName: string;
  duration: number;
}

// ===================
// Validation Schemas
// ===================

const uuidSchema = z.string().min(1);

const appointmentStatusSchema = z.enum([
  'scheduled',
  'confirmed',
  'arrived',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
]);

const bookingTypeSchema = z.enum([
  'scheduled',
  'walk_in',
  'express_booking',
  'from_waitlist',
]);

const appointmentIdParamSchema = z.object({
  id: uuidSchema,
});

const listAppointmentsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  practitionerId: uuidSchema.optional(),
  patientId: uuidSchema.optional(),
  status: appointmentStatusSchema.optional(),
  statuses: z.string().optional(), // comma-separated
  roomId: uuidSchema.optional(),
  locationId: uuidSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const createAppointmentSchema = z.object({
  patientId: uuidSchema,
  patientName: z.string().min(1),
  patientPhone: z.string().optional(),
  patientEmail: z.string().email().optional(),
  practitionerId: uuidSchema,
  practitionerName: z.string().min(1),
  serviceId: uuidSchema,
  serviceName: z.string().min(1),
  serviceCategory: z.string().default('aesthetics'),
  locationId: uuidSchema.optional(),
  roomId: uuidSchema.optional(),
  startTime: z.string().datetime(),
  duration: z.coerce.number().int().min(5).max(480),
  bookingType: bookingTypeSchema.default('scheduled'),
  notes: z.string().max(5000).optional(),
  internalNotes: z.string().max(5000).optional(),
  groupBookingId: uuidSchema.optional(),
  isGroupCoordinator: z.boolean().optional(),
  overriddenConflicts: z.boolean().optional(),
  color: z.string().optional(),
});

const updateAppointmentSchema = z.object({
  patientId: uuidSchema.optional(),
  patientName: z.string().min(1).optional(),
  patientPhone: z.string().optional(),
  patientEmail: z.string().email().optional(),
  practitionerId: uuidSchema.optional(),
  practitionerName: z.string().min(1).optional(),
  serviceId: uuidSchema.optional(),
  serviceName: z.string().min(1).optional(),
  serviceCategory: z.string().optional(),
  locationId: uuidSchema.optional().nullable(),
  roomId: uuidSchema.optional().nullable(),
  startTime: z.string().datetime().optional(),
  duration: z.coerce.number().int().min(5).max(480).optional(),
  notes: z.string().max(5000).optional().nullable(),
  internalNotes: z.string().max(5000).optional().nullable(),
  color: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: appointmentStatusSchema,
});

const rescheduleSchema = z.object({
  startTime: z.string().datetime(),
  practitionerId: uuidSchema.optional(),
  roomId: uuidSchema.optional().nullable(),
  notes: z.string().max(500).optional(),
});

const cancelSchema = z.object({
  reason: z.string().max(500).optional(),
  notifyPatient: z.boolean().default(true),
  chargeNoShowFee: z.boolean().default(false),
});

const checkConflictsSchema = z.object({
  practitionerId: uuidSchema,
  startTime: z.string().datetime(),
  duration: z.coerce.number().int().min(5),
  roomId: uuidSchema.optional(),
  patientId: uuidSchema.optional(),
  excludeAppointmentId: uuidSchema.optional(),
});

const availabilitySchema = z.object({
  practitionerId: uuidSchema,
  date: z.string(), // YYYY-MM-DD
  serviceId: uuidSchema.optional(),
  duration: z.coerce.number().int().min(5).default(60),
  locationId: uuidSchema.optional(),
});

// ===================
// Database Configuration
// ===================

// Provider schedules (shifts) - TODO: Move to database table
const providerSchedules: ProviderSchedule[] = [
  // Provider 1 - Mon-Fri 9-5
  { practitionerId: 'prov-1', dayOfWeek: 1, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
  { practitionerId: 'prov-1', dayOfWeek: 2, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
  { practitionerId: 'prov-1', dayOfWeek: 3, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
  { practitionerId: 'prov-1', dayOfWeek: 4, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
  { practitionerId: 'prov-1', dayOfWeek: 5, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
  // Provider 2 - Mon, Wed, Fri 10-6
  { practitionerId: 'prov-2', dayOfWeek: 1, startHour: 10, startMinute: 0, endHour: 18, endMinute: 0 },
  { practitionerId: 'prov-2', dayOfWeek: 3, startHour: 10, startMinute: 0, endHour: 18, endMinute: 0 },
  { practitionerId: 'prov-2', dayOfWeek: 5, startHour: 10, startMinute: 0, endHour: 18, endMinute: 0 },
  // Provider 3 - Tue, Thu, Sat 8-4
  { practitionerId: 'prov-3', dayOfWeek: 2, startHour: 8, startMinute: 0, endHour: 16, endMinute: 0 },
  { practitionerId: 'prov-3', dayOfWeek: 4, startHour: 8, startMinute: 0, endHour: 16, endMinute: 0 },
  { practitionerId: 'prov-3', dayOfWeek: 6, startHour: 8, startMinute: 0, endHour: 16, endMinute: 0 },
];

// Buffer time in minutes (between appointments)
const BUFFER_TIME_MINUTES = 0;

// ===================
// Helper Functions
// ===================

function generateId(): string {
  return `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

/**
 * Check if times overlap
 */
function timesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Get provider schedule for a specific date
 */
function getProviderScheduleForDate(
  practitionerId: string,
  date: Date
): ProviderSchedule | null {
  const dayOfWeek = date.getDay();
  return providerSchedules.find(
    s => s.practitionerId === practitionerId && s.dayOfWeek === dayOfWeek
  ) || null;
}

/**
 * Check for conflicts
 */
async function checkConflicts(
  practitionerId: string,
  startTime: Date,
  endTime: Date,
  roomId?: string,
  patientId?: string,
  excludeAppointmentId?: string
): Promise<{
  hasConflict: boolean;
  conflicts: Array<{
    type: 'provider' | 'room' | 'patient' | 'break' | 'outside_hours';
    appointmentId?: string;
    message: string;
  }>;
}> {
  const conflicts: Array<{
    type: 'provider' | 'room' | 'patient' | 'break' | 'outside_hours';
    appointmentId?: string;
    message: string;
  }> = [];

  // Check provider schedule
  const schedule = getProviderScheduleForDate(practitionerId, startTime);
  if (!schedule) {
    conflicts.push({
      type: 'outside_hours',
      message: `Provider is not scheduled to work on this day`,
    });
  } else {
    // Check if within working hours
    const scheduleStart = new Date(startTime);
    scheduleStart.setHours(schedule.startHour, schedule.startMinute, 0, 0);
    const scheduleEnd = new Date(startTime);
    scheduleEnd.setHours(schedule.endHour, schedule.endMinute, 0, 0);

    if (startTime < scheduleStart || endTime > scheduleEnd) {
      conflicts.push({
        type: 'outside_hours',
        message: `Appointment is outside provider's working hours (${schedule.startHour}:${schedule.startMinute.toString().padStart(2, '0')} - ${schedule.endHour}:${schedule.endMinute.toString().padStart(2, '0')})`,
      });
    }
  }

  // Note: Break conflicts check removed - no Break model in Prisma schema yet
  // TODO: Add back when Break model is added to schema

  // Check existing appointments
  const whereConditions: Prisma.AppointmentWhereInput = {
    startTime: { lt: endTime },
    endTime: { gt: startTime },
    status: { notIn: ['CANCELLED', 'NO_SHOW'] },
  };

  if (excludeAppointmentId) {
    whereConditions.id = { not: excludeAppointmentId };
  }

  const existingAppointments = await prisma.appointment.findMany({
    where: whereConditions,
    include: {
      Patient: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  for (const apt of existingAppointments) {
    const patientName = apt.Patient ? `${apt.Patient.firstName} ${apt.Patient.lastName}` : 'Unknown';

    // Provider conflict
    if (apt.practitionerId === practitionerId) {
      const aptEndWithBuffer = new Date(apt.endTime.getTime() + BUFFER_TIME_MINUTES * 60 * 1000);
      if (timesOverlap(startTime, endTime, apt.startTime, aptEndWithBuffer)) {
        conflicts.push({
          type: 'provider',
          appointmentId: apt.id,
          message: `Provider already has an appointment with ${patientName} at this time`,
        });
      }
    }

    // Note: Room conflict check removed - no roomId in Prisma Appointment model yet
    // TODO: Add back when roomId field is added to schema

    // Patient double-booking
    if (patientId && apt.patientId === patientId) {
      if (timesOverlap(startTime, endTime, apt.startTime, apt.endTime)) {
        conflicts.push({
          type: 'patient',
          appointmentId: apt.id,
          message: `Patient already has an appointment at this time`,
        });
      }
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
  };
}

/**
 * Valid status transitions
 */
const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  scheduled: ['confirmed', 'arrived', 'cancelled', 'no_show'],
  confirmed: ['arrived', 'cancelled', 'no_show'],
  arrived: ['in_progress', 'cancelled', 'no_show'],
  in_progress: ['completed', 'cancelled'],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
  no_show: [], // Terminal state
};

function isValidTransition(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return validTransitions[from]?.includes(to) ?? false;
}

/**
 * Calculate available slots for a provider on a date
 */
async function calculateAvailableSlots(
  practitionerId: string,
  date: Date,
  durationMinutes: number
): Promise<AvailableSlot[]> {
  const slots: AvailableSlot[] = [];
  const schedule = getProviderScheduleForDate(practitionerId, date);

  if (!schedule) {
    return slots; // Provider not working on this day
  }

  // Get start and end of work day
  const dayStart = new Date(date);
  dayStart.setHours(schedule.startHour, schedule.startMinute, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(schedule.endHour, schedule.endMinute, 0, 0);

  // Get all busy periods (appointments + breaks)
  const busyPeriods: Array<{ start: Date; end: Date }> = [];

  // Add appointments from database
  const dateString = date.toISOString().split('T')[0];
  const dayStartDate = new Date(dateString + 'T00:00:00.000Z');
  const dayEndDate = new Date(dateString + 'T23:59:59.999Z');

  const appointments = await prisma.appointment.findMany({
    where: {
      practitionerId,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      startTime: {
        gte: dayStartDate,
        lte: dayEndDate,
      },
    },
  });

  for (const apt of appointments) {
    busyPeriods.push({
      start: apt.startTime,
      end: new Date(apt.endTime.getTime() + BUFFER_TIME_MINUTES * 60 * 1000),
    });
  }

  // Note: Breaks removed - no Break model in Prisma schema yet
  // TODO: Add back when Break model is added to schema

  // Sort busy periods by start time
  busyPeriods.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Get provider name
  const provider = await prisma.user.findUnique({
    where: { id: practitionerId },
    select: { firstName: true, lastName: true },
  });

  const practitionerName = provider ? `${provider.firstName} ${provider.lastName}` : 'Unknown Provider';

  // Find gaps
  let currentTime = dayStart;
  const slotDurationMs = durationMinutes * 60 * 1000;

  for (const period of busyPeriods) {
    // If there's a gap before this busy period
    while (currentTime.getTime() + slotDurationMs <= period.start.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + slotDurationMs);
      slots.push({
        startTime: currentTime.toISOString(),
        endTime: slotEnd.toISOString(),
        practitionerId,
        practitionerName,
        duration: durationMinutes,
      });
      // Move to next potential slot (15-minute increments)
      currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
    }

    // Move current time past the busy period
    if (period.end.getTime() > currentTime.getTime()) {
      currentTime = new Date(period.end);
    }
  }

  // Check remaining time until end of day
  while (currentTime.getTime() + slotDurationMs <= dayEnd.getTime()) {
    const slotEnd = new Date(currentTime.getTime() + slotDurationMs);
    slots.push({
      startTime: currentTime.toISOString(),
      endTime: slotEnd.toISOString(),
      practitionerId,
      practitionerName,
      duration: durationMinutes,
    });
    currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
  }

  return slots;
}

// ===================
// Routes
// ===================

// Availability endpoint is public
appointments.get(
  '/availability',
  optionalAuthMiddleware,
  zValidator('query', availabilitySchema),
  async (c) => {
    const { practitionerId, date, duration } = c.req.valid('query');

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      throw APIError.badRequest('Invalid date format. Use YYYY-MM-DD.');
    }

    const slots = await calculateAvailableSlots(practitionerId, targetDate, duration);

    // Get provider name
    const provider = await prisma.user.findUnique({
      where: { id: practitionerId },
      select: { firstName: true, lastName: true },
    });
    const practitionerName = provider ? `${provider.firstName} ${provider.lastName}` : 'Unknown Provider';

    return c.json({
      success: true,
      date,
      practitionerId,
      practitionerName,
      duration,
      slots,
      totalSlots: slots.length,
    });
  }
);

// All other routes require authentication
appointments.use('/*', authMiddleware);

/**
 * List/Search appointments
 * GET /api/appointments
 */
appointments.get(
  '/',
  requirePermission('appointment:list'),
  zValidator('query', listAppointmentsSchema),
  async (c) => {
    const query = c.req.valid('query');
    const whereConditions: Prisma.AppointmentWhereInput = {};

    // Filter by date range
    if (query.startDate && query.endDate) {
      // Both start and end date
      const start = new Date(query.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      whereConditions.startTime = { gte: start, lte: end };
    } else if (query.startDate) {
      // Only start date
      const start = new Date(query.startDate);
      start.setHours(0, 0, 0, 0);
      whereConditions.startTime = { gte: start };
    } else if (query.endDate) {
      // Only end date
      const end = new Date(query.endDate);
      end.setHours(23, 59, 59, 999);
      whereConditions.startTime = { lte: end };
    }

    // Filter by practitioner
    if (query.practitionerId) {
      whereConditions.practitionerId = query.practitionerId;
    }

    // Filter by patient
    if (query.patientId) {
      whereConditions.patientId = query.patientId;
    }

    // Filter by single status
    if (query.status) {
      // Convert lowercase status to UPPERCASE for Prisma enum
      const prismaStatus = query.status.toUpperCase() as PrismaAppointmentStatus;
      whereConditions.status = prismaStatus;
    }

    // Filter by multiple statuses
    if (query.statuses) {
      const statusList = query.statuses.split(',').map(s => s.toUpperCase()) as PrismaAppointmentStatus[];
      whereConditions.status = { in: statusList };
    }

    // Note: Room and location filters removed - fields not in Prisma Appointment model yet
    // TODO: Add back when roomId and locationId fields are added to schema

    // Get total count
    const total = await prisma.appointment.count({ where: whereConditions });

    // Get paginated results with related data
    const offset = (query.page - 1) * query.limit;
    const results = await prisma.appointment.findMany({
      where: whereConditions,
      include: {
        Patient: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
      skip: offset,
      take: query.limit,
    });

    // Transform results to match the API interface
    const items = results.map(apt => ({
      id: apt.id,
      patientId: apt.patientId,
      patientName: apt.Patient ? `${apt.Patient.firstName} ${apt.Patient.lastName}` : 'Unknown',
      patientPhone: apt.Patient?.phone || undefined,
      patientEmail: apt.Patient?.email || undefined,
      practitionerId: apt.practitionerId,
      practitionerName: apt.practitionerName,
      serviceId: apt.serviceCategory, // Using serviceCategory as serviceId placeholder
      serviceName: apt.serviceName,
      serviceCategory: apt.serviceCategory,
      locationId: undefined, // Not in schema yet
      roomId: undefined, // Not in schema yet
      startTime: apt.startTime.toISOString(),
      endTime: apt.endTime.toISOString(),
      duration: undefined, // Not in schema yet - could calculate from start/end
      status: apt.status.toLowerCase() as AppointmentStatus, // Convert back to lowercase
      color: '#8B5CF6', // Default color - not in schema yet
      bookingType: 'scheduled', // Default - not in schema yet
      notes: apt.notes || undefined,
      internalNotes: undefined, // Not in schema yet
      groupBookingId: undefined, // Not in schema yet
      isGroupCoordinator: undefined, // Not in schema yet
      overriddenConflicts: undefined, // Not in schema yet
      cancellationReason: undefined, // Not in schema yet
      cancelledAt: undefined, // Not in schema yet
      cancelledBy: undefined, // Not in schema yet
      createdAt: apt.createdAt.toISOString(),
      updatedAt: new Date().toISOString(), // Using current date as placeholder
    }));

    return c.json({
      success: true,
      items,
      total,
      page: query.page,
      limit: query.limit,
      hasMore: offset + items.length < total,
    });
  }
);

/**
 * Get appointment by ID
 * GET /api/appointments/:id
 */
appointments.get(
  '/:id',
  requirePermission('appointment:read'),
  zValidator('param', appointmentIdParamSchema),
  async (c) => {
    const { id } = c.req.valid('param');

    const apt = await prisma.appointment.findUnique({
      where: { id },
      include: {
        Patient: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!apt) {
      throw APIError.notFound('Appointment');
    }

    const appointment = {
      id: apt.id,
      patientId: apt.patientId,
      patientName: apt.Patient ? `${apt.Patient.firstName} ${apt.Patient.lastName}` : 'Unknown',
      patientPhone: apt.Patient?.phone || undefined,
      patientEmail: apt.Patient?.email || undefined,
      practitionerId: apt.practitionerId,
      practitionerName: apt.practitionerName,
      serviceId: apt.serviceCategory, // Using serviceCategory as placeholder
      serviceName: apt.serviceName,
      serviceCategory: apt.serviceCategory,
      locationId: undefined, // Not in schema yet
      roomId: undefined, // Not in schema yet
      startTime: apt.startTime.toISOString(),
      endTime: apt.endTime.toISOString(),
      duration: Math.round((apt.endTime.getTime() - apt.startTime.getTime()) / (60 * 1000)), // Calculate from dates
      status: apt.status.toLowerCase() as AppointmentStatus,
      color: '#8B5CF6', // Default - not in schema yet
      bookingType: 'scheduled' as const, // Default - not in schema yet
      notes: apt.notes || undefined,
      internalNotes: undefined, // Not in schema yet
      groupBookingId: undefined, // Not in schema yet
      isGroupCoordinator: undefined, // Not in schema yet
      overriddenConflicts: undefined, // Not in schema yet
      cancellationReason: undefined, // Not in schema yet
      cancelledAt: undefined, // Not in schema yet
      cancelledBy: undefined, // Not in schema yet
      createdAt: apt.createdAt.toISOString(),
      updatedAt: new Date().toISOString(), // Placeholder - not in schema yet
    };

    return c.json({
      success: true,
      appointment,
    });
  }
);

/**
 * Create appointment
 * POST /api/appointments
 */
appointments.post(
  '/',
  requirePermission('appointment:create'),
  zValidator('json', createAppointmentSchema),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const startTime = new Date(data.startTime);
    const endTime = new Date(startTime.getTime() + data.duration * 60 * 1000);

    // Check for conflicts unless explicitly overridden
    if (!data.overriddenConflicts) {
      const conflictCheck = await checkConflicts(
        data.practitionerId,
        startTime,
        endTime,
        data.roomId,
        data.patientId
      );

      if (conflictCheck.hasConflict) {
        throw APIError.conflict(
          `Scheduling conflict detected: ${conflictCheck.conflicts.map(c => c.message).join('; ')}`
        );
      }
    }

    // Generate appointment ID
    const appointmentId = generateId();

    // Insert appointment into database
    const newAppointment = await prisma.appointment.create({
      data: {
        id: appointmentId,
        patientId: data.patientId,
        patientName: data.patientName,
        practitionerId: data.practitionerId,
        practitionerName: data.practitionerName,
        serviceName: data.serviceName,
        serviceCategory: data.serviceCategory,
        startTime,
        endTime,
        status: 'SCHEDULED',
        notes: data.notes,
      },
      include: {
        Patient: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'CREATE',
      resourceType: 'appointment',
      resourceId: newAppointment.id,
      patientId: data.patientId,
      phiAccessed: true,
      ipAddress,
      metadata: {
        practitionerId: data.practitionerId,
        serviceId: data.serviceId,
        startTime: startTime.toISOString(),
      },
    });

    const appointment = {
      id: newAppointment.id,
      patientId: newAppointment.patientId,
      patientName: newAppointment.Patient ? `${newAppointment.Patient.firstName} ${newAppointment.Patient.lastName}` : data.patientName,
      patientPhone: newAppointment.Patient?.phone || data.patientPhone,
      patientEmail: newAppointment.Patient?.email || data.patientEmail,
      practitionerId: newAppointment.practitionerId,
      practitionerName: newAppointment.practitionerName,
      serviceId: data.serviceId,
      serviceName: newAppointment.serviceName,
      serviceCategory: newAppointment.serviceCategory,
      locationId: data.locationId,
      roomId: data.roomId,
      startTime: newAppointment.startTime.toISOString(),
      endTime: newAppointment.endTime.toISOString(),
      duration: data.duration,
      status: newAppointment.status.toLowerCase() as AppointmentStatus,
      color: data.color || '#8B5CF6',
      bookingType: data.bookingType,
      notes: newAppointment.notes || undefined,
      internalNotes: data.internalNotes,
      groupBookingId: data.groupBookingId,
      isGroupCoordinator: data.isGroupCoordinator,
      overriddenConflicts: data.overriddenConflicts,
      createdAt: newAppointment.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return c.json({
      success: true,
      message: 'Appointment created successfully',
      appointment,
    }, 201);
  }
);

/**
 * Update appointment
 * PUT /api/appointments/:id
 */
appointments.put(
  '/:id',
  requirePermission('appointment:update'),
  zValidator('param', appointmentIdParamSchema),
  zValidator('json', updateAppointmentSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    // Fetch existing appointment
    const existing = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw APIError.notFound('Appointment');
    }

    // Cannot update cancelled/completed appointments
    if (existing.status === 'CANCELLED' || existing.status === 'COMPLETED') {
      throw APIError.badRequest(`Cannot update ${existing.status.toLowerCase()} appointment`);
    }

    // Prepare update object
    const updateData: Prisma.AppointmentUpdateInput = {};

    // If timing is being changed, check for conflicts
    if (data.startTime || data.duration || data.practitionerId) {
      const newStartTime = data.startTime ? new Date(data.startTime) : existing.startTime;
      const existingDuration = Math.round((existing.endTime.getTime() - existing.startTime.getTime()) / (60 * 1000));
      const newDuration = data.duration || existingDuration;
      const newEndTime = new Date(newStartTime.getTime() + newDuration * 60 * 1000);
      const newPractitionerId = data.practitionerId || existing.practitionerId;

      const conflictCheck = await checkConflicts(
        newPractitionerId,
        newStartTime,
        newEndTime,
        data.roomId ?? undefined,
        existing.patientId,
        id // Exclude current appointment
      );

      if (conflictCheck.hasConflict) {
        throw APIError.conflict(
          `Scheduling conflict detected: ${conflictCheck.conflicts.map(c => c.message).join('; ')}`
        );
      }

      updateData.startTime = newStartTime;
      updateData.endTime = newEndTime;
      if (data.practitionerId) {
        updateData.practitionerId = data.practitionerId;
        if (data.practitionerName) updateData.practitionerName = data.practitionerName;
      }
    }

    // Update other fields
    // Note: patientId is not updatable - cannot reassign appointment to different patient
    if (data.patientName) updateData.patientName = data.patientName;
    if (data.serviceName) updateData.serviceName = data.serviceName;
    if (data.serviceCategory) updateData.serviceCategory = data.serviceCategory;
    if (data.notes !== undefined) updateData.notes = data.notes;

    // Update in database
    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        Patient: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'UPDATE',
      resourceType: 'appointment',
      resourceId: id,
      patientId: existing.patientId,
      phiAccessed: true,
      ipAddress,
      metadata: { updatedFields: Object.keys(data) },
    });

    const appointment = {
      id: updated.id,
      patientId: updated.patientId,
      patientName: updated.Patient ? `${updated.Patient.firstName} ${updated.Patient.lastName}` : updated.patientName,
      patientPhone: updated.Patient?.phone || undefined,
      patientEmail: updated.Patient?.email || undefined,
      practitionerId: updated.practitionerId,
      practitionerName: updated.practitionerName,
      serviceId: data.serviceId || updated.serviceCategory,
      serviceName: updated.serviceName,
      serviceCategory: updated.serviceCategory,
      locationId: data.locationId,
      roomId: data.roomId,
      startTime: updated.startTime.toISOString(),
      endTime: updated.endTime.toISOString(),
      duration: Math.round((updated.endTime.getTime() - updated.startTime.getTime()) / (60 * 1000)),
      status: updated.status.toLowerCase() as AppointmentStatus,
      color: data.color || '#8B5CF6',
      bookingType: 'scheduled' as const,
      notes: updated.notes || undefined,
      internalNotes: data.internalNotes,
      groupBookingId: undefined,
      isGroupCoordinator: undefined,
      overriddenConflicts: undefined,
      cancellationReason: undefined,
      cancelledAt: undefined,
      cancelledBy: undefined,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return c.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment,
    });
  }
);

/**
 * Delete/Cancel appointment
 * DELETE /api/appointments/:id
 */
appointments.delete(
  '/:id',
  requirePermission('appointment:delete'),
  zValidator('param', appointmentIdParamSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    // Parse body if present (for cancellation reason)
    let reason: string | undefined;
    try {
      const body = await c.req.json();
      reason = body?.reason;
    } catch {
      // No body provided, that's okay
    }

    // Fetch existing appointment
    const existing = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw APIError.notFound('Appointment');
    }

    // Update to cancelled status
    const cancelled = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        // Note: cancellationReason, cancelledAt, cancelledBy fields not in schema yet
      },
      include: {
        Patient: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'DELETE',
      resourceType: 'appointment',
      resourceId: id,
      patientId: existing.patientId,
      phiAccessed: true,
      ipAddress,
      metadata: { reason },
    });

    const appointment = {
      id: cancelled.id,
      patientId: cancelled.patientId,
      patientName: cancelled.Patient ? `${cancelled.Patient.firstName} ${cancelled.Patient.lastName}` : cancelled.patientName,
      patientPhone: cancelled.Patient?.phone || undefined,
      patientEmail: cancelled.Patient?.email || undefined,
      practitionerId: cancelled.practitionerId,
      practitionerName: cancelled.practitionerName,
      serviceId: cancelled.serviceCategory,
      serviceName: cancelled.serviceName,
      serviceCategory: cancelled.serviceCategory,
      locationId: undefined,
      roomId: undefined,
      startTime: cancelled.startTime.toISOString(),
      endTime: cancelled.endTime.toISOString(),
      duration: Math.round((cancelled.endTime.getTime() - cancelled.startTime.getTime()) / (60 * 1000)),
      status: cancelled.status.toLowerCase() as AppointmentStatus,
      color: '#8B5CF6',
      bookingType: 'scheduled' as const,
      notes: cancelled.notes || undefined,
      internalNotes: undefined,
      groupBookingId: undefined,
      isGroupCoordinator: undefined,
      overriddenConflicts: undefined,
      cancellationReason: reason || 'Cancelled by staff',
      cancelledAt: new Date().toISOString(),
      cancelledBy: user?.uid,
      createdAt: cancelled.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return c.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment,
    });
  }
);

/**
 * Update status only
 * PATCH /api/appointments/:id/status
 */
appointments.patch(
  '/:id/status',
  requirePermission('appointment:update'),
  zValidator('param', appointmentIdParamSchema),
  zValidator('json', updateStatusSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const { status } = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw APIError.notFound('Appointment');
    }

    const currentStatus = appointment.status.toLowerCase() as AppointmentStatus;

    // Validate status transition
    if (!isValidTransition(currentStatus, status)) {
      throw APIError.badRequest(
        `Invalid status transition from '${currentStatus}' to '${status}'`
      );
    }

    const previousStatus = currentStatus;
    const prismaStatus = status.toUpperCase() as PrismaAppointmentStatus;

    // Update appointment status
    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: prismaStatus,
        // Note: cancelledAt and cancelledBy fields not in schema yet
      },
    });

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'UPDATE',
      resourceType: 'appointment',
      resourceId: id,
      patientId: appointment.patientId,
      phiAccessed: true,
      ipAddress,
      metadata: { previousStatus, newStatus: status },
    });

    return c.json({
      success: true,
      message: `Appointment status updated to '${status}'`,
      appointment: {
        id: updated.id,
        patientId: updated.patientId,
        patientName: updated.patientName,
        practitionerId: updated.practitionerId,
        practitionerName: updated.practitionerName,
        serviceId: updated.serviceCategory,
        serviceName: updated.serviceName,
        serviceCategory: updated.serviceCategory,
        startTime: updated.startTime.toISOString(),
        endTime: updated.endTime.toISOString(),
        duration: Math.round((updated.endTime.getTime() - updated.startTime.getTime()) / (60 * 1000)),
        status: updated.status.toLowerCase() as AppointmentStatus,
        notes: updated.notes || undefined,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: new Date().toISOString(),
        cancelledAt: status === 'cancelled' ? new Date().toISOString() : undefined,
        cancelledBy: status === 'cancelled' ? user?.uid : undefined,
      },
    });
  }
);

/**
 * Reschedule appointment
 * POST /api/appointments/:id/reschedule
 */
appointments.post(
  '/:id/reschedule',
  requirePermission('appointment:update'),
  zValidator('param', appointmentIdParamSchema),
  zValidator('json', rescheduleSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw APIError.notFound('Appointment');
    }

    const currentStatus = appointment.status.toLowerCase();

    // Cannot reschedule cancelled/completed appointments
    if (currentStatus === 'cancelled' || currentStatus === 'completed') {
      throw APIError.badRequest(`Cannot reschedule ${currentStatus} appointment`);
    }

    const duration = Math.round((appointment.endTime.getTime() - appointment.startTime.getTime()) / (60 * 1000));
    const newStartTime = new Date(data.startTime);
    const newEndTime = new Date(newStartTime.getTime() + duration * 60 * 1000);
    const newPractitionerId = data.practitionerId || appointment.practitionerId;

    // Check for conflicts
    const conflictCheck = await checkConflicts(
      newPractitionerId,
      newStartTime,
      newEndTime,
      data.roomId ?? undefined,
      appointment.patientId,
      id
    );

    if (conflictCheck.hasConflict) {
      throw APIError.conflict(
        `Scheduling conflict detected: ${conflictCheck.conflicts.map(c => c.message).join('; ')}`
      );
    }

    const previousStartTime = appointment.startTime;
    const updateData: Prisma.AppointmentUpdateInput = {
      startTime: newStartTime,
      endTime: newEndTime,
    };

    if (data.practitionerId) {
      updateData.practitionerId = data.practitionerId;
      // Note: Would need to fetch practitioner name if changed
    }

    if (data.notes) {
      const existingNotes = appointment.notes || '';
      updateData.notes = existingNotes
        ? `${existingNotes}\n\nRescheduled: ${data.notes}`
        : `Rescheduled: ${data.notes}`;
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: updateData,
    });

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'UPDATE',
      resourceType: 'appointment',
      resourceId: id,
      patientId: appointment.patientId,
      phiAccessed: true,
      ipAddress,
      metadata: {
        action: 'reschedule',
        previousStartTime: previousStartTime.toISOString(),
        newStartTime: newStartTime.toISOString(),
      },
    });

    return c.json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment: {
        id: updated.id,
        patientId: updated.patientId,
        patientName: updated.patientName,
        practitionerId: updated.practitionerId,
        practitionerName: updated.practitionerName,
        serviceId: updated.serviceCategory,
        serviceName: updated.serviceName,
        serviceCategory: updated.serviceCategory,
        startTime: updated.startTime.toISOString(),
        endTime: updated.endTime.toISOString(),
        duration,
        status: updated.status.toLowerCase() as AppointmentStatus,
        notes: updated.notes || undefined,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }
);

/**
 * Check for conflicts
 * POST /api/appointments/check-conflicts
 */
appointments.post(
  '/check-conflicts',
  requirePermission('appointment:list'),
  zValidator('json', checkConflictsSchema),
  async (c) => {
    const data = c.req.valid('json');

    const startTime = new Date(data.startTime);
    const endTime = new Date(startTime.getTime() + data.duration * 60 * 1000);

    const conflictCheck = await checkConflicts(
      data.practitionerId,
      startTime,
      endTime,
      data.roomId,
      data.patientId,
      data.excludeAppointmentId
    );

    return c.json({
      success: true,
      hasConflict: conflictCheck.hasConflict,
      conflicts: conflictCheck.conflicts,
    });
  }
);

// ===================
// Exports
// ===================

export { providerSchedules };

export default appointments;
