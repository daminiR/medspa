/**
 * Kiosk Authentication Routes
 *
 * Handles kiosk check-in with:
 * - QR code token generation
 * - Token validation
 * - Check-in processing
 * - Session polling for mobile-initiated check-in
 *
 * Token Expiry: 10 minutes
 * Nonce: One-time use (prevents replay attacks)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import crypto from 'crypto';
import { APIError } from '../middleware/error';
import { logAuditEvent } from '@medical-spa/security';

const kioskAuth = new Hono();

// ===================
// Validation Schemas
// ===================

const generateQRSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
});

const validateTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

const checkInSchema = z.object({
  token: z.string().optional(),
  appointmentId: z.string().optional(),
}).refine(data => data.token || data.appointmentId, {
  message: 'Either token or appointmentId is required',
});

const createSessionSchema = z.object({
  kioskId: z.string().min(1, 'Kiosk ID is required'),
});

const pollSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

const confirmCheckInSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  patientId: z.string().min(1, 'Patient ID is required'),
  appointmentId: z.string().min(1, 'Appointment ID is required'),
});

// ===================
// In-Memory Storage (Replace with Redis in production)
// ===================

interface KioskToken {
  jti: string;           // Unique token ID (nonce)
  appointmentId: string;
  createdAt: Date;
  expiresAt: Date;
  usedAt: Date | null;
  kioskId?: string;
}

interface KioskSession {
  id: string;
  kioskId: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'pending' | 'confirmed' | 'expired';
  appointmentId?: string;
  patientId?: string;
  patientName?: string;
  serviceName?: string;
  confirmedAt?: Date;
}

interface MockAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  serviceName: string;
  practitionerName: string;
  scheduledTime: Date;
  status: 'scheduled' | 'confirmed' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  checkedInAt?: Date;
  queuePosition?: number;
}

// Storage maps
const kioskTokens = new Map<string, KioskToken>();
const usedNonces = new Set<string>();
const kioskSessions = new Map<string, KioskSession>();
const mockAppointments = new Map<string, MockAppointment>();

// Rate limiting
const tokenRateLimits = new Map<string, { count: number; resetAt: Date }>();

// Constants
const TOKEN_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const SESSION_EXPIRY_MS = 60 * 1000; // 60 seconds for polling sessions
const SESSION_POLL_EXPIRY_MS = 90 * 1000; // 90 seconds total for session
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_TOKENS = 10; // Max 10 QR generations per minute per appointment

// Initialize with some mock appointments for testing
function initMockData() {
  if (mockAppointments.size === 0) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Add some test appointments for today
    const testAppointments: MockAppointment[] = [
      {
        id: 'apt-001',
        patientId: 'pat-001',
        patientName: 'Sarah Johnson',
        patientPhone: '5551234567',
        serviceName: 'Botox Treatment',
        practitionerName: 'Dr. Emily Chen',
        scheduledTime: new Date(today.getTime() + 10 * 60 * 60 * 1000), // 10 AM
        status: 'confirmed',
      },
      {
        id: 'apt-002',
        patientId: 'pat-002',
        patientName: 'Michael Davis',
        patientPhone: '5559876543',
        serviceName: 'Dermal Fillers',
        practitionerName: 'Dr. James Wilson',
        scheduledTime: new Date(today.getTime() + 11 * 60 * 60 * 1000), // 11 AM
        status: 'confirmed',
      },
      {
        id: 'apt-003',
        patientId: 'pat-003',
        patientName: 'Emma Thompson',
        patientPhone: '5555551234',
        serviceName: 'Chemical Peel',
        practitionerName: 'Dr. Emily Chen',
        scheduledTime: new Date(today.getTime() + 14 * 60 * 60 * 1000), // 2 PM
        status: 'scheduled',
      },
    ];

    for (const apt of testAppointments) {
      mockAppointments.set(apt.id, apt);
    }
  }
}

// Initialize mock data
initMockData();

// ===================
// Helper Functions
// ===================

function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generateSessionId(): string {
  return `kiosk-session-${crypto.randomUUID()}`;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

function checkRateLimit(key: string, maxAttempts: number): boolean {
  const now = new Date();
  const limit = tokenRateLimits.get(key);

  if (!limit || now > limit.resetAt) {
    tokenRateLimits.set(key, { count: 1, resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_MS) });
    return true;
  }

  if (limit.count >= maxAttempts) {
    return false;
  }

  limit.count++;
  return true;
}

function isToday(date: Date): boolean {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
}

function getQueuePosition(appointmentId: string): number {
  // Count how many arrived patients are ahead
  let position = 1;
  const targetAppointment = mockAppointments.get(appointmentId);
  if (!targetAppointment) return position;

  for (const apt of mockAppointments.values()) {
    if (apt.id !== appointmentId &&
        apt.status === 'arrived' &&
        apt.checkedInAt &&
        targetAppointment.checkedInAt &&
        apt.checkedInAt < targetAppointment.checkedInAt) {
      position++;
    }
  }
  return position;
}

// ===================
// QR Code Token Endpoints
// ===================

/**
 * Generate QR Token
 * POST /api/kiosk/generate-qr
 *
 * Generates a signed token for kiosk check-in via QR code
 */
