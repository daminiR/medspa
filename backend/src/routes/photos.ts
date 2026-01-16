/**
 * Photo Management API Routes
 *
 * Handles treatment photo upload, storage, and retrieval with:
 * - Photo upload with metadata
 * - Signed URL generation for secure access
 * - Soft delete with permission checks
 * - Patient and treatment photo listing
 * - Audit logging for all access
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import crypto from 'crypto';
import { sessionAuthMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { handlePrismaError } from '../middleware/prisma-error-handler';
import { logAuditEvent } from '@medical-spa/security';
import { mockStorageService, clearMockStorage } from '../services/storage';
import { prisma } from '../lib/prisma';
import { PhotoType, PhotoAngle, AnnotationType, TreatmentStatus } from '@prisma/client';

const photos = new Hono();

// ===================
// Types
// ===================

export interface TreatmentPhoto {
  id: string;
  patientId: string;
  treatmentId?: string;
  appointmentId?: string;

  // Storage
  storageKey: string; // e.g., "patients/{patientId}/photos/{timestamp}_{filename}"
  thumbnailKey?: string;
  originalFilename: string;
  contentType: string;
  fileSize: number;

  // Metadata
  type: 'before' | 'after' | 'during' | 'progress' | 'profile' | 'other';
  angle?: 'front' | 'left' | 'right' | '45-left' | '45-right' | 'top' | 'custom';
  bodyRegion?: string;
  description?: string;

  // Consent
  consentFormId?: string;
  photoConsent: boolean;
  marketingConsent: boolean;

  // Processing
  isProcessed: boolean;
  width?: number;
  height?: number;

  // Audit
  uploadedAt: Date;
  uploadedBy: string;
  deletedAt?: Date;
  deletedBy?: string;
}

export interface PhotoAnnotation {
  id: string;
  photoId: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  type: 'marker' | 'circle' | 'arrow' | 'text' | 'measurement' | 'area';
  label?: string;
  notes?: string;
  color?: string;
  measurementValue?: number;
  measurementUnit?: string;
  referenceType?: 'injection-point' | 'zone' | 'treatment-area';
  referenceId?: string;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}

// ===================
// Constants
// ===================

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/webp',
];

// ===================
// Validation Schemas
// ===================

const photoTypeSchema = z.enum(['before', 'after', 'during', 'progress', 'profile', 'other']);

const photoAngleSchema = z.enum(['front', 'left', 'right', '45-left', '45-right', 'top', 'custom']);

const contentTypeSchema = z.string().refine(
  (val) => ALLOWED_CONTENT_TYPES.includes(val),
  { message: 'Content type must be one of: image/jpeg, image/png, image/heic, image/webp' }
);

// Upload photo schema
const uploadPhotoSchema = z.object({
  patientId: z.string().uuid(),
  treatmentId: z.string().min(1).optional(), // Allow non-UUID for legacy data
  appointmentId: z.string().uuid().optional(),
  filename: z.string().min(1).max(255),
  contentType: contentTypeSchema,
  fileSize: z.number().int().positive().max(MAX_FILE_SIZE, {
    message: 'File size must not exceed 20MB',
  }),
  type: photoTypeSchema,
  angle: photoAngleSchema.optional(),
  bodyRegion: z.string().max(100).optional(),
  description: z.string().max(1000).optional(),
  consentFormId: z.string().uuid().optional(),
  photoConsent: z.boolean(),
  marketingConsent: z.boolean().default(false),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

// Photo ID param schema
const photoIdSchema = z.object({
  id: z.string().uuid(),
});

// Patient ID param schema (allows both UUID and legacy format like 'patient-001')
const patientIdSchema = z.object({
  patientId: z.string().min(1),
});

// Treatment ID param schema (allows both UUID and legacy format like 'treatment-001')
const treatmentIdSchema = z.object({
  treatmentId: z.string().min(1),
});

// List photos query schema
const listPhotosSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: photoTypeSchema.optional(),
  includeDeleted: z.coerce.boolean().default(false),
});

// Get signed URL query schema
const signedUrlQuerySchema = z.object({
  expiresIn: z.coerce.number().int().min(60).max(86400).default(3600),
});

// Annotation type schema
const annotationTypeSchema = z.enum(['marker', 'circle', 'arrow', 'text', 'measurement', 'area']);

// Hex color schema
const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format').optional();

// Create annotation schema
const createAnnotationSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(0).max(100).optional(),
  height: z.number().min(0).max(100).optional(),
  type: annotationTypeSchema,
  label: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
  color: hexColorSchema,
  measurementValue: z.number().optional(),
  measurementUnit: z.string().max(20).optional(),
  referenceType: z.enum(['injection-point', 'zone', 'treatment-area']).optional(),
  referenceId: z.string().optional(),
});

// Update annotation schema (partial)
const updateAnnotationSchema = createAnnotationSchema.partial();

// Annotation ID param schema
const annotationIdSchema = z.object({
  id: z.string().uuid(),
  annotationId: z.string().uuid(),
});

// Comparison query schema
const comparisonQuerySchema = z.object({
  bodyRegion: z.string().optional(),
  angle: photoAngleSchema.optional(),
  treatmentId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// Link treatment schema
const linkTreatmentSchema = z.object({
  treatmentId: z.string().min(1),
  type: z.enum(['before', 'after', 'during']),
});

// ===================
// Helper Functions
// ===================

function generatePhotoId(): string {
  return crypto.randomUUID();
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

async function patientExists(patientId: string): Promise<boolean> {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true }
    });
    return patient !== null;
  } catch (error) {
    handlePrismaError(error);
  }
}

async function getTreatmentInfo(treatmentId: string): Promise<{ patientId: string; status: string } | null> {
  try {
    const treatment = await prisma.treatment.findUnique({
      where: { id: treatmentId },
      select: { patientId: true, status: true }
    });

    if (!treatment) return null;

    return {
      patientId: treatment.patientId,
      status: treatment.status
    };
  } catch (error) {
    handlePrismaError(error);
  }
}

async function canDeletePhoto(photo: TreatmentPhoto, userId: string, userRole?: string): Promise<boolean> {
  if (userRole === 'admin') {
    return true;
  }

  if (photo.uploadedBy !== userId) {
    return false;
  }

  if (photo.treatmentId) {
    const treatment = await getTreatmentInfo(photo.treatmentId);
    if (treatment && treatment.status === TreatmentStatus.completed) {
      return false;
    }
  }

  return true;
}

// Map angle string to Prisma enum
function mapAngleToPrismaEnum(angle?: string): PhotoAngle | undefined {
  if (!angle) return undefined;

  const angleMap: Record<string, PhotoAngle> = {
    'front': PhotoAngle.front,
    'left': PhotoAngle.left,
    'right': PhotoAngle.right,
    '45-left': PhotoAngle.angle_45_left,
    '45-right': PhotoAngle.angle_45_right,
    'top': PhotoAngle.top,
    'custom': PhotoAngle.custom,
  };

  return angleMap[angle];
}

// Map Prisma enum to string
function mapPrismaEnumToAngle(angle?: PhotoAngle): string | undefined {
  if (!angle) return undefined;

  const angleMap: Record<PhotoAngle, string> = {
    [PhotoAngle.front]: 'front',
    [PhotoAngle.left]: 'left',
    [PhotoAngle.right]: 'right',
    [PhotoAngle.angle_45_left]: '45-left',
    [PhotoAngle.angle_45_right]: '45-right',
    [PhotoAngle.top]: 'top',
    [PhotoAngle.custom]: 'custom',
  };

  return angleMap[angle];
}

// Map type string to Prisma enum
function mapTypeToPrismaEnum(type: string): PhotoType {
  const typeMap: Record<string, PhotoType> = {
    'before': PhotoType.before,
    'after': PhotoType.after,
    'during': PhotoType.during,
    'progress': PhotoType.progress,
    'profile': PhotoType.profile,
    'other': PhotoType.other,
  };

  return typeMap[type] || PhotoType.other;
}

// Map Prisma enum to string
function mapPrismaEnumToType(type: PhotoType): string {
  return type.toLowerCase();
}

// Map annotation type to Prisma enum
function mapAnnotationTypeToPrismaEnum(type: string): AnnotationType {
  const typeMap: Record<string, AnnotationType> = {
    'marker': AnnotationType.marker,
    'circle': AnnotationType.circle,
    'arrow': AnnotationType.arrow,
    'text': AnnotationType.text,
    'measurement': AnnotationType.measurement,
    'area': AnnotationType.area,
  };

  return typeMap[type] || AnnotationType.marker;
}

// Map Prisma enum to string
function mapPrismaEnumToAnnotationType(type: AnnotationType): string {
  return type.toLowerCase();
}

// ===================
// Middleware
// ===================

photos.use('/*', sessionAuthMiddleware);

// ===================
// Routes
// ===================

photos.post('/upload', zValidator('json', uploadPhotoSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    if (!(await patientExists(data.patientId))) {
      throw APIError.notFound('Patient');
    }

    if (data.treatmentId) {
      const treatment = await getTreatmentInfo(data.treatmentId);
      if (!treatment) {
        throw APIError.notFound('Treatment');
      }
      if (treatment.patientId !== data.patientId) {
        throw APIError.badRequest('Treatment does not belong to this patient');
      }
    }

    if (!data.photoConsent) {
      throw APIError.badRequest('Photo consent is required');
    }

    const storageResult = await mockStorageService.uploadPhoto({
      patientId: data.patientId,
      filename: data.filename,
      contentType: data.contentType,
      size: data.fileSize,
    });

    const id = generatePhotoId();

    const photo = await prisma.treatmentPhoto.create({
      data: {
        id,
        patientId: data.patientId,
        treatmentId: data.treatmentId,
        appointmentId: data.appointmentId,
        storageKey: storageResult.storageKey,
        thumbnailKey: storageResult.thumbnailKey,
        originalFilename: data.filename,
        contentType: data.contentType,
        fileSize: data.fileSize,
        type: mapTypeToPrismaEnum(data.type),
        angle: mapAngleToPrismaEnum(data.angle),
        bodyRegion: data.bodyRegion,
        description: data.description,
        consentFormId: data.consentFormId,
        photoConsent: data.photoConsent,
        marketingConsent: data.marketingConsent,
        isProcessed: false,
        width: data.width,
        height: data.height,
        uploadedBy: user.uid,
      }
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'photo',
      resourceId: id,
      ipAddress,
      metadata: {
        patientId: data.patientId,
        treatmentId: data.treatmentId,
        type: data.type,
        filename: data.filename,
      },
    });

    return c.json({
      photo: {
        id: photo.id,
        patientId: photo.patientId,
        treatmentId: photo.treatmentId ?? undefined,
        appointmentId: photo.appointmentId ?? undefined,
        storageKey: photo.storageKey,
        thumbnailKey: photo.thumbnailKey ?? undefined,
        originalFilename: photo.originalFilename,
        contentType: photo.contentType,
        fileSize: photo.fileSize,
        type: mapPrismaEnumToType(photo.type),
        angle: mapPrismaEnumToAngle(photo.angle ?? undefined),
        bodyRegion: photo.bodyRegion ?? undefined,
        description: photo.description ?? undefined,
        photoConsent: photo.photoConsent,
        marketingConsent: photo.marketingConsent,
        isProcessed: photo.isProcessed,
        width: photo.width ?? undefined,
        height: photo.height ?? undefined,
        uploadedAt: photo.uploadedAt.toISOString(),
        uploadedBy: photo.uploadedBy,
      },
      uploadUrl: storageResult.url,
      message: 'Photo uploaded successfully',
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

photos.get('/:id', zValidator('param', photoIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const photo = await prisma.treatmentPhoto.findUnique({
      where: { id }
    });

    if (!photo || photo.deletedAt) {
      throw APIError.notFound('Photo');
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'photo',
      resourceId: id,
      ipAddress,
      phiAccessed: true,
    });

    return c.json({
      photo: {
        id: photo.id,
        patientId: photo.patientId,
        treatmentId: photo.treatmentId ?? undefined,
        appointmentId: photo.appointmentId ?? undefined,
        storageKey: photo.storageKey,
        thumbnailKey: photo.thumbnailKey ?? undefined,
        originalFilename: photo.originalFilename,
        contentType: photo.contentType,
        fileSize: photo.fileSize,
        type: mapPrismaEnumToType(photo.type),
        angle: mapPrismaEnumToAngle(photo.angle ?? undefined),
        bodyRegion: photo.bodyRegion ?? undefined,
        description: photo.description ?? undefined,
        consentFormId: photo.consentFormId ?? undefined,
        photoConsent: photo.photoConsent,
        marketingConsent: photo.marketingConsent,
        isProcessed: photo.isProcessed,
        width: photo.width ?? undefined,
        height: photo.height ?? undefined,
        uploadedAt: photo.uploadedAt.toISOString(),
        uploadedBy: photo.uploadedBy,
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

photos.delete('/:id', zValidator('param', photoIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const photo = await prisma.treatmentPhoto.findUnique({
      where: { id }
    });

    if (!photo || photo.deletedAt) {
      throw APIError.notFound('Photo');
    }

    const photoData: TreatmentPhoto = {
      id: photo.id,
      patientId: photo.patientId,
      treatmentId: photo.treatmentId ?? undefined,
      appointmentId: photo.appointmentId ?? undefined,
      storageKey: photo.storageKey,
      thumbnailKey: photo.thumbnailKey ?? undefined,
      originalFilename: photo.originalFilename,
      contentType: photo.contentType,
      fileSize: photo.fileSize,
      type: mapPrismaEnumToType(photo.type) as any,
      angle: mapPrismaEnumToAngle(photo.angle ?? undefined) as any,
      bodyRegion: photo.bodyRegion ?? undefined,
      description: photo.description ?? undefined,
      consentFormId: photo.consentFormId ?? undefined,
      photoConsent: photo.photoConsent,
      marketingConsent: photo.marketingConsent,
      isProcessed: photo.isProcessed,
      width: photo.width ?? undefined,
      height: photo.height ?? undefined,
      uploadedAt: photo.uploadedAt,
      uploadedBy: photo.uploadedBy,
      deletedAt: photo.deletedAt ?? undefined,
      deletedBy: photo.deletedBy ?? undefined,
    };

    if (!(await canDeletePhoto(photoData, user.uid, user.role))) {
      if (photo.treatmentId) {
        const treatment = await getTreatmentInfo(photo.treatmentId);
        if (treatment && treatment.status === TreatmentStatus.completed) {
          throw APIError.badRequest('Cannot delete photo linked to completed treatment');
        }
      }
      throw APIError.forbidden('You do not have permission to delete this photo');
    }

    await prisma.treatmentPhoto.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: user.uid,
      }
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'DELETE',
      resourceType: 'photo',
      resourceId: id,
      ipAddress,
      metadata: { patientId: photo.patientId },
    });

    return c.json({
      success: true,
      message: 'Photo deleted successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

photos.get('/:id/url', zValidator('param', photoIdSchema), zValidator('query', signedUrlQuerySchema), async (c) => {
  const { id } = c.req.valid('param');
  const { expiresIn } = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const photo = await prisma.treatmentPhoto.findUnique({
      where: { id }
    });

    if (!photo || photo.deletedAt) {
      throw APIError.notFound('Photo');
    }

    const url = await mockStorageService.getSignedUrl(photo.storageKey, expiresIn);
    const thumbnailUrl = photo.thumbnailKey
      ? await mockStorageService.getSignedUrl(photo.thumbnailKey, expiresIn)
      : undefined;

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'photo_url',
      resourceId: id,
      ipAddress,
      phiAccessed: true,
      metadata: { expiresIn },
    });

    return c.json({
      id: photo.id,
      url,
      thumbnailUrl,
      expiresIn,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

photos.get('/patients/:patientId/photos', zValidator('param', patientIdSchema), zValidator('query', listPhotosSchema), async (c) => {
  const { patientId } = c.req.valid('param');
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    if (!(await patientExists(patientId))) {
      throw APIError.notFound('Patient');
    }

    const where: any = { patientId };

    if (!query.includeDeleted) {
      where.deletedAt = null;
    }

    if (query.type) {
      where.type = mapTypeToPrismaEnum(query.type);
    }

    const [results, total] = await Promise.all([
      prisma.treatmentPhoto.findMany({
        where,
        orderBy: { uploadedAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.treatmentPhoto.count({ where })
    ]);

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'patient_photos',
      resourceId: patientId,
      ipAddress,
      phiAccessed: true,
      metadata: { query, resultCount: results.length },
    });

    return c.json({
      items: results.map(p => ({
        id: p.id,
        patientId: p.patientId,
        treatmentId: p.treatmentId ?? undefined,
        appointmentId: p.appointmentId ?? undefined,
        originalFilename: p.originalFilename,
        contentType: p.contentType,
        fileSize: p.fileSize,
        type: mapPrismaEnumToType(p.type),
        angle: mapPrismaEnumToAngle(p.angle ?? undefined),
        bodyRegion: p.bodyRegion ?? undefined,
        description: p.description ?? undefined,
        photoConsent: p.photoConsent,
        marketingConsent: p.marketingConsent,
        isProcessed: p.isProcessed,
        width: p.width ?? undefined,
        height: p.height ?? undefined,
        uploadedAt: p.uploadedAt.toISOString(),
        uploadedBy: p.uploadedBy,
        deletedAt: p.deletedAt?.toISOString(),
      })),
      total,
      page: query.page,
      limit: query.limit,
      hasMore: (query.page - 1) * query.limit + query.limit < total,
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

photos.get('/treatments/:treatmentId/photos', zValidator('param', treatmentIdSchema), zValidator('query', listPhotosSchema), async (c) => {
  const { treatmentId } = c.req.valid('param');
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const treatment = await getTreatmentInfo(treatmentId);
    if (!treatment) {
      throw APIError.notFound('Treatment');
    }

    const where: any = { treatmentId };

    if (!query.includeDeleted) {
      where.deletedAt = null;
    }

    if (query.type) {
      where.type = mapTypeToPrismaEnum(query.type);
    }

    const [results, total] = await Promise.all([
      prisma.treatmentPhoto.findMany({
        where,
        orderBy: { uploadedAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.treatmentPhoto.count({ where })
    ]);

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'treatment_photos',
      resourceId: treatmentId,
      ipAddress,
      phiAccessed: true,
      metadata: { query, resultCount: results.length },
    });

    return c.json({
      items: results.map(p => ({
        id: p.id,
        patientId: p.patientId,
        treatmentId: p.treatmentId ?? undefined,
        appointmentId: p.appointmentId ?? undefined,
        originalFilename: p.originalFilename,
        contentType: p.contentType,
        fileSize: p.fileSize,
        type: mapPrismaEnumToType(p.type),
        angle: mapPrismaEnumToAngle(p.angle ?? undefined),
        bodyRegion: p.bodyRegion ?? undefined,
        description: p.description ?? undefined,
        photoConsent: p.photoConsent,
        marketingConsent: p.marketingConsent,
        isProcessed: p.isProcessed,
        width: p.width ?? undefined,
        height: p.height ?? undefined,
        uploadedAt: p.uploadedAt.toISOString(),
        uploadedBy: p.uploadedBy,
        deletedAt: p.deletedAt?.toISOString(),
      })),
      total,
      page: query.page,
      limit: query.limit,
      hasMore: (query.page - 1) * query.limit + query.limit < total,
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

// ===================
// Annotation Routes
// ===================

/**
 * List annotations for a photo
 * GET /api/photos/:id/annotations
 */
