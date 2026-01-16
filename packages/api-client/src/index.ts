/**
 * @medical-spa/api-client
 * Shared API client for Medical Spa Platform
 *
 * Provides type-safe API calls for:
 * - Authentication
 * - Appointments
 * - Services
 * - Patients
 * - Photos
 * - Messages
 * - Payments
 */

export { createApiClient, type ApiClient } from './client';
export { ApiError, isApiError } from './errors';
export * from './endpoints';
