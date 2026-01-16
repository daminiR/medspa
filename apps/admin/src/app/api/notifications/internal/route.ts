/**
 * Internal Staff Notifications API
 * GET /api/notifications/internal - List internal notifications
 * POST /api/notifications/internal - Create/send internal notification
 *
 * Handles internal staff notifications with recipient management,
 * email delivery mock, and notification history logging.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type {
  InternalNotificationEventType,
  InternalNotificationPayload,
  InternalNotificationContext,
  InternalNotificationMessage,
} from '@/types/notifications';

// Validation schemas
const CreateInternalNotificationSchema = z.object({
  eventType: z.enum([
    'appointment_booked',
    'appointment_canceled',
    'appointment_rescheduled',
    'appointment_no_show',
    'patient_checked_in',
    'patient_late',
    'form_submitted',
    'waitlist_match',
    'waitlist_patient_added',
    'sale_closed',
    'gift_card_purchased',
    'membership_purchased',
    'payment_received',
    'payment_failed',
    'treatment_complete',
    'inventory_low',
    'online_booking',
    'express_booking',
  ] as const),
  patient: z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }).optional(),
  appointment: z.object({
    id: z.string(),
    date: z.string(),
    time: z.string(),
    service: z.string().optional(),
    provider: z.string().optional(),
  }).optional(),
  staff: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  performedBy: z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
  }).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  source: z.enum(['online', 'staff', 'system', 'patient']).optional(),
  priority: z.enum(['normal', 'high', 'urgent']).optional(),
});

type CreateInternalNotificationRequest = z.infer<typeof CreateInternalNotificationSchema>;

// In-memory store for internal notifications (in production: database)
interface StoredInternalNotification extends InternalNotificationMessage {
  timestamp: number; // Unix timestamp for sorting
}

const notificationHistory: StoredInternalNotification[] = [];

// Email delivery log
interface EmailDeliveryLog {
  id: string;
  timestamp: string;
  recipients: string[];
  eventType: InternalNotificationEventType;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
}

const emailDeliveryLogs: EmailDeliveryLog[] = [];

/**
 * Generate unique notification ID
 */
