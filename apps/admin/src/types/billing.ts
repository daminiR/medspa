// Billing & Payment Types - Based on Jane App with Medical Spa Enhancements

export interface Invoice {
  // Basic Info
  id: string
  invoiceNumber: string
  patientId: string
  patientName: string
  practitionerId: string
  practitionerName: string
  locationId: string
  locationName: string
  
  // Dates
  invoiceDate: Date
  dueDate: Date
  serviceDate: Date
  
  // Line Items
  lineItems: InvoiceLineItem[]
  
  // Totals
  subtotal: number
  taxTotal: number
  discountTotal: number
  total: number
  
  // Payments
  payments: Payment[]
  amountPaid: number
  balance: number
  
  // Status
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled' | 'refunded'
  
  // Notes
  internalNotes?: string
  patientNotes?: string
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
  
  // Attachments
  attachments?: InvoiceAttachment[]
  
  // Related
  appointmentId?: string
  packageId?: string
  membershipId?: string
}

export interface InvoiceLineItem {
  id: string
  type: 'service' | 'product' | 'package' | 'membership' | 'unit' | 'injectable'
  itemId?: string
  name: string
  description?: string
  
  // Quantity & Pricing
  quantity: number
  unitPrice: number
  totalPrice?: number
  
  // Unit-based billing for injectables
  unitType?: 'unit' | 'syringe' | 'vial' | 'ml' | 'cc' | 'hour'
  
  // For injection tracking
  injectionDetails?: {
    product: string // Botox, Dysport, Juvederm, etc.
    areas: {
      name: string // Forehead, Glabella, etc.
      units: number
    }[]
    lotNumber?: string
    expirationDate?: Date
    photos?: {
      id: string
      type: 'before' | 'after'
      angle: string
      url: string
      timestamp: Date
    }[]
    photoConsentSigned?: boolean
    inventoryDeduction?: boolean
  }
  
  // Enhanced metadata for injectables
  metadata?: {
    productId?: string
    productType?: 'neurotoxin' | 'filler'
    zones?: { id: string; name: string; units: number }[]
    customPoints?: { id: string; label: string; units: number }[]
    lotNumber?: string
    expirationDate?: string
    notes?: string
    photos?: any[]
    photoConsentSigned?: boolean
    inventoryDeduction?: boolean
    totalUnits?: number
    totalVolume?: number
    syringeCount?: number
  }
  
  // Discounts
  discount?: {
    type: 'percentage' | 'fixed'
    value: number
    reason: string
  }
  
  // Tax
  tax?: {
    rate: number
    amount: number
  }
  
  // Totals
  lineTotal?: number
  discountAmount?: number
  taxAmount?: number
  total?: number
  
  // Practitioner (for commission)
  practitionerId?: string
  practitionerName?: string
}

export interface Payment {
  id: string
  invoiceId: string
  date: Date
  amount: number
  method: PaymentMethod
  
  // Payment Details
  reference?: string
  transactionId?: string
  
  // Card Details (if applicable)
  cardDetails?: {
    last4: string
    brand: string
    expiryMonth: number
    expiryYear: number
  }
  
  // Check Details (if applicable)
  checkDetails?: {
    checkNumber: string
    bankName?: string
  }
  
  // Gift Card Details (if applicable)
  giftCardDetails?: {
    giftCardId: string
    giftCardNumber: string
    remainingBalance: number
  }
  
  // Financing Details (if applicable)
  financingDetails?: {
    provider: 'carecredit' | 'cherry' | 'other'
    applicationId: string
    approvalCode?: string
    term?: number // months
  }
  
  // Status
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partially_refunded'
  
  // Refund Info
  refundedAmount?: number
  refundDate?: Date
  refundReason?: string
  
  // Metadata
  processedBy: string
  notes?: string
}

export enum PaymentMethod {
  CASH = 'cash',
  CHECK = 'check',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  ACH = 'ach',
  GIFT_CARD = 'gift_card',
  PACKAGE_CREDIT = 'package_credit',
  MEMBERSHIP_CREDIT = 'membership_credit',
  INSURANCE = 'insurance',
  FINANCING = 'financing',
  CRYPTO = 'crypto',
  VENMO = 'venmo',
  ZELLE = 'zelle',
  OTHER = 'other'
}

export interface InvoiceAttachment {
  id: string
  type: 'consent' | 'photo' | 'document' | 'other'
  name: string
  url: string
  uploadedAt: Date
  uploadedBy: string
}

// Package & Membership Types
export interface Package {
  id: string
  name: string
  description: string
  imageUrl?: string
  
  // Package Contents
  contents: PackageItem[]
  
  // Pricing
  regularPrice: number
  salePrice: number
  savings: number
  
  // Validity
  validityDays?: number // How long package is valid after purchase
  
  // Restrictions
  restrictions?: {
    specificPractitioners?: string[]
    specificLocations?: string[]
    blackoutDates?: Date[]
    shareable: boolean
    transferable: boolean
  }
  
