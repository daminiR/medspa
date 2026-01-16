# Map Removal Status - Quick Reference

**Last Updated:** 2025-12-22
**Status:** 🔴 **CRITICAL ISSUES FOUND**

---

## 🎯 Goal: Remove ALL In-Memory Maps Used for Data Storage

### Current Status

```
Total Files:        40
✅ Using Prisma:    20 (50%)
❌ Using Maps:      18 (45%)
❌ Using Drizzle:    3 (7.5%)
```

---

## 🔴 Critical: Map Storage Still Present

### Data Persistence Maps (MUST REMOVE)

| Priority | File | Maps | Lines | Status |
|----------|------|------|-------|--------|
| 🔴 CRITICAL | `inventory-adjustments.ts` | 9 | 2,437 | ❌ Migrate to Prisma |
| 🔴 CRITICAL | `inventory-reports.ts` | 31* | 2,116 | ⚠️ 5 data + 26 aggregation |
| 🔴 CRITICAL | `inventory-lots.ts` | 4 | 2,084 | ❌ Migrate to Prisma |
| 🔴 CRITICAL | `purchase-orders.ts` | 5 | 1,862 | ❌ Migrate to Prisma |
| 🔴 CRITICAL | `group-bookings.ts` | 2 | 1,625 | ❌ Migrate to Prisma |
| 🟠 HIGH | `financial-reports.ts` | 6 | 1,601 | ⚠️ Has Prisma version |
| 🟠 HIGH | `photos.ts` | 4 | 1,277 | ❌ Migrate to Prisma |
| 🟠 HIGH | `payments.ts` | 3 | 1,163 | ❌ Migrate to Prisma |
| 🟡 MEDIUM | `treatment-templates.ts` | 2 | ~800 | ❌ Migrate to Prisma |
| 🟡 MEDIUM | `waitlist.ts` | 1 | 1,472 | ⚠️ Mostly Prisma (token store only) |
| 🟡 MEDIUM | `charting-settings.ts` | 1 | ~400 | ❌ Migrate to Prisma |
| 🟡 MEDIUM | `recurring.ts` | 1 | 1,353 | ❌ Migrate to Prisma |

*Note: `inventory-reports.ts` has 31 total Maps, but 26 are for aggregation (acceptable). Only 5 need migration.

---

## ✅ Acceptable Map Usage (DO NOT REMOVE)

These files use Maps for ephemeral/cache data - this is CORRECT:

| File | Maps | Purpose | Status |
|------|------|---------|--------|
| `kiosk-auth.ts` | 4 | QR tokens, sessions (short-lived) | ✅ Keep |
| `patient-auth.ts` | 6 | Magic links, OTP codes (temporary) | ✅ Keep |
| `express-booking.ts` | 1 | Rate limiting only | ✅ Keep |
| `messaging-templates.ts` | 1 | Category aggregation (transient) | ✅ Keep |
| `products.ts` | 1 | Location aggregation (transient) | ✅ Keep |
| `staff-auth.ts` | 2 | Sessions OK, but PINs should be in DB | ⚠️ Partial fix |

---

## ❌ Wrong ORM: Drizzle Usage (MUST REMOVE)

| File | Lines | Issue | Action |
|------|-------|-------|--------|
| `appointments.ts` | 1,549 | `import { db } from '@medical-spa/db'` | Replace with Prisma |
| `services.ts` | ~900 | `import { db } from '@medical-spa/db'` | Replace with Prisma |
| `products.ts` | ~900 | `import { db } from '@medical-spa/db'` + stale docs | Replace with Prisma + fix docs |

---

## 📊 Map Distribution

### By Category:

```
Inventory System:     18 Maps (3 files)  ← Highest concentration
Financial:             9 Maps (2 files)
Booking/Scheduling:    4 Maps (2 files)
Treatment/Clinical:    6 Maps (2 files)
Settings/Config:       2 Maps (2 files)
Auth/Session:         20 Maps (6 files)  ← Acceptable
Aggregation/Cache:    ~28 Maps (multiple) ← Acceptable
```

### By Migration Priority:

```
🔴 Critical:  28 Maps (5 files)
🟠 High:      13 Maps (3 files)
🟡 Medium:     4 Maps (3 files)
✅ Acceptable: ~50 Maps (various) - cache/session/aggregation
```

