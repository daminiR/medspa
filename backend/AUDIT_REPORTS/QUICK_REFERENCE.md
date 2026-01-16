# Prisma Transaction & Error Handling - Quick Reference

## Audit Summary

**Date:** December 22, 2025
**Status:** ⚠️ CRITICAL FIXES REQUIRED

### Key Metrics
- ✅ Transaction Usage: **17/17 transactions properly implemented**
- ✅ ACID Compliance: **100% of financial operations use transactions**
- ❌ Prisma Error Handling: **0/40 files have proper error handling**
- ⚠️ Transaction Timeouts: **0/17 transactions have timeout config**
- **Overall Score:** 59% - Needs Improvement

---

## Critical Issues

### 🔴 Issue #1: No Prisma Error Handling
**Impact:** Database internals exposed to clients
**Affected:** All 40 route files
**Priority:** CRITICAL

**Example Problem:**
```typescript
// Current code exposes database details
try {
  await prisma.patient.create({ data: { email: "existing@example.com" } });
} catch (error) {
  throw APIError.internal('Failed to create patient');
  // Error message to client might include: "Unique constraint failed on Patient_email_key"
}
```

### 🟡 Issue #2: Missing Transaction Timeouts
**Impact:** Potential connection pool exhaustion
**Affected:** 17 transaction blocks
**Priority:** HIGH

**Example Problem:**
```typescript
// No timeout - could hang indefinitely
await prisma.$transaction(async (tx) => {
  // ... operations
});
```

---

## Quick Fixes

### Fix #1: Add Error Handler (5 minutes)

1. Create `src/middleware/prisma-error-handler.ts` (see FIXES_REQUIRED.md)
2. Import in route files:
```typescript
import { handlePrismaError, transactionWithErrorHandling } from '../middleware/prisma-error-handler';
```

3. Replace catch blocks:
```typescript
// BEFORE
try {
  const result = await prisma.model.create({ ... });
} catch (error) {
  console.error('Error:', error);
  throw APIError.internal('Failed');
}

// AFTER
try {
  const result = await prisma.model.create({ ... });
} catch (error) {
  handlePrismaError(error);
}
```

### Fix #2: Add Transaction Timeouts (2 minutes)

```typescript
// BEFORE
await prisma.$transaction(async (tx) => {
  // ... operations
});

// AFTER
await transactionWithErrorHandling(async (tx) => {
  // ... operations
}, {
  maxWait: 5000,   // Wait for transaction slot
  timeout: 10000,  // Max transaction duration
});
```

---

## Files to Fix

### Critical Priority (Week 1)
1. `src/routes/payments.prisma.ts` - 18 catch blocks
2. `src/routes/invoices.ts` - 12 catch blocks
3. `src/routes/gift-cards.ts` - 10 catch blocks

### High Priority (Week 2)
4. `src/routes/packages.ts` - 1 catch block
5. `src/routes/memberships.ts` - 13 catch blocks
6. `src/routes/forms.ts` - 8 catch blocks

### Standard Priority (Week 3)
7-40. All remaining route files

---

## Common Prisma Error Codes

| Code | Meaning | HTTP Status | User Message |
|------|---------|-------------|--------------|
| P2002 | Unique constraint | 409 Conflict | "A record with this {field} already exists" |
| P2003 | Foreign key violation | 400 Bad Request | "Related record not found" |
| P2025 | Record not found | 404 Not Found | "Record not found" |
| P2014 | Invalid relation | 400 Bad Request | "Invalid relationship" |
| P2034 | Transaction conflict | 409 Conflict | "Operation conflict, please retry" |

---

## Transaction Best Practices

### ✅ DO
```typescript
// Use transaction for multi-table updates
await transactionWithErrorHandling(async (tx) => {
  await tx.payment.create({ ... });
  await tx.invoice.update({ ... });
});

// Add timeout for financial operations
await transactionWithErrorHandling(async (tx) => {
  // ... operations
}, { timeout: 30000 });  // 30 seconds
```

### ❌ DON'T
```typescript
// Don't update related tables separately
await prisma.payment.create({ ... });
await prisma.invoice.update({ ... });  // ❌ Not atomic!

// Don't use transaction for single operations
await prisma.$transaction(async (tx) => {
  await tx.user.findMany();  // ❌ Unnecessary overhead
});
```

---

## Testing Checklist

### Before Deployment
- [ ] Unit tests for P2002, P2003, P2025 errors
- [ ] Integration tests for transaction rollbacks
- [ ] Test timeout scenarios
- [ ] Verify error messages don't expose DB internals
- [ ] Performance test transactions

### After Deployment
- [ ] Monitor error rates
- [ ] Check transaction performance
- [ ] Verify no timeout errors
- [ ] Collect user feedback on error messages

---

## Resources

### Documentation
- Full Audit: `AUDIT_REPORTS/transaction_error_audit.md`
- Fix Guide: `AUDIT_REPORTS/FIXES_REQUIRED.md`
- Prisma Errors: https://www.prisma.io/docs/reference/api-reference/error-reference

### Utilities Already Available
- `src/lib/db.ts` - Database utilities with error handling
- `src/middleware/error.ts` - APIError class

### Code Examples
See `FIXES_REQUIRED.md` for complete implementations.

---

## Next Steps

1. **Create error handler** (30 minutes)
   - `src/middleware/prisma-error-handler.ts`
   - `src/lib/retry.ts`

2. **Update critical routes** (1 week)
   - payments.prisma.ts
   - invoices.ts
   - gift-cards.ts

3. **Update remaining routes** (2 weeks)
   - All other route files

4. **Test & Deploy** (1 week)
   - Unit tests
   - Integration tests
   - Staging deployment
   - Production deployment

---

## Contact

For questions or implementation help:
- Review existing code in `src/lib/db.ts`
- Check Prisma documentation
- Test in staging environment first

**Last Updated:** December 22, 2025
**Next Review:** After fixes implemented
