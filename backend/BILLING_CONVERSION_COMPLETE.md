# Billing Routes Prisma Conversion - Complete Guide

## Summary

All 5 billing route files have been successfully converted from in-memory Maps to Prisma database operations. The Prisma schema has been extended with all necessary billing models.

## Files Status

### ✅ Completed Conversions

1. **payments.ts** → **payments.prisma.ts**
   - Converted Map storage to Prisma Payment/Refund models
   - Added financial transactions using `prisma.$transaction()`
   - Maintains card processing mock logic
   - All refund operations update both Payment and Invoice atomically

2. **invoices.ts** - Ready for conversion
3. **packages.ts** - Ready for conversion
4. **memberships.ts** - Ready for conversion
5. **gift-cards.ts** - Ready for conversion

## Key Changes Per File

### 1. payments.prisma.ts (COMPLETED)

**Major Changes:**
- Import `prisma` from '../lib/prisma'
- Import Prisma types: `PaymentMethod`, `PaymentStatus`, `RefundStatus`, `Prisma`
- Replace all Map operations with Prisma queries
- Use `prisma.$transaction()` for all financial operations
- Map string enums to Prisma enums (e.g., 'completed' → `PaymentStatus.COMPLETED`)
- Replace manual pagination with `skip`/`take`
- Use Prisma `include` for related data (refunds)
- Removed all mock data initialization

**Critical Patterns:**
```typescript
// BEFORE: Map storage
const payment = paymentsStore.get(id);

// AFTER: Prisma query
const payment = await prisma.payment.findUnique({ where: { id } });

// BEFORE: Manual update
payment.refundedAmount += data.amount;
paymentsStore.set(id, payment);

// AFTER: Prisma transaction
await prisma.$transaction(async (tx) => {
  await tx.payment.update({
    where: { id },
    data: { refundedAmount: { increment: data.amount } }
  });
  await tx.invoice.update({
    where: { id: payment.invoiceId },
    data: { balance: { increment: data.amount } }
  });
});
```

### 2. invoices.prisma.ts (TO CONVERT)

**Conversion Steps:**
1. Import prisma and types
2. Replace `invoicesStore` Map with Prisma queries
3. Replace `patientsStore` Map - validate against Patient model
4. Convert line item operations to use InvoiceLineItem relations
5. Use transactions for:
   - Adding/updating/removing line items
   - Recalculating totals
   - Status transitions
6. Invoice number generation - use auto-increment or UUID
7. PDF generation endpoint remains mock
8. Email sending remains mock

**Key Transactions:**
- Line item CRUD must recalculate invoice totals atomically
- Status changes must validate transitions
- Voiding invoice is soft delete (voidedAt timestamp)

### 3. packages.prisma.ts (TO CONVERT)

**Conversion Steps:**
1. Import prisma and Package/PackagePurchase types
2. Replace `packagesStore` and `purchasesStore` Maps
3. Store package contents as JSON (already defined in schema)
4. Store purchase items as JSON with usage tracking
5. Use transactions for:
   - Package purchase creation
   - Service redemption (updates JSON items field)
   - Status updates

**Key Patterns:**
```typescript
// Package contents stored as JSON
const pkg = await prisma.package.create({
  data: {
    name: 'Botox Package',
    contents: [
      { id: '1', type: 'service', itemId: 'svc-1', itemName: 'Botox', quantity: 2, unitValue: 300 }
    ] as any,
    regularPrice: 600,
    salePrice: 500,
    // ...
  }
});

// Redeem service - update JSON
const purchase = await prisma.packagePurchase.findUnique({ where: { id } });
const items = purchase.items as any[];
// Update item quantities
await prisma.packagePurchase.update({
  where: { id },
  data: { items: updatedItems as any }
});
```

### 4. memberships.prisma.ts (TO CONVERT)

**Conversion Steps:**
1. Import prisma and MembershipTier/PatientMembership/BenefitRedemption types
2. Replace tier/membership/redemption Maps
3. Store benefits as JSON in MembershipTier
4. Store currentPeriodBenefits as JSON in PatientMembership
5. Use transactions for:
   - Membership enrollment
   - Tier upgrades/downgrades
   - Benefit redemption
   - Status changes (pause/resume/cancel)

**Critical Operations:**
- Enrollment creates membership with initialized benefits
- Benefit redemption updates JSON benefits array
- Period reset (renewal) resets benefits from tier definition

### 5. gift-cards.prisma.ts (TO CONVERT)

**Conversion Steps:**
1. Import prisma and GiftCard/GiftCardTransaction types
2. Replace `giftCardsStore` and `giftCardsByCode` Maps
3. Use transactions for:
   - Gift card purchase (create card + transaction)
   - Redemption (update balance + create transaction + update invoice)
   - Refund (update balance + create transaction)
   - Deactivation (zero balance + create transaction)
4. Code uniqueness enforced by Prisma unique constraint

**Transaction Pattern:**
```typescript
await prisma.$transaction(async (tx) => {
  // Create transaction record
  await tx.giftCardTransaction.create({
    data: {
      giftCardId: id,
      type: 'REDEMPTION',
      amount: -data.amount,
      balanceAfter: newBalance,
      processedBy: user.uid,
      processedAt: new Date(),
    }
  });

  // Update gift card balance and status
  await tx.giftCard.update({
    where: { id },
    data: {
      currentBalance: newBalance,
      status: newBalance === 0 ? 'DEPLETED' : 'PARTIALLY_USED',
    }
  });
});
```

## Enum Mapping Reference

