# Billing Module - Completion Guide with Jane App References

## 🔴 Priority 1: Quick Fixes (1-2 days)

### 1. Before/After Photo Attachment
**Current State**: Injectable billing has zones but no photos
**Target State**: Complete photo documentation

**Files to Modify:**
- `/apps/admin/src/components/billing/InjectableBilling.tsx`
- `/apps/admin/src/components/billing/DocumentationFaceChart.tsx`

**Jane App References:**
- Look for: `How_to_Face_Chart.md`
- Look for: `Adding_Photos_to_Charts.md`
- Look for: `Image_Management_in_Jane.md`

**Integration Points:**
- Link photos to `Treatment` interface
- Store with injection documentation
- Connect to patient profile (when built)

**Implementation:**
```typescript
interface TreatmentPhotos {
  before: {
    front?: string
    left?: string
    right?: string
    angle45Left?: string
    angle45Right?: string
    timestamp: Date
  }
  after: {
    front?: string
    left?: string
    right?: string
    angle45Left?: string
    angle45Right?: string
    timestamp: Date
  }
  consentSigned: boolean
}
```

### 2. Product Inventory Deduction
**Current State**: Tracks lot numbers but doesn't deduct
**Target State**: Auto-deduct from inventory

**Files to Modify:**
- `/apps/admin/src/components/billing/InjectableBilling.tsx`
- `/apps/admin/src/types/billing.ts`

**Jane App References:**
- Look for: `Products_Hub.md`
- Look for: `Inventory_Management.md`
- Look for: `Product_Deduction_from_Charts.md`

**Integration Points:**
- Connect to product inventory system
- Update after payment confirmation
- Track in `InjectionDetails` interface

**Backend Requirements:**
```typescript
// POST /api/inventory/deduct
{
  productId: string
  quantity: number
  unitType: 'unit' | 'syringe'
  lotNumber: string
  treatmentId: string
}
```

---

## 🟡 Priority 2: Financial Reports (Week 1)

### 3. Daily Cash Reconciliation
**Current State**: No reporting
**Target State**: End-of-day reconciliation

**New Files to Create:**
- `/apps/admin/src/components/reports/DailyCashReconciliation.tsx`
- `/apps/admin/src/components/reports/ReportsLayout.tsx`
- `/apps/admin/src/app/reports/page.tsx`

**Jane App References:**
- Look for: `Daily_Cash_Reconciliation.md`
- Look for: `End_of_Day_Report.md`
- Look for: `Cash_Drawer_Management.md`
- Look for: `Bookkeeping_Hub.md`

**Data Sources:**
- Pull from `mockInvoices` (currently)
- Filter by date and payment method
- Group by provider and service

**Report Sections:**
```typescript
interface DailyReconciliation {
  date: Date
  cashTransactions: {
    startingCash: number
    cashPayments: number
    cashRefunds: number
    expectedEndingCash: number
    actualEndingCash?: number
    variance?: number
  }
  creditTransactions: {
    visa: number
    mastercard: number
    amex: number
    other: number
    total: number
  }
  otherPayments: {
    checks: number
    giftCards: number
    packages: number
    credits: number
  }
  summary: {
    totalRevenue: number
    totalRefunds: number
    netRevenue: number
  }
}
```

### 4. Revenue Analytics Dashboard
**New Files to Create:**
- `/apps/admin/src/components/reports/RevenueAnalytics.tsx`
- `/apps/admin/src/components/reports/ProviderPerformance.tsx`

**Jane App References:**
- Look for: `Jane_Payments_Monthly_Processing_Report.md`
- Look for: `Financial_Reports.md`
- Look for: `Provider_Commission_Reports.md`

**Charts to Include:**
- Daily/Weekly/Monthly trends
- Service category breakdown
- Provider performance
- Payment method distribution

### 5. Export Capabilities
**New Files to Create:**
- `/apps/admin/src/utils/exporters/QuickBooksExporter.ts`
- `/apps/admin/src/utils/exporters/CSVExporter.ts`

**Jane App References:**
- Look for: `Importing_Sales_to_Quickbooks_Online_QBO_from_Jane.md`
- Look for: `Importing_Sales_to_Xero_from_Jane.md`
- Look for: `Accounting_Software_and_Jane.md`

