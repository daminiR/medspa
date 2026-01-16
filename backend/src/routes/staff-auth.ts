/**
 * Staff Authentication Routes
 *
 * Handles staff login/logout with Firebase Auth + custom session management
 * Includes PIN-based quick access for HIPAA-compliant screen lock
 *
 * Flow:
 * 1. Staff logs in with email/password (validated via Firebase)
 * 2. Backend creates session token and returns JWT
 * 3. After 15-min inactivity, screen locks
 * 4. Staff enters PIN to resume session (quick re-auth)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { sessionAuthMiddleware, sessionStore } from '../middleware/auth';
import { APIError } from '../middleware/error';
import {
  createSession,
  hashSessionToken,
  validateSession,
  SESSION_PRESETS,
  type Session,
} from '@medical-spa/security';
import { logLogin, logLogout, logAuditEvent } from '@medical-spa/security';

// Firebase Admin for server-side auth verification
// Note: In production, import and initialize firebase-admin properly
// import { getAuth } from 'firebase-admin/auth';

const staffAuth = new Hono();

// ===================
// Validation Schemas
// ===================

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  mfaToken: z.string().length(6).regex(/^\d+$/).optional(),
  deviceInfo: z.object({
    userAgent: z.string().optional(),
    deviceType: z.string().optional(),
  }).optional(),
});

const pinSetSchema = z.object({
  pin: z.string()
    .min(4, 'PIN must be at least 4 digits')
    .max(6, 'PIN must be at most 6 digits')
    .regex(/^\d+$/, 'PIN must contain only digits'),
});

const pinVerifySchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  pin: z.string()
    .min(4, 'PIN must be at least 4 digits')
    .max(6, 'PIN must be at most 6 digits')
    .regex(/^\d+$/, 'PIN must contain only digits'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ===================
// In-Memory Storage (Replace with database in production)
// ===================

// TODO: Replace with database queries to:
// - staff_sessions table
// - staff_pins table
// - users table

// Session store is imported from middleware/auth.ts (shared)
// Extended session type with refresh token info
interface ExtendedSession {
  id: string;
  token: string;
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  locationIds: string[];
  expiresAt: Date;
  lastActivityAt: Date;
  refreshToken: string;
  refreshTokenHash: string;
}

interface StoredPIN {
  userId: string;
  pinHash: string;
  failedAttempts: number;
  lockedUntil: Date | null;
  createdAt: Date;
  lastUsedAt: Date;
}

const staffPins = new Map<string, StoredPIN>();

// Extended session info (includes refresh tokens) - separate from shared sessionStore
const extendedSessions = new Map<string, ExtendedSession>();

// PIN lockout rules
const PIN_LOCKOUT_THRESHOLD = 3;
const PIN_LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// ===================
// Helper Functions
// ===================

/**
 * Hash a PIN for secure storage using bcrypt
 * Uses 12 salt rounds for strong security
 */
async function hashPIN(pin: string): Promise<string> {
  return bcrypt.hash(pin, 12);
}

/**
 * Verify PIN against stored hash using bcrypt
 */
