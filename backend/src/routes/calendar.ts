/**
 * Calendar API Routes
 *
 * Optimized endpoints for the admin calendar views (Day, Week, Month)
 * Designed for efficient queries with minimal N+1 issues
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware, requirePermission } from '../middleware/auth';
import {
  calendarDayQuerySchema,
  calendarWeekQuerySchema,
  calendarMonthQuerySchema,
  calendarResourcesQuerySchema,
  CalendarResponse,
  CalendarMonthResponse,
  CalendarResourcesResponse,
  CalendarAppointment,
  CalendarBreak,
  CalendarProvider,
  CalendarRoom,
  DaySummary,
} from '@medical-spa/validations';
import { APIError } from '../middleware/error';

const calendar = new Hono();

// All calendar routes require authentication
calendar.use('/*', authMiddleware);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a date string is valid
 */
function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Format date to YYYY-MM-DD string
 */
function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get start and end of day in ISO format
 */
function getDayBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * Group appointments by provider ID
 */
function groupByProvider(appointments: CalendarAppointment[]): Record<string, CalendarAppointment[]> {
  return appointments.reduce((acc, apt) => {
    if (!acc[apt.practitionerId]) {
      acc[apt.practitionerId] = [];
    }
    acc[apt.practitionerId].push(apt);
    return acc;
  }, {} as Record<string, CalendarAppointment[]>);
}

/**
 * Group appointments by room ID
 */
function groupByRoom(appointments: CalendarAppointment[]): Record<string, CalendarAppointment[]> {
  return appointments.reduce((acc, apt) => {
    if (apt.roomId) {
      if (!acc[apt.roomId]) {
        acc[apt.roomId] = [];
      }
      acc[apt.roomId].push(apt);
    }
    return acc;
  }, {} as Record<string, CalendarAppointment[]>);
}

/**
 * Calculate appointment counts by time slot (15-min intervals)
 * Returns a map of "HH:MM" -> count
 */
function countByTimeSlot(appointments: CalendarAppointment[]): Record<string, number> {
  const counts: Record<string, number> = {};

  appointments.forEach((apt) => {
    const start = new Date(apt.startTime);
    const end = new Date(apt.endTime);

    // Generate 15-minute slots that this appointment spans
    const current = new Date(start);
    while (current < end) {
      const slotKey = `${current.getHours().toString().padStart(2, '0')}:${current.getMinutes().toString().padStart(2, '0')}`;
      counts[slotKey] = (counts[slotKey] || 0) + 1;
      current.setMinutes(current.getMinutes() + 15);
    }
  });

  return counts;
}

/**
 * Calculate day summary from appointments
 */
function calculateDaySummary(appointments: CalendarAppointment[]): DaySummary {
  const summary: DaySummary = {
    total: appointments.length,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    arrived: 0,
    completed: 0,
  };

  appointments.forEach((apt) => {
    switch (apt.status) {
      case 'confirmed':
        summary.confirmed++;
        break;
      case 'scheduled':
        summary.pending++;
        break;
      case 'cancelled':
        summary.cancelled = (summary.cancelled || 0) + 1;
        break;
      case 'arrived':
      case 'in_progress':
        summary.arrived = (summary.arrived || 0) + 1;
        break;
      case 'completed':
        summary.completed = (summary.completed || 0) + 1;
        break;
      case 'no_show':
        // Count as pending for summary purposes
        summary.pending++;
        break;
    }
  });

  return summary;
}

// ============================================================================
// MOCK DATA SERVICE (Replace with database queries in production)
// ============================================================================

/**
 * Mock data for development/testing
 * In production, these would be database queries using Prisma/Drizzle
 */
