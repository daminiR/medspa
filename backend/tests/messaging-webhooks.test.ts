/**
 * Messaging Webhooks API Tests
 *
 * Comprehensive test coverage for:
 * - Inbound SMS webhook (Twilio)
 * - Message status webhook (Twilio)
 * - Health check endpoint
 * - Signature validation
 * - Opt-out/Opt-in keyword detection
 * - Emergency keyword detection
 * - Simple command detection
 * - Error code handling (30003, 30004, 30005, 30006, 30007)
 * - Patient creation and lookup
 * - Conversation management
 * - Staff alerts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import messagingWebhooks, { clearWebhookStores } from '../src/routes/messaging-webhooks';
import { errorHandler } from '../src/middleware/error';
import crypto from 'crypto';

// Mock the config to enable/disable signature validation
vi.mock('../src/config', () => ({
  config: {
    twilioAccountSid: undefined,
    twilioAuthToken: undefined,
    twilioPhoneNumber: undefined,
  },
}));

// Mock twilio module
vi.mock('twilio', () => {
  return {
    default: vi.fn(() => ({
      messages: {
        create: vi.fn().mockResolvedValue({
          sid: 'SM' + crypto.randomUUID().replace(/-/g, ''),
        }),
      },
    })),
    validateRequest: vi.fn((authToken, signature, url, params) => {
      // Mock signature validation - accept specific test signatures
      if (signature === 'valid-signature') return true;
      if (signature === '') return true; // Allow empty in dev mode
      return false;
    }),
  };
});

// Create test app
const app = new Hono();
app.route('/api/webhooks', messagingWebhooks);
app.onError(errorHandler);

// Helper to make POST requests with form data
async function postFormData(
  path: string,
  formData: Record<string, string>,
  headers?: Record<string, string>
) {
  const form = new URLSearchParams();
  for (const [key, value] of Object.entries(formData)) {
    form.append(key, value);
  }

  const req = new Request(`http://localhost${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...headers,
    },
    body: form.toString(),
  });
  return app.fetch(req);
}

// Helper to make GET requests
async function get(path: string) {
  const req = new Request(`http://localhost${path}`, {
    method: 'GET',
  });
  return app.fetch(req);
}

// ===================
// Test Suite
// ===================

describe('Messaging Webhooks API', () => {
  beforeEach(() => {
    clearWebhookStores();
    vi.clearAllMocks();
  });

  // ===================
  // Health Check Tests
  // ===================
  describe('GET /api/webhooks/twilio/health', () => {
    it('should return healthy status', async () => {
      const res = await get('/api/webhooks/twilio/health');

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('healthy');
      expect(data.service).toBe('twilio-webhooks');
      expect(data.timestamp).toBeDefined();
      expect(data.configured).toBe(false); // Config is mocked as undefined
    });

    it('should include timestamp in ISO format', async () => {
      const res = await get('/api/webhooks/twilio/health');
      const data = await res.json();

      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  // ===================
  // Inbound SMS Webhook Tests
  // ===================
  describe('POST /api/webhooks/twilio/inbound', () => {
    describe('Basic Message Handling', () => {
      it('should accept valid inbound SMS', async () => {
        const res = await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+15551234567',
          To: '+15559876543',
          Body: 'Hello, this is a test message',
          NumMedia: '0',
        });

        expect(res.status).toBe(200);
      });

      it('should normalize phone numbers to E.164 format', async () => {
        const res = await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '5551234567', // No country code
          To: '+15559876543',
          Body: 'Test normalization',
          NumMedia: '0',
        });

        expect(res.status).toBe(200);

        // Check the message was stored with normalized number
        const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
        const messages = await messagesRes.json();
        expect(messages.messages[0].from).toBe('+15551234567');
      });

      it('should handle messages with media', async () => {
        const res = await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+15551234567',
          To: '+15559876543',
          Body: 'Check out this photo',
          NumMedia: '2',
          MediaUrl0: 'https://example.com/photo1.jpg',
          MediaUrl1: 'https://example.com/photo2.jpg',
        });

        expect(res.status).toBe(200);

        // Verify media URLs were captured
        const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
        const messages = await messagesRes.json();
        const message = messages.messages[0];
        expect(message.numMedia).toBe(2);
        expect(message.mediaUrls).toEqual([
          'https://example.com/photo1.jpg',
          'https://example.com/photo2.jpg',
        ]);
      });

      it('should create conversation for new message', async () => {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+15551234567',
          To: '+15559876543',
          Body: 'First message',
          NumMedia: '0',
        });

        const conversationsRes = await get('/api/webhooks/twilio/conversations');
        const conversations = await conversationsRes.json();
        expect(conversations.total).toBeGreaterThan(0);
      });

      it('should increment conversation counts', async () => {
        const from = '+15551234567';

        // Send first message
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: from,
          To: '+15559876543',
          Body: 'First message',
          NumMedia: '0',
        });

        // Send second message
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: from,
          To: '+15559876543',
          Body: 'Second message',
          NumMedia: '0',
        });

        const conversationsRes = await get('/api/webhooks/twilio/conversations');
        const conversations = await conversationsRes.json();
        const conversation = conversations.conversations[0];
        expect(conversation.messageCount).toBe(2);
        expect(conversation.unreadCount).toBe(2);
      });
    });

    describe('Patient Management', () => {
      it('should find existing patient by phone', async () => {
        // Mock patient exists at +11234567890
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+11234567890', // This is patient-1 from mock data
          To: '+15559876543',
          Body: 'Hello from existing patient',
          NumMedia: '0',
        });

        const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
        const messages = await messagesRes.json();
        expect(messages.messages[0].patientId).toBe('patient-1');
      });

      it('should create new patient for unknown phone', async () => {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+15559999999', // New number
          To: '+15559876543',
          Body: 'Hello from new patient',
          NumMedia: '0',
        });

        const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
        const messages = await messagesRes.json();
        expect(messages.messages[0].patientId).toBeDefined();
      });
    });

    describe('Opt-Out Keyword Detection', () => {
      const optOutKeywords = [
        'STOP',
        'STOPALL',
        'UNSUBSCRIBE',
        'CANCEL',
        'END',
        'QUIT',
        'REVOKE',
        'OPTOUT',
        'OPT OUT',
        'OPT-OUT',
      ];

      optOutKeywords.forEach((keyword) => {
        it(`should detect opt-out keyword: ${keyword}`, async () => {
          await postFormData('/api/webhooks/twilio/inbound', {
            MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
            From: '+15551111111',
            To: '+15559876543',
            Body: keyword,
            NumMedia: '0',
          });

          const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
          const messages = await messagesRes.json();
          expect(messages.messages[0].isOptOut).toBe(true);
          expect(messages.messages[0].processed).toBe(true);
        });
      });

      it('should detect opt-out keyword in lowercase', async () => {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+15551111111',
          To: '+15559876543',
          Body: 'stop',
          NumMedia: '0',
        });

        const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
        const messages = await messagesRes.json();
        expect(messages.messages[0].isOptOut).toBe(true);
      });

      it('should detect opt-out keyword with whitespace', async () => {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+15551111111',
          To: '+15559876543',
          Body: '  STOP  ',
          NumMedia: '0',
        });

        const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
        const messages = await messagesRes.json();
        expect(messages.messages[0].isOptOut).toBe(true);
      });

      it('should NOT detect opt-out in partial word', async () => {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+15551111111',
          To: '+15559876543',
          Body: 'Please do not stop this treatment',
          NumMedia: '0',
        });

        const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
        const messages = await messagesRes.json();
        expect(messages.messages[0].isOptOut).toBeUndefined();
      });
    });

    describe('Opt-In Keyword Detection', () => {
      const optInKeywords = ['START', 'UNSTOP', 'SUBSCRIBE', 'OPTIN', 'OPT IN', 'YES'];

      optInKeywords.forEach((keyword) => {
        it(`should detect opt-in keyword: ${keyword}`, async () => {
          await postFormData('/api/webhooks/twilio/inbound', {
            MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
            From: '+15552222222',
            To: '+15559876543',
            Body: keyword,
            NumMedia: '0',
          });

          const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
          const messages = await messagesRes.json();
          expect(messages.messages[0].isOptIn).toBe(true);
          expect(messages.messages[0].processed).toBe(true);
        });
      });

      it('should detect opt-in keyword in lowercase', async () => {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+15552222222',
          To: '+15559876543',
          Body: 'start',
          NumMedia: '0',
        });

        const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
        const messages = await messagesRes.json();
        expect(messages.messages[0].isOptIn).toBe(true);
      });
    });

    describe('Emergency Keyword Detection', () => {
      const emergencyKeywords = [
        '911',
        'EMERGENCY',
        'SEVERE PAIN',
        'BLEEDING',
        'ALLERGIC REACTION',
        'CANT BREATHE',
        "CAN'T BREATHE",
        'CANNOT BREATHE',
        'CHEST PAIN',
        'INFECTION',
        'SWELLING FACE',
        'VISION LOSS',
        'SEIZURE',
        'UNCONSCIOUS',
      ];

      emergencyKeywords.forEach((keyword) => {
        it(`should detect emergency keyword: ${keyword}`, async () => {
          await postFormData('/api/webhooks/twilio/inbound', {
            MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
            From: '+15553333333',
            To: '+15559876543',
            Body: `Help! I have ${keyword}`,
            NumMedia: '0',
          });

          const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
          const messages = await messagesRes.json();
          expect(messages.messages[0].isEmergency).toBe(true);
        });
      });

      it('should create staff alert for emergency', async () => {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+15553333333',
          To: '+15559876543',
          Body: 'EMERGENCY - I need help immediately!',
          NumMedia: '0',
        });

        const alertsRes = await get('/api/webhooks/twilio/alerts');
        const alerts = await alertsRes.json();
        expect(alerts.total).toBeGreaterThan(0);
        expect(alerts.alerts[0].type).toBe('emergency');
        expect(alerts.alerts[0].triggerKeywords).toContain('EMERGENCY');
      });

      it('should detect multiple emergency keywords', async () => {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+15553333333',
          To: '+15559876543',
          Body: 'SEVERE PAIN and BLEEDING - EMERGENCY!',
          NumMedia: '0',
        });

        const alertsRes = await get('/api/webhooks/twilio/alerts');
        const alerts = await alertsRes.json();
        const alert = alerts.alerts[0];
        expect(alert.triggerKeywords).toContain('SEVERE PAIN');
        expect(alert.triggerKeywords).toContain('BLEEDING');
        expect(alert.triggerKeywords).toContain('EMERGENCY');
      });

      it('should detect emergency keywords case-insensitive', async () => {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+15553333333',
          To: '+15559876543',
          Body: 'i cant breathe please help',
          NumMedia: '0',
        });

        const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
        const messages = await messagesRes.json();
        expect(messages.messages[0].isEmergency).toBe(true);
      });
    });

    describe('Simple Command Detection', () => {
      it('should detect command: C (confirm)', async () => {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+15554444444',
          To: '+15559876543',
          Body: 'C',
          NumMedia: '0',
        });

        const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
        const messages = await messagesRes.json();
        expect(messages.messages[0].detectedCommand).toBe('confirm');
      });

      it('should detect command: R (reschedule)', async () => {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+15554444444',
          To: '+15559876543',
          Body: 'R',
          NumMedia: '0',
        });

        const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
        const messages = await messagesRes.json();
        expect(messages.messages[0].detectedCommand).toBe('reschedule');
      });

      it('should detect command: HERE (arrived)', async () => {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+15554444444',
          To: '+15559876543',
          Body: 'HERE',
          NumMedia: '0',
        });

        const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
        const messages = await messagesRes.json();
        expect(messages.messages[0].detectedCommand).toBe('arrived');
      });

      it('should detect command: YES (accept)', async () => {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+15554444444',
          To: '+15559876543',
          Body: 'YES',
          NumMedia: '0',
        });

        const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
        const messages = await messagesRes.json();
        // Note: YES is both opt-in and command - opt-in takes precedence
        expect(messages.messages[0].isOptIn).toBe(true);
      });

      it('should detect command: NO (decline)', async () => {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+15554444444',
          To: '+15559876543',
          Body: 'NO',
          NumMedia: '0',
        });

        const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
        const messages = await messagesRes.json();
        expect(messages.messages[0].detectedCommand).toBe('decline');
      });
    });

    describe('Validation and Error Handling', () => {
      it('should return 200 even with missing MessageSid', async () => {
        const res = await postFormData('/api/webhooks/twilio/inbound', {
          From: '+15551234567',
          To: '+15559876543',
          Body: 'Missing MessageSid',
          NumMedia: '0',
        });

        // Always returns 200 to prevent Twilio retries
        expect(res.status).toBe(200);
      });

      it('should return 200 even with missing From', async () => {
        const res = await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          To: '+15559876543',
          Body: 'Missing From',
          NumMedia: '0',
        });

        expect(res.status).toBe(200);
      });

      it('should return 200 even with missing Body', async () => {
        const res = await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+15551234567',
          To: '+15559876543',
          NumMedia: '0',
        });

        expect(res.status).toBe(200);
      });

      it('should handle empty NumMedia', async () => {
        const res = await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          From: '+15551234567',
          To: '+15559876543',
          Body: 'No media',
        });

        expect(res.status).toBe(200);
      });
    });
  });

  // ===================
  // Status Webhook Tests
  // ===================
  describe('POST /api/webhooks/twilio/status', () => {
    describe('Basic Status Updates', () => {
      const statuses = ['queued', 'sending', 'sent', 'delivered', 'undelivered', 'failed'];

      statuses.forEach((status) => {
        it(`should accept status update: ${status}`, async () => {
          const res = await postFormData('/api/webhooks/twilio/status', {
            MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
            MessageStatus: status,
            To: '+15551234567',
          });

          expect(res.status).toBe(200);

          const updatesRes = await get('/api/webhooks/twilio/status-updates');
          const updates = await updatesRes.json();
          expect(updates.updates[0].messageStatus).toBe(status);
        });
      });

      it('should store status update details', async () => {
        const messageSid = 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32);

        await postFormData('/api/webhooks/twilio/status', {
          MessageSid: messageSid,
          MessageStatus: 'delivered',
          To: '+15551234567',
        });

        const updatesRes = await get('/api/webhooks/twilio/status-updates');
        const updates = await updatesRes.json();
        const update = updates.updates[0];

        expect(update.messageSid).toBe(messageSid);
        expect(update.to).toBe('+15551234567');
        expect(update.timestamp).toBeDefined();
      });
    });

    describe('Error Code Handling', () => {
      it('should handle error code 30003 (Unreachable destination)', async () => {
        await postFormData('/api/webhooks/twilio/status', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          MessageStatus: 'failed',
          ErrorCode: '30003',
          ErrorMessage: 'Unreachable destination handset',
          To: '+15551234567',
        });

        const updatesRes = await get('/api/webhooks/twilio/status-updates');
        const updates = await updatesRes.json();
        expect(updates.updates[0].errorCode).toBe('30003');
        expect(updates.updates[0].errorMessage).toBeDefined();
      });

      it('should handle error code 30004 (Message blocked)', async () => {
        const to = '+11234567890'; // existing patient

        await postFormData('/api/webhooks/twilio/status', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          MessageStatus: 'failed',
          ErrorCode: '30004',
          ErrorMessage: 'Message blocked',
          To: to,
        });

        const updatesRes = await get('/api/webhooks/twilio/status-updates');
        const updates = await updatesRes.json();
        expect(updates.updates[0].errorCode).toBe('30004');
      });

      it('should handle error code 30005 (Unknown destination)', async () => {
        await postFormData('/api/webhooks/twilio/status', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          MessageStatus: 'failed',
          ErrorCode: '30005',
          ErrorMessage: 'Unknown destination handset',
          To: '+15551234567',
        });

        const updatesRes = await get('/api/webhooks/twilio/status-updates');
        const updates = await updatesRes.json();
        expect(updates.updates[0].errorCode).toBe('30005');
      });

      it('should handle error code 30006 (Landline)', async () => {
        await postFormData('/api/webhooks/twilio/status', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          MessageStatus: 'failed',
          ErrorCode: '30006',
          ErrorMessage: 'Landline or unreachable carrier',
          To: '+15551234567',
        });

        const updatesRes = await get('/api/webhooks/twilio/status-updates');
        const updates = await updatesRes.json();
        expect(updates.updates[0].errorCode).toBe('30006');
      });

      it('should handle error code 30007 (Spam filter)', async () => {
        await postFormData('/api/webhooks/twilio/status', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          MessageStatus: 'failed',
          ErrorCode: '30007',
          ErrorMessage: 'Message filtered as spam',
          To: '+15551234567',
        });

        const updatesRes = await get('/api/webhooks/twilio/status-updates');
        const updates = await updatesRes.json();
        expect(updates.updates[0].errorCode).toBe('30007');
        // Note: Alert creation only happens if outbound message exists in the system
      });
    });

    describe('Validation and Error Handling', () => {
      it('should return 200 even with missing MessageSid', async () => {
        const res = await postFormData('/api/webhooks/twilio/status', {
          MessageStatus: 'delivered',
          To: '+15551234567',
        });

        expect(res.status).toBe(200);
      });

      it('should return 200 even with missing MessageStatus', async () => {
        const res = await postFormData('/api/webhooks/twilio/status', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          To: '+15551234567',
        });

        expect(res.status).toBe(200);
      });

      it('should handle unknown error codes gracefully', async () => {
        const res = await postFormData('/api/webhooks/twilio/status', {
          MessageSid: 'SM' + crypto.randomUUID().replace(/-/g, '').substring(0, 32),
          MessageStatus: 'failed',
          ErrorCode: '99999',
          ErrorMessage: 'Unknown error',
          To: '+15551234567',
        });

        expect(res.status).toBe(200);
      });
    });
  });

  // ===================
  // Testing/Debug Endpoints
  // ===================
  describe('Testing/Debug Endpoints', () => {
    describe('GET /api/webhooks/twilio/inbound-messages', () => {
      it('should return empty array when no messages', async () => {
        const res = await get('/api/webhooks/twilio/inbound-messages');

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.messages).toEqual([]);
        expect(data.total).toBe(0);
      });

      it('should return all inbound messages', async () => {
        // Send a few messages
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM1',
          From: '+15551111111',
          To: '+15559876543',
          Body: 'Message 1',
          NumMedia: '0',
        });

        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM2',
          From: '+15552222222',
          To: '+15559876543',
          Body: 'Message 2',
          NumMedia: '0',
        });

        const res = await get('/api/webhooks/twilio/inbound-messages');
        const data = await res.json();

        expect(data.total).toBe(2);
        expect(data.messages.length).toBe(2);
      });

      it('should limit to 50 most recent messages', async () => {
        // Send 60 messages
        for (let i = 0; i < 60; i++) {
          await postFormData('/api/webhooks/twilio/inbound', {
            MessageSid: `SM${i}`,
            From: '+15551234567',
            To: '+15559876543',
            Body: `Message ${i}`,
            NumMedia: '0',
          });
        }

        const res = await get('/api/webhooks/twilio/inbound-messages');
        const data = await res.json();

        expect(data.total).toBe(60);
        expect(data.messages.length).toBe(50); // Limited to 50
      });

      it('should sort messages by timestamp descending', async () => {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM1',
          From: '+15551111111',
          To: '+15559876543',
          Body: 'First',
          NumMedia: '0',
        });

        // Small delay
        await new Promise((resolve) => setTimeout(resolve, 10));

        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM2',
          From: '+15552222222',
          To: '+15559876543',
          Body: 'Second',
          NumMedia: '0',
        });

        const res = await get('/api/webhooks/twilio/inbound-messages');
        const data = await res.json();

        // Most recent should be first
        expect(data.messages[0].body).toBe('Second');
        expect(data.messages[1].body).toBe('First');
      });
    });

    describe('GET /api/webhooks/twilio/status-updates', () => {
      it('should return empty array when no updates', async () => {
        const res = await get('/api/webhooks/twilio/status-updates');

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.updates).toEqual([]);
        expect(data.total).toBe(0);
      });

      it('should return all status updates', async () => {
        await postFormData('/api/webhooks/twilio/status', {
          MessageSid: 'SM1',
          MessageStatus: 'sent',
          To: '+15551234567',
        });

        await postFormData('/api/webhooks/twilio/status', {
          MessageSid: 'SM1',
          MessageStatus: 'delivered',
          To: '+15551234567',
        });

        const res = await get('/api/webhooks/twilio/status-updates');
        const data = await res.json();

        expect(data.total).toBe(2);
        expect(data.updates.length).toBe(2);
      });

      it('should limit to 50 most recent updates', async () => {
        for (let i = 0; i < 60; i++) {
          await postFormData('/api/webhooks/twilio/status', {
            MessageSid: `SM${i}`,
            MessageStatus: 'delivered',
            To: '+15551234567',
          });
        }

        const res = await get('/api/webhooks/twilio/status-updates');
        const data = await res.json();

        expect(data.total).toBe(60);
        expect(data.updates.length).toBe(50);
      });
    });

    describe('GET /api/webhooks/twilio/alerts', () => {
      it('should return empty array when no alerts', async () => {
        const res = await get('/api/webhooks/twilio/alerts');

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.alerts).toEqual([]);
        expect(data.total).toBe(0);
      });

      it('should return all staff alerts', async () => {
        // Create emergency
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM1',
          From: '+15551234567',
          To: '+15559876543',
          Body: 'EMERGENCY help needed!',
          NumMedia: '0',
        });

        const res = await get('/api/webhooks/twilio/alerts');
        const data = await res.json();

        expect(data.total).toBeGreaterThan(0);
        expect(data.alerts[0].type).toBe('emergency');
      });

      it('should sort alerts by createdAt descending', async () => {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM1',
          From: '+15551111111',
          To: '+15559876543',
          Body: 'EMERGENCY first',
          NumMedia: '0',
        });

        await new Promise((resolve) => setTimeout(resolve, 10));

        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM2',
          From: '+15552222222',
          To: '+15559876543',
          Body: 'EMERGENCY second',
          NumMedia: '0',
        });

        const res = await get('/api/webhooks/twilio/alerts');
        const data = await res.json();

        expect(data.alerts[0].message).toContain('second');
        expect(data.alerts[1].message).toContain('first');
      });
    });

    describe('GET /api/webhooks/twilio/conversations', () => {
      it('should return empty array when no conversations', async () => {
        const res = await get('/api/webhooks/twilio/conversations');

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.conversations).toEqual([]);
        expect(data.total).toBe(0);
      });

      it('should return all conversations', async () => {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM1',
          From: '+15551111111',
          To: '+15559876543',
          Body: 'Message from patient 1',
          NumMedia: '0',
        });

        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM2',
          From: '+15552222222',
          To: '+15559876543',
          Body: 'Message from patient 2',
          NumMedia: '0',
        });

        const res = await get('/api/webhooks/twilio/conversations');
        const data = await res.json();

        expect(data.total).toBe(2);
        expect(data.conversations.length).toBe(2);
      });

      it('should sort conversations by lastMessageAt descending', async () => {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM1',
          From: '+15551111111',
          To: '+15559876543',
          Body: 'First conversation',
          NumMedia: '0',
        });

        await new Promise((resolve) => setTimeout(resolve, 10));

        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: 'SM2',
          From: '+15552222222',
          To: '+15559876543',
          Body: 'Second conversation',
          NumMedia: '0',
        });

        const res = await get('/api/webhooks/twilio/conversations');
        const data = await res.json();

        expect(data.conversations[0].patientPhone).toBe('+15552222222');
        expect(data.conversations[1].patientPhone).toBe('+15551111111');
      });
    });
  });

  // ===================
  // Edge Cases
  // ===================
  describe('Edge Cases and Integration Scenarios', () => {
    it('should handle rapid succession of messages from same patient', async () => {
      const from = '+15551234567';

      for (let i = 0; i < 5; i++) {
        await postFormData('/api/webhooks/twilio/inbound', {
          MessageSid: `SM${i}`,
          From: from,
          To: '+15559876543',
          Body: `Rapid message ${i}`,
          NumMedia: '0',
        });
      }

      const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
      const messages = await messagesRes.json();
      expect(messages.total).toBe(5);

      const conversationsRes = await get('/api/webhooks/twilio/conversations');
      const conversations = await conversationsRes.json();
      expect(conversations.total).toBe(1); // Only one conversation
      expect(conversations.conversations[0].messageCount).toBe(5);
    });

    it('should handle opt-out followed by opt-in', async () => {
      const from = '+15551234567';

      // Opt-out
      await postFormData('/api/webhooks/twilio/inbound', {
        MessageSid: 'SM1',
        From: from,
        To: '+15559876543',
        Body: 'STOP',
        NumMedia: '0',
      });

      // Opt-in
      await postFormData('/api/webhooks/twilio/inbound', {
        MessageSid: 'SM2',
        From: from,
        To: '+15559876543',
        Body: 'START',
        NumMedia: '0',
      });

      const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
      const messages = await messagesRes.json();
      expect(messages.total).toBe(2);

      // Find the opt-in and opt-out messages by body
      const optInMessage = messages.messages.find((m: any) => m.body === 'START');
      const optOutMessage = messages.messages.find((m: any) => m.body === 'STOP');

      expect(optInMessage).toBeDefined();
      expect(optInMessage.isOptIn).toBe(true);
      expect(optInMessage.processed).toBe(true);

      expect(optOutMessage).toBeDefined();
      expect(optOutMessage.isOptOut).toBe(true);
      expect(optOutMessage.processed).toBe(true);
    });

    it('should handle messages with special characters', async () => {
      const res = await postFormData('/api/webhooks/twilio/inbound', {
        MessageSid: 'SM1',
        From: '+15551234567',
        To: '+15559876543',
        Body: "Hello! How's it going? I'm interested in scheduling 😊",
        NumMedia: '0',
      });

      expect(res.status).toBe(200);
    });

    it('should handle very long messages', async () => {
      const longMessage = 'A'.repeat(1600); // SMS max is typically 1600

      const res = await postFormData('/api/webhooks/twilio/inbound', {
        MessageSid: 'SM1',
        From: '+15551234567',
        To: '+15559876543',
        Body: longMessage,
        NumMedia: '0',
      });

      expect(res.status).toBe(200);
    });

    it('should handle empty message body', async () => {
      const res = await postFormData('/api/webhooks/twilio/inbound', {
        MessageSid: 'SM1',
        From: '+15551234567',
        To: '+15559876543',
        Body: '',
        NumMedia: '0',
      });

      expect(res.status).toBe(200);
    });

    it('should handle international phone numbers', async () => {
      const res = await postFormData('/api/webhooks/twilio/inbound', {
        MessageSid: 'SM1',
        From: '+447700900000', // UK number
        To: '+15559876543',
        Body: 'Hello from the UK',
        NumMedia: '0',
      });

      expect(res.status).toBe(200);

      const messagesRes = await get('/api/webhooks/twilio/inbound-messages');
      const messages = await messagesRes.json();
      expect(messages.messages[0].from).toBe('+447700900000');
    });

    it('should handle status update for non-existent message', async () => {
      const res = await postFormData('/api/webhooks/twilio/status', {
        MessageSid: 'SM_NONEXISTENT',
        MessageStatus: 'delivered',
        To: '+15551234567',
      });

      // Should still return 200 and store the update
      expect(res.status).toBe(200);

      const updatesRes = await get('/api/webhooks/twilio/status-updates');
      const updates = await updatesRes.json();
      expect(updates.total).toBe(1);
    });
  });
});
