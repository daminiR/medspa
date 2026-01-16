# FCM Push Notification Best Practices for HIPAA-Compliant Medical Apps (2025)

## Executive Summary

This document outlines best practices for implementing Firebase Cloud Messaging (FCM) push notifications in HIPAA-compliant medical spa applications. The key principle: **NEVER send Protected Health Information (PHI) through push notifications**.

---

## 1. HIPAA-Compliant Content Guidelines

### What is SAFE to Include

**Generic Notifications (Recommended):**
```json
{
  "notification": {
    "title": "Appointment Reminder",
    "body": "You have an upcoming appointment. Tap to view details."
  },
  "data": {
    "type": "appointment_reminder",
    "appointmentId": "encrypted_id_xyz",
    "deepLink": "medspa://appointments/abc123"
  }
}
```

**Safe Content Examples:**
- ✅ "You have a new message" (no sender, no content)
- ✅ "Appointment reminder" (no time, no provider, no service)
- ✅ "Your results are ready" (no specifics)
- ✅ "Payment processed successfully" (no amounts)
- ✅ "Please complete your forms" (no form names)
- ✅ Badge counts (e.g., "3 unread messages")

**Data Payload Pattern:**
```typescript
interface SafeNotificationPayload {
  notification: {
    title: string;        // Generic only
    body: string;         // Generic only
    badge?: number;       // Count only
  };
  data: {
    type: NotificationType;           // Category
    resourceId: string;                // Encrypted ID
    deepLink: string;                  // App deep link
    timestamp: string;                 // ISO timestamp
    priority: 'high' | 'normal';       // Delivery priority
    requiresAuth: boolean;             // Force re-auth
  };
  apns?: {
    payload: {
      aps: {
        'content-available': 1;        // Silent update
        'mutable-content': 1;          // For notification service extension
      }
    }
  };
  android?: {
    priority: 'high' | 'normal';
  };
}
```

### What is PROHIBITED (PHI)

**NEVER Include:**
- ❌ Patient names or identifiers
- ❌ Appointment times, dates, or providers
- ❌ Treatment or service names
- ❌ Diagnosis or medical information
- ❌ Payment amounts or account details
- ❌ Insurance information
- ❌ Message content or sender names
- ❌ Lab results or values
- ❌ Prescription information
- ❌ Location details (clinic names, addresses)

### Data-Only Notifications (Most Secure)

For maximum security, use **silent/data-only notifications**:

```typescript
// Server-side (Node.js)
const message = {
  data: {
    type: 'appointment_update',
    resourceId: encrypt(appointmentId),
    action: 'refresh'
  },
  // NO notification object - silent delivery
  apns: {
    headers: {
      'apns-priority': '5', // Background priority
      'apns-push-type': 'background'
    },
    payload: {
      aps: {
        'content-available': 1
      }
    }
  },
  android: {
    priority: 'normal'
  },
  token: userFcmToken
};
```

The app then:
1. Receives silent notification
2. Fetches actual data via authenticated API
3. Shows local notification with full details (stays on device)

---

## 2. Token Management Best Practices

### Token Lifecycle Management

```typescript
interface FCMTokenRecord {
  userId: string;
  deviceId: string;              // Unique device identifier
  token: string;                 // Current FCM token
  platform: 'ios' | 'android' | 'web';
  createdAt: Date;
  lastRefreshedAt: Date;
  lastUsedAt: Date;              // Last successful notification
  isActive: boolean;
  deviceName?: string;           // "iPhone 14", "Chrome on Windows"
  appVersion: string;
  osVersion: string;
}
```

### Token Refresh Strategy

**Client-Side (React Native/Web):**
```typescript
// Initialize and monitor token
import messaging from '@react-native-firebase/messaging';

class FCMTokenManager {
  async initialize() {
    // Request permission
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('Push permission denied');
      return;
    }

    // Get initial token
    const token = await messaging().getToken();
    await this.registerToken(token);

    // Monitor token refresh
    messaging().onTokenRefresh(async (newToken) => {
      console.log('Token refreshed');
      await this.registerToken(newToken);
    });
  }

  async registerToken(token: string) {
    const deviceId = await this.getDeviceId();
    const platform = Platform.OS;
    const deviceName = await DeviceInfo.getDeviceName();
    const appVersion = await DeviceInfo.getVersion();
    const osVersion = await DeviceInfo.getSystemVersion();

    await fetch('/api/notifications/register-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({
        token,
        deviceId,
        platform,
        deviceName,
        appVersion,
        osVersion
      })
    });
  }

  async getDeviceId(): Promise<string> {
    // Use consistent device ID across app reinstalls
    const stored = await AsyncStorage.getItem('device_id');
    if (stored) return stored;

    const newId = await DeviceInfo.getUniqueId();
    await AsyncStorage.setItem('device_id', newId);
    return newId;
  }
}
```

**Server-Side Token Management:**
```typescript
// API Route: /api/notifications/register-token
export async function POST(req: Request) {
  const { token, deviceId, platform, deviceName, appVersion, osVersion } = await req.json();
  const userId = await getUserFromAuth(req);

  // Check if token already exists for this device
  const existing = await db.fcmTokens.findFirst({
    where: { userId, deviceId }
  });

  if (existing) {
    // Update existing token
    await db.fcmTokens.update({
      where: { id: existing.id },
      data: {
        token,
        lastRefreshedAt: new Date(),
        isActive: true,
        appVersion,
        osVersion
      }
    });
  } else {
    // Create new token record
    await db.fcmTokens.create({
      data: {
        userId,
        deviceId,
        token,
        platform,
        deviceName,
        appVersion,
        osVersion,
        isActive: true,
        createdAt: new Date(),
        lastRefreshedAt: new Date()
      }
    });
  }

  return Response.json({ success: true });
}
```

### Multi-Device Support

