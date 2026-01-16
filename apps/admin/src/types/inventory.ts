// Inventory Management Types - Medical Spa Platform
// FDA Compliant Lot Tracking, FIFO, and Expiration Management
//
// DIFFERENTIATORS (Based on Competitor Research Dec 2024):
// - Fractional unit tracking (competitors like Mangomint can't do half syringes)
// - Multi-patient vial tracking (one Botox vial → multiple patients)
// - Reconstituted vial management with stability timers
// - Provider-level accountability and usage tracking
// - Cost-per-use analytics with profit margins
// - Manufacturer loyalty program integration (Allē, ASPIRE)

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export type ProductCategory =
  | 'neurotoxin'
  | 'filler'
  | 'skincare'
  | 'device'
  | 'consumable'
  | 'supplement'
  | 'other';

export type ProductStatus = 'active' | 'discontinued' | 'out_of_stock' | 'pending_approval';

export type UnitType = 'units' | 'syringe' | 'vial' | 'ml' | 'cc' | 'gram' | 'piece' | 'box' | 'kit';

export interface ProductManufacturer {
  id: string;
  name: string;
  shortName: string; // e.g., 'Allergan', 'Galderma', 'Merz'
  website?: string;
  supportPhone?: string;
  rewardsProgram?: string; // e.g., 'Alle', 'Aspire'
}

export interface Product {
  id: string;

  // Basic Info
  name: string;
  displayName: string; // e.g., "Botox® Cosmetic"
  description?: string;
  category: ProductCategory;
  brand: string;
  manufacturerId: string;
  manufacturerName: string;

  // Identification
  sku: string;
  ndc?: string; // National Drug Code for pharmaceuticals
  upc?: string; // Universal Product Code for retail
  gtin?: string; // Global Trade Item Number (GS1)

  // Pricing
  costPrice: number; // Our purchase cost
  retailPrice: number; // Patient price
  markupPercent: number;
  unitPrice: number; // Price per unit (for injectables)
  unitType: UnitType;
  unitsPerPackage: number; // e.g., 100 units per vial, 1ml per syringe

  // Injectable-Specific
  injectableDetails?: {
    type: 'neurotoxin' | 'filler' | 'biostimulator' | 'pdo_threads';
    concentration?: string; // e.g., "100U/vial", "24mg/ml"
    dilutionRatio?: string; // e.g., "2.5ml saline per 100U"
    defaultDilution?: number; // Recommended ml of saline
    volumePerSyringe?: number; // ml per syringe
    reconstitutionRequired: boolean;
    maxHoursAfterReconstitution?: number; // Stability after dilution
  };

  // Storage Requirements (FDA Compliance)
  storageRequirements: {
    temperatureMin: number; // Celsius
    temperatureMax: number; // Celsius
    requiresRefrigeration: boolean;
    freezerStorage: boolean;
    lightSensitive: boolean;
    humidityControlled: boolean;
    specialInstructions?: string;
  };

  // Inventory Thresholds
  reorderPoint: number; // Alert when stock falls below this
  reorderQuantity: number; // Suggested order quantity
  minStockLevel: number; // Critical low - stop treatments
  maxStockLevel: number; // Don't order above this
  leadTimeDays: number; // Average delivery time

  // Tracking
  trackInventory: boolean;
  trackByLot: boolean; // Require lot number selection
  trackBySerial: boolean; // For devices/equipment
  requireExpirationDate: boolean;

  // Commission
  commissionable: boolean;
  commissionRate?: number; // Percentage for staff

  // Categorization
  tags: string[];
  treatmentTypes: string[]; // Services that use this product
  requiredCertifications?: string[]; // Staff certs required to use

  // Status & Metadata
  status: ProductStatus;
  isActive: boolean;
  availableForSale: boolean; // Can be sold directly to patients
  requiresPrescription: boolean;
  controlledSubstance: boolean;
  hsaFsaEligible: boolean;

  // Images
  imageUrl?: string;
  thumbnailUrl?: string;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastUpdatedBy: string;
}

// ============================================================================
// LOT/BATCH TRACKING (FDA COMPLIANCE)
// ============================================================================

export type LotStatus =
  | 'available'
  | 'quarantine'
  | 'expired'
  | 'recalled'
  | 'depleted'
  | 'damaged';

