/**
 * Expo Push Notification Service
 *
 * Handles push notifications for React Native apps using Expo's push service.
 *
 * HIPAA COMPLIANCE:
 * - NEVER include PHI (Protected Health Information) in notification body
 * - Use generic messages like "You have a new appointment" not "Your Botox at 2pm"
 * - Patient names and specific treatment details must never appear in notifications
 *
 * Expo Push API Reference: https://docs.expo.dev/push-notifications/sending-notifications/
 */

import { config } from '../config';

// ===================
// Types
// ===================

export interface ExpoPushMessage {
  /** Expo push token (starts with ExponentPushToken[ or ExpoPushToken[) */
  to: string;
  /** Title of the notification */
  title?: string;
  /** Body text of the notification */
  body: string;
  /** Custom data to include */
  data?: Record<string, unknown>;
  /** Time to live in seconds (max 2419200 = 28 days) */
  ttl?: number;
  /** Delivery priority: 'default', 'normal', or 'high' */
  priority?: 'default' | 'normal' | 'high';
  /** Subtitle (iOS only) */
  subtitle?: string;
  /** Sound to play ('default' or null) */
  sound?: 'default' | null;
  /** Badge number (iOS only) */
  badge?: number;
  /** Channel ID (Android only) */
  channelId?: string;
  /** Category ID for actionable notifications */
  categoryId?: string;
  /** Whether notification can be modified by client extensions */
  mutableContent?: boolean;
}

export interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string; // Receipt ID for successful sends
  message?: string;
  details?: {
    error?: 'DeviceNotRegistered' | 'InvalidCredentials' | 'MessageTooBig' | 'MessageRateExceeded' | string;
    fault?: 'developer' | 'expo';
  };
}

export interface ExpoPushReceipt {
  status: 'ok' | 'error';
  message?: string;
  details?: {
    error?: 'DeviceNotRegistered' | 'InvalidCredentials' | 'MessageTooBig' | 'MessageRateExceeded' | string;
    fault?: 'developer' | 'expo';
  };
}

export interface ExpoPushResult {
  success: boolean;
  ticketId?: string;
  error?: string;
  invalidToken?: boolean;
}

export interface ExpoBatchResult {
  successCount: number;
  failureCount: number;
  results: Array<{
    token: string;
    success: boolean;
    ticketId?: string;
    error?: string;
    invalidToken?: boolean;
  }>;
  invalidTokens: string[];
  ticketIds: string[];
}

export interface ExpoReceiptResult {
  receiptId: string;
  success: boolean;
  error?: string;
  invalidToken?: boolean;
}

// ===================
// Constants
// ===================

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_RECEIPTS_URL = 'https://exp.host/--/api/v2/push/getReceipts';
const MAX_BATCH_SIZE = 100;
const EXPO_TOKEN_REGEX = /^Expo(nent)?PushToken\[.+\]$/;

// ===================
// Audit Logging
// ===================

interface ExpoPushAuditLog {
  timestamp: Date;
  action: 'send' | 'batch_send' | 'check_receipts';
  tokenCount: number;
  success: boolean;
  successCount?: number;
  failureCount?: number;
  error?: string;
  notificationTitle?: string;
}

const auditLogs: ExpoPushAuditLog[] = [];
const MAX_AUDIT_LOGS = 1000;

function logExpoPushAudit(log: ExpoPushAuditLog): void {
  auditLogs.unshift(log);
  if (auditLogs.length > MAX_AUDIT_LOGS) {
    auditLogs.pop();
  }

  // Also log to console for monitoring
  const logLevel = log.success ? 'info' : 'error';
  console[logLevel](`Expo Push ${log.action}:`, {
    tokenCount: log.tokenCount,
    success: log.success,
    successCount: log.successCount,
    failureCount: log.failureCount,
    error: log.error,
  });
}

/**
 * Get recent Expo Push audit logs
 */
export function getExpoPushAuditLogs(limit: number = 100): ExpoPushAuditLog[] {
  return auditLogs.slice(0, limit);
}

// ===================
// Helper Functions
// ===================

/**
 * Validate Expo push token format
 */
export function isValidExpoToken(token: string): boolean {
  return EXPO_TOKEN_REGEX.test(token);
}

