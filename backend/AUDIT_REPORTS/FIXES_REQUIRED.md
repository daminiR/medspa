# CRITICAL FIXES REQUIRED - Prisma Error Handling

## Overview
The audit identified **ZERO Prisma-specific error handling** across all 40 route files. This is a critical security and UX issue.

---

## Fix 1: Create Prisma Error Handler Middleware

**File:** `src/middleware/prisma-error-handler.ts`

```typescript
/**
 * Prisma Error Handler Middleware
 *
 * Converts Prisma-specific errors into user-friendly API errors
 * Prevents database internals from leaking to clients
 */

import { Prisma } from '@prisma/client';
import { APIError } from './error';

/**
 * Handle Prisma errors and convert to APIError
 * This function never returns - it always throws
 */
export function handlePrismaError(error: unknown): never {
  // Handle Prisma known request errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const target = error.meta?.target as string[] | undefined;
        const field = target?.[0] || 'field';
        throw APIError.conflict(
          `A record with this ${field} already exists`,
          { field, code: 'UNIQUE_CONSTRAINT' }
        );

      case 'P2003':
        // Foreign key constraint violation
        const fieldName = error.meta?.field_name as string | undefined;
        throw APIError.badRequest(
          'Related record not found',
          { field: fieldName, code: 'FOREIGN_KEY_CONSTRAINT' }
        );

      case 'P2025':
        // Record not found on update/delete
        throw APIError.notFound('Record', {
          code: 'NOT_FOUND'
        });

      case 'P2014':
        // Invalid relation
        throw APIError.badRequest(
          'Invalid relationship between records',
          { code: 'INVALID_RELATION' }
        );

      case 'P2034':
        // Transaction conflict (deadlock)
        throw APIError.conflict(
          'Operation conflict detected, please retry',
          { code: 'TRANSACTION_CONFLICT', retryable: true }
        );

      case 'P2024':
        // Timed out fetching from database
        throw APIError.timeout(
          'Database operation timed out',
          { code: 'TIMEOUT' }
        );

      case 'P2028':
        // Transaction API error
        throw APIError.internal(
          'Transaction error',
          { code: 'TRANSACTION_ERROR' }
        );

      default:
        // Unknown Prisma error - log but don't expose details
        console.error('[Prisma Error]', {
          code: error.code,
          message: error.message,
          meta: error.meta
        });
        throw APIError.internal(
          'Database operation failed',
          { code: 'DATABASE_ERROR' }
        );
    }
  }

  // Handle Prisma validation errors
  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error('[Prisma Validation Error]', error.message);
    throw APIError.badRequest(
      'Invalid data provided to database',
      { code: 'VALIDATION_ERROR' }
    );
  }

  // Handle Prisma runtime errors
  if (error instanceof Prisma.PrismaClientRustPanicError) {
    console.error('[Prisma Panic]', error.message);
    throw APIError.internal(
      'Critical database error',
      { code: 'DATABASE_PANIC' }
    );
  }

  // Handle Prisma initialization errors
  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error('[Prisma Init Error]', error.message);
    throw APIError.internal(
      'Database connection error',
      { code: 'DATABASE_CONNECTION_ERROR' }
    );
  }

  // Handle Prisma unknown request errors
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    console.error('[Prisma Unknown Error]', error.message);
    throw APIError.internal(
      'Unknown database error',
      { code: 'UNKNOWN_DATABASE_ERROR' }
    );
  }

  // Re-throw APIErrors as-is
  if (error instanceof APIError) {
    throw error;
  }

  // Unknown error type
  console.error('[Unknown Error]', error);
  throw APIError.internal(
    'An unexpected error occurred',
    { code: 'UNKNOWN_ERROR' }
  );
}

/**
 * Async wrapper for database operations with Prisma error handling
 *
 * @example
 * const result = await withPrismaErrorHandling(() =>
 *   prisma.user.create({ data: { email: 'test@example.com' } })
 * );
 */
export async function withPrismaErrorHandling<T>(
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Transaction wrapper with Prisma error handling and timeout
 *
 * @example
 * const result = await transactionWithErrorHandling(async (tx) => {
 *   await tx.invoice.create({ ... });
 *   await tx.payment.create({ ... });
 * });
 */
export async function transactionWithErrorHandling<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  }
): Promise<T> {
  try {
    return await prisma.$transaction(fn, {
      maxWait: options?.maxWait || 5000,
      timeout: options?.timeout || 10000,
      isolationLevel: options?.isolationLevel || Prisma.TransactionIsolationLevel.ReadCommitted,
    });
  } catch (error) {
    handlePrismaError(error);
  }
}
```

