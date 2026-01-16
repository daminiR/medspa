/**
 * Appointments API Tests
 *
 * Comprehensive test coverage for:
 * - List appointments with filters
 * - Get single appointment
 * - Create appointment (with and without conflicts)
 * - Update appointment
 * - Cancel appointment
 * - Status transitions
 * - Reschedule appointment
 * - Check conflicts endpoint
 * - Get availability slots
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import appointments, {
  clearStores,
  addMockAppointment,
  getMockAppointment,
  addMockBreak,
  appointmentsStore,
  Appointment,
  Break,
} from '../src/routes/appointments';
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
app.route('/api/appointments', appointments);
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

// Helper to get today's date with specific hour
function getTodayAtHour(hour: number, minute: number = 0): Date {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
  return today;
}

// Helper to get a date for a specific day of week (for testing schedules)
function getNextDayOfWeek(dayOfWeek: number): Date {
  const today = new Date();
  const currentDay = today.getDay();
  const daysUntil = (dayOfWeek - currentDay + 7) % 7 || 7;
  const result = new Date(today);
  result.setDate(today.getDate() + daysUntil);
  result.setHours(10, 0, 0, 0);
  return result;
}

describe('Appointments API', () => {
  beforeEach(() => {
    clearStores();
  });

  // ===================
  // List Appointments Tests
  // ===================
  describe('GET /api/appointments', () => {
    it('should list all appointments', async () => {
      const res = await request('GET', '/api/appointments');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeGreaterThan(0);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);
    });

    it('should filter by date range', async () => {
      // First get all appointments without filter
      const allRes = await request('GET', '/api/appointments');
      const allData = await allRes.json();
      const totalCount = allData.total;

      // Use a future date range that should have no appointments
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const futureRes = await request(
        'GET',
        `/api/appointments?startDate=${futureDateStr}`
      );

      expect(futureRes.status).toBe(200);
      const futureData = await futureRes.json();
      expect(futureData.success).toBe(true);
      expect(futureData.items.length).toBe(0); // No appointments in the future

      // Use a past date range that should filter out today's appointments
      const pastDate = new Date('2020-01-01');
      const pastDateEnd = new Date('2020-12-31');

      const pastRes = await request(
        'GET',
        `/api/appointments?startDate=${pastDate.toISOString().split('T')[0]}&endDate=${pastDateEnd.toISOString().split('T')[0]}`
      );

      expect(pastRes.status).toBe(200);
      const pastData = await pastRes.json();
      expect(pastData.success).toBe(true);
      expect(pastData.items.length).toBe(0); // No appointments from 2020
    });

    it('should filter by provider', async () => {
      const res = await request('GET', '/api/appointments?practitionerId=prov-1');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      for (const apt of data.items) {
        expect(apt.practitionerId).toBe('prov-1');
      }
    });

    it('should filter by patient', async () => {
      const res = await request('GET', '/api/appointments?patientId=pat-001');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      for (const apt of data.items) {
        expect(apt.patientId).toBe('pat-001');
      }
    });

    it('should filter by status', async () => {
      const res = await request('GET', '/api/appointments?status=confirmed');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      for (const apt of data.items) {
        expect(apt.status).toBe('confirmed');
      }
    });

    it('should filter by multiple statuses', async () => {
      const res = await request('GET', '/api/appointments?statuses=scheduled,confirmed');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      for (const apt of data.items) {
        expect(['scheduled', 'confirmed']).toContain(apt.status);
      }
    });

    it('should paginate results', async () => {
      const res = await request('GET', '/api/appointments?page=1&limit=2');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.items.length).toBeLessThanOrEqual(2);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(2);
    });
  });

  // ===================
  // Get Single Appointment Tests
  // ===================
  describe('GET /api/appointments/:id', () => {
    it('should get appointment by ID', async () => {
      const res = await request('GET', '/api/appointments/apt-001');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.appointment).toBeDefined();
      expect(data.appointment.id).toBe('apt-001');
      expect(data.appointment.patientName).toBe('Sarah Johnson');
    });

    it('should return 404 for non-existent appointment', async () => {
      const res = await request('GET', '/api/appointments/non-existent');

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Create Appointment Tests
  // ===================
  describe('POST /api/appointments', () => {
    it('should create a valid appointment', async () => {
      // Use a Monday at 3 PM for prov-1 (who works Mon-Fri 9-5)
      const nextMonday = getNextDayOfWeek(1);
      nextMonday.setHours(15, 0, 0, 0);

      const res = await request('POST', '/api/appointments', {
        patientId: 'pat-new',
        patientName: 'New Patient',
        patientPhone: '5551112222',
        patientEmail: 'new@example.com',
        practitionerId: 'prov-1',
        practitionerName: 'Dr. Sarah Johnson',
        serviceId: 'svc-001',
        serviceName: 'Botox Treatment',
        serviceCategory: 'aesthetics',
        startTime: nextMonday.toISOString(),
        duration: 30,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.appointment).toBeDefined();
      expect(data.appointment.patientName).toBe('New Patient');
      expect(data.appointment.status).toBe('scheduled');
    });

    it('should detect provider conflict', async () => {
      // Get apt-001's time slot (prov-1 at 10 AM)
      const apt001 = getMockAppointment('apt-001');
      expect(apt001).toBeDefined();

      const res = await request('POST', '/api/appointments', {
        patientId: 'pat-new',
        patientName: 'New Patient',
        practitionerId: 'prov-1',
        practitionerName: 'Dr. Sarah Johnson',
        serviceId: 'svc-001',
        serviceName: 'Botox Treatment',
        startTime: apt001!.startTime.toISOString(),
        duration: 30,
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.message).toContain('conflict');
    });

    it('should detect patient double-booking', async () => {
      // apt-001 is for pat-001 at 10 AM with prov-1
      // Try to book pat-001 with a different provider at same time
      const apt001 = getMockAppointment('apt-001');

      const res = await request('POST', '/api/appointments', {
        patientId: 'pat-001', // Same patient
        patientName: 'Sarah Johnson',
        practitionerId: 'prov-2', // Different provider
        practitionerName: 'Dr. Emily Wilson',
        serviceId: 'svc-002',
        serviceName: 'Chemical Peel',
        startTime: apt001!.startTime.toISOString(),
        duration: 30,
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.message).toContain('Patient already has an appointment');
    });

    it('should allow conflict override', async () => {
      const apt001 = getMockAppointment('apt-001');

      const res = await request('POST', '/api/appointments', {
        patientId: 'pat-new',
        patientName: 'New Patient',
        practitionerId: 'prov-1',
        practitionerName: 'Dr. Sarah Johnson',
        serviceId: 'svc-001',
        serviceName: 'Botox Treatment',
        startTime: apt001!.startTime.toISOString(),
        duration: 30,
        overriddenConflicts: true,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.appointment.overriddenConflicts).toBe(true);
    });

    it('should detect room conflict', async () => {
      // Create appointment with room
      const monday = getNextDayOfWeek(1);
      monday.setHours(10, 0, 0, 0);

      const firstRes = await request('POST', '/api/appointments', {
        patientId: 'pat-1',
        patientName: 'Patient One',
        practitionerId: 'prov-1',
        practitionerName: 'Dr. Sarah Johnson',
        serviceId: 'svc-001',
        serviceName: 'Treatment',
        startTime: monday.toISOString(),
        duration: 60,
        roomId: 'room-test-1',
      });
      expect(firstRes.status).toBe(201);

      // Try to book same room with different provider
      const secondRes = await request('POST', '/api/appointments', {
        patientId: 'pat-2',
        patientName: 'Patient Two',
        practitionerId: 'prov-2',
        practitionerName: 'Dr. Emily Wilson',
        serviceId: 'svc-002',
        serviceName: 'Other Treatment',
        startTime: monday.toISOString(),
        duration: 60,
        roomId: 'room-test-1', // Same room
      });

      expect(secondRes.status).toBe(409);
      const data = await secondRes.json();
      expect(data.message).toContain('Room is already booked');
    });

    it('should reject appointment outside working hours', async () => {
      // prov-1 works 9-5, try to book at 8 AM
      const monday = getNextDayOfWeek(1);
      monday.setHours(8, 0, 0, 0);

      const res = await request('POST', '/api/appointments', {
        patientId: 'pat-new',
        patientName: 'New Patient',
        practitionerId: 'prov-1',
        practitionerName: 'Dr. Sarah Johnson',
        serviceId: 'svc-001',
        serviceName: 'Botox Treatment',
        startTime: monday.toISOString(),
        duration: 30,
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.message).toContain('outside');
    });

    it('should reject appointment on non-working day', async () => {
      // prov-1 doesn't work on Sunday (day 0)
      const sunday = getNextDayOfWeek(0);
      sunday.setHours(10, 0, 0, 0);

      const res = await request('POST', '/api/appointments', {
        patientId: 'pat-new',
        patientName: 'New Patient',
        practitionerId: 'prov-1',
        practitionerName: 'Dr. Sarah Johnson',
        serviceId: 'svc-001',
        serviceName: 'Botox Treatment',
        startTime: sunday.toISOString(),
        duration: 30,
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.message).toContain('not scheduled to work');
    });
  });

  // ===================
  // Update Appointment Tests
  // ===================
  describe('PUT /api/appointments/:id', () => {
    it('should update appointment notes', async () => {
      const res = await request('PUT', '/api/appointments/apt-001', {
        notes: 'Updated notes for appointment',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.appointment.notes).toBe('Updated notes for appointment');
    });

    it('should update service details', async () => {
      const res = await request('PUT', '/api/appointments/apt-001', {
        serviceName: 'New Service Name',
        serviceId: 'svc-new',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.appointment.serviceName).toBe('New Service Name');
    });

    it('should reject update to cancelled appointment', async () => {
      const res = await request('PUT', '/api/appointments/apt-006', {
        notes: 'Trying to update cancelled',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('cancelled');
    });

    it('should return 404 for non-existent appointment', async () => {
      const res = await request('PUT', '/api/appointments/non-existent', {
        notes: 'test',
      });

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Cancel Appointment Tests
  // ===================
  describe('DELETE /api/appointments/:id', () => {
    it('should cancel appointment', async () => {
      const res = await request('DELETE', '/api/appointments/apt-002');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.appointment.status).toBe('cancelled');
      expect(data.appointment.cancelledAt).toBeDefined();
    });

    it('should cancel with reason', async () => {
      const res = await request('DELETE', '/api/appointments/apt-003', {
        reason: 'Patient requested cancellation',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.appointment.cancellationReason).toBe('Patient requested cancellation');
    });

    it('should return 404 for non-existent appointment', async () => {
      const res = await request('DELETE', '/api/appointments/non-existent');

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Status Transition Tests
  // ===================
  describe('PATCH /api/appointments/:id/status', () => {
    it('should transition scheduled to confirmed', async () => {
      const res = await request('PATCH', '/api/appointments/apt-002/status', {
        status: 'confirmed',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.appointment.status).toBe('confirmed');
    });

    it('should transition confirmed to arrived', async () => {
      const res = await request('PATCH', '/api/appointments/apt-001/status', {
        status: 'arrived',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.appointment.status).toBe('arrived');
    });

    it('should transition arrived to in_progress', async () => {
      const res = await request('PATCH', '/api/appointments/apt-004/status', {
        status: 'in_progress',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.appointment.status).toBe('in_progress');
    });

    it('should reject invalid transition scheduled to completed', async () => {
      const res = await request('PATCH', '/api/appointments/apt-002/status', {
        status: 'completed',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Invalid status transition');
    });

    it('should reject transition from completed', async () => {
      const res = await request('PATCH', '/api/appointments/apt-005/status', {
        status: 'cancelled',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Invalid status transition');
    });

    it('should reject transition from cancelled', async () => {
      const res = await request('PATCH', '/api/appointments/apt-006/status', {
        status: 'confirmed',
      });

      expect(res.status).toBe(400);
    });

    it('should allow scheduled to cancelled', async () => {
      const res = await request('PATCH', '/api/appointments/apt-002/status', {
        status: 'cancelled',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.appointment.status).toBe('cancelled');
      expect(data.appointment.cancelledAt).toBeDefined();
    });

    it('should allow scheduled to no_show', async () => {
      // Create a new appointment first
      const monday = getNextDayOfWeek(1);
      monday.setHours(16, 0, 0, 0);

      const createRes = await request('POST', '/api/appointments', {
        patientId: 'pat-noshow',
        patientName: 'No Show Patient',
        practitionerId: 'prov-1',
        practitionerName: 'Dr. Sarah Johnson',
        serviceId: 'svc-001',
        serviceName: 'Botox',
        startTime: monday.toISOString(),
        duration: 30,
      });
      const { appointment } = await createRes.json();

      const res = await request('PATCH', `/api/appointments/${appointment.id}/status`, {
        status: 'no_show',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.appointment.status).toBe('no_show');
    });
  });

  // ===================
  // Reschedule Tests
  // ===================
  describe('POST /api/appointments/:id/reschedule', () => {
    it('should reschedule to a valid time', async () => {
      // Reschedule apt-002 to a later time
      const apt = getMockAppointment('apt-002');
      const newTime = new Date(apt!.startTime);
      newTime.setHours(15, 0, 0, 0); // Move to 3 PM

      const res = await request('POST', '/api/appointments/apt-002/reschedule', {
        startTime: newTime.toISOString(),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(new Date(data.appointment.startTime).getHours()).toBe(15);
    });

    it('should reschedule to different provider', async () => {
      // Get apt-002 and reschedule to prov-2 (works Mon, Wed, Fri)
      // We need to pick a day when prov-2 works
      const wednesday = getNextDayOfWeek(3);
      wednesday.setHours(11, 0, 0, 0);

      const res = await request('POST', '/api/appointments/apt-002/reschedule', {
        startTime: wednesday.toISOString(),
        practitionerId: 'prov-2',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.appointment.practitionerId).toBe('prov-2');
    });

    it('should reject reschedule with conflict', async () => {
      // Try to reschedule apt-002 to same time as apt-001 (same provider)
      const apt001 = getMockAppointment('apt-001');

      const res = await request('POST', '/api/appointments/apt-002/reschedule', {
        startTime: apt001!.startTime.toISOString(),
      });

      expect(res.status).toBe(409);
    });

    it('should reject reschedule of cancelled appointment', async () => {
      const newTime = new Date();
      newTime.setHours(15, 0, 0, 0);

      const res = await request('POST', '/api/appointments/apt-006/reschedule', {
        startTime: newTime.toISOString(),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('cancelled');
    });

    it('should add reschedule note', async () => {
      // Create a new appointment on a day we know is open
      const wednesday = getNextDayOfWeek(3);
      wednesday.setHours(11, 0, 0, 0);

      const createRes = await request('POST', '/api/appointments', {
        patientId: 'pat-note-test',
        patientName: 'Note Test Patient',
        practitionerId: 'prov-2', // Works Mon, Wed, Fri 10-6
        practitionerName: 'Dr. Emily Wilson',
        serviceId: 'svc-001',
        serviceName: 'Test Service',
        startTime: wednesday.toISOString(),
        duration: 30,
      });
      expect(createRes.status).toBe(201);
      const { appointment } = await createRes.json();

      // Now reschedule to a later time
      const newTime = new Date(wednesday);
      newTime.setHours(16, 0, 0, 0);

      const res = await request('POST', `/api/appointments/${appointment.id}/reschedule`, {
        startTime: newTime.toISOString(),
        notes: 'Patient requested different time',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.appointment.notes).toContain('Rescheduled');
      expect(data.appointment.notes).toContain('Patient requested different time');
    });
  });

  // ===================
  // Check Conflicts Tests
  // ===================
  describe('POST /api/appointments/check-conflicts', () => {
    it('should detect no conflict for open slot', async () => {
      const monday = getNextDayOfWeek(1);
      monday.setHours(16, 0, 0, 0); // 4 PM should be free

      const res = await request('POST', '/api/appointments/check-conflicts', {
        practitionerId: 'prov-1',
        startTime: monday.toISOString(),
        duration: 30,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.hasConflict).toBe(false);
      expect(data.conflicts).toHaveLength(0);
    });

    it('should detect provider conflict', async () => {
      const apt001 = getMockAppointment('apt-001');

      const res = await request('POST', '/api/appointments/check-conflicts', {
        practitionerId: 'prov-1',
        startTime: apt001!.startTime.toISOString(),
        duration: 30,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.hasConflict).toBe(true);
      expect(data.conflicts.some((c: any) => c.type === 'provider')).toBe(true);
    });

    it('should exclude specified appointment from conflict check', async () => {
      const apt001 = getMockAppointment('apt-001');

      const res = await request('POST', '/api/appointments/check-conflicts', {
        practitionerId: 'prov-1',
        startTime: apt001!.startTime.toISOString(),
        duration: 30,
        excludeAppointmentId: 'apt-001',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      // Should not find conflict with apt-001 since it's excluded
      expect(data.conflicts.filter((c: any) => c.appointmentId === 'apt-001')).toHaveLength(0);
    });

    it('should detect break conflict', async () => {
      // prov-1 has a lunch break at 12-1 PM today
      const today = new Date();
      today.setHours(12, 15, 0, 0);

      const res = await request('POST', '/api/appointments/check-conflicts', {
        practitionerId: 'prov-1',
        startTime: today.toISOString(),
        duration: 30,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.hasConflict).toBe(true);
      expect(data.conflicts.some((c: any) => c.type === 'break')).toBe(true);
    });
  });

  // ===================
  // Availability Tests
  // ===================
  describe('GET /api/appointments/availability', () => {
    it('should return available slots for provider', async () => {
      const monday = getNextDayOfWeek(1);
      const dateStr = monday.toISOString().split('T')[0];

      const res = await request(
        'GET',
        `/api/appointments/availability?practitionerId=prov-1&date=${dateStr}&duration=30`
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.slots).toBeDefined();
      expect(Array.isArray(data.slots)).toBe(true);
      expect(data.practitionerName).toBe('Dr. Sarah Johnson');
    });

    it('should return empty slots for non-working day', async () => {
      const sunday = getNextDayOfWeek(0);
      const dateStr = sunday.toISOString().split('T')[0];

      const res = await request(
        'GET',
        `/api/appointments/availability?practitionerId=prov-1&date=${dateStr}&duration=30`
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.slots).toHaveLength(0);
    });

    it('should respect slot duration', async () => {
      const monday = getNextDayOfWeek(1);
      const dateStr = monday.toISOString().split('T')[0];

      const res = await request(
        'GET',
        `/api/appointments/availability?practitionerId=prov-1&date=${dateStr}&duration=60`
      );

      expect(res.status).toBe(200);
      const data = await res.json();

      // All slots should have 60 minute duration
      for (const slot of data.slots) {
        expect(slot.duration).toBe(60);
      }
    });

    it('should exclude times blocked by appointments', async () => {
      // Add an appointment at 10 AM on next Monday
      const monday = getNextDayOfWeek(1);
      const mondayAt10 = new Date(monday);
      mondayAt10.setHours(10, 0, 0, 0);
      const mondayAt11 = new Date(monday);
      mondayAt11.setHours(11, 0, 0, 0);

      addMockAppointment({
        id: 'apt-test-blocking',
        patientId: 'pat-test',
        patientName: 'Test Patient',
        practitionerId: 'prov-1',
        practitionerName: 'Dr. Sarah Johnson',
        serviceId: 'svc-001',
        serviceName: 'Test Service',
        serviceCategory: 'aesthetics',
        startTime: mondayAt10,
        endTime: mondayAt11,
        duration: 60,
        status: 'confirmed',
        color: '#8B5CF6',
        bookingType: 'scheduled',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const dateStr = monday.toISOString().split('T')[0];

      const res = await request(
        'GET',
        `/api/appointments/availability?practitionerId=prov-1&date=${dateStr}&duration=60`
      );

      expect(res.status).toBe(200);
      const data = await res.json();

      // No slots should overlap with 10-11 AM
      for (const slot of data.slots) {
        const slotStart = new Date(slot.startTime);
        const slotEnd = new Date(slot.endTime);

        // Check no overlap with 10-11 AM
        const overlaps =
          slotStart < mondayAt11 && slotEnd > mondayAt10;
        expect(overlaps).toBe(false);
      }
    });

    it('should be accessible without authentication', async () => {
      const monday = getNextDayOfWeek(1);
      const dateStr = monday.toISOString().split('T')[0];

      // Make request without auth header
      const req = new Request(
        `http://localhost/api/appointments/availability?practitionerId=prov-1&date=${dateStr}&duration=30`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // No Authorization header
          },
        }
      );

      const res = await app.fetch(req);
      expect(res.status).toBe(200);
    });
  });

  // ===================
  // Edge Case Tests
  // ===================
  describe('Edge Cases', () => {
    it('should handle back-to-back appointments', async () => {
      const monday = getNextDayOfWeek(1);
      const time1 = new Date(monday);
      time1.setHours(14, 0, 0, 0);
      const time2 = new Date(monday);
      time2.setHours(14, 30, 0, 0);

      // First appointment 2:00-2:30
      const res1 = await request('POST', '/api/appointments', {
        patientId: 'pat-1',
        patientName: 'Patient One',
        practitionerId: 'prov-1',
        practitionerName: 'Dr. Sarah Johnson',
        serviceId: 'svc-001',
        serviceName: 'Treatment 1',
        startTime: time1.toISOString(),
        duration: 30,
      });
      expect(res1.status).toBe(201);

      // Second appointment 2:30-3:00 (immediately after)
      const res2 = await request('POST', '/api/appointments', {
        patientId: 'pat-2',
        patientName: 'Patient Two',
        practitionerId: 'prov-1',
        practitionerName: 'Dr. Sarah Johnson',
        serviceId: 'svc-002',
        serviceName: 'Treatment 2',
        startTime: time2.toISOString(),
        duration: 30,
      });
      expect(res2.status).toBe(201);
    });

    it('should detect overlap at end of one appointment', async () => {
      const monday = getNextDayOfWeek(1);
      const time1 = new Date(monday);
      time1.setHours(14, 0, 0, 0);
      const time2 = new Date(monday);
      time2.setHours(14, 15, 0, 0); // Starts 15 min into first appointment

      // First appointment 2:00-2:30
      const res1 = await request('POST', '/api/appointments', {
        patientId: 'pat-1',
        patientName: 'Patient One',
        practitionerId: 'prov-1',
        practitionerName: 'Dr. Sarah Johnson',
        serviceId: 'svc-001',
        serviceName: 'Treatment 1',
        startTime: time1.toISOString(),
        duration: 30,
      });
      expect(res1.status).toBe(201);

      // Overlapping appointment
      const res2 = await request('POST', '/api/appointments', {
        patientId: 'pat-2',
        patientName: 'Patient Two',
        practitionerId: 'prov-1',
        practitionerName: 'Dr. Sarah Johnson',
        serviceId: 'svc-002',
        serviceName: 'Treatment 2',
        startTime: time2.toISOString(),
        duration: 30,
      });
      expect(res2.status).toBe(409);
    });

    it('should allow cancelled appointments to not block time slots', async () => {
      // apt-006 is cancelled at 4 PM with prov-1
      // Should be able to book at that time
      const apt006 = getMockAppointment('apt-006');
      expect(apt006?.status).toBe('cancelled');

      const res = await request('POST', '/api/appointments', {
        patientId: 'pat-new',
        patientName: 'New Patient',
        practitionerId: 'prov-1',
        practitionerName: 'Dr. Sarah Johnson',
        serviceId: 'svc-001',
        serviceName: 'Botox',
        startTime: apt006!.startTime.toISOString(),
        duration: 30,
      });

      expect(res.status).toBe(201);
    });

    it('should handle appointment at exact end of working hours', async () => {
      // prov-1 works until 5 PM (17:00)
      // Try to book 4:30-5:00 (should work)
      const monday = getNextDayOfWeek(1);
      monday.setHours(16, 30, 0, 0);

      const res = await request('POST', '/api/appointments', {
        patientId: 'pat-new',
        patientName: 'New Patient',
        practitionerId: 'prov-1',
        practitionerName: 'Dr. Sarah Johnson',
        serviceId: 'svc-001',
        serviceName: 'Botox',
        startTime: monday.toISOString(),
        duration: 30,
      });

      expect(res.status).toBe(201);
    });

    it('should reject appointment extending past working hours', async () => {
      // prov-1 works until 5 PM (17:00)
      // Try to book 4:45-5:15 (should fail)
      const monday = getNextDayOfWeek(1);
      monday.setHours(16, 45, 0, 0);

      const res = await request('POST', '/api/appointments', {
        patientId: 'pat-new',
        patientName: 'New Patient',
        practitionerId: 'prov-1',
        practitionerName: 'Dr. Sarah Johnson',
        serviceId: 'svc-001',
        serviceName: 'Botox',
        startTime: monday.toISOString(),
        duration: 30,
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.message).toContain('outside');
    });
  });
});