/**
 * Check if error indicates invalid/expired token
 */
function isInvalidTokenError(details?: ExpoPushTicket['details']): boolean {
  return details?.error === 'DeviceNotRegistered';
}

/**
 * Check if error indicates rate limiting
 */
function isRateLimitError(details?: ExpoPushTicket['details']): boolean {
  return details?.error === 'MessageRateExceeded';
}

/**
 * Delay utility for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build Expo push message with defaults
 */
function buildMessage(
  token: string,
  message: Omit<ExpoPushMessage, 'to'>
): ExpoPushMessage {
  return {
    to: token,
    title: message.title,
    body: message.body,
    data: message.data,
    sound: message.sound ?? 'default',
    priority: message.priority ?? 'high',
    ttl: message.ttl ?? 86400, // 24 hours default
    channelId: message.channelId ?? 'default',
    subtitle: message.subtitle,
    badge: message.badge,
    categoryId: message.categoryId,
    mutableContent: message.mutableContent,
  };
}

// ===================
// Expo Push Service Functions
// ===================

/**
 * Send a push notification to a single Expo device
 *
 * @param expoPushToken - Expo push token
 * @param message - Message content
 * @returns Result of the send operation
 */
export async function sendPushNotification(
  expoPushToken: string,
  message: Omit<ExpoPushMessage, 'to'>
): Promise<ExpoPushResult> {
  // Validate token format
  if (!isValidExpoToken(expoPushToken)) {
    return {
      success: false,
      error: 'Invalid Expo push token format',
      invalidToken: true,
    };
  }

  // Development mode - log and simulate
  if (config.nodeEnv === 'development') {
    console.log('=== Expo Push Send (Development Mode) ===');
    console.log(`Token: ${expoPushToken}`);
    console.log(`Title: ${message.title}`);
    console.log(`Body: ${message.body}`);
    console.log(`Data:`, message.data);
    console.log('==========================================');

    logExpoPushAudit({
      timestamp: new Date(),
      action: 'send',
      tokenCount: 1,
      success: true,
      successCount: 1,
      notificationTitle: message.title,
    });

    return {
      success: true,
      ticketId: `mock-ticket-${Date.now()}`,
    };
  }

  try {
    const pushMessage = buildMessage(expoPushToken, message);

    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pushMessage),
    });

    if (!response.ok) {
      throw new Error(`Expo API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as { data: ExpoPushTicket };
    const ticket = result.data;

    if (ticket.status === 'ok') {
      logExpoPushAudit({
        timestamp: new Date(),
        action: 'send',
        tokenCount: 1,
        success: true,
        successCount: 1,
        notificationTitle: message.title,
      });

      return {
        success: true,
        ticketId: ticket.id,
      };
    } else {
      const invalidToken = isInvalidTokenError(ticket.details);

      logExpoPushAudit({
        timestamp: new Date(),
        action: 'send',
        tokenCount: 1,
        success: false,
        failureCount: 1,
        error: ticket.message || ticket.details?.error,
        notificationTitle: message.title,
      });

      return {
        success: false,
        error: ticket.message || ticket.details?.error || 'Unknown error',
        invalidToken,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logExpoPushAudit({
      timestamp: new Date(),
      action: 'send',
      tokenCount: 1,
      success: false,
      failureCount: 1,
      error: errorMessage,
      notificationTitle: message.title,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send push notifications to multiple Expo devices
 *
 * Expo allows up to 100 messages per request.
 * This function handles batching automatically for larger lists.
 *
 * @param messages - Array of messages with tokens and content
 * @returns Batch result with success/failure counts
 */
export async function sendBatchNotifications(
  messages: ExpoPushMessage[]
): Promise<ExpoBatchResult> {
  if (messages.length === 0) {
    return {
      successCount: 0,
      failureCount: 0,
      results: [],
      invalidTokens: [],
      ticketIds: [],
    };
  }

  // Filter and validate tokens
  const validMessages: ExpoPushMessage[] = [];
  const invalidResults: ExpoBatchResult['results'] = [];

  for (const msg of messages) {
    if (!isValidExpoToken(msg.to)) {
      invalidResults.push({
        token: msg.to,
        success: false,
        error: 'Invalid Expo push token format',
        invalidToken: true,
      });
    } else {
      validMessages.push({
        ...msg,
        sound: msg.sound ?? 'default',
        priority: msg.priority ?? 'high',
        ttl: msg.ttl ?? 86400,
        channelId: msg.channelId ?? 'default',
      });
    }
  }

  // Development mode - log and simulate
  if (config.nodeEnv === 'development') {
    console.log('=== Expo Push Batch Send (Development Mode) ===');
    console.log(`Valid message count: ${validMessages.length}`);
    console.log(`Invalid token count: ${invalidResults.length}`);
    console.log('================================================');

    const mockResults = validMessages.map((msg, index) => ({
      token: msg.to,
      success: true,
      ticketId: `mock-batch-ticket-${Date.now()}-${index}`,
    }));

    logExpoPushAudit({
      timestamp: new Date(),
      action: 'batch_send',
      tokenCount: messages.length,
      success: true,
      successCount: validMessages.length,
      failureCount: invalidResults.length,
    });

    return {
      successCount: validMessages.length,
      failureCount: invalidResults.length,
      results: [...mockResults, ...invalidResults],
      invalidTokens: invalidResults.map((r) => r.token),
      ticketIds: mockResults.map((r) => r.ticketId!),
    };
  }

  // Batch messages into chunks of 100
  const batches: ExpoPushMessage[][] = [];
  for (let i = 0; i < validMessages.length; i += MAX_BATCH_SIZE) {
    batches.push(validMessages.slice(i, i + MAX_BATCH_SIZE));
  }

  const allResults: ExpoBatchResult['results'] = [...invalidResults];
  const allTicketIds: string[] = [];
  const allInvalidTokens: string[] = invalidResults.map((r) => r.token);
  let totalSuccess = 0;
  let totalFailure = invalidResults.length;

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];

    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        // Handle rate limiting
        if (response.status === 429) {
          console.warn('Expo Push rate limit hit, waiting 1 second...');
          await delay(1000);
          batchIndex--; // Retry this batch
          continue;
        }
        throw new Error(`Expo API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json() as { data: ExpoPushTicket[] };
      const tickets = result.data;

      tickets.forEach((ticket, index) => {
        const token = batch[index].to;

        if (ticket.status === 'ok') {
          allResults.push({
            token,
            success: true,
            ticketId: ticket.id,
          });
          if (ticket.id) {
            allTicketIds.push(ticket.id);
          }
          totalSuccess++;
        } else {
          const invalidToken = isInvalidTokenError(ticket.details);
          if (invalidToken) {
            allInvalidTokens.push(token);
          }

          allResults.push({
            token,
            success: false,
            error: ticket.message || ticket.details?.error || 'Unknown error',
            invalidToken,
          });
          totalFailure++;
        }
      });

      // Add small delay between batches to avoid rate limiting
      if (batchIndex < batches.length - 1) {
        await delay(100);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Mark all messages in this batch as failed
      for (const msg of batch) {
        allResults.push({
          token: msg.to,
          success: false,
          error: errorMessage,
        });
        totalFailure++;
      }
    }
  }

  logExpoPushAudit({
    timestamp: new Date(),
    action: 'batch_send',
    tokenCount: messages.length,
    success: totalSuccess > 0,
    successCount: totalSuccess,
    failureCount: totalFailure,
  });

  return {
    successCount: totalSuccess,
    failureCount: totalFailure,
    results: allResults,
    invalidTokens: allInvalidTokens,
    ticketIds: allTicketIds,
  };
}

