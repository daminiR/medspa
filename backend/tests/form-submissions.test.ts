/**
 * Form Submissions API Tests
 *
 * Comprehensive tests for:
 * - Get submission by ID
 * - Update submission (save responses)
 * - E-signature capture
 * - Complete submission
 * - PDF generation
 * - Consent verification
 * - Patient consents list
 * - Edge cases (completed/expired submissions)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import formSubmissions, {
  clearStores,
  getSubmissionsStore,
  getFormsStore,
  addMockSubmission,
  addMockFormTemplate,
  consents,
  patientConsents,
  FormSubmission,
} from '../src/routes/form-submissions';
import { errorHandler } from '../src/middleware/error';
import { sessionStore } from '../src/middleware/auth';
import crypto from 'crypto';

// Create test app with error handler
const app = new Hono();
app.route('/api/form-submissions', formSubmissions);
app.route('/api/consents', consents);
app.route('/api/patients', patientConsents);
app.onError(errorHandler);

// Mock session for authentication
const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
const mockSessionToken = 'test-session-token-form-submissions';
const mockSessionId = 'test-session-id-form';

function setupMockSession(role = 'admin') {
  sessionStore.set(mockSessionId, {
    id: mockSessionId,
    token: mockSessionToken,
    userId: mockUserId,
    email: 'test@example.com',
    role,
    permissions: ['form:read', 'form:create', 'form:update', 'form:sign'],
    locationIds: ['loc-1'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
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
      'X-Forwarded-For': '192.168.1.1',
      'User-Agent': 'Test-Agent/1.0',
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

describe('Form Submissions API', () => {
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
      const res = await unauthenticatedRequest('GET', '/api/form-submissions/sub-001');
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const req = new Request('http://localhost/api/form-submissions/sub-001', {
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
  // Get Submission Tests
  // ===================
  describe('Get Submission - GET /api/form-submissions/:id', () => {
    it('should return submission by ID', async () => {
      const res = await request('GET', '/api/form-submissions/sub-001');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.submission).toBeDefined();
      expect(data.submission.id).toBe('sub-001');
      expect(data.submission.formTitle).toBe('General Consent Form');
      expect(data.submission.status).toBe('pending');
    });

    it('should return 404 for non-existent submission', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/form-submissions/${fakeId}`);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });

    it('should return 404 for non-existent ID', async () => {
      const res = await request('GET', '/api/form-submissions/non-existent-id');

      expect(res.status).toBe(404);
    });

    it('should automatically mark expired submissions', async () => {
      // Add an expired submission
      const expiredSubmission: FormSubmission = {
        id: 'sub-expired-test',
        formId: 'form-001',
        formTitle: 'Test Form',
        formType: 'consent',
        patientId: 'patient-001',
        status: 'pending',
        responses: {},
        consentGiven: false,
        acknowledgements: [],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Expired yesterday
      };
      addMockSubmission(expiredSubmission);

      const res = await request('GET', '/api/form-submissions/sub-expired-test');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.submission.status).toBe('expired');
    });
  });

  // ===================
  // Update Submission Tests
  // ===================
  describe('Update Submission - PUT /api/form-submissions/:id', () => {
    it('should update submission responses', async () => {
      const updateData = {
        responses: {
          'field-1': 'John Doe',
          'field-2': '1990-01-15',
        },
      };

      const res = await request('PUT', '/api/form-submissions/sub-001', updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.submission.responses['field-1']).toBe('John Doe');
      expect(data.submission.responses['field-2']).toBe('1990-01-15');
      expect(data.message).toBe('Submission updated successfully');
    });

    it('should change status from pending to in-progress', async () => {
      const updateData = {
        responses: { 'field-1': 'Test' },
      };

      const res = await request('PUT', '/api/form-submissions/sub-001', updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.submission.status).toBe('in-progress');
      expect(data.submission.startedAt).toBeDefined();
    });

    it('should not allow updating completed submission', async () => {
      const updateData = {
        responses: { 'field-1': 'Test' },
      };

      const res = await request('PUT', '/api/form-submissions/sub-003', updateData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Cannot modify');
    });

    it('should not allow updating expired submission', async () => {
      const updateData = {
        responses: { 'field-1': 'Test' },
      };

      const res = await request('PUT', '/api/form-submissions/sub-004', updateData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('expired');
    });

    it('should return 404 for non-existent submission', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('PUT', `/api/form-submissions/${fakeId}`, {
        responses: { 'field-1': 'Test' },
      });

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // E-Signature Tests
  // ===================
  describe('E-Signature - POST /api/form-submissions/:id/sign', () => {
    it('should add patient signature (type)', async () => {
      const signatureData = {
        signatureType: 'patient',
        type: 'type',
        value: 'John Doe',
        acknowledgement: 'I agree to the terms',
      };

      const res = await request('POST', '/api/form-submissions/sub-001/sign', signatureData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.submission.patientSignature).toBeDefined();
      expect(data.submission.patientSignature.type).toBe('type');
      expect(data.submission.patientSignature.value).toBe('John Doe');
      expect(data.submission.patientSignature.ipAddress).toBe('192.168.1.1');
      expect(data.submission.acknowledgements).toContain('I agree to the terms');
      expect(data.message).toBe('Signature added successfully');
    });

    it('should add patient signature (draw - base64)', async () => {
      const signatureData = {
        signatureType: 'patient',
        type: 'draw',
        value: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk',
      };

      const res = await request('POST', '/api/form-submissions/sub-001/sign', signatureData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.submission.patientSignature.type).toBe('draw');
      expect(data.submission.patientSignature.value).toContain('base64');
    });

    it('should capture timestamp and IP for ESIGN compliance', async () => {
      const signatureData = {
        signatureType: 'patient',
        type: 'type',
        value: 'Test Signature',
      };

      const res = await request('POST', '/api/form-submissions/sub-001/sign', signatureData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.submission.patientSignature.timestamp).toBeDefined();
      expect(data.submission.patientSignature.ipAddress).toBeDefined();
      expect(data.submission.patientSignature.userAgent).toBeDefined();
    });

    it('should not allow duplicate signatures of same type', async () => {
      // First signature
      await request('POST', '/api/form-submissions/sub-001/sign', {
        signatureType: 'patient',
        type: 'type',
        value: 'First Signature',
      });

      // Try to add second patient signature
      const res = await request('POST', '/api/form-submissions/sub-001/sign', {
        signatureType: 'patient',
        type: 'type',
        value: 'Second Signature',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('already exists');
    });

    it('should not allow signing completed submission', async () => {
      const signatureData = {
        signatureType: 'witness',
        type: 'type',
        value: 'Witness Name',
      };

      const res = await request('POST', '/api/form-submissions/sub-003/sign', signatureData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('completed');
    });

    it('should not allow signing expired submission', async () => {
      const signatureData = {
        signatureType: 'patient',
        type: 'type',
        value: 'Test',
      };

      const res = await request('POST', '/api/form-submissions/sub-004/sign', signatureData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('expired');
    });

    it('should restrict provider signature to provider role', async () => {
      // Clear session and set up as staff (not provider)
      sessionStore.clear();
      setupMockSession('staff');

      const signatureData = {
        signatureType: 'provider',
        type: 'type',
        value: 'Dr. Test',
      };

      const res = await request('POST', '/api/form-submissions/sub-002/sign', signatureData);

      expect(res.status).toBe(403);
    });
  });

  // ===================
  // Complete Submission Tests
  // ===================
  describe('Complete Submission - POST /api/form-submissions/:id/complete', () => {
    it('should complete submission with all requirements met', async () => {
      // First fill required fields (BEFORE signing, as cannot modify after signing)
      const updateRes = await request('PUT', '/api/form-submissions/sub-001', {
        responses: {
          'field-1': 'John Doe',
          'field-2': '1990-01-01',
          'field-3': true,
        },
      });
      expect(updateRes.status).toBe(200);

      // Then add patient signature
      const signRes = await request('POST', '/api/form-submissions/sub-001/sign', {
        signatureType: 'patient',
        type: 'type',
        value: 'John Doe',
      });
      expect(signRes.status).toBe(200);

      // Complete
      const res = await request('POST', '/api/form-submissions/sub-001/complete', {
        finalAcknowledgement: 'I confirm all information is accurate',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.submission.status).toBe('completed');
      expect(data.submission.completedAt).toBeDefined();
      expect(data.submission.pdfUrl).toBeDefined();
      expect(data.submission.consentGiven).toBe(true);
      expect(data.message).toBe('Submission completed successfully');
    });

    it('should reject completion without patient signature', async () => {
      // Fill required fields but no signature
      await request('PUT', '/api/form-submissions/sub-001', {
        responses: {
          'field-1': 'John Doe',
          'field-2': '1990-01-01',
          'field-3': true,
        },
      });

      const res = await request('POST', '/api/form-submissions/sub-001/complete', {});

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Patient signature is required');
    });

    it('should reject completion for form requiring witness without witness signature', async () => {
      // sub-002 uses form-002 which requires witness
      // Add patient signature
      await request('POST', '/api/form-submissions/sub-002/sign', {
        signatureType: 'patient',
        type: 'type',
        value: 'John Doe',
      });

      // Fill required fields
      await request('PUT', '/api/form-submissions/sub-002', {
        responses: {
          'field-1': 'John Doe',
          'field-2': 'No history',
          'field-4': true,
        },
      });

      const res = await request('POST', '/api/form-submissions/sub-002/complete', {});

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Witness signature is required');
    });

    it('should not allow completing already completed submission', async () => {
      const res = await request('POST', '/api/form-submissions/sub-003/complete', {});

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('already completed');
    });
  });

  // ===================
  // PDF Generation Tests
  // ===================
  describe('PDF Generation - GET /api/form-submissions/:id/pdf', () => {
    it('should return PDF URL for completed submission', async () => {
      const res = await request('GET', '/api/form-submissions/sub-003/pdf');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.pdfUrl).toBeDefined();
      expect(data.generatedAt).toBeDefined();
      expect(data.submissionId).toBe('sub-003');
    });

    it('should reject PDF generation for non-completed submission', async () => {
      const res = await request('GET', '/api/form-submissions/sub-001/pdf');

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('completed submissions');
    });

    it('should return 404 for non-existent submission', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/form-submissions/${fakeId}/pdf`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Consent Verification Tests
  // ===================
  describe('Consent Verification - POST /api/consents/verify', () => {
    it('should verify valid consent exists', async () => {
      const res = await request('POST', '/api/consents/verify', {
        patientId: 'patient-002',
        serviceId: 'service-001',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.verification.valid).toBe(true);
      expect(data.verification.consentId).toBe('sub-003');
      expect(data.verification.patientId).toBe('patient-002');
      expect(data.verification.serviceId).toBe('service-001');
    });

    it('should return invalid when no consent exists', async () => {
      const res = await request('POST', '/api/consents/verify', {
        patientId: 'patient-999',
        serviceId: 'service-001',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.verification.valid).toBe(false);
      expect(data.verification.message).toContain('No valid consent');
    });

    it('should return invalid for service not covered by consent', async () => {
      const res = await request('POST', '/api/consents/verify', {
        patientId: 'patient-002',
        serviceId: 'service-not-covered',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.verification.valid).toBe(false);
    });

    it('should handle empty IDs in request body', async () => {
      const res = await request('POST', '/api/consents/verify', {
        patientId: '',
        serviceId: 'service-001',
      });

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Patient Consents Tests
  // ===================
  describe('Patient Consents - GET /api/patients/:patientId/consents', () => {
    it('should list valid consents for patient', async () => {
      const res = await request('GET', '/api/patients/patient-002/consents');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();
      expect(data.validCount).toBeDefined();
      expect(data.expiredCount).toBeDefined();
    });

    it('should include consent details in list', async () => {
      const res = await request('GET', '/api/patients/patient-002/consents');

      expect(res.status).toBe(200);
      const data = await res.json();

      if (data.items.length > 0) {
        const consent = data.items[0];
        expect(consent.id).toBeDefined();
        expect(consent.formTitle).toBeDefined();
        expect(consent.completedAt).toBeDefined();
        expect(consent.isValid).toBeDefined();
        expect(consent.pdfUrl).toBeDefined();
      }
    });

    it('should return empty list for patient with no consents', async () => {
      const res = await request('GET', '/api/patients/patient-no-consents/consents');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
      expect(data.total).toBe(0);
    });

    it('should return empty list for invalid patient ID format', async () => {
      const res = await request('GET', '/api/patients/invalid-id/consents');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
    });
  });

  // ===================
  // Edge Cases Tests
  // ===================
  describe('Edge Cases', () => {
    it('should not allow modification after patient signs', async () => {
      // Create a fresh submission for this test
      const testSubmission: FormSubmission = {
        id: 'sub-edge-001',
        formId: 'form-001',
        formTitle: 'Test Form',
        formType: 'consent',
        patientId: 'patient-001',
        status: 'pending',
        responses: {},
        consentGiven: false,
        acknowledgements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      addMockSubmission(testSubmission);

      // Add patient signature
      await request('POST', '/api/form-submissions/sub-edge-001/sign', {
        signatureType: 'patient',
        type: 'type',
        value: 'John Doe',
      });

      // Try to update responses after signing
      const res = await request('PUT', '/api/form-submissions/sub-edge-001', {
        responses: { 'field-1': 'Modified After Signing' },
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Cannot modify');
    });

    it('should handle concurrent updates gracefully', async () => {
      // Create a fresh submission for this test
      const testSubmission: FormSubmission = {
        id: 'sub-concurrent-001',
        formId: 'form-001',
        formTitle: 'Test Form',
        formType: 'consent',
        patientId: 'patient-001',
        status: 'pending',
        responses: {},
        consentGiven: false,
        acknowledgements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      addMockSubmission(testSubmission);

      // Make two simultaneous updates
      const [res1, res2] = await Promise.all([
        request('PUT', '/api/form-submissions/sub-concurrent-001', {
          responses: { 'field-1': 'Update 1' },
        }),
        request('PUT', '/api/form-submissions/sub-concurrent-001', {
          responses: { 'field-2': 'Update 2' },
        }),
      ]);

      // Both should succeed since they update different fields
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
    });

    it('should track IP address and user agent on updates', async () => {
      // Create a fresh submission for this test
      const testSubmission: FormSubmission = {
        id: 'sub-tracking-001',
        formId: 'form-001',
        formTitle: 'Test Form',
        formType: 'consent',
        patientId: 'patient-001',
        status: 'pending',
        responses: {},
        consentGiven: false,
        acknowledgements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      addMockSubmission(testSubmission);

      const res = await request('PUT', '/api/form-submissions/sub-tracking-001', {
        responses: { 'field-1': 'Test' },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.submission.ipAddress).toBeDefined();
      expect(data.submission.userAgent).toBeDefined();
    });

    it('should handle empty responses object', async () => {
      // Create a fresh submission for this test
      const testSubmission: FormSubmission = {
        id: 'sub-empty-001',
        formId: 'form-001',
        formTitle: 'Test Form',
        formType: 'consent',
        patientId: 'patient-001',
        status: 'pending',
        responses: {},
        consentGiven: false,
        acknowledgements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      addMockSubmission(testSubmission);

      const res = await request('PUT', '/api/form-submissions/sub-empty-001', {
        responses: {},
      });

      expect(res.status).toBe(200);
    });

    it('should preserve existing responses when updating', async () => {
      // Create a fresh submission for this test
      const testSubmission: FormSubmission = {
        id: 'sub-preserve-001',
        formId: 'form-001',
        formTitle: 'Test Form',
        formType: 'consent',
        patientId: 'patient-001',
        status: 'pending',
        responses: {},
        consentGiven: false,
        acknowledgements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      addMockSubmission(testSubmission);

      // First update
      await request('PUT', '/api/form-submissions/sub-preserve-001', {
        responses: { 'field-1': 'Original Value' },
      });

      // Second update (different field)
      const res = await request('PUT', '/api/form-submissions/sub-preserve-001', {
        responses: { 'field-2': 'New Value' },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.submission.responses['field-1']).toBe('Original Value');
      expect(data.submission.responses['field-2']).toBe('New Value');
    });

    it('should add witness signature for provider role', async () => {
      // Create a fresh submission for this test
      const testSubmission: FormSubmission = {
        id: 'sub-witness-001',
        formId: 'form-001',
        formTitle: 'Test Form',
        formType: 'consent',
        patientId: 'patient-001',
        status: 'pending',
        responses: {},
        consentGiven: false,
        acknowledgements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      addMockSubmission(testSubmission);

      sessionStore.clear();
      setupMockSession('provider');

      const signatureData = {
        signatureType: 'witness',
        type: 'type',
        value: 'Witness Name',
      };

      const res = await request('POST', '/api/form-submissions/sub-witness-001/sign', signatureData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.submission.witnessSignature).toBeDefined();
    });

    it('should allow provider signature for admin role', async () => {
      // Create a fresh submission for this test
      const testSubmission: FormSubmission = {
        id: 'sub-provider-001',
        formId: 'form-002',
        formTitle: 'Botox Treatment Consent',
        formType: 'consent',
        patientId: 'patient-001',
        status: 'in-progress',
        responses: {
          'field-1': 'John Doe',
          'field-2': 'No history',
        },
        consentGiven: false,
        acknowledgements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      addMockSubmission(testSubmission);

      sessionStore.clear();
      setupMockSession('admin');

      // Add patient signature first
      await request('POST', '/api/form-submissions/sub-provider-001/sign', {
        signatureType: 'patient',
        type: 'type',
        value: 'Patient Name',
      });

      // Add provider signature
      const res = await request('POST', '/api/form-submissions/sub-provider-001/sign', {
        signatureType: 'provider',
        type: 'type',
        value: 'Dr. Admin',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.submission.providerSignature).toBeDefined();
    });
  });
});
