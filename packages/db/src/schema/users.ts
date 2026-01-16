// Users, Staff, and Practitioners Schema
import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { timestamps, auditColumns } from './common';
import { locations } from './locations';

// User roles enum
export const userRoleEnum = [
  'admin',
  'medical_director',
  'physician',
  'nurse_practitioner',
  'registered_nurse',
  'aesthetician',
  'laser_technician',
  'injection_specialist',
  'front_desk',
  'office_manager',
  'billing_specialist',
  'marketing_coordinator',
  'patient_coordinator',
  'patient'
] as const;

export const accessLevelEnum = [
  'no_access',
  'practitioner_limited',
  'practitioner_front_desk',
  'practitioner_front_desk_all_locations',
  'front_desk_only',
  'administrative_billing',
  'full_access',
  'account_owner'
] as const;

export const userStatusEnum = ['active', 'inactive', 'on_leave', 'terminated'] as const;

// Main users table (staff and practitioners)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  firebaseUid: varchar('firebase_uid', { length: 255 }).unique(),
  employeeId: varchar('employee_id', { length: 50 }).unique(),

  // Personal info
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 50 }),
  alternatePhone: varchar('alternate_phone', { length: 50 }),
  profilePhoto: text('profile_photo'),
  pronouns: varchar('pronouns', { length: 50 }),
  birthDate: timestamp('birth_date', { withTimezone: true }),

  // Role & Access
  role: varchar('role', { length: 50 }).notNull().$type<typeof userRoleEnum[number]>(),
  accessLevel: varchar('access_level', { length: 50 }).$type<typeof accessLevelEnum[number]>(),
  status: varchar('status', { length: 20 }).default('active').$type<typeof userStatusEnum[number]>(),

  // Location assignments
  primaryLocationId: uuid('primary_location_id').references(() => locations.id),

  // Professional info
  specializations: jsonb('specializations').$type<string[]>(),
  certifications: jsonb('certifications').$type<{
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    certificationNumber: string;
  }[]>(),
  licenses: jsonb('licenses').$type<{
    id: string;
    type: string;
    number: string;
    state: string;
    expiryDate: string;
    status: 'active' | 'expired' | 'pending_renewal';
  }[]>(),

  // Medical identifiers
  npiNumber: varchar('npi_number', { length: 50 }),
  deaNumber: varchar('dea_number', { length: 50 }),

  // Employment
  hireDate: timestamp('hire_date', { withTimezone: true }),
  terminationDate: timestamp('termination_date', { withTimezone: true }),

  // Address
  address: jsonb('address').$type<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  }>(),

  // Emergency contact
  emergencyContact: jsonb('emergency_contact').$type<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>(),

  // Compensation
  hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),
  salary: decimal('salary', { precision: 12, scale: 2 }),
  commissionRates: jsonb('commission_rates').$type<{
    serviceCategory: string;
    rate: number;
    type: 'percentage' | 'fixed';
  }[]>(),

  // Bio & qualifications
  bio: text('bio'),
  qualifications: jsonb('qualifications').$type<string[]>(),
  languages: jsonb('languages').$type<string[]>(),

  // Capabilities (for service matching)
  capabilities: jsonb('capabilities').$type<string[]>(),
  experienceLevels: jsonb('experience_levels').$type<{ [service: string]: 'beginner' | 'intermediate' | 'advanced' | 'expert' }>(),

  // Management hierarchy
  reportsTo: uuid('reports_to'),

  // Practitioner-specific settings
  staggerOnlineBooking: integer('stagger_online_booking'), // minutes
  defaultSchedule: jsonb('default_schedule').$type<{
    workDays: number[];
    startTime: string;
    endTime: string;
  }>(),

  // MFA & Security
  mfaEnabled: boolean('mfa_enabled').default(false),
  mfaSecret: text('mfa_secret'), // Encrypted TOTP secret
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  lastPasswordChange: timestamp('last_password_change', { withTimezone: true }),

  // Metadata
  onboardingCompleted: boolean('onboarding_completed').default(false),
  lastTrainingDate: timestamp('last_training_date', { withTimezone: true }),
  nextReviewDate: timestamp('next_review_date', { withTimezone: true }),
  notes: text('notes'),

  ...auditColumns,
});

