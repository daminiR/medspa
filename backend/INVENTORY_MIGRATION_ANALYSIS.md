# Inventory Migration Analysis - Part 1

## Executive Summary

The inventory system currently uses in-memory Maps for data storage. This analysis covers the migration of two critical files:
- `inventory-lots.ts` (2,084 lines) - Lot management, alerts, open vials
- `inventory-adjustments.ts` (2,437 lines) - Transactions, waste, transfers, counts

**Critical Finding:** The Prisma schema currently has NO inventory models. All inventory models must be added to the schema before migration can proceed.

---

## Current State Analysis

### File 1: inventory-lots.ts

**Maps to Migrate (4):**

1. **lotsStore** → Needs `InventoryLot` model
   - Tracks lot numbers, expiration dates, quantities
   - FDA-compliant tracking with quarantine/recall workflows
   - Reconstitution tracking for injectables

2. **alertsStore** → Needs `InventoryAlert` model
   - Low stock, expiring, recall alerts
   - Severity levels (info, warning, critical)
   - Acknowledgment tracking

3. **openVialsStore** → Needs `OpenVialSession` model
   - **KEY DIFFERENTIATOR:** Multi-patient vial tracking
   - Stability timers for reconstituted products
   - Fractional unit support (e.g., 12.5 units)
   - Cost per patient calculations

4. **productsStore** → Use existing `Product` model (DOES NOT EXIST IN SCHEMA)
   - Mock data for product catalog
   - Should query real Product model when available

### File 2: inventory-adjustments.ts

**Maps to Migrate (9):**

1. **transactionsStore** → Needs `InventoryTransaction` model
   - All inventory movements (receive, use, adjust, transfer, waste)
   - Complete audit trail for FDA compliance
   - Links to patients, practitioners, invoices

2. **wasteRecordsStore** → Needs `WasteRecord` model
   - Categorized waste tracking (expired, contaminated, patient no-show, etc.)
   - Cost calculations
   - Practitioner accountability

3. **transfersStore** → Needs `InventoryTransfer` model
   - Inter-location transfers with approval workflow
   - Shipped/received quantity tracking
   - Status transitions (draft → requested → approved → in_transit → received)

4. **countsStore** → Needs `InventoryCount` model
   - Physical inventory counts (full, cycle, spot, category)
   - Variance detection and resolution
   - Approval workflow

5. **productsStore** → Needs `Product` model (lookup cache)
6. **lotsStore** → Use `InventoryLot` model (lookup cache)
7. **locationsStore** → Use existing `Location` model (EXISTS in schema)
8. **patientsStore** → Use existing `Patient` model (EXISTS in schema)
9. **providersStore** → Use existing `User` model (EXISTS in schema)

---

## Prisma Schema Status

### Existing Models (Can Use)
✅ `Patient` - Complete patient records
✅ `User` - Provider/staff records
✅ `Location` - Location data
✅ `Treatment` - Treatment records
✅ `ProductUsage` - Basic product usage tracking (limited fields)

### Missing Models (Must Create)
❌ `Product` - Product catalog
❌ `InventoryLot` - Lot tracking
❌ `InventoryAlert` - Alert management
❌ `OpenVialSession` - Multi-patient vial tracking
❌ `InventoryTransaction` - Transaction audit trail
❌ `WasteRecord` - Waste tracking
❌ `InventoryTransfer` - Transfer management
❌ `InventoryCount` - Physical count management
❌ `VialUsageRecord` - Individual vial usage events (relation to OpenVialSession)

---

## Required Prisma Schema Additions

