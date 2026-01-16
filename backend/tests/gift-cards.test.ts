/**
 * Gift Cards API Tests
 *
 * Comprehensive tests for:
 * - List gift cards with pagination and filtering
 * - Create/purchase gift cards
 * - Get gift card by ID and code lookup
 * - Redeem gift cards
 * - Refund to gift cards
 * - Deactivate gift cards
 * - Transaction history
 * - Send gift card email
 * - Edge cases (expired, insufficient balance, etc.)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import giftCards, {
  clearStores,
  getGiftCardStore,
  getGiftCardByCodeStore,
  StoredGiftCard,
} from '../src/routes/gift-cards';
import { errorHandler } from '../src/middleware/error';
import { sessionStore } from '../src/middleware/auth';
import crypto from 'crypto';

// Create test app with error handler
const app = new Hono();
app.route('/api/gift-cards', giftCards);
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
    permissions: ['gift_card:read', 'gift_card:create', 'gift_card:update', 'gift_card:delete'],
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

// Valid gift card data for creation
const validGiftCardData = {
  originalValue: 100,
  purchaserName: 'John Doe',
  purchaserEmail: 'john.doe@example.com',
  recipientName: 'Jane Smith',
  recipientEmail: 'jane.smith@example.com',
  recipientMessage: 'Enjoy your spa day!',
};

describe('Gift Cards API', () => {
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
      const res = await unauthenticatedRequest('GET', '/api/gift-cards');
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const req = new Request('http://localhost/api/gift-cards', {
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
  // List Gift Cards Tests (4 tests)
  // ===================
  describe('List Gift Cards - GET /api/gift-cards', () => {
    it('should return paginated list of gift cards', async () => {
      const res = await request('GET', '/api/gift-cards');

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
      const res = await request('GET', '/api/gift-cards?page=1&limit=2');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeLessThanOrEqual(2);
      expect(data.limit).toBe(2);
    });

    it('should filter by status', async () => {
      const res = await request('GET', '/api/gift-cards?status=active');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((gc: any) => gc.status === 'active')).toBe(true);
    });

    it('should filter by purchaser email', async () => {
      const res = await request('GET', '/api/gift-cards?purchaserEmail=sarah.johnson@email.com');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.items.every((gc: any) =>
        gc.purchaserEmail.toLowerCase() === 'sarah.johnson@email.com'
      )).toBe(true);
    });
  });

  // ===================
  // Create Gift Card Tests (4 tests)
  // ===================
  describe('Create Gift Card - POST /api/gift-cards', () => {
    it('should create gift card with valid data', async () => {
      const res = await request('POST', '/api/gift-cards', validGiftCardData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.giftCard).toBeDefined();
      expect(data.giftCard.id).toBeDefined();
      expect(data.giftCard.code).toMatch(/^GC-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
      expect(data.giftCard.originalValue).toBe(validGiftCardData.originalValue);
      expect(data.giftCard.currentBalance).toBe(validGiftCardData.originalValue);
      expect(data.giftCard.status).toBe('active');
      expect(data.message).toBe('Gift card created successfully');
    });

    it('should create gift card with minimal data', async () => {
      const minimalData = {
        originalValue: 50,
        purchaserName: 'Test User',
        purchaserEmail: 'test@example.com',
      };

      const res = await request('POST', '/api/gift-cards', minimalData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.giftCard.originalValue).toBe(50);
      expect(data.giftCard.recipientName).toBeUndefined();
    });

    it('should reject gift card below minimum value ($25)', async () => {
      const invalidData = {
        ...validGiftCardData,
        originalValue: 20,
      };

      const res = await request('POST', '/api/gift-cards', invalidData);

      expect(res.status).toBe(400);
    });

    it('should reject gift card above maximum value ($5000)', async () => {
      const invalidData = {
        ...validGiftCardData,
        originalValue: 6000,
      };

      const res = await request('POST', '/api/gift-cards', invalidData);

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Get Gift Card By ID and Code Lookup Tests (4 tests)
  // ===================
  describe('Get Gift Card - GET /api/gift-cards/:id', () => {
    it('should return single gift card by ID', async () => {
      const giftCards = Array.from(getGiftCardStore().values());
      const giftCardId = giftCards[0].id;

      const res = await request('GET', `/api/gift-cards/${giftCardId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.giftCard).toBeDefined();
      expect(data.giftCard.id).toBe(giftCardId);
      expect(data.giftCard.code).toBeDefined();
      expect(data.giftCard.originalValue).toBeDefined();
      expect(data.giftCard.currentBalance).toBeDefined();
    });

    it('should return 404 for non-existent gift card', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/gift-cards/${fakeId}`);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });
  });

  describe('Lookup Gift Card by Code - GET /api/gift-cards/lookup/:code', () => {
    it('should return gift card by code', async () => {
      const res = await request('GET', '/api/gift-cards/lookup/GC-TEST-1234-ABCD');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.giftCard).toBeDefined();
      expect(data.giftCard.code).toBe('GC-TEST-1234-ABCD');
      expect(data.giftCard.isRedeemable).toBeDefined();
    });

    it('should return 404 for non-existent code', async () => {
      const res = await request('GET', '/api/gift-cards/lookup/GC-XXXX-XXXX-XXXX');

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Redeem Gift Card Tests (5 tests)
  // ===================
  describe('Redeem Gift Card - POST /api/gift-cards/:id/redeem', () => {
    it('should redeem active gift card successfully', async () => {
      // Find the active gift card with known balance (GC-TEST-1234-ABCD with $100 balance)
      const giftCards = Array.from(getGiftCardStore().values());
      const activeCard = giftCards.find(gc => gc.code === 'GC-TEST-1234-ABCD');

      if (!activeCard) {
        throw new Error('Test data not set up correctly - no active card');
      }

      const initialBalance = activeCard.currentBalance;

      const redeemData = {
        amount: 25,
        invoiceId: crypto.randomUUID(),
        notes: 'Test redemption',
      };

      const res = await request('POST', `/api/gift-cards/${activeCard.id}/redeem`, redeemData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.transaction).toBeDefined();
      expect(data.transaction.type).toBe('redemption');
      expect(data.transaction.amount).toBe(-25);
      expect(data.transaction.balanceAfter).toBe(initialBalance - 25);
      expect(data.giftCard.currentBalance).toBe(initialBalance - 25);
      expect(data.message).toBe('Gift card redeemed successfully');
    });

    it('should update status to depleted when fully redeemed', async () => {
      const giftCards = Array.from(getGiftCardStore().values());
      const activeCard = giftCards.find(gc => gc.status === 'active');

      if (!activeCard) {
        throw new Error('Test data not set up correctly');
      }

      const redeemData = {
        amount: activeCard.currentBalance, // Full balance
      };

      const res = await request('POST', `/api/gift-cards/${activeCard.id}/redeem`, redeemData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.giftCard.currentBalance).toBe(0);
      expect(data.giftCard.status).toBe('depleted');
    });

    it('should reject redemption exceeding balance', async () => {
      const giftCards = Array.from(getGiftCardStore().values());
      const activeCard = giftCards.find(gc => gc.status === 'active');

      if (!activeCard) {
        throw new Error('Test data not set up correctly');
      }

      const redeemData = {
        amount: activeCard.currentBalance + 100, // More than balance
      };

      const res = await request('POST', `/api/gift-cards/${activeCard.id}/redeem`, redeemData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Insufficient balance');
    });

    it('should reject redemption of expired card', async () => {
      const giftCards = Array.from(getGiftCardStore().values());
      const expiredCard = giftCards.find(gc => gc.status === 'expired');

      if (!expiredCard) {
        throw new Error('Test data not set up correctly - no expired card');
      }

      const res = await request('POST', `/api/gift-cards/${expiredCard.id}/redeem`, {
        amount: 10,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('expired');
    });

    it('should reject redemption of depleted card', async () => {
      const giftCards = Array.from(getGiftCardStore().values());
      const depletedCard = giftCards.find(gc => gc.status === 'depleted');

      if (!depletedCard) {
        throw new Error('Test data not set up correctly - no depleted card');
      }

      const res = await request('POST', `/api/gift-cards/${depletedCard.id}/redeem`, {
        amount: 10,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('no remaining balance');
    });
  });

  // ===================
  // Refund Gift Card Tests (3 tests)
  // ===================
  describe('Refund to Gift Card - POST /api/gift-cards/:id/refund', () => {
    it('should refund to gift card successfully', async () => {
      // Find the partially used gift card with known balance (GC-USED-5678-EFGH with $75 balance)
      const giftCards = Array.from(getGiftCardStore().values());
      const partialCard = giftCards.find(gc => gc.code === 'GC-USED-5678-EFGH');

      if (!partialCard) {
        throw new Error('Test data not set up correctly - no partially used card');
      }

      const initialBalance = partialCard.currentBalance;

      const refundData = {
        amount: 50,
        paymentId: crypto.randomUUID(),
        notes: 'Test refund',
      };

      const res = await request('POST', `/api/gift-cards/${partialCard.id}/refund`, refundData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.transaction).toBeDefined();
      expect(data.transaction.type).toBe('refund');
      expect(data.transaction.amount).toBe(50);
      expect(data.transaction.balanceAfter).toBe(initialBalance + 50);
      expect(data.message).toBe('Refund applied to gift card successfully');
    });

    it('should reject refund exceeding original value', async () => {
      const giftCards = Array.from(getGiftCardStore().values());
      const activeCard = giftCards.find(gc => gc.status === 'active' && gc.currentBalance === gc.originalValue);

      if (!activeCard) {
        throw new Error('Test data not set up correctly');
      }

      const refundData = {
        amount: 100, // Would exceed original value
      };

      const res = await request('POST', `/api/gift-cards/${activeCard.id}/refund`, refundData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('exceed original');
    });

    it('should reject refund to cancelled card', async () => {
      // First deactivate a card
      const giftCards = Array.from(getGiftCardStore().values());
      const activeCard = giftCards.find(gc => gc.status === 'active');

      if (!activeCard) {
        throw new Error('Test data not set up correctly');
      }

      // Deactivate the card
      await request('POST', `/api/gift-cards/${activeCard.id}/deactivate`);

      // Try to refund
      const res = await request('POST', `/api/gift-cards/${activeCard.id}/refund`, {
        amount: 25,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('cancelled');
    });
  });

  // ===================
  // Deactivate Gift Card Tests (2 tests)
  // ===================
  describe('Deactivate Gift Card - POST /api/gift-cards/:id/deactivate', () => {
    it('should deactivate gift card successfully', async () => {
      const giftCards = Array.from(getGiftCardStore().values());
      const activeCard = giftCards.find(gc => gc.status === 'active');

      if (!activeCard) {
        throw new Error('Test data not set up correctly');
      }

      const res = await request('POST', `/api/gift-cards/${activeCard.id}/deactivate`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.giftCard.status).toBe('cancelled');
      expect(data.giftCard.currentBalance).toBe(0);
      expect(data.message).toBe('Gift card deactivated successfully');
    });

    it('should reject deactivating already cancelled card', async () => {
      const giftCards = Array.from(getGiftCardStore().values());
      const activeCard = giftCards.find(gc => gc.status === 'active');

      if (!activeCard) {
        throw new Error('Test data not set up correctly');
      }

      // Deactivate first
      await request('POST', `/api/gift-cards/${activeCard.id}/deactivate`);

      // Try to deactivate again
      const res = await request('POST', `/api/gift-cards/${activeCard.id}/deactivate`);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('already cancelled');
    });
  });

  // ===================
  // Transaction History Tests (3 tests)
  // ===================
  describe('Transaction History - GET /api/gift-cards/:id/transactions', () => {
    it('should return transaction history', async () => {
      const giftCards = Array.from(getGiftCardStore().values());
      const card = giftCards[0];

      const res = await request('GET', `/api/gift-cards/${card.id}/transactions`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();
      expect(data.giftCardId).toBe(card.id);
      expect(data.code).toBe(card.code);
    });

    it('should include purchase transaction', async () => {
      const giftCards = Array.from(getGiftCardStore().values());
      const card = giftCards.find(gc => gc.code === 'GC-TEST-1234-ABCD');

      if (!card) {
        throw new Error('Test data not set up correctly');
      }

      const res = await request('GET', `/api/gift-cards/${card.id}/transactions`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.some((txn: any) => txn.type === 'purchase')).toBe(true);
    });

    it('should return 404 for non-existent gift card', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('GET', `/api/gift-cards/${fakeId}/transactions`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Send Email Tests (2 tests)
  // ===================
  describe('Send Gift Card Email - POST /api/gift-cards/:id/send', () => {
    it('should send gift card email successfully', async () => {
      const giftCards = Array.from(getGiftCardStore().values());
      const activeCard = giftCards.find(gc => gc.status === 'active');

      if (!activeCard) {
        throw new Error('Test data not set up correctly');
      }

      const sendData = {
        recipientEmail: 'new.recipient@example.com',
        recipientName: 'New Recipient',
        customMessage: 'Enjoy!',
      };

      const res = await request('POST', `/api/gift-cards/${activeCard.id}/send`, sendData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.sentTo).toBe('new.recipient@example.com');
      expect(data.message).toBe('Gift card email sent successfully');
    });

    it('should reject sending cancelled gift card', async () => {
      // First deactivate a card
      const giftCards = Array.from(getGiftCardStore().values());
      const activeCard = giftCards.find(gc => gc.status === 'active');

      if (!activeCard) {
        throw new Error('Test data not set up correctly');
      }

      await request('POST', `/api/gift-cards/${activeCard.id}/deactivate`);

      // Try to send
      const res = await request('POST', `/api/gift-cards/${activeCard.id}/send`, {
        recipientEmail: 'test@example.com',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('cancelled');
    });
  });

  // ===================
  // Edge Cases Tests (5 tests)
  // ===================
  describe('Edge Cases', () => {
    it('should handle pending gift card activation on send', async () => {
      const giftCards = Array.from(getGiftCardStore().values());
      const pendingCard = giftCards.find(gc => gc.status === 'pending');

      if (!pendingCard) {
        throw new Error('Test data not set up correctly - no pending card');
      }

      const res = await request('POST', `/api/gift-cards/${pendingCard.id}/send`, {
        recipientEmail: 'recipient@example.com',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.giftCard.status).toBe('active');
    });

    it('should not allow redeeming pending gift card', async () => {
      const giftCards = Array.from(getGiftCardStore().values());
      const pendingCard = giftCards.find(gc => gc.status === 'pending');

      if (!pendingCard) {
        throw new Error('Test data not set up correctly - no pending card');
      }

      const res = await request('POST', `/api/gift-cards/${pendingCard.id}/redeem`, {
        amount: 10,
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('not been activated');
    });

    it('should set default expiration date (2 years from purchase)', async () => {
      const res = await request('POST', '/api/gift-cards', {
        originalValue: 100,
        purchaserName: 'Test User',
        purchaserEmail: 'test@example.com',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.giftCard.expirationDate).toBeDefined();

      const expirationDate = new Date(data.giftCard.expirationDate);
      const now = new Date();
      const twoYearsFromNow = new Date(now);
      twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);

      // Should be approximately 2 years from now (within 1 day tolerance)
      expect(Math.abs(expirationDate.getTime() - twoYearsFromNow.getTime())).toBeLessThan(24 * 60 * 60 * 1000);
    });

    it('should reject invalid gift card code format', async () => {
      const res = await request('GET', '/api/gift-cards/lookup/INVALID-CODE');

      expect(res.status).toBe(400);
    });

    it('should update status to partially_used after partial redemption', async () => {
      const giftCards = Array.from(getGiftCardStore().values());
      const activeCard = giftCards.find(gc => gc.status === 'active' && gc.currentBalance === gc.originalValue);

      if (!activeCard) {
        throw new Error('Test data not set up correctly');
      }

      const res = await request('POST', `/api/gift-cards/${activeCard.id}/redeem`, {
        amount: 10, // Partial redemption
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.giftCard.status).toBe('partially_used');
    });
  });

  // ===================
  // Update Gift Card Tests
  // ===================
  describe('Update Gift Card - PUT /api/gift-cards/:id', () => {
    it('should update gift card recipient info', async () => {
      const giftCards = Array.from(getGiftCardStore().values());
      const card = giftCards[0];

      const updateData = {
        recipientName: 'Updated Recipient',
        recipientEmail: 'updated@example.com',
        recipientMessage: 'Updated message',
      };

      const res = await request('PUT', `/api/gift-cards/${card.id}`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.giftCard.recipientName).toBe('Updated Recipient');
      expect(data.giftCard.recipientEmail).toBe('updated@example.com');
      expect(data.giftCard.recipientMessage).toBe('Updated message');
      expect(data.message).toBe('Gift card updated successfully');
    });

    it('should reject updating cancelled gift card', async () => {
      // First deactivate a card
      const giftCards = Array.from(getGiftCardStore().values());
      const activeCard = giftCards.find(gc => gc.status === 'active');

      if (!activeCard) {
        throw new Error('Test data not set up correctly');
      }

      await request('POST', `/api/gift-cards/${activeCard.id}/deactivate`);

      // Try to update
      const res = await request('PUT', `/api/gift-cards/${activeCard.id}`, {
        recipientName: 'New Name',
      });

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent gift card', async () => {
      const fakeId = crypto.randomUUID();
      const res = await request('PUT', `/api/gift-cards/${fakeId}`, {
        recipientName: 'Test',
      });

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Additional Filter Tests
  // ===================
  describe('Additional List Filters', () => {
    it('should filter by balance range', async () => {
      const res = await request('GET', '/api/gift-cards?minBalance=50&maxBalance=100');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((gc: any) =>
        gc.currentBalance >= 50 && gc.currentBalance <= 100
      )).toBe(true);
    });

    it('should sort by current balance descending', async () => {
      const res = await request('GET', '/api/gift-cards?sortBy=currentBalance&sortOrder=desc');

      expect(res.status).toBe(200);
      const data = await res.json();
      const balances = data.items.map((gc: any) => gc.currentBalance);
      const sortedBalances = [...balances].sort((a, b) => b - a);
      expect(balances).toEqual(sortedBalances);
    });
  });

  // ===================
  // Complex Transaction Scenarios
  // ===================
  describe('Complex Transaction Scenarios', () => {
    it('should track multiple redemptions correctly', async () => {
      const giftCards = Array.from(getGiftCardStore().values());
      const activeCard = giftCards.find(gc => gc.status === 'active' && gc.currentBalance >= 50);

      if (!activeCard) {
        throw new Error('Test data not set up correctly');
      }

      // First redemption
      await request('POST', `/api/gift-cards/${activeCard.id}/redeem`, { amount: 20 });

      // Second redemption
      await request('POST', `/api/gift-cards/${activeCard.id}/redeem`, { amount: 15 });

      // Check transaction history
      const res = await request('GET', `/api/gift-cards/${activeCard.id}/transactions`);
      const data = await res.json();

      // Should have purchase + 2 redemptions
      const redemptions = data.items.filter((txn: any) => txn.type === 'redemption');
      expect(redemptions.length).toBe(2);
    });

    it('should correctly refund after redemption', async () => {
      // Find a partially used card
      const giftCards = Array.from(getGiftCardStore().values());
      const partialCard = giftCards.find(gc => gc.status === 'partially_used');

      if (!partialCard) {
        throw new Error('Test data not set up correctly');
      }

      const originalBalance = partialCard.currentBalance;

      // Refund some amount
      const refundAmount = 25;
      const res = await request('POST', `/api/gift-cards/${partialCard.id}/refund`, {
        amount: refundAmount,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.giftCard.currentBalance).toBe(originalBalance + refundAmount);
    });
  });
});
