/**
 * Providers API Tests
 *
 * Tests for:
 * - List all providers (public)
 * - Get single provider (public)
 * - Get provider schedule (staff)
 * - Update provider schedule (admin)
 * - Get provider availability (public)
 * - Get provider services (public)
 * - Create provider (admin)
 * - Update provider (admin)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import providers, { providersStore, appointmentsStore, Provider } from '../src/routes/providers';
import { servicesStore } from '../src/routes/services';
import { sessionStore } from '../src/middleware/auth';
import { errorHandler } from '../src/middleware/error';

// Create test app with error handler
const app = new Hono();
app.route('/api/providers', providers);
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
    permissions: ['provider:list', 'provider:read', 'provider:create', 'provider:update', 'provider:delete'],
    locationIds: ['loc-1'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
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
    permissions: ['provider:list', 'provider:read', 'provider:create', 'provider:update', 'provider:delete'],
    locationIds: ['loc-1', 'loc-2'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    lastActivityAt: new Date(),
  });

  return token;
}

// Mock manager user session
function createMockManagerSession(): string {
  const token = `manager-token-${Date.now()}`;
  const sessionId = `session-${Date.now()}`;

  sessionStore.set(sessionId, {
    id: sessionId,
    token,
    userId: 'manager-user-1',
    email: 'manager@test.com',
    role: 'manager',
    permissions: ['provider:list', 'provider:read'],
    locationIds: ['loc-1'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    lastActivityAt: new Date(),
  });

  return token;
}

// Mock staff user session (limited permissions)
function createMockStaffSession(): string {
  const token = `staff-token-${Date.now()}`;
  const sessionId = `session-${Date.now()}`;

  sessionStore.set(sessionId, {
    id: sessionId,
    token,
    userId: 'staff-user-1',
    email: 'staff@test.com',
    role: 'staff',
    permissions: ['provider:list', 'provider:read'],
    locationIds: ['loc-1'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    lastActivityAt: new Date(),
  });

  return token;
}

// Reset mock data between tests
function resetStores() {
  providersStore.clear();
  appointmentsStore.clear();
  servicesStore.clear();

  // Add default test providers
  providersStore.set('1', {
    id: '1',
    firstName: 'Jo-Ellen',
    lastName: 'McKay',
    title: 'PT',
    email: 'jo-ellen@medispa.com',
    phone: '(555) 100-0001',
    bio: 'Specialized in Clinical Pilates',
    serviceIds: ['s1'],
    workDays: [1, 2, 3, 4, 5],
    startTime: '08:00',
    endTime: '17:00',
    certifications: [],
    specialties: ['physiotherapy'],
    experienceLevel: { 'clinical-pilates': 'expert' },
    initials: 'JM',
    status: 'active',
    locationIds: ['loc-1'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  });

  providersStore.set('2', {
    id: '2',
    firstName: 'Susan',
    lastName: 'Lo',
    title: 'RN',
    email: 'susan@medispa.com',
    phone: '(555) 100-0002',
    bio: 'Aesthetic nurse specializing in injectables',
    serviceIds: ['s2', 's3'],
    workDays: [2, 3, 4, 5, 6],
    startTime: '10:00',
    endTime: '19:00',
    staggerOnlineBooking: 30,
    certifications: ['injector-certified', 'laser-certified'],
    specialties: ['facial-aesthetics', 'injection-therapy'],
    experienceLevel: { 'botox': 'expert', 'fillers': 'expert' },
    initials: 'SL',
    status: 'active',
    locationIds: ['loc-1'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  });

  providersStore.set('3', {
    id: '3',
    firstName: 'Inactive',
    lastName: 'Provider',
    email: 'inactive@medispa.com',
    serviceIds: [],
    workDays: [],
    certifications: [],
    specialties: [],
    initials: 'IP',
    status: 'inactive',
    locationIds: ['loc-1'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  });

  // Add test services
  servicesStore.set('s1', {
    id: 's1',
    name: 'Clinical Pilates',
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
    name: 'Lip Filler',
    category: 'aesthetics',
    duration: 45,
    scheduledDuration: 30,
    price: 35000,
    depositRequired: true,
    practitionerIds: ['2'],
    isActive: true,
    isInitialVisit: false,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  });

  servicesStore.set('s3', {
    id: 's3',
    name: 'Botox',
    category: 'aesthetics',
    duration: 30,
    price: 25000,
    depositRequired: true,
    practitionerIds: ['2'],
    isActive: true,
    isInitialVisit: false,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  });

  // Add test appointments for availability testing
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateStr = today.toISOString().split('T')[0];

  appointmentsStore.set('apt-1', {
    id: 'apt-1',
    providerId: '2',
    startTime: new Date(`${dateStr}T10:00:00`),
    endTime: new Date(`${dateStr}T10:45:00`),
    status: 'scheduled',
  });

  appointmentsStore.set('apt-2', {
    id: 'apt-2',
    providerId: '2',
    startTime: new Date(`${dateStr}T14:00:00`),
    endTime: new Date(`${dateStr}T15:00:00`),
    status: 'scheduled',
  });
}

describe('Providers API', () => {
  beforeEach(() => {
    sessionStore.clear();
    resetStores();
  });

  describe('GET /api/providers', () => {
    it('should list all active providers (public, no auth)', async () => {
      const res = await request('GET', '/api/providers');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(data.total).toBeDefined();
      expect(data.page).toBe(1);

      // Should only return active providers
      data.items.forEach((p: any) => {
        // Public response should have limited fields
        expect(p.firstName).toBeDefined();
        expect(p.lastName).toBeDefined();
        expect(p.fullName).toBeDefined();
        // Should NOT include sensitive data for public
        expect(p.email).toBeUndefined();
        expect(p.phone).toBeUndefined();
      });
    });

    it('should include contact info for authenticated users', async () => {
      const staffToken = createMockStaffSession();

      const res = await request('GET', '/api/providers', undefined, {
        Authorization: `Bearer ${staffToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      // Authenticated users see more data
      expect(data.items[0].email).toBeDefined();
    });

    it('should include inactive providers for authenticated users', async () => {
      const adminToken = createMockAdminSession();

      const res = await request('GET', '/api/providers', undefined, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.total).toBe(3); // All providers including inactive
    });

    it('should filter by status', async () => {
      const adminToken = createMockAdminSession();

      const res = await request('GET', '/api/providers?status=inactive', undefined, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      data.items.forEach((p: any) => {
        expect(p.status).toBe('inactive');
      });
    });

    it('should filter by service ID', async () => {
      const res = await request('GET', '/api/providers?serviceId=s2');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
      // Susan Lo offers s2
      expect(data.items.find((p: any) => p.firstName === 'Susan')).toBeDefined();
    });

    it('should filter by location', async () => {
      const res = await request('GET', '/api/providers?locationId=loc-1');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
    });

    it('should filter by certification', async () => {
      const adminToken = createMockAdminSession();

      const res = await request('GET', '/api/providers?certification=injector-certified', undefined, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.items[0].firstName).toBe('Susan');
    });

    it('should filter by specialty', async () => {
      const adminToken = createMockAdminSession();

      const res = await request('GET', '/api/providers?specialty=facial-aesthetics', undefined, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
    });

    it('should search by name', async () => {
      const res = await request('GET', '/api/providers?query=susan');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items.length).toBe(1);
      expect(data.items[0].firstName).toBe('Susan');
    });

    it('should paginate results', async () => {
      const res = await request('GET', '/api/providers?page=1&limit=1');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items.length).toBe(1);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(1);
      expect(data.hasMore).toBe(true);
    });
  });

  describe('GET /api/providers/:providerId', () => {
    it('should return a single active provider (public)', async () => {
      const res = await request('GET', '/api/providers/1');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.id).toBe('1');
      expect(data.firstName).toBe('Jo-Ellen');
      expect(data.fullName).toBe('Jo-Ellen McKay');
      // Public should not see sensitive data
      expect(data.email).toBeUndefined();
    });

    it('should return full data for authenticated users', async () => {
      const staffToken = createMockStaffSession();

      const res = await request('GET', '/api/providers/1', undefined, {
        Authorization: `Bearer ${staffToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.email).toBe('jo-ellen@medispa.com');
      expect(data.phone).toBe('(555) 100-0001');
    });

    it('should return 404 for non-existent provider', async () => {
      const res = await request('GET', '/api/providers/non-existent');

      expect(res.status).toBe(404);
    });

    it('should return 404 for inactive provider (public)', async () => {
      const res = await request('GET', '/api/providers/3');

      expect(res.status).toBe(404);
    });

    it('should return inactive provider for authenticated users', async () => {
      const adminToken = createMockAdminSession();

      const res = await request('GET', '/api/providers/3', undefined, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.status).toBe('inactive');
    });
  });

  describe('GET /api/providers/:providerId/services', () => {
    it('should return services for a provider', async () => {
      const res = await request('GET', '/api/providers/2/services');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.providerId).toBe('2');
      expect(data.items).toBeDefined();
      expect(data.items.length).toBe(2);
      expect(data.items.map((s: any) => s.id)).toContain('s2');
    });

    it('should return 404 for non-existent provider', async () => {
      const res = await request('GET', '/api/providers/non-existent/services');

      expect(res.status).toBe(404);
    });

    it('should only return active services', async () => {
      // Deactivate a service
      const service = servicesStore.get('s2');
      if (service) {
        service.isActive = false;
        servicesStore.set('s2', service);
      }

      const res = await request('GET', '/api/providers/2/services');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items.length).toBe(1); // s3 only (s2 is inactive)
    });
  });

  describe('GET /api/providers/:providerId/availability', () => {
    it('should return available slots for a provider', async () => {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      // Provider 1 works Mon-Fri, check if today is a workday
      const dayOfWeek = today.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        const res = await request('GET', `/api/providers/1/availability?date=${dateStr}`);

        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.providerId).toBe('1');
        expect(data.date).toBeDefined();
        expect(data.slots).toBeDefined();
        expect(Array.isArray(data.slots)).toBe(true);
      }
    });

    it('should return empty slots for non-working day', async () => {
      // Find a Sunday
      const sunday = new Date();
      sunday.setDate(sunday.getDate() + (7 - sunday.getDay()));
      const dateStr = sunday.toISOString().split('T')[0];

      // Provider 1 doesn't work on Sunday (workDays: [1,2,3,4,5])
      const res = await request('GET', `/api/providers/1/availability?date=${dateStr}`);

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.slots.length).toBe(0);
    });

    it('should exclude booked appointment times', async () => {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const dayOfWeek = today.getDay();

      // Provider 2 works Tue-Sat (days 2-6)
      if (dayOfWeek >= 2 && dayOfWeek <= 6) {
        const res = await request('GET', `/api/providers/2/availability?date=${dateStr}&duration=30`);

        expect(res.status).toBe(200);

        const data = await res.json();

        // Should not include slots that conflict with apt-1 (10:00-10:45)
        const conflictingSlot = data.slots.find((s: any) => s.start === '10:00');
        expect(conflictingSlot).toBeUndefined();
      }
    });

    it('should use service duration when serviceId is provided', async () => {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const dayOfWeek = today.getDay();

      if (dayOfWeek >= 2 && dayOfWeek <= 6) {
        const res = await request('GET', `/api/providers/2/availability?date=${dateStr}&serviceId=s2`);

        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.serviceId).toBe('s2');
        expect(data.duration).toBe(30); // s2 has scheduledDuration=30
      }
    });

    it('should return message for inactive provider', async () => {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];

      const res = await request('GET', `/api/providers/3/availability?date=${dateStr}`);

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.slots.length).toBe(0);
      expect(data.message).toContain('not currently available');
    });
  });

  describe('GET /api/providers/:providerId/schedule', () => {
    it('should return provider schedule (authenticated)', async () => {
      const staffToken = createMockStaffSession();

      const res = await request('GET', '/api/providers/1/schedule', undefined, {
        Authorization: `Bearer ${staffToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.providerId).toBe('1');
      expect(data.schedule).toBeDefined();
    });

    it('should convert legacy format to new schedule format', async () => {
      const staffToken = createMockStaffSession();

      const res = await request('GET', '/api/providers/1/schedule', undefined, {
        Authorization: `Bearer ${staffToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.isLegacyFormat).toBe(true);
      // Monday should be populated (workDay 1)
      expect(data.schedule.monday).not.toBeNull();
      expect(data.schedule.monday.start).toBe('08:00');
      // Sunday should be null (not in workDays)
      expect(data.schedule.sunday).toBeNull();
    });

    it('should require authentication', async () => {
      const res = await request('GET', '/api/providers/1/schedule');

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/providers', () => {
    it('should create a new provider (admin)', async () => {
      const adminToken = createMockAdminSession();

      const newProvider = {
        firstName: 'New',
        lastName: 'Provider',
        email: 'new@medispa.com',
        phone: '(555) 999-0000',
        serviceIds: ['s1'],
        certifications: [],
        specialties: ['physiotherapy'],
        status: 'active',
        locationIds: ['loc-1'],
      };

      const res = await request('POST', '/api/providers', newProvider, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.id).toBeDefined();
      expect(data.firstName).toBe('New');
      expect(data.lastName).toBe('Provider');
      expect(data.email).toBe('new@medispa.com');
      expect(data.initials).toBe('NP'); // Auto-generated
      expect(data.fullName).toBe('New Provider');
    });

    it('should reject duplicate email', async () => {
      const adminToken = createMockAdminSession();

      const newProvider = {
        firstName: 'Duplicate',
        lastName: 'Email',
        email: 'jo-ellen@medispa.com', // Already exists
        serviceIds: [],
        certifications: [],
        specialties: [],
        status: 'active',
        locationIds: ['loc-1'],
      };

      const res = await request('POST', '/api/providers', newProvider, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(409);
    });

    it('should reject creation without authentication', async () => {
      const newProvider = {
        firstName: 'Unauthorized',
        lastName: 'Provider',
        email: 'unauth@medispa.com',
      };

      const res = await request('POST', '/api/providers', newProvider);

      expect(res.status).toBe(401);
    });

    it('should reject creation for non-admin users', async () => {
      const staffToken = createMockStaffSession();

      const newProvider = {
        firstName: 'Staff',
        lastName: 'Created',
        email: 'staff-created@medispa.com',
        serviceIds: [],
        certifications: [],
        specialties: [],
        status: 'active',
        locationIds: ['loc-1'],
      };

      const res = await request('POST', '/api/providers', newProvider, {
        Authorization: `Bearer ${staffToken}`,
      });

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/providers/:providerId', () => {
    it('should update an existing provider (admin)', async () => {
      const adminToken = createMockAdminSession();

      const updates = {
        firstName: 'Jo-Ellen Updated',
        bio: 'Updated bio',
      };

      const res = await request('PUT', '/api/providers/1', updates, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.firstName).toBe('Jo-Ellen Updated');
      expect(data.bio).toBe('Updated bio');
    });

    it('should reject email change to existing email', async () => {
      const adminToken = createMockAdminSession();

      const updates = {
        email: 'susan@medispa.com', // Already belongs to provider 2
      };

      const res = await request('PUT', '/api/providers/1', updates, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(409);
    });

    it('should return 404 for non-existent provider', async () => {
      const adminToken = createMockAdminSession();

      const res = await request('PUT', '/api/providers/non-existent', { firstName: 'Test' }, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/providers/:providerId/schedule', () => {
    it('should update provider schedule (admin)', async () => {
      const adminToken = createMockAdminSession();

      const newSchedule = {
        schedule: {
          sunday: null,
          monday: { start: '09:00', end: '18:00', breaks: [] },
          tuesday: { start: '09:00', end: '18:00', breaks: [] },
          wednesday: { start: '09:00', end: '18:00', breaks: [] },
          thursday: { start: '09:00', end: '18:00', breaks: [] },
          friday: { start: '09:00', end: '17:00', breaks: [] },
          saturday: null,
          exceptions: [],
        },
      };

      const res = await request('PUT', '/api/providers/1/schedule', newSchedule, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.schedule.monday.start).toBe('09:00');
      expect(data.message).toBe('Schedule updated successfully');
    });

    it('should allow manager to update schedule', async () => {
      const managerToken = createMockManagerSession();

      const newSchedule = {
        schedule: {
          sunday: null,
          monday: { start: '10:00', end: '18:00', breaks: [] },
          tuesday: null,
          wednesday: null,
          thursday: null,
          friday: null,
          saturday: null,
          exceptions: [],
        },
      };

      const res = await request('PUT', '/api/providers/1/schedule', newSchedule, {
        Authorization: `Bearer ${managerToken}`,
      });

      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/providers/:providerId/schedule/exceptions', () => {
    it('should add schedule exception (admin)', async () => {
      const adminToken = createMockAdminSession();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const exception = {
        date: tomorrow.toISOString(),
        type: 'pto',
        description: 'Vacation day',
        schedule: null, // Off all day
      };

      const res = await request('POST', '/api/providers/1/schedule/exceptions', exception, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.exception.id).toBeDefined();
      expect(data.exception.type).toBe('pto');
      expect(data.message).toBe('Schedule exception added successfully');
    });

    it('should add exception with modified hours', async () => {
      const adminToken = createMockAdminSession();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const exception = {
        date: tomorrow.toISOString(),
        type: 'training',
        description: 'Morning training',
        schedule: {
          start: '13:00',
          end: '17:00',
          breaks: [],
        },
      };

      const res = await request('POST', '/api/providers/1/schedule/exceptions', exception, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.exception.schedule.start).toBe('13:00');
    });
  });

  describe('DELETE /api/providers/:providerId', () => {
    it('should deactivate a provider (soft delete)', async () => {
      const adminToken = createMockAdminSession();

      const res = await request('DELETE', '/api/providers/1', undefined, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.message).toBe('Provider deactivated');

      // Verify provider is marked inactive
      const provider = providersStore.get('1');
      expect(provider?.status).toBe('inactive');
    });

    it('should return 404 for non-existent provider', async () => {
      const adminToken = createMockAdminSession();

      const res = await request('DELETE', '/api/providers/non-existent', undefined, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(404);
    });

    it('should reject deletion for non-admin users', async () => {
      const staffToken = createMockStaffSession();

      const res = await request('DELETE', '/api/providers/1', undefined, {
        Authorization: `Bearer ${staffToken}`,
      });

      expect(res.status).toBe(403);
    });
  });
});
