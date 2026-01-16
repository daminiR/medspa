# Firebase Cloud Messaging (FCM) Implementation Guide
## Medical Spa Platform - 2024-2025

> **Last Updated:** December 23, 2024
> **Research Status:** Comprehensive market analysis completed

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [FCM Features Overview](#fcm-features-overview)
3. [Pricing Analysis](#pricing-analysis)
4. [Integration Implementation](#integration-implementation)
5. [Reliability & Performance](#reliability--performance)
6. [HIPAA Compliance & Healthcare Considerations](#hipaa-compliance--healthcare-considerations)
7. [Best Practices for Medical Spa Platform](#best-practices-for-medical-spa-platform)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Monitoring & Analytics](#monitoring--analytics)
10. [References](#references)

---

## Executive Summary

### Quick Facts

| Feature | Details |
|---------|---------|
| **Cost** | Completely FREE (unlimited messages) |
| **Platforms** | iOS, Android, Web (unified API) |
| **Payload Size** | 4KB (data messages), 2KB (notification messages) |
| **Offline Storage** | 100 messages per device, 28 days max |
| **Delivery Rate** | ~85% (with proper token management) |
| **HIPAA Compliant** | ❌ NO - Not covered under Google Cloud BAA |

### Key Recommendation for Medical Spa Platform

**FCM is recommended for general notifications but CANNOT be used for PHI transmission.** Use a layered approach:
- ✅ Generic notifications via FCM ("You have a new message", "Appointment reminder")
- ✅ PHI data stored in HIPAA-compliant services (Cloud Firestore with BAA)
- ✅ App fetches sensitive data after user opens notification

---

## FCM Features Overview

### 1. Cross-Platform Support

Firebase Cloud Messaging (FCM) is a **free, cross-platform messaging service** provided by Google that enables delivery of messages and notifications to:

- **Android:** Native support via Google Play Services
- **iOS:** Routes through APNs (Apple Push Notification Service)
- **Web:** Service Worker-based push notifications

**Technical Architecture:**
- FCM maintains a persistent connection on Android devices through Google Play Services
- All apps share a single connection (battery-efficient)
- For iOS, FCM acts as a wrapper around APNs
- Web push requires HTTPS and service worker registration

### 2. Message Types

#### Notification Messages
- **Automatically displayed** by FCM SDK
- Handled by the SDK when app is in background
- Best for: User-visible alerts, reminders, promotional messages
- Maximum payload: **2KB**
- Example use cases:
  - Appointment reminders
  - Treatment completed notifications
  - Welcome messages

```json
{
  "message": {
    "token": "device_token_here",
    "notification": {
      "title": "Appointment Reminder",
      "body": "Your appointment is tomorrow at 2:00 PM"
    }
  }
}
```

#### Data Messages
- **Processed by your application code**
- Silent notifications (no automatic display)
- Best for: Background data sync, custom logic, analytics
- Maximum payload: **4KB**
- Example use cases:
  - Syncing patient records
  - Updating inventory counts
  - Triggering background tasks

```json
{
  "message": {
    "token": "device_token_here",
    "data": {
      "type": "appointment_update",
      "appointmentId": "12345",
      "action": "sync"
    }
  }
}
```

#### Combined Messages
- Contains both notification and data payloads
- **Foreground:** Both payloads available to app
- **Background:** Notification displayed, data available when tapped

### 3. Targeting Options

#### Individual Devices
```javascript
// Send to specific device token
const message = {
  token: 'user_device_token_here',
  notification: {
    title: 'Treatment Complete',
    body: 'Your Botox treatment notes are ready'
  }
};
```

#### Topic Messaging
```javascript
// Subscribe users to topics
await messaging.subscribeToTopic(['device_token1', 'device_token2'], 'appointment-reminders');

// Send to topic
const message = {
  topic: 'appointment-reminders',
  notification: {
    title: 'Reminder',
    body: 'Check in for your appointment'
  }
};
```

**Medical Spa Use Cases:**
- `appointment-reminders`: All patients with upcoming appointments
- `promotions`: Opt-in users for special offers
- `staff-alerts`: Internal staff communications
- `waitlist-updates`: Patients on waitlist

#### Device Groups
- Send to all devices owned by a single user
- Useful for multi-device patients (phone, tablet, web)
- Maximum 20 devices per group

#### Conditional Messaging
```javascript
const message = {
  condition: "'new-patients' in topics && 'ios' in topics",
  notification: {
    title: 'Welcome!',
    body: 'Complete your intake forms'
  }
};
```

### 4. Message Priority

- **High Priority:** Delivered immediately, wakes device
- **Normal Priority:** Delivered when device is active
- Use high priority sparingly (battery impact)

### 5. Notification Channels (Android 8.0+)

```javascript
{
  "android": {
    "notification": {
      "channelId": "appointment_reminders",
      "priority": "high",
      "sound": "default"
    }
  }
}
```

Create channels for:
- Appointment Reminders
- Treatment Notifications
- Promotional Messages
- Staff Alerts

---

## Pricing Analysis

### Cost Breakdown

| Service | Price | Limits |
|---------|-------|--------|
| **FCM Messages** | **FREE** | Unlimited |
| **Cloud Firestore** | Free tier: 50K reads/day | Pay-as-you-go after |
| **Cloud Functions** | Free tier: 2M invocations/month | $0.40/million after |
| **Identity Platform** (for BAA) | $0.0055/MAU | Required for HIPAA auth |

### Firebase Pricing Plans

#### Spark Plan (Free)
- ✅ Firebase Cloud Messaging: **Unlimited usage**
- ✅ Firebase Analytics: **Unlimited usage**
- ❌ No enterprise features (SAML, OIDC, RBAC)
- ❌ No BAA coverage for FCM

#### Blaze Plan (Pay-as-you-go)
- ✅ Firebase Cloud Messaging: **Still FREE**
- ✅ Access to Cloud Functions, Firestore
- ✅ Can sign BAA for covered services
- ❌ FCM still NOT covered under BAA

### Enterprise Considerations

While FCM is free, enterprises may need to invest in:

1. **Custom Development** (~$20K-50K)
   - Advanced user segmentation
   - Multi-language template systems
   - Complex timezone handling
   - Channel fallback mechanisms
   - Advanced analytics

2. **Identity Platform Add-on** ($0.0055/MAU)
   - Required for enterprise authentication with BAA
   - SAML/OIDC support
   - Role-based access control

3. **HIPAA-Compliant Alternatives**
   - OneSignal: $99-$1,999/month
   - AWS SNS with Pinpoint: Pay-per-message
   - Custom in-house solution: $100K+ development

### Total Cost Estimate for Medical Spa Platform

**Scenario: 5,000 active patients**

| Item | Monthly Cost |
|------|-------------|
| FCM Messages | $0 |
| Cloud Firestore (BAA) | ~$25 |
| Cloud Functions | ~$10 |
| Identity Platform (BAA) | ~$28 (5,000 × $0.0055) |
| **Total** | **~$63/month** |

Compare to alternatives:
- OneSignal Pro: $199/month
- AWS SNS + Pinpoint: ~$150/month
- Twilio Notify: ~$200/month

**Verdict:** FCM is the most cost-effective solution for non-PHI notifications.

---

## Integration Implementation

### Important: 2024 API Migration

**Legacy FCM APIs were deprecated on June 20, 2024.** All implementations must use:
- ✅ FCM HTTP v1 API
- ❌ ~~Legacy HTTP API~~
- ❌ ~~Legacy XMPP protocol~~

**Key Changes:**
- `sendToDevice()`, `sendToDeviceGroup()`, `sendAll()`, `sendMulticast()` → **Deprecated**
- Use `send()`, `sendEach()`, `sendEachAsync()`, `sendEachForMulticast()` instead

### 1. Node.js Backend Integration

#### Installation

```bash
npm install firebase-admin
```

#### Initialize Firebase Admin SDK

```javascript
// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';

// Download service account JSON from Firebase Console
const serviceAccount = require('./path/to/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const messaging = getMessaging();
```

#### Send Single Notification

```javascript
// src/services/notifications/fcm.ts
import { messaging } from '@/lib/firebase-admin';
import type { Message } from 'firebase-admin/messaging';

export async function sendAppointmentReminder(
  deviceToken: string,
  appointment: {
    patientName: string;
    dateTime: string;
    serviceName: string;
  }
) {
  const message: Message = {
    token: deviceToken,
    notification: {
      title: 'Appointment Reminder',
      body: `${appointment.serviceName} tomorrow at ${appointment.dateTime}`,
    },
    data: {
      type: 'appointment_reminder',
      appointmentId: appointment.id,
      // Never include PHI in data payload!
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
    android: {
      notification: {
        channelId: 'appointment_reminders',
        priority: 'high',
        sound: 'default',
      },
    },
  };

  try {
    const response = await messaging.send(message);
    console.log('Successfully sent message:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending message:', error);

    // Handle invalid token
    if (error.code === 'messaging/registration-token-not-registered') {
      // Remove token from database
      await removeDeviceToken(deviceToken);
    }

    return { success: false, error };
  }
}
```

#### Send to Multiple Devices (Batch)

```javascript
import { messaging } from '@/lib/firebase-admin';

export async function sendBatchNotifications(
  tokens: string[],
  notification: {
    title: string;
    body: string;
  }
) {
  // FCM allows up to 500 tokens per batch
  const batchSize = 500;
  const results = [];

  for (let i = 0; i < tokens.length; i += batchSize) {
    const batch = tokens.slice(i, i + batchSize);

    const messages = batch.map(token => ({
      token,
      notification,
      android: {
        notification: {
          channelId: 'general',
          priority: 'high',
        },
      },
    }));

    try {
      const response = await messaging.sendEach(messages);
      results.push(response);

      // Handle failures
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`Failed to send to token ${batch[idx]}:`, resp.error);

          // Remove invalid tokens
          if (resp.error?.code === 'messaging/registration-token-not-registered') {
            removeDeviceToken(batch[idx]);
          }
        }
      });
    } catch (error) {
      console.error('Batch send error:', error);
    }
  }

  return results;
}
```

#### Topic Subscription

```javascript
// Subscribe users to topics
export async function subscribeToTopic(tokens: string[], topic: string) {
  try {
    const response = await messaging.subscribeToTopic(tokens, topic);
    console.log('Successfully subscribed to topic:', response);
    return response;
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    throw error;
  }
}

// Unsubscribe from topic
export async function unsubscribeFromTopic(tokens: string[], topic: string) {
  try {
    const response = await messaging.unsubscribeFromTopic(tokens, topic);
    console.log('Successfully unsubscribed from topic:', response);
    return response;
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
    throw error;
  }
}

// Send to topic
export async function sendToTopic(topic: string, notification: any) {
  const message = {
    topic,
    notification,
  };

  try {
    const response = await messaging.send(message);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending to topic:', error);
    return { success: false, error };
  }
}
```

### 2. React Native Integration (Patient Mobile App)

#### Installation

```bash
# For Expo with development build
npx expo install @react-native-firebase/app @react-native-firebase/messaging

# Update app.json
```

#### Expo Configuration

```json
// app.json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/messaging"
    ],
    "android": {
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist",
      "useFrameworks": "static"
    }
  }
}
```

**Important:** React Native Firebase does NOT work in Expo Go. You must create a development build.

#### Request Permissions (iOS)

```typescript
// src/services/notifications/permissions.ts
import messaging from '@react-native-firebase/messaging';

export async function requestNotificationPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    return true;
  }

  return false;
}
```

#### Get Device Token

```typescript
// src/services/notifications/token.ts
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getFCMToken() {
  try {
    // Check if permission is granted
    const hasPermission = await messaging().hasPermission();
    if (!hasPermission) {
      const granted = await requestNotificationPermission();
      if (!granted) return null;
    }

    // Get FCM token
    const token = await messaging().getToken();
    console.log('FCM Token:', token);

    // Store token locally
    await AsyncStorage.setItem('fcm_token', token);

    // Send token to your backend
    await sendTokenToBackend(token);

    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

async function sendTokenToBackend(token: string) {
  try {
    await fetch('https://your-api.com/api/devices/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        platform: Platform.OS,
        userId: getCurrentUserId(),
      }),
    });
  } catch (error) {
    console.error('Error sending token to backend:', error);
  }
}
```

#### Listen for Token Refresh

```typescript
// src/services/notifications/listeners.ts
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';

export function useTokenRefreshListener() {
  useEffect(() => {
    // Token refresh listener
    const unsubscribe = messaging().onTokenRefresh(async (token) => {
      console.log('Token refreshed:', token);
      await sendTokenToBackend(token);
    });

    return unsubscribe;
  }, []);
}
```

#### Handle Foreground Messages

```typescript
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';

export function useForegroundMessageListener() {
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message:', remoteMessage);

      // Display custom notification
      if (remoteMessage.notification) {
        Alert.alert(
          remoteMessage.notification.title || 'Notification',
          remoteMessage.notification.body || ''
        );
      }

      // Handle data payload
      if (remoteMessage.data) {
        handleNotificationData(remoteMessage.data);
      }
    });

    return unsubscribe;
  }, []);
}

function handleNotificationData(data: any) {
  switch (data.type) {
    case 'appointment_reminder':
      // Navigate to appointment details
      navigation.navigate('AppointmentDetail', { id: data.appointmentId });
      break;
    case 'message_received':
      // Navigate to messages
      navigation.navigate('Messages');
      break;
    default:
      console.log('Unknown notification type:', data.type);
  }
}
```

#### Handle Background/Quit Messages

```typescript
import messaging from '@react-native-firebase/messaging';

// Register background handler (must be outside component)
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Background message:', remoteMessage);

  // Process notification
  if (remoteMessage.data) {
    // Sync data, update local storage, etc.
    await syncAppointments(remoteMessage.data.appointmentId);
  }
});

// Handle notification opened app (from background/quit state)
export function useNotificationOpenedListener() {
  useEffect(() => {
    // Notification caused app to open from background state
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app (background):', remoteMessage);
      handleNotificationNavigation(remoteMessage);
    });

    // Check if notification opened app from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification opened app (quit):', remoteMessage);
          handleNotificationNavigation(remoteMessage);
        }
      });
  }, []);
}

function handleNotificationNavigation(remoteMessage: any) {
  if (remoteMessage.data?.appointmentId) {
    navigation.navigate('AppointmentDetail', {
      id: remoteMessage.data.appointmentId,
    });
  }
}
```

### 3. Web Push Integration (Patient Portal)

#### Service Worker Setup

Create `public/firebase-messaging-sw.js`:

```javascript
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
    badge: '/badge.png',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  event.notification.close();

  // Navigate to specific page
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});
```

#### React Client Setup

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Get VAPID key from Firebase Console > Project Settings > Cloud Messaging
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted');

      // Register service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

      // Get token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      console.log('FCM Token:', token);

      // Send to backend
      await fetch('/api/devices/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, platform: 'web' }),
      });

      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
}

// Listen for foreground messages
export function setupForegroundMessageListener(callback: (payload: any) => void) {
  onMessage(messaging, (payload) => {
    console.log('Foreground message:', payload);
    callback(payload);
  });
}
```

#### React Component Usage

```typescript
// src/components/NotificationSetup.tsx
import { useEffect } from 'react';
import { requestNotificationPermission, setupForegroundMessageListener } from '@/lib/firebase';

export function NotificationSetup() {
  useEffect(() => {
    // Request permission on mount
    requestNotificationPermission();

    // Listen for foreground messages
    setupForegroundMessageListener((payload) => {
      // Show custom notification
      if (payload.notification) {
        const notification = new Notification(payload.notification.title, {
          body: payload.notification.body,
          icon: '/logo192.png',
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    });
  }, []);

  return null; // This is a headless component
}
```

### 4. Database Schema for Token Management

```sql
-- PostgreSQL schema for device tokens
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_id TEXT,
  app_version TEXT,
  os_version TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  INDEX idx_active (is_active)
);

-- Notification preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  appointment_reminders BOOLEAN DEFAULT true,
  treatment_updates BOOLEAN DEFAULT true,
  promotional_messages BOOLEAN DEFAULT false,
  waitlist_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Notification logs
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  device_token_id UUID REFERENCES device_tokens(id) ON DELETE SET NULL,
  message_id TEXT,
  notification_type VARCHAR(50) NOT NULL,
  title TEXT,
  body TEXT,
  data JSONB,
  status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'delivered', 'failed', 'opened')),
  error_message TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP
);
```

---

## Reliability & Performance

### Delivery Rates

#### Expected Performance
- **Well-maintained apps:** ~85% delivery rate
- **Poorly-maintained apps:** ~65% delivery rate
- **Main cause of drops:** Inactive devices (15% of messages)

#### Message Statuses

FCM messages can have 7 different statuses:

1. **Delivered (No Delay)** - Successfully delivered immediately
2. **Delivered (Delayed)** - Delivered after device came online
3. **Pending** - Queued, waiting for device to reconnect (up to 28 days)
4. **Dropped (Device Inactive)** - Device offline for >28 days
5. **Dropped (Too Many Pending)** - Exceeded 100 pending messages per device
6. **Dropped (TTL Expired)** - Message time-to-live expired
7. **Failed (Invalid Token)** - Token no longer valid

### Latency Considerations

#### Topic Messaging
- Optimized for **throughput**, not latency
- Can have delays during fanout to millions of users
- Use direct token messaging for time-sensitive notifications

#### Direct Token Messaging
- Fast, secure delivery to single devices or small groups
- Typical latency: <1 second for online devices
- Recommended for appointment reminders, urgent alerts

### Rate Limits

| Operation | Limit |
|-----------|-------|
| Concurrent fanouts per project | 1,000 |
| Typical QPS (queries per second) | 10,000 (not guaranteed) |
| Batch size (sendEach) | 500 tokens |
| Pending messages per device | 100 |
| Message storage duration | 28 days |
| Topic subscriptions per batch | 1,000 tokens |

### Best Practices for Reliability

#### 1. Token Management
```javascript
// Implement monthly token refresh
async function refreshTokenMonthly() {
  const lastRefresh = await AsyncStorage.getItem('last_token_refresh');
  const daysSinceRefresh = (Date.now() - parseInt(lastRefresh)) / (1000 * 60 * 60 * 24);

  if (daysSinceRefresh > 30) {
    const newToken = await messaging().getToken();
    await sendTokenToBackend(newToken);
    await AsyncStorage.setItem('last_token_refresh', Date.now().toString());
  }
}
```

#### 2. Handle Invalid Tokens
```javascript
async function sendNotificationWithRetry(token, message) {
  try {
    const response = await messaging.send({ token, ...message });
    return { success: true, messageId: response };
  } catch (error) {
    if (error.code === 'messaging/registration-token-not-registered') {
      // Remove invalid token from database
      await db.query('DELETE FROM device_tokens WHERE token = $1', [token]);
      console.log('Removed invalid token:', token);
    } else if (error.code === 'messaging/internal-error') {
      // Retry with exponential backoff
      await sleep(1000 * Math.pow(2, retryCount));
      return sendNotificationWithRetry(token, message, retryCount + 1);
    }
    return { success: false, error };
  }
}
```

#### 3. Exponential Backoff for Errors
```javascript
async function sendWithBackoff(message, maxRetries = 3) {
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await messaging.send(message);
      return { success: true, response };
    } catch (error) {
      if (error.code === 'messaging/internal-error' || error.code === 'messaging/server-unavailable') {
        retryCount++;
        const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 60000); // Max 60s
        const jitter = Math.random() * 1000; // Add jitter
        await sleep(backoffMs + jitter);
      } else {
        // Non-retryable error
        return { success: false, error };
      }
    }
  }

  return { success: false, error: 'Max retries exceeded' };
}
```

#### 4. Message Collapsing
```javascript
// Use collapse_key to replace old messages with new ones
const message = {
  token: deviceToken,
  notification: {
    title: 'New Messages',
    body: 'You have 5 unread messages',
  },
  android: {
    collapseKey: 'unread_messages', // Only newest message delivered if offline
  },
};
```

### Production Issues & Incidents

#### Historical Reliability
- Firebase Status Dashboard tracks service disruptions
- Notable incidents in 2024:
  - May 9, 2024: Web push notification issue (7:10 AM - 12:02 PM PT)
  - Periodic high latency incidents (tracked on status dashboard)

#### Monitoring Service Health
- **Status Dashboard:** https://status.firebase.google.com/cloud-messaging/
- Subscribe to status updates
- Implement fallback mechanisms for critical notifications

### Known Limitations

#### Platform Limitations
1. **Android Emulators:** Push notifications not supported
2. **iOS Simulators:** Push notifications not supported
3. **Safari (iOS):**
   - Does not honor notification tag replacement
   - Notifications pile up instead of replacing
   - Must show notification on every push or permissions revoked

4. **Deliverability Issues:**
   - Many businesses experience 30-50% delivery rates without optimization
   - CPaaS providers that rely solely on FCM often see delays/blocks
   - Platform-optimized services (APNs for iOS, Mi Push for Xiaomi) perform better

#### Best Practice Solutions
- For iOS: Consider direct APNs integration for critical messages
- For Android: Use FCM (native Google Play Services integration)
- For Xiaomi/Huawei: Consider manufacturer-specific push services
- Implement multi-channel strategy for mission-critical notifications

---

## HIPAA Compliance & Healthcare Considerations

### Critical Finding: FCM is NOT HIPAA Compliant

#### What's Covered Under Google Cloud BAA

✅ **HIPAA-Compliant Services:**
- Cloud Firestore
- Cloud Storage
- Cloud Functions
- Cloud SQL
- Identity Platform (for authentication)

❌ **NOT Covered (Cannot Store/Transmit PHI):**
- Firebase Cloud Messaging (FCM)
- Firebase Realtime Database
- Firebase Authentication
- Crashlytics
- Firebase Analytics

### Google's Official Stance

> "Google makes no representations that Firebase services satisfy HIPAA requirements. Firebase is not intended to be used for protected health information (PHI)."

**Source:** Firebase Privacy & Security documentation

### Legal Requirements

#### Business Associate Agreement (BAA)
- Google Cloud offers BAA for covered services only
- To sign a BAA:
  1. Must be a Google Cloud customer
  2. Follow instructions at: Privacy compliance and records for Google Cloud
  3. Only use covered products with PHI
  4. Disable or avoid non-covered services for PHI

#### Shared Security Model
- **Google's Responsibility:** Secure and compliant infrastructure
- **Customer's Responsibility:** Proper configuration and application security
- You must ensure your environment meets HIPAA requirements

### HIPAA-Compliant Notification Strategy

#### ✅ CORRECT: Generic Notifications Only

```javascript
// GOOD: No PHI in notification
const message = {
  token: deviceToken,
  notification: {
    title: 'Appointment Reminder',
    body: 'You have an upcoming appointment tomorrow',
  },
  data: {
    type: 'appointment_reminder',
    appointmentId: '12345', // ID only, no PHI
  },
};

// When user opens notification, app fetches details from HIPAA-compliant API
async function handleNotificationClick(appointmentId) {
  // Fetch from Cloud Firestore (covered by BAA)
  const appointment = await db.collection('appointments').doc(appointmentId).get();
  // Display full details including PHI in app
}
```

#### ❌ INCORRECT: PHI in Notification

```javascript
// BAD: Contains PHI
const message = {
  notification: {
    title: 'Appointment Reminder',
    body: 'Botox treatment tomorrow at 2pm with Dr. Smith', // PHI!
  },
  data: {
    patientName: 'Jane Doe', // PHI!
    diagnosis: 'Hyperhidrosis', // PHI!
    treatmentNotes: 'Patient requested forehead lines reduction', // PHI!
  },
};
```

### What Constitutes PHI in Medical Spa Context

Protected Health Information (PHI) includes:

1. **Patient Identifiers:**
   - Name, address, phone, email
   - Social Security Number
   - Medical record numbers

2. **Health Information:**
   - Treatment types (Botox, fillers, laser treatments)
   - Diagnoses or conditions
   - Treatment notes or outcomes
   - Before/after photos
   - Prescriptions or medications

3. **Appointment Details (when combined with patient identity):**
   - Specific treatment names
   - Provider names
   - Treatment areas (face, body parts)

4. **Billing Information:**
   - Insurance details
   - Payment methods
   - Treatment costs

### Acceptable Notification Content

✅ **Safe to Include:**
- Generic appointment reminders (no treatment specifics)
- "You have a new message" (no message content)
- "Your appointment is confirmed" (no details)
- "Please check in for your appointment"
- "Your results are ready to view"

❌ **Never Include:**
- Patient names
- Treatment types
- Diagnoses or medical conditions
- Provider names
- Specific appointment times with treatment context
- Any clinical notes or outcomes

### Implementation Architecture for HIPAA Compliance

```
┌─────────────────────────────────────────────────────────────┐
│                      Medical Spa Platform                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────┐         ┌────────────────────────┐ │
│  │  FCM (NO PHI)       │         │  Cloud Firestore       │ │
│  │  ----------------   │         │  (HIPAA-Compliant)     │ │
│  │  • Generic alerts   │         │  --------------------  │ │
│  │  • IDs only         │         │  • Patient records     │ │
│  │  • No treatment     │         │  • Appointments (full) │ │
│  │    details          │         │  • Treatment notes     │ │
│  └─────────────────────┘         │  • Clinical data       │ │
│           │                       │  • Signed BAA ✓        │ │
│           │                       └────────────────────────┘ │
│           ▼                                   ▲               │
│  ┌─────────────────────┐                     │               │
│  │  Mobile/Web App     │─────────────────────┘               │
│  │  ----------------   │  Fetch PHI via secure API           │
│  │  • Receives generic │  (after authentication)             │
│  │    notification     │                                     │
│  │  • Fetches PHI from │                                     │
│  │    Firestore        │                                     │
│  └─────────────────────┘                                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### End-to-End Encryption Alternative

For maximum security, implement end-to-end encryption:

```javascript
// Example using a library like Virgil Security
import { VirgilCrypto, VirgilCardCrypto } from 'virgil-crypto';

// Encrypt PHI on client before storing
async function encryptPHI(phi: any, recipientPublicKey: string) {
  const crypto = new VirgilCrypto();
  const encrypted = await crypto.encrypt(JSON.stringify(phi), recipientPublicKey);
  return encrypted.toString('base64');
}

// Store encrypted data in Firestore
await db.collection('appointments').doc(id).set({
  id: '12345',
  patientId: 'encrypted_patient_id',
  encryptedData: encryptedPHI, // PHI encrypted client-side
  createdAt: serverTimestamp(),
});

// Decrypt on client after retrieval
async function decryptPHI(encryptedData: string, privateKey: string) {
  const crypto = new VirgilCrypto();
  const decrypted = await crypto.decrypt(encryptedData, privateKey);
  return JSON.parse(decrypted.toString());
}
```

### HIPAA-Compliant Alternatives to FCM

If you need to send PHI in push notifications:

1. **AWS Amplify + SNS**
   - AWS offers BAA for SNS
   - More expensive (~$150/month)
   - Full HIPAA compliance

2. **Twilio Notify**
   - HIPAA-eligible service
   - ~$200/month
   - Supports SMS, push, email

3. **OneSignal Enterprise**
   - HIPAA-compliant tier available
   - $1,999/month
   - Advanced segmentation

4. **Custom In-House Solution**
   - Full control over data
   - $100K+ development cost
   - Ongoing maintenance required

### Recommended Approach for Medical Spa Platform

**Use FCM with Generic Notifications + HIPAA-Compliant Data Storage**

**Benefits:**
- ✅ Free FCM for notifications
- ✅ HIPAA compliance via Firestore/Cloud Storage
- ✅ Best user experience (native push)
- ✅ Lowest cost (~$63/month vs $200-2000/month)
- ✅ Industry-standard practice

**Implementation:**
1. Send generic notifications via FCM
2. Store all PHI in Cloud Firestore (with signed BAA)
3. Use Identity Platform for authentication (with signed BAA)
4. Implement secure API to fetch PHI after user authentication
5. Encrypt PHI at rest and in transit
6. Audit all access to PHI

---

## Best Practices for Medical Spa Platform

### 1. Notification Strategy

#### Appointment Reminders
```javascript
// 24 hours before appointment
await sendNotification({
  title: 'Appointment Reminder',
  body: 'You have an appointment tomorrow',
  data: { type: 'appointment_reminder', appointmentId: '12345' },
  channelId: 'appointment_reminders',
});

// 1 hour before appointment
await sendNotification({
  title: 'Upcoming Appointment',
  body: 'Your appointment starts in 1 hour',
  data: { type: 'appointment_reminder', appointmentId: '12345' },
  channelId: 'appointment_reminders',
  priority: 'high',
});
```

#### Treatment Updates
```javascript
await sendNotification({
  title: 'Treatment Complete',
  body: 'Your treatment notes are ready to view',
  data: { type: 'treatment_update', chartId: '67890' },
  channelId: 'treatment_updates',
});
```

#### Waitlist Notifications
```javascript
await sendNotification({
  title: 'Waitlist Opening',
  body: 'An appointment slot is now available',
  data: { type: 'waitlist_opening', slotId: '54321' },
  channelId: 'waitlist_notifications',
  priority: 'high',
  android: {
    ttl: 3600, // 1 hour expiry
  },
});
```

#### Promotional Messages (Opt-In)
```javascript
// Only send to users who opted in
const optedInUsers = await getOptedInUsers();
await sendToTopic('promotions', {
  title: 'Special Offer',
  body: 'Save 20% on select treatments this week',
  data: { type: 'promotion', promoId: '111' },
  channelId: 'promotions',
});
```

### 2. Token Management

#### Token Registration Flow
```typescript
// src/services/notifications/token-manager.ts

export class TokenManager {
  async registerDeviceToken(userId: string, token: string, platform: string) {
    // Check if token already exists
    const existing = await db.query(
      'SELECT * FROM device_tokens WHERE token = $1',
      [token]
    );

    if (existing.rows.length > 0) {
      // Update last_used_at
      await db.query(
        'UPDATE device_tokens SET last_used_at = NOW(), is_active = true WHERE token = $1',
        [token]
      );
      return existing.rows[0];
    }

    // Insert new token
    const result = await db.query(
      `INSERT INTO device_tokens
       (user_id, token, platform, device_id, app_version, os_version)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, token, platform, deviceId, appVersion, osVersion]
    );

    // Subscribe to default topics
    await messaging.subscribeToTopic([token], 'all-users');

    // Subscribe based on user preferences
    const prefs = await getUserNotificationPreferences(userId);
    if (prefs.appointment_reminders) {
      await messaging.subscribeToTopic([token], 'appointment-reminders');
    }

    return result.rows[0];
  }

  async removeDeviceToken(token: string) {
    // Unsubscribe from all topics
    const topics = ['all-users', 'appointment-reminders', 'promotions', 'waitlist-notifications'];
    for (const topic of topics) {
      try {
        await messaging.unsubscribeFromTopic([token], topic);
      } catch (error) {
        console.error(`Failed to unsubscribe from ${topic}:`, error);
      }
    }

    // Soft delete (mark as inactive)
    await db.query(
      'UPDATE device_tokens SET is_active = false WHERE token = $1',
      [token]
    );
  }

  async cleanupStaleTokens() {
    // Remove tokens inactive for 270 days (Google's new policy)
    const result = await db.query(
      `UPDATE device_tokens
       SET is_active = false
       WHERE last_used_at < NOW() - INTERVAL '270 days'
       AND is_active = true
       RETURNING token`
    );

    console.log(`Deactivated ${result.rowCount} stale tokens`);
    return result.rows.map(row => row.token);
  }

  async refreshToken(oldToken: string, newToken: string) {
    // Update token in database
    await db.query(
      'UPDATE device_tokens SET token = $1, updated_at = NOW() WHERE token = $2',
      [newToken, oldToken]
    );

    // Re-subscribe to topics
    const topics = await getSubscribedTopics(oldToken);
    for (const topic of topics) {
      await messaging.subscribeToTopic([newToken], topic);
      await messaging.unsubscribeFromTopic([oldToken], topic);
    }
  }
}
```

#### Scheduled Token Cleanup (Cron Job)
```typescript
// src/app/api/cron/cleanup-tokens/route.ts

