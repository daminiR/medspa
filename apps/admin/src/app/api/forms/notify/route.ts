/**
 * Form Notification API Endpoint
 *
 * Triggers form submission notifications when patients complete forms.
 * This endpoint is called by the form UI when a patient successfully submits a form.
 *
 * POST /api/forms/notify
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  handleFormCompletion,
  notifyBatchFormSubmissions,
  markFormAsViewed,
  getFormStatusDetails,
  sendPreVisitFormReminder,
  getFormCompletionTracking,
  getFormNotificationRecipients,
} from '@/services/forms/notification-service';

/**
 * Request body for form notification
 */
interface FormNotificationRequest {
  patientId: string;
  patientName: string;
  formId?: string;
  formIds?: string[];
  appointmentId?: string;
  action: 'completed' | 'viewed' | 'reminder' | 'status' | 'recipients' | 'tracking';
  appointmentTime?: string;
  serviceName?: string;
}

/**
 * Response structure
 */
interface FormNotificationResponse {
  success: boolean;
  message?: string;
  data?: Record<string, unknown>;
  error?: string;
}

/**
 * POST /api/forms/notify
 *
 * Handles form submission notifications with various actions:
 * - completed: Mark form as completed and notify staff
 * - viewed: Mark form as viewed
 * - reminder: Send pre-visit form reminders
 * - status: Get form status details
 * - recipients: Get notification recipients for a form
 * - tracking: Get form completion tracking
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<FormNotificationResponse>> {
  try {
    const body = (await request.json()) as FormNotificationRequest;
    const {
      patientId,
      patientName,
      formId,
      formIds,
      appointmentId,
      action,
      appointmentTime,
      serviceName,
    } = body;

    console.log('[FormNotify API] Request:', {
      patientId,
      action,
      formId: formId || formIds?.length,
      appointmentId,
    });

    // Validate required fields
    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'Patient ID is required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    // Handle different actions
    switch (action) {
      // Form completed - notify staff and mark as completed
      case 'completed': {
        if (!formId && !formIds) {
          return NextResponse.json(
            { success: false, error: 'Form ID(s) required for completed action' },
            { status: 400 }
          );
        }

        if (formIds && formIds.length > 0) {
          // Batch completion
          const result = await notifyBatchFormSubmissions(
            patientId,
            patientName,
            formIds,
            appointmentId
          );

          console.log('[FormNotify API] Batch completion result:', {
            notified: result.notifiedForms.length,
            failed: result.failedForms.length,
          });

          return NextResponse.json(
            {
              success: result.success,
              message: `Notified staff about ${result.notifiedForms.length} form(s)`,
              data: {
                notifiedForms: result.notifiedForms,
                failedForms: result.failedForms,
                errors: result.errors,
              },
            },
            { status: result.success ? 200 : 207 }
          );
        } else if (formId) {
          // Single form completion
          const result = await handleFormCompletion(
            patientId,
            patientName,
            formId,
            appointmentId
          );

          console.log('[FormNotify API] Form completed:', {
            formId,
            patientId,
            success: result.success,
          });

          if (!result.success) {
            return NextResponse.json(
              { success: false, error: result.error || 'Failed to process form completion' },
              { status: 500 }
            );
          }

          return NextResponse.json(
            {
              success: true,
              message: `Form submitted and staff notified`,
              data: { formId },
            },
            { status: 200 }
          );
        }

        return NextResponse.json(
          { success: false, error: 'No form ID(s) provided' },
          { status: 400 }
        );
      }

      // Form viewed - mark as viewed by patient
      case 'viewed': {
        if (!formId) {
          return NextResponse.json(
            { success: false, error: 'Form ID required for viewed action' },
            { status: 400 }
          );
        }

        try {
          markFormAsViewed(patientId, formId);

          console.log('[FormNotify API] Form marked as viewed:', {
            formId,
            patientId,
          });

          return NextResponse.json(
            {
              success: true,
              message: 'Form marked as viewed',
              data: { formId },
            },
            { status: 200 }
          );
        } catch (error: any) {
          return NextResponse.json(
            { success: false, error: error.message || 'Failed to mark form as viewed' },
            { status: 500 }
          );
        }
      }

      // Pre-visit reminder - send reminder for incomplete forms
      case 'reminder': {
        if (!serviceName || !appointmentTime) {
          return NextResponse.json(
            {
              success: false,
              error: 'Service name and appointment time required for reminder action',
            },
            { status: 400 }
          );
        }

        const result = await sendPreVisitFormReminder(
          patientId,
          patientName,
          serviceName,
          appointmentId || `apt-${Date.now()}`,
          appointmentTime
        );

        console.log('[FormNotify API] Pre-visit reminder sent:', {
          patientId,
          serviceName,
          success: result.success,
        });

        if (!result.success) {
          return NextResponse.json(
            { success: false, error: result.error || 'Failed to send reminder' },
            { status: 500 }
          );
        }

        return NextResponse.json(
          {
            success: true,
            message: 'Pre-visit form reminder sent',
            data: { appointmentTime, serviceName },
          },
          { status: 200 }
        );
      }

      // Get form status - return status details for a specific form
      case 'status': {
        if (!formId) {
          return NextResponse.json(
            { success: false, error: 'Form ID required for status action' },
            { status: 400 }
          );
        }

        const status = getFormStatusDetails(patientId, formId);

        console.log('[FormNotify API] Form status retrieved:', {
          formId,
          patientId,
          status: status?.status,
        });

        return NextResponse.json(
          {
            success: true,
            message: 'Form status retrieved',
            data: {
              formId,
              status: status || { status: 'not_sent' },
            },
          },
          { status: 200 }
        );
      }

      // Get notification recipients - return who should be notified for this form
      case 'recipients': {
        if (!formId) {
          return NextResponse.json(
            { success: false, error: 'Form ID required for recipients action' },
            { status: 400 }
          );
        }

        const recipients = getFormNotificationRecipients(formId);

        console.log('[FormNotify API] Recipients retrieved for form:', {
          formId,
          enabled: recipients.enabled,
          roleCount: recipients.roles.length,
        });

        return NextResponse.json(
          {
            success: true,
            message: 'Recipients retrieved',
            data: {
              formId,
              recipients,
            },
          },
          { status: 200 }
        );
      }

      // Get tracking - return form completion tracking for patient
      case 'tracking': {
        const tracking = getFormCompletionTracking(patientId);

        console.log('[FormNotify API] Tracking retrieved for patient:', {
          patientId,
          completedCount: tracking.completedCount,
        });

        return NextResponse.json(
          {
            success: true,
            message: 'Form completion tracking retrieved',
            data: {
              patientId,
              tracking,
            },
          },
          { status: 200 }
        );
      }

      // Unknown action
      default: {
        return NextResponse.json(
          {
            success: false,
            error: `Unknown action: ${action}. Valid actions are: completed, viewed, reminder, status, recipients, tracking`,
          },
          { status: 400 }
        );
      }
    }
  } catch (error: any) {
    console.error('[FormNotify API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/forms/notify
 *
 * Health check endpoint and API documentation
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<Record<string, unknown>>> {
  const searchParams = request.nextUrl.searchParams;
  const patientId = searchParams.get('patientId');

  // If patientId is provided, return tracking info
  if (patientId) {
    try {
      const tracking = getFormCompletionTracking(patientId);
      return NextResponse.json(
        {
          success: true,
          message: 'Form tracking info',
          data: { patientId, tracking },
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to retrieve tracking' },
        { status: 500 }
      );
    }
  }

  // Otherwise return API documentation
  return NextResponse.json(
    {
      success: true,
      message: 'Form Notification API',
      endpoints: {
        POST: {
          description: 'Trigger form notifications',
          url: '/api/forms/notify',
          actions: {
            completed: {
              description: 'Mark form as completed and notify staff',
              required: ['patientId', 'patientName', 'formId or formIds', 'action'],
              optional: ['appointmentId'],
            },
            viewed: {
              description: 'Mark form as viewed by patient',
              required: ['patientId', 'formId', 'action'],
            },
            reminder: {
              description: 'Send pre-visit form reminder for incomplete forms',
              required: ['patientId', 'patientName', 'serviceName', 'appointmentTime', 'action'],
              optional: ['appointmentId'],
            },
            status: {
              description: 'Get status of a specific form',
              required: ['patientId', 'formId', 'action'],
            },
            recipients: {
              description: 'Get notification recipients for a form type',
              required: ['formId', 'action'],
            },
            tracking: {
              description: 'Get form completion tracking for a patient',
              required: ['patientId', 'action'],
            },
          },
        },
        GET: {
          description: 'Retrieve form tracking info or API documentation',
          url: '/api/forms/notify',
          queryParams: {
            patientId: 'Optional - returns tracking for this patient',
          },
        },
      },
      examples: {
        completeForm: {
          method: 'POST',
          body: {
            patientId: 'patient-123',
            patientName: 'John Doe',
            formId: 'form-hipaa',
            appointmentId: 'apt-456',
            action: 'completed',
          },
        },
        markViewed: {
          method: 'POST',
          body: {
            patientId: 'patient-123',
            formId: 'form-botox',
            action: 'viewed',
          },
        },
        sendReminder: {
          method: 'POST',
          body: {
            patientId: 'patient-123',
            patientName: 'John Doe',
            serviceName: 'Botox',
            appointmentTime: '2:00 PM',
            appointmentId: 'apt-456',
            action: 'reminder',
          },
        },
        getTracking: {
          method: 'GET',
          url: '/api/forms/notify?patientId=patient-123',
        },
      },
    },
    { status: 200 }
  );
}
