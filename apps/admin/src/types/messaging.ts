/**
 * Comprehensive Messaging System Types
 * Medical Spa Admin Platform
 *
 * Defines all types needed for professional patient messaging:
 * - SMS, Email, Web Chat, and Phone channels
 * - Conversation management and threading
 * - Message delivery tracking and status
 * - Patient communication preferences
 * - Quick replies and templates
 * - Internal notes and staff collaboration
 *
 * @see /src/app/messages/page.tsx - Main messaging UI
 * @see /src/components/messaging/ - Messaging components
 */

// ============= Enums and Status Types =============

/**
 * Conversation status for inbox management
 */
export type ConversationStatus = 'open' | 'snoozed' | 'closed'

/**
 * Communication channels supported by the platform
 */
export type MessageChannel = 'sms' | 'email' | 'web_chat' | 'phone'

/**
 * Message delivery status for tracking
 */
export type MessageDeliveryStatus =
  | 'queued'      // Message queued for sending
  | 'sending'     // Currently being sent
  | 'sent'        // Sent but not yet delivered
  | 'delivered'   // Delivered to recipient
  | 'read'        // Opened/read by recipient
  | 'failed'      // Delivery failed

/**
 * Message origin type
 */
export type MessageType =
  | 'manual'      // Manually sent by staff
  | 'automated'   // Automated reminder/notification
  | 'system'      // System-generated message
  | 'campaign'    // Marketing campaign message

// ============= Attachment Types =============

/**
 * File attachment for messages
 */
export interface Attachment {
  /** Unique attachment ID */
  id: string
  /** Original filename */
  filename: string
  /** MIME type */
  mimeType: string
  /** File size in bytes */
  size: number
  /** Storage URL */
  url: string
  /** Optional thumbnail URL for images */
  thumbnailUrl?: string
  /** Upload timestamp */
  uploadedAt: Date
  /** Staff member who uploaded */
  uploadedBy: string
}

// ============= Patient Context Types =============

/**
 * Appointment summary for patient sidebar context
 */
export interface AppointmentSummary {
  /** Appointment ID */
  id: string
  /** Appointment date */
  date: Date
  /** Formatted time string (e.g., "2:00 PM") */
  time: string
  /** Service name */
  service: string
  /** Provider name */
  provider: string
  /** Appointment status */
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
}

/**
 * Patient information for messaging context
 * Extends base patient data with messaging-specific fields
 */
export interface MessagingPatient {
  /** Patient ID */
  id: string
  /** Full name */
  name: string
  /** Initials for avatar (e.g., "JD") */
  initials: string
  /** Primary phone number */
  phone: string
  /** Primary email address */
  email: string
  /** Profile photo URL */
  avatar?: string

  // Communication preferences
  /** Patient has opted in to SMS */
  smsOptIn: boolean
  /** Patient has opted in to email */
  emailOptIn: boolean
  /** Patient has opted in to marketing */
  marketingOptIn: boolean
  /** Preferred communication channel */
  preferredChannel: MessageChannel

  // Patient history context
  /** Date patient first joined */
  patientSince: Date
  /** Last appointment details */
  lastAppointment?: AppointmentSummary
  /** Next upcoming appointment */
  nextAppointment?: AppointmentSummary
  /** List of upcoming appointments */
  upcomingAppointments: AppointmentSummary[]
  /** List of recent past appointments */
  recentAppointments: AppointmentSummary[]

  // Organization
  /** Patient tags for filtering/categorization */
  tags: string[]
  /** Internal staff notes about patient */
  notes: InternalNote[]
}

// ============= Internal Notes =============

/**
 * Internal staff note not visible to patient
 * Used for staff collaboration and context
 */
export interface InternalNote {
  /** Note ID */
  id: string
  /** Note content/text */
  content: string
  /** Author staff ID */
  authorId: string
  /** Author name for display */
  authorName: string
  /** Author avatar URL */
  authorAvatar?: string
  /** When note was created */
  createdAt: Date
  /** Staff members mentioned in note (staff IDs) */
  mentions: string[]
}

// ============= Message Types =============

/**
 * Individual message in a conversation
 */
