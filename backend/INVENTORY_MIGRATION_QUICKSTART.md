# Inventory Migration Quick Start Guide

**Agent 6 - Part 1: inventory-lots.ts & inventory-adjustments.ts**

---

## TL;DR

Migrate inventory system from in-memory Maps to Prisma PostgreSQL. **Critical blocker:** Schema has no inventory models. Must add 9 models first.

---

## 5-Minute Overview

### What's Being Migrated?
- **File 1:** `inventory-lots.ts` (2,084 lines) - Lot tracking, alerts, open vials
- **File 2:** `inventory-adjustments.ts` (2,437 lines) - Transactions, waste, transfers, counts
- **Total Maps:** 13 Maps → 9 Prisma models

### Why Migrate?
- ❌ Current: Data lost on restart
- ✅ After: Persistent database storage
- ✅ After: True ACID transactions
- ✅ After: Better FDA compliance audit trail

---

## Current State

### Maps in inventory-lots.ts (4)
```typescript
lotsStore          → InventoryLot model       ❌ Missing
alertsStore        → InventoryAlert model     ❌ Missing
openVialsStore     → OpenVialSession model    ❌ Missing
productsStore      → Product model            ❌ Missing
```

### Maps in inventory-adjustments.ts (9)
```typescript
transactionsStore  → InventoryTransaction     ❌ Missing
wasteRecordsStore  → WasteRecord              ❌ Missing
transfersStore     → InventoryTransfer        ❌ Missing
countsStore        → InventoryCount           ❌ Missing
productsStore      → Product                  ❌ Missing
lotsStore          → InventoryLot             ❌ Missing
locationsStore     → Location                 ✅ EXISTS
patientsStore      → Patient                  ✅ EXISTS
providersStore     → User                     ✅ EXISTS
```

---

## Step-by-Step Implementation

### Phase 1: Add Schema (30 minutes) - REQUIRED FIRST

```bash
# Navigate to backend
cd /Users/daminirijhwani/medical-spa-platform/backend

# Copy schema additions to main schema
cat prisma/INVENTORY_SCHEMA_ADDITIONS.prisma >> prisma/schema.prisma

# Validate syntax
npx prisma format

# Create migration
npx prisma migrate dev --name add_inventory_models

# Generate Prisma Client
npx prisma generate

# Verify in Prisma Studio
npx prisma studio
```

**Checkpoint:** Open Prisma Studio, verify you see:
- Product
- InventoryLot
- InventoryAlert
- OpenVialSession
- VialUsageRecord
- InventoryTransaction
- WasteRecord
- InventoryTransfer
- InventoryCount

---

### Phase 2: Migrate inventory-lots.ts (4 hours)

#### Step 1: Update Imports
```typescript
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
```

#### Step 2: Comment Out Maps
```typescript
// const lotsStore = new Map<string, StoredInventoryLot>();
// const alertsStore = new Map<string, StoredInventoryAlert>();
// const openVialsStore = new Map<string, StoredOpenVialSession>();
// const productsStore = new Map<string, MockProduct>();
```

#### Step 3: Migrate Routes (Follow Guide)
Order of migration:
1. ✅ POST /lots (create)
2. ✅ GET /lots (list)
3. ✅ GET /lots/:id (get one)
4. ✅ PATCH /lots/:id (update)
5. ✅ POST /lots/:id/quarantine
6. ✅ POST /lots/:id/recall
7. ✅ GET /stock-levels
8. ✅ GET /expiring-lots
9. ✅ GET /alerts
10. ✅ POST /open-vial
11. ✅ POST /vials/:id/use
12. ✅ POST /vials/:id/close

**Test after each route!**

---

### Phase 3: Migrate inventory-adjustments.ts (4 hours)

#### Key Changes:

**FEFO Function:**
```typescript
// OLD (Map)
function selectLotByFEFO(...) {
  return Array.from(lotsStore.values())...
}

// NEW (Prisma)
async function selectLotByFEFO(...) {
  return await prisma.inventoryLot.findFirst({
    where: { ... },
    orderBy: { expirationDate: 'asc' }
  });
}
```

#### Routes to Migrate:
1. ✅ POST /transactions
2. ✅ GET /transactions
3. ✅ GET /transactions/:id
4. ✅ POST /adjustments/add
5. ✅ POST /adjustments/remove
6. ✅ POST /treatment-use
7. ✅ POST /waste
8. ✅ GET /waste
9. ✅ POST /transfers
10. ✅ GET /transfers
11. ✅ POST /counts
12. ✅ GET /counts

