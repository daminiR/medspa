import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import crypto from 'crypto';
import consent, {
  clearStores,
  getConsentStore,
  getAuditLogStore,
} from './src/routes/messaging-consent.js';
import { errorHandler } from './src/middleware/error.js';

// Mock the auth middleware
vi.mock('./src/middleware/auth.js', () => ({
  sessionAuthMiddleware: vi.fn((c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json({ error: 'UNAUTHORIZED' }, 401);
    }
    c.set('user', {
      uid: 'test-user-123',
      email: 'test@example.com',
      role: 'admin',
      permissions: ['consent:read'],
    });
    return next();
  }),
  sessionStore: new Map(),
}));

vi.mock('@medical-spa/security', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

const app = new Hono();
app.route('/api/consent', consent);
app.onError(errorHandler);

async function request(method, path, body) {
  const req = new Request(`http://localhost${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer test-token',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return app.fetch(req);
}

describe('Debug Test', () => {
  it('should debug audit endpoint', async () => {
    const res = await request('GET', '/api/consent/audit');
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  });
});
