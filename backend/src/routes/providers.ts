/**
 * Provider API Routes
 *
 * Handles CRUD operations for medical spa providers/practitioners
 * Fully migrated to Prisma ORM
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { sessionAuthMiddleware, optionalSessionAuthMiddleware, requirePermission, requireRole } from '../middleware/auth';
import {
  createProviderSchema,
  updateProviderSchema,
  updateScheduleSchema,
  addScheduleExceptionSchema,
  providerSearchSchema,
  providerIdParamSchema,
  providerAvailabilitySchema,
  WeeklySchedule,
  DailySchedule,
  ScheduleException,
  z,
} from '@medical-spa/validations';
import { APIError } from '../middleware/error';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const providers = new Hono();

// =============================================================================
// Helper Functions
// =============================================================================

function getFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

async function buildProviderQuery(query: z.infer<typeof providerSearchSchema>) {
  const where: Prisma.UserWhereInput = {
    deletedAt: null,
  };

  // Text search
  if (query.query) {
    const searchTerm = query.query.toLowerCase();
    where.OR = [
      { firstName: { contains: searchTerm, mode: 'insensitive' } },
      { lastName: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } },
      { bio: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  // Filter by single status
  if (query.status) {
    where.status = query.status;
  }

  // Filter by multiple statuses
  if (query.statuses && query.statuses.length > 0) {
    where.status = { in: query.statuses };
  }

  // Filter by location
  if (query.locationId) {
    where.primaryLocationId = query.locationId;
  }

  // Filter by certification (search in JSON array)
  if (query.certification) {
    where.capabilities = {
      has: query.certification,
    };
  }

  // Filter by specialty (search in JSON array)
  if (query.specialty) {
    where.specializations = {
      has: query.specialty,
    };
  }

  return where;
}

async function getProviderScheduleForDate(providerId: string, date: Date): Promise<DailySchedule | null> {
  const dayOfWeek = date.getDay();
  const dateStr = date.toISOString().split('T')[0];

  // Get shifts for this provider on this day
  const shifts = await prisma.shift.findMany({
    where: {
      userId: providerId,
      OR: [
        {
          AND: [
            { isRecurring: true },
            { dayOfWeek }
          ]
        },
        {
          AND: [
            { isRecurring: false },
            { specificDate: { gte: new Date(dateStr), lt: new Date(new Date(dateStr).getTime() + 86400000) } }
          ]
        }
      ]
    },
    take: 1,
  });

  if (shifts.length === 0) {
    return null;
  }

  const shift = shifts[0];
  const breaks = shift.breakStart && shift.breakEnd
    ? [{ start: shift.breakStart, end: shift.breakEnd, type: 'lunch' as const }]
    : [];

  return {
    start: shift.startTime,
    end: shift.endTime,
    breaks,
  };
}

async function calculateAvailableSlots(
  providerId: string,
  date: Date,
  serviceDuration: number = 30
): Promise<Array<{ start: string; end: string }>> {
  const schedule = await getProviderScheduleForDate(providerId, date);
  if (!schedule) {
    return [];
  }

  const slots: Array<{ start: string; end: string }> = [];

  // Get start and end of day
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  // Get existing appointments for this provider on this date
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      practitionerId: providerId,
      startTime: { gte: dayStart },
      endTime: { lte: dayEnd },
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
    },
  });

  // Get provider for stagger setting
  const provider = await prisma.user.findUnique({
    where: { id: providerId },
    select: { staggerOnlineBooking: true },
  });

  // Parse schedule times
  const [startHour, startMin] = schedule.start.split(':').map(Number);
  const [endHour, endMin] = schedule.end.split(':').map(Number);

  // Generate all possible slots
  const slotInterval = provider?.staggerOnlineBooking || 15;
  let currentHour = startHour;
  let currentMin = startMin;

  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const slotStart = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

    // Calculate slot end time
    let endSlotMin = currentMin + serviceDuration;
    let endSlotHour = currentHour;
    while (endSlotMin >= 60) {
      endSlotMin -= 60;
      endSlotHour++;
    }
    const slotEnd = `${String(endSlotHour).padStart(2, '0')}:${String(endSlotMin).padStart(2, '0')}`;

    // Check if slot end is within working hours
    if (endSlotHour < endHour || (endSlotHour === endHour && endSlotMin <= endMin)) {
      // Check if slot conflicts with breaks
      const hasBreakConflict = schedule.breaks?.some(b => {
        return slotStart < b.end && slotEnd > b.start;
      });

      // Check if slot conflicts with existing appointments
      const hasAppointmentConflict = existingAppointments.some(apt => {
        const aptStartTime = apt.startTime.toTimeString().slice(0, 5);
        const aptEndTime = apt.endTime.toTimeString().slice(0, 5);
        return slotStart < aptEndTime && slotEnd > aptStartTime;
      });

      if (!hasBreakConflict && !hasAppointmentConflict) {
        slots.push({ start: slotStart, end: slotEnd });
      }
    }

    // Move to next slot
    currentMin += slotInterval;
    while (currentMin >= 60) {
      currentMin -= 60;
      currentHour++;
    }
  }

  return slots;
}

// =============================================================================
// Public Routes (No Auth Required)
// =============================================================================

/**
 * List all providers (public)
 * GET /api/providers
 */
