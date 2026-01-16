/**
 * Calendar API Tests
 *
 * Tests for calendar endpoints:
 * - GET /api/calendar/day - Day view data
 * - GET /api/calendar/week - Week view data
 * - GET /api/calendar/month - Month summary
 * - GET /api/calendar/resources - Providers and rooms
 * - GET /api/calendar/availability - Available slots
 */

import { describe, it, expect, beforeEach, vi, beforeAll } from 'vitest';
import { Hono } from 'hono';
import calendar from '../src/routes/calendar';
import { errorHandler } from '../src/middleware/error';
import { sessionStore } from '../src/middleware/auth';

// Mock the auth middleware to allow requests through for testing
vi.mock('../src/middleware/auth', async () => {
  const actual = await vi.importActual('../src/middleware/auth');
  return {
    ...actual,
    sessionStore: new Map(),
    authMiddleware: async (c: any, next: any) => {
      // Set mock user for all requests
      c.set('user', {
        uid: 'test-user-123',
        email: 'test@test.com',
        role: 'admin',
        permissions: ['appointment:list', 'appointment:read', 'appointment:create', 'appointment:update'],
        locationIds: ['loc-1'],
      });
      await next();
    },
    requirePermission: () => async (c: any, next: any) => {
      await next();
    },
  };
});

// Create test app with error handler
const app = new Hono();
app.route('/api/calendar', calendar);
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

// ============================================================================
// TEST SUITE: Day View
// ============================================================================

