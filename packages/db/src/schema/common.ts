// Common types and utilities for database schema
import { pgTable, uuid, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// UUID generator using crypto
export const generateUUID = () => sql`gen_random_uuid()`;

// Common timestamp columns
export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
};

// Audit columns for tracking changes
export const auditColumns = {
  ...timestamps,
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
};

// Soft delete column
export const softDelete = {
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: uuid('deleted_by'),
};

// Common enums
export const statusEnum = ['active', 'inactive', 'deleted'] as const;
export const genderEnum = ['male', 'female', 'other', 'prefer_not_to_say'] as const;
export const appointmentStatusEnum = [
  'scheduled',
  'confirmed',
  'arrived',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
  'deleted'
] as const;

export const paymentMethodEnum = [
  'cash',
  'check',
  'credit_card',
  'debit_card',
  'ach',
  'gift_card',
  'package_credit',
  'membership_credit',
  'insurance',
  'financing',
  'venmo',
  'zelle',
  'other'
] as const;

export const invoiceStatusEnum = [
  'draft',
  'sent',
  'viewed',
  'paid',
  'partially_paid',
  'overdue',
  'cancelled',
  'refunded'
] as const;
