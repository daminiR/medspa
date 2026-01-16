# Medical Spa Notification System Architecture
## Comprehensive Architecture Recommendation

**Document Version:** 1.0
**Last Updated:** December 23, 2024
**Status:** Architecture Recommendation

---

## Executive Summary

This document provides a comprehensive architecture recommendation for the Luxe Medical Spa notification system, designed for healthcare-grade reliability, HIPAA compliance, and multi-channel delivery. Based on industry research and analysis of the existing codebase, this architecture supports transactional notifications, marketing campaigns, real-time alerts, and clinical communications.

**Key Goals:**
- HIPAA-compliant notification delivery across all channels
- Event-driven architecture for scalability and reliability
- Multi-channel support (SMS, Email, Push, In-app)
- Template management with version control
- Delivery tracking and analytics
- Patient preference management
- Audit trail for compliance

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Notification Types & Use Cases](#notification-types--use-cases)
3. [Architecture Overview](#architecture-overview)
4. [Multi-Channel Delivery](#multi-channel-delivery)
5. [HIPAA Compliance & Security](#hipaa-compliance--security)
6. [Event-Driven Design](#event-driven-design)
7. [Template Management](#template-management)
8. [Queue & Delivery System](#queue--delivery-system)
9. [Preference Management](#preference-management)
10. [Tracking & Analytics](#tracking--analytics)
11. [Technology Stack Recommendations](#technology-stack-recommendations)
12. [Implementation Roadmap](#implementation-roadmap)
13. [Best Practices & Patterns](#best-practices--patterns)

---

## Current State Analysis

### Existing Implementation

The medical spa platform currently has three notification-related services:

**1. In-App Notification Service** (`src/services/notifications.ts`)
- Desktop notifications and toast messages
- WebSocket event subscriptions
- Sound and visual alerts
- Limited to admin application only

**2. Messaging Service** (`src/services/messaging/core.ts`)
- SMS delivery via Twilio
- Rate limiting with Redis
- Conversation management
- Basic message queuing
- Webhook handling for incoming messages

**3. Appointment Reminders Service** (`src/services/messaging/reminders.ts`)
- Automated appointment reminders (48hr, 24hr, 2hr)
- Pre-visit preparation reminders
- Post-treatment follow-ups (24hr, 3day, 1week, 2week)
- Treatment-specific aftercare instructions
- No-show follow-ups

**4. Template Management** (`src/services/messaging/templates.ts`)
- 40+ pre-built message templates
- Variable substitution
- Template categorization (appointment, treatment, marketing, financial, etc.)
- HIPAA compliance flags
- Template validation

### Strengths
- Comprehensive template library covering most use cases
- HIPAA-aware template design (opt-out, PHI minimization)
- Multi-tiered reminder system (confirmation, pre-visit, reminders, follow-ups)
- Rate limiting and queue management foundations
- Treatment-specific messaging (prep instructions, aftercare)

### Gaps
- No email channel support
- No push notification support
- Limited analytics and delivery tracking
- No centralized event bus
- No preference management system
- Manual scheduling (cron-based, not event-driven)
- No notification history or audit trail
- No retry mechanism for failed deliveries
- No A/B testing capabilities
- Limited personalization beyond basic variables

---

## Notification Types & Use Cases

### 1. Transactional Notifications (High Priority)
**Purpose:** Time-sensitive, action-required communications
**Channels:** SMS, Email, Push
**HIPAA Requirements:** Medium sensitivity - minimal PHI

**Use Cases:**
- Appointment confirmations (immediate)
- Appointment reminders (48hr, 24hr, 2hr before)
- Appointment rescheduled/cancelled
- Payment confirmations
- Package purchase confirmations
- Waitlist opening notifications (30-minute response window)
- Check-in ready notifications
- Treatment room ready

**Characteristics:**
- Must be delivered within minutes
- Require delivery confirmation
- High reliability (99.9%+)
- User cannot opt-out (essential communications)
- Audit trail required

### 2. Clinical Communications (High Priority)
**Purpose:** Treatment-related medical communications
**Channels:** SMS, Email, Secure Portal
**HIPAA Requirements:** High sensitivity - contains PHI

**Use Cases:**
- Pre-visit preparation instructions (3-7 days before)
- Treatment-specific pre-care (24hr before)
- Post-treatment aftercare instructions (immediate)
- Post-treatment check-ins (24hr, 3day, 1week, 2week)
- Medication reminders
- Follow-up appointment recommendations
- Lab/test result notifications
- Consent form reminders

**Characteristics:**
- HIPAA-compliant secure delivery
- Encrypted content
- Audit trail required
- Patient consent required
- May include PHI
- Delivery confirmation required

### 3. Marketing & Promotional (Low Priority)
**Purpose:** Patient engagement and revenue generation
**Channels:** SMS, Email, Push
**HIPAA Requirements:** Low sensitivity - no PHI

**Use Cases:**
- Birthday offers and greetings
- VIP exclusive promotions
- Seasonal campaigns
- Win-back campaigns (inactive patients)
- Referral program invitations
- New treatment announcements
- Event invitations
- Educational content

**Characteristics:**
- Patient must opt-in explicitly
- Can be batched and delayed
- Requires opt-out mechanism (STOP)
- Subject to quiet hours
- Lower delivery priority
- A/B testing appropriate

### 4. Membership & Loyalty (Medium Priority)
**Purpose:** Membership program management
**Channels:** SMS, Email, Push, In-app
**HIPAA Requirements:** Low-Medium sensitivity

**Use Cases:**
- Membership welcome messages
- Monthly credit additions
- Credit expiration warnings
- Membership renewal reminders
- Tier upgrade notifications
- Exclusive member benefits
- Reward point updates

**Characteristics:**
- Scheduled delivery (monthly cycles)
- Personalized based on membership tier
- Delivery confirmation helpful
- Opt-in required for promotional content

### 5. Financial & Billing (Medium Priority)
**Purpose:** Payment and billing communications
**Channels:** SMS, Email, Secure Portal
**HIPAA Requirements:** Medium sensitivity - financial data

**Use Cases:**
- Payment reminders
- Payment confirmations
- Receipt delivery
- Payment plan updates
- Failed payment notifications
- Refund confirmations
- Outstanding balance notices
- Package session tracking

**Characteristics:**
- Secure delivery required
- Audit trail required
- Cannot opt-out (essential)
- May include financial PHI
- Delivery confirmation required

### 6. Administrative (Low-Medium Priority)
**Purpose:** Practice management communications
**Channels:** SMS, Email
**HIPAA Requirements:** Low-Medium sensitivity

**Use Cases:**
- Forms completion reminders
- Insurance update requests
- Policy changes
- Clinic closure notices
- Provider schedule changes
- Emergency notifications

**Characteristics:**
- Mixed priority levels
- Emergency notifications cannot be opted out
- Standard communications honor preferences
- Audit trail for compliance

### 7. Real-Time Alerts (Critical Priority)
**Purpose:** Immediate staff coordination and patient updates
**Channels:** In-app, Push, SMS (fallback)
**HIPAA Requirements:** High sensitivity - operational PHI

**Use Cases:**
- Treatment room ready
- Provider needs assistance
- Patient check-in alerts
- Inventory low stock warnings
- System sync errors
- Queue position updates
- Wait time notifications
- Staff assignment changes

**Characteristics:**
- Sub-second delivery required
- WebSocket/Push preferred
- Immediate acknowledgment
- Limited to authenticated users
- Session-based (expire after acknowledgment)

### 8. Patient Engagement & Reviews (Low Priority)
**Purpose:** Reputation management and feedback
**Channels:** SMS, Email
**HIPAA Requirements:** Low sensitivity

**Use Cases:**
- Treatment review requests
- Survey invitations
- Testimonial requests
- Review thank-you messages
- Feedback collection
- Net Promoter Score (NPS) surveys

**Characteristics:**
- Delayed sending (3-7 days post-treatment)
- Opt-in required
- Incentive-based (discount codes)
- Honor quiet hours
- Low delivery priority

---

## Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Admin   │  │ Patient  │  │ Charting │  │  Mobile  │  │   API    │ │
│  │   App    │  │  Portal  │  │   App    │  │   App    │  │ Clients  │ │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘ │
└────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────┘
         │             │             │             │             │
         └─────────────┴─────────────┴─────────────┴─────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────┐
│                         EVENT BUS LAYER                                  │
│                    ┌────────────────────────────┐                        │
│                    │   Event Bus (EventBridge)  │                        │
│                    │  - Event routing           │                        │
│                    │  - Event filtering         │                        │
│                    │  - Dead letter queue       │                        │
│                    └────────────┬───────────────┘                        │
└─────────────────────────────────┼──────────────────────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
┌────────▼────────┐  ┌───────────▼──────────┐  ┌─────────▼──────────┐
│  Notification   │  │   Template Service   │  │  Preference Service │
│  Orchestrator   │  │  - Template CRUD     │  │  - Channel prefs   │
│  - Event intake │  │  - Version control   │  │  - Opt-in/out      │
│  - Priority     │  │  - A/B testing       │  │  - Quiet hours     │
│  - Routing      │  │  - Localization      │  │  - Frequency caps  │
│  - Scheduling   │  │  - Validation        │  │  - DND settings    │
└────────┬────────┘  └──────────────────────┘  └────────────────────┘
         │
         ├─────────────────────────────────────────────────────┐
         │                                                     │
┌────────▼───────┐  ┌──────────┐  ┌──────────┐  ┌───────────▼───────┐
│  Priority      │  │  Email   │  │   Push   │  │    In-app         │
│  Queue         │  │  Queue   │  │  Queue   │  │    Queue          │
│  (BullMQ)      │  │ (BullMQ) │  │ (BullMQ) │  │    (BullMQ)       │
│  - High        │  └────┬─────┘  └────┬─────┘  └─────┬─────────────┘
│  - Normal      │       │             │               │
│  - Low         │       │             │               │
│  - Bulk        │       │             │               │
└────────┬───────┘       │             │               │
         │               │             │               │
┌────────▼───────┐  ┌───▼─────┐  ┌────▼─────┐  ┌──────▼─────┐
│  SMS Processor │  │  Email  │  │   Push   │  │   In-app   │
│  - Rate limit  │  │ Processor│ │ Processor│  │  Processor │
│  - Retry logic │  │ - HTML   │  │ - FCM    │  │  - WebSocket│
│  - Fallback    │  │ - Text   │  │ - APNS   │  │  - SSE     │
└────────┬───────┘  └────┬────┘  └────┬─────┘  └──────┬─────┘
         │               │             │               │
┌────────▼───────────────▼─────────────▼───────────────▼─────┐
│                  DELIVERY PROVIDERS                         │
│  ┌────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
│  │ Twilio │  │ SendGrid │  │ Firebase │  │   Native     │ │
│  │  (SMS) │  │ (Email)  │  │  (Push)  │  │  WebSocket   │ │
│  └────────┘  └──────────┘  └──────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼────────────────────────────────────┐
│                  TRACKING & ANALYTICS LAYER                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Audit Trail  │  │  Analytics   │  │  Delivery    │       │
│  │ (PostgreSQL) │  │  (TimescaleDB│  │  Status      │       │
│  │              │  │   or Mixpanel│  │  Tracking    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

### Architecture Principles

**1. Event-Driven Architecture**
- All notifications triggered by domain events
- Loose coupling between services
- Asynchronous processing
- Replay capability for failed events

**2. Multi-Channel Abstraction**
- Channel-agnostic notification creation
- Strategy pattern for channel selection
- Fallback channel support
- Channel-specific formatting

**3. Queue-Based Delivery**
- Separate queues per channel and priority
- Horizontal scaling of workers
- Guaranteed delivery (at-least-once)
- Dead letter queue for failures

**4. HIPAA Compliance by Design**
- Encryption at rest and in transit
- Minimal PHI in notifications
- Audit trail for all communications
- Secure credential management
- Patient consent tracking

**5. Preference-First Design**
- Channel preferences honored
- Quiet hours enforcement
- Opt-out support (where allowed)
- Frequency capping
- Do-not-disturb settings

---

## Multi-Channel Delivery

### Channel Selection Strategy

```typescript
interface NotificationRequest {
  type: NotificationType;
  priority: 'critical' | 'high' | 'normal' | 'low';
  channels: Channel[];
  patientId: string;
  content: NotificationContent;
  metadata: Record<string, any>;
}

interface Channel {
  type: 'sms' | 'email' | 'push' | 'in_app';
  fallback?: Channel;
  timeout?: number;
}
```

**Channel Selection Logic:**

1. **Critical/Urgent Notifications** (Appointment cancellations, emergencies)
   - Primary: SMS
   - Fallback: Push notification
   - Fallback: Email
   - Deliver immediately, ignore quiet hours

2. **Transactional** (Confirmations, reminders)
   - Primary: Based on patient preference
   - Fallback: SMS if preference unavailable
   - Honor quiet hours

3. **Marketing** (Promotions, campaigns)
   - Only opted-in channels
   - Honor quiet hours
   - Batch delivery acceptable
   - Rate limiting enforced

4. **Real-Time Alerts** (Staff coordination)
   - Primary: In-app (WebSocket)
   - Fallback: Push notification
   - Desktop notifications
   - Audio alerts

### Channel-Specific Implementation

#### SMS Channel

**Provider:** Twilio
**Existing Implementation:** `/src/services/messaging/core.ts`

**Features:**
- 160-character limit (single segment)
- Concatenated messages for longer content
- Rate limiting: 100 messages/minute/number
- Status callbacks for delivery tracking
- Two-way messaging support

**Enhancements Needed:**
- Short URL generation for links
- Link tracking and analytics
- Delivery retry logic (3 attempts with exponential backoff)
- Carrier-specific error handling
- International number support

**HIPAA Considerations:**
- Minimal PHI in message body
- Generic appointment details only
- Secure portal links for detailed information
- Opt-out support ("Reply STOP")

#### Email Channel

**Provider Recommendation:** SendGrid or AWS SES
**Status:** Not yet implemented

**Features:**
- HTML and plain text templates
- Rich media support (images, logos)
- Link tracking and click analytics
- Bounce and complaint handling
- Unsubscribe management
- Attachment support (receipts, forms)

**Template Structure:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif;">
    <!-- Header with logo -->
    <div style="background: #667eea; padding: 20px; text-align: center;">
      <img src="{{logoUrl}}" alt="Luxe Medical Spa" style="height: 50px;">
    </div>

    <!-- Body content -->
    <div style="padding: 30px; background: #ffffff;">
      {{content}}
    </div>

    <!-- Footer -->
    <div style="padding: 20px; background: #f5f5f5; font-size: 12px; color: #666;">
      <p>Luxe Medical Spa | {{clinicAddress}}</p>
      <p>
        <a href="{{unsubscribeUrl}}">Unsubscribe</a> |
        <a href="{{privacyUrl}}">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>
```

**Use Cases:**
- Appointment confirmations with calendar attachment (.ics)
- Detailed aftercare instructions with images
- Monthly newsletters
- Package/membership statements
- Receipts and invoices
- Forms and consent documents
- Educational content

**HIPAA Considerations:**
- Encrypted transmission (TLS 1.2+)
- Encrypted storage of email content
- BAA with email provider
- Audit logging of all emails
- Unsubscribe tracking
- Content should direct to secure portal for PHI

#### Push Notifications

**Provider Recommendation:** Firebase Cloud Messaging (FCM) + APNS
**Status:** Not yet implemented

**Features:**
- iOS and Android support
- Rich notifications (images, actions)
- Silent notifications for data sync
- Badge count updates
- Sound and vibration control
- Deep linking to app screens

**Implementation:**
```typescript
interface PushNotification {
  title: string;
  body: string;
  imageUrl?: string;
  actions?: NotificationAction[];
  data?: Record<string, string>;
  badge?: number;
  sound?: string;
  deepLink?: string;
  priority: 'high' | 'normal';
  ttl?: number; // Time to live in seconds
}

interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
  destructive?: boolean;
}
```

**Use Cases:**
- Appointment reminders
- Waitlist opening alerts
- Check-in ready notifications
- Treatment room ready
- Message received
- Package session reminders
- Promotional offers (with opt-in)

**HIPAA Considerations:**
- No PHI in notification payload
- Generic messages only ("You have a new message")
- Secure authentication required to view details
- Device token management
- Audit trail of push delivery

#### In-App Notifications

**Provider:** Native WebSocket + Server-Sent Events (SSE)
**Existing Implementation:** `/src/services/notifications.ts`

**Features:**
- Real-time delivery (sub-second)
- Persistent notification center
- Desktop browser notifications
- Sound alerts
- Action buttons
- Auto-dismiss timers
- Notification grouping

**Enhancements Needed:**
- Notification persistence to database
- Read/unread status tracking
- Notification history
- Notification preferences per category
- Mark all as read
- Notification search
- Archive functionality

**Use Cases:**
- Treatment ready for payment
- Documentation received
- Provider needs assistance
- Low stock alerts
- Sync errors
- Queue updates
- Staff messages
- System alerts

**HIPAA Considerations:**
- Session-based authentication required
- RBAC for notification visibility
- Encrypted WebSocket connection (WSS)
- No persistent PHI in browser storage

### Channel Fallback Logic

```typescript
async function deliverWithFallback(
  notification: NotificationRequest,
  channels: Channel[]
): Promise<DeliveryResult> {
  for (const channel of channels) {
    try {
      const result = await deliverToChannel(notification, channel);

      if (result.status === 'delivered' || result.status === 'sent') {
        return result;
      }

      // If channel failed, try fallback
      if (channel.fallback) {
        await sleep(channel.timeout || 30000); // Wait before fallback
        continue;
      }

    } catch (error) {
      // Log error and try next channel
      await logDeliveryError(notification, channel, error);
    }
  }

  // All channels failed - send to dead letter queue
  await sendToDeadLetterQueue(notification);
  throw new Error('All delivery channels failed');
}
```

**Fallback Scenarios:**

1. **SMS Delivery Failure**
   - Reason: Invalid number, carrier rejection, rate limit
   - Fallback: Email (if available)
   - Fallback: Push notification
   - Final: Log in patient portal for next login

2. **Email Delivery Failure**
   - Reason: Invalid address, bounce, spam filter
   - Fallback: SMS (for critical notifications only)
   - Final: In-app notification

3. **Push Notification Failure**
   - Reason: Device offline, token expired, delivery timeout
   - Fallback: SMS (for urgent notifications)
   - Final: In-app notification for next app open

4. **In-App Delivery Failure**
   - Reason: User offline, WebSocket disconnected
   - Fallback: SMS or Email (based on urgency)
   - Persist for next login

---

## HIPAA Compliance & Security

### Protected Health Information (PHI) Guidelines

**PHI Categories in Notifications:**

1. **Direct PHI** (Never in notifications)
   - Medical diagnoses
   - Treatment details beyond service name
   - Medication information
   - Lab results
   - Medical history
   - Specific health conditions

2. **Indirect PHI** (Minimize in notifications)
   - Patient full name
   - Detailed appointment information
   - Provider specialty (may imply condition)
   - Treatment location (may imply condition)
   - Financial amounts (may imply treatment)

3. **Acceptable Identifiers** (OK in secure channels)
   - Patient first name only
   - Generic service names
   - Appointment date and time
   - Clinic name and address
   - Confirmation/reference numbers

### Notification Content Strategy

**Level 1: No PHI (Public channels - SMS, Email subject, Push preview)**
```
"Hi Sarah! You have an appointment tomorrow at 2:00 PM. Tap to view details."
"You have a new message. Log in to view."
"Your appointment is confirmed. Check email for details."
```

**Level 2: Minimal PHI (Authenticated channels - Email body, In-app)**
```
"Hi Sarah! Your appointment for cosmetic treatment is confirmed for
tomorrow at 2:00 PM with Dr. Smith. View full details in your secure portal."
```

**Level 3: Full Details (Secure portal only - Behind authentication)**
```
"Appointment Confirmed
Service: Botox Treatment - Forehead and Glabella
Provider: Dr. Jennifer Smith, MD
Date: Tuesday, December 24, 2024 at 2:00 PM
Duration: 30 minutes
Room: Treatment Room 3
Preparation: Avoid alcohol and blood thinners 24 hours before"
```

### Security Requirements

**1. Encryption**
```typescript
// Data at rest
const encryptionConfig = {
  algorithm: 'AES-256-GCM',
  keyRotation: '90 days',
  keyManagement: 'AWS KMS or Azure Key Vault',
};

// Data in transit
const tlsConfig = {
  minVersion: 'TLS 1.2',
  preferredVersion: 'TLS 1.3',
  certificateProvider: 'Let\'s Encrypt or AWS ACM',
};
```

**2. Access Control**
```typescript
interface NotificationAccess {
  // Role-based access control
  rbac: {
    admin: ['create', 'read', 'update', 'delete', 'audit'];
    provider: ['create', 'read', 'audit'];
    staff: ['create', 'read'];
    patient: ['read_own'];
  };

  // Attribute-based access control
  abac: {
    patientId: string; // Can only access own notifications
    providerId?: string; // Can access assigned patient notifications
    clinicId: string; // Clinic boundary
  };
}
```

**3. Audit Trail**
```typescript
interface NotificationAuditLog {
  id: string;
  timestamp: Date;
  action: 'created' | 'sent' | 'delivered' | 'failed' | 'viewed' | 'deleted';
  notificationId: string;
  notificationType: string;
  channel: 'sms' | 'email' | 'push' | 'in_app';

  // Who
  userId: string;
  userRole: string;
  ipAddress: string;
  userAgent?: string;

  // What
  patientId: string;
  containsPHI: boolean;
  phiLevel: 'none' | 'minimal' | 'moderate' | 'full';

  // Delivery details
  recipient: string; // Hashed or encrypted
  deliveryStatus: string;
  errorCode?: string;
  errorMessage?: string;
  deliveryProvider: string;
  deliveryAttempts: number;

  // Compliance
  consentId?: string;
  optInStatus: boolean;
  patientPreferenceId?: string;
}
```

**4. Consent Management**
```typescript
interface PatientConsent {
  patientId: string;
  consentType: 'sms_transactional' | 'sms_marketing' | 'email_transactional' |
                'email_marketing' | 'push_notifications' | 'portal_notifications';
  status: 'opted_in' | 'opted_out' | 'pending';
  consentDate: Date;
  consentMethod: 'verbal' | 'written' | 'electronic' | 'implied';
  consentSource: string; // Form ID, tablet signature, etc.
  expiryDate?: Date;

  // Audit trail
  updatedBy: string;
  updatedAt: Date;
  ipAddress?: string;
  version: number;
}
```

**5. Data Retention**
```typescript
const retentionPolicy = {
  // Audit logs - 7 years (HIPAA requirement)
  auditLogs: {
    retention: '7 years',
    archiveAfter: '2 years',
    deleteAfter: '7 years',
  },

  // Notification content - 3 years
  notificationContent: {
    retention: '3 years',
    archiveAfter: '1 year',
    deleteAfter: '3 years',
  },

  // Delivery metadata - 1 year
  deliveryMetadata: {
    retention: '1 year',
    archiveAfter: '6 months',
    deleteAfter: '1 year',
  },

  // Patient consent records - Lifetime + 7 years
  consentRecords: {
    retention: 'lifetime + 7 years after last interaction',
  },
};
```

### Business Associate Agreements (BAA)

**Required BAAs:**
- Twilio (SMS delivery) ✓
- SendGrid or AWS SES (Email delivery)
- Firebase/Google Cloud (Push notifications)
- Cloud hosting provider (AWS, Azure, Google Cloud)
- Database provider (if managed service)
- Analytics provider (if stores PHI)

**BAA Checklist:**
- [ ] Vendor agrees to HIPAA compliance
- [ ] Data encryption at rest and in transit
- [ ] Access controls and audit logging
- [ ] Breach notification procedures
- [ ] Data retention and destruction policies
- [ ] Subcontractor management
- [ ] Right to audit
- [ ] Data ownership and portability

---

## Event-Driven Design

### Event Bus Architecture

**Event Bus Provider:** AWS EventBridge or Google Cloud Pub/Sub

**Benefits:**
- Decoupled services
- Event replay capability
- Multiple subscribers per event
- Event filtering and routing
- Dead letter queue support
- Event archive for compliance

### Domain Events

```typescript
// Base event interface
interface DomainEvent {
  eventId: string;
  eventType: string;
  timestamp: Date;
  version: string;
  source: string;
  correlationId?: string;
  metadata: Record<string, any>;
}

// Appointment events
interface AppointmentCreatedEvent extends DomainEvent {
  eventType: 'appointment.created';
  payload: {
    appointmentId: string;
    patientId: string;
    patientName: string;
    patientPhone: string;
    patientEmail?: string;
    service: string;
    provider: string;
    providerId: string;
    appointmentDate: Date;
    appointmentTime: string;
    duration: number;
    status: 'scheduled';
    smsOptIn: boolean;
    emailOptIn: boolean;
  };
}

interface AppointmentRescheduledEvent extends DomainEvent {
  eventType: 'appointment.rescheduled';
  payload: {
    appointmentId: string;
    patientId: string;
    oldDate: Date;
    oldTime: string;
    newDate: Date;
    newTime: string;
    reason?: string;
    rescheduledBy: string;
  };
}

interface AppointmentCancelledEvent extends DomainEvent {
  eventType: 'appointment.cancelled';
  payload: {
    appointmentId: string;
    patientId: string;
    appointmentDate: Date;
    appointmentTime: string;
    cancellationReason?: string;
    cancelledBy: string;
    refundIssued: boolean;
  };
}

interface AppointmentCompletedEvent extends DomainEvent {
  eventType: 'appointment.completed';
  payload: {
    appointmentId: string;
    patientId: string;
    service: string;
    treatmentType: string;
    providerId: string;
    completedAt: Date;
    duration: number;
    chartingComplete: boolean;
  };
}

interface AppointmentNoShowEvent extends DomainEvent {
  eventType: 'appointment.no_show';
  payload: {
    appointmentId: string;
    patientId: string;
    scheduledDate: Date;
    scheduledTime: string;
    noShowFeeCharged: boolean;
  };
}

// Waitlist events
interface WaitlistSlotAvailableEvent extends DomainEvent {
  eventType: 'waitlist.slot_available';
  payload: {
    slotId: string;
    waitlistPatients: string[]; // Ordered by priority
    service: string;
    provider: string;
    date: Date;
    time: string;
    expiresAt: Date; // 30 minutes to claim
  };
}

// Treatment events
interface TreatmentCompletedEvent extends DomainEvent {
  eventType: 'treatment.completed';
  payload: {
    treatmentId: string;
    appointmentId: string;
    patientId: string;
    treatmentType: string;
    providerId: string;
    productsUsed: string[];
    completedAt: Date;
  };
}

// Payment events
interface PaymentReceivedEvent extends DomainEvent {
  eventType: 'payment.received';
  payload: {
    paymentId: string;
    patientId: string;
    amount: number;
    method: string;
    appointmentId?: string;
    packageId?: string;
    receiptUrl: string;
  };
}

interface PaymentFailedEvent extends DomainEvent {
  eventType: 'payment.failed';
  payload: {
    paymentId: string;
    patientId: string;
    amount: number;
    failureReason: string;
    retryable: boolean;
  };
}

// Membership events
interface MembershipCreditsAddedEvent extends DomainEvent {
  eventType: 'membership.credits_added';
  payload: {
    membershipId: string;
    patientId: string;
    creditsAdded: number;
    newBalance: number;
    expiryDate: Date;
  };
}

// Inventory events
interface InventoryLowStockEvent extends DomainEvent {
  eventType: 'inventory.low_stock';
  payload: {
    productId: string;
    productName: string;
    currentQuantity: number;
    reorderPoint: number;
    unit: string;
  };
}

// Message events
interface MessageReceivedEvent extends DomainEvent {
  eventType: 'message.received';
  payload: {
    messageId: string;
    conversationId: string;
    patientId: string;
    from: string;
    body: string;
    channel: 'sms' | 'email' | 'portal';
    receivedAt: Date;
    urgent: boolean;
  };
}
```

### Event-to-Notification Mapping

```typescript
const eventNotificationMap: Record<string, NotificationConfig> = {
  'appointment.created': {
    notifications: [
      {
        type: 'appointment_confirmation',
        timing: 'immediate',
        channels: ['sms', 'email'],
        priority: 'high',
        templateId: 'appointment_confirmation',
      },
    ],
  },

  'appointment.rescheduled': {
    notifications: [
      {
        type: 'appointment_rescheduled',
        timing: 'immediate',
        channels: ['sms', 'email'],
        priority: 'high',
        templateId: 'appointment_rescheduled',
      },
    ],
  },

  'appointment.completed': {
    notifications: [
      {
        type: 'treatment_followup_24hr',
        timing: 'delay:24h',
        channels: ['sms'],
        priority: 'normal',
        templateId: 'treatment_followup_24hr',
      },
      {
        type: 'treatment_followup_3day',
        timing: 'delay:3d',
        channels: ['sms'],
        priority: 'low',
        templateId: 'treatment_followup_3day',
      },
      {
        type: 'review_request',
        timing: 'delay:7d',
        channels: ['sms', 'email'],
        priority: 'low',
        templateId: 'review_request',
      },
    ],
  },

  'waitlist.slot_available': {
    notifications: [
      {
        type: 'waitlist_opening',
        timing: 'immediate',
        channels: ['sms', 'push'],
        priority: 'critical',
        templateId: 'appointment_waitlist',
        expiresAt: 'now + 30min',
      },
    ],
  },

  'payment.received': {
    notifications: [
      {
        type: 'payment_confirmation',
        timing: 'immediate',
        channels: ['sms', 'email'],
        priority: 'normal',
        templateId: 'financial_payment_received',
      },
    ],
  },

  'inventory.low_stock': {
    notifications: [
      {
        type: 'low_stock_alert',
        timing: 'immediate',
        channels: ['in_app', 'email'],
        priority: 'normal',
        templateId: 'admin_low_stock',
        recipients: ['admin', 'inventory_manager'],
      },
    ],
  },
};
```

### Scheduled Event Generation

For time-based reminders, a scheduler service generates events:

```typescript
interface SchedulerService {
  // Run every 5 minutes
  async generateReminderEvents(): Promise<void> {
    const now = new Date();

    // Get appointments needing reminders in next 5 minutes
    const appointments = await getUpcomingAppointments(now, 5);

    for (const appointment of appointments) {
      const reminderTime = this.calculateReminderTime(appointment);

      if (this.shouldSendReminder(reminderTime, now)) {
        await this.publishEvent({
          eventType: 'appointment.reminder_due',
          payload: {
            appointmentId: appointment.id,
            reminderType: this.getReminderType(reminderTime, appointment.date),
            ...appointment,
          },
        });
      }
    }
  }

  private getReminderType(reminderTime: Date, appointmentDate: Date): string {
    const hoursUntil = (appointmentDate.getTime() - reminderTime.getTime()) / (1000 * 60 * 60);

    if (hoursUntil >= 47 && hoursUntil <= 49) return '48hr';
    if (hoursUntil >= 23 && hoursUntil <= 25) return '24hr';
    if (hoursUntil >= 1.5 && hoursUntil <= 2.5) return '2hr';

    return 'unknown';
  }
}
```

---

## Template Management

### Template Versioning

```typescript
interface TemplateVersion {
  id: string;
  templateId: string;
  version: number;
  name: string;
  category: TemplateCategory;
  channel: 'sms' | 'email' | 'push' | 'in_app' | 'all';

  // Content
  subject?: string; // For emails
  body: string;
  htmlBody?: string; // For emails
  variables: TemplateVariable[];

  // Metadata
  status: 'draft' | 'active' | 'archived';
  createdBy: string;
  createdAt: Date;
  activatedAt?: Date;
  archivedAt?: Date;

  // A/B testing
  testVariant?: 'A' | 'B';
  testTrafficPercentage?: number;

  // Performance
  sentCount: number;
  deliveryRate: number;
  clickRate?: number;
  conversionRate?: number;

  // Compliance
  compliance: {
    hipaaCompliant: boolean;
    includesOptOut: boolean;
    reviewedBy?: string;
    reviewedAt?: Date;
    approvalRequired: boolean;
  };
}

interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
  defaultValue?: any;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  description: string;
  examples: string[];
}
```

### Template Editor Features

**1. Visual Editor**
- WYSIWYG HTML editor for emails
- Real-time preview for SMS
- Variable insertion UI
- Character count for SMS
- Mobile preview
- Dark mode preview

**2. Version Control**
- Git-like versioning
- Diff view between versions
- Rollback capability
- Change history
- Version comments

**3. A/B Testing**
```typescript
interface ABTest {
  id: string;
  templateId: string;
  name: string;
  status: 'draft' | 'running' | 'completed';

  variants: {
    variantA: {
      templateVersionId: string;
      trafficPercentage: number;
      sentCount: number;
      deliveryRate: number;
      clickRate: number;
      conversionRate: number;
    };
    variantB: {
      templateVersionId: string;
      trafficPercentage: number;
      sentCount: number;
      deliveryRate: number;
      clickRate: number;
      conversionRate: number;
    };
  };

  hypothesis: string;
  successMetric: 'delivery_rate' | 'click_rate' | 'conversion_rate';
  minimumSampleSize: number;
  confidenceLevel: number; // 95%, 99%

  startDate: Date;
  endDate?: Date;
  winner?: 'A' | 'B' | 'inconclusive';
  conclusion?: string;
}
```

**4. Localization**
```typescript
interface LocalizedTemplate {
  templateId: string;
  locale: string; // en-US, es-ES, etc.
  name: string;
  subject?: string;
  body: string;
  htmlBody?: string;

  // Fallback to default locale if translation missing
  fallbackLocale: string;

  translatedBy?: string;
  translatedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
}
```

**5. Template Variables with Smart Defaults**
```typescript
const templateVariableDefaults = {
  // Patient variables
  patientFirstName: (patient) => patient.firstName,
  patientFullName: (patient) => `${patient.firstName} ${patient.lastName}`,

  // Date formatting
  appointmentDate: (date) => formatDate(date, 'MMM D, YYYY'),
  appointmentTime: (date) => formatTime(date, 'h:mm A'),
  appointmentDateTime: (date) => formatDateTime(date, 'MMM D, YYYY at h:mm A'),

  // Clinic variables
  clinicName: () => getConfig('clinic.name'),
  clinicPhone: () => getConfig('clinic.phone'),
  clinicAddress: () => getConfig('clinic.address'),
  clinicWebsite: () => getConfig('clinic.website'),

  // Dynamic URLs
  bookingUrl: () => generateBookingUrl(),
  patientPortalUrl: (patientId) => generatePortalUrl(patientId),
  unsubscribeUrl: (patientId) => generateUnsubscribeUrl(patientId),

  // Personalization
  preferredName: (patient) => patient.preferredName || patient.firstName,
  greeting: (patient, time) => getTimeBasedGreeting(patient, time),
};
```

### Template Approval Workflow

```typescript
interface TemplateApprovalWorkflow {
  templateId: string;
  versionId: string;
  status: 'pending' | 'approved' | 'rejected';

  requester: {
    userId: string;
    name: string;
    role: string;
    requestedAt: Date;
  };

  approver?: {
    userId: string;
    name: string;
    role: string;
    reviewedAt?: Date;
    comments?: string;
  };

  // Compliance checklist
  checklist: {
    hipaaCompliant: boolean;
    noDirectPHI: boolean;
    optOutIncluded: boolean;
    legalReviewed: boolean;
    brandingApproved: boolean;
    variablesValidated: boolean;
  };
}

// Auto-approval rules
const autoApprovalRules = {
  // Minor edits don't need approval
  minorEdit: (oldVersion, newVersion) => {
    const changes = calculateDiff(oldVersion.body, newVersion.body);
    return changes.percentageChanged < 10; // Less than 10% changed
  },

  // Transactional templates require approval
  transactionalTemplate: (template) => {
    return ['appointment', 'financial', 'treatment'].includes(template.category);
  },

  // Marketing templates always require approval
  marketingTemplate: (template) => {
    return template.category === 'marketing';
  },
};
```

---

## Queue & Delivery System

### Queue Architecture (BullMQ)

**Why BullMQ:**
- Redis-backed job queue
- Built-in retry mechanism
- Priority queues
- Rate limiting
- Job scheduling
- Event system for monitoring
- Horizontal scaling
- Persistent jobs

```typescript
import { Queue, Worker } from 'bullmq';

// Priority-based queues
const queues = {
  critical: new Queue('notifications:critical', {
    connection: redis,
    defaultJobOptions: {
      priority: 1,
      attempts: 5,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: { age: 3600, count: 1000 }, // Keep 1 hour or 1000 jobs
      removeOnFail: { age: 86400 }, // Keep failed jobs for 24 hours
    },
  }),

  high: new Queue('notifications:high', {
    connection: redis,
    defaultJobOptions: {
      priority: 2,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    },
  }),

  normal: new Queue('notifications:normal', {
    connection: redis,
    defaultJobOptions: {
      priority: 3,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    },
  }),

  low: new Queue('notifications:low', {
    connection: redis,
    defaultJobOptions: {
      priority: 4,
      attempts: 2,
      backoff: { type: 'fixed', delay: 60000 }, // 1 minute
    },
  }),
};

// Channel-specific queues
const channelQueues = {
  sms: new Queue('notifications:sms', { connection: redis }),
  email: new Queue('notifications:email', { connection: redis }),
  push: new Queue('notifications:push', { connection: redis }),
  in_app: new Queue('notifications:in_app', { connection: redis }),
};
```

### Job Processing Workers

```typescript
// SMS Worker
const smsWorker = new Worker(
  'notifications:sms',
  async (job) => {
    const { notification, attempt } = job.data;

    try {
      // Check rate limit
      const rateLimitOk = await checkRateLimit(notification.recipient);
      if (!rateLimitOk) {
        throw new Error('Rate limit exceeded');
      }

      // Check quiet hours (unless critical)
      if (notification.priority !== 'critical') {
        const isQuietHours = await checkQuietHours(notification.recipient);
        if (isQuietHours) {
          // Reschedule for next business hours
          const nextValidTime = await getNextBusinessHours();
          await job.moveToDelayed(nextValidTime.getTime());
          return;
        }
      }

      // Send SMS
      const result = await twilioClient.messages.create({
        to: notification.recipient,
        body: notification.body,
        from: config.twilioPhoneNumber,
        statusCallback: `${config.apiUrl}/webhooks/sms/status/${job.id}`,
      });

      // Track delivery
      await trackDelivery({
        notificationId: notification.id,
        jobId: job.id,
        channel: 'sms',
        status: 'sent',
        providerId: result.sid,
        sentAt: new Date(),
      });

      return { success: true, sid: result.sid };

    } catch (error) {
      // Log error
      await logDeliveryError({
        notificationId: notification.id,
        jobId: job.id,
        channel: 'sms',
        error: error.message,
        attempt,
      });

      // Determine if we should retry or fail
      if (error.code === 21211) { // Invalid phone number
        throw new Error('PERMANENT_FAILURE: Invalid phone number');
      }

      throw error; // Retry for other errors
    }
  },
  {
    connection: redis,
    concurrency: 10, // Process 10 jobs simultaneously
    limiter: {
      max: 100, // Max 100 jobs per duration
      duration: 60000, // Per minute
    },
  }
);

// Email Worker
const emailWorker = new Worker(
  'notifications:email',
  async (job) => {
    const { notification } = job.data;

    try {
      // Render email template
      const html = await renderEmailTemplate(notification.templateId, notification.variables);
      const text = await renderTextVersion(html);

      // Send via SendGrid
      const result = await sendgridClient.send({
        to: notification.recipient,
        from: {
          email: config.fromEmail,
          name: config.fromName,
        },
        subject: notification.subject,
        text,
        html,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true },
        },
        customArgs: {
          notificationId: notification.id,
          jobId: job.id,
        },
      });

      await trackDelivery({
        notificationId: notification.id,
        jobId: job.id,
        channel: 'email',
        status: 'sent',
        providerId: result.messageId,
        sentAt: new Date(),
      });

      return { success: true, messageId: result.messageId };

    } catch (error) {
      await logDeliveryError({
        notificationId: notification.id,
        jobId: job.id,
        channel: 'email',
        error: error.message,
      });

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 20, // Email can handle higher concurrency
  }
);

// Push Notification Worker
const pushWorker = new Worker(
  'notifications:push',
  async (job) => {
    const { notification } = job.data;

    try {
      // Get device tokens for patient
      const tokens = await getDeviceTokens(notification.patientId);

      if (tokens.length === 0) {
        throw new Error('No device tokens found');
      }

      // Send to all devices
      const results = await Promise.allSettled(
        tokens.map((token) =>
          fcmAdmin.messaging().send({
            token: token.value,
            notification: {
              title: notification.title,
              body: notification.body,
              imageUrl: notification.imageUrl,
            },
            data: notification.data,
            android: {
              priority: notification.priority === 'critical' ? 'high' : 'normal',
              notification: {
                channelId: notification.channelId || 'default',
                sound: notification.sound || 'default',
              },
            },
            apns: {
              payload: {
                aps: {
                  badge: notification.badge,
                  sound: notification.sound || 'default',
                  contentAvailable: notification.contentAvailable,
                },
              },
            },
          })
        )
      );

      // Track success/failure per device
      const successes = results.filter((r) => r.status === 'fulfilled').length;
      const failures = results.filter((r) => r.status === 'rejected').length;

      await trackDelivery({
        notificationId: notification.id,
        jobId: job.id,
        channel: 'push',
        status: successes > 0 ? 'sent' : 'failed',
        sentAt: new Date(),
        metadata: { successes, failures, totalTokens: tokens.length },
      });

      return { success: successes > 0, successes, failures };

    } catch (error) {
      await logDeliveryError({
        notificationId: notification.id,
        jobId: job.id,
        channel: 'push',
        error: error.message,
      });

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 15,
  }
);
```

### Rate Limiting Strategy

```typescript
interface RateLimitConfig {
  // Per recipient limits
  perRecipient: {
    sms: {
      maxPerMinute: 5,
      maxPerHour: 10,
      maxPerDay: 50,
    },
    email: {
      maxPerMinute: 2,
      maxPerHour: 20,
      maxPerDay: 100,
    },
    push: {
      maxPerMinute: 10,
      maxPerHour: 50,
      maxPerDay: 200,
    },
  };

  // Global limits (across all recipients)
  global: {
    sms: {
      maxPerSecond: 100, // Twilio limit
      maxPerDay: 50000,
    },
    email: {
      maxPerSecond: 500, // SendGrid limit
      maxPerDay: 100000,
    },
  };

  // Campaign limits
  campaign: {
    maxRecipientsPerBatch: 1000,
    delayBetweenBatches: 60000, // 1 minute
  };
}

class RateLimiter {
  private redis: Redis;

  async checkLimit(
    recipient: string,
    channel: 'sms' | 'email' | 'push'
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    const config = rateLimitConfig.perRecipient[channel];

    // Check minute limit
    const minuteKey = `rate:${channel}:${recipient}:minute`;
    const minuteCount = await this.redis.incr(minuteKey);
    if (minuteCount === 1) {
      await this.redis.expire(minuteKey, 60);
    }
    if (minuteCount > config.maxPerMinute) {
      return { allowed: false, retryAfter: await this.redis.ttl(minuteKey) };
    }

    // Check hour limit
    const hourKey = `rate:${channel}:${recipient}:hour`;
    const hourCount = await this.redis.incr(hourKey);
    if (hourCount === 1) {
      await this.redis.expire(hourKey, 3600);
    }
    if (hourCount > config.maxPerHour) {
      return { allowed: false, retryAfter: await this.redis.ttl(hourKey) };
    }

    // Check day limit
    const dayKey = `rate:${channel}:${recipient}:day`;
    const dayCount = await this.redis.incr(dayKey);
    if (dayCount === 1) {
      await this.redis.expire(dayKey, 86400);
    }
    if (dayCount > config.maxPerDay) {
      return { allowed: false, retryAfter: await this.redis.ttl(dayKey) };
    }

    return { allowed: true };
  }
}
```

### Retry Strategy

```typescript
interface RetryStrategy {
  // Retry configuration per error type
  errorStrategies: {
    // Transient errors - retry with backoff
    transient: {
      errors: ['TIMEOUT', 'SERVICE_UNAVAILABLE', 'RATE_LIMIT'],
      maxAttempts: 5,
      backoff: 'exponential',
      baseDelay: 1000,
      maxDelay: 300000, // 5 minutes
    },

    // Permanent errors - don't retry
    permanent: {
      errors: ['INVALID_PHONE', 'INVALID_EMAIL', 'UNSUBSCRIBED', 'BLOCKED'],
      maxAttempts: 0,
    },

    // Soft bounces - retry few times
    softBounce: {
      errors: ['MAILBOX_FULL', 'TEMPORARY_FAILURE'],
      maxAttempts: 3,
      backoff: 'fixed',
      baseDelay: 3600000, // 1 hour
    },
  };

  // Fallback strategy
  fallback: {
    enabled: true,
    channels: ['sms', 'email', 'push', 'in_app'],
    delayBeforeFallback: 30000, // 30 seconds
  };
}

async function handleJobFailure(job: Job, error: Error) {
  const { notification } = job.data;
  const attempt = job.attemptsMade;

  // Classify error
  const errorType = classifyError(error);
  const strategy = retryStrategy.errorStrategies[errorType];

  if (errorType === 'permanent') {
    // Mark as permanently failed
    await markNotificationFailed(notification.id, error.message, 'permanent');
    return;
  }

  if (attempt >= strategy.maxAttempts) {
    // Try fallback channel
    if (retryStrategy.fallback.enabled) {
      const fallbackChannel = getFallbackChannel(notification.channel);
      if (fallbackChannel) {
        await queueNotificationToChannel(notification, fallbackChannel);
        return;
      }
    }

    // All attempts exhausted
    await markNotificationFailed(notification.id, error.message, 'exhausted');
    return;
  }

  // Will retry automatically via BullMQ backoff
}
```

---

## Preference Management

### Patient Preference Model

```typescript
interface PatientNotificationPreferences {
  patientId: string;

  // Global preferences
  globalOptOut: boolean; // Opt out of all non-essential communications

  // Channel preferences
  channels: {
    sms: {
      enabled: boolean;
      phoneNumber: string;
      verified: boolean;
      optIn: {
        transactional: boolean; // Cannot opt-out
        clinical: boolean;
        marketing: boolean;
        membership: boolean;
        reviews: boolean;
      };
    };

    email: {
      enabled: boolean;
      emailAddress: string;
      verified: boolean;
      optIn: {
        transactional: boolean; // Cannot opt-out
        clinical: boolean;
        marketing: boolean;
        membership: boolean;
        reviews: boolean;
      };
    };

    push: {
      enabled: boolean;
      optIn: {
        appointments: boolean;
        waitlist: boolean;
        messages: boolean;
        marketing: boolean;
        systemAlerts: boolean;
      };
    };

    in_app: {
      enabled: boolean;
      desktop: boolean;
      sound: boolean;
    };
  };

  // Timing preferences
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "08:00"
    timezone: string;
    applyToAllChannels: boolean;
    exceptions: string[]; // ['critical', 'appointment_reminders']
  };

  // Frequency preferences
  frequency: {
    marketing: 'daily' | 'weekly' | 'monthly' | 'never';
    reviews: 'always' | 'occasionally' | 'never';
    followUps: 'all' | 'important_only' | 'none';
  };

  // Category preferences
  categories: {
    appointments: boolean;
    treatments: boolean;
    financial: boolean;
    marketing: boolean;
    educational: boolean;
    events: boolean;
  };

  // Language preference
  language: string; // 'en-US', 'es-ES'

  // Do Not Disturb
  doNotDisturb: {
    enabled: boolean;
    until?: Date; // Temporary DND
  };

  // Audit
  updatedAt: Date;
  updatedBy: string;
  consentRecorded: boolean;
  consentDate?: Date;
}
```

### Preference Enforcement

```typescript
class PreferenceService {
  async canSendNotification(
    patientId: string,
    notification: NotificationRequest
  ): Promise<{ allowed: boolean; reason?: string }> {
    const prefs = await this.getPreferences(patientId);

    // Check global opt-out
    if (prefs.globalOptOut && !this.isEssentialNotification(notification)) {
      return { allowed: false, reason: 'Global opt-out' };
    }

    // Check Do Not Disturb
    if (prefs.doNotDisturb.enabled) {
      if (!prefs.doNotDisturb.until || new Date() < prefs.doNotDisturb.until) {
        if (notification.priority !== 'critical') {
          return { allowed: false, reason: 'Do not disturb enabled' };
        }
      }
    }

    // Check channel availability
    const channelPrefs = prefs.channels[notification.channel];
    if (!channelPrefs.enabled) {
      return { allowed: false, reason: `${notification.channel} disabled` };
    }

    // Check category opt-in
    const category = this.getNotificationCategory(notification.type);
    if (!channelPrefs.optIn[category]) {
      return { allowed: false, reason: `Opted out of ${category}` };
    }

    // Check quiet hours
    if (prefs.quietHours.enabled && notification.priority !== 'critical') {
      const isQuietTime = this.isWithinQuietHours(
        new Date(),
        prefs.quietHours,
        prefs.timezone
      );

      if (isQuietTime) {
        // Check if notification type is excepted
        if (!prefs.quietHours.exceptions.includes(notification.type)) {
          return { allowed: false, reason: 'Within quiet hours' };
        }
      }
    }

    // Check frequency caps
    const frequencyOk = await this.checkFrequencyCap(patientId, notification);
    if (!frequencyOk) {
      return { allowed: false, reason: 'Frequency cap exceeded' };
    }

    return { allowed: true };
  }

  private isEssentialNotification(notification: NotificationRequest): boolean {
    const essentialTypes = [
      'appointment_confirmation',
      'appointment_rescheduled',
      'appointment_cancelled',
      'payment_received',
      'emergency_clinic_closure',
    ];

    return essentialTypes.includes(notification.type);
  }

  private async checkFrequencyCap(
    patientId: string,
    notification: NotificationRequest
  ): Promise<boolean> {
    const prefs = await this.getPreferences(patientId);
    const category = this.getNotificationCategory(notification.type);

    if (category !== 'marketing' && category !== 'reviews') {
      return true; // No frequency cap for non-marketing
    }

    const frequencySetting = prefs.frequency[category];
    if (frequencySetting === 'never') {
      return false;
    }

    // Check last sent time for this category
    const lastSent = await this.getLastSentTime(patientId, category);
    if (!lastSent) {
      return true;
    }

    const hoursSinceLastSent = (Date.now() - lastSent.getTime()) / (1000 * 60 * 60);

    switch (frequencySetting) {
      case 'daily':
        return hoursSinceLastSent >= 24;
      case 'weekly':
        return hoursSinceLastSent >= 168;
      case 'monthly':
        return hoursSinceLastSent >= 720;
      default:
        return true;
    }
  }
}
```

### Unsubscribe Management

```typescript
interface UnsubscribeRequest {
  patientId: string;
  channel: 'sms' | 'email' | 'push';
  category?: 'marketing' | 'all';
  source: 'stop_keyword' | 'unsubscribe_link' | 'settings_page';
  timestamp: Date;
}

class UnsubscribeService {
  // Handle SMS "STOP" keyword
  async handleStopKeyword(phoneNumber: string): Promise<void> {
    const patientId = await this.findPatientByPhone(phoneNumber);

    if (patientId) {
      await this.updatePreferences(patientId, {
        'channels.sms.optIn.marketing': false,
      });

      // Send confirmation
      await this.sendSMS(phoneNumber,
        'You have been unsubscribed from marketing messages. ' +
        'You will still receive appointment reminders. ' +
        'Reply START to resubscribe.'
      );

      // Log unsubscribe
      await this.logUnsubscribe({
        patientId,
        channel: 'sms',
        category: 'marketing',
        source: 'stop_keyword',
        timestamp: new Date(),
      });
    }
  }

  // Handle email unsubscribe link
  async handleEmailUnsubscribe(token: string): Promise<void> {
    const data = await this.decryptUnsubscribeToken(token);

    await this.updatePreferences(data.patientId, {
      'channels.email.optIn.marketing': false,
    });

    await this.logUnsubscribe({
      patientId: data.patientId,
      channel: 'email',
      category: data.category || 'marketing',
      source: 'unsubscribe_link',
      timestamp: new Date(),
    });
  }

  // Generate unsubscribe URL
  generateUnsubscribeUrl(patientId: string, category: string): string {
    const token = this.encryptUnsubscribeToken({
      patientId,
      category,
      timestamp: Date.now(),
    });

    return `${config.baseUrl}/unsubscribe?token=${token}`;
  }
}
```

---

## Tracking & Analytics

### Delivery Tracking

```typescript
interface NotificationDeliveryLog {
  id: string;
  notificationId: string;
  jobId: string;

  // Notification details
  type: string;
  category: string;
  channel: 'sms' | 'email' | 'push' | 'in_app';
  priority: string;

  // Recipient
  patientId: string;
  recipient: string; // Hashed for privacy

  // Delivery timeline
  queuedAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  clickedAt?: Date;

  // Status tracking
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'unsubscribed';
  substatus?: string;

  // Provider details
  provider: string; // 'twilio', 'sendgrid', 'fcm'
  providerId?: string; // External message ID
  providerStatus?: string;

  // Attempts and errors
  attempts: number;
  lastAttemptAt?: Date;
  errorCode?: string;
  errorMessage?: string;

  // Engagement
  opened: boolean;
  clicked: boolean;
  converted: boolean;

  // A/B testing
  testVariant?: 'A' | 'B';
  testId?: string;

  // Metadata
  templateId: string;
  templateVersion: number;
  metadata: Record<string, any>;
}
```

### Analytics Dashboard Metrics

**1. Delivery Metrics**
```typescript
interface DeliveryMetrics {
  // Overall
  totalSent: number;
  deliveryRate: number; // delivered / sent
  failureRate: number;
  bounceRate: number;

  // By channel
  byChannel: {
    sms: ChannelMetrics;
    email: ChannelMetrics;
    push: ChannelMetrics;
    in_app: ChannelMetrics;
  };

  // By priority
  byPriority: {
    critical: number;
    high: number;
    normal: number;
    low: number;
  };

  // By category
  byCategory: {
    appointment: CategoryMetrics;
    treatment: CategoryMetrics;
    marketing: CategoryMetrics;
    financial: CategoryMetrics;
  };

  // Time series
  timeSeries: {
    hourly: TimeSeriesData[];
    daily: TimeSeriesData[];
    weekly: TimeSeriesData[];
  };
}

interface ChannelMetrics {
  sent: number;
  delivered: number;
  failed: number;
  bounced: number;
  deliveryRate: number;
  avgDeliveryTime: number; // milliseconds
  cost: number; // Total cost
  costPerMessage: number;
}
```

**2. Engagement Metrics**
```typescript
interface EngagementMetrics {
  // Open rates
  openRate: number; // opened / delivered
  uniqueOpenRate: number;
  avgTimeToOpen: number; // milliseconds

  // Click rates
  clickRate: number; // clicked / delivered
  clickThroughRate: number; // clicked / opened
  uniqueClickRate: number;

  // Conversion rates
  conversionRate: number; // converted / delivered

  // By channel
  byChannel: {
    sms: EngagementChannelMetrics;
    email: EngagementChannelMetrics;
    push: EngagementChannelMetrics;
  };

  // By category
  byCategory: Record<string, EngagementCategoryMetrics>;

  // Popular times
  bestTimeToSend: {
    hourOfDay: number; // 0-23
    dayOfWeek: number; // 0-6
    openRate: number;
  };
}
```

**3. Template Performance**
```typescript
interface TemplatePerformance {
  templateId: string;
  templateName: string;
  version: number;

  // Usage
  timesSent: number;
  timesDelivered: number;

  // Performance
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;

  // A/B test results
  abTestResults?: {
    variantA: VariantMetrics;
    variantB: VariantMetrics;
    winner: 'A' | 'B' | 'inconclusive';
    confidence: number;
  };

  // Trends
  performance7Days: PerformanceTrend;
  performance30Days: PerformanceTrend;
}
```

**4. Patient Engagement Score**
```typescript
interface PatientEngagementScore {
  patientId: string;
  score: number; // 0-100

  breakdown: {
    openRate: number; // 0-25 points
    clickRate: number; // 0-25 points
    responseRate: number; // 0-25 points
    appointmentKeepRate: number; // 0-25 points
  };

  // Segmentation
  segment: 'highly_engaged' | 'engaged' | 'moderate' | 'low' | 'disengaged';

  // Recommendations
  recommendations: string[];
}
```

### Analytics Implementation

```typescript
class NotificationAnalyticsService {
  private timescaleDb: TimescaleDB; // Time-series database

  async trackEvent(event: NotificationEvent): Promise<void> {
    await this.timescaleDb.insert('notification_events', {
      timestamp: event.timestamp,
      event_type: event.type,
      notification_id: event.notificationId,
      patient_id: event.patientId,
      channel: event.channel,
      metadata: event.metadata,
    });
  }

  async getDeliveryMetrics(
    startDate: Date,
    endDate: Date,
    filters?: AnalyticsFilters
  ): Promise<DeliveryMetrics> {
    // Query time-series data
    const query = `
      SELECT
        channel,
        COUNT(*) as sent,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        AVG(EXTRACT(EPOCH FROM (delivered_at - sent_at)) * 1000) as avg_delivery_time
      FROM notification_events
      WHERE timestamp BETWEEN $1 AND $2
      ${filters ? this.buildFilterClause(filters) : ''}
      GROUP BY channel
    `;

    const results = await this.timescaleDb.query(query, [startDate, endDate]);

    return this.transformToDeliveryMetrics(results);
  }

  async generateReport(
    reportType: 'daily' | 'weekly' | 'monthly',
    date: Date
  ): Promise<AnalyticsReport> {
    const { startDate, endDate } = this.getDateRange(reportType, date);

    const [delivery, engagement, templates, topPatterns] = await Promise.all([
      this.getDeliveryMetrics(startDate, endDate),
      this.getEngagementMetrics(startDate, endDate),
      this.getTemplatePerformance(startDate, endDate),
      this.getTopPatterns(startDate, endDate),
    ]);

    return {
      reportType,
      period: { startDate, endDate },
      generated: new Date(),
      delivery,
      engagement,
      templates,
      topPatterns,
      recommendations: this.generateRecommendations(delivery, engagement),
    };
  }

  private generateRecommendations(
    delivery: DeliveryMetrics,
    engagement: EngagementMetrics
  ): string[] {
    const recommendations: string[] = [];

    // Low delivery rate
    if (delivery.deliveryRate < 0.95) {
      recommendations.push(
        `Delivery rate is ${(delivery.deliveryRate * 100).toFixed(1)}%. ` +
        `Review failed deliveries and clean up contact lists.`
      );
    }

    // Low engagement
    if (engagement.openRate < 0.3) {
      recommendations.push(
        `Open rate is ${(engagement.openRate * 100).toFixed(1)}%. ` +
        `Consider A/B testing subject lines and send times.`
      );
    }

    // Best time to send
    const bestTime = engagement.bestTimeToSend;
    recommendations.push(
      `Highest engagement at ${bestTime.hourOfDay}:00 with ` +
      `${(bestTime.openRate * 100).toFixed(1)}% open rate. ` +
      `Schedule more campaigns at this time.`
    );

    return recommendations;
  }
}
```

---

## Technology Stack Recommendations

### Backend Services

**1. Event Bus**
- **Primary:** AWS EventBridge
- **Alternative:** Google Cloud Pub/Sub
- **Reasoning:**
  - Native AWS integration
  - Event filtering and routing
  - Event archive for compliance
  - Schema registry
  - High throughput (11,000 events/sec)
  - Pay per event pricing

**2. Queue System**
- **Primary:** BullMQ (Redis-based)
- **Alternative:** AWS SQS
- **Reasoning:**
  - Excellent job queue features
  - Built-in retry with backoff
  - Priority queues
  - Job scheduling
  - Real-time monitoring
  - Open source
  - Lower cost than SQS

**3. Database**
- **Primary Database:** PostgreSQL
- **Time-Series Analytics:** TimescaleDB (PostgreSQL extension)
- **Cache:** Redis
- **Reasoning:**
  - HIPAA-compliant hosting available
  - Strong ACID guarantees
  - JSON support for metadata
  - Full-text search
  - Mature ecosystem
  - TimescaleDB for high-performance time-series queries

**4. SMS Provider**
- **Current:** Twilio ✓
- **Reasoning:**
  - Already implemented
  - BAA available
  - Reliable delivery
  - Two-way messaging
  - Status callbacks
  - Short code support

**5. Email Provider**
- **Recommended:** SendGrid
- **Alternative:** AWS SES
- **Reasoning:**
  - BAA available
  - Template management
  - Analytics built-in
  - IP reputation management
  - Bounce/complaint handling
  - Webhook support

**6. Push Notifications**
- **Recommended:** Firebase Cloud Messaging (FCM) + Apple Push Notification Service (APNS)
- **Reasoning:**
  - Native support for iOS and Android
  - Reliable delivery
  - Rich notifications
  - Topic-based messaging
  - Free tier generous

**7. WebSocket/Real-time**
- **Recommended:** Native WebSocket with Socket.IO
- **Alternative:** Pusher, Ably
- **Reasoning:**
  - Full control over infrastructure
  - No per-connection pricing
  - HIPAA-compliant deployment
  - Room-based messaging
  - Fallback to polling

### Infrastructure

**1. Hosting**
- **Recommended:** AWS (current platform)
- **Services:**
  - ECS Fargate for containers
  - RDS PostgreSQL for database
  - ElastiCache Redis for cache/queue
  - S3 for file storage
  - CloudFront for CDN
  - Route 53 for DNS
  - Certificate Manager for SSL

**2. Monitoring & Observability**
- **APM:** Datadog or New Relic
- **Logging:** CloudWatch Logs or ELK Stack
- **Error Tracking:** Sentry
- **Uptime:** Pingdom or UptimeRobot

**3. Security**
- **Secrets Management:** AWS Secrets Manager
- **Encryption:** AWS KMS
- **WAF:** AWS WAF
- **DDoS Protection:** AWS Shield

### Development Tools

**1. Version Control**
- Git with GitHub or GitLab
- Branch protection rules
- Required code reviews

**2. CI/CD**
- GitHub Actions or GitLab CI
- Automated testing
- Staging deployments
- Production deployment approval

**3. Testing**
- Unit tests: Jest
- Integration tests: Supertest
- E2E tests: Playwright
- Load testing: K6 or Artillery

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

**Week 1: Architecture Setup**
- [ ] Set up AWS EventBridge event bus
- [ ] Configure BullMQ with Redis
- [ ] Set up PostgreSQL database with audit tables
- [ ] Implement basic event publishing
- [ ] Create notification orchestrator service

**Week 2: SMS Enhancement**
- [ ] Migrate existing SMS service to queue-based architecture
- [ ] Implement retry logic with exponential backoff
- [ ] Add delivery status tracking
- [ ] Implement rate limiting per recipient
- [ ] Set up Twilio status webhooks

**Week 3: Email Channel**
- [ ] Integrate SendGrid
- [ ] Create HTML email templates
- [ ] Implement template rendering engine
- [ ] Set up email tracking (opens, clicks)
- [ ] Configure bounce/complaint handling

**Week 4: Preference Management**
- [ ] Design preference schema
- [ ] Build preference API
- [ ] Implement quiet hours enforcement
- [ ] Create preference UI in admin portal
- [ ] Build unsubscribe management

### Phase 2: Multi-Channel Delivery (Weeks 5-8)

**Week 5: Push Notifications**
- [ ] Integrate FCM for Android
- [ ] Integrate APNS for iOS
- [ ] Implement device token management
- [ ] Create push notification worker
- [ ] Test rich notifications

**Week 6: In-App Notifications**
- [ ] Enhance existing in-app service
- [ ] Add notification persistence
- [ ] Implement notification center UI
- [ ] Add read/unread tracking
- [ ] Create notification search

**Week 7: Channel Orchestration**
- [ ] Implement channel selection logic
- [ ] Build fallback mechanism
- [ ] Create channel preference matrix
- [ ] Test cross-channel scenarios

**Week 8: Testing & QA**
- [ ] Unit tests for all services
- [ ] Integration tests for workflows
- [ ] Load testing for queue system
- [ ] End-to-end testing

### Phase 3: Analytics & Compliance (Weeks 9-12)

**Week 9: Analytics Foundation**
- [ ] Set up TimescaleDB
- [ ] Create analytics schema
- [ ] Implement event tracking
- [ ] Build delivery tracking pipeline

**Week 10: Analytics Dashboard**
- [ ] Create delivery metrics dashboard
- [ ] Build engagement analytics
- [ ] Implement template performance tracking
- [ ] Add patient engagement scoring

**Week 11: Compliance & Audit**
- [ ] Complete audit trail implementation
- [ ] Set up data retention policies
- [ ] Implement PHI minimization checks
- [ ] Create compliance reports
- [ ] Security audit

**Week 12: Launch Preparation**
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Documentation completion
- [ ] Staff training
- [ ] Gradual rollout plan

### Phase 4: Advanced Features (Weeks 13-16)

**Week 13: A/B Testing**
- [ ] Implement A/B test framework
- [ ] Create test configuration UI
- [ ] Build statistical analysis
- [ ] Winner selection algorithm

**Week 14: Personalization**
- [ ] Machine learning model for send time optimization
- [ ] Content personalization engine
- [ ] Engagement prediction
- [ ] Smart frequency capping

**Week 15: Campaign Management**
- [ ] Campaign creation UI
- [ ] Segment builder
- [ ] Campaign scheduling
- [ ] Campaign analytics

**Week 16: Polish & Optimization**
- [ ] Performance optimization
- [ ] UI/UX improvements
- [ ] Advanced reporting
- [ ] Cost optimization

---

## Best Practices & Patterns

### Design Patterns

**1. Strategy Pattern (Channel Selection)**
```typescript
interface NotificationChannel {
  send(notification: Notification): Promise<DeliveryResult>;
  validate(notification: Notification): boolean;
  estimateCost(notification: Notification): number;
}

class SMSChannel implements NotificationChannel {
  async send(notification: Notification): Promise<DeliveryResult> {
    // SMS-specific sending logic
  }

  validate(notification: Notification): boolean {
    return this.isValidPhoneNumber(notification.recipient);
  }

  estimateCost(notification: Notification): number {
    return 0.0075; // $0.0075 per SMS
  }
}

class ChannelStrategy {
  selectChannel(
    notification: Notification,
    preferences: PatientPreferences
  ): NotificationChannel {
    // Select best channel based on preferences, cost, reliability
  }
}
```

**2. Observer Pattern (Event Subscribers)**
```typescript
class EventBus {
  private subscribers: Map<string, EventHandler[]> = new Map();

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(handler);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.subscribers.get(event.eventType) || [];
    await Promise.all(handlers.map(h => h.handle(event)));
  }
}
```

**3. Factory Pattern (Template Creation)**
```typescript
class NotificationFactory {
  createNotification(
    event: DomainEvent,
    config: NotificationConfig
  ): Notification {
    const template = this.templateService.getTemplate(config.templateId);
    const variables = this.extractVariables(event);
    const content = this.renderTemplate(template, variables);

    return {
      id: generateId(),
      type: config.type,
      channel: config.channel,
      priority: config.priority,
      recipient: this.getRecipient(event),
      content,
      scheduledFor: this.calculateSendTime(config.timing),
      metadata: event.metadata,
    };
  }
}
```

**4. Chain of Responsibility (Validation Pipeline)**
```typescript
abstract class ValidationHandler {
  protected next?: ValidationHandler;

  setNext(handler: ValidationHandler): ValidationHandler {
    this.next = handler;
    return handler;
  }

  async validate(notification: Notification): Promise<ValidationResult> {
    const result = await this.doValidate(notification);

    if (!result.valid || !this.next) {
      return result;
    }

    return this.next.validate(notification);
  }

  protected abstract doValidate(notification: Notification): Promise<ValidationResult>;
}

class PreferenceValidator extends ValidationHandler {
  protected async doValidate(notification: Notification): Promise<ValidationResult> {
    const prefs = await this.preferenceService.getPreferences(notification.patientId);
    const allowed = await this.preferenceService.canSendNotification(notification, prefs);
    return { valid: allowed.allowed, reason: allowed.reason };
  }
}

// Build validation chain
const validationChain = new PreferenceValidator()
  .setNext(new QuietHoursValidator())
  .setNext(new RateLimitValidator())
  .setNext(new ConsentValidator())
  .setNext(new PHIValidator());
```

### Coding Best Practices

**1. Error Handling**
```typescript
class NotificationError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean,
    public details?: any
  ) {
    super(message);
    this.name = 'NotificationError';
  }
}

// Usage
try {
  await sendNotification(notification);
} catch (error) {
  if (error instanceof NotificationError) {
    if (error.retryable) {
      await retryQueue.add(notification, { delay: calculateBackoff(attempts) });
    } else {
      await deadLetterQueue.add(notification, { error: error.message });
    }
  }

  await logError(error);
}
```

**2. Logging Strategy**
```typescript
const logger = {
  info: (message: string, context: object) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...context,
    }));
  },

  error: (message: string, error: Error, context: object) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...context,
    }));
  },
};

