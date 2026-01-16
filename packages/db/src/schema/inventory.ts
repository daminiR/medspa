// Inventory Schema - Comprehensive Medical Spa Inventory Management
import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb, decimal, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { timestamps, auditColumns, softDelete } from './common';
import { users } from './users';
import { patients } from './patients';
import { appointments } from './appointments';
import { locations } from './locations';

// Enums
export const productCategoryEnum = ['neurotoxin', 'filler', 'skincare', 'device', 'consumable', 'supplement', 'other'] as const;
export const productStatusEnum = ['active', 'discontinued', 'out_of_stock', 'pending_approval'] as const;
export const unitTypeEnum = ['units', 'syringe', 'vial', 'ml', 'cc', 'gram', 'piece', 'box', 'kit'] as const;
export const lotStatusEnum = ['available', 'quarantine', 'expired', 'recalled', 'depleted', 'damaged'] as const;
export const transactionTypeEnum = [
  'receive', 'adjustment_add', 'adjustment_remove', 'treatment_use', 'transfer_out',
  'transfer_in', 'damage', 'expiration', 'recall', 'return_vendor', 'sale', 'sample',
  'waste', 'reconstitution'
] as const;

// Vendors
export const vendors = pgTable('vendors', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  shortName: varchar('short_name', { length: 100 }),
  contactName: varchar('contact_name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  fax: varchar('fax', { length: 50 }),
  website: text('website'),
  address: jsonb('address').$type<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>(),
  accountNumber: varchar('account_number', { length: 100 }),
  paymentTerms: varchar('payment_terms', { length: 100 }),
  taxId: varchar('tax_id', { length: 50 }),
  averageLeadDays: integer('average_lead_days').default(7),
  onTimeDeliveryRate: decimal('on_time_delivery_rate', { precision: 5, scale: 2 }),
  qualityRating: decimal('quality_rating', { precision: 3, scale: 2 }),
  isActive: boolean('is_active').default(true),
  isPreferred: boolean('is_preferred').default(false),
  notes: text('notes'),
  ...auditColumns,
});

// Products
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }),
  description: text('description'),
  category: varchar('category', { length: 50 }).$type<typeof productCategoryEnum[number]>(),
  brand: varchar('brand', { length: 100 }),
  vendorId: uuid('vendor_id').references(() => vendors.id),

  // Identification
  sku: varchar('sku', { length: 100 }).unique(),
  ndc: varchar('ndc', { length: 50 }), // National Drug Code
  upc: varchar('upc', { length: 50 }),
  gtin: varchar('gtin', { length: 50 }),

  // Pricing
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  retailPrice: decimal('retail_price', { precision: 10, scale: 2 }),
  markupPercent: decimal('markup_percent', { precision: 5, scale: 2 }),
  unitPrice: decimal('unit_price', { precision: 10, scale: 4 }), // Price per unit
  unitType: varchar('unit_type', { length: 20 }).$type<typeof unitTypeEnum[number]>(),
  unitsPerPackage: decimal('units_per_package', { precision: 10, scale: 4 }).default('1'),

  // Injectable-specific
  injectableDetails: jsonb('injectable_details').$type<{
    type: 'neurotoxin' | 'filler' | 'biostimulator' | 'pdo_threads';
    concentration?: string;
    dilutionRatio?: string;
    defaultDilution?: number;
    volumePerSyringe?: number;
    reconstitutionRequired: boolean;
    maxHoursAfterReconstitution?: number;
  }>(),

  // Storage requirements
  storageRequirements: jsonb('storage_requirements').$type<{
    temperatureMin: number;
    temperatureMax: number;
    requiresRefrigeration: boolean;
    freezerStorage: boolean;
    lightSensitive: boolean;
    humidityControlled: boolean;
    specialInstructions?: string;
  }>(),

  // Inventory thresholds
  reorderPoint: integer('reorder_point').default(5),
  reorderQuantity: integer('reorder_quantity').default(10),
  minStockLevel: integer('min_stock_level').default(1),
  maxStockLevel: integer('max_stock_level'),
  leadTimeDays: integer('lead_time_days').default(7),

  // Tracking flags
  trackInventory: boolean('track_inventory').default(true),
  trackByLot: boolean('track_by_lot').default(true),
  trackBySerial: boolean('track_by_serial').default(false),
  requireExpirationDate: boolean('require_expiration_date').default(true),

  // Commission
  commissionable: boolean('commissionable').default(false),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }),

  // Categorization
  tags: jsonb('tags').$type<string[]>(),
  treatmentTypes: jsonb('treatment_types').$type<string[]>(),
  requiredCertifications: jsonb('required_certifications').$type<string[]>(),

  // Flags
  status: varchar('status', { length: 20 }).default('active').$type<typeof productStatusEnum[number]>(),
  isActive: boolean('is_active').default(true),
  availableForSale: boolean('available_for_sale').default(false),
  requiresPrescription: boolean('requires_prescription').default(false),
  controlledSubstance: boolean('controlled_substance').default(false),
  hsaFsaEligible: boolean('hsa_fsa_eligible').default(true),

  // Images
  imageUrl: text('image_url'),
  thumbnailUrl: text('thumbnail_url'),

  ...auditColumns,
  ...softDelete,
});

