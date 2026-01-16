/**
 * Payments API Tests
 *
 * Comprehensive tests for:
 * - List payments (paginated, filterable)
 * - Create payment (cash, card, check, gift card, financing)
 * - Get payment by ID
 * - Process refund
 * - Invoice payments list
 * - Patient payments list
 * - Card validation
 * - Edge cases (insufficient balance, invalid card, etc.)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import payments, {
  clearStores,
  getPaymentsStore,
  getInvoicesStore,
  getGiftCardsStore,
  addMockInvoice,
  addMockGiftCard,
  addMockPayment,
  StoredPayment,
  StoredInvoice,
  StoredGiftCard,
} from '../src/routes/payments';
import { errorHandler } from '../src/middleware/error';
import { sessionStore } from '../src/middleware/auth';
import crypto from 'crypto';

// Create test app with error handler
const app = new Hono();
app.route('/api/payments', payments);
app.onError(errorHandler);

// Mock session for authentication
const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
const mockSessionToken = 'test-session-token-payments-12345';
const mockSessionId = 'test-session-payments-id';

function setupMockSession() {
  sessionStore.set(mockSessionId, {
    id: mockSessionId,
    token: mockSessionToken,
    userId: mockUserId,
    email: 'test@example.com',
    role: 'admin',
    permissions: ['payment:read', 'payment:create', 'payment:refund'],
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

describe('Payments API', () => {
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
      const res = await unauthenticatedRequest('GET', '/api/payments');
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const req = new Request('http://localhost/api/payments', {
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
  // List Payments Tests
  // ===================
  describe('List Payments - GET /api/payments', () => {
    it('should return paginated list of payments', async () => {
      const res = await request('GET', '/api/payments');

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
      const res = await request('GET', '/api/payments?page=1&limit=1');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeLessThanOrEqual(1);
      expect(data.limit).toBe(1);
    });

    it('should filter by payment method', async () => {
      const res = await request('GET', '/api/payments?method=credit_card');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((p: any) => p.method === 'credit_card')).toBe(true);
    });

    it('should filter by status', async () => {
      const res = await request('GET', '/api/payments?status=completed');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((p: any) => p.status === 'completed')).toBe(true);
    });
  });

  // ===================
  // Create Payment - Cash Tests
  // ===================
  describe('Create Payment - Cash - POST /api/payments', () => {
    it('should create cash payment successfully', async () => {
      const paymentData = {
        invoiceId: 'inv-001',
        patientId: 'patient-001',
        amount: 100,
        method: 'cash',
      };

      const res = await request('POST', '/api/payments', paymentData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.payment).toBeDefined();
      expect(data.payment.id).toBeDefined();
      expect(data.payment.method).toBe('cash');
      expect(data.payment.amount).toBe(100);
      expect(data.payment.status).toBe('completed');
      expect(data.invoiceBalance).toBe(400); // 500 - 100
      expect(data.message).toBe('Payment processed successfully');
    });

    it('should update invoice balance after cash payment', async () => {
      const paymentData = {
        invoiceId: 'inv-001',
        patientId: 'patient-001',
        amount: 200,
        method: 'cash',
      };

      await request('POST', '/api/payments', paymentData);

      const invoice = getInvoicesStore().get('inv-001');
      expect(invoice?.balance).toBe(300); // 500 - 200
      expect(invoice?.status).toBe('partially_paid');
    });

    it('should mark invoice as paid when fully paid with cash', async () => {
      const paymentData = {
        invoiceId: 'inv-001',
        patientId: 'patient-001',
        amount: 500,
        method: 'cash',
      };

      await request('POST', '/api/payments', paymentData);

      const invoice = getInvoicesStore().get('inv-001');
      expect(invoice?.balance).toBe(0);
      expect(invoice?.status).toBe('paid');
    });
  });

  // ===================
  // Create Payment - Card Tests
  // ===================
  describe('Create Payment - Card - POST /api/payments', () => {
    it('should create credit card payment successfully', async () => {
      const paymentData = {
        invoiceId: 'inv-001',
        patientId: 'patient-001',
        amount: 150,
        method: 'credit_card',
        cardDetails: {
          last4: '4242',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2030,
        },
      };

      const res = await request('POST', '/api/payments', paymentData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.payment.method).toBe('credit_card');
      expect(data.payment.cardDetails.last4).toBe('4242');
      expect(data.payment.cardDetails.brand).toBe('visa');
      expect(data.payment.transactionId).toBeDefined();
      expect(data.payment.status).toBe('completed');
    });

    it('should fail with declined card (last4: 0000)', async () => {
      const paymentData = {
        invoiceId: 'inv-001',
        patientId: 'patient-001',
        amount: 100,
        method: 'credit_card',
        cardDetails: {
          last4: '0000',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2030,
        },
      };

      const res = await request('POST', '/api/payments', paymentData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('declined');
    });

    it('should fail with insufficient funds (last4: 9999)', async () => {
      const paymentData = {
        invoiceId: 'inv-001',
        patientId: 'patient-001',
        amount: 100,
        method: 'credit_card',
        cardDetails: {
          last4: '9999',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2030,
        },
      };

      const res = await request('POST', '/api/payments', paymentData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Insufficient funds');
    });

    it('should fail with expired card', async () => {
      const paymentData = {
        invoiceId: 'inv-001',
        patientId: 'patient-001',
        amount: 100,
        method: 'credit_card',
        cardDetails: {
          last4: '4242',
          brand: 'visa',
          expiryMonth: 1,
          expiryYear: 2020,
        },
      };

      const res = await request('POST', '/api/payments', paymentData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('expired');
    });
  });

  // ===================
  // Create Payment - Check Tests
  // ===================
  describe('Create Payment - Check - POST /api/payments', () => {
    it('should create check payment successfully', async () => {
      const paymentData = {
        invoiceId: 'inv-001',
        patientId: 'patient-001',
        amount: 200,
        method: 'check',
        checkDetails: {
          checkNumber: '1234',
          bankName: 'First National Bank',
        },
      };

      const res = await request('POST', '/api/payments', paymentData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.payment.method).toBe('check');
      expect(data.payment.checkDetails.checkNumber).toBe('1234');
      expect(data.payment.checkDetails.bankName).toBe('First National Bank');
      expect(data.payment.status).toBe('completed');
    });

    it('should require check details for check payment', async () => {
      const paymentData = {
        invoiceId: 'inv-001',
        patientId: 'patient-001',
        amount: 100,
        method: 'check',
        // Missing checkDetails
      };

      const res = await request('POST', '/api/payments', paymentData);

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Create Payment - Gift Card Tests
  // ===================
  describe('Create Payment - Gift Card - POST /api/payments', () => {
    it('should create gift card payment successfully', async () => {
      const paymentData = {
        invoiceId: 'inv-001',
        patientId: 'patient-001',
        amount: 50,
        method: 'gift_card',
        giftCardDetails: {
          giftCardId: 'gc-001',
          giftCardCode: 'GIFT100',
        },
      };

      const res = await request('POST', '/api/payments', paymentData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.payment.method).toBe('gift_card');
      expect(data.payment.status).toBe('completed');

      // Check gift card balance was reduced
      const giftCard = getGiftCardsStore().get('gc-001');
      expect(giftCard?.balance).toBe(50); // 100 - 50
    });

    it('should fail with insufficient gift card balance', async () => {
      const paymentData = {
        invoiceId: 'inv-001',
        patientId: 'patient-001',
        amount: 200, // Gift card only has 100
        method: 'gift_card',
        giftCardDetails: {
          giftCardId: 'gc-001',
          giftCardCode: 'GIFT100',
        },
      };

      const res = await request('POST', '/api/payments', paymentData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Insufficient gift card balance');
    });

    it('should fail with depleted gift card', async () => {
      const paymentData = {
        invoiceId: 'inv-001',
        patientId: 'patient-001',
        amount: 10,
        method: 'gift_card',
        giftCardDetails: {
          giftCardId: 'gc-003', // This one is depleted
          giftCardCode: 'GIFT0',
        },
      };

      const res = await request('POST', '/api/payments', paymentData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('depleted');
    });
  });

  // ===================
  // Get Payment by ID Tests
  // ===================
  describe('Get Payment - GET /api/payments/:id', () => {
    it('should return single payment by ID', async () => {
      const res = await request('GET', '/api/payments/pay-001');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.payment).toBeDefined();
      expect(data.payment.id).toBe('pay-001');
      expect(data.payment.amount).toBe(150);
      expect(data.payment.method).toBe('credit_card');
    });

    it('should return 404 for non-existent payment', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/payments/${fakeId}`);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });

    it('should return 404 for non-existent string ID', async () => {
      const res = await request('GET', '/api/payments/non-existent-payment-id');

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Process Refund Tests
  // ===================
  describe('Process Refund - POST /api/payments/:id/refund', () => {
    it('should process full refund successfully', async () => {
      const refundData = {
        amount: 150,
        reason: 'Customer requested refund',
      };

      const res = await request('POST', '/api/payments/pay-001/refund', refundData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.refund).toBeDefined();
      expect(data.refund.amount).toBe(150);
      expect(data.refund.reason).toBe('Customer requested refund');
      expect(data.refund.status).toBe('completed');
      expect(data.paymentStatus).toBe('refunded');
      expect(data.paymentRefundedAmount).toBe(150);
      expect(data.message).toBe('Refund processed successfully');
    });

    it('should process partial refund successfully', async () => {
      const refundData = {
        amount: 50,
        reason: 'Partial service refund',
      };

      const res = await request('POST', '/api/payments/pay-001/refund', refundData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.refund.amount).toBe(50);
      expect(data.paymentStatus).toBe('partially_refunded');
      expect(data.paymentRefundedAmount).toBe(50);
    });

    it('should fail refund exceeding payment amount', async () => {
      const refundData = {
        amount: 200, // Payment was only 150
        reason: 'Over refund attempt',
      };

      const res = await request('POST', '/api/payments/pay-001/refund', refundData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('exceeds maximum refundable amount');
    });

    it('should update invoice balance after refund', async () => {
      const initialInvoice = getInvoicesStore().get('inv-002');
      const initialBalance = initialInvoice?.balance || 0;

      const refundData = {
        amount: 100,
        reason: 'Invoice correction',
      };

      await request('POST', '/api/payments/pay-001/refund', refundData);

      const updatedInvoice = getInvoicesStore().get('inv-002');
      expect(updatedInvoice?.balance).toBe(initialBalance + 100);
    });

    it('should return 404 for non-existent payment refund', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('POST', `/api/payments/${fakeId}/refund`, {
        amount: 50,
        reason: 'Test',
      });

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Invoice Payments List Tests
  // ===================
  describe('Invoice Payments - GET /api/payments/invoice/:invoiceId', () => {
    it('should return payments for invoice', async () => {
      const res = await request('GET', '/api/payments/invoice/inv-002');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();
      expect(data.invoiceTotal).toBe(300);
      expect(data.invoiceBalance).toBe(150);
    });

    it('should return empty list for invoice with no payments', async () => {
      const res = await request('GET', '/api/payments/invoice/inv-004');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
      expect(data.total).toBe(0);
    });

    it('should return 404 for non-existent invoice', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/payments/invoice/${fakeId}`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Patient Payments List Tests
  // ===================
  describe('Patient Payments - GET /api/payments/patient/:patientId', () => {
    it('should return payments for patient', async () => {
      const res = await request('GET', '/api/payments/patient/patient-001');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();
      expect(data.totalAmount).toBeDefined();
      expect(data.totalRefunded).toBeDefined();
    });

    it('should return empty list for patient with no payments', async () => {
      const res = await request('GET', '/api/payments/patient/patient-003');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
      expect(data.total).toBe(0);
      expect(data.totalAmount).toBe(0);
    });

    it('should calculate totals correctly for patient payments', async () => {
      const res = await request('GET', '/api/payments/patient/patient-002');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.totalAmount).toBe(1000); // From pay-002
      expect(data.totalRefunded).toBe(0);
    });
  });

  // ===================
  // Card Validation Tests
  // ===================
  describe('Card Validation - POST /api/payments/validate-card', () => {
    it('should validate valid Visa test card', async () => {
      const cardData = {
        cardNumber: '4111111111111111',
        expiryMonth: 12,
        expiryYear: 2030,
        cvv: '123',
      };

      const res = await request('POST', '/api/payments/validate-card', cardData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.valid).toBe(true);
      expect(data.brand).toBe('visa');
      expect(data.last4).toBe('1111');
    });

    it('should validate valid Mastercard test card', async () => {
      const cardData = {
        cardNumber: '5555555555554444',
        expiryMonth: 12,
        expiryYear: 2030,
        cvv: '123',
      };

      const res = await request('POST', '/api/payments/validate-card', cardData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.valid).toBe(true);
      expect(data.brand).toBe('mastercard');
      expect(data.last4).toBe('4444');
    });

    it('should reject expired card', async () => {
      // Using a non-test card number to trigger expiry check
      const cardData = {
        cardNumber: '4000000000000001',
        expiryMonth: 1,
        expiryYear: 2020,
        cvv: '123',
      };

      const res = await request('POST', '/api/payments/validate-card', cardData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.valid).toBe(false);
      expect(data.errorCode).toBe('expired_card');
    });
  });

  // ===================
  // Get Payment Methods Tests
  // ===================
  describe('Get Payment Methods - GET /api/payments/methods', () => {
    it('should return available payment methods', async () => {
      const res = await request('GET', '/api/payments/methods');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.methods).toBeDefined();
      expect(Array.isArray(data.methods)).toBe(true);
      expect(data.methods.length).toBeGreaterThan(0);
      expect(data.methods[0]).toHaveProperty('method');
      expect(data.methods[0]).toHaveProperty('name');
      expect(data.methods[0]).toHaveProperty('enabled');
    });
  });

  // ===================
  // Edge Cases Tests
  // ===================
  describe('Edge Cases', () => {
    it('should fail when amount exceeds invoice balance', async () => {
      const paymentData = {
        invoiceId: 'inv-001',
        patientId: 'patient-001',
        amount: 1000, // Invoice balance is only 500
        method: 'cash',
      };

      const res = await request('POST', '/api/payments', paymentData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('exceeds invoice balance');
    });

    it('should fail when invoice is already paid', async () => {
      const paymentData = {
        invoiceId: 'inv-003', // This invoice is already paid (balance = 0)
        patientId: 'patient-002',
        amount: 100,
        method: 'cash',
      };

      const res = await request('POST', '/api/payments', paymentData);

      expect(res.status).toBe(400);
      const data = await res.json();
      // The check for balance happens first, so we get balance exceeded message
      expect(data.message).toContain('Maximum payable: 0');
    });

    it('should fail when patient does not match invoice', async () => {
      const paymentData = {
        invoiceId: 'inv-001',
        patientId: 'patient-002', // Wrong patient
        amount: 100,
        method: 'cash',
      };

      const res = await request('POST', '/api/payments', paymentData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('does not match');
    });

    it('should fail when invoice not found', async () => {
      const paymentData = {
        invoiceId: crypto.randomUUID(),
        patientId: 'patient-001',
        amount: 100,
        method: 'cash',
      };

      const res = await request('POST', '/api/payments', paymentData);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.message).toContain('Invoice not found');
    });
  });

  // ===================
  // Financing Payment Tests
  // ===================
  describe('Create Payment - Financing - POST /api/payments', () => {
    it('should create financing payment with CareCredit', async () => {
      // Use a different invoice to avoid balance issues
      const paymentData = {
        invoiceId: 'inv-004',
        patientId: 'patient-002',
        amount: 300,
        method: 'financing',
        financingDetails: {
          provider: 'carecredit',
          applicationId: 'APP-123456',
          approvalCode: 'APPROVED-789',
        },
      };

      const res = await request('POST', '/api/payments', paymentData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.payment.method).toBe('financing');
      expect(data.payment.financingDetails.provider).toBe('carecredit');
      expect(data.payment.financingDetails.applicationId).toBe('APP-123456');
      expect(data.payment.status).toBe('completed');
    });
  });

  // ===================
  // Multiple Refund Tests
  // ===================
  describe('Multiple Refunds', () => {
    it('should allow multiple partial refunds', async () => {
      // First refund
      await request('POST', '/api/payments/pay-001/refund', {
        amount: 50,
        reason: 'First partial refund',
      });

      // Second refund
      const res = await request('POST', '/api/payments/pay-001/refund', {
        amount: 50,
        reason: 'Second partial refund',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.paymentRefundedAmount).toBe(100);
      expect(data.paymentStatus).toBe('partially_refunded');

      // Check payment has two refunds
      const payment = getPaymentsStore().get('pay-001');
      expect(payment?.refunds.length).toBe(2);
    });

    it('should not allow refund after fully refunded', async () => {
      // Full refund
      await request('POST', '/api/payments/pay-001/refund', {
        amount: 150,
        reason: 'Full refund',
      });

      // Try another refund
      const res = await request('POST', '/api/payments/pay-001/refund', {
        amount: 10,
        reason: 'Extra refund attempt',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('already fully refunded');
    });
  });

  // ===================
  // Gift Card Edge Cases
  // ===================
  describe('Gift Card Edge Cases', () => {
    it('should mark gift card as depleted when balance reaches zero', async () => {
      const paymentData = {
        invoiceId: 'inv-001',
        patientId: 'patient-001',
        amount: 100, // Full gift card balance
        method: 'gift_card',
        giftCardDetails: {
          giftCardId: 'gc-001',
          giftCardCode: 'GIFT100',
        },
      };

      await request('POST', '/api/payments', paymentData);

      const giftCard = getGiftCardsStore().get('gc-001');
      expect(giftCard?.balance).toBe(0);
      expect(giftCard?.status).toBe('depleted');
    });

    it('should fail with invalid gift card code', async () => {
      const paymentData = {
        invoiceId: 'inv-001',
        patientId: 'patient-001',
        amount: 50,
        method: 'gift_card',
        giftCardDetails: {
          giftCardId: 'gc-001',
          giftCardCode: 'WRONG_CODE',
        },
      };

      const res = await request('POST', '/api/payments', paymentData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Invalid gift card code');
    });
  });

  // ===================
  // Sorting Tests
  // ===================
  describe('Sorting', () => {
    it('should sort payments by amount ascending', async () => {
      const res = await request('GET', '/api/payments?sortBy=amount&sortOrder=asc');

      expect(res.status).toBe(200);
      const data = await res.json();
      const amounts = data.items.map((p: any) => p.amount);
      const sortedAmounts = [...amounts].sort((a, b) => a - b);
      expect(amounts).toEqual(sortedAmounts);
    });

    it('should sort payments by processedAt descending (default)', async () => {
      const res = await request('GET', '/api/payments');

      expect(res.status).toBe(200);
      const data = await res.json();
      if (data.items.length > 1) {
        const dates = data.items.map((p: any) => new Date(p.processedAt).getTime());
        const sortedDates = [...dates].sort((a, b) => b - a);
        expect(dates).toEqual(sortedDates);
      }
    });
  });
});
