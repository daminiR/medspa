/**
 * Inventory Lots & Stock API Routes - Prisma Version
 *
 * FDA-compliant lot tracking with:
 * - Lot management with expiration tracking
 * - Quarantine and recall workflows
 * - Stock level monitoring
 * - Expiration alerts
 * - Open vial sessions (KEY DIFFERENTIATOR - multi-patient vial tracking)
 * - Fractional unit support (12.5 units)
 * - Reconstitution tracking with stability timers
 * - FIFO/FEFO lot selection
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
  LotStatusType,
  ProductUnitType,
  InventoryAlertType,
  AlertSeverity,
  InventoryAlertStatus,
  VialStatus,
  Prisma
} from '@prisma/client';

const inventoryLots = new Hono();

// ===================
// Validation Schemas
// ===================

// Lot status
const lotStatusSchema = z.enum([
  'available',
  'quarantine',
  'expired',
  'recalled',
  'depleted',
  'damaged',
]);

// Unit type
const unitTypeSchema = z.enum([
  'units',
  'syringe',
  'vial',
  'ml',
  'cc',
  'gram',
  'piece',
  'box',
  'kit',
]);

// FDA Recall Class
const fdaRecallClassSchema = z.enum(['I', 'II', 'III']);

// Alert type
const alertTypeSchema = z.enum([
  'low_stock',
  'out_of_stock',
  'expiring_soon',
  'expired',
  'recall',
  'temperature_excursion',
  'variance_detected',
  'reorder_recommended',
]);

// Alert severity
const alertSeveritySchema = z.enum(['info', 'warning', 'critical']);

// Alert status
const alertStatusSchema = z.enum(['active', 'acknowledged', 'resolved', 'dismissed']);

// Open vial status
const openVialStatusSchema = z.enum(['active', 'expired', 'depleted', 'discarded']);

// Vial closed reason
const vialClosedReasonSchema = z.enum([
  'depleted',
  'expired',
  'stability_exceeded',
  'contamination',
  'manual_close',
]);

// Create lot schema
const createLotSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().min(1).max(255),
  lotNumber: z.string().min(1).max(100),
  batchNumber: z.string().max(100).optional(),
  serialNumber: z.string().max(100).optional(),
  manufacturingDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  expirationDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  receivedDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  initialQuantity: z.number().positive(),
  unitType: unitTypeSchema,
  locationId: z.string().uuid(),
  locationName: z.string().min(1).max(255).optional(),
  storageLocation: z.string().max(255).optional(),
  purchaseOrderId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  vendorName: z.string().max(255).optional(),
  purchaseCost: z.number().nonnegative(),
  qualityNotes: z.string().max(1000).optional(),
});

// Update lot schema
const updateLotSchema = z.object({
  storageLocation: z.string().max(255).optional(),
  qualityNotes: z.string().max(1000).optional(),
  status: lotStatusSchema.optional(),
});

// List lots query schema
const listLotsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  productId: z.string().uuid().optional(),
  status: lotStatusSchema.optional(),
  locationId: z.string().uuid().optional(),
  expiringWithinDays: z.coerce.number().int().positive().optional(),
  sortBy: z.enum(['lotNumber', 'expirationDate', 'receivedDate', 'currentQuantity']).default('expirationDate'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Quarantine schema
const quarantineSchema = z.object({
  reason: z.string().min(1).max(500),
  notes: z.string().max(1000).optional(),
});

// Recall schema
const recallSchema = z.object({
  recallReason: z.string().min(1).max(500),
  recallNumber: z.string().max(100).optional(),
  fdaRecallClass: fdaRecallClassSchema,
  notifyPatients: z.boolean().default(true),
});

// Stock levels query schema
const stockLevelsSchema = z.object({
  productId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  lowStockOnly: z.coerce.boolean().optional(),
});

// Expiring lots query schema
const expiringLotsSchema = z.object({
  days: z.coerce.number().int().positive().default(30),
  locationId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
});

// Alerts query schema
const alertsQuerySchema = z.object({
  type: alertTypeSchema.optional(),
  severity: alertSeveritySchema.optional(),
  status: alertStatusSchema.optional(),
  locationId: z.string().uuid().optional(),
});

// Acknowledge alert schema
const acknowledgeAlertSchema = z.object({
  notes: z.string().max(500).optional(),
});

// Open vial request schema
const openVialSchema = z.object({
  lotId: z.string().uuid(),
  vialNumber: z.number().int().positive().optional(),
  diluentType: z.string().max(100).optional(),
  diluentVolume: z.number().positive().optional(),
  locationId: z.string().uuid(),
});

// Use from vial schema
const useFromVialSchema = z.object({
  unitsToUse: z.number().positive(), // Supports fractional: 12.5
  patientId: z.string().uuid(),
  patientName: z.string().min(1).max(255),
  appointmentId: z.string().uuid(),
  practitionerId: z.string().uuid(),
  practitionerName: z.string().min(1).max(255),
  areasInjected: z.array(z.object({
    name: z.string().min(1),
    units: z.number().positive(),
  })).optional(),
  chartId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

// Close vial schema
const closeVialSchema = z.object({
  reason: vialClosedReasonSchema,
  wastedUnits: z.number().nonnegative().optional(),
  notes: z.string().max(500).optional(),
});

// List open vials query schema
const listOpenVialsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  productId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  status: openVialStatusSchema.optional(),
  practitionerId: z.string().uuid().optional(),
});

// ID param schemas
const lotIdSchema = z.object({
  id: z.string().uuid(),
});

const alertIdSchema = z.object({
  id: z.string().uuid(),
});

const vialIdSchema = z.object({
  id: z.string().uuid(),
});

// ===================
// Helper Functions
// ===================

function generateId(): string {
  return crypto.randomUUID();
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

/**
 * Map string status to Prisma enum
 */