// Inventory lots (batch tracking)
export const inventoryLots = pgTable('inventory_lots', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id),
  locationId: uuid('location_id').notNull().references(() => locations.id),

  // Lot identification
  lotNumber: varchar('lot_number', { length: 100 }).notNull(),
  batchNumber: varchar('batch_number', { length: 100 }),
  serialNumber: varchar('serial_number', { length: 100 }),

  // Dates
  manufacturingDate: date('manufacturing_date'),
  expirationDate: date('expiration_date').notNull(),
  receivedDate: timestamp('received_date', { withTimezone: true }).notNull().defaultNow(),
  openedDate: timestamp('opened_date', { withTimezone: true }),

  // Quantity - supports fractional units
  initialQuantity: decimal('initial_quantity', { precision: 10, scale: 4 }).notNull(),
  currentQuantity: decimal('current_quantity', { precision: 10, scale: 4 }).notNull(),
  reservedQuantity: decimal('reserved_quantity', { precision: 10, scale: 4 }).default('0'),
  unitType: varchar('unit_type', { length: 20 }).$type<typeof unitTypeEnum[number]>(),

  // Reconstitution (for neurotoxins)
  reconstitutionDetails: jsonb('reconstitution_details').$type<{
    reconstitutedAt: string;
    diluentVolume: number;
    diluentType: string;
    reconstitutedBy: string;
    expiresAt: string;
    concentration: string;
  }>(),

  // Storage
  storageLocation: varchar('storage_location', { length: 255 }),

  // Purchase info
  purchaseOrderId: uuid('purchase_order_id'),
  vendorId: uuid('vendor_id').references(() => vendors.id),
  invoiceNumber: varchar('invoice_number', { length: 100 }),
  purchaseCost: decimal('purchase_cost', { precision: 10, scale: 2 }),

  // Status
  status: varchar('status', { length: 20 }).default('available').$type<typeof lotStatusEnum[number]>(),
  qualityNotes: text('quality_notes'),

  // Recall tracking
  recallStatus: jsonb('recall_status').$type<{
    isRecalled: boolean;
    recallDate?: string;
    recallReason?: string;
    recallNumber?: string;
    fdaRecallClass?: 'I' | 'II' | 'III';
    patientsNotified?: boolean;
    notificationDate?: string;
  }>(),

  ...auditColumns,
  ...softDelete,
});