**Smart Multi-Device Delivery:**
```typescript
async function sendNotificationToUser(
  userId: string,
  notification: NotificationPayload
) {
  // Get all active tokens for user
  const tokens = await db.fcmTokens.findMany({
    where: {
      userId,
      isActive: true
    },
    orderBy: { lastUsedAt: 'desc' }
  });

  if (tokens.length === 0) {
    console.log(`No active tokens for user ${userId}`);
    return;
  }

  // Strategy 1: Send to primary device only (most recent)
  // const primaryToken = tokens[0];
  // await sendToToken(primaryToken.token, notification);

  // Strategy 2: Send to all devices (recommended for medical apps)
  const results = await admin.messaging().sendMulticast({
    tokens: tokens.map(t => t.token),
    notification: notification.notification,
    data: notification.data,
    android: notification.android,
    apns: notification.apns
  });

  // Process results and cleanup invalid tokens
  await processMulticastResults(results, tokens);
}

async function processMulticastResults(
  results: admin.messaging.BatchResponse,
  tokens: FCMTokenRecord[]
) {
  const now = new Date();

  for (let i = 0; i < results.responses.length; i++) {
    const result = results.responses[i];
    const tokenRecord = tokens[i];

    if (result.success) {
      // Update last used timestamp
      await db.fcmTokens.update({
        where: { id: tokenRecord.id },
        data: { lastUsedAt: now }
      });
    } else {
      const error = result.error;

      // Handle specific errors
      if (error?.code === 'messaging/invalid-registration-token' ||
          error?.code === 'messaging/registration-token-not-registered') {
        // Token is invalid - mark as inactive
        await db.fcmTokens.update({
          where: { id: tokenRecord.id },
          data: { isActive: false }
        });
        console.log(`Deactivated invalid token for device ${tokenRecord.deviceId}`);
      }
    }
  }
}
```

### Token Cleanup Strategy

```typescript
// Run daily via cron job
async function cleanupStaleTokens() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Deactivate tokens not used in 30 days
  const result = await db.fcmTokens.updateMany({
    where: {
      lastUsedAt: { lt: thirtyDaysAgo },
      isActive: true
    },
    data: { isActive: false }
  });

  console.log(`Deactivated ${result.count} stale tokens`);

  // Delete tokens inactive for 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const deleted = await db.fcmTokens.deleteMany({
    where: {
      lastUsedAt: { lt: ninetyDaysAgo },
      isActive: false
    }
  });

  console.log(`Deleted ${deleted.count} old inactive tokens`);
}
```

---

## 3. Delivery Rate Optimization

### Priority Classification

```typescript
enum NotificationPriority {
  CRITICAL = 'critical',    // Immediate delivery, bypass quiet hours
  HIGH = 'high',           // Deliver soon, respect quiet hours
  NORMAL = 'normal',       // Standard delivery
  LOW = 'low'              // Batch/delay acceptable
}

interface NotificationConfig {
  type: string;
  priority: NotificationPriority;
  ttl: number;                    // Time-to-live in seconds
  collapseKey?: string;           // For message replacement
  bypassQuietHours: boolean;
}

const NOTIFICATION_CONFIGS: Record<string, NotificationConfig> = {
  appointment_reminder_24h: {
    type: 'appointment_reminder',
    priority: NotificationPriority.HIGH,
    ttl: 3600,
    bypassQuietHours: false
  },
  appointment_reminder_1h: {
    type: 'appointment_reminder',
    priority: NotificationPriority.CRITICAL,
    ttl: 1800,
    bypassQuietHours: true
  },
  message_received: {
    type: 'message',
    priority: NotificationPriority.HIGH,
    ttl: 86400,
    collapseKey: 'new_messages',
    bypassQuietHours: false
  },
  appointment_confirmed: {
    type: 'appointment_update',
    priority: NotificationPriority.NORMAL,
    ttl: 86400,
    bypassQuietHours: false
  },
  marketing: {
    type: 'marketing',
    priority: NotificationPriority.LOW,
    ttl: 604800,
    bypassQuietHours: false
  }
};
```

### Batching Strategy

