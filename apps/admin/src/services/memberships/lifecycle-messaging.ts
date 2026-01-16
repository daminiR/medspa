/**
 * Membership Lifecycle Messaging Service
 *
 * Manages automated messages for all stages of membership lifecycle:
 * - Membership started confirmation
 * - Pre-renewal reminders (configurable days before)
 * - Renewal success confirmation
 * - Cancellation confirmation
 * - Payment failed notifications
 *
 * DEBUG: Comprehensive logging at each step for development/troubleshooting
 */

import { messagingService } from '../messaging/core'
import { generateMessage, MessageTemplate, replaceVariables } from '../messaging/templates'
import type { Membership } from '@/types/billing'

/**
 * Membership lifecycle message types
 */
export type MembershipMessageType =
  | 'membership_started'
  | 'pre_renewal_reminder'
  | 'renewal_success'
  | 'renewal_failed'
  | 'membership_canceled'

/**
 * Membership context for message generation
 */
export interface MembershipMessageContext {
  // Member information
  memberId: string
  patientId: string
  patientName: string
  patientFirstName: string
  patientEmail: string
  patientPhone: string

  // Membership information
  membershipId: string
  membershipName: string
  membershipTier: 'silver' | 'gold' | 'platinum' | 'vip'
  monthlyPrice: number
  renewalAmount?: number
  billingCycle: 'monthly' | 'quarterly' | 'semi-annual' | 'annual'

  // Dates
  startDate: Date
  nextRenewalDate: Date
  cancellationDate?: Date
  expirationDate?: Date

  // Payment information
  paymentMethodLast4?: string
  paymentMethodBrand?: string
  paymentFailureReason?: string
  gracePeriodDays?: number

  // Benefits
  monthlyCredits?: number
  discountPercentage?: number
  includedServices?: Array<{
    name: string
    quantity: number
  }>
  perks?: string[]

  // Renewal configuration
  preRenewalReminderDays?: number

  // Links
  portalLink?: string
  updatePaymentLink?: string
  reactivationLink?: string
  locationName?: string
  phoneNumber?: string

  // Additional options
  includeBenefitsSummary?: boolean
  includePaymentUpdateLink?: boolean
  includeReactivationInfo?: boolean
}

/**
 * Membership lifecycle message templates
 */
const MEMBERSHIP_MESSAGE_TEMPLATES: Record<MembershipMessageType, MessageTemplate> = {
  membership_started: {
    id: 'membership_started',
    name: 'Membership Started',
    category: 'membership',
    channel: 'email',
    subject: 'Welcome to {{locationName}} Membership!',
    body: `Hi {{patientFirstName}},

Welcome to your {{membershipName}} membership at {{locationName}}! We're thrilled to have you as a member.

✨ Your Membership Benefits:
{{benefitsSummary}}

Your membership is active and ready to use. You can view your membership details and book appointments anytime through your patient portal.

We look forward to helping you achieve your beauty and wellness goals!

Warm regards,
The {{locationName}} Team`,
    variables: [
      'patientFirstName',
      'membershipName',
      'locationName',
      'benefitsSummary'
    ],
    tags: ['membership', 'welcome'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false
    }
  },

  pre_renewal_reminder: {
    id: 'pre_renewal_reminder',
    name: 'Pre-Renewal Reminder',
    category: 'membership',
    channel: 'sms',
    body: 'Hi {{patientFirstName}}! Your {{membershipName}} membership at {{locationName}} will renew in {{daysUntilRenewal}} days for ${{renewalAmount}}. Your card ending in {{lastFourDigits}} will be charged on {{renewalDate}}. Questions? Reply here!',
    variables: [
      'patientFirstName',
      'membershipName',
      'locationName',
      'daysUntilRenewal',
      'renewalAmount',
      'lastFourDigits',
      'renewalDate'
    ],
    tags: ['membership', 'renewal', 'reminder'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160
    }
  },

  renewal_success: {
    id: 'renewal_success',
    name: 'Renewal Success',
    category: 'membership',
    channel: 'sms',
    body: 'Hi {{patientFirstName}}! Your {{membershipName}} membership has been successfully renewed for ${{renewalAmount}}. Your membership is active until {{nextRenewalDate}}. Thank you for being a valued member at {{locationName}}!',
    variables: [
      'patientFirstName',
      'membershipName',
      'renewalAmount',
      'nextRenewalDate',
      'locationName'
    ],
    tags: ['membership', 'renewal', 'success'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160
    }
  },

  renewal_failed: {
    id: 'renewal_failed',
    name: 'Renewal Failed',
    category: 'membership',
    channel: 'sms',
    body: `Hi {{patientFirstName}}, we couldn't process your {{membershipName}} membership renewal. Please update your payment method to keep your membership active: {{updatePaymentLink}}\n\nQuestions? Reply here or call us at {{phoneNumber}}.`,
    variables: [
      'patientFirstName',
      'membershipName',
      'updatePaymentLink',
      'phoneNumber'
    ],
    tags: ['membership', 'renewal', 'failed'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false,
      maxLength: 160
    }
  },

  membership_canceled: {
    id: 'membership_canceled',
    name: 'Membership Canceled',
    category: 'membership',
    channel: 'email',
    subject: 'Your Membership Cancellation Confirmation',
    body: `Hi {{patientFirstName}},

Your {{membershipName}} membership at {{locationName}} has been canceled as requested. Your membership benefits will remain active until {{expirationDate}}.

We're sorry to see you go! If you'd like to reactivate your membership in the future, you can do so anytime through your patient portal or by contacting us.

📞 Reactivation: {{reactivationLink}}

Thank you for being part of our community. We hope to see you again soon!

Best regards,
The {{locationName}} Team`,
    variables: [
      'patientFirstName',
      'membershipName',
      'locationName',
      'expirationDate',
      'reactivationLink'
    ],
    tags: ['membership', 'cancellation'],
    isActive: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    compliance: {
      hipaaCompliant: true,
      includesOptOut: false
    }
  }
}

