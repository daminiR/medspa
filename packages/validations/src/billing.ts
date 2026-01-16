/**
 * Billing validation schemas
 */

import { z } from 'zod';
import { uuidSchema, dateSchema, decimalMoneySchema, paginationSchema, searchQuerySchema } from './common';

// Invoice status
export const invoiceStatusSchema = z.enum([
  'draft',
  'sent',
  'viewed',
  'paid',
  'partially_paid',
  'overdue',
  'cancelled',
  'refunded',
]);

// Payment method
export const paymentMethodSchema = z.enum([
  'cash',
  'check',
  'credit_card',
  'debit_card',
  'ach',
  'gift_card',
  'package_credit',
  'membership_credit',
  'insurance',
  'financing',
  'venmo',
  'zelle',
  'other',
]);

// Payment status
export const paymentStatusSchema = z.enum([
  'pending',
  'completed',
  'failed',
  'refunded',
  'partially_refunded',
]);

// Line item type
export const lineItemTypeSchema = z.enum([
  'service',
  'product',
  'package',
  'membership',
  'unit',
  'injectable',
]);

// Invoice line item input
export const invoiceLineItemSchema = z.object({
  type: lineItemTypeSchema,
  itemId: uuidSchema.optional(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  quantity: z.coerce.number().positive().default(1),
  unitType: z.string().max(20).optional(),
  unitPrice: decimalMoneySchema,
  practitionerId: uuidSchema.optional(),

  // Injectable metadata
  injectableMetadata: z.object({
    productId: uuidSchema.optional(),
    productType: z.enum(['neurotoxin', 'filler']).optional(),
    zones: z.array(z.object({
      id: z.string(),
      name: z.string(),
      units: z.number(),
    })).optional(),
    lotNumber: z.string().optional(),
    expirationDate: z.string().optional(),
    totalUnits: z.number().optional(),
    inventoryDeduction: z.boolean().optional(),
  }).optional(),

  // Discount
  discountType: z.enum(['percentage', 'fixed']).optional(),
  discountValue: z.coerce.number().min(0).optional(),
  discountReason: z.string().max(255).optional(),

  // Tax
  taxRate: z.coerce.number().min(0).max(1).optional(),
});

// Create invoice input
export const createInvoiceSchema = z.object({
  patientId: uuidSchema,
  practitionerId: uuidSchema.optional(),
  appointmentId: uuidSchema.optional(),
  locationId: uuidSchema.optional(),
  lineItems: z.array(invoiceLineItemSchema).min(1),
  dueDate: dateSchema.optional(),
  internalNotes: z.string().max(5000).optional(),
  patientNotes: z.string().max(2000).optional(),
});

// Update invoice input
export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  status: invoiceStatusSchema.optional(),
});

// Payment input
export const createPaymentSchema = z.object({
  invoiceId: uuidSchema,
  amount: decimalMoneySchema,
  method: paymentMethodSchema,
  reference: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),

  // Card payment
  stripePaymentMethodId: z.string().optional(),

  // Check
  checkNumber: z.string().max(50).optional(),
  bankName: z.string().max(255).optional(),

  // Gift card
  giftCardCode: z.string().max(50).optional(),

  // Financing
  financingProvider: z.enum(['carecredit', 'cherry', 'other']).optional(),
  financingApplicationId: z.string().optional(),
});

// Refund input
export const createRefundSchema = z.object({
  paymentId: uuidSchema,
  amount: decimalMoneySchema,
  reason: z.string().min(1).max(500),
  refundToOriginal: z.boolean().default(true),
});

// Invoice search
export const invoiceSearchSchema = z.object({
  query: searchQuerySchema,
  patientId: uuidSchema.optional(),
  practitionerId: uuidSchema.optional(),
  status: invoiceStatusSchema.optional(),
  dateFrom: dateSchema.optional(),
  dateTo: dateSchema.optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  hasBalance: z.boolean().optional(),
  ...paginationSchema.shape,
});

// Gift card schemas
export const createGiftCardSchema = z.object({
  value: decimalMoneySchema.min(1),
  purchaserName: z.string().min(1).max(255),
  purchaserEmail: z.string().email(),
  recipientName: z.string().max(255).optional(),
  recipientEmail: z.string().email().optional(),
  recipientMessage: z.string().max(500).optional(),
  design: z.string().max(100).optional(),
  scheduledDate: dateSchema.optional(),
  expirationDate: dateSchema.optional(),
});

export const redeemGiftCardSchema = z.object({
  code: z.string().min(1).max(50),
  amount: decimalMoneySchema,
  invoiceId: uuidSchema,
});

// Package purchase
export const purchasePackageSchema = z.object({
  packageId: uuidSchema,
  patientId: uuidSchema,
  paymentMethod: paymentMethodSchema.optional(),
});

// Membership signup
export const membershipSignupSchema = z.object({
  membershipId: uuidSchema,
  patientId: uuidSchema,
  stripePaymentMethodId: z.string(),
  startDate: dateSchema.optional(),
});

// Invoice ID param
export const invoiceIdParamSchema = z.object({
  invoiceId: uuidSchema,
});

// Payment ID param
export const paymentIdParamSchema = z.object({
  paymentId: uuidSchema,
});

// Type exports
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type LineItemType = z.infer<typeof lineItemTypeSchema>;
export type InvoiceLineItemInput = z.infer<typeof invoiceLineItemSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type CreateRefundInput = z.infer<typeof createRefundSchema>;
export type InvoiceSearch = z.infer<typeof invoiceSearchSchema>;
