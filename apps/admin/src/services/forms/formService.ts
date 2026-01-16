/**
 * Form Automation Service
 *
 * Handles the automated form lifecycle:
 * - Auto-send forms on booking
 * - Form reminder delivery
 * - Aftercare instructions
 * - Check-in form validation
 */

import { FormSendRequest, FormSendResult, FormReminderType } from '@/types/forms';
import {
  getFormsToSend,
  markFormSent,
  markFormReminderSent,
  getFormRemindersSent,
  validateFormsForCheckIn,
  wasFormRecentlySent,
  getCompletedForms
} from '@/lib/data/patientForms';
import {
  getFormDisplayName,
  getAftercareForms,
  getEstimatedCompletionTime,
  FORM_TEMPLATES,
  checkIncompleteForms
} from '@/lib/data/formServiceMapping';
import {
  sendSMS,
  formatPhoneNumber,
  logSMSForCompliance,
  smsTemplates as twilioTemplates
} from '@/lib/twilio';

// Configuration
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com';

/**
 * Form SMS Templates - re-exported from centralized twilio.ts
 * This alias maintains backward compatibility for any code importing from formService
 */
export const formSmsTemplates = {
  formsRequired: twilioTemplates.formsRequired,
  formReminder72hr: twilioTemplates.formReminder72hr,
  formReminder24hr: twilioTemplates.formReminder24hr,
  checkInIncomplete: twilioTemplates.checkInIncomplete,
  checkInComplete: twilioTemplates.checkInComplete,
  aftercareInstructions: twilioTemplates.aftercareInstructions,
};

/**
 * Generate forms link for a patient
 */
export function generateFormsLink(patientId: string, appointmentId?: string): string {
  if (appointmentId) {
    return `${APP_URL}/forms/${patientId}?apt=${appointmentId}`;
  }
  return `${APP_URL}/forms/${patientId}`;
}

/**
 * Generate aftercare link for an appointment
 */
export function generateAftercareLink(appointmentId: string): string {
  return `${APP_URL}/aftercare/${appointmentId}`;
}

/**
 * Send forms to a patient
 * Used when appointment is booked
 */
export async function sendFormsToPatient(
  request: FormSendRequest
): Promise<FormSendResult> {
  const { patientId, phone, formIds, appointmentId, serviceName } = request;

  // Filter to forms that actually need to be sent
  const formsToSend = serviceName
    ? getFormsToSend(patientId, serviceName)
    : formIds;

  if (formsToSend.length === 0) {
    return {
      success: true,
      formsSent: [],
      formsSkipped: formIds
    };
  }

  // Get form display names
  const formNames = formsToSend.map(id => getFormDisplayName(id));

  // Generate link and estimated time
  const formsLink = generateFormsLink(patientId, appointmentId);
  const estimatedTime = getEstimatedCompletionTime(formsToSend);

  // Build message
  // Get patient name (would come from patient lookup in production)
  const patientName = 'there'; // Fallback, should be passed in
  const message = formSmsTemplates.formsRequired(
    patientName,
    serviceName || 'upcoming',
    formNames,
    formsLink,
    estimatedTime
  );

  try {
    // Send SMS
    const result = await sendSMS(formatPhoneNumber(phone), message);

    if (result.success) {
      // Mark forms as sent
      for (const formId of formsToSend) {
        markFormSent(patientId, formId, appointmentId);
      }

      // Log for compliance
      await logSMSForCompliance(
        phone,
        message,
        'outbound',
        'form_request_booking',
        result.messageId
      );

      return {
        success: true,
        formsSent: formsToSend,
        formsSkipped: formIds.filter(id => !formsToSend.includes(id))
      };
    } else {
      return {
        success: false,
        formsSent: [],
        formsSkipped: formIds,
        error: result.error
      };
    }
  } catch (error: any) {
    console.error('Error sending forms to patient:', error);
    return {
      success: false,
      formsSent: [],
      formsSkipped: formIds,
      error: error.message || 'Failed to send forms'
    };
  }
}

/**
 * Send form reminder to a patient
 * Used by the cron job for 72hr and 24hr reminders
 */
