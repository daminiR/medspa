/**
 * Membership Notifications API Route
 *
 * Triggers membership lifecycle notifications:
 * - POST /api/memberships/notifications?type=membership_started
 * - POST /api/memberships/notifications?type=pre_renewal_reminder
 * - POST /api/memberships/notifications?type=renewal_success
 * - POST /api/memberships/notifications?type=renewal_failed
 * - POST /api/memberships/notifications?type=membership_canceled
 *
 * DEBUG: Comprehensive logging for each request
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  membershipLifecycleMessagingService,
  sendMembershipMessage,
  type MembershipMessageContext,
  type MembershipMessageType
} from '@/services/memberships/lifecycle-messaging'

/**
 * Request body schema for membership notification
 */
const MembershipNotificationSchema = z.object({
  // Member information
  memberId: z.string().min(1),
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  patientFirstName: z.string().min(1),
  patientEmail: z.string().email(),
  patientPhone: z.string().min(10),

  // Membership information
  membershipId: z.string().min(1),
  membershipName: z.string().min(1),
  membershipTier: z.enum(['silver', 'gold', 'platinum', 'vip']),
  monthlyPrice: z.number().positive(),
  renewalAmount: z.number().positive().optional(),
  billingCycle: z.enum(['monthly', 'quarterly', 'semi-annual', 'annual']),

  // Dates
  startDate: z.string().or(z.date()),
  nextRenewalDate: z.string().or(z.date()),
  cancellationDate: z.string().or(z.date()).optional(),
  expirationDate: z.string().or(z.date()).optional(),

  // Payment information
  paymentMethodLast4: z.string().optional(),
  paymentMethodBrand: z.string().optional(),
  paymentFailureReason: z.string().optional(),
  gracePeriodDays: z.number().optional(),

  // Benefits
  monthlyCredits: z.number().optional(),
  discountPercentage: z.number().optional(),
  includedServices: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number()
      })
    )
    .optional(),
  perks: z.array(z.string()).optional(),

  // Renewal configuration
  preRenewalReminderDays: z.number().optional(),

  // Links
  portalLink: z.string().url().optional(),
  updatePaymentLink: z.string().url().optional(),
  reactivationLink: z.string().url().optional(),
  locationName: z.string().optional(),
  phoneNumber: z.string().optional(),

  // Additional options
  includeBenefitsSummary: z.boolean().optional(),
  includePaymentUpdateLink: z.boolean().optional(),
  includeReactivationInfo: z.boolean().optional()
})

/**
 * Convert string dates to Date objects
 */
function normalizeDates(context: any): MembershipMessageContext {
  return {
    ...context,
    startDate: context.startDate instanceof Date ? context.startDate : new Date(context.startDate),
    nextRenewalDate: context.nextRenewalDate instanceof Date ? context.nextRenewalDate : new Date(context.nextRenewalDate),
    cancellationDate: context.cancellationDate ? (context.cancellationDate instanceof Date ? context.cancellationDate : new Date(context.cancellationDate)) : undefined,
    expirationDate: context.expirationDate ? (context.expirationDate instanceof Date ? context.expirationDate : new Date(context.expirationDate)) : undefined
  }
}