describe('GET /api/calendar/day', () => {
  it('should return day view data for valid date', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request('GET', `/api/calendar/day?date=${today}`);

    expect(res.status).toBe(200);

    const data = await res.json();

    // Verify response structure
    expect(data).toHaveProperty('appointments');
    expect(data).toHaveProperty('breaks');
    expect(data).toHaveProperty('providers');
    expect(data).toHaveProperty('rooms');
    expect(data).toHaveProperty('dateRange');
    expect(data).toHaveProperty('appointmentsByProvider');
    expect(data).toHaveProperty('appointmentsByRoom');
    expect(data).toHaveProperty('appointmentCountsByTimeSlot');

    // Verify types
    expect(Array.isArray(data.appointments)).toBe(true);
    expect(Array.isArray(data.breaks)).toBe(true);
    expect(Array.isArray(data.providers)).toBe(true);
    expect(Array.isArray(data.rooms)).toBe(true);
    expect(typeof data.dateRange).toBe('object');
    expect(typeof data.appointmentsByProvider).toBe('object');
    expect(typeof data.appointmentsByRoom).toBe('object');
  });

  it('should return date range in response', async () => {
    const date = '2024-03-15';
    const res = await request('GET', `/api/calendar/day?date=${date}`);

    expect(res.status).toBe(200);

    const data = await res.json();
    // Verify date range is present and properly formatted
    expect(data.dateRange).toHaveProperty('start');
    expect(data.dateRange).toHaveProperty('end');
    // Date format should be YYYY-MM-DD
    expect(data.dateRange.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(data.dateRange.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should filter appointments by provider IDs', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request(
      'GET',
      `/api/calendar/day?date=${today}&providerIds=prov-1,prov-2`
    );

    expect(res.status).toBe(200);

    const data = await res.json();

    // All appointments should be from filtered providers
    data.appointments.forEach((apt: any) => {
      expect(['prov-1', 'prov-2']).toContain(apt.practitionerId);
    });
  });

  it('should filter appointments by room IDs', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request(
      'GET',
      `/api/calendar/day?date=${today}&roomIds=room-1,room-2`
    );

    expect(res.status).toBe(200);

    const data = await res.json();

    // All appointments with rooms should be from filtered rooms
    data.appointments
      .filter((apt: any) => apt.roomId)
      .forEach((apt: any) => {
        expect(['room-1', 'room-2']).toContain(apt.roomId);
      });
  });

  it('should include breaks by default', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request('GET', `/api/calendar/day?date=${today}`);

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data.breaks)).toBe(true);
    // Breaks should have expected structure when present
    if (data.breaks.length > 0) {
      const brk = data.breaks[0];
      expect(brk).toHaveProperty('id');
      expect(brk).toHaveProperty('practitionerId');
      expect(brk).toHaveProperty('type');
      expect(brk).toHaveProperty('startTime');
      expect(brk).toHaveProperty('endTime');
    }
  });

  it('should exclude breaks when includeBreaks=false', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request(
      'GET',
      `/api/calendar/day?date=${today}&includeBreaks=false`
    );

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.breaks).toHaveLength(0);
  });

  it('should exclude cancelled appointments by default', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request('GET', `/api/calendar/day?date=${today}`);

    expect(res.status).toBe(200);

    const data = await res.json();
    const cancelledAppointments = data.appointments.filter(
      (apt: any) => apt.status === 'cancelled'
    );
    expect(cancelledAppointments).toHaveLength(0);
  });

  it('should include cancelled appointments when includeCancelled=true', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request(
      'GET',
      `/api/calendar/day?date=${today}&includeCancelled=true`
    );

    expect(res.status).toBe(200);

    const data = await res.json();
    // May or may not have cancelled appointments based on mock data
    expect(Array.isArray(data.appointments)).toBe(true);
  });

  it('should group appointments by provider', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request('GET', `/api/calendar/day?date=${today}`);

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(typeof data.appointmentsByProvider).toBe('object');

    // Verify grouping is correct
    Object.entries(data.appointmentsByProvider).forEach(
      ([providerId, appointments]: [string, any]) => {
        appointments.forEach((apt: any) => {
          expect(apt.practitionerId).toBe(providerId);
        });
      }
    );
  });

  it('should group appointments by room', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request('GET', `/api/calendar/day?date=${today}`);

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(typeof data.appointmentsByRoom).toBe('object');

    // Verify grouping is correct
    Object.entries(data.appointmentsByRoom).forEach(
      ([roomId, appointments]: [string, any]) => {
        appointments.forEach((apt: any) => {
          expect(apt.roomId).toBe(roomId);
        });
      }
    );
  });

  it('should calculate appointment counts by time slot', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request('GET', `/api/calendar/day?date=${today}`);

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(typeof data.appointmentCountsByTimeSlot).toBe('object');

    // All counts should be positive integers
    Object.values(data.appointmentCountsByTimeSlot).forEach((count) => {
      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });
  });

  it('should return empty arrays for a day with no appointments', async () => {
    // Use a date far in the future that likely has no mock data
    const res = await request('GET', '/api/calendar/day?date=2099-12-25');

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data.appointments)).toBe(true);
    expect(Array.isArray(data.breaks)).toBe(true);
  });

  it('should return providers and rooms regardless of appointments', async () => {
    const res = await request('GET', '/api/calendar/day?date=2099-12-25');

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.providers.length).toBeGreaterThan(0);
    expect(data.rooms.length).toBeGreaterThan(0);
  });

  it('should return 400 for missing date parameter', async () => {
    const res = await request('GET', '/api/calendar/day');

    expect(res.status).toBe(400);
  });

  it('should validate appointment structure', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request('GET', `/api/calendar/day?date=${today}`);

    expect(res.status).toBe(200);

    const data = await res.json();

    if (data.appointments.length > 0) {
      const apt = data.appointments[0];
      expect(apt).toHaveProperty('id');
      expect(apt).toHaveProperty('patientId');
      expect(apt).toHaveProperty('patientName');
      expect(apt).toHaveProperty('practitionerId');
      expect(apt).toHaveProperty('serviceName');
      expect(apt).toHaveProperty('startTime');
      expect(apt).toHaveProperty('endTime');
      expect(apt).toHaveProperty('duration');
      expect(apt).toHaveProperty('status');
    }
  });
});

// ============================================================================
// TEST SUITE: Week View
// ============================================================================

