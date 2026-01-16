# Billing & Payments Schema - Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BILLING & PAYMENTS SYSTEM                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Patient    │
└──────┬───────┘
       │
       ├─────────────────────────────────────────────────────────────┐
       │                                                             │
       ▼                                                             ▼
┌─────────────────┐                                         ┌──────────────┐
│  PaymentMethod  │                                         │    Credit    │
│  ─────────────  │                                         │  ──────────  │
│  type           │                                         │  type        │
│  stripePaymentMethodId                                    │  source      │
│  cardBrand      │                                         │  amount      │
│  cardLast4      │                                         │  balance     │
│  isDefault      │                                         │  expiresAt   │
└─────────────────┘                                         └──────┬───────┘
       │                                                           │
       │                                                           ▼
       │                                                    ┌──────────────────┐
       │                                                    │ CreditTransaction│
       │                                                    │  ──────────────  │
       │                                                    │  type            │
       │                                                    │  amount          │
       │                                                    │  balanceAfter    │
       │                                                    │  invoiceId       │
       │                                                    │  processedBy     │
       │                                                    └──────────────────┘
       │
       ▼
┌─────────────────┐         ┌──────────────────┐
│    Invoice      │◄────────│ InvoiceLineItem  │
│  ─────────────  │         │  ──────────────  │
│  invoiceNumber  │         │  type            │
│  invoiceDate    │         │  name            │
│  dueDate        │         │  quantity        │
│  subtotal       │         │  unitPrice       │
│  taxTotal       │         │  unitType        │
│  discountTotal  │         │  lotNumber       │
│  total          │         │  discountType    │
│  amountPaid     │         │  discountValue   │
│  balance        │         │  taxRate         │
│  status         │         │  lineTotal       │
│  providerId     │         │  providerId      │
└────────┬────────┘         └──────────────────┘
         │
         ▼
┌─────────────────┐         ┌──────────────────┐
│    Payment      │◄────────│  PaymentRefund   │
│  ─────────────  │         │  ──────────────  │
│  amount         │         │  amount          │
│  method         │         │  reason          │
│  status         │         │  status          │
│  cardDetails    │         │  transactionId   │
│  checkDetails   │         │  processedAt     │
│  giftCardDetails│         │  processedBy     │
│  financingDetails         └──────────────────┘
│  stripePaymentIntentId
│  stripeChargeId
│  stripeCustomerId
│  refundedAmount
│  processedBy    │
└─────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│                              PACKAGES SYSTEM                                  │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   Package    │
│  ──────────  │
│  name        │
│  regularPrice│
│  salePrice   │
│  savings     │
│  validityDays│
│  restrictions│ (JSON)
│  isActive    │
└──────┬───────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌──────────────┐   ┌────────────────┐
│ PackageItem  │   │PackagePurchase │
│  ──────────  │   │  ────────────  │
│  type        │   │  patientId     │
│  itemName    │   │  packageName   │
│  quantity    │   │  purchasePrice │
│  unitValue   │   │  validFrom     │
└──────────────┘   │  validUntil    │
                   │  status        │
                   └────────┬───────┘
                            │
                            ▼
                   ┌────────────────────┐
                   │PackagePurchaseItem │
                   │  ────────────────  │
                   │  itemName          │
                   │  quantityTotal     │
                   │  quantityUsed      │
                   │  quantityRemaining │
                   └────────┬───────────┘
                            │
                            ▼
                   ┌────────────────────┐
                   │PackageRedemption   │
                   │  ────────────────  │
                   │  quantity          │
                   │  appointmentId     │
                   │  invoiceId         │
                   │  redeemedAt        │
                   │  redeemedBy        │
                   └────────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│                           MEMBERSHIPS SYSTEM                                  │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ MembershipTier  │
│  ─────────────  │
│  name           │
│  tier           │ (BRONZE, SILVER, GOLD, PLATINUM, VIP)
│  billingCycle   │ (MONTHLY, QUARTERLY, ANNUAL)
│  price          │
│  setupFee       │
│  benefits       │ (JSON)
│  minimumTermMonths
│  isActive       │
└────────┬────────┘
         │
         ▼
┌──────────────────┐         ┌────────────────────┐
│PatientMembership │◄────────│ BenefitRedemption  │
│  ──────────────  │         │  ────────────────  │
│  patientId       │         │  membershipId      │
│  tierName        │         │  patientId         │
│  enrolledAt      │         │  serviceId         │
│  currentPeriodStart        │  serviceName       │
│  currentPeriodEnd          │  appointmentId     │
│  nextBillingDate│          │  redeemedAt        │
│  status          │         │  redeemedBy        │
│  pausedAt        │         └────────────────────┘
│  cancelledAt     │
│  currentPeriodBenefits (JSON)
│  paymentMethodId │
│  lastPaymentDate │
└──────────────────┘