export interface InventoryLot {
  id: string;
  productId: string;
  productName: string;

  // Lot Identification
  lotNumber: string;
  batchNumber?: string;
  serialNumber?: string; // For devices

  // Dates
  manufacturingDate?: Date;
  expirationDate: Date;
  receivedDate: Date;
  openedDate?: Date; // When first used (for reconstituted products)

  // Quantity
  initialQuantity: number;
  currentQuantity: number;
  reservedQuantity: number; // Reserved for scheduled appointments
  availableQuantity: number; // currentQuantity - reservedQuantity
  unitType: UnitType;

  // For Reconstituted Products
  reconstitutionDetails?: {
    reconstitutedAt: Date;
    diluentVolume: number;
    diluentType: string; // e.g., "preservative-free saline"
    reconstitutedBy: string;
    expiresAt: Date; // Based on stability after reconstitution
    concentration: string; // Resulting concentration
  };

  // Location
  locationId: string;
  locationName: string;
  storageLocation?: string; // e.g., "Fridge A, Shelf 2"

  // Purchase Info
  purchaseOrderId?: string;
  vendorId?: string;
  vendorName?: string;
  invoiceNumber?: string;
  purchaseCost: number;

  // Status & Quality
  status: LotStatus;
  qualityNotes?: string;
  temperatureLogId?: string; // Link to temperature monitoring

  // Recall Tracking
  recallStatus?: {
    isRecalled: boolean;
    recallDate?: Date;
    recallReason?: string;
    recallNumber?: string;
    fdaRecallClass?: 'I' | 'II' | 'III';
    patientsNotified?: boolean;
    notificationDate?: Date;
  };

  // Audit Trail
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastUpdatedBy: string;
}

// ============================================================================
// INVENTORY TRANSACTIONS (EVENT SOURCING)
// ============================================================================

export type TransactionType =
  | 'receive'           // Received from vendor
  | 'adjustment_add'    // Manual addition
  | 'adjustment_remove' // Manual removal
  | 'treatment_use'     // Used in patient treatment
  | 'transfer_out'      // Transferred to another location
  | 'transfer_in'       // Received from another location
  | 'damage'            // Damaged/destroyed
  | 'expiration'        // Expired and removed
  | 'recall'            // Removed due to recall
  | 'return_vendor'     // Returned to vendor
  | 'sale'              // Retail sale to patient
  | 'sample'            // Sample/demo use
  | 'waste'             // Disposed/wasted
  | 'reconstitution';   // Product was reconstituted

export type TransactionStatus = 'pending' | 'completed' | 'cancelled' | 'reversed';

export interface InventoryTransaction {
  id: string;

  // Transaction Details
  type: TransactionType;
  status: TransactionStatus;
  timestamp: Date;

  // Product & Lot
  productId: string;
  productName: string;
  lotId: string;
  lotNumber: string;

  // Quantity
  quantity: number; // Positive for additions, negative for deductions
  unitType: UnitType;
  quantityBefore: number; // Stock level before transaction
  quantityAfter: number; // Stock level after transaction

  // Cost Tracking
  unitCost: number;
  totalCost: number;

  // Location
  locationId: string;
  locationName: string;

  // Reference Links
  appointmentId?: string;
  patientId?: string;
  patientName?: string;
  practitionerId?: string;
  practitionerName?: string;
  invoiceId?: string;
  invoiceLineItemId?: string;
  purchaseOrderId?: string;
  transferId?: string; // For transfer transactions

  // For Treatment Usage
  treatmentDetails?: {
    serviceName: string;
    areasInjected?: { name: string; units: number }[];
    chartId?: string;
    treatmentNotes?: string;
  };

  // Reason & Notes
  reason: string;
  notes?: string;

  // Audit
  performedBy: string;
  performedByName: string;
  approvedBy?: string;
  approvedByName?: string;
  approvalRequired: boolean;
  approvalTimestamp?: Date;

  // Metadata
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// STOCK LEVELS (READ MODEL - DERIVED FROM TRANSACTIONS)
// ============================================================================

export type StockStatus =
  | 'in_stock'
  | 'low_stock'
  | 'critical'
  | 'out_of_stock'
  | 'overstocked';

export interface InventoryLevel {
  id: string;
  productId: string;
  productName: string;
  locationId: string;
  locationName: string;

