/**
 * Service API Routes
 *
 * Handles CRUD operations for medical spa services
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { sessionAuthMiddleware, optionalSessionAuthMiddleware, requirePermission, requireRole } from '../middleware/auth';
import {
  createServiceSchema,
  updateServiceSchema,
  serviceSearchSchema,
  serviceIdParamSchema,
  serviceCategorySchema,
  z,
} from '@medical-spa/validations';
import { APIError } from '../middleware/error';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const services = new Hono();

// =============================================================================
// Service Categories (Static Data)
// =============================================================================

const serviceCategories = [
  { id: 'physiotherapy', name: 'Physiotherapy', description: 'Physical therapy and rehabilitation' },
  { id: 'chiropractic', name: 'Chiropractic', description: 'Spinal and musculoskeletal care' },
  { id: 'aesthetics', name: 'Aesthetics', description: 'Cosmetic and beauty treatments' },
  { id: 'massage', name: 'Massage', description: 'Therapeutic massage services' },
  { id: 'wellness', name: 'Wellness', description: 'General wellness and health services' },
  { id: 'consultation', name: 'Consultation', description: 'Initial consultations and assessments' },
  { id: 'injectables', name: 'Injectables', description: 'Injectable treatments' },
  { id: 'laser', name: 'Laser', description: 'Laser treatments' },
  { id: 'facial', name: 'Facial', description: 'Facial treatments' },
  { id: 'body_contouring', name: 'Body Contouring', description: 'Body sculpting and contouring' },
  { id: 'skincare', name: 'Skincare', description: 'Skincare services' },
  { id: 'other', name: 'Other', description: 'Other services' },
];

// =============================================================================
// Helper Functions
// =============================================================================

async function buildServiceQuery(query: z.infer<typeof serviceSearchSchema>) {
  const where: Prisma.ServiceWhereInput = {};

  // Text search
  if (query.query) {
    const searchTerm = query.query.toLowerCase();
    where.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  // Filter by single category
  if (query.category) {
    where.category = query.category;
  }

  // Filter by multiple categories
  if (query.categories && query.categories.length > 0) {
    where.category = { in: query.categories };
  }

  // Filter by active status
  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  // Filter by price range
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {};
    if (query.minPrice !== undefined) {
      where.price.gte = query.minPrice;
    }
    if (query.maxPrice !== undefined) {
      where.price.lte = query.maxPrice;
    }
  }

  // Filter by duration range
  if (query.minDuration !== undefined || query.maxDuration !== undefined) {
    where.duration = {};
    if (query.minDuration !== undefined) {
      where.duration.gte = query.minDuration;
    }
    if (query.maxDuration !== undefined) {
      where.duration.lte = query.maxDuration;
    }
  }

  return where;
}

// =============================================================================
// Public Routes (No Auth Required)
// =============================================================================

/**
 * List service categories
 * GET /api/services/categories
 */
services.get('/categories', async (c) => {
  return c.json({
    items: serviceCategories,
    total: serviceCategories.length,
  });
});

/**
 * List all services (public - for booking widget)
 * GET /api/services
 */
services.get('/', optionalSessionAuthMiddleware, zValidator('query', serviceSearchSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');

  // For public access, only show active services
  if (!user) {
    query.isActive = true;
  }

  // Build query conditions
  const where = await buildServiceQuery(query);

  // Handle practitioner filter (requires include with ServicePractitioner)
  if (query.practitionerId) {
    where.ServicePractitioner = {
      some: {
        practitionerId: query.practitionerId,
      },
    };
  }

  // Pagination
  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  // Get services with total count
  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip: offset,
      take: limit,
    }),
    prisma.service.count({ where }),
  ]);

  return c.json({
    items: services,
    total,
    page,
    limit,
    hasMore: offset + limit < total,
  });
});

/**
 * Get single service by ID (public)
 * GET /api/services/:serviceId
 */
services.get('/:serviceId', optionalSessionAuthMiddleware, zValidator('param', serviceIdParamSchema), async (c) => {
  const { serviceId } = c.req.valid('param');
  const user = c.get('user');

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw APIError.notFound('Service');
  }

  // For public access, only show active services
  if (!user && !service.isActive) {
    throw APIError.notFound('Service');
  }

  return c.json(service);
});

// =============================================================================
// Protected Routes (Auth Required)
// =============================================================================

/**
 * Create a new service
 * POST /api/services
 */
