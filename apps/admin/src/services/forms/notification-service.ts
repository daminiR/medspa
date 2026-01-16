/**
 * Form Submission Notification Service
 *
 * Handles notifications when patients submit forms:
 * - Internal staff notifications for form completion
 * - Links to view completed forms
 * - Pre-visit form reminders
 * - Form completion tracking
 */

import {
  createStaffNotification,
  createCheckInNotification,
} from '@/lib/notifications/notificationStore';
import {
  markFormCompleted,
  markFormViewed,
  getPatientFormStatus,
  getCompletedForms,
} from '@/lib/data/patientForms';
import {
  getFormTemplate,
  getFormDisplayName,
  SERVICE_FORM_REQUIREMENTS,
  getRequiredForms,
  checkIncompleteForms,
} from '@/lib/data/formServiceMapping';
import type { PatientFormStatus } from '@/types/forms';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com';

/**
 * Form submission notification configuration per form type
 * Defines who should be notified and how
 */
interface FormNotificationConfig {
  enabled: boolean;
  recipientRoles?: string[]; // 'admin', 'staff', 'provider'
  recipientEmails?: string[];
  includeDetails: boolean;
  customMessage?: string;
}

/**
 * Default recipient configuration for different form types
 */
const FORM_NOTIFICATION_RECIPIENTS: Record<string, FormNotificationConfig> = {
  'form-hipaa': {
    enabled: true,
    recipientRoles: ['admin'],
    includeDetails: false,
    customMessage: 'Patient completed HIPAA Privacy Notice',
  },
  'form-general': {
    enabled: true,
    recipientRoles: ['admin', 'staff'],
    includeDetails: true,
    customMessage: 'New patient intake form submitted',
  },
  'form-botox': {
    enabled: true,
    recipientRoles: ['admin', 'staff'],
    includeDetails: true,
  },
  'form-filler': {
    enabled: true,
    recipientRoles: ['admin', 'staff'],
    includeDetails: true,
  },
  'form-laser': {
    enabled: true,
    recipientRoles: ['admin', 'staff'],
    includeDetails: true,
  },
  'form-chemical-peel': {
    enabled: true,
    recipientRoles: ['admin', 'staff'],
    includeDetails: true,
  },
  'form-microneedling': {
    enabled: true,
    recipientRoles: ['admin', 'staff'],
    includeDetails: true,
  },
  'form-massage': {
    enabled: true,
    recipientRoles: ['admin', 'staff'],
    includeDetails: false,
  },
  'form-physio': {
    enabled: true,
    recipientRoles: ['admin', 'staff'],
    includeDetails: false,
  },
  'form-chiro': {
    enabled: true,
    recipientRoles: ['admin', 'staff'],
    includeDetails: false,
  },
  'form-xray': {
    enabled: true,
    recipientRoles: ['admin', 'staff'],
    includeDetails: false,
  },
  // Aftercare forms - less critical
  'form-botox-aftercare': {
    enabled: true,
    recipientRoles: ['admin'],
    includeDetails: false,
  },
  'form-filler-aftercare': {
    enabled: true,
    recipientRoles: ['admin'],
    includeDetails: false,
  },
  'form-laser-aftercare': {
    enabled: true,
    recipientRoles: ['admin'],
    includeDetails: false,
  },
  'form-chemical-peel-aftercare': {
    enabled: true,
    recipientRoles: ['admin'],
    includeDetails: false,
  },
  'form-microneedling-aftercare': {
    enabled: true,
    recipientRoles: ['admin'],
    includeDetails: false,
  },
};

/**
 * Generate link to view form in the admin interface
 */
