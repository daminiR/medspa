/**
 * Firebase Cloud Messaging (FCM) Service
 *
 * Handles push notifications for Android and iOS devices via FCM.
 *
 * HIPAA COMPLIANCE:
 * - NEVER include PHI (Protected Health Information) in notification body
 * - Use generic messages like "You have a new appointment" not "Your Botox at 2pm"
 * - Patient names and specific treatment details must never appear in notifications
 */

import * as admin from 'firebase-admin';
import { config } from '../config';

// ===================
// Types
// ===================

export interface FCMNotification {
  title: string;
  body: string;
  imageUrl?: string;
  icon?: string;
}

export interface FCMData {
  [key: string]: string;
}

export interface FCMSendOptions {
  /** Notification display payload */
  notification?: FCMNotification;
  /** Custom data payload */
  data?: FCMData;
  /** Android-specific options */
  android?: admin.messaging.AndroidConfig;
  /** iOS-specific options */
  apns?: admin.messaging.ApnsConfig;
  /** Web push options */
  webpush?: admin.messaging.WebpushConfig;
  /** Time to live in seconds (default: 24 hours) */
  ttl?: number;
  /** Priority: 'high' for time-sensitive, 'normal' for regular */
  priority?: 'high' | 'normal';
}

export interface FCMSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  invalidToken?: boolean;
}

export interface FCMBatchResult {
  successCount: number;
  failureCount: number;
  results: Array<{
    token: string;
    success: boolean;
    messageId?: string;
    error?: string;
    invalidToken?: boolean;
  }>;
  invalidTokens: string[];
}

export interface FCMTopicResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface FCMSubscriptionResult {
  successCount: number;
  failureCount: number;
  errors: Array<{
    token: string;
    error: string;
  }>;
}

// ===================
// FCM Client Initialization
// ===================

let fcmInitialized = false;

function initializeFCM(): boolean {
  if (fcmInitialized) {
    return true;
  }

  // Check if Firebase Admin is already initialized
  if (admin.apps.length > 0) {
    fcmInitialized = true;
    return true;
  }

  // Initialize with service account if credentials are provided
  if (config.firebaseClientEmail && config.firebasePrivateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: config.firebaseProjectId,
          clientEmail: config.firebaseClientEmail,
          privateKey: config.firebasePrivateKey,
        }),
      });
      fcmInitialized = true;
      console.log('Firebase Admin SDK initialized for FCM');
      return true;
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
      return false;
    }
  }

  // Development mode - use application default credentials or skip
  if (config.nodeEnv === 'development') {
    console.log('FCM running in development mode without credentials');
    return false;
  }

  console.warn('FCM credentials not configured');
  return false;
}

// ===================
// Audit Logging
// ===================

interface FCMAuditLog {
  timestamp: Date;
  action: 'send_to_device' | 'send_to_multiple' | 'send_to_topic' | 'subscribe' | 'unsubscribe';
  targetType: 'device' | 'devices' | 'topic';
  target: string;
  success: boolean;
  messageId?: string;
  error?: string;
  notificationTitle?: string;
  tokenCount?: number;
}

const auditLogs: FCMAuditLog[] = [];
const MAX_AUDIT_LOGS = 1000;

function logFCMAudit(log: FCMAuditLog): void {
  auditLogs.unshift(log);
  if (auditLogs.length > MAX_AUDIT_LOGS) {
    auditLogs.pop();
  }

  // Also log to console for monitoring
  const logLevel = log.success ? 'info' : 'error';
  console[logLevel](`FCM ${log.action}:`, {
    target: log.target,
    success: log.success,
    messageId: log.messageId,
    error: log.error,
  });
}

/**
 * Get recent FCM audit logs
 */
export function getFCMAuditLogs(limit: number = 100): FCMAuditLog[] {
  return auditLogs.slice(0, limit);
}

// ===================
// Helper Types
// ===================

interface FCMMessagePayload {
  notification?: admin.messaging.Notification;
  data?: FCMData;
  android?: admin.messaging.AndroidConfig;
  apns?: admin.messaging.ApnsConfig;
  webpush?: admin.messaging.WebpushConfig;
}

// ===================
// Helper Functions
// ===================

/**
 * Build FCM message options with defaults
 */