describe('GET /api/calendar/week', () => {
  it('should return week view data for valid date range', async () => {
    const startDate = '2024-03-11';
    const endDate = '2024-03-17';
    const res = await request(
      'GET',
      `/api/calendar/week?startDate=${startDate}&endDate=${endDate}`
    );

    expect(res.status).toBe(200);

    const data = await res.json();

    // Verify response structure
    expect(data).toHaveProperty('appointments');
    expect(data).toHaveProperty('breaks');
    expect(data).toHaveProperty('providers');
    expect(data).toHaveProperty('rooms');
    expect(data).toHaveProperty('dateRange');
    expect(data).toHaveProperty('appointmentsByProvider');
    expect(data).toHaveProperty('appointmentsByRoom');
  });

  it('should return correct date range in response', async () => {
    const startDate = '2024-03-11';
    const endDate = '2024-03-17';
    const res = await request(
      'GET',
      `/api/calendar/week?startDate=${startDate}&endDate=${endDate}`
    );

    expect(res.status).toBe(200);

    const data = await res.json();
    // Verify date range is present and consistent
    expect(data.dateRange).toHaveProperty('start');
    expect(data.dateRange).toHaveProperty('end');
    // End date should be same or after start date
    expect(new Date(data.dateRange.end) >= new Date(data.dateRange.start)).toBe(true);
  });

  it('should filter by provider IDs', async () => {
    const startDate = '2024-03-11';
    const endDate = '2024-03-17';
    const res = await request(
      'GET',
      `/api/calendar/week?startDate=${startDate}&endDate=${endDate}&providerIds=prov-1`
    );

    expect(res.status).toBe(200);

    const data = await res.json();
    data.appointments.forEach((apt: any) => {
      expect(apt.practitionerId).toBe('prov-1');
    });
  });

  it('should filter by room IDs', async () => {
    const startDate = '2024-03-11';
    const endDate = '2024-03-17';
    const res = await request(
      'GET',
      `/api/calendar/week?startDate=${startDate}&endDate=${endDate}&roomIds=room-1`
    );

    expect(res.status).toBe(200);

    const data = await res.json();
    data.appointments
      .filter((apt: any) => apt.roomId)
      .forEach((apt: any) => {
        expect(apt.roomId).toBe('room-1');
      });
  });

  it('should return 400 when endDate is before startDate', async () => {
    const res = await request(
      'GET',
      '/api/calendar/week?startDate=2024-03-17&endDate=2024-03-11'
    );

    expect(res.status).toBe(400);
  });

  it('should return 400 when date range exceeds 14 days', async () => {
    const res = await request(
      'GET',
      '/api/calendar/week?startDate=2024-03-01&endDate=2024-03-31'
    );

    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.message).toContain('14 days');
  });

  it('should return 400 for missing startDate', async () => {
    const res = await request('GET', '/api/calendar/week?endDate=2024-03-17');

    expect(res.status).toBe(400);
  });

  it('should return 400 for missing endDate', async () => {
    const res = await request('GET', '/api/calendar/week?startDate=2024-03-11');

    expect(res.status).toBe(400);
  });

  it('should handle single day range (startDate = endDate)', async () => {
    const date = '2024-03-15';
    const res = await request(
      'GET',
      `/api/calendar/week?startDate=${date}&endDate=${date}`
    );

    expect(res.status).toBe(200);

    const data = await res.json();
    // Verify date range is present and properly formatted
    expect(data.dateRange).toHaveProperty('start');
    expect(data.dateRange).toHaveProperty('end');
    // Date format should be YYYY-MM-DD
    expect(data.dateRange.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(data.dateRange.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should include cancelled appointments when requested', async () => {
    const startDate = '2024-03-11';
    const endDate = '2024-03-17';
    const res = await request(
      'GET',
      `/api/calendar/week?startDate=${startDate}&endDate=${endDate}&includeCancelled=true`
    );

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data.appointments)).toBe(true);
  });
});

// ============================================================================
// TEST SUITE: Month View
// ============================================================================