kioskAuth.post('/generate-qr', zValidator('json', generateQRSchema), async (c) => {
  const { appointmentId } = c.req.valid('json');
  const ipAddress = getClientIP(c);

  // Rate limiting
  if (!checkRateLimit(appointmentId, RATE_LIMIT_MAX_TOKENS)) {
    throw APIError.tooManyRequests('Too many QR code requests. Please wait a moment.');
  }

  // Find appointment
  const appointment = mockAppointments.get(appointmentId);
  if (!appointment) {
    throw APIError.notFound('Appointment');
  }

  // Check if appointment is today
  if (!isToday(appointment.scheduledTime)) {
    throw APIError.badRequest('QR codes can only be generated for today\'s appointments.');
  }

  // Check appointment status
  if (appointment.status === 'cancelled') {
    throw APIError.badRequest('Cannot check in to a cancelled appointment.');
  }

  if (appointment.status === 'completed') {
    throw APIError.badRequest('This appointment has already been completed.');
  }

  if (appointment.status === 'arrived') {
    throw APIError.badRequest('You have already checked in for this appointment.');
  }

  // Generate token with nonce
  const nonce = generateNonce();
  const token = generateToken();
  const tokenHash = hashToken(token);

  // Store token
  const kioskToken: KioskToken = {
    jti: nonce,
    appointmentId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
    usedAt: null,
  };
  kioskTokens.set(tokenHash, kioskToken);

  // Generate check-in URL
  const baseUrl = process.env.APP_URL || 'http://localhost:3000';
  const checkInUrl = `${baseUrl}/check-in/${token}`;

  // Log event
  await logAuditEvent({
    action: 'CREATE',
    resourceType: 'kiosk_qr_token',
    resourceId: appointmentId,
    ipAddress,
    metadata: { nonce, appointmentId },
  });

  return c.json({
    success: true,
    token,
    checkInUrl,
    expiresAt: kioskToken.expiresAt.toISOString(),
    expiresIn: Math.floor(TOKEN_EXPIRY_MS / 1000), // seconds
    appointment: {
      id: appointment.id,
      patientName: appointment.patientName,
      serviceName: appointment.serviceName,
      practitionerName: appointment.practitionerName,
      scheduledTime: appointment.scheduledTime.toISOString(),
    },
  });
});

/**
 * Validate QR Token
 * POST /api/kiosk/validate-token
 *
 * Validates a QR code token without using it
 */
kioskAuth.post('/validate-token', zValidator('json', validateTokenSchema), async (c) => {
  const { token } = c.req.valid('json');
  const ipAddress = getClientIP(c);

  const tokenHash = hashToken(token);
  const storedToken = kioskTokens.get(tokenHash);

  if (!storedToken) {
    await logAuditEvent({
      action: 'ACCESS_DENIED',
      resourceType: 'kiosk_qr_token',
      ipAddress,
      metadata: { reason: 'token_not_found' },
    });
    throw APIError.unauthorized('Invalid or expired QR code. Please request a new one.');
  }

  // Check if already used
  if (storedToken.usedAt) {
    throw APIError.unauthorized('This QR code has already been used.');
  }

  // Check if expired
  if (new Date() > storedToken.expiresAt) {
    kioskTokens.delete(tokenHash);
    throw APIError.unauthorized('This QR code has expired. Please request a new one.');
  }

  // Check if nonce was used (replay attack prevention)
  if (usedNonces.has(storedToken.jti)) {
    throw APIError.unauthorized('This QR code has already been used.');
  }

  // Find appointment
  const appointment = mockAppointments.get(storedToken.appointmentId);
  if (!appointment) {
    throw APIError.notFound('Appointment');
  }

  return c.json({
    valid: true,
    appointment: {
      id: appointment.id,
      patientName: appointment.patientName,
      serviceName: appointment.serviceName,
      practitionerName: appointment.practitionerName,
      scheduledTime: appointment.scheduledTime.toISOString(),
      status: appointment.status,
    },
    expiresAt: storedToken.expiresAt.toISOString(),
  });
});

/**
 * Check In with Token or Appointment ID
 * POST /api/kiosk/check-in
 *
 * Processes check-in using QR token or direct appointment ID
 */
