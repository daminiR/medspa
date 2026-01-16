# Billing & Payments Implementation Checklist

## Completed

- [x] Analyzed all backend API route files
  - [x] `/backend/src/routes/payments.ts`
  - [x] `/backend/src/routes/invoices.ts`
  - [x] `/backend/src/routes/packages.ts`
  - [x] `/backend/src/routes/memberships.ts`
  - [x] `/backend/src/routes/gift-cards.ts`

- [x] Created Prisma models for Packages
  - [x] Package
  - [x] PackageItem
  - [x] PackagePurchase
  - [x] PackagePurchaseItem
  - [x] PackageRedemption

- [x] Created Prisma models for Memberships
  - [x] MembershipTier
  - [x] PatientMembership
  - [x] BenefitRedemption

- [x] Created Prisma models for Gift Cards
  - [x] GiftCard
  - [x] GiftCardTransaction

- [x] Created Prisma models for Credits
  - [x] Credit
  - [x] CreditTransaction

- [x] Enhanced Invoice model
  - [x] Added invoice number (unique)
  - [x] Added provider/location tracking
  - [x] Added date tracking (invoiceDate, serviceDate, sentAt, etc.)
  - [x] Added calculated totals (subtotal, taxTotal, discountTotal, amountPaid, balance)
  - [x] Added notes (internal/patient)
  - [x] Added audit fields

- [x] Created InvoiceLineItem model
  - [x] Support for different item types
  - [x] Quantity and unit price
  - [x] Unit types for injectables
  - [x] Lot number tracking
  - [x] Discount system (percentage/fixed)
  - [x] Tax calculation per line
  - [x] Provider tracking

- [x] Enhanced Payment model
  - [x] Added method field
  - [x] Added JSON fields for payment details
  - [x] Added Stripe fields (customer ID)
  - [x] Added audit fields (processedAt, processedBy, notes)
  - [x] Added transaction reference

- [x] Created PaymentRefund model
  - [x] Refund tracking
  - [x] Status management
  - [x] Audit trail

- [x] Created all necessary enums
  - [x] PackageItemType
  - [x] PackagePurchaseStatus
  - [x] MembershipLevel
  - [x] BillingCycle
  - [x] MembershipStatus
  - [x] GiftCardStatus
  - [x] GiftCardTransactionType
  - [x] CreditType
  - [x] CreditSource
  - [x] CreditTransactionType
  - [x] DiscountType
  - [x] RefundStatus
  - [x] InvoiceStatus (enhanced)

- [x] Added comprehensive indexes
  - [x] Foreign keys
  - [x] Status fields
  - [x] Date fields
  - [x] Unique identifiers
  - [x] Common query patterns

- [x] Documentation
  - [x] Created detailed schema documentation (BILLING_PAYMENTS_SCHEMA.md)
  - [x] Created schema summary (SCHEMA_SUMMARY.md)
  - [x] Created visual diagram (BILLING_SCHEMA_DIAGRAM.md)
  - [x] Created implementation checklist (this file)

## Next Steps

### 1. Database Migration