providers.get('/', optionalSessionAuthMiddleware, zValidator('query', providerSearchSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');

  // For public access, only show active providers
  if (!user) {
    query.status = 'active';
  }

  // Build query conditions
  const where = await buildProviderQuery(query);

  // Handle service filter separately (requires join)
  let allResults;
  if (query.serviceId) {
    allResults = await prisma.user.findMany({
      where: {
        ...where,
        servicePractitioners: {
          some: {
            serviceId: query.serviceId,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        bio: true,
        profilePhoto: true,
        specializations: true,
        status: true,
      },
    });
  } else {
    allResults = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        bio: true,
        profilePhoto: true,
        specializations: true,
        status: true,
      },
    });
  }

  const total = allResults.length;

  // Pagination
  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;
  const paginatedResults = allResults.slice(offset, offset + limit);

  // Transform for public response (hide sensitive info)
  const publicResults = paginatedResults.map(p => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    fullName: getFullName(p.firstName, p.lastName),
    bio: p.bio,
    photoUrl: p.profilePhoto,
    specialties: p.specializations,
    // Only include email/phone/status for authenticated users
    ...(user ? { email: p.email, phone: p.phone, status: p.status } : {}),
  }));

  return c.json({
    items: publicResults,
    total,
    page,
    limit,
    hasMore: offset + limit < total,
  });
});

/**
 * Get single provider by ID (public)
 * GET /api/providers/:providerId
 */
providers.get('/:providerId', optionalSessionAuthMiddleware, zValidator('param', providerIdParamSchema), async (c) => {
  const { providerId } = c.req.valid('param');
  const user = c.get('user');

  const provider = await prisma.user.findUnique({
    where: { id: providerId, deletedAt: null },
  });

  if (!provider) {
    throw APIError.notFound('Provider');
  }

  // For public access, only show active providers
  if (!user && provider.status !== 'active') {
    throw APIError.notFound('Provider');
  }

  // Return full data for authenticated users, limited for public
  if (user) {
    return c.json({
      ...provider,
      fullName: getFullName(provider.firstName, provider.lastName),
    });
  }

  return c.json({
    id: provider.id,
    firstName: provider.firstName,
    lastName: provider.lastName,
    fullName: getFullName(provider.firstName, provider.lastName),
    bio: provider.bio,
    photoUrl: provider.profilePhoto,
    specialties: provider.specializations,
  });
});

/**
 * Get provider's services (public)
 * GET /api/providers/:providerId/services
 */
providers.get(
  '/:providerId/services',
  optionalSessionAuthMiddleware,
  zValidator('param', providerIdParamSchema),
  async (c) => {
    const { providerId } = c.req.valid('param');

    // Check if provider exists
    const provider = await prisma.user.findUnique({
      where: { id: providerId, deletedAt: null },
    });

    if (!provider) {
      throw APIError.notFound('Provider');
    }

    // Get services for this provider
    const servicePractitioners = await prisma.servicePractitioner.findMany({
      where: {
        practitionerId: providerId,
      },
      select: {
        serviceId: true,
      },
    });

    const serviceIds = servicePractitioners.map(sp => sp.serviceId);

    const services = await prisma.service.findMany({
      where: {
        id: { in: serviceIds },
        isActive: true,
      },
    });

    return c.json({
      providerId,
      items: services,
      total: services.length,
    });
  }
);