function buildMessageOptions(options: FCMSendOptions): FCMMessagePayload {
  const ttl = options.ttl ?? 86400; // Default 24 hours

  const message: FCMMessagePayload = {};

  if (options.notification) {
    message.notification = {
      title: options.notification.title,
      body: options.notification.body,
      imageUrl: options.notification.imageUrl,
    };
  }

  if (options.data) {
    message.data = options.data;
  }

  // Android configuration
  message.android = options.android ?? {
    priority: options.priority === 'high' ? 'high' : 'normal',
    ttl: ttl * 1000, // Convert to milliseconds
    notification: options.notification ? {
      icon: options.notification.icon ?? 'ic_notification',
      color: '#7C3AED', // Brand purple
      channelId: 'default',
    } : undefined,
  };

  // iOS (APNS) configuration
  message.apns = options.apns ?? {
    headers: {
      'apns-priority': options.priority === 'high' ? '10' : '5',
      'apns-expiration': String(Math.floor(Date.now() / 1000) + ttl),
    },
    payload: {
      aps: {
        alert: options.notification ? {
          title: options.notification.title,
          body: options.notification.body,
        } : undefined,
        sound: 'default',
        badge: 1,
      },
    },
  };

  // Web push configuration
  message.webpush = options.webpush ?? {
    headers: {
      TTL: String(ttl),
    },
    notification: options.notification ? {
      icon: '/icon-192.png',
      badge: '/badge-72.png',
    } : undefined,
  };

  return message;
}

/**
 * Parse FCM error to determine if token is invalid
 */
function isInvalidTokenError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    const fcmError = error as { code: string };
    const invalidCodes = [
      'messaging/invalid-registration-token',
      'messaging/registration-token-not-registered',
      'messaging/invalid-argument',
    ];
    return invalidCodes.includes(fcmError.code);
  }
  return false;
}

// ===================
// FCM Service Functions
// ===================

/**
 * Send a push notification to a single device
 *
 * @param token - FCM device token
 * @param options - Notification and data payload options
 * @returns Result of the send operation
 */
