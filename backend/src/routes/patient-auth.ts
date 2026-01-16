/**
 * Patient Authentication Routes
 *
 * Handles patient authentication with:
 * - Magic link (passwordless email)
 * - SMS OTP verification
 * - Patient registration
 * - Session management
 *
 * Session Duration: 30-day with 15-min PHI timeout
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import crypto from 'crypto';
import { sessionAuthMiddleware, sessionStore } from '../middleware/auth';
import { APIError } from '../middleware/error';
import {
  createSession,
  hashSessionToken,
  SESSION_PRESETS,
} from '@medical-spa/security';
import { logLogin, logLogout, logAuditEvent } from '@medical-spa/security';
import { sendMagicLinkEmail } from '../lib/email';
import { sendOTPCode } from '../lib/sms';

const patientAuth = new Hono();

// ===================
// Validation Schemas
// ===================

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const magicLinkVerifySchema = z.object({
  token: z.string().min(1, 'Token is required'),
  email: z.string().email('Invalid email address'),
});

const phoneSchema = z.object({
  phone: z.string().min(10, 'Invalid phone number'),
});

const otpVerifySchema = z.object({
  phone: z.string().min(10, 'Invalid phone number'),
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must be digits only'),
});

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Invalid phone number'),
  dateOfBirth: z.string(), // ISO date string
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ===================
// In-Memory Storage (Replace with database in production)
// ===================

interface MagicLinkToken {
  email: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

interface OTPCode {
  phone: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

interface PatientSession {
  id: string;
  token: string;
  patientId: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  expiresAt: Date;
  lastActivityAt: Date;
  refreshToken: string;
  refreshTokenHash: string;
}

// Mock patient database
interface MockPatient {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  createdAt: Date;
}

const magicLinkTokens = new Map<string, MagicLinkToken>();
const otpCodes = new Map<string, OTPCode>();
const patientSessions = new Map<string, PatientSession>();
const mockPatients = new Map<string, MockPatient>();

// Rate limiting maps
const emailRateLimits = new Map<string, { count: number; resetAt: Date }>();
const phoneRateLimits = new Map<string, { count: number; resetAt: Date }>();

// Constants
const MAGIC_LINK_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const OTP_MAX_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_EMAILS = 3;
const RATE_LIMIT_MAX_SMS = 3;

// ===================
// Helper Functions
// ===================

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

function checkRateLimit(
  map: Map<string, { count: number; resetAt: Date }>,
  key: string,
  maxAttempts: number
): boolean {
  const now = new Date();
  const limit = map.get(key);

  if (!limit || now > limit.resetAt) {
    map.set(key, { count: 1, resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_MS) });
    return true;
  }

  if (limit.count >= maxAttempts) {
    return false;
  }

  limit.count++;
  return true;
}

function findOrCreatePatient(email: string, firstName?: string, lastName?: string, phone?: string): MockPatient {
  // Find by email
  for (const patient of mockPatients.values()) {
    if (patient.email.toLowerCase() === email.toLowerCase()) {
      return patient;
    }
  }

  // Create new patient
  const patient: MockPatient = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    phone,
    firstName: firstName || 'Patient',
    lastName: lastName || '',
    createdAt: new Date(),
  };
  mockPatients.set(patient.id, patient);
  return patient;
}

function findPatientByPhone(phone: string): MockPatient | undefined {
  const normalizedPhone = phone.replace(/\D/g, '');
  for (const patient of mockPatients.values()) {
    if (patient.phone?.replace(/\D/g, '') === normalizedPhone) {
      return patient;
    }
  }
  return undefined;
}

// ===================
// Magic Link Endpoints
// ===================

/**
 * Send Magic Link
 * POST /api/auth/patient/magic-link/send
 */
patientAuth.post('/magic-link/send', zValidator('json', emailSchema), async (c) => {
  const { email } = c.req.valid('json');
  const ipAddress = getClientIP(c);

  // Rate limiting
  if (!checkRateLimit(emailRateLimits, email.toLowerCase(), RATE_LIMIT_MAX_EMAILS)) {
    throw APIError.tooManyRequests('Too many requests. Please try again in an hour.');
  }

  // Check if patient exists
  let isNewUser = true;
  for (const patient of mockPatients.values()) {
    if (patient.email.toLowerCase() === email.toLowerCase()) {
      isNewUser = false;
      break;
    }
  }

  // Generate token
  const token = generateToken();
  const tokenHash = hashToken(token);

  // Store token
  magicLinkTokens.set(tokenHash, {
    email: email.toLowerCase(),
    tokenHash,
    expiresAt: new Date(Date.now() + MAGIC_LINK_EXPIRY_MS),
    usedAt: null,
    createdAt: new Date(),
  });

  // Send email
  try {
    await sendMagicLinkEmail(email, token, isNewUser);
  } catch (error) {
    console.error('Failed to send magic link email:', error);
    throw APIError.internal('Failed to send email. Please try again.');
  }

  // Log event
  await logAuditEvent({
    action: 'CREATE',
    resourceType: 'magic_link',
    ipAddress,
    metadata: { email, isNewUser },
  });

  return c.json({
    success: true,
    message: 'Check your email for the sign-in link.',
    isNewUser,
  });
});