/**
 * Get provider's available slots (public - for booking)
 * GET /api/providers/:providerId/availability
 */
providers.get(
  '/:providerId/availability',
  optionalSessionAuthMiddleware,
  zValidator('param', providerIdParamSchema),
  zValidator('query', providerAvailabilitySchema),
  async (c) => {
    const { providerId } = c.req.valid('param');
    const query = c.req.valid('query');

    // Check if provider exists
    const provider = await prisma.user.findUnique({
      where: { id: providerId, deletedAt: null },
      select: { status: true },
    });

    if (!provider) {
      throw APIError.notFound('Provider');
    }

    if (provider.status !== 'active') {
      return c.json({
        providerId,
        date: query.date,
        slots: [],
        message: 'Provider is not currently available for booking',
      });
    }

    // Determine service duration
    let duration = query.duration || 30;
    if (query.serviceId) {
      const service = await prisma.service.findUnique({
        where: { id: query.serviceId },
        select: { duration: true, scheduledDuration: true },
      });

      if (service) {
        duration = service.scheduledDuration || service.duration;
      }
    }

    const date = new Date(query.date);
    const slots = await calculateAvailableSlots(providerId, date, duration);

    return c.json({
      providerId,
      date: query.date,
      serviceId: query.serviceId,
      duration,
      slots,
      total: slots.length,
    });
  }
);

// =============================================================================
// Staff Routes (Auth Required)
// =============================================================================

/**
 * Get provider's schedule
 * GET /api/providers/:providerId/schedule
 */
providers.get(
  '/:providerId/schedule',
  sessionAuthMiddleware,
  requirePermission('provider:read'),
  zValidator('param', providerIdParamSchema),
  async (c) => {
    const { providerId } = c.req.valid('param');

    const provider = await prisma.user.findUnique({
      where: { id: providerId, deletedAt: null },
      include: {
        shifts: {
          where: {
            isRecurring: true,
          },
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
      },
    });

    if (!provider) {
      throw APIError.notFound('Provider');
    }

    // Build weekly schedule from shifts
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    const weeklySchedule: WeeklySchedule = {
      sunday: null,
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: null,
      exceptions: [],
    };

    provider.shifts.forEach(shift => {
      if (shift.dayOfWeek !== null) {
        const dayName = dayNames[shift.dayOfWeek];
        weeklySchedule[dayName] = {
          start: shift.startTime,
          end: shift.endTime,
          breaks: shift.breakStart && shift.breakEnd
            ? [{ start: shift.breakStart, end: shift.breakEnd, type: 'lunch' as const }]
            : [],
        };
      }
    });

    return c.json({
      providerId,
      schedule: weeklySchedule,
    });
  }
);

// =============================================================================
// Admin Routes (Auth Required)
// =============================================================================

/**
 * Create a new provider
 * POST /api/providers
 */
providers.post(
  '/',
  sessionAuthMiddleware,
  requireRole('admin', 'owner'),
  zValidator('json', createProviderSchema),
  async (c) => {
    const data = c.req.valid('json');
    const currentUser = c.get('user');

    // Check for duplicate email
    const existingProvider = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingProvider && !existingProvider.deletedAt) {
      throw APIError.conflict('A provider with this email already exists');
    }

    // Create provider
    const provider = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        bio: data.bio,
        profilePhoto: data.photoUrl,
        specializations: data.specialties || [],
        capabilities: data.certifications || [],
        qualifications: [],
        languages: [],
        staggerOnlineBooking: data.staggerOnlineBooking,
        status: data.status || 'active',
        primaryLocationId: data.locationIds?.[0],
        role: 'aesthetician', // Default role, should be customizable
        createdBy: currentUser?.uid,
        lastModifiedBy: currentUser?.uid,
      },
    });

    // Create location assignments
    if (data.locationIds && data.locationIds.length > 0) {
      await prisma.userLocation.createMany({
        data: data.locationIds.map((locationId, index) => ({
          userId: provider.id,
          locationId,
          isPrimary: index === 0,
        })),
      });
    }

    // Create service assignments
    if (data.serviceIds && data.serviceIds.length > 0) {
      await prisma.servicePractitioner.createMany({
        data: data.serviceIds.map(serviceId => ({
          practitionerId: provider.id,
          serviceId,
        })),
      });
    }

    // Create shifts from schedule
    if (data.schedule) {
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
      const shiftsToCreate: Prisma.ShiftCreateManyInput[] = [];

      dayNames.forEach((day, index) => {
        const daySchedule = data.schedule![day];
        if (daySchedule) {
          shiftsToCreate.push({
            userId: provider.id,
            locationId: data.locationIds?.[0],
            dayOfWeek: index,
            startTime: daySchedule.start,
            endTime: daySchedule.end,
            breakStart: daySchedule.breaks?.[0]?.start,
            breakEnd: daySchedule.breaks?.[0]?.end,
            isRecurring: true,
            availableCapabilities: [],
            availableEquipment: [],
          });
        }
      });

      if (shiftsToCreate.length > 0) {
        await prisma.shift.createMany({
          data: shiftsToCreate,
        });
      }
    }

    return c.json({
      ...provider,
      fullName: getFullName(provider.firstName, provider.lastName),
    }, 201);
  }
);

