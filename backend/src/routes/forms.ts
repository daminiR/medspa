/**
 * Form Template API Routes
 *
 * Full CRUD operations for form template management with:
 * - Pagination and filtering by type
 * - Duplicate functionality
 * - Patient form assignments
 * - Version tracking
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

const forms = new Hono();

// ===================
// Validation Schemas
// ===================

// Form type enum
const formTypeSchema = z.enum([
  'intake',
  'consent',
  'hipaa',
  'photo-release',
  'treatment-specific',
  'medical-history',
  'custom'
]);

// Field type enum
const fieldTypeSchema = z.enum([
  'text',
  'textarea',
  'select',
  'checkbox',
  'radio',
  'date',
  'signature',
  'file',
  'number',
  'email',
  'phone'
]);

// Signature type enum
const signatureTypeSchema = z.enum(['draw', 'type', 'both']);

// Field validation schema
const fieldValidationSchema = z.object({
  minLength: z.number().int().min(0).optional(),
  maxLength: z.number().int().min(0).optional(),
  pattern: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
}).optional();

// Form field schema
const formFieldSchema = z.object({
  id: z.string().optional(),
  type: fieldTypeSchema,
  label: z.string().min(1).max(255),
  placeholder: z.string().max(255).optional(),
  required: z.boolean().default(false),
  validation: fieldValidationSchema,
  options: z.array(z.string()).optional(),
  defaultValue: z.any().optional(),
  helperText: z.string().max(500).optional(),
  order: z.number().int().min(0),
});

// Form section schema
const formSectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  order: z.number().int().min(0),
  fields: z.array(formFieldSchema).default([]),
});

// Signature config schema
const signatureConfigSchema = z.object({
  required: z.boolean().default(true),
  type: signatureTypeSchema.default('both'),
  legalText: z.string().max(5000).optional(),
  dateRequired: z.boolean().default(true),
});

// Create form template schema
const createFormSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens').max(100).optional(),
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  type: formTypeSchema,
  category: z.string().max(100).optional(),
  sections: z.array(formSectionSchema).default([]),
  signature: signatureConfigSchema.default({
    required: true,
    type: 'both',
    dateRequired: true,
  }),
  requiresWitness: z.boolean().default(false),
  expirationDays: z.number().int().min(0).max(365).optional(),
  serviceIds: z.array(z.string().uuid()).optional(),
  isActive: z.boolean().default(true),
});

// Update form template schema
const updateFormSchema = createFormSchema.partial();

// List forms query schema
const listFormsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: formTypeSchema.optional(),
  category: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  query: z.string().max(255).optional(),
  sortBy: z.enum(['title', 'createdAt', 'updatedAt', 'type']).default('title'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Form ID param schema
const formIdSchema = z.object({
  id: z.string().uuid(),
});

// Patient ID param schema
const patientIdSchema = z.object({
  patientId: z.string().uuid(),
});

// Patient form assignment status
const assignmentStatusSchema = z.enum(['pending', 'in-progress', 'completed', 'expired']);

// Assign form to patient schema
const assignFormSchema = z.object({
  formId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
});

// List patient forms query schema
const listPatientFormsSchema = z.object({
  status: assignmentStatusSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ===================
// Type Definitions
// ===================

// Types now come from Prisma
export type StoredFormTemplate = Prisma.FormTemplateGetPayload<{}>;
export type StoredPatientFormAssignment = Prisma.PatientFormAssignmentGetPayload<{
  include: { FormTemplate: true };
}>;

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'signature' | 'file' | 'number' | 'email' | 'phone';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: FieldValidation;
  options?: string[];
  defaultValue?: any;
  helperText?: string;
  order: number;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: FormField[];
}

export interface SignatureConfig {
  required: boolean;
  type: 'draw' | 'type' | 'both';
  legalText?: string;
  dateRequired: boolean;
}

// ===================
// Helper Functions
// ===================

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

function generateFieldId(): string {
  return `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateSectionId(): string {
  return `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

async function isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const existingForm = await prisma.formTemplate.findFirst({
    where: {
      slug,
      deletedAt: null,
      id: excludeId ? { not: excludeId } : undefined,
    },
  });
  return !existingForm;
}

function processSection(section: any): FormSection {
  return {
    id: section.id || generateSectionId(),
    title: section.title,
    description: section.description,
    order: section.order,
    fields: (section.fields || []).map((field: any) => ({
      id: field.id || generateFieldId(),
      type: field.type,
      label: field.label,
      placeholder: field.placeholder,
      required: field.required ?? false,
      validation: field.validation,
      options: field.options,
      defaultValue: field.defaultValue,
      helperText: field.helperText,
      order: field.order,
    })),
  };
}

// Note: Mock data should be seeded using Prisma seed script
// See prisma/seed.ts for initial data setup

// ===================
// Middleware
// ===================

// All form routes require session authentication
forms.use('/*', sessionAuthMiddleware);

// ===================
// Routes
// ===================

/**
 * List form templates (paginated, filterable)
 * GET /api/forms
 */
