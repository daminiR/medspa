/**
 * Recurring Appointments API Routes
 *
 * Manages recurring appointment patterns using RRULE:
 * - Create recurring series
 * - Expand occurrences for calendar views
 * - Handle exceptions (skip, reschedule, modify single)
 * - Update series (this and future, all)
 * - End series early
 * - Conflict detection for all future occurrences
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { RRule, RRuleSet, Weekday, rrulestr } from 'rrule';
import { authMiddleware, requirePermission } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { handlePrismaError } from '../middleware/prisma-error-handler';
import { randomUUID } from 'crypto';

const recurring = new Hono();

// ===================
// Types
// ===================

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';
export type RecurringStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export type ExceptionType = 'skip' | 'reschedule' | 'modify';

export interface RecurringException {
  originalDate: string; // YYYY-MM-DD
  type: ExceptionType;

  // For reschedule
  newDate?: string; // YYYY-MM-DD
  newTime?: string; // HH:mm
  newProviderId?: string;

  // For modify
  modifiedFields?: {
    serviceId?: string;
    serviceName?: string;
    duration?: number;
    notes?: string;
  };

  reason?: string;
  createdAt: string;
  createdBy?: string;
}

export interface RecurringPattern {
  id: string;

  // Base appointment info
  patientId: string;
  patientName: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  duration: number; // minutes
  roomId?: string;
  locationId?: string;
  notes?: string;
  color?: string;

  // RRULE components
  frequency: RecurringFrequency;
  interval: number; // every N frequency units
  byDayOfWeek?: number[]; // 0=Sunday, 1=Monday, etc (for weekly/monthly)
  byDayOfMonth?: number; // 1-31 (for monthly by date)
  bySetPos?: number; // -1=last, 1=first, 2=second, etc (for monthly by week position)

  // Series bounds
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24-hour format)
  endDate?: string; // YYYY-MM-DD, null = no end
  occurrenceCount?: number; // or limit by count

  // Exceptions
  exceptions: RecurringException[];

  // Status
  status: RecurringStatus;

  // Generated
  rruleString: string; // Full RRULE for iCal export
  nextOccurrence?: string; // Next upcoming occurrence date

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ExpandedOccurrence {
  date: string; // YYYY-MM-DD
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  patternId: string;

  // Status of this occurrence
  status: 'scheduled' | 'modified' | 'rescheduled' | 'skipped' | 'completed' | 'cancelled';

  // Original or modified values
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  duration: number;
  patientId: string;
  patientName: string;
  roomId?: string;
  notes?: string;
  color?: string;

  // If this occurrence has an exception
  exception?: RecurringException;

  // Original date if rescheduled
  originalDate?: string;
}

export interface ConflictResult {
  date: string;
  type: 'provider' | 'room' | 'patient' | 'break' | 'outside_hours';
  message: string;
  appointmentId?: string;
}

// ===================
// Validation Schemas
// ===================

const uuidSchema = z.string().min(1);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD format');
const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm format');

const frequencySchema = z.enum(['daily', 'weekly', 'biweekly', 'monthly']);
const statusSchema = z.enum(['active', 'paused', 'completed', 'cancelled']);
const exceptionTypeSchema = z.enum(['skip', 'reschedule', 'modify']);

const idParamSchema = z.object({
  id: uuidSchema,
});

const dateParamSchema = z.object({
  id: uuidSchema,
  date: dateSchema,
});

const listRecurringSchema = z.object({
  patientId: uuidSchema.optional(),
  providerId: uuidSchema.optional(),
  status: statusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const createRecurringSchema = z.object({
  // Patient info
  patientId: uuidSchema,
  patientName: z.string().min(1),

  // Service info
  serviceId: uuidSchema,
  serviceName: z.string().min(1),

  // Provider info
  providerId: uuidSchema,
  providerName: z.string().min(1),

  // Scheduling
  duration: z.coerce.number().int().min(5).max(480),
  roomId: uuidSchema.optional(),
  locationId: uuidSchema.optional(),
  notes: z.string().max(5000).optional(),
  color: z.string().optional(),

  // Recurrence pattern
  frequency: frequencySchema,
  interval: z.coerce.number().int().min(1).max(12).default(1),
  byDayOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  byDayOfMonth: z.coerce.number().int().min(1).max(31).optional(),
  bySetPos: z.coerce.number().int().min(-5).max(5).optional(),

  // Series bounds
  startDate: dateSchema,
  startTime: timeSchema,
  endDate: dateSchema.optional(),
  occurrenceCount: z.coerce.number().int().min(1).max(365).optional(),

  // Options
  checkConflicts: z.boolean().default(true),
  maxConflictsToReturn: z.coerce.number().int().min(1).max(100).default(10),
});

const updateRecurringSchema = z.object({
  // What can be updated
  providerId: uuidSchema.optional(),
  providerName: z.string().min(1).optional(),
  serviceId: uuidSchema.optional(),
  serviceName: z.string().min(1).optional(),
  duration: z.coerce.number().int().min(5).max(480).optional(),
  roomId: uuidSchema.optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  color: z.string().optional(),
  startTime: timeSchema.optional(),

  // New end conditions
  endDate: dateSchema.optional().nullable(),
  occurrenceCount: z.coerce.number().int().min(1).max(365).optional().nullable(),

  // Status
  status: statusSchema.optional(),

  // Scope of update
  updateScope: z.enum(['all_future', 'all']).default('all_future'),
  fromDate: dateSchema.optional(), // Required if updateScope is 'all_future'
});

const occurrencesQuerySchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
  includeSkipped: z.coerce.boolean().default(false),
});

const modifyOccurrenceSchema = z.object({
  type: exceptionTypeSchema,

  // For reschedule
  newDate: dateSchema.optional(),
  newTime: timeSchema.optional(),
  newProviderId: uuidSchema.optional(),

  // For modify
  serviceId: uuidSchema.optional(),
  serviceName: z.string().min(1).optional(),
  duration: z.coerce.number().int().min(5).max(480).optional(),
  notes: z.string().max(5000).optional(),

  reason: z.string().max(500).optional(),
});

const endSeriesSchema = z.object({
  endDate: dateSchema,
  reason: z.string().max(500).optional(),
});

// ===================
// Mock Data for Conflict Checking
// ===================

// Mock appointments store for conflict checking
// In real implementation, would integrate with appointments module
const mockAppointmentsForConflicts: Array<{
  id: string;
  providerId: string;
  patientId: string;
  roomId?: string;
  startTime: Date;
  endTime: Date;
  status: string;
}> = [];

// Mock provider schedules for conflict checking
const providerSchedules: Array<{
  providerId: string;
  dayOfWeek: number;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}> = [
  // Provider 1 - Mon-Fri 9-5
  { providerId: 'prov-1', dayOfWeek: 1, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
  { providerId: 'prov-1', dayOfWeek: 2, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
  { providerId: 'prov-1', dayOfWeek: 3, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
  { providerId: 'prov-1', dayOfWeek: 4, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
  { providerId: 'prov-1', dayOfWeek: 5, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
  // Provider 2 - Mon, Wed, Fri 10-6
  { providerId: 'prov-2', dayOfWeek: 1, startHour: 10, startMinute: 0, endHour: 18, endMinute: 0 },
  { providerId: 'prov-2', dayOfWeek: 3, startHour: 10, startMinute: 0, endHour: 18, endMinute: 0 },
  { providerId: 'prov-2', dayOfWeek: 5, startHour: 10, startMinute: 0, endHour: 18, endMinute: 0 },
  // Provider 3 - Tue, Thu, Sat 8-4
  { providerId: 'prov-3', dayOfWeek: 2, startHour: 8, startMinute: 0, endHour: 16, endMinute: 0 },
  { providerId: 'prov-3', dayOfWeek: 4, startHour: 8, startMinute: 0, endHour: 16, endMinute: 0 },
  { providerId: 'prov-3', dayOfWeek: 6, startHour: 8, startMinute: 0, endHour: 16, endMinute: 0 },
];

// ===================
// Helper Functions
// ===================

function generateId(): string {
  return `rec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

/**
 * Convert day of week from our format (0=Sunday) to RRULE format
 * RRULE uses MO, TU, WE, TH, FR, SA, SU
 */