function generateNotificationId(): string {
  return `internal-notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format notification subject based on event type
 */
function getNotificationSubject(eventType: InternalNotificationEventType, context?: InternalNotificationContext): string {
  const baseSubjects: Record<InternalNotificationEventType, string> = {
    'appointment_booked': 'New Appointment Scheduled',
    'appointment_canceled': 'Appointment Cancelled',
    'appointment_rescheduled': 'Appointment Rescheduled',
    'appointment_no_show': 'No-Show Appointment',
    'patient_checked_in': 'Patient Checked In',
    'patient_late': 'Patient Running Late',
    'form_submitted': 'New Form Submission',
    'waitlist_match': 'Waitlist Match Found',
    'waitlist_patient_added': 'Patient Added to Waitlist',
    'sale_closed': 'Sale Completed',
    'gift_card_purchased': 'Gift Card Purchase',
    'membership_purchased': 'Membership Purchase',
    'payment_received': 'Payment Received',
    'payment_failed': 'Payment Failed',
    'treatment_complete': 'Treatment Completed',
    'inventory_low': 'Low Inventory Alert',
    'online_booking': 'Online Booking Received',
    'express_booking': 'Express Booking',
  };

  let subject = baseSubjects[eventType];

  // Add priority prefix for urgent/high priority
  if (context?.priority === 'urgent') {
    subject = `URGENT: ${subject}`;
  } else if (context?.priority === 'high') {
    subject = `HIGH: ${subject}`;
  }

  return subject;
}

/**
 * Generate HTML body for email notification
 */
function generateEmailBody(notification: InternalNotificationMessage): string {
  const { payload, subject, body: messageBody, context } = notification;

  let html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
      <div style="border-left: 4px solid #007bff; padding: 20px; background: #f8f9fa; margin-bottom: 20px;">
        <h2 style="margin: 0 0 10px 0; color: #007bff;">${subject}</h2>
        <p style="margin: 0; color: #666; font-size: 14px;">${new Date().toLocaleString()}</p>
      </div>

      <div style="padding: 0 20px;">
        <p>${messageBody}</p>
  `;

  // Add patient information if available
  if (payload.patient) {
    html += `
      <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <h4 style="margin: 0 0 10px 0;">Patient Details</h4>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${payload.patient.name}</p>
        ${payload.patient.phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${payload.patient.phone}</p>` : ''}
        ${payload.patient.email ? `<p style="margin: 5px 0;"><strong>Email:</strong> ${payload.patient.email}</p>` : ''}
        ${payload.patient.id ? `<p style="margin: 5px 0;"><strong>ID:</strong> ${payload.patient.id}</p>` : ''}
      </div>
    `;
  }

  // Add appointment information if available
  if (payload.appointment) {
    html += `
      <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <h4 style="margin: 0 0 10px 0;">Appointment Details</h4>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${payload.appointment.date} at ${payload.appointment.time}</p>
        ${payload.appointment.service ? `<p style="margin: 5px 0;"><strong>Service:</strong> ${payload.appointment.service}</p>` : ''}
        ${payload.appointment.provider ? `<p style="margin: 5px 0;"><strong>Provider:</strong> ${payload.appointment.provider}</p>` : ''}
      </div>
    `;
  }

  // Add action URLs if available
  if (context?.actionUrls) {
    html += `<div style="margin: 20px 0; padding-top: 20px; border-top: 1px solid #ddd;">`;
    if (context.actionUrls.view) {
      html += `<a href="${context.actionUrls.view}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; margin-right: 10px;">View Details</a>`;
    }
    if (context.actionUrls.edit) {
      html += `<a href="${context.actionUrls.edit}" style="display: inline-block; padding: 10px 20px; background: #6c757d; color: white; text-decoration: none; border-radius: 4px; margin-right: 10px;">Edit</a>`;
    }
    if (context.actionUrls.respond) {
      html += `<a href="${context.actionUrls.respond}" style="display: inline-block; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 4px;">Respond</a>`;
    }
    html += `</div>`;
  }

  html += `
      </div>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px;">
        <p>This is an automated notification from your Medical Spa platform. Please do not reply to this email.</p>
      </div>
    </div>
  `;

  return html;
}

/**
 * Mock email delivery function
 */
async function sendEmailNotifications(
  recipients: string[],
  notification: InternalNotificationMessage
): Promise<EmailDeliveryLog> {
  const logId = `email-log-${Date.now()}`;
  const htmlBody = generateEmailBody(notification);

  console.log('[EmailDelivery] Sending notification:', {
    logId,
    recipients,
    eventType: notification.payload.eventType,
    subject: notification.subject,
  });

  // Mock email delivery
  // In production: integrate with SendGrid, AWS SES, or similar
  try {
    // Simulate email sending with random failure rate for testing
    const failureRate = 0.05; // 5% failure rate for testing
    if (Math.random() < failureRate && process.env.NODE_ENV === 'development') {
      throw new Error('Simulated email delivery failure');
    }

    const log: EmailDeliveryLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      recipients,
      eventType: notification.payload.eventType,
      subject: notification.subject,
      status: 'sent',
    };

    emailDeliveryLogs.unshift(log);
    console.log('[EmailDelivery] Notification sent successfully:', logId);

    return log;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[EmailDelivery] Failed to send notification:', errorMsg);

    const log: EmailDeliveryLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      recipients,
      eventType: notification.payload.eventType,
      subject: notification.subject,
      status: 'failed',
      error: errorMsg,
    };

    emailDeliveryLogs.unshift(log);
    return log;
  }
}

// GET /api/notifications/internal
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const eventTypeFilter = searchParams.get('eventType');
    const statusFilter = searchParams.get('status');
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    console.log('[InternalNotifications] GET request:', {
      limit,
      page,
      eventTypeFilter,
      statusFilter,
      sortOrder,
    });

    let result = [...notificationHistory];

    // Filter by event type
    if (eventTypeFilter) {
      result = result.filter(n => n.payload.eventType === eventTypeFilter);
    }

    // Filter by status
    if (statusFilter) {
      result = result.filter(n => n.status === statusFilter);
    }

    // Sort by timestamp
    result.sort((a, b) => {
      return sortOrder === 'asc' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
    });

    const total = result.length;

    // Pagination
    const start = (page - 1) * limit;
    const paginatedResult = result.slice(start, start + limit);

    // Transform for response (remove internal timestamp)
    const transformedNotifications = paginatedResult.map(({ timestamp, ...rest }) => rest);

    console.log('[InternalNotifications] Returning notifications:', {
      count: transformedNotifications.length,
      total,
      page,
      hasMore: start + limit < total,
    });

    return NextResponse.json({
      success: true,
      notifications: transformedNotifications,
      total,
      page,
      limit,
      hasMore: start + limit < total,
    });
  } catch (error) {
    console.error('[InternalNotifications] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch internal notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/internal
export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();

    console.log('[InternalNotifications] POST request:', {
      eventType: requestBody.eventType,
      hasPatient: !!requestBody.patient,
      hasAppointment: !!requestBody.appointment,
    });

    // Validate request
    let validated: CreateInternalNotificationRequest;
    try {
      validated = CreateInternalNotificationSchema.parse(requestBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('[InternalNotifications] Validation error:', error.issues);
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid request data',
            details: error.issues,
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Get notification configuration
    // In production: load from database based on event type and settings
    const config = getNotificationConfig(validated.eventType);

    if (!config.enabled) {
      console.log('[InternalNotifications] Notifications disabled for event type:', validated.eventType);
      return NextResponse.json({
        success: true,
        message: 'Notifications disabled for this event type',
        notification: null,
      });
    }

    // Build payload
    const payload: InternalNotificationPayload = {
      eventType: validated.eventType,
      timestamp: new Date(),
      patient: validated.patient,
      appointment: validated.appointment,
      staff: undefined, // Optional field
      metadata: validated.metadata,
      performedBy: validated.performedBy,
    };

    // Build context
    const context: InternalNotificationContext = {
      source: validated.source || 'system',
      priority: validated.priority || 'normal',
      actionUrls: buildActionUrls(validated.eventType, validated),
    };

    // Generate subject and body
    const subject = getNotificationSubject(validated.eventType, context);
    const notificationBody = generateNotificationBody(validated.eventType, payload, context);
    const htmlBody = undefined; // Will be generated when sending

    // Create notification message
    const notification: InternalNotificationMessage = {
      id: generateNotificationId(),
      config,
      payload,
      context,
      subject,
      body: notificationBody,
      status: 'pending',
    };

    console.log('[InternalNotifications] Created notification:', {
      id: notification.id,
      eventType: notification.payload.eventType,
      recipients: config.recipients.length,
    });

    // Send email notifications
    let emailDeliveryLog: EmailDeliveryLog | null = null;
    if (config.recipients.length > 0) {
      emailDeliveryLog = await sendEmailNotifications(config.recipients, notification);
      notification.status = emailDeliveryLog.status === 'sent' ? 'sent' : 'failed';
      notification.sentAt = new Date(emailDeliveryLog.timestamp);
      if (emailDeliveryLog.error) {
        notification.error = emailDeliveryLog.error;
      }
    }

    // Store in history
    const storedNotification: StoredInternalNotification = {
      ...notification,
      timestamp: Date.now(),
    };
    notificationHistory.unshift(storedNotification);

    // Keep history manageable (max 1000 notifications)
    if (notificationHistory.length > 1000) {
      notificationHistory.splice(1000);
    }

    console.log('[InternalNotifications] Notification stored:', {
      id: notification.id,
      status: notification.status,
      deliveryLogId: emailDeliveryLog?.id,
    });

    return NextResponse.json({
      success: true,
      notification: {
        id: notification.id,
        eventType: notification.payload.eventType,
        subject: notification.subject,
        recipients: config.recipients,
        status: notification.status,
        sentAt: notification.sentAt,
      },
      emailDeliveryLog,
    });
  } catch (error: any) {
    console.error('[InternalNotifications] POST error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create internal notification',
      },
      { status: 500 }
    );
  }
}

/**
 * Get notification configuration for event type
 * In production: load from database
 */
function getNotificationConfig(eventType: InternalNotificationEventType) {
  // Default recipients - in production, load from database settings
  const defaultRecipients = ['admin@medspa.com', 'notifications@medspa.com'];

  // Event-specific recipients and settings
  const configs: Record<InternalNotificationEventType, { enabled: boolean; recipients: string[]; includeDetails: boolean }> = {
    'appointment_booked': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'appointment_canceled': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'appointment_rescheduled': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'appointment_no_show': { enabled: true, recipients: [...defaultRecipients, 'managers@medspa.com'], includeDetails: true },
    'patient_checked_in': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'patient_late': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'form_submitted': { enabled: true, recipients: defaultRecipients, includeDetails: false },
    'waitlist_match': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'waitlist_patient_added': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'sale_closed': { enabled: true, recipients: [...defaultRecipients, 'sales@medspa.com'], includeDetails: true },
    'gift_card_purchased': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'membership_purchased': { enabled: true, recipients: [...defaultRecipients, 'sales@medspa.com'], includeDetails: true },
    'payment_received': { enabled: true, recipients: ['billing@medspa.com'], includeDetails: true },
    'payment_failed': { enabled: true, recipients: ['billing@medspa.com', 'managers@medspa.com'], includeDetails: true },
    'treatment_complete': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'inventory_low': { enabled: true, recipients: [...defaultRecipients, 'inventory@medspa.com'], includeDetails: true },
    'online_booking': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'express_booking': { enabled: true, recipients: defaultRecipients, includeDetails: true },
  };

  return configs[eventType] || { enabled: false, recipients: [], includeDetails: false };
}

/**
 * Generate notification body text
 */
function generateNotificationBody(
  eventType: InternalNotificationEventType,
  payload: InternalNotificationPayload,
  context: InternalNotificationContext
): string {
  const { patient, appointment, staff, performedBy, metadata } = payload;

  const bodies: Record<InternalNotificationEventType, string> = {
    'appointment_booked': `${patient?.name || 'A patient'} has booked an appointment${appointment ? ` for ${appointment.date} at ${appointment.time}` : ''}${appointment?.service ? ` for ${appointment.service}` : ''}.`,
    'appointment_canceled': `${patient?.name || 'A patient'} has cancelled their appointment${appointment ? ` scheduled for ${appointment.date}` : ''}.`,
    'appointment_rescheduled': `${patient?.name || 'A patient'} has rescheduled their appointment${appointment ? ` to ${appointment.date} at ${appointment.time}` : ''}.`,
    'appointment_no_show': `${patient?.name || 'A patient'} did not show up for their appointment on ${appointment?.date || 'the scheduled date'}.`,
    'patient_checked_in': `${patient?.name || 'A patient'} has checked in${appointment ? ` for their ${appointment.time} appointment` : ''}.`,
    'patient_late': `${patient?.name || 'A patient'} is running late for their ${appointment?.time || 'appointment'}.`,
    'form_submitted': `${patient?.name || 'A patient'} has submitted a form${appointment ? ` for their ${appointment.date} appointment` : ''}.`,
    'waitlist_match': `A match has been found on the waitlist for ${patient?.name || 'a patient'}.`,
    'waitlist_patient_added': `${patient?.name || 'A patient'} has been added to the waitlist${appointment ? ` for ${appointment.service || 'a service'}` : ''}.`,
    'sale_closed': `A sale has been closed${patient ? ` for ${patient.name}` : ''}. Amount: ${metadata?.amount || 'N/A'}.`,
    'gift_card_purchased': `A gift card has been purchased${patient ? ` by ${patient.name}` : ''}. Amount: ${metadata?.amount || 'N/A'}.`,
    'membership_purchased': `${patient?.name || 'A patient'} has purchased a membership.`,
    'payment_received': `Payment received${patient ? ` from ${patient.name}` : ''}. Amount: ${metadata?.amount || 'N/A'}.`,
    'payment_failed': `Payment failed${patient ? ` from ${patient.name}` : ''}. Amount: ${metadata?.amount || 'N/A'}.`,
    'treatment_complete': `${patient?.name || 'A patient'}'s treatment has been completed.`,
    'inventory_low': `Inventory alert: ${metadata?.itemName || 'An item'} is running low${metadata?.quantity ? ` (${metadata.quantity} units remaining)` : ''}.`,
    'online_booking': `${patient?.name || 'A patient'} has booked online${appointment ? ` for ${appointment.date} at ${appointment.time}` : ''}.`,
    'express_booking': `${patient?.name || 'A patient'} has booked via express link${appointment ? ` for ${appointment.date} at ${appointment.time}` : ''}.`,
  };

  return bodies[eventType] || 'A notification has been triggered.';
}

/**
 * Build action URLs for the notification context
 */
function buildActionUrls(
  eventType: InternalNotificationEventType,
  data: CreateInternalNotificationRequest
): Record<string, string> | undefined {
  const urls: Record<string, string> = {};

  if (data.patient?.id) {
    urls.view = `/patients/${data.patient.id}`;
    urls.edit = `/patients/${data.patient.id}/edit`;
  }

  if (data.appointment?.id) {
    if (!urls.view) {
      urls.view = `/calendar?appointment=${data.appointment.id}`;
    }
    urls.edit = `/calendar?edit=${data.appointment.id}`;
  }

  // Add specific action URLs based on event type
  if (eventType === 'payment_failed' && data.patient?.id) {
    urls.respond = `/patients/${data.patient.id}/billing`;
  }

  if (eventType === 'inventory_low') {
    urls.view = '/inventory';
  }

  return Object.keys(urls).length > 0 ? urls : undefined;
}
