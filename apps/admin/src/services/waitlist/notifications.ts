/**
 * =============================================================================
 * WAITLIST NOTIFICATION SERVICE
 * =============================================================================
 * Comprehensive notification system for the waitlist management feature.
 * Handles patient notifications (SMS/email) and internal staff alerts.
 *
 * Features:
 * - Added to waitlist confirmation
 * - Opening available notifications with secure token links
 * - Auto-offer management with expiration tracking
 * - Accept/decline tracking and response logging
 * - Internal staff notifications for critical events
 * - SMS compliance and audit logging
 * - Rate limiting and deduplication
 * =============================================================================
 */

import moment from 'moment'
import { sendSMS, formatPhoneNumber, sendWaitlistAddedSMS, sendWaitlistOfferAcceptedSMS, sendWaitlistOfferExpiredSMS, sendWaitlistOfferDeclinedSMS, sendWaitlistReminderSMS, smsTemplates, logSMSForCompliance } from '@/lib/twilio'
import { WaitlistOffer, WaitlistEntry, generateOfferToken, buildOfferUrl } from '@/lib/waitlist'
import type { Patient } from '@/lib/data'

// =============================================================================
// TYPES
// =============================================================================

export interface WaitlistNotificationPayload {
  entryId: string
  patientId: string
  patientName: string
  patientPhone: string
  patientEmail?: string
  serviceName: string
  practitionerName?: string
  practitionerId?: string
}

export interface WaitlistOfferNotificationPayload extends WaitlistNotificationPayload {
  appointmentDate: Date
  appointmentTime: string
  appointmentEndTime?: string
  offerToken: string
  expiryMinutes: number
  appointmentId?: string
  slotId?: string
}

export interface NotificationResult {
  success: boolean
  type: 'sms' | 'email' | 'both' | 'internal'
  messageId?: string
  sentAt: Date
  recipientPhone?: string
  recipientEmail?: string
  error?: string
}

export interface NotificationEvent {
  id: string
  type: 'added' | 'offer_sent' | 'offer_accepted' | 'offer_declined' | 'offer_expired' | 'reminder'
  entryId: string
  patientId: string
  patientName: string
  timestamp: Date
  channel: 'sms' | 'email' | 'internal'
  messageContent: string
  status: 'sent' | 'failed' | 'pending'
  metadata?: Record<string, any>
}

export interface InternalStaffNotification {
  type: 'waitlist_match' | 'offer_acceptance' | 'offer_decline' | 'offer_expiration'
  title: string
  message: string
  patientName: string
  serviceName: string
  priority: 'low' | 'medium' | 'high'
  timestamp: Date
  metadata?: Record<string, any>
}

export interface WaitlistNotificationSettings {
  domain: string
  smsEnabled: boolean
  emailEnabled: boolean
  internalNotificationsEnabled: boolean
  expiryMinutes: number
  reminderIntervalDays: number
}

// =============================================================================
// IN-MEMORY STORES (Replace with database in production)
// =============================================================================

const notificationHistory: Map<string, NotificationEvent> = new Map()
const offerTokenToEventId: Map<string, string> = new Map()
const entryNotificationLog: Map<string, NotificationEvent[]> = new Map()
const staffNotificationLog: NotificationEvent[] = []
const rateLimitStore: Map<string, { count: number; resetAt: Date }> = new Map()

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate unique notification event ID
 */
function generateNotificationEventId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 9)
  return `notif_${timestamp}_${random}`
}

/**
 * Check rate limit for a patient
 */
function checkRateLimit(key: string, maxPerHour: number = 5): boolean {
  const now = new Date()
  const limit = rateLimitStore.get(key)

  if (!limit || now >= limit.resetAt) {
    rateLimitStore.set(key, { count: 0, resetAt: new Date(now.getTime() + 60 * 60 * 1000) })
    return true
  }

  if (limit.count >= maxPerHour) {
    return false
  }

  limit.count++
  return true
}