/**
 * Membership Lifecycle Messaging Service
 */
class MembershipLifecycleMessagingService {
  private enabled: boolean = true
  private messageLog: Array<{
    type: MembershipMessageType
    memberId: string
    timestamp: Date
    status: 'sent' | 'failed'
    error?: string
  }> = []

  /**
   * Enable/disable the service
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled
    console.log(
      `[Membership Messaging] Service ${enabled ? 'enabled' : 'disabled'}`
    )
  }

  /**
   * Generate benefits summary from context
   */
  private generateBenefitsSummary(context: MembershipMessageContext): string {
    console.log('[Membership Messaging] Generating benefits summary', {
      memberId: context.memberId,
      discountPercentage: context.discountPercentage,
      includedServices: context.includedServices?.length,
      perks: context.perks?.length
    })

    const benefits: string[] = []

    if (context.discountPercentage && context.discountPercentage > 0) {
      benefits.push(`• ${context.discountPercentage}% discount on all services`)
    }

    if (context.monthlyCredits && context.monthlyCredits > 0) {
      benefits.push(`• $${context.monthlyCredits} monthly credits`)
    }

    if (context.includedServices && context.includedServices.length > 0) {
      context.includedServices.forEach(service => {
        benefits.push(
          `• ${service.quantity} complimentary ${service.name} per month`
        )
      })
    }

    if (context.perks && context.perks.length > 0) {
      context.perks.forEach(perk => {
        benefits.push(`• ${perk}`)
      })
    }

    if (benefits.length === 0) {
      benefits.push('• Exclusive member benefits')
    }

    return benefits.join('\n')
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Calculate days until date
   */
  private daysUntil(date: Date): number {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  /**
   * Send mock email notification (for email-based messages)
   * In production, this would integrate with an email service like SendGrid
   */
  private async sendEmailNotification(
    to: string,
    subject: string,
    body: string,
    patientId: string,
    metadata: any
  ) {
    console.log('[Membership Messaging] Sending email notification', {
      to,
      subject,
      bodyLength: body.length,
      patientId
    })

    // Log email in console (development mode)
    const emailId = `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.group(`[EMAIL] ${subject}`)
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('Body:', body)
    console.log('Metadata:', metadata)
    console.groupEnd()

    // In production, this would call SendGrid, AWS SES, or similar
    // For now, we return success to simulate the send
    return {
      sid: emailId,
      status: 'sent' as const,
      to,
      subject
    }
  }

  /**
   * Send membership started message
   */
  async sendMembershipStarted(
    context: MembershipMessageContext
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log('[Membership Messaging] Sending membership started message', {
      memberId: context.memberId,
      patientName: context.patientName,
      membershipName: context.membershipName
    })

    if (!this.enabled) {
      console.warn(
        '[Membership Messaging] Service disabled, skipping membership_started'
      )
      return { success: false, error: 'Service disabled' }
    }

    try {
      const template = MEMBERSHIP_MESSAGE_TEMPLATES.membership_started

      // Generate benefits summary if requested
      let benefitsSummary = ''
      if (context.includeBenefitsSummary !== false) {
        benefitsSummary = this.generateBenefitsSummary(context)
        console.log('[Membership Messaging] Benefits summary generated:', {
          length: benefitsSummary.length,
          lines: benefitsSummary.split('\n').length
        })
      }

      // Prepare variables for template
      const variables = {
        patientFirstName: context.patientFirstName,
        membershipName: context.membershipName,
        locationName: context.locationName || 'Our Clinic',
        benefitsSummary:
          benefitsSummary ||
          'Your exclusive membership benefits have been activated.',
        startDate: this.formatDate(context.startDate),
        nextRenewalDate: this.formatDate(context.nextRenewalDate),
        portalLink: context.portalLink || '#'
      }

      // Validate template
      const body = replaceVariables(template.body || '', variables)
      const subject = replaceVariables(template.subject || '', variables)

      console.log('[Membership Messaging] Membership started message prepared', {
        subject,
        bodyLength: body.length,
        channel: template.channel
      })

      // Send email
      const result = await this.sendEmailNotification(
        context.patientEmail,
        subject,
        body,
        context.patientId,
        {
          templateId: template.id,
          messageType: 'membership_started',
          membershipId: context.membershipId,
          variables
        }
      )

      console.log('[Membership Messaging] Membership started message sent', {
        messageId: result?.sid,
        to: context.patientEmail,
        status: result?.status
      })

      // Log to message history
      this.messageLog.push({
        type: 'membership_started',
        memberId: context.memberId,
        timestamp: new Date(),
        status: 'sent'
      })

      return {
        success: true,
        messageId: result?.sid
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('[Membership Messaging] Failed to send membership_started:', {
        error: errorMessage,
        memberId: context.memberId
      })

      this.messageLog.push({
        type: 'membership_started',
        memberId: context.memberId,
        timestamp: new Date(),
        status: 'failed',
        error: errorMessage
      })

      return { success: false, error: errorMessage }
    }
  }

  /**
   * Send pre-renewal reminder
   */
  async sendPreRenewalReminder(
    context: MembershipMessageContext
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log('[Membership Messaging] Sending pre-renewal reminder', {
      memberId: context.memberId,
      patientName: context.patientName,
      reminderDays: context.preRenewalReminderDays || 7
    })

    if (!this.enabled) {
      console.warn(
        '[Membership Messaging] Service disabled, skipping pre_renewal_reminder'
      )
      return { success: false, error: 'Service disabled' }
    }

    try {
      const template = MEMBERSHIP_MESSAGE_TEMPLATES.pre_renewal_reminder

      const daysUntilRenewal = this.daysUntil(context.nextRenewalDate)
      console.log('[Membership Messaging] Days until renewal calculated:', {
        daysUntilRenewal,
        renewalDate: context.nextRenewalDate
      })

      // Prepare variables
      const variables = {
        patientFirstName: context.patientFirstName,
        membershipName: context.membershipName,
        locationName: context.locationName || 'Our Clinic',
        daysUntilRenewal: String(daysUntilRenewal),
        renewalAmount: String(context.renewalAmount || context.monthlyPrice),
        lastFourDigits: context.paymentMethodLast4 || 'xxxx',
        renewalDate: this.formatDate(context.nextRenewalDate)
      }

      const body = replaceVariables(template.body || '', variables)

      console.log('[Membership Messaging] Pre-renewal reminder prepared', {
        bodyLength: body.length,
        channel: template.channel
      })

      // Send SMS
      const result = await messagingService.sendSMS({
        to: context.patientPhone,
        body,
        patientId: context.patientId,
        metadata: {
          templateId: template.id,
          messageType: 'pre_renewal_reminder',
          membershipId: context.membershipId,
          variables
        }
      })

      console.log('[Membership Messaging] Pre-renewal reminder sent', {
        messageId: result?.sid,
        to: context.patientPhone,
        status: result?.status
      })

      this.messageLog.push({
        type: 'pre_renewal_reminder',
        memberId: context.memberId,
        timestamp: new Date(),
        status: 'sent'
      })

      return { success: true, messageId: result?.sid }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('[Membership Messaging] Failed to send pre_renewal_reminder:', {
        error: errorMessage,
        memberId: context.memberId
      })

      this.messageLog.push({
        type: 'pre_renewal_reminder',
        memberId: context.memberId,
        timestamp: new Date(),
        status: 'failed',
        error: errorMessage
      })

      return { success: false, error: errorMessage }
    }
  }

  /**
   * Send renewal success confirmation
   */
  async sendRenewalSuccess(
    context: MembershipMessageContext
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log('[Membership Messaging] Sending renewal success confirmation', {
      memberId: context.memberId,
      patientName: context.patientName,
      renewalAmount: context.renewalAmount
    })

    if (!this.enabled) {
      console.warn(
        '[Membership Messaging] Service disabled, skipping renewal_success'
      )
      return { success: false, error: 'Service disabled' }
    }

    try {
      const template = MEMBERSHIP_MESSAGE_TEMPLATES.renewal_success

      const variables = {
        patientFirstName: context.patientFirstName,
        membershipName: context.membershipName,
        renewalAmount: String(context.renewalAmount || context.monthlyPrice),
        nextRenewalDate: this.formatDate(
          new Date(context.nextRenewalDate.getTime() + 30 * 24 * 60 * 60 * 1000)
        ),
        locationName: context.locationName || 'Our Clinic'
      }

      const body = replaceVariables(template.body || '', variables)

      console.log('[Membership Messaging] Renewal success message prepared', {
        bodyLength: body.length,
        channel: template.channel
      })

      // Send SMS
      const result = await messagingService.sendSMS({
        to: context.patientPhone,
        body,
        patientId: context.patientId,
        metadata: {
          templateId: template.id,
          messageType: 'renewal_success',
          membershipId: context.membershipId,
          variables
        }
      })

      console.log('[Membership Messaging] Renewal success message sent', {
        messageId: result?.sid,
        to: context.patientPhone,
        status: result?.status
      })

      this.messageLog.push({
        type: 'renewal_success',
        memberId: context.memberId,
        timestamp: new Date(),
        status: 'sent'
      })

      return { success: true, messageId: result?.sid }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('[Membership Messaging] Failed to send renewal_success:', {
        error: errorMessage,
        memberId: context.memberId
      })

      this.messageLog.push({
        type: 'renewal_success',
        memberId: context.memberId,
        timestamp: new Date(),
        status: 'failed',
        error: errorMessage
      })

      return { success: false, error: errorMessage }
    }
  }

  /**
   * Send payment failed notification
   */
  async sendPaymentFailed(
    context: MembershipMessageContext
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log('[Membership Messaging] Sending payment failed notification', {
      memberId: context.memberId,
      patientName: context.patientName,
      failureReason: context.paymentFailureReason
    })

    if (!this.enabled) {
      console.warn(
        '[Membership Messaging] Service disabled, skipping renewal_failed'
      )
      return { success: false, error: 'Service disabled' }
    }

    try {
      const template = MEMBERSHIP_MESSAGE_TEMPLATES.renewal_failed

      const variables = {
        patientFirstName: context.patientFirstName,
        membershipName: context.membershipName,
        updatePaymentLink:
          context.updatePaymentLink || 'https://portal.example.com/payment',
        phoneNumber: context.phoneNumber || '(555) 000-0000'
      }

      const body = replaceVariables(template.body || '', variables)

      console.log('[Membership Messaging] Payment failed notification prepared', {
        bodyLength: body.length,
        channel: template.channel
      })

      // Send SMS
      const result = await messagingService.sendSMS({
        to: context.patientPhone,
        body,
        patientId: context.patientId,
        metadata: {
          templateId: template.id,
          messageType: 'renewal_failed',
          membershipId: context.membershipId,
          failureReason: context.paymentFailureReason,
          variables
        }
      })

      console.log('[Membership Messaging] Payment failed notification sent', {
        messageId: result?.sid,
        to: context.patientPhone,
        status: result?.status
      })

      this.messageLog.push({
        type: 'renewal_failed',
        memberId: context.memberId,
        timestamp: new Date(),
        status: 'sent'
      })

      return { success: true, messageId: result?.sid }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('[Membership Messaging] Failed to send renewal_failed:', {
        error: errorMessage,
        memberId: context.memberId
      })

      this.messageLog.push({
        type: 'renewal_failed',
        memberId: context.memberId,
        timestamp: new Date(),
        status: 'failed',
        error: errorMessage
      })

      return { success: false, error: errorMessage }
    }
  }

  /**
   * Send cancellation confirmation
   */
  async sendMembershipCanceled(
    context: MembershipMessageContext
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log('[Membership Messaging] Sending membership canceled notification', {
      memberId: context.memberId,
      patientName: context.patientName,
      cancellationDate: context.cancellationDate
    })

    if (!this.enabled) {
      console.warn(
        '[Membership Messaging] Service disabled, skipping membership_canceled'
      )
      return { success: false, error: 'Service disabled' }
    }

    try {
      const template = MEMBERSHIP_MESSAGE_TEMPLATES.membership_canceled

      const variables = {
        patientFirstName: context.patientFirstName,
        membershipName: context.membershipName,
        locationName: context.locationName || 'Our Clinic',
        cancellationDate: this.formatDate(context.cancellationDate || new Date()),
        expirationDate: this.formatDate(
          context.expirationDate || context.nextRenewalDate
        ),
        reactivationLink:
          context.reactivationLink || 'https://portal.example.com/reactivate'
      }

      // Generate subject and body
      const subject = replaceVariables(template.subject || '', variables)
      const body = replaceVariables(template.body || '', variables)

      console.log('[Membership Messaging] Membership canceled message prepared', {
        subject,
        bodyLength: body.length,
        channel: template.channel
      })

      // Send email
      const result = await this.sendEmailNotification(
        context.patientEmail,
        subject,
        body,
        context.patientId,
        {
          templateId: template.id,
          messageType: 'membership_canceled',
          membershipId: context.membershipId,
          variables
        }
      )

      console.log('[Membership Messaging] Membership canceled message sent', {
        messageId: result?.sid,
        to: context.patientEmail,
        status: result?.status
      })

      this.messageLog.push({
        type: 'membership_canceled',
        memberId: context.memberId,
        timestamp: new Date(),
        status: 'sent'
      })

      return { success: true, messageId: result?.sid }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('[Membership Messaging] Failed to send membership_canceled:', {
        error: errorMessage,
        memberId: context.memberId
      })

      this.messageLog.push({
        type: 'membership_canceled',
        memberId: context.memberId,
        timestamp: new Date(),
        status: 'failed',
        error: errorMessage
      })

      return { success: false, error: errorMessage }
    }
  }

  /**
   * Get message log for debugging
   */
  getMessageLog(limit: number = 50) {
    console.log('[Membership Messaging] Retrieving message log', {
      requestedLimit: limit,
      totalMessages: this.messageLog.length
    })
    return this.messageLog.slice(0, limit)
  }

  /**
   * Get statistics
   */
  getStats() {
    const stats = {
      totalMessages: this.messageLog.length,
      sentMessages: this.messageLog.filter(m => m.status === 'sent').length,
      failedMessages: this.messageLog.filter(m => m.status === 'failed').length,
      messagesByType: {} as Record<MembershipMessageType, number>,
      lastMessageTime: this.messageLog[0]?.timestamp || null,
      enabled: this.enabled
    }

    // Count by type
    const types: MembershipMessageType[] = [
      'membership_started',
      'pre_renewal_reminder',
      'renewal_success',
      'renewal_failed',
      'membership_canceled'
    ]

    types.forEach(type => {
      stats.messagesByType[type] = this.messageLog.filter(
        m => m.type === type
      ).length
    })

    console.log('[Membership Messaging] Statistics retrieved', stats)
    return stats
  }

  /**
   * Clear message log
   */
  clearLog() {
    this.messageLog = []
    console.log('[Membership Messaging] Message log cleared')
  }
}

// Export singleton
export const membershipLifecycleMessagingService =
  new MembershipLifecycleMessagingService()

// Export helper function for testing
export async function sendMembershipMessage(
  messageType: MembershipMessageType,
  context: MembershipMessageContext
) {
  console.log('[Membership Messaging] sendMembershipMessage called', {
    messageType,
    memberId: context.memberId
  })

  switch (messageType) {
    case 'membership_started':
      return membershipLifecycleMessagingService.sendMembershipStarted(context)
    case 'pre_renewal_reminder':
      return membershipLifecycleMessagingService.sendPreRenewalReminder(context)
    case 'renewal_success':
      return membershipLifecycleMessagingService.sendRenewalSuccess(context)
    case 'renewal_failed':
      return membershipLifecycleMessagingService.sendPaymentFailed(context)
    case 'membership_canceled':
      return membershipLifecycleMessagingService.sendMembershipCanceled(context)
    default:
      console.error('[Membership Messaging] Unknown message type:', messageType)
      return {
        success: false,
        error: `Unknown message type: ${messageType}`
      }
  }
}
