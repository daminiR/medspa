# Code Quality & Map Removal Audit Report
**Date:** 2025-12-22
**Scope:** `/Users/daminirijhwani/medical-spa-platform/backend/src/routes/`
**Total Files Analyzed:** 40 route files

---

## Executive Summary

### Critical Findings
- **18 files** still use in-memory Map storage for data persistence
- **Mixed architecture**: Some files use Prisma ORM, some use Drizzle ORM, many use in-memory Maps
- **3 files** use Drizzle (`@medical-spa/db`), remainder should use Prisma
- **Zero Map usage** for caching/temporary data is acceptable (rate limiting, tokens, etc.)

### Migration Status
- ✅ **20 files** fully migrated to Prisma (50%)
- ⚠️ **18 files** still using in-memory Maps (45%)
- ⚠️ **3 files** using Drizzle ORM (need conversion to Prisma) (7.5%)
- ⚠️ **Drizzle documentation** still present in code comments

---

## 1. Map Removal Verification (CRITICAL)

### Files Still Using Maps for Data Storage

#### HIGH PRIORITY - Core Features (Must Migrate to Prisma)

| File | Map Count | Purpose | Migration Priority | Notes |
|------|-----------|---------|-------------------|-------|
| `inventory-adjustments.ts` | 9 | Transaction tracking, waste records, transfers | **CRITICAL** | 2,437 lines, complex inventory logic |
| `inventory-reports.ts` | 31 | Report caching + aggregation maps | **CRITICAL** | 2,116 lines, heavy computation |
| `inventory-lots.ts` | 4 | Lot tracking, alerts, open vials | **CRITICAL** | 2,084 lines, core inventory |
| `purchase-orders.ts` | 5 | PO tracking, vendor management | **HIGH** | 1,862 lines |
| `group-bookings.ts` | 2 | Group booking and invite codes | **HIGH** | 1,625 lines |
| `financial-reports.ts` | 6 | Report caching + aggregation | **HIGH** | 1,601 lines (PRISMA version exists!) |
| `waitlist.ts` | 1 | Offer token store only | **MEDIUM** | 1,472 lines, mostly Prisma |
| `photos.ts` | 4 | Treatment photos, annotations | **MEDIUM** | 1,277 lines |

#### MEDIUM PRIORITY - Supporting Features

| File | Map Count | Purpose | Migration Priority |
|------|-----------|---------|-------------------|
| `payments.ts` | 3 | Payment, invoice, gift card tracking | **MEDIUM** |
| `treatment-templates.ts` | 2 | Template and playbook storage | **MEDIUM** |
| `charting-settings.ts` | 1 | Settings storage | **LOW** |
| `recurring.ts` | 1 | Recurring pattern storage | **LOW** |

#### LOW PRIORITY - Auth/Session/Temporary (Maps Acceptable)

These files use Maps for **ephemeral data** (sessions, tokens, rate limiting). This is acceptable:

| File | Map Count | Purpose | Action Required |
|------|-----------|---------|-----------------|
| `kiosk-auth.ts` | 4 | QR tokens, sessions, rate limits | ✅ **NONE** (ephemeral) |
| `patient-auth.ts` | 6 | Magic links, OTP, sessions, rate limits | ✅ **NONE** (ephemeral) |
| `staff-auth.ts` | 2 | PIN storage, session tracking | ⚠️ **PARTIAL** (PINs should be in DB) |
| `express-booking.ts` | 1 | Rate limiting only | ✅ **NONE** (ephemeral) |
| `messaging-templates.ts` | 1 | Category aggregation map (transient) | ✅ **NONE** (aggregation) |
| `products.ts` | 1 | Location aggregation map (transient) | ✅ **NONE** (aggregation) |

---

## 2. Database Architecture Issues

### Mixed ORM Usage (CRITICAL ISSUE)

**Problem:** Codebase uses THREE different data access patterns:
1. ✅ Prisma ORM (`import { prisma } from '../lib/prisma'`) - **STANDARD**
2. ❌ Drizzle ORM (`import { db } from '@medical-spa/db'`) - **REMOVE**
3. ❌ In-memory Maps - **MIGRATE TO PRISMA**

#### Files Using Drizzle (Must Convert to Prisma)

```
✅ STANDARD: import { prisma } from '../lib/prisma'
❌ REMOVE:   import { db } from '@medical-spa/db'
```

