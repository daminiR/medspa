# Inventory Part 2 Migration Summary

## Overview
Migration of 3 files from in-memory Maps to Prisma database operations.

## File 1: group-bookings.ts ✅ PARTIALLY MIGRATED

### Maps Identified
- `groupsStore` - Map<string, GroupBooking> → **MIGRATED to prisma.groupBooking**
- `inviteCodeIndex` - Map<string, string> → **REMOVED** (using unique index on inviteCode field)

### Prisma Models Available
- ✅ `GroupBooking` model exists in schema (lines 197-230)
- ✅ `GroupParticipant` model exists in schema (lines 232-261)
- ✅ Unique index on `inviteCode` field

### Changes Made
1. ✅ Added Prisma imports
2. ✅ Removed Map declarations
3. ✅ Removed mock data initialization (220 lines of mock data)
4. ✅ Updated `generateId()` and `generateParticipantId()` to use crypto.randomUUID()
5. ✅ Updated `generateInviteCode()` to async function using Prisma for uniqueness checks
6. ✅ Updated `checkParticipantConflicts()` to async function using Prisma queries
7. ✅ Migrated `GET /join/:code` route to use Prisma

### Routes Requiring Manual Migration (Remaining)

#### POST /join/:code (lines 527-659)
**Pattern:**
```typescript
// OLD:
const groupId = inviteCodeIndex.get(code.toUpperCase());
const group = groupsStore.get(groupId);
group.participants.push(participant);

// NEW:
const group = await prisma.groupBooking.findUnique({
  where: { inviteCode: code.toUpperCase() },
  include: { GroupParticipant: true }
});
const participant = await prisma.groupParticipant.create({
  data: { ...participantData }
});
await prisma.groupBooking.update({
  where: { id: group.id },
  data: {
    totalAmount,
    endTime,
    updatedAt: new Date()
  }
});
```

#### GET / - List groups (lines 668-722)
```typescript
// OLD:
let results = Array.from(groupsStore.values());
results = results.filter(g => g.status === query.status);

// NEW:
const where: Prisma.GroupBookingWhereInput = {};
if (query.status) where.status = query.status.toUpperCase() as any;
if (query.type) where.type = query.type.toUpperCase() as any;
if (query.organizerId) where.organizerId = query.organizerId;
if (query.dateFrom) where.date = { gte: query.dateFrom };
if (query.dateTo) where.date = { ...where.date, lte: query.dateTo };
if (query.locationId) where.locationId = query.locationId;

const results = await prisma.groupBooking.findMany({
  where,
  include: { GroupParticipant: true },
  orderBy: { date: 'asc' },
  skip: (query.page - 1) * query.limit,
  take: query.limit,
});
const total = await prisma.groupBooking.count({ where });
```

#### GET /:id - Get single group (lines 910-927)
```typescript
// OLD:
const group = groupsStore.get(id);

// NEW:
const group = await prisma.groupBooking.findUnique({
  where: { id },
  include: { GroupParticipant: true }
});
```

#### POST / - Create group (lines 933-1000)
```typescript
// OLD:
groupsStore.set(id, group);
inviteCodeIndex.set(inviteCode, id);

// NEW:
const inviteCode = await generateInviteCode(data.name);
const group = await prisma.groupBooking.create({
  data: {
    id: generateId(),
    name: data.name,
    type: data.type.toUpperCase() as any,
    // ... all other fields
    inviteCode,
  }
});
```

#### PUT /:id - Update group (lines 1006-1082)
```typescript
// OLD:
const group = groupsStore.get(id);
if (data.name !== undefined) group.name = data.name;

// NEW:
const group = await prisma.groupBooking.findUnique({ where: { id } });
await prisma.groupBooking.update({
  where: { id },
  data: {
    name: data.name,
    // ... other fields
    updatedAt: new Date()
  }
});
```

#### DELETE /:id - Cancel/Delete group (lines 1085-1121)
```typescript
// OLD:
groupsStore.delete(id);

// NEW:
await prisma.groupBooking.update({
  where: { id },
  data: { status: 'CANCELLED', updatedAt: new Date() }
});
// OR for hard delete:
await prisma.groupBooking.delete({ where: { id } });
```

#### POST /:id/participants - Add participant (lines 1125-1243)
```typescript
// OLD:
group.participants.push(participant);

// NEW:
const participant = await prisma.groupParticipant.create({
  data: {
    id: generateParticipantId(),
    groupId: group.id,
    // ... all fields
  }
});
// Recalculate group totals
const participants = await prisma.groupParticipant.findMany({
  where: { groupId: group.id }
});
await prisma.groupBooking.update({
  where: { id: group.id },
  data: {
    totalAmount: calculateTotalAmount(participants),
    endTime: calculateEndTime(participants),
  }
});
```

