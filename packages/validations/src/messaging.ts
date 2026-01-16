/**
 * Messaging & Templates Validation Schemas
 * Shared validation for messaging templates API
 */

import { z } from 'zod';

// Template categories
export const templateCategorySchema = z.enum([
  'appointment',
  'treatment',
  'marketing',
  'financial',
  'followup',
  'emergency',
  'administrative',
  'membership',
  'review',
]);

// Template channels
export const templateChannelSchema = z.enum(['sms', 'email', 'both']);

// Compliance schema
export const templateComplianceSchema = z.object({
  hipaaCompliant: z.boolean(),
  includesOptOut: z.boolean(),
  maxLength: z.number().optional(),
});

// Create template schema
export const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  category: templateCategorySchema,
  channel: templateChannelSchema,
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(5000),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  compliance: templateComplianceSchema.optional(),
});

// Update template schema (all fields optional)
export const updateTemplateSchema = createTemplateSchema.partial();

// Template search schema
export const templateSearchSchema = z.object({
  query: z.string().optional(),
  category: templateCategorySchema.optional(),
  categories: z.array(templateCategorySchema).optional(),
  channel: templateChannelSchema.optional(),
  isActive: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

// Template ID param schema
export const templateIdParamSchema = z.object({
  templateId: z.string().min(1),
});

// Render template schema
export const renderTemplateSchema = z.object({
  templateId: z.string().min(1),
  variables: z.record(z.string(), z.any()),
});

// Template category schema
export const categoryParamSchema = z.object({
  category: templateCategorySchema,
});

// Export types
export type TemplateCategory = z.infer<typeof templateCategorySchema>;
export type TemplateChannel = z.infer<typeof templateChannelSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type TemplateSearchQuery = z.infer<typeof templateSearchSchema>;
export type RenderTemplateInput = z.infer<typeof renderTemplateSchema>;