forms.get('/', zValidator('query', listFormsSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Build where clause
    const where: Prisma.FormTemplateWhereInput = {
      deletedAt: null,
    };

    // Apply type filter
    if (query.type) {
      where.type = query.type.replace(/-/g, '_') as any;
    }

    // Apply category filter
    if (query.category) {
      where.category = {
        equals: query.category,
        mode: 'insensitive',
      };
    }

    // Apply active filter
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    // Apply search query
    if (query.query) {
      const searchLower = query.query.toLowerCase();
      where.OR = [
        { title: { contains: searchLower, mode: 'insensitive' } },
        { slug: { contains: searchLower, mode: 'insensitive' } },
        { description: { contains: searchLower, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    const orderBy: Prisma.FormTemplateOrderByWithRelationInput = {};
    switch (query.sortBy) {
      case 'title':
        orderBy.title = query.sortOrder;
        break;
      case 'createdAt':
        orderBy.createdAt = query.sortOrder;
        break;
      case 'updatedAt':
        orderBy.updatedAt = query.sortOrder;
        break;
      case 'type':
        orderBy.type = query.sortOrder;
        break;
      default:
        orderBy.title = query.sortOrder;
    }

    // Calculate pagination
    const offset = (query.page - 1) * query.limit;

    // Execute queries in parallel
    const [forms, total] = await Promise.all([
      prisma.formTemplate.findMany({
        where,
        orderBy,
        skip: offset,
        take: query.limit,
      }),
      prisma.formTemplate.count({ where }),
    ]);

    // Log audit event
    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'form_template_list',
      ipAddress,
      metadata: { query, resultCount: forms.length },
    });

    return c.json({
      items: forms.map(f => {
        const sections = f.sections as any as FormSection[];
        return {
          id: f.id,
          slug: f.slug,
          title: f.title,
          description: f.description,
          type: f.type.replace(/_/g, '-'),
          category: f.category,
          isActive: f.isActive,
          version: f.version,
          sectionCount: sections.length,
          fieldCount: sections.reduce((sum, s) => sum + s.fields.length, 0),
          requiresWitness: f.requiresWitness,
          createdAt: f.createdAt.toISOString(),
          updatedAt: f.updatedAt.toISOString(),
        };
      }),
      total,
      page: query.page,
      limit: query.limit,
      hasMore: offset + query.limit < total,
    });
  } catch (error) {
    console.error('Error listing forms:', error);
    throw APIError.internal('Failed to list form templates');
  }
});

/**
 * Get single form template by ID
 * GET /api/forms/:id
 */
forms.get('/:id', zValidator('param', formIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const form = await prisma.formTemplate.findUnique({
      where: { id },
    });

    if (!form || form.deletedAt) {
      throw APIError.notFound('Form template');
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'form_template',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      form: {
        ...form,
        type: form.type.replace(/_/g, '-'),
        createdAt: form.createdAt.toISOString(),
        updatedAt: form.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error getting form:', error);
    throw APIError.internal('Failed to retrieve form template');
  }
});

/**
 * Create new form template
 * POST /api/forms
 */
forms.post('/', zValidator('json', createFormSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Generate or validate slug
    const slug = data.slug || generateSlug(data.title);

    // Check slug uniqueness
    if (!(await isSlugUnique(slug))) {
      throw APIError.conflict('A form template with this slug already exists');
    }

    const id = randomUUID();
    const now = new Date();

    const form = await prisma.formTemplate.create({
      data: {
        id,
        slug,
        title: data.title,
        description: data.description,
        type: data.type.replace(/-/g, '_') as any,
        category: data.category,
        sections: (data.sections || []).map(processSection) as any,
        signature: data.signature || {
          required: true,
          type: 'both',
          dateRequired: true,
        },
        requiresWitness: data.requiresWitness ?? false,
        expirationDays: data.expirationDays,
        serviceIds: data.serviceIds || [],
        isActive: data.isActive ?? true,
        version: 1,
        createdAt: now,
        updatedAt: now,
        createdBy: user.uid,
        lastModifiedBy: user.uid,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'form_template',
      resourceId: id,
      ipAddress,
      metadata: { slug: form.slug, type: form.type },
    });

    return c.json({
      form: {
        ...form,
        type: form.type.replace(/_/g, '-'),
        createdAt: form.createdAt.toISOString(),
        updatedAt: form.updatedAt.toISOString(),
      },
      message: 'Form template created successfully',
    }, 201);
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error creating form:', error);
    throw APIError.internal('Failed to create form template');
  }
});

/**
 * Update form template
 * PUT /api/forms/:id
 */
forms.put('/:id', zValidator('param', formIdSchema), zValidator('json', updateFormSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const form = await prisma.formTemplate.findUnique({
      where: { id },
    });

    if (!form || form.deletedAt) {
      throw APIError.notFound('Form template');
    }

    // Check slug uniqueness if changing slug
    if (data.slug && data.slug !== form.slug && !(await isSlugUnique(data.slug, id))) {
      throw APIError.conflict('A form template with this slug already exists');
    }

    // Build update data
    const updateData: Prisma.FormTemplateUpdateInput = {
      lastModifiedBy: user.uid,
      version: { increment: 1 },
      updatedAt: new Date(),
    };

    if (data.slug) updateData.slug = data.slug;
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.type) updateData.type = data.type.replace(/-/g, '_') as any;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.sections) updateData.sections = data.sections.map(processSection) as any;
    if (data.signature) updateData.signature = data.signature as any;
    if (data.requiresWitness !== undefined) updateData.requiresWitness = data.requiresWitness;
    if (data.expirationDays !== undefined) updateData.expirationDays = data.expirationDays;
    if (data.serviceIds !== undefined) updateData.serviceIds = data.serviceIds;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updatedForm = await prisma.formTemplate.update({
      where: { id },
      data: updateData,
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'form_template',
      resourceId: id,
      ipAddress,
      metadata: { updatedFields: Object.keys(data), newVersion: updatedForm.version },
    });

    return c.json({
      form: {
        ...updatedForm,
        type: updatedForm.type.replace(/_/g, '-'),
        createdAt: updatedForm.createdAt.toISOString(),
        updatedAt: updatedForm.updatedAt.toISOString(),
      },
      message: 'Form template updated successfully',
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error updating form:', error);
    throw APIError.internal('Failed to update form template');
  }
});

/**
 * Delete form template (soft delete)
 * DELETE /api/forms/:id
 */
forms.delete('/:id', zValidator('param', formIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const form = await prisma.formTemplate.findUnique({
      where: { id },
    });

    if (!form || form.deletedAt) {
      throw APIError.notFound('Form template');
    }

    // Soft delete
    await prisma.formTemplate.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: user.uid,
        isActive: false,
        updatedAt: new Date(),
        lastModifiedBy: user.uid,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'DELETE',
      resourceType: 'form_template',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      success: true,
      message: 'Form template deleted successfully',
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error deleting form:', error);
    throw APIError.internal('Failed to delete form template');
  }
});

