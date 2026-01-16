/**
 * Express Booking API Routes
 *
 * Enables quick patient booking via unique token links:
 * - Token generation with patient context and constraints
 * - Token validation (public)
 * - Availability lookup with token constraints
 * - Booking creation with token
 * - Token management (list, revoke)
 *
 * Security:
 * - Tokens are cryptographically secure (32 bytes)
 * - Token hashing before storage (SHA-256)
 * - Rate limiting on validation
 * - Expiration enforcement
 * - Single-use by default (configurable)
 * - Audit logging
 * - Automatic cleanup of expired tokens
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { randomBytes, createHash } from 'crypto';
import { authMiddleware, optionalAuthMiddleware, requirePermission } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { handlePrismaError } from '../middleware/prisma-error-handler';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { ExpressBookingStatus } from '@prisma/client';

const expressBooking = new Hono();

// ===================
// Types
// ===================

export interface ExpressBookingRequest {
  tokenId: string;
  patientId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  startTime: Date;
  duration: number;
  notes?: string;
}

// ===================
// Validation Schemas
// ===================

const uuidSchema = z.string().min(1);

const dayOfWeekSchema = z.enum([
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
]);

const createTokenSchema = z.object({
  // Patient context
  patientId: uuidSchema.optional(),
  patientName: z.string().min(1).max(100).optional(),
  patientEmail: z.string().email().optional(),
  patientPhone: z.string().min(10).max(20).optional(),

  // Booking constraints
  serviceIds: z.array(uuidSchema).optional(),
  providerIds: z.array(uuidSchema).optional(),
  locationId: uuidSchema.optional(),

  // Date constraints
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  allowedDays: z.array(dayOfWeekSchema).optional(),

  // Usage
  maxUses: z.coerce.number().int().min(1).max(100).default(1),

  // Customization
  message: z.string().max(500).optional(),
  redirectUrl: z.string().url().optional(),

  // Deposit settings
  requireDeposit: z.boolean().optional(),
  depositAmount: z.coerce.number().min(0).optional(),

  // Expiration (hours from now, default 48)
  expiresInHours: z.coerce.number().min(1).max(720).default(48),
});

const tokenParamSchema = z.object({
  token: z.string().min(1),
});

const availabilityQuerySchema = z.object({
  token: z.string().min(1),
  date: z.string(), // YYYY-MM-DD
  serviceId: uuidSchema.optional(),
  providerId: uuidSchema.optional(),
  duration: z.coerce.number().int().min(5).default(60),
});

const bookWithTokenSchema = z.object({
  token: z.string().min(1),

  // Patient info (required if not pre-filled in token)
  patientId: uuidSchema.optional(),
  patientName: z.string().min(1).max(100),
  patientEmail: z.string().email().optional(),
  patientPhone: z.string().min(10).max(20).optional(),

  // Booking details
  serviceId: uuidSchema,
  serviceName: z.string().min(1),
  providerId: uuidSchema,
  providerName: z.string().min(1),
  startTime: z.string().datetime(),
  duration: z.coerce.number().int().min(5).max(480),
  notes: z.string().max(2000).optional(),

  // Policy acceptance
  acceptedPolicy: z.boolean(),

  // Payment (for deposits)
  paymentMethodId: z.string().optional(),
});

const listTokensQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'USED', 'EXPIRED', 'REVOKED']).optional(),
  patientId: uuidSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// ===================
// Rate Limiting (In-Memory - Consider Redis in Production)
// ===================

const validationRateLimits = new Map<string, { count: number; resetAt: Date }>();

// Constants
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_VALIDATIONS = 10; // Max 10 validations per minute per IP
const RATE_LIMIT_MAX_BOOKINGS = 5; // Max 5 booking attempts per minute per IP

// Provider schedules (mock data - would come from providers service)
const providerSchedules = [
  { providerId: 'prov-1', dayOfWeek: 1, startHour: 9, endHour: 17, providerName: 'Dr. Sarah Johnson' },
  { providerId: 'prov-1', dayOfWeek: 2, startHour: 9, endHour: 17, providerName: 'Dr. Sarah Johnson' },
  { providerId: 'prov-1', dayOfWeek: 3, startHour: 9, endHour: 17, providerName: 'Dr. Sarah Johnson' },
  { providerId: 'prov-1', dayOfWeek: 4, startHour: 9, endHour: 17, providerName: 'Dr. Sarah Johnson' },
  { providerId: 'prov-1', dayOfWeek: 5, startHour: 9, endHour: 17, providerName: 'Dr. Sarah Johnson' },
  { providerId: 'prov-2', dayOfWeek: 1, startHour: 10, endHour: 18, providerName: 'Dr. Emily Wilson' },
  { providerId: 'prov-2', dayOfWeek: 3, startHour: 10, endHour: 18, providerName: 'Dr. Emily Wilson' },
  { providerId: 'prov-2', dayOfWeek: 5, startHour: 10, endHour: 18, providerName: 'Dr. Emily Wilson' },
  { providerId: 'prov-3', dayOfWeek: 2, startHour: 8, endHour: 16, providerName: 'Dr. Michael Chen' },
  { providerId: 'prov-3', dayOfWeek: 4, startHour: 8, endHour: 16, providerName: 'Dr. Michael Chen' },
  { providerId: 'prov-3', dayOfWeek: 6, startHour: 8, endHour: 16, providerName: 'Dr. Michael Chen' },
];

const providerNames: Record<string, string> = {
  'prov-1': 'Dr. Sarah Johnson',
  'prov-2': 'Dr. Emily Wilson',
  'prov-3': 'Dr. Michael Chen',
};

// ===================
// Helper Functions
// ===================

/**
 * Generate cryptographically secure random token
 * Uses Node.js crypto.randomBytes for secure randomness
 */
function generateSecureToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Hash token using SHA-256 for secure storage
 * Never store raw tokens in the database
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Generate unique ID for express booking token
 */
function generateId(): string {
  return `exp-tok-${Date.now()}-${randomBytes(4).toString('hex')}`;
}

/**
 * Generate unique ID for appointment
 */
function generateAppointmentId(): string {
  return `apt-exp-${Date.now()}-${randomBytes(4).toString('hex')}`;
}

/**
 * Extract client IP address from request headers
 * Handles common proxy headers (X-Forwarded-For, X-Real-IP)
 */
function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

/**
 * Rate limiting check using sliding window
 * In production, consider using Redis for distributed rate limiting
 */
function checkRateLimit(key: string, maxAttempts: number): boolean {
  const now = new Date();
  const limit = validationRateLimits.get(key);

  if (!limit || now > limit.resetAt) {
    validationRateLimits.set(key, {
      count: 1,
      resetAt: new Date(now.getTime() + RATE_LIMIT_WINDOW_MS)
    });
    return true;
  }

  if (limit.count >= maxAttempts) {
    return false;
  }

  limit.count++;
  return true;
}

/**
 * Get day name from date
 */
function getDayName(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

/**
 * Determine token status based on expiration and usage
 * Returns the current status without updating the database
 */
function determineTokenStatus(token: {
  status: ExpressBookingStatus;
  expiresAt: Date;
  maxUses: number;
  usedCount: number;
}): ExpressBookingStatus {
  if (token.status === 'REVOKED') return 'REVOKED';

  const now = new Date();

  if (now > token.expiresAt) {
    return 'EXPIRED';
  }

  if (token.usedCount >= token.maxUses) {
    return 'USED';
  }

  return 'ACTIVE';
}

/**
 * Find token by raw token string
 * Hashes the token and looks up in database
 */
async function findTokenByRawToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  try {
    return await prisma.expressBookingToken.findUnique({
      where: { token: tokenHash }
    });
  } catch (error) {
    handlePrismaError(error);
  }
}

/**
 * Validate token constraints against booking details
 */
