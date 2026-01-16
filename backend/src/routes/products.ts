/**
 * Products API Routes
 *
 * Full CRUD operations for product catalog management with:
 * - Pagination and filtering by category, brand, status
 * - Injectable-specific fields (concentration, dilution, reconstitution)
 * - Storage requirements (FDA compliance)
 * - Reorder settings and thresholds
 * - Stock level retrieval from inventoryLots table
 * - Soft delete support
 * - Audit logging
 *
 * @database Prisma ORM with PostgreSQL
 * @schema Products table with foreign key to vendors (inventoryLots for stock tracking)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sessionAuthMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const products = new Hono();

// ===================
// Validation Schemas
// ===================

// Product category
const productCategorySchema = z.enum([
  'neurotoxin',
  'filler',
  'skincare',
  'device',
  'consumable',
  'supplement',
  'other',
]);

// Product status
const productStatusSchema = z.enum([
  'active',
  'discontinued',
  'out_of_stock',
  'pending_approval',
]);

// Unit type
const unitTypeSchema = z.enum([
  'units',
  'syringe',
  'vial',
  'ml',
  'cc',
  'gram',
  'piece',
  'box',
  'kit',
]);

// Injectable type
const injectableTypeSchema = z.enum([
  'neurotoxin',
  'filler',
  'biostimulator',
  'pdo_threads',
]);

// Injectable details schema
const injectableDetailsSchema = z.object({
  type: injectableTypeSchema,
  concentration: z.string().max(100).optional(),
  dilutionRatio: z.string().max(200).optional(),
  defaultDilution: z.number().positive().optional(),
  volumePerSyringe: z.number().positive().optional(),
  reconstitutionRequired: z.boolean(),
  maxHoursAfterReconstitution: z.number().int().positive().optional(),
});

// Storage requirements schema
const storageRequirementsSchema = z.object({
  temperatureMin: z.number(),
  temperatureMax: z.number(),
  requiresRefrigeration: z.boolean(),
  freezerStorage: z.boolean().default(false),
  lightSensitive: z.boolean().default(false),
  humidityControlled: z.boolean().default(false),
  specialInstructions: z.string().max(500).optional(),
});

// Create product schema
const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  displayName: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  category: productCategorySchema,
  brand: z.string().min(1).max(100),
  manufacturerId: z.string().uuid().optional(), // Maps to vendorId in DB

  // Identification
  sku: z.string().min(1).max(50),
  ndc: z.string().max(20).optional(),
  upc: z.string().max(20).optional(),
  gtin: z.string().max(20).optional(),

  // Pricing
  costPrice: z.number().nonnegative(),
  retailPrice: z.number().nonnegative(),
  markupPercent: z.number().nonnegative().optional(),
  unitPrice: z.number().nonnegative(),
  unitType: unitTypeSchema,
  unitsPerPackage: z.number().positive().default(1),

  // Injectable-specific
  injectableDetails: injectableDetailsSchema.optional(),

  // Storage
  storageRequirements: storageRequirementsSchema.optional(),

  // Inventory thresholds
  reorderPoint: z.number().nonnegative().default(10),
  reorderQuantity: z.number().positive().default(20),
  minStockLevel: z.number().nonnegative().default(5),
  maxStockLevel: z.number().positive().default(100),
  leadTimeDays: z.number().nonnegative().default(7),

  // Tracking flags
  trackInventory: z.boolean().default(true),
  trackByLot: z.boolean().default(true),
  trackBySerial: z.boolean().default(false),
  requireExpirationDate: z.boolean().default(true),

  // Commission
  commissionable: z.boolean().default(false),
  commissionRate: z.number().min(0).max(100).optional(),

  // Categorization
  tags: z.array(z.string().max(50)).default([]),
  treatmentTypes: z.array(z.string().max(100)).default([]),
  requiredCertifications: z.array(z.string().max(100)).optional(),

  // Status
  status: productStatusSchema.default('active'),
  isActive: z.boolean().default(true),
  availableForSale: z.boolean().default(false),
  requiresPrescription: z.boolean().default(false),
  controlledSubstance: z.boolean().default(false),
  hsaFsaEligible: z.boolean().default(false),

  // Images
  imageUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
});

// Update product schema
const updateProductSchema = createProductSchema.partial();

// List products query schema
const listProductsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: productCategorySchema.optional(),
  brand: z.string().optional(),
  status: productStatusSchema.optional(),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  trackInventory: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'sku', 'category', 'brand', 'retailPrice', 'costPrice', 'createdAt', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Product ID param schema
const productIdSchema = z.object({
  id: z.string().uuid(),
});

// Reorder settings schema
const reorderSettingsSchema = z.object({
  reorderPoint: z.number().nonnegative(),
  reorderQuantity: z.number().positive(),
  minStockLevel: z.number().nonnegative(),
  maxStockLevel: z.number().positive(),
  leadTimeDays: z.number().nonnegative(),
});

// ===================
// Type Definitions
// ===================

// Product categories with counts
export interface ProductCategoryInfo {
  category: string;
  displayName: string;
  count: number;
  activeCount: number;
}

// ===================
// Helper Functions
// ===================

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

function calculateMarkupPercent(costPrice: number, retailPrice: number): number {
  if (costPrice <= 0) return 0;
  return Math.round(((retailPrice - costPrice) / costPrice) * 100 * 100) / 100;
}

function getDefaultStorageRequirements() {
  return {
    temperatureMin: 15,
    temperatureMax: 30,
    requiresRefrigeration: false,
    freezerStorage: false,
    lightSensitive: false,
    humidityControlled: false,
  };
}

function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    neurotoxin: 'Neurotoxin',
    filler: 'Dermal Filler',
    skincare: 'Skincare',
    device: 'Device/Equipment',
    consumable: 'Consumable',
    supplement: 'Supplement',
    other: 'Other',
  };
  return names[category] || category;
}

// Middleware
// ===================

// All product routes require session authentication
products.use('/*', sessionAuthMiddleware);

// ===================
// Routes
// ===================

/**
 * List product categories
 * GET /api/products/categories
 */
