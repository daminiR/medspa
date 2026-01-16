/**
 * Appointment validation schemas
 */

import { z } from 'zod';
import { uuidSchema, dateSchema, paginationSchema, searchQuerySchema } from './common';

// Appointment status
export const appointmentStatusSchema = z.enum([
  'scheduled',
  'confirmed',
  'arrived',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
  'deleted',
]);

// Booking type
export const bookingTypeSchema = z.enum([
  'scheduled',
  'walk_in',
  'express_booking',
  'from_waitlist',
]);

// Waiting room status
export const waitingRoomStatusSchema = z.enum([
  'not_arrived',
  'in_car',
  'room_ready',
  'checked_in',
]);

// No-show risk level
export const noShowRiskSchema = z.enum(['low', 'medium', 'high']);

// Create appointment input
export const createAppointmentSchema = z.object({
  patientId: uuidSchema,
  practitionerId: uuidSchema,
  serviceId: uuidSchema,
  locationId: uuidSchema.optional(),
  roomId: uuidSchema.optional(),

  // Timing
  startTime: dateSchema,
  duration: z.coerce.number().int().min(5).max(480), // 5 mins to 8 hours

  // Type
  bookingType: bookingTypeSchema.default('scheduled'),

  // Deposit
  requireDeposit: z.boolean().optional(),
  depositAmount: z.coerce.number().min(0).optional(),

  // Group booking
  groupBookingId: uuidSchema.optional(),
  isGroupCoordinator: z.boolean().optional(),

  // Notes
  notes: z.string().max(5000).optional(),
  internalNotes: z.string().max(5000).optional(),

  // Conflict override
  overriddenConflicts: z.boolean().optional(),
});

// Update appointment input
export const updateAppointmentSchema = createAppointmentSchema.partial().extend({
  status: appointmentStatusSchema.optional(),
  cancellationReason: z.string().max(500).optional(),
});

// Reschedule appointment input
export const rescheduleAppointmentSchema = z.object({
  startTime: dateSchema,
  practitionerId: uuidSchema.optional(),
  roomId: uuidSchema.optional(),
  notes: z.string().max(500).optional(),
});

// Cancel appointment input
export const cancelAppointmentSchema = z.object({
  reason: z.string().max(500),
  notifyPatient: z.boolean().default(true),
  chargeNoShowFee: z.boolean().default(false),
});

// Check-in input
export const checkInAppointmentSchema = z.object({
  status: z.enum(['arrived', 'in_car', 'checked_in']).default('arrived'),
});

// Appointment search/filter
export const appointmentSearchSchema = z.object({
  query: searchQuerySchema,
  patientId: uuidSchema.optional(),
  practitionerId: uuidSchema.optional(),
  serviceId: uuidSchema.optional(),
  locationId: uuidSchema.optional(),
  status: appointmentStatusSchema.optional(),
  statuses: z.array(appointmentStatusSchema).optional(),
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
  bookingType: bookingTypeSchema.optional(),
  ...paginationSchema.shape,
});

// Calendar view params
export const calendarViewSchema = z.object({
  date: dateSchema,
  view: z.enum(['day', 'week', 'month']).default('day'),
  practitionerIds: z.array(uuidSchema).optional(),
  locationId: uuidSchema.optional(),
  includeBreaks: z.boolean().default(true),
  includeCancelled: z.boolean().default(false),
});

// Availability check
export const availabilityCheckSchema = z.object({
  practitionerId: uuidSchema,
  serviceId: uuidSchema,
  date: dateSchema,
  locationId: uuidSchema.optional(),
});

// Express booking create
export const expressBookingCreateSchema = z.object({
  patientPhone: z.string(),
  serviceId: uuidSchema,
  practitionerId: uuidSchema.optional(),
  preferredDate: dateSchema.optional(),
  preferredTimeRange: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
  notes: z.string().max(500).optional(),
  expiresInHours: z.coerce.number().min(1).max(72).default(24),
});

// Appointment ID param
export const appointmentIdParamSchema = z.object({
  appointmentId: uuidSchema,
});

// Type exports
export type AppointmentStatus = z.infer<typeof appointmentStatusSchema>;
export type BookingType = z.infer<typeof bookingTypeSchema>;
export type WaitingRoomStatus = z.infer<typeof waitingRoomStatusSchema>;
export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type AppointmentSearch = z.infer<typeof appointmentSearchSchema>;
export type CalendarViewParams = z.infer<typeof calendarViewSchema>;
