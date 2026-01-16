/**
 * Treatment Templates & Provider Playbooks API Routes
 *
 * Manages:
 * - Treatment templates (reusable treatment configurations)
 * - Provider playbooks (personal protocols and DOT phrases)
 * - Template zone configurations
 * - Product preferences
 * - Audit logging
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sessionAuthMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { handlePrismaError } from '../middleware/prisma-error-handler';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { Prisma, ProductType } from '@prisma/client';

const treatmentTemplates = new Hono();

// ===================
// Constants
// ===================

// Standard face zones (25 zones)
export const FACE_ZONES = [
  { id: 'forehead', name: 'Forehead', region: 'upper', defaultUnits: 20 },
  { id: 'glabella', name: 'Glabella', region: 'upper', defaultUnits: 20 },
  { id: 'crows-feet-left', name: "Crow's Feet Left", region: 'mid', defaultUnits: 12 },
  { id: 'crows-feet-right', name: "Crow's Feet Right", region: 'mid', defaultUnits: 12 },
  { id: 'bunny-lines', name: 'Bunny Lines', region: 'mid', defaultUnits: 4 },
  { id: 'nasalis', name: 'Nasalis', region: 'mid', defaultUnits: 4 },
  { id: 'upper-lip', name: 'Upper Lip', region: 'lower', defaultUnits: 4 },
  { id: 'lower-lip', name: 'Lower Lip', region: 'lower', defaultUnits: 4 },
  { id: 'chin', name: 'Chin (Mentalis)', region: 'lower', defaultUnits: 6 },
  { id: 'marionette-left', name: 'Marionette Left', region: 'lower', defaultVolume: 0.5 },
  { id: 'marionette-right', name: 'Marionette Right', region: 'lower', defaultVolume: 0.5 },
  { id: 'nasolabial-left', name: 'Nasolabial Fold Left', region: 'mid', defaultVolume: 0.5 },
  { id: 'nasolabial-right', name: 'Nasolabial Fold Right', region: 'mid', defaultVolume: 0.5 },
  { id: 'cheek-left', name: 'Cheek Left', region: 'mid', defaultVolume: 1.0 },
  { id: 'cheek-right', name: 'Cheek Right', region: 'mid', defaultVolume: 1.0 },
  { id: 'jawline-left', name: 'Jawline Left', region: 'lower', defaultVolume: 1.0 },
  { id: 'jawline-right', name: 'Jawline Right', region: 'lower', defaultVolume: 1.0 },
  { id: 'temple-left', name: 'Temple Left', region: 'upper', defaultVolume: 0.5 },
  { id: 'temple-right', name: 'Temple Right', region: 'upper', defaultVolume: 0.5 },
  { id: 'tear-trough-left', name: 'Tear Trough Left', region: 'mid', defaultVolume: 0.3 },
  { id: 'tear-trough-right', name: 'Tear Trough Right', region: 'mid', defaultVolume: 0.3 },
  { id: 'nose', name: 'Nose', region: 'mid', defaultVolume: 0.5 },
  { id: 'neck', name: 'Neck (Platysma)', region: 'lower', defaultUnits: 25 },
  { id: 'masseter-left', name: 'Masseter Left', region: 'lower', defaultUnits: 25 },
  { id: 'masseter-right', name: 'Masseter Right', region: 'lower', defaultUnits: 25 },
] as const;

const VALID_ZONE_IDS = FACE_ZONES.map(z => z.id);

// ===================
// Validation Schemas
// ===================

// Product type
const productTypeSchema = z.enum(['neurotoxin', 'filler', 'laser', 'skin', 'body', 'other']);

// Template zone schema
const templateZoneSchema = z.object({
  zoneId: z.string().refine(val => VALID_ZONE_IDS.includes(val as any), {
    message: 'Invalid zone ID',
  }),
  defaultUnits: z.number().positive().optional(),
  defaultVolume: z.number().positive().optional(),
  technique: z.string().max(100).optional(),
  depth: z.string().max(50).optional(),
});

// Template product schema
const templateProductSchema = z.object({
  productId: z.string().uuid(),
  productName: z.string().min(1).max(255),
  defaultUnits: z.number().positive().optional(),
  defaultVolume: z.number().positive().optional(),
});

// SOAP defaults schema
const soapDefaultsSchema = z.object({
  subjective: z.object({
    chiefComplaint: z.string().max(2000).optional(),
    patientGoals: z.string().max(2000).optional(),
    medicalHistory: z.string().max(5000).optional(),
  }).optional(),
  objective: z.object({
    skinAssessment: z.string().max(2000).optional(),
    photographs: z.string().max(1000).optional(),
  }).optional(),
  assessment: z.object({
    diagnosis: z.string().max(2000).optional(),
    treatmentCandidacy: z.string().max(2000).optional(),
    contraindications: z.string().max(2000).optional(),
  }).optional(),
  plan: z.object({
    treatmentPerformed: z.string().max(5000).optional(),
    aftercareInstructions: z.string().max(5000).optional(),
    followUpPlan: z.string().max(2000).optional(),
  }).optional(),
}).optional();

// Create treatment template schema
const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  productType: productTypeSchema,
  defaultZones: z.array(templateZoneSchema).optional().default([]),
  defaultProducts: z.array(templateProductSchema).optional().default([]),
  soapDefaults: soapDefaultsSchema,
  estimatedDuration: z.number().int().positive().max(480),
  requiredConsents: z.array(z.string()).optional(),
  aftercareInstructions: z.string().max(5000).optional(),
  isGlobal: z.boolean().default(false),
  providerId: z.string().optional(),
});

// Update template schema
const updateTemplateSchema = createTemplateSchema.partial();

// List templates query schema
const listTemplatesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  productType: productTypeSchema.optional(),
  providerId: z.string().optional(),
  isGlobal: z.coerce.boolean().optional(),
  query: z.string().max(255).optional(),
});

// Template ID param schema
const templateIdSchema = z.object({
  id: z.string().uuid(),
});

// Playbook protocol schema
const playbookProtocolSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  treatmentArea: z.string().min(1).max(255),
  productType: z.string().min(1).max(100),
  zones: z.array(templateZoneSchema).optional().default([]),
  notes: z.string().max(2000).optional(),
});

// DOT phrase schema
const dotPhraseSchema = z.object({
  id: z.string().uuid().optional(),
  trigger: z.string().min(1).max(50).refine(val => val.startsWith('.'), {
    message: 'DOT phrase trigger must start with a period (.)',
  }),
  expansion: z.string().min(1).max(5000),
  category: z.string().max(100).optional(),
});

// Create playbook schema
const createPlaybookSchema = z.object({
  providerId: z.string().min(1),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  protocols: z.array(playbookProtocolSchema).optional().default([]),
  dotPhrases: z.array(dotPhraseSchema).optional().default([]),
  defaultProductPreferences: z.record(z.string()).optional(),
});

// Update playbook schema
const updatePlaybookSchema = createPlaybookSchema.partial().omit({ providerId: true });

// Playbook ID param schema
const playbookIdSchema = z.object({
  id: z.string().uuid(),
});

// ===================
// Types
// ===================

export interface TemplateZone {
  zoneId: string;
  defaultUnits?: number;
  defaultVolume?: number;
  technique?: string;
  depth?: string;
}

export interface TemplateProduct {
  productId: string;
  productName: string;
  defaultUnits?: number;
  defaultVolume?: number;
}

export interface SOAPDefaults {
  subjective?: {
    chiefComplaint?: string;
    patientGoals?: string;
    medicalHistory?: string;
  };
  objective?: {
    skinAssessment?: string;
    photographs?: string;
  };
  assessment?: {
    diagnosis?: string;
    treatmentCandidacy?: string;
    contraindications?: string;
  };
  plan?: {
    treatmentPerformed?: string;
    aftercareInstructions?: string;
    followUpPlan?: string;
  };
}

export interface PlaybookProtocol {
  id: string;
  name: string;
  treatmentArea: string;
  productType: string;
  zones: TemplateZone[];
  notes?: string;
}

export interface DotPhrase {
  id: string;
  trigger: string;
  expansion: string;
  category?: string;
}

// ===================
// Helper Functions
// ===================

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

// ===================
// Middleware
// ===================

// All routes require session authentication
treatmentTemplates.use('/*', sessionAuthMiddleware);

// ===================
// IMPORTANT: Specific routes MUST come before parameterized routes (/:id)
// ===================

// ===================
// Face Zones Reference Route (BEFORE /:id)
// ===================

/**
 * Get face zones reference
 * GET /api/treatment-templates/zones
 */
