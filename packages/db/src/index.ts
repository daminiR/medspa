// Main export file for @medical-spa/db package

// Export database client and utilities
export { db, pool, checkDatabaseConnection, closeDatabaseConnection } from './client';

// Export all schema definitions
export * from './schema';

// Re-export drizzle-orm utilities that are commonly needed
export { eq, ne, gt, gte, lt, lte, and, or, not, inArray, notInArray, isNull, isNotNull, sql, asc, desc } from 'drizzle-orm';
