/**
 * Service validation schemas
 */

import { z } from 'zod';
import { uuidSchema, paginationSchema, searchQuerySchema, colorHexSchema, moneySchema } from './common';

// Service category
export const serviceCategorySchema = z.enum([
  'physiotherapy',
  'chiropractic',
  'aesthetics',
  'massage',
  'wellness',
  'consultation',
]);

// Service status
export const serviceStatusSchema = z.enum(['active', 'inactive']);

// Required resource schema
export const requiredResourceSchema = z.object({
  resourcePoolId: uuidSchema,
  quantity: z.coerce.number().int().min(1).default(1),
});

// Create service input
export const createServiceSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  category: serviceCategorySchema,

  // Duration
  duration: z.coerce.number().int().min(5).max(480), // 5 mins to 8 hours
  scheduledDuration: z.coerce.number().int().min(5).max(480).optional(), // For staggered booking
  postTreatmentTime: z.coerce.number().int().min(0).max(60).optional(), // Reset/sanitization time

  // Pricing
  price: moneySchema, // In cents
  depositRequired: z.boolean().default(false),
  depositAmount: moneySchema.optional(),

  // Assignment - simple string IDs for mock data compatibility
  practitionerIds: z.array(z.string().min(1)).min(1), // At least one practitioner

  // Capabilities & Equipment
  requiredCapabilities: z.array(z.string()).optional(),
  preferredCapabilities: z.array(z.string()).optional(),
  requiredEquipment: z.array(z.string()).optional(),
  requiredResources: z.array(requiredResourceSchema).optional(),

  // Display
  color: colorHexSchema.optional(),
  isActive: z.boolean().default(true),
  isInitialVisit: z.boolean().default(false),

  // Legacy support
  tags: z.array(z.string()).optional(),
});

// Update service input
export const updateServiceSchema = createServiceSchema.partial();

// Service search/filter
export const serviceSearchSchema = z.object({
  query: searchQuerySchema,
  category: serviceCategorySchema.optional(),
  categories: z.array(serviceCategorySchema).optional(),
  practitionerId: z.string().min(1).optional(), // Simple string for mock data compatibility
  isActive: z.coerce.boolean().optional(),
  minPrice: moneySchema.optional(),
  maxPrice: moneySchema.optional(),
  minDuration: z.coerce.number().int().min(0).optional(),
  maxDuration: z.coerce.number().int().max(480).optional(),
  ...paginationSchema.shape,
});

// Service ID param (accepts UUID or simple string for mock data compatibility)
export const serviceIdParamSchema = z.object({
  serviceId: z.string().min(1),
});

// Bulk update services
export const bulkUpdateServicesSchema = z.object({
  serviceIds: z.array(uuidSchema).min(1).max(100),
  updates: updateServiceSchema.pick({
    isActive: true,
    category: true,
    price: true,
    depositRequired: true,
    depositAmount: true,
  }),
});

// Type exports
export type ServiceCategory = z.infer<typeof serviceCategorySchema>;
export type ServiceStatus = z.infer<typeof serviceStatusSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
export type ServiceSearch = z.infer<typeof serviceSearchSchema>;
export type RequiredResource = z.infer<typeof requiredResourceSchema>;
