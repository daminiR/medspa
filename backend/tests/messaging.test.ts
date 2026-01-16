/**
 * Messaging API Tests
 *
 * Comprehensive test coverage for:
 * - List conversations with pagination and filters
 * - Get single conversation
 * - Create conversation
 * - Update conversation
 * - Mark conversation as read
 * - Get conversation messages
 * - Send single SMS
 * - Send bulk SMS with batching
 * - Get message by ID
 * - Get message delivery status
 * - Schedule message
 * - List scheduled messages
 * - Cancel scheduled message
 * - Validation errors
 * - Authentication
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import messaging, {
  clearStores,
  getConversationStore,
  getMessageStore,
  getScheduledMessageStore,
  addMockConversation,
  addMockMessage,
  StoredConversation,
  StoredMessage,
} from '../src/routes/messaging';
import { errorHandler } from '../src/middleware/error';
import { sessionStore } from '../src/middleware/auth';
import crypto from 'crypto';

// Create test app with error handler
const app = new Hono();
app.route('/', messaging);
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
    permissions: ['messaging:read', 'messaging:create', 'messaging:update', 'messaging:delete'],
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

// Valid test data
const validConversationData = {
  patientId: 'pat-test-001',
  patientName: 'Test Patient',
  patientPhone: '5551112222',
  patientEmail: 'test@example.com',
  channel: 'sms' as const,
  priority: 'normal' as const,
  tags: ['test'],
};

const validMessageData = {
  patientId: 'pat-001',
  to: '+15551234567',
  body: 'Test message body',
  channel: 'sms' as const,
};

describe('Messaging API', () => {
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
      const res = await unauthenticatedRequest('GET', '/conversations');
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const req = new Request('http://localhost/conversations', {
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
  // List Conversations Tests
  // ===================
  describe('List Conversations - GET /conversations', () => {
    it('should return paginated list of conversations', async () => {
      const res = await request('GET', '/conversations');

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
      const res = await request('GET', '/conversations?page=1&limit=2');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeLessThanOrEqual(2);
      expect(data.limit).toBe(2);
    });

    it('should filter by status', async () => {
      const res = await request('GET', '/conversations?status=active');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((c: any) => c.status === 'active')).toBe(true);
    });

    it('should filter by patient ID', async () => {
      const res = await request('GET', '/conversations?patientId=pat-001');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((c: any) => c.patientId === 'pat-001')).toBe(true);
    });

    it('should filter by unread conversations', async () => {
      const res = await request('GET', '/conversations?unread=true');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((c: any) => c.unreadCount > 0)).toBe(true);
    });

    it('should filter by read conversations', async () => {
      const res = await request('GET', '/conversations?unread=false');

      expect(res.status).toBe(200);
      const data = await res.json();
      // Ensure filter is working correctly - all returned items should have unreadCount === 0
      if (data.items.length > 0) {
        expect(data.items.every((c: any) => c.unreadCount === 0)).toBe(true);
      }
    });

    it('should filter by assigned staff', async () => {
      const res = await request('GET', '/conversations?assignedTo=staff-001');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((c: any) => c.assignedTo === 'staff-001')).toBe(true);
    });

    it('should search by patient name', async () => {
      const res = await request('GET', '/conversations?search=Sarah');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
      expect(data.items.some((c: any) =>
        c.patientName.toLowerCase().includes('sarah')
      )).toBe(true);
    });

    it('should search by phone number', async () => {
      const res = await request('GET', '/conversations?search=5551234567');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
    });

    it('should search by message content', async () => {
      const res = await request('GET', '/conversations?search=reschedule');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
    });

    it('should search by tags', async () => {
      const res = await request('GET', '/conversations?search=urgent');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeGreaterThan(0);
    });

    it('should sort by lastMessageAt descending (default)', async () => {
      const res = await request('GET', '/conversations');

      expect(res.status).toBe(200);
      const data = await res.json();

      if (data.items.length > 1) {
        const timestamps = data.items.map((c: any) =>
          c.lastMessageAt ? new Date(c.lastMessageAt).getTime() : 0
        );
        const sortedTimestamps = [...timestamps].sort((a, b) => b - a);
        expect(timestamps).toEqual(sortedTimestamps);
      }
    });

    it('should sort by priority', async () => {
      const res = await request('GET', '/conversations?sortBy=priority&sortOrder=desc');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
    });

    it('should sort by createdAt ascending', async () => {
      const res = await request('GET', '/conversations?sortBy=createdAt&sortOrder=asc');

      expect(res.status).toBe(200);
      const data = await res.json();

      if (data.items.length > 1) {
        const timestamps = data.items.map((c: any) => new Date(c.createdAt).getTime());
        const sortedTimestamps = [...timestamps].sort((a, b) => a - b);
        expect(timestamps).toEqual(sortedTimestamps);
      }
    });

    it('should reject invalid page number', async () => {
      const res = await request('GET', '/conversations?page=0');
      expect(res.status).toBe(400);
    });

    it('should reject invalid limit (too large)', async () => {
      const res = await request('GET', '/conversations?limit=101');
      expect(res.status).toBe(400);
    });

    it('should reject invalid status', async () => {
      const res = await request('GET', '/conversations?status=invalid');
      expect(res.status).toBe(400);
    });

    it('should reject search string that is too long', async () => {
      const longSearch = 'a'.repeat(256);
      const res = await request('GET', `/conversations?search=${longSearch}`);
      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Get Single Conversation Tests
  // ===================
  describe('Get Conversation - GET /conversations/:id', () => {
    it('should return single conversation with recent messages', async () => {
      const conversations = Array.from(getConversationStore().values());
      const convId = conversations[0].id;

      const res = await request('GET', `/conversations/${convId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.conversation).toBeDefined();
      expect(data.conversation.id).toBe(convId);
      expect(data.recentMessages).toBeDefined();
      expect(Array.isArray(data.recentMessages)).toBe(true);
      expect(data.recentMessages.length).toBeLessThanOrEqual(10);
    });

    it('should return 404 for non-existent conversation', async () => {
      const fakeId = 'conv-nonexistent';
      const res = await request('GET', `/conversations/${fakeId}`);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });

    it('should include conversation metadata', async () => {
      const conversations = Array.from(getConversationStore().values());
      const convId = conversations[0].id;

      const res = await request('GET', `/conversations/${convId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.conversation.patientName).toBeDefined();
      expect(data.conversation.status).toBeDefined();
      expect(data.conversation.channel).toBeDefined();
      expect(data.conversation.unreadCount).toBeDefined();
    });
  });

  // ===================
  // Create Conversation Tests
  // ===================
  describe('Create Conversation - POST /conversations', () => {
    it('should create conversation with valid data', async () => {
      const res = await request('POST', '/conversations', validConversationData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.conversation).toBeDefined();
      expect(data.conversation.id).toMatch(/^conv-/);
      expect(data.conversation.patientId).toBe(validConversationData.patientId);
      expect(data.conversation.patientName).toBe(validConversationData.patientName);
      expect(data.conversation.status).toBe('active');
      expect(data.conversation.unreadCount).toBe(0);
      expect(data.message).toBe('Conversation created successfully');
    });

    it('should create conversation with minimal data', async () => {
      const minimalData = {
        patientId: 'pat-minimal',
        patientName: 'Minimal Patient',
        patientPhone: '5559998888',
      };

      const res = await request('POST', '/conversations', minimalData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.conversation.channel).toBe('sms'); // Default
      expect(data.conversation.priority).toBe('normal'); // Default
    });

    it('should create conversation with optional fields', async () => {
      const dataWithOptionals = {
        ...validConversationData,
        assignedTo: 'staff-999',
        assignedToName: 'Test Staff',
        tags: ['test', 'important'],
        priority: 'high' as const,
      };

      const res = await request('POST', '/conversations', dataWithOptionals);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.conversation.assignedTo).toBe('staff-999');
      expect(data.conversation.assignedToName).toBe('Test Staff');
      expect(data.conversation.tags).toEqual(['test', 'important']);
      expect(data.conversation.priority).toBe('high');
    });

    it('should reject missing required fields', async () => {
      const invalidData = {
        patientName: 'Test',
        // missing patientId, patientPhone
      };

      const res = await request('POST', '/conversations', invalidData);
      expect(res.status).toBe(400);
    });

    it('should reject invalid email format', async () => {
      const invalidData = {
        ...validConversationData,
        patientEmail: 'not-an-email',
      };

      const res = await request('POST', '/conversations', invalidData);
      expect(res.status).toBe(400);
    });

    it('should reject invalid channel', async () => {
      const invalidData = {
        ...validConversationData,
        channel: 'invalid',
      };

      const res = await request('POST', '/conversations', invalidData);
      expect(res.status).toBe(400);
    });

    it('should reject invalid priority', async () => {
      const invalidData = {
        ...validConversationData,
        priority: 'invalid',
      };

      const res = await request('POST', '/conversations', invalidData);
      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Update Conversation Tests
  // ===================
  describe('Update Conversation - PUT /conversations/:id', () => {
    it('should update conversation status', async () => {
      const conversations = Array.from(getConversationStore().values());
      const convId = conversations[0].id;

      const updateData = { status: 'resolved' as const };
      const res = await request('PUT', `/conversations/${convId}`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.conversation.status).toBe('resolved');
      expect(data.message).toBe('Conversation updated successfully');
    });

    it('should update assigned staff', async () => {
      const conversations = Array.from(getConversationStore().values());
      const convId = conversations[0].id;

      const updateData = {
        assignedTo: 'staff-new',
        assignedToName: 'New Staff Member',
      };
      const res = await request('PUT', `/conversations/${convId}`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.conversation.assignedTo).toBe('staff-new');
      expect(data.conversation.assignedToName).toBe('New Staff Member');
    });

    it('should clear assigned staff with null', async () => {
      const conversations = Array.from(getConversationStore().values());
      const convId = conversations[0].id;

      const updateData = {
        assignedTo: null,
        assignedToName: null,
      };
      const res = await request('PUT', `/conversations/${convId}`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.conversation.assignedTo).toBeUndefined();
      expect(data.conversation.assignedToName).toBeUndefined();
    });

    it('should update tags', async () => {
      const conversations = Array.from(getConversationStore().values());
      const convId = conversations[0].id;

      const updateData = { tags: ['new-tag', 'updated'] };
      const res = await request('PUT', `/conversations/${convId}`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.conversation.tags).toEqual(['new-tag', 'updated']);
    });

    it('should update priority', async () => {
      const conversations = Array.from(getConversationStore().values());
      const convId = conversations[0].id;

      const updateData = { priority: 'urgent' as const };
      const res = await request('PUT', `/conversations/${convId}`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.conversation.priority).toBe('urgent');
    });

    it('should update multiple fields at once', async () => {
      const conversations = Array.from(getConversationStore().values());
      const convId = conversations[0].id;

      const updateData = {
        status: 'waiting' as const,
        priority: 'high' as const,
        tags: ['multi-update'],
      };
      const res = await request('PUT', `/conversations/${convId}`, updateData);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.conversation.status).toBe('waiting');
      expect(data.conversation.priority).toBe('high');
      expect(data.conversation.tags).toEqual(['multi-update']);
    });

    it('should return 404 for non-existent conversation', async () => {
      const fakeId = 'conv-nonexistent';
      const res = await request('PUT', `/conversations/${fakeId}`, { status: 'resolved' });

      expect(res.status).toBe(404);
    });

    it('should reject invalid status', async () => {
      const conversations = Array.from(getConversationStore().values());
      const convId = conversations[0].id;

      const res = await request('PUT', `/conversations/${convId}`, { status: 'invalid' });
      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Mark Read Tests
  // ===================
  describe('Mark Read - POST /conversations/:id/read', () => {
    it('should mark conversation as read', async () => {
      const conversations = Array.from(getConversationStore().values());
      const unreadConv = conversations.find(c => c.unreadCount > 0);

      if (!unreadConv) {
        throw new Error('Test data should include unread conversations');
      }

      const res = await request('POST', `/conversations/${unreadConv.id}/read`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.conversation.unreadCount).toBe(0);
      expect(data.message).toBe('Conversation marked as read');
    });

    it('should handle already read conversation', async () => {
      const conversations = Array.from(getConversationStore().values());
      const readConv = conversations.find(c => c.unreadCount === 0);

      if (!readConv) {
        throw new Error('Test data should include read conversations');
      }

      const res = await request('POST', `/conversations/${readConv.id}/read`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.conversation.unreadCount).toBe(0);
    });

    it('should return 404 for non-existent conversation', async () => {
      const fakeId = 'conv-nonexistent';
      const res = await request('POST', `/conversations/${fakeId}/read`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Get Messages Tests
  // ===================
  describe('Get Messages - GET /conversations/:id/messages', () => {
    it('should return paginated messages for conversation', async () => {
      const conversations = Array.from(getConversationStore().values());
      const convId = conversations[0].id;

      const res = await request('GET', `/conversations/${convId}/messages`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();
      expect(data.page).toBe(1);
      expect(data.limit).toBe(50);
      expect(data.hasMore).toBeDefined();
    });

    it('should support custom pagination', async () => {
      const conversations = Array.from(getConversationStore().values());
      const convId = conversations[0].id;

      const res = await request('GET', `/conversations/${convId}/messages?page=1&limit=5`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeLessThanOrEqual(5);
      expect(data.limit).toBe(5);
    });

    it('should sort messages descending by default', async () => {
      const conversations = Array.from(getConversationStore().values());
      const convId = conversations[0].id;

      const res = await request('GET', `/conversations/${convId}/messages`);

      expect(res.status).toBe(200);
      const data = await res.json();

      if (data.items.length > 1) {
        const timestamps = data.items.map((m: any) => new Date(m.createdAt).getTime());
        const sortedTimestamps = [...timestamps].sort((a, b) => b - a);
        expect(timestamps).toEqual(sortedTimestamps);
      }
    });

    it('should sort messages ascending when specified', async () => {
      const conversations = Array.from(getConversationStore().values());
      const convId = conversations[0].id;

      const res = await request('GET', `/conversations/${convId}/messages?sortOrder=asc`);

      expect(res.status).toBe(200);
      const data = await res.json();

      if (data.items.length > 1) {
        const timestamps = data.items.map((m: any) => new Date(m.createdAt).getTime());
        const sortedTimestamps = [...timestamps].sort((a, b) => a - b);
        expect(timestamps).toEqual(sortedTimestamps);
      }
    });

    it('should return 404 for non-existent conversation', async () => {
      const fakeId = 'conv-nonexistent';
      const res = await request('GET', `/conversations/${fakeId}/messages`);

      expect(res.status).toBe(404);
    });

    it('should reject invalid page number', async () => {
      const conversations = Array.from(getConversationStore().values());
      const convId = conversations[0].id;

      const res = await request('GET', `/conversations/${convId}/messages?page=0`);
      expect(res.status).toBe(400);
    });

    it('should reject invalid limit (too large)', async () => {
      const conversations = Array.from(getConversationStore().values());
      const convId = conversations[0].id;

      const res = await request('GET', `/conversations/${convId}/messages?limit=101`);
      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Send Message Tests
  // ===================
  describe('Send Message - POST /messages/send', () => {
    it('should send SMS message with existing conversation', async () => {
      const conversations = Array.from(getConversationStore().values());
      const convId = conversations[0].id;

      const messageData = {
        ...validMessageData,
        conversationId: convId,
      };

      const res = await request('POST', '/messages/send', messageData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.message).toBeDefined();
      expect(data.message.id).toMatch(/^msg-/);
      expect(data.message.conversationId).toBe(convId);
      expect(data.message.body).toBe(messageData.body);
      expect(data.message.direction).toBe('outbound');
      expect(data.message.status).toMatch(/queued|sending|sent/);
      expect(data.success).toBe(true);
    });

    it('should create conversation if not provided', async () => {
      const messageData = {
        patientId: 'pat-new-999',
        to: '+15559991111',
        body: 'New conversation message',
        channel: 'sms' as const,
      };

      const initialConvCount = getConversationStore().size;
      const res = await request('POST', '/messages/send', messageData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.message.conversationId).toMatch(/^conv-/);

      // Verify conversation was created
      const newConvCount = getConversationStore().size;
      expect(newConvCount).toBe(initialConvCount + 1);
    });

    it('should send message with media URLs', async () => {
      const messageData = {
        ...validMessageData,
        mediaUrls: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      };

      const res = await request('POST', '/messages/send', messageData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.message.mediaUrls).toEqual(messageData.mediaUrls);
    });

    it('should send message with template ID', async () => {
      const messageData = {
        ...validMessageData,
        templateId: 'tpl-appointment-reminder',
      };

      const res = await request('POST', '/messages/send', messageData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.message.templateId).toBe('tpl-appointment-reminder');
    });

    it('should send auto-response message', async () => {
      const messageData = {
        ...validMessageData,
        isAutoResponse: true,
      };

      const res = await request('POST', '/messages/send', messageData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.message.isAutoResponse).toBe(true);
    });

    it('should reject missing required fields', async () => {
      const invalidData = {
        body: 'Test message',
        // missing patientId, to
      };

      const res = await request('POST', '/messages/send', invalidData);
      expect(res.status).toBe(400);
    });

    it('should reject empty message body', async () => {
      const invalidData = {
        ...validMessageData,
        body: '',
      };

      const res = await request('POST', '/messages/send', invalidData);
      expect(res.status).toBe(400);
    });

    it('should reject message body that is too long', async () => {
      const invalidData = {
        ...validMessageData,
        body: 'a'.repeat(1601),
      };

      const res = await request('POST', '/messages/send', invalidData);
      expect(res.status).toBe(400);
    });

    it('should reject invalid media URL format', async () => {
      const invalidData = {
        ...validMessageData,
        mediaUrls: ['not-a-url'],
      };

      const res = await request('POST', '/messages/send', invalidData);
      expect(res.status).toBe(400);
    });

    it('should reject invalid channel', async () => {
      const invalidData = {
        ...validMessageData,
        channel: 'invalid',
      };

      const res = await request('POST', '/messages/send', invalidData);
      expect(res.status).toBe(400);
    });

    it('should update conversation lastMessage fields', async () => {
      const conversations = Array.from(getConversationStore().values());
      const convId = conversations[0].id;

      const messageData = {
        ...validMessageData,
        conversationId: convId,
        body: 'Updated last message',
      };

      await request('POST', '/messages/send', messageData);

      const updatedConv = getConversationStore().get(convId);
      expect(updatedConv?.lastMessageBody).toBe('Updated last message');
      expect(updatedConv?.lastMessageDirection).toBe('outbound');
      expect(updatedConv?.lastMessageAt).toBeDefined();
    });
  });

  // ===================
  // Bulk Send Tests
  // ===================
  describe('Bulk Send - POST /messages/bulk', () => {
    it('should send bulk messages successfully', async () => {
      const bulkData = {
        recipients: [
          { patientId: 'pat-bulk-1', to: '+15551111111', body: 'Message 1' },
          { patientId: 'pat-bulk-2', to: '+15552222222', body: 'Message 2' },
          { patientId: 'pat-bulk-3', to: '+15553333333', body: 'Message 3' },
        ],
        channel: 'sms' as const,
      };

      const res = await request('POST', '/messages/bulk', bulkData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.total).toBe(3);
      expect(data.success).toBe(3);
      expect(data.failed).toBe(0);
      expect(data.messages).toBeDefined();
      expect(data.messages.length).toBe(3);
    });

    it('should support custom batch size', async () => {
      const bulkData = {
        recipients: Array.from({ length: 15 }, (_, i) => ({
          patientId: `pat-batch-${i}`,
          to: `+1555${String(i).padStart(7, '0')}`,
          body: `Message ${i}`,
        })),
        channel: 'sms' as const,
        batchSize: 5,
        delayBetweenBatches: 0, // No delay to avoid timeout
      };

      const res = await request('POST', '/messages/bulk', bulkData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.total).toBe(15);
    }, 10000); // 10 second timeout

    it('should support delay between batches', async () => {
      const bulkData = {
        recipients: [
          { patientId: 'pat-delay-1', to: '+15551111111', body: 'Message 1' },
          { patientId: 'pat-delay-2', to: '+15552222222', body: 'Message 2' },
        ],
        channel: 'sms' as const,
        delayBetweenBatches: 1,
      };

      const startTime = Date.now();
      const res = await request('POST', '/messages/bulk', bulkData);
      const endTime = Date.now();

      expect(res.status).toBe(201);
      // Should complete quickly since only 2 messages (within same batch)
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should create conversations for new patients', async () => {
      const initialConvCount = getConversationStore().size;

      const bulkData = {
        recipients: [
          { patientId: 'pat-new-bulk-1', to: '+15554444444', body: 'New 1' },
          { patientId: 'pat-new-bulk-2', to: '+15555555555', body: 'New 2' },
        ],
        channel: 'sms' as const,
      };

      const res = await request('POST', '/messages/bulk', bulkData);

      expect(res.status).toBe(201);
      const newConvCount = getConversationStore().size;
      expect(newConvCount).toBeGreaterThanOrEqual(initialConvCount + 2);
    });

    it('should tag bulk conversations', async () => {
      const bulkData = {
        recipients: [
          { patientId: 'pat-tag-test', to: '+15556666666', body: 'Tagged message' },
        ],
        channel: 'sms' as const,
      };

      await request('POST', '/messages/bulk', bulkData);

      const conversations = Array.from(getConversationStore().values());
      const taggedConv = conversations.find(c => c.patientId === 'pat-tag-test');
      expect(taggedConv?.tags).toContain('bulk-message');
    });

    it('should reject empty recipients array', async () => {
      const invalidData = {
        recipients: [],
        channel: 'sms' as const,
      };

      const res = await request('POST', '/messages/bulk', invalidData);
      expect(res.status).toBe(400);
    });

    it('should reject too many recipients', async () => {
      const invalidData = {
        recipients: Array.from({ length: 101 }, (_, i) => ({
          patientId: `pat-${i}`,
          to: `+1555${String(i).padStart(7, '0')}`,
          body: `Message ${i}`,
        })),
        channel: 'sms' as const,
      };

      const res = await request('POST', '/messages/bulk', invalidData);
      expect(res.status).toBe(400);
    });

    it('should reject invalid batch size', async () => {
      const invalidData = {
        recipients: [
          { patientId: 'pat-1', to: '+15551111111', body: 'Message 1' },
        ],
        channel: 'sms' as const,
        batchSize: 11, // Max is 10
      };

      const res = await request('POST', '/messages/bulk', invalidData);
      expect(res.status).toBe(400);
    });

    it('should reject invalid delay', async () => {
      const invalidData = {
        recipients: [
          { patientId: 'pat-1', to: '+15551111111', body: 'Message 1' },
        ],
        channel: 'sms' as const,
        delayBetweenBatches: 61, // Max is 60
      };

      const res = await request('POST', '/messages/bulk', invalidData);
      expect(res.status).toBe(400);
    });

    it('should reject recipient with missing fields', async () => {
      const invalidData = {
        recipients: [
          { patientId: 'pat-1', body: 'Message 1' }, // missing 'to'
        ],
        channel: 'sms' as const,
      };

      const res = await request('POST', '/messages/bulk', invalidData);
      expect(res.status).toBe(400);
    });

    it('should reject recipient with body too long', async () => {
      const invalidData = {
        recipients: [
          { patientId: 'pat-1', to: '+15551111111', body: 'a'.repeat(1601) },
        ],
        channel: 'sms' as const,
      };

      const res = await request('POST', '/messages/bulk', invalidData);
      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Get Message Tests
  // ===================
  describe('Get Message - GET /messages/:id', () => {
    it('should return message by ID', async () => {
      const messages = Array.from(getMessageStore().values());
      const msgId = messages[0].id;

      const res = await request('GET', `/messages/${msgId}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.message).toBeDefined();
      expect(data.message.id).toBe(msgId);
      expect(data.message.body).toBeDefined();
      expect(data.message.direction).toBeDefined();
      expect(data.message.status).toBeDefined();
    });

    it('should return 404 for non-existent message', async () => {
      const fakeId = 'msg-nonexistent';
      const res = await request('GET', `/messages/${fakeId}`);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });
  });

  // ===================
  // Get Message Status Tests
  // ===================
  describe('Get Message Status - GET /messages/:id/status', () => {
    it('should return message delivery status', async () => {
      const messages = Array.from(getMessageStore().values());
      const msgId = messages[0].id;

      const res = await request('GET', `/messages/${msgId}/status`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe(msgId);
      expect(data.status).toBeDefined();
      expect(['queued', 'sending', 'sent', 'delivered', 'failed', 'undelivered']).toContain(data.status);
    });

    it('should include delivery timestamps when available', async () => {
      const messages = Array.from(getMessageStore().values());
      const deliveredMsg = messages.find(m => m.status === 'delivered');

      if (deliveredMsg) {
        const res = await request('GET', `/messages/${deliveredMsg.id}/status`);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.sentAt).toBeDefined();
        expect(data.deliveredAt).toBeDefined();
      }
    });

    it('should include error details for failed messages', async () => {
      // Create a failed message
      const now = new Date();
      const failedMsg: StoredMessage = {
        id: 'msg-failed-test',
        conversationId: 'conv-001',
        patientId: 'pat-001',
        direction: 'outbound',
        channel: 'sms',
        body: 'Failed message',
        from: '+15559876543',
        to: '+15551234567',
        status: 'failed',
        errorCode: 'E001',
        errorMessage: 'Invalid phone number',
        metadata: {},
        createdAt: now,
        updatedAt: now,
      };
      addMockMessage(failedMsg);

      const res = await request('GET', `/messages/${failedMsg.id}/status`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.errorCode).toBe('E001');
      expect(data.errorMessage).toBe('Invalid phone number');
    });

    it('should return 404 for non-existent message', async () => {
      const fakeId = 'msg-nonexistent';
      const res = await request('GET', `/messages/${fakeId}/status`);

      expect(res.status).toBe(404);
    });
  });

  // ===================
  // Schedule Message Tests
  // ===================
  describe('Schedule Message - POST /messages/schedule', () => {
    it('should schedule message for future', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);

      const scheduleData = {
        patientId: 'pat-001',
        to: '+15551234567',
        body: 'Scheduled reminder',
        channel: 'sms' as const,
        scheduledAt: futureDate.toISOString(),
      };

      const res = await request('POST', '/messages/schedule', scheduleData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.message).toBeDefined();
      expect(data.message.status).toBe('queued');
      expect(data.message.scheduledAt).toBeDefined();
      expect(data.success).toBe(true);
    });

    it('should schedule with existing conversation', async () => {
      const conversations = Array.from(getConversationStore().values());
      const convId = conversations[0].id;

      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const scheduleData = {
        conversationId: convId,
        patientId: 'pat-001',
        to: '+15551234567',
        body: 'Scheduled with conversation',
        channel: 'sms' as const,
        scheduledAt: futureDate.toISOString(),
      };

      const res = await request('POST', '/messages/schedule', scheduleData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.message.conversationId).toBe(convId);
    });

    it('should create conversation if not provided', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 3);

      const scheduleData = {
        patientId: 'pat-new-scheduled',
        to: '+15557777777',
        body: 'New conversation scheduled',
        channel: 'sms' as const,
        scheduledAt: futureDate.toISOString(),
      };

      const initialConvCount = getConversationStore().size;
      const res = await request('POST', '/messages/schedule', scheduleData);

      expect(res.status).toBe(201);
      const newConvCount = getConversationStore().size;
      expect(newConvCount).toBe(initialConvCount + 1);
    });

    it('should schedule with template ID', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const scheduleData = {
        patientId: 'pat-001',
        to: '+15551234567',
        body: 'Template message',
        channel: 'sms' as const,
        scheduledAt: futureDate.toISOString(),
        templateId: 'tpl-reminder',
      };

      const res = await request('POST', '/messages/schedule', scheduleData);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.message.templateId).toBe('tpl-reminder');
    });

    it('should reject scheduling in the past', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);

      const scheduleData = {
        patientId: 'pat-001',
        to: '+15551234567',
        body: 'Past message',
        channel: 'sms' as const,
        scheduledAt: pastDate.toISOString(),
      };

      const res = await request('POST', '/messages/schedule', scheduleData);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('future');
    });

    it('should reject invalid datetime format', async () => {
      const scheduleData = {
        patientId: 'pat-001',
        to: '+15551234567',
        body: 'Invalid date',
        channel: 'sms' as const,
        scheduledAt: 'not-a-datetime',
      };

      const res = await request('POST', '/messages/schedule', scheduleData);
      expect(res.status).toBe(400);
    });

    it('should reject missing required fields', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const scheduleData = {
        body: 'Missing fields',
        scheduledAt: futureDate.toISOString(),
      };

      const res = await request('POST', '/messages/schedule', scheduleData);
      expect(res.status).toBe(400);
    });

    it('should store in scheduled messages store', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);

      const scheduleData = {
        patientId: 'pat-001',
        to: '+15551234567',
        body: 'Check storage',
        channel: 'sms' as const,
        scheduledAt: futureDate.toISOString(),
      };

      const initialScheduledCount = getScheduledMessageStore().size;
      await request('POST', '/messages/schedule', scheduleData);
      const newScheduledCount = getScheduledMessageStore().size;

      expect(newScheduledCount).toBe(initialScheduledCount + 1);
    });
  });

  // ===================
  // List Scheduled Messages Tests
  // ===================
  describe('List Scheduled - GET /messages/scheduled', () => {
    it('should return paginated scheduled messages', async () => {
      const res = await request('GET', '/messages/scheduled');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.total).toBeDefined();
      expect(data.page).toBe(1);
      expect(data.limit).toBe(20);
      expect(data.hasMore).toBeDefined();
    });

    it('should filter by patient ID', async () => {
      const res = await request('GET', '/messages/scheduled?patientId=pat-005');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((m: any) => m.patientId === 'pat-005')).toBe(true);
    });

    it('should filter by status', async () => {
      const res = await request('GET', '/messages/scheduled?status=queued');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.every((m: any) => m.status === 'queued')).toBe(true);
    });

    it('should sort by scheduled time ascending', async () => {
      const res = await request('GET', '/messages/scheduled');

      expect(res.status).toBe(200);
      const data = await res.json();

      if (data.items.length > 1) {
        const times = data.items.map((m: any) =>
          m.scheduledAt ? new Date(m.scheduledAt).getTime() : 0
        );
        const sortedTimes = [...times].sort((a, b) => a - b);
        expect(times).toEqual(sortedTimes);
      }
    });

    it('should support custom pagination', async () => {
      const res = await request('GET', '/messages/scheduled?page=1&limit=1');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items.length).toBeLessThanOrEqual(1);
      expect(data.limit).toBe(1);
    });

    it('should reject invalid page number', async () => {
      const res = await request('GET', '/messages/scheduled?page=0');
      expect(res.status).toBe(400);
    });

    it('should reject invalid limit', async () => {
      const res = await request('GET', '/messages/scheduled?limit=101');
      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Cancel Scheduled Message Tests
  // ===================
  describe('Cancel Scheduled - DELETE /messages/scheduled/:id', () => {
    it('should cancel queued scheduled message', async () => {
      const scheduled = Array.from(getScheduledMessageStore().values());
      const queuedMsg = scheduled.find(m => m.status === 'queued');

      if (!queuedMsg) {
        throw new Error('Test data should include queued scheduled messages');
      }

      const res = await request('DELETE', `/messages/scheduled/${queuedMsg.id}`);

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('cancelled');

      // Verify it was marked as failed/cancelled
      const cancelledMsg = getScheduledMessageStore().get(queuedMsg.id);
      expect(cancelledMsg?.status).toBe('failed');
      expect(cancelledMsg?.errorMessage).toContain('Cancelled');
    });

    it('should return 404 for non-existent scheduled message', async () => {
      const fakeId = 'msg-sched-nonexistent';
      const res = await request('DELETE', `/messages/scheduled/${fakeId}`);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('NOT_FOUND');
    });

    it('should reject cancelling already sent message', async () => {
      // Create a sent scheduled message
      const now = new Date();
      const sentMsg: StoredMessage = {
        id: 'msg-sched-sent',
        conversationId: 'conv-001',
        patientId: 'pat-001',
        direction: 'outbound',
        channel: 'sms',
        body: 'Already sent',
        from: '+15559876543',
        to: '+15551234567',
        status: 'sent',
        scheduledAt: new Date(now.getTime() - 1000),
        sentAt: now,
        metadata: {},
        createdAt: new Date(now.getTime() - 2000),
        updatedAt: now,
      };
      getScheduledMessageStore().set(sentMsg.id, sentMsg);

      const res = await request('DELETE', `/messages/scheduled/${sentMsg.id}`);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.message).toContain('already been sent');
    });

    it('should reject cancelling already cancelled message', async () => {
      // Create a cancelled scheduled message
      const now = new Date();
      const cancelledMsg: StoredMessage = {
        id: 'msg-sched-cancelled',
        conversationId: 'conv-001',
        patientId: 'pat-001',
        direction: 'outbound',
        channel: 'sms',
        body: 'Already cancelled',
        from: '+15559876543',
        to: '+15551234567',
        status: 'failed',
        errorMessage: 'Cancelled by user',
        scheduledAt: new Date(now.getTime() + 1000),
        metadata: {},
        createdAt: new Date(now.getTime() - 2000),
        updatedAt: now,
      };
      getScheduledMessageStore().set(cancelledMsg.id, cancelledMsg);

      const res = await request('DELETE', `/messages/scheduled/${cancelledMsg.id}`);

      expect(res.status).toBe(400);
    });
  });

  // ===================
  // Edge Cases & Error Handling
  // ===================
  describe('Edge Cases', () => {
    it('should handle empty search string', async () => {
      const res = await request('GET', '/conversations?search=');
      expect(res.status).toBe(200);
    });

    it('should handle pagination beyond results', async () => {
      const res = await request('GET', '/conversations?page=1000');
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
      expect(data.hasMore).toBe(false);
    });

    it('should handle special characters in search', async () => {
      const res = await request('GET', '/conversations?search=O\'Brien');
      expect(res.status).toBe(200);
    });

    it('should handle message with maximum length body', async () => {
      const maxBody = 'a'.repeat(1600);
      const messageData = {
        ...validMessageData,
        body: maxBody,
      };

      const res = await request('POST', '/messages/send', messageData);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.message.body).toBe(maxBody);
    });

    it('should handle conversation with empty tags array', async () => {
      const convData = {
        ...validConversationData,
        tags: [],
      };

      const res = await request('POST', '/conversations', convData);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.conversation.tags).toEqual([]);
    });

    it('should handle updating conversation to same values', async () => {
      const conversations = Array.from(getConversationStore().values());
      const conv = conversations[0];

      const updateData = {
        status: conv.status,
        priority: conv.priority,
      };

      const res = await request('PUT', `/conversations/${conv.id}`, updateData);
      expect(res.status).toBe(200);
    });

    it('should handle finding existing conversation when sending message', async () => {
      const conversations = Array.from(getConversationStore().values());
      const existingConv = conversations[0];

      const messageData = {
        patientId: existingConv.patientId,
        to: existingConv.patientPhone,
        body: 'Reuse conversation',
        channel: existingConv.channel,
      };

      const res = await request('POST', '/messages/send', messageData);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.message.conversationId).toBe(existingConv.id);
    });

    it('should handle bulk send with single recipient', async () => {
      const bulkData = {
        recipients: [
          { patientId: 'pat-single', to: '+15558888888', body: 'Single bulk' },
        ],
        channel: 'sms' as const,
      };

      const res = await request('POST', '/messages/bulk', bulkData);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.total).toBe(1);
      expect(data.success).toBe(1);
    });

    it('should handle scheduling message exactly 1 second in future', async () => {
      const futureDate = new Date();
      futureDate.setSeconds(futureDate.getSeconds() + 1);

      const scheduleData = {
        patientId: 'pat-001',
        to: '+15551234567',
        body: 'One second future',
        channel: 'sms' as const,
        scheduledAt: futureDate.toISOString(),
      };

      const res = await request('POST', '/messages/schedule', scheduleData);
      expect(res.status).toBe(201);
    });

    it('should handle getting messages for conversation with no messages', async () => {
      // Create a new conversation with no messages
      const convData = {
        patientId: 'pat-no-messages',
        patientName: 'No Messages',
        patientPhone: '5559990000',
      };

      const createRes = await request('POST', '/conversations', convData);
      const { conversation } = await createRes.json();

      const res = await request('GET', `/conversations/${conversation.id}/messages`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.items).toEqual([]);
      expect(data.total).toBe(0);
    });
  });
});
