/**
 * Inventory Adjustments API Routes
 *
 * Manual adjustments, treatment usage, waste tracking, transfers, and physical counts with:
 * - FEFO (First Expire First Out) lot selection for treatment usage
 * - Waste tracking with categorized reasons
 * - Inter-location transfers with status workflow
 * - Physical inventory counts with variance calculation
 * - Audit logging for FDA compliance
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as crypto from 'crypto';
import { sessionAuthMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { handlePrismaError, transactionWithErrorHandling } from '../middleware/prisma-error-handler';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import {
  Prisma,
  InventoryTransactionType,
  TransferStatus,
  CountStatus,
  WasteReason,
  LotStatusType,
  ProductUnitType
} from '@prisma/client';

const inventoryAdjustments = new Hono();

// ===================
// Type Definitions (aligned with apps/admin/src/types/inventory.ts)
// ===================

// Transaction types
const transactionTypeSchema = z.enum([
  'receive',
  'adjustment_add',
  'adjustment_remove',
  'treatment_use',
  'transfer_out',
  'transfer_in',
  'damage',
  'expiration',
  'recall',
  'return_vendor',
  'sale',
  'waste',
  'reconstitution',
]);

type TransactionType = z.infer<typeof transactionTypeSchema>;

const transactionStatusSchema = z.enum(['pending', 'completed', 'cancelled', 'reversed']);
type TransactionStatus = z.infer<typeof transactionStatusSchema>;

const unitTypeSchema = z.enum(['units', 'syringe', 'vial', 'ml', 'cc', 'gram', 'piece', 'box', 'kit']);
type UnitType = z.infer<typeof unitTypeSchema>;

// Waste reasons
const wasteReasonSchema = z.enum([
  'expired_unused',
  'stability_exceeded',
  'contamination',
  'draw_up_loss',
  'patient_no_show',
  'adverse_reaction_discard',
  'training',
  'damaged',
  'recall',
  'other',
]);

type WasteReasonType = z.infer<typeof wasteReasonSchema>;

// Transfer status
const transferStatusSchema = z.enum(['draft', 'requested', 'approved', 'in_transit', 'received', 'cancelled']);
type TransferStatusType = z.infer<typeof transferStatusSchema>;

// Count status
const countStatusSchema = z.enum(['draft', 'in_progress', 'completed', 'approved', 'posted']);
type CountStatusType = z.infer<typeof countStatusSchema>;

// Lot status
const lotStatusSchema = z.enum(['available', 'quarantine', 'expired', 'recalled', 'depleted', 'damaged']);
type LotStatus = z.infer<typeof lotStatusSchema>;

// ===================
// Validation Schemas
// ===================

// ID param schemas
const idParamSchema = z.object({
  id: z.string().uuid(),
});

// List transactions query
const listTransactionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: transactionTypeSchema.optional(),
  productId: z.string().uuid().optional(),
  lotId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  patientId: z.string().uuid().optional(),
  practitionerId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['timestamp', 'quantity', 'totalCost']).default('timestamp'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Manual adjustment schema
const createAdjustmentSchema = z.object({
  productId: z.string().uuid(),
  lotId: z.string().uuid(),
  adjustmentType: z.enum(['add', 'remove']),
  quantity: z.number().positive(),
  reason: z.string().min(1).max(500),
  notes: z.string().max(2000).optional(),
  locationId: z.string().uuid(),
  requiresApproval: z.boolean().default(false),
});

// Inventory usage schema (from treatment)
const inventoryUseSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().positive(),
  lotId: z.string().uuid().optional(), // If not specified, use FEFO
  appointmentId: z.string().uuid(),
  patientId: z.string().uuid(),
  practitionerId: z.string().uuid(),
  locationId: z.string().uuid(),
  treatmentDetails: z.object({
    serviceName: z.string().min(1).max(255),
    areasInjected: z.array(z.object({
      name: z.string().min(1).max(100),
      units: z.number().positive(),
    })).optional(),
    chartId: z.string().uuid().optional(),
  }).optional(),
});

// Waste recording schema
const recordWasteSchema = z.object({
  productId: z.string().uuid(),
  lotId: z.string().uuid().optional(),
  openVialSessionId: z.string().uuid().optional(),
  unitsWasted: z.number().positive(),
  reason: wasteReasonSchema,
  reasonNotes: z.string().max(1000).optional(),
  practitionerId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  locationId: z.string().uuid(),
});

// Transfer schemas
const listTransfersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: transferStatusSchema.optional(),
  sourceLocationId: z.string().uuid().optional(),
  destinationLocationId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

const transferItemSchema = z.object({
  productId: z.string().uuid(),
  lotId: z.string().uuid(),
  requestedQuantity: z.number().positive(),
  notes: z.string().max(500).optional(),
});

const createTransferSchema = z.object({
  sourceLocationId: z.string().uuid(),
  destinationLocationId: z.string().uuid(),
  items: z.array(transferItemSchema).min(1),
  requestNotes: z.string().max(2000).optional(),
});

const shipTransferSchema = z.object({
  trackingNumber: z.string().max(100).optional(),
  carrier: z.string().max(100).optional(),
  items: z.array(z.object({
    itemId: z.string().uuid(),
    shippedQuantity: z.number().nonnegative(),
  })).optional(),
});

const receiveTransferSchema = z.object({
  items: z.array(z.object({
    itemId: z.string().uuid(),
    receivedQuantity: z.number().nonnegative(),
    notes: z.string().max(500).optional(),
  })).min(1),
  receivingNotes: z.string().max(2000).optional(),
});

// Inventory count schemas
const listCountsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: countStatusSchema.optional(),
  locationId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

const countItemSchema = z.object({
  productId: z.string().uuid(),
  lotId: z.string().uuid().optional(),
});

const createCountSchema = z.object({
  locationId: z.string().uuid(),
  countType: z.enum(['full', 'cycle', 'spot', 'category']),
  scheduledDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  categoryFilter: z.string().optional(),
  productFilter: z.array(z.string().uuid()).optional(),
  items: z.array(countItemSchema).optional(),
  notes: z.string().max(2000).optional(),
});

const updateCountSchema = z.object({
  items: z.array(z.object({
    itemId: z.string().uuid(),
    countedQuantity: z.number().nonnegative(),
    notes: z.string().max(500).optional(),
  })).min(1),
});

// ===================
// Helper Functions
// ===================

function generateId(): string {
  return crypto.randomUUID();
}

async function generateTransferNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const lastTransfer = await prisma.inventoryTransfer.findFirst({
    where: {
      transferNumber: {
        startsWith: `TRF-${year}-`,
      },
    },
    orderBy: {
      transferNumber: 'desc',
    },
  });

  let counter = 0;
  if (lastTransfer) {
    const lastNumber = parseInt(lastTransfer.transferNumber.split('-')[2]);
    counter = lastNumber;
  }

  counter++;
  return `TRF-${year}-${counter.toString().padStart(4, '0')}`;
}

async function generateCountNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const lastCount = await prisma.inventoryCount.findFirst({
    where: {
      countNumber: {
        startsWith: `CNT-${year}-`,
      },
    },
    orderBy: {
      countNumber: 'desc',
    },
  });

  let counter = 0;
  if (lastCount) {
    const lastNumber = parseInt(lastCount.countNumber.split('-')[2]);
    counter = lastNumber;
  }

  counter++;
  return `CNT-${year}-${counter.toString().padStart(4, '0')}`;
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

/**
 * FEFO (First Expire First Out) lot selection
 * Selects the lot that expires soonest with sufficient quantity
 */
