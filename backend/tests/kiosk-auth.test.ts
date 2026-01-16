/**
 * Kiosk Authentication API Tests
 *
 * Tests for:
 * - QR code token generation
 * - Token validation
 * - Check-in processing
 * - Session polling for mobile-initiated check-in
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import kioskAuth, { clearStores, addMockAppointment } from '../src/routes/kiosk-auth';
import { errorHandler } from '../src/middleware/error';

// Create test app with error handler
const app = new Hono();
app.route('/api/kiosk', kioskAuth);
app.onError(errorHandler);

// Helper to make requests
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
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return app.fetch(req);
}

describe('Kiosk Authentication', () => {
  beforeEach(() => {
    // Clear all stores and reinitialize mock data between tests
    clearStores();
  });

  // ===================
  // QR Code Generation Tests
  // ===================
  describe('QR Code Generation', () => {
    describe('POST /api/kiosk/generate-qr', () => {
      it('should generate QR token for valid appointment', async () => {
        const res = await request('POST', '/api/kiosk/generate-qr', {
          appointmentId: 'apt-001',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.token).toBeDefined();
        expect(data.token.length).toBe(64); // 32 bytes hex
        expect(data.checkInUrl).toContain('/check-in/');
        expect(data.expiresAt).toBeDefined();
        expect(data.expiresIn).toBe(600); // 10 minutes
        expect(data.appointment).toBeDefined();
        expect(data.appointment.patientName).toBe('Sarah Johnson');
      });

      it('should reject non-existent appointment', async () => {
        const res = await request('POST', '/api/kiosk/generate-qr', {
          appointmentId: 'non-existent',
        });

        expect(res.status).toBe(404);
      });

      it('should reject already checked-in appointment', async () => {
        // First, check in the appointment
        await request('POST', '/api/kiosk/check-in', {
          appointmentId: 'apt-001',
        });

        // Try to generate QR for checked-in appointment
        const res = await request('POST', '/api/kiosk/generate-qr', {
          appointmentId: 'apt-001',
        });

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.message).toContain('already checked in');
      });

      it('should rate limit excessive QR generation', async () => {
        // Generate 10 QR codes (the limit)
        for (let i = 0; i < 10; i++) {
          await request('POST', '/api/kiosk/generate-qr', {
            appointmentId: 'apt-002',
          });
        }

        // 11th should fail
        const res = await request('POST', '/api/kiosk/generate-qr', {
          appointmentId: 'apt-002',
        });

        expect(res.status).toBe(429);
      });
    });
  });

  // ===================
  // Token Validation Tests
  // ===================
  describe('Token Validation', () => {
    describe('POST /api/kiosk/validate-token', () => {
      it('should validate a valid token', async () => {
        // First generate a token
        const genRes = await request('POST', '/api/kiosk/generate-qr', {
          appointmentId: 'apt-001',
        });
        const { token } = await genRes.json();

        // Validate the token
        const res = await request('POST', '/api/kiosk/validate-token', {
          token,
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.valid).toBe(true);
        expect(data.appointment).toBeDefined();
        expect(data.appointment.id).toBe('apt-001');
      });

      it('should reject invalid token', async () => {
        const res = await request('POST', '/api/kiosk/validate-token', {
          token: 'invalid-token-12345',
        });

        expect(res.status).toBe(401);
      });

      it('should reject already used token', async () => {
        // Generate and use a token
        const genRes = await request('POST', '/api/kiosk/generate-qr', {
          appointmentId: 'apt-001',
        });
        const { token } = await genRes.json();

        // Use the token for check-in
        await request('POST', '/api/kiosk/check-in', { token });

        // Try to validate the used token
        const res = await request('POST', '/api/kiosk/validate-token', {
          token,
        });

        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.message).toContain('already been used');
      });
    });
  });

  // ===================
  // Check-In Tests
  // ===================
  describe('Check-In Processing', () => {
    describe('POST /api/kiosk/check-in', () => {
      it('should check in with valid token', async () => {
        // Generate token
        const genRes = await request('POST', '/api/kiosk/generate-qr', {
          appointmentId: 'apt-001',
        });
        const { token } = await genRes.json();

        // Check in
        const res = await request('POST', '/api/kiosk/check-in', { token });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.message).toContain('Successfully checked in');
        expect(data.appointment.status).toBe('arrived');
        expect(data.appointment.checkedInAt).toBeDefined();
        expect(data.queuePosition).toBeDefined();
        expect(data.estimatedWaitMinutes).toBeDefined();
      });

      it('should check in with direct appointment ID', async () => {
        const res = await request('POST', '/api/kiosk/check-in', {
          appointmentId: 'apt-002',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.appointment.id).toBe('apt-002');
        expect(data.appointment.status).toBe('arrived');
      });

      it('should handle already checked-in appointment gracefully', async () => {
        // Check in first time
        await request('POST', '/api/kiosk/check-in', {
          appointmentId: 'apt-001',
        });

        // Try to check in again
        const res = await request('POST', '/api/kiosk/check-in', {
          appointmentId: 'apt-001',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.alreadyCheckedIn).toBe(true);
      });

      it('should reject check-in without token or appointmentId', async () => {
        const res = await request('POST', '/api/kiosk/check-in', {});

        expect(res.status).toBe(400);
      });

      it('should prevent token reuse (replay attack)', async () => {
        // Generate token
        const genRes = await request('POST', '/api/kiosk/generate-qr', {
          appointmentId: 'apt-001',
        });
        const { token } = await genRes.json();

        // First check-in should succeed
        const res1 = await request('POST', '/api/kiosk/check-in', { token });
        expect(res1.status).toBe(200);

        // Second check-in with same token should fail
        const res2 = await request('POST', '/api/kiosk/check-in', { token });
        expect(res2.status).toBe(401);
        const data = await res2.json();
        expect(data.message).toContain('already been used');
      });

      it('should reject non-existent appointment', async () => {
        const res = await request('POST', '/api/kiosk/check-in', {
          appointmentId: 'non-existent',
        });

        expect(res.status).toBe(404);
      });
    });
  });

  // ===================
  // Kiosk Session Tests (Mobile-Initiated Check-In)
  // ===================
  describe('Kiosk Session (Mobile-Initiated)', () => {
    describe('POST /api/kiosk/session/create', () => {
      it('should create a kiosk session', async () => {
        const res = await request('POST', '/api/kiosk/session/create', {
          kioskId: 'kiosk-001',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.sessionId).toBeDefined();
        expect(data.sessionId).toContain('kiosk-session-');
        expect(data.sessionUrl).toContain('/check-in/session/');
        expect(data.expiresAt).toBeDefined();
        expect(data.expiresIn).toBe(90); // 90 seconds
      });
    });

    describe('GET /api/kiosk/session/:sessionId', () => {
      it('should return pending status for new session', async () => {
        // Create session
        const createRes = await request('POST', '/api/kiosk/session/create', {
          kioskId: 'kiosk-001',
        });
        const { sessionId } = await createRes.json();

        // Poll session
        const res = await request('GET', `/api/kiosk/session/${sessionId}`);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.status).toBe('pending');
        expect(data.remainingSeconds).toBeDefined();
      });

      it('should return 404 for non-existent session', async () => {
        const res = await request('GET', '/api/kiosk/session/non-existent-session');

        expect(res.status).toBe(404);
      });
    });

    describe('POST /api/kiosk/session/confirm', () => {
      it('should confirm session and check in patient', async () => {
        // Create session
        const createRes = await request('POST', '/api/kiosk/session/create', {
          kioskId: 'kiosk-001',
        });
        const { sessionId } = await createRes.json();

        // Confirm check-in
        const res = await request('POST', '/api/kiosk/session/confirm', {
          sessionId,
          patientId: 'pat-001',
          appointmentId: 'apt-001',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.message).toContain('Check-in confirmed');
        expect(data.appointment.status).toBe('arrived');
        expect(data.queuePosition).toBeDefined();
      });

      it('should return confirmed status when polling after confirm', async () => {
        // Create session
        const createRes = await request('POST', '/api/kiosk/session/create', {
          kioskId: 'kiosk-001',
        });
        const { sessionId } = await createRes.json();

        // Confirm check-in
        await request('POST', '/api/kiosk/session/confirm', {
          sessionId,
          patientId: 'pat-001',
          appointmentId: 'apt-001',
        });

        // Poll should return confirmed
        const res = await request('GET', `/api/kiosk/session/${sessionId}`);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.status).toBe('confirmed');
        expect(data.appointmentId).toBe('apt-001');
        expect(data.patientName).toBe('Sarah Johnson');
      });

      it('should reject confirm with wrong patient', async () => {
        // Create session
        const createRes = await request('POST', '/api/kiosk/session/create', {
          kioskId: 'kiosk-001',
        });
        const { sessionId } = await createRes.json();

        // Try to confirm with wrong patient
        const res = await request('POST', '/api/kiosk/session/confirm', {
          sessionId,
          patientId: 'wrong-patient',
          appointmentId: 'apt-001',
        });

        expect(res.status).toBe(403);
      });

      it('should reject double confirmation', async () => {
        // Create session
        const createRes = await request('POST', '/api/kiosk/session/create', {
          kioskId: 'kiosk-001',
        });
        const { sessionId } = await createRes.json();

        // First confirm
        await request('POST', '/api/kiosk/session/confirm', {
          sessionId,
          patientId: 'pat-001',
          appointmentId: 'apt-001',
        });

        // Second confirm should fail (session already confirmed)
        const res = await request('POST', '/api/kiosk/session/confirm', {
          sessionId,
          patientId: 'pat-001',
          appointmentId: 'apt-001',
        });

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.message).toContain('already confirmed');
      });
    });
  });

  // ===================
  // Appointments List Tests
  // ===================
  describe('Appointments List', () => {
    describe('GET /api/kiosk/appointments', () => {
      it('should return today\'s appointments', async () => {
        const res = await request('GET', '/api/kiosk/appointments');

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.appointments).toBeDefined();
        expect(Array.isArray(data.appointments)).toBe(true);
        expect(data.count).toBeGreaterThan(0);
      });

      it('should include appointment details', async () => {
        const res = await request('GET', '/api/kiosk/appointments');

        expect(res.status).toBe(200);
        const data = await res.json();

        if (data.appointments.length > 0) {
          const apt = data.appointments[0];
          expect(apt.id).toBeDefined();
          expect(apt.patientName).toBeDefined();
          expect(apt.serviceName).toBeDefined();
          expect(apt.scheduledTime).toBeDefined();
          expect(apt.status).toBeDefined();
        }
      });
    });
  });
});
