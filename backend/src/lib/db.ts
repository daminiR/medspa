/**
 * Database Utilities
 *
 * Helper functions for database operations including transaction management,
 * error handling, and common query patterns.
 */

import { prisma } from './prisma';
import { Prisma } from '@prisma/client';

/**
 * Execute a function within a database transaction
 * Automatically handles rollback on error and commit on success
 *
 * @example
 * await withTransaction(async (tx) => {
 *   await tx.user.create({ data: { name: 'John' } });
 *   await tx.profile.create({ data: { userId: 1 } });
 * });
 */
export async function withTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(fn, {
    maxWait: 5000, // Maximum time to wait for a transaction slot (ms)
    timeout: 10000, // Maximum time the transaction can run (ms)
    isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
  });
}

/**
 * Execute multiple operations in a transaction using array syntax
 *
 * @example
 * await executeTransaction([
 *   prisma.user.create({ data: { name: 'John' } }),
 *   prisma.profile.create({ data: { userId: 1 } })
 * ]);
 */
export async function executeTransaction<T extends readonly Prisma.PrismaPromise<any>[]>(
  operations: T
): Promise<any> {
  return await prisma.$transaction(operations as any);
}

/**
 * Check if database connection is healthy
 * Useful for health check endpoints
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    return { healthy: true, latency };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Safely disconnect from database
 * Should be called during application shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * @deprecated UNSAFE - This function uses $queryRawUnsafe which is vulnerable to SQL injection.
 * Use Prisma's type-safe queries or $queryRaw with tagged templates instead.
 * This function will be removed in a future version.
 *
 * @example (DO NOT USE)
 * // UNSAFE - vulnerable to SQL injection
 * const result = await executeRawQuery<{ count: bigint }[]>(
 *   'SELECT COUNT(*) as count FROM users WHERE active = $1',
 *   [true]
 * );
 *
 * @example (USE THIS INSTEAD)
 * // SAFE - use $queryRaw with tagged templates
 * const result = await prisma.$queryRaw<{ count: bigint }[]>`
 *   SELECT COUNT(*) as count FROM users WHERE active = ${true}
 * `;
 */
export async function executeRawQuery<T = unknown>(
  query: string,
  values?: any[]
): Promise<T> {
  console.warn(
    'DEPRECATED: executeRawQuery() uses $queryRawUnsafe and is vulnerable to SQL injection. ' +
    'Use Prisma\'s type-safe queries or $queryRaw with tagged templates instead.'
  );
  return await prisma.$queryRawUnsafe<T>(query, ...(values || []));
}

/**
 * @deprecated UNSAFE - This function uses $executeRawUnsafe which is vulnerable to SQL injection.
 * Use Prisma's type-safe queries or $executeRaw with tagged templates instead.
 * This function will be removed in a future version.
 *
 * @example (DO NOT USE)
 * // UNSAFE - vulnerable to SQL injection
 * const affected = await executeRawMutation(
 *   'UPDATE users SET last_login = $1 WHERE id = $2',
 *   [new Date(), userId]
 * );
 *
 * @example (USE THIS INSTEAD)
 * // SAFE - use $executeRaw with tagged templates
 * const affected = await prisma.$executeRaw`
 *   UPDATE users SET last_login = ${new Date()} WHERE id = ${userId}
 * `;
 */
export async function executeRawMutation(
  query: string,
  values?: any[]
): Promise<number> {
  console.warn(
    'DEPRECATED: executeRawMutation() uses $executeRawUnsafe and is vulnerable to SQL injection. ' +
    'Use Prisma\'s type-safe queries or $executeRaw with tagged templates instead.'
  );
  return await prisma.$executeRawUnsafe(query, ...(values || []));
}

/**
 * Pagination helper
 * Calculates skip and take values for pagination
 *
 * @example
 * const { skip, take } = getPaginationParams(2, 20); // page 2, 20 items per page
 * const users = await prisma.user.findMany({
 *   skip,
 *   take,
 * });
 */
export function getPaginationParams(page: number = 1, pageSize: number = 10) {
  const validPage = Math.max(1, page);
  const validPageSize = Math.max(1, Math.min(100, pageSize)); // Cap at 100

  return {
    skip: (validPage - 1) * validPageSize,
    take: validPageSize,
  };
}

/**
 * Generic paginated query helper
 * Returns data along with pagination metadata
 *
 * @example
 * const result = await paginatedQuery(
 *   (skip, take) => prisma.user.findMany({ skip, take }),
 *   () => prisma.user.count(),
 *   1,
 *   20
 * );
 */
export async function paginatedQuery<T>(
  queryFn: (skip: number, take: number) => Promise<T[]>,
  countFn: () => Promise<number>,
  page: number = 1,
  pageSize: number = 10
) {
  const { skip, take } = getPaginationParams(page, pageSize);

  const [data, total] = await Promise.all([
    queryFn(skip, take),
    countFn(),
  ]);

  const totalPages = Math.ceil(total / take);

  return {
    data,
    pagination: {
      page,
      pageSize: take,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Batch upsert helper
 * Useful for bulk create/update operations
 *
 * @example
 * await batchUpsert(
 *   users,
 *   (user) => prisma.user.upsert({
 *     where: { email: user.email },
 *     create: user,
 *     update: user,
 *   }),
 *   50 // batch size
 * );
 */
export async function batchUpsert<T>(
  items: T[],
  upsertFn: (item: T) => Prisma.PrismaPromise<any>,
  batchSize: number = 50
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await prisma.$transaction(batch.map(upsertFn));
  }
}

/**
 * Database error handler
 * Converts Prisma errors to more user-friendly messages
 */
export function handleDatabaseError(error: unknown): {
  message: string;
  code?: string;
  field?: string;
} {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle known Prisma errors
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        return {
          message: 'A record with this value already exists',
          code: 'UNIQUE_CONSTRAINT',
          field: error.meta?.target as string,
        };
      case 'P2003':
        // Foreign key constraint violation
        return {
          message: 'Related record not found',
          code: 'FOREIGN_KEY_CONSTRAINT',
          field: error.meta?.field_name as string,
        };
      case 'P2025':
        // Record not found
        return {
          message: 'Record not found',
          code: 'NOT_FOUND',
        };
      case 'P2014':
        // Invalid relation
        return {
          message: 'Invalid relation',
          code: 'INVALID_RELATION',
        };
      default:
        return {
          message: error.message,
          code: error.code,
        };
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      message: 'Invalid data provided',
      code: 'VALIDATION_ERROR',
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
}

// Re-export prisma client for convenience
export { prisma };
