# Push Notification Implementation Guide 2025
## Medical Spa Platform - Comprehensive Research & Best Practices

**Last Updated:** December 23, 2025
**Platform:** Medical Spa Admin, Patient Portal, Patient Mobile App
**Status:** Research & Implementation Guide

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Web Push Notifications](#web-push-notifications)
3. [Mobile Push (iOS/Android)](#mobile-push-iosandroid)
4. [Push Notification Services Comparison](#push-notification-services-comparison)
5. [HIPAA Compliance for Healthcare](#hipaa-compliance-for-healthcare)
6. [Best Practices](#best-practices)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Technical Specifications](#technical-specifications)

---

## Executive Summary

Push notifications are a critical engagement tool for the Medical Spa platform, enabling timely appointment reminders, treatment updates, and promotional communications. However, as a healthcare application handling Protected Health Information (PHI), our implementation must prioritize **HIPAA compliance** above all else.

### Key Findings

- **Healthcare Impact**: Appointment reminders reduce no-shows by 60%, from 30%+ to 5-10%
- **Multi-Channel Approach**: SMS has 98% open rates, push notifications offer rich media and deep linking
- **HIPAA Critical**: Even simple appointment reminders like "Your appointment is tomorrow at 10 AM" contain PHI and must be HIPAA-compliant
- **Platform Recommendation**: Use **Expo Push Notifications** for mobile (React Native), **OneSignal** for advanced features, avoid standard FCM/APNs without BAA

---

## Web Push Notifications

### Overview

Web push notifications enable browsers to receive messages even when the website isn't open, using Service Workers and the Push API. As of 2025, Safari 18.4+ supports **Declarative Web Push**, eliminating the need for Service Workers in many cases.

### Browser Support (2025)

| Browser | Desktop | Mobile | Requirements |
|---------|---------|--------|--------------|
| Chrome | ✅ Full | ✅ Android | HTTPS, Service Worker |
| Firefox | ✅ Full | ✅ Android | HTTPS, Service Worker |
| Edge | ✅ Full | ✅ Android | HTTPS, Service Worker |
| Safari | ✅ 16.4+ | ✅ iOS 16.4+ | PWA, Home Screen Install |
| Opera | ✅ Full | ✅ Android | HTTPS, Service Worker |

**Important**: iOS/iPadOS Safari requires the site to be installed as a PWA (Progressive Web App) on the home screen before push notifications can be requested.

### VAPID Keys (Voluntary Application Server Identification)

VAPID provides authentication and security for push subscriptions.

#### Generation
```bash
npm install -g web-push
web-push generate-vapid-keys
```

#### Key Storage
- **Public Key**: Can be exposed, passed to `applicationServerKey` in `PushManager.subscribe()`
- **Private Key**: MUST be kept secret on your server, used to sign JWT tokens
- **Format**: URL-safe base64 encoded, convert to `UInt8Array` for browser use

#### Security Best Practices
- Never expose private keys in client code or repositories
- Store private keys in environment variables
- Rotate keys periodically (recommended every 6-12 months)
- Set JWT expiration (`exp`) to current UTC time + max 24 hours
- Use separate keys for development/staging/production

### Service Worker Implementation

#### Basic Registration
```javascript
// Check for browser support
if ('serviceWorker' in navigator && 'PushManager' in window) {
  // Register service worker
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('Service Worker registered:', registration);

      // Subscribe to push notifications
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
    })
    .then(subscription => {
      // Send subscription to server
      return fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    })
    .catch(error => {
      console.error('Registration failed:', error);
    });
}
```

#### Service Worker File (`sw.js`)
```javascript
// Listen for push events
self.addEventListener('push', event => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url,
      dateOfArrival: Date.now()
    },
    actions: [
      { action: 'view', title: 'View Appointment' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
```

### Safari iOS Web Push (2025 Updates)

#### New: Declarative Web Push (Safari 18.4+)
Safari now supports push notifications without Service Workers, using a JSON-based approach that's more energy-efficient and privacy-focused.

**Requirements:**
- iOS/iPadOS 18.4+ or macOS 15.5+
- Site added to Home Screen as PWA
- HTTPS connection
- Web app manifest file

**Benefits:**
- No Service Worker overhead
- Better battery efficiency
- Simpler implementation
- More privacy by design

#### User Flow for iOS
1. User visits site in Safari
2. Tap Share icon → "Add to Home Screen"
3. Launch PWA from Home Screen (standalone mode)
4. Permission prompt appears on user gesture
5. User grants permission

**Note**: iOS Safari does NOT support rich media (images, GIFs, videos) in push notifications as of 2025.

### Payload Limits

| Platform | Payload Size | Title Characters | Body Characters |
|----------|--------------|------------------|-----------------|
| **iOS** | 4096 bytes | 110 chars | 178 chars (4 lines) |
| **Android** | 4096 bytes | 65 chars | 240 chars |
| **Web Push** | 3-4 KB | Varies by browser | Varies by browser |
| **Chrome (Android)** | 4096 bytes | 47 chars (with image) | 50 chars (with image)<br>400 chars (no image) |
| **Firefox** | 4096 bytes | 30 chars | 65 chars |
| **Opera** | 4096 bytes | 50 chars | 65 chars |

**Important**: Each 64KB chunk of published data is billed as 1 request with most push services.

---

## Mobile Push (iOS/Android)

### Expo Push Notifications (Recommended for Our Platform)

Since our patient mobile app uses **React Native with Expo**, Expo Push Notifications provides the simplest integration path.

#### Overview
- Handles APNs (Apple) and FCM (Firebase) complexity automatically
- Unified API for iOS and Android
- Free tier: 1 million push notifications per month
- Priority plan: $29/month for faster builds and dedicated support

#### Prerequisites
- **Permissions**: User's explicit consent
- **ExpoPushToken**: Unique token per device
- **Real Devices**: Push notifications don't work on simulators/emulators

#### Required Packages
```bash
npx expo install expo-notifications expo-device expo-constants
```

#### Basic Implementation

**1. Create Custom Hook (`hooks/usePushNotifications.ts`):**
```typescript
import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(undefined);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        // Send token to your server
        sendTokenToServer(token);
      }
    });

    // Listener for notifications received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listener for when user taps on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle deep linking
      const data = response.notification.request.content.data;
      if (data.navigationId) {
        navigateToScreen(data.navigationId);
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
}

async function registerForPushNotificationsAsync() {
  let token;

  if (!Device.isDevice) {
    alert('Must use physical device for push notifications');
    return;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }

  // Get Expo push token
  token = (await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  })).data;

  // Configure Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}
```

**2. Send Notifications from Server:**
```javascript
// Server-side: Send push notification via Expo's API
async function sendPushNotification(expoPushToken, message) {
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: 'default',
      title: message.title,
      body: message.body,
      data: {
        navigationId: 'appointments',
        appointmentId: message.appointmentId
      },
    }),
  });

  return await response.json();
}
```

#### Android Setup with Firebase

1. Create Firebase project at console.firebase.google.com
2. Add Android app to Firebase project
3. Download `google-services.json`
4. In Expo account → Project Settings → Credentials
5. Scroll to "FCM V1 Service Account Key"
6. Upload the private key JSON file

#### iOS Setup with APNs

1. **APNs Authentication Key** (recommended):
   - Create APNs key in Apple Developer Member Center
   - Upload to Firebase Console → Cloud Messaging → iOS app configuration

2. **APNs Certificate Updates (2025)**:
   - Sandbox: Updated January 20, 2025
   - Production: Updated February 24, 2025
   - **Action Required**: Update Trust Store to include new certificate (SHA-2 Root: USERTrust RSA Certification Authority)
   - **Firebase Users**: No action needed, Firebase handles server certificate updates

#### Local vs Remote Notifications

**Local Push Notifications:**
- Scheduled and triggered by the app itself
- No server required
- Use cases: Reminders, alarms, time-based notifications
- Implementation:
```javascript
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Appointment Reminder",
    body: "Your appointment is in 1 hour",
  },
  trigger: {
    seconds: 3600, // 1 hour
  },
});
```

**Remote Push Notifications:**
- Sent from server via push service (APNs/FCM)
- Use cases: Updates, messages, external triggers
- Requires internet connection

### Firebase Cloud Messaging (FCM)

#### Overview
- Google's free push notification service
- Supports Android, iOS, and web
- Integrated with Firebase ecosystem (Auth, Analytics, Crashlytics)

#### Pros
- Free tier with generous limits
- Strong community and documentation
- Direct integration with Google services
- Topic-based and individual messaging

#### Cons
- Basic marketing campaign UI
- Requires coding for advanced targeting
- Not designed for non-technical users
- **No HIPAA BAA available for standard FCM**

#### Payload Limits
- iOS: 4096 bytes via APNs interface
- Android: 4096 bytes
- Notification + data payloads combined

#### APNs Integration Requirements

1. **Enable in Xcode:**
   - Push Notifications capability
   - Background Modes → Remote notifications

2. **Upload APNs Key to Firebase:**
   - Firebase Console → Project Settings → Cloud Messaging
   - Upload development and/or production authentication key

3. **Method Swizzling:**
   - Automatically maps APNs token to FCM token
   - Can be disabled with `FirebaseAppDelegateProxyEnabled = NO` in Info.plist

### Apple Push Notification Service (APNs)

#### Requirements
- Apple Developer account
- APNs authentication key or certificate
- Xcode configuration (Push Notifications + Background Modes)
- Real iOS devices (doesn't work on simulators)

#### 2025 Certificate Updates
- **Sandbox**: January 20, 2025
- **Production**: February 24, 2025
- **New Root**: USERTrust RSA Certification Authority
- Third-party providers (Firebase, OneSignal, etc.) handle updates automatically

#### Token Requirements
- APNs token must be provided to FCM SDK before retrieving FCM token
- Tokens can expire or change, implement re-registration logic

---

## Push Notification Services Comparison

### 1. Firebase Cloud Messaging (FCM)

**Type:** Free, Google-owned push service

**Pricing:**
- **Free**: Unlimited push notifications
- No paid tiers (included with Firebase)

**Pros:**
- ✅ Free and unlimited
- ✅ Excellent developer documentation
- ✅ Integrated with Firebase ecosystem
- ✅ Supports Android, iOS, web
- ✅ Official Expo support
- ✅ Topic-based and individual messaging

**Cons:**
- ❌ Basic campaign UI (not marketer-friendly)
- ❌ Limited automation capabilities
- ❌ Requires coding for advanced features
- ❌ No HIPAA BAA available
- ❌ Not ideal for healthcare applications

**Best For:**
- Apps already using Firebase backend
- Developer-centric implementations
- Budget-conscious projects
- Non-healthcare applications

### 2. OneSignal

**Type:** Full-featured omnichannel platform

**Pricing (2025):**
- **Free**: Up to 10,000 subscribers, unlimited notifications
- **Growth**: $9/month - Up to 1,000 subscribers
- **Professional**: $99/month - Up to 10,000 subscribers
- **Enterprise**: Custom pricing

**Pros:**
- ✅ Advanced segmentation and A/B testing
- ✅ Marketer-friendly dashboard
- ✅ In-app messaging included
- ✅ Rich analytics and reporting
- ✅ Automated omnichannel journeys
- ✅ Multi-channel (push, email, SMS, in-app)
- ✅ HIPAA BAA available on Enterprise plan
- ✅ React Native SDK with Expo plugin

**Cons:**
- ❌ Free tier shows OneSignal branding
- ❌ Advanced features require paid plans
- ❌ HIPAA compliance only on Enterprise tier (expensive)
- ❌ SDK can feel heavy

**Best For:**
- Marketing-driven teams
- Multi-channel campaigns
- Advanced automation needs
- Enterprise healthcare (with BAA)

### 3. Expo Push Notifications

**Type:** Expo's managed push service

**Pricing:**
- **Free**: 1 million push notifications per month
- **Priority**: $29/month (faster builds, dedicated support)

**Pros:**
- ✅ Simplest setup for Expo/React Native apps
- ✅ No APNs/FCM configuration during development
- ✅ Unified API for iOS and Android
- ✅ Works with Expo Go
- ✅ Great for prototypes and MVPs
- ✅ Free tier is very generous

**Cons:**
- ❌ Production apps still need APNs/FCM credentials
- ❌ Limited marketing features
- ❌ Requires Expo's servers (less control)
- ❌ Only works with Expo-built apps
- ❌ No HIPAA BAA available

**Best For:**
- React Native apps using Expo
- Rapid prototyping
- Development and testing
- Small to medium apps

### 4. Amazon SNS (Simple Notification Service)

**Type:** AWS enterprise messaging service

**Pricing (2025):**
- **Free Tier (12 months):**
  - 1 million mobile push notifications/month
  - 1 million API requests/month
  - 1,000 email deliveries/month
  - 100 SMS messages/month (US)

- **Standard Topics:**
  - First 1M requests: Free
  - Additional: $0.50 per million requests

- **Mobile Push:**
  - First 1M/month: Free
  - Additional: $0.50 per million ($0.0005 each)

- **SMS:**
  - US: $0.00645 per message
  - International: $0.0023 - $0.50+ per message

- **Email:**
  - First 1,000: Free
  - Additional: $2.00 per 100,000 ($0.02 each)

- **Data Transfer:**
  - In: Free
  - Out: $0.09/GB (first 10 TB), reducing to $0.05/GB (150 TB)
  - Free between SNS and EC2 in same region

- **Additional Features:**
  - Message Filtering: Attribute-based free, payload-based $0.09/GB
  - Message Archiving: $0.10/GB processing, $0.023/GB-month storage

**Pros:**
- ✅ Enterprise-grade reliability and scale
- ✅ AWS ecosystem integration
- ✅ HIPAA-eligible with BAA
- ✅ Multi-channel (push, SMS, email, HTTP/S)
- ✅ Pub/sub architecture
- ✅ Advanced filtering and fanout
- ✅ Pay only for what you use

**Cons:**
- ❌ Requires AWS expertise
- ❌ More complex setup than alternatives
- ❌ No built-in marketing campaign UI
- ❌ SMS costs can add up internationally
- ❌ 40x price difference between push ($0.0005) and email ($0.02)

**Best For:**
- Enterprise healthcare organizations
- AWS-native architectures
- High-volume applications (millions of users)
- Teams needing HIPAA compliance
- Complex integration requirements

### Comparison Matrix

| Feature | FCM | OneSignal | Expo Push | Amazon SNS |
|---------|-----|-----------|-----------|------------|
| **Price (Free Tier)** | Unlimited | 10K subscribers | 1M/month | 1M/month (12mo) |
| **HIPAA BAA** | ❌ No | ✅ Enterprise only | ❌ No | ✅ Yes |
| **Ease of Setup** | ⭐⭐⭐ Medium | ⭐⭐⭐⭐ Easy | ⭐⭐⭐⭐⭐ Very Easy | ⭐⭐ Complex |
| **Marketing UI** | ⭐⭐ Basic | ⭐⭐⭐⭐⭐ Advanced | ⭐ None | ⭐ None |
| **Analytics** | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐ Basic | ⭐⭐⭐ CloudWatch |
| **Multi-Channel** | Push only | Push, Email, SMS, In-app | Push only | Push, SMS, Email, HTTP |
| **A/B Testing** | Limited | ✅ Built-in | ❌ No | ❌ Manual |
| **Segmentation** | ⭐⭐⭐ Code-based | ⭐⭐⭐⭐⭐ Advanced | ❌ No | ⭐⭐⭐ Code-based |
| **Deep Linking** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Rich Media** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Expo Integration** | ⭐⭐⭐ Good | ⭐⭐⭐⭐ Plugin | ⭐⭐⭐⭐⭐ Native | ⭐⭐ Manual |
| **Enterprise Scale** | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐ Good | ⭐⭐⭐ Medium | ⭐⭐⭐⭐⭐ Excellent |

### Recommendation for Medical Spa Platform

**Phase 1 - MVP (Current):**
- **Use Expo Push Notifications** for mobile app
  - Simplest integration with existing React Native/Expo setup
  - Free tier covers initial user base
  - Focus on core functionality

**Phase 2 - Growth:**
- **Migrate to OneSignal Enterprise** or **Amazon SNS**
  - Required for HIPAA compliance
  - OneSignal: Better for marketing teams, easier UI
  - Amazon SNS: Better for AWS-native, more cost-effective at scale
  - Both provide BAA for legal compliance

**Why Not FCM Alone:**
- No HIPAA BAA available
- Cannot legally send PHI through FCM without additional safeguards
- Risk of regulatory violations and fines

---

## HIPAA Compliance for Healthcare

### Critical Understanding

**ALL appointment-related notifications contain PHI**, even seemingly harmless messages.

**Examples of PHI in Notifications:**
- ❌ "Your appointment tomorrow at 10 AM" - Establishes patient-provider relationship
- ❌ "Your dermatology appointment is tomorrow" - Reveals medical specialty
- ❌ "Lab results are ready" - Confirms medical service
- ❌ "Medication reminder: Take your prescription" - Reveals treatment
- ❌ "Dr. Smith confirmed your Botox appointment" - Specific treatment info

### HIPAA Requirements for Push Notifications

#### 1. Keep Messages Generic (MANDATORY)

**✅ Compliant Examples:**
- "You have a new message in your secure portal"
- "Please check your MedSpa account"
- "You have an update waiting"
- "Action required in your patient portal"

**❌ Non-Compliant Examples:**
- "Your Botox appointment is tomorrow at 2 PM"
- "Dr. Johnson is running 15 minutes late"
- "Your filler treatment results are ready"
- "Don't forget to prepare for your laser session"

#### 2. Use Deep Links to Secure Portal

Instead of putting PHI in the notification:
1. Send generic notification: "You have a new message"
2. Deep link to authenticated portal
3. Show full details after login/biometric authentication

```javascript
// Example: Generic notification with secure deep link
{
  title: "MedSpa Portal Update",
  body: "You have a new message waiting",
  data: {
    type: "secure_message",
    deepLink: "medspa://secure/messages/appointment-123"
  }
}
```

#### 3. Encryption Requirements

**Encryption In Transit:**
- Use HTTPS/TLS for all push notification API calls
- Encrypt payload before sending to push service
- Use end-to-end encryption where possible

**Encryption At Rest:**
- Encrypt ExpoPushTokens/FCM tokens in database
- Encrypt any patient data used for targeting/segmentation
- Use encrypted database fields (AES-256)

**2025 HIPAA Updates:**
- Mandatory end-to-end encryption for ePHI in transit and at rest
- Multi-factor authentication (MFA) recommended for accessing PHI systems

#### 4. Business Associate Agreements (BAAs)

**REQUIRED:** Any third-party service handling PHI must sign a BAA.

| Service | BAA Available | Cost Tier |
|---------|---------------|-----------|
| Amazon SNS | ✅ Yes | All tiers (AWS BAA) |
| OneSignal | ✅ Yes | Enterprise only |
| Firebase/FCM | ❌ No | N/A |
| Expo Push | ❌ No | N/A |
| Twilio | ✅ Yes | All tiers |
| Mailgun | ✅ Yes | All tiers |

**Standard SMS/iMessage are NOT HIPAA-compliant:**
- Zero encryption
- No BAA available
- Unsuitable for transmitting ePHI

#### 5. Patient Consent

**Explicit Opt-In Required:**
```javascript
// Example consent flow
const consentText = `
  By enabling notifications, you consent to receive:
  - Appointment reminders
  - Treatment updates
  - Promotional offers (optional)
  - Account security alerts

  You can manage preferences anytime in Settings.
  Message and data rates may apply.
`;

// Store consent in database with timestamp
await saveConsent({
  patientId: patient.id,
  consentType: 'push_notifications',
  consentText: consentText,
  consentedAt: new Date(),
  ipAddress: req.ip,
  userAgent: req.headers['user-agent']
});
```

**Consent Best Practices:**
- Granular controls (appointment reminders vs marketing)
- Easy opt-out at any time
- Document all consent/revocations with timestamps
- Respect opt-outs immediately (not "within 72 hours")

#### 6. Audit Trails

**Log All Push Notification Activity:**
```javascript
// Example audit log entry
{
  timestamp: "2025-12-23T10:30:00Z",
  eventType: "push_notification_sent",
  patientId: "PAT-12345",
  notificationType: "appointment_reminder",
  deliveryStatus: "delivered",
  deviceToken: "ExponentPushToken[xxx]", // Hashed
  sentBy: "system_scheduler",
  messageId: "msg-abc-123"
}
```

**Required Audit Information:**
- Who accessed PHI (user ID, role)
- What PHI was accessed (type, not content)
- When access occurred (timestamp with timezone)
- Where access came from (IP address, device)
- Why access occurred (business justification)

#### 7. Secure Data Storage

**Database Security:**
```sql
-- Example: Encrypted token storage
CREATE TABLE patient_push_tokens (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  token_encrypted BYTEA NOT NULL, -- AES-256 encrypted
  platform VARCHAR(20) NOT NULL, -- 'ios', 'android', 'web'
  device_info JSONB,
  active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Encryption functions (PostgreSQL example)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert with encryption
INSERT INTO patient_push_tokens (patient_id, token_encrypted, platform)
VALUES (
  'patient-uuid',
  pgp_sym_encrypt('ExponentPushToken[xxx]', 'encryption-key'),
  'ios'
);

-- Retrieve with decryption
SELECT
  patient_id,
  pgp_sym_decrypt(token_encrypted::bytea, 'encryption-key') as token,
  platform
FROM patient_push_tokens
WHERE active = true;
```

#### 8. Data Center and Server Requirements

**Physical Security:**
- Servers in HIPAA-compliant data centers
- SOC 2 Type II certification
- Physical access controls
- Environmental monitoring

**Cloud Providers with HIPAA Support:**
- AWS (with BAA)
- Google Cloud Platform (with BAA)
- Microsoft Azure (with BAA)
- DigitalOcean (with BAA on Business plan)

#### 9. Breach Notification Requirements

**2025 Update: Reduced to 30 days** (previously 60 days)

**If PHI is compromised via push notifications:**
1. Notify affected patients within 30 days
2. Notify HHS (Department of Health and Human Services)
3. Notify media if breach affects 500+ individuals
4. Document breach in incident response log
5. Conduct root cause analysis
6. Implement corrective actions

#### 10. 2025 HIPAA Compliance Changes

**Key Updates:**
- **Increased Audit Frequency**: HHS conducting more frequent audits
- **Higher Penalties**: Civil monetary penalties increased for 2025
- **Faster Breach Reporting**: 30 days (down from 60)
- **Mandatory MFA**: Multi-factor authentication recommended for PHI systems
- **Enhanced Encryption**: End-to-end encryption for ePHI in transit and at rest
- **Small Practice Scrutiny**: Small practices no longer escape regulatory attention
- **BAA Enforcement**: Increased focus on Business Associate Agreements

**Civil Monetary Penalties (2025):**
| Violation Tier | Minimum | Maximum (Per Violation) | Annual Maximum |
|----------------|---------|-------------------------|----------------|
| Unknowing | $137 | $68,928 | $2,067,813 |
| Reasonable Cause | $1,379 | $68,928 | $2,067,813 |
| Willful Neglect (Corrected) | $13,785 | $68,928 | $2,067,813 |
| Willful Neglect (Not Corrected) | $68,928 | $2,067,813 | $2,067,813 |

### HIPAA-Compliant Implementation Checklist

- [ ] Use only services with signed BAA (Amazon SNS or OneSignal Enterprise)
- [ ] Keep all notification content generic (no PHI)
- [ ] Implement end-to-end encryption for all ePHI
- [ ] Use deep links to authenticated portal for details
- [ ] Obtain explicit patient consent with documented timestamps
- [ ] Store push tokens in encrypted database fields
- [ ] Implement comprehensive audit logging
- [ ] Set up automatic opt-out respect (immediate)
- [ ] Configure quiet hours (no notifications 10 PM - 8 AM local time)
- [ ] Implement retry logic with exponential backoff
- [ ] Monitor delivery rates and failed notifications
- [ ] Regular security audits and penetration testing
- [ ] Staff training on HIPAA compliance for notifications
- [ ] Incident response plan for push notification breaches
- [ ] Data retention policy (delete inactive tokens after 90 days)
- [ ] Regular review of BAAs with all vendors

### Recommended Architecture for HIPAA Compliance

```
┌─────────────────────────────────────────────────────────────┐
│                     Medical Spa Platform                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Notification Service (Our Backend)              │
│  - Generic message generation (no PHI)                       │
│  - Patient consent verification                              │
│  - Audit logging                                             │
│  - Token encryption/decryption                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           Push Service with BAA (Choose One)                 │
│  Option A: Amazon SNS (AWS BAA signed)                       │
│  Option B: OneSignal Enterprise (BAA signed)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
          ┌──────────────┐    ┌──────────────┐
          │  APNs (iOS)  │    │ FCM (Android)│
          └──────────────┘    └──────────────┘
                    │                   │
                    └─────────┬─────────┘
                              ▼
                   ┌────────────────────┐
                   │  Patient Devices   │
                   │  - Generic message │
                   │  - Deep link       │
                   └────────────────────┘
                              │
                              ▼
                   ┌────────────────────┐
                   │  Authentication    │
                   │  - Login/Biometric │
                   └────────────────────┘
                              │
                              ▼
                   ┌────────────────────┐
                   │  Secure Portal     │
                   │  - Full details    │
                   │  - PHI visible     │
                   └────────────────────┘
```

---

## Best Practices

### 1. Permission Request Strategy

#### Opt-In Rate Benchmarks (2025)
- **iOS**: 43.9% average opt-in rate
- **Android**: 81.5% average opt-in rate
- **Web**: 17% acceptance rate, 41% rejection rate

**Note**: Android 13+ now uses opt-in model (similar to iOS)

#### Timing is Critical

**❌ NEVER Ask on First Launch:**
```javascript
// BAD: Asking immediately
useEffect(() => {
  requestPushPermission(); // User has no context!
}, []);
```

**✅ Use Trigger-Based Requests:**
```javascript
// GOOD: After user demonstrates engagement
const shouldAskForPermission =
  user.appointmentsBooked >= 1 &&
  user.appOpens >= 3 &&
  !user.hasSeenPushPrompt;

if (shouldAskForPermission) {
  showSoftAsk(); // Pre-permission prompt
}
```

**Optimal Triggers:**
- After booking first appointment
- After 3+ app opens in one week
- After viewing appointment details
- After completing profile
- When user adds item to cart (for retail)

#### Pre-Permission Soft Ask (CRITICAL)

**Why it matters:** If user denies permission on iOS, you can **NEVER ask again**.

```javascript
// Show custom UI first (soft ask)
const SoftAskModal = () => (
  <Modal>
    <h2>Stay Updated on Your Appointments</h2>
    <p>Get timely reminders about your upcoming treatments and special offers.</p>
    <Button onClick={handleAccept}>Enable Notifications</Button>
    <Button onClick={handleLater}>Maybe Later</Button>
  </Modal>
);

const handleAccept = async () => {
  // User expressed interest, now show system prompt
  const permission = await Notifications.requestPermissionsAsync();
  if (permission.status === 'granted') {
    registerPushToken();
  }
};

const handleLater = () => {
  // User declined, wait for next trigger
  analytics.track('push_permission_deferred');
  scheduleNextAsk(7); // Ask again in 7 days
};
```

#### Provide Context and Value

**✅ Good Permission Request:**
```
"Never Miss Your Appointment"

Get reminders about:
• Upcoming treatments
• Pre-appointment preparation instructions
• Special promotions just for you

[Enable Notifications]  [Ask Me Later]
```

**❌ Bad Permission Request:**
```
"Enable push notifications?"

[Allow]  [Don't Allow]
```

#### Incentivize Opt-In

**Examples:**
- "Enable notifications and get 10% off your next treatment"
- "VIP members get early access to promotions (requires notifications)"
- "Never miss a cancellation - be first to know about openings"

**Results:** Incentivized opt-ins can increase rates by 40%+

### 2. Notification Timing

#### Respect Time Zones

**Always use patient's local time:**
```javascript
const sendAppointmentReminder = async (appointment) => {
  const patientTimezone = appointment.patient.timezone; // e.g., 'America/New_York'
  const appointmentTime = moment.tz(appointment.dateTime, patientTimezone);

  // Send 24 hours before, but only during waking hours
  let reminderTime = appointmentTime.clone().subtract(24, 'hours');

  // If reminder would be sent before 8 AM, schedule for 8 AM
  if (reminderTime.hour() < 8) {
    reminderTime.hour(8).minute(0);
  }

  // If reminder would be sent after 9 PM, schedule for 9 AM next day
  if (reminderTime.hour() >= 21) {
    reminderTime.add(1, 'day').hour(9).minute(0);
  }

  await scheduleNotification(reminderTime, appointment);
};
```

#### Quiet Hours (HIPAA Best Practice)

**Default Quiet Hours:** 10 PM - 8 AM local time

```javascript
// Check if current time is within quiet hours
const isQuietHours = (timezone) => {
  const now = moment.tz(timezone);
  const hour = now.hour();
  return hour >= 22 || hour < 8; // 10 PM to 8 AM
};

// Allow patients to customize
const patientPreferences = {
  quietHoursStart: '22:00', // 10 PM
  quietHoursEnd: '08:00',   // 8 AM
  timezone: 'America/Los_Angeles'
};
```

#### Optimal Send Times (Healthcare)

**Appointment Reminders:**
- 24 hours before: 9 AM - 10 AM local time
- 2 hours before: Based on appointment time (if 10 AM appt, send at 8 AM)
- 1 hour before: Only for same-day changes/urgent updates

**Promotional Offers:**
- Weekdays: 11 AM - 1 PM (lunch break) or 6 PM - 8 PM (evening)
- Weekends: 10 AM - 12 PM (late morning)
- Avoid Mondays (too busy) and Fridays after 3 PM (weekend mindset)

**Lab Results / Clinical Updates:**
- 9 AM - 11 AM on weekdays (when patients can call with questions)
- Never late evening/night (causes anxiety)

#### Frequency Limits

**Anti-Spam Guidelines:**
- Maximum 1 notification per day (promotional)
- Maximum 3 per week (promotional)
- Appointment reminders don't count toward limit
- Security alerts exempt from limits

```javascript
const canSendPromotion = async (patientId) => {
  const sentToday = await countNotifications(patientId, {
    type: 'promotional',
    since: moment().startOf('day')
  });

  const sentThisWeek = await countNotifications(patientId, {
    type: 'promotional',
    since: moment().startOf('week')
  });

  return sentToday < 1 && sentThisWeek < 3;
};
```

### 3. Personalization

#### Segmentation Strategies

**By Demographics:**
```javascript
const segments = {
  newPatients: { registeredDays: { $lte: 30 } },
  vipPatients: { lifetimeValue: { $gte: 5000 } },
  lapsedPatients: { lastVisit: { $lte: moment().subtract(6, 'months') } },
  frequentVisitors: { visitCount: { $gte: 10 } }
};
```

**By Behavior:**
```javascript
const behaviorSegments = {
  cartAbandoners: {
    hasActiveCart: true,
    cartUpdatedAt: { $lte: moment().subtract(24, 'hours') }
  },
  appointmentNoShows: {
    noShowCount: { $gte: 1 },
    lastNoShow: { $gte: moment().subtract(90, 'days') }
  },
  browseOnly: {
    pageViews: { $gte: 5 },
    appointmentsBooked: 0
  }
};
```

**By Treatment Interest:**
```javascript
const treatmentSegments = {
  botoxInterested: {
    $or: [
      { viewedTreatments: 'botox' },
      { searchedFor: /botox|wrinkle/i },
      { previousTreatments: 'botox' }
    ]
  },
  laserHairRemoval: {
    viewedTreatments: 'laser-hair-removal',
    season: ['spring', 'summer'] // Seasonal targeting
  }
};
```

#### Dynamic Content

**Personalized Messages:**
```javascript
const generatePersonalizedMessage = (patient, event) => {
  const firstName = patient.firstName;
  const preferredName = patient.preferredName || firstName;

  switch (event.type) {
    case 'appointment_reminder':
      return {
        title: `Hi ${preferredName}!`,
        body: `Your ${event.treatmentName} appointment is tomorrow at ${event.time}. Tap for details.`
      };

    case 'birthday':
      return {
        title: `Happy Birthday, ${preferredName}! 🎉`,
        body: `Enjoy 20% off any treatment this month. You deserve it!`
      };

    case 'milestone':
      return {
        title: `Congratulations, ${preferredName}!`,
        body: `You've completed ${patient.visitCount} treatments with us. Here's a special thank you gift!`
      };

    case 'winback':
      const monthsSinceVisit = moment().diff(patient.lastVisit, 'months');
      return {
        title: `We miss you, ${preferredName}!`,
        body: `It's been ${monthsSinceVisit} months. Come back and get 15% off your next visit.`
      };
  }
};
```

#### Machine Learning Optimization (Advanced)

**Predictive Send Time:**
```javascript
// Track when user typically engages with notifications
const userEngagementPattern = {
  patientId: 'PAT-123',
  engagementHistory: [
    { sentAt: '2025-01-15T09:30:00Z', openedAt: '2025-01-15T09:32:00Z', engaged: true },
    { sentAt: '2025-01-20T14:00:00Z', openedAt: null, engaged: false },
    { sentAt: '2025-01-25T19:00:00Z', openedAt: '2025-01-25T19:05:00Z', engaged: true }
  ],
  optimalSendTime: '09:30', // Calculated by ML model
  optimalDays: ['Monday', 'Wednesday', 'Friday']
};

// Use ML model to predict best send time
const predictBestSendTime = async (patientId) => {
  const history = await getEngagementHistory(patientId);
  const prediction = await mlModel.predict(history);
  return prediction.optimalTime; // e.g., "09:30 Tuesday"
};
```

### 4. Rich Notifications

#### Images and Media

**iOS Rich Push (requires Notification Service Extension):**
```javascript
// Notification payload with image
{
  "aps": {
    "alert": {
      "title": "Your Results Are In!",
      "body": "See your before & after photos"
    },
    "mutable-content": 1
  },
  "imageUrl": "https://cdn.medspa.com/results/patient-123-before-after.jpg"
}
```

**Android Rich Push:**
```javascript
// FCM payload with big picture
{
  "notification": {
    "title": "Your Results Are In!",
    "body": "See your before & after photos"
  },
  "data": {
    "imageUrl": "https://cdn.medspa.com/results/patient-123-before-after.jpg",
    "style": "bigPicture"
  }
}
```

**Image Best Practices:**
- **Format**: JPEG or PNG
- **Size**: Max 10MB (iOS), 1MB recommended for faster loading
- **Dimensions**: 2:1 aspect ratio (e.g., 1200x600px)
- **HTTPS**: Images must be served over HTTPS
- **Fallback**: Always include text-only body in case image fails

#### Action Buttons

**iOS (up to 4 actions):**
```javascript
{
  "aps": {
    "alert": {
      "title": "Appointment Tomorrow",
      "body": "Botox with Dr. Smith at 2 PM"
    },
    "category": "APPOINTMENT_REMINDER"
  }
}

// Register category in app
UNNotificationCategory *category = [UNNotificationCategory
  categoryWithIdentifier:@"APPOINTMENT_REMINDER"
  actions:@[
    [UNNotificationAction actionWithIdentifier:@"CONFIRM" title:@"Confirm" options:UNNotificationActionOptionForeground],
    [UNNotificationAction actionWithIdentifier:@"RESCHEDULE" title:@"Reschedule" options:UNNotificationActionOptionForeground],
    [UNNotificationAction actionWithIdentifier:@"CANCEL" title:@"Cancel" options:UNNotificationActionOptionDestructive]
  ]
  intentIdentifiers:@[]
  options:UNNotificationCategoryOptionNone
];
```

**Android (up to 3 recommended):**
```javascript
// React Native with expo-notifications
await Notifications.setNotificationCategoryAsync('appointment', [
  {
    identifier: 'confirm',
    buttonTitle: 'Confirm',
    options: { opensAppToForeground: true }
  },
  {
    identifier: 'reschedule',
    buttonTitle: 'Reschedule',
    options: { opensAppToForeground: true }
  },
  {
    identifier: 'cancel',
    buttonTitle: 'Cancel',
    options: { isDestructive: true }
  }
]);
```

**Use Cases for Action Buttons:**
- Appointment confirmations (Confirm / Reschedule / Cancel)
- Treatment offers (Book Now / Learn More / Dismiss)
- Feedback requests (Rate Visit / Provide Feedback / Not Now)
- Waitlist offers (Accept Slot / Decline / Snooze)

### 5. Deep Linking

#### URL Schemes

**Define Custom Scheme:**
```javascript
// app.json (Expo)
{
  "expo": {
    "scheme": "medspa",
    "ios": {
      "bundleIdentifier": "com.medspa.app"
    },
    "android": {
      "package": "com.medspa.app"
    }
  }
}
```

**Deep Link Structure:**
```
medspa://appointments/123           → Open specific appointment
medspa://messages/conversation-456  → Open chat thread
medspa://treatments/botox           → Open treatment details
medspa://profile/edit               → Open profile editor
medspa://offers/summer-sale         → Open promotional offer
```

#### Navigation Handling

**React Navigation Example:**
```javascript
import { Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

const linking = {
  prefixes: ['medspa://', 'https://app.medspa.com'],
  config: {
    screens: {
      Home: '',
      Appointments: {
        path: 'appointments/:id',
        parse: {
          id: (id) => `${id}`,
        },
      },
      Messages: 'messages/:conversationId',
      Treatments: 'treatments/:treatmentSlug',
      Profile: 'profile/:section?',
    },
  },
};

function App() {
  return (
    <NavigationContainer linking={linking}>
      {/* Your navigation stack */}
    </NavigationContainer>
  );
}
```

**Handle Notification Tap:**
```javascript
useEffect(() => {
  // Handle notification tap when app is in foreground/background
  const subscription = Notifications.addNotificationResponseReceivedListener(
    response => {
      const data = response.notification.request.content.data;

      if (data.deepLink) {
        // Navigate to deep link
        Linking.openURL(data.deepLink);
      } else if (data.screen) {
        // Navigate to specific screen
        navigation.navigate(data.screen, data.params);
      }
    }
  );

  return () => subscription.remove();
}, []);
```

#### Universal Links (iOS) & App Links (Android)

**Benefits over custom schemes:**
- Works even if app isn't installed (fallback to web)
- More secure (verified domain ownership)
- Better user experience

**Setup (iOS):**
```json
// apple-app-site-association (serve at https://medspa.com/.well-known/)
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.medspa.app",
        "paths": [
          "/appointments/*",
          "/messages/*",
          "/treatments/*"
        ]
      }
    ]
  }
}
```

**Setup (Android):**
```xml
<!-- AndroidManifest.xml -->
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data
    android:scheme="https"
    android:host="medspa.com"
    android:pathPrefix="/appointments" />
