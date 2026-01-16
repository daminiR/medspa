/**
 * POST /api/waitlist/notify - Waitlist notification endpoint
 *
 * Comprehensive endpoint for managing waitlist patient notifications:
 * - Send confirmation when added to waitlist
 * - Notify patients of available openings (with secure token)
 * - Handle offer responses (accept/decline)
 * - Track acceptance and expiration
 * - Send internal staff notifications
 *
 * Request body:
 * {
 *   "action": "added" | "offer" | "accepted" | "declined" | "expired" | "reminder",
 *   "entryId": "string",
 *   "patientId": "string",
 *   "patientName": "string",
 *   "patientPhone": "string",
 *   "patientEmail": "string (optional)",
 *   "serviceName": "string",
 *   "practitionerName": "string (optional)",
 *   "practitionerId": "string (optional)",
 *   // For 'offer' action:
 *   "appointmentDate": "ISO date string",
 *   "appointmentTime": "HH:MM format",
 *   "expiryMinutes": "number (default 30)",
 *   "offerToken": "string",
 *   "appointmentId": "string (optional)",
 *   // For reminder action:
 *   "daysWaiting": "number"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "action": "string",
 *   "notification": { result object },
 *   "message": "string"
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import moment from 'moment'
import {
  notifyPatientAddedToWaitlist,
  notifyOfferingAvailableSlot,
  notifyOfferAccepted,
  notifyOfferDeclined,
  notifyOfferExpired,
  sendWaitlistReminder,
  getNotificationsForEntry,
  getStaffNotificationLog,
  getNotificationStats,
} from '@/services/waitlist/notifications'

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const BaseNotificationSchema = z.object({
  entryId: z.string().min(1),
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  patientPhone: z.string().min(10),
  patientEmail: z.string().email().optional(),
  serviceName: z.string().min(1),
  practitionerName: z.string().optional(),
  practitionerId: z.string().optional(),
})

const AddedNotificationSchema = BaseNotificationSchema.extend({
  action: z.literal('added'),
})

const OfferNotificationSchema = BaseNotificationSchema.extend({
  action: z.literal('offer'),
  appointmentDate: z.string().datetime(),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/),
  expiryMinutes: z.number().int().min(5).max(1440).optional().default(30),
  offerToken: z.string().min(1),
  appointmentId: z.string().optional(),
})

const AcceptedNotificationSchema = BaseNotificationSchema.extend({
  action: z.literal('accepted'),
  appointmentDate: z.string().datetime(),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/),
})

const DeclinedNotificationSchema = BaseNotificationSchema.extend({
  action: z.literal('declined'),
})

const ExpiredNotificationSchema = BaseNotificationSchema.extend({
  action: z.literal('expired'),
})

const ReminderNotificationSchema = BaseNotificationSchema.extend({
  action: z.literal('reminder'),
  daysWaiting: z.number().int().min(0),
})

const QueryNotificationSchema = z.object({
  action: z.literal('query'),
  queryType: z.enum(['entry_history', 'staff_log', 'stats']),
  entryId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
})

// Union of all notification schemas
const NotificationRequestSchema = z.union([
  AddedNotificationSchema,
  OfferNotificationSchema,
  AcceptedNotificationSchema,
  DeclinedNotificationSchema,
  ExpiredNotificationSchema,
  ReminderNotificationSchema,
  QueryNotificationSchema,
])

// =============================================================================
// RATE LIMITING
// =============================================================================

const rateLimitStore: Map<string, { count: number; resetAt: Date }> = new Map()

function checkRateLimit(key: string, maxPerMinute: number = 10): boolean {
  const now = new Date()
  const limit = rateLimitStore.get(key)

  if (!limit || now >= limit.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: new Date(now.getTime() + 60 * 1000),
    })
    return true
  }

  if (limit.count >= maxPerMinute) {
    return false
  }

  limit.count++
  return true
}

// =============================================================================
// HANDLER
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request schema
    const validated = NotificationRequestSchema.parse(body)

    // Rate limiting (per entry, max 10 notifications per minute)
    const rateLimitKey = validated.action === 'query'
      ? `query_${validated.queryType}`
      : `notify_${validated.entryId}`

    if (!checkRateLimit(rateLimitKey, 10)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
        },
        { status: 429 }
      )
    }

    // Handle query actions
    if (validated.action === 'query') {
      return handleQueryAction(validated)
    }

    // Handle notification actions
    console.log(`[API] Waitlist notification request: ${validated.action} for ${validated.patientName}`)

    let result

    switch (validated.action) {
      case 'added':
        result = await notifyPatientAddedToWaitlist({
          entryId: validated.entryId,
          patientId: validated.patientId,
          patientName: validated.patientName,
          patientPhone: validated.patientPhone,
          patientEmail: validated.patientEmail,
          serviceName: validated.serviceName,
          practitionerName: validated.practitionerName,
          practitionerId: validated.practitionerId,
        })
        break

      case 'offer':
        result = await notifyOfferingAvailableSlot({
          entryId: validated.entryId,
          patientId: validated.patientId,
          patientName: validated.patientName,
          patientPhone: validated.patientPhone,
          patientEmail: validated.patientEmail,
          serviceName: validated.serviceName,
          practitionerName: validated.practitionerName,
          practitionerId: validated.practitionerId,
          appointmentDate: new Date(validated.appointmentDate),
          appointmentTime: validated.appointmentTime,
          expiryMinutes: validated.expiryMinutes,
          offerToken: validated.offerToken,
          appointmentId: validated.appointmentId,
        })
        break

      case 'accepted':
        result = await notifyOfferAccepted({
          entryId: validated.entryId,
          patientId: validated.patientId,
          patientName: validated.patientName,
          patientPhone: validated.patientPhone,
          patientEmail: validated.patientEmail,
          serviceName: validated.serviceName,
          practitionerName: validated.practitionerName,
          practitionerId: validated.practitionerId,
          appointmentDate: new Date(validated.appointmentDate),
          appointmentTime: validated.appointmentTime,
        })
        break

      case 'declined':
        result = await notifyOfferDeclined({
          entryId: validated.entryId,
          patientId: validated.patientId,
          patientName: validated.patientName,
          patientPhone: validated.patientPhone,
          patientEmail: validated.patientEmail,
          serviceName: validated.serviceName,
          practitionerName: validated.practitionerName,
          practitionerId: validated.practitionerId,
        })
        break

      case 'expired':
        result = await notifyOfferExpired({
          entryId: validated.entryId,
          patientId: validated.patientId,
          patientName: validated.patientName,
          patientPhone: validated.patientPhone,
          patientEmail: validated.patientEmail,
          serviceName: validated.serviceName,
          practitionerName: validated.practitionerName,
          practitionerId: validated.practitionerId,
        })
        break

      case 'reminder':
        result = await sendWaitlistReminder({
          entryId: validated.entryId,
          patientId: validated.patientId,
          patientName: validated.patientName,
          patientPhone: validated.patientPhone,
          patientEmail: validated.patientEmail,
          serviceName: validated.serviceName,
          practitionerName: validated.practitionerName,
          practitionerId: validated.practitionerId,
          daysWaiting: validated.daysWaiting,
        })
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        )
    }

    console.log(`[API] Notification sent successfully: ${result.success}`)

    return NextResponse.json({
      success: result.success,
      action: validated.action,
      notification: {
        type: result.type,
        messageId: result.messageId,
        sentAt: result.sentAt.toISOString(),
        recipientPhone: result.recipientPhone,
        recipientEmail: result.recipientEmail,
        ...('offerToken' in result && { offerToken: result.offerToken }),
        ...('offerLink' in result && { offerLink: result.offerLink }),
      },
      message: result.success
        ? `${validated.action} notification sent successfully`
        : `Failed to send ${validated.action} notification: ${result.error}`,
      error: result.error,
    })
  } catch (error: any) {
    console.error('[API] Waitlist notification error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }
}

// =============================================================================
// QUERY HANDLER FOR DEBUGGING
// =============================================================================

function handleQueryAction(validated: z.infer<typeof QueryNotificationSchema>) {
  try {
    let result: any

    switch (validated.queryType) {
      case 'entry_history':
        if (!validated.entryId) {
          return NextResponse.json(
            {
              success: false,
              error: 'entryId required for entry_history query',
            },
            { status: 400 }
          )
        }
        const notifications = getNotificationsForEntry(validated.entryId)
        result = {
          entryId: validated.entryId,
          notifications: notifications.slice(-validated.limit),
          total: notifications.length,
        }
        break

      case 'staff_log':
        const staffLog = getStaffNotificationLog(validated.limit)
        result = {
          notifications: staffLog,
          total: staffLog.length,
        }
        break

      case 'stats':
        result = getNotificationStats()
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown query type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      action: 'query',
      queryType: validated.queryType,
      data: result,
    })
  } catch (error: any) {
    console.error('[API] Query error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Query failed',
      },
      { status: 500 }
    )
  }
}

// =============================================================================
// GET - Health check and stats
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action') || 'stats'

    console.log(`[API] Waitlist notification GET: ${action}`)

    if (action === 'stats') {
      const stats = getNotificationStats()
      return NextResponse.json({
        success: true,
        data: stats,
      })
    }

    if (action === 'health') {
      return NextResponse.json({
        success: true,
        status: 'operational',
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Unknown action',
      },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('[API] GET error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}