/**
 * Check receipts for previously sent notifications
 *
 * Use this to verify delivery status after sending notifications.
 * Expo recommends checking receipts about 15 minutes after sending.
 *
 * @param ticketIds - Array of ticket IDs from send operations
 * @returns Receipt results for each ticket
 */
export async function checkReceipts(
  ticketIds: string[]
): Promise<ExpoReceiptResult[]> {
  if (ticketIds.length === 0) {
    return [];
  }

  // Development mode - log and simulate
  if (config.nodeEnv === 'development') {
    console.log('=== Expo Push Check Receipts (Development Mode) ===');
    console.log(`Ticket count: ${ticketIds.length}`);
    console.log('====================================================');

    logExpoPushAudit({
      timestamp: new Date(),
      action: 'check_receipts',
      tokenCount: ticketIds.length,
      success: true,
      successCount: ticketIds.length,
    });

    return ticketIds.map((id) => ({
      receiptId: id,
      success: true,
    }));
  }

  try {
    const response = await fetch(EXPO_RECEIPTS_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: ticketIds }),
    });

    if (!response.ok) {
      throw new Error(`Expo API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as { data: Record<string, ExpoPushReceipt> };
    const receipts = result.data;

    const results: ExpoReceiptResult[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const ticketId of ticketIds) {
      const receipt = receipts[ticketId];

      if (!receipt) {
        results.push({
          receiptId: ticketId,
          success: false,
          error: 'Receipt not found',
        });
        failureCount++;
        continue;
      }

      if (receipt.status === 'ok') {
        results.push({
          receiptId: ticketId,
          success: true,
        });
        successCount++;
      } else {
        const invalidToken = isInvalidTokenError(receipt.details);

        results.push({
          receiptId: ticketId,
          success: false,
          error: receipt.message || receipt.details?.error || 'Unknown error',
          invalidToken,
        });
        failureCount++;
      }
    }

    logExpoPushAudit({
      timestamp: new Date(),
      action: 'check_receipts',
      tokenCount: ticketIds.length,
      success: successCount > 0,
      successCount,
      failureCount,
    });

    return results;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logExpoPushAudit({
      timestamp: new Date(),
      action: 'check_receipts',
      tokenCount: ticketIds.length,
      success: false,
      failureCount: ticketIds.length,
      error: errorMessage,
    });

    return ticketIds.map((id) => ({
      receiptId: id,
      success: false,
      error: errorMessage,
    }));
  }
}

/**
 * Send simple notification helper
 *
 * Convenience function for common notification patterns
 */
export async function sendSimpleNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<ExpoPushResult> {
  return sendPushNotification(token, { title, body, data });
}

// ===================
// HIPAA-Compliant Message Helpers
// ===================

/**
 * HIPAA-compliant notification messages
 * These are safe to display on lock screens
 */
export const SafeNotifications = {
  // Appointment notifications
  APPOINTMENT_REMINDER: {
    title: 'Appointment Reminder',
    body: 'You have an upcoming appointment. Open the app for details.',
  },
  APPOINTMENT_CONFIRMED: {
    title: 'Appointment Confirmed',
    body: 'Your appointment has been confirmed.',
  },
  APPOINTMENT_CANCELLED: {
    title: 'Appointment Update',
    body: 'There has been a change to your appointment. Please check the app.',
  },
  APPOINTMENT_RESCHEDULED: {
    title: 'Appointment Rescheduled',
    body: 'Your appointment has been rescheduled. Open the app for details.',
  },

  // Check-in notifications
  CHECK_IN_AVAILABLE: {
    title: 'Check-in Available',
    body: 'You can now check in for your appointment.',
  },

  // Message notifications
  NEW_MESSAGE: {
    title: 'New Message',
    body: 'You have a new message. Open the app to read it.',
  },

  // Form notifications
  FORMS_REQUIRED: {
    title: 'Forms Required',
    body: 'Please complete your required forms before your appointment.',
  },
  FORMS_APPROVED: {
    title: 'Forms Approved',
    body: 'Your submitted forms have been approved.',
  },

  // Payment notifications
  PAYMENT_RECEIVED: {
    title: 'Payment Received',
    body: 'Your payment has been processed.',
  },
  PAYMENT_REMINDER: {
    title: 'Payment Reminder',
    body: 'You have an outstanding balance. Open the app for details.',
  },

  // Waitlist notifications
  WAITLIST_SPOT_AVAILABLE: {
    title: 'Spot Available',
    body: 'An appointment slot is now available. Open the app to book.',
  },

  // General notifications
  ACCOUNT_UPDATE: {
    title: 'Account Update',
    body: 'There has been an update to your account.',
  },
};

export default {
  sendPushNotification,
  sendBatchNotifications,
  checkReceipts,
  sendSimpleNotification,
  isValidExpoToken,
  getExpoPushAuditLogs,
  SafeNotifications,
};
