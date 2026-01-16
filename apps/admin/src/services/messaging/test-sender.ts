/**
 * Test Message Sender Service
 * Allows staff to test templates and messaging without affecting actual patients
 * Includes recipient validation, template variable replacement, and separate logging
 */

import { messagingService, MessageStatus } from './core';
import { getTemplate, replaceVariables, validateTemplateVariables } from './templates';
import { z } from 'zod';

// Test message types
export type TestRecipientType = 'email' | 'sms';

export interface TestMessageRequest {
  /** Recipient phone or email */
  recipient: string;
  /** Type of recipient */
  recipientType: TestRecipientType;
  /** Template ID to use (optional if custom message provided) */
  templateId?: string;
  /** Custom message (overrides template) */
  customMessage?: string;
  /** Variables for template substitution */
  variables?: Record<string, any>;
  /** Who initiated the test send */
  testedBy: string;
}

export interface TestMessageResult {
  success: boolean;
  messageId?: string;
  status?: string;
  recipient: string;
  recipientType: TestRecipientType;
  templateUsed?: string;
  messageContent: string;
  sentAt: Date;
  error?: string;
}

export interface TestSendLog {
  id: string;
  timestamp: Date;
  testedBy: string;
  recipient: string;
  recipientType: TestRecipientType;
  templateId?: string;
  messageContent: string;
  status: 'success' | 'failed';
  deliveryStatus?: string;
  messageId?: string;
  errorMessage?: string;
}

// In-memory test send logs (in production, would be database)
const testSendLogs: TestSendLog[] = [];

/**
 * Validation schemas
 */
const PhoneNumberRegex = /^\+?[1-9]\d{1,14}$/;
const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TestMessageSchema = z.object({
  recipient: z.string().min(1, 'Recipient is required'),
  recipientType: z.enum(['email', 'sms']),
  templateId: z.string().optional(),
  customMessage: z.string().min(1).max(1600).optional(),
  variables: z.record(z.string(), z.any()).optional(),
  testedBy: z.string().min(1, 'Tester name is required'),
});

export class TestMessageSender {
  private static instance: TestMessageSender;
  private static readonly TEST_SEND_PREFIX = '[TEST]';

  private constructor() {}

  static getInstance(): TestMessageSender {
    if (!TestMessageSender.instance) {
      TestMessageSender.instance = new TestMessageSender();
    }
    return TestMessageSender.instance;
  }

  /**
   * Validate recipient format (email or phone)
   */
  private validateRecipient(recipient: string, type: TestRecipientType): { valid: boolean; error?: string } {
    if (!recipient || !recipient.trim()) {
      return { valid: false, error: 'Recipient cannot be empty' };
    }

    if (type === 'sms') {
      if (!PhoneNumberRegex.test(recipient)) {
        return {
          valid: false,
          error: 'Invalid phone number. Use format: +1234567890 or 1234567890',
        };
      }
    } else if (type === 'email') {
      if (!EmailRegex.test(recipient)) {
        return {
          valid: false,
          error: 'Invalid email address',
        };
      }
    }

    return { valid: true };
  }

  /**
   * Format phone number to E.164 standard
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Add country code if missing
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }

    // Ensure + prefix
    if (!phone.includes('+')) {
      return `+${cleaned}`;
    }

    return phone;
  }

  /**
   * Get message content from template or custom message
   */
  private getMessageContent(
    templateId?: string,
    customMessage?: string,
    variables?: Record<string, any>
  ): { success: boolean; content?: string; error?: string; templateUsed?: string } {
    // Custom message takes precedence
    if (customMessage) {
      return { success: true, content: customMessage };
    }

    if (!templateId) {
      return { success: false, error: 'Either templateId or customMessage is required' };
    }

    // Get template
    const template = getTemplate(templateId);
    if (!template) {
      return { success: false, error: `Template not found: ${templateId}` };
    }

    // Validate variables
    const validation = validateTemplateVariables(template, variables || {});
    if (!validation.valid) {
      return {
        success: false,
        error: `Missing template variables: ${validation.missing.join(', ')}`,
      };
    }

    // Replace variables in template
    const content = replaceVariables(template.body, variables || {});

    return { success: true, content, templateUsed: templateId };
  }

