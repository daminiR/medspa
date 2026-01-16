/**
 * @medical-spa/validations
 *
 * Shared Zod validation schemas for Medical Spa Platform
 * Used by both frontend and backend for type-safe validation
 */

// Re-export Zod for convenience
export { z } from 'zod';

// Common schemas
export * from './common';

// Domain schemas
export * from './patient';
export * from './appointment';
export * from './billing';
export * from './auth';
export * from './service';
export * from './provider';
export * from './calendar';
export * from './messaging';
