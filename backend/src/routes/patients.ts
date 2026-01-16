/**
 * Patient API Routes
 *
 * Full CRUD operations for patient management with:
 * - Pagination and filtering
 * - Search functionality
 * - Patient notes
 * - Appointment history
 * - Audit logging
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { sessionAuthMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const patients = new Hono();

// ===================
// Validation Schemas
// ===================

// Patient status
const patientStatusSchema = z.enum(['active', 'inactive', 'deceased']);

// Gender
const genderSchema = z.enum(['male', 'female', 'other', 'prefer_not_to_say']);

// Address
const addressSchema = z.object({
  street: z.string().min(1).max(255),
  street2: z.string().max(255).optional(),
  city: z.string().min(1).max(100),
  state: z.string().length(2),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
  country: z.string().max(100).default('USA'),
});

// Emergency contact
const emergencyContactSchema = z.object({
  name: z.string().min(1).max(255),
  relationship: z.string().min(1).max(100),
  phone: z.string().min(1).max(20),
  alternatePhone: z.string().max(20).optional(),
});

// Allergy
const allergySchema = z.object({
  id: z.string().optional(),
  allergen: z.string().min(1).max(255),
  reaction: z.string().max(500),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  onsetDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

// Communication preferences
const communicationPreferencesSchema = z.object({
  preferredMethod: z.enum(['email', 'sms', 'phone', 'none']).default('sms'),
  appointmentReminders: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  smsNotifications: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  language: z.string().default('en'),
});

// Privacy settings
const privacySettingsSchema = z.object({
  shareWithFamily: z.boolean().default(false),
  allowPhotos: z.boolean().default(true),
  allowResearch: z.boolean().default(false),
  privacyMode: z.boolean().default(false),
});

// Create patient schema
const createPatientSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  middleName: z.string().max(100).optional(),
  preferredName: z.string().max(100).optional(),
  pronouns: z.string().max(50).optional(),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  gender: genderSchema.optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).max(20),
  alternatePhone: z.string().max(20).optional(),
  workPhone: z.string().max(20).optional(),
  timezone: z.string().max(50).optional(),
  address: addressSchema.optional(),
  emergencyContact: emergencyContactSchema.optional(),
  allergies: z.array(allergySchema).optional(),
  bloodType: z.string().max(10).optional(),
  primaryProviderId: z.string().uuid().optional(),
  communicationPreferences: communicationPreferencesSchema.optional(),
  privacySettings: privacySettingsSchema.optional(),
  photoConsent: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
  generalNotes: z.string().max(5000).optional(),
  importantNotes: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
});

// Update patient schema (all fields optional)
const updatePatientSchema = createPatientSchema.partial();

// List patients query schema
const listPatientsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  query: z.string().max(255).optional(),
  status: patientStatusSchema.optional(),
  tags: z.string().optional(), // Comma-separated
  providerId: z.string().uuid().optional(),
  hasBalance: z.coerce.boolean().optional(),
  lastVisitFrom: z.string().optional(),
  lastVisitTo: z.string().optional(),
  sortBy: z.enum(['firstName', 'lastName', 'createdAt', 'lastVisit']).default('lastName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Search patients schema
const searchPatientsSchema = z.object({
  query: z.string().min(1).max(255),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// Patient ID param schema
const patientIdSchema = z.object({
  id: z.string().uuid(),
});

// Patient note schema
const patientNoteSchema = z.object({
  content: z.string().min(1).max(5000),
  isImportant: z.boolean().default(false),
  appointmentId: z.string().uuid().optional(),
});

// ===================
// Type Definitions
// ===================

// Patient types now come from Prisma
export type StoredPatient = Prisma.PatientGetPayload<{
  include: { Allergy: true };
}>;

export type StoredNote = Prisma.NoteGetPayload<{}>;
export type StoredAppointment = Prisma.AppointmentGetPayload<{}>;

// ===================
// Helper Functions
// ===================

async function generatePatientNumber(): Promise<string> {
  const year = new Date().getFullYear();

  // Get the highest patient number for this year
  const lastPatient = await prisma.patient.findFirst({
    where: {
      patientNumber: {
        startsWith: `P-${year}-`,
      },
    },
    orderBy: {
      patientNumber: 'desc',
    },
  });

  let counter = 1000;
  if (lastPatient) {
    const lastNumber = parseInt(lastPatient.patientNumber.split('-')[2]);
    counter = lastNumber;
  }

  counter++;
  return `P-${year}-${counter.toString().padStart(4, '0')}`;
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

function buildSearchWhereClause(query: string): Prisma.PatientWhereInput {
  const searchLower = query.toLowerCase();
  const normalizedQuery = normalizePhone(query);

  return {
    OR: [
      { firstName: { contains: searchLower, mode: 'insensitive' } },
      { lastName: { contains: searchLower, mode: 'insensitive' } },
      { preferredName: { contains: searchLower, mode: 'insensitive' } },
      { email: { contains: searchLower, mode: 'insensitive' } },
      { phone: { contains: normalizedQuery } },
      { patientNumber: { contains: searchLower, mode: 'insensitive' } },
    ],
  };
}

function calculateAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

// Note: Mock data should be seeded using Prisma seed script
// See prisma/seed.ts for initial data setup

// ===================
// Middleware
// ===================

// All patient routes require session authentication
patients.use('/*', sessionAuthMiddleware);

// ===================
// Routes
// ===================

/**
 * List patients (paginated, filterable)
 * GET /api/patients
 */
