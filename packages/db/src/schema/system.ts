// System Schema - Audit Logs, Settings, Referrals, Analytics
import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb, decimal, date, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { timestamps, auditColumns } from './common';
import { users } from './users';
import { patients } from './patients';
import { locations } from './locations';

// Audit logs (HIPAA compliance)
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Who
  userId: uuid('user_id').references(() => users.id),
  patientId: uuid('patient_id').references(() => patients.id), // If action involves patient data
  userEmail: varchar('user_email', { length: 255 }),
  userName: varchar('user_name', { length: 255 }),

  // What
  action: varchar('action', { length: 50 }).notNull().$type<
    'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' |
    'EXPORT' | 'PRINT' | 'VIEW' | 'SEARCH' | 'DOWNLOAD' | 'SHARE' |
    'ACCESS_DENIED' | 'PASSWORD_CHANGE' | 'MFA_ENABLED' | 'MFA_DISABLED'
  >(),
  resourceType: varchar('resource_type', { length: 100 }).notNull(),
  resourceId: uuid('resource_id'),
  resourceName: varchar('resource_name', { length: 255 }),

  // Details
  changes: jsonb('changes').$type<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[]>(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),

  // Context
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  sessionId: varchar('session_id', { length: 255 }),
  locationId: uuid('location_id').references(() => locations.id),

  // PHI access tracking
  phiAccessed: boolean('phi_accessed').default(false),
  phiFields: jsonb('phi_fields').$type<string[]>(),

  // Timestamp (use specific column, not common timestamps)
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Indexes for compliance queries
  userIdIdx: index('audit_logs_user_id_idx').on(table.userId),
  patientIdIdx: index('audit_logs_patient_id_idx').on(table.patientId),
  resourceTypeIdx: index('audit_logs_resource_type_idx').on(table.resourceType),
  timestampIdx: index('audit_logs_timestamp_idx').on(table.timestamp),
  actionIdx: index('audit_logs_action_idx').on(table.action),
}));

// System settings (global and per-location)
export const systemSettings = pgTable('system_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  locationId: uuid('location_id').references(() => locations.id), // Null for global settings
  category: varchar('category', { length: 50 }).notNull(),
  key: varchar('key', { length: 100 }).notNull(),
  value: jsonb('value'),
  valueType: varchar('value_type', { length: 20 }).$type<'string' | 'number' | 'boolean' | 'json'>(),
  description: text('description'),
  isPublic: boolean('is_public').default(false), // Can be read by client apps
  ...auditColumns,
});

// Referral programs
export const referralPrograms = pgTable('referral_programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),

  // Rewards
  referrerReward: jsonb('referrer_reward').$type<{
    type: 'credit' | 'discount_percent' | 'discount_fixed' | 'gift_card' | 'service';
    value: number;
    serviceId?: string;
    serviceName?: string;
    minReferrals?: number;
  }>(),
  refereeReward: jsonb('referee_reward').$type<{
    type: 'credit' | 'discount_percent' | 'discount_fixed' | 'service';
    value: number;
    serviceId?: string;
    serviceName?: string;
    firstVisitOnly?: boolean;
  }>(),

  // Rules
  rules: jsonb('rules').$type<{
    requirePurchase?: boolean;
    minPurchaseAmount?: number;
    eligibleServices?: string[];
    maxReferralsPerPatient?: number;
    referralExpiresDays?: number;
  }>(),

  // Status
  isActive: boolean('is_active').default(true),
  startDate: date('start_date'),
  endDate: date('end_date'),

  // Stats
  totalReferrals: integer('total_referrals').default(0),
  totalConversions: integer('total_conversions').default(0),
  totalRewardsIssued: decimal('total_rewards_issued', { precision: 10, scale: 2 }).default('0'),

  ...auditColumns,
});

// Referrals (individual referral tracking)
export const referrals = pgTable('referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  programId: uuid('program_id').notNull().references(() => referralPrograms.id),

  // Referrer (existing patient)
  referrerId: uuid('referrer_id').notNull().references(() => patients.id),
  referrerCode: varchar('referrer_code', { length: 50 }),

  // Referee (new patient)
  refereeId: uuid('referee_id').references(() => patients.id),
  refereeName: varchar('referee_name', { length: 255 }),
  refereeEmail: varchar('referee_email', { length: 255 }),
  refereePhone: varchar('referee_phone', { length: 50 }),

  // Status
  status: varchar('status', { length: 20 }).default('pending').$type<
    'pending' | 'contacted' | 'booked' | 'converted' | 'rewarded' | 'expired' | 'cancelled'
  >(),

  // Tracking
  referralDate: timestamp('referral_date', { withTimezone: true }).notNull().defaultNow(),
  contactedAt: timestamp('contacted_at', { withTimezone: true }),
  bookedAt: timestamp('booked_at', { withTimezone: true }),
  convertedAt: timestamp('converted_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),

  // Rewards
  referrerRewardIssued: boolean('referrer_reward_issued').default(false),
  referrerRewardId: uuid('referrer_reward_id'), // Credit ID or gift card ID
  refereeRewardIssued: boolean('referee_reward_issued').default(false),
  refereeRewardId: uuid('referee_reward_id'),

  // First appointment
  firstAppointmentId: uuid('first_appointment_id'),
  firstPurchaseAmount: decimal('first_purchase_amount', { precision: 10, scale: 2 }),

  // Source tracking
  sourceChannel: varchar('source_channel', { length: 50 }).$type<'link' | 'code' | 'form' | 'staff' | 'other'>(),
  sourceUrl: text('source_url'),

  notes: text('notes'),
  ...timestamps,
});

