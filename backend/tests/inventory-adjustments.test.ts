/**
 * Inventory Adjustments API Tests
 *
 * Comprehensive tests for:
 * - Transactions: List with filters, get by ID, manual adjustments
 * - Treatment Usage: FEFO lot selection, specific lot override, patient/practitioner linkage
 * - Waste Tracking: All waste reasons, waste value calculation
 * - Transfers: Create, ship, receive, status workflow
 * - Physical Counts: Create, update quantities, complete, post adjustments
 * - Business Logic: quantityBefore/After tracking, stock updates, low stock alerts
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import inventoryAdjustments, {
  clearStores,
  getTransactionsStore,
  getWasteRecordsStore,
  getTransfersStore,
  getCountsStore,
  getLotsStore,
  getProductsStore,
  getLocationsStore,
  getPatientsStore,
  getProvidersStore,
  addMockProduct,
  addMockLot,
  addMockLocation,
  addMockPatient,
  addMockProvider,
  addMockTransaction,
  addMockTransfer,
  addMockCount,
  MockProduct,
  MockInventoryLot,
  MockLocation,
  MockPatient,
  MockProvider,
  StoredInventoryTransaction,
  StoredInventoryTransfer,
  StoredInventoryCount,
} from '../src/routes/inventory-adjustments';
import { errorHandler } from '../src/middleware/error';
import { sessionStore } from '../src/middleware/auth';
import crypto from 'crypto';

// Create test app with error handler
const app = new Hono();
app.route('/api/inventory', inventoryAdjustments);
app.onError(errorHandler);

// Mock session for authentication
const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
const mockSessionToken = 'test-session-token-inventory-12345';
const mockSessionId = 'test-session-id-inventory';

// Generate consistent UUIDs for test data
const testProductId = '11111111-1111-1111-1111-111111111111';
const testProductId2 = '22222222-2222-2222-2222-222222222222';
const testLotId = '33333333-3333-3333-3333-333333333333';
const testLotId2 = '44444444-4444-4444-4444-444444444444';
const testLotId3 = '55555555-5555-5555-5555-555555555555';
const testLocationId = '66666666-6666-6666-6666-666666666666';
const testLocationId2 = '77777777-7777-7777-7777-777777777777';
const testPatientId = '88888888-8888-8888-8888-888888888888';
const testProviderId = '99999999-9999-9999-9999-999999999999';
const testTransactionId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const testTransferId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const testCountId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

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

// Initialize proper UUID-based test data
function initializeTestData() {
  const now = new Date();

  // Locations
  addMockLocation({ id: testLocationId, name: 'Main Clinic' });
  addMockLocation({ id: testLocationId2, name: 'Downtown Office' });

  // Products
  addMockProduct({
    id: testProductId,
    name: 'Botox Cosmetic',
    category: 'neurotoxin',
    unitType: 'units',
    costPrice: 4.50,
    retailPrice: 15.00,
  });
  addMockProduct({
    id: testProductId2,
    name: 'Dysport',
    category: 'neurotoxin',
    unitType: 'units',
    costPrice: 2.80,
    retailPrice: 10.00,
  });

  // Patients
  addMockPatient({ id: testPatientId, firstName: 'Sarah', lastName: 'Johnson' });

  // Providers
  addMockProvider({ id: testProviderId, firstName: 'Dr. Susan', lastName: 'Lo' });

  // Lots - testLotId2 expires sooner for FEFO testing
  addMockLot({
    id: testLotId,
    productId: testProductId,
    productName: 'Botox Cosmetic',
    lotNumber: 'BTX-2024-001',
    expirationDate: new Date(now.getFullYear(), now.getMonth() + 6, 15),
    initialQuantity: 100,
    currentQuantity: 78,
    reservedQuantity: 0,
    unitType: 'units',
    purchaseCost: 450,
    locationId: testLocationId,
    locationName: 'Main Clinic',
    status: 'available',
    createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    updatedAt: now,
  });

  addMockLot({
    id: testLotId2,
    productId: testProductId,
    productName: 'Botox Cosmetic',
    lotNumber: 'BTX-2024-002',
    expirationDate: new Date(now.getFullYear(), now.getMonth() + 3, 1), // Expires sooner - FEFO should select this
    initialQuantity: 100,
    currentQuantity: 45,
    reservedQuantity: 0,
    unitType: 'units',
    purchaseCost: 450,
    locationId: testLocationId,
    locationName: 'Main Clinic',
    status: 'available',
    createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 15),
    updatedAt: now,
  });

  addMockLot({
    id: testLotId3,
    productId: testProductId2,
    productName: 'Dysport',
    lotNumber: 'DYS-2024-001',
    expirationDate: new Date(now.getFullYear(), now.getMonth() + 8, 1),
    initialQuantity: 300,
    currentQuantity: 240,
    reservedQuantity: 0,
    unitType: 'units',
    purchaseCost: 840,
    locationId: testLocationId,
    locationName: 'Main Clinic',
    status: 'available',
    createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 10),
    updatedAt: now,
  });

  // Add a mock transaction
  addMockTransaction({
    id: testTransactionId,
    type: 'receive',
    status: 'completed',
    timestamp: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    productId: testProductId,
    productName: 'Botox Cosmetic',
    lotId: testLotId,
    lotNumber: 'BTX-2024-001',
    quantity: 100,
    unitType: 'units',
    quantityBefore: 0,
    quantityAfter: 100,
    unitCost: 4.50,
    totalCost: 450,
    locationId: testLocationId,
    locationName: 'Main Clinic',
    reason: 'Received from vendor',
    performedBy: mockUserId,
    performedByName: 'System Admin',
    approvalRequired: false,
    createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    updatedAt: new Date(now.getFullYear(), now.getMonth() - 1, 1),
  });

  // Add a mock transfer (already received)
  addMockTransfer({
    id: testTransferId,
    transferNumber: 'TRF-2024-0001',
    sourceLocationId: testLocationId,
    sourceLocationName: 'Main Clinic',
    destinationLocationId: testLocationId2,
    destinationLocationName: 'Downtown Office',
    items: [
      {
        id: crypto.randomUUID(),
        productId: testProductId,
        productName: 'Botox Cosmetic',
        lotId: testLotId,
        lotNumber: 'BTX-2024-001',
        requestedQuantity: 50,
        approvedQuantity: 50,
        shippedQuantity: 50,
        receivedQuantity: 50,
        unitType: 'units',
        unitCost: 4.50,
        totalCost: 225,
      },
    ],
    requestedDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
    approvedDate: new Date(now.getFullYear(), now.getMonth() - 1, 16),
    shippedDate: new Date(now.getFullYear(), now.getMonth() - 1, 17),
    receivedDate: new Date(now.getFullYear(), now.getMonth() - 1, 18),
    status: 'received',
    totalValue: 225,
    requestedBy: mockUserId,
    requestedByName: 'Test User',
    approvedBy: mockUserId,
    approvedByName: 'Test User',
    shippedBy: mockUserId,
    shippedByName: 'Test User',
    receivedBy: mockUserId,
    receivedByName: 'Test User',
    createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 15),
    updatedAt: new Date(now.getFullYear(), now.getMonth() - 1, 18),
  });

  // Add a mock count (already posted)
  const countItemId = crypto.randomUUID();
  addMockCount({
    id: testCountId,
    countNumber: 'CNT-2024-0001',
    locationId: testLocationId,
    locationName: 'Main Clinic',
    countType: 'cycle',
    scheduledDate: new Date(now.getFullYear(), now.getMonth(), 1),
    startedAt: new Date(now.getFullYear(), now.getMonth(), 1, 9, 0),
    completedAt: new Date(now.getFullYear(), now.getMonth(), 1, 11, 30),
    approvedAt: new Date(now.getFullYear(), now.getMonth(), 1, 14, 0),
    postedAt: new Date(now.getFullYear(), now.getMonth(), 1, 15, 0),
    items: [
      {
        id: countItemId,
        productId: testProductId,
        productName: 'Botox Cosmetic',
        lotId: testLotId,
        lotNumber: 'BTX-2024-001',
        systemQuantity: 80,
        countedQuantity: 78,
        variance: -2,
        variancePercent: -2.5,
        unitCost: 4.50,
        varianceValue: -9.00,
        countedBy: mockUserId,
        countedAt: new Date(now.getFullYear(), now.getMonth(), 1, 10, 0),
      },
    ],
    totalItems: 1,
    countedItems: 1,
    itemsWithVariance: 1,
    totalVarianceValue: -9.00,
    status: 'posted',
    createdBy: mockUserId,
    startedBy: mockUserId,
    completedBy: mockUserId,
    approvedBy: mockUserId,
    postedBy: mockUserId,
    createdAt: new Date(now.getFullYear(), now.getMonth(), 1),
    updatedAt: new Date(now.getFullYear(), now.getMonth(), 1, 15, 0),
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

describe('Inventory Adjustments API', () => {
  beforeEach(() => {
    clearStores();
    sessionStore.clear();
    setupMockSession();
    // Clear the default mock data and reinitialize with UUID-based data
    getTransactionsStore().clear();
    getWasteRecordsStore().clear();
    getTransfersStore().clear();
    getCountsStore().clear();
    getLotsStore().clear();
    getProductsStore().clear();
    getLocationsStore().clear();
    getPatientsStore().clear();
    getProvidersStore().clear();
    initializeTestData();
  });

  // ===================
  // Authentication Tests (2 tests)
  // ===================
  describe('Authentication', () => {
    it('should reject requests without authentication', async () => {
      const res = await unauthenticatedRequest('GET', '/api/inventory/transactions');
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const req = new Request('http://localhost/api/inventory/transactions', {
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
  // List Transactions Tests (5 tests)
  // ===================
  describe('List Transactions - GET /api/inventory/transactions', () => {
    it('should return paginated list of transactions', async () => {
      const res = await request('GET', '/api/inventory/transactions');

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
      const res = await request('GET', '/api/inventory/transactions?page=1&limit=2');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeLessThanOrEqual(2);
      expect(data.limit).toBe(2);
    });

    it('should filter by transaction type', async () => {
      const res = await request('GET', '/api/inventory/transactions?type=receive');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((t: any) => t.type === 'receive')).toBe(true);
    });

    it('should filter by productId', async () => {
      const res = await request('GET', `/api/inventory/transactions?productId=${testProductId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((t: any) => t.productId === testProductId)).toBe(true);
    });

    it('should sort by timestamp descending by default', async () => {
      const res = await request('GET', '/api/inventory/transactions');

      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.items.length > 1) {
        const timestamps = data.items.map((t: any) => new Date(t.timestamp).getTime());
        const sortedTimestamps = [...timestamps].sort((a, b) => b - a);
        expect(timestamps).toEqual(sortedTimestamps);
      }
    });
  });

  // ===================
  // Get Transaction Tests (3 tests)
  // ===================
  describe('Get Transaction - GET /api/inventory/transactions/:id', () => {
    it('should return single transaction by ID', async () => {
      const res = await request('GET', `/api/inventory/transactions/${testTransactionId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.transaction).toBeDefined();
      expect(data.transaction.id).toBe(testTransactionId);
      expect(data.transaction.type).toBe('receive');
    });

    it('should return 404 for non-existent transaction', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/inventory/transactions/${fakeId}`);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid UUID', async () => {
      const res = await request('GET', '/api/inventory/transactions/invalid-id');

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Manual Adjustment Tests (6 tests)
  // ===================
  describe('Manual Adjustments - POST /api/inventory/adjustments', () => {
    it('should create add adjustment with valid data', async () => {
      const res = await request('POST', '/api/inventory/adjustments', {
        productId: testProductId,
        lotId: testLotId,
        adjustmentType: 'add',
        quantity: 10,
        reason: 'Found additional inventory',
        locationId: testLocationId,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.transaction).toBeDefined();
      expect(data.transaction.type).toBe('adjustment_add');
      expect(data.transaction.quantity).toBe(10);
      expect(data.transaction.quantityBefore).toBeDefined();
      expect(data.transaction.quantityAfter).toBe(data.transaction.quantityBefore + 10);
      expect(data.lotUpdated).toBeDefined();
      expect(data.message).toBe('Adjustment created successfully');
    });

    it('should create remove adjustment with valid data', async () => {
      const initialLot = getLotsStore().get(testLotId);
      const initialQty = initialLot?.currentQuantity || 0;

      const res = await request('POST', '/api/inventory/adjustments', {
        productId: testProductId,
        lotId: testLotId,
        adjustmentType: 'remove',
        quantity: 5,
        reason: 'Inventory shrinkage',
        locationId: testLocationId,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.transaction.type).toBe('adjustment_remove');
      expect(data.transaction.quantity).toBe(-5);
      expect(data.lotUpdated.newQuantity).toBe(initialQty - 5);
    });

    it('should reject adjustment with non-existent lot', async () => {
      const res = await request('POST', '/api/inventory/adjustments', {
        productId: testProductId,
        lotId: crypto.randomUUID(),
        adjustmentType: 'add',
        quantity: 10,
        reason: 'Test',
        locationId: testLocationId,
      });

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.message).toContain('Lot not found');
    });

    it('should reject adjustment with mismatched product', async () => {
      const res = await request('POST', '/api/inventory/adjustments', {
        productId: testProductId2, // Dysport
        lotId: testLotId, // Botox lot
        adjustmentType: 'add',
        quantity: 10,
        reason: 'Test',
        locationId: testLocationId,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Product does not match lot');
    });

    it('should reject removal exceeding available quantity', async () => {
      const lot = getLotsStore().get(testLotId);
      const availableQty = (lot?.currentQuantity || 0) - (lot?.reservedQuantity || 0);

      const res = await request('POST', '/api/inventory/adjustments', {
        productId: testProductId,
        lotId: testLotId,
        adjustmentType: 'remove',
        quantity: availableQty + 100,
        reason: 'Attempting excess removal',
        locationId: testLocationId,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Insufficient quantity');
    });

    it('should track quantityBefore and quantityAfter correctly', async () => {
      const initialLot = getLotsStore().get(testLotId);
      const initialQty = initialLot?.currentQuantity || 0;

      const res = await request('POST', '/api/inventory/adjustments', {
        productId: testProductId,
        lotId: testLotId,
        adjustmentType: 'add',
        quantity: 20,
        reason: 'Received additional stock',
        locationId: testLocationId,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.transaction.quantityBefore).toBe(initialQty);
      expect(data.transaction.quantityAfter).toBe(initialQty + 20);
    });
  });

  // ===================
  // Treatment Usage Tests (7 tests)
  // ===================
  describe('Treatment Usage - POST /api/inventory/use', () => {
    it('should record usage with FEFO lot selection', async () => {
      // lot-002 (testLotId2) expires sooner than lot-001 (testLotId), so FEFO should select it
      const res = await request('POST', '/api/inventory/use', {
        productId: testProductId,
        quantity: 10,
        appointmentId: crypto.randomUUID(),
        patientId: testPatientId,
        practitionerId: testProviderId,
        locationId: testLocationId,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.lotUsed).toBeDefined();
      // testLotId2 expires sooner, should be selected by FEFO
      expect(data.lotUsed.lotId).toBe(testLotId2);
    });

    it('should record usage with specific lot override', async () => {
      const res = await request('POST', '/api/inventory/use', {
        productId: testProductId,
        quantity: 5,
        lotId: testLotId, // Explicitly specify the lot that expires later
        appointmentId: crypto.randomUUID(),
        patientId: testPatientId,
        practitionerId: testProviderId,
        locationId: testLocationId,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.lotUsed.lotId).toBe(testLotId);
    });

    it('should link usage to patient and practitioner', async () => {
      const res = await request('POST', '/api/inventory/use', {
        productId: testProductId,
        quantity: 5,
        appointmentId: crypto.randomUUID(),
        patientId: testPatientId,
        practitionerId: testProviderId,
        locationId: testLocationId,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.transaction.patientId).toBe(testPatientId);
      expect(data.transaction.practitionerId).toBe(testProviderId);
      expect(data.transaction.patientName).toBeDefined();
      expect(data.transaction.practitionerName).toBeDefined();
    });

    it('should include treatment details with areasInjected', async () => {
      const chartId = crypto.randomUUID();
      const res = await request('POST', '/api/inventory/use', {
        productId: testProductId,
        quantity: 20,
        appointmentId: crypto.randomUUID(),
        patientId: testPatientId,
        practitionerId: testProviderId,
        locationId: testLocationId,
        treatmentDetails: {
          serviceName: 'Botox - Full Face',
          areasInjected: [
            { name: 'Forehead', units: 10 },
            { name: 'Glabellar', units: 10 },
          ],
          chartId,
        },
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.transaction.treatmentDetails).toBeDefined();
      expect(data.transaction.treatmentDetails.serviceName).toBe('Botox - Full Face');
      expect(data.transaction.treatmentDetails.areasInjected).toHaveLength(2);
      expect(data.transaction.treatmentDetails.chartId).toBe(chartId);
    });

    it('should reject usage exceeding available lot quantity', async () => {
      const lot = getLotsStore().get(testLotId);
      const availableQty = (lot?.currentQuantity || 0) - (lot?.reservedQuantity || 0);

      const res = await request('POST', '/api/inventory/use', {
        productId: testProductId,
        quantity: availableQty + 100,
        lotId: testLotId,
        appointmentId: crypto.randomUUID(),
        patientId: testPatientId,
        practitionerId: testProviderId,
        locationId: testLocationId,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Insufficient quantity');
    });

    it('should update lot quantity after usage', async () => {
      const initialLot = getLotsStore().get(testLotId);
      const initialQty = initialLot?.currentQuantity || 0;

      await request('POST', '/api/inventory/use', {
        productId: testProductId,
        quantity: 10,
        lotId: testLotId,
        appointmentId: crypto.randomUUID(),
        patientId: testPatientId,
        practitionerId: testProviderId,
        locationId: testLocationId,
      });

      const updatedLot = getLotsStore().get(testLotId);
      expect(updatedLot?.currentQuantity).toBe(initialQty - 10);
    });

    it('should return low stock alert when crossing threshold', async () => {
      // Get a lot and reduce it close to reorder point (20)
      const lot = getLotsStore().get(testLotId);
      if (lot) {
        lot.currentQuantity = 25;
        getLotsStore().set(testLotId, lot);
      }

      const res = await request('POST', '/api/inventory/use', {
        productId: testProductId,
        quantity: 10, // Will reduce to 15, below reorder point of 20
        lotId: testLotId,
        appointmentId: crypto.randomUUID(),
        patientId: testPatientId,
        practitionerId: testProviderId,
        locationId: testLocationId,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.alerts).toBeDefined();
      expect(data.alerts).toHaveLength(1);
      expect(data.alerts[0].type).toBe('low_stock');
    });
  });

  // ===================
  // Waste Tracking Tests (6 tests)
  // ===================
  describe('Waste Tracking - POST /api/inventory/waste', () => {
    it('should record waste with expired_unused reason', async () => {
      const res = await request('POST', '/api/inventory/waste', {
        productId: testProductId,
        lotId: testLotId,
        unitsWasted: 5,
        reason: 'expired_unused',
        reasonNotes: 'Found expired vial',
        locationId: testLocationId,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.wasteRecord).toBeDefined();
      expect(data.wasteRecord.reason).toBe('expired_unused');
      expect(data.totalWasteValue).toBeDefined();
    });

    it('should record waste with stability_exceeded reason', async () => {
      const res = await request('POST', '/api/inventory/waste', {
        productId: testProductId,
        lotId: testLotId,
        unitsWasted: 8,
        reason: 'stability_exceeded',
        reasonNotes: 'Reconstituted vial exceeded 24hr stability',
        locationId: testLocationId,
        practitionerId: testProviderId,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.wasteRecord.reason).toBe('stability_exceeded');
    });

    it('should record waste with contamination reason', async () => {
      const res = await request('POST', '/api/inventory/waste', {
        productId: testProductId,
        lotId: testLotId,
        unitsWasted: 10,
        reason: 'contamination',
        reasonNotes: 'Needle touched non-sterile surface',
        locationId: testLocationId,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.wasteRecord.reason).toBe('contamination');
    });

    it('should record waste with draw_up_loss reason', async () => {
      const res = await request('POST', '/api/inventory/waste', {
        productId: testProductId,
        lotId: testLotId,
        unitsWasted: 3,
        reason: 'draw_up_loss',
        locationId: testLocationId,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.wasteRecord.reason).toBe('draw_up_loss');
    });

    it('should record waste with patient_no_show reason', async () => {
      const res = await request('POST', '/api/inventory/waste', {
        productId: testProductId,
        lotId: testLotId,
        unitsWasted: 20,
        reason: 'patient_no_show',
        reasonNotes: 'Product reconstituted but patient did not show',
        appointmentId: crypto.randomUUID(),
        locationId: testLocationId,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.wasteRecord.reason).toBe('patient_no_show');
    });

    it('should calculate waste value correctly', async () => {
      const product = getProductsStore().get(testProductId);
      const unitCost = product?.costPrice || 0;

      const res = await request('POST', '/api/inventory/waste', {
        productId: testProductId,
        lotId: testLotId,
        unitsWasted: 10,
        reason: 'other',
        reasonNotes: 'Accidental spillage',
        locationId: testLocationId,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.totalWasteValue).toBe(unitCost * 10);
    });
  });

  // ===================
  // List Transfers Tests (3 tests)
  // ===================
  describe('List Transfers - GET /api/inventory/transfers', () => {
    it('should return paginated list of transfers', async () => {
      const res = await request('GET', '/api/inventory/transfers');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();
      expect(data.page).toBe(1);
    });

    it('should filter by status', async () => {
      const res = await request('GET', '/api/inventory/transfers?status=received');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((t: any) => t.status === 'received')).toBe(true);
    });

    it('should filter by source location', async () => {
      const res = await request('GET', `/api/inventory/transfers?sourceLocationId=${testLocationId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((t: any) => t.sourceLocationId === testLocationId)).toBe(true);
    });
  });

  // ===================
  // Create Transfer Tests (4 tests)
  // ===================
  describe('Create Transfer - POST /api/inventory/transfers', () => {
    it('should create transfer with valid data', async () => {
      const res = await request('POST', '/api/inventory/transfers', {
        sourceLocationId: testLocationId,
        destinationLocationId: testLocationId2,
        items: [
          {
            productId: testProductId,
            lotId: testLotId,
            requestedQuantity: 20,
          },
        ],
        requestNotes: 'Downtown office needs stock',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.transfer).toBeDefined();
      expect(data.transfer.transferNumber).toMatch(/^TRF-\d{4}-\d{4}$/);
      expect(data.transfer.status).toBe('requested');
      expect(data.transfer.items).toHaveLength(1);
      expect(data.message).toBe('Transfer created successfully');
    });

    it('should reject transfer to same location', async () => {
      const res = await request('POST', '/api/inventory/transfers', {
        sourceLocationId: testLocationId,
        destinationLocationId: testLocationId,
        items: [
          {
            productId: testProductId,
            lotId: testLotId,
            requestedQuantity: 10,
          },
        ],
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Source and destination cannot be the same');
    });

    it('should reject transfer with non-existent location', async () => {
      const res = await request('POST', '/api/inventory/transfers', {
        sourceLocationId: crypto.randomUUID(),
        destinationLocationId: testLocationId2,
        items: [
          {
            productId: testProductId,
            lotId: testLotId,
            requestedQuantity: 10,
          },
        ],
      });

      expect(res.status).toBe(404);
    });

    it('should reject transfer with lot not at source location', async () => {
      // Add a lot at the second location to test
      const otherLotId = crypto.randomUUID();
      addMockLot({
        id: otherLotId,
        productId: testProductId,
        productName: 'Botox Cosmetic',
        lotNumber: 'BTX-OTHER',
        expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        initialQuantity: 50,
        currentQuantity: 50,
        reservedQuantity: 0,
        unitType: 'units',
        purchaseCost: 225,
        locationId: testLocationId2, // At Downtown Office
        locationName: 'Downtown Office',
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request('POST', '/api/inventory/transfers', {
        sourceLocationId: testLocationId, // Main Clinic
        destinationLocationId: testLocationId2,
        items: [
          {
            productId: testProductId,
            lotId: otherLotId, // This lot is at Downtown, not Main Clinic
            requestedQuantity: 10,
          },
        ],
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('not at source location');
    });
  });

  // ===================
  // Get Transfer Tests (2 tests)
  // ===================
  describe('Get Transfer - GET /api/inventory/transfers/:id', () => {
    it('should return single transfer by ID', async () => {
      const res = await request('GET', `/api/inventory/transfers/${testTransferId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.transfer).toBeDefined();
      expect(data.transfer.id).toBe(testTransferId);
      expect(data.transfer.transferNumber).toBeDefined();
    });

    it('should return 404 for non-existent transfer', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/inventory/transfers/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Ship Transfer Tests (4 tests)
  // ===================
  describe('Ship Transfer - POST /api/inventory/transfers/:id/ship', () => {
    async function createTransferForShipping(): Promise<string> {
      const res = await request('POST', '/api/inventory/transfers', {
        sourceLocationId: testLocationId,
        destinationLocationId: testLocationId2,
        items: [
          {
            productId: testProductId,
            lotId: testLotId,
            requestedQuantity: 10,
          },
        ],
      });
      const data = await res.json();
      return data.transfer.id;
    }

    it('should ship transfer successfully', async () => {
      const transferId = await createTransferForShipping();

      const res = await request('POST', `/api/inventory/transfers/${transferId}/ship`, {
        trackingNumber: 'TRACK-123',
        carrier: 'Internal Courier',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.transfer.status).toBe('in_transit');
      expect(data.transfer.trackingNumber).toBe('TRACK-123');
      expect(data.transfer.shippedDate).toBeDefined();
      expect(data.message).toBe('Transfer shipped successfully');
    });

    it('should update source lot quantity when shipping', async () => {
      const initialLot = getLotsStore().get(testLotId);
      const initialQty = initialLot?.currentQuantity || 0;

      const transferId = await createTransferForShipping();
      await request('POST', `/api/inventory/transfers/${transferId}/ship`, {});

      const updatedLot = getLotsStore().get(testLotId);
      expect(updatedLot?.currentQuantity).toBe(initialQty - 10);
    });

    it('should create transfer_out transaction when shipping', async () => {
      const initialTxnCount = getTransactionsStore().size;

      const transferId = await createTransferForShipping();
      await request('POST', `/api/inventory/transfers/${transferId}/ship`, {});

      const newTxnCount = getTransactionsStore().size;
      expect(newTxnCount).toBeGreaterThan(initialTxnCount);

      // Find the transfer_out transaction
      const txns = Array.from(getTransactionsStore().values());
      const transferOutTxn = txns.find(t => t.type === 'transfer_out' && t.transferId === transferId);
      expect(transferOutTxn).toBeDefined();
    });

    it('should reject shipping already received transfer', async () => {
      const res = await request('POST', `/api/inventory/transfers/${testTransferId}/ship`, {});

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Cannot ship transfer');
    });
  });

  // ===================
  // Receive Transfer Tests (4 tests)
  // ===================
  describe('Receive Transfer - POST /api/inventory/transfers/:id/receive', () => {
    async function createShippedTransfer(): Promise<{ transferId: string; itemId: string }> {
      const createRes = await request('POST', '/api/inventory/transfers', {
        sourceLocationId: testLocationId,
        destinationLocationId: testLocationId2,
        items: [
          {
            productId: testProductId,
            lotId: testLotId,
            requestedQuantity: 10,
          },
        ],
      });
      const createData = await createRes.json();
      const transferId = createData.transfer.id;
      const itemId = createData.transfer.items[0].id;

      // Ship it
      await request('POST', `/api/inventory/transfers/${transferId}/ship`, {});

      return { transferId, itemId };
    }

    it('should receive transfer successfully', async () => {
      const { transferId, itemId } = await createShippedTransfer();

      const res = await request('POST', `/api/inventory/transfers/${transferId}/receive`, {
        items: [
          {
            itemId,
            receivedQuantity: 10,
          },
        ],
        receivingNotes: 'All items received in good condition',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.transfer.status).toBe('received');
      expect(data.transfer.receivedDate).toBeDefined();
      expect(data.message).toBe('Transfer received successfully');
    });

    it('should create new lot at destination location', async () => {
      const { transferId, itemId } = await createShippedTransfer();

      await request('POST', `/api/inventory/transfers/${transferId}/receive`, {
        items: [
          {
            itemId,
            receivedQuantity: 10,
          },
        ],
      });

      // Check for new lot at destination
      const lots = Array.from(getLotsStore().values());
      const destLot = lots.find(l =>
        l.productId === testProductId &&
        l.locationId === testLocationId2 &&
        l.lotNumber.includes('-TRF')
      );
      expect(destLot).toBeDefined();
      expect(destLot?.currentQuantity).toBe(10);
    });

    it('should create transfer_in transaction when receiving', async () => {
      const { transferId, itemId } = await createShippedTransfer();

      await request('POST', `/api/inventory/transfers/${transferId}/receive`, {
        items: [
          {
            itemId,
            receivedQuantity: 10,
          },
        ],
      });

      // Find the transfer_in transaction
      const txns = Array.from(getTransactionsStore().values());
      const transferInTxn = txns.find(t => t.type === 'transfer_in' && t.transferId === transferId);
      expect(transferInTxn).toBeDefined();
      expect(transferInTxn?.quantity).toBe(10);
    });

    it('should reject receiving non-shipped transfer', async () => {
      // Create but don't ship
      const createRes = await request('POST', '/api/inventory/transfers', {
        sourceLocationId: testLocationId,
        destinationLocationId: testLocationId2,
        items: [
          {
            productId: testProductId,
            lotId: testLotId,
            requestedQuantity: 10,
          },
        ],
      });
      const { transfer } = await createRes.json();

      const res = await request('POST', `/api/inventory/transfers/${transfer.id}/receive`, {
        items: [
          {
            itemId: transfer.items[0].id,
            receivedQuantity: 10,
          },
        ],
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Cannot receive transfer');
    });
  });

  // ===================
  // List Counts Tests (3 tests)
  // ===================
  describe('List Counts - GET /api/inventory/counts', () => {
    it('should return paginated list of counts', async () => {
      const res = await request('GET', '/api/inventory/counts');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();
    });

    it('should filter by status', async () => {
      const res = await request('GET', '/api/inventory/counts?status=posted');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((c: any) => c.status === 'posted')).toBe(true);
    });

    it('should filter by location', async () => {
      const res = await request('GET', `/api/inventory/counts?locationId=${testLocationId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((c: any) => c.locationId === testLocationId)).toBe(true);
    });
  });

  // ===================
  // Create Count Tests (3 tests)
  // ===================
  describe('Create Count - POST /api/inventory/counts', () => {
    it('should create count with valid data', async () => {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 1);

      const res = await request('POST', '/api/inventory/counts', {
        locationId: testLocationId,
        countType: 'cycle',
        scheduledDate: scheduledDate.toISOString(),
        notes: 'Monthly cycle count',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.count).toBeDefined();
      expect(data.count.countNumber).toMatch(/^CNT-\d{4}-\d{4}$/);
      expect(data.count.status).toBe('draft');
      expect(data.count.countType).toBe('cycle');
      expect(data.count.items).toBeDefined();
      expect(data.message).toBe('Inventory count created successfully');
    });

    it('should create count with category filter', async () => {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 1);

      const res = await request('POST', '/api/inventory/counts', {
        locationId: testLocationId,
        countType: 'category',
        scheduledDate: scheduledDate.toISOString(),
        categoryFilter: 'neurotoxin',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.count.categoryFilter).toBe('neurotoxin');
    });

    it('should reject count with non-existent location', async () => {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 1);

      const res = await request('POST', '/api/inventory/counts', {
        locationId: crypto.randomUUID(),
        countType: 'full',
        scheduledDate: scheduledDate.toISOString(),
      });

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Update Count Tests (3 tests)
  // ===================
  describe('Update Count - PUT /api/inventory/counts/:id', () => {
    async function createDraftCount(): Promise<{ countId: string; itemId: string }> {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 1);

      const res = await request('POST', '/api/inventory/counts', {
        locationId: testLocationId,
        countType: 'spot',
        scheduledDate: scheduledDate.toISOString(),
      });
      const data = await res.json();
      return {
        countId: data.count.id,
        itemId: data.count.items[0]?.id || '',
      };
    }

    it('should update counted quantities', async () => {
      const { countId, itemId } = await createDraftCount();

      const res = await request('PUT', `/api/inventory/counts/${countId}`, {
        items: [
          {
            itemId,
            countedQuantity: 75,
            notes: 'Counted twice, confirmed',
          },
        ],
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.count.status).toBe('in_progress');
      expect(data.count.startedAt).toBeDefined();
      expect(data.message).toBe('Count items updated successfully');

      // Check variance calculation
      const updatedItem = data.count.items.find((i: any) => i.id === itemId);
      expect(updatedItem?.countedQuantity).toBe(75);
      expect(updatedItem?.variance).toBeDefined();
    });

    it('should calculate variance correctly', async () => {
      const { countId, itemId } = await createDraftCount();

      // First get the count to find the system quantity
      const getRes = await request('GET', '/api/inventory/counts');
      const getCounts = await getRes.json();
      const count = getCounts.items.find((c: any) => c.id === countId);
      const item = count?.items.find((i: any) => i.id === itemId);
      const systemQty = item?.systemQuantity || 78; // Default from lot

      const countedQty = systemQty - 5; // 5 units short

      const res = await request('PUT', `/api/inventory/counts/${countId}`, {
        items: [
          {
            itemId,
            countedQuantity: countedQty,
          },
        ],
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      const updatedItem = data.count.items.find((i: any) => i.id === itemId);
      expect(updatedItem?.variance).toBe(-5);
    });

    it('should reject update on posted count', async () => {
      // Get the posted count's item ID
      const count = getCountsStore().get(testCountId);
      const itemId = count?.items[0]?.id;

      const res = await request('PUT', `/api/inventory/counts/${testCountId}`, {
        items: [
          {
            itemId: itemId || crypto.randomUUID(),
            countedQuantity: 80,
          },
        ],
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Cannot update count');
    });
  });

  // ===================
  // Complete Count Tests (2 tests)
  // ===================
  describe('Complete Count - POST /api/inventory/counts/:id/complete', () => {
    async function createInProgressCount(): Promise<string> {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 1);

      const createRes = await request('POST', '/api/inventory/counts', {
        locationId: testLocationId,
        countType: 'spot',
        scheduledDate: scheduledDate.toISOString(),
      });
      const { count } = await createRes.json();

      // Update all items with counted quantities
      const itemUpdates = count.items.map((item: any) => ({
        itemId: item.id,
        countedQuantity: item.systemQuantity, // Match system for simplicity
      }));

      await request('PUT', `/api/inventory/counts/${count.id}`, {
        items: itemUpdates,
      });

      return count.id;
    }

    it('should complete count successfully', async () => {
      const countId = await createInProgressCount();

      const res = await request('POST', `/api/inventory/counts/${countId}/complete`, {});

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.count.status).toBe('completed');
      expect(data.count.completedAt).toBeDefined();
      expect(data.summary).toBeDefined();
      expect(data.message).toContain('Ready for approval');
    });

    it('should reject completing count with uncounted items', async () => {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 1);

      const createRes = await request('POST', '/api/inventory/counts', {
        locationId: testLocationId,
        countType: 'spot',
        scheduledDate: scheduledDate.toISOString(),
      });
      const { count } = await createRes.json();

      // Count is in draft status, which is not allowed to complete directly
      const res = await request('POST', `/api/inventory/counts/${count.id}/complete`, {});

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Post Count Tests (3 tests)
  // ===================
  describe('Post Count - POST /api/inventory/counts/:id/post', () => {
    async function createCompletedCount(): Promise<string> {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 1);

      const createRes = await request('POST', '/api/inventory/counts', {
        locationId: testLocationId,
        countType: 'spot',
        scheduledDate: scheduledDate.toISOString(),
      });
      const { count } = await createRes.json();

      // Update items with variance
      const itemUpdates = count.items.map((item: any) => ({
        itemId: item.id,
        countedQuantity: item.systemQuantity - 2, // Create variance
      }));

      await request('PUT', `/api/inventory/counts/${count.id}`, {
        items: itemUpdates,
      });

      // Complete
      await request('POST', `/api/inventory/counts/${count.id}/complete`, {});

      return count.id;
    }

    it('should post count and create adjustment transactions', async () => {
      const countId = await createCompletedCount();

      const res = await request('POST', `/api/inventory/counts/${countId}/post`, {});

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.count.status).toBe('posted');
      expect(data.count.postedAt).toBeDefined();
      expect(data.adjustments).toBeDefined();
      expect(data.message).toContain('adjustment(s) created');
    });

    it('should update lot quantities after posting', async () => {
      const countId = await createCompletedCount();

      // Get count to find lot being adjusted
      const getRes = await request('GET', '/api/inventory/counts');
      const counts = await getRes.json();
      const count = counts.items.find((c: any) => c.id === countId);
      const item = count?.items[0];
      const lotId = item?.lotId;
      const countedQty = item?.countedQuantity;

      await request('POST', `/api/inventory/counts/${countId}/post`, {});

      // Check lot quantity was updated
      if (lotId) {
        const lot = getLotsStore().get(lotId);
        expect(lot?.currentQuantity).toBe(countedQty);
      }
    });

    it('should reject posting draft count', async () => {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 1);

      const createRes = await request('POST', '/api/inventory/counts', {
        locationId: testLocationId,
        countType: 'spot',
        scheduledDate: scheduledDate.toISOString(),
      });
      const { count } = await createRes.json();

      const res = await request('POST', `/api/inventory/counts/${count.id}/post`, {});

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Cannot post count');
    });
  });

  // ===================
  // Additional Filter Tests (4 tests)
  // ===================
  describe('Additional Transaction Filters', () => {
    it('should filter transactions by lotId', async () => {
      const res = await request('GET', `/api/inventory/transactions?lotId=${testLotId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((t: any) => t.lotId === testLotId)).toBe(true);
    });

    it('should filter transactions by locationId', async () => {
      const res = await request('GET', `/api/inventory/transactions?locationId=${testLocationId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((t: any) => t.locationId === testLocationId)).toBe(true);
    });

    it('should filter transactions by date range', async () => {
      const now = new Date();
      const dateFrom = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const dateTo = now;

      const res = await request('GET', `/api/inventory/transactions?dateFrom=${dateFrom.toISOString().split('T')[0]}&dateTo=${dateTo.toISOString().split('T')[0]}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      data.items.forEach((t: any) => {
        const txnDate = new Date(t.timestamp);
        expect(txnDate.getTime()).toBeGreaterThanOrEqual(dateFrom.setHours(0, 0, 0, 0));
        expect(txnDate.getTime()).toBeLessThanOrEqual(dateTo.setHours(23, 59, 59, 999));
      });
    });

    it('should sort transactions by totalCost', async () => {
      const res = await request('GET', '/api/inventory/transactions?sortBy=totalCost&sortOrder=desc');

      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.items.length > 1) {
        const costs = data.items.map((t: any) => t.totalCost);
        const sortedCosts = [...costs].sort((a, b) => b - a);
        expect(costs).toEqual(sortedCosts);
      }
    });
  });

  // ===================
  // Edge Cases (5 tests)
  // ===================
  describe('Edge Cases', () => {
    it('should handle pagination beyond results', async () => {
      const res = await request('GET', '/api/inventory/transactions?page=1000');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
      expect(data.hasMore).toBe(false);
    });

    it('should reject limit over 100', async () => {
      const res = await request('GET', '/api/inventory/transactions?limit=101');

      expect(res.status).toBe(400);
    });

    it('should reject negative quantity in adjustment', async () => {
      const res = await request('POST', '/api/inventory/adjustments', {
        productId: testProductId,
        lotId: testLotId,
        adjustmentType: 'add',
        quantity: -10,
        reason: 'Test',
        locationId: testLocationId,
      });

      expect(res.status).toBe(400);
    });

    it('should reject adjustment on lot with non-available status', async () => {
      // Create a lot with quarantine status
      const quarantineLotId = crypto.randomUUID();
      addMockLot({
        id: quarantineLotId,
        productId: testProductId,
        productName: 'Botox Cosmetic',
        lotNumber: 'BTX-QUARANTINE-001',
        expirationDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        initialQuantity: 100,
        currentQuantity: 100,
        reservedQuantity: 0,
        unitType: 'units',
        purchaseCost: 450,
        locationId: testLocationId,
        locationName: 'Main Clinic',
        status: 'quarantine',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request('POST', '/api/inventory/adjustments', {
        productId: testProductId,
        lotId: quarantineLotId,
        adjustmentType: 'add',
        quantity: 10,
        reason: 'Test',
        locationId: testLocationId,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('quarantine');
    });

    it('should set lot status to depleted when quantity reaches zero', async () => {
      // Get lot and set quantity to something small
      const lot = getLotsStore().get(testLotId);
      if (lot) {
        lot.currentQuantity = 5;
        getLotsStore().set(testLotId, lot);
      }

      await request('POST', '/api/inventory/use', {
        productId: testProductId,
        quantity: 5,
        lotId: testLotId,
        appointmentId: crypto.randomUUID(),
        patientId: testPatientId,
        practitionerId: testProviderId,
        locationId: testLocationId,
      });

      const updatedLot = getLotsStore().get(testLotId);
      expect(updatedLot?.status).toBe('depleted');
    });
  });
});