patients.get('/', zValidator('query', listPatientsSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Build where clause
  const where: Prisma.PatientWhereInput = {
    deletedAt: null,
  };

  // Apply search query
  if (query.query) {
    Object.assign(where, buildSearchWhereClause(query.query));
  }

  // Apply status filter
  if (query.status) {
    where.status = query.status.toUpperCase() as Prisma.EnumPatientStatusFilter['equals'];
  }

  // Apply tags filter
  if (query.tags) {
    const tags = query.tags.split(',').map(t => t.trim());
    where.tags = {
      hasSome: tags,
    };
  }

  // Apply provider filter
  if (query.providerId) {
    where.primaryProviderId = query.providerId;
  }

  // Apply balance filter
  if (query.hasBalance !== undefined) {
    where.balance = query.hasBalance ? { gt: 0 } : { equals: 0 };
  }

  // Apply date range filters
  if (query.lastVisitFrom || query.lastVisitTo) {
    where.lastVisit = {};
    if (query.lastVisitFrom) {
      where.lastVisit.gte = new Date(query.lastVisitFrom);
    }
    if (query.lastVisitTo) {
      where.lastVisit.lte = new Date(query.lastVisitTo);
    }
  }

  // Build orderBy
  const orderBy: Prisma.PatientOrderByWithRelationInput = {};
  switch (query.sortBy) {
    case 'firstName':
      orderBy.firstName = query.sortOrder;
      break;
    case 'lastName':
      orderBy.lastName = query.sortOrder;
      break;
    case 'createdAt':
      orderBy.createdAt = query.sortOrder;
      break;
    case 'lastVisit':
      orderBy.lastVisit = query.sortOrder;
      break;
    default:
      orderBy.lastName = query.sortOrder;
  }

  // Calculate pagination
  const offset = (query.page - 1) * query.limit;

  // Execute queries in parallel
  const [patients, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy,
      skip: offset,
      take: query.limit,
      include: {
        Allergy: true,
      },
    }),
    prisma.patient.count({ where }),
  ]);

  // Log audit event
  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'patient_list',
    ipAddress,
    metadata: { query, resultCount: patients.length },
  });

  return c.json({
    items: patients.map(p => ({
      id: p.id,
      patientNumber: p.patientNumber,
      firstName: p.firstName,
      lastName: p.lastName,
      preferredName: p.preferredName,
      email: p.email,
      phone: p.phone,
      dateOfBirth: p.dateOfBirth.toISOString(),
      age: calculateAge(p.dateOfBirth),
      status: p.status.toLowerCase(),
      balance: p.balance,
      credits: p.credits,
      lastVisit: p.lastVisit?.toISOString(),
      totalVisits: p.totalVisits,
      tags: p.tags,
      hasAlerts: p.Allergy.length > 0 || !!p.importantNotes,
    })),
    total,
    page: query.page,
    limit: query.limit,
    hasMore: offset + query.limit < total,
  });
});

/**
 * Search patients (quick search for autocomplete)
 * GET /api/patients/search
 */
