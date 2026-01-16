/**
 * Cron Jobs API Routes
 *
 * Scheduled maintenance tasks:
 * - FCM token cleanup (deactivate stale, delete old)
 * - Other scheduled maintenance jobs
 *
 * All cron endpoints are protected by a secret key in the Authorization header.
 */

import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { logAuditEvent } from '@medical-spa/security';

const cron = new Hono();

// ===================
// Middleware
// ===================

/**
 * Verify cron secret for all cron endpoints
 * Cron jobs must include: Authorization: Bearer CRON_SECRET
 */
cron.use('/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error('[CRON] CRON_SECRET environment variable is not set');
    return c.json({ error: 'Server configuration error' }, 500);
  }

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[CRON] Unauthorized cron request attempt');
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await next();
});

// ===================
// Helper Functions
// ===================

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'cron-job';
}

// ===================
// Token Cleanup Route
// ===================

/**
 * Clean up stale FCM push tokens
 * POST /api/cron/token-cleanup
 *
 * This endpoint performs two cleanup operations:
 * 1. Deactivate tokens not used in 30+ days (soft delete)
 * 2. Delete tokens not used in 90+ days (hard delete)
 *
 * The "last used" time is determined by the updatedAt field,
 * which is updated whenever the token is used to send a notification
 * or when the user re-registers the token.
 *
 * @returns {object} Cleanup results with counts of deactivated and deleted tokens
 */
cron.post('/token-cleanup', async (c) => {
  const startTime = Date.now();
  const ipAddress = getClientIP(c);

  console.log('[CRON] Starting FCM token cleanup job');

  try {
    const now = new Date();

    // Calculate cutoff dates
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    console.log(`[CRON] Cutoff dates - 30 days: ${thirtyDaysAgo.toISOString()}, 90 days: ${ninetyDaysAgo.toISOString()}`);

    // Step 1: Deactivate tokens not used in 30+ days
    // Only deactivate tokens that are currently active
    const deactivateResult = await prisma.pushToken.updateMany({
      where: {
        updatedAt: { lt: thirtyDaysAgo },
        isActive: true,
      },
      data: {
        isActive: false,
        updatedAt: now, // Update timestamp to track when deactivation occurred
      },
    });

    console.log(`[CRON] Deactivated ${deactivateResult.count} stale tokens (unused for 30+ days)`);

    // Step 2: Delete tokens not used in 90+ days
    // Delete both active and inactive tokens that are very old
    const deleteResult = await prisma.pushToken.deleteMany({
      where: {
        updatedAt: { lt: ninetyDaysAgo },
      },
    });

    console.log(`[CRON] Deleted ${deleteResult.count} old tokens (unused for 90+ days)`);

    // Calculate execution time
    const executionTimeMs = Date.now() - startTime;

    // Log audit event for this maintenance operation
    await logAuditEvent({
      userId: 'system',
      action: 'CRON_JOB',
      resourceType: 'push_token_cleanup',
      ipAddress,
      metadata: {
        jobName: 'token-cleanup',
        deactivated: deactivateResult.count,
        deleted: deleteResult.count,
        executionTimeMs,
        cutoffDates: {
          deactivate: thirtyDaysAgo.toISOString(),
          delete: ninetyDaysAgo.toISOString(),
        },
      },
    });

    const response = {
      success: true,
      timestamp: now.toISOString(),
      deactivated: deactivateResult.count,
      deleted: deleteResult.count,
      executionTimeMs,
    };

    console.log(`[CRON] Token cleanup completed successfully in ${executionTimeMs}ms`);

    return c.json(response, 200);
  } catch (error: any) {
    const executionTimeMs = Date.now() - startTime;
    console.error('[CRON] Token cleanup failed:', error);

    // Log the failed attempt
    try {
      await logAuditEvent({
        userId: 'system',
        action: 'CRON_JOB_FAILED',
        resourceType: 'push_token_cleanup',
        ipAddress,
        metadata: {
          jobName: 'token-cleanup',
          error: error.message || 'Unknown error',
          executionTimeMs,
        },
      });
    } catch (auditError) {
      console.error('[CRON] Failed to log audit event:', auditError);
    }

    return c.json(
      {
        success: false,
        error: 'Token cleanup failed',
        message: error.message || 'An unexpected error occurred',
        executionTimeMs,
      },
      500
    );
  }
});

/**
 * Health check for cron system
 * GET /api/cron/health
 *
 * Simple endpoint to verify cron authentication is working
 */
cron.get('/health', async (c) => {
  return c.json({
    status: 'ok',
    service: 'cron',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Get token cleanup statistics
 * GET /api/cron/token-stats
 *
 * Returns current token statistics useful for monitoring
 */
cron.get('/token-stats', async (c) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Get various counts in parallel
    const [
      totalTokens,
      activeTokens,
      inactiveTokens,
      staleTokens,
      veryOldTokens,
      tokensByPlatform,
    ] = await Promise.all([
      // Total tokens
      prisma.pushToken.count(),

      // Active tokens
      prisma.pushToken.count({
        where: { isActive: true },
      }),

      // Inactive tokens
      prisma.pushToken.count({
        where: { isActive: false },
      }),

      // Stale tokens (30+ days old, still active - will be deactivated next run)
      prisma.pushToken.count({
        where: {
          updatedAt: { lt: thirtyDaysAgo },
          isActive: true,
        },
      }),

      // Very old tokens (90+ days - will be deleted next run)
      prisma.pushToken.count({
        where: {
          updatedAt: { lt: ninetyDaysAgo },
        },
      }),

      // Tokens by platform
      prisma.pushToken.groupBy({
        by: ['platform'],
        _count: true,
        where: { isActive: true },
      }),
    ]);

    return c.json({
      timestamp: now.toISOString(),
      stats: {
        total: totalTokens,
        active: activeTokens,
        inactive: inactiveTokens,
        staleActive: staleTokens,
        pendingDeletion: veryOldTokens,
      },
      byPlatform: tokensByPlatform.map((p) => ({
        platform: p.platform,
        count: p._count,
      })),
      nextCleanup: {
        willDeactivate: staleTokens,
        willDelete: veryOldTokens,
      },
    });
  } catch (error: any) {
    console.error('[CRON] Failed to get token stats:', error);
    return c.json(
      {
        error: 'Failed to get token statistics',
        message: error.message || 'An unexpected error occurred',
      },
      500
    );
  }
});

export default cron;
