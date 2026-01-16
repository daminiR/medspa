/**
 * Messaging API Routes
 *
 * Full messaging system for SMS and email communications:
 * - Conversations management (list, create, update, mark read)
 * - Message sending (single, bulk, scheduled)
 * - Message delivery tracking
 * - Audit logging for all operations
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { sessionAuthMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const messaging = new Hono();

// ===================
// Validation Schemas
// ===================

// Conversation schemas
const conversationStatusSchema = z.enum(['active', 'resolved', 'waiting', 'urgent', 'archived']);
const channelSchema = z.enum(['sms', 'email', 'portal']);
const directionSchema = z.enum(['inbound', 'outbound']);
const prioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);
const messageStatusSchema = z.enum(['queued', 'sending', 'sent', 'delivered', 'failed', 'undelivered']);

const listConversationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: conversationStatusSchema.optional(),
  patientId: z.string().optional(),
  unread: z.string().optional().transform(val => {
    if (val === undefined) return undefined;
    return val === 'true' || val === '1';
  }),
  assignedTo: z.string().optional(),
  search: z.string().max(255).optional(),
  sortBy: z.enum(['createdAt', 'lastMessageAt', 'priority']).default('lastMessageAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const conversationIdSchema = z.object({
  id: z.string().min(1),
});

const createConversationSchema = z.object({
  patientId: z.string().min(1),
  patientName: z.string().min(1).max(255),
  patientPhone: z.string().min(1).max(20),
  patientEmail: z.string().email().optional(),
  channel: channelSchema.default('sms'),
  priority: prioritySchema.default('normal'),
  tags: z.array(z.string()).default([]),
  assignedTo: z.string().optional(),
  assignedToName: z.string().optional(),
});

const updateConversationSchema = z.object({
  status: conversationStatusSchema.optional(),
  assignedTo: z.string().optional().nullable(),
  assignedToName: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  priority: prioritySchema.optional(),
});

const getMessagesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Message schemas
const messageIdSchema = z.object({
  id: z.string().min(1),
});

const sendMessageSchema = z.object({
  conversationId: z.string().min(1).optional(),
  patientId: z.string().min(1),
  to: z.string().min(1), // Phone number or email
  body: z.string().min(1).max(1600),
  channel: channelSchema.default('sms'),
  mediaUrls: z.array(z.string().url()).optional(),
  templateId: z.string().optional(),
  isAutoResponse: z.boolean().default(false),
});

const bulkSendSchema = z.object({
  recipients: z.array(z.object({
    patientId: z.string().min(1),
    to: z.string().min(1),
    body: z.string().min(1).max(1600),
  })).min(1).max(100),
  channel: channelSchema.default('sms'),
  delayBetweenBatches: z.coerce.number().int().min(0).max(60).default(2), // seconds
  batchSize: z.coerce.number().int().min(1).max(10).default(10),
});

const scheduleMessageSchema = z.object({
  conversationId: z.string().min(1).optional(),
  patientId: z.string().min(1),
  to: z.string().min(1),
  body: z.string().min(1).max(1600),
  channel: channelSchema.default('sms'),
  scheduledAt: z.string().datetime(),
  templateId: z.string().optional(),
});

const listScheduledSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  patientId: z.string().optional(),
  status: z.enum(['queued', 'sent', 'cancelled']).optional(),
});

// ===================
// Type Definitions
// ===================

export type StoredConversation = Prisma.ConversationGetPayload<{
  include: { messages: true };
}>;

export type StoredMessage = Prisma.MessagingMessageGetPayload<{}>;

// ===================
// Helper Functions
// ===================

function generateConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Send SMS via Twilio (simplified version for messaging API)
 * In production, this would use the full Twilio client
 */
async function sendSMS(to: string, body: string): Promise<void> {
  // For now, just log the SMS (development mode)
  // In production, this would call Twilio API
  console.log('=== SMS Message ===');
  console.log(`To: ${to}`);
  console.log(`Body: ${body}`);
  console.log('==================');

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
}

// ===================
// Middleware
// ===================

// All messaging routes require session authentication
messaging.use('/*', sessionAuthMiddleware);

// ===================
// Conversation Routes
// ===================