| File | Lines | Issue | Action |
|------|-------|-------|--------|
| `appointments.ts` | 1,549 | Uses Drizzle ORM | Convert to Prisma |
| `services.ts` | ~900 | Uses Drizzle ORM | Convert to Prisma |
| `products.ts` | ~900 | Uses Drizzle ORM + stale docs | Convert to Prisma + fix docs |

**Code Evidence:**
```typescript
// products.ts line 13-14 - STALE DOCUMENTATION
* @database Drizzle ORM with PostgreSQL  // ❌ WRONG - should say Prisma

// products.ts line 23-24 - WRONG IMPORTS
import { db, products as productsTable, inventoryLots, eq, and, or, sql, asc, desc, gte, lte, inArray } from '@medical-spa/db';
import { sum } from 'drizzle-orm';  // ❌ Remove Drizzle imports
```

---

## 3. Type Safety Analysis

### Good: Minimal `any` Usage

Most `any` usage is **justified** and limited to:

#### Acceptable `any` Usage:
- **getClientIP(c: any)** - Hono context type (framework limitation)
- **getUserAgent(c: any)** - Same as above
- **Dynamic aggregation maps** - For report generation
- **updateData: any** - Prisma dynamic updates

#### Total `: any` Count: **~80 instances** across 40 files
- Average: **2 per file** - This is excellent!
- Most are helper functions with framework limitations

### Type Safety Issues Found:

#### 1. Missing Enum Conversion
**File:** Multiple files
**Issue:** Database enums (Prisma) not converted to API enums

```typescript
// Common pattern - needs enum mapping
status: dbRecord.status as AppointmentStatus, // ⚠️ Direct casting
```

**Recommendation:** Create enum conversion utilities:
```typescript
// utils/enumConverters.ts
export function toAPIAppointmentStatus(dbStatus: Prisma.AppointmentStatus): AppointmentStatus {
  // Explicit mapping with validation
}
```

#### 2. JSON Field Type Safety
**Files:** Several routes handling JSON columns
**Current:** Casting without validation
```typescript
metadata: record.metadata as any // ⚠️ No validation
```

**Recommendation:** Use Zod schemas for JSON validation:
```typescript
const metadataSchema = z.object({ ... });
metadata: metadataSchema.parse(record.metadata)
```

---

## 4. Import Pattern Analysis

### Prisma Import Patterns (CORRECT)

20 files correctly use Prisma:

```typescript
✅ CORRECT:
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import type { WaitlistStatus, VIPTier } from '@prisma/client';
```

**Files with correct Prisma usage:**
- waitlist.ts
- express-booking.ts
- form-submissions.ts
- forms.ts
- gift-cards.ts
- invoices.ts
- memberships.ts
- messaging-campaigns.ts
- messaging-consent.ts
- messaging-reminders.ts
- messaging-templates.ts
- messaging-webhooks.ts
- messaging.ts
- packages.ts
- patients.ts
- payments.prisma.ts
- charting-settings.prisma.ts
- providers.ts
- treatments.ts
- financial-reports.ts (creates own PrismaClient instance)

### Drizzle Imports (INCORRECT - Remove)

3 files use Drizzle:

```typescript
❌ REMOVE:
import { db, products as productsTable, ... } from '@medical-spa/db';
import { sum } from 'drizzle-orm';
```

**Files to fix:**
- appointments.ts
- services.ts
- products.ts

---

## 5. Code Pattern Issues

### Duplicate Query Patterns

Many files have similar Prisma query patterns that could be shared:

#### Common Pattern 1: Pagination
```typescript
// Repeated across 15+ files
const skip = (page - 1) * limit;
const items = await prisma.entity.findMany({
  skip,
  take: limit,
  where,
  orderBy,
});
const total = await prisma.entity.count({ where });
```

**Recommendation:** Create shared pagination utility:
```typescript
// lib/prisma-utils.ts
export async function paginate<T>(
  model: any,
  query: PaginationQuery,
  options?: PaginationOptions
): Promise<PaginatedResult<T>>
```

#### Common Pattern 2: Soft Delete
```typescript
// Repeated pattern
where: {
  deletedAt: null,
  // other conditions
}
```

**Recommendation:** Create query builder helpers or global soft-delete middleware.

#### Common Pattern 3: Client IP Extraction
```typescript
// Duplicated in 25+ files
function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}
```

**Recommendation:** Move to shared middleware utility:
```typescript
// middleware/request-utils.ts
export function getClientIP(c: Context): string
```

---

## 6. Mock Data & initMockData Issues

### Files Still Calling initMockData()

These files still initialize mock data (should be removed after Prisma migration):

