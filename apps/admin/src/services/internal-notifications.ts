/**
 * Internal Staff Notification Service
 *
 * This service manages notifications sent to internal staff members (not patients).
 * In a production environment, this would integrate with an email service or messaging platform.
 * For now, it provides comprehensive logging and toast notifications for debugging/development.
 */

import { notificationService } from './notifications'
import type {
  InternalNotificationConfig,
  InternalNotificationEventType,
  InternalNotificationPayload,
  InternalNotificationContext,
  InternalNotificationMessage,
} from '@/types/notifications'

/**
 * Internal Notification Service Class
 */
class InternalNotificationService {
  private notificationConfigs: Map<InternalNotificationEventType, InternalNotificationConfig> = new Map()
  private notificationHistory: InternalNotificationMessage[] = []
  private enabled: boolean = true

  constructor() {
    // Initialize with default configurations
    this.initializeDefaultConfigs()
  }

  /**
   * Initialize default notification configurations
   */
  private initializeDefaultConfigs() {
    // Default recipients for various events
    const defaultRecipients = ['admin@luxemedicalspa.com', 'frontdesk@luxemedicalspa.com']

    // Appointment events
    this.notificationConfigs.set('appointment_booked', {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: true,
    })

    this.notificationConfigs.set('appointment_canceled', {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: true,
    })

    this.notificationConfigs.set('online_booking', {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: true,
      customMessage: 'A patient has booked an appointment online',
    })

    // Waitlist events
    this.notificationConfigs.set('waitlist_match', {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: true,
    })

    this.notificationConfigs.set('waitlist_patient_added', {
      enabled: false,
      recipients: defaultRecipients,
      includeDetails: true,
    })

    // Check-in events
    this.notificationConfigs.set('patient_checked_in', {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: false,
    })

    // Form events
    this.notificationConfigs.set('form_submitted', {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: true,
    })

    // Sale events
    this.notificationConfigs.set('sale_closed', {
      enabled: true,
      recipients: [...defaultRecipients, 'billing@luxemedicalspa.com'],
      includeDetails: true,
    })

    this.notificationConfigs.set('gift_card_purchased', {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: true,
    })

    this.notificationConfigs.set('membership_purchased', {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: true,
    })
  }

  /**
   * Set notification configuration for an event type
   */
  setConfig(eventType: InternalNotificationEventType, config: InternalNotificationConfig) {
    this.notificationConfigs.set(eventType, config)
    console.log(`[Internal Notifications] Configuration updated for ${eventType}:`, config)
  }

  /**
   * Get notification configuration for an event type
   */
  getConfig(eventType: InternalNotificationEventType): InternalNotificationConfig | undefined {
    return this.notificationConfigs.get(eventType)
  }

  /**
   * Enable or disable the notification service globally
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled
    console.log(`[Internal Notifications] Service ${enabled ? 'enabled' : 'disabled'}`)
  }

  /**
   * Send an internal staff notification
   */
  async sendNotification(
    payload: InternalNotificationPayload,
    context: InternalNotificationContext
  ): Promise<InternalNotificationMessage | null> {
    // Check if service is enabled
    if (!this.enabled) {
      console.log('[Internal Notifications] Service disabled, skipping notification')
      return null
    }

    // Get configuration for this event type
    const config = this.notificationConfigs.get(payload.eventType)

    // Check if notifications are enabled for this event type
    if (!config || !config.enabled || config.recipients.length === 0) {
      console.log(`[Internal Notifications] Notifications disabled for ${payload.eventType}`)
      return null
    }

    // Generate notification message
    const notification = this.generateNotificationMessage(payload, context, config)

    // Log the notification (in production, this would send actual emails)
    this.logNotification(notification)

    // Show toast notification in the UI
    this.showToastNotification(notification)

    // Add to history
    this.notificationHistory.unshift(notification)
    if (this.notificationHistory.length > 100) {
      this.notificationHistory = this.notificationHistory.slice(0, 100)
    }

    // Mark as sent
    notification.status = 'sent'
    notification.sentAt = new Date()

    return notification
  }

