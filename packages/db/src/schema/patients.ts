// Patients Schema
import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb, decimal, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { timestamps, auditColumns, genderEnum } from './common';
import { users } from './users';

// Patient status enum
export const patientStatusEnum = ['active', 'inactive', 'deceased'] as const;
export const fitzpatrickTypeEnum = ['I', 'II', 'III', 'IV', 'V', 'VI'] as const;

// Main patients table
export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientNumber: varchar('patient_number', { length: 50 }).unique().notNull(),
  firebaseUid: varchar('firebase_uid', { length: 255 }).unique(), // For patient portal login

  // Demographics
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  middleName: varchar('middle_name', { length: 100 }),
  preferredName: varchar('preferred_name', { length: 100 }),
  pronouns: varchar('pronouns', { length: 50 }),
  dateOfBirth: date('date_of_birth').notNull(),
  gender: varchar('gender', { length: 20 }).$type<typeof genderEnum[number]>(),

  // Contact
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }).notNull(),
  alternatePhone: varchar('alternate_phone', { length: 50 }),
  workPhone: varchar('work_phone', { length: 50 }),
  timezone: varchar('timezone', { length: 50 }),

  // Address
  address: jsonb('address').$type<{
    street: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  }>(),

  // Emergency contact
  emergencyContact: jsonb('emergency_contact').$type<{
    name: string;
    relationship: string;
    phone: string;
    alternatePhone?: string;
  }>(),

  // Medical info - ENCRYPTED at application level
  allergies: jsonb('allergies').$type<{
    id: string;
    allergen: string;
    reaction: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    onsetDate?: string;
    notes?: string;
  }[]>(),
  medications: jsonb('medications').$type<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
    prescribedBy?: string;
    notes?: string;
  }[]>(),
  medicalHistory: jsonb('medical_history').$type<{
    id: string;
    condition: string;
    diagnosedDate?: string;
    status: 'active' | 'resolved' | 'managed';
    notes?: string;
  }[]>(),
  bloodType: varchar('blood_type', { length: 10 }),

  // Medical alerts
  medicalAlerts: jsonb('medical_alerts').$type<{
    id: string;
    type: 'allergy' | 'condition' | 'medication' | 'contraindication' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    addedDate: string;
    addedBy: string;
    active: boolean;
  }[]>(),

  // Aesthetic profile
  aestheticProfile: jsonb('aesthetic_profile').$type<{
    skinType?: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
    skinConcerns?: string[];
    treatmentGoals?: string[];
    contraindications?: string[];
    photoConsent?: boolean;
    photoConsentDate?: string;
  }>(),

  // Treatment tracking
  treatmentTracking: jsonb('treatment_tracking').$type<{
    botoxUnits?: { [area: string]: number };
    fillerVolumes?: { [area: string]: number };
    lastTreatmentDates?: { [treatment: string]: string };
    nextRecommended?: string;
    favoriteProducts?: string[];
  }>(),

  // Status & Visits
  status: varchar('status', { length: 20 }).default('active').$type<typeof patientStatusEnum[number]>(),
  registrationDate: timestamp('registration_date', { withTimezone: true }).defaultNow(),
  firstVisit: timestamp('first_visit', { withTimezone: true }),
  lastVisit: timestamp('last_visit', { withTimezone: true }),
  totalVisits: integer('total_visits').default(0),

  // Source/Referral
  source: jsonb('source').$type<{
    type: 'referral' | 'online' | 'walkin' | 'advertising' | 'other';
    details?: string;
    referredById?: string;
    referredByName?: string;
  }>(),

  // Primary provider
  primaryProviderId: uuid('primary_provider_id').references(() => users.id),

  // Financial
  balance: decimal('balance', { precision: 10, scale: 2 }).default('0'),
  credits: decimal('credits', { precision: 10, scale: 2 }).default('0'),
  lifetimeValue: decimal('lifetime_value', { precision: 12, scale: 2 }).default('0'),

  // Communication preferences
  communicationPreferences: jsonb('communication_preferences').$type<{
    preferredMethod: 'email' | 'sms' | 'phone' | 'none';
    appointmentReminders: boolean;
    marketingEmails: boolean;
    smsNotifications: boolean;
    emailNotifications: boolean;
    language: string;
  }>(),

  // Appointment preferences
  appointmentPreferences: jsonb('appointment_preferences').$type<{
    preferredDays?: string[];
    preferredTimes?: string[];
    preferredProvider?: string;
    notes?: string;
  }>(),

  // Privacy settings
  privacySettings: jsonb('privacy_settings').$type<{
    shareWithFamily: boolean;
    allowPhotos: boolean;
    allowResearch: boolean;
    restrictedProviders?: string[];
    privacyMode: boolean;
  }>(),

  // Consent status
  photoConsent: boolean('photo_consent').default(false),
  marketingConsent: boolean('marketing_consent').default(false),

  // Notes
  generalNotes: text('general_notes'),
  internalNotes: text('internal_notes'), // Staff-only
  importantNotes: text('important_notes'), // Alert-style

  // Tags & Custom fields
  tags: jsonb('tags').$type<string[]>(),
  customFields: jsonb('custom_fields').$type<Record<string, unknown>>(),

  // Stripe customer ID
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),

  ...auditColumns,
});

