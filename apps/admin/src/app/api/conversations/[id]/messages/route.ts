/**
 * Conversation Messages API Route
 * GET /api/conversations/[id]/messages - Get all messages in a conversation
 * POST /api/conversations/[id]/messages - Send a new message
 *
 * Features:
 * - Message delivery status tracking (queued, sending, sent, delivered, failed)
 * - Automatic retry logic for failed messages
 * - Message history pagination
 * - Support for multiple channels (SMS, email, web_chat, phone)
 * - Attachment support
 * - Message metadata tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Message, MessageDeliveryStatus, MessageType, MessageChannel } from '@/types/messaging';

// In-memory store for failed messages that need retry
interface FailedMessage {
  id: number;
  conversationId: number;
  message: Message;
  failureCount: number;
  lastRetryAt?: Date;
  nextRetryAt: Date;
  error?: string;
}

interface MessageDeliveryRecord {
  messageId: number;
  conversationId: number;
  status: MessageDeliveryStatus;
  channel: MessageChannel;
  deliveredAt?: Date;
  failedAt?: Date;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

// In-memory retry queue
const failedMessagesQueue: Map<number, FailedMessage> = new Map();
const deliveryRecords: Map<number, MessageDeliveryRecord> = new Map();

// Configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 5000; // 5 seconds
const RETRY_BACKOFF_MULTIPLIER = 2; // Exponential backoff

/**
 * Calculate next retry time with exponential backoff
 */
function calculateNextRetryTime(failureCount: number): Date {
  const delay = INITIAL_RETRY_DELAY_MS * Math.pow(RETRY_BACKOFF_MULTIPLIER, failureCount);
  return new Date(Date.now() + delay);
}

/**
 * Simulate message delivery with potential failure
 */
function simulateMessageDelivery(message: Message): {
  status: MessageDeliveryStatus;
  shouldRetry: boolean;
  error?: string;
} {
  // Simulate 95% success rate
  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {
    // Simulate delivery status progression
    const rand = Math.random();
    if (rand > 0.7) {
      return { status: 'delivered', shouldRetry: false };
    } else if (rand > 0.4) {
      return { status: 'sent', shouldRetry: false };
    } else {
      return { status: 'queued', shouldRetry: false };
    }
  }

  // Simulate failure
  const errors = [
    'Invalid phone number format',
    'Recipient opted out',
    'Network timeout',
    'Rate limit exceeded',
    'SMS carrier rejection',
  ];

  const error = errors[Math.floor(Math.random() * errors.length)];
  return {
    status: 'failed',
    shouldRetry: true,
    error,
  };
}

/**
 * Add message to retry queue
 */
function queueMessageForRetry(failedMessage: FailedMessage) {
  failedMessagesQueue.set(failedMessage.message.id, failedMessage);

  // Log retry for monitoring
  console.log('Message queued for retry:', {
    messageId: failedMessage.message.id,
    failureCount: failedMessage.failureCount,
    nextRetryAt: failedMessage.nextRetryAt,
    error: failedMessage.error,
  });
}

/**
 * Process retry queue (would normally run on a timer)
 */
function processRetryQueue() {
  const now = new Date();
  const entriesToProcess: [number, FailedMessage][] = [];

  // Find messages ready to retry
  failedMessagesQueue.forEach((failedMsg, messageId) => {
    if (failedMsg.nextRetryAt <= now) {
      entriesToProcess.push([messageId, failedMsg]);
    }
  });

  // Process retries
  entriesToProcess.forEach(([messageId, failedMsg]) => {
    if (failedMsg.failureCount >= MAX_RETRIES) {
      // Max retries exceeded
      console.log('Max retries exceeded for message:', messageId);
      failedMessagesQueue.delete(messageId);
      return;
    }

    // Attempt retry
    console.log('Retrying message:', {
      messageId,
      attempt: failedMsg.failureCount + 1,
      maxRetries: MAX_RETRIES,
    });

    failedMsg.failureCount++;
    failedMsg.lastRetryAt = now;
    failedMsg.nextRetryAt = calculateNextRetryTime(failedMsg.failureCount);
  });
}

// Process retry queue periodically (in production, use a cron job)
setInterval(processRetryQueue, 10000);