### 1. Product Model
```prisma
model Product {
  id                String   @id @default(uuid())
  name              String
  sku               String?  @unique
  category          String
  subcategory       String?
  manufacturer      String?
  manufacturerId    String?

  // Injectable-specific
  isInjectable      Boolean  @default(false)
  unitsPerPackage   Int?
  unitType          String   // units, syringe, vial, ml, etc.

  // Reconstitution
  reconstitutionRequired Boolean @default(false)
  maxHoursAfterReconstitution Int?
  defaultDilution   Float?

  // Pricing
  costPrice         Float
  retailPrice       Float
  markup            Float?

  // Stock management
  reorderPoint      Int      @default(0)
  reorderQuantity   Int      @default(0)

  // Status
  isActive          Boolean  @default(true)
  requiresLotTracking Boolean @default(false)
  requiresSerialTracking Boolean @default(false)
  requiresRefrigeration Boolean @default(false)

  // Metadata
  description       String?
  notes             String?
  tags              String[]

  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  createdBy         String
  lastModifiedBy    String

  // Relations
  lots              InventoryLot[]
  transactions      InventoryTransaction[]
  alerts            InventoryAlert[]
  openVials         OpenVialSession[]

  @@index([category])
  @@index([isActive])
  @@index([sku])
}
```

### 2. InventoryLot Model
```prisma
model InventoryLot {
  id                String   @id @default(uuid())
  productId         String
  product           Product  @relation(fields: [productId], references: [id])

  // Lot identification
  lotNumber         String
  batchNumber       String?
  serialNumber      String?

  // Dates
  manufacturingDate DateTime?
  expirationDate    DateTime
  receivedDate      DateTime @default(now())
  openedDate        DateTime?

  // Quantities
  initialQuantity   Float
  currentQuantity   Float
  reservedQuantity  Float    @default(0)
  unitType          String

  // Reconstitution
  reconstitutionDetails Json?

  // Location
  locationId        String
  location          Location @relation(fields: [locationId], references: [id])
  storageLocation   String?

  // Purchase info
  purchaseOrderId   String?
  vendorId          String?
  vendorName        String?
  purchaseCost      Float

  // Status
  status            LotStatus @default(available)
  qualityNotes      String?

  // Recall tracking
  recallStatus      Json?

  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  createdBy         String
  lastUpdatedBy     String

  // Relations
  transactions      InventoryTransaction[]
  openVials         OpenVialSession[]
  wasteRecords      WasteRecord[]

  @@index([productId])
  @@index([lotNumber])
  @@index([expirationDate])
  @@index([locationId])
  @@index([status])
}

enum LotStatus {
  available
  quarantine
  expired
  recalled
  depleted
  damaged
}
```

### 3. InventoryAlert Model
```prisma
model InventoryAlert {
  id                String        @id @default(uuid())
  type              AlertType
  severity          AlertSeverity
  status            AlertStatus   @default(active)

  // Related entities
  productId         String?
  product           Product?      @relation(fields: [productId], references: [id])
  productName       String?
  lotId             String?
  lotNumber         String?
  locationId        String
  locationName      String

  // Alert content
  title             String
  message           String
  actionRequired    String?

  // Thresholds
  currentValue      Float?
  thresholdValue    Float?
  expirationDate    DateTime?
  daysUntilExpiration Int?

  // Acknowledgment
  acknowledgedBy    String?
  acknowledgedAt    DateTime?
  resolvedBy        String?
  resolvedAt        DateTime?
  resolution        String?

  // Notifications
  notificationSent  Boolean       @default(false)

  // Audit
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  @@index([type])
  @@index([severity])
  @@index([status])
  @@index([locationId])
}

enum AlertType {
  low_stock
  out_of_stock
  expiring_soon
  expired
  recall
  temperature_excursion
  variance_detected
  reorder_recommended
}

enum AlertSeverity {
  info
  warning
  critical
}

enum AlertStatus {
  active
  acknowledged
  resolved
  dismissed
}
```