export function generateFormViewLink(
  patientId: string,
  formId: string,
  appointmentId?: string
): string {
  let url = `${APP_URL}/patients/${patientId}`;
  const params = new URLSearchParams();
  params.append('form', formId);

  if (appointmentId) {
    params.append('apt', appointmentId);
  }

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

/**
 * Notify staff when a form is submitted
 */
export async function notifyFormSubmitted(
  patientId: string,
  patientName: string,
  formId: string,
  appointmentId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const template = getFormTemplate(formId);
    if (!template) {
      console.error(`[FormNotification] Template not found for form: ${formId}`);
      return { success: false, error: 'Form template not found' };
    }

    const config = FORM_NOTIFICATION_RECIPIENTS[formId];
    if (!config || !config.enabled) {
      console.log(`[FormNotification] Notifications disabled for form: ${formId}`);
      return { success: true }; // Not an error, just disabled
    }

    // Generate link to view form
    const formViewLink = generateFormViewLink(patientId, formId, appointmentId);
    const formDisplayName = getFormDisplayName(formId);

    // Build notification message
    const message = config.customMessage ||
      `${formDisplayName} submitted by ${patientName}`;

    // Determine priority based on form type
    let priority: 'normal' | 'high' | 'urgent' = 'normal';
    if (formId.includes('hipaa') || formId.includes('general')) {
      priority = 'high'; // Intake forms are important
    } else if (formId.includes('consent')) {
      priority = 'high'; // Consent forms are important
    }

    // Create staff notification
    await createStaffNotification({
      type: priority === 'high' ? 'urgent' : 'normal',
      patientId,
      message,
      intent: 'form_submission',
      suggestedActions: ['Review Form', 'Contact Patient'],
      metadata: {
        formId,
        formName: formDisplayName,
        patientName,
        appointmentId,
        formCategory: template.category,
      },
    });

    console.log(`[FormNotification] Notified staff of form submission:`, {
      patientId,
      formId,
      priority,
    });

    return { success: true };
  } catch (error: any) {
    console.error('[FormNotification] Error notifying form submission:', error);
    return {
      success: false,
      error: error.message || 'Failed to notify form submission',
    };
  }
}

/**
 * Mark form as completed and trigger notifications
 */
export async function handleFormCompletion(
  patientId: string,
  patientName: string,
  formId: string,
  appointmentId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[FormNotification] Form completion:`, {
      patientId,
      formId,
      appointmentId,
    });

    // Mark form as completed in the system
    markFormCompleted(patientId, formId);

    // Notify staff about the submission
    const notifyResult = await notifyFormSubmitted(
      patientId,
      patientName,
      formId,
      appointmentId
    );

    if (!notifyResult.success) {
      console.error('[FormNotification] Failed to notify form submission');
    }

    return { success: true };
  } catch (error: any) {
    console.error('[FormNotification] Error handling form completion:', error);
    return {
      success: false,
      error: error.message || 'Failed to handle form completion',
    };
  }
}

/**
 * Send reminder notification for incomplete pre-visit forms
 * Called before an appointment
 */
export async function sendPreVisitFormReminder(
  patientId: string,
  patientName: string,
  serviceName: string,
  appointmentId: string,
  appointmentTime: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[FormNotification] Pre-visit reminder:`, {
      patientId,
      serviceName,
      appointmentId,
    });

    // Get incomplete forms for this service
    const completedForms = getCompletedForms(patientId);
    const incompleteFormIds = checkIncompleteForms(completedForms, serviceName);

    if (incompleteFormIds.length === 0) {
      console.log(`[FormNotification] All forms complete, no reminder needed`);
      return { success: true };
    }

    // Get form names
    const incompleteFormNames = incompleteFormIds
      .map(id => getFormDisplayName(id))
      .join(', ');

    // Generate forms link
    const formsLink = `${APP_URL}/forms/${patientId}?apt=${appointmentId}`;

    // Create notification for staff about missing forms
    await createStaffNotification({
      type: 'normal',
      patientId,
      message: `${patientName} has incomplete forms before appointment at ${appointmentTime}: ${incompleteFormNames}`,
      intent: 'incomplete_forms_reminder',
      suggestedActions: ['Send Form Reminder', 'Contact Patient', 'Reschedule'],
      metadata: {
        appointmentId,
        appointmentTime,
        serviceName,
        incompleteFormIds,
        incompleteFormNames,
        formsLink,
      },
    });

    console.log(`[FormNotification] Pre-visit reminder sent for ${incompleteFormIds.length} forms`);
    return { success: true };
  } catch (error: any) {
    console.error('[FormNotification] Error sending pre-visit reminder:', error);
    return {
      success: false,
      error: error.message || 'Failed to send pre-visit reminder',
    };
  }
}

