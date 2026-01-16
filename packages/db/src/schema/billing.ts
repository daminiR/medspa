// Billing Schema
import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb, decimal, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { timestamps, auditColumns, invoiceStatusEnum, paymentMethodEnum } from './common';
import { users } from './users';
import { patients } from './patients';
import { services } from './services';
import { appointments } from './appointments';
import { locations } from './locations';

// Invoices
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).unique().notNull(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  practitionerId: uuid('practitioner_id').references(() => users.id),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  locationId: uuid('location_id').references(() => locations.id),

  // Dates
  invoiceDate: timestamp('invoice_date', { withTimezone: true }).notNull().defaultNow(),
  dueDate: timestamp('due_date', { withTimezone: true }),
  serviceDate: timestamp('service_date', { withTimezone: true }),

  // Totals
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  taxTotal: decimal('tax_total', { precision: 10, scale: 2 }).default('0'),
  discountTotal: decimal('discount_total', { precision: 10, scale: 2 }).default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  amountPaid: decimal('amount_paid', { precision: 10, scale: 2 }).default('0'),
  balance: decimal('balance', { precision: 10, scale: 2 }).notNull(),

  // Status
  status: varchar('status', { length: 20 }).default('draft').$type<typeof invoiceStatusEnum[number]>(),

  // Notes
  internalNotes: text('internal_notes'),
  patientNotes: text('patient_notes'),

  // Related
  packageId: uuid('package_id'),
  membershipId: uuid('membership_id'),

  ...auditColumns,
});

// Invoice line items
export const invoiceLineItems = pgTable('invoice_line_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
  serviceId: uuid('service_id').references(() => services.id),
  practitionerId: uuid('practitioner_id').references(() => users.id),

  // Item details
  type: varchar('type', { length: 20 }).$type<'service' | 'product' | 'package' | 'membership' | 'unit' | 'injectable'>(),
  itemId: uuid('item_id'),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),

  // Quantity & Pricing
  quantity: decimal('quantity', { precision: 10, scale: 4 }).notNull().default('1'),
  unitType: varchar('unit_type', { length: 20 }).$type<'unit' | 'syringe' | 'vial' | 'ml' | 'cc' | 'hour'>(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),

  // Injectable metadata
  injectableMetadata: jsonb('injectable_metadata').$type<{
    productId?: string;
    productType?: 'neurotoxin' | 'filler';
    zones?: { id: string; name: string; units: number }[];
    customPoints?: { id: string; label: string; units: number }[];
    lotNumber?: string;
    expirationDate?: string;
    notes?: string;
    totalUnits?: number;
    totalVolume?: number;
    syringeCount?: number;
    inventoryDeduction?: boolean;
  }>(),

  // Discount
  discountType: varchar('discount_type', { length: 20 }),
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }),
  discountReason: varchar('discount_reason', { length: 255 }),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),

  // Tax
  taxRate: decimal('tax_rate', { precision: 5, scale: 4 }).default('0'),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0'),

  // Line total
  lineTotal: decimal('line_total', { precision: 10, scale: 2 }).notNull(),

  ...timestamps,
});

// Payments
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
  patientId: uuid('patient_id').notNull().references(() => patients.id),

  // Payment details
  date: timestamp('date', { withTimezone: true }).notNull().defaultNow(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  method: varchar('method', { length: 30 }).$type<typeof paymentMethodEnum[number]>(),

  // References
  reference: varchar('reference', { length: 255 }),
  transactionId: varchar('transaction_id', { length: 255 }),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),

  // Card details (from Stripe)
  cardDetails: jsonb('card_details').$type<{
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  }>(),

  // Check details
  checkDetails: jsonb('check_details').$type<{
    checkNumber: string;
    bankName?: string;
  }>(),

  // Gift card details
  giftCardDetails: jsonb('gift_card_details').$type<{
    giftCardId: string;
    giftCardNumber: string;
    remainingBalance: number;
  }>(),

  // Financing details
  financingDetails: jsonb('financing_details').$type<{
    provider: 'carecredit' | 'cherry' | 'other';
    applicationId: string;
    approvalCode?: string;
    term?: number;
  }>(),

  // Status
  status: varchar('status', { length: 20 }).default('completed').$type<'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded'>(),

  // Refund info
  refundedAmount: decimal('refunded_amount', { precision: 10, scale: 2 }),
  refundDate: timestamp('refund_date', { withTimezone: true }),
  refundReason: text('refund_reason'),
  stripeRefundId: varchar('stripe_refund_id', { length: 255 }),

  // Processed by
  processedBy: uuid('processed_by').references(() => users.id),
  notes: text('notes'),

  ...timestamps,
});

