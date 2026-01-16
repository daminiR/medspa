/**
 * SMS Sender Service
 * Handles sending SMS messages via Twilio with comprehensive error handling
 * Supports both mock (development) and real (production) modes
 */

import { z } from 'zod';

// ============================================================================
// TYPE DEFINITIONS & VALIDATION
// ============================================================================

/**
 * Schema for SMS message validation
 */
const SMSMessageSchema = z.object({
  to: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  body: z.string().min(1).max(1600), // SMS has 160 char limit per segment
  media: z.array(z.string().url()).optional(),
  priority: z.enum(['high', 'normal', 'low']).default('normal'),
  metadata: z.record(z.any(), z.unknown()).optional(),
  patientId: z.string().optional(),
  conversationId: z.string().optional(),
});

export type SMSMessage = z.infer<typeof SMSMessageSchema>;

/**
 * Response from sending an SMS
 */
export interface SMSSendResult {
  success: boolean;
  messageId?: string;
  status?: string;
  cost?: number;
  error?: string;
  errorCode?: string;
  timestamp: Date;
  provider: 'twilio' | 'mock';
}

/**
 * SMS send options for internal use
 */
export interface SMSSendOptions {
  retryCount?: number;
  timeout?: number;
  statusCallbackUrl?: string;
}

// ============================================================================
// RATE LIMITING & QUEUE MANAGEMENT
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: Date;
}

const RATE_LIMITS = {
  perMinute: 100,
  perHour: 1000,
  perDay: 10000,
};

class RateLimiter {
  private minuteLimits = new Map<string, RateLimitEntry>();
  private hourLimits = new Map<string, RateLimitEntry>();
  private dayLimits = new Map<string, RateLimitEntry>();

  checkLimit(phone: string): { allowed: boolean; reason?: string } {
    const now = new Date();

    // Check minute limit
    const minuteKey = `${phone}:${now.getMinutes()}`;
    const minuteEntry = this.minuteLimits.get(minuteKey);
    if (minuteEntry && minuteEntry.count >= RATE_LIMITS.perMinute) {
      if (now < minuteEntry.resetAt) {
        return {
          allowed: false,
          reason: `Rate limit exceeded: ${RATE_LIMITS.perMinute} messages per minute`,
        };
      } else {
        this.minuteLimits.delete(minuteKey);
      }
    }

    // Check hour limit
    const hourKey = `${phone}:${now.getHours()}`;
    const hourEntry = this.hourLimits.get(hourKey);
    if (hourEntry && hourEntry.count >= RATE_LIMITS.perHour) {
      if (now < hourEntry.resetAt) {
        return {
          allowed: false,
          reason: `Rate limit exceeded: ${RATE_LIMITS.perHour} messages per hour`,
        };
      } else {
        this.hourLimits.delete(hourKey);
      }
    }

    // Check day limit
    const dayKey = `${phone}:${now.toDateString()}`;
    const dayEntry = this.dayLimits.get(dayKey);
    if (dayEntry && dayEntry.count >= RATE_LIMITS.perDay) {
      if (now < dayEntry.resetAt) {
        return {
          allowed: false,
          reason: `Rate limit exceeded: ${RATE_LIMITS.perDay} messages per day`,
        };
      } else {
        this.dayLimits.delete(dayKey);
      }
    }

    return { allowed: true };
  }

  recordSend(phone: string): void {
    const now = new Date();

    // Record minute
    const minuteKey = `${phone}:${now.getMinutes()}`;
    const minuteEntry = this.minuteLimits.get(minuteKey);
    if (minuteEntry) {
      minuteEntry.count++;
    } else {
      const resetTime = new Date(now);
      resetTime.setSeconds(0);
      resetTime.setMilliseconds(0);
      resetTime.setMinutes(resetTime.getMinutes() + 1);
      this.minuteLimits.set(minuteKey, { count: 1, resetAt: resetTime });
    }

    // Record hour
    const hourKey = `${phone}:${now.getHours()}`;
    const hourEntry = this.hourLimits.get(hourKey);
    if (hourEntry) {
      hourEntry.count++;
    } else {
      const resetTime = new Date(now);
      resetTime.setMinutes(0);
      resetTime.setSeconds(0);
      resetTime.setMilliseconds(0);
      resetTime.setHours(resetTime.getHours() + 1);
      this.hourLimits.set(hourKey, { count: 1, resetAt: resetTime });
    }

    // Record day
    const dayKey = `${phone}:${now.toDateString()}`;
    const dayEntry = this.dayLimits.get(dayKey);
    if (dayEntry) {
      dayEntry.count++;
    } else {
      const resetTime = new Date(now);
      resetTime.setHours(0, 0, 0, 0);
      resetTime.setDate(resetTime.getDate() + 1);
      this.dayLimits.set(dayKey, { count: 1, resetAt: resetTime });
    }

    // Clean up old entries
    this.cleanup();
  }