// User location assignments (many-to-many)
export const userLocations = pgTable('user_locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  locationId: uuid('location_id').notNull().references(() => locations.id),
  isPrimary: boolean('is_primary').default(false),
  ...timestamps,
});

// Shifts / Schedules
export const shifts = pgTable('shifts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  locationId: uuid('location_id').notNull().references(() => locations.id),
  roomId: uuid('room_id'),

  // Schedule
  dayOfWeek: integer('day_of_week'), // 0-6, null if specific date
  specificDate: timestamp('specific_date', { withTimezone: true }), // for one-off shifts
  startTime: varchar('start_time', { length: 10 }).notNull(), // HH:MM format
  endTime: varchar('end_time', { length: 10 }).notNull(),
  breakStart: varchar('break_start', { length: 10 }),
  breakEnd: varchar('break_end', { length: 10 }),

  // Type
  isRecurring: boolean('is_recurring').default(true),

  // Capabilities available during this shift
  availableCapabilities: jsonb('available_capabilities').$type<string[]>(),
  availableEquipment: jsonb('available_equipment').$type<string[]>(),

  ...timestamps,
});

// Time off requests
export const timeOffRequests = pgTable('time_off_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: varchar('type', { length: 50 }).$type<'vacation' | 'sick' | 'personal' | 'training'>(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  status: varchar('status', { length: 20 }).default('pending').$type<'pending' | 'approved' | 'denied'>(),
  reason: text('reason'),
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  notes: text('notes'),
  ...timestamps,
});

// User sessions (for session management / security)
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  token: varchar('token', { length: 500 }).notNull(),
  deviceInfo: jsonb('device_info').$type<{
    userAgent: string;
    ip: string;
    deviceType?: string;
  }>(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  lastActivityAt: timestamp('last_activity_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Passkey credentials (WebAuthn)
export const passkeyCredentials = pgTable('passkey_credentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  credentialId: text('credential_id').notNull().unique(),
  publicKey: text('public_key').notNull(),
  counter: integer('counter').notNull().default(0),
  deviceName: varchar('device_name', { length: 255 }),
  transports: jsonb('transports').$type<string[]>(),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  ...timestamps,
});

// Staff PINs for quick re-authentication (screen lock)
// Based on Mangomint/Zenoti patterns - 4-6 digit PIN for screen lock resume
export const staffPins = pgTable('staff_pins', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  pinHash: varchar('pin_hash', { length: 255 }).notNull(), // bcrypt hashed
  failedAttempts: integer('failed_attempts').notNull().default(0),
  lockedUntil: timestamp('locked_until', { withTimezone: true }),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  ...timestamps,
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  primaryLocation: one(locations, {
    fields: [users.primaryLocationId],
    references: [locations.id],
  }),
  manager: one(users, {
    fields: [users.reportsTo],
    references: [users.id],
  }),
  locations: many(userLocations),
  shifts: many(shifts),
  timeOffRequests: many(timeOffRequests),
  sessions: many(sessions),
  passkeyCredentials: many(passkeyCredentials),
  staffPin: one(staffPins),
}));

export const staffPinsRelations = relations(staffPins, ({ one }) => ({
  user: one(users, {
    fields: [staffPins.userId],
    references: [users.id],
  }),
}));

export const userLocationsRelations = relations(userLocations, ({ one }) => ({
  user: one(users, {
    fields: [userLocations.userId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [userLocations.locationId],
    references: [locations.id],
  }),
}));

export const shiftsRelations = relations(shifts, ({ one }) => ({
  user: one(users, {
    fields: [shifts.userId],
    references: [users.id],
  }),
  location: one(locations, {
    fields: [shifts.locationId],
    references: [locations.id],
  }),
}));