async function selectLotByFEFO(productId: string, quantity: number, locationId: string) {
  const availableLots = await prisma.inventoryLot.findMany({
    where: {
      productId,
      locationId,
      status: LotStatusType.available,
      expirationDate: {
        gt: new Date(),
      },
    },
    orderBy: {
      expirationDate: 'asc',
    },
  });

  for (const lot of availableLots) {
    const available = lot.currentQuantity - lot.reservedQuantity;
    if (available >= quantity) {
      return lot;
    }
  }

  return null;
}

function isValidTransferStatusTransition(from: TransferStatus, to: TransferStatus): boolean {
  const transitions: Record<TransferStatus, TransferStatus[]> = {
    DRAFT: ['REQUESTED', 'CANCELLED'],
    REQUESTED: ['APPROVED', 'CANCELLED'],
    APPROVED: ['IN_TRANSIT', 'CANCELLED'],
    IN_TRANSIT: ['RECEIVED', 'CANCELLED'],
    RECEIVED: [],
    CANCELLED: [],
  };

  return transitions[from]?.includes(to) ?? false;
}

function isValidCountStatusTransition(from: CountStatus, to: CountStatus): boolean {
  const transitions: Record<CountStatus, CountStatus[]> = {
    IN_PROGRESS: ['COMPLETED'],
    COMPLETED: ['CANCELLED'],
    CANCELLED: [],
  };

  return transitions[from]?.includes(to) ?? false;
}

// Map local enum values to Prisma enum values
function mapToInventoryTransactionType(type: TransactionType): InventoryTransactionType {
  const mapping: Record<string, InventoryTransactionType> = {
    'receive': InventoryTransactionType.PURCHASE,
    'adjustment_add': InventoryTransactionType.ADJUSTMENT,
    'adjustment_remove': InventoryTransactionType.ADJUSTMENT,
    'treatment_use': InventoryTransactionType.TREATMENT_USE,
    'transfer_out': InventoryTransactionType.TRANSFER_OUT,
    'transfer_in': InventoryTransactionType.TRANSFER_IN,
    'damage': InventoryTransactionType.WASTE,
    'expiration': InventoryTransactionType.EXPIRED,
    'recall': InventoryTransactionType.RETURN,
    'return_vendor': InventoryTransactionType.RETURN,
    'sale': InventoryTransactionType.SALE,
    'waste': InventoryTransactionType.WASTE,
    'reconstitution': InventoryTransactionType.ADJUSTMENT,
  };
  return mapping[type] || InventoryTransactionType.ADJUSTMENT;
}

function mapToWasteReason(reason: WasteReasonType): WasteReason {
  const mapping: Record<string, WasteReason> = {
    'expired_unused': WasteReason.EXPIRED,
    'stability_exceeded': WasteReason.EXPIRED,
    'contamination': WasteReason.CONTAMINATION,
    'draw_up_loss': WasteReason.SPILL,
    'patient_no_show': WasteReason.PATIENT_NO_SHOW,
    'adverse_reaction_discard': WasteReason.OTHER,
    'training': WasteReason.OTHER,
    'damaged': WasteReason.DAMAGED,
    'recall': WasteReason.RECALLED,
    'other': WasteReason.OTHER,
  };
  return mapping[reason] || WasteReason.OTHER;
}

// ===================
// Middleware
// ===================

