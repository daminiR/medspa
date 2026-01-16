/**
 * Messaging Campaigns API Routes
 *
 * Full CRUD operations for SMS marketing campaigns with:
 * - Campaign creation and management
 * - Audience filtering and segmentation
 * - Batch sending with rate limiting
 * - Delivery stats tracking
 * - Status transitions and pause/resume
 * - Consent filtering
 * - Audit logging
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { sessionAuthMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const campaigns = new Hono();

// ===================
// Validation Schemas
// ===================

// Campaign status
const campaignStatusSchema = z.enum([
  'draft',
  'scheduled',
  'sending',
  'sent',
  'paused',
  'cancelled',
  'failed',
]);

// Audience type
const audienceTypeSchema = z.enum([
  'all_patients',
  'last_visit_30days',
  'last_visit_60days',
  'last_visit_90days',
  'vip',
  'new_patients',
  'birthday_this_month',
  'custom',
]);

// Message type
const messageTypeSchema = z.enum(['marketing', 'transactional']);

// Audience filters schema
const audienceFiltersSchema = z.object({
  services: z.array(z.string()).optional(),
  providers: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  minSpend: z.number().min(0).optional(),
}).optional();

// Create campaign schema
const createCampaignSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  audienceType: audienceTypeSchema,
  audienceFilters: audienceFiltersSchema,
  templateId: z.string().uuid().optional(),
  messageBody: z.string().min(1).max(1600), // SMS limit
  messageType: messageTypeSchema.default('marketing'),
  scheduledFor: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  batchSize: z.number().int().min(1).max(1000).default(100),
  batchDelayMs: z.number().int().min(1000).max(60000).default(5000), // 1-60 seconds
});

// Update campaign schema
const updateCampaignSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  audienceType: audienceTypeSchema.optional(),
  audienceFilters: audienceFiltersSchema,
  messageBody: z.string().min(1).max(1600).optional(),
  scheduledFor: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  batchSize: z.number().int().min(1).max(1000).optional(),
  batchDelayMs: z.number().int().min(1000).max(60000).optional(),
});

// List campaigns query schema
const listCampaignsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: campaignStatusSchema.optional(),
  sortBy: z.enum(['name', 'createdAt', 'scheduledFor', 'sentAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Campaign ID param schema
const campaignIdSchema = z.object({
  id: z.string().uuid(),
});

// Send campaign schema (optional override settings)
const sendCampaignSchema = z.object({
  batchSize: z.number().int().min(1).max(1000).optional(),
  batchDelayMs: z.number().int().min(1000).max(60000).optional(),
}).optional();

// ===================
// Type Definitions
// ===================

export type StoredCampaign = Prisma.CampaignGetPayload<{
  include: { recipients: true };
}>;

export type CampaignRecipient = Prisma.CampaignRecipientGetPayload<{}>;

// ===================
// Helper Functions
// ===================

function generateCampaignId(): string {
  return randomUUID();
}

function generateRecipientId(): string {
  return randomUUID();
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

/**
 * Calculate audience based on type and filters
 * This is a simplified version - in production, would query actual patient data
 */
async function calculateAudience(
  audienceType: string,
  audienceFilters?: any
): Promise<{ audienceCount: number; consentCount: number }> {
  // In a real implementation, this would query the Patient table
  // and ConsentRecord table to get accurate counts

  // For now, return mock counts
  return {
    audienceCount: 100,
    consentCount: 85,
  };
}

/**
 * Get patients matching campaign audience (with consent)
 * This is a simplified version - in production would query Patient and ConsentRecord tables
 */
async function getCampaignRecipients(campaign: StoredCampaign): Promise<any[]> {
  // In a real implementation, would query:
  // 1. Patient table with filters based on audienceType and audienceFilters
  // 2. Join with ConsentRecord to filter by marketing consent

  // For now, return empty array - would be populated with actual patients
  return [];
}

/**
 * Check if status transition is valid
 */
function isValidStatusTransition(from: string, to: string): boolean {
  const transitions: Record<string, string[]> = {
    draft: ['scheduled', 'cancelled'],
    scheduled: ['sending', 'cancelled'],
    sending: ['sent', 'paused', 'failed', 'cancelled'],
    paused: ['sending', 'cancelled'],
    sent: [],
    cancelled: [],
    failed: [],
  };

  return transitions[from]?.includes(to) ?? false;
}

/**
 * Check if campaign can be edited
 */
function canEditCampaign(campaign: StoredCampaign): boolean {
  return campaign.status === 'draft' || campaign.status === 'scheduled';
}

/**
 * Check if campaign can be deleted/cancelled
 */
function canDeleteCampaign(campaign: StoredCampaign): boolean {
  return ['draft', 'scheduled', 'sending', 'paused'].includes(campaign.status);
}

