# Proper Data Architecture & Location Guide

## Based on Jane App's Organization

### 📍 Where Things Should Live

## 1. **Patient Profile** (`/patients/[id]`)
This is where patient-specific financial data should be displayed:

### ✅ Should Include:
- **Credits Balance & History**
  - Current credit balance
  - Credit usage history
  - Credit expiration dates
  
- **Gift Card Balances**
  - All gift cards owned by patient
  - Gift card usage history
  - Current balances
  
- **Package Ownership**
  - Packages purchased
  - Sessions/credits remaining
  - Usage history
  - Expiration dates
  
- **Payment History**
  - All payments made
  - Payment methods used
  - Invoice history
  
- **Outstanding Balances**
  - Unpaid invoices
  - Payment plans

---

## 2. **Settings** (`/settings`)
Only configuration and setup, NOT transactional data:

### ✅ Should Include:
- **Payment Settings**
  - Accepted payment methods
  - Payment processor configuration
  - Tax settings
  - Receipt templates
  
- **Package Templates**
  - Create package types
  - Set pricing rules
  - Configure restrictions
  
- **Credit Policies**
  - Credit expiration rules
  - Credit types configuration
  - Approval workflows
  
- **Gift Card Configuration**
  - Design templates
  - Expiration policies
  - Security settings

### ❌ Should NOT Include:
- Individual patient credits
- Transaction history
- Actual gift card balances
- Package usage data

---

## 3. **Billing** (`/billing`)
Active transactions and payment processing:

### ✅ Should Include:
- **Active Invoices**
  - Today's invoices
  - Outstanding balances
  - Payment processing
  
- **Live Treatment Status**
  - Real-time patient flow
  - Ready for payment
  
- **Quick Actions**
  - Process payment
  - Apply credits
  - Use gift cards

---

## 4. **Reports** (`/reports`)
Aggregated data and analytics:

### ✅ Should Include:
- **Financial Reports**
  - All credits issued
  - All refunds processed
  - Gift card sales & redemptions
  - Package sales & usage
  
- **Reconciliation**
  - Daily cash reconciliation
  - Credit card batches
  - Outstanding balances
  
- **Analytics**
  - Credit usage patterns
  - Gift card performance
  - Package profitability

---

## 5. **Gift Cards** (Separate Module)

### Where it belongs:
- **Purchase/Create**: Could be standalone or in POS
- **Management**: Settings (for configuration)
- **Balance Check**: Patient Profile
- **Redemption**: During checkout/payment

---

## Current Issues to Fix:

### 🔴 **Problem 1: Credits & Refunds in Settings**
- **Current**: Full transaction list in Settings
- **Should be**: 
  - Settings: Only policies & configuration
  - Patient Profile: Individual credits
  - Reports: All credits across patients

### 🔴 **Problem 2: No Patient Profile System**
- **Current**: Everything dumped in Settings
- **Should be**: Build patient profiles as central hub

### 🔴 **Problem 3: Gift Card Data Not Persisting**
- **Current**: UI only, no data creation
- **Should be**: Create actual records when purchased

---

## Recommended Implementation Order:

### Phase 1: Build Patient Profile System
```
/patients
  /[id]
    - Demographics
    - Financials (credits, gift cards, packages)
    - Appointments
    - Treatment History
    - Documents
```

### Phase 2: Move Financial Data
- Move credits from Settings → Patient Profiles
- Move gift card balances → Patient Profiles  
- Keep configuration in Settings

### Phase 3: Create Reports Section
```
/reports
  /financial
    - Credits Report
    - Refunds Report
    - Gift Cards Report
    - Package Analytics
```

### Phase 4: Clean Up Settings
- Remove transactional data
- Keep only configuration
- Add proper policy management

---

## Jane App Reference Structure:

```
Jane App
├── Patients
│   └── [Patient Name]
│       ├── Overview
│       ├── Billing (credits, packages, balances)
│       ├── Appointments
│       └── Documents
├── Billing
│   ├── Invoices
│   ├── Payments
│   └── Quick Checkout
├── Reports
│   ├── Financial
│   ├── Patients
│   └── Practitioners
└── Settings
    ├── Billing Settings
    ├── Payment Methods
    └── Package Templates
```

---

## Summary:
The key principle is **"Settings for configuration, Profiles for patient data, Reports for analytics"**. Currently everything is mixed in Settings which is confusing. Patient-specific data should live with the patient, not in Settings.