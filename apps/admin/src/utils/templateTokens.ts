/**
 * SMS Template Token Utilities
 *
 * Provides token definitions, replacement logic, and preview generation
 * for SMS reminder templates.
 */

// =============================================================================
// Token Definitions
// =============================================================================

export interface TokenDefinition {
  token: string;
  description: string;
  example: string;
  category: 'patient' | 'appointment' | 'location' | 'link';
}

export const SMS_TEMPLATE_TOKENS: TokenDefinition[] = [
  // Patient tokens
  { token: '{{firstName}}', description: 'Patient first name', example: 'Sarah', category: 'patient' },
  { token: '{{lastName}}', description: 'Patient last name', example: 'Johnson', category: 'patient' },
  { token: '{{fullName}}', description: 'Patient full name', example: 'Sarah Johnson', category: 'patient' },

  // Appointment tokens
  { token: '{{appointmentDate}}', description: 'Appointment date', example: 'Wed, Jan 15', category: 'appointment' },
  { token: '{{appointmentTime}}', description: 'Appointment time', example: '2:30 PM', category: 'appointment' },
  { token: '{{serviceName}}', description: 'Service/treatment name', example: 'Botox', category: 'appointment' },
  { token: '{{providerName}}', description: 'Provider name', example: 'Dr. Smith', category: 'appointment' },
  { token: '{{duration}}', description: 'Appointment duration', example: '60 min', category: 'appointment' },

  // Location tokens
  { token: '{{locationName}}', description: 'Clinic/spa name', example: 'Luxe Medical Spa', category: 'location' },
  { token: '{{locationPhone}}', description: 'Clinic phone number', example: '555-0100', category: 'location' },
  { token: '{{locationAddress}}', description: 'Clinic address', example: '123 Main St', category: 'location' },

  // Link tokens
  { token: '{{bookingLink}}', description: 'Online booking link', example: 'book.luxespa.com', category: 'link' },
  { token: '{{rescheduleLink}}', description: 'Reschedule link', example: 'luxespa.com/reschedule', category: 'link' },
  { token: '{{confirmLink}}', description: 'Confirmation link', example: 'luxespa.com/confirm', category: 'link' },
];

// Group tokens by category for UI display
export const TOKEN_CATEGORIES = {
  patient: SMS_TEMPLATE_TOKENS.filter(t => t.category === 'patient'),
  appointment: SMS_TEMPLATE_TOKENS.filter(t => t.category === 'appointment'),
  location: SMS_TEMPLATE_TOKENS.filter(t => t.category === 'location'),
  link: SMS_TEMPLATE_TOKENS.filter(t => t.category === 'link'),
};

// =============================================================================
// Default Fallback Values
// =============================================================================

export const DEFAULT_FALLBACKS: Record<string, string> = {
  firstName: 'there',
  lastName: '',
  fullName: 'there',
  appointmentDate: '[date]',
  appointmentTime: '[time]',
  serviceName: 'your appointment',
  providerName: 'your provider',
  duration: '60 min',
  locationName: 'our clinic',
  locationPhone: '555-0100',
  locationAddress: '',
  bookingLink: '',
  rescheduleLink: '',
  confirmLink: '',
};

// =============================================================================
// Token Replacement Functions
// =============================================================================

export interface TemplateData {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  serviceName?: string;
  providerName?: string;
  duration?: string;
  locationName?: string;
  locationPhone?: string;
  locationAddress?: string;
  bookingLink?: string;
  rescheduleLink?: string;
  confirmLink?: string;
  [key: string]: string | undefined;
}

/**
 * Replace all tokens in a template with actual values
 * Uses fallback values for missing data
 */
export function replaceTokens(
  template: string,
  data: TemplateData,
  useFallbacks: boolean = true
): string {
  let result = template;

  // Replace each known token
  for (const tokenDef of SMS_TEMPLATE_TOKENS) {
    const key = tokenDef.token.replace(/[{}]/g, '');
    const value = data[key];
    const fallback = useFallbacks ? DEFAULT_FALLBACKS[key] : '';

    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value || fallback || '');
  }

  return result;
}

/**
 * Generate a preview of the template with example values
 */
export function generatePreview(template: string): string {
  const exampleData: TemplateData = {};

  for (const tokenDef of SMS_TEMPLATE_TOKENS) {
    const key = tokenDef.token.replace(/[{}]/g, '');
    exampleData[key] = tokenDef.example;
  }

  return replaceTokens(template, exampleData, false);
}

/**
 * Extract all tokens used in a template
 */