  // Status
  active: boolean
  availableForPurchase: boolean
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

export interface PackageItem {
  type: 'service' | 'product'
  itemId: string
  name: string
  quantity: number
  value: number
}

export interface Membership {
  id: string
  name: string
  description: string
  tier: 'silver' | 'gold' | 'platinum' | 'vip'
  imageUrl?: string
  
  // Billing
  billingCycle: 'monthly' | 'quarterly' | 'semi-annual' | 'annual'
  price: number
  setupFee?: number
  
  // Benefits
  benefits: {
    discountPercentage: number
    includedServices: {
      serviceId: string
      serviceName: string
      quantity: number
      resetPeriod: 'monthly' | 'quarterly' | 'annual'
    }[]
    includedProducts: {
      productId: string
      productName: string
      discountPercentage: number
    }[]
    perks: string[] // Priority booking, exclusive events, etc.
  }
  
  // Terms
  minimumTerm?: number // Minimum months
  cancellationPolicy: string
  
  // Status
  active: boolean
  acceptingNewMembers: boolean
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

// Gift Card Types
export interface GiftCard {
  id: string
  code: string
  
  // Value
  originalValue: number
  currentBalance: number
  
  // Purchaser
  purchaserId?: string
  purchaserName: string
  purchaserEmail: string
  
  // Recipient
  recipientName?: string
  recipientEmail?: string
  recipientMessage?: string
  
  // Dates
  purchaseDate: Date
  activationDate?: Date
  expirationDate?: Date
  scheduledDate?: Date

  // Status
  status: 'active' | 'depleted' | 'expired' | 'cancelled' | 'pending'

  // Delivery/Design
  design?: string
  
  // Transactions
  transactions: GiftCardTransaction[]
}

export interface GiftCardTransaction {
  id: string
  date: Date
  type: 'purchase' | 'redemption' | 'refund' | 'adjustment'
  amount: number
  balance: number
  invoiceId?: string
  notes?: string
  processedBy: string
}

// Product/Inventory Types for Medical Spa
export interface Product {
  id: string
  name: string
  category: 'skincare' | 'injectable' | 'supplement' | 'device' | 'other'
  brand?: string
  sku?: string
  
  // Pricing
  cost: number
  retailPrice: number
  salePrice?: number
  
  // For Injectables
  injectableDetails?: {
    type: 'neurotoxin' | 'filler' | 'biostimulator'
    manufacturer: string
    concentration?: string
    unitType: 'unit' | 'syringe' | 'vial' | 'ml'
    unitsPerPackage: number
  }
  
  // Inventory
  trackInventory: boolean
  currentStock?: number
  reorderPoint?: number
  reorderQuantity?: number
  
  // Commission
  commissionable: boolean
  commissionRate?: number
  
  // Status
  active: boolean
  availableOnline: boolean
  
  // Metadata
  description?: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

// Receipt Customization
export interface ReceiptSettings {
  // Header
  showLogo: boolean
  logoUrl?: string
  headerText?: string
  
  // Content
  showServiceDetails: boolean
  showPractitioner: boolean
  showLocation: boolean
  showPaymentMethod: boolean
  showBalance: boolean
  showNextAppointments: boolean
  showTaxBreakdown: boolean
  
  // Footer
  footerMessage?: string
  showCancellationPolicy: boolean
  showWebsite: boolean
  showSocialMedia: boolean
  
  // Format
  paperSize: 'letter' | 'A4' | 'thermal'
  fontSize: 'small' | 'medium' | 'large'
}

// Financial Reports
export interface DailySummary {
  date: Date
  
  // Revenue
  totalRevenue: number
  serviceRevenue: number
  productRevenue: number
  packageRevenue: number
  membershipRevenue: number
  
  // Payments
  cashPayments: number
  cardPayments: number
  otherPayments: number
  
  // Counts
  appointmentCount: number
  newPatientCount: number
  productsSold: number
  
  // By Practitioner
  practitionerRevenue: {
    practitionerId: string
    practitionerName: string
    revenue: number
    appointmentCount: number
  }[]
}

// Search and Filter Types
export interface InvoiceSearchParams {
  query?: string
  patientId?: string
  practitionerId?: string
  status?: Invoice['status']
  dateRange?: {
    start: Date
    end: Date
  }
  amountRange?: {
    min: number
    max: number
  }
  hasBalance?: boolean
  paymentMethod?: PaymentMethod
  sortBy?: 'date' | 'number' | 'amount' | 'patient'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Quick Actions
export interface QuickInvoiceCreate {
  patientId: string
  items: {
    type: 'service' | 'product'
    id: string
    quantity: number
    customPrice?: number
  }[]
  discount?: {
    type: 'percentage' | 'fixed'
    value: number
  }
  notes?: string
  sendReceipt: boolean
}