---

## 🎬 Migration Order (Recommended)

### Week 1: Foundation
1. **Day 1:** Remove Drizzle from 3 files (appointments, services, products)
2. **Day 2:** Create shared utilities (request-utils, prisma-utils, enum-converters)
3. **Day 3:** Fix staff-auth.ts PIN hashing security issue

### Week 2: Inventory System
4. **Days 4-5:** Migrate `inventory-lots.ts` (4 Maps)
5. **Days 6-8:** Migrate `inventory-adjustments.ts` (9 Maps)
6. **Days 9-10:** Migrate `inventory-reports.ts` (5 data storage Maps only)

### Week 3: Supporting Systems
7. **Days 11-12:** Migrate `purchase-orders.ts` (5 Maps)
8. **Days 13-14:** Migrate `group-bookings.ts` (2 Maps)
9. **Day 15:** Migrate `photos.ts` (4 Maps)

### Week 4: Remaining Files
10. **Days 16-17:** Migrate `payments.ts` (3 Maps)
11. **Day 18:** Migrate `treatment-templates.ts` (2 Maps)
12. **Day 19:** Migrate smaller files (recurring, charting-settings, waitlist token store)
13. **Day 20:** Final verification and testing

---

## 🔍 Verification Commands

### Check for remaining Maps (data storage)
```bash
grep -r "new Map<string, Stored" src/routes/ | grep -v "Cache\|Token\|Session\|RateLimit"
```

**Expected after migration:** 0 results

### Check for Drizzle imports
```bash
grep -r "from '@medical-spa/db'" src/routes/
```

**Expected after Phase 1:** 0 results

### Check for initMockData calls
```bash
grep -r "initMockData()" src/routes/
```

**Expected after migration:** Only in auth files (acceptable)

### Count Prisma usage
```bash
grep -c "prisma\." src/routes/*.ts | grep -v ":0$" | wc -l
```

**Expected after migration:** ~35-40 files (all data files)

---

## 📈 Progress Tracking

### ✅ Completed (0%)
- [ ] None yet

### 🚧 In Progress (0%)
- [ ] None yet

### 📋 To Do (100%)
- [ ] Remove Drizzle from 3 files
- [ ] Migrate 18 Map-based files
- [ ] Create shared utilities
- [ ] Fix security issues
- [ ] Write integration tests

---

## 🎯 Success Criteria

### Phase 1: Foundation (Week 1)
- [ ] Zero Drizzle imports in codebase
- [ ] Shared utilities created and in use
- [ ] Security issues fixed

### Phase 2: Inventory (Week 2)
- [ ] Inventory-lots migrated
- [ ] Inventory-adjustments migrated
- [ ] Inventory-reports data storage migrated

### Phase 3: Supporting (Week 3)
- [ ] Purchase orders migrated
- [ ] Group bookings migrated
- [ ] Photos migrated

### Phase 4: Complete (Week 4)
- [ ] All Map-based data storage migrated
- [ ] Only ephemeral/cache Maps remain
- [ ] 100% Prisma ORM usage for data persistence
- [ ] All tests passing
- [ ] Documentation updated

---

## 🚨 Blockers & Risks

### Potential Blockers:
1. **Missing Prisma Schema Tables** - Some entities may not exist in schema.prisma yet
2. **Complex Business Logic** - Inventory system has intricate workflows
3. **Data Migration** - If production data exists, need migration strategy
4. **Testing Coverage** - Need comprehensive tests before migration

### Risk Mitigation:
1. ✅ Review Prisma schema before each migration
2. ✅ Write tests for existing Map-based logic first
3. ✅ Migrate one file at a time with full testing
4. ✅ Keep backup of Map-based code until confirmed working

---

## 📞 Need Help?

**Schema Issues:** Check `/prisma/schema.prisma`
**Type Errors:** Review generated `@prisma/client` types
**Query Help:** See Prisma docs at prisma.io/docs
**Migration Questions:** Refer to `/AUDIT_REPORTS/immediate_action_items.md`

---

**Generated:** 2025-12-22
**Report Location:** `/backend/AUDIT_REPORTS/code_quality_audit.md`
**Action Items:** `/backend/AUDIT_REPORTS/immediate_action_items.md`