#### PUT /:id/participants/:participantId - Update participant (lines 1246-1359)
```typescript
// OLD:
const participant = group.participants.find(p => p.id === participantId);
Object.assign(participant, data);

// NEW:
await prisma.groupParticipant.update({
  where: { id: participantId },
  data: {
    ...data,
    updatedAt: new Date()
  }
});
```

#### DELETE /:id/participants/:participantId - Remove participant (lines 1362-1423)
```typescript
// OLD:
group.participants = group.participants.filter(p => p.id !== participantId);

// NEW:
await prisma.groupParticipant.update({
  where: { id: participantId },
  data: { status: 'CANCELLED', updatedAt: new Date() }
});
// OR hard delete:
await prisma.groupParticipant.delete({ where: { id: participantId } });
```

#### POST /:id/check-in - Check in participants (lines 1426-1525)
```typescript
// OLD:
for (const participant of group.participants) {
  if (participantIds.includes(participant.id)) {
    participant.status = 'arrived';
    participant.checkedInAt = now;
  }
}

// NEW:
await prisma.groupParticipant.updateMany({
  where: {
    id: { in: participantIds },
    groupId: id,
  },
  data: {
    status: 'ARRIVED',
    checkedInAt: new Date(),
    updatedAt: new Date()
  }
});
```

### Important Notes for group-bookings.ts
1. **Enum Conversion**: Schema uses UPPERCASE enums (DRAFT, CONFIRMED, etc.), code uses lowercase. Need to convert when reading/writing.
2. **Participant Relations**: Use `include: { GroupParticipant: true }` to get participants with group.
3. **Date Handling**: Prisma returns Date objects for DateTime fields. Convert with `.toISOString()` if needed.
4. **Status Checks**: Update status comparisons to use UPPERCASE: `'CANCELLED'` not `'cancelled'`
5. **Recalculation**: When participants change, recalculate `totalAmount`, `paidAmount`, `endTime` on group.

### Testing Requirements
- Create integration tests for all routes
- Test invite code uniqueness
- Test participant conflict detection
- Test status transitions
- Test pagination and filtering

---

## File 2: purchase-orders.ts ⏳ NOT YET MIGRATED

### Maps Identified (5 Maps)
1. `purchaseOrdersStore` - Map<string, StoredPurchaseOrder>
2. `vendorsStore` - Map<string, StoredVendor>
3. `receivingHistoryStore` - Map<string, StoredReceivingRecord[]>
4. `locationsStore` - Map<string, MockLocation>
5. `inventoryLotsStore` - Map<string, StoredInventoryLot>

### Schema Status: ❌ MODELS MISSING
**CRITICAL**: These models DO NOT exist in the Prisma schema yet!

### Required Schema Additions
```prisma
model PurchaseOrder {
  id                   String                  @id
  orderNumber          String                  @unique
  vendorId             String
  vendorName           String
  locationId           String
  orderDate            DateTime                @default(now())
  expectedDeliveryDate DateTime?
  actualDeliveryDate   DateTime?
  subtotal             Float
  taxAmount            Float                   @default(0)
  shippingCost         Float                   @default(0)
  discount             Float                   @default(0)
  total                Float
  status               PurchaseOrderStatus     @default(DRAFT)
  paymentStatus        PaymentStatus           @default(PENDING)
  paymentTerms         String?
  paymentMethod        String?
  trackingNumber       String?
  carrier              String?
  internalNotes        String?
  vendorNotes          String?
  createdAt            DateTime                @default(now())
  updatedAt            DateTime                @updatedAt
  createdBy            String
  submittedBy          String?
  submittedAt          DateTime?
  approvedBy           String?
  approvedAt           DateTime?
  receivedBy           String?
  receivedAt           DateTime?
  cancelledAt          DateTime?
  cancelledBy          String?

  items                PurchaseOrderItem[]
  receivingRecords     ReceivingRecord[]

  @@index([orderNumber])
  @@index([vendorId])
  @@index([status])
  @@index([orderDate])
}

model PurchaseOrderItem {
  id                 String        @id
  purchaseOrderId    String
  productId          String
  productName        String
  sku                String
  quantityOrdered    Float
  quantityReceived   Float         @default(0)
  quantityPending    Float
  unitType           UnitType      @default(UNIT)
  unitCost           Float
  totalCost          Float
  discount           Float?
  discountType       DiscountType?
  finalCost          Float
  notes              String?

  purchaseOrder      PurchaseOrder @relation(fields: [purchaseOrderId], references: [id], onDelete: Cascade)
  receivedLots       ReceivedLot[]

  @@index([purchaseOrderId])
  @@index([productId])
}

model ReceivedLot {
  id                 String            @id
  itemId             String
  lotNumber          String
  quantity           Float
  expirationDate     DateTime
  manufacturingDate  DateTime?
  receivedAt         DateTime
  receivedBy         String
  storageLocation    String?

  item               PurchaseOrderItem @relation(fields: [itemId], references: [id], onDelete: Cascade)

  @@index([itemId])
  @@index([lotNumber])
}

model ReceivingRecord {
  id               String            @id
  purchaseOrderId  String
  receivedAt       DateTime          @default(now())
  receivedBy       String
  receivedByName   String
  notes            String?
  createdAt        DateTime          @default(now())

  purchaseOrder    PurchaseOrder     @relation(fields: [purchaseOrderId], references: [id], onDelete: Cascade)
  items            Json              // Array of { itemId, productId, productName, quantityReceived, lots }

  @@index([purchaseOrderId])
  @@index([receivedAt])
}

model Vendor {
  id                  String   @id
  name                String
  shortName           String
  contactName         String?
  email               String?
  phone               String?
  fax                 String?
  website             String?
  address             Json?    // { street, city, state, zipCode, country }
  accountNumber       String?
  paymentTerms        String?
  taxId               String?
  productIds          String[]
  primaryCategory     String?
  averageLeadDays     Int      @default(7)
  onTimeDeliveryRate  Float?
  qualityRating       Float?
  isActive            Boolean  @default(true)
  isPreferred         Boolean  @default(false)
  notes               String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([isActive])
  @@index([isPreferred])
}

enum PurchaseOrderStatus {
  DRAFT
  SUBMITTED
  CONFIRMED
  SHIPPED
  PARTIAL_RECEIVED
  RECEIVED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PARTIAL
  PAID
}
```

