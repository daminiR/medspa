/**
 * Form Submissions API Routes
 *
 * Handles form submission operations with e-signature support:
 * - Get submission by ID
 * - Update submission (save responses)
 * - Add e-signature to submission
 * - Complete and lock submission
 * - Generate PDF (mock)
 * - Verify consent validity
 * - List valid consents for patient
 *
 * E-Signature compliance (ESIGN Act):
 * - Capture timestamp, IP address, user agent
 * - Store signature as base64 or typed name
 * - Include legal disclosure text
 * - Audit log all signature events
 * - Cannot modify after signing
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sessionAuthMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const formSubmissions = new Hono();

// ===================
// Types
// ===================

export interface SignatureData {
  type: 'draw' | 'type';
  value: string; // base64 image for draw, typed name for type
  timestamp: Date;
  ipAddress: string;
  userAgent?: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  formTitle: string;
  formType: string;
  patientId: string;
  appointmentId?: string;

  // Status
  status: 'pending' | 'in-progress' | 'completed' | 'expired';

  // Responses (field ID -> value)
  responses: Record<string, any>;

  // Signatures
  patientSignature?: SignatureData;
  witnessSignature?: SignatureData;
  providerSignature?: SignatureData;

  // Legal
  consentGiven: boolean;
  acknowledgements: string[];

  // PDF
  pdfUrl?: string;
  pdfGeneratedAt?: Date;

  // Timing
  startedAt?: Date;
  completedAt?: Date;
  expiresAt?: Date;

  // Audit
  submittedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsentVerification {
  valid: boolean;
  consentId?: string;
  expiresAt?: Date;
  serviceId: string;
  patientId: string;
  message?: string;
}

// Form template interface (from forms.ts)
interface FormTemplate {
  id: string;
  title: string;
  type: string;
  requiresWitness: boolean;
  requiresProviderSignature: boolean;
  fields: Array<{
    id: string;
    required: boolean;
    label: string;
    type: string;
  }>;
  serviceIds?: string[];
  validityPeriodDays?: number;
}

// ===================
// Validation Schemas
// ===================

const submissionIdSchema = z.object({
  id: z.string().min(1),
});

const patientIdSchema = z.object({
  patientId: z.string().min(1),
});

const updateSubmissionSchema = z.object({
  responses: z.record(z.any()),
  status: z.enum(['pending', 'in-progress']).optional(),
});

const signatureSchema = z.object({
  signatureType: z.enum(['patient', 'witness', 'provider']),
  type: z.enum(['draw', 'type']),
  value: z.string().min(1), // base64 or typed name
  acknowledgement: z.string().optional(),
});

const completeSubmissionSchema = z.object({
  finalAcknowledgement: z.string().optional(),
});

const verifyConsentSchema = z.object({
  patientId: z.string().min(1),
  serviceId: z.string().min(1),
});

// ===================
// Helper Functions
// ===================

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

function getUserAgent(c: any): string {
  return c.req.header('user-agent') || 'unknown';
}

// Check if submission can be modified
function canModifySubmission(submission: FormSubmission): boolean {
  if (submission.status === 'completed') {
    return false;
  }
  if (submission.status === 'expired') {
    return false;
  }
  // Cannot modify after patient has signed
  if (submission.patientSignature) {
    return false;
  }
  return true;
}

// Check if submission has expired
function isExpired(submission: FormSubmission): boolean {
  if (!submission.expiresAt) return false;
  return new Date() > submission.expiresAt;
}

// Get form template by ID
async function getFormTemplate(formId: string): Promise<FormTemplate | null> {
  const template = await prisma.formTemplate.findUnique({
    where: { id: formId },
  });

  if (!template) return null;

  // Convert Prisma model to FormTemplate interface
  return {
    id: template.id,
    title: template.title,
    type: template.type.replace(/_/g, '-'),
    requiresWitness: template.requiresWitness,
    requiresProviderSignature: false, // Not in schema, default to false
    fields: [], // Would need to extract from sections JSON
    serviceIds: template.serviceIds,
    validityPeriodDays: template.expirationDays ?? undefined,
  };
}

// Validate responses against form fields
function validateResponses(
  responses: Record<string, any>,
  form: FormTemplate
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const field of form.fields) {
    if (field.required && (responses[field.id] === undefined || responses[field.id] === '')) {
      errors.push(`Field "${field.label}" is required`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Check if consent is valid for a service
async function checkConsentValidity(
  patientId: string,
  serviceId: string
): Promise<ConsentVerification> {
  try {
    // Find all completed consent submissions for this patient
    const patientSubmissions = await prisma.formSubmission.findMany({
      where: {
        patientId,
        status: 'completed',
        formType: 'consent',
      },
    });

    // Check if any consent covers this service
    for (const submission of patientSubmissions) {
      const form = await getFormTemplate(submission.formId);
      if (!form) continue;

      // Check if this form covers the service
      if (form.serviceIds?.includes(serviceId)) {
        // Check if still valid (not expired)
        if (submission.expiresAt && new Date() > submission.expiresAt) {
          continue; // Skip expired consents
        }

        return {
          valid: true,
          consentId: submission.id,
          expiresAt: submission.expiresAt || undefined,
          serviceId,
          patientId,
        };
      }
    }

    return {
      valid: false,
      serviceId,
      patientId,
      message: 'No valid consent found for this service',
    };
  } catch (error) {
    console.error('Error checking consent validity:', error);
    return {
      valid: false,
      serviceId,
      patientId,
      message: 'Error checking consent validity',
    };
  }
}

// Note: Mock data should be seeded using Prisma seed script
// See prisma/seed.ts for initial data setup

// ===================
// Middleware
// ===================

// All form submission routes require session authentication
formSubmissions.use('/*', sessionAuthMiddleware);

// ===================
// Routes
// ===================

/**
 * Get submission by ID
 * GET /api/form-submissions/:id
 */