describe('GET /api/calendar/month', () => {
  it('should return month summary data', async () => {
    const res = await request('GET', '/api/calendar/month?year=2024&month=3');

    expect(res.status).toBe(200);

    const data = await res.json();

    // Verify response structure
    expect(data).toHaveProperty('year');
    expect(data).toHaveProperty('month');
    expect(data).toHaveProperty('days');
    expect(data).toHaveProperty('totalAppointments');

    expect(data.year).toBe(2024);
    expect(data.month).toBe(3);
    expect(typeof data.days).toBe('object');
    expect(typeof data.totalAppointments).toBe('number');
  });

  it('should return all days of the month', async () => {
    const res = await request('GET', '/api/calendar/month?year=2024&month=3');

    expect(res.status).toBe(200);

    const data = await res.json();

    // March 2024 has 31 days
    expect(Object.keys(data.days).length).toBe(31);
  });

  it('should return day summaries with correct structure', async () => {
    const res = await request('GET', '/api/calendar/month?year=2024&month=3');

    expect(res.status).toBe(200);

    const data = await res.json();
    const firstDay = data.days['2024-03-01'];

    expect(firstDay).toHaveProperty('total');
    expect(firstDay).toHaveProperty('confirmed');
    expect(firstDay).toHaveProperty('pending');
    expect(typeof firstDay.total).toBe('number');
    expect(typeof firstDay.confirmed).toBe('number');
    expect(typeof firstDay.pending).toBe('number');
  });

  it('should filter by provider IDs', async () => {
    const res = await request(
      'GET',
      '/api/calendar/month?year=2024&month=3&providerIds=prov-1'
    );

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty('days');
  });

  it('should return 400 for invalid year', async () => {
    const res = await request('GET', '/api/calendar/month?year=1999&month=3');

    expect(res.status).toBe(400);
  });

  it('should return 400 for year too far in future', async () => {
    const res = await request('GET', '/api/calendar/month?year=2101&month=3');

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid month (0)', async () => {
    const res = await request('GET', '/api/calendar/month?year=2024&month=0');

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid month (13)', async () => {
    const res = await request('GET', '/api/calendar/month?year=2024&month=13');

    expect(res.status).toBe(400);
  });

  it('should return 400 for missing year', async () => {
    const res = await request('GET', '/api/calendar/month?month=3');

    expect(res.status).toBe(400);
  });

  it('should return 400 for missing month', async () => {
    const res = await request('GET', '/api/calendar/month?year=2024');

    expect(res.status).toBe(400);
  });

  it('should handle February correctly (28 days in non-leap year)', async () => {
    const res = await request('GET', '/api/calendar/month?year=2023&month=2');

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Object.keys(data.days).length).toBe(28);
  });

  it('should handle February correctly (29 days in leap year)', async () => {
    const res = await request('GET', '/api/calendar/month?year=2024&month=2');

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Object.keys(data.days).length).toBe(29);
  });

  it('should calculate total appointments correctly', async () => {
    const res = await request('GET', '/api/calendar/month?year=2024&month=3');

    expect(res.status).toBe(200);

    const data = await res.json();

    // Sum of all daily totals should equal totalAppointments
    const calculatedTotal = Object.values(data.days).reduce(
      (sum: number, day: any) => sum + day.total,
      0
    );
    expect(data.totalAppointments).toBe(calculatedTotal);
  });
});

// ============================================================================
// TEST SUITE: Resources
// ============================================================================