kioskAuth.post('/check-in', zValidator('json', checkInSchema), async (c) => {
  const { token, appointmentId: directAppointmentId } = c.req.valid('json');
  const ipAddress = getClientIP(c);

  let appointmentId: string;

  if (token) {
    // Token-based check-in
    const tokenHash = hashToken(token);
    const storedToken = kioskTokens.get(tokenHash);

    if (!storedToken) {
      throw APIError.unauthorized('Invalid or expired QR code.');
    }

    if (storedToken.usedAt) {
      throw APIError.unauthorized('This QR code has already been used.');
    }

    if (new Date() > storedToken.expiresAt) {
      kioskTokens.delete(tokenHash);
      throw APIError.unauthorized('This QR code has expired.');
    }

    if (usedNonces.has(storedToken.jti)) {
      throw APIError.unauthorized('This QR code has already been used.');
    }

    // Mark as used
    storedToken.usedAt = new Date();
    usedNonces.add(storedToken.jti);

    // Clean up old nonces periodically (in production, use Redis TTL)
    if (usedNonces.size > 10000) {
      const oldNonces = Array.from(usedNonces).slice(0, 5000);
      for (const nonce of oldNonces) {
        usedNonces.delete(nonce);
      }
    }

    appointmentId = storedToken.appointmentId;
  } else if (directAppointmentId) {
    appointmentId = directAppointmentId;
  } else {
    throw APIError.badRequest('Either token or appointmentId is required.');
  }

  // Find appointment
  const appointment = mockAppointments.get(appointmentId);
  if (!appointment) {
    throw APIError.notFound('Appointment');
  }

  // Check if already checked in
  if (appointment.status === 'arrived') {
    const queuePosition = getQueuePosition(appointmentId);
    return c.json({
      success: true,
      alreadyCheckedIn: true,
      message: 'You have already checked in.',
      appointment: {
        id: appointment.id,
        patientName: appointment.patientName,
        serviceName: appointment.serviceName,
        practitionerName: appointment.practitionerName,
        scheduledTime: appointment.scheduledTime.toISOString(),
        status: appointment.status,
        checkedInAt: appointment.checkedInAt?.toISOString(),
      },
      queuePosition,
      estimatedWaitMinutes: queuePosition * 15, // ~15 min per person
    });
  }

  // Check appointment status
  if (appointment.status === 'cancelled') {
    throw APIError.badRequest('This appointment has been cancelled.');
  }

  if (appointment.status === 'completed') {
    throw APIError.badRequest('This appointment has already been completed.');
  }

  // Update appointment status
  appointment.status = 'arrived';
  appointment.checkedInAt = new Date();

  const queuePosition = getQueuePosition(appointmentId);
  appointment.queuePosition = queuePosition;

  // Log event
  await logAuditEvent({
    userId: appointment.patientId,
    action: 'UPDATE',
    resourceType: 'appointment',
    resourceId: appointmentId,
    ipAddress,
    metadata: {
      action: 'check_in',
      method: token ? 'qr_code' : 'direct',
      queuePosition,
    },
  });

  return c.json({
    success: true,
    message: 'Successfully checked in!',
    appointment: {
      id: appointment.id,
      patientName: appointment.patientName,
      serviceName: appointment.serviceName,
      practitionerName: appointment.practitionerName,
      scheduledTime: appointment.scheduledTime.toISOString(),
      status: appointment.status,
      checkedInAt: appointment.checkedInAt.toISOString(),
    },
    queuePosition,
    estimatedWaitMinutes: queuePosition * 15,
  });
});

// ===================
// Kiosk Session Endpoints (for mobile-initiated check-in)
// ===================

/**
 * Create Kiosk Session
 * POST /api/kiosk/session/create
 *
 * Creates a session that the kiosk displays as QR for patient to scan
 */
kioskAuth.post('/session/create', zValidator('json', createSessionSchema), async (c) => {
  const { kioskId } = c.req.valid('json');
  const ipAddress = getClientIP(c);

  const sessionId = generateSessionId();

  const session: KioskSession = {
    id: sessionId,
    kioskId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + SESSION_POLL_EXPIRY_MS),
    status: 'pending',
  };

  kioskSessions.set(sessionId, session);

  // Generate QR URL for patient to scan
  const baseUrl = process.env.PATIENT_PORTAL_URL || 'http://localhost:3002';
  const sessionUrl = `${baseUrl}/check-in/session/${sessionId}`;

  await logAuditEvent({
    action: 'CREATE',
    resourceType: 'kiosk_session',
    resourceId: sessionId,
    ipAddress,
    metadata: { kioskId },
  });

  return c.json({
    success: true,
    sessionId,
    sessionUrl,
    expiresAt: session.expiresAt.toISOString(),
    expiresIn: Math.floor(SESSION_POLL_EXPIRY_MS / 1000),
  });
});