patients.get('/search', zValidator('query', searchPatientsSchema), async (c) => {
  const { query, limit } = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const where: Prisma.PatientWhereInput = {
    deletedAt: null,
    ...buildSearchWhereClause(query),
  };

  const results = await prisma.patient.findMany({
    where,
    take: limit,
    orderBy: {
      lastName: 'asc',
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'patient_search',
    ipAddress,
    metadata: { query, resultCount: results.length },
  });

  return c.json({
    items: results.map(p => ({
      id: p.id,
      patientNumber: p.patientNumber,
      firstName: p.firstName,
      lastName: p.lastName,
      preferredName: p.preferredName,
      email: p.email,
      phone: p.phone,
      dateOfBirth: p.dateOfBirth.toISOString(),
      status: p.status.toLowerCase(),
    })),
    count: results.length,
  });
});

/**
 * Get single patient by ID
 * GET /api/patients/:id
 */
patients.get('/:id', zValidator('param', patientIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      Allergy: true,
    },
  });

  if (!patient || patient.deletedAt) {
    throw APIError.notFound('Patient');
  }

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'patient',
    resourceId: id,
    ipAddress,
  });

  // Transform patient data for response
  const responsePatient = {
    ...patient,
    status: patient.status.toLowerCase(),
    gender: patient.gender?.toLowerCase(),
    dateOfBirth: patient.dateOfBirth.toISOString(),
    age: calculateAge(patient.dateOfBirth),
    registrationDate: patient.registrationDate.toISOString(),
    firstVisit: patient.firstVisit?.toISOString(),
    lastVisit: patient.lastVisit?.toISOString(),
    createdAt: patient.createdAt.toISOString(),
    updatedAt: patient.updatedAt.toISOString(),
    // Reconstruct nested objects from flat fields
    address: patient.addressStreet ? {
      street: patient.addressStreet,
      street2: patient.addressStreet2,
      city: patient.addressCity!,
      state: patient.addressState!,
      zipCode: patient.addressZipCode!,
      country: patient.addressCountry || 'USA',
    } : undefined,
    emergencyContact: patient.emergencyContactName ? {
      name: patient.emergencyContactName,
      relationship: patient.emergencyContactRelationship!,
      phone: patient.emergencyContactPhone!,
      alternatePhone: patient.emergencyContactAltPhone,
    } : undefined,
    communicationPreferences: {
      preferredMethod: patient.commPrefMethod || 'sms',
      appointmentReminders: patient.commPrefAppointmentReminders,
      marketingEmails: patient.commPrefMarketingEmails,
      smsNotifications: patient.commPrefSmsNotifications,
      emailNotifications: patient.commPrefEmailNotifications,
      language: patient.commPrefLanguage,
    },
    privacySettings: {
      shareWithFamily: patient.privacyShareWithFamily,
      allowPhotos: patient.privacyAllowPhotos,
      allowResearch: patient.privacyAllowResearch,
      privacyMode: patient.privacyMode,
    },
    allergies: patient.Allergy.map(a => ({
      id: a.id,
      allergen: a.allergen,
      reaction: a.reaction,
      severity: a.severity.toLowerCase(),
      onsetDate: a.onsetDate,
      notes: a.notes,
    })),
  };

  return c.json({ patient: responsePatient });
});

/**
 * Create new patient
 * POST /api/patients
 */
