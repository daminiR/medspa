/**
 * Payments API Routes - Prisma Version
 *
 * Full CRUD operations for payment management with:
 * - Payment processing (cash, card, check, gift card, financing)
 * - Refund processing
 * - Payment history per invoice/patient
 * - Card validation (mock Stripe)
 * - PCI compliance audit logging
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sessionAuthMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { handlePrismaError, transactionWithErrorHandling } from '../middleware/prisma-error-handler';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { PaymentMethod, PaymentStatus, RefundStatus, Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';

const payments = new Hono();

// ===================
// Validation Schemas
// ===================

// Payment method enum
const paymentMethodSchema = z.enum([
  'cash',
  'credit_card',
  'debit_card',
  'check',
  'gift_card',
  'package_credit',
  'financing',
  'other',
]);

// Payment status enum
const paymentStatusSchema = z.enum([
  'pending',
  'completed',
  'failed',
  'refunded',
  'partially_refunded',
]);

// Card brand enum
const cardBrandSchema = z.enum(['visa', 'mastercard', 'amex', 'discover', 'other']);

// Financing provider enum
const financingProviderSchema = z.enum(['carecredit', 'cherry', 'affirm', 'other']);

// Card details schema
const cardDetailsSchema = z.object({
  last4: z.string().regex(/^\d{4}$/, 'Card last 4 digits must be exactly 4 digits'),
  brand: cardBrandSchema,
  expiryMonth: z.number().int().min(1).max(12),
  expiryYear: z.number().int().min(2000).max(2050),
});

// Check details schema
const checkDetailsSchema = z.object({
  checkNumber: z.string().min(1).max(50),
  bankName: z.string().max(100).optional(),
});

// Gift card details schema
const giftCardDetailsSchema = z.object({
  giftCardId: z.string().min(1),
  giftCardCode: z.string().min(1).max(50),
});

// Financing details schema
const financingDetailsSchema = z.object({
  provider: financingProviderSchema,
  applicationId: z.string().max(100).optional(),
  approvalCode: z.string().max(100).optional(),
});

// Create payment schema
const createPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  patientId: z.string().min(1),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('USD'),
  method: paymentMethodSchema,
  cardDetails: cardDetailsSchema.optional(),
  checkDetails: checkDetailsSchema.optional(),
  giftCardDetails: giftCardDetailsSchema.optional(),
  financingDetails: financingDetailsSchema.optional(),
  reference: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => {
    // Validate that appropriate details are provided for the method
    if ((data.method === 'credit_card' || data.method === 'debit_card') && !data.cardDetails) {
      return false;
    }
    if (data.method === 'check' && !data.checkDetails) {
      return false;
    }
    if (data.method === 'gift_card' && !data.giftCardDetails) {
      return false;
    }
    if (data.method === 'financing' && !data.financingDetails) {
      return false;
    }
    return true;
  },
  {
    message: 'Payment details required for the selected payment method',
  }
);

// Refund schema
const refundSchema = z.object({
  amount: z.number().positive('Refund amount must be positive'),
  reason: z.string().min(1).max(500),
});

// List payments query schema
const listPaymentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  invoiceId: z.string().min(1).optional(),
  patientId: z.string().min(1).optional(),
  method: paymentMethodSchema.optional(),
  status: paymentStatusSchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['processedAt', 'amount', 'createdAt']).default('processedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Payment ID param schema
const paymentIdSchema = z.object({
  id: z.string().min(1),
});

// Invoice ID param schema
const invoiceIdSchema = z.object({
  invoiceId: z.string().min(1),
});

// Patient ID param schema
const patientIdSchema = z.object({
  patientId: z.string().min(1),
});

// Card validation schema
const validateCardSchema = z.object({
  cardNumber: z.string().regex(/^\d{13,19}$/, 'Invalid card number format'),
  expiryMonth: z.number().int().min(1).max(12),
  expiryYear: z.number().int().min(2000).max(2050),
  cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV format'),
  billingZip: z.string().regex(/^\d{5}(-\d{4})?$/).optional(),
});

// ===================
// Helper Functions
// ===================

function generateTransactionId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

// Map string method to Prisma enum
function mapPaymentMethod(method: string): PaymentMethod {
  const mapping: Record<string, PaymentMethod> = {
    cash: PaymentMethod.CASH,
    credit_card: PaymentMethod.CREDIT_CARD,
    debit_card: PaymentMethod.DEBIT_CARD,
    check: PaymentMethod.CHECK,
    gift_card: PaymentMethod.GIFT_CARD,
    package_credit: PaymentMethod.PACKAGE_CREDIT,
    financing: PaymentMethod.FINANCING,
    other: PaymentMethod.OTHER,
  };
  return mapping[method] || PaymentMethod.OTHER;
}

// Map string status to Prisma enum
function mapPaymentStatus(status: string): PaymentStatus {
  const mapping: Record<string, PaymentStatus> = {
    pending: PaymentStatus.PENDING,
    completed: PaymentStatus.COMPLETED,
    failed: PaymentStatus.FAILED,
    refunded: PaymentStatus.REFUNDED,
    partially_refunded: PaymentStatus.PARTIALLY_REFUNDED,
  };
  return mapping[status] || PaymentStatus.PENDING;
}

// Mock card processing (simulates Stripe-like responses)
function processCardPayment(
  cardDetails: { last4: string; brand: string; expiryMonth: number; expiryYear: number },
  amount: number
): { success: boolean; transactionId?: string; errorCode?: string; message?: string } {
  // Simulate various card outcomes based on last4
  if (cardDetails.last4 === '0000') {
    return { success: false, errorCode: 'card_declined', message: 'Your card was declined.' };
  }
  if (cardDetails.last4 === '9999') {
    return { success: false, errorCode: 'insufficient_funds', message: 'Insufficient funds.' };
  }
  if (cardDetails.last4 === '8888') {
    return { success: false, errorCode: 'expired_card', message: 'Your card has expired.' };
  }
  if (cardDetails.last4 === '7777') {
    return { success: false, errorCode: 'processing_error', message: 'An error occurred while processing your card.' };
  }

  // Check if card is expired
  const now = new Date();
  const expiryDate = new Date(cardDetails.expiryYear, cardDetails.expiryMonth - 1);
  if (expiryDate < now) {
    return { success: false, errorCode: 'expired_card', message: 'Your card has expired.' };
  }

  // Simulate successful payment
  return {
    success: true,
    transactionId: generateTransactionId(),
  };
}

// Mock refund processing
function processRefund(
  originalTransactionId: string | undefined,
  amount: number
): { success: boolean; transactionId?: string; errorCode?: string; message?: string } {
  // Simulate refund failures for certain conditions
  if (amount > 10000) {
    return { success: false, errorCode: 'refund_limit_exceeded', message: 'Refund amount exceeds limit.' };
  }

  return {
    success: true,
    transactionId: generateTransactionId(),
  };
}

// Card validation (mock Stripe card validation)
function validateCard(
  cardNumber: string,
  expiryMonth: number,
  expiryYear: number,
  cvv: string
): { valid: boolean; brand: string; last4: string; errorCode?: string; message?: string } {
  // Get last 4 digits
  const last4 = cardNumber.slice(-4);

  // Determine card brand based on first digits
  let brand = 'other';
  if (cardNumber.startsWith('4')) {
    brand = 'visa';
  } else if (cardNumber.startsWith('5') || cardNumber.startsWith('2')) {
    brand = 'mastercard';
  } else if (cardNumber.startsWith('34') || cardNumber.startsWith('37')) {
    brand = 'amex';
  } else if (cardNumber.startsWith('6')) {
    brand = 'discover';
  }

  // Luhn algorithm check (simplified mock)
  if (cardNumber === '4111111111111111' || cardNumber === '5555555555554444' || cardNumber === '378282246310005') {
    // These are test card numbers
    return { valid: true, brand, last4 };
  }

  // Check for obviously invalid patterns
  if (cardNumber.length < 13 || cardNumber.length > 19) {
    return { valid: false, brand, last4, errorCode: 'invalid_number', message: 'Invalid card number length.' };
  }

  // Check if card is expired
  const now = new Date();
  const expiryDate = new Date(expiryYear, expiryMonth - 1);
  if (expiryDate < now) {
    return { valid: false, brand, last4, errorCode: 'expired_card', message: 'Card has expired.' };
  }

  // Default to valid for other cards
  return { valid: true, brand, last4 };
}

// Available payment methods
function getAvailablePaymentMethods(): Array<{ method: string; name: string; enabled: boolean }> {
  return [
    { method: 'cash', name: 'Cash', enabled: true },
    { method: 'credit_card', name: 'Credit Card', enabled: true },
    { method: 'debit_card', name: 'Debit Card', enabled: true },
    { method: 'check', name: 'Check', enabled: true },
    { method: 'gift_card', name: 'Gift Card', enabled: true },
    { method: 'package_credit', name: 'Package Credit', enabled: true },
    { method: 'financing', name: 'Financing (CareCredit, Cherry, Affirm)', enabled: true },
    { method: 'other', name: 'Other', enabled: true },
  ];
}

// ===================
// Middleware
// ===================

// All payment routes require session authentication
payments.use('/*', sessionAuthMiddleware);

// ===================
// Routes
// ===================

/**
 * List payments (paginated, filterable)
 * GET /api/payments
 */