```typescript
class NotificationBatcher {
  private queue: Map<string, QueuedNotification[]> = new Map();
  private batchInterval = 5000; // 5 seconds

  constructor() {
    setInterval(() => this.processBatch(), this.batchInterval);
  }

  async queueNotification(
    userId: string,
    notification: NotificationPayload,
    config: NotificationConfig
  ) {
    // Critical notifications bypass batching
    if (config.priority === NotificationPriority.CRITICAL) {
      await this.sendImmediate(userId, notification, config);
      return;
    }

    // Add to batch queue
    if (!this.queue.has(userId)) {
      this.queue.set(userId, []);
    }

    this.queue.get(userId)!.push({
      notification,
      config,
      queuedAt: Date.now()
    });
  }

  async processBatch() {
    for (const [userId, notifications] of this.queue.entries()) {
      if (notifications.length === 0) continue;

      // Check quiet hours
      const preferences = await getUserPreferences(userId);
      if (this.isQuietHours(preferences)) {
        // Filter out notifications that don't bypass quiet hours
        const urgent = notifications.filter(n => n.config.bypassQuietHours);
        const delayed = notifications.filter(n => !n.config.bypassQuietHours);

        // Send urgent notifications
        for (const notif of urgent) {
          await this.sendImmediate(userId, notif.notification, notif.config);
        }

        // Keep delayed notifications in queue
        this.queue.set(userId, delayed);
        continue;
      }

      // Group by collapse key
      const grouped = this.groupByCollapseKey(notifications);

      for (const [collapseKey, group] of grouped.entries()) {
        if (group.length === 1) {
          // Single notification - send as-is
          await this.sendImmediate(userId, group[0].notification, group[0].config);
        } else {
          // Multiple notifications - send summary
          await this.sendSummary(userId, group, collapseKey);
        }
      }

      // Clear queue for this user
      this.queue.delete(userId);
    }
  }

  private groupByCollapseKey(
    notifications: QueuedNotification[]
  ): Map<string, QueuedNotification[]> {
    const grouped = new Map<string, QueuedNotification[]>();

    for (const notif of notifications) {
      const key = notif.config.collapseKey || `unique_${notif.notification.data.resourceId}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(notif);
    }

    return grouped;
  }

  private async sendSummary(
    userId: string,
    notifications: QueuedNotification[],
    collapseKey: string
  ) {
    // Create summary notification
    const count = notifications.length;
    const summary = {
      notification: {
        title: notifications[0].notification.notification?.title || 'Updates',
        body: `You have ${count} new updates. Tap to view.`,
        badge: count
      },
      data: {
        type: 'summary',
        count: count.toString(),
        collapseKey,
        timestamp: new Date().toISOString()
      }
    };

    await sendNotificationToUser(userId, summary);
  }

  private async sendImmediate(
    userId: string,
    notification: NotificationPayload,
    config: NotificationConfig
  ) {
    const message = {
      ...notification,
      android: {
        priority: config.priority === NotificationPriority.CRITICAL ? 'high' : 'normal',
        ttl: config.ttl * 1000
      },
      apns: {
        headers: {
          'apns-priority': config.priority === NotificationPriority.CRITICAL ? '10' : '5'
        },
        payload: {
          aps: {
            ...notification.apns?.payload?.aps,
            badge: notification.notification?.badge
          }
        }
      }
    };

    await sendNotificationToUser(userId, message);
  }

  private isQuietHours(preferences: UserPreferences): boolean {
    if (!preferences.quietHoursEnabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const start = preferences.quietHoursStart; // minutes since midnight
    const end = preferences.quietHoursEnd;

    if (start < end) {
      return currentTime >= start && currentTime < end;
    } else {
      // Quiet hours span midnight
      return currentTime >= start || currentTime < end;
    }
  }
}
```

### Message Deduplication

```typescript
class NotificationDeduplicator {
  private recentlySent: Map<string, number> = new Map();
  private dedupeWindow = 300000; // 5 minutes

  async shouldSend(
    userId: string,
    notificationType: string,
    resourceId?: string
  ): Promise<boolean> {
    const key = `${userId}:${notificationType}:${resourceId || 'global'}`;
    const lastSent = this.recentlySent.get(key);

    if (lastSent && Date.now() - lastSent < this.dedupeWindow) {
      console.log(`Dedupe: Skipping duplicate notification for ${key}`);
      return false;
    }

    this.recentlySent.set(key, Date.now());

    // Cleanup old entries periodically
    if (this.recentlySent.size > 10000) {
      this.cleanup();
    }

    return true;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, timestamp] of this.recentlySent.entries()) {
      if (now - timestamp > this.dedupeWindow) {
        this.recentlySent.delete(key);
      }
    }
  }
}
```

---

## 4. Quiet Hours and User Preferences

### User Preference Schema

```typescript
interface NotificationPreferences {
  userId: string;

  // Global settings
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;

  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart: number;      // Minutes since midnight (e.g., 1320 = 10:00 PM)
  quietHoursEnd: number;        // Minutes since midnight (e.g., 480 = 8:00 AM)
  quietHoursTimezone: string;   // IANA timezone (e.g., 'America/New_York')

  // Category preferences
  appointmentReminders: boolean;
  appointmentChanges: boolean;
  messageNotifications: boolean;
  paymentReminders: boolean;
  marketingNotifications: boolean;
  waitlistNotifications: boolean;

  // Advanced settings
  reminderLeadTime24h: boolean;   // 24 hour reminder
  reminderLeadTime2h: boolean;    // 2 hour reminder
  reminderLeadTime30m: boolean;   // 30 minute reminder

  // Platform-specific
  preferredChannel: 'push' | 'email' | 'sms';

  updatedAt: Date;
}

const DEFAULT_PREFERENCES: Partial<NotificationPreferences> = {
  pushEnabled: true,
  emailEnabled: true,
  smsEnabled: true,
  quietHoursEnabled: false,
  quietHoursStart: 1260,  // 9:00 PM
  quietHoursEnd: 480,     // 8:00 AM
  appointmentReminders: true,
  appointmentChanges: true,
  messageNotifications: true,
  paymentReminders: true,
  marketingNotifications: false,
  waitlistNotifications: true,
  reminderLeadTime24h: true,
  reminderLeadTime2h: true,
  reminderLeadTime30m: false,
  preferredChannel: 'push'
};
```

### Preference Enforcement

```typescript
async function shouldSendNotification(
  userId: string,
  notificationType: string,
  priority: NotificationPriority
): Promise<boolean> {
  const prefs = await getUserPreferences(userId);

  // Check global push enabled
  if (!prefs.pushEnabled) {
    console.log(`Push disabled for user ${userId}`);
    return false;
  }

  // Check category-specific preferences
  const categoryEnabled = checkCategoryPreference(prefs, notificationType);
  if (!categoryEnabled) {
    console.log(`Category ${notificationType} disabled for user ${userId}`);
    return false;
  }

  // Check quiet hours (unless critical priority)
  if (priority !== NotificationPriority.CRITICAL && prefs.quietHoursEnabled) {
    if (isWithinQuietHours(prefs)) {
      console.log(`Quiet hours active for user ${userId}`);
      return false;
    }
  }

  return true;
}

function checkCategoryPreference(
  prefs: NotificationPreferences,
  notificationType: string
): boolean {
  const mapping: Record<string, keyof NotificationPreferences> = {
    'appointment_reminder': 'appointmentReminders',
    'appointment_update': 'appointmentChanges',
    'appointment_cancelled': 'appointmentChanges',
    'message_received': 'messageNotifications',
    'payment_due': 'paymentReminders',
    'payment_processed': 'paymentReminders',
    'marketing': 'marketingNotifications',
    'waitlist_offer': 'waitlistNotifications'
  };

  const prefKey = mapping[notificationType];
  return prefKey ? (prefs[prefKey] as boolean) : true;
}