treatmentTemplates.get('/zones', async (c) => {
  return c.json({
    zones: FACE_ZONES,
    total: FACE_ZONES.length,
  });
});

// ===================
// Provider Playbook Routes (BEFORE /:id)
// ===================

/**
 * List provider playbooks
 * GET /api/treatment-templates/playbooks
 */
treatmentTemplates.get('/playbooks', async (c) => {
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Users can only see their own playbooks
    const results = await prisma.providerPlaybook.findMany({
      where: { providerId: user.uid },
      orderBy: { createdAt: 'desc' },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'playbook_list',
      ipAddress,
      metadata: { resultCount: results.length },
    });

    return c.json({
      items: results.map(p => ({
        id: p.id,
        providerId: p.providerId,
        name: p.name,
        description: p.description,
        protocolCount: Array.isArray(p.protocols) ? (p.protocols as any[]).length : 0,
        dotPhraseCount: Array.isArray(p.dotPhrases) ? (p.dotPhrases as any[]).length : 0,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      total: results.length,
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Create new playbook
 * POST /api/treatment-templates/playbooks
 */
treatmentTemplates.post('/playbooks', zValidator('json', createPlaybookSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Check if user already has a playbook (one per provider)
    const existingPlaybook = await prisma.providerPlaybook.findUnique({
      where: { providerId: data.providerId },
    });

    if (existingPlaybook) {
      throw APIError.conflict('A playbook already exists for this provider');
    }

    // Assign IDs to protocols and dotPhrases if not provided
    const protocols = data.protocols.map(p => ({
      ...p,
      id: p.id || crypto.randomUUID(),
    }));

    const dotPhrases = data.dotPhrases.map(d => ({
      ...d,
      id: d.id || crypto.randomUUID(),
    }));

    const playbook = await prisma.providerPlaybook.create({
      data: {
        providerId: data.providerId,
        name: data.name,
        description: data.description,
        protocols: protocols as any,
        dotPhrases: dotPhrases as any,
        defaultProductPreferences: data.defaultProductPreferences as any,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'playbook',
      resourceId: playbook.id,
      ipAddress,
      metadata: { providerId: data.providerId, name: data.name },
    });

    return c.json({
      playbook: {
        ...playbook,
        createdAt: playbook.createdAt.toISOString(),
        updatedAt: playbook.updatedAt.toISOString(),
      },
      message: 'Playbook created successfully',
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get single playbook by ID
 * GET /api/treatment-templates/playbooks/:id
 */
treatmentTemplates.get('/playbooks/:id', zValidator('param', playbookIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const playbook = await prisma.providerPlaybook.findUnique({
      where: { id },
    });

    if (!playbook) {
      throw APIError.notFound('Playbook');
    }

    // Check ownership
    if (playbook.providerId !== user.uid) {
      throw APIError.forbidden('Access denied to this playbook');
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'playbook',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      playbook: {
        ...playbook,
        createdAt: playbook.createdAt.toISOString(),
        updatedAt: playbook.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Update playbook
 * PUT /api/treatment-templates/playbooks/:id
 */
treatmentTemplates.put('/playbooks/:id', zValidator('param', playbookIdSchema), zValidator('json', updatePlaybookSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const playbook = await prisma.providerPlaybook.findUnique({
      where: { id },
    });

    if (!playbook) {
      throw APIError.notFound('Playbook');
    }

    // Check ownership
    if (playbook.providerId !== user.uid) {
      throw APIError.forbidden('Access denied to this playbook');
    }

    // Assign IDs to new protocols and dotPhrases
    let protocols = playbook.protocols;
    if (data.protocols !== undefined) {
      protocols = data.protocols.map(p => ({
        ...p,
        id: p.id || crypto.randomUUID(),
      })) as any;
    }

    let dotPhrases = playbook.dotPhrases;
    if (data.dotPhrases !== undefined) {
      dotPhrases = data.dotPhrases.map(d => ({
        ...d,
        id: d.id || crypto.randomUUID(),
      })) as any;
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.protocols !== undefined) updateData.protocols = protocols;
    if (data.dotPhrases !== undefined) updateData.dotPhrases = dotPhrases;
    if (data.defaultProductPreferences !== undefined) {
      updateData.defaultProductPreferences = data.defaultProductPreferences;
    }

    const updatedPlaybook = await prisma.providerPlaybook.update({
      where: { id },
      data: updateData,
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'playbook',
      resourceId: id,
      ipAddress,
      metadata: { updatedFields: Object.keys(data) },
    });

    return c.json({
      playbook: {
        ...updatedPlaybook,
        createdAt: updatedPlaybook.createdAt.toISOString(),
        updatedAt: updatedPlaybook.updatedAt.toISOString(),
      },
      message: 'Playbook updated successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Delete playbook
 * DELETE /api/treatment-templates/playbooks/:id
 */
treatmentTemplates.delete('/playbooks/:id', zValidator('param', playbookIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const playbook = await prisma.providerPlaybook.findUnique({
      where: { id },
    });

    if (!playbook) {
      throw APIError.notFound('Playbook');
    }

    // Check ownership
    if (playbook.providerId !== user.uid) {
      throw APIError.forbidden('Access denied to this playbook');
    }

    await prisma.providerPlaybook.delete({
      where: { id },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'DELETE',
      resourceType: 'playbook',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      success: true,
      message: 'Playbook deleted successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

// ===================
// Treatment Template Routes
// ===================

/**
 * List treatment templates (paginated, filterable)
 * GET /api/treatment-templates
 */
treatmentTemplates.get('/', zValidator('query', listTemplatesSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Build where clause
    const where: Prisma.TreatmentTemplateWhereInput = {
      OR: [
        { isGlobal: true },
        { providerId: user.uid },
      ],
    };

    // Apply filters
    if (query.productType) {
      where.productType = query.productType as ProductType;
    }
    if (query.providerId) {
      where.providerId = query.providerId;
    }
    if (query.isGlobal !== undefined) {
      where.isGlobal = query.isGlobal;
    }
    if (query.query) {
      const searchLower = query.query.toLowerCase();
      where.OR = [
        { name: { contains: searchLower, mode: 'insensitive' } },
        { description: { contains: searchLower, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.treatmentTemplate.count({ where });

    // Get paginated results
    const offset = (query.page - 1) * query.limit;
    const results = await prisma.treatmentTemplate.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: offset,
      take: query.limit,
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'treatment_template_list',
      ipAddress,
      metadata: { query, resultCount: results.length },
    });

    return c.json({
      items: results.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        productType: t.productType,
        estimatedDuration: t.estimatedDuration,
        isGlobal: t.isGlobal,
        providerId: t.providerId,
        zoneCount: Array.isArray(t.defaultZones) ? (t.defaultZones as any[]).length : 0,
        productCount: Array.isArray(t.defaultProducts) ? (t.defaultProducts as any[]).length : 0,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      total,
      page: query.page,
      limit: query.limit,
      hasMore: offset + query.limit < total,
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Create new treatment template
 * POST /api/treatment-templates
 */
treatmentTemplates.post('/', zValidator('json', createTemplateSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // If not global, must have providerId or use current user
    if (!data.isGlobal && !data.providerId) {
      data.providerId = user.uid;
    }

    const template = await prisma.treatmentTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        productType: data.productType as ProductType,
        defaultZones: data.defaultZones as any,
        defaultProducts: data.defaultProducts as any,
        soapDefaults: data.soapDefaults as any,
        estimatedDuration: data.estimatedDuration,
        requiredConsents: data.requiredConsents || [],
        aftercareInstructions: data.aftercareInstructions,
        isGlobal: data.isGlobal,
        providerId: data.providerId,
        createdBy: user.uid,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'treatment_template',
      resourceId: template.id,
      ipAddress,
      metadata: { name: data.name, productType: data.productType, isGlobal: data.isGlobal },
    });

    return c.json({
      template: {
        ...template,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
      },
      message: 'Treatment template created successfully',
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get single treatment template by ID
 * GET /api/treatment-templates/:id
 */
treatmentTemplates.get('/:id', zValidator('param', templateIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const template = await prisma.treatmentTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw APIError.notFound('Treatment template');
    }

    // Check visibility
    if (!template.isGlobal && template.providerId !== user.uid) {
      throw APIError.forbidden('Access denied to this template');
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'treatment_template',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      template: {
        ...template,
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Update treatment template
 * PUT /api/treatment-templates/:id
 */
treatmentTemplates.put('/:id', zValidator('param', templateIdSchema), zValidator('json', updateTemplateSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const template = await prisma.treatmentTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw APIError.notFound('Treatment template');
    }

    // Check ownership - only owner or admin can update
    if (!template.isGlobal && template.providerId !== user.uid) {
      throw APIError.forbidden('Access denied to this template');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.productType !== undefined) updateData.productType = data.productType as ProductType;
    if (data.defaultZones !== undefined) updateData.defaultZones = data.defaultZones;
    if (data.defaultProducts !== undefined) updateData.defaultProducts = data.defaultProducts;
    if (data.soapDefaults !== undefined) updateData.soapDefaults = data.soapDefaults;
    if (data.estimatedDuration !== undefined) updateData.estimatedDuration = data.estimatedDuration;
    if (data.requiredConsents !== undefined) updateData.requiredConsents = data.requiredConsents;
    if (data.aftercareInstructions !== undefined) updateData.aftercareInstructions = data.aftercareInstructions;
    if (data.isGlobal !== undefined) updateData.isGlobal = data.isGlobal;
    if (data.providerId !== undefined) updateData.providerId = data.providerId;

    const updatedTemplate = await prisma.treatmentTemplate.update({
      where: { id },
      data: updateData,
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'treatment_template',
      resourceId: id,
      ipAddress,
      metadata: { updatedFields: Object.keys(data) },
    });

    return c.json({
      template: {
        ...updatedTemplate,
        createdAt: updatedTemplate.createdAt.toISOString(),
        updatedAt: updatedTemplate.updatedAt.toISOString(),
      },
      message: 'Treatment template updated successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Delete treatment template
 * DELETE /api/treatment-templates/:id
 */
treatmentTemplates.delete('/:id', zValidator('param', templateIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const template = await prisma.treatmentTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw APIError.notFound('Treatment template');
    }

    // Check ownership
    if (!template.isGlobal && template.providerId !== user.uid) {
      throw APIError.forbidden('Access denied to this template');
    }

    await prisma.treatmentTemplate.delete({
      where: { id },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'DELETE',
      resourceType: 'treatment_template',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      success: true,
      message: 'Treatment template deleted successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

export default treatmentTemplates;
