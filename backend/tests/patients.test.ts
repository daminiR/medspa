/**
 * Patients API Tests
 *
 * Comprehensive tests for:
 * - List patients with pagination
 * - Search patients
 * - Get single patient
 * - Create patient (valid and invalid data)
 * - Update patient
 * - Delete patient (soft delete)
 * - Get patient appointments
 * - Add and get patient notes
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import patients, {
  clearStores,
  getPatientStore,
  getNoteStore,
  getAppointmentStore,
  StoredPatient,
  StoredAppointment,
} from '../src/routes/patients';
import { errorHandler } from '../src/middleware/error';
import { sessionStore } from '../src/middleware/auth';
import crypto from 'crypto';

// Create test app with error handler
const app = new Hono();
app.route('/api/patients', patients);
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
    permissions: ['patient:read', 'patient:create', 'patient:update', 'patient:delete'],
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

// Valid patient data for creation
const validPatientData = {
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-05-15',
  phone: '(555) 999-1234',
  email: 'john.doe@example.com',
  gender: 'male' as const,
  address: {
    street: '456 Test Ave',
    city: 'Test City',
    state: 'CA',
    zipCode: '90210',
    country: 'USA',
  },
};

describe('Patients API', () => {
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
      const res = await unauthenticatedRequest('GET', '/api/patients');
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const req = new Request('http://localhost/api/patients', {
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
  // List Patients Tests
  // ===================
  describe('List Patients - GET /api/patients', () => {
    it('should return paginated list of patients', async () => {
      const res = await request('GET', '/api/patients');

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
      const res = await request('GET', '/api/patients?page=1&limit=2');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeLessThanOrEqual(2);
      expect(data.limit).toBe(2);
    });

    it('should filter by status', async () => {
      const res = await request('GET', '/api/patients?status=active');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((p: any) => p.status === 'active')).toBe(true);
    });

    it('should filter by search query (name)', async () => {
      const res = await request('GET', '/api/patients?query=Sarah');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.items.some((p: any) =>
        p.firstName.toLowerCase().includes('sarah') ||
        p.lastName.toLowerCase().includes('sarah')
      )).toBe(true);
    });

    it('should filter by search query (email)', async () => {
      const res = await request('GET', '/api/patients?query=sarah.johnson@email.com');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
    });

    it('should filter by search query (phone)', async () => {
      const res = await request('GET', '/api/patients?query=5551234567');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
    });

    it('should filter by tags', async () => {
      const res = await request('GET', '/api/patients?tags=VIP');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.items.every((p: any) =>
        p.tags?.some((t: string) => t.toLowerCase() === 'vip')
      )).toBe(true);
    });

    it('should filter by hasBalance', async () => {
      const res = await request('GET', '/api/patients?hasBalance=true');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((p: any) => p.balance > 0)).toBe(true);
    });

    it('should sort by lastName ascending (default)', async () => {
      const res = await request('GET', '/api/patients');

      expect(res.status).toBe(200);
      const data = await res.json();
      const lastNames = data.items.map((p: any) => p.lastName.toLowerCase());
      const sortedLastNames = [...lastNames].sort();
      expect(lastNames).toEqual(sortedLastNames);
    });

    it('should sort by firstName descending', async () => {
      const res = await request('GET', '/api/patients?sortBy=firstName&sortOrder=desc');

      expect(res.status).toBe(200);
      const data = await res.json();
      const firstNames = data.items.map((p: any) => p.firstName.toLowerCase());
      const sortedFirstNames = [...firstNames].sort().reverse();
      expect(firstNames).toEqual(sortedFirstNames);
    });

    it('should include age in response', async () => {
      const res = await request('GET', '/api/patients');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items[0].age).toBeDefined();
      expect(typeof data.items[0].age).toBe('number');
    });

    it('should include hasAlerts flag', async () => {
      const res = await request('GET', '/api/patients');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items[0].hasAlerts).toBeDefined();
    });
  });

  // ===================
  // Search Patients Tests
  // ===================
  describe('Search Patients - GET /api/patients/search', () => {
    it('should search patients by name', async () => {
      const res = await request('GET', '/api/patients/search?query=Sarah');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(data.count).toBeDefined();
      expect(data.items.length).toBeGreaterThan(0);
    });

    it('should search patients by patient number', async () => {
      const res = await request('GET', '/api/patients/search?query=P-2024-0001');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.items[0].patientNumber).toBe('P-2024-0001');
    });

    it('should respect limit parameter', async () => {
      const res = await request('GET', '/api/patients/search?query=a&limit=2');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeLessThanOrEqual(2);
    });

    it('should require query parameter', async () => {
      const res = await request('GET', '/api/patients/search');

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Get Single Patient Tests
  // ===================
  describe('Get Patient - GET /api/patients/:id', () => {
    it('should return single patient by ID', async () => {
      // Get a patient ID from the store
      const patients = Array.from(getPatientStore().values());
      const patientId = patients[0].id;

      const res = await request('GET', `/api/patients/${patientId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.patient).toBeDefined();
      expect(data.patient.id).toBe(patientId);
      expect(data.patient.firstName).toBeDefined();
      expect(data.patient.lastName).toBeDefined();
      expect(data.patient.age).toBeDefined();
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/patients/${fakeId}`);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid UUID', async () => {
      const res = await request('GET', '/api/patients/invalid-id');

      expect(res.status).toBe(400);
    });

    it('should not return deleted patient', async () => {
      // Get a patient and soft delete them
      const patients = Array.from(getPatientStore().values());
      const patient = patients[0];
      patient.deletedAt = new Date();
      getPatientStore().set(patient.id, patient);

      const res = await request('GET', `/api/patients/${patient.id}`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Create Patient Tests
  // ===================
  describe('Create Patient - POST /api/patients', () => {
    it('should create patient with valid data', async () => {
      const res = await request('POST', '/api/patients', validPatientData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.patient).toBeDefined();
      expect(data.patient.id).toBeDefined();
      expect(data.patient.patientNumber).toMatch(/^P-\d{4}-\d{4}$/);
      expect(data.patient.firstName).toBe(validPatientData.firstName);
      expect(data.patient.lastName).toBe(validPatientData.lastName);
      expect(data.patient.email).toBe(validPatientData.email.toLowerCase());
      expect(data.patient.status).toBe('active');
      expect(data.patient.balance).toBe(0);
      expect(data.message).toBe('Patient created successfully');
    });

    it('should create patient with minimal required data', async () => {
      const minimalData = {
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: '1985-01-01',
        phone: '(555) 888-1111',
      };

      const res = await request('POST', '/api/patients', minimalData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.patient.firstName).toBe('Jane');
      expect(data.patient.email).toBeUndefined();
    });

    it('should reject invalid data - missing required fields', async () => {
      const invalidData = {
        firstName: 'John',
        // missing lastName, dateOfBirth, phone
      };

      const res = await request('POST', '/api/patients', invalidData);

      expect(res.status).toBe(400);
      // The 400 status code itself indicates validation failure
      // The response body structure may vary based on error handler
    });

    it('should reject invalid date of birth', async () => {
      const invalidData = {
        ...validPatientData,
        dateOfBirth: 'not-a-date',
      };

      const res = await request('POST', '/api/patients', invalidData);

      expect(res.status).toBe(400);
    });

    it('should reject invalid email format', async () => {
      const invalidData = {
        ...validPatientData,
        email: 'not-an-email',
      };

      const res = await request('POST', '/api/patients', invalidData);

      expect(res.status).toBe(400);
    });

    it('should reject duplicate email - 409 Conflict', async () => {
      // First create a patient
      await request('POST', '/api/patients', validPatientData);

      // Try to create another with same email
      const duplicateData = {
        ...validPatientData,
        firstName: 'Different',
        phone: '(555) 777-8888',
      };

      const res = await request('POST', '/api/patients', duplicateData);

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error).toBe('CONFLICT');
      expect(data.message).toContain('email');
    });

    it('should reject duplicate phone number - 409 Conflict', async () => {
      // First create a patient
      await request('POST', '/api/patients', validPatientData);

      // Try to create another with same phone (different format)
      const duplicateData = {
        firstName: 'Different',
        lastName: 'Person',
        dateOfBirth: '1980-01-01',
        phone: '555-999-1234', // Same number, different format
        email: 'different@example.com',
      };

      const res = await request('POST', '/api/patients', duplicateData);

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.message).toContain('phone');
    });

    it('should create patient with allergies', async () => {
      const dataWithAllergies = {
        ...validPatientData,
        email: 'allergies@example.com',
        phone: '(555) 666-7777',
        allergies: [
          {
            allergen: 'Penicillin',
            reaction: 'Hives',
            severity: 'high',
          },
        ],
      };

      const res = await request('POST', '/api/patients', dataWithAllergies);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.patient.allergies).toBeDefined();
      expect(data.patient.allergies.length).toBe(1);
      expect(data.patient.allergies[0].id).toBeDefined(); // Should have auto-generated ID
    });

    it('should create patient with communication preferences', async () => {
      const dataWithPrefs = {
        ...validPatientData,
        email: 'prefs@example.com',
        phone: '(555) 555-5555',
        communicationPreferences: {
          preferredMethod: 'email',
          appointmentReminders: true,
          marketingEmails: false,
          smsNotifications: true,
          emailNotifications: true,
          language: 'en',
        },
      };

      const res = await request('POST', '/api/patients', dataWithPrefs);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.patient.communicationPreferences.preferredMethod).toBe('email');
    });
  });

  // ===================
  // Update Patient Tests
  // ===================
  describe('Update Patient - PUT /api/patients/:id', () => {
    it('should update patient with valid data', async () => {
      const patients = Array.from(getPatientStore().values());
      const patientId = patients[0].id;

      const updateData = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        importantNotes: 'Updated notes for testing',
      };

      const res = await request('PUT', `/api/patients/${patientId}`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.patient.firstName).toBe('UpdatedFirst');
      expect(data.patient.lastName).toBe('UpdatedLast');
      expect(data.patient.importantNotes).toBe('Updated notes for testing');
      expect(data.message).toBe('Patient updated successfully');
    });

    it('should partially update patient (only provided fields)', async () => {
      const patients = Array.from(getPatientStore().values());
      const patient = patients[0];
      const originalEmail = patient.email;

      const updateData = {
        firstName: 'OnlyFirstName',
      };

      const res = await request('PUT', `/api/patients/${patient.id}`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.patient.firstName).toBe('OnlyFirstName');
      expect(data.patient.email).toBe(originalEmail); // Should be unchanged
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('PUT', `/api/patients/${fakeId}`, { firstName: 'Test' });

      expect(res.status).toBe(404);
    });

    it('should reject duplicate email on update', async () => {
      const patients = Array.from(getPatientStore().values());
      const patient1 = patients[0];
      const patient2 = patients[1];

      // Try to update patient1 with patient2's email
      const res = await request('PUT', `/api/patients/${patient1.id}`, {
        email: patient2.email,
      });

      expect(res.status).toBe(409);
    });

    it('should allow updating to same email (own email)', async () => {
      const patients = Array.from(getPatientStore().values());
      const patient = patients[0];

      const res = await request('PUT', `/api/patients/${patient.id}`, {
        email: patient.email,
        firstName: 'UpdatedName',
      });

      expect(res.status).toBe(200);
    });

    it('should update allergies', async () => {
      const patients = Array.from(getPatientStore().values());
      const patientId = patients[0].id;

      const updateData = {
        allergies: [
          {
            allergen: 'New Allergy',
            reaction: 'Swelling',
            severity: 'critical',
          },
        ],
      };

      const res = await request('PUT', `/api/patients/${patientId}`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.patient.allergies.length).toBe(1);
      expect(data.patient.allergies[0].allergen).toBe('New Allergy');
    });

    it('should update tags', async () => {
      const patients = Array.from(getPatientStore().values());
      const patientId = patients[0].id;

      const updateData = {
        tags: ['new-tag', 'another-tag'],
      };

      const res = await request('PUT', `/api/patients/${patientId}`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.patient.tags).toEqual(['new-tag', 'another-tag']);
    });
  });

  // ===================
  // Delete Patient Tests
  // ===================
  describe('Delete Patient - DELETE /api/patients/:id', () => {
    it('should soft delete patient', async () => {
      const patients = Array.from(getPatientStore().values());
      const patientId = patients[0].id;

      const res = await request('DELETE', `/api/patients/${patientId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Patient deleted successfully');

      // Verify patient is soft deleted
      const deletedPatient = getPatientStore().get(patientId);
      expect(deletedPatient?.deletedAt).toBeDefined();
      expect(deletedPatient?.status).toBe('inactive');
    });

    it('should not be able to get deleted patient', async () => {
      const patients = Array.from(getPatientStore().values());
      const patientId = patients[0].id;

      // Delete the patient
      await request('DELETE', `/api/patients/${patientId}`);

      // Try to get the deleted patient
      const res = await request('GET', `/api/patients/${patientId}`);

      expect(res.status).toBe(404);
    });

    it('should not list deleted patients', async () => {
      const patients = Array.from(getPatientStore().values());
      const patientId = patients[0].id;
      const originalCount = patients.filter(p => !p.deletedAt).length;

      // Delete the patient
      await request('DELETE', `/api/patients/${patientId}`);

      // List patients
      const res = await request('GET', '/api/patients');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.total).toBe(originalCount - 1);
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('DELETE', `/api/patients/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 when trying to delete already deleted patient', async () => {
      const patients = Array.from(getPatientStore().values());
      const patientId = patients[0].id;

      // Delete once
      await request('DELETE', `/api/patients/${patientId}`);

      // Try to delete again
      const res = await request('DELETE', `/api/patients/${patientId}`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Patient Appointments Tests
  // ===================
  describe('Patient Appointments - GET /api/patients/:id/appointments', () => {
    it('should return patient appointments', async () => {
      // Get Sarah Johnson (first patient) who has appointments
      const patients = Array.from(getPatientStore().values());
      const sarah = patients.find(p => p.firstName === 'Sarah' && p.lastName === 'Johnson');

      if (!sarah) {
        throw new Error('Test data not set up correctly');
      }

      const res = await request('GET', `/api/patients/${sarah.id}/appointments`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();
    });

    it('should return appointments with full details', async () => {
      const patients = Array.from(getPatientStore().values());
      const sarah = patients.find(p => p.firstName === 'Sarah');

      if (!sarah) {
        throw new Error('Test data not set up correctly');
      }

      const res = await request('GET', `/api/patients/${sarah.id}/appointments`);

      expect(res.status).toBe(200);
      const data = await res.json();

      if (data.items.length > 0) {
        const apt = data.items[0];
        expect(apt.id).toBeDefined();
        expect(apt.serviceName).toBeDefined();
        expect(apt.practitionerName).toBeDefined();
        expect(apt.startTime).toBeDefined();
        expect(apt.endTime).toBeDefined();
        expect(apt.status).toBeDefined();
      }
    });

    it('should return empty array for patient with no appointments', async () => {
      // Create a new patient with no appointments
      const createRes = await request('POST', '/api/patients', {
        firstName: 'No',
        lastName: 'Appointments',
        dateOfBirth: '2000-01-01',
        phone: '(555) 111-2222',
      });
      const { patient } = await createRes.json();

      const res = await request('GET', `/api/patients/${patient.id}/appointments`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
      expect(data.total).toBe(0);
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/patients/${fakeId}/appointments`);

      expect(res.status).toBe(404);
    });

    it('should sort appointments by date (newest first)', async () => {
      const patients = Array.from(getPatientStore().values());
      const sarah = patients.find(p => p.firstName === 'Sarah');

      if (!sarah) {
        throw new Error('Test data not set up correctly');
      }

      const res = await request('GET', `/api/patients/${sarah.id}/appointments`);

      expect(res.status).toBe(200);
      const data = await res.json();

      if (data.items.length > 1) {
        const dates = data.items.map((apt: any) => new Date(apt.startTime).getTime());
        const sortedDates = [...dates].sort((a, b) => b - a);
        expect(dates).toEqual(sortedDates);
      }
    });
  });

  // ===================
  // Patient Notes Tests
  // ===================
  describe('Patient Notes - GET /api/patients/:id/notes', () => {
    it('should return patient notes', async () => {
      const patients = Array.from(getPatientStore().values());
      const sarah = patients.find(p => p.firstName === 'Sarah');

      if (!sarah) {
        throw new Error('Test data not set up correctly');
      }

      const res = await request('GET', `/api/patients/${sarah.id}/notes`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();
    });

    it('should return notes with full details', async () => {
      const patients = Array.from(getPatientStore().values());
      const sarah = patients.find(p => p.firstName === 'Sarah');

      if (!sarah) {
        throw new Error('Test data not set up correctly');
      }

      const res = await request('GET', `/api/patients/${sarah.id}/notes`);

      expect(res.status).toBe(200);
      const data = await res.json();

      if (data.items.length > 0) {
        const note = data.items[0];
        expect(note.id).toBeDefined();
        expect(note.content).toBeDefined();
        expect(note.authorId).toBeDefined();
        expect(note.authorName).toBeDefined();
        expect(note.createdAt).toBeDefined();
        expect(note.isImportant).toBeDefined();
      }
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/patients/${fakeId}/notes`);

      expect(res.status).toBe(404);
    });
  });

  describe('Add Patient Note - POST /api/patients/:id/notes', () => {
    it('should add note to patient', async () => {
      const patients = Array.from(getPatientStore().values());
      const patientId = patients[0].id;

      const noteData = {
        content: 'This is a test note for the patient.',
        isImportant: false,
      };

      const res = await request('POST', `/api/patients/${patientId}/notes`, noteData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.note).toBeDefined();
      expect(data.note.id).toBeDefined();
      expect(data.note.content).toBe(noteData.content);
      expect(data.note.isImportant).toBe(false);
      expect(data.note.authorId).toBe(mockUserId);
      expect(data.message).toBe('Note added successfully');
    });

    it('should add important note', async () => {
      const patients = Array.from(getPatientStore().values());
      const patientId = patients[0].id;

      const noteData = {
        content: 'IMPORTANT: Patient has severe allergy!',
        isImportant: true,
      };

      const res = await request('POST', `/api/patients/${patientId}/notes`, noteData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.note.isImportant).toBe(true);
    });

    it('should add note with appointment reference', async () => {
      const patients = Array.from(getPatientStore().values());
      const patientId = patients[0].id;
      const appointmentId = crypto.randomUUID();

      const noteData = {
        content: 'Note related to appointment',
        isImportant: false,
        appointmentId,
      };

      const res = await request('POST', `/api/patients/${patientId}/notes`, noteData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.note.appointmentId).toBe(appointmentId);
    });

    it('should require content', async () => {
      const patients = Array.from(getPatientStore().values());
      const patientId = patients[0].id;

      const res = await request('POST', `/api/patients/${patientId}/notes`, {
        isImportant: false,
      });

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent patient', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('POST', `/api/patients/${fakeId}/notes`, {
        content: 'Test note',
        isImportant: false,
      });

      expect(res.status).toBe(404);
    });

    it('should persist note and be retrievable', async () => {
      const patients = Array.from(getPatientStore().values());
      const patientId = patients[0].id;

      // Get initial note count
      const initialRes = await request('GET', `/api/patients/${patientId}/notes`);
      const initialData = await initialRes.json();
      const initialCount = initialData.total;

      // Add a note
      await request('POST', `/api/patients/${patientId}/notes`, {
        content: 'Persisted note',
        isImportant: true,
      });

      // Get notes again
      const res = await request('GET', `/api/patients/${patientId}/notes`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.total).toBe(initialCount + 1);
      expect(data.items.some((n: any) => n.content === 'Persisted note')).toBe(true);
    });
  });

  // ===================
  // Edge Cases & Error Handling
  // ===================
  describe('Edge Cases', () => {
    it('should handle empty string search gracefully', async () => {
      const res = await request('GET', '/api/patients?query=');

      expect(res.status).toBe(200);
    });

    it('should handle special characters in search', async () => {
      const res = await request('GET', '/api/patients?query=O\'Brien');

      expect(res.status).toBe(200);
    });

    it('should handle very long first/last names', async () => {
      const longName = 'A'.repeat(100);
      const res = await request('POST', '/api/patients', {
        firstName: longName,
        lastName: longName,
        dateOfBirth: '1990-01-01',
        phone: '(555) 333-4444',
      });

      expect(res.status).toBe(201);
    });

    it('should reject names that are too long', async () => {
      const tooLongName = 'A'.repeat(101);
      const res = await request('POST', '/api/patients', {
        firstName: tooLongName,
        lastName: 'Normal',
        dateOfBirth: '1990-01-01',
        phone: '(555) 333-5555',
      });

      expect(res.status).toBe(400);
    });

    it('should handle pagination edge case - page beyond results', async () => {
      const res = await request('GET', '/api/patients?page=1000');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
      expect(data.hasMore).toBe(false);
    });

    it('should reject invalid pagination values', async () => {
      const res = await request('GET', '/api/patients?page=0');

      expect(res.status).toBe(400);
    });

    it('should reject limit over 100', async () => {
      const res = await request('GET', '/api/patients?limit=101');

      expect(res.status).toBe(400);
    });
  });
});