function isWithinQuietHours(prefs: NotificationPreferences): boolean {
  if (!prefs.quietHoursEnabled) return false;

  // Get current time in user's timezone
  const now = DateTime.now().setZone(prefs.quietHoursTimezone);
  const currentMinutes = now.hour * 60 + now.minute;

  const { quietHoursStart, quietHoursEnd } = prefs;

  if (quietHoursStart < quietHoursEnd) {
    // Normal range (e.g., 10 PM to 8 AM next day doesn't cross midnight in this case)
    return currentMinutes >= quietHoursStart && currentMinutes < quietHoursEnd;
  } else {
    // Range crosses midnight (e.g., 10 PM to 8 AM)
    return currentMinutes >= quietHoursStart || currentMinutes < quietHoursEnd;
  }
}
```

### Delayed Delivery Queue

```typescript
class QuietHoursQueue {
  async scheduleForAfterQuietHours(
    userId: string,
    notification: NotificationPayload,
    config: NotificationConfig
  ) {
    const prefs = await getUserPreferences(userId);
    const deliveryTime = this.calculateDeliveryTime(prefs);

    await db.scheduledNotifications.create({
      data: {
        userId,
        notification: JSON.stringify(notification),
        config: JSON.stringify(config),
        scheduledFor: deliveryTime,
        status: 'pending'
      }
    });

    console.log(`Notification scheduled for ${deliveryTime} (after quiet hours)`);
  }

  private calculateDeliveryTime(prefs: NotificationPreferences): Date {
    const now = DateTime.now().setZone(prefs.quietHoursTimezone);
    const currentMinutes = now.hour * 60 + now.minute;

    // Calculate when quiet hours end
    let deliveryMinutes = prefs.quietHoursEnd;
    let deliveryDate = now;

    if (prefs.quietHoursStart < prefs.quietHoursEnd) {
      // Simple case: quiet hours within same day
      if (currentMinutes < prefs.quietHoursEnd) {
        // Still in quiet hours today
        deliveryMinutes = prefs.quietHoursEnd;
      } else {
        // Quiet hours tomorrow
        deliveryDate = now.plus({ days: 1 });
        deliveryMinutes = prefs.quietHoursEnd;
      }
    } else {
      // Quiet hours cross midnight
      if (currentMinutes >= prefs.quietHoursStart) {
        // After start, deliver tomorrow morning
        deliveryDate = now.plus({ days: 1 });
        deliveryMinutes = prefs.quietHoursEnd;
      } else if (currentMinutes < prefs.quietHoursEnd) {
        // Before end, deliver today morning
        deliveryMinutes = prefs.quietHoursEnd;
      } else {
        // Between end and start, deliver tomorrow morning
        deliveryDate = now.plus({ days: 1 });
        deliveryMinutes = prefs.quietHoursEnd;
      }
    }

    return deliveryDate
      .set({ hour: Math.floor(deliveryMinutes / 60), minute: deliveryMinutes % 60 })
      .toJSDate();
  }

  // Process scheduled notifications (run every minute via cron)
  async processScheduledNotifications() {
    const due = await db.scheduledNotifications.findMany({
      where: {
        scheduledFor: { lte: new Date() },
        status: 'pending'
      }
    });

    for (const scheduled of due) {
      try {
        const notification = JSON.parse(scheduled.notification);
        const config = JSON.parse(scheduled.config);

        await sendNotificationToUser(scheduled.userId, notification);

        await db.scheduledNotifications.update({
          where: { id: scheduled.id },
          data: { status: 'sent', sentAt: new Date() }
        });
      } catch (error) {
        console.error(`Failed to send scheduled notification ${scheduled.id}:`, error);

        await db.scheduledNotifications.update({
          where: { id: scheduled.id },
          data: {
            status: 'failed',
            error: error.message
          }
        });
      }
    }
  }
}
```

---

## 5. Error Handling and Retry Strategies

### Error Classification

```typescript
enum NotificationErrorType {
  INVALID_TOKEN = 'invalid_token',
  NETWORK_ERROR = 'network_error',
  RATE_LIMIT = 'rate_limit',
  SERVER_ERROR = 'server_error',
  AUTHENTICATION_ERROR = 'auth_error',
  UNKNOWN = 'unknown'
}

interface NotificationError {
  type: NotificationErrorType;
  code: string;
  message: string;
  retryable: boolean;
  retryAfter?: number;  // Seconds
}

function classifyFCMError(error: admin.messaging.MessagingError): NotificationError {
  const code = error.code;

  // Invalid/unregistered tokens - don't retry
  if (code === 'messaging/invalid-registration-token' ||
      code === 'messaging/registration-token-not-registered') {
    return {
      type: NotificationErrorType.INVALID_TOKEN,
      code,
      message: error.message,
      retryable: false
    };
  }

  // Rate limiting - retry with backoff
  if (code === 'messaging/quota-exceeded' ||
      code === 'messaging/too-many-requests') {
    return {
      type: NotificationErrorType.RATE_LIMIT,
      code,
      message: error.message,
      retryable: true,
      retryAfter: 300  // 5 minutes
    };
  }

  // Server errors - retry with backoff
  if (code === 'messaging/internal-error' ||
      code === 'messaging/server-unavailable') {
    return {
      type: NotificationErrorType.SERVER_ERROR,
      code,
      message: error.message,
      retryable: true,
      retryAfter: 60  // 1 minute
    };
  }

  // Authentication errors - don't retry
  if (code === 'messaging/authentication-error' ||
      code === 'messaging/invalid-credential') {
    return {
      type: NotificationErrorType.AUTHENTICATION_ERROR,
      code,
      message: error.message,
      retryable: false
    };
  }

  // Network errors - retry immediately
  if (error.message.includes('network') || error.message.includes('timeout')) {
    return {
      type: NotificationErrorType.NETWORK_ERROR,
      code,
      message: error.message,
      retryable: true,
      retryAfter: 5  // 5 seconds
    };
  }

  // Unknown errors - retry with caution
  return {
    type: NotificationErrorType.UNKNOWN,
    code,
    message: error.message,
    retryable: true,
    retryAfter: 120  // 2 minutes
  };
}
```

### Retry Strategy with Exponential Backoff

```typescript
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;      // milliseconds
  maxDelay: number;       // milliseconds
  multiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,        // 1 second
  maxDelay: 60000,        // 1 minute
  multiplier: 2
};