function validateTokenConstraints(
  token: {
    serviceIds: string[];
    providerIds: string[];
    validFrom: Date | null;
    validUntil: Date | null;
    allowedDays: string[];
  },
  serviceId?: string,
  providerId?: string,
  startTime?: Date
): { valid: boolean; message?: string } {
  // Check service constraint
  if (token.serviceIds && token.serviceIds.length > 0) {
    if (serviceId && !token.serviceIds.includes(serviceId)) {
      return { valid: false, message: 'Service not allowed with this booking link' };
    }
  }

  // Check provider constraint
  if (token.providerIds && token.providerIds.length > 0) {
    if (providerId && !token.providerIds.includes(providerId)) {
      return { valid: false, message: 'Provider not allowed with this booking link' };
    }
  }

  // Check date constraints
  if (startTime) {
    if (token.validFrom && startTime < token.validFrom) {
      return { valid: false, message: 'Appointment date is before the allowed period' };
    }
    if (token.validUntil && startTime > token.validUntil) {
      return { valid: false, message: 'Appointment date is after the allowed period' };
    }

    // Check allowed days
    if (token.allowedDays && token.allowedDays.length > 0) {
      const dayName = getDayName(startTime);
      if (!token.allowedDays.includes(dayName)) {
        return { valid: false, message: `Bookings are only allowed on: ${token.allowedDays.join(', ')}` };
      }
    }
  }

  return { valid: true };
}

/**
 * Calculate available appointment slots
 * This is a simplified version - production should query actual availability
 */
function calculateAvailableSlots(
  providerId: string,
  date: Date,
  durationMinutes: number,
  tokenConstraints?: { providerIds?: string[] }
): Array<{ startTime: string; endTime: string; providerId: string; providerName: string; duration: number }> {
  const slots: Array<{ startTime: string; endTime: string; providerId: string; providerName: string; duration: number }> = [];
  const dayOfWeek = date.getDay();

  // Get schedules that match provider constraint
  const relevantSchedules = providerSchedules.filter(s => {
    if (providerId && s.providerId !== providerId) return false;
    if (tokenConstraints?.providerIds && !tokenConstraints.providerIds.includes(s.providerId)) return false;
    return s.dayOfWeek === dayOfWeek;
  });

  for (const schedule of relevantSchedules) {
    let currentTime = new Date(date);
    currentTime.setHours(schedule.startHour, 0, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(schedule.endHour, 0, 0, 0);

    while (currentTime.getTime() + durationMinutes * 60 * 1000 <= endTime.getTime()) {
      const slotEnd = new Date(currentTime.getTime() + durationMinutes * 60 * 1000);

      // In production: Query database for actual appointment conflicts
      // For now, return all theoretical slots
      slots.push({
        startTime: currentTime.toISOString(),
        endTime: slotEnd.toISOString(),
        providerId: schedule.providerId,
        providerName: providerNames[schedule.providerId] || 'Unknown Provider',
        duration: durationMinutes,
      });

      // Move to next slot (15-minute increments)
      currentTime = new Date(currentTime.getTime() + 15 * 60 * 1000);
    }
  }

  return slots;
}

/**
 * Clean up expired tokens
 * Should be called periodically (e.g., via cron job)
 */
async function cleanupExpiredTokens(): Promise<number> {
  try {
    const result = await prisma.expressBookingToken.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        status: 'ACTIVE'
      },
      data: {
        status: 'EXPIRED'
      }
    });

    return result.count;
  } catch (error) {
    handlePrismaError(error);
  }
}

// ===================
// Public Routes (No Auth Required)
// ===================

/**
 * Validate Token and Get Booking Context
 * GET /api/express-booking/tokens/:token
 *
 * Returns token details and booking context if valid
 */