| File | initMockData Calls | Status |
|------|-------------------|--------|
| waitlist.ts | 1 | ⚠️ Mixed (Prisma + Maps) |
| payments.ts | 3 | ❌ Full Maps |
| treatment-templates.ts | 3 | ❌ Full Maps |
| inventory-lots.ts | 3 | ❌ Full Maps |
| charting-settings.ts | 3 | ❌ Full Maps |
| inventory-reports.ts | 3 | ❌ Full Maps |
| group-bookings.ts | 3 | ❌ Full Maps |
| photos.ts | 3 | ❌ Full Maps |
| kiosk-auth.ts | 3 | ⚠️ Ephemeral data (acceptable) |
| purchase-orders.ts | 3 | ❌ Full Maps |
| inventory-adjustments.ts | 3 | ❌ Full Maps |
| appointments.ts | 1 | ❌ Uses Drizzle |

**Total:** 11 files with initMockData (excluding auth files)

---

## 7. Security & Audit Logging

### Good Practices Found:
- ✅ Most mutations log audit events via `@medical-spa/security`
- ✅ Client IP tracking implemented
- ✅ User tracking in audit logs

### Issues:
- ⚠️ **staff-auth.ts** uses weak PIN hashing (noted in code comments)
  ```typescript
  // Line 121: TODO: Use per-user salt stored in DB
  // Currently using static salt + SHA-256 (not bcrypt)
  ```
- ⚠️ Some routes missing audit logging on sensitive operations

---

## 8. Performance Concerns

### Report Caching Implementation

**Files:** `financial-reports.ts`, `inventory-reports.ts`

```typescript
const reportCache = new Map<string, { data: any; expiresAt: Date }>();
```

**Issue:** In-memory cache in single-process app is acceptable, but:
- ⚠️ Cache not shared across multiple server instances
- ⚠️ Cache cleared on server restart
- ⚠️ No cache invalidation strategy for data changes

**Recommendation:**
- Keep for development
- Replace with Redis/Memcached for production
- Add cache invalidation on related data mutations

### Large Aggregation Queries

**Files:** `inventory-reports.ts`, `financial-reports.ts`

Multiple nested Map operations for aggregation:
```typescript
const providerMap = new Map<string, {
  // Complex nested structure
  productMap: new Map(),
  areaMap: new Map(),
}>();
```

**Recommendation:**
- Consider database-level aggregation using Prisma's `groupBy`
- Use database views for complex reports
- Implement background job processing for large reports

---

## 9. File Size Analysis

### Largest Files (Complexity Risk)

| File | Lines | Complexity | Recommendation |
|------|-------|-----------|----------------|
| inventory-adjustments.ts | 2,437 | Very High | Split into multiple route files |
| inventory-reports.ts | 2,116 | Very High | Extract report generators to service layer |
| inventory-lots.ts | 2,084 | Very High | Split inventory logic into services |
| purchase-orders.ts | 1,862 | High | Separate PO and vendor routes |
| group-bookings.ts | 1,625 | High | Acceptable for now |
| financial-reports.ts | 1,601 | High | Already well-structured |
| appointments.ts | 1,549 | High | Consider splitting by feature |
| invoices.ts | 1,598 | High | Acceptable |

**Recommendation:** Files over 1,500 lines should be refactored into:
- `routes/{feature}.ts` - Route definitions only
- `services/{feature}.ts` - Business logic
- `lib/{feature}-helpers.ts` - Utility functions

---

## 10. Specific Fixes Required

### Priority 1: Remove Drizzle Imports

**Files:** `appointments.ts`, `services.ts`, `products.ts`

**Actions:**
1. Remove Drizzle imports:
   ```diff
   - import { db, products as productsTable, ... } from '@medical-spa/db';
   - import { sum } from 'drizzle-orm';
   + import { prisma } from '../lib/prisma';
   + import { Prisma } from '@prisma/client';
   ```

2. Convert Drizzle queries to Prisma:
   ```diff
   - const products = await db.select().from(productsTable).where(...)
   + const products = await prisma.product.findMany({ where: ... })
   ```

3. Update documentation:
   ```diff
   - * @database Drizzle ORM with PostgreSQL
   + * @database Prisma ORM with PostgreSQL
   ```

### Priority 2: Migrate Map-Based Storage to Prisma

**Critical Files:**
- inventory-adjustments.ts (9 Maps)
- inventory-reports.ts (31 Maps - many are aggregation, keep those)
- inventory-lots.ts (4 Maps)
- purchase-orders.ts (5 Maps)
- group-bookings.ts (2 Maps)

