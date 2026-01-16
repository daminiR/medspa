/**
 * Packages API Routes
 *
 * Full CRUD operations for service package management with:
 * - Public listing for available packages
 * - Package purchase for patients
 * - Redemption of package services
 * - Usage history tracking
 * - Audit logging
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sessionAuthMiddleware, optionalSessionAuthMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const packages = new Hono();

// ===================
// Validation Schemas
// ===================

// Package item schema
const packageItemSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['service', 'product']),
  itemId: z.string().min(1),
  itemName: z.string().min(1).max(255),
  quantity: z.number().int().positive(),
  unitValue: z.number().nonnegative(),
});

// Package restrictions schema
const packageRestrictionsSchema = z.object({
  specificProviders: z.array(z.string()).optional(),
  specificLocations: z.array(z.string()).optional(),
  blackoutDates: z.array(z.string()).optional(),
  shareable: z.boolean().default(false),
  transferable: z.boolean().default(false),
  maxRedemptionsPerVisit: z.number().int().positive().optional(),
});

// Create package schema
const createPackageSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional().default(''),
  category: z.string().max(100).optional(),
  imageUrl: z.string().url().optional(),
  contents: z.array(packageItemSchema).min(1),
  regularPrice: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  validityDays: z.number().int().positive().default(365),
  restrictions: packageRestrictionsSchema.optional(),
  isActive: z.boolean().default(true),
  availableForPurchase: z.boolean().default(true),
  displayOrder: z.number().int().nonnegative().default(0),
});

// Update package schema (all fields optional)
const updatePackageSchema = createPackageSchema.partial();

// List packages query schema
const listPackagesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().optional(),
  includeInactive: z.coerce.boolean().optional().default(false),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sortBy: z.enum(['name', 'salePrice', 'displayOrder', 'createdAt']).default('displayOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Package ID param schema
const packageIdSchema = z.object({
  id: z.string().min(1),
});

// Patient ID param schema
const patientIdSchema = z.object({
  patientId: z.string().uuid(),
});

// Purchase ID param schema
const purchaseIdSchema = z.object({
  patientId: z.string().uuid(),
  purchaseId: z.string().min(1),
});

// Purchase package schema
const purchasePackageSchema = z.object({
  patientId: z.string().uuid(),
  invoiceId: z.string().optional(),
  paymentId: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

// Redeem package service schema
const redeemPackageSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  appointmentId: z.string().optional(),
  invoiceId: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

// List patient packages query schema
const listPatientPackagesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['active', 'partially_used', 'fully_used', 'expired', 'cancelled', 'refunded']).optional(),
  includeExpired: z.coerce.boolean().optional().default(false),
});

// ===================
// Type Definitions (now from Prisma)
// ===================

export type Package = Prisma.PackageGetPayload<{}>;
export type PackagePurchase = Prisma.PackagePurchaseGetPayload<{}>;

// JSON field types (not in Prisma schema directly)
interface PackageRedemption {
  id: string;
  itemId: string;
  quantity: number;
  appointmentId?: string;
  invoiceId?: string;
  redeemedAt: Date;
  redeemedBy: string;
  notes?: string;
}

interface PackagePurchaseItem {
  id: string;
  type: 'service' | 'product';
  itemId: string;
  itemName: string;
  quantityTotal: number;
  quantityUsed: number;
  quantityRemaining: number;
  redemptions: PackageRedemption[];
}

// ===================
// Helper Functions
// ===================

function generateId(prefix: string = 'pkg'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

function calculateSavings(regularPrice: number, salePrice: number): { savings: number; savingsPercent: number } {
  const savings = Math.max(0, regularPrice - salePrice);
  const savingsPercent = regularPrice > 0 ? Math.round((savings / regularPrice) * 100) : 0;
  return { savings, savingsPercent };
}

async function updatePurchaseStatus(purchase: PackagePurchase): Promise<string> {
  const now = new Date();
  const items = purchase.items as any;

  // Check if expired
  if (now > purchase.validUntil && purchase.status !== 'CANCELLED' && purchase.status !== 'REFUNDED') {
    return 'EXPIRED';
  }

  // Calculate usage
  const totalItems = items.reduce((sum: number, item: any) => sum + item.quantityTotal, 0);
  const usedItems = items.reduce((sum: number, item: any) => sum + item.quantityUsed, 0);

  if (usedItems === 0) {
    return 'ACTIVE';
  } else if (usedItems >= totalItems) {
    return 'FULLY_USED';
  } else {
    return 'PARTIALLY_USED';
  }
}

function serializePackage(pkg: Package): object {
  return {
    ...pkg,
    createdAt: pkg.createdAt.toISOString(),
    updatedAt: pkg.updatedAt.toISOString(),
  };
}

function serializePurchase(purchase: PackagePurchase): object {
  const items = purchase.items as any;
  return {
    ...purchase,
    status: purchase.status.toLowerCase(),
    purchaseDate: purchase.purchaseDate.toISOString(),
    validFrom: purchase.validFrom.toISOString(),
    validUntil: purchase.validUntil.toISOString(),
    createdAt: purchase.createdAt.toISOString(),
    updatedAt: purchase.updatedAt.toISOString(),
    items: items.map((item: any) => ({
      ...item,
      redemptions: item.redemptions?.map((r: any) => ({
        ...r,
        redeemedAt: r.redeemedAt.toISOString(),
      })) || [],
    })),
  };
}

// Note: Mock data should be seeded using Prisma seed script
// See prisma/seed.ts for initial data setup

// ===================
// Public Routes (no auth required for listing)
// ===================

/**
 * List available packages (public)
 * GET /api/packages
 */
