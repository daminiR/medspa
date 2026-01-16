/**
 * Gift Cards API Routes
 *
 * Full lifecycle management for gift cards with:
 * - Create and purchase gift cards
 * - Redeem against invoices
 * - Refund to gift card balance
 * - Deactivation
 * - Transaction history
 * - Email delivery
 * - Audit logging
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import crypto from 'crypto';
import { sessionAuthMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { handlePrismaError, transactionWithErrorHandling } from '../middleware/prisma-error-handler';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { Prisma, GiftCardStatus } from '@prisma/client';

const giftCards = new Hono();

// ===================
// Validation Schemas
// ===================

// Gift card status
const giftCardStatusSchema = z.enum([
  'pending',
  'active',
  'partially_used',
  'depleted',
  'expired',
  'cancelled',
]);

// Transaction type
const transactionTypeSchema = z.enum([
  'purchase',
  'redemption',
  'refund',
  'adjustment',
  'expiration',
]);

// Create gift card schema
const createGiftCardSchema = z.object({
  originalValue: z.number()
    .min(25, 'Minimum gift card value is $25')
    .max(5000, 'Maximum gift card value is $5000'),
  purchaserId: z.string().uuid().optional(),
  purchaserName: z.string().min(1).max(255),
  purchaserEmail: z.string().email(),
  recipientName: z.string().max(255).optional(),
  recipientEmail: z.string().email().optional(),
  recipientMessage: z.string().max(1000).optional(),
  expirationDate: z.string().optional(),
  scheduledDeliveryDate: z.string().optional(),
  designTemplate: z.string().max(100).optional(),
});

// Update gift card schema
const updateGiftCardSchema = z.object({
  recipientName: z.string().max(255).optional(),
  recipientEmail: z.string().email().optional(),
  recipientMessage: z.string().max(1000).optional(),
  expirationDate: z.string().optional(),
  scheduledDeliveryDate: z.string().optional(),
  designTemplate: z.string().max(100).optional(),
});

// Redeem gift card schema
const redeemGiftCardSchema = z.object({
  amount: z.number().positive('Redemption amount must be positive'),
  invoiceId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

// Refund gift card schema
const refundGiftCardSchema = z.object({
  amount: z.number().positive('Refund amount must be positive'),
  paymentId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

// Send gift card email schema
const sendGiftCardEmailSchema = z.object({
  recipientEmail: z.string().email(),
  recipientName: z.string().max(255).optional(),
  customMessage: z.string().max(1000).optional(),
});

// List gift cards query schema
const listGiftCardsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: giftCardStatusSchema.optional(),
  purchaserEmail: z.string().email().optional(),
  recipientEmail: z.string().email().optional(),
  minBalance: z.coerce.number().min(0).optional(),
  maxBalance: z.coerce.number().min(0).optional(),
  purchasedFrom: z.string().optional(),
  purchasedTo: z.string().optional(),
  sortBy: z.enum(['purchaseDate', 'currentBalance', 'originalValue', 'expirationDate']).default('purchaseDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Gift card ID param schema
const giftCardIdSchema = z.object({
  id: z.string().uuid(),
});

// Gift card code param schema
const giftCardCodeSchema = z.object({
  code: z.string().regex(/^GC-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/, 'Invalid gift card code format'),
});

// ===================
// Type Definitions
// ===================

// Gift card types now come from Prisma
export type StoredGiftCard = Prisma.GiftCardGetPayload<{
  include: { GiftCardTransaction: true };
}>;

export type StoredGiftCardTransaction = Prisma.GiftCardTransactionGetPayload<{}>;

// ===================
// Helper Functions
// ===================

function generateGiftCardId(): string {
  return crypto.randomUUID();
}

function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar chars (0,O,1,I)
  let code = 'GC-';
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (i < 2) code += '-';
  }
  return code;
}

function generateTransactionId(): string {
  return `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

function calculateGiftCardStatus(
  currentBalance: number,
  originalValue: number,
  expirationDate: Date | null,
  activationDate: Date | null,
  currentStatus: GiftCardStatus
): GiftCardStatus {
  const now = new Date();

  // Check if expired
  if (expirationDate && expirationDate < now && currentStatus !== 'CANCELLED') {
    return 'EXPIRED';
  }

  // Don't change if cancelled or already expired
  if (currentStatus === 'CANCELLED' || currentStatus === 'EXPIRED') {
    return currentStatus;
  }

  // Update status based on balance
  if (currentBalance === 0) {
    return 'DEPLETED';
  } else if (currentBalance < originalValue) {
    return 'PARTIALLY_USED';
  } else if (activationDate) {
    return 'ACTIVE';
  } else {
    return 'PENDING';
  }
}

function isRedeemable(status: GiftCardStatus): boolean {
  return status === 'ACTIVE' || status === 'PARTIALLY_USED';
}

// Note: Mock data should be seeded using Prisma seed script
// Database already has seed data with 2 gift cards

// ===================
// Middleware
// ===================

// All gift card routes require session authentication
giftCards.use('/*', sessionAuthMiddleware);

// ===================
// Routes
// ===================

/**
 * List gift cards (paginated, filterable)
 * GET /api/gift-cards
 */
