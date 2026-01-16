# Billing & Payments Prisma Schema Documentation

This document outlines the comprehensive Prisma models added for billing, payments, packages, memberships, gift cards, and credits.

## Overview

The billing and payments schema has been designed based on the backend API routes to support:

- **Invoice Management** with line items, discounts, and taxes
- **Flexible Payment Processing** with multiple payment methods (Stripe, cash, check, gift cards, financing)
- **Service Packages** with purchase, redemption, and usage tracking
- **Membership Tiers** with recurring billing and benefits
- **Gift Cards** with full transaction history
- **Patient Credits** for referrals, promotions, and refunds
- **Payment Refunds** with full audit trail

## Models Added

### 1. Invoice & Invoice Line Items

**Invoice** (Enhanced existing model)
- Added `invoiceNumber` (unique)
- Added provider and location tracking
- Added detailed date tracking (invoiceDate, serviceDate, sentAt, cancelledAt, voidedAt)
- Added calculated totals (subtotal, taxTotal, discountTotal, amountPaid, balance)
- Added internal/patient notes
- Added audit fields (createdBy, voidedBy)

**InvoiceLineItem** (New)
```prisma
model InvoiceLineItem {
  id             String
  invoiceId      String
  type           InvoiceItemType
  itemId         String?
  name           String
  description    String?
  quantity       Int
  unitPrice      Float
  unitType       String?        // For injectables: 'unit', 'syringe', 'vial', 'ml'
  lotNumber      String?        // Lot tracking for injectables
  discountType   DiscountType?  // PERCENTAGE or FIXED
  discountValue  Float?
  discountAmount Float
  taxRate        Float
  taxAmount      Float
  lineTotal      Float
  providerId     String?
}
```

**Key Features:**
- Support for injectables with unit types and lot numbers
- Flexible discount system (percentage or fixed)
- Per-line tax calculation
- Provider tracking for compensation

### 2. Payment & Refunds

**Payment** (Enhanced existing model)
- Added `method` field for payment type tracking
- Added JSON fields for method-specific details:
  - `cardDetails` - { last4, brand, expiryMonth, expiryYear }
  - `checkDetails` - { checkNumber, bankName }
  - `giftCardDetails` - { giftCardId, giftCardCode }
  - `financingDetails` - { provider, applicationId, approvalCode }
- Added Stripe fields (stripeCustomerId)
- Added audit fields (processedAt, processedBy, notes)
- Added transaction reference tracking

**PaymentRefund** (New)
```prisma
model PaymentRefund {
  id            String
  paymentId     String
  amount        Float
  reason        String
  status        RefundStatus  // PENDING, COMPLETED, FAILED
  transactionId String?
  processedAt   DateTime?
  processedBy   String
}
```

**Supported Payment Methods:**
- Cash
- Credit/Debit Card (via Stripe)
- Check
- Gift Card
- Package Credit
- Financing (CareCredit, Cherry, Affirm)

### 3. Packages

**Package** (New)
```prisma
model Package {
  id                    String
  name                  String
  description           String?
  category              String?
  imageUrl              String?
  regularPrice          Float
  salePrice             Float
  savings               Float
  savingsPercent        Int
  validityDays          Int
  restrictions          Json      // { specificProviders, specificLocations, blackoutDates, shareable, transferable, maxRedemptionsPerVisit }
  isActive              Boolean
  availableForPurchase  Boolean
  displayOrder          Int
}
```

**PackagePurchase** (New)
- Tracks patient package purchases
- Manages validity periods
- Links to invoices and payments
- Status: ACTIVE, PARTIALLY_USED, FULLY_USED, EXPIRED, CANCELLED, REFUNDED

**PackagePurchaseItem** (New)
- Tracks individual items in a purchased package
- Manages quantity total, used, and remaining
- Links to redemptions

**PackageRedemption** (New)
- Records each time a package service is redeemed
- Links to appointments and invoices
- Full audit trail (redeemedAt, redeemedBy)

### 4. Memberships

**MembershipTier** (New)
```prisma
model MembershipTier {
  id                      String
  name                    String
  description             String?
  tier                    MembershipLevel  // BRONZE, SILVER, GOLD, PLATINUM, VIP
  imageUrl                String?
  billingCycle            BillingCycle     // MONTHLY, QUARTERLY, ANNUAL
  price                   Float
  setupFee                Float
  benefits                Json  // { discountPercentage, includedServices[], productDiscount, priorityBooking, guestPasses, perks[] }
  minimumTermMonths       Int
  cancellationNoticeDays  Int
  isActive                Boolean
  acceptingNewMembers     Boolean
  displayOrder            Int
}
```

