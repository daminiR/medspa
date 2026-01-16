/**
 * Session Management Module
 *
 * HIPAA-compliant session handling:
 * - Automatic session timeout (configurable)
 * - Secure session tokens
 * - Session tracking and invalidation
 * - Activity monitoring
 */

import crypto from 'crypto';

// Default session settings (HIPAA recommends 10-15 minutes of inactivity)
const DEFAULT_SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_ABSOLUTE_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 hours
const TOKEN_LENGTH = 64; // 64 bytes = 128 hex chars

export interface SessionConfig {
  inactivityTimeoutMs?: number;
  absoluteTimeoutMs?: number;
  extendOnActivity?: boolean;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}

export interface SessionValidationResult {
  valid: boolean;
  session?: Session;
  reason?: 'expired' | 'inactive' | 'invalid' | 'not_found';
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(TOKEN_LENGTH).toString('hex');
}

/**
 * Generate a session ID
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Create a new session
 */
export function createSession(
  userId: string,
  options: {
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
    config?: SessionConfig;
  } = {}
): Session {
  const now = new Date();
  const config = options.config || {};

  const absoluteTimeoutMs = config.absoluteTimeoutMs || DEFAULT_ABSOLUTE_TIMEOUT_MS;

  return {
    id: generateSessionId(),
    userId,
    token: generateSessionToken(),
    createdAt: now,
    expiresAt: new Date(now.getTime() + absoluteTimeoutMs),
    lastActivityAt: now,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
    deviceId: options.deviceId,
  };
}

/**
 * Check if a session is valid
 */
export function validateSession(
  session: Session | null | undefined,
  config: SessionConfig = {}
): SessionValidationResult {
  if (!session) {
    return { valid: false, reason: 'not_found' };
  }

  const now = new Date();
  const inactivityTimeoutMs = config.inactivityTimeoutMs || DEFAULT_SESSION_TIMEOUT_MS;

  // Check absolute expiration
  if (now > session.expiresAt) {
    return { valid: false, reason: 'expired', session };
  }

  // Check inactivity timeout
  const inactiveMs = now.getTime() - session.lastActivityAt.getTime();
  if (inactiveMs > inactivityTimeoutMs) {
    return { valid: false, reason: 'inactive', session };
  }

  return { valid: true, session };
}

/**
 * Extend session on activity
 */
export function extendSession(
  session: Session,
  config: SessionConfig = {}
): Session {
  const now = new Date();
  const extendOnActivity = config.extendOnActivity !== false; // Default true

  if (!extendOnActivity) {
    return { ...session, lastActivityAt: now };
  }

  return {
    ...session,
    lastActivityAt: now,
  };
}

/**
 * Check if session should show timeout warning
 * (Typically shown 2 minutes before timeout)
 */
export function shouldShowTimeoutWarning(
  session: Session,
  warningBeforeMs: number = 2 * 60 * 1000,
  config: SessionConfig = {}
): boolean {
  const inactivityTimeoutMs = config.inactivityTimeoutMs || DEFAULT_SESSION_TIMEOUT_MS;
  const now = new Date();
  const inactiveMs = now.getTime() - session.lastActivityAt.getTime();
  const timeUntilTimeout = inactivityTimeoutMs - inactiveMs;

  return timeUntilTimeout > 0 && timeUntilTimeout <= warningBeforeMs;
}

/**
 * Get remaining session time in milliseconds
 */
export function getRemainingSessionTime(
  session: Session,
  config: SessionConfig = {}
): number {
  const inactivityTimeoutMs = config.inactivityTimeoutMs || DEFAULT_SESSION_TIMEOUT_MS;
  const now = new Date();
  const inactiveMs = now.getTime() - session.lastActivityAt.getTime();
  return Math.max(0, inactivityTimeoutMs - inactiveMs);
}

/**
 * Hash a session token for storage
 * (Store hashed tokens in database, compare against hash)
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a session token against stored hash
 */
export function verifySessionToken(token: string, hash: string): boolean {
  const tokenHash = hashSessionToken(token);
  return crypto.timingSafeEqual(
    Buffer.from(tokenHash),
    Buffer.from(hash)
  );
}

/**
 * Parse session token from Authorization header
 */
export function parseAuthorizationHeader(header: string | undefined): string | null {
  if (!header) return null;

  // Support "Bearer <token>" format
  if (header.startsWith('Bearer ')) {
    return header.slice(7);
  }

  return header;
}

/**
 * Device fingerprint for session binding
 * (Helps detect session hijacking)
 */
export function createDeviceFingerprint(
  userAgent: string,
  ipAddress: string,
  additionalData?: Record<string, string>
): string {
  const data = [
    userAgent,
    ipAddress,
    ...Object.values(additionalData || {}),
  ].join('|');

  return crypto.createHash('sha256').update(data).digest('hex').slice(0, 32);
}

/**
 * Session timeout configurations for different contexts
 */
export const SESSION_PRESETS = {
  // Standard web session
  standard: {
    inactivityTimeoutMs: 15 * 60 * 1000, // 15 minutes
    absoluteTimeoutMs: 8 * 60 * 60 * 1000, // 8 hours
    extendOnActivity: true,
  },

  // High-security contexts (e.g., prescription access)
  highSecurity: {
    inactivityTimeoutMs: 5 * 60 * 1000, // 5 minutes
    absoluteTimeoutMs: 2 * 60 * 60 * 1000, // 2 hours
    extendOnActivity: true,
  },

  // Mobile app (can be more lenient with biometric re-auth)
  mobile: {
    inactivityTimeoutMs: 30 * 60 * 1000, // 30 minutes
    absoluteTimeoutMs: 24 * 60 * 60 * 1000, // 24 hours
    extendOnActivity: true,
  },

  // Kiosk/shared device
  kiosk: {
    inactivityTimeoutMs: 2 * 60 * 1000, // 2 minutes
    absoluteTimeoutMs: 15 * 60 * 1000, // 15 minutes
    extendOnActivity: false,
  },
} as const;
