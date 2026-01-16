# Inventory Migration Guide - Part 1
## Converting Maps to Prisma Database Operations

---

## Prerequisites

Before starting migration, you MUST:

1. **Add Prisma Models**
   ```bash
   # Copy the models from INVENTORY_SCHEMA_ADDITIONS.prisma into schema.prisma
   # Then run:
   cd /Users/daminirijhwani/medical-spa-platform/backend
   npx prisma format
   npx prisma migrate dev --name add_inventory_models
   npx prisma generate
   ```

2. **Verify Prisma Client Import**
   ```typescript
   import { prisma } from '../lib/prisma';
   import { Prisma } from '@prisma/client';
   ```

---

## Migration Pattern Reference

### Pattern 1: Map.set() → prisma.create()

**BEFORE (Map):**
```typescript
const lot: StoredInventoryLot = {
  id: generateId(),
  productId: data.productId,
  productName: data.productName,
  lotNumber: data.lotNumber,
  // ... other fields
  createdAt: new Date(),
  updatedAt: new Date(),
};

lotsStore.set(lot.id, lot);
```

**AFTER (Prisma):**
```typescript
const lot = await prisma.inventoryLot.create({
  data: {
    id: generateId(),
    productId: data.productId,
    lotNumber: data.lotNumber,
    batchNumber: data.batchNumber,
    expirationDate: new Date(data.expirationDate),
    receivedDate: data.receivedDate ? new Date(data.receivedDate) : new Date(),
    initialQuantity: data.initialQuantity,
    currentQuantity: data.initialQuantity,
    reservedQuantity: 0,
    unitType: data.unitType,
    locationId: data.locationId,
    storageLocation: data.storageLocation,
    purchaseCost: data.purchaseCost,
    status: 'available',
    createdBy: c.get('user')?.id || 'system',
    lastUpdatedBy: c.get('user')?.id || 'system',
    // Prisma automatically adds createdAt and updatedAt
  },
  // Include related data in response if needed
  include: {
    product: true,
    location: true,
  },
});
```

### Pattern 2: Map.get() → prisma.findUnique()

**BEFORE (Map):**
```typescript
const lot = lotsStore.get(id);
if (!lot) {
  throw new APIError('NOT_FOUND', 'Lot not found', 404);
}
```

**AFTER (Prisma):**
```typescript
const lot = await prisma.inventoryLot.findUnique({
  where: { id },
  include: {
    product: true,
    location: true,
    openVials: {
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    },
  },
});

if (!lot) {
  throw new APIError('NOT_FOUND', 'Lot not found', 404);
}
```

### Pattern 3: Map.delete() → prisma.delete()

**BEFORE (Map):**
```typescript
lotsStore.delete(id);
```

**AFTER (Prisma):**
```typescript
await prisma.inventoryLot.delete({
  where: { id },
});

// Or soft delete by updating status:
await prisma.inventoryLot.update({
  where: { id },
  data: {
    status: 'depleted',
    updatedAt: new Date(),
  },
});
```

### Pattern 4: Array.from(Map.values()).filter() → prisma.findMany()

**BEFORE (Map):**
```typescript
const lots = Array.from(lotsStore.values())
  .filter(lot => {
    if (query.productId && lot.productId !== query.productId) return false;
    if (query.status && lot.status !== query.status) return false;
    if (query.locationId && lot.locationId !== query.locationId) return false;
    return true;
  })
  .sort((a, b) => {
    if (sortBy === 'expirationDate') {
      return sortOrder === 'asc'
        ? a.expirationDate.getTime() - b.expirationDate.getTime()
        : b.expirationDate.getTime() - a.expirationDate.getTime();
    }
    return 0;
  });

const total = lots.length;
const start = (page - 1) * limit;
const paginatedLots = lots.slice(start, start + limit);
```

**AFTER (Prisma):**
```typescript
// Build where clause
const where: Prisma.InventoryLotWhereInput = {};

if (query.productId) {
  where.productId = query.productId;
}

if (query.status) {
  where.status = query.status;
}

if (query.locationId) {
  where.locationId = query.locationId;
}

if (query.expiringWithinDays) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + query.expiringWithinDays);
  where.expirationDate = {
    lte: futureDate,
    gte: new Date(),
  };
}

// Get total count
const total = await prisma.inventoryLot.count({ where });

// Get paginated results
const lots = await prisma.inventoryLot.findMany({
  where,
  include: {
    product: true,
    location: true,
  },
  orderBy: {
    [sortBy]: sortOrder,
  },
  skip: (page - 1) * limit,
  take: limit,
});
```

