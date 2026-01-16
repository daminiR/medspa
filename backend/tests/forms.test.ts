/**
 * Forms API Tests
 *
 * Comprehensive tests for:
 * - List form templates with pagination and filtering
 * - Get single form template
 * - Create form template (valid and invalid data)
 * - Update form template
 * - Delete form template (soft delete)
 * - Duplicate form template
 * - Patient form assignments
 * - Edge cases and validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import forms, {
  clearStores,
  getFormTemplateStore,
  getPatientFormAssignmentStore,
  StoredFormTemplate,
} from '../src/routes/forms';
import { errorHandler } from '../src/middleware/error';
import { sessionStore } from '../src/middleware/auth';
import crypto from 'crypto';

// Create test app with error handler
const app = new Hono();
app.route('/api/forms', forms);
app.onError(errorHandler);

// Mock session for authentication
const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
const mockSessionToken = 'test-session-token-forms-12345';
const mockSessionId = 'test-session-id-forms';

function setupMockSession() {
  sessionStore.set(mockSessionId, {
    id: mockSessionId,
    token: mockSessionToken,
    userId: mockUserId,
    email: 'test@example.com',
    role: 'admin',
    permissions: ['form:read', 'form:create', 'form:update', 'form:delete'],
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

// Valid form template data for creation
const validFormData = {
  title: 'Test Consent Form',
  type: 'consent' as const,
  description: 'A test consent form for unit testing',
  category: 'testing',
  sections: [
    {
      title: 'Section 1',
      description: 'First section',
      order: 0,
      fields: [
        {
          type: 'text',
          label: 'Full Name',
          placeholder: 'Enter your name',
          required: true,
          order: 0,
        },
        {
          type: 'checkbox',
          label: 'I agree to the terms',
          required: true,
          options: ['Yes'],
          order: 1,
        },
      ],
    },
  ],
  signature: {
    required: true,
    type: 'both' as const,
    legalText: 'By signing, you agree to the terms.',
    dateRequired: true,
  },
  requiresWitness: false,
  expirationDays: 90,
};

describe('Forms API', () => {
  beforeEach(() => {
    // Clear all stores and reinitialize mock data between tests
    clearStores();
    sessionStore.clear();
    setupMockSession();
  });

  // ===================
  // Authentication Tests
  // ===================
  describe('Authentication', () => {
    it('should reject requests without authentication', async () => {
      const res = await unauthenticatedRequest('GET', '/api/forms');
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const req = new Request('http://localhost/api/forms', {
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
  // List Form Templates Tests
  // ===================
  describe('List Form Templates - GET /api/forms', () => {
    it('should return paginated list of form templates', async () => {
      const res = await request('GET', '/api/forms');

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
      const res = await request('GET', '/api/forms?page=1&limit=2');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeLessThanOrEqual(2);
      expect(data.limit).toBe(2);
    });

    it('should filter by type', async () => {
      const res = await request('GET', '/api/forms?type=intake');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.items.every((f: any) => f.type === 'intake')).toBe(true);
    });

    it('should filter by isActive', async () => {
      const res = await request('GET', '/api/forms?isActive=true');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((f: any) => f.isActive === true)).toBe(true);
    });

    it('should filter by search query', async () => {
      const res = await request('GET', '/api/forms?query=HIPAA');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.items.some((f: any) =>
        f.title.toLowerCase().includes('hipaa') ||
        f.slug.toLowerCase().includes('hipaa')
      )).toBe(true);
    });
  });

  // ===================
  // Create Form Template Tests
  // ===================
  describe('Create Form Template - POST /api/forms', () => {
    it('should create form template with valid data', async () => {
      const res = await request('POST', '/api/forms', validFormData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.form).toBeDefined();
      expect(data.form.id).toBeDefined();
      expect(data.form.slug).toBeDefined();
      expect(data.form.title).toBe(validFormData.title);
      expect(data.form.type).toBe(validFormData.type);
      expect(data.form.version).toBe(1);
      expect(data.message).toBe('Form template created successfully');
    });

    it('should auto-generate slug from title', async () => {
      const res = await request('POST', '/api/forms', {
        title: 'My Test Form With Spaces',
        type: 'consent',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.form.slug).toBe('my-test-form-with-spaces');
    });

    it('should use provided slug', async () => {
      const res = await request('POST', '/api/forms', {
        ...validFormData,
        slug: 'custom-slug-here',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.form.slug).toBe('custom-slug-here');
    });

    it('should reject invalid slug format', async () => {
      const res = await request('POST', '/api/forms', {
        ...validFormData,
        slug: 'Invalid Slug With Spaces!',
      });

      expect(res.status).toBe(400);
    });

    it('should reject missing required fields', async () => {
      const res = await request('POST', '/api/forms', {
        description: 'Missing title and type',
      });

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Get Form Template Tests
  // ===================
  describe('Get Form Template - GET /api/forms/:id', () => {
    it('should return single form template by ID', async () => {
      const forms = Array.from(getFormTemplateStore().values());
      const formId = forms[0].id;

      const res = await request('GET', `/api/forms/${formId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.form).toBeDefined();
      expect(data.form.id).toBe(formId);
      expect(data.form.title).toBeDefined();
      expect(data.form.sections).toBeDefined();
      expect(data.form.signature).toBeDefined();
    });

    it('should return 404 for non-existent form template', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/forms/${fakeId}`);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid UUID', async () => {
      const res = await request('GET', '/api/forms/invalid-id');

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Update Form Template Tests
  // ===================
  describe('Update Form Template - PUT /api/forms/:id', () => {
    it('should update form template with valid data', async () => {
      const forms = Array.from(getFormTemplateStore().values());
      const formId = forms[0].id;
      const originalVersion = forms[0].version;

      const updateData = {
        title: 'Updated Form Title',
        description: 'Updated description',
      };

      const res = await request('PUT', `/api/forms/${formId}`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.form.title).toBe('Updated Form Title');
      expect(data.form.description).toBe('Updated description');
      expect(data.form.version).toBe(originalVersion + 1);
      expect(data.message).toBe('Form template updated successfully');
    });

    it('should increment version on each update', async () => {
      const forms = Array.from(getFormTemplateStore().values());
      const formId = forms[0].id;

      // First update
      await request('PUT', `/api/forms/${formId}`, { title: 'Update 1' });
      const res1 = await request('GET', `/api/forms/${formId}`);
      const data1 = await res1.json();
      const versionAfterFirst = data1.form.version;

      // Second update
      await request('PUT', `/api/forms/${formId}`, { title: 'Update 2' });
      const res2 = await request('GET', `/api/forms/${formId}`);
      const data2 = await res2.json();

      expect(data2.form.version).toBe(versionAfterFirst + 1);
    });

    it('should return 404 for non-existent form template', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('PUT', `/api/forms/${fakeId}`, { title: 'Test' });

      expect(res.status).toBe(404);
    });

    it('should reject duplicate slug on update', async () => {
      const forms = Array.from(getFormTemplateStore().values());
      const form1 = forms[0];
      const form2 = forms[1];

      // Try to update form1 with form2's slug
      const res = await request('PUT', `/api/forms/${form1.id}`, {
        slug: form2.slug,
      });

      expect(res.status).toBe(409);
    });
  });

  // ===================
  // Delete Form Template Tests
  // ===================
  describe('Delete Form Template - DELETE /api/forms/:id', () => {
    it('should soft delete form template', async () => {
      const forms = Array.from(getFormTemplateStore().values());
      const formId = forms[0].id;

      const res = await request('DELETE', `/api/forms/${formId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Form template deleted successfully');

      // Verify form is soft deleted
      const deletedForm = getFormTemplateStore().get(formId);
      expect(deletedForm?.deletedAt).toBeDefined();
      expect(deletedForm?.isActive).toBe(false);
    });

    it('should not be able to get deleted form template', async () => {
      const forms = Array.from(getFormTemplateStore().values());
      const formId = forms[0].id;

      // Delete the form
      await request('DELETE', `/api/forms/${formId}`);

      // Try to get the deleted form
      const res = await request('GET', `/api/forms/${formId}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 for non-existent form template', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('DELETE', `/api/forms/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Duplicate Form Template Tests
  // ===================
  describe('Duplicate Form Template - POST /api/forms/:id/duplicate', () => {
    it('should duplicate form template', async () => {
      const forms = Array.from(getFormTemplateStore().values());
      const formId = forms[0].id;
      const originalForm = forms[0];

      const res = await request('POST', `/api/forms/${formId}/duplicate`);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.form).toBeDefined();
      expect(data.form.id).not.toBe(formId);
      expect(data.form.title).toBe(`${originalForm.title} (Copy)`);
      expect(data.form.slug).toContain(originalForm.slug);
      expect(data.form.slug).toContain('copy');
      expect(data.form.version).toBe(1);
      expect(data.message).toBe('Form template duplicated successfully');
    });

    it('should create unique slug when duplicating', async () => {
      const forms = Array.from(getFormTemplateStore().values());
      const formId = forms[0].id;

      // Duplicate twice
      const res1 = await request('POST', `/api/forms/${formId}/duplicate`);
      const data1 = await res1.json();

      const res2 = await request('POST', `/api/forms/${formId}/duplicate`);
      const data2 = await res2.json();

      expect(data1.form.slug).not.toBe(data2.form.slug);
    });

    it('should return 404 for non-existent form template', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('POST', `/api/forms/${fakeId}/duplicate`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Patient Form Assignment Tests
  // ===================
  describe('Patient Form Assignments', () => {
    const testPatientId = '550e8400-e29b-41d4-a716-446655440099';

    describe('List Patient Forms - GET /api/forms/patients/:patientId/forms', () => {
      it('should return forms assigned to patient', async () => {
        const res = await request('GET', '/api/forms/patients/550e8400-e29b-41d4-a716-446655440001/forms');

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.items).toBeDefined();
        expect(Array.isArray(data.items)).toBe(true);
        expect(data.total).toBeDefined();
      });

      it('should filter by status', async () => {
        const res = await request('GET', '/api/forms/patients/550e8400-e29b-41d4-a716-446655440001/forms?status=completed');

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.items.every((a: any) => a.status === 'completed')).toBe(true);
      });

      it('should return empty array for patient with no forms', async () => {
        const res = await request('GET', `/api/forms/patients/${testPatientId}/forms`);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.items).toEqual([]);
        expect(data.total).toBe(0);
      });
    });

    describe('Assign Form to Patient - POST /api/forms/patients/:patientId/forms', () => {
      it('should assign form to patient', async () => {
        const forms = Array.from(getFormTemplateStore().values()).filter(f => f.isActive);
        const formId = forms[0].id;

        const assignmentData = {
          formId,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        const res = await request('POST', `/api/forms/patients/${testPatientId}/forms`, assignmentData);

        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.assignment).toBeDefined();
        expect(data.assignment.formId).toBe(formId);
        expect(data.assignment.patientId).toBe(testPatientId);
        expect(data.assignment.status).toBe('pending');
        expect(data.message).toBe('Form assigned to patient successfully');
      });

      it('should reject assignment of non-existent form', async () => {
        const fakeFormId = crypto.randomUUID();

        const res = await request('POST', `/api/forms/patients/${testPatientId}/forms`, {
          formId: fakeFormId,
        });

        expect(res.status).toBe(404);
      });
    });
  });

  // ===================
  // Edge Cases & Slug Uniqueness Tests
  // ===================
  describe('Edge Cases', () => {
    it('should reject duplicate slug on create', async () => {
      // Get existing form slug
      const forms = Array.from(getFormTemplateStore().values());
      const existingSlug = forms[0].slug;

      const res = await request('POST', '/api/forms', {
        title: 'New Form',
        type: 'consent',
        slug: existingSlug,
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error).toBe('CONFLICT');
    });

    it('should allow same slug after original is deleted', async () => {
      // Create a form
      const createRes = await request('POST', '/api/forms', {
        title: 'Temporary Form',
        type: 'consent',
        slug: 'temp-slug',
      });
      const { form: createdForm } = await createRes.json();

      // Delete it
      await request('DELETE', `/api/forms/${createdForm.id}`);

      // Should be able to create with same slug
      const res = await request('POST', '/api/forms', {
        title: 'New Form Same Slug',
        type: 'consent',
        slug: 'temp-slug',
      });

      expect(res.status).toBe(201);
    });

    it('should handle pagination edge case - page beyond results', async () => {
      const res = await request('GET', '/api/forms?page=1000');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
      expect(data.hasMore).toBe(false);
    });

    it('should reject invalid pagination values', async () => {
      const res = await request('GET', '/api/forms?page=0');

      expect(res.status).toBe(400);
    });

    it('should reject limit over 100', async () => {
      const res = await request('GET', '/api/forms?limit=101');

      expect(res.status).toBe(400);
    });

    it('should validate expirationDays range', async () => {
      const res = await request('POST', '/api/forms', {
        title: 'Test Form',
        type: 'consent',
        expirationDays: 500, // Over 365 max
      });

      expect(res.status).toBe(400);
    });

    it('should reject assigning inactive form', async () => {
      // Find an inactive form
      const forms = Array.from(getFormTemplateStore().values()).filter(f => !f.isActive);

      if (forms.length > 0) {
        const inactiveFormId = forms[0].id;
        const testPatientId = crypto.randomUUID();

        const res = await request('POST', `/api/forms/patients/${testPatientId}/forms`, {
          formId: inactiveFormId,
        });

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.message).toContain('inactive');
      }
    });

    it('should not list deleted form templates', async () => {
      const forms = Array.from(getFormTemplateStore().values());
      const formId = forms[0].id;
      const originalTotal = forms.filter(f => !f.deletedAt).length;

      // Delete a form
      await request('DELETE', `/api/forms/${formId}`);

      // List forms
      const res = await request('GET', '/api/forms');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.total).toBe(originalTotal - 1);
    });

    it('should create form with empty sections', async () => {
      const res = await request('POST', '/api/forms', {
        title: 'Empty Form',
        type: 'custom',
        sections: [],
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.form.sections).toEqual([]);
    });

    it('should validate serviceIds as UUIDs', async () => {
      const res = await request('POST', '/api/forms', {
        title: 'Service Form',
        type: 'treatment-specific',
        serviceIds: ['not-a-uuid', 'also-invalid'],
      });

      expect(res.status).toBe(400);
    });

    it('should accept valid serviceIds', async () => {
      const res = await request('POST', '/api/forms', {
        title: 'Service Form',
        type: 'treatment-specific',
        serviceIds: [crypto.randomUUID(), crypto.randomUUID()],
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.form.serviceIds.length).toBe(2);
    });
  });

  // ===================
  // Form Field Validation Tests
  // ===================
  describe('Form Field Validation', () => {
    it('should auto-generate field IDs when not provided', async () => {
      const res = await request('POST', '/api/forms', {
        title: 'Form With Fields',
        type: 'consent',
        sections: [
          {
            title: 'Section 1',
            order: 0,
            fields: [
              {
                type: 'text',
                label: 'Test Field',
                required: true,
                order: 0,
              },
            ],
          },
        ],
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.form.sections[0].id).toBeDefined();
      expect(data.form.sections[0].fields[0].id).toBeDefined();
    });

    it('should validate field type', async () => {
      const res = await request('POST', '/api/forms', {
        title: 'Invalid Field Form',
        type: 'consent',
        sections: [
          {
            title: 'Section 1',
            order: 0,
            fields: [
              {
                type: 'invalid-type',
                label: 'Test Field',
                required: true,
                order: 0,
              },
            ],
          },
        ],
      });

      expect(res.status).toBe(400);
    });

    it('should create form with all field types', async () => {
      const allFieldTypes = [
        { type: 'text', label: 'Text', order: 0 },
        { type: 'textarea', label: 'Textarea', order: 1 },
        { type: 'select', label: 'Select', options: ['A', 'B'], order: 2 },
        { type: 'checkbox', label: 'Checkbox', options: ['Yes'], order: 3 },
        { type: 'radio', label: 'Radio', options: ['X', 'Y'], order: 4 },
        { type: 'date', label: 'Date', order: 5 },
        { type: 'signature', label: 'Signature', order: 6 },
        { type: 'file', label: 'File', order: 7 },
        { type: 'number', label: 'Number', order: 8 },
        { type: 'email', label: 'Email', order: 9 },
        { type: 'phone', label: 'Phone', order: 10 },
      ];

      const res = await request('POST', '/api/forms', {
        title: 'All Field Types Form',
        type: 'custom',
        sections: [
          {
            title: 'All Fields',
            order: 0,
            fields: allFieldTypes.map(f => ({ ...f, required: false })),
          },
        ],
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.form.sections[0].fields.length).toBe(11);
    });
  });
});
