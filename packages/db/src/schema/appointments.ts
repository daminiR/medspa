// Appointments Schema
import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { timestamps, auditColumns, appointmentStatusEnum } from './common';
import { users } from './users';
import { patients } from './patients';
import { services } from './services';
import { locations, rooms, resources } from './locations';

// Booking type enum
export const bookingTypeEnum = [
  'scheduled',
  'walk_in',
  'express_booking',
  'from_waitlist'
] as const;

// Waiting room status enum
export const waitingRoomStatusEnum = [
  'not_arrived',
  'in_car',
  'room_ready',
  'checked_in'
] as const;

// Main appointments table
export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  practitionerId: uuid('practitioner_id').notNull().references(() => users.id),
  serviceId: uuid('service_id').notNull().references(() => services.id),
  locationId: uuid('location_id').references(() => locations.id),
  roomId: uuid('room_id').references(() => rooms.id),

  // Timing
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  duration: integer('duration').notNull(), // minutes
  postTreatmentTime: integer('post_treatment_time').default(0),

  // Status
  status: varchar('status', { length: 20 }).default('scheduled').$type<typeof appointmentStatusEnum[number]>(),
  bookingType: varchar('booking_type', { length: 20 }).default('scheduled').$type<typeof bookingTypeEnum[number]>(),

  // Confirmation tracking
  confirmationSentAt: timestamp('confirmation_sent_at', { withTimezone: true }),
  reminderSentAt: timestamp('reminder_sent_at', { withTimezone: true }),
  smsConfirmedAt: timestamp('sms_confirmed_at', { withTimezone: true }),

  // Check-in tracking
  checkInTime: timestamp('check_in_time', { withTimezone: true }),
  arrivalTime: timestamp('arrival_time', { withTimezone: true }),

  // Virtual Waiting Room
  waitingRoomStatus: varchar('waiting_room_status', { length: 20 }).$type<typeof waitingRoomStatusEnum[number]>(),
  waitingRoomPriority: integer('waiting_room_priority').default(0),
  roomReadyNotifiedAt: timestamp('room_ready_notified_at', { withTimezone: true }),

  // Express booking
  expressBookingToken: varchar('express_booking_token', { length: 100 }).unique(),
  expressBookingStatus: varchar('express_booking_status', { length: 20 }),
  expressBookingExpiresAt: timestamp('express_booking_expires_at', { withTimezone: true }),
  expressBookingSentAt: timestamp('express_booking_sent_at', { withTimezone: true }),
  expressBookingCompletedAt: timestamp('express_booking_completed_at', { withTimezone: true }),

  // Deposit
  requireDeposit: boolean('require_deposit').default(false),
  depositAmount: decimal('deposit_amount', { precision: 10, scale: 2 }),
  depositPaid: boolean('deposit_paid').default(false),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  cardOnFileId: varchar('card_on_file_id', { length: 255 }),

  // Group booking
  groupBookingId: uuid('group_booking_id'),
  isGroupCoordinator: boolean('is_group_coordinator').default(false),
  groupPosition: integer('group_position'),
  individualPaymentStatus: varchar('individual_payment_status', { length: 20 }),

  // Risk tracking
  isNewPatient: boolean('is_new_patient').default(false),
  noShowRisk: varchar('no_show_risk', { length: 10 }).$type<'low' | 'medium' | 'high'>(),

  // Cancellation
  cancellationReason: text('cancellation_reason'),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancelledBy: uuid('cancelled_by'),

  // Soft delete
  deletedAt: timestamp('deleted_at', { withTimezone: true }),

  // Conflict override
  overriddenConflicts: boolean('overridden_conflicts').default(false),

  // Notes
  notes: text('notes'),
  internalNotes: text('internal_notes'),

  // Display
  color: varchar('color', { length: 7 }),

  ...auditColumns,
});

// Resource assignments for appointments
export const appointmentResources = pgTable('appointment_resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointmentId: uuid('appointment_id').notNull().references(() => appointments.id),
  resourceId: uuid('resource_id').notNull().references(() => resources.id),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  ...timestamps,
});

