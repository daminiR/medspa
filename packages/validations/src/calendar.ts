/**
 * Calendar validation schemas
 *
 * Schemas for calendar API endpoints optimized for admin views
 */

import { z } from 'zod';
import { uuidSchema, dateSchema, paginationSchema } from './common';
import { appointmentStatusSchema } from './appointment';

// ============================================================================
// CALENDAR DAY VIEW
// ============================================================================

/**
 * Query parameters for /api/calendar/day
 * Get all events for a single day
 */
export const calendarDayQuerySchema = z.object({
  // Required: the date to query (YYYY-MM-DD format parsed as date)
  date: dateSchema,

  // Optional: filter by specific providers (comma-separated)
  providerIds: z.string()
    .transform(val => val ? val.split(',').filter(Boolean) : undefined)
    .pipe(z.array(z.string()).optional())
    .optional(),

  // Optional: filter by specific rooms (comma-separated)
  roomIds: z.string()
    .transform(val => val ? val.split(',').filter(Boolean) : undefined)
    .pipe(z.array(z.string()).optional())
    .optional(),

  // Optional: include provider breaks (default: true)
  includeBreaks: z.string()
    .transform(val => val !== 'false')
    .default('true'),

  // Optional: include cancelled appointments (default: false)
  includeCancelled: z.string()
    .transform(val => val === 'true')
    .default('false'),

  // Optional: include deleted appointments (default: false)
  includeDeleted: z.string()
    .transform(val => val === 'true')
    .default('false'),

  // Optional: location filter
  locationId: z.string().optional(),
});

// ============================================================================
// CALENDAR WEEK VIEW
// ============================================================================

/**
 * Query parameters for /api/calendar/week
 * Get all events for a week range
 */
export const calendarWeekQuerySchema = z.object({
  // Required: start date of the week
  startDate: dateSchema,

  // Required: end date of the week
  endDate: dateSchema,

  // Optional: filter by specific providers (comma-separated)
  providerIds: z.string()
    .transform(val => val ? val.split(',').filter(Boolean) : undefined)
    .pipe(z.array(z.string()).optional())
    .optional(),

  // Optional: filter by specific rooms (comma-separated)
  roomIds: z.string()
    .transform(val => val ? val.split(',').filter(Boolean) : undefined)
    .pipe(z.array(z.string()).optional())
    .optional(),

  // Optional: include provider breaks (default: true)
  includeBreaks: z.string()
    .transform(val => val !== 'false')
    .default('true'),

  // Optional: include cancelled appointments (default: false)
  includeCancelled: z.string()
    .transform(val => val === 'true')
    .default('false'),

  // Optional: location filter
  locationId: z.string().optional(),
}).refine(
  data => data.endDate >= data.startDate,
  { message: 'endDate must be after or equal to startDate', path: ['endDate'] }
);

// ============================================================================
// CALENDAR MONTH VIEW
// ============================================================================

/**
 * Query parameters for /api/calendar/month
 * Get event counts by day for month view (summary mode)
 */
export const calendarMonthQuerySchema = z.object({
  // Required: year (e.g., 2024)
  year: z.coerce.number().int().min(2000).max(2100),

  // Required: month (1-12)
  month: z.coerce.number().int().min(1).max(12),

  // Optional: filter by specific providers (comma-separated)
  providerIds: z.string()
    .transform(val => val ? val.split(',').filter(Boolean) : undefined)
    .pipe(z.array(z.string()).optional())
    .optional(),

  // Optional: filter by specific rooms (comma-separated)
  roomIds: z.string()
    .transform(val => val ? val.split(',').filter(Boolean) : undefined)
    .pipe(z.array(z.string()).optional())
    .optional(),

  // Optional: location filter
  locationId: z.string().optional(),
});

// ============================================================================
// CALENDAR RESOURCES
// ============================================================================

/**
 * Query parameters for /api/calendar/resources
 * Get all available resources (providers + rooms)
 */
export const calendarResourcesQuerySchema = z.object({
  // Optional: location filter
  locationId: z.string().optional(),

  // Optional: include inactive resources (default: false)
  includeInactive: z.string()
    .transform(val => val === 'true')
    .default('false'),
});

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Appointment data for calendar display (optimized fields)
 */