function mapLotStatus(status: string): LotStatusType {
  const mapping: Record<string, LotStatusType> = {
    available: 'available',
    quarantine: 'quarantine',
    expired: 'expired',
    recalled: 'recalled',
    depleted: 'depleted',
    damaged: 'damaged',
  };
  return mapping[status] || 'available';
}

/**
 * Map string unit type to Prisma enum
 */
function mapUnitType(unitType: string): ProductUnitType {
  const mapping: Record<string, ProductUnitType> = {
    units: 'units',
    syringe: 'syringe',
    vial: 'vial',
    ml: 'ml',
    cc: 'cc',
    gram: 'gram',
    piece: 'piece',
    box: 'box',
    kit: 'kit',
  };
  return mapping[unitType] || 'units';
}

/**
 * Map string alert type to Prisma enum
 */
function mapAlertType(type: string): InventoryAlertType {
  const mapping: Record<string, InventoryAlertType> = {
    low_stock: 'LOW_STOCK',
    out_of_stock: 'LOW_STOCK',
    expiring_soon: 'EXPIRING_SOON',
    expired: 'EXPIRED',
    recall: 'RECALL',
    temperature_excursion: 'LOW_STOCK',
    variance_detected: 'LOW_STOCK',
    reorder_recommended: 'REORDER_POINT',
  };
  return mapping[type] || 'LOW_STOCK';
}

/**
 * Map string severity to Prisma enum
 */
function mapAlertSeverity(severity: string): AlertSeverity {
  const mapping: Record<string, AlertSeverity> = {
    info: 'LOW',
    warning: 'MEDIUM',
    critical: 'CRITICAL',
  };
  return mapping[severity] || 'LOW';
}

/**
 * Map string alert status to Prisma enum
 */
function mapAlertStatus(status: string): InventoryAlertStatus {
  const mapping: Record<string, InventoryAlertStatus> = {
    active: 'ACTIVE',
    acknowledged: 'ACKNOWLEDGED',
    resolved: 'RESOLVED',
    dismissed: 'DISMISSED',
  };
  return mapping[status] || 'ACTIVE';
}

/**
 * Map string vial status to Prisma enum
 */
function mapVialStatus(status: string): VialStatus {
  const mapping: Record<string, VialStatus> = {
    active: 'OPEN',
    expired: 'EXPIRED',
    depleted: 'CLOSED',
    discarded: 'WASTED',
  };
  return mapping[status] || 'OPEN';
}

/**
 * Calculate stability hours remaining for an open vial
 */
function calculateStabilityRemaining(session: any): number {
  if (!session.openedAt) {
    return 0;
  }
  const now = new Date();
  const openedAt = new Date(session.openedAt);
  const expiresAt = new Date(session.expiresAt);
  const totalHours = (expiresAt.getTime() - openedAt.getTime()) / (1000 * 60 * 60);
  const hoursElapsed = (now.getTime() - openedAt.getTime()) / (1000 * 60 * 60);
  return Math.max(0, totalHours - hoursElapsed);
}

/**
 * Check if a lot is expired
 */
function isLotExpired(lot: { expirationDate: Date }): boolean {
  return new Date() > lot.expirationDate;
}

/**
 * Get expiration alert severity based on days until expiration
 */
function getExpirationSeverity(daysUntilExpiration: number): AlertSeverity {
  if (daysUntilExpiration <= 7) return 'CRITICAL';
  if (daysUntilExpiration <= 30) return 'MEDIUM';
  return 'LOW';
}

/**
 * FIFO/FEFO lot selection - selects the lot that expires first
 */
