# Package Credit System Documentation

## Overview
The package system allows medical spas to sell bundled services at a discount. Patients pay upfront and receive credits they can redeem over time.

## Key Concepts

### What is a Package?
- **Bundle of services** sold together at a discount
- **Prepaid credits** that patients use over multiple visits
- **Time-limited** - typically valid for 6-12 months
- **Non-refundable** but transferable in some cases

### Common Package Examples
1. **Botox Bundle**: Buy 3 sessions, save 15%
2. **Glow Package**: 3 Chemical Peels + 2 Facials for $800
3. **Lip Filler Series**: 2 syringes for $1,100 (save $200)
4. **VIP Treatment Plan**: 6 treatments of choice for $3,000

## Package Selling Workflow

### Step 1: Patient Decides to Purchase
- During consultation
- After successful treatment (upsell)
- Walk-in specifically for package
- Phone/online inquiry

### Step 2: Front Desk Sells Package
1. Go to **Billing & Payments** → **Packages** tab
2. Click **"Sell Package"** on desired package
3. **Search and select patient**
4. Choose **quantity** (if buying multiple)
5. Select **payment method**:
   - **Credit Card**: Flips to customer screen
   - **Cash**: Processes immediately
   - **Other**: Gift card, check, etc.

### Step 3: Payment Processing

#### Credit Card Flow (Flip to Customer):
1. Staff clicks **"Flip to Customer"**
2. Screen rotates to customer-facing payment
3. Customer sees:
   - Clean payment interface
   - Service details
   - Total amount
   - Payment options (Insert/Swipe/Tap)
4. Customer completes payment
5. Success screen shows
6. Returns to staff view

#### Cash/Other Flow:
- Processes immediately
- Staff handles physical payment
- System records transaction

### Step 4: Credits Applied
After successful payment:
- **Credits added** to patient account
- **Expiry date set** (365 days default)
- **Email sent** with package details
- **Receipt generated**

### Example Credit Allocation:
```
Botox Bundle Package (3 sessions) - $1,350
├── Botox Credit: 3 sessions (0 used, 3 remaining)
├── Purchase Date: Nov 28, 2024
├── Expiry Date: Nov 28, 2025
└── Status: Active
```

## Package Redemption Workflow

### At Checkout:
1. Patient completes service
2. Front desk opens checkout
3. System shows **available credits**
4. Staff applies package credit
5. No payment needed if covered
6. Updates remaining credits

### Credit Tracking:
```
Sarah Johnson's Credits:
┌─────────────────────────────────────┐
│ Botox Bundle                       │
│ Remaining: 2/3 sessions            │
│ Expires: Nov 28, 2025              │
│                                     │
│ Usage History:                     │
│ • Dec 15: Used 1 Botox (Dr. Smith) │
└─────────────────────────────────────┘
```

## Business Rules

### Package Policies:
- **Non-refundable** once purchased
- **Non-transferable** (except special cases)
- **Cannot combine** with other discounts
- **Must use within** validity period
- **No cash value** for unused credits

### Expiry Handling:
- **30 days before**: Email reminder
- **7 days before**: Final reminder
- **After expiry**: Credits marked expired
- **Grace period**: Admin can override if needed

## Financial Tracking

### Revenue Recognition:
- **At Sale**: Full amount recorded
- **Deferred Revenue**: Until services rendered
- **Monthly Reports**: Show redemption rates

### Package Analytics:
```
Package Performance (Monthly):
• Packages Sold: 45 ($67,500)
• Credits Redeemed: 112 sessions
• Expiring Soon: 8 packages
• Redemption Rate: 78%
• Avg Days to Redeem: 45
```

## Customer Experience

### What Patients See:
1. **At Purchase**: Clear pricing and savings
2. **Email Confirmation**: Package details and expiry
3. **Patient Portal**: Remaining credits
4. **At Visit**: Credits automatically suggested
5. **Reminders**: Before expiry

### Benefits for Patients:
- **Guaranteed pricing** (price lock)
- **Significant savings** (15-25% typically)
- **Convenience** (pre-paid)
- **Priority booking** (package holders)

## Staff Interface Features

### Package Management:
- View all active packages
- Check credit balances
- Apply credits at checkout
- Override expiry if needed
- Transfer credits (manager only)

### Quick Actions:
- **Sell Package**: Full workflow
- **Check Balance**: Patient lookup
- **Apply Credit**: During checkout
- **Extend Expiry**: Manager approval
- **View History**: All redemptions

## Integration Points

### With Other Systems:
1. **Appointment Booking**: Shows available credits
2. **Patient Profile**: Displays package balances
3. **Provider App**: Can view but not modify
4. **Reports**: Package sales and redemption
5. **Email**: Automated reminders

## Common Scenarios

### Scenario 1: Upsell After Service
```
Patient just had Botox → Happy with results →
Staff: "You could save $450 with our 3-session package"
→ Patient agrees → Sell package → Applied to future visits
```

### Scenario 2: Package Near Expiry
```
System alert: "Emma has 2 unused sessions expiring in 30 days"
→ Front desk calls patient → Books appointments
→ Credits used before expiry
```

### Scenario 3: Partial Credit Use
```
Patient has 1 Botox credit → Wants extra units →
Pay difference: Credit covers $450, patient pays $150 extra
```

## Best Practices

### For Front Desk:
1. **Always mention** package savings during checkout
2. **Check credits** before processing payment
3. **Remind patients** of expiring credits
4. **Explain clearly** what's included
5. **Print/email** package details

### For Management:
1. **Price packages** at 15-25% discount
2. **Set reasonable** expiry (6-12 months)
3. **Track redemption** rates monthly
4. **Train staff** on upselling
5. **Honor credits** even if prices increase

## Testing the Feature

### Test Package Sale:
1. Go to Packages tab
2. Click "Sell Package"
3. Search "sarah" and select
4. Choose Credit Card
5. Click "Flip to Customer"
6. See customer payment screen
7. Click payment method
8. Watch success animation
9. Returns to staff view

### What to Verify:
- ✅ Patient search works
- ✅ Quantity changes price
- ✅ Payment screen appears
- ✅ Success message shows
- ✅ Credits would be added (in real system)

## Future Enhancements

### Planned Features:
- Online package purchase
- Auto-renewal memberships
- Family sharing of credits
- Partial credit redemption
- Package upgrade options
- Mobile app integration

---

*The package system drives revenue through upfront payment while providing value to patients through bundled savings.*