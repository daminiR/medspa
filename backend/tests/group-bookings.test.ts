/**
 * Group Bookings API Tests
 *
 * Comprehensive test coverage for:
 * - List group bookings with filters
 * - Get single group booking
 * - Create group booking
 * - Update group booking
 * - Cancel group booking
 * - Participant management (add, update, remove)
 * - Check-in (individual and group)
 * - Join group via invite code (public)
 * - Status transitions
 * - Conflict detection
 * - Edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import groupBookings, {
  clearStores,
  addMockGroup,
  getMockGroup,
  getGroupByInviteCode,
  groupsStore,
  inviteCodeIndex,
  GroupBooking,
  GroupParticipant,
} from '../src/routes/group-bookings';
import { errorHandler } from '../src/middleware/error';

// Mock the auth middleware to allow all requests in tests
vi.mock('../src/middleware/auth', () => ({
  authMiddleware: vi.fn((c, next) => {
    c.set('user', {
      uid: 'test-user-123',
      email: 'test@example.com',
      role: 'admin',
      permissions: [
        'group:list',
        'group:read',
        'group:create',
        'group:update',
        'group:delete',
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
app.route('/api/groups', groupBookings);
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

// Helper to get a date for testing
function getTestDate(daysFromNow: number = 1, hours: number = 10): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, 0, 0, 0);
  return date;
}

// Helper to create a minimal valid group booking
function createTestGroup(overrides?: Partial<GroupBooking>): GroupBooking {
  const id = `grp-test-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const inviteCode = `TEST${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
  const testDate = getTestDate(1);

  return {
    id,
    name: 'Test Group',
    type: 'friends',
    organizerId: 'pat-test-001',
    organizerName: 'Test Organizer',
    organizerEmail: 'test@example.com',
    organizerPhone: '5551234567',
    date: testDate.toISOString().split('T')[0],
    startTime: testDate.toISOString(),
    endTime: new Date(testDate.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    locationId: 'loc-1',
    participants: [],
    maxParticipants: 10,
    minParticipants: 2,
    allowIndividualServices: true,
    status: 'draft',
    inviteCode,
    paymentType: 'individual',
    depositRequired: false,
    totalAmount: 0,
    paidAmount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// Helper to create a test participant
function createTestParticipant(groupId: string, overrides?: Partial<GroupParticipant>): GroupParticipant {
  const id = `part-test-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const testDate = getTestDate(1);

  return {
    id,
    groupId,
    firstName: 'Test',
    lastName: 'Participant',
    email: 'participant@example.com',
    phone: '5559876543',
    serviceId: 'svc-001',
    serviceName: 'Test Service',
    providerId: 'prov-1',
    providerName: 'Dr. Test Provider',
    startTime: testDate.toISOString(),
    duration: 60,
    status: 'invited',
    amount: 100,
    paid: false,
    consentSigned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('Group Bookings API', () => {
  beforeEach(() => {
    clearStores();
  });

  // ===================
  // List Group Bookings Tests
  // ===================
  describe('GET /api/groups', () => {
    it('should list all group bookings', async () => {
      const res = await request('GET', '/api/groups');

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
      const res = await request('GET', '/api/groups?status=confirmed');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      for (const group of data.items) {
        expect(group.status).toBe('confirmed');
      }
    });

    it('should filter by type', async () => {
      const res = await request('GET', '/api/groups?type=party');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      for (const group of data.items) {
        expect(group.type).toBe('party');
      }
    });

    it('should filter by organizer', async () => {
      const res = await request('GET', '/api/groups?organizerId=pat-001');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      for (const group of data.items) {
        expect(group.organizerId).toBe('pat-001');
      }
    });

    it('should filter by date range', async () => {
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthStr = nextMonth.toISOString().split('T')[0];

      const res = await request('GET', `/api/groups?dateFrom=${today}&dateTo=${nextMonthStr}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request('GET', '/api/groups?page=1&limit=2');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.items.length).toBeLessThanOrEqual(2);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(2);
    });

    it('should sort by date ascending', async () => {
      const res = await request('GET', '/api/groups');

      expect(res.status).toBe(200);
      const data = await res.json();

      if (data.items.length > 1) {
        for (let i = 1; i < data.items.length; i++) {
          expect(new Date(data.items[i].date).getTime())
            .toBeGreaterThanOrEqual(new Date(data.items[i - 1].date).getTime());
        }
      }
    });
  });

  // ===================
  // Get Single Group Tests
  // ===================
  describe('GET /api/groups/:id', () => {
    it('should get group booking by ID', async () => {
      const res = await request('GET', '/api/groups/grp-001');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.group).toBeDefined();
      expect(data.group.id).toBe('grp-001');
      expect(data.group.name).toBe("Sarah's Bridal Party");
    });

    it('should return 404 for non-existent group', async () => {
      const res = await request('GET', '/api/groups/non-existent');

      expect(res.status).toBe(404);
    });

    it('should include participants in response', async () => {
      const res = await request('GET', '/api/groups/grp-001');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.group.participants).toBeDefined();
      expect(Array.isArray(data.group.participants)).toBe(true);
      expect(data.group.participants.length).toBeGreaterThan(0);
    });
  });

  // ===================
  // Create Group Tests
  // ===================
  describe('POST /api/groups', () => {
    it('should create a valid group booking', async () => {
      const testDate = getTestDate(7);

      const res = await request('POST', '/api/groups', {
        name: 'Birthday Spa Day',
        type: 'party',
        organizerId: 'pat-new',
        organizerName: 'Jane Smith',
        organizerEmail: 'jane@example.com',
        organizerPhone: '5551112222',
        date: testDate.toISOString().split('T')[0],
        startTime: testDate.toISOString(),
        maxParticipants: 6,
        minParticipants: 3,
        allowIndividualServices: true,
        paymentType: 'split_equal',
        depositRequired: true,
        depositAmount: 50,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.group).toBeDefined();
      expect(data.group.name).toBe('Birthday Spa Day');
      expect(data.group.status).toBe('draft');
      expect(data.group.inviteCode).toBeDefined();
      expect(data.group.inviteCode.length).toBeGreaterThanOrEqual(4);
    });

    it('should generate unique invite codes', async () => {
      const testDate = getTestDate(7);

      const res1 = await request('POST', '/api/groups', {
        name: 'Group One',
        type: 'friends',
        organizerId: 'pat-1',
        organizerName: 'Organizer One',
        organizerEmail: 'org1@example.com',
        organizerPhone: '5551111111',
        date: testDate.toISOString().split('T')[0],
        startTime: testDate.toISOString(),
      });

      const res2 = await request('POST', '/api/groups', {
        name: 'Group Two',
        type: 'friends',
        organizerId: 'pat-2',
        organizerName: 'Organizer Two',
        organizerEmail: 'org2@example.com',
        organizerPhone: '5552222222',
        date: testDate.toISOString().split('T')[0],
        startTime: testDate.toISOString(),
      });

      const data1 = await res1.json();
      const data2 = await res2.json();

      expect(data1.group.inviteCode).not.toBe(data2.group.inviteCode);
    });

    it('should set default values correctly', async () => {
      const testDate = getTestDate(7);

      const res = await request('POST', '/api/groups', {
        name: 'Minimal Group',
        type: 'other',
        organizerId: 'pat-min',
        organizerName: 'Minimal Organizer',
        organizerEmail: 'minimal@example.com',
        organizerPhone: '5553333333',
        date: testDate.toISOString().split('T')[0],
        startTime: testDate.toISOString(),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.group.maxParticipants).toBe(10);
      expect(data.group.minParticipants).toBe(2);
      expect(data.group.paymentType).toBe('individual');
      expect(data.group.depositRequired).toBe(false);
      expect(data.group.allowIndividualServices).toBe(true);
    });

    it('should reject invalid email', async () => {
      const testDate = getTestDate(7);

      const res = await request('POST', '/api/groups', {
        name: 'Bad Email Group',
        type: 'friends',
        organizerId: 'pat-bad',
        organizerName: 'Bad Email',
        organizerEmail: 'not-an-email',
        organizerPhone: '5554444444',
        date: testDate.toISOString().split('T')[0],
        startTime: testDate.toISOString(),
      });

      expect(res.status).toBe(400);
    });

    it('should reject missing required fields', async () => {
      const res = await request('POST', '/api/groups', {
        name: 'Incomplete Group',
        // Missing organizerId, organizerName, etc.
      });

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Update Group Tests
  // ===================
  describe('PUT /api/groups/:id', () => {
    it('should update group name', async () => {
      const res = await request('PUT', '/api/groups/grp-001', {
        name: 'Updated Bridal Party Name',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.group.name).toBe('Updated Bridal Party Name');
    });

    it('should update group type', async () => {
      const res = await request('PUT', '/api/groups/grp-002', {
        type: 'party',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.group.type).toBe('party');
    });

    it('should update status with valid transition', async () => {
      // grp-002 is in 'draft' status, can transition to 'confirmed'
      const res = await request('PUT', '/api/groups/grp-002', {
        status: 'confirmed',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.group.status).toBe('confirmed');
    });

    it('should reject invalid status transition', async () => {
      // grp-001 is in 'confirmed' status, cannot transition to 'draft'
      const res = await request('PUT', '/api/groups/grp-001', {
        status: 'draft',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Invalid status transition');
    });

    it('should reject update to cancelled group', async () => {
      // First cancel a group
      await request('DELETE', '/api/groups/grp-002');

      // Try to update it
      const res = await request('PUT', '/api/groups/grp-002', {
        name: 'Should Fail',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('cancelled');
    });

    it('should return 404 for non-existent group', async () => {
      const res = await request('PUT', '/api/groups/non-existent', {
        name: 'Test',
      });

      expect(res.status).toBe(404);
    });

    it('should update multiple fields at once', async () => {
      const res = await request('PUT', '/api/groups/grp-001', {
        notes: 'Updated notes',
        specialRequests: 'Updated requests',
        maxParticipants: 12,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.group.notes).toBe('Updated notes');
      expect(data.group.specialRequests).toBe('Updated requests');
      expect(data.group.maxParticipants).toBe(12);
    });
  });

  // ===================
  // Delete/Cancel Group Tests
  // ===================
  describe('DELETE /api/groups/:id', () => {
    it('should cancel group booking', async () => {
      const res = await request('DELETE', '/api/groups/grp-002');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.group.status).toBe('cancelled');
    });

    it('should cancel with reason', async () => {
      // Create a new group to cancel
      const testGroup = createTestGroup({ status: 'confirmed' });
      addMockGroup(testGroup);

      const res = await request('DELETE', `/api/groups/${testGroup.id}`, {
        reason: 'Customer requested cancellation',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.group.notes).toContain('Cancelled');
      expect(data.group.notes).toContain('Customer requested cancellation');
    });

    it('should cancel all participants when group is cancelled', async () => {
      // grp-001 has participants
      const res = await request('DELETE', '/api/groups/grp-001');

      expect(res.status).toBe(200);
      const data = await res.json();

      for (const participant of data.group.participants) {
        if (participant.status !== 'completed') {
          expect(participant.status).toBe('cancelled');
        }
      }
    });

    it('should reject cancelling already cancelled group', async () => {
      // First cancel
      await request('DELETE', '/api/groups/grp-002');

      // Try to cancel again
      const res = await request('DELETE', '/api/groups/grp-002');

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('already cancelled');
    });

    it('should return 404 for non-existent group', async () => {
      const res = await request('DELETE', '/api/groups/non-existent');

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Participant List Tests
  // ===================
  describe('GET /api/groups/:id/participants', () => {
    it('should list all participants', async () => {
      const res = await request('GET', '/api/groups/grp-001/participants');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.participants).toBeDefined();
      expect(Array.isArray(data.participants)).toBe(true);
      expect(data.total).toBeGreaterThan(0);
    });

    it('should include status counts', async () => {
      const res = await request('GET', '/api/groups/grp-001/participants');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(typeof data.confirmed).toBe('number');
      expect(typeof data.arrived).toBe('number');
      expect(typeof data.completed).toBe('number');
    });

    it('should return 404 for non-existent group', async () => {
      const res = await request('GET', '/api/groups/non-existent/participants');

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Add Participant Tests
  // ===================
  describe('POST /api/groups/:id/participants', () => {
    it('should add a participant', async () => {
      const testDate = getTestDate(1, 13); // 1 PM tomorrow

      const res = await request('POST', '/api/groups/grp-002/participants', {
        firstName: 'New',
        lastName: 'Participant',
        email: 'new@example.com',
        phone: '5556667777',
        serviceId: 'svc-001',
        serviceName: 'Facial Treatment',
        providerId: 'prov-1',
        providerName: 'Dr. Test',
        startTime: testDate.toISOString(),
        duration: 60,
        amount: 150,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.participant).toBeDefined();
      expect(data.participant.firstName).toBe('New');
      expect(data.participant.status).toBe('invited');
    });

    it('should reject adding to cancelled group', async () => {
      // First cancel the group
      await request('DELETE', '/api/groups/grp-002');

      const testDate = getTestDate(1);

      const res = await request('POST', '/api/groups/grp-002/participants', {
        firstName: 'Should',
        lastName: 'Fail',
        serviceId: 'svc-001',
        serviceName: 'Test',
        startTime: testDate.toISOString(),
        duration: 60,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('cancelled');
    });

    it('should reject when max participants reached', async () => {
      // Create a full group
      const fullGroup = createTestGroup({
        maxParticipants: 2,
        status: 'confirmed',
      });
      const part1 = createTestParticipant(fullGroup.id, { status: 'confirmed' });
      const part2 = createTestParticipant(fullGroup.id, { status: 'confirmed', firstName: 'Second' });
      fullGroup.participants = [part1, part2];
      addMockGroup(fullGroup);

      const testDate = getTestDate(1);

      const res = await request('POST', `/api/groups/${fullGroup.id}/participants`, {
        firstName: 'Overflow',
        lastName: 'Participant',
        serviceId: 'svc-001',
        serviceName: 'Test',
        startTime: testDate.toISOString(),
        duration: 60,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('maximum');
    });

    it('should detect provider conflict', async () => {
      // grp-001 has a participant with prov-1 at 10 AM tomorrow
      const conflictTime = getTestDate(1, 10); // Same time as existing

      const res = await request('POST', '/api/groups/grp-002/participants', {
        firstName: 'Conflict',
        lastName: 'Test',
        serviceId: 'svc-001',
        serviceName: 'Test',
        providerId: 'prov-1', // Same provider
        startTime: conflictTime.toISOString(),
        duration: 60,
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.message).toContain('Provider');
    });
  });

  // ===================
  // Update Participant Tests
  // ===================
  describe('PUT /api/groups/:id/participants/:participantId', () => {
    it('should update participant name', async () => {
      const res = await request('PUT', '/api/groups/grp-001/participants/part-001', {
        firstName: 'Updated',
        lastName: 'Name',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.participant.firstName).toBe('Updated');
      expect(data.participant.lastName).toBe('Name');
    });

    it('should update participant status with valid transition', async () => {
      // part-003 is 'invited', can transition to 'confirmed'
      const res = await request('PUT', '/api/groups/grp-001/participants/part-003', {
        status: 'confirmed',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.participant.status).toBe('confirmed');
    });

    it('should reject invalid status transition', async () => {
      // part-001 is 'confirmed', cannot go back to 'invited'
      const res = await request('PUT', '/api/groups/grp-001/participants/part-001', {
        status: 'invited',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Invalid status transition');
    });

    it('should update payment status', async () => {
      const res = await request('PUT', '/api/groups/grp-001/participants/part-002', {
        paid: true,
        paymentId: 'pay-new-001',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.participant.paid).toBe(true);
      expect(data.participant.paymentId).toBe('pay-new-001');
    });

    it('should set consent signed timestamp', async () => {
      const res = await request('PUT', '/api/groups/grp-001/participants/part-003', {
        consentSigned: true,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.participant.consentSigned).toBe(true);
      expect(data.participant.consentSignedAt).toBeDefined();
    });

    it('should return 404 for non-existent participant', async () => {
      const res = await request('PUT', '/api/groups/grp-001/participants/non-existent', {
        firstName: 'Test',
      });

      expect(res.status).toBe(404);
    });

    it('should recalculate group totals after amount change', async () => {
      const res = await request('PUT', '/api/groups/grp-001/participants/part-001', {
        amount: 300, // Changed from 250
      });

      expect(res.status).toBe(200);
      const data = await res.json();

      // Verify group totals are recalculated
      const groupRes = await request('GET', '/api/groups/grp-001');
      const groupData = await groupRes.json();
      expect(groupData.group.totalAmount).toBe(600); // 300 + 150 + 150
    });
  });

  // ===================
  // Remove Participant Tests
  // ===================
  describe('DELETE /api/groups/:id/participants/:participantId', () => {
    it('should remove participant (mark as cancelled)', async () => {
      const res = await request('DELETE', '/api/groups/grp-001/participants/part-003');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.participant.status).toBe('cancelled');
    });

    it('should return 404 for non-existent participant', async () => {
      const res = await request('DELETE', '/api/groups/grp-001/participants/non-existent');

      expect(res.status).toBe(404);
    });

    it('should recalculate totals after removal', async () => {
      // Get initial total
      const initialRes = await request('GET', '/api/groups/grp-001');
      const initialData = await initialRes.json();
      const initialTotal = initialData.group.totalAmount;

      // Remove participant with amount 150
      await request('DELETE', '/api/groups/grp-001/participants/part-002');

      // Check new total
      const afterRes = await request('GET', '/api/groups/grp-001');
      const afterData = await afterRes.json();

      // Total should be reduced (excluding cancelled participant)
      expect(afterData.group.totalAmount).toBeLessThan(initialTotal);
    });
  });

  // ===================
  // Group Check-In Tests
  // ===================
  describe('POST /api/groups/:id/check-in', () => {
    it('should check in all confirmed participants', async () => {
      const res = await request('POST', '/api/groups/grp-001/check-in', {});

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.checkedIn).toBeDefined();
      expect(Array.isArray(data.checkedIn)).toBe(true);
    });

    it('should check in specific participants', async () => {
      // First confirm part-003
      await request('PUT', '/api/groups/grp-001/participants/part-003', {
        status: 'confirmed',
      });

      const res = await request('POST', '/api/groups/grp-001/check-in', {
        participantIds: ['part-003'],
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.checkedIn).toContain('part-003');
    });

    it('should skip non-confirmed participants', async () => {
      // part-003 is 'invited', should be skipped
      const res = await request('POST', '/api/groups/grp-001/check-in', {});

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.skipped).toBeDefined();
    });

    it('should reject check-in for cancelled group', async () => {
      await request('DELETE', '/api/groups/grp-002');

      const res = await request('POST', '/api/groups/grp-002/check-in', {});

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('cancelled');
    });
  });

  // ===================
  // Individual Check-In Tests
  // ===================
  describe('POST /api/groups/:id/participants/:participantId/check-in', () => {
    it('should check in individual participant', async () => {
      // part-002 is confirmed
      const res = await request('POST', '/api/groups/grp-001/participants/part-002/check-in');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.participant.status).toBe('arrived');
      expect(data.participant.checkedInAt).toBeDefined();
    });

    it('should reject check-in for non-confirmed participant', async () => {
      // part-003 is 'invited'
      const res = await request('POST', '/api/groups/grp-001/participants/part-003/check-in');

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('must be confirmed');
    });

    it('should reject check-in for already arrived participant', async () => {
      // First check in
      await request('POST', '/api/groups/grp-001/participants/part-002/check-in');

      // Try again
      const res = await request('POST', '/api/groups/grp-001/participants/part-002/check-in');

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('already');
    });

    it('should return 404 for non-existent participant', async () => {
      const res = await request('POST', '/api/groups/grp-001/participants/non-existent/check-in');

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Join Group (Public) Tests
  // ===================
  describe('GET /api/groups/join/:code', () => {
    it('should return group info for valid code', async () => {
      const res = await request('GET', '/api/groups/join/SARAH01');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.group).toBeDefined();
      expect(data.group.name).toBe("Sarah's Bridal Party");
      expect(data.group.organizerName).toBe('Sarah Johnson');
    });

    it('should be case insensitive', async () => {
      const res = await request('GET', '/api/groups/join/sarah01');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('should return 404 for invalid code', async () => {
      const res = await request('GET', '/api/groups/join/INVALID99');

      expect(res.status).toBe(404);
    });

    it('should reject cancelled groups', async () => {
      await request('DELETE', '/api/groups/grp-002');

      const res = await request('GET', '/api/groups/join/ACME99');

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('cancelled');
    });

    it('should include discount calculation', async () => {
      const res = await request('GET', '/api/groups/join/SARAH01');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(typeof data.group.discount).toBe('number');
    });
  });

  describe('POST /api/groups/join/:code', () => {
    it('should allow joining with valid data', async () => {
      const res = await request('POST', '/api/groups/join/SARAH01', {
        firstName: 'New',
        lastName: 'Joiner',
        email: 'joiner@example.com',
        phone: '5558889999',
        serviceId: 'svc-001',
        serviceName: 'Bridesmaid Service',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.participant).toBeDefined();
      expect(data.participant.status).toBe('confirmed');
    });

    it('should reject duplicate patient', async () => {
      const res = await request('POST', '/api/groups/join/SARAH01', {
        patientId: 'pat-002', // Already in group
        firstName: 'Emily',
        lastName: 'Davis',
        serviceId: 'svc-001',
        serviceName: 'Test',
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.message).toContain('already');
    });

    it('should reject duplicate email', async () => {
      const res = await request('POST', '/api/groups/join/SARAH01', {
        firstName: 'Different',
        lastName: 'Person',
        email: 'sarah@example.com', // Already in group
        serviceId: 'svc-001',
        serviceName: 'Test',
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.message).toContain('email');
    });

    it('should reject joining cancelled group', async () => {
      await request('DELETE', '/api/groups/grp-002');

      const res = await request('POST', '/api/groups/join/ACME99', {
        firstName: 'Should',
        lastName: 'Fail',
        serviceId: 'svc-001',
        serviceName: 'Test',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('cancelled');
    });

    it('should reject joining full group', async () => {
      // Create a full group
      const fullGroup = createTestGroup({
        maxParticipants: 1,
        status: 'confirmed',
        inviteCode: 'FULL01',
      });
      const part = createTestParticipant(fullGroup.id, { status: 'confirmed' });
      fullGroup.participants = [part];
      addMockGroup(fullGroup);

      const res = await request('POST', '/api/groups/join/FULL01', {
        firstName: 'Overflow',
        lastName: 'Person',
        serviceId: 'svc-001',
        serviceName: 'Test',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('full');
    });
  });

  // ===================
  // Edge Cases & Integration Tests
  // ===================
  describe('Edge Cases', () => {
    it('should handle group with no participants', async () => {
      const res = await request('GET', '/api/groups/grp-002');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.group.participants).toHaveLength(0);
      expect(data.group.totalAmount).toBe(0);
    });

    it('should calculate end time from participants', async () => {
      // Add participants and check end time is calculated
      const testDate = getTestDate(7, 10);

      // Create a new group
      const createRes = await request('POST', '/api/groups', {
        name: 'Time Test Group',
        type: 'friends',
        organizerId: 'pat-time',
        organizerName: 'Time Tester',
        organizerEmail: 'time@example.com',
        organizerPhone: '5551234567',
        date: testDate.toISOString().split('T')[0],
        startTime: testDate.toISOString(),
      });
      const { group } = await createRes.json();

      // Add participant ending at 11 AM
      await request('POST', `/api/groups/${group.id}/participants`, {
        firstName: 'Time',
        lastName: 'Participant',
        serviceId: 'svc-001',
        serviceName: 'Test',
        startTime: testDate.toISOString(),
        duration: 60, // Ends at 11 AM
      });

      const afterRes = await request('GET', `/api/groups/${group.id}`);
      const afterData = await afterRes.json();

      const endTime = new Date(afterData.group.endTime);
      expect(endTime.getHours()).toBe(11);
    });

    it('should maintain data integrity after multiple operations', async () => {
      const testDate = getTestDate(7);

      // Create group
      const createRes = await request('POST', '/api/groups', {
        name: 'Integrity Test',
        type: 'corporate',
        organizerId: 'pat-int',
        organizerName: 'Integrity Tester',
        organizerEmail: 'integrity@example.com',
        organizerPhone: '5551234567',
        date: testDate.toISOString().split('T')[0],
        startTime: testDate.toISOString(),
      });
      const { group } = await createRes.json();

      // Add 3 participants
      for (let i = 1; i <= 3; i++) {
        await request('POST', `/api/groups/${group.id}/participants`, {
          firstName: `Participant${i}`,
          lastName: 'Test',
          serviceId: 'svc-001',
          serviceName: 'Service',
          startTime: new Date(testDate.getTime() + i * 60 * 60 * 1000).toISOString(),
          duration: 60,
          amount: 100,
        });
      }

      // Update status
      await request('PUT', `/api/groups/${group.id}`, { status: 'confirmed' });

      // Get participants and update one
      const partsRes = await request('GET', `/api/groups/${group.id}/participants`);
      const partsData = await partsRes.json();
      const firstPartId = partsData.participants[0].id;

      // Update participant to confirmed, then arrived
      await request('PUT', `/api/groups/${group.id}/participants/${firstPartId}`, {
        status: 'confirmed',
      });
      await request('PUT', `/api/groups/${group.id}/participants/${firstPartId}`, {
        status: 'arrived',
        paid: true,
      });

      // Remove one participant
      const lastPartId = partsData.participants[2].id;
      await request('DELETE', `/api/groups/${group.id}/participants/${lastPartId}`);

      // Verify final state
      const finalRes = await request('GET', `/api/groups/${group.id}`);
      const finalData = await finalRes.json();

      expect(finalData.group.status).toBe('confirmed');
      expect(finalData.group.participants.length).toBe(3); // Still 3 (one cancelled)
      expect(finalData.group.totalAmount).toBe(200); // Only 2 active participants
      expect(finalData.group.paidAmount).toBe(100); // One paid
    });

    it('should handle concurrent operations correctly', async () => {
      // Simulate multiple join attempts
      const promises = [];
      for (let i = 1; i <= 3; i++) {
        promises.push(
          request('POST', '/api/groups/join/GIRLS7', {
            firstName: `Concurrent${i}`,
            lastName: 'User',
            email: `concurrent${i}@example.com`,
            serviceId: 'svc-002',
            serviceName: 'HydraFacial',
          })
        );
      }

      const results = await Promise.all(promises);

      // At least some should succeed (up to max participants)
      const successes = results.filter(r => r.status === 201);
      expect(successes.length).toBeGreaterThan(0);
    });
  });

  // ===================
  // Validation Tests
  // ===================
  describe('Validation', () => {
    it('should reject invalid group type', async () => {
      const testDate = getTestDate(7);

      const res = await request('POST', '/api/groups', {
        name: 'Invalid Type',
        type: 'invalid_type',
        organizerId: 'pat-001',
        organizerName: 'Test',
        organizerEmail: 'test@example.com',
        organizerPhone: '5551234567',
        date: testDate.toISOString().split('T')[0],
        startTime: testDate.toISOString(),
      });

      expect(res.status).toBe(400);
    });

    it('should reject invalid payment type', async () => {
      const testDate = getTestDate(7);

      const res = await request('POST', '/api/groups', {
        name: 'Invalid Payment',
        type: 'friends',
        organizerId: 'pat-001',
        organizerName: 'Test',
        organizerEmail: 'test@example.com',
        organizerPhone: '5551234567',
        date: testDate.toISOString().split('T')[0],
        startTime: testDate.toISOString(),
        paymentType: 'invalid_payment',
      });

      expect(res.status).toBe(400);
    });

    it('should reject max participants below 2', async () => {
      const testDate = getTestDate(7);

      const res = await request('POST', '/api/groups', {
        name: 'Too Small',
        type: 'friends',
        organizerId: 'pat-001',
        organizerName: 'Test',
        organizerEmail: 'test@example.com',
        organizerPhone: '5551234567',
        date: testDate.toISOString().split('T')[0],
        startTime: testDate.toISOString(),
        maxParticipants: 1,
      });

      expect(res.status).toBe(400);
    });

    it('should reject participant duration below 5 minutes', async () => {
      const testDate = getTestDate(1);

      const res = await request('POST', '/api/groups/grp-002/participants', {
        firstName: 'Short',
        lastName: 'Duration',
        serviceId: 'svc-001',
        serviceName: 'Test',
        startTime: testDate.toISOString(),
        duration: 2, // Too short
      });

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Status Transition Tests
  // ===================
  describe('Status Transitions', () => {
    it('should allow draft -> confirmed', async () => {
      const res = await request('PUT', '/api/groups/grp-002', {
        status: 'confirmed',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.group.status).toBe('confirmed');
    });

    it('should allow confirmed -> in_progress', async () => {
      // First confirm
      await request('PUT', '/api/groups/grp-002', { status: 'confirmed' });

      const res = await request('PUT', '/api/groups/grp-002', {
        status: 'in_progress',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.group.status).toBe('in_progress');
    });

    it('should allow in_progress -> completed', async () => {
      // grp-003 is already in_progress
      const res = await request('PUT', '/api/groups/grp-003', {
        status: 'completed',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.group.status).toBe('completed');
    });

    it('should not allow completed -> any', async () => {
      // Complete grp-003
      await request('PUT', '/api/groups/grp-003', { status: 'completed' });

      const res = await request('PUT', '/api/groups/grp-003', {
        status: 'in_progress',
      });

      expect(res.status).toBe(400);
    });

    it('should allow any -> cancelled (except completed)', async () => {
      const res = await request('PUT', '/api/groups/grp-002', {
        status: 'cancelled',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.group.status).toBe('cancelled');
    });
  });

  // ===================
  // Discount Calculation Tests
  // ===================
  describe('Discount Calculation', () => {
    it('should calculate 5% discount for 2 participants', async () => {
      const res = await request('GET', '/api/groups/join/GIRLS7'); // Has 2 participants

      expect(res.status).toBe(200);
      const data = await res.json();
      // Next participant would make 3, so discount should be for 3
      expect(data.group.discount).toBe(10);
    });

    it('should calculate 10% discount for 3-4 participants', async () => {
      // Create a group with 3 participants
      const testGroup = createTestGroup();
      for (let i = 0; i < 3; i++) {
        testGroup.participants.push(
          createTestParticipant(testGroup.id, { status: 'confirmed', firstName: `P${i}` })
        );
      }
      addMockGroup(testGroup);

      const res = await request('GET', `/api/groups/join/${testGroup.inviteCode}`);
      const data = await res.json();
      // Next participant would make 4
      expect(data.group.discount).toBe(10);
    });
  });
});