```bash
cd /Users/daminirijhwani/medical-spa-platform/apps/admin

# Review the generated migration
npx prisma migrate dev --name add_billing_payment_models --create-only

# Apply the migration
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 2. Backend Implementation

- [ ] Create service layer for invoices
  - [ ] Invoice CRUD operations
  - [ ] Line item management
  - [ ] Invoice calculation logic
  - [ ] PDF generation
  - [ ] Email sending

- [ ] Create service layer for payments
  - [ ] Payment processing (Stripe integration)
  - [ ] Multi-method payment support
  - [ ] Refund processing
  - [ ] Payment validation

- [ ] Create service layer for packages
  - [ ] Package CRUD operations
  - [ ] Purchase processing
  - [ ] Redemption logic
  - [ ] Usage tracking

- [ ] Create service layer for memberships
  - [ ] Tier management
  - [ ] Enrollment processing
  - [ ] Billing cycle management
  - [ ] Benefit redemption
  - [ ] Pause/resume/cancel logic

- [ ] Create service layer for gift cards
  - [ ] Gift card creation
  - [ ] Balance management
  - [ ] Transaction processing
  - [ ] Email delivery

- [ ] Create service layer for credits
  - [ ] Credit issuance
  - [ ] Credit redemption
  - [ ] Expiration handling

### 3. API Routes (Hono/Express)

- [ ] Invoice routes
  - [ ] GET /api/invoices (list with pagination)
  - [ ] GET /api/invoices/:id (get single)
  - [ ] POST /api/invoices (create)
  - [ ] PUT /api/invoices/:id (update)
  - [ ] DELETE /api/invoices/:id (void)
  - [ ] POST /api/invoices/:id/send (email)
  - [ ] GET /api/invoices/:id/pdf (generate PDF)
  - [ ] POST /api/invoices/:id/line-items (add line item)
  - [ ] PUT /api/invoices/:id/line-items/:itemId (update line item)
  - [ ] DELETE /api/invoices/:id/line-items/:itemId (remove line item)

- [ ] Payment routes
  - [ ] GET /api/payments (list with pagination)
  - [ ] GET /api/payments/:id (get single)
  - [ ] POST /api/payments (create/process)
  - [ ] POST /api/payments/:id/refund (process refund)
  - [ ] POST /api/payments/validate-card (card validation)
  - [ ] GET /api/payments/methods (available methods)

- [ ] Package routes
  - [ ] GET /api/packages (list)
  - [ ] GET /api/packages/:id (get single)
  - [ ] POST /api/packages (create - admin)
  - [ ] PUT /api/packages/:id (update - admin)
  - [ ] DELETE /api/packages/:id (deactivate - admin)
  - [ ] POST /api/packages/:id/purchase (purchase)
  - [ ] GET /api/patients/:patientId/packages (list purchases)
  - [ ] GET /api/patients/:patientId/packages/:purchaseId (get purchase)
  - [ ] POST /api/patients/:patientId/packages/:purchaseId/redeem (redeem)
  - [ ] GET /api/patients/:patientId/packages/:purchaseId/usage (usage history)

- [ ] Membership routes
  - [ ] GET /api/memberships (list tiers)
  - [ ] GET /api/memberships/:id (get tier)
  - [ ] POST /api/memberships (create tier - admin)
  - [ ] PUT /api/memberships/:id (update tier - admin)
  - [ ] DELETE /api/memberships/:id (deactivate tier - admin)
  - [ ] POST /api/memberships/:id/enroll (enroll patient)
  - [ ] GET /api/patients/:patientId/membership (get active membership)
  - [ ] PUT /api/patients/:patientId/membership (upgrade/downgrade)
  - [ ] POST /api/patients/:patientId/membership/cancel (cancel)
  - [ ] POST /api/patients/:patientId/membership/pause (pause)
  - [ ] POST /api/patients/:patientId/membership/resume (resume)
  - [ ] GET /api/patients/:patientId/membership/benefits (available benefits)
  - [ ] POST /api/patients/:patientId/membership/redeem (redeem benefit)

- [ ] Gift Card routes
  - [ ] GET /api/gift-cards (list)
  - [ ] GET /api/gift-cards/:id (get single)
  - [ ] GET /api/gift-cards/lookup/:code (lookup by code)
  - [ ] POST /api/gift-cards (create/purchase)
  - [ ] PUT /api/gift-cards/:id (update)
  - [ ] POST /api/gift-cards/:id/redeem (redeem)
  - [ ] POST /api/gift-cards/:id/refund (refund to balance)
  - [ ] POST /api/gift-cards/:id/deactivate (deactivate)
  - [ ] GET /api/gift-cards/:id/transactions (transaction history)
  - [ ] POST /api/gift-cards/:id/send (send email)

- [ ] Credit routes
  - [ ] GET /api/patients/:patientId/credits (list credits)
  - [ ] POST /api/patients/:patientId/credits (issue credit)
  - [ ] GET /api/patients/:patientId/credits/:id/transactions (transaction history)

### 4. Frontend Implementation

- [ ] Invoice components
  - [ ] Invoice list view
  - [ ] Invoice detail view
  - [ ] Invoice creation form
  - [ ] Line item editor
  - [ ] PDF preview/download

- [ ] Payment components
  - [ ] Payment form (multi-method)
  - [ ] Payment history
  - [ ] Refund dialog
  - [ ] Payment method selector

- [ ] Package components
  - [ ] Package catalog
  - [ ] Package detail view
  - [ ] Purchase flow
  - [ ] Patient packages list
  - [ ] Redemption interface

- [ ] Membership components
  - [ ] Membership tier comparison
  - [ ] Enrollment flow
  - [ ] Membership dashboard
  - [ ] Benefit usage tracking
  - [ ] Upgrade/downgrade flow

- [ ] Gift Card components
  - [ ] Gift card purchase form
  - [ ] Gift card lookup
  - [ ] Gift card redemption
  - [ ] Transaction history

- [ ] Credit components
  - [ ] Credit balance display
  - [ ] Credit history
  - [ ] Credit redemption

### 5. Testing

- [ ] Unit tests
  - [ ] Invoice calculation logic
  - [ ] Payment processing
  - [ ] Package redemption logic
  - [ ] Membership benefit tracking
  - [ ] Gift card balance calculations

- [ ] Integration tests
  - [ ] Invoice + Payment flow
  - [ ] Package purchase + redemption
  - [ ] Membership enrollment + billing
  - [ ] Gift card lifecycle
  - [ ] Credit issuance + redemption

- [ ] E2E tests
  - [ ] Complete checkout flow
  - [ ] Package purchase and use
  - [ ] Membership signup and benefit usage
  - [ ] Gift card purchase and redemption

### 6. Stripe Integration

- [ ] Set up Stripe account
- [ ] Configure webhook handlers
  - [ ] Payment succeeded
  - [ ] Payment failed
  - [ ] Refund processed
  - [ ] Subscription events (for memberships)

- [ ] Implement Stripe services
  - [ ] Payment Intent creation
  - [ ] Customer management
  - [ ] Payment method management
  - [ ] Subscription management (for memberships)

### 7. Reporting & Analytics

- [ ] Invoice reports
  - [ ] Daily/weekly/monthly summaries
  - [ ] Outstanding balance reports
  - [ ] Revenue reports

- [ ] Payment reports
  - [ ] Payment method breakdown
  - [ ] Failed payments
  - [ ] Refund reports

- [ ] Package reports
  - [ ] Package sales
  - [ ] Redemption rates
  - [ ] Popular packages

- [ ] Membership reports
  - [ ] Active memberships
  - [ ] Churn analysis
  - [ ] Revenue by tier

- [ ] Gift Card reports
  - [ ] Outstanding balances
  - [ ] Redemption rates
  - [ ] Expiring cards

### 8. Security & Compliance

- [ ] PCI compliance
  - [ ] Never store full card numbers
  - [ ] Use Stripe for sensitive data
  - [ ] Implement audit logging

- [ ] Financial compliance
  - [ ] Transaction immutability
  - [ ] Audit trail for all changes
  - [ ] Proper refund tracking

- [ ] Data privacy
  - [ ] HIPAA compliance for patient data
  - [ ] Secure payment processing
  - [ ] Encryption at rest and in transit

### 9. Automation

- [ ] Scheduled jobs
  - [ ] Invoice due date reminders
  - [ ] Membership billing
  - [ ] Gift card expiration notifications
  - [ ] Credit expiration handling

- [ ] Email notifications
  - [ ] Invoice sent
  - [ ] Payment received
  - [ ] Refund processed
  - [ ] Package purchased
  - [ ] Membership enrolled/renewed
  - [ ] Gift card delivered

## Documentation Files

1. **Schema Documentation** (`/BILLING_PAYMENTS_SCHEMA.md`)
   - Detailed model descriptions
   - Field explanations
   - Enums documentation
   - Usage examples
   - Migration instructions

2. **Schema Summary** (`/SCHEMA_SUMMARY.md`)
   - Quick overview of what was added
   - Model counts and categories
   - Key features highlight
   - Next steps

3. **Visual Diagram** (`/BILLING_SCHEMA_DIAGRAM.md`)
   - Entity relationship diagrams
   - Flow examples
   - Design principles
   - Relationship visualization

4. **Implementation Checklist** (this file)
   - Completed items
   - Remaining tasks
   - Implementation order
   - Dependencies

## Schema Files

- **Prisma Schema**: `/apps/admin/prisma/schema.prisma`
  - Total lines: 1,472
  - Models added: 13
  - Enums added: 13
  - Enhanced models: 2 (Invoice, Payment)

## Notes

### Design Decisions

1. **Transaction History**: All monetary transactions are immutable records for audit compliance
2. **JSON Fields**: Used for complex nested data (benefits, restrictions, payment details)
3. **Status Enums**: Clear state machines for all entities
4. **Comprehensive Indexing**: All foreign keys and commonly queried fields
5. **Stripe Ready**: All necessary ID fields for full Stripe integration
6. **Audit Trail**: processedAt, processedBy, notes on all transactions

### Special Features

1. **Lot Tracking**: Invoice line items support lot numbers for injectables
2. **Unit Types**: Support for units, syringes, vials, ml
3. **Flexible Discounts**: Both percentage and fixed amount
4. **Package Restrictions**: JSON field for complex rules
5. **Membership Benefits**: JSON field with usage tracking
6. **Scheduled Delivery**: Gift cards can be scheduled
7. **Expiration**: Gift cards and credits support expiration dates

### Performance Considerations

1. All foreign keys indexed
2. Common query patterns indexed (status, dates)
3. Unique fields indexed (codes, invoice numbers)
4. Consider materialized views for complex reports
5. Consider read replicas for reporting queries

### Future Enhancements

1. Multi-currency support
2. Tax automation (TaxJar, Avalara)
3. Payment plans (installments)
4. Automatic late fees
5. Dunning management
6. Revenue recognition
7. Financial reporting (P&L, balance sheet)
