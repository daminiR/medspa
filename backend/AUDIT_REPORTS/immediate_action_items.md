# Immediate Action Items - Code Quality Fixes

**Generated:** 2025-12-22
**Priority:** CRITICAL
**Estimated Time:** 1-2 days

---

## Critical Issue: Map Storage Still Present

### Summary
**18 files** still use in-memory `Map<>` for data storage instead of Prisma. This means:
- ❌ Data lost on server restart
- ❌ No data persistence
- ❌ Cannot scale horizontally
- ❌ No transaction support
- ❌ No data integrity guarantees

---

## Phase 1: Remove Drizzle ORM (HIGH PRIORITY)

### Files to Fix: 3 files

#### 1. `/src/routes/appointments.ts`
**Line 22:**
```typescript
// BEFORE:
import { db, appointments as appointmentsTable, breaks as breaksTable, patients as patientsTable, users as usersTable, services as servicesTable, eq, and, or, gte, lte, inArray, isNull, desc, sql } from '@medical-spa/db';

// AFTER:
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
```

**Changes Required:**
- [ ] Replace all `db.select().from(appointmentsTable)` with `prisma.appointment.findMany()`
- [ ] Convert `eq()`, `and()`, `or()` to Prisma where clauses
- [ ] Replace `gte()`, `lte()` with Prisma comparison operators
- [ ] Update all CRUD operations to Prisma syntax
- [ ] Test all endpoints

---

#### 2. `/src/routes/services.ts`
**Line 19:**
```typescript
// BEFORE:
import { db, services as servicesTable, servicePractitioners, eq, and, or, inArray, sql, asc, desc } from '@medical-spa/db';

// AFTER:
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
```

**Changes Required:**
- [ ] Replace all Drizzle queries with Prisma
- [ ] Convert service-practitioner relation queries
- [ ] Update pagination logic
- [ ] Update sorting/filtering
- [ ] Test all endpoints

---

#### 3. `/src/routes/products.ts`
**Lines 13-14 (Documentation):**
```typescript
// BEFORE:
* @database Drizzle ORM with PostgreSQL

// AFTER:
* @database Prisma ORM with PostgreSQL
```

**Lines 23-24:**
```typescript
// BEFORE:
import { db, products as productsTable, inventoryLots, eq, and, or, sql, asc, desc, gte, lte, inArray } from '@medical-spa/db';
import { sum } from 'drizzle-orm';

// AFTER:
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
```

**Changes Required:**
- [ ] Fix documentation comment
- [ ] Replace Drizzle imports
- [ ] Convert all product queries to Prisma
- [ ] Replace `sum()` aggregation with Prisma aggregate
- [ ] Convert inventory lot queries
- [ ] Update stock level calculations
- [ ] Test all endpoints

---

## Phase 2: Create Shared Utilities (MEDIUM PRIORITY)

### 1. Create `/src/lib/request-utils.ts`

```typescript
/**
 * Shared request utility functions
 */
import type { Context } from 'hono';

/**
 * Extract client IP address from request headers
 */
export function getClientIP(c: Context): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown'
  );
}

/**
 * Extract user agent from request headers
 */
export function getUserAgent(c: Context): string {
  return c.req.header('user-agent') || 'unknown';
}

/**
 * Extract session user ID from context
 */
export function getSessionUserId(c: Context): string {
  // Implement based on your auth middleware
  return c.get('userId') || c.get('user')?.id;
}
```

**Files to Update (25+ files):**
- [ ] Remove duplicate `getClientIP()` functions
- [ ] Import from shared utility
- [ ] Update all audit log calls

---

### 2. Create `/src/lib/prisma-utils.ts`

```typescript
/**
 * Shared Prisma query utilities
 */
import { Prisma } from '@prisma/client';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Generic pagination helper
 */
export async function paginate<T>(
  model: any, // Prisma model
  query: PaginationQuery,
  where?: any,
  include?: any,
  orderBy?: any
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, query.page || 1);
  const limit = Math.min(100, Math.max(1, query.limit || 20));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    model.findMany({
      where,
      include,
      orderBy,
      skip,
      take: limit,
    }),
    model.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Add soft delete filter to where clause
 */
export function withoutDeleted(where: any = {}): any {
  return {
    ...where,
    deletedAt: null,
  };
}

/**
 * Build date range filter
 */
export function dateRange(field: string, start?: Date, end?: Date): any {
  const conditions: any = {};
  if (start) conditions.gte = start;
  if (end) conditions.lte = end;
  return Object.keys(conditions).length > 0 ? { [field]: conditions } : {};
}
```

**Files to Update (15+ files):**
- [ ] Replace duplicate pagination logic
- [ ] Use `withoutDeleted()` helper
- [ ] Use `dateRange()` helper

---

### 3. Create `/src/lib/enum-converters.ts`

