/**
 * Photos API Tests
 *
 * Comprehensive test coverage for:
 * - Upload photo validation (5 tests)
 * - Get photo metadata (3 tests)
 * - Get signed URL (3 tests)
 * - Delete photo (4 tests)
 * - List patient photos (3 tests)
 * - List treatment photos (3 tests)
 * - Permission checks (2 tests)
 * - Edge cases (4 tests)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import photos, {
  clearStores,
  resetStores,
  getPhotoStore,
  addMockPhoto,
  addMockPatient,
  addMockTreatment,
  removeMockTreatment,
  TreatmentPhoto,
} from '../src/routes/photos';
import { errorHandler } from '../src/middleware/error';
import { clearMockStorage, addToMockStorage } from '../src/services/storage';

// Mock the auth middleware
vi.mock('../src/middleware/auth', () => ({
  sessionAuthMiddleware: vi.fn((c, next) => {
    c.set('user', {
      uid: 'test-user-123',
      email: 'test@example.com',
      role: 'admin',
      permissions: ['photo:create', 'photo:read', 'photo:delete'],
    });
    return next();
  }),
}));

// Mock audit logging
vi.mock('@medical-spa/security', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

// Create test app
const app = new Hono();
app.route('/api/photos', photos);
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

// Generate a valid UUID
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

describe('Photos API', () => {
  beforeEach(() => {
    clearStores();
  });

  // ===================
  // Upload Photo Validation Tests (5 tests)
  // ===================
  describe('POST /api/photos/upload - Validation', () => {
    it('should upload a valid photo', async () => {
      const patientId = uuid();
      addMockPatient(patientId);

      const res = await request('POST', '/api/photos/upload', {
        patientId,
        filename: 'test_photo.jpg',
        contentType: 'image/jpeg',
        fileSize: 1024000,
        type: 'before',
        photoConsent: true,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.photo).toBeDefined();
      expect(data.photo.patientId).toBe(patientId);
      expect(data.photo.type).toBe('before');
      expect(data.photo.storageKey).toContain('patients/');
      expect(data.uploadUrl).toBeDefined();
      expect(data.message).toBe('Photo uploaded successfully');
    });

    it('should reject upload without photo consent', async () => {
      const patientId = uuid();
      addMockPatient(patientId);

      const res = await request('POST', '/api/photos/upload', {
        patientId,
        filename: 'test_photo.jpg',
        contentType: 'image/jpeg',
        fileSize: 1024000,
        type: 'before',
        photoConsent: false,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('consent');
    });

    it('should reject invalid content type', async () => {
      const patientId = uuid();
      addMockPatient(patientId);

      const res = await request('POST', '/api/photos/upload', {
        patientId,
        filename: 'test_doc.pdf',
        contentType: 'application/pdf',
        fileSize: 1024000,
        type: 'before',
        photoConsent: true,
      });

      expect(res.status).toBe(400);
    });

    it('should reject file size exceeding 20MB', async () => {
      const patientId = uuid();
      addMockPatient(patientId);

      const res = await request('POST', '/api/photos/upload', {
        patientId,
        filename: 'large_photo.jpg',
        contentType: 'image/jpeg',
        fileSize: 25 * 1024 * 1024, // 25MB
        type: 'before',
        photoConsent: true,
      });

      expect(res.status).toBe(400);
      // Just verify we got a 400 - the file size validation is working
      // The actual response format may vary
    });

    it('should accept upload for UUID patient (UUID pattern match)', async () => {
      const patientId = uuid();
      // Don't explicitly add to mock patients - UUID pattern match should work

      const res = await request('POST', '/api/photos/upload', {
        patientId,
        filename: 'test_photo.jpg',
        contentType: 'image/jpeg',
        fileSize: 1024000,
        type: 'before',
        photoConsent: true,
      });

      // UUID pattern matching allows any valid UUID
      expect(res.status).toBe(201);
    });
  });

  // ===================
  // Get Photo Metadata Tests (3 tests)
  // ===================
  describe('GET /api/photos/:id - Get Photo', () => {
    it('should get photo metadata by ID', async () => {
      // Get one of the mock photos
      const allPhotos = Array.from(getPhotoStore().values());
      const photo = allPhotos[0];

      const res = await request('GET', `/api/photos/${photo.id}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.photo).toBeDefined();
      expect(data.photo.id).toBe(photo.id);
      expect(data.photo.patientId).toBe(photo.patientId);
      expect(data.photo.originalFilename).toBe(photo.originalFilename);
    });

    it('should return 404 for non-existent photo', async () => {
      const fakeId = uuid();

      const res = await request('GET', `/api/photos/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 for deleted photo', async () => {
      const patientId = uuid();
      addMockPatient(patientId);

      const photoId = addMockPhoto({
        patientId,
        storageKey: 'test/key.jpg',
        thumbnailKey: 'test/key_thumb.jpg',
        originalFilename: 'deleted.jpg',
        contentType: 'image/jpeg',
        fileSize: 1000,
        type: 'before',
        photoConsent: true,
        marketingConsent: false,
        isProcessed: true,
        uploadedAt: new Date(),
        uploadedBy: 'test-user',
        deletedAt: new Date(),
        deletedBy: 'test-user',
      });

      const res = await request('GET', `/api/photos/${photoId}`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Get Signed URL Tests (3 tests)
  // ===================
  describe('GET /api/photos/:id/url - Signed URL', () => {
    it('should get signed URL with default expiration', async () => {
      const patientId = uuid();
      addMockPatient(patientId);
      const storageKey = `patients/${patientId}/photos/2024/12/test.jpg`;
      const thumbKey = `patients/${patientId}/photos/2024/12/test_thumb.jpg`;

      // Add to mock storage
      addToMockStorage(storageKey, Buffer.from('test'), 'image/jpeg');
      addToMockStorage(thumbKey, Buffer.from('test'), 'image/jpeg');

      const photoId = addMockPhoto({
        patientId,
        storageKey,
        thumbnailKey: thumbKey,
        originalFilename: 'test.jpg',
        contentType: 'image/jpeg',
        fileSize: 1000,
        type: 'before',
        photoConsent: true,
        marketingConsent: false,
        isProcessed: true,
        uploadedAt: new Date(),
        uploadedBy: 'test-user',
      });

      const res = await request('GET', `/api/photos/${photoId}/url`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe(photoId);
      expect(data.url).toBeDefined();
      expect(data.url).toContain('mock-storage');
      expect(data.expiresIn).toBe(3600);
      expect(data.expiresAt).toBeDefined();
    });

    it('should get signed URL with custom expiration', async () => {
      const patientId = uuid();
      addMockPatient(patientId);
      const storageKey = `patients/${patientId}/photos/2024/12/test2.jpg`;

      addToMockStorage(storageKey, Buffer.from('test'), 'image/jpeg');

      const photoId = addMockPhoto({
        patientId,
        storageKey,
        originalFilename: 'test2.jpg',
        contentType: 'image/jpeg',
        fileSize: 1000,
        type: 'before',
        photoConsent: true,
        marketingConsent: false,
        isProcessed: true,
        uploadedAt: new Date(),
        uploadedBy: 'test-user',
      });

      const res = await request('GET', `/api/photos/${photoId}/url?expiresIn=7200`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.expiresIn).toBe(7200);
    });

    it('should return 404 for non-existent photo URL', async () => {
      const fakeId = uuid();

      const res = await request('GET', `/api/photos/${fakeId}/url`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Delete Photo Tests (4 tests)
  // ===================
  describe('DELETE /api/photos/:id - Delete Photo', () => {
    it('should soft delete photo', async () => {
      const patientId = uuid();
      addMockPatient(patientId);

      const photoId = addMockPhoto({
        patientId,
        storageKey: 'test/delete.jpg',
        originalFilename: 'delete.jpg',
        contentType: 'image/jpeg',
        fileSize: 1000,
        type: 'before',
        photoConsent: true,
        marketingConsent: false,
        isProcessed: true,
        uploadedAt: new Date(),
        uploadedBy: 'test-user-123', // Same as mock user
      });

      const res = await request('DELETE', `/api/photos/${photoId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Photo deleted successfully');

      // Verify photo is soft deleted
      const photo = getPhotoStore().get(photoId);
      expect(photo?.deletedAt).toBeDefined();
    });

    it('should return 404 for non-existent photo', async () => {
      const fakeId = uuid();

      const res = await request('DELETE', `/api/photos/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 for already deleted photo', async () => {
      const patientId = uuid();
      addMockPatient(patientId);

      const photoId = addMockPhoto({
        patientId,
        storageKey: 'test/already-deleted.jpg',
        originalFilename: 'already-deleted.jpg',
        contentType: 'image/jpeg',
        fileSize: 1000,
        type: 'before',
        photoConsent: true,
        marketingConsent: false,
        isProcessed: true,
        uploadedAt: new Date(),
        uploadedBy: 'test-user',
        deletedAt: new Date(),
        deletedBy: 'test-user',
      });

      const res = await request('DELETE', `/api/photos/${photoId}`);

      expect(res.status).toBe(404);
    });

    it('should allow admin to delete photo linked to completed treatment', async () => {
      const patientId = 'patient-001';
      const treatmentId = 'treatment-001'; // This is a completed treatment in mock data

      const photoId = addMockPhoto({
        patientId,
        treatmentId,
        storageKey: 'test/completed-treatment.jpg',
        originalFilename: 'completed-treatment.jpg',
        contentType: 'image/jpeg',
        fileSize: 1000,
        type: 'after',
        photoConsent: true,
        marketingConsent: false,
        isProcessed: true,
        uploadedAt: new Date(),
        uploadedBy: 'other-user', // Different from test user
      });

      // Mock user is admin, so delete should work
      const res = await request('DELETE', `/api/photos/${photoId}`);

      // Admin can delete any photo
      expect(res.status).toBe(200);
    });
  });

  // ===================
  // List Patient Photos Tests (3 tests)
  // ===================
  describe('GET /api/photos/patients/:patientId/photos - List Patient Photos', () => {
    it('should list photos for a patient', async () => {
      // Use mock patient with existing photos
      const patientId = 'patient-001';

      const res = await request('GET', `/api/photos/patients/${patientId}/photos`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeGreaterThan(0);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);
    });

    it('should filter photos by type', async () => {
      const patientId = 'patient-001';

      const res = await request('GET', `/api/photos/patients/${patientId}/photos?type=before`);

      expect(res.status).toBe(200);
      const data = await res.json();

      for (const photo of data.items) {
        expect(photo.type).toBe('before');
      }
    });

    it('should paginate results', async () => {
      const patientId = 'patient-001';

      const res = await request('GET', `/api/photos/patients/${patientId}/photos?page=1&limit=1`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeLessThanOrEqual(1);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(1);
    });
  });

  // ===================
  // List Treatment Photos Tests (3 tests)
  // ===================
  describe('GET /api/photos/treatments/:treatmentId/photos - List Treatment Photos', () => {
    it('should list photos for a treatment', async () => {
      const treatmentId = 'treatment-001';

      const res = await request('GET', `/api/photos/treatments/${treatmentId}/photos`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeGreaterThan(0);

      for (const photo of data.items) {
        expect(photo.treatmentId).toBe(treatmentId);
      }
    });

    it('should return 404 for non-existent treatment', async () => {
      const fakeTreatmentId = uuid();

      const res = await request('GET', `/api/photos/treatments/${fakeTreatmentId}/photos`);

      expect(res.status).toBe(404);
    });

    it('should filter by type for treatment photos', async () => {
      const treatmentId = 'treatment-001';

      const res = await request('GET', `/api/photos/treatments/${treatmentId}/photos?type=after`);

      expect(res.status).toBe(200);
      const data = await res.json();

      for (const photo of data.items) {
        expect(photo.type).toBe('after');
      }
    });
  });

  // ===================
  // Permission Checks Tests (2 tests)
  // ===================
  describe('Permission Checks', () => {
    it('should allow admin to delete any photo', async () => {
      const patientId = uuid();
      addMockPatient(patientId);

      const photoId = addMockPhoto({
        patientId,
        storageKey: 'test/other-user-photo.jpg',
        originalFilename: 'other-user-photo.jpg',
        contentType: 'image/jpeg',
        fileSize: 1000,
        type: 'before',
        photoConsent: true,
        marketingConsent: false,
        isProcessed: true,
        uploadedAt: new Date(),
        uploadedBy: 'different-user-456', // Different user
      });

      // Mock user is admin
      const res = await request('DELETE', `/api/photos/${photoId}`);

      expect(res.status).toBe(200);
    });

    it('should include deleted photos when includeDeleted is true', async () => {
      const patientId = uuid();
      addMockPatient(patientId);

      // Add a deleted photo
      addMockPhoto({
        patientId,
        storageKey: 'test/deleted-photo.jpg',
        originalFilename: 'deleted-photo.jpg',
        contentType: 'image/jpeg',
        fileSize: 1000,
        type: 'before',
        photoConsent: true,
        marketingConsent: false,
        isProcessed: true,
        uploadedAt: new Date(),
        uploadedBy: 'test-user',
        deletedAt: new Date(),
        deletedBy: 'test-user',
      });

      // Add a non-deleted photo
      addMockPhoto({
        patientId,
        storageKey: 'test/active-photo.jpg',
        originalFilename: 'active-photo.jpg',
        contentType: 'image/jpeg',
        fileSize: 1000,
        type: 'before',
        photoConsent: true,
        marketingConsent: false,
        isProcessed: true,
        uploadedAt: new Date(),
        uploadedBy: 'test-user',
      });

      // Without includeDeleted
      const res1 = await request('GET', `/api/photos/patients/${patientId}/photos`);
      const data1 = await res1.json();
      const deletedCount1 = data1.items.filter((p: any) => p.deletedAt).length;
      expect(deletedCount1).toBe(0);

      // With includeDeleted
      const res2 = await request('GET', `/api/photos/patients/${patientId}/photos?includeDeleted=true`);
      const data2 = await res2.json();
      const deletedCount2 = data2.items.filter((p: any) => p.deletedAt).length;
      expect(deletedCount2).toBeGreaterThan(0);
    });
  });

  // ===================
  // Edge Cases Tests (4 tests)
  // ===================
  describe('Edge Cases', () => {
    it('should handle all supported image content types', async () => {
      const patientId = uuid();
      addMockPatient(patientId);

      const contentTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/webp'];

      for (const contentType of contentTypes) {
        const extension = contentType.split('/')[1];
        const res = await request('POST', '/api/photos/upload', {
          patientId,
          filename: `test.${extension}`,
          contentType,
          fileSize: 1024000,
          type: 'before',
          photoConsent: true,
        });

        expect(res.status).toBe(201);
      }
    });

    it('should reject invalid photo type', async () => {
      const patientId = uuid();
      addMockPatient(patientId);

      const res = await request('POST', '/api/photos/upload', {
        patientId,
        filename: 'test.jpg',
        contentType: 'image/jpeg',
        fileSize: 1024000,
        type: 'invalid-type',
        photoConsent: true,
      });

      expect(res.status).toBe(400);
    });

    it('should handle treatment mismatch with patient', async () => {
      const patientId = uuid();
      addMockPatient(patientId);

      // Add a treatment for a different patient
      const differentPatient = uuid();
      addMockPatient(differentPatient);
      addMockTreatment('test-treatment-mismatch', differentPatient, 'in-progress');

      // Try to upload photo with patientId but treatment belongs to different patient
      const res = await request('POST', '/api/photos/upload', {
        patientId,
        treatmentId: 'test-treatment-mismatch',
        filename: 'test.jpg',
        contentType: 'image/jpeg',
        fileSize: 1024000,
        type: 'before',
        photoConsent: true,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      // The error should indicate treatment doesn't belong to patient
      expect(data.error).toBe('BAD_REQUEST');
      expect(data.message).toBeDefined();
      expect(data.message.toLowerCase()).toContain('does not belong');
    });

    it('should handle URL expiry limits', async () => {
      const patientId = uuid();
      addMockPatient(patientId);
      const storageKey = `patients/${patientId}/photos/2024/12/expire-test.jpg`;

      addToMockStorage(storageKey, Buffer.from('test'), 'image/jpeg');

      const photoId = addMockPhoto({
        patientId,
        storageKey,
        originalFilename: 'expire-test.jpg',
        contentType: 'image/jpeg',
        fileSize: 1000,
        type: 'before',
        photoConsent: true,
        marketingConsent: false,
        isProcessed: true,
        uploadedAt: new Date(),
        uploadedBy: 'test-user',
      });

      // Test minimum expiry (60 seconds)
      const res1 = await request('GET', `/api/photos/${photoId}/url?expiresIn=60`);
      expect(res1.status).toBe(200);
      const data1 = await res1.json();
      expect(data1.expiresIn).toBe(60);

      // Test maximum expiry (86400 seconds = 24 hours)
      const res2 = await request('GET', `/api/photos/${photoId}/url?expiresIn=86400`);
      expect(res2.status).toBe(200);
      const data2 = await res2.json();
      expect(data2.expiresIn).toBe(86400);

      // Test exceeding maximum (should fail validation)
      const res3 = await request('GET', `/api/photos/${photoId}/url?expiresIn=90000`);
      expect(res3.status).toBe(400);
    });
  });
});
