/**
 * GET /api/analytics/messaging - Get messaging analytics metrics
 *
 * Query Parameters:
 * - fromDate: ISO date string for start of range (optional, default 30 days ago)
 * - toDate: ISO date string for end of range (optional, default today)
 * - channel: Filter by specific channel (sms|email|web_chat|phone, optional)
 * - includeStaff: Include staff performance metrics (default: true)
 * - includeTrends: Include trend data (default: true)
 *
 * Response:
 * - success: boolean
 * - data: MessageAnalyticsMetrics object
 * - generatedAt: ISO timestamp when analytics were calculated
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateMessagingAnalytics, MessageAnalyticsMetrics } from '@/services/analytics/messaging-analytics';

// GET - Get comprehensive messaging analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const fromDateParam = searchParams.get('fromDate');
    const toDateParam = searchParams.get('toDate');
    const channel = searchParams.get('channel');
    const includeStaff = searchParams.get('includeStaff') !== 'false'; // default true
    const includeTrends = searchParams.get('includeTrends') !== 'false'; // default true

    // Validate date parameters if provided
    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (fromDateParam) {
      const parsed = new Date(fromDateParam);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid fromDate parameter. Use ISO date string.' },
          { status: 400 }
        );
      }
      fromDate = parsed;
    }

    if (toDateParam) {
      const parsed = new Date(toDateParam);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid toDate parameter. Use ISO date string.' },
          { status: 400 }
        );
      }
      toDate = parsed;
    }

    // Validate date range
    if (fromDate && toDate && fromDate > toDate) {
      return NextResponse.json(
        { success: false, error: 'fromDate must be before toDate' },
        { status: 400 }
      );
    }

    // Calculate analytics
    const analytics = calculateMessagingAnalytics({
      from: fromDate,
      to: toDate,
    });

    // Filter by channel if specified
    let filteredAnalytics: MessageAnalyticsMetrics = analytics;
    if (channel && ['sms', 'email', 'web_chat', 'phone'].includes(channel)) {
      // Filter delivery and other metrics to specific channel
      type MessageChannel = 'sms' | 'email' | 'web_chat' | 'phone';
      const typedChannel = channel as MessageChannel;
      const filteredDelivery = { [channel]: analytics.deliveryByChannel[typedChannel] };
      const filteredChannelBreakdown = analytics.channelBreakdown.filter(c => c.channel === channel);

      filteredAnalytics = {
        ...analytics,
        deliveryByChannel: filteredDelivery as any,
        channelBreakdown: filteredChannelBreakdown,
      };
    }

    // Remove staff metrics if not requested
    if (!includeStaff) {
      filteredAnalytics = {
        ...filteredAnalytics,
        staffMetrics: [],
      };
    }

    // Remove trends if not requested
    if (!includeTrends) {
      filteredAnalytics = {
        ...filteredAnalytics,
        trends: {
          messageVolumeChange: 0,
          deliveryRateChange: 0,
          responseRateChange: 0,
        },
      };
    }

    // Build response
    const response = {
      success: true,
      data: filteredAnalytics,
      generatedAt: new Date().toISOString(),
      queryParameters: {
        dateRange: {
          from: filteredAnalytics.summary.dateRange.from.toISOString(),
          to: filteredAnalytics.summary.dateRange.to.toISOString(),
        },
        channel: channel || 'all',
        includeStaff,
        includeTrends,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Messaging analytics GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch messaging analytics',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/messaging - Generate custom analytics report
 *
 * Request Body:
 * {
 *   dateRange: { from: Date, to: Date },
 *   channels?: string[],
 *   includeBreakdowns?: boolean,
 *   reportFormat?: 'json' | 'csv' | 'pdf'
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      dateRange,
      channels,
      includeBreakdowns = true,
      reportFormat = 'json',
    } = body;

    // Validate request body
    if (!dateRange || !dateRange.from || !dateRange.to) {
      return NextResponse.json(
        { success: false, error: 'dateRange with from and to dates is required' },
        { status: 400 }
      );
    }

    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid dates in dateRange' },
        { status: 400 }
      );
    }

    if (fromDate > toDate) {
      return NextResponse.json(
        { success: false, error: 'fromDate must be before toDate' },
        { status: 400 }
      );
    }

    // Calculate analytics
    const analytics = calculateMessagingAnalytics({
      from: fromDate,
      to: toDate,
    });

    // Filter by channels if specified
    let filteredAnalytics: MessageAnalyticsMetrics = analytics;
    if (channels && Array.isArray(channels) && channels.length > 0) {
      const validChannels = channels.filter(c => ['sms', 'email', 'web_chat', 'phone'].includes(c));
      if (validChannels.length > 0) {
        type MessageChannel = 'sms' | 'email' | 'web_chat' | 'phone';
        const filteredDelivery: Record<string, any> = {};
        validChannels.forEach(ch => {
          filteredDelivery[ch] = analytics.deliveryByChannel[ch as MessageChannel];
        });

        filteredAnalytics = {
          ...analytics,
          deliveryByChannel: filteredDelivery as any,
          channelBreakdown: analytics.channelBreakdown.filter(c => validChannels.includes(c.channel)),
        };
      }
    }

    // Prepare response based on format
    if (reportFormat === 'csv') {
      return generateCSVReport(filteredAnalytics);
    } else if (reportFormat === 'json') {
      return NextResponse.json({
        success: true,
        data: filteredAnalytics,
        reportFormat: 'json',
        generatedAt: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported reportFormat. Use json or csv.' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Messaging analytics POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate analytics report',
      },
      { status: 500 }
    );
  }
}

/**
 * Generate CSV report from analytics data
 */
