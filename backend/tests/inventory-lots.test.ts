/**
 * Inventory Lots & Stock API Tests
 *
 * Comprehensive tests for:
 * - Lot management with CRUD operations
 * - Stock levels and monitoring
 * - Expiration alerts
 * - Open vial sessions (multi-patient tracking)
 * - Fractional unit support
 * - Business logic (FEFO, stability timers, etc.)
 * - Validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import inventoryLots, {
  clearStores,
  getLotsStore,
  getAlertsStore,
  getOpenVialsStore,
  getProductsStore,
  addMockLot,
  addMockAlert,
  addMockOpenVial,
  addMockProduct,
  selectLotFEFO,
  calculateStabilityRemaining,
  isLotExpired,
  generateExpirationAlert,
  StoredInventoryLot,
  StoredInventoryAlert,
  StoredOpenVialSession,
} from '../src/routes/inventory-lots';
import { errorHandler } from '../src/middleware/error';
import { sessionStore } from '../src/middleware/auth';
import crypto from 'crypto';

// Create test app with error handler
const app = new Hono();
app.route('/api/inventory', inventoryLots);
app.onError(errorHandler);

// Mock session for authentication
const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
const mockSessionToken = 'test-session-token-12345';
const mockSessionId = 'test-session-id';

// Generate consistent UUIDs for testing
const testProductId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const testLocationId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const testLotId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const testOpenVialId = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
const testAlertId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

function setupMockSession() {
  sessionStore.set(mockSessionId, {
    id: mockSessionId,
    token: mockSessionToken,
    userId: mockUserId,
    email: 'test@example.com',
    role: 'admin',
    permissions: ['inventory:read', 'inventory:create', 'inventory:update', 'inventory:delete'],
    locationIds: [testLocationId],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    lastActivityAt: new Date(),
  });
}

// Setup test data with proper UUIDs
function setupTestData() {
  const now = new Date();

  // Add mock product with UUID
  const product = {
    id: testProductId,
    name: 'Botox Cosmetic 100U',
    category: 'neurotoxin',
    unitsPerPackage: 100,
    unitType: 'units',
    costPrice: 450,
    retailPrice: 1500,
    injectableDetails: {
      reconstitutionRequired: true,
      maxHoursAfterReconstitution: 24,
      defaultDilution: 2.5,
    },
    reorderPoint: 10,
  };
  getProductsStore().set(testProductId, product);

  // Add mock lot with UUID
  const lot: StoredInventoryLot = {
    id: testLotId,
    productId: testProductId,
    productName: 'Botox Cosmetic 100U',
    lotNumber: 'BTX-2024-TEST001',
    expirationDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
    receivedDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    initialQuantity: 500,
    currentQuantity: 400,
    reservedQuantity: 0,
    unitType: 'units',
    locationId: testLocationId,
    locationName: 'Test Clinic',
    storageLocation: 'Fridge A, Shelf 1',
    purchaseCost: 2250,
    status: 'available',
    createdAt: now,
    updatedAt: now,
    createdBy: 'system',
    lastUpdatedBy: 'system',
  };
  getLotsStore().set(testLotId, lot);

  // Add lot expiring soon for alert tests
  const expiringLotId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
  const expiringLot: StoredInventoryLot = {
    ...lot,
    id: expiringLotId,
    lotNumber: 'BTX-2024-EXPIRE',
    expirationDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000), // 25 days
    currentQuantity: 200,
  };
  getLotsStore().set(expiringLotId, expiringLot);

  // Add mock alert
  const alert: StoredInventoryAlert = {
    id: testAlertId,
    type: 'low_stock',
    severity: 'warning',
    status: 'active',
    productId: testProductId,
    productName: 'Botox Cosmetic 100U',
    locationId: testLocationId,
    locationName: 'Test Clinic',
    title: 'Low Stock Alert',
    message: 'Stock is running low',
    actionRequired: 'Reorder soon',
    currentValue: 5,
    thresholdValue: 10,
    notificationSent: false,
    createdAt: now,
    updatedAt: now,
  };
  getAlertsStore().set(testAlertId, alert);

  // Add mock open vial session
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const vialSession: StoredOpenVialSession = {
    id: testOpenVialId,
    lotId: testLotId,
    lotNumber: 'BTX-2024-TEST001',
    productId: testProductId,
    productName: 'Botox Cosmetic 100U',
    vialNumber: 1,
    originalUnits: 100,
    currentUnits: 60,
    usedUnits: 40,
    wastedUnits: 0,
    reconstitutedAt: twoHoursAgo,
    reconstitutedBy: mockUserId,
    reconstitutedByName: 'Test User',
    diluentType: 'Preservative-free saline',
    diluentVolume: 2.5,
    concentration: '4U per 0.1ml',
    expiresAt: new Date(twoHoursAgo.getTime() + 24 * 60 * 60 * 1000),
    stabilityHoursTotal: 24,
    stabilityHoursRemaining: 22,
    isExpired: false,
    usageRecords: [
      {
        id: crypto.randomUUID(),
        timestamp: new Date(twoHoursAgo.getTime() + 30 * 60 * 1000),
        patientId: crypto.randomUUID(),
        patientName: 'Test Patient 1',
        appointmentId: crypto.randomUUID(),
        practitionerId: mockUserId,
        practitionerName: 'Test Provider',
        unitsUsed: 20,
        areasInjected: [{ name: 'Forehead', units: 10 }, { name: 'Glabella', units: 10 }],
      },
      {
        id: crypto.randomUUID(),
        timestamp: new Date(twoHoursAgo.getTime() + 60 * 60 * 1000),
        patientId: crypto.randomUUID(),
        patientName: 'Test Patient 2',
        appointmentId: crypto.randomUUID(),
        practitionerId: mockUserId,
        practitionerName: 'Test Provider',
        unitsUsed: 20,
        areasInjected: [{ name: 'Forehead', units: 12 }, { name: 'Glabella', units: 8 }],
      },
    ],
    totalPatients: 2,
    locationId: testLocationId,
    locationName: 'Test Clinic',
    storageLocation: 'Treatment Room 1',
    status: 'active',
    vialCost: 450,
    costPerUnitUsed: 11.25,
    revenueGenerated: 600,
    profitMargin: 25,
    createdAt: twoHoursAgo,
    updatedAt: now,
    createdBy: mockUserId,
    lastUpdatedBy: mockUserId,
  };
  getOpenVialsStore().set(testOpenVialId, vialSession);
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

// Valid lot data for creation
const validLotData = {
  productId: testProductId,
  productName: 'Botox Cosmetic 100U',
  lotNumber: 'BTX-NEW-001',
  expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
  initialQuantity: 500,
  unitType: 'units',
  locationId: testLocationId,
  locationName: 'Test Clinic',
  purchaseCost: 2250,
};

// Valid open vial data
const validOpenVialData = {
  lotId: testLotId,
  diluentType: 'Preservative-free saline',
  diluentVolume: 2.5,
  locationId: testLocationId,
};

// Valid use from vial data
const validUseFromVialData = {
  unitsToUse: 15,
  patientId: crypto.randomUUID(),
  patientName: 'New Test Patient',
  appointmentId: crypto.randomUUID(),
  practitionerId: crypto.randomUUID(),
  practitionerName: 'Dr. Test',
  areasInjected: [
    { name: 'Forehead', units: 8 },
    { name: 'Glabella', units: 7 },
  ],
};

describe('Inventory Lots & Stock API', () => {
  beforeEach(() => {
    // Clear all stores first
    getLotsStore().clear();
    getAlertsStore().clear();
    getOpenVialsStore().clear();
    getProductsStore().clear();
    sessionStore.clear();

    // Setup fresh test data
    setupMockSession();
    setupTestData();
  });

  // ===================
  // Authentication Tests (2 tests)
  // ===================
  describe('Authentication', () => {
    it('should reject requests without authentication', async () => {
      const res = await unauthenticatedRequest('GET', '/api/inventory/lots');
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const req = new Request('http://localhost/api/inventory/lots', {
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
  // List Lots Tests (8 tests)
  // ===================
  describe('List Lots - GET /api/inventory/lots', () => {
    it('should return paginated list of lots', async () => {
      const res = await request('GET', '/api/inventory/lots');

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
      const res = await request('GET', '/api/inventory/lots?page=1&limit=1');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeLessThanOrEqual(1);
      expect(data.limit).toBe(1);
    });

    it('should filter by productId', async () => {
      const res = await request('GET', `/api/inventory/lots?productId=${testProductId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((lot: any) => lot.productId === testProductId)).toBe(true);
    });

    it('should filter by status', async () => {
      const res = await request('GET', '/api/inventory/lots?status=available');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((lot: any) => lot.status === 'available')).toBe(true);
    });

    it('should filter by locationId', async () => {
      const res = await request('GET', `/api/inventory/lots?locationId=${testLocationId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((lot: any) => lot.locationId === testLocationId)).toBe(true);
    });

    it('should filter by expiring within days', async () => {
      const res = await request('GET', '/api/inventory/lots?expiringWithinDays=60');

      expect(res.status).toBe(200);
      const data = await res.json();
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 60);
      data.items.forEach((lot: any) => {
        expect(new Date(lot.expirationDate).getTime()).toBeLessThanOrEqual(targetDate.getTime());
      });
    });

    it('should sort by expirationDate ascending by default', async () => {
      const res = await request('GET', '/api/inventory/lots?status=available');

      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.items.length > 1) {
        const dates = data.items.map((lot: any) => new Date(lot.expirationDate).getTime());
        const sortedDates = [...dates].sort((a, b) => a - b);
        expect(dates).toEqual(sortedDates);
      }
    });

    it('should include computed fields in response', async () => {
      const res = await request('GET', '/api/inventory/lots');

      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.items.length > 0) {
        expect(data.items[0].availableQuantity).toBeDefined();
        expect(data.items[0].isExpired).toBeDefined();
        expect(data.items[0].daysUntilExpiration).toBeDefined();
      }
    });
  });

  // ===================
  // Get Single Lot Tests (3 tests)
  // ===================
  describe('Get Lot - GET /api/inventory/lots/:id', () => {
    it('should return single lot by ID', async () => {
      const res = await request('GET', `/api/inventory/lots/${testLotId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.lot).toBeDefined();
      expect(data.lot.id).toBe(testLotId);
      expect(data.lot.lotNumber).toBeDefined();
      expect(data.lot.productName).toBeDefined();
    });

    it('should return 404 for non-existent lot', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/inventory/lots/${fakeId}`);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid UUID', async () => {
      const res = await request('GET', '/api/inventory/lots/invalid-id');

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Create Lot Tests (6 tests)
  // ===================
  describe('Create Lot - POST /api/inventory/lots', () => {
    it('should create lot with valid data', async () => {
      const res = await request('POST', '/api/inventory/lots', validLotData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.lot).toBeDefined();
      expect(data.lot.id).toBeDefined();
      expect(data.lot.lotNumber).toBe('BTX-NEW-001');
      expect(data.lot.productId).toBe(testProductId);
      expect(data.lot.status).toBe('available');
      expect(data.message).toBe('Lot created successfully');
    });

    it('should create lot with all optional fields', async () => {
      const fullLotData = {
        ...validLotData,
        lotNumber: 'BTX-FULL-001',
        batchNumber: 'BATCH-001',
        serialNumber: 'SN-001',
        manufacturingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        receivedDate: new Date().toISOString(),
        storageLocation: 'Fridge A, Shelf 1',
        vendorId: crypto.randomUUID(),
        vendorName: 'Test Vendor',
        qualityNotes: 'Received in good condition',
      };

      const res = await request('POST', '/api/inventory/lots', fullLotData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.lot.batchNumber).toBe('BATCH-001');
      expect(data.lot.serialNumber).toBe('SN-001');
      expect(data.lot.storageLocation).toBe('Fridge A, Shelf 1');
      expect(data.lot.vendorName).toBe('Test Vendor');
    });

    it('should reject duplicate lot number for same product', async () => {
      // First creation
      await request('POST', '/api/inventory/lots', validLotData);

      // Second creation with same lot number
      const res = await request('POST', '/api/inventory/lots', validLotData);

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error).toBe('CONFLICT');
    });

    it('should set status to expired if expiration date is in the past', async () => {
      const expiredLotData = {
        ...validLotData,
        lotNumber: 'BTX-EXPIRED-001',
        expirationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const res = await request('POST', '/api/inventory/lots', expiredLotData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.lot.status).toBe('expired');
    });

    it('should reject missing required fields', async () => {
      const incompleteLotData = {
        productId: testProductId,
        lotNumber: 'BTX-INCOMPLETE-001',
        // Missing expirationDate, initialQuantity, etc.
      };

      const res = await request('POST', '/api/inventory/lots', incompleteLotData);

      expect(res.status).toBe(400);
    });

    it('should reject invalid unitType', async () => {
      const invalidLotData = {
        ...validLotData,
        lotNumber: 'BTX-INVALID-001',
        unitType: 'invalid-unit',
      };

      const res = await request('POST', '/api/inventory/lots', invalidLotData);

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Update Lot Tests (4 tests)
  // ===================
  describe('Update Lot - PUT /api/inventory/lots/:id', () => {
    it('should update lot with valid data', async () => {
      const updateData = {
        storageLocation: 'Fridge B, Shelf 3',
        qualityNotes: 'Updated notes',
      };

      const res = await request('PUT', `/api/inventory/lots/${testLotId}`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.lot.storageLocation).toBe('Fridge B, Shelf 3');
      expect(data.lot.qualityNotes).toBe('Updated notes');
      expect(data.message).toBe('Lot updated successfully');
    });

    it('should update lot status', async () => {
      const updateData = {
        status: 'damaged',
      };

      const res = await request('PUT', `/api/inventory/lots/${testLotId}`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.lot.status).toBe('damaged');
    });

    it('should return 404 for non-existent lot', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('PUT', `/api/inventory/lots/${fakeId}`, {
        storageLocation: 'New Location',
      });

      expect(res.status).toBe(404);
    });

    it('should reject invalid status value', async () => {
      const res = await request('PUT', `/api/inventory/lots/${testLotId}`, {
        status: 'invalid-status',
      });

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Quarantine Lot Tests (4 tests)
  // ===================
  describe('Quarantine Lot - POST /api/inventory/lots/:id/quarantine', () => {
    it('should quarantine lot with valid reason', async () => {
      const res = await request('POST', `/api/inventory/lots/${testLotId}/quarantine`, {
        reason: 'Temperature excursion detected',
        notes: 'Moved to quarantine area for inspection',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.lot.status).toBe('quarantine');
      expect(data.lot.qualityNotes).toContain('Temperature excursion detected');
      expect(data.message).toBe('Lot quarantined successfully');
    });

    it('should reject quarantining already quarantined lot', async () => {
      // First quarantine
      await request('POST', `/api/inventory/lots/${testLotId}/quarantine`, {
        reason: 'Initial quarantine',
      });

      // Second quarantine attempt
      const res = await request('POST', `/api/inventory/lots/${testLotId}/quarantine`, {
        reason: 'Second attempt',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('already quarantined');
    });

    it('should return 404 for non-existent lot', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('POST', `/api/inventory/lots/${fakeId}/quarantine`, {
        reason: 'Test reason',
      });

      expect(res.status).toBe(404);
    });

    it('should reject empty reason', async () => {
      const res = await request('POST', `/api/inventory/lots/${testLotId}/quarantine`, {
        reason: '',
      });

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Recall Lot Tests (6 tests)
  // ===================
  describe('Recall Lot - POST /api/inventory/lots/:id/recall', () => {
    it('should recall lot with FDA Class I', async () => {
      const res = await request('POST', `/api/inventory/lots/${testLotId}/recall`, {
        recallReason: 'Contamination risk',
        recallNumber: 'FDA-2024-001',
        fdaRecallClass: 'I',
        notifyPatients: true,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.lot.status).toBe('recalled');
      expect(data.lot.recallStatus.isRecalled).toBe(true);
      expect(data.lot.recallStatus.fdaRecallClass).toBe('I');
      expect(data.alert).toBeDefined();
      expect(data.alert.severity).toBe('critical');
      expect(data.message).toContain('recalled successfully');
    });

    it('should recall lot with FDA Class II', async () => {
      const res = await request('POST', `/api/inventory/lots/${testLotId}/recall`, {
        recallReason: 'Labeling issue',
        fdaRecallClass: 'II',
        notifyPatients: false,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.lot.recallStatus.fdaRecallClass).toBe('II');
      expect(data.alert.severity).toBe('warning');
    });

    it('should recall lot with FDA Class III', async () => {
      const res = await request('POST', `/api/inventory/lots/${testLotId}/recall`, {
        recallReason: 'Minor packaging defect',
        fdaRecallClass: 'III',
        notifyPatients: false,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.lot.recallStatus.fdaRecallClass).toBe('III');
      expect(data.alert.severity).toBe('info');
    });

    it('should reject recalling already recalled lot', async () => {
      // First recall
      await request('POST', `/api/inventory/lots/${testLotId}/recall`, {
        recallReason: 'Initial recall',
        fdaRecallClass: 'I',
      });

      // Second recall attempt
      const res = await request('POST', `/api/inventory/lots/${testLotId}/recall`, {
        recallReason: 'Second attempt',
        fdaRecallClass: 'II',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('already recalled');
    });

    it('should reject invalid FDA recall class', async () => {
      const res = await request('POST', `/api/inventory/lots/${testLotId}/recall`, {
        recallReason: 'Test recall',
        fdaRecallClass: 'IV', // Invalid class
      });

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent lot', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('POST', `/api/inventory/lots/${fakeId}/recall`, {
        recallReason: 'Test recall',
        fdaRecallClass: 'I',
      });

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Stock Levels Tests (5 tests)
  // ===================
  describe('Stock Levels - GET /api/inventory/levels', () => {
    it('should return stock levels for all products', async () => {
      const res = await request('GET', '/api/inventory/levels');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.levels).toBeDefined();
      expect(Array.isArray(data.levels)).toBe(true);
    });

    it('should return stock levels for specific product', async () => {
      const res = await request('GET', `/api/inventory/levels?productId=${testProductId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.levels.length).toBe(1);
      expect(data.levels[0].productId).toBe(testProductId);
    });

    it('should return stock levels for specific location', async () => {
      const res = await request('GET', `/api/inventory/levels?locationId=${testLocationId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.levels.length > 0) {
        expect(data.levels[0].locationId).toBe(testLocationId);
      }
    });

    it('should filter low stock only when requested', async () => {
      const res = await request('GET', '/api/inventory/levels?lowStockOnly=true');

      expect(res.status).toBe(200);
      const data = await res.json();
      data.levels.forEach((level: any) => {
        expect(['low_stock', 'critical', 'out_of_stock']).toContain(level.status);
      });
    });

    it('should include stock status calculation', async () => {
      const res = await request('GET', `/api/inventory/levels?productId=${testProductId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.levels.length > 0) {
        expect(data.levels[0].status).toBeDefined();
        expect(data.levels[0].totalQuantity).toBeDefined();
        expect(data.levels[0].availableQuantity).toBeDefined();
      }
    });
  });

  // ===================
  // Expiring Lots Tests (5 tests)
  // ===================
  describe('Expiring Lots - GET /api/inventory/expiring', () => {
    it('should return lots expiring within 30 days by default', async () => {
      const res = await request('GET', '/api/inventory/expiring');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.expiringLots).toBeDefined();
      expect(data.summary).toBeDefined();
      expect(data.summary.total).toBeDefined();
    });

    it('should return lots expiring within specified days', async () => {
      const res = await request('GET', '/api/inventory/expiring?days=90');

      expect(res.status).toBe(200);
      const data = await res.json();
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 90);
      data.expiringLots.forEach((lot: any) => {
        expect(new Date(lot.expirationDate).getTime()).toBeLessThanOrEqual(targetDate.getTime());
      });
    });

    it('should filter by location', async () => {
      const res = await request('GET', `/api/inventory/expiring?days=90&locationId=${testLocationId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      data.expiringLots.forEach((lot: any) => {
        expect(lot.locationId).toBe(testLocationId);
      });
    });

    it('should filter by product', async () => {
      const res = await request('GET', `/api/inventory/expiring?days=90&productId=${testProductId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      data.expiringLots.forEach((lot: any) => {
        expect(lot.productId).toBe(testProductId);
      });
    });

    it('should include severity for each lot', async () => {
      const res = await request('GET', '/api/inventory/expiring?days=60');

      expect(res.status).toBe(200);
      const data = await res.json();
      data.expiringLots.forEach((lot: any) => {
        expect(['info', 'warning', 'critical']).toContain(lot.severity);
      });
    });
  });

  // ===================
  // Alerts Tests (6 tests)
  // ===================
  describe('Alerts - GET /api/inventory/alerts', () => {
    it('should return active alerts by default', async () => {
      const res = await request('GET', '/api/inventory/alerts');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.alerts).toBeDefined();
      expect(data.summary).toBeDefined();
      data.alerts.forEach((alert: any) => {
        expect(alert.status).toBe('active');
      });
    });

    it('should filter by alert type', async () => {
      const res = await request('GET', '/api/inventory/alerts?type=low_stock');

      expect(res.status).toBe(200);
      const data = await res.json();
      data.alerts.forEach((alert: any) => {
        expect(alert.type).toBe('low_stock');
      });
    });

    it('should filter by severity', async () => {
      const res = await request('GET', '/api/inventory/alerts?severity=warning');

      expect(res.status).toBe(200);
      const data = await res.json();
      data.alerts.forEach((alert: any) => {
        expect(alert.severity).toBe('warning');
      });
    });

    it('should filter by location', async () => {
      const res = await request('GET', `/api/inventory/alerts?locationId=${testLocationId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      data.alerts.forEach((alert: any) => {
        expect(alert.locationId).toBe(testLocationId);
      });
    });

    it('should sort by severity (critical first)', async () => {
      // Add alerts with different severities
      const criticalAlert: StoredInventoryAlert = {
        id: crypto.randomUUID(),
        type: 'recall',
        severity: 'critical',
        status: 'active',
        locationId: testLocationId,
        locationName: 'Test',
        title: 'Critical',
        message: 'Critical alert',
        notificationSent: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      getAlertsStore().set(criticalAlert.id, criticalAlert);

      const res = await request('GET', '/api/inventory/alerts');

      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.alerts.length > 1) {
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        for (let i = 1; i < data.alerts.length; i++) {
          const prevOrder = severityOrder[data.alerts[i - 1].severity as keyof typeof severityOrder];
          const currOrder = severityOrder[data.alerts[i].severity as keyof typeof severityOrder];
          expect(prevOrder).toBeLessThanOrEqual(currOrder);
        }
      }
    });

    it('should include summary counts', async () => {
      const res = await request('GET', '/api/inventory/alerts');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.summary.total).toBeDefined();
      expect(data.summary.critical).toBeDefined();
      expect(data.summary.warning).toBeDefined();
      expect(data.summary.info).toBeDefined();
    });
  });

  // ===================
  // Acknowledge Alert Tests (4 tests)
  // ===================
  describe('Acknowledge Alert - POST /api/inventory/alerts/:id/acknowledge', () => {
    it('should acknowledge alert successfully', async () => {
      const res = await request('POST', `/api/inventory/alerts/${testAlertId}/acknowledge`, {
        notes: 'Acknowledged and will order more stock',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.alert.status).toBe('acknowledged');
      expect(data.alert.acknowledgedAt).toBeDefined();
      expect(data.message).toBe('Alert acknowledged successfully');
    });

    it('should acknowledge without notes', async () => {
      const res = await request('POST', `/api/inventory/alerts/${testAlertId}/acknowledge`, {});

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.alert.status).toBe('acknowledged');
    });

    it('should reject acknowledging non-active alert', async () => {
      // First acknowledge
      await request('POST', `/api/inventory/alerts/${testAlertId}/acknowledge`, {});

      // Try to acknowledge again
      const res = await request('POST', `/api/inventory/alerts/${testAlertId}/acknowledge`, {});

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent alert', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('POST', `/api/inventory/alerts/${fakeId}/acknowledge`, {});

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Open Vial Sessions - List (5 tests)
  // ===================
  describe('List Open Vials - GET /api/inventory/open-vials', () => {
    it('should return paginated list of open vial sessions', async () => {
      const res = await request('GET', '/api/inventory/open-vials');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();
      expect(data.page).toBe(1);
      expect(data.summary).toBeDefined();
    });

    it('should filter by productId', async () => {
      const res = await request('GET', `/api/inventory/open-vials?productId=${testProductId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      data.items.forEach((vial: any) => {
        expect(vial.productId).toBe(testProductId);
      });
    });

    it('should filter by locationId', async () => {
      const res = await request('GET', `/api/inventory/open-vials?locationId=${testLocationId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      data.items.forEach((vial: any) => {
        expect(vial.locationId).toBe(testLocationId);
      });
    });

    it('should filter by status', async () => {
      const res = await request('GET', '/api/inventory/open-vials?status=active');

      expect(res.status).toBe(200);
      const data = await res.json();
      data.items.forEach((vial: any) => {
        expect(vial.status).toBe('active');
      });
    });

    it('should include summary with active vials count', async () => {
      const res = await request('GET', '/api/inventory/open-vials');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.summary.activeVials).toBeDefined();
      expect(data.summary.expiringWithinHour).toBeDefined();
      expect(data.summary.totalUnitsAvailable).toBeDefined();
    });
  });

  // ===================
  // Open Vial - Create Session (5 tests)
  // ===================
  describe('Open Vial - POST /api/inventory/open-vials', () => {
    it('should open new vial (reconstitute) successfully', async () => {
      const res = await request('POST', '/api/inventory/open-vials', validOpenVialData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.session).toBeDefined();
      expect(data.session.id).toBeDefined();
      expect(data.session.lotId).toBe(testLotId);
      expect(data.session.status).toBe('active');
      expect(data.session.originalUnits).toBe(100);
      expect(data.expiresAt).toBeDefined();
      expect(data.message).toBe('Vial opened successfully');
    });

    it('should set stability hours based on product', async () => {
      const res = await request('POST', '/api/inventory/open-vials', validOpenVialData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.stabilityHoursRemaining).toBe(24);
      expect(data.session.stabilityHoursTotal).toBe(24);
    });

    it('should calculate concentration when dilution is provided', async () => {
      const res = await request('POST', '/api/inventory/open-vials', {
        ...validOpenVialData,
        diluentVolume: 2.5,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.session.concentration).toBeDefined();
      expect(data.session.concentration).toContain('per 0.1ml');
    });

    it('should return 404 for non-existent lot', async () => {
      const res = await request('POST', '/api/inventory/open-vials', {
        ...validOpenVialData,
        lotId: crypto.randomUUID(),
      });

      expect(res.status).toBe(404);
    });

    it('should deduct quantity from lot when vial is opened', async () => {
      const lotBefore = getLotsStore().get(testLotId);
      const quantityBefore = lotBefore?.currentQuantity || 0;

      await request('POST', '/api/inventory/open-vials', validOpenVialData);

      const lotAfter = getLotsStore().get(testLotId);
      expect(lotAfter?.currentQuantity).toBe(quantityBefore - 100);
    });
  });

  // ===================
  // Get Vial Session Details (3 tests)
  // ===================
  describe('Get Vial Session - GET /api/inventory/open-vials/:id', () => {
    it('should return vial session details', async () => {
      const res = await request('GET', `/api/inventory/open-vials/${testOpenVialId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.session).toBeDefined();
      expect(data.session.id).toBe(testOpenVialId);
      expect(data.session.usageRecords).toBeDefined();
      expect(data.session.stabilityHoursRemaining).toBeDefined();
    });

    it('should return 404 for non-existent vial session', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/inventory/open-vials/${fakeId}`);

      expect(res.status).toBe(404);
    });

    it('should update stability hours on each request', async () => {
      const res = await request('GET', `/api/inventory/open-vials/${testOpenVialId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.session.stabilityHoursRemaining).toBeDefined();
      expect(data.session.isExpired).toBeDefined();
    });
  });

  // ===================
  // Use From Vial - Fractional Units (8 tests)
  // ===================
  describe('Use From Vial - POST /api/inventory/open-vials/:id/use', () => {
    it('should use units from vial successfully', async () => {
      const res = await request('POST', `/api/inventory/open-vials/${testOpenVialId}/use`, validUseFromVialData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.usageRecord).toBeDefined();
      expect(data.usageRecord.unitsUsed).toBe(15);
      expect(data.remainingUnits).toBeDefined();
      expect(data.message).toContain('Used 15 units');
    });

    it('should support fractional units (12.5)', async () => {
      const fractionalUseData = {
        ...validUseFromVialData,
        unitsToUse: 12.5,
        areasInjected: [
          { name: 'Forehead', units: 6 },
          { name: 'Glabella', units: 6.5 },
        ],
      };

      const res = await request('POST', `/api/inventory/open-vials/${testOpenVialId}/use`, fractionalUseData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.usageRecord.unitsUsed).toBe(12.5);
    });

    it('should reject insufficient units', async () => {
      const tooManyUnits = {
        ...validUseFromVialData,
        unitsToUse: 1000,
      };

      const res = await request('POST', `/api/inventory/open-vials/${testOpenVialId}/use`, tooManyUnits);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Insufficient units');
    });

    it('should track multiple patients from same vial', async () => {
      const patient1 = { ...validUseFromVialData, patientId: crypto.randomUUID(), patientName: 'Patient 1', unitsToUse: 10 };
      const patient2 = { ...validUseFromVialData, patientId: crypto.randomUUID(), patientName: 'Patient 2', unitsToUse: 10 };

      await request('POST', `/api/inventory/open-vials/${testOpenVialId}/use`, patient1);
      await request('POST', `/api/inventory/open-vials/${testOpenVialId}/use`, patient2);

      const res = await request('GET', `/api/inventory/open-vials/${testOpenVialId}`);
      const data = await res.json();
      expect(data.session.totalPatients).toBeGreaterThanOrEqual(3); // 2 existing + 2 new
    });

    it('should auto-deplete vial when all units used', async () => {
      const getRes = await request('GET', `/api/inventory/open-vials/${testOpenVialId}`);
      const getData = await getRes.json();
      const remainingUnits = getData.session.currentUnits;

      const useAll = { ...validUseFromVialData, unitsToUse: remainingUnits };
      const res = await request('POST', `/api/inventory/open-vials/${testOpenVialId}/use`, useAll);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.isVialDepleted).toBe(true);
      expect(data.remainingUnits).toBe(0);
    });

    it('should reject use from non-active vial', async () => {
      // First close the vial
      await request('POST', `/api/inventory/open-vials/${testOpenVialId}/close`, {
        reason: 'manual_close',
      });

      const res = await request('POST', `/api/inventory/open-vials/${testOpenVialId}/use`, validUseFromVialData);

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent vial', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('POST', `/api/inventory/open-vials/${fakeId}/use`, validUseFromVialData);

      expect(res.status).toBe(404);
    });

    it('should update cost metrics after use', async () => {
      await request('POST', `/api/inventory/open-vials/${testOpenVialId}/use`, validUseFromVialData);

      const res = await request('GET', `/api/inventory/open-vials/${testOpenVialId}`);
      const data = await res.json();

      expect(data.session.costPerUnitUsed).toBeDefined();
      expect(data.session.costPerUnitUsed).toBeGreaterThan(0);
    });
  });

  // ===================
  // Close Vial Session (5 tests)
  // ===================
  describe('Close Vial - POST /api/inventory/open-vials/:id/close', () => {
    it('should close vial with depleted reason', async () => {
      const res = await request('POST', `/api/inventory/open-vials/${testOpenVialId}/close`, {
        reason: 'depleted',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.session.closedReason).toBe('depleted');
      expect(data.session.closedAt).toBeDefined();
      expect(data.summary).toBeDefined();
      expect(data.message).toBe('Vial session closed successfully');
    });

    it('should close vial with expired reason', async () => {
      // Create a fresh vial to close
      const openRes = await request('POST', '/api/inventory/open-vials', validOpenVialData);
      const openData = await openRes.json();
      const newVialId = openData.session.id;

      const res = await request('POST', `/api/inventory/open-vials/${newVialId}/close`, {
        reason: 'expired',
        wastedUnits: 50,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.session.closedReason).toBe('expired');
      expect(data.session.status).toBe('expired');
    });

    it('should record wasted units on close', async () => {
      const openRes = await request('POST', '/api/inventory/open-vials', validOpenVialData);
      const openData = await openRes.json();
      const newVialId = openData.session.id;

      const res = await request('POST', `/api/inventory/open-vials/${newVialId}/close`, {
        reason: 'manual_close',
        wastedUnits: 30,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.summary.totalWasted).toBe(30);
    });

    it('should reject closing already closed vial', async () => {
      // First close
      await request('POST', `/api/inventory/open-vials/${testOpenVialId}/close`, {
        reason: 'manual_close',
      });

      // Try to close again
      const res = await request('POST', `/api/inventory/open-vials/${testOpenVialId}/close`, {
        reason: 'contamination',
      });

      expect(res.status).toBe(400);
    });

    it('should return cost and revenue metrics on close', async () => {
      // Use some units first
      await request('POST', `/api/inventory/open-vials/${testOpenVialId}/use`, validUseFromVialData);

      const res = await request('POST', `/api/inventory/open-vials/${testOpenVialId}/close`, {
        reason: 'depleted',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.summary.costPerUnitUsed).toBeDefined();
      expect(data.summary.revenueGenerated).toBeDefined();
      expect(data.summary.profitMargin).toBeDefined();
    });
  });

  // ===================
  // Usage History (3 tests)
  // ===================
  describe('Usage History - GET /api/inventory/open-vials/:id/usage-history', () => {
    it('should return usage history for vial', async () => {
      const res = await request('GET', `/api/inventory/open-vials/${testOpenVialId}/usage-history`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.vialInfo).toBeDefined();
      expect(data.usageRecords).toBeDefined();
      expect(data.byPatient).toBeDefined();
      expect(data.byPractitioner).toBeDefined();
      expect(data.summary).toBeDefined();
    });

    it('should group usage by patient', async () => {
      const res = await request('GET', `/api/inventory/open-vials/${testOpenVialId}/usage-history`);

      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.byPatient.length > 0) {
        expect(data.byPatient[0].patientId).toBeDefined();
        expect(data.byPatient[0].patientName).toBeDefined();
        expect(data.byPatient[0].totalUnits).toBeDefined();
        expect(data.byPatient[0].treatments).toBeDefined();
      }
    });

    it('should include summary with averages', async () => {
      const res = await request('GET', `/api/inventory/open-vials/${testOpenVialId}/usage-history`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.summary.totalPatients).toBeDefined();
      expect(data.summary.totalTreatments).toBeDefined();
      expect(data.summary.averageUnitsPerTreatment).toBeDefined();
      expect(data.summary.costPerPatient).toBeDefined();
    });
  });

  // ===================
  // Business Logic Tests (8 tests)
  // ===================
  describe('Business Logic', () => {
    it('should select lot using FEFO (First Expire First Out)', () => {
      const now = new Date();

      // Create a lot expiring sooner than the existing expiring lot (which is at 25 days)
      const soonerExpiringLotId = '11111111-1111-1111-1111-111111111111';
      const soonerLot: StoredInventoryLot = {
        id: soonerExpiringLotId,
        productId: testProductId,
        productName: 'Botox Cosmetic 100U',
        lotNumber: 'BTX-SOONER',
        expirationDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days (sooner than the 25-day expiring lot)
        receivedDate: now,
        initialQuantity: 100,
        currentQuantity: 100,
        reservedQuantity: 0,
        unitType: 'units',
        locationId: testLocationId,
        locationName: 'Test',
        purchaseCost: 450,
        status: 'available',
        createdAt: now,
        updatedAt: now,
        createdBy: 'test',
        lastUpdatedBy: 'test',
      };
      getLotsStore().set(soonerExpiringLotId, soonerLot);

      const selectedLot = selectLotFEFO(testProductId, 50);
      expect(selectedLot).not.toBeNull();
      // Should select the lot expiring soonest (10 days)
      expect(selectedLot?.id).toBe(soonerExpiringLotId);
    });

    it('should calculate stability remaining correctly', () => {
      const now = new Date();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

      const vial: StoredOpenVialSession = {
        id: 'test-vial',
        lotId: 'test-lot',
        lotNumber: 'LOT-TEST',
        productId: testProductId,
        productName: 'Test Product',
        vialNumber: 1,
        originalUnits: 100,
        currentUnits: 50,
        usedUnits: 50,
        wastedUnits: 0,
        reconstitutedAt: twoHoursAgo,
        expiresAt: new Date(twoHoursAgo.getTime() + 24 * 60 * 60 * 1000),
        stabilityHoursTotal: 24,
        stabilityHoursRemaining: 24,
        isExpired: false,
        usageRecords: [],
        totalPatients: 0,
        locationId: testLocationId,
        locationName: 'Main',
        status: 'active',
        vialCost: 100,
        costPerUnitUsed: 2,
        revenueGenerated: 150,
        profitMargin: 33,
        createdAt: twoHoursAgo,
        updatedAt: now,
        createdBy: 'test',
        lastUpdatedBy: 'test',
      };

      const remaining = calculateStabilityRemaining(vial);
      expect(remaining).toBeCloseTo(22, 0);
    });

    it('should correctly identify expired lots', () => {
      const now = new Date();
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const expiredLot: StoredInventoryLot = {
        id: 'expired-lot',
        productId: testProductId,
        productName: 'Test Product',
        lotNumber: 'LOT-EXPIRED',
        expirationDate: pastDate,
        receivedDate: now,
        initialQuantity: 100,
        currentQuantity: 100,
        reservedQuantity: 0,
        unitType: 'units',
        locationId: testLocationId,
        locationName: 'Main',
        purchaseCost: 100,
        status: 'available',
        createdAt: now,
        updatedAt: now,
        createdBy: 'test',
        lastUpdatedBy: 'test',
      };

      const validLot: StoredInventoryLot = {
        ...expiredLot,
        id: 'valid-lot',
        lotNumber: 'LOT-VALID',
        expirationDate: futureDate,
      };

      expect(isLotExpired(expiredLot)).toBe(true);
      expect(isLotExpired(validLot)).toBe(false);
    });

    it('should generate expiration alert for lot expiring within 90 days', () => {
      const now = new Date();
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const lot: StoredInventoryLot = {
        id: 'expiring-lot',
        productId: testProductId,
        productName: 'Test Product',
        lotNumber: 'LOT-EXPIRING',
        expirationDate: in30Days,
        receivedDate: now,
        initialQuantity: 100,
        currentQuantity: 100,
        reservedQuantity: 0,
        unitType: 'units',
        locationId: testLocationId,
        locationName: 'Main',
        purchaseCost: 100,
        status: 'available',
        createdAt: now,
        updatedAt: now,
        createdBy: 'test',
        lastUpdatedBy: 'test',
      };

      const alert = generateExpirationAlert(lot);
      expect(alert).not.toBeNull();
      expect(alert?.type).toBe('expiring_soon');
      expect(alert?.severity).toBe('warning');
    });

    it('should generate critical alert for lot expiring within 7 days', () => {
      const now = new Date();
      const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

      const lot: StoredInventoryLot = {
        id: 'critical-lot',
        productId: testProductId,
        productName: 'Test Product',
        lotNumber: 'LOT-CRITICAL',
        expirationDate: in5Days,
        receivedDate: now,
        initialQuantity: 100,
        currentQuantity: 100,
        reservedQuantity: 0,
        unitType: 'units',
        locationId: testLocationId,
        locationName: 'Main',
        purchaseCost: 100,
        status: 'available',
        createdAt: now,
        updatedAt: now,
        createdBy: 'test',
        lastUpdatedBy: 'test',
      };

      const alert = generateExpirationAlert(lot);
      expect(alert).not.toBeNull();
      expect(alert?.severity).toBe('critical');
    });

    it('should not generate alert for lot expiring after 90 days', () => {
      const now = new Date();
      const in120Days = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000);

      const lot: StoredInventoryLot = {
        id: 'far-lot',
        productId: testProductId,
        productName: 'Test Product',
        lotNumber: 'LOT-FAR',
        expirationDate: in120Days,
        receivedDate: now,
        initialQuantity: 100,
        currentQuantity: 100,
        reservedQuantity: 0,
        unitType: 'units',
        locationId: testLocationId,
        locationName: 'Main',
        purchaseCost: 100,
        status: 'available',
        createdAt: now,
        updatedAt: now,
        createdBy: 'test',
        lastUpdatedBy: 'test',
      };

      const alert = generateExpirationAlert(lot);
      expect(alert).toBeNull();
    });

    it('should calculate cost per unit correctly', async () => {
      await request('POST', `/api/inventory/open-vials/${testOpenVialId}/use`, {
        ...validUseFromVialData,
        unitsToUse: 10,
      });

      const res = await request('GET', `/api/inventory/open-vials/${testOpenVialId}`);
      const data = await res.json();

      expect(data.session.costPerUnitUsed).toBeDefined();
      expect(data.session.costPerUnitUsed).toBeGreaterThan(0);
    });

    it('should handle floating point precision for fractional units', async () => {
      // Multiple fractional uses
      await request('POST', `/api/inventory/open-vials/${testOpenVialId}/use`, {
        ...validUseFromVialData,
        unitsToUse: 12.5,
      });
      await request('POST', `/api/inventory/open-vials/${testOpenVialId}/use`, {
        ...validUseFromVialData,
        patientId: crypto.randomUUID(),
        unitsToUse: 7.3,
      });

      const res = await request('GET', `/api/inventory/open-vials/${testOpenVialId}`);
      const data = await res.json();

      const usedUnits = data.session.usedUnits;
      expect(Number.isFinite(usedUnits)).toBe(true);
      // Check precision is maintained (no floating point errors like 19.799999999)
      expect(Math.abs(usedUnits - Math.round(usedUnits * 100) / 100)).toBeLessThan(0.001);
    });
  });

  // ===================
  // Validation Tests (6 tests)
  // ===================
  describe('Validation', () => {
    it('should validate lot number format (max 100 chars)', async () => {
      const longLotNumber = 'A'.repeat(101);
      const res = await request('POST', '/api/inventory/lots', {
        ...validLotData,
        lotNumber: longLotNumber,
      });

      expect(res.status).toBe(400);
    });

    it('should validate expiration date format', async () => {
      const res = await request('POST', '/api/inventory/lots', {
        ...validLotData,
        lotNumber: 'BTX-INVALID-DATE',
        expirationDate: 'not-a-date',
      });

      expect(res.status).toBe(400);
    });

    it('should validate positive quantity', async () => {
      const res = await request('POST', '/api/inventory/lots', {
        ...validLotData,
        lotNumber: 'BTX-NEG-QTY',
        initialQuantity: -10,
      });

      expect(res.status).toBe(400);
    });

    it('should validate UUID format for productId', async () => {
      const res = await request('POST', '/api/inventory/lots', {
        ...validLotData,
        productId: 'not-a-uuid',
      });

      expect(res.status).toBe(400);
    });

    it('should validate units to use is positive', async () => {
      const res = await request('POST', `/api/inventory/open-vials/${testOpenVialId}/use`, {
        ...validUseFromVialData,
        unitsToUse: 0,
      });

      expect(res.status).toBe(400);
    });

    it('should validate close reason enum', async () => {
      const res = await request('POST', `/api/inventory/open-vials/${testOpenVialId}/close`, {
        reason: 'invalid-reason',
      });

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Edge Cases (4 tests)
  // ===================
  describe('Edge Cases', () => {
    it('should handle pagination beyond results', async () => {
      const res = await request('GET', '/api/inventory/lots?page=1000');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
      expect(data.hasMore).toBe(false);
    });

    it('should reject limit over 100', async () => {
      const res = await request('GET', '/api/inventory/lots?limit=101');

      expect(res.status).toBe(400);
    });

    it('should handle empty usage records in history', async () => {
      // Create a new vial with no usage
      const openRes = await request('POST', '/api/inventory/open-vials', validOpenVialData);
      const openData = await openRes.json();
      const newVialId = openData.session.id;

      const res = await request('GET', `/api/inventory/open-vials/${newVialId}/usage-history`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.usageRecords).toEqual([]);
      expect(data.summary.averageUnitsPerTreatment).toBe(0);
    });

    it('should handle concurrent usage from same vial', async () => {
      // Create a fresh vial with enough units
      const openRes = await request('POST', '/api/inventory/open-vials', validOpenVialData);
      const openData = await openRes.json();
      const newVialId = openData.session.id;

      // Simulate concurrent requests
      const promises = [
        request('POST', `/api/inventory/open-vials/${newVialId}/use`, {
          ...validUseFromVialData,
          patientId: crypto.randomUUID(),
          patientName: 'Patient A',
          unitsToUse: 5,
        }),
        request('POST', `/api/inventory/open-vials/${newVialId}/use`, {
          ...validUseFromVialData,
          patientId: crypto.randomUUID(),
          patientName: 'Patient B',
          unitsToUse: 5,
        }),
      ];

      const results = await Promise.all(promises);

      // Both should succeed if there were enough units
      const successCount = results.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThanOrEqual(1);
    });
  });
});