### Pattern 5: Map.set() for Update → prisma.update()

**BEFORE (Map):**
```typescript
const lot = lotsStore.get(id);
if (!lot) throw new APIError('NOT_FOUND', 'Lot not found', 404);

lot.status = 'quarantine';
lot.qualityNotes = data.notes;
lot.updatedAt = new Date();
lot.lastUpdatedBy = userId;

lotsStore.set(id, lot);
```

**AFTER (Prisma):**
```typescript
const lot = await prisma.inventoryLot.update({
  where: { id },
  data: {
    status: 'quarantine',
    qualityNotes: data.notes,
    lastUpdatedBy: userId,
    // updatedAt is automatic
  },
  include: {
    product: true,
    location: true,
  },
});
```

### Pattern 6: Complex Transactions → prisma.$transaction()

**BEFORE (Map - multiple related operations):**
```typescript
// Update lot quantity
const lot = lotsStore.get(lotId);
lot.currentQuantity -= quantity;
lotsStore.set(lotId, lot);

// Create transaction record
const transaction: StoredInventoryTransaction = {
  id: generateId(),
  type: 'treatment_use',
  // ... other fields
};
transactionsStore.set(transaction.id, transaction);

// Create vial usage record
const usage: StoredVialUsageRecord = {
  id: generateId(),
  // ... fields
};
vialSession.usageRecords.push(usage);
openVialsStore.set(vialSession.id, vialSession);
```

**AFTER (Prisma - atomic transaction):**
```typescript
const result = await prisma.$transaction(async (tx) => {
  // Update lot quantity
  const lot = await tx.inventoryLot.update({
    where: { id: lotId },
    data: {
      currentQuantity: {
        decrement: quantity,
      },
    },
  });

  // Create transaction record
  const transaction = await tx.inventoryTransaction.create({
    data: {
      type: 'treatment_use',
      productId: lot.productId,
      lotId: lot.id,
      quantity,
      // ... other fields
    },
  });

  // Create vial usage record
  const usage = await tx.vialUsageRecord.create({
    data: {
      vialSessionId: vialSession.id,
      patientId: data.patientId,
      unitsUsed: data.unitsToUse,
      // ... other fields
    },
  });

  // Update vial session
  const updatedSession = await tx.openVialSession.update({
    where: { id: vialSession.id },
    data: {
      currentUnits: {
        decrement: data.unitsToUse,
      },
      usedUnits: {
        increment: data.unitsToUse,
      },
    },
  });

  return { lot, transaction, usage, updatedSession };
});
```

---

## File-Specific Migration Instructions

### File 1: inventory-lots.ts

**Location:** `/Users/daminirijhwani/medical-spa-platform/backend/src/routes/inventory-lots.ts`

#### Step 1: Update Imports
```typescript
// Add at top of file after existing imports
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
```

#### Step 2: Remove Map Declarations (keep interfaces for now)
```typescript
// COMMENT OUT OR REMOVE:
// const lotsStore = new Map<string, StoredInventoryLot>();
// const alertsStore = new Map<string, StoredInventoryAlert>();
// const openVialsStore = new Map<string, StoredOpenVialSession>();
// const productsStore = new Map<string, MockProduct>();
```

#### Step 3: Migrate Routes One by One

**Route: POST /lots (Create Lot)**

Find this code block (around line 600-700):
```typescript
inventoryLots.post(
  '/',
  sessionAuthMiddleware,
  zValidator('json', createLotSchema),
  async (c) => {
    // ... current implementation
  }
);
```

