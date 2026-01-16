/**
 * Unified Push Notification Service
 *
 * Wrapper service that routes notifications to the appropriate platform-specific
 * service (FCM for Android/Web, Expo Push for React Native apps).
 *
 * This service handles:
 * - Platform detection and routing
 * - User device token lookup
 * - Respecting user notification preferences
 * - Quiet hours enforcement
 * - Bulk notification sending
 *
 * HIPAA COMPLIANCE:
 * - NEVER include PHI (Protected Health Information) in notification body
 * - Use generic messages like "You have a new appointment" not "Your Botox at 2pm"
 * - Patient names and specific treatment details must never appear in notifications
 */

import { prisma } from '../lib/prisma';
import * as fcmService from './fcm';
import * as expoService from './expo-push';
import { config } from '../config';

// ===================
// Types
// ===================

export type DevicePlatform = 'ios' | 'android' | 'web' | 'expo';

export interface DeviceToken {
  id: string;
  userId: string;
  platform: DevicePlatform;
  token: string;
  deviceInfo?: {
    name?: string;
    model?: string;
    osVersion?: string;
  };
  isActive: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm format
  quietHoursEnd: string; // HH:mm format
  timezone: string;
  categories: {
    appointments: boolean;
    messages: boolean;
    marketing: boolean;
    billing: boolean;
    forms: boolean;
  };
}

export interface PushNotification {
  title: string;
  body: string;
  /** Category for filtering by user preferences */
  category?: 'appointments' | 'messages' | 'marketing' | 'billing' | 'forms' | 'system';
  /** Custom data payload */
  data?: Record<string, unknown>;
  /** Priority: 'high' for time-sensitive, 'normal' for regular */
  priority?: 'high' | 'normal';
  /** Override quiet hours for urgent notifications */
  bypassQuietHours?: boolean;
}

export interface SendNotificationResult {
  success: boolean;
  devicesSent: number;
  devicesSuccess: number;
  devicesFailed: number;
  invalidTokens: string[];
  error?: string;
}

export interface BulkNotificationResult {
  totalUsers: number;
  usersNotified: number;
  usersSkipped: number;
  devicesSent: number;
  devicesSuccess: number;
  devicesFailed: number;
  invalidTokens: string[];
  errors: Array<{
    userId: string;
    error: string;
  }>;
}

// ===================
// In-Memory Device Token Storage (for development)
// In production, this would be replaced with database queries
// ===================

const deviceTokenStore = new Map<string, DeviceToken[]>();
const preferencesStore = new Map<string, NotificationPreferences>();

// Default notification preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  timezone: 'America/New_York',
  categories: {
    appointments: true,
    messages: true,
    marketing: false,
    billing: true,
    forms: true,
  },
};

// ===================
// Helper Functions
// ===================

/**
 * Check if current time is within quiet hours
 */
function isQuietHours(preferences: NotificationPreferences): boolean {
  if (!preferences.quietHoursEnabled) {
    return false;
  }

  try {
    const now = new Date();

    // Parse quiet hours
    const [startHour, startMin] = preferences.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = preferences.quietHoursEnd.split(':').map(Number);

    // Get current time in user's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: preferences.timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const currentHour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const currentMin = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);

    const currentMinutes = currentHour * 60 + currentMin;
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 - 08:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }

    // Normal case (e.g., 12:00 - 14:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } catch (error) {
    console.error('Error checking quiet hours:', error);
    return false;
  }
}

/**
 * Check if notification category is enabled for user
 */
function isCategoryEnabled(
  preferences: NotificationPreferences,
  category?: PushNotification['category']
): boolean {
  if (!category || category === 'system') {
    return true; // System notifications always allowed
  }

  return preferences.categories[category] ?? true;
}

/**
 * Determine platform from token format
 */
function detectPlatform(token: string): DevicePlatform {
  if (expoService.isValidExpoToken(token)) {
    return 'expo';
  }
  // FCM tokens are typically long alphanumeric strings
  // This is a simple heuristic; in practice, you'd store the platform with the token
  return 'android'; // Default to FCM/Android
}

// ===================
// Device Token Management
// ===================

/**
 * Register a device token for a user
 */
