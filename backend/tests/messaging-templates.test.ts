/**
 * Messaging Templates API Tests
 *
 * Comprehensive tests for:
 * - List templates with category filter
 * - Get single template
 * - Create custom template
 * - Update template
 * - Delete custom template
 * - Render template with variables
 * - Get template categories
 * - System vs custom templates
 * - Variable extraction and rendering
 * - Protection of system templates
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import templates, { templatesStore, StoredTemplate } from '../src/routes/messaging-templates';
import { sessionStore } from '../src/middleware/auth';
import { errorHandler } from '../src/middleware/error';

// Create test app with error handler
const app = new Hono();
app.route('/api/templates', templates);
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

// Mock admin user session
function createMockAdminSession(): string {
  const token = `admin-token-${Date.now()}-${Math.random()}`;
  const sessionId = `session-${Date.now()}-${Math.random()}`;

  sessionStore.set(sessionId, {
    id: sessionId,
    token,
    userId: 'admin-user-1',
    email: 'admin@test.com',
    role: 'admin',
    permissions: ['template:create', 'template:read', 'template:update', 'template:delete'],
    locationIds: ['loc-1'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    lastActivityAt: new Date(),
  });

  return token;
}

// Mock owner user session
function createMockOwnerSession(): string {
  const token = `owner-token-${Date.now()}-${Math.random()}`;
  const sessionId = `session-${Date.now()}-${Math.random()}`;

  sessionStore.set(sessionId, {
    id: sessionId,
    token,
    userId: 'owner-user-1',
    email: 'owner@test.com',
    role: 'owner',
    permissions: ['template:create', 'template:read', 'template:update', 'template:delete'],
    locationIds: ['loc-1', 'loc-2'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    lastActivityAt: new Date(),
  });

  return token;
}

// Mock manager user session
function createMockManagerSession(): string {
  const token = `manager-token-${Date.now()}-${Math.random()}`;
  const sessionId = `session-${Date.now()}-${Math.random()}`;

  sessionStore.set(sessionId, {
    id: sessionId,
    token,
    userId: 'manager-user-1',
    email: 'manager@test.com',
    role: 'manager',
    permissions: ['template:create', 'template:read', 'template:update'],
    locationIds: ['loc-1'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    lastActivityAt: new Date(),
  });

  return token;
}

// Mock staff user session (no template permissions)
function createMockStaffSession(): string {
  const token = `staff-token-${Date.now()}-${Math.random()}`;
  const sessionId = `session-${Date.now()}-${Math.random()}`;

  sessionStore.set(sessionId, {
    id: sessionId,
    token,
    userId: 'staff-user-1',
    email: 'staff@test.com',
    role: 'staff',
    permissions: ['appointment:read'],
    locationIds: ['loc-1'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    lastActivityAt: new Date(),
  });

  return token;
}

// Count templates by type
function countSystemTemplates(): number {
  return Array.from(templatesStore.values()).filter(t => t.isSystem).length;
}

function countCustomTemplates(): number {
  return Array.from(templatesStore.values()).filter(t => !t.isSystem).length;
}

describe('Messaging Templates API', () => {
  beforeEach(() => {
    sessionStore.clear();
    // Note: templatesStore is reinitialized with system templates on module load
    // We only need to remove custom templates
    Array.from(templatesStore.entries()).forEach(([id, template]) => {
      if (!template.isSystem) {
        templatesStore.delete(id);
      }
    });
  });

  // ===================
  // GET /api/templates/categories Tests (2 tests)
  // ===================
  describe('GET /api/templates/categories', () => {
    it('should return all template categories (public, no auth)', async () => {
      const res = await request('GET', '/api/templates/categories');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(data.total).toBeDefined();
      expect(data.items.length).toBe(9);
      expect(data.total).toBe(9);
    });

    it('should include category counts', async () => {
      const res = await request('GET', '/api/templates/categories');

      expect(res.status).toBe(200);

      const data = await res.json();

      // Check structure of each category
      data.items.forEach((category: any) => {
        expect(category.id).toBeDefined();
        expect(category.name).toBeDefined();
        expect(category.count).toBeDefined();
        expect(typeof category.count).toBe('number');
      });

      // Verify expected categories exist
      const categoryIds = data.items.map((c: any) => c.id);
      expect(categoryIds).toContain('appointment');
      expect(categoryIds).toContain('treatment');
      expect(categoryIds).toContain('followup');
      expect(categoryIds).toContain('marketing');
      expect(categoryIds).toContain('financial');
      expect(categoryIds).toContain('membership');
      expect(categoryIds).toContain('review');
      expect(categoryIds).toContain('emergency');
      expect(categoryIds).toContain('administrative');
    });
  });

  // ===================
  // GET /api/templates Tests (7 tests)
  // ===================
  describe('GET /api/templates', () => {
    it('should list all templates (public, no auth)', async () => {
      const res = await request('GET', '/api/templates');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();
      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);
      expect(data.hasMore).toBeDefined();
      expect(typeof data.hasMore).toBe('boolean');
    });

    it('should include system templates in list', async () => {
      const res = await request('GET', '/api/templates');

      expect(res.status).toBe(200);

      const data = await res.json();
      const systemTemplates = data.items.filter((t: any) => t.isSystem);
      expect(systemTemplates.length).toBeGreaterThan(0);

      // Verify system template structure
      const firstSystem = systemTemplates[0];
      expect(firstSystem.id).toBeDefined();
      expect(firstSystem.name).toBeDefined();
      expect(firstSystem.category).toBeDefined();
      expect(firstSystem.channel).toBeDefined();
      expect(firstSystem.body).toBeDefined();
      expect(firstSystem.isSystem).toBe(true);
    });

    it('should filter by category', async () => {
      const res = await request('GET', '/api/templates?category=appointment');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
      data.items.forEach((t: any) => {
        expect(t.category).toBe('appointment');
      });
    });

    it('should filter by multiple categories', async () => {
      const res = await request('GET', '/api/templates?categories=appointment&categories=treatment');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
      data.items.forEach((t: any) => {
        expect(['appointment', 'treatment']).toContain(t.category);
      });
    });

    it('should filter by channel', async () => {
      const res = await request('GET', '/api/templates?channel=sms');

      expect(res.status).toBe(200);

      const data = await res.json();
      data.items.forEach((t: any) => {
        expect(['sms', 'both']).toContain(t.channel);
      });
    });

    it('should filter by tags', async () => {
      const res = await request('GET', '/api/templates?tags=reminder&tags=appointment');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
      data.items.forEach((t: any) => {
        expect(t.tags.some((tag: string) => ['reminder', 'appointment'].includes(tag))).toBe(true);
      });
    });

    it('should paginate results', async () => {
      const res = await request('GET', '/api/templates?page=1&limit=5');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items.length).toBeLessThanOrEqual(5);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(5);

      // Check if there are more results
      if (data.total > 5) {
        expect(data.hasMore).toBe(true);
      }
    });
  });

  // ===================
  // GET /api/templates/:templateId Tests (3 tests)
  // ===================
  describe('GET /api/templates/:templateId', () => {
    it('should return a single template by ID (public, no auth)', async () => {
      // Get a system template ID
      const systemTemplate = Array.from(templatesStore.values()).find(t => t.isSystem);
      expect(systemTemplate).toBeDefined();

      const res = await request('GET', `/api/templates/${systemTemplate!.id}`);

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.id).toBe(systemTemplate!.id);
      expect(data.name).toBe(systemTemplate!.name);
      expect(data.category).toBe(systemTemplate!.category);
      expect(data.body).toBe(systemTemplate!.body);
      expect(data.variables).toBeDefined();
      expect(Array.isArray(data.variables)).toBe(true);
    });

    it('should return 404 for non-existent template', async () => {
      const res = await request('GET', '/api/templates/non-existent-id');

      expect(res.status).toBe(404);

      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });

    it('should include extracted variables in response', async () => {
      // Find a template with variables
      const templateWithVars = Array.from(templatesStore.values()).find(
        t => t.variables.length > 0
      );
      expect(templateWithVars).toBeDefined();

      const res = await request('GET', `/api/templates/${templateWithVars!.id}`);

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.variables).toBeDefined();
      expect(data.variables.length).toBeGreaterThan(0);
      expect(Array.isArray(data.variables)).toBe(true);
    });
  });

  // ===================
  // POST /api/templates Tests (7 tests)
  // ===================
  describe('POST /api/templates', () => {
    it('should create a new custom template (admin)', async () => {
      const adminToken = createMockAdminSession();

      const newTemplate = {
        name: 'Custom Appointment Reminder',
        category: 'appointment' as const,
        channel: 'sms' as const,
        body: 'Hi {{patientName}}, reminder for your {{service}} appointment tomorrow at {{time}}.',
        tags: ['custom', 'reminder'],
        isActive: true,
      };

      const res = await request('POST', '/api/templates', newTemplate, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.id).toBeDefined();
      expect(data.name).toBe(newTemplate.name);
      expect(data.category).toBe(newTemplate.category);
      expect(data.body).toBe(newTemplate.body);
      expect(data.isSystem).toBe(false);
      expect(data.variables).toEqual(['patientName', 'service', 'time']);
    });

    it('should create template with email channel and subject', async () => {
      const adminToken = createMockAdminSession();

      const newTemplate = {
        name: 'Email Confirmation',
        category: 'appointment' as const,
        channel: 'email' as const,
        subject: 'Appointment Confirmation - {{patientName}}',
        body: 'Dear {{patientName}}, your appointment is confirmed for {{date}} at {{time}}.',
        tags: ['email'],
      };

      const res = await request('POST', '/api/templates', newTemplate, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.subject).toBe(newTemplate.subject);
      expect(data.channel).toBe('email');
      expect(data.variables).toContain('patientName');
      expect(data.variables).toContain('date');
      expect(data.variables).toContain('time');
    });

    it('should extract variables from both subject and body', async () => {
      const adminToken = createMockAdminSession();

      const newTemplate = {
        name: 'Test Variable Extraction',
        category: 'marketing' as const,
        channel: 'email' as const,
        subject: 'Special offer for {{patientName}}',
        body: 'Hi {{patientName}}, enjoy {{discount}}% off {{service}}!',
      };

      const res = await request('POST', '/api/templates', newTemplate, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.variables).toContain('patientName');
      expect(data.variables).toContain('discount');
      expect(data.variables).toContain('service');
      expect(data.variables.length).toBe(3);
    });

    it('should create template with compliance settings', async () => {
      const adminToken = createMockAdminSession();

      const newTemplate = {
        name: 'HIPAA Compliant Template',
        category: 'treatment' as const,
        channel: 'sms' as const,
        body: 'Your treatment is scheduled. Reply STOP to opt out.',
        compliance: {
          hipaaCompliant: true,
          includesOptOut: true,
          maxLength: 160,
        },
      };

      const res = await request('POST', '/api/templates', newTemplate, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.compliance.hipaaCompliant).toBe(true);
      expect(data.compliance.includesOptOut).toBe(true);
      expect(data.compliance.maxLength).toBe(160);
    });

    it('should allow owner to create template', async () => {
      const ownerToken = createMockOwnerSession();

      const newTemplate = {
        name: 'Owner Template',
        category: 'marketing' as const,
        channel: 'sms' as const,
        body: 'Special promotion for VIP patients!',
      };

      const res = await request('POST', '/api/templates', newTemplate, {
        Authorization: `Bearer ${ownerToken}`,
      });

      expect(res.status).toBe(201);
    });

    it('should allow manager to create template', async () => {
      const managerToken = createMockManagerSession();

      const newTemplate = {
        name: 'Manager Template',
        category: 'administrative' as const,
        channel: 'sms' as const,
        body: 'Administrative message for patients.',
      };

      const res = await request('POST', '/api/templates', newTemplate, {
        Authorization: `Bearer ${managerToken}`,
      });

      expect(res.status).toBe(201);
    });

    it('should reject creation for non-admin/owner/manager users', async () => {
      const staffToken = createMockStaffSession();

      const newTemplate = {
        name: 'Unauthorized Template',
        category: 'appointment' as const,
        channel: 'sms' as const,
        body: 'Test message',
      };

      const res = await request('POST', '/api/templates', newTemplate, {
        Authorization: `Bearer ${staffToken}`,
      });

      expect(res.status).toBe(403);
    });
  });

  // ===================
  // PUT /api/templates/:templateId Tests (6 tests)
  // ===================
  describe('PUT /api/templates/:templateId', () => {
    it('should update a custom template', async () => {
      const adminToken = createMockAdminSession();

      // Create a custom template first
      const createRes = await request(
        'POST',
        '/api/templates',
        {
          name: 'Original Name',
          category: 'appointment' as const,
          channel: 'sms' as const,
          body: 'Original body with {{var1}}',
        },
        { Authorization: `Bearer ${adminToken}` }
      );
      const created = await createRes.json();

      // Update it
      const updates = {
        name: 'Updated Name',
        body: 'Updated body with {{var1}} and {{var2}}',
      };

      const res = await request('PUT', `/api/templates/${created.id}`, updates, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.name).toBe('Updated Name');
      expect(data.body).toBe(updates.body);
      expect(data.variables).toContain('var1');
      expect(data.variables).toContain('var2');
    });

    it('should re-extract variables when body is updated', async () => {
      const adminToken = createMockAdminSession();

      // Create template
      const createRes = await request(
        'POST',
        '/api/templates',
        {
          name: 'Test Template',
          category: 'marketing' as const,
          channel: 'sms' as const,
          body: 'Hello {{name}}',
        },
        { Authorization: `Bearer ${adminToken}` }
      );
      const created = await createRes.json();
      expect(created.variables).toEqual(['name']);

      // Update with new variables
      const res = await request(
        'PUT',
        `/api/templates/${created.id}`,
        { body: 'Hello {{firstName}} {{lastName}}, you have {{count}} credits.' },
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.variables).toContain('firstName');
      expect(data.variables).toContain('lastName');
      expect(data.variables).toContain('count');
      expect(data.variables.length).toBe(3);
    });

    it('should prevent modifying system templates', async () => {
      const adminToken = createMockAdminSession();

      // Get a system template
      const systemTemplate = Array.from(templatesStore.values()).find(t => t.isSystem);
      expect(systemTemplate).toBeDefined();

      const res = await request(
        'PUT',
        `/api/templates/${systemTemplate!.id}`,
        { name: 'Hacked Name' },
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBe('BAD_REQUEST');
      expect(data.message).toContain('system templates');
    });

    it('should return 404 for non-existent template', async () => {
      const adminToken = createMockAdminSession();

      const res = await request(
        'PUT',
        '/api/templates/non-existent-id',
        { name: 'Updated' },
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(404);
    });

    it('should require authentication', async () => {
      const res = await request('PUT', '/api/templates/some-id', { name: 'Test' });

      expect(res.status).toBe(401);
    });

    it('should reject update for non-admin/owner/manager users', async () => {
      const adminToken = createMockAdminSession();
      const staffToken = createMockStaffSession();

      // Create template as admin
      const createRes = await request(
        'POST',
        '/api/templates',
        {
          name: 'Test Template',
          category: 'appointment' as const,
          channel: 'sms' as const,
          body: 'Test body',
        },
        { Authorization: `Bearer ${adminToken}` }
      );
      const created = await createRes.json();

      // Try to update as staff
      const res = await request(
        'PUT',
        `/api/templates/${created.id}`,
        { name: 'Hacked' },
        { Authorization: `Bearer ${staffToken}` }
      );

      expect(res.status).toBe(403);
    });
  });

  // ===================
  // DELETE /api/templates/:templateId Tests (5 tests)
  // ===================
  describe('DELETE /api/templates/:templateId', () => {
    it('should delete a custom template', async () => {
      const adminToken = createMockAdminSession();

      // Create a custom template
      const createRes = await request(
        'POST',
        '/api/templates',
        {
          name: 'Template to Delete',
          category: 'marketing' as const,
          channel: 'sms' as const,
          body: 'This will be deleted',
        },
        { Authorization: `Bearer ${adminToken}` }
      );
      const created = await createRes.json();

      // Delete it
      const res = await request('DELETE', `/api/templates/${created.id}`, undefined, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.message).toBe('Template deleted');
      expect(data.id).toBe(created.id);

      // Verify it's gone
      expect(templatesStore.has(created.id)).toBe(false);
    });

    it('should prevent deleting system templates', async () => {
      const adminToken = createMockAdminSession();

      // Get a system template
      const systemTemplate = Array.from(templatesStore.values()).find(t => t.isSystem);
      expect(systemTemplate).toBeDefined();

      const initialCount = countSystemTemplates();

      const res = await request('DELETE', `/api/templates/${systemTemplate!.id}`, undefined, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBe('BAD_REQUEST');
      expect(data.message).toContain('system templates');

      // Verify system template still exists
      expect(countSystemTemplates()).toBe(initialCount);
    });

    it('should return 404 for non-existent template', async () => {
      const adminToken = createMockAdminSession();

      const res = await request('DELETE', '/api/templates/non-existent-id', undefined, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(404);
    });

    it('should require authentication', async () => {
      const res = await request('DELETE', '/api/templates/some-id');

      expect(res.status).toBe(401);
    });

    it('should require owner or admin role', async () => {
      const adminToken = createMockAdminSession();
      const managerToken = createMockManagerSession();

      // Create template as admin
      const createRes = await request(
        'POST',
        '/api/templates',
        {
          name: 'Test Template',
          category: 'appointment' as const,
          channel: 'sms' as const,
          body: 'Test body',
        },
        { Authorization: `Bearer ${adminToken}` }
      );
      const created = await createRes.json();

      // Try to delete as manager (should fail - only owner/admin can delete)
      const res = await request('DELETE', `/api/templates/${created.id}`, undefined, {
        Authorization: `Bearer ${managerToken}`,
      });

      expect(res.status).toBe(403);
    });
  });

  // ===================
  // POST /api/templates/render Tests (5 tests)
  // ===================
  describe('POST /api/templates/render', () => {
    it('should render template with variables', async () => {
      const adminToken = createMockAdminSession();

      // Find a template with variables
      const template = Array.from(templatesStore.values()).find(
        t => t.variables.includes('patientName') && t.variables.includes('time')
      );
      expect(template).toBeDefined();

      const res = await request(
        'POST',
        '/api/templates/render',
        {
          templateId: template!.id,
          variables: {
            patientName: 'John Doe',
            time: '2:00 PM',
            service: 'Botox',
            date: 'Tomorrow',
          },
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.templateId).toBe(template!.id);
      expect(data.body).toBeDefined();
      expect(data.body).toContain('John Doe');
      expect(data.body).not.toContain('{{patientName}}');
      expect(data.variables).toBeDefined();
      expect(data.usedVariables).toBeDefined();
    });

    it('should render email template with subject', async () => {
      const adminToken = createMockAdminSession();

      // Create an email template with subject
      const createRes = await request(
        'POST',
        '/api/templates',
        {
          name: 'Email Template',
          category: 'appointment' as const,
          channel: 'email' as const,
          subject: 'Appointment for {{patientName}}',
          body: 'Dear {{patientName}}, your appointment is at {{time}}.',
        },
        { Authorization: `Bearer ${adminToken}` }
      );
      const created = await createRes.json();

      const res = await request(
        'POST',
        '/api/templates/render',
        {
          templateId: created.id,
          variables: {
            patientName: 'Jane Smith',
            time: '3:00 PM',
          },
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.subject).toBe('Appointment for Jane Smith');
      expect(data.body).toContain('Dear Jane Smith');
      expect(data.body).toContain('3:00 PM');
    });

    it('should reject rendering with missing required variables', async () => {
      const adminToken = createMockAdminSession();

      // Find a template with variables
      const template = Array.from(templatesStore.values()).find(
        t => t.variables.length > 0
      );
      expect(template).toBeDefined();

      const res = await request(
        'POST',
        '/api/templates/render',
        {
          templateId: template!.id,
          variables: {}, // Empty variables
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data.error).toBe('BAD_REQUEST');
      expect(data.message).toContain('Missing required variables');
    });

    it('should update usage statistics when rendering', async () => {
      const adminToken = createMockAdminSession();

      // Create a template
      const createRes = await request(
        'POST',
        '/api/templates',
        {
          name: 'Usage Test Template',
          category: 'appointment' as const,
          channel: 'sms' as const,
          body: 'Hi {{name}}',
        },
        { Authorization: `Bearer ${adminToken}` }
      );
      const created = await createRes.json();

      const initialUsageCount = created.usageCount || 0;

      // Render it
      await request(
        'POST',
        '/api/templates/render',
        {
          templateId: created.id,
          variables: { name: 'Test' },
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      // Check usage count increased
      const template = templatesStore.get(created.id);
      expect(template).toBeDefined();
      expect(template!.usageCount).toBe(initialUsageCount + 1);
      expect(template!.lastUsedAt).toBeDefined();
    });

    it('should return 404 for non-existent template', async () => {
      const adminToken = createMockAdminSession();

      const res = await request(
        'POST',
        '/api/templates/render',
        {
          templateId: 'non-existent-id',
          variables: {},
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // System vs Custom Templates Tests (3 tests)
  // ===================
  describe('System vs Custom Templates', () => {
    it('should have system templates pre-loaded', async () => {
      const systemCount = countSystemTemplates();
      expect(systemCount).toBeGreaterThan(30); // Should have 37 system templates
    });

    it('should mark system templates as isSystem=true', async () => {
      const systemTemplates = Array.from(templatesStore.values()).filter(t => t.isSystem);

      systemTemplates.forEach(template => {
        expect(template.isSystem).toBe(true);
        expect(template.id).toMatch(/^sys_\d{3}$/);
        expect(template.createdBy).toBeUndefined();
      });
    });

    it('should mark custom templates as isSystem=false', async () => {
      const adminToken = createMockAdminSession();

      const createRes = await request(
        'POST',
        '/api/templates',
        {
          name: 'Custom Template',
          category: 'marketing' as const,
          channel: 'sms' as const,
          body: 'Custom message',
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      const created = await createRes.json();
      expect(created.isSystem).toBe(false);
      expect(created.createdBy).toBe('admin-user-1');
    });
  });

  // ===================
  // Variable Extraction Tests (4 tests)
  // ===================
  describe('Variable Extraction', () => {
    it('should extract variables from template body', async () => {
      const adminToken = createMockAdminSession();

      const createRes = await request(
        'POST',
        '/api/templates',
        {
          name: 'Variable Test',
          category: 'appointment' as const,
          channel: 'sms' as const,
          body: 'Hi {{patientName}}, your {{service}} is at {{time}} on {{date}}.',
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      const created = await createRes.json();
      expect(created.variables).toContain('patientName');
      expect(created.variables).toContain('service');
      expect(created.variables).toContain('time');
      expect(created.variables).toContain('date');
      expect(created.variables.length).toBe(4);
    });

    it('should handle templates with no variables', async () => {
      const adminToken = createMockAdminSession();

      const createRes = await request(
        'POST',
        '/api/templates',
        {
          name: 'No Variables',
          category: 'marketing' as const,
          channel: 'sms' as const,
          body: 'This is a static message with no variables.',
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      const created = await createRes.json();
      expect(created.variables).toEqual([]);
    });

    it('should handle duplicate variable names', async () => {
      const adminToken = createMockAdminSession();

      const createRes = await request(
        'POST',
        '/api/templates',
        {
          name: 'Duplicate Variables',
          category: 'appointment' as const,
          channel: 'sms' as const,
          body: 'Hi {{name}}, {{name}} your appointment is confirmed. Thank you {{name}}!',
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      const created = await createRes.json();
      expect(created.variables).toEqual(['name']);
      expect(created.variables.length).toBe(1);
    });

    it('should extract variables from both subject and body', async () => {
      const adminToken = createMockAdminSession();

      const createRes = await request(
        'POST',
        '/api/templates',
        {
          name: 'Subject and Body Variables',
          category: 'marketing' as const,
          channel: 'email' as const,
          subject: 'Special offer for {{patientName}} - {{discount}}% off',
          body: 'Hi {{patientName}}, enjoy {{discount}}% off your next {{service}} treatment!',
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      const created = await createRes.json();
      expect(created.variables).toContain('patientName');
      expect(created.variables).toContain('discount');
      expect(created.variables).toContain('service');
      expect(created.variables.length).toBe(3);
    });
  });

  // ===================
  // Validation Tests (3 tests)
  // ===================
  describe('Validation', () => {
    it('should reject template without required fields', async () => {
      const adminToken = createMockAdminSession();

      const res = await request(
        'POST',
        '/api/templates',
        {
          name: 'Missing Fields',
          // Missing: category, channel, body
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(400);
    });

    it('should reject invalid category', async () => {
      const adminToken = createMockAdminSession();

      const res = await request(
        'POST',
        '/api/templates',
        {
          name: 'Invalid Category',
          category: 'invalid-category',
          channel: 'sms',
          body: 'Test',
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(400);
    });

    it('should reject invalid channel', async () => {
      const adminToken = createMockAdminSession();

      const res = await request(
        'POST',
        '/api/templates',
        {
          name: 'Invalid Channel',
          category: 'appointment',
          channel: 'invalid-channel',
          body: 'Test',
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(400);
    });
  });
});