### Migration Steps for purchase-orders.ts
1. Add schema models above to `schema.prisma`
2. Run `npx prisma migrate dev --name add_purchase_order_models`
3. Add Prisma imports
4. Remove Map declarations
5. Update all routes to use Prisma operations
6. Update `generatePONumber()` to check database for uniqueness
7. Update receiving workflow to create inventory lots in database

### Key Routes to Migrate
- GET / - List POs with filters
- GET /:id - Get single PO
- POST / - Create PO
- PUT /:id - Update PO
- POST /:id/submit - Submit PO
- POST /:id/receive - Receive inventory (creates lots)
- DELETE /:id - Cancel PO

---

## File 3: inventory-reports.ts ⏳ NOT YET MIGRATED

### Maps Analysis

#### DATA Maps (MUST MIGRATE - 5 Maps)
1. `productsStore` - Map<string, StoredProduct> → Need `Product` model
2. `lotsStore` - Map<string, StoredLot> → Need `InventoryLot` model
3. `transactionsStore` - Map<string, StoredTransaction> → Need `InventoryTransaction` model
4. `wasteStore` - Map<string, StoredWaste> → Need `InventoryWaste` model
5. `countsStore` - Map<string, StoredCount> → Need `InventoryCount` model

#### AGGREGATION Maps (KEEP AS MAPS - ~26 Maps)
These are temporary computation helpers for report generation. They don't persist data:
- `categorySums`, `locationTotals`, `productTotals`
- `periodSums`, `providerStats`, `areaStats`
- etc. - used for aggregating report data

### Schema Status: ❌ MODELS MISSING