// Usage
logger.info('Notification sent', {
  notificationId: notification.id,
  channel: notification.channel,
  patientId: notification.patientId,
  duration: sendDuration,
});
```

**3. Configuration Management**
```typescript
// config/notifications.ts
export const notificationConfig = {
  // Environment-based
  environment: process.env.NODE_ENV,

  // Feature flags
  features: {
    emailEnabled: process.env.FEATURE_EMAIL === 'true',
    pushEnabled: process.env.FEATURE_PUSH === 'true',
    abTestingEnabled: process.env.FEATURE_AB_TESTING === 'true',
  },

  // Provider credentials (from secrets manager)
  providers: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY,
      fromEmail: process.env.SENDGRID_FROM_EMAIL,
      fromName: process.env.SENDGRID_FROM_NAME,
    },
  },

  // Limits
  limits: {
    smsPerMinute: parseInt(process.env.SMS_RATE_LIMIT || '100'),
    emailPerMinute: parseInt(process.env.EMAIL_RATE_LIMIT || '500'),
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3'),
  },

  // Timeouts
  timeouts: {
    sms: parseInt(process.env.SMS_TIMEOUT || '30000'),
    email: parseInt(process.env.EMAIL_TIMEOUT || '60000'),
    push: parseInt(process.env.PUSH_TIMEOUT || '10000'),
  },
};
```

**4. Testing Strategy**
```typescript
describe('NotificationOrchestrator', () => {
  it('should send SMS for high priority appointment confirmation', async () => {
    // Arrange
    const event: AppointmentCreatedEvent = {
      eventType: 'appointment.created',
      payload: {
        appointmentId: 'apt_123',
        patientId: 'pat_456',
        patientPhone: '+15551234567',
        smsOptIn: true,
        // ... other fields
      },
    };

    const mockSmsService = jest.fn().mockResolvedValue({ success: true });
    const orchestrator = new NotificationOrchestrator({ smsService: mockSmsService });

    // Act
    await orchestrator.handleEvent(event);

    // Assert
    expect(mockSmsService).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '+15551234567',
        body: expect.stringContaining('appointment'),
        priority: 'high',
      })
    );
  });

  it('should respect quiet hours for low priority notifications', async () => {
    // Test quiet hours logic
  });

  it('should fall back to email when SMS fails', async () => {
    // Test fallback logic
  });
});
```

### Performance Optimization

**1. Batch Processing**
```typescript
async function processBulkNotifications(notifications: Notification[]): Promise<void> {
  const batchSize = 100;
  const batches = chunk(notifications, batchSize);

  for (const batch of batches) {
    await Promise.all(
      batch.map(notification =>
        notificationQueue.add(notification, { priority: notification.priority })
      )
    );

    // Small delay between batches to avoid overwhelming the queue
    await sleep(100);
  }
}
```

**2. Caching**
```typescript
class TemplateService {
  private cache: NodeCache = new NodeCache({ stdTTL: 3600 }); // 1 hour

