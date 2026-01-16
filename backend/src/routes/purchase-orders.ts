/**
 * Purchase Orders API Routes
 *
 * Complete PO workflow from creation to receiving with:
 * - Pagination and filtering
 * - Status transitions (draft -> submitted -> confirmed -> shipped -> received)
 * - Receiving workflow with lot creation
 * - Partial receiving support
 * - Vendor management
 * - Audit logging
 *
 * MIGRATED TO PRISMA ORM
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sessionAuthMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { handlePrismaError, transactionWithErrorHandling } from '../middleware/prisma-error-handler';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { Prisma, PurchaseOrderStatus, ProductUnitType, LotStatusType } from '@prisma/client';

const purchaseOrders = new Hono();

// ===================
// Validation Schemas
// ===================

// Purchase order status
const purchaseOrderStatusSchema = z.enum([
  'draft',
  'submitted',
  'confirmed',
  'partial_received',
  'received',
  'cancelled',
]);

// Payment status
const paymentStatusSchema = z.enum(['pending', 'partial', 'paid']);

// Unit type
const unitTypeSchema = z.enum(['units', 'syringe', 'vial', 'ml', 'cc', 'gram', 'piece', 'box', 'kit']);

// Discount type
const discountTypeSchema = z.enum(['percentage', 'fixed']);

// PO Item schema for creation
const createPOItemSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().min(1).max(255),
  sku: z.string().min(1).max(50),
  quantityOrdered: z.number().positive(),
  unitType: unitTypeSchema.optional().default('units'),
  unitCost: z.number().min(0),
  discount: z.number().min(0).optional(),
  discountType: discountTypeSchema.optional(),
  notes: z.string().max(500).optional(),
});

// Create purchase order schema
const createPurchaseOrderSchema = z.object({
  vendorId: z.string().uuid(),
  locationId: z.string().uuid(),
  expectedDeliveryDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  items: z.array(createPOItemSchema).min(1, 'At least one item is required'),
  shippingAddress: z.string().max(500).optional(),
  shippingCost: z.number().min(0).optional().default(0),
  taxAmount: z.number().min(0).optional().default(0),
  discount: z.number().min(0).optional().default(0),
  paymentTerms: z.string().max(100).optional(),
  internalNotes: z.string().max(2000).optional(),
  vendorNotes: z.string().max(2000).optional(),
});

// Update purchase order schema
const updatePurchaseOrderSchema = z.object({
  expectedDeliveryDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  shippingAddress: z.string().max(500).optional(),
  shippingCost: z.number().min(0).optional(),
  taxAmount: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  paymentTerms: z.string().max(100).optional(),
  paymentStatus: paymentStatusSchema.optional(),
  trackingNumber: z.string().max(100).optional(),
  carrier: z.string().max(100).optional(),
  internalNotes: z.string().max(2000).optional(),
  vendorNotes: z.string().max(2000).optional(),
});

// List POs query schema
const listPurchaseOrdersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  vendorId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  status: purchaseOrderStatusSchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['orderNumber', 'orderDate', 'expectedDate', 'total', 'status', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// PO ID param schema
const poIdSchema = z.object({
  id: z.string().uuid(),
});

// Received lot info for receiving
const receivedLotSchema = z.object({
  lotNumber: z.string().min(1).max(100),
  quantity: z.number().positive(),
  expirationDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  manufacturingDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  storageLocation: z.string().max(100).optional(),
});

// Receive item schema
const receiveItemSchema = z.object({
  itemId: z.string().uuid(),
  quantityReceived: z.number().positive(),
  lots: z.array(receivedLotSchema).min(1, 'At least one lot is required'),
  notes: z.string().max(500).optional(),
});

// Full receive schema
const receiveSchema = z.object({
  items: z.array(receiveItemSchema).min(1, 'At least one item is required'),
  actualDeliveryDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  notes: z.string().max(2000).optional(),
});

// Partial receive schema (same as receive, but allows partial quantities)
const partialReceiveSchema = receiveSchema;

// Submit to vendor schema
const submitSchema = z.object({
  vendorEmail: z.string().email().optional(),
  message: z.string().max(2000).optional(),
}).optional();

// Address schema for vendors
const addressSchema = z.object({
  street: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(50),
  zipCode: z.string().min(1).max(20),
  country: z.string().min(1).max(100).default('USA'),
});

// Vendor schemas
const createVendorSchema = z.object({
  name: z.string().min(1).max(255),
  shortName: z.string().min(1).max(50).optional(),
  contactName: z.string().max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  fax: z.string().max(20).optional(),
  website: z.string().url().optional(),
  address: addressSchema.optional(),
  accountNumber: z.string().max(50).optional(),
  paymentTerms: z.string().max(100).optional(),
  taxId: z.string().max(50).optional(),
  averageLeadDays: z.number().int().min(0).default(7),
  isPreferred: z.boolean().default(false),
  notes: z.string().max(2000).optional(),
});

const updateVendorSchema = createVendorSchema.partial();

const vendorIdSchema = z.object({
  id: z.string().uuid(),
});

const listVendorsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

// ===================
// Helper Functions
// ===================

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

function calculateItemTotals(item: {
  quantityOrdered: number;
  unitCost: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
}): { totalCost: number; finalCost: number } {
  const totalCost = item.quantityOrdered * item.unitCost;

  let discountAmount = 0;
  if (item.discount && item.discount > 0) {
    if (item.discountType === 'percentage') {
      discountAmount = totalCost * (item.discount / 100);
    } else {
      discountAmount = item.discount;
    }
  }

  const finalCost = totalCost - discountAmount;
  return { totalCost, finalCost };
}

function canEditPO(status: string): boolean {
  return status === 'DRAFT';
}

function canReceive(status: string): boolean {
  return ['SUBMITTED', 'CONFIRMED', 'PARTIALLY_RECEIVED'].includes(status);
}

function isValidStatusTransition(from: string, to: string): boolean {
  const transitions: Record<string, string[]> = {
    DRAFT: ['SUBMITTED', 'CANCELLED'],
    SUBMITTED: ['CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
    CONFIRMED: ['PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
    PARTIALLY_RECEIVED: ['RECEIVED', 'CANCELLED'],
    RECEIVED: [],
    CANCELLED: [],
  };

  return transitions[from]?.includes(to) ?? false;
}

// Convert lowercase status to Prisma UPPERCASE enum
function convertStatusToPrisma(status: string): PurchaseOrderStatus {
  const statusMap: Record<string, PurchaseOrderStatus> = {
    'draft': 'DRAFT',
    'submitted': 'SUBMITTED',
    'confirmed': 'CONFIRMED',
    'partial_received': 'PARTIALLY_RECEIVED',
    'received': 'RECEIVED',
    'cancelled': 'CANCELLED',
  };
  return statusMap[status] || 'DRAFT';
}

// Convert Prisma UPPERCASE enum to lowercase
function convertStatusFromPrisma(status: PurchaseOrderStatus): string {
  const statusMap: Record<PurchaseOrderStatus, string> = {
    'DRAFT': 'draft',
    'SUBMITTED': 'submitted',
    'CONFIRMED': 'confirmed',
    'PARTIALLY_RECEIVED': 'partial_received',
    'RECEIVED': 'received',
    'CANCELLED': 'cancelled',
  };
  return statusMap[status] || 'draft';
}

// Convert unit type to Prisma enum
function convertUnitTypeToPrisma(unitType: string): ProductUnitType {
  const unitMap: Record<string, ProductUnitType> = {
    'units': 'units',
    'syringe': 'syringe',
    'vial': 'vial',
    'ml': 'ml',
    'cc': 'cc',
    'gram': 'gram',
    'piece': 'piece',
    'box': 'box',
    'kit': 'kit',
  };
  return unitMap[unitType] || 'units';
}

// Generate next PO number
async function generatePONumber(): Promise<string> {
  const year = new Date().getFullYear();

  // Get the latest PO for this year
  const latestPO = await prisma.purchaseOrder.findFirst({
    where: {
      orderNumber: {
        startsWith: `PO-${year}-`,
      },
    },
    orderBy: {
      orderNumber: 'desc',
    },
  });

  let nextNumber = 1;
  if (latestPO) {
    const match = latestPO.orderNumber.match(/PO-\d{4}-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `PO-${year}-${nextNumber.toString().padStart(4, '0')}`;
}

// ===================
// Middleware
// ===================

// All purchase order routes require session authentication
purchaseOrders.use('/*', sessionAuthMiddleware);

// ===================
// Purchase Order Routes
// ===================

/**
 * List purchase orders (paginated, filterable)
 * GET /api/purchase-orders
 */