</intent-filter>
```

**Deferred Deep Links:**

Use for linking to content after app installation:
```javascript
// User clicks push notification but doesn't have app installed
// 1. Opens App Store/Play Store
// 2. Installs app
// 3. Opens app
// 4. App navigates to intended content (deferred deep link)

// Implementation with Branch.io or Firebase Dynamic Links
import branch from 'react-native-branch';

branch.subscribe(({ error, params, uri }) => {
  if (params['+clicked_branch_link']) {
    // User came from a Branch link
    const appointmentId = params.appointmentId;
    navigation.navigate('Appointments', { id: appointmentId });
  }
});
```

### 6. Notification Grouping & Channels

#### Android Notification Channels (Required Android 8.0+)

**Why Channels:**
- Users can customize settings per channel
- System enforces importance levels
- Better organization

```javascript
// Create notification channels
import * as Notifications from 'expo-notifications';

await Notifications.setNotificationChannelAsync('appointments', {
  name: 'Appointment Reminders',
  importance: Notifications.AndroidImportance.HIGH,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#FF231F7C',
  sound: 'default',
  enableVibrate: true,
});

await Notifications.setNotificationChannelAsync('promotions', {
  name: 'Special Offers',
  importance: Notifications.AndroidImportance.DEFAULT,
  sound: 'default',
  enableVibrate: false,
});