class CalendarDataService {
  // Mock providers
  private static providers: CalendarProvider[] = [
    {
      id: 'prov-1',
      name: 'Dr. Sarah Mitchell',
      initials: 'SM',
      discipline: 'Aesthetics',
      status: 'active',
      schedule: {
        workDays: [1, 2, 3, 4, 5],
        startTime: '09:00',
        endTime: '17:00',
      },
    },
    {
      id: 'prov-2',
      name: 'Dr. James Wilson',
      initials: 'JW',
      discipline: 'Dermatology',
      status: 'active',
      schedule: {
        workDays: [1, 2, 3, 4, 5],
        startTime: '08:00',
        endTime: '16:00',
      },
    },
    {
      id: 'prov-3',
      name: 'Susan Lo',
      initials: 'SL',
      discipline: 'Aesthetics',
      status: 'active',
      schedule: {
        workDays: [2, 3, 4, 5, 6],
        startTime: '10:00',
        endTime: '19:00',
      },
    },
    {
      id: 'prov-4',
      name: 'Dr. Emily Chen',
      initials: 'EC',
      discipline: 'Massage Therapy',
      status: 'on_leave',
      schedule: {
        workDays: [1, 3, 5],
        startTime: '09:00',
        endTime: '17:00',
      },
    },
  ];

  // Mock rooms
  private static rooms: CalendarRoom[] = [
    { id: 'room-1', name: 'Treatment Room 1', locationId: 'loc-1', capacity: 1, isActive: true },
    { id: 'room-2', name: 'Treatment Room 2', locationId: 'loc-1', capacity: 1, isActive: true },
    { id: 'room-3', name: 'Consultation Room', locationId: 'loc-1', capacity: 2, isActive: true },
    { id: 'room-4', name: 'Laser Suite', locationId: 'loc-1', capacity: 1, isActive: true },
    { id: 'room-5', name: 'Massage Room', locationId: 'loc-1', capacity: 1, isActive: false },
  ];

  /**
   * Generate mock appointments for a date range
   */
  static generateMockAppointments(startDate: Date, endDate: Date, providerIds?: string[], roomIds?: string[]): CalendarAppointment[] {
    const appointments: CalendarAppointment[] = [];
    const current = new Date(startDate);

    // Sample patient names
    const patients = [
      { id: 'pat-1', name: 'Sarah Johnson' },
      { id: 'pat-2', name: 'Michael Chen' },
      { id: 'pat-3', name: 'Emily Davis' },
      { id: 'pat-4', name: 'Robert Williams' },
      { id: 'pat-5', name: 'Jennifer Brown' },
    ];

    // Sample services
    const services = [
      { name: 'Botox Consultation', category: 'aesthetics', duration: 30, color: '#8B5CF6' },
      { name: 'Dermal Fillers', category: 'aesthetics', duration: 45, color: '#EC4899' },
      { name: 'Laser Treatment', category: 'aesthetics', duration: 60, color: '#F59E0B' },
      { name: 'Deep Tissue Massage', category: 'massage', duration: 60, color: '#10B981' },
      { name: 'Facial Treatment', category: 'aesthetics', duration: 45, color: '#3B82F6' },
    ];

    const statuses: CalendarAppointment['status'][] = ['scheduled', 'confirmed', 'arrived', 'completed', 'cancelled'];

    let appointmentId = 1;

    while (current <= endDate) {
      // Skip weekends for mock data
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Generate 3-6 appointments per day
        const appointmentsPerDay = 3 + Math.floor(Math.random() * 4);

        for (let i = 0; i < appointmentsPerDay; i++) {
          const provider = this.providers[Math.floor(Math.random() * this.providers.length)];

          // Skip if provider filter is applied and doesn't match
          if (providerIds && providerIds.length > 0 && !providerIds.includes(provider.id)) {
            continue;
          }

          const patient = patients[Math.floor(Math.random() * patients.length)];
          const service = services[Math.floor(Math.random() * services.length)];
          const room = this.rooms.filter(r => r.isActive)[Math.floor(Math.random() * 4)];

          // Skip if room filter is applied and doesn't match
          if (roomIds && roomIds.length > 0 && room && !roomIds.includes(room.id)) {
            continue;
          }

          const hour = 9 + Math.floor(Math.random() * 8); // 9 AM to 4 PM
          const minute = Math.random() > 0.5 ? 0 : 30;

          const startTime = new Date(current);
          startTime.setHours(hour, minute, 0, 0);

          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + service.duration);

          // Determine status based on time
          const now = new Date();
          let status: CalendarAppointment['status'];
          if (startTime > now) {
            status = Math.random() > 0.3 ? 'confirmed' : 'scheduled';
          } else if (endTime < now) {
            status = Math.random() > 0.1 ? 'completed' : 'no_show';
          } else {
            status = 'in_progress';
          }

          // Occasionally add cancelled appointments
          if (Math.random() < 0.1) {
            status = 'cancelled';
          }

          const appointment: CalendarAppointment = {
            id: `apt-${appointmentId++}`,
            patientId: patient.id,
            patientName: patient.name,
            practitionerId: provider.id,
            practitionerName: provider.name,
            serviceName: service.name,
            serviceCategory: service.category,
            startTime,
            endTime,
            duration: service.duration,
            status,
            color: service.color,
            roomId: room?.id,
            roomName: room?.name,
            phone: '(555) 123-4567',
            noShowRisk: Math.random() > 0.7 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low',
            isNewPatient: Math.random() > 0.8,
          };

          // Add confirmation data for confirmed appointments
          if (status === 'confirmed') {
            appointment.confirmationSentAt = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);
            appointment.smsConfirmedAt = new Date(startTime.getTime() - 12 * 60 * 60 * 1000);
          }

          appointments.push(appointment);
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return appointments;
  }