export async function GET(request: Request) {
  const tokenManager = new TokenManager();

  // Run daily at 2 AM
  const staleTokens = await tokenManager.cleanupStaleTokens();

  return Response.json({
    success: true,
    tokensDeactivated: staleTokens.length,
  });
}
```

### 3. Notification Preferences

```typescript
// src/services/notifications/preferences.ts

export async function updateNotificationPreferences(
  userId: string,
  preferences: {
    appointment_reminders: boolean;
    treatment_updates: boolean;
    promotional_messages: boolean;
    waitlist_notifications: boolean;
  }
) {
  // Update database
  await db.query(
    `INSERT INTO notification_preferences (user_id, appointment_reminders, treatment_updates, promotional_messages, waitlist_notifications)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id)
     DO UPDATE SET
       appointment_reminders = $2,
       treatment_updates = $3,
       promotional_messages = $4,
       waitlist_notifications = $5,
       updated_at = NOW()`,
    [
      userId,
      preferences.appointment_reminders,
      preferences.treatment_updates,
      preferences.promotional_messages,
      preferences.waitlist_notifications,
    ]
  );

  // Update topic subscriptions
  const userTokens = await getUserDeviceTokens(userId);

  for (const token of userTokens) {
    if (preferences.appointment_reminders) {
      await messaging.subscribeToTopic([token], 'appointment-reminders');
    } else {
      await messaging.unsubscribeFromTopic([token], 'appointment-reminders');
    }

    if (preferences.promotional_messages) {
      await messaging.subscribeToTopic([token], 'promotions');
    } else {
      await messaging.unsubscribeFromTopic([token], 'promotions');
    }

    if (preferences.waitlist_notifications) {
      await messaging.subscribeToTopic([token], 'waitlist-notifications');
    } else {
      await messaging.unsubscribeFromTopic([token], 'waitlist-notifications');
    }
  }
}
```

### 4. Notification Templates

```typescript
// src/services/notifications/templates.ts