/**
 * Simulate batch sending (mock implementation)
 * In production, this would be a background job/queue
 */
async function processCampaignBatch(
  campaign: StoredCampaign,
  batchNumber: number
): Promise<{ sent: number; failed: number }> {
  const recipients = await prisma.campaignRecipient.findMany({
    where: {
      campaignId: campaign.id,
      status: 'pending',
    },
    take: campaign.batchSize,
  });

  let sent = 0;
  let failed = 0;

  for (const recipient of recipients) {
    // Mock sending - 95% success rate
    const success = Math.random() > 0.05;

    if (success) {
      await prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: {
          status: 'sent',
          sentAt: new Date(),
          twilioSid: `SM${randomUUID().substring(0, 32)}`,
        },
      });

      // Mock delivery (90% delivered after sent)
      if (Math.random() > 0.1) {
        setTimeout(async () => {
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: {
              status: 'delivered',
              deliveredAt: new Date(Date.now() + 1000 + Math.random() * 9000),
            },
          });
        }, 1000);
      }

      sent++;
    } else {
      await prisma.campaignRecipient.update({
        where: { id: recipient.id },
        data: {
          status: 'failed',
          failedReason: 'Invalid phone number',
        },
      });
      failed++;
    }
  }

  return { sent, failed };
}

// ===================
// Middleware
// ===================

// All campaign routes require session authentication
campaigns.use('/*', sessionAuthMiddleware);

// ===================
// Routes
// ===================

/**
 * List campaigns (paginated, filterable by status)
 * GET /api/campaigns
 */
campaigns.get('/', zValidator('query', listCampaignsSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Build where clause
  const where: Prisma.CampaignWhereInput = {};
  if (query.status) {
    where.status = query.status;
  }

  // Build orderBy
  const orderBy: Prisma.CampaignOrderByWithRelationInput = {};
  switch (query.sortBy) {
    case 'name':
      orderBy.name = query.sortOrder;
      break;
    case 'scheduledFor':
      orderBy.scheduledFor = query.sortOrder;
      break;
    case 'sentAt':
      orderBy.sentAt = query.sortOrder;
      break;
    case 'createdAt':
    default:
      orderBy.createdAt = query.sortOrder;
  }

  // Get total count
  const total = await prisma.campaign.count({ where });

  // Get paginated results
  const offset = (query.page - 1) * query.limit;
  const campaigns = await prisma.campaign.findMany({
    where,
    orderBy,
    skip: offset,
    take: query.limit,
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'campaign_list',
    ipAddress,
    metadata: { query, resultCount: campaigns.length },
  });

  return c.json({
    items: campaigns,
    total,
    page: query.page,
    limit: query.limit,
    hasMore: offset + query.limit < total,
  });
});

/**
 * Get campaign with stats
 * GET /api/campaigns/:id
 */
campaigns.get('/:id', zValidator('param', campaignIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const campaign = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!campaign) {
    throw APIError.notFound('Campaign');
  }

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'campaign',
    resourceId: id,
    ipAddress,
  });

  return c.json({
    campaign,
  });
});

/**
 * Create campaign
 * POST /api/campaigns
 */
campaigns.post('/', zValidator('json', createCampaignSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const id = generateCampaignId();
  const now = new Date();

  // Calculate audience
  const { audienceCount, consentCount } = await calculateAudience(
    data.audienceType,
    data.audienceFilters
  );

  const campaign = await prisma.campaign.create({
    data: {
      id,
      name: data.name,
      description: data.description,
      status: data.scheduledFor ? 'scheduled' : 'draft',
      audienceType: data.audienceType,
      audienceFilters: data.audienceFilters || Prisma.JsonNull,
      audienceCount,
      consentCount,
      templateId: data.templateId,
      messageBody: data.messageBody,
      messageType: data.messageType,
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
      stats: {
        totalRecipients: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        clicked: 0,
        optedOut: 0,
        deliveryRate: 0,
      },
      batchSize: data.batchSize,
      batchDelayMs: data.batchDelayMs,
      currentBatch: 0,
      totalBatches: 0,
      createdBy: user.uid,
      updatedAt: now,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'CREATE',
    resourceType: 'campaign',
    resourceId: id,
    ipAddress,
    metadata: { campaignName: campaign.name, audienceCount, consentCount },
  });

  return c.json({
    campaign,
    message: 'Campaign created successfully',
  }, 201);
});

/**
 * Update campaign (only draft/scheduled)
 * PUT /api/campaigns/:id
 */
campaigns.put('/:id', zValidator('param', campaignIdSchema), zValidator('json', updateCampaignSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: { recipients: true },
  });

  if (!campaign) {
    throw APIError.notFound('Campaign');
  }

  if (!canEditCampaign(campaign)) {
    throw APIError.badRequest(`Cannot edit campaign with status '${campaign.status}'`);
  }

  // Build update data
  const updateData: Prisma.CampaignUpdateInput = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.messageBody !== undefined) updateData.messageBody = data.messageBody;
  if (data.batchSize !== undefined) updateData.batchSize = data.batchSize;
  if (data.batchDelayMs !== undefined) updateData.batchDelayMs = data.batchDelayMs;

  if (data.audienceType !== undefined) {
    updateData.audienceType = data.audienceType;
    updateData.audienceFilters = data.audienceFilters || Prisma.JsonNull;

    // Recalculate audience
    const { audienceCount, consentCount } = await calculateAudience(
      data.audienceType,
      data.audienceFilters
    );
    updateData.audienceCount = audienceCount;
    updateData.consentCount = consentCount;
  }

  if (data.scheduledFor !== undefined) {
    updateData.scheduledFor = new Date(data.scheduledFor);
    if (campaign.status === 'draft') {
      updateData.status = 'scheduled';
    }
  }

  const updated = await prisma.campaign.update({
    where: { id },
    data: updateData,
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'campaign',
    resourceId: id,
    ipAddress,
    metadata: { updatedFields: Object.keys(data) },
  });

  return c.json({
    campaign: updated,
    message: 'Campaign updated successfully',
  });
});