// Inventory transactions (event sourcing)
export const inventoryTransactions = pgTable('inventory_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 30 }).$type<typeof transactionTypeEnum[number]>(),
  status: varchar('status', { length: 20 }).default('completed').$type<'pending' | 'completed' | 'cancelled' | 'reversed'>(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),

  // Product & Lot
  productId: uuid('product_id').notNull().references(() => products.id),
  lotId: uuid('lot_id').references(() => inventoryLots.id),

  // Quantity - supports fractional, positive for additions, negative for deductions
  quantity: decimal('quantity', { precision: 10, scale: 4 }).notNull(),
  unitType: varchar('unit_type', { length: 20 }).$type<typeof unitTypeEnum[number]>(),
  quantityBefore: decimal('quantity_before', { precision: 10, scale: 4 }),
  quantityAfter: decimal('quantity_after', { precision: 10, scale: 4 }),

  // Cost tracking
  unitCost: decimal('unit_cost', { precision: 10, scale: 4 }),
  totalCost: decimal('total_cost', { precision: 10, scale: 2 }),

  // Location
  locationId: uuid('location_id').references(() => locations.id),

  // Reference links
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  patientId: uuid('patient_id').references(() => patients.id),
  practitionerId: uuid('practitioner_id').references(() => users.id),
  invoiceId: uuid('invoice_id'),
  purchaseOrderId: uuid('purchase_order_id'),
  transferId: uuid('transfer_id'),

  // Treatment details
  treatmentDetails: jsonb('treatment_details').$type<{
    serviceName: string;
    areasInjected?: { name: string; units: number }[];
    chartId?: string;
    treatmentNotes?: string;
  }>(),

  // Reason & Notes
  reason: varchar('reason', { length: 255 }),
  notes: text('notes'),

  // Audit
  performedBy: uuid('performed_by').notNull().references(() => users.id),
  approvedBy: uuid('approved_by').references(() => users.id),
  approvalRequired: boolean('approval_required').default(false),
  approvalTimestamp: timestamp('approval_timestamp', { withTimezone: true }),

  metadata: jsonb('metadata'),
  ...timestamps,
});

// Open vial sessions (multi-patient tracking)
export const openVialSessions = pgTable('open_vial_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  lotId: uuid('lot_id').notNull().references(() => inventoryLots.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  locationId: uuid('location_id').notNull().references(() => locations.id),

  // Vial details
  vialNumber: integer('vial_number').default(1),
  originalUnits: decimal('original_units', { precision: 10, scale: 4 }).notNull(),
  currentUnits: decimal('current_units', { precision: 10, scale: 4 }).notNull(),
  usedUnits: decimal('used_units', { precision: 10, scale: 4 }).default('0'),
  wastedUnits: decimal('wasted_units', { precision: 10, scale: 4 }).default('0'),

  // Reconstitution
  reconstitutedAt: timestamp('reconstituted_at', { withTimezone: true }),
  reconstitutedBy: uuid('reconstituted_by').references(() => users.id),
  diluentType: varchar('diluent_type', { length: 100 }),
  diluentVolume: decimal('diluent_volume', { precision: 10, scale: 4 }),
  concentration: varchar('concentration', { length: 100 }),

  // Stability tracking
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  stabilityHoursTotal: integer('stability_hours_total'),
  isExpired: boolean('is_expired').default(false),

  // Usage tracking
  totalPatients: integer('total_patients').default(0),

  // Storage
  storageLocation: varchar('storage_location', { length: 255 }),

  // Status
  status: varchar('status', { length: 20 }).default('active').$type<'active' | 'expired' | 'depleted' | 'discarded'>(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  closedBy: uuid('closed_by').references(() => users.id),
  closedReason: varchar('closed_reason', { length: 50 }),

  // Cost tracking
  vialCost: decimal('vial_cost', { precision: 10, scale: 2 }),
  costPerUnitUsed: decimal('cost_per_unit_used', { precision: 10, scale: 4 }),
  revenueGenerated: decimal('revenue_generated', { precision: 10, scale: 2 }).default('0'),
  profitMargin: decimal('profit_margin', { precision: 5, scale: 2 }),

  ...auditColumns,
});

// Vial usage records
export const vialUsageRecords = pgTable('vial_usage_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  openVialSessionId: uuid('open_vial_session_id').notNull().references(() => openVialSessions.id),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),

  // Patient & Treatment
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  practitionerId: uuid('practitioner_id').notNull().references(() => users.id),

  // Usage - supports fractional
  unitsUsed: decimal('units_used', { precision: 10, scale: 4 }).notNull(),
  areasInjected: jsonb('areas_injected').$type<{ name: string; units: number }[]>(),
  chartId: uuid('chart_id'),
  notes: text('notes'),

  ...timestamps,
});