  // Current Stock
  totalQuantity: number;
  availableQuantity: number; // Excludes reserved
  reservedQuantity: number;
  inTransitQuantity: number;

  // Value
  totalCost: number;
  averageCost: number;
  totalRetailValue: number;

  // Status
  status: StockStatus;
  reorderPoint: number;
  reorderQuantity: number;
  daysUntilStockout?: number; // Based on usage rate

  // Lot Summary
  activeLots: number;
  totalLots: number;
  earliestExpiration?: Date;
  nearestExpiringLotId?: string;
  nearestExpiringLotNumber?: string;

  // Usage Analytics
  averageDailyUsage: number;
  averageWeeklyUsage: number;
  averageMonthlyUsage: number;
  lastUsedDate?: Date;
  lastReceivedDate?: Date;

  // Version (for optimistic locking)
  version: number;
  lastCalculatedAt: Date;

  // Audit
  updatedAt: Date;
}

// ============================================================================
// PURCHASE ORDERS
// ============================================================================

export type PurchaseOrderStatus =
  | 'draft'
  | 'submitted'
  | 'confirmed'
  | 'shipped'
  | 'partial_received'
  | 'received'
  | 'cancelled';

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;

  // Quantity
  quantityOrdered: number;
  quantityReceived: number;
  quantityPending: number;
  unitType: UnitType;

  // Pricing
  unitCost: number;
  totalCost: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  finalCost: number;

  // Lot Info (populated on receipt)
  receivedLots?: {
    lotNumber: string;
    quantity: number;
    expirationDate: Date;
  }[];

  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;

  // Vendor
  vendorId: string;
  vendorName: string;
  vendorContact?: string;
  vendorEmail?: string;
  vendorPhone?: string;

  // Location
  locationId: string;
  locationName: string;
  shippingAddress?: string;

  // Dates
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;

  // Items
  items: PurchaseOrderItem[];

  // Totals
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discount: number;
  total: number;

  // Status
  status: PurchaseOrderStatus;

  // Payment
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentTerms?: string; // e.g., "Net 30"
  paymentMethod?: string;

  // Shipping
  trackingNumber?: string;
  carrier?: string;

  // Notes
  internalNotes?: string;
  vendorNotes?: string;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  submittedBy?: string;
  submittedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  receivedBy?: string;
  receivedAt?: Date;
}

// ============================================================================
// VENDORS / SUPPLIERS
// ============================================================================

export interface Vendor {
  id: string;
  name: string;
  shortName: string;

  // Contact Info
  contactName?: string;
  email?: string;
  phone?: string;
  fax?: string;
  website?: string;

  // Address
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  // Account Info
  accountNumber?: string;
  paymentTerms?: string;
  taxId?: string;

  // Products
  productIds: string[];
  primaryCategory?: ProductCategory;

  // Performance
  averageLeadDays: number;
  onTimeDeliveryRate?: number;
  qualityRating?: number;

  // Status
  isActive: boolean;
  isPreferred: boolean;

  // Notes
  notes?: string;

  // Audit
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// INVENTORY ALERTS
// ============================================================================

export type AlertType =
  | 'low_stock'
  | 'out_of_stock'
  | 'expiring_soon'
  | 'expired'
  | 'recall'
  | 'temperature_excursion'
  | 'variance_detected'
  | 'reorder_recommended';

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed';

export interface InventoryAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;

  // Subject
  productId?: string;
  productName?: string;
  lotId?: string;
  lotNumber?: string;
  locationId: string;
  locationName: string;

  // Message
  title: string;
  message: string;
  actionRequired?: string;

  // Thresholds (for stock alerts)
  currentValue?: number;
  thresholdValue?: number;

  // Expiration (for expiring alerts)
  expirationDate?: Date;
  daysUntilExpiration?: number;

  // Response
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolution?: string;

  // Notification
  notificationSent: boolean;
  notificationChannels?: string[];

  // Audit
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// INVENTORY COUNTS / PHYSICAL INVENTORY
// ============================================================================

export type InventoryCountStatus = 'draft' | 'in_progress' | 'completed' | 'approved' | 'posted';

export interface InventoryCountItem {
  id: string;
  productId: string;
  productName: string;
  lotId?: string;
  lotNumber?: string;