function dayOfWeekToRRule(dayOfWeek: number): Weekday {
  const days: Weekday[] = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA];
  return days[dayOfWeek];
}

/**
 * Convert RRULE weekday to our format (0=Sunday)
 */
function rruleDayToNumber(day: Weekday): number {
  const dayStr = day.toString();
  const mapping: Record<string, number> = {
    'SU': 0, 'MO': 1, 'TU': 2, 'WE': 3, 'TH': 4, 'FR': 5, 'SA': 6,
  };
  return mapping[dayStr] ?? 0;
}

/**
 * Generate RRULE from pattern configuration
 */
export function generateRRule(pattern: {
  frequency: RecurringFrequency;
  interval: number;
  startDate: string;
  startTime: string;
  endDate?: string;
  occurrenceCount?: number;
  byDayOfWeek?: number[];
  byDayOfMonth?: number;
  bySetPos?: number;
}): { rule: RRule; rruleString: string } {
  const [year, month, day] = pattern.startDate.split('-').map(Number);
  const [hour, minute] = pattern.startTime.split(':').map(Number);

  // Create start date in UTC to avoid timezone issues
  const dtstart = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  // Map frequency
  let freq: number;
  let interval = pattern.interval;

  switch (pattern.frequency) {
    case 'daily':
      freq = RRule.DAILY;
      break;
    case 'weekly':
      freq = RRule.WEEKLY;
      break;
    case 'biweekly':
      freq = RRule.WEEKLY;
      interval = 2;
      break;
    case 'monthly':
      freq = RRule.MONTHLY;
      break;
    default:
      freq = RRule.WEEKLY;
  }

  // Build options object - using explicit any to handle rrule library typing issues
  const options: Record<string, unknown> = {
    freq,
    interval,
    dtstart,
  };

  // Add end condition
  if (pattern.endDate) {
    const [endYear, endMonth, endDay] = pattern.endDate.split('-').map(Number);
    options.until = new Date(Date.UTC(endYear, endMonth - 1, endDay, 23, 59, 59));
  } else if (pattern.occurrenceCount) {
    options.count = pattern.occurrenceCount;
  }

  // Add day constraints for weekly
  if ((pattern.frequency === 'weekly' || pattern.frequency === 'biweekly') && pattern.byDayOfWeek?.length) {
    options.byweekday = pattern.byDayOfWeek.map(d => dayOfWeekToRRule(d));
  }

  // Add day constraints for monthly
  if (pattern.frequency === 'monthly') {
    if (pattern.byDayOfMonth) {
      options.bymonthday = [pattern.byDayOfMonth];
    } else if (pattern.byDayOfWeek?.length && pattern.bySetPos) {
      options.byweekday = pattern.byDayOfWeek.map(d => dayOfWeekToRRule(d));
      options.bysetpos = [pattern.bySetPos];
    }
  }

  const rule = new RRule(options as ConstructorParameters<typeof RRule>[0]);

  return {
    rule,
    rruleString: rule.toString(),
  };
}

/**
 * Expand occurrences for a date range
 */
export function expandOccurrences(
  pattern: RecurringPattern,
  startDate: Date,
  endDate: Date,
  includeSkipped: boolean = false
): ExpandedOccurrence[] {
  if (pattern.status === 'cancelled') {
    return [];
  }

  // Parse the RRULE
  const rule = rrulestr(pattern.rruleString);

  // Get all dates in range
  const dates = rule.between(startDate, endDate, true);

  const occurrences: ExpandedOccurrence[] = [];

  for (const date of dates) {
    // Format date as YYYY-MM-DD (handle UTC)
    const dateStr = date.toISOString().split('T')[0];

    // Check for exception on this date
    const exception = pattern.exceptions.find(e => e.originalDate === dateStr);

    // Skip if exception type is 'skip' and we don't want skipped
    if (exception?.type === 'skip' && !includeSkipped) {
      continue;
    }

    // Calculate times
    const [hour, minute] = pattern.startTime.split(':').map(Number);
    const startTime = new Date(date);
    startTime.setUTCHours(hour, minute, 0, 0);

    let duration = pattern.duration;
    let providerId = pattern.providerId;
    let providerName = pattern.providerName;
    let serviceId = pattern.serviceId;
    let serviceName = pattern.serviceName;
    let notes = pattern.notes;
    let occurrenceDate = dateStr;
    let originalDate: string | undefined;

    let status: ExpandedOccurrence['status'] = 'scheduled';

    // Apply exception modifications
    if (exception) {
      switch (exception.type) {
        case 'skip':
          status = 'skipped';
          break;
        case 'reschedule':
          status = 'rescheduled';
          originalDate = dateStr;
          if (exception.newDate) {
            occurrenceDate = exception.newDate;
            const [newYear, newMonth, newDay] = exception.newDate.split('-').map(Number);
            startTime.setUTCFullYear(newYear, newMonth - 1, newDay);
          }
          if (exception.newTime) {
            const [newHour, newMinute] = exception.newTime.split(':').map(Number);
            startTime.setUTCHours(newHour, newMinute, 0, 0);
          }
          if (exception.newProviderId) {
            providerId = exception.newProviderId;
            // In real app, would look up provider name
          }
          break;
        case 'modify':
          status = 'modified';
          if (exception.modifiedFields) {
            if (exception.modifiedFields.serviceId) {
              serviceId = exception.modifiedFields.serviceId;
            }
            if (exception.modifiedFields.serviceName) {
              serviceName = exception.modifiedFields.serviceName;
            }
            if (exception.modifiedFields.duration) {
              duration = exception.modifiedFields.duration;
            }
            if (exception.modifiedFields.notes !== undefined) {
              notes = exception.modifiedFields.notes;
            }
          }
          break;
      }
    }

    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    occurrences.push({
      date: occurrenceDate,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      patternId: pattern.id,
      status,
      providerId,
      providerName,
      serviceId,
      serviceName,
      duration,
      patientId: pattern.patientId,
      patientName: pattern.patientName,
      roomId: pattern.roomId,
      notes,
      color: pattern.color,
      exception,
      originalDate,
    });
  }

  return occurrences;
}