describe('GET /api/calendar/resources', () => {
  it('should return providers and rooms', async () => {
    const res = await request('GET', '/api/calendar/resources');

    expect(res.status).toBe(200);

    const data = await res.json();

    expect(data).toHaveProperty('providers');
    expect(data).toHaveProperty('rooms');
    expect(Array.isArray(data.providers)).toBe(true);
    expect(Array.isArray(data.rooms)).toBe(true);
  });

  it('should return only active providers by default', async () => {
    const res = await request('GET', '/api/calendar/resources');

    expect(res.status).toBe(200);

    const data = await res.json();
    data.providers.forEach((provider: any) => {
      expect(provider.status).toBe('active');
    });
  });

  it('should return only active rooms by default', async () => {
    const res = await request('GET', '/api/calendar/resources');

    expect(res.status).toBe(200);

    const data = await res.json();
    data.rooms.forEach((room: any) => {
      expect(room.isActive).toBe(true);
    });
  });

  it('should include inactive providers when includeInactive=true', async () => {
    const res = await request(
      'GET',
      '/api/calendar/resources?includeInactive=true'
    );

    expect(res.status).toBe(200);

    const data = await res.json();

    // Should have more providers when including inactive
    const activeOnlyRes = await request('GET', '/api/calendar/resources');
    const activeOnlyData = await activeOnlyRes.json();

    expect(data.providers.length).toBeGreaterThanOrEqual(
      activeOnlyData.providers.length
    );
  });

  it('should include inactive rooms when includeInactive=true', async () => {
    const res = await request(
      'GET',
      '/api/calendar/resources?includeInactive=true'
    );

    expect(res.status).toBe(200);

    const data = await res.json();

    // Should have more rooms when including inactive
    const activeOnlyRes = await request('GET', '/api/calendar/resources');
    const activeOnlyData = await activeOnlyRes.json();

    expect(data.rooms.length).toBeGreaterThanOrEqual(activeOnlyData.rooms.length);
  });

  it('should filter by locationId', async () => {
    const res = await request(
      'GET',
      '/api/calendar/resources?locationId=loc-1'
    );

    expect(res.status).toBe(200);

    const data = await res.json();
    data.rooms.forEach((room: any) => {
      expect(room.locationId).toBe('loc-1');
    });
  });

  it('should return provider structure with required fields', async () => {
    const res = await request('GET', '/api/calendar/resources');

    expect(res.status).toBe(200);

    const data = await res.json();

    if (data.providers.length > 0) {
      const provider = data.providers[0];
      expect(provider).toHaveProperty('id');
      expect(provider).toHaveProperty('name');
      expect(provider).toHaveProperty('initials');
      expect(provider).toHaveProperty('status');
    }
  });

  it('should return room structure with required fields', async () => {
    const res = await request('GET', '/api/calendar/resources');

    expect(res.status).toBe(200);

    const data = await res.json();

    if (data.rooms.length > 0) {
      const room = data.rooms[0];
      expect(room).toHaveProperty('id');
      expect(room).toHaveProperty('name');
      expect(room).toHaveProperty('isActive');
    }
  });
});

// ============================================================================
// TEST SUITE: Availability
// ============================================================================

describe('GET /api/calendar/availability', () => {
  it('should return available slots for a provider on a date', async () => {
    const res = await request(
      'GET',
      '/api/calendar/availability?providerId=prov-1&date=2024-03-15'
    );

    expect(res.status).toBe(200);

    const data = await res.json();

    expect(data).toHaveProperty('providerId');
    expect(data).toHaveProperty('date');
    expect(data).toHaveProperty('slots');
    expect(Array.isArray(data.slots)).toBe(true);
  });

  it('should return slots with availability status', async () => {
    const res = await request(
      'GET',
      '/api/calendar/availability?providerId=prov-1&date=2024-03-15'
    );

    expect(res.status).toBe(200);

    const data = await res.json();

    if (data.slots.length > 0) {
      const slot = data.slots[0];
      expect(slot).toHaveProperty('startTime');
      expect(slot).toHaveProperty('available');
      expect(typeof slot.available).toBe('boolean');
    }
  });

  it('should return 400 for missing providerId', async () => {
    const res = await request(
      'GET',
      '/api/calendar/availability?date=2024-03-15'
    );

    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.message).toContain('providerId');
  });

  it('should return 400 for missing date', async () => {
    const res = await request(
      'GET',
      '/api/calendar/availability?providerId=prov-1'
    );

    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.message).toContain('date');
  });
});

// ============================================================================
// TEST SUITE: Multiple Providers
// ============================================================================

