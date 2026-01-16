/**
 * Test Send Messaging API Route
 * Allows staff to test templates and verify messaging without affecting actual patients
 *
 * Endpoints:
 * - POST /api/messaging/test-send - Send a test message
 * - GET /api/messaging/test-send?action=history - View test send history
 * - GET /api/messaging/test-send?action=stats - View test send statistics
 * - DELETE /api/messaging/test-send - Clear test logs (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { testMessageSender, TestMessageRequest } from '@/services/messaging/test-sender';
import { z } from 'zod';

// Request validation schema
const TestSendRequestSchema = z.object({
  recipient: z.string().min(1, 'Recipient is required'),
  recipientType: z.enum(['email', 'sms']),
  templateId: z.string().optional(),
  customMessage: z.string().min(1).max(1600).optional(),
  variables: z.record(z.string(), z.any()).optional(),
  testedBy: z.string().min(1, 'Tester name/ID is required'),
});

/**
 * POST /api/messaging/test-send
 * Send a test message to verify templates and messaging
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request data
    const validated = TestSendRequestSchema.parse(body);

    // Ensure either templateId or customMessage is provided
    if (!validated.templateId && !validated.customMessage) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either templateId or customMessage must be provided',
        },
        { status: 400 }
      );
    }

    // Send test message
    const result = await testMessageSender.sendTestMessage(validated as TestMessageRequest);

    // Return appropriate status code based on result
    const statusCode = result.success ? 200 : 400;

    return NextResponse.json(
      {
        success: result.success,
        messageId: result.messageId,
        status: result.status,
        recipient: result.recipient,
        recipientType: result.recipientType,
        templateUsed: result.templateUsed,
        messageContent: result.messageContent,
        sentAt: result.sentAt,
        error: result.error,
      },
      { status: statusCode }
    );
  } catch (error: any) {
    console.error('[TEST_SEND_API_ERROR]', {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send test message',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/messaging/test-send
 * Retrieve test send history or statistics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action') || 'history';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const testedBy = searchParams.get('testedBy') || undefined;
    const recipientType = searchParams.get('recipientType') as 'sms' | 'email' | undefined;

    switch (action) {
      case 'history':
        const history = testMessageSender.getTestSendHistory({
          limit,
          testedBy,
          recipientType,
        });

        return NextResponse.json({
          success: true,
          action: 'history',
          count: history.length,
          limit,
          filters: {
            testedBy: testedBy || 'all',
            recipientType: recipientType || 'all',
          },
          logs: history.map((log) => ({
            id: log.id,
            timestamp: log.timestamp,
            testedBy: log.testedBy,
            recipient: log.recipient,
            recipientType: log.recipientType,
            templateId: log.templateId,
            status: log.status,
            deliveryStatus: log.deliveryStatus,
            messageId: log.messageId,
            messagePreview: log.messageContent.substring(0, 100),
            error: log.errorMessage,
          })),
        });

      case 'stats':
        const stats = testMessageSender.getTestSendStats();

        return NextResponse.json({
          success: true,
          action: 'stats',
          ...stats,
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action. Use "history" or "stats"',
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[TEST_SEND_GET_ERROR]', {
      timestamp: new Date().toISOString(),
      error: error.message,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to retrieve test send data',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/messaging/test-send
 * Clear test send logs (admin only)
 * NOTE: In production, this should require admin authentication
 */
export async function DELETE(request: NextRequest) {
  try {
    // TODO: Add admin authentication check in production
    // const session = await getSession();
    // if (!session?.user?.isAdmin) {
    //   return NextResponse.json(
    //     { success: false, error: 'Admin access required' },
    //     { status: 403 }
    //   );
    // }

    const cleared = testMessageSender.clearTestSendLogs();

    return NextResponse.json({
      success: true,
      message: `Cleared ${cleared} test send logs`,
      clearedCount: cleared,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('[TEST_SEND_DELETE_ERROR]', {
      timestamp: new Date().toISOString(),
      error: error.message,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to clear test send logs',
      },
      { status: 500 }
    );
  }
}