class NotificationRetryManager {
  async sendWithRetry(
    userId: string,
    notification: NotificationPayload,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<boolean> {
    let lastError: NotificationError | null = null;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        await sendNotificationToUser(userId, notification);

        // Log success
        await this.logNotificationSuccess(userId, notification, attempt);

        return true;
      } catch (error) {
        lastError = classifyFCMError(error as admin.messaging.MessagingError);

        // Log attempt
        await this.logNotificationAttempt(userId, notification, attempt, lastError);

        // Don't retry if not retryable
        if (!lastError.retryable) {
          console.log(`Non-retryable error: ${lastError.type}. Giving up.`);
          break;
        }

        // Don't retry if max attempts reached
        if (attempt === config.maxRetries) {
          console.log(`Max retries (${config.maxRetries}) reached. Giving up.`);
          break;
        }

        // Calculate backoff delay
        const delay = Math.min(
          config.baseDelay * Math.pow(config.multiplier, attempt),
          config.maxDelay
        );

        // Use error-specific retry delay if provided
        const retryDelay = lastError.retryAfter
          ? lastError.retryAfter * 1000
          : delay;

        console.log(`Retrying in ${retryDelay}ms (attempt ${attempt + 1}/${config.maxRetries})`);
        await this.sleep(retryDelay);
      }
    }

    // All retries failed
    await this.logNotificationFailure(userId, notification, lastError!);
    return false;
  }

  private async logNotificationAttempt(
    userId: string,
    notification: NotificationPayload,
    attempt: number,
    error: NotificationError
  ) {
    await db.notificationLogs.create({
      data: {
        userId,
        notificationType: notification.data.type,
        attempt,
        status: 'retrying',
        errorType: error.type,
        errorCode: error.code,
        errorMessage: error.message,
        timestamp: new Date()
      }
    });
  }

  private async logNotificationSuccess(
    userId: string,
    notification: NotificationPayload,
    attempts: number
  ) {
    await db.notificationLogs.create({
      data: {
        userId,
        notificationType: notification.data.type,
        attempt: attempts,
        status: 'success',
        timestamp: new Date()
      }
    });
  }

  private async logNotificationFailure(
    userId: string,
    notification: NotificationPayload,
    error: NotificationError
  ) {
    await db.notificationLogs.create({
      data: {
        userId,
        notificationType: notification.data.type,
        status: 'failed',
        errorType: error.type,
        errorCode: error.code,
        errorMessage: error.message,
        timestamp: new Date()
      }
    });

    // Alert admins for critical failures
    if (notification.data.type === 'appointment_reminder') {
      await this.alertAdmins(userId, notification, error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async alertAdmins(
    userId: string,
    notification: NotificationPayload,
    error: NotificationError
  ) {
    // Send email/Slack alert to admins
    console.error(`ALERT: Failed to send critical notification to user ${userId}`, {
      type: notification.data.type,
      error: error.type,
      message: error.message
    });
  }
}
```

### Circuit Breaker Pattern

```typescript
class FCMCircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  private readonly failureThreshold = 5;      // Open after 5 failures
  private readonly resetTimeout = 60000;      // Try again after 60 seconds
  private readonly successThreshold = 2;      // Close after 2 successes
  private successCount = 0;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      // Check if we should try again
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        console.log('Circuit breaker: Moving to half-open state');
        this.state = 'half-open';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN. FCM service unavailable.');
      }
    }

    try {
      const result = await fn();

      // Success
      this.onSuccess();
      return result;
    } catch (error) {
      // Failure
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    if (this.state === 'half-open') {
      this.successCount++;

      if (this.successCount >= this.successThreshold) {
        console.log('Circuit breaker: Moving to closed state');
        this.state = 'closed';
        this.failureCount = 0;
        this.successCount = 0;
      }
    } else {
      // Reset failure count on success
      this.failureCount = 0;
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      console.log('Circuit breaker: Moving to open state');
      this.state = 'open';

      // Alert monitoring system
      this.alertMonitoring();
    }
  }

  private alertMonitoring() {
    console.error('CRITICAL: FCM Circuit Breaker OPEN - Multiple failures detected');
    // Send alert to monitoring system (PagerDuty, etc.)
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount
    };
  }
}

// Usage
const fcmCircuitBreaker = new FCMCircuitBreaker();

async function sendNotificationSafely(userId: string, notification: NotificationPayload) {
  try {
    return await fcmCircuitBreaker.execute(async () => {
      return await sendNotificationToUser(userId, notification);
    });
  } catch (error) {
    if (error.message.includes('Circuit breaker is OPEN')) {
      // FCM is down - queue notification for later
      await queueForLaterDelivery(userId, notification);
    } else {
      throw error;
    }
  }
}
```

---

## 6. iOS vs Android vs Web Differences

### Platform-Specific Implementation

```typescript
interface PlatformSpecificMessage {
  common: {
    data: Record<string, string>;
  };
  ios?: {
    notification?: {
      title: string;
      body: string;
      badge?: number;
      sound?: string;
    };
    apns: APNSConfig;
  };
  android?: {
    notification?: {
      title: string;
      body: string;
      channelId: string;
      sound?: string;
      icon?: string;
      color?: string;
    };
    android: AndroidConfig;
  };
  web?: {
    notification?: {
      title: string;
      body: string;
      icon?: string;
      badge?: string;
    };
    fcmOptions?: {
      link?: string;
    };
  };
}

