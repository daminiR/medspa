/**
 * Health Check Routes
 *
 * Used by Cloud Run for container health monitoring
 */

import { Hono } from 'hono';
import { prisma } from '../lib/prisma';

const health = new Hono();

/**
 * Basic health check
 * Returns 200 if server is running
 */
health.get('/', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Readiness check
 * Returns 200 if server is ready to accept traffic
 * Checks database connectivity
 */
health.get('/ready', async (c) => {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    return c.json({
      status: 'ok',
      database: 'connected',
      latency: `${latency}ms`
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return c.json({
      status: 'error',
      database: 'disconnected'
    }, 503);
  }
});

/**
 * Liveness check
 * Returns 200 if server process is alive
 */
health.get('/live', (c) => {
  return c.json({
    status: 'alive',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

export default health;