async function selectLotFEFO(productId: string, quantity: number) {
  try {
    const lots = await prisma.inventoryLot.findMany({
      where: {
        productId,
        status: 'available',
        currentQuantity: {
          gte: quantity,
        },
        expirationDate: {
          gt: new Date(),
        },
      },
      orderBy: {
        expirationDate: 'asc',
      },
      take: 1,
    });

    return lots[0] || null;
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Generate expiration alert for a lot
 */
async function generateExpirationAlert(lot: any, userId: string) {
  const now = new Date();
  const daysUntilExpiration = Math.ceil(
    (lot.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Only generate alerts for lots expiring within 90 days
  if (daysUntilExpiration > 90 || daysUntilExpiration < 0) {
    return null;
  }

  const severity = getExpirationSeverity(daysUntilExpiration);
  let message: string;

  if (daysUntilExpiration <= 0) {
    message = `EXPIRED: ${lot.product?.name || 'Product'} - Lot ${lot.lotNumber} has expired and should be quarantined immediately.`;
  } else if (daysUntilExpiration <= 7) {
    message = `CRITICAL: ${lot.product?.name || 'Product'} expires in ${daysUntilExpiration} days. Lot ${lot.lotNumber} expires on ${lot.expirationDate.toISOString().split('T')[0]}. Use immediately or discard.`;
  } else if (daysUntilExpiration <= 30) {
    message = `WARNING: ${lot.product?.name || 'Product'} expiring soon. Lot ${lot.lotNumber} expires in ${daysUntilExpiration} days. Prioritize for use.`;
  } else {
    message = `Notice: ${lot.product?.name || 'Product'} expires in ${daysUntilExpiration} days. Lot ${lot.lotNumber} will expire on ${lot.expirationDate.toISOString().split('T')[0]}.`;
  }

  try {
    const alert = await prisma.inventoryAlert.create({
      data: {
        type: daysUntilExpiration <= 0 ? 'EXPIRED' : 'EXPIRING_SOON',
        severity,
        productId: lot.productId,
        lotId: lot.id,
        locationId: lot.locationId,
        message,
        status: 'ACTIVE',
      },
    });

    return alert;
  } catch (error) {
    console.error('Error creating expiration alert:', error);
    return null;
  }
}

/**
 * Calculate stock levels for a product at a location
 */
async function calculateStockLevel(productId: string, locationId?: string) {
  try {
    const where: any = {
      productId,
      status: 'available',
      expirationDate: {
        gt: new Date(),
      },
    };

    if (locationId) {
      where.locationId = locationId;
    }

    const lots = await prisma.inventoryLot.findMany({
      where,
      include: {
        product: true,
      },
    });

    const totalQuantity = lots.reduce((sum, lot) => sum + lot.currentQuantity, 0);
    const reservedQuantity = lots.reduce((sum, lot) => sum + lot.reservedQuantity, 0);
    const availableQuantity = totalQuantity - reservedQuantity;

    const product = lots[0]?.product;
    const reorderPoint = 10; // Default, should come from product settings

    let status: 'in_stock' | 'low_stock' | 'critical' | 'out_of_stock' | 'overstocked';
    if (availableQuantity <= 0) {
      status = 'out_of_stock';
    } else if (availableQuantity <= reorderPoint * 0.1) {
      status = 'critical';
    } else if (availableQuantity <= reorderPoint) {
      status = 'low_stock';
    } else if (availableQuantity > reorderPoint * 3) {
      status = 'overstocked';
    } else {
      status = 'in_stock';
    }

    // Find earliest expiration
    const sortedByExpiration = [...lots].sort(
      (a, b) => a.expirationDate.getTime() - b.expirationDate.getTime()
    );
    const earliestExpiringLot = sortedByExpiration[0];

    return {
      productId,
      productName: product?.name || 'Unknown Product',
      locationId: locationId || 'all',
      totalQuantity,
      availableQuantity,
      reservedQuantity,
      status,
      reorderPoint,
      activeLots: lots.length,
      earliestExpiration: earliestExpiringLot?.expirationDate,
      earliestExpiringLotId: earliestExpiringLot?.id,
      earliestExpiringLotNumber: earliestExpiringLot?.lotNumber,
    };
  } catch (error) {
    handlePrismaError(error);
  }
}

// ===================
// Middleware
// ===================

inventoryLots.use('/*', sessionAuthMiddleware);

// ===================
// Lot Management Routes
// ===================

/**
 * List all lots (filterable)
 * GET /api/inventory/lots
 */
inventoryLots.get('/lots', zValidator('query', listLotsSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const where: any = {};

    // Apply filters
    if (query.productId) {
      where.productId = query.productId;
    }
    if (query.status) {
      where.status = mapLotStatus(query.status);
    }
    if (query.locationId) {
      where.locationId = query.locationId;
    }
    if (query.expiringWithinDays) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + query.expiringWithinDays);
      where.expirationDate = {
        lte: targetDate,
      };
      where.status = 'available';
    }

    // Build orderBy
    const orderBy: any = {};
    orderBy[query.sortBy] = query.sortOrder;

    // Get total count
    const total = await prisma.inventoryLot.count({ where });

    // Get paginated results
    const offset = (query.page - 1) * query.limit;
    const lots = await prisma.inventoryLot.findMany({
      where,
      orderBy,
      skip: offset,
      take: query.limit,
      include: {
        product: true,
        vendor: true,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_lot_list',
      ipAddress,
      metadata: { query, resultCount: lots.length },
    });

    return c.json({
      items: lots.map(lot => ({
        ...lot,
        expirationDate: lot.expirationDate.toISOString(),
        receivedDate: lot.receivedDate.toISOString(),
        manufacturingDate: lot.manufacturingDate?.toISOString(),
        openedDate: lot.openedDate?.toISOString(),
        createdAt: lot.createdAt.toISOString(),
        updatedAt: lot.updatedAt.toISOString(),
        availableQuantity: lot.currentQuantity - lot.reservedQuantity,
        isExpired: isLotExpired(lot),
        daysUntilExpiration: Math.ceil((lot.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        productName: lot.product?.name,
        vendorName: lot.vendor?.name,
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
 * Get single lot
 * GET /api/inventory/lots/:id
 */
inventoryLots.get('/lots/:id', zValidator('param', lotIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const lot = await prisma.inventoryLot.findUnique({
      where: { id },
      include: {
        product: true,
        vendor: true,
      },
    });

    if (!lot) {
      throw APIError.notFound('Inventory lot');
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_lot',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      lot: {
        ...lot,
        expirationDate: lot.expirationDate.toISOString(),
        receivedDate: lot.receivedDate.toISOString(),
        manufacturingDate: lot.manufacturingDate?.toISOString(),
        openedDate: lot.openedDate?.toISOString(),
        createdAt: lot.createdAt.toISOString(),
        updatedAt: lot.updatedAt.toISOString(),
        availableQuantity: lot.currentQuantity - lot.reservedQuantity,
        isExpired: isLotExpired(lot),
        daysUntilExpiration: Math.ceil((lot.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        productName: lot.product?.name,
        vendorName: lot.vendor?.name,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Create new lot (manual entry)
 * POST /api/inventory/lots
 */
inventoryLots.post('/lots', zValidator('json', createLotSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Check for duplicate lot number for same product
    const existingLot = await prisma.inventoryLot.findFirst({
      where: {
        lotNumber: data.lotNumber,
        productId: data.productId,
      },
    });

    if (existingLot) {
      throw APIError.conflict(`Lot number ${data.lotNumber} already exists for this product`);
    }

    const now = new Date();
    const expirationDate = new Date(data.expirationDate);

    // Determine status
    let status: LotStatusType = 'available';
    if (isLotExpired({ expirationDate })) {
      status = 'expired';
    }

    const lot = await prisma.inventoryLot.create({
      data: {
        productId: data.productId,
        locationId: data.locationId,
        lotNumber: data.lotNumber,
        batchNumber: data.batchNumber,
        serialNumber: data.serialNumber,
        manufacturingDate: data.manufacturingDate ? new Date(data.manufacturingDate) : null,
        expirationDate,
        receivedDate: data.receivedDate ? new Date(data.receivedDate) : now,
        initialQuantity: data.initialQuantity,
        currentQuantity: data.initialQuantity,
        reservedQuantity: 0,
        unitType: mapUnitType(data.unitType),
        storageLocation: data.storageLocation,
        purchaseOrderId: data.purchaseOrderId,
        vendorId: data.vendorId,
        purchaseCost: data.purchaseCost,
        status,
        qualityNotes: data.qualityNotes,
        createdBy: user.uid,
        updatedBy: user.uid,
      },
      include: {
        product: true,
      },
    });

    // Generate expiration alert if needed
    await generateExpirationAlert(lot, user.uid);

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'inventory_lot',
      resourceId: lot.id,
      ipAddress,
      metadata: { lotNumber: data.lotNumber, productId: data.productId },
    });

    return c.json({
      lot: {
        ...lot,
        expirationDate: lot.expirationDate.toISOString(),
        receivedDate: lot.receivedDate.toISOString(),
        manufacturingDate: lot.manufacturingDate?.toISOString(),
        createdAt: lot.createdAt.toISOString(),
        updatedAt: lot.updatedAt.toISOString(),
        availableQuantity: lot.currentQuantity - lot.reservedQuantity,
        productName: lot.product?.name,
      },
      message: 'Lot created successfully',
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Update lot
 * PUT /api/inventory/lots/:id
 */
inventoryLots.put('/lots/:id', zValidator('param', lotIdSchema), zValidator('json', updateLotSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const existing = await prisma.inventoryLot.findUnique({ where: { id } });
    if (!existing) {
      throw APIError.notFound('Inventory lot');
    }

    const updateData: any = {
      updatedBy: user.uid,
    };

    if (data.storageLocation !== undefined) updateData.storageLocation = data.storageLocation;
    if (data.qualityNotes !== undefined) updateData.qualityNotes = data.qualityNotes;
    if (data.status !== undefined) updateData.status = mapLotStatus(data.status);

    const lot = await prisma.inventoryLot.update({
      where: { id },
      data: updateData,
      include: {
        product: true,
        vendor: true,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'inventory_lot',
      resourceId: id,
      ipAddress,
      metadata: { updatedFields: Object.keys(data) },
    });

    return c.json({
      lot: {
        ...lot,
        expirationDate: lot.expirationDate.toISOString(),
        receivedDate: lot.receivedDate.toISOString(),
        manufacturingDate: lot.manufacturingDate?.toISOString(),
        openedDate: lot.openedDate?.toISOString(),
        createdAt: lot.createdAt.toISOString(),
        updatedAt: lot.updatedAt.toISOString(),
        availableQuantity: lot.currentQuantity - lot.reservedQuantity,
        productName: lot.product?.name,
        vendorName: lot.vendor?.name,
      },
      message: 'Lot updated successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Quarantine lot
 * POST /api/inventory/lots/:id/quarantine
 */
inventoryLots.post('/lots/:id/quarantine', zValidator('param', lotIdSchema), zValidator('json', quarantineSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const lot = await prisma.inventoryLot.findUnique({ where: { id } });
    if (!lot) {
      throw APIError.notFound('Inventory lot');
    }

    if (lot.status === 'quarantine') {
      throw APIError.badRequest('Lot is already quarantined');
    }

    const updatedNotes = `${lot.qualityNotes || ''}\n\nQuarantined: ${data.reason}${data.notes ? '\nNotes: ' + data.notes : ''}`.trim();

    const updatedLot = await prisma.inventoryLot.update({
      where: { id },
      data: {
        status: 'quarantine',
        qualityNotes: updatedNotes,
        updatedBy: user.uid,
      },
      include: {
        product: true,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'inventory_lot',
      resourceId: id,
      ipAddress,
      metadata: { action: 'quarantine', reason: data.reason },
    });

    return c.json({
      lot: {
        ...updatedLot,
        expirationDate: updatedLot.expirationDate.toISOString(),
        receivedDate: updatedLot.receivedDate.toISOString(),
        createdAt: updatedLot.createdAt.toISOString(),
        updatedAt: updatedLot.updatedAt.toISOString(),
      },
      message: 'Lot quarantined successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Recall lot (FDA Class I/II/III)
 * POST /api/inventory/lots/:id/recall
 */
inventoryLots.post('/lots/:id/recall', zValidator('param', lotIdSchema), zValidator('json', recallSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const result = await transactionWithErrorHandling(async (tx) => {
      const lot = await tx.inventoryLot.findUnique({
        where: { id },
        include: { product: true },
      });

      if (!lot) {
        throw APIError.notFound('Inventory lot');
      }

      if (lot.status === 'recalled') {
        throw APIError.badRequest('Lot is already recalled');
      }

      const now = new Date();
      const recallStatus = {
        isRecalled: true,
        recallDate: now.toISOString(),
        recallReason: data.recallReason,
        recallNumber: data.recallNumber,
        fdaRecallClass: data.fdaRecallClass,
        patientsNotified: false,
      };

      const updatedLot = await tx.inventoryLot.update({
        where: { id },
        data: {
          status: 'recalled',
          recallStatus: recallStatus as any,
          updatedBy: user.uid,
        },
        include: {
          product: true,
        },
      });

      // Create recall alert
      const severity = data.fdaRecallClass === 'I' ? 'CRITICAL' : data.fdaRecallClass === 'II' ? 'MEDIUM' : 'LOW';
      const recallAlert = await tx.inventoryAlert.create({
        data: {
          type: 'RECALL',
          severity,
          productId: lot.productId,
          lotId: lot.id,
          locationId: lot.locationId,
          message: `FDA Class ${data.fdaRecallClass} Recall: ${lot.product?.name || 'Product'}. Lot ${lot.lotNumber} has been recalled. Reason: ${data.recallReason}`,
          status: 'ACTIVE',
        },
      });

      return { updatedLot, recallAlert };
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'inventory_lot',
      resourceId: id,
      ipAddress,
      metadata: {
        action: 'recall',
        fdaRecallClass: data.fdaRecallClass,
        recallNumber: data.recallNumber,
        reason: data.recallReason,
      },
    });

    return c.json({
      lot: {
        ...result.updatedLot,
        expirationDate: result.updatedLot.expirationDate.toISOString(),
        receivedDate: result.updatedLot.receivedDate.toISOString(),
        createdAt: result.updatedLot.createdAt.toISOString(),
        updatedAt: result.updatedLot.updatedAt.toISOString(),
      },
      alert: result.recallAlert,
      message: 'Lot recalled successfully. Patients should be notified.',
      patientsToNotify: data.notifyPatients,
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get stock levels by product/location
 * GET /api/inventory/levels
 */
inventoryLots.get('/levels', zValidator('query', stockLevelsSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    let productIds: string[];

    if (query.productId) {
      productIds = [query.productId];
    } else {
      const lots = await prisma.inventoryLot.findMany({
        select: { productId: true },
        distinct: ['productId'],
      });
      productIds = lots.map(lot => lot.productId);
    }

    const stockLevels = await Promise.all(
      productIds.map(productId => calculateStockLevel(productId, query.locationId))
    );

    // Filter low stock only if requested
    const filteredLevels = query.lowStockOnly
      ? stockLevels.filter(level => ['low_stock', 'critical', 'out_of_stock'].includes(level!.status))
      : stockLevels;

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_levels',
      ipAddress,
      metadata: { query },
    });

    return c.json({
      levels: filteredLevels.map(level => ({
        ...level,
        earliestExpiration: level!.earliestExpiration?.toISOString(),
      })),
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get expiring lots
 * GET /api/inventory/expiring
 */
inventoryLots.get('/expiring', zValidator('query', expiringLotsSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const now = new Date();
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + query.days);

    const where: any = {
      status: 'available',
      expirationDate: {
        lte: targetDate,
        gt: now,
      },
    };

    if (query.locationId) {
      where.locationId = query.locationId;
    }
    if (query.productId) {
      where.productId = query.productId;
    }

    const results = await prisma.inventoryLot.findMany({
      where,
      orderBy: {
        expirationDate: 'asc',
      },
      include: {
        product: true,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'expiring_lots',
      ipAddress,
      metadata: { days: query.days, resultCount: results.length },
    });

    return c.json({
      expiringLots: results.map(lot => {
        const daysUntilExpiration = Math.ceil((lot.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...lot,
          expirationDate: lot.expirationDate.toISOString(),
          receivedDate: lot.receivedDate.toISOString(),
          createdAt: lot.createdAt.toISOString(),
          updatedAt: lot.updatedAt.toISOString(),
          daysUntilExpiration,
          severity: getExpirationSeverity(daysUntilExpiration),
          productName: lot.product?.name,
        };
      }),
      summary: {
        total: results.length,
        criticalCount: results.filter(lot => {
          const days = Math.ceil((lot.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return days <= 7;
        }).length,
        warningCount: results.filter(lot => {
          const days = Math.ceil((lot.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return days > 7 && days <= 30;
        }).length,
        infoCount: results.filter(lot => {
          const days = Math.ceil((lot.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return days > 30;
        }).length,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get active inventory alerts
 * GET /api/inventory/alerts
 */
inventoryLots.get('/alerts', zValidator('query', alertsQuerySchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const where: any = {};

    // Apply filters
    if (query.type) {
      where.type = mapAlertType(query.type);
    }
    if (query.severity) {
      where.severity = mapAlertSeverity(query.severity);
    }
    if (query.status) {
      where.status = mapAlertStatus(query.status);
    } else {
      // Default to active alerts
      where.status = 'ACTIVE';
    }
    if (query.locationId) {
      where.locationId = query.locationId;
    }

    const results = await prisma.inventoryAlert.findMany({
      where,
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_alerts',
      ipAddress,
      metadata: { query, resultCount: results.length },
    });

    return c.json({
      alerts: results.map(alert => ({
        ...alert,
        resolvedAt: alert.resolvedAt?.toISOString(),
        createdAt: alert.createdAt.toISOString(),
      })),
      summary: {
        total: results.length,
        critical: results.filter(a => a.severity === 'CRITICAL').length,
        warning: results.filter(a => a.severity === 'MEDIUM').length,
        info: results.filter(a => a.severity === 'LOW').length,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Acknowledge alert
 * POST /api/inventory/alerts/:id/acknowledge
 */
inventoryLots.post('/alerts/:id/acknowledge', zValidator('param', alertIdSchema), zValidator('json', acknowledgeAlertSchema.optional()), async (c) => {
  const { id } = c.req.valid('param');
  let data: { notes?: string } = {};
  try {
    const body = await c.req.json();
    if (body) data = body;
  } catch {
    // Empty body is fine
  }
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const alert = await prisma.inventoryAlert.findUnique({ where: { id } });
    if (!alert) {
      throw APIError.notFound('Inventory alert');
    }

    if (alert.status !== 'ACTIVE') {
      throw APIError.badRequest(`Cannot acknowledge alert with status '${alert.status}'`);
    }

    const updatedAlert = await prisma.inventoryAlert.update({
      where: { id },
      data: {
        status: 'ACKNOWLEDGED',
        resolvedBy: user.uid,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'inventory_alert',
      resourceId: id,
      ipAddress,
      metadata: { action: 'acknowledge' },
    });

    return c.json({
      alert: {
        ...updatedAlert,
        resolvedAt: updatedAlert.resolvedAt?.toISOString(),
        createdAt: updatedAlert.createdAt.toISOString(),
      },
      message: 'Alert acknowledged successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

// ===================
// Open Vial Session Routes (KEY DIFFERENTIATOR)
// ===================

/**
 * List open vial sessions
 * GET /api/inventory/open-vials
 */
inventoryLots.get('/open-vials', zValidator('query', listOpenVialsSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const where: any = {};

    // Apply filters
    if (query.productId) {
      where.productId = query.productId;
    }
    if (query.locationId) {
      where.locationId = query.locationId;
    }
    if (query.status) {
      where.status = mapVialStatus(query.status);
    }
    if (query.practitionerId) {
      where.openedBy = query.practitionerId;
    }

    // Get total count
    const total = await prisma.openVialSession.count({ where });

    // Get paginated results
    const offset = (query.page - 1) * query.limit;
    const vials = await prisma.openVialSession.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { expiresAt: 'asc' },
      ],
      skip: offset,
      take: query.limit,
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'open_vial_list',
      ipAddress,
      metadata: { query, resultCount: vials.length },
    });

    const items = vials.map(vial => {
      const stabilityHoursRemaining = calculateStabilityRemaining(vial);
      const isExpired = stabilityHoursRemaining <= 0 || new Date() > vial.expiresAt;

      return {
        id: vial.id,
        lotId: vial.lotId,
        productId: vial.productId,
        locationId: vial.locationId,
        initialQuantity: vial.initialQuantity,
        remainingQuantity: vial.remainingQuantity,
        status: vial.status,
        openedAt: vial.openedAt.toISOString(),
        openedBy: vial.openedBy,
        expiresAt: vial.expiresAt.toISOString(),
        closedAt: vial.closedAt?.toISOString(),
        closedBy: vial.closedBy,
        closeReason: vial.closeReason,
        usageRecords: vial.usageRecords,
        stabilityHoursRemaining,
        isExpired,
      };
    });

    const activeVials = items.filter(v => v.status === 'OPEN');
    const expiringWithinHour = activeVials.filter(v => v.stabilityHoursRemaining <= 1);
    const totalUnitsAvailable = activeVials.reduce((sum, v) => sum + v.remainingQuantity, 0);

    return c.json({
      items,
      total,
      page: query.page,
      limit: query.limit,
      hasMore: offset + query.limit < total,
      summary: {
        activeVials: activeVials.length,
        expiringWithinHour: expiringWithinHour.length,
        totalUnitsAvailable,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Open new vial (reconstitute neurotoxin)
 * POST /api/inventory/open-vials
 */
inventoryLots.post('/open-vials', zValidator('json', openVialSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const result = await transactionWithErrorHandling(async (tx) => {
      const lot = await tx.inventoryLot.findUnique({
        where: { id: data.lotId },
        include: { product: true },
      });

      if (!lot) {
        throw APIError.notFound('Inventory lot');
      }

      if (lot.status !== 'available') {
        throw APIError.badRequest(`Cannot open vial from lot with status '${lot.status}'`);
      }

      if (isLotExpired(lot)) {
        throw APIError.badRequest('Cannot open vial from expired lot');
      }

      // Get product info for stability hours
      const maxStabilityHours = 24; // Default, should come from product.injectableDetails
      const unitsPerVial = lot.product?.unitsPerPackage || 100;

      // Check if lot has enough quantity
      if (lot.currentQuantity < unitsPerVial) {
        throw APIError.badRequest(`Insufficient quantity in lot. Need ${unitsPerVial}, have ${lot.currentQuantity}`);
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + maxStabilityHours * 60 * 60 * 1000);

      // Create vial session
      const vialSession = await tx.openVialSession.create({
        data: {
          lotId: lot.id,
          productId: lot.productId,
          locationId: data.locationId,
          initialQuantity: unitsPerVial,
          remainingQuantity: unitsPerVial,
          status: 'OPEN',
          openedAt: now,
          openedBy: user.uid,
          expiresAt,
          usageRecords: [],
        },
      });

      // Deduct from lot
      const updatedLot = await tx.inventoryLot.update({
        where: { id: lot.id },
        data: {
          currentQuantity: lot.currentQuantity - unitsPerVial,
          openedDate: lot.openedDate || now,
          status: lot.currentQuantity - unitsPerVial <= 0 ? 'depleted' : lot.status,
          updatedBy: user.uid,
        },
      });

      return { vialSession, maxStabilityHours };
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'open_vial_session',
      resourceId: result.vialSession.id,
      ipAddress,
      metadata: {
        lotId: data.lotId,
      },
    });

    return c.json({
      session: {
        ...result.vialSession,
        openedAt: result.vialSession.openedAt.toISOString(),
        expiresAt: result.vialSession.expiresAt.toISOString(),
      },
      expiresAt: result.vialSession.expiresAt.toISOString(),
      stabilityHoursRemaining: result.maxStabilityHours,
      message: 'Vial opened successfully',
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get vial session details
 * GET /api/inventory/open-vials/:id
 */
inventoryLots.get('/open-vials/:id', zValidator('param', vialIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const vial = await prisma.openVialSession.findUnique({
      where: { id },
    });

    if (!vial) {
      throw APIError.notFound('Open vial session');
    }

    const stabilityHoursRemaining = calculateStabilityRemaining(vial);
    const isExpired = stabilityHoursRemaining <= 0 || new Date() > vial.expiresAt;

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'open_vial_session',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      session: {
        ...vial,
        openedAt: vial.openedAt.toISOString(),
        expiresAt: vial.expiresAt.toISOString(),
        closedAt: vial.closedAt?.toISOString(),
        stabilityHoursRemaining,
        isExpired,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Use units from vial (supports fractional like 12.5)
 * POST /api/inventory/open-vials/:id/use
 */
inventoryLots.post('/open-vials/:id/use', zValidator('param', vialIdSchema), zValidator('json', useFromVialSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const result = await transactionWithErrorHandling(async (tx) => {
      const vial = await tx.openVialSession.findUnique({ where: { id } });
      if (!vial) {
        throw APIError.notFound('Open vial session');
      }

      if (vial.status !== 'OPEN') {
        throw APIError.badRequest(`Cannot use from vial with status '${vial.status}'`);
      }

      // Check stability
      const stabilityHoursRemaining = calculateStabilityRemaining(vial);
      if (stabilityHoursRemaining <= 0 || new Date() > vial.expiresAt) {
        await tx.openVialSession.update({
          where: { id },
          data: { status: 'EXPIRED' },
        });
        throw APIError.badRequest('Vial has expired. Cannot use.');
      }

      // Check sufficient units
      if (vial.remainingQuantity < data.unitsToUse) {
        throw APIError.badRequest(`Insufficient units. Requested ${data.unitsToUse}, available ${vial.remainingQuantity}`);
      }

      const now = new Date();
      const usageRecord = {
        id: generateId(),
        timestamp: now.toISOString(),
        patientId: data.patientId,
        patientName: data.patientName,
        appointmentId: data.appointmentId,
        practitionerId: data.practitionerId,
        practitionerName: data.practitionerName,
        unitsUsed: data.unitsToUse,
        areasInjected: data.areasInjected,
        chartId: data.chartId,
        notes: data.notes,
      };

      const usageRecords = Array.isArray(vial.usageRecords) ? vial.usageRecords : [];
      const newUsageRecords = [...usageRecords, usageRecord];
      const newRemainingQuantity = Math.round((vial.remainingQuantity - data.unitsToUse) * 100) / 100;

      // Update vial
      const updatedVial = await tx.openVialSession.update({
        where: { id },
        data: {
          remainingQuantity: newRemainingQuantity,
          usageRecords: newUsageRecords as any,
          status: newRemainingQuantity <= 0 ? 'CLOSED' : vial.status,
          closedAt: newRemainingQuantity <= 0 ? now : vial.closedAt,
          closedBy: newRemainingQuantity <= 0 ? user.uid : vial.closedBy,
          closeReason: newRemainingQuantity <= 0 ? 'depleted' : vial.closeReason,
        },
      });

      return { usageRecord, updatedVial, stabilityHoursRemaining };
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'open_vial_session',
      resourceId: id,
      ipAddress,
      metadata: {
        action: 'use',
        unitsUsed: data.unitsToUse,
        patientId: data.patientId,
        practitionerId: data.practitionerId,
        remainingUnits: result.updatedVial.remainingQuantity,
      },
    });

    return c.json({
      usageRecord: result.usageRecord,
      remainingUnits: result.updatedVial.remainingQuantity,
      isVialDepleted: result.updatedVial.status === 'CLOSED',
      stabilityHoursRemaining: result.stabilityHoursRemaining,
      alerts: [],
      message: `Used ${data.unitsToUse} units successfully`,
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Close vial session
 * POST /api/inventory/open-vials/:id/close
 */
inventoryLots.post('/open-vials/:id/close', zValidator('param', vialIdSchema), zValidator('json', closeVialSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const vial = await prisma.openVialSession.findUnique({ where: { id } });
    if (!vial) {
      throw APIError.notFound('Open vial session');
    }

    if (vial.status !== 'OPEN') {
      throw APIError.badRequest(`Vial is already closed with status '${vial.status}'`);
    }

    const now = new Date();
    const status = data.reason === 'expired' || data.reason === 'stability_exceeded' ? 'EXPIRED' :
      data.reason === 'contamination' ? 'WASTED' : 'CLOSED';

    const updatedVial = await prisma.openVialSession.update({
      where: { id },
      data: {
        status,
        remainingQuantity: 0,
        closedAt: now,
        closedBy: user.uid,
        closeReason: data.reason,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'open_vial_session',
      resourceId: id,
      ipAddress,
      metadata: {
        action: 'close',
        reason: data.reason,
      },
    });

    return c.json({
      session: {
        ...updatedVial,
        openedAt: updatedVial.openedAt.toISOString(),
        expiresAt: updatedVial.expiresAt.toISOString(),
        closedAt: updatedVial.closedAt?.toISOString(),
      },
      summary: {
        totalUsed: updatedVial.initialQuantity - updatedVial.remainingQuantity,
        totalWasted: updatedVial.remainingQuantity,
      },
      message: 'Vial session closed successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get multi-patient usage history from vial
 * GET /api/inventory/open-vials/:id/usage-history
 */
inventoryLots.get('/open-vials/:id/usage-history', zValidator('param', vialIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const vial = await prisma.openVialSession.findUnique({ where: { id } });
    if (!vial) {
      throw APIError.notFound('Open vial session');
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'vial_usage_history',
      resourceId: id,
      ipAddress,
    });

    const usageRecords = Array.isArray(vial.usageRecords) ? vial.usageRecords : [];

    // Group usage by patient
    const usageByPatient = (usageRecords as any[]).reduce((acc, record) => {
      if (!acc[record.patientId]) {
        acc[record.patientId] = {
          patientId: record.patientId,
          patientName: record.patientName,
          totalUnits: 0,
          treatments: [],
        };
      }
      acc[record.patientId].totalUnits += record.unitsUsed;
      acc[record.patientId].treatments.push({
        timestamp: record.timestamp,
        appointmentId: record.appointmentId,
        practitionerName: record.practitionerName,
        unitsUsed: record.unitsUsed,
        areasInjected: record.areasInjected,
      });
      return acc;
    }, {} as Record<string, any>);

    // Group usage by practitioner
    const usageByPractitioner = (usageRecords as any[]).reduce((acc, record) => {
      if (!acc[record.practitionerId]) {
        acc[record.practitionerId] = {
          practitionerId: record.practitionerId,
          practitionerName: record.practitionerName,
          totalUnits: 0,
          treatments: 0,
        };
      }
      acc[record.practitionerId].totalUnits += record.unitsUsed;
      acc[record.practitionerId].treatments += 1;
      return acc;
    }, {} as Record<string, any>);

    const totalUsed = vial.initialQuantity - vial.remainingQuantity;
    const totalPatients = Object.keys(usageByPatient).length;

    return c.json({
      vialInfo: {
        id: vial.id,
        lotId: vial.lotId,
        productId: vial.productId,
        initialQuantity: vial.initialQuantity,
        usedUnits: totalUsed,
        wastedUnits: vial.remainingQuantity,
        remainingUnits: vial.remainingQuantity,
        status: vial.status,
      },
      usageRecords,
      byPatient: Object.values(usageByPatient),
      byPractitioner: Object.values(usageByPractitioner),
      summary: {
        totalPatients,
        totalTreatments: usageRecords.length,
        totalUnitsUsed: totalUsed,
        averageUnitsPerTreatment: usageRecords.length > 0
          ? Math.round((totalUsed / usageRecords.length) * 100) / 100
          : 0,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

// Export functions for testing/utilities
export { selectLotFEFO, calculateStabilityRemaining, isLotExpired, generateExpirationAlert };

export default inventoryLots;
