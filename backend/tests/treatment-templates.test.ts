/**
 * Treatment Templates & Charting Settings API Tests
 *
 * Tests for:
 * - Treatment templates CRUD
 * - Provider playbooks CRUD
 * - DOT phrases
 * - Charting settings
 * - Zone configurations
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import treatmentTemplates, {
  clearStores as clearTemplateStores,
  resetStores as resetTemplateStores,
  getTemplatesStore,
  getPlaybooksStore,
  addMockTemplate,
  addMockPlaybook,
  FACE_ZONES,
} from '../src/routes/treatment-templates';
import chartingSettings, {
  clearStores as clearChartingStores,
  resetStores as resetChartingStores,
  getChartingSettingsStore,
} from '../src/routes/charting-settings';
import { sessionStore } from '../src/middleware/auth';
import { errorHandler } from '../src/middleware/error';

// Create test app with error handler
const app = new Hono();
app.route('/api/treatment-templates', treatmentTemplates);
app.route('/api/charting-settings', chartingSettings);
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

// Mock provider session
function createMockProviderSession(userId = 'provider-001'): string {
  const token = `provider-token-${Date.now()}-${Math.random()}`;
  const sessionId = `session-${Date.now()}-${Math.random()}`;

  sessionStore.set(sessionId, {
    id: sessionId,
    token,
    userId,
    email: 'provider@test.com',
    role: 'provider',
    permissions: ['treatment:create', 'treatment:read', 'treatment:update', 'treatment:delete'],
    locationIds: ['loc-1'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    lastActivityAt: new Date(),
  });

  return token;
}

// Mock admin session
function createMockAdminSession(): string {
  const token = `admin-token-${Date.now()}-${Math.random()}`;
  const sessionId = `session-${Date.now()}-${Math.random()}`;

  sessionStore.set(sessionId, {
    id: sessionId,
    token,
    userId: 'admin-001',
    email: 'admin@test.com',
    role: 'admin',
    permissions: ['*'],
    locationIds: ['loc-1', 'loc-2'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    lastActivityAt: new Date(),
  });

  return token;
}

describe('Treatment Templates API', () => {
  beforeEach(() => {
    sessionStore.clear();
    resetTemplateStores();
    resetChartingStores();
  });

  // ===================
  // List Templates Tests (3 tests)
  // ===================
  describe('GET /api/treatment-templates', () => {
    it('should list all accessible templates (global + own)', async () => {
      clearTemplateStores(); // Initialize mock data
      const token = createMockProviderSession('provider-001');

      const res = await request('GET', '/api/treatment-templates', undefined, {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(data.total).toBeGreaterThan(0);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);
    });

    it('should filter templates by productType', async () => {
      clearTemplateStores();
      const token = createMockProviderSession();

      const res = await request('GET', '/api/treatment-templates?productType=neurotoxin', undefined, {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      data.items.forEach((t: any) => {
        expect(t.productType).toBe('neurotoxin');
      });
    });

    it('should filter templates by isGlobal', async () => {
      clearTemplateStores();
      const token = createMockProviderSession();

      const res = await request('GET', '/api/treatment-templates?isGlobal=true', undefined, {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      data.items.forEach((t: any) => {
        expect(t.isGlobal).toBe(true);
      });
    });
  });

  // ===================
  // Create Template Tests (4 tests)
  // ===================
  describe('POST /api/treatment-templates', () => {
    it('should create a new global treatment template', async () => {
      resetTemplateStores();
      const token = createMockAdminSession();

      const newTemplate = {
        name: 'Test Template',
        description: 'A test template for neurotoxin',
        productType: 'neurotoxin',
        estimatedDuration: 30,
        isGlobal: true,
        defaultZones: [
          { zoneId: 'forehead', defaultUnits: 20, technique: 'serial' },
        ],
        defaultProducts: [
          { productId: '550e8400-e29b-41d4-a716-446655440000', productName: 'Botox', defaultUnits: 20 },
        ],
      };

      const res = await request('POST', '/api/treatment-templates', newTemplate, {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.template).toBeDefined();
      expect(data.template.id).toBeDefined();
      expect(data.template.name).toBe('Test Template');
      expect(data.template.isGlobal).toBe(true);
      expect(data.template.defaultZones).toHaveLength(1);
      expect(data.message).toBe('Treatment template created successfully');
    });

    it('should create a provider-specific template', async () => {
      resetTemplateStores();
      const token = createMockProviderSession('provider-002');

      const newTemplate = {
        name: 'My Personal Template',
        productType: 'filler',
        estimatedDuration: 45,
        isGlobal: false,
        aftercareInstructions: 'Apply ice as needed',
      };

      const res = await request('POST', '/api/treatment-templates', newTemplate, {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.template.isGlobal).toBe(false);
      expect(data.template.providerId).toBe('provider-002');
    });

    it('should create template with SOAP defaults', async () => {
      resetTemplateStores();
      const token = createMockProviderSession();

      const newTemplate = {
        name: 'Template with SOAP',
        productType: 'neurotoxin',
        estimatedDuration: 30,
        soapDefaults: {
          subjective: {
            chiefComplaint: 'Fine lines and wrinkles',
          },
          plan: {
            aftercareInstructions: 'Avoid strenuous activity for 24 hours',
          },
        },
      };

      const res = await request('POST', '/api/treatment-templates', newTemplate, {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.template.soapDefaults).toBeDefined();
      expect(data.template.soapDefaults.subjective.chiefComplaint).toBe('Fine lines and wrinkles');
    });

    it('should reject template without required fields', async () => {
      resetTemplateStores();
      const token = createMockProviderSession();

      const invalidTemplate = {
        description: 'Missing name and productType',
      };

      const res = await request('POST', '/api/treatment-templates', invalidTemplate, {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Update Template Tests (3 tests)
  // ===================
  describe('PUT /api/treatment-templates/:id', () => {
    it('should update a template', async () => {
      resetTemplateStores();
      const token = createMockProviderSession('provider-001');

      // Create a template first
      const templateId = addMockTemplate({
        name: 'Original Name',
        productType: 'neurotoxin',
        defaultZones: [],
        defaultProducts: [],
        estimatedDuration: 30,
        isGlobal: false,
        providerId: 'provider-001',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'provider-001',
      });

      const updates = {
        name: 'Updated Name',
        estimatedDuration: 45,
      };

      const res = await request('PUT', `/api/treatment-templates/${templateId}`, updates, {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.template.name).toBe('Updated Name');
      expect(data.template.estimatedDuration).toBe(45);
    });

    it('should return 404 for non-existent template', async () => {
      resetTemplateStores();
      const token = createMockProviderSession();

      const res = await request(
        'PUT',
        '/api/treatment-templates/550e8400-e29b-41d4-a716-446655440000',
        { name: 'Updated' },
        { Authorization: `Bearer ${token}` }
      );

      expect(res.status).toBe(404);
    });

    it('should reject update from non-owner', async () => {
      resetTemplateStores();
      const token = createMockProviderSession('provider-002');

      // Create template owned by provider-001
      const templateId = addMockTemplate({
        name: 'Provider 1 Template',
        productType: 'neurotoxin',
        defaultZones: [],
        defaultProducts: [],
        estimatedDuration: 30,
        isGlobal: false,
        providerId: 'provider-001',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'provider-001',
      });

      const res = await request(
        'PUT',
        `/api/treatment-templates/${templateId}`,
        { name: 'Hacked Name' },
        { Authorization: `Bearer ${token}` }
      );

      expect(res.status).toBe(403);
    });
  });

  // ===================
  // Delete Template Tests (2 tests)
  // ===================
  describe('DELETE /api/treatment-templates/:id', () => {
    it('should delete a template', async () => {
      resetTemplateStores();
      const token = createMockProviderSession('provider-001');

      const templateId = addMockTemplate({
        name: 'Template to Delete',
        productType: 'filler',
        defaultZones: [],
        defaultProducts: [],
        estimatedDuration: 30,
        isGlobal: false,
        providerId: 'provider-001',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'provider-001',
      });

      const res = await request('DELETE', `/api/treatment-templates/${templateId}`, undefined, {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);

      // Verify it's gone
      expect(getTemplatesStore().has(templateId)).toBe(false);
    });

    it('should return 404 for non-existent template', async () => {
      resetTemplateStores();
      const token = createMockProviderSession();

      const res = await request(
        'DELETE',
        '/api/treatment-templates/550e8400-e29b-41d4-a716-446655440000',
        undefined,
        { Authorization: `Bearer ${token}` }
      );

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Playbooks CRUD Tests (6 tests)
  // ===================
  describe('Playbooks API', () => {
    it('should list provider playbooks', async () => {
      clearTemplateStores();
      const token = createMockProviderSession('provider-001');

      const res = await request('GET', '/api/treatment-templates/playbooks', undefined, {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items).toBeDefined();
    });

    it('should create a new playbook', async () => {
      resetTemplateStores();
      const token = createMockProviderSession('provider-002');

      const newPlaybook = {
        providerId: 'provider-002',
        name: 'My Treatment Playbook',
        description: 'Personal protocols and phrases',
        protocols: [
          {
            name: 'Gentle Forehead',
            treatmentArea: 'Forehead',
            productType: 'neurotoxin',
            zones: [{ zoneId: 'forehead', defaultUnits: 10 }],
          },
        ],
        dotPhrases: [
          {
            trigger: '.myaftercare',
            expansion: 'Patient received standard aftercare instructions.',
            category: 'aftercare',
          },
        ],
      };

      const res = await request('POST', '/api/treatment-templates/playbooks', newPlaybook, {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.playbook).toBeDefined();
      expect(data.playbook.protocols).toHaveLength(1);
      expect(data.playbook.dotPhrases).toHaveLength(1);
      expect(data.playbook.dotPhrases[0].trigger).toBe('.myaftercare');
    });

    it('should get a single playbook', async () => {
      resetTemplateStores();
      const token = createMockProviderSession('provider-003');

      // Create playbook first
      const playbookId = addMockPlaybook({
        providerId: 'provider-003',
        name: 'Test Playbook',
        protocols: [],
        dotPhrases: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request('GET', `/api/treatment-templates/playbooks/${playbookId}`, undefined, {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.playbook.id).toBe(playbookId);
      expect(data.playbook.name).toBe('Test Playbook');
    });

    it('should update a playbook', async () => {
      resetTemplateStores();
      const token = createMockProviderSession('provider-004');

      const playbookId = addMockPlaybook({
        providerId: 'provider-004',
        name: 'Original Playbook',
        protocols: [],
        dotPhrases: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const updates = {
        name: 'Updated Playbook',
        dotPhrases: [
          { trigger: '.newphrase', expansion: 'New expansion text' },
        ],
      };

      const res = await request('PUT', `/api/treatment-templates/playbooks/${playbookId}`, updates, {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.playbook.name).toBe('Updated Playbook');
      expect(data.playbook.dotPhrases).toHaveLength(1);
    });

    it('should delete a playbook', async () => {
      resetTemplateStores();
      const token = createMockProviderSession('provider-005');

      const playbookId = addMockPlaybook({
        providerId: 'provider-005',
        name: 'Playbook to Delete',
        protocols: [],
        dotPhrases: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request('DELETE', `/api/treatment-templates/playbooks/${playbookId}`, undefined, {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('should prevent duplicate playbooks for same provider', async () => {
      resetTemplateStores();
      const token = createMockProviderSession('provider-006');

      // Create first playbook
      addMockPlaybook({
        providerId: 'provider-006',
        name: 'First Playbook',
        protocols: [],
        dotPhrases: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Try to create second playbook for same provider
      const secondPlaybook = {
        providerId: 'provider-006',
        name: 'Second Playbook',
      };

      const res = await request('POST', '/api/treatment-templates/playbooks', secondPlaybook, {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(409);
    });
  });

  // ===================
  // DOT Phrases Tests (3 tests)
  // ===================
  describe('DOT Phrases', () => {
    it('should validate DOT phrase trigger starts with period', async () => {
      resetTemplateStores();
      const token = createMockProviderSession('provider-007');

      const newPlaybook = {
        providerId: 'provider-007',
        name: 'DOT Phrase Playbook',
        dotPhrases: [
          { trigger: 'noperiod', expansion: 'This should fail' },
        ],
      };

      const res = await request('POST', '/api/treatment-templates/playbooks', newPlaybook, {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(400);
    });

    it('should accept valid DOT phrases', async () => {
      resetTemplateStores();
      const token = createMockProviderSession('provider-008');

      const newPlaybook = {
        providerId: 'provider-008',
        name: 'Valid DOT Playbook',
        dotPhrases: [
          { trigger: '.botox', expansion: 'Standard botox treatment notes' },
          { trigger: '.filler-lips', expansion: 'Lip filler treatment completed' },
        ],
      };

      const res = await request('POST', '/api/treatment-templates/playbooks', newPlaybook, {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.playbook.dotPhrases).toHaveLength(2);
    });

    it('should include category in DOT phrases', async () => {
      resetTemplateStores();
      const token = createMockProviderSession('provider-009');

      const newPlaybook = {
        providerId: 'provider-009',
        name: 'Categorized DOT Playbook',
        dotPhrases: [
          { trigger: '.aftercare-toxin', expansion: 'Aftercare instructions...', category: 'aftercare' },
          { trigger: '.exam-normal', expansion: 'Normal exam findings', category: 'exam' },
        ],
      };

      const res = await request('POST', '/api/treatment-templates/playbooks', newPlaybook, {
        Authorization: `Bearer ${token}`,
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.playbook.dotPhrases[0].category).toBe('aftercare');
      expect(data.playbook.dotPhrases[1].category).toBe('exam');
    });
  });
});

// ===================
// Charting Settings Tests (5 tests)
// ===================
describe('Charting Settings API', () => {
  beforeEach(() => {
    sessionStore.clear();
    resetChartingStores();
  });

  it('should get charting settings (creates default if none)', async () => {
    const token = createMockProviderSession('provider-010');

    const res = await request('GET', '/api/charting-settings', undefined, {
      Authorization: `Bearer ${token}`,
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.settings).toBeDefined();
    expect(data.settings.defaultView).toBeDefined();
    expect(data.settings.zoneConfigs).toBeDefined();
    expect(data.settings.quickActions).toBeDefined();
  });

  it('should get settings for specific provider', async () => {
    clearChartingStores(); // Initialize with mock data
    const token = createMockProviderSession('provider-001');

    const res = await request('GET', '/api/charting-settings?providerId=provider-001', undefined, {
      Authorization: `Bearer ${token}`,
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.settings.providerId).toBe('provider-001');
    expect(data.settings.defaultView).toBe('face-3d');
  });

  it('should update charting settings', async () => {
    resetChartingStores();
    const token = createMockProviderSession('provider-011');

    const updates = {
      defaultView: 'face-3d',
      showInjectionHistory: false,
      autoSaveInterval: 60,
    };

    const res = await request('PUT', '/api/charting-settings', updates, {
      Authorization: `Bearer ${token}`,
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.settings.defaultView).toBe('face-3d');
    expect(data.settings.showInjectionHistory).toBe(false);
    expect(data.settings.autoSaveInterval).toBe(60);
  });

  it('should update quick actions', async () => {
    resetChartingStores();
    const token = createMockProviderSession('provider-012');

    const updates = {
      quickActions: [
        { label: 'Custom Action', action: 'custom-action' },
        { label: 'Botox 15u', action: 'add-product', productId: '550e8400-e29b-41d4-a716-446655440000', units: 15 },
      ],
    };

    const res = await request('PUT', '/api/charting-settings', updates, {
      Authorization: `Bearer ${token}`,
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.settings.quickActions).toHaveLength(2);
    expect(data.settings.quickActions[0].label).toBe('Custom Action');
    expect(data.settings.quickActions[1].units).toBe(15);
  });

  it('should reset settings to defaults', async () => {
    resetChartingStores();
    const token = createMockProviderSession('provider-013');

    // First, modify settings
    await request('PUT', '/api/charting-settings', { autoSaveInterval: 120 }, {
      Authorization: `Bearer ${token}`,
    });

    // Then reset
    const res = await request('POST', '/api/charting-settings/reset', undefined, {
      Authorization: `Bearer ${token}`,
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.settings.autoSaveInterval).toBe(30); // Default value
    expect(data.message).toBe('Charting settings reset to defaults');
  });
});

// ===================
// Zone Configurations Tests (3 tests)
// ===================
describe('Zone Configurations API', () => {
  beforeEach(() => {
    sessionStore.clear();
    resetChartingStores();
  });

  it('should get zone configurations', async () => {
    const token = createMockProviderSession('provider-014');

    const res = await request('GET', '/api/charting-settings/zones', undefined, {
      Authorization: `Bearer ${token}`,
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.zoneConfigs).toBeDefined();
    expect(data.total).toBe(25); // 25 face zones
    expect(data.byRegion).toBeDefined();
    expect(data.byRegion.upper).toBeDefined();
    expect(data.byRegion.mid).toBeDefined();
    expect(data.byRegion.lower).toBeDefined();
  });

  it('should update zone configurations', async () => {
    resetChartingStores();
    const token = createMockProviderSession('provider-015');

    // Get current configs first
    const getRes = await request('GET', '/api/charting-settings/zones', undefined, {
      Authorization: `Bearer ${token}`,
    });
    const currentData = await getRes.json();

    // Disable a zone
    const updatedConfigs = currentData.zoneConfigs.map((z: any) =>
      z.zoneId === 'neck' ? { ...z, isEnabled: false } : z
    );

    const res = await request('PUT', '/api/charting-settings/zones', { zoneConfigs: updatedConfigs }, {
      Authorization: `Bearer ${token}`,
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    const neckZone = data.zoneConfigs.find((z: any) => z.zoneId === 'neck');
    expect(neckZone.isEnabled).toBe(false);
    expect(data.enabledCount).toBe(24); // 25 - 1 disabled
  });

  it('should include all 25 face zones in default config', async () => {
    const token = createMockProviderSession('provider-016');

    const res = await request('GET', '/api/charting-settings/zones', undefined, {
      Authorization: `Bearer ${token}`,
    });

    const data = await res.json();

    // Verify all FACE_ZONES are present
    const configIds = data.zoneConfigs.map((z: any) => z.zoneId);
    FACE_ZONES.forEach(zone => {
      expect(configIds).toContain(zone.id);
    });
  });
});

// ===================
// Edge Cases Tests (4 tests)
// ===================
describe('Edge Cases', () => {
  beforeEach(() => {
    sessionStore.clear();
    resetTemplateStores();
    resetChartingStores();
  });

  it('should require authentication for all endpoints', async () => {
    // Templates
    let res = await request('GET', '/api/treatment-templates');
    expect(res.status).toBe(401);

    res = await request('POST', '/api/treatment-templates', { name: 'Test', productType: 'neurotoxin', estimatedDuration: 30 });
    expect(res.status).toBe(401);

    // Playbooks
    res = await request('GET', '/api/treatment-templates/playbooks');
    expect(res.status).toBe(401);

    // Charting Settings
    res = await request('GET', '/api/charting-settings');
    expect(res.status).toBe(401);
  });

  it('should validate zone IDs in templates', async () => {
    resetTemplateStores();
    const token = createMockProviderSession();

    const invalidTemplate = {
      name: 'Invalid Zone Template',
      productType: 'neurotoxin',
      estimatedDuration: 30,
      defaultZones: [
        { zoneId: 'invalid-zone-id', defaultUnits: 10 },
      ],
    };

    const res = await request('POST', '/api/treatment-templates', invalidTemplate, {
      Authorization: `Bearer ${token}`,
    });

    expect(res.status).toBe(400);
  });

  it('should handle pagination correctly', async () => {
    clearTemplateStores();
    const token = createMockProviderSession();

    const res = await request('GET', '/api/treatment-templates?page=1&limit=2', undefined, {
      Authorization: `Bearer ${token}`,
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.items.length).toBeLessThanOrEqual(2);
    expect(data.page).toBe(1);
    expect(data.limit).toBe(2);
    expect(typeof data.hasMore).toBe('boolean');
  });

  it('should export FACE_ZONES constant with correct structure', () => {
    expect(FACE_ZONES).toBeDefined();
    expect(FACE_ZONES.length).toBe(25);

    // Check structure of first zone
    const firstZone = FACE_ZONES[0];
    expect(firstZone.id).toBeDefined();
    expect(firstZone.name).toBeDefined();
    expect(firstZone.region).toBeDefined();

    // Verify regions
    const regions = new Set(FACE_ZONES.map(z => z.region));
    expect(regions.has('upper')).toBe(true);
    expect(regions.has('mid')).toBe(true);
    expect(regions.has('lower')).toBe(true);
  });
});

// ===================
// Get Single Template Test
// ===================
describe('GET /api/treatment-templates/:id', () => {
  beforeEach(() => {
    sessionStore.clear();
    resetTemplateStores();
  });

  it('should get a single template by ID', async () => {
    resetTemplateStores();
    const token = createMockProviderSession('provider-020');

    const templateId = addMockTemplate({
      name: 'Test Single Template',
      productType: 'filler',
      defaultZones: [{ zoneId: 'cheek-left', defaultVolume: 1.0 }],
      defaultProducts: [],
      estimatedDuration: 45,
      isGlobal: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system',
    });

    const res = await request('GET', `/api/treatment-templates/${templateId}`, undefined, {
      Authorization: `Bearer ${token}`,
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.template.id).toBe(templateId);
    expect(data.template.name).toBe('Test Single Template');
    expect(data.template.defaultZones).toHaveLength(1);
  });

  it('should return 404 for non-existent template', async () => {
    resetTemplateStores();
    const token = createMockProviderSession();

    const res = await request('GET', '/api/treatment-templates/550e8400-e29b-41d4-a716-446655440000', undefined, {
      Authorization: `Bearer ${token}`,
    });

    expect(res.status).toBe(404);
  });
});

// ===================
// Face Zones Reference Test
// ===================
describe('GET /api/treatment-templates/zones', () => {
  it('should return all face zones reference', async () => {
    const token = createMockProviderSession();

    const res = await request('GET', '/api/treatment-templates/zones', undefined, {
      Authorization: `Bearer ${token}`,
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.zones).toBeDefined();
    expect(data.zones.length).toBe(25);
    expect(data.total).toBe(25);
  });
});