export async function sendFormReminder(
  patientId: string,
  patientName: string,
  phone: string,
  serviceName: string,
  appointmentId: string,
  appointmentTime: string,
  reminderType: FormReminderType
): Promise<{ success: boolean; error?: string }> {
  // Check if reminder already sent
  const remindersSent = getFormRemindersSent(appointmentId);
  if (remindersSent.includes(reminderType)) {
    return { success: true }; // Already sent, no-op
  }

  // Get incomplete forms
  const completedForms = getCompletedForms(patientId);
  const incompleteForms = checkIncompleteForms(completedForms, serviceName);
  if (incompleteForms.length === 0) {
    return { success: true }; // All forms complete, no reminder needed
  }

  // Get form display names
  const formNames = incompleteForms.map(id => getFormDisplayName(id));
  const formsLink = generateFormsLink(patientId, appointmentId);

  // Build message based on reminder type
  let message: string;
  if (reminderType === '24hr') {
    message = formSmsTemplates.formReminder24hr(
      patientName,
      serviceName,
      appointmentTime,
      formNames,
      formsLink
    );
  } else {
    message = formSmsTemplates.formReminder72hr(
      patientName,
      serviceName,
      formNames,
      formsLink
    );
  }

  try {
    const result = await sendSMS(formatPhoneNumber(phone), message);

    if (result.success) {
      // Mark reminder as sent
      markFormReminderSent(appointmentId, reminderType);

      // Log for compliance
      await logSMSForCompliance(
        phone,
        message,
        'outbound',
        `form_reminder_${reminderType}`,
        result.messageId
      );

      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    console.error(`Error sending ${reminderType} form reminder:`, error);
    return { success: false, error: error.message || 'Failed to send reminder' };
  }
}

/**
 * Handle check-in and return appropriate response
 * Used by SMS webhook when patient texts "HERE"
 */
export async function handleCheckInFormValidation(
  patientId: string,
  patientName: string,
  phone: string,
  serviceName: string,
  appointmentTime: string,
  queueInfo?: { position: number; waitingCount: number }
): Promise<{
  message: string;
  formsComplete: boolean;
  incompleteForms: string[];
}> {
  const validation = validateFormsForCheckIn(patientId, serviceName);

  let message: string;
  if (validation.allComplete) {
    message = formSmsTemplates.checkInComplete(patientName, appointmentTime, queueInfo);
  } else {
    message = formSmsTemplates.checkInIncomplete(
      patientName,
      appointmentTime,
      validation.formNames,
      validation.formsLink,
      queueInfo
    );
  }

  return {
    message,
    formsComplete: validation.allComplete,
    incompleteForms: validation.incompleteForms
  };
}

/**
 * Send aftercare instructions to a patient
 * Used after appointment is completed
 */
export async function sendAftercareInstructions(
  patientId: string,
  patientName: string,
  phone: string,
  serviceName: string,
  appointmentId: string
): Promise<{ success: boolean; error?: string }> {
  // Get aftercare forms for this service
  const aftercareForms = getAftercareForms(serviceName);
  if (aftercareForms.length === 0) {
    return { success: true }; // No aftercare for this service
  }

  const aftercareLink = generateAftercareLink(appointmentId);
  const message = formSmsTemplates.aftercareInstructions(
    patientName,
    serviceName,
    aftercareLink
  );

  try {
    const result = await sendSMS(formatPhoneNumber(phone), message);

    if (result.success) {
      // Mark aftercare forms as sent
      for (const formId of aftercareForms) {
        markFormSent(patientId, formId, appointmentId);
      }

      // Log for compliance
      await logSMSForCompliance(
        phone,
        message,
        'outbound',
        'aftercare_instructions',
        result.messageId
      );

      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    console.error('Error sending aftercare instructions:', error);
    return { success: false, error: error.message || 'Failed to send aftercare' };
  }
}

/**
 * Enhanced form request that includes patient lookup
 * Main entry point for auto-send on booking
 */
export async function autoSendFormsOnBooking(
  patientId: string,
  patientName: string,
  phone: string,
  serviceName: string,
  appointmentId: string
): Promise<FormSendResult> {
  // Get required forms for this service
  const formsToSend = getFormsToSend(patientId, serviceName);

  if (formsToSend.length === 0) {
    console.log(`[FormService] No forms to send for ${patientName} (${serviceName})`);
    return {
      success: true,
      formsSent: [],
      formsSkipped: []
    };
  }

  // Get form display names
  const formNames = formsToSend.map(id => getFormDisplayName(id));
  const formsLink = generateFormsLink(patientId, appointmentId);
  const estimatedTime = getEstimatedCompletionTime(formsToSend);

  // Build the message
  const message = formSmsTemplates.formsRequired(
    patientName,
    serviceName,
    formNames,
    formsLink,
    estimatedTime
  );

  try {
    const result = await sendSMS(formatPhoneNumber(phone), message);

    if (result.success) {
      // Mark forms as sent
      for (const formId of formsToSend) {
        markFormSent(patientId, formId, appointmentId);
      }

      // Log for compliance
      await logSMSForCompliance(
        phone,
        message,
        'outbound',
        'form_request_booking',
        result.messageId
      );

      console.log(`[FormService] Sent ${formsToSend.length} forms to ${patientName}`);

      return {
        success: true,
        formsSent: formsToSend,
        formsSkipped: []
      };
    } else {
      console.error(`[FormService] Failed to send forms: ${result.error}`);
      return {
        success: false,
        formsSent: [],
        formsSkipped: formsToSend,
        error: result.error
      };
    }
  } catch (error: any) {
    console.error('[FormService] Error in autoSendFormsOnBooking:', error);
    return {
      success: false,
      formsSent: [],
      formsSkipped: formsToSend,
      error: error.message || 'Failed to send forms'
    };
  }
}

/**
 * Check if forms are complete for an appointment
 * Used for dashboard status display
 */
export function checkFormStatus(
  patientId: string,
  serviceName: string
): {
  status: 'complete' | 'pending' | 'not_sent';
  completedCount: number;
  totalCount: number;
  incompleteForms: string[];
} {
  const completedForms = getCompletedForms(patientId);
  const incompleteForms = checkIncompleteForms(completedForms, serviceName);
  const formsToSend = getFormsToSend(patientId, serviceName);

  // If no forms needed, consider complete
  if (formsToSend.length === 0 && incompleteForms.length === 0) {
    return {
      status: 'complete',
      completedCount: 0,
      totalCount: 0,
      incompleteForms: []
    };
  }

  const totalCount = formsToSend.length + incompleteForms.length;
  const completedCount = totalCount - incompleteForms.length;

  if (incompleteForms.length === 0) {
    return {
      status: 'complete',
      completedCount,
      totalCount,
      incompleteForms: []
    };
  }

  // Check if any forms were sent
  if (formsToSend.length === incompleteForms.length) {
    return {
      status: 'not_sent',
      completedCount: 0,
      totalCount,
      incompleteForms
    };
  }

  return {
    status: 'pending',
    completedCount,
    totalCount,
    incompleteForms
  };
}
