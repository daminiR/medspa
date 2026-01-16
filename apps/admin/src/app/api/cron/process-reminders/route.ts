/**
 * Cron Endpoint: Process Scheduled Reminders
 * Called by external cron scheduler (e.g., Vercel Cron, EasyCron, AWS CloudWatch)
 *
 * Usage:
 * GET /api/cron/process-reminders?secret=YOUR_CRON_SECRET
 *
 * Authentication:
 * Must include Authorization header with Bearer token matching CRON_SECRET
 * OR query parameter 'secret' matching CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { messageScheduler } from '@/services/scheduler/message-scheduler';
import { reminderProcessor, AppointmentForReminder } from '@/services/scheduler/reminder-processor';
import { addDays, addHours } from 'date-fns';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Verify cron request is authenticated
 */
function verifyAuthorization(request: NextRequest): boolean {
  // Check Authorization header (Bearer token)
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    if (token === process.env.CRON_SECRET) {
      return true;
    }
  }

  // Check secret query parameter
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');
  if (secret === process.env.CRON_SECRET) {
    return true;
  }

  return false;
}

/**
 * Get mock appointments for demonstration
 * In production, would query database for upcoming appointments
 */
function getMockAppointments(): AppointmentForReminder[] {
  const now = new Date();

  return [
    {
      id: 'apt-7d',
      patientId: 'p1',
      patientName: 'Sarah Johnson',
      patientPhone: '+15551234567',
      appointmentDate: addDays(now, 7),
      appointmentTime: '2:00 PM',
      service: 'Botox Treatment',
      provider: 'Dr. Smith',
      timezone: 'America/New_York',
      smsOptIn: true,
      remindersSent: {},
    },
    {
      id: 'apt-3d',
      patientId: 'p2',
      patientName: 'Michael Chen',
      patientPhone: '+15552345678',
      appointmentDate: addDays(now, 3),
      appointmentTime: '3:30 PM',
      service: 'Dermal Filler',
      provider: 'Dr. Johnson',
      timezone: 'America/Chicago',
      smsOptIn: true,
      remindersSent: {},
    },
    {
      id: 'apt-1d',
      patientId: 'p3',
      patientName: 'Emily Rodriguez',
      patientPhone: '+15553456789',
      appointmentDate: addDays(now, 1),
      appointmentTime: '10:00 AM',
      service: 'Chemical Peel',
      provider: 'Sarah RN',
      timezone: 'America/Los_Angeles',
      smsOptIn: true,
      remindersSent: {},
    },
    {
      id: 'apt-2hr',
      patientId: 'p4',
      patientName: 'James Wilson',
      patientPhone: '+15554567890',
      appointmentDate: addHours(now, 2),
      appointmentTime: '4:00 PM',
      service: 'Microneedling',
      provider: 'Dr. Lee',
      timezone: 'America/Denver',
      smsOptIn: true,
      remindersSent: {},
    },
    {
      id: 'apt-opted-out',
      patientId: 'p5',
      patientName: 'Jessica Brown',
      patientPhone: '+15555678901',
      appointmentDate: addDays(now, 2),
      appointmentTime: '1:00 PM',
      service: 'Laser Treatment',
      provider: 'Dr. Martinez',
      timezone: 'America/New_York',
      smsOptIn: false, // Opted out - should be skipped
      remindersSent: {},
    },
  ];
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  const startTime = new Date();

  try {
    console.log('[ProcessReminders] Cron job started', {
      timestamp: startTime.toISOString(),
      url: request.url,
    });

    // Verify authorization
    if (!verifyAuthorization(request)) {
      console.warn('[ProcessReminders] Unauthorized request', {
        authorization: request.headers.get('authorization') ? 'present' : 'missing',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Step 1: Process due scheduled messages
    console.log('[ProcessReminders] Step 1: Processing due scheduled messages');
    const schedulerResult = await messageScheduler.processDueMessages();

    // Step 2: Process appointment reminders
    console.log('[ProcessReminders] Step 2: Processing appointment reminders');
    const appointments = getMockAppointments();
    const reminderResult = await reminderProcessor.processAllReminders(appointments);

    // Step 3: Get current statistics
    console.log('[ProcessReminders] Step 3: Gathering statistics');
    const schedulerStats = messageScheduler.getStats();

    // Step 4: Cleanup old messages (optional, run less frequently)
    const shouldCleanup = Math.random() < 0.1; // 10% chance to run cleanup
    let cleanupCount = 0;
    if (shouldCleanup) {
      console.log('[ProcessReminders] Step 4: Cleaning up old messages');
      cleanupCount = await messageScheduler.cleanupOldMessages(30);
    }

    // Calculate duration
    const duration = new Date().getTime() - startTime.getTime();

    // Prepare response
    const response = {
      success: true,
      timestamp: startTime.toISOString(),
      duration: `${duration}ms`,
      executedSteps: [
        'Process due scheduled messages',
        'Process appointment reminders',
        'Gather statistics',
        ...(shouldCleanup ? ['Cleanup old messages'] : []),
      ],
      results: {
        scheduledMessages: schedulerResult,
        appointmentReminders: reminderResult,
        statistics: {
          scheduler: schedulerStats,
          cleanup: shouldCleanup ? cleanupCount : 'skipped',
        },
      },
    };

    console.log('[ProcessReminders] Cron job completed successfully', {
      duration,
      messagesSent: schedulerResult.sent,
      remindersSent: reminderResult.remindersSent,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    const duration = new Date().getTime() - startTime.getTime();

    console.error('[ProcessReminders] Cron job failed', {
      error: error.message,
      stack: error.stack,
      duration,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message,
        timestamp: startTime.toISOString(),
        duration: `${duration}ms`,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// MANUAL TRIGGER ENDPOINT (POST)
// ============================================================================

/**
 * POST /api/cron/process-reminders
 * Manual trigger for testing or admin commands
 *
 * Body:
 * {
 *   "action": "process" | "cleanup" | "retry",
 *   "secret": "YOUR_CRON_SECRET"
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = new Date();

  try {
    const body = await request.json();
    const { action = 'process', secret } = body;

    console.log('[ProcessReminders] Manual trigger', {
      action,
      timestamp: startTime.toISOString(),
    });

    // Verify secret
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let result: any;

    switch (action) {
      case 'process':
        // Same as GET
        const schedulerResult = await messageScheduler.processDueMessages();
        const appointments = getMockAppointments();
        const reminderResult = await reminderProcessor.processAllReminders(appointments);

        result = {
          action: 'process',
          scheduled: schedulerResult,
          reminders: reminderResult,
        };
        break;

      case 'cleanup':
        // Clean up old messages
        const cleanupCount = await messageScheduler.cleanupOldMessages(30);
        result = {
          action: 'cleanup',
          messagesRemoved: cleanupCount,
        };
        break;

      case 'retry':
        // Retry failed reminders
        const retryResult = await reminderProcessor.retryFailedReminders([]);
        result = {
          action: 'retry',
          ...retryResult,
        };
        break;

      case 'stats':
        // Get current statistics
        result = {
          action: 'stats',
          scheduler: messageScheduler.getStats(),
          reminder: reminderProcessor.getStatistics(),
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown action', validActions: ['process', 'cleanup', 'retry', 'stats'] },
          { status: 400 }
        );
    }

    const duration = new Date().getTime() - startTime.getTime();

    return NextResponse.json(
      {
        success: true,
        duration: `${duration}ms`,
        ...result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    const duration = new Date().getTime() - startTime.getTime();

    console.error('[ProcessReminders] Manual trigger failed', {
      error: error.message,
      duration,
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        duration: `${duration}ms`,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configure this route for Vercel Cron
 * Run every 5 minutes
 */
export const revalidate = 0; // Disable caching for this endpoint
