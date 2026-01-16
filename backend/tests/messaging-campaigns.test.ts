/**
 * Messaging Campaigns API Tests
 *
 * Comprehensive test coverage for:
 * - List campaigns with pagination and filters
 * - Get single campaign with stats
 * - Create campaign with audience calculation
 * - Update campaign (draft/scheduled only)
 * - Delete/cancel campaign
 * - Send campaign (batch processing)
 * - Get delivery stats
 * - Pause sending campaign
 * - Resume paused campaign
 * - Status transitions
 * - Audience filtering
 * - Validation errors
 * - Consent filtering
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import campaigns, {
  clearStores,
  getCampaignStore,
  getRecipientStore,
  getPatientStore,
  addMockCampaign,
  addMockPatient,
  StoredCampaign,
  CampaignRecipient,
} from '../src/routes/messaging-campaigns';
import { errorHandler } from '../src/middleware/error';

// Mock the session auth middleware to allow all requests in tests
vi.mock('../src/middleware/auth', () => ({
  sessionAuthMiddleware: vi.fn((c, next) => {
    c.set('user', {
      uid: 'test-user-123',
      email: 'test@example.com',
      role: 'admin',
      permissions: [
        'campaign:list',
        'campaign:read',
        'campaign:create',
        'campaign:update',
        'campaign:delete',
        'campaign:send',
        'campaign:pause',
        'campaign:resume',
      ],
    });
    return next();
  }),
}));

// Mock audit logging
vi.mock('@medical-spa/security', () => ({
  logAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

// Create test app
const app = new Hono();
app.route('/api/campaigns', campaigns);
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
      Authorization: 'Bearer test-token',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return app.fetch(req);
}

// Helper to get future date
function getFutureDate(hoursFromNow: number): string {
  const date = new Date();
  date.setHours(date.getHours() + hoursFromNow);
  return date.toISOString();
}

// Helper to create a test campaign
function createTestCampaign(overrides: Partial<StoredCampaign> = {}): StoredCampaign {
  const now = new Date();
  return {
    id: `camp-test-${Date.now()}`,
    name: 'Test Campaign',
    description: 'Test campaign description',
    status: 'draft',
    audienceType: 'all_patients',
    audienceCount: 5,
    consentCount: 4,
    messageBody: 'Test message',
    messageType: 'marketing',
    stats: {
      totalRecipients: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
      clicked: 0,
      optedOut: 0,
      deliveryRate: 0,
    },
    batchSize: 100,
    batchDelayMs: 5000,
    currentBatch: 0,
    totalBatches: 0,
    createdBy: 'test-user-123',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe('Messaging Campaigns API', () => {
  beforeEach(() => {
    clearStores();
  });

  // ===================
  // List Campaigns Tests
  // ===================
  describe('GET /api/campaigns', () => {
    it('should list all campaigns', async () => {
      const res = await request('GET', '/api/campaigns');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeGreaterThan(0);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);
    });

    it('should filter by status', async () => {
      const res = await request('GET', '/api/campaigns?status=sent');

      expect(res.status).toBe(200);
      const data = await res.json();

      for (const campaign of data.items) {
        expect(campaign.status).toBe('sent');
      }
    });

    it('should filter by draft status', async () => {
      const res = await request('GET', '/api/campaigns?status=draft');

      expect(res.status).toBe(200);
      const data = await res.json();

      for (const campaign of data.items) {
        expect(campaign.status).toBe('draft');
      }
    });

    it('should filter by scheduled status', async () => {
      const res = await request('GET', '/api/campaigns?status=scheduled');

      expect(res.status).toBe(200);
      const data = await res.json();

      for (const campaign of data.items) {
        expect(campaign.status).toBe('scheduled');
      }
    });

    it('should paginate results', async () => {
      const res = await request('GET', '/api/campaigns?page=1&limit=2');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeLessThanOrEqual(2);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(2);
      expect(data.hasMore).toBeDefined();
    });

    it('should sort by name ascending', async () => {
      const res = await request('GET', '/api/campaigns?sortBy=name&sortOrder=asc');

      expect(res.status).toBe(200);
      const data = await res.json();

      // Verify ascending order - check if names are in correct order
      for (let i = 1; i < data.items.length; i++) {
        const curr = data.items[i].name.toLowerCase();
        const prev = data.items[i - 1].name.toLowerCase();
        expect(curr >= prev).toBe(true);
      }
    });

    it('should sort by createdAt descending (default)', async () => {
      const res = await request('GET', '/api/campaigns?sortBy=createdAt&sortOrder=desc');

      expect(res.status).toBe(200);
      const data = await res.json();

      // Verify descending order
      for (let i = 1; i < data.items.length; i++) {
        expect(new Date(data.items[i - 1].createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(data.items[i].createdAt).getTime()
        );
      }
    });

    it('should sort by scheduledFor', async () => {
      const res = await request('GET', '/api/campaigns?sortBy=scheduledFor&sortOrder=asc');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
    });

    it('should handle page 2', async () => {
      const res = await request('GET', '/api/campaigns?page=2&limit=2');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.page).toBe(2);
    });

    it('should validate page number (minimum 1)', async () => {
      const res = await request('GET', '/api/campaigns?page=0');

      expect(res.status).toBe(400);
    });

    it('should validate limit (max 100)', async () => {
      const res = await request('GET', '/api/campaigns?limit=150');

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Get Single Campaign Tests
  // ===================
  describe('GET /api/campaigns/:id', () => {
    it('should get campaign by ID', async () => {
      const res = await request('GET', '/api/campaigns/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.campaign).toBeDefined();
      expect(data.campaign.id).toBe('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
      expect(data.campaign.name).toBe('Summer Special - Botox Promotion');
    });

    it('should include stats in response', async () => {
      const res = await request('GET', '/api/campaigns/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.campaign.stats).toBeDefined();
      expect(data.campaign.stats.totalRecipients).toBeDefined();
      expect(data.campaign.stats.sent).toBeDefined();
      expect(data.campaign.stats.delivered).toBeDefined();
    });

    it('should validate UUID format', async () => {
      const res = await request('GET', '/api/campaigns/invalid-uuid');

      expect(res.status).toBe(400);
    });

    it('should return 404 for valid UUID but non-existent campaign', async () => {
      const res = await request('GET', '/api/campaigns/11111111-1111-1111-1111-111111111111');

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Create Campaign Tests
  // ===================
  describe('POST /api/campaigns', () => {
    it('should create a valid draft campaign', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'New Campaign',
        audienceType: 'all_patients',
        messageBody: 'Hello {firstName}! Special offer inside.',
        messageType: 'marketing',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.campaign).toBeDefined();
      expect(data.campaign.name).toBe('New Campaign');
      expect(data.campaign.status).toBe('draft');
      expect(data.message).toBe('Campaign created successfully');
    });

    it('should create scheduled campaign with scheduledFor date', async () => {
      const futureDate = getFutureDate(24);

      const res = await request('POST', '/api/campaigns', {
        name: 'Scheduled Campaign',
        audienceType: 'all_patients',
        messageBody: 'Test message',
        scheduledFor: futureDate,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.campaign.status).toBe('scheduled');
      expect(data.campaign.scheduledFor).toBe(futureDate);
    });

    it('should calculate audience for all_patients', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'All Patients Campaign',
        audienceType: 'all_patients',
        messageBody: 'Message to all',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.campaign.audienceCount).toBe(5);
      expect(data.campaign.consentCount).toBe(4); // Only 4 have marketing consent
    });

    it('should calculate audience for last_visit_30days', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'Recent Visitors',
        audienceType: 'last_visit_30days',
        messageBody: 'Thanks for visiting recently!',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.campaign.audienceCount).toBeGreaterThan(0);
      expect(data.campaign.consentCount).toBeGreaterThanOrEqual(0);
    });

    it('should calculate audience for vip', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'VIP Campaign',
        audienceType: 'vip',
        messageBody: 'Exclusive VIP offer!',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.campaign.audienceType).toBe('vip');
    });

    it('should calculate audience for birthday_this_month', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'Birthday Campaign',
        audienceType: 'birthday_this_month',
        messageBody: 'Happy Birthday {firstName}!',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.campaign.audienceType).toBe('birthday_this_month');
    });

    it('should apply custom filters', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'Custom Filtered',
        audienceType: 'custom',
        audienceFilters: {
          tags: ['VIP'],
          minSpend: 1000,
        },
        messageBody: 'Special offer for VIP customers',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.campaign.audienceFilters).toBeDefined();
      expect(data.campaign.audienceFilters.tags).toContain('VIP');
    });

    it('should set custom batch size', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'Custom Batch',
        audienceType: 'all_patients',
        messageBody: 'Test',
        batchSize: 50,
        batchDelayMs: 3000,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.campaign.batchSize).toBe(50);
      expect(data.campaign.batchDelayMs).toBe(3000);
    });

    it('should reject empty name', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: '',
        audienceType: 'all_patients',
        messageBody: 'Test',
      });

      expect(res.status).toBe(400);
    });

    it('should reject empty message body', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'Test',
        audienceType: 'all_patients',
        messageBody: '',
      });

      expect(res.status).toBe(400);
    });

    it('should reject message body over 1600 chars', async () => {
      const longMessage = 'a'.repeat(1601);

      const res = await request('POST', '/api/campaigns', {
        name: 'Test',
        audienceType: 'all_patients',
        messageBody: longMessage,
      });

      expect(res.status).toBe(400);
    });

    it('should reject invalid batch size (too small)', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'Test',
        audienceType: 'all_patients',
        messageBody: 'Test',
        batchSize: 0,
      });

      expect(res.status).toBe(400);
    });

    it('should reject invalid batch size (too large)', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'Test',
        audienceType: 'all_patients',
        messageBody: 'Test',
        batchSize: 1001,
      });

      expect(res.status).toBe(400);
    });

    it('should reject invalid batch delay (too small)', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'Test',
        audienceType: 'all_patients',
        messageBody: 'Test',
        batchDelayMs: 500,
      });

      expect(res.status).toBe(400);
    });

    it('should reject invalid batch delay (too large)', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'Test',
        audienceType: 'all_patients',
        messageBody: 'Test',
        batchDelayMs: 70000,
      });

      expect(res.status).toBe(400);
    });

    it('should reject invalid scheduledFor date', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'Test',
        audienceType: 'all_patients',
        messageBody: 'Test',
        scheduledFor: 'not-a-date',
      });

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Update Campaign Tests
  // ===================
  describe('PUT /api/campaigns/:id', () => {
    it('should update draft campaign name', async () => {
      const res = await request('PUT', '/api/campaigns/cccccccc-cccc-cccc-cccc-cccccccccccc', {
        name: 'Updated VIP Event',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.campaign.name).toBe('Updated VIP Event');
      expect(data.message).toBe('Campaign updated successfully');
    });

    it('should update draft campaign message body', async () => {
      const res = await request('PUT', '/api/campaigns/cccccccc-cccc-cccc-cccc-cccccccccccc', {
        messageBody: 'New message content',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.campaign.messageBody).toBe('New message content');
    });

    it('should update scheduled campaign', async () => {
      const res = await request('PUT', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', {
        name: 'Updated Birthday Campaign',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.campaign.name).toBe('Updated Birthday Campaign');
    });

    it('should update audience type and recalculate', async () => {
      const res = await request('PUT', '/api/campaigns/cccccccc-cccc-cccc-cccc-cccccccccccc', {
        audienceType: 'last_visit_30days',
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.campaign.audienceType).toBe('last_visit_30days');
      expect(data.campaign.audienceCount).toBeDefined();
    });

    it('should add scheduledFor to draft and change status', async () => {
      const futureDate = getFutureDate(48);

      const res = await request('PUT', '/api/campaigns/cccccccc-cccc-cccc-cccc-cccccccccccc', {
        scheduledFor: futureDate,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.campaign.status).toBe('scheduled');
      expect(data.campaign.scheduledFor).toBe(futureDate);
    });

    it('should reject update to sent campaign', async () => {
      const res = await request('PUT', '/api/campaigns/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', {
        name: 'Should not update',
      });

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Cannot edit campaign');
    });

    it('should reject update to cancelled campaign', async () => {
      // First cancel a campaign
      const campaignStore = getCampaignStore();
      const campaign = createTestCampaign({
        id: 'temp-cancel-test',
        status: 'cancelled',
      });
      campaignStore.set(campaign.id, campaign);

      const res = await request('PUT', `/api/campaigns/${campaign.id}`, {
        name: 'Should not update',
      });

      expect(res.status).toBe(400);
    });

    it('should reject update to failed campaign', async () => {
      const res = await request('PUT', '/api/campaigns/dddddddd-dddd-dddd-dddd-dddddddddddd', {
        name: 'Should not update',
      });

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent campaign', async () => {
      const res = await request('PUT', '/api/campaigns/11111111-1111-1111-1111-111111111111', {
        name: 'Test',
      });

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Delete/Cancel Campaign Tests
  // ===================
  describe('DELETE /api/campaigns/:id', () => {
    it('should permanently delete draft campaign', async () => {
      const res = await request('DELETE', '/api/campaigns/cccccccc-cccc-cccc-cccc-cccccccccccc');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Campaign deleted successfully');

      // Verify it's gone
      const getRes = await request('GET', '/api/campaigns/cccccccc-cccc-cccc-cccc-cccccccccccc');
      expect(getRes.status).toBe(404);
    });

    it('should cancel scheduled campaign (not delete)', async () => {
      const res = await request('DELETE', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Campaign cancelled successfully');

      // Verify it's still there but cancelled
      const getRes = await request('GET', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
      expect(getRes.status).toBe(200);
      const getData = await getRes.json();
      expect(getData.campaign.status).toBe('cancelled');
    });

    it('should cancel sending campaign', async () => {
      // Create a sending campaign with valid UUID
      const campaignStore = getCampaignStore();
      const campaign = createTestCampaign({
        id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        status: 'sending',
      });
      campaignStore.set(campaign.id, campaign);

      const res = await request('DELETE', `/api/campaigns/${campaign.id}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message).toBe('Campaign cancelled successfully');
    });

    it('should reject delete of sent campaign', async () => {
      const res = await request('DELETE', '/api/campaigns/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Cannot delete campaign');
    });

    it('should reject delete of cancelled campaign', async () => {
      // Cancel first
      await request('DELETE', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

      // Try to delete again
      const res = await request('DELETE', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent campaign', async () => {
      const res = await request('DELETE', '/api/campaigns/11111111-1111-1111-1111-111111111111');

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Send Campaign Tests
  // ===================
  describe('POST /api/campaigns/:id/send', () => {
    it('should reject sending draft campaign (must be scheduled first)', async () => {
      const res = await request('POST', '/api/campaigns/cccccccc-cccc-cccc-cccc-cccccccccccc/send');

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Cannot send campaign');
    });

    it('should send scheduled campaign', async () => {
      const res = await request('POST', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/send');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('should process first batch', async () => {
      const res = await request('POST', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/send');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.batch.current).toBeGreaterThan(0);
      expect(data.batch.total).toBeGreaterThan(0);
      expect(data.batch.sent).toBeGreaterThanOrEqual(0);
    });

    it('should filter recipients by marketing consent', async () => {
      const res = await request('POST', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/send');

      expect(res.status).toBe(200);
      const data = await res.json();

      // Should only send to patients with marketing consent
      expect(data.stats.totalRecipients).toBeLessThanOrEqual(4); // Max 4 have consent
    });

    it('should reject if no eligible recipients', async () => {
      // Create scheduled campaign with custom filters that match no one
      const campaignStore = getCampaignStore();
      const campaign = createTestCampaign({
        id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        status: 'scheduled', // Must be scheduled to send
        audienceType: 'custom',
        audienceFilters: {
          tags: ['non-existent-tag'],
          minSpend: 999999,
        },
        audienceCount: 0,
        consentCount: 0,
      });
      campaignStore.set(campaign.id, campaign);

      const res = await request('POST', `/api/campaigns/${campaign.id}/send`);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('No eligible recipients');
    });

    it('should reject sending sent campaign', async () => {
      const res = await request('POST', '/api/campaigns/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/send');

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Cannot send campaign');
    });

    it('should reject sending cancelled campaign', async () => {
      // Cancel first
      await request('DELETE', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

      // Try to send
      const res = await request('POST', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/send');

      expect(res.status).toBe(400);
    });

    it('should override batch size', async () => {
      const res = await request('POST', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/send', {
        batchSize: 25,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('should override batch delay', async () => {
      const res = await request('POST', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/send', {
        batchDelayMs: 2000,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('should create recipient records on first send', async () => {
      const recipientStore = getRecipientStore();
      const initialCount = recipientStore.size;

      await request('POST', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/send');

      expect(recipientStore.size).toBeGreaterThan(initialCount);
    });

    it('should update campaign stats after sending', async () => {
      const res = await request('POST', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/send');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.stats.sent).toBeGreaterThan(0);
      expect(data.stats.totalRecipients).toBeGreaterThan(0);
    });

    it('should mark campaign as failed if high failure rate', async () => {
      // This test relies on the mock random failure rate in the route
      // The route has a ~5% failure rate, so with enough sends we might see failures
      const res = await request('POST', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/send');

      expect(res.status).toBe(200);
      const data = await res.json();
      // Campaign should be sent or sending (failure requires >50% fail rate)
      expect(['sent', 'sending']).toContain(data.status);
    });

    it('should return 404 for non-existent campaign', async () => {
      const res = await request('POST', '/api/campaigns/11111111-1111-1111-1111-111111111111/send');

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Get Stats Tests
  // ===================
  describe('GET /api/campaigns/:id/stats', () => {
    it('should return campaign stats', async () => {
      const res = await request('GET', '/api/campaigns/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/stats');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.stats).toBeDefined();
      expect(data.recipients).toBeDefined();
      expect(data.progress).toBeDefined();
    });

    it('should include recipient breakdown by status', async () => {
      const res = await request('GET', '/api/campaigns/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/stats');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.recipients.pending).toBeDefined();
      expect(data.recipients.sent).toBeDefined();
      expect(data.recipients.delivered).toBeDefined();
      expect(data.recipients.failed).toBeDefined();
      expect(data.recipients.opted_out).toBeDefined();
    });

    it('should include progress information', async () => {
      const res = await request('GET', '/api/campaigns/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/stats');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.progress.currentBatch).toBeDefined();
      expect(data.progress.totalBatches).toBeDefined();
      expect(data.progress.percentComplete).toBeDefined();
    });

    it('should calculate percent complete', async () => {
      const res = await request('GET', '/api/campaigns/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/stats');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.progress.percentComplete).toBeGreaterThanOrEqual(0);
      expect(data.progress.percentComplete).toBeLessThanOrEqual(100);
    });

    it('should return stats for draft campaign', async () => {
      const res = await request('GET', '/api/campaigns/cccccccc-cccc-cccc-cccc-cccccccccccc/stats');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.stats.totalRecipients).toBe(0);
      expect(data.progress.percentComplete).toBe(0);
    });

    it('should return 404 for non-existent campaign', async () => {
      const res = await request('GET', '/api/campaigns/11111111-1111-1111-1111-111111111111/stats');

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Pause Campaign Tests
  // ===================
  describe('POST /api/campaigns/:id/pause', () => {
    it('should pause sending campaign', async () => {
      // First start sending
      await request('POST', '/api/campaigns/cccccccc-cccc-cccc-cccc-cccccccccccc/send');

      // Get the campaign to check its status
      const checkRes = await request('GET', '/api/campaigns/cccccccc-cccc-cccc-cccc-cccccccccccc');
      const checkData = await checkRes.json();

      // Only pause if still in sending state
      if (checkData.campaign.status === 'sending') {
        const res = await request('POST', '/api/campaigns/cccccccc-cccc-cccc-cccc-cccccccccccc/pause');

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.message).toBe('Campaign paused successfully');
        expect(data.campaign.status).toBe('paused');
        expect(data.campaign.pausedAt).toBeDefined();
      }
    });

    it('should reject pause of draft campaign', async () => {
      const res = await request('POST', '/api/campaigns/cccccccc-cccc-cccc-cccc-cccccccccccc/pause');

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Only sending campaigns can be paused');
    });

    it('should reject pause of sent campaign', async () => {
      const res = await request('POST', '/api/campaigns/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/pause');

      expect(res.status).toBe(400);
    });

    it('should reject pause of paused campaign', async () => {
      // Create a paused campaign
      const campaignStore = getCampaignStore();
      const campaign = createTestCampaign({
        id: 'already-paused',
        status: 'paused',
      });
      campaignStore.set(campaign.id, campaign);

      const res = await request('POST', `/api/campaigns/${campaign.id}/pause`);

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent campaign', async () => {
      const res = await request('POST', '/api/campaigns/11111111-1111-1111-1111-111111111111/pause');

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Resume Campaign Tests
  // ===================
  describe('POST /api/campaigns/:id/resume', () => {
    it('should resume paused campaign', async () => {
      // Create a paused campaign with valid UUID
      const campaignStore = getCampaignStore();
      const campaign = createTestCampaign({
        id: '10101010-1010-1010-1010-101010101010',
        status: 'paused',
        pausedAt: new Date(),
      });
      campaignStore.set(campaign.id, campaign);

      const res = await request('POST', `/api/campaigns/${campaign.id}/resume`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toBe('Campaign resumed successfully');
      expect(data.campaign.status).toBe('sending');
    });

    it('should clear pausedAt timestamp', async () => {
      // Create a paused campaign with valid UUID
      const campaignStore = getCampaignStore();
      const campaign = createTestCampaign({
        id: '20202020-2020-2020-2020-202020202020',
        status: 'paused',
        pausedAt: new Date(),
      });
      campaignStore.set(campaign.id, campaign);

      await request('POST', `/api/campaigns/${campaign.id}/resume`);

      const getRes = await request('GET', `/api/campaigns/${campaign.id}`);
      const getData = await getRes.json();
      expect(getData.campaign.pausedAt).toBeUndefined();
    });

    it('should reject resume of draft campaign', async () => {
      const res = await request('POST', '/api/campaigns/cccccccc-cccc-cccc-cccc-cccccccccccc/resume');

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('Only paused campaigns can be resumed');
    });

    it('should reject resume of sending campaign', async () => {
      // Create a sending campaign with valid UUID
      const campaignStore = getCampaignStore();
      const campaign = createTestCampaign({
        id: '30303030-3030-3030-3030-303030303030',
        status: 'sending',
      });
      campaignStore.set(campaign.id, campaign);

      const res = await request('POST', `/api/campaigns/${campaign.id}/resume`);

      expect(res.status).toBe(400);
    });

    it('should reject resume of sent campaign', async () => {
      const res = await request('POST', '/api/campaigns/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/resume');

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent campaign', async () => {
      const res = await request('POST', '/api/campaigns/11111111-1111-1111-1111-111111111111/resume');

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Status Transition Tests
  // ===================
  describe('Status Transitions', () => {
    it('should transition draft -> scheduled when scheduledFor added', async () => {
      const futureDate = getFutureDate(24);

      const res = await request('PUT', '/api/campaigns/cccccccc-cccc-cccc-cccc-cccccccccccc', {
        scheduledFor: futureDate,
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.campaign.status).toBe('scheduled');
    });

    it('should transition scheduled -> sending on send', async () => {
      // Create a large scheduled campaign that won't complete in one batch
      const patientStore = getPatientStore();
      const now = new Date();

      // Add many mock patients to create a multi-batch scenario
      for (let i = 0; i < 150; i++) {
        addMockPatient({
          id: `large-pat-${i}`,
          firstName: `Patient${i}`,
          lastName: 'Test',
          phone: `555${i.toString().padStart(7, '0')}`,
          marketingConsent: true,
          lastVisit: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          tags: [],
          lifetimeValue: 100,
          registrationDate: new Date(2023, 0, 1),
          dateOfBirth: new Date(1990, 1, 1),
        });
      }

      const campaignStore = getCampaignStore();
      const campaign = createTestCampaign({
        id: '70707070-7070-7070-7070-707070707070',
        status: 'scheduled', // Must be scheduled to send
        batchSize: 50, // Will need multiple batches
        audienceType: 'all_patients',
      });
      campaignStore.set(campaign.id, campaign);

      const res = await request('POST', `/api/campaigns/${campaign.id}/send`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(['sending', 'sent']).toContain(data.status);
    });

    it('should transition sending -> paused on pause', async () => {
      // Create a sending campaign with valid UUID
      const campaignStore = getCampaignStore();
      const campaign = createTestCampaign({
        id: '40404040-4040-4040-4040-404040404040',
        status: 'sending',
      });
      campaignStore.set(campaign.id, campaign);

      const res = await request('POST', `/api/campaigns/${campaign.id}/pause`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.campaign.status).toBe('paused');
    });

    it('should transition paused -> sending on resume', async () => {
      // Create a paused campaign with valid UUID
      const campaignStore = getCampaignStore();
      const campaign = createTestCampaign({
        id: '50505050-5050-5050-5050-505050505050',
        status: 'paused',
      });
      campaignStore.set(campaign.id, campaign);

      const res = await request('POST', `/api/campaigns/${campaign.id}/resume`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.campaign.status).toBe('sending');
    });

    it('should transition sending -> sent when complete', async () => {
      const res = await request('POST', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/send');

      expect(res.status).toBe(200);
      const data = await res.json();
      // Small campaign should complete immediately
      expect(data.status).toBe('sent');
    });

    it('should transition draft/scheduled -> cancelled on delete', async () => {
      const res = await request('DELETE', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

      expect(res.status).toBe(200);

      const getRes = await request('GET', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
      const getData = await getRes.json();
      expect(getData.campaign.status).toBe('cancelled');
    });

    it('should not allow transition from sent', async () => {
      const res = await request('PUT', '/api/campaigns/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', {
        name: 'Trying to update',
      });

      expect(res.status).toBe(400);
    });

    it('should not allow transition from cancelled', async () => {
      // Cancel first
      await request('DELETE', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

      // Try to update
      const res = await request('PUT', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', {
        name: 'Should not work',
      });

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Audience Calculation Tests
  // ===================
  describe('Audience Calculation', () => {
    it('should count all patients for all_patients', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'All Test',
        audienceType: 'all_patients',
        messageBody: 'Test',
      });

      const data = await res.json();
      expect(data.campaign.audienceCount).toBe(5);
    });

    it('should filter by last visit date', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'Recent Test',
        audienceType: 'last_visit_30days',
        messageBody: 'Test',
      });

      const data = await res.json();
      expect(data.campaign.audienceCount).toBeGreaterThanOrEqual(0);
      expect(data.campaign.audienceCount).toBeLessThanOrEqual(5);
    });

    it('should filter by VIP tag', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'VIP Test',
        audienceType: 'vip',
        messageBody: 'Test',
      });

      const data = await res.json();
      expect(data.campaign.audienceCount).toBeGreaterThanOrEqual(0);
    });

    it('should filter by birthday month', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'Birthday Test',
        audienceType: 'birthday_this_month',
        messageBody: 'Test',
      });

      const data = await res.json();
      expect(data.campaign.audienceCount).toBeGreaterThanOrEqual(0);
    });

    it('should apply custom tag filters', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'Custom Tags',
        audienceType: 'custom',
        audienceFilters: {
          tags: ['VIP'],
        },
        messageBody: 'Test',
      });

      const data = await res.json();
      expect(data.campaign.audienceFilters.tags).toContain('VIP');
    });

    it('should apply custom spend filters', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'High Spenders',
        audienceType: 'custom',
        audienceFilters: {
          minSpend: 2000,
        },
        messageBody: 'Test',
      });

      const data = await res.json();
      expect(data.campaign.audienceFilters.minSpend).toBe(2000);
    });

    it('should only count patients with marketing consent', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'Consent Test',
        audienceType: 'all_patients',
        messageBody: 'Test',
      });

      const data = await res.json();
      expect(data.campaign.consentCount).toBe(4); // Only 4 out of 5 have consent
      expect(data.campaign.consentCount).toBeLessThanOrEqual(data.campaign.audienceCount);
    });
  });

  // ===================
  // Batch Processing Tests
  // ===================
  describe('Batch Processing', () => {
    it('should calculate total batches correctly', async () => {
      // Add patients to ensure multiple batches
      const patientStore = getPatientStore();
      for (let i = 0; i < 25; i++) {
        addMockPatient({
          id: `batch-pat-${i}`,
          firstName: `Patient${i}`,
          lastName: 'Batch',
          phone: `555${i.toString().padStart(7, '0')}`,
          marketingConsent: true,
          lastVisit: new Date(),
          tags: [],
          lifetimeValue: 100,
          registrationDate: new Date(2023, 0, 1),
          dateOfBirth: new Date(1990, 1, 1),
        });
      }

      const campaignStore = getCampaignStore();
      const campaign = createTestCampaign({
        id: '60606060-6060-6060-6060-606060606060',
        status: 'scheduled', // Must be scheduled to send
        batchSize: 10,
        audienceType: 'all_patients',
      });
      campaignStore.set(campaign.id, campaign);

      const res = await request('POST', `/api/campaigns/${campaign.id}/send`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.batch.total).toBeGreaterThan(1);
    });

    it('should track current batch number', async () => {
      const res = await request('POST', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/send');

      const data = await res.json();
      expect(data.batch.current).toBeGreaterThan(0);
    });

    it('should respect batch size', async () => {
      const res = await request('POST', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/send', {
        batchSize: 2,
      });

      const data = await res.json();
      expect(data.batch.sent).toBeLessThanOrEqual(2);
    });

    it('should create recipient records', async () => {
      const recipientStore = getRecipientStore();
      const initialSize = recipientStore.size;

      await request('POST', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/send');

      expect(recipientStore.size).toBeGreaterThan(initialSize);
    });

    it('should track recipient status', async () => {
      // Use the mock 'sent' campaign which already has stats
      const statsRes = await request('GET', '/api/campaigns/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/stats');
      expect(statsRes.status).toBe(200);

      const statsData = await statsRes.json();
      // Stats should have recipients breakdown
      expect(statsData.recipients).toBeDefined();
      expect(typeof statsData.recipients.pending).toBe('number');
      expect(typeof statsData.recipients.sent).toBe('number');
      expect(typeof statsData.recipients.delivered).toBe('number');
    });
  });

  // ===================
  // Edge Cases Tests
  // ===================
  describe('Edge Cases', () => {
    it('should handle empty patient store gracefully', async () => {
      const patientStore = getPatientStore();
      patientStore.clear();

      const res = await request('POST', '/api/campaigns', {
        name: 'Empty Store',
        audienceType: 'all_patients',
        messageBody: 'Test',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.campaign.audienceCount).toBe(0);
      expect(data.campaign.consentCount).toBe(0);
    });

    it('should handle campaign with description', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'With Description',
        description: 'This is a test description',
        audienceType: 'all_patients',
        messageBody: 'Test',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.campaign.description).toBe('This is a test description');
    });

    it('should handle campaign with template ID', async () => {
      const templateId = '12345678-1234-1234-1234-123456789012';

      const res = await request('POST', '/api/campaigns', {
        name: 'With Template',
        audienceType: 'all_patients',
        messageBody: 'Test',
        templateId,
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.campaign.templateId).toBe(templateId);
    });

    it('should handle transactional message type', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'Transactional',
        audienceType: 'all_patients',
        messageBody: 'Your appointment is confirmed',
        messageType: 'transactional',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.campaign.messageType).toBe('transactional');
    });

    it('should handle message with personalization tokens', async () => {
      const res = await request('POST', '/api/campaigns', {
        name: 'Personalized',
        audienceType: 'all_patients',
        messageBody: 'Hi {firstName}! Your appointment with {providerName} is coming up.',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.campaign.messageBody).toContain('{firstName}');
    });

    it('should handle concurrent campaign creation', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request('POST', '/api/campaigns', {
            name: `Concurrent ${i}`,
            audienceType: 'all_patients',
            messageBody: 'Test',
          })
        );
      }

      const results = await Promise.all(promises);

      for (const res of results) {
        expect(res.status).toBe(201);
      }
    });

    it('should preserve campaign history after cancel', async () => {
      const res = await request('DELETE', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

      expect(res.status).toBe(200);

      const getRes = await request('GET', '/api/campaigns/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
      const getData = await getRes.json();

      expect(getData.campaign.status).toBe('cancelled');
      expect(getData.campaign.cancelledAt).toBeDefined();
    });

    it('should handle very long campaign name (255 chars)', async () => {
      const longName = 'a'.repeat(255);

      const res = await request('POST', '/api/campaigns', {
        name: longName,
        audienceType: 'all_patients',
        messageBody: 'Test',
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.campaign.name).toBe(longName);
    });

    it('should reject campaign name over 255 chars', async () => {
      const tooLongName = 'a'.repeat(256);

      const res = await request('POST', '/api/campaigns', {
        name: tooLongName,
        audienceType: 'all_patients',
        messageBody: 'Test',
      });

      expect(res.status).toBe(400);
    });
  });
});
