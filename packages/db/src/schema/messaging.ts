// Messaging Schema
import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { timestamps, auditColumns } from './common';
import { users } from './users';
import { patients } from './patients';

// Message status enum
export const messageStatusEnum = ['pending', 'sent', 'delivered', 'failed', 'read'] as const;
export const messageTypeEnum = ['sms', 'email', 'push', 'in_app'] as const;
export const conversationStatusEnum = ['active', 'archived', 'closed'] as const;

// Conversations
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  assignedTo: uuid('assigned_to').references(() => users.id),

  // Contact info
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),

  // Status
  status: varchar('status', { length: 20 }).default('active').$type<typeof conversationStatusEnum[number]>(),
  unreadCount: integer('unread_count').default(0),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
  lastMessagePreview: text('last_message_preview'),

  // Labels/tags
  labels: jsonb('labels').$type<string[]>(),
  priority: varchar('priority', { length: 20 }).default('normal').$type<'low' | 'normal' | 'high' | 'urgent'>(),

  // AI features
  aiSuggestionsEnabled: boolean('ai_suggestions_enabled').default(true),

  ...auditColumns,
});

// Messages
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id),

  // Direction
  direction: varchar('direction', { length: 10 }).notNull().$type<'inbound' | 'outbound'>(),
  type: varchar('type', { length: 20 }).notNull().$type<typeof messageTypeEnum[number]>(),

  // Content
  content: text('content').notNull(),

  // Sender info
  senderId: uuid('sender_id'), // User ID if outbound
  senderName: varchar('sender_name', { length: 255 }),
  senderPhone: varchar('sender_phone', { length: 50 }),
  senderEmail: varchar('sender_email', { length: 255 }),

  // Recipient info
  recipientPhone: varchar('recipient_phone', { length: 50 }),
  recipientEmail: varchar('recipient_email', { length: 255 }),

  // Status
  status: varchar('status', { length: 20 }).default('pending').$type<typeof messageStatusEnum[number]>(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  readAt: timestamp('read_at', { withTimezone: true }),
  failedAt: timestamp('failed_at', { withTimezone: true }),
  failureReason: text('failure_reason'),

  // External IDs
  twilioSid: varchar('twilio_sid', { length: 100 }),
  externalId: varchar('external_id', { length: 255 }),

  // AI features
  aiGenerated: boolean('ai_generated').default(false),
  aiModel: varchar('ai_model', { length: 50 }),
  sentimentScore: integer('sentiment_score'), // -100 to 100
  intent: varchar('intent', { length: 50 }), // 'booking', 'cancel', 'question', etc.

  // Attachments
  attachments: jsonb('attachments').$type<{
    url: string;
    type: string;
    filename: string;
    size: number;
  }[]>(),

  // Metadata
  metadata: jsonb('metadata'),

  ...timestamps,
});

// Message templates
export const messageTemplates = pgTable('message_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 50 }).$type<
    'appointment_reminder' | 'appointment_confirmation' | 'follow_up' |
    'marketing' | 'review_request' | 'birthday' | 'waitlist' | 'express_booking' |
    'group_booking' | 'payment' | 'custom'
  >(),
  type: varchar('type', { length: 20 }).$type<typeof messageTypeEnum[number]>(),

  // Content with placeholders
  subject: varchar('subject', { length: 500 }), // For emails
  content: text('content').notNull(),

  // Variables available
  availableVariables: jsonb('available_variables').$type<string[]>(),

  // Usage
  isActive: boolean('is_active').default(true),
  isDefault: boolean('is_default').default(false),

  // Stats
  timesUsed: integer('times_used').default(0),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),

  ...auditColumns,
});

// Quick replies (canned responses)
export const quickReplies = pgTable('quick_replies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  shortcut: varchar('shortcut', { length: 50 }), // e.g., "/confirm"
  content: text('content').notNull(),
  category: varchar('category', { length: 50 }),
  isGlobal: boolean('is_global').default(false),
  createdBy: uuid('created_by').references(() => users.id),
  ...timestamps,
});