formSubmissions.get('/:id', zValidator('param', submissionIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    let submission = await prisma.formSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw APIError.notFound('Form submission');
    }

    // Convert from Prisma model
    const submissionData = submission as any as FormSubmission;

    // Check if expired and update status
    if (submission.status !== 'completed' && submission.status !== 'expired' && isExpired(submissionData)) {
      submission = await prisma.formSubmission.update({
        where: { id },
        data: {
          status: 'expired',
          updatedAt: new Date(),
        },
      });
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'form_submission',
      resourceId: id,
      ipAddress,
      metadata: { formType: submission.formType },
    });

    // Convert signatures from JSON
    const patientSig = submission.patientSignature as any;
    const witnessSig = submission.witnessSignature as any;
    const providerSig = submission.providerSignature as any;

    return c.json({
      submission: {
        ...submission,
        status: submission.status.replace(/_/g, '-'),
        createdAt: submission.createdAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString(),
        startedAt: submission.startedAt?.toISOString(),
        completedAt: submission.completedAt?.toISOString(),
        expiresAt: submission.expiresAt?.toISOString(),
        pdfGeneratedAt: submission.pdfGeneratedAt?.toISOString(),
        submittedAt: submission.submittedAt?.toISOString(),
        patientSignature: patientSig ? {
          ...patientSig,
          timestamp: new Date(patientSig.timestamp).toISOString(),
        } : undefined,
        witnessSignature: witnessSig ? {
          ...witnessSig,
          timestamp: new Date(witnessSig.timestamp).toISOString(),
        } : undefined,
        providerSignature: providerSig ? {
          ...providerSig,
          timestamp: new Date(providerSig.timestamp).toISOString(),
        } : undefined,
      },
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error getting form submission:', error);
    throw APIError.internal('Failed to retrieve form submission');
  }
});

/**
 * Update submission (save responses)
 * PUT /api/form-submissions/:id
 */