  // Counts
  systemQuantity: number;
  countedQuantity: number;
  variance: number;
  variancePercent: number;

  // Value
  unitCost: number;
  varianceValue: number;

  // Notes
  notes?: string;
  countedBy: string;
  countedAt: Date;
}

export interface InventoryCount {
  id: string;
  countNumber: string;

  // Scope
  locationId: string;
  locationName: string;
  countType: 'full' | 'cycle' | 'spot' | 'category';
  categoryFilter?: ProductCategory;
  productFilter?: string[];

  // Dates
  scheduledDate: Date;
  startedAt?: Date;
  completedAt?: Date;
  approvedAt?: Date;
  postedAt?: Date;

  // Items
  items: InventoryCountItem[];

  // Summary
  totalItems: number;
  countedItems: number;
  itemsWithVariance: number;
  totalVarianceValue: number;

  // Status
  status: InventoryCountStatus;

  // Audit
  createdBy: string;
  startedBy?: string;
  completedBy?: string;
  approvedBy?: string;
  postedBy?: string;
  notes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// LOCATION TRANSFERS
// ============================================================================

export type TransferStatus = 'draft' | 'requested' | 'approved' | 'in_transit' | 'received' | 'cancelled';

export interface InventoryTransferItem {
  id: string;
  productId: string;
  productName: string;
  lotId: string;
  lotNumber: string;

  // Quantities
  requestedQuantity: number;
  approvedQuantity: number;
  shippedQuantity: number;
  receivedQuantity: number;
  unitType: UnitType;

  // Cost
  unitCost: number;
  totalCost: number;

  notes?: string;
}

export interface InventoryTransfer {
  id: string;
  transferNumber: string;

  // Locations
  sourceLocationId: string;
  sourceLocationName: string;
  destinationLocationId: string;
  destinationLocationName: string;

  // Items
  items: InventoryTransferItem[];

  // Dates
  requestedDate: Date;
  approvedDate?: Date;
  shippedDate?: Date;
  receivedDate?: Date;

  // Status
  status: TransferStatus;

  // Shipping
  trackingNumber?: string;
  carrier?: string;

  // Value
  totalValue: number;

  // Audit
  requestedBy: string;
  requestedByName: string;
  approvedBy?: string;
  approvedByName?: string;
  shippedBy?: string;
  shippedByName?: string;
  receivedBy?: string;
  receivedByName?: string;