// GET - Get all messages in a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversationId = parseInt(id);
    const { searchParams } = new URL(request.url);

    // Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const filterStatus = searchParams.get('status'); // Optional: filter by delivery status
    const filterType = searchParams.get('type'); // Optional: filter by message type

    // In production, fetch from database
    // For now, simulate fetching from the conversation store
    const mockMessages: Message[] = [];

    console.log('Fetching messages:', {
      conversationId,
      page,
      limit,
      filterStatus,
      filterType,
    });

    // Calculate pagination
    const total = mockMessages.length;
    const start = (page - 1) * limit;
    const messages = mockMessages.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      data: messages,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: start + limit < total,
      },
    });
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversationId = parseInt(id);
    const body = await request.json();

    const {
      text,
      channel = 'sms',
      type = 'manual',
      senderName = 'Staff Member',
      attachments,
      metadata,
      scheduledFor,
    } = body;

    // Validate required fields
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message text is required' },
        { status: 400 }
      );
    }

    if (text.length > 1600) {
      return NextResponse.json(
        { success: false, error: 'Message exceeds maximum length of 1600 characters' },
        { status: 400 }
      );
    }

    // Validate channel
    const validChannels: MessageChannel[] = ['sms', 'email', 'web_chat', 'phone'];
    if (!validChannels.includes(channel)) {
      return NextResponse.json(
        { success: false, error: `Invalid channel. Must be one of: ${validChannels.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes: MessageType[] = ['manual', 'automated', 'system', 'campaign'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if scheduled for future
    let sendStatus: MessageDeliveryStatus = 'queued';
    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      if (scheduledDate > new Date()) {
        sendStatus = 'queued';
      }
    }

    // Create message object
    const messageId = Date.now() + Math.floor(Math.random() * 10000);
    const now = new Date();

    const newMessage: Message = {
      id: messageId,
      conversationId,
      sender: 'clinic',
      senderName,
      text,
      time: new Date(),
      status: sendStatus,
      channel: channel as MessageChannel,
      type: type as MessageType,
      attachments: attachments ? attachments.map((att: any, idx: number) => ({
        id: `att-${messageId}-${idx}`,
        filename: att.filename || `attachment-${idx}`,
        mimeType: att.mimeType || 'application/octet-stream',
        size: att.size || 0,
        url: att.url || '',
        uploadedAt: now,
        uploadedBy: senderName,
      })) : undefined,
      metadata: {
        ...metadata,
        scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
      },
    };

    // Simulate delivery (in production, actually send via Twilio/etc)
    const deliveryResult = simulateMessageDelivery(newMessage);

    newMessage.status = deliveryResult.status as MessageDeliveryStatus;

    // If delivery failed, queue for retry
    if (deliveryResult.shouldRetry) {
      const failedMessage: FailedMessage = {
        id: messageId,
        conversationId,
        message: newMessage,
        failureCount: 0,
        nextRetryAt: calculateNextRetryTime(0),
        error: deliveryResult.error,
      };

      queueMessageForRetry(failedMessage);
    }

    // Create delivery record
    const deliveryRecord: MessageDeliveryRecord = {
      messageId,
      conversationId,
      status: newMessage.status,
      channel: channel as MessageChannel,
      deliveredAt: newMessage.status === 'delivered' ? now : undefined,
      failedAt: newMessage.status === 'failed' ? now : undefined,
      error: deliveryResult.error,
      retryCount: 0,
      maxRetries: MAX_RETRIES,
    };

    deliveryRecords.set(messageId, deliveryRecord);

    // Log message send for monitoring
    console.log('Message sent:', {
      messageId,
      conversationId,
      status: newMessage.status,
      channel,
      type,
      error: deliveryResult.error,
      queuedForRetry: deliveryResult.shouldRetry,
    });

    return NextResponse.json({
      success: true,
      data: newMessage,
      delivery: {
        messageId,
        status: deliveryRecord.status,
        retryCount: deliveryRecord.retryCount,
        maxRetries: deliveryRecord.maxRetries,
        ...(deliveryResult.error && { error: deliveryResult.error }),
      },
      message: `Message ${deliveryResult.shouldRetry ? 'queued (will retry)' : 'sent'} successfully`,
    }, { status: 201 });
  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// PATCH - Update message delivery status (for webhook updates from providers)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversationId = parseInt(id);
    const body = await request.json();

    const { messageId, status, error } = body;

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'messageId is required' },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { success: false, error: 'status is required' },
        { status: 400 }
      );
    }

    const validStatuses: MessageDeliveryStatus[] = [
      'queued',
      'sending',
      'sent',
      'delivered',
      'read',
      'failed',
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Update delivery record
    const deliveryRecord = deliveryRecords.get(messageId);
    if (!deliveryRecord) {
      return NextResponse.json(
        { success: false, error: 'Message delivery record not found' },
        { status: 404 }
      );
    }

    deliveryRecord.status = status as MessageDeliveryStatus;

    if (status === 'delivered' || status === 'read') {
      deliveryRecord.deliveredAt = new Date();
      // Remove from retry queue if it was there
      failedMessagesQueue.delete(messageId);
    } else if (status === 'failed' && error) {
      deliveryRecord.error = error;
      deliveryRecord.failedAt = new Date();

      // Queue for retry if not exceeded max retries
      if (deliveryRecord.retryCount < MAX_RETRIES) {
        const failedMsg = failedMessagesQueue.get(messageId);
        if (failedMsg) {
          failedMsg.failureCount = deliveryRecord.retryCount;
          failedMsg.nextRetryAt = calculateNextRetryTime(failedMsg.failureCount);
          failedMsg.error = error;
        } else {
          const newFailedMsg: FailedMessage = {
            id: messageId,
            conversationId,
            message: {
              id: messageId,
              conversationId,
              sender: 'clinic',
              text: '',
              time: new Date(),
              status: 'failed',
              channel: 'sms',
              type: 'manual',
            },
            failureCount: deliveryRecord.retryCount,
            nextRetryAt: calculateNextRetryTime(deliveryRecord.retryCount),
            error,
          };
          queueMessageForRetry(newFailedMsg);
        }
      }
    }

    console.log('Message delivery status updated:', {
      messageId,
      conversationId,
      status,
      error,
      retryCount: deliveryRecord.retryCount,
    });

    return NextResponse.json({
      success: true,
      data: deliveryRecord,
      message: 'Message delivery status updated successfully',
    });
  } catch (error) {
    console.error('Messages PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update message delivery status' },
      { status: 500 }
    );
  }
}