/**
 * Duplicate form template
 * POST /api/forms/:id/duplicate
 */
forms.post('/:id/duplicate', zValidator('param', formIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const originalForm = await prisma.formTemplate.findUnique({
      where: { id },
    });

    if (!originalForm || originalForm.deletedAt) {
      throw APIError.notFound('Form template');
    }

    const newId = crypto.randomUUID();
    const now = new Date();

    // Generate unique slug
    let baseSlug = `${originalForm.slug}-copy`;
    let newSlug = baseSlug;
    let counter = 1;
    while (!(await isSlugUnique(newSlug))) {
      counter++;
      newSlug = `${baseSlug}-${counter}`;
    }

    // Deep clone sections with new IDs
    const originalSections = originalForm.sections as any as FormSection[];
    const clonedSections = originalSections.map(section => ({
      ...section,
      id: generateSectionId(),
      fields: section.fields.map(field => ({
        ...field,
        id: generateFieldId(),
      })),
    }));

    const duplicatedForm = await prisma.formTemplate.create({
      data: {
        id: newId,
        slug: newSlug,
        title: `${originalForm.title} (Copy)`,
        description: originalForm.description,
        type: originalForm.type,
        category: originalForm.category,
        sections: clonedSections as any,
        signature: originalForm.signature as any,
        requiresWitness: originalForm.requiresWitness,
        expirationDays: originalForm.expirationDays,
        serviceIds: originalForm.serviceIds,
        isActive: originalForm.isActive,
        version: 1,
        createdAt: now,
        updatedAt: now,
        createdBy: user.uid,
        lastModifiedBy: user.uid,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'form_template',
      resourceId: newId,
      ipAddress,
      metadata: { duplicatedFrom: id, slug: duplicatedForm.slug },
    });

    return c.json({
      form: {
        ...duplicatedForm,
        type: duplicatedForm.type.replace(/_/g, '-'),
        createdAt: duplicatedForm.createdAt.toISOString(),
        updatedAt: duplicatedForm.updatedAt.toISOString(),
      },
      message: 'Form template duplicated successfully',
    }, 201);
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error duplicating form:', error);
    throw APIError.internal('Failed to duplicate form template');
  }
});