### 4. OpenVialSession Model (KEY DIFFERENTIATOR)
```prisma
model OpenVialSession {
  id                String   @id @default(uuid())

  // Lot reference
  lotId             String
  lot               InventoryLot @relation(fields: [lotId], references: [id])
  lotNumber         String

  // Product reference
  productId         String
  product           Product  @relation(fields: [productId], references: [id])
  productName       String

  // Vial info
  vialNumber        Int
  originalUnits     Float
  currentUnits      Float
  usedUnits         Float    @default(0)
  wastedUnits       Float    @default(0)

  // Reconstitution
  reconstitutedAt   DateTime?
  reconstitutedBy   String?
  reconstitutedByName String?
  diluentType       String?
  diluentVolume     Float?
  concentration     String?

  // Stability tracking
  expiresAt         DateTime
  stabilityHoursTotal Int
  stabilityHoursRemaining Int
  isExpired         Boolean  @default(false)

  // Location
  locationId        String
  locationName      String
  storageLocation   String?

  // Status
  status            VialStatus @default(active)
  closedAt          DateTime?
  closedBy          String?
  closedReason      VialClosedReason?

  // Financial tracking
  vialCost          Float
  costPerUnitUsed   Float
  revenueGenerated  Float    @default(0)
  profitMargin      Float    @default(0)

  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  createdBy         String
  lastUpdatedBy     String

  // Relations
  usageRecords      VialUsageRecord[]

  @@index([lotId])
  @@index([productId])
  @@index([locationId])
  @@index([status])
  @@index([expiresAt])
}

model VialUsageRecord {
  id                String   @id @default(uuid())
  vialSessionId     String
  vialSession       OpenVialSession @relation(fields: [vialSessionId], references: [id], onDelete: Cascade)

  timestamp         DateTime @default(now())
  patientId         String
  patientName       String
  appointmentId     String
  practitionerId    String
  practitionerName  String
  unitsUsed         Float
  areasInjected     Json?
  chartId           String?
  notes             String?

  @@index([vialSessionId])
  @@index([patientId])
  @@index([timestamp])
}

enum VialStatus {
  active
  expired
  depleted
  discarded
}

enum VialClosedReason {
  depleted
  expired
  stability_exceeded
  contamination
  manual_close
}
```

### 5. InventoryTransaction Model
```prisma
model InventoryTransaction {
  id                String   @id @default(uuid())
  type              TransactionType
  status            TransactionStatus @default(completed)
  timestamp         DateTime @default(now())

  // Product/Lot
  productId         String
  product           Product  @relation(fields: [productId], references: [id])
  productName       String
  lotId             String
  lot               InventoryLot @relation(fields: [lotId], references: [id])
  lotNumber         String

  // Quantity
  quantity          Float
  unitType          String
  quantityBefore    Float
  quantityAfter     Float

  // Cost
  unitCost          Float
  totalCost         Float

  // Location
  locationId        String
  locationName      String

  // Related entities
  appointmentId     String?
  patientId         String?
  patientName       String?
  practitionerId    String?
  practitionerName  String?
  invoiceId         String?
  invoiceLineItemId String?
  purchaseOrderId   String?
  transferId        String?

  // Treatment details
  treatmentDetails  Json?

  // Reason & notes
  reason            String
  notes             String?

  // Approval
  performedBy       String
  performedByName   String
  approvedBy        String?
  approvedByName    String?
  approvalRequired  Boolean  @default(false)
  approvalTimestamp DateTime?

  // Metadata
  metadata          Json?

  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([type])
  @@index([status])
  @@index([timestamp])
  @@index([productId])
  @@index([lotId])
  @@index([locationId])
  @@index([patientId])
  @@index([practitionerId])
}

enum TransactionType {
  receive
  adjustment_add
  adjustment_remove
  treatment_use
  transfer_out
  transfer_in
  damage
  expiration
  recall
  return_vendor
  sale
  waste
  reconstitution
}

enum TransactionStatus {
  pending
  completed
  cancelled
  reversed
}
```

### 6. WasteRecord Model
```prisma
model WasteRecord {
  id                String   @id @default(uuid())

  // Lot reference
  lotId             String
  lot               InventoryLot @relation(fields: [lotId], references: [id])
  lotNumber         String

  // Product reference
  productId         String
  productName       String

  // Vial session (if applicable)
  openVialSessionId String?

  // Waste details
  unitsWasted       Float
  unitType          String
  reason            WasteReason
  reasonNotes       String?

  // Cost
  unitCost          Float
  totalWasteValue   Float

  // Who/when
  recordedBy        String
  recordedByName    String
  recordedAt        DateTime @default(now())

  // Location
  locationId        String
  locationName      String

  // Related entities
  practitionerId    String?
  practitionerName  String?
  appointmentId     String?

  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([lotId])
  @@index([reason])
  @@index([recordedAt])
  @@index([locationId])
}

enum WasteReason {
  expired_unused
  stability_exceeded
  contamination
  draw_up_loss
  patient_no_show
  adverse_reaction_discard
  training
  damaged
  recall
  other
}
```