/**
 * Verify Magic Link
 * POST /api/auth/patient/magic-link/verify
 */
patientAuth.post('/magic-link/verify', zValidator('json', magicLinkVerifySchema), async (c) => {
  const { token, email } = c.req.valid('json');
  const ipAddress = getClientIP(c);
  const userAgent = c.req.header('user-agent') || '';

  // Hash the token to find it
  const tokenHash = hashToken(token);
  const storedToken = magicLinkTokens.get(tokenHash);

  if (!storedToken) {
    await logLogin(email, false, ipAddress, userAgent, 'Invalid magic link token');
    throw APIError.unauthorized('Invalid or expired link. Please request a new one.');
  }

  // Check if already used
  if (storedToken.usedAt) {
    throw APIError.unauthorized('This link has already been used. Please request a new one.');
  }

  // Check if expired
  if (new Date() > storedToken.expiresAt) {
    magicLinkTokens.delete(tokenHash);
    throw APIError.unauthorized('This link has expired. Please request a new one.');
  }

  // Check email matches
  if (storedToken.email !== email.toLowerCase()) {
    throw APIError.unauthorized('Invalid link. Please request a new one.');
  }

  // Mark as used
  storedToken.usedAt = new Date();

  // Find or create patient
  const patient = findOrCreatePatient(email);
  const isNewUser = patient.createdAt.getTime() > Date.now() - 5000; // Created in last 5 seconds

  // Create session with mobile preset (30-min inactivity, 24hr absolute)
  const session = createSession(patient.id, {
    ipAddress,
    userAgent,
    config: SESSION_PRESETS.mobile,
  });

  // Generate refresh token
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashSessionToken(refreshToken);

  // Store session
  const patientSession: PatientSession = {
    id: session.id,
    token: session.token,
    patientId: patient.id,
    email: patient.email,
    firstName: patient.firstName,
    lastName: patient.lastName,
    expiresAt: session.expiresAt,
    lastActivityAt: session.lastActivityAt,
    refreshToken,
    refreshTokenHash,
  };
  patientSessions.set(session.id, patientSession);

  // Also store in shared sessionStore for middleware
  sessionStore.set(session.id, {
    id: session.id,
    token: session.token,
    userId: patient.id,
    email: patient.email,
    role: 'patient',
    permissions: ['patient:self'],
    locationIds: [],
    expiresAt: session.expiresAt,
    lastActivityAt: session.lastActivityAt,
  });

  // Log successful login
  await logLogin(patient.id, true, ipAddress, userAgent);

  return c.json({
    success: true,
    user: {
      id: patient.id,
      email: patient.email,
      firstName: patient.firstName,
      lastName: patient.lastName,
    },
    session: {
      id: session.id,
      expiresAt: session.expiresAt.toISOString(),
    },
    accessToken: session.token,
    refreshToken,
    isNewUser,
    expiresIn: 24 * 60 * 60, // 24 hours
  });
});

// ===================
// SMS OTP Endpoints
// ===================

/**
 * Send OTP Code
 * POST /api/auth/patient/sms-otp/send
 */
patientAuth.post('/sms-otp/send', zValidator('json', phoneSchema), async (c) => {
  const { phone } = c.req.valid('json');
  const ipAddress = getClientIP(c);
  const normalizedPhone = phone.replace(/\D/g, '');

  // Rate limiting
  if (!checkRateLimit(phoneRateLimits, normalizedPhone, RATE_LIMIT_MAX_SMS)) {
    throw APIError.tooManyRequests('Too many requests. Please try again in an hour.');
  }

  // Generate OTP
  const code = generateOTP();
  const codeHash = hashToken(code);

  // Store OTP
  otpCodes.set(normalizedPhone, {
    phone: normalizedPhone,
    codeHash,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    attempts: 0,
    createdAt: new Date(),
  });

  // Send SMS
  try {
    await sendOTPCode(phone, code);
  } catch (error) {
    console.error('Failed to send OTP SMS:', error);
    throw APIError.internal('Failed to send verification code. Please try again.');
  }

  // Log event
  await logAuditEvent({
    action: 'CREATE',
    resourceType: 'sms_otp',
    ipAddress,
    metadata: { phone: normalizedPhone },
  });

  return c.json({
    success: true,
    message: 'Verification code sent to your phone.',
  });
});