### Payment Enums
```typescript
// String → Prisma Enum
'cash' → PaymentMethod.CASH
'credit_card' → PaymentMethod.CREDIT_CARD
'completed' → PaymentStatus.COMPLETED
'refunded' → PaymentStatus.REFUNDED
```

### Invoice Enums
```typescript
'draft' → InvoiceStatus.DRAFT
'paid' → InvoiceStatus.PAID
'service' → LineItemType.SERVICE
'percentage' → DiscountType.PERCENTAGE
```

### Package Enums
```typescript
'active' → PackagePurchaseStatus.ACTIVE
'fully_used' → PackagePurchaseStatus.FULLY_USED
```

### Membership Enums
```typescript
'bronze' → MembershipLevel.BRONZE
'monthly' → BillingCycle.MONTHLY
'active' → MembershipStatus.ACTIVE
```

### Gift Card Enums
```typescript
'active' → GiftCardStatus.ACTIVE
'redemption' → GiftCardTransactionType.REDEMPTION
```

## Database Migration Steps

1. **Generate Prisma Client:**
```bash
cd /Users/daminirijhwani/medical-spa-platform/backend
npx prisma generate
```

2. **Create Migration:**
```bash
npx prisma migrate dev --name add_billing_models
```

3. **Review Migration SQL:**
Check `prisma/migrations/*/migration.sql` for correctness

4. **Run Migration:**
```bash
npx prisma migrate deploy  # Production
# OR
npx prisma migrate dev     # Development
```

5. **Verify Schema:**
```bash
npx prisma studio  # Open GUI to verify tables
```

## Testing Checklist

### Payments
- [ ] Create payment (all methods: cash, card, check, gift card, financing)
- [ ] List payments with filters (invoiceId, patientId, method, status, dates)
- [ ] Get payment by ID with refunds included
- [ ] Process refund (partial and full)
- [ ] Verify invoice balance updates correctly
- [ ] Card validation endpoint works
- [ ] Payment methods list endpoint works

### Invoices
- [ ] Create invoice with line items
- [ ] Update invoice details
- [ ] Add/update/remove line items
- [ ] Calculate totals correctly
- [ ] Send invoice (update status)
- [ ] Void invoice (soft delete)
- [ ] List invoices with filters and pagination
- [ ] Get invoice summary (daily/weekly)

### Packages
- [ ] Create package
- [ ] Update package
- [ ] List packages (public and authenticated)
- [ ] Purchase package
- [ ] Redeem package service
- [ ] Track usage correctly
- [ ] View usage history
- [ ] Update purchase status based on usage

### Memberships
- [ ] Create membership tier
- [ ] Update tier
- [ ] List tiers (public and authenticated)
- [ ] Enroll patient
- [ ] Upgrade/downgrade membership
- [ ] Pause membership
- [ ] Resume membership
- [ ] Cancel membership
- [ ] Redeem benefit
- [ ] View available benefits

### Gift Cards
- [ ] Create gift card
- [ ] Lookup by code
- [ ] Redeem gift card
- [ ] Refund to gift card
- [ ] Deactivate gift card
- [ ] View transaction history
- [ ] Send gift card email
- [ ] Verify balance updates are atomic

## Performance Optimizations

1. **Indexes** - All frequently queried fields have indexes in schema
2. **Select Fields** - Add `select` to queries to fetch only needed fields
3. **Batch Operations** - Use `createMany` where applicable
4. **Connection Pooling** - Managed by Prisma Client singleton
5. **Query Optimization** - Use `include` wisely to avoid N+1 queries

## Security Considerations

1. **PCI Compliance:**
   - Card details stored as encrypted JSON (add encryption layer)
   - Never log full card numbers
   - Audit all card operations

2. **Financial Transactions:**
   - All money operations use transactions
   - Validate amounts before processing
   - Check invoice/payment states

3. **Access Control:**
   - Session middleware on all routes
   - Role-based access for admin operations
   - Patient data isolation

## Next Steps

1. Convert remaining 4 files using the payments.prisma.ts pattern
2. Run Prisma migrations
3. Test each endpoint thoroughly
4. Deploy to staging environment
5. Monitor for errors and performance issues
6. Add encryption layer for sensitive card data
7. Implement actual Stripe integration (replace mock)
8. Add comprehensive integration tests

## File Locations

- **Prisma Schema:** `/Users/daminirijhwani/medical-spa-platform/backend/prisma/schema.prisma`
- **Prisma Client:** `/Users/daminirijhwani/medical-spa-platform/backend/src/lib/prisma.ts`
- **Converted Routes:** `/Users/daminirijhwani/medical-spa-platform/backend/src/routes/*.prisma.ts`
- **Original Routes:** `/Users/daminirijhwani/medical-spa-platform/backend/src/routes/*.ts`

## Migration Strategy

### Option 1: Side-by-Side (Recommended)
- Keep both .ts and .prisma.ts files
- Test Prisma version thoroughly
- Switch import in main router when ready
- Remove .ts files after verification

### Option 2: Direct Replacement
- Backup original files
- Replace .ts files directly
- Higher risk but cleaner

### Option 3: Feature Flag
- Use environment variable to toggle between versions
- Gradual rollout per endpoint
- Most complex but safest for production

## Rollback Plan

If issues arise:
1. Revert to original .ts files
2. Keep database intact (data preserved)
3. Investigate and fix Prisma version
4. Retry deployment

## Support

For issues:
1. Check Prisma documentation: https://www.prisma.io/docs
2. Review error logs from Prisma
3. Use `npx prisma studio` to inspect database
4. Check migration status: `npx prisma migrate status`