await Notifications.setNotificationChannelAsync('messages', {
  name: 'Messages',
  importance: Notifications.AndroidImportance.HIGH,
  vibrationPattern: [0, 500],
  sound: 'message_tone.wav',
});

await Notifications.setNotificationChannelAsync('system', {
  name: 'Account & Security',
  importance: Notifications.AndroidImportance.MAX,
  sound: 'alert.wav',
});
```

**Send to Specific Channel:**
```javascript
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Appointment Tomorrow",
    body: "Your treatment is scheduled for 2 PM",
    data: { appointmentId: '123' },
  },
  trigger: null, // Send immediately
  channelId: 'appointments', // Specify channel
});
```

#### iOS Notification Groups

**Thread Identifier:**
```javascript
{
  "aps": {
    "alert": {
      "title": "New Message from Dr. Smith",
      "body": "We've updated your treatment plan"
    },
    "thread-id": "conversation-123" // Groups notifications by thread
  }
}
```

**Summary Format:**
```javascript
{
  "aps": {
    "alert": {
      "title": "5 New Messages",
      "body": "%u new messages from your care team",
      "summary-arg": "5",
      "summary-arg-count": 5
    }
  }
}
```

#### Notification Stacking

**Android:**
```javascript
// Send multiple notifications with same group key
const groupKey = 'appointments_today';