/**
 * Verify OTP Code
 * POST /api/auth/patient/sms-otp/verify
 */
patientAuth.post('/sms-otp/verify', zValidator('json', otpVerifySchema), async (c) => {
  const { phone, code } = c.req.valid('json');
  const ipAddress = getClientIP(c);
  const userAgent = c.req.header('user-agent') || '';
  const normalizedPhone = phone.replace(/\D/g, '');

  const storedOTP = otpCodes.get(normalizedPhone);

  if (!storedOTP) {
    throw APIError.unauthorized('No verification code found. Please request a new one.');
  }

  // Check if expired
  if (new Date() > storedOTP.expiresAt) {
    otpCodes.delete(normalizedPhone);
    throw APIError.unauthorized('Verification code expired. Please request a new one.');
  }

  // Check attempts
  if (storedOTP.attempts >= OTP_MAX_ATTEMPTS) {
    otpCodes.delete(normalizedPhone);
    throw APIError.tooManyRequests('Too many failed attempts. Please request a new code.');
  }

  // Verify code
  const codeHash = hashToken(code);
  if (codeHash !== storedOTP.codeHash) {
    storedOTP.attempts++;
    const remaining = OTP_MAX_ATTEMPTS - storedOTP.attempts;

    await logAuditEvent({
      action: 'ACCESS_DENIED',
      resourceType: 'sms_otp',
      ipAddress,
      metadata: { phone: normalizedPhone, reason: 'invalid_code', attemptsRemaining: remaining },
    });

    throw APIError.unauthorized(`Invalid code. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`);
  }

  // Code is valid - delete it
  otpCodes.delete(normalizedPhone);

  // Find or create patient by phone
  let patient = findPatientByPhone(normalizedPhone);
  const isNewUser = !patient;

  if (!patient) {
    patient = {
      id: crypto.randomUUID(),
      email: `${normalizedPhone}@phone.luxemedspa.com`, // Placeholder email
      phone: normalizedPhone,
      firstName: 'Patient',
      lastName: '',
      createdAt: new Date(),
    };
    mockPatients.set(patient.id, patient);
  }

  // Create session
  const session = createSession(patient.id, {
    ipAddress,
    userAgent,
    config: SESSION_PRESETS.mobile,
  });

  // Generate refresh token
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashSessionToken(refreshToken);

  // Store session
  const patientSession: PatientSession = {
    id: session.id,
    token: session.token,
    patientId: patient.id,
    email: patient.email,
    phone: patient.phone,
    firstName: patient.firstName,
    lastName: patient.lastName,
    expiresAt: session.expiresAt,
    lastActivityAt: session.lastActivityAt,
    refreshToken,
    refreshTokenHash,
  };
  patientSessions.set(session.id, patientSession);

  // Store in shared sessionStore
  sessionStore.set(session.id, {
    id: session.id,
    token: session.token,
    userId: patient.id,
    email: patient.email,
    role: 'patient',
    permissions: ['patient:self'],
    locationIds: [],
    expiresAt: session.expiresAt,
    lastActivityAt: session.lastActivityAt,
  });

  // Log login
  await logLogin(patient.id, true, ipAddress, userAgent);

  return c.json({
    success: true,
    user: {
      id: patient.id,
      email: patient.email,
      phone: patient.phone,
      firstName: patient.firstName,
      lastName: patient.lastName,
    },
    session: {
      id: session.id,
      expiresAt: session.expiresAt.toISOString(),
    },
    accessToken: session.token,
    refreshToken,
    isNewUser,
    expiresIn: 24 * 60 * 60,
  });
});

// ===================
// Patient Registration
// ===================

/**
 * Register Patient
 * POST /api/auth/patient/register
 */