  /**
   * Generate mock breaks for a date range
   */
  static generateMockBreaks(startDate: Date, endDate: Date, providerIds?: string[]): CalendarBreak[] {
    const breaks: CalendarBreak[] = [];
    const current = new Date(startDate);
    let breakId = 1;

    const breakTypes: CalendarBreak['type'][] = ['lunch', 'personal', 'meeting', 'training'];

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Each provider gets a lunch break
        this.providers.forEach((provider) => {
          if (providerIds && providerIds.length > 0 && !providerIds.includes(provider.id)) {
            return;
          }

          // Lunch break at noon
          const lunchStart = new Date(current);
          lunchStart.setHours(12, 0, 0, 0);

          const lunchEnd = new Date(current);
          lunchEnd.setHours(13, 0, 0, 0);

          breaks.push({
            id: `break-${breakId++}`,
            practitionerId: provider.id,
            practitionerName: provider.name,
            type: 'lunch',
            startTime: lunchStart,
            endTime: lunchEnd,
            duration: 60,
            isRecurring: true,
          });

          // Random chance of additional break
          if (Math.random() > 0.7) {
            const extraType = breakTypes[Math.floor(Math.random() * breakTypes.length)];
            const extraHour = Math.random() > 0.5 ? 10 : 15;

            const extraStart = new Date(current);
            extraStart.setHours(extraHour, 0, 0, 0);

            const extraEnd = new Date(current);
            extraEnd.setHours(extraHour, 30, 0, 0);

            breaks.push({
              id: `break-${breakId++}`,
              practitionerId: provider.id,
              practitionerName: provider.name,
              type: extraType,
              startTime: extraStart,
              endTime: extraEnd,
              duration: 30,
              notes: extraType === 'meeting' ? 'Staff meeting' : undefined,
              isRecurring: false,
            });
          }
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return breaks;
  }

  /**
   * Get providers (optionally filtered)
   */
  static getProviders(options?: { locationId?: string; includeInactive?: boolean }): CalendarProvider[] {
    let result = [...this.providers];

    if (!options?.includeInactive) {
      result = result.filter((p) => p.status === 'active');
    }

    return result;
  }

  /**
   * Get rooms (optionally filtered)
   */
  static getRooms(options?: { locationId?: string; includeInactive?: boolean }): CalendarRoom[] {
    let result = [...this.rooms];

    if (!options?.includeInactive) {
      result = result.filter((r) => r.isActive);
    }

    if (options?.locationId) {
      result = result.filter((r) => r.locationId === options.locationId);
    }

    return result;
  }
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/calendar/day
 *
 * Get all events for a single day
 * Optimized for Day View calendar display
 */
calendar.get(
  '/day',
  requirePermission('appointment:list'),
  zValidator('query', calendarDayQuerySchema),
  async (c) => {
    const params = c.req.valid('query');
    const { date, providerIds, roomIds, includeBreaks, includeCancelled, includeDeleted, locationId } = params;

    // Validate date
    const queryDate = new Date(date);
    if (isNaN(queryDate.getTime())) {
      throw APIError.badRequest('Invalid date format');
    }

    const { start, end } = getDayBounds(queryDate);

    // Fetch data (in production, these would be database queries)
    let appointments = CalendarDataService.generateMockAppointments(start, end, providerIds, roomIds);

    // Filter cancelled/deleted if not requested
    if (!includeCancelled) {
      appointments = appointments.filter((apt) => apt.status !== 'cancelled');
    }
    if (!includeDeleted) {
      appointments = appointments.filter((apt) => apt.status !== 'deleted');
    }

    // Get breaks if requested
    const breaks = includeBreaks
      ? CalendarDataService.generateMockBreaks(start, end, providerIds)
      : [];

    // Get providers and rooms
    const providers = CalendarDataService.getProviders({ locationId });
    const rooms = CalendarDataService.getRooms({ locationId });

    // Build optimized response
    const response: CalendarResponse = {
      appointments,
      breaks,
      blockedTimes: [],
      providers,
      rooms,
      dateRange: {
        start: formatDateKey(start),
        end: formatDateKey(end),
      },
      appointmentsByProvider: groupByProvider(appointments),
      appointmentsByRoom: groupByRoom(appointments),
      appointmentCountsByTimeSlot: countByTimeSlot(appointments),
    };

    return c.json(response);
  }
);

/**
 * GET /api/calendar/week
 *
 * Get all events for a week range
 * Optimized for Week View calendar display
 */
calendar.get(
  '/week',
  requirePermission('appointment:list'),
  zValidator('query', calendarWeekQuerySchema),
  async (c) => {
    const params = c.req.valid('query');
    const { startDate, endDate, providerIds, roomIds, includeBreaks, includeCancelled, locationId } = params;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw APIError.badRequest('Invalid date format');
    }

    // Validate date range (max 14 days for performance)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 14) {
      throw APIError.badRequest('Date range cannot exceed 14 days');
    }

    // Set time bounds
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Fetch data
    let appointments = CalendarDataService.generateMockAppointments(start, end, providerIds, roomIds);

    // Filter cancelled if not requested
    if (!includeCancelled) {
      appointments = appointments.filter((apt) => apt.status !== 'cancelled');
    }

    // Get breaks if requested
    const breaks = includeBreaks
      ? CalendarDataService.generateMockBreaks(start, end, providerIds)
      : [];

    // Get providers and rooms
    const providers = CalendarDataService.getProviders({ locationId });
    const rooms = CalendarDataService.getRooms({ locationId });

    // Build response
    const response: CalendarResponse = {
      appointments,
      breaks,
      blockedTimes: [],
      providers,
      rooms,
      dateRange: {
        start: formatDateKey(start),
        end: formatDateKey(end),
      },
      appointmentsByProvider: groupByProvider(appointments),
      appointmentsByRoom: groupByRoom(appointments),
      appointmentCountsByTimeSlot: countByTimeSlot(appointments),
    };

    return c.json(response);
  }
);

/**
 * GET /api/calendar/month
 *
 * Get event counts by day for month view
 * Returns summary data optimized for month calendar display
 */
calendar.get(
  '/month',
  requirePermission('appointment:list'),
  zValidator('query', calendarMonthQuerySchema),
  async (c) => {
    const params = c.req.valid('query');
    const { year, month, providerIds, roomIds, locationId } = params;

    // Validate year and month
    if (year < 2000 || year > 2100) {
      throw APIError.badRequest('Invalid year');
    }
    if (month < 1 || month > 12) {
      throw APIError.badRequest('Invalid month (must be 1-12)');
    }

    // Calculate month bounds
    const start = new Date(year, month - 1, 1); // month is 0-indexed
    const end = new Date(year, month, 0); // Last day of month
    end.setHours(23, 59, 59, 999);

    // Fetch appointments for the month
    const appointments = CalendarDataService.generateMockAppointments(start, end, providerIds, roomIds);

    // Group appointments by date and calculate summaries
    const days: Record<string, DaySummary> = {};
    let totalAppointments = 0;

    // Initialize all days of the month
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      days[dateKey] = {
        total: 0,
        confirmed: 0,
        pending: 0,
        cancelled: 0,
        arrived: 0,
        completed: 0,
      };
    }

    // Aggregate appointments by day
    appointments.forEach((apt) => {
      const aptDate = new Date(apt.startTime);
      const dateKey = formatDateKey(aptDate);

      if (days[dateKey]) {
        days[dateKey].total++;
        totalAppointments++;

        switch (apt.status) {
          case 'confirmed':
            days[dateKey].confirmed++;
            break;
          case 'scheduled':
            days[dateKey].pending++;
            break;
          case 'cancelled':
            days[dateKey].cancelled = (days[dateKey].cancelled || 0) + 1;
            break;
          case 'arrived':
          case 'in_progress':
            days[dateKey].arrived = (days[dateKey].arrived || 0) + 1;
            break;
          case 'completed':
            days[dateKey].completed = (days[dateKey].completed || 0) + 1;
            break;
          default:
            days[dateKey].pending++;
        }
      }
    });

    const response: CalendarMonthResponse = {
      year,
      month,
      days,
      totalAppointments,
    };

    return c.json(response);
  }
);