/**
 * List conversations (paginated, filterable)
 * GET /api/conversations
 */
messaging.get('/conversations', zValidator('query', listConversationsSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Build where clause
  const where: Prisma.ConversationWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.patientId) {
    where.patientId = query.patientId;
  }

  if (query.unread !== undefined) {
    where.unreadCount = query.unread ? { gt: 0 } : { equals: 0 };
  }

  if (query.assignedTo) {
    where.assignedTo = query.assignedTo;
  }

  if (query.search) {
    const searchLower = query.search.toLowerCase();
    where.OR = [
      { patientName: { contains: searchLower, mode: 'insensitive' } },
      { patientPhone: { contains: query.search } },
      { lastMessageBody: { contains: searchLower, mode: 'insensitive' } },
      { tags: { hasSome: [query.search] } },
    ];
  }

  // Build orderBy
  const orderBy: Prisma.ConversationOrderByWithRelationInput = {};
  switch (query.sortBy) {
    case 'lastMessageAt':
      orderBy.lastMessageAt = query.sortOrder;
      break;
    case 'priority':
      orderBy.priority = query.sortOrder;
      break;
    case 'createdAt':
    default:
      orderBy.createdAt = query.sortOrder;
  }

  // Get total count
  const total = await prisma.conversation.count({ where });

  // Get paginated results
  const offset = (query.page - 1) * query.limit;
  const conversations = await prisma.conversation.findMany({
    where,
    orderBy,
    skip: offset,
    take: query.limit,
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'conversation_list',
    ipAddress,
    metadata: { query, resultCount: conversations.length },
  });

  return c.json({
    items: conversations,
    total,
    page: query.page,
    limit: query.limit,
    hasMore: offset + query.limit < total,
  });
});

/**
 * Get single conversation with recent messages
 * GET /api/conversations/:id
 */
messaging.get('/conversations/:id', zValidator('param', conversationIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const conversation = await prisma.conversation.findUnique({
    where: { id },
  });

  if (!conversation) {
    throw APIError.notFound('Conversation');
  }

  // Get recent messages (last 10)
  const recentMessages = await prisma.messagingMessage.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: 'asc' },
    take: 10,
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'conversation',
    resourceId: id,
    ipAddress,
  });

  return c.json({
    conversation,
    recentMessages,
  });
});

/**
 * Create new conversation
 * POST /api/conversations
 */
messaging.post('/conversations', zValidator('json', createConversationSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const id = generateConversationId();
  const now = new Date();

  const conversation = await prisma.conversation.create({
    data: {
      id,
      patientId: data.patientId,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientEmail: data.patientEmail,
      status: 'active',
      channel: data.channel,
      unreadCount: 0,
      assignedTo: data.assignedTo,
      assignedToName: data.assignedToName,
      tags: data.tags,
      priority: data.priority,
      metadata: {},
      updatedAt: now,
      createdBy: user.uid,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'CREATE',
    resourceType: 'conversation',
    resourceId: id,
    ipAddress,
    metadata: { patientId: data.patientId, channel: data.channel },
  });

  return c.json({
    conversation,
    message: 'Conversation created successfully',
  }, 201);
});

/**
 * Update conversation
 * PUT /api/conversations/:id
 */
messaging.put('/conversations/:id', zValidator('param', conversationIdSchema), zValidator('json', updateConversationSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const conversation = await prisma.conversation.findUnique({
    where: { id },
  });

  if (!conversation) {
    throw APIError.notFound('Conversation');
  }

  // Build update data
  const updateData: Prisma.ConversationUpdateInput = {
    updatedAt: new Date(),
  };

  if (data.status !== undefined) updateData.status = data.status;
  if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;
  if (data.assignedToName !== undefined) updateData.assignedToName = data.assignedToName;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.priority !== undefined) updateData.priority = data.priority;

  const updated = await prisma.conversation.update({
    where: { id },
    data: updateData,
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'conversation',
    resourceId: id,
    ipAddress,
    metadata: { updatedFields: Object.keys(data) },
  });

  return c.json({
    conversation: updated,
    message: 'Conversation updated successfully',
  });
});

/**
 * Mark conversation as read
 * POST /api/conversations/:id/read
 */