async function verifyPIN(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

/**
 * Generate a refresh token
 */
function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Get client IP from request
 */
function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

// ===================
// Staff Login
// ===================

/**
 * Staff Login
 * POST /api/auth/staff/login
 *
 * Validates credentials via Firebase Auth and creates a session
 */
staffAuth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password, mfaToken, deviceInfo } = c.req.valid('json');
  const ipAddress = getClientIP(c);
  const userAgent = c.req.header('user-agent') || '';

  try {
    // TODO: In production, verify credentials with Firebase Admin SDK
    // const firebaseAuth = getAuth();
    // const userRecord = await firebaseAuth.getUserByEmail(email);

    // For development, simulate Firebase auth verification
    // In production, this would:
    // 1. Sign in with Firebase client SDK on frontend
    // 2. Send ID token to backend
    // 3. Verify ID token with Firebase Admin SDK

    // Mock user lookup - replace with actual database query
    // const dbUser = await db.query.users.findFirst({
    //   where: eq(users.email, email)
    // });

    // Simulated user for development
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      firebaseUid: 'firebase-uid-123',
      email: email,
      role: 'admin' as const,
      firstName: 'Test',
      lastName: 'User',
      mfaEnabled: false,
      primaryLocationId: '660e8400-e29b-41d4-a716-446655440001',
    };

    // Check if MFA is required and not provided
    if (mockUser.mfaEnabled && !mfaToken) {
      return c.json({
        requireMFA: true,
        userId: mockUser.id,
        message: 'MFA verification required',
      }, 401);
    }

    // TODO: Verify MFA token if provided
    // if (mockUser.mfaEnabled && mfaToken) {
    //   const isValid = verifyMFAToken(mockUser.mfaSecret, mfaToken);
    //   if (!isValid) {
    //     await logLogin(mockUser.id, false, ipAddress, userAgent, 'Invalid MFA token');
    //     throw APIError.unauthorized('Invalid MFA token');
    //   }
    // }

    // Create session with standard (15-min inactivity) timeout
    const session = createSession(mockUser.id, {
      ipAddress,
      userAgent,
      config: SESSION_PRESETS.standard,
    });

    // Generate refresh token
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashSessionToken(refreshToken);

    // Get user permissions based on role
    // const permissions = getRolePermissions(mockUser.role);
    const permissions = ['patients:read', 'appointments:read', 'appointments:write'];

    // Store session in shared session store
    const storedSession = {
      id: session.id,
      token: session.token,
      userId: mockUser.id,
      email: mockUser.email,
      role: mockUser.role,
      permissions,
      locationIds: [mockUser.primaryLocationId],
      expiresAt: session.expiresAt,
      lastActivityAt: session.lastActivityAt,
    };
    sessionStore.set(session.id, storedSession);

    // Store extended info for refresh token (in a separate map for now)
    const extendedSession: ExtendedSession = {
      ...storedSession,
      refreshToken,
      refreshTokenHash,
    };
    extendedSessions.set(session.id, extendedSession);

    // Log successful login
    await logLogin(mockUser.id, true, ipAddress, userAgent);

    // Update last login timestamp
    // await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, mockUser.id));

    return c.json({
      user: {
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
        permissions,
        locationIds: storedSession.locationIds,
      },
      session: {
        id: session.id,
        expiresAt: session.expiresAt.toISOString(),
      },
      accessToken: session.token,
      refreshToken,
      expiresIn: 8 * 60 * 60, // 8 hours in seconds
    });

  } catch (error) {
    // Log failed login attempt
    await logLogin(email, false, ipAddress, userAgent, (error as Error).message);

    if (error instanceof APIError) {
      throw error;
    }

    throw APIError.unauthorized('Invalid email or password');
  }
});

// ===================
// Refresh Session
// ===================

/**
 * Refresh Access Token
 * POST /api/auth/staff/refresh
 *
 * Uses refresh token to get a new access token
 */
