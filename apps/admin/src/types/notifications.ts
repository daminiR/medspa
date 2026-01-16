/**
 * Notification Types for Medical Spa Admin Platform
 *
 * These types mirror the backend Prisma schema definitions for:
 * - Notification
 * - NotificationPreference
 * - PushToken
 *
 * @see /backend/prisma/schema.prisma
 */

// ===================
// NOTIFICATION ENUMS
// ===================

/**
 * Push notification platform types
 * Matches Prisma PushPlatform enum
 */
export type PushPlatform = 'ios' | 'android' | 'web' | 'expo';

/**
 * Notification types matching Prisma NotificationType enum
 * Extended with legacy UI-specific types for backwards compatibility
 */
export type NotificationType =
  // Backend notification types (from Prisma schema)
  | 'appointment_reminder'
  | 'appointment_confirmation'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'message_received'
  | 'treatment_followup'
  | 'billing_reminder'
  | 'payment_received'
  | 'membership_renewal'
  | 'marketing_promotion'
  | 'system_alert'
  | 'waitlist_offer'
  | 'form_required'
  // Legacy UI types (for backwards compatibility)
  | 'appointment'
  | 'message'
  | 'alert'
  | 'system';

/**
 * Notification delivery channel types
 * Matches Prisma NotificationChannel enum
 */
export type NotificationChannel = 'push' | 'email' | 'sms' | 'in_app';

/**
 * Notification priority levels
 * Matches Prisma NotificationPriority enum
 */
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * Connection status for real-time updates
 */
export type ConnectionStatus = 'connected' | 'disconnected' | 'polling';

// ===================
// NOTIFICATION DATA INTERFACES
// ===================

/**
 * Notification data payload structure
 * Used for action URL generation and additional context
 */
export interface NotificationData {
  /** Direct action URL override */
  actionUrl?: string;
  /** Action type for event dispatching */
  actionType?: string;
  /** Action button label */
  actionLabel?: string;
  /** Related patient ID */
  patientId?: string;
  /** Related patient name */
  patientName?: string;
  /** Related appointment ID */
  appointmentId?: string;
  /** Related provider ID */
  providerId?: string;
  /** Related provider name */
  providerName?: string;
  /** Room number/ID */
  roomNumber?: string;
  /** Invoice ID for billing notifications */
  invoiceId?: string;
  /** Amount for payment notifications */
  amount?: number;
  /** Waitlist entry ID */
  waitlistEntryId?: string;
  /** Form ID for form_required notifications */
  formId?: string;
  /** Membership ID for renewal notifications */
  membershipId?: string;
  /** Whether notification requires action */
  requiresAction?: boolean;
  /** Whether notification is persistent */
  persistent?: boolean;
  /** Any additional metadata */
  [key: string]: unknown;
}

// ===================
// CORE NOTIFICATION INTERFACES
// ===================

/**
 * Main Notification interface
 * Matches Prisma Notification model with frontend enhancements
 */
export interface Notification {
  /** Unique notification ID */
  id: string;
  /** User ID the notification belongs to */
  userId?: string;
  /** Type of notification */
  type: NotificationType;
  /** Notification title */
  title: string;
  /** Notification body/message */
  body: string;
  /** Additional data payload */
  data?: NotificationData;
  /** Whether notification has been read */
  read: boolean;
  /** Timestamp when notification was read */
  readAt?: Date | string | null;
  /** Delivery channel */
  channel: NotificationChannel;
  /** Priority level */
  priority: NotificationPriority;
  /** Expiration timestamp */
  expiresAt?: Date | string | null;
  /** Creation timestamp */
  createdAt: Date | string;
  /** Generated action URL for frontend navigation */
  actionUrl?: string;
}

/**
 * Notification for API responses (with string dates)
 */
export interface NotificationApiResponse {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: NotificationData;
  read: boolean;
  readAt?: string | null;
  channel: NotificationChannel;
  priority: NotificationPriority;
  expiresAt?: string | null;
  createdAt: string;
}

/**
 * Push token registration
 * Matches Prisma PushToken model
 */
export interface PushToken {
  /** Unique push token ID */
  id: string;
  /** User ID the token belongs to */
  userId: string;
  /** The actual push token string */
  token: string;
  /** Platform type */
  platform: PushPlatform;
  /** Device identifier */
  deviceId?: string;
  /** Whether the token is currently active */
  isActive: boolean;
  /** Creation timestamp */
  createdAt: Date | string;
  /** Last update timestamp */
  updatedAt: Date | string;
}

/**
 * Create push token request
 */
