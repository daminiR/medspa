/**
 * Shared Notification Store
 *
 * In-memory store for notifications that can be accessed by:
 * - SMS webhook (to create notifications)
 * - Notification API route (to list/read notifications)
 * - WebSocket service (for real-time updates)
 *
 * In production: This would be replaced with database operations
 */

import type {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationData,
} from '@/types/notifications'

export interface StoredNotification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: NotificationData
  read: boolean
  readAt?: string | null
  channel: NotificationChannel
  priority: NotificationPriority
  expiresAt?: string | null
  createdAt: string
}

// In-memory store (in production, use database)
const notifications: StoredNotification[] = [
  {
    id: 'notif-1',
    userId: 'staff-1',
    type: 'appointment_confirmation',
    title: 'New Appointment Booked',
    body: 'Sarah Johnson booked a Botox consultation for tomorrow at 2:00 PM',
    read: false,
    channel: 'in_app',
    priority: 'normal',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'staff-1',
    type: 'message_received',
    title: 'New Message',
    body: 'Emily Davis replied to your message about her upcoming appointment',
    read: false,
    channel: 'in_app',
    priority: 'normal',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'staff-1',
    type: 'alert',
    title: 'Low Inventory Alert',
    body: 'Botox 100U stock is running low (5 units remaining)',
    read: false,
    channel: 'in_app',
    priority: 'high',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    userId: 'staff-1',
    type: 'system',
    title: 'System Update',
    body: 'New features have been added to the scheduling system',
    read: true,
    readAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    channel: 'in_app',
    priority: 'low',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-5',
    userId: 'staff-1',
    type: 'appointment_cancelled',
    title: 'Appointment Cancelled',
    body: 'Michael Chen cancelled their appointment for Friday at 10:00 AM',
    read: true,
    readAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    channel: 'in_app',
    priority: 'normal',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

/**
 * Generate unique notification ID
 */
function generateNotificationId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create a new notification for staff dashboard
 *
 * Called by webhooks when patients send messages requiring attention
 */
export interface CreateStaffNotificationParams {
  type: 'urgent' | 'normal' | 'info'
  patientId: string
  patientPhone?: string
  message: string
  intent?: string
  suggestedActions?: string[]
  metadata?: Record<string, unknown>
}

export async function createStaffNotification(
  params: CreateStaffNotificationParams
): Promise<StoredNotification> {
  const {
    type,
    patientId,
    patientPhone,
    message,
    intent,
    suggestedActions,
    metadata,
  } = params

  // Map urgency to notification type and priority
  const notificationType: NotificationType =
    type === 'urgent' ? 'system_alert' : 'message_received'

  const priority: NotificationPriority =
    type === 'urgent' ? 'high' : 'normal'

  // Create title based on urgency
  const title = type === 'urgent'
    ? 'URGENT: Patient Message Requires Attention'
    : 'New Patient Message'

  // Create body with context
  const body = message.length > 100
    ? `${message.substring(0, 100)}...`
    : message

  const notification: StoredNotification = {
    id: generateNotificationId(),
    userId: 'staff-all', // All staff should see these
    type: notificationType,
    title,
    body,
    data: {
      patientId,
      actionUrl: `/messages?patient=${patientId}`,
      actionLabel: 'View Conversation',
      requiresAction: type === 'urgent',
      persistent: type === 'urgent',
      // Additional context
      patientPhone,
      intent,
      suggestedActions,
      ...metadata,
    },
    read: false,
    channel: 'in_app',
    priority,
    createdAt: new Date().toISOString(),
    // Urgent notifications don't expire, others expire in 24 hours
    expiresAt: type === 'urgent'
      ? null
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }

  // Add to store
  notifications.unshift(notification)

  // Keep store manageable (max 500 notifications)
  if (notifications.length > 500) {
    notifications.splice(500)
  }

  console.log('[NotificationStore] Created staff notification:', {
    id: notification.id,
    type: notification.type,
    priority: notification.priority,
    patientId,
  })

  return notification
}

/**
 * Get all notifications (for API route)
 */
export function getNotifications(): StoredNotification[] {
  return notifications
}

/**
 * Get notifications by user ID
 */
export function getNotificationsByUser(userId: string): StoredNotification[] {
  // 'staff-all' notifications are visible to all staff
  return notifications.filter(n =>
    n.userId === userId || n.userId === 'staff-all'
  )
}

/**
 * Get unread count
 */
export function getUnreadCount(userId?: string): number {
  const userNotifications = userId
    ? getNotificationsByUser(userId)
    : notifications
  return userNotifications.filter(n => !n.read).length
}

/**
 * Mark notification as read
 */
export function markAsRead(notificationId: string): boolean {
  const notification = notifications.find(n => n.id === notificationId)
  if (notification && !notification.read) {
    notification.read = true
    notification.readAt = new Date().toISOString()
    return true
  }
  return false
}

/**
 * Mark all notifications as read for a user
 */
export function markAllAsRead(userId: string): number {
  let count = 0
  const userNotifications = getNotificationsByUser(userId)
  for (const notification of userNotifications) {
    if (!notification.read) {
      notification.read = true
      notification.readAt = new Date().toISOString()
      count++
    }
  }
  return count
}

/**
 * Delete a notification
 */
export function deleteNotification(notificationId: string): boolean {
  const index = notifications.findIndex(n => n.id === notificationId)
  if (index !== -1) {
    notifications.splice(index, 1)
    return true
  }
  return false
}

/**
 * Create notification for waitlist status change
 */
export async function createWaitlistNotification(params: {
  patientId: string
  patientName: string
  patientPhone: string
  action: 'accepted' | 'declined' | 'expired' | 'no_response'
  appointmentTime?: string
}): Promise<StoredNotification> {
  const { patientId, patientName, patientPhone, action, appointmentTime } = params

  const messages: Record<typeof action, string> = {
    accepted: `${patientName} accepted the waitlist slot${appointmentTime ? ` for ${appointmentTime}` : ''}`,
    declined: `${patientName} declined the waitlist offer`,
    expired: `Waitlist offer to ${patientName} expired with no response`,
    no_response: `${patientName} did not respond to waitlist offer`,
  }

  const priorities: Record<typeof action, NotificationPriority> = {
    accepted: 'high',
    declined: 'normal',
    expired: 'normal',
    no_response: 'normal',
  }

  const notification: StoredNotification = {
    id: generateNotificationId(),
    userId: 'staff-all',
    type: 'waitlist_offer',
    title: 'Waitlist Update',
    body: messages[action],
    data: {
      patientId,
      patientName,
      patientPhone,
      actionUrl: `/calendar?patient=${patientId}`,
      actionLabel: 'View Calendar',
    },
    read: false,
    channel: 'in_app',
    priority: priorities[action],
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }

  notifications.unshift(notification)
  console.log('[NotificationStore] Created waitlist notification:', notification.id)
  return notification
}

/**
 * Create notification for check-in with form status
 */
export async function createCheckInNotification(params: {
  patientId: string
  patientName: string
  appointmentTime: string
  hasIncompleteForms: boolean
  incompleteForms?: string[]
}): Promise<StoredNotification> {
  const { patientId, patientName, appointmentTime, hasIncompleteForms, incompleteForms } = params

  const body = hasIncompleteForms
    ? `${patientName} checked in for ${appointmentTime} with incomplete forms: ${incompleteForms?.join(', ')}`
    : `${patientName} checked in for ${appointmentTime} - all forms complete`

  const notification: StoredNotification = {
    id: generateNotificationId(),
    userId: 'staff-all',
    type: hasIncompleteForms ? 'form_required' : 'appointment_confirmation',
    title: hasIncompleteForms ? 'Patient Checked In (Forms Incomplete)' : 'Patient Checked In',
    body,
    data: {
      patientId,
      patientName,
      actionUrl: hasIncompleteForms ? `/messages?patient=${patientId}` : `/waiting-room`,
      actionLabel: hasIncompleteForms ? 'View Forms Status' : 'View Waiting Room',
      requiresAction: hasIncompleteForms,
    },
    read: false,
    channel: 'in_app',
    priority: hasIncompleteForms ? 'high' : 'normal',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
  }

  notifications.unshift(notification)
  console.log('[NotificationStore] Created check-in notification:', notification.id)
  return notification
}
