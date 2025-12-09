# Billing Enhancement Testing Guide
**Last Updated: August 27, 2025**

## Overview
This guide covers testing for the newly implemented billing enhancements:
1. Before/After Photo Capture
2. Inventory Management & Auto-deduction
3. Daily Cash Reconciliation Report

---

## 1. Photo Documentation Testing

### Location: Injectable Billing Calculator
**Path:** Billing → Live Treatment Status → Select Patient → Process Payment → Injectable Billing

### Test Cases:

#### 1.1 Photo Consent Requirement
- [ ] Open Injectable Billing Calculator
- [ ] Click "Add Photos" in the Photo Documentation section
- [ ] Verify photo upload buttons are disabled without consent
- [ ] Check the "Patient has signed photo consent form" checkbox
- [ ] Verify photo upload buttons become enabled

#### 1.2 Photo Upload Grid
- [ ] With consent checked, verify 6 photo slots appear:
  - Before: Front, Left, Right
  - After: Front, Left, Right
- [ ] Click each photo slot to simulate upload
- [ ] Verify placeholder images appear
- [ ] Verify photo count badge updates (e.g., "3 photos")

#### 1.3 Photo Management
- [ ] Upload several test photos
- [ ] Hover over uploaded photos to see delete button
- [ ] Click delete button (trash icon) to remove a photo
- [ ] Verify photo is removed and count updates

#### 1.4 Photo Metadata in Invoice
- [ ] Complete injectable billing with photos
- [ ] Add to invoice
- [ ] Verify photos are included in line item metadata
- [ ] Check that photoConsentSigned flag is saved

### Expected Results:
- Photos cannot be added without consent
- All 6 photo angles can be captured
- Photos are saved with treatment documentation
- Photo count accurately reflects uploaded images

---

## 2. Inventory Management Testing

### Location: Injectable Billing Calculator
**Path:** Billing → Injectable Billing → Inventory Tracking section

### Test Cases:

#### 2.1 Inventory Tracking Display
- [ ] Open Injectable Billing Calculator
- [ ] Verify "Inventory Tracking" section shows:
  - Lot Number input field
  - Expiration Date picker
  - Auto-deduct toggle switch (default ON)

#### 2.2 Auto-deduction Toggle
- [ ] Verify toggle is ON by default (green)
- [ ] Click toggle to turn OFF (gray)
- [ ] Add treatment to invoice
- [ ] Verify inventoryDeduction flag in metadata matches toggle state

#### 2.3 Lot Number Entry
- [ ] Enter lot number "LOT2025TEST123"
- [ ] Enter expiration date "12/31/2025"
- [ ] Add to invoice
- [ ] Verify lot number and expiration saved in metadata

### Inventory Manager Component Testing

#### 2.4 Access Inventory Manager
**Note:** This is a standalone component for demo purposes
- [ ] Component displays at `/components/inventory/InventoryManager`
- [ ] View current stock levels for:
  - Botox® (850 units)
  - Dysport® (1200 units)
  - Juvéderm® Ultra (24 syringes)
  - Restylane®-L (8 syringes)

#### 2.5 Low Stock Alerts
- [ ] Verify yellow "Low Stock Alert" appears for Restylane (8 < 10 reorder point)
- [ ] Check alert lists specific products below reorder point

#### 2.6 Expiration Alerts
- [ ] If any lots expire within 30 days, verify red alert appears
- [ ] Alert should list specific lots and expiration dates

#### 2.7 Stock Details
- [ ] Click "View Details" on any product
- [ ] Modal shows:
  - Current stock level
  - Reorder point
  - All lot numbers with quantities
  - Expiration dates
- [ ] Click "Test Deduct 10" button
- [ ] Verify stock level decreases by 10
- [ ] Close modal

### Expected Results:
- Inventory tracking fields capture lot and expiration data
- Auto-deduct toggle controls whether inventory decreases on payment
- Low stock alerts appear when below reorder points
- Expiration warnings show for lots expiring within 30 days

---

## 3. Daily Cash Reconciliation Testing

### Location: Reports Module
**Path:** Reports → Daily Cash Reconciliation

### Test Cases:

#### 3.1 Report Access
- [ ] Navigate to Reports from main menu
- [ ] Verify "Daily Cash Reconciliation" card is enabled
- [ ] Click to open report
- [ ] Verify report shows today's date (August 27, 2025)

#### 3.2 Key Metrics Display
- [ ] Verify 4 metric cards show:
  - Gross Revenue: $13,490.00
  - Net Revenue: $12,915.00
  - Transactions: 28
  - Patients: 24 (+3 new)

#### 3.3 Cash Drawer Reconciliation
- [ ] Review cash reconciliation section:
  - Opening Cash: $500.00
  - Cash Sales: +$2,350.00
  - Cash Refunds: -$50.00
  - Expected Cash: $2,850.00
