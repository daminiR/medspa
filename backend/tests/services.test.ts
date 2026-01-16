/**
 * Services API Tests
 *
 * Tests for:
 * - List all services (public)
 * - Get single service (public)
 * - Filter services by category
 * - Create service (admin)
 * - Update service (admin)
 * - Deactivate service (admin)
 * - Get service categories
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import services, { servicesStore, Service } from '../src/routes/services';
import { sessionStore } from '../src/middleware/auth';
import { errorHandler } from '../src/middleware/error';

// Create test app with error handler
const app = new Hono();
app.route('/api/services', services);
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

// Mock admin user session
function createMockAdminSession(): string {
  const token = `admin-token-${Date.now()}`;
  const sessionId = `session-${Date.now()}`;

  sessionStore.set(sessionId, {
    id: sessionId,
    token,
    userId: 'admin-user-1',
    email: 'admin@test.com',
    role: 'admin',
    permissions: ['service:list', 'service:read', 'service:create', 'service:update', 'service:delete'],
    locationIds: ['loc-1'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
    lastActivityAt: new Date(),
  });

  return token;
}

// Mock owner user session
function createMockOwnerSession(): string {
  const token = `owner-token-${Date.now()}`;
  const sessionId = `session-${Date.now()}`;

  sessionStore.set(sessionId, {
    id: sessionId,
    token,
    userId: 'owner-user-1',
    email: 'owner@test.com',
    role: 'owner',
    permissions: ['service:list', 'service:read', 'service:create', 'service:update', 'service:delete'],
    locationIds: ['loc-1', 'loc-2'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    lastActivityAt: new Date(),
  });

  return token;
}

// Mock regular staff session (no admin permissions)
function createMockStaffSession(): string {
  const token = `staff-token-${Date.now()}`;
  const sessionId = `session-${Date.now()}`;

  sessionStore.set(sessionId, {
    id: sessionId,
    token,
    userId: 'staff-user-1',
    email: 'staff@test.com',
    role: 'staff',
    permissions: ['service:list', 'service:read'],
    locationIds: ['loc-1'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    lastActivityAt: new Date(),
  });

  return token;
}

// Reset mock data between tests
function resetServicesStore() {
  servicesStore.clear();

  // Add default test services
  servicesStore.set('s1', {
    id: 's1',
    name: 'Clinical Pilates',
    description: 'One-on-one clinical pilates session',
    category: 'physiotherapy',
    duration: 60,
    price: 12000,
    depositRequired: false,
    practitionerIds: ['1'],
    isActive: true,
    isInitialVisit: false,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  });

  servicesStore.set('s2', {
    id: 's2',
    name: '30 Minute Massage',
    description: 'Relaxing therapeutic massage',
    category: 'massage',
    duration: 30,
    price: 8000,
    depositRequired: false,
    practitionerIds: ['2'],
    isActive: true,
    isInitialVisit: false,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  });

  servicesStore.set('s3', {
    id: 's3',
    name: 'Lip Filler',
    description: 'Hyaluronic acid lip enhancement',
    category: 'aesthetics',
    duration: 45,
    scheduledDuration: 30,
    postTreatmentTime: 15,
    price: 35000,
    depositRequired: true,
    depositAmount: 5000,
    practitionerIds: ['4'],
    requiredCapabilities: ['injector-certified'],
    isActive: true,
    isInitialVisit: false,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  });

  servicesStore.set('s4', {
    id: 's4',
    name: 'Inactive Service',
    description: 'This service is inactive',
    category: 'wellness',
    duration: 30,
    price: 5000,
    depositRequired: false,
    practitionerIds: ['1'],
    isActive: false,
    isInitialVisit: false,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  });
}

describe('Services API', () => {
  beforeEach(() => {
    sessionStore.clear();
    resetServicesStore();
  });

  describe('GET /api/services/categories', () => {
    it('should return all service categories (public)', async () => {
      const res = await request('GET', '/api/services/categories');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.items[0]).toHaveProperty('id');
      expect(data.items[0]).toHaveProperty('name');
    });

    it('should include expected categories', async () => {
      const res = await request('GET', '/api/services/categories');
      const data = await res.json();

      const categoryIds = data.items.map((c: { id: string }) => c.id);
      expect(categoryIds).toContain('aesthetics');
      expect(categoryIds).toContain('massage');
      expect(categoryIds).toContain('physiotherapy');
    });
  });

  describe('GET /api/services', () => {
    it('should list all active services (public, no auth)', async () => {
      const res = await request('GET', '/api/services');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(data.total).toBeDefined();
      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);

      // Should only return active services
      data.items.forEach((s: Service) => {
        expect(s.isActive).toBe(true);
      });
    });

    it('should include inactive services for authenticated users', async () => {
      const adminToken = createMockAdminSession();

      const res = await request('GET', '/api/services', undefined, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      // With auth, should return all services
      expect(data.total).toBe(4);
    });

    it('should filter by category', async () => {
      const res = await request('GET', '/api/services?category=aesthetics');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
      data.items.forEach((s: Service) => {
        expect(s.category).toBe('aesthetics');
      });
    });

    it('should filter by multiple categories', async () => {
      const adminToken = createMockAdminSession();

      const res = await request(
        'GET',
        '/api/services?categories=aesthetics&categories=massage',
        undefined,
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(200);

      const data = await res.json();
      data.items.forEach((s: Service) => {
        expect(['aesthetics', 'massage']).toContain(s.category);
      });
    });

    it('should filter by practitioner ID', async () => {
      const res = await request('GET', '/api/services?practitionerId=4');

      expect(res.status).toBe(200);

      const data = await res.json();
      data.items.forEach((s: Service) => {
        expect(s.practitionerIds).toContain('4');
      });
    });

    it('should filter by price range', async () => {
      const res = await request('GET', '/api/services?minPrice=10000&maxPrice=40000');

      expect(res.status).toBe(200);

      const data = await res.json();
      data.items.forEach((s: Service) => {
        expect(s.price).toBeGreaterThanOrEqual(10000);
        expect(s.price).toBeLessThanOrEqual(40000);
      });
    });

    it('should filter by duration range', async () => {
      const res = await request('GET', '/api/services?minDuration=30&maxDuration=60');

      expect(res.status).toBe(200);

      const data = await res.json();
      data.items.forEach((s: Service) => {
        expect(s.duration).toBeGreaterThanOrEqual(30);
        expect(s.duration).toBeLessThanOrEqual(60);
      });
    });

    it('should search by name', async () => {
      const res = await request('GET', '/api/services?query=pilates');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.items[0].name.toLowerCase()).toContain('pilates');
    });

    it('should paginate results', async () => {
      const res = await request('GET', '/api/services?page=1&limit=2');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items.length).toBeLessThanOrEqual(2);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(2);
    });
  });

  describe('GET /api/services/:serviceId', () => {
    it('should return a single active service (public)', async () => {
      const res = await request('GET', '/api/services/s1');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.id).toBe('s1');
      expect(data.name).toBe('Clinical Pilates');
    });

    it('should return 404 for non-existent service', async () => {
      const res = await request('GET', '/api/services/non-existent');

      expect(res.status).toBe(404);

      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });

    it('should return 404 for inactive service (public, no auth)', async () => {
      const res = await request('GET', '/api/services/s4');

      expect(res.status).toBe(404);
    });

    it('should return inactive service for authenticated users', async () => {
      const adminToken = createMockAdminSession();

      const res = await request('GET', '/api/services/s4', undefined, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.id).toBe('s4');
      expect(data.isActive).toBe(false);
    });
  });

  describe('POST /api/services', () => {
    it('should create a new service (admin)', async () => {
      const adminToken = createMockAdminSession();

      const newService = {
        name: 'New Test Service',
        description: 'A brand new service',
        category: 'wellness',
        duration: 45,
        price: 15000,
        depositRequired: false,
        practitionerIds: ['1', '2'],
        isActive: true,
        isInitialVisit: false,
      };

      const res = await request('POST', '/api/services', newService, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.id).toBeDefined();
      expect(data.name).toBe('New Test Service');
      expect(data.price).toBe(15000);
      expect(data.practitionerIds).toEqual(['1', '2']);
    });

    it('should create service with deposit settings', async () => {
      const adminToken = createMockAdminSession();

      const newService = {
        name: 'Premium Service',
        category: 'aesthetics',
        duration: 60,
        price: 50000,
        depositRequired: true,
        depositAmount: 10000,
        practitionerIds: ['4'],
        isActive: true,
        isInitialVisit: true,
      };

      const res = await request('POST', '/api/services', newService, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.depositRequired).toBe(true);
      expect(data.depositAmount).toBe(10000);
      expect(data.isInitialVisit).toBe(true);
    });

    it('should reject creation without authentication', async () => {
      const newService = {
        name: 'Unauthorized Service',
        category: 'wellness',
        duration: 30,
        price: 5000,
        practitionerIds: ['1'],
      };

      const res = await request('POST', '/api/services', newService);

      expect(res.status).toBe(401);
    });

    it('should reject creation for non-admin users', async () => {
      const staffToken = createMockStaffSession();

      const newService = {
        name: 'Staff Service',
        category: 'wellness',
        duration: 30,
        price: 5000,
        practitionerIds: ['1'],
      };

      const res = await request('POST', '/api/services', newService, {
        Authorization: `Bearer ${staffToken}`,
      });

      expect(res.status).toBe(403);
    });

    it('should validate required fields', async () => {
      const adminToken = createMockAdminSession();

      const invalidService = {
        name: 'Missing Fields',
        // Missing required fields: category, duration, price, practitionerIds
      };

      const res = await request('POST', '/api/services', invalidService, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(400);
    });

    it('should validate duration range', async () => {
      const adminToken = createMockAdminSession();

      const invalidService = {
        name: 'Invalid Duration',
        category: 'wellness',
        duration: 1000, // Too long (max 480)
        price: 5000,
        practitionerIds: ['1'],
      };

      const res = await request('POST', '/api/services', invalidService, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/services/:serviceId', () => {
    it('should update an existing service (admin)', async () => {
      const adminToken = createMockAdminSession();

      const updates = {
        name: 'Updated Clinical Pilates',
        price: 15000,
      };

      const res = await request('PUT', '/api/services/s1', updates, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.name).toBe('Updated Clinical Pilates');
      expect(data.price).toBe(15000);
      expect(data.id).toBe('s1'); // ID should not change
    });

    it('should return 404 for non-existent service', async () => {
      const adminToken = createMockAdminSession();

      const res = await request(
        'PUT',
        '/api/services/non-existent',
        { name: 'Updated' },
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(404);
    });

    it('should allow owner to update', async () => {
      const ownerToken = createMockOwnerSession();

      const res = await request(
        'PUT',
        '/api/services/s1',
        { name: 'Owner Updated' },
        { Authorization: `Bearer ${ownerToken}` }
      );

      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /api/services/:serviceId', () => {
    it('should partially update a service', async () => {
      const adminToken = createMockAdminSession();

      const res = await request(
        'PATCH',
        '/api/services/s1',
        { price: 13000 },
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.price).toBe(13000);
      expect(data.name).toBe('Clinical Pilates'); // Unchanged
    });
  });

  describe('DELETE /api/services/:serviceId', () => {
    it('should deactivate a service (soft delete)', async () => {
      const adminToken = createMockAdminSession();

      const res = await request('DELETE', '/api/services/s1', undefined, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.message).toBe('Service deactivated');

      // Verify service is marked inactive
      const service = servicesStore.get('s1');
      expect(service?.isActive).toBe(false);
    });

    it('should return 404 for non-existent service', async () => {
      const adminToken = createMockAdminSession();

      const res = await request('DELETE', '/api/services/non-existent', undefined, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(404);
    });

    it('should reject deletion for non-owner/admin', async () => {
      const staffToken = createMockStaffSession();

      const res = await request('DELETE', '/api/services/s1', undefined, {
        Authorization: `Bearer ${staffToken}`,
      });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/services/:serviceId/providers', () => {
    it('should return providers for a service', async () => {
      const res = await request('GET', '/api/services/s1/providers');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.serviceId).toBe('s1');
      expect(data.providerIds).toBeDefined();
      expect(data.providerIds).toContain('1');
    });

    it('should return 404 for non-existent service', async () => {
      const res = await request('GET', '/api/services/non-existent/providers');

      expect(res.status).toBe(404);
    });
  });
});