/**
 * Delete draft or cancel scheduled/sending
 * DELETE /api/campaigns/:id
 */
campaigns.delete('/:id', zValidator('param', campaignIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: { recipients: true },
  });

  if (!campaign) {
    throw APIError.notFound('Campaign');
  }

  if (!canDeleteCampaign(campaign)) {
    throw APIError.badRequest(`Cannot delete campaign with status '${campaign.status}'`);
  }

  if (campaign.status === 'draft') {
    // Permanently delete draft campaigns
    await prisma.campaign.delete({
      where: { id },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'DELETE',
      resourceType: 'campaign',
      resourceId: id,
      ipAddress,
      metadata: { action: 'delete_draft' },
    });

    return c.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } else {
    // Cancel non-draft campaigns
    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelledBy: user.uid,
        updatedAt: new Date(),
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'campaign',
      resourceId: id,
      ipAddress,
      metadata: { action: 'cancel' },
    });

    return c.json({
      success: true,
      message: 'Campaign cancelled successfully',
    });
  }
});

/**
 * Send campaign (batched)
 * POST /api/campaigns/:id/send
 */
campaigns.post('/:id/send', zValidator('param', campaignIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  let overrides: { batchSize?: number; batchDelayMs?: number } = {};
  try {
    const body = await c.req.json();
    if (body) overrides = body;
  } catch {
    // Empty body is fine
  }
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: { recipients: true },
  });

  if (!campaign) {
    throw APIError.notFound('Campaign');
  }

  // Validate status transition
  if (campaign.status === 'draft' || campaign.status === 'scheduled' || campaign.status === 'paused') {
    if (!isValidStatusTransition(campaign.status, 'sending')) {
      throw APIError.badRequest(`Cannot send campaign with status '${campaign.status}'`);
    }
  } else if (campaign.status !== 'sending') {
    throw APIError.badRequest(`Cannot send campaign with status '${campaign.status}'`);
  }

  // Apply overrides
  if (overrides.batchSize) {
    await prisma.campaign.update({
      where: { id },
      data: { batchSize: overrides.batchSize },
    });
    campaign.batchSize = overrides.batchSize;
  }
  if (overrides.batchDelayMs) {
    await prisma.campaign.update({
      where: { id },
      data: { batchDelayMs: overrides.batchDelayMs },
    });
    campaign.batchDelayMs = overrides.batchDelayMs;
  }

  // Get recipients (in production, would query patients with consent)
  const recipients = await getCampaignRecipients(campaign);

  if (recipients.length === 0 && campaign.currentBatch === 0) {
    throw APIError.badRequest('No eligible recipients found (check marketing consent)');
  }

  // Create recipient records if this is first send
  if (campaign.currentBatch === 0) {
    // In production, would create recipients from patient query
    // For now, just update campaign stats
    await prisma.campaign.update({
      where: { id },
      data: {
        stats: {
          ...campaign.stats as any,
          totalRecipients: recipients.length,
        },
        totalBatches: Math.ceil(recipients.length / campaign.batchSize),
      },
    });
  }

  // Update campaign status
  await prisma.campaign.update({
    where: { id },
    data: {
      status: 'sending',
      sendingStartedAt: campaign.sendingStartedAt || new Date(),
    },
  });

  // Process first batch
  const batchResult = await processCampaignBatch(campaign, campaign.currentBatch + 1);

  // Update stats
  const stats = campaign.stats as any;
  const newStats = {
    ...stats,
    sent: stats.sent + batchResult.sent,
    failed: stats.failed + batchResult.failed,
  };

  // Update delivery stats
  const deliveredCount = await prisma.campaignRecipient.count({
    where: {
      campaignId: id,
      status: 'delivered',
    },
  });

  newStats.delivered = deliveredCount;
  newStats.deliveryRate = newStats.sent > 0
    ? (newStats.delivered / newStats.sent) * 100
    : 0;

  const currentBatch = campaign.currentBatch + 1;
  const totalBatches = campaign.totalBatches;

  // Check if campaign is complete or failed
  let status = 'sending';
  let sentAt = null;

  if (currentBatch >= totalBatches) {
    const failureRate = newStats.sent > 0
      ? (newStats.failed / newStats.totalRecipients) * 100
      : 0;

    if (failureRate > 50) {
      status = 'failed';
    } else {
      status = 'sent';
      sentAt = new Date();
    }
  }

  // Update campaign
  const updatedCampaign = await prisma.campaign.update({
    where: { id },
    data: {
      status: status as any,
      sentAt,
      stats: newStats,
      currentBatch,
      updatedAt: new Date(),
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'campaign',
    resourceId: id,
    ipAddress,
    metadata: {
      action: 'send',
      batch: currentBatch,
      sent: batchResult.sent,
      failed: batchResult.failed,
    },
  });

  return c.json({
    success: true,
    message: `Campaign batch ${currentBatch}/${totalBatches} sent`,
    status: updatedCampaign.status,
    batch: {
      current: currentBatch,
      total: totalBatches,
      sent: batchResult.sent,
      failed: batchResult.failed,
    },
    stats: newStats,
  });
});