  async getTemplate(templateId: string): Promise<Template> {
    const cached = this.cache.get<Template>(templateId);
    if (cached) {
      return cached;
    }

    const template = await this.db.templates.findById(templateId);
    this.cache.set(templateId, template);

    return template;
  }
}
```

**3. Connection Pooling**
```typescript
// Database connection pool
const pool = new Pool({
  host: config.db.host,
  database: config.db.name,
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis connection pool for BullMQ
const redisPool = {
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  enableOfflineQueue: false,
};
```

### Security Best Practices

**1. Input Validation**
```typescript
import { z } from 'zod';

const NotificationRequestSchema = z.object({
  patientId: z.string().uuid(),
  type: z.enum(['appointment', 'treatment', 'marketing', /* ... */]),
  channel: z.enum(['sms', 'email', 'push', 'in_app']),
  recipient: z.string().refine(
    (val) => isValidPhone(val) || isValidEmail(val),
    'Invalid recipient'
  ),
  content: z.string().max(2000),
  metadata: z.record(z.any()).optional(),
});

async function createNotification(data: unknown): Promise<void> {
  const validated = NotificationRequestSchema.parse(data);
  // Proceed with validated data
}
```

**2. PHI Sanitization**
```typescript
function sanitizeForPublicChannel(content: string, metadata: any): string {
  // Remove any PHI from content
  let sanitized = content;

  // Remove specific medical terms
  const phiPatterns = [
    /\b(diagnosed|diagnosis|medication|treatment|condition|symptom)s?\b/gi,
    /\b(blood pressure|heart rate|weight|BMI)\b/gi,
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
    /\b[A-Z0-9]{8,}\b/g, // Medical record numbers
  ];

  phiPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  });

  return sanitized;
}
```

**3. Audit Logging**
```typescript
async function auditLog(action: string, details: any): Promise<void> {
  await db.auditLogs.create({
    timestamp: new Date(),
    action,
    userId: getCurrentUser().id,
    ipAddress: getClientIp(),
    userAgent: getUserAgent(),
    details: {
      ...details,
      // Hash sensitive data
      recipient: details.recipient ? hashValue(details.recipient) : undefined,
    },
  });
}
```

---

## Conclusion

This notification system architecture provides a comprehensive, scalable, and HIPAA-compliant foundation for the Luxe Medical Spa platform. Key takeaways:

**Strengths:**
- Event-driven architecture enables loose coupling and scalability
- Multi-channel support with intelligent fallback
- HIPAA compliance built-in from day one
- Comprehensive preference management
- Advanced analytics and optimization
- Template management with A/B testing

**Implementation Priority:**
1. **Phase 1 (Weeks 1-4):** Foundation - Event bus, queues, SMS enhancement, email channel
2. **Phase 2 (Weeks 5-8):** Multi-channel - Push notifications, in-app, orchestration
3. **Phase 3 (Weeks 9-12):** Analytics & compliance - Tracking, dashboard, audit trail
4. **Phase 4 (Weeks 13-16):** Advanced features - A/B testing, personalization, campaigns

**Next Steps:**
1. Review and approve architecture
2. Provision infrastructure (AWS resources)
3. Begin Phase 1 implementation
4. Set up monitoring and alerting
5. Create detailed technical specifications for each component

**Success Metrics:**
- 99.9% notification delivery rate
- <5 second average delivery time for critical notifications
- 100% HIPAA audit compliance
- 40%+ email open rate
- 95%+ SMS delivery rate
- Zero PHI breaches

This architecture positions the medical spa platform for growth while maintaining the highest standards of patient privacy, communication quality, and operational efficiency.

---

## Appendix: Additional Resources

### Reference Documentation
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [Twilio HIPAA Compliance Guide](https://www.twilio.com/docs/usage/hipaa)
- [AWS HIPAA Compliance](https://aws.amazon.com/compliance/hipaa-compliance/)
- [SendGrid Email Best Practices](https://sendgrid.com/resource/email-marketing-best-practices/)
- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [BullMQ Documentation](https://docs.bullmq.io/)

### Industry Research Sources
- Design a Scalable Notification Service - AlgoMaster
- Notification System Design - MagicBell
- Event-Driven Architecture - Microservices.io
- Healthcare Notification Systems - Multiple industry sources

### Related Documentation
- `/apps/admin/CLAUDE.md` - Project instructions
- `/apps/admin/src/services/notifications.ts` - In-app notification service
- `/apps/admin/src/services/messaging/core.ts` - SMS messaging service
- `/apps/admin/src/services/messaging/reminders.ts` - Appointment reminders
- `/apps/admin/src/services/messaging/templates.ts` - Message templates
- `/docs/SYSTEM_WORKFLOWS.html` - Master system documentation

---

**Document prepared by:** Claude (Anthropic AI)
**For:** Luxe Medical Spa Platform
**Date:** December 23, 2024
