/**
 * Error Handling Middleware
 */

import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { config } from '../config';

// Custom API error class
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIError';
  }

  static badRequest(message: string, details?: Record<string, unknown>) {
    return new APIError(400, 'BAD_REQUEST', message, details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new APIError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'Forbidden') {
    return new APIError(403, 'FORBIDDEN', message);
  }

  static notFound(resource = 'Resource') {
    return new APIError(404, 'NOT_FOUND', `${resource} not found`);
  }

  static conflict(message: string) {
    return new APIError(409, 'CONFLICT', message);
  }

  static tooManyRequests(message = 'Too many requests') {
    return new APIError(429, 'TOO_MANY_REQUESTS', message);
  }

  static internal(message = 'Internal server error') {
    return new APIError(500, 'INTERNAL_ERROR', message);
  }
}

/**
 * Format Zod validation errors
 */
function formatZodError(error: ZodError) {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

/**
 * Global error handler
 */
export function errorHandler(error: Error, c: Context) {
  console.error('Error:', error);

  // API Error
  if (error instanceof APIError) {
    return c.json(
      {
        error: error.code,
        message: error.message,
        ...(error.details && { details: error.details }),
      },
      error.statusCode as 400 | 401 | 403 | 404 | 409 | 429 | 500
    );
  }

  // Zod validation error
  if (error instanceof ZodError) {
    return c.json(
      {
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: formatZodError(error),
      },
      400
    );
  }

  // Hono HTTP Exception
  if (error instanceof HTTPException) {
    return c.json(
      {
        error: 'HTTP_ERROR',
        message: error.message,
      },
      error.status
    );
  }

  // Unknown error
  const isDev = config.nodeEnv === 'development';
  return c.json(
    {
      error: 'INTERNAL_ERROR',
      message: isDev ? error.message : 'An unexpected error occurred',
      ...(isDev && { stack: error.stack }),
    },
    500
  );
}

/**
 * Not found handler
 */
export function notFoundHandler(c: Context) {
  return c.json(
    {
      error: 'NOT_FOUND',
      message: `Route ${c.req.method} ${c.req.path} not found`,
    },
    404
  );
}