**PatientMembership** (New)
```prisma
model PatientMembership {
  id                    String
  patientId             String
  tierId                String
  tierName              String
  enrolledAt            DateTime
  currentPeriodStart    DateTime
  currentPeriodEnd      DateTime
  nextBillingDate       DateTime?
  status                MembershipStatus  // ACTIVE, PAUSED, CANCELLED, PAST_DUE, EXPIRED
  pausedAt              DateTime?
  resumeAt              DateTime?
  cancelledAt           DateTime?
  currentPeriodBenefits Json  // Array of { serviceId, serviceName, quantityIncluded, quantityUsed, quantityRemaining }
  paymentMethodId       String?
  lastPaymentDate       DateTime?
  lastPaymentAmount     Float?
}
```

**BenefitRedemption** (New)
- Tracks redemption of membership included services
- Links to memberships, patients, and appointments

### 5. Gift Cards

**GiftCard** (New)
```prisma
model GiftCard {
  id                    String
  code                  String  @unique    // Format: GC-XXXX-XXXX-XXXX
  originalValue         Float
  currentBalance        Float
  purchaserId           String?
  purchaserName         String
  purchaserEmail        String
  recipientName         String?
  recipientEmail        String?
  recipientMessage      String?
  purchaseDate          DateTime
  activationDate        DateTime?
  expirationDate        DateTime?
  scheduledDeliveryDate DateTime?
  status                GiftCardStatus  // PENDING, ACTIVE, PARTIALLY_USED, DEPLETED, EXPIRED, CANCELLED
  designTemplate        String?
}
```

**GiftCardTransaction** (New)
```prisma
model GiftCardTransaction {
  id            String
  giftCardId    String
  type          GiftCardTransactionType  // PURCHASE, REDEMPTION, REFUND, ADJUSTMENT, EXPIRATION
  amount        Float                     // Positive for purchase/refund, negative for redemption
  balanceAfter  Float
  invoiceId     String?
  paymentId     String?
  notes         String?
  processedAt   DateTime
  processedBy   String
}
```

**Key Features:**
- Unique gift card codes
- Support for scheduled delivery
- Full transaction history
- Balance tracking
- Email recipient support

### 6. Credits

**Credit** (New)
```prisma
model Credit {
  id            String
  patientId     String
  type          CreditType     // GENERAL, REFERRAL, PROMOTIONAL, REFUND, ADJUSTMENT
  amount        Float
  balance       Float
  source        CreditSource   // REFERRAL, PROMOTION, REFUND, PACKAGE_CANCELLATION, ADJUSTMENT, LOYALTY
  referenceId   String?        // Invoice ID, referral ID, etc.
  description   String?
  expiresAt     DateTime?
  isActive      Boolean
}
```

**CreditTransaction** (New)
```prisma
model CreditTransaction {
  id            String
  creditId      String
  type          CreditTransactionType  // ISSUED, REDEEMED, EXPIRED, REFUNDED, ADJUSTED
  amount        Float                   // Positive for credit, negative for redemption
  balanceAfter  Float
  invoiceId     String?
  paymentId     String?
  notes         String?
  processedAt   DateTime
  processedBy   String
}
```

**Key Features:**
- Multiple credit types and sources
- Expiration tracking
- Full transaction history
- Reference tracking to originating events

## Enums Added/Updated

### New Enums

```prisma
enum PackageItemType {
  SERVICE
  PRODUCT
}

enum PackagePurchaseStatus {
  ACTIVE
  PARTIALLY_USED
  FULLY_USED
  EXPIRED
  CANCELLED
  REFUNDED
}

enum MembershipLevel {
  BRONZE
  SILVER
  GOLD
  PLATINUM
  VIP
}

enum BillingCycle {
  MONTHLY
  QUARTERLY
  ANNUAL
}

enum MembershipStatus {
  ACTIVE
  PAUSED
  CANCELLED
  PAST_DUE
  EXPIRED
}

enum GiftCardStatus {
  PENDING
  ACTIVE
  PARTIALLY_USED
  DEPLETED
  EXPIRED
  CANCELLED
}

enum GiftCardTransactionType {
  PURCHASE
  REDEMPTION
  REFUND
  ADJUSTMENT
  EXPIRATION
}

enum CreditType {
  GENERAL
  REFERRAL
  PROMOTIONAL
  REFUND
  ADJUSTMENT
}

enum CreditSource {
  REFERRAL
  PROMOTION
  REFUND
  PACKAGE_CANCELLATION
  ADJUSTMENT
  LOYALTY
}

enum CreditTransactionType {
  ISSUED
  REDEEMED
  EXPIRED
  REFUNDED
  ADJUSTED
}

enum DiscountType {
  PERCENTAGE
  FIXED
}

enum RefundStatus {
  PENDING
  COMPLETED
  FAILED
}
```

### Updated Enums