- [ ] Enter actual cash count: 2847
- [ ] Click "Reconcile" button
- [ ] Verify variance shows: -$3.00
- [ ] Verify "Acceptable" status (variance ≤ $5)

#### 3.4 Test Large Variance
- [ ] Enter actual cash: 2800
- [ ] Click "Reconcile"
- [ ] Verify variance: -$50.00
- [ ] Verify "Review Required" warning (variance > $5)

#### 3.5 Payment Methods Breakdown
- [ ] Verify payment methods show with progress bars:
  - Cash: $2,350
  - Credit Card: $8,456
  - Debit Card: $1,234
  - Check: $500
  - Gift Card: $300
  - Package Credit: $650
- [ ] Verify percentages visualized correctly
- [ ] Total Payments: $13,490

#### 3.6 Revenue by Service
- [ ] Verify service breakdown shows:
  - Injectables: $7,250
  - Facials: $1,200
  - Laser: $2,400
  - Products: $890
  - Packages: $1,750
- [ ] Progress bars show relative percentages

#### 3.7 Adjustments Section
- [ ] Verify adjustments display:
  - Discounts: -$450
  - Refunds: -$125
  - Tips: +$285
  - Net Adjustments calculated correctly

#### 3.8 End of Day Notes
- [ ] Enter test notes in text area
- [ ] Verify "Complete Day Close" button is visible
- [ ] Click button (simulated - no backend)

#### 3.9 Report Actions
- [ ] Click "Print" button (verify action triggered)
- [ ] Click "Export" button (verify action triggered)

### Expected Results:
- Report displays comprehensive daily financial summary
- Cash reconciliation calculates variance accurately
- All payment methods tracked and visualized
- Service revenue properly categorized
- Adjustments (tips, discounts, refunds) calculated correctly

---

## 4. Integration Testing

### Test Complete Workflow:

#### 4.1 Full Injectable Treatment with Photos & Inventory
1. [ ] Go to Billing → Live Treatment Status
2. [ ] Select Emma Thompson (or any patient)
3. [ ] Click "Process Payment"
4. [ ] Open Injectable Billing Calculator
5. [ ] Select Botox® Cosmetic
6. [ ] Add treatment areas (e.g., Forehead, Crow's Feet)
7. [ ] Enter Lot Number: "TEST2025"
8. [ ] Enter Expiration: "12/31/2025"
9. [ ] Ensure "Auto-deduct from inventory" is ON
10. [ ] Click "Add Photos"
11. [ ] Check consent checkbox
12. [ ] Add at least 3 test photos
13. [ ] Add notes: "Test treatment with photos"
14. [ ] Click "Add to Invoice"
15. [ ] Verify all data appears in invoice

#### 4.2 Verify in Reports
1. [ ] Navigate to Reports
2. [ ] Open Daily Cash Reconciliation
3. [ ] Verify the injectable treatment appears in:
   - Service revenue (Injectables category)
   - Transaction count increased
4. [ ] Perform cash reconciliation
5. [ ] Add end of day notes

---

## Common Issues & Troubleshooting

### Photos Not Uploading
- **Issue:** Click on photo slot but nothing happens
- **Solution:** Ensure photo consent checkbox is checked first

### Inventory Toggle Not Working
- **Issue:** Toggle appears stuck
- **Solution:** Click directly on the switch, not the text

### Cash Reconciliation Variance
- **Issue:** Large unexplained variance
- **Solution:** Review all cash transactions in payment breakdown

### Report Not Loading
- **Issue:** Daily Cash Reconciliation shows blank
- **Solution:** Ensure you're on the Reports page and click the report card

---

## Test Data Reference

### Mock Inventory Levels:
- Botox®: 850 units (Reorder at 200)
- Dysport®: 1200 units (Reorder at 600)
- Juvéderm® Ultra: 24 syringes (Reorder at 10)
- Restylane®-L: 8 syringes (Reorder at 10) ⚠️ LOW STOCK

### Daily Report Test Data:
- Date: August 27, 2025
- Opening Cash: $500
- Expected End Cash: $2,850
- Total Revenue: $13,490
- Transactions: 28
- Patients: 24 (3 new)

---

## Success Criteria

✅ **Photo Documentation:**
- Can capture all 6 photo angles
- Consent required before upload
- Photos saved with treatment

✅ **Inventory Management:**
- Lot numbers tracked
- Auto-deduction toggleable
- Low stock alerts functional

✅ **Daily Cash Report:**
- All payment methods tracked
- Variance calculation accurate
- Service breakdown complete
- Export/Print options available

---

## Notes for Developers

- Photos currently use placeholder images (production would use actual camera/upload)
- Inventory deduction is simulated (no backend API yet)
- Reports use mock data for August 27, 2025
- All features are frontend-only demonstrations

---

*Testing Guide Version: 1.0*
*Created: August 27, 2025*
*Platform: Medical Spa Admin Portal*