// Clinical Schema - Treatment Records, Photos, Consents
import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb, decimal, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { timestamps, auditColumns } from './common';
import { users } from './users';
import { patients } from './patients';
import { appointments } from './appointments';
import { services } from './services';

// Treatment records (charting)
export const treatmentRecords = pgTable('treatment_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  practitionerId: uuid('practitioner_id').notNull().references(() => users.id),
  serviceId: uuid('service_id').references(() => services.id),

  // Treatment details
  treatmentDate: timestamp('treatment_date', { withTimezone: true }).notNull(),
  chiefComplaint: text('chief_complaint'),
  subjective: text('subjective'), // SOAP notes
  objective: text('objective'),
  assessment: text('assessment'),
  plan: text('plan'),

  // Injectable-specific charting
  injectableData: jsonb('injectable_data').$type<{
    productId: string;
    productName: string;
    productType: 'neurotoxin' | 'filler';
    totalUnits?: number;
    totalVolume?: number;
    lotNumber: string;
    expirationDate: string;
    injectionPoints: {
      id: string;
      area: string;
      x: number;
      y: number;
      units?: number;
      depth?: string;
      technique?: string;
      notes?: string;
    }[];
    zones?: {
      id: string;
      name: string;
      units: number;
    }[];
  }>(),

  // Laser/device treatments
  deviceData: jsonb('device_data').$type<{
    deviceId: string;
    deviceName: string;
    settings: {
      parameter: string;
      value: string | number;
    }[];
    treatedAreas: string[];
    passCount?: number;
    energy?: number;
    pulseWidth?: number;
    spotSize?: number;
    coolingSetting?: string;
    notes?: string;
  }>(),

  // Vital signs (if recorded)
  vitals: jsonb('vitals').$type<{
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  }>(),

  // Pre/post treatment
  preTreatmentNotes: text('pre_treatment_notes'),
  postTreatmentNotes: text('post_treatment_notes'),
  aftercareProvided: text('aftercare_provided'),
  patientInstructions: text('patient_instructions'),

  // Follow-up
  followUpDate: date('follow_up_date'),
  followUpNotes: text('follow_up_notes'),

  // Status
  status: varchar('status', { length: 20 }).default('draft').$type<'draft' | 'in_progress' | 'completed' | 'signed'>(),
  signedAt: timestamp('signed_at', { withTimezone: true }),
  signedBy: uuid('signed_by').references(() => users.id),

  // Audit
  lockedAt: timestamp('locked_at', { withTimezone: true }),
  lockedBy: uuid('locked_by').references(() => users.id),
  amendments: jsonb('amendments').$type<{
    date: string;
    by: string;
    reason: string;
    changes: Record<string, unknown>;
  }[]>(),

  ...auditColumns,
});

// Clinical photos
export const clinicalPhotos = pgTable('clinical_photos', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  treatmentRecordId: uuid('treatment_record_id').references(() => treatmentRecords.id),
  appointmentId: uuid('appointment_id').references(() => appointments.id),

  // Photo details
  type: varchar('type', { length: 20 }).$type<'before' | 'after' | 'progress' | 'comparison' | 'document'>(),
  angle: varchar('angle', { length: 50 }), // 'front', 'left', 'right', '45-left', etc.
  bodyArea: varchar('body_area', { length: 100 }),

  // Storage
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  filename: varchar('filename', { length: 255 }),
  mimeType: varchar('mime_type', { length: 100 }),
  fileSize: integer('file_size'),

  // Metadata
  takenAt: timestamp('taken_at', { withTimezone: true }).notNull(),
  takenBy: uuid('taken_by').references(() => users.id),
  deviceInfo: jsonb('device_info').$type<{
    device?: string;
    camera?: string;
    settings?: Record<string, unknown>;
  }>(),

  // Annotations
  annotations: jsonb('annotations').$type<{
    id: string;
    type: 'text' | 'arrow' | 'circle' | 'line' | 'measurement';
    x: number;
    y: number;
    data: Record<string, unknown>;
  }[]>(),

  // Privacy
  isPrivate: boolean('is_private').default(false),
  consentRequired: boolean('consent_required').default(true),
  consentObtained: boolean('consent_obtained').default(false),

  // Status
  isActive: boolean('is_active').default(true),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: uuid('deleted_by'),
  deletionReason: text('deletion_reason'),

  notes: text('notes'),
  tags: jsonb('tags').$type<string[]>(),

  ...auditColumns,
});

