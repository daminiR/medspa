/**
 * Authentication Routes
 *
 * Handles user authentication with Firebase Auth
 * Note: Most auth happens client-side with Firebase SDK
 * These endpoints handle custom claims and session management
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';

const auth = new Hono();

/**
 * Get current user profile and permissions
 * GET /api/auth/me
 */
auth.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');

  // In production, fetch additional user data from database
  return c.json({
    uid: user.uid,
    email: user.email,
    role: user.role,
    permissions: user.permissions || [],
    locationIds: user.locationIds || [],
    patientId: user.patientId,
  });
});

/**
 * Refresh user custom claims
 * POST /api/auth/refresh-claims
 *
 * Called after role/permission changes to update token claims
 */
auth.post('/refresh-claims', authMiddleware, async (c) => {
  const user = c.get('user');

  // TODO: Fetch updated claims from database and set in Firebase
  // const admin = await getFirebaseAdmin();
  // const userData = await db.query.users.findFirst({...});
  // await admin.auth().setCustomUserClaims(user.uid, {...});

  return c.json({
    message: 'Claims refreshed. Please re-authenticate to get updated token.',
  });
});

/**
 * Validate MFA token
 * POST /api/auth/verify-mfa
 */
const verifyMfaSchema = z.object({
  code: z.string().length(6).regex(/^\d+$/, 'Code must be 6 digits'),
});

auth.post('/verify-mfa', authMiddleware, zValidator('json', verifyMfaSchema), async (c) => {
  const user = c.get('user');
  const { code } = c.req.valid('json');

  // TODO: Implement MFA verification
  // const dbUser = await db.query.users.findFirst({...});
  // const isValid = verifyMFAToken(dbUser.mfaSecret, code);

  // Placeholder response
  return c.json({
    verified: true,
    message: 'MFA verification successful',
  });
});

/**
 * Setup MFA
 * POST /api/auth/setup-mfa
 */
auth.post('/setup-mfa', authMiddleware, async (c) => {
  const user = c.get('user');

  // TODO: Generate MFA secret and QR code
  // const { createMFASetup } = await import('@medical-spa/security');
  // const setup = createMFASetup(user.email || '');

  // Placeholder response
  return c.json({
    message: 'MFA setup endpoint - implement with createMFASetup()',
    // secret: setup.secret,
    // qrUrl: setup.qrUrl,
    // backupCodes: setup.backupCodes,
  });
});

/**
 * Patient registration endpoint
 * POST /api/auth/register
 *
 * Creates both Firebase user and patient record
 */
const registerSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string(),
  dateOfBirth: z.string(),
  password: z.string().min(8),
});

auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const data = c.req.valid('json');

  // TODO: Create Firebase user and patient record
  // 1. Create Firebase user with admin SDK
  // 2. Set custom claims (role: 'patient', patientId: xxx)
  // 3. Create patient record in database

  return c.json({
    message: 'Registration endpoint - implement with Firebase Admin SDK',
    // user: { uid, email },
    // patient: { id, ... },
  }, 201);
});

/**
 * Create staff user (admin only)
 * POST /api/auth/users
 */
const createUserSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.string(),
  locationIds: z.array(z.string().uuid()),
  primaryLocationId: z.string().uuid(),
  sendInvite: z.boolean().default(true),
});

auth.post('/users', authMiddleware, zValidator('json', createUserSchema), async (c) => {
  const user = c.get('user');

  // Check admin permission
  if (user.role !== 'admin' && user.role !== 'office_manager') {
    throw APIError.forbidden('Only admins can create users');
  }

  const data = c.req.valid('json');

  // TODO: Create user
  // 1. Create Firebase user
  // 2. Set custom claims
  // 3. Create user record in database
  // 4. Send invite email if requested

  return c.json({
    message: 'User creation endpoint - implement with Firebase Admin SDK',
    // user: { uid, email, role },
  }, 201);
});

export default auth;