interface APNSConfig {
  headers: {
    'apns-priority': '5' | '10';
    'apns-push-type': 'alert' | 'background';
    'apns-expiration'?: string;
    'apns-collapse-id'?: string;
  };
  payload: {
    aps: {
      alert?: {
        title: string;
        body: string;
        'title-loc-key'?: string;
        'loc-key'?: string;
      };
      badge?: number;
      sound?: string | { critical: number; name: string; volume: number };
      'content-available'?: 1;
      'mutable-content'?: 1;
      category?: string;
      'thread-id'?: string;
    };
  };
}

interface AndroidConfig {
  priority: 'high' | 'normal';
  ttl: number;
  collapseKey?: string;
  restrictedPackageName?: string;
  notification?: {
    title: string;
    body: string;
    icon: string;
    color: string;
    sound: string;
    tag?: string;
    clickAction?: string;
    channelId: string;
    ticker?: string;
    sticky?: boolean;
    priority?: 'min' | 'low' | 'default' | 'high' | 'max';
    visibility?: 'private' | 'public' | 'secret';
    notificationCount?: number;
  };
}
```

### iOS-Specific Configuration

```typescript
function createIOSMessage(
  notification: NotificationPayload,
  priority: NotificationPriority
): admin.messaging.Message {
  const isCritical = priority === NotificationPriority.CRITICAL;

  return {
    data: notification.data,
    apns: {
      headers: {
        'apns-priority': isCritical ? '10' : '5',
        'apns-push-type': notification.notification ? 'alert' : 'background',
        'apns-expiration': Math.floor(Date.now() / 1000 + 86400).toString(), // 24 hours
        'apns-collapse-id': notification.data.type
      },
      payload: {
        aps: {
          alert: notification.notification ? {
            title: notification.notification.title,
            body: notification.notification.body
          } : undefined,
          badge: notification.notification?.badge,
          sound: isCritical
            ? { critical: 1, name: 'critical.caf', volume: 1.0 }
            : 'default',
          'content-available': notification.notification ? undefined : 1,
          'mutable-content': 1,  // Allows notification service extension to modify
          category: notification.data.type,
          'thread-id': notification.data.resourceId  // Groups related notifications
        }
      }
    }
  };
}

// iOS Notification Service Extension (Swift)
/*
class NotificationService: UNNotificationServiceExtension {
    override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {

        guard let bestAttemptContent = request.content.mutableCopy() as? UNMutableNotificationContent else {
            return
        }

        // Fetch actual data from API using encrypted ID
        if let resourceId = bestAttemptContent.userInfo["resourceId"] as? String {
            fetchDetails(resourceId: resourceId) { details in
                // Update notification with actual details (shown on device only)
                bestAttemptContent.title = details.title
                bestAttemptContent.body = details.body

                contentHandler(bestAttemptContent)
            }
        }
    }
}
*/
```

### Android-Specific Configuration

```typescript
function createAndroidMessage(
  notification: NotificationPayload,
  priority: NotificationPriority
): admin.messaging.Message {
  const isCritical = priority === NotificationPriority.CRITICAL;

  return {
    data: notification.data,
    android: {
      priority: isCritical ? 'high' : 'normal',
      ttl: 86400000,  // 24 hours in milliseconds
      collapseKey: notification.data.type,
      notification: notification.notification ? {
        title: notification.notification.title,
        body: notification.notification.body,
        icon: 'ic_notification',
        color: '#0066CC',  // Brand color
        sound: isCritical ? 'critical' : 'default',
        tag: notification.data.resourceId,  // Replaces previous notification with same tag
        channelId: this.getChannelId(notification.data.type),
        priority: isCritical ? 'max' : 'high',
        visibility: 'private',  // Hide on lock screen
        notificationCount: notification.notification.badge,
        clickAction: 'FLUTTER_NOTIFICATION_CLICK'
      } : undefined
    }
  };
}

// Android notification channels (must be created in app)
const ANDROID_CHANNELS = {
  appointments: {
    id: 'appointments',
    name: 'Appointments',
    description: 'Appointment reminders and updates',
    importance: 'high',
    sound: 'default',
    vibration: true
  },
  messages: {
    id: 'messages',
    name: 'Messages',
    description: 'New messages from staff',
    importance: 'high',
    sound: 'default',
    vibration: true
  },
  critical: {
    id: 'critical',
    name: 'Critical Alerts',
    description: 'Urgent notifications',
    importance: 'max',
    sound: 'critical',
    vibration: true,
    bypassDnd: true
  },
  marketing: {
    id: 'marketing',
    name: 'Promotions',
    description: 'Special offers and updates',
    importance: 'low',
    sound: 'silent',
    vibration: false
  }
};

function getChannelId(notificationType: string): string {
  const mapping: Record<string, string> = {
    'appointment_reminder': 'appointments',
    'appointment_update': 'appointments',
    'message_received': 'messages',
    'critical_alert': 'critical',
    'marketing': 'marketing'
  };

  return mapping[notificationType] || 'default';
}
```

### Web-Specific Configuration

```typescript
function createWebMessage(
  notification: NotificationPayload
): admin.messaging.Message {
  return {
    data: notification.data,
    webpush: {
      notification: notification.notification ? {
        title: notification.notification.title,
        body: notification.notification.body,
        icon: '/icons/notification-icon-192.png',
        badge: '/icons/badge-72.png',
        tag: notification.data.resourceId,
        renotify: true,
        requireInteraction: notification.data.type === 'appointment_reminder',
        vibrate: [200, 100, 200]
      } : undefined,
      fcmOptions: {
        link: notification.data.deepLink || 'https://app.medspa.com'
      },
      headers: {
        'TTL': '86400'  // 24 hours
      }
    }
  };
}