// Consent forms (templates)
export const consentFormTemplates = pgTable('consent_form_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  version: varchar('version', { length: 20 }).notNull(),
  category: varchar('category', { length: 50 }).$type<
    'general' | 'treatment' | 'photo' | 'hipaa' | 'financial' | 'marketing' | 'research'
  >(),

  // Content
  content: text('content').notNull(), // HTML or Markdown
  requiredFields: jsonb('required_fields').$type<{
    name: string;
    type: 'signature' | 'initials' | 'checkbox' | 'text' | 'date';
    label: string;
    required: boolean;
  }[]>(),

  // Associated services (if service-specific)
  serviceIds: jsonb('service_ids').$type<string[]>(),

  // Status
  isActive: boolean('is_active').default(true),
  effectiveDate: date('effective_date'),
  expirationDate: date('expiration_date'),

  // Audit
  approvedBy: uuid('approved_by').references(() => users.id),
  approvedAt: timestamp('approved_at', { withTimezone: true }),

  ...auditColumns,
});

// Signed consents
export const signedConsents = pgTable('signed_consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').notNull().references(() => consentFormTemplates.id),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  appointmentId: uuid('appointment_id').references(() => appointments.id),
  treatmentRecordId: uuid('treatment_record_id').references(() => treatmentRecords.id),

  // Signed data
  signedData: jsonb('signed_data').$type<Record<string, unknown>>(),
  signatureData: text('signature_data'), // Base64 signature image
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),

  // Status
  status: varchar('status', { length: 20 }).default('signed').$type<'draft' | 'signed' | 'revoked'>(),
  signedAt: timestamp('signed_at', { withTimezone: true }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  revokedBy: uuid('revoked_by').references(() => users.id),
  revocationReason: text('revocation_reason'),

  // Witnessed by (if required)
  witnessedBy: uuid('witnessed_by').references(() => users.id),
  witnessedAt: timestamp('witnessed_at', { withTimezone: true }),

  // PDF copy
  pdfUrl: text('pdf_url'),

  ...timestamps,
});

// Medical alerts (patient-level critical information)
export const medicalAlerts = pgTable('medical_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  type: varchar('type', { length: 30 }).$type<
    'allergy' | 'condition' | 'medication' | 'contraindication' | 'pregnancy' |
    'pacemaker' | 'blood_thinner' | 'immunocompromised' | 'keloid_risk' | 'other'
  >(),
  severity: varchar('severity', { length: 20 }).$type<'low' | 'medium' | 'high' | 'critical'>(),
  description: text('description').notNull(),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  acknowledgedServices: jsonb('acknowledged_services').$type<{
    serviceId: string;
    acknowledgedBy: string;
    acknowledgedAt: string;
  }[]>(),
  addedBy: uuid('added_by').references(() => users.id),
  deactivatedAt: timestamp('deactivated_at', { withTimezone: true }),
  deactivatedBy: uuid('deactivated_by').references(() => users.id),
  deactivationReason: text('deactivation_reason'),
  ...auditColumns,
});

// Product reactions (adverse events)
export const productReactions = pgTable('product_reactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  productId: uuid('product_id'),
  productName: varchar('product_name', { length: 255 }).notNull(),
  treatmentRecordId: uuid('treatment_record_id').references(() => treatmentRecords.id),

  // Reaction details
  reactionType: varchar('reaction_type', { length: 50 }).$type<
    'allergic' | 'inflammatory' | 'vascular' | 'infection' | 'granuloma' |
    'migration' | 'asymmetry' | 'bruising' | 'swelling' | 'necrosis' | 'other'
  >(),
  severity: varchar('severity', { length: 20 }).$type<'mild' | 'moderate' | 'severe'>(),
  description: text('description').notNull(),

  // Timing
  reactionDate: date('reaction_date').notNull(),
  onsetHours: integer('onset_hours'),

  // Treatment
  treatmentProvided: text('treatment_provided'),
  treatedBy: uuid('treated_by').references(() => users.id),
  outcome: varchar('outcome', { length: 50 }).$type<'resolved' | 'ongoing' | 'referred' | 'hospitalized'>(),
  resolutionDate: date('resolution_date'),
  resolutionNotes: text('resolution_notes'),

  // Follow-up
  followUpRequired: boolean('follow_up_required').default(false),
  followUpDate: date('follow_up_date'),
  followUpNotes: text('follow_up_notes'),

  // Reporting
  reportedToManufacturer: boolean('reported_to_manufacturer').default(false),
  reportedToFda: boolean('reported_to_fda').default(false),
  fdaReportNumber: varchar('fda_report_number', { length: 100 }),

  // Photos
  photoIds: jsonb('photo_ids').$type<string[]>(),

  notes: text('notes'),
  ...auditColumns,
});