expressBooking.get('/tokens/:token', async (c) => {
  const token = c.req.param('token');
  const ipAddress = getClientIP(c);

  // Rate limiting
  if (!checkRateLimit(ipAddress, RATE_LIMIT_MAX_VALIDATIONS)) {
    await logAuditEvent({
      action: 'ACCESS_DENIED',
      resourceType: 'express_booking_token',
      ipAddress,
      metadata: { reason: 'rate_limited' },
    });
    throw APIError.tooManyRequests('Too many validation attempts. Please wait a moment.');
  }

  const storedToken = await findTokenByRawToken(token);

  if (!storedToken) {
    await logAuditEvent({
      action: 'ACCESS_DENIED',
      resourceType: 'express_booking_token',
      ipAddress,
      metadata: { reason: 'token_not_found' },
    });
    throw APIError.notFound('Booking link');
  }

  // Determine current status
  const currentStatus = determineTokenStatus(storedToken);

  // Update status in database if it changed
  if (currentStatus !== storedToken.status) {
    try {
      await prisma.expressBookingToken.update({
        where: { id: storedToken.id },
        data: { status: currentStatus }
      });
      storedToken.status = currentStatus;
    } catch (error) {
      handlePrismaError(error);
    }
  }

  if (storedToken.status === 'EXPIRED') {
    throw APIError.badRequest('This booking link has expired.');
  }

  if (storedToken.status === 'USED') {
    throw APIError.badRequest('This booking link has already been used.');
  }

  if (storedToken.status === 'REVOKED') {
    throw APIError.badRequest('This booking link has been cancelled.');
  }

  await logAuditEvent({
    action: 'READ',
    resourceType: 'express_booking_token',
    resourceId: storedToken.id,
    ipAddress,
    metadata: { tokenPrefix: storedToken.rawTokenPrefix },
  });

  return c.json({
    success: true,
    token: {
      id: storedToken.id,
      status: storedToken.status,
      expiresAt: storedToken.expiresAt.toISOString(),
      remainingUses: storedToken.maxUses - storedToken.usedCount,

      // Pre-filled patient info
      patientContext: {
        patientId: storedToken.patientId,
        patientName: storedToken.patientName,
        patientEmail: storedToken.patientEmail,
        patientPhone: storedToken.patientPhone,
      },

      // Booking constraints
      constraints: {
        serviceIds: storedToken.serviceIds,
        providerIds: storedToken.providerIds,
        locationId: storedToken.locationId,
        validFrom: storedToken.validFrom?.toISOString(),
        validUntil: storedToken.validUntil?.toISOString(),
        allowedDays: storedToken.allowedDays,
      },

      // Customization
      message: storedToken.message,
      redirectUrl: storedToken.redirectUrl,

      // Deposit requirements
      requireDeposit: storedToken.requireDeposit,
      depositAmount: storedToken.depositAmount,
    },
  });
});

/**
 * Get Available Slots with Token
 * GET /api/express-booking/availability
 *
 * Returns available appointment slots, filtered by token constraints
 */
expressBooking.get('/availability', zValidator('query', availabilityQuerySchema), async (c) => {
  const { token, date, serviceId, providerId, duration } = c.req.valid('query');
  const ipAddress = getClientIP(c);

  // Rate limiting
  if (!checkRateLimit(ipAddress, RATE_LIMIT_MAX_VALIDATIONS)) {
    throw APIError.tooManyRequests('Too many requests. Please wait a moment.');
  }

  const storedToken = await findTokenByRawToken(token);

  if (!storedToken) {
    throw APIError.unauthorized('Invalid booking link.');
  }

  const currentStatus = determineTokenStatus(storedToken);

  if (currentStatus !== 'ACTIVE') {
    throw APIError.badRequest(`Booking link is ${currentStatus.toLowerCase()}.`);
  }

  // Parse date
  const targetDate = new Date(date);
  if (isNaN(targetDate.getTime())) {
    throw APIError.badRequest('Invalid date format. Use YYYY-MM-DD.');
  }

  // Validate against token constraints
  const constraintCheck = validateTokenConstraints(
    storedToken,
    serviceId,
    providerId,
    targetDate
  );

  if (!constraintCheck.valid) {
    throw APIError.badRequest(constraintCheck.message!);
  }

  // Calculate available slots respecting token constraints
  const effectiveProviderId = providerId ||
    (storedToken.providerIds?.length === 1 ? storedToken.providerIds[0] : '');

  const slots = calculateAvailableSlots(
    effectiveProviderId,
    targetDate,
    duration,
    { providerIds: storedToken.providerIds }
  );

  return c.json({
    success: true,
    date,
    duration,
    constraints: {
      serviceIds: storedToken.serviceIds,
      providerIds: storedToken.providerIds,
      allowedDays: storedToken.allowedDays,
    },
    slots,
    totalSlots: slots.length,
  });
});

/**
 * Create Booking with Token
 * POST /api/express-booking/book
 *
 * Creates an appointment using the express booking token
 */