patientAuth.post('/register', zValidator('json', registerSchema), async (c) => {
  const { firstName, lastName, email, phone, dateOfBirth } = c.req.valid('json');
  const ipAddress = getClientIP(c);

  // Check if patient exists
  for (const patient of mockPatients.values()) {
    if (patient.email.toLowerCase() === email.toLowerCase()) {
      throw APIError.conflict('An account with this email already exists. Please sign in.');
    }
  }

  // Create patient
  const patient: MockPatient = {
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    phone: phone.replace(/\D/g, ''),
    firstName,
    lastName,
    dateOfBirth,
    createdAt: new Date(),
  };
  mockPatients.set(patient.id, patient);

  // Send verification magic link
  const token = generateToken();
  const tokenHash = hashToken(token);

  magicLinkTokens.set(tokenHash, {
    email: email.toLowerCase(),
    tokenHash,
    expiresAt: new Date(Date.now() + MAGIC_LINK_EXPIRY_MS),
    usedAt: null,
    createdAt: new Date(),
  });

  try {
    await sendMagicLinkEmail(email, token, true);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Don't fail registration, just warn
  }

  // Log event
  await logAuditEvent({
    userId: patient.id,
    action: 'CREATE',
    resourceType: 'patient',
    ipAddress,
    metadata: { email, isRegistration: true },
  });

  return c.json({
    success: true,
    message: 'Account created! Check your email to verify your account.',
    user: {
      id: patient.id,
      email: patient.email,
      firstName: patient.firstName,
      lastName: patient.lastName,
    },
  }, 201);
});

// ===================
// Session Management
// ===================

/**
 * Refresh Token
 * POST /api/auth/patient/refresh
 */
patientAuth.post('/refresh', zValidator('json', refreshSchema), async (c) => {
  const { refreshToken } = c.req.valid('json');
  const ipAddress = getClientIP(c);
  const userAgent = c.req.header('user-agent') || '';

  // Find session by refresh token
  const refreshTokenHash = hashSessionToken(refreshToken);
  let foundSession: PatientSession | undefined;

  for (const [sessionId, session] of patientSessions) {
    if (session.refreshTokenHash === refreshTokenHash) {
      foundSession = session;
      break;
    }
  }

  if (!foundSession) {
    throw APIError.unauthorized('Invalid refresh token');
  }

  // Check if expired
  if (new Date() > foundSession.expiresAt) {
    patientSessions.delete(foundSession.id);
    sessionStore.delete(foundSession.id);
    throw APIError.unauthorized('Session expired. Please sign in again.');
  }

  // Rotate refresh token
  const newRefreshToken = generateRefreshToken();
  const newRefreshTokenHash = hashSessionToken(newRefreshToken);

  // Create new session
  const newSession = createSession(foundSession.patientId, {
    ipAddress,
    userAgent,
    config: SESSION_PRESETS.mobile,
  });

  // Update session
  const updatedSession: PatientSession = {
    ...foundSession,
    id: newSession.id,
    token: newSession.token,
    expiresAt: newSession.expiresAt,
    lastActivityAt: newSession.lastActivityAt,
    refreshToken: newRefreshToken,
    refreshTokenHash: newRefreshTokenHash,
  };

  // Delete old, store new
  patientSessions.delete(foundSession.id);
  sessionStore.delete(foundSession.id);
  patientSessions.set(newSession.id, updatedSession);
  sessionStore.set(newSession.id, {
    id: newSession.id,
    token: newSession.token,
    userId: foundSession.patientId,
    email: foundSession.email,
    role: 'patient',
    permissions: ['patient:self'],
    locationIds: [],
    expiresAt: newSession.expiresAt,
    lastActivityAt: newSession.lastActivityAt,
  });

  return c.json({
    session: {
      id: newSession.id,
      expiresAt: newSession.expiresAt.toISOString(),
    },
    accessToken: newSession.token,
    refreshToken: newRefreshToken,
    expiresIn: 24 * 60 * 60,
  });
});

/**
 * Get Current User
 * GET /api/auth/patient/me
 */
patientAuth.get('/me', sessionAuthMiddleware, async (c) => {
  const user = c.get('user');

  // Find patient details
  const patient = mockPatients.get(user.uid);

  if (!patient) {
    throw APIError.notFound('Patient');
  }

  return c.json({
    user: {
      id: patient.id,
      email: patient.email,
      phone: patient.phone,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      createdAt: patient.createdAt.toISOString(),
    },
  });
});

/**
 * Logout
 * POST /api/auth/patient/logout
 */
patientAuth.post('/logout', sessionAuthMiddleware, async (c) => {
  const user = c.get('user');
  const ipAddress = getClientIP(c);
  const authHeader = c.req.header('authorization');
  const token = authHeader?.replace('Bearer ', '');

  // Find and delete session
  if (token) {
    for (const [sessionId, session] of patientSessions) {
      if (session.token === token) {
        patientSessions.delete(sessionId);
        sessionStore.delete(sessionId);
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

// Export for testing
export function clearStores() {
  magicLinkTokens.clear();
  otpCodes.clear();
  patientSessions.clear();
  mockPatients.clear();
  emailRateLimits.clear();
  phoneRateLimits.clear();
}

export default patientAuth;