/**
 * Get form completion tracking for a patient
 */
export function getFormCompletionTracking(
  patientId: string
): {
  completedForms: string[];
  completedCount: number;
  completionPercentage: number;
  lastCompletedForm?: string;
  lastCompletedAt?: Date;
} {
  const completedForms = getCompletedForms(patientId);

  return {
    completedForms,
    completedCount: completedForms.length,
    completionPercentage: completedForms.length > 0 ? 100 : 0,
    // Track latest completion
    lastCompletedForm: completedForms[0],
    lastCompletedAt: new Date(), // Would come from form status in production
  };
}

/**
 * Get recipient list for a specific form type
 * Used to determine who should be notified
 */
export function getFormNotificationRecipients(
  formId: string
): {
  enabled: boolean;
  roles: string[];
  emails: string[];
} {
  const config = FORM_NOTIFICATION_RECIPIENTS[formId] || {
    enabled: false,
    recipientRoles: [],
    recipientEmails: [],
  };

  return {
    enabled: config.enabled,
    roles: config.recipientRoles || [],
    emails: config.recipientEmails || [],
  };
}

/**
 * Update notification configuration for a form type
 * Allows customization of who gets notified
 */
export function updateFormNotificationConfig(
  formId: string,
  config: Partial<FormNotificationConfig>
): void {
  if (!FORM_NOTIFICATION_RECIPIENTS[formId]) {
    FORM_NOTIFICATION_RECIPIENTS[formId] = {
      enabled: true,
      includeDetails: false,
    };
  }

  const existing = FORM_NOTIFICATION_RECIPIENTS[formId];
  FORM_NOTIFICATION_RECIPIENTS[formId] = {
    ...existing,
    ...config,
  };

  console.log(`[FormNotification] Updated config for ${formId}:`, FORM_NOTIFICATION_RECIPIENTS[formId]);
}

/**
 * Send batch notifications for form completion
 * Used when processing multiple forms at once
 */
export async function notifyBatchFormSubmissions(
  patientId: string,
  patientName: string,
  formIds: string[],
  appointmentId?: string
): Promise<{
  success: boolean;
  notifiedForms: string[];
  failedForms: string[];
  errors: Record<string, string>;
}> {
  const notifiedForms: string[] = [];
  const failedForms: string[] = [];
  const errors: Record<string, string> = {};

  console.log(`[FormNotification] Batch notification for ${formIds.length} forms`);

  for (const formId of formIds) {
    try {
      const result = await handleFormCompletion(
        patientId,
        patientName,
        formId,
        appointmentId
      );

      if (result.success) {
        notifiedForms.push(formId);
      } else {
        failedForms.push(formId);
        errors[formId] = result.error || 'Unknown error';
      }
    } catch (error: any) {
      failedForms.push(formId);
      errors[formId] = error.message || 'Unknown error';
    }
  }

  return {
    success: failedForms.length === 0,
    notifiedForms,
    failedForms,
    errors,
  };
}

/**
 * Mark form as viewed (patient opened the form)
 */
export function markFormAsViewed(patientId: string, formId: string): void {
  markFormViewed(patientId, formId);
  console.log(`[FormNotification] Form marked as viewed:`, {
    patientId,
    formId,
  });
}

/**
 * Get detailed form status for tracking
 */
export function getFormStatusDetails(
  patientId: string,
  formId: string
): PatientFormStatus | undefined {
  return getPatientFormStatus(patientId, formId);
}