messaging.post('/conversations/:id/read', zValidator('param', conversationIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const conversation = await prisma.conversation.findUnique({
    where: { id },
  });

  if (!conversation) {
    throw APIError.notFound('Conversation');
  }

  const updated = await prisma.conversation.update({
    where: { id },
    data: {
      unreadCount: 0,
      updatedAt: new Date(),
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'conversation',
    resourceId: id,
    ipAddress,
    metadata: { action: 'mark_read' },
  });

  return c.json({
    conversation: updated,
    message: 'Conversation marked as read',
  });
});

/**
 * Get messages for a conversation (paginated)
 * GET /api/conversations/:id/messages
 */
messaging.get('/conversations/:id/messages', zValidator('param', conversationIdSchema), zValidator('query', getMessagesSchema), async (c) => {
  const { id } = c.req.valid('param');
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const conversation = await prisma.conversation.findUnique({
    where: { id },
  });

  if (!conversation) {
    throw APIError.notFound('Conversation');
  }

  // Get total count
  const total = await prisma.messagingMessage.count({
    where: { conversationId: id },
  });

  // Get paginated messages
  const offset = (query.page - 1) * query.limit;
  const messages = await prisma.messagingMessage.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: query.sortOrder },
    skip: offset,
    take: query.limit,
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'conversation_messages',
    resourceId: id,
    ipAddress,
  });

  return c.json({
    items: messages,
    total,
    page: query.page,
    limit: query.limit,
    hasMore: offset + query.limit < total,
  });
});

// ===================
// Message Routes
// ===================

/**
 * Send single SMS message
 * POST /api/messages/send
 */
messaging.post('/messages/send', zValidator('json', sendMessageSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const messageId = generateMessageId();
  const now = new Date();

  // Find or create conversation
  let conversationId = data.conversationId;
  if (!conversationId) {
    // Look for existing conversation with this patient
    const existingConv = await prisma.conversation.findFirst({
      where: {
        patientId: data.patientId,
        channel: data.channel,
      },
    });

    if (existingConv) {
      conversationId = existingConv.id;
    } else {
      // Create new conversation
      conversationId = generateConversationId();
      await prisma.conversation.create({
        data: {
          id: conversationId,
          patientId: data.patientId,
          patientName: 'Unknown Patient', // Would fetch from patient DB
          patientPhone: data.to,
          status: 'active',
          channel: data.channel,
          unreadCount: 0,
          tags: [],
          priority: 'normal',
          metadata: {},
          updatedAt: now,
          createdBy: user.uid,
        },
      });
    }
  }

  // Create message record
  const message = await prisma.messagingMessage.create({
    data: {
      id: messageId,
      conversationId,
      patientId: data.patientId,
      direction: 'outbound',
      channel: data.channel,
      body: data.body,
      mediaUrls: data.mediaUrls || [],
      from: '+15559876543', // Clinic number
      to: data.to,
      status: 'queued',
      templateId: data.templateId,
      isAutoResponse: data.isAutoResponse,
      metadata: {},
      updatedAt: now,
      sentBy: user.uid,
    },
  });

  // Update conversation
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageBody: data.body,
      lastMessageAt: now,
      lastMessageDirection: 'outbound',
      updatedAt: now,
    },
  });

  // Send via Twilio (only for SMS)
  if (data.channel === 'sms') {
    try {
      await prisma.messagingMessage.update({
        where: { id: messageId },
        data: { status: 'sending' },
      });

      await sendSMS(data.to, data.body);

      await prisma.messagingMessage.update({
        where: { id: messageId },
        data: {
          status: 'sent',
          sentAt: now,
          externalSid: `SM${randomBytes(16).toString('hex')}`,
        },
      });

      // Simulate delivery after 2 seconds
      setTimeout(async () => {
        await prisma.messagingMessage.update({
          where: { id: messageId },
          data: {
            status: 'delivered',
            deliveredAt: new Date(),
          },
        });
      }, 2000);
    } catch (error: any) {
      await prisma.messagingMessage.update({
        where: { id: messageId },
        data: {
          status: 'failed',
          errorMessage: error.message || 'Failed to send SMS',
        },
      });
    }
  }

  await logAuditEvent({
    userId: user.uid,
    action: 'CREATE',
    resourceType: 'message',
    resourceId: messageId,
    ipAddress,
    metadata: { conversationId, patientId: data.patientId, channel: data.channel },
  });

  const updatedMessage = await prisma.messagingMessage.findUnique({
    where: { id: messageId },
  });

  return c.json({
    message: updatedMessage,
    success: true,
  }, 201);
});