export async function POST(request: NextRequest) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  try {
    console.log('[API] Membership notification request received', {
      requestId,
      method: request.method,
      url: request.url,
      timestamp: new Date().toISOString()
    })

    // Get message type from query parameter
    const { searchParams } = new URL(request.url)
    const messageType = searchParams.get('type') as MembershipMessageType | null

    console.log('[API] Message type extracted', {
      requestId,
      messageType,
      availableTypes: ['membership_started', 'pre_renewal_reminder', 'renewal_success', 'renewal_failed', 'membership_canceled']
    })

    if (!messageType) {
      console.warn('[API] Missing message type parameter', {
        requestId
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Missing "type" query parameter',
          availableTypes: ['membership_started', 'pre_renewal_reminder', 'renewal_success', 'renewal_failed', 'membership_canceled']
        },
        { status: 400 }
      )
    }

    // Validate message type
    const validTypes = ['membership_started', 'pre_renewal_reminder', 'renewal_success', 'renewal_failed', 'membership_canceled']
    if (!validTypes.includes(messageType)) {
      console.warn('[API] Invalid message type', {
        requestId,
        messageType,
        validTypes
      })
      return NextResponse.json(
        {
          success: false,
          error: `Invalid message type: ${messageType}`,
          validTypes
        },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()
    console.log('[API] Request body received', {
      requestId,
      messageType,
      memberId: body.memberId,
      patientName: body.patientName,
      bodyKeys: Object.keys(body).length
    })

    // Validate request
    const validationResult = MembershipNotificationSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('[API] Request validation failed', {
        requestId,
        messageType,
        errors: validationResult.error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code
        }))
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Request validation failed',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data
    console.log('[API] Request validation passed', {
      requestId,
      messageType,
      memberId: validatedData.memberId,
      patientEmail: validatedData.patientEmail
    })

    // Normalize dates
    const context = normalizeDates(validatedData)
    console.log('[API] Context prepared', {
      requestId,
      messageType,
      startDate: context.startDate.toISOString(),
      nextRenewalDate: context.nextRenewalDate.toISOString()
    })

    // Check if service is enabled
    const stats = membershipLifecycleMessagingService.getStats()
    console.log('[API] Service status', {
      requestId,
      enabled: stats.enabled,
      totalMessagesSent: stats.sentMessages,
      totalMessagesFailed: stats.failedMessages
    })

    if (!stats.enabled) {
      console.warn('[API] Membership messaging service is disabled', {
        requestId,
        messageType
      })
      return NextResponse.json(
        {
          success: false,
          error: 'Membership messaging service is currently disabled'
        },
        { status: 503 }
      )
    }

    // Send the message
    console.log('[API] Sending membership message', {
      requestId,
      messageType,
      memberId: context.memberId,
      channel: messageType.includes('reminder') || messageType === 'renewal_success' || messageType === 'renewal_failed' ? 'sms' : 'email'
    })

    const result = await sendMembershipMessage(messageType, context)

    console.log('[API] Message send result', {
      requestId,
      messageType,
      success: result.success,
      messageId: result.messageId,
      error: result.error
    })

    if (!result.success) {
      console.error('[API] Message send failed', {
        requestId,
        messageType,
        memberId: context.memberId,
        error: result.error
      })
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send message',
          messageType,
          memberId: context.memberId
        },
        { status: 500 }
      )
    }

    // Success response
    console.log('[API] Membership notification sent successfully', {
      requestId,
      messageType,
      messageId: result.messageId,
      memberId: context.memberId,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      {
        success: true,
        messageType,
        messageId: result.messageId,
        memberId: context.memberId,
        patientEmail: context.patientEmail,
        patientPhone: context.patientPhone,
        timestamp: new Date().toISOString(),
        requestId
      },
      { status: 200 }
    )
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error('[API] Unexpected error in membership notification endpoint', {
      requestId,
      error: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        requestId
      },
      { status: 500 }
    )
  }
}

/**
 * GET handler for endpoint status and debugging
 */
export async function GET(request: NextRequest) {
  const requestId = `debug-req-${Date.now()}`

  try {
    console.log('[API] Membership notification debug request received', {
      requestId,
      url: request.url
    })

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Get service statistics
    const stats = membershipLifecycleMessagingService.getStats()
    const log = membershipLifecycleMessagingService.getMessageLog(20)

    console.log('[API] Debug endpoint accessed', {
      requestId,
      action,
      statsAvailable: !!stats,
      logEntries: log.length
    })

    // Clear log if requested
    if (action === 'clear-log') {
      console.log('[API] Clearing message log', { requestId })
      membershipLifecycleMessagingService.clearLog()
      return NextResponse.json({
        success: true,
        message: 'Message log cleared',
        timestamp: new Date().toISOString()
      })
    }

    // Return debugging information
    return NextResponse.json({
      success: true,
      service: 'membership-lifecycle-messaging',
      stats,
      recentMessages: log,
      endpoints: {
        membership_started: 'POST /api/memberships/notifications?type=membership_started',
        pre_renewal_reminder: 'POST /api/memberships/notifications?type=pre_renewal_reminder',
        renewal_success: 'POST /api/memberships/notifications?type=renewal_success',
        renewal_failed: 'POST /api/memberships/notifications?type=renewal_failed',
        membership_canceled: 'POST /api/memberships/notifications?type=membership_canceled'
      },
      debug: {
        getStats: 'GET /api/memberships/notifications',
        clearLog: 'GET /api/memberships/notifications?action=clear-log'
      },
      timestamp: new Date().toISOString(),
      requestId
    })
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('[API] Error in debug endpoint', {
      requestId,
      error: errorMessage
    })

    return NextResponse.json(
      {
        success: false,
        error: 'Debug endpoint error',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