notifications.forEach(async (notif, index) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: notif.title,
      body: notif.body,
      data: {
        groupKey: groupKey,
        groupIndex: index
      },
    },
    trigger: null,
  });
});

// Send summary notification
await Notifications.scheduleNotificationAsync({
  content: {
    title: "3 Appointments Today",
    body: "You have 3 upcoming appointments",
    data: {
      groupKey: groupKey,
      isGroupSummary: true
    },
  },
  trigger: null,
});
```

### 7. Opt-Out and Preference Management

#### Granular Controls

**User Preferences Schema:**
```javascript
const notificationPreferences = {
  patientId: 'PAT-123',

  // Master switch
  pushNotificationsEnabled: true,

  // By category
  appointmentReminders: true,
  treatmentUpdates: true,
  promotionalOffers: false,
  messageNotifications: true,
  accountSecurity: true, // Always on, can't disable

  // Timing preferences
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  timezone: 'America/Los_Angeles',

  // Frequency
  maxPromotionsPerWeek: 2,

  // Channels
  channels: {
    push: true,
    email: true,
    sms: false
  },

  updatedAt: '2025-12-23T10:30:00Z'
};
```

**Settings UI:**
```javascript
const NotificationSettings = () => {
  const [prefs, setPrefs] = useState(notificationPreferences);

  return (
    <View>
      <Section title="Notification Types">
        <Toggle
          label="Appointment Reminders"
          value={prefs.appointmentReminders}
          onChange={(val) => updatePref('appointmentReminders', val)}
        />
        <Toggle
          label="Treatment Updates"
          value={prefs.treatmentUpdates}
          onChange={(val) => updatePref('treatmentUpdates', val)}
        />
        <Toggle
          label="Special Offers"
          value={prefs.promotionalOffers}
          onChange={(val) => updatePref('promotionalOffers', val)}
        />
        <Toggle
          label="Messages"
          value={prefs.messageNotifications}
          onChange={(val) => updatePref('messageNotifications', val)}
        />
      </Section>

      <Section title="Quiet Hours">
        <Toggle
          label="Enable Quiet Hours"
          value={prefs.quietHoursEnabled}
          onChange={(val) => updatePref('quietHoursEnabled', val)}
        />
        {prefs.quietHoursEnabled && (
          <>
            <TimePicker
              label="Start Time"
              value={prefs.quietHoursStart}
              onChange={(val) => updatePref('quietHoursStart', val)}
            />
            <TimePicker
              label="End Time"
              value={prefs.quietHoursEnd}
              onChange={(val) => updatePref('quietHoursEnd', val)}
            />
          </>
        )}
      </Section>
    </View>
  );
};
```

#### Respect Opt-Outs Immediately

**Check Preferences Before Sending:**
```javascript
const canSendNotification = async (patientId, notificationType) => {
  const prefs = await getPatientPreferences(patientId);

  // Master switch check
  if (!prefs.pushNotificationsEnabled) {
    return false;
  }

  // Category check
  const categoryMap = {
    'appointment_reminder': prefs.appointmentReminders,
    'treatment_update': prefs.treatmentUpdates,
    'promotion': prefs.promotionalOffers,
    'message': prefs.messageNotifications,
    'security': true // Always allowed
  };

  if (!categoryMap[notificationType]) {
    return false;
  }

  // Quiet hours check
  if (prefs.quietHoursEnabled && isQuietHours(prefs)) {
    // Exception for urgent security alerts
    if (notificationType !== 'security') {
      return false;
    }
  }

  // Frequency check (for promotions)
  if (notificationType === 'promotion') {
    const sentThisWeek = await countPromotionalNotifications(patientId, 'week');
    if (sentThisWeek >= prefs.maxPromotionsPerWeek) {
      return false;
    }
  }

  return true;
};
```

#### Unsubscribe Links

**Include in Notification Data:**
```javascript
{
  title: "Special Offer",
  body: "20% off Botox this week",
  data: {
    type: 'promotion',
    deepLink: 'medspa://offers/botox-sale',
    unsubscribeLink: 'medspa://settings/notifications?type=promotions&action=disable'
  }
}
```

### 8. Testing and Quality Assurance

#### Test Checklist

**Device Testing:**
- [ ] iOS (latest 2 versions)
- [ ] Android (latest 3 versions)
- [ ] Different screen sizes (iPhone SE, Pro Max, tablets)
- [ ] Web (Chrome, Firefox, Safari, Edge)
- [ ] Different time zones
- [ ] Low connectivity scenarios

**Permission States:**
- [ ] Fresh install (never asked)
- [ ] Permission granted
- [ ] Permission denied
- [ ] Permission revoked after granting
- [ ] System notifications disabled

**Notification States:**
- [ ] App in foreground
- [ ] App in background
- [ ] App completely killed
- [ ] Device locked
- [ ] Do Not Disturb mode enabled

**Content Testing:**
- [ ] Long titles (truncation)
- [ ] Long body text (truncation)
- [ ] Special characters (emojis, non-Latin scripts)
- [ ] Images (valid URL, broken URL, slow loading)
- [ ] Deep links (valid, invalid, app not installed)

**Analytics Testing:**
- [ ] Notification sent events logged
- [ ] Delivery confirmed
- [ ] Open rates tracked
- [ ] Action button clicks tracked
- [ ] Conversion tracking (e.g., booked appointment after notification)

#### Expo Push Notification Tool

**Test Individual Notifications:**
```
https://expo.dev/notifications
```

1. Enter ExpoPushToken
2. Compose message
3. Send test notification
4. Verify receipt on device

**Programmatic Testing:**
```javascript
// Test helper function
const sendTestNotification = async (expoPushToken) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Test Notification',
    body: 'This is a test from the MedSpa platform',
    data: {
      type: 'test',
      timestamp: Date.now()
    },
  };

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  const result = await response.json();
  console.log('Test notification sent:', result);
  return result;
};
```

### 9. Analytics and Monitoring

#### Key Metrics to Track

**Delivery Metrics:**
```javascript
const deliveryMetrics = {
  sent: 10000,           // Total sent
  delivered: 9500,       // Successfully delivered (95%)
  failed: 300,           // Failed delivery (3%)
  invalidTokens: 200,    // Invalid/expired tokens (2%)

  // By platform
  ios: { sent: 6000, delivered: 5800, failed: 200 },
  android: { sent: 4000, delivered: 3700, failed: 100 },
  web: { sent: 0, delivered: 0, failed: 0 }
};
```

**Engagement Metrics:**
```javascript
const engagementMetrics = {
  opens: 3800,               // Notification opened (40% open rate)
  clicks: 1900,              // Clicked through to app (20% CTR)
  conversions: 570,          // Completed desired action (30% conversion)
  dismissals: 5700,          // Dismissed without opening (60%)

  // Average time metrics
  avgTimeToOpen: 180,        // 3 minutes
  avgTimeInApp: 420,         // 7 minutes after opening from notification

  // Action button metrics
  actionButtonClicks: {
    confirm: 800,
    reschedule: 150,
    cancel: 50
  }
};
```

**Opt-Out Metrics:**
```javascript
const optOutMetrics = {
  totalOptIns: 45000,
  totalOptOuts: 2000,
  optOutRate: 0.044,         // 4.4%

  // By category
  optOutsByCategory: {
    appointments: 50,         // Very few opt out of critical reminders
    promotions: 1800,         // Most opt-outs are promotional
    messages: 100,
    treatmentUpdates: 50
  },

  // Reasons (if collected)
  optOutReasons: {
    tooFrequent: 1200,
    notRelevant: 500,
    prefer Email: 200,
    other: 100
  }
};
```

#### Logging Implementation

**Event Schema:**
```javascript
const notificationEvent = {
  eventId: 'evt_abc123',
  eventType: 'notification_sent', // sent, delivered, opened, clicked, failed
  timestamp: '2025-12-23T10:30:00Z',

  // Notification details
  notificationId: 'notif_xyz789',
  notificationType: 'appointment_reminder',
  channel: 'push', // push, email, sms

  // Patient info (hashed for privacy)
  patientId: 'hash_pat123',
  segment: 'active_patients',

  // Device info
  platform: 'ios',
  osVersion: '17.2',
  appVersion: '2.1.0',
  deviceToken: 'hash_token456',

  // Content
  title: 'Appointment Tomorrow',
  body: 'Your treatment is scheduled for 2 PM',

  // Delivery info
  deliveryStatus: 'delivered',
  deliveryTime: '2025-12-23T10:30:05Z',
  ttl: 3600, // Time to live in seconds

  // Engagement
  opened: true,
  openedAt: '2025-12-23T10:35:00Z',
  clicked: true,
  clickedAt: '2025-12-23T10:35:10Z',
  action: 'confirm',

  // Attribution
  campaignId: 'camp_reminder_24h',
  testVariant: 'A', // For A/B tests

  // Error info (if failed)
  errorCode: null,
  errorMessage: null
};
```

**Tracking with Analytics Platform:**
```javascript
import analytics from '@/lib/analytics'; // Segment, Mixpanel, Amplitude, etc.

