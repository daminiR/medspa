/**
 * Treatment Sessions API Routes
 *
 * Manages treatments with:
 * - Treatment CRUD operations
 * - SOAP notes (Subjective, Objective, Assessment, Plan)
 * - Provider sign-off and co-signature workflow
 * - Injection point management (face chart tracking)
 * - Product usage tracking (inventory integration)
 * - Treatment status workflow
 * - Audit logging
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sessionAuthMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const treatments = new Hono();

// ===================
// Constants
// ===================

// Face Zones (24 standard zones for injection mapping)
export const FACE_ZONES = [
  { id: 'forehead', name: 'Forehead', defaultUnits: 20 },
  { id: 'glabella', name: 'Glabella (Frown Lines)', defaultUnits: 20 },
  { id: 'crows-feet-left', name: "Crow's Feet Left", defaultUnits: 12 },
  { id: 'crows-feet-right', name: "Crow's Feet Right", defaultUnits: 12 },
  { id: 'bunny-lines', name: 'Bunny Lines', defaultUnits: 4 },
  { id: 'nasalis', name: 'Nasalis', defaultUnits: 4 },
  { id: 'upper-lip', name: 'Upper Lip', defaultUnits: 4 },
  { id: 'lower-lip', name: 'Lower Lip', defaultUnits: 4 },
  { id: 'chin', name: 'Chin (Mentalis)', defaultUnits: 6 },
  { id: 'marionette-left', name: 'Marionette Left', defaultUnits: 4 },
  { id: 'marionette-right', name: 'Marionette Right', defaultUnits: 4 },
  { id: 'nasolabial-left', name: 'Nasolabial Fold Left', defaultVolume: 0.5 },
  { id: 'nasolabial-right', name: 'Nasolabial Fold Right', defaultVolume: 0.5 },
  { id: 'cheek-left', name: 'Cheek Left', defaultVolume: 1.0 },
  { id: 'cheek-right', name: 'Cheek Right', defaultVolume: 1.0 },
  { id: 'jawline-left', name: 'Jawline Left', defaultVolume: 1.0 },
  { id: 'jawline-right', name: 'Jawline Right', defaultVolume: 1.0 },
  { id: 'temple-left', name: 'Temple Left', defaultVolume: 0.5 },
  { id: 'temple-right', name: 'Temple Right', defaultVolume: 0.5 },
  { id: 'tear-trough-left', name: 'Tear Trough Left', defaultVolume: 0.3 },
  { id: 'tear-trough-right', name: 'Tear Trough Right', defaultVolume: 0.3 },
  { id: 'nose', name: 'Nose (Non-surgical)', defaultVolume: 0.5 },
  { id: 'neck', name: 'Neck (Platysma)', defaultUnits: 25 },
  { id: 'masseter-left', name: 'Masseter Left', defaultUnits: 25 },
  { id: 'masseter-right', name: 'Masseter Right', defaultUnits: 25 },
] as const;

// Valid zone IDs
const VALID_ZONE_IDS = FACE_ZONES.map(z => z.id);

// ===================
// Validation Schemas
// ===================

// Treatment status
const treatmentStatusSchema = z.enum(['in-progress', 'completed', 'pending-review', 'cancelled']);

// Product type for clinical categorization
const productTypeSchema = z.enum(['neurotoxin', 'filler', 'laser', 'skin', 'body', 'other']);

// Vital signs schema for SOAP notes
const vitalSignsSchema = z.object({
  bloodPressure: z.string().max(20).optional(),
  heartRate: z.number().int().positive().max(300).optional(),
  temperature: z.number().min(90).max(110).optional(),
}).optional();

// SOAP Notes - Subjective schema
const subjectiveSchema = z.object({
  chiefComplaint: z.string().max(2000).default(''),
  patientGoals: z.string().max(2000).default(''),
  medicalHistory: z.string().max(5000).default(''),
  allergies: z.string().max(2000).default(''),
  currentMedications: z.string().max(2000).default(''),
  previousTreatments: z.string().max(2000).default(''),
  lastTreatmentDate: z.string().optional(),
  socialHistory: z.string().max(2000).optional(),
});

// SOAP Notes - Objective schema
const objectiveSchema = z.object({
  vitalSigns: vitalSignsSchema,
  skinAssessment: z.string().max(2000).default(''),
  fitzpatrickType: z.number().int().min(1).max(6).optional(),
  photographs: z.string().max(1000).default(''),
  physicalExam: z.string().max(2000).optional(),
});

// SOAP Notes - Assessment schema
const assessmentSchema = z.object({
  diagnosis: z.string().max(2000).default(''),
  treatmentCandidacy: z.string().max(2000).default(''),
  contraindications: z.string().max(2000).default(''),
  consentObtained: z.boolean().default(false),
  consentFormId: z.string().uuid().optional(),
});

// SOAP Notes - Plan schema
const planSchema = z.object({
  treatmentPerformed: z.string().max(5000).default(''),
  productsUsed: z.string().max(2000).default(''),
  technique: z.string().max(2000).default(''),
  aftercareInstructions: z.string().max(5000).default(''),
  followUpPlan: z.string().max(2000).default(''),
  prescriptions: z.string().max(2000).optional(),
  warnings: z.string().max(2000).optional(),
  nextAppointment: z.string().optional(),
});

// Full SOAP notes schema
const soapNotesSchema = z.object({
  subjective: subjectiveSchema.optional(),
  objective: objectiveSchema.optional(),
  assessment: assessmentSchema.optional(),
  plan: planSchema.optional(),
});

// Update SOAP notes schema (partial updates allowed)
const updateSoapNotesSchema = z.object({
  subjective: subjectiveSchema.partial().optional(),
  objective: objectiveSchema.partial().optional(),
  assessment: assessmentSchema.partial().optional(),
  plan: planSchema.partial().optional(),
});

// Complete treatment schema (sign-off)
const completeTreatmentSchema = z.object({
  signedOffBy: z.string().uuid(),
});

// Injection depth
const injectionDepthSchema = z.enum([
  'superficial',
  'mid-dermal',
  'deep-dermal',
  'subcutaneous',
  'supraperiosteal'
]);

// Injection technique
const injectionTechniqueSchema = z.enum([
  'serial',
  'linear',
  'fanning',
  'cross-hatching',
  'bolus',
  'depot'
]);

// Product category
const productCategorySchema = z.enum([
  'neurotoxin',
  'filler',
  'skincare',
  'anesthetic',
  'other'
]);

// Create treatment schema
const createTreatmentSchema = z.object({
  patientId: z.string().uuid(),
  providerId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  serviceName: z.string().min(1).max(255).optional(),
  serviceCategory: z.string().min(1).max(100).optional(),
  productType: productTypeSchema,
  treatmentArea: z.string().max(500).optional(),
  chiefComplaint: z.string().max(2000).optional(),
  startTime: z.string().optional(), // ISO date string
  notes: z.string().max(5000).optional(),
  consentObtained: z.boolean().default(false),
  photosBeforeTaken: z.boolean().default(false),
  coSignRequired: z.boolean().default(false),
  soapNotes: soapNotesSchema.optional(),
});

// Update treatment schema
const updateTreatmentSchema = z.object({
  productType: productTypeSchema.optional(),
  treatmentArea: z.string().max(500).optional(),
  chiefComplaint: z.string().max(2000).optional(),
  endTime: z.string().optional(),
  notes: z.string().max(5000).optional(),
  consentObtained: z.boolean().optional(),
  photosBeforeTaken: z.boolean().optional(),
  photosAfterTaken: z.boolean().optional(),
  photoIds: z.array(z.string()).optional(),
  injectionPointIds: z.array(z.string()).optional(),
  followUpScheduled: z.boolean().optional(),
  followUpDate: z.string().optional(),
  complications: z.string().max(2000).optional(),
  outcome: z.string().max(2000).optional(),
});

// Create injection point schema
const createInjectionPointSchema = z.object({
  zoneId: z.string().refine(val => VALID_ZONE_IDS.includes(val as any), {
    message: 'Invalid zone ID. Must be one of the 24 standard face zones.',
  }),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  productId: z.string().uuid(),
  productName: z.string().min(1).max(255),
  units: z.number().positive().optional(),
  volume: z.number().positive().optional(),
  depth: injectionDepthSchema,
  technique: injectionTechniqueSchema,
  needleGauge: z.string().max(10).optional(),
  lotNumber: z.string().max(50).optional(),
  expirationDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
  complications: z.string().max(1000).optional(),
}).refine(data => data.units !== undefined || data.volume !== undefined, {
  message: 'Either units or volume must be provided',
});

// Update injection point schema
const updateInjectionPointSchema = z.object({
  zoneId: z.string().refine(val => VALID_ZONE_IDS.includes(val as any), {
    message: 'Invalid zone ID',
  }).optional(),
  x: z.number().min(0).max(100).optional(),
  y: z.number().min(0).max(100).optional(),
  productId: z.string().uuid().optional(),
  productName: z.string().min(1).max(255).optional(),
  units: z.number().positive().optional(),
  volume: z.number().positive().optional(),
  depth: injectionDepthSchema.optional(),
  technique: injectionTechniqueSchema.optional(),
  needleGauge: z.string().max(10).optional(),
  lotNumber: z.string().max(50).optional(),
  expirationDate: z.string().optional(),
  notes: z.string().max(1000).optional(),
  complications: z.string().max(1000).optional(),
});

// Create product usage schema
const createProductUsageSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().min(1).max(255),
  productCategory: productCategorySchema,
  unitsUsed: z.number().positive().optional(),
  volumeUsed: z.number().positive().optional(),
  packagesUsed: z.number().int().positive().optional(),
  lotNumber: z.string().min(1).max(50),
  expirationDate: z.string().optional(),
  vialId: z.string().uuid().optional(),
  unitPrice: z.number().min(0).optional(),
  totalPrice: z.number().min(0).optional(),
});

// List treatments query schema
const listTreatmentsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  patientId: z.string().uuid().optional(),
  providerId: z.string().uuid().optional(),
  status: treatmentStatusSchema.optional(),
  productType: productTypeSchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['startTime', 'createdAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ID param schemas
const treatmentIdSchema = z.object({
  id: z.string().uuid(),
});

const injectionPointIdSchema = z.object({
  id: z.string().uuid(),
  pointId: z.string().uuid(),
});

const productUsageIdSchema = z.object({
  id: z.string().uuid(),
  usageId: z.string().uuid(),
});

// ===================
// Helper Functions
// ===================

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

function createDefaultSOAPNotes() {
  return {
    subjective: {
      chiefComplaint: '',
      patientGoals: '',
      medicalHistory: '',
      allergies: '',
      currentMedications: '',
      previousTreatments: '',
    },
    objective: {
      skinAssessment: '',
      photographs: '',
    },
    assessment: {
      diagnosis: '',
      treatmentCandidacy: '',
      contraindications: '',
      consentObtained: false,
    },
    plan: {
      treatmentPerformed: '',
      productsUsed: '',
      technique: '',
      aftercareInstructions: '',
      followUpPlan: '',
    },
  };
}

function mergeSOAPNotes(existing: any, updates: any): any {
  return {
    subjective: {
      ...(typeof existing === 'object' && existing.subjective ? existing.subjective : {}),
      ...(updates.subjective || {}),
    },
    objective: {
      ...(typeof existing === 'object' && existing.objective ? existing.objective : {}),
      ...(updates.objective || {}),
      vitalSigns: updates.objective?.vitalSigns
        ? { ...(existing?.objective?.vitalSigns || {}), ...updates.objective.vitalSigns }
        : existing?.objective?.vitalSigns,
    },
    assessment: {
      ...(typeof existing === 'object' && existing.assessment ? existing.assessment : {}),
      ...(updates.assessment || {}),
    },
    plan: {
      ...(typeof existing === 'object' && existing.plan ? existing.plan : {}),
      ...(updates.plan || {}),
    },
  };
}

function isValidStatusTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  const validTransitions: Record<string, string[]> = {
    'in-progress': ['completed', 'pending-review', 'cancelled'],
    'pending-review': ['completed', 'in-progress', 'cancelled'],
    'completed': [], // No transitions from completed
    'cancelled': [], // No transitions from cancelled
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}

// Convert Prisma enum to string format expected by routes
function convertDepthToString(depth: string): string {
  return depth.replace(/_/g, '-');
}

function convertDepthToEnum(depth: string): string {
  return depth.replace(/-/g, '_');
}

function convertTechniqueToString(technique: string): string {
  return technique.replace(/_/g, '-');
}

function convertTechniqueToEnum(technique: string): string {
  return technique.replace(/-/g, '_');
}

function convertStatusToString(status: string): string {
  return status.replace(/_/g, '-');
}

function convertStatusToEnum(status: string): string {
  return status.replace(/-/g, '_');
}

function convertProductTypeToEnum(type: string): string {
  return type.replace(/-/g, '_');
}

// ===================
// Middleware
// ===================

// All treatment routes require session authentication
treatments.use('/*', sessionAuthMiddleware);

// ===================
// Treatment Routes
// ===================

/**
 * List treatments (paginated, filterable)
 * GET /api/treatments
 */
