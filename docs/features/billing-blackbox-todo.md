# Billing System - Black Box TODO List
**Features Built But Need Backend Integration**

## 📦 Package System

### Current State (Frontend Only):
- ✅ Package selling modal with patient search
- ✅ Flip to customer payment screen
- ✅ Credit tracking types defined
- ✅ Quantity selection and pricing

### Needs Backend Integration:
- [ ] **Credit Storage**
  - Store package credits in database
  - Link credits to patient accounts
  - Track usage history
  - Handle expiration dates

- [ ] **Credit Redemption**
  - At checkout, check available credits
  - Apply credits automatically
  - Allow partial credit usage
  - Update remaining balances

- [ ] **Package Reports**
  - Redemption rate analytics
  - Expiring credits alerts
  - Revenue recognition (deferred revenue)
  - Package performance metrics

## 💳 Membership System

### Current State (Frontend Only):
- ✅ Enrollment modal with terms
- ✅ Patient selection
- ✅ Billing cycle options
- ✅ Benefits display

### Needs Backend Integration:
- [ ] **Recurring Billing**
  - Stripe/Square integration for subscriptions
  - Automatic monthly charges
  - Failed payment retry logic
  - Payment method updates

- [ ] **Benefit Tracking**
  - Monthly service credits
  - Automatic discount application
  - Reset logic (monthly/quarterly)
  - Rollover rules (max 1-2 typically)

- [ ] **Membership Management**
  - Pause/resume functionality
  - Cancellation workflow
  - Upgrade/downgrade tiers
  - Proration calculations

## 🎁 Gift Card System

### Current State (Frontend Only):
- ✅ Gift card manager interface
- ✅ Search and filtering
- ✅ Balance tracking UI

### Needs Backend Integration:
- [ ] **Gift Card Creation**
  - Generate unique codes
  - Set amounts and expiry
  - Email delivery system
  - Physical card tracking

- [ ] **Balance Management**
  - Real-time balance updates
  - Transaction history
  - Partial redemption
  - Balance transfers

- [ ] **Security**
  - Fraud prevention
  - Maximum purchase limits
  - Activation workflow
  - Lost card replacement

## 💰 Payment Processing

### Current State (Frontend Only):
- ✅ Customer payment screen (flip UI)
- ✅ Payment method selection
- ✅ Success animations

### Needs Backend Integration:
- [ ] **Payment Gateway**
  - Stripe/Square terminal API
  - Card reader integration
  - NFC/tap payments
  - EMV chip processing

- [ ] **Transaction Management**
  - Payment capture/void
  - Refund processing
  - Partial refunds
  - Chargeback handling

- [ ] **Security & Compliance**
  - PCI compliance
  - Tokenization
  - Card vault storage
  - Audit logging

## 📊 Financial Reporting

### Currently Missing Entirely:
- [ ] **Daily Reports**
  - Cash reconciliation
  - Payment method breakdown
  - Provider commissions
  - Tips tracking

- [ ] **Package/Membership Analytics**
  - MRR (Monthly Recurring Revenue)
  - Churn rate
  - LTV (Lifetime Value)
  - Redemption patterns

- [ ] **Revenue Recognition**
  - Deferred revenue (packages)
  - Accrual accounting
  - Service revenue vs product revenue
  - Tax calculations

## 🔄 Integration Points

### With Appointment System:
- [ ] Show available credits during booking
- [ ] Auto-apply membership discounts
- [ ] Block booking if package expired
- [ ] Send credit balance in reminders

### With Provider Tablets:
- [ ] Providers see patient credits
- [ ] Can't modify credits (view only)
- [ ] Show membership status
- [ ] Alert if benefits expiring

### With Patient Portal:
- [ ] View package balances
- [ ] See membership benefits
- [ ] Purchase packages online
- [ ] Manage payment methods

## 🚨 Critical Missing Features

### High Priority:
1. **Real Payment Processing** - Currently just simulated
2. **Credit Application at Checkout** - Can't use packages yet
3. **Recurring Billing** - Memberships don't actually charge
4. **Refund System** - No way to reverse transactions

### Medium Priority:
1. **Email Notifications** - Purchase confirmations
2. **Expiry Management** - Auto-expire old credits
3. **Proration** - For membership changes
4. **Family Accounts** - Share packages

### Nice to Have:
1. **Loyalty Points** - Earn points per dollar
2. **Referral Credits** - Reward referrals
3. **Corporate Accounts** - B2B packages
4. **Financing Options** - Payment plans

## 🔧 Technical Debt

### Database Schema Needs:
```sql
-- Tables needed:
- package_credits
- membership_subscriptions
- gift_cards
- payment_methods
- transactions
- recurring_billing_schedules
- benefit_usage_tracking
```

### API Endpoints Needed:
```
POST /api/packages/sell
GET  /api/patients/{id}/credits
POST /api/credits/redeem
POST /api/memberships/enroll
POST /api/billing/charge
GET  /api/reports/daily-summary
```

### Third-Party Integrations:
- [ ] Stripe Connect for providers
- [ ] Square Terminal API
- [ ] SendGrid for emails
- [ ] Plaid for ACH/bank
- [ ] TaxJar for tax calculation

## 📝 Documentation Needed

### For Development:
- [ ] API documentation
- [ ] Database schema docs
- [ ] Integration guides
- [ ] Security protocols

### For Users:
- [ ] Training videos
- [ ] Best practices guide
- [ ] Troubleshooting docs
- [ ] Compliance guidelines

## 🎯 Success Metrics to Track

Once Integrated:
- Package redemption rate (target: >80%)
- Membership retention (target: >6 months avg)
- Gift card redemption (target: >90%)
- Payment success rate (target: >95%)
- Time to checkout (target: <2 minutes)

---

## Priority Order for Implementation

### Phase 1 (Critical - Week 1-2):
1. Payment gateway integration
2. Basic credit storage/retrieval
3. Apply credits at checkout

### Phase 2 (Important - Week 3-4):
1. Recurring billing for memberships
2. Email notifications
3. Basic reporting

### Phase 3 (Enhancement - Week 5-6):
1. Advanced analytics
2. Expiry management
3. Refund system

### Phase 4 (Nice to Have - Future):
1. Loyalty programs
2. Corporate accounts
3. Advanced integrations

---

**Note**: All UI/UX is built and working. Just needs backend services and database to make it functional. The frontend is ready to connect to real APIs once they're built.