// Gift cards
export const giftCards = pgTable('gift_cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 50 }).unique().notNull(),

  // Value
  originalValue: decimal('original_value', { precision: 10, scale: 2 }).notNull(),
  currentBalance: decimal('current_balance', { precision: 10, scale: 2 }).notNull(),

  // Purchaser
  purchaserId: uuid('purchaser_id').references(() => patients.id),
  purchaserName: varchar('purchaser_name', { length: 255 }),
  purchaserEmail: varchar('purchaser_email', { length: 255 }),

  // Recipient
  recipientName: varchar('recipient_name', { length: 255 }),
  recipientEmail: varchar('recipient_email', { length: 255 }),
  recipientMessage: text('recipient_message'),

  // Dates
  purchaseDate: timestamp('purchase_date', { withTimezone: true }).notNull().defaultNow(),
  activationDate: timestamp('activation_date', { withTimezone: true }),
  expirationDate: timestamp('expiration_date', { withTimezone: true }),
  scheduledDate: timestamp('scheduled_date', { withTimezone: true }),

  // Status
  status: varchar('status', { length: 20 }).default('active').$type<'active' | 'depleted' | 'expired' | 'cancelled' | 'pending'>(),

  // Design
  design: varchar('design', { length: 100 }),

  ...auditColumns,
});

// Gift card transactions
export const giftCardTransactions = pgTable('gift_card_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  giftCardId: uuid('gift_card_id').notNull().references(() => giftCards.id),
  type: varchar('type', { length: 20 }).$type<'purchase' | 'redemption' | 'refund' | 'adjustment'>(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  balance: decimal('balance', { precision: 10, scale: 2 }).notNull(),
  invoiceId: uuid('invoice_id').references(() => invoices.id),
  notes: text('notes'),
  processedBy: uuid('processed_by').references(() => users.id),
  ...timestamps,
});

// Packages (prepaid service bundles)
export const packages = pgTable('packages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  imageUrl: text('image_url'),

  // Pricing
  regularPrice: decimal('regular_price', { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal('sale_price', { precision: 10, scale: 2 }).notNull(),
  savings: decimal('savings', { precision: 10, scale: 2 }),

  // Contents (service/product bundles)
  contents: jsonb('contents').$type<{
    type: 'service' | 'product';
    itemId: string;
    name: string;
    quantity: number;
    value: number;
  }[]>(),

  // Validity
  validityDays: integer('validity_days'),

  // Restrictions
  restrictions: jsonb('restrictions').$type<{
    specificPractitioners?: string[];
    specificLocations?: string[];
    blackoutDates?: string[];
    shareable: boolean;
    transferable: boolean;
  }>(),

  // Status
  isActive: boolean('is_active').default(true),
  availableForPurchase: boolean('available_for_purchase').default(true),

  ...auditColumns,
});

// Patient package purchases
export const patientPackages = pgTable('patient_packages', {
  id: uuid('id').primaryKey().defaultRandom(),
  packageId: uuid('package_id').notNull().references(() => packages.id),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  invoiceId: uuid('invoice_id').references(() => invoices.id),

  // Purchase info
  purchaseDate: timestamp('purchase_date', { withTimezone: true }).notNull().defaultNow(),
  expirationDate: timestamp('expiration_date', { withTimezone: true }),
  purchasePrice: decimal('purchase_price', { precision: 10, scale: 2 }).notNull(),

  // Remaining items
  remainingItems: jsonb('remaining_items').$type<{
    itemId: string;
    name: string;
    remaining: number;
    original: number;
  }[]>(),

  // Status
  status: varchar('status', { length: 20 }).default('active').$type<'active' | 'depleted' | 'expired' | 'cancelled'>(),

  ...timestamps,
});

// Package redemptions
export const packageRedemptions = pgTable('package_redemptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientPackageId: uuid('patient_package_id').notNull().references(() => patientPackages.id),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  invoiceId: uuid('invoice_id').references(() => invoices.id),
  itemId: uuid('item_id'),
  itemName: varchar('item_name', { length: 255 }),
  quantity: integer('quantity').default(1),
  redeemedBy: uuid('redeemed_by').references(() => users.id),
  redeemedAt: timestamp('redeemed_at', { withTimezone: true }).notNull().defaultNow(),
  notes: text('notes'),
});

