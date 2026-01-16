/**
 * Audit Logging Middleware
 *
 * Logs all API requests for HIPAA compliance
 */

import { Context, Next } from 'hono';
import { logAuditEvent, type AuditAction } from '@medical-spa/security';

// HTTP method to audit action mapping
const METHOD_TO_ACTION: Record<string, AuditAction> = {
  GET: 'READ',
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

// Routes that access PHI (Protected Health Information)
const PHI_ROUTES = [
  '/api/patients',
  '/api/appointments',
  '/api/treatment-records',
  '/api/clinical',
  '/api/charting',
  '/api/consents',
  '/api/photos',
  '/api/prescriptions',
];

// Routes to skip audit logging
const SKIP_ROUTES = [
  '/health',
  '/ready',
  '/api/health',
  '/api/ready',
];

/**
 * Check if route accesses PHI
 */
function isPHIRoute(path: string): boolean {
  return PHI_ROUTES.some(route => path.startsWith(route));
}

/**
 * Check if route should skip audit logging
 */
function shouldSkipAudit(path: string): boolean {
  return SKIP_ROUTES.some(route => path === route || path.startsWith(route));
}

/**
 * Extract resource info from path
 */
function extractResourceInfo(path: string): { resourceType: string; resourceId?: string } {
  const parts = path.split('/').filter(Boolean);

  // Find the API resource (e.g., /api/patients/123 -> patients)
  const apiIndex = parts.indexOf('api');
  const resourceType = parts[apiIndex + 1] || 'unknown';
  const resourceId = parts[apiIndex + 2];

  return {
    resourceType,
    resourceId: resourceId && !resourceId.includes('?') ? resourceId : undefined,
  };
}

/**
 * Audit logging middleware
 */
export async function auditMiddleware(c: Context, next: Next) {
  const path = c.req.path;

  // Skip certain routes
  if (shouldSkipAudit(path)) {
    await next();
    return;
  }

  const startTime = Date.now();
  const user = c.get('user');
  const method = c.req.method;
  const { resourceType, resourceId } = extractResourceInfo(path);

  // Execute the route handler
  await next();

  // Log after response
  const duration = Date.now() - startTime;
  const status = c.res.status;

  // Only log if user is authenticated or if there's an auth failure
  if (user || status === 401 || status === 403) {
    await logAuditEvent({
      userId: user?.uid,
      userEmail: user?.email,
      action: status >= 400
        ? 'ACCESS_DENIED'
        : (METHOD_TO_ACTION[method] || 'READ'),
      resourceType,
      resourceId,
      phiAccessed: isPHIRoute(path) && status < 400,
      ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
      userAgent: c.req.header('user-agent'),
      metadata: {
        method,
        path,
        status,
        duration,
        query: Object.fromEntries(new URL(c.req.url).searchParams),
      },
    });
  }
}

/**
 * Explicit PHI access logging (for detailed field-level tracking)
 */
export async function logPHIFieldAccess(
  c: Context,
  patientId: string,
  fields: string[],
  action: AuditAction = 'READ'
) {
  const user = c.get('user');

  if (!user) return;

  await logAuditEvent({
    userId: user.uid,
    userEmail: user.email,
    patientId,
    action,
    resourceType: 'patient',
    resourceId: patientId,
    phiAccessed: true,
    phiFields: fields,
    ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
    userAgent: c.req.header('user-agent'),
  });
}