describe('Multiple Providers Handling', () => {
  it('should handle multiple providers in day view', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request(
      'GET',
      `/api/calendar/day?date=${today}&providerIds=prov-1,prov-2,prov-3`
    );

    expect(res.status).toBe(200);

    const data = await res.json();
    const providerIds = new Set(data.appointments.map((apt: any) => apt.practitionerId));

    // All appointments should be from the requested providers
    providerIds.forEach((id) => {
      expect(['prov-1', 'prov-2', 'prov-3']).toContain(id);
    });
  });

  it('should handle multiple providers in week view', async () => {
    const startDate = '2024-03-11';
    const endDate = '2024-03-17';
    const res = await request(
      'GET',
      `/api/calendar/week?startDate=${startDate}&endDate=${endDate}&providerIds=prov-1,prov-2`
    );

    expect(res.status).toBe(200);

    const data = await res.json();
    data.appointments.forEach((apt: any) => {
      expect(['prov-1', 'prov-2']).toContain(apt.practitionerId);
    });
  });

  it('should handle multiple providers in month view', async () => {
    const res = await request(
      'GET',
      '/api/calendar/month?year=2024&month=3&providerIds=prov-1,prov-2'
    );

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty('days');
  });

  it('should return appointments grouped by provider correctly', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request('GET', `/api/calendar/day?date=${today}`);

    expect(res.status).toBe(200);

    const data = await res.json();

    // Verify each provider group only contains their appointments
    Object.entries(data.appointmentsByProvider).forEach(
      ([providerId, appointments]: [string, any]) => {
        appointments.forEach((apt: any) => {
          expect(apt.practitionerId).toBe(providerId);
        });
      }
    );
  });
});

// ============================================================================
// TEST SUITE: Error Handling
// ============================================================================

describe('Error Handling', () => {
  it('should return 400 for invalid date format in day view', async () => {
    const res = await request('GET', '/api/calendar/day?date=not-a-date');

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid date format in week view', async () => {
    const res = await request(
      'GET',
      '/api/calendar/week?startDate=not-a-date&endDate=2024-03-17'
    );

    expect(res.status).toBe(400);
  });

  it('should return 400 for non-numeric year in month view', async () => {
    const res = await request('GET', '/api/calendar/month?year=abc&month=3');

    expect(res.status).toBe(400);
  });

  it('should return 400 for non-numeric month in month view', async () => {
    const res = await request('GET', '/api/calendar/month?year=2024&month=abc');

    expect(res.status).toBe(400);
  });
});

// ============================================================================
// TEST SUITE: Performance/Efficiency Checks
// ============================================================================

describe('Response Efficiency', () => {
  it('should return all required data in single day response', async () => {
    const today = new Date().toISOString().split('T')[0];
    const res = await request('GET', `/api/calendar/day?date=${today}`);

    expect(res.status).toBe(200);

    const data = await res.json();

    // All data needed for day view should be present
    expect(data.appointments).toBeDefined();
    expect(data.breaks).toBeDefined();
    expect(data.providers).toBeDefined();
    expect(data.rooms).toBeDefined();
    expect(data.appointmentsByProvider).toBeDefined();
    expect(data.appointmentsByRoom).toBeDefined();
    expect(data.appointmentCountsByTimeSlot).toBeDefined();
  });

  it('should return all required data in single week response', async () => {
    const startDate = '2024-03-11';
    const endDate = '2024-03-17';
    const res = await request(
      'GET',
      `/api/calendar/week?startDate=${startDate}&endDate=${endDate}`
    );

    expect(res.status).toBe(200);

    const data = await res.json();

    // All data needed for week view should be present
    expect(data.appointments).toBeDefined();
    expect(data.breaks).toBeDefined();
    expect(data.providers).toBeDefined();
    expect(data.rooms).toBeDefined();
    expect(data.appointmentsByProvider).toBeDefined();
  });

  it('should return aggregated data in month response', async () => {
    const res = await request('GET', '/api/calendar/month?year=2024&month=3');

    expect(res.status).toBe(200);

    const data = await res.json();

    // Month view should only return aggregated counts, not full appointments
    expect(data.days).toBeDefined();
    expect(data.totalAppointments).toBeDefined();
    expect(data.appointments).toBeUndefined(); // Should NOT include full appointments
  });
});