packages.get('/', optionalSessionAuthMiddleware, zValidator('query', listPackagesSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Build where clause
  const where: Prisma.PackageWhereInput = {};

  // For unauthenticated users, only show active and available packages
  if (!user) {
    where.isActive = true;
    where.availableForPurchase = true;
  } else if (!query.includeInactive) {
    where.isActive = true;
  }

  // Apply category filter
  if (query.category) {
    where.category = query.category;
  }

  // Apply price filters
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.salePrice = {};
    if (query.minPrice !== undefined) {
      where.salePrice.gte = query.minPrice;
    }
    if (query.maxPrice !== undefined) {
      where.salePrice.lte = query.maxPrice;
    }
  }

  // Build orderBy
  const orderBy: Prisma.PackageOrderByWithRelationInput = {};
  switch (query.sortBy) {
    case 'name':
      orderBy.name = query.sortOrder;
      break;
    case 'salePrice':
      orderBy.salePrice = query.sortOrder;
      break;
    case 'createdAt':
      orderBy.createdAt = query.sortOrder;
      break;
    case 'displayOrder':
    default:
      orderBy.displayOrder = query.sortOrder;
  }

  // Calculate pagination
  const offset = (query.page - 1) * query.limit;

  // Execute queries in parallel
  const [packages, total] = await Promise.all([
    prisma.package.findMany({
      where,
      orderBy,
      skip: offset,
      take: query.limit,
    }),
    prisma.package.count({ where }),
  ]);

  // Log audit event if authenticated
  if (user) {
    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'package_list',
      ipAddress,
      metadata: { query, resultCount: packages.length },
    });
  }

  return c.json({
    items: packages.map(serializePackage),
    total,
    page: query.page,
    limit: query.limit,
    hasMore: offset + query.limit < total,
  });
});

/**
 * Get package by ID
 * GET /api/packages/:id
 */
