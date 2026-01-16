/**
 * Authentication Middleware
 *
 * Validates Firebase Auth tokens and extracts user info
 */

import { Context, Next } from 'hono';
import { config } from '../config';

// Type for authenticated user in context
export interface AuthUser {
  uid: string;
  email?: string;
  role?: string;
  permissions?: string[];
  locationIds?: string[];
  patientId?: string; // For patient portal users
}

// Extend Hono context variables
declare module 'hono' {
  interface ContextVariableMap {
    user: AuthUser;
  }
}

// Firebase Admin SDK initialization (lazy loaded)
let firebaseAdmin: typeof import('firebase-admin') | null = null;

async function getFirebaseAdmin() {
  if (!firebaseAdmin) {
    const admin = await import('firebase-admin');

    // Initialize only once
    if (admin.apps.length === 0) {
      admin.initializeApp({
        projectId: config.firebaseProjectId,
        credential: config.firebaseClientEmail && config.firebasePrivateKey
          ? admin.credential.cert({
              projectId: config.firebaseProjectId,
              clientEmail: config.firebaseClientEmail,
              privateKey: config.firebasePrivateKey,
            })
          : admin.credential.applicationDefault(),
      });
    }

    firebaseAdmin = admin;
  }

  return firebaseAdmin;
}

/**
 * Extract token from Authorization header
 */
function extractToken(header: string | undefined): string | null {
  if (!header) return null;
  if (header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return header;
}

/**
 * Authentication middleware
 * Validates Firebase ID token and sets user in context
 */
export async function authMiddleware(c: Context, next: Next) {
  const token = extractToken(c.req.header('Authorization'));

  if (!token) {
    return c.json(
      { error: 'Unauthorized', message: 'No authentication token provided' },
      401
    );
  }

  try {
    const admin = await getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Extract custom claims (set during user creation)
    const user: AuthUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: decodedToken.role as string | undefined,
      permissions: decodedToken.permissions as string[] | undefined,
      locationIds: decodedToken.locationIds as string[] | undefined,
      patientId: decodedToken.patientId as string | undefined,
    };

    c.set('user', user);
    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json(
      { error: 'Unauthorized', message: 'Invalid or expired token' },
      401
    );
  }
}

/**
 * Optional authentication middleware
 * Sets user if token is valid, but doesn't fail if not present
 */
export async function optionalAuthMiddleware(c: Context, next: Next) {
  const token = extractToken(c.req.header('Authorization'));

  if (token) {
    try {
      const admin = await getFirebaseAdmin();
      const decodedToken = await admin.auth().verifyIdToken(token);

      const user: AuthUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role as string | undefined,
        permissions: decodedToken.permissions as string[] | undefined,
        locationIds: decodedToken.locationIds as string[] | undefined,
        patientId: decodedToken.patientId as string | undefined,
      };

      c.set('user', user);
    } catch {
      // Token invalid, but that's okay for optional auth
    }
  }

  await next();
}

/**
 * Role requirement middleware
 */
export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        401
      );
    }

    if (!user.role || !roles.includes(user.role)) {
      return c.json(
        { error: 'Forbidden', message: 'Insufficient permissions' },
        403
      );
    }

    await next();
  };
}

/**
 * Permission requirement middleware
 */
export function requirePermission(...permissions: string[]) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        401
      );
    }

    const hasAllPermissions = permissions.every(
      p => user.permissions?.includes(p)
    );

    if (!hasAllPermissions) {
      return c.json(
        { error: 'Forbidden', message: 'Insufficient permissions' },
        403
      );
    }

    await next();
  };
}

// ===================
// Session-Based Auth (for Staff Routes with Custom Tokens)
// ===================

// In-memory session store (shared with staff-auth.ts)
// TODO: Move to database in production
interface StoredSession {
  id: string;
  token: string;
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  locationIds: string[];
  expiresAt: Date;
  lastActivityAt: Date;
}

// Export for use in staff-auth.ts
export const sessionStore = new Map<string, StoredSession>();

/**
 * Session-based authentication middleware
 * Validates custom session tokens (not Firebase)
 */
export async function sessionAuthMiddleware(c: Context, next: Next) {
  const token = extractToken(c.req.header('Authorization'));

  if (!token) {
    return c.json(
      { error: 'Unauthorized', message: 'No authentication token provided' },
      401
    );
  }

  // Find session by token
  let foundSession: StoredSession | undefined;
  for (const [sessionId, session] of sessionStore) {
    if (session.token === token) {
      foundSession = session;
      break;
    }
  }

  if (!foundSession) {
    return c.json(
      { error: 'Unauthorized', message: 'Invalid or expired token' },
      401
    );
  }

  // Check if session has expired
  if (new Date() > foundSession.expiresAt) {
    sessionStore.delete(foundSession.id);
    return c.json(
      { error: 'Unauthorized', message: 'Session expired. Please login again.' },
      401
    );
  }

  // Update last activity
  foundSession.lastActivityAt = new Date();

  // Set user in context
  const user: AuthUser = {
    uid: foundSession.userId,
    email: foundSession.email,
    role: foundSession.role,
    permissions: foundSession.permissions,
    locationIds: foundSession.locationIds,
  };

  c.set('user', user);
  await next();
}

/**
 * Optional session-based authentication middleware
 * Sets user if token is valid, but doesn't fail if not present
 */
export async function optionalSessionAuthMiddleware(c: Context, next: Next) {
  const token = extractToken(c.req.header('Authorization'));

  if (token) {
    // Find session by token
    for (const [sessionId, session] of sessionStore) {
      if (session.token === token) {
        // Check if session has expired
        if (new Date() <= session.expiresAt) {
          // Update last activity
          session.lastActivityAt = new Date();

          // Set user in context
          const user: AuthUser = {
            uid: session.userId,
            email: session.email,
            role: session.role,
            permissions: session.permissions,
            locationIds: session.locationIds,
          };

          c.set('user', user);
        }
        break;
      }
    }
  }

  await next();
}

/**
 * Patient access middleware
 * Ensures patients can only access their own data
 */
export async function patientAccessMiddleware(c: Context, next: Next) {
  const user = c.get('user');
  const requestedPatientId = c.req.param('patientId');

  if (!user) {
    return c.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      401
    );
  }

  // Staff can access any patient
  if (user.role && user.role !== 'patient') {
    await next();
    return;
  }

  // Patients can only access their own data
  if (user.patientId && user.patientId !== requestedPatientId) {
    return c.json(
      { error: 'Forbidden', message: 'Access denied' },
      403
    );
  }

  await next();
}
