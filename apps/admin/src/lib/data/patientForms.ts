/**
 * Patient Forms Tracking
 *
 * Tracks form status per patient for the automated form lifecycle.
 * In production, this would be a database table.
 * For now, uses in-memory storage following codebase patterns.
 */

import {
  PatientFormStatus,
  FormStatus,
  FormReminderType,
  AppointmentFormReminders,
  CheckInFormValidation
} from '@/types/forms';
import {
  getRequiredForms,
  getFormDisplayName,
  getFormValidity,
  isOneTimeForm,
  FORM_TEMPLATES
} from './formServiceMapping';

// In-memory storage for patient form status
// Key: patientId, Value: array of form statuses
const patientFormStatuses: PatientFormStatus[] = [];

// Track form reminders sent per appointment
const appointmentFormReminders: AppointmentFormReminders[] = [];

/**
 * Generate unique ID for form status record
 */
function generateFormStatusId(): string {
  return `pfs-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all form statuses for a patient
 */
export function getPatientFormStatuses(patientId: string): PatientFormStatus[] {
  return patientFormStatuses.filter(pfs => pfs.patientId === patientId);
}

/**
 * Get form status for a specific form and patient
 */
export function getPatientFormStatus(
  patientId: string,
  formId: string
): PatientFormStatus | undefined {
  // Get all statuses for this patient and form
  const statuses = patientFormStatuses.filter(
    pfs => pfs.patientId === patientId && pfs.formId === formId
  );

  if (statuses.length === 0) return undefined;

  // Return the most recent non-expired status
  const validStatuses = statuses.filter(s => {
    if (!s.expiresAt) return true;
    return new Date(s.expiresAt) > new Date();
  });

  return validStatuses[validStatuses.length - 1];
}

/**
 * Get incomplete forms for a patient and service
 * Returns form IDs that need to be completed
 */
export function getIncompleteForms(
  patientId: string,
  serviceName: string
): string[] {
  const requiredForms = getRequiredForms(serviceName);
  const incompleteForms: string[] = [];

  for (const formId of requiredForms) {
    const status = getPatientFormStatus(patientId, formId);

    // Form is incomplete if:
    // - Never sent
    // - Sent but not completed
    // - Expired
    if (!status || status.status !== 'completed') {
      incompleteForms.push(formId);
    } else if (status.expiresAt && new Date(status.expiresAt) < new Date()) {
      // Completed but expired
      incompleteForms.push(formId);
    }
  }

  return incompleteForms;
}

/**
 * Get forms that need to be sent for a new appointment
 * Considers one-time forms that are already completed
 */
export function getFormsToSend(
  patientId: string,
  serviceName: string
): string[] {
  const requiredForms = getRequiredForms(serviceName);
  const formsToSend: string[] = [];

  for (const formId of requiredForms) {
    const status = getPatientFormStatus(patientId, formId);

    // Always send if never sent
    if (!status) {
      formsToSend.push(formId);
      continue;
    }

    // Check if form is still valid
    const validity = getFormValidity(formId);

    if (validity === 'permanent' && status.status === 'completed') {
      // One-time form already completed, skip
      continue;
    }

    if (validity === 'per-visit') {
      // Per-visit forms always need to be re-sent
      formsToSend.push(formId);
      continue;
    }

    // Check expiration for time-based validity
    if (status.status === 'completed' && status.completedAt) {
      const completedDate = new Date(status.completedAt);
      const now = new Date();
      let expirationMonths = 12; // Default 1 year

      if (validity === '6-months') expirationMonths = 6;
      else if (validity === '1-year') expirationMonths = 12;

      const expirationDate = new Date(completedDate);
      expirationDate.setMonth(expirationDate.getMonth() + expirationMonths);

      if (now > expirationDate) {
        // Expired, needs to be re-sent
        formsToSend.push(formId);
      }
      // Still valid, skip
    } else {
      // Not completed, send it
      formsToSend.push(formId);
    }
  }

  return formsToSend;
}

/**
 * Check if a form was recently sent (within 24 hours)
 * Prevents duplicate sends
 */
export function wasFormRecentlySent(
  patientId: string,
  formId: string,
  hoursThreshold: number = 24
): boolean {
  const status = getPatientFormStatus(patientId, formId);
  if (!status || !status.sentAt) return false;

  const sentDate = new Date(status.sentAt);
  const hoursSinceSent = (Date.now() - sentDate.getTime()) / (1000 * 60 * 60);

  return hoursSinceSent < hoursThreshold;
}

/**
 * Mark a form as sent to a patient
 */
export function markFormSent(
  patientId: string,
  formId: string,
  appointmentId?: string
): PatientFormStatus {
  const now = new Date();
  const validity = getFormValidity(formId);

  // Calculate expiration for per-visit forms
  let expiresAt: Date | undefined;
  if (validity === 'per-visit' && appointmentId) {
    // Per-visit forms expire 24 hours after the appointment
    // In production, we'd look up the appointment date
    expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days for now
  }

  const newStatus: PatientFormStatus = {
    id: generateFormStatusId(),
    patientId,
    formId,
    appointmentId,
    status: 'sent',
    sentAt: now,
    expiresAt,
    remindersSent: [],
    createdAt: now,
    updatedAt: now
  };

  patientFormStatuses.push(newStatus);
  return newStatus;
}

/**
 * Mark a form as viewed by the patient
 */
export function markFormViewed(patientId: string, formId: string): void {
  const status = getPatientFormStatus(patientId, formId);
  if (status && status.status === 'sent') {
    status.status = 'viewed';
    status.viewedAt = new Date();
    status.updatedAt = new Date();
  }
}

/**
 * Mark a form as completed by the patient
 */
export function markFormCompleted(patientId: string, formId: string): void {
  const status = getPatientFormStatus(patientId, formId);
  if (status) {
    status.status = 'completed';
    status.completedAt = new Date();
    status.updatedAt = new Date();
  }
}

/**
 * Mark a form as expired
 */
export function markFormExpired(patientId: string, formId: string): void {
  const status = getPatientFormStatus(patientId, formId);
  if (status) {
    status.status = 'expired';
    status.updatedAt = new Date();
  }
}

/**
 * Get completed forms for a patient
 */
export function getCompletedForms(patientId: string): string[] {
  return patientFormStatuses
    .filter(pfs =>
      pfs.patientId === patientId &&
      pfs.status === 'completed' &&
      (!pfs.expiresAt || new Date(pfs.expiresAt) > new Date())
    )
    .map(pfs => pfs.formId);
}

/**
 * Get form reminders sent for an appointment
 */
export function getFormRemindersSent(appointmentId: string): FormReminderType[] {
  const record = appointmentFormReminders.find(r => r.appointmentId === appointmentId);
  return record?.remindersSent.map(r => r.type) || [];
}

/**
 * Mark a form reminder as sent for an appointment
 */
export function markFormReminderSent(
  appointmentId: string,
  reminderType: FormReminderType
): void {
  let record = appointmentFormReminders.find(r => r.appointmentId === appointmentId);

  if (!record) {
    record = {
      appointmentId,
      remindersSent: []
    };
    appointmentFormReminders.push(record);
  }

  // Don't add duplicate reminders
  if (!record.remindersSent.some(r => r.type === reminderType)) {
    record.remindersSent.push({
      type: reminderType,
      sentAt: new Date()
    });
  }
}

/**
 * Validate forms for check-in
 * Returns validation result with incomplete forms
 */
export function validateFormsForCheckIn(
  patientId: string,
  serviceName: string
): CheckInFormValidation {
  const incompleteForms = getIncompleteForms(patientId, serviceName);
  const formNames = incompleteForms.map(formId => getFormDisplayName(formId));
  const formsLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.example.com'}/forms/${patientId}`;

  return {
    allComplete: incompleteForms.length === 0,
    incompleteForms,
    formNames,
    formsLink
  };
}