/**
 * GET /api/calendar/resources
 *
 * Get all resources (providers + rooms)
 * Used for populating calendar column headers and filters
 */
calendar.get(
  '/resources',
  requirePermission('appointment:list'),
  zValidator('query', calendarResourcesQuerySchema),
  async (c) => {
    const params = c.req.valid('query');
    const { locationId, includeInactive } = params;

    const providers = CalendarDataService.getProviders({
      locationId,
      includeInactive,
    });

    const rooms = CalendarDataService.getRooms({
      locationId,
      includeInactive,
    });

    const response: CalendarResourcesResponse = {
      providers,
      rooms,
    };

    return c.json(response);
  }
);

/**
 * GET /api/calendar/availability
 *
 * Get available time slots for a provider on a specific date
 * Used for appointment booking
 */
calendar.get(
  '/availability',
  requirePermission('appointment:list'),
  async (c) => {
    const { providerId, date, serviceId, locationId } = c.req.query();

    if (!providerId || !date) {
      throw APIError.badRequest('providerId and date are required');
    }

    // In production, this would query provider schedule, existing appointments,
    // and breaks to calculate available slots

    // Mock response
    const slots = [];
    const queryDate = new Date(date);

    // Generate 30-minute slots from 9 AM to 5 PM
    for (let hour = 9; hour < 17; hour++) {
      for (const minute of [0, 30]) {
        const slotTime = new Date(queryDate);
        slotTime.setHours(hour, minute, 0, 0);

        // Randomly mark some as unavailable for demo
        const available = Math.random() > 0.3;

        slots.push({
          startTime: slotTime.toISOString(),
          available,
          reason: available ? undefined : 'Booked',
        });
      }
    }

    return c.json({
      providerId,
      date: formatDateKey(queryDate),
      slots,
    });
  }
);

export default calendar;