  private cleanup(): void {
    const now = new Date();
    const keysToDelete: string[] = [];
    this.minuteLimits.forEach((entry, key) => {
      if (now > entry.resetAt) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.minuteLimits.delete(key));
  }
}

// ============================================================================
// COST TRACKING
// ============================================================================

interface CostEntry {
  cost: number;
  timestamp: Date;
  phone: string;
  messageId: string;
}

class CostTracker {
  private costs: CostEntry[] = [];

  recordCost(messageId: string, phone: string, cost: number): void {
    this.costs.push({
      cost,
      timestamp: new Date(),
      phone,
      messageId,
    });
  }

  getTotalCost(): number {
    return this.costs.reduce((sum, entry) => sum + entry.cost, 0);
  }

  getCostByDate(from: Date, to: Date): number {
    return this.costs
      .filter((entry) => entry.timestamp >= from && entry.timestamp <= to)
      .reduce((sum, entry) => sum + entry.cost, 0);
  }

  getCostByPhone(phone: string): number {
    return this.costs
      .filter((entry) => entry.phone === phone)
      .reduce((sum, entry) => sum + entry.cost, 0);
  }

  getStats() {
    return {
      totalCost: this.getTotalCost(),
      totalMessages: this.costs.length,
      averageCost: this.costs.length > 0 ? this.getTotalCost() / this.costs.length : 0,
      costs: this.costs.slice(-100), // Last 100 for logging
    };
  }
}

// ============================================================================
// SMS SENDER SERVICE
// ============================================================================

export class SMSSender {
  private static instance: SMSSender;
  private rateLimiter = new RateLimiter();
  private costTracker = new CostTracker();
  private mockMode = process.env.NODE_ENV === 'development' && !process.env.TWILIO_ACCOUNT_SID;
  private messageLog: Map<string, SMSSendResult> = new Map();

  // Configuration
  private config = {
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || '',
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || '',
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID || '',
    costPerMessage: 0.0075, // Twilio SMS cost (varies by destination)
    mockMode: this.mockMode,
  };

  private constructor() {
    this.logStartup();
  }

  static getInstance(): SMSSender {
    if (!SMSSender.instance) {
      SMSSender.instance = new SMSSender();
    }
    return SMSSender.instance;
  }

  /**
   * Send a single SMS message
   */
  async send(message: SMSMessage, options?: SMSSendOptions): Promise<SMSSendResult> {
    try {
      // Validate input
      const validated = SMSMessageSchema.parse(message);

      // Format phone number
      const formattedPhone = this.formatPhoneNumber(validated.to);

      // Check rate limits
      const rateCheck = this.rateLimiter.checkLimit(formattedPhone);
      if (!rateCheck.allowed) {
        console.warn(`[SMS Sender] Rate limit hit for ${formattedPhone}`, rateCheck.reason);
        return {
          success: false,
          error: rateCheck.reason || 'Rate limit exceeded',
          errorCode: 'RATE_LIMIT_EXCEEDED',
          timestamp: new Date(),
          provider: this.config.mockMode ? 'mock' : 'twilio',
        };
      }

      // Send via appropriate provider
      let result: SMSSendResult;
      if (this.config.mockMode) {
        result = await this.sendMock(validated, formattedPhone);
      } else {
        result = await this.sendViaRealTwilio(validated, formattedPhone);
      }

      // Track if successful
      if (result.success) {
        this.rateLimiter.recordSend(formattedPhone);
        if (result.cost) {
          this.costTracker.recordCost(result.messageId || '', formattedPhone, result.cost);
        }
        this.messageLog.set(result.messageId || '', result);
      }

      return result;
    } catch (error: any) {
      console.error('[SMS Sender] Send failed:', error.message);
      return {
        success: false,
        error: error.message,
        errorCode: 'SEND_FAILED',
        timestamp: new Date(),
        provider: this.config.mockMode ? 'mock' : 'twilio',
      };
    }
  }