// Referral codes (shareable links/codes)
export const referralCodes = pgTable('referral_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  programId: uuid('program_id').notNull().references(() => referralPrograms.id),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  code: varchar('code', { length: 50 }).unique().notNull(),
  url: text('url'),
  qrCodeUrl: text('qr_code_url'),

  // Stats
  viewCount: integer('view_count').default(0),
  clickCount: integer('click_count').default(0),
  referralCount: integer('referral_count').default(0),
  conversionCount: integer('conversion_count').default(0),

  // Status
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at', { withTimezone: true }),

  ...timestamps,
});

// Analytics events (for dashboards)
export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  eventData: jsonb('event_data'),

  // Entity references
  patientId: uuid('patient_id').references(() => patients.id),
  userId: uuid('user_id').references(() => users.id),
  appointmentId: uuid('appointment_id'),
  invoiceId: uuid('invoice_id'),
  locationId: uuid('location_id').references(() => locations.id),

  // Context
  sessionId: varchar('session_id', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  referrer: text('referrer'),

  // Timestamp
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  eventTypeIdx: index('analytics_events_event_type_idx').on(table.eventType),
  timestampIdx: index('analytics_events_timestamp_idx').on(table.timestamp),
  patientIdIdx: index('analytics_events_patient_id_idx').on(table.patientId),
}));

// Daily analytics snapshots (pre-computed for dashboards)
export const dailyAnalytics = pgTable('daily_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: date('date').notNull(),
  locationId: uuid('location_id').references(() => locations.id), // Null for all locations

  // Appointments
  appointmentsScheduled: integer('appointments_scheduled').default(0),
  appointmentsCompleted: integer('appointments_completed').default(0),
  appointmentsCancelled: integer('appointments_cancelled').default(0),
  appointmentsNoShow: integer('appointments_no_show').default(0),
  newPatients: integer('new_patients').default(0),
  returningPatients: integer('returning_patients').default(0),

  // Revenue
  totalRevenue: decimal('total_revenue', { precision: 12, scale: 2 }).default('0'),
  serviceRevenue: decimal('service_revenue', { precision: 12, scale: 2 }).default('0'),
  productRevenue: decimal('product_revenue', { precision: 12, scale: 2 }).default('0'),
  packageRevenue: decimal('package_revenue', { precision: 12, scale: 2 }).default('0'),
  membershipRevenue: decimal('membership_revenue', { precision: 12, scale: 2 }).default('0'),
  giftCardRevenue: decimal('gift_card_revenue', { precision: 12, scale: 2 }).default('0'),

  // Payments
  cashPayments: decimal('cash_payments', { precision: 12, scale: 2 }).default('0'),
  cardPayments: decimal('card_payments', { precision: 12, scale: 2 }).default('0'),
  otherPayments: decimal('other_payments', { precision: 12, scale: 2 }).default('0'),
  refundsIssued: decimal('refunds_issued', { precision: 12, scale: 2 }).default('0'),

  // Inventory
  inventoryUsageValue: decimal('inventory_usage_value', { precision: 12, scale: 2 }).default('0'),
  inventoryWasteValue: decimal('inventory_waste_value', { precision: 12, scale: 2 }).default('0'),

  // By practitioner (array of objects)
  practitionerStats: jsonb('practitioner_stats').$type<{
    practitionerId: string;
    practitionerName: string;
    appointments: number;
    revenue: number;
    newPatients: number;
  }[]>(),

  // By service category
  serviceCategoryStats: jsonb('service_category_stats').$type<{
    category: string;
    appointments: number;
    revenue: number;
  }[]>(),

  // Computed at
  computedAt: timestamp('computed_at', { withTimezone: true }).notNull().defaultNow(),

  ...timestamps,
});