export const calendarAppointmentSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  practitionerId: z.string(),
  practitionerName: z.string().optional(),
  serviceName: z.string(),
  serviceCategory: z.string(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  duration: z.number(),
  status: appointmentStatusSchema,
  color: z.string().optional(),
  roomId: z.string().optional(),
  roomName: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  postTreatmentTime: z.number().optional(),

  // Group booking info
  groupBookingId: z.string().optional(),
  isGroupCoordinator: z.boolean().optional(),
  groupPosition: z.number().optional(),

  // Confirmation status
  smsConfirmedAt: z.coerce.date().optional(),
  confirmationSentAt: z.coerce.date().optional(),
  noShowRisk: z.enum(['low', 'medium', 'high']).optional(),
  isNewPatient: z.boolean().optional(),
});

/**
 * Break data for calendar display
 */
export const calendarBreakSchema = z.object({
  id: z.string(),
  practitionerId: z.string(),
  practitionerName: z.string().optional(),
  type: z.enum(['lunch', 'personal', 'meeting', 'training', 'out_of_office', 'other']),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  duration: z.number(),
  notes: z.string().optional(),
  isRecurring: z.boolean().optional(),
});

/**
 * Blocked time slot data
 */
export const blockedTimeSchema = z.object({
  id: z.string(),
  practitionerId: z.string().optional(),
  roomId: z.string().optional(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  reason: z.string().optional(),
});

/**
 * Provider data for calendar
 */
export const calendarProviderSchema = z.object({
  id: z.string(),
  name: z.string(),
  initials: z.string(),
  discipline: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on_leave']),
  schedule: z.object({
    workDays: z.array(z.number()),
    startTime: z.string(),
    endTime: z.string(),
  }).optional(),
});

/**
 * Room data for calendar
 */
export const calendarRoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  locationId: z.string().optional(),
  capacity: z.number().optional(),
  isActive: z.boolean(),
});

/**
 * Calendar response for day/week views
 */
export const calendarResponseSchema = z.object({
  appointments: z.array(calendarAppointmentSchema),
  breaks: z.array(calendarBreakSchema),
  blockedTimes: z.array(blockedTimeSchema).optional(),
  providers: z.array(calendarProviderSchema),
  rooms: z.array(calendarRoomSchema),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }),

  // Grouped data for efficient rendering
  appointmentsByProvider: z.record(z.array(calendarAppointmentSchema)).optional(),
  appointmentsByRoom: z.record(z.array(calendarAppointmentSchema)).optional(),
  appointmentCountsByTimeSlot: z.record(z.number()).optional(),
});

/**
 * Day summary for month view
 */
export const daySummarySchema = z.object({
  total: z.number(),
  confirmed: z.number(),
  pending: z.number(),
  cancelled: z.number().optional(),
  arrived: z.number().optional(),
  completed: z.number().optional(),
});

/**
 * Month view response
 */
export const calendarMonthResponseSchema = z.object({
  year: z.number(),
  month: z.number(),
  days: z.record(daySummarySchema), // Key is date string "YYYY-MM-DD"
  totalAppointments: z.number(),
});

/**
 * Resources response
 */
export const calendarResourcesResponseSchema = z.object({
  providers: z.array(calendarProviderSchema),
  rooms: z.array(calendarRoomSchema),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CalendarDayQuery = z.infer<typeof calendarDayQuerySchema>;
export type CalendarWeekQuery = z.infer<typeof calendarWeekQuerySchema>;
export type CalendarMonthQuery = z.infer<typeof calendarMonthQuerySchema>;
export type CalendarResourcesQuery = z.infer<typeof calendarResourcesQuerySchema>;

export type CalendarAppointment = z.infer<typeof calendarAppointmentSchema>;
export type CalendarBreak = z.infer<typeof calendarBreakSchema>;
export type BlockedTime = z.infer<typeof blockedTimeSchema>;
export type CalendarProvider = z.infer<typeof calendarProviderSchema>;
export type CalendarRoom = z.infer<typeof calendarRoomSchema>;

export type CalendarResponse = z.infer<typeof calendarResponseSchema>;
export type DaySummary = z.infer<typeof daySummarySchema>;
export type CalendarMonthResponse = z.infer<typeof calendarMonthResponseSchema>;
export type CalendarResourcesResponse = z.infer<typeof calendarResourcesResponseSchema>;