### 7. InventoryTransfer Model
```prisma
model InventoryTransfer {
  id                String   @id @default(uuid())
  transferNumber    String   @unique

  // Locations
  sourceLocationId  String
  sourceLocationName String
  destinationLocationId String
  destinationLocationName String

  // Items (stored as JSON for flexibility)
  items             Json

  // Dates
  requestedDate     DateTime @default(now())
  approvedDate      DateTime?
  shippedDate       DateTime?
  receivedDate      DateTime?

  // Status
  status            TransferStatus @default(draft)

  // Shipping
  trackingNumber    String?
  carrier           String?

  // Value
  totalValue        Float

  // People
  requestedBy       String
  requestedByName   String
  approvedBy        String?
  approvedByName    String?
  shippedBy         String?
  shippedByName     String?
  receivedBy        String?
  receivedByName    String?

  // Notes
  requestNotes      String?
  approvalNotes     String?
  receivingNotes    String?

  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([transferNumber])
  @@index([status])
  @@index([sourceLocationId])
  @@index([destinationLocationId])
}

enum TransferStatus {
  draft
  requested
  approved
  in_transit
  received
  cancelled
}
```

### 8. InventoryCount Model
```prisma
model InventoryCount {
  id                String   @id @default(uuid())
  countNumber       String   @unique

  // Location
  locationId        String
  locationName      String

  // Type & filters
  countType         CountType
  categoryFilter    String?
  productFilter     String[]

  // Dates
  scheduledDate     DateTime
  startedAt         DateTime?
  completedAt       DateTime?
  approvedAt        DateTime?
  postedAt          DateTime?

  // Items (stored as JSON)
  items             Json

  // Metrics
  totalItems        Int      @default(0)
  countedItems      Int      @default(0)
  itemsWithVariance Int      @default(0)
  totalVarianceValue Float   @default(0)

  // Status
  status            CountStatus @default(draft)

  // People
  createdBy         String
  startedBy         String?
  completedBy       String?
  approvedBy        String?
  postedBy          String?

  // Notes
  notes             String?

  // Audit
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([countNumber])
  @@index([status])
  @@index([locationId])
}

enum CountType {
  full
  cycle
  spot
  category
}

enum CountStatus {
  draft
  in_progress
  completed
  approved
  posted
}
```

---

## Migration Strategy

### Phase 1: Schema Update (REQUIRED FIRST)
1. Add all 8 inventory models to `schema.prisma`
2. Run `npx prisma format` to validate syntax
3. Run `npx prisma migrate dev --name add_inventory_models`
4. Run `npx prisma generate` to update Prisma Client

### Phase 2: File-by-File Migration
Once schema is updated, migrate each file:

#### A. inventory-lots.ts Migration
1. Import Prisma client
2. Replace Map operations with Prisma queries
3. Keep business logic intact
4. Update type references to use Prisma types where possible

#### B. inventory-adjustments.ts Migration
1. Import Prisma client
2. Replace Map operations with Prisma queries
3. Convert FEFO logic to use Prisma findMany with orderBy
4. Maintain transaction integrity

### Phase 3: Testing & Validation
1. Test all CRUD operations
2. Verify FEFO logic still works
3. Test complex workflows (transfers, counts)
4. Validate audit trail integrity

---

## Next Steps

**BLOCKER:** Cannot proceed with code migration until Prisma schema includes inventory models.

**Options:**
1. **Recommended:** Add all 8 models to schema.prisma, run migration, then migrate code
2. **Alternative:** Create models incrementally, migrate in smaller chunks
3. **Temporary:** Keep Maps as cache layer, add Prisma persistence alongside

**Decision Required:** Which approach should we take?
