/**
 * SMS Delivery Status Service
 * Tracks SMS delivery status, callbacks, and provides status history
 * Supports webhook callbacks from Twilio
 */

import { z } from 'zod';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Twilio delivery status values
 */
export type TwilioDeliveryStatus =
  | 'queued'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'undelivered';

/**
 * Error types for failed deliveries
 */
export enum DeliveryErrorType {
  INVALID_PHONE = 'invalid_phone',
  NETWORK_ERROR = 'network_error',
  CARRIER_ERROR = 'carrier_error',
  THROTTLED = 'throttled',
  BLOCKED = 'blocked',
  UNKNOWN = 'unknown',
}

/**
 * Delivery status record for a single message
 */
export interface DeliveryStatus {
  messageId: string;
  to: string;
  from: string;
  status: TwilioDeliveryStatus;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  errorCode?: string;
  errorMessage?: string;
  errorType?: DeliveryErrorType;
  segments?: number;
  price?: number;
  priceUnit?: string;
  metadata?: Record<string, any>;
}

/**
 * Webhook callback from Twilio
 */
export interface TwilioWebhookPayload {
  MessageSid: string;
  MessageStatus: TwilioDeliveryStatus;
  From: string;
  To: string;
  ErrorCode?: string;
  EventType?: string;
  Timestamp?: string;
  [key: string]: any;
}

/**
 * Webhook validation result
 */
export interface WebhookValidation {
  valid: boolean;
  reason?: string;
  payload?: TwilioWebhookPayload;
}

/**
 * Statistics for a group of deliveries
 */
export interface DeliveryStatistics {
  total: number;
  queued: number;
  sending: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  undelivered: number;
  deliveryRate: number;
  failureRate: number;
  averageDeliveryTime?: number;
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const TwilioWebhookSchema = z.object({
  MessageSid: z.string(),
  MessageStatus: z.enum(['queued', 'sending', 'sent', 'delivered', 'read', 'failed', 'undelivered']),
  From: z.string(),
  To: z.string(),
  ErrorCode: z.string().optional(),
  EventType: z.string().optional(),
  Timestamp: z.string().optional(),
});

// ============================================================================
// DELIVERY STATUS SERVICE
// ============================================================================

export class DeliveryStatusService {
  private static instance: DeliveryStatusService;
  private statusMap = new Map<string, DeliveryStatus>();
  private statusHistory = new Map<string, DeliveryStatus[]>(); // MessageId -> History
  private webhookCallbacks: Array<(status: DeliveryStatus) => Promise<void>> = [];

  private constructor() {
    console.log('[Delivery Status] Service initialized');
  }

  static getInstance(): DeliveryStatusService {
    if (!DeliveryStatusService.instance) {
      DeliveryStatusService.instance = new DeliveryStatusService();
    }
    return DeliveryStatusService.instance;
  }

  /**
   * Record initial message send
   */
  recordSend(messageId: string, to: string, from: string, metadata?: Record<string, any>): DeliveryStatus {
    const status: DeliveryStatus = {
      messageId,
      to,
      from,
      status: 'sending',
      sentAt: new Date(),
      metadata,
    };

    this.statusMap.set(messageId, status);
    this.recordHistory(messageId, status);

    console.log(`[Delivery Status] Recorded send: ${messageId} -> ${to}`);
    return status;
  }

  /**
   * Handle Twilio webhook callback
   */
  async handleWebhook(payload: TwilioWebhookPayload): Promise<WebhookValidation> {
    try {
      // Validate payload structure
      const validated = TwilioWebhookSchema.parse(payload);

      const messageId = validated.MessageSid;
      const status = validated.MessageStatus;
      const errorCode = validated.ErrorCode;

      // Get or create status record
      let deliveryStatus = this.statusMap.get(messageId);
      if (!deliveryStatus) {
        // Create new record from webhook (sometimes initial send is missed)
        deliveryStatus = {
          messageId,
          to: validated.To,
          from: validated.From,
          status: status as TwilioDeliveryStatus,
          sentAt: new Date(validated.Timestamp || Date.now()),
        };
      } else {
        // Update existing record
        deliveryStatus.status = status as TwilioDeliveryStatus;
        deliveryStatus.errorCode = errorCode;

        // Update timestamp based on status
        if (status === 'delivered') {
          deliveryStatus.deliveredAt = new Date();
        } else if (status === 'read') {
          deliveryStatus.readAt = new Date();
        }

        // Map error codes to error types
        if (errorCode) {
          deliveryStatus.errorType = this.mapErrorCode(errorCode);
          deliveryStatus.errorMessage = this.getErrorMessage(errorCode);
        }
      }

      // Update map
      this.statusMap.set(messageId, deliveryStatus);
      this.recordHistory(messageId, deliveryStatus);

      // Trigger callbacks
      await this.triggerCallbacks(deliveryStatus);

      console.log(`[Delivery Status] Webhook processed: ${messageId} -> ${status}`, {
        errorCode,
        to: deliveryStatus.to,
      });

      return {
        valid: true,
        payload: validated,
      };
    } catch (error: any) {
      console.error('[Delivery Status] Webhook validation failed:', error.message);
      return {
        valid: false,
        reason: error.message,
      };
    }
  }

