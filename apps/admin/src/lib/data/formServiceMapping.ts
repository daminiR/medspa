/**
 * Form-Service Mapping
 *
 * Maps services to their required forms for the automated form lifecycle.
 * Forms are categorized as:
 * - consent: Required per-visit consent forms
 * - intake: One-time intake forms (HIPAA, new patient)
 * - aftercare: Post-treatment instruction forms
 */

import { ServiceFormRequirement, FormTemplate, FormValidity } from '@/types/forms';

/**
 * Service to form requirements mapping
 * Key is the service name (case-insensitive matching recommended)
 */
export const SERVICE_FORM_REQUIREMENTS: Record<string, ServiceFormRequirement> = {
  // Aesthetics - Injectables
  'Botox': {
    consent: ['form-botox'],
    intake: ['form-hipaa', 'form-general'],
    aftercare: ['form-botox-aftercare']
  },
  'Botox Consultation': {
    consent: ['form-botox'],
    intake: ['form-hipaa', 'form-general'],
    aftercare: []
  },
  'Dysport': {
    consent: ['form-botox'],  // Same consent as Botox (neurotoxin)
    intake: ['form-hipaa', 'form-general'],
    aftercare: ['form-botox-aftercare']
  },
  'Xeomin': {
    consent: ['form-botox'],  // Same consent as Botox (neurotoxin)
    intake: ['form-hipaa', 'form-general'],
    aftercare: ['form-botox-aftercare']
  },
  'Lip Filler': {
    consent: ['form-filler'],
    intake: ['form-hipaa', 'form-general'],
    aftercare: ['form-filler-aftercare']
  },
  'Dermal Fillers': {
    consent: ['form-filler'],
    intake: ['form-hipaa', 'form-general'],
    aftercare: ['form-filler-aftercare']
  },
  'Cheek Filler': {
    consent: ['form-filler'],
    intake: ['form-hipaa', 'form-general'],
    aftercare: ['form-filler-aftercare']
  },
  'Jawline Filler': {
    consent: ['form-filler'],
    intake: ['form-hipaa', 'form-general'],
    aftercare: ['form-filler-aftercare']
  },

  // Aesthetics - Laser Treatments
  'CO2 Laser Resurfacing': {
    consent: ['form-laser'],
    intake: ['form-hipaa', 'form-general'],
    aftercare: ['form-laser-aftercare']
  },
  'IPL Photo Facial': {
    consent: ['form-laser'],
    intake: ['form-hipaa', 'form-general'],
    aftercare: ['form-laser-aftercare']
  },

  // Aesthetics - Skin Treatments
  'Chemical Peel': {
    consent: ['form-chemical-peel'],
    intake: ['form-hipaa', 'form-general'],
    aftercare: ['form-chemical-peel-aftercare']
  },
  'Microneedling': {
    consent: ['form-microneedling'],
    intake: ['form-hipaa', 'form-general'],
    aftercare: ['form-microneedling-aftercare']
  },

  // Massage Services
  '30 Minute Massage': {
    consent: ['form-massage'],
    intake: ['form-hipaa', 'form-general'],
    aftercare: []
  },
  '60 Minute Massage': {
    consent: ['form-massage'],
    intake: ['form-hipaa', 'form-general'],
    aftercare: []
  },
  '90 Minute Massage': {
    consent: ['form-massage'],
    intake: ['form-hipaa', 'form-general'],
    aftercare: []
  },

  // Physiotherapy
  'Clinical Pilates': {
    consent: ['form-physio'],
    intake: ['form-hipaa', 'form-general'],
    aftercare: []
  },
  'Sports Physiotherapy': {
    consent: ['form-physio'],
    intake: ['form-hipaa', 'form-general'],
    aftercare: []
  },

  // Chiropractic
  'Adjustment': {
    consent: ['form-chiro'],
    intake: ['form-hipaa', 'form-general'],
    aftercare: []
  },
  'Spinal Adjustment': {
    consent: ['form-chiro'],
    intake: ['form-hipaa', 'form-general'],
    aftercare: []
  },
  'X-Ray Consultation': {
    consent: ['form-xray'],
    intake: ['form-hipaa', 'form-general'],
    aftercare: []
  }
};

/**
 * Form templates with metadata
 * Matches the structure in messages/page.tsx but centralized here
 */