payments.get('/', zValidator('query', listPaymentsSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Build where clause
  const where: Prisma.PaymentWhereInput = {};

  if (query.invoiceId) {
    where.invoiceId = query.invoiceId;
  }
  if (query.patientId) {
    where.patientId = query.patientId;
  }
  if (query.method) {
    where.method = mapPaymentMethod(query.method);
  }
  if (query.status) {
    where.status = mapPaymentStatus(query.status);
  }
  if (query.dateFrom || query.dateTo) {
    where.processedAt = {};
    if (query.dateFrom) {
      where.processedAt.gte = new Date(query.dateFrom);
    }
    if (query.dateTo) {
      where.processedAt.lte = new Date(query.dateTo);
    }
  }

  // Get total count and items
  const [total, items] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      orderBy: { [query.sortBy]: query.sortOrder },
      include: {
        Refund: true,
      },
    }),
  ]);

  // Log audit event
  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'payment_list',
    ipAddress,
    metadata: { query, resultCount: items.length },
  });

  return c.json({
    items: items.map(p => ({
      id: p.id,
      invoiceId: p.invoiceId,
      patientId: p.patientId,
      amount: p.amount,
      currency: p.currency,
      method: p.method.toLowerCase(),
      cardDetails: p.cardDetails as any,
      checkDetails: p.checkDetails as any,
      giftCardDetails: p.giftCardDetails as any,
      financingDetails: p.financingDetails as any,
      transactionId: p.transactionId,
      reference: p.reference,
      status: p.status.toLowerCase(),
      refundedAmount: p.refundedAmount,
      processedAt: p.processedAt.toISOString(),
      processedBy: p.processedBy,
      notes: p.notes,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
    total,
    page: query.page,
    limit: query.limit,
    hasMore: (query.page - 1) * query.limit + query.limit < total,
  });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get available payment methods
 * GET /api/payments/methods
 */
payments.get('/methods', async (c) => {
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'payment_methods',
    ipAddress,
  });

  return c.json({
    methods: getAvailablePaymentMethods(),
  });
});

/**
 * Validate card (mock Stripe validation)
 * POST /api/payments/validate-card
 */
payments.post('/validate-card', zValidator('json', validateCardSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const result = validateCard(data.cardNumber, data.expiryMonth, data.expiryYear, data.cvv);

  // Log audit event (PCI compliance - never log full card number)
  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'card_validation',
    ipAddress,
    metadata: {
      last4: result.last4,
      brand: result.brand,
      valid: result.valid,
    },
  });

  if (!result.valid) {
    return c.json({
      valid: false,
      errorCode: result.errorCode,
      message: result.message,
    }, 400);
  }

  return c.json({
    valid: true,
    brand: result.brand,
    last4: result.last4,
  });
});