// Web Push Service Worker (JavaScript)
/*
self.addEventListener('push', (event) => {
  const data = event.data.json();

  // For data-only notifications, fetch details from API
  if (!data.notification) {
    event.waitUntil(
      fetchNotificationDetails(data.data.resourceId)
        .then(details => {
          return self.registration.showNotification(details.title, {
            body: details.body,
            icon: '/icons/notification-icon-192.png',
            badge: '/icons/badge-72.png',
            tag: data.data.resourceId,
            data: data.data
          });
        })
    );
  } else {
    // Show notification as-is
    event.waitUntil(
      self.registration.showNotification(data.notification.title, {
        body: data.notification.body,
        icon: '/icons/notification-icon-192.png',
        badge: '/icons/badge-72.png',
        tag: data.data.resourceId,
        data: data.data
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data.deepLink || 'https://app.medspa.com';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Check if there's already a window open
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
*/
```

### Unified Multi-Platform Sender

```typescript
class MultiPlatformNotificationSender {
  async sendToAllPlatforms(
    userId: string,
    notification: NotificationPayload,
    priority: NotificationPriority
  ) {
    const tokens = await db.fcmTokens.findMany({
      where: { userId, isActive: true }
    });

    const messagesByPlatform = tokens.map(token => {
      let message: admin.messaging.Message;

      switch (token.platform) {
        case 'ios':
          message = createIOSMessage(notification, priority);
          break;
        case 'android':
          message = createAndroidMessage(notification, priority);
          break;
        case 'web':
          message = createWebMessage(notification);
          break;
        default:
          throw new Error(`Unknown platform: ${token.platform}`);
      }

      return {
        ...message,
        token: token.token
      };
    });

    // Send to all platforms
    const results = await admin.messaging().sendAll(messagesByPlatform);

    // Process results
    await this.processResults(results, tokens);

    return results;
  }

  private async processResults(
    results: admin.messaging.BatchResponse,
    tokens: FCMTokenRecord[]
  ) {
    for (let i = 0; i < results.responses.length; i++) {
      const result = results.responses[i];
      const token = tokens[i];

      if (result.success) {
        await db.fcmTokens.update({
          where: { id: token.id },
          data: { lastUsedAt: new Date() }
        });
      } else {
        const error = classifyFCMError(result.error!);

        if (error.type === NotificationErrorType.INVALID_TOKEN) {
          await db.fcmTokens.update({
            where: { id: token.id },
            data: { isActive: false }
          });
        }

        console.error(`Failed to send to ${token.platform} device:`, error);
      }
    }
  }
}
```

---

## 7. Monitoring and Analytics

### Key Metrics to Track

```typescript
interface NotificationMetrics {
  // Delivery metrics
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;  // delivered / sent

  // Engagement metrics
  totalOpened: number;
  openRate: number;      // opened / delivered

  // Error metrics
  invalidTokens: number;
  networkErrors: number;
  rateLimitErrors: number;
  serverErrors: number;

  // Timing metrics
  avgDeliveryTime: number;  // milliseconds
  p95DeliveryTime: number;
  p99DeliveryTime: number;

  // User preferences
  quietHoursBlocked: number;
  preferenceBlocked: number;

  // Platform breakdown
  iosSent: number;
  androidSent: number;
  webSent: number;
}

class NotificationAnalytics {
  async trackSent(
    userId: string,
    notificationType: string,
    platform: string
  ) {
    await db.notificationMetrics.create({
      data: {
        userId,
        notificationType,
        platform,
        event: 'sent',
        timestamp: new Date()
      }
    });
  }

  async trackDelivered(
    userId: string,
    notificationType: string,
    deliveryTime: number
  ) {
    await db.notificationMetrics.create({
      data: {
        userId,
        notificationType,
        event: 'delivered',
        deliveryTimeMs: deliveryTime,
        timestamp: new Date()
      }
    });
  }

  async trackOpened(
    userId: string,
    notificationType: string
  ) {
    await db.notificationMetrics.create({
      data: {
        userId,
        notificationType,
        event: 'opened',
        timestamp: new Date()
      }
    });
  }

  async generateReport(
    startDate: Date,
    endDate: Date
  ): Promise<NotificationMetrics> {
    const metrics = await db.notificationMetrics.groupBy({
      by: ['event'],
      where: {
        timestamp: { gte: startDate, lte: endDate }
      },
      _count: true
    });

    const sent = metrics.find(m => m.event === 'sent')?._count || 0;
    const delivered = metrics.find(m => m.event === 'delivered')?._count || 0;
    const opened = metrics.find(m => m.event === 'opened')?._count || 0;

    return {
      totalSent: sent,
      totalDelivered: delivered,
      totalFailed: sent - delivered,
      deliveryRate: sent > 0 ? delivered / sent : 0,
      totalOpened: opened,
      openRate: delivered > 0 ? opened / delivered : 0,
      // ... other metrics
    };
  }
}
```

---

## 8. Implementation Checklist

### Backend Setup

- [ ] Initialize Firebase Admin SDK with service account
- [ ] Create FCM token registration API endpoint
- [ ] Create token refresh handling
- [ ] Implement multi-device token storage
- [ ] Set up token cleanup cron job
- [ ] Create notification preferences API endpoints
- [ ] Implement quiet hours logic
- [ ] Build notification batching system
- [ ] Create retry mechanism with exponential backoff
- [ ] Implement circuit breaker pattern
- [ ] Set up notification queue for delayed delivery
- [ ] Create monitoring and analytics tracking

### Mobile App (iOS/Android)

- [ ] Request notification permissions
- [ ] Register for FCM token
- [ ] Handle token refresh
- [ ] Send token to backend API
- [ ] Create notification service extension (iOS) for secure content loading
- [ ] Set up notification channels (Android)
- [ ] Implement deep linking
- [ ] Handle notification tap events
- [ ] Track notification opens

### Web App

- [ ] Request notification permissions
- [ ] Register service worker
- [ ] Subscribe to push notifications
- [ ] Handle push events in service worker
- [ ] Implement notification click handling
- [ ] Set up deep linking

### Security & Compliance

- [ ] Audit all notification content for PHI
- [ ] Implement end-to-end encryption for data payloads
- [ ] Set up HIPAA-compliant logging
- [ ] Create data retention policies
- [ ] Implement user consent tracking
- [ ] Set up security monitoring alerts

### Testing

- [ ] Test notification delivery on all platforms
- [ ] Test quiet hours functionality
- [ ] Test multi-device scenarios
- [ ] Test token refresh and expiration
- [ ] Test retry logic and error handling
- [ ] Load test with high volume
- [ ] Test notification preferences
- [ ] Test deep linking

---

## 9. Sample Integration Code

### Complete Backend API Example

```typescript
// /api/notifications/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin (do this once in a separate file)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

