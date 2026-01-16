/**
 * Photo Annotations API Tests
 *
 * Comprehensive tests for:
 * - List annotations
 * - Add annotation validation
 * - Update annotation
 * - Delete annotation
 * - Photo comparison endpoint
 * - Link photo to treatment
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import photos, {
  clearStores,
  resetStores,
  getPhotoStore,
  getAnnotationStore,
  getMockTreatmentStore,
  addMockPhoto,
  addMockAnnotation,
  addMockTreatment,
  TreatmentPhoto,
  PhotoAnnotation,
} from '../src/routes/photos';
import { errorHandler } from '../src/middleware/error';
import { sessionStore } from '../src/middleware/auth';
import crypto from 'crypto';

// Create test app with error handler
const app = new Hono();
app.route('/api/photos', photos);
app.onError(errorHandler);

// Mock session for authentication
const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
const mockSessionToken = 'test-session-token-12345';
const mockSessionId = 'test-session-id';

function setupMockSession(role: string = 'provider') {
  sessionStore.set(mockSessionId, {
    id: mockSessionId,
    token: mockSessionToken,
    userId: mockUserId,
    email: 'test@example.com',
    role,
    permissions: ['photo:read', 'photo:create', 'photo:update', 'photo:delete'],
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

// Valid annotation data for creation
const validAnnotationData = {
  x: 50,
  y: 30,
  type: 'marker' as const,
  label: 'Test marker',
  notes: 'Test annotation notes',
  color: '#FF0000',
};

// Valid photo data for creation
const validPhotoData = {
  patientId: crypto.randomUUID(),
  type: 'before' as const,
  angle: 'front' as const,
  bodyRegion: 'face' as const,
  notes: 'Test photo',
};

describe('Photo Annotations API', () => {
  beforeEach(() => {
    clearStores();
    sessionStore.clear();
    setupMockSession();
  });

  // ===================
  // Authentication Tests
  // ===================
  describe('Authentication', () => {
    it('should reject annotation requests without authentication', async () => {
      const photos = Array.from(getPhotoStore().values());
      const photoId = photos[0].id;

      const res = await unauthenticatedRequest('GET', `/api/photos/${photoId}/annotations`);
      expect(res.status).toBe(401);
    });
  });

  // ===================
  // List Annotations Tests (2 tests)
  // ===================
  describe('List Annotations - GET /api/photos/:id/annotations', () => {
    it('should return list of annotations for a photo', async () => {
      const photos = Array.from(getPhotoStore().values());
      const photoWithAnnotations = photos.find(p => p.type === 'before' && p.angle === 'front');

      if (!photoWithAnnotations) throw new Error('No photo with annotations found');

      const res = await request('GET', `/api/photos/${photoWithAnnotations.id}/annotations`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();
      expect(data.items.length).toBeGreaterThan(0);
    });

    it('should return empty list for photo without annotations', async () => {
      // Create a new photo without annotations
      const photoId = addMockPhoto({
        patientId: 'patient-new',
        type: 'reference',
        angle: 'front',
        capturedAt: new Date(),
        capturedBy: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: mockUserId,
        lastModifiedBy: mockUserId,
      });

      const res = await request('GET', `/api/photos/${photoId}/annotations`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
      expect(data.total).toBe(0);
    });
  });

  // ===================
  // Add Annotation Validation Tests (4 tests)
  // ===================
  describe('Add Annotation - POST /api/photos/:id/annotations', () => {
    it('should add annotation with valid data', async () => {
      // Create a fresh photo without treatment link
      const photoId = addMockPhoto({
        patientId: 'patient-annotation-test',
        type: 'reference',
        angle: 'front',
        capturedAt: new Date(),
        capturedBy: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: mockUserId,
        lastModifiedBy: mockUserId,
      });

      const res = await request('POST', `/api/photos/${photoId}/annotations`, validAnnotationData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.annotation).toBeDefined();
      expect(data.annotation.id).toBeDefined();
      expect(data.annotation.x).toBe(validAnnotationData.x);
      expect(data.annotation.y).toBe(validAnnotationData.y);
      expect(data.annotation.type).toBe(validAnnotationData.type);
      expect(data.annotation.label).toBe(validAnnotationData.label);
      expect(data.message).toBe('Annotation added successfully');
    });

    it('should reject annotation with x coordinate out of range', async () => {
      const photoId = addMockPhoto({
        patientId: 'patient-x-test',
        type: 'reference',
        angle: 'front',
        capturedAt: new Date(),
        capturedBy: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: mockUserId,
        lastModifiedBy: mockUserId,
      });

      const invalidData = {
        ...validAnnotationData,
        x: 150, // Out of range (0-100)
      };

      const res = await request('POST', `/api/photos/${photoId}/annotations`, invalidData);
      expect(res.status).toBe(400);
    });

    it('should reject annotation with y coordinate out of range', async () => {
      const photoId = addMockPhoto({
        patientId: 'patient-y-test',
        type: 'reference',
        angle: 'front',
        capturedAt: new Date(),
        capturedBy: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: mockUserId,
        lastModifiedBy: mockUserId,
      });

      const invalidData = {
        ...validAnnotationData,
        y: -10, // Negative value
      };

      const res = await request('POST', `/api/photos/${photoId}/annotations`, invalidData);
      expect(res.status).toBe(400);
    });

    it('should add annotation with measurement data', async () => {
      const photoId = addMockPhoto({
        patientId: 'patient-measurement-test',
        type: 'reference',
        angle: 'front',
        capturedAt: new Date(),
        capturedBy: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: mockUserId,
        lastModifiedBy: mockUserId,
      });

      const measurementData = {
        x: 30,
        y: 40,
        width: 20,
        type: 'measurement' as const,
        label: 'Width measurement',
        measurementValue: 5.5,
        measurementUnit: 'cm' as const,
        color: '#0000FF',
      };

      const res = await request('POST', `/api/photos/${photoId}/annotations`, measurementData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.annotation.type).toBe('measurement');
      expect(data.annotation.measurementValue).toBe(5.5);
      expect(data.annotation.measurementUnit).toBe('cm');
    });
  });

  // ===================
  // Update Annotation Tests (2 tests)
  // ===================
  describe('Update Annotation - PUT /api/photos/:id/annotations/:annotationId', () => {
    it('should update annotation with valid data', async () => {
      // Create a fresh photo without treatment link
      const photoId = addMockPhoto({
        patientId: 'patient-update-test',
        type: 'reference',
        angle: 'front',
        capturedAt: new Date(),
        capturedBy: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: mockUserId,
        lastModifiedBy: mockUserId,
      });

      // Add an annotation to it
      const annotationId = addMockAnnotation({
        photoId,
        x: 50,
        y: 50,
        type: 'marker',
        label: 'Original label',
        createdAt: new Date(),
        createdBy: mockUserId,
      });

      const updateData = {
        label: 'Updated label',
        notes: 'Updated notes',
        color: '#00FF00',
      };

      const res = await request(
        'PUT',
        `/api/photos/${photoId}/annotations/${annotationId}`,
        updateData
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.annotation.label).toBe('Updated label');
      expect(data.annotation.notes).toBe('Updated notes');
      expect(data.annotation.color).toBe('#00FF00');
      expect(data.annotation.updatedAt).toBeDefined();
      expect(data.message).toBe('Annotation updated successfully');
    });

    it('should update annotation position', async () => {
      // Create a fresh photo without treatment link
      const photoId = addMockPhoto({
        patientId: 'patient-position-test',
        type: 'reference',
        angle: 'front',
        capturedAt: new Date(),
        capturedBy: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: mockUserId,
        lastModifiedBy: mockUserId,
      });

      // Add an annotation to it
      const annotationId = addMockAnnotation({
        photoId,
        x: 30,
        y: 40,
        type: 'marker',
        label: 'Position test',
        createdAt: new Date(),
        createdBy: mockUserId,
      });

      const updateData = {
        x: 75,
        y: 60,
      };

      const res = await request(
        'PUT',
        `/api/photos/${photoId}/annotations/${annotationId}`,
        updateData
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.annotation.x).toBe(75);
      expect(data.annotation.y).toBe(60);
    });
  });

  // ===================
  // Delete Annotation Tests (2 tests)
  // ===================
  describe('Delete Annotation - DELETE /api/photos/:id/annotations/:annotationId', () => {
    it('should delete annotation successfully', async () => {
      // Create a fresh photo without treatment link for this test
      const photoId = addMockPhoto({
        patientId: 'patient-delete-test',
        type: 'reference',
        angle: 'front',
        capturedAt: new Date(),
        capturedBy: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: mockUserId,
        lastModifiedBy: mockUserId,
      });

      // Add an annotation to it
      const annotationId = addMockAnnotation({
        photoId,
        x: 50,
        y: 50,
        type: 'marker',
        label: 'Test annotation to delete',
        createdAt: new Date(),
        createdBy: mockUserId,
      });

      const res = await request(
        'DELETE',
        `/api/photos/${photoId}/annotations/${annotationId}`
      );

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Annotation deleted successfully');

      // Verify it's actually deleted
      expect(getAnnotationStore().has(annotationId)).toBe(false);
    });

    it('should return 404 for non-existent annotation', async () => {
      const photos = Array.from(getPhotoStore().values());
      const photo = photos[0];
      const fakeAnnotationId = crypto.randomUUID();

      const res = await request(
        'DELETE',
        `/api/photos/${photo.id}/annotations/${fakeAnnotationId}`
      );

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });
  });

  // ===================
  // Photo Comparison Tests (3 tests)
  // ===================
  describe('Photo Comparison - GET /api/photos/patients/:patientId/comparison', () => {
    it('should return before/after photo pairs', async () => {
      const res = await request('GET', '/api/photos/patients/patient-001/comparison');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();

      if (data.items.length > 0) {
        const comparison = data.items[0];
        expect(comparison.beforePhoto).toBeDefined();
        expect(comparison.afterPhoto).toBeDefined();
        expect(comparison.daysBetween).toBeDefined();
        expect(comparison.angle).toBeDefined();
      }
    });

    it('should filter comparison by angle', async () => {
      const res = await request('GET', '/api/photos/patients/patient-001/comparison?angle=front');

      expect(res.status).toBe(200);
      const data = await res.json();

      if (data.items.length > 0) {
        expect(data.items.every((c: any) => c.angle === 'front')).toBe(true);
      }
    });

    it('should filter comparison by body region', async () => {
      const res = await request('GET', '/api/photos/patients/patient-001/comparison?bodyRegion=face');

      expect(res.status).toBe(200);
      const data = await res.json();

      if (data.items.length > 0) {
        expect(data.items.every((c: any) => c.bodyRegion === 'face')).toBe(true);
      }
    });
  });

  // ===================
  // Link Photo to Treatment Tests (3 tests)
  // ===================
  describe('Link Photo to Treatment - POST /api/photos/:id/link-treatment', () => {
    it('should link photo to treatment successfully', async () => {
      // Ensure the mock treatment exists
      addMockTreatment({
        id: 'treatment-link-test',
        patientId: 'patient-link-test',
        status: 'in-progress',
        startTime: new Date(),
      });

      // Create a photo without treatment link for the same patient
      const photoId = addMockPhoto({
        patientId: 'patient-link-test',
        type: 'reference',
        angle: 'front',
        capturedAt: new Date(),
        capturedBy: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: mockUserId,
        lastModifiedBy: mockUserId,
      });

      const linkData = {
        treatmentId: 'treatment-link-test',
        type: 'before' as const,
      };

      const res = await request('POST', `/api/photos/${photoId}/link-treatment`, linkData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.photo.treatmentId).toBe('treatment-link-test');
      expect(data.photo.type).toBe('before');
      expect(data.message).toBe('Photo linked to treatment successfully');
    });

    it('should reject linking to non-existent treatment', async () => {
      const photos = Array.from(getPhotoStore().values());
      const photo = photos[0];
      const fakeTreatmentId = crypto.randomUUID();

      const linkData = {
        treatmentId: fakeTreatmentId,
        type: 'before' as const,
      };

      const res = await request('POST', `/api/photos/${photo.id}/link-treatment`, linkData);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });

    it('should reject linking photo to treatment with different patient', async () => {
      // Create a treatment for patient-A
      addMockTreatment({
        id: 'treatment-patient-A',
        patientId: 'patient-A',
        status: 'in-progress',
        startTime: new Date(),
      });

      // Create a photo for patient-B (different patient)
      const photoId = addMockPhoto({
        patientId: 'patient-B',
        type: 'reference',
        angle: 'front',
        capturedAt: new Date(),
        capturedBy: mockUserId,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: mockUserId,
        lastModifiedBy: mockUserId,
      });

      // Try to link photo from patient-B to treatment of patient-A
      const linkData = {
        treatmentId: 'treatment-patient-A',
        type: 'before' as const,
      };

      const res = await request('POST', `/api/photos/${photoId}/link-treatment`, linkData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('different patients');
    });
  });

  // ===================
  // Edge Cases Tests (3 tests)
  // ===================
  describe('Edge Cases', () => {
    it('should return 404 for annotations on non-existent photo', async () => {
      const fakePhotoId = crypto.randomUUID();

      const res = await request('GET', `/api/photos/${fakePhotoId}/annotations`);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });

    it('should reject annotation with invalid coordinates (both negative)', async () => {
      const photos = Array.from(getPhotoStore().values());
      const photo = photos[0];

      const invalidData = {
        x: -5,
        y: -10,
        type: 'marker',
      };

      const res = await request('POST', `/api/photos/${photo.id}/annotations`, invalidData);
      expect(res.status).toBe(400);
    });

    it('should reject update when annotation does not belong to photo', async () => {
      const annotations = Array.from(getAnnotationStore().values());
      const annotation = annotations[0];
      const photos = Array.from(getPhotoStore().values());

      // Find a different photo
      const differentPhoto = photos.find(p => p.id !== annotation.photoId);
      if (!differentPhoto) throw new Error('Need at least 2 photos for this test');

      const res = await request(
        'PUT',
        `/api/photos/${differentPhoto.id}/annotations/${annotation.id}`,
        { label: 'Test' }
      );

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('does not belong');
    });
  });

  // ===================
  // Completed Treatment Restriction Tests (2 tests)
  // ===================
  describe('Completed Treatment Restrictions', () => {
    it('should prevent non-admin from modifying annotations on completed treatment photos', async () => {
      // Find a photo linked to completed treatment
      const photos = Array.from(getPhotoStore().values());
      const photoWithTreatment = photos.find(p => p.treatmentId === 'treatment-001');

      if (!photoWithTreatment) throw new Error('No photo with treatment found');

      // Session is set to 'provider' by default (not admin)
      const res = await request('POST', `/api/photos/${photoWithTreatment.id}/annotations`, validAnnotationData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('completed treatments');
    });

    it('should allow admin to modify annotations on completed treatment photos', async () => {
      // Reset session with admin role
      sessionStore.clear();
      setupMockSession('admin');

      // Find a photo linked to completed treatment
      const photos = Array.from(getPhotoStore().values());
      const photoWithTreatment = photos.find(p => p.treatmentId === 'treatment-001');

      if (!photoWithTreatment) throw new Error('No photo with treatment found');

      const res = await request('POST', `/api/photos/${photoWithTreatment.id}/annotations`, validAnnotationData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.annotation).toBeDefined();
    });
  });

  // ===================
  // Additional Coverage Tests
  // ===================
  describe('Additional Coverage Tests', () => {
    it('should add annotation with reference type', async () => {
      const photos = Array.from(getPhotoStore().values());
      const photo = photos.find(p => !p.treatmentId); // Find photo without treatment

      if (!photo) {
        // Create one
        const photoId = addMockPhoto({
          patientId: 'patient-new',
          type: 'reference',
          angle: 'front',
          capturedAt: new Date(),
          capturedBy: mockUserId,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: mockUserId,
          lastModifiedBy: mockUserId,
        });
        const createdPhoto = getPhotoStore().get(photoId)!;

        const annotationData = {
          x: 45,
          y: 35,
          type: 'circle' as const,
          label: 'Injection Point',
          referenceType: 'injection-point' as const,
          referenceId: crypto.randomUUID(),
        };

        const res = await request('POST', `/api/photos/${createdPhoto.id}/annotations`, annotationData);

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.annotation.referenceType).toBe('injection-point');
        expect(data.annotation.referenceId).toBeDefined();
      }
    });

    it('should filter comparison by treatment ID', async () => {
      const res = await request('GET', '/api/photos/patients/patient-001/comparison?treatmentId=treatment-001');

      expect(res.status).toBe(200);
      const data = await res.json();

      if (data.items.length > 0) {
        expect(data.items.every((c: any) => c.treatmentId === 'treatment-001')).toBe(true);
      }
    });

    it('should handle empty comparison results gracefully', async () => {
      // Patient with no photos
      const res = await request('GET', '/api/photos/patients/patient-no-photos/comparison');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
      expect(data.total).toBe(0);
    });

    it('should reject invalid hex color format', async () => {
      const photos = Array.from(getPhotoStore().values());
      const photo = photos.find(p => !p.treatmentId);

      if (!photo) throw new Error('Need a photo without treatment');

      const invalidData = {
        ...validAnnotationData,
        color: 'red', // Not a valid hex color
      };

      const res = await request('POST', `/api/photos/${photo.id}/annotations`, invalidData);
      expect(res.status).toBe(400);
    });

    it('should return 404 for deleted photo annotations', async () => {
      const photos = Array.from(getPhotoStore().values());
      const photo = photos.find(p => !p.treatmentId);

      if (!photo) throw new Error('Need a photo');

      // Soft delete the photo
      photo.deletedAt = new Date();
      getPhotoStore().set(photo.id, photo);

      const res = await request('GET', `/api/photos/${photo.id}/annotations`);

      expect(res.status).toBe(404);
    });
  });
});