export interface Message {
  /** Message ID */
  id: number
  /** Parent conversation ID */
  conversationId: number
  /** Who sent the message */
  sender: 'clinic' | 'patient'
  /** Sender name (for clinic staff attribution) */
  senderName?: string
  /** Message text content */
  text: string
  /** Timestamp when sent */
  time: Date
  /** Delivery status */
  status: MessageDeliveryStatus
  /** Channel used for this message */
  channel: MessageChannel
  /** Message type/origin */
  type: MessageType
  /** File attachments */
  attachments?: Attachment[]
  /** Additional metadata (form IDs, appointment refs, etc.) */
  metadata?: Record<string, unknown>
}

// ============= Conversation Types =============

/**
 * Conversation thread with a patient
 * Contains all messages and conversation metadata
 */
export interface Conversation {
  /** Conversation ID */
  id: number
  /** Patient information */
  patient: MessagingPatient
  /** Current conversation status */
  status: ConversationStatus
  /** Primary channel for this conversation */
  channel: MessageChannel
  /** Preview text of last message */
  lastMessage: string
  /** Timestamp of last message */
  lastMessageTime: Date
  /** Count of unread messages from patient */
  unreadCount: number
  /** Whether conversation is starred */
  starred: boolean
  /** Snooze until timestamp */
  snoozedUntil?: Date
  /** Staff member assigned to handle this conversation */
  assignedTo?: StaffMember
  /** Conversation tags for organization */
  tags: string[]
  /** All messages in the conversation */
  messages: Message[]
}

// ============= Staff Member Types =============

/**
 * Staff member for conversation assignment
 */
export interface StaffMember {
  /** Staff member ID */
  id: string
  /** Full name */
  name: string
  /** Profile photo URL */
  avatar?: string
  /** Job role/title */
  role: string
  /** Current availability status */
  status: 'available' | 'away' | 'offline'
}

// ============= Quick Reply Types =============

/**
 * Saved quick reply template
 */
export interface QuickReply {
  /** Quick reply ID */
  id: string
  /** Category for organization (e.g., "appointment", "billing") */
  category: string
  /** Template text content */
  content: string
  /** Sort order within category */
  order: number
  /** Optional shortcut key */
  shortcut?: string
  /** Usage count for analytics */
  usageCount?: number
  /** Last used timestamp */
  lastUsedAt?: Date
}

// ============= Filter and Search Types =============

/**
 * Conversation filtering options
 */
export interface ConversationFilters {
  /** Filter by status ('all' shows everything) */
  status: ConversationStatus | 'all'
  /** Filter by channel */
  channel?: MessageChannel
  /** Filter by assigned staff member ID */
  assignedTo?: string
  /** Filter by conversation tags */
  tags?: string[]
  /** Search query for patient name/message content */
  search?: string
  /** Show only conversations with unread messages */
  unreadOnly?: boolean
  /** Show only starred conversations */
  starredOnly?: boolean
  /** Date range for filtering */
  dateRange?: {
    from: Date
    to: Date
  }
}

// ============= Snooze Options =============

/**
 * Predefined snooze duration option
 */
export interface SnoozeOption {
  /** Display label (e.g., "1 hour", "Tomorrow") */
  label: string
  /** Internal value identifier */
  value: string
  /** Calculated snooze until timestamp */
  until: Date
}

// ============= Form Templates (for sending via messages) =============

/**
 * Digital form template that can be sent to patients
 */
export interface FormTemplate {
  /** Form template ID */
  id: string
  /** Form name/title */
  name: string
  /** Brief description */
  description: string
  /** Services this form is required for */
  requiredFor: string[]
  /** How long the form is valid ('per-visit', '6-months', '1-year', 'permanent') */
  validFor: string
  /** Form fields included */
  fields: string[]
  /** Estimated completion time */
  estimatedTime?: string
  /** Default message text when sending */
  message: string
  /** Preview content for UI */
  previewContent?: {
    title: string
    sections?: string[]
    instructions?: string[]
  }
}

/**
 * Tracking record for forms sent to patients
 */