export async function POST(req: NextRequest) {
  try {
    const { userId, type, resourceId } = await req.json();

    // Get user's notification preferences
    const prefs = await getUserPreferences(userId);

    // Check if notifications are enabled
    if (!prefs.pushEnabled) {
      return NextResponse.json({
        success: false,
        reason: 'push_disabled'
      });
    }

    // Get notification config
    const config = NOTIFICATION_CONFIGS[type];
    if (!config) {
      return NextResponse.json({
        success: false,
        reason: 'invalid_type'
      });
    }

    // Check quiet hours
    if (!config.bypassQuietHours && isWithinQuietHours(prefs)) {
      // Schedule for later
      await scheduleForAfterQuietHours(userId, type, resourceId, config);
      return NextResponse.json({
        success: true,
        scheduled: true
      });
    }

    // Create notification payload (NO PHI!)
    const notification: NotificationPayload = {
      notification: {
        title: getGenericTitle(type),
        body: getGenericBody(type)
      },
      data: {
        type,
        resourceId: encrypt(resourceId),
        timestamp: new Date().toISOString()
      }
    };

    // Send notification with retry
    const retryManager = new NotificationRetryManager();
    const success = await retryManager.sendWithRetry(userId, notification);

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

function getGenericTitle(type: string): string {
  const titles: Record<string, string> = {
    'appointment_reminder': 'Appointment Reminder',
    'message_received': 'New Message',
    'payment_due': 'Payment Reminder',
    'waitlist_offer': 'Appointment Available'
  };
  return titles[type] || 'Notification';
}

function getGenericBody(type: string): string {
  const bodies: Record<string, string> = {
    'appointment_reminder': 'You have an upcoming appointment. Tap to view details.',
    'message_received': 'You have a new message. Tap to read.',
    'payment_due': 'You have a pending payment. Tap to review.',
    'waitlist_offer': 'An appointment slot is available. Tap to book.'
  };
  return bodies[type] || 'Tap to view details.';
}
```

### React Native Client Example

```typescript
// App.tsx
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    setupNotifications();
  }, []);

  async function setupNotifications() {
    // Request permission
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('Permission denied');
      return;
    }

    // Get FCM token
    const token = await messaging().getToken();
    console.log('FCM Token:', token);

    // Register token with backend
    await registerToken(token);

    // Handle token refresh
    messaging().onTokenRefresh(async (newToken) => {
      console.log('Token refreshed');
      await registerToken(newToken);
    });

    // Handle foreground messages
    messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message:', remoteMessage);

      // Fetch actual data from API
      const data = await fetchNotificationData(remoteMessage.data.resourceId);

      // Show local notification with real data
      await showLocalNotification(data);
    });

    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message:', remoteMessage);
      // Handle background notification
    });

    // Handle notification open
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened:', remoteMessage);
      // Navigate to appropriate screen
      handleDeepLink(remoteMessage.data.deepLink);
    });

    // Handle notification that opened app from quit state
    const initialNotification = await messaging().getInitialNotification();
    if (initialNotification) {
      console.log('App opened from notification:', initialNotification);
      handleDeepLink(initialNotification.data.deepLink);
    }
  }

  async function registerToken(token: string) {
    try {
      await fetch('https://api.medspa.com/notifications/register-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({
          token,
          deviceId: await getDeviceId(),
          platform: Platform.OS
        })
      });
    } catch (error) {
      console.error('Failed to register token:', error);
    }
  }

  async function fetchNotificationData(encryptedId: string) {
    const response = await fetch(
      `https://api.medspa.com/notifications/data/${encryptedId}`,
      {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      }
    );
    return response.json();
  }

  return <YourApp />;
}
```

---

## 10. Security Best Practices Summary

### Critical Rules

1. **NEVER send PHI in push notifications** - not in title, body, or visible data
2. **Always encrypt resource IDs** - use strong encryption for any identifiers
3. **Use data-only notifications** for maximum security - let app fetch details via API
4. **Implement proper authentication** - require re-auth for sensitive actions
5. **Log all notification events** - for HIPAA audit trail requirements
6. **Set appropriate TTL** - don't let sensitive notifications persist indefinitely
7. **Use HTTPS for all API calls** - enforce TLS 1.2+
8. **Implement token rotation** - regularly refresh and clean up old tokens
9. **Monitor for anomalies** - alert on unusual patterns
10. **Test on all platforms** - iOS, Android, and Web behave differently

---

## Conclusion

This guide provides a comprehensive framework for implementing HIPAA-compliant FCM push notifications in medical spa applications. The key principle is **privacy-first design**: treat push notifications as triggers to fetch data securely, not as data transport themselves.

By following these best practices, you'll build a robust, secure, and user-friendly notification system that respects patient privacy while keeping users informed and engaged.
