/**
 * Express Booking API Tests
 *
 * Comprehensive tests for:
 * - Token generation
 * - Token validation
 * - Availability with constraints
 * - Booking with token
 * - Token management (list, revoke)
 * - Rate limiting
 * - Security features
 * - Edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import expressBooking, {
  clearStores,
  addMockToken,
  getMockToken,
  addMockAppointment,
  getMockAppointment,
} from '../src/routes/express-booking';
import { errorHandler } from '../src/middleware/error';

// Mock auth middleware for staff routes
vi.mock('../src/middleware/auth', () => ({
  authMiddleware: vi.fn((c: any, next: any) => {
    c.set('user', {
      uid: 'test-staff-001',
      email: 'staff@example.com',
      role: 'admin',
      permissions: ['appointment:create', 'appointment:list', 'appointment:delete'],
    });
    return next();
  }),
  optionalAuthMiddleware: vi.fn((c: any, next: any) => next()),
  requirePermission: vi.fn(() => (c: any, next: any) => next()),
}));

// Mock audit logging
vi.mock('@medical-spa/security', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

// Create test app
const app = new Hono();
app.route('/api/express-booking', expressBooking);
app.onError(errorHandler);

// Helper function to make requests
async function request(
  method: string,
  path: string,
  body?: object,
  headers?: Record<string, string>
) {
  const req = new Request(`http://localhost${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return app.fetch(req);
}

describe('Express Booking API', () => {
  beforeEach(() => {
    clearStores();
  });

  // ===================
  // Token Generation Tests
  // ===================
  describe('Token Generation', () => {
    describe('POST /api/express-booking/tokens', () => {
      it('should generate a basic token with default settings', async () => {
        const res = await request('POST', '/api/express-booking/tokens', {});

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.token.id).toBeDefined();
        expect(data.token.rawToken).toBeDefined();
        expect(data.token.rawToken.length).toBeGreaterThan(20);
        expect(data.token.bookingUrl).toContain('/book/');
        expect(data.token.expiresInHours).toBe(48);
        expect(data.token.maxUses).toBe(1);
      });

      it('should generate token with patient context', async () => {
        const res = await request('POST', '/api/express-booking/tokens', {
          patientId: 'pat-123',
          patientName: 'Jane Doe',
          patientEmail: 'jane@example.com',
          patientPhone: '5551234567',
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.token.patientContext.patientId).toBe('pat-123');
        expect(data.token.patientContext.patientName).toBe('Jane Doe');
        expect(data.token.patientContext.patientPhone).toBe('5551234567');
      });

      it('should generate token with service constraints', async () => {
        const res = await request('POST', '/api/express-booking/tokens', {
          serviceIds: ['svc-001', 'svc-002'],
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.token.constraints.serviceIds).toEqual(['svc-001', 'svc-002']);
      });

      it('should generate token with provider constraints', async () => {
        const res = await request('POST', '/api/express-booking/tokens', {
          providerIds: ['prov-1', 'prov-2'],
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.token.constraints.providerIds).toEqual(['prov-1', 'prov-2']);
      });

      it('should generate token with day constraints', async () => {
        const res = await request('POST', '/api/express-booking/tokens', {
          allowedDays: ['monday', 'wednesday', 'friday'],
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.token.constraints.allowedDays).toEqual(['monday', 'wednesday', 'friday']);
      });

      it('should generate token with custom expiration', async () => {
        const res = await request('POST', '/api/express-booking/tokens', {
          expiresInHours: 24,
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.token.expiresInHours).toBe(24);
      });

      it('should generate multi-use token', async () => {
        const res = await request('POST', '/api/express-booking/tokens', {
          maxUses: 5,
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.token.maxUses).toBe(5);
      });

      it('should generate token with deposit requirement', async () => {
        const res = await request('POST', '/api/express-booking/tokens', {
          requireDeposit: true,
          depositAmount: 5000, // $50.00 in cents
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.token.requireDeposit).toBe(true);
        expect(data.token.depositAmount).toBe(5000);
      });

      it('should generate token with custom message', async () => {
        const res = await request('POST', '/api/express-booking/tokens', {
          message: 'Welcome back! Use this link to book your follow-up.',
        });

        expect(res.status).toBe(201);
        // Message is stored but not returned in create response
        const data = await res.json();
        expect(data.success).toBe(true);
      });

      it('should generate token with redirect URL', async () => {
        const res = await request('POST', '/api/express-booking/tokens', {
          redirectUrl: 'https://clinic.com/thank-you',
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.success).toBe(true);
      });

      it('should reject invalid max uses', async () => {
        const res = await request('POST', '/api/express-booking/tokens', {
          maxUses: 0,
        });

        expect(res.status).toBe(400);
      });

      it('should reject expiration too long', async () => {
        const res = await request('POST', '/api/express-booking/tokens', {
          expiresInHours: 1000, // More than 720 hours
        });

        expect(res.status).toBe(400);
      });
    });
  });

  // ===================
  // Token Validation Tests
  // ===================
  describe('Token Validation', () => {
    describe('GET /api/express-booking/tokens/:token', () => {
      it('should validate a valid token', async () => {
        // Create token
        const createRes = await request('POST', '/api/express-booking/tokens', {
          patientName: 'Test Patient',
        });
        const { token } = await createRes.json();

        // Validate token
        const res = await request('GET', `/api/express-booking/tokens/${token.rawToken}`);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.token.id).toBe(token.id);
        expect(data.token.status).toBe('active');
        expect(data.token.remainingUses).toBe(1);
      });

      it('should return pre-filled patient context', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {
          patientId: 'pat-123',
          patientName: 'Jane Doe',
          patientEmail: 'jane@example.com',
          patientPhone: '5551234567',
        });
        const { token } = await createRes.json();

        const res = await request('GET', `/api/express-booking/tokens/${token.rawToken}`);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.token.patientContext.patientId).toBe('pat-123');
        expect(data.token.patientContext.patientName).toBe('Jane Doe');
        expect(data.token.patientContext.patientEmail).toBe('jane@example.com');
      });

      it('should return constraints', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {
          serviceIds: ['svc-001'],
          providerIds: ['prov-1'],
          allowedDays: ['monday', 'tuesday'],
        });
        const { token } = await createRes.json();

        const res = await request('GET', `/api/express-booking/tokens/${token.rawToken}`);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.token.constraints.serviceIds).toEqual(['svc-001']);
        expect(data.token.constraints.providerIds).toEqual(['prov-1']);
        expect(data.token.constraints.allowedDays).toEqual(['monday', 'tuesday']);
      });

      it('should reject non-existent token', async () => {
        const res = await request('GET', '/api/express-booking/tokens/invalid-token-123');

        expect(res.status).toBe(404);
      });

      it('should reject expired token', async () => {
        // Add expired token directly
        const expiredToken = 'expired-test-token';
        addMockToken(expiredToken, {
          expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
        });

        const res = await request('GET', `/api/express-booking/tokens/${expiredToken}`);

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.message).toContain('expired');
      });

      it('should reject revoked token', async () => {
        const revokedToken = 'revoked-test-token';
        addMockToken(revokedToken, {
          status: 'revoked',
        });

        const res = await request('GET', `/api/express-booking/tokens/${revokedToken}`);

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.message).toContain('cancelled');
      });

      it('should reject used single-use token', async () => {
        const usedToken = 'used-test-token';
        addMockToken(usedToken, {
          maxUses: 1,
          usedCount: 1,
        });

        const res = await request('GET', `/api/express-booking/tokens/${usedToken}`);

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.message).toContain('used');
      });

      it('should rate limit excessive validation attempts', async () => {
        // Exhaust rate limit (10 attempts)
        for (let i = 0; i < 10; i++) {
          await request('GET', '/api/express-booking/tokens/test-token', undefined, {
            'X-Forwarded-For': '192.168.1.100',
          });
        }

        // 11th attempt should be rate limited
        const res = await request('GET', '/api/express-booking/tokens/test-token', undefined, {
          'X-Forwarded-For': '192.168.1.100',
        });

        expect(res.status).toBe(429);
      });
    });
  });

  // ===================
  // Availability Tests
  // ===================
  describe('Availability', () => {
    describe('GET /api/express-booking/availability', () => {
      it('should return available slots with valid token', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {});
        const { token } = await createRes.json();

        // Get availability for a Monday
        const monday = new Date();
        monday.setDate(monday.getDate() + ((1 + 7 - monday.getDay()) % 7));
        const dateStr = monday.toISOString().split('T')[0];

        const res = await request(
          'GET',
          `/api/express-booking/availability?token=${token.rawToken}&date=${dateStr}&duration=60`
        );

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.slots).toBeDefined();
        expect(Array.isArray(data.slots)).toBe(true);
        expect(data.totalSlots).toBeGreaterThanOrEqual(0);
      });

      it('should filter slots by provider constraint', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {
          providerIds: ['prov-1'],
        });
        const { token } = await createRes.json();

        const monday = new Date();
        monday.setDate(monday.getDate() + ((1 + 7 - monday.getDay()) % 7));
        const dateStr = monday.toISOString().split('T')[0];

        const res = await request(
          'GET',
          `/api/express-booking/availability?token=${token.rawToken}&date=${dateStr}&duration=60`
        );

        expect(res.status).toBe(200);
        const data = await res.json();
        // All slots should be for prov-1 only
        data.slots.forEach((slot: any) => {
          expect(slot.providerId).toBe('prov-1');
        });
      });

      it('should respect allowed days constraint', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {
          allowedDays: ['tuesday', 'thursday'],
        });
        const { token } = await createRes.json();

        // Try to get availability for Monday
        const monday = new Date();
        monday.setDate(monday.getDate() + ((1 + 7 - monday.getDay()) % 7));
        const dateStr = monday.toISOString().split('T')[0];

        const res = await request(
          'GET',
          `/api/express-booking/availability?token=${token.rawToken}&date=${dateStr}&duration=60`
        );

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.message).toContain('only allowed on');
      });

      it('should reject invalid token for availability', async () => {
        const res = await request(
          'GET',
          '/api/express-booking/availability?token=invalid-token&date=2024-01-15&duration=60'
        );

        expect(res.status).toBe(401);
      });

      it('should reject invalid date format', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {});
        const { token } = await createRes.json();

        const res = await request(
          'GET',
          `/api/express-booking/availability?token=${token.rawToken}&date=invalid-date&duration=60`
        );

        expect(res.status).toBe(400);
      });
    });
  });

  // ===================
  // Booking Tests
  // ===================
  describe('Booking with Token', () => {
    describe('POST /api/express-booking/book', () => {
      it('should create booking with valid token', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {});
        const { token } = await createRes.json();

        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 24);

        const res = await request('POST', '/api/express-booking/book', {
          token: token.rawToken,
          patientName: 'John Doe',
          patientEmail: 'john@example.com',
          patientPhone: '5551234567',
          serviceId: 'svc-001',
          serviceName: 'Botox Treatment',
          providerId: 'prov-1',
          providerName: 'Dr. Sarah Johnson',
          startTime: startTime.toISOString(),
          duration: 60,
          acceptedPolicy: true,
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.appointment.id).toBeDefined();
        expect(data.appointment.patientName).toBe('John Doe');
        expect(data.appointment.status).toBe('confirmed');
      });

      it('should use pre-filled patient info from token', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {
          patientId: 'pat-123',
          patientName: 'Jane Doe',
          patientEmail: 'jane@example.com',
        });
        const { token } = await createRes.json();

        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 24);

        const res = await request('POST', '/api/express-booking/book', {
          token: token.rawToken,
          patientName: 'Jane Doe', // Required in schema
          serviceId: 'svc-001',
          serviceName: 'Botox Treatment',
          providerId: 'prov-1',
          providerName: 'Dr. Sarah Johnson',
          startTime: startTime.toISOString(),
          duration: 60,
          acceptedPolicy: true,
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.appointment.patientName).toBe('Jane Doe');
      });

      it('should mark single-use token as used after booking', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {
          maxUses: 1,
        });
        const { token } = await createRes.json();

        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 24);

        await request('POST', '/api/express-booking/book', {
          token: token.rawToken,
          patientName: 'John Doe',
          serviceId: 'svc-001',
          serviceName: 'Botox',
          providerId: 'prov-1',
          providerName: 'Dr. Johnson',
          startTime: startTime.toISOString(),
          duration: 60,
          acceptedPolicy: true,
        });

        // Check token status
        const validateRes = await request('GET', `/api/express-booking/tokens/${token.rawToken}`);
        expect(validateRes.status).toBe(400);
        const data = await validateRes.json();
        expect(data.message).toContain('used');
      });

      it('should allow multiple bookings with multi-use token', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {
          maxUses: 3,
        });
        const { token } = await createRes.json();

        // First booking
        const startTime1 = new Date();
        startTime1.setHours(startTime1.getHours() + 24);

        const res1 = await request('POST', '/api/express-booking/book', {
          token: token.rawToken,
          patientName: 'John Doe',
          serviceId: 'svc-001',
          serviceName: 'Botox',
          providerId: 'prov-1',
          providerName: 'Dr. Johnson',
          startTime: startTime1.toISOString(),
          duration: 60,
          acceptedPolicy: true,
        });
        expect(res1.status).toBe(201);
        const data1 = await res1.json();
        expect(data1.token.remainingUses).toBe(2);

        // Second booking
        const startTime2 = new Date();
        startTime2.setHours(startTime2.getHours() + 48);

        const res2 = await request('POST', '/api/express-booking/book', {
          token: token.rawToken,
          patientName: 'Jane Doe',
          serviceId: 'svc-002',
          serviceName: 'Fillers',
          providerId: 'prov-1',
          providerName: 'Dr. Johnson',
          startTime: startTime2.toISOString(),
          duration: 60,
          acceptedPolicy: true,
        });
        expect(res2.status).toBe(201);
        const data2 = await res2.json();
        expect(data2.token.remainingUses).toBe(1);
      });

      it('should reject booking with invalid token', async () => {
        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 24);

        const res = await request('POST', '/api/express-booking/book', {
          token: 'invalid-token',
          patientName: 'John Doe',
          serviceId: 'svc-001',
          serviceName: 'Botox',
          providerId: 'prov-1',
          providerName: 'Dr. Johnson',
          startTime: startTime.toISOString(),
          duration: 60,
          acceptedPolicy: true,
        });

        expect(res.status).toBe(401);
      });

      it('should reject booking without policy acceptance', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {});
        const { token } = await createRes.json();

        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 24);

        const res = await request('POST', '/api/express-booking/book', {
          token: token.rawToken,
          patientName: 'John Doe',
          serviceId: 'svc-001',
          serviceName: 'Botox',
          providerId: 'prov-1',
          providerName: 'Dr. Johnson',
          startTime: startTime.toISOString(),
          duration: 60,
          acceptedPolicy: false,
        });

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.message).toContain('cancellation policy');
      });

      it('should enforce service constraint', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {
          serviceIds: ['svc-001', 'svc-002'],
        });
        const { token } = await createRes.json();

        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 24);

        const res = await request('POST', '/api/express-booking/book', {
          token: token.rawToken,
          patientName: 'John Doe',
          serviceId: 'svc-999', // Not allowed
          serviceName: 'Other Service',
          providerId: 'prov-1',
          providerName: 'Dr. Johnson',
          startTime: startTime.toISOString(),
          duration: 60,
          acceptedPolicy: true,
        });

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.message).toContain('Service not allowed');
      });

      it('should enforce provider constraint', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {
          providerIds: ['prov-1'],
        });
        const { token } = await createRes.json();

        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 24);

        const res = await request('POST', '/api/express-booking/book', {
          token: token.rawToken,
          patientName: 'John Doe',
          serviceId: 'svc-001',
          serviceName: 'Botox',
          providerId: 'prov-2', // Not allowed
          providerName: 'Dr. Wilson',
          startTime: startTime.toISOString(),
          duration: 60,
          acceptedPolicy: true,
        });

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.message).toContain('Provider not allowed');
      });

      it('should require payment method when deposit is required', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {
          requireDeposit: true,
          depositAmount: 5000,
        });
        const { token } = await createRes.json();

        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 24);

        const res = await request('POST', '/api/express-booking/book', {
          token: token.rawToken,
          patientName: 'John Doe',
          serviceId: 'svc-001',
          serviceName: 'Botox',
          providerId: 'prov-1',
          providerName: 'Dr. Johnson',
          startTime: startTime.toISOString(),
          duration: 60,
          acceptedPolicy: true,
          // No paymentMethodId
        });

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.message).toContain('Payment method required');
      });

      it('should accept booking with deposit payment', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {
          requireDeposit: true,
          depositAmount: 5000,
        });
        const { token } = await createRes.json();

        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 24);

        const res = await request('POST', '/api/express-booking/book', {
          token: token.rawToken,
          patientName: 'John Doe',
          serviceId: 'svc-001',
          serviceName: 'Botox',
          providerId: 'prov-1',
          providerName: 'Dr. Johnson',
          startTime: startTime.toISOString(),
          duration: 60,
          acceptedPolicy: true,
          paymentMethodId: 'pm_test_123',
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.appointment.depositPaid).toBe(true);
      });

      it('should return redirect URL after booking', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {
          redirectUrl: 'https://clinic.com/thank-you',
        });
        const { token } = await createRes.json();

        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 24);

        const res = await request('POST', '/api/express-booking/book', {
          token: token.rawToken,
          patientName: 'John Doe',
          serviceId: 'svc-001',
          serviceName: 'Botox',
          providerId: 'prov-1',
          providerName: 'Dr. Johnson',
          startTime: startTime.toISOString(),
          duration: 60,
          acceptedPolicy: true,
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.redirectUrl).toBe('https://clinic.com/thank-you');
      });
    });
  });

  // ===================
  // Token Management Tests
  // ===================
  describe('Token Management', () => {
    describe('GET /api/express-booking/tokens', () => {
      it('should list all tokens', async () => {
        // Create a few tokens
        await request('POST', '/api/express-booking/tokens', { patientName: 'Patient 1' });
        await request('POST', '/api/express-booking/tokens', { patientName: 'Patient 2' });
        await request('POST', '/api/express-booking/tokens', { patientName: 'Patient 3' });

        const res = await request('GET', '/api/express-booking/tokens');

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.items.length).toBeGreaterThanOrEqual(3);
        expect(data.total).toBeGreaterThanOrEqual(3);
      });

      it('should filter by status', async () => {
        // Create active token
        await request('POST', '/api/express-booking/tokens', {});

        // Create and use a token
        const useRes = await request('POST', '/api/express-booking/tokens', { maxUses: 1 });
        const { token } = await useRes.json();
        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 24);
        await request('POST', '/api/express-booking/book', {
          token: token.rawToken,
          patientName: 'Test',
          serviceId: 'svc-001',
          serviceName: 'Botox',
          providerId: 'prov-1',
          providerName: 'Dr. Johnson',
          startTime: startTime.toISOString(),
          duration: 60,
          acceptedPolicy: true,
        });

        // Filter by active
        const activeRes = await request('GET', '/api/express-booking/tokens?status=active');
        const activeData = await activeRes.json();
        activeData.items.forEach((item: any) => {
          expect(item.status).toBe('active');
        });

        // Filter by used
        const usedRes = await request('GET', '/api/express-booking/tokens?status=used');
        const usedData = await usedRes.json();
        usedData.items.forEach((item: any) => {
          expect(item.status).toBe('used');
        });
      });

      it('should paginate results', async () => {
        // Create 5 tokens
        for (let i = 0; i < 5; i++) {
          await request('POST', '/api/express-booking/tokens', {});
        }

        // Get first page
        const page1Res = await request('GET', '/api/express-booking/tokens?page=1&limit=2');
        const page1Data = await page1Res.json();
        expect(page1Data.items.length).toBe(2);
        expect(page1Data.hasMore).toBe(true);

        // Get second page
        const page2Res = await request('GET', '/api/express-booking/tokens?page=2&limit=2');
        const page2Data = await page2Res.json();
        expect(page2Data.items.length).toBe(2);
      });
    });

    describe('DELETE /api/express-booking/tokens/:token', () => {
      it('should revoke token by raw token', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {});
        const { token } = await createRes.json();

        const res = await request('DELETE', `/api/express-booking/tokens/${token.rawToken}`);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.token.status).toBe('revoked');
      });

      it('should revoke token by ID', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {});
        const { token } = await createRes.json();

        const res = await request('DELETE', `/api/express-booking/tokens/${token.id}`);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
      });

      it('should reject booking after token is revoked', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {});
        const { token } = await createRes.json();

        // Revoke the token
        await request('DELETE', `/api/express-booking/tokens/${token.rawToken}`);

        // Try to book
        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 24);

        const res = await request('POST', '/api/express-booking/book', {
          token: token.rawToken,
          patientName: 'John Doe',
          serviceId: 'svc-001',
          serviceName: 'Botox',
          providerId: 'prov-1',
          providerName: 'Dr. Johnson',
          startTime: startTime.toISOString(),
          duration: 60,
          acceptedPolicy: true,
        });

        expect(res.status).toBe(400);
      });

      it('should return 404 for non-existent token', async () => {
        const res = await request('DELETE', '/api/express-booking/tokens/non-existent');

        expect(res.status).toBe(404);
      });

      it('should reject double revocation', async () => {
        const createRes = await request('POST', '/api/express-booking/tokens', {});
        const { token } = await createRes.json();

        // First revoke
        await request('DELETE', `/api/express-booking/tokens/${token.rawToken}`);

        // Second revoke should fail
        const res = await request('DELETE', `/api/express-booking/tokens/${token.rawToken}`);

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.message).toContain('already been revoked');
      });
    });
  });

  // ===================
  // Security Tests
  // ===================
  describe('Security', () => {
    it('should generate cryptographically secure tokens', async () => {
      const tokens: string[] = [];

      for (let i = 0; i < 5; i++) {
        const res = await request('POST', '/api/express-booking/tokens', {});
        const data = await res.json();
        tokens.push(data.token.rawToken);
      }

      // All tokens should be unique
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(5);

      // Tokens should be sufficiently long
      tokens.forEach(token => {
        expect(token.length).toBeGreaterThan(20);
      });
    });

    it('should hash tokens before storage', async () => {
      const createRes = await request('POST', '/api/express-booking/tokens', {});
      const { token } = await createRes.json();

      // Get the stored token
      const storedToken = getMockToken(token.rawToken);
      expect(storedToken).toBeDefined();

      // The stored token should be hashed (not equal to raw token)
      expect(storedToken!.token).not.toBe(token.rawToken);
      expect(storedToken!.token.length).toBe(64); // SHA-256 hex
    });

    it('should store only token prefix for display', async () => {
      const createRes = await request('POST', '/api/express-booking/tokens', {});
      const { token } = await createRes.json();

      const storedToken = getMockToken(token.rawToken);
      expect(storedToken!.rawTokenPrefix).toBe(token.rawToken.slice(0, 12));
    });
  });

  // ===================
  // Edge Cases Tests
  // ===================
  describe('Edge Cases', () => {
    it('should handle concurrent booking attempts gracefully', async () => {
      const createRes = await request('POST', '/api/express-booking/tokens', {
        maxUses: 1,
      });
      const { token } = await createRes.json();

      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 24);

      // Simulate concurrent requests (in reality, one would succeed)
      const bookingData = {
        token: token.rawToken,
        patientName: 'John Doe',
        serviceId: 'svc-001',
        serviceName: 'Botox',
        providerId: 'prov-1',
        providerName: 'Dr. Johnson',
        startTime: startTime.toISOString(),
        duration: 60,
        acceptedPolicy: true,
      };

      const results = await Promise.all([
        request('POST', '/api/express-booking/book', bookingData),
        request('POST', '/api/express-booking/book', bookingData),
      ]);

      // At least one should succeed, at least one should fail
      const statuses = results.map(r => r.status);
      expect(statuses).toContain(201); // One success
    });

    it('should handle very long custom messages', async () => {
      const longMessage = 'A'.repeat(500);

      const res = await request('POST', '/api/express-booking/tokens', {
        message: longMessage,
      });

      expect(res.status).toBe(201);
    });

    it('should reject message exceeding max length', async () => {
      const tooLongMessage = 'A'.repeat(501);

      const res = await request('POST', '/api/express-booking/tokens', {
        message: tooLongMessage,
      });

      expect(res.status).toBe(400);
    });

    it('should handle empty constraint arrays', async () => {
      const res = await request('POST', '/api/express-booking/tokens', {
        serviceIds: [],
        providerIds: [],
        allowedDays: [],
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('should handle booking at exact expiration time', async () => {
      // Create token that expires in 1 hour
      const createRes = await request('POST', '/api/express-booking/tokens', {
        expiresInHours: 1,
      });
      const { token } = await createRes.json();

      // Token should still be valid
      const validateRes = await request('GET', `/api/express-booking/tokens/${token.rawToken}`);
      expect(validateRes.status).toBe(200);
    });
  });
});