patients.post('/', zValidator('json', createPatientSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Check for duplicate email
  if (data.email) {
    const emailLower = data.email.toLowerCase();
    const existingByEmail = await prisma.patient.findUnique({
      where: { email: emailLower },
    });
    if (existingByEmail && !existingByEmail.deletedAt) {
      throw APIError.conflict('A patient with this email already exists');
    }
  }

  // Check for duplicate phone (normalized)
  const normalizedPhone = normalizePhone(data.phone);
  const existingByPhone = await prisma.patient.findFirst({
    where: {
      phone: {
        contains: normalizedPhone,
      },
      deletedAt: null,
    },
  });
  if (existingByPhone) {
    throw APIError.conflict('A patient with this phone number already exists');
  }

  const patientNumber = await generatePatientNumber();
  const now = new Date();

  // Create patient with Prisma
  const patient = await prisma.patient.create({
    data: {
      id: randomUUID(),
      patientNumber,
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      preferredName: data.preferredName,
      pronouns: data.pronouns,
      dateOfBirth: new Date(data.dateOfBirth),
      gender: data.gender ? (data.gender.toUpperCase() as 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY') : null,
      email: data.email?.toLowerCase(),
      phone: data.phone,
      alternatePhone: data.alternatePhone,
      workPhone: data.workPhone,
      timezone: data.timezone,
      // Flatten address fields
      addressStreet: data.address?.street,
      addressStreet2: data.address?.street2,
      addressCity: data.address?.city,
      addressState: data.address?.state,
      addressZipCode: data.address?.zipCode,
      addressCountry: data.address?.country,
      // Flatten emergency contact fields
      emergencyContactName: data.emergencyContact?.name,
      emergencyContactRelationship: data.emergencyContact?.relationship,
      emergencyContactPhone: data.emergencyContact?.phone,
      emergencyContactAltPhone: data.emergencyContact?.alternatePhone,
      bloodType: data.bloodType,
      primaryProviderId: data.primaryProviderId,
      // Flatten communication preferences
      commPrefMethod: data.communicationPreferences?.preferredMethod,
      commPrefAppointmentReminders: data.communicationPreferences?.appointmentReminders ?? true,
      commPrefMarketingEmails: data.communicationPreferences?.marketingEmails ?? false,
      commPrefSmsNotifications: data.communicationPreferences?.smsNotifications ?? true,
      commPrefEmailNotifications: data.communicationPreferences?.emailNotifications ?? true,
      commPrefLanguage: data.communicationPreferences?.language ?? 'en',
      // Flatten privacy settings
      privacyShareWithFamily: data.privacySettings?.shareWithFamily ?? false,
      privacyAllowPhotos: data.privacySettings?.allowPhotos ?? true,
      privacyAllowResearch: data.privacySettings?.allowResearch ?? false,
      privacyMode: data.privacySettings?.privacyMode ?? false,
      photoConsent: data.photoConsent,
      marketingConsent: data.marketingConsent,
      generalNotes: data.generalNotes,
      importantNotes: data.importantNotes,
      tags: data.tags || [],
      status: 'ACTIVE',
      updatedAt: now,
      createdBy: user.uid,
      lastModifiedBy: user.uid,
      // Create allergies
      Allergy: data.allergies ? {
        create: data.allergies.map(a => ({
          id: a.id || randomUUID(),
          allergen: a.allergen,
          reaction: a.reaction,
          severity: a.severity.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
          onsetDate: a.onsetDate,
          notes: a.notes,
        })),
      } : undefined,
    },
    include: {
      Allergy: true,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'CREATE',
    resourceType: 'patient',
    resourceId: patient.id,
    ipAddress,
    metadata: { patientNumber: patient.patientNumber },
  });

  return c.json({
    patient: {
      ...patient,
      status: patient.status.toLowerCase(),
      gender: patient.gender?.toLowerCase(),
      dateOfBirth: patient.dateOfBirth.toISOString(),
      registrationDate: patient.registrationDate.toISOString(),
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
    },
    message: 'Patient created successfully',
  }, 201);
});

/**
 * Update patient
 * PUT /api/patients/:id
 */
patients.put('/:id', zValidator('param', patientIdSchema), zValidator('json', updatePatientSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const patient = await prisma.patient.findUnique({
    where: { id },
  });

  if (!patient || patient.deletedAt) {
    throw APIError.notFound('Patient');
  }

  // Check for duplicate email (excluding current patient)
  if (data.email) {
    const emailLower = data.email.toLowerCase();
    const existingByEmail = await prisma.patient.findFirst({
      where: {
        email: emailLower,
        id: { not: id },
        deletedAt: null,
      },
    });
    if (existingByEmail) {
      throw APIError.conflict('A patient with this email already exists');
    }
  }

  // Check for duplicate phone (excluding current patient)
  if (data.phone) {
    const normalizedPhone = normalizePhone(data.phone);
    const existingByPhone = await prisma.patient.findFirst({
      where: {
        phone: { contains: normalizedPhone },
        id: { not: id },
        deletedAt: null,
      },
    });
    if (existingByPhone) {
      throw APIError.conflict('A patient with this phone number already exists');
    }
  }

  // Build update data object
  const updateData: Prisma.PatientUpdateInput = {
    lastModifiedBy: user.uid,
  };

  // Basic fields
  if (data.firstName) updateData.firstName = data.firstName;
  if (data.lastName) updateData.lastName = data.lastName;
  if (data.middleName !== undefined) updateData.middleName = data.middleName;
  if (data.preferredName !== undefined) updateData.preferredName = data.preferredName;
  if (data.pronouns !== undefined) updateData.pronouns = data.pronouns;
  if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth);
  if (data.gender !== undefined) updateData.gender = data.gender?.toUpperCase() as any;
  if (data.email !== undefined) updateData.email = data.email?.toLowerCase();
  if (data.phone) updateData.phone = data.phone;
  if (data.alternatePhone !== undefined) updateData.alternatePhone = data.alternatePhone;
  if (data.workPhone !== undefined) updateData.workPhone = data.workPhone;
  if (data.timezone !== undefined) updateData.timezone = data.timezone;

  // Address fields
  if (data.address !== undefined) {
    updateData.addressStreet = data.address?.street;
    updateData.addressStreet2 = data.address?.street2;
    updateData.addressCity = data.address?.city;
    updateData.addressState = data.address?.state;
    updateData.addressZipCode = data.address?.zipCode;
    updateData.addressCountry = data.address?.country;
  }

  // Emergency contact fields
  if (data.emergencyContact !== undefined) {
    updateData.emergencyContactName = data.emergencyContact?.name;
    updateData.emergencyContactRelationship = data.emergencyContact?.relationship;
    updateData.emergencyContactPhone = data.emergencyContact?.phone;
    updateData.emergencyContactAltPhone = data.emergencyContact?.alternatePhone;
  }

  if (data.bloodType !== undefined) updateData.bloodType = data.bloodType;
  if (data.primaryProviderId !== undefined) updateData.primaryProviderId = data.primaryProviderId;

  // Communication preferences
  if (data.communicationPreferences !== undefined) {
    updateData.commPrefMethod = data.communicationPreferences.preferredMethod;
    updateData.commPrefAppointmentReminders = data.communicationPreferences.appointmentReminders;
    updateData.commPrefMarketingEmails = data.communicationPreferences.marketingEmails;
    updateData.commPrefSmsNotifications = data.communicationPreferences.smsNotifications;
    updateData.commPrefEmailNotifications = data.communicationPreferences.emailNotifications;
    updateData.commPrefLanguage = data.communicationPreferences.language;
  }

  // Privacy settings
  if (data.privacySettings !== undefined) {
    updateData.privacyShareWithFamily = data.privacySettings.shareWithFamily;
    updateData.privacyAllowPhotos = data.privacySettings.allowPhotos;
    updateData.privacyAllowResearch = data.privacySettings.allowResearch;
    updateData.privacyMode = data.privacySettings.privacyMode;
  }

  if (data.photoConsent !== undefined) updateData.photoConsent = data.photoConsent;
  if (data.marketingConsent !== undefined) updateData.marketingConsent = data.marketingConsent;
  if (data.generalNotes !== undefined) updateData.generalNotes = data.generalNotes;
  if (data.importantNotes !== undefined) updateData.importantNotes = data.importantNotes;
  if (data.tags !== undefined) updateData.tags = data.tags;

  // Handle allergies update (delete all and recreate)
  if (data.allergies !== undefined) {
    updateData.Allergy = {
      deleteMany: {},
      create: data.allergies?.map(a => ({
        id: a.id || randomUUID(),
        allergen: a.allergen,
        reaction: a.reaction,
        severity: a.severity.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        onsetDate: a.onsetDate,
        notes: a.notes,
      })) || [],
    };
  }

  // Update patient
  const updatedPatient = await prisma.patient.update({
    where: { id },
    data: updateData,
    include: {
      Allergy: true,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'patient',
    resourceId: id,
    ipAddress,
    metadata: { updatedFields: Object.keys(data) },
  });

  return c.json({
    patient: {
      ...updatedPatient,
      status: updatedPatient.status.toLowerCase(),
      gender: updatedPatient.gender?.toLowerCase(),
      dateOfBirth: updatedPatient.dateOfBirth.toISOString(),
      age: calculateAge(updatedPatient.dateOfBirth),
      registrationDate: updatedPatient.registrationDate.toISOString(),
      firstVisit: updatedPatient.firstVisit?.toISOString(),
      lastVisit: updatedPatient.lastVisit?.toISOString(),
      createdAt: updatedPatient.createdAt.toISOString(),
      updatedAt: updatedPatient.updatedAt.toISOString(),
    },
    message: 'Patient updated successfully',
  });
});

/**
 * Delete patient (soft delete)
 * DELETE /api/patients/:id
 */
patients.delete('/:id', zValidator('param', patientIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const patient = await prisma.patient.findUnique({
    where: { id },
  });

  if (!patient || patient.deletedAt) {
    throw APIError.notFound('Patient');
  }

  // Soft delete
  await prisma.patient.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: user.uid,
      status: 'INACTIVE',
      lastModifiedBy: user.uid,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'DELETE',
    resourceType: 'patient',
    resourceId: id,
    ipAddress,
  });

  return c.json({
    success: true,
    message: 'Patient deleted successfully',
  });
});