products.get('/categories', async (c) => {
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Get all products, excluding soft-deleted ones
  const allProducts = await prisma.product.findMany({
    where: {
      deletedAt: null,
    },
    select: {
      category: true,
      isActive: true,
    },
  });

  const categoryCounts: Record<string, { total: number; active: number }> = {};

  for (const product of allProducts) {
    if (!product.category) continue;

    if (!categoryCounts[product.category]) {
      categoryCounts[product.category] = { total: 0, active: 0 };
    }
    categoryCounts[product.category].total++;
    if (product.isActive) {
      categoryCounts[product.category].active++;
    }
  }

  const categories: ProductCategoryInfo[] = Object.entries(categoryCounts).map(([category, counts]) => ({
    category,
    displayName: getCategoryDisplayName(category),
    count: counts.total,
    activeCount: counts.active,
  }));

  // Sort by display name
  categories.sort((a, b) => a.displayName.localeCompare(b.displayName));

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'product_categories',
    ipAddress,
  });

  return c.json({
    categories,
    total: categories.length,
  });
});

/**
 * List products (paginated, filterable)
 * GET /api/products
 */
products.get('/', zValidator('query', listProductsSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Build where conditions dynamically
  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
  };

  // Apply category filter
  if (query.category) {
    where.category = query.category as any;
  }

  // Apply brand filter (case-insensitive LIKE)
  if (query.brand) {
    where.brand = { contains: query.brand, mode: 'insensitive' };
  }

  // Apply status filter
  if (query.status) {
    where.status = query.status as any;
  }

  // Apply isActive filter
  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  // Apply trackInventory filter
  if (query.trackInventory !== undefined) {
    where.trackInventory = query.trackInventory;
  }

  // Apply search filter (case-insensitive search across multiple fields)
  if (query.search) {
    const searchTerm = query.search;
    where.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { displayName: { contains: searchTerm, mode: 'insensitive' } },
      { sku: { contains: searchTerm, mode: 'insensitive' } },
      { brand: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
      { ndc: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  // Build orderBy clause
  const orderBy: Prisma.ProductOrderByWithRelationInput = {};

  switch (query.sortBy) {
    case 'name':
      orderBy.name = query.sortOrder;
      break;
    case 'sku':
      orderBy.sku = query.sortOrder;
      break;
    case 'category':
      orderBy.category = query.sortOrder;
      break;
    case 'brand':
      orderBy.brand = query.sortOrder;
      break;
    case 'retailPrice':
      orderBy.retailPrice = query.sortOrder;
      break;
    case 'costPrice':
      orderBy.costPrice = query.sortOrder;
      break;
    case 'createdAt':
      orderBy.createdAt = query.sortOrder;
      break;
    case 'updatedAt':
      orderBy.updatedAt = query.sortOrder;
      break;
    default:
      orderBy.name = query.sortOrder;
  }

  // Calculate pagination
  const offset = (query.page - 1) * query.limit;

  // Execute query with filters, sorting, and pagination
  const [results, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: offset,
      take: query.limit,
    }),
    prisma.product.count({ where }),
  ]);

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'product_list',
    ipAddress,
    metadata: { query, resultCount: results.length },
  });

  return c.json({
    items: results.map(p => ({
      id: p.id,
      name: p.name,
      displayName: p.displayName,
      category: p.category,
      brand: p.brand,
      sku: p.sku,
      ndc: p.ndc,
      costPrice: p.costPrice,
      retailPrice: p.retailPrice,
      unitPrice: p.unitPrice,
      unitType: p.unitType,
      unitsPerPackage: p.unitsPerPackage,
      status: p.status,
      isActive: p.isActive,
      trackInventory: p.trackInventory,
      trackByLot: p.trackByLot,
      requireExpirationDate: p.requireExpirationDate,
      reorderPoint: p.reorderPoint,
      injectableDetails: p.injectableDetails as any,
      imageUrl: p.imageUrl,
      thumbnailUrl: p.thumbnailUrl,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
    total,
    page: query.page,
    limit: query.limit,
    hasMore: offset + query.limit < total,
  });
});

/**
 * Get single product by ID
 * GET /api/products/:id
 */
products.get('/:id', zValidator('param', productIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const product = await prisma.product.findUnique({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!product) {
    throw APIError.notFound('Product');
  }

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'product',
    resourceId: id,
    ipAddress,
  });

  return c.json({
    product: {
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    },
  });
});

