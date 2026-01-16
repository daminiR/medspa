/**
 * Twilio Services Export
 * Comprehensive SMS integration for medical spa platform
 *
 * Features:
 * - SMS sending with error handling and retry logic
 * - Delivery status tracking with webhooks
 * - Rate limiting and cost tracking
 * - Mock mode for development
 * - HIPAA-compliant logging
 */

export { smsSender, SMSSender } from './sms-sender';
export type { SMSMessage, SMSSendResult, SMSSendOptions } from './sms-sender';

export { deliveryStatusService, DeliveryStatusService } from './delivery-status';
export type {
  DeliveryStatus,
  TwilioDeliveryStatus,
  TwilioWebhookPayload,
  DeliveryStatistics,
} from './delivery-status';
export { DeliveryErrorType } from './delivery-status';

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

import { smsSender } from './sms-sender';
import { deliveryStatusService } from './delivery-status';
import type { SMSMessage, SMSSendResult } from './sms-sender';

/**
 * Send a single SMS message
 * @example
 * await sendSMS({
 *   to: '+15551234567',
 *   body: 'Hello from medical spa!',
 *   patientId: 'p1'
 * })
 */
export async function sendSMS(message: SMSMessage, timeout?: number): Promise<SMSSendResult> {
  return smsSender.send(message, { timeout });
}

/**
 * Send multiple SMS messages with batching
 * @example
 * await sendSMSBulk([
 *   { to: '+15551234567', body: 'Message 1' },
 *   { to: '+15552345678', body: 'Message 2' }
 * ])
 */
export async function sendSMSBulk(messages: SMSMessage[]): Promise<SMSSendResult[]> {
  return smsSender.sendBulk(messages);
}

/**
 * Get current status of a message
 */
export function getMessageStatus(messageId: string) {
  return deliveryStatusService.getStatus(messageId);
}

/**
 * Get delivery statistics
 */
export function getDeliveryStats() {
  return deliveryStatusService.getStatistics();
}

/**
 * Get cost statistics
 */
export function getCostStats() {
  return smsSender.getCostStats();
}

/**
 * Record a sent message for status tracking
 */
export function recordMessageSent(
  messageId: string,
  to: string,
  from: string,
  metadata?: Record<string, any>
) {
  return deliveryStatusService.recordSend(messageId, to, from, metadata);
}

// ============================================================================
// DEBUG & TESTING UTILITIES
// ============================================================================

/**
 * Debug utilities for development and testing
 */
export const twilioDebug = {
  /**
   * Send a test SMS
   */
  async sendTestSMS(phoneNumber: string) {
    console.log(`[Twilio Debug] Sending test SMS to ${phoneNumber}`);
    const result = await sendSMS({
      to: phoneNumber,
      body: 'Test message from Medical Spa Platform. Reply STOP to opt out.',
      priority: 'normal',
    });
    console.log('[Twilio Debug] Test SMS result:', result);
    return result;
  },

  /**
   * Simulate a delivery webhook
   */
  async simulateWebhook(messageId: string, status: 'delivered' | 'failed' | 'sent') {
    console.log(`[Twilio Debug] Simulating webhook: ${messageId} -> ${status}`);
    const result = await deliveryStatusService.handleWebhook({
      MessageSid: messageId,
      MessageStatus: status as any,
      From: '+15551234567',
      To: '+15559999999',
      ErrorCode: status === 'failed' ? '21211' : undefined,
    });
    console.log('[Twilio Debug] Webhook simulation result:', result);
    return result;
  },

  /**
   * Get diagnostic information
   */
  getDiagnostics() {
    return {
      smsStats: smsSender.getCostStats(),
      deliveryStats: deliveryStatusService.getStatistics(),
      issues: deliveryStatusService.getIssues(),
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Get all pending messages
   */
  getPendingMessages() {
    const stats = deliveryStatusService.getStatistics();
    return {
      queued: stats.queued,
      sending: stats.sending,
      sent: stats.sent,
      total: stats.queued + stats.sending + stats.sent,
    };
  },

  /**
   * Get failed messages for investigation
   */
  getFailedMessages() {
    const issues = deliveryStatusService.getIssues();
    return issues.filter(i => i.details.status === 'failed' || i.details.status === 'undelivered');
  },

  /**
   * Export delivery report
   */
  exportDeliveryReport(since?: Date, until?: Date) {
    return {
      csv: deliveryStatusService.exportAsCSV(since, until),
      stats: deliveryStatusService.getStatistics(since, until),
      timestamp: new Date().toISOString(),
    };
  },
};

// Log initialization
console.log('[Twilio Services] Initialized successfully');