// ===================
// Patient Form Assignment Routes
// ===================

/**
 * List forms assigned to patient
 * GET /api/patients/:patientId/forms
 */
forms.get('/patients/:patientId/forms', zValidator('param', patientIdSchema), zValidator('query', listPatientFormsSchema), async (c) => {
  const { patientId } = c.req.valid('param');
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Build where clause
    const where: Prisma.PatientFormAssignmentWhereInput = {
      patientId,
    };

    // Apply status filter
    if (query.status) {
      where.status = query.status.replace(/-/g, '_') as any;
    }

    // Calculate pagination
    const offset = (query.page - 1) * query.limit;

    // Execute queries in parallel
    const [assignments, total] = await Promise.all([
      prisma.patientFormAssignment.findMany({
        where,
        orderBy: { assignedAt: 'desc' },
        skip: offset,
        take: query.limit,
        include: {
          FormTemplate: true,
        },
      }),
      prisma.patientFormAssignment.count({ where }),
    ]);

    // Enrich with form details
    const items = assignments.map(a => ({
      id: a.id,
      formId: a.formId,
      formTitle: a.FormTemplate?.title ?? 'Unknown Form',
      formType: a.FormTemplate?.type.replace(/_/g, '-'),
      patientId: a.patientId,
      appointmentId: a.appointmentId,
      dueDate: a.dueDate?.toISOString(),
      status: a.status.replace(/_/g, '-'),
      assignedAt: a.assignedAt.toISOString(),
      assignedBy: a.assignedBy,
      completedAt: a.completedAt?.toISOString(),
    }));

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'patient_form_assignments',
      ipAddress,
      metadata: { patientId, resultCount: items.length },
    });

    return c.json({
      items,
      total,
      page: query.page,
      limit: query.limit,
      hasMore: offset + query.limit < total,
    });
  } catch (error) {
    console.error('Error listing patient forms:', error);
    throw APIError.internal('Failed to list patient form assignments');
  }
});

/**
 * Assign form to patient
 * POST /api/patients/:patientId/forms
 */
forms.post('/patients/:patientId/forms', zValidator('param', patientIdSchema), zValidator('json', assignFormSchema), async (c) => {
  const { patientId } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Verify form exists
    const form = await prisma.formTemplate.findUnique({
      where: { id: data.formId },
    });

    if (!form || form.deletedAt) {
      throw APIError.notFound('Form template');
    }

    // Check if form is active
    if (!form.isActive) {
      throw APIError.badRequest('Cannot assign inactive form template');
    }

    const id = randomUUID();
    const now = new Date();

    const assignment = await prisma.patientFormAssignment.create({
      data: {
        id,
        formId: data.formId,
        patientId,
        appointmentId: data.appointmentId,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: 'pending',
        assignedAt: now,
        assignedBy: user.uid,
      },
      include: {
        FormTemplate: true,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'patient_form_assignment',
      resourceId: id,
      ipAddress,
      metadata: { patientId, formId: data.formId },
    });

    return c.json({
      assignment: {
        id: assignment.id,
        formId: assignment.formId,
        formTitle: assignment.FormTemplate.title,
        formType: assignment.FormTemplate.type.replace(/_/g, '-'),
        patientId: assignment.patientId,
        appointmentId: assignment.appointmentId,
        dueDate: assignment.dueDate?.toISOString(),
        status: assignment.status.replace(/_/g, '-'),
        assignedAt: assignment.assignedAt.toISOString(),
        assignedBy: assignment.assignedBy,
      },
      message: 'Form assigned to patient successfully',
    }, 201);
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error assigning form to patient:', error);
    throw APIError.internal('Failed to assign form to patient');
  }
});

// ===================
// Export Functions (for testing)
// ===================

/**
 * Clear all form data from database (for testing only)
 */
export async function clearFormData() {
  await prisma.$transaction([
    prisma.formSubmission.deleteMany({}),
    prisma.patientFormAssignment.deleteMany({}),
    prisma.formTemplate.deleteMany({}),
  ]);
}

/**
 * Get Prisma client instance (for testing)
 */
export function getPrismaClient() {
  return prisma;
}

export default forms;