/**
 * Get delivery stats
 * GET /api/campaigns/:id/stats
 */
campaigns.get('/:id/stats', zValidator('param', campaignIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const campaign = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!campaign) {
    throw APIError.notFound('Campaign');
  }

  // Get detailed recipient stats
  const recipientsByStatus = {
    pending: await prisma.campaignRecipient.count({
      where: { campaignId: id, status: 'pending' },
    }),
    sent: await prisma.campaignRecipient.count({
      where: { campaignId: id, status: 'sent' },
    }),
    delivered: await prisma.campaignRecipient.count({
      where: { campaignId: id, status: 'delivered' },
    }),
    failed: await prisma.campaignRecipient.count({
      where: { campaignId: id, status: 'failed' },
    }),
    opted_out: await prisma.campaignRecipient.count({
      where: { campaignId: id, status: 'opted_out' },
    }),
  };

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'campaign_stats',
    resourceId: id,
    ipAddress,
  });

  return c.json({
    stats: campaign.stats,
    recipients: recipientsByStatus,
    progress: {
      currentBatch: campaign.currentBatch,
      totalBatches: campaign.totalBatches,
      percentComplete: campaign.totalBatches > 0
        ? (campaign.currentBatch / campaign.totalBatches) * 100
        : 0,
    },
  });
});

/**
 * Pause sending campaign
 * POST /api/campaigns/:id/pause
 */
campaigns.post('/:id/pause', zValidator('param', campaignIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const campaign = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!campaign) {
    throw APIError.notFound('Campaign');
  }

  if (campaign.status !== 'sending') {
    throw APIError.badRequest('Only sending campaigns can be paused');
  }

  const updated = await prisma.campaign.update({
    where: { id },
    data: {
      status: 'paused',
      pausedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'campaign',
    resourceId: id,
    ipAddress,
    metadata: { action: 'pause' },
  });

  return c.json({
    success: true,
    message: 'Campaign paused successfully',
    campaign: {
      id: updated.id,
      status: updated.status,
      pausedAt: updated.pausedAt?.toISOString(),
    },
  });
});

/**
 * Resume paused campaign
 * POST /api/campaigns/:id/resume
 */
campaigns.post('/:id/resume', zValidator('param', campaignIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const campaign = await prisma.campaign.findUnique({
    where: { id },
  });

  if (!campaign) {
    throw APIError.notFound('Campaign');
  }

  if (campaign.status !== 'paused') {
    throw APIError.badRequest('Only paused campaigns can be resumed');
  }

  const updated = await prisma.campaign.update({
    where: { id },
    data: {
      status: 'sending',
      pausedAt: null,
      updatedAt: new Date(),
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'campaign',
    resourceId: id,
    ipAddress,
    metadata: { action: 'resume' },
  });

  return c.json({
    success: true,
    message: 'Campaign resumed successfully',
    campaign: {
      id: updated.id,
      status: updated.status,
    },
  });
});

export default campaigns;