/**
 * Update a provider
 * PUT /api/providers/:providerId
 */
providers.put(
  '/:providerId',
  sessionAuthMiddleware,
  requireRole('admin', 'owner'),
  zValidator('param', providerIdParamSchema),
  zValidator('json', updateProviderSchema),
  async (c) => {
    const { providerId } = c.req.valid('param');
    const data = c.req.valid('json');
    const currentUser = c.get('user');

    const existingProvider = await prisma.user.findUnique({
      where: { id: providerId, deletedAt: null },
    });

    if (!existingProvider) {
      throw APIError.notFound('Provider');
    }

    // Check for duplicate email if email is being changed
    if (data.email && data.email.toLowerCase() !== existingProvider.email.toLowerCase()) {
      const emailConflict = await prisma.user.findFirst({
        where: {
          email: data.email.toLowerCase(),
          id: { not: providerId },
          deletedAt: null,
        },
      });

      if (emailConflict) {
        throw APIError.conflict('A provider with this email already exists');
      }
    }

    // Update provider
    const updatedProvider = await prisma.user.update({
      where: { id: providerId },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.email && { email: data.email.toLowerCase() }),
        ...(data.phone && { phone: data.phone }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.photoUrl !== undefined && { profilePhoto: data.photoUrl }),
        ...(data.specialties && { specializations: data.specialties }),
        ...(data.certifications && { capabilities: data.certifications }),
        ...(data.staggerOnlineBooking !== undefined && { staggerOnlineBooking: data.staggerOnlineBooking }),
        ...(data.status && { status: data.status }),
        ...(data.locationIds?.[0] && { primaryLocationId: data.locationIds[0] }),
        lastModifiedBy: currentUser?.uid,
        updatedAt: new Date(),
      },
    });

    // Update location assignments if provided
    if (data.locationIds && data.locationIds.length > 0) {
      // Delete existing assignments
      await prisma.userLocation.deleteMany({
        where: { userId: providerId },
      });

      // Create new assignments
      await prisma.userLocation.createMany({
        data: data.locationIds.map((locationId, index) => ({
          userId: providerId,
          locationId,
          isPrimary: index === 0,
        })),
      });
    }

    // Update service assignments if provided
    if (data.serviceIds) {
      // Delete existing assignments
      await prisma.servicePractitioner.deleteMany({
        where: { practitionerId: providerId },
      });

      // Create new assignments
      if (data.serviceIds.length > 0) {
        await prisma.servicePractitioner.createMany({
          data: data.serviceIds.map(serviceId => ({
            practitionerId: providerId,
            serviceId,
          })),
        });
      }
    }

    return c.json({
      ...updatedProvider,
      fullName: getFullName(updatedProvider.firstName, updatedProvider.lastName),
    });
  }
);

/**
 * Update provider's schedule
 * PUT /api/providers/:providerId/schedule
 */