// Track notification sent
analytics.track('Notification Sent', {
  notification_id: notificationId,
  notification_type: 'appointment_reminder',
  patient_id: patientId,
  platform: 'ios'
});

// Track notification opened
analytics.track('Notification Opened', {
  notification_id: notificationId,
  notification_type: 'appointment_reminder',
  time_to_open: 300, // 5 minutes
  patient_id: patientId
});

// Track conversion
analytics.track('Appointment Confirmed', {
  source: 'push_notification',
  notification_id: notificationId,
  appointment_id: appointmentId
});
```

#### Dashboard Metrics

**Real-Time Monitoring:**
- Delivery rate (last hour)
- Open rate (last hour)
- Failed notifications (with reasons)
- Invalid token count (need cleanup)

**Daily Reports:**
- Total sent/delivered/opened by platform
- Top performing notification types
- Opt-out rate trends
- Conversion rates by campaign

**Weekly/Monthly Analysis:**
- Engagement trends over time
- A/B test results
- Segmentation performance
- ROI calculations (bookings from notifications)

### 10. A/B Testing and Optimization

#### What to Test

**Message Copy:**
- Short vs long titles
- Question vs statement
- Urgency level ("Today only!" vs "Limited time")
- Personalization ("Hi Sarah" vs "Hi there")
- Emoji usage

**Timing:**
- Morning (9-11 AM) vs evening (6-8 PM)
- Weekday vs weekend
- 24 hours before vs 2 hours before
- Immediate vs optimal predicted time

**Visuals:**
- With image vs without
- Different image styles (lifestyle vs clinical)
- Icon/badge variations

**Call to Action:**
- "Book Now" vs "Reserve Your Spot"
- "Learn More" vs "See Details"
- "Confirm" vs "Yes, I'll be there"

#### A/B Testing Framework

```javascript
const abTestConfig = {
  testId: 'reminder_timing_test_001',
  testName: 'Appointment Reminder Timing',
  startDate: '2025-12-23',
  endDate: '2026-01-23',

  variants: [
    {
      id: 'control',
      name: 'Current (24h before, 9 AM)',
      traffic: 0.50, // 50% of users
      config: {
        timingOffset: 24 * 60 * 60, // 24 hours in seconds
        preferredHour: 9
      }
    },
    {
      id: 'variant_a',
      name: 'Evening (24h before, 7 PM)',
      traffic: 0.25,
      config: {
        timingOffset: 24 * 60 * 60,
        preferredHour: 19
      }
    },
    {
      id: 'variant_b',
      name: 'Closer (4h before, dynamic time)',
      traffic: 0.25,
      config: {
        timingOffset: 4 * 60 * 60,
        preferredHour: null // Dynamic based on appointment time
      }
    }
  ],

  successMetric: 'appointment_confirmation_rate',
  minimumSampleSize: 1000 // per variant
};