function generateCSVReport(analytics: MessageAnalyticsMetrics) {
  try {
    let csv = 'MESSAGING ANALYTICS REPORT\n';
    csv += `Generated: ${new Date().toISOString()}\n`;
    csv += `Date Range: ${analytics.summary.dateRange.from.toISOString()} to ${analytics.summary.dateRange.to.toISOString()}\n\n`;

    // Summary section
    csv += 'SUMMARY\n';
    csv += `Total Messages Sent,${analytics.summary.totalMessagesSent}\n`;
    csv += `Total Messages Received,${analytics.summary.totalMessagesReceived}\n`;
    csv += `Total Conversations,${analytics.summary.totalConversations}\n`;
    csv += `Active Conversations,${analytics.summary.activeConversations}\n\n`;

    // Overall delivery
    csv += 'OVERALL DELIVERY\n';
    csv += `Sent,${analytics.overallDelivery.sent}\n`;
    csv += `Delivered,${analytics.overallDelivery.delivered}\n`;
    csv += `Delivery Rate %,${analytics.overallDelivery.deliveryRate}\n`;
    csv += `Failed,${analytics.overallDelivery.failed}\n`;
    csv += `Failure Rate %,${analytics.overallDelivery.failureRate}\n\n`;

    // By channel
    csv += 'BY CHANNEL\n';
    csv += 'Channel,Sent,Delivered,Delivery Rate %,Failed,Failure Rate %\n';
    Object.entries(analytics.deliveryByChannel).forEach(([channel, data]) => {
      csv += `${channel},${data.sent},${data.delivered},${data.deliveryRate},${data.failed},${data.failureRate}\n`;
    });
    csv += '\n';

    // Response metrics
    csv += 'RESPONSE METRICS\n';
    csv += `Total Received,${analytics.responseMetrics.totalReceived}\n`;
    csv += `Responded,${analytics.responseMetrics.responded}\n`;
    csv += `Response Rate %,${analytics.responseMetrics.responseRate}\n`;
    csv += `Avg Response Time,${analytics.responseMetrics.avgResponseTimeFormatted}\n`;
    csv += `Avg Response Time Minutes,${analytics.responseMetrics.avgResponseTimeMinutes}\n\n`;

    // Confirmation metrics
    csv += 'CONFIRMATION METRICS\n';
    csv += `Confirmation Requests Sent,${analytics.confirmationMetrics.confirmationRequestsSent}\n`;
    csv += `Confirmations Received,${analytics.confirmationMetrics.confirmationsReceived}\n`;
    csv += `Confirmation Rate %,${analytics.confirmationMetrics.confirmationRate}\n`;
    csv += `Unconfirmed Count,${analytics.confirmationMetrics.unconfirmedCount}\n\n`;

    // Cost analysis
    csv += 'COST ANALYSIS\n';
    csv += `Total Estimated Cost,$${analytics.costAnalysis.estimatedTotalCost}\n`;
    csv += `Messages Per Dollar,${analytics.costAnalysis.messagesPerDollar}\n\n`;

    // By channel costs
    csv += 'COST BY CHANNEL\n';
    csv += 'Channel,Estimated Cost\n';
    Object.entries(analytics.costAnalysis.estimatedCostByChannel).forEach(([channel, cost]) => {
      csv += `${channel},$${(cost as number).toFixed(2)}\n`;
    });
    csv += '\n';

    // Staff metrics
    if (analytics.staffMetrics.length > 0) {
      csv += 'STAFF PERFORMANCE\n';
      csv += 'Staff Name,Messages Sent,Avg Response Time (min),Conversations Handled,Delivery Rate %,Response Rate %\n';
      analytics.staffMetrics.forEach(staff => {
        csv += `${staff.staffName},${staff.messagesSent},${staff.avgResponseTime},${staff.conversationsHandled},${staff.deliveryRate},${staff.responseRate}\n`;
      });
      csv += '\n';
    }

    // Daily stats
    if (analytics.dailyStats.length > 0) {
      csv += 'DAILY STATISTICS\n';
      csv += 'Date,Sent,Delivered,Delivery Rate %,Received,Responded,Avg Response Time (min),Est Cost\n';
      analytics.dailyStats.forEach(day => {
        csv += `${day.date},${day.sent},${day.delivered},${day.deliveryRate},${day.received},${day.responded},${day.avgResponseTimeMinutes},$${day.estimatedCost}\n`;
      });
      csv += '\n';
    }

    // Return CSV as file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="messaging-analytics-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('CSV generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate CSV report' },
      { status: 500 }
    );
  }
}