  /**
   * Send bulk SMS messages with batching and error handling
   */
  async sendBulk(messages: SMSMessage[]): Promise<SMSSendResult[]> {
    const results: SMSSendResult[] = [];
    const batchSize = 10;

    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);

      // Send batch in parallel
      const batchResults = await Promise.all(batch.map((msg) => this.send(msg)));
      results.push(...batchResults);

      // Small delay between batches
      if (i + batchSize < messages.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log(`[SMS Sender] Bulk send completed: ${results.filter((r) => r.success).length}/${messages.length} successful`);
    return results;
  }

  /**
   * Get message status by ID
   */
  getMessageStatus(messageId: string): SMSSendResult | undefined {
    return this.messageLog.get(messageId);
  }

  /**
   * Get cost statistics
   */
  getCostStats() {
    return this.costTracker.getStats();
  }

  /**
   * Mock SMS send (development mode)
   */
  private async sendMock(message: SMSMessage, to: string): Promise<SMSSendResult> {
    const messageId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Randomly fail some messages for testing (10% failure rate)
    const shouldFail = Math.random() < 0.1;

    const result: SMSSendResult = {
      success: !shouldFail,
      messageId,
      status: shouldFail ? 'failed' : 'sent',
      cost: this.config.costPerMessage,
      error: shouldFail ? 'Simulated failure for testing' : undefined,
      errorCode: shouldFail ? 'SIMULATED_FAILURE' : undefined,
      timestamp: new Date(),
      provider: 'mock',
    };

    console.log(`[SMS Sender] Mock send ${result.success ? 'SUCCESS' : 'FAILED'}`, {
      to,
      messageId,
      bodyLength: message.body.length,
      cost: result.cost,
    });

    return result;
  }

  /**
   * Real Twilio SMS send
   */
  private async sendViaRealTwilio(message: SMSMessage, to: string): Promise<SMSSendResult> {
    try {
      // Check if Twilio is configured
      if (!this.config.twilioAccountSid || !this.config.twilioAuthToken) {
        return {
          success: false,
          error: 'Twilio not configured',
          errorCode: 'TWILIO_NOT_CONFIGURED',
          timestamp: new Date(),
          provider: 'twilio',
        };
      }

      // Import twilio dynamically
      const twilio = await import('twilio');
      const client = twilio.default(this.config.twilioAccountSid, this.config.twilioAuthToken);

      // Send the message
      const twilioMessage = await client.messages.create({
        body: message.body,
        to,
        from: this.config.twilioPhoneNumber,
        ...(this.config.messagingServiceSid && { messagingServiceSid: this.config.messagingServiceSid }),
        ...(message.media && message.media.length > 0 && { mediaUrl: message.media }),
      });

      console.log(`[SMS Sender] Twilio send SUCCESS`, {
        to,
        sid: twilioMessage.sid,
        status: twilioMessage.status,
      });

      return {
        success: true,
        messageId: twilioMessage.sid,
        status: twilioMessage.status,
        cost: this.config.costPerMessage,
        timestamp: new Date(),
        provider: 'twilio',
      };
    } catch (error: any) {
      console.error(`[SMS Sender] Twilio send FAILED`, {
        error: error.message,
        code: error.code,
      });

      return {
        success: false,
        error: error.message,
        errorCode: error.code || 'TWILIO_ERROR',
        timestamp: new Date(),
        provider: 'twilio',
      };
    }
  }

  /**
   * Format phone number to E.164 format
   */
  private formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }

    return phone.startsWith('+') ? phone : `+${cleaned}`;
  }

  /**
   * Log service startup
   */
  private logStartup(): void {
    console.log('[SMS Sender] Service initialized', {
      mode: this.config.mockMode ? 'MOCK' : 'PRODUCTION',
      hasTwilioConfig: !!this.config.twilioAccountSid,
      costPerMessage: this.config.costPerMessage,
    });
  }
}

// Export singleton instance
export const smsSender = SMSSender.getInstance();
