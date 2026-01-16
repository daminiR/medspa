/**
 * Patient-facing AI Intent Categories
 * Simplified version of admin intents for patient portal chatbot
 *
 * HIPAA COMPLIANCE NOTE:
 * - No PHI stored in logs (only conversation IDs)
 * - Session-only storage (no server persistence)
 * - Production requires Google Cloud BAA + Vertex AI
 * - This mock implementation is for UI development only
 */

/**
 * Simplified patient-facing intents for the AI chatbot
 * Covers the most common patient interactions
 */
export enum PatientIntent {
  // Appointments
  APPOINTMENT_BOOKING = 'appointment_booking',
  APPOINTMENT_INQUIRY = 'appointment_inquiry',
  APPOINTMENT_CANCELLATION = 'appointment_cancellation',
  APPOINTMENT_RESCHEDULING = 'appointment_rescheduling',

  // Treatment Questions
  TREATMENT_QUESTION = 'treatment_question',
  POST_TREATMENT_FOLLOWUP = 'post_treatment_followup',
  SIDE_EFFECT_REPORT = 'side_effect_report',
  PRE_TREATMENT_QUESTION = 'pre_treatment_question',

  // General
  PRICING_INQUIRY = 'pricing_inquiry',
  LOCATION_HOURS = 'location_hours',
  GENERAL_INQUIRY = 'general_inquiry',
  FEEDBACK = 'feedback',

  // Critical
  EMERGENCY_MEDICAL = 'emergency_medical',
  URGENT_CONCERN = 'urgent_concern',
}

/**
 * Urgency levels for message classification
 */
export enum UrgencyLevel {
  CRITICAL = 'critical',   // Immediate attention - potential emergency
  HIGH = 'high',           // Within 30 minutes
  MEDIUM = 'medium',       // Within 2 hours
  LOW = 'low',             // Within 24 hours
  NONE = 'none',           // No urgency
}

/**
 * Sentiment for patient messages
 */
export enum PatientSentiment {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  CONCERNED = 'concerned',
  FRUSTRATED = 'frustrated',
  URGENT = 'urgent',
}

/**
 * Human-readable labels for patient intents
 */
export const INTENT_LABELS: Record<PatientIntent, string> = {
  [PatientIntent.APPOINTMENT_BOOKING]: 'Book Appointment',
  [PatientIntent.APPOINTMENT_INQUIRY]: 'Appointment Question',
  [PatientIntent.APPOINTMENT_CANCELLATION]: 'Cancel Appointment',
  [PatientIntent.APPOINTMENT_RESCHEDULING]: 'Reschedule Appointment',
  [PatientIntent.TREATMENT_QUESTION]: 'Treatment Question',
  [PatientIntent.POST_TREATMENT_FOLLOWUP]: 'Post-Treatment Follow-up',
  [PatientIntent.SIDE_EFFECT_REPORT]: 'Side Effect Report',
  [PatientIntent.PRE_TREATMENT_QUESTION]: 'Pre-Treatment Question',
  [PatientIntent.PRICING_INQUIRY]: 'Pricing Question',
  [PatientIntent.LOCATION_HOURS]: 'Location & Hours',
  [PatientIntent.GENERAL_INQUIRY]: 'General Question',
  [PatientIntent.FEEDBACK]: 'Feedback',
  [PatientIntent.EMERGENCY_MEDICAL]: 'Medical Emergency',
  [PatientIntent.URGENT_CONCERN]: 'Urgent Concern',
};

/**
 * Suggested quick actions for each intent
 */
export const INTENT_ACTIONS: Record<PatientIntent, string[]> = {
  [PatientIntent.APPOINTMENT_BOOKING]: ['View Available Times', 'Browse Services', 'Call Office'],
  [PatientIntent.APPOINTMENT_INQUIRY]: ['View My Appointments', 'Check-In', 'Call Office'],
  [PatientIntent.APPOINTMENT_CANCELLATION]: ['Cancel Appointment', 'Reschedule Instead', 'Call Office'],
  [PatientIntent.APPOINTMENT_RESCHEDULING]: ['View Available Times', 'Keep Current Time', 'Call Office'],
  [PatientIntent.TREATMENT_QUESTION]: ['View Treatment Info', 'Book Consultation', 'Call Office'],
  [PatientIntent.POST_TREATMENT_FOLLOWUP]: ['View Aftercare', 'Report Issue', 'Call Office'],
  [PatientIntent.SIDE_EFFECT_REPORT]: ['Speak to Nurse', 'Call Office Now', 'Emergency: Call 911'],
  [PatientIntent.PRE_TREATMENT_QUESTION]: ['View Pre-Treatment Guide', 'Ask Provider', 'Call Office'],
  [PatientIntent.PRICING_INQUIRY]: ['View Pricing', 'View Packages', 'Book Consultation'],
  [PatientIntent.LOCATION_HOURS]: ['Get Directions', 'View Hours', 'Call Office'],
  [PatientIntent.GENERAL_INQUIRY]: ['Browse FAQ', 'Speak to Staff', 'Call Office'],
  [PatientIntent.FEEDBACK]: ['Submit Feedback', 'Leave Review', 'Speak to Manager'],
  [PatientIntent.EMERGENCY_MEDICAL]: ['Call 911', 'Call Office Emergency Line', 'Go to ER'],
  [PatientIntent.URGENT_CONCERN]: ['Call Office Now', 'Speak to Nurse', 'Emergency: Call 911'],
};