export interface SentFormRecord {
  /** Record ID */
  id: string
  /** Form template ID */
  formId: string
  /** Patient ID */
  patientId: string
  /** When form was sent */
  sentAt: Date
  /** Current status */
  status: 'sent' | 'viewed' | 'completed' | 'expired'
  /** When patient viewed the form */
  viewedAt?: Date
  /** When patient completed the form */
  completedAt?: Date
  /** Link expiration timestamp */
  expiresAt?: Date
  /** Staff member who sent the form */
  sentBy: string
  /** Related conversation ID */
  conversationId?: number
  /** Related appointment ID */
  appointmentId?: string
}

// ============= Campaign Types =============

/**
 * Bulk messaging campaign
 */
export interface Campaign {
  /** Campaign ID */
  id: string
  /** Campaign name */
  name: string
  /** Campaign type */
  type: 'promotional' | 'educational' | 'reminder' | 'reactivation'
  /** Message content */
  message: string
  /** Channel to use */
  channel: MessageChannel
  /** Target patient segment */
  targetSegment: {
    /** Patient tags to include */
    tags?: string[]
    /** Last visit date range */
    lastVisitRange?: { from: Date; to: Date }
    /** Opt-in requirement */
    optInRequired: boolean
  }
  /** Campaign status */
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled'
  /** Scheduled send time */
  scheduledFor?: Date
  /** When campaign was sent */
  sentAt?: Date
  /** Total recipients */
  recipientCount: number
  /** Successful deliveries */
  deliveredCount: number
  /** Failed deliveries */
  failedCount: number
  /** Campaign statistics */
  stats?: {
    opened: number
    clicked: number
    replied: number
    optedOut: number
  }
  /** Staff member who created campaign */
  createdBy: string
  /** Creation timestamp */
  createdAt: Date
}

// ============= SMS Compliance Types =============

/**
 * SMS consent tracking for TCPA compliance
 */
export interface SMSConsent {
  /** Patient ID */
  patientId: string
  /** Whether consent is given */
  hasConsent: boolean
  /** Type of consent */
  consentType: 'transactional' | 'marketing' | 'both'
  /** When consent was given */
  consentGivenAt?: Date
  /** How consent was obtained */
  consentMethod?: 'in_person' | 'online_form' | 'phone' | 'text_reply'
  /** IP address when consent given (for online) */
  ipAddress?: string
  /** When consent was revoked (opt-out) */
  revokedAt?: Date
  /** Opt-out method */
  optOutMethod?: 'stop_keyword' | 'manual' | 'complaint'
}

/**
 * Opt-out keyword detected in patient message
 */
export interface OptOutDetection {
  /** Message ID where opt-out was detected */
  messageId: number
  /** Patient ID */
  patientId: string
  /** Detected keyword */
  keyword: string
  /** Detection timestamp */
  detectedAt: Date
  /** Confidence level */
  confidence: 'high' | 'medium' | 'low'
  /** Whether auto-processed or needs review */
  requiresReview: boolean
  /** Staff member who reviewed (if applicable) */
  reviewedBy?: string
  /** Review timestamp */
  reviewedAt?: Date
  /** Action taken */
  action?: 'opted_out' | 'clarified' | 'ignored'
}

// ============= Analytics Types =============

/**
 * Messaging analytics data
 */
export interface MessagingAnalytics {
  /** Date range for analytics */
  dateRange: { from: Date; to: Date }
  /** Total messages sent */
  messagesSent: number
  /** Total messages received */
  messagesReceived: number
  /** Average response time in minutes */
  avgResponseTime: number
  /** Conversations by channel */
  byChannel: Record<MessageChannel, number>
  /** Conversations by status */
  byStatus: Record<ConversationStatus, number>
  /** Peak messaging hours */
  peakHours: { hour: number; count: number }[]
  /** Top quick replies used */
  topQuickReplies: { content: string; usageCount: number }[]
  /** Staff response metrics */
  staffMetrics: {
    staffId: string
    staffName: string
    conversationsHandled: number
    avgResponseTime: number
  }[]
}

// ============= UI State Types =============

/**
 * Messaging inbox UI state
 */