// SMS campaigns
export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 20 }).$type<'sms' | 'email' | 'push'>(),
  status: varchar('status', { length: 20 }).default('draft').$type<'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled'>(),

  // Content
  templateId: uuid('template_id').references(() => messageTemplates.id),
  subject: varchar('subject', { length: 500 }),
  content: text('content').notNull(),

  // Targeting
  targetingCriteria: jsonb('targeting_criteria').$type<{
    patientStatus?: string[];
    lastVisitDays?: { min?: number; max?: number };
    services?: string[];
    tags?: string[];
    locations?: string[];
    customQuery?: string;
  }>(),
  recipientCount: integer('recipient_count'),

  // Scheduling
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),

  // Stats
  totalSent: integer('total_sent').default(0),
  totalDelivered: integer('total_delivered').default(0),
  totalFailed: integer('total_failed').default(0),
  totalOpened: integer('total_opened').default(0),
  totalClicked: integer('total_clicked').default(0),
  totalUnsubscribed: integer('total_unsubscribed').default(0),

  ...auditColumns,
});

// Campaign recipients
export const campaignRecipients = pgTable('campaign_recipients', {
  id: uuid('id').primaryKey().defaultRandom(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  messageId: uuid('message_id').references(() => messages.id),
  status: varchar('status', { length: 20 }).default('pending').$type<typeof messageStatusEnum[number]>(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  openedAt: timestamp('opened_at', { withTimezone: true }),
  clickedAt: timestamp('clicked_at', { withTimezone: true }),
  unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
  failureReason: text('failure_reason'),
  ...timestamps,
});

// SMS log (for compliance and debugging)
export const smsLogs = pgTable('sms_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  direction: varchar('direction', { length: 10 }).$type<'inbound' | 'outbound'>(),
  fromNumber: varchar('from_number', { length: 50 }),
  toNumber: varchar('to_number', { length: 50 }),
  content: text('content'),
  twilioSid: varchar('twilio_sid', { length: 100 }),
  status: varchar('status', { length: 20 }),
  errorCode: varchar('error_code', { length: 50 }),
  errorMessage: text('error_message'),
  patientId: uuid('patient_id').references(() => patients.id),
  conversationId: uuid('conversation_id').references(() => conversations.id),
  messageId: uuid('message_id').references(() => messages.id),
  cost: varchar('cost', { length: 20 }),
  segments: integer('segments'),
  metadata: jsonb('metadata'),
  ...timestamps,
});

// Notification preferences (per patient)
export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id).unique(),

  // Channel preferences
  smsEnabled: boolean('sms_enabled').default(true),
  emailEnabled: boolean('email_enabled').default(true),
  pushEnabled: boolean('push_enabled').default(true),

  // Notification types
  appointmentReminders: boolean('appointment_reminders').default(true),
  appointmentConfirmations: boolean('appointment_confirmations').default(true),
  marketingMessages: boolean('marketing_messages').default(false),
  reviewRequests: boolean('review_requests').default(true),
  birthdayMessages: boolean('birthday_messages').default(true),
  waitlistAlerts: boolean('waitlist_alerts').default(true),
  paymentReceipts: boolean('payment_receipts').default(true),

  // Timing
  preferredTime: varchar('preferred_time', { length: 10 }), // HH:MM
  quietHoursStart: varchar('quiet_hours_start', { length: 10 }),
  quietHoursEnd: varchar('quiet_hours_end', { length: 10 }),
  timezone: varchar('timezone', { length: 50 }),

  // Unsubscribe
  unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
  unsubscribeReason: text('unsubscribe_reason'),

  ...timestamps,
});

// Push notification tokens
export const pushTokens = pgTable('push_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  patientId: uuid('patient_id').references(() => patients.id),
  token: text('token').notNull(),
  platform: varchar('platform', { length: 20 }).$type<'ios' | 'android' | 'web'>(),
  deviceId: varchar('device_id', { length: 255 }),
  deviceName: varchar('device_name', { length: 255 }),
  isActive: boolean('is_active').default(true),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  ...timestamps,
});

// Relations
export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  patient: one(patients, {
    fields: [conversations.patientId],
    references: [patients.id],
  }),
  assignedUser: one(users, {
    fields: [conversations.assignedTo],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  template: one(messageTemplates, {
    fields: [campaigns.templateId],
    references: [messageTemplates.id],
  }),
  recipients: many(campaignRecipients),
}));

export const campaignRecipientsRelations = relations(campaignRecipients, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignRecipients.campaignId],
    references: [campaigns.id],
  }),
  patient: one(patients, {
    fields: [campaignRecipients.patientId],
    references: [patients.id],
  }),
  message: one(messages, {
    fields: [campaignRecipients.messageId],
    references: [messages.id],
  }),
}));