export const FORM_TEMPLATES: Record<string, FormTemplate> = {
  // Consent Forms - Per Visit
  'form-botox': {
    id: 'form-botox',
    name: 'Botox Consent Form',
    description: 'Consent for neurotoxin injections (Botox, Dysport, Xeomin)',
    category: 'consent',
    requiredFor: ['Botox', 'Dysport', 'Xeomin', 'Botox Consultation'],
    validFor: 'per-visit',
    fields: ['medical_history', 'allergies', 'medications', 'pregnancy_status', 'signature'],
    estimatedTime: '5-7 minutes',
    message: 'Please complete your Botox consent form before your appointment: [LINK]'
  },
  'form-filler': {
    id: 'form-filler',
    name: 'Dermal Filler Consent Form',
    description: 'Consent for dermal filler injections',
    category: 'consent',
    requiredFor: ['Lip Filler', 'Dermal Fillers', 'Cheek Filler', 'Jawline Filler'],
    validFor: 'per-visit',
    fields: ['medical_history', 'allergies', 'medications', 'pregnancy_status', 'signature'],
    estimatedTime: '5-7 minutes',
    message: 'Please complete your filler consent form before your appointment: [LINK]'
  },
  'form-laser': {
    id: 'form-laser',
    name: 'Laser Treatment Consent Form',
    description: 'Consent for laser procedures',
    category: 'consent',
    requiredFor: ['CO2 Laser Resurfacing', 'IPL Photo Facial'],
    validFor: 'per-visit',
    fields: ['medical_history', 'skin_type', 'sun_exposure', 'medications', 'signature'],
    estimatedTime: '5-7 minutes',
    message: 'Please complete your laser treatment consent form before your appointment: [LINK]'
  },
  'form-chemical-peel': {
    id: 'form-chemical-peel',
    name: 'Chemical Peel Consent Form',
    description: 'Consent for chemical peel treatments',
    category: 'consent',
    requiredFor: ['Chemical Peel'],
    validFor: 'per-visit',
    fields: ['medical_history', 'skin_type', 'retinoid_use', 'signature'],
    estimatedTime: '5 minutes',
    message: 'Please complete your chemical peel consent form before your appointment: [LINK]'
  },
  'form-microneedling': {
    id: 'form-microneedling',
    name: 'Microneedling Consent Form',
    description: 'Consent for microneedling treatment',
    category: 'consent',
    requiredFor: ['Microneedling'],
    validFor: 'per-visit',
    fields: ['medical_history', 'skin_conditions', 'medications', 'signature'],
    estimatedTime: '5 minutes',
    message: 'Please complete your microneedling consent form before your appointment: [LINK]'
  },
  'form-massage': {
    id: 'form-massage',
    name: 'Massage Therapy Consent Form',
    description: 'Consent for massage therapy',
    category: 'consent',
    requiredFor: ['30 Minute Massage', '60 Minute Massage', '90 Minute Massage'],
    validFor: '1-year',
    fields: ['medical_history', 'areas_of_concern', 'pressure_preference', 'signature'],
    estimatedTime: '3 minutes',
    message: 'Please complete your massage consent form before your appointment: [LINK]'
  },
  'form-physio': {
    id: 'form-physio',
    name: 'Physiotherapy Consent Form',
    description: 'Consent for physiotherapy services',
    category: 'consent',
    requiredFor: ['Clinical Pilates', 'Sports Physiotherapy'],
    validFor: '1-year',
    fields: ['medical_history', 'injury_history', 'current_medications', 'signature'],
    estimatedTime: '5 minutes',
    message: 'Please complete your physiotherapy consent form before your appointment: [LINK]'
  },
  'form-chiro': {
    id: 'form-chiro',
    name: 'Chiropractic Consent Form',
    description: 'Consent for chiropractic treatment',
    category: 'consent',
    requiredFor: ['Adjustment', 'Spinal Adjustment'],
    validFor: '1-year',
    fields: ['medical_history', 'spine_history', 'current_symptoms', 'signature'],
    estimatedTime: '5 minutes',
    message: 'Please complete your chiropractic consent form before your appointment: [LINK]'
  },
  'form-xray': {
    id: 'form-xray',
    name: 'X-Ray Consent Form',
    description: 'Consent for diagnostic X-ray imaging',
    category: 'consent',
    requiredFor: ['X-Ray Consultation'],
    validFor: 'per-visit',
    fields: ['pregnancy_status', 'previous_imaging', 'signature'],
    estimatedTime: '2 minutes',
    message: 'Please complete your X-ray consent form before your appointment: [LINK]'
  },

  // Intake Forms - One Time
  'form-hipaa': {
    id: 'form-hipaa',
    name: 'HIPAA Privacy Notice',
    description: 'Acknowledgment of privacy practices',
    category: 'intake',
    validFor: 'permanent',
    fields: ['acknowledgment', 'signature'],
    estimatedTime: '3 minutes',
    message: 'Please review and sign our HIPAA Privacy Notice: [LINK]'
  },
  'form-general': {
    id: 'form-general',
    name: 'New Patient Intake Form',
    description: 'Demographics, medical history, and insurance information',
    category: 'intake',
    validFor: 'permanent',
    fields: ['demographics', 'medical_history', 'insurance', 'emergency_contact', 'signature'],
    estimatedTime: '10-15 minutes',
    message: 'Please complete your new patient intake form: [LINK]'
  },

  // Aftercare Forms
  'form-botox-aftercare': {
    id: 'form-botox-aftercare',
    name: 'Botox Aftercare Instructions',
    description: 'Post-treatment care for neurotoxin injections',
    category: 'aftercare',
    validFor: 'per-visit',
    estimatedTime: '2 minutes',
    message: 'Here are your Botox aftercare instructions: [LINK]'
  },
  'form-filler-aftercare': {
    id: 'form-filler-aftercare',
    name: 'Filler Aftercare Instructions',
    description: 'Post-treatment care for dermal fillers',
    category: 'aftercare',
    validFor: 'per-visit',
    estimatedTime: '2 minutes',
    message: 'Here are your filler aftercare instructions: [LINK]'
  },
  'form-laser-aftercare': {
    id: 'form-laser-aftercare',
    name: 'Laser Aftercare Instructions',
    description: 'Post-treatment care for laser procedures',
    category: 'aftercare',
    validFor: 'per-visit',
    estimatedTime: '3 minutes',
    message: 'Here are your laser treatment aftercare instructions: [LINK]'
  },
  'form-chemical-peel-aftercare': {
    id: 'form-chemical-peel-aftercare',
    name: 'Chemical Peel Aftercare Instructions',
    description: 'Post-treatment care for chemical peels',
    category: 'aftercare',
    validFor: 'per-visit',
    estimatedTime: '3 minutes',
    message: 'Here are your chemical peel aftercare instructions: [LINK]'
  },
  'form-microneedling-aftercare': {
    id: 'form-microneedling-aftercare',
    name: 'Microneedling Aftercare Instructions',
    description: 'Post-treatment care for microneedling',
    category: 'aftercare',
    validFor: 'per-visit',
    estimatedTime: '3 minutes',
    message: 'Here are your microneedling aftercare instructions: [LINK]'
  }
};