/**
 * Create new product
 * POST /api/products
 */
products.post('/', zValidator('json', createProductSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Validate SKU uniqueness
  const existingProduct = await prisma.product.findFirst({
    where: {
      sku: data.sku,
      deletedAt: null,
    },
  });

  if (existingProduct) {
    throw APIError.conflict(`Product with SKU '${data.sku}' already exists`);
  }

  // Calculate markup if not provided
  const markupPercent = data.markupPercent ?? calculateMarkupPercent(data.costPrice, data.retailPrice);

  // Create product
  const product = await prisma.product.create({
    data: {
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      category: data.category as any,
      brand: data.brand,
      vendorId: data.manufacturerId,
      sku: data.sku,
      ndc: data.ndc,
      upc: data.upc,
      gtin: data.gtin,
      costPrice: data.costPrice,
      retailPrice: data.retailPrice,
      markupPercent,
      unitPrice: data.unitPrice,
      unitType: data.unitType as any,
      unitsPerPackage: data.unitsPerPackage,
      injectableDetails: data.injectableDetails as any,
      storageRequirements: data.storageRequirements || getDefaultStorageRequirements(),
      reorderPoint: data.reorderPoint,
      reorderQuantity: data.reorderQuantity,
      minStockLevel: data.minStockLevel,
      maxStockLevel: data.maxStockLevel,
      leadTimeDays: data.leadTimeDays,
      trackInventory: data.trackInventory,
      trackByLot: data.trackByLot,
      trackBySerial: data.trackBySerial,
      requireExpirationDate: data.requireExpirationDate,
      commissionable: data.commissionable,
      commissionRate: data.commissionRate,
      tags: data.tags,
      treatmentTypes: data.treatmentTypes,
      requiredCertifications: data.requiredCertifications || [],
      status: data.status as any,
      isActive: data.isActive,
      availableForSale: data.availableForSale,
      requiresPrescription: data.requiresPrescription,
      controlledSubstance: data.controlledSubstance,
      hsaFsaEligible: data.hsaFsaEligible,
      imageUrl: data.imageUrl,
      thumbnailUrl: data.thumbnailUrl,
      createdBy: user.uid,
      updatedBy: user.uid,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'CREATE',
    resourceType: 'product',
    resourceId: product.id,
    ipAddress,
    metadata: { sku: data.sku, name: data.name, category: data.category },
  });

  return c.json({
    product: {
      ...product,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    },
    message: 'Product created successfully',
  }, 201);
});

/**
 * Update product
 * PUT /api/products/:id
 */
products.put('/:id', zValidator('param', productIdSchema), zValidator('json', updateProductSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id, deletedAt: null },
  });

  if (!existingProduct) {
    throw APIError.notFound('Product');
  }

  // Validate SKU uniqueness if changing
  if (data.sku && data.sku !== existingProduct.sku) {
    const skuCheck = await prisma.product.findFirst({
      where: {
        sku: data.sku,
        id: { not: id },
        deletedAt: null,
      },
    });

    if (skuCheck) {
      throw APIError.conflict(`Product with SKU '${data.sku}' already exists`);
    }
  }

  // Build update object dynamically
  const updateData: Prisma.ProductUpdateInput = {
    updatedBy: user.uid,
  };

  const updatedFields: string[] = [];

  // Map all fields
  if (data.name !== undefined) { updateData.name = data.name; updatedFields.push('name'); }
  if (data.displayName !== undefined) { updateData.displayName = data.displayName; updatedFields.push('displayName'); }
  if (data.description !== undefined) { updateData.description = data.description; updatedFields.push('description'); }
  if (data.category !== undefined) { updateData.category = data.category as any; updatedFields.push('category'); }
  if (data.brand !== undefined) { updateData.brand = data.brand; updatedFields.push('brand'); }
  if (data.manufacturerId !== undefined) {
    if (data.manufacturerId) {
      updateData.vendor = { connect: { id: data.manufacturerId } };
    } else {
      updateData.vendor = { disconnect: true };
    }
    updatedFields.push('vendorId');
  }
  if (data.sku !== undefined) { updateData.sku = data.sku; updatedFields.push('sku'); }
  if (data.ndc !== undefined) { updateData.ndc = data.ndc; updatedFields.push('ndc'); }
  if (data.upc !== undefined) { updateData.upc = data.upc; updatedFields.push('upc'); }
  if (data.gtin !== undefined) { updateData.gtin = data.gtin; updatedFields.push('gtin'); }
  if (data.costPrice !== undefined) { updateData.costPrice = data.costPrice; updatedFields.push('costPrice'); }
  if (data.retailPrice !== undefined) { updateData.retailPrice = data.retailPrice; updatedFields.push('retailPrice'); }
  if (data.unitPrice !== undefined) { updateData.unitPrice = data.unitPrice; updatedFields.push('unitPrice'); }
  if (data.unitType !== undefined) { updateData.unitType = data.unitType as any; updatedFields.push('unitType'); }
  if (data.unitsPerPackage !== undefined) { updateData.unitsPerPackage = data.unitsPerPackage; updatedFields.push('unitsPerPackage'); }
  if (data.injectableDetails !== undefined) { updateData.injectableDetails = data.injectableDetails as any; updatedFields.push('injectableDetails'); }
  if (data.storageRequirements !== undefined) { updateData.storageRequirements = data.storageRequirements as any; updatedFields.push('storageRequirements'); }
  if (data.reorderPoint !== undefined) { updateData.reorderPoint = data.reorderPoint; updatedFields.push('reorderPoint'); }
  if (data.reorderQuantity !== undefined) { updateData.reorderQuantity = data.reorderQuantity; updatedFields.push('reorderQuantity'); }
  if (data.minStockLevel !== undefined) { updateData.minStockLevel = data.minStockLevel; updatedFields.push('minStockLevel'); }
  if (data.maxStockLevel !== undefined) { updateData.maxStockLevel = data.maxStockLevel; updatedFields.push('maxStockLevel'); }
  if (data.leadTimeDays !== undefined) { updateData.leadTimeDays = data.leadTimeDays; updatedFields.push('leadTimeDays'); }
  if (data.trackInventory !== undefined) { updateData.trackInventory = data.trackInventory; updatedFields.push('trackInventory'); }
  if (data.trackByLot !== undefined) { updateData.trackByLot = data.trackByLot; updatedFields.push('trackByLot'); }
  if (data.trackBySerial !== undefined) { updateData.trackBySerial = data.trackBySerial; updatedFields.push('trackBySerial'); }
  if (data.requireExpirationDate !== undefined) { updateData.requireExpirationDate = data.requireExpirationDate; updatedFields.push('requireExpirationDate'); }
  if (data.commissionable !== undefined) { updateData.commissionable = data.commissionable; updatedFields.push('commissionable'); }
  if (data.commissionRate !== undefined) { updateData.commissionRate = data.commissionRate; updatedFields.push('commissionRate'); }
  if (data.tags !== undefined) { updateData.tags = data.tags; updatedFields.push('tags'); }
  if (data.treatmentTypes !== undefined) { updateData.treatmentTypes = data.treatmentTypes; updatedFields.push('treatmentTypes'); }
  if (data.requiredCertifications !== undefined) { updateData.requiredCertifications = data.requiredCertifications; updatedFields.push('requiredCertifications'); }
  if (data.status !== undefined) { updateData.status = data.status as any; updatedFields.push('status'); }
  if (data.isActive !== undefined) { updateData.isActive = data.isActive; updatedFields.push('isActive'); }
  if (data.availableForSale !== undefined) { updateData.availableForSale = data.availableForSale; updatedFields.push('availableForSale'); }
  if (data.requiresPrescription !== undefined) { updateData.requiresPrescription = data.requiresPrescription; updatedFields.push('requiresPrescription'); }
  if (data.controlledSubstance !== undefined) { updateData.controlledSubstance = data.controlledSubstance; updatedFields.push('controlledSubstance'); }
  if (data.hsaFsaEligible !== undefined) { updateData.hsaFsaEligible = data.hsaFsaEligible; updatedFields.push('hsaFsaEligible'); }
  if (data.imageUrl !== undefined) { updateData.imageUrl = data.imageUrl; updatedFields.push('imageUrl'); }
  if (data.thumbnailUrl !== undefined) { updateData.thumbnailUrl = data.thumbnailUrl; updatedFields.push('thumbnailUrl'); }

  // Recalculate markup if prices changed
  const finalCostPrice = data.costPrice !== undefined ? data.costPrice : existingProduct.costPrice;
  const finalRetailPrice = data.retailPrice !== undefined ? data.retailPrice : existingProduct.retailPrice;

  if (data.costPrice !== undefined || data.retailPrice !== undefined) {
    const markupPercent = data.markupPercent ?? calculateMarkupPercent(finalCostPrice, finalRetailPrice);
    updateData.markupPercent = markupPercent;
    updatedFields.push('markupPercent');
  } else if (data.markupPercent !== undefined) {
    updateData.markupPercent = data.markupPercent;
    updatedFields.push('markupPercent');
  }

  // Perform update
  const updatedProduct = await prisma.product.update({
    where: { id },
    data: updateData,
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'product',
    resourceId: id,
    ipAddress,
    metadata: { updatedFields },
  });

  return c.json({
    product: {
      ...updatedProduct,
      createdAt: updatedProduct.createdAt.toISOString(),
      updatedAt: updatedProduct.updatedAt.toISOString(),
    },
    message: 'Product updated successfully',
  });
});

