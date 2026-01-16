/**
 * Medical Spa Platform - Backend API Server
 *
 * Entry point for Cloud Run deployment
 * Uses Hono framework for lightweight, fast API handling
 */

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { prettyJSON } from 'hono/pretty-json';
import { timing } from 'hono/timing';

import { config } from './config';
import { api, health } from './routes';
import { errorHandler, notFoundHandler } from './middleware/error';
import { auditMiddleware } from './middleware/audit';
import { prisma } from './lib/prisma';

// Create main app
const app = new Hono();

// ===================
// Global Middleware
// ===================

// Request logging
if (config.nodeEnv === 'development') {
  app.use('*', logger());
}

// Pretty JSON in development
if (config.nodeEnv === 'development') {
  app.use('*', prettyJSON());
}

// Security headers (CSP disabled for API-only service)
app.use('*', secureHeaders());

// CORS
app.use('*', cors({
  origin: config.corsOrigins,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposeHeaders: ['X-Request-Id'],
  maxAge: 86400, // 24 hours
}));

// Response timing
app.use('*', timing());

// Audit logging (after auth middleware in routes)
app.use('/api/*', auditMiddleware);

// ===================
// Routes
// ===================

// Health checks (no /api prefix, no auth)
app.route('/health', health);
app.get('/', (c) => c.json({
  name: 'Medical Spa Platform API',
  version: '1.0.0',
  status: 'running',
}));

// API routes
app.route('/api', api);

// ===================
// Error Handling
// ===================

// 404 handler
app.notFound(notFoundHandler);

// Global error handler
app.onError(errorHandler);

// ===================
// Server Startup
// ===================

const port = config.port;

console.log(`
╔══════════════════════════════════════════════════════════════╗
║           Medical Spa Platform - API Server                  ║
╠══════════════════════════════════════════════════════════════╣
║  Environment: ${config.nodeEnv.padEnd(47)}║
║  Port:        ${port.toString().padEnd(47)}║
║  Database:    ${(config.databaseUrl ? 'Configured' : 'Not configured').padEnd(47)}║
║  Firebase:    ${config.firebaseProjectId.padEnd(47)}║
╚══════════════════════════════════════════════════════════════╝
`);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`🚀 Server running at http://localhost:${info.port}`);
  console.log(`📋 Health check: http://localhost:${info.port}/health`);
  console.log(`📚 API Base: http://localhost:${info.port}/api`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
