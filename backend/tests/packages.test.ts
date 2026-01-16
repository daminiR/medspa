/**
 * Packages API Tests
 *
 * Comprehensive test coverage for:
 * - List packages (public and authenticated)
 * - Create package (admin)
 * - Get/Update package
 * - Purchase package for patient
 * - Patient packages list
 * - Redeem service
 * - Usage history
 * - Expiration handling
 * - Edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import packages, {
  clearStores,
  packagesStore,
  purchasesStore,
  Package,
  PackagePurchase,
  addMockPackage,
  addMockPurchase,
} from '../src/routes/packages';
import { sessionStore } from '../src/middleware/auth';
import { errorHandler } from '../src/middleware/error';

// Mock audit logging
vi.mock('@medical-spa/security', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

// Create test app with error handler
const app = new Hono();
app.route('/api/packages', packages);
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
  const token = `admin-token-${Date.now()}`;
  const sessionId = `session-${Date.now()}`;

  sessionStore.set(sessionId, {
    id: sessionId,
    token,
    userId: 'admin-user-1',
    email: 'admin@test.com',
    role: 'admin',
    permissions: ['package:list', 'package:read', 'package:create', 'package:update', 'package:delete'],
    locationIds: ['loc-1'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    lastActivityAt: new Date(),
  });

  return token;
}

// Mock owner user session
function createMockOwnerSession(): string {
  const token = `owner-token-${Date.now()}`;
  const sessionId = `session-owner-${Date.now()}`;

  sessionStore.set(sessionId, {
    id: sessionId,
    token,
    userId: 'owner-user-1',
    email: 'owner@test.com',
    role: 'owner',
    permissions: ['package:list', 'package:read', 'package:create', 'package:update', 'package:delete'],
    locationIds: ['loc-1', 'loc-2'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    lastActivityAt: new Date(),
  });

  return token;
}

// Mock regular staff session (no admin permissions)
function createMockStaffSession(): string {
  const token = `staff-token-${Date.now()}`;
  const sessionId = `session-staff-${Date.now()}`;

  sessionStore.set(sessionId, {
    id: sessionId,
    token,
    userId: 'staff-user-1',
    email: 'staff@test.com',
    role: 'staff',
    permissions: ['package:list', 'package:read'],
    locationIds: ['loc-1'],
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    lastActivityAt: new Date(),
  });

  return token;
}

// Test patient ID (valid UUID)
const testPatientId = '550e8400-e29b-41d4-a716-446655440001';

describe('Packages API', () => {
  beforeEach(() => {
    sessionStore.clear();
    clearStores();
  });

  // ===================
  // List Packages Tests (4 tests)
  // ===================
  describe('GET /api/packages', () => {
    it('should list active packages publicly (no auth required)', async () => {
      const res = await request('GET', '/api/packages');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(data.total).toBeGreaterThan(0);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);

      // Should only return active and available packages
      data.items.forEach((pkg: Package) => {
        expect(pkg.isActive).toBe(true);
        expect(pkg.availableForPurchase).toBe(true);
      });
    });

    it('should include inactive packages for authenticated admin users', async () => {
      const adminToken = createMockAdminSession();

      const res = await request('GET', '/api/packages?includeInactive=true', undefined, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      // With auth and includeInactive, should return all packages including inactive
      const inactivePackages = data.items.filter((p: Package) => !p.isActive);
      expect(inactivePackages.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter by category', async () => {
      const res = await request('GET', '/api/packages?category=aesthetics');

      expect(res.status).toBe(200);

      const data = await res.json();
      data.items.forEach((pkg: Package) => {
        expect(pkg.category).toBe('aesthetics');
      });
    });

    it('should filter by price range', async () => {
      const res = await request('GET', '/api/packages?minPrice=50000&maxPrice=100000');

      expect(res.status).toBe(200);

      const data = await res.json();
      data.items.forEach((pkg: Package) => {
        expect(pkg.salePrice).toBeGreaterThanOrEqual(50000);
        expect(pkg.salePrice).toBeLessThanOrEqual(100000);
      });
    });
  });

  // ===================
  // Create Package Tests (4 tests)
  // ===================
  describe('POST /api/packages', () => {
    it('should create a new package (admin)', async () => {
      const adminToken = createMockAdminSession();

      const newPackage = {
        name: 'Test Premium Package',
        description: 'A new test package',
        category: 'wellness',
        contents: [
          { type: 'service', itemId: 'svc-test-1', itemName: 'Test Service 1', quantity: 3, unitValue: 10000 },
          { type: 'service', itemId: 'svc-test-2', itemName: 'Test Service 2', quantity: 2, unitValue: 15000 },
        ],
        regularPrice: 60000,
        salePrice: 50000,
        validityDays: 365,
        isActive: true,
        availableForPurchase: true,
      };

      const res = await request('POST', '/api/packages', newPackage, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.package.id).toBeDefined();
      expect(data.package.name).toBe('Test Premium Package');
      expect(data.package.savings).toBe(10000);
      expect(data.package.savingsPercent).toBe(17);
      expect(data.package.contents.length).toBe(2);
    });

    it('should reject creation without authentication', async () => {
      const newPackage = {
        name: 'Unauthorized Package',
        contents: [{ type: 'service', itemId: 'svc-1', itemName: 'Service', quantity: 1, unitValue: 1000 }],
        regularPrice: 1000,
        salePrice: 900,
      };

      const res = await request('POST', '/api/packages', newPackage);

      expect(res.status).toBe(401);
    });

    it('should reject creation for non-admin users', async () => {
      const staffToken = createMockStaffSession();

      const newPackage = {
        name: 'Staff Package',
        contents: [{ type: 'service', itemId: 'svc-1', itemName: 'Service', quantity: 1, unitValue: 1000 }],
        regularPrice: 1000,
        salePrice: 900,
      };

      const res = await request('POST', '/api/packages', newPackage, {
        Authorization: `Bearer ${staffToken}`,
      });

      expect(res.status).toBe(403);
    });

    it('should validate required fields', async () => {
      const adminToken = createMockAdminSession();

      const invalidPackage = {
        name: 'Invalid Package',
        // Missing required fields: contents, regularPrice, salePrice
      };

      const res = await request('POST', '/api/packages', invalidPackage, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Get/Update Package Tests (4 tests)
  // ===================
  describe('GET /api/packages/:id', () => {
    it('should return a single active package (public)', async () => {
      // Get first package ID
      const packageIds = Array.from(packagesStore.keys());
      const activePackageId = packageIds.find(id => packagesStore.get(id)?.isActive);

      const res = await request('GET', `/api/packages/${activePackageId}`);

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.package.id).toBe(activePackageId);
      expect(data.package.isActive).toBe(true);
    });

    it('should return 404 for inactive package (public, no auth)', async () => {
      // Find inactive package
      const packageIds = Array.from(packagesStore.keys());
      const inactivePackageId = packageIds.find(id => !packagesStore.get(id)?.isActive);

      const res = await request('GET', `/api/packages/${inactivePackageId}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/packages/:id', () => {
    it('should update an existing package (admin)', async () => {
      const adminToken = createMockAdminSession();
      const packageIds = Array.from(packagesStore.keys());
      const packageId = packageIds[0];

      const updates = {
        name: 'Updated Package Name',
        salePrice: 55000,
      };

      const res = await request('PUT', `/api/packages/${packageId}`, updates, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.package.name).toBe('Updated Package Name');
      expect(data.package.salePrice).toBe(55000);
    });

    it('should allow owner to update', async () => {
      const ownerToken = createMockOwnerSession();
      const packageIds = Array.from(packagesStore.keys());
      const packageId = packageIds[0];

      const res = await request(
        'PUT',
        `/api/packages/${packageId}`,
        { name: 'Owner Updated' },
        { Authorization: `Bearer ${ownerToken}` }
      );

      expect(res.status).toBe(200);
    });
  });

  // ===================
  // Purchase Package Tests (4 tests)
  // ===================
  describe('POST /api/packages/:id/purchase', () => {
    it('should purchase package for patient', async () => {
      const adminToken = createMockAdminSession();
      const packageIds = Array.from(packagesStore.keys());
      const activePackageId = packageIds.find(id =>
        packagesStore.get(id)?.isActive && packagesStore.get(id)?.availableForPurchase
      );

      const purchaseData = {
        patientId: testPatientId,
        invoiceId: 'inv-001',
        paymentId: 'pay-001',
      };

      const res = await request('POST', `/api/packages/${activePackageId}/purchase`, purchaseData, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.purchase.id).toBeDefined();
      expect(data.purchase.patientId).toBe(testPatientId);
      expect(data.purchase.status).toBe('active');
      expect(data.purchase.items.length).toBeGreaterThan(0);
    });

    it('should reject purchase without authentication', async () => {
      const packageIds = Array.from(packagesStore.keys());
      const packageId = packageIds[0];

      const purchaseData = {
        patientId: testPatientId,
      };

      const res = await request('POST', `/api/packages/${packageId}/purchase`, purchaseData);

      expect(res.status).toBe(401);
    });

    it('should reject purchase of inactive package', async () => {
      const adminToken = createMockAdminSession();
      const packageIds = Array.from(packagesStore.keys());
      const inactivePackageId = packageIds.find(id => !packagesStore.get(id)?.isActive);

      const purchaseData = {
        patientId: testPatientId,
      };

      const res = await request('POST', `/api/packages/${inactivePackageId}/purchase`, purchaseData, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent package', async () => {
      const adminToken = createMockAdminSession();

      const purchaseData = {
        patientId: testPatientId,
      };

      const res = await request('POST', '/api/packages/non-existent-pkg/purchase', purchaseData, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Patient Packages List Tests (3 tests)
  // ===================
  describe('GET /api/packages/patients/:patientId/packages', () => {
    it('should list patient purchased packages', async () => {
      const adminToken = createMockAdminSession();

      const res = await request('GET', `/api/packages/patients/${testPatientId}/packages`, undefined, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
    });

    it('should filter by status', async () => {
      const adminToken = createMockAdminSession();

      const res = await request(
        'GET',
        `/api/packages/patients/${testPatientId}/packages?status=partially_used`,
        undefined,
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(200);

      const data = await res.json();
      data.items.forEach((purchase: PackagePurchase) => {
        expect(purchase.status).toBe('partially_used');
      });
    });

    it('should require authentication', async () => {
      const res = await request('GET', `/api/packages/patients/${testPatientId}/packages`);

      expect(res.status).toBe(401);
    });
  });

  // ===================
  // Redeem Service Tests (5 tests)
  // ===================
  describe('POST /api/packages/patients/:patientId/packages/:purchaseId/redeem', () => {
    let purchaseId: string;
    let itemId: string;

    beforeEach(() => {
      // Get the existing purchase
      const purchases = Array.from(purchasesStore.values());
      const activePurchase = purchases.find(p => p.status === 'partially_used' || p.status === 'active');
      if (activePurchase) {
        purchaseId = activePurchase.id;
        // Find an item with remaining quantity
        const item = activePurchase.items.find(i => i.quantityRemaining > 0);
        if (item) {
          itemId = item.itemId;
        }
      }
    });

    it('should redeem package service', async () => {
      const adminToken = createMockAdminSession();

      const redeemData = {
        itemId,
        quantity: 1,
        appointmentId: 'apt-test-001',
        notes: 'Test redemption',
      };

      const res = await request(
        'POST',
        `/api/packages/patients/${testPatientId}/packages/${purchaseId}/redeem`,
        redeemData,
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.redemption).toBeDefined();
      expect(data.redemption.itemId).toBe(itemId);
      expect(data.redemption.quantity).toBe(1);
    });

    it('should reject redemption of non-existent item', async () => {
      const adminToken = createMockAdminSession();

      const redeemData = {
        itemId: 'non-existent-item',
        quantity: 1,
      };

      const res = await request(
        'POST',
        `/api/packages/patients/${testPatientId}/packages/${purchaseId}/redeem`,
        redeemData,
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('not found');
    });

    it('should reject redemption exceeding remaining quantity', async () => {
      const adminToken = createMockAdminSession();

      const redeemData = {
        itemId,
        quantity: 999, // More than available
      };

      const res = await request(
        'POST',
        `/api/packages/patients/${testPatientId}/packages/${purchaseId}/redeem`,
        redeemData,
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('remaining');
    });

    it('should update purchase status after redemption', async () => {
      const adminToken = createMockAdminSession();

      // Get current purchase
      const purchase = purchasesStore.get(purchaseId);
      const initialStatus = purchase?.status;

      const redeemData = {
        itemId,
        quantity: 1,
      };

      const res = await request(
        'POST',
        `/api/packages/patients/${testPatientId}/packages/${purchaseId}/redeem`,
        redeemData,
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(200);

      const data = await res.json();
      // Status should reflect usage
      expect(['active', 'partially_used', 'fully_used']).toContain(data.purchase.status);
    });

    it('should reject redemption without authentication', async () => {
      const redeemData = {
        itemId,
        quantity: 1,
      };

      const res = await request(
        'POST',
        `/api/packages/patients/${testPatientId}/packages/${purchaseId}/redeem`,
        redeemData
      );

      expect(res.status).toBe(401);
    });
  });

  // ===================
  // Usage History Tests (3 tests)
  // ===================
  describe('GET /api/packages/patients/:patientId/packages/:purchaseId/usage', () => {
    let purchaseId: string;

    beforeEach(() => {
      const purchases = Array.from(purchasesStore.values());
      const purchaseWithRedemptions = purchases.find(p =>
        p.items.some(i => i.redemptions.length > 0)
      );
      if (purchaseWithRedemptions) {
        purchaseId = purchaseWithRedemptions.id;
      }
    });

    it('should return usage history for purchase', async () => {
      const adminToken = createMockAdminSession();

      const res = await request(
        'GET',
        `/api/packages/patients/${testPatientId}/packages/${purchaseId}/usage`,
        undefined,
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.purchaseId).toBe(purchaseId);
      expect(data.summary).toBeDefined();
      expect(data.summary.totalItems).toBeDefined();
      expect(data.summary.totalUsed).toBeDefined();
      expect(data.summary.totalRemaining).toBeDefined();
      expect(data.history).toBeDefined();
      expect(Array.isArray(data.history)).toBe(true);
    });

    it('should include item details in history', async () => {
      const adminToken = createMockAdminSession();

      const res = await request(
        'GET',
        `/api/packages/patients/${testPatientId}/packages/${purchaseId}/usage`,
        undefined,
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(200);

      const data = await res.json();
      if (data.history.length > 0) {
        expect(data.history[0].itemId).toBeDefined();
        expect(data.history[0].itemName).toBeDefined();
        expect(data.history[0].quantity).toBeDefined();
        expect(data.history[0].redeemedAt).toBeDefined();
      }
    });

    it('should return 404 for non-existent purchase', async () => {
      const adminToken = createMockAdminSession();

      const res = await request(
        'GET',
        `/api/packages/patients/${testPatientId}/packages/non-existent-purchase/usage`,
        undefined,
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Expiration Handling Tests (2 tests)
  // ===================
  describe('Expiration Handling', () => {
    it('should mark expired purchase as expired', async () => {
      const adminToken = createMockAdminSession();
      const now = new Date();

      // Create an expired purchase
      const expiredPurchaseId = addMockPurchase({
        packageId: 'pkg-test',
        packageName: 'Expired Package',
        patientId: testPatientId,
        purchaseDate: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
        purchasePrice: 50000,
        validFrom: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
        validUntil: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000), // Expired 35 days ago
        items: [{
          id: 'pitem-expired',
          type: 'service',
          itemId: 'svc-expired',
          itemName: 'Expired Service',
          quantityTotal: 2,
          quantityUsed: 0,
          quantityRemaining: 2,
          redemptions: [],
        }],
        status: 'active', // Will be updated to expired
        createdAt: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
        createdBy: 'system',
      });

      // Get the purchase - status should update
      const res = await request(
        'GET',
        `/api/packages/patients/${testPatientId}/packages/${expiredPurchaseId}`,
        undefined,
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.purchase.status).toBe('expired');
    });

    it('should reject redemption of expired package', async () => {
      const adminToken = createMockAdminSession();
      const now = new Date();

      // Create an expired purchase
      const expiredPurchaseId = addMockPurchase({
        packageId: 'pkg-test',
        packageName: 'Expired Package',
        patientId: testPatientId,
        purchaseDate: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
        purchasePrice: 50000,
        validFrom: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
        validUntil: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000), // Expired
        items: [{
          id: 'pitem-expired-2',
          type: 'service',
          itemId: 'svc-expired-2',
          itemName: 'Expired Service',
          quantityTotal: 2,
          quantityUsed: 0,
          quantityRemaining: 2,
          redemptions: [],
        }],
        status: 'active',
        createdAt: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
        createdBy: 'system',
      });

      const redeemData = {
        itemId: 'svc-expired-2',
        quantity: 1,
      };

      const res = await request(
        'POST',
        `/api/packages/patients/${testPatientId}/packages/${expiredPurchaseId}/redeem`,
        redeemData,
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('expired');
    });
  });

  // ===================
  // Edge Cases Tests (3 tests)
  // ===================
  describe('Edge Cases', () => {
    it('should handle package with restrictions', async () => {
      const adminToken = createMockAdminSession();
      const now = new Date();

      // Create package with max redemptions per visit
      const restrictedPackageId = addMockPackage({
        name: 'Restricted Package',
        description: 'Package with restrictions',
        contents: [{
          id: 'item-restricted',
          type: 'service',
          itemId: 'svc-restricted',
          itemName: 'Restricted Service',
          quantity: 10,
          unitValue: 5000,
        }],
        regularPrice: 50000,
        salePrice: 40000,
        savings: 10000,
        savingsPercent: 20,
        validityDays: 365,
        restrictions: {
          shareable: false,
          transferable: false,
          maxRedemptionsPerVisit: 2,
        },
        isActive: true,
        availableForPurchase: true,
        displayOrder: 10,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
      });

      // Purchase the package
      const purchaseRes = await request(
        'POST',
        `/api/packages/${restrictedPackageId}/purchase`,
        { patientId: testPatientId },
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(purchaseRes.status).toBe(201);

      const purchaseData = await purchaseRes.json();
      const purchaseId = purchaseData.purchase.id;

      // Try to redeem more than max per visit
      const redeemRes = await request(
        'POST',
        `/api/packages/patients/${testPatientId}/packages/${purchaseId}/redeem`,
        { itemId: 'svc-restricted', quantity: 3 },
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(redeemRes.status).toBe(400);
      const redeemData = await redeemRes.json();
      expect(redeemData.message).toContain('per visit');
    });

    it('should calculate savings correctly', async () => {
      const adminToken = createMockAdminSession();

      const newPackage = {
        name: 'Savings Test Package',
        contents: [{ type: 'service', itemId: 'svc-1', itemName: 'Service', quantity: 1, unitValue: 10000 }],
        regularPrice: 100000, // $1000
        salePrice: 75000, // $750 - 25% savings
      };

      const res = await request('POST', '/api/packages', newPackage, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data.package.savings).toBe(25000);
      expect(data.package.savingsPercent).toBe(25);
    });

    it('should handle fully used package', async () => {
      const adminToken = createMockAdminSession();
      const now = new Date();

      // Create a fully used purchase
      const fullyUsedPurchaseId = addMockPurchase({
        packageId: 'pkg-test',
        packageName: 'Fully Used Package',
        patientId: testPatientId,
        purchaseDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        purchasePrice: 50000,
        validFrom: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        validUntil: new Date(now.getTime() + 335 * 24 * 60 * 60 * 1000),
        items: [{
          id: 'pitem-full',
          type: 'service',
          itemId: 'svc-full',
          itemName: 'Fully Used Service',
          quantityTotal: 2,
          quantityUsed: 2,
          quantityRemaining: 0,
          redemptions: [
            { id: 'red-1', itemId: 'svc-full', quantity: 1, redeemedAt: new Date(), redeemedBy: 'staff' },
            { id: 'red-2', itemId: 'svc-full', quantity: 1, redeemedAt: new Date(), redeemedBy: 'staff' },
          ],
        }],
        status: 'fully_used',
        createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: now,
        createdBy: 'system',
      });

      // Try to redeem from fully used package
      const redeemRes = await request(
        'POST',
        `/api/packages/patients/${testPatientId}/packages/${fullyUsedPurchaseId}/redeem`,
        { itemId: 'svc-full', quantity: 1 },
        { Authorization: `Bearer ${adminToken}` }
      );

      expect(redeemRes.status).toBe(400);
      const redeemData = await redeemRes.json();
      expect(redeemData.message).toContain('redeemed');
    });
  });

  // ===================
  // Delete Package Tests
  // ===================
  describe('DELETE /api/packages/:id', () => {
    it('should deactivate a package (soft delete)', async () => {
      const adminToken = createMockAdminSession();
      const packageIds = Array.from(packagesStore.keys());
      const packageId = packageIds.find(id => packagesStore.get(id)?.isActive);

      const res = await request('DELETE', `/api/packages/${packageId}`, undefined, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.message).toContain('deactivated');

      // Verify package is marked inactive
      const pkg = packagesStore.get(packageId!);
      expect(pkg?.isActive).toBe(false);
      expect(pkg?.availableForPurchase).toBe(false);
    });

    it('should return 404 for non-existent package', async () => {
      const adminToken = createMockAdminSession();

      const res = await request('DELETE', '/api/packages/non-existent', undefined, {
        Authorization: `Bearer ${adminToken}`,
      });

      expect(res.status).toBe(404);
    });

    it('should reject deletion for non-admin', async () => {
      const staffToken = createMockStaffSession();
      const packageIds = Array.from(packagesStore.keys());
      const packageId = packageIds[0];

      const res = await request('DELETE', `/api/packages/${packageId}`, undefined, {
        Authorization: `Bearer ${staffToken}`,
      });

      expect(res.status).toBe(403);
    });
  });

  // ===================
  // Pagination Tests
  // ===================
  describe('Pagination', () => {
    it('should paginate package results', async () => {
      const res = await request('GET', '/api/packages?page=1&limit=2');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.items.length).toBeLessThanOrEqual(2);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(2);
      expect(data.hasMore).toBeDefined();
    });

    it('should return hasMore correctly', async () => {
      const res = await request('GET', '/api/packages?page=1&limit=1');

      expect(res.status).toBe(200);

      const data = await res.json();
      if (data.total > 1) {
        expect(data.hasMore).toBe(true);
      }
    });
  });

  // ===================
  // Sorting Tests
  // ===================
  describe('Sorting', () => {
    it('should sort by name ascending', async () => {
      const res = await request('GET', '/api/packages?sortBy=name&sortOrder=asc');

      expect(res.status).toBe(200);

      const data = await res.json();
      for (let i = 1; i < data.items.length; i++) {
        expect(data.items[i - 1].name.toLowerCase() <= data.items[i].name.toLowerCase()).toBe(true);
      }
    });

    it('should sort by salePrice descending', async () => {
      const res = await request('GET', '/api/packages?sortBy=salePrice&sortOrder=desc');

      expect(res.status).toBe(200);

      const data = await res.json();
      for (let i = 1; i < data.items.length; i++) {
        expect(data.items[i - 1].salePrice >= data.items[i].salePrice).toBe(true);
      }
    });
  });
});
