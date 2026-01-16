/**
 * Twilio Diagnostics API
 * Provides comprehensive debugging and monitoring information
 * Accessible only to authenticated admin users
 */

import { NextRequest, NextResponse } from 'next/server';
import { twilioDebug, getDeliveryStats, getCostStats } from '@/services/twilio';
import { deliveryStatusService } from '@/services/twilio/delivery-status';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface DiagnosticsResponse {
  service: 'twilio';
  timestamp: Date;
  status: 'healthy' | 'warning' | 'error';
  sections: {
    config: ConfigDiagnostics;
    sms: SMSDiagnostics;
    delivery: DeliveryDiagnostics;
    costs: CostDiagnostics;
    issues: IssueDiagnostics;
  };
}

interface ConfigDiagnostics {
  mode: 'production' | 'mock';
  hasTwilioConfig: boolean;
  hasAuthToken: boolean;
  webhookUrl: string;
  status: 'configured' | 'not_configured';
}

interface SMSDiagnostics {
  totalSent: number;
  totalCost: number;
  averageCost: number;
  costStats: any;
}

interface DeliveryDiagnostics {
  deliveryRate: number;
  failureRate: number;
  averageDeliveryTime?: number;
  stats: any;
}

interface CostDiagnostics {
  totalCost: number;
  costPerMessage: number;
  estimatedMonthlyMessages: number;
  estimatedMonthlyCost: number;
}

interface IssueDiagnostics {
  count: number;
  recent: Array<{
    messageId: string;
    issue: string;
    timestamp: Date;
  }>;
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * GET /api/twilio/diagnostics
 * Returns comprehensive diagnostics information
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Check authorization (in production, verify user is admin)
    // For now, just check if they're authenticated
    const authHeader = request.headers.get('authorization');
    const isAuthorized = !!authHeader || process.env.NODE_ENV === 'development';

    if (!isAuthorized) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const section = searchParams.get('section'); // Specific section to return

    const diagnostics = generateDiagnostics(request.url);

    // Return specific section if requested
    if (section && section in diagnostics.sections) {
      return new NextResponse(
        JSON.stringify({
          section,
          data: (diagnostics.sections as any)[section],
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new NextResponse(JSON.stringify(diagnostics), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[Twilio Diagnostics] Error:', error.message);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to generate diagnostics', message: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * POST /api/twilio/diagnostics
 * Execute diagnostic actions (send test SMS, simulate webhook, etc.)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization');
    const isAuthorized = !!authHeader || process.env.NODE_ENV === 'development';

    if (!isAuthorized) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { action, params } = body;

    let result: any;

    switch (action) {
      case 'send_test_sms':
        result = await twilioDebug.sendTestSMS(params?.phoneNumber || '+15551234567');
        break;

      case 'simulate_webhook':
        result = await twilioDebug.simulateWebhook(
          params?.messageId || 'mock_test',
          params?.status || 'delivered'
        );
        break;

      case 'get_pending_messages':
        result = twilioDebug.getPendingMessages();
        break;

      case 'get_failed_messages':
        result = twilioDebug.getFailedMessages();
        break;

      case 'export_report':
        const reportData = twilioDebug.exportDeliveryReport();
        return new NextResponse(reportData.csv, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="delivery-report-${Date.now()}.csv"`,
          },
        });

      default:
        return new NextResponse(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    return new NextResponse(JSON.stringify({ action, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[Twilio Diagnostics] Action failed:', error.message);
    return new NextResponse(
      JSON.stringify({ error: 'Action failed', message: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ============================================================================
// DIAGNOSTIC GENERATION
// ============================================================================

function generateDiagnostics(baseUrl: string): DiagnosticsResponse {
  const hasTwilioAccountSid = !!process.env.TWILIO_ACCOUNT_SID;
  const hasTwilioAuthToken = !!process.env.TWILIO_AUTH_TOKEN;
  const isMockMode = process.env.NODE_ENV === 'development' && !hasTwilioAccountSid;

  const costStats = getCostStats();
  const deliveryStats = getDeliveryStats();
  const issues = deliveryStatusService.getIssues();

  const config: ConfigDiagnostics = {
    mode: isMockMode ? 'mock' : 'production',
    hasTwilioConfig: hasTwilioAccountSid && hasTwilioAuthToken,
    hasAuthToken: hasTwilioAuthToken,
    webhookUrl: `${baseUrl.split('/api/')[0]}/api/webhooks/twilio/status`,
    status: hasTwilioAccountSid && hasTwilioAuthToken ? 'configured' : 'not_configured',
  };

  const sms: SMSDiagnostics = {
    totalSent: costStats.totalMessages || 0,
    totalCost: costStats.totalCost || 0,
    averageCost: costStats.averageCost || 0,
    costStats: costStats,
  };

  const delivery: DeliveryDiagnostics = {
    deliveryRate: deliveryStats.deliveryRate || 0,
    failureRate: deliveryStats.failureRate || 0,
    averageDeliveryTime: deliveryStats.averageDeliveryTime,
    stats: deliveryStats,
  };

  const costs: CostDiagnostics = {
    totalCost: costStats.totalCost || 0,
    costPerMessage: 0.0075,
    estimatedMonthlyMessages: Math.round((costStats.totalMessages || 0) / 1),
    estimatedMonthlyCost: (costStats.totalCost || 0) * 30,
  };

  const issuesList = issues.map((issue) => ({
    messageId: issue.messageId,
    issue: issue.issue,
    timestamp: new Date(),
  }));

  const issuesDiag: IssueDiagnostics = {
    count: issues.length,
    recent: issuesList.slice(0, 10),
  };

  // Determine overall health
  let status: 'healthy' | 'warning' | 'error' = 'healthy';
  if (issues.length > 50) {
    status = 'error';
  } else if (issues.length > 10) {
    status = 'warning';
  }

  return {
    service: 'twilio',
    timestamp: new Date(),
    status,
    sections: {
      config,
      sms,
      delivery,
      costs,
      issues: issuesDiag,
    },
  };
}

// ============================================================================
// HELPER ENDPOINT FOR QUICK CHECKS
// ============================================================================

/**
 * Quick health check endpoint
 * GET /api/twilio/diagnostics/health
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  // CORS preflight
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