// Breaks (time blocks for practitioners)
export const breaks = pgTable('breaks', {
  id: uuid('id').primaryKey().defaultRandom(),
  practitionerId: uuid('practitioner_id').notNull().references(() => users.id),
  type: varchar('type', { length: 20 }).$type<'lunch' | 'personal' | 'meeting' | 'training' | 'out_of_office' | 'other'>(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  duration: integer('duration').notNull(),
  isRecurring: boolean('is_recurring').default(false),
  recurringDays: jsonb('recurring_days').$type<number[]>(),
  availableForEmergencies: boolean('available_for_emergencies').default(false),
  notes: text('notes'),
  ...auditColumns,
});

// Waitlist entries
export const waitlistEntries = pgTable('waitlist_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  serviceId: uuid('service_id').notNull().references(() => services.id),
  preferredPractitionerId: uuid('preferred_practitioner_id').references(() => users.id),
  locationId: uuid('location_id').references(() => locations.id),

  // Preferences
  preferredDates: jsonb('preferred_dates').$type<string[]>(), // ISO date strings
  preferredTimeRange: jsonb('preferred_time_range').$type<{
    start: string;
    end: string;
  }>(),
  preferredDays: jsonb('preferred_days').$type<number[]>(), // 0-6

  // Status
  status: varchar('status', { length: 20 }).default('active').$type<'active' | 'offered' | 'booked' | 'expired' | 'cancelled'>(),
  priority: integer('priority').default(0),

  // Offer tracking
  offerSentAt: timestamp('offer_sent_at', { withTimezone: true }),
  offerExpiresAt: timestamp('offer_expires_at', { withTimezone: true }),
  offeredAppointmentId: uuid('offered_appointment_id'),
  offerResponse: varchar('offer_response', { length: 20 }).$type<'pending' | 'accepted' | 'declined' | 'expired'>(),
  offerRespondedAt: timestamp('offer_responded_at', { withTimezone: true }),

  // Contact
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),

  // Metadata
  notes: text('notes'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),

  ...auditColumns,
});

// Group bookings
export const groupBookings = pgTable('group_bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  coordinatorPatientId: uuid('coordinator_patient_id').notNull().references(() => patients.id),
  locationId: uuid('location_id').references(() => locations.id),

  // Scheduling
  date: timestamp('date', { withTimezone: true }).notNull(),
  schedulingMode: varchar('scheduling_mode', { length: 20 }).$type<'simultaneous' | 'staggered_15' | 'staggered_30' | 'custom'>(),

  // Pricing
  discountPercent: decimal('discount_percent', { precision: 5, scale: 2 }).default('0'),
  totalOriginalPrice: decimal('total_original_price', { precision: 10, scale: 2 }),
  totalDiscountAmount: decimal('total_discount_amount', { precision: 10, scale: 2 }),
  totalDiscountedPrice: decimal('total_discounted_price', { precision: 10, scale: 2 }),

  // Payment
  paymentMode: varchar('payment_mode', { length: 20 }).$type<'individual' | 'coordinator' | 'split'>(),
  paymentStatus: varchar('payment_status', { length: 20 }).default('pending'),

  // Status
  status: varchar('status', { length: 20 }).default('pending').$type<'pending' | 'confirmed' | 'partially_confirmed' | 'cancelled'>(),

  // SMS tracking
  confirmationSentAt: timestamp('confirmation_sent_at', { withTimezone: true }),
  reminderSentAt: timestamp('reminder_sent_at', { withTimezone: true }),
  lastSmsType: varchar('last_sms_type', { length: 20 }),
  lastSmsSentAt: timestamp('last_sms_sent_at', { withTimezone: true }),

  // Notes
  notes: text('notes'),

  ...auditColumns,
});

