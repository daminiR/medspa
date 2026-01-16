/**
 * Twilio Integration Test Endpoint
 * Provides quick testing and validation of the SMS service
 *
 * Usage:
 * GET  /api/twilio/test - Get test info
 * POST /api/twilio/test - Run tests
 */

import { NextRequest, NextResponse } from 'next/server';
import { smsSender, deliveryStatusService, twilioDebug } from '@/services/twilio';
import type { SMSSendResult } from '@/services/twilio';

// ============================================================================
// TEST SUITE
// ============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
  details?: any;
}

class TwilioTestSuite {
  private results: TestResult[] = [];

  async run(): Promise<TestResult[]> {
    this.results = [];

    await this.testServiceInitialization();
    await this.testSMSSending();
    await this.testDeliveryTracking();
    await this.testRateLimiting();
    await this.testErrorHandling();
    await this.testMockMode();

    return this.results;
  }

  private async testServiceInitialization(): Promise<void> {
    const start = Date.now();
    try {
      const sender = smsSender;
      const delivery = deliveryStatusService;

      const passed = !!(sender && delivery);
      this.addResult({
        name: 'Service Initialization',
        passed,
        message: passed ? 'SMS Sender and Delivery Status services initialized' : 'Services not initialized',
        duration: Date.now() - start,
      });
    } catch (error: any) {
      this.addResult({
        name: 'Service Initialization',
        passed: false,
        message: error.message,
        duration: Date.now() - start,
      });
    }
  }

