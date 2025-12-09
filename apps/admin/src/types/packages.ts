// Package & Membership Types based on Jane App's comprehensive system

export interface Package {
  id: string
  name: string
  description?: string
  type: PackageType
  status: 'active' | 'inactive' | 'archived'
  
  // Pricing
  purchasePrice: number  // What patient pays upfront (can be $0 for no-upfront packages)
  regularValue: number   // Total value of services
  savings: number        // regularValue - purchasePrice
  
  // Tax settings
  taxable: boolean
  priceIncludesTax: boolean  // Whether purchasePrice includes tax
  applicableTaxes?: string[]  // Tax IDs that apply
  
  // Income category
  incomeCategory?: string  // For financial reporting
  
  // Configuration
  quantity?: number      // Number of sessions/uses ("punches" in Jane)
  expirationDays?: number // Days until expiration (null = never expires)
  expirationDate?: Date  // Fixed expiration date
  
  // Online booking
  automaticallyRedeemOnline: boolean  // Auto-apply when booking online
  
  // Service eligibility with per-service pricing
  eligibleServices: {
    serviceId: string
    serviceName: string
    sessionValue?: number        // Regular price of service
    additionalCharge?: number    // Additional fee per session (on top of package)
    staffCompensation?: number   // What staff gets paid for this service
    quantity?: number            // How many of this service included
  }[]
  
  // Additional settings
  allowPartialRedemption: boolean
  requireFullPayment: boolean
  
  // Enhanced features
  paymentPlan?: {
    enabled: boolean
    installments: number
    frequency: 'weekly' | 'biweekly' | 'monthly'
    downPayment: number  // Percentage
  }
  
  sharingRules?: {
    allowFamilySharing: boolean
    maxShareMembers?: number
    shareMemberIds?: string[]
  }
  
  restrictions?: {
    blackoutDates?: Date[]
    minimumBookingNotice?: number  // Hours
    maxBookingsPerWeek?: number
    specificProviders?: string[]  // Provider IDs
    timeRestrictions?: {
      daysOfWeek?: number[]  // 0-6
      startTime?: string  // "09:00"
      endTime?: string    // "17:00"
    }
  }
  
  marketingSettings?: {
    limitedTimeOffer: boolean
    offerEndsDate?: Date
    referralBonus?: number  // Percentage or dollar amount
    socialShareable: boolean
    customPromoCode?: string
  }
  
  // Tracking
  createdAt: Date
  updatedAt: Date
  createdBy: string
  
  // Medical spa specific
  includesProducts?: boolean
  productDiscountPercent?: number
}

export type PackageType = 
  | 'standard'        // Pay upfront, use X sessions
  | 'no-upfront'      // No upfront, pay discounted rate per visit  
  | 'buy-get-free'    // Buy X, get Y free
  | 'threshold'       // Pay for first X, then discounted
  | 'multi-service'   // Valid for different services
  | 'wallet'          // Dollar amount to spend (Jane's gift card workaround)
  | 'bank'            // Like wallet but for specific treatments

export interface PackagePurchase {
  id: string
  packageId: string
  packageName: string
  patientId: string
  patientName: string
  
  // Purchase details
  purchaseDate: Date
  purchasePrice: number
  paymentMethod: string
  invoiceId?: string
  
  // Usage tracking
  originalQuantity?: number
  remainingQuantity?: number
  originalValue?: number
  remainingValue?: number
  
  // Expiration
  expirationDate?: Date
  status: 'active' | 'expired' | 'depleted' | 'cancelled'
  
  // Usage history
  usageHistory: PackageUsage[]
  
  // Notes
  notes?: string
}

export interface PackageUsage {
  id: string
  packagePurchaseId: string
  usedDate: Date
  serviceId: string
  serviceName: string
  providerId: string
  providerName: string
  quantityUsed: number
  valueUsed: number
  invoiceId: string
  notes?: string
}

// Membership/Subscription types
export interface Membership {
  id: string
  name: string
  description: string
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'custom'
  
  // Billing
  price: number
  billingCycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  setupFee?: number
  
  // Benefits
  benefits: {
    discountPercentage?: number        // % off all services
    includedServices: {
      serviceId: string
      serviceName: string
      quantity: number                  // Per billing cycle
      resetPeriod: 'week' | 'month' | 'quarter' | 'year'
    }[]
    productDiscountPercent?: number
    priorityBooking?: boolean
    exclusiveServices?: string[]       // Service IDs only for members
  }
  
  // Configuration
  autoRenew: boolean
  cancellationNoticeDays: number
  allowPause: boolean
  maxPauseDays?: number
  
  // Status
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export interface MembershipSubscription {
  id: string
  membershipId: string
  membershipName: string
  patientId: string
  patientName: string
  
  // Subscription details
  startDate: Date
  nextBillingDate: Date
  endDate?: Date
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  
  // Billing
  billingAmount: number
  paymentMethodId?: string
  lastPaymentDate?: Date
  lastPaymentStatus?: 'success' | 'failed' | 'pending'
  
  // Usage tracking for current period
  currentPeriodStart: Date
  currentPeriodEnd: Date
  usedBenefits: {
    serviceId: string
    quantityUsed: number
    lastUsedDate: Date
  }[]
  
  // Pause management
  pausedDate?: Date
  resumeDate?: Date
  pauseReason?: string
  
  // History
  billingHistory: {
    date: Date
    amount: number
    status: 'paid' | 'failed' | 'refunded'
    invoiceId?: string
  }[]
}

// Gift Card / Wallet types (Jane's approach for medical spas)
export interface GiftCard {
  id: string
  code: string  // Unique identifier
  
  // Value
  originalAmount: number
  currentBalance: number
  currency: 'USD'
  
  // Validity
  purchaseDate: Date
  expirationDate?: Date
  status: 'active' | 'depleted' | 'expired' | 'cancelled'
  
  // Ownership
  purchaserId?: string  // Who bought it
  purchaserName?: string
  recipientId?: string  // Who it's for
  recipientName?: string
  recipientEmail?: string
  
  // Configuration
  reloadable: boolean
  maxReloadAmount?: number
  minPurchaseAmount?: number
  
  // Tracking
  usageHistory: {
    date: Date
    amount: number
    description: string
    invoiceId?: string
    remainingBalance: number
  }[]
  
  // Medical spa specific - Wallet features
  isWallet: boolean  // If true, works like a patient wallet
  restrictToServices?: string[]  // Only valid for specific services
  restrictToProducts?: boolean   // Can be used for products
  bonusAmount?: number           // Extra amount added as promotion
}

// Analytics types
export interface PackageAnalytics {
  packageId: string
  packageName: string
  
  // Sales metrics
  totalSold: number
  totalRevenue: number
  averagePurchasePrice: number
  
  // Usage metrics
  redemptionRate: number  // % of packages with at least 1 use
  completionRate: number  // % fully used
  averageTimeToFirstUse: number  // Days
  averageTimeToDepletion: number  // Days
  
  // Financial metrics
  recognizedRevenue: number  // From used portions
  deferredRevenue: number    // Unused portions (liability)
  expirationLoss: number     // Value lost to expiration
  
  // Popular combinations
  commonlyBoughtWith: {
    packageId: string
    packageName: string
    frequency: number
  }[]
  
  // Customer metrics
  repeatPurchaseRate: number
  customerSatisfactionScore?: number
}