export interface CreatePushTokenRequest {
  token: string;
  platform: PushPlatform;
  deviceId?: string;
}

/**
 * Notification preferences for a user
 * Matches Prisma NotificationPreference model
 */
export interface NotificationPreferences {
  /** Unique preferences ID */
  id: string;
  /** User ID */
  userId: string;

  // Email preferences
  /** Receive appointment reminder emails */
  appointmentReminders: boolean;
  /** Receive appointment change emails */
  appointmentChanges: boolean;
  /** Receive message notification emails */
  messageNotifications: boolean;
  /** Receive marketing emails */
  marketingEmails: boolean;
  /** Receive treatment reminder emails */
  treatmentReminders: boolean;
  /** Receive billing alert emails */
  billingAlerts: boolean;

  // Push preferences
  /** Push notifications globally enabled */
  pushEnabled: boolean;
  /** Push for appointments */
  pushAppointments: boolean;
  /** Push for messages */
  pushMessages: boolean;
  /** Push for promotions */
  pushPromotions: boolean;

  // SMS preferences
  /** SMS notifications globally enabled */
  smsEnabled: boolean;
  /** SMS for appointments */
  smsAppointments: boolean;
  /** SMS for reminders */
  smsReminders: boolean;

  // Quiet hours
  /** Quiet hours enabled */
  quietHoursEnabled: boolean;
  /** Quiet hours start time (HH:MM format) */
  quietHoursStart?: string | null;
  /** Quiet hours end time (HH:MM format) */
  quietHoursEnd?: string | null;
  /** User timezone */
  timezone: string;

  /** Creation timestamp */
  createdAt: Date | string;
  /** Last update timestamp */
  updatedAt: Date | string;
}

/**
 * Update notification preferences request
 */
export interface UpdateNotificationPreferencesRequest {
  // Email preferences
  appointmentReminders?: boolean;
  appointmentChanges?: boolean;
  messageNotifications?: boolean;
  marketingEmails?: boolean;
  treatmentReminders?: boolean;
  billingAlerts?: boolean;

  // Push preferences
  pushEnabled?: boolean;
  pushAppointments?: boolean;
  pushMessages?: boolean;
  pushPromotions?: boolean;

  // SMS preferences
  smsEnabled?: boolean;
  smsAppointments?: boolean;
  smsReminders?: boolean;

  // Quiet hours
  quietHoursEnabled?: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  timezone?: string;
}

// ===================
// API RESPONSE TYPES
// ===================

/**
 * Base API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

/**
 * Paginated list response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * List notifications API response
 */
