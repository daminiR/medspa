/**
 * Invoices API Routes
 *
 * Full CRUD operations for invoice management with:
 * - Pagination and filtering
 * - Line item management
 * - Status transitions
 * - PDF generation (mock)
 * - Email sending (mock)
 * - Daily/weekly summaries
 * - Audit logging
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { sessionAuthMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { handlePrismaError, transactionWithErrorHandling } from '../middleware/prisma-error-handler';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { Prisma, InvoiceStatus, LineItemType, UnitType, DiscountType } from '@prisma/client';

const invoices = new Hono();

// ===================
// Validation Schemas
// ===================

// Invoice status
const invoiceStatusSchema = z.enum([
  'draft',
  'sent',
  'viewed',
  'paid',
  'partially_paid',
  'overdue',
  'cancelled',
  'refunded',
]);

// Line item type
const lineItemTypeSchema = z.enum([
  'service',
  'product',
  'package',
  'injectable',
  'adjustment',
]);

// Unit type for injectables
const unitTypeSchema = z.enum(['unit', 'syringe', 'vial', 'ml']);

// Discount type
const discountTypeSchema = z.enum(['percentage', 'fixed']);

// Line item schema for creation
const createLineItemSchema = z.object({
  type: lineItemTypeSchema,
  itemId: z.string().optional(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  unitType: unitTypeSchema.optional(),
  lotNumber: z.string().max(100).optional(),
  discountType: discountTypeSchema.optional(),
  discountValue: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(100).default(0),
  providerId: z.string().uuid().optional(),
});

// Create invoice schema
const createInvoiceSchema = z.object({
  patientId: z.string().uuid(),
  providerId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  serviceDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  lineItems: z.array(createLineItemSchema).optional(),
  internalNotes: z.string().max(2000).optional(),
  patientNotes: z.string().max(2000).optional(),
});

// Update invoice schema
const updateInvoiceSchema = z.object({
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  serviceDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  internalNotes: z.string().max(2000).optional(),
  patientNotes: z.string().max(2000).optional(),
  status: invoiceStatusSchema.optional(),
});

// List invoices query schema
const listInvoicesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  patientId: z.string().uuid().optional(),
  status: invoiceStatusSchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['invoiceNumber', 'invoiceDate', 'total', 'balance']).default('invoiceDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Invoice ID param schema
const invoiceIdSchema = z.object({
  id: z.string().uuid(),
});

// Line item ID param schema
const lineItemIdSchema = z.object({
  id: z.string().uuid(),
  itemId: z.string().uuid(),
});

// Patient ID param schema
const patientIdSchema = z.object({
  patientId: z.string().uuid(),
});

// Summary query schema
const summaryQuerySchema = z.object({
  period: z.enum(['daily', 'weekly']).default('daily'),
  date: z.string().optional(), // If not provided, use today
});

// Send invoice schema (all fields optional, can be empty object)
const sendInvoiceSchema = z.object({
  email: z.string().email().optional(),
  message: z.string().max(1000).optional(),
}).optional();

// ===================
// Type Definitions
// ===================

// Invoice types now come from Prisma
export type StoredInvoice = Prisma.InvoiceGetPayload<{
  include: { InvoiceLineItem: true };
}>;

export type StoredLineItem = Prisma.InvoiceLineItemGetPayload<{}>;

// ===================
// Helper Functions
// ===================

function generateInvoiceId(): string {
  return randomUUID();
}

function generateLineItemId(): string {
  return randomUUID();
}

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();

  // Get the highest invoice number for this year
  const lastInvoice = await prisma.invoice.findFirst({
    where: {
      invoiceNumber: {
        startsWith: `INV-${year}-`,
      },
    },
    orderBy: {
      invoiceNumber: 'desc',
    },
  });

  let counter = 0;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
    counter = lastNumber;
  }

  counter++;
  return `INV-${year}-${counter.toString().padStart(4, '0')}`;
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

function calculateLineItemTotals(item: {
  quantity: number;
  unitPrice: number;
  discountType?: 'percentage' | 'fixed' | 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
  taxRate: number;
}): { discountAmount: number; taxAmount: number; lineTotal: number } {
  // Use integer math for precision (work in cents)
  const subtotalCents = Math.round(item.quantity * item.unitPrice * 100);

  // Calculate discount
  let discountAmountCents = 0;
  if (item.discountValue && item.discountValue > 0) {
    const discountType = typeof item.discountType === 'string' ? item.discountType.toUpperCase() : item.discountType;
    if (discountType === 'PERCENTAGE') {
      discountAmountCents = Math.round(subtotalCents * (item.discountValue / 100));
    } else {
      discountAmountCents = Math.round(item.discountValue * 100);
    }
  }

  const afterDiscountCents = subtotalCents - discountAmountCents;

  // Calculate tax
  const taxAmountCents = Math.round(afterDiscountCents * (item.taxRate / 100));

  // Line total
  const lineTotalCents = afterDiscountCents + taxAmountCents;

  // Convert back to dollars with proper rounding
  return {
    discountAmount: Math.round(discountAmountCents) / 100,
    taxAmount: Math.round(taxAmountCents) / 100,
    lineTotal: Math.round(lineTotalCents) / 100,
  };
}

function calculateInvoiceTotals(lineItems: StoredLineItem[], amountPaid: number): {
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  balance: number;
} {
  // Use integer math for precision (work in cents)
  let subtotalCents = 0;
  let taxTotalCents = 0;
  let discountTotalCents = 0;

  for (const item of lineItems) {
    const itemSubtotalCents = Math.round(item.quantity * item.unitPrice * 100);
    subtotalCents += itemSubtotalCents;
    taxTotalCents += Math.round(item.taxAmount * 100);
    discountTotalCents += Math.round(item.discountAmount * 100);
  }

  const totalCents = subtotalCents - discountTotalCents + taxTotalCents;
  const balanceCents = totalCents - Math.round(amountPaid * 100);

  return {
    subtotal: Math.round(subtotalCents) / 100,
    taxTotal: Math.round(taxTotalCents) / 100,
    discountTotal: Math.round(discountTotalCents) / 100,
    total: Math.round(totalCents) / 100,
    balance: Math.round(balanceCents) / 100,
  };
}

function calculateInvoiceStatus(balance: number, total: number, amountPaid: number, dueDate: Date, currentStatus: InvoiceStatus): InvoiceStatus {
  // Don't change if cancelled or refunded
  if (currentStatus === InvoiceStatus.CANCELLED || currentStatus === InvoiceStatus.REFUNDED) {
    return currentStatus;
  }

  const now = new Date();
  const isOverdue = dueDate < now;

  // Auto-update status based on balance and payment
  if (balance <= 0.01 && total > 0) { // Use small epsilon for floating point comparison
    return InvoiceStatus.PAID;
  } else if (amountPaid > 0 && balance > 0.01) {
    // Check if overdue
    if (isOverdue) {
      return InvoiceStatus.OVERDUE;
    }
    return InvoiceStatus.PARTIALLY_PAID;
  } else if (balance > 0.01 && isOverdue && currentStatus !== InvoiceStatus.DRAFT) {
    return InvoiceStatus.OVERDUE;
  }

  return currentStatus;
}

function canEditInvoice(status: InvoiceStatus): boolean {
  return status !== InvoiceStatus.PAID &&
         status !== InvoiceStatus.REFUNDED &&
         status !== InvoiceStatus.CANCELLED;
}

function isValidStatusTransition(from: InvoiceStatus, to: InvoiceStatus): boolean {
  const transitions: Record<string, InvoiceStatus[]> = {
    [InvoiceStatus.DRAFT]: [InvoiceStatus.SENT, InvoiceStatus.CANCELLED],
    [InvoiceStatus.SENT]: [InvoiceStatus.VIEWED, InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE, InvoiceStatus.CANCELLED],
    [InvoiceStatus.VIEWED]: [InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE, InvoiceStatus.CANCELLED],
    [InvoiceStatus.PARTIALLY_PAID]: [InvoiceStatus.PAID, InvoiceStatus.OVERDUE, InvoiceStatus.CANCELLED, InvoiceStatus.REFUNDED],
    [InvoiceStatus.PAID]: [InvoiceStatus.REFUNDED],
    [InvoiceStatus.OVERDUE]: [InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.CANCELLED],
    [InvoiceStatus.CANCELLED]: [],
    [InvoiceStatus.REFUNDED]: [],
  };

  return transitions[from]?.includes(to) ?? false;
}

/**
 * Convert enum status to lowercase API format
 */
