/**
 * Twilio Delivery Status Webhook
 * Receives and processes SMS delivery status callbacks from Twilio
 *
 * This endpoint:
 * - Receives delivery status updates from Twilio
 * - Validates webhook authenticity
 * - Processes status changes
 * - Triggers notifications and updates
 * - Returns proper response to Twilio
 */

import { NextRequest, NextResponse } from 'next/server';
import { deliveryStatusService } from '@/services/twilio/delivery-status';
import crypto from 'crypto';

// ============================================================================
// CONFIGURATION
// ============================================================================

const WEBHOOK_CONFIG = {
  // Twilio webhook token for validation
  authToken: process.env.TWILIO_AUTH_TOKEN || '',

  // Whether to validate webhook signature (disable in development if needed)
  validateSignature: process.env.NODE_ENV === 'production',

  // Timeout for processing webhook
  timeout: 5000,
};

// ============================================================================
// TYPES
// ============================================================================

interface WebhookLog {
  timestamp: Date;
  messageId: string;
  status: string;
  validSignature: boolean;
  processed: boolean;
  error?: string;
}

// ============================================================================
// WEBHOOK LOGGING
// ============================================================================

const webhookLogs: WebhookLog[] = [];

function logWebhook(log: WebhookLog): void {
  webhookLogs.push(log);

  // Keep only last 1000 logs
  if (webhookLogs.length > 1000) {
    webhookLogs.splice(0, webhookLogs.length - 1000);
  }

  console.log('[Twilio Webhook] Status received:', {
    messageId: log.messageId,
    status: log.status,
    validSignature: log.validSignature,
    processed: log.processed,
    error: log.error,
  });
}

// ============================================================================
// WEBHOOK VALIDATION
// ============================================================================

/**
 * Validate Twilio webhook signature
 * See: https://www.twilio.com/docs/sms/webhooks#validating-webhooks
 */
function validateWebhookSignature(
  url: string,
  params: Record<string, string>,
  signature: string,
  authToken: string
): boolean {
  if (!authToken) {
    console.warn('[Twilio Webhook] Auth token not configured, skipping signature validation');
    return true;
  }

  // Sort params and build data string
  const data = url + Object.keys(params)
    .sort()
    .map(key => `${key}${params[key]}`)
    .join('');

  // Compute HMAC-SHA1
  const hash = crypto
    .createHmac('sha1', authToken)
    .update(data)
    .digest('base64');

  // Compare with provided signature
  return hash === signature;
}

// ============================================================================
// STATUS UPDATE HANDLERS
// ============================================================================

/**
 * Handle delivered status update
 */
async function handleDelivered(messageId: string, status: any): Promise<void> {
  console.log(`[Twilio Webhook] Message delivered: ${messageId}`);

  // In production, you might:
  // - Update database record
  // - Notify patient of delivery
  // - Trigger analytics
  // - Update conversation status
}

/**
 * Handle failed delivery
 */
async function handleFailed(messageId: string, status: any, errorCode?: string): Promise<void> {
  console.warn(`[Twilio Webhook] Message failed: ${messageId}`, { errorCode });

  // In production, you might:
  // - Alert staff of failure
  // - Retry with fallback method
  // - Update contact information
  // - Log for compliance/audit trail
  // - Mark conversation as requires attention
}

/**
 * Handle read status (read receipts)
 */
async function handleRead(messageId: string, status: any): Promise<void> {
  console.log(`[Twilio Webhook] Message read: ${messageId}`);

  // In production, you might:
  // - Update message status in UI
  // - Trigger read receipt in conversation
  // - Track engagement metrics
}