┌──────────────────────────────────────────────────────────────────────────────┐
│                            GIFT CARDS SYSTEM                                  │
└──────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│    GiftCard     │
│  ─────────────  │
│  code           │ (unique: GC-XXXX-XXXX-XXXX)
│  originalValue  │
│  currentBalance │
│  purchaserName  │
│  purchaserEmail │
│  recipientName  │
│  recipientEmail │
│  recipientMessage
│  purchaseDate   │
│  activationDate │
│  expirationDate │
│  scheduledDeliveryDate
│  status         │
│  designTemplate │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│ GiftCardTransaction  │
│  ──────────────────  │
│  type                │ (PURCHASE, REDEMPTION, REFUND, ADJUSTMENT, EXPIRATION)
│  amount              │ (+ for purchase/refund, - for redemption)
│  balanceAfter        │
│  invoiceId           │
│  paymentId           │
│  notes               │
│  processedAt         │
│  processedBy         │
└──────────────────────┘


═══════════════════════════════════════════════════════════════════════════════

                              PAYMENT FLOW EXAMPLE

Patient ──► Invoice ──► InvoiceLineItem
             │              (Botox 20 units @ $15/unit)
             │              (Consultation @ $50)
             │              (Taxes calculated)
             │              (Discounts applied)
             │
             ├──► Total: $490
             │
             ▼
         Payment ──► method: 'credit_card'
             │       cardDetails: { last4: '4242', brand: 'visa' }
             │       stripePaymentIntentId: 'pi_xxx'
             │       status: 'SUCCEEDED'
             │       amount: $490
             │
             └──► Invoice.amountPaid = $490
                  Invoice.balance = $0
                  Invoice.status = 'PAID'


═══════════════════════════════════════════════════════════════════════════════

                         PACKAGE REDEMPTION FLOW EXAMPLE

Patient ──► PackagePurchase (Botox Starter Package)
                │
                ├──► PackagePurchaseItem: Botox Consultation (1/1 remaining)
                │    └──► PackageRedemption
                │             └──► Appointment (used 1, 0 remaining)
                │
                └──► PackagePurchaseItem: Botox Treatment (2/2 remaining)
                     └──► PackageRedemption
                              └──► Appointment (used 1, 1 remaining)


═══════════════════════════════════════════════════════════════════════════════

                        MEMBERSHIP BENEFIT FLOW EXAMPLE

PatientMembership (Gold Tier - Monthly $349)
    │
    ├──► currentPeriodBenefits: [
    │        { serviceId: 'facial', quantityIncluded: 2, quantityUsed: 1, quantityRemaining: 1 }
    │        { serviceId: 'peel', quantityIncluded: 1, quantityUsed: 0, quantityRemaining: 1 }
    │    ]
    │
    └──► BenefitRedemption
              └──► serviceId: 'facial'
                   appointmentId: 'apt-001'
                   (quantityUsed incremented, quantityRemaining decremented)


═══════════════════════════════════════════════════════════════════════════════

                           GIFT CARD FLOW EXAMPLE

GiftCard (Code: GC-ABC1-DEF2-GHI3, Balance: $200)
    │
    ├──► GiftCardTransaction (PURCHASE, +$200, balance: $200)
    │
    ├──► GiftCardTransaction (REDEMPTION, -$100, balance: $100)
    │    └──► Applied to Invoice #123
    │
    └──► GiftCardTransaction (REDEMPTION, -$100, balance: $0)
         └──► Applied to Invoice #456
         Status changed to DEPLETED


═══════════════════════════════════════════════════════════════════════════════

                             CREDIT FLOW EXAMPLE

Credit (Type: REFERRAL, Source: REFERRAL, Amount: $50)
    │
    ├──► CreditTransaction (ISSUED, +$50, balance: $50)
    │    └──► referenceId: referral-001
    │
    └──► CreditTransaction (REDEEMED, -$25, balance: $25)
         └──► Applied to Invoice #789

```

## Key Design Principles

### 1. Immutable Transaction History
All transactions (payments, refunds, gift cards, credits, package redemptions) are stored as separate records, never modified. This provides:
- Complete audit trail
- Easy reconciliation
- Historical accuracy
- Compliance with financial regulations

### 2. Balance Tracking
Entities that have balances (Gift Cards, Credits) maintain both:
- `amount` - Original/total amount
- `balance` - Current available balance
- Transaction history calculates balances over time

### 3. Status Transitions
All entities follow clear status state machines:
- **Invoices**: DRAFT → SENT → VIEWED → PARTIALLY_PAID → PAID
- **Payments**: PENDING → PROCESSING → SUCCEEDED
- **Packages**: ACTIVE → PARTIALLY_USED → FULLY_USED
- **Memberships**: ACTIVE ↔ PAUSED → CANCELLED
- **Gift Cards**: PENDING → ACTIVE → PARTIALLY_USED → DEPLETED

### 4. Flexible Data with JSON
Complex, nested data uses JSON fields:
- Package restrictions (providers, locations, blackout dates)
- Membership benefits (services, discounts, perks)
- Payment method details (card info, check info, financing)
- Membership period benefits (usage tracking)

### 5. Comprehensive Indexing
All foreign keys and frequently queried fields are indexed:
- patientId, invoiceId, etc.
- Status fields
- Date fields
- Unique codes/numbers

### 6. Audit Fields
Every transaction includes:
- `processedAt` - When it occurred
- `processedBy` - Who performed it
- `notes` - Optional context

### 7. Stripe Integration
Full Stripe support with ID fields at every level:
- Payment Intent ID
- Charge ID
- Customer ID
- Payment Method ID
