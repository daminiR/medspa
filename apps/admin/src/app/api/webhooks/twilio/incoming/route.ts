/**
 * Incoming SMS Webhook Handler
 * Receives patient SMS replies and processes them
 *
 * Handles:
 * - Confirmation replies (C/CONFIRM)
 * - Reschedule requests (R/RESCHEDULE)
 * - Opt-out detection (STOP, UNSUBSCRIBE)
 * - Message conversation matching
 *
 * @route POST /api/webhooks/twilio/incoming
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleIncomingSMS, formatPhoneNumber } from '@/lib/twilio'
import { processPatientReply } from '@/services/messaging/reply-processor'

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
  const requestId = `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  try {
    console.log(`[${requestId}] ============= INCOMING SMS WEBHOOK =============`)

    // Parse form data from Twilio
    const formData = await request.formData()
    const body = Object.fromEntries(formData)

    console.log(`[${requestId}] Raw webhook body received:`, {
      MessageSid: body.MessageSid,
      From: body.From,
      To: body.To,
      Body: body.Body?.toString().substring(0, 100), // First 100 chars
      NumMedia: body.NumMedia,
    })

    // Parse incoming SMS using Twilio helper
    const incomingMessage = handleIncomingSMS(body)

    console.log(`[${requestId}] Parsed incoming SMS:`, {
      from: incomingMessage.from,
      to: incomingMessage.to,
      body: incomingMessage.body.substring(0, 100),
      messageSid: incomingMessage.messageSid,
      hasMedia: incomingMessage.hasMedia,
    })

    // Process the reply through the reply processor
    console.log(`[${requestId}] Processing patient reply...`)
    const result = await processPatientReply(
      incomingMessage.from,
      incomingMessage.body,
      incomingMessage.messageSid,
      requestId
    )

    console.log(`[${requestId}] Reply processing result:`, {
      success: result.success,
      action: result.action,
      requiresStaffAttention: result.requiresStaffAttention,
      autoReplyMessage: result.autoReplyMessage?.substring(0, 100),
    })

    // Return 200 OK to acknowledge receipt
    // Twilio expects a 200 response within 30 seconds
    console.log(`[${requestId}] Returning 200 OK to Twilio`)
    return new NextResponse(null, { status: 200 })

  } catch (error: any) {
    console.error(`[${requestId}] WEBHOOK ERROR:`, {
      message: error.message,
      stack: error.stack?.split('\n')[0],
      code: error.code,
    })

    // Still return 200 to prevent Twilio from retrying
    // Errors are logged but don't block the webhook
    return new NextResponse(null, { status: 200 })
  }
}

// ============================================================================
// GET HANDLER (for testing/debugging)
// ============================================================================

export async function GET(request: NextRequest) {
  return new NextResponse(
    JSON.stringify({
      status: 'webhook_active',
      endpoint: '/api/webhooks/twilio/incoming',
      timestamp: new Date().toISOString(),
      message: 'This endpoint receives incoming SMS from Twilio. POST only.',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
