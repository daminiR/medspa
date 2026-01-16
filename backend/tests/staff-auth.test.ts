/**
 * Staff Authentication API Tests
 *
 * Tests for:
 * - Staff login/logout
 * - Token refresh
 * - PIN set/verify/delete
 * - PIN lockout mechanism
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Hono } from 'hono';
import staffAuth, { clearStores } from '../src/routes/staff-auth';
import { sessionStore } from '../src/middleware/auth';
import { errorHandler } from '../src/middleware/error';

// Create test app with error handler
const app = new Hono();
app.route('/api/auth/staff', staffAuth);
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

describe('Staff Authentication', () => {
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  beforeEach(() => {
    // Clear all stores between tests
    sessionStore.clear();
    clearStores();
  });

  describe('POST /api/auth/staff/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request('POST', '/api/auth/staff/login', {
        email: 'admin@luxemedspa.com',
        password: 'test123',
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe('admin@luxemedspa.com');
      expect(data.user.role).toBe('admin');
      expect(data.session.id).toBeDefined();
      expect(data.expiresIn).toBe(28800); // 8 hours

      // Store for later tests
      accessToken = data.accessToken;
      refreshToken = data.refreshToken;
      userId = data.user.id;
    });

    it('should return session with expiration time', async () => {
      const res = await request('POST', '/api/auth/staff/login', {
        email: 'test@test.com',
        password: 'test123',
      });

      const data = await res.json();
      const expiresAt = new Date(data.session.expiresAt);
      const now = new Date();

      // Should expire approximately 8 hours from now
      const diffHours = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      expect(diffHours).toBeGreaterThan(7.9);
      expect(diffHours).toBeLessThan(8.1);
    });
  });

  describe('POST /api/auth/staff/refresh', () => {
    beforeEach(async () => {
      // Login first
      const loginRes = await request('POST', '/api/auth/staff/login', {
        email: 'admin@luxemedspa.com',
        password: 'test123',
      });
      const loginData = await loginRes.json();
      accessToken = loginData.accessToken;
      refreshToken = loginData.refreshToken;
      userId = loginData.user.id;
    });

    it('should refresh token with valid refresh token', async () => {
      const res = await request('POST', '/api/auth/staff/refresh', {
        refreshToken,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();
      expect(data.accessToken).not.toBe(accessToken); // New token
      expect(data.refreshToken).not.toBe(refreshToken); // Rotated
    });

    it('should reject invalid refresh token', async () => {
      const res = await request('POST', '/api/auth/staff/refresh', {
        refreshToken: 'invalid-token',
      });

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('UNAUTHORIZED');
    });

    it('should reject used refresh token (one-time use)', async () => {
      // Use the refresh token once
      await request('POST', '/api/auth/staff/refresh', {
        refreshToken,
      });

      // Try to use it again
      const res = await request('POST', '/api/auth/staff/refresh', {
        refreshToken, // Same token
      });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/staff/logout', () => {
    beforeEach(async () => {
      const loginRes = await request('POST', '/api/auth/staff/login', {
        email: 'admin@luxemedspa.com',
        password: 'test123',
      });
      const loginData = await loginRes.json();
      accessToken = loginData.accessToken;
      userId = loginData.user.id;
    });

    it('should logout successfully', async () => {
      const res = await request('POST', '/api/auth/staff/logout', undefined, {
        Authorization: `Bearer ${accessToken}`,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('should invalidate token after logout', async () => {
      // Logout
      await request('POST', '/api/auth/staff/logout', undefined, {
        Authorization: `Bearer ${accessToken}`,
      });

      // Try to use the token
      const res = await request('GET', '/api/auth/staff/pin/status', undefined, {
        Authorization: `Bearer ${accessToken}`,
      });

      expect(res.status).toBe(401);
    });
  });

  describe('PIN Management', () => {
    beforeEach(async () => {
      const loginRes = await request('POST', '/api/auth/staff/login', {
        email: 'admin@luxemedspa.com',
        password: 'test123',
      });
      const loginData = await loginRes.json();
      accessToken = loginData.accessToken;
      userId = loginData.user.id;
    });

    describe('POST /api/auth/staff/pin/set', () => {
      it('should set PIN with valid 4-digit code', async () => {
        const res = await request(
          'POST',
          '/api/auth/staff/pin/set',
          { pin: '1234' },
          { Authorization: `Bearer ${accessToken}` }
        );

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
      });

      it('should set PIN with valid 6-digit code', async () => {
        const res = await request(
          'POST',
          '/api/auth/staff/pin/set',
          { pin: '123456' },
          { Authorization: `Bearer ${accessToken}` }
        );

        expect(res.status).toBe(200);
      });

      it('should reject PIN shorter than 4 digits', async () => {
        const res = await request(
          'POST',
          '/api/auth/staff/pin/set',
          { pin: '123' },
          { Authorization: `Bearer ${accessToken}` }
        );

        expect(res.status).toBe(400);
      });

      it('should reject PIN longer than 6 digits', async () => {
        const res = await request(
          'POST',
          '/api/auth/staff/pin/set',
          { pin: '1234567' },
          { Authorization: `Bearer ${accessToken}` }
        );

        expect(res.status).toBe(400);
      });

      it('should reject non-numeric PIN', async () => {
        const res = await request(
          'POST',
          '/api/auth/staff/pin/set',
          { pin: 'abcd' },
          { Authorization: `Bearer ${accessToken}` }
        );

        expect(res.status).toBe(400);
      });

      it('should require authentication', async () => {
        const res = await request('POST', '/api/auth/staff/pin/set', {
          pin: '1234',
        });

        expect(res.status).toBe(401);
      });
    });

    describe('POST /api/auth/staff/pin/verify', () => {
      beforeEach(async () => {
        // Set a PIN
        await request(
          'POST',
          '/api/auth/staff/pin/set',
          { pin: '5678' },
          { Authorization: `Bearer ${accessToken}` }
        );
      });

      it('should verify correct PIN', async () => {
        const res = await request('POST', '/api/auth/staff/pin/verify', {
          userId,
          pin: '5678',
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.accessToken).toBeDefined();
      });

      it('should reject incorrect PIN', async () => {
        const res = await request('POST', '/api/auth/staff/pin/verify', {
          userId,
          pin: '0000',
        });

        expect(res.status).toBe(401);
        const data = await res.json();
        expect(data.message).toContain('Invalid PIN');
      });

      it('should return remaining attempts after failed verify', async () => {
        const res = await request('POST', '/api/auth/staff/pin/verify', {
          userId,
          pin: '0000',
        });

        const data = await res.json();
        expect(data.message).toContain('2 attempts remaining');
      });
    });

    describe('PIN Lockout', () => {
      beforeEach(async () => {
        // Set a PIN
        await request(
          'POST',
          '/api/auth/staff/pin/set',
          { pin: '5678' },
          { Authorization: `Bearer ${accessToken}` }
        );
      });

      it('should lock out after 3 failed attempts', async () => {
        // Fail 3 times
        for (let i = 0; i < 3; i++) {
          await request('POST', '/api/auth/staff/pin/verify', {
            userId,
            pin: '0000',
          });
        }

        // 4th attempt should show lockout
        const res = await request('POST', '/api/auth/staff/pin/verify', {
          userId,
          pin: '5678', // Even correct PIN should be locked
        });

        expect(res.status).toBe(429);
        const data = await res.json();
        expect(data.message).toContain('PIN locked');
        expect(data.message).toContain('5 minutes');
      });

      it('should reject even correct PIN during lockout', async () => {
        // Fail 3 times to trigger lockout
        for (let i = 0; i < 3; i++) {
          await request('POST', '/api/auth/staff/pin/verify', {
            userId,
            pin: '0000',
          });
        }

        // Try with correct PIN
        const res = await request('POST', '/api/auth/staff/pin/verify', {
          userId,
          pin: '5678',
        });

        expect(res.status).toBe(429);
      });
    });

    describe('GET /api/auth/staff/pin/status', () => {
      it('should show hasPin=false initially', async () => {
        const res = await request('GET', '/api/auth/staff/pin/status', undefined, {
          Authorization: `Bearer ${accessToken}`,
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.hasPin).toBe(false);
      });

      it('should show hasPin=true after setting PIN', async () => {
        await request(
          'POST',
          '/api/auth/staff/pin/set',
          { pin: '1234' },
          { Authorization: `Bearer ${accessToken}` }
        );

        const res = await request('GET', '/api/auth/staff/pin/status', undefined, {
          Authorization: `Bearer ${accessToken}`,
        });

        const data = await res.json();
        expect(data.hasPin).toBe(true);
      });
    });

    describe('DELETE /api/auth/staff/pin', () => {
      beforeEach(async () => {
        await request(
          'POST',
          '/api/auth/staff/pin/set',
          { pin: '1234' },
          { Authorization: `Bearer ${accessToken}` }
        );
      });

      it('should delete PIN', async () => {
        const res = await request('DELETE', '/api/auth/staff/pin', undefined, {
          Authorization: `Bearer ${accessToken}`,
        });

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
      });

      it('should show hasPin=false after deletion', async () => {
        await request('DELETE', '/api/auth/staff/pin', undefined, {
          Authorization: `Bearer ${accessToken}`,
        });

        const res = await request('GET', '/api/auth/staff/pin/status', undefined, {
          Authorization: `Bearer ${accessToken}`,
        });

        const data = await res.json();
        expect(data.hasPin).toBe(false);
      });
    });
  });
});