export async function sendToDevice(
  token: string,
  options: FCMSendOptions
): Promise<FCMSendResult> {
  // Development mode - log and simulate
  if (!initializeFCM()) {
    console.log('=== FCM Send (Development Mode) ===');
    console.log(`Token: ${token.substring(0, 20)}...`);
    console.log(`Notification:`, options.notification);
    console.log(`Data:`, options.data);
    console.log('===================================');

    logFCMAudit({
      timestamp: new Date(),
      action: 'send_to_device',
      targetType: 'device',
      target: token.substring(0, 20) + '...',
      success: true,
      messageId: `mock-${Date.now()}`,
      notificationTitle: options.notification?.title,
    });

    return {
      success: true,
      messageId: `mock-${Date.now()}`,
    };
  }

  try {
    const message: admin.messaging.Message = {
      ...buildMessageOptions(options),
      token,
    };

    const messageId = await admin.messaging().send(message);

    logFCMAudit({
      timestamp: new Date(),
      action: 'send_to_device',
      targetType: 'device',
      target: token.substring(0, 20) + '...',
      success: true,
      messageId,
      notificationTitle: options.notification?.title,
    });

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    const invalidToken = isInvalidTokenError(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logFCMAudit({
      timestamp: new Date(),
      action: 'send_to_device',
      targetType: 'device',
      target: token.substring(0, 20) + '...',
      success: false,
      error: errorMessage,
      notificationTitle: options.notification?.title,
    });

    return {
      success: false,
      error: errorMessage,
      invalidToken,
    };
  }
}

/**
 * Send a push notification to multiple devices (max 500)
 *
 * FCM allows up to 500 tokens per batch request.
 * For larger lists, call this function multiple times.
 *
 * @param tokens - Array of FCM device tokens (max 500)
 * @param options - Notification and data payload options
 * @returns Batch result with success/failure counts
 */
export async function sendToMultipleDevices(
  tokens: string[],
  options: FCMSendOptions
): Promise<FCMBatchResult> {
  if (tokens.length === 0) {
    return {
      successCount: 0,
      failureCount: 0,
      results: [],
      invalidTokens: [],
    };
  }

  if (tokens.length > 500) {
    console.warn(`FCM batch size ${tokens.length} exceeds maximum of 500. Truncating.`);
    tokens = tokens.slice(0, 500);
  }

  // Development mode - log and simulate
  if (!initializeFCM()) {
    console.log('=== FCM Batch Send (Development Mode) ===');
    console.log(`Token count: ${tokens.length}`);
    console.log(`Notification:`, options.notification);
    console.log(`Data:`, options.data);
    console.log('==========================================');

    const results = tokens.map((token, index) => ({
      token,
      success: true,
      messageId: `mock-batch-${Date.now()}-${index}`,
    }));

    logFCMAudit({
      timestamp: new Date(),
      action: 'send_to_multiple',
      targetType: 'devices',
      target: `${tokens.length} devices`,
      success: true,
      tokenCount: tokens.length,
      notificationTitle: options.notification?.title,
    });

    return {
      successCount: tokens.length,
      failureCount: 0,
      results,
      invalidTokens: [],
    };
  }

  try {
    const message = buildMessageOptions(options);

    const messages: admin.messaging.Message[] = tokens.map((token) => ({
      ...message,
      token,
    }));

    const response = await admin.messaging().sendEach(messages);

    const results: FCMBatchResult['results'] = [];
    const invalidTokens: string[] = [];

    response.responses.forEach((resp, index) => {
      const token = tokens[index];

      if (resp.success) {
        results.push({
          token,
          success: true,
          messageId: resp.messageId,
        });
      } else {
        const invalidToken = isInvalidTokenError(resp.error);
        if (invalidToken) {
          invalidTokens.push(token);
        }

        results.push({
          token,
          success: false,
          error: resp.error?.message,
          invalidToken,
        });
      }
    });

    logFCMAudit({
      timestamp: new Date(),
      action: 'send_to_multiple',
      targetType: 'devices',
      target: `${tokens.length} devices`,
      success: response.successCount > 0,
      tokenCount: tokens.length,
      notificationTitle: options.notification?.title,
    });

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      results,
      invalidTokens,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logFCMAudit({
      timestamp: new Date(),
      action: 'send_to_multiple',
      targetType: 'devices',
      target: `${tokens.length} devices`,
      success: false,
      error: errorMessage,
      tokenCount: tokens.length,
      notificationTitle: options.notification?.title,
    });

    // Return all as failures
    return {
      successCount: 0,
      failureCount: tokens.length,
      results: tokens.map((token) => ({
        token,
        success: false,
        error: errorMessage,
      })),
      invalidTokens: [],
    };
  }
}

/**
 * Send a push notification to all devices subscribed to a topic
 *
 * Topics are useful for:
 * - Broadcast announcements (e.g., "clinic_announcements")
 * - Staff notifications (e.g., "staff_alerts")
 * - Location-specific updates (e.g., "location_123_updates")
 *
 * @param topic - Topic name (without /topics/ prefix)
 * @param options - Notification and data payload options
 * @returns Result of the send operation
 */
export async function sendToTopic(
  topic: string,
  options: FCMSendOptions
): Promise<FCMTopicResult> {
  // Validate topic name
  const topicRegex = /^[a-zA-Z0-9-_.~%]+$/;
  if (!topicRegex.test(topic)) {
    return {
      success: false,
      error: 'Invalid topic name. Use only alphanumeric characters, hyphens, underscores, periods, and tildes.',
    };
  }

  // Development mode - log and simulate
  if (!initializeFCM()) {
    console.log('=== FCM Topic Send (Development Mode) ===');
    console.log(`Topic: ${topic}`);
    console.log(`Notification:`, options.notification);
    console.log(`Data:`, options.data);
    console.log('==========================================');

    logFCMAudit({
      timestamp: new Date(),
      action: 'send_to_topic',
      targetType: 'topic',
      target: topic,
      success: true,
      messageId: `mock-topic-${Date.now()}`,
      notificationTitle: options.notification?.title,
    });

    return {
      success: true,
      messageId: `mock-topic-${Date.now()}`,
    };
  }

  try {
    const message: admin.messaging.Message = {
      ...buildMessageOptions(options),
      topic,
    };

    const messageId = await admin.messaging().send(message);

    logFCMAudit({
      timestamp: new Date(),
      action: 'send_to_topic',
      targetType: 'topic',
      target: topic,
      success: true,
      messageId,
      notificationTitle: options.notification?.title,
    });

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logFCMAudit({
      timestamp: new Date(),
      action: 'send_to_topic',
      targetType: 'topic',
      target: topic,
      success: false,
      error: errorMessage,
      notificationTitle: options.notification?.title,
    });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Subscribe devices to a topic
 *
 * @param tokens - Array of FCM device tokens
 * @param topic - Topic name to subscribe to
 * @returns Subscription result
 */
export async function subscribeToTopic(
  tokens: string[],
  topic: string
): Promise<FCMSubscriptionResult> {
  if (tokens.length === 0) {
    return {
      successCount: 0,
      failureCount: 0,
      errors: [],
    };
  }

  // Validate topic name
  const topicRegex = /^[a-zA-Z0-9-_.~%]+$/;
  if (!topicRegex.test(topic)) {
    return {
      successCount: 0,
      failureCount: tokens.length,
      errors: tokens.map((token) => ({
        token,
        error: 'Invalid topic name',
      })),
    };
  }

  // Development mode - log and simulate
  if (!initializeFCM()) {
    console.log('=== FCM Topic Subscribe (Development Mode) ===');
    console.log(`Topic: ${topic}`);
    console.log(`Token count: ${tokens.length}`);
    console.log('===============================================');

    logFCMAudit({
      timestamp: new Date(),
      action: 'subscribe',
      targetType: 'topic',
      target: topic,
      success: true,
      tokenCount: tokens.length,
    });

    return {
      successCount: tokens.length,
      failureCount: 0,
      errors: [],
    };
  }

  try {
    const response = await admin.messaging().subscribeToTopic(tokens, topic);

    const errors: FCMSubscriptionResult['errors'] = [];
    if (response.errors) {
      response.errors.forEach((err) => {
        errors.push({
          token: tokens[err.index],
          error: err.error.message,
        });
      });
    }

    logFCMAudit({
      timestamp: new Date(),
      action: 'subscribe',
      targetType: 'topic',
      target: topic,
      success: response.successCount > 0,
      tokenCount: tokens.length,
    });

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logFCMAudit({
      timestamp: new Date(),
      action: 'subscribe',
      targetType: 'topic',
      target: topic,
      success: false,
      error: errorMessage,
      tokenCount: tokens.length,
    });

    return {
      successCount: 0,
      failureCount: tokens.length,
      errors: tokens.map((token) => ({
        token,
        error: errorMessage,
      })),
    };
  }
}

/**
 * Unsubscribe devices from a topic
 *
 * @param tokens - Array of FCM device tokens
 * @param topic - Topic name to unsubscribe from
 * @returns Subscription result
 */
export async function unsubscribeFromTopic(
  tokens: string[],
  topic: string
): Promise<FCMSubscriptionResult> {
  if (tokens.length === 0) {
    return {
      successCount: 0,
      failureCount: 0,
      errors: [],
    };
  }

  // Validate topic name
  const topicRegex = /^[a-zA-Z0-9-_.~%]+$/;
  if (!topicRegex.test(topic)) {
    return {
      successCount: 0,
      failureCount: tokens.length,
      errors: tokens.map((token) => ({
        token,
        error: 'Invalid topic name',
      })),
    };
  }

  // Development mode - log and simulate
  if (!initializeFCM()) {
    console.log('=== FCM Topic Unsubscribe (Development Mode) ===');
    console.log(`Topic: ${topic}`);
    console.log(`Token count: ${tokens.length}`);
    console.log('=================================================');

    logFCMAudit({
      timestamp: new Date(),
      action: 'unsubscribe',
      targetType: 'topic',
      target: topic,
      success: true,
      tokenCount: tokens.length,
    });

    return {
      successCount: tokens.length,
      failureCount: 0,
      errors: [],
    };
  }

  try {
    const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);

    const errors: FCMSubscriptionResult['errors'] = [];
    if (response.errors) {
      response.errors.forEach((err) => {
        errors.push({
          token: tokens[err.index],
          error: err.error.message,
        });
      });
    }

    logFCMAudit({
      timestamp: new Date(),
      action: 'unsubscribe',
      targetType: 'topic',
      target: topic,
      success: response.successCount > 0,
      tokenCount: tokens.length,
    });

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      errors,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logFCMAudit({
      timestamp: new Date(),
      action: 'unsubscribe',
      targetType: 'topic',
      target: topic,
      success: false,
      error: errorMessage,
      tokenCount: tokens.length,
    });

    return {
      successCount: 0,
      failureCount: tokens.length,
      errors: tokens.map((token) => ({
        token,
        error: errorMessage,
      })),
    };
  }
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

  // General notifications
  ACCOUNT_UPDATE: {
    title: 'Account Update',
    body: 'There has been an update to your account.',
  },

  // Staff notifications (for admin app)
  STAFF_ALERT: {
    title: 'Staff Alert',
    body: 'You have a new alert. Open the app for details.',
  },
  PATIENT_ARRIVED: {
    title: 'Patient Arrived',
    body: 'A patient has checked in.',
  },
  TREATMENT_COMPLETE: {
    title: 'Treatment Complete',
    body: 'A treatment has been completed.',
  },
};

export default {
  sendToDevice,
  sendToMultipleDevices,
  sendToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
  getFCMAuditLogs,
  SafeNotifications,
};