export interface MessagingUIState {
  /** Currently selected conversation ID */
  selectedConversationId: number | null
  /** Current filter settings */
  filters: ConversationFilters
  /** Current search query */
  searchQuery: string
  /** Whether forms panel is open */
  showFormsPanel: boolean
  /** Selected form category */
  selectedFormCategory: 'intake' | 'postCare' | 'general'
  /** Currently previewing form */
  previewingForm: FormTemplate | null
  /** Selected quick reply category */
  selectedQuickReplyCategory: string
  /** Message being composed */
  draftMessage: string
  /** Whether send is in progress */
  isSending: boolean
}

// ============= API Request/Response Types =============

/**
 * Send message API request
 */
export interface SendMessageRequest {
  /** Conversation ID (or patient ID for new conversation) */
  conversationId?: number
  /** Patient ID (for new conversations) */
  patientId?: string
  /** Message text */
  message: string
  /** Channel to use */
  channel: MessageChannel
  /** Message type */
  type: MessageType
  /** Attachments */
  attachments?: string[]
  /** Schedule send for later */
  scheduledFor?: Date
  /** Additional metadata */
  metadata?: Record<string, unknown>
}

/**
 * Send message API response
 */
export interface SendMessageResponse {
  /** Whether send was successful */
  success: boolean
  /** Created message */
  message?: Message
  /** Error message if failed */
  error?: string
  /** External provider message ID (Twilio, etc.) */
  externalId?: string
}

/**
 * Load conversations API request
 */