/**
 * Send bulk SMS messages
 * POST /api/messages/bulk
 */
messaging.post('/messages/bulk', zValidator('json', bulkSendSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const results: { success: number; failed: number; messages: any[] } = {
    success: 0,
    failed: 0,
    messages: [],
  };

  // Process in batches
  for (let i = 0; i < data.recipients.length; i += data.batchSize) {
    const batch = data.recipients.slice(i, i + data.batchSize);

    for (const recipient of batch) {
      const messageId = generateMessageId();
      const now = new Date();

      // Find or create conversation
      let conversationId: string;
      const existingConv = await prisma.conversation.findFirst({
        where: {
          patientId: recipient.patientId,
          channel: data.channel,
        },
      });

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        conversationId = generateConversationId();
        await prisma.conversation.create({
          data: {
            id: conversationId,
            patientId: recipient.patientId,
            patientName: 'Unknown Patient',
            patientPhone: recipient.to,
            status: 'active',
            channel: data.channel,
            unreadCount: 0,
            tags: ['bulk-message'],
            priority: 'normal',
            metadata: {},
            updatedAt: now,
            createdBy: user.uid,
          },
        });
      }

      const message = await prisma.messagingMessage.create({
        data: {
          id: messageId,
          conversationId,
          patientId: recipient.patientId,
          direction: 'outbound',
          channel: data.channel,
          body: recipient.body,
          from: '+15559876543',
          to: recipient.to,
          status: 'queued',
          mediaUrls: [],
          metadata: { bulkSend: true },
          updatedAt: now,
          sentBy: user.uid,
        },
      });

      // Send SMS
      if (data.channel === 'sms') {
        try {
          await prisma.messagingMessage.update({
            where: { id: messageId },
            data: { status: 'sending' },
          });

          await sendSMS(recipient.to, recipient.body);

          await prisma.messagingMessage.update({
            where: { id: messageId },
            data: {
              status: 'sent',
              sentAt: now,
              externalSid: `SM${randomBytes(16).toString('hex')}`,
            },
          });

          results.success++;
        } catch (error: any) {
          await prisma.messagingMessage.update({
            where: { id: messageId },
            data: {
              status: 'failed',
              errorMessage: error.message || 'Failed to send SMS',
            },
          });
          results.failed++;
        }
      }

      const updatedMessage = await prisma.messagingMessage.findUnique({
        where: { id: messageId },
      });
      results.messages.push(updatedMessage);

      // Update conversation
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageBody: recipient.body,
          lastMessageAt: now,
          lastMessageDirection: 'outbound',
          updatedAt: now,
        },
      });
    }

    // Delay between batches (if not the last batch)
    if (i + data.batchSize < data.recipients.length && data.delayBetweenBatches > 0) {
      await new Promise(resolve => setTimeout(resolve, data.delayBetweenBatches * 1000));
    }
  }

  await logAuditEvent({
    userId: user.uid,
    action: 'CREATE',
    resourceType: 'bulk_message',
    ipAddress,
    metadata: {
      totalRecipients: data.recipients.length,
      success: results.success,
      failed: results.failed,
      channel: data.channel,
    },
  });

  return c.json({
    ...results,
    total: data.recipients.length,
    message: `Bulk send complete: ${results.success} sent, ${results.failed} failed`,
  }, 201);
});

/**
 * List scheduled messages
 * GET /api/messages/scheduled
 */
messaging.get('/messages/scheduled', zValidator('query', listScheduledSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Build where clause
  const where: Prisma.MessagingMessageWhereInput = {
    scheduledAt: { not: null },
  };

  if (query.patientId) {
    where.patientId = query.patientId;
  }

  if (query.status) {
    const statusFilter = query.status === 'cancelled' ? 'failed' : query.status;
    where.status = statusFilter;
  }

  // Get total count
  const total = await prisma.messagingMessage.count({ where });

  // Get paginated results
  const offset = (query.page - 1) * query.limit;
  const messages = await prisma.messagingMessage.findMany({
    where,
    orderBy: { scheduledAt: 'asc' },
    skip: offset,
    take: query.limit,
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'scheduled_messages',
    ipAddress,
  });

  return c.json({
    items: messages,
    total,
    page: query.page,
    limit: query.limit,
    hasMore: offset + query.limit < total,
  });
});