### Required Schema Additions
```prisma
model Product {
  id                String          @id
  name              String
  sku               String?         @unique
  category          ProductCategory
  costPrice         Float
  retailPrice       Float
  unitType          UnitType
  reorderPoint      Float
  isActive          Boolean         @default(true)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  lots              InventoryLot[]
  transactions      InventoryTransaction[]

  @@index([category])
  @@index([isActive])
}

model InventoryLot {
  id                String          @id
  productId         String
  productName       String
  lotNumber         String          @unique
  currentQuantity   Float
  initialQuantity   Float
  unitCost          Float
  expirationDate    DateTime
  locationId        String
  locationName      String
  status            LotStatus       @default(AVAILABLE)
  category          ProductCategory
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  product           Product         @relation(fields: [productId], references: [id])
  transactions      InventoryTransaction[]

  @@index([productId])
  @@index([lotNumber])
  @@index([expirationDate])
  @@index([locationId])
  @@index([status])
}

model InventoryTransaction {
  id                String                 @id
  type              TransactionType
  productId         String
  productName       String
  lotId             String?
  lotNumber         String?
  quantity          Float
  unitCost          Float?
  totalCost         Float?
  locationId        String
  locationName      String
  performedBy       String
  performedByName   String
  practitionerId    String?
  practitionerName  String?
  reason            String?
  referenceId       String? // PO ID, treatment ID, etc.
  timestamp         DateTime              @default(now())

  product           Product?              @relation(fields: [productId], references: [id])
  lot               InventoryLot?         @relation(fields: [lotId], references: [id])

  @@index([type])
  @@index([productId])
  @@index([lotId])
  @@index([timestamp])
  @@index([practitionerId])
  @@index([locationId])
}

model InventoryWaste {
  id                String          @id
  lotId             String
  lotNumber         String
  productId         String
  productName       String
  unitsWasted       Float
  unitCost          Float
  reason            String
  recordedBy        String
  recordedByName    String
  recordedAt        DateTime        @default(now())
  practitionerId    String?
  practitionerName  String?
  locationId        String
  locationName      String

  @@index([productId])
  @@index([recordedAt])
  @@index([practitionerId])
  @@index([locationId])
}

model InventoryCount {
  id                String          @id
  countNumber       String          @unique
  countDate         DateTime
  countType         String
  locationId        String
  locationName      String
  items             Json            // Array of count items
  totalVarianceValue Float
  status            String
  createdAt         DateTime        @default(now())
  createdBy         String

  @@index([countDate])
  @@index([locationId])
}

enum LotStatus {
  AVAILABLE
  QUARANTINE
  EXPIRED
  RECALLED
  DEPLETED
  DAMAGED
}

enum TransactionType {
  RECEIVED
  USED
  WASTED
  ADJUSTED
  TRANSFERRED
  RETURNED
}
```

### Migration Strategy for inventory-reports.ts
1. Add schema models above
2. Run migration
3. **Keep aggregation Maps as-is** - they're for computation only
4. Replace data Maps with Prisma queries
5. Update report generation to query from database
6. Add caching layer using Redis or keep in-memory cache for reports

### Report Routes (All use aggregation - complex migration)
- GET /dashboard - Dashboard metrics
- GET /valuation - Inventory valuation
- GET /usage - Usage analytics
- GET /expiration - Expiration tracking
- GET /movement - Stock movement
- GET /variance - Variance reports
- GET /turnover - Turnover metrics
- GET /waste - Waste analysis
- GET /provider/:id/analytics - Provider analytics (KEY DIFFERENTIATOR!)
- GET /treatment-costs - Treatment cost analysis
- GET /profitability - Profitability reports

---

## Migration Completion Status

### ✅ Completed
- [x] group-bookings.ts - Core infrastructure (imports, Maps removed, helper functions)
- [x] group-bookings.ts - First route (GET /join/:code) migrated

### ⏳ In Progress
- [ ] group-bookings.ts - Remaining 12 routes

### ❌ Not Started
- [ ] purchase-orders.ts - Schema models needed first
- [ ] inventory-reports.ts - Schema models needed first
- [ ] Database seed scripts for test data

### 📋 Action Items
1. **IMMEDIATE**: Complete group-bookings.ts route migrations (12 routes)
2. **HIGH PRIORITY**: Add PurchaseOrder schema models
3. **HIGH PRIORITY**: Add Inventory schema models
4. **MEDIUM**: Migrate purchase-orders.ts routes
5. **COMPLEX**: Migrate inventory-reports.ts (involves complex aggregations)
6. **TESTING**: Create seed data and integration tests

---

## Estimated Effort

| File | Lines | Maps | Routes | Status | Estimated Hours |
|------|-------|------|--------|--------|----------------|
| group-bookings.ts | 1625 | 2 | 13 | 10% done | 6-8 hours remaining |
| purchase-orders.ts | 1862 | 5 | 15+ | 0% done | 10-12 hours |
| inventory-reports.ts | 2116 | 31 (5 data) | 12 | 0% done | 12-15 hours |
| **TOTAL** | **5603** | **38** | **40+** | **5%** | **28-35 hours** |

---

## Critical Notes

1. **Schema First**: purchase-orders.ts and inventory-reports.ts CANNOT be fully migrated without schema additions.
2. **Test Data**: Mock data was removed. Need Prisma seed scripts.
3. **Enum Mapping**: Many enums need UPPERCASE conversion (schema) vs lowercase (API).
4. **Transaction Support**: Consider wrapping multi-step operations in Prisma transactions.
5. **Performance**: Add appropriate indexes for filter/search operations.
6. **Caching**: Consider caching strategies for expensive reports.

---

## Next Steps

1. Finish group-bookings.ts migration (all remaining routes)
2. Submit schema changes for purchase-orders.ts
3. Submit schema changes for inventory-reports.ts
4. Create database seed scripts
5. Write integration tests
6. Performance test with realistic data volumes
