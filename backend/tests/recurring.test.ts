/**
 * Recurring Appointments API Tests
 *
 * Comprehensive test coverage for:
 * - Create weekly recurring
 * - Create biweekly recurring
 * - Create monthly recurring (by day of week)
 * - Create limited series (6 sessions)
 * - Expand occurrences for date range
 * - Skip single occurrence
 * - Reschedule single occurrence
 * - Modify single occurrence
 * - End series early
 * - Update all future occurrences
 * - Conflict detection
 * - DST handling
 * - RRULE generation
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { Hono } from 'hono';
import recurring, {
  clearRecurringStore,
  addMockRecurringPattern,
  getMockRecurringPattern,
  addMockAppointmentForConflict,
  clearMockAppointmentsForConflict,
  recurringStore,
  RecurringPattern,
  RecurringException,
  generateRRule,
  expandOccurrences,
  checkSeriesConflicts,
} from '../src/routes/recurring';
import { errorHandler } from '../src/middleware/error';

// Mock the auth middleware to allow all requests in tests
vi.mock('../src/middleware/auth', () => ({
  authMiddleware: vi.fn((c, next) => {
    c.set('user', {
      uid: 'test-user-123',
      email: 'test@example.com',
      role: 'admin',
      permissions: [
        'appointment:list',
        'appointment:read',
        'appointment:create',
        'appointment:update',
        'appointment:delete',
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
app.route('/api/recurring', recurring);
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

// Helper to get a date string N days from now
function getFutureDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

// Helper to get next occurrence of a specific day of week
function getNextDayOfWeek(dayOfWeek: number): string {
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntil = (dayOfWeek - currentDay + 7) % 7 || 7;
  const result = new Date(today);
  result.setDate(today.getDate() + daysUntil);
  return result.toISOString().split('T')[0];
}

// Base recurring pattern data for tests
const baseRecurringData = {
  patientId: 'pat-001',
  patientName: 'Sarah Johnson',
  serviceId: 'svc-001',
  serviceName: 'Botox Treatment',
  providerId: 'prov-1',
  providerName: 'Dr. Sarah Johnson',
  duration: 30,
  checkConflicts: false, // Disable conflict checking for most tests
};

describe('Recurring Appointments API', () => {
  beforeEach(() => {
    clearRecurringStore();
    clearMockAppointmentsForConflict();
  });

  // ===================
  // RRULE Generation Tests
  // ===================
  describe('RRULE Generation', () => {
    it('should generate weekly RRULE', () => {
      const result = generateRRule({
        frequency: 'weekly',
        interval: 1,
        startDate: '2024-01-15',
        startTime: '10:00',
        byDayOfWeek: [1], // Monday
      });

      expect(result.rruleString).toContain('FREQ=WEEKLY');
      expect(result.rruleString).toContain('INTERVAL=1');
      expect(result.rruleString).toContain('BYDAY=MO');
    });

    it('should generate biweekly RRULE', () => {
      const result = generateRRule({
        frequency: 'biweekly',
        interval: 1,
        startDate: '2024-01-15',
        startTime: '14:00',
      });

      expect(result.rruleString).toContain('FREQ=WEEKLY');
      expect(result.rruleString).toContain('INTERVAL=2');
    });

    it('should generate monthly RRULE with day of month', () => {
      const result = generateRRule({
        frequency: 'monthly',
        interval: 1,
        startDate: '2024-01-15',
        startTime: '10:00',
        byDayOfMonth: 15,
      });

      expect(result.rruleString).toContain('FREQ=MONTHLY');
      expect(result.rruleString).toContain('BYMONTHDAY=15');
    });

    it('should generate monthly RRULE with first Monday', () => {
      const result = generateRRule({
        frequency: 'monthly',
        interval: 1,
        startDate: '2024-01-01',
        startTime: '10:00',
        byDayOfWeek: [1], // Monday
        bySetPos: 1, // First
      });

      expect(result.rruleString).toContain('FREQ=MONTHLY');
      expect(result.rruleString).toContain('BYDAY=MO');
      expect(result.rruleString).toContain('BYSETPOS=1');
    });

    it('should generate RRULE with end date', () => {
      const result = generateRRule({
        frequency: 'weekly',
        interval: 1,
        startDate: '2024-01-15',
        startTime: '10:00',
        endDate: '2024-06-15',
      });

      expect(result.rruleString).toContain('UNTIL=');
    });

    it('should generate RRULE with occurrence count', () => {
      const result = generateRRule({
        frequency: 'weekly',
        interval: 1,
        startDate: '2024-01-15',
        startTime: '10:00',
        occurrenceCount: 6,
      });

      expect(result.rruleString).toContain('COUNT=6');
    });

    it('should generate daily RRULE', () => {
      const result = generateRRule({
        frequency: 'daily',
        interval: 1,
        startDate: '2024-01-15',
        startTime: '09:00',
        occurrenceCount: 5,
      });

      expect(result.rruleString).toContain('FREQ=DAILY');
      expect(result.rruleString).toContain('COUNT=5');
    });
  });

  // ===================
  // Create Recurring Tests
  // ===================
  describe('POST /api/recurring', () => {
    it('should create weekly recurring pattern', async () => {
      const startDate = getNextDayOfWeek(1); // Next Monday

      const res = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        byDayOfWeek: [1], // Monday
        startDate,
        startTime: '10:00',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.pattern).toBeDefined();
      expect(data.pattern.frequency).toBe('weekly');
      expect(data.pattern.interval).toBe(1);
      expect(data.pattern.status).toBe('active');
      expect(data.pattern.rruleString).toContain('FREQ=WEEKLY');
    });

    it('should create biweekly recurring pattern', async () => {
      const startDate = getFutureDate(7);

      const res = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'biweekly',
        interval: 1,
        startDate,
        startTime: '14:00',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.pattern.frequency).toBe('biweekly');
      expect(data.pattern.rruleString).toContain('INTERVAL=2');
    });

    it('should create monthly recurring pattern by day of week', async () => {
      const startDate = getFutureDate(14);

      const res = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'monthly',
        interval: 1,
        byDayOfWeek: [1], // Monday
        bySetPos: 1, // First Monday
        startDate,
        startTime: '11:00',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.pattern.frequency).toBe('monthly');
      expect(data.pattern.bySetPos).toBe(1);
      expect(data.pattern.rruleString).toContain('FREQ=MONTHLY');
    });

    it('should create limited series (6 sessions)', async () => {
      const startDate = getFutureDate(7);

      const res = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 2,
        startDate,
        startTime: '15:00',
        occurrenceCount: 6,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.pattern.occurrenceCount).toBe(6);
      expect(data.pattern.rruleString).toContain('COUNT=6');
    });

    it('should create pattern with end date', async () => {
      const startDate = getFutureDate(7);
      const endDate = getFutureDate(90);

      const res = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
        endDate,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.pattern.endDate).toBe(endDate);
      expect(data.pattern.rruleString).toContain('UNTIL=');
    });

    it('should validate required fields', async () => {
      const res = await request('POST', '/api/recurring', {
        patientId: 'pat-001',
        // Missing required fields
      });

      expect(res.status).toBe(400);
    });

    it('should validate frequency enum', async () => {
      const res = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'invalid',
        startDate: getFutureDate(7),
        startTime: '10:00',
      });

      expect(res.status).toBe(400);
    });

    it('should calculate next occurrence on create', async () => {
      const startDate = getFutureDate(7);

      const res = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.pattern.nextOccurrence).toBeDefined();
    });
  });

  // ===================
  // List Recurring Tests
  // ===================
  describe('GET /api/recurring', () => {
    beforeEach(async () => {
      // Create some test patterns
      const startDate = getFutureDate(7);

      await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
      });

      await request('POST', '/api/recurring', {
        ...baseRecurringData,
        patientId: 'pat-002',
        patientName: 'John Doe',
        providerId: 'prov-2',
        frequency: 'biweekly',
        interval: 1,
        startDate,
        startTime: '14:00',
      });
    });

    it('should list all recurring patterns', async () => {
      const res = await request('GET', '/api/recurring');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.items).toHaveLength(2);
      expect(data.total).toBe(2);
    });

    it('should filter by patient', async () => {
      const res = await request('GET', '/api/recurring?patientId=pat-001');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((p: RecurringPattern) => p.patientId === 'pat-001')).toBe(true);
    });

    it('should filter by provider', async () => {
      const res = await request('GET', '/api/recurring?providerId=prov-2');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((p: RecurringPattern) => p.providerId === 'prov-2')).toBe(true);
    });

    it('should filter by status', async () => {
      const res = await request('GET', '/api/recurring?status=active');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((p: RecurringPattern) => p.status === 'active')).toBe(true);
    });

    it('should paginate results', async () => {
      const res = await request('GET', '/api/recurring?page=1&limit=1');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toHaveLength(1);
      expect(data.hasMore).toBe(true);
    });
  });

  // ===================
  // Get Single Pattern Tests
  // ===================
  describe('GET /api/recurring/:id', () => {
    it('should get recurring pattern by ID', async () => {
      const startDate = getFutureDate(7);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      const res = await request('GET', `/api/recurring/${patternId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.pattern.id).toBe(patternId);
    });

    it('should return 404 for non-existent pattern', async () => {
      const res = await request('GET', '/api/recurring/non-existent-id');

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Occurrences Expansion Tests
  // ===================
  describe('GET /api/recurring/:id/occurrences', () => {
    it('should expand occurrences for date range', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'daily',
        interval: 1,
        startDate,
        startTime: '10:00',
        occurrenceCount: 10,
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      const queryStartDate = startDate;
      const queryEndDate = getFutureDate(14);

      const res = await request(
        'GET',
        `/api/recurring/${patternId}/occurrences?startDate=${queryStartDate}&endDate=${queryEndDate}`
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.occurrences).toBeDefined();
      expect(data.occurrences.length).toBeGreaterThan(0);
      expect(data.occurrences.length).toBeLessThanOrEqual(10);
    });

    it('should include all occurrence details', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'daily',
        interval: 1,
        startDate,
        startTime: '10:00',
        occurrenceCount: 5,
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      const res = await request(
        'GET',
        `/api/recurring/${patternId}/occurrences?startDate=${startDate}&endDate=${getFutureDate(10)}`
      );

      const data = await res.json();
      const occurrence = data.occurrences[0];

      expect(occurrence.date).toBeDefined();
      expect(occurrence.startTime).toBeDefined();
      expect(occurrence.endTime).toBeDefined();
      expect(occurrence.patternId).toBe(patternId);
      expect(occurrence.providerId).toBe(baseRecurringData.providerId);
      expect(occurrence.patientId).toBe(baseRecurringData.patientId);
      expect(occurrence.status).toBe('scheduled');
    });

    it('should not include skipped occurrences by default', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'daily',
        interval: 1,
        startDate,
        startTime: '10:00',
        occurrenceCount: 5,
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      // Skip one occurrence
      await request('DELETE', `/api/recurring/${patternId}/occurrences/${startDate}`);

      const res = await request(
        'GET',
        `/api/recurring/${patternId}/occurrences?startDate=${startDate}&endDate=${getFutureDate(10)}`
      );

      const data = await res.json();
      const skippedOccurrence = data.occurrences.find(
        (o: any) => o.date === startDate && o.status === 'skipped'
      );
      expect(skippedOccurrence).toBeUndefined();
    });

    it('should include skipped occurrences when requested', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'daily',
        interval: 1,
        startDate,
        startTime: '10:00',
        occurrenceCount: 5,
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      // Skip one occurrence
      await request('DELETE', `/api/recurring/${patternId}/occurrences/${startDate}`);

      const res = await request(
        'GET',
        `/api/recurring/${patternId}/occurrences?startDate=${startDate}&endDate=${getFutureDate(10)}&includeSkipped=true`
      );

      const data = await res.json();
      const skippedOccurrence = data.occurrences.find(
        (o: any) => o.date === startDate && o.status === 'skipped'
      );
      expect(skippedOccurrence).toBeDefined();
    });
  });

  // ===================
  // Skip Occurrence Tests
  // ===================
  describe('DELETE /api/recurring/:id/occurrences/:date', () => {
    it('should skip single occurrence', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'daily',
        interval: 1,
        startDate,
        startTime: '10:00',
        occurrenceCount: 5,
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      const res = await request(
        'DELETE',
        `/api/recurring/${patternId}/occurrences/${startDate}`,
        { reason: 'Patient on vacation' }
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.exception.type).toBe('skip');
      expect(data.exception.reason).toBe('Patient on vacation');
    });

    it('should update pattern exceptions list', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'daily',
        interval: 1,
        startDate,
        startTime: '10:00',
        occurrenceCount: 5,
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      await request('DELETE', `/api/recurring/${patternId}/occurrences/${startDate}`);

      const getRes = await request('GET', `/api/recurring/${patternId}`);
      const getData = await getRes.json();

      expect(getData.pattern.exceptions).toHaveLength(1);
      expect(getData.pattern.exceptions[0].originalDate).toBe(startDate);
      expect(getData.pattern.exceptions[0].type).toBe('skip');
    });

    it('should reject skip for invalid date', async () => {
      const startDate = getFutureDate(7);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      // Try to skip a date that's not an occurrence
      const invalidDate = getFutureDate(1); // Not the start date
      const res = await request(
        'DELETE',
        `/api/recurring/${patternId}/occurrences/${invalidDate}`
      );

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Reschedule Occurrence Tests
  // ===================
  describe('PUT /api/recurring/:id/occurrences/:date (reschedule)', () => {
    it('should reschedule single occurrence to new date', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'daily',
        interval: 1,
        startDate,
        startTime: '10:00',
        occurrenceCount: 5,
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      const newDate = getFutureDate(10);
      const res = await request(
        'PUT',
        `/api/recurring/${patternId}/occurrences/${startDate}`,
        {
          type: 'reschedule',
          newDate,
          newTime: '15:00',
          reason: 'Patient requested different time',
        }
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.exception.type).toBe('reschedule');
      expect(data.exception.newDate).toBe(newDate);
      expect(data.exception.newTime).toBe('15:00');
    });

    it('should reschedule to different provider', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'daily',
        interval: 1,
        startDate,
        startTime: '10:00',
        occurrenceCount: 5,
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      const res = await request(
        'PUT',
        `/api/recurring/${patternId}/occurrences/${startDate}`,
        {
          type: 'reschedule',
          newProviderId: 'prov-2',
        }
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.exception.newProviderId).toBe('prov-2');
    });

    it('should reflect reschedule in expanded occurrences', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'daily',
        interval: 1,
        startDate,
        startTime: '10:00',
        occurrenceCount: 5,
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      const newDate = getFutureDate(10);
      await request(
        'PUT',
        `/api/recurring/${patternId}/occurrences/${startDate}`,
        {
          type: 'reschedule',
          newDate,
          newTime: '15:00',
        }
      );

      const res = await request(
        'GET',
        `/api/recurring/${patternId}/occurrences?startDate=${startDate}&endDate=${getFutureDate(15)}`
      );

      const data = await res.json();
      const rescheduledOccurrence = data.occurrences.find((o: any) => o.status === 'rescheduled');
      expect(rescheduledOccurrence).toBeDefined();
      expect(rescheduledOccurrence.date).toBe(newDate);
      expect(rescheduledOccurrence.originalDate).toBe(startDate);
    });
  });

  // ===================
  // Modify Occurrence Tests
  // ===================
  describe('PUT /api/recurring/:id/occurrences/:date (modify)', () => {
    it('should modify single occurrence service', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'daily',
        interval: 1,
        startDate,
        startTime: '10:00',
        occurrenceCount: 5,
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      const res = await request(
        'PUT',
        `/api/recurring/${patternId}/occurrences/${startDate}`,
        {
          type: 'modify',
          serviceId: 'svc-002',
          serviceName: 'Dermal Fillers',
          duration: 60,
        }
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.exception.type).toBe('modify');
      expect(data.exception.modifiedFields.serviceId).toBe('svc-002');
      expect(data.exception.modifiedFields.duration).toBe(60);
    });

    it('should modify occurrence notes', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'daily',
        interval: 1,
        startDate,
        startTime: '10:00',
        occurrenceCount: 5,
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      const res = await request(
        'PUT',
        `/api/recurring/${patternId}/occurrences/${startDate}`,
        {
          type: 'modify',
          notes: 'Special instructions for this appointment',
        }
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.exception.modifiedFields.notes).toBe('Special instructions for this appointment');
    });

    it('should reflect modifications in expanded occurrences', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'daily',
        interval: 1,
        startDate,
        startTime: '10:00',
        occurrenceCount: 5,
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      await request(
        'PUT',
        `/api/recurring/${patternId}/occurrences/${startDate}`,
        {
          type: 'modify',
          serviceId: 'svc-002',
          serviceName: 'Dermal Fillers',
          duration: 60,
        }
      );

      const res = await request(
        'GET',
        `/api/recurring/${patternId}/occurrences?startDate=${startDate}&endDate=${getFutureDate(10)}`
      );

      const data = await res.json();
      const modifiedOccurrence = data.occurrences.find((o: any) => o.date === startDate);
      expect(modifiedOccurrence.status).toBe('modified');
      expect(modifiedOccurrence.serviceId).toBe('svc-002');
      expect(modifiedOccurrence.duration).toBe(60);
    });
  });

  // ===================
  // End Series Early Tests
  // ===================
  describe('POST /api/recurring/:id/end', () => {
    it('should end series early', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      const endDate = getFutureDate(30);
      const res = await request(
        'POST',
        `/api/recurring/${patternId}/end`,
        {
          endDate,
          reason: 'Treatment completed early',
        }
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.pattern.endDate).toBe(endDate);
    });

    it('should mark series as completed if end date is in past', async () => {
      const startDate = getFutureDate(-30); // Started 30 days ago

      // Create pattern directly in store for this test
      const patternId = `rec-test-${Date.now()}`;
      const { rruleString } = generateRRule({
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
      });

      addMockRecurringPattern({
        id: patternId,
        patientId: 'pat-001',
        patientName: 'Sarah Johnson',
        serviceId: 'svc-001',
        serviceName: 'Botox Treatment',
        providerId: 'prov-1',
        providerName: 'Dr. Sarah Johnson',
        duration: 30,
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
        exceptions: [],
        status: 'active',
        rruleString,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'test-user',
      });

      const endDate = getFutureDate(-7); // End date is in the past
      const res = await request(
        'POST',
        `/api/recurring/${patternId}/end`,
        { endDate }
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.pattern.status).toBe('completed');
    });

    it('should not allow ending cancelled series', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      // Cancel the series
      await request('DELETE', `/api/recurring/${patternId}`);

      // Try to end it
      const res = await request(
        'POST',
        `/api/recurring/${patternId}/end`,
        { endDate: getFutureDate(30) }
      );

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Update All Future Tests
  // ===================
  describe('PUT /api/recurring/:id', () => {
    it('should update provider for all future occurrences', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      const res = await request(
        'PUT',
        `/api/recurring/${patternId}`,
        {
          providerId: 'prov-2',
          providerName: 'Dr. Emily Wilson',
          updateScope: 'all_future',
        }
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.pattern.providerId).toBe('prov-2');
      expect(data.pattern.providerName).toBe('Dr. Emily Wilson');
    });

    it('should update time for all occurrences', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      const res = await request(
        'PUT',
        `/api/recurring/${patternId}`,
        {
          startTime: '14:00',
          updateScope: 'all',
        }
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.pattern.startTime).toBe('14:00');
    });

    it('should update service details', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      const res = await request(
        'PUT',
        `/api/recurring/${patternId}`,
        {
          serviceId: 'svc-002',
          serviceName: 'Dermal Fillers',
          duration: 60,
        }
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.pattern.serviceId).toBe('svc-002');
      expect(data.pattern.duration).toBe(60);
    });

    it('should update end date', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      const newEndDate = getFutureDate(60);
      const res = await request(
        'PUT',
        `/api/recurring/${patternId}`,
        { endDate: newEndDate }
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.pattern.endDate).toBe(newEndDate);
      expect(data.pattern.rruleString).toContain('UNTIL=');
    });

    it('should update occurrence count', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      const res = await request(
        'PUT',
        `/api/recurring/${patternId}`,
        { occurrenceCount: 10 }
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.pattern.occurrenceCount).toBe(10);
      expect(data.pattern.rruleString).toContain('COUNT=10');
    });

    it('should pause series', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      const res = await request(
        'PUT',
        `/api/recurring/${patternId}`,
        { status: 'paused' }
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.pattern.status).toBe('paused');
    });

    it('should not allow updating cancelled pattern', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      // Cancel the series
      await request('DELETE', `/api/recurring/${patternId}`);

      // Try to update
      const res = await request(
        'PUT',
        `/api/recurring/${patternId}`,
        { duration: 60 }
      );

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Delete/Cancel Pattern Tests
  // ===================
  describe('DELETE /api/recurring/:id', () => {
    it('should cancel recurring pattern', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      const res = await request('DELETE', `/api/recurring/${patternId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.pattern.status).toBe('cancelled');
    });

    it('should return 404 for non-existent pattern', async () => {
      const res = await request('DELETE', '/api/recurring/non-existent-id');

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Conflict Detection Tests
  // ===================
  describe('Conflict Detection', () => {
    it('should detect provider conflicts', async () => {
      const startDate = getNextDayOfWeek(1); // Next Monday

      // Add existing appointment
      addMockAppointmentForConflict({
        id: 'apt-existing',
        providerId: 'prov-1',
        patientId: 'pat-999',
        startTime: new Date(`${startDate}T10:00:00Z`),
        endTime: new Date(`${startDate}T11:00:00Z`),
        status: 'scheduled',
      });

      const res = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        byDayOfWeek: [1],
        startDate,
        startTime: '10:00',
        checkConflicts: true,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.hasConflicts).toBe(true);
      expect(data.conflicts.some((c: any) => c.type === 'provider')).toBe(true);
    });

    it('should detect outside working hours conflicts', async () => {
      const startDate = getNextDayOfWeek(0); // Sunday - provider 1 doesn't work

      const res = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        byDayOfWeek: [0], // Sunday
        startDate,
        startTime: '10:00',
        checkConflicts: true,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.hasConflicts).toBe(true);
      expect(data.conflicts.some((c: any) => c.type === 'outside_hours')).toBe(true);
    });

    it('should detect patient double-booking', async () => {
      const startDate = getNextDayOfWeek(1);

      // Add existing appointment for same patient
      addMockAppointmentForConflict({
        id: 'apt-existing',
        providerId: 'prov-2',
        patientId: 'pat-001',
        startTime: new Date(`${startDate}T10:00:00Z`),
        endTime: new Date(`${startDate}T11:00:00Z`),
        status: 'scheduled',
      });

      const res = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        byDayOfWeek: [1],
        startDate,
        startTime: '10:00',
        checkConflicts: true,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.hasConflicts).toBe(true);
      expect(data.conflicts.some((c: any) => c.type === 'patient')).toBe(true);
    });

    it('should detect room conflicts', async () => {
      const startDate = getNextDayOfWeek(1);

      // Add existing appointment in same room
      addMockAppointmentForConflict({
        id: 'apt-existing',
        providerId: 'prov-2',
        patientId: 'pat-999',
        roomId: 'room-1',
        startTime: new Date(`${startDate}T10:00:00Z`),
        endTime: new Date(`${startDate}T11:00:00Z`),
        status: 'scheduled',
      });

      const res = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        byDayOfWeek: [1],
        startDate,
        startTime: '10:00',
        roomId: 'room-1',
        checkConflicts: true,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.hasConflicts).toBe(true);
      expect(data.conflicts.some((c: any) => c.type === 'room')).toBe(true);
    });

    it('should limit number of conflicts returned', async () => {
      const startDate = getNextDayOfWeek(0); // Sunday - all occurrences will conflict

      const res = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'daily',
        interval: 1,
        startDate,
        startTime: '10:00',
        occurrenceCount: 100,
        checkConflicts: true,
        maxConflictsToReturn: 5,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.conflicts.length).toBeLessThanOrEqual(5);
    });
  });

  // ===================
  // DST Handling Tests
  // ===================
  describe('DST Handling', () => {
    it('should maintain consistent time across DST transition', () => {
      // Create pattern that spans DST change
      const { rule, rruleString } = generateRRule({
        frequency: 'weekly',
        interval: 1,
        startDate: '2024-03-01',
        startTime: '10:00',
        endDate: '2024-04-30',
      });

      // Get all occurrences
      const startDate = new Date('2024-03-01T00:00:00Z');
      const endDate = new Date('2024-04-30T23:59:59Z');
      const occurrences = rule.between(startDate, endDate, true);

      // All occurrences should be at the same local time (10:00)
      expect(occurrences.length).toBeGreaterThan(0);
      for (const occ of occurrences) {
        expect(occ.getUTCHours()).toBe(10);
        expect(occ.getUTCMinutes()).toBe(0);
      }
    });

    it('should handle DST spring forward', () => {
      const { rule } = generateRRule({
        frequency: 'daily',
        interval: 1,
        startDate: '2024-03-09', // Day before DST starts
        startTime: '02:00',
        occurrenceCount: 3,
      });

      const startDate = new Date('2024-03-09T00:00:00Z');
      const endDate = new Date('2024-03-12T23:59:59Z');
      const occurrences = rule.between(startDate, endDate, true);

      expect(occurrences).toHaveLength(3);
    });

    it('should handle DST fall back', () => {
      const { rule } = generateRRule({
        frequency: 'daily',
        interval: 1,
        startDate: '2024-11-02', // Day before DST ends
        startTime: '01:00',
        occurrenceCount: 3,
      });

      const startDate = new Date('2024-11-02T00:00:00Z');
      const endDate = new Date('2024-11-05T23:59:59Z');
      const occurrences = rule.between(startDate, endDate, true);

      expect(occurrences).toHaveLength(3);
    });
  });

  // ===================
  // Edge Cases
  // ===================
  describe('Edge Cases', () => {
    it('should handle replacing existing exception', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'daily',
        interval: 1,
        startDate,
        startTime: '10:00',
        occurrenceCount: 5,
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      // First skip the occurrence
      await request('DELETE', `/api/recurring/${patternId}/occurrences/${startDate}`);

      // Then reschedule it instead
      const res = await request(
        'PUT',
        `/api/recurring/${patternId}/occurrences/${startDate}`,
        {
          type: 'reschedule',
          newDate: getFutureDate(10),
        }
      );

      expect(res.status).toBe(200);

      // Verify only one exception exists
      const getRes = await request('GET', `/api/recurring/${patternId}`);
      const getData = await getRes.json();
      expect(getData.pattern.exceptions).toHaveLength(1);
      expect(getData.pattern.exceptions[0].type).toBe('reschedule');
    });

    it('should handle empty date range in occurrences query', async () => {
      const startDate = getFutureDate(30);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      // Query before any occurrences
      const queryStartDate = getFutureDate(1);
      const queryEndDate = getFutureDate(10);

      const res = await request(
        'GET',
        `/api/recurring/${patternId}/occurrences?startDate=${queryStartDate}&endDate=${queryEndDate}`
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.occurrences).toHaveLength(0);
    });

    it('should handle monthly pattern with last day', () => {
      const { rule, rruleString } = generateRRule({
        frequency: 'monthly',
        interval: 1,
        startDate: '2024-01-31',
        startTime: '10:00',
        byDayOfMonth: 31,
        occurrenceCount: 6,
      });

      expect(rruleString).toContain('BYMONTHDAY=31');
    });

    it('should handle monthly pattern with last weekday', () => {
      const { rruleString } = generateRRule({
        frequency: 'monthly',
        interval: 1,
        startDate: '2024-01-29',
        startTime: '10:00',
        byDayOfWeek: [1], // Monday
        bySetPos: -1, // Last
      });

      expect(rruleString).toContain('BYSETPOS=-1');
    });

    it('should correctly expand monthly first Monday pattern', () => {
      const { rule } = generateRRule({
        frequency: 'monthly',
        interval: 1,
        startDate: '2024-01-01',
        startTime: '10:00',
        byDayOfWeek: [1],
        bySetPos: 1,
        occurrenceCount: 6,
      });

      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-07-01T00:00:00Z');
      const occurrences = rule.between(startDate, endDate, true);

      expect(occurrences.length).toBe(6);

      // First occurrence should be first Monday of January 2024 (Jan 1 is Monday)
      expect(occurrences[0].getUTCDate()).toBe(1);

      // Verify all are Mondays
      for (const occ of occurrences) {
        expect(occ.getUTCDay()).toBe(1); // Monday
      }
    });

    it('should update next occurrence after skipping', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'daily',
        interval: 1,
        startDate,
        startTime: '10:00',
        occurrenceCount: 5,
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;
      const originalNextOccurrence = createData.pattern.nextOccurrence;

      // Skip the first occurrence
      await request('DELETE', `/api/recurring/${patternId}/occurrences/${startDate}`);

      const getRes = await request('GET', `/api/recurring/${patternId}`);
      const getData = await getRes.json();

      // Next occurrence should be updated
      expect(getData.pattern.nextOccurrence).not.toBe(originalNextOccurrence);
    });

    it('should handle cancelled pattern having no occurrences', async () => {
      const startDate = getFutureDate(1);

      const createRes = await request('POST', '/api/recurring', {
        ...baseRecurringData,
        frequency: 'weekly',
        interval: 1,
        startDate,
        startTime: '10:00',
      });

      const createData = await createRes.json();
      const patternId = createData.pattern.id;

      // Cancel the pattern
      await request('DELETE', `/api/recurring/${patternId}`);

      // Query occurrences
      const res = await request(
        'GET',
        `/api/recurring/${patternId}/occurrences?startDate=${startDate}&endDate=${getFutureDate(30)}`
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.occurrences).toHaveLength(0);
    });
  });

  // ===================
  // Occurrence Expansion Unit Tests
  // ===================
  describe('expandOccurrences function', () => {
    it('should expand basic weekly pattern', () => {
      const { rruleString } = generateRRule({
        frequency: 'weekly',
        interval: 1,
        startDate: '2024-06-03', // Monday
        startTime: '10:00',
        occurrenceCount: 4,
      });

      const pattern: RecurringPattern = {
        id: 'test-pattern',
        patientId: 'pat-001',
        patientName: 'Test Patient',
        serviceId: 'svc-001',
        serviceName: 'Test Service',
        providerId: 'prov-1',
        providerName: 'Test Provider',
        duration: 30,
        frequency: 'weekly',
        interval: 1,
        startDate: '2024-06-03',
        startTime: '10:00',
        exceptions: [],
        status: 'active',
        rruleString,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'test',
      };

      const startDate = new Date('2024-06-01T00:00:00Z');
      const endDate = new Date('2024-06-30T23:59:59Z');

      const occurrences = expandOccurrences(pattern, startDate, endDate);

      expect(occurrences.length).toBe(4);
      expect(occurrences[0].date).toBe('2024-06-03');
      expect(occurrences[0].status).toBe('scheduled');
    });

    it('should apply skip exception', () => {
      const { rruleString } = generateRRule({
        frequency: 'weekly',
        interval: 1,
        startDate: '2024-06-03',
        startTime: '10:00',
        occurrenceCount: 4,
      });

      const pattern: RecurringPattern = {
        id: 'test-pattern',
        patientId: 'pat-001',
        patientName: 'Test Patient',
        serviceId: 'svc-001',
        serviceName: 'Test Service',
        providerId: 'prov-1',
        providerName: 'Test Provider',
        duration: 30,
        frequency: 'weekly',
        interval: 1,
        startDate: '2024-06-03',
        startTime: '10:00',
        exceptions: [
          {
            originalDate: '2024-06-10',
            type: 'skip',
            reason: 'Holiday',
            createdAt: new Date().toISOString(),
          },
        ],
        status: 'active',
        rruleString,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'test',
      };

      const startDate = new Date('2024-06-01T00:00:00Z');
      const endDate = new Date('2024-06-30T23:59:59Z');

      // Without skipped
      const occurrencesWithoutSkipped = expandOccurrences(pattern, startDate, endDate, false);
      expect(occurrencesWithoutSkipped.length).toBe(3);

      // With skipped
      const occurrencesWithSkipped = expandOccurrences(pattern, startDate, endDate, true);
      expect(occurrencesWithSkipped.length).toBe(4);
      const skipped = occurrencesWithSkipped.find(o => o.date === '2024-06-10');
      expect(skipped?.status).toBe('skipped');
    });

    it('should apply reschedule exception', () => {
      const { rruleString } = generateRRule({
        frequency: 'weekly',
        interval: 1,
        startDate: '2024-06-03',
        startTime: '10:00',
        occurrenceCount: 4,
      });

      const pattern: RecurringPattern = {
        id: 'test-pattern',
        patientId: 'pat-001',
        patientName: 'Test Patient',
        serviceId: 'svc-001',
        serviceName: 'Test Service',
        providerId: 'prov-1',
        providerName: 'Test Provider',
        duration: 30,
        frequency: 'weekly',
        interval: 1,
        startDate: '2024-06-03',
        startTime: '10:00',
        exceptions: [
          {
            originalDate: '2024-06-10',
            type: 'reschedule',
            newDate: '2024-06-12',
            newTime: '14:00',
            createdAt: new Date().toISOString(),
          },
        ],
        status: 'active',
        rruleString,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'test',
      };

      const startDate = new Date('2024-06-01T00:00:00Z');
      const endDate = new Date('2024-06-30T23:59:59Z');

      const occurrences = expandOccurrences(pattern, startDate, endDate);
      const rescheduled = occurrences.find(o => o.status === 'rescheduled');

      expect(rescheduled).toBeDefined();
      expect(rescheduled?.date).toBe('2024-06-12');
      expect(rescheduled?.originalDate).toBe('2024-06-10');
    });

    it('should apply modify exception', () => {
      const { rruleString } = generateRRule({
        frequency: 'weekly',
        interval: 1,
        startDate: '2024-06-03',
        startTime: '10:00',
        occurrenceCount: 4,
      });

      const pattern: RecurringPattern = {
        id: 'test-pattern',
        patientId: 'pat-001',
        patientName: 'Test Patient',
        serviceId: 'svc-001',
        serviceName: 'Test Service',
        providerId: 'prov-1',
        providerName: 'Test Provider',
        duration: 30,
        frequency: 'weekly',
        interval: 1,
        startDate: '2024-06-03',
        startTime: '10:00',
        exceptions: [
          {
            originalDate: '2024-06-10',
            type: 'modify',
            modifiedFields: {
              serviceId: 'svc-002',
              serviceName: 'Modified Service',
              duration: 60,
            },
            createdAt: new Date().toISOString(),
          },
        ],
        status: 'active',
        rruleString,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'test',
      };

      const startDate = new Date('2024-06-01T00:00:00Z');
      const endDate = new Date('2024-06-30T23:59:59Z');

      const occurrences = expandOccurrences(pattern, startDate, endDate);
      const modified = occurrences.find(o => o.date === '2024-06-10');

      expect(modified?.status).toBe('modified');
      expect(modified?.serviceId).toBe('svc-002');
      expect(modified?.serviceName).toBe('Modified Service');
      expect(modified?.duration).toBe(60);
    });
  });

  // ===================
  // Conflict Detection Unit Tests
  // ===================
  describe('checkSeriesConflicts function', () => {
    beforeEach(() => {
      clearMockAppointmentsForConflict();
    });

    it('should return empty conflicts for valid series', () => {
      const { rruleString } = generateRRule({
        frequency: 'weekly',
        interval: 1,
        startDate: '2024-06-03', // Monday
        startTime: '10:00',
        occurrenceCount: 4,
        byDayOfWeek: [1],
      });

      const conflicts = checkSeriesConflicts({
        providerId: 'prov-1',
        patientId: 'pat-001',
        startDate: '2024-06-03',
        startTime: '10:00',
        duration: 30,
        rruleString,
      });

      expect(conflicts.length).toBe(0);
    });

    it('should detect provider schedule conflicts', () => {
      const { rruleString } = generateRRule({
        frequency: 'weekly',
        interval: 1,
        startDate: '2024-06-02', // Sunday
        startTime: '10:00',
        occurrenceCount: 4,
        byDayOfWeek: [0],
      });

      const conflicts = checkSeriesConflicts({
        providerId: 'prov-1', // Doesn't work Sundays
        patientId: 'pat-001',
        startDate: '2024-06-02',
        startTime: '10:00',
        duration: 30,
        rruleString,
      });

      expect(conflicts.length).toBeGreaterThan(0);
      expect(conflicts[0].type).toBe('outside_hours');
    });

    it('should detect existing appointment conflicts', () => {
      // Add existing appointment
      addMockAppointmentForConflict({
        id: 'apt-existing',
        providerId: 'prov-1',
        patientId: 'pat-999',
        startTime: new Date('2024-06-03T10:00:00Z'),
        endTime: new Date('2024-06-03T11:00:00Z'),
        status: 'scheduled',
      });

      const { rruleString } = generateRRule({
        frequency: 'weekly',
        interval: 1,
        startDate: '2024-06-03',
        startTime: '10:00',
        occurrenceCount: 4,
        byDayOfWeek: [1],
      });

      const conflicts = checkSeriesConflicts({
        providerId: 'prov-1',
        patientId: 'pat-001',
        startDate: '2024-06-03',
        startTime: '10:00',
        duration: 30,
        rruleString,
      });

      expect(conflicts.some(c => c.type === 'provider')).toBe(true);
    });

    it('should respect max conflicts limit', () => {
      const { rruleString } = generateRRule({
        frequency: 'daily',
        interval: 1,
        startDate: '2024-06-02', // Sunday
        startTime: '10:00',
        occurrenceCount: 100,
      });

      const conflicts = checkSeriesConflicts(
        {
          providerId: 'prov-1',
          patientId: 'pat-001',
          startDate: '2024-06-02',
          startTime: '10:00',
          duration: 30,
          rruleString,
        },
        5
      );

      expect(conflicts.length).toBeLessThanOrEqual(5);
    });
  });
});