purchaseOrders.get('/', zValidator('query', listPurchaseOrdersSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Build where clause
    const where: Prisma.PurchaseOrderWhereInput = {};

    if (query.vendorId) {
      where.vendorId = query.vendorId;
    }

    if (query.status) {
      where.status = convertStatusToPrisma(query.status);
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

    // Get total count
    const total = await prisma.purchaseOrder.count({ where });

    // Build orderBy
    const orderBy: Prisma.PurchaseOrderOrderByWithRelationInput = {};
    switch (query.sortBy) {
      case 'orderNumber':
        orderBy.orderNumber = query.sortOrder;
        break;
      case 'total':
        orderBy.total = query.sortOrder;
        break;
      case 'status':
        orderBy.status = query.sortOrder;
        break;
      case 'expectedDate':
        orderBy.expectedDate = query.sortOrder;
        break;
      default:
        orderBy.createdAt = query.sortOrder;
    }

    // Get paginated results
    const offset = (query.page - 1) * query.limit;
    const purchaseOrdersList = await prisma.purchaseOrder.findMany({
      where,
      orderBy,
      skip: offset,
      take: query.limit,
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'purchase_order_list',
      ipAddress,
      metadata: { query, resultCount: purchaseOrdersList.length },
    });

    return c.json({
      items: purchaseOrdersList.map(po => {
        const items = (po.items as any) || [];
        return {
          id: po.id,
          orderNumber: po.orderNumber,
          vendorId: po.vendorId,
          vendorName: po.vendorName,
          total: po.total,
          status: convertStatusFromPrisma(po.status),
          orderDate: po.createdAt.toISOString(),
          expectedDeliveryDate: po.expectedDate?.toISOString(),
          itemCount: Array.isArray(items) ? items.length : 0,
        };
      }),
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
 * Get single purchase order by ID
 * GET /api/purchase-orders/:id
 */
purchaseOrders.get('/:id', zValidator('param', poIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!po) {
      throw APIError.notFound('Purchase order');
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'purchase_order',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      purchaseOrder: {
        ...po,
        status: convertStatusFromPrisma(po.status),
        createdAt: po.createdAt.toISOString(),
        updatedAt: po.updatedAt.toISOString(),
        expectedDate: po.expectedDate?.toISOString(),
        orderedAt: po.orderedAt?.toISOString(),
        receivedAt: po.receivedAt?.toISOString(),
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Create new purchase order
 * POST /api/purchase-orders
 */
purchaseOrders.post('/', zValidator('json', createPurchaseOrderSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Validate vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: data.vendorId },
    });

    if (!vendor || !vendor.isActive) {
      throw APIError.badRequest('Vendor not found or inactive');
    }

    // Process line items
    const items = data.items.map(item => {
      const totals = calculateItemTotals({
        quantityOrdered: item.quantityOrdered,
        unitCost: item.unitCost,
        discount: item.discount,
        discountType: item.discountType,
      });
      return {
        id: crypto.randomUUID(),
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        quantityOrdered: item.quantityOrdered,
        quantityReceived: 0,
        quantityPending: item.quantityOrdered,
        unitType: item.unitType || 'units',
        unitCost: item.unitCost,
        totalCost: totals.totalCost,
        discount: item.discount,
        discountType: item.discountType,
        finalCost: totals.finalCost,
        notes: item.notes,
      };
    });

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.finalCost, 0);
    const total = subtotal + (data.taxAmount || 0) + (data.shippingCost || 0) - (data.discount || 0);

    // Generate PO number
    const orderNumber = await generatePONumber();

    // Create PO
    const po = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        vendorId: data.vendorId,
        vendorName: vendor.name,
        status: 'DRAFT',
        items: items as any,
        subtotal,
        tax: data.taxAmount || 0,
        shipping: data.shippingCost || 0,
        total,
        notes: data.internalNotes || null,
        expectedDate: data.expectedDeliveryDate ? new Date(data.expectedDeliveryDate) : null,
        orderedBy: user.uid,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'purchase_order',
      resourceId: po.id,
      ipAddress,
      metadata: { orderNumber: po.orderNumber, vendorId: data.vendorId },
    });

    return c.json({
      purchaseOrder: {
        ...po,
        status: convertStatusFromPrisma(po.status),
        createdAt: po.createdAt.toISOString(),
        updatedAt: po.updatedAt.toISOString(),
        expectedDate: po.expectedDate?.toISOString(),
      },
      message: 'Purchase order created successfully',
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Update purchase order
 * PUT /api/purchase-orders/:id
 */
purchaseOrders.put('/:id', zValidator('param', poIdSchema), zValidator('json', updatePurchaseOrderSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!po) {
      throw APIError.notFound('Purchase order');
    }

    // Check if PO can be edited (only draft status)
    if (!canEditPO(po.status)) {
      throw APIError.badRequest(`Cannot edit purchase order with status '${convertStatusFromPrisma(po.status)}'`);
    }

    // Build update data
    const updateData: Prisma.PurchaseOrderUpdateInput = {
      updatedAt: new Date(),
    };

    if (data.expectedDeliveryDate) {
      updateData.expectedDate = new Date(data.expectedDeliveryDate);
    }
    if (data.shippingCost !== undefined) {
      updateData.shipping = data.shippingCost;
    }
    if (data.taxAmount !== undefined) {
      updateData.tax = data.taxAmount;
    }
    if (data.internalNotes !== undefined) {
      updateData.notes = data.internalNotes;
    }

    // Recalculate total if shipping, tax changed
    if (data.shippingCost !== undefined || data.taxAmount !== undefined) {
      const newShipping = data.shippingCost !== undefined ? data.shippingCost : po.shipping || 0;
      const newTax = data.taxAmount !== undefined ? data.taxAmount : po.tax || 0;
      updateData.total = po.subtotal + newTax + newShipping;
    }

    const updatedPO = await prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'purchase_order',
      resourceId: id,
      ipAddress,
      metadata: { updatedFields: Object.keys(data) },
    });

    return c.json({
      purchaseOrder: {
        ...updatedPO,
        status: convertStatusFromPrisma(updatedPO.status),
        createdAt: updatedPO.createdAt.toISOString(),
        updatedAt: updatedPO.updatedAt.toISOString(),
        expectedDate: updatedPO.expectedDate?.toISOString(),
        orderedAt: updatedPO.orderedAt?.toISOString(),
        receivedAt: updatedPO.receivedAt?.toISOString(),
      },
      message: 'Purchase order updated successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Cancel/Delete purchase order (soft delete)
 * DELETE /api/purchase-orders/:id
 */
purchaseOrders.delete('/:id', zValidator('param', poIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!po) {
      throw APIError.notFound('Purchase order');
    }

    // Cannot cancel received POs
    if (po.status === 'RECEIVED') {
      throw APIError.badRequest('Cannot cancel a received purchase order');
    }

    // Already cancelled
    if (po.status === 'CANCELLED') {
      throw APIError.badRequest('Purchase order is already cancelled');
    }

    // Cancel the PO
    await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'DELETE',
      resourceType: 'purchase_order',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      success: true,
      message: 'Purchase order cancelled successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Submit purchase order to vendor
 * POST /api/purchase-orders/:id/submit
 */
purchaseOrders.post('/:id/submit', zValidator('param', poIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  let data: { vendorEmail?: string; message?: string } = {};
  try {
    const body = await c.req.json();
    if (body) data = body;
  } catch {
    // Empty body is fine
  }
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!po) {
      throw APIError.notFound('Purchase order');
    }

    // Can only submit draft POs
    if (po.status !== 'DRAFT') {
      throw APIError.badRequest(`Cannot submit purchase order with status '${convertStatusFromPrisma(po.status)}'`);
    }

    // Validate has items
    const items = (po.items as any) || [];
    if (!Array.isArray(items) || items.length === 0) {
      throw APIError.badRequest('Cannot submit purchase order with no items');
    }

    // Mock sending to vendor (in production, this would integrate with email/EDI)
    const vendorEmail = data.vendorEmail;

    // Update status
    const updatedPO = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        orderedAt: new Date(),
        orderedBy: user.uid,
        updatedAt: new Date(),
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'purchase_order',
      resourceId: id,
      ipAddress,
      metadata: { action: 'submit', vendorEmail },
    });

    return c.json({
      success: true,
      message: `Purchase order submitted${vendorEmail ? ` to ${vendorEmail}` : ''}`,
      submittedAt: updatedPO.orderedAt?.toISOString(),
      purchaseOrder: {
        id: updatedPO.id,
        orderNumber: updatedPO.orderNumber,
        status: convertStatusFromPrisma(updatedPO.status),
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Receive full shipment (creates inventory lots)
 * POST /api/purchase-orders/:id/receive
 */
purchaseOrders.post('/:id/receive', zValidator('param', poIdSchema), zValidator('json', receiveSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const result = await transactionWithErrorHandling(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id },
      });

      if (!po) {
        throw APIError.notFound('Purchase order');
      }

      // Check if PO can be received
      if (!canReceive(po.status)) {
        throw APIError.badRequest(`Cannot receive purchase order with status '${convertStatusFromPrisma(po.status)}'`);
      }

      const now = new Date();
      const createdLots: any[] = [];
      const poItems = (po.items as any) || [];

      // Process each item
      for (const receiveItem of data.items) {
        const poItem = poItems.find((item: any) => item.id === receiveItem.itemId);
        if (!poItem) {
          throw APIError.badRequest(`Item ${receiveItem.itemId} not found in purchase order`);
        }

        // Validate quantity doesn't exceed pending
        const totalLotQuantity = receiveItem.lots.reduce((sum, lot) => sum + lot.quantity, 0);
        if (totalLotQuantity !== receiveItem.quantityReceived) {
          throw APIError.badRequest(`Lot quantities (${totalLotQuantity}) don't match received quantity (${receiveItem.quantityReceived})`);
        }

        if (receiveItem.quantityReceived > poItem.quantityPending) {
          throw APIError.badRequest(`Cannot receive more than pending quantity for item ${poItem.productName}`);
        }

        // Create inventory lots
        for (const lot of receiveItem.lots) {
          const inventoryLot = await tx.inventoryLot.create({
            data: {
              productId: poItem.productId,
              locationId: 'default-location', // TODO: Use actual location from PO
              lotNumber: lot.lotNumber,
              expirationDate: new Date(lot.expirationDate),
              manufacturingDate: lot.manufacturingDate ? new Date(lot.manufacturingDate) : null,
              receivedDate: now,
              initialQuantity: lot.quantity,
              currentQuantity: lot.quantity,
              reservedQuantity: 0,
              unitType: convertUnitTypeToPrisma(poItem.unitType),
              storageLocation: lot.storageLocation || null,
              purchaseOrderId: po.id,
              vendorId: po.vendorId || null,
              purchaseCost: poItem.unitCost * lot.quantity,
              status: 'available',
              createdBy: user.uid,
            },
          });

          createdLots.push({
            id: inventoryLot.id,
            lotNumber: inventoryLot.lotNumber,
            quantity: inventoryLot.initialQuantity,
            expirationDate: inventoryLot.expirationDate,
          });

          // Create inventory transaction
          await tx.inventoryTransaction.create({
            data: {
              type: 'PURCHASE',
              productId: poItem.productId,
              lotId: inventoryLot.id,
              quantity: lot.quantity,
              previousQuantity: 0,
              newQuantity: lot.quantity,
              unitCost: poItem.unitCost,
              totalCost: poItem.unitCost * lot.quantity,
              locationId: 'default-location',
              reason: `Received from PO ${po.orderNumber}`,
              referenceNumber: po.orderNumber,
              createdBy: user.uid,
            },
          });
        }

        // Update PO item quantities
        poItem.quantityReceived += receiveItem.quantityReceived;
        poItem.quantityPending = poItem.quantityOrdered - poItem.quantityReceived;
      }

      // Check if all items are fully received
      const allReceived = poItems.every((item: any) => item.quantityPending === 0);

      // Update PO status
      const updatedPO = await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: allReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED',
          items: poItems as any,
          receivedAt: allReceived ? now : null,
          receivedBy: user.uid,
          updatedAt: now,
        },
      });

      return { updatedPO, createdLots, allReceived };
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'purchase_order',
      resourceId: id,
      ipAddress,
      metadata: {
        action: 'receive',
        lotsCreated: result.createdLots.length,
        itemsReceived: data.items.length,
        status: convertStatusFromPrisma(result.updatedPO.status),
      },
    });

    return c.json({
      success: true,
      message: result.allReceived ? 'Purchase order fully received' : 'Partial shipment received',
      purchaseOrder: {
        id: result.updatedPO.id,
        orderNumber: result.updatedPO.orderNumber,
        status: convertStatusFromPrisma(result.updatedPO.status),
      },
      lotsCreated: result.createdLots.map(lot => ({
        id: lot.id,
        lotNumber: lot.lotNumber,
        quantity: lot.quantity,
        expirationDate: lot.expirationDate.toISOString(),
      })),
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Receive partial shipment
 * POST /api/purchase-orders/:id/receive-partial
 */
purchaseOrders.post('/:id/receive-partial', zValidator('param', poIdSchema), zValidator('json', partialReceiveSchema), async (c) => {
  // Same logic as full receive - the schema allows partial quantities
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const result = await transactionWithErrorHandling(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id },
      });

      if (!po) {
        throw APIError.notFound('Purchase order');
      }

      if (!canReceive(po.status)) {
        throw APIError.badRequest(`Cannot receive purchase order with status '${convertStatusFromPrisma(po.status)}'`);
      }

      const now = new Date();
      const createdLots: any[] = [];
      const poItems = (po.items as any) || [];

      for (const receiveItem of data.items) {
        const poItem = poItems.find((item: any) => item.id === receiveItem.itemId);
        if (!poItem) {
          throw APIError.badRequest(`Item ${receiveItem.itemId} not found in purchase order`);
        }

        const totalLotQuantity = receiveItem.lots.reduce((sum, lot) => sum + lot.quantity, 0);
        if (totalLotQuantity !== receiveItem.quantityReceived) {
          throw APIError.badRequest(`Lot quantities (${totalLotQuantity}) don't match received quantity (${receiveItem.quantityReceived})`);
        }

        if (receiveItem.quantityReceived > poItem.quantityPending) {
          throw APIError.badRequest(`Cannot receive more than pending quantity for item ${poItem.productName}`);
        }

        for (const lot of receiveItem.lots) {
          const inventoryLot = await tx.inventoryLot.create({
            data: {
              productId: poItem.productId,
              locationId: 'default-location',
              lotNumber: lot.lotNumber,
              expirationDate: new Date(lot.expirationDate),
              manufacturingDate: lot.manufacturingDate ? new Date(lot.manufacturingDate) : null,
              receivedDate: now,
              initialQuantity: lot.quantity,
              currentQuantity: lot.quantity,
              reservedQuantity: 0,
              unitType: convertUnitTypeToPrisma(poItem.unitType),
              storageLocation: lot.storageLocation || null,
              purchaseOrderId: po.id,
              vendorId: po.vendorId || null,
              purchaseCost: poItem.unitCost * lot.quantity,
              status: 'available',
              createdBy: user.uid,
            },
          });

          createdLots.push({
            id: inventoryLot.id,
            lotNumber: inventoryLot.lotNumber,
            quantity: inventoryLot.initialQuantity,
            expirationDate: inventoryLot.expirationDate,
          });

          await tx.inventoryTransaction.create({
            data: {
              type: 'PURCHASE',
              productId: poItem.productId,
              lotId: inventoryLot.id,
              quantity: lot.quantity,
              previousQuantity: 0,
              newQuantity: lot.quantity,
              unitCost: poItem.unitCost,
              totalCost: poItem.unitCost * lot.quantity,
              locationId: 'default-location',
              reason: `Partial receive from PO ${po.orderNumber}`,
              referenceNumber: po.orderNumber,
              createdBy: user.uid,
            },
          });
        }

        poItem.quantityReceived += receiveItem.quantityReceived;
        poItem.quantityPending = poItem.quantityOrdered - poItem.quantityReceived;
      }

      const allReceived = poItems.every((item: any) => item.quantityPending === 0);

      const updatedPO = await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: allReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED',
          items: poItems as any,
          receivedAt: allReceived ? now : null,
          receivedBy: user.uid,
          updatedAt: now,
        },
      });

      return { updatedPO, createdLots, allReceived, itemsRemaining: poItems.filter((i: any) => i.quantityPending > 0).length };
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'purchase_order',
      resourceId: id,
      ipAddress,
      metadata: {
        action: 'receive_partial',
        lotsCreated: result.createdLots.length,
        itemsReceived: data.items.length,
        status: convertStatusFromPrisma(result.updatedPO.status),
      },
    });

    return c.json({
      success: true,
      message: result.allReceived ? 'Purchase order fully received' : 'Partial shipment received',
      purchaseOrder: {
        id: result.updatedPO.id,
        orderNumber: result.updatedPO.orderNumber,
        status: convertStatusFromPrisma(result.updatedPO.status),
        itemsRemaining: result.itemsRemaining,
      },
      lotsCreated: result.createdLots.map(lot => ({
        id: lot.id,
        lotNumber: lot.lotNumber,
        quantity: lot.quantity,
        expirationDate: lot.expirationDate.toISOString(),
      })),
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get receiving history for a purchase order
 * GET /api/purchase-orders/:id/receiving-history
 */
purchaseOrders.get('/:id/receiving-history', zValidator('param', poIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!po) {
      throw APIError.notFound('Purchase order');
    }

    // Get all inventory lots created for this PO
    const lots = await prisma.inventoryLot.findMany({
      where: {
        purchaseOrderId: id,
      },
      orderBy: {
        receivedDate: 'desc',
      },
    });

    // Get inventory transactions for this PO
    const transactions = await prisma.inventoryTransaction.findMany({
      where: {
        referenceNumber: po.orderNumber,
        type: 'PURCHASE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'receiving_history',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      purchaseOrderId: id,
      orderNumber: po.orderNumber,
      receivingHistory: lots.map(lot => ({
        id: lot.id,
        lotNumber: lot.lotNumber,
        quantity: lot.initialQuantity,
        receivedAt: lot.receivedDate.toISOString(),
        expirationDate: lot.expirationDate.toISOString(),
        storageLocation: lot.storageLocation,
        status: lot.status,
      })),
      totalReceivings: lots.length,
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

// ===================
// Vendor Routes
// ===================

/**
 * List vendors
 * GET /api/vendors
 */
purchaseOrders.get('/vendors', zValidator('query', listVendorsSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Build where clause
    const where: Prisma.VendorWhereInput = {
      deletedAt: null,
    };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { shortName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    // Get total count
    const total = await prisma.vendor.count({ where });

    // Get paginated results
    const offset = (query.page - 1) * query.limit;
    const vendors = await prisma.vendor.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: offset,
      take: query.limit,
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'vendor_list',
      ipAddress,
      metadata: { query, resultCount: vendors.length },
    });

    return c.json({
      items: vendors.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        shortName: vendor.shortName,
        email: vendor.email,
        phone: vendor.phone,
        isActive: vendor.isActive,
        isPreferred: vendor.isPreferred,
        averageLeadDays: vendor.averageLeadDays,
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
 * Get single vendor by ID
 * GET /api/vendors/:id
 */
purchaseOrders.get('/vendors/:id', zValidator('param', vendorIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
    });

    if (!vendor || vendor.deletedAt) {
      throw APIError.notFound('Vendor');
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'vendor',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      vendor: {
        ...vendor,
        createdAt: vendor.createdAt.toISOString(),
        updatedAt: vendor.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Create new vendor
 * POST /api/vendors
 */
purchaseOrders.post('/vendors', zValidator('json', createVendorSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const vendor = await prisma.vendor.create({
      data: {
        name: data.name,
        shortName: data.shortName || null,
        contactName: data.contactName || null,
        email: data.email || null,
        phone: data.phone || null,
        fax: data.fax || null,
        website: data.website || null,
        address: data.address ? (data.address as any) : Prisma.JsonNull,
        accountNumber: data.accountNumber || null,
        paymentTerms: data.paymentTerms || null,
        taxId: data.taxId || null,
        averageLeadDays: data.averageLeadDays,
        isActive: true,
        isPreferred: data.isPreferred ?? false,
        notes: data.notes || null,
        createdBy: user.uid,
        updatedBy: user.uid,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'vendor',
      resourceId: vendor.id,
      ipAddress,
      metadata: { vendorName: data.name },
    });

    return c.json({
      vendor: {
        ...vendor,
        createdAt: vendor.createdAt.toISOString(),
        updatedAt: vendor.updatedAt.toISOString(),
      },
      message: 'Vendor created successfully',
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Update vendor
 * PUT /api/vendors/:id
 */
purchaseOrders.put('/vendors/:id', zValidator('param', vendorIdSchema), zValidator('json', updateVendorSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
    });

    if (!vendor || vendor.deletedAt) {
      throw APIError.notFound('Vendor');
    }

    // Build update data
    const updateData: Prisma.VendorUpdateInput = {
      updatedBy: user.uid,
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.shortName !== undefined) updateData.shortName = data.shortName;
    if (data.contactName !== undefined) updateData.contactName = data.contactName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.fax !== undefined) updateData.fax = data.fax;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.address !== undefined) updateData.address = data.address as any;
    if (data.accountNumber !== undefined) updateData.accountNumber = data.accountNumber;
    if (data.paymentTerms !== undefined) updateData.paymentTerms = data.paymentTerms;
    if (data.taxId !== undefined) updateData.taxId = data.taxId;
    if (data.averageLeadDays !== undefined) updateData.averageLeadDays = data.averageLeadDays;
    if (data.isPreferred !== undefined) updateData.isPreferred = data.isPreferred;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: updateData,
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'vendor',
      resourceId: id,
      ipAddress,
      metadata: { updatedFields: Object.keys(data) },
    });

    return c.json({
      vendor: {
        ...updatedVendor,
        createdAt: updatedVendor.createdAt.toISOString(),
        updatedAt: updatedVendor.updatedAt.toISOString(),
      },
      message: 'Vendor updated successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Deactivate vendor (soft delete)
 * DELETE /api/vendors/:id
 */
purchaseOrders.delete('/vendors/:id', zValidator('param', vendorIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id },
    });

    if (!vendor || vendor.deletedAt) {
      throw APIError.notFound('Vendor');
    }

    // Check if vendor has open POs
    const openPOsCount = await prisma.purchaseOrder.count({
      where: {
        vendorId: id,
        status: {
          notIn: ['RECEIVED', 'CANCELLED'],
        },
      },
    });

    if (openPOsCount > 0) {
      throw APIError.badRequest(`Cannot deactivate vendor with ${openPOsCount} open purchase order(s)`);
    }

    await prisma.vendor.update({
      where: { id },
      data: {
        isActive: false,
        updatedBy: user.uid,
        updatedAt: new Date(),
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'DELETE',
      resourceType: 'vendor',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      success: true,
      message: 'Vendor deactivated successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

export default purchaseOrders;
