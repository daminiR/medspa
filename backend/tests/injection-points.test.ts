/**
 * Injection Points & Product Usage API Tests
 *
 * Comprehensive tests for:
 * - List injection points for treatment
 * - Add injection point with validation
 * - Update injection point
 * - Delete injection point
 * - Zone validation
 * - Product usage tracking
 * - Cannot modify completed treatment
 * - Edge cases (not found, invalid treatment status)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import treatments, {
  clearStores,
  getTreatmentStore,
  getInjectionPointStore,
  getProductUsageStore,
  addMockTreatment,
  addMockInjectionPoint,
  addMockProductUsage,
  FACE_ZONES,
  StoredTreatment,
  StoredInjectionPoint,
  StoredProductUsage,
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

// Valid injection point data
const validInjectionPointData = {
  zoneId: 'forehead',
  x: 50,
  y: 25,
  productId: crypto.randomUUID(),
  productName: 'Botox',
  units: 10,
  depth: 'mid-dermal' as const,
  technique: 'serial' as const,
  needleGauge: '30G',
  lotNumber: 'LOT-2024-001',
};

// Valid product usage data
const validProductUsageData = {
  productId: crypto.randomUUID(),
  productName: 'Botox',
  productCategory: 'neurotoxin' as const,
  unitsUsed: 50,
  lotNumber: 'LOT-2024-002',
  expirationDate: '2025-06-01',
  unitPrice: 15,
  totalPrice: 750,
};

// Helper to find in-progress treatment
function findInProgressTreatment() {
  const treatments = Array.from(getTreatmentStore().values());
  return treatments.find(t => t.status === 'in-progress');
}

// Helper to find completed treatment
function findCompletedTreatment() {
  const treatments = Array.from(getTreatmentStore().values());
  return treatments.find(t => t.status === 'completed');
}

describe('Injection Points & Product Usage API', () => {
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
      const treatments = Array.from(getTreatmentStore().values());
      const treatmentId = treatments[0].id;

      const res = await unauthenticatedRequest('GET', `/api/treatments/${treatmentId}/injection-points`);
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const treatments = Array.from(getTreatmentStore().values());
      const treatmentId = treatments[0].id;

      const req = new Request(`http://localhost/api/treatments/${treatmentId}/injection-points`, {
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
  // List Injection Points Tests
  // ===================
  describe('List Injection Points - GET /api/treatments/:id/injection-points', () => {
    it('should return injection points for treatment', async () => {
      const inProgressTreatment = findInProgressTreatment();

      if (!inProgressTreatment) {
        throw new Error('Test data not set up correctly - no in-progress treatment');
      }

      const res = await request('GET', `/api/treatments/${inProgressTreatment.id}/injection-points`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();
      expect(data.summary).toBeDefined();
      expect(data.summary.totalUnits).toBeDefined();
      expect(data.summary.totalVolume).toBeDefined();
      expect(data.summary.byZone).toBeDefined();
    });

    it('should return empty array for treatment with no injection points', async () => {
      // Create a treatment with no injection points
      const treatmentId = addMockTreatment({
        patientId: crypto.randomUUID(),
        providerId: crypto.randomUUID(),
        productType: 'neurotoxin',
        startTime: new Date(),
        status: 'in-progress',
        soapNotes: {
          subjective: { chiefComplaint: '', patientGoals: '', medicalHistory: '', allergies: '', currentMedications: '', previousTreatments: '' },
          objective: { skinAssessment: '', photographs: '' },
          assessment: { diagnosis: '', treatmentCandidacy: '', contraindications: '', consentObtained: false },
          plan: { treatmentPerformed: '', productsUsed: '', technique: '', aftercareInstructions: '', followUpPlan: '' },
        },
        photoIds: [],
        injectionPointIds: [],
        coSignRequired: false,
        consentObtained: true,
        photosBeforeTaken: true,
        photosAfterTaken: false,
        followUpScheduled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        lastModifiedBy: 'system',
      });

      const res = await request('GET', `/api/treatments/${treatmentId}/injection-points`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
      expect(data.total).toBe(0);
    });

    it('should return 404 for non-existent treatment', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/treatments/${fakeId}/injection-points`);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });
  });

  // ===================
  // Add Injection Point Tests
  // ===================
  describe('Add Injection Point - POST /api/treatments/:id/injection-points', () => {
    it('should add injection point with valid data', async () => {
      const inProgressTreatment = findInProgressTreatment();

      if (!inProgressTreatment) {
        throw new Error('Test data not set up correctly - no in-progress treatment');
      }

      const res = await request(
        'POST',
        `/api/treatments/${inProgressTreatment.id}/injection-points`,
        validInjectionPointData
      );

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.injectionPoint).toBeDefined();
      expect(data.injectionPoint.id).toBeDefined();
      expect(data.injectionPoint.zoneId).toBe(validInjectionPointData.zoneId);
      expect(data.injectionPoint.x).toBe(validInjectionPointData.x);
      expect(data.injectionPoint.y).toBe(validInjectionPointData.y);
      expect(data.injectionPoint.units).toBe(validInjectionPointData.units);
      expect(data.message).toBe('Injection point added successfully');
    });

    it('should add injection point with volume instead of units', async () => {
      const inProgressTreatment = findInProgressTreatment();

      if (!inProgressTreatment) {
        throw new Error('Test data not set up correctly');
      }

      const fillerData = {
        ...validInjectionPointData,
        units: undefined,
        volume: 0.5,
        zoneId: 'nasolabial-left',
      };

      const res = await request(
        'POST',
        `/api/treatments/${inProgressTreatment.id}/injection-points`,
        fillerData
      );

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.injectionPoint.volume).toBe(0.5);
    });

    it('should reject injection point without units or volume', async () => {
      const inProgressTreatment = findInProgressTreatment();

      if (!inProgressTreatment) {
        throw new Error('Test data not set up correctly');
      }

      const invalidData = {
        ...validInjectionPointData,
        units: undefined,
        volume: undefined,
      };

      const res = await request(
        'POST',
        `/api/treatments/${inProgressTreatment.id}/injection-points`,
        invalidData
      );

      expect(res.status).toBe(400);
    });

    it('should reject injection point with invalid zone ID', async () => {
      const inProgressTreatment = findInProgressTreatment();

      if (!inProgressTreatment) {
        throw new Error('Test data not set up correctly');
      }

      const invalidData = {
        ...validInjectionPointData,
        zoneId: 'invalid-zone',
      };

      const res = await request(
        'POST',
        `/api/treatments/${inProgressTreatment.id}/injection-points`,
        invalidData
      );

      expect(res.status).toBe(400);
    });

    it('should reject injection point with x/y out of range', async () => {
      const inProgressTreatment = findInProgressTreatment();

      if (!inProgressTreatment) {
        throw new Error('Test data not set up correctly');
      }

      const invalidData = {
        ...validInjectionPointData,
        x: 150, // Out of range
      };

      const res = await request(
        'POST',
        `/api/treatments/${inProgressTreatment.id}/injection-points`,
        invalidData
      );

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Update Injection Point Tests
  // ===================
  describe('Update Injection Point - PUT /api/treatments/:id/injection-points/:pointId', () => {
    it('should update injection point with valid data', async () => {
      const inProgressTreatment = findInProgressTreatment();
      const injectionPoints = Array.from(getInjectionPointStore().values())
        .filter(ip => ip.treatmentId === inProgressTreatment?.id);

      if (!inProgressTreatment || injectionPoints.length === 0) {
        throw new Error('Test data not set up correctly');
      }

      const updateData = {
        units: 15,
        notes: 'Updated notes',
      };

      const res = await request(
        'PUT',
        `/api/treatments/${inProgressTreatment.id}/injection-points/${injectionPoints[0].id}`,
        updateData
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.injectionPoint.units).toBe(15);
      expect(data.injectionPoint.notes).toBe('Updated notes');
      expect(data.message).toBe('Injection point updated successfully');
    });

    it('should update injection point zone', async () => {
      const inProgressTreatment = findInProgressTreatment();
      const injectionPoints = Array.from(getInjectionPointStore().values())
        .filter(ip => ip.treatmentId === inProgressTreatment?.id);

      if (!inProgressTreatment || injectionPoints.length === 0) {
        throw new Error('Test data not set up correctly');
      }

      const updateData = {
        zoneId: 'glabella',
        x: 50,
        y: 35,
      };

      const res = await request(
        'PUT',
        `/api/treatments/${inProgressTreatment.id}/injection-points/${injectionPoints[0].id}`,
        updateData
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.injectionPoint.zoneId).toBe('glabella');
    });

    it('should return 404 for non-existent injection point', async () => {
      const inProgressTreatment = findInProgressTreatment();

      if (!inProgressTreatment) {
        throw new Error('Test data not set up correctly');
      }

      const fakePointId = crypto.randomUUID();
      const res = await request(
        'PUT',
        `/api/treatments/${inProgressTreatment.id}/injection-points/${fakePointId}`,
        { units: 10 }
      );

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Delete Injection Point Tests
  // ===================
  describe('Delete Injection Point - DELETE /api/treatments/:id/injection-points/:pointId', () => {
    it('should delete injection point', async () => {
      const inProgressTreatment = findInProgressTreatment();
      const injectionPoints = Array.from(getInjectionPointStore().values())
        .filter(ip => ip.treatmentId === inProgressTreatment?.id);

      if (!inProgressTreatment || injectionPoints.length === 0) {
        throw new Error('Test data not set up correctly');
      }

      const pointToDelete = injectionPoints[0];

      const res = await request(
        'DELETE',
        `/api/treatments/${inProgressTreatment.id}/injection-points/${pointToDelete.id}`
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Injection point deleted successfully');

      // Verify it's deleted
      expect(getInjectionPointStore().get(pointToDelete.id)).toBeUndefined();
    });

    it('should return 404 for non-existent injection point', async () => {
      const inProgressTreatment = findInProgressTreatment();

      if (!inProgressTreatment) {
        throw new Error('Test data not set up correctly');
      }

      const fakePointId = crypto.randomUUID();
      const res = await request(
        'DELETE',
        `/api/treatments/${inProgressTreatment.id}/injection-points/${fakePointId}`
      );

      expect(res.status).toBe(404);
    });

    it('should return 400 for injection point from different treatment', async () => {
      const inProgressTreatment = findInProgressTreatment();

      if (!inProgressTreatment) {
        throw new Error('Test data not set up correctly');
      }

      // Create another treatment
      const anotherTreatmentId = addMockTreatment({
        patientId: crypto.randomUUID(),
        providerId: crypto.randomUUID(),
        productType: 'filler',
        startTime: new Date(),
        status: 'in-progress',
        soapNotes: {
          subjective: { chiefComplaint: '', patientGoals: '', medicalHistory: '', allergies: '', currentMedications: '', previousTreatments: '' },
          objective: { skinAssessment: '', photographs: '' },
          assessment: { diagnosis: '', treatmentCandidacy: '', contraindications: '', consentObtained: false },
          plan: { treatmentPerformed: '', productsUsed: '', technique: '', aftercareInstructions: '', followUpPlan: '' },
        },
        photoIds: [],
        injectionPointIds: [],
        coSignRequired: false,
        consentObtained: false,
        photosBeforeTaken: false,
        photosAfterTaken: false,
        followUpScheduled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        lastModifiedBy: 'system',
      });

      // Add injection point to other treatment
      const pointId = addMockInjectionPoint({
        treatmentId: anotherTreatmentId,
        zoneId: 'forehead',
        x: 50,
        y: 20,
        productId: crypto.randomUUID(),
        productName: 'Botox',
        units: 10,
        depth: 'mid-dermal',
        technique: 'serial',
        timestamp: new Date(),
        addedBy: 'system',
      });

      // Try to delete from different treatment
      const res = await request(
        'DELETE',
        `/api/treatments/${inProgressTreatment.id}/injection-points/${pointId}`
      );

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Zone Validation Tests
  // ===================
  describe('Zone Validation', () => {
    it('should accept valid zone IDs', async () => {
      const inProgressTreatment = findInProgressTreatment();

      if (!inProgressTreatment) {
        throw new Error('Test data not set up correctly');
      }

      // Test a few zones
      const testZones = ['forehead', 'glabella', 'crows-feet-left', 'nasolabial-right', 'masseter-left'];

      for (const zoneId of testZones) {
        const data = {
          ...validInjectionPointData,
          zoneId,
        };

        const res = await request(
          'POST',
          `/api/treatments/${inProgressTreatment.id}/injection-points`,
          data
        );

        expect(res.status).toBe(201);
      }
    });

    it('should reject invalid zone ID', async () => {
      const inProgressTreatment = findInProgressTreatment();

      if (!inProgressTreatment) {
        throw new Error('Test data not set up correctly');
      }

      const invalidZones = ['invalid-zone', 'forehed', 'left-eye'];

      for (const zoneId of invalidZones) {
        const data = {
          ...validInjectionPointData,
          zoneId,
        };

        const res = await request(
          'POST',
          `/api/treatments/${inProgressTreatment.id}/injection-points`,
          data
        );

        expect(res.status).toBe(400);
      }
    });

    it('should have 25 defined face zones', () => {
      expect(FACE_ZONES.length).toBe(25);

      // Check a few zones have correct structure
      const forehead = FACE_ZONES.find(z => z.id === 'forehead');
      expect(forehead?.name).toBe('Forehead');
      expect(forehead?.defaultUnits).toBe(20);
    });
  });

  // ===================
  // Product Usage Tests
  // ===================
  describe('Product Usage Tracking', () => {
    it('should list products used in treatment', async () => {
      const inProgressTreatment = findInProgressTreatment();

      if (!inProgressTreatment) {
        throw new Error('Test data not set up correctly');
      }

      const res = await request('GET', `/api/treatments/${inProgressTreatment.id}/products`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.summary).toBeDefined();
      expect(data.summary.totalUnits).toBeDefined();
      expect(data.summary.totalVolume).toBeDefined();
      expect(data.summary.totalPrice).toBeDefined();
      expect(data.summary.byCategory).toBeDefined();
    });

    it('should add product usage with valid data', async () => {
      const inProgressTreatment = findInProgressTreatment();

      if (!inProgressTreatment) {
        throw new Error('Test data not set up correctly');
      }

      const res = await request(
        'POST',
        `/api/treatments/${inProgressTreatment.id}/products`,
        validProductUsageData
      );

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.productUsage).toBeDefined();
      expect(data.productUsage.id).toBeDefined();
      expect(data.productUsage.productName).toBe(validProductUsageData.productName);
      expect(data.productUsage.lotNumber).toBe(validProductUsageData.lotNumber);
      expect(data.message).toBe('Product usage added successfully');
    });

    it('should add product usage with filler data', async () => {
      const inProgressTreatment = findInProgressTreatment();

      if (!inProgressTreatment) {
        throw new Error('Test data not set up correctly');
      }

      const fillerData = {
        productId: crypto.randomUUID(),
        productName: 'Juvederm',
        productCategory: 'filler' as const,
        volumeUsed: 1.0,
        lotNumber: 'LOT-FILLER-001',
        unitPrice: 500,
        totalPrice: 500,
      };

      const res = await request(
        'POST',
        `/api/treatments/${inProgressTreatment.id}/products`,
        fillerData
      );

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.productUsage.volumeUsed).toBe(1.0);
      expect(data.productUsage.productCategory).toBe('filler');
    });

    it('should require lot number for product usage', async () => {
      const inProgressTreatment = findInProgressTreatment();

      if (!inProgressTreatment) {
        throw new Error('Test data not set up correctly');
      }

      const invalidData = {
        productId: validProductUsageData.productId,
        productName: validProductUsageData.productName,
        productCategory: validProductUsageData.productCategory,
        unitsUsed: validProductUsageData.unitsUsed,
        // lotNumber missing
      };

      const res = await request(
        'POST',
        `/api/treatments/${inProgressTreatment.id}/products`,
        invalidData
      );

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent treatment', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/treatments/${fakeId}/products`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Cannot Modify Completed Treatment Tests
  // ===================
  describe('Cannot Modify Completed Treatment', () => {
    it('should reject adding injection point to completed treatment', async () => {
      const completedTreatment = findCompletedTreatment();

      if (!completedTreatment) {
        throw new Error('Test data not set up correctly - no completed treatment');
      }

      const res = await request(
        'POST',
        `/api/treatments/${completedTreatment.id}/injection-points`,
        validInjectionPointData
      );

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('completed treatment');
    });

    it('should reject adding product usage to completed treatment', async () => {
      const completedTreatment = findCompletedTreatment();

      if (!completedTreatment) {
        throw new Error('Test data not set up correctly - no completed treatment');
      }

      const res = await request(
        'POST',
        `/api/treatments/${completedTreatment.id}/products`,
        validProductUsageData
      );

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('completed treatment');
    });

    it('should reject updating injection point on completed treatment', async () => {
      // First create an in-progress treatment with an injection point
      const treatmentId = addMockTreatment({
        patientId: crypto.randomUUID(),
        providerId: crypto.randomUUID(),
        productType: 'neurotoxin',
        startTime: new Date(),
        status: 'in-progress',
        soapNotes: {
          subjective: { chiefComplaint: '', patientGoals: '', medicalHistory: '', allergies: '', currentMedications: '', previousTreatments: '' },
          objective: { skinAssessment: '', photographs: '' },
          assessment: { diagnosis: '', treatmentCandidacy: '', contraindications: '', consentObtained: false },
          plan: { treatmentPerformed: '', productsUsed: '', technique: '', aftercareInstructions: '', followUpPlan: '' },
        },
        photoIds: [],
        injectionPointIds: [],
        coSignRequired: false,
        consentObtained: true,
        photosBeforeTaken: true,
        photosAfterTaken: false,
        followUpScheduled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        lastModifiedBy: 'system',
      });

      const pointId = addMockInjectionPoint({
        treatmentId,
        zoneId: 'forehead',
        x: 50,
        y: 20,
        productId: crypto.randomUUID(),
        productName: 'Botox',
        units: 10,
        depth: 'mid-dermal',
        technique: 'serial',
        timestamp: new Date(),
        addedBy: 'system',
      });

      // Mark treatment as completed
      const treatment = getTreatmentStore().get(treatmentId)!;
      treatment.status = 'completed';
      getTreatmentStore().set(treatmentId, treatment);

      // Try to update
      const res = await request(
        'PUT',
        `/api/treatments/${treatmentId}/injection-points/${pointId}`,
        { units: 15 }
      );

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('completed treatment');
    });

    it('should reject deleting injection point from completed treatment', async () => {
      // Create a completed treatment
      const treatmentId = addMockTreatment({
        patientId: crypto.randomUUID(),
        providerId: crypto.randomUUID(),
        productType: 'neurotoxin',
        startTime: new Date(),
        status: 'completed',
        soapNotes: {
          subjective: { chiefComplaint: '', patientGoals: '', medicalHistory: '', allergies: '', currentMedications: '', previousTreatments: '' },
          objective: { skinAssessment: '', photographs: '' },
          assessment: { diagnosis: '', treatmentCandidacy: '', contraindications: '', consentObtained: false },
          plan: { treatmentPerformed: '', productsUsed: '', technique: '', aftercareInstructions: '', followUpPlan: '' },
        },
        photoIds: [],
        injectionPointIds: [],
        coSignRequired: false,
        consentObtained: true,
        photosBeforeTaken: true,
        photosAfterTaken: true,
        followUpScheduled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        lastModifiedBy: 'system',
      });

      const pointId = addMockInjectionPoint({
        treatmentId,
        zoneId: 'forehead',
        x: 50,
        y: 20,
        productId: crypto.randomUUID(),
        productName: 'Botox',
        units: 10,
        depth: 'mid-dermal',
        technique: 'serial',
        timestamp: new Date(),
        addedBy: 'system',
      });

      const res = await request(
        'DELETE',
        `/api/treatments/${treatmentId}/injection-points/${pointId}`
      );

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('completed treatment');
    });
  });

  // ===================
  // Edge Cases Tests
  // ===================
  describe('Edge Cases', () => {
    it('should return 404 for non-existent treatment when listing injection points', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/treatments/${fakeId}/injection-points`);

      expect(res.status).toBe(404);
    });

    it('should return 404 for non-existent treatment when adding injection point', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request(
        'POST',
        `/api/treatments/${fakeId}/injection-points`,
        validInjectionPointData
      );

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid UUID format', async () => {
      const res = await request('GET', '/api/treatments/invalid-uuid/injection-points');

      expect(res.status).toBe(400);
    });

    it('should reject injection point with negative coordinates', async () => {
      const inProgressTreatment = findInProgressTreatment();

      if (!inProgressTreatment) {
        throw new Error('Test data not set up correctly');
      }

      const invalidData = {
        ...validInjectionPointData,
        x: -10,
      };

      const res = await request(
        'POST',
        `/api/treatments/${inProgressTreatment.id}/injection-points`,
        invalidData
      );

      expect(res.status).toBe(400);
    });

    it('should handle cancelled treatment', async () => {
      // Create a cancelled treatment
      const treatmentId = addMockTreatment({
        patientId: crypto.randomUUID(),
        providerId: crypto.randomUUID(),
        productType: 'neurotoxin',
        startTime: new Date(),
        status: 'cancelled',
        soapNotes: {
          subjective: { chiefComplaint: '', patientGoals: '', medicalHistory: '', allergies: '', currentMedications: '', previousTreatments: '' },
          objective: { skinAssessment: '', photographs: '' },
          assessment: { diagnosis: '', treatmentCandidacy: '', contraindications: '', consentObtained: false },
          plan: { treatmentPerformed: '', productsUsed: '', technique: '', aftercareInstructions: '', followUpPlan: '' },
        },
        photoIds: [],
        injectionPointIds: [],
        coSignRequired: false,
        consentObtained: false,
        photosBeforeTaken: false,
        photosAfterTaken: false,
        followUpScheduled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system',
        lastModifiedBy: 'system',
      });

      const res = await request(
        'POST',
        `/api/treatments/${treatmentId}/injection-points`,
        validInjectionPointData
      );

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('cancelled treatment');
    });

    it('should validate product category', async () => {
      const inProgressTreatment = findInProgressTreatment();

      if (!inProgressTreatment) {
        throw new Error('Test data not set up correctly');
      }

      const invalidData = {
        ...validProductUsageData,
        productCategory: 'invalid-category',
      };

      const res = await request(
        'POST',
        `/api/treatments/${inProgressTreatment.id}/products`,
        invalidData
      );

      expect(res.status).toBe(400);
    });

    it('should handle injection point with all optional fields', async () => {
      const inProgressTreatment = findInProgressTreatment();

      if (!inProgressTreatment) {
        throw new Error('Test data not set up correctly');
      }

      const fullData = {
        ...validInjectionPointData,
        notes: 'Patient tolerated well',
        complications: 'Slight bruising',
        expirationDate: '2025-06-01',
      };

      const res = await request(
        'POST',
        `/api/treatments/${inProgressTreatment.id}/injection-points`,
        fullData
      );

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.injectionPoint.notes).toBe('Patient tolerated well');
      expect(data.injectionPoint.complications).toBe('Slight bruising');
    });
  });

  // ===================
  // Treatment CRUD Tests
  // ===================
  describe('Treatment CRUD', () => {
    it('should list treatments with pagination', async () => {
      const res = await request('GET', '/api/treatments');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();
      expect(data.page).toBe(1);
      expect(data.hasMore).toBeDefined();
    });

    it('should get single treatment', async () => {
      const treatments = Array.from(getTreatmentStore().values());
      const treatmentId = treatments[0].id;

      const res = await request('GET', `/api/treatments/${treatmentId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.treatment).toBeDefined();
      expect(data.treatment.id).toBe(treatmentId);
      expect(data.treatment.totalUnits).toBeDefined();
      expect(data.treatment.totalVolume).toBeDefined();
    });

    it('should not delete completed treatment', async () => {
      const completedTreatment = findCompletedTreatment();

      if (!completedTreatment) {
        throw new Error('Test data not set up correctly');
      }

      const res = await request('DELETE', `/api/treatments/${completedTreatment.id}`);

      expect(res.status).toBe(400);
    });
  });
});