expressBooking.post('/book', zValidator('json', bookWithTokenSchema), async (c) => {
  const data = c.req.valid('json');
  const ipAddress = getClientIP(c);

  // Rate limiting (stricter for booking)
  if (!checkRateLimit(ipAddress, RATE_LIMIT_MAX_BOOKINGS)) {
    throw APIError.tooManyRequests('Too many booking attempts. Please wait a moment.');
  }

  const storedToken = await findTokenByRawToken(data.token);

  if (!storedToken) {
    await logAuditEvent({
      action: 'ACCESS_DENIED',
      resourceType: 'express_booking',
      ipAddress,
      metadata: { reason: 'token_not_found' },
    });
    throw APIError.unauthorized('Invalid booking link.');
  }

  const currentStatus = determineTokenStatus(storedToken);

  if (currentStatus !== 'ACTIVE') {
    throw APIError.badRequest(`Booking link is ${currentStatus.toLowerCase()}.`);
  }

  // Validate policy acceptance
  if (!data.acceptedPolicy) {
    throw APIError.badRequest('You must accept the cancellation policy to complete the booking.');
  }

  const startTime = new Date(data.startTime);

  // Validate against token constraints
  const constraintCheck = validateTokenConstraints(
    storedToken,
    data.serviceId,
    data.providerId,
    startTime
  );

  if (!constraintCheck.valid) {
    throw APIError.badRequest(constraintCheck.message!);
  }

  // Check if deposit is required
  if (storedToken.requireDeposit && storedToken.depositAmount && storedToken.depositAmount > 0) {
    if (!data.paymentMethodId) {
      throw APIError.badRequest('Payment method required for deposit.');
    }
    // In production: Process Stripe payment here
    console.log(`[Express Booking] Would charge $${storedToken.depositAmount / 100} deposit`);
  }

  // Create the appointment
  const appointmentId = generateAppointmentId();
  const endTime = new Date(startTime.getTime() + data.duration * 60 * 1000);

  // Use transaction to ensure atomicity
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create appointment (Note: Using mock storage as Appointment model may need adjustments)
      // In production, this should create a real Appointment record
      const appointment = {
        id: appointmentId,
        patientId: data.patientId || storedToken.patientId || `pat-exp-${Date.now()}`,
        patientName: data.patientName || storedToken.patientName || '',
        patientEmail: data.patientEmail || storedToken.patientEmail,
        patientPhone: data.patientPhone || storedToken.patientPhone,
        serviceId: data.serviceId,
        serviceName: data.serviceName,
        providerId: data.providerId,
        providerName: data.providerName,
        startTime,
        endTime,
        duration: data.duration,
        status: 'confirmed' as const,
        bookingType: 'express_booking' as const,
        expressBookingTokenId: storedToken.id,
        notes: data.notes,
        depositPaid: !!(storedToken.requireDeposit && data.paymentMethodId),
        depositAmount: storedToken.depositAmount,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update token usage
      const updatedToken = await tx.expressBookingToken.update({
        where: { id: storedToken.id },
        data: {
          usedCount: { increment: 1 },
          bookings: [...storedToken.bookings, appointmentId],
        }
      });

      // Update status if needed
      const newStatus = determineTokenStatus({
        ...updatedToken,
        usedCount: updatedToken.usedCount,
      });

      if (newStatus !== updatedToken.status) {
        await tx.expressBookingToken.update({
          where: { id: storedToken.id },
          data: { status: newStatus }
        });
      }

      return { appointment, updatedToken };
    });

    await logAuditEvent({
      action: 'CREATE',
      resourceType: 'express_booking',
      resourceId: appointmentId,
      patientId: result.appointment.patientId,
      phiAccessed: true,
      ipAddress,
      metadata: {
        tokenId: storedToken.id,
        providerId: data.providerId,
        serviceId: data.serviceId,
        startTime: startTime.toISOString(),
      },
    });

    return c.json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment: {
        id: result.appointment.id,
        patientName: result.appointment.patientName,
        serviceName: result.appointment.serviceName,
        providerName: result.appointment.providerName,
        startTime: result.appointment.startTime.toISOString(),
        endTime: result.appointment.endTime.toISOString(),
        status: result.appointment.status,
        depositPaid: result.appointment.depositPaid,
      },
      token: {
        remainingUses: result.updatedToken.maxUses - result.updatedToken.usedCount,
        status: determineTokenStatus(result.updatedToken),
      },
      redirectUrl: storedToken.redirectUrl,
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

// ===================
// Staff Routes (Auth Required)
// ===================

// Apply auth middleware to staff routes
expressBooking.use('/tokens', authMiddleware);
expressBooking.use('/tokens/*', authMiddleware);

/**
 * Generate Express Booking Token
 * POST /api/express-booking/tokens
 *
 * Creates a new express booking token with optional constraints
 */
expressBooking.post(
  '/tokens',
  requirePermission('appointment:create'),
  zValidator('json', createTokenSchema),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    // Generate secure token
    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const tokenId = generateId();

    const expiresAt = new Date(Date.now() + data.expiresInHours * 60 * 60 * 1000);

    // Create token in database
    try {
      const expressToken = await prisma.expressBookingToken.create({
        data: {
          id: tokenId,
          token: tokenHash,
          rawTokenPrefix: rawToken.slice(0, 12),

          // Patient context
          patientId: data.patientId,
          patientName: data.patientName,
          patientEmail: data.patientEmail,
          patientPhone: data.patientPhone,

          // Booking constraints
          serviceIds: data.serviceIds || [],
          providerIds: data.providerIds || [],
          locationId: data.locationId,

          // Date constraints
          validFrom: data.validFrom ? new Date(data.validFrom) : null,
          validUntil: data.validUntil ? new Date(data.validUntil) : null,
          allowedDays: data.allowedDays || [],

          // Usage
          maxUses: data.maxUses,
          usedCount: 0,

          // Customization
          message: data.message,
          redirectUrl: data.redirectUrl,

          // Deposit
          requireDeposit: data.requireDeposit || false,
          depositAmount: data.depositAmount,

          // Metadata
          createdBy: user.uid,
          expiresAt,

          // Status
          status: 'ACTIVE',

          // Bookings
          bookings: [],
        }
      });

      // Generate booking URL
      const baseUrl = process.env.PATIENT_PORTAL_URL || 'http://localhost:3002';
      const bookingUrl = `${baseUrl}/book/${rawToken}`;

      await logAuditEvent({
        userId: user.uid,
        action: 'CREATE',
        resourceType: 'express_booking_token',
        resourceId: tokenId,
        patientId: data.patientId,
        phiAccessed: !!data.patientId,
        ipAddress,
        metadata: {
          expiresAt: expiresAt.toISOString(),
          maxUses: data.maxUses,
          hasConstraints: !!(data.serviceIds || data.providerIds || data.allowedDays),
        },
      });

      return c.json({
        success: true,
        message: 'Express booking link created',
        token: {
          id: tokenId,
          rawToken, // Return only once - not stored
          tokenPrefix: expressToken.rawTokenPrefix,
          bookingUrl,
          expiresAt: expiresAt.toISOString(),
          expiresInHours: data.expiresInHours,
          maxUses: data.maxUses,
          patientContext: {
            patientId: data.patientId,
            patientName: data.patientName,
            patientPhone: data.patientPhone,
          },
          constraints: {
            serviceIds: data.serviceIds,
            providerIds: data.providerIds,
            allowedDays: data.allowedDays,
          },
          requireDeposit: data.requireDeposit,
          depositAmount: data.depositAmount,
        },
      }, 201);
    } catch (error) {
      handlePrismaError(error);
    }
  }
);