/**
 * Poll Session Status
 * GET /api/kiosk/session/:sessionId
 *
 * Kiosk polls this to check if patient confirmed check-in
 */
kioskAuth.get('/session/:sessionId', async (c) => {
  const sessionId = c.req.param('sessionId');

  const session = kioskSessions.get(sessionId);

  if (!session) {
    throw APIError.notFound('Session');
  }

  // Check if expired
  if (new Date() > session.expiresAt) {
    session.status = 'expired';
    kioskSessions.delete(sessionId);
    return c.json({
      success: true,
      status: 'expired',
      message: 'Session has expired.',
    });
  }

  if (session.status === 'confirmed') {
    // Clean up session after retrieval
    kioskSessions.delete(sessionId);

    return c.json({
      success: true,
      status: 'confirmed',
      appointmentId: session.appointmentId,
      patientId: session.patientId,
      patientName: session.patientName,
      serviceName: session.serviceName,
      confirmedAt: session.confirmedAt?.toISOString(),
    });
  }

  return c.json({
    success: true,
    status: session.status,
    expiresAt: session.expiresAt.toISOString(),
    remainingSeconds: Math.max(0, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000)),
  });
});

/**
 * Confirm Session Check-In
 * POST /api/kiosk/session/confirm
 *
 * Patient confirms check-in via their mobile device
 */
kioskAuth.post('/session/confirm', zValidator('json', confirmCheckInSchema), async (c) => {
  const { sessionId, patientId, appointmentId } = c.req.valid('json');
  const ipAddress = getClientIP(c);

  const session = kioskSessions.get(sessionId);

  if (!session) {
    throw APIError.notFound('Session');
  }

  if (session.status === 'expired' || new Date() > session.expiresAt) {
    throw APIError.badRequest('Session has expired.');
  }

  if (session.status === 'confirmed') {
    throw APIError.badRequest('Session already confirmed.');
  }

  // Find appointment
  const appointment = mockAppointments.get(appointmentId);
  if (!appointment) {
    throw APIError.notFound('Appointment');
  }

  // Verify patient matches
  if (appointment.patientId !== patientId) {
    throw APIError.forbidden('Appointment does not belong to this patient.');
  }

  // Update session
  session.status = 'confirmed';
  session.appointmentId = appointmentId;
  session.patientId = patientId;
  session.patientName = appointment.patientName;
  session.serviceName = appointment.serviceName;
  session.confirmedAt = new Date();

  // Update appointment
  appointment.status = 'arrived';
  appointment.checkedInAt = new Date();
  const queuePosition = getQueuePosition(appointmentId);
  appointment.queuePosition = queuePosition;

  await logAuditEvent({
    userId: patientId,
    action: 'UPDATE',
    resourceType: 'appointment',
    resourceId: appointmentId,
    ipAddress,
    metadata: {
      action: 'check_in',
      method: 'mobile_session',
      sessionId,
      queuePosition,
    },
  });

  return c.json({
    success: true,
    message: 'Check-in confirmed!',
    appointment: {
      id: appointment.id,
      patientName: appointment.patientName,
      serviceName: appointment.serviceName,
      scheduledTime: appointment.scheduledTime.toISOString(),
      status: appointment.status,
      checkedInAt: appointment.checkedInAt.toISOString(),
    },
    queuePosition,
    estimatedWaitMinutes: queuePosition * 15,
  });
});

// ===================
// Admin/Testing Endpoints
// ===================

/**
 * List Mock Appointments
 * GET /api/kiosk/appointments
 *
 * Returns today's appointments (for testing)
 */
kioskAuth.get('/appointments', async (c) => {
  const today: MockAppointment[] = [];

  for (const apt of mockAppointments.values()) {
    if (isToday(apt.scheduledTime)) {
      today.push(apt);
    }
  }

  // Sort by scheduled time
  today.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());

  return c.json({
    success: true,
    appointments: today.map(apt => ({
      id: apt.id,
      patientName: apt.patientName,
      serviceName: apt.serviceName,
      practitionerName: apt.practitionerName,
      scheduledTime: apt.scheduledTime.toISOString(),
      status: apt.status,
      checkedInAt: apt.checkedInAt?.toISOString(),
      queuePosition: apt.queuePosition,
    })),
    count: today.length,
  });
});

// Export for testing
export function clearStores() {
  kioskTokens.clear();
  usedNonces.clear();
  kioskSessions.clear();
  tokenRateLimits.clear();
  // Reinitialize mock data
  mockAppointments.clear();
  initMockData();
}

export function addMockAppointment(appointment: MockAppointment) {
  mockAppointments.set(appointment.id, appointment);
}

export default kioskAuth;