// Memberships
export const memberships = pgTable('memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  tier: varchar('tier', { length: 20 }).$type<'silver' | 'gold' | 'platinum' | 'vip'>(),
  imageUrl: text('image_url'),

  // Billing
  billingCycle: varchar('billing_cycle', { length: 20 }).$type<'monthly' | 'quarterly' | 'semi-annual' | 'annual'>(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  setupFee: decimal('setup_fee', { precision: 10, scale: 2 }),

  // Benefits
  benefits: jsonb('benefits').$type<{
    discountPercentage: number;
    includedServices: {
      serviceId: string;
      serviceName: string;
      quantity: number;
      resetPeriod: 'monthly' | 'quarterly' | 'annual';
    }[];
    includedProducts: {
      productId: string;
      productName: string;
      discountPercentage: number;
    }[];
    perks: string[];
  }>(),

  // Terms
  minimumTerm: integer('minimum_term'), // months
  cancellationPolicy: text('cancellation_policy'),

  // Status
  isActive: boolean('is_active').default(true),
  acceptingNewMembers: boolean('accepting_new_members').default(true),

  ...auditColumns,
});

// Patient memberships
export const patientMemberships = pgTable('patient_memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  membershipId: uuid('membership_id').notNull().references(() => memberships.id),
  patientId: uuid('patient_id').notNull().references(() => patients.id),

  // Dates
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  nextBillingDate: timestamp('next_billing_date', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),

  // Stripe subscription
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),

  // Remaining benefits
  remainingBenefits: jsonb('remaining_benefits').$type<{
    serviceId: string;
    remaining: number;
    resetDate: string;
  }[]>(),

  // Status
  status: varchar('status', { length: 20 }).default('active').$type<'active' | 'paused' | 'cancelled' | 'expired'>(),
  cancellationReason: text('cancellation_reason'),

  ...auditColumns,
});

// Credits (patient account credits)
export const patientCredits = pgTable('patient_credits', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  type: varchar('type', { length: 20 }).$type<'refund' | 'goodwill' | 'promotion' | 'referral' | 'other'>(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  balance: decimal('balance', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  expirationDate: timestamp('expiration_date', { withTimezone: true }),
  issuedBy: uuid('issued_by').references(() => users.id),
  usedInInvoiceId: uuid('used_in_invoice_id'),
  ...auditColumns,
});

// Relations
export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  patient: one(patients, {
    fields: [invoices.patientId],
    references: [patients.id],
  }),
  practitioner: one(users, {
    fields: [invoices.practitionerId],
    references: [users.id],
  }),
  appointment: one(appointments, {
    fields: [invoices.appointmentId],
    references: [appointments.id],
  }),
  location: one(locations, {
    fields: [invoices.locationId],
    references: [locations.id],
  }),
  lineItems: many(invoiceLineItems),
  payments: many(payments),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [invoices.id],
  }),
  service: one(services, {
    fields: [invoiceLineItems.serviceId],
    references: [services.id],
  }),
  practitioner: one(users, {
    fields: [invoiceLineItems.practitionerId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  patient: one(patients, {
    fields: [payments.patientId],
    references: [patients.id],
  }),
  processedByUser: one(users, {
    fields: [payments.processedBy],
    references: [users.id],
  }),
}));

export const giftCardsRelations = relations(giftCards, ({ one, many }) => ({
  purchaser: one(patients, {
    fields: [giftCards.purchaserId],
    references: [patients.id],
  }),
  transactions: many(giftCardTransactions),
}));

export const patientPackagesRelations = relations(patientPackages, ({ one, many }) => ({
  package: one(packages, {
    fields: [patientPackages.packageId],
    references: [packages.id],
  }),
  patient: one(patients, {
    fields: [patientPackages.patientId],
    references: [patients.id],
  }),
  redemptions: many(packageRedemptions),
}));

export const patientMembershipsRelations = relations(patientMemberships, ({ one }) => ({
  membership: one(memberships, {
    fields: [patientMemberships.membershipId],
    references: [memberships.id],
  }),
  patient: one(patients, {
    fields: [patientMemberships.patientId],
    references: [patients.id],
  }),
}));