packages.get('/:id', optionalSessionAuthMiddleware, zValidator('param', packageIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const pkg = await prisma.package.findUnique({
    where: { id },
  });

  if (!pkg) {
    throw APIError.notFound('Package');
  }

  // For unauthenticated users, only show active and available packages
  if (!user && (!pkg.isActive || !pkg.availableForPurchase)) {
    throw APIError.notFound('Package');
  }

  // Log audit event if authenticated
  if (user) {
    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'package',
      resourceId: id,
      ipAddress,
    });
  }

  return c.json({
    package: serializePackage(pkg),
  });
});

// ===================
// Authenticated Routes
// ===================

/**
 * Create new package (admin only)
 * POST /api/packages
 */
packages.post('/', sessionAuthMiddleware, zValidator('json', createPackageSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Check admin/owner role
  if (!user.role || !['admin', 'owner'].includes(user.role)) {
    throw APIError.forbidden('Only admins can create packages');
  }

  const id = generateId('pkg');

  // Calculate savings
  const { savings, savingsPercent } = calculateSavings(data.regularPrice, data.salePrice);

  // Generate IDs for content items if not provided
  const contents = data.contents.map((item, index) => ({
    ...item,
    id: item.id || `item-${id}-${index}`,
  }));

  const pkg = await prisma.package.create({
    data: {
      id,
      name: data.name,
      description: data.description || '',
      category: data.category || null,
      imageUrl: data.imageUrl || null,
      contents: contents as any,
      regularPrice: data.regularPrice,
      salePrice: data.salePrice,
      savings,
      savingsPercent,
      validityDays: data.validityDays,
      restrictions: (data.restrictions as any) || null,
      isActive: data.isActive,
      availableForPurchase: data.availableForPurchase,
      displayOrder: data.displayOrder,
      createdBy: user.uid,
      updatedAt: new Date(),
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'CREATE',
    resourceType: 'package',
    resourceId: id,
    ipAddress,
    metadata: { packageName: pkg.name },
  });

  return c.json({
    package: serializePackage(pkg),
    message: 'Package created successfully',
  }, 201);
});

/**
 * Update package
 * PUT /api/packages/:id
 */
packages.put('/:id', sessionAuthMiddleware, zValidator('param', packageIdSchema), zValidator('json', updatePackageSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Check admin/owner role
  if (!user.role || !['admin', 'owner'].includes(user.role)) {
    throw APIError.forbidden('Only admins can update packages');
  }

  const pkg = await prisma.package.findUnique({
    where: { id },
  });

  if (!pkg) {
    throw APIError.notFound('Package');
  }

  // Calculate savings if prices changed
  const regularPrice = data.regularPrice ?? pkg.regularPrice;
  const salePrice = data.salePrice ?? pkg.salePrice;
  const { savings, savingsPercent } = calculateSavings(regularPrice, salePrice);

  // Build update data object
  const updateData: Prisma.PackageUpdateInput = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
  if (data.contents !== undefined) {
    updateData.contents = data.contents.map((item, index) => ({
      ...item,
      id: item.id || `item-${id}-${index}`,
    })) as any;
  }
  if (data.regularPrice !== undefined) updateData.regularPrice = data.regularPrice;
  if (data.salePrice !== undefined) updateData.salePrice = data.salePrice;

  // Always update savings when prices change
  updateData.savings = savings;
  updateData.savingsPercent = savingsPercent;

  if (data.validityDays !== undefined) updateData.validityDays = data.validityDays;
  if (data.restrictions !== undefined) updateData.restrictions = (data.restrictions as any) || null;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  if (data.availableForPurchase !== undefined) updateData.availableForPurchase = data.availableForPurchase;
  if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;

  const updatedPkg = await prisma.package.update({
    where: { id },
    data: updateData,
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'package',
    resourceId: id,
    ipAddress,
    metadata: { updatedFields: Object.keys(data) },
  });

  return c.json({
    package: serializePackage(updatedPkg),
    message: 'Package updated successfully',
  });
});

/**
 * Deactivate package (soft delete)
 * DELETE /api/packages/:id
 */
packages.delete('/:id', sessionAuthMiddleware, zValidator('param', packageIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Check admin/owner role
  if (!user.role || !['admin', 'owner'].includes(user.role)) {
    throw APIError.forbidden('Only admins can deactivate packages');
  }

  const pkg = await prisma.package.findUnique({
    where: { id },
  });

  if (!pkg) {
    throw APIError.notFound('Package');
  }

  // Soft delete - deactivate and remove from purchase
  await prisma.package.update({
    where: { id },
    data: {
      isActive: false,
      availableForPurchase: false,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'DELETE',
    resourceType: 'package',
    resourceId: id,
    ipAddress,
  });

  return c.json({
    success: true,
    message: 'Package deactivated successfully',
  });
});

/**
 * Purchase package for patient
 * POST /api/packages/:id/purchase
 */
packages.post('/:id/purchase', sessionAuthMiddleware, zValidator('param', packageIdSchema), zValidator('json', purchasePackageSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const pkg = await prisma.package.findUnique({
    where: { id },
  });

  if (!pkg) {
    throw APIError.notFound('Package');
  }

  if (!pkg.isActive || !pkg.availableForPurchase) {
    throw APIError.badRequest('This package is not available for purchase');
  }

  const purchaseId = generateId('purchase');
  const now = new Date();
  const validUntil = new Date(now);
  validUntil.setDate(validUntil.getDate() + pkg.validityDays);

  // Get package contents from JSON field
  const contents = pkg.contents as any[];

  // Create purchase items from package contents
  const items: PackagePurchaseItem[] = contents.map((content, index) => ({
    id: `pitem-${purchaseId}-${index}`,
    type: content.type,
    itemId: content.itemId,
    itemName: content.itemName,
    quantityTotal: content.quantity,
    quantityUsed: 0,
    quantityRemaining: content.quantity,
    redemptions: [],
  }));

  const purchase = await prisma.packagePurchase.create({
    data: {
      id: purchaseId,
      packageId: id,
      packageName: pkg.name,
      patientId: data.patientId,
      purchaseDate: now,
      purchasePrice: pkg.salePrice,
      invoiceId: data.invoiceId || null,
      paymentId: data.paymentId || null,
      validFrom: now,
      validUntil,
      items: items as any,
      status: 'ACTIVE',
      notes: data.notes || null,
      createdBy: user.uid,
      updatedAt: now,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'CREATE',
    resourceType: 'package_purchase',
    resourceId: purchaseId,
    ipAddress,
    metadata: {
      packageId: id,
      packageName: pkg.name,
      patientId: data.patientId,
      purchasePrice: pkg.salePrice,
    },
  });

  return c.json({
    purchase: serializePurchase(purchase),
    message: 'Package purchased successfully',
  }, 201);
});

/**
 * List patient's purchased packages
 * GET /api/patients/:patientId/packages
 */
packages.get('/patients/:patientId/packages', sessionAuthMiddleware, zValidator('param', patientIdSchema), zValidator('query', listPatientPackagesSchema), async (c) => {
  const { patientId } = c.req.valid('param');
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Build where clause
  const where: Prisma.PackagePurchaseWhereInput = {
    patientId,
  };

  // Apply status filter
  if (query.status) {
    where.status = query.status.toUpperCase() as any;
  }

  // Filter out expired unless requested
  if (!query.includeExpired) {
    where.status = {
      not: 'EXPIRED',
    };
  }

  // Calculate pagination
  const offset = (query.page - 1) * query.limit;

  // Execute queries in parallel
  const [purchases, total] = await Promise.all([
    prisma.packagePurchase.findMany({
      where,
      orderBy: { purchaseDate: 'desc' },
      skip: offset,
      take: query.limit,
    }),
    prisma.packagePurchase.count({ where }),
  ]);

  // Update statuses for each purchase
  const updatedPurchases = await Promise.all(
    purchases.map(async (purchase) => {
      const newStatus = await updatePurchaseStatus(purchase);
      if (newStatus !== purchase.status) {
        return await prisma.packagePurchase.update({
          where: { id: purchase.id },
          data: { status: newStatus as any },
        });
      }
      return purchase;
    })
  );

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'patient_packages',
    resourceId: patientId,
    ipAddress,
    metadata: { resultCount: purchases.length },
  });

  return c.json({
    items: updatedPurchases.map(serializePurchase),
    total,
    page: query.page,
    limit: query.limit,
    hasMore: offset + query.limit < total,
  });
});

/**
 * Get purchase details
 * GET /api/patients/:patientId/packages/:purchaseId
 */
packages.get('/patients/:patientId/packages/:purchaseId', sessionAuthMiddleware, zValidator('param', purchaseIdSchema), async (c) => {
  const { patientId, purchaseId } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const purchase = await prisma.packagePurchase.findUnique({
    where: { id: purchaseId },
  });

  if (!purchase || purchase.patientId !== patientId) {
    throw APIError.notFound('Package purchase');
  }

  // Update status
  const newStatus = await updatePurchaseStatus(purchase);
  const updatedPurchase = newStatus !== purchase.status
    ? await prisma.packagePurchase.update({
        where: { id: purchaseId },
        data: { status: newStatus as any },
      })
    : purchase;

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'package_purchase',
    resourceId: purchaseId,
    ipAddress,
  });

  return c.json({
    purchase: serializePurchase(updatedPurchase),
  });
});