```prisma
enum InvoiceStatus {
  DRAFT
  SENT
  VIEWED           // New
  PAID
  PARTIALLY_PAID   // New
  OVERDUE
  CANCELLED
  REFUNDED         // New
}
```

## Stripe Integration Fields

The schema includes comprehensive Stripe integration support:

### Payment Model
- `stripePaymentIntentId` - Stripe Payment Intent ID
- `stripeChargeId` - Stripe Charge ID
- `stripeCustomerId` - Stripe Customer ID

### PaymentMethod Model
- `stripePaymentMethodId` - Stripe Payment Method ID
- `stripeCustomerId` - Stripe Customer ID
- Card details (cardBrand, cardLast4, cardExpMonth, cardExpYear)

## Indexes

All models include appropriate indexes for:
- Foreign keys (patientId, invoiceId, etc.)
- Status fields for filtering
- Date fields for sorting and range queries
- Unique identifiers (codes, invoice numbers)
- Common query patterns

## Key Relationships

```
Patient
  ├── Payments
  ├── Invoices
  │   ├── InvoiceLineItems
  │   └── Payments
  ├── PackagePurchases
  │   ├── PackagePurchaseItems
  │   │   └── PackageRedemptions
  ├── PatientMemberships
  │   └── BenefitRedemptions
  ├── Credits
  │   └── CreditTransactions
  └── PaymentMethods

GiftCard
  └── GiftCardTransactions

Payment
  └── PaymentRefunds
```

## Usage Examples

### Creating an Invoice with Line Items

```typescript
const invoice = await prisma.invoice.create({
  data: {
    invoiceNumber: 'INV-2024-0001',
    patientId: patient.id,
    invoiceDate: new Date(),
    dueDate: addDays(new Date(), 14),
    subtotal: 500,
    taxTotal: 40,
    discountTotal: 50,
    total: 490,
    balance: 490,
    status: 'DRAFT',
    createdBy: user.id,
    lineItems: {
      create: [
        {
          type: 'SERVICE',
          name: 'Botox Treatment',
          quantity: 20,
          unitPrice: 15,
          unitType: 'unit',
          lotNumber: 'LOT-2024-001',
          taxRate: 8.25,
          taxAmount: 24.75,
          lineTotal: 324.75
        }
      ]
    }
  }
})
```

### Processing a Payment

```typescript
const payment = await prisma.payment.create({
  data: {
    patientId: patient.id,
    invoiceId: invoice.id,
    amount: 490,
    method: 'credit_card',
    cardDetails: {
      last4: '4242',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2025
    },
    stripePaymentIntentId: 'pi_xxx',
    status: 'SUCCEEDED',
    processedBy: user.id
  }
})

// Update invoice
await prisma.invoice.update({
  where: { id: invoice.id },
  data: {
    amountPaid: 490,
    balance: 0,
    status: 'PAID',
    paidAt: new Date()
  }
})
```

### Redeeming a Package Service

```typescript
const redemption = await prisma.packageRedemption.create({
  data: {
    purchaseItemId: purchaseItem.id,
    itemId: service.id,
    quantity: 1,
    appointmentId: appointment.id,
    redeemedBy: user.id
  }
})

// Update package item quantities
await prisma.packagePurchaseItem.update({
  where: { id: purchaseItem.id },
  data: {
    quantityUsed: { increment: 1 },
    quantityRemaining: { decrement: 1 }
  }
})
```

### Gift Card Transaction

```typescript
const transaction = await prisma.giftCardTransaction.create({
  data: {
    giftCardId: giftCard.id,
    type: 'REDEMPTION',
    amount: -100,
    balanceAfter: giftCard.currentBalance - 100,
    invoiceId: invoice.id,
    processedBy: user.id
  }
})

await prisma.giftCard.update({
  where: { id: giftCard.id },
  data: {
    currentBalance: { decrement: 100 },
    status: 'PARTIALLY_USED'
  }
})
```

## Migration

To apply these schema changes:

```bash
cd /Users/daminirijhwani/medical-spa-platform/apps/admin
npx prisma migrate dev --name add_billing_payment_models
npx prisma generate
```

## Notes

1. **JSON Fields**: Several fields use JSON to store complex objects (restrictions, benefits, etc.). In production, consider normalizing these if you need to query by specific attributes.

2. **Audit Trail**: All transaction models include `processedBy` and `processedAt` fields for complete audit logging.

3. **Soft Deletes**: Packages and memberships use status flags (isActive, acceptingNewMembers) rather than hard deletes to preserve historical data.

4. **Balance Tracking**: Gift cards and credits maintain both `amount` (original) and `balance` (current) fields.

5. **Transaction History**: All monetary models maintain complete transaction histories via separate transaction tables.

6. **Stripe Integration**: Payment processing is Stripe-ready with all necessary ID fields for tracking payment intents, charges, and customers.