// System notifications (internal alerts)
export const systemNotifications = pgTable('system_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 50 }).$type<
    'alert' | 'reminder' | 'task' | 'announcement' | 'system'
  >(),
  severity: varchar('severity', { length: 20 }).$type<'info' | 'warning' | 'error' | 'success'>(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),

  // Targeting
  targetType: varchar('target_type', { length: 20 }).$type<'all' | 'user' | 'role' | 'location'>(),
  targetId: uuid('target_id'),
  targetRoles: jsonb('target_roles').$type<string[]>(),
  targetLocationIds: jsonb('target_location_ids').$type<string[]>(),

  // Action
  actionUrl: text('action_url'),
  actionLabel: varchar('action_label', { length: 100 }),

  // Status
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true),

  // Read tracking
  readBy: jsonb('read_by').$type<{ userId: string; readAt: string }[]>(),
  dismissedBy: jsonb('dismissed_by').$type<{ userId: string; dismissedAt: string }[]>(),

  ...auditColumns,
});

// Integrations (third-party service configs)
export const integrations = pgTable('integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  provider: varchar('provider', { length: 50 }).$type<
    'stripe' | 'twilio' | 'google' | 'apple' | 'firebase' | 'vertex_ai' |
    'alle' | 'aspire' | 'evolus' | 'mailchimp' | 'quickbooks' | 'custom'
  >(),

  // Credentials (encrypted in application layer)
  credentials: jsonb('credentials').$type<Record<string, string>>(),
  config: jsonb('config').$type<Record<string, unknown>>(),

  // Status
  isActive: boolean('is_active').default(true),
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  lastErrorAt: timestamp('last_error_at', { withTimezone: true }),
  lastError: text('last_error'),

  // Webhook
  webhookUrl: text('webhook_url'),
  webhookSecret: text('webhook_secret'),

  // Location-specific
  locationId: uuid('location_id').references(() => locations.id),

  ...auditColumns,
});

// Scheduled jobs (cron tracking)
export const scheduledJobs = pgTable('scheduled_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  schedule: varchar('schedule', { length: 100 }).notNull(), // Cron expression
  jobType: varchar('job_type', { length: 50 }).$type<
    'appointment_reminder' | 'waitlist_autofill' | 'inventory_check' |
    'analytics_compute' | 'session_cleanup' | 'report_generation' | 'custom'
  >(),
  config: jsonb('config').$type<Record<string, unknown>>(),

  // Status
  isActive: boolean('is_active').default(true),
  lastRunAt: timestamp('last_run_at', { withTimezone: true }),
  lastRunStatus: varchar('last_run_status', { length: 20 }).$type<'success' | 'failed' | 'running'>(),
  lastRunDuration: integer('last_run_duration'), // milliseconds
  lastError: text('last_error'),
  nextRunAt: timestamp('next_run_at', { withTimezone: true }),

  // Stats
  totalRuns: integer('total_runs').default(0),
  successfulRuns: integer('successful_runs').default(0),
  failedRuns: integer('failed_runs').default(0),

  ...auditColumns,
});

// Job execution history
export const jobExecutions = pgTable('job_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => scheduledJobs.id),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  status: varchar('status', { length: 20 }).$type<'running' | 'success' | 'failed' | 'cancelled'>(),
  duration: integer('duration'), // milliseconds
  result: jsonb('result'),
  error: text('error'),
  errorStack: text('error_stack'),
  itemsProcessed: integer('items_processed'),
  itemsFailed: integer('items_failed'),
});

// Relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  patient: one(patients, {
    fields: [auditLogs.patientId],
    references: [patients.id],
  }),
  location: one(locations, {
    fields: [auditLogs.locationId],
    references: [locations.id],
  }),
}));

export const referralProgramsRelations = relations(referralPrograms, ({ many }) => ({
  referrals: many(referrals),
  codes: many(referralCodes),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  program: one(referralPrograms, {
    fields: [referrals.programId],
    references: [referralPrograms.id],
  }),
  referrer: one(patients, {
    fields: [referrals.referrerId],
    references: [patients.id],
    relationName: 'referrer',
  }),
  referee: one(patients, {
    fields: [referrals.refereeId],
    references: [patients.id],
    relationName: 'referee',
  }),
}));

export const referralCodesRelations = relations(referralCodes, ({ one }) => ({
  program: one(referralPrograms, {
    fields: [referralCodes.programId],
    references: [referralPrograms.id],
  }),
  patient: one(patients, {
    fields: [referralCodes.patientId],
    references: [patients.id],
  }),
}));

export const scheduledJobsRelations = relations(scheduledJobs, ({ many }) => ({
  executions: many(jobExecutions),
}));

export const jobExecutionsRelations = relations(jobExecutions, ({ one }) => ({
  job: one(scheduledJobs, {
    fields: [jobExecutions.jobId],
    references: [scheduledJobs.id],
  }),
}));