/**
 * Redeem package service
 * POST /api/patients/:patientId/packages/:purchaseId/redeem
 */
packages.post('/patients/:patientId/packages/:purchaseId/redeem', sessionAuthMiddleware, zValidator('param', purchaseIdSchema), zValidator('json', redeemPackageSchema), async (c) => {
  const { patientId, purchaseId } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Use transaction to ensure atomicity of redemption
    const result = await prisma.$transaction(async (tx) => {
      // Get purchase
      const purchase = await tx.packagePurchase.findUnique({
        where: { id: purchaseId },
      });

      if (!purchase || purchase.patientId !== patientId) {
        throw APIError.notFound('Package purchase');
      }

      // Update status first
      const currentStatus = await updatePurchaseStatus(purchase);

      // Check if purchase can be redeemed
      if (currentStatus === 'EXPIRED') {
        throw APIError.badRequest('This package has expired');
      }
      if (currentStatus === 'CANCELLED') {
        throw APIError.badRequest('This package has been cancelled');
      }
      if (currentStatus === 'REFUNDED') {
        throw APIError.badRequest('This package has been refunded');
      }
      if (currentStatus === 'FULLY_USED') {
        throw APIError.badRequest('All services in this package have been redeemed');
      }

      // Get items from JSON field
      const items = purchase.items as any as PackagePurchaseItem[];

      // Find the item to redeem
      const itemIndex = items.findIndex(i => i.itemId === data.itemId);
      if (itemIndex === -1) {
        throw APIError.badRequest('Item not found in this package');
      }

      const item = items[itemIndex];

      // Check quantity
      if (item.quantityRemaining < data.quantity) {
        throw APIError.badRequest(`Only ${item.quantityRemaining} unit(s) remaining for this item`);
      }

      // Check restrictions
      const pkg = await tx.package.findUnique({
        where: { id: purchase.packageId },
      });

      if (pkg) {
        const restrictions = pkg.restrictions as any;
        if (restrictions?.maxRedemptionsPerVisit) {
          // Count today's redemptions
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayRedemptions = item.redemptions.filter(r => {
            const redeemedDate = new Date(r.redeemedAt);
            redeemedDate.setHours(0, 0, 0, 0);
            return redeemedDate.getTime() === today.getTime();
          }).reduce((sum, r) => sum + r.quantity, 0);

          if (todayRedemptions + data.quantity > restrictions.maxRedemptionsPerVisit) {
            throw APIError.badRequest(`Maximum ${restrictions.maxRedemptionsPerVisit} redemption(s) per visit allowed`);
          }
        }
      }

      // Create redemption
      const redemption: PackageRedemption = {
        id: generateId('red'),
        itemId: data.itemId,
        quantity: data.quantity,
        appointmentId: data.appointmentId,
        invoiceId: data.invoiceId,
        redeemedAt: new Date(),
        redeemedBy: user.uid,
        notes: data.notes,
      };

      // Update item quantities
      item.quantityUsed += data.quantity;
      item.quantityRemaining -= data.quantity;
      item.redemptions.push(redemption);

      // Replace the item in the array
      items[itemIndex] = item;

      // Calculate new status
      const newStatus = await updatePurchaseStatus({ ...purchase, items: items as any });

      // Update purchase with new items and status
      const updatedPurchase = await tx.packagePurchase.update({
        where: { id: purchaseId },
        data: {
          items: items as any,
          status: newStatus as any,
        },
      });

      return { purchase: updatedPurchase, redemption };
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'package_redemption',
      resourceId: purchaseId,
      ipAddress,
      metadata: {
        redemptionId: result.redemption.id,
        itemId: data.itemId,
        quantity: data.quantity,
        appointmentId: data.appointmentId,
      },
    });

    return c.json({
      purchase: serializePurchase(result.purchase),
      redemption: {
        ...result.redemption,
        redeemedAt: result.redemption.redeemedAt.toISOString(),
      },
      message: 'Service redeemed successfully',
    });
  } catch (error) {
    // Let APIError errors bubble up as-is
    if (error instanceof APIError) {
      throw error;
    }
    // Wrap other errors
    throw APIError.internal('Failed to redeem package service');
  }
});