/**
 * Get patient appointments
 * GET /api/patients/:id/appointments
 */
patients.get('/:id/appointments', zValidator('param', patientIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const patient = await prisma.patient.findUnique({
    where: { id },
  });

  if (!patient || patient.deletedAt) {
    throw APIError.notFound('Patient');
  }

  const appointments = await prisma.appointment.findMany({
    where: { patientId: id },
    orderBy: { startTime: 'desc' },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'patient_appointments',
    resourceId: id,
    ipAddress,
  });

  return c.json({
    items: appointments.map(apt => ({
      id: apt.id,
      serviceName: apt.serviceName,
      serviceCategory: apt.serviceCategory,
      practitionerId: apt.practitionerId,
      practitionerName: apt.practitionerName,
      startTime: apt.startTime.toISOString(),
      endTime: apt.endTime.toISOString(),
      status: apt.status.toLowerCase(),
      notes: apt.notes,
      createdAt: apt.createdAt.toISOString(),
    })),
    total: appointments.length,
  });
});

/**
 * Get patient notes
 * GET /api/patients/:id/notes
 */
patients.get('/:id/notes', zValidator('param', patientIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const patient = await prisma.patient.findUnique({
    where: { id },
  });

  if (!patient || patient.deletedAt) {
    throw APIError.notFound('Patient');
  }

  const notes = await prisma.note.findMany({
    where: { patientId: id },
    orderBy: { createdAt: 'desc' },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'patient_notes',
    resourceId: id,
    ipAddress,
  });

  return c.json({
    items: notes.map(note => ({
      id: note.id,
      content: note.content,
      authorId: note.authorId,
      authorName: note.authorName,
      createdAt: note.createdAt.toISOString(),
      appointmentId: note.appointmentId,
      isImportant: note.isImportant,
    })),
    total: notes.length,
  });
});