/**
 * Soft delete product
 * DELETE /api/products/:id
 */
products.delete('/:id', zValidator('param', productIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id, deletedAt: null },
  });

  if (!product) {
    throw APIError.notFound('Product');
  }

  // Check if product has active stock (sum of all inventory lots)
  const stockAgg = await prisma.inventoryLot.aggregate({
    where: {
      productId: id,
      deletedAt: null,
    },
    _sum: {
      currentQuantity: true,
    },
  });

  const totalStock = stockAgg._sum.currentQuantity || 0;

  if (totalStock > 0) {
    throw APIError.badRequest('Cannot delete product with existing inventory. Please remove all stock first.');
  }

  // Perform soft delete
  await prisma.product.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      deletedBy: user.uid,
      isActive: false,
      status: 'discontinued',
      updatedBy: user.uid,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'DELETE',
    resourceType: 'product',
    resourceId: id,
    ipAddress,
  });

  return c.json({
    success: true,
    message: 'Product deleted successfully',
  });
});

/**
 * Get stock levels for product
 * GET /api/products/:id/stock
 */
products.get('/:id/stock', zValidator('param', productIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id, deletedAt: null },
  });

  if (!product) {
    throw APIError.notFound('Product');
  }

  // Get all inventory lots for this product
  const lots = await prisma.inventoryLot.findMany({
    where: {
      productId: id,
      deletedAt: null,
    },
  });

  // Aggregate by location
  const locationMap = new Map<string, {
    locationId: string;
    totalQuantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    lotCount: number;
    earliestExpiration?: Date;
    status: string;
  }>();

  for (const lot of lots) {
    const locId = lot.locationId;
    const current = Number(lot.currentQuantity || 0);
    const reserved = Number(lot.reservedQuantity || 0);
    const available = current - reserved;

    if (!locationMap.has(locId)) {
      locationMap.set(locId, {
        locationId: locId,
        totalQuantity: 0,
        availableQuantity: 0,
        reservedQuantity: 0,
        lotCount: 0,
        status: 'in_stock',
      });
    }

    const location = locationMap.get(locId)!;
    location.totalQuantity += current;
    location.availableQuantity += available;
    location.reservedQuantity += reserved;
    location.lotCount++;

    // Track earliest expiration
    if (lot.expirationDate) {
      const expDate = new Date(lot.expirationDate);
      if (!location.earliestExpiration || expDate < location.earliestExpiration) {
        location.earliestExpiration = expDate;
      }
    }
  }

  // Determine status for each location based on reorder thresholds
  const locationLevels = Array.from(locationMap.values()).map(loc => {
    let status = 'in_stock';
    if (loc.totalQuantity === 0) {
      status = 'out_of_stock';
    } else if (product.minStockLevel && loc.totalQuantity <= product.minStockLevel) {
      status = 'critical';
    } else if (product.reorderPoint && loc.totalQuantity <= product.reorderPoint) {
      status = 'low_stock';
    }

    return {
      ...loc,
      status,
    };
  });

  // Calculate summary across all locations
  const summary = {
    totalQuantity: locationLevels.reduce((sum, loc) => sum + loc.totalQuantity, 0),
    availableQuantity: locationLevels.reduce((sum, loc) => sum + loc.availableQuantity, 0),
    reservedQuantity: locationLevels.reduce((sum, loc) => sum + loc.reservedQuantity, 0),
    inTransitQuantity: 0, // Would need separate tracking
    totalLocations: locationLevels.length,
    locationsInStock: locationLevels.filter(l => l.status !== 'out_of_stock').length,
    locationsLowStock: locationLevels.filter(l => l.status === 'low_stock' || l.status === 'critical').length,
  };

  // Find earliest expiration across all locations
  const allExpirations = locationLevels
    .map(l => l.earliestExpiration)
    .filter((d): d is Date => d !== undefined)
    .sort((a, b) => a.getTime() - b.getTime());
  const earliestExpiration = allExpirations[0];

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'product_stock',
    resourceId: id,
    ipAddress,
  });

  return c.json({
    productId: id,
    productName: product.displayName,
    sku: product.sku,
    unitType: product.unitType,
    reorderPoint: product.reorderPoint,
    reorderQuantity: product.reorderQuantity,
    minStockLevel: product.minStockLevel,
    maxStockLevel: product.maxStockLevel,
    summary,
    earliestExpiration: earliestExpiration?.toISOString(),
    locations: locationLevels.map(level => ({
      ...level,
      earliestExpiration: level.earliestExpiration?.toISOString(),
    })),
  });
});