---

## Fix 2: Update APIError Class

**File:** `src/middleware/error.ts`

Add missing error types:

```typescript
export class APIError extends Error {
  // ... existing code ...

  static conflict(message: string, metadata?: Record<string, any>): APIError {
    return new APIError(message, 409, 'CONFLICT', metadata);
  }

  static timeout(message: string, metadata?: Record<string, any>): APIError {
    return new APIError(message, 408, 'TIMEOUT', metadata);
  }
}
```

---

## Fix 3: Update Route Handlers

### Example: Payments Route

**File:** `src/routes/payments.prisma.ts`

**BEFORE:**
```typescript
try {
  const result = await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({ where: { id: data.invoiceId } });
    if (!invoice) {
      throw APIError.notFound('Invoice');
    }
    // ... more operations
  });
  return c.json({ result });
} catch (error) {
  if (error instanceof APIError) throw error;
  console.error('Error creating payment:', error);
  throw APIError.internal('Failed to create payment');
}
```

**AFTER:**
```typescript
import { handlePrismaError, transactionWithErrorHandling } from '../middleware/prisma-error-handler';

try {
  const result = await transactionWithErrorHandling(async (tx) => {
    const invoice = await tx.invoice.findUnique({ where: { id: data.invoiceId } });
    if (!invoice) {
      throw APIError.notFound('Invoice');
    }
    // ... more operations
  }, {
    timeout: 30000  // 30 seconds for financial operations
  });
  return c.json({ result });
} catch (error) {
  handlePrismaError(error);
}
```

---

## Fix 4: Files Requiring Updates

### CRITICAL PRIORITY (Financial Operations)

1. **src/routes/payments.prisma.ts**
   - 18 catch blocks to update
   - 2 transaction blocks to wrap

2. **src/routes/invoices.ts**
   - 12 catch blocks to update
   - 4 transaction blocks to wrap

3. **src/routes/gift-cards.ts**
   - 10 catch blocks to update
   - 3 transaction blocks to wrap

### HIGH PRIORITY

4. **src/routes/packages.ts**
   - 1 catch block to update
   - 1 transaction block to wrap

5. **src/routes/memberships.ts**
   - 13 catch blocks to update

6. **src/routes/forms.ts**
   - 8 catch blocks to update

### MEDIUM PRIORITY (All Other Routes)

7-40. All remaining route files with try-catch blocks

---

## Fix 5: Add Retry Logic for Deadlocks

**File:** `src/lib/retry.ts`

```typescript
import { Prisma } from '@prisma/client';

/**
 * Retry a function on transaction conflicts (deadlocks)
 *
 * @param fn Function to retry
 * @param maxRetries Maximum number of retry attempts
 * @param backoffMs Base backoff time in milliseconds
 */
export async function retryOnConflict<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  backoffMs: number = 100
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2034' && attempt < maxRetries) {
          // Transaction conflict - retry with exponential backoff
          const delay = backoffMs * Math.pow(2, attempt - 1);
          console.warn(
            `[Retry ${attempt}/${maxRetries}] Transaction conflict, retrying in ${delay}ms`
          );
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      // Not a retryable error or max retries exceeded
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Usage example:
 *
 * const result = await retryOnConflict(async () => {
 *   return await prisma.$transaction(async (tx) => {
 *     // ... operations that might conflict
 *   });
 * });
 */
```

---

## Implementation Checklist

### Week 1: Critical Routes
- [ ] Create `src/middleware/prisma-error-handler.ts`
- [ ] Create `src/lib/retry.ts`
- [ ] Update `src/middleware/error.ts` (add conflict, timeout methods)
- [ ] Update `src/routes/payments.prisma.ts`
- [ ] Update `src/routes/invoices.ts`
- [ ] Update `src/routes/gift-cards.ts`
- [ ] Write unit tests for error scenarios
- [ ] Deploy to staging
- [ ] Test error scenarios in staging

