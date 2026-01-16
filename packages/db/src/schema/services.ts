// Services Schema
import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { timestamps, auditColumns } from './common';
import { users } from './users';
import { resourcePools } from './locations';

// Service categories
export const serviceCategoryEnum = [
  'physiotherapy',
  'chiropractic',
  'aesthetics',
  'massage',
  'injectables',
  'laser',
  'facial',
  'body_contouring',
  'skincare',
  'consultation',
  'other'
] as const;

// Services table
export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }),
  description: text('description'),
  category: varchar('category', { length: 50 }).$type<typeof serviceCategoryEnum[number]>(),

  // Duration
  duration: integer('duration').notNull(), // minutes - actual treatment time
  scheduledDuration: integer('scheduled_duration'), // minutes - calendar block time

  // Pricing
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  memberPrice: decimal('member_price', { precision: 10, scale: 2 }),
  costOfGoods: decimal('cost_of_goods', { precision: 10, scale: 2 }), // For margin tracking

  // Deposit settings
  depositRequired: boolean('deposit_required').default(false),
  depositAmount: decimal('deposit_amount', { precision: 10, scale: 2 }),
  depositPercent: integer('deposit_percent'),

  // Post-treatment time
  postTreatmentTime: integer('post_treatment_time').default(0), // minutes for reset/sanitization

  // Capabilities required
  requiredCapabilities: jsonb('required_capabilities').$type<string[]>(),
  preferredCapabilities: jsonb('preferred_capabilities').$type<string[]>(),
  requiredEquipment: jsonb('required_equipment').$type<string[]>(),

  // Resource requirements
  resourceRequirements: jsonb('resource_requirements').$type<{
    resourcePoolId: string;
    quantity: number;
  }[]>(),

  // Flags
  isActive: boolean('is_active').default(true),
  isOnlineBookable: boolean('is_online_bookable').default(true),
  isInitialVisit: boolean('is_initial_visit').default(false),
  requiresConsent: boolean('requires_consent').default(false),
  consentFormIds: jsonb('consent_form_ids').$type<string[]>(),

  // Products used (for inventory deduction)
  defaultProducts: jsonb('default_products').$type<{
    productId: string;
    quantity: number;
    isOptional: boolean;
  }[]>(),

  // Prep instructions for patients
  prepInstructions: text('prep_instructions'),
  aftercareInstructions: text('aftercare_instructions'),

  // Display
  color: varchar('color', { length: 7 }),
  imageUrl: text('image_url'),
  sortOrder: integer('sort_order').default(0),

  // Tags for filtering
  tags: jsonb('tags').$type<string[]>(),

  ...auditColumns,
});

// Service-practitioner assignments (who can perform this service)
export const servicePractitioners = pgTable('service_practitioners', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceId: uuid('service_id').notNull().references(() => services.id),
  practitionerId: uuid('practitioner_id').notNull().references(() => users.id),
  isPreferred: boolean('is_preferred').default(false),
  customPrice: decimal('custom_price', { precision: 10, scale: 2 }),
  customDuration: integer('custom_duration'),
  ...timestamps,
});

// Service add-ons
export const serviceAddons = pgTable('service_addons', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceId: uuid('service_id').notNull().references(() => services.id),
  addonServiceId: uuid('addon_service_id').notNull().references(() => services.id),
  isDefault: boolean('is_default').default(false),
  discountPercent: integer('discount_percent'),
  ...timestamps,
});

// Service pricing tiers (for packages/memberships)
export const servicePricingTiers = pgTable('service_pricing_tiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceId: uuid('service_id').notNull().references(() => services.id),
  name: varchar('name', { length: 100 }).notNull(), // e.g., "Gold Member", "Package Price"
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  conditions: jsonb('conditions').$type<{
    membershipTiers?: string[];
    packageIds?: string[];
    minQuantity?: number;
  }>(),
  ...timestamps,
});

// Relations
export const servicesRelations = relations(services, ({ many }) => ({
  practitioners: many(servicePractitioners),
  addons: many(serviceAddons),
  pricingTiers: many(servicePricingTiers),
}));

export const servicePractitionersRelations = relations(servicePractitioners, ({ one }) => ({
  service: one(services, {
    fields: [servicePractitioners.serviceId],
    references: [services.id],
  }),
  practitioner: one(users, {
    fields: [servicePractitioners.practitionerId],
    references: [users.id],
  }),
}));

export const serviceAddonsRelations = relations(serviceAddons, ({ one }) => ({
  service: one(services, {
    fields: [serviceAddons.serviceId],
    references: [services.id],
  }),
  addonService: one(services, {
    fields: [serviceAddons.addonServiceId],
    references: [services.id],
  }),
}));