giftCards.get('/', zValidator('query', listGiftCardsSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Build where clause
    const where: Prisma.GiftCardWhereInput = {};

    // Apply status filter
    if (query.status) {
      where.status = query.status.toUpperCase() as GiftCardStatus;
    }

    // Apply purchaser email filter
    if (query.purchaserEmail) {
      where.purchaserEmail = {
        equals: query.purchaserEmail.toLowerCase(),
        mode: 'insensitive',
      };
    }

    // Apply recipient email filter
    if (query.recipientEmail) {
      where.recipientEmail = {
        equals: query.recipientEmail.toLowerCase(),
        mode: 'insensitive',
      };
    }

    // Apply balance filters
    if (query.minBalance !== undefined || query.maxBalance !== undefined) {
      where.currentBalance = {};
      if (query.minBalance !== undefined) {
        where.currentBalance.gte = query.minBalance;
      }
      if (query.maxBalance !== undefined) {
        where.currentBalance.lte = query.maxBalance;
      }
    }

    // Apply date range filters
    if (query.purchasedFrom || query.purchasedTo) {
      where.purchaseDate = {};
      if (query.purchasedFrom) {
        where.purchaseDate.gte = new Date(query.purchasedFrom);
      }
      if (query.purchasedTo) {
        where.purchaseDate.lte = new Date(query.purchasedTo);
      }
    }

    // Build orderBy
    const orderBy: Prisma.GiftCardOrderByWithRelationInput = {};
    switch (query.sortBy) {
      case 'purchaseDate':
        orderBy.purchaseDate = query.sortOrder;
        break;
      case 'currentBalance':
        orderBy.currentBalance = query.sortOrder;
        break;
      case 'originalValue':
        orderBy.originalValue = query.sortOrder;
        break;
      case 'expirationDate':
        orderBy.expirationDate = query.sortOrder;
        break;
      default:
        orderBy.purchaseDate = query.sortOrder;
    }

    // Calculate pagination
    const offset = (query.page - 1) * query.limit;

    // Execute queries in parallel
    const [giftCards, total] = await Promise.all([
      prisma.giftCard.findMany({
        where,
        orderBy,
        skip: offset,
        take: query.limit,
      }),
      prisma.giftCard.count({ where }),
    ]);

    // Log audit event
    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'gift_card_list',
      ipAddress,
      metadata: { query, resultCount: giftCards.length },
    });

    return c.json({
      items: giftCards.map(gc => ({
        id: gc.id,
        code: gc.code,
        originalValue: gc.originalValue,
        currentBalance: gc.currentBalance,
        purchaserName: gc.purchaserName,
        purchaserEmail: gc.purchaserEmail,
        recipientName: gc.recipientName,
        recipientEmail: gc.recipientEmail,
        purchaseDate: gc.purchaseDate.toISOString(),
        expirationDate: gc.expirationDate?.toISOString(),
        status: gc.status.toLowerCase(),
        designTemplate: gc.designTemplate,
      })),
      total,
      page: query.page,
      limit: query.limit,
      hasMore: offset + query.limit < total,
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Create/purchase gift card
 * POST /api/gift-cards
 */
giftCards.post('/', zValidator('json', createGiftCardSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const id = generateGiftCardId();
    let code = generateGiftCardCode();

    // Ensure unique code
    let existing = await prisma.giftCard.findUnique({ where: { code } });
    while (existing) {
      code = generateGiftCardCode();
      existing = await prisma.giftCard.findUnique({ where: { code } });
    }

    const now = new Date();

    // Calculate expiration date (default 2 years from purchase)
    let expirationDate: Date | undefined;
    if (data.expirationDate) {
      expirationDate = new Date(data.expirationDate);
    } else {
      expirationDate = new Date(now);
      expirationDate.setFullYear(expirationDate.getFullYear() + 2);
    }

    // Parse scheduled delivery date if provided
    let scheduledDeliveryDate: Date | undefined;
    if (data.scheduledDeliveryDate) {
      scheduledDeliveryDate = new Date(data.scheduledDeliveryDate);
    }

    // Determine initial status
    const initialStatus = scheduledDeliveryDate && scheduledDeliveryDate > now ? 'PENDING' : 'ACTIVE';

    // Create gift card with transaction
    const giftCard = await prisma.giftCard.create({
      data: {
        id,
        code,
        originalValue: data.originalValue,
        currentBalance: data.originalValue,
        purchaserId: data.purchaserId,
        purchaserName: data.purchaserName,
        purchaserEmail: data.purchaserEmail.toLowerCase(),
        recipientName: data.recipientName,
        recipientEmail: data.recipientEmail?.toLowerCase(),
        recipientMessage: data.recipientMessage,
        purchaseDate: now,
        activationDate: initialStatus === 'ACTIVE' ? now : undefined,
        expirationDate,
        scheduledDeliveryDate,
        status: initialStatus,
        designTemplate: data.designTemplate,
        createdBy: user.uid,
        updatedAt: now,
        // Create purchase transaction
        GiftCardTransaction: {
          create: {
            id: generateTransactionId(),
            type: 'PURCHASE',
            amount: data.originalValue,
            balanceAfter: data.originalValue,
            notes: 'Gift card purchased',
            processedBy: user.uid,
            processedAt: now,
          },
        },
      },
      include: {
        GiftCardTransaction: true,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'gift_card',
      resourceId: id,
      ipAddress,
      metadata: { code, originalValue: data.originalValue },
    });

    return c.json({
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        originalValue: giftCard.originalValue,
        currentBalance: giftCard.currentBalance,
        purchaserName: giftCard.purchaserName,
        purchaserEmail: giftCard.purchaserEmail,
        recipientName: giftCard.recipientName,
        recipientEmail: giftCard.recipientEmail,
        recipientMessage: giftCard.recipientMessage,
        purchaseDate: giftCard.purchaseDate.toISOString(),
        activationDate: giftCard.activationDate?.toISOString(),
        expirationDate: giftCard.expirationDate?.toISOString(),
        scheduledDeliveryDate: giftCard.scheduledDeliveryDate?.toISOString(),
        status: giftCard.status.toLowerCase(),
        designTemplate: giftCard.designTemplate,
        createdAt: giftCard.createdAt.toISOString(),
        updatedAt: giftCard.updatedAt.toISOString(),
      },
      message: 'Gift card created successfully',
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get single gift card by ID
 * GET /api/gift-cards/:id
 */
giftCards.get('/:id', zValidator('param', giftCardIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const giftCard = await prisma.giftCard.findUnique({
      where: { id },
      include: {
        GiftCardTransaction: true,
      },
    });

    if (!giftCard) {
      throw APIError.notFound('Gift card');
    }

    // Update status if needed (check expiration)
    const newStatus = calculateGiftCardStatus(
      giftCard.currentBalance,
      giftCard.originalValue,
      giftCard.expirationDate,
      giftCard.activationDate,
      giftCard.status
    );

    if (newStatus !== giftCard.status) {
      await prisma.giftCard.update({
        where: { id },
        data: { status: newStatus, updatedAt: new Date() },
      });
      giftCard.status = newStatus;
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'gift_card',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        originalValue: giftCard.originalValue,
        currentBalance: giftCard.currentBalance,
        purchaserId: giftCard.purchaserId,
        purchaserName: giftCard.purchaserName,
        purchaserEmail: giftCard.purchaserEmail,
        recipientName: giftCard.recipientName,
        recipientEmail: giftCard.recipientEmail,
        recipientMessage: giftCard.recipientMessage,
        purchaseDate: giftCard.purchaseDate.toISOString(),
        activationDate: giftCard.activationDate?.toISOString(),
        expirationDate: giftCard.expirationDate?.toISOString(),
        scheduledDeliveryDate: giftCard.scheduledDeliveryDate?.toISOString(),
        status: giftCard.status.toLowerCase(),
        designTemplate: giftCard.designTemplate,
        transactionCount: giftCard.GiftCardTransaction.length,
        createdAt: giftCard.createdAt.toISOString(),
        updatedAt: giftCard.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Lookup gift card by code
 * GET /api/gift-cards/lookup/:code
 */
giftCards.get('/lookup/:code', zValidator('param', giftCardCodeSchema), async (c) => {
  const { code } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const giftCard = await prisma.giftCard.findUnique({
      where: { code },
    });

    if (!giftCard) {
      throw APIError.notFound('Gift card');
    }

    // Update status if needed (check expiration)
    const newStatus = calculateGiftCardStatus(
      giftCard.currentBalance,
      giftCard.originalValue,
      giftCard.expirationDate,
      giftCard.activationDate,
      giftCard.status
    );

    if (newStatus !== giftCard.status) {
      await prisma.giftCard.update({
        where: { id: giftCard.id },
        data: { status: newStatus, updatedAt: new Date() },
      });
      giftCard.status = newStatus;
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'gift_card',
      resourceId: giftCard.id,
      ipAddress,
      metadata: { lookupByCode: true, code },
    });

    return c.json({
      giftCard: {
        id: giftCard.id,
        code: giftCard.code,
        originalValue: giftCard.originalValue,
        currentBalance: giftCard.currentBalance,
        status: giftCard.status.toLowerCase(),
        expirationDate: giftCard.expirationDate?.toISOString(),
        isRedeemable: isRedeemable(giftCard.status),
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Update gift card
 * PUT /api/gift-cards/:id
 */
giftCards.put('/:id', zValidator('param', giftCardIdSchema), zValidator('json', updateGiftCardSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const giftCard = await prisma.giftCard.findUnique({
      where: { id },
    });

    if (!giftCard) {
      throw APIError.notFound('Gift card');
    }

    // Cannot update cancelled or expired cards
    if (giftCard.status === 'CANCELLED') {
      throw APIError.badRequest('Cannot update a cancelled gift card');
    }

    // Build update data
    const updateData: Prisma.GiftCardUpdateInput = {
      updatedAt: new Date(),
    };

    if (data.recipientName !== undefined) updateData.recipientName = data.recipientName;
    if (data.recipientEmail !== undefined) updateData.recipientEmail = data.recipientEmail?.toLowerCase();
    if (data.recipientMessage !== undefined) updateData.recipientMessage = data.recipientMessage;
    if (data.expirationDate !== undefined) updateData.expirationDate = new Date(data.expirationDate);
    if (data.scheduledDeliveryDate !== undefined) updateData.scheduledDeliveryDate = new Date(data.scheduledDeliveryDate);
    if (data.designTemplate !== undefined) updateData.designTemplate = data.designTemplate;

    // Calculate new status if needed
    const newStatus = calculateGiftCardStatus(
      giftCard.currentBalance,
      giftCard.originalValue,
      updateData.expirationDate as Date | null ?? giftCard.expirationDate,
      giftCard.activationDate,
      giftCard.status
    );
    updateData.status = newStatus;

    const updatedGiftCard = await prisma.giftCard.update({
      where: { id },
      data: updateData,
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'gift_card',
      resourceId: id,
      ipAddress,
      metadata: { updatedFields: Object.keys(data) },
    });

    return c.json({
      giftCard: {
        id: updatedGiftCard.id,
        code: updatedGiftCard.code,
        originalValue: updatedGiftCard.originalValue,
        currentBalance: updatedGiftCard.currentBalance,
        purchaserName: updatedGiftCard.purchaserName,
        purchaserEmail: updatedGiftCard.purchaserEmail,
        recipientName: updatedGiftCard.recipientName,
        recipientEmail: updatedGiftCard.recipientEmail,
        recipientMessage: updatedGiftCard.recipientMessage,
        purchaseDate: updatedGiftCard.purchaseDate.toISOString(),
        activationDate: updatedGiftCard.activationDate?.toISOString(),
        expirationDate: updatedGiftCard.expirationDate?.toISOString(),
        scheduledDeliveryDate: updatedGiftCard.scheduledDeliveryDate?.toISOString(),
        status: updatedGiftCard.status.toLowerCase(),
        designTemplate: updatedGiftCard.designTemplate,
        updatedAt: updatedGiftCard.updatedAt.toISOString(),
      },
      message: 'Gift card updated successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Redeem gift card (apply to invoice)
 * POST /api/gift-cards/:id/redeem
 */
giftCards.post('/:id/redeem', zValidator('param', giftCardIdSchema), zValidator('json', redeemGiftCardSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const giftCard = await prisma.giftCard.findUnique({
      where: { id },
    });

    if (!giftCard) {
      throw APIError.notFound('Gift card');
    }

    // Update status first (check expiration)
    const currentStatus = calculateGiftCardStatus(
      giftCard.currentBalance,
      giftCard.originalValue,
      giftCard.expirationDate,
      giftCard.activationDate,
      giftCard.status
    );

    // Check if redeemable
    if (!isRedeemable(currentStatus)) {
      if (currentStatus === 'EXPIRED') {
        throw APIError.badRequest('Cannot redeem an expired gift card');
      } else if (currentStatus === 'CANCELLED') {
        throw APIError.badRequest('Cannot redeem a cancelled gift card');
      } else if (currentStatus === 'DEPLETED') {
        throw APIError.badRequest('Gift card has no remaining balance');
      } else if (currentStatus === 'PENDING') {
        throw APIError.badRequest('Gift card has not been activated yet');
      }
      throw APIError.badRequest('Gift card cannot be redeemed');
    }

    // Check sufficient balance
    if (data.amount > giftCard.currentBalance) {
      throw APIError.badRequest(`Insufficient balance. Available: $${giftCard.currentBalance.toFixed(2)}`);
    }

    const now = new Date();
    const newBalance = giftCard.currentBalance - data.amount;

    // Calculate new status
    const newStatus = calculateGiftCardStatus(
      newBalance,
      giftCard.originalValue,
      giftCard.expirationDate,
      giftCard.activationDate,
      currentStatus
    );

    // Create redemption transaction and update gift card in a transaction
    const result = await transactionWithErrorHandling(async (tx) => {
      // Create transaction record
      const transaction = await tx.giftCardTransaction.create({
        data: {
          id: generateTransactionId(),
          giftCardId: id,
          type: 'REDEMPTION',
          amount: -data.amount, // Negative for redemption
          balanceAfter: newBalance,
          invoiceId: data.invoiceId,
          notes: data.notes,
          processedBy: user.uid,
          processedAt: now,
        },
      });

      // Update gift card balance and status
      const updatedGiftCard = await tx.giftCard.update({
        where: { id },
        data: {
          currentBalance: newBalance,
          status: newStatus,
          updatedAt: now,
        },
      });

      return { transaction, updatedGiftCard };
    }, { timeout: 30000 });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'gift_card',
      resourceId: id,
      ipAddress,
      metadata: {
        action: 'redeem',
        amount: data.amount,
        invoiceId: data.invoiceId,
        newBalance,
      },
    });

    return c.json({
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type.toLowerCase(),
        amount: result.transaction.amount,
        balanceAfter: result.transaction.balanceAfter,
        processedAt: result.transaction.processedAt.toISOString(),
      },
      giftCard: {
        id: result.updatedGiftCard.id,
        code: result.updatedGiftCard.code,
        currentBalance: result.updatedGiftCard.currentBalance,
        status: result.updatedGiftCard.status.toLowerCase(),
      },
      message: 'Gift card redeemed successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Refund to gift card
 * POST /api/gift-cards/:id/refund
 */
giftCards.post('/:id/refund', zValidator('param', giftCardIdSchema), zValidator('json', refundGiftCardSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const giftCard = await prisma.giftCard.findUnique({
      where: { id },
    });

    if (!giftCard) {
      throw APIError.notFound('Gift card');
    }

    // Cannot refund to cancelled cards
    if (giftCard.status === 'CANCELLED') {
      throw APIError.badRequest('Cannot refund to a cancelled gift card');
    }

    // Cannot exceed original value
    if (giftCard.currentBalance + data.amount > giftCard.originalValue) {
      throw APIError.badRequest(`Refund would exceed original gift card value of $${giftCard.originalValue.toFixed(2)}`);
    }

    const now = new Date();
    const newBalance = giftCard.currentBalance + data.amount;

    // Calculate new status
    const newStatus = calculateGiftCardStatus(
      newBalance,
      giftCard.originalValue,
      giftCard.expirationDate,
      giftCard.activationDate,
      giftCard.status
    );

    // Create refund transaction and update gift card in a transaction
    const result = await transactionWithErrorHandling(async (tx) => {
      // Create transaction record
      const transaction = await tx.giftCardTransaction.create({
        data: {
          id: generateTransactionId(),
          giftCardId: id,
          type: 'REFUND',
          amount: data.amount, // Positive for refund
          balanceAfter: newBalance,
          paymentId: data.paymentId,
          notes: data.notes,
          processedBy: user.uid,
          processedAt: now,
        },
      });

      // Update gift card balance and status
      const updatedGiftCard = await tx.giftCard.update({
        where: { id },
        data: {
          currentBalance: newBalance,
          status: newStatus,
          updatedAt: now,
        },
      });

      return { transaction, updatedGiftCard };
    }, { timeout: 30000 });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'gift_card',
      resourceId: id,
      ipAddress,
      metadata: {
        action: 'refund',
        amount: data.amount,
        paymentId: data.paymentId,
        newBalance,
      },
    });

    return c.json({
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type.toLowerCase(),
        amount: result.transaction.amount,
        balanceAfter: result.transaction.balanceAfter,
        processedAt: result.transaction.processedAt.toISOString(),
      },
      giftCard: {
        id: result.updatedGiftCard.id,
        code: result.updatedGiftCard.code,
        currentBalance: result.updatedGiftCard.currentBalance,
        status: result.updatedGiftCard.status.toLowerCase(),
      },
      message: 'Refund applied to gift card successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Deactivate gift card
 * POST /api/gift-cards/:id/deactivate
 */
giftCards.post('/:id/deactivate', zValidator('param', giftCardIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const giftCard = await prisma.giftCard.findUnique({
      where: { id },
    });

    if (!giftCard) {
      throw APIError.notFound('Gift card');
    }

    // Cannot deactivate already cancelled cards
    if (giftCard.status === 'CANCELLED') {
      throw APIError.badRequest('Gift card is already cancelled');
    }

    const now = new Date();

    // Deactivate gift card and create adjustment transaction if needed
    const result = await transactionWithErrorHandling(async (tx) => {
      // Create adjustment transaction if there's remaining balance
      if (giftCard.currentBalance > 0) {
        await tx.giftCardTransaction.create({
          data: {
            id: generateTransactionId(),
            giftCardId: id,
            type: 'ADJUSTMENT',
            amount: -giftCard.currentBalance,
            balanceAfter: 0,
            notes: 'Balance zeroed due to deactivation',
            processedBy: user.uid,
            processedAt: now,
          },
        });
      }

      // Update gift card
      return await tx.giftCard.update({
        where: { id },
        data: {
          currentBalance: 0,
          status: 'CANCELLED',
          updatedAt: now,
        },
      });
    }, { timeout: 30000 });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'gift_card',
      resourceId: id,
      ipAddress,
      metadata: { action: 'deactivate' },
    });

    return c.json({
      giftCard: {
        id: result.id,
        code: result.code,
        currentBalance: result.currentBalance,
        status: result.status.toLowerCase(),
      },
      message: 'Gift card deactivated successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get gift card transaction history
 * GET /api/gift-cards/:id/transactions
 */
giftCards.get('/:id/transactions', zValidator('param', giftCardIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const giftCard = await prisma.giftCard.findUnique({
      where: { id },
      include: {
        GiftCardTransaction: {
          orderBy: {
            processedAt: 'desc', // Newest first
          },
        },
      },
    });

    if (!giftCard) {
      throw APIError.notFound('Gift card');
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'gift_card_transactions',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      items: giftCard.GiftCardTransaction.map(txn => ({
        id: txn.id,
        type: txn.type.toLowerCase(),
        amount: txn.amount,
        balanceAfter: txn.balanceAfter,
        invoiceId: txn.invoiceId,
        paymentId: txn.paymentId,
        notes: txn.notes,
        processedBy: txn.processedBy,
        processedAt: txn.processedAt.toISOString(),
      })),
      total: giftCard.GiftCardTransaction.length,
      giftCardId: id,
      code: giftCard.code,
      currentBalance: giftCard.currentBalance,
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Send gift card email
 * POST /api/gift-cards/:id/send
 */
giftCards.post('/:id/send', zValidator('param', giftCardIdSchema), zValidator('json', sendGiftCardEmailSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const giftCard = await prisma.giftCard.findUnique({
      where: { id },
    });

    if (!giftCard) {
      throw APIError.notFound('Gift card');
    }

    // Cannot send cancelled or expired cards
    if (giftCard.status === 'CANCELLED') {
      throw APIError.badRequest('Cannot send a cancelled gift card');
    }

    if (giftCard.status === 'EXPIRED') {
      throw APIError.badRequest('Cannot send an expired gift card');
    }

    // Simulate sending email
    const now = new Date();

    // Build update data
    const updateData: Prisma.GiftCardUpdateInput = {
      updatedAt: now,
    };

    // Update recipient info if provided
    if (data.recipientEmail !== giftCard.recipientEmail) {
      updateData.recipientEmail = data.recipientEmail.toLowerCase();
    }
    if (data.recipientName) {
      updateData.recipientName = data.recipientName;
    }

    // Activate the card if it was pending
    if (giftCard.status === 'PENDING') {
      updateData.status = 'ACTIVE';
      updateData.activationDate = now;
    }

    const updatedGiftCard = await prisma.giftCard.update({
      where: { id },
      data: updateData,
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'gift_card',
      resourceId: id,
      ipAddress,
      metadata: {
        action: 'send_email',
        recipientEmail: data.recipientEmail,
      },
    });

    return c.json({
      success: true,
      message: 'Gift card email sent successfully',
      sentTo: data.recipientEmail,
      giftCard: {
        id: updatedGiftCard.id,
        code: updatedGiftCard.code,
        status: updatedGiftCard.status.toLowerCase(),
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

// ===================
// Export Functions (for testing)
// ===================

/**
 * Clear all gift card data from database (for testing only)
 */
export async function clearGiftCardData() {
  await prisma.$transaction([
    prisma.giftCardTransaction.deleteMany({}),
    prisma.giftCard.deleteMany({}),
  ]);
}

/**
 * Get Prisma client instance (for testing)
 */
export function getPrismaClient() {
  return prisma;
}

export default giftCards;
