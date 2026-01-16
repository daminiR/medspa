/**
 * Patient Authentication API Tests
 *
 * Tests for:
 * - Magic link send/verify
 * - SMS OTP send/verify
 * - Patient registration
 * - Session management (refresh, me, logout)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import patientAuth, { clearStores } from '../src/routes/patient-auth';
import { sessionStore } from '../src/middleware/auth';
import { errorHandler } from '../src/middleware/error';

// Create test app with error handler
const app = new Hono();
app.route('/api/auth/patient', patientAuth);
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

describe('Patient Authentication', () => {
  beforeEach(() => {
    // Clear all stores between tests
    sessionStore.clear();
    clearStores();
  });

  // ===================
  // Magic Link Tests
  // ===================
  describe('Magic Link Authentication', () => {
    describe('POST /api/auth/patient/magic-link/send', () => {
      it('should send magic link to new user', async () => {
        const res = await request('POST', '/api/auth/patient/magic-link/send', {
          email: 'new@example.com',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.isNewUser).toBe(true);
        expect(data.message).toContain('email');
      });

      it('should send magic link to existing user', async () => {
        // First, register a user
        await request('POST', '/api/auth/patient/register', {
          firstName: 'Test',
          lastName: 'User',
          email: 'existing@example.com',
          phone: '5551234567',
          dateOfBirth: '1990-01-01',
        });

        // Now send magic link
        const res = await request('POST', '/api/auth/patient/magic-link/send', {
          email: 'existing@example.com',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.isNewUser).toBe(false);
      });

      it('should reject invalid email', async () => {
        const res = await request('POST', '/api/auth/patient/magic-link/send', {
          email: 'not-an-email',
        });

        expect(res.status).toBe(400);
      });

      it('should rate limit excessive requests', async () => {
        const email = 'ratelimit@example.com';

        // Send 3 requests (the limit)
        for (let i = 0; i < 3; i++) {
          await request('POST', '/api/auth/patient/magic-link/send', { email });
        }

        // 4th request should fail
        const res = await request('POST', '/api/auth/patient/magic-link/send', { email });

        expect(res.status).toBe(429);
      });
    });

    describe('POST /api/auth/patient/magic-link/verify', () => {
      it('should reject invalid token', async () => {
        const res = await request('POST', '/api/auth/patient/magic-link/verify', {
          token: 'invalid-token',
          email: 'test@example.com',
        });

        expect(res.status).toBe(401);
      });

      it('should reject mismatched email', async () => {
        // Send magic link to one email
        await request('POST', '/api/auth/patient/magic-link/send', {
          email: 'original@example.com',
        });

        // Try to verify with different email (token won't match anyway)
        const res = await request('POST', '/api/auth/patient/magic-link/verify', {
          token: 'some-token',
          email: 'different@example.com',
        });

        expect(res.status).toBe(401);
      });
    });
  });

  // ===================
  // SMS OTP Tests
  // ===================
  describe('SMS OTP Authentication', () => {
    describe('POST /api/auth/patient/sms-otp/send', () => {
      it('should send OTP to phone', async () => {
        const res = await request('POST', '/api/auth/patient/sms-otp/send', {
          phone: '5551234567',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.message).toContain('Verification code');
      });

      it('should accept various phone formats', async () => {
        const phones = [
          '5551234567',
          '555-123-4567',
          '(555) 123-4567',
          '+1 555 123 4567',
        ];

        for (const phone of phones) {
          clearStores(); // Reset rate limits
          const res = await request('POST', '/api/auth/patient/sms-otp/send', { phone });
          expect(res.status).toBe(200);
        }
      });

      it('should reject invalid phone', async () => {
        const res = await request('POST', '/api/auth/patient/sms-otp/send', {
          phone: '123',
        });

        expect(res.status).toBe(400);
      });

      it('should rate limit excessive requests', async () => {
        const phone = '5559999999';

        // Send 3 requests
        for (let i = 0; i < 3; i++) {
          await request('POST', '/api/auth/patient/sms-otp/send', { phone });
        }

        // 4th should fail
        const res = await request('POST', '/api/auth/patient/sms-otp/send', { phone });
        expect(res.status).toBe(429);
      });
    });

    describe('POST /api/auth/patient/sms-otp/verify', () => {
      it('should reject without sending OTP first', async () => {
        const res = await request('POST', '/api/auth/patient/sms-otp/verify', {
          phone: '5551234567',
          code: '123456',
        });

        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.message).toContain('No verification code');
      });

      it('should reject invalid code format', async () => {
        // Send OTP first
        await request('POST', '/api/auth/patient/sms-otp/send', {
          phone: '5551234567',
        });

        // Try with wrong format
        const res = await request('POST', '/api/auth/patient/sms-otp/verify', {
          phone: '5551234567',
          code: '12345', // Only 5 digits
        });

        expect(res.status).toBe(400);
      });

      it('should reject wrong code and track attempts', async () => {
        // Send OTP
        await request('POST', '/api/auth/patient/sms-otp/send', {
          phone: '5551234567',
        });

        // Try wrong code
        const res = await request('POST', '/api/auth/patient/sms-otp/verify', {
          phone: '5551234567',
          code: '000000',
        });

        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.message).toContain('Invalid code');
        expect(data.message).toContain('attempts remaining');
      });

      it('should lock out after max attempts', async () => {
        // Send OTP
        await request('POST', '/api/auth/patient/sms-otp/send', {
          phone: '5551234567',
        });

        // Try wrong code 3 times (the max allowed)
        for (let i = 0; i < 3; i++) {
          const res = await request('POST', '/api/auth/patient/sms-otp/verify', {
            phone: '5551234567',
            code: '000000',
          });
          expect(res.status).toBe(401);
        }

        // 4th attempt should be locked out (returns 429)
        const res = await request('POST', '/api/auth/patient/sms-otp/verify', {
          phone: '5551234567',
          code: '000000',
        });
        expect(res.status).toBe(429);
        const data = await res.json();
        expect(data.message).toContain('Too many failed attempts');
      });
    });
  });

  // ===================
  // Registration Tests
  // ===================
  describe('Patient Registration', () => {
    describe('POST /api/auth/patient/register', () => {
      it('should register new patient', async () => {
        const res = await request('POST', '/api/auth/patient/register', {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '5551234567',
          dateOfBirth: '1990-05-15',
        });

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.user.firstName).toBe('John');
        expect(data.user.lastName).toBe('Doe');
        expect(data.user.email).toBe('john.doe@example.com');
      });

      it('should reject duplicate email', async () => {
        // Register first
        await request('POST', '/api/auth/patient/register', {
          firstName: 'First',
          lastName: 'User',
          email: 'duplicate@example.com',
          phone: '5551111111',
          dateOfBirth: '1990-01-01',
        });

        // Try to register again
        const res = await request('POST', '/api/auth/patient/register', {
          firstName: 'Second',
          lastName: 'User',
          email: 'duplicate@example.com',
          phone: '5552222222',
          dateOfBirth: '1995-01-01',
        });

        expect(res.status).toBe(409);
        const data = await res.json();
        expect(data.message).toContain('already exists');
      });

      it('should reject missing required fields', async () => {
        const res = await request('POST', '/api/auth/patient/register', {
          firstName: 'John',
          // Missing lastName, email, phone, dateOfBirth
        });

        expect(res.status).toBe(400);
      });
    });
  });

  // ===================
  // Session Management Tests
  // ===================
  describe('Session Management', () => {
    // Helper to create a logged-in session
    async function createSession() {
      // Register user
      await request('POST', '/api/auth/patient/register', {
        firstName: 'Session',
        lastName: 'Test',
        email: 'session@example.com',
        phone: '5551234567',
        dateOfBirth: '1990-01-01',
      });

      // Send magic link
      await request('POST', '/api/auth/patient/magic-link/send', {
        email: 'session@example.com',
      });

      // We can't verify without the actual token, but we can test the refresh flow
      // by manually checking sessionStore after a simulated login
      return null;
    }

    describe('POST /api/auth/patient/refresh', () => {
      it('should reject invalid refresh token', async () => {
        const res = await request('POST', '/api/auth/patient/refresh', {
          refreshToken: 'invalid-token',
        });

        expect(res.status).toBe(401);
      });
    });

    describe('GET /api/auth/patient/me', () => {
      it('should reject without auth', async () => {
        const res = await request('GET', '/api/auth/patient/me');

        expect(res.status).toBe(401);
      });
    });

    describe('POST /api/auth/patient/logout', () => {
      it('should reject without auth', async () => {
        const res = await request('POST', '/api/auth/patient/logout');

        expect(res.status).toBe(401);
      });
    });
  });
});