export async function registerDeviceToken(
  userId: string,
  token: string,
  platform: DevicePlatform,
  deviceInfo?: DeviceToken['deviceInfo']
): Promise<DeviceToken> {
  const deviceToken: DeviceToken = {
    id: `dt-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    userId,
    platform,
    token,
    deviceInfo,
    isActive: true,
    createdAt: new Date(),
    lastUsedAt: new Date(),
  };

  // In development, use in-memory store
  if (config.nodeEnv === 'development') {
    const userTokens = deviceTokenStore.get(userId) || [];

    // Remove existing token if present (to update)
    const existingIndex = userTokens.findIndex((t) => t.token === token);
    if (existingIndex >= 0) {
      userTokens.splice(existingIndex, 1);
    }

    userTokens.push(deviceToken);
    deviceTokenStore.set(userId, userTokens);

    console.log(`Registered device token for user ${userId} (${platform})`);
    return deviceToken;
  }

  // In production, store in database
  // Note: You would need to add a DeviceToken model to your Prisma schema
  // For now, we'll use the in-memory store as a fallback
  const userTokens = deviceTokenStore.get(userId) || [];
  const existingIndex = userTokens.findIndex((t) => t.token === token);
  if (existingIndex >= 0) {
    userTokens.splice(existingIndex, 1);
  }
  userTokens.push(deviceToken);
  deviceTokenStore.set(userId, userTokens);

  return deviceToken;
}

/**
 * Unregister a device token
 */
export async function unregisterDeviceToken(
  userId: string,
  token: string
): Promise<boolean> {
  const userTokens = deviceTokenStore.get(userId) || [];
  const index = userTokens.findIndex((t) => t.token === token);

  if (index >= 0) {
    userTokens.splice(index, 1);
    deviceTokenStore.set(userId, userTokens);
    console.log(`Unregistered device token for user ${userId}`);
    return true;
  }

  return false;
}

/**
 * Get all active device tokens for a user
 */
export async function getUserDeviceTokens(userId: string): Promise<DeviceToken[]> {
  const tokens = deviceTokenStore.get(userId) || [];
  return tokens.filter((t) => t.isActive);
}

/**
 * Mark tokens as invalid (for cleanup after push failures)
 */
export async function markTokensInvalid(tokens: string[]): Promise<void> {
  const entries = Array.from(deviceTokenStore.entries());
  for (const [userId, userTokens] of entries) {
    let modified = false;
    for (const token of userTokens) {
      if (tokens.includes(token.token)) {
        token.isActive = false;
        modified = true;
        console.log(`Marked token as invalid for user ${userId}`);
      }
    }
    if (modified) {
      deviceTokenStore.set(userId, userTokens);
    }
  }
}

// ===================
// Notification Preferences Management
// ===================

/**
 * Get user notification preferences
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  // In development, use in-memory store
  const stored = preferencesStore.get(userId);
  if (stored) {
    return stored;
  }

  // Return defaults
  return { ...DEFAULT_PREFERENCES };
}

/**
 * Update user notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const current = await getNotificationPreferences(userId);
  const updated = {
    ...current,
    ...preferences,
    categories: {
      ...current.categories,
      ...preferences.categories,
    },
  };

  preferencesStore.set(userId, updated);
  return updated;
}

// ===================
// Notification Sending
// ===================

/**
 * Send a push notification to a single user
 *
 * This function:
 * 1. Looks up the user's device tokens
 * 2. Checks notification preferences
 * 3. Respects quiet hours (unless bypassed)
 * 4. Routes to the appropriate service based on platform
 *
 * @param userId - User ID to send notification to
 * @param notification - Notification content
 * @returns Result of the send operation
 */
export async function sendNotification(
  userId: string,
  notification: PushNotification
): Promise<SendNotificationResult> {
  try {
    // Get user's device tokens
    const tokens = await getUserDeviceTokens(userId);

    if (tokens.length === 0) {
      return {
        success: false,
        devicesSent: 0,
        devicesSuccess: 0,
        devicesFailed: 0,
        invalidTokens: [],
        error: 'No registered device tokens',
      };
    }

    // Get user preferences
    const preferences = await getNotificationPreferences(userId);

    // Check if push notifications are enabled
    if (!preferences.pushEnabled) {
      return {
        success: false,
        devicesSent: 0,
        devicesSuccess: 0,
        devicesFailed: 0,
        invalidTokens: [],
        error: 'Push notifications disabled by user',
      };
    }

    // Check category preference
    if (!isCategoryEnabled(preferences, notification.category)) {
      return {
        success: false,
        devicesSent: 0,
        devicesSuccess: 0,
        devicesFailed: 0,
        invalidTokens: [],
        error: `Notification category "${notification.category}" disabled by user`,
      };
    }

    // Check quiet hours
    if (!notification.bypassQuietHours && isQuietHours(preferences)) {
      return {
        success: false,
        devicesSent: 0,
        devicesSuccess: 0,
        devicesFailed: 0,
        invalidTokens: [],
        error: 'Quiet hours active',
      };
    }

    // Group tokens by platform
    const expoTokens: string[] = [];
    const fcmTokens: string[] = [];

    for (const token of tokens) {
      if (token.platform === 'expo') {
        expoTokens.push(token.token);
      } else {
        fcmTokens.push(token.token);
      }
    }

    let successCount = 0;
    let failureCount = 0;
    const invalidTokens: string[] = [];

    // Send to Expo devices
    if (expoTokens.length > 0) {
      const expoMessages = expoTokens.map((token) => ({
        to: token,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        priority: notification.priority === 'high' ? 'high' as const : 'normal' as const,
      }));

      const expoResult = await expoService.sendBatchNotifications(expoMessages);
      successCount += expoResult.successCount;
      failureCount += expoResult.failureCount;
      invalidTokens.push(...expoResult.invalidTokens);
    }

    // Send to FCM devices
    if (fcmTokens.length > 0) {
      const fcmResult = await fcmService.sendToMultipleDevices(fcmTokens, {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: notification.data as Record<string, string>,
        priority: notification.priority,
      });

      successCount += fcmResult.successCount;
      failureCount += fcmResult.failureCount;
      invalidTokens.push(...fcmResult.invalidTokens);
    }

    // Mark invalid tokens
    if (invalidTokens.length > 0) {
      await markTokensInvalid(invalidTokens);
    }

    return {
      success: successCount > 0,
      devicesSent: tokens.length,
      devicesSuccess: successCount,
      devicesFailed: failureCount,
      invalidTokens,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error sending notification:', error);

    return {
      success: false,
      devicesSent: 0,
      devicesSuccess: 0,
      devicesFailed: 0,
      invalidTokens: [],
      error: errorMessage,
    };
  }
}

/**
 * Send a push notification to multiple users
 *
 * @param userIds - Array of user IDs to send notification to
 * @param notification - Notification content
 * @returns Bulk result with success/failure counts
 */
export async function sendBulkNotifications(
  userIds: string[],
  notification: PushNotification
): Promise<BulkNotificationResult> {
  const result: BulkNotificationResult = {
    totalUsers: userIds.length,
    usersNotified: 0,
    usersSkipped: 0,
    devicesSent: 0,
    devicesSuccess: 0,
    devicesFailed: 0,
    invalidTokens: [],
    errors: [],
  };

  if (userIds.length === 0) {
    return result;
  }

  // Process users in batches to avoid overwhelming the system
  const batchSize = 100;
  const batches: string[][] = [];
  for (let i = 0; i < userIds.length; i += batchSize) {
    batches.push(userIds.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    // Process batch concurrently
    const results = await Promise.all(
      batch.map(async (userId) => {
        const sendResult = await sendNotification(userId, notification);
        return { userId, result: sendResult };
      })
    );

    for (const { userId, result: sendResult } of results) {
      if (sendResult.success) {
        result.usersNotified++;
      } else {
        result.usersSkipped++;
        if (sendResult.error) {
          result.errors.push({ userId, error: sendResult.error });
        }
      }

      result.devicesSent += sendResult.devicesSent;
      result.devicesSuccess += sendResult.devicesSuccess;
      result.devicesFailed += sendResult.devicesFailed;
      result.invalidTokens.push(...sendResult.invalidTokens);
    }
  }

  // Deduplicate invalid tokens
  result.invalidTokens = Array.from(new Set(result.invalidTokens));

  return result;
}

/**
 * Send notification to a topic (FCM only)
 *
 * Useful for broadcast notifications like:
 * - Clinic announcements
 * - Staff alerts
 * - Location-specific updates
 */
export async function sendTopicNotification(
  topic: string,
  notification: PushNotification
): Promise<fcmService.FCMTopicResult> {
  return fcmService.sendToTopic(topic, {
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: notification.data as Record<string, string>,
    priority: notification.priority,
  });
}

/**
 * Subscribe user to a topic
 */
export async function subscribeUserToTopic(
  userId: string,
  topic: string
): Promise<boolean> {
  const tokens = await getUserDeviceTokens(userId);
  const fcmTokens = tokens
    .filter((t) => t.platform !== 'expo')
    .map((t) => t.token);

  if (fcmTokens.length === 0) {
    return false;
  }

  const result = await fcmService.subscribeToTopic(fcmTokens, topic);
  return result.successCount > 0;
}

/**
 * Unsubscribe user from a topic
 */
export async function unsubscribeUserFromTopic(
  userId: string,
  topic: string
): Promise<boolean> {
  const tokens = await getUserDeviceTokens(userId);
  const fcmTokens = tokens
    .filter((t) => t.platform !== 'expo')
    .map((t) => t.token);

  if (fcmTokens.length === 0) {
    return false;
  }

  const result = await fcmService.unsubscribeFromTopic(fcmTokens, topic);
  return result.successCount > 0;
}

// ===================
// Convenience Methods for Common Notifications
// ===================

/**
 * Send appointment reminder notification
 */
export async function sendAppointmentReminder(
  userId: string,
  data?: Record<string, unknown>
): Promise<SendNotificationResult> {
  return sendNotification(userId, {
    title: 'Appointment Reminder',
    body: 'You have an upcoming appointment. Open the app for details.',
    category: 'appointments',
    priority: 'high',
    data: { ...data, type: 'appointment_reminder' },
  });
}

/**
 * Send new message notification
 */
export async function sendNewMessageNotification(
  userId: string,
  data?: Record<string, unknown>
): Promise<SendNotificationResult> {
  return sendNotification(userId, {
    title: 'New Message',
    body: 'You have a new message. Open the app to read it.',
    category: 'messages',
    priority: 'high',
    data: { ...data, type: 'new_message' },
  });
}

/**
 * Send forms required notification
 */
export async function sendFormsRequiredNotification(
  userId: string,
  data?: Record<string, unknown>
): Promise<SendNotificationResult> {
  return sendNotification(userId, {
    title: 'Forms Required',
    body: 'Please complete your required forms before your appointment.',
    category: 'forms',
    priority: 'normal',
    data: { ...data, type: 'forms_required' },
  });
}

/**
 * Send payment reminder notification
 */
export async function sendPaymentReminderNotification(
  userId: string,
  data?: Record<string, unknown>
): Promise<SendNotificationResult> {
  return sendNotification(userId, {
    title: 'Payment Reminder',
    body: 'You have an outstanding balance. Open the app for details.',
    category: 'billing',
    priority: 'normal',
    data: { ...data, type: 'payment_reminder' },
  });
}

/**
 * Send waitlist spot available notification
 */
export async function sendWaitlistNotification(
  userId: string,
  data?: Record<string, unknown>
): Promise<SendNotificationResult> {
  return sendNotification(userId, {
    title: 'Spot Available',
    body: 'An appointment slot is now available. Open the app to book.',
    category: 'appointments',
    priority: 'high',
    bypassQuietHours: true, // Waitlist notifications are time-sensitive
    data: { ...data, type: 'waitlist_available' },
  });
}

/**
 * Send check-in available notification
 */
export async function sendCheckInNotification(
  userId: string,
  data?: Record<string, unknown>
): Promise<SendNotificationResult> {
  return sendNotification(userId, {
    title: 'Check-in Available',
    body: 'You can now check in for your appointment.',
    category: 'appointments',
    priority: 'high',
    data: { ...data, type: 'check_in_available' },
  });
}

// ===================
// Export
// ===================

export default {
  // Device token management
  registerDeviceToken,
  unregisterDeviceToken,
  getUserDeviceTokens,
  markTokensInvalid,

  // Preferences
  getNotificationPreferences,
  updateNotificationPreferences,

  // Sending
  sendNotification,
  sendBulkNotifications,
  sendTopicNotification,

  // Topic management
  subscribeUserToTopic,
  unsubscribeUserFromTopic,

  // Convenience methods
  sendAppointmentReminder,
  sendNewMessageNotification,
  sendFormsRequiredNotification,
  sendPaymentReminderNotification,
  sendWaitlistNotification,
  sendCheckInNotification,
};