/**
 * List Express Booking Tokens
 * GET /api/express-booking/tokens
 *
 * Returns paginated list of tokens
 */
expressBooking.get(
  '/tokens',
  requirePermission('appointment:list'),
  zValidator('query', listTokensQuerySchema),
  async (c) => {
    const { status, patientId, page, limit } = c.req.valid('query');

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (patientId) {
      where.patientId = patientId;
    }

    try {
      // Get total count
      const total = await prisma.expressBookingToken.count({ where });

      // Get paginated tokens
      const tokens = await prisma.expressBookingToken.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      // Update statuses for returned tokens if needed
      const tokensWithUpdatedStatus = await Promise.all(
        tokens.map(async (token) => {
          const currentStatus = determineTokenStatus(token);
          if (currentStatus !== token.status) {
            await prisma.expressBookingToken.update({
              where: { id: token.id },
              data: { status: currentStatus }
            });
            return { ...token, status: currentStatus };
          }
          return token;
        })
      );

      return c.json({
        success: true,
        items: tokensWithUpdatedStatus.map(t => ({
          id: t.id,
          tokenPrefix: t.rawTokenPrefix,
          status: t.status,
          patientName: t.patientName,
          patientPhone: t.patientPhone,
          maxUses: t.maxUses,
          usedCount: t.usedCount,
          remainingUses: t.maxUses - t.usedCount,
          expiresAt: t.expiresAt.toISOString(),
          createdAt: t.createdAt.toISOString(),
          createdBy: t.createdBy,
          bookings: t.bookings,
          constraints: {
            serviceIds: t.serviceIds,
            providerIds: t.providerIds,
            allowedDays: t.allowedDays,
          },
        })),
        total,
        page,
        limit,
        hasMore: (page - 1) * limit + tokensWithUpdatedStatus.length < total,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
);

/**
 * Get Single Express Booking Token by ID
 * GET /api/express-booking/tokens/:tokenId
 *
 * Returns detailed information about a specific token
 */
expressBooking.get(
  '/tokens/:tokenId',
  requirePermission('appointment:list'),
  async (c) => {
    const tokenId = c.req.param('tokenId');

    try {
      const token = await prisma.expressBookingToken.findUnique({
        where: { id: tokenId }
      });

      if (!token) {
        throw APIError.notFound('Express booking token');
      }

      // Update status if needed
      const currentStatus = determineTokenStatus(token);
      if (currentStatus !== token.status) {
        await prisma.expressBookingToken.update({
          where: { id: token.id },
          data: { status: currentStatus }
        });
        token.status = currentStatus;
      }

      return c.json({
        success: true,
        token: {
          id: token.id,
          tokenPrefix: token.rawTokenPrefix,
          status: token.status,
          patientId: token.patientId,
          patientName: token.patientName,
          patientEmail: token.patientEmail,
          patientPhone: token.patientPhone,
          serviceIds: token.serviceIds,
          providerIds: token.providerIds,
          locationId: token.locationId,
          validFrom: token.validFrom?.toISOString(),
          validUntil: token.validUntil?.toISOString(),
          allowedDays: token.allowedDays,
          maxUses: token.maxUses,
          usedCount: token.usedCount,
          remainingUses: token.maxUses - token.usedCount,
          message: token.message,
          redirectUrl: token.redirectUrl,
          requireDeposit: token.requireDeposit,
          depositAmount: token.depositAmount,
          bookings: token.bookings,
          createdBy: token.createdBy,
          createdAt: token.createdAt.toISOString(),
          expiresAt: token.expiresAt.toISOString(),
        }
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
);

/**
 * Revoke Express Booking Token
 * DELETE /api/express-booking/tokens/:tokenId
 *
 * Marks a token as revoked
 */
expressBooking.delete(
  '/tokens/:tokenId',
  requirePermission('appointment:delete'),
  async (c) => {
    const tokenId = c.req.param('tokenId');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    try {
      const token = await prisma.expressBookingToken.findUnique({
        where: { id: tokenId }
      });

      if (!token) {
        throw APIError.notFound('Express booking token');
      }

      if (token.status === 'REVOKED') {
        throw APIError.badRequest('Token has already been revoked.');
      }

      const updatedToken = await prisma.expressBookingToken.update({
        where: { id: tokenId },
        data: { status: 'REVOKED' }
      });

      await logAuditEvent({
        userId: user.uid,
        action: 'DELETE',
        resourceType: 'express_booking_token',
        resourceId: tokenId,
        patientId: token.patientId ?? undefined,
        ipAddress,
        metadata: { previousStatus: token.status },
      });

      return c.json({
        success: true,
        message: 'Express booking link has been revoked',
        token: {
          id: updatedToken.id,
          status: updatedToken.status,
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
);

/**
 * Cleanup Expired Tokens
 * POST /api/express-booking/cleanup
 *
 * Updates status of expired tokens (should be called by cron job)
 */
expressBooking.post(
  '/cleanup',
  requirePermission('appointment:manage'),
  async (c) => {
    const count = await cleanupExpiredTokens();

    await logAuditEvent({
      userId: c.get('user').uid,
      action: 'UPDATE',
      resourceType: 'express_booking_token',
      metadata: { cleanedUpCount: count },
    });

    return c.json({
      success: true,
      message: `Cleaned up ${count} expired tokens`,
      count,
    });
  }
);

// ===================
// Exports for Testing
// ===================

export { cleanupExpiredTokens, generateSecureToken, hashToken, determineTokenStatus };

export default expressBooking;