export interface LoadConversationsRequest {
  /** Filters to apply */
  filters?: ConversationFilters
  /** Pagination offset */
  offset?: number
  /** Page size */
  limit?: number
  /** Sort field */
  sortBy?: 'lastMessage' | 'unread' | 'starred'
  /** Sort direction */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Load conversations API response
 */
export interface LoadConversationsResponse {
  /** Success flag */
  success: boolean
  /** Conversations list */
  conversations: Conversation[]
  /** Total count (before pagination) */
  total: number
  /** Whether there are more results */
  hasMore: boolean
  /** Error message if failed */
  error?: string
}

/**
 * Update conversation API request
 */
export interface UpdateConversationRequest {
  /** Conversation ID */
  conversationId: number
  /** New status */
  status?: ConversationStatus
  /** Star/unstar */
  starred?: boolean
  /** Snooze until */
  snoozedUntil?: Date | null
  /** Assign to staff member */
  assignedTo?: string | null
  /** Add/remove tags */
  tags?: string[]
}

/**
 * Mark conversation as read API request
 */
export interface MarkConversationReadRequest {
  /** Conversation ID */
  conversationId: number
  /** Mark all messages as read */
  markAllRead?: boolean
}

// ============= WebSocket/Real-time Types =============

/**
 * Real-time message event
 */
export interface RealtimeMessageEvent {
  /** Event type */
  type: 'new_message' | 'message_updated' | 'conversation_updated' | 'typing'
  /** Conversation ID */
  conversationId: number
  /** Event data */
  data: Message | Conversation | { patientId: string; isTyping: boolean }
  /** Event timestamp */
  timestamp: Date
}

/**
 * Typing indicator state
 */
export interface TypingIndicator {
  /** Conversation ID */
  conversationId: number
  /** Patient or staff member name */
  name: string
  /** Whether currently typing */
  isTyping: boolean
  /** Last typing timestamp */
  lastTypedAt: Date
}

// ============= Automated Messaging Types =============

/**
 * Event types that can trigger automated messages
 */
export type EventType =
  | 'appointment_booked'
  | 'appointment_canceled'
  | 'appointment_rescheduled'
  | 'form_submitted'
  | 'waitlist_added'
  | 'waitlist_opening'
  | 'check_in_reminder'
  | 'patient_waiting'
  | 'provider_ready'
  | 'sale_closed'
  | 'gift_card_purchased'
  | 'gift_card_received'
  | 'membership_started'
  | 'membership_renewal_reminder'
  | 'membership_renewed'
  | 'membership_canceled'

/**
 * Message template with variable substitution
 */
export interface MessageTemplate {
  /** Template subject (for email) */
  subject?: string
  /** Template body text with {{variables}} */
  body: string
  /** Available variables for substitution (e.g., ["patientName", "appointmentDate"]) */
  variables: string[]
}

/**
 * Internal notification configuration for staff alerts
 */
export interface InternalNotificationConfig {
  /** Whether internal notifications are enabled */
  enabled: boolean
  /** Staff email addresses to notify */
  recipients: string[]
}

/**
 * Configuration for automated confirmation requests (reply C/R)
 */
export interface ConfirmationRequestConfig {
  /** Whether confirmation requests are enabled */
  enabled: boolean
  /** Whether to set appointment status to "unconfirmed" until patient responds */
  setStatusUnconfirmed: boolean
}

/**
 * Timeline reminder configuration (e.g., 1 day before, 2 days before)
 */
export interface TimelineReminder {
  /** Unique identifier for this reminder */
  id: string
  /** Number of time units before appointment */
  value: number
  /** Time unit (minutes, hours, days) */
  unit: 'minutes' | 'hours' | 'days'
  /** Whether this reminder is enabled */
  enabled: boolean
  /** Message template for this reminder */
  template: MessageTemplate
  /** Channels to send on */
  channels: ('sms' | 'email')[]
}

/**
 * Complete configuration for an automated message
 */
export interface AutomatedMessageConfig {
  /** Unique identifier */
  id: string
  /** Event that triggers this message */
  eventType: EventType
  /** Whether this message is enabled */
  enabled: boolean
  /** Channels to send on (SMS, email, or both) */
  channels: ('sms' | 'email')[]
  /** Timing configuration */
  timing: {
    /** When to send: immediate, before appointment, or after event */
    type: 'immediate' | 'before_appointment' | 'after_event'
    /** Time value (e.g., 15 for "15 minutes before") */
    value?: number
    /** Time unit */
    unit?: 'minutes' | 'hours' | 'days'
  }
  /** Trigger conditions */
  triggers: {
    /** Send for online bookings */
    onlineBookings: boolean
    /** Send for staff-created bookings */
    staffBookings: boolean
    /** Only send for specific service IDs (empty = all services) */
    specificServices?: string[]
  }
  /** Message template */
  template: MessageTemplate
  /** Internal staff notification settings */
  internalNotification?: InternalNotificationConfig
  /** Confirmation request settings (reply C to confirm, R to reschedule) */
  confirmationRequest?: ConfirmationRequestConfig
  /** Timeline reminders (for appointment-based events) */
  timelineReminders?: TimelineReminder[]
  /** Custom check-in instructions (for check-in messages) */
  checkInInstructions?: string
}

// ============= Export Default Configurations =============

/**
 * Default snooze duration options
 */
export const DEFAULT_SNOOZE_OPTIONS: SnoozeOption[] = [
  { label: '1 hour', value: '1h', until: new Date(Date.now() + 60 * 60 * 1000) },
  { label: '3 hours', value: '3h', until: new Date(Date.now() + 3 * 60 * 60 * 1000) },
  { label: 'Tomorrow', value: 'tomorrow', until: new Date(new Date().setHours(9, 0, 0, 0) + 24 * 60 * 60 * 1000) },
  { label: 'Next week', value: 'next_week', until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
]

/**
 * Default conversation filters
 */
export const DEFAULT_CONVERSATION_FILTERS: ConversationFilters = {
  status: 'all',
  unreadOnly: false,
  starredOnly: false,
}

/**
 * Message channel display names
 */
export const MESSAGE_CHANNEL_LABELS: Record<MessageChannel, string> = {
  sms: 'SMS',
  email: 'Email',
  web_chat: 'Web Chat',
  phone: 'Phone',
}

/**
 * Delivery status display labels
 */
export const DELIVERY_STATUS_LABELS: Record<MessageDeliveryStatus, string> = {
  queued: 'Queued',
  sending: 'Sending',
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
  failed: 'Failed',
}

/**
 * Conversation status display labels
 */
export const CONVERSATION_STATUS_LABELS: Record<ConversationStatus, string> = {
  open: 'Open',
  snoozed: 'Snoozed',
  closed: 'Closed',
}
