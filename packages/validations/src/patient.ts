/**
 * Patient validation schemas
 */

import { z } from 'zod';
import { uuidSchema, emailSchema, phoneSchema, dateSchema, addressSchema, paginationSchema, searchQuerySchema } from './common';

// Gender enum
export const genderSchema = z.enum(['male', 'female', 'other', 'prefer_not_to_say']);

// Patient status
export const patientStatusSchema = z.enum(['active', 'inactive', 'deceased']);

// Fitzpatrick skin type
export const fitzpatrickTypeSchema = z.enum(['I', 'II', 'III', 'IV', 'V', 'VI']);

// Alert severity
export const alertSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);

// Emergency contact
export const emergencyContactSchema = z.object({
  name: z.string().min(1).max(255),
  relationship: z.string().min(1).max(100),
  phone: phoneSchema,
  alternatePhone: phoneSchema.optional(),
});

// Communication preferences
export const communicationPreferencesSchema = z.object({
  preferredMethod: z.enum(['email', 'sms', 'phone', 'none']).default('sms'),
  appointmentReminders: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  smsNotifications: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  language: z.string().default('en'),
});

// Privacy settings
export const privacySettingsSchema = z.object({
  shareWithFamily: z.boolean().default(false),
  allowPhotos: z.boolean().default(true),
  allowResearch: z.boolean().default(false),
  restrictedProviders: z.array(uuidSchema).optional(),
  privacyMode: z.boolean().default(false),
});

// Allergy
export const allergySchema = z.object({
  id: z.string().optional(),
  allergen: z.string().min(1).max(255),
  reaction: z.string().max(500),
  severity: alertSeveritySchema,
  onsetDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

// Medication
export const medicationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(255),
  dosage: z.string().max(100),
  frequency: z.string().max(100),
  startDate: z.string(),
  endDate: z.string().optional(),
  prescribedBy: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
});

// Medical alert
export const medicalAlertSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['allergy', 'condition', 'medication', 'contraindication', 'other']),
  severity: alertSeveritySchema,
  description: z.string().min(1).max(1000),
  addedDate: z.string(),
  addedBy: z.string(),
  active: z.boolean().default(true),
});

// Source/referral
export const patientSourceSchema = z.object({
  type: z.enum(['referral', 'online', 'walkin', 'advertising', 'other']),
  details: z.string().max(500).optional(),
  referredById: uuidSchema.optional(),
  referredByName: z.string().max(255).optional(),
});

// Create patient input
export const createPatientSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  middleName: z.string().max(100).optional(),
  preferredName: z.string().max(100).optional(),
  pronouns: z.string().max(50).optional(),
  dateOfBirth: dateSchema,
  gender: genderSchema.optional(),

  // Contact
  email: emailSchema.optional(),
  phone: phoneSchema,
  alternatePhone: phoneSchema.optional(),
  workPhone: phoneSchema.optional(),
  timezone: z.string().max(50).optional(),

  // Address
  address: addressSchema.optional(),

  // Emergency contact
  emergencyContact: emergencyContactSchema.optional(),

  // Medical info
  allergies: z.array(allergySchema).optional(),
  medications: z.array(medicationSchema).optional(),
  medicalAlerts: z.array(medicalAlertSchema).optional(),
  bloodType: z.string().max(10).optional(),

  // Aesthetic profile
  aestheticProfile: z.object({
    skinType: fitzpatrickTypeSchema.optional(),
    skinConcerns: z.array(z.string()).optional(),
    treatmentGoals: z.array(z.string()).optional(),
    contraindications: z.array(z.string()).optional(),
    photoConsent: z.boolean().optional(),
    photoConsentDate: z.string().optional(),
  }).optional(),

  // Source
  source: patientSourceSchema.optional(),

  // Provider
  primaryProviderId: uuidSchema.optional(),

  // Communication preferences
  communicationPreferences: communicationPreferencesSchema.optional(),
  privacySettings: privacySettingsSchema.optional(),

  // Consent
  photoConsent: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),

  // Notes
  generalNotes: z.string().max(5000).optional(),
  importantNotes: z.string().max(1000).optional(),

  // Tags
  tags: z.array(z.string()).optional(),
});

// Update patient input
export const updatePatientSchema = createPatientSchema.partial();

// Patient search/filter
export const patientSearchSchema = z.object({
  query: searchQuerySchema,
  status: patientStatusSchema.optional(),
  providerId: uuidSchema.optional(),
  lastVisitFrom: dateSchema.optional(),
  lastVisitTo: dateSchema.optional(),
  tags: z.array(z.string()).optional(),
  hasBalance: z.boolean().optional(),
  hasUpcomingAppointment: z.boolean().optional(),
  ...paginationSchema.shape,
});

// Patient ID param
export const patientIdParamSchema = z.object({
  patientId: uuidSchema,
});

// Type exports
export type Gender = z.infer<typeof genderSchema>;
export type PatientStatus = z.infer<typeof patientStatusSchema>;
export type FitzpatrickType = z.infer<typeof fitzpatrickTypeSchema>;
export type AlertSeverity = z.infer<typeof alertSeveritySchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type PatientSearch = z.infer<typeof patientSearchSchema>;