**Export Formats:**
```typescript
interface QuickBooksExport {
  transactionDate: string
  transactionType: 'Sales Receipt' | 'Invoice'
  customerName: string
  itemName: string
  itemQuantity: number
  itemRate: number
  taxAmount: number
  totalAmount: number
  paymentMethod: string
  depositAccount: string
}
```

---

## 🟢 Priority 3: Advanced Features (Week 2)

### 6. Package Usage Reports
**Files to Reference:**
- `/apps/admin/src/components/packages/PackageList.tsx`
- `/apps/admin/src/components/packages/PackageRedemption.tsx`

**Jane App References:**
- Look for: `How_to_Manage_a_Wallet_or_Bank_Style_Package.md`
- Look for: `Package_Reports.md`
- Look for: `Package_Analytics.md`

**Report Metrics:**
```typescript
interface PackageAnalytics {
  packageId: string
  packageName: string
  soldCount: number
  totalRevenue: number
  redemptionRate: number
  averageUsageDays: number
  expirationRate: number
  customerRetention: number
}
```

### 7. Gift Card Liability Report
**Files to Reference:**
- `/apps/admin/src/components/payments/GiftCardManager.tsx`

**Jane App References:**
- Look for: `Gift_Card_Reports.md`
- Look for: `Gift_Card_Liability.md`

---

## 🔗 Integration Matrix

### Existing Components to Enhance:
| Component | Add Feature | Jane Reference | Priority |
|-----------|------------|----------------|----------|
| `InjectableBilling.tsx` | Photo capture | `Face_Chart.md` | High |
| `InjectableBilling.tsx` | Inventory deduct | `Products_Hub.md` | High |
| `TreatmentStatus.tsx` | Link to reports | `Daily_Reports.md` | Medium |
| `PaymentForm.tsx` | Receipt generation | `Receipts.md` | Medium |
| `PackageList.tsx` | Usage analytics | `Package_Reports.md` | Low |

### New Components to Create:
| Component | Purpose | Jane Reference | Priority |
|-----------|---------|----------------|----------|
| `DailyCashReconciliation.tsx` | EOD close | `Cash_Drawer.md` | High |
| `RevenueAnalytics.tsx` | Financial insights | `Financial_Reports.md` | Medium |
| `QuickBooksExporter.ts` | Accounting export | `QBO_Export.md` | Medium |
| `InventoryManager.tsx` | Product tracking | `Inventory.md` | Low |

### API Endpoints Needed:
```typescript
// Reports
GET  /api/reports/daily-reconciliation?date=2025-08-27
GET  /api/reports/revenue-analytics?start=2025-08-01&end=2025-08-31
GET  /api/reports/provider-performance?providerId=xxx

// Inventory
POST /api/inventory/deduct
GET  /api/inventory/levels
PUT  /api/inventory/adjust

// Exports
GET  /api/export/quickbooks?start=2025-08-01&end=2025-08-31
GET  /api/export/csv?type=transactions&date=2025-08-27
```

---

## 📊 Testing Data Requirements

### For Reports Testing:
- Generate 30+ days of invoice data
- Mix of payment methods
- Multiple providers
- Various services
- Some refunds and credits

### For Inventory Testing:
- Create product inventory records
- Set reorder points
- Add lot numbers
- Track expiration dates

---

## 🚀 Implementation Order

### Day 1: Photos & Inventory
1. Add camera capture to injectable billing
2. Create photo storage interface
3. Add inventory deduction logic
4. Test with mock data

### Day 2: Basic Reporting
1. Create reports layout/navigation
2. Build daily cash reconciliation
3. Add CSV export
4. Test with existing invoice data

### Day 3-4: Analytics
1. Build revenue dashboard
2. Add provider performance
3. Create package analytics
4. Add gift card liability

### Day 5: Exports
1. QuickBooks format
2. Xero format
3. Generic CSV
4. PDF reports

---

## Success Criteria
- [ ] Photos can be captured and stored
- [ ] Inventory auto-deducts on payment
- [ ] Daily report matches manual calculation
- [ ] Exports work with QuickBooks
- [ ] All reports load in < 2 seconds
- [ ] Data is accurate to the penny

---

*Next Step: After completing these, move to Charting Module*