/**
 * Add patient note
 * POST /api/patients/:id/notes
 */
patients.post('/:id/notes', zValidator('param', patientIdSchema), zValidator('json', patientNoteSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const patient = await prisma.patient.findUnique({
    where: { id },
  });

  if (!patient || patient.deletedAt) {
    throw APIError.notFound('Patient');
  }

  const note = await prisma.note.create({
    data: {
      id: randomUUID(),
      patientId: id,
      content: data.content,
      authorId: user.uid,
      authorName: user.email || 'Staff Member',
      appointmentId: data.appointmentId,
      isImportant: data.isImportant,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'CREATE',
    resourceType: 'patient_note',
    resourceId: note.id,
    ipAddress,
    metadata: { patientId: id, isImportant: data.isImportant },
  });

  return c.json({
    note: {
      id: note.id,
      content: note.content,
      authorId: note.authorId,
      authorName: note.authorName,
      createdAt: note.createdAt.toISOString(),
      appointmentId: note.appointmentId,
      isImportant: note.isImportant,
    },
    message: 'Note added successfully',
  }, 201);
});

// ===================
// Export Functions (for testing)
// ===================

/**
 * Clear all patient data from database (for testing only)
 */
export async function clearPatientData() {
  await prisma.$transaction([
    prisma.note.deleteMany({}),
    prisma.appointment.deleteMany({}),
    prisma.allergy.deleteMany({}),
    prisma.patient.deleteMany({}),
  ]);
}

/**
 * Get Prisma client instance (for testing)
 */
export function getPrismaClient() {
  return prisma;
}

export default patients;