Replace the route handler with:
```typescript
inventoryLots.post(
  '/',
  sessionAuthMiddleware,
  zValidator('json', createLotSchema),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');

    try {
      // Verify product exists
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        throw new APIError('NOT_FOUND', 'Product not found', 404);
      }

      // Create lot
      const lot = await prisma.inventoryLot.create({
        data: {
          productId: data.productId,
          lotNumber: data.lotNumber,
          batchNumber: data.batchNumber,
          serialNumber: data.serialNumber,
          manufacturingDate: data.manufacturingDate ? new Date(data.manufacturingDate) : undefined,
          expirationDate: new Date(data.expirationDate),
          receivedDate: data.receivedDate ? new Date(data.receivedDate) : new Date(),
          initialQuantity: data.initialQuantity,
          currentQuantity: data.initialQuantity,
          reservedQuantity: 0,
          unitType: data.unitType,
          locationId: data.locationId,
          storageLocation: data.storageLocation,
          purchaseOrderId: data.purchaseOrderId,
          vendorId: data.vendorId,
          vendorName: data.vendorName,
          purchaseCost: data.purchaseCost,
          status: 'available',
          qualityNotes: data.qualityNotes,
          createdBy: user?.id || 'system',
          lastUpdatedBy: user?.id || 'system',
        },
        include: {
          product: true,
          location: true,
        },
      });

      // Audit log
      await logAuditEvent({
        entityType: 'inventory_lot',
        entityId: lot.id,
        action: 'create',
        actor: user?.id || 'system',
        metadata: {
          lotNumber: lot.lotNumber,
          productName: product.name,
          quantity: lot.initialQuantity,
        },
      });

      return c.json(lot, 201);
    } catch (error) {
      if (error instanceof APIError) throw error;
      console.error('Error creating lot:', error);
      throw new APIError('INTERNAL_ERROR', 'Failed to create lot', 500);
    }
  }
);
```

**Route: GET /lots (List Lots)**

Replace with:
```typescript
inventoryLots.get(
  '/',
  sessionAuthMiddleware,
  zValidator('query', listLotsSchema),
  async (c) => {
    const query = c.req.valid('query');
    const { page = 1, limit = 20, sortBy = 'expirationDate', sortOrder = 'asc' } = query;

    try {
      // Build where clause
      const where: Prisma.InventoryLotWhereInput = {};

      if (query.productId) {
        where.productId = query.productId;
      }

      if (query.status) {
        where.status = query.status;
      }

      if (query.locationId) {
        where.locationId = query.locationId;
      }

      if (query.expiringWithinDays) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + query.expiringWithinDays);
        where.expirationDate = {
          lte: futureDate,
          gte: new Date(),
        };
        where.status = 'available'; // Only show available lots that are expiring
      }

      // Get total count
      const total = await prisma.inventoryLot.count({ where });

      // Get paginated results
      const lots = await prisma.inventoryLot.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              unitType: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      return c.json({
        lots,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error listing lots:', error);
      throw new APIError('INTERNAL_ERROR', 'Failed to list lots', 500);
    }
  }
);
```

**Route: GET /lots/:id (Get Lot)**

Replace with:
```typescript
inventoryLots.get(
  '/:id',
  sessionAuthMiddleware,
  zValidator('param', lotIdSchema),
  async (c) => {
    const { id } = c.req.valid('param');

    try {
      const lot = await prisma.inventoryLot.findUnique({
        where: { id },
        include: {
          product: true,
          location: true,
          openVials: {
            where: {
              status: 'active',
            },
            include: {
              usageRecords: {
                orderBy: {
                  timestamp: 'desc',
                },
                take: 10,
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          transactions: {
            orderBy: {
              timestamp: 'desc',
            },
            take: 20,
          },
        },
      });

      if (!lot) {
        throw new APIError('NOT_FOUND', 'Lot not found', 404);
      }

      return c.json(lot);
    } catch (error) {
      if (error instanceof APIError) throw error;
      console.error('Error fetching lot:', error);
      throw new APIError('INTERNAL_ERROR', 'Failed to fetch lot', 500);
    }
  }
);
```

**Route: PATCH /lots/:id (Update Lot)**

Replace with:
```typescript
inventoryLots.patch(
  '/:id',
  sessionAuthMiddleware,
  zValidator('param', lotIdSchema),
  zValidator('json', updateLotSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const user = c.get('user');

    try {
      const lot = await prisma.inventoryLot.update({
        where: { id },
        data: {
          storageLocation: data.storageLocation,
          qualityNotes: data.qualityNotes,
          status: data.status,
          lastUpdatedBy: user?.id || 'system',
        },
        include: {
          product: true,
          location: true,
        },
      });

      // Audit log
      await logAuditEvent({
        entityType: 'inventory_lot',
        entityId: lot.id,
        action: 'update',
        actor: user?.id || 'system',
        metadata: {
          changes: data,
          lotNumber: lot.lotNumber,
        },
      });

      return c.json(lot);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new APIError('NOT_FOUND', 'Lot not found', 404);
        }
      }
      console.error('Error updating lot:', error);
      throw new APIError('INTERNAL_ERROR', 'Failed to update lot', 500);
    }
  }
);
```