---

## Quick Reference: Map → Prisma

### Create
```typescript
// BEFORE
const item = { id: generateId(), ...data };
mapStore.set(item.id, item);

// AFTER
const item = await prisma.model.create({
  data: { id: generateId(), ...data }
});
```

### Read
```typescript
// BEFORE
const item = mapStore.get(id);

// AFTER
const item = await prisma.model.findUnique({
  where: { id }
});
```

### Update
```typescript
// BEFORE
const item = mapStore.get(id);
item.field = newValue;
mapStore.set(id, item);

// AFTER
const item = await prisma.model.update({
  where: { id },
  data: { field: newValue }
});
```

### Delete
```typescript
// BEFORE
mapStore.delete(id);

// AFTER
await prisma.model.delete({ where: { id } });
```

### List/Filter
```typescript
// BEFORE
const items = Array.from(mapStore.values())
  .filter(item => item.status === 'active')
  .slice(skip, skip + take);

// AFTER
const items = await prisma.model.findMany({
  where: { status: 'active' },
  skip,
  take
});
```

### Transaction
```typescript
// BEFORE
const lot = lotsStore.get(id);
lot.quantity -= amount;
lotsStore.set(id, lot);
const txn = { ...data };
txnStore.set(txn.id, txn);

// AFTER
const result = await prisma.$transaction(async (tx) => {
  const lot = await tx.inventoryLot.update({
    where: { id },
    data: { quantity: { decrement: amount } }
  });
  const txn = await tx.inventoryTransaction.create({
    data: { ...data }
  });
  return { lot, txn };
});
```

---

## Testing Checklist

After each route migration, test with:

### Create Lot
```bash
curl -X POST http://localhost:3000/api/inventory/lots \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "UUID",
    "productName": "Botox 100U",
    "lotNumber": "LOT-2024-001",
    "expirationDate": "2025-12-31",
    "initialQuantity": 100,
    "unitType": "units",
    "locationId": "LOC-UUID",
    "purchaseCost": 500
  }'
```

### List Lots
```bash
curl http://localhost:3000/api/inventory/lots?page=1&limit=10
```

### Treatment Use
```bash
curl -X POST http://localhost:3000/api/inventory/adjustments/treatment-use \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "PROD-UUID",
    "quantity": 12.5,
    "locationId": "LOC-UUID",
    "patientId": "PAT-UUID",
    "practitionerId": "PRAC-UUID"
  }'
```

---

## Common Issues

### Error: Model not found
**Fix:** Run `npx prisma generate`

### Error: Foreign key constraint
**Fix:** Ensure Product/Location exists before creating InventoryLot

### Error: Date parsing
**Fix:** Use `new Date(stringDate)` for all date conversions

---

## Success Criteria

✅ All routes return correct data
✅ FEFO logic selects correct lots
✅ Transactions are atomic
✅ Audit trail captures all operations
✅ No data loss on server restart
✅ Performance similar or better than Maps

---

## Documentation Files

1. **INVENTORY_MIGRATION_ANALYSIS.md** - Full analysis + schema
2. **INVENTORY_SCHEMA_ADDITIONS.prisma** - Ready-to-copy schema
3. **INVENTORY_MIGRATION_GUIDE.md** - Detailed patterns + examples
4. **INVENTORY_MIGRATION_SUMMARY.md** - Executive summary
5. **INVENTORY_MIGRATION_QUICKSTART.md** - This file

---

## Time Estimates

- Schema Setup: 30 minutes
- inventory-lots.ts: 4 hours
- inventory-adjustments.ts: 4 hours
- Testing: 3 hours
- **Total: 11.5 hours**

---

## Need Help?

1. Check INVENTORY_MIGRATION_GUIDE.md for detailed examples
2. Review INVENTORY_SCHEMA_ADDITIONS.prisma for model structure
3. Test in Prisma Studio to verify data
4. Use `npx prisma studio` to inspect database

---

## Ready to Start?

```bash
# Step 1: Add schema
cd /Users/daminirijhwani/medical-spa-platform/backend
cat prisma/INVENTORY_SCHEMA_ADDITIONS.prisma >> prisma/schema.prisma
npx prisma migrate dev --name add_inventory_models

# Step 2: Start migrating
# Open: src/routes/inventory-lots.ts
# Follow: INVENTORY_MIGRATION_GUIDE.md

# Good luck! 🚀
```