  /**
   * Get current status for a message
   */
  getStatus(messageId: string): DeliveryStatus | undefined {
    return this.statusMap.get(messageId);
  }

  /**
   * Get status history for a message
   */
  getHistory(messageId: string): DeliveryStatus[] {
    return this.statusHistory.get(messageId) || [];
  }

  /**
   * Get all statuses for a phone number
   */
  getStatusesByPhone(phone: string): DeliveryStatus[] {
    return Array.from(this.statusMap.values())
      .filter(status => status.to === phone)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  /**
   * Get statistics for delivered/failed messages
   */
  getStatistics(since?: Date, until?: Date): DeliveryStatistics {
    const now = new Date();
    const fromDate = since || new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours
    const toDate = until || now;

    const statuses = Array.from(this.statusMap.values()).filter(
      (s) => s.sentAt >= fromDate && s.sentAt <= toDate
    );

    const stats: DeliveryStatistics = {
      total: statuses.length,
      queued: statuses.filter((s) => s.status === 'queued').length,
      sending: statuses.filter((s) => s.status === 'sending').length,
      sent: statuses.filter((s) => s.status === 'sent').length,
      delivered: statuses.filter((s) => s.status === 'delivered').length,
      read: statuses.filter((s) => s.status === 'read').length,
      failed: statuses.filter((s) => s.status === 'failed').length,
      undelivered: statuses.filter((s) => s.status === 'undelivered').length,
      deliveryRate: 0,
      failureRate: 0,
    };

    if (statuses.length > 0) {
      const delivered = stats.delivered + stats.sent + stats.read;
      const failed = stats.failed + stats.undelivered;
      stats.deliveryRate = (delivered / statuses.length) * 100;
      stats.failureRate = (failed / statuses.length) * 100;
    }

    // Calculate average delivery time
    const deliveredMessages = statuses.filter((s) => s.deliveredAt);
    if (deliveredMessages.length > 0) {
      const totalTime = deliveredMessages.reduce((sum, s) => {
        const deliveryTime = (s.deliveredAt!.getTime() - s.sentAt.getTime()) / 1000; // seconds
        return sum + deliveryTime;
      }, 0);
      stats.averageDeliveryTime = Math.round(totalTime / deliveredMessages.length);
    }

    return stats;
  }

  /**
   * Register a callback for status updates
   */
  onStatusUpdate(callback: (status: DeliveryStatus) => Promise<void>): () => void {
    this.webhookCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.webhookCallbacks.indexOf(callback);
      if (index > -1) {
        this.webhookCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Clear old status records (cleanup)
   */
  clearOldRecords(olderThan: Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)): number {
    let count = 0;
    const entries = Array.from(this.statusMap.entries());
    for (const [messageId, status] of entries) {
      if (status.sentAt < olderThan) {
        this.statusMap.delete(messageId);
        this.statusHistory.delete(messageId);
        count++;
      }
    }
    console.log(`[Delivery Status] Cleaned up ${count} old records`);
    return count;
  }

  /**
   * Get delivery issues for alerting
   */
  getIssues(since?: Date): Array<{ messageId: string; issue: string; details: DeliveryStatus }> {
    const issues: Array<{ messageId: string; issue: string; details: DeliveryStatus }> = [];
    const checkTime = since || new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes

    const entries = Array.from(this.statusMap.entries());
    for (const [messageId, status] of entries) {
      if (status.sentAt < checkTime) continue;

      if (status.status === 'failed' || status.status === 'undelivered') {
        issues.push({
          messageId,
          issue: `Message ${status.status}: ${status.errorMessage || 'Unknown error'}`,
          details: status,
        });
      } else if (status.status === 'sending' || status.status === 'queued') {
        // Check if it's been in this state too long (> 10 minutes)
        const ageInMinutes = (Date.now() - status.sentAt.getTime()) / 1000 / 60;
        if (ageInMinutes > 10) {
          issues.push({
            messageId,
            issue: `Message stuck in ${status.status} state for ${Math.round(ageInMinutes)} minutes`,
            details: status,
          });
        }
      }
    }

    return issues;
  }

  /**
   * Export status as CSV for reporting
   */
  exportAsCSV(since?: Date, until?: Date): string {
    const statuses = Array.from(this.statusMap.values()).filter((s) => {
      if (!since && !until) return true;
      const fromDate = since || new Date(0);
      const toDate = until || new Date();
      return s.sentAt >= fromDate && s.sentAt <= toDate;
    });

    const rows = [
      'Message ID,To,From,Status,Sent At,Delivered At,Error Code,Error Message',
      ...statuses.map(
        (s) =>
          `"${s.messageId}","${s.to}","${s.from}","${s.status}","${s.sentAt.toISOString()}","${
            s.deliveredAt?.toISOString() || ''
          }","${s.errorCode || ''}","${s.errorMessage || ''}"`
      ),
    ];

    return rows.join('\n');
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  /**
   * Record status in history
   */
  private recordHistory(messageId: string, status: DeliveryStatus): void {
    let history = this.statusHistory.get(messageId);
    if (!history) {
      history = [];
      this.statusHistory.set(messageId, history);
    }
    history.push(JSON.parse(JSON.stringify(status))); // Deep copy
  }

  /**
   * Trigger all registered callbacks
   */
  private async triggerCallbacks(status: DeliveryStatus): Promise<void> {
    const promises = this.webhookCallbacks.map((callback) =>
      callback(status).catch((error) => {
        console.error('[Delivery Status] Callback error:', error);
      })
    );
    await Promise.allSettled(promises);
  }

  /**
   * Map Twilio error codes to internal error types
   */
  private mapErrorCode(errorCode: string): DeliveryErrorType {
    const codeMap: Record<string, DeliveryErrorType> = {
      '21201': DeliveryErrorType.INVALID_PHONE,
      '21211': DeliveryErrorType.INVALID_PHONE,
      '21400': DeliveryErrorType.INVALID_PHONE,
      '20003': DeliveryErrorType.NETWORK_ERROR,
      '30001': DeliveryErrorType.NETWORK_ERROR,
      '30002': DeliveryErrorType.NETWORK_ERROR,
      '30003': DeliveryErrorType.NETWORK_ERROR,
      '21614': DeliveryErrorType.CARRIER_ERROR,
      '21615': DeliveryErrorType.CARRIER_ERROR,
      '21617': DeliveryErrorType.CARRIER_ERROR,
      '21619': DeliveryErrorType.CARRIER_ERROR,
      '30004': DeliveryErrorType.THROTTLED,
      '30005': DeliveryErrorType.THROTTLED,
      '21610': DeliveryErrorType.BLOCKED,
      '21612': DeliveryErrorType.BLOCKED,
      '21613': DeliveryErrorType.BLOCKED,
    };
    return codeMap[errorCode] || DeliveryErrorType.UNKNOWN;
  }

  /**
   * Get human-readable error message
   */
  private getErrorMessage(errorCode: string): string {
    const messages: Record<string, string> = {
      '21201': 'Invalid phone number format',
      '21211': 'The number you attempted to reach is invalid',
      '21400': 'Invalid credentials or permission denied',
      '20003': 'Connection error - try again later',
      '30001': 'Queue overflow - service temporarily unavailable',
      '30002': 'Account suspended',
      '30003': 'Not permitted to use this resource',
      '21614': 'Carrier violation',
      '21615': 'Carrier violation - cannot send to this number',
      '21617': 'Carrier violation - restricted SMS',
      '21619': 'Carrier violation - SMS not allowed',
      '30004': 'Rate limit exceeded',
      '30005': 'Throttle limit exceeded',
      '21610': 'SMS blocked - messaging not allowed to this number',
      '21612': 'SMS blocked - carrier blocked',
      '21613': 'SMS blocked - destination blocked',
    };
    return messages[errorCode] || `Unknown error (code: ${errorCode})`;
  }
}

// Export singleton instance
export const deliveryStatusService = DeliveryStatusService.getInstance();