**Process for each file:**
1. Verify Prisma schema has required tables
2. Convert Map storage to Prisma queries
3. Remove initMockData() function
4. Add proper error handling
5. Add transaction support where needed
6. Update tests

### Priority 3: Consolidate Duplicate Code

**Create shared utilities:**

```typescript
// lib/prisma-utils.ts
export async function paginate<T>(...)
export function buildWhereClause(...)
export function applySoftDelete(...)

// middleware/request-utils.ts
export function getClientIP(c: Context): string
export function getUserAgent(c: Context): string

// lib/enum-converters.ts
export function toAPIEnum<T>(dbEnum: any): T
export function toDBEnum<T>(apiEnum: any): T
```

### Priority 4: Improve Type Safety

**JSON Field Validation:**
```typescript
// lib/validators/json-fields.ts
export const metadataSchema = z.object({...});
export const settingsSchema = z.object({...});

// Usage in routes:
const validated = metadataSchema.parse(record.metadata);
```

**Enum Type Guards:**
```typescript
// lib/type-guards.ts
export function isValidAppointmentStatus(status: string): status is AppointmentStatus {
  return ['scheduled', 'confirmed', ...].includes(status);
}
```

---

## Summary of Findings

### Data Storage
- ✅ **20/40 files (50%)** properly use Prisma ORM
- ❌ **18/40 files (45%)** still use in-memory Maps for data
- ❌ **3/40 files (7.5%)** use Drizzle ORM (needs removal)
- ⚠️ **6 auth-related files** use Maps for ephemeral data (acceptable)

### Code Quality
- ✅ **Excellent type safety** - minimal `any` usage (~2 per file average)
- ✅ **Good audit logging** coverage
- ⚠️ **Significant code duplication** - needs shared utilities
- ⚠️ **Large files** (5 files over 1,500 lines) need refactoring

### Architecture Consistency
- ❌ **Mixed ORM usage** (Prisma + Drizzle) - needs standardization
- ❌ **Stale documentation** referencing Drizzle
- ⚠️ **No shared query utilities** - lots of duplicate patterns

---

## Recommended Action Plan

### Phase 1: Immediate (This Sprint)
1. ✅ Remove Drizzle imports from 3 files
2. ✅ Update stale documentation
3. ✅ Create shared utility functions (request-utils, prisma-utils)
4. ✅ Fix staff-auth.ts PIN hashing security issue

### Phase 2: High Priority (Next Sprint)
1. Migrate inventory routes to Prisma:
   - inventory-adjustments.ts
   - inventory-lots.ts
   - inventory-reports.ts (data storage only, keep aggregation maps)
2. Migrate purchase-orders.ts
3. Migrate group-bookings.ts

### Phase 3: Medium Priority (Future)
1. Migrate remaining Map-based routes
2. Refactor large files (>1,500 lines) into services
3. Implement Redis caching for reports
4. Add comprehensive integration tests

### Phase 4: Optimization (Future)
1. Database query optimization
2. Add database indexes
3. Implement background job processing for heavy reports
4. Add request/response caching middleware

---

## Metrics

### Current State
- **Total Route Files:** 40
- **Using Prisma:** 20 (50%)
- **Using Drizzle:** 3 (7.5%)
- **Using Maps:** 18 (45%)
- **Average File Size:** 1,079 lines
- **Largest File:** 2,437 lines (inventory-adjustments.ts)
- **Total Lines of Code:** ~43,153

### Target State
- **Using Prisma:** 100%
- **Using Drizzle:** 0%
- **Using Maps (data):** 0%
- **Using Maps (cache/ephemeral):** As needed
- **Average File Size:** <800 lines
- **Largest File:** <1,200 lines

---

## Conclusion

The codebase shows **good type safety practices** and **proper audit logging**, but suffers from:
1. **Mixed database architecture** (Prisma + Drizzle + Maps)
2. **18 files still using in-memory storage**
3. **Significant code duplication**
4. **Large, complex route files**

**Primary Recommendation:** Standardize on Prisma ORM immediately, then systematically migrate Map-based storage to database tables.

**Estimated Migration Effort:**
- Phase 1 (Drizzle removal): 1-2 days
- Phase 2 (Inventory routes): 3-5 days
- Phase 3 (Remaining routes): 2-3 days
- Phase 4 (Refactoring): 3-5 days

**Total:** ~2-3 weeks of focused development work.