// Waste records
export const wasteRecords = pgTable('waste_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  lotId: uuid('lot_id').references(() => inventoryLots.id),
  openVialSessionId: uuid('open_vial_session_id').references(() => openVialSessions.id),
  productId: uuid('product_id').notNull().references(() => products.id),
  locationId: uuid('location_id').notNull().references(() => locations.id),

  // Waste details - supports fractional
  unitsWasted: decimal('units_wasted', { precision: 10, scale: 4 }).notNull(),
  unitType: varchar('unit_type', { length: 20 }).$type<typeof unitTypeEnum[number]>(),
  reason: varchar('reason', { length: 50 }).$type<
    'expired_unused' | 'stability_exceeded' | 'contamination' | 'draw_up_loss' |
    'patient_no_show' | 'adverse_reaction_discard' | 'training' | 'damaged' |
    'recall' | 'other'
  >(),
  reasonNotes: text('reason_notes'),

  // Cost impact
  unitCost: decimal('unit_cost', { precision: 10, scale: 4 }),
  totalWasteValue: decimal('total_waste_value', { precision: 10, scale: 2 }),

  // Who
  recordedBy: uuid('recorded_by').notNull().references(() => users.id),
  practitionerId: uuid('practitioner_id').references(() => users.id),
  appointmentId: uuid('appointment_id').references(() => appointments.id),

  ...auditColumns,
});

// Inventory alerts
export const inventoryAlerts = pgTable('inventory_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 30 }).$type<
    'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired' |
    'recall' | 'temperature_excursion' | 'variance_detected' | 'reorder_recommended'
  >(),
  severity: varchar('severity', { length: 20 }).$type<'info' | 'warning' | 'critical'>(),
  status: varchar('status', { length: 20 }).default('active').$type<'active' | 'acknowledged' | 'resolved' | 'dismissed'>(),

  // Subject
  productId: uuid('product_id').references(() => products.id),
  lotId: uuid('lot_id').references(() => inventoryLots.id),
  locationId: uuid('location_id').notNull().references(() => locations.id),

  // Message
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  actionRequired: text('action_required'),

  // Thresholds
  currentValue: decimal('current_value', { precision: 10, scale: 4 }),
  thresholdValue: decimal('threshold_value', { precision: 10, scale: 4 }),

  // Expiration
  expirationDate: date('expiration_date'),
  daysUntilExpiration: integer('days_until_expiration'),

  // Response
  acknowledgedBy: uuid('acknowledged_by').references(() => users.id),
  acknowledgedAt: timestamp('acknowledged_at', { withTimezone: true }),
  resolvedBy: uuid('resolved_by').references(() => users.id),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  resolution: text('resolution'),

  // Notification
  notificationSent: boolean('notification_sent').default(false),
  notificationChannels: jsonb('notification_channels').$type<string[]>(),

  ...timestamps,
});

// Purchase orders
export const purchaseOrders = pgTable('purchase_orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: varchar('order_number', { length: 50 }).unique().notNull(),
  vendorId: uuid('vendor_id').notNull().references(() => vendors.id),
  locationId: uuid('location_id').notNull().references(() => locations.id),

  // Dates
  orderDate: timestamp('order_date', { withTimezone: true }).notNull().defaultNow(),
  expectedDeliveryDate: timestamp('expected_delivery_date', { withTimezone: true }),
  actualDeliveryDate: timestamp('actual_delivery_date', { withTimezone: true }),

  // Totals
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }),
  shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }),
  discount: decimal('discount', { precision: 10, scale: 2 }),
  total: decimal('total', { precision: 10, scale: 2 }),

  // Status
  status: varchar('status', { length: 20 }).default('draft').$type<
    'draft' | 'submitted' | 'confirmed' | 'shipped' | 'partial_received' | 'received' | 'cancelled'
  >(),
  paymentStatus: varchar('payment_status', { length: 20 }).default('pending').$type<'pending' | 'partial' | 'paid'>(),
  paymentTerms: varchar('payment_terms', { length: 100 }),
  paymentMethod: varchar('payment_method', { length: 50 }),

  // Shipping
  shippingAddress: text('shipping_address'),
  trackingNumber: varchar('tracking_number', { length: 255 }),
  carrier: varchar('carrier', { length: 100 }),

  // Notes
  internalNotes: text('internal_notes'),
  vendorNotes: text('vendor_notes'),

  // Audit
  submittedBy: uuid('submitted_by').references(() => users.id),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  receivedBy: uuid('received_by').references(() => users.id),
  receivedAt: timestamp('received_at', { withTimezone: true }),

  ...auditColumns,
});

