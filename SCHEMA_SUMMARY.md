# Billing & Payments Prisma Schema - Summary

## What Was Added

I've successfully created comprehensive Prisma models for the billing and payments system based on the backend API routes. The schema is now ready for migration.

## Models Added (13 New Models)

### Packages (4 Models)
1. **Package** - Service package definitions
2. **PackageItem** - Items included in packages
3. **PackagePurchase** - Patient package purchases
4. **PackagePurchaseItem** - Individual items in purchased packages with usage tracking
5. **PackageRedemption** - Redemption history for package services

### Memberships (3 Models)
6. **MembershipTier** - Membership tier definitions (Bronze, Silver, Gold, Platinum, VIP)
7. **PatientMembership** - Patient membership enrollments with billing cycles
8. **BenefitRedemption** - Redemption of membership included services

### Gift Cards (2 Models)
9. **GiftCard** - Gift card records with balances
10. **GiftCardTransaction** - Complete transaction history for gift cards

### Credits (2 Models)
11. **Credit** - Patient credit balances (referrals, promotions, refunds)
12. **CreditTransaction** - Credit issuance and redemption history

### Invoices & Payments (2 Models)
13. **InvoiceLineItem** - Detailed line items for invoices with discounts, taxes, lot tracking
14. **PaymentRefund** - Refund tracking linked to payments

## Enhanced Existing Models

### Invoice (Enhanced)
- Added `invoiceNumber` (unique identifier)
- Added provider and location tracking
- Added detailed date tracking (invoiceDate, serviceDate, sentAt, cancelledAt, voidedAt)
- Added calculated totals (subtotal, taxTotal, discountTotal, amountPaid, balance)
- Added internal/patient notes
- Added audit fields (createdBy, voidedBy)
- Enhanced status enum (added VIEWED, PARTIALLY_PAID, REFUNDED)

### Payment (Enhanced)
- Added `method` field for payment type tracking
- Added JSON fields for method-specific details (cardDetails, checkDetails, giftCardDetails, financingDetails)
- Added Stripe customer ID field
- Added audit fields (processedAt, processedBy, notes)
- Added transaction reference tracking
- Added relation to PaymentRefund

## Enums Added (13 New Enums)

1. **PackageItemType** - SERVICE, PRODUCT
2. **PackagePurchaseStatus** - ACTIVE, PARTIALLY_USED, FULLY_USED, EXPIRED, CANCELLED, REFUNDED
3. **MembershipLevel** - BRONZE, SILVER, GOLD, PLATINUM, VIP
4. **BillingCycle** - MONTHLY, QUARTERLY, ANNUAL
5. **MembershipStatus** - ACTIVE, PAUSED, CANCELLED, PAST_DUE, EXPIRED
6. **GiftCardStatus** - PENDING, ACTIVE, PARTIALLY_USED, DEPLETED, EXPIRED, CANCELLED
7. **GiftCardTransactionType** - PURCHASE, REDEMPTION, REFUND, ADJUSTMENT, EXPIRATION
8. **CreditType** - GENERAL, REFERRAL, PROMOTIONAL, REFUND, ADJUSTMENT
9. **CreditSource** - REFERRAL, PROMOTION, REFUND, PACKAGE_CANCELLATION, ADJUSTMENT, LOYALTY
10. **CreditTransactionType** - ISSUED, REDEEMED, EXPIRED, REFUNDED, ADJUSTED
11. **DiscountType** - PERCENTAGE, FIXED
12. **RefundStatus** - PENDING, COMPLETED, FAILED
13. **InvoiceStatus** (enhanced) - Added VIEWED, PARTIALLY_PAID, REFUNDED

## Key Features

### Stripe Integration
All necessary Stripe fields are included:
- `stripePaymentIntentId` on Payment
- `stripeChargeId` on Payment
- `stripeCustomerId` on Payment and PaymentMethod
- `stripePaymentMethodId` on PaymentMethod

### Multiple Payment Methods
The system supports:
- Cash
- Credit/Debit Card (via Stripe)
- Check
- Gift Card
- Package Credit
- Financing (CareCredit, Cherry, Affirm)

### Complete Audit Trail
All transaction models include:
- `processedAt` timestamp
- `processedBy` user ID
- Optional notes field

### Transaction History
Each monetary model maintains complete transaction histories:
- GiftCard → GiftCardTransaction
- Credit → CreditTransaction
- Payment → PaymentRefund
- PackagePurchaseItem → PackageRedemption

### Advanced Features
- **Lot Tracking** - For injectables on invoice line items
- **Unit Types** - Support for units, syringes, vials, ml
- **Flexible Discounts** - Percentage or fixed amount per line item
- **Package Restrictions** - JSON field for complex rules (specific providers, locations, blackout dates)
- **Membership Benefits** - JSON field for included services with usage tracking
- **Scheduled Delivery** - Gift cards can be scheduled for future delivery
- **Expiration Tracking** - Gift cards and credits support expiration dates

## Indexes

All models include strategic indexes for:
- Foreign keys (patientId, invoiceId, packageId, etc.)
- Status fields (for filtering)
- Date fields (for sorting and range queries)
- Unique identifiers (codes, invoice numbers)
- Common query patterns

## File Locations

- **Schema**: `/Users/daminirijhwani/medical-spa-platform/apps/admin/prisma/schema.prisma`
- **Documentation**: `/Users/daminirijhwani/medical-spa-platform/BILLING_PAYMENTS_SCHEMA.md`
- **This Summary**: `/Users/daminirijhwani/medical-spa-platform/SCHEMA_SUMMARY.md`

## Next Steps

To apply these changes to the database:

```bash
cd /Users/daminirijhwani/medical-spa-platform/apps/admin

# Create and apply migration
npx prisma migrate dev --name add_billing_payment_models

# Generate Prisma client
npx prisma generate
```

## Backend API Route Coverage

The schema models were designed to support all routes found in:
- `/backend/src/routes/payments.ts` - Full payment processing, refunds, validation
- `/backend/src/routes/invoices.ts` - Invoice CRUD, line items, PDF generation
- `/backend/src/routes/packages.ts` - Package management, purchases, redemptions
- `/backend/src/routes/memberships.ts` - Tier management, enrollment, benefits
- `/backend/src/routes/gift-cards.ts` - Gift card lifecycle, transactions, delivery

All field names, enums, and relationships match the TypeScript interfaces used in these route files.
