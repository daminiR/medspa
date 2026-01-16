/**
 * Provider validation schemas
 */

import { z } from 'zod';
import {
  uuidSchema,
  emailSchema,
  phoneSchema,
  paginationSchema,
  searchQuerySchema,
  colorHexSchema,
  timeStringSchema,
  dayOfWeekSchema,
  dateSchema,
} from './common';

// Provider status
export const providerStatusSchema = z.enum(['active', 'inactive', 'on_leave']);

// Experience level
export const experienceLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);

// Break schema for schedule
export const scheduleBreakSchema = z.object({
  id: uuidSchema.optional(),
  start: timeStringSchema,
  end: timeStringSchema,
  type: z.enum(['lunch', 'personal', 'meeting', 'training', 'other']).default('personal'),
});

// Daily schedule schema
export const dailyScheduleSchema = z.object({
  start: timeStringSchema,
  end: timeStringSchema,
  breaks: z.array(scheduleBreakSchema).default([]),
}).nullable();

// Schedule exception (holidays, PTO, etc.)
export const scheduleExceptionSchema = z.object({
  id: uuidSchema.optional(),
  date: dateSchema,
  type: z.enum(['holiday', 'pto', 'sick', 'training', 'other']),
  description: z.string().max(255).optional(),
  // If null, provider is completely off. Otherwise, modified hours.
  schedule: dailyScheduleSchema,
});

// Weekly schedule schema
export const weeklyScheduleSchema = z.object({
  sunday: dailyScheduleSchema,
  monday: dailyScheduleSchema,
  tuesday: dailyScheduleSchema,
  wednesday: dailyScheduleSchema,
  thursday: dailyScheduleSchema,
  friday: dailyScheduleSchema,
  saturday: dailyScheduleSchema,
  exceptions: z.array(scheduleExceptionSchema).default([]),
});

// Create provider input
export const createProviderSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  title: z.string().max(100).optional(), // e.g., "MD", "RN", "Aesthetician"

  // Contact
  email: emailSchema,
  phone: phoneSchema.optional(),

  // Profile
  bio: z.string().max(2000).optional(),
  photoUrl: z.string().url().optional(),

  // Services - simple string IDs for mock data compatibility
  serviceIds: z.array(z.string().min(1)).default([]),

  // Schedule (optional - can be set later)
  schedule: weeklyScheduleSchema.optional(),

  // Legacy schedule format (for backwards compatibility)
  workDays: z.array(dayOfWeekSchema).optional(), // 0-6 (Sunday-Saturday)
  startTime: timeStringSchema.optional(),
  endTime: timeStringSchema.optional(),

  // Booking settings
  staggerOnlineBooking: z.coerce.number().int().min(0).max(120).optional(), // Stagger interval in minutes

  // Capabilities
  certifications: z.array(z.string()).default([]),
  specialties: z.array(z.string()).default([]),
  experienceLevel: z.record(z.string(), experienceLevelSchema).optional(),

  // Display
  color: colorHexSchema.optional(),
  initials: z.string().min(1).max(3).optional(),

  // Status
  status: providerStatusSchema.default('active'),

  // Location assignment - simple string IDs for mock data compatibility
  locationIds: z.array(z.string().min(1)).default([]),
});

// Update provider input
export const updateProviderSchema = createProviderSchema.partial();

// Update schedule only
export const updateScheduleSchema = z.object({
  schedule: weeklyScheduleSchema,
});

// Add schedule exception
export const addScheduleExceptionSchema = scheduleExceptionSchema;

// Provider search/filter
export const providerSearchSchema = z.object({
  query: searchQuerySchema,
  status: providerStatusSchema.optional(),
  statuses: z.array(providerStatusSchema).optional(),
  serviceId: z.string().min(1).optional(), // Simple string for mock data compatibility
  locationId: z.string().min(1).optional(), // Simple string for mock data compatibility
  certification: z.string().optional(),
  specialty: z.string().optional(),
  availableOn: dateSchema.optional(), // Filter by providers available on a specific date
  ...paginationSchema.shape,
});

// Provider ID param (accepts UUID or simple string for mock data compatibility)
export const providerIdParamSchema = z.object({
  providerId: z.string().min(1),
});

// Availability query params
export const providerAvailabilitySchema = z.object({
  date: dateSchema,
  serviceId: z.string().min(1).optional(), // Simple string for mock data compatibility
  duration: z.coerce.number().int().min(5).max(480).optional(), // Override service duration
  locationId: z.string().min(1).optional(), // Simple string for mock data compatibility
});

// Bulk update providers
export const bulkUpdateProvidersSchema = z.object({
  providerIds: z.array(uuidSchema).min(1).max(100),
  updates: updateProviderSchema.pick({
    status: true,
    locationIds: true,
  }),
});

// Type exports
export type ProviderStatus = z.infer<typeof providerStatusSchema>;
export type ExperienceLevel = z.infer<typeof experienceLevelSchema>;
export type ScheduleBreak = z.infer<typeof scheduleBreakSchema>;
export type DailySchedule = z.infer<typeof dailyScheduleSchema>;
export type ScheduleException = z.infer<typeof scheduleExceptionSchema>;
export type WeeklySchedule = z.infer<typeof weeklyScheduleSchema>;
export type CreateProviderInput = z.infer<typeof createProviderSchema>;
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>;
export type ProviderSearch = z.infer<typeof providerSearchSchema>;
export type ProviderAvailabilityParams = z.infer<typeof providerAvailabilitySchema>;
