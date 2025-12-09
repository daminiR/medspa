# 🧪 Testing Guide: Payment Features

## Overview
This guide provides step-by-step instructions for testing all payment-related features in the Medical Spa Platform.

---

## 🎯 Feature Locations & Architecture

### Current Implementation Status:
- ✅ **Invoices & Payments**: Fully implemented with sample data
- ✅ **Enhanced Payment Form**: Complete with tokenization, tips, HSA/FSA
- ✅ **Customer-Facing Payment View**: iPad-style payment kiosk for patients
- ✅ **Gift Cards**: Purchase and management system built
- ✅ **Credits & Refunds**: System built (currently in Settings, should move to Patient Profiles)
- ✅ **Packages**: Creation and management complete
- ⚠️ **Patient Profiles**: Not yet implemented (needed for patient-specific credits/history)

---

## 📋 Step-by-Step Testing Instructions

### 1️⃣ **Test Invoices & Basic Payments**

#### Where to Find:
- **Navigation**: Top Menu → `Billing`

#### What You'll See:
- **Live Treatment Status** section at the top showing real-time patient flow
- Stats cards showing today's revenue, monthly revenue, outstanding balances
- Invoice table with 6 sample invoices (dates: Aug 20-27, 2025)
- Tabs for Invoices, Packages, and Memberships

#### How to Test:
1. **View Invoices**:
   - The table should show 6 invoices with August 2025 dates
   - Balance amounts are shown in the "Balance" column
   - Unpaid invoices have a purple **"Process Payment"** button
   - Paid invoices show a green **"Paid"** badge

2. **Process a Payment from Invoice**:
   - Find invoice `INV-2024-002` (Michael Rodriguez) or `INV-2024-004` (Jennifer Chang)
   - Both have outstanding balances
   - Click the **"Process Payment"** button (purple gradient)
   - This opens the Enhanced Payment Form

---

### 2️⃣ **Test Enhanced Payment Form**

#### Features to Test:
1. **NEW: Flip to Customer Button** (top right of form):
   - Click blue **"Flip to Customer"** button
   - Shows iPad-style customer payment screen
   - Customer can add their own tip
   - Returns to staff view after payment

2. **Tips Section** (top of form):
   - Click preset buttons: 15%, 18%, 20%, 25%
   - Enter custom tip amount
   - Watch the total update automatically

3. **Payment Methods** (8 options):
   - Credit, Debit, HSA, FSA, Cash, Check, Gift Card, Package
   - Click **HSA** or **FSA** to see special healthcare notice

4. **Card Features**:
   - Enter card starting with `4` → Shows "Visa"
   - Enter card starting with `5` → Shows "Mastercard"
   - Enter card starting with `3` → Shows "Amex"
   - Click through 3 pre-loaded saved cards
   - Check "Save card for future payments"
   - Notice lock icon indicating tokenization

5. **Split Payments**:
   - Add first payment for partial amount
   - Add second payment with different method
   - See running total and remaining balance

---

### 3️⃣ **Test Gift Card System**

#### Where to Find:
- **Navigation**: Top Menu → `Settings` → Left Sidebar → `Gift Cards`

#### Three Tabs to Test:

##### **Purchase Tab**:
1. Click "Create Gift Card" button
2. Choose design: Classic Spa, Birthday, Holiday, Luxury Spa, Custom
3. Select amount: Quick amounts ($50-$1000) or custom
4. Enter recipient and purchaser information
5. Add personal message
6. Choose delivery: "Send immediately" or "Schedule for later"

##### **Manage Tab**:
1. View 3 sample gift cards:
   - `GIFT-2024-XMAS-001`: $325 balance (active)
   - `GIFT-2024-BDAY-002`: $250 balance (pending)
   - `GIFT-2024-SPA-003`: $0 balance (redeemed)
2. Click "View usage history" to see transactions
3. Try "Reload" button on active cards

##### **Bulk & Corporate Tab**:
1. View volume discount tiers:
   - $1,000-$5,000: 5% bonus
   - $5,001-$10,000: 10% bonus
   - $10,000+: 15% bonus
2. See corporate features list

---

### 4️⃣ **Test Credits & Refunds**

#### Where to Find:
- **Navigation**: Top Menu → `Settings` → Left Sidebar → `Credits & Refunds`
- **Note**: This should eventually move to Patient Profiles

#### Two Tabs to Test:

##### **Patient Credits Tab**:
1. View stats: Total Credits, Active Credits, Expiring Soon
2. Click orange "New Credit" card:
   - Select patient from dropdown
   - Enter credit amount
   - Choose type: Refund, Overpayment, Goodwill, Promotional, Cancellation
   - Set optional expiry date
   - Add internal notes
3. View 3 sample credits:
   - Sarah Johnson: $150 goodwill (active)
   - Michael Chen: $75 overpayment (active, partially used)
   - Emily Davis: $0 promotional (fully used)

##### **Refunds Tab**:
1. View stats: Pending Approval, Processing, This Month's Total
2. Click purple "New Refund" card:
   - See yellow policy warning
   - Select invoice from dropdown
   - Enter refund amount
   - Choose method: Original Card, Patient Credit, Cash, Check
   - Select reason
3. View 3 sample refunds:
   - `REF-001`: Completed ($450)
   - `REF-002`: Processing ($125)
   - `REF-003`: Pending approval (see Approve/Reject buttons)

---

### 5️⃣ **Test Package System**