// Assign user to variant
const getVariant = (patientId, testId) => {
  const hash = simpleHash(patientId + testId);
  const bucket = hash % 100; // 0-99

  if (bucket < 50) return 'control';
  if (bucket < 75) return 'variant_a';
  return 'variant_b';
};

// Send notification with A/B test
const sendAppointmentReminder = async (appointment) => {
  const variant = getVariant(appointment.patientId, 'reminder_timing_test_001');
  const config = abTestConfig.variants.find(v => v.id === variant).config;

  // Calculate send time based on variant
  const sendTime = calculateSendTime(appointment.dateTime, config);

  // Schedule notification
  await scheduleNotification({
    sendTime,
    title: 'Appointment Reminder',
    body: 'Your appointment is coming up soon. Tap for details.',
    data: {
      appointmentId: appointment.id,
      abTest: {
        testId: 'reminder_timing_test_001',
        variant: variant
      }
    }
  });

  // Log A/B test assignment
  analytics.track('AB Test Assigned', {
    test_id: 'reminder_timing_test_001',
    variant: variant,
    patient_id: appointment.patientId
  });
};
```

#### Statistical Significance

**Calculate Sample Size:**
```javascript
// Minimum sample size for 95% confidence, 80% power
const calculateSampleSize = (baselineRate, minimumDetectableEffect) => {
  // Simplified formula (use proper statistical library in production)
  const p1 = baselineRate;
  const p2 = baselineRate * (1 + minimumDetectableEffect);
  const z_alpha = 1.96; // 95% confidence
  const z_beta = 0.84;  // 80% power

  const n = Math.ceil(
    (Math.pow(z_alpha + z_beta, 2) * (p1 * (1 - p1) + p2 * (1 - p2))) /
    Math.pow(p2 - p1, 2)
  );

  return n;
};

// Example: 40% baseline confirmation rate, want to detect 10% improvement
const sampleSize = calculateSampleSize(0.40, 0.10);
console.log(`Need ${sampleSize} patients per variant`); // ~1570
```

**Analyze Results:**
```javascript
const analyzeABTest = (testId) => {
  const results = {
    control: {
      sent: 2000,
      confirmed: 800,
      rate: 0.40 // 40%
    },
    variant_a: {
      sent: 1000,
      confirmed: 450,
      rate: 0.45 // 45%
    },
    variant_b: {
      sent: 1000,
      confirmed: 480,
      rate: 0.48 // 48%
    }
  };

  // Perform chi-square test (use stats library in production)
  const pValue = chiSquareTest(results.control, results.variant_b);

  if (pValue < 0.05) {
    console.log('Variant B is statistically significant winner!');
    console.log(`Improvement: ${((results.variant_b.rate / results.control.rate) - 1) * 100}%`);
    // Roll out variant_b to 100% of users
  } else {
    console.log('No statistically significant difference. Continue testing.');
  }
};
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Goals:** Basic push notification infrastructure for mobile app

**Tasks:**
1. ✅ Install and configure `expo-notifications`
2. ✅ Create `usePushNotifications` hook
3. ✅ Implement permission request flow (soft ask)
4. ✅ Set up push token storage (encrypted)
5. ✅ Create Android notification channels
6. ✅ Test on real iOS and Android devices
7. ✅ Implement basic deep linking

**Deliverables:**
- Working push notifications on mobile app
- User preferences for notification categories
- Basic analytics (sent, delivered, opened)

**HIPAA Compliance:**
- Store tokens encrypted in database
- Use generic message templates only
- Implement audit logging for all notifications

### Phase 2: HIPAA Compliance (Weeks 3-4)

**Goals:** Full HIPAA compliance for healthcare notifications

**Tasks:**
1. ✅ Sign Business Associate Agreement (BAA)
   - Option A: AWS account setup → Sign AWS BAA → Configure Amazon SNS
   - Option B: OneSignal Enterprise plan → Sign BAA
2. ✅ Implement generic messaging (no PHI in notifications)
3. ✅ Set up deep linking to secure authenticated portal
4. ✅ Configure end-to-end encryption for all ePHI
5. ✅ Implement comprehensive audit logging
6. ✅ Patient consent management with timestamps
7. ✅ Set up quiet hours (10 PM - 8 AM default)
8. ✅ Security audit and penetration testing

**Deliverables:**
- HIPAA-compliant notification system
- Signed BAA with push service provider
- Complete audit trail
- Patient consent records

**Critical:**
- ALL notifications must be generic
- NO PHI in notification content
- Deep links to authenticated areas only

### Phase 3: Appointment Reminders (Weeks 5-6)

**Goals:** Reduce no-shows with automated reminders

**Tasks:**
1. ✅ Implement 24-hour appointment reminder
2. ✅ Implement 2-hour appointment reminder
3. ✅ Time zone handling
4. ✅ Quiet hours respect
5. ✅ Confirmation action buttons (Confirm / Reschedule / Cancel)
6. ✅ Multi-channel reminders (push + SMS + email)
7. ✅ Reminder preference settings per patient
8. ✅ Track no-show rates before/after implementation

**Deliverables:**
- Automated appointment reminder system
- Configurable reminder timing
- Multi-channel fallback (if push fails, send SMS)

**Success Metrics:**
- Reduce no-shows from 30% to <10%
- 78% fewer no-shows among patients who confirm
- 46% more confirmations/cancellations

### Phase 4: Web Push (Weeks 7-8)

**Goals:** Push notifications for web app users

**Tasks:**
1. ✅ Implement Service Worker for web push
2. ✅ Generate and secure VAPID keys
3. ✅ Browser support detection (Chrome, Firefox, Edge, Safari)
4. ✅ iOS PWA setup (manifest, home screen install prompt)
5. ✅ Safari 18.4+ Declarative Web Push support
6. ✅ Web notification permission flow
7. ✅ Web push subscription management
8. ✅ Cross-browser testing

**Deliverables:**
- Web push notifications for desktop users
- PWA support for iOS web users
- Unified notification preferences across mobile and web

**Browser Support:**
- Chrome/Edge: Full support
- Firefox: Full support
- Safari (macOS): Full support (16.4+)
- Safari (iOS): PWA + Home Screen required (16.4+)

### Phase 5: Advanced Features (Weeks 9-12)

**Goals:** Rich notifications, segmentation, automation

**Tasks:**
1. ✅ Rich push notifications (images, action buttons)
2. ✅ Advanced segmentation (behavior, demographics, treatment history)
3. ✅ A/B testing framework
4. ✅ Personalized send time optimization
5. ✅ Automated campaigns (win-back, birthday, milestones)
6. ✅ Notification grouping and channels
7. ✅ Advanced analytics dashboard
8. ✅ Integration with CRM/marketing automation