staffAuth.post('/refresh', zValidator('json', refreshSchema), async (c) => {
  const { refreshToken } = c.req.valid('json');
  const ipAddress = getClientIP(c);
  const userAgent = c.req.header('user-agent') || '';

  // Find session by refresh token
  const refreshTokenHash = hashSessionToken(refreshToken);
  let foundSession: ExtendedSession | undefined;

  for (const [sessionId, session] of extendedSessions) {
    if (session.refreshTokenHash === refreshTokenHash) {
      foundSession = session;
      break;
    }
  }

  if (!foundSession) {
    throw APIError.unauthorized('Invalid refresh token');
  }

  // Check if session has expired (absolute timeout)
  if (new Date() > foundSession.expiresAt) {
    sessionStore.delete(foundSession.id);
    extendedSessions.delete(foundSession.id);
    throw APIError.unauthorized('Session expired. Please login again.');
  }

  // Rotate refresh token (one-time use)
  const newRefreshToken = generateRefreshToken();
  const newRefreshTokenHash = hashSessionToken(newRefreshToken);

  // Create new session
  const newSession = createSession(foundSession.userId, {
    ipAddress,
    userAgent,
    config: SESSION_PRESETS.standard,
  });

  // Update shared session store
  const newStoredSession = {
    id: newSession.id,
    token: newSession.token,
    userId: foundSession.userId,
    email: foundSession.email,
    role: foundSession.role,
    permissions: foundSession.permissions,
    locationIds: foundSession.locationIds,
    expiresAt: newSession.expiresAt,
    lastActivityAt: newSession.lastActivityAt,
  };

  // Update extended session
  const newExtendedSession: ExtendedSession = {
    ...newStoredSession,
    refreshToken: newRefreshToken,
    refreshTokenHash: newRefreshTokenHash,
  };

  // Delete old session, store new
  sessionStore.delete(foundSession.id);
  extendedSessions.delete(foundSession.id);
  sessionStore.set(newSession.id, newStoredSession);
  extendedSessions.set(newSession.id, newExtendedSession);

  return c.json({
    session: {
      id: newSession.id,
      expiresAt: newSession.expiresAt.toISOString(),
    },
    accessToken: newSession.token,
    refreshToken: newRefreshToken,
    expiresIn: 8 * 60 * 60,
  });
});

// ===================
// Logout
// ===================

/**
 * Staff Logout
 * POST /api/auth/staff/logout
 *
 * Invalidates the current session
 */
staffAuth.post('/logout', sessionAuthMiddleware, async (c) => {
  const user = c.get('user');
  const ipAddress = getClientIP(c);
  const authHeader = c.req.header('authorization');

  // Find and delete session
  const token = authHeader?.replace('Bearer ', '');
  if (token) {
    for (const [sessionId, session] of sessionStore) {
      if (session.token === token) {
        sessionStore.delete(sessionId);
        extendedSessions.delete(sessionId);

        // Log logout
        await logLogout(user.uid, sessionId, ipAddress);
        break;
      }
    }
  }

  return c.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// ===================
// PIN Management
// ===================

/**
 * Set PIN for Quick Access
 * POST /api/auth/staff/pin/set
 *
 * Sets a 4-6 digit PIN for screen lock re-authentication
 * Requires full authentication first
 */
staffAuth.post('/pin/set', sessionAuthMiddleware, zValidator('json', pinSetSchema), async (c) => {
  const user = c.get('user');
  const { pin } = c.req.valid('json');
  const ipAddress = getClientIP(c);

  // Hash the PIN
  const pinHash = await hashPIN(pin);

  // Store PIN (replace with database in production)
  // await db.insert(staffPins).values({
  //   userId: user.uid,
  //   pinHash,
  //   createdAt: new Date(),
  // }).onConflictDoUpdate({
  //   target: staffPins.userId,
  //   set: { pinHash, failedAttempts: 0, lockedUntil: null, updatedAt: new Date() }
  // });

  staffPins.set(user.uid, {
    userId: user.uid,
    pinHash,
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: new Date(),
    lastUsedAt: new Date(),
  });

  // Log PIN set event
  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'staff_pin',
    ipAddress,
    metadata: { event: 'pin_set' },
  });

  return c.json({
    success: true,
    message: 'PIN set successfully',
  });
});

/**
 * Verify PIN for Quick Re-authentication
 * POST /api/auth/staff/pin/verify
 *
 * Used after screen lock to resume session without full login
 * Does NOT require authMiddleware since session may be locked
 */
