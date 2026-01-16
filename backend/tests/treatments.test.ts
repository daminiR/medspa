/**
 * Treatments API Tests
 *
 * Comprehensive tests for:
 * - List treatments with pagination
 * - Filter by patient, provider, date range, status, productType
 * - Create treatment with SOAP notes
 * - Get treatment by ID
 * - Update treatment
 * - Complete treatment with sign-off
 * - SOAP notes CRUD
 * - Status transitions
 * - Edge cases and error handling
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import treatments, {
  clearStores,
  resetStores,
  getTreatmentStore,
  StoredTreatment,
  SOAPNotes,
} from '../src/routes/treatments';
import { errorHandler } from '../src/middleware/error';
import { sessionStore } from '../src/middleware/auth';
import crypto from 'crypto';

// Create test app with error handler
const app = new Hono();
app.route('/api/treatments', treatments);
app.onError(errorHandler);

// Mock session for authentication
const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
const mockSessionToken = 'test-session-token-12345';
const mockSessionId = 'test-session-id';

function setupMockSession() {
  sessionStore.set(mockSessionId, {
    id: mockSessionId,
    token: mockSessionToken,
    userId: mockUserId,
    email: 'test@example.com',
    role: 'admin',
    permissions: ['treatment:read', 'treatment:create', 'treatment:update', 'treatment:delete'],
    locationIds: ['loc-1'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    lastActivityAt: new Date(),
  });
}

// Helper to make authenticated requests
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
      'Authorization': `Bearer ${mockSessionToken}`,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return app.fetch(req);
}

// Helper to make unauthenticated requests
async function unauthenticatedRequest(
  method: string,
  path: string,
  body?: object
) {
  const req = new Request(`http://localhost${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return app.fetch(req);
}

// Valid treatment data for creation
const validTreatmentData = {
  patientId: '11111111-1111-1111-1111-111111111111',
  providerId: '22222222-2222-2222-2222-222222222222',
  productType: 'neurotoxin' as const,
  treatmentArea: 'Glabella, Forehead',
  chiefComplaint: 'Frown lines between eyebrows',
  coSignRequired: false,
};

describe('Treatments API', () => {
  beforeEach(() => {
    clearStores();
    sessionStore.clear();
    setupMockSession();
  });

  // ===================
  // Authentication Tests
  // ===================
  describe('Authentication', () => {
    it('should reject requests without authentication', async () => {
      const res = await unauthenticatedRequest('GET', '/api/treatments');
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const req = new Request('http://localhost/api/treatments', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });
      const res = await app.fetch(req);
      expect(res.status).toBe(401);
    });
  });

  // ===================
  // List Treatments Tests (5 tests)
  // ===================
  describe('List Treatments - GET /api/treatments', () => {
    it('should return paginated list of treatments', async () => {
      const res = await request('GET', '/api/treatments');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();
      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);
      expect(data.hasMore).toBeDefined();
    });

    it('should support custom pagination', async () => {
      const res = await request('GET', '/api/treatments?page=1&limit=2');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeLessThanOrEqual(2);
      expect(data.limit).toBe(2);
    });

    it('should handle page beyond results', async () => {
      const res = await request('GET', '/api/treatments?page=1000');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
      expect(data.hasMore).toBe(false);
    });

    it('should reject invalid pagination values', async () => {
      const res = await request('GET', '/api/treatments?page=0');
      expect(res.status).toBe(400);
    });

    it('should reject limit over 100', async () => {
      const res = await request('GET', '/api/treatments?limit=101');
      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Filter Treatments Tests (5 tests)
  // ===================
  describe('Filter Treatments', () => {
    it('should filter by patientId', async () => {
      // Create a treatment with a specific patient
      const patientId = '33333333-3333-3333-3333-333333333333';
      const createRes = await request('POST', '/api/treatments', {
        ...validTreatmentData,
        patientId,
      });
      expect(createRes.status).toBe(201);

      const res = await request('GET', `/api/treatments?patientId=${patientId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.items.every((t: any) => t.patientId === patientId)).toBe(true);
    });

    it('should filter by providerId', async () => {
      // Create a treatment with a specific provider
      const providerId = '44444444-4444-4444-4444-444444444444';
      const createRes = await request('POST', '/api/treatments', {
        ...validTreatmentData,
        providerId,
      });
      expect(createRes.status).toBe(201);

      const res = await request('GET', `/api/treatments?providerId=${providerId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.items.every((t: any) => t.providerId === providerId)).toBe(true);
    });

    it('should filter by status', async () => {
      const res = await request('GET', '/api/treatments?status=in-progress');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((t: any) => t.status === 'in-progress')).toBe(true);
    });

    it('should filter by productType', async () => {
      const res = await request('GET', '/api/treatments?productType=neurotoxin');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((t: any) => t.productType === 'neurotoxin')).toBe(true);
    });

    it('should filter by date range', async () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      const res = await request(
        'GET',
        `/api/treatments?dateFrom=${yesterday.toISOString()}&dateTo=${tomorrow.toISOString()}`
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
    });
  });

  // ===================
  // Create Treatment Tests (5 tests)
  // ===================
  describe('Create Treatment - POST /api/treatments', () => {
    it('should create treatment with valid data', async () => {
      const res = await request('POST', '/api/treatments', validTreatmentData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.treatment).toBeDefined();
      expect(data.treatment.id).toBeDefined();
      expect(data.treatment.patientId).toBe(validTreatmentData.patientId);
      expect(data.treatment.providerId).toBe(validTreatmentData.providerId);
      expect(data.treatment.productType).toBe(validTreatmentData.productType);
      expect(data.treatment.status).toBe('in-progress');
      expect(data.treatment.soapNotes).toBeDefined();
      expect(data.message).toBe('Treatment session created successfully');
    });

    it('should create treatment with SOAP notes', async () => {
      const dataWithSoap = {
        ...validTreatmentData,
        soapNotes: {
          subjective: {
            chiefComplaint: 'Patient wants to reduce frown lines',
            allergies: 'NKDA',
          },
          assessment: {
            consentObtained: true,
          },
        },
      };

      const res = await request('POST', '/api/treatments', dataWithSoap);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.treatment.soapNotes.subjective.chiefComplaint).toBe('Patient wants to reduce frown lines');
      expect(data.treatment.soapNotes.subjective.allergies).toBe('NKDA');
      expect(data.treatment.soapNotes.assessment.consentObtained).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const invalidData = {
        patientId: validTreatmentData.patientId,
        // missing providerId and productType
      };

      const res = await request('POST', '/api/treatments', invalidData);
      expect(res.status).toBe(400);
    });

    it('should reject invalid UUID for patientId', async () => {
      const invalidData = {
        ...validTreatmentData,
        patientId: 'not-a-uuid',
      };

      const res = await request('POST', '/api/treatments', invalidData);
      expect(res.status).toBe(400);
    });

    it('should reject invalid productType', async () => {
      const invalidData = {
        ...validTreatmentData,
        productType: 'invalid-type',
      };

      const res = await request('POST', '/api/treatments', invalidData);
      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Get Treatment by ID Tests (3 tests)
  // ===================
  describe('Get Treatment - GET /api/treatments/:id', () => {
    it('should return treatment by ID with SOAP notes', async () => {
      const treatments = Array.from(getTreatmentStore().values());
      const treatmentId = treatments[0].id;

      const res = await request('GET', `/api/treatments/${treatmentId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.treatment).toBeDefined();
      expect(data.treatment.id).toBe(treatmentId);
      expect(data.treatment.soapNotes).toBeDefined();
      expect(data.treatment.patientId).toBeDefined();
      expect(data.treatment.providerId).toBeDefined();
    });

    it('should return 404 for non-existent treatment', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/treatments/${fakeId}`);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid UUID', async () => {
      const res = await request('GET', '/api/treatments/invalid-id');
      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Update Treatment Tests (4 tests)
  // ===================
  describe('Update Treatment - PUT /api/treatments/:id', () => {
    it('should update treatment with valid data', async () => {
      const treatments = Array.from(getTreatmentStore().values());
      const inProgress = treatments.find(t => t.status === 'in-progress');

      if (!inProgress) throw new Error('No in-progress treatment found');

      const updateData = {
        treatmentArea: 'Updated treatment area',
        chiefComplaint: 'Updated complaint',
      };

      const res = await request('PUT', `/api/treatments/${inProgress.id}`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.treatment.treatmentArea).toBe('Updated treatment area');
      expect(data.treatment.chiefComplaint).toBe('Updated complaint');
      expect(data.message).toBe('Treatment updated successfully');
    });

    it('should reject update on completed treatment', async () => {
      const treatments = Array.from(getTreatmentStore().values());
      const completed = treatments.find(t => t.status === 'completed');

      if (!completed) throw new Error('No completed treatment found');

      const res = await request('PUT', `/api/treatments/${completed.id}`, {
        treatmentArea: 'New area',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('completed');
    });

    it('should return 404 for non-existent treatment', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('PUT', `/api/treatments/${fakeId}`, { treatmentArea: 'Test' });

      expect(res.status).toBe(404);
    });

    it('should update partial fields only', async () => {
      const treatments = Array.from(getTreatmentStore().values());
      const inProgress = treatments.find(t => t.status === 'in-progress');

      if (!inProgress) throw new Error('No in-progress treatment found');
      const originalArea = inProgress.treatmentArea;

      const res = await request('PUT', `/api/treatments/${inProgress.id}`, {
        notes: 'New notes only',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.treatment.treatmentArea).toBe(originalArea);
    });
  });

  // ===================
  // Complete Treatment Tests (4 tests)
  // ===================
  describe('Complete Treatment - POST /api/treatments/:id/complete', () => {
    it('should complete in-progress treatment with sign-off', async () => {
      // Create a new treatment without co-sign requirement
      const createRes = await request('POST', '/api/treatments', {
        ...validTreatmentData,
        coSignRequired: false,
      });
      expect(createRes.status).toBe(201);
      const createData = await createRes.json();
      const treatmentId = createData.treatment.id;

      const signerId = crypto.randomUUID();
      const res = await request('POST', `/api/treatments/${treatmentId}/complete`, {
        signedOffBy: signerId,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.treatment.status).toBe('completed');
      expect(data.treatment.signedOffBy).toBe(signerId);
      expect(data.treatment.signedOffAt).toBeDefined();
      expect(data.message).toBe('Treatment completed successfully');
    });

    it('should move to pending-review if co-sign required', async () => {
      // Create a treatment that requires co-sign
      const createRes = await request('POST', '/api/treatments', {
        ...validTreatmentData,
        coSignRequired: true,
      });
      expect(createRes.status).toBe(201);
      const createData = await createRes.json();
      const treatmentId = createData.treatment.id;

      const signerId = crypto.randomUUID();
      const res = await request('POST', `/api/treatments/${treatmentId}/complete`, {
        signedOffBy: signerId,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.treatment.status).toBe('pending-review');
      expect(data.message).toContain('pending review');
    });

    it('should reject completing already completed treatment', async () => {
      const treatments = Array.from(getTreatmentStore().values());
      const completed = treatments.find(t => t.status === 'completed');

      if (!completed) throw new Error('No completed treatment found');

      const res = await request('POST', `/api/treatments/${completed.id}/complete`, {
        signedOffBy: crypto.randomUUID(),
      });

      expect(res.status).toBe(400);
    });

    it('should require signedOffBy field', async () => {
      const treatments = Array.from(getTreatmentStore().values());
      const inProgress = treatments.find(t => t.status === 'in-progress');

      if (!inProgress) throw new Error('No in-progress treatment found');

      const res = await request('POST', `/api/treatments/${inProgress.id}/complete`, {});
      expect(res.status).toBe(400);
    });
  });

  // ===================
  // SOAP Notes CRUD Tests (5 tests)
  // ===================
  describe('SOAP Notes - GET/PUT /api/treatments/:id/soap-notes', () => {
    it('should get SOAP notes for treatment', async () => {
      const treatments = Array.from(getTreatmentStore().values());
      const treatmentId = treatments[0].id;

      const res = await request('GET', `/api/treatments/${treatmentId}/soap-notes`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.treatmentId).toBe(treatmentId);
      expect(data.soapNotes).toBeDefined();
      expect(data.soapNotes.subjective).toBeDefined();
      expect(data.soapNotes.objective).toBeDefined();
      expect(data.soapNotes.assessment).toBeDefined();
      expect(data.soapNotes.plan).toBeDefined();
    });

    it('should update SOAP notes incrementally', async () => {
      const treatments = Array.from(getTreatmentStore().values());
      const inProgress = treatments.find(t => t.status === 'in-progress');

      if (!inProgress) throw new Error('No in-progress treatment found');

      const updateData = {
        subjective: {
          chiefComplaint: 'Updated chief complaint',
        },
        plan: {
          treatmentPerformed: 'Botox 30 units',
        },
      };

      const res = await request('PUT', `/api/treatments/${inProgress.id}/soap-notes`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.soapNotes.subjective.chiefComplaint).toBe('Updated chief complaint');
      expect(data.soapNotes.plan.treatmentPerformed).toBe('Botox 30 units');
      expect(data.message).toBe('SOAP notes updated successfully');
    });

    it('should preserve existing SOAP fields when updating', async () => {
      const treatments = Array.from(getTreatmentStore().values());
      const inProgress = treatments.find(t => t.status === 'in-progress');

      if (!inProgress) throw new Error('No in-progress treatment found');
      const originalAllergies = inProgress.soapNotes.subjective.allergies;

      const res = await request('PUT', `/api/treatments/${inProgress.id}/soap-notes`, {
        subjective: {
          chiefComplaint: 'New complaint',
        },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.soapNotes.subjective.allergies).toBe(originalAllergies);
    });

    it('should reject SOAP update on completed treatment', async () => {
      const treatments = Array.from(getTreatmentStore().values());
      const completed = treatments.find(t => t.status === 'completed');

      if (!completed) throw new Error('No completed treatment found');

      const res = await request('PUT', `/api/treatments/${completed.id}/soap-notes`, {
        subjective: { chiefComplaint: 'New complaint' },
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('completed');
    });

    it('should return 404 for non-existent treatment SOAP notes', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/treatments/${fakeId}/soap-notes`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Status Transition Tests (4 tests)
  // ===================
  describe('Status Transitions', () => {
    it('should cancel in-progress treatment', async () => {
      const treatments = Array.from(getTreatmentStore().values());
      const inProgress = treatments.find(t => t.status === 'in-progress');

      if (!inProgress) throw new Error('No in-progress treatment found');

      const res = await request('POST', `/api/treatments/${inProgress.id}/cancel`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.treatment.status).toBe('cancelled');
      expect(data.message).toBe('Treatment cancelled successfully');
    });

    it('should cancel pending-review treatment', async () => {
      const treatments = Array.from(getTreatmentStore().values());
      const pendingReview = treatments.find(t => t.status === 'pending-review');

      if (!pendingReview) throw new Error('No pending-review treatment found');

      const res = await request('POST', `/api/treatments/${pendingReview.id}/cancel`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.treatment.status).toBe('cancelled');
    });

    it('should reject cancelling completed treatment', async () => {
      const treatments = Array.from(getTreatmentStore().values());
      const completed = treatments.find(t => t.status === 'completed');

      if (!completed) throw new Error('No completed treatment found');

      const res = await request('POST', `/api/treatments/${completed.id}/cancel`);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('completed');
    });

    it('should co-sign pending-review and complete', async () => {
      const treatments = Array.from(getTreatmentStore().values());
      const pendingReview = treatments.find(t => t.status === 'pending-review' && t.signedOffBy);

      if (!pendingReview) throw new Error('No pending-review treatment with sign-off found');

      const res = await request('POST', `/api/treatments/${pendingReview.id}/co-sign`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.treatment.status).toBe('completed');
      expect(data.treatment.coSignedBy).toBeDefined();
      expect(data.message).toBe('Treatment co-signed successfully');
    });
  });

  // ===================
  // Edge Cases Tests (5 tests)
  // ===================
  describe('Edge Cases', () => {
    it('should reject co-sign if not required', async () => {
      const treatments = Array.from(getTreatmentStore().values());
      const noCoSign = treatments.find(t => !t.coSignRequired);

      if (!noCoSign) throw new Error('No treatment without co-sign requirement found');

      const res = await request('POST', `/api/treatments/${noCoSign.id}/co-sign`);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('does not require');
    });

    it('should reject double co-sign', async () => {
      // First find a treatment that's already co-signed
      const treatments = Array.from(getTreatmentStore().values());
      let found = treatments.find(t => t.coSignRequired && t.coSignedBy);

      // If none found, create one
      if (!found) {
        const pendingReview = treatments.find(t => t.status === 'pending-review' && t.coSignRequired);
        if (pendingReview) {
          await request('POST', `/api/treatments/${pendingReview.id}/co-sign`);
          found = getTreatmentStore().get(pendingReview.id);
        }
      }

      if (!found) throw new Error('Could not find or create co-signed treatment');

      const res = await request('POST', `/api/treatments/${found.id}/co-sign`);
      expect(res.status).toBe(400);
    });

    it('should handle empty treatment list gracefully', async () => {
      resetStores(); // Clear all without mock data
      const res = await request('GET', '/api/treatments');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
      expect(data.total).toBe(0);
    });

    it('should return 404 for treatment not found on update', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('PUT', `/api/treatments/${fakeId}`, { notes: 'Test' });

      expect(res.status).toBe(404);
    });

    it('should return 404 for treatment not found on complete', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('POST', `/api/treatments/${fakeId}/complete`, {
        signedOffBy: crypto.randomUUID(),
      });

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Additional Tests for Coverage
  // ===================
  describe('Additional Coverage Tests', () => {
    it('should create treatment with appointmentId and locationId', async () => {
      const data = {
        ...validTreatmentData,
        appointmentId: crypto.randomUUID(),
        locationId: crypto.randomUUID(),
        startTime: new Date().toISOString(),
      };

      const res = await request('POST', '/api/treatments', data);

      expect(res.status).toBe(201);
      const result = await res.json();
      expect(result.treatment.appointmentId).toBe(data.appointmentId);
      expect(result.treatment.locationId).toBe(data.locationId);
    });

    it('should sort treatments by createdAt descending by default', async () => {
      const res = await request('GET', '/api/treatments?sortOrder=desc');

      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.items.length > 1) {
        const dates = data.items.map((t: any) => new Date(t.createdAt).getTime());
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
        }
      }
    });

    it('should sort treatments by startTime ascending', async () => {
      const res = await request('GET', '/api/treatments?sortBy=startTime&sortOrder=asc');

      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.items.length > 1) {
        const dates = data.items.map((t: any) => new Date(t.startTime).getTime());
        for (let i = 0; i < dates.length - 1; i++) {
          expect(dates[i]).toBeLessThanOrEqual(dates[i + 1]);
        }
      }
    });

    it('should include treatment totals in response', async () => {
      const res = await request('GET', '/api/treatments');

      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.items.length > 0) {
        const item = data.items[0];
        expect(item.totalUnits).toBeDefined();
        expect(item.totalVolume).toBeDefined();
        expect(item.totalInjectionPoints).toBeDefined();
        expect(item.totalProductsUsed).toBeDefined();
      }
    });

    it('should update vital signs in SOAP notes', async () => {
      const treatments = Array.from(getTreatmentStore().values());
      const inProgress = treatments.find(t => t.status === 'in-progress');

      if (!inProgress) throw new Error('No in-progress treatment found');

      const res = await request('PUT', `/api/treatments/${inProgress.id}/soap-notes`, {
        objective: {
          vitalSigns: {
            bloodPressure: '120/80',
            heartRate: 72,
            temperature: 98.6,
          },
        },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.soapNotes.objective.vitalSigns.bloodPressure).toBe('120/80');
      expect(data.soapNotes.objective.vitalSigns.heartRate).toBe(72);
    });
  });
});