/**
 * Create/process payment
 * POST /api/payments
 */
payments.post('/', zValidator('json', createPaymentSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Use transaction for financial operations
    const result = await transactionWithErrorHandling(async (tx) => {
    // Check if invoice exists
    const invoice = await tx.invoice.findUnique({
      where: { id: data.invoiceId },
    });

    if (!invoice) {
      throw APIError.notFound('Invoice');
    }

    // Check if patient matches
    if (invoice.patientId !== data.patientId) {
      throw APIError.badRequest('Patient does not match invoice');
    }

    // Check if amount is valid
    if (data.amount > invoice.balance) {
      throw APIError.badRequest(`Amount exceeds invoice balance. Maximum payable: ${invoice.balance}`);
    }

    // Check invoice status
    if (invoice.status === 'PAID') {
      throw APIError.badRequest('Invoice is already paid');
    }
    if (invoice.status === 'CANCELLED') {
      throw APIError.badRequest('Cannot pay cancelled invoice');
    }

    const now = new Date();
    let transactionId: string | undefined;
    let status: PaymentStatus = PaymentStatus.PENDING;

    // Process payment based on method
    if (data.method === 'credit_card' || data.method === 'debit_card') {
      const cardResult = processCardPayment(data.cardDetails as { last4: string; brand: string; expiryMonth: number; expiryYear: number }, data.amount);
      if (!cardResult.success) {
        // Log failed payment attempt
        await logAuditEvent({
          userId: user.uid,
          action: 'CREATE',
          resourceType: 'payment_failed',
          resourceId: 'attempt',
          ipAddress,
          metadata: {
            invoiceId: data.invoiceId,
            amount: data.amount,
            method: data.method,
            errorCode: cardResult.errorCode,
          },
        });
        throw APIError.badRequest(cardResult.message || 'Payment failed');
      }
      transactionId = cardResult.transactionId;
      status = PaymentStatus.COMPLETED;
    } else if (data.method === 'gift_card') {
      // Validate gift card
      const giftCard = await tx.giftCard.findUnique({
        where: { id: data.giftCardDetails!.giftCardId },
      });

      if (!giftCard) {
        throw APIError.notFound('Gift Card');
      }
      if (giftCard.code !== data.giftCardDetails!.giftCardCode) {
        throw APIError.badRequest('Invalid gift card code');
      }
      if (giftCard.status !== 'ACTIVE' && giftCard.status !== 'PARTIALLY_USED') {
        throw APIError.badRequest(`Gift card is ${giftCard.status.toLowerCase()}`);
      }
      if (giftCard.currentBalance < data.amount) {
        throw APIError.badRequest(`Insufficient gift card balance. Available: ${giftCard.currentBalance}`);
      }

      // Deduct from gift card balance (handled separately in gift card transaction)
      transactionId = generateTransactionId();
      status = PaymentStatus.COMPLETED;
    } else {
      // Cash, check, financing, package credit, other - mark as completed immediately
      transactionId = data.method !== 'cash' ? generateTransactionId() : undefined;
      status = PaymentStatus.COMPLETED;
    }

    // Create payment record
    const payment = await tx.payment.create({
      data: {
        id: randomUUID(),
        invoiceId: data.invoiceId,
        patientId: data.patientId,
        amount: data.amount,
        currency: data.currency || 'USD',
        method: mapPaymentMethod(data.method),
        cardDetails: data.cardDetails as any,
        checkDetails: data.checkDetails as any,
        giftCardDetails: data.giftCardDetails as any,
        financingDetails: data.financingDetails as any,
        transactionId,
        reference: data.reference,
        status,
        refundedAmount: 0,
        processedAt: now,
        processedBy: user.uid,
        notes: data.notes,
        updatedAt: now,
      },
      include: {
        Refund: true,
      },
    });

    // Update invoice balance
    const newBalance = invoice.balance - data.amount;
    const newStatus = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        balance: newBalance,
        amountPaid: { increment: data.amount },
        status: newStatus as any,
        paidAt: newStatus === 'PAID' ? now : invoice.paidAt,
      },
    });

      return { payment, invoiceBalance: newBalance };
    }, { timeout: 30000 });

    // Log audit event (PCI compliance)
  await logAuditEvent({
    userId: user.uid,
    action: 'CREATE',
    resourceType: 'payment',
    resourceId: result.payment.id,
    ipAddress,
    metadata: {
      invoiceId: data.invoiceId,
      amount: data.amount,
      method: data.method,
      transactionId: result.payment.transactionId,
    },
  });

  return c.json({
    payment: {
      id: result.payment.id,
      invoiceId: result.payment.invoiceId,
      patientId: result.payment.patientId,
      amount: result.payment.amount,
      currency: result.payment.currency,
      method: result.payment.method.toLowerCase(),
      cardDetails: result.payment.cardDetails,
      checkDetails: result.payment.checkDetails,
      giftCardDetails: result.payment.giftCardDetails,
      financingDetails: result.payment.financingDetails,
      transactionId: result.payment.transactionId,
      reference: result.payment.reference,
      status: result.payment.status.toLowerCase(),
      refundedAmount: result.payment.refundedAmount,
      processedAt: result.payment.processedAt.toISOString(),
      processedBy: result.payment.processedBy,
      notes: result.payment.notes,
      createdAt: result.payment.createdAt.toISOString(),
      updatedAt: result.payment.updatedAt.toISOString(),
    },
    invoiceBalance: result.invoiceBalance,
    message: 'Payment processed successfully',
  }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get single payment by ID
 * GET /api/payments/:id
 */
payments.get('/:id', zValidator('param', paymentIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      Refund: true,
    },
  });

  if (!payment) {
    throw APIError.notFound('Payment');
  }

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'payment',
    resourceId: id,
    ipAddress,
  });

  return c.json({
    payment: {
      id: payment.id,
      invoiceId: payment.invoiceId,
      patientId: payment.patientId,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method.toLowerCase(),
      cardDetails: payment.cardDetails,
      checkDetails: payment.checkDetails,
      giftCardDetails: payment.giftCardDetails,
      financingDetails: payment.financingDetails,
      transactionId: payment.transactionId,
      reference: payment.reference,
      status: payment.status.toLowerCase(),
      refundedAmount: payment.refundedAmount,
      refunds: payment.Refund.map((r) => ({
        id: r.id,
        amount: r.amount,
        reason: r.reason,
        status: r.status.toLowerCase(),
        processedAt: r.processedAt?.toISOString(),
        processedBy: r.processedBy,
        transactionId: r.transactionId,
        createdAt: r.createdAt.toISOString(),
      })),
      processedAt: payment.processedAt.toISOString(),
      processedBy: payment.processedBy,
      notes: payment.notes,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    },
  });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Process refund
 * POST /api/payments/:id/refund
 */