/**
 * Update reorder settings for product
 * POST /api/products/:id/reorder-settings
 */
products.post('/:id/reorder-settings', zValidator('param', productIdSchema), zValidator('json', reorderSettingsSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id, deletedAt: null },
  });

  if (!product) {
    throw APIError.notFound('Product');
  }

  // Validate thresholds
  if (data.minStockLevel >= data.reorderPoint) {
    throw APIError.badRequest('Minimum stock level must be less than reorder point');
  }

  if (data.reorderPoint >= data.maxStockLevel) {
    throw APIError.badRequest('Reorder point must be less than maximum stock level');
  }

  // Capture previous settings for audit
  const previousSettings = {
    reorderPoint: product.reorderPoint,
    reorderQuantity: product.reorderQuantity,
    minStockLevel: product.minStockLevel,
    maxStockLevel: product.maxStockLevel,
    leadTimeDays: product.leadTimeDays,
  };

  // Update reorder settings
  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      reorderPoint: data.reorderPoint,
      reorderQuantity: data.reorderQuantity,
      minStockLevel: data.minStockLevel,
      maxStockLevel: data.maxStockLevel,
      leadTimeDays: data.leadTimeDays,
      updatedBy: user.uid,
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'product_reorder_settings',
    resourceId: id,
    ipAddress,
    metadata: { previousSettings, newSettings: data },
  });

  return c.json({
    success: true,
    message: 'Reorder settings updated successfully',
    reorderSettings: {
      reorderPoint: updatedProduct.reorderPoint,
      reorderQuantity: updatedProduct.reorderQuantity,
      minStockLevel: updatedProduct.minStockLevel,
      maxStockLevel: updatedProduct.maxStockLevel,
      leadTimeDays: updatedProduct.leadTimeDays,
    },
  });
});

// ===================
// Export Functions (for testing)
// ===================

/**
 * Clear all products from database (for testing only)
 */
export async function clearProducts() {
  // Delete in proper order (inventory lots first, then products)
  await prisma.inventoryLot.deleteMany();
  await prisma.product.deleteMany();
}

/**
 * Get database client (for testing)
 */
export function getDb() {
  return prisma;
}

export default products;