  private async testSMSSending(): Promise<void> {
    const start = Date.now();
    try {
      // Test with mock phone number
      const result = await smsSender.send({
        to: '+15551234567',
        body: 'Test message from Twilio integration suite',
        priority: 'normal' as const,
      });

      const passed = result.success;
      this.addResult({
        name: 'SMS Sending',
        passed,
        message: passed
          ? `Message sent successfully (ID: ${result.messageId})`
          : `Send failed: ${result.error}`,
        duration: Date.now() - start,
        details: {
          messageId: result.messageId,
          status: result.status,
          cost: result.cost,
          provider: result.provider,
        },
      });
    } catch (error: any) {
      this.addResult({
        name: 'SMS Sending',
        passed: false,
        message: `Send test failed: ${error.message}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testDeliveryTracking(): Promise<void> {
    const start = Date.now();
    try {
      // Create a test message and track it
      const messageId = `test_${Date.now()}`;
      const status = deliveryStatusService.recordSend(
        messageId,
        '+15551234567',
        '+15559876543',
        { test: true }
      );

      // Simulate webhook callback
      await deliveryStatusService.handleWebhook({
        MessageSid: messageId,
        MessageStatus: 'delivered',
        From: '+15559876543',
        To: '+15551234567',
      });

      // Check status was updated
      const finalStatus = deliveryStatusService.getStatus(messageId);
      const passed = finalStatus?.status === 'delivered';

      this.addResult({
        name: 'Delivery Tracking',
        passed,
        message: passed
          ? `Delivery status tracked correctly: ${finalStatus?.status}`
          : 'Delivery status not updated',
        duration: Date.now() - start,
        details: {
          messageId,
          initialStatus: status.status,
          finalStatus: finalStatus?.status,
        },
      });
    } catch (error: any) {
      this.addResult({
        name: 'Delivery Tracking',
        passed: false,
        message: `Delivery tracking test failed: ${error.message}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testRateLimiting(): Promise<void> {
    const start = Date.now();
    try {
      const testPhone = '+15551234567';

      // Send multiple messages rapidly
      const promises: Promise<SMSSendResult>[] = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          smsSender.send({
            to: testPhone,
            body: `Test message ${i + 1}`,
            priority: 'normal' as const,
          })
        );
      }

      const results = await Promise.all(promises);
      const allSucceeded = results.every((r) => r.success);

      this.addResult({
        name: 'Rate Limiting',
        passed: allSucceeded,
        message: allSucceeded
          ? `Sent 5 messages successfully (no rate limit hit)`
          : `${results.filter((r) => !r.success).length} messages rate limited`,
        duration: Date.now() - start,
        details: {
          total: results.length,
          successful: results.filter((r) => r.success).length,
          rateLimited: results.filter((r) => r.errorCode === 'RATE_LIMIT_EXCEEDED').length,
        },
      });
    } catch (error: any) {
      this.addResult({
        name: 'Rate Limiting',
        passed: false,
        message: `Rate limit test failed: ${error.message}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testErrorHandling(): Promise<void> {
    const start = Date.now();
    try {
      // Test with invalid phone number
      const result = await smsSender.send({
        to: 'invalid-phone',
        body: 'This should fail',
        priority: 'normal' as const,
      });

      const passed = !result.success && result.errorCode === 'SEND_FAILED';

      this.addResult({
        name: 'Error Handling',
        passed,
        message: passed
          ? 'Invalid phone number properly rejected'
          : 'Invalid phone number not handled correctly',
        duration: Date.now() - start,
        details: {
          error: result.error,
          errorCode: result.errorCode,
        },
      });
    } catch (error: any) {
      const passed = error.message.includes('phone number');
      this.addResult({
        name: 'Error Handling',
        passed,
        message: passed
          ? 'Invalid input properly rejected with validation error'
          : `Unexpected error: ${error.message}`,
        duration: Date.now() - start,
      });
    }
  }

  private async testMockMode(): Promise<void> {
    const start = Date.now();
    try {
      const stats = twilioDebug.getDiagnostics();
      const hasMockStats = !!(stats.smsStats && stats.deliveryStats);

      this.addResult({
        name: 'Mock Mode & Statistics',
        passed: hasMockStats,
        message: hasMockStats
          ? 'Mock mode and statistics tracking operational'
          : 'Statistics not available',
        duration: Date.now() - start,
        details: {
          mode: stats.timestamp ? 'ok' : 'error',
          hasDeliveryStats: !!stats.deliveryStats,
          hasCostStats: !!stats.smsStats,
        },
      });
    } catch (error: any) {
      this.addResult({
        name: 'Mock Mode & Statistics',
        passed: false,
        message: `Mock mode test failed: ${error.message}`,
        duration: Date.now() - start,
      });
    }
  }

  private addResult(result: TestResult): void {
    this.results.push(result);
    const icon = result.passed ? '✓' : '✗';
    console.log(`[Twilio Test] ${icon} ${result.name} (${result.duration}ms): ${result.message}`);
  }
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const suite = new TwilioTestSuite();
    const results = await suite.run();

    const passed = results.filter((r) => r.passed).length;
    const total = results.length;
    const summary = {
      totalTests: total,
      passed,
      failed: total - passed,
      passRate: Math.round((passed / total) * 100),
    };

    return new NextResponse(
      JSON.stringify(
        {
          status: summary.failed === 0 ? 'success' : 'failure',
          summary,
          results,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { action, params } = body;

    let result: any;

    switch (action) {
      case 'run_tests':
        const suite = new TwilioTestSuite();
        const testResults = await suite.run();
        result = {
          tests: testResults,
          summary: {
            total: testResults.length,
            passed: testResults.filter((r) => r.passed).length,
            failed: testResults.filter((r) => !r.passed).length,
          },
        };
        break;

      case 'send_test_sms':
        result = await smsSender.send({
          to: params?.phoneNumber || '+15551234567',
          body: params?.message || 'Test SMS from Twilio integration',
          priority: 'normal' as const,
        });
        break;

      case 'get_diagnostics':
        result = twilioDebug.getDiagnostics();
        break;

      default:
        return new NextResponse(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
    }

    return new NextResponse(JSON.stringify({ action, result, timestamp: new Date().toISOString() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