export interface ListNotificationsResponse {
  success: boolean;
  notifications: NotificationApiResponse[];
  unreadCount: number;
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Single notification API response
 */
export interface NotificationResponse {
  success: boolean;
  notification?: NotificationApiResponse;
  error?: string;
}

/**
 * Mark as read API response
 */
export interface MarkAsReadResponse {
  success: boolean;
  notification?: NotificationApiResponse;
  error?: string;
}

/**
 * Mark all as read API response
 */
export interface MarkAllAsReadResponse {
  success: boolean;
  updatedCount: number;
  message?: string;
  error?: string;
}

/**
 * Delete notification API response
 */
export interface DeleteNotificationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Notification preferences API response
 */
export interface NotificationPreferencesResponse {
  success: boolean;
  preferences?: NotificationPreferences;
  error?: string;
}

/**
 * Push token registration API response
 */
export interface PushTokenResponse {
  success: boolean;
  token?: PushToken;
  error?: string;
}

// ===================
// HOOK RETURN TYPES
// ===================

/**
 * useNotifications hook options
 */
export interface UseNotificationsOptions {
  /** Staff user ID for real-time subscriptions */
  staffUserId?: string;
  /** Enable real-time updates via Firebase */
  enableRealtime?: boolean;
  /** Polling interval in milliseconds (when real-time is unavailable) */
  pollingInterval?: number;
}

/**
 * useNotifications hook return type
 */
export interface UseNotificationsReturn {
  /** List of notifications */
  notifications: Notification[];
  /** Whether notifications are loading */
  isLoading: boolean;
  /** Count of unread notifications */
  unreadCount: number;
  /** Whether notification sound is enabled */
  soundEnabled: boolean;
  /** Whether real-time updates are active */
  isRealtime: boolean;
  /** Current connection status */
  connectionStatus: ConnectionStatus;
  /** Mark a single notification as read */
  markAsRead: (id: string) => void;
  /** Mark all notifications as read */
  markAllAsRead: () => Promise<void>;
  /** Clear all notifications */
  clearAll: () => Promise<void>;
  /** Delete a single notification */
  deleteNotification: (id: string) => void;
  /** Toggle notification sound */
  toggleSound: () => void;
  /** Add a new notification (for real-time updates) */
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
}

// ===================
// SERVICE TYPES
// ===================

/**
 * Desktop/toast notification for NotificationService
 * Used for in-app toast notifications (different from push notifications)
 */
export interface ToastNotification {
  /** Unique notification ID */
  id: string;
  /** Visual type for styling */
  type: 'success' | 'info' | 'warning' | 'error';
  /** Notification title */
  title: string;
  /** Notification message */
  message: string;
  /** Timestamp of notification */
  timestamp: Date;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Whether notification persists until dismissed */
  persistent?: boolean;
  /** Whether notification has been read */
  read?: boolean;
}

/**
 * Create toast notification request
 */
export type CreateToastNotification = Omit<ToastNotification, 'id' | 'timestamp'>;

/**
 * Notification service settings
 */
export interface NotificationServiceSettings {
  /** Sound enabled for notifications */
  soundEnabled: boolean;
  /** Desktop notifications enabled */
  desktopEnabled: boolean;
  /** Total notification count */
  notificationCount: number;
  /** Unread notification count */
  unreadCount: number;
}

// ===================
// REAL-TIME EVENT TYPES
// ===================

/**
 * Real-time notification event data
 * Received from Firestore subscriptions
 */
export interface RealtimeNotificationEvent {
  /** Notification ID */
  id: string;
  /** Notification type */
  type: string;
  /** Title */
  title: string;
  /** Body/message */
  body?: string;
  /** Message (alternative to body) */
  message?: string;
  /** Additional data */
  data?: NotificationData;
  /** Creation timestamp */
  createdAt: Date | string;
  /** Channel */
  channel?: NotificationChannel;
  /** Priority */
  priority?: NotificationPriority;
  /** Whether it requires action */
  requiresAction?: boolean;
  /** Whether it's persistent */
  persistent?: boolean;
  /** Action URL */
  actionUrl?: string;
  /** Action type */
  actionType?: string;
  /** Action label */
  actionLabel?: string;
}

// ===================
// TYPE MAPPING UTILITIES
// ===================

/**
 * Map backend notification types to UI display types
 */
export const NOTIFICATION_TYPE_MAP: Record<string, NotificationType> = {
  'appointment_reminder': 'appointment',
  'appointment_confirmation': 'appointment',
  'appointment_cancelled': 'appointment',
  'appointment_rescheduled': 'appointment',
  'message_received': 'message',
  'treatment_followup': 'alert',
  'billing_reminder': 'alert',
  'payment_received': 'alert',
  'membership_renewal': 'alert',
  'marketing_promotion': 'system',
  'system_alert': 'system',
  'waitlist_offer': 'alert',
  'form_required': 'alert',
} as const;

/**
 * Default action URLs for notification types
 */
export const NOTIFICATION_ACTION_URLS: Record<NotificationType, string> = {
  // Base types
  appointment: '/calendar',
  message: '/messages',
  alert: '/dashboard',
  system: '/dashboard',
  // Specific types
  appointment_reminder: '/calendar',
  appointment_confirmation: '/calendar',
  appointment_cancelled: '/calendar',
  appointment_rescheduled: '/calendar',
  message_received: '/messages',
  treatment_followup: '/patients',
  billing_reminder: '/billing',
  payment_received: '/billing',
  membership_renewal: '/billing',
  marketing_promotion: '/dashboard',
  system_alert: '/dashboard',
  waitlist_offer: '/calendar',
  form_required: '/patients',
} as const;

// ===================
// UTILITY FUNCTIONS
// ===================

/**
 * Map backend notification type to UI display type
 */
export function mapNotificationType(type: string): NotificationType {
  return NOTIFICATION_TYPE_MAP[type] || (type as NotificationType);
}

/**
 * Get action URL for a notification type
 */
export function getNotificationActionUrl(
  type: NotificationType,
  data?: NotificationData
): string {
  // Use custom action URL from data if provided
  if (data?.actionUrl) {
    return data.actionUrl;
  }

  return NOTIFICATION_ACTION_URLS[type] || '/dashboard';
}

/**
 * Transform API notification to frontend Notification
 */
export function transformApiNotification(apiNotification: NotificationApiResponse): Notification {
  return {
    ...apiNotification,
    type: mapNotificationType(apiNotification.type),
    createdAt: new Date(apiNotification.createdAt),
    readAt: apiNotification.readAt ? new Date(apiNotification.readAt) : null,
    expiresAt: apiNotification.expiresAt ? new Date(apiNotification.expiresAt) : null,
    actionUrl: getNotificationActionUrl(
      mapNotificationType(apiNotification.type),
      apiNotification.data
    ),
  };
}

/**
 * Check if a notification is expired
 */
export function isNotificationExpired(notification: Notification): boolean {
  if (!notification.expiresAt) return false;

  const expiresAt = notification.expiresAt instanceof Date
    ? notification.expiresAt
    : new Date(notification.expiresAt);

  return expiresAt < new Date();
}

/**
 * Type guard to check if value is a valid NotificationType
 */
export function isNotificationType(value: string): value is NotificationType {
  const validTypes: NotificationType[] = [
    'appointment_reminder',
    'appointment_confirmation',
    'appointment_cancelled',
    'appointment_rescheduled',
    'message_received',
    'treatment_followup',
    'billing_reminder',
    'payment_received',
    'membership_renewal',
    'marketing_promotion',
    'system_alert',
    'waitlist_offer',
    'form_required',
    'appointment',
    'message',
    'alert',
    'system',
  ];
  return validTypes.includes(value as NotificationType);
}

/**
 * Type guard to check if value is a valid NotificationChannel
 */
export function isNotificationChannel(value: string): value is NotificationChannel {
  return ['push', 'email', 'sms', 'in_app'].includes(value);
}

/**
 * Type guard to check if value is a valid NotificationPriority
 */
export function isNotificationPriority(value: string): value is NotificationPriority {
  return ['low', 'normal', 'high', 'urgent'].includes(value);
}

// ===================
// INTERNAL STAFF NOTIFICATION TYPES
// ===================

/**
 * Internal staff notification event types
 * These are notifications sent to staff members (not patients)
 */
export type InternalNotificationEventType =
  | 'appointment_booked'
  | 'appointment_canceled'
  | 'appointment_rescheduled'
  | 'appointment_no_show'
  | 'patient_checked_in'
  | 'patient_late'
  | 'form_submitted'
  | 'waitlist_match'
  | 'waitlist_patient_added'
  | 'sale_closed'
  | 'gift_card_purchased'
  | 'membership_purchased'
  | 'payment_received'
  | 'payment_failed'
  | 'treatment_complete'
  | 'inventory_low'
  | 'online_booking'
  | 'express_booking';

/**
 * Internal notification configuration for a specific event
 */
export interface InternalNotificationConfig {
  /** Whether internal notifications are enabled for this event */
  enabled: boolean;
  /** List of email addresses to notify */
  recipients: string[];
  /** Whether to include detailed information in notification */
  includeDetails?: boolean;
  /** Custom message prefix/template */
  customMessage?: string;
}

/**
 * Internal notification data payload
 */
export interface InternalNotificationPayload {
  /** Event type */
  eventType: InternalNotificationEventType;
  /** Event timestamp */
  timestamp: Date;
  /** Patient information */
  patient?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  /** Appointment information */
  appointment?: {
    id: string;
    date: string;
    time: string;
    service?: string;
    provider?: string;
  };
  /** Staff/provider information */
  staff?: {
    id: string;
    name: string;
  };
  /** Additional context data */
  metadata?: Record<string, unknown>;
  /** Action performed by */
  performedBy?: {
    id: string;
    name: string;
    role: string;
  };
}

/**
 * Internal notification trigger context
 * Used to determine what information to include in the notification
 */
export interface InternalNotificationContext {
  /** Source of the action (online booking, staff action, system) */
  source: 'online' | 'staff' | 'system' | 'patient';
  /** Booking channel (for appointment-related events) */
  bookingChannel?: 'online_portal' | 'phone' | 'in_person' | 'express_link';
  /** Whether this is a high-priority notification */
  priority?: 'normal' | 'high' | 'urgent';
  /** Related URLs for quick actions */
  actionUrls?: {
    view?: string;
    edit?: string;
    respond?: string;
  };
}

/**
 * Complete internal notification message
 */
export interface InternalNotificationMessage {
  /** Notification ID */
  id: string;
  /** Configuration used */
  config: InternalNotificationConfig;
  /** Payload data */
  payload: InternalNotificationPayload;
  /** Context information */
  context: InternalNotificationContext;
  /** Subject line for email */
  subject: string;
  /** Body of the notification */
  body: string;
  /** HTML body for email (optional) */
  htmlBody?: string;
  /** Timestamp when notification was sent */
  sentAt?: Date;
  /** Delivery status */
  status: 'pending' | 'sent' | 'failed';
  /** Error message if failed */
  error?: string;
}