inventoryAdjustments.use('/*', sessionAuthMiddleware);

// ===================
// Transaction Routes
// ===================

/**
 * List inventory transactions
 * GET /api/inventory/transactions
 */
inventoryAdjustments.get('/transactions', zValidator('query', listTransactionsSchema), async (c) => {
  try {
    const query = c.req.valid('query');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const where: Prisma.InventoryTransactionWhereInput = {};

    // Apply filters
    if (query.productId) {
      where.productId = query.productId;
    }
    if (query.lotId) {
      where.lotId = query.lotId;
    }
    if (query.locationId) {
      where.locationId = query.locationId;
    }
    if (query.patientId) {
      where.patientId = query.patientId;
    }
    if (query.practitionerId) {
      where.practitionerId = query.practitionerId;
    }
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) {
        const fromDate = new Date(query.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        where.createdAt.gte = fromDate;
      }
      if (query.dateTo) {
        const toDate = new Date(query.dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = toDate;
      }
    }

    // Count total matching records
    const total = await prisma.inventoryTransaction.count({ where });

    // Fetch paginated results
    const offset = (query.page - 1) * query.limit;
    const orderBy: Prisma.InventoryTransactionOrderByWithRelationInput = {};

    switch (query.sortBy) {
      case 'quantity':
        orderBy.quantity = query.sortOrder;
        break;
      case 'totalCost':
        orderBy.totalCost = query.sortOrder;
        break;
      default:
        orderBy.createdAt = query.sortOrder;
    }

    const results = await prisma.inventoryTransaction.findMany({
      where,
      orderBy,
      skip: offset,
      take: query.limit,
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_transaction_list',
      ipAddress,
      metadata: { query, resultCount: results.length },
    });

    return c.json({
      items: results,
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
 * Get single transaction
 * GET /api/inventory/transactions/:id
 */
inventoryAdjustments.get('/transactions/:id', zValidator('param', idParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const transaction = await prisma.inventoryTransaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw APIError.notFound('Transaction');
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_transaction',
      resourceId: id,
      ipAddress,
    });

    return c.json({ transaction });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Create manual adjustment
 * POST /api/inventory/adjustments
 */
inventoryAdjustments.post('/adjustments', zValidator('json', createAdjustmentSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const result = await transactionWithErrorHandling(async (tx) => {
      // Validate lot exists
      const lot = await tx.inventoryLot.findUnique({
        where: { id: data.lotId },
        include: { product: true },
      });

      if (!lot) {
        throw APIError.notFound('Lot');
      }

      // Validate product matches
      if (lot.productId !== data.productId) {
        throw APIError.badRequest('Product does not match lot');
      }

      // Validate location matches
      if (lot.locationId !== data.locationId) {
        throw APIError.badRequest('Location does not match lot location');
      }

      // Validate lot is available
      if (lot.status !== LotStatusType.available) {
        throw APIError.badRequest(`Cannot adjust lot with status '${lot.status}'`);
      }

      // For removals, check sufficient quantity
      if (data.adjustmentType === 'remove') {
        const availableQty = lot.currentQuantity - lot.reservedQuantity;
        if (data.quantity > availableQty) {
          throw APIError.badRequest(`Insufficient quantity. Available: ${availableQty}, requested: ${data.quantity}`);
        }
      }

      const now = new Date();
      const quantityBefore = lot.currentQuantity;
      const quantityChange = data.adjustmentType === 'add' ? data.quantity : -data.quantity;
      const quantityAfter = quantityBefore + quantityChange;

      // Update lot quantity
      const updatedLot = await tx.inventoryLot.update({
        where: { id: lot.id },
        data: {
          currentQuantity: quantityAfter,
          updatedAt: now,
        },
      });

      // Create transaction
      const transaction = await tx.inventoryTransaction.create({
        data: {
          type: InventoryTransactionType.ADJUSTMENT,
          productId: data.productId,
          lotId: data.lotId,
          quantity: quantityChange,
          previousQuantity: quantityBefore,
          newQuantity: quantityAfter,
          unitCost: lot.product?.costPrice || (lot.purchaseCost ? lot.purchaseCost / lot.initialQuantity : 0),
          totalCost: Math.abs(quantityChange) * (lot.product?.costPrice || (lot.purchaseCost ? lot.purchaseCost / lot.initialQuantity : 0)),
          locationId: data.locationId,
          reason: data.reason,
          notes: data.notes,
          createdBy: user.uid,
        },
      });

      return { transaction, updatedLot, quantityBefore, quantityAfter };
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'inventory_adjustment',
      resourceId: result.transaction.id,
      ipAddress,
      metadata: {
        adjustmentType: data.adjustmentType,
        productId: data.productId,
        lotId: data.lotId,
        quantity: data.quantity,
      },
    });

    return c.json({
      transaction: result.transaction,
      lotUpdated: {
        lotId: result.updatedLot.id,
        lotNumber: result.updatedLot.lotNumber,
        previousQuantity: result.quantityBefore,
        newQuantity: result.quantityAfter,
      },
      message: 'Adjustment created successfully',
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Record usage from treatment
 * POST /api/inventory/use
 *
 * Uses FEFO (First Expire First Out) lot selection if lotId not specified
 */
inventoryAdjustments.post('/use', zValidator('json', inventoryUseSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const result = await transactionWithErrorHandling(async (tx) => {
      // Validate product exists
      const product = await tx.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw APIError.notFound('Product');
      }

      // Select lot using FEFO if not specified
      let lot;
      if (data.lotId) {
        lot = await tx.inventoryLot.findUnique({
          where: { id: data.lotId },
        });
        if (!lot) {
          throw APIError.notFound('Lot');
        }
        if (lot.productId !== data.productId) {
          throw APIError.badRequest('Product does not match lot');
        }
        if (lot.locationId !== data.locationId) {
          throw APIError.badRequest('Lot is not at specified location');
        }
        if (lot.status !== LotStatusType.available) {
          throw APIError.badRequest(`Cannot use from lot with status '${lot.status}'`);
        }
        if (lot.expirationDate < new Date()) {
          throw APIError.badRequest('Lot has expired');
        }
        const availableQty = lot.currentQuantity - lot.reservedQuantity;
        if (data.quantity > availableQty) {
          throw APIError.badRequest(`Insufficient quantity. Available: ${availableQty}, requested: ${data.quantity}`);
        }
      } else {
        // FEFO selection
        lot = await selectLotByFEFO(data.productId, data.quantity, data.locationId);
        if (!lot) {
          throw APIError.badRequest('No available lot found with sufficient quantity');
        }
      }

      // Fetch patient and provider names
      const patient = await tx.patient.findUnique({ where: { id: data.patientId } });
      const provider = await tx.user.findUnique({ where: { id: data.practitionerId } });

      const now = new Date();
      const quantityBefore = lot.currentQuantity;
      const quantityAfter = quantityBefore - data.quantity;

      // Update lot quantity and status if depleted
      const updatedLot = await tx.inventoryLot.update({
        where: { id: lot.id },
        data: {
          currentQuantity: quantityAfter,
          status: quantityAfter <= 0 ? LotStatusType.depleted : lot.status,
          updatedAt: now,
        },
      });

      // Create transaction
      const transaction = await tx.inventoryTransaction.create({
        data: {
          type: InventoryTransactionType.TREATMENT_USE,
          productId: data.productId,
          lotId: lot.id,
          quantity: -data.quantity,
          previousQuantity: quantityBefore,
          newQuantity: quantityAfter,
          unitCost: product.costPrice,
          totalCost: data.quantity * product.costPrice,
          locationId: data.locationId,
          appointmentId: data.appointmentId,
          patientId: data.patientId,
          practitionerId: data.practitionerId,
          reason: 'Treatment use',
          notes: data.treatmentDetails ? JSON.stringify(data.treatmentDetails) : null,
          createdBy: user.uid,
        },
      });

      // Calculate total available for this product
      const availableLots = await tx.inventoryLot.findMany({
        where: {
          productId: data.productId,
          status: LotStatusType.available,
        },
      });
      const totalAvailable = availableLots.reduce(
        (sum, l) => sum + (l.currentQuantity - l.reservedQuantity),
        0
      );

      return {
        transaction,
        lot: updatedLot,
        product,
        patient,
        provider,
        quantityAfter,
        totalAvailable,
      };
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'inventory_use',
      resourceId: result.transaction.id,
      ipAddress,
      metadata: {
        productId: data.productId,
        lotId: result.lot.id,
        quantity: data.quantity,
        patientId: data.patientId,
        practitionerId: data.practitionerId,
        appointmentId: data.appointmentId,
      },
    });

    // Check for low stock alert
    const alerts: any[] = [];
    const reorderPoint = result.product.reorderPoint || 20;
    if (result.totalAvailable <= reorderPoint) {
      alerts.push({
        type: 'low_stock',
        severity: 'warning',
        productId: data.productId,
        productName: result.product.name,
        currentQuantity: result.totalAvailable,
        reorderPoint,
      });
    }

    return c.json({
      success: true,
      transaction: result.transaction,
      lotUsed: {
        lotId: result.lot.id,
        lotNumber: result.lot.lotNumber,
        quantityDeducted: data.quantity,
        remainingInLot: result.quantityAfter,
      },
      productStock: {
        productId: data.productId,
        totalAvailable: result.totalAvailable,
      },
      alerts: alerts.length > 0 ? alerts : undefined,
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Record waste
 * POST /api/inventory/waste
 */
inventoryAdjustments.post('/waste', zValidator('json', recordWasteSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const result = await transactionWithErrorHandling(async (tx) => {
      // Validate product
      const product = await tx.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw APIError.notFound('Product');
      }

      // Get lot if specified
      let lot;
      if (data.lotId) {
        lot = await tx.inventoryLot.findUnique({
          where: { id: data.lotId },
        });
        if (!lot) {
          throw APIError.notFound('Lot');
        }
        if (lot.productId !== data.productId) {
          throw APIError.badRequest('Product does not match lot');
        }
      }

      const provider = data.practitionerId
        ? await tx.user.findUnique({ where: { id: data.practitionerId } })
        : null;

      const now = new Date();

      // Create waste record
      const wasteRecord = await tx.wasteRecord.create({
        data: {
          productId: data.productId,
          lotId: data.lotId || null,
          quantity: data.unitsWasted,
          reason: mapToWasteReason(data.reason),
          notes: data.reasonNotes,
          locationId: data.locationId,
          recordedAt: now,
          recordedBy: user.uid,
          unitCost: product.costPrice,
          totalCost: data.unitsWasted * product.costPrice,
        },
      });

      // Update lot quantity if applicable
      let quantityBefore = 0;
      let quantityAfter = 0;
      let transaction;

      if (lot) {
        quantityBefore = lot.currentQuantity;
        quantityAfter = quantityBefore - data.unitsWasted;

        await tx.inventoryLot.update({
          where: { id: lot.id },
          data: {
            currentQuantity: quantityAfter,
            status: quantityAfter <= 0 ? LotStatusType.depleted : lot.status,
            updatedAt: now,
          },
        });

        // Create transaction
        transaction = await tx.inventoryTransaction.create({
          data: {
            type: InventoryTransactionType.WASTE,
            productId: data.productId,
            lotId: lot.id,
            quantity: -data.unitsWasted,
            previousQuantity: quantityBefore,
            newQuantity: quantityAfter,
            unitCost: product.costPrice,
            totalCost: data.unitsWasted * product.costPrice,
            locationId: data.locationId,
            practitionerId: data.practitionerId,
            appointmentId: data.appointmentId,
            reason: `Waste: ${data.reason}`,
            notes: data.reasonNotes,
            createdBy: user.uid,
          },
        });
      }

      return { wasteRecord, transaction, quantityAfter, product, provider };
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'inventory_waste',
      resourceId: result.wasteRecord.id,
      ipAddress,
      metadata: {
        productId: data.productId,
        lotId: data.lotId,
        unitsWasted: data.unitsWasted,
        reason: data.reason,
        totalWasteValue: result.wasteRecord.totalCost,
      },
    });

    return c.json({
      success: true,
      wasteRecord: result.wasteRecord,
      totalWasteValue: result.wasteRecord.totalCost,
      updatedLotQuantity: data.lotId ? result.quantityAfter : undefined,
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

// ===================
// Transfer Routes
// ===================

/**
 * List transfers
 * GET /api/inventory/transfers
 */
inventoryAdjustments.get('/transfers', zValidator('query', listTransfersSchema), async (c) => {
  try {
    const query = c.req.valid('query');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const where: Prisma.InventoryTransferWhereInput = {};

    // Apply filters
    if (query.status) {
      where.status = query.status.toUpperCase() as TransferStatus;
    }
    if (query.sourceLocationId) {
      where.sourceLocationId = query.sourceLocationId;
    }
    if (query.destinationLocationId) {
      where.destinationLocationId = query.destinationLocationId;
    }
    if (query.dateFrom || query.dateTo) {
      where.requestedAt = {};
      if (query.dateFrom) {
        const fromDate = new Date(query.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        where.requestedAt.gte = fromDate;
      }
      if (query.dateTo) {
        const toDate = new Date(query.dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.requestedAt.lte = toDate;
      }
    }

    const total = await prisma.inventoryTransfer.count({ where });
    const offset = (query.page - 1) * query.limit;

    const results = await prisma.inventoryTransfer.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
      skip: offset,
      take: query.limit,
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_transfer_list',
      ipAddress,
      metadata: { query, resultCount: results.length },
    });

    return c.json({
      items: results,
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
 * Create transfer
 * POST /api/inventory/transfers
 */
inventoryAdjustments.post('/transfers', zValidator('json', createTransferSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    if (data.sourceLocationId === data.destinationLocationId) {
      throw APIError.badRequest('Source and destination cannot be the same');
    }

    const result = await transactionWithErrorHandling(async (tx) => {
      // Validate locations exist (in a real system)
      // For now we'll proceed with the validation

      // Validate items
      const transferItems: any[] = [];
      let totalValue = 0;

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        const lot = await tx.inventoryLot.findUnique({
          where: { id: item.lotId },
        });

        if (!product) {
          throw APIError.badRequest(`Product not found: ${item.productId}`);
        }
        if (!lot) {
          throw APIError.badRequest(`Lot not found: ${item.lotId}`);
        }
        if (lot.productId !== item.productId) {
          throw APIError.badRequest(`Product mismatch for lot ${item.lotId}`);
        }
        if (lot.locationId !== data.sourceLocationId) {
          throw APIError.badRequest(`Lot ${item.lotId} is not at source location`);
        }
        if (lot.status !== LotStatusType.available) {
          throw APIError.badRequest(`Lot ${item.lotId} is not available for transfer`);
        }
        const availableQty = lot.currentQuantity - lot.reservedQuantity;
        if (item.requestedQuantity > availableQty) {
          throw APIError.badRequest(`Insufficient quantity for lot ${item.lotId}. Available: ${availableQty}`);
        }

        const itemCost = item.requestedQuantity * product.costPrice;
        totalValue += itemCost;

        transferItems.push({
          id: generateId(),
          productId: item.productId,
          productName: product.name,
          lotId: item.lotId,
          lotNumber: lot.lotNumber,
          requestedQuantity: item.requestedQuantity,
          approvedQuantity: 0,
          shippedQuantity: 0,
          receivedQuantity: 0,
          unitType: product.unitType,
          unitCost: product.costPrice,
          totalCost: itemCost,
          notes: item.notes,
        });
      }

      const transferNumber = await generateTransferNumber();
      const now = new Date();

      const transfer = await tx.inventoryTransfer.create({
        data: {
          transferNumber,
          sourceLocationId: data.sourceLocationId,
          destinationLocationId: data.destinationLocationId,
          items: transferItems as any,
          status: TransferStatus.REQUESTED,
          notes: data.requestNotes,
          requestedAt: now,
          requestedBy: user.uid,
        },
      });

      return transfer;
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'inventory_transfer',
      resourceId: result.id,
      ipAddress,
      metadata: {
        transferNumber: result.transferNumber,
        sourceLocationId: data.sourceLocationId,
        destinationLocationId: data.destinationLocationId,
        itemCount: data.items.length,
      },
    });

    return c.json({
      transfer: result,
      message: 'Transfer created successfully',
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get single transfer
 * GET /api/inventory/transfers/:id
 */
inventoryAdjustments.get('/transfers/:id', zValidator('param', idParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const transfer = await prisma.inventoryTransfer.findUnique({
      where: { id },
    });

    if (!transfer) {
      throw APIError.notFound('Transfer');
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_transfer',
      resourceId: id,
      ipAddress,
    });

    return c.json({ transfer });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Ship transfer
 * POST /api/inventory/transfers/:id/ship
 */
inventoryAdjustments.post('/transfers/:id/ship', zValidator('param', idParamSchema), zValidator('json', shipTransferSchema), async (c) => {
  try {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const result = await transactionWithErrorHandling(async (tx) => {
      const transfer = await tx.inventoryTransfer.findUnique({
        where: { id },
      });

      if (!transfer) {
        throw APIError.notFound('Transfer');
      }

      // Validate status transition
      if (transfer.status !== TransferStatus.APPROVED && transfer.status !== TransferStatus.REQUESTED) {
        throw APIError.badRequest(`Cannot ship transfer with status '${transfer.status}'`);
      }

      const now = new Date();
      const items = transfer.items as any[];

      // Update shipped quantities
      if (data.items) {
        for (const shipItem of data.items) {
          const item = items.find((i: any) => i.id === shipItem.itemId);
          if (item) {
            item.shippedQuantity = shipItem.shippedQuantity;
            if (item.approvedQuantity === 0) {
              item.approvedQuantity = shipItem.shippedQuantity;
            }
          }
        }
      } else {
        // Ship all approved quantities (or requested if not approved)
        for (const item of items) {
          item.shippedQuantity = item.approvedQuantity > 0 ? item.approvedQuantity : item.requestedQuantity;
          if (item.approvedQuantity === 0) {
            item.approvedQuantity = item.requestedQuantity;
          }
        }
      }

      // Create transfer_out transactions and update source lot quantities
      for (const item of items) {
        if (item.shippedQuantity > 0) {
          const lot = await tx.inventoryLot.findUnique({
            where: { id: item.lotId },
          });

          if (lot) {
            const quantityBefore = lot.currentQuantity;
            const quantityAfter = quantityBefore - item.shippedQuantity;

            await tx.inventoryLot.update({
              where: { id: lot.id },
              data: {
                currentQuantity: quantityAfter,
                status: quantityAfter <= 0 ? LotStatusType.depleted : lot.status,
                updatedAt: now,
              },
            });

            await tx.inventoryTransaction.create({
              data: {
                type: InventoryTransactionType.TRANSFER_OUT,
                productId: item.productId,
                lotId: item.lotId,
                quantity: -item.shippedQuantity,
                previousQuantity: quantityBefore,
                newQuantity: quantityAfter,
                unitCost: item.unitCost,
                totalCost: item.shippedQuantity * item.unitCost,
                locationId: transfer.sourceLocationId,
                reason: `Transfer to destination`,
                notes: `Transfer #${transfer.transferNumber}`,
                createdBy: user.uid,
              },
            });
          }
        }
      }

      // Update transfer
      const updatedTransfer = await tx.inventoryTransfer.update({
        where: { id },
        data: {
          status: TransferStatus.IN_TRANSIT,
          shippedAt: now,
          approvedAt: transfer.approvedAt || now,
          approvedBy: transfer.approvedBy || user.uid,
          items: items as any,
        },
      });

      return updatedTransfer;
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'inventory_transfer',
      resourceId: id,
      ipAddress,
      metadata: { action: 'ship' },
    });

    return c.json({
      transfer: result,
      message: 'Transfer shipped successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Receive transfer
 * POST /api/inventory/transfers/:id/receive
 */
inventoryAdjustments.post('/transfers/:id/receive', zValidator('param', idParamSchema), zValidator('json', receiveTransferSchema), async (c) => {
  try {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const result = await transactionWithErrorHandling(async (tx) => {
      const transfer = await tx.inventoryTransfer.findUnique({
        where: { id },
      });

      if (!transfer) {
        throw APIError.notFound('Transfer');
      }

      if (transfer.status !== TransferStatus.IN_TRANSIT) {
        throw APIError.badRequest(`Cannot receive transfer with status '${transfer.status}'`);
      }

      const now = new Date();
      const items = transfer.items as any[];

      // Update received quantities and create destination lots
      for (const recvItem of data.items) {
        const item = items.find((i: any) => i.id === recvItem.itemId);
        if (item) {
          item.receivedQuantity = recvItem.receivedQuantity;
          if (recvItem.notes) {
            item.notes = recvItem.notes;
          }

          // Create new lot at destination
          if (recvItem.receivedQuantity > 0) {
            const sourceLot = await tx.inventoryLot.findUnique({
              where: { id: item.lotId },
            });

            if (sourceLot) {
              const newLot = await tx.inventoryLot.create({
                data: {
                  productId: item.productId,
                  locationId: transfer.destinationLocationId,
                  lotNumber: `${item.lotNumber}-TRF`,
                  expirationDate: sourceLot.expirationDate,
                  receivedDate: now,
                  initialQuantity: recvItem.receivedQuantity,
                  currentQuantity: recvItem.receivedQuantity,
                  reservedQuantity: 0,
                  unitType: sourceLot.unitType,
                  purchaseCost: recvItem.receivedQuantity * item.unitCost,
                  status: LotStatusType.available,
                  createdBy: user.uid,
                },
              });

              // Create transfer_in transaction
              await tx.inventoryTransaction.create({
                data: {
                  type: InventoryTransactionType.TRANSFER_IN,
                  productId: item.productId,
                  lotId: newLot.id,
                  quantity: recvItem.receivedQuantity,
                  previousQuantity: 0,
                  newQuantity: recvItem.receivedQuantity,
                  unitCost: item.unitCost,
                  totalCost: recvItem.receivedQuantity * item.unitCost,
                  locationId: transfer.destinationLocationId,
                  reason: `Transfer from source`,
                  notes: `Transfer #${transfer.transferNumber}`,
                  createdBy: user.uid,
                },
              });
            }
          }
        }
      }

      // Update transfer
      const updatedTransfer = await tx.inventoryTransfer.update({
        where: { id },
        data: {
          status: TransferStatus.RECEIVED,
          receivedAt: now,
          receivedBy: user.uid,
          items: items as any,
        },
      });

      return updatedTransfer;
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'inventory_transfer',
      resourceId: id,
      ipAddress,
      metadata: { action: 'receive' },
    });

    return c.json({
      transfer: result,
      message: 'Transfer received successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

// ===================
// Physical Count Routes
// ===================

/**
 * List inventory counts
 * GET /api/inventory/counts
 */
inventoryAdjustments.get('/counts', zValidator('query', listCountsSchema), async (c) => {
  try {
    const query = c.req.valid('query');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const where: Prisma.InventoryCountWhereInput = {};

    // Apply filters
    if (query.status) {
      where.status = query.status.toUpperCase() as CountStatus;
    }
    if (query.locationId) {
      where.locationId = query.locationId;
    }
    if (query.dateFrom || query.dateTo) {
      where.startedAt = {};
      if (query.dateFrom) {
        const fromDate = new Date(query.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        where.startedAt.gte = fromDate;
      }
      if (query.dateTo) {
        const toDate = new Date(query.dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.startedAt.lte = toDate;
      }
    }

    const total = await prisma.inventoryCount.count({ where });
    const offset = (query.page - 1) * query.limit;

    const results = await prisma.inventoryCount.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      skip: offset,
      take: query.limit,
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_count_list',
      ipAddress,
      metadata: { query, resultCount: results.length },
    });

    return c.json({
      items: results,
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
 * Create inventory count
 * POST /api/inventory/counts
 */
inventoryAdjustments.post('/counts', zValidator('json', createCountSchema), async (c) => {
  try {
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const result = await transactionWithErrorHandling(async (tx) => {
      // Build initial items from location inventory
      const countItems: any[] = [];

      const locationLots = await tx.inventoryLot.findMany({
        where: {
          locationId: data.locationId,
          status: LotStatusType.available,
        },
        include: {
          product: true,
        },
      });

      // Apply filters if specified
      let lotsToCount = locationLots;
      if (data.productFilter && data.productFilter.length > 0) {
        lotsToCount = locationLots.filter(lot => data.productFilter!.includes(lot.productId));
      }

      const now = new Date();

      for (const lot of lotsToCount) {
        countItems.push({
          id: generateId(),
          productId: lot.productId,
          productName: lot.product?.name || '',
          lotId: lot.id,
          lotNumber: lot.lotNumber,
          systemQuantity: lot.currentQuantity,
          countedQuantity: 0,
          variance: 0,
          variancePercent: 0,
          unitCost: lot.product?.costPrice || 0,
          varianceValue: 0,
          countedBy: '',
          countedAt: now,
        });
      }

      const countNumber = await generateCountNumber();

      const count = await tx.inventoryCount.create({
        data: {
          countNumber,
          locationId: data.locationId,
          status: CountStatus.IN_PROGRESS,
          countType: data.countType,
          items: countItems as any,
          notes: data.notes,
          startedAt: now,
          startedBy: user.uid,
        },
      });

      return count;
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'inventory_count',
      resourceId: result.id,
      ipAddress,
      metadata: {
        countNumber: result.countNumber,
        locationId: data.locationId,
        countType: data.countType,
      },
    });

    return c.json({
      count: result,
      message: 'Inventory count created successfully',
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Update count items (enter counted quantities)
 * PUT /api/inventory/counts/:id
 */
inventoryAdjustments.put('/counts/:id', zValidator('param', idParamSchema), zValidator('json', updateCountSchema), async (c) => {
  try {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const result = await transactionWithErrorHandling(async (tx) => {
      const count = await tx.inventoryCount.findUnique({
        where: { id },
      });

      if (!count) {
        throw APIError.notFound('Inventory count');
      }

      if (count.status !== CountStatus.IN_PROGRESS) {
        throw APIError.badRequest(`Cannot update count with status '${count.status}'`);
      }

      const now = new Date();
      const items = count.items as any[];

      // Update count items
      for (const updateItem of data.items) {
        const item = items.find((i: any) => i.id === updateItem.itemId);
        if (item) {
          item.countedQuantity = updateItem.countedQuantity;
          item.variance = updateItem.countedQuantity - item.systemQuantity;
          item.variancePercent = item.systemQuantity > 0
            ? (item.variance / item.systemQuantity) * 100
            : (updateItem.countedQuantity > 0 ? 100 : 0);
          item.varianceValue = item.variance * item.unitCost;
          item.countedBy = user.uid;
          item.countedAt = now;
          if (updateItem.notes) {
            item.notes = updateItem.notes;
          }
        }
      }

      // Recalculate summary
      const countedItems = items.filter((i: any) => i.countedBy !== '').length;
      const itemsWithVariance = items.filter((i: any) => i.variance !== 0).length;
      const totalVarianceValue = items.reduce((sum: number, i: any) => sum + i.varianceValue, 0);

      const updatedCount = await tx.inventoryCount.update({
        where: { id },
        data: {
          items: items as any,
          varianceTotal: totalVarianceValue,
        },
      });

      return { count: updatedCount, countedItems, itemsWithVariance };
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'inventory_count',
      resourceId: id,
      ipAddress,
      metadata: {
        itemsUpdated: data.items.length,
        countedItems: result.countedItems,
        itemsWithVariance: result.itemsWithVariance,
      },
    });

    return c.json({
      count: result.count,
      message: 'Count items updated successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Complete count
 * POST /api/inventory/counts/:id/complete
 */
inventoryAdjustments.post('/counts/:id/complete', zValidator('param', idParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const result = await transactionWithErrorHandling(async (tx) => {
      const count = await tx.inventoryCount.findUnique({
        where: { id },
      });

      if (!count) {
        throw APIError.notFound('Inventory count');
      }

      if (count.status !== CountStatus.IN_PROGRESS) {
        throw APIError.badRequest(`Cannot complete count with status '${count.status}'`);
      }

      // Ensure all items are counted
      const items = count.items as any[];
      const uncountedItems = items.filter((i: any) => i.countedBy === '');
      if (uncountedItems.length > 0) {
        throw APIError.badRequest(`${uncountedItems.length} items still need to be counted`);
      }

      const now = new Date();
      const updatedCount = await tx.inventoryCount.update({
        where: { id },
        data: {
          status: CountStatus.COMPLETED,
          completedAt: now,
          completedBy: user.uid,
        },
      });

      return updatedCount;
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'inventory_count',
      resourceId: id,
      ipAddress,
      metadata: { action: 'complete', totalVarianceValue: result.varianceTotal },
    });

    const items = result.items as any[];
    const totalItems = items.length;
    const countedItems = items.filter((i: any) => i.countedBy !== '').length;
    const itemsWithVariance = items.filter((i: any) => i.variance !== 0).length;

    return c.json({
      count: result,
      summary: {
        totalItems,
        countedItems,
        itemsWithVariance,
        totalVarianceValue: result.varianceTotal,
      },
      message: 'Count completed successfully. Ready for approval.',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Post count adjustments
 * POST /api/inventory/counts/:id/post
 *
 * Creates adjustment transactions for all variances and updates lot quantities
 */
inventoryAdjustments.post('/counts/:id/post', zValidator('param', idParamSchema), async (c) => {
  try {
    const { id } = c.req.valid('param');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const result = await transactionWithErrorHandling(async (tx) => {
      const count = await tx.inventoryCount.findUnique({
        where: { id },
      });

      if (!count) {
        throw APIError.notFound('Inventory count');
      }

      if (count.status !== CountStatus.COMPLETED) {
        throw APIError.badRequest(`Cannot post count with status '${count.status}'`);
      }

      const now = new Date();
      const adjustmentTransactions: any[] = [];
      const items = count.items as any[];

      // Create adjustment transactions for items with variance
      for (const item of items) {
        if (item.variance !== 0 && item.lotId) {
          const lot = await tx.inventoryLot.findUnique({
            where: { id: item.lotId },
          });

          if (lot) {
            const quantityBefore = lot.currentQuantity;

            // Set lot quantity to counted quantity
            await tx.inventoryLot.update({
              where: { id: lot.id },
              data: {
                currentQuantity: item.countedQuantity,
                status: item.countedQuantity <= 0 ? LotStatusType.depleted : lot.status,
                updatedAt: now,
              },
            });

            const transaction = await tx.inventoryTransaction.create({
              data: {
                type: InventoryTransactionType.COUNT_ADJUSTMENT,
                productId: item.productId,
                lotId: item.lotId,
                quantity: item.variance,
                previousQuantity: quantityBefore,
                newQuantity: item.countedQuantity,
                unitCost: item.unitCost,
                totalCost: Math.abs(item.variance) * item.unitCost,
                locationId: count.locationId,
                reason: `Physical count adjustment - ${count.countNumber}`,
                notes: item.notes,
                createdBy: user.uid,
              },
            });

            adjustmentTransactions.push(transaction);
          }
        }
      }

      // Mark count as posted
      const updatedCount = await tx.inventoryCount.update({
        where: { id },
        data: {
          status: CountStatus.COMPLETED, // No POSTED status in enum, keep COMPLETED
          completedAt: now,
          completedBy: user.uid,
        },
      });

      return { count: updatedCount, adjustmentTransactions };
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'inventory_count',
      resourceId: id,
      ipAddress,
      metadata: {
        action: 'post',
        adjustmentsCreated: result.adjustmentTransactions.length,
        totalVarianceValue: result.count.varianceTotal,
      },
    });

    return c.json({
      count: result.count,
      adjustments: result.adjustmentTransactions.map((t: any) => ({
        id: t.id,
        type: t.type,
        productName: t.productId, // Would need to join to get name
        lotNumber: t.lotId,
        quantity: t.quantity,
        totalCost: t.totalCost,
      })),
      message: `Count posted successfully. ${result.adjustmentTransactions.length} adjustment(s) created.`,
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

export default inventoryAdjustments;