providers.put(
  '/:providerId/schedule',
  sessionAuthMiddleware,
  requireRole('admin', 'owner', 'manager'),
  zValidator('param', providerIdParamSchema),
  zValidator('json', updateScheduleSchema),
  async (c) => {
    const { providerId } = c.req.valid('param');
    const { schedule } = c.req.valid('json');

    const provider = await prisma.user.findUnique({
      where: { id: providerId, deletedAt: null },
    });

    if (!provider) {
      throw APIError.notFound('Provider');
    }

    // Delete existing recurring shifts
    await prisma.shift.deleteMany({
      where: {
        userId: providerId,
        isRecurring: true,
      },
    });

    // Create new shifts from schedule
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    const shiftsToCreate: Prisma.ShiftCreateManyInput[] = [];

    dayNames.forEach((day, index) => {
      const daySchedule = schedule[day];
      if (daySchedule) {
        shiftsToCreate.push({
          userId: providerId,
          locationId: provider.primaryLocationId,
          dayOfWeek: index,
          startTime: daySchedule.start,
          endTime: daySchedule.end,
          breakStart: daySchedule.breaks?.[0]?.start,
          breakEnd: daySchedule.breaks?.[0]?.end,
          isRecurring: true,
          availableCapabilities: [],
          availableEquipment: [],
        });
      }
    });

    if (shiftsToCreate.length > 0) {
      await prisma.shift.createMany({
        data: shiftsToCreate,
      });
    }

    // Update provider's updatedAt timestamp
    await prisma.user.update({
      where: { id: providerId },
      data: { updatedAt: new Date() },
    });

    return c.json({
      providerId,
      schedule,
      message: 'Schedule updated successfully',
    });
  }
);

/**
 * Add schedule exception (holiday, PTO, etc.)
 * POST /api/providers/:providerId/schedule/exceptions
 */
providers.post(
  '/:providerId/schedule/exceptions',
  sessionAuthMiddleware,
  requireRole('admin', 'owner', 'manager'),
  zValidator('param', providerIdParamSchema),
  zValidator('json', addScheduleExceptionSchema),
  async (c) => {
    const { providerId } = c.req.valid('param');
    const exception = c.req.valid('json');

    const provider = await prisma.user.findUnique({
      where: { id: providerId, deletedAt: null },
    });

    if (!provider) {
      throw APIError.notFound('Provider');
    }

    // Create time-off request or specific date shift based on exception type
    // If schedule is null, provider is completely off. Otherwise, modified hours.
    if (!exception.schedule) {
      // Provider is completely off on this date
      const timeOff = await prisma.timeOffRequest.create({
        data: {
          userId: providerId,
          type: exception.type === 'holiday' ? 'vacation' : exception.type === 'sick' ? 'sick' : 'personal',
          startDate: new Date(exception.date),
          endDate: new Date(exception.date),
          reason: exception.description,
          notes: exception.description,
          status: 'approved', // Auto-approve for exceptions
        },
      });

      return c.json({
        providerId,
        exception: {
          id: timeOff.id,
          ...exception,
        },
        message: 'Schedule exception added successfully',
      }, 201);
    } else {
      // Create a one-time shift override with modified hours
      const shift = await prisma.shift.create({
        data: {
          userId: providerId,
          locationId: provider.primaryLocationId,
          specificDate: new Date(exception.date),
          startTime: exception.schedule.start,
          endTime: exception.schedule.end,
          breakStart: exception.schedule.breaks?.[0]?.start,
          breakEnd: exception.schedule.breaks?.[0]?.end,
          isRecurring: false,
          availableCapabilities: [],
          availableEquipment: [],
        },
      });

      return c.json({
        providerId,
        exception: {
          id: shift.id,
          ...exception,
        },
        message: 'Schedule exception added successfully',
      }, 201);
    }
  }
);

/**
 * Deactivate a provider (soft delete)
 * DELETE /api/providers/:providerId
 */
providers.delete(
  '/:providerId',
  sessionAuthMiddleware,
  requireRole('admin', 'owner'),
  zValidator('param', providerIdParamSchema),
  async (c) => {
    const { providerId } = c.req.valid('param');
    const currentUser = c.get('user');

    const provider = await prisma.user.findUnique({
      where: { id: providerId, deletedAt: null },
    });

    if (!provider) {
      throw APIError.notFound('Provider');
    }

    // Soft delete - mark as inactive and set deletedAt
    await prisma.user.update({
      where: { id: providerId },
      data: {
        status: 'inactive',
        deletedAt: new Date(),
        deletedBy: currentUser?.uid,
        updatedAt: new Date(),
      },
    });

    return c.json({
      message: 'Provider deactivated',
      id: providerId,
    });
  }
);

export default providers;