/**
 * Schedule message for later
 * POST /api/messages/schedule
 */
messaging.post('/messages/schedule', zValidator('json', scheduleMessageSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const messageId = generateMessageId();
  const now = new Date();
  const scheduledAt = new Date(data.scheduledAt);

  // Validate scheduled time is in the future
  if (scheduledAt <= now) {
    throw APIError.badRequest('Scheduled time must be in the future');
  }

  // Find or create conversation
  let conversationId = data.conversationId;
  if (!conversationId) {
    const existingConv = await prisma.conversation.findFirst({
      where: {
        patientId: data.patientId,
        channel: data.channel,
      },
    });

    if (existingConv) {
      conversationId = existingConv.id;
    } else {
      conversationId = generateConversationId();
      await prisma.conversation.create({
        data: {
          id: conversationId,
          patientId: data.patientId,
          patientName: 'Unknown Patient',
          patientPhone: data.to,
          status: 'active',
          channel: data.channel,
          unreadCount: 0,
          tags: ['scheduled'],
          priority: 'normal',
          metadata: {},
          updatedAt: now,
          createdBy: user.uid,
        },
      });
    }
  }

  const message = await prisma.messagingMessage.create({
    data: {
      id: messageId,
      conversationId,
      patientId: data.patientId,
      direction: 'outbound',
      channel: data.channel,
      body: data.body,
      from: '+15559876543',
      to: data.to,
      status: 'queued',
      scheduledAt,
      templateId: data.templateId,
      mediaUrls: [],
      metadata: {},
      updatedAt: now,
      sentBy: user.uid,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'CREATE',
    resourceType: 'scheduled_message',
    resourceId: messageId,
    ipAddress,
    metadata: {
      conversationId,
      patientId: data.patientId,
      scheduledAt: scheduledAt.toISOString(),
    },
  });

  return c.json({
    message,
    success: true,
  }, 201);
});

/**
 * Cancel scheduled message
 * DELETE /api/messages/scheduled/:id
 */
messaging.delete('/messages/scheduled/:id', zValidator('param', messageIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const message = await prisma.messagingMessage.findUnique({
    where: { id },
  });

  if (!message) {
    throw APIError.notFound('Scheduled message');
  }

  if (message.status !== 'queued') {
    throw APIError.badRequest('Message has already been sent or cancelled');
  }

  await prisma.messagingMessage.update({
    where: { id },
    data: {
      status: 'failed',
      errorMessage: 'Cancelled by user',
      updatedAt: new Date(),
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'DELETE',
    resourceType: 'scheduled_message',
    resourceId: id,
    ipAddress,
  });

  return c.json({
    success: true,
    message: 'Scheduled message cancelled successfully',
  });
});

/**
 * Get message by ID
 * GET /api/messages/:id
 */
messaging.get('/messages/:id', zValidator('param', messageIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const message = await prisma.messagingMessage.findUnique({
    where: { id },
  });

  if (!message) {
    throw APIError.notFound('Message');
  }

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'message',
    resourceId: id,
    ipAddress,
  });

  return c.json({
    message,
  });
});

/**
 * Get message delivery status
 * GET /api/messages/:id/status
 */
messaging.get('/messages/:id/status', zValidator('param', messageIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const message = await prisma.messagingMessage.findUnique({
    where: { id },
  });

  if (!message) {
    throw APIError.notFound('Message');
  }

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'message_status',
    resourceId: id,
    ipAddress,
  });

  return c.json({
    id: message.id,
    status: message.status,
    externalSid: message.externalSid,
    sentAt: message.sentAt?.toISOString(),
    deliveredAt: message.deliveredAt?.toISOString(),
    errorCode: message.errorCode,
    errorMessage: message.errorMessage,
  });
});

export default messaging;
