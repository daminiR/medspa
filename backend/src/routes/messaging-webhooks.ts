/**
 * Messaging Webhooks Routes
 *
 * Handles Twilio webhook callbacks for:
 * - Inbound SMS from patients
 * - Message delivery status updates
 * - Emergency detection and opt-out/opt-in processing
 *
 * TCPA Compliance (April 2025):
 * - Automatic opt-out keyword detection
 * - Confirmation messages for consent changes
 * - Carrier-level blocking detection
 *
 * Production Features:
 * - Idempotency using messageSid as unique key
 * - Prisma transactions for multi-table updates
 * - Always returns 200 to prevent Twilio retries
 * - Proper error logging without exposing sensitive data
 */

import { Hono } from 'hono';
import twilio from 'twilio';
import crypto from 'crypto';
import { config } from '../config';
import { APIError } from '../middleware/error';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const messagingWebhooks = new Hono();

// ===================
// Constants
// ===================

const OPT_OUT_KEYWORDS = [
  'STOP',
  'STOPALL',
  'UNSUBSCRIBE',
  'CANCEL',
  'END',
  'QUIT',
  'REVOKE',
  'OPTOUT',
  'OPT OUT',
  'OPT-OUT',
];

const OPT_IN_KEYWORDS = [
  'START',
  'UNSTOP',
  'SUBSCRIBE',
  'OPTIN',
  'OPT IN',
  'YES',
];

const EMERGENCY_KEYWORDS = [
  '911',
  'EMERGENCY',
  'SEVERE PAIN',
  'BLEEDING',
  'ALLERGIC REACTION',
  'CANT BREATHE',
  "CAN'T BREATHE",
  'CANNOT BREATHE',
  'CHEST PAIN',
  'INFECTION',
  'SWELLING FACE',
  'VISION LOSS',
  'SEIZURE',
  'UNCONSCIOUS',
];

const SIMPLE_COMMANDS: Record<string, string> = {
  C: 'confirm',
  R: 'reschedule',
  HERE: 'arrived',
  YES: 'accept',
  NO: 'decline',
};

// ===================
// Type Definitions
// ===================

type InboundMessageData = Prisma.InboundMessageGetPayload<{}>;
type OutboundMessageData = Prisma.OutboundMessageGetPayload<{}>;
type StatusUpdateData = Prisma.StatusUpdateGetPayload<{}>;
type StaffAlertData = Prisma.StaffAlertGetPayload<{}>;
type ConversationData = Prisma.ConversationGetPayload<{}>;
type PatientMessagingProfileData = Prisma.PatientMessagingProfileGetPayload<{}>;

// ===================
// Helper Functions
// ===================

/**
 * Generate UUID
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Normalize phone number to E.164 format
 */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  return phone.startsWith('+') ? phone : `+${digits}`;
}

/**
 * Find patient messaging profile by phone number
 */
async function findProfileByPhone(phone: string): Promise<PatientMessagingProfileData | null> {
  const normalizedPhone = normalizePhone(phone);

  return await prisma.patientMessagingProfile.findFirst({
    where: { phone: normalizedPhone },
  });
}

/**
 * Find or create patient messaging profile
 */