/**
 * Get required forms for a service
 * Returns all consent + intake forms needed
 */
export function getRequiredForms(serviceName: string): string[] {
  const requirement = SERVICE_FORM_REQUIREMENTS[serviceName];
  if (!requirement) {
    // Default to just HIPAA for unknown services
    return ['form-hipaa', 'form-general'];
  }

  return [...requirement.consent, ...(requirement.intake || [])];
}

/**
 * Get aftercare forms for a service
 */
export function getAftercareForms(serviceName: string): string[] {
  const requirement = SERVICE_FORM_REQUIREMENTS[serviceName];
  return requirement?.aftercare || [];
}

/**
 * Get form template by ID
 */
export function getFormTemplate(formId: string): FormTemplate | undefined {
  return FORM_TEMPLATES[formId];
}

/**
 * Get display name for a form
 */
export function getFormDisplayName(formId: string): string {
  return FORM_TEMPLATES[formId]?.name || formId;
}

/**
 * Get form validity period
 */
export function getFormValidity(formId: string): FormValidity {
  return FORM_TEMPLATES[formId]?.validFor || 'per-visit';
}

/**
 * Check if a form is a one-time form (permanent validity)
 */
export function isOneTimeForm(formId: string): boolean {
  return getFormValidity(formId) === 'permanent';
}

/**
 * Get estimated completion time for forms
 */
export function getEstimatedCompletionTime(formIds: string[]): string {
  let totalMinutes = 0;
  for (const formId of formIds) {
    const template = FORM_TEMPLATES[formId];
    if (template?.estimatedTime) {
      // Parse "5-7 minutes" or "10-15 minutes" -> take average
      const match = template.estimatedTime.match(/(\d+)(?:-(\d+))?/);
      if (match) {
        const min = parseInt(match[1], 10);
        const max = match[2] ? parseInt(match[2], 10) : min;
        totalMinutes += (min + max) / 2;
      }
    }
  }

  if (totalMinutes <= 5) return '~5 minutes';
  if (totalMinutes <= 10) return '~10 minutes';
  if (totalMinutes <= 15) return '~15 minutes';
  return `~${Math.ceil(totalMinutes)} minutes`;
}

/**
 * Get service form requirements with normalized service name lookup
 */
export function getServiceFormRequirements(serviceName: string): ServiceFormRequirement | undefined {
  // Try exact match first
  if (SERVICE_FORM_REQUIREMENTS[serviceName]) {
    return SERVICE_FORM_REQUIREMENTS[serviceName];
  }

  // Try case-insensitive match
  const lowerServiceName = serviceName.toLowerCase();
  for (const [key, value] of Object.entries(SERVICE_FORM_REQUIREMENTS)) {
    if (key.toLowerCase() === lowerServiceName) {
      return value;
    }
  }

  return undefined;
}

/**
 * Check which forms are incomplete for a patient's service
 * Used during check-in to validate form status
 *
 * @param completedForms - Array of form IDs the patient has completed
 * @param serviceName - The service they're scheduled for
 * @returns Array of incomplete form IDs
 */
export function checkIncompleteForms(
  completedForms: string[],
  serviceName: string
): string[] {
  const required = getRequiredForms(serviceName);
  return required.filter(formId => !completedForms.includes(formId));
}

/**
 * Get a formatted list of incomplete form names
 * Returns human-readable names joined with commas
 */
export function getIncompleteFormNames(
  completedForms: string[],
  serviceName: string
): string {
  const incomplete = checkIncompleteForms(completedForms, serviceName);
  return incomplete.map(id => getFormDisplayName(id)).join(', ');
}
