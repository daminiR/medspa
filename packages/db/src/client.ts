// Database Client - Drizzle ORM with PostgreSQL
// Supports both direct connections and serverless (Neon)

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Check for required environment variable
if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set. Database client will not be initialized.');
}

// Create a connection pool
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10, // Maximum number of connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  : null;

// Create the Drizzle client
export const db = pool
  ? drizzle(pool, { schema, logger: process.env.NODE_ENV === 'development' })
  : null;

// Export the pool for manual queries if needed
export { pool };

// Export schema for use in other packages
export { schema };

// Health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  if (!pool) return false;
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  if (pool) {
    await pool.end();
  }
}