```typescript
/**
 * Convert between database enums and API enums
 */
import type { AppointmentStatus as DBAppointmentStatus } from '@prisma/client';

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

/**
 * Convert Prisma enum to API enum with validation
 */
export function toAPIAppointmentStatus(dbStatus: DBAppointmentStatus): AppointmentStatus {
  // Assuming DB and API enums match - add mapping if different
  return dbStatus as AppointmentStatus;
}

/**
 * Convert API enum to Prisma enum with validation
 */
export function toDBAppointmentStatus(apiStatus: AppointmentStatus): DBAppointmentStatus {
  return apiStatus as DBAppointmentStatus;
}

// Add similar converters for other enums:
// - PaymentStatus
// - WaitlistStatus
// - InvoiceStatus
// etc.
```

---

## Phase 3: Fix Security Issues (HIGH PRIORITY)

### 1. Fix `/src/routes/staff-auth.ts` PIN Hashing

**Current (Line 118-122):**
```typescript
function hashPIN(pin: string): string {
  // In production, use bcrypt with proper salt rounds
  // For now, using SHA-256 with a static salt (not for production!)
  const salt = 'medical-spa-pin-salt'; // TODO: Use per-user salt stored in DB
  return crypto.createHash('sha256').update(pin + salt).digest('hex');
}
```

**Fix:**
```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async function hashPIN(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

async function verifyPIN(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}
```

**Changes Required:**
- [ ] Install bcrypt: `npm install bcrypt @types/bcrypt`
- [ ] Replace `hashPIN()` with async version
- [ ] Replace `verifyPIN()` with async version
- [ ] Update all call sites to use `await`
- [ ] Add migration to rehash existing PINs (if any)

---

## Phase 4: Map Storage Migration Plan

### Critical Files (Migrate First)

#### 1. `/src/routes/inventory-adjustments.ts` (9 Maps)

**Current Storage:**
```typescript
const transactionsStore = new Map<string, StoredInventoryTransaction>();
const wasteRecordsStore = new Map<string, StoredWasteRecord>();
const transfersStore = new Map<string, StoredInventoryTransfer>();
const countsStore = new Map<string, StoredInventoryCount>();
const productsStore = new Map<string, MockProduct>();
const lotsStore = new Map<string, MockInventoryLot>();
const locationsStore = new Map<string, MockLocation>();
const patientsStore = new Map<string, MockPatient>();
const providersStore = new Map<string, MockProvider>();
```

**Migration Steps:**
- [ ] Verify Prisma schema has all tables
- [ ] Replace Map operations with Prisma queries
- [ ] Add transaction support for multi-step operations
- [ ] Remove `initMockData()` function
- [ ] Update all CRUD endpoints
- [ ] Add proper error handling
- [ ] Write integration tests

---

#### 2. `/src/routes/inventory-reports.ts` (31 Maps)

**Note:** Many Maps are for **aggregation** (building reports), not data storage. These are acceptable!

**Data Storage Maps (Migrate):**
```typescript
const productsStore = new Map<string, StoredProduct>();
const lotsStore = new Map<string, StoredLot>();
const transactionsStore = new Map<string, StoredTransaction>();
const wasteStore = new Map<string, StoredWaste>();
const countsStore = new Map<string, StoredCount>();
```

**Aggregation Maps (Keep):**
```typescript
const reportCache = new Map<string, { data: any; expiresAt: Date }>(); // Cache
const categoryMap = new Map<string, { ... }>(); // Aggregation
const productMap = new Map<string, { ... }>(); // Aggregation
// etc.
```