// ============================================================================
// MAIN WEBHOOK HANDLER
// ============================================================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // Parse form data (Twilio sends as application/x-www-form-urlencoded)
    const formData = await request.formData();
    const params: Record<string, string> = {};

    formData.forEach((value, key) => {
      params[key] = value as string;
    });

    // Get signature from headers
    const signature = request.headers.get('x-twilio-signature') || '';

    // Log received webhook
    console.log('[Twilio Webhook] Received', {
      messageId: params.MessageSid,
      status: params.MessageStatus,
      hasSignature: !!signature,
    });

    // Validate signature if required
    let validSignature = true;
    if (WEBHOOK_CONFIG.validateSignature) {
      const url = process.env.NEXT_PUBLIC_BASE_URL
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhooks/twilio/status`
        : request.url;

      validSignature = validateWebhookSignature(
        url,
        params,
        signature,
        WEBHOOK_CONFIG.authToken
      );

      if (!validSignature) {
        console.warn('[Twilio Webhook] Invalid signature detected');

        logWebhook({
          timestamp: new Date(),
          messageId: params.MessageSid || 'unknown',
          status: params.MessageStatus || 'unknown',
          validSignature: false,
          processed: false,
          error: 'Invalid signature',
        });

        // Return 403 Forbidden for invalid signatures in production
        return new NextResponse(null, { status: 403 });
      }
    }

    // Process webhook through delivery status service
    const webhookValidation = await deliveryStatusService.handleWebhook({
      MessageSid: params.MessageSid,
      MessageStatus: (params.MessageStatus as any) || 'unknown',
      From: params.From || '',
      To: params.To || '',
      ErrorCode: params.ErrorCode,
      EventType: params.EventType,
      Timestamp: params.Timestamp,
      ...params,
    });

    if (!webhookValidation.valid) {
      logWebhook({
        timestamp: new Date(),
        messageId: params.MessageSid || 'unknown',
        status: params.MessageStatus || 'unknown',
        validSignature,
        processed: false,
        error: webhookValidation.reason,
      });

      return new NextResponse(null, { status: 400 });
    }

    // Dispatch to appropriate handler based on status
    const messageStatus = params.MessageStatus?.toLowerCase();

    switch (messageStatus) {
      case 'delivered':
        await handleDelivered(params.MessageSid, params);
        break;

      case 'failed':
      case 'undelivered':
        await handleFailed(params.MessageSid, params, params.ErrorCode);
        break;

      case 'read':
        await handleRead(params.MessageSid, params);
        break;

      case 'queued':
      case 'sending':
      case 'sent':
        // These are intermediate states, just log
        console.log(`[Twilio Webhook] Message ${messageStatus}: ${params.MessageSid}`);
        break;

      default:
        console.warn(`[Twilio Webhook] Unknown status: ${messageStatus}`);
    }

    // Log successful processing
    logWebhook({
      timestamp: new Date(),
      messageId: params.MessageSid,
      status: messageStatus || 'unknown',
      validSignature,
      processed: true,
    });

    // Record processing time
    const processingTime = Date.now() - startTime;
    if (processingTime > WEBHOOK_CONFIG.timeout) {
      console.warn(`[Twilio Webhook] Processing took ${processingTime}ms (threshold: ${WEBHOOK_CONFIG.timeout}ms)`);
    }

    // Return 200 OK to Twilio
    return new NextResponse(null, { status: 200 });

  } catch (error: any) {
    console.error('[Twilio Webhook] Processing error:', {
      error: error.message,
      stack: error.stack,
    });

    logWebhook({
      timestamp: new Date(),
      messageId: 'unknown',
      status: 'unknown',
      validSignature: true,
      processed: false,
      error: error.message,
    });

    // Return 500 to indicate server error (Twilio will retry)
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * GET endpoint for webhook health check
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const stats = deliveryStatusService.getStatistics();
  const issues = deliveryStatusService.getIssues();

  return new NextResponse(
    JSON.stringify({
      status: 'ok',
      service: 'Twilio Webhook Handler',
      stats,
      recentIssues: issues.slice(0, 5),
      logsCount: webhookLogs.length,
      recentLogs: webhookLogs.slice(-10),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

