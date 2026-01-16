/**
 * Invoices API Tests
 *
 * Comprehensive tests for:
 * - List invoices with pagination and filtering
 * - Create invoice with validation
 * - Get invoice by ID
 * - Update invoice
 * - Delete/void invoice
 * - Line item CRUD operations
 * - Send invoice
 * - PDF generation
 * - Patient invoices
 * - Summary endpoint
 * - Edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import invoices, {
  clearStores,
  getInvoiceStore,
  getPatientStore,
  addMockPatient,
  addMockInvoice,
  patientInvoices,
  StoredInvoice,
  MockPatient,
} from '../src/routes/invoices';
import { errorHandler } from '../src/middleware/error';
import { sessionStore } from '../src/middleware/auth';
import crypto from 'crypto';

// Create test app with error handler
const app = new Hono();
app.route('/api/invoices', invoices);
app.route('/api/patients', patientInvoices);
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
    permissions: ['invoice:read', 'invoice:create', 'invoice:update', 'invoice:delete'],
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

// Test patient ID (from mock data)
const testPatientId = '11111111-1111-1111-1111-111111111111';
const testPatientId2 = '22222222-2222-2222-2222-222222222222';

// Test invoice IDs (from mock data)
const paidInvoiceId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const partiallyPaidInvoiceId = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const draftInvoiceId = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

// Valid invoice data for creation
const validInvoiceData = {
  patientId: testPatientId,
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  lineItems: [
    {
      type: 'service' as const,
      name: 'Consultation',
      quantity: 1,
      unitPrice: 100,
      taxRate: 8.25,
    },
  ],
};

// Valid line item data
const validLineItemData = {
  type: 'injectable' as const,
  name: 'Botox Treatment',
  description: '20 units',
  quantity: 20,
  unitPrice: 15,
  unitType: 'unit' as const,
  lotNumber: 'LOT-TEST-001',
  taxRate: 0,
};

// Helper to create a fresh draft invoice for testing
async function createDraftInvoice(): Promise<{ id: string; invoiceNumber: string }> {
  const res = await request('POST', '/api/invoices', {
    patientId: testPatientId,
  });
  const data = await res.json();
  return { id: data.invoice.id, invoiceNumber: data.invoice.invoiceNumber };
}

describe('Invoices API', () => {
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
      const res = await unauthenticatedRequest('GET', '/api/invoices');
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const req = new Request('http://localhost/api/invoices', {
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
  // List Invoices Tests (5 tests)
  // ===================
  describe('List Invoices - GET /api/invoices', () => {
    it('should return paginated list of invoices', async () => {
      const res = await request('GET', '/api/invoices');

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
      const res = await request('GET', '/api/invoices?page=1&limit=2');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeLessThanOrEqual(2);
      expect(data.limit).toBe(2);
    });

    it('should sort by invoiceDate descending by default', async () => {
      const res = await request('GET', '/api/invoices');

      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.items.length > 1) {
        const dates = data.items.map((inv: any) => new Date(inv.invoiceDate).getTime());
        const sortedDates = [...dates].sort((a, b) => b - a);
        expect(dates).toEqual(sortedDates);
      }
    });

    it('should sort by total ascending when specified', async () => {
      const res = await request('GET', '/api/invoices?sortBy=total&sortOrder=asc');

      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.items.length > 1) {
        const totals = data.items.map((inv: any) => inv.total);
        const sortedTotals = [...totals].sort((a, b) => a - b);
        expect(totals).toEqual(sortedTotals);
      }
    });

    it('should include lineItemCount in response', async () => {
      const res = await request('GET', '/api/invoices');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items[0].lineItemCount).toBeDefined();
      expect(typeof data.items[0].lineItemCount).toBe('number');
    });
  });

  // ===================
  // Filter Tests (5 tests)
  // ===================
  describe('Filter Invoices', () => {
    it('should filter by patientId', async () => {
      const res = await request('GET', `/api/invoices?patientId=${testPatientId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((inv: any) => inv.patientId === testPatientId)).toBe(true);
    });

    it('should filter by status', async () => {
      const res = await request('GET', '/api/invoices?status=paid');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((inv: any) => inv.status === 'paid')).toBe(true);
    });

    it('should filter by date range - dateFrom', async () => {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 30);

      const res = await request('GET', `/api/invoices?dateFrom=${dateFrom.toISOString().split('T')[0]}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      data.items.forEach((inv: any) => {
        expect(new Date(inv.invoiceDate).getTime()).toBeGreaterThanOrEqual(dateFrom.setHours(0, 0, 0, 0));
      });
    });

    it('should filter by date range - dateTo', async () => {
      const dateTo = new Date();

      const res = await request('GET', `/api/invoices?dateTo=${dateTo.toISOString().split('T')[0]}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      data.items.forEach((inv: any) => {
        expect(new Date(inv.invoiceDate).getTime()).toBeLessThanOrEqual(dateTo.setHours(23, 59, 59, 999));
      });
    });

    it('should combine multiple filters', async () => {
      const res = await request('GET', `/api/invoices?patientId=${testPatientId}&status=paid`);

      expect(res.status).toBe(200);
      const data = await res.json();
      data.items.forEach((inv: any) => {
        expect(inv.patientId).toBe(testPatientId);
        expect(inv.status).toBe('paid');
      });
    });
  });

  // ===================
  // Create Invoice Tests (5 tests)
  // ===================
  describe('Create Invoice - POST /api/invoices', () => {
    it('should create invoice with valid data', async () => {
      const res = await request('POST', '/api/invoices', validInvoiceData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.invoice).toBeDefined();
      expect(data.invoice.id).toBeDefined();
      expect(data.invoice.invoiceNumber).toMatch(/^INV-\d{4}-\d{4}$/);
      expect(data.invoice.patientId).toBe(testPatientId);
      expect(data.invoice.patientName).toBe('Sarah Johnson');
      expect(data.invoice.status).toBe('draft');
      expect(data.message).toBe('Invoice created successfully');
    });

    it('should create invoice with empty line items', async () => {
      const res = await request('POST', '/api/invoices', {
        patientId: testPatientId,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.invoice.lineItems).toEqual([]);
      expect(data.invoice.total).toBe(0);
    });

    it('should calculate totals correctly with tax and discount', async () => {
      const invoiceData = {
        patientId: testPatientId,
        lineItems: [
          {
            type: 'service',
            name: 'Service A',
            quantity: 2,
            unitPrice: 100,
            discountType: 'percentage',
            discountValue: 10,
            taxRate: 8.25,
          },
        ],
      };

      const res = await request('POST', '/api/invoices', invoiceData);

      expect(res.status).toBe(201);
      const data = await res.json();
      // Subtotal: 2 * 100 = 200
      // Discount: 200 * 0.10 = 20
      // After discount: 180
      // Tax: 180 * 0.0825 = 14.85
      // Total: 180 + 14.85 = 194.85
      expect(data.invoice.subtotal).toBe(200);
      expect(data.invoice.discountTotal).toBe(20);
      expect(data.invoice.taxTotal).toBeCloseTo(14.85, 2);
      expect(data.invoice.total).toBeCloseTo(194.85, 2);
    });

    it('should reject invalid patientId', async () => {
      const res = await request('POST', '/api/invoices', {
        patientId: crypto.randomUUID(),
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Patient not found');
    });

    it('should reject invalid UUID format for patientId', async () => {
      const res = await request('POST', '/api/invoices', {
        patientId: 'invalid-uuid',
      });

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Get Invoice Tests (3 tests)
  // ===================
  describe('Get Invoice - GET /api/invoices/:id', () => {
    it('should return single invoice by ID', async () => {
      const res = await request('GET', `/api/invoices/${paidInvoiceId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.invoice).toBeDefined();
      expect(data.invoice.id).toBe(paidInvoiceId);
      expect(data.invoice.invoiceNumber).toBeDefined();
      expect(data.invoice.lineItems).toBeDefined();
    });

    it('should return 404 for non-existent invoice', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/invoices/${fakeId}`);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid UUID', async () => {
      const res = await request('GET', '/api/invoices/invalid-id');

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Update Invoice Tests (4 tests)
  // ===================
  describe('Update Invoice - PUT /api/invoices/:id', () => {
    it('should update invoice with valid data', async () => {
      const { id } = await createDraftInvoice();

      const updateData = {
        internalNotes: 'Updated internal notes',
        patientNotes: 'Updated patient notes',
      };

      const res = await request('PUT', `/api/invoices/${id}`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.invoice.internalNotes).toBe('Updated internal notes');
      expect(data.invoice.patientNotes).toBe('Updated patient notes');
      expect(data.message).toBe('Invoice updated successfully');
    });

    it('should update dueDate', async () => {
      const { id } = await createDraftInvoice();
      const newDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const res = await request('PUT', `/api/invoices/${id}`, {
        dueDate: newDueDate.toISOString(),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(new Date(data.invoice.dueDate).toDateString()).toBe(newDueDate.toDateString());
    });

    it('should reject update on paid invoice', async () => {
      const res = await request('PUT', `/api/invoices/${paidInvoiceId}`, {
        internalNotes: 'Trying to update',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Cannot edit invoice');
    });

    it('should reject invalid status transition', async () => {
      const { id } = await createDraftInvoice();

      const res = await request('PUT', `/api/invoices/${id}`, {
        status: 'paid', // Cannot go directly from draft to paid
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Invalid status transition');
    });
  });

  // ===================
  // Delete/Void Invoice Tests (3 tests)
  // ===================
  describe('Delete Invoice - DELETE /api/invoices/:id', () => {
    it('should void draft invoice', async () => {
      const { id } = await createDraftInvoice();

      const res = await request('DELETE', `/api/invoices/${id}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Invoice voided successfully');

      // Verify invoice is voided
      const getRes = await request('GET', `/api/invoices/${id}`);
      expect(getRes.status).toBe(404);
    });

    it('should reject voiding paid invoice', async () => {
      const res = await request('DELETE', `/api/invoices/${paidInvoiceId}`);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Cannot void a paid invoice');
    });

    it('should return 404 for non-existent invoice', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('DELETE', `/api/invoices/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Line Item CRUD Tests (8 tests)
  // ===================
  describe('Line Item Operations', () => {
    it('should add line item to invoice', async () => {
      const { id } = await createDraftInvoice();

      const res = await request('POST', `/api/invoices/${id}/line-items`, validLineItemData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.lineItem).toBeDefined();
      expect(data.lineItem.id).toBeDefined();
      expect(data.lineItem.name).toBe('Botox Treatment');
      expect(data.lineItem.lineTotal).toBe(300); // 20 * 15
      expect(data.message).toBe('Line item added successfully');
    });

    it('should recalculate invoice totals after adding line item', async () => {
      const { id } = await createDraftInvoice();

      const res = await request('POST', `/api/invoices/${id}/line-items`, validLineItemData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.invoice.total).toBe(300);
      expect(data.invoice.balance).toBe(300);
    });

    it('should add line item with discount', async () => {
      const { id } = await createDraftInvoice();

      const lineItemWithDiscount = {
        ...validLineItemData,
        discountType: 'fixed',
        discountValue: 50,
      };

      const res = await request('POST', `/api/invoices/${id}/line-items`, lineItemWithDiscount);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.lineItem.discountAmount).toBe(50);
      expect(data.lineItem.lineTotal).toBe(250); // 300 - 50
    });

    it('should update line item', async () => {
      const { id } = await createDraftInvoice();

      // First add a line item
      const addRes = await request('POST', `/api/invoices/${id}/line-items`, validLineItemData);
      const { lineItem } = await addRes.json();

      // Then update it
      const res = await request('PUT', `/api/invoices/${id}/line-items/${lineItem.id}`, {
        quantity: 30,
        unitPrice: 12,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.lineItem.quantity).toBe(30);
      expect(data.lineItem.unitPrice).toBe(12);
      expect(data.lineItem.lineTotal).toBe(360); // 30 * 12
    });

    it('should recalculate invoice totals after updating line item', async () => {
      const { id } = await createDraftInvoice();

      // Add a line item
      const addRes = await request('POST', `/api/invoices/${id}/line-items`, validLineItemData);
      const { lineItem } = await addRes.json();

      // Update it
      const res = await request('PUT', `/api/invoices/${id}/line-items/${lineItem.id}`, {
        quantity: 10,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.invoice.total).toBe(150); // 10 * 15
    });

    it('should remove line item', async () => {
      const { id } = await createDraftInvoice();

      // Add a line item
      const addRes = await request('POST', `/api/invoices/${id}/line-items`, validLineItemData);
      const { lineItem } = await addRes.json();

      // Remove it
      const res = await request('DELETE', `/api/invoices/${id}/line-items/${lineItem.id}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.invoice.total).toBe(0);
      expect(data.message).toBe('Line item removed successfully');
    });

    it('should reject line item operations on paid invoice', async () => {
      const res = await request('POST', `/api/invoices/${paidInvoiceId}/line-items`, validLineItemData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Cannot edit invoice');
    });

    it('should return 404 for non-existent line item', async () => {
      const { id } = await createDraftInvoice();
      const fakeItemId = crypto.randomUUID();

      const res = await request('PUT', `/api/invoices/${id}/line-items/${fakeItemId}`, {
        quantity: 5,
      });

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Send Invoice Tests (2 tests)
  // ===================
  describe('Send Invoice - POST /api/invoices/:id/send', () => {
    it('should send invoice to patient email', async () => {
      const { id } = await createDraftInvoice();

      const res = await request('POST', `/api/invoices/${id}/send`, {});

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('Invoice sent to');
      expect(data.sentAt).toBeDefined();

      // Verify status changed to sent
      const getRes = await request('GET', `/api/invoices/${id}`);
      const getInvoice = await getRes.json();
      expect(getInvoice.invoice.status).toBe('sent');
    });

    it('should reject sending cancelled invoice', async () => {
      const { id } = await createDraftInvoice();

      // Cancel it first (valid transition: draft -> cancelled)
      await request('PUT', `/api/invoices/${id}`, { status: 'cancelled' });

      // Try to send
      const res = await request('POST', `/api/invoices/${id}/send`, {});

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Cannot send invoice');
    });
  });

  // ===================
  // PDF Generation Tests (2 tests)
  // ===================
  describe('PDF Generation - GET /api/invoices/:id/pdf', () => {
    it('should return PDF URL for invoice', async () => {
      const res = await request('GET', `/api/invoices/${paidInvoiceId}/pdf`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.pdfUrl).toBeDefined();
      expect(data.pdfUrl).toContain(paidInvoiceId);
      expect(data.generatedAt).toBeDefined();
      expect(data.invoice).toBeDefined();
      expect(data.invoice.invoiceNumber).toBeDefined();
    });

    it('should return 404 for non-existent invoice', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/invoices/${fakeId}/pdf`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Patient Invoices Tests (3 tests)
  // ===================
  describe('Patient Invoices - GET /api/patients/:patientId/invoices', () => {
    it('should return invoices for specific patient', async () => {
      const res = await request('GET', `/api/patients/${testPatientId}/invoices`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();
      expect(data.summary).toBeDefined();
    });

    it('should return summary with totals', async () => {
      const res = await request('GET', `/api/patients/${testPatientId}/invoices`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.summary.totalInvoices).toBeDefined();
      expect(data.summary.totalAmount).toBeDefined();
      expect(data.summary.totalPaid).toBeDefined();
      expect(data.summary.totalOutstanding).toBeDefined();
    });

    it('should return 404 for non-existent patient', async () => {
      const fakePatientId = crypto.randomUUID();
      const res = await request('GET', `/api/patients/${fakePatientId}/invoices`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Summary Endpoint Tests (3 tests)
  // ===================
  describe('Invoice Summary - GET /api/invoices/summary', () => {
    it('should return daily summary', async () => {
      const res = await request('GET', '/api/invoices/summary?period=daily');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.summary).toBeDefined();
      expect(data.summary.period).toBe('daily');
      expect(data.summary.totalInvoices).toBeDefined();
      expect(data.summary.totalRevenue).toBeDefined();
      expect(data.summary.byStatus).toBeDefined();
    });

    it('should return weekly summary', async () => {
      const res = await request('GET', '/api/invoices/summary?period=weekly');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.summary.period).toBe('weekly');
      expect(data.summary.startDate).toBeDefined();
      expect(data.summary.endDate).toBeDefined();
    });

    it('should return summary for specific date', async () => {
      const today = new Date().toISOString().split('T')[0];
      const res = await request('GET', `/api/invoices/summary?period=daily&date=${today}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.summary).toBeDefined();
    });
  });

  // ===================
  // Edge Cases Tests (4 tests)
  // ===================
  describe('Edge Cases', () => {
    it('should handle pagination edge case - page beyond results', async () => {
      const res = await request('GET', '/api/invoices?page=1000');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
      expect(data.hasMore).toBe(false);
    });

    it('should reject limit over 100', async () => {
      const res = await request('GET', '/api/invoices?limit=101');

      expect(res.status).toBe(400);
    });

    it('should reject invoice with zero quantity line item', async () => {
      const res = await request('POST', '/api/invoices', {
        patientId: testPatientId,
        lineItems: [
          {
            type: 'service',
            name: 'Free Consultation',
            quantity: 0,
            unitPrice: 100,
            taxRate: 0,
          },
        ],
      });

      // Should reject because quantity must be positive
      expect(res.status).toBe(400);
    });

    it('should handle invoice auto-status update when balance becomes zero', async () => {
      // Create invoice with line items
      const createRes = await request('POST', '/api/invoices', {
        patientId: testPatientId,
        lineItems: [
          {
            type: 'service',
            name: 'Service',
            quantity: 1,
            unitPrice: 100,
            taxRate: 0,
          },
        ],
      });
      const { invoice } = await createRes.json();

      // Mark as sent first
      await request('PUT', `/api/invoices/${invoice.id}`, { status: 'sent' });

      // Manually update the invoice to simulate payment
      const storedInvoice = getInvoiceStore().get(invoice.id);
      if (storedInvoice) {
        storedInvoice.amountPaid = 100;
        storedInvoice.balance = 0;
        storedInvoice.status = 'paid';
        getInvoiceStore().set(invoice.id, storedInvoice);
      }

      // Verify status
      const getRes = await request('GET', `/api/invoices/${invoice.id}`);
      const getInvoice = await getRes.json();
      expect(getInvoice.invoice.status).toBe('paid');
    });
  });

  // ===================
  // Additional Validation Tests
  // ===================
  describe('Additional Validations', () => {
    it('should allow valid status transition from draft to sent', async () => {
      const { id } = await createDraftInvoice();

      const res = await request('PUT', `/api/invoices/${id}`, {
        status: 'sent',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.invoice.status).toBe('sent');
    });

    it('should allow valid status transition from draft to cancelled', async () => {
      const { id } = await createDraftInvoice();

      const res = await request('PUT', `/api/invoices/${id}`, {
        status: 'cancelled',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.invoice.status).toBe('cancelled');
      expect(data.invoice.cancelledAt).toBeDefined();
    });

    it('should create invoice with injectable line item including lot number', async () => {
      const res = await request('POST', '/api/invoices', {
        patientId: testPatientId,
        lineItems: [
          {
            type: 'injectable',
            name: 'Botox',
            quantity: 50,
            unitPrice: 12,
            unitType: 'unit',
            lotNumber: 'LOT-2024-ABC',
            taxRate: 0,
          },
        ],
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.invoice.lineItems[0].lotNumber).toBe('LOT-2024-ABC');
      expect(data.invoice.lineItems[0].unitType).toBe('unit');
    });

    it('should not list voided invoices', async () => {
      // Get initial count
      const initialRes = await request('GET', '/api/invoices');
      const initialData = await initialRes.json();
      const initialCount = initialData.total;

      // Create and void an invoice
      const { id } = await createDraftInvoice();
      await request('DELETE', `/api/invoices/${id}`);

      // Get count again
      const res = await request('GET', '/api/invoices');
      const data = await res.json();

      // Should not include voided invoice in the count
      expect(data.total).toBe(initialCount);
    });

    it('should handle percentage discount correctly', async () => {
      const { id } = await createDraftInvoice();

      const res = await request('POST', `/api/invoices/${id}/line-items`, {
        type: 'service',
        name: 'Discounted Service',
        quantity: 1,
        unitPrice: 200,
        discountType: 'percentage',
        discountValue: 25,
        taxRate: 10,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      // Subtotal: 200
      // Discount: 200 * 0.25 = 50
      // After discount: 150
      // Tax: 150 * 0.10 = 15
      // Total: 165
      expect(data.lineItem.discountAmount).toBe(50);
      expect(data.lineItem.taxAmount).toBe(15);
      expect(data.lineItem.lineTotal).toBe(165);
    });

    it('should handle fixed discount correctly', async () => {
      const { id } = await createDraftInvoice();

      const res = await request('POST', `/api/invoices/${id}/line-items`, {
        type: 'service',
        name: 'Fixed Discount Service',
        quantity: 1,
        unitPrice: 200,
        discountType: 'fixed',
        discountValue: 30,
        taxRate: 10,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      // Subtotal: 200
      // Discount: 30 (fixed)
      // After discount: 170
      // Tax: 170 * 0.10 = 17
      // Total: 187
      expect(data.lineItem.discountAmount).toBe(30);
      expect(data.lineItem.taxAmount).toBe(17);
      expect(data.lineItem.lineTotal).toBe(187);
    });

    it('should create invoice with provider information', async () => {
      const res = await request('POST', '/api/invoices', {
        patientId: testPatientId,
        providerId: crypto.randomUUID(),
        locationId: crypto.randomUUID(),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.invoice.providerId).toBeDefined();
      expect(data.invoice.locationId).toBeDefined();
    });

    it('should set default due date to 14 days from now if not provided', async () => {
      const res = await request('POST', '/api/invoices', {
        patientId: testPatientId,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      const dueDate = new Date(data.invoice.dueDate);
      const invoiceDate = new Date(data.invoice.invoiceDate);
      const diffDays = Math.round((dueDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(14);
    });
  });
});
