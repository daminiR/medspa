// Locations and Resources Schema
import { pgTable, uuid, varchar, text, boolean, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { timestamps, auditColumns } from './common';

// Locations (Clinics)
export const locations = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).unique(), // e.g., 'NYC', 'LA'
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 20 }),
  country: varchar('country', { length: 100 }).default('USA'),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  timezone: varchar('timezone', { length: 50 }).default('America/New_York'),
  color: varchar('color', { length: 7 }).default('#3B82F6'),
  isActive: boolean('is_active').default(true),
  settings: jsonb('settings').$type<{
    businessHours?: { [key: number]: { start: string; end: string } };
    appointmentBuffer?: number;
    maxAdvanceBookingDays?: number;
    cancellationPolicy?: string;
  }>(),
  ...auditColumns,
});

// Rooms at each location
export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  locationId: uuid('location_id').notNull().references(() => locations.id),
  name: varchar('name', { length: 255 }).notNull(),
  capacity: integer('capacity').default(1),
  bufferMinutes: integer('buffer_minutes').default(0),
  isActive: boolean('is_active').default(true),
  equipment: jsonb('equipment').$type<string[]>(),
  ...timestamps,
});

// Resource pools (e.g., "Laser Machines", "Treatment Beds")
export const resourcePools = pgTable('resource_pools', {
  id: uuid('id').primaryKey().defaultRandom(),
  locationId: uuid('location_id').notNull().references(() => locations.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  defaultBufferMinutes: integer('default_buffer_minutes').default(0),
  ...timestamps,
});

// Individual resources within pools
export const resources = pgTable('resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  resourcePoolId: uuid('resource_pool_id').notNull().references(() => resourcePools.id),
  locationId: uuid('location_id').notNull().references(() => locations.id),
  name: varchar('name', { length: 255 }).notNull(),
  bufferMinutes: integer('buffer_minutes'),
  isActive: boolean('is_active').default(true),
  ...timestamps,
});

// Relations
export const locationsRelations = relations(locations, ({ many }) => ({
  rooms: many(rooms),
  resourcePools: many(resourcePools),
  resources: many(resources),
}));

export const roomsRelations = relations(rooms, ({ one }) => ({
  location: one(locations, {
    fields: [rooms.locationId],
    references: [locations.id],
  }),
}));

export const resourcePoolsRelations = relations(resourcePools, ({ one, many }) => ({
  location: one(locations, {
    fields: [resourcePools.locationId],
    references: [locations.id],
  }),
  resources: many(resources),
}));

export const resourcesRelations = relations(resources, ({ one }) => ({
  resourcePool: one(resourcePools, {
    fields: [resources.resourcePoolId],
    references: [resourcePools.id],
  }),
  location: one(locations, {
    fields: [resources.locationId],
    references: [locations.id],
  }),
}));