  /**
   * Generate a notification message from payload and context
   */
  private generateNotificationMessage(
    payload: InternalNotificationPayload,
    context: InternalNotificationContext,
    config: InternalNotificationConfig
  ): InternalNotificationMessage {
    const id = `internal-notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Generate subject line
    const subject = this.generateSubject(payload, context)

    // Generate body
    const body = this.generateBody(payload, context, config)

    // Generate HTML body
    const htmlBody = this.generateHtmlBody(payload, context, config)

    return {
      id,
      config,
      payload,
      context,
      subject,
      body,
      htmlBody,
      status: 'pending',
    }
  }

  /**
   * Generate email subject line
   */
  private generateSubject(
    payload: InternalNotificationPayload,
    context: InternalNotificationContext
  ): string {
    const eventLabels: Record<InternalNotificationEventType, string> = {
      appointment_booked: 'New Appointment Booked',
      appointment_canceled: 'Appointment Canceled',
      appointment_rescheduled: 'Appointment Rescheduled',
      appointment_no_show: 'Patient No-Show',
      patient_checked_in: 'Patient Checked In',
      patient_late: 'Patient Running Late',
      form_submitted: 'Patient Form Submitted',
      waitlist_match: 'Waitlist Match Found',
      waitlist_patient_added: 'Patient Added to Waitlist',
      sale_closed: 'Sale Completed',
      gift_card_purchased: 'Gift Card Purchased',
      membership_purchased: 'Membership Purchased',
      payment_received: 'Payment Received',
      payment_failed: 'Payment Failed',
      treatment_complete: 'Treatment Complete',
      inventory_low: 'Low Inventory Alert',
      online_booking: 'Online Booking',
      express_booking: 'Express Booking Completed',
    }

    const label = eventLabels[payload.eventType] || 'Staff Notification'
    const patientName = payload.patient?.name ? ` - ${payload.patient.name}` : ''

    return `${label}${patientName}`
  }

  /**
   * Generate email body (plain text)
   */
  private generateBody(
    payload: InternalNotificationPayload,
    context: InternalNotificationContext,
    config: InternalNotificationConfig
  ): string {
    let body = config.customMessage || `A ${payload.eventType.replace(/_/g, ' ')} event occurred.\n\n`

    // Add patient information
    if (payload.patient) {
      body += `Patient: ${payload.patient.name}\n`
      if (payload.patient.phone) body += `Phone: ${payload.patient.phone}\n`
      if (payload.patient.email) body += `Email: ${payload.patient.email}\n`
      body += '\n'
    }

    // Add appointment information
    if (payload.appointment) {
      body += `Appointment Details:\n`
      body += `Date: ${payload.appointment.date}\n`
      body += `Time: ${payload.appointment.time}\n`
      if (payload.appointment.service) body += `Service: ${payload.appointment.service}\n`
      if (payload.appointment.provider) body += `Provider: ${payload.appointment.provider}\n`
      body += '\n'
    }

    // Add context information
    body += `Source: ${context.source}\n`
    if (context.bookingChannel) {
      body += `Channel: ${context.bookingChannel.replace(/_/g, ' ')}\n`
    }
    if (context.priority && context.priority !== 'normal') {
      body += `Priority: ${context.priority.toUpperCase()}\n`
    }

    // Add action performed by
    if (payload.performedBy) {
      body += `\nPerformed by: ${payload.performedBy.name} (${payload.performedBy.role})\n`
    }

    // Add action links
    if (config.includeDetails && context.actionUrls) {
      body += '\nQuick Actions:\n'
      if (context.actionUrls.view) body += `View: ${context.actionUrls.view}\n`
      if (context.actionUrls.edit) body += `Edit: ${context.actionUrls.edit}\n`
      if (context.actionUrls.respond) body += `Respond: ${context.actionUrls.respond}\n`
    }

    body += `\nTimestamp: ${payload.timestamp.toLocaleString()}\n`

    return body
  }

  /**
   * Generate HTML email body
   */
  private generateHtmlBody(
    payload: InternalNotificationPayload,
    context: InternalNotificationContext,
    config: InternalNotificationConfig
  ): string {
    const body = this.generateBody(payload, context, config)

    // Simple HTML formatting (in production, use proper email templates)
    return `
      <html>
        <body style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #7c3aed;">${this.generateSubject(payload, context)}</h2>
            <pre style="white-space: pre-wrap; background: #f3f4f6; padding: 15px; border-radius: 8px;">
${body}
            </pre>
          </div>
        </body>
      </html>
    `
  }

  /**
   * Log notification to console (in production, this would send actual emails)
   */
  private logNotification(notification: InternalNotificationMessage) {
    console.group(`[Internal Notification] ${notification.payload.eventType}`)
    console.log('Subject:', notification.subject)
    console.log('Recipients:', notification.config.recipients.join(', '))
    console.log('Body:', notification.body)
    console.log('Context:', notification.context)
    console.log('Payload:', notification.payload)
    console.groupEnd()
  }

  /**
   * Show toast notification in the UI
   */
  private showToastNotification(notification: InternalNotificationMessage) {
    const { payload, context, config } = notification

    // Determine toast type based on priority
    const toastType = context.priority === 'urgent' ? 'warning' : 'info'

    // Create short message for toast
    let message = ''
    if (payload.patient) {
      message = `Internal notification sent to ${config.recipients.length} recipient${config.recipients.length !== 1 ? 's' : ''}`
    } else {
      message = `Internal notification sent`
    }

    // Show toast
    notificationService.notify({
      type: toastType,
      title: `Staff Notified: ${this.generateSubject(payload, context)}`,
      message,
      persistent: false,
    })
  }

  /**
   * Get notification history
   */
  getHistory(limit: number = 50): InternalNotificationMessage[] {
    return this.notificationHistory.slice(0, limit)
  }

  /**
   * Clear notification history
   */
  clearHistory() {
    this.notificationHistory = []
    console.log('[Internal Notifications] History cleared')
  }

  /**
   * Get statistics
   */
  getStats() {
    const total = this.notificationHistory.length
    const sent = this.notificationHistory.filter(n => n.status === 'sent').length
    const failed = this.notificationHistory.filter(n => n.status === 'failed').length
    const pending = this.notificationHistory.filter(n => n.status === 'pending').length

    const byEventType: Record<string, number> = {}
    this.notificationHistory.forEach(n => {
      const type = n.payload.eventType
      byEventType[type] = (byEventType[type] || 0) + 1
    })

    return {
      total,
      sent,
      failed,
      pending,
      byEventType,
      enabled: this.enabled,
      configuredEvents: Array.from(this.notificationConfigs.keys()).filter(
        key => this.notificationConfigs.get(key)?.enabled
      ),
    }
  }
}

// Export singleton instance
export const internalNotificationService = new InternalNotificationService()

// Export helper function for common use cases
export async function notifyStaff(
  eventType: InternalNotificationEventType,
  payload: Partial<InternalNotificationPayload>,
  context?: Partial<InternalNotificationContext>
) {
  return internalNotificationService.sendNotification(
    {
      eventType,
      timestamp: new Date(),
      ...payload,
    } as InternalNotificationPayload,
    {
      source: 'system',
      priority: 'normal',
      ...context,
    } as InternalNotificationContext
  )
}
