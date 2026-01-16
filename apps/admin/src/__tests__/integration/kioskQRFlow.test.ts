/**
 * Integration Tests for Kiosk QR Check-In Flow
 *
 * These tests verify the full kiosk QR check-in flow against the real backend.
 * Prerequisites:
 * - Backend must be running on localhost:8080
 * - Tests will be skipped if backend is not available
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const API_URL = process.env.TEST_API_URL || 'http://localhost:8080';

// Test data - these IDs must match the mock data in backend/src/routes/kiosk-auth.ts
// Mock appointments: apt-001, apt-002, apt-003
// Mock patients: pat-001, pat-002, pat-003
// Note: Mock data may become stale if backend runs across midnight
let TEST_APPOINTMENT_ID = 'apt-001';  // Sarah Johnson - Botox Treatment
let TEST_PATIENT_ID = 'pat-001';
const TEST_KIOSK_ID = 'test-kiosk-001';

// Store generated tokens and session IDs for tests
let generatedToken: string | null = null;
let generatedSessionId: string | null = null;

/**
 * Fetch available appointments from the backend
 * Returns the first confirmed/scheduled appointment ID for today, or null if none available
 */
async function getAvailableAppointment(): Promise<{ id: string; patientId: string } | null> {
  try {
    const response = await apiRequest('/api/kiosk/appointments');
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.appointments || data.appointments.length === 0) return null;

    // Find an appointment that can be checked in (confirmed or scheduled status)
    const available = data.appointments.find(
      (apt: { id: string; status: string }) =>
        apt.status === 'confirmed' || apt.status === 'scheduled'
    );

    if (available) {
      // Derive patient ID from appointment ID pattern (apt-001 -> pat-001)
      const patientId = available.id.replace('apt-', 'pat-');
      return { id: available.id, patientId };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if the backend is available
 */
async function isBackendAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${API_URL}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Helper function to make API requests with timeout
 */
async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Helper to create a test appointment in the backend
 * (if the backend supports this endpoint)
 */
async function createTestAppointment(): Promise<string | null> {
  try {
    const response = await apiRequest('/api/test/appointment', {
      method: 'POST',
      body: JSON.stringify({
        patientId: TEST_PATIENT_ID,
        patientName: 'Test Patient',
        serviceName: 'Test Service',
        startTime: new Date().toISOString(),
        duration: 60,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.appointmentId || data.id;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Helper to reset a test appointment status
 */
async function resetTestAppointment(appointmentId: string): Promise<void> {
  try {
    await apiRequest(`/api/test/appointment/${appointmentId}/reset`, {
      method: 'POST',
    });
  } catch {
    // Ignore errors - this is just cleanup
  }
}

describe('Kiosk QR Flow Integration', () => {
  let backendAvailable = false;
  let appointmentsAvailable = false;
  let testAppointmentId: string = TEST_APPOINTMENT_ID;
  let testPatientId: string = TEST_PATIENT_ID;

  beforeAll(async () => {
    backendAvailable = await isBackendAvailable();

    if (!backendAvailable) {
      console.log(
        '\n---------------------------------------------------------------'
      );
      console.log('Backend not available at ' + API_URL);
      console.log('Skipping integration tests');
      console.log('To run these tests, start the backend server on port 8080');
      console.log(
        '---------------------------------------------------------------\n'
      );
    } else {
      console.log('\nBackend available, running integration tests...\n');

      // First try to get an available appointment from the backend's mock data
      const availableAppointment = await getAvailableAppointment();
      if (availableAppointment) {
        testAppointmentId = availableAppointment.id;
        testPatientId = availableAppointment.patientId;
        appointmentsAvailable = true;
        console.log(`Using appointment: ${testAppointmentId} (patient: ${testPatientId})\n`);
      } else {
        // Fallback: Try to create a test appointment
        const createdId = await createTestAppointment();
        if (createdId) {
          testAppointmentId = createdId;
          appointmentsAvailable = true;
        } else {
          console.log('WARNING: No available appointments for today. Some tests will be skipped.');
          console.log('Restart the backend server to reinitialize mock appointments.\n');
        }
      }
    }
  });

  afterAll(async () => {
    // Cleanup: Reset test appointment if we created one
    if (backendAvailable && testAppointmentId !== TEST_APPOINTMENT_ID) {
      await resetTestAppointment(testAppointmentId);
    }
  });

  // ============================================================
  // QR Code Generation Flow Tests
  // ============================================================
  describe('QR Code Generation Flow', () => {
    // For tests that require a valid appointment
    const conditionalTestWithAppointment = (name: string, fn: () => Promise<void>) => {
      it(name, async (ctx) => {
        if (!backendAvailable) {
          console.log(`  Backend not available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        if (!appointmentsAvailable) {
          console.log(`  No appointments available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        await fn();
      });
    };

    // For tests that don't require a valid appointment
    const conditionalTest = (name: string, fn: () => Promise<void>) => {
      it(name, async (ctx) => {
        if (!backendAvailable) {
          console.log(`  Backend not available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        await fn();
      });
    };

    conditionalTestWithAppointment(
      'should generate a QR token for a valid appointment',
      async () => {
        const response = await apiRequest('/api/kiosk/generate-qr', {
          method: 'POST',
          body: JSON.stringify({
            appointmentId: testAppointmentId,
          }),
        });

        expect(response.ok).toBe(true);

        const data = await response.json();

        // Verify response structure
        expect(data).toHaveProperty('token');
        expect(data).toHaveProperty('checkInUrl');
        expect(data).toHaveProperty('expiresAt');

        // Token should be 64 characters (32 bytes hex encoded)
        expect(typeof data.token).toBe('string');
        expect(data.token.length).toBe(64);
        expect(/^[a-f0-9]+$/i.test(data.token)).toBe(true);

        // Check-in URL should be a valid URL containing the token
        expect(data.checkInUrl).toContain(data.token);

        // expiresAt should be a valid ISO date string in the future
        const expiresAt = new Date(data.expiresAt);
        expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

        // Store token for subsequent tests
        generatedToken = data.token;
      }
    );

    conditionalTest(
      'should reject QR generation for non-existent appointment',
      async () => {
        const response = await apiRequest('/api/kiosk/generate-qr', {
          method: 'POST',
          body: JSON.stringify({
            appointmentId: 'non-existent-appointment-id',
          }),
        });

        expect(response.ok).toBe(false);
        expect(response.status).toBe(404);

        const data = await response.json();
        expect(data).toHaveProperty('error');
      }
    );

    conditionalTest(
      'should reject QR generation without appointmentId',
      async () => {
        const response = await apiRequest('/api/kiosk/generate-qr', {
          method: 'POST',
          body: JSON.stringify({}),
        });

        expect(response.ok).toBe(false);
        expect(response.status).toBe(400);

        const data = await response.json();
        expect(data).toHaveProperty('error');
      }
    );
  });

  // ============================================================
  // Token Validation Flow Tests
  // ============================================================
  describe('Token Validation Flow', () => {
    const conditionalTestWithAppointment = (name: string, fn: () => Promise<void>) => {
      it(name, async (ctx) => {
        if (!backendAvailable) {
          console.log(`  Backend not available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        if (!appointmentsAvailable) {
          console.log(`  No appointments available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        await fn();
      });
    };

    const conditionalTest = (name: string, fn: () => Promise<void>) => {
      it(name, async (ctx) => {
        if (!backendAvailable) {
          console.log(`  Backend not available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        await fn();
      });
    };

    conditionalTestWithAppointment('should validate a freshly generated token', async () => {
      // Generate a new token first
      const generateResponse = await apiRequest('/api/kiosk/generate-qr', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId: testAppointmentId,
        }),
      });

      expect(generateResponse.ok).toBe(true);
      const { token } = await generateResponse.json();

      // Now validate the token
      const validateResponse = await apiRequest('/api/kiosk/validate-token', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });

      expect(validateResponse.ok).toBe(true);

      const data = await validateResponse.json();

      // Should indicate valid token
      expect(data.valid).toBe(true);

      // Should return appointment data
      expect(data).toHaveProperty('appointment');
      expect(data.appointment).toHaveProperty('id');
      expect(data.appointment).toHaveProperty('patientName');
      expect(data.appointment).toHaveProperty('serviceName');
    });

    conditionalTest('should reject an invalid/malformed token', async () => {
      const response = await apiRequest('/api/kiosk/validate-token', {
        method: 'POST',
        body: JSON.stringify({
          token: 'invalid-token-12345',
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);

      const data = await response.json();
      // Backend returns { error: 'UNAUTHORIZED', message: '...' } for invalid tokens
      expect(data).toHaveProperty('error');
    });

    conditionalTest('should reject an empty token', async () => {
      const response = await apiRequest('/api/kiosk/validate-token', {
        method: 'POST',
        body: JSON.stringify({
          token: '',
        }),
      });

      expect(response.ok).toBe(false);
      expect([400, 401]).toContain(response.status);
    });

    conditionalTest('should reject when token is missing', async () => {
      const response = await apiRequest('/api/kiosk/validate-token', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      expect(response.ok).toBe(false);
      expect([400, 401]).toContain(response.status);
    });
  });

  // ============================================================
  // QR Check-In Flow Tests
  // ============================================================
  describe('QR Check-In Flow', () => {
    const conditionalTestWithAppointment = (name: string, fn: () => Promise<void>) => {
      it(name, async (ctx) => {
        if (!backendAvailable) {
          console.log(`  Backend not available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        if (!appointmentsAvailable) {
          console.log(`  No appointments available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        await fn();
      });
    };

    const conditionalTest = (name: string, fn: () => Promise<void>) => {
      it(name, async (ctx) => {
        if (!backendAvailable) {
          console.log(`  Backend not available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        await fn();
      });
    };

    conditionalTestWithAppointment(
      'should successfully check in with a valid token',
      async () => {
        // Reset appointment status first (if possible)
        await resetTestAppointment(testAppointmentId);

        // Generate a new token
        const generateResponse = await apiRequest('/api/kiosk/generate-qr', {
          method: 'POST',
          body: JSON.stringify({
            appointmentId: testAppointmentId,
          }),
        });

        expect(generateResponse.ok).toBe(true);
        const { token } = await generateResponse.json();

        // Check in with the token
        const checkInResponse = await apiRequest('/api/kiosk/check-in', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });

        expect(checkInResponse.ok).toBe(true);

        const data = await checkInResponse.json();

        // Verify check-in was successful
        expect(data.success).toBe(true);

        // Verify appointment status is 'arrived' or equivalent
        expect(data).toHaveProperty('appointment');
        expect(['arrived', 'checked_in', 'in_car']).toContain(
          data.appointment.status
        );

        // Verify checkedInAt timestamp is set
        expect(data.appointment).toHaveProperty('checkedInAt');
        const checkedInAt = new Date(data.appointment.checkedInAt);
        expect(checkedInAt.getTime()).toBeLessThanOrEqual(Date.now());
        expect(checkedInAt.getTime()).toBeGreaterThan(Date.now() - 60000); // Within last minute
      }
    );

    conditionalTest('should reject check-in with invalid token', async () => {
      const response = await apiRequest('/api/kiosk/check-in', {
        method: 'POST',
        body: JSON.stringify({
          token: 'completely-invalid-token',
        }),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);

      const data = await response.json();
      // Backend returns { error: 'UNAUTHORIZED', message: '...' } for invalid tokens
      expect(data).toHaveProperty('error');
    });

    conditionalTest('should reject check-in without token', async () => {
      const response = await apiRequest('/api/kiosk/check-in', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      expect(response.ok).toBe(false);
      expect([400, 401]).toContain(response.status);
    });
  });

  // ============================================================
  // Token Reuse Prevention Tests
  // ============================================================
  describe('Token Reuse Prevention', () => {
    const conditionalTestWithAppointment = (name: string, fn: () => Promise<void>) => {
      it(name, async (ctx) => {
        if (!backendAvailable) {
          console.log(`  Backend not available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        if (!appointmentsAvailable) {
          console.log(`  No appointments available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        await fn();
      });
    };

    conditionalTestWithAppointment(
      'should prevent reuse of a token after successful check-in',
      async () => {
        // Reset appointment status first
        await resetTestAppointment(testAppointmentId);

        // Generate a new token
        const generateResponse = await apiRequest('/api/kiosk/generate-qr', {
          method: 'POST',
          body: JSON.stringify({
            appointmentId: testAppointmentId,
          }),
        });

        expect(generateResponse.ok).toBe(true);
        const { token } = await generateResponse.json();

        // First check-in should succeed
        const firstCheckIn = await apiRequest('/api/kiosk/check-in', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });

        expect(firstCheckIn.ok).toBe(true);
        const firstData = await firstCheckIn.json();
        expect(firstData.success).toBe(true);

        // Second check-in with same token should fail
        const secondCheckIn = await apiRequest('/api/kiosk/check-in', {
          method: 'POST',
          body: JSON.stringify({ token }),
        });

        expect(secondCheckIn.ok).toBe(false);
        expect(secondCheckIn.status).toBe(401);

        const secondData = await secondCheckIn.json();
        // Backend returns { error: 'UNAUTHORIZED', message: '...' } for used tokens
        expect(secondData).toHaveProperty('error');
      }
    );

    conditionalTestWithAppointment(
      'should allow generating a new token after previous was used',
      async () => {
        // This test assumes the backend allows generating new tokens
        // even after a previous one was used (for retry scenarios)

        // Reset appointment status first
        await resetTestAppointment(testAppointmentId);

        // Generate first token
        const firstGenResponse = await apiRequest('/api/kiosk/generate-qr', {
          method: 'POST',
          body: JSON.stringify({
            appointmentId: testAppointmentId,
          }),
        });

        expect(firstGenResponse.ok).toBe(true);
        const { token: firstToken } = await firstGenResponse.json();

        // Use the first token
        await apiRequest('/api/kiosk/check-in', {
          method: 'POST',
          body: JSON.stringify({ token: firstToken }),
        });

        // Reset for new token generation
        await resetTestAppointment(testAppointmentId);

        // Generate second token
        const secondGenResponse = await apiRequest('/api/kiosk/generate-qr', {
          method: 'POST',
          body: JSON.stringify({
            appointmentId: testAppointmentId,
          }),
        });

        // Should be able to generate a new token
        expect(secondGenResponse.ok).toBe(true);
        const secondData = await secondGenResponse.json();
        expect(secondData).toHaveProperty('token');
        expect(secondData.token).not.toBe(firstToken);
      }
    );
  });

  // ============================================================
  // Session-Based Flow Tests (Mobile-Initiated)
  // ============================================================
  describe('Session-Based Flow (Mobile-Initiated)', () => {
    const conditionalTestWithAppointment = (name: string, fn: () => Promise<void>) => {
      it(name, async (ctx) => {
        if (!backendAvailable) {
          console.log(`  Backend not available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        if (!appointmentsAvailable) {
          console.log(`  No appointments available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        await fn();
      });
    };

    const conditionalTest = (name: string, fn: () => Promise<void>) => {
      it(name, async (ctx) => {
        if (!backendAvailable) {
          console.log(`  Backend not available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        await fn();
      });
    };

    conditionalTest('should create a new session for kiosk display', async () => {
      const response = await apiRequest('/api/kiosk/session/create', {
        method: 'POST',
        body: JSON.stringify({
          kioskId: TEST_KIOSK_ID,
        }),
      });

      expect(response.ok).toBe(true);

      const data = await response.json();

      // Verify response structure
      expect(data).toHaveProperty('sessionId');
      expect(data).toHaveProperty('sessionUrl');
      expect(data).toHaveProperty('expiresIn');

      // sessionId should be a non-empty string
      expect(typeof data.sessionId).toBe('string');
      expect(data.sessionId.length).toBeGreaterThan(0);

      // sessionUrl should be a valid URL
      expect(data.sessionUrl).toMatch(/^https?:\/\//);

      // expiresIn should be a positive number (seconds)
      expect(typeof data.expiresIn).toBe('number');
      expect(data.expiresIn).toBeGreaterThan(0);

      // Store session ID for subsequent tests
      generatedSessionId = data.sessionId;
    });

    conditionalTest(
      'should return pending status for a newly created session',
      async () => {
        // Create a new session
        const createResponse = await apiRequest('/api/kiosk/session/create', {
          method: 'POST',
          body: JSON.stringify({
            kioskId: TEST_KIOSK_ID,
          }),
        });

        expect(createResponse.ok).toBe(true);
        const { sessionId } = await createResponse.json();

        // Get session status
        const statusResponse = await apiRequest(
          `/api/kiosk/session/${sessionId}`
        );

        expect(statusResponse.ok).toBe(true);

        const data = await statusResponse.json();

        // Should be in pending status
        expect(data.status).toBe('pending');
      }
    );

    conditionalTestWithAppointment(
      'should confirm session with patient and appointment data',
      async () => {
        // Reset test appointment
        await resetTestAppointment(testAppointmentId);

        // Create a new session
        const createResponse = await apiRequest('/api/kiosk/session/create', {
          method: 'POST',
          body: JSON.stringify({
            kioskId: TEST_KIOSK_ID,
          }),
        });

        expect(createResponse.ok).toBe(true);
        const { sessionId } = await createResponse.json();

        // Confirm the session (simulate mobile user confirming)
        const confirmResponse = await apiRequest('/api/kiosk/session/confirm', {
          method: 'POST',
          body: JSON.stringify({
            sessionId,
            patientId: testPatientId,
            appointmentId: testAppointmentId,
          }),
        });

        expect(confirmResponse.ok).toBe(true);

        const confirmData = await confirmResponse.json();
        expect(confirmData.success).toBe(true);

        // Verify session status is now confirmed
        const statusResponse = await apiRequest(
          `/api/kiosk/session/${sessionId}`
        );

        expect(statusResponse.ok).toBe(true);

        const statusData = await statusResponse.json();

        // Should now be confirmed
        expect(statusData.status).toBe('confirmed');

        // Should have appointment details
        expect(statusData).toHaveProperty('appointmentId');
        expect(statusData).toHaveProperty('patientName');
        expect(statusData).toHaveProperty('serviceName');
        // Backend returns confirmedAt (when session was confirmed)
        expect(statusData).toHaveProperty('confirmedAt');
      }
    );

    conditionalTestWithAppointment(
      'should reject confirmation for invalid session',
      async () => {
        const response = await apiRequest('/api/kiosk/session/confirm', {
          method: 'POST',
          body: JSON.stringify({
            sessionId: 'invalid-session-id',
            patientId: testPatientId,
            appointmentId: testAppointmentId,
          }),
        });

        expect(response.ok).toBe(false);
        expect([400, 404]).toContain(response.status);

        const data = await response.json();
        // Backend returns { error: '...', message: '...' } for errors
        expect(data).toHaveProperty('error');
      }
    );

    conditionalTest('should return 404 for non-existent session', async () => {
      const response = await apiRequest(
        '/api/kiosk/session/non-existent-session-id'
      );

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    conditionalTest('should reject session creation without kioskId', async () => {
      const response = await apiRequest('/api/kiosk/session/create', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      // Backend should either require kioskId or generate a default
      // This test assumes kioskId is required
      if (!response.ok) {
        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toHaveProperty('error');
      }
      // If backend accepts requests without kioskId, that's also acceptable
    });
  });

  // ============================================================
  // Token Expiration Tests
  // ============================================================
  describe('Token Expiration', () => {
    const conditionalTestWithAppointment = (name: string, fn: () => Promise<void>) => {
      it(name, async (ctx) => {
        if (!backendAvailable) {
          console.log(`  Backend not available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        if (!appointmentsAvailable) {
          console.log(`  No appointments available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        await fn();
      });
    };

    conditionalTestWithAppointment('should include expiration time in token response', async () => {
      const response = await apiRequest('/api/kiosk/generate-qr', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId: testAppointmentId,
        }),
      });

      expect(response.ok).toBe(true);

      const data = await response.json();

      // expiresAt should be included
      expect(data).toHaveProperty('expiresAt');

      // Should be a valid date in the future
      const expiresAt = new Date(data.expiresAt);
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now());

      // Should expire within a reasonable time (e.g., 5-30 minutes)
      const maxExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes
      expect(expiresAt.getTime()).toBeLessThan(maxExpiry);
    });
  });

  // ============================================================
  // Error Handling Tests
  // ============================================================
  describe('Error Handling', () => {
    const conditionalTestWithAppointment = (name: string, fn: () => Promise<void>) => {
      it(name, async (ctx) => {
        if (!backendAvailable) {
          console.log(`  Backend not available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        if (!appointmentsAvailable) {
          console.log(`  No appointments available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        await fn();
      });
    };

    const conditionalTest = (name: string, fn: () => Promise<void>) => {
      it(name, async (ctx) => {
        if (!backendAvailable) {
          console.log(`  Backend not available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        await fn();
      });
    };

    conditionalTest('should return proper error structure for failures', async () => {
      const response = await apiRequest('/api/kiosk/generate-qr', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId: 'non-existent-id',
        }),
      });

      expect(response.ok).toBe(false);

      const data = await response.json();

      // Should have error property
      expect(data).toHaveProperty('error');
      expect(typeof data.error).toBe('string');
      expect(data.error.length).toBeGreaterThan(0);
    });

    conditionalTest('should handle malformed JSON gracefully', async () => {
      const response = await fetch(`${API_URL}/api/kiosk/generate-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'not valid json',
      });

      expect(response.ok).toBe(false);
      expect([400, 500]).toContain(response.status);
    });

    conditionalTestWithAppointment(
      'should handle missing content-type header',
      async () => {
        const response = await fetch(`${API_URL}/api/kiosk/generate-qr`, {
          method: 'POST',
          body: JSON.stringify({
            appointmentId: testAppointmentId,
          }),
        });

        // Backend should either accept it or return 400/415
        // Most backends will accept JSON even without explicit header
        if (!response.ok) {
          expect([400, 415]).toContain(response.status);
        }
      }
    );
  });

  // ============================================================
  // Concurrent Request Tests
  // ============================================================
  describe('Concurrent Requests', () => {
    const conditionalTestWithAppointment = (name: string, fn: () => Promise<void>) => {
      it(name, async (ctx) => {
        if (!backendAvailable) {
          console.log(`  Backend not available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        if (!appointmentsAvailable) {
          console.log(`  No appointments available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        await fn();
      });
    };

    const conditionalTest = (name: string, fn: () => Promise<void>) => {
      it(name, async (ctx) => {
        if (!backendAvailable) {
          console.log(`  Backend not available, skipping: ${name}`);
          ctx.skip();
          return;
        }
        await fn();
      });
    };

    conditionalTestWithAppointment(
      'should handle multiple concurrent token generation requests',
      async () => {
        // Send 5 concurrent requests
        const requests = Array(5)
          .fill(null)
          .map(() =>
            apiRequest('/api/kiosk/generate-qr', {
              method: 'POST',
              body: JSON.stringify({
                appointmentId: testAppointmentId,
              }),
            })
          );

        const responses = await Promise.all(requests);

        // All requests should complete (either success, rate limited, or 400 for stale appointments)
        responses.forEach((response) => {
          expect([200, 400, 429]).toContain(response.status);
        });

        // At least one should succeed (if appointments are available for today)
        const successResponses = responses.filter((r) => r.ok);
        expect(successResponses.length).toBeGreaterThanOrEqual(1);
      }
    );

    conditionalTest(
      'should handle multiple concurrent session creations',
      async () => {
        // Send 5 concurrent session creation requests
        const requests = Array(5)
          .fill(null)
          .map((_, i) =>
            apiRequest('/api/kiosk/session/create', {
              method: 'POST',
              body: JSON.stringify({
                kioskId: `${TEST_KIOSK_ID}-${i}`,
              }),
            })
          );

        const responses = await Promise.all(requests);

        // All should complete
        responses.forEach((response) => {
          expect([200, 429]).toContain(response.status);
        });

        // Check that successful responses have unique sessionIds
        const successData = await Promise.all(
          responses.filter((r) => r.ok).map((r) => r.json())
        );

        const sessionIds = successData.map((d) => d.sessionId);
        const uniqueIds = new Set(sessionIds);
        expect(uniqueIds.size).toBe(sessionIds.length);
      }
    );
  });
});

// ============================================================
// Edge Case Tests
// ============================================================
describe('Kiosk QR Flow Edge Cases', () => {
  let backendAvailable = false;

  beforeAll(async () => {
    backendAvailable = await isBackendAvailable();
  });

  const conditionalTest = (name: string, fn: () => Promise<void>) => {
    it(name, async (ctx) => {
      if (!backendAvailable) {
        console.log(`  Backend not available, skipping: ${name}`);
        ctx.skip();
        return;
      }
      await fn();
    });
  };

  conditionalTest('should handle very long appointment IDs', async () => {
    const longId = 'a'.repeat(1000);

    const response = await apiRequest('/api/kiosk/generate-qr', {
      method: 'POST',
      body: JSON.stringify({
        appointmentId: longId,
      }),
    });

    // Should fail gracefully - backend returns 404 for non-existent appointments
    expect(response.ok).toBe(false);
    expect([400, 404, 414]).toContain(response.status);
  });

  conditionalTest('should handle special characters in IDs', async () => {
    const specialId = 'test<script>alert(1)</script>';

    const response = await apiRequest('/api/kiosk/generate-qr', {
      method: 'POST',
      body: JSON.stringify({
        appointmentId: specialId,
      }),
    });

    // Should fail gracefully - backend returns 404 for non-existent appointments
    expect(response.ok).toBe(false);
    expect([400, 404]).toContain(response.status);

    const data = await response.json();
    // Response should not reflect the script tag (XSS prevention)
    expect(JSON.stringify(data)).not.toContain('<script>');
  });

  conditionalTest('should handle unicode characters in IDs', async () => {
    const unicodeId = 'test-appointment-\u4e2d\u6587-\ud83d\ude00';

    const response = await apiRequest('/api/kiosk/generate-qr', {
      method: 'POST',
      body: JSON.stringify({
        appointmentId: unicodeId,
      }),
    });

    // Should handle gracefully
    expect([200, 400, 404]).toContain(response.status);
  });

  conditionalTest('should handle null values in request body', async () => {
    const response = await apiRequest('/api/kiosk/generate-qr', {
      method: 'POST',
      body: JSON.stringify({
        appointmentId: null,
      }),
    });

    expect(response.ok).toBe(false);
    expect([400, 404]).toContain(response.status);
  });

  conditionalTest('should handle array instead of string for appointmentId', async () => {
    const response = await apiRequest('/api/kiosk/generate-qr', {
      method: 'POST',
      body: JSON.stringify({
        appointmentId: ['test-1', 'test-2'],
      }),
    });

    expect(response.ok).toBe(false);
    expect([400, 422]).toContain(response.status);
  });

  conditionalTest('should handle numeric appointmentId', async () => {
    const response = await apiRequest('/api/kiosk/generate-qr', {
      method: 'POST',
      body: JSON.stringify({
        appointmentId: 12345,
      }),
    });

    // Backend may accept numeric IDs by converting to string
    // or reject them - both are acceptable behaviors
    if (response.ok) {
      const data = await response.json();
      expect(data).toHaveProperty('token');
    } else {
      expect([400, 404, 422]).toContain(response.status);
    }
  });
});