// Group booking participants
export const groupBookingParticipants = pgTable('group_booking_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupBookingId: uuid('group_booking_id').notNull().references(() => groupBookings.id),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  serviceId: uuid('service_id').notNull().references(() => services.id),
  practitionerId: uuid('practitioner_id').notNull().references(() => users.id),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  roomId: uuid('room_id').references(() => rooms.id),

  // Timing
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  duration: integer('duration').notNull(),

  // Pricing
  servicePrice: decimal('service_price', { precision: 10, scale: 2 }).notNull(),

  // Status
  status: varchar('status', { length: 20 }).default('pending'),
  paymentStatus: varchar('payment_status', { length: 20 }).default('pending'),

  // SMS tracking
  confirmationSentAt: timestamp('confirmation_sent_at', { withTimezone: true }),
  reminderSentAt: timestamp('reminder_sent_at', { withTimezone: true }),
  smsConfirmedAt: timestamp('sms_confirmed_at', { withTimezone: true }),
  checkedInAt: timestamp('checked_in_at', { withTimezone: true }),

  ...timestamps,
});

// Group booking activity log
export const groupBookingActivities = pgTable('group_booking_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupBookingId: uuid('group_booking_id').notNull().references(() => groupBookings.id),
  type: varchar('type', { length: 50 }).notNull(),
  description: text('description').notNull(),
  performedBy: varchar('performed_by', { length: 255 }),
  performedAt: timestamp('performed_at', { withTimezone: true }).notNull().defaultNow(),
  metadata: jsonb('metadata'),
});

// Appointment history/changelog
export const appointmentHistory = pgTable('appointment_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  appointmentId: uuid('appointment_id').notNull().references(() => appointments.id),
  action: varchar('action', { length: 50 }).notNull(), // created, updated, cancelled, etc.
  previousStatus: varchar('previous_status', { length: 20 }),
  newStatus: varchar('new_status', { length: 20 }),
  changes: jsonb('changes').$type<Record<string, { old: unknown; new: unknown }>>(),
  changedBy: uuid('changed_by').references(() => users.id),
  changedAt: timestamp('changed_at', { withTimezone: true }).notNull().defaultNow(),
  reason: text('reason'),
});

// Relations
export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patients, {
    fields: [appointments.patientId],
    references: [patients.id],
  }),
  practitioner: one(users, {
    fields: [appointments.practitionerId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  location: one(locations, {
    fields: [appointments.locationId],
    references: [locations.id],
  }),
  room: one(rooms, {
    fields: [appointments.roomId],
    references: [rooms.id],
  }),
  resources: many(appointmentResources),
  history: many(appointmentHistory),
}));

export const breaksRelations = relations(breaks, ({ one }) => ({
  practitioner: one(users, {
    fields: [breaks.practitionerId],
    references: [users.id],
  }),
}));

export const waitlistEntriesRelations = relations(waitlistEntries, ({ one }) => ({
  patient: one(patients, {
    fields: [waitlistEntries.patientId],
    references: [patients.id],
  }),
  service: one(services, {
    fields: [waitlistEntries.serviceId],
    references: [services.id],
  }),
  preferredPractitioner: one(users, {
    fields: [waitlistEntries.preferredPractitionerId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [waitlistEntries.locationId],
    references: [locations.id],
  }),
}));

export const groupBookingsRelations = relations(groupBookings, ({ one, many }) => ({
  coordinator: one(patients, {
    fields: [groupBookings.coordinatorPatientId],
    references: [patients.id],
  }),
  location: one(locations, {
    fields: [groupBookings.locationId],
    references: [locations.id],
  }),
  participants: many(groupBookingParticipants),
  activities: many(groupBookingActivities),
}));

export const groupBookingParticipantsRelations = relations(groupBookingParticipants, ({ one }) => ({
  groupBooking: one(groupBookings, {
    fields: [groupBookingParticipants.groupBookingId],
    references: [groupBookings.id],
  }),
  patient: one(patients, {
    fields: [groupBookingParticipants.patientId],
    references: [patients.id],
  }),
  service: one(services, {
    fields: [groupBookingParticipants.serviceId],
    references: [services.id],
  }),
  practitioner: one(users, {
    fields: [groupBookingParticipants.practitionerId],
    references: [users.id],
  }),
  appointment: one(appointments, {
    fields: [groupBookingParticipants.appointmentId],
    references: [appointments.id],
  }),
}));
