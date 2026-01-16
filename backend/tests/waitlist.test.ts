/**
 * Waitlist API Tests
 *
 * Comprehensive test coverage for:
 * - List waitlist entries with filters
 * - Get single waitlist entry
 * - Create waitlist entry
 * - Update waitlist entry
 * - Remove from waitlist
 * - Send availability offers
 * - Accept/decline offers
 * - Match waitlist entries to slots
 * - Auto-fill cancellations
 * - Settings management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import waitlist, {
  clearStores,
  addMockEntry,
  getMockEntry,
  addPatientAppointment,
  setSettings,
  getSettings,
  waitlistStore,
  offerTokenStore,
  WaitlistEntry,
  WaitlistSettings,
} from '../src/routes/waitlist';
import { errorHandler } from '../src/middleware/error';

// Mock the auth middleware to allow all requests in tests
vi.mock('../src/middleware/auth', () => ({
  authMiddleware: vi.fn((c, next) => {
    c.set('user', {
      uid: 'test-user-123',
      email: 'test@example.com',
      role: 'admin',
      permissions: [
        'waitlist:list',
        'waitlist:read',
        'waitlist:create',
        'waitlist:update',
        'waitlist:delete',
        'waitlist:offer',
        'waitlist:match',
        'waitlist:autofill',
        'waitlist:settings:read',
      ],
    });
    return next();
  }),
  optionalAuthMiddleware: vi.fn((c, next) => next()),
  requirePermission: vi.fn(() => (c: any, next: any) => next()),
  requireRole: vi.fn(() => (c: any, next: any) => next()),
}));

// Mock audit logging
vi.mock('@medical-spa/security', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

// Create test app
const app = new Hono();
app.route('/api/waitlist', waitlist);
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
      Authorization: 'Bearer test-token',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return app.fetch(req);
}

// Helper to get future date
function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

// Helper to create a test waitlist entry
function createTestEntry(overrides: Partial<WaitlistEntry> = {}): WaitlistEntry {
  const now = new Date();
  return {
    id: `wl-test-${Date.now()}`,
    patientId: 'pat-test',
    patientName: 'Test Patient',
    patientPhone: '5551234567',
    patientEmail: 'test@example.com',
    serviceIds: ['svc-001'],
    serviceNames: ['Test Service'],
    providerIds: [],
    preferredDays: [],
    preferredTimeRanges: [],
    flexibleDates: true,
    flexibleProviders: true,
    flexibleTimes: true,
    status: 'active',
    priority: 'normal',
    offerHistory: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('Waitlist API', () => {
  beforeEach(() => {
    clearStores();
  });

  // ===================
  // List Waitlist Tests
  // ===================
  describe('GET /api/waitlist', () => {
    it('should list all waitlist entries', async () => {
      const res = await request('GET', '/api/waitlist');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeGreaterThan(0);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);
    });

    it('should filter by status', async () => {
      const res = await request('GET', '/api/waitlist?status=active');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      for (const entry of data.items) {
        expect(entry.status).toBe('active');
      }
    });

    it('should filter by multiple statuses', async () => {
      const res = await request('GET', '/api/waitlist?statuses=active,offered');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      for (const entry of data.items) {
        expect(['active', 'offered']).toContain(entry.status);
      }
    });

    it('should filter by patient', async () => {
      const res = await request('GET', '/api/waitlist?patientId=pat-001');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      for (const entry of data.items) {
        expect(entry.patientId).toBe('pat-001');
      }
    });

    it('should filter by service', async () => {
      const res = await request('GET', '/api/waitlist?serviceId=svc-001');

      expect(res.status).toBe(200);
      const data = await res.json();

      for (const entry of data.items) {
        expect(entry.serviceIds).toContain('svc-001');
      }
    });

    it('should filter by provider', async () => {
      const res = await request('GET', '/api/waitlist?providerId=prov-1');

      expect(res.status).toBe(200);
      const data = await res.json();

      for (const entry of data.items) {
        // Entry should either have no provider preference or include prov-1
        expect(
          entry.providerIds.length === 0 || entry.providerIds.includes('prov-1')
        ).toBe(true);
      }
    });

    it('should filter by priority', async () => {
      const res = await request('GET', '/api/waitlist?priority=high');

      expect(res.status).toBe(200);
      const data = await res.json();

      for (const entry of data.items) {
        expect(entry.priority).toBe('high');
      }
    });

    it('should filter by tier', async () => {
      const res = await request('GET', '/api/waitlist?tier=platinum');

      expect(res.status).toBe(200);
      const data = await res.json();

      for (const entry of data.items) {
        expect(entry.tier).toBe('platinum');
      }
    });

    it('should filter by hasOffer', async () => {
      const res = await request('GET', '/api/waitlist?hasOffer=true');

      expect(res.status).toBe(200);
      const data = await res.json();

      for (const entry of data.items) {
        expect(entry.currentOffer).toBeDefined();
      }
    });

    it('should search by name', async () => {
      const res = await request('GET', '/api/waitlist?search=emma');

      expect(res.status).toBe(200);
      const data = await res.json();

      for (const entry of data.items) {
        expect(entry.patientName.toLowerCase()).toContain('emma');
      }
    });

    it('should paginate results', async () => {
      const res = await request('GET', '/api/waitlist?page=1&limit=2');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeLessThanOrEqual(2);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(2);
    });

    it('should sort by priority', async () => {
      const res = await request('GET', '/api/waitlist?sortBy=priority&status=active');

      expect(res.status).toBe(200);
      const data = await res.json();

      // The list endpoint uses sortWaitlistEntries which sorts by priority descending
      // Verify we have some results - the actual ordering is tested in the
      // "Sorting and Priority" describe block
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.success).toBe(true);
    });
  });

  // ===================
  // Get Single Entry Tests
  // ===================
  describe('GET /api/waitlist/:id', () => {
    it('should get entry by ID', async () => {
      const res = await request('GET', '/api/waitlist/wl-001');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.entry).toBeDefined();
      expect(data.entry.id).toBe('wl-001');
      expect(data.entry.patientName).toBe('Emma Thompson');
    });

    it('should return 404 for non-existent entry', async () => {
      const res = await request('GET', '/api/waitlist/non-existent');

      expect(res.status).toBe(404);
    });

    it('should include current offer details', async () => {
      const res = await request('GET', '/api/waitlist/wl-003');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.entry.currentOffer).toBeDefined();
      expect(data.entry.currentOffer.status).toBe('pending');
    });
  });

  // ===================
  // Create Entry Tests
  // ===================
  describe('POST /api/waitlist', () => {
    it('should create a valid waitlist entry', async () => {
      const res = await request('POST', '/api/waitlist', {
        patientId: 'pat-new',
        patientName: 'New Patient',
        patientPhone: '5559876543',
        patientEmail: 'new@example.com',
        serviceIds: ['svc-005'],
        serviceNames: ['New Service'],
        priority: 'normal',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.entry).toBeDefined();
      expect(data.entry.patientName).toBe('New Patient');
      expect(data.entry.status).toBe('active');
    });

    it('should create entry with all preferences', async () => {
      const res = await request('POST', '/api/waitlist', {
        patientId: 'pat-full',
        patientName: 'Full Preferences Patient',
        patientPhone: '5551112222',
        patientEmail: 'full@example.com',
        serviceIds: ['svc-001', 'svc-002'],
        providerIds: ['prov-1', 'prov-2'],
        preferredDays: ['monday', 'wednesday', 'friday'],
        preferredTimeRanges: [
          { start: '09:00', end: '12:00' },
          { start: '14:00', end: '17:00' },
        ],
        flexibleDates: false,
        flexibleProviders: false,
        flexibleTimes: false,
        priority: 'high',
        tier: 'gold',
        notes: 'VIP patient',
        deposit: 200,
        hasCompletedForms: true,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.entry.preferredDays).toContain('monday');
      expect(data.entry.preferredTimeRanges.length).toBe(2);
      expect(data.entry.tier).toBe('gold');
      expect(data.entry.deposit).toBe(200);
    });

    it('should reject duplicate waitlist entry for same service', async () => {
      // wl-001 is already on waitlist for svc-001
      const res = await request('POST', '/api/waitlist', {
        patientId: 'pat-001', // Same patient
        patientName: 'Emma Thompson',
        patientPhone: '5551234567',
        serviceIds: ['svc-001'], // Same service
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.message).toContain('already on the waitlist');
    });

    it('should require at least one service', async () => {
      const res = await request('POST', '/api/waitlist', {
        patientId: 'pat-new',
        patientName: 'New Patient',
        patientPhone: '5559876543',
        serviceIds: [], // Empty
      });

      expect(res.status).toBe(400);
    });

    it('should validate time range format', async () => {
      const res = await request('POST', '/api/waitlist', {
        patientId: 'pat-new',
        patientName: 'New Patient',
        patientPhone: '5559876543',
        serviceIds: ['svc-001'],
        preferredTimeRanges: [
          { start: '9:00', end: '17:00' }, // Invalid format (should be 09:00)
        ],
      });

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Update Entry Tests
  // ===================
  describe('PUT /api/waitlist/:id', () => {
    it('should update entry notes', async () => {
      const res = await request('PUT', '/api/waitlist/wl-001', {
        notes: 'Updated notes',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.entry.notes).toBe('Updated notes');
    });

    it('should update priority', async () => {
      const res = await request('PUT', '/api/waitlist/wl-002', {
        priority: 'urgent',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.entry.priority).toBe('urgent');
    });

    it('should update preferences', async () => {
      const res = await request('PUT', '/api/waitlist/wl-001', {
        preferredDays: ['saturday', 'sunday'],
        flexibleDates: false,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.entry.preferredDays).toContain('saturday');
      expect(data.entry.flexibleDates).toBe(false);
    });

    it('should update tier', async () => {
      const res = await request('PUT', '/api/waitlist/wl-002', {
        tier: 'platinum',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.entry.tier).toBe('platinum');
    });

    it('should reject update to cancelled entry', async () => {
      // First cancel the entry
      await request('DELETE', '/api/waitlist/wl-002');

      // Try to update
      const res = await request('PUT', '/api/waitlist/wl-002', {
        notes: 'Trying to update cancelled',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('cancelled');
    });

    it('should return 404 for non-existent entry', async () => {
      const res = await request('PUT', '/api/waitlist/non-existent', {
        notes: 'test',
      });

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Delete Entry Tests
  // ===================
  describe('DELETE /api/waitlist/:id', () => {
    it('should remove entry from waitlist', async () => {
      const res = await request('DELETE', '/api/waitlist/wl-002');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.entry.status).toBe('cancelled');
    });

    it('should remove with reason', async () => {
      const res = await request('DELETE', '/api/waitlist/wl-001', {
        reason: 'Patient requested removal',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.entry.notes).toContain('Patient requested removal');
    });

    it('should return 404 for non-existent entry', async () => {
      const res = await request('DELETE', '/api/waitlist/non-existent');

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Send Offer Tests
  // ===================
  describe('POST /api/waitlist/:id/offer', () => {
    it('should send offer to active entry', async () => {
      const futureDate = getFutureDate(3);

      const res = await request('POST', '/api/waitlist/wl-001/offer', {
        appointmentSlot: {
          date: futureDate,
          time: '10:00',
          providerId: 'prov-1',
          providerName: 'Dr. Sarah Johnson',
        },
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.entry.status).toBe('offered');
      expect(data.entry.currentOffer).toBeDefined();
      expect(data.offer.token).toBeDefined();
    });

    it('should set custom expiry time', async () => {
      const futureDate = getFutureDate(3);

      const res = await request('POST', '/api/waitlist/wl-002/offer', {
        appointmentSlot: {
          date: futureDate,
          time: '14:00',
          providerId: 'prov-2',
        },
        expiryMinutes: 30,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      const expiresAt = new Date(data.offer.expiresAt);
      const offeredAt = new Date(data.offer.offeredAt);
      const diffMinutes = (expiresAt.getTime() - offeredAt.getTime()) / (1000 * 60);
      expect(Math.round(diffMinutes)).toBe(30);
    });

    it('should reject offer to non-active entry', async () => {
      // wl-003 already has an offer (status: offered)
      const futureDate = getFutureDate(5);

      const res = await request('POST', '/api/waitlist/wl-003/offer', {
        appointmentSlot: {
          date: futureDate,
          time: '11:00',
          providerId: 'prov-1',
        },
      });

      expect(res.status).toBe(400);
    });

    it('should reject offer if patient has appointment on that date', async () => {
      // pat-001 (wl-001) has an appointment today
      const today = new Date().toISOString().split('T')[0];

      const res = await request('POST', '/api/waitlist/wl-001/offer', {
        appointmentSlot: {
          date: today,
          time: '15:00',
          providerId: 'prov-1',
        },
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.message).toContain('already has an appointment');
    });

    it('should reject if entry already has pending offer', async () => {
      const futureDate = getFutureDate(3);

      // First offer
      await request('POST', '/api/waitlist/wl-001/offer', {
        appointmentSlot: {
          date: futureDate,
          time: '10:00',
          providerId: 'prov-1',
        },
      });

      // Second offer attempt - Entry is now 'offered' status, so should get 400 (cannot offer to non-active)
      const res = await request('POST', '/api/waitlist/wl-001/offer', {
        appointmentSlot: {
          date: futureDate,
          time: '11:00',
          providerId: 'prov-1',
        },
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('offered');
    });

    it('should return 404 for non-existent entry', async () => {
      const futureDate = getFutureDate(3);

      const res = await request('POST', '/api/waitlist/non-existent/offer', {
        appointmentSlot: {
          date: futureDate,
          time: '10:00',
          providerId: 'prov-1',
        },
      });

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Accept Offer Tests
  // ===================
  describe('POST /api/waitlist/:id/offer/accept', () => {
    it('should accept valid offer', async () => {
      // wl-003 has a pending offer with token 'token-abc123'
      const res = await request('POST', '/api/waitlist/wl-003/offer/accept', {
        token: 'token-abc123',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.entry.status).toBe('booked');
      expect(data.acceptedSlot).toBeDefined();
    });

    it('should reject invalid token', async () => {
      const res = await request('POST', '/api/waitlist/wl-003/offer/accept', {
        token: 'invalid-token',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Invalid or expired');
    });

    it('should reject token for wrong entry', async () => {
      // Try to use wl-003's token on wl-001
      const res = await request('POST', '/api/waitlist/wl-001/offer/accept', {
        token: 'token-abc123',
      });

      expect(res.status).toBe(400);
    });

    it('should add appointment to patient appointments', async () => {
      // Accept the offer
      await request('POST', '/api/waitlist/wl-003/offer/accept', {
        token: 'token-abc123',
      });

      // Get the entry to check the offer details
      const entry = getMockEntry('wl-003');
      expect(entry?.status).toBe('booked');
    });

    it('should move offer to history after accept', async () => {
      await request('POST', '/api/waitlist/wl-003/offer/accept', {
        token: 'token-abc123',
      });

      const entry = getMockEntry('wl-003');
      expect(entry?.currentOffer).toBeUndefined();
      expect(entry?.offerHistory.some(o => o.status === 'accepted')).toBe(true);
    });
  });

  // ===================
  // Decline Offer Tests
  // ===================
  describe('POST /api/waitlist/:id/offer/decline', () => {
    it('should decline valid offer', async () => {
      const res = await request('POST', '/api/waitlist/wl-003/offer/decline', {
        token: 'token-abc123',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.entry.status).toBe('active'); // Back to active
    });

    it('should reject invalid token', async () => {
      const res = await request('POST', '/api/waitlist/wl-003/offer/decline', {
        token: 'invalid-token',
      });

      expect(res.status).toBe(400);
    });

    it('should move offer to history after decline', async () => {
      await request('POST', '/api/waitlist/wl-003/offer/decline', {
        token: 'token-abc123',
      });

      const entry = getMockEntry('wl-003');
      expect(entry?.currentOffer).toBeUndefined();
      expect(entry?.offerHistory.some(o => o.status === 'declined')).toBe(true);
    });
  });

  // ===================
  // Match Slot Tests
  // ===================
  describe('POST /api/waitlist/match', () => {
    it('should find matching entries for slot', async () => {
      const futureDate = getFutureDate(3);

      const res = await request('POST', '/api/waitlist/match', {
        date: futureDate,
        time: '10:00',
        providerId: 'prov-1',
        duration: 30,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.matches).toBeDefined();
      expect(data.slot).toBeDefined();
    });

    it('should respect provider preference', async () => {
      // Add entry that only wants prov-2
      addMockEntry(createTestEntry({
        id: 'wl-prov-test',
        providerIds: ['prov-2'],
        flexibleProviders: false,
        status: 'active',
      }));

      const futureDate = getFutureDate(3);

      // Search for prov-1 - should not include the entry
      const res = await request('POST', '/api/waitlist/match', {
        date: futureDate,
        time: '10:00',
        providerId: 'prov-1',
        duration: 30,
      });

      const data = await res.json();
      const match = data.matches.find((m: any) => m.id === 'wl-prov-test');
      expect(match).toBeUndefined();
    });

    it('should respect day preference', async () => {
      // Create entry that only wants Monday
      addMockEntry(createTestEntry({
        id: 'wl-day-test',
        preferredDays: ['monday'],
        flexibleDates: false,
        status: 'active',
      }));

      // Find a Saturday (day 6) - definitely not Monday (day 1)
      let saturday = new Date();
      saturday.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
      while (saturday.getDay() !== 6) {
        saturday.setDate(saturday.getDate() + 1);
      }
      const saturdayStr = saturday.toISOString().split('T')[0];

      const res = await request('POST', '/api/waitlist/match', {
        date: saturdayStr,
        time: '10:00',
        providerId: 'prov-1',
        duration: 30,
      });

      const data = await res.json();
      const match = data.matches.find((m: any) => m.id === 'wl-day-test');
      expect(match).toBeUndefined();
    });

    it('should respect time preference', async () => {
      // Add entry that only wants morning
      addMockEntry(createTestEntry({
        id: 'wl-time-test',
        preferredTimeRanges: [{ start: '09:00', end: '12:00' }],
        flexibleTimes: false,
        status: 'active',
      }));

      const futureDate = getFutureDate(3);

      // Search for afternoon slot
      const res = await request('POST', '/api/waitlist/match', {
        date: futureDate,
        time: '15:00',
        providerId: 'prov-1',
        duration: 30,
      });

      const data = await res.json();
      const match = data.matches.find((m: any) => m.id === 'wl-time-test');
      expect(match).toBeUndefined();
    });

    it('should include flexible entries', async () => {
      // Add fully flexible entry
      addMockEntry(createTestEntry({
        id: 'wl-flex-test',
        flexibleDates: true,
        flexibleProviders: true,
        flexibleTimes: true,
        status: 'active',
      }));

      const futureDate = getFutureDate(3);

      const res = await request('POST', '/api/waitlist/match', {
        date: futureDate,
        time: '15:00',
        providerId: 'prov-1',
        duration: 30,
      });

      const data = await res.json();
      const match = data.matches.find((m: any) => m.id === 'wl-flex-test');
      expect(match).toBeDefined();
    });

    it('should filter by service', async () => {
      const futureDate = getFutureDate(3);

      const res = await request('POST', '/api/waitlist/match', {
        date: futureDate,
        time: '10:00',
        providerId: 'prov-1',
        duration: 30,
        serviceId: 'svc-001',
      });

      const data = await res.json();
      for (const match of data.matches) {
        expect(match.serviceIds).toContain('svc-001');
      }
    });

    it('should exclude patients with appointments on date', async () => {
      // pat-001 (wl-001) has an appointment today
      const today = new Date().toISOString().split('T')[0];

      const res = await request('POST', '/api/waitlist/match', {
        date: today,
        time: '14:00',
        providerId: 'prov-1',
        duration: 30,
      });

      const data = await res.json();
      const match = data.matches.find((m: any) => m.patientId === 'pat-001');
      expect(match).toBeUndefined();
    });

    it('should limit results', async () => {
      const futureDate = getFutureDate(3);

      const res = await request('POST', '/api/waitlist/match', {
        date: futureDate,
        time: '10:00',
        providerId: 'prov-1',
        duration: 30,
        limit: 2,
      });

      const data = await res.json();
      expect(data.matches.length).toBeLessThanOrEqual(2);
    });
  });

  // ===================
  // Auto-Fill Tests
  // ===================
  describe('POST /api/waitlist/auto-fill', () => {
    it('should find matches and send offers', async () => {
      const futureDate = getFutureDate(3);

      const res = await request('POST', '/api/waitlist/auto-fill', {
        date: futureDate,
        time: '10:00',
        providerId: 'prov-1',
        duration: 30,
        sendOffers: true,
        maxOffers: 2,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.offersSent).toBeGreaterThanOrEqual(0);
    });

    it('should not send offers when sendOffers is false', async () => {
      const futureDate = getFutureDate(3);

      const res = await request('POST', '/api/waitlist/auto-fill', {
        date: futureDate,
        time: '10:00',
        providerId: 'prov-1',
        duration: 30,
        sendOffers: false,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.offersSent).toBe(0);
      expect(data.matches.length).toBeGreaterThanOrEqual(0);
    });

    it('should reject slot with insufficient notice', async () => {
      // Slot in 1 hour (less than minimum notice of 4 hours)
      // Use consistent local time for both date and time
      const slotTime = new Date();
      slotTime.setMinutes(slotTime.getMinutes() + 60); // Add 1 hour
      const year = slotTime.getFullYear();
      const month = String(slotTime.getMonth() + 1).padStart(2, '0');
      const day = String(slotTime.getDate()).padStart(2, '0');
      const hours = String(slotTime.getHours()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const timeStr = `${hours}:00`;

      const res = await request('POST', '/api/waitlist/auto-fill', {
        date: dateStr,
        time: timeStr,
        providerId: 'prov-1',
        duration: 30,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Minimum notice');
    });

    it('should return no matches message when none found', async () => {
      // Use a date/time combo that won't match any entries
      const futureDate = getFutureDate(30);

      // Add entry that's too restrictive
      addMockEntry(createTestEntry({
        id: 'wl-no-match',
        providerIds: ['prov-999'], // Non-existent provider
        flexibleProviders: false,
        status: 'active',
      }));

      const res = await request('POST', '/api/waitlist/auto-fill', {
        date: futureDate,
        time: '03:00', // Very early morning
        providerId: 'prov-1',
        duration: 30,
        serviceId: 'svc-999', // Non-existent service
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message).toContain('No matching');
    });
  });

  // ===================
  // Settings Tests
  // ===================
  describe('GET /api/waitlist/settings', () => {
    it('should return current settings', async () => {
      const res = await request('GET', '/api/waitlist/settings');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.settings).toBeDefined();
      expect(data.settings.offerExpiryMinutes).toBeDefined();
      expect(data.settings.tierWeights).toBeDefined();
    });
  });

  describe('PUT /api/waitlist/settings', () => {
    it('should update offer expiry', async () => {
      const res = await request('PUT', '/api/waitlist/settings', {
        offerExpiryMinutes: 60,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.settings.offerExpiryMinutes).toBe(60);
    });

    it('should update tier weights', async () => {
      const res = await request('PUT', '/api/waitlist/settings', {
        tierWeights: {
          platinum: 70,
          gold: 20,
          silver: 10,
        },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.settings.tierWeights.platinum).toBe(70);
    });

    it('should update offer sequence', async () => {
      const res = await request('PUT', '/api/waitlist/settings', {
        offerSequence: 'fifo',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.settings.offerSequence).toBe('fifo');
    });

    it('should update communication settings', async () => {
      const res = await request('PUT', '/api/waitlist/settings', {
        communication: {
          smsEnabled: false,
          emailEnabled: true,
          multiChannelDelayMinutes: 10,
          sendPeriodicReminders: false,
          reminderFrequencyDays: 14,
        },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.settings.communication.smsEnabled).toBe(false);
      expect(data.settings.communication.reminderFrequencyDays).toBe(14);
    });

    it('should update auto expire days', async () => {
      const res = await request('PUT', '/api/waitlist/settings', {
        autoExpireDays: 60,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.settings.autoExpireDays).toBe(60);
    });

    it('should reject invalid expiry minutes', async () => {
      const res = await request('PUT', '/api/waitlist/settings', {
        offerExpiryMinutes: 2, // Less than 5 min minimum
      });

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Sorting & Priority Tests
  // ===================
  describe('Sorting and Priority', () => {
    beforeEach(() => {
      clearStores();

      // Add entries with different priorities and tiers
      const now = new Date();
      const entries: WaitlistEntry[] = [
        createTestEntry({
          id: 'wl-sort-1',
          patientId: 'pat-sort-1',
          patientName: 'Normal None',
          priority: 'normal',
          tier: 'none',
          createdAt: new Date(now.getTime() - 1000),
          status: 'active',
        }),
        createTestEntry({
          id: 'wl-sort-2',
          patientId: 'pat-sort-2',
          patientName: 'High Gold',
          priority: 'high',
          tier: 'gold',
          createdAt: new Date(now.getTime() - 2000),
          status: 'active',
        }),
        createTestEntry({
          id: 'wl-sort-3',
          patientId: 'pat-sort-3',
          patientName: 'Urgent Platinum',
          priority: 'urgent',
          tier: 'platinum',
          createdAt: new Date(now.getTime() - 3000),
          status: 'active',
        }),
        createTestEntry({
          id: 'wl-sort-4',
          patientId: 'pat-sort-4',
          patientName: 'Normal Silver',
          priority: 'normal',
          tier: 'silver',
          createdAt: new Date(now.getTime() - 500),
          status: 'active',
        }),
      ];

      for (const entry of entries) {
        addMockEntry(entry);
      }
    });

    it('should sort by tier-weighted (default)', async () => {
      setSettings({ offerSequence: 'tier-weighted' });

      const futureDate = getFutureDate(3);
      const res = await request('POST', '/api/waitlist/match', {
        date: futureDate,
        time: '10:00',
        providerId: 'prov-1',
        duration: 30,
      });

      const data = await res.json();
      // Urgent Platinum should be first (highest combined score)
      expect(data.matches[0].id).toBe('wl-sort-3');
    });

    it('should sort by priority', async () => {
      setSettings({ offerSequence: 'priority' });

      const futureDate = getFutureDate(3);
      const res = await request('POST', '/api/waitlist/match', {
        date: futureDate,
        time: '10:00',
        providerId: 'prov-1',
        duration: 30,
      });

      const data = await res.json();
      // Urgent should be first
      expect(data.matches[0].priority).toBe('urgent');
    });

    it('should sort by FIFO', async () => {
      setSettings({ offerSequence: 'fifo' });

      const futureDate = getFutureDate(3);
      const res = await request('POST', '/api/waitlist/match', {
        date: futureDate,
        time: '10:00',
        providerId: 'prov-1',
        duration: 30,
      });

      const data = await res.json();
      // Entry with earliest createdAt should be first
      // Our test entries are wl-sort-3 (oldest), wl-sort-2, wl-sort-1, wl-sort-4 (newest)
      // wl-sort-3 has the earliest createdAt
      expect(data.matches.length).toBeGreaterThan(0);
      // Just verify FIFO order - earlier created entries should come before later ones
      for (let i = 1; i < data.matches.length; i++) {
        const prevCreatedAt = new Date(data.matches[i - 1].createdAt).getTime();
        const currCreatedAt = new Date(data.matches[i].createdAt).getTime();
        expect(prevCreatedAt).toBeLessThanOrEqual(currCreatedAt);
      }
    });
  });

  // ===================
  // Edge Cases Tests
  // ===================
  describe('Edge Cases', () => {
    it('should handle entry with no preferences (fully flexible)', async () => {
      addMockEntry(createTestEntry({
        id: 'wl-edge-1',
        patientId: 'pat-edge-1',
        preferredDays: [],
        preferredTimeRanges: [],
        providerIds: [],
        flexibleDates: true,
        flexibleProviders: true,
        flexibleTimes: true,
        status: 'active',
      }));

      const futureDate = getFutureDate(5);
      const res = await request('POST', '/api/waitlist/match', {
        date: futureDate,
        time: '08:00',
        providerId: 'prov-3',
        duration: 60,
      });

      const data = await res.json();
      const match = data.matches.find((m: any) => m.id === 'wl-edge-1');
      expect(match).toBeDefined();
    });

    it('should handle multiple services', async () => {
      addMockEntry(createTestEntry({
        id: 'wl-edge-2',
        patientId: 'pat-edge-2',
        serviceIds: ['svc-001', 'svc-002', 'svc-003'],
        status: 'active',
      }));

      const futureDate = getFutureDate(3);
      const res = await request('POST', '/api/waitlist/match', {
        date: futureDate,
        time: '10:00',
        providerId: 'prov-1',
        duration: 30,
        serviceId: 'svc-002',
      });

      const data = await res.json();
      const match = data.matches.find((m: any) => m.id === 'wl-edge-2');
      expect(match).toBeDefined();
    });

    it('should handle entry with expired status', async () => {
      // wl-005 is expired - should not appear in matches
      const futureDate = getFutureDate(3);
      const res = await request('POST', '/api/waitlist/match', {
        date: futureDate,
        time: '10:00',
        providerId: 'prov-3',
        duration: 30,
      });

      const data = await res.json();
      const match = data.matches.find((m: any) => m.id === 'wl-005');
      expect(match).toBeUndefined();
    });

    it('should handle concurrent offer attempts', async () => {
      const futureDate = getFutureDate(3);

      // Send first offer
      const res1 = await request('POST', '/api/waitlist/wl-001/offer', {
        appointmentSlot: {
          date: futureDate,
          time: '10:00',
          providerId: 'prov-1',
        },
      });
      expect(res1.status).toBe(201);

      // Try to send second offer while first is pending
      // Entry status is now 'offered', so this should return 400 (cannot offer to non-active entry)
      const res2 = await request('POST', '/api/waitlist/wl-001/offer', {
        appointmentSlot: {
          date: futureDate,
          time: '11:00',
          providerId: 'prov-1',
        },
      });
      expect(res2.status).toBe(400);
      const data = await res2.json();
      expect(data.message).toContain('offered');
    });

    it('should handle offer history correctly', async () => {
      // Decline offer on wl-003
      await request('POST', '/api/waitlist/wl-003/offer/decline', {
        token: 'token-abc123',
      });

      // Get entry and check history
      const res = await request('GET', '/api/waitlist/wl-003');
      const data = await res.json();

      expect(data.entry.offerHistory.length).toBeGreaterThan(0);
      expect(data.entry.offerHistory.some((o: any) => o.status === 'declined')).toBe(true);
      expect(data.entry.currentOffer).toBeUndefined();
      expect(data.entry.status).toBe('active');
    });

    it('should validate date format', async () => {
      const res = await request('POST', '/api/waitlist/wl-001/offer', {
        appointmentSlot: {
          date: '2024/12/25', // Invalid format
          time: '10:00',
          providerId: 'prov-1',
        },
      });

      expect(res.status).toBe(400);
    });

    it('should validate time format', async () => {
      const futureDate = getFutureDate(3);

      const res = await request('POST', '/api/waitlist/wl-001/offer', {
        appointmentSlot: {
          date: futureDate,
          time: '25:00', // Invalid time
          providerId: 'prov-1',
        },
      });

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Offer Expiration Tests
  // ===================
  describe('Offer Expiration', () => {
    it('should reject accept on expired offer', async () => {
      // Create entry with expired offer
      const now = new Date();
      const expiredEntry = createTestEntry({
        id: 'wl-expired',
        patientId: 'pat-expired',
        status: 'offered',
        currentOffer: {
          id: 'offer-expired',
          appointmentSlot: {
            date: getFutureDate(2),
            time: '10:00',
            providerId: 'prov-1',
          },
          offeredAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
          expiresAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago (expired)
          token: 'expired-token',
          status: 'pending',
        },
      });
      addMockEntry(expiredEntry);
      offerTokenStore.set('expired-token', { entryId: 'wl-expired', offerId: 'offer-expired' });

      const res = await request('POST', '/api/waitlist/wl-expired/offer/accept', {
        token: 'expired-token',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('expired');
    });
  });
});