**Migration Steps:**
- [ ] Replace data storage Maps with Prisma queries
- [ ] Keep aggregation Maps (they're transient)
- [ ] Consider Redis for report cache in production
- [ ] Add cache invalidation logic
- [ ] Optimize database queries for aggregation

---

#### 3. `/src/routes/inventory-lots.ts` (4 Maps)

```typescript
const lotsStore = new Map<string, StoredInventoryLot>();
const alertsStore = new Map<string, StoredInventoryAlert>();
const openVialsStore = new Map<string, StoredOpenVialSession>();
const productsStore = new Map<string, MockProduct>();
```

**Migration Steps:**
- [ ] Verify Prisma schema for all tables
- [ ] Replace Map CRUD with Prisma
- [ ] Add lot tracking logic
- [ ] Add alert generation
- [ ] Add open vial session management
- [ ] Remove mock data

---

#### 4. `/src/routes/purchase-orders.ts` (5 Maps)

```typescript
const purchaseOrdersStore = new Map<string, StoredPurchaseOrder>();
const vendorsStore = new Map<string, StoredVendor>();
const receivingHistoryStore = new Map<string, StoredReceivingRecord[]>();
const locationsStore = new Map<string, MockLocation>();
const inventoryLotsStore = new Map<string, StoredInventoryLot>();
```

**Migration Steps:**
- [ ] Create Prisma schema for POs and vendors
- [ ] Implement PO CRUD with Prisma
- [ ] Add receiving workflow
- [ ] Link to inventory lots
- [ ] Add proper validation

---

#### 5. `/src/routes/group-bookings.ts` (2 Maps)

```typescript
const groupsStore = new Map<string, GroupBooking>();
const inviteCodeIndex = new Map<string, string>(); // code -> groupId
```

**Migration Steps:**
- [ ] Add group bookings to Prisma schema
- [ ] Add invite codes table (or column)
- [ ] Implement group CRUD
- [ ] Add invite code generation/validation
- [ ] Test group appointment creation

---

### Medium Priority Files

#### 6. `/src/routes/photos.ts` (4 Maps)
#### 7. `/src/routes/payments.ts` (3 Maps)
#### 8. `/src/routes/treatment-templates.ts` (2 Maps)
#### 9. `/src/routes/waitlist.ts` (1 Map - token store only)

---

## Acceptable Map Usage (Do NOT Remove)

These files use Maps for **ephemeral data** - this is correct:

### Session/Auth Storage (Temporary by Design)
- ✅ `kiosk-auth.ts` - QR tokens, sessions (short-lived)
- ✅ `patient-auth.ts` - Magic links, OTP codes (expire quickly)
- ⚠️ `staff-auth.ts` - PINs should be in DB, but sessions OK
- ✅ `express-booking.ts` - Rate limiting only

### Transient Aggregation (Computed Data)
- ✅ `messaging-templates.ts` - Category aggregation map
- ✅ `products.ts` - Location aggregation map
- ✅ `inventory-reports.ts` - Report aggregation maps (~27 Maps)
- ✅ `financial-reports.ts` - Report aggregation maps (~5 Maps)

---

## Testing Checklist

After each migration:

- [ ] **Unit Tests:** All business logic functions
- [ ] **Integration Tests:** Full request/response cycles
- [ ] **Data Migration:** If existing data needs migration
- [ ] **Error Handling:** Proper error responses
- [ ] **Audit Logging:** All mutations logged
- [ ] **Performance:** Query optimization
- [ ] **Documentation:** Update API docs

---

## Success Metrics

### Phase 1 Complete:
- [ ] Zero Drizzle imports in codebase
- [ ] All routes use Prisma or acceptable Maps
- [ ] Shared utilities created and used

### Phase 2 Complete:
- [ ] Inventory routes fully migrated (3 files)
- [ ] Purchase orders migrated (1 file)
- [ ] Group bookings migrated (1 file)

### Phase 3 Complete:
- [ ] All Map-based data storage migrated
- [ ] Only ephemeral/cache Maps remain
- [ ] 100% Prisma ORM usage for data

---

## Risk Assessment

### Low Risk (Safe to Proceed)
- Removing Drizzle imports (no data loss)
- Creating shared utilities (backward compatible)
- Fixing security issues (improves security)

### Medium Risk (Requires Testing)
- Migrating Map storage to Prisma (new queries)
- Refactoring large files (behavior changes)

### High Risk (Careful Testing Required)
- Inventory system migration (complex logic)
- Financial reports (calculation accuracy)
- Group bookings (multi-entity transactions)

---

## Recommended Execution Order

1. **Day 1 Morning:** Remove Drizzle imports (3 files)
2. **Day 1 Afternoon:** Create shared utilities, fix security
3. **Day 2 Morning:** Migrate inventory-lots.ts
4. **Day 2 Afternoon:** Migrate group-bookings.ts
5. **Day 3:** Migrate purchase-orders.ts
6. **Days 4-5:** Migrate inventory-adjustments.ts (complex)
7. **Future:** Migrate remaining files

---

## Commands to Run

### Search for remaining issues:
```bash
# Find all Map data storage (excluding aggregation)
grep -n "new Map<string, Stored" src/routes/*.ts

# Find all Drizzle imports
grep -n "@medical-spa/db" src/routes/*.ts

# Find all initMockData calls
grep -n "initMockData()" src/routes/*.ts

# Count Prisma usage
grep -c "prisma\." src/routes/*.ts | grep -v ":0$"
```

### Verify fixes:
```bash
# Should return 0 results after Phase 1
grep -r "from '@medical-spa/db'" src/routes/

# Should return 0 results after full migration
grep -r "const.*Store = new Map" src/routes/ | grep -v "Cache\|RateLimit\|Token\|Session"
```

---

## Questions to Resolve

1. **Prisma Schema:** Do all required tables exist in schema.prisma?
2. **Data Migration:** Is there existing production data in Maps that needs migration?
3. **Testing:** Do we have integration tests for critical paths?
4. **Deployment:** How to handle rollout (blue-green, canary, etc.)?
5. **Monitoring:** Do we have alerts for Prisma query failures?

---

## Contact for Issues

If you encounter blockers during migration:
- **Prisma Schema Issues:** Check `/prisma/schema.prisma`
- **Type Errors:** Review `@prisma/client` generated types
- **Query Performance:** Add database indexes
- **Transaction Issues:** Use `prisma.$transaction()`

---

**END OF IMMEDIATE ACTION ITEMS**