// Patient insurance policies
export const patientInsurance = pgTable('patient_insurance', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  provider: varchar('provider', { length: 255 }).notNull(),
  policyNumber: varchar('policy_number', { length: 100 }).notNull(),
  groupNumber: varchar('group_number', { length: 100 }),
  subscriberName: varchar('subscriber_name', { length: 255 }),
  subscriberRelation: varchar('subscriber_relation', { length: 50 }),
  effectiveDate: date('effective_date'),
  expirationDate: date('expiration_date'),
  copay: decimal('copay', { precision: 10, scale: 2 }),
  deductible: decimal('deductible', { precision: 10, scale: 2 }),
  isPrimary: boolean('is_primary').default(true),
  isActive: boolean('is_active').default(true),
  ...timestamps,
});

// Patient payment methods (Stripe references)
export const patientPaymentMethods = pgTable('patient_payment_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  stripePaymentMethodId: varchar('stripe_payment_method_id', { length: 255 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'card', 'bank_account'
  isDefault: boolean('is_default').default(false),
  cardBrand: varchar('card_brand', { length: 50 }),
  cardLast4: varchar('card_last4', { length: 4 }),
  expiryMonth: integer('expiry_month'),
  expiryYear: integer('expiry_year'),
  addedDate: timestamp('added_date', { withTimezone: true }).defaultNow(),
  notes: text('notes'),
  ...timestamps,
});

// Patient family relationships
export const patientRelationships = pgTable('patient_relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  relatedPatientId: uuid('related_patient_id').notNull().references(() => patients.id),
  relationship: varchar('relationship', { length: 50 }).$type<'spouse' | 'parent' | 'child' | 'sibling' | 'guardian' | 'other'>(),
  isPrimaryContact: boolean('is_primary_contact').default(false),
  hasFinancialAccess: boolean('has_financial_access').default(false),
  hasMedicalAccess: boolean('has_medical_access').default(false),
  notes: text('notes'),
  ...timestamps,
});

// Patient notes (separate table for better querying)
export const patientNotes = pgTable('patient_notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  appointmentId: uuid('appointment_id'), // Null for patient-level notes
  content: text('content').notNull(),
  authorId: uuid('author_id').notNull().references(() => users.id),
  isImportant: boolean('is_important').default(false),
  isInternal: boolean('is_internal').default(true), // Staff-only
  ...timestamps,
});

// Relations
export const patientsRelations = relations(patients, ({ one, many }) => ({
  primaryProvider: one(users, {
    fields: [patients.primaryProviderId],
    references: [users.id],
  }),
  insurance: many(patientInsurance),
  paymentMethods: many(patientPaymentMethods),
  relationships: many(patientRelationships),
  notes: many(patientNotes),
}));

export const patientInsuranceRelations = relations(patientInsurance, ({ one }) => ({
  patient: one(patients, {
    fields: [patientInsurance.patientId],
    references: [patients.id],
  }),
}));

export const patientPaymentMethodsRelations = relations(patientPaymentMethods, ({ one }) => ({
  patient: one(patients, {
    fields: [patientPaymentMethods.patientId],
    references: [patients.id],
  }),
}));

export const patientNotesRelations = relations(patientNotes, ({ one }) => ({
  patient: one(patients, {
    fields: [patientNotes.patientId],
    references: [patients.id],
  }),
  author: one(users, {
    fields: [patientNotes.authorId],
    references: [users.id],
  }),
}));