  // Notes
  requestNotes?: string;
  approvalNotes?: string;
  receivingNotes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// SEARCH & FILTER TYPES
// ============================================================================

export interface InventorySearchParams {
  query?: string;
  productId?: string;
  category?: ProductCategory;
  locationId?: string;
  status?: StockStatus;
  lowStockOnly?: boolean;
  expiringWithinDays?: number;
  vendorId?: string;
  tags?: string[];
  sortBy?: 'name' | 'quantity' | 'expiration' | 'value' | 'lastUsed';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface InventoryReportParams {
  reportType: 'valuation' | 'usage' | 'expiration' | 'variance' | 'movement' | 'turnover';
  startDate: Date;
  endDate: Date;
  locationId?: string;
  productId?: string;
  category?: ProductCategory;
  groupBy?: 'product' | 'category' | 'location' | 'vendor' | 'day' | 'week' | 'month';
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface InventoryMetrics {
  // Valuation
  totalValue: number;
  totalCost: number;
  potentialProfit: number;

  // Stock Health
  totalProducts: number;
  inStockProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;

  // Expiration
  expiringIn30Days: number;
  expiringIn60Days: number;
  expiringIn90Days: number;
  expiredValue: number;

  // Turnover
  inventoryTurnoverRatio: number;
  averageDaysToSell: number;

  // Variance
  totalVarianceValue: number;
  variancePercent: number;

  // Period Comparison
  periodOverPeriodChange: number;

  // Last Updated
  calculatedAt: Date;
}

export interface ProductUsageAnalytics {
  productId: string;
  productName: string;

  // Usage
  totalUnitsUsed: number;
  totalTreatments: number;
  averageUnitsPerTreatment: number;

  // Revenue
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;

  // Trends
  usageTrend: 'increasing' | 'stable' | 'decreasing';
  trendPercent: number;

  // By Provider
  byProvider: {
    providerId: string;
    providerName: string;
    unitsUsed: number;
    treatments: number;
  }[];

  // By Treatment Area (for injectables)
  byArea?: {
    area: string;
    unitsUsed: number;
    treatments: number;
  }[];
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface InventoryDeductionRequest {
  productId: string;
  quantity: number;
  lotId?: string; // If not provided, use FIFO
  appointmentId: string;
  patientId: string;
  practitionerId: string;
  treatmentDetails?: {
    serviceName: string;
    areasInjected?: { name: string; units: number }[];
    chartId?: string;
    notes?: string;
  };
  performedBy: string;
}

export interface InventoryDeductionResponse {
  success: boolean;
  transaction: InventoryTransaction;
  lotUsed: {
    lotId: string;
    lotNumber: string;
    quantityDeducted: number;
    remainingInLot: number;
  };
  productStock: {
    productId: string;
    totalAvailable: number;
    status: StockStatus;
  };
  alerts?: InventoryAlert[];
  error?: string;
}

export interface ReceiveInventoryRequest {
  purchaseOrderId?: string;
  items: {
    productId: string;
    quantity: number;
    lotNumber: string;
    expirationDate: Date;
    unitCost: number;
    manufacturingDate?: Date;
    serialNumber?: string;
  }[];
  locationId: string;
  receivedBy: string;
  notes?: string;
}

export interface ReceiveInventoryResponse {
  success: boolean;
  transactions: InventoryTransaction[];
  lotsCreated: InventoryLot[];
  alerts?: InventoryAlert[];
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const STOCK_STATUS_COLORS: Record<StockStatus, { bg: string; text: string; border: string }> = {
  in_stock: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  low_stock: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  critical: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  out_of_stock: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  overstocked: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

export const ALERT_SEVERITY_COLORS: Record<AlertSeverity, { bg: string; text: string; icon: string }> = {
  info: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
  warning: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-500' },
  critical: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-500' },
};

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  neurotoxin: 'Neurotoxin',
  filler: 'Dermal Filler',
  skincare: 'Skincare',
  device: 'Device/Equipment',
  consumable: 'Consumable',
  supplement: 'Supplement',
  other: 'Other',
};

export const EXPIRATION_THRESHOLDS = {
  critical: 7,    // Days - Red alert
  warning: 30,    // Days - Yellow alert
  notice: 90,     // Days - Blue notice
} as const;

export const STOCK_THRESHOLDS = {
  critical: 0.1,  // 10% of reorder point
  low: 1.0,       // At or below reorder point
  normal: 2.0,    // Up to 2x reorder point
} as const;

// ============================================================================
// OPEN VIAL SESSION (MULTI-PATIENT TRACKING)
// ============================================================================
// This is THE differentiator - tracking one vial used across multiple patients
// Competitors can't do this (Mangomint can't even do half syringes)

export type OpenVialStatus = 'active' | 'expired' | 'depleted' | 'discarded';

export interface VialUsageRecord {
  id: string;
  timestamp: Date;
  patientId: string;
  patientName: string;
  appointmentId: string;
  practitionerId: string;
  practitionerName: string;
  unitsUsed: number; // Supports fractional: 12.5 units
  areasInjected?: { name: string; units: number }[];
  chartId?: string;
  notes?: string;
}

export interface OpenVialSession {
  id: string;

  // Source Lot
  lotId: string;
  lotNumber: string;
  productId: string;
  productName: string;

  // Vial Details
  vialNumber: number; // Which vial from the lot (1st, 2nd, etc.)
  originalUnits: number; // Starting units (e.g., 100 for Botox)
  currentUnits: number; // Remaining units (supports decimals: 23.5)
  usedUnits: number; // Total used
  wastedUnits: number; // Documented waste

  // Reconstitution (for neurotoxins)
  reconstitutedAt?: Date;
  reconstitutedBy?: string;
  reconstitutedByName?: string;
  diluentType?: string; // e.g., "preservative-free saline"
  diluentVolume?: number; // ml
  concentration?: string; // e.g., "4U per 0.1ml"

  // Stability Tracking (CRITICAL for FDA compliance)
  expiresAt: Date; // Based on reconstitution + max stability hours
  stabilityHoursTotal: number; // e.g., 24 hours for Botox
  stabilityHoursRemaining: number;
  isExpired: boolean;

  // Multi-Patient Usage Records
  usageRecords: VialUsageRecord[];
  totalPatients: number;

  // Location
  locationId: string;
  locationName: string;
  storageLocation?: string;

  // Status
  status: OpenVialStatus;
  closedAt?: Date;
  closedBy?: string;
  closedReason?: 'depleted' | 'expired' | 'stability_exceeded' | 'contamination' | 'manual_close';

  // Cost Tracking
  vialCost: number; // Original cost
  costPerUnitUsed: number; // Calculated: vialCost / usedUnits
  revenueGenerated: number; // Total billed for this vial
  profitMargin: number; // Percentage

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastUpdatedBy: string;
}

// ============================================================================
// PROVIDER ACCOUNTABILITY & USAGE TRACKING
// ============================================================================
// Track who uses what - identify waste, theft, and training opportunities

export interface ProviderInventoryStats {
  providerId: string;
  providerName: string;

  // Usage Summary (supports fractional)
  totalUnitsUsed: number;
  totalTreatments: number;
  averageUnitsPerTreatment: number;

  // Comparison to Average (identify outliers)
  averageUnitsVsClinicAverage: number; // +15% means uses 15% more than clinic average
  isAboveAverage: boolean;
  variancePercent: number;

  // By Product
  byProduct: {
    productId: string;
    productName: string;
    unitsUsed: number;
    treatments: number;
    avgPerTreatment: number;
    vsClinicAverage: number;
  }[];

  // By Treatment Area (for injectables)
  byArea: {
    area: string;
    unitsUsed: number;
    treatments: number;
    avgPerTreatment: number;
  }[];

  // Waste/Shrinkage
  wasteUnits: number;
  wasteValue: number;
  wastePercent: number;

  // Revenue & Profit
  revenueGenerated: number;
  costOfGoodsUsed: number;
  grossProfit: number;
  profitMargin: number;

  // Period
  periodStart: Date;
  periodEnd: Date;
  calculatedAt: Date;
}

// ============================================================================
// WASTE TRACKING
// ============================================================================
// Critical for profitability - every $50-60 wasted per vial adds up

export type WasteReason =
  | 'expired_unused'          // Product expired before use
  | 'stability_exceeded'      // Reconstituted product exceeded stability
  | 'contamination'           // Suspected contamination
  | 'draw_up_loss'            // Residual in vial/syringe (industry avg ~5 units/vial)
  | 'patient_no_show'         // Reconstituted for patient who didn't show
  | 'adverse_reaction_discard' // Discarded due to adverse reaction
  | 'training'                // Used for training/demo
  | 'damaged'                 // Physical damage
  | 'recall'                  // Manufacturer recall
  | 'other';

export interface WasteRecord {
  id: string;

  // Source
  lotId: string;
  lotNumber: string;
  productId: string;
  productName: string;
  openVialSessionId?: string; // If from an open vial

  // Waste Details
  unitsWasted: number; // Supports fractional
  unitType: UnitType;
  reason: WasteReason;
  reasonNotes?: string;

  // Cost Impact
  unitCost: number;
  totalWasteValue: number;

  // Who/When/Where
  recordedBy: string;
  recordedByName: string;
  recordedAt: Date;
  locationId: string;
  locationName: string;

  // Optional: Who caused the waste (for accountability, not blame)
  practitionerId?: string;
  practitionerName?: string;
  appointmentId?: string;

  // Audit
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// COST-PER-USE ANALYTICS
// ============================================================================
// Answer the question: "What does each treatment actually cost us?"

export interface TreatmentCostAnalysis {
  treatmentId: string;
  treatmentName: string;

  // Per-Treatment Costs
  avgProductCost: number; // Average cost of products used
  avgUnitsUsed: number;
  avgCostPerUnit: number;

  // Revenue
  avgRevenuePerTreatment: number;
  avgProfitPerTreatment: number;
  avgProfitMargin: number;

  // Breakdown by Product
  productBreakdown: {
    productId: string;
    productName: string;
    avgUnitsUsed: number;
    avgCost: number;
    percentOfTotalCost: number;
  }[];

  // Variance
  costVariance: number; // Std dev
  highCostTreatments: number; // Count above average
  lowCostTreatments: number; // Count below average

  // Trend
  trend: 'increasing' | 'stable' | 'decreasing';
  trendPercent: number;

  // Period
  periodStart: Date;
  periodEnd: Date;
  totalTreatments: number;
  calculatedAt: Date;
}

// ============================================================================
// MANUFACTURER LOYALTY INTEGRATION (Allē, ASPIRE)
// ============================================================================
// Hooks for integration with manufacturer loyalty programs

export type LoyaltyProgram = 'alle' | 'aspire' | 'evolus' | 'merz_aesthetics';

export interface LoyaltyProgramConfig {
  program: LoyaltyProgram;
  programName: string;
  manufacturerName: string;

  // API Integration
  isEnabled: boolean;
  apiEndpoint?: string;
  apiKey?: string; // Encrypted
  accountId?: string;

  // Supported Products
  supportedProductIds: string[];

  // Auto-logging
  autoLogTreatments: boolean;
  autoEnrollPatients: boolean;

  // Status
  lastSyncAt?: Date;
  syncStatus: 'connected' | 'disconnected' | 'error';
  syncError?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyTransaction {
  id: string;
  program: LoyaltyProgram;

  // Treatment Reference
  appointmentId: string;
  patientId: string;
  patientName: string;

  // Products Used
  products: {
    productId: string;
    productName: string;
    unitsUsed: number;
    lotNumber: string;
  }[];

  // Loyalty Details
  pointsEarned?: number;
  pointsRedeemed?: number;
  rewardApplied?: string;
  discountAmount?: number;

  // Sync Status
  syncedAt?: Date;
  syncStatus: 'pending' | 'synced' | 'failed';
  syncError?: string;
  externalTransactionId?: string;

  // Audit
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// CHARTING INTEGRATION (AUTO-DEDUCTION)
// ============================================================================
// When a treatment is charted, inventory auto-deducts

export interface ChartingInventoryLink {
  chartId: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  practitionerId: string;
  practitionerName: string;

  // Products Used (from charting)
  productsUsed: {
    productId: string;
    productName: string;
    unitsUsed: number; // Supports fractional
    lotId?: string; // If manually selected
    lotNumber?: string;
    openVialSessionId?: string; // If from open vial
    areasInjected?: { name: string; units: number }[];
  }[];

  // Auto-Deduction Status
  autoDeductionEnabled: boolean;
  deductionStatus: 'pending' | 'completed' | 'failed' | 'manual_override';
  deductionError?: string;

  // Transactions Created
  transactionIds: string[];

  // Timestamps
  chartCompletedAt: Date;
  deductionProcessedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ENHANCED API TYPES (FRACTIONAL SUPPORT)
// ============================================================================

export interface OpenVialRequest {
  lotId: string;
  vialNumber?: number; // Auto-increment if not provided

  // Reconstitution (for neurotoxins)
  diluentType?: string;
  diluentVolume?: number;

  // Who
  reconstitutedBy: string;
  locationId: string;
}

export interface OpenVialResponse {
  success: boolean;
  session: OpenVialSession;
  expiresAt: Date;
  stabilityHoursRemaining: number;
  error?: string;
}

export interface UseFromVialRequest {
  openVialSessionId: string;
  unitsToUse: number; // Supports fractional: 12.5

  // Patient/Treatment
  patientId: string;
  appointmentId: string;
  practitionerId: string;

  // Treatment Details
  areasInjected?: { name: string; units: number }[];
  chartId?: string;
  notes?: string;
}

export interface UseFromVialResponse {
  success: boolean;
  usageRecord: VialUsageRecord;
  remainingUnits: number; // Fractional
  isVialDepleted: boolean;
  stabilityHoursRemaining: number;
  alerts?: InventoryAlert[];
  error?: string;
}

export interface RecordWasteRequest {
  lotId?: string;
  openVialSessionId?: string;
  productId: string;
  unitsWasted: number; // Fractional
  reason: WasteReason;
  reasonNotes?: string;
  practitionerId?: string;
  recordedBy: string;
  locationId: string;
}

export interface RecordWasteResponse {
  success: boolean;
  wasteRecord: WasteRecord;
  totalWasteValue: number;
  updatedLotQuantity?: number;
  error?: string;
}