photos.get('/:id/annotations', zValidator('param', photoIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const photo = await prisma.treatmentPhoto.findUnique({
      where: { id }
    });

    if (!photo || photo.deletedAt) {
      throw APIError.notFound('Photo');
    }

    const annotations = await prisma.photoAnnotation.findMany({
      where: { photoId: id }
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'photo_annotations',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      items: annotations.map(a => ({
        id: a.id,
        photoId: a.photoId,
        x: a.x,
        y: a.y,
        width: a.width ?? undefined,
        height: a.height ?? undefined,
        type: mapPrismaEnumToAnnotationType(a.type),
        label: a.label ?? undefined,
        notes: a.notes ?? undefined,
        color: a.color ?? undefined,
        measurementValue: a.measurementValue ?? undefined,
        measurementUnit: a.measurementUnit ?? undefined,
        referenceType: a.referenceType ?? undefined,
        referenceId: a.referenceId ?? undefined,
        createdAt: a.createdAt.toISOString(),
        createdBy: a.createdBy,
        updatedAt: a.updatedAt?.toISOString(),
        updatedBy: a.updatedBy ?? undefined,
      })),
      total: annotations.length,
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Add annotation to photo
 * POST /api/photos/:id/annotations
 */
photos.post('/:id/annotations', zValidator('param', photoIdSchema), zValidator('json', createAnnotationSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const photo = await prisma.treatmentPhoto.findUnique({
      where: { id }
    });

    if (!photo || photo.deletedAt) {
      throw APIError.notFound('Photo');
    }

    // Check if photo is linked to completed treatment and user is not admin
    if (photo.treatmentId) {
      const treatment = await getTreatmentInfo(photo.treatmentId);
      if (treatment && treatment.status === TreatmentStatus.completed && user.role !== 'admin') {
        throw APIError.badRequest('Cannot modify annotations on photos linked to completed treatments');
      }
    }

    const annotation = await prisma.photoAnnotation.create({
      data: {
        id: crypto.randomUUID(),
        photoId: id,
        x: data.x,
        y: data.y,
        width: data.width,
        height: data.height,
        type: mapAnnotationTypeToPrismaEnum(data.type),
        label: data.label,
        notes: data.notes,
        color: data.color,
        measurementValue: data.measurementValue,
        measurementUnit: data.measurementUnit,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        createdBy: user.uid,
      }
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'photo_annotation',
      resourceId: annotation.id,
      ipAddress,
      metadata: { photoId: id, type: data.type },
    });

    return c.json({
      annotation: {
        id: annotation.id,
        photoId: annotation.photoId,
        x: annotation.x,
        y: annotation.y,
        width: annotation.width ?? undefined,
        height: annotation.height ?? undefined,
        type: mapPrismaEnumToAnnotationType(annotation.type),
        label: annotation.label ?? undefined,
        notes: annotation.notes ?? undefined,
        color: annotation.color ?? undefined,
        measurementValue: annotation.measurementValue ?? undefined,
        measurementUnit: annotation.measurementUnit ?? undefined,
        referenceType: annotation.referenceType ?? undefined,
        referenceId: annotation.referenceId ?? undefined,
        createdAt: annotation.createdAt.toISOString(),
        createdBy: annotation.createdBy,
      },
      message: 'Annotation added successfully',
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Update annotation
 * PUT /api/photos/:id/annotations/:annotationId
 */
photos.put('/:id/annotations/:annotationId', zValidator('param', annotationIdSchema), zValidator('json', updateAnnotationSchema), async (c) => {
  const { id, annotationId } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const photo = await prisma.treatmentPhoto.findUnique({
      where: { id }
    });

    if (!photo || photo.deletedAt) {
      throw APIError.notFound('Photo');
    }

    const annotation = await prisma.photoAnnotation.findUnique({
      where: { id: annotationId }
    });

    if (!annotation) {
      throw APIError.notFound('Annotation');
    }
    if (annotation.photoId !== id) {
      throw APIError.badRequest('Annotation does not belong to this photo');
    }

    // Check if photo is linked to completed treatment and user is not admin
    if (photo.treatmentId) {
      const treatment = await getTreatmentInfo(photo.treatmentId);
      if (treatment && treatment.status === TreatmentStatus.completed && user.role !== 'admin') {
        throw APIError.forbidden('Cannot modify annotations on photos linked to completed treatments');
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: user.uid,
    };

    if (data.x !== undefined) updateData.x = data.x;
    if (data.y !== undefined) updateData.y = data.y;
    if (data.width !== undefined) updateData.width = data.width;
    if (data.height !== undefined) updateData.height = data.height;
    if (data.type !== undefined) updateData.type = mapAnnotationTypeToPrismaEnum(data.type);
    if (data.label !== undefined) updateData.label = data.label;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.measurementValue !== undefined) updateData.measurementValue = data.measurementValue;
    if (data.measurementUnit !== undefined) updateData.measurementUnit = data.measurementUnit;
    if (data.referenceType !== undefined) updateData.referenceType = data.referenceType;
    if (data.referenceId !== undefined) updateData.referenceId = data.referenceId;

    const updatedAnnotation = await prisma.photoAnnotation.update({
      where: { id: annotationId },
      data: updateData
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'photo_annotation',
      resourceId: annotationId,
      ipAddress,
      metadata: { photoId: id, updatedFields: Object.keys(data) },
    });

    return c.json({
      annotation: {
        id: updatedAnnotation.id,
        photoId: updatedAnnotation.photoId,
        x: updatedAnnotation.x,
        y: updatedAnnotation.y,
        width: updatedAnnotation.width ?? undefined,
        height: updatedAnnotation.height ?? undefined,
        type: mapPrismaEnumToAnnotationType(updatedAnnotation.type),
        label: updatedAnnotation.label ?? undefined,
        notes: updatedAnnotation.notes ?? undefined,
        color: updatedAnnotation.color ?? undefined,
        measurementValue: updatedAnnotation.measurementValue ?? undefined,
        measurementUnit: updatedAnnotation.measurementUnit ?? undefined,
        referenceType: updatedAnnotation.referenceType ?? undefined,
        referenceId: updatedAnnotation.referenceId ?? undefined,
        createdAt: updatedAnnotation.createdAt.toISOString(),
        createdBy: updatedAnnotation.createdBy,
        updatedAt: updatedAnnotation.updatedAt?.toISOString(),
        updatedBy: updatedAnnotation.updatedBy ?? undefined,
      },
      message: 'Annotation updated successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Delete annotation
 * DELETE /api/photos/:id/annotations/:annotationId
 */
photos.delete('/:id/annotations/:annotationId', zValidator('param', annotationIdSchema), async (c) => {
  const { id, annotationId } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const photo = await prisma.treatmentPhoto.findUnique({
      where: { id }
    });

    if (!photo || photo.deletedAt) {
      throw APIError.notFound('Photo');
    }

    const annotation = await prisma.photoAnnotation.findUnique({
      where: { id: annotationId }
    });

    if (!annotation || annotation.photoId !== id) {
      throw APIError.notFound('Annotation');
    }

    // Check if photo is linked to completed treatment and user is not admin
    if (photo.treatmentId) {
      const treatment = await getTreatmentInfo(photo.treatmentId);
      if (treatment && treatment.status === TreatmentStatus.completed && user.role !== 'admin') {
        throw APIError.forbidden('Cannot delete annotations on photos linked to completed treatments');
      }
    }

    await prisma.photoAnnotation.delete({
      where: { id: annotationId }
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'DELETE',
      resourceType: 'photo_annotation',
      resourceId: annotationId,
      ipAddress,
      metadata: { photoId: id },
    });

    return c.json({
      success: true,
      message: 'Annotation deleted successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get before/after photo pairs for comparison
 * GET /api/photos/patients/:patientId/comparison
 */
photos.get('/patients/:patientId/comparison', zValidator('param', patientIdSchema), zValidator('query', comparisonQuerySchema), async (c) => {
  const { patientId } = c.req.valid('param');
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    if (!(await patientExists(patientId))) {
      throw APIError.notFound('Patient');
    }

    const where: any = {
      patientId,
      deletedAt: null,
    };

    // Apply filters
    if (query.bodyRegion) {
      where.bodyRegion = query.bodyRegion;
    }
    if (query.angle) {
      where.angle = mapAngleToPrismaEnum(query.angle);
    }
    if (query.treatmentId) {
      where.treatmentId = query.treatmentId;
    }
    if (query.startDate) {
      where.uploadedAt = { ...where.uploadedAt, gte: new Date(query.startDate) };
    }
    if (query.endDate) {
      where.uploadedAt = { ...where.uploadedAt, lte: new Date(query.endDate) };
    }

    const patientPhotos = await prisma.treatmentPhoto.findMany({ where });

    // Separate before and after photos
    const beforePhotos = patientPhotos.filter(p => p.type === PhotoType.before);
    const afterPhotos = patientPhotos.filter(p => p.type === PhotoType.after);

    // Create comparison pairs
    const comparisons: Array<{
      beforePhoto: any;
      afterPhoto: any;
      treatmentId?: string;
      treatmentDate?: string;
      daysBetween: number;
      angle: string;
      bodyRegion?: string;
    }> = [];

    for (const beforePhoto of beforePhotos) {
      // Find matching after photos (same angle, body region, and optionally treatment)
      const matchingAfterPhotos = afterPhotos.filter(a =>
        a.angle === beforePhoto.angle &&
        a.bodyRegion === beforePhoto.bodyRegion &&
        (!beforePhoto.treatmentId || a.treatmentId === beforePhoto.treatmentId)
      );

      for (const afterPhoto of matchingAfterPhotos) {
        const daysBetween = Math.floor(
          (afterPhoto.uploadedAt.getTime() - beforePhoto.uploadedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        comparisons.push({
          beforePhoto: {
            id: beforePhoto.id,
            type: mapPrismaEnumToType(beforePhoto.type),
            angle: mapPrismaEnumToAngle(beforePhoto.angle ?? undefined),
            bodyRegion: beforePhoto.bodyRegion ?? undefined,
            uploadedAt: beforePhoto.uploadedAt.toISOString(),
          },
          afterPhoto: {
            id: afterPhoto.id,
            type: mapPrismaEnumToType(afterPhoto.type),
            angle: mapPrismaEnumToAngle(afterPhoto.angle ?? undefined),
            bodyRegion: afterPhoto.bodyRegion ?? undefined,
            uploadedAt: afterPhoto.uploadedAt.toISOString(),
          },
          treatmentId: beforePhoto.treatmentId ?? afterPhoto.treatmentId ?? undefined,
          treatmentDate: beforePhoto.uploadedAt.toISOString(),
          daysBetween,
          angle: mapPrismaEnumToAngle(beforePhoto.angle ?? undefined) || 'unknown',
          bodyRegion: beforePhoto.bodyRegion ?? undefined,
        });
      }
    }

    // Sort by treatment date descending
    comparisons.sort((a, b) => {
      const dateA = new Date(a.treatmentDate || 0);
      const dateB = new Date(b.treatmentDate || 0);
      return dateB.getTime() - dateA.getTime();
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'photo_comparison',
      ipAddress,
      metadata: { patientId, filters: query, resultCount: comparisons.length },
    });

    return c.json({
      items: comparisons,
      comparisons, // backwards compatibility
      total: comparisons.length,
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Link photo to treatment
 * POST /api/photos/:id/link-treatment
 */
photos.post('/:id/link-treatment', zValidator('param', photoIdSchema), zValidator('json', linkTreatmentSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const photo = await prisma.treatmentPhoto.findUnique({
      where: { id }
    });

    if (!photo || photo.deletedAt) {
      throw APIError.notFound('Photo');
    }

    const treatment = await getTreatmentInfo(data.treatmentId);
    if (!treatment) {
      throw APIError.notFound('Treatment');
    }

    // Check if photo belongs to the same patient as the treatment
    if (photo.patientId !== treatment.patientId) {
      throw APIError.badRequest('Cannot link photo and treatment from different patients');
    }

    // Update photo
    const updatedPhoto = await prisma.treatmentPhoto.update({
      where: { id },
      data: {
        treatmentId: data.treatmentId,
        type: mapTypeToPrismaEnum(data.type),
      }
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'photo',
      resourceId: id,
      ipAddress,
      metadata: { treatmentId: data.treatmentId, type: data.type },
    });

    return c.json({
      photo: {
        id: updatedPhoto.id,
        patientId: updatedPhoto.patientId,
        treatmentId: updatedPhoto.treatmentId ?? undefined,
        appointmentId: updatedPhoto.appointmentId ?? undefined,
        storageKey: updatedPhoto.storageKey,
        thumbnailKey: updatedPhoto.thumbnailKey ?? undefined,
        originalFilename: updatedPhoto.originalFilename,
        contentType: updatedPhoto.contentType,
        fileSize: updatedPhoto.fileSize,
        type: mapPrismaEnumToType(updatedPhoto.type),
        angle: mapPrismaEnumToAngle(updatedPhoto.angle ?? undefined),
        bodyRegion: updatedPhoto.bodyRegion ?? undefined,
        description: updatedPhoto.description ?? undefined,
        consentFormId: updatedPhoto.consentFormId ?? undefined,
        photoConsent: updatedPhoto.photoConsent,
        marketingConsent: updatedPhoto.marketingConsent,
        isProcessed: updatedPhoto.isProcessed,
        width: updatedPhoto.width ?? undefined,
        height: updatedPhoto.height ?? undefined,
        uploadedAt: updatedPhoto.uploadedAt.toISOString(),
        uploadedBy: updatedPhoto.uploadedBy,
      },
      message: 'Photo linked to treatment successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

// ===================
// Export Functions (for testing)
// ===================

export async function clearStores(): Promise<void> {
  await prisma.photoAnnotation.deleteMany({});
  await prisma.treatmentPhoto.deleteMany({});
  clearMockStorage();
}

export async function resetStores(): Promise<void> {
  await prisma.photoAnnotation.deleteMany({});
  await prisma.treatmentPhoto.deleteMany({});
  clearMockStorage();
}

export async function getPhotoStore(): Promise<Map<string, TreatmentPhoto>> {
  const photos = await prisma.treatmentPhoto.findMany();
  const photoMap = new Map<string, TreatmentPhoto>();

  photos.forEach(p => {
    photoMap.set(p.id, {
      id: p.id,
      patientId: p.patientId,
      treatmentId: p.treatmentId ?? undefined,
      appointmentId: p.appointmentId ?? undefined,
      storageKey: p.storageKey,
      thumbnailKey: p.thumbnailKey ?? undefined,
      originalFilename: p.originalFilename,
      contentType: p.contentType,
      fileSize: p.fileSize,
      type: mapPrismaEnumToType(p.type) as any,
      angle: mapPrismaEnumToAngle(p.angle ?? undefined) as any,
      bodyRegion: p.bodyRegion ?? undefined,
      description: p.description ?? undefined,
      consentFormId: p.consentFormId ?? undefined,
      photoConsent: p.photoConsent,
      marketingConsent: p.marketingConsent,
      isProcessed: p.isProcessed,
      width: p.width ?? undefined,
      height: p.height ?? undefined,
      uploadedAt: p.uploadedAt,
      uploadedBy: p.uploadedBy,
      deletedAt: p.deletedAt ?? undefined,
      deletedBy: p.deletedBy ?? undefined,
    });
  });

  return photoMap;
}

export async function addMockPhoto(photo: Omit<TreatmentPhoto, 'id'> | Record<string, any>): Promise<string> {
  const id = generatePhotoId();

  await prisma.treatmentPhoto.create({
    data: {
      id,
      patientId: photo.patientId,
      treatmentId: photo.treatmentId,
      appointmentId: photo.appointmentId,
      storageKey: photo.storageKey || `patients/${photo.patientId}/photos/test/${id}.jpg`,
      thumbnailKey: photo.thumbnailKey,
      originalFilename: photo.originalFilename || 'test.jpg',
      contentType: photo.contentType || 'image/jpeg',
      fileSize: photo.fileSize || 1000000,
      type: mapTypeToPrismaEnum(photo.type === 'reference' ? 'other' : photo.type || 'other'),
      angle: mapAngleToPrismaEnum(photo.angle),
      bodyRegion: photo.bodyRegion,
      description: photo.description,
      consentFormId: photo.consentFormId,
      photoConsent: photo.photoConsent ?? true,
      marketingConsent: photo.marketingConsent ?? false,
      isProcessed: photo.isProcessed ?? true,
      width: photo.width,
      height: photo.height,
      uploadedAt: photo.uploadedAt || (photo as any).capturedAt || new Date(),
      uploadedBy: photo.uploadedBy || (photo as any).capturedBy || 'test-user',
      deletedAt: photo.deletedAt,
      deletedBy: photo.deletedBy,
    }
  });

  return id;
}

export async function addMockPatient(patientId: string): Promise<void> {
  // Check if patient exists, if not create a minimal patient record for testing
  const exists = await patientExists(patientId);
  if (!exists) {
    try {
      await prisma.patient.create({
        data: {
          id: patientId,
          patientNumber: `MOCK-${patientId}`,
          firstName: 'Test',
          lastName: 'Patient',
          dateOfBirth: new Date('1990-01-01'),
          phone: '555-0000',
          createdBy: 'test-system',
          lastModifiedBy: 'test-system',
          updatedAt: new Date(),
        }
      });
    } catch (error) {
      // Ignore if already exists
    }
  }
}

export async function addMockTreatment(treatmentOrId: string | { id: string; patientId: string; status: string; startTime?: Date }, patientId?: string, status?: string): Promise<void> {
  if (typeof treatmentOrId === 'object') {
    const treatment = treatmentOrId;
    try {
      await prisma.treatment.create({
        data: {
          id: treatment.id,
          patientId: treatment.patientId,
          providerId: 'test-provider',
          startTime: treatment.startTime || new Date(),
          status: treatment.status as any,
          soapNotes: {},
          productType: 'neurotoxin',
          createdBy: 'test-system',
          lastModifiedBy: 'test-system',
        }
      });
    } catch (error) {
      // Ignore if already exists
    }
  } else {
    try {
      await prisma.treatment.create({
        data: {
          id: treatmentOrId,
          patientId: patientId!,
          providerId: 'test-provider',
          startTime: new Date(),
          status: status as any,
          soapNotes: {},
          productType: 'neurotoxin',
          createdBy: 'test-system',
          lastModifiedBy: 'test-system',
        }
      });
    } catch (error) {
      // Ignore if already exists
    }
  }
}

export async function removeMockPatient(patientId: string): Promise<void> {
  try {
    await prisma.patient.delete({ where: { id: patientId } });
  } catch (error) {
    // Ignore if doesn't exist
  }
}

export async function removeMockTreatment(treatmentId: string): Promise<void> {
  try {
    await prisma.treatment.delete({ where: { id: treatmentId } });
  } catch (error) {
    // Ignore if doesn't exist
  }
}

// ===================
// Additional Export Functions (for testing)
// ===================

export async function getAnnotationStore(): Promise<Map<string, PhotoAnnotation>> {
  const annotations = await prisma.photoAnnotation.findMany();
  const annotationMap = new Map<string, PhotoAnnotation>();

  annotations.forEach(a => {
    annotationMap.set(a.id, {
      id: a.id,
      photoId: a.photoId,
      x: a.x,
      y: a.y,
      width: a.width ?? undefined,
      height: a.height ?? undefined,
      type: mapPrismaEnumToAnnotationType(a.type) as any,
      label: a.label ?? undefined,
      notes: a.notes ?? undefined,
      color: a.color ?? undefined,
      measurementValue: a.measurementValue ?? undefined,
      measurementUnit: a.measurementUnit ?? undefined,
      referenceType: (a.referenceType as 'injection-point' | 'zone' | 'treatment-area') ?? undefined,
      referenceId: a.referenceId ?? undefined,
      createdAt: a.createdAt,
      createdBy: a.createdBy,
      updatedAt: a.updatedAt ?? undefined,
      updatedBy: a.updatedBy ?? undefined,
    });
  });

  return annotationMap;
}

export async function getMockTreatmentStore(): Promise<Map<string, { id: string; patientId: string; status: string; startTime: Date }>> {
  const treatments = await prisma.treatment.findMany({
    select: { id: true, patientId: true, status: true, startTime: true }
  });
  const treatmentMap = new Map();

  treatments.forEach(t => {
    treatmentMap.set(t.id, {
      id: t.id,
      patientId: t.patientId,
      status: t.status,
      startTime: t.startTime
    });
  });

  return treatmentMap;
}

export async function addMockAnnotation(annotation: Omit<PhotoAnnotation, 'id'>): Promise<string> {
  const result = await prisma.photoAnnotation.create({
    data: {
      id: crypto.randomUUID(),
      photoId: annotation.photoId,
      x: annotation.x,
      y: annotation.y,
      width: annotation.width,
      height: annotation.height,
      type: mapAnnotationTypeToPrismaEnum(annotation.type),
      label: annotation.label,
      notes: annotation.notes,
      color: annotation.color,
      measurementValue: annotation.measurementValue,
      measurementUnit: annotation.measurementUnit,
      referenceType: annotation.referenceType,
      referenceId: annotation.referenceId,
      createdBy: annotation.createdBy,
      createdAt: annotation.createdAt,
      updatedAt: annotation.updatedAt,
      updatedBy: annotation.updatedBy,
    }
  });

  return result.id;
}

export default photos;