  /**
   * Send test message to recipient
   */
  async sendTestMessage(request: TestMessageRequest): Promise<TestMessageResult> {
    const startTime = Date.now();

    try {
      // Validate request
      const validated = TestMessageSchema.parse(request);

      // Validate recipient format
      const recipientValidation = this.validateRecipient(validated.recipient, validated.recipientType);
      if (!recipientValidation.valid) {
        const result: TestMessageResult = {
          success: false,
          error: recipientValidation.error,
          recipient: validated.recipient,
          recipientType: validated.recipientType,
          messageContent: '',
          sentAt: new Date(),
        };
        await this.logTestSend(result, validated.testedBy, validated.templateId);
        return result;
      }

      // Get message content
      const messageResult = this.getMessageContent(
        validated.templateId,
        validated.customMessage,
        validated.variables
      );
      if (!messageResult.success) {
        const result: TestMessageResult = {
          success: false,
          error: messageResult.error,
          recipient: validated.recipient,
          recipientType: validated.recipientType,
          messageContent: '',
          sentAt: new Date(),
        };
        await this.logTestSend(result, validated.testedBy, validated.templateId);
        return result;
      }

      // Add test prefix to message
      const prefixedMessage = `${TestMessageSender.TEST_SEND_PREFIX} ${messageResult.content}`;

      // Send message based on type
      let sendResult: any;
      if (validated.recipientType === 'sms') {
        const formattedPhone = this.formatPhoneNumber(validated.recipient);
        sendResult = await messagingService.sendSMS({
          to: formattedPhone,
          body: prefixedMessage,
          metadata: {
            type: 'test_send',
            testedBy: validated.testedBy,
            templateId: validated.templateId,
            originalRecipient: validated.recipient,
            originalMessage: messageResult.content,
          },
        });
      } else {
        // For email, log success (in production would use email service)
        console.log('[TEST_SEND_EMAIL]', {
          timestamp: new Date().toISOString(),
          to: validated.recipient,
          message: prefixedMessage,
          testedBy: validated.testedBy,
          templateId: validated.templateId,
        });
        sendResult = {
          sid: `test_email_${Date.now()}`,
          status: 'sent',
          to: validated.recipient,
          from: 'test@luxemedspa.com',
          body: prefixedMessage,
          createdAt: new Date(),
        };
      }

      // Build result
      const result: TestMessageResult = {
        success: true,
        messageId: sendResult.sid,
        status: sendResult.status,
        recipient: validated.recipient,
        recipientType: validated.recipientType,
        templateUsed: validated.templateId,
        messageContent: messageResult.content || '',
        sentAt: new Date(),
      };

      // Log the test send
      await this.logTestSend(result, validated.testedBy, validated.templateId);

      // Log performance
      const duration = Date.now() - startTime;
      console.log('[TEST_SEND_COMPLETE]', {
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
        recipient: validated.recipient,
        type: validated.recipientType,
        templateId: validated.templateId,
        messageId: sendResult.sid,
      });

      return result;
    } catch (error: any) {
      const result: TestMessageResult = {
        success: false,
        error: error.message || 'Failed to send test message',
        recipient: request.recipient,
        recipientType: request.recipientType,
        messageContent: '',
        sentAt: new Date(),
      };

      await this.logTestSend(result, request.testedBy, request.templateId);

      console.error('[TEST_SEND_ERROR]', {
        timestamp: new Date().toISOString(),
        error: error.message,
        recipient: request.recipient,
        type: request.recipientType,
      });

      return result;
    }
  }

  /**
   * Log test send to in-memory store and console
   */
  private async logTestSend(
    result: TestMessageResult,
    testedBy: string,
    templateId?: string
  ): Promise<void> {
    const log: TestSendLog = {
      id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: result.sentAt,
      testedBy,
      recipient: result.recipient,
      recipientType: result.recipientType,
      templateId,
      messageContent: result.messageContent,
      status: result.success ? 'success' : 'failed',
      deliveryStatus: result.status,
      messageId: result.messageId,
      errorMessage: result.error,
    };

    // Add to in-memory logs
    testSendLogs.push(log);

    // Keep only last 1000 logs in memory
    if (testSendLogs.length > 1000) {
      testSendLogs.shift();
    }

    // Log to console for monitoring/debugging
    console.log('[TEST_SEND_LOG]', {
      ...log,
      timestamp: log.timestamp.toISOString(),
    });
  }

  /**
   * Get test send history
   */
  getTestSendHistory(options?: { limit?: number; testedBy?: string; recipientType?: TestRecipientType }) {
    let logs = [...testSendLogs];

    if (options?.testedBy) {
      logs = logs.filter((log) => log.testedBy === options.testedBy);
    }

    if (options?.recipientType) {
      logs = logs.filter((log) => log.recipientType === options.recipientType);
    }

    // Return most recent first, limited
    const limit = options?.limit || 50;
    return logs.reverse().slice(0, limit);
  }

  /**
   * Get test send statistics
   */
  getTestSendStats() {
    const total = testSendLogs.length;
    const successful = testSendLogs.filter((log) => log.status === 'success').length;
    const failed = testSendLogs.filter((log) => log.status === 'failed').length;

    const byType = {
      sms: testSendLogs.filter((log) => log.recipientType === 'sms').length,
      email: testSendLogs.filter((log) => log.recipientType === 'email').length,
    };

    const bySender = testSendLogs.reduce(
      (acc, log) => {
        acc[log.testedBy] = (acc[log.testedBy] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? ((successful / total) * 100).toFixed(1) + '%' : 'N/A',
      byType,
      bySender,
      lastUpdated: new Date(),
    };
  }

  /**
   * Clear test send logs (admin only)
   */
  clearTestSendLogs(): number {
    const cleared = testSendLogs.length;
    testSendLogs.length = 0;
    console.log('[TEST_SEND_CLEARED]', {
      timestamp: new Date().toISOString(),
      logsCleared: cleared,
    });
    return cleared;
  }
}

// Export singleton instance
export const testMessageSender = TestMessageSender.getInstance();