// Purchase order items
export const purchaseOrderItems = pgTable('purchase_order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  purchaseOrderId: uuid('purchase_order_id').notNull().references(() => purchaseOrders.id),
  productId: uuid('product_id').notNull().references(() => products.id),

  // Quantity - supports fractional
  quantityOrdered: decimal('quantity_ordered', { precision: 10, scale: 4 }).notNull(),
  quantityReceived: decimal('quantity_received', { precision: 10, scale: 4 }).default('0'),
  unitType: varchar('unit_type', { length: 20 }).$type<typeof unitTypeEnum[number]>(),

  // Pricing
  unitCost: decimal('unit_cost', { precision: 10, scale: 4 }).notNull(),
  totalCost: decimal('total_cost', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }),
  discountType: varchar('discount_type', { length: 20 }),
  finalCost: decimal('final_cost', { precision: 10, scale: 2 }),

  // Received lots
  receivedLots: jsonb('received_lots').$type<{
    lotNumber: string;
    quantity: number;
    expirationDate: string;
  }[]>(),

  notes: text('notes'),
  ...timestamps,
});

// Relations
export const vendorsRelations = relations(vendors, ({ many }) => ({
  products: many(products),
  lots: many(inventoryLots),
  purchaseOrders: many(purchaseOrders),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [products.vendorId],
    references: [vendors.id],
  }),
  lots: many(inventoryLots),
  transactions: many(inventoryTransactions),
  openVialSessions: many(openVialSessions),
  wasteRecords: many(wasteRecords),
}));

export const inventoryLotsRelations = relations(inventoryLots, ({ one, many }) => ({
  product: one(products, {
    fields: [inventoryLots.productId],
    references: [products.id],
  }),
  location: one(locations, {
    fields: [inventoryLots.locationId],
    references: [locations.id],
  }),
  vendor: one(vendors, {
    fields: [inventoryLots.vendorId],
    references: [vendors.id],
  }),
  transactions: many(inventoryTransactions),
  openVialSessions: many(openVialSessions),
}));

export const openVialSessionsRelations = relations(openVialSessions, ({ one, many }) => ({
  lot: one(inventoryLots, {
    fields: [openVialSessions.lotId],
    references: [inventoryLots.id],
  }),
  product: one(products, {
    fields: [openVialSessions.productId],
    references: [products.id],
  }),
  location: one(locations, {
    fields: [openVialSessions.locationId],
    references: [locations.id],
  }),
  usageRecords: many(vialUsageRecords),
}));

export const vialUsageRecordsRelations = relations(vialUsageRecords, ({ one }) => ({
  openVialSession: one(openVialSessions, {
    fields: [vialUsageRecords.openVialSessionId],
    references: [openVialSessions.id],
  }),
  patient: one(patients, {
    fields: [vialUsageRecords.patientId],
    references: [patients.id],
  }),
  appointment: one(appointments, {
    fields: [vialUsageRecords.appointmentId],
    references: [appointments.id],
  }),
  practitioner: one(users, {
    fields: [vialUsageRecords.practitionerId],
    references: [users.id],
  }),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [purchaseOrders.vendorId],
    references: [vendors.id],
  }),
  location: one(locations, {
    fields: [purchaseOrders.locationId],
    references: [locations.id],
  }),
  items: many(purchaseOrderItems),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderItems.purchaseOrderId],
    references: [purchaseOrders.id],
  }),
  product: one(products, {
    fields: [purchaseOrderItems.productId],
    references: [products.id],
  }),
}));