/**
 * Get all notifications for a waitlist entry
 */
export function getNotificationsForEntry(entryId: string): NotificationEvent[] {
  return entryNotificationLog.get(entryId) || []
}

/**
 * Get staff notification log
 */
export function getStaffNotificationLog(limit: number = 50): NotificationEvent[] {
  return staffNotificationLog.slice(-limit)
}

// =============================================================================
// PATIENT NOTIFICATIONS
// =============================================================================

/**
 * Send confirmation SMS when patient is added to waitlist
 *
 * @param payload Patient and service information
 * @returns Notification result with status
 */
export async function notifyPatientAddedToWaitlist(
  payload: WaitlistNotificationPayload
): Promise<NotificationResult> {
  const eventId = generateNotificationEventId()

  console.log(`[Waitlist Notification] Sending added-to-waitlist SMS to ${payload.patientName} (${payload.patientPhone})`)

  try {
    const message = smsTemplates.waitlistAdded(
      payload.patientName,
      payload.serviceName,
      payload.practitionerName
    )

    const result = await sendSMS(formatPhoneNumber(payload.patientPhone), message)

    const notificationEvent: NotificationEvent = {
      id: eventId,
      type: 'added',
      entryId: payload.entryId,
      patientId: payload.patientId,
      patientName: payload.patientName,
      timestamp: new Date(),
      channel: 'sms',
      messageContent: message,
      status: result.success ? 'sent' : 'failed',
      metadata: {
        serviceName: payload.serviceName,
        practitionerName: payload.practitionerName,
        twilioSid: result.messageId,
      },
    }

    // Store notification event
    notificationHistory.set(eventId, notificationEvent)
    const entryLog = entryNotificationLog.get(payload.entryId) || []
    entryLog.push(notificationEvent)
    entryNotificationLog.set(payload.entryId, entryLog)

    await logSMSForCompliance(
      payload.patientPhone,
      message,
      'outbound',
      'waitlist_added',
      result.messageId
    )

    console.log(`[Waitlist Notification] Added-to-waitlist notification sent (${eventId})`)

    return {
      success: result.success,
      type: 'sms',
      messageId: result.messageId,
      sentAt: new Date(),
      recipientPhone: payload.patientPhone,
      error: result.error,
    }
  } catch (error: any) {
    console.error(`[Waitlist Notification] Error sending added-to-waitlist SMS:`, error)
    return {
      success: false,
      type: 'sms',
      sentAt: new Date(),
      recipientPhone: payload.patientPhone,
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * Send offer notification when a slot becomes available
 *
 * @param payload Offer and appointment details
 * @returns Notification result with offer token and link
 */
export async function notifyOfferingAvailableSlot(
  payload: WaitlistOfferNotificationPayload
): Promise<NotificationResult & { offerToken?: string; offerLink?: string }> {
  const eventId = generateNotificationEventId()

  // Check rate limit (max 3 offers per hour to same patient)
  if (!checkRateLimit(`offer_${payload.patientPhone}`, 3)) {
    console.warn(`[Waitlist Notification] Rate limit exceeded for offers to ${payload.patientName}`)
    return {
      success: false,
      type: 'sms',
      sentAt: new Date(),
      recipientPhone: payload.patientPhone,
      error: 'Rate limit exceeded - too many offers sent in the last hour',
    }
  }

  console.log(`[Waitlist Notification] Sending offer SMS to ${payload.patientName} for ${payload.serviceName} on ${moment(payload.appointmentDate).format('MMM D')}`)

  try {
    const dateStr = moment(payload.appointmentDate).format('ddd, MMM D')
    const timeStr = payload.appointmentTime

    // Build offer link with secure token
    const offerToken = payload.offerToken
    const baseUrl = 'https://app.medspa.local' // In production, use settings.domain
    const offerLink = buildOfferUrl(baseUrl, offerToken)

    const message = smsTemplates.waitlistSlotAvailable(
      payload.patientName,
      payload.serviceName,
      payload.practitionerName || 'our team',
      dateStr,
      timeStr,
      `${payload.expiryMinutes}`,
      offerLink
    )

    const result = await sendSMS(formatPhoneNumber(payload.patientPhone), message)

    const notificationEvent: NotificationEvent = {
      id: eventId,
      type: 'offer_sent',
      entryId: payload.entryId,
      patientId: payload.patientId,
      patientName: payload.patientName,
      timestamp: new Date(),
      channel: 'sms',
      messageContent: message,
      status: result.success ? 'sent' : 'failed',
      metadata: {
        serviceName: payload.serviceName,
        appointmentDate: payload.appointmentDate.toISOString(),
        appointmentTime: timeStr,
        expiryMinutes: payload.expiryMinutes,
        offerToken,
        twilioSid: result.messageId,
        appointmentId: payload.appointmentId,
      },
    }

    // Store notification event and token mapping
    notificationHistory.set(eventId, notificationEvent)
    offerTokenToEventId.set(offerToken, eventId)
    const entryLog = entryNotificationLog.get(payload.entryId) || []
    entryLog.push(notificationEvent)
    entryNotificationLog.set(payload.entryId, entryLog)

    await logSMSForCompliance(
      payload.patientPhone,
      message,
      'outbound',
      'waitlist_offer',
      result.messageId
    )

    console.log(`[Waitlist Notification] Offer sent (event: ${eventId}, token: ${offerToken})`)

    // Notify staff about offer sent
    await notifyStaffOfOfferSent(payload)

    return {
      success: result.success,
      type: 'sms',
      messageId: result.messageId,
      sentAt: new Date(),
      recipientPhone: payload.patientPhone,
      offerToken,
      offerLink,
      error: result.error,
    }
  } catch (error: any) {
    console.error(`[Waitlist Notification] Error sending offer SMS:`, error)
    return {
      success: false,
      type: 'sms',
      sentAt: new Date(),
      recipientPhone: payload.patientPhone,
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * Send confirmation when patient accepts an offer
 */
export async function notifyOfferAccepted(
  payload: WaitlistNotificationPayload & { appointmentDate: Date; appointmentTime: string }
): Promise<NotificationResult> {
  const eventId = generateNotificationEventId()

  console.log(`[Waitlist Notification] Sending offer-accepted confirmation to ${payload.patientName}`)

  try {
    const dateStr = moment(payload.appointmentDate).format('ddd, MMM D')
    const calendarLink = 'https://app.medspa.local/calendar/add' // In production, use dynamic link

    const message = smsTemplates.waitlistOfferAccepted(
      payload.patientName,
      payload.serviceName,
      dateStr,
      payload.appointmentTime,
      calendarLink
    )

    const result = await sendSMS(formatPhoneNumber(payload.patientPhone), message)

    const notificationEvent: NotificationEvent = {
      id: eventId,
      type: 'offer_accepted',
      entryId: payload.entryId,
      patientId: payload.patientId,
      patientName: payload.patientName,
      timestamp: new Date(),
      channel: 'sms',
      messageContent: message,
      status: result.success ? 'sent' : 'failed',
      metadata: {
        serviceName: payload.serviceName,
        appointmentDate: payload.appointmentDate.toISOString(),
        appointmentTime: payload.appointmentTime,
        twilioSid: result.messageId,
      },
    }

    notificationHistory.set(eventId, notificationEvent)
    const entryLog = entryNotificationLog.get(payload.entryId) || []
    entryLog.push(notificationEvent)
    entryNotificationLog.set(payload.entryId, entryLog)

    await logSMSForCompliance(
      payload.patientPhone,
      message,
      'outbound',
      'waitlist_offer_accepted',
      result.messageId
    )

    console.log(`[Waitlist Notification] Offer-accepted confirmation sent (${eventId})`)

    // Notify staff about acceptance
    await notifyStaffOfOfferAccepted(payload)

    return {
      success: result.success,
      type: 'sms',
      messageId: result.messageId,
      sentAt: new Date(),
      recipientPhone: payload.patientPhone,
      error: result.error,
    }
  } catch (error: any) {
    console.error(`[Waitlist Notification] Error sending offer-accepted SMS:`, error)
    return {
      success: false,
      type: 'sms',
      sentAt: new Date(),
      recipientPhone: payload.patientPhone,
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * Send notification when patient declines an offer
 */
export async function notifyOfferDeclined(
  payload: WaitlistNotificationPayload
): Promise<NotificationResult> {
  const eventId = generateNotificationEventId()

  console.log(`[Waitlist Notification] Sending offer-declined notification to ${payload.patientName}`)

  try {
    const message = smsTemplates.waitlistOfferDeclined(payload.patientName, payload.serviceName)

    const result = await sendSMS(formatPhoneNumber(payload.patientPhone), message)

    const notificationEvent: NotificationEvent = {
      id: eventId,
      type: 'offer_declined',
      entryId: payload.entryId,
      patientId: payload.patientId,
      patientName: payload.patientName,
      timestamp: new Date(),
      channel: 'sms',
      messageContent: message,
      status: result.success ? 'sent' : 'failed',
      metadata: {
        serviceName: payload.serviceName,
        twilioSid: result.messageId,
      },
    }

    notificationHistory.set(eventId, notificationEvent)
    const entryLog = entryNotificationLog.get(payload.entryId) || []
    entryLog.push(notificationEvent)
    entryNotificationLog.set(payload.entryId, entryLog)

    await logSMSForCompliance(
      payload.patientPhone,
      message,
      'outbound',
      'waitlist_offer_declined',
      result.messageId
    )

    console.log(`[Waitlist Notification] Offer-declined notification sent (${eventId})`)

    // Notify staff about decline
    await notifyStaffOfOfferDeclined(payload)

    return {
      success: result.success,
      type: 'sms',
      messageId: result.messageId,
      sentAt: new Date(),
      recipientPhone: payload.patientPhone,
      error: result.error,
    }
  } catch (error: any) {
    console.error(`[Waitlist Notification] Error sending offer-declined SMS:`, error)
    return {
      success: false,
      type: 'sms',
      sentAt: new Date(),
      recipientPhone: payload.patientPhone,
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * Send notification when offer expires
 */
export async function notifyOfferExpired(
  payload: WaitlistNotificationPayload
): Promise<NotificationResult> {
  const eventId = generateNotificationEventId()

  console.log(`[Waitlist Notification] Sending offer-expired notification to ${payload.patientName}`)

  try {
    const message = smsTemplates.waitlistOfferExpired(payload.patientName, payload.serviceName)

    const result = await sendSMS(formatPhoneNumber(payload.patientPhone), message)

    const notificationEvent: NotificationEvent = {
      id: eventId,
      type: 'offer_expired',
      entryId: payload.entryId,
      patientId: payload.patientId,
      patientName: payload.patientName,
      timestamp: new Date(),
      channel: 'sms',
      messageContent: message,
      status: result.success ? 'sent' : 'failed',
      metadata: {
        serviceName: payload.serviceName,
        twilioSid: result.messageId,
      },
    }

    notificationHistory.set(eventId, notificationEvent)
    const entryLog = entryNotificationLog.get(payload.entryId) || []
    entryLog.push(notificationEvent)
    entryNotificationLog.set(payload.entryId, entryLog)

    await logSMSForCompliance(
      payload.patientPhone,
      message,
      'outbound',
      'waitlist_offer_expired',
      result.messageId
    )

    console.log(`[Waitlist Notification] Offer-expired notification sent (${eventId})`)

    return {
      success: result.success,
      type: 'sms',
      messageId: result.messageId,
      sentAt: new Date(),
      recipientPhone: payload.patientPhone,
      error: result.error,
    }
  } catch (error: any) {
    console.error(`[Waitlist Notification] Error sending offer-expired SMS:`, error)
    return {
      success: false,
      type: 'sms',
      sentAt: new Date(),
      recipientPhone: payload.patientPhone,
      error: error.message || 'Unknown error',
    }
  }
}

/**
 * Send periodic reminder to patients on waitlist
 */
export async function sendWaitlistReminder(
  payload: WaitlistNotificationPayload & { daysWaiting: number }
): Promise<NotificationResult> {
  const eventId = generateNotificationEventId()

  console.log(`[Waitlist Notification] Sending reminder to ${payload.patientName} (waiting ${payload.daysWaiting} days)`)

  try {
    const message = smsTemplates.waitlistReminder(
      payload.patientName,
      payload.serviceName,
      payload.daysWaiting
    )

    const result = await sendSMS(formatPhoneNumber(payload.patientPhone), message)

    const notificationEvent: NotificationEvent = {
      id: eventId,
      type: 'reminder',
      entryId: payload.entryId,
      patientId: payload.patientId,
      patientName: payload.patientName,
      timestamp: new Date(),
      channel: 'sms',
      messageContent: message,
      status: result.success ? 'sent' : 'failed',
      metadata: {
        serviceName: payload.serviceName,
        daysWaiting: payload.daysWaiting,
        twilioSid: result.messageId,
      },
    }

    notificationHistory.set(eventId, notificationEvent)
    const entryLog = entryNotificationLog.get(payload.entryId) || []
    entryLog.push(notificationEvent)
    entryNotificationLog.set(payload.entryId, entryLog)

    await logSMSForCompliance(
      payload.patientPhone,
      message,
      'outbound',
      'waitlist_reminder',
      result.messageId
    )

    console.log(`[Waitlist Notification] Reminder sent (${eventId})`)

    return {
      success: result.success,
      type: 'sms',
      messageId: result.messageId,
      sentAt: new Date(),
      recipientPhone: payload.patientPhone,
      error: result.error,
    }
  } catch (error: any) {
    console.error(`[Waitlist Notification] Error sending reminder SMS:`, error)
    return {
      success: false,
      type: 'sms',
      sentAt: new Date(),
      recipientPhone: payload.patientPhone,
      error: error.message || 'Unknown error',
    }
  }
}

// =============================================================================
// INTERNAL STAFF NOTIFICATIONS
// =============================================================================

/**
 * Notify staff about new waitlist match and offer sent
 */
async function notifyStaffOfOfferSent(
  payload: WaitlistOfferNotificationPayload
): Promise<void> {
  const notification: InternalStaffNotification = {
    type: 'waitlist_match',
    title: `Waitlist Match - ${payload.serviceName}`,
    message: `An opening has been offered to ${payload.patientName} for ${payload.serviceName}${payload.practitionerName ? ` with ${payload.practitionerName}` : ''} on ${moment(payload.appointmentDate).format('MMM D')} at ${payload.appointmentTime}. Offer expires in ${payload.expiryMinutes} minutes.`,
    patientName: payload.patientName,
    serviceName: payload.serviceName,
    priority: 'high',
    timestamp: new Date(),
    metadata: {
      entryId: payload.entryId,
      patientId: payload.patientId,
      appointmentDate: payload.appointmentDate.toISOString(),
      expiryMinutes: payload.expiryMinutes,
    },
  }

  console.log(`[Waitlist Notification] Staff notification: ${notification.message}`)
  staffNotificationLog.push({
    id: generateNotificationEventId(),
    type: 'offer_sent',
    entryId: payload.entryId,
    patientId: payload.patientId,
    patientName: payload.patientName,
    timestamp: new Date(),
    channel: 'internal',
    messageContent: notification.message,
    status: 'sent',
    metadata: notification.metadata,
  })
}

/**
 * Notify staff when offer is accepted
 */
async function notifyStaffOfOfferAccepted(
  payload: WaitlistNotificationPayload & { appointmentDate: Date; appointmentTime: string }
): Promise<void> {
  const notification: InternalStaffNotification = {
    type: 'offer_acceptance',
    title: `Waitlist Offer Accepted - ${payload.serviceName}`,
    message: `${payload.patientName} has accepted the offer for ${payload.serviceName} on ${moment(payload.appointmentDate).format('MMM D')} at ${payload.appointmentTime}. Appointment is now confirmed.`,
    patientName: payload.patientName,
    serviceName: payload.serviceName,
    priority: 'high',
    timestamp: new Date(),
    metadata: {
      entryId: payload.entryId,
      patientId: payload.patientId,
      appointmentDate: payload.appointmentDate.toISOString(),
      appointmentTime: payload.appointmentTime,
    },
  }

  console.log(`[Waitlist Notification] Staff notification: ${notification.message}`)
  staffNotificationLog.push({
    id: generateNotificationEventId(),
    type: 'offer_accepted',
    entryId: payload.entryId,
    patientId: payload.patientId,
    patientName: payload.patientName,
    timestamp: new Date(),
    channel: 'internal',
    messageContent: notification.message,
    status: 'sent',
    metadata: notification.metadata,
  })
}

/**
 * Notify staff when offer is declined
 */
async function notifyStaffOfOfferDeclined(
  payload: WaitlistNotificationPayload
): Promise<void> {
  const notification: InternalStaffNotification = {
    type: 'offer_decline',
    title: `Waitlist Offer Declined - ${payload.serviceName}`,
    message: `${payload.patientName} has declined the offer for ${payload.serviceName}. Offer should cascade to next eligible patient.`,
    patientName: payload.patientName,
    serviceName: payload.serviceName,
    priority: 'medium',
    timestamp: new Date(),
    metadata: {
      entryId: payload.entryId,
      patientId: payload.patientId,
    },
  }

  console.log(`[Waitlist Notification] Staff notification: ${notification.message}`)
  staffNotificationLog.push({
    id: generateNotificationEventId(),
    type: 'offer_declined',
    entryId: payload.entryId,
    patientId: payload.patientId,
    patientName: payload.patientName,
    timestamp: new Date(),
    channel: 'internal',
    messageContent: notification.message,
    status: 'sent',
    metadata: notification.metadata,
  })
}

// =============================================================================
// EXPORTS FOR TESTING & DEBUGGING
// =============================================================================

export function getNotificationHistory(limit: number = 100): NotificationEvent[] {
  return Array.from(notificationHistory.values()).slice(-limit)
}

export function clearNotificationHistory(): void {
  notificationHistory.clear()
  offerTokenToEventId.clear()
  entryNotificationLog.clear()
  staffNotificationLog.length = 0
  console.log('[Waitlist Notification] Cleared all notification history')
}

export function getNotificationStats(): {
  totalNotifications: number
  bySent: number
  byFailed: number
  byType: Record<string, number>
  staffNotificationsCount: number
} {
  const events = Array.from(notificationHistory.values())
  const stats = {
    totalNotifications: events.length,
    bySent: events.filter(e => e.status === 'sent').length,
    byFailed: events.filter(e => e.status === 'failed').length,
    byType: {
      added: events.filter(e => e.type === 'added').length,
      offer_sent: events.filter(e => e.type === 'offer_sent').length,
      offer_accepted: events.filter(e => e.type === 'offer_accepted').length,
      offer_declined: events.filter(e => e.type === 'offer_declined').length,
      offer_expired: events.filter(e => e.type === 'offer_expired').length,
      reminder: events.filter(e => e.type === 'reminder').length,
    },
    staffNotificationsCount: staffNotificationLog.length,
  }

  return stats
}
