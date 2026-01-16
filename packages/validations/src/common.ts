/**
 * Common validation schemas
 */

import { z } from 'zod';

// UUID validation
export const uuidSchema = z.string().uuid();

// Email validation
export const emailSchema = z.string().email().toLowerCase().trim();

// Phone number validation (US format)
export const phoneSchema = z.string().regex(
  /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  'Invalid phone number format'
);

// Date validation
export const dateSchema = z.coerce.date();
export const dateStringSchema = z.string().datetime();

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Sort order
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

// Money (in cents)
export const moneySchema = z.coerce.number().int().min(0);

// Decimal money (for display)
export const decimalMoneySchema = z.coerce.number().min(0).multipleOf(0.01);

// Percentage (0-100)
export const percentageSchema = z.coerce.number().min(0).max(100);

// Status enums
export const statusSchema = z.enum(['active', 'inactive']);

// Time string (HH:MM format)
export const timeStringSchema = z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)');

// Day of week (0-6, Sunday-Saturday)
export const dayOfWeekSchema = z.coerce.number().int().min(0).max(6);

// Color hex
export const colorHexSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color');

// URL
export const urlSchema = z.string().url();

// Optional URL
export const optionalUrlSchema = z.string().url().optional().or(z.literal(''));

// Zip code (US)
export const zipCodeSchema = z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code');

// State code (US 2-letter)
export const stateCodeSchema = z.string().length(2).toUpperCase();

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1).max(255),
  street2: z.string().max(255).optional(),
  city: z.string().min(1).max(100),
  state: stateCodeSchema,
  zipCode: zipCodeSchema,
  country: z.string().max(100).default('USA'),
});

// Search query
export const searchQuerySchema = z.string().min(1).max(255).optional();

// ID array (for bulk operations)
export const idArraySchema = z.array(uuidSchema).min(1).max(100);

// Generic list response
export const listResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().min(0),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    hasMore: z.boolean(),
  });

// Error response
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

// Success response
export const successResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
});