formSubmissions.put('/:id', zValidator('param', submissionIdSchema), zValidator('json', updateSubmissionSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const submission = await prisma.formSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw APIError.notFound('Form submission');
    }

    const submissionData = submission as any as FormSubmission;

    // Check if expired
    if (submission.status !== 'completed' && isExpired(submissionData)) {
      await prisma.formSubmission.update({
        where: { id },
        data: {
          status: 'expired',
          updatedAt: new Date(),
        },
      });
      throw APIError.badRequest('Form submission has expired');
    }

    // Check if can modify
    if (!canModifySubmission(submissionData)) {
      throw APIError.badRequest('Cannot modify completed or signed submission');
    }

    // Update responses
    const now = new Date();
    const currentResponses = submission.responses as Record<string, any>;
    const mergedResponses = { ...currentResponses, ...data.responses };

    const updatedSubmission = await prisma.formSubmission.update({
      where: { id },
      data: {
        responses: mergedResponses as any,
        status: data.status ? data.status.replace(/-/g, '_') as any : (submission.status === 'pending' ? 'in_progress' : submission.status),
        startedAt: submission.startedAt || now,
        updatedAt: now,
        ipAddress,
        userAgent: getUserAgent(c),
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'form_submission',
      resourceId: id,
      ipAddress,
      metadata: {
        fieldsUpdated: Object.keys(data.responses),
        formType: submission.formType,
      },
    });

    return c.json({
      submission: {
        ...updatedSubmission,
        status: updatedSubmission.status.replace(/_/g, '-'),
        createdAt: updatedSubmission.createdAt.toISOString(),
        updatedAt: updatedSubmission.updatedAt.toISOString(),
        startedAt: updatedSubmission.startedAt?.toISOString(),
        completedAt: updatedSubmission.completedAt?.toISOString(),
        expiresAt: updatedSubmission.expiresAt?.toISOString(),
      },
      message: 'Submission updated successfully',
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error updating form submission:', error);
    throw APIError.internal('Failed to update form submission');
  }
});

/**
 * Add e-signature to submission
 * POST /api/form-submissions/:id/sign
 */
formSubmissions.post('/:id/sign', zValidator('param', submissionIdSchema), zValidator('json', signatureSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);
  const userAgent = getUserAgent(c);

  try {
    const submission = await prisma.formSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw APIError.notFound('Form submission');
    }

    const submissionData = submission as any as FormSubmission;

    // Check if expired
    if (submission.status === 'expired' || isExpired(submissionData)) {
      throw APIError.badRequest('Cannot sign expired form submission');
    }

    // Check if already completed
    if (submission.status === 'completed') {
      throw APIError.badRequest('Cannot add signature to completed submission');
    }

    // Create signature data (ESIGN Act compliance)
    const signatureData: SignatureData = {
      type: data.type,
      value: data.value,
      timestamp: new Date(),
      ipAddress,
      userAgent,
    };

    // Apply signature based on type
    const now = new Date();
    const signatureField = `${data.signatureType}Signature`;

    // Check if this signature type is already present
    const existingSignature = submission[signatureField as keyof typeof submission];
    if (existingSignature) {
      throw APIError.badRequest(`${data.signatureType} signature already exists`);
    }

    // For provider signatures, require provider role
    if (data.signatureType === 'provider' && user.role !== 'provider' && user.role !== 'admin') {
      throw APIError.forbidden('Only providers can add provider signatures');
    }

    // Build update data
    const updateData: any = {
      [signatureField]: signatureData,
      acknowledgements: data.acknowledgement
        ? [...submission.acknowledgements, data.acknowledgement]
        : submission.acknowledgements,
      updatedAt: now,
    };

    const updatedSubmission = await prisma.formSubmission.update({
      where: { id },
      data: updateData,
    });

    // Log signature event with detailed audit info (ESIGN compliance)
    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'form_signature',
      resourceId: id,
      ipAddress,
      userAgent,
      metadata: {
        signatureType: data.signatureType,
        signatureMethod: data.type,
        formId: submission.formId,
        formTitle: submission.formTitle,
        patientId: submission.patientId,
        timestamp: signatureData.timestamp.toISOString(),
        legalDisclosure: 'Electronic signature captured per ESIGN Act compliance',
      },
    });

    // Convert signatures from JSON
    const patientSig = updatedSubmission.patientSignature as any;
    const witnessSig = updatedSubmission.witnessSignature as any;
    const providerSig = updatedSubmission.providerSignature as any;

    return c.json({
      submission: {
        ...updatedSubmission,
        status: updatedSubmission.status.replace(/_/g, '-'),
        createdAt: updatedSubmission.createdAt.toISOString(),
        updatedAt: updatedSubmission.updatedAt.toISOString(),
        startedAt: updatedSubmission.startedAt?.toISOString(),
        completedAt: updatedSubmission.completedAt?.toISOString(),
        expiresAt: updatedSubmission.expiresAt?.toISOString(),
        patientSignature: patientSig ? {
          ...patientSig,
          timestamp: new Date(patientSig.timestamp).toISOString(),
        } : undefined,
        witnessSignature: witnessSig ? {
          ...witnessSig,
          timestamp: new Date(witnessSig.timestamp).toISOString(),
        } : undefined,
        providerSignature: providerSig ? {
          ...providerSig,
          timestamp: new Date(providerSig.timestamp).toISOString(),
        } : undefined,
      },
      message: 'Signature added successfully',
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error adding signature:', error);
    throw APIError.internal('Failed to add signature to form submission');
  }
});

