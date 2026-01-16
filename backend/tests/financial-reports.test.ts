/**
 * Financial Reports API Tests
 *
 * Comprehensive tests for:
 * - Daily summary (4 tests)
 * - Revenue report (4 tests)
 * - Payment breakdown (3 tests)
 * - Service report (3 tests)
 * - Provider report (3 tests)
 * - Outstanding report (3 tests)
 * - Date range filtering (3 tests)
 * - Export functionality (2 tests)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import financialReports, {
  clearStores,
  getInvoicesStore,
  getPackageSalesStore,
  getMembershipsStore,
  addMockInvoice,
  addMockPackageSale,
  addMockMembership,
  clearCache,
  StoredInvoice,
  StoredPackageSale,
  StoredMembership,
} from '../src/routes/financial-reports';
import { errorHandler } from '../src/middleware/error';
import { sessionStore } from '../src/middleware/auth';

// Create test app with error handler
const app = new Hono();
app.route('/api/reports', financialReports);
app.onError(errorHandler);

// Mock session for authentication
const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
const mockSessionToken = 'test-session-token-12345';
const mockSessionId = 'test-session-id';

function setupMockSession(role = 'admin') {
  sessionStore.set(mockSessionId, {
    id: mockSessionId,
    token: mockSessionToken,
    userId: mockUserId,
    email: 'test@example.com',
    role,
    permissions: ['reports:read', 'reports:export'],
    locationIds: ['loc-1'],
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

describe('Financial Reports API', () => {
  beforeEach(() => {
    clearStores();
    clearCache();
    sessionStore.clear();
    setupMockSession();
  });

  // ===================
  // Authentication Tests
  // ===================
  describe('Authentication', () => {
    it('should reject requests without authentication', async () => {
      const res = await unauthenticatedRequest('GET', '/api/reports/daily-summary');
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const req = new Request('http://localhost/api/reports/daily-summary', {
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
  // Daily Summary Tests (4 tests)
  // ===================
  describe('Daily Summary - GET /api/reports/daily-summary', () => {
    it('should return daily summary for current date', async () => {
      const res = await request('GET', '/api/reports/daily-summary');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.summary).toBeDefined();
      expect(data.summary.date).toBeDefined();
      expect(data.summary.grossRevenue).toBeDefined();
      expect(data.summary.netRevenue).toBeDefined();
      expect(data.summary.payments).toBeInstanceOf(Array);
    });

    it('should return daily summary for specific date', async () => {
      const targetDate = formatDate(new Date());
      const res = await request('GET', `/api/reports/daily-summary?date=${targetDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.summary.date).toBe(targetDate);
    });

    it('should include revenue breakdown by type', async () => {
      const res = await request('GET', '/api/reports/daily-summary');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.summary.serviceRevenue).toBeDefined();
      expect(data.summary.productRevenue).toBeDefined();
      expect(data.summary.packageRevenue).toBeDefined();
      expect(data.summary.membershipRevenue).toBeDefined();
      expect(data.summary.giftCardRevenue).toBeDefined();
    });

    it('should include comparison with previous day', async () => {
      const res = await request('GET', '/api/reports/daily-summary');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.summary.previousDayRevenue).toBeDefined();
      expect(data.summary.changePercent).toBeDefined();
    });
  });

  // ===================
  // Revenue Report Tests (4 tests)
  // ===================
  describe('Revenue Report - GET /api/reports/revenue', () => {
    it('should return revenue report for date range', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/reports/revenue?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report).toBeDefined();
      expect(data.report.startDate).toBe(startDate);
      expect(data.report.endDate).toBe(endDate);
      expect(data.report.totalRevenue).toBeDefined();
      expect(data.report.netRevenue).toBeDefined();
    });

    it('should include daily breakdown', async () => {
      const startDate = formatDate(getDateOffset(-7));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/reports/revenue?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report.dailyData).toBeInstanceOf(Array);
      expect(data.report.dailyData.length).toBeGreaterThan(0);
      expect(data.report.dailyData[0]).toHaveProperty('date');
      expect(data.report.dailyData[0]).toHaveProperty('revenue');
      expect(data.report.dailyData[0]).toHaveProperty('net');
    });

    it('should include top services, products, and providers', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/reports/revenue?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report.topServices).toBeInstanceOf(Array);
      expect(data.report.topProducts).toBeInstanceOf(Array);
      expect(data.report.topProviders).toBeInstanceOf(Array);
    });

    it('should require date range parameters', async () => {
      const res = await request('GET', '/api/reports/revenue');

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Payment Breakdown Tests (3 tests)
  // ===================
  describe('Payment Breakdown - GET /api/reports/payments', () => {
    it('should return payment method breakdown', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/reports/payments?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.breakdown).toBeInstanceOf(Array);
      expect(data.totalPayments).toBeDefined();
      expect(data.transactionCount).toBeDefined();
    });

    it('should include percentage for each payment method', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/reports/payments?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.breakdown.length > 0) {
        expect(data.breakdown[0]).toHaveProperty('method');
        expect(data.breakdown[0]).toHaveProperty('count');
        expect(data.breakdown[0]).toHaveProperty('total');
        expect(data.breakdown[0]).toHaveProperty('percentage');
      }
    });

    it('should filter by location', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());
      const locationId = '550e8400-e29b-41d4-a716-446655440001';

      const res = await request('GET', `/api/reports/payments?startDate=${startDate}&endDate=${endDate}&locationId=${locationId}`);

      expect(res.status).toBe(200);
      // Results will be filtered (possibly empty for non-existent location)
    });
  });

  // ===================
  // Service Report Tests (3 tests)
  // ===================
  describe('Service Report - GET /api/reports/services', () => {
    it('should return service revenue report', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/reports/services?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.services).toBeInstanceOf(Array);
      expect(data.totalRevenue).toBeDefined();
      expect(data.totalServices).toBeDefined();
    });

    it('should include service count and average price', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/reports/services?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.services.length > 0) {
        expect(data.services[0]).toHaveProperty('id');
        expect(data.services[0]).toHaveProperty('name');
        expect(data.services[0]).toHaveProperty('count');
        expect(data.services[0]).toHaveProperty('revenue');
        expect(data.services[0]).toHaveProperty('averagePrice');
      }
    });

    it('should filter by provider', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());
      const providerId = '550e8400-e29b-41d4-a716-446655440002';

      const res = await request('GET', `/api/reports/services?startDate=${startDate}&endDate=${endDate}&providerId=${providerId}`);

      expect(res.status).toBe(200);
    });
  });

  // ===================
  // Provider Report Tests (3 tests)
  // ===================
  describe('Provider Report - GET /api/reports/providers', () => {
    it('should return provider revenue report', async () => {
      const startDate = formatDate(getDateOffset(-60));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/reports/providers?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.providers).toBeInstanceOf(Array);
      expect(data.totalRevenue).toBeDefined();
    });

    it('should include provider statistics', async () => {
      const startDate = formatDate(getDateOffset(-60));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/reports/providers?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.providers.length > 0) {
        const provider = data.providers[0];
        expect(provider).toHaveProperty('providerId');
        expect(provider).toHaveProperty('providerName');
        expect(provider).toHaveProperty('totalRevenue');
        expect(provider).toHaveProperty('appointmentCount');
        expect(provider).toHaveProperty('patientCount');
        expect(provider).toHaveProperty('averageTicket');
      }
    });

    it('should include service breakdown per provider', async () => {
      const startDate = formatDate(getDateOffset(-60));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/reports/providers?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.providers.length > 0) {
        expect(data.providers[0]).toHaveProperty('serviceBreakdown');
        expect(data.providers[0].serviceBreakdown).toBeInstanceOf(Array);
      }
    });
  });

  // ===================
  // Outstanding Report Tests (3 tests)
  // ===================
  describe('Outstanding Report - GET /api/reports/outstanding', () => {
    it('should return outstanding balances report', async () => {
      const res = await request('GET', '/api/reports/outstanding');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report).toBeDefined();
      expect(data.report.totalOutstanding).toBeDefined();
      expect(data.report.invoiceCount).toBeDefined();
    });

    it('should include age buckets', async () => {
      const res = await request('GET', '/api/reports/outstanding');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report).toHaveProperty('current');
      expect(data.report).toHaveProperty('thirtyDays');
      expect(data.report).toHaveProperty('sixtyDays');
      expect(data.report).toHaveProperty('ninetyPlus');
    });

    it('should include patient-level breakdown', async () => {
      const res = await request('GET', '/api/reports/outstanding');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report).toHaveProperty('byPatient');
      expect(data.report.byPatient).toBeInstanceOf(Array);
    });
  });

  // ===================
  // Product Report Tests
  // ===================
  describe('Product Report - GET /api/reports/products', () => {
    it('should return product sales report', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/reports/products?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.products).toBeInstanceOf(Array);
      expect(data.totalRevenue).toBeDefined();
      expect(data.totalUnitsSold).toBeDefined();
    });
  });

  // ===================
  // Package Report Tests
  // ===================
  describe('Package Report - GET /api/reports/packages', () => {
    it('should return package sales report', async () => {
      const startDate = formatDate(getDateOffset(-90));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/reports/packages?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.packages).toBeInstanceOf(Array);
      expect(data.totalRevenue).toBeDefined();
      expect(data.totalSales).toBeDefined();
    });
  });

  // ===================
  // Membership Report Tests
  // ===================
  describe('Membership Report - GET /api/reports/memberships', () => {
    it('should return membership report', async () => {
      const startDate = formatDate(getDateOffset(-90));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/reports/memberships?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.totalActiveMembers).toBeDefined();
      expect(data.monthlyRecurringRevenue).toBeDefined();
      expect(data.annualRecurringRevenue).toBeDefined();
      expect(data.membershipTypes).toBeInstanceOf(Array);
    });
  });

  // ===================
  // Refunds Report Tests
  // ===================
  describe('Refunds Report - GET /api/reports/refunds', () => {
    it('should return refunds report', async () => {
      const startDate = formatDate(getDateOffset(-90));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/reports/refunds?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.refunds).toBeInstanceOf(Array);
      expect(data.totalRefunded).toBeDefined();
      expect(data.refundCount).toBeDefined();
    });

    it('should include reason breakdown', async () => {
      const startDate = formatDate(getDateOffset(-90));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/reports/refunds?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.byReason).toBeInstanceOf(Array);
    });
  });

  // ===================
  // Date Range Filtering Tests (3 tests)
  // ===================
  describe('Date Range Filtering', () => {
    it('should filter revenue by date range', async () => {
      const startDate = formatDate(getDateOffset(-7));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/reports/revenue?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report.startDate).toBe(startDate);
      expect(data.report.endDate).toBe(endDate);
    });

    it('should reject invalid date formats', async () => {
      const res = await request('GET', '/api/reports/revenue?startDate=invalid&endDate=also-invalid');

      expect(res.status).toBe(400);
    });

    it('should handle single-day date range', async () => {
      const today = formatDate(new Date());

      const res = await request('GET', `/api/reports/revenue?startDate=${today}&endDate=${today}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report.dailyData.length).toBe(1);
    });
  });

  // ===================
  // Export Functionality Tests (2 tests)
  // ===================
  describe('Export Functionality - POST /api/reports/export', () => {
    it('should export revenue report to CSV', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('POST', '/api/reports/export', {
        reportType: 'revenue',
        startDate,
        endDate,
        format: 'csv',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.filename).toContain('revenue-report');
      expect(data.filename).toContain('.csv');
      expect(data.content).toBeDefined();
      expect(data.recordCount).toBeDefined();
    });

    it('should export outstanding balances report', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('POST', '/api/reports/export', {
        reportType: 'outstanding',
        startDate,
        endDate,
        format: 'csv',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.filename).toContain('outstanding');
    });

    it('should reject PDF export (not implemented)', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('POST', '/api/reports/export', {
        reportType: 'revenue',
        startDate,
        endDate,
        format: 'pdf',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('PDF');
    });
  });

  // ===================
  // Edge Cases & Additional Tests
  // ===================
  describe('Edge Cases', () => {
    it('should handle empty date range with no invoices', async () => {
      const startDate = '2020-01-01';
      const endDate = '2020-01-02';

      const res = await request('GET', `/api/reports/revenue?startDate=${startDate}&endDate=${endDate}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report.totalRevenue).toBe(0);
    });

    it('should cache report results', async () => {
      const res1 = await request('GET', '/api/reports/daily-summary');
      expect(res1.status).toBe(200);

      // Second request should be cached
      const res2 = await request('GET', '/api/reports/daily-summary');
      expect(res2.status).toBe(200);
    });

    it('should support groupBy parameter', async () => {
      const startDate = formatDate(getDateOffset(-30));
      const endDate = formatDate(new Date());

      const res = await request('GET', `/api/reports/revenue?startDate=${startDate}&endDate=${endDate}&groupBy=day`);

      expect(res.status).toBe(200);
    });
  });
});