// Prescription records (for controlled substances, medical director oversight)
export const prescriptions = pgTable('prescriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  patientId: uuid('patient_id').notNull().references(() => patients.id),
  prescriberId: uuid('prescriber_id').notNull().references(() => users.id),
  treatmentRecordId: uuid('treatment_record_id').references(() => treatmentRecords.id),

  // Prescription details
  medication: varchar('medication', { length: 255 }).notNull(),
  strength: varchar('strength', { length: 100 }),
  quantity: integer('quantity').notNull(),
  quantityUnit: varchar('quantity_unit', { length: 50 }),
  directions: text('directions').notNull(),
  refills: integer('refills').default(0),

  // Dates
  prescribedDate: date('prescribed_date').notNull(),
  expirationDate: date('expiration_date'),

  // Status
  status: varchar('status', { length: 20 }).default('active').$type<'active' | 'filled' | 'cancelled' | 'expired'>(),
  dispensedAt: timestamp('dispensed_at', { withTimezone: true }),
  dispensedBy: uuid('dispensed_by').references(() => users.id),

  // Pharmacy (if sent electronically)
  pharmacyName: varchar('pharmacy_name', { length: 255 }),
  pharmacyPhone: varchar('pharmacy_phone', { length: 50 }),
  pharmacyAddress: text('pharmacy_address'),
  sentToPharmacy: boolean('sent_to_pharmacy').default(false),
  sentAt: timestamp('sent_at', { withTimezone: true }),

  // Controlled substance tracking
  isControlled: boolean('is_controlled').default(false),
  schedule: varchar('schedule', { length: 10 }), // II, III, IV, V
  deaNumber: varchar('dea_number', { length: 50 }),

  notes: text('notes'),
  ...auditColumns,
});

// Relations
export const treatmentRecordsRelations = relations(treatmentRecords, ({ one, many }) => ({
  patient: one(patients, {
    fields: [treatmentRecords.patientId],
    references: [patients.id],
  }),
  appointment: one(appointments, {
    fields: [treatmentRecords.appointmentId],
    references: [appointments.id],
  }),
  practitioner: one(users, {
    fields: [treatmentRecords.practitionerId],
    references: [users.id],
  }),
  service: one(services, {
    fields: [treatmentRecords.serviceId],
    references: [services.id],
  }),
  photos: many(clinicalPhotos),
  consents: many(signedConsents),
  reactions: many(productReactions),
}));

export const clinicalPhotosRelations = relations(clinicalPhotos, ({ one }) => ({
  patient: one(patients, {
    fields: [clinicalPhotos.patientId],
    references: [patients.id],
  }),
  treatmentRecord: one(treatmentRecords, {
    fields: [clinicalPhotos.treatmentRecordId],
    references: [treatmentRecords.id],
  }),
  appointment: one(appointments, {
    fields: [clinicalPhotos.appointmentId],
    references: [appointments.id],
  }),
  takenByUser: one(users, {
    fields: [clinicalPhotos.takenBy],
    references: [users.id],
  }),
}));

export const consentFormTemplatesRelations = relations(consentFormTemplates, ({ many }) => ({
  signedConsents: many(signedConsents),
}));

export const signedConsentsRelations = relations(signedConsents, ({ one }) => ({
  template: one(consentFormTemplates, {
    fields: [signedConsents.templateId],
    references: [consentFormTemplates.id],
  }),
  patient: one(patients, {
    fields: [signedConsents.patientId],
    references: [patients.id],
  }),
  appointment: one(appointments, {
    fields: [signedConsents.appointmentId],
    references: [appointments.id],
  }),
  treatmentRecord: one(treatmentRecords, {
    fields: [signedConsents.treatmentRecordId],
    references: [treatmentRecords.id],
  }),
}));

export const medicalAlertsRelations = relations(medicalAlerts, ({ one }) => ({
  patient: one(patients, {
    fields: [medicalAlerts.patientId],
    references: [patients.id],
  }),
  addedByUser: one(users, {
    fields: [medicalAlerts.addedBy],
    references: [users.id],
  }),
}));

export const productReactionsRelations = relations(productReactions, ({ one }) => ({
  patient: one(patients, {
    fields: [productReactions.patientId],
    references: [patients.id],
  }),
  treatmentRecord: one(treatmentRecords, {
    fields: [productReactions.treatmentRecordId],
    references: [treatmentRecords.id],
  }),
  treatedByUser: one(users, {
    fields: [productReactions.treatedBy],
    references: [users.id],
  }),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  patient: one(patients, {
    fields: [prescriptions.patientId],
    references: [patients.id],
  }),
  prescriber: one(users, {
    fields: [prescriptions.prescriberId],
    references: [users.id],
  }),
  treatmentRecord: one(treatmentRecords, {
    fields: [prescriptions.treatmentRecordId],
    references: [treatmentRecords.id],
  }),
}));