---

### File 2: inventory-adjustments.ts

**Location:** `/Users/daminirijhwani/medical-spa-platform/backend/src/routes/inventory-adjustments.ts`

#### Key Migrations:

**FEFO Logic Migration:**

BEFORE (Map):
```typescript
function selectLotByFEFO(productId: string, quantity: number, locationId: string): MockInventoryLot | null {
  const availableLots = Array.from(lotsStore.values())
    .filter(lot =>
      lot.productId === productId &&
      lot.locationId === locationId &&
      lot.status === 'available' &&
      (lot.currentQuantity - lot.reservedQuantity) >= quantity &&
      lot.expirationDate > new Date()
    )
    .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());

  return availableLots.length > 0 ? availableLots[0] : null;
}
```

AFTER (Prisma):
```typescript
async function selectLotByFEFO(
  productId: string,
  quantity: number,
  locationId: string
): Promise<InventoryLot | null> {
  const lot = await prisma.inventoryLot.findFirst({
    where: {
      productId,
      locationId,
      status: 'available',
      expirationDate: {
        gt: new Date(),
      },
      AND: {
        currentQuantity: {
          gte: prisma.$raw`current_quantity - reserved_quantity >= ${quantity}`,
        },
      },
    },
    orderBy: {
      expirationDate: 'asc', // First Expire First Out
    },
  });

  // Verify sufficient quantity after fetching
  if (lot && (lot.currentQuantity - lot.reservedQuantity) >= quantity) {
    return lot;
  }

  return null;
}

// Alternative approach with raw query for complex calculation:
async function selectLotByFEFO_Raw(
  productId: string,
  quantity: number,
  locationId: string
): Promise<InventoryLot | null> {
  const lots = await prisma.$queryRaw<InventoryLot[]>`
    SELECT * FROM "InventoryLot"
    WHERE "productId" = ${productId}
      AND "locationId" = ${locationId}
      AND "status" = 'available'
      AND "expirationDate" > NOW()
      AND ("currentQuantity" - "reservedQuantity") >= ${quantity}
    ORDER BY "expirationDate" ASC
    LIMIT 1
  `;

  return lots.length > 0 ? lots[0] : null;
}
```

**Treatment Usage Transaction:**

Replace the treatment usage route with:
```typescript
inventoryAdjustments.post(
  '/treatment-use',
  sessionAuthMiddleware,
  zValidator('json', treatmentUseSchema),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Get product to determine FEFO lot
        const product = await tx.product.findUnique({
          where: { id: data.productId },
        });

        if (!product) {
          throw new APIError('NOT_FOUND', 'Product not found', 404);
        }

        // Select lot using FEFO
        let lot: InventoryLot | null = null;

        if (data.lotId) {
          // Specific lot requested
          lot = await tx.inventoryLot.findUnique({
            where: { id: data.lotId },
          });
        } else {
          // Auto-select using FEFO
          const lots = await tx.$queryRaw<InventoryLot[]>`
            SELECT * FROM "InventoryLot"
            WHERE "productId" = ${data.productId}
              AND "locationId" = ${data.locationId}
              AND "status" = 'available'
              AND "expirationDate" > NOW()
              AND ("currentQuantity" - "reservedQuantity") >= ${data.quantity}
            ORDER BY "expirationDate" ASC
            LIMIT 1
          `;
          lot = lots.length > 0 ? lots[0] : null;
        }

        if (!lot) {
          throw new APIError('NOT_FOUND', 'No suitable lot found with sufficient quantity', 404);
        }

        if ((lot.currentQuantity - lot.reservedQuantity) < data.quantity) {
          throw new APIError(
            'INSUFFICIENT_STOCK',
            `Insufficient quantity. Available: ${lot.currentQuantity - lot.reservedQuantity}, Requested: ${data.quantity}`,
            400
          );
        }

        // Update lot quantity
        const updatedLot = await tx.inventoryLot.update({
          where: { id: lot.id },
          data: {
            currentQuantity: {
              decrement: data.quantity,
            },
          },
        });

        // Create transaction record
        const transaction = await tx.inventoryTransaction.create({
          data: {
            type: 'treatment_use',
            status: 'completed',
            productId: data.productId,
            productName: product.name,
            lotId: lot.id,
            lotNumber: lot.lotNumber,
            quantity: data.quantity,
            unitType: lot.unitType,
            quantityBefore: lot.currentQuantity,
            quantityAfter: lot.currentQuantity - data.quantity,
            unitCost: lot.purchaseCost / lot.initialQuantity,
            totalCost: (lot.purchaseCost / lot.initialQuantity) * data.quantity,
            locationId: data.locationId,
            locationName: '', // TODO: fetch from location
            appointmentId: data.appointmentId,
            patientId: data.patientId,
            patientName: data.patientName,
            practitionerId: data.practitionerId,
            practitionerName: data.practitionerName,
            treatmentDetails: data.treatmentDetails,
            reason: 'Treatment usage',
            performedBy: user?.id || 'system',
            performedByName: user?.name || 'System',
            approvalRequired: false,
          },
        });

        return { lot: updatedLot, transaction };
      });

      // Audit log
      await logAuditEvent({
        entityType: 'inventory_transaction',
        entityId: result.transaction.id,
        action: 'treatment_use',
        actor: user?.id || 'system',
        metadata: {
          productName: result.transaction.productName,
          quantity: data.quantity,
          patientName: data.patientName,
        },
      });

      return c.json(result, 201);
    } catch (error) {
      if (error instanceof APIError) throw error;
      console.error('Error recording treatment use:', error);
      throw new APIError('INTERNAL_ERROR', 'Failed to record treatment use', 500);
    }
  }
);
```

