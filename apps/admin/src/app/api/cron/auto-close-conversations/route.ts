import { NextRequest, NextResponse } from 'next/server';
import { autoCloseConversationsService, AutoCloseConfig } from '@/services/conversations/auto-close';

/**
 * Auto-Close Conversations Cron Endpoint
 * Runs periodically to close inactive conversations
 * Called by: Vercel Cron, EasyCron, or similar service
 *
 * Usage:
 *   - GET /api/cron/auto-close-conversations
 *   - Authorization: Bearer <CRON_SECRET>
 *   - Query params:
 *     - dryRun: boolean (preview changes without executing)
 *     - config: JSON string (override configuration)
 *
 * Example:
 *   curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
 *     "https://yourapp.com/api/cron/auto-close-conversations?dryRun=true"
 */

interface DryRunResult {
  conversationId: string;
  patientName: string;
  daysInactive: number;
  wouldClose: boolean;
  reason?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.log('[AUTO_CLOSE_CRON] Unauthorized request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const dryRun = searchParams.get('dryRun') === 'true';
    const configOverride = searchParams.get('config');

    const now = new Date();
    console.log('[AUTO_CLOSE_CRON_START]', {
      timestamp: now.toISOString(),
      dryRun,
      hasConfigOverride: !!configOverride,
    });

    // Apply config override if provided
    if (configOverride) {
      try {
        const overrideConfig = JSON.parse(configOverride) as Partial<AutoCloseConfig>;
        autoCloseConversationsService.updateConfig(overrideConfig);
        console.log('[AUTO_CLOSE_CRON] Applied config override');
      } catch (error) {
        console.error('[AUTO_CLOSE_CRON] Invalid config override:', error);
        return NextResponse.json(
          { error: 'Invalid config override format' },
          { status: 400 }
        );
      }
    }

    // Execute auto-close process
    const result = await autoCloseConversationsService.processAutoClosures();

    // Get statistics
    const stats = autoCloseConversationsService.getStatistics();

    const response = {
      success: result.success,
      timestamp: now.toISOString(),
      dryRun,
      results: {
        closures: result.closuresCount,
        notifications: result.notificationsCount,
        conversationsChecked: result.summary.checked || 0,
        skipped: result.summary.skipped || 0,
        pendingConfirmationSkipped: result.summary.pendingConfirmationSkipped || 0,
      },
      statistics: stats,
      errors: result.errors,
      summary: result.summary,
    };

    console.log('[AUTO_CLOSE_CRON_COMPLETE]', response);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[AUTO_CLOSE_CRON_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for manual/testing triggers
 * Allows testing the auto-close logic without waiting for scheduled cron
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, conversationId, config, dryRun } = body;

    console.log('[AUTO_CLOSE_MANUAL]', { action, conversationId, dryRun });

    // Handle different manual actions
    if (action === 'process') {
      // Run full auto-close process
      if (config) {
        autoCloseConversationsService.updateConfig(config);
      }

      const result = await autoCloseConversationsService.processAutoClosures();
      return NextResponse.json({
        success: result.success,
        timestamp: new Date().toISOString(),
        results: {
          closures: result.closuresCount,
          notifications: result.notificationsCount,
        },
        errors: result.errors,
      });
    } else if (action === 'reopen' && conversationId) {
      // Reopen a conversation
      await autoCloseConversationsService.reopenConversation(conversationId);
      return NextResponse.json({
        success: true,
        message: `Conversation ${conversationId} reopened`,
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'getHistory') {
      // Get closure history
      const limit = body.limit || 100;
      const history = autoCloseConversationsService.getClosureHistory(limit);
      return NextResponse.json({
        success: true,
        history,
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'getStatistics') {
      // Get statistics
      const stats = autoCloseConversationsService.getStatistics();
      return NextResponse.json({
        success: true,
        statistics: stats,
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'updateConfig') {
      // Update configuration
      if (!config) {
        return NextResponse.json(
          { error: 'config is required for updateConfig action' },
          { status: 400 }
        );
      }
      autoCloseConversationsService.updateConfig(config);
      return NextResponse.json({
        success: true,
        message: 'Configuration updated',
        config: autoCloseConversationsService.getConfig(),
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          error: 'Invalid action',
          validActions: ['process', 'reopen', 'getHistory', 'getStatistics', 'updateConfig'],
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('[AUTO_CLOSE_MANUAL_ERROR]', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