/**
 * Calculate next occurrence from today
 */
function calculateNextOccurrence(pattern: RecurringPattern): string | undefined {
  if (pattern.status !== 'active') {
    return undefined;
  }

  const now = new Date();
  const rule = rrulestr(pattern.rruleString);

  // Get next occurrence after now
  const next = rule.after(now);

  if (!next) {
    return undefined;
  }

  // Check if this date has a skip exception
  const dateStr = next.toISOString().split('T')[0];
  const exception = pattern.exceptions.find(e => e.originalDate === dateStr);

  if (exception?.type === 'skip') {
    // Try to find next non-skipped occurrence
    const futureDate = new Date(next.getTime() + 24 * 60 * 60 * 1000);
    const endSearch = new Date();
    endSearch.setFullYear(endSearch.getFullYear() + 1);

    const futureOccurrences = rule.between(futureDate, endSearch, true);
    for (const occ of futureOccurrences) {
      const occDateStr = occ.toISOString().split('T')[0];
      const occException = pattern.exceptions.find(e => e.originalDate === occDateStr);
      if (!occException || occException.type !== 'skip') {
        return occDateStr;
      }
    }
    return undefined;
  }

  return dateStr;
}

/**
 * Check for conflicts across all future occurrences
 */
export function checkSeriesConflicts(
  pattern: Partial<RecurringPattern> & {
    providerId: string;
    patientId: string;
    startDate: string;
    startTime: string;
    duration: number;
    roomId?: string;
    rruleString: string;
  },
  maxConflicts: number = 10,
  excludePatternId?: string
): ConflictResult[] {
  const conflicts: ConflictResult[] = [];

  // Parse the RRULE
  const rule = rrulestr(pattern.rruleString);

  // Get occurrences for the next year
  const startDate = new Date(pattern.startDate);
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + 1);

  const dates = rule.between(startDate, endDate, true);

  for (const date of dates) {
    if (conflicts.length >= maxConflicts) {
      break;
    }

    const dateStr = date.toISOString().split('T')[0];
    const [hour, minute] = pattern.startTime.split(':').map(Number);

    const startTime = new Date(date);
    startTime.setUTCHours(hour, minute, 0, 0);
    const endTime = new Date(startTime.getTime() + pattern.duration * 60 * 1000);

    // Check provider schedule
    const dayOfWeek = startTime.getUTCDay();
    const schedule = providerSchedules.find(
      s => s.providerId === pattern.providerId && s.dayOfWeek === dayOfWeek
    );

    if (!schedule) {
      conflicts.push({
        date: dateStr,
        type: 'outside_hours',
        message: `Provider is not scheduled to work on ${getDayName(dayOfWeek)}`,
      });
      continue;
    }

    // Check if within working hours
    const scheduleStart = schedule.startHour * 60 + schedule.startMinute;
    const scheduleEnd = schedule.endHour * 60 + schedule.endMinute;
    const appointmentStart = hour * 60 + minute;
    const appointmentEnd = appointmentStart + pattern.duration;

    if (appointmentStart < scheduleStart || appointmentEnd > scheduleEnd) {
      conflicts.push({
        date: dateStr,
        type: 'outside_hours',
        message: `Appointment is outside provider's working hours (${formatTime(schedule.startHour, schedule.startMinute)} - ${formatTime(schedule.endHour, schedule.endMinute)})`,
      });
      continue;
    }

    // Check against existing appointments
    for (const apt of mockAppointmentsForConflicts) {
      if (apt.status === 'cancelled') continue;

      // Provider conflict
      if (apt.providerId === pattern.providerId) {
        if (timesOverlap(startTime, endTime, apt.startTime, apt.endTime)) {
          conflicts.push({
            date: dateStr,
            type: 'provider',
            appointmentId: apt.id,
            message: `Provider already has an appointment at this time`,
          });
        }
      }

      // Patient conflict
      if (apt.patientId === pattern.patientId) {
        if (timesOverlap(startTime, endTime, apt.startTime, apt.endTime)) {
          conflicts.push({
            date: dateStr,
            type: 'patient',
            appointmentId: apt.id,
            message: `Patient already has an appointment at this time`,
          });
        }
      }

      // Room conflict
      if (pattern.roomId && apt.roomId === pattern.roomId) {
        if (timesOverlap(startTime, endTime, apt.startTime, apt.endTime)) {
          conflicts.push({
            date: dateStr,
            type: 'room',
            appointmentId: apt.id,
            message: `Room is already booked at this time`,
          });
        }
      }
    }
  }

  return conflicts;
}

function timesOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return start1 < end2 && start2 < end1;
}

function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// ===================
// Routes
// ===================

// All routes require authentication
recurring.use('/*', authMiddleware);

/**
 * List recurring patterns
 * GET /api/recurring
 */