export function extractTokens(template: string): string[] {
  const tokenRegex = /\{\{(\w+)\}\}/g;
  const tokens: string[] = [];
  let match;

  while ((match = tokenRegex.exec(template)) !== null) {
    if (!tokens.includes(match[1])) {
      tokens.push(match[1]);
    }
  }

  return tokens;
}

/**
 * Validate that all tokens in a template are valid
 */
export function validateTokens(template: string): { valid: boolean; invalidTokens: string[] } {
  const usedTokens = extractTokens(template);
  const validTokenKeys = SMS_TEMPLATE_TOKENS.map(t => t.token.replace(/[{}]/g, ''));
  const invalidTokens = usedTokens.filter(t => !validTokenKeys.includes(t));

  return {
    valid: invalidTokens.length === 0,
    invalidTokens,
  };
}

// =============================================================================
// Character Count Utilities
// =============================================================================

export const SMS_LIMITS = {
  SINGLE_SEGMENT: 160,
  WARNING_THRESHOLD: 140,
  MULTI_SEGMENT: 153, // chars per segment after first
};

export interface CharacterCountResult {
  count: number;
  segments: number;
  status: 'ok' | 'warning' | 'over';
  message: string;
}

/**
 * Calculate SMS character count and segments
 * Note: Tokens count as their average replacement length for estimation
 */
export function calculateCharacterCount(template: string): CharacterCountResult {
  // For estimation, replace tokens with their example values
  const preview = generatePreview(template);
  const count = preview.length;

  let segments: number;
  if (count <= SMS_LIMITS.SINGLE_SEGMENT) {
    segments = 1;
  } else {
    // First segment is 160, subsequent are 153
    segments = 1 + Math.ceil((count - SMS_LIMITS.SINGLE_SEGMENT) / SMS_LIMITS.MULTI_SEGMENT);
  }

  let status: 'ok' | 'warning' | 'over';
  let message: string;

  if (count <= SMS_LIMITS.WARNING_THRESHOLD) {
    status = 'ok';
    message = `${count} characters (${SMS_LIMITS.SINGLE_SEGMENT - count} remaining)`;
  } else if (count <= SMS_LIMITS.SINGLE_SEGMENT) {
    status = 'warning';
    message = `${count} characters - approaching limit (${SMS_LIMITS.SINGLE_SEGMENT - count} remaining)`;
  } else {
    status = 'over';
    message = `${count} characters - will send as ${segments} SMS segments (extra charges may apply)`;
  }

  return { count, segments, status, message };
}

// =============================================================================
// HIPAA Compliance Helpers
// =============================================================================

const HIPAA_SENSITIVE_TERMS = [
  'diagnosis',
  'condition',
  'treatment for',
  'medication',
  'prescription',
  'hiv',
  'cancer',
  'mental health',
  'psychiatric',
  'addiction',
  'substance',
  'std',
  'pregnant',
  'pregnancy',
];

/**
 * Check if template contains potentially HIPAA-sensitive content
 */
export function checkHIPAACompliance(template: string): { compliant: boolean; warnings: string[] } {
  const lowerTemplate = template.toLowerCase();
  const warnings: string[] = [];

  for (const term of HIPAA_SENSITIVE_TERMS) {
    if (lowerTemplate.includes(term)) {
      warnings.push(`Contains potentially sensitive term: "${term}"`);
    }
  }

  // Check if it mentions specific medical procedures that might reveal conditions
  if (/\b(hiv test|std test|pregnancy test|mental health|psychiatric|addiction)\b/i.test(template)) {
    warnings.push('Template may reveal protected health information (PHI)');
  }

  return {
    compliant: warnings.length === 0,
    warnings,
  };
}

// =============================================================================
// Template Categories (for reminder types)
// =============================================================================

export type ReminderType =
  | '24hr_reminder'
  | '1hr_reminder'
  | 'confirmation'
  | 'reschedule'
  | 'post_treatment';

export const REMINDER_TYPE_INFO: Record<ReminderType, { label: string; description: string; timing: string }> = {
  '24hr_reminder': {
    label: '24-Hour Reminder',
    description: 'Sent 24 hours before the appointment',
    timing: '24 hours before',
  },
  '1hr_reminder': {
    label: '1-Hour Reminder',
    description: 'Sent 1 hour before the appointment',
    timing: '1 hour before',
  },
  'confirmation': {
    label: 'Booking Confirmation',
    description: 'Sent immediately after booking',
    timing: 'Immediately',
  },
  'reschedule': {
    label: 'Reschedule Offer',
    description: 'Sent when an opening becomes available',
    timing: 'On availability',
  },
  'post_treatment': {
    label: 'Post-Treatment Follow-up',
    description: 'Sent after the appointment for check-in',
    timing: '24-48 hours after',
  },
};