staffAuth.post('/pin/verify', zValidator('json', pinVerifySchema), async (c) => {
  const { userId, pin } = c.req.valid('json');
  const ipAddress = getClientIP(c);
  const userAgent = c.req.header('user-agent') || '';

  // Get stored PIN
  const storedPIN = staffPins.get(userId);
  if (!storedPIN) {
    throw APIError.badRequest('No PIN set. Please log in with password.');
  }

  // Check if locked out
  if (storedPIN.lockedUntil && new Date() < storedPIN.lockedUntil) {
    const remainingMs = storedPIN.lockedUntil.getTime() - Date.now();
    const remainingMin = Math.ceil(remainingMs / 60000);

    await logAuditEvent({
      userId,
      action: 'ACCESS_DENIED',
      resourceType: 'staff_pin',
      ipAddress,
      metadata: { reason: 'locked_out', remainingMinutes: remainingMin },
    });

    throw APIError.tooManyRequests(
      `PIN locked. Try again in ${remainingMin} minute${remainingMin > 1 ? 's' : ''}.`
    );
  }

  // Verify PIN
  const isValid = await verifyPIN(pin, storedPIN.pinHash);

  if (!isValid) {
    // Increment failed attempts
    storedPIN.failedAttempts += 1;

    // Check if should lock out
    if (storedPIN.failedAttempts >= PIN_LOCKOUT_THRESHOLD) {
      storedPIN.lockedUntil = new Date(Date.now() + PIN_LOCKOUT_DURATION_MS);

      await logAuditEvent({
        userId,
        action: 'ACCESS_DENIED',
        resourceType: 'staff_pin',
        ipAddress,
        metadata: { reason: 'lockout_triggered', failedAttempts: storedPIN.failedAttempts },
      });

      throw APIError.tooManyRequests(
        'Too many failed PIN attempts. Please login with password.'
      );
    }

    await logAuditEvent({
      userId,
      action: 'ACCESS_DENIED',
      resourceType: 'staff_pin',
      ipAddress,
      metadata: { reason: 'invalid_pin', failedAttempts: storedPIN.failedAttempts },
    });

    const remainingAttempts = PIN_LOCKOUT_THRESHOLD - storedPIN.failedAttempts;
    throw APIError.unauthorized(
      `Invalid PIN. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`
    );
  }

  // PIN is valid - reset failed attempts
  storedPIN.failedAttempts = 0;
  storedPIN.lockedUntil = null;
  storedPIN.lastUsedAt = new Date();

  // Find existing session for this user and extend it
  let userSession: ExtendedSession | undefined;
  for (const [sessionId, session] of extendedSessions) {
    if (session.userId === userId) {
      userSession = session;
      break;
    }
  }

  if (!userSession) {
    // No active session - require full login
    throw APIError.unauthorized('Session expired. Please login with password.');
  }

  // Extend session activity
  userSession.lastActivityAt = new Date();

  // Log successful PIN verification
  await logAuditEvent({
    userId,
    action: 'LOGIN',
    resourceType: 'staff_pin',
    ipAddress,
    userAgent,
    metadata: { event: 'pin_verified', sessionId: userSession.id },
  });

  return c.json({
    success: true,
    user: {
      id: userSession.userId,
      email: userSession.email,
      role: userSession.role,
      permissions: userSession.permissions,
      locationIds: userSession.locationIds,
    },
    session: {
      id: userSession.id,
      expiresAt: userSession.expiresAt.toISOString(),
    },
    accessToken: userSession.token,
  });
});

/**
 * Check if PIN is set for user
 * GET /api/auth/staff/pin/status
 */
staffAuth.get('/pin/status', sessionAuthMiddleware, async (c) => {
  const user = c.get('user');

  const storedPIN = staffPins.get(user.uid);

  return c.json({
    hasPin: Boolean(storedPIN),
    isLocked: storedPIN?.lockedUntil ? new Date() < storedPIN.lockedUntil : false,
    failedAttempts: storedPIN?.failedAttempts || 0,
  });
});

/**
 * Remove PIN
 * DELETE /api/auth/staff/pin
 */
staffAuth.delete('/pin', sessionAuthMiddleware, async (c) => {
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  staffPins.delete(user.uid);

  await logAuditEvent({
    userId: user.uid,
    action: 'DELETE',
    resourceType: 'staff_pin',
    ipAddress,
    metadata: { event: 'pin_removed' },
  });

  return c.json({
    success: true,
    message: 'PIN removed successfully',
  });
});

// Export function to clear stores (for testing)
export function clearStores() {
  staffPins.clear();
  extendedSessions.clear();
}

export default staffAuth;