export const NotificationTemplates = {
  appointmentReminder24h: (appointmentTime: string) => ({
    title: 'Appointment Reminder',
    body: `Your appointment is tomorrow at ${appointmentTime}`,
    channelId: 'appointment_reminders',
    priority: 'default' as const,
  }),

  appointmentReminder1h: () => ({
    title: 'Upcoming Appointment',
    body: 'Your appointment starts in 1 hour',
    channelId: 'appointment_reminders',
    priority: 'high' as const,
  }),

  appointmentConfirmed: () => ({
    title: 'Appointment Confirmed',
    body: 'Your appointment has been confirmed',
    channelId: 'appointment_reminders',
    priority: 'default' as const,
  }),

  appointmentCancelled: () => ({
    title: 'Appointment Cancelled',
    body: 'Your appointment has been cancelled',
    channelId: 'appointment_reminders',
    priority: 'high' as const,
  }),

  treatmentComplete: () => ({
    title: 'Treatment Complete',
    body: 'Your treatment notes are ready to view',
    channelId: 'treatment_updates',
    priority: 'default' as const,
  }),

  waitlistOpening: (timeSlot: string) => ({
    title: 'Appointment Available',
    body: `An opening is available for ${timeSlot}`,
    channelId: 'waitlist_notifications',
    priority: 'high' as const,
    android: {
      ttl: 3600, // 1 hour
    },
  }),

  messageReceived: (fromName: string) => ({
    title: 'New Message',
    body: 'You have a new message from your provider',
    channelId: 'messages',
    priority: 'high' as const,
  }),

  promotion: (title: string, body: string) => ({
    title,
    body,
    channelId: 'promotions',
    priority: 'default' as const,
  }),
};
```

### 5. Error Handling & Logging

```typescript
// src/services/notifications/sender.ts

