import { Context } from 'hono';

/**
 * Extract client IP from request headers
 * Handles various proxy headers
 */
export function getClientIP(c: Context): string {
  return (
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    c.req.header('cf-connecting-ip') ||
    'unknown'
  );
}

/**
 * Extract user agent from request
 */
export function getUserAgent(c: Context): string {
  return c.req.header('user-agent') || 'unknown';
}

/**
 * Get full request metadata for audit logging
 */
export function getRequestMetadata(c: Context): {
  ip: string;
  userAgent: string;
  timestamp: Date;
  path: string;
  method: string;
} {
  return {
    ip: getClientIP(c),
    userAgent: getUserAgent(c),
    timestamp: new Date(),
    path: c.req.path,
    method: c.req.method,
  };
}