**Deliverables:**
- Rich media notifications
- Behavioral segmentation engine
- A/B testing platform
- Automated lifecycle campaigns

**Use Cases:**
- Cart abandonment (24 hours after adding to cart)
- Win-back campaigns (lapsed patients, 6+ months)
- Birthday offers (personalized discount)
- Milestone celebrations (10th visit)
- Treatment series reminders (e.g., laser hair removal package)

### Phase 6: Scale and Optimize (Ongoing)

**Goals:** Continuous improvement and scaling

**Tasks:**
1. ✅ Monitor delivery rates and optimize
2. ✅ Clean up invalid/expired tokens
3. ✅ Machine learning for send time optimization
4. ✅ Predictive analytics (churn risk, upsell opportunities)
5. ✅ Performance optimization (batch sending)
6. ✅ Cost optimization (track spend, optimize channels)
7. ✅ User feedback collection
8. ✅ Regular A/B testing iterations

**Deliverables:**
- >95% delivery rate
- >40% open rate
- <5% opt-out rate
- ROI tracking per campaign

**KPIs:**
| Metric | Target | Current |
|--------|--------|---------|
| Delivery Rate | >95% | TBD |
| Open Rate | >40% | TBD |
| Click-Through Rate | >20% | TBD |
| Conversion Rate | >30% | TBD |
| Opt-Out Rate | <5% | TBD |
| No-Show Rate | <10% | 30% baseline |
| ROI (Marketing) | >500% | TBD |

---

## Technical Specifications

### API Endpoints

#### 1. Register Push Token
```
POST /api/push/register
Authorization: Bearer {jwt_token}

Request:
{
  "token": "ExponentPushToken[xxxxxx]",
  "platform": "ios", // "ios" | "android" | "web"
  "deviceInfo": {
    "osVersion": "17.2",
    "appVersion": "2.1.0",
    "deviceModel": "iPhone 15 Pro"
  }
}

Response:
{
  "success": true,
  "tokenId": "tok_abc123",
  "message": "Push token registered successfully"
}
```

#### 2. Update Notification Preferences
```
PUT /api/push/preferences
Authorization: Bearer {jwt_token}

Request:
{
  "pushNotificationsEnabled": true,
  "appointmentReminders": true,
  "treatmentUpdates": true,
  "promotionalOffers": false,
  "messageNotifications": true,
  "quietHoursEnabled": true,
  "quietHoursStart": "22:00",
  "quietHoursEnd": "08:00",
  "timezone": "America/Los_Angeles"
}

Response:
{
  "success": true,
  "preferences": { ... },
  "updatedAt": "2025-12-23T10:30:00Z"
}
```

#### 3. Send Notification (Internal API)
```
POST /api/internal/push/send
Authorization: Bearer {server_secret}

Request:
{
  "patientId": "PAT-123",
  "type": "appointment_reminder",
  "title": "Appointment Reminder",
  "body": "You have an appointment update. Tap for details.",
  "data": {
    "deepLink": "medspa://appointments/456",
    "appointmentId": "456"
  },
  "scheduledFor": "2025-12-24T09:00:00Z" // Optional, immediate if omitted
}

Response:
{
  "success": true,
  "notificationId": "notif_xyz789",
  "scheduledFor": "2025-12-24T09:00:00Z",
  "estimatedDelivery": "2025-12-24T09:00:05Z"
}
```

#### 4. Track Notification Event
```
POST /api/push/track
Authorization: Bearer {jwt_token}

Request:
{
  "notificationId": "notif_xyz789",
  "event": "opened", // "delivered" | "opened" | "clicked" | "dismissed"
  "timestamp": "2025-12-24T09:05:00Z",
  "action": "confirm" // Optional, for action buttons
}

Response:
{
  "success": true,
  "tracked": true
}
```

### Database Schema

#### Push Tokens Table
```sql
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  token_encrypted BYTEA NOT NULL, -- AES-256 encrypted token
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  device_info JSONB,
  active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(patient_id, token_encrypted, platform)
);

CREATE INDEX idx_push_tokens_patient ON push_tokens(patient_id);
CREATE INDEX idx_push_tokens_active ON push_tokens(active) WHERE active = true;
```

#### Notification Preferences Table
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,

  -- Master switches
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,

  -- Category preferences
  appointment_reminders BOOLEAN DEFAULT true,
  treatment_updates BOOLEAN DEFAULT true,
  promotional_offers BOOLEAN DEFAULT true,
  message_notifications BOOLEAN DEFAULT true,
  account_security BOOLEAN DEFAULT true,

  -- Timing
  quiet_hours_enabled BOOLEAN DEFAULT true,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  timezone VARCHAR(50) DEFAULT 'America/Los_Angeles',

  -- Frequency
  max_promotions_per_week INTEGER DEFAULT 3,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notif_prefs_patient ON notification_preferences(patient_id);
```

#### Notification Log Table
```sql
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id VARCHAR(100) UNIQUE NOT NULL,

  -- Patient info (hashed for privacy)
  patient_id_hash VARCHAR(64) NOT NULL, -- SHA-256 hash

  -- Notification details
  type VARCHAR(50) NOT NULL, -- 'appointment_reminder', 'promotion', etc.
  channel VARCHAR(20) NOT NULL, -- 'push', 'email', 'sms'
  platform VARCHAR(20), -- 'ios', 'android', 'web'

  -- Content (generic only, no PHI)
  title TEXT,
  body TEXT,

  -- Delivery
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'opened'
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  failed_at TIMESTAMP,
  error_code VARCHAR(50),
  error_message TEXT,

  -- Engagement
  clicked BOOLEAN DEFAULT false,
  clicked_at TIMESTAMP,
  action VARCHAR(50), -- Action button clicked

  -- Attribution
  campaign_id VARCHAR(100),
  test_variant VARCHAR(50),

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notif_log_patient_hash ON notification_log(patient_id_hash);
CREATE INDEX idx_notif_log_type ON notification_log(type);
CREATE INDEX idx_notif_log_status ON notification_log(status);
CREATE INDEX idx_notif_log_created ON notification_log(created_at);
```

#### Consent Records Table
```sql
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL, -- 'push_notifications', 'email', 'sms'
  consent_text TEXT NOT NULL, -- Full text of consent shown to patient
  consented BOOLEAN NOT NULL, -- true = opted in, false = opted out
  consented_at TIMESTAMP NOT NULL,

  -- Audit trail
  ip_address INET,
  user_agent TEXT,
  method VARCHAR(50), -- 'app', 'web', 'phone', 'in_person'

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_consent_patient ON consent_records(patient_id);
CREATE INDEX idx_consent_type ON consent_records(consent_type);
```

### Environment Variables

```bash
# Push Notification Service
PUSH_SERVICE=expo # "expo" | "onesignal" | "fcm" | "sns"

# Expo Push Notifications
EXPO_PROJECT_ID=your-project-id
EXPO_PUSH_URL=https://exp.host/--/api/v2/push/send

# Firebase Cloud Messaging (if using FCM)
FCM_SERVER_KEY=your-fcm-server-key
FCM_SENDER_ID=your-fcm-sender-id

# Web Push (VAPID)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key # KEEP SECRET
VAPID_SUBJECT=mailto:support@medspa.com

# OneSignal (if using OneSignal)
ONESIGNAL_APP_ID=your-onesignal-app-id
ONESIGNAL_REST_API_KEY=your-onesignal-api-key # KEEP SECRET

# Amazon SNS (if using SNS)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key # KEEP SECRET
AWS_SNS_PLATFORM_ARN_IOS=arn:aws:sns:...
AWS_SNS_PLATFORM_ARN_ANDROID=arn:aws:sns:...

# Database Encryption
DB_ENCRYPTION_KEY=your-256-bit-encryption-key # KEEP SECRET

# Rate Limiting
MAX_PUSH_PER_PATIENT_PER_DAY=10
MAX_PROMOTIONAL_PER_WEEK=3

# Quiet Hours (default)
DEFAULT_QUIET_HOURS_START=22:00
DEFAULT_QUIET_HOURS_END=08:00

# Retry Configuration
PUSH_RETRY_MAX_ATTEMPTS=3
PUSH_RETRY_BACKOFF_MS=1000