recurring.get(
  '/',
  requirePermission('appointment:list'),
  zValidator('query', listRecurringSchema),
  async (c) => {
    try {
      const query = c.req.valid('query');

      // Build where clause
      const where: any = {};

      if (query.patientId) {
        where.patientId = query.patientId;
      }

      if (query.providerId) {
        where.providerId = query.providerId;
      }

      if (query.status) {
        where.status = query.status.toUpperCase();
      }

      // Get total count
      const total = await prisma.recurringPattern.count({ where });

      // Get paginated results
      const offset = (query.page - 1) * query.limit;
      const patterns = await prisma.recurringPattern.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: query.limit,
        include: {
          RecurringException: true,
        },
      });

      // Map Prisma results to RecurringPattern type and calculate next occurrence
      const items = patterns.map(pattern => {
        const exceptions: RecurringException[] = pattern.RecurringException.map(exc => ({
          originalDate: exc.originalDate,
          type: exc.type.toLowerCase() as ExceptionType,
          newDate: exc.newDate || undefined,
          newTime: exc.newTime || undefined,
          newProviderId: exc.newProviderId || undefined,
          modifiedFields: exc.modifiedFields as any,
          reason: exc.reason || undefined,
          createdAt: exc.createdAt.toISOString(),
          createdBy: exc.createdBy || undefined,
        }));

        const recurringPattern: RecurringPattern = {
          id: pattern.id,
          patientId: pattern.patientId,
          patientName: pattern.patientName,
          serviceId: pattern.serviceId,
          serviceName: pattern.serviceName,
          providerId: pattern.providerId,
          providerName: pattern.providerName,
          duration: pattern.duration,
          roomId: pattern.roomId || undefined,
          locationId: pattern.locationId || undefined,
          notes: pattern.notes || undefined,
          color: pattern.color || undefined,
          frequency: pattern.frequency.toLowerCase() as RecurringFrequency,
          interval: pattern.interval,
          byDayOfWeek: pattern.byDayOfWeek,
          byDayOfMonth: pattern.byDayOfMonth || undefined,
          bySetPos: pattern.bySetPos || undefined,
          startDate: pattern.startDate,
          startTime: pattern.startTime,
          endDate: pattern.endDate || undefined,
          occurrenceCount: pattern.occurrenceCount || undefined,
          exceptions,
          status: pattern.status.toLowerCase() as RecurringStatus,
          rruleString: pattern.rruleString,
          createdAt: pattern.createdAt.toISOString(),
          updatedAt: pattern.updatedAt.toISOString(),
          createdBy: pattern.createdBy,
        };

        recurringPattern.nextOccurrence = calculateNextOccurrence(recurringPattern);

        return {
          ...recurringPattern,
          nextOccurrence: calculateNextOccurrence(recurringPattern),
        };
      });

      return c.json({
        success: true,
        items,
        total,
        page: query.page,
        limit: query.limit,
        hasMore: offset + patterns.length < total,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
);

/**
 * Create recurring pattern
 * POST /api/recurring
 */
recurring.post(
  '/',
  requirePermission('appointment:create'),
  zValidator('json', createRecurringSchema),
  async (c) => {
    try {
      const data = c.req.valid('json');
      const user = c.get('user');
      const ipAddress = getClientIP(c);

      // Generate RRULE
      const { rule, rruleString } = generateRRule({
        frequency: data.frequency,
        interval: data.interval,
        startDate: data.startDate,
        startTime: data.startTime,
        endDate: data.endDate,
        occurrenceCount: data.occurrenceCount,
        byDayOfWeek: data.byDayOfWeek,
        byDayOfMonth: data.byDayOfMonth,
        bySetPos: data.bySetPos,
      });

      const id = generateId();

      // Create pattern in database
      const pattern = await prisma.recurringPattern.create({
        data: {
          id,
          patientId: data.patientId,
          patientName: data.patientName,
          serviceId: data.serviceId,
          serviceName: data.serviceName,
          providerId: data.providerId,
          providerName: data.providerName,
          duration: data.duration,
          roomId: data.roomId,
          locationId: data.locationId,
          notes: data.notes,
          color: data.color || '#8B5CF6',
          frequency: data.frequency.toUpperCase() as any,
          interval: data.interval,
          byDayOfWeek: data.byDayOfWeek || [],
          byDayOfMonth: data.byDayOfMonth,
          bySetPos: data.bySetPos,
          startDate: data.startDate,
          startTime: data.startTime,
          endDate: data.endDate,
          occurrenceCount: data.occurrenceCount,
          rruleString,
          status: 'ACTIVE',
          createdBy: user?.uid || 'system',
          updatedAt: new Date(),
        },
      });

      // Map to RecurringPattern type
      const recurringPattern: RecurringPattern = {
        id: pattern.id,
        patientId: pattern.patientId,
        patientName: pattern.patientName,
        serviceId: pattern.serviceId,
        serviceName: pattern.serviceName,
        providerId: pattern.providerId,
        providerName: pattern.providerName,
        duration: pattern.duration,
        roomId: pattern.roomId || undefined,
        locationId: pattern.locationId || undefined,
        notes: pattern.notes || undefined,
        color: pattern.color || undefined,
        frequency: pattern.frequency.toLowerCase() as RecurringFrequency,
        interval: pattern.interval,
        byDayOfWeek: pattern.byDayOfWeek,
        byDayOfMonth: pattern.byDayOfMonth || undefined,
        bySetPos: pattern.bySetPos || undefined,
        startDate: pattern.startDate,
        startTime: pattern.startTime,
        endDate: pattern.endDate || undefined,
        occurrenceCount: pattern.occurrenceCount || undefined,
        exceptions: [],
        status: pattern.status.toLowerCase() as RecurringStatus,
        rruleString: pattern.rruleString,
        createdAt: pattern.createdAt.toISOString(),
        updatedAt: pattern.updatedAt.toISOString(),
        createdBy: pattern.createdBy,
      };

      // Check for conflicts if requested
      let conflicts: ConflictResult[] = [];
      if (data.checkConflicts) {
        conflicts = checkSeriesConflicts(
          {
            providerId: recurringPattern.providerId,
            patientId: recurringPattern.patientId,
            startDate: recurringPattern.startDate,
            startTime: recurringPattern.startTime,
            duration: recurringPattern.duration,
            roomId: recurringPattern.roomId,
            rruleString: recurringPattern.rruleString,
          },
          data.maxConflictsToReturn
        );
      }

      // Calculate next occurrence
      recurringPattern.nextOccurrence = calculateNextOccurrence(recurringPattern);

      // Log audit event
      await logAuditEvent({
        userId: user?.uid,
        action: 'CREATE',
        resourceType: 'recurring_pattern',
        resourceId: id,
        patientId: data.patientId,
        phiAccessed: true,
        ipAddress,
        metadata: {
          frequency: data.frequency,
          providerId: data.providerId,
          serviceId: data.serviceId,
        },
      });

      return c.json({
        success: true,
        message: 'Recurring pattern created successfully',
        pattern: recurringPattern,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
        hasConflicts: conflicts.length > 0,
      }, 201);
    } catch (error) {
      handlePrismaError(error);
    }
  }
);

/**
 * Get recurring pattern by ID
 * GET /api/recurring/:id
 */
recurring.get(
  '/:id',
  requirePermission('appointment:read'),
  zValidator('param', idParamSchema),
  async (c) => {
    try {
      const { id } = c.req.valid('param');

      const pattern = await prisma.recurringPattern.findUnique({
        where: { id },
        include: {
          RecurringException: true,
        },
      });

      if (!pattern) {
        throw APIError.notFound('Recurring pattern');
      }

      // Map to RecurringPattern type
      const exceptions: RecurringException[] = pattern.RecurringException.map(exc => ({
        originalDate: exc.originalDate,
        type: exc.type.toLowerCase() as ExceptionType,
        newDate: exc.newDate || undefined,
        newTime: exc.newTime || undefined,
        newProviderId: exc.newProviderId || undefined,
        modifiedFields: exc.modifiedFields as any,
        reason: exc.reason || undefined,
        createdAt: exc.createdAt.toISOString(),
        createdBy: exc.createdBy || undefined,
      }));

      const recurringPattern: RecurringPattern = {
        id: pattern.id,
        patientId: pattern.patientId,
        patientName: pattern.patientName,
        serviceId: pattern.serviceId,
        serviceName: pattern.serviceName,
        providerId: pattern.providerId,
        providerName: pattern.providerName,
        duration: pattern.duration,
        roomId: pattern.roomId || undefined,
        locationId: pattern.locationId || undefined,
        notes: pattern.notes || undefined,
        color: pattern.color || undefined,
        frequency: pattern.frequency.toLowerCase() as RecurringFrequency,
        interval: pattern.interval,
        byDayOfWeek: pattern.byDayOfWeek,
        byDayOfMonth: pattern.byDayOfMonth || undefined,
        bySetPos: pattern.bySetPos || undefined,
        startDate: pattern.startDate,
        startTime: pattern.startTime,
        endDate: pattern.endDate || undefined,
        occurrenceCount: pattern.occurrenceCount || undefined,
        exceptions,
        status: pattern.status.toLowerCase() as RecurringStatus,
        rruleString: pattern.rruleString,
        createdAt: pattern.createdAt.toISOString(),
        updatedAt: pattern.updatedAt.toISOString(),
        createdBy: pattern.createdBy,
      };

      // Update next occurrence
      const nextOccurrence = calculateNextOccurrence(recurringPattern);

      return c.json({
        success: true,
        pattern: {
          ...recurringPattern,
          nextOccurrence,
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
);

/**
 * Update recurring pattern (all future occurrences)
 * PUT /api/recurring/:id
 */
recurring.put(
  '/:id',
  requirePermission('appointment:update'),
  zValidator('param', idParamSchema),
  zValidator('json', updateRecurringSchema),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const data = c.req.valid('json');
      const user = c.get('user');
      const ipAddress = getClientIP(c);

      const pattern = await prisma.recurringPattern.findUnique({
        where: { id },
        include: { RecurringException: true },
      });

      if (!pattern) {
        throw APIError.notFound('Recurring pattern');
      }

      if (pattern.status === 'CANCELLED') {
        throw APIError.badRequest('Cannot update cancelled recurring pattern');
      }

      // Build update data
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (data.providerId) updateData.providerId = data.providerId;
      if (data.providerName) updateData.providerName = data.providerName;
      if (data.serviceId) updateData.serviceId = data.serviceId;
      if (data.serviceName) updateData.serviceName = data.serviceName;
      if (data.duration) updateData.duration = data.duration;
      if (data.roomId !== undefined) updateData.roomId = data.roomId;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.color) updateData.color = data.color;
      if (data.status) updateData.status = data.status.toUpperCase();

      // Update time (regenerates RRULE)
      if (data.startTime) {
        updateData.startTime = data.startTime;
        const { rruleString } = generateRRule({
          frequency: pattern.frequency.toLowerCase() as RecurringFrequency,
          interval: pattern.interval,
          startDate: pattern.startDate,
          startTime: data.startTime,
          endDate: pattern.endDate || undefined,
          occurrenceCount: pattern.occurrenceCount || undefined,
          byDayOfWeek: pattern.byDayOfWeek,
          byDayOfMonth: pattern.byDayOfMonth || undefined,
          bySetPos: pattern.bySetPos || undefined,
        });
        updateData.rruleString = rruleString;
      }

      // Update end conditions
      if (data.endDate !== undefined) {
        updateData.endDate = data.endDate;
        updateData.occurrenceCount = null;

        const { rruleString } = generateRRule({
          frequency: pattern.frequency.toLowerCase() as RecurringFrequency,
          interval: pattern.interval,
          startDate: pattern.startDate,
          startTime: pattern.startTime,
          endDate: data.endDate || undefined,
          byDayOfWeek: pattern.byDayOfWeek,
          byDayOfMonth: pattern.byDayOfMonth || undefined,
          bySetPos: pattern.bySetPos || undefined,
        });
        updateData.rruleString = rruleString;
      }

      if (data.occurrenceCount !== undefined) {
        updateData.occurrenceCount = data.occurrenceCount;
        updateData.endDate = null;

        const { rruleString } = generateRRule({
          frequency: pattern.frequency.toLowerCase() as RecurringFrequency,
          interval: pattern.interval,
          startDate: pattern.startDate,
          startTime: pattern.startTime,
          occurrenceCount: data.occurrenceCount || undefined,
          byDayOfWeek: pattern.byDayOfWeek,
          byDayOfMonth: pattern.byDayOfMonth || undefined,
          bySetPos: pattern.bySetPos || undefined,
        });
        updateData.rruleString = rruleString;
      }

      // Update pattern
      const updatedPattern = await prisma.recurringPattern.update({
        where: { id },
        data: updateData,
        include: { RecurringException: true },
      });

      // Map to RecurringPattern type
      const exceptions: RecurringException[] = updatedPattern.RecurringException.map(exc => ({
        originalDate: exc.originalDate,
        type: exc.type.toLowerCase() as ExceptionType,
        newDate: exc.newDate || undefined,
        newTime: exc.newTime || undefined,
        newProviderId: exc.newProviderId || undefined,
        modifiedFields: exc.modifiedFields as any,
        reason: exc.reason || undefined,
        createdAt: exc.createdAt.toISOString(),
        createdBy: exc.createdBy || undefined,
      }));

      const recurringPattern: RecurringPattern = {
        id: updatedPattern.id,
        patientId: updatedPattern.patientId,
        patientName: updatedPattern.patientName,
        serviceId: updatedPattern.serviceId,
        serviceName: updatedPattern.serviceName,
        providerId: updatedPattern.providerId,
        providerName: updatedPattern.providerName,
        duration: updatedPattern.duration,
        roomId: updatedPattern.roomId || undefined,
        locationId: updatedPattern.locationId || undefined,
        notes: updatedPattern.notes || undefined,
        color: updatedPattern.color || undefined,
        frequency: updatedPattern.frequency.toLowerCase() as RecurringFrequency,
        interval: updatedPattern.interval,
        byDayOfWeek: updatedPattern.byDayOfWeek,
        byDayOfMonth: updatedPattern.byDayOfMonth || undefined,
        bySetPos: updatedPattern.bySetPos || undefined,
        startDate: updatedPattern.startDate,
        startTime: updatedPattern.startTime,
        endDate: updatedPattern.endDate || undefined,
        occurrenceCount: updatedPattern.occurrenceCount || undefined,
        exceptions,
        status: updatedPattern.status.toLowerCase() as RecurringStatus,
        rruleString: updatedPattern.rruleString,
        createdAt: updatedPattern.createdAt.toISOString(),
        updatedAt: updatedPattern.updatedAt.toISOString(),
        createdBy: updatedPattern.createdBy,
      };

      recurringPattern.nextOccurrence = calculateNextOccurrence(recurringPattern);

      // Log audit event
      await logAuditEvent({
        userId: user?.uid,
        action: 'UPDATE',
        resourceType: 'recurring_pattern',
        resourceId: id,
        patientId: recurringPattern.patientId,
        phiAccessed: true,
        ipAddress,
        metadata: { updatedFields: Object.keys(data), updateScope: data.updateScope },
      });

      return c.json({
        success: true,
        message: 'Recurring pattern updated successfully',
        pattern: recurringPattern,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
);

/**
 * Delete/cancel recurring pattern
 * DELETE /api/recurring/:id
 */
recurring.delete(
  '/:id',
  requirePermission('appointment:delete'),
  zValidator('param', idParamSchema),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const user = c.get('user');
      const ipAddress = getClientIP(c);

      const pattern = await prisma.recurringPattern.findUnique({
        where: { id },
        include: { RecurringException: true },
      });

      if (!pattern) {
        throw APIError.notFound('Recurring pattern');
      }

      // Mark as cancelled rather than deleting
      const updatedPattern = await prisma.recurringPattern.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date(),
        },
        include: { RecurringException: true },
      });

      // Map to RecurringPattern type
      const exceptions: RecurringException[] = updatedPattern.RecurringException.map(exc => ({
        originalDate: exc.originalDate,
        type: exc.type.toLowerCase() as ExceptionType,
        newDate: exc.newDate || undefined,
        newTime: exc.newTime || undefined,
        newProviderId: exc.newProviderId || undefined,
        modifiedFields: exc.modifiedFields as any,
        reason: exc.reason || undefined,
        createdAt: exc.createdAt.toISOString(),
        createdBy: exc.createdBy || undefined,
      }));

      const recurringPattern: RecurringPattern = {
        id: updatedPattern.id,
        patientId: updatedPattern.patientId,
        patientName: updatedPattern.patientName,
        serviceId: updatedPattern.serviceId,
        serviceName: updatedPattern.serviceName,
        providerId: updatedPattern.providerId,
        providerName: updatedPattern.providerName,
        duration: updatedPattern.duration,
        roomId: updatedPattern.roomId || undefined,
        locationId: updatedPattern.locationId || undefined,
        notes: updatedPattern.notes || undefined,
        color: updatedPattern.color || undefined,
        frequency: updatedPattern.frequency.toLowerCase() as RecurringFrequency,
        interval: updatedPattern.interval,
        byDayOfWeek: updatedPattern.byDayOfWeek,
        byDayOfMonth: updatedPattern.byDayOfMonth || undefined,
        bySetPos: updatedPattern.bySetPos || undefined,
        startDate: updatedPattern.startDate,
        startTime: updatedPattern.startTime,
        endDate: updatedPattern.endDate || undefined,
        occurrenceCount: updatedPattern.occurrenceCount || undefined,
        exceptions,
        status: updatedPattern.status.toLowerCase() as RecurringStatus,
        rruleString: updatedPattern.rruleString,
        createdAt: updatedPattern.createdAt.toISOString(),
        updatedAt: updatedPattern.updatedAt.toISOString(),
        createdBy: updatedPattern.createdBy,
      };

      // Log audit event
      await logAuditEvent({
        userId: user?.uid,
        action: 'DELETE',
        resourceType: 'recurring_pattern',
        resourceId: id,
        patientId: recurringPattern.patientId,
        phiAccessed: true,
        ipAddress,
      });

      return c.json({
        success: true,
        message: 'Recurring pattern cancelled successfully',
        pattern: recurringPattern,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
);

/**
 * Get expanded occurrences for date range
 * GET /api/recurring/:id/occurrences
 */
recurring.get(
  '/:id/occurrences',
  requirePermission('appointment:list'),
  zValidator('param', idParamSchema),
  zValidator('query', occurrencesQuerySchema),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const query = c.req.valid('query');

      const pattern = await prisma.recurringPattern.findUnique({
        where: { id },
        include: { RecurringException: true },
      });

      if (!pattern) {
        throw APIError.notFound('Recurring pattern');
      }

      // Map to RecurringPattern type
      const exceptions: RecurringException[] = pattern.RecurringException.map(exc => ({
        originalDate: exc.originalDate,
        type: exc.type.toLowerCase() as ExceptionType,
        newDate: exc.newDate || undefined,
        newTime: exc.newTime || undefined,
        newProviderId: exc.newProviderId || undefined,
        modifiedFields: exc.modifiedFields as any,
        reason: exc.reason || undefined,
        createdAt: exc.createdAt.toISOString(),
        createdBy: exc.createdBy || undefined,
      }));

      const recurringPattern: RecurringPattern = {
        id: pattern.id,
        patientId: pattern.patientId,
        patientName: pattern.patientName,
        serviceId: pattern.serviceId,
        serviceName: pattern.serviceName,
        providerId: pattern.providerId,
        providerName: pattern.providerName,
        duration: pattern.duration,
        roomId: pattern.roomId || undefined,
        locationId: pattern.locationId || undefined,
        notes: pattern.notes || undefined,
        color: pattern.color || undefined,
        frequency: pattern.frequency.toLowerCase() as RecurringFrequency,
        interval: pattern.interval,
        byDayOfWeek: pattern.byDayOfWeek,
        byDayOfMonth: pattern.byDayOfMonth || undefined,
        bySetPos: pattern.bySetPos || undefined,
        startDate: pattern.startDate,
        startTime: pattern.startTime,
        endDate: pattern.endDate || undefined,
        occurrenceCount: pattern.occurrenceCount || undefined,
        exceptions,
        status: pattern.status.toLowerCase() as RecurringStatus,
        rruleString: pattern.rruleString,
        createdAt: pattern.createdAt.toISOString(),
        updatedAt: pattern.updatedAt.toISOString(),
        createdBy: pattern.createdBy,
      };

      const startDate = new Date(query.startDate + 'T00:00:00Z');
      const endDate = new Date(query.endDate + 'T23:59:59Z');

      const occurrences = expandOccurrences(
        recurringPattern,
        startDate,
        endDate,
        query.includeSkipped
      );

      return c.json({
        success: true,
        patternId: id,
        startDate: query.startDate,
        endDate: query.endDate,
        occurrences,
        total: occurrences.length,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
);

/**
 * Modify single occurrence
 * PUT /api/recurring/:id/occurrences/:date
 */
recurring.put(
  '/:id/occurrences/:date',
  requirePermission('appointment:update'),
  zValidator('param', dateParamSchema),
  zValidator('json', modifyOccurrenceSchema),
  async (c) => {
    try {
      const { id, date } = c.req.valid('param');
      const data = c.req.valid('json');
      const user = c.get('user');
      const ipAddress = getClientIP(c);

      const pattern = await prisma.recurringPattern.findUnique({
        where: { id },
        include: { RecurringException: true },
      });

      if (!pattern) {
        throw APIError.notFound('Recurring pattern');
      }

      if (pattern.status === 'CANCELLED') {
        throw APIError.badRequest('Cannot modify occurrence of cancelled pattern');
      }

      // Verify this date is a valid occurrence
      const dateObj = new Date(date + 'T00:00:00Z');
      const endOfDay = new Date(date + 'T23:59:59Z');

      const rule = rrulestr(pattern.rruleString);
      const occurrences = rule.between(dateObj, endOfDay, true);

      if (occurrences.length === 0) {
        throw APIError.badRequest(`No occurrence exists on ${date}`);
      }

      // Remove any existing exception for this date
      await prisma.recurringException.deleteMany({
        where: {
          patternId: id,
          originalDate: date,
        },
      });

      // Create new exception
      const exceptionData: any = {
        id: randomUUID(),
        patternId: id,
        originalDate: date,
        type: data.type.toUpperCase(),
        reason: data.reason,
        createdBy: user?.uid,
      };

      if (data.type === 'reschedule') {
        if (data.newDate) exceptionData.newDate = data.newDate;
        if (data.newTime) exceptionData.newTime = data.newTime;
        if (data.newProviderId) exceptionData.newProviderId = data.newProviderId;
      }

      if (data.type === 'modify') {
        const modifiedFields: any = {};
        if (data.serviceId) modifiedFields.serviceId = data.serviceId;
        if (data.serviceName) modifiedFields.serviceName = data.serviceName;
        if (data.duration) modifiedFields.duration = data.duration;
        if (data.notes !== undefined) modifiedFields.notes = data.notes;
        exceptionData.modifiedFields = modifiedFields;
      }

      const exception = await prisma.recurringException.create({
        data: exceptionData,
      });

      // Update pattern timestamp
      const updatedPattern = await prisma.recurringPattern.update({
        where: { id },
        data: { updatedAt: new Date() },
        include: { RecurringException: true },
      });

      // Map exception to type
      const recurringException: RecurringException = {
        originalDate: exception.originalDate,
        type: exception.type.toLowerCase() as ExceptionType,
        newDate: exception.newDate || undefined,
        newTime: exception.newTime || undefined,
        newProviderId: exception.newProviderId || undefined,
        modifiedFields: exception.modifiedFields as any,
        reason: exception.reason || undefined,
        createdAt: exception.createdAt.toISOString(),
        createdBy: exception.createdBy || undefined,
      };

      // Map pattern to RecurringPattern type
      const exceptions: RecurringException[] = updatedPattern.RecurringException.map(exc => ({
        originalDate: exc.originalDate,
        type: exc.type.toLowerCase() as ExceptionType,
        newDate: exc.newDate || undefined,
        newTime: exc.newTime || undefined,
        newProviderId: exc.newProviderId || undefined,
        modifiedFields: exc.modifiedFields as any,
        reason: exc.reason || undefined,
        createdAt: exc.createdAt.toISOString(),
        createdBy: exc.createdBy || undefined,
      }));

      const recurringPattern: RecurringPattern = {
        id: updatedPattern.id,
        patientId: updatedPattern.patientId,
        patientName: updatedPattern.patientName,
        serviceId: updatedPattern.serviceId,
        serviceName: updatedPattern.serviceName,
        providerId: updatedPattern.providerId,
        providerName: updatedPattern.providerName,
        duration: updatedPattern.duration,
        roomId: updatedPattern.roomId || undefined,
        locationId: updatedPattern.locationId || undefined,
        notes: updatedPattern.notes || undefined,
        color: updatedPattern.color || undefined,
        frequency: updatedPattern.frequency.toLowerCase() as RecurringFrequency,
        interval: updatedPattern.interval,
        byDayOfWeek: updatedPattern.byDayOfWeek,
        byDayOfMonth: updatedPattern.byDayOfMonth || undefined,
        bySetPos: updatedPattern.bySetPos || undefined,
        startDate: updatedPattern.startDate,
        startTime: updatedPattern.startTime,
        endDate: updatedPattern.endDate || undefined,
        occurrenceCount: updatedPattern.occurrenceCount || undefined,
        exceptions,
        status: updatedPattern.status.toLowerCase() as RecurringStatus,
        rruleString: updatedPattern.rruleString,
        createdAt: updatedPattern.createdAt.toISOString(),
        updatedAt: updatedPattern.updatedAt.toISOString(),
        createdBy: updatedPattern.createdBy,
      };

      recurringPattern.nextOccurrence = calculateNextOccurrence(recurringPattern);

      // Log audit event
      await logAuditEvent({
        userId: user?.uid,
        action: 'UPDATE',
        resourceType: 'recurring_occurrence',
        resourceId: `${id}:${date}`,
        patientId: recurringPattern.patientId,
        phiAccessed: true,
        ipAddress,
        metadata: { exceptionType: data.type, originalDate: date },
      });

      return c.json({
        success: true,
        message: `Occurrence ${data.type === 'skip' ? 'skipped' : data.type === 'reschedule' ? 'rescheduled' : 'modified'} successfully`,
        exception: recurringException,
        pattern: recurringPattern,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
);

/**
 * Skip/cancel single occurrence
 * DELETE /api/recurring/:id/occurrences/:date
 */
recurring.delete(
  '/:id/occurrences/:date',
  requirePermission('appointment:delete'),
  zValidator('param', dateParamSchema),
  async (c) => {
    try {
      const { id, date } = c.req.valid('param');
      const user = c.get('user');
      const ipAddress = getClientIP(c);

      // Parse optional reason from body
      let reason: string | undefined;
      try {
        const body = await c.req.json();
        reason = body?.reason;
      } catch {
        // No body provided
      }

      const pattern = await prisma.recurringPattern.findUnique({
        where: { id },
        include: { RecurringException: true },
      });

      if (!pattern) {
        throw APIError.notFound('Recurring pattern');
      }

      if (pattern.status === 'CANCELLED') {
        throw APIError.badRequest('Cannot skip occurrence of cancelled pattern');
      }

      // Verify this date is a valid occurrence
      const dateObj = new Date(date + 'T00:00:00Z');
      const endOfDay = new Date(date + 'T23:59:59Z');

      const rule = rrulestr(pattern.rruleString);
      const occurrences = rule.between(dateObj, endOfDay, true);

      if (occurrences.length === 0) {
        throw APIError.badRequest(`No occurrence exists on ${date}`);
      }

      // Remove any existing exception for this date
      await prisma.recurringException.deleteMany({
        where: {
          patternId: id,
          originalDate: date,
        },
      });

      // Add skip exception
      const exception = await prisma.recurringException.create({
        data: {
          id: randomUUID(),
          patternId: id,
          originalDate: date,
          type: 'SKIP',
          reason,
          createdBy: user?.uid,
        },
      });

      // Update pattern timestamp
      const updatedPattern = await prisma.recurringPattern.update({
        where: { id },
        data: { updatedAt: new Date() },
        include: { RecurringException: true },
      });

      // Map exception to type
      const recurringException: RecurringException = {
        originalDate: exception.originalDate,
        type: exception.type.toLowerCase() as ExceptionType,
        reason: exception.reason || undefined,
        createdAt: exception.createdAt.toISOString(),
        createdBy: exception.createdBy || undefined,
      };

      // Map pattern to RecurringPattern type
      const exceptions: RecurringException[] = updatedPattern.RecurringException.map(exc => ({
        originalDate: exc.originalDate,
        type: exc.type.toLowerCase() as ExceptionType,
        newDate: exc.newDate || undefined,
        newTime: exc.newTime || undefined,
        newProviderId: exc.newProviderId || undefined,
        modifiedFields: exc.modifiedFields as any,
        reason: exc.reason || undefined,
        createdAt: exc.createdAt.toISOString(),
        createdBy: exc.createdBy || undefined,
      }));

      const recurringPattern: RecurringPattern = {
        id: updatedPattern.id,
        patientId: updatedPattern.patientId,
        patientName: updatedPattern.patientName,
        serviceId: updatedPattern.serviceId,
        serviceName: updatedPattern.serviceName,
        providerId: updatedPattern.providerId,
        providerName: updatedPattern.providerName,
        duration: updatedPattern.duration,
        roomId: updatedPattern.roomId || undefined,
        locationId: updatedPattern.locationId || undefined,
        notes: updatedPattern.notes || undefined,
        color: updatedPattern.color || undefined,
        frequency: updatedPattern.frequency.toLowerCase() as RecurringFrequency,
        interval: updatedPattern.interval,
        byDayOfWeek: updatedPattern.byDayOfWeek,
        byDayOfMonth: updatedPattern.byDayOfMonth || undefined,
        bySetPos: updatedPattern.bySetPos || undefined,
        startDate: updatedPattern.startDate,
        startTime: updatedPattern.startTime,
        endDate: updatedPattern.endDate || undefined,
        occurrenceCount: updatedPattern.occurrenceCount || undefined,
        exceptions,
        status: updatedPattern.status.toLowerCase() as RecurringStatus,
        rruleString: updatedPattern.rruleString,
        createdAt: updatedPattern.createdAt.toISOString(),
        updatedAt: updatedPattern.updatedAt.toISOString(),
        createdBy: updatedPattern.createdBy,
      };

      recurringPattern.nextOccurrence = calculateNextOccurrence(recurringPattern);

      // Log audit event
      await logAuditEvent({
        userId: user?.uid,
        action: 'DELETE',
        resourceType: 'recurring_occurrence',
        resourceId: `${id}:${date}`,
        patientId: recurringPattern.patientId,
        phiAccessed: true,
        ipAddress,
        metadata: { reason },
      });

      return c.json({
        success: true,
        message: 'Occurrence skipped successfully',
        exception: recurringException,
        pattern: recurringPattern,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
);

/**
 * End series early
 * POST /api/recurring/:id/end
 */
recurring.post(
  '/:id/end',
  requirePermission('appointment:update'),
  zValidator('param', idParamSchema),
  zValidator('json', endSeriesSchema),
  async (c) => {
    try {
      const { id } = c.req.valid('param');
      const data = c.req.valid('json');
      const user = c.get('user');
      const ipAddress = getClientIP(c);

      const pattern = await prisma.recurringPattern.findUnique({
        where: { id },
        include: { RecurringException: true },
      });

      if (!pattern) {
        throw APIError.notFound('Recurring pattern');
      }

      if (pattern.status === 'CANCELLED' || pattern.status === 'COMPLETED') {
        throw APIError.badRequest(`Cannot end ${pattern.status.toLowerCase()} pattern`);
      }

      // Regenerate RRULE with new end date
      const { rruleString } = generateRRule({
        frequency: pattern.frequency.toLowerCase() as RecurringFrequency,
        interval: pattern.interval,
        startDate: pattern.startDate,
        startTime: pattern.startTime,
        endDate: data.endDate,
        byDayOfWeek: pattern.byDayOfWeek,
        byDayOfMonth: pattern.byDayOfMonth || undefined,
        bySetPos: pattern.bySetPos || undefined,
      });

      // Update pattern
      const updatedPattern = await prisma.recurringPattern.update({
        where: { id },
        data: {
          endDate: data.endDate,
          occurrenceCount: null,
          rruleString,
          updatedAt: new Date(),
        },
        include: { RecurringException: true },
      });

      // Map to RecurringPattern type
      const exceptions: RecurringException[] = updatedPattern.RecurringException.map(exc => ({
        originalDate: exc.originalDate,
        type: exc.type.toLowerCase() as ExceptionType,
        newDate: exc.newDate || undefined,
        newTime: exc.newTime || undefined,
        newProviderId: exc.newProviderId || undefined,
        modifiedFields: exc.modifiedFields as any,
        reason: exc.reason || undefined,
        createdAt: exc.createdAt.toISOString(),
        createdBy: exc.createdBy || undefined,
      }));

      const recurringPattern: RecurringPattern = {
        id: updatedPattern.id,
        patientId: updatedPattern.patientId,
        patientName: updatedPattern.patientName,
        serviceId: updatedPattern.serviceId,
        serviceName: updatedPattern.serviceName,
        providerId: updatedPattern.providerId,
        providerName: updatedPattern.providerName,
        duration: updatedPattern.duration,
        roomId: updatedPattern.roomId || undefined,
        locationId: updatedPattern.locationId || undefined,
        notes: updatedPattern.notes || undefined,
        color: updatedPattern.color || undefined,
        frequency: updatedPattern.frequency.toLowerCase() as RecurringFrequency,
        interval: updatedPattern.interval,
        byDayOfWeek: updatedPattern.byDayOfWeek,
        byDayOfMonth: updatedPattern.byDayOfMonth || undefined,
        bySetPos: updatedPattern.bySetPos || undefined,
        startDate: updatedPattern.startDate,
        startTime: updatedPattern.startTime,
        endDate: updatedPattern.endDate || undefined,
        occurrenceCount: updatedPattern.occurrenceCount || undefined,
        exceptions,
        status: updatedPattern.status.toLowerCase() as RecurringStatus,
        rruleString: updatedPattern.rruleString,
        createdAt: updatedPattern.createdAt.toISOString(),
        updatedAt: updatedPattern.updatedAt.toISOString(),
        createdBy: updatedPattern.createdBy,
      };

      // Check if series is now complete
      const nextOcc = calculateNextOccurrence(recurringPattern);
      if (!nextOcc) {
        await prisma.recurringPattern.update({
          where: { id },
          data: { status: 'COMPLETED' },
        });
        recurringPattern.status = 'completed';
      }
      recurringPattern.nextOccurrence = nextOcc;

      // Log audit event
      await logAuditEvent({
        userId: user?.uid,
        action: 'UPDATE',
        resourceType: 'recurring_pattern',
        resourceId: id,
        patientId: recurringPattern.patientId,
        phiAccessed: true,
        ipAddress,
        metadata: { action: 'end_series', endDate: data.endDate, reason: data.reason },
      });

      return c.json({
        success: true,
        message: recurringPattern.status === 'completed'
          ? 'Series ended and marked as completed'
          : 'Series end date updated',
        pattern: recurringPattern,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
);

// ===================
// Exports for Testing
// ===================

export function addMockAppointmentForConflict(apt: {
  id: string;
  providerId: string;
  patientId: string;
  roomId?: string;
  startTime: Date;
  endTime: Date;
  status: string;
}) {
  mockAppointmentsForConflicts.push(apt);
}

export function clearMockAppointmentsForConflict() {
  mockAppointmentsForConflicts.length = 0;
}

export { providerSchedules };

export default recurring;