/**
 * Get form completion summary for a patient
 */
export function getFormCompletionSummary(patientId: string): {
  total: number;
  completed: number;
  pending: number;
  percentComplete: number;
} {
  const statuses = getPatientFormStatuses(patientId);
  const completed = statuses.filter(s => s.status === 'completed').length;
  const total = statuses.length;

  return {
    total,
    completed,
    pending: total - completed,
    percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0
  };
}

/**
 * Seed mock form data for testing
 * Call this to populate some initial data
 */
export function seedMockFormData(): void {
  // Patient 1 - completed most forms
  const patient1Forms = [
    { patientId: 'p1', formId: 'form-hipaa', status: 'completed' as FormStatus },
    { patientId: 'p1', formId: 'form-general', status: 'completed' as FormStatus },
    { patientId: 'p1', formId: 'form-botox', status: 'sent' as FormStatus }
  ];

  // Patient 2 - new patient, no forms
  // (no entries)

  // Patient 3 - some forms completed
  const patient3Forms = [
    { patientId: 'p3', formId: 'form-hipaa', status: 'completed' as FormStatus },
    { patientId: 'p3', formId: 'form-filler', status: 'viewed' as FormStatus }
  ];

  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const form of [...patient1Forms, ...patient3Forms]) {
    const status: PatientFormStatus = {
      id: generateFormStatusId(),
      patientId: form.patientId,
      formId: form.formId,
      status: form.status,
      sentAt: yesterday,
      viewedAt: form.status === 'viewed' || form.status === 'completed' ? yesterday : undefined,
      completedAt: form.status === 'completed' ? yesterday : undefined,
      remindersSent: [],
      createdAt: yesterday,
      updatedAt: now
    };
    patientFormStatuses.push(status);
  }
}

/**
 * Clear all form data (for testing)
 */
export function clearFormData(): void {
  patientFormStatuses.length = 0;
  appointmentFormReminders.length = 0;
}

/**
 * Get all form statuses (for debugging/admin)
 */
export function getAllFormStatuses(): PatientFormStatus[] {
  return [...patientFormStatuses];
}