# HIPAA Compliance
HIPAA_MODE=true
REQUIRE_BAA=true
AUDIT_LOG_RETENTION_DAYS=2555 # 7 years
```

### Security Checklist

- [ ] VAPID private keys stored in secure environment variables (not in code)
- [ ] Push tokens encrypted in database (AES-256)
- [ ] All API endpoints require authentication
- [ ] HTTPS/TLS for all communications
- [ ] Rate limiting on notification sending (prevent abuse)
- [ ] Input validation on all user-provided data
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (sanitize notification content)
- [ ] CSRF protection on web endpoints
- [ ] Regular security audits and penetration testing
- [ ] Dependency scanning (npm audit, Snyk)
- [ ] Secrets rotation schedule (every 6-12 months)
- [ ] Access logs for all push notification operations
- [ ] Incident response plan documented

---

## Appendix

### A. Glossary

**APNs**: Apple Push Notification service - Apple's service for delivering push notifications to iOS, iPadOS, macOS, watchOS, and tvOS devices.

**BAA**: Business Associate Agreement - A HIPAA-required contract between a healthcare provider and a third-party service that handles PHI.

**Deep Link**: A URL that opens a specific page or screen within a mobile app, rather than just launching the app's home screen.

**ePHI**: Electronic Protected Health Information - Any PHI that is created, stored, transmitted, or received electronically.

**Expo**: A framework and platform for building React Native applications, providing tools and services including push notifications.

**FCM**: Firebase Cloud Messaging - Google's free cross-platform messaging solution for sending notifications to Android, iOS, and web.

**PHI**: Protected Health Information - Any individually identifiable health information under HIPAA, including demographics, medical records, payment information, and any data that creates a connection between an individual and a healthcare service.

**PWA**: Progressive Web App - A web application that can be installed on a device and work offline, with capabilities like push notifications.

**Service Worker**: A JavaScript script that runs in the background, separate from a web page, enabling features like push notifications and offline functionality.

**Universal Link (iOS) / App Link (Android)**: A web URL that opens content in your app if installed, or falls back to the web browser if not.

**VAPID**: Voluntary Application Server Identification - A protocol for identifying web push senders and providing security.

### B. Common Error Codes

| Code | Platform | Description | Solution |
|------|----------|-------------|----------|
| `DeviceNotRegistered` | Expo/FCM | Push token is invalid/expired | Remove token from database |
| `MessageTooBig` | All | Payload exceeds size limit | Reduce message size or remove images |
| `MismatchSenderId` | Android/FCM | FCM sender ID doesn't match | Verify FCM configuration |
| `InvalidCredentials` | iOS/APNs | APNs certificate/key invalid | Re-upload valid APNs credentials |
| `BadDeviceToken` | iOS/APNs | Invalid APNs device token | Remove token from database |
| `Unregistered` | Android/FCM | Device uninstalled app | Remove token, mark user as churned |
| `NotificationNotPermitted` | All | User revoked permissions | Update user preferences, don't retry |
| `QuotaExceeded` | Web | Browser storage quota exceeded | Clear old notifications |
| `NetworkError` | All | Internet connectivity issue | Retry with exponential backoff |

### C. Resources and Documentation

**Official Documentation:**
- [Expo Push Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)
- [Web Push API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [OneSignal Documentation](https://documentation.onesignal.com/)
- [Amazon SNS Documentation](https://docs.aws.amazon.com/sns/)

**HIPAA Resources:**
- [HHS HIPAA Guidance](https://www.hhs.gov/hipaa/index.html)
- [HIPAA Journal](https://www.hipaajournal.com/)
- [2025 HIPAA Updates](https://www.hipaavault.com/resources/2025-hipaa-new-regulations/)

**Tools:**
- [Expo Push Notification Tool](https://expo.dev/notifications) - Test notifications
- [web-push npm package](https://www.npmjs.com/package/web-push) - VAPID key generation
- [FCM Console](https://console.firebase.google.com/) - Firebase management
- [OneSignal Dashboard](https://onesignal.com/) - OneSignal campaigns

**Testing:**
- [BrowserStack](https://www.browserstack.com/) - Cross-browser/device testing
- [Pusher Beams](https://pusher.com/beams) - Alternative push service for testing

---

## Sources

This guide was compiled from extensive research of the following sources:

**Web Push Notifications:**
- [Web Push Notifications: A Comprehensive Guide for Developers](https://medium.com/@laurenelwhite/web-push-notifications-a-comprehensive-guide-for-developers-febaffb8ef93)
- [Push API - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Using Web Push Notifications with VAPID](https://rossta.net/blog/using-the-web-push-api-with-vapid.html)
- [Complete Guide to Firebase Web Push Notifications](https://www.magicbell.com/blog/firebase-web-push-notifications)

**Safari iOS Web Push:**
- [Sending web push notifications in web apps and browsers | Apple Developer Documentation](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers)
- [iOS web push setup - OneSignal](https://documentation.onesignal.com/docs/en/web-push-for-ios)
- [WWDC 2025 - Declarative Web Push](https://dev.to/arshtechpro/wwdc-2025-declarative-web-push-dn4)
- [PWA on iOS - Current Status & Limitations for Users [2025]](https://brainhub.eu/library/pwa-on-ios)

**Expo Push Notifications:**
- [Notifications - Expo Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo push notifications setup - Expo Documentation](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Using push notifications - Expo Documentation](https://docs.expo.dev/guides/using-push-notifications-services/)
- [Expo Push Notification Guide](https://www.magicbell.com/blog/a-guide-to-push-notifications-on-expo)
- [React Native Push Notifications Made Simple 2025](https://medium.com/@nnaemekaonyeji27/react-native-push-notifications-made-simple-ios-android-0d5995f202ab)

**Firebase Cloud Messaging:**
- [Get started with Firebase Cloud Messaging in Apple platform apps](https://firebase.google.com/docs/cloud-messaging/ios/get-started)
- [Set up a Firebase Cloud Messaging client app on Apple](https://firebase.google.com/docs/cloud-messaging/ios/client)
- [Apple Push Notification Service (APNs) Certificate Update 2025](https://programmervisit.com/apple-push-notification-apns-certificate-update-2025)

**Push Service Comparison:**
- [Firebase Cloud Messaging (FCM) vs. OneSignal](https://onesignal.com/blog/firebase-vs-onesignal/)
- [Expo vs OneSignal Push: Push Notification Provider Comparison [2025]](https://www.courier.com/integrations/compare/expo-vs-onesignal-push)
- [Top 5 Push Notification Services for Expo/React Native in 2025](https://pushbase.dev/blog/top-5-push-notification-services-for-expo-react-native-in-2025)
- [Firebase vs OneSignal: which should you choose in 2025?](https://ably.com/compare/firebase-vs-onesignal)
- [Why We Recommend OneSignal Over Firebase for Push Messaging in 2025](https://www.blueoshan.com/blog/why-we-recommend-onesignal-over-firebase-for-push-messaging)

**Amazon SNS:**
- [Amazon SNS pricing](https://aws.amazon.com/sns/pricing/)
- [AWS SNS Pricing Guide 2025: Complete Cost Breakdown & Optimization Strategies](https://costq.ai/blog/sns-pricing-guide/)
- [What is Amazon SNS? - Amazon Simple Notification Service](https://docs.aws.amazon.com/sns/latest/dg/welcome.html)

**Permission & Opt-In Best Practices:**
- [How to increase push notification opt-in rate: Best practices](https://www.pushwoosh.com/blog/increase-push-notifications-opt-in/)
- [Permission UX: Web Push Permission Prompts To Delight Your Users](https://izooto.com/blog/permission-ux-push-notification)
- [Push Notification UX Design: The Ultimate Guide 2025](https://uxcam.com/blog/push-notification-guide/)
- [The Ultimate Guide to Push Notification Consent in 2025](https://www.anstrex.com/blog/the-ultimate-guide-to-push-notification-consent-in-2025)
- [7 High-Converting Push Notification Opt In Examples (2025)](https://www.pushengage.com/push-notification-opt-in-examples/)
- [Average Push Notification Opt-In Rate (& How to Get More Opt-Ins)](https://www.mobiloud.com/blog/push-notification-opt-in-rate)

**Payload Limits:**
- [Limit of characters that can be sent through a push notification](https://help.pushwoosh.com/hc/en-us/articles/360000440366-Limit-of-characters-that-can-be-sent-through-a-push-notification)
- [Push Notification Character Limit For Mobile Marketers](https://clevertap.com/blog/what-are-push-notification-character-limits/)
- [Push Notification Character Limit for Android, iOS, and Web](https://getfirepush.com/blog/what-is-the-best-length-for-push-notifications/)
- [Push Notification Character Limits for iOS, Android, and Web: A Complete Guide](https://gravitec.net/blog/push-notification-character-limit-for-ios-android-and-web/)

**HIPAA Compliance:**
- [HIPAA-Compliant Push Notifications: A Guide for 2025](https://indigitall.com/en/blog/hipaa-compliant-push-notifications-a-guide-for-2025/)
- [HIPAA Compliant Push Notifications: The Ultimate Guide for Healthcare in 2026](https://indigitall.com/en/blog/hipaa-compliant-push-notifications-the-ultimate-guide-for-healthcare-in-2026/)
- [How to Make a HIPAA-Compliant Healthcare App in 2025](https://www.medicalwebexperts.com/blog/how-to-make-a-hipaa-compliant-healthcare-app/)
- [HIPAA Compliance in 2025: What's Changing & Why It Matters](https://www.compassitc.com/blog/hipaa-compliance-in-2025-whats-changing-why-it-matters)
- [New 2025 HIPAA Regulations: Key Changes & How to Stay Ahead](https://www.hipaavault.com/resources/2025-hipaa-new-regulations/)
- [The Complete HIPAA Compliance Checklist for 2025](https://www.rectanglehealth.com/resources/blogs/complete-hipaa-compiance-checklist-2025)

**Appointment Reminders:**
- [The Ultimate Guide to Appointment Reminders (SMS, Email, and Push)](https://de.acuityscheduling.com/learn/appointment-reminders-guide)
- [Medical Appointment Reminders: Cut No-Shows by 60% (2025 Guide)](https://smartsmssolutions.com/resources/blog/business/medical-appointment-reminders-cut-no-shows-by-60-2025-guide)
- [Automated Patient Reminders - BuddyHealthcare](https://www.buddyhealthcare.com/en/automated-patient-reminders)
- [Reduce No-Shows with Automated Appointment Reminders | Phreesia](https://www.phreesia.com/patient-appointment-reminders/)

**Deep Linking:**
- [How to use deep links in push notifications | Klaviyo](https://help.klaviyo.com/hc/en-us/articles/14750403974043)
- [Deep Links in Push Notifications – Iterable](https://support.iterable.com/hc/en-us/articles/360035453971-Deep-Links-in-Push-Notifications)
- [Deep Linking with Notifications in React Native](https://www.creolestudios.com/react-native-deep-linking-guide/)
- [What is Deep Linking? How Deep Links Boost App Engagement](https://clevertap.com/blog/deep-linking/)
- [Building Smart Push Notifications in React Native with Deep Linking](https://the-expert-developer.medium.com/building-smart-push-notifications-in-react-native-with-deep-linking-action-buttons-local-6d3a95b8a8c2)
- [Deep Linking - OneSignal](https://documentation.onesignal.com/docs/en/deep-linking)

**Service Workers:**
- [ServiceWorkerRegistration: showNotification() method - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification)
- [Service Worker API - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [A 5-minute guide to Push notifications in Progressive Web Apps](https://www.educative.io/blog/5-minute-guide-to-push-notifications-in-pwa)
- [Part 1 - Getting Started with Web Push Notifications Service Workers](https://www.suprsend.com/post/part-1---getting-started-with-web-push-notifications-service-workers)

---

**Document Version:** 1.0
**Author:** Medical Spa Platform Team
**Date:** December 23, 2025
**Next Review:** March 2026