#### Where to Find:
- **Navigation**: Top Menu → `Settings` → Left Sidebar → `Packages & Memberships`
- **Or**: Top Menu → `Packages` (for quick access)

#### Features to Test:
1. Click "Create New Package" button
2. Follow 4-step wizard:
   - Step 1: Choose package type
   - Step 2: Configure services
   - Step 3: Set pricing
   - Step 4: Review & create
3. View smart suggestions and ROI calculator
4. See existing packages with "View Details" button

### 2.5️⃣ **Test Live Treatment Status → Payment**

#### Where to Find:
- **Location**: Top of Billing page, above the stats cards

#### How to Test:
1. Look at **"Live Treatment Status"** section
2. Find patients with **"Documented"** status (green badge):
   - **Emma Wilson** - ready for payment
3. Click the **"Process Payment"** button next to any documented patient
4. Payment form opens immediately with treatment details

---

### 2.6️⃣ **Test Customer-Facing Payment View**

#### How to Access:
1. Open any payment form (from invoice or treatment status)
2. Click **"Flip to Customer"** button (blue, top right)

#### What Customers See:
- Clean iPad-like interface
- Clinic branding (Luxe Medical Spa)
- Provider name
- Service total
- **Tip selection**:
   - 15%, 18%, 20%, 25% presets
   - Custom tip option
   - "No Tip" button
- **Payment options**:
   - "Tap to Pay" (Apple Pay, Google Pay)
   - "Insert or Swipe Card"
- Simulated iPad status bar with time
- Success animation after payment

#### Testing Flow:
1. Click "Flip to Customer"
2. Customer selects tip (or no tip)
3. Click "Continue to Payment"
4. Choose "Tap to Pay" or "Insert Card"
5. See processing animation
6. Success screen appears
7. Returns to staff view

---

## 🔴 Known Issues & Future Improvements

### Current Limitations:
1. **Patient Profiles Not Implemented**: 
   - Credits, gift cards, and package balances should be viewable in patient profiles
   - Currently all in Settings which is not ideal

2. **Architecture Decisions Needed**:
   - **Packages in two places**: Need to decide between:
     - Option A: Keep both (Top Nav for operations, Settings for config)
     - Option B: Only in Settings
     - Option C: Only in Top Nav

3. **Missing Integrations**:
   - No real payment processor connection
   - No actual email delivery for gift cards
   - No real tokenization (simulated only)

### Recommended Next Steps:
1. **Build Patient Profile System**:
   - Move credits & refunds to patient profiles
   - Show patient's gift card balances
   - Display package usage history
   - Show payment history

2. **Clarify Navigation**:
   - Decide on single vs dual location for packages
   - Consider renaming for clarity:
     - Top Nav: "Sell Packages" (operational)
     - Settings: "Package Setup" (configuration)

---

## ✅ Quick Test Checklist

- [ ] Can see 6 invoices in Billing page (August 2025 dates)
- [ ] "Process Payment" button shows for unpaid invoices (no dollar amount)
- [ ] Can open payment form from invoice table
- [ ] Can open payment form from Live Treatment Status
- [ ] **"Flip to Customer"** button works
- [ ] Customer can select tip in customer view
- [ ] Can add tip and see total update
- [ ] Can select HSA/FSA and see notice
- [ ] Can view 3 saved cards
- [ ] Can create new gift card
- [ ] Can view gift card balances (Settings → Gift Cards → Manage tab)
- [ ] Can create patient credit
- [ ] Can process refund request
- [ ] Can create new package

---

## 📝 Sample Test Data

### Invoices (August 2025):
- `INV-2024-001`: Emma Thompson - $600 (Paid) - Aug 26
- `INV-2024-002`: Michael Rodriguez - $870 ($450 balance) - Aug 25 → **Has "Process Payment" button**
- `INV-2024-003`: Sofia Rodriguez - $585 (Paid) - Aug 24
- `INV-2024-004`: Jennifer Chang - $511.13 (Unpaid) - Aug 27 → **Has "Process Payment" button**
- `INV-2024-005`: Robert Johnson - $2000 (Paid) - Aug 20
- `INV-2024-006`: Emma Thompson - $3500 (Paid) - Aug 23

### Live Treatment Status:
- Sarah Johnson - Documenting (Room 1)
- Michael Chen - In Room (Room 2)
- **Emma Wilson - Documented (Room 3)** → Has "Process Payment" button
- Lisa Martinez - In Room (Room 4)
- David Park - Waiting
- Jennifer Wu - Waiting

### Gift Cards:
- Holiday card: $325 balance
- Birthday card: $250 (scheduled)
- Spa card: Fully redeemed

### Credits:
- Sarah Johnson: $150 goodwill
- Michael Chen: $75 remaining
- Emily Davis: Fully used

---

## 🛠️ Troubleshooting

### If invoices don't appear:
1. Invoices are dated August 2025
2. Date filters have been disabled for testing
3. Just refresh the page - they should always show

### If payment form doesn't open:
1. Make sure invoice has a balance (shown in Balance column)
2. Click "Process Payment" button (purple)
3. Or click from Live Treatment Status section

### If "Flip to Customer" doesn't work:
1. Must have payment form open first
2. Button is in top right of payment form
3. Blue button with rotation icon

### If features are missing:
1. Check you're in the right section (Settings vs Top Nav)
2. Some features are in Settings that should be in Patient Profiles (known issue)

---

**Last Updated**: August 27, 2025
**Version**: 1.1.0