---

## Testing Strategy

After migration, test each endpoint:

```bash
# 1. Create a lot
curl -X POST http://localhost:3000/api/inventory/lots \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "uuid-here",
    "productName": "Botox",
    "lotNumber": "LOT123",
    "expirationDate": "2025-12-31",
    "initialQuantity": 100,
    "unitType": "units",
    "locationId": "loc-uuid",
    "purchaseCost": 500
  }'

# 2. List lots
curl http://localhost:3000/api/inventory/lots?page=1&limit=20

# 3. Get specific lot
curl http://localhost:3000/api/inventory/lots/{lot-id}

# 4. Update lot
curl -X PATCH http://localhost:3000/api/inventory/lots/{lot-id} \
  -H "Content-Type: application/json" \
  -d '{"status": "quarantine", "qualityNotes": "Quality check required"}'

# 5. Record treatment use
curl -X POST http://localhost:3000/api/inventory/adjustments/treatment-use \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod-uuid",
    "quantity": 12.5,
    "locationId": "loc-uuid",
    "patientId": "pat-uuid",
    "practitionerId": "prac-uuid"
  }'
```

---

## Next Steps

1. **Schema First:** Add all models from `INVENTORY_SCHEMA_ADDITIONS.prisma` to main schema
2. **Run Migration:** Execute `npx prisma migrate dev`
3. **Migrate Routes:** Update each route handler following patterns above
4. **Test Thoroughly:** Test all CRUD operations
5. **Performance Monitor:** Check query performance, add indexes if needed

---

## Common Issues & Solutions

### Issue: Can't find Prisma types
**Solution:** Run `npx prisma generate` after schema changes

### Issue: Foreign key constraint errors
**Solution:** Ensure related records (Product, Location) exist before creating InventoryLot

### Issue: Date parsing errors
**Solution:** Always use `new Date(stringDate)` when converting string dates to Date objects

### Issue: Transaction timeouts
**Solution:** Keep transactions small and fast; avoid complex calculations inside transactions

---

## Rollback Plan

If migration fails:
1. Revert schema.prisma to previous version
2. Run `npx prisma migrate dev` to revert database
3. Restore original Map-based code from git
4. Investigate error and retry

---

## Performance Considerations

1. **Indexes:** All critical query fields have indexes defined in schema
2. **Pagination:** Always use skip/take for large result sets
3. **Include vs Select:** Use `select` for minimal data, `include` for relationships
4. **Batch Operations:** Use `createMany`, `updateMany` for bulk operations
5. **Raw Queries:** Use `$queryRaw` for complex FEFO logic if needed