treatments.get('/', zValidator('query', listTreatmentsSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const where: Prisma.TreatmentWhereInput = {};

  // Apply filters
  if (query.patientId) where.patientId = query.patientId;
  if (query.providerId) where.providerId = query.providerId;
  if (query.status) where.status = convertStatusToEnum(query.status) as any;
  if (query.productType) where.productType = query.productType as any;
  if (query.dateFrom) where.startTime = { ...(where.startTime as any), gte: new Date(query.dateFrom) };
  if (query.dateTo) where.startTime = { ...(where.startTime as any), lte: new Date(query.dateTo) };

  // Get total count
  const total = await prisma.treatment.count({ where });

  // Get paginated results with injection points and product usage
  const treatments = await prisma.treatment.findMany({
    where,
    include: {
      InjectionPoint: true,
      ProductUsage: true,
    },
    orderBy: { [query.sortBy]: query.sortOrder },
    skip: (query.page - 1) * query.limit,
    take: query.limit,
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'treatment_list',
    ipAddress,
    metadata: { query, resultCount: treatments.length },
  });

  return c.json({
    items: treatments.map(t => ({
      id: t.id,
      patientId: t.patientId,
      providerId: t.providerId,
      appointmentId: t.appointmentId,
      locationId: t.locationId,
      productType: t.productType,
      treatmentArea: t.treatmentArea,
      chiefComplaint: t.chiefComplaint,
      startTime: t.startTime.toISOString(),
      endTime: t.endTime?.toISOString(),
      status: convertStatusToString(t.status),
      signedOffBy: t.signedOffBy,
      signedOffAt: t.signedOffAt?.toISOString(),
      coSignRequired: t.coSignRequired,
      coSignedBy: t.coSignedBy,
      coSignedAt: t.coSignedAt?.toISOString(),
      totalUnits: t.InjectionPoint.reduce((sum, ip) => sum + (ip.units || 0), 0),
      totalVolume: t.InjectionPoint.reduce((sum, ip) => sum + (ip.volume || 0), 0),
      totalInjectionPoints: t.InjectionPoint.length,
      totalProductsUsed: t.ProductUsage.length,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    total,
    page: query.page,
    limit: query.limit,
    hasMore: (query.page - 1) * query.limit + query.limit < total,
  });
});

/**
 * Get single treatment by ID
 * GET /api/treatments/:id
 */
treatments.get('/:id', zValidator('param', treatmentIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const treatment = await prisma.treatment.findUnique({
    where: { id },
    include: {
      InjectionPoint: true,
      ProductUsage: true,
    },
  });

  if (!treatment) {
    throw APIError.notFound('Treatment');
  }

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'treatment',
    resourceId: id,
    ipAddress,
  });

  return c.json({
    treatment: {
      ...treatment,
      status: convertStatusToString(treatment.status),
      startTime: treatment.startTime.toISOString(),
      endTime: treatment.endTime?.toISOString(),
      signedOffAt: treatment.signedOffAt?.toISOString(),
      coSignedAt: treatment.coSignedAt?.toISOString(),
      startedAt: treatment.startedAt?.toISOString(),
      completedAt: treatment.completedAt?.toISOString(),
      createdAt: treatment.createdAt.toISOString(),
      updatedAt: treatment.updatedAt.toISOString(),
      totalUnits: treatment.InjectionPoint.reduce((sum, ip) => sum + (ip.units || 0), 0),
      totalVolume: treatment.InjectionPoint.reduce((sum, ip) => sum + (ip.volume || 0), 0),
      totalInjectionPoints: treatment.InjectionPoint.length,
      totalProductsUsed: treatment.ProductUsage.length,
    },
  });
});

/**
 * Create new treatment
 * POST /api/treatments
 */
treatments.post('/', zValidator('json', createTreatmentSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const now = new Date();

  // Build initial SOAP notes
  let soapNotes = createDefaultSOAPNotes();
  if (data.soapNotes) {
    soapNotes = mergeSOAPNotes(soapNotes, data.soapNotes);
  }

  const treatment = await prisma.treatment.create({
    data: {
      patientId: data.patientId,
      providerId: data.providerId,
      appointmentId: data.appointmentId,
      locationId: data.locationId,
      serviceName: data.serviceName,
      serviceCategory: data.serviceCategory,
      productType: data.productType as any,
      treatmentArea: data.treatmentArea,
      chiefComplaint: data.chiefComplaint,
      startTime: data.startTime ? new Date(data.startTime) : now,
      status: 'in_progress',
      soapNotes: soapNotes as any,
      photoIds: [],
      injectionPointIds: [],
      coSignRequired: data.coSignRequired,
      notes: data.notes,
      consentObtained: data.consentObtained,
      photosBeforeTaken: data.photosBeforeTaken,
      photosAfterTaken: false,
      followUpScheduled: false,
      startedAt: now,
      createdBy: user.uid,
      lastModifiedBy: user.uid,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'CREATE',
    resourceType: 'treatment',
    resourceId: treatment.id,
    ipAddress,
    metadata: { patientId: data.patientId, providerId: data.providerId, productType: data.productType },
  });

  return c.json({
    treatment: {
      ...treatment,
      status: convertStatusToString(treatment.status),
      startTime: treatment.startTime.toISOString(),
      createdAt: treatment.createdAt.toISOString(),
      updatedAt: treatment.updatedAt.toISOString(),
    },
    message: 'Treatment session created successfully',
  }, 201);
});

/**
 * Update treatment
 * PUT /api/treatments/:id
 */
treatments.put('/:id', zValidator('param', treatmentIdSchema), zValidator('json', updateTreatmentSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const treatment = await prisma.treatment.findUnique({ where: { id } });

  if (!treatment) {
    throw APIError.notFound('Treatment');
  }

  // Cannot update completed or cancelled treatments
  if (treatment.status === 'completed' || treatment.status === 'cancelled') {
    throw APIError.badRequest(`Cannot update ${treatment.status} treatment`);
  }

  const updateData: Prisma.TreatmentUpdateInput = {
    lastModifiedBy: user.uid,
  };

  if (data.productType) updateData.productType = data.productType as any;
  if (data.treatmentArea !== undefined) updateData.treatmentArea = data.treatmentArea;
  if (data.chiefComplaint !== undefined) updateData.chiefComplaint = data.chiefComplaint;
  if (data.endTime) updateData.endTime = new Date(data.endTime);
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.consentObtained !== undefined) updateData.consentObtained = data.consentObtained;
  if (data.photosBeforeTaken !== undefined) updateData.photosBeforeTaken = data.photosBeforeTaken;
  if (data.photosAfterTaken !== undefined) updateData.photosAfterTaken = data.photosAfterTaken;
  if (data.photoIds) updateData.photoIds = data.photoIds;
  if (data.injectionPointIds) updateData.injectionPointIds = data.injectionPointIds;
  if (data.followUpScheduled !== undefined) updateData.followUpScheduled = data.followUpScheduled;
  if (data.followUpDate !== undefined) updateData.followUpDate = data.followUpDate;
  if (data.complications !== undefined) updateData.complications = data.complications;
  if (data.outcome !== undefined) updateData.outcome = data.outcome;

  const updatedTreatment = await prisma.treatment.update({
    where: { id },
    data: updateData,
    include: {
      InjectionPoint: true,
      ProductUsage: true,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'treatment',
    resourceId: id,
    ipAddress,
    metadata: { updatedFields: Object.keys(data) },
  });

  return c.json({
    treatment: {
      ...updatedTreatment,
      status: convertStatusToString(updatedTreatment.status),
      startTime: updatedTreatment.startTime.toISOString(),
      endTime: updatedTreatment.endTime?.toISOString(),
      signedOffAt: updatedTreatment.signedOffAt?.toISOString(),
      coSignedAt: updatedTreatment.coSignedAt?.toISOString(),
      startedAt: updatedTreatment.startedAt?.toISOString(),
      completedAt: updatedTreatment.completedAt?.toISOString(),
      createdAt: updatedTreatment.createdAt.toISOString(),
      updatedAt: updatedTreatment.updatedAt.toISOString(),
      totalUnits: updatedTreatment.InjectionPoint.reduce((sum, ip) => sum + (ip.units || 0), 0),
      totalVolume: updatedTreatment.InjectionPoint.reduce((sum, ip) => sum + (ip.volume || 0), 0),
      totalInjectionPoints: updatedTreatment.InjectionPoint.length,
      totalProductsUsed: updatedTreatment.ProductUsage.length,
    },
    message: 'Treatment updated successfully',
  });
});

/**
 * Complete treatment session with sign-off
 * POST /api/treatments/:id/complete
 */
treatments.post('/:id/complete', zValidator('param', treatmentIdSchema), zValidator('json', completeTreatmentSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const treatment = await prisma.treatment.findUnique({ where: { id } });

  if (!treatment) {
    throw APIError.notFound('Treatment');
  }

  // Check valid status transition
  const currentStatus = convertStatusToString(treatment.status);
  if (!isValidStatusTransition(currentStatus, 'completed')) {
    throw APIError.badRequest(`Cannot complete treatment with status '${currentStatus}'`);
  }

  const now = new Date();

  // Check if co-sign is required but not provided
  if (treatment.coSignRequired && !treatment.coSignedBy) {
    // Mark as pending-review instead of completed
    const updatedTreatment = await prisma.treatment.update({
      where: { id },
      data: {
        status: 'pending_review',
        signedOffBy: data.signedOffBy,
        signedOffAt: now,
        endTime: treatment.endTime || now,
        completedAt: now,
        lastModifiedBy: user.uid,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'treatment',
      resourceId: id,
      ipAddress,
      metadata: { action: 'pending-review', requiresCoSign: true },
    });

    return c.json({
      treatment: {
        id: updatedTreatment.id,
        status: convertStatusToString(updatedTreatment.status),
        signedOffBy: updatedTreatment.signedOffBy,
        signedOffAt: updatedTreatment.signedOffAt?.toISOString(),
        coSignRequired: updatedTreatment.coSignRequired,
        updatedAt: updatedTreatment.updatedAt.toISOString(),
      },
      message: 'Treatment requires co-signature and is pending review',
    });
  }

  const updatedTreatment = await prisma.treatment.update({
    where: { id },
    data: {
      status: 'completed',
      signedOffBy: data.signedOffBy,
      signedOffAt: now,
      endTime: treatment.endTime || now,
      completedAt: now,
      lastModifiedBy: user.uid,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'treatment',
    resourceId: id,
    ipAddress,
    metadata: { action: 'completed', signedOffBy: data.signedOffBy },
  });

  return c.json({
    treatment: {
      id: updatedTreatment.id,
      patientId: updatedTreatment.patientId,
      providerId: updatedTreatment.providerId,
      status: convertStatusToString(updatedTreatment.status),
      signedOffBy: updatedTreatment.signedOffBy,
      signedOffAt: updatedTreatment.signedOffAt?.toISOString(),
      endTime: updatedTreatment.endTime?.toISOString(),
      updatedAt: updatedTreatment.updatedAt.toISOString(),
    },
    message: 'Treatment completed successfully',
  });
});

/**
 * Get SOAP notes for a treatment
 * GET /api/treatments/:id/soap-notes
 */
treatments.get('/:id/soap-notes', zValidator('param', treatmentIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const treatment = await prisma.treatment.findUnique({
    where: { id },
    select: { id: true, soapNotes: true },
  });

  if (!treatment) {
    throw APIError.notFound('Treatment');
  }

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'soap_notes',
    resourceId: id,
    ipAddress,
    phiAccessed: true,
  });

  return c.json({
    treatmentId: treatment.id,
    soapNotes: treatment.soapNotes,
  });
});

/**
 * Update SOAP notes for a treatment
 * PUT /api/treatments/:id/soap-notes
 */
treatments.put('/:id/soap-notes', zValidator('param', treatmentIdSchema), zValidator('json', updateSoapNotesSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const treatment = await prisma.treatment.findUnique({ where: { id } });

  if (!treatment) {
    throw APIError.notFound('Treatment');
  }

  // Cannot update SOAP notes on completed or cancelled treatments
  if (treatment.status === 'completed' || treatment.status === 'cancelled') {
    throw APIError.badRequest(`Cannot update SOAP notes for ${treatment.status} treatment`);
  }

  // Merge SOAP notes (incremental updates)
  const updatedSoapNotes = mergeSOAPNotes(treatment.soapNotes, data);

  const updatedTreatment = await prisma.treatment.update({
    where: { id },
    data: {
      soapNotes: updatedSoapNotes as any,
      lastModifiedBy: user.uid,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'soap_notes',
    resourceId: id,
    ipAddress,
    phiAccessed: true,
    metadata: { updatedSections: Object.keys(data) },
  });

  return c.json({
    treatmentId: updatedTreatment.id,
    soapNotes: updatedTreatment.soapNotes,
    message: 'SOAP notes updated successfully',
  });
});

/**
 * Cancel a treatment
 * POST /api/treatments/:id/cancel
 */
treatments.post('/:id/cancel', zValidator('param', treatmentIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const treatment = await prisma.treatment.findUnique({ where: { id } });

  if (!treatment) {
    throw APIError.notFound('Treatment');
  }

  // Check valid status transition
  const currentStatus = convertStatusToString(treatment.status);
  if (!isValidStatusTransition(currentStatus, 'cancelled')) {
    throw APIError.badRequest(`Cannot cancel treatment with status '${currentStatus}'`);
  }

  const updatedTreatment = await prisma.treatment.update({
    where: { id },
    data: {
      status: 'cancelled',
      endTime: new Date(),
      lastModifiedBy: user.uid,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'treatment',
    resourceId: id,
    ipAddress,
    metadata: { action: 'cancelled' },
  });

  return c.json({
    treatment: {
      id: updatedTreatment.id,
      status: convertStatusToString(updatedTreatment.status),
      endTime: updatedTreatment.endTime?.toISOString(),
      updatedAt: updatedTreatment.updatedAt.toISOString(),
    },
    message: 'Treatment cancelled successfully',
  });
});

/**
 * Add co-signature to a treatment
 * POST /api/treatments/:id/co-sign
 */
treatments.post('/:id/co-sign', zValidator('param', treatmentIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const treatment = await prisma.treatment.findUnique({ where: { id } });

  if (!treatment) {
    throw APIError.notFound('Treatment');
  }

  if (!treatment.coSignRequired) {
    throw APIError.badRequest('This treatment does not require co-signature');
  }

  if (treatment.coSignedBy) {
    throw APIError.badRequest('This treatment has already been co-signed');
  }

  const now = new Date();

  // If treatment is pending-review and gets co-signed, mark as completed
  const newStatus = treatment.status === 'pending_review' && treatment.signedOffBy
    ? 'completed'
    : treatment.status;

  const updatedTreatment = await prisma.treatment.update({
    where: { id },
    data: {
      status: newStatus as any,
      coSignedBy: user.uid,
      coSignedAt: now,
      completedAt: newStatus === 'completed' ? now : treatment.completedAt,
      lastModifiedBy: user.uid,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'treatment',
    resourceId: id,
    ipAddress,
    metadata: { action: 'co-signed', coSignedBy: user.uid },
  });

  return c.json({
    treatment: {
      id: updatedTreatment.id,
      status: convertStatusToString(updatedTreatment.status),
      coSignedBy: updatedTreatment.coSignedBy,
      coSignedAt: updatedTreatment.coSignedAt?.toISOString(),
      updatedAt: updatedTreatment.updatedAt.toISOString(),
    },
    message: 'Treatment co-signed successfully',
  });
});

/**
 * Delete treatment
 * DELETE /api/treatments/:id
 */
treatments.delete('/:id', zValidator('param', treatmentIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const treatment = await prisma.treatment.findUnique({ where: { id } });

  if (!treatment) {
    throw APIError.notFound('Treatment');
  }

  // Cannot delete completed treatments
  if (treatment.status === 'completed') {
    throw APIError.badRequest('Cannot delete a completed treatment');
  }

  // Delete with cascade (injection points and product usages)
  await prisma.treatment.delete({ where: { id } });

  await logAuditEvent({
    userId: user.uid,
    action: 'DELETE',
    resourceType: 'treatment',
    resourceId: id,
    ipAddress,
  });

  return c.json({
    success: true,
    message: 'Treatment deleted successfully',
  });
});

// ===================
// Injection Points Routes
// ===================

/**
 * List injection points for treatment
 * GET /api/treatments/:id/injection-points
 */
treatments.get('/:id/injection-points', zValidator('param', treatmentIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const treatment = await prisma.treatment.findUnique({
    where: { id },
    include: { InjectionPoint: { orderBy: { timestamp: 'asc' } } },
  });

  if (!treatment) {
    throw APIError.notFound('Treatment');
  }

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'injection_points',
    resourceId: id,
    ipAddress,
  });

  // Calculate totals
  const totalUnits = treatment.InjectionPoint.reduce((sum, ip) => sum + (ip.units || 0), 0);
  const totalVolume = treatment.InjectionPoint.reduce((sum, ip) => sum + (ip.volume || 0), 0);

  // Group by zone
  const byZone = treatment.InjectionPoint.reduce((acc, ip) => {
    if (!acc[ip.zoneId]) {
      acc[ip.zoneId] = { units: 0, volume: 0, count: 0 };
    }
    acc[ip.zoneId].units += ip.units || 0;
    acc[ip.zoneId].volume += ip.volume || 0;
    acc[ip.zoneId].count++;
    return acc;
  }, {} as Record<string, { units: number; volume: number; count: number }>);

  return c.json({
    items: treatment.InjectionPoint.map(ip => ({
      ...ip,
      depth: convertDepthToString(ip.depth),
      technique: convertTechniqueToString(ip.technique),
      timestamp: ip.timestamp.toISOString(),
    })),
    total: treatment.InjectionPoint.length,
    summary: {
      totalUnits,
      totalVolume,
      byZone,
    },
  });
});

/**
 * Add injection point to treatment
 * POST /api/treatments/:id/injection-points
 */
treatments.post('/:id/injection-points', zValidator('param', treatmentIdSchema), zValidator('json', createInjectionPointSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const treatment = await prisma.treatment.findUnique({ where: { id } });

  if (!treatment) {
    throw APIError.notFound('Treatment');
  }

  // Cannot add injection points to completed or cancelled treatments
  if (treatment.status === 'completed') {
    throw APIError.badRequest('Cannot modify injection points for a completed treatment');
  }
  if (treatment.status === 'cancelled') {
    throw APIError.badRequest('Cannot modify injection points for a cancelled treatment');
  }

  const injectionPoint = await prisma.injectionPoint.create({
    data: {
      treatmentId: id,
      zoneId: data.zoneId,
      x: data.x,
      y: data.y,
      productId: data.productId,
      productName: data.productName,
      units: data.units,
      volume: data.volume,
      depth: convertDepthToEnum(data.depth) as any,
      technique: convertTechniqueToEnum(data.technique) as any,
      needleGauge: data.needleGauge,
      lotNumber: data.lotNumber,
      expirationDate: data.expirationDate,
      notes: data.notes,
      complications: data.complications,
      addedBy: user.uid,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'CREATE',
    resourceType: 'injection_point',
    resourceId: injectionPoint.id,
    ipAddress,
    metadata: { treatmentId: id, zoneId: data.zoneId },
  });

  return c.json({
    injectionPoint: {
      ...injectionPoint,
      depth: convertDepthToString(injectionPoint.depth),
      technique: convertTechniqueToString(injectionPoint.technique),
      timestamp: injectionPoint.timestamp.toISOString(),
    },
    message: 'Injection point added successfully',
  }, 201);
});

/**
 * Update injection point
 * PUT /api/treatments/:id/injection-points/:pointId
 */
treatments.put('/:id/injection-points/:pointId', zValidator('param', injectionPointIdSchema), zValidator('json', updateInjectionPointSchema), async (c) => {
  const { id, pointId } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const treatment = await prisma.treatment.findUnique({ where: { id } });

  if (!treatment) {
    throw APIError.notFound('Treatment');
  }

  // Cannot modify injection points on completed or cancelled treatments
  if (treatment.status === 'completed') {
    throw APIError.badRequest('Cannot modify injection points for a completed treatment');
  }
  if (treatment.status === 'cancelled') {
    throw APIError.badRequest('Cannot modify injection points for a cancelled treatment');
  }

  const injectionPoint = await prisma.injectionPoint.findUnique({ where: { id: pointId } });

  if (!injectionPoint) {
    throw APIError.notFound('Injection point');
  }

  if (injectionPoint.treatmentId !== id) {
    throw APIError.badRequest('Injection point does not belong to this treatment');
  }

  const updateData: Prisma.InjectionPointUpdateInput = {};
  if (data.zoneId !== undefined) updateData.zoneId = data.zoneId;
  if (data.x !== undefined) updateData.x = data.x;
  if (data.y !== undefined) updateData.y = data.y;
  if (data.productId !== undefined) updateData.productId = data.productId;
  if (data.productName !== undefined) updateData.productName = data.productName;
  if (data.units !== undefined) updateData.units = data.units;
  if (data.volume !== undefined) updateData.volume = data.volume;
  if (data.depth !== undefined) updateData.depth = convertDepthToEnum(data.depth) as any;
  if (data.technique !== undefined) updateData.technique = convertTechniqueToEnum(data.technique) as any;
  if (data.needleGauge !== undefined) updateData.needleGauge = data.needleGauge;
  if (data.lotNumber !== undefined) updateData.lotNumber = data.lotNumber;
  if (data.expirationDate !== undefined) updateData.expirationDate = data.expirationDate;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.complications !== undefined) updateData.complications = data.complications;

  const updatedPoint = await prisma.injectionPoint.update({
    where: { id: pointId },
    data: updateData,
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'injection_point',
    resourceId: pointId,
    ipAddress,
    metadata: { treatmentId: id, updatedFields: Object.keys(data) },
  });

  return c.json({
    injectionPoint: {
      ...updatedPoint,
      depth: convertDepthToString(updatedPoint.depth),
      technique: convertTechniqueToString(updatedPoint.technique),
      timestamp: updatedPoint.timestamp.toISOString(),
    },
    message: 'Injection point updated successfully',
  });
});

/**
 * Delete injection point
 * DELETE /api/treatments/:id/injection-points/:pointId
 */
treatments.delete('/:id/injection-points/:pointId', zValidator('param', injectionPointIdSchema), async (c) => {
  const { id, pointId } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const treatment = await prisma.treatment.findUnique({ where: { id } });

  if (!treatment) {
    throw APIError.notFound('Treatment');
  }

  // Cannot modify injection points on completed or cancelled treatments
  if (treatment.status === 'completed') {
    throw APIError.badRequest('Cannot modify injection points for a completed treatment');
  }
  if (treatment.status === 'cancelled') {
    throw APIError.badRequest('Cannot modify injection points for a cancelled treatment');
  }

  const injectionPoint = await prisma.injectionPoint.findUnique({ where: { id: pointId } });

  if (!injectionPoint) {
    throw APIError.notFound('Injection point');
  }

  if (injectionPoint.treatmentId !== id) {
    throw APIError.badRequest('Injection point does not belong to this treatment');
  }

  await prisma.injectionPoint.delete({ where: { id: pointId } });

  await logAuditEvent({
    userId: user.uid,
    action: 'DELETE',
    resourceType: 'injection_point',
    resourceId: pointId,
    ipAddress,
    metadata: { treatmentId: id },
  });

  return c.json({
    success: true,
    message: 'Injection point deleted successfully',
  });
});

// ===================
// Product Usage Routes
// ===================

/**
 * List products used in treatment
 * GET /api/treatments/:id/products
 */
treatments.get('/:id/products', zValidator('param', treatmentIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const treatment = await prisma.treatment.findUnique({
    where: { id },
    include: { ProductUsage: { orderBy: { addedAt: 'asc' } } },
  });

  if (!treatment) {
    throw APIError.notFound('Treatment');
  }

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'product_usage',
    resourceId: id,
    ipAddress,
  });

  // Calculate totals
  const totalUnits = treatment.ProductUsage.reduce((sum, pu) => sum + (pu.unitsUsed || 0), 0);
  const totalVolume = treatment.ProductUsage.reduce((sum, pu) => sum + (pu.volumeUsed || 0), 0);
  const totalPrice = treatment.ProductUsage.reduce((sum, pu) => sum + (pu.totalPrice || 0), 0);

  // Group by category
  const byCategory = treatment.ProductUsage.reduce((acc, pu) => {
    if (!acc[pu.productCategory]) {
      acc[pu.productCategory] = { units: 0, volume: 0, price: 0, count: 0 };
    }
    acc[pu.productCategory].units += pu.unitsUsed || 0;
    acc[pu.productCategory].volume += pu.volumeUsed || 0;
    acc[pu.productCategory].price += pu.totalPrice || 0;
    acc[pu.productCategory].count++;
    return acc;
  }, {} as Record<string, { units: number; volume: number; price: number; count: number }>);

  return c.json({
    items: treatment.ProductUsage.map(pu => ({
      ...pu,
      addedAt: pu.addedAt.toISOString(),
    })),
    total: treatment.ProductUsage.length,
    summary: {
      totalUnits,
      totalVolume,
      totalPrice,
      byCategory,
    },
  });
});

/**
 * Add product usage to treatment
 * POST /api/treatments/:id/products
 */
treatments.post('/:id/products', zValidator('param', treatmentIdSchema), zValidator('json', createProductUsageSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const treatment = await prisma.treatment.findUnique({ where: { id } });

  if (!treatment) {
    throw APIError.notFound('Treatment');
  }

  // Cannot add product usage to completed or cancelled treatments
  if (treatment.status === 'completed') {
    throw APIError.badRequest('Cannot modify product usage for a completed treatment');
  }
  if (treatment.status === 'cancelled') {
    throw APIError.badRequest('Cannot modify product usage for a cancelled treatment');
  }

  const productUsage = await prisma.productUsage.create({
    data: {
      treatmentId: id,
      productId: data.productId,
      productName: data.productName,
      productCategory: data.productCategory as any,
      unitsUsed: data.unitsUsed,
      volumeUsed: data.volumeUsed,
      packagesUsed: data.packagesUsed,
      lotNumber: data.lotNumber,
      expirationDate: data.expirationDate,
      vialId: data.vialId,
      unitPrice: data.unitPrice,
      totalPrice: data.totalPrice,
      addedBy: user.uid,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'CREATE',
    resourceType: 'product_usage',
    resourceId: productUsage.id,
    ipAddress,
    metadata: { treatmentId: id, productId: data.productId, lotNumber: data.lotNumber },
  });

  return c.json({
    productUsage: {
      ...productUsage,
      addedAt: productUsage.addedAt.toISOString(),
    },
    message: 'Product usage added successfully',
  }, 201);
});

/**
 * Get face zones reference
 * GET /api/treatments/zones
 */
treatments.get('/zones', async (c) => {
  return c.json({
    zones: FACE_ZONES,
    total: FACE_ZONES.length,
  });
});

export default treatments;