function formatInvoiceStatus(status: InvoiceStatus): string {
  return status.toLowerCase();
}

/**
 * Convert API status string to enum
 */
function parseInvoiceStatus(status: string): InvoiceStatus {
  return status.toUpperCase() as InvoiceStatus;
}

/**
 * Convert enum to lowercase API format for line item type
 */
function formatLineItemType(type: LineItemType): string {
  return type.toLowerCase();
}

/**
 * Convert API string to enum for line item type
 */
function parseLineItemType(type: string): LineItemType {
  return type.toUpperCase() as LineItemType;
}

// Note: Mock data should be seeded using Prisma seed script
// Database should already have seed data for invoices and patients

// ===================
// Middleware
// ===================

// All invoice routes require session authentication
invoices.use('/*', sessionAuthMiddleware);

// ===================
// Routes
// ===================

/**
 * Get invoice summary (daily/weekly)
 * GET /api/invoices/summary
 */
invoices.get('/summary', zValidator('query', summaryQuerySchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const targetDate = query.date ? new Date(query.date) : new Date();
    let startDate: Date;
    let endDate: Date;

    if (query.period === 'weekly') {
      // Get start of week (Sunday)
      startDate = new Date(targetDate);
      startDate.setDate(targetDate.getDate() - targetDate.getDay());
      startDate.setHours(0, 0, 0, 0);

      // Get end of week (Saturday)
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Daily - start and end of the target date
      startDate = new Date(targetDate);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999);
    }

    // Fetch invoices in the date range (exclude voided)
    const relevantInvoices = await prisma.invoice.findMany({
      where: {
        invoiceDate: {
          gte: startDate,
          lte: endDate,
        },
        voidedAt: null,
      },
    });

    // Calculate summary statistics
    const summary = {
      period: query.period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalInvoices: relevantInvoices.length,
      totalRevenue: relevantInvoices.reduce((sum, inv) => sum + inv.total, 0),
      totalPaid: relevantInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0),
      totalOutstanding: relevantInvoices.reduce((sum, inv) => sum + inv.balance, 0),
      byStatus: {
        draft: relevantInvoices.filter(inv => inv.status === 'DRAFT').length,
        sent: relevantInvoices.filter(inv => inv.status === 'SENT').length,
        paid: relevantInvoices.filter(inv => inv.status === 'PAID').length,
        partially_paid: relevantInvoices.filter(inv => inv.status === 'PARTIALLY_PAID').length,
        overdue: relevantInvoices.filter(inv => inv.status === 'OVERDUE').length,
        cancelled: relevantInvoices.filter(inv => inv.status === 'CANCELLED').length,
      },
    };

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'invoice_summary',
      ipAddress,
      metadata: { period: query.period, date: query.date },
    });

    return c.json({ summary });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * List invoices (paginated, filterable)
 * GET /api/invoices
 */