async function findOrCreateProfile(
  patientId: string,
  phone: string
): Promise<PatientMessagingProfileData> {
  const normalizedPhone = normalizePhone(phone);

  // Try to find existing profile
  let profile = await prisma.patientMessagingProfile.findUnique({
    where: { patientId },
  });

  if (!profile) {
    // Create new profile
    profile = await prisma.patientMessagingProfile.create({
      data: {
        id: generateId(),
        patientId,
        phone: normalizedPhone,
        phoneValid: true,
        phoneType: 'mobile',
        smsConsent: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  return profile;
}

/**
 * Find or create conversation for patient
 */
async function findOrCreateConversation(
  patientId: string,
  patientName: string,
  patientPhone: string,
  patientEmail?: string
): Promise<ConversationData> {
  const normalizedPhone = normalizePhone(patientPhone);

  // Find existing conversation
  let conversation = await prisma.conversation.findFirst({
    where: { patientId },
  });

  if (!conversation) {
    // Create new conversation
    conversation = await prisma.conversation.create({
      data: {
        id: generateId(),
        patientId,
        patientName,
        patientPhone: normalizedPhone,
        patientEmail,
        status: 'active',
        channel: 'sms',
        unreadCount: 0,
        priority: 'normal',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
      },
    });
  }

  return conversation;
}

/**
 * Update conversation with new message
 */
async function updateConversation(
  conversationId: string,
  messageBody: string,
  direction: 'inbound' | 'outbound'
): Promise<void> {
  const now = new Date();

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: now,
      lastMessageBody: messageBody.substring(0, 100),
      lastMessageDirection: direction,
      unreadCount: direction === 'inbound' ? { increment: 1 } : undefined,
      updatedAt: now,
    },
  });
}

/**
 * Detect opt-out keywords in message body
 */
function detectOptOut(body: string): boolean {
  const normalizedBody = body.trim().toUpperCase();
  return OPT_OUT_KEYWORDS.some(keyword => normalizedBody === keyword);
}

/**
 * Detect opt-in keywords in message body
 */
function detectOptIn(body: string): boolean {
  const normalizedBody = body.trim().toUpperCase();
  return OPT_IN_KEYWORDS.some(keyword => normalizedBody === keyword);
}

/**
 * Detect emergency keywords in message body
 */
function detectEmergency(body: string): string[] {
  const normalizedBody = body.toUpperCase();
  const detected: string[] = [];

  for (const keyword of EMERGENCY_KEYWORDS) {
    if (normalizedBody.includes(keyword)) {
      detected.push(keyword);
    }
  }

  return detected;
}

/**
 * Detect simple command keywords
 */
function detectSimpleCommand(body: string): string | undefined {
  const normalizedBody = body.trim().toUpperCase();
  return SIMPLE_COMMANDS[normalizedBody];
}

/**
 * Process consent opt-out
 */
async function processOptOut(
  patientId: string,
  phone: string,
  keyword?: string,
  messageSid?: string
): Promise<void> {
  const normalizedPhone = normalizePhone(phone);

  // Update messaging profile
  await prisma.patientMessagingProfile.upsert({
    where: { patientId },
    create: {
      id: generateId(),
      patientId,
      phone: normalizedPhone,
      phoneValid: true,
      phoneType: 'mobile',
      smsConsent: false,
      smsOptOutAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    update: {
      smsConsent: false,
      smsOptOutAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log(`Patient ${patientId} opted out of SMS messages`, {
    keyword,
    messageSid,
  });
}

/**
 * Process consent opt-in
 */
async function processOptIn(
  patientId: string,
  phone: string,
  keyword?: string,
  messageSid?: string
): Promise<void> {
  const normalizedPhone = normalizePhone(phone);

  // Update messaging profile
  await prisma.patientMessagingProfile.upsert({
    where: { patientId },
    create: {
      id: generateId(),
      patientId,
      phone: normalizedPhone,
      phoneValid: true,
      phoneType: 'mobile',
      smsConsent: true,
      smsConsentedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    update: {
      smsConsent: true,
      smsConsentedAt: new Date(),
      smsOptOutAt: null,
      updatedAt: new Date(),
    },
  });

  console.log(`Patient ${patientId} opted in to SMS messages`, {
    keyword,
    messageSid,
  });
}

/**
 * Create staff alert for emergency
 */
async function createStaffAlert(
  patientId: string | undefined,
  patientPhone: string,
  message: string,
  keywords: string[]
): Promise<StaffAlertData> {
  const normalizedPhone = normalizePhone(patientPhone);

  const alert = await prisma.staffAlert.create({
    data: {
      id: generateId(),
      type: 'emergency',
      patientId,
      patientPhone: normalizedPhone,
      message,
      triggerKeywords: keywords,
      createdAt: new Date(),
    },
  });

  console.log('🚨 EMERGENCY ALERT CREATED:', {
    alertId: alert.id,
    patientPhone: normalizedPhone,
    keywords,
    messagePreview: message.substring(0, 50),
  });

  return alert;
}

/**
 * Send SMS response (mock)
 */
async function sendSMS(to: string, body: string): Promise<void> {
  if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioPhoneNumber) {
    console.log('=== SMS Response (Development Mode) ===');
    console.log(`To: ${to}`);
    console.log(`Body: ${body}`);
    console.log('======================================');
    return;
  }

  try {
    const client = twilio(config.twilioAccountSid, config.twilioAuthToken);
    await client.messages.create({
      from: config.twilioPhoneNumber,
      to,
      body,
    });
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw error;
  }
}

/**
 * Validate Twilio signature
 */
function validateTwilioSignature(
  authToken: string,
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  return twilio.validateRequest(authToken, signature, url, params);
}

/**
 * Parse form data from request
 */
async function parseFormData(c: any): Promise<Record<string, string>> {
  const formData = await c.req.parseBody();
  const params: Record<string, string> = {};

  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      params[key] = value;
    }
  }

  return params;
}

/**
 * Get full request URL for signature validation
 */
function getFullUrl(c: any): string {
  const protocol = c.req.header('x-forwarded-proto') || 'http';
  const host = c.req.header('host') || 'localhost:8080';
  const path = c.req.path;
  return `${protocol}://${host}${path}`;
}

// ===================
// Webhook Endpoints
// ===================

/**
 * Health Check
 * GET /api/webhooks/twilio/health
 */
messagingWebhooks.get('/twilio/health', async (c) => {
  return c.json({
    status: 'healthy',
    service: 'twilio-webhooks',
    timestamp: new Date().toISOString(),
    configured: !!(config.twilioAccountSid && config.twilioAuthToken),
  });
});

/**
 * Inbound SMS Webhook
 * POST /api/webhooks/twilio/inbound
 *
 * Handles incoming SMS messages from patients
 * - Implements idempotency using messageSid
 * - Creates/updates patient messaging profile
 * - Processes opt-out/opt-in keywords
 * - Detects emergency keywords and creates alerts
 * - Always returns 200 to prevent Twilio retries
 */
messagingWebhooks.post('/twilio/inbound', async (c) => {
  try {
    // Parse form data
    const params = await parseFormData(c);
    const {
      MessageSid,
      From,
      To,
      Body,
      NumMedia = '0',
    } = params;

    // Extract media URLs (Twilio sends MediaUrl0, MediaUrl1, etc.)
    const mediaUrls: string[] = [];
    const numMedia = parseInt(NumMedia, 10);
    for (let i = 0; i < numMedia; i++) {
      const mediaUrl = params[`MediaUrl${i}`];
      if (mediaUrl) {
        mediaUrls.push(mediaUrl);
      }
    }

    // Validate signature (skip in development)
    if (config.twilioAuthToken) {
      const signature = c.req.header('x-twilio-signature') || '';
      const url = getFullUrl(c);

      if (!validateTwilioSignature(config.twilioAuthToken, signature, url, params)) {
        console.error('Invalid Twilio signature');
        // Still return 200 to prevent Twilio retries
        return c.text('', 200);
      }
    }

    // Validate required fields
    if (!MessageSid || !From || !Body) {
      console.error('Missing required fields in webhook');
      return c.text('', 200);
    }

    // Idempotency check: Check if we already processed this message
    const existing = await prisma.inboundMessage.findUnique({
      where: { messageSid: MessageSid },
    });

    if (existing) {
      console.log('⏭️  Duplicate webhook ignored (idempotent):', MessageSid);
      return c.text('', 200);
    }

    // Normalize phone number
    const normalizedFrom = normalizePhone(From);

    // Find messaging profile by phone
    let profile = await findProfileByPhone(normalizedFrom);
    let patientId: string;
    let patientName = 'Unknown Patient';
    let patientEmail: string | undefined;

    if (profile) {
      patientId = profile.patientId;

      // Try to get patient details from Patient table
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { firstName: true, lastName: true, email: true },
      });

      if (patient) {
        patientName = `${patient.firstName} ${patient.lastName}`;
        patientEmail = patient.email || undefined;
      }
    } else {
      // Create temporary patient ID (will be linked when patient is created)
      patientId = `temp-${generateId()}`;

      // Create messaging profile for unknown number
      profile = await prisma.patientMessagingProfile.create({
        data: {
          id: generateId(),
          patientId,
          phone: normalizedFrom,
          phoneValid: true,
          phoneType: 'mobile',
          smsConsent: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      console.log('📱 New messaging profile created for:', normalizedFrom);
    }

    // Detect keywords
    const isOptOut = detectOptOut(Body);
    const isOptIn = detectOptIn(Body);
    const emergencyKeywords = detectEmergency(Body);
    const isEmergency = emergencyKeywords.length > 0;
    const detectedCommand = detectSimpleCommand(Body);

    // Process opt-out
    if (isOptOut) {
      await processOptOut(patientId, normalizedFrom, 'STOP', MessageSid);

      // Send confirmation
      await sendSMS(
        normalizedFrom,
        "You've been unsubscribed from Luxe Medical Spa. Reply START to resubscribe."
      );

      // Store inbound message with idempotent key
      await prisma.inboundMessage.create({
        data: {
          id: generateId(),
          messageSid: MessageSid,
          from: normalizedFrom,
          to: To,
          body: Body,
          numMedia,
          mediaUrls,
          timestamp: new Date(),
          patientId,
          processed: true,
          isOptOut: true,
          isOptIn: false,
          isEmergency: false,
        },
      });

      console.log('✅ Opt-out processed:', { messageSid: MessageSid, phone: normalizedFrom });

      // Always return 200 OK
      return c.text('', 200);
    }

    // Process opt-in
    if (isOptIn) {
      await processOptIn(patientId, normalizedFrom, 'START', MessageSid);

      // Send confirmation
      await sendSMS(
        normalizedFrom,
        "Welcome back! You're now subscribed to Luxe Medical Spa messages."
      );

      // Store inbound message
      await prisma.inboundMessage.create({
        data: {
          id: generateId(),
          messageSid: MessageSid,
          from: normalizedFrom,
          to: To,
          body: Body,
          numMedia,
          mediaUrls,
          timestamp: new Date(),
          patientId,
          processed: true,
          isOptOut: false,
          isOptIn: true,
          isEmergency: false,
        },
      });

      console.log('✅ Opt-in processed:', { messageSid: MessageSid, phone: normalizedFrom });

      return c.text('', 200);
    }

    // Find or create conversation
    const conversation = await findOrCreateConversation(
      patientId,
      patientName,
      normalizedFrom,
      patientEmail
    );

    // Store inbound message and update conversation in transaction
    await prisma.$transaction(async (tx) => {
      // Create inbound message
      await tx.inboundMessage.create({
        data: {
          id: generateId(),
          messageSid: MessageSid,
          from: normalizedFrom,
          to: To,
          body: Body,
          numMedia,
          mediaUrls,
          timestamp: new Date(),
          conversationId: conversation.id,
          patientId,
          processed: false,
          isOptOut: false,
          isOptIn: false,
          isEmergency,
          detectedCommand: detectedCommand || null,
        },
      });

      // Update conversation
      await tx.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          lastMessageBody: Body.substring(0, 100),
          lastMessageDirection: 'inbound',
          unreadCount: { increment: 1 },
          priority: isEmergency ? 'urgent' : 'normal',
          updatedAt: new Date(),
        },
      });
    });

    // Handle emergency (outside transaction for safety)
    if (isEmergency) {
      await createStaffAlert(
        patientId,
        normalizedFrom,
        Body,
        emergencyKeywords
      );

      // Auto-reply acknowledging emergency
      await sendSMS(
        normalizedFrom,
        'We received your message. If this is a medical emergency, please call 911 immediately. Our staff will contact you shortly.'
      );
    }

    // Log inbound message
    console.log('📩 Inbound SMS processed:', {
      messageSid: MessageSid,
      from: normalizedFrom,
      patientId,
      bodyLength: Body.length,
      hasMedia: numMedia > 0,
      isEmergency,
      detectedCommand,
    });

    // Always return 200 OK
    return c.text('', 200);
  } catch (error) {
    console.error('Error processing inbound webhook:', error);
    // Always return 200 OK to prevent Twilio retries
    return c.text('', 200);
  }
});

/**
 * Status Webhook
 * POST /api/webhooks/twilio/status
 *
 * Handles message delivery status updates
 * - Updates outbound message status
 * - Tracks delivery timestamps
 * - Handles Twilio error codes
 * - Updates patient phone validity based on errors
 * - Creates alerts for spam filtering
 */
messagingWebhooks.post('/twilio/status', async (c) => {
  try {
    // Parse form data
    const params = await parseFormData(c);
    const {
      MessageSid,
      MessageStatus,
      ErrorCode,
      ErrorMessage,
      To,
    } = params;

    // Validate signature (skip in development)
    if (config.twilioAuthToken) {
      const signature = c.req.header('x-twilio-signature') || '';
      const url = getFullUrl(c);

      if (!validateTwilioSignature(config.twilioAuthToken, signature, url, params)) {
        console.error('Invalid Twilio signature');
        return c.text('', 200);
      }
    }

    // Validate required fields
    if (!MessageSid || !MessageStatus) {
      console.error('Missing required fields in status webhook');
      return c.text('', 200);
    }

    const now = new Date();
    const normalizedTo = normalizePhone(To);

    // Store status update (using transaction for consistency)
    await prisma.$transaction(async (tx) => {
      // Create status update record
      await tx.statusUpdate.create({
        data: {
          id: generateId(),
          messageSid: MessageSid,
          messageStatus: MessageStatus as any,
          errorCode: ErrorCode || null,
          errorMessage: ErrorMessage || null,
          to: normalizedTo,
          timestamp: now,
        },
      });

      // Find and update outbound message
      const outboundMessage = await tx.outboundMessage.findUnique({
        where: { externalSid: MessageSid },
      });

      if (outboundMessage) {
        const updateData: Prisma.OutboundMessageUpdateInput = {
          status: MessageStatus as any,
          errorCode: ErrorCode || null,
          errorMessage: ErrorMessage || null,
        };

        if (MessageStatus === 'delivered') {
          updateData.deliveredAt = now;
        }

        await tx.outboundMessage.update({
          where: { externalSid: MessageSid },
          data: updateData,
        });
      }
    });

    // Handle specific error codes (outside transaction)
    if (ErrorCode) {
      const errorCodeNum = parseInt(ErrorCode, 10);
      const profile = await findProfileByPhone(normalizedTo);

      switch (errorCodeNum) {
        case 30003: // Unreachable destination handset
          console.warn(`Phone ${normalizedTo} is unreachable (error 30003)`);
          if (profile) {
            await prisma.patientMessagingProfile.update({
              where: { id: profile.id },
              data: { phoneValid: false, updatedAt: now },
            });
          }
          break;

        case 30004: // Message blocked - Carrier-level opt-out
          console.warn(`Message blocked by carrier for ${normalizedTo} (error 30004)`);
          if (profile) {
            await prisma.patientMessagingProfile.update({
              where: { id: profile.id },
              data: {
                smsConsent: false,
                smsOptOutAt: now,
                phoneValid: false,
                updatedAt: now,
              },
            });
          }
          break;

        case 30005: // Unknown destination handset
          console.warn(`Unknown destination ${normalizedTo} (error 30005)`);
          if (profile) {
            await prisma.patientMessagingProfile.update({
              where: { id: profile.id },
              data: { phoneValid: false, updatedAt: now },
            });
          }
          break;

        case 30006: // Landline or unreachable carrier
          console.warn(`Landline detected for ${normalizedTo} (error 30006)`);
          if (profile) {
            await prisma.patientMessagingProfile.update({
              where: { id: profile.id },
              data: {
                phoneType: 'landline',
                phoneValid: false,
                updatedAt: now,
              },
            });
          }
          break;

        case 30007: // Message filtered (spam)
          console.error(`Message marked as spam for ${normalizedTo} (error 30007)`);

          // Get the outbound message body for the alert
          const outbound = await prisma.outboundMessage.findUnique({
            where: { externalSid: MessageSid },
          });

          // Create staff alert to review content
          await createStaffAlert(
            profile?.patientId,
            normalizedTo,
            `Message filtered as spam: ${outbound?.body.substring(0, 100) || 'N/A'}`,
            ['SPAM_FILTER']
          );
          break;

        case 21610: // Message failed - unsubscribed recipient
          console.warn(`Unsubscribed recipient ${normalizedTo} (error 21610)`);
          if (profile) {
            await prisma.patientMessagingProfile.update({
              where: { id: profile.id },
              data: {
                smsConsent: false,
                smsOptOutAt: now,
                updatedAt: now,
              },
            });
          }
          break;

        default:
          if (errorCodeNum >= 30000 && errorCodeNum < 40000) {
            console.error(`Twilio error ${ErrorCode}: ${ErrorMessage}`, {
              to: normalizedTo,
              messageSid: MessageSid,
            });
          }
      }
    }

    // Log status update
    console.log('📊 Status Update:', {
      messageSid: MessageSid,
      status: MessageStatus,
      errorCode: ErrorCode || 'none',
      to: normalizedTo,
    });

    // Always return 200 OK
    return c.text('', 200);
  } catch (error) {
    console.error('Error processing status webhook:', error);
    // Always return 200 OK to prevent Twilio retries
    return c.text('', 200);
  }
});

// ===================
// Testing/Debug Endpoints
// ===================

/**
 * Get all inbound messages (for testing)
 * GET /api/webhooks/twilio/inbound-messages
 */
messagingWebhooks.get('/twilio/inbound-messages', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50', 10);
    const offset = parseInt(c.req.query('offset') || '0', 10);

    const [messages, total] = await Promise.all([
      prisma.inboundMessage.findMany({
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.inboundMessage.count(),
    ]);

    return c.json({
      messages,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching inbound messages:', error);
    return c.json({ error: 'Failed to fetch inbound messages' }, 500);
  }
});

/**
 * Get all status updates (for testing)
 * GET /api/webhooks/twilio/status-updates
 */
messagingWebhooks.get('/twilio/status-updates', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50', 10);
    const offset = parseInt(c.req.query('offset') || '0', 10);

    const [updates, total] = await Promise.all([
      prisma.statusUpdate.findMany({
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.statusUpdate.count(),
    ]);

    return c.json({
      updates,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching status updates:', error);
    return c.json({ error: 'Failed to fetch status updates' }, 500);
  }
});

/**
 * Get all staff alerts (for testing)
 * GET /api/webhooks/twilio/alerts
 */
messagingWebhooks.get('/twilio/alerts', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50', 10);
    const offset = parseInt(c.req.query('offset') || '0', 10);
    const acknowledged = c.req.query('acknowledged');

    const where: Prisma.StaffAlertWhereInput = {};
    if (acknowledged === 'true') {
      where.acknowledgedAt = { not: null };
    } else if (acknowledged === 'false') {
      where.acknowledgedAt = null;
    }

    const [alerts, total] = await Promise.all([
      prisma.staffAlert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.staffAlert.count({ where }),
    ]);

    return c.json({
      alerts,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching staff alerts:', error);
    return c.json({ error: 'Failed to fetch staff alerts' }, 500);
  }
});

/**
 * Get all conversations (for testing)
 * GET /api/webhooks/twilio/conversations
 */
messagingWebhooks.get('/twilio/conversations', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50', 10);
    const offset = parseInt(c.req.query('offset') || '0', 10);
    const status = c.req.query('status');

    const where: Prisma.ConversationWhereInput = {};
    if (status) {
      where.status = status as any;
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy: { lastMessageAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.conversation.count({ where }),
    ]);

    return c.json({
      conversations,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return c.json({ error: 'Failed to fetch conversations' }, 500);
  }
});

/**
 * Get messaging statistics (for monitoring)
 * GET /api/webhooks/twilio/stats
 */
messagingWebhooks.get('/twilio/stats', async (c) => {
  try {
    const [
      totalInbound,
      totalOutbound,
      totalAlerts,
      unacknowledgedAlerts,
      activeConversations,
      optOuts24h,
      emergencies24h,
    ] = await Promise.all([
      prisma.inboundMessage.count(),
      prisma.outboundMessage.count(),
      prisma.staffAlert.count(),
      prisma.staffAlert.count({ where: { acknowledgedAt: null } }),
      prisma.conversation.count({ where: { status: 'active' } }),
      prisma.inboundMessage.count({
        where: {
          isOptOut: true,
          timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.inboundMessage.count({
        where: {
          isEmergency: true,
          timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return c.json({
      stats: {
        totalInbound,
        totalOutbound,
        totalAlerts,
        unacknowledgedAlerts,
        activeConversations,
        last24h: {
          optOuts: optOuts24h,
          emergencies: emergencies24h,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching webhook stats:', error);
    return c.json({ error: 'Failed to fetch webhook stats' }, 500);
  }
});

export default messagingWebhooks;
