/**
 * Form Automation Types
 *
 * Types for the automated form lifecycle system that handles:
 * - Auto-sending forms on booking
 * - Form reminders at 72hr and 24hr before appointment
 * - Check-in validation for incomplete forms
 * - Aftercare auto-send post-treatment
 */

// Form validity periods - determines when forms need to be re-signed
export type FormValidity = 'per-visit' | '6-months' | '1-year' | 'permanent';

// Form status lifecycle
export type FormStatus = 'not_sent' | 'sent' | 'viewed' | 'completed' | 'expired';

// Form categories
export type FormCategory = 'consent' | 'intake' | 'aftercare';

// Reminder types for form completion
export type FormReminderType = '72hr' | '24hr' | 'checkin';

/**
 * Defines which forms are required for each service
 */
export interface ServiceFormRequirement {
  consent: string[];      // Required consent forms (per-visit)
  intake?: string[];      // One-time intake forms
  aftercare?: string[];   // Post-treatment forms to send
}

/**
 * Tracks a patient's form status for a specific form
 */
export interface PatientFormStatus {
  id: string;
  patientId: string;
  formId: string;
  appointmentId?: string;  // Associated appointment (for per-visit forms)
  status: FormStatus;
  sentAt?: Date;
  viewedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;        // For per-visit forms, expires after appointment
  remindersSent: FormReminderType[];  // Track which reminders sent
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Form template definition (matches existing formTemplates structure)
 */
export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: FormCategory;
  requiredFor?: string[];  // Services requiring this form
  validFor: FormValidity;
  fields?: string[];
  estimatedTime?: string;
  message: string;         // SMS template with [LINK] placeholder
  previewContent?: {
    title: string;
    sections?: string[];
    instructions?: string[];
  };
}

/**
 * Form send request for the form service
 */
export interface FormSendRequest {
  patientId: string;
  phone: string;
  formIds: string[];
  appointmentId?: string;
  serviceName?: string;
}

/**
 * Result of sending forms
 */
export interface FormSendResult {
  success: boolean;
  formsSent: string[];
  formsSkipped: string[];  // Already completed or recently sent
  error?: string;
}

/**
 * Form reminder tracking per appointment
 */
export interface AppointmentFormReminders {
  appointmentId: string;
  remindersSent: {
    type: FormReminderType;
    sentAt: Date;
  }[];
}

/**
 * Check-in form validation result
 */
export interface CheckInFormValidation {
  allComplete: boolean;
  incompleteForms: string[];
  formNames: string[];
  formsLink: string;
}
