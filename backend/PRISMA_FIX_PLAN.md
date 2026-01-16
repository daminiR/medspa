# Prisma Migration Fix Plan

**Based on:** 8 Comprehensive Audit Reports (December 22, 2025)
**Total Issues Identified:** 47 distinct issues across 8 categories
**Estimated Total Effort:** 3-4 weeks

---

## Executive Summary

| Category | Issues | Severity | Est. Time |
|----------|--------|----------|-----------|
| **Map Storage Removal** | 18 files still using Maps | CRITICAL | 8-10 days |
| **Drizzle to Prisma** | 3 files using Drizzle | HIGH | 1-2 days |
| **Schema Mismatch Fix** | 1 file (patients.ts) | HIGH | 15 min |
| **Prisma Error Handling** | 0/40 files have handling | CRITICAL | 3-5 days |
| **Security Fixes** | 3 issues | HIGH | 1 day |
| **Performance Fixes** | 6 N+1 patterns | MEDIUM | 2-3 days |
| **Production Readiness** | 4 critical issues | HIGH | 1 day |
| **Missing Indexes** | Multiple tables | MEDIUM | 1 day |

---

## Phase 1: Critical Bug Fixes (Day 1)

### 1.1 Fix Patient API Schema Mismatch (15 minutes)
**File:** `src/routes/patients.ts`
**Problem:** Using `allergies` (lowercase) but Prisma schema uses `Allergy` (PascalCase)

**Lines to fix:** 312, 317, 418, 474, 575, 726-736

```typescript
// BEFORE:
include: { allergies: true }

// AFTER:
include: { Allergy: true }
```

### 1.2 Remove Unsafe Query Functions (30 minutes)
**File:** `src/lib/db.ts`
**Problem:** `executeRawQuery()` and `executeRawMutation()` use unsafe methods

**Action:** Mark as deprecated or remove entirely

```typescript
// Remove or deprecate:
// - executeRawQuery() at line 86-91
// - executeRawMutation() at line 103-108
```

### 1.3 Fix Duplicate PrismaClient (5 minutes)
**File:** `src/routes/financial-reports.ts:28`
**Problem:** Creates separate PrismaClient instead of using singleton

```typescript
// BEFORE:
const prisma = new PrismaClient();

// AFTER:
import { prisma } from '../lib/prisma';
```

---

## Phase 2: Drizzle to Prisma Conversion (Days 2-3)

### 2.1 Convert appointments.ts
**File:** `src/routes/appointments.ts` (1,549 lines)
**Current:** Uses Drizzle ORM
**Tasks:**
- [ ] Replace `import { db } from '@medical-spa/db'` with `import { prisma } from '../lib/prisma'`
- [ ] Convert all Drizzle queries to Prisma syntax
- [ ] Test all CRUD operations

### 2.2 Convert services.ts
**File:** `src/routes/services.ts` (~900 lines)
**Current:** Uses Drizzle ORM
**Tasks:**
- [ ] Replace Drizzle imports with Prisma
- [ ] Convert service-practitioner relation queries
- [ ] Test all endpoints

### 2.3 Convert products.ts
**File:** `src/routes/products.ts` (~900 lines)
**Current:** Uses Drizzle ORM + stale documentation
**Tasks:**
- [ ] Fix documentation (says Drizzle, should say Prisma)
- [ ] Replace Drizzle imports
- [ ] Convert stock level aggregations
- [ ] Test all endpoints

---

## Phase 3: Create Shared Utilities (Day 3)

### 3.1 Create Prisma Error Handler
**File:** `src/middleware/prisma-error-handler.ts`

Handles:
- P2002: Unique constraint violation → 409 Conflict
- P2003: Foreign key violation → 400 Bad Request
- P2025: Record not found → 404 Not Found
- P2034: Transaction conflict → 409 Conflict (retryable)
- P2024: Timeout → 408 Timeout

### 3.2 Create Request Utilities
**File:** `src/lib/request-utils.ts`

- `getClientIP(c: Context)` - Extract client IP (duplicated in 25+ files)
- `getUserAgent(c: Context)` - Extract user agent

### 3.3 Create Prisma Utilities
**File:** `src/lib/prisma-utils.ts`

- `paginate()` - Generic pagination helper
- `withoutDeleted()` - Soft delete filter
- `dateRange()` - Date range builder

### 3.4 Create Retry Logic
**File:** `src/lib/retry.ts`

- `retryOnConflict()` - Retry on transaction deadlocks

---

## Phase 4: Apply Error Handling (Days 4-8)

### Priority 1: Financial Routes (Days 4-5)
- [ ] `payments.prisma.ts` - 18 catch blocks, 2 transactions
- [ ] `invoices.ts` - 12 catch blocks, 4 transactions
- [ ] `gift-cards.ts` - 10 catch blocks, 3 transactions

### Priority 2: Core Routes (Days 6-7)
- [ ] `packages.ts` - 1 catch block, 1 transaction
- [ ] `memberships.ts` - 13 catch blocks
- [ ] `forms.ts` - 8 catch blocks
- [ ] `patients.ts` - Multiple catch blocks

### Priority 3: All Other Routes (Day 8)
- [ ] Remaining 33 route files

---

## Phase 5: Map Storage Migration (Days 9-18)

### Week 2: Critical Files

#### 5.1 inventory-adjustments.ts (9 Maps)
**Priority:** CRITICAL
**Lines:** 2,437
**Maps to migrate:**
- transactionsStore
- wasteRecordsStore
- transfersStore
- countsStore
- productsStore
- lotsStore
- locationsStore
- patientsStore
- providersStore

