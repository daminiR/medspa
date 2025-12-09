# Jane App Billing Features - Comprehensive Roadmap for Medical Spa Platform

## Billing-Related Files from Jane's Charting Documentation

### Core Billing Files to Review:

#### **Injectable/Unit-Based Billing**
- `Billing_for_Per_Unit_Mileage_Botox_Materials_Used_Reporting_etc.md` ✅ CRITICAL
- `How_to_Bill_Neurotoxins_Botox_Dysport_Xeomin.md` ✅ CRITICAL
- `How_to_Bill_Filler.md` ✅ CRITICAL
- `How_to_Bill_and_Manage_Service_Add_Ons_for_Online_Booking.md`

#### **Invoice Management**
- `Creating_an_Invoice.md`
- `Creating_a_Patient_Invoice_without_an_Appointment.md`
- `Adjusting_Invoice_Dates.md`
- `Editing_an_Invoice_with_Payment_Already_Applied.md`
- `Customizing_the_Details_Price_on_an_Unpaid_Invoice.md`
- `How_to_Delete_an_Invoice.md`
- `How_to_Manually_Override_an_Invoice.md`
- `Email_a_Patient_Invoice.md`
- `Searching_by_Invoice_Number.md`
- `Customize_Patient_Invoice_Details.md`

#### **Payment Processing**
- `Jane_Payments_Start_Here.md` ✅ CRITICAL
- `Setting_Up_and_Using_Jane_Payments.md` ✅ CRITICAL
- `Jane_Payments_Terminal.md`
- `Jane_Payments_FAQ.md`
- `How_To_Get_Paid_Instantly_with_Jane_Payments_.md`
- `Jane_Payments_Stripe_KYC_Verification.md`
- `Multiple_Payment_Methods.md`
- `Changing_Payment_Method.md`
- `Creating_or_Deleting_a_New_Payment_Method.md`
- `HSA_FSA_cards.md`
- `Things_to_Know_When_Taking_Your_First_Payments_In_Jane.md`

#### **Packages & Memberships**
- `How_to_Manage_a_Wallet_or_Bank_Style_Package_and_Membership.md` ✅ CRITICAL
- `How_to_Redeem_a_Past_Treatment_under_a_Package.md`
- `Creating_Treatment_Combinations.md`

#### **Credits & Refunds**
- `Creating_a_Patient_Credit.md`
- `Creating_a_Credit_Memo_Patient_Credit_when_No_Payment_Received.md`
- `Applying_Patient_Credit_to_a_Specific_Invoice.md`
- `Refunding_a_Patient_Payment_for_an_Appointment.md`
- `Refunding_a_ProductInventory_Purchase.md`
- `Partially_Refund_a_Payment.md`
- `Deleting_or_Reversing_a_Refund_Recorded_in_Error.md`
- `Delete_a_Patient_Payment_Taken_or_Applied_in_Error.md`
- `How_to_confirm_whether_or_not_a_refund_was_successfully_processed.md`

#### **Receipts & Documentation**
- `How_to_Customize_Receipts.md`
- `Printing_or_Emailing_Receipts.md`
- `Add_Upcoming_Appointments_to_the_Bottom_of_Printed_and_Emailed_Receipts.md`
- `Issuing_a_Receipt_for_a_Refund.md`
- `Customizing_or_Removing_the_Footer_on_Financial_Documents.md`
- `Adding_a_Signature_to_Charts_InvoicesReceipts.md`

#### **Product Management**
- `Creating_a_Product.md`
- `Selling_a_Product.md`
- `Assigning_ProductInventory_to_Staff.md`
- `Products_Hub.md`
- `Shipping_Fees_on_Products.md`

#### **Discounts & Taxes**
- `Discounts_and_Price_Adjustments.md`
- `Disabling_Tax_on_an_Individual_Purchase.md`
- `Sales_Tax_Updating_Past_Invoices.md`
- `Deleting_a_Sales_Tax.md`

#### **Special Billing Scenarios**
- `Collecting_Payment_for_a_No_Show_or_Late_Cancellation.md`
- `Invoicing_for_Minors.md`
- `Payments_for_Related_Clients.md`
- `How_to_Create_an_Invoice_for_Administrative_Tasks.md`
- `How_to_Create_and_Send_Quotes_to_Patients.md`
- `How_to_Face_Chart.md` (Medical spa specific!)

#### **Financial Reporting**
- `Jane_Payments_Payouts_Report.md`
- `Jane_Payments_Transactions_Report.md`
- `Jane_Payments_Monthly_Processing_Report.md`
- `Bookkeeping_Hub.md`
- `Reconciliation_Date_Reporting_Invoice_Changes_Made_Prior_to_a_Certain_Period.md`