### Week 2: Standard Routes
- [ ] Update `src/routes/packages.ts`
- [ ] Update `src/routes/memberships.ts`
- [ ] Update `src/routes/forms.ts`
- [ ] Update `src/routes/patients.ts`
- [ ] Test transaction conflicts
- [ ] Test error messages
- [ ] Deploy to staging

### Week 3: Complete Coverage
- [ ] Update all remaining route files (30+ files)
- [ ] Integration tests for transaction rollbacks
- [ ] Performance testing
- [ ] Code review
- [ ] Deploy to production

### Week 4: Monitoring
- [ ] Monitor error rates and types
- [ ] Tune transaction timeouts
- [ ] Document error codes for API
- [ ] Create error dashboard

---

## Testing Strategy

### Unit Tests

```typescript
// tests/error-handling.test.ts
import { handlePrismaError } from '../src/middleware/prisma-error-handler';
import { Prisma } from '@prisma/client';
import { APIError } from '../src/middleware/error';

describe('Prisma Error Handling', () => {
  it('should convert P2002 to conflict error', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: { target: ['email'] }
      }
    );

    expect(() => handlePrismaError(prismaError)).toThrow(APIError);
    expect(() => handlePrismaError(prismaError)).toThrow(/email already exists/);
  });

  it('should convert P2003 to bad request', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Foreign key constraint failed',
      {
        code: 'P2003',
        clientVersion: '5.0.0',
        meta: { field_name: 'patientId' }
      }
    );

    expect(() => handlePrismaError(prismaError)).toThrow(APIError);
    expect(() => handlePrismaError(prismaError)).toThrow(/Related record not found/);
  });

  it('should convert P2025 to not found', () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Record not found',
      {
        code: 'P2025',
        clientVersion: '5.0.0'
      }
    );

    expect(() => handlePrismaError(prismaError)).toThrow(APIError);
    expect(() => handlePrismaError(prismaError)).toThrow(/not found/);
  });
});
```

### Integration Tests

```typescript
// tests/integration/payment-transactions.test.ts
describe('Payment Transaction Error Handling', () => {
  it('should handle duplicate transaction ID', async () => {
    // Create first payment
    await request(app)
      .post('/api/payments')
      .send({
        invoiceId: 'inv_1',
        patientId: 'pat_1',
        amount: 100,
        method: 'credit_card',
        transactionId: 'txn_duplicate'
      })
      .expect(201);

    // Try to create duplicate
    const response = await request(app)
      .post('/api/payments')
      .send({
        invoiceId: 'inv_1',
        patientId: 'pat_1',
        amount: 100,
        method: 'credit_card',
        transactionId: 'txn_duplicate'
      })
      .expect(409);

    expect(response.body.error).toContain('already exists');
    expect(response.body.code).toBe('UNIQUE_CONSTRAINT');
  });

  it('should handle non-existent invoice', async () => {
    const response = await request(app)
      .post('/api/payments')
      .send({
        invoiceId: 'non_existent',
        patientId: 'pat_1',
        amount: 100,
        method: 'cash'
      })
      .expect(404);

    expect(response.body.error).toContain('Invoice');
  });
});
```

---

## Success Criteria

### Before Deployment
- [ ] All 40 route files use Prisma error handling
- [ ] All financial operations have transaction timeouts
- [ ] Unit tests pass (100% coverage of error codes)
- [ ] Integration tests pass (transaction rollbacks work)
- [ ] No database internals exposed in error messages
- [ ] Staging testing complete

### Post Deployment
- [ ] Error rate < 0.1% for P2002 errors
- [ ] Average transaction time < 200ms
- [ ] No timeout errors in first week
- [ ] User-friendly error messages confirmed
- [ ] Monitoring dashboard active

---

## Risk Assessment

### Before Fixes
- **Security Risk:** HIGH (database structure exposed)
- **UX Risk:** HIGH (poor error messages)
- **Reliability Risk:** MEDIUM (no timeouts, no retries)

### After Fixes
- **Security Risk:** LOW (errors sanitized)
- **UX Risk:** LOW (clear error messages)
- **Reliability Risk:** LOW (timeouts, retries in place)

---

## Contact & Questions

For implementation questions:
- Review `src/lib/db.ts` for existing utilities
- Check Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference
- Test error scenarios in staging first

**Priority:** CRITICAL - Must fix before production deployment
**Estimated Effort:** 2-3 weeks
**Risk if Not Fixed:** Database internals exposed, poor UX, potential security issues