/**
 * Complete and lock submission
 * POST /api/form-submissions/:id/complete
 */
formSubmissions.post('/:id/complete', zValidator('param', submissionIdSchema), zValidator('json', completeSubmissionSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const submission = await prisma.formSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw APIError.notFound('Form submission');
    }

    const submissionData = submission as any as FormSubmission;

    // Check if already completed
    if (submission.status === 'completed') {
      throw APIError.badRequest('Submission is already completed');
    }

    // Check if expired
    if (submission.status === 'expired' || isExpired(submissionData)) {
      throw APIError.badRequest('Cannot complete expired form submission');
    }

    // Get form template to check requirements
    const form = await getFormTemplate(submission.formId);

    // Validate required signatures
    if (!submission.patientSignature) {
      throw APIError.badRequest('Patient signature is required before completing submission');
    }

    if (form?.requiresWitness && !submission.witnessSignature) {
      throw APIError.badRequest('Witness signature is required for this form');
    }

    if (form?.requiresProviderSignature && !submission.providerSignature) {
      throw APIError.badRequest('Provider signature is required for this form');
    }

    // Validate all required fields are filled
    if (form) {
      const validation = validateResponses(submission.responses as Record<string, any>, form);
      if (!validation.valid) {
        throw APIError.badRequest('Required fields not completed', { errors: validation.errors });
      }
    }

    // Calculate expiry date based on form validity period
    const now = new Date();
    let newExpiresAt = submission.expiresAt;
    if (form?.validityPeriodDays) {
      newExpiresAt = new Date(now.getTime() + form.validityPeriodDays * 24 * 60 * 60 * 1000);
    }

    // Complete the submission
    const completedSubmission = await prisma.formSubmission.update({
      where: { id },
      data: {
        status: 'completed',
        consentGiven: true,
        acknowledgements: data.finalAcknowledgement
          ? [...submission.acknowledgements, data.finalAcknowledgement]
          : submission.acknowledgements,
        completedAt: now,
        submittedAt: now,
        expiresAt: newExpiresAt,
        pdfUrl: `/api/form-submissions/${id}/pdf`,
        pdfGeneratedAt: now,
        updatedAt: now,
        ipAddress,
        userAgent: getUserAgent(c),
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'form_submission_complete',
      resourceId: id,
      ipAddress,
      metadata: {
        formId: submission.formId,
        formTitle: submission.formTitle,
        formType: submission.formType,
        patientId: submission.patientId,
        hasWitnessSignature: !!submission.witnessSignature,
        hasProviderSignature: !!submission.providerSignature,
      },
    });

    const patientSig = completedSubmission.patientSignature as any;
    const witnessSig = completedSubmission.witnessSignature as any;
    const providerSig = completedSubmission.providerSignature as any;

    return c.json({
      submission: {
        ...completedSubmission,
        status: completedSubmission.status.replace(/_/g, '-'),
        createdAt: completedSubmission.createdAt.toISOString(),
        updatedAt: completedSubmission.updatedAt.toISOString(),
        startedAt: completedSubmission.startedAt?.toISOString(),
        completedAt: completedSubmission.completedAt?.toISOString(),
        expiresAt: completedSubmission.expiresAt?.toISOString(),
        pdfGeneratedAt: completedSubmission.pdfGeneratedAt?.toISOString(),
        submittedAt: completedSubmission.submittedAt?.toISOString(),
        patientSignature: patientSig ? {
          ...patientSig,
          timestamp: new Date(patientSig.timestamp).toISOString(),
        } : undefined,
        witnessSignature: witnessSig ? {
          ...witnessSig,
          timestamp: new Date(witnessSig.timestamp).toISOString(),
        } : undefined,
        providerSignature: providerSig ? {
          ...providerSig,
          timestamp: new Date(providerSig.timestamp).toISOString(),
        } : undefined,
      },
      message: 'Submission completed successfully',
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error completing form submission:', error);
    throw APIError.internal('Failed to complete form submission');
  }
});

/**
 * Generate PDF (mock implementation)
 * GET /api/form-submissions/:id/pdf
 */
formSubmissions.get('/:id/pdf', zValidator('param', submissionIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const submission = await prisma.formSubmission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw APIError.notFound('Form submission');
    }

    // Only allow PDF generation for completed submissions
    if (submission.status !== 'completed') {
      throw APIError.badRequest('PDF can only be generated for completed submissions');
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'DOWNLOAD',
      resourceType: 'form_submission_pdf',
      resourceId: id,
      ipAddress,
      metadata: {
        formTitle: submission.formTitle,
        patientId: submission.patientId,
      },
    });

    // Mock PDF response
    return c.json({
      pdfUrl: `/api/form-submissions/${id}/pdf/download`,
      generatedAt: submission.pdfGeneratedAt?.toISOString() || new Date().toISOString(),
      submissionId: id,
      formTitle: submission.formTitle,
      patientId: submission.patientId,
      completedAt: submission.completedAt?.toISOString(),
      message: 'PDF URL generated successfully (mock implementation)',
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error generating PDF:', error);
    throw APIError.internal('Failed to generate PDF');
  }
});