payments.post('/:id/refund', zValidator('param', paymentIdSchema), zValidator('json', refundSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const result = await transactionWithErrorHandling(async (tx) => {
      const payment = await tx.payment.findUnique({
      where: { id },
      include: { Refund: true },
    });

    if (!payment) {
      throw APIError.notFound('Payment');
    }

    // Check if payment is refundable
    if (payment.status === PaymentStatus.FAILED) {
      throw APIError.badRequest('Cannot refund failed payment');
    }
    if (payment.status === PaymentStatus.PENDING) {
      throw APIError.badRequest('Cannot refund pending payment');
    }
    if (payment.status === PaymentStatus.REFUNDED) {
      throw APIError.badRequest('Payment is already fully refunded');
    }

    // Check refund amount
    const maxRefundable = payment.amount - payment.refundedAmount;
    if (data.amount > maxRefundable) {
      throw APIError.badRequest(`Refund amount exceeds maximum refundable amount. Maximum: ${maxRefundable}`);
    }

    // Process refund
    const refundResult = processRefund(payment.transactionId ?? undefined, data.amount);
    if (!refundResult.success) {
      await logAuditEvent({
        userId: user.uid,
        action: 'CREATE',
        resourceType: 'refund_failed',
        resourceId: id,
        ipAddress,
        metadata: {
          paymentId: id,
          amount: data.amount,
          errorCode: refundResult.errorCode,
        },
      });
      throw APIError.badRequest(refundResult.message || 'Refund failed');
    }

    const now = new Date();

    // Create refund record
    const refund = await tx.refund.create({
      data: {
        id: randomUUID(),
        paymentId: id,
        amount: data.amount,
        reason: data.reason,
        status: RefundStatus.COMPLETED,
        processedAt: now,
        processedBy: user.uid,
        transactionId: refundResult.transactionId,
      },
    });

    // Update payment
    const newRefundedAmount = payment.refundedAmount + data.amount;
    const newStatus = newRefundedAmount >= payment.amount ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;

    const updatedPayment = await tx.payment.update({
      where: { id },
      data: {
        refundedAmount: newRefundedAmount,
        status: newStatus,
      },
    });

    // Update invoice balance
    const invoice = await tx.invoice.findUnique({
      where: { id: payment.invoiceId },
    });

    if (invoice) {
      const newBalance = invoice.balance + data.amount;
      const newInvoiceStatus = newBalance >= invoice.total ? 'SENT' : 'PARTIALLY_PAID';

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          balance: newBalance,
          amountPaid: { decrement: data.amount },
          status: newInvoiceStatus as any,
        },
      });

      return { refund, payment: updatedPayment, invoiceBalance: newBalance };
    }

      return { refund, payment: updatedPayment, invoiceBalance: undefined };
    }, { timeout: 30000 });

    // Log audit event (PCI compliance)
  await logAuditEvent({
    userId: user.uid,
    action: 'CREATE',
    resourceType: 'refund',
    resourceId: result.refund.id,
    ipAddress,
    metadata: {
      paymentId: id,
      amount: data.amount,
      reason: data.reason,
      transactionId: result.refund.transactionId,
    },
  });

  return c.json({
    refund: {
      id: result.refund.id,
      paymentId: result.refund.paymentId,
      amount: result.refund.amount,
      reason: result.refund.reason,
      status: result.refund.status.toLowerCase(),
      processedAt: result.refund.processedAt?.toISOString(),
      processedBy: result.refund.processedBy,
      transactionId: result.refund.transactionId,
      createdAt: result.refund.createdAt.toISOString(),
    },
    paymentStatus: result.payment.status.toLowerCase(),
    paymentRefundedAmount: result.payment.refundedAmount,
    invoiceBalance: result.invoiceBalance,
    message: 'Refund processed successfully',
  }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * List payments for invoice
 * GET /api/invoices/:invoiceId/payments
 */
payments.get('/invoice/:invoiceId', zValidator('param', invoiceIdSchema), async (c) => {
  const { invoiceId } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    throw APIError.notFound('Invoice');
  }

  const invoicePayments = await prisma.payment.findMany({
    where: { invoiceId },
    orderBy: { processedAt: 'desc' },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'invoice_payments',
    resourceId: invoiceId,
    ipAddress,
  });

  return c.json({
    items: invoicePayments.map(p => ({
      id: p.id,
      invoiceId: p.invoiceId,
      patientId: p.patientId,
      amount: p.amount,
      currency: p.currency,
      method: p.method.toLowerCase(),
      cardDetails: p.cardDetails,
      status: p.status.toLowerCase(),
      refundedAmount: p.refundedAmount,
      processedAt: p.processedAt.toISOString(),
      processedBy: p.processedBy,
      createdAt: p.createdAt.toISOString(),
    })),
    total: invoicePayments.length,
    invoiceTotal: invoice.total,
    invoiceBalance: invoice.balance,
  });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * List payments for patient
 * GET /api/patients/:patientId/payments
 */
payments.get('/patient/:patientId', zValidator('param', patientIdSchema), async (c) => {
  const { patientId } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const patientPayments = await prisma.payment.findMany({
    where: { patientId },
    orderBy: { processedAt: 'desc' },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'patient_payments',
    resourceId: patientId,
    ipAddress,
  });

  const totalAmount = patientPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = patientPayments.reduce((sum, p) => sum + p.refundedAmount, 0);

  return c.json({
    items: patientPayments.map(p => ({
      id: p.id,
      invoiceId: p.invoiceId,
      patientId: p.patientId,
      amount: p.amount,
      currency: p.currency,
      method: p.method.toLowerCase(),
      cardDetails: p.cardDetails,
      status: p.status.toLowerCase(),
      refundedAmount: p.refundedAmount,
      processedAt: p.processedAt.toISOString(),
      processedBy: p.processedBy,
      createdAt: p.createdAt.toISOString(),
    })),
    total: patientPayments.length,
    totalAmount,
    totalRefunded,
  });
  } catch (error) {
    handlePrismaError(error);
  }
});

export default payments;
