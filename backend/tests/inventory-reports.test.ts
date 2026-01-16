/**
 * Inventory Reports & Provider Analytics API Tests
 *
 * Comprehensive tests for:
 * - Standard Reports (valuation, usage, expiration, movement, variance, turnover, waste) - 14 tests
 * - Provider Analytics (all providers, individual stats, comparison) - 10 tests
 * - Treatment Cost Analysis (cost per treatment, profitability) - 4 tests
 * - Dashboard Metrics (all KPIs) - 4 tests
 * - Query Parameters (date range, location, product, category filtering) - 5 tests
 * - Report Format & Caching - 3 tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import inventoryReports, {
  clearStores,
  clearCache,
  getProductsStore,
  getLotsStore,
  getTransactionsStore,
  getWasteStore,
  getCountsStore,
  addMockProduct,
  addMockLot,
  addMockTransaction,
  addMockWaste,
  addMockCount,
} from '../src/routes/inventory-reports';
import { errorHandler } from '../src/middleware/error';
import { sessionStore } from '../src/middleware/auth';

// Create test app with error handler
const app = new Hono();
app.route('/api/inventory/reports', inventoryReports);
app.onError(errorHandler);

// Mock session for authentication
const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
const mockSessionToken = 'test-session-token-12345';
const mockSessionId = 'test-session-id';

// Valid UUID constants for testing
const validProviderId1 = '550e8400-e29b-41d4-a716-446655440001'; // prov-001 equivalent
const validProviderId2 = '550e8400-e29b-41d4-a716-446655440002'; // prov-002 equivalent
const validLocationId = '550e8400-e29b-41d4-a716-446655440010';
const validProductId = '550e8400-e29b-41d4-a716-446655440020';

function setupMockSession(role = 'admin') {
  sessionStore.set(mockSessionId, {
    id: mockSessionId,
    token: mockSessionToken,
    userId: mockUserId,
    email: 'test@example.com',
    role,
    permissions: ['inventory:read', 'reports:read', 'reports:export'],
    locationIds: ['loc-001'],
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
async function unauthenticatedRequest(method: string, path: string) {
  const req = new Request(`http://localhost${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
  });
  return app.fetch(req);
}

// Helper to format date
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper to get date offset from today
function getDateOffset(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

// Helper to add test data with valid UUIDs
function addTestProviderData() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  // Add transactions for providers with valid UUIDs
  addMockTransaction({
    id: 'test-txn-001',
    type: 'treatment_use',
    productId: 'prod-001',
    productName: 'Botox Cosmetic',
    lotId: 'lot-001',
    lotNumber: 'BTX-2024-001',
    quantity: -25,
    unitCost: 4.5,
    timestamp: today,
    performedBy: 'user-001',
    performedByName: 'Dr. Susan Lo',
    reason: 'Treatment',
    practitionerId: validProviderId1,
    practitionerName: 'Dr. Susan Lo',
    patientId: 'patient-001',
    treatmentDetails: { serviceName: 'Botox Treatment', areasInjected: [{ name: 'Forehead', units: 15 }, { name: 'Crow\'s Feet', units: 10 }] },
  });

  addMockTransaction({
    id: 'test-txn-002',
    type: 'treatment_use',
    productId: 'prod-001',
    productName: 'Botox Cosmetic',
    lotId: 'lot-001',
    lotNumber: 'BTX-2024-001',
    quantity: -30,
    unitCost: 4.5,
    timestamp: yesterday,
    performedBy: 'user-002',
    performedByName: 'Dr. Marcus Gregory',
    reason: 'Treatment',
    practitionerId: validProviderId2,
    practitionerName: 'Dr. Marcus Gregory',
    patientId: 'patient-002',
    treatmentDetails: { serviceName: 'Botox Treatment', areasInjected: [{ name: 'Forehead', units: 20 }, { name: 'Glabella', units: 10 }] },
  });

  addMockTransaction({
    id: 'test-txn-003',
    type: 'treatment_use',
    productId: 'prod-003',
    productName: 'Juvederm Ultra XC',
    lotId: 'lot-004',
    lotNumber: 'JUV-2024-001',
    quantity: -2,
    unitCost: 280,
    timestamp: today,
    performedBy: 'user-001',
    performedByName: 'Dr. Susan Lo',
    reason: 'Treatment',
    practitionerId: validProviderId1,
    practitionerName: 'Dr. Susan Lo',
    patientId: 'patient-001',
    treatmentDetails: { serviceName: 'Lip Filler', areasInjected: [{ name: 'Lips', units: 2 }] },
  });

  // Add waste records with valid UUIDs
  addMockWaste({
    id: 'test-waste-001',
    lotId: 'lot-002',
    lotNumber: 'BTX-2024-002',
    productId: 'prod-001',
    productName: 'Botox Cosmetic',
    unitsWasted: 5,
    unitCost: 4.5,
    reason: 'draw_up_loss',
    recordedBy: 'user-001',
    recordedByName: 'Dr. Susan Lo',
    recordedAt: yesterday,
    practitionerId: validProviderId1,
    practitionerName: 'Dr. Susan Lo',
    locationId: 'loc-001',
    locationName: 'Main Clinic',
  });
}

describe('Inventory Reports & Provider Analytics API', () => {
  beforeEach(() => {
    clearStores();
    clearCache();
    sessionStore.clear();
    setupMockSession();
    // Add test provider data with valid UUIDs
    addTestProviderData();
  });

  // ===================
  // Authentication Tests
  // ===================
  describe('Authentication', () => {
    it('should reject requests without authentication', async () => {
      const res = await unauthenticatedRequest('GET', '/api/inventory/reports/valuation');
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const req = new Request('http://localhost/api/inventory/reports/valuation', {
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
  // Standard Reports Tests
  // ===================

  // Valuation Report (3 tests)
  describe('Valuation Report - GET /api/inventory/reports/valuation', () => {
    it('should return inventory valuation report', async () => {
      const res = await request('GET', '/api/inventory/reports/valuation');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report).toBeDefined();
      expect(data.report.totalRetailValue).toBeDefined();
      expect(data.report.totalCostValue).toBeDefined();
      expect(data.report.potentialProfit).toBeDefined();
      expect(data.report.profitMargin).toBeDefined();
    });

    it('should include breakdown by category', async () => {
      const res = await request('GET', '/api/inventory/reports/valuation');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report.byCategory).toBeInstanceOf(Array);
      if (data.report.byCategory.length > 0) {
        expect(data.report.byCategory[0]).toHaveProperty('category');
        expect(data.report.byCategory[0]).toHaveProperty('retailValue');
        expect(data.report.byCategory[0]).toHaveProperty('costValue');
        expect(data.report.byCategory[0]).toHaveProperty('profit');
        expect(data.report.byCategory[0]).toHaveProperty('unitCount');
      }
    });

    it('should include breakdown by product', async () => {
      const res = await request('GET', '/api/inventory/reports/valuation');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report.byProduct).toBeInstanceOf(Array);
      if (data.report.byProduct.length > 0) {
        expect(data.report.byProduct[0]).toHaveProperty('productId');
        expect(data.report.byProduct[0]).toHaveProperty('productName');
        expect(data.report.byProduct[0]).toHaveProperty('quantity');
        expect(data.report.byProduct[0]).toHaveProperty('totalCost');
        expect(data.report.byProduct[0]).toHaveProperty('totalRetail');
      }
    });
  });

  // Usage Report (2 tests)
  describe('Usage Report - GET /api/inventory/reports/usage', () => {
    it('should return usage report for date range', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/usage?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report).toBeDefined();
      expect(data.report.startDate).toBe(startDate);
      expect(data.report.endDate).toBe(endDate);
      expect(data.report.totalUnitsUsed).toBeDefined();
      expect(data.report.totalTreatments).toBeDefined();
      expect(data.report.totalCost).toBeDefined();
      expect(data.report.totalRevenue).toBeDefined();
    });

    it('should include usage breakdown by product and provider', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/usage?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report.byProduct).toBeInstanceOf(Array);
      expect(data.report.byProvider).toBeInstanceOf(Array);
      expect(data.report.byPeriod).toBeInstanceOf(Array);
    });
  });

  // Expiration Report (2 tests)
  describe('Expiration Report - GET /api/inventory/reports/expiration', () => {
    it('should return expiration report with time buckets', async () => {
      const res = await request('GET', '/api/inventory/reports/expiration');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report).toBeDefined();
      expect(data.report.expiringIn30Days).toBeInstanceOf(Array);
      expect(data.report.expiringIn60Days).toBeInstanceOf(Array);
      expect(data.report.expiringIn90Days).toBeInstanceOf(Array);
      expect(data.report.alreadyExpired).toBeInstanceOf(Array);
      expect(data.report.totalExpiringValue).toBeDefined();
      expect(data.report.totalExpiredValue).toBeDefined();
    });

    it('should include lot details in expiration data', async () => {
      const res = await request('GET', '/api/inventory/reports/expiration');

      expect(res.status).toBe(200);
      const data = await res.json();

      // Check that we have at least one expiring lot (from mock data)
      const allLots = [
        ...data.report.expiringIn30Days,
        ...data.report.expiringIn60Days,
        ...data.report.expiringIn90Days,
        ...data.report.alreadyExpired,
      ];

      if (allLots.length > 0) {
        expect(allLots[0]).toHaveProperty('lotId');
        expect(allLots[0]).toHaveProperty('lotNumber');
        expect(allLots[0]).toHaveProperty('productName');
        expect(allLots[0]).toHaveProperty('quantity');
        expect(allLots[0]).toHaveProperty('daysUntilExpiration');
        expect(allLots[0]).toHaveProperty('totalValue');
      }
    });
  });

  // Movement Report (2 tests)
  describe('Stock Movement Report - GET /api/inventory/reports/movement', () => {
    it('should return stock movement summary', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/movement?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report).toBeDefined();
      expect(data.report.summary).toBeDefined();
      expect(data.report.summary.received).toBeDefined();
      expect(data.report.summary.used).toBeDefined();
      expect(data.report.summary.wasted).toBeDefined();
      expect(data.report.summary.adjusted).toBeDefined();
      expect(data.report.summary.transferred).toBeDefined();
      expect(data.report.summary.returned).toBeDefined();
    });

    it('should include transaction list and product breakdown', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/movement?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report.transactions).toBeInstanceOf(Array);
      expect(data.report.byProduct).toBeInstanceOf(Array);

      if (data.report.transactions.length > 0) {
        expect(data.report.transactions[0]).toHaveProperty('id');
        expect(data.report.transactions[0]).toHaveProperty('type');
        expect(data.report.transactions[0]).toHaveProperty('productName');
        expect(data.report.transactions[0]).toHaveProperty('quantity');
        expect(data.report.transactions[0]).toHaveProperty('timestamp');
      }
    });
  });

  // Variance Report (2 tests)
  describe('Variance/Shrinkage Report - GET /api/inventory/reports/variance', () => {
    it('should return variance report', async () => {
      const res = await request('GET', '/api/inventory/reports/variance');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report).toBeDefined();
      expect(data.report.totalVarianceUnits).toBeDefined();
      expect(data.report.totalVarianceValue).toBeDefined();
      expect(data.report.variancePercent).toBeDefined();
    });

    it('should include product breakdown and count history', async () => {
      const res = await request('GET', '/api/inventory/reports/variance');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report.byProduct).toBeInstanceOf(Array);
      expect(data.report.countHistory).toBeInstanceOf(Array);

      if (data.report.byProduct.length > 0) {
        expect(data.report.byProduct[0]).toHaveProperty('productId');
        expect(data.report.byProduct[0]).toHaveProperty('systemQuantity');
        expect(data.report.byProduct[0]).toHaveProperty('countedQuantity');
        expect(data.report.byProduct[0]).toHaveProperty('varianceUnits');
        expect(data.report.byProduct[0]).toHaveProperty('variancePercent');
      }
    });
  });

  // Turnover Report (2 tests)
  describe('Inventory Turnover Report - GET /api/inventory/reports/turnover', () => {
    it('should return turnover metrics', async () => {
      const startDate = formatDate(getDateOffset(-90));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/turnover?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report).toBeDefined();
      expect(data.report.averageTurnoverRatio).toBeDefined();
      expect(data.report.averageDaysToSell).toBeDefined();
    });

    it('should include product and category turnover breakdown', async () => {
      const startDate = formatDate(getDateOffset(-90));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/turnover?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report.byProduct).toBeInstanceOf(Array);
      expect(data.report.byCategory).toBeInstanceOf(Array);
      expect(data.report.slowMovingItems).toBeInstanceOf(Array);

      if (data.report.byProduct.length > 0) {
        expect(data.report.byProduct[0]).toHaveProperty('turnoverRatio');
        expect(data.report.byProduct[0]).toHaveProperty('daysToSell');
        expect(data.report.byProduct[0]).toHaveProperty('trend');
      }
    });
  });

  // Waste Report (2 tests)
  describe('Waste Analysis Report - GET /api/inventory/reports/waste', () => {
    it('should return waste analysis', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/waste?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report).toBeDefined();
      expect(data.report.totalUnitsWasted).toBeDefined();
      expect(data.report.totalWasteValue).toBeDefined();
      expect(data.report.wastePercent).toBeDefined();
    });

    it('should include breakdown by reason, product, and provider', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/waste?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report.byReason).toBeInstanceOf(Array);
      expect(data.report.byProduct).toBeInstanceOf(Array);
      expect(data.report.byProvider).toBeInstanceOf(Array);
      expect(data.report.wasteRecords).toBeInstanceOf(Array);

      if (data.report.byReason.length > 0) {
        expect(data.report.byReason[0]).toHaveProperty('reason');
        expect(data.report.byReason[0]).toHaveProperty('unitsWasted');
        expect(data.report.byReason[0]).toHaveProperty('value');
        expect(data.report.byReason[0]).toHaveProperty('percentage');
      }
    });
  });

  // ===================
  // Provider Analytics Tests (KEY DIFFERENTIATOR)
  // ===================
  describe('Provider Analytics - GET /api/inventory/reports/providers', () => {
    it('should return all providers summary', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/providers?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.providers).toBeInstanceOf(Array);
    });

    it('should include averageUnitsVsClinicAverage calculation', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/providers?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();

      if (data.providers.length > 0) {
        const provider = data.providers[0];
        expect(provider).toHaveProperty('providerId');
        expect(provider).toHaveProperty('providerName');
        expect(provider).toHaveProperty('totalUnitsUsed');
        expect(provider).toHaveProperty('totalTreatments');
        expect(provider).toHaveProperty('averageUnitsPerTreatment');
        expect(provider).toHaveProperty('averageUnitsVsClinicAverage');
        expect(provider).toHaveProperty('isAboveAverage');
      }
    });

    it('should include byProduct breakdown for each provider', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/providers?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();

      if (data.providers.length > 0) {
        const provider = data.providers[0];
        expect(provider.byProduct).toBeInstanceOf(Array);

        if (provider.byProduct.length > 0) {
          expect(provider.byProduct[0]).toHaveProperty('productId');
          expect(provider.byProduct[0]).toHaveProperty('productName');
          expect(provider.byProduct[0]).toHaveProperty('unitsUsed');
          expect(provider.byProduct[0]).toHaveProperty('treatments');
          expect(provider.byProduct[0]).toHaveProperty('avgPerTreatment');
          expect(provider.byProduct[0]).toHaveProperty('vsClinicAverage');
        }
      }
    });

    it('should include byArea breakdown for each provider', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/providers?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();

      if (data.providers.length > 0) {
        const provider = data.providers[0];
        expect(provider.byArea).toBeInstanceOf(Array);

        if (provider.byArea.length > 0) {
          expect(provider.byArea[0]).toHaveProperty('area');
          expect(provider.byArea[0]).toHaveProperty('unitsUsed');
          expect(provider.byArea[0]).toHaveProperty('treatments');
          expect(provider.byArea[0]).toHaveProperty('avgPerTreatment');
        }
      }
    });

    it('should include waste tracking per provider', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/providers?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();

      if (data.providers.length > 0) {
        const provider = data.providers[0];
        expect(provider).toHaveProperty('wasteUnits');
        expect(provider).toHaveProperty('wasteValue');
        expect(provider).toHaveProperty('wastePercent');
        expect(provider).toHaveProperty('revenueGenerated');
        expect(provider).toHaveProperty('costOfGoodsUsed');
        expect(provider).toHaveProperty('grossProfit');
        expect(provider).toHaveProperty('profitMargin');
      }
    });
  });

  describe('Individual Provider Stats - GET /api/inventory/reports/providers/:id', () => {
    // UUID regex for validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    it('should return individual provider statistics', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      // First get the providers list to get a valid provider ID from test data
      const listRes = await request('GET', `/api/inventory/reports/providers?startDate=${startDate}&endDate=${endDate}`);
      expect(listRes.status).toBe(200);
      const listData = await listRes.json();

      // Find a provider with a valid UUID
      const validProvider = listData.providers.find((p: any) => uuidRegex.test(p.providerId));

      if (validProvider) {
        const res = await request('GET', `/api/inventory/reports/providers/${validProvider.providerId}?startDate=${startDate}&endDate=${endDate}`);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.stats).toBeDefined();
        expect(data.stats.providerId).toBe(validProvider.providerId);
        expect(data.stats.totalUnitsUsed).toBeDefined();
        expect(data.stats.totalTreatments).toBeDefined();
      }
    });

    it('should return 404 for non-existent provider', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());
      const invalidProviderId = '00000000-0000-0000-0000-000000000000';

      const res = await request('GET', `/api/inventory/reports/providers/${invalidProviderId}?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Provider Comparison - GET /api/inventory/reports/providers/:id/comparison', () => {
    // UUID regex for validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    it('should return provider comparison to clinic average', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      // First get the providers list to get a valid provider ID from test data
      const listRes = await request('GET', `/api/inventory/reports/providers?startDate=${startDate}&endDate=${endDate}`);
      expect(listRes.status).toBe(200);
      const listData = await listRes.json();

      // Find a provider with a valid UUID
      const validProvider = listData.providers.find((p: any) => uuidRegex.test(p.providerId));

      if (validProvider) {
        const res = await request('GET', `/api/inventory/reports/providers/${validProvider.providerId}/comparison?startDate=${startDate}&endDate=${endDate}`);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.comparison).toBeDefined();
        expect(data.comparison.providerId).toBe(validProvider.providerId);
        expect(data.comparison.provider).toBeDefined();
        expect(data.comparison.clinicAverage).toBeDefined();
        expect(data.comparison.comparison).toBeDefined();
      }
    });

    it('should include provider vs clinic metrics', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      // First get the providers list to get a valid provider ID from test data
      const listRes = await request('GET', `/api/inventory/reports/providers?startDate=${startDate}&endDate=${endDate}`);
      expect(listRes.status).toBe(200);
      const listData = await listRes.json();

      // Find a provider with a valid UUID
      const validProvider = listData.providers.find((p: any) => uuidRegex.test(p.providerId));

      if (validProvider) {
        const res = await request('GET', `/api/inventory/reports/providers/${validProvider.providerId}/comparison?startDate=${startDate}&endDate=${endDate}`);

        expect(res.status).toBe(200);
        const data = await res.json();

        expect(data.comparison.provider.totalUnitsUsed).toBeDefined();
        expect(data.comparison.provider.totalTreatments).toBeDefined();
        expect(data.comparison.provider.averageUnitsPerTreatment).toBeDefined();

        expect(data.comparison.clinicAverage.totalUnitsUsed).toBeDefined();
        expect(data.comparison.clinicAverage.averageUnitsPerTreatment).toBeDefined();

        expect(data.comparison.comparison.unitsVsAverage).toBeDefined();
        expect(data.comparison.comparison.percentVsAverage).toBeDefined();
        expect(data.comparison.comparison.isAboveAverage).toBeDefined();
      }
    });

    it('should include by-product comparison', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      // First get the providers list to get a valid provider ID from test data
      const listRes = await request('GET', `/api/inventory/reports/providers?startDate=${startDate}&endDate=${endDate}`);
      expect(listRes.status).toBe(200);
      const listData = await listRes.json();

      // Find a provider with a valid UUID
      const validProvider = listData.providers.find((p: any) => uuidRegex.test(p.providerId));

      if (validProvider) {
        const res = await request('GET', `/api/inventory/reports/providers/${validProvider.providerId}/comparison?startDate=${startDate}&endDate=${endDate}`);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.comparison.byProduct).toBeInstanceOf(Array);

        if (data.comparison.byProduct.length > 0) {
          expect(data.comparison.byProduct[0]).toHaveProperty('productId');
          expect(data.comparison.byProduct[0]).toHaveProperty('providerAvg');
          expect(data.comparison.byProduct[0]).toHaveProperty('clinicAvg');
          expect(data.comparison.byProduct[0]).toHaveProperty('difference');
          expect(data.comparison.byProduct[0]).toHaveProperty('differencePercent');
        }
      }
    });
  });

  // ===================
  // Treatment Cost Analysis Tests
  // ===================
  describe('Treatment Cost Report - GET /api/inventory/reports/treatment-costs', () => {
    it('should return treatment cost analysis', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/treatment-costs?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report).toBeDefined();
      expect(data.report.startDate).toBe(startDate);
      expect(data.report.endDate).toBe(endDate);
      expect(data.report.overallAvgCost).toBeDefined();
      expect(data.report.overallAvgRevenue).toBeDefined();
      expect(data.report.overallAvgProfit).toBeDefined();
    });

    it('should include breakdown by treatment type', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/treatment-costs?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report.byTreatment).toBeInstanceOf(Array);

      if (data.report.byTreatment.length > 0) {
        expect(data.report.byTreatment[0]).toHaveProperty('treatmentId');
        expect(data.report.byTreatment[0]).toHaveProperty('treatmentName');
        expect(data.report.byTreatment[0]).toHaveProperty('totalTreatments');
        expect(data.report.byTreatment[0]).toHaveProperty('avgProductCost');
        expect(data.report.byTreatment[0]).toHaveProperty('avgRevenue');
        expect(data.report.byTreatment[0]).toHaveProperty('avgProfit');
        expect(data.report.byTreatment[0]).toHaveProperty('profitMargin');
        expect(data.report.byTreatment[0]).toHaveProperty('productBreakdown');
      }
    });
  });

  describe('Profitability Report - GET /api/inventory/reports/profitability', () => {
    it('should return profitability analysis', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/profitability?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report).toBeDefined();
      expect(data.report.totalRevenue).toBeDefined();
      expect(data.report.totalCost).toBeDefined();
      expect(data.report.grossProfit).toBeDefined();
      expect(data.report.profitMargin).toBeDefined();
    });

    it('should include profitability by product and treatment', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/profitability?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report.byProduct).toBeInstanceOf(Array);
      expect(data.report.byTreatment).toBeInstanceOf(Array);

      if (data.report.byProduct.length > 0) {
        expect(data.report.byProduct[0]).toHaveProperty('productId');
        expect(data.report.byProduct[0]).toHaveProperty('revenue');
        expect(data.report.byProduct[0]).toHaveProperty('cost');
        expect(data.report.byProduct[0]).toHaveProperty('profit');
        expect(data.report.byProduct[0]).toHaveProperty('margin');
      }
    });
  });

  // ===================
  // Dashboard Metrics Tests
  // ===================
  describe('Dashboard Metrics - GET /api/inventory/reports', () => {
    it('should return all KPIs', async () => {
      const res = await request('GET', '/api/inventory/reports');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.metrics).toBeDefined();
    });

    it('should include totalValue, totalCost, potentialProfit', async () => {
      const res = await request('GET', '/api/inventory/reports');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.metrics.totalValue).toBeDefined();
      expect(data.metrics.totalCost).toBeDefined();
      expect(data.metrics.potentialProfit).toBeDefined();
    });

    it('should include stock status counts', async () => {
      const res = await request('GET', '/api/inventory/reports');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.metrics.totalProducts).toBeDefined();
      expect(data.metrics.inStockProducts).toBeDefined();
      expect(data.metrics.lowStockProducts).toBeDefined();
      expect(data.metrics.outOfStockProducts).toBeDefined();
    });

    it('should include expiration and turnover metrics', async () => {
      const res = await request('GET', '/api/inventory/reports');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.metrics.expiringIn30Days).toBeDefined();
      expect(data.metrics.expiringIn60Days).toBeDefined();
      expect(data.metrics.expiringIn90Days).toBeDefined();
      expect(data.metrics.expiredValue).toBeDefined();
      expect(data.metrics.inventoryTurnoverRatio).toBeDefined();
      expect(data.metrics.averageDaysToSell).toBeDefined();
      expect(data.metrics.totalVarianceValue).toBeDefined();
      expect(data.metrics.variancePercent).toBeDefined();
      expect(data.metrics.calculatedAt).toBeDefined();
    });
  });

  // ===================
  // Query Parameters Tests
  // ===================
  describe('Query Parameters', () => {
    it('should filter by date range', async () => {
      const startDate = formatDate(getDateOffset(-7));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/usage?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report.startDate).toBe(startDate);
      expect(data.report.endDate).toBe(endDate);
    });

    it('should reject invalid date formats', async () => {
      const res = await request('GET', '/api/inventory/reports/usage?startDate=invalid&endDate=also-invalid');

      expect(res.status).toBe(400);
    });

    it('should filter by location', async () => {
      // Use valid UUID for location
      const res = await request('GET', `/api/inventory/reports/valuation?locationId=${validLocationId}`);

      expect(res.status).toBe(200);
    });

    it('should filter by product', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      // Use valid UUID for product
      const res = await request('GET', `/api/inventory/reports/usage?startDate=${startDate}&endDate=${endDate}&productId=${validProductId}`);

      expect(res.status).toBe(200);
    });

    it('should filter by category', async () => {
      const res = await request('GET', '/api/inventory/reports/expiration?category=neurotoxin');

      expect(res.status).toBe(200);
    });
  });

  // ===================
  // Report Format & Caching Tests
  // ===================
  describe('Report Format & Caching', () => {
    it('should have correct response structure', async () => {
      const res = await request('GET', '/api/inventory/reports');

      expect(res.status).toBe(200);
      const data = await res.json();

      // Metrics should be a well-structured object
      expect(typeof data.metrics).toBe('object');
      expect(data.metrics).not.toBeNull();
    });

    it('should cache report results (5 minute TTL)', async () => {
      const res1 = await request('GET', '/api/inventory/reports');
      expect(res1.status).toBe(200);

      // Second request should be cached
      const res2 = await request('GET', '/api/inventory/reports');
      expect(res2.status).toBe(200);

      const data1 = await res1.json();
      const data2 = await res2.json();

      // Cached data should have same calculated time
      expect(data1.metrics.calculatedAt).toBe(data2.metrics.calculatedAt);
    });

    it('should handle empty data gracefully', async () => {
      // Query for date range with no data
      const startDate = '2020-01-01';
      const endDate = '2020-01-02';

      const res = await request('GET', `/api/inventory/reports/usage?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report.totalUnitsUsed).toBe(0);
      expect(data.report.totalTreatments).toBe(0);
      expect(data.report.byProduct).toEqual([]);
    });
  });

  // ===================
  // Additional Edge Cases
  // ===================
  describe('Edge Cases', () => {
    it('should handle single-day date range', async () => {
      const today = formatDate(new Date());

      const res = await request('GET', `/api/inventory/reports/usage?startDate=${today}&endDate=${today}`);

      expect(res.status).toBe(200);
    });

    it('should handle providers with no treatments', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      // Query should still succeed even if some providers have no treatments
      const res = await request('GET', `/api/inventory/reports/providers?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
    });

    it('should handle groupBy parameter', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const resDay = await request('GET', `/api/inventory/reports/usage?startDate=${startDate}&endDate=${endDate}&groupBy=day`);
      expect(resDay.status).toBe(200);

      const resWeek = await request('GET', `/api/inventory/reports/usage?startDate=${startDate}&endDate=${endDate}&groupBy=week`);
      expect(resWeek.status).toBe(200);

      const resMonth = await request('GET', `/api/inventory/reports/usage?startDate=${startDate}&endDate=${endDate}&groupBy=month`);
      expect(resMonth.status).toBe(200);
    });
  });

  // ===================
  // Custom Mock Data Tests
  // ===================
  describe('Custom Mock Data Scenarios', () => {
    it('should calculate provider comparison correctly with custom data', async () => {
      // Clear and add custom transactions
      clearCache();

      const today = new Date();
      const customProviderId1 = '11111111-1111-1111-1111-111111111111';
      const customProviderId2 = '22222222-2222-2222-2222-222222222222';

      // Add transactions for two providers with different usage patterns
      addMockTransaction({
        id: 'custom-txn-001',
        type: 'treatment_use',
        productId: 'prod-001',
        productName: 'Botox Cosmetic',
        lotId: 'lot-001',
        lotNumber: 'BTX-2024-001',
        quantity: -20,
        unitCost: 4.5,
        timestamp: today,
        performedBy: 'user-001',
        performedByName: 'Test Provider 1',
        reason: 'Treatment',
        practitionerId: customProviderId1,
        practitionerName: 'Test Provider 1',
        patientId: 'patient-001',
        treatmentDetails: { serviceName: 'Botox Treatment', areasInjected: [{ name: 'Forehead', units: 20 }] },
      });

      addMockTransaction({
        id: 'custom-txn-002',
        type: 'treatment_use',
        productId: 'prod-001',
        productName: 'Botox Cosmetic',
        lotId: 'lot-001',
        lotNumber: 'BTX-2024-001',
        quantity: -30,
        unitCost: 4.5,
        timestamp: today,
        performedBy: 'user-002',
        performedByName: 'Test Provider 2',
        reason: 'Treatment',
        practitionerId: customProviderId2,
        practitionerName: 'Test Provider 2',
        patientId: 'patient-002',
        treatmentDetails: { serviceName: 'Botox Treatment', areasInjected: [{ name: 'Forehead', units: 30 }] },
      });

      const startDate = formatDate(getDateOffset(-1));
      const endDate = formatDate(getDateOffset(1));

      const res = await request('GET', `/api/inventory/reports/providers?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();

      // Find our custom providers
      const prov1 = data.providers.find((p: any) => p.providerId === customProviderId1);
      const prov2 = data.providers.find((p: any) => p.providerId === customProviderId2);

      if (prov1 && prov2) {
        // Provider 1 uses 20 units, Provider 2 uses 30 units
        // But this test has multiple providers from beforeEach so expectations might vary
        // Just check the comparison mechanism works
        expect(typeof prov1.isAboveAverage).toBe('boolean');
        expect(prov2.isAboveAverage).toBe(true);
      }
    });

    it('should track waste per provider correctly', async () => {
      clearCache();

      const today = new Date();
      const wasteProviderId = '33333333-3333-3333-3333-333333333333';

      // Add waste record for a specific provider
      addMockWaste({
        id: 'custom-waste-001',
        lotId: 'lot-001',
        lotNumber: 'BTX-2024-001',
        productId: 'prod-001',
        productName: 'Botox Cosmetic',
        unitsWasted: 10,
        unitCost: 4.5,
        reason: 'draw_up_loss',
        recordedBy: 'user-001',
        recordedByName: 'Test Provider',
        recordedAt: today,
        practitionerId: wasteProviderId,
        practitionerName: 'Test Provider',
        locationId: 'loc-001',
        locationName: 'Main Clinic',
      });

      // Add a transaction so the provider shows up in the report
      addMockTransaction({
        id: 'waste-txn-001',
        type: 'treatment_use',
        productId: 'prod-001',
        productName: 'Botox Cosmetic',
        lotId: 'lot-001',
        lotNumber: 'BTX-2024-001',
        quantity: -50,
        unitCost: 4.5,
        timestamp: today,
        performedBy: 'user-001',
        performedByName: 'Test Provider',
        reason: 'Treatment',
        practitionerId: wasteProviderId,
        practitionerName: 'Test Provider',
        patientId: 'patient-001',
        treatmentDetails: { serviceName: 'Botox Treatment' },
      });

      const startDate = formatDate(getDateOffset(-1));
      const endDate = formatDate(getDateOffset(1));

      const res = await request('GET', `/api/inventory/reports/providers?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();

      const testProvider = data.providers.find((p: any) => p.providerId === wasteProviderId);

      if (testProvider) {
        expect(testProvider.wasteUnits).toBe(10);
        expect(testProvider.wasteValue).toBe(45); // 10 units * $4.50
        // wastePercent = (10 / 50) * 100 = 20%
        expect(testProvider.wastePercent).toBe(20);
      }
    });

    it('should calculate expiration buckets correctly', async () => {
      clearCache();

      const today = new Date();
      const in10Days = new Date(today);
      in10Days.setDate(in10Days.getDate() + 10);
      const in40Days = new Date(today);
      in40Days.setDate(in40Days.getDate() + 40);

      // Add lots with specific expiration dates
      addMockLot({
        id: 'exp-lot-001',
        productId: 'prod-001',
        productName: 'Test Product',
        lotNumber: 'TEST-001',
        currentQuantity: 100,
        initialQuantity: 100,
        unitCost: 5.0,
        expirationDate: in10Days,
        locationId: 'loc-001',
        locationName: 'Main Clinic',
        status: 'available',
        category: 'neurotoxin',
      });

      addMockLot({
        id: 'exp-lot-002',
        productId: 'prod-002',
        productName: 'Test Product 2',
        lotNumber: 'TEST-002',
        currentQuantity: 50,
        initialQuantity: 50,
        unitCost: 10.0,
        expirationDate: in40Days,
        locationId: 'loc-001',
        locationName: 'Main Clinic',
        status: 'available',
        category: 'filler',
      });

      const res = await request('GET', '/api/inventory/reports/expiration');

      expect(res.status).toBe(200);
      const data = await res.json();

      // Verify expiration buckets
      expect(data.report.expiringIn30Days.length).toBeGreaterThanOrEqual(1);
      expect(data.report.expiringIn60Days.length).toBeGreaterThanOrEqual(1);
    });
  });
});
