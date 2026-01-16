/**
 * Standardized API Response Utilities
 * Provides consistent response format across all API endpoints
 */

/**
 * Success response format
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Error response format
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    validationErrors?: ValidationError[];
  };
}

/**
 * Validation error format
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a success response
 */
export function apiSuccess<T>(
  data: T,
  meta?: ApiSuccessResponse['meta']
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

/**
 * Create an error response
 */
export function apiError(
  code: string,
  message: string,
  details?: Record<string, any>,
  validationErrors?: ValidationError[]
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(validationErrors && { validationErrors }),
    },
  };
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Authorization errors
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_DECLINED: 'PAYMENT_DECLINED',
  INVALID_PAYMENT_METHOD: 'INVALID_PAYMENT_METHOD',

  // Appointment errors
  SLOT_NOT_AVAILABLE: 'SLOT_NOT_AVAILABLE',
  APPOINTMENT_NOT_FOUND: 'APPOINTMENT_NOT_FOUND',
  CANCELLATION_NOT_ALLOWED: 'CANCELLATION_NOT_ALLOWED',
  RESCHEDULE_NOT_ALLOWED: 'RESCHEDULE_NOT_ALLOWED',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * HTTP status codes mapping
 */
export const StatusCodes: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  INVALID_CREDENTIALS: 401,
  TOKEN_EXPIRED: 401,
  TOKEN_INVALID: 401,
  SESSION_EXPIRED: 401,
  FORBIDDEN: 403,
  INSUFFICIENT_PERMISSIONS: 403,
  VALIDATION_ERROR: 400,
  INVALID_INPUT: 400,
  MISSING_REQUIRED_FIELD: 400,
  NOT_FOUND: 404,
  ALREADY_EXISTS: 409,
  CONFLICT: 409,
  RATE_LIMIT_EXCEEDED: 429,
  PAYMENT_FAILED: 402,
  PAYMENT_DECLINED: 402,
  INVALID_PAYMENT_METHOD: 400,
  SLOT_NOT_AVAILABLE: 409,
  APPOINTMENT_NOT_FOUND: 404,
  CANCELLATION_NOT_ALLOWED: 400,
  RESCHEDULE_NOT_ALLOWED: 400,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  DATABASE_ERROR: 500,
};

/**
 * Get HTTP status code for error code
 */
export function getStatusCode(errorCode: ErrorCode): number {
  return StatusCodes[errorCode] || 500;
}

/**
 * Create a paginated success response
 */
export function apiPaginatedSuccess<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): ApiSuccessResponse<T[]> {
  return apiSuccess(data, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

/**
 * Create validation error response from Zod errors
 */
export function apiValidationError(
  errors: { path: PropertyKey[]; message: string }[]
): ApiErrorResponse {
  const validationErrors: ValidationError[] = errors.map((err) => ({
    field: err.path.map(p => String(p)).join('.'),
    message: err.message,
  }));

  return apiError(
    ErrorCodes.VALIDATION_ERROR,
    'Validation failed',
    undefined,
    validationErrors
  );
}

/**
 * Helper to handle try-catch in API routes
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>
): Promise<T | ApiErrorResponse> {
  try {
    return await fn();
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof Error) {
      return apiError(
        ErrorCodes.INTERNAL_ERROR,
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'An unexpected error occurred'
      );
    }

    return apiError(ErrorCodes.INTERNAL_ERROR, 'An unexpected error occurred');
  }
}