/**
 * Get usage history for a purchase
 * GET /api/patients/:patientId/packages/:purchaseId/usage
 */
packages.get('/patients/:patientId/packages/:purchaseId/usage', sessionAuthMiddleware, zValidator('param', purchaseIdSchema), async (c) => {
  const { patientId, purchaseId } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const purchase = await prisma.packagePurchase.findUnique({
    where: { id: purchaseId },
  });

  if (!purchase || purchase.patientId !== patientId) {
    throw APIError.notFound('Package purchase');
  }

  // Get items from JSON field
  const items = purchase.items as any as PackagePurchaseItem[];

  // Collect all redemptions with item info
  const usageHistory = items.flatMap(item =>
    item.redemptions.map(redemption => ({
      ...redemption,
      itemId: item.itemId,
      itemName: item.itemName,
      itemType: item.type,
      redeemedAt: redemption.redeemedAt.toISOString(),
    }))
  ).sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime());

  // Summary
  const summary = {
    totalItems: items.reduce((sum, item) => sum + item.quantityTotal, 0),
    totalUsed: items.reduce((sum, item) => sum + item.quantityUsed, 0),
    totalRemaining: items.reduce((sum, item) => sum + item.quantityRemaining, 0),
    itemsSummary: items.map(item => ({
      itemId: item.itemId,
      itemName: item.itemName,
      type: item.type,
      total: item.quantityTotal,
      used: item.quantityUsed,
      remaining: item.quantityRemaining,
    })),
  };

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'package_usage',
    resourceId: purchaseId,
    ipAddress,
  });

  return c.json({
    purchaseId,
    packageName: purchase.packageName,
    status: purchase.status.toLowerCase(),
    validUntil: purchase.validUntil.toISOString(),
    summary,
    history: usageHistory,
  });
});

// ===================
// Export Functions (for testing)
// ===================

export async function clearStores() {
  await prisma.$transaction([
    prisma.packagePurchase.deleteMany({}),
    prisma.package.deleteMany({}),
  ]);
}

export function getPrismaClient() {
  return prisma;
}

export default packages;