export async function sendNotificationWithLogging(
  userId: string,
  template: any,
  data: any
) {
  const userTokens = await getUserActiveDeviceTokens(userId);

  if (userTokens.length === 0) {
    console.warn(`No active tokens for user ${userId}`);
    return { success: false, reason: 'no_tokens' };
  }

  const results = [];

  for (const tokenData of userTokens) {
    const message = {
      token: tokenData.token,
      notification: {
        title: template.title,
        body: template.body,
      },
      data,
      android: {
        notification: {
          channelId: template.channelId,
          priority: template.priority,
        },
        ...template.android,
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    try {
      const response = await messaging.send(message);

      // Log success
      await db.query(
        `INSERT INTO notification_logs
         (user_id, device_token_id, message_id, notification_type, title, body, data, status, sent_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'sent', NOW())`,
        [userId, tokenData.id, response, template.channelId, template.title, template.body, data]
      );

      results.push({ success: true, messageId: response, platform: tokenData.platform });
    } catch (error: any) {
      console.error(`Failed to send to token ${tokenData.token}:`, error);

      // Log failure
      await db.query(
        `INSERT INTO notification_logs
         (user_id, device_token_id, notification_type, title, body, data, status, error_message, sent_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'failed', $7, NOW())`,
        [userId, tokenData.id, template.channelId, template.title, template.body, data, error.message]
      );

      // Handle specific errors
      if (error.code === 'messaging/registration-token-not-registered') {
        await new TokenManager().removeDeviceToken(tokenData.token);
      }

      results.push({ success: false, error: error.message, platform: tokenData.platform });
    }
  }

  return {
    success: results.some(r => r.success),
    results,
  };
}
```

### 6. Testing Strategy

```typescript
// src/__tests__/notifications/fcm.test.ts

describe('FCM Notifications', () => {
  it('should send appointment reminder', async () => {
    const result = await sendNotificationWithLogging(
      'user-123',
      NotificationTemplates.appointmentReminder24h('2:00 PM'),
      { appointmentId: 'appt-456' }
    );

    expect(result.success).toBe(true);
    expect(result.results[0].messageId).toBeDefined();
  });

  it('should handle invalid token', async () => {
    // Mock invalid token error
    jest.spyOn(messaging, 'send').mockRejectedValue({
      code: 'messaging/registration-token-not-registered',
    });

    const result = await sendNotificationWithLogging(
      'user-123',
      NotificationTemplates.appointmentReminder24h('2:00 PM'),
      { appointmentId: 'appt-456' }
    );

    expect(result.success).toBe(false);

    // Verify token was removed
    const tokens = await getUserActiveDeviceTokens('user-123');
    expect(tokens.length).toBe(0);
  });

  it('should respect user preferences', async () => {
    await updateNotificationPreferences('user-123', {
      appointment_reminders: false,
      treatment_updates: true,
      promotional_messages: false,
      waitlist_notifications: true,
    });

    // Appointment reminder should not be sent
    const result1 = await sendNotificationIfAllowed(
      'user-123',
      'appointment_reminders',
      NotificationTemplates.appointmentReminder24h('2:00 PM'),
      {}
    );
    expect(result1.sent).toBe(false);

    // Treatment update should be sent
    const result2 = await sendNotificationIfAllowed(
      'user-123',
      'treatment_updates',
      NotificationTemplates.treatmentComplete(),
      {}
    );
    expect(result2.sent).toBe(true);
  });
});
```

---

## Implementation Roadmap

### Phase 1: Backend Setup (Week 1)

**Tasks:**
- [ ] Create Firebase project in console
- [ ] Download service account JSON
- [ ] Install `firebase-admin` SDK
- [ ] Initialize Firebase Admin in backend
- [ ] Create database schema for device tokens
- [ ] Implement token registration API endpoint
- [ ] Implement token removal API endpoint
- [ ] Set up environment variables

**Deliverables:**
- `/api/devices/register` endpoint
- `/api/devices/remove` endpoint
- Database tables created

### Phase 2: Mobile App Integration (Week 2)

**Tasks:**
- [ ] Install React Native Firebase packages
- [ ] Configure Expo app.json for FCM
- [ ] Download `google-services.json` (Android)
- [ ] Download `GoogleService-Info.plist` (iOS)
- [ ] Create development build (FCM doesn't work in Expo Go)
- [ ] Implement permission request flow
- [ ] Implement token retrieval
- [ ] Implement token refresh listener
- [ ] Handle foreground messages
- [ ] Handle background messages
- [ ] Handle notification tap navigation

**Deliverables:**
- Working push notifications on iOS and Android
- Token synced with backend
- Navigation working from notifications

### Phase 3: Web App Integration (Week 3)

**Tasks:**
- [ ] Generate VAPID keys in Firebase Console
- [ ] Create `firebase-messaging-sw.js` service worker
- [ ] Implement web push permission request
- [ ] Implement token retrieval
- [ ] Handle foreground messages
- [ ] Handle notification clicks
- [ ] Test on Chrome, Firefox, Edge

**Deliverables:**
- Working web push on desktop browsers
- Service worker registered correctly

### Phase 4: Notification Types (Week 4)

**Tasks:**
- [ ] Implement appointment reminder notifications
- [ ] Implement treatment update notifications
- [ ] Implement waitlist opening notifications
- [ ] Implement messaging notifications
- [ ] Create notification templates
- [ ] Set up notification channels (Android)
- [ ] Implement user preferences UI
- [ ] Implement topic subscriptions

**Deliverables:**
- All notification types working
- User can manage preferences

### Phase 5: HIPAA Compliance (Week 5)

**Tasks:**
- [ ] Audit all notification content for PHI
- [ ] Remove any PHI from notification payloads
- [ ] Implement generic notification wording
- [ ] Set up Cloud Firestore with BAA
- [ ] Implement secure API for fetching PHI
- [ ] Sign Google Cloud BAA
- [ ] Document HIPAA compliance strategy
- [ ] Train staff on PHI handling

**Deliverables:**
- No PHI in FCM notifications
- BAA signed with Google
- Compliance documentation

### Phase 6: Monitoring & Analytics (Week 6)

**Tasks:**
- [ ] Implement notification logging
- [ ] Create analytics dashboard
- [ ] Set up FCM Aggregated Delivery Data API
- [ ] Integrate BigQuery export (optional)
- [ ] Create delivery rate reports
- [ ] Set up error alerting
- [ ] Monitor Firebase Status Dashboard

**Deliverables:**
- Notification analytics dashboard
- Delivery rate tracking
- Error monitoring

### Phase 7: Optimization (Week 7-8)

**Tasks:**
- [ ] Implement token cleanup cron job
- [ ] Optimize message batching
- [ ] Implement retry logic with exponential backoff
- [ ] Add message collapsing for similar notifications
- [ ] Implement rate limiting
- [ ] Test at scale (simulate 10K+ users)
- [ ] Performance tuning

**Deliverables:**
- Optimized for production scale
- <1s latency for individual messages
- >85% delivery rate

---

## Monitoring & Analytics

### 1. Firebase Console Reports

**Location:** Firebase Console > Cloud Messaging > Reports

**Available Metrics:**
- Messages Sent (total enqueued)
- Messages Delivered (received on device)
- Messages Opened (user tapped notification)
- Message Errors (failed deliveries)

**Limitations:**
- Delay up to 24 hours for data
- Only Android SDK 18.0.1+ provides "Received" data
- iOS data limited

### 2. FCM Aggregated Delivery Data API

**Access:** FCM Data API

**Data Provided:**
- Daily reports for Android
- Percentage of messages delivered
- Reasons for delays/drops
- Device state analysis

**Usage:**
```javascript
// Add analytics labels to track specific campaigns
const message = {
  token: deviceToken,
  notification: {
    title: 'Special Offer',
    body: 'Save 20% this week',
  },
  fcmOptions: {
    analyticsLabel: 'summer_promotion_2024',
  },
};

// Later, query aggregated data for this label
const deliveryData = await fcmDataApi.getDeliveryData('summer_promotion_2024');
```

### 3. BigQuery Export

**Setup:**
1. Enable BigQuery export in Firebase Console
2. Link Firebase project to Google Cloud project
3. Configure export settings

**Benefits:**
- Individual message logs
- Custom queries and analysis
- Long-term data storage
- Integration with BI tools

**Example Query:**
```sql
SELECT
  notification_type,
  platform,
  COUNT(*) as total_sent,
  SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
  SUM(CASE WHEN status = 'opened' THEN 1 ELSE 0 END) as opened,
  (SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as delivery_rate,
  (SUM(CASE WHEN status = 'opened' THEN 1 ELSE 0 END) * 100.0 / SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)) as open_rate
FROM notification_logs
WHERE sent_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
GROUP BY notification_type, platform
ORDER BY total_sent DESC;
```

### 4. Custom Analytics Dashboard

```typescript
// src/app/api/analytics/notifications/route.ts

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  // Delivery rates by notification type
  const deliveryRates = await db.query(`
    SELECT
      notification_type,
      COUNT(*) as total_sent,
      SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
      SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
      (SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as delivery_rate
    FROM notification_logs
    WHERE sent_at BETWEEN $1 AND $2
    GROUP BY notification_type
  `, [startDate, endDate]);

  // Platform breakdown
  const platformStats = await db.query(`
    SELECT
      dt.platform,
      COUNT(nl.*) as total_notifications,
      SUM(CASE WHEN nl.status = 'delivered' THEN 1 ELSE 0 END) as delivered
    FROM notification_logs nl
    JOIN device_tokens dt ON nl.device_token_id = dt.id
    WHERE nl.sent_at BETWEEN $1 AND $2
    GROUP BY dt.platform
  `, [startDate, endDate]);

  // Top errors
  const topErrors = await db.query(`
    SELECT
      error_message,
      COUNT(*) as count
    FROM notification_logs
    WHERE status = 'failed' AND sent_at BETWEEN $1 AND $2
    GROUP BY error_message
    ORDER BY count DESC
    LIMIT 10
  `, [startDate, endDate]);

  return Response.json({
    deliveryRates: deliveryRates.rows,
    platformStats: platformStats.rows,
    topErrors: topErrors.rows,
  });
}
```

### 5. Key Metrics to Track

| Metric | Target | Action if Below Target |
|--------|--------|------------------------|
| Delivery Rate | >85% | Review token management, clean stale tokens |
| Open Rate | >20% | Improve notification copy, timing |
| Error Rate | <5% | Investigate error messages, fix integration issues |
| Token Refresh Rate | Daily | Ensure onTokenRefresh listener working |
| Stale Token % | <15% | Implement monthly token refresh |

### 6. Alerting Setup

```typescript
// src/services/notifications/monitoring.ts

export async function checkNotificationHealth() {
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const stats = await db.query(`
    SELECT
      COUNT(*) as total_sent,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
      (SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as error_rate
    FROM notification_logs
    WHERE sent_at > $1
  `, [last24h]);

  const errorRate = parseFloat(stats.rows[0].error_rate);

  // Alert if error rate > 10%
  if (errorRate > 10) {
    await sendAlertToStaff({
      title: 'High Notification Error Rate',
      body: `Error rate is ${errorRate.toFixed(2)}% in the last 24 hours`,
      severity: 'high',
    });
  }

  // Alert if no notifications sent (possible outage)
  if (stats.rows[0].total_sent === '0') {
    await sendAlertToStaff({
      title: 'No Notifications Sent',
      body: 'No notifications have been sent in the last 24 hours',
      severity: 'critical',
    });
  }
}

// Run every hour
setInterval(checkNotificationHealth, 60 * 60 * 1000);
```

---

## References

### Official Documentation
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Admin Node.js SDK](https://firebase.google.com/docs/admin/setup)
- [React Native Firebase - Messaging](https://rnfirebase.io/messaging/usage)
- [Expo Push Notifications](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [HIPAA Compliance on Google Cloud](https://cloud.google.com/security/compliance/hipaa)

### Key Articles
- [Send FCM Push Notification from Node.js using Firebase Cloud Messaging (FCM) HTTP V1–2025](https://medium.com/@rhythm6194/send-fcm-push-notification-in-node-js-using-firebase-cloud-messaging-fcm-http-v1-2024-448c0d921fff)
- [Understanding FCM Message Delivery on Android](https://firebase.blog/posts/2024/07/understand-fcm-delivery-rates/)
- [Managing Cloud Messaging Tokens](https://firebase.blog/posts/2023/04/managing-cloud-messaging-tokens/)
- [Best practices for FCM registration token management](https://firebase.google.com/docs/cloud-messaging/manage-tokens)
- [Best practices when sending FCM messages at scale](https://firebase.google.com/docs/cloud-messaging/scale-fcm)

### Pricing & Alternatives
- [Firebase Pricing](https://firebase.google.com/pricing)
- [Google Cloud Firebase Pricing 2025](https://tekpon.com/software/firebase/pricing/)
- [Firebase Pricing Explained](https://supertokens.com/blog/firebase-pricing)
- [Firebase Cloud Messaging Alternatives for Enterprises](https://www.engagelab.com/blog/firebase-cloud-messaging)

### HIPAA & Healthcare
- [Is Firebase HIPAA Compliant?](https://www.blaze.tech/post/is-firebase-hipaa-compliant)
- [Firebase HIPAA Compliance Guide](https://impanix.com/hipaa/is-firebase-hipaa-compliant/)
- [HOW TO BUILD HIPAA-COMPLIANT HEALTHCARE CHAT](https://virgilsecurity.com/firebase-whitepaper)
- [Identity Platform: HIPAA Implementation Guide](https://cloud.google.com/security/compliance/hipaa/identity-platform)

### Integration Guides
- [FCM Integration with NodeJs using firebase-admin](https://dev.to/iamsujit/fcm-integration-with-nodejs-using-firebase-admin-3j0d)
- [How to Integrate Firebase Cloud Messaging with Expo](https://www.magicbell.com/blog/how-to-integrate-firebase-cloud-messaging-with-expo)
- [Web Push Notifications with React and Firebase Cloud Messaging](https://dev.to/emmanuelayinde/web-push-notifications-with-react-and-firebase-cloud-messaging-fcm-18kb)
- [Send notifications with FCM and APNs - Expo](https://docs.expo.dev/push-notifications/sending-notifications-custom/)

### Reliability & Monitoring
- [Firebase Cloud Messaging Status Dashboard](https://status.firebase.google.com/cloud-messaging/)
- [Understanding message delivery](https://firebase.google.com/docs/cloud-messaging/understand-delivery)
- [How to monitor Firebase Cloud Messaging delivery statistics](https://bootstrapped.app/guide/how-to-monitor-firebase-cloud-messaging-delivery-statistics)
- [What is FCM Aggregated Delivery Data?](https://medium.com/firebase-developers/what-is-fcm-aggregated-delivery-data-d6d68396b83b)

### Comparisons
- [Apple Push Notification vs Firebase FCM](https://www.courier.com/integrations/compare/apple-push-notification-vs-firebase-fcm)
- [Push Notifications: APNs vs FCM Implementation](https://medium.com/@sohail_saifi/push-notifications-apns-vs-fcm-implementation-4da88987a297)
- [Firebase Cloud Messaging vs Firebase](https://ably.com/compare/fcm-vs-firebase)
- [Best Push Notification Service 2025](https://www.engagelab.com/blog/best-push-notification-service)

---

## Appendix: Quick Start Checklist

### Backend
- [ ] Firebase project created
- [ ] Service account JSON downloaded
- [ ] `firebase-admin` installed
- [ ] Firebase Admin initialized
- [ ] Database schema created
- [ ] Token registration API created
- [ ] Notification sending function created

### Mobile (React Native)
- [ ] `@react-native-firebase/app` installed
- [ ] `@react-native-firebase/messaging` installed
- [ ] app.json configured
- [ ] google-services.json added (Android)
- [ ] GoogleService-Info.plist added (iOS)
- [ ] Development build created
- [ ] Permission request implemented
- [ ] Token retrieval implemented
- [ ] Foreground handler implemented
- [ ] Background handler implemented
- [ ] Notification tap navigation working

### Web
- [ ] VAPID keys generated
- [ ] firebase-messaging-sw.js created
- [ ] Service worker registered
- [ ] Permission request implemented
- [ ] Token retrieval implemented
- [ ] Foreground handler implemented
- [ ] Notification click handler implemented

### HIPAA Compliance
- [ ] Audit completed - no PHI in notifications
- [ ] Cloud Firestore set up with BAA
- [ ] Google Cloud BAA signed
- [ ] Secure API for PHI retrieval created
- [ ] Staff trained on PHI handling
- [ ] Compliance documentation completed

### Monitoring
- [ ] Notification logging implemented
- [ ] Analytics dashboard created
- [ ] Error alerting set up
- [ ] Token cleanup cron job scheduled
- [ ] Firebase Status Dashboard bookmarked

---

**Document Version:** 1.0
**Last Updated:** December 23, 2024
**Maintained By:** Medical Spa Platform Development Team