services.post(
  '/',
  sessionAuthMiddleware,
  requireRole('admin', 'owner', 'manager'),
  zValidator('json', createServiceSchema),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');

    // Create service with practitioner assignments
    const service = await prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
        duration: data.duration,
        scheduledDuration: data.scheduledDuration,
        price: data.price,
        depositRequired: data.depositRequired,
        depositAmount: data.depositAmount,
        isActive: data.isActive,
        // Create practitioner assignments if provided
        ...(data.practitionerIds && data.practitionerIds.length > 0 && {
          ServicePractitioner: {
            create: data.practitionerIds.map(practitionerId => ({
              practitionerId,
            })),
          },
        }),
      },
    });

    return c.json(service, 201);
  }
);

/**
 * Update a service
 * PUT /api/services/:serviceId
 */
services.put(
  '/:serviceId',
  sessionAuthMiddleware,
  requireRole('admin', 'owner', 'manager'),
  zValidator('param', serviceIdParamSchema),
  zValidator('json', updateServiceSchema),
  async (c) => {
    const { serviceId } = c.req.valid('param');
    const data = c.req.valid('json');
    const user = c.get('user');

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      throw APIError.notFound('Service');
    }

    // Prepare update data
    const updateData: Prisma.ServiceUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.scheduledDuration !== undefined) updateData.scheduledDuration = data.scheduledDuration;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.depositRequired !== undefined) updateData.depositRequired = data.depositRequired;
    if (data.depositAmount !== undefined) updateData.depositAmount = data.depositAmount;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Update practitioner assignments if provided
    if (data.practitionerIds !== undefined) {
      updateData.ServicePractitioner = {
        deleteMany: {},
        create: data.practitionerIds.map(practitionerId => ({
          practitionerId,
        })),
      };
    }

    // Update service
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
    });

    return c.json(updatedService);
  }
);

/**
 * Partially update a service
 * PATCH /api/services/:serviceId
 */
services.patch(
  '/:serviceId',
  sessionAuthMiddleware,
  requireRole('admin', 'owner', 'manager'),
  zValidator('param', serviceIdParamSchema),
  zValidator('json', updateServiceSchema),
  async (c) => {
    const { serviceId } = c.req.valid('param');
    const data = c.req.valid('json');
    const user = c.get('user');

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      throw APIError.notFound('Service');
    }

    // Prepare update data (same as PUT for PATCH in this case)
    const updateData: Prisma.ServiceUpdateInput = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.scheduledDuration !== undefined) updateData.scheduledDuration = data.scheduledDuration;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.depositRequired !== undefined) updateData.depositRequired = data.depositRequired;
    if (data.depositAmount !== undefined) updateData.depositAmount = data.depositAmount;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Update practitioner assignments if provided
    if (data.practitionerIds !== undefined) {
      updateData.ServicePractitioner = {
        deleteMany: {},
        create: data.practitionerIds.map(practitionerId => ({
          practitionerId,
        })),
      };
    }

    // Update service
    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: updateData,
    });

    return c.json(updatedService);
  }
);

/**
 * Deactivate a service (soft delete)
 * DELETE /api/services/:serviceId
 */
services.delete(
  '/:serviceId',
  sessionAuthMiddleware,
  requireRole('admin', 'owner'),
  zValidator('param', serviceIdParamSchema),
  async (c) => {
    const { serviceId } = c.req.valid('param');
    const user = c.get('user');

    // Check if service exists
    const existingService = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!existingService) {
      throw APIError.notFound('Service');
    }

    // Soft delete - just mark as inactive
    await prisma.service.update({
      where: { id: serviceId },
      data: {
        isActive: false,
      },
    });

    return c.json({
      message: 'Service deactivated',
      id: serviceId,
    });
  }
);

/**
 * Get providers who can perform a service
 * GET /api/services/:serviceId/providers
 */
services.get(
  '/:serviceId/providers',
  optionalSessionAuthMiddleware,
  zValidator('param', serviceIdParamSchema),
  async (c) => {
    const { serviceId } = c.req.valid('param');

    // Check if service exists and get practitioners
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        ServicePractitioner: {
          select: {
            practitionerId: true,
          },
        },
      },
    });

    if (!service) {
      throw APIError.notFound('Service');
    }

    const providerIds = service.ServicePractitioner.map(sp => sp.practitionerId);

    return c.json({
      serviceId,
      providerIds,
      total: providerIds.length,
    });
  }
);

export default services;