#### **Accounting Integration**
- `Importing_Sales_to_Quickbooks_Online_QBO_from_Jane.md`
- `Importing_Sales_to_Xero_from_Jane.md`
- `Accounting_Software_and_Jane.md`
- `Janes_Tips_for_Year_End.md`

#### **Online Payment Features**
- `Paying_Balances_Online.md`
- `Patient_Statements.md`
- `Automated_Balance_Reminder_Insurance.md`
- `Hide_Client_Information_from_Financial_Emails.md`

#### **Additional Features**
- `Tips_and_Gratuities.md`
- `Increasing_Your_Fees.md`
- `FAQ_Subscription_Licenses_and_Janes_Usage_Report.md`
- `Chargebacks_Disputes.md`
- `Failed_Jane_Payments_Payouts.md`

---

## Implementation Roadmap - Priority Order

### ✅ **ALREADY IMPLEMENTED**
1. Basic invoice structure and types
2. Invoice list view with filtering
3. Payment method types defined
4. Package and membership display
5. Basic unit-based billing structure for injectables

### 🔴 **PHASE 1: CRITICAL MEDICAL SPA FEATURES** (Week 1-2)

#### **1.1 Injectable Billing System**
- [x] **Per-unit billing calculator** ✅
  - [x] UI for selecting product (Botox, Dysport, Xeomin, etc.) ✅
  - [x] Unit input with automatic pricing ✅
  - [x] Area mapping (forehead, glabella, crow's feet) ✅ ENHANCED with face charts!
  - [x] Lot number and expiration tracking ✅
  - [ ] Before/after photo attachment

- [x] **Filler billing options** ✅
  - [x] By syringe (full, half, custom ml) ✅
  - [x] By brand pricing tiers ✅
  - [x] By area packages ✅ Smart syringe calculation!
  - [ ] Product inventory deduction

#### **1.2 Payment Processing Core**
- [ ] **Payment form component**
  - Multiple payment method selection
  - Split payment interface
  - HSA/FSA card handling
  - Tip/gratuity addition
  - Payment receipt generation

- [ ] **Credit card management**
  - Save card on file
  - Family profile card sharing
  - Tokenization for security
  - Card validation

### 🟡 **PHASE 2: PACKAGE & MEMBERSHIP SYSTEM** (Week 3-4)

#### **2.1 Package Management**
- [ ] **Package creation wizard**
  - Service bundling interface
  - Pricing calculator with savings display
  - Validity period settings
  - Restriction configuration

- [ ] **Package redemption**
  - Credit tracking system
  - Usage history
  - Expiration alerts
  - Transfer capabilities

#### **2.2 Membership Programs**
- [ ] **Membership tiers**
  - Recurring billing setup
  - Benefit configuration
  - Included services tracking
  - Discount application

- [ ] **Wallet/Bank system**
  - Dollar amount loading
  - Usage tracking
  - Maximum limits
  - Transaction history

### 🟢 **PHASE 3: ADVANCED BILLING FEATURES** (Week 5-6)

#### **3.1 Gift Cards**
- [ ] **Gift card system**
  - Online purchase portal
  - Email delivery
  - Balance tracking
  - Reload capabilities
  - Security limits

#### **3.2 Credits & Refunds**
- [ ] **Credit management**
  - Credit memo creation
  - Application to invoices
  - Transfer between patients
  - Balance tracking

- [ ] **Refund processing**
  - Full/partial refunds
  - Refund receipts
  - Reversal capabilities
  - Audit trail

### 🔵 **PHASE 4: FINANCIAL OPERATIONS** (Week 7-8)

#### **4.1 Reporting Suite**
- [ ] **Financial reports**
  - Daily cash reconciliation
  - Monthly revenue analysis
  - Provider commission reports
  - Package/membership analytics
  - Product performance

- [ ] **Jane Payments equivalent reports**
  - Transaction reports with fees
  - Payout tracking
  - Processing summaries

#### **4.2 Accounting Integration**
- [ ] **Export capabilities**
  - QuickBooks format
  - Xero compatibility
  - CSV exports
  - Journal entries

### ⚫ **PHASE 5: COMPLIANCE & ADVANCED** (Week 9-10)

#### **5.1 Insurance Features** (Optional for medical spa)
- [ ] Superbill generation
- [ ] Good faith estimates
- [ ] Insurance claim basic support

#### **5.2 Advanced Features**
- [ ] **Treatment combinations**
  - Bundle builder
  - Dynamic pricing
  - Online booking integration

- [ ] **Face charting integration**
  - Visual injection mapping
  - Area-based pricing
  - Progress tracking

---

## Feature Comparison Checklist

### Core Billing Features

| Feature | Jane App | Our Platform | Status | Priority |
|---------|----------|--------------|--------|----------|
| **Injectable Billing** |
| Per-unit billing | ✅ | 🟨 Basic | 🔴 Enhance | CRITICAL |
| Lot number tracking | ✅ | ❌ | To build | CRITICAL |
| Area-based billing | ✅ | ❌ | To build | HIGH |
| **Invoicing** |
| Create invoice | ✅ | ✅ | Complete | - |
| Edit invoice | ✅ | ❌ | To build | HIGH |
| Email invoice | ✅ | ❌ | To build | HIGH |
| Custom invoice details | ✅ | ❌ | To build | MEDIUM |
| **Payments** |
| Multiple payment methods | ✅ | ✅ Types only | To build | CRITICAL |
| Split payments | ✅ | ❌ | To build | HIGH |
| Payment on file | ✅ | ❌ | To build | HIGH |
| Tips/gratuities | ✅ | ❌ | To build | LOW |
| **Packages** |
| Create packages | ✅ | 🟨 Display only | To build | HIGH |
| Redeem packages | ✅ | ❌ | To build | HIGH |
| Package reports | ✅ | ❌ | To build | MEDIUM |
| **Memberships** |
| Tier management | ✅ | 🟨 Display only | To build | HIGH |
| Recurring billing | ✅ | ❌ | To build | HIGH |
| Benefit tracking | ✅ | ❌ | To build | HIGH |
| **Gift Cards** |
| Online purchase | ✅ | ❌ | To build | MEDIUM |
| Balance tracking | ✅ | ❌ | To build | MEDIUM |
| Reload capability | ✅ | ❌ | To build | LOW |
| **Credits/Refunds** |
| Patient credits | ✅ | ❌ | To build | HIGH |
| Refund processing | ✅ | ❌ | To build | HIGH |
| Credit transfers | ✅ | ❌ | To build | LOW |
| **Products** |
| Product management | ✅ | 🟨 Types only | To build | MEDIUM |
| Inventory tracking | ✅ | ❌ | To build | MEDIUM |
| Staff assignment | ✅ | ❌ | To build | LOW |
| **Reporting** |
| Sales reports | ✅ | ❌ | To build | HIGH |
| Cash reconciliation | ✅ | ❌ | To build | HIGH |
| Commission reports | ✅ | ❌ | To build | MEDIUM |
| **Integration** |
| QuickBooks export | ✅ | ❌ | To build | LOW |
| Payment gateway | ✅ | ❌ | To build | CRITICAL |

---

## Medical Spa Specific Enhancements

### Features to Build BETTER than Jane:

1. **Visual Injectable Tracking**
   - 3D face mapping for injection sites
   - Automatic symmetry calculations
   - Treatment area heat maps
   - Progress overlays

2. **Smart Unit Calculator**
   - Preset protocols by area
   - Dilution tracking
   - Waste tracking
   - Cost per area analysis

3. **Advanced Package Analytics**
   - ROI per package type
   - Redemption patterns
   - Expiration predictions
   - Upsell opportunities

4. **Membership Intelligence**
   - Churn prediction
   - Tier progression tracking
   - Benefit utilization analysis
   - Retention strategies

5. **Integrated Financing**
   - CareCredit direct integration
   - Cherry financing
   - Payment plan automation
   - Approval workflows

---

## Next Steps - Development Plan

### Week 1-2: Core Medical Spa Billing
1. Build injectable billing calculator UI
2. Implement lot number tracking
3. Create payment processing form
4. Add area-based billing

### Week 3-4: Packages & Memberships
1. Build package creation wizard
2. Implement redemption system
3. Create membership management
4. Add wallet/bank functionality

### Week 5-6: Advanced Features
1. Implement gift card system
2. Build credit/refund workflows
3. Add treatment combinations
4. Create face charting integration

### Week 7-8: Financial Operations
1. Build comprehensive reporting
2. Add export capabilities
3. Create reconciliation tools
4. Implement commission tracking

### Week 9-10: Polish & Integration
1. Payment gateway integration
2. Compliance features
3. Advanced analytics
4. Performance optimization

---

## Success Metrics

- **Implementation Coverage**: 95% of Jane's billing features
- **Medical Spa Enhancements**: 10+ unique features
- **Processing Time**: <2 seconds per transaction
- **User Satisfaction**: Simplified workflows for common tasks
- **Financial Accuracy**: Zero-error reconciliation

---

*Last Updated: August 2025*
*Total Billing Features to Implement: 80+*
*Estimated Timeline: 10 weeks for full feature parity + enhancements*