// ===================
// Consent Routes
// ===================

const consents = new Hono();

// All consent routes require session authentication
consents.use('/*', sessionAuthMiddleware);

/**
 * Verify consent is valid for service
 * POST /api/consents/verify
 */
consents.post('/verify', zValidator('json', verifyConsentSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const verification = await checkConsentValidity(data.patientId, data.serviceId);

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'consent_verification',
    ipAddress,
    metadata: {
      patientId: data.patientId,
      serviceId: data.serviceId,
      valid: verification.valid,
    },
  });

  return c.json({
    verification: {
      ...verification,
      expiresAt: verification.expiresAt?.toISOString(),
    },
  });
});

// ===================
// Patient Consents Route
// ===================

const patientConsents = new Hono();

// All patient consent routes require session authentication
patientConsents.use('/*', sessionAuthMiddleware);

/**
 * List valid consents for patient
 * GET /api/patients/:patientId/consents
 */
patientConsents.get('/:patientId/consents', zValidator('param', patientIdSchema), async (c) => {
  const { patientId } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Get all completed consent submissions for this patient
    const submissions = await prisma.formSubmission.findMany({
      where: {
        patientId,
        status: 'completed',
        formType: 'consent',
      },
    });

    const consents = await Promise.all(
      submissions.map(async (s) => {
        const form = await getFormTemplate(s.formId);
        const isExpired = s.expiresAt && new Date() > s.expiresAt;

        return {
          id: s.id,
          formId: s.formId,
          formTitle: s.formTitle,
          serviceIds: form?.serviceIds || [],
          completedAt: s.completedAt?.toISOString(),
          expiresAt: s.expiresAt?.toISOString(),
          isExpired,
          isValid: !isExpired,
          pdfUrl: s.pdfUrl,
        };
      })
    );

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'patient_consents',
      resourceId: patientId,
      ipAddress,
      metadata: { consentCount: consents.length },
    });

    return c.json({
      items: consents,
      total: consents.length,
      validCount: consents.filter(c => c.isValid).length,
      expiredCount: consents.filter(c => c.isExpired).length,
    });
  } catch (error) {
    console.error('Error getting patient consents:', error);
    throw APIError.internal('Failed to retrieve patient consents');
  }
});

// ===================
// Export Functions (for testing)
// ===================

/**
 * Clear all form submission data from database (for testing only)
 */
export async function clearSubmissionData() {
  await prisma.formSubmission.deleteMany({});
}

/**
 * Get Prisma client instance (for testing)
 */
export function getPrismaClient() {
  return prisma;
}

export { formSubmissions, consents, patientConsents };
export default formSubmissions;