invoices.get('/', zValidator('query', listInvoicesSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Build where clause
    const where: Prisma.InvoiceWhereInput = {
      voidedAt: null,
    };

    // Apply patient filter
    if (query.patientId) {
      where.patientId = query.patientId;
    }

    // Apply status filter
    if (query.status) {
      where.status = parseInvoiceStatus(query.status);
    }

    // Apply date range filters
    if (query.dateFrom || query.dateTo) {
      where.invoiceDate = {};
      if (query.dateFrom) {
        const fromDate = new Date(query.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        where.invoiceDate.gte = fromDate;
      }
      if (query.dateTo) {
        const toDate = new Date(query.dateTo);
        toDate.setHours(23, 59, 59, 999);
        where.invoiceDate.lte = toDate;
      }
    }

    // Build orderBy
    const orderBy: Prisma.InvoiceOrderByWithRelationInput = {};
    switch (query.sortBy) {
      case 'invoiceNumber':
        orderBy.invoiceNumber = query.sortOrder;
        break;
      case 'invoiceDate':
        orderBy.invoiceDate = query.sortOrder;
        break;
      case 'total':
        orderBy.total = query.sortOrder;
        break;
      case 'balance':
        orderBy.balance = query.sortOrder;
        break;
      default:
        orderBy.invoiceDate = query.sortOrder;
    }

    // Calculate pagination
    const offset = (query.page - 1) * query.limit;

    // Execute queries in parallel
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy,
        skip: offset,
        take: query.limit,
        include: {
          InvoiceLineItem: true,
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'invoice_list',
      ipAddress,
      metadata: { query, resultCount: invoices.length },
    });

    return c.json({
      items: invoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        patientId: inv.patientId,
        patientName: inv.patientName,
        invoiceDate: inv.invoiceDate.toISOString(),
        dueDate: inv.dueDate.toISOString(),
        total: inv.total,
        amountPaid: inv.amountPaid,
        balance: inv.balance,
        status: formatInvoiceStatus(inv.status),
        lineItemCount: inv.InvoiceLineItem.length,
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
 * Get single invoice by ID
 * GET /api/invoices/:id
 */
invoices.get('/:id', zValidator('param', invoiceIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        InvoiceLineItem: true,
        Payment: true,
      },
    });

    if (!invoice || invoice.voidedAt) {
      throw APIError.notFound('Invoice');
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'invoice',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        patientId: invoice.patientId,
        patientName: invoice.patientName,
        providerId: invoice.providerId,
        providerName: invoice.providerName,
        locationId: invoice.locationId,
        appointmentId: invoice.appointmentId,
        invoiceDate: invoice.invoiceDate.toISOString(),
        dueDate: invoice.dueDate.toISOString(),
        serviceDate: invoice.serviceDate?.toISOString(),
        lineItems: invoice.InvoiceLineItem.map(item => ({
          id: item.id,
          type: formatLineItemType(item.type),
          itemId: item.itemId,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unitType: item.unitType?.toLowerCase(),
          lotNumber: item.lotNumber,
          discountType: item.discountType?.toLowerCase(),
          discountValue: item.discountValue,
          discountAmount: item.discountAmount,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          lineTotal: item.lineTotal,
          providerId: item.providerId,
        })),
        subtotal: invoice.subtotal,
        taxTotal: invoice.taxTotal,
        discountTotal: invoice.discountTotal,
        total: invoice.total,
        amountPaid: invoice.amountPaid,
        balance: invoice.balance,
        status: formatInvoiceStatus(invoice.status),
        internalNotes: invoice.internalNotes,
        patientNotes: invoice.patientNotes,
        sentAt: invoice.sentAt?.toISOString(),
        paidAt: invoice.paidAt?.toISOString(),
        cancelledAt: invoice.cancelledAt?.toISOString(),
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
        createdBy: invoice.createdBy,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Create new invoice
 * POST /api/invoices
 */
invoices.post('/', zValidator('json', createInvoiceSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Validate patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: data.patientId },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!patient) {
      throw APIError.badRequest('Patient not found');
    }

    const id = generateInvoiceId();
    const now = new Date();

    // Default due date to 14 days from now if not provided
    const dueDate = data.dueDate ? new Date(data.dueDate) : new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Get provider name if provider ID is provided
    let providerName: string | undefined;
    if (data.providerId) {
      // Note: In production, fetch from a Staff/Provider table
      providerName = `Provider ${data.providerId.slice(0, 8)}`;
    }

    // Process line items and calculate totals
    const lineItemsData = (data.lineItems || []).map(item => {
      const totals = calculateLineItemTotals({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountType: item.discountType,
        discountValue: item.discountValue,
        taxRate: item.taxRate,
      });
      return {
        id: generateLineItemId(),
        type: parseLineItemType(item.type),
        itemId: item.itemId,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unitType: item.unitType ? item.unitType.toUpperCase() as UnitType : undefined,
        lotNumber: item.lotNumber,
        discountType: item.discountType ? item.discountType.toUpperCase() as DiscountType : undefined,
        discountValue: item.discountValue,
        discountAmount: totals.discountAmount,
        taxRate: item.taxRate,
        taxAmount: totals.taxAmount,
        lineTotal: totals.lineTotal,
        providerId: item.providerId,
      };
    });

    // Calculate invoice totals from temporary data structure
    const totals = calculateInvoiceTotals(
      lineItemsData.map(item => ({
        ...item,
        invoiceId: id, // Add missing field for type compatibility
      })) as any,
      0
    );

    // Create invoice with line items in a transaction
    const invoice = await transactionWithErrorHandling(async (tx) => {
      return await tx.invoice.create({
        data: {
          id,
          invoiceNumber,
          patientId: data.patientId,
          patientName: `${patient.firstName} ${patient.lastName}`,
          providerId: data.providerId,
          providerName,
          locationId: data.locationId,
          appointmentId: data.appointmentId,
          invoiceDate: now,
          dueDate,
          serviceDate: data.serviceDate ? new Date(data.serviceDate) : undefined,
          subtotal: totals.subtotal,
          taxTotal: totals.taxTotal,
          discountTotal: totals.discountTotal,
          total: totals.total,
          amountPaid: 0,
          balance: totals.balance,
          status: 'DRAFT',
          internalNotes: data.internalNotes,
          patientNotes: data.patientNotes,
          createdBy: user.uid,
          updatedAt: now,
          // Create line items
          InvoiceLineItem: {
            create: lineItemsData.map(item => ({
              id: item.id,
              type: item.type,
              itemId: item.itemId,
              name: item.name,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              unitType: item.unitType,
              lotNumber: item.lotNumber,
              discountType: item.discountType,
              discountValue: item.discountValue,
              discountAmount: item.discountAmount,
              taxRate: item.taxRate,
              taxAmount: item.taxAmount,
              lineTotal: item.lineTotal,
              providerId: item.providerId,
            })),
          },
        },
        include: {
          InvoiceLineItem: true,
        },
      });
    }, { timeout: 30000 });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'invoice',
      resourceId: id,
      ipAddress,
      metadata: { invoiceNumber: invoice.invoiceNumber, patientId: data.patientId },
    });

    return c.json({
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        patientId: invoice.patientId,
        patientName: invoice.patientName,
        providerId: invoice.providerId,
        providerName: invoice.providerName,
        locationId: invoice.locationId,
        appointmentId: invoice.appointmentId,
        invoiceDate: invoice.invoiceDate.toISOString(),
        dueDate: invoice.dueDate.toISOString(),
        serviceDate: invoice.serviceDate?.toISOString(),
        lineItems: invoice.InvoiceLineItem.map(item => ({
          id: item.id,
          type: formatLineItemType(item.type),
          itemId: item.itemId,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unitType: item.unitType?.toLowerCase(),
          lotNumber: item.lotNumber,
          discountType: item.discountType?.toLowerCase(),
          discountValue: item.discountValue,
          discountAmount: item.discountAmount,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          lineTotal: item.lineTotal,
          providerId: item.providerId,
        })),
        subtotal: invoice.subtotal,
        taxTotal: invoice.taxTotal,
        discountTotal: invoice.discountTotal,
        total: invoice.total,
        amountPaid: invoice.amountPaid,
        balance: invoice.balance,
        status: formatInvoiceStatus(invoice.status),
        internalNotes: invoice.internalNotes,
        patientNotes: invoice.patientNotes,
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
      },
      message: 'Invoice created successfully',
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Update invoice
 * PUT /api/invoices/:id
 */
invoices.put('/:id', zValidator('param', invoiceIdSchema), zValidator('json', updateInvoiceSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { InvoiceLineItem: true },
    });

    if (!invoice || invoice.voidedAt) {
      throw APIError.notFound('Invoice');
    }

    // Check if invoice can be edited
    if (!canEditInvoice(invoice.status)) {
      throw APIError.badRequest(`Cannot edit invoice with status '${formatInvoiceStatus(invoice.status)}'`);
    }

    // Validate status transition if status is being changed
    if (data.status) {
      const newStatus = parseInvoiceStatus(data.status);
      if (newStatus !== invoice.status) {
        if (!isValidStatusTransition(invoice.status, newStatus)) {
          throw APIError.badRequest(
            `Invalid status transition from '${formatInvoiceStatus(invoice.status)}' to '${data.status}'`
          );
        }
      }
    }

    // Build update data
    const updateData: Prisma.InvoiceUpdateInput = {
      updatedAt: new Date(),
    };

    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.serviceDate) updateData.serviceDate = new Date(data.serviceDate);
    if (data.internalNotes !== undefined) updateData.internalNotes = data.internalNotes;
    if (data.patientNotes !== undefined) updateData.patientNotes = data.patientNotes;
    if (data.status) {
      const newStatus = parseInvoiceStatus(data.status);
      updateData.status = newStatus;
      if (newStatus === 'CANCELLED') {
        updateData.cancelledAt = new Date();
      } else if (newStatus === 'PAID') {
        updateData.paidAt = new Date();
      }
    }

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        InvoiceLineItem: true,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'invoice',
      resourceId: id,
      ipAddress,
      metadata: { updatedFields: Object.keys(data) },
    });

    return c.json({
      invoice: {
        id: updatedInvoice.id,
        invoiceNumber: updatedInvoice.invoiceNumber,
        patientId: updatedInvoice.patientId,
        patientName: updatedInvoice.patientName,
        providerId: updatedInvoice.providerId,
        providerName: updatedInvoice.providerName,
        locationId: updatedInvoice.locationId,
        appointmentId: updatedInvoice.appointmentId,
        invoiceDate: updatedInvoice.invoiceDate.toISOString(),
        dueDate: updatedInvoice.dueDate.toISOString(),
        serviceDate: updatedInvoice.serviceDate?.toISOString(),
        lineItems: updatedInvoice.InvoiceLineItem.map(item => ({
          id: item.id,
          type: formatLineItemType(item.type),
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
        subtotal: updatedInvoice.subtotal,
        taxTotal: updatedInvoice.taxTotal,
        discountTotal: updatedInvoice.discountTotal,
        total: updatedInvoice.total,
        amountPaid: updatedInvoice.amountPaid,
        balance: updatedInvoice.balance,
        status: formatInvoiceStatus(updatedInvoice.status),
        internalNotes: updatedInvoice.internalNotes,
        patientNotes: updatedInvoice.patientNotes,
        sentAt: updatedInvoice.sentAt?.toISOString(),
        paidAt: updatedInvoice.paidAt?.toISOString(),
        cancelledAt: updatedInvoice.cancelledAt?.toISOString(),
        createdAt: updatedInvoice.createdAt.toISOString(),
        updatedAt: updatedInvoice.updatedAt.toISOString(),
      },
      message: 'Invoice updated successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Delete/void invoice
 * DELETE /api/invoices/:id
 */
invoices.delete('/:id', zValidator('param', invoiceIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice || invoice.voidedAt) {
      throw APIError.notFound('Invoice');
    }

    // Cannot void paid invoices (should refund instead)
    if (invoice.status === 'PAID') {
      throw APIError.badRequest('Cannot void a paid invoice. Use refund instead.');
    }

    const now = new Date();

    // Void the invoice (soft delete)
    await prisma.invoice.update({
      where: { id },
      data: {
        voidedAt: now,
        voidedBy: user.uid,
        status: 'CANCELLED',
        cancelledAt: now,
        updatedAt: now,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'DELETE',
      resourceType: 'invoice',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      success: true,
      message: 'Invoice voided successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Send invoice to patient
 * POST /api/invoices/:id/send
 */
invoices.post('/:id/send', zValidator('param', invoiceIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  let data: { email?: string; message?: string } = {};
  try {
    const body = await c.req.json();
    if (body) data = body;
  } catch {
    // Empty body is fine
  }
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice || invoice.voidedAt) {
      throw APIError.notFound('Invoice');
    }

    // Cannot send cancelled or refunded invoices
    if (invoice.status === 'CANCELLED' || invoice.status === 'REFUNDED') {
      throw APIError.badRequest(`Cannot send invoice with status '${formatInvoiceStatus(invoice.status)}'`);
    }

    // Get patient email
    let email = data.email;
    if (!email) {
      const patient = await prisma.patient.findUnique({
        where: { id: invoice.patientId },
        select: { email: true },
      });
      email = patient?.email || undefined;
    }

    if (!email) {
      throw APIError.badRequest('No email address provided and patient has no email on file');
    }

    const now = new Date();

    // Build update data
    const updateData: Prisma.InvoiceUpdateInput = {
      sentAt: now,
      updatedAt: now,
    };

    // Update status if currently draft
    if (invoice.status === 'DRAFT') {
      updateData.status = 'SENT';
    }

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'invoice',
      resourceId: id,
      ipAddress,
      metadata: { action: 'send', email },
    });

    return c.json({
      success: true,
      message: `Invoice sent to ${email}`,
      sentAt: updatedInvoice.sentAt?.toISOString(),
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Generate PDF receipt
 * GET /api/invoices/:id/pdf
 */
invoices.get('/:id/pdf', zValidator('param', invoiceIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: {
        id: true,
        invoiceNumber: true,
        patientName: true,
        total: true,
        status: true,
        voidedAt: true,
      },
    });

    if (!invoice || invoice.voidedAt) {
      throw APIError.notFound('Invoice');
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'invoice_pdf',
      resourceId: id,
      ipAddress,
    });

    // Mock PDF generation (in production, this would generate actual PDF)
    // Return mock PDF URL
    return c.json({
      pdfUrl: `https://api.example.com/invoices/${id}/invoice-${invoice.invoiceNumber}.pdf`,
      generatedAt: new Date().toISOString(),
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        patientName: invoice.patientName,
        total: invoice.total,
        status: formatInvoiceStatus(invoice.status),
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Add line item to invoice
 * POST /api/invoices/:id/line-items
 */
invoices.post('/:id/line-items', zValidator('param', invoiceIdSchema), zValidator('json', createLineItemSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { InvoiceLineItem: true },
    });

    if (!invoice || invoice.voidedAt) {
      throw APIError.notFound('Invoice');
    }

    if (!canEditInvoice(invoice.status)) {
      throw APIError.badRequest(`Cannot edit invoice with status '${formatInvoiceStatus(invoice.status)}'`);
    }

    const lineItemId = generateLineItemId();
    const totals = calculateLineItemTotals({
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      discountType: data.discountType,
      discountValue: data.discountValue,
      taxRate: data.taxRate,
    });

    // Create line item and update invoice totals in a transaction
    const result = await transactionWithErrorHandling(async (tx) => {
      // Create the line item
      const newLineItem = await tx.invoiceLineItem.create({
        data: {
          id: lineItemId,
          invoiceId: id,
          type: parseLineItemType(data.type),
          itemId: data.itemId,
          name: data.name,
          description: data.description,
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          unitType: data.unitType ? data.unitType.toUpperCase() as UnitType : undefined,
          lotNumber: data.lotNumber,
          discountType: data.discountType ? data.discountType.toUpperCase() as DiscountType : undefined,
          discountValue: data.discountValue,
          discountAmount: totals.discountAmount,
          taxRate: data.taxRate,
          taxAmount: totals.taxAmount,
          lineTotal: totals.lineTotal,
          providerId: data.providerId,
        },
      });

      // Fetch all line items to recalculate totals
      const allLineItems = await tx.invoiceLineItem.findMany({
        where: { invoiceId: id },
      });

      // Recalculate invoice totals
      const invoiceTotals = calculateInvoiceTotals(allLineItems, invoice.amountPaid);

      // Calculate new status
      const newStatus = calculateInvoiceStatus(
        invoiceTotals.balance,
        invoiceTotals.total,
        invoice.amountPaid,
        invoice.dueDate,
        invoice.status
      );

      // Update invoice with new totals
      const updatedInvoice = await tx.invoice.update({
        where: { id },
        data: {
          subtotal: invoiceTotals.subtotal,
          taxTotal: invoiceTotals.taxTotal,
          discountTotal: invoiceTotals.discountTotal,
          total: invoiceTotals.total,
          balance: invoiceTotals.balance,
          status: newStatus,
          updatedAt: new Date(),
        },
      });

      return { newLineItem, updatedInvoice };
    }, { timeout: 30000 });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'invoice_line_item',
      resourceId: lineItemId,
      ipAddress,
      metadata: { invoiceId: id, itemName: data.name },
    });

    return c.json({
      lineItem: {
        id: result.newLineItem.id,
        type: formatLineItemType(result.newLineItem.type),
        itemId: result.newLineItem.itemId,
        name: result.newLineItem.name,
        description: result.newLineItem.description,
        quantity: result.newLineItem.quantity,
        unitPrice: result.newLineItem.unitPrice,
        unitType: result.newLineItem.unitType?.toLowerCase(),
        lotNumber: result.newLineItem.lotNumber,
        discountType: result.newLineItem.discountType?.toLowerCase(),
        discountValue: result.newLineItem.discountValue,
        discountAmount: result.newLineItem.discountAmount,
        taxRate: result.newLineItem.taxRate,
        taxAmount: result.newLineItem.taxAmount,
        lineTotal: result.newLineItem.lineTotal,
        providerId: result.newLineItem.providerId,
      },
      invoice: {
        id: result.updatedInvoice.id,
        subtotal: result.updatedInvoice.subtotal,
        taxTotal: result.updatedInvoice.taxTotal,
        discountTotal: result.updatedInvoice.discountTotal,
        total: result.updatedInvoice.total,
        balance: result.updatedInvoice.balance,
      },
      message: 'Line item added successfully',
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Update line item
 * PUT /api/invoices/:id/line-items/:itemId
 */
invoices.put('/:id/line-items/:itemId', zValidator('param', lineItemIdSchema), zValidator('json', createLineItemSchema.partial()), async (c) => {
  const { id, itemId } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { InvoiceLineItem: true },
    });

    if (!invoice || invoice.voidedAt) {
      throw APIError.notFound('Invoice');
    }

    if (!canEditInvoice(invoice.status)) {
      throw APIError.badRequest(`Cannot edit invoice with status '${formatInvoiceStatus(invoice.status)}'`);
    }

    const lineItem = invoice.InvoiceLineItem.find(item => item.id === itemId);

    if (!lineItem) {
      throw APIError.notFound('Line item');
    }

    // Build update data
    const updateData: Prisma.InvoiceLineItemUpdateInput = {};

    if (data.type !== undefined) updateData.type = parseLineItemType(data.type);
    if (data.itemId !== undefined) updateData.itemId = data.itemId;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.unitPrice !== undefined) updateData.unitPrice = data.unitPrice;
    if (data.unitType !== undefined) updateData.unitType = data.unitType.toUpperCase() as UnitType;
    if (data.lotNumber !== undefined) updateData.lotNumber = data.lotNumber;
    if (data.discountType !== undefined) updateData.discountType = data.discountType.toUpperCase() as DiscountType;
    if (data.discountValue !== undefined) updateData.discountValue = data.discountValue;
    if (data.taxRate !== undefined) updateData.taxRate = data.taxRate;
    if (data.providerId !== undefined) updateData.providerId = data.providerId;

    // Recalculate line item totals if needed
    const updatedItem = { ...lineItem, ...updateData };
    const totals = calculateLineItemTotals({
      quantity: updatedItem.quantity as number,
      unitPrice: updatedItem.unitPrice as number,
      discountType: updatedItem.discountType as any,
      discountValue: updatedItem.discountValue as number | undefined,
      taxRate: updatedItem.taxRate as number,
    });

    updateData.discountAmount = totals.discountAmount;
    updateData.taxAmount = totals.taxAmount;
    updateData.lineTotal = totals.lineTotal;

    // Update line item and recalculate invoice totals in transaction
    const result = await transactionWithErrorHandling(async (tx) => {
      // Update the line item
      const updated = await tx.invoiceLineItem.update({
        where: { id: itemId },
        data: updateData,
      });

      // Fetch all line items to recalculate totals
      const allLineItems = await tx.invoiceLineItem.findMany({
        where: { invoiceId: id },
      });

      // Recalculate invoice totals
      const invoiceTotals = calculateInvoiceTotals(allLineItems, invoice.amountPaid);

      // Calculate new status
      const newStatus = calculateInvoiceStatus(
        invoiceTotals.balance,
        invoiceTotals.total,
        invoice.amountPaid,
        invoice.dueDate,
        invoice.status
      );

      // Update invoice with new totals
      const updatedInvoice = await tx.invoice.update({
        where: { id },
        data: {
          subtotal: invoiceTotals.subtotal,
          taxTotal: invoiceTotals.taxTotal,
          discountTotal: invoiceTotals.discountTotal,
          total: invoiceTotals.total,
          balance: invoiceTotals.balance,
          status: newStatus,
          updatedAt: new Date(),
        },
      });

      return { updated, updatedInvoice };
    }, { timeout: 30000 });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'invoice_line_item',
      resourceId: itemId,
      ipAddress,
      metadata: { invoiceId: id, updatedFields: Object.keys(data) },
    });

    return c.json({
      lineItem: {
        id: result.updated.id,
        type: formatLineItemType(result.updated.type),
        itemId: result.updated.itemId,
        name: result.updated.name,
        description: result.updated.description,
        quantity: result.updated.quantity,
        unitPrice: result.updated.unitPrice,
        unitType: result.updated.unitType?.toLowerCase(),
        lotNumber: result.updated.lotNumber,
        discountType: result.updated.discountType?.toLowerCase(),
        discountValue: result.updated.discountValue,
        discountAmount: result.updated.discountAmount,
        taxRate: result.updated.taxRate,
        taxAmount: result.updated.taxAmount,
        lineTotal: result.updated.lineTotal,
        providerId: result.updated.providerId,
      },
      invoice: {
        id: result.updatedInvoice.id,
        subtotal: result.updatedInvoice.subtotal,
        taxTotal: result.updatedInvoice.taxTotal,
        discountTotal: result.updatedInvoice.discountTotal,
        total: result.updatedInvoice.total,
        balance: result.updatedInvoice.balance,
      },
      message: 'Line item updated successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Remove line item
 * DELETE /api/invoices/:id/line-items/:itemId
 */
invoices.delete('/:id/line-items/:itemId', zValidator('param', lineItemIdSchema), async (c) => {
  const { id, itemId } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { InvoiceLineItem: true },
    });

    if (!invoice || invoice.voidedAt) {
      throw APIError.notFound('Invoice');
    }

    if (!canEditInvoice(invoice.status)) {
      throw APIError.badRequest(`Cannot edit invoice with status '${formatInvoiceStatus(invoice.status)}'`);
    }

    const lineItem = invoice.InvoiceLineItem.find(item => item.id === itemId);

    if (!lineItem) {
      throw APIError.notFound('Line item');
    }

    // Delete line item and recalculate invoice totals in transaction
    const result = await transactionWithErrorHandling(async (tx) => {
      // Delete the line item
      await tx.invoiceLineItem.delete({
        where: { id: itemId },
      });

      // Fetch remaining line items to recalculate totals
      const remainingLineItems = await tx.invoiceLineItem.findMany({
        where: { invoiceId: id },
      });

      // Recalculate invoice totals
      const invoiceTotals = calculateInvoiceTotals(remainingLineItems, invoice.amountPaid);

      // Calculate new status
      const newStatus = calculateInvoiceStatus(
        invoiceTotals.balance,
        invoiceTotals.total,
        invoice.amountPaid,
        invoice.dueDate,
        invoice.status
      );

      // Update invoice with new totals
      const updatedInvoice = await tx.invoice.update({
        where: { id },
        data: {
          subtotal: invoiceTotals.subtotal,
          taxTotal: invoiceTotals.taxTotal,
          discountTotal: invoiceTotals.discountTotal,
          total: invoiceTotals.total,
          balance: invoiceTotals.balance,
          status: newStatus,
          updatedAt: new Date(),
        },
      });

      return updatedInvoice;
    }, { timeout: 30000 });

    await logAuditEvent({
      userId: user.uid,
      action: 'DELETE',
      resourceType: 'invoice_line_item',
      resourceId: itemId,
      ipAddress,
      metadata: { invoiceId: id },
    });

    return c.json({
      success: true,
      invoice: {
        id: result.id,
        subtotal: result.subtotal,
        taxTotal: result.taxTotal,
        discountTotal: result.discountTotal,
        total: result.total,
        balance: result.balance,
      },
      message: 'Line item removed successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

// ===================
// Export Functions (for testing)
// ===================

/**
 * Clear all invoice data from database (for testing only)
 */
export async function clearInvoiceData() {
  await prisma.$transaction([
    prisma.invoiceLineItem.deleteMany({}),
    prisma.invoice.deleteMany({}),
  ]);
}

/**
 * Get Prisma client instance (for testing)
 */
export function getPrismaClient() {
  return prisma;
}

export default invoices;

// ===================
// Patient Invoices Routes (nested under /patients/:patientId/invoices)
// ===================

export const patientInvoices = new Hono();

patientInvoices.use('/*', sessionAuthMiddleware);

/**
 * Get invoices for a specific patient
 * GET /api/patients/:patientId/invoices
 */
patientInvoices.get('/:patientId/invoices', zValidator('param', patientIdSchema), async (c) => {
  const { patientId } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true },
    });

    if (!patient) {
      throw APIError.notFound('Patient');
    }

    // Fetch patient invoices
    const patientInvoicesList = await prisma.invoice.findMany({
      where: {
        patientId,
        voidedAt: null,
      },
      include: {
        InvoiceLineItem: true,
      },
      orderBy: {
        invoiceDate: 'desc',
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'patient_invoices',
      resourceId: patientId,
      ipAddress,
    });

    return c.json({
      items: patientInvoicesList.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate.toISOString(),
        dueDate: inv.dueDate.toISOString(),
        total: inv.total,
        amountPaid: inv.amountPaid,
        balance: inv.balance,
        status: formatInvoiceStatus(inv.status),
        lineItemCount: inv.InvoiceLineItem.length,
      })),
      total: patientInvoicesList.length,
      summary: {
        totalInvoices: patientInvoicesList.length,
        totalAmount: patientInvoicesList.reduce((sum, inv) => sum + inv.total, 0),
        totalPaid: patientInvoicesList.reduce((sum, inv) => sum + inv.amountPaid, 0),
        totalOutstanding: patientInvoicesList.reduce((sum, inv) => sum + inv.balance, 0),
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
});