#### 5.2 inventory-lots.ts (4 Maps)
**Priority:** CRITICAL
**Lines:** 2,084
**Maps to migrate:**
- lotsStore
- alertsStore
- openVialsStore
- productsStore

#### 5.3 inventory-reports.ts (5 data Maps + 26 aggregation Maps)
**Priority:** CRITICAL
**Lines:** 2,116
**Migrate data Maps, keep aggregation Maps**

#### 5.4 purchase-orders.ts (5 Maps)
**Priority:** HIGH
**Lines:** 1,862

#### 5.5 group-bookings.ts (2 Maps)
**Priority:** HIGH
**Lines:** 1,625

### Week 3: Remaining Files

#### 5.6 photos.ts (4 Maps)
#### 5.7 payments.ts (3 Maps) - Replace with payments.prisma.ts
#### 5.8 treatment-templates.ts (2 Maps)
#### 5.9 charting-settings.ts (1 Map) - Replace with charting-settings.prisma.ts
#### 5.10 recurring.ts (1 Map)
#### 5.11 waitlist.ts (1 Map - token store only)

---

## Phase 6: Performance Fixes (Days 19-21)

### 6.1 Fix Bulk Message N+1 Pattern
**File:** `messaging.ts` lines 644-747
**Current:** 600+ queries for 100 recipients
**Fix:** Use `createMany`, `updateMany`, batch lookups

### 6.2 Fix Invoice Line Items Aggregation
**File:** `invoices.ts` lines 1152-1355
**Current:** Fetches ALL line items on every operation
**Fix:** Use Prisma `aggregate()` functions

### 6.3 Add Missing Pagination
**Files:**
- `invoices.ts` line 1552 (patient invoices)
- `patients.ts` line 880 (patient notes)

### 6.4 Add Database Indexes
```prisma
// Add to schema.prisma
@@index([firstName, lastName]) // Patient
@@index([patientId, voidedAt]) // Invoice
@@index([patientId, channel]) // Conversation
@@index([conversationId, createdAt]) // Message
```

---

## Phase 7: Security Fixes (Day 22)

### 7.1 Fix PIN Hashing
**File:** `staff-auth.ts` lines 118-122
**Current:** SHA-256 with static salt
**Fix:** Replace with bcrypt

```bash
npm install bcrypt @types/bcrypt
```

### 7.2 Add Audit Trail Fields
**Models missing fields:**
- Allergy (missing ALL audit fields)
- Appointment (missing updatedAt, createdBy)
- InvoiceLineItem (missing ALL audit fields)
- Note (missing updatedAt)

### 7.3 Add Soft Deletes
**Models needing deletedAt:**
- Patient
- Invoice
- Treatment

---

## Phase 8: Production Readiness (Day 23)

### 8.1 Rotate Database Credentials
```bash
# Move password to Secret Manager
gcloud secrets create database-url --data-file=connection-string.txt
```

### 8.2 Add Connection Pool Configuration
```env
DATABASE_URL="...?connection_limit=10&pool_timeout=20&connect_timeout=15"
```

### 8.3 Fix Graceful Shutdown
**File:** `src/index.ts` lines 109-121

### 8.4 Add Real Health Check
**File:** `src/routes/health.ts`
```typescript
// Test actual database connection
await prisma.$queryRaw`SELECT 1`;
```

---

## Verification Commands

### After Phase 1:
```bash
# Test patient endpoints
curl http://localhost:8080/api/patients
# Should return patients without error
```

### After Phase 2:
```bash
# Find remaining Drizzle imports (should be 0)
grep -r "from '@medical-spa/db'" src/routes/
```

### After Phase 5:
```bash
# Find remaining Map storage (should be 0, except cache/session)
grep -r "new Map<string, Stored" src/routes/ | grep -v "Cache\|Token\|Session"
```

### After All Phases:
```bash
# Run full test suite
npm test

# Verify Prisma client
npx prisma validate
npx prisma generate
```

---

## Success Criteria

- [ ] Zero Drizzle imports
- [ ] Zero Map-based data storage (except cache/session)
- [ ] 100% Prisma error handling coverage
- [ ] All security vulnerabilities fixed
- [ ] All N+1 patterns resolved
- [ ] Database properly indexed
- [ ] Production configuration complete
- [ ] All tests passing

---

## Risk Mitigation

### Low Risk (Safe to proceed)
- Removing Drizzle imports
- Creating shared utilities
- Adding error handling

### Medium Risk (Requires testing)
- Converting queries to Prisma
- Adding transaction timeouts

### High Risk (Careful testing required)
- Inventory system migration
- Financial reports migration
- PIN hashing migration (affects existing PINs)

---

## Timeline Summary

| Week | Focus | Days |
|------|-------|------|
| **Week 1** | Critical fixes, Drizzle removal, Utilities | 5 |
| **Week 2** | Map migration (inventory, purchase orders) | 5 |
| **Week 3** | Map migration (remaining), Performance | 5 |
| **Week 4** | Security, Production readiness, Testing | 5 |

**Total: 20 working days (4 weeks)**

---

## Next Steps

1. **Start with Phase 1** - Fix critical bugs (same day)
2. **Deploy agents for Phase 2** - Drizzle conversion
3. **Create utilities in Phase 3** - Foundation for other fixes
4. **Systematic error handling in Phase 4**
5. **Map migration in Phases 5-6**
6. **Security and production in Phases 7-8**

---

**Plan Created:** December 22, 2025
**Review Date:** Weekly during implementation
