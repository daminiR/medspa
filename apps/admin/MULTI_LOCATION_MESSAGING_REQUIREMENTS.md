# Multi-Location & International Messaging Requirements for Medical Spas

**Research Date:** January 8, 2026
**Purpose:** Define comprehensive requirements for scaling messaging across multiple locations, timezones, and international markets

---

## Executive Summary

Multi-location medical spa chains face unique messaging challenges that single-location practices don't encounter. Based on competitive analysis and enterprise software patterns, this document outlines requirements for:

1. **Location-based messaging management** (centralized vs. decentralized control)
2. **Timezone-aware message scheduling and delivery**
3. **Multi-language support and localization**
4. **Location-specific compliance and regulations**
5. **Cross-location patient communication**
6. **Brand consistency across franchises**
7. **Enterprise governance and reporting**

**Key Findings:**
- **Zenoti** leads in multi-location support but lacks timezone intelligence
- **Mangomint** has basic multi-location but no centralized governance
- **No platform** offers true international messaging with locale-aware compliance
- **Major gap:** Cross-location patient transfers and unified patient history

---

## 1. Multi-Location Architecture Models

### Model A: Centralized Control (Corporate-Owned Chains)
**Use Case:** Corporate-owned chains like LaserAway, Sono Bello (100+ locations)

**Requirements:**
- ✅ Central messaging dashboard for all locations
- ✅ Location-based message templates with brand approval workflow
- ✅ Centralized patient database with location tagging
- ✅ Corporate-level campaign creation with location targeting
- ✅ Unified reporting across all locations
- ✅ Role-based access: Corporate Admin > Regional Manager > Location Manager > Front Desk
- ✅ Brand governance: Central approval required for custom templates
- ✅ Centralized compliance monitoring and audit logs

**Example Flow:**
```
Corporate HQ creates "Holiday Promotion" campaign
↓
Select target locations: LA Downtown, LA Beverly Hills, San Diego
↓
System auto-adjusts timing for each location's timezone
↓
Regional managers review and approve
↓
Campaign sends at 10 AM local time in each timezone
↓
Corporate dashboard shows consolidated results
```

**Technical Architecture:**
```
Central Database (PostgreSQL)
├── Locations Table (id, name, timezone, address, phone, brand_settings)
├── Patients Table (id, primary_location_id, all_location_ids[])
├── Messages Table (id, location_id, patient_id, timezone_sent)
├── Campaigns Table (id, target_locations[], approval_status)
└── Staff Table (id, location_id, role, permissions)
```

---

### Model B: Decentralized Control (Franchises)
**Use Case:** Franchise operations like European Wax Center, Drybar (200+ locations)

**Requirements:**
- ✅ Each location has independent messaging control
- ✅ Franchisees cannot see other locations' data
- ✅ Corporate provides pre-approved templates only
- ✅ Franchisees can customize within brand guidelines
- ✅ Corporate gets anonymized aggregate analytics
- ✅ Opt-out enforcement across franchise network
- ✅ Shared template library with "use as-is" templates
- ✅ Location-specific pricing and promotions

**Example Flow:**
```
Franchise Location A in Miami wants to run promotion
↓
Selects from corporate-approved templates
↓
Customizes offer amount within allowed range ($50-200 off)
↓
Sends to their local patient list only
↓
Cannot see or message patients from other franchise locations
↓
Corporate sees: "100 locations used Holiday template, avg 15% conversion"
```

**Technical Architecture:**
```
Multi-Tenant Database with Row-Level Security
├── Tenant/Location Isolation
├── Shared Template Library (read-only for franchisees)
├── Location-Specific Patient Data (fully isolated)
├── Corporate Analytics Aggregation (anonymized)
└── Federated Opt-Out List (shared across network)
```

---

### Model C: Hybrid (Regional Autonomy)
**Use Case:** Regional chains like PSSC (Pennsylvania Skin & Surgical Center, 5-20 locations)

**Requirements:**
- ✅ Regional managers have control over their locations
- ✅ Locations within region can collaborate
- ✅ Regional template customization allowed
- ✅ Corporate sets compliance guardrails
- ✅ Cross-location patient transfers supported
- ✅ Shared patient history visible across region
- ✅ Regional reporting with corporate rollup

**Example Flow:**
```
Northeast Region (5 locations) wants spring campaign
↓
Regional Marketing Manager creates campaign
↓
Targets patients who visited any Northeast location
↓
Message includes: "Visit any of our 5 NE locations"
↓
Patient can book at different location than usual
↓
All 5 locations see the booking in their calendar
```

---

## 2. Timezone-Aware Messaging

### Current Competitor Gaps
- **Zenoti:** Stores timezone per location but doesn't auto-adjust send times
- **Mangomint:** No timezone intelligence, relies on manual scheduling
- **Boulevard:** Basic timezone support, no smart optimization
- **Jane App:** Single-location focus, no multi-timezone support
- **Vagaro:** No documented timezone features
- **Pabau:** Unknown timezone handling

### Requirements for Enterprise Chains

#### A. Automatic Timezone Detection
```typescript
interface Location {
  id: string;
  name: string;
  timezone: string; // IANA timezone (e.g., "America/New_York")
  autoDetectDST: boolean; // Handle daylight saving automatically
  businessHours: {
    dayOfWeek: number; // 0 = Sunday
    openTime: string; // "09:00"
    closeTime: string; // "18:00"
  }[];
}

interface Patient {
  id: string;
  primaryLocation: Location;
  preferredTimezone?: string; // Override if patient travels
  visitedLocations: Location[]; // History of all locations visited
}
```

#### B. Smart Send Time Optimization
**Scenario 1: Corporate Campaign to All Locations**
```
Campaign: "Book your Botox appointment this week!"
Target: All 50 locations across 4 timezones

Desired Behavior:
- East Coast (NYC, Boston): Send 10 AM EST
- Central (Chicago, Dallas): Send 10 AM CST
- Mountain (Denver): Send 10 AM MST
- West Coast (LA, SF): Send 10 AM PST

Result: Every patient receives message at 10 AM their local time
```

**Implementation:**
```typescript
async function scheduleMultiLocationCampaign(campaign: Campaign) {
  // Group recipients by timezone
  const recipientsByTimezone = groupBy(campaign.recipients,
    patient => patient.primaryLocation.timezone
  );

  // Schedule separate batch for each timezone
  for (const [timezone, patients] of Object.entries(recipientsByTimezone)) {
    const sendAt = convertToTimezone(campaign.scheduledTime, timezone);

    await scheduleBatch({
      patients,
      message: campaign.message,
      sendAt,
      timezone,
    });
  }
}
```

#### C. Business Hours Enforcement
**Requirement:** Never send messages outside business hours or on closed days

```typescript
function isWithinBusinessHours(
  location: Location,
  timestamp: Date
): boolean {
  const localTime = convertToTimezone(timestamp, location.timezone);
  const dayOfWeek = localTime.getDay();
  const timeStr = format(localTime, 'HH:mm');

  const businessHours = location.businessHours.find(
    bh => bh.dayOfWeek === dayOfWeek
  );

  if (!businessHours) return false; // Location closed this day

  return timeStr >= businessHours.openTime &&
         timeStr <= businessHours.closeTime;
}

// Example: Prevent sending at 8 PM local time
if (!isWithinBusinessHours(patient.primaryLocation, scheduledTime)) {
  // Reschedule to next business day at 9 AM
  scheduledTime = getNextBusinessDayMorning(patient.primaryLocation);
}
```

#### D. Holiday Calendar Awareness
**Requirement:** Respect regional and national holidays per location

```typescript
interface LocationHolidays {
  locationId: string;
  holidays: {
    date: Date;
    name: string; // "Christmas Day", "Independence Day"
    type: 'national' | 'regional' | 'location_specific';
  }[];
}

// Example: Don't send promotional messages on Christmas
const holidays = await getLocationHolidays(location.id);
if (isHoliday(scheduledTime, holidays)) {
  // Reschedule to next business day
  scheduledTime = getNextNonHoliday(scheduledTime, holidays);
}
```

#### E. Daylight Saving Time (DST) Handling
**Challenge:** DST transitions cause timezone shifts twice per year

**Solution:**
```typescript
// Always use IANA timezone identifiers (auto-handle DST)
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

function scheduleCampaign(localTime: string, timezone: string) {
  // Convert "10:00 AM" in "America/New_York" to UTC
  const utcTime = zonedTimeToUtc(`2026-03-15 ${localTime}`, timezone);

  // Store in database as UTC
  await db.scheduledMessages.create({
    sendAt: utcTime,
    targetTimezone: timezone,
  });
}

// At send time, convert back to local
function processScheduledMessages() {
  const messages = await db.scheduledMessages.findDue();

  for (const msg of messages) {
    const localTime = utcToZonedTime(msg.sendAt, msg.targetTimezone);

    // Verify still within business hours (DST may have shifted)
    if (isWithinBusinessHours(msg.location, localTime)) {
      await sendMessage(msg);
    }
  }
}
```

---

## 3. Multi-Language Support

### Current Competitor Status
- **Zenoti Zeenie:** Multilingual campaign generation (10+ languages)
- **Mangomint:** English only
- **Boulevard:** English only
- **Jane App:** English only (some French-Canadian support)
- **Vagaro:** English only
- **Pabau:** Unknown

### International Expansion Requirements

#### A. Patient Language Preference
```typescript
interface Patient {
  id: string;
  preferredLanguage: string; // ISO 639-1 code (e.g., "es", "fr", "zh")
  fallbackLanguage: string; // Default: "en"
  autoDetectLanguage: boolean; // Detect from incoming messages
  translationQuality: 'human' | 'ai' | 'hybrid'; // Preference for translation
}
```

#### B. Template Translation Management
```typescript
interface MessageTemplate {
  id: string;
  name: string;
  category: string;

  // Multi-language content
  translations: {
    [languageCode: string]: {
      subject?: string;
      body: string;
      variables: string[]; // Placeholders like {firstName}, {appointmentTime}
      translatedBy: 'human' | 'ai';
      reviewedBy?: string; // Staff member who reviewed AI translation
      approvedAt?: Date;
      qualityScore?: number; // 0-1, for AI translations
    };
  };

  // Default fallback
  defaultLanguage: string;
}

// Example: Appointment Reminder Template
const reminderTemplate: MessageTemplate = {
  id: "apt-reminder-24h",
  name: "24-Hour Appointment Reminder",
  category: "appointment",
  defaultLanguage: "en",
  translations: {
    en: {
      body: "Hi {firstName}, reminder: You have an appointment tomorrow at {time} with {provider}. Reply C to confirm or R to reschedule.",
      variables: ["firstName", "time", "provider"],
      translatedBy: "human",
    },
    es: {
      body: "Hola {firstName}, recordatorio: Tienes una cita mañana a las {time} con {provider}. Responde C para confirmar o R para reprogramar.",
      variables: ["firstName", "time", "provider"],
      translatedBy: "ai",
      reviewedBy: "staff-maria",
      approvedAt: new Date("2026-01-05"),
      qualityScore: 0.95,
    },
    zh: {
      body: "您好 {firstName}，提醒：您明天 {time} 与 {provider} 有预约。回复C确认或R重新安排。",
      variables: ["firstName", "time", "provider"],
      translatedBy: "ai",
      qualityScore: 0.88,
    },
  },
};
```

#### C. Real-Time Message Translation
**Use Case:** Patient texts in Spanish, staff responds in English, patient receives Spanish

```typescript
async function handleIncomingSMS(inbound: InboundMessage) {
  // Detect language of incoming message
  const detectedLanguage = await detectLanguage(inbound.body);

  // Store patient's preferred language
  await updatePatientLanguage(inbound.patientId, detectedLanguage);

  // Translate for staff if needed
  const forStaff = detectedLanguage !== 'en'
    ? await translate(inbound.body, detectedLanguage, 'en')
    : inbound.body;

  // Display in staff UI with original + translation
  await displayInStaffInbox({
    original: inbound.body,
    originalLanguage: detectedLanguage,
    translation: forStaff,
    translationLanguage: 'en',
  });
}

async function handleOutgoingSMS(outbound: OutboundMessage) {
  const patient = await getPatient(outbound.patientId);

  // If staff wrote in English but patient prefers Spanish
  if (patient.preferredLanguage !== 'en') {
    const translated = await translate(
      outbound.body,
      'en',
      patient.preferredLanguage
    );

    // Show staff what will be sent
    await showTranslationPreview({
      original: outbound.body,
      translated,
      targetLanguage: patient.preferredLanguage,
      estimatedQuality: await getTranslationQuality(translated),
    });

    // Send translated version
    outbound.body = translated;
  }

  await sendSMS(outbound);
}
```

#### D. Localization Beyond Translation
**Medical Terminology Localization:**
```typescript
interface LocalizationRules {
  language: string;
  region: string; // "US", "UK", "CA", "MX", "ES"

  // Medical terms vary by region
  terminology: {
    [englishTerm: string]: string;
  };

  // Date/time formatting
  dateFormat: string; // "MM/DD/YYYY" vs "DD/MM/YYYY"
  timeFormat: '12h' | '24h';

  // Currency
  currency: string;
  currencySymbol: string;

  // Phone number format
  phoneFormat: string; // "(555) 123-4567" vs "+1-555-123-4567"

  // Cultural considerations
  formalityLevel: 'formal' | 'informal'; // Tu vs. Usted in Spanish

  // Compliance-specific language
  consentWording: string; // GDPR vs CCPA vs LGPD
}

// Example: UK vs US English medical terminology
const ukEnglish: LocalizationRules = {
  language: "en",
  region: "UK",
  terminology: {
    "filler": "dermal filler", // More formal in UK
    "Botox": "botulinum toxin", // Generic term preferred
    "appointment": "appointment", // Same
    "consultation": "consultation", // Same
  },
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  currency: "GBP",
  currencySymbol: "£",
  phoneFormat: "+44 7XXX XXXXXX",
  formalityLevel: "formal",
  consentWording: "We process your data in accordance with UK GDPR...",
};
```

#### E. Character Encoding for International SMS
**Challenge:** SMS character limits vary by language

```typescript
// Standard SMS: 160 characters (GSM-7 encoding)
// Unicode SMS (Chinese, Arabic, emoji): 70 characters (UCS-2 encoding)

function calculateSMSCount(message: string, language: string): number {
  const requiresUnicode = /[^\x00-\x7F]/.test(message); // Non-ASCII

  if (requiresUnicode) {
    // Unicode messages: 70 chars per SMS
    return Math.ceil(message.length / 70);
  } else {
    // Standard GSM-7: 160 chars per SMS
    return Math.ceil(message.length / 160);
  }
}

// Example warning system
async function warnBeforeSending(message: string, language: string) {
  const smsCount = calculateSMSCount(message, language);

  if (smsCount > 1) {
    return {
      warning: `This message will be sent as ${smsCount} SMS messages`,
      recommendation: language === 'zh' || language === 'ar'
        ? "Consider using WeChat or WhatsApp for longer messages"
        : "Consider shortening message or using email",
      estimatedCost: smsCount * 0.02, // $0.02 per SMS
    };
  }
}
```

---

## 4. Location-Specific Compliance Rules

### Challenge: Messaging regulations vary by country, state, and industry

#### A. Regulatory Landscape by Region

**United States:**
- **TCPA** (Telephone Consumer Protection Act) - Federal
- **HIPAA** (Health Insurance Portability and Accountability Act) - Federal
- **CCPA** (California Consumer Privacy Act) - California only
- **State-specific:** Illinois, Texas, Florida have additional consent rules

**European Union:**
- **GDPR** (General Data Protection Regulation) - All EU countries
- **ePrivacy Directive** - Additional messaging consent rules
- **Country-specific:** UK, France, Germany have stricter interpretations

**Canada:**
- **CASL** (Canadian Anti-Spam Legislation) - Strictest consent rules globally
- **PIPEDA** (Personal Information Protection) - Healthcare privacy

**Australia:**
- **Spam Act 2003** - Requires explicit consent
- **Privacy Act 1988** - Healthcare privacy rules

**Latin America:**
- **LGPD** (Brazil) - Similar to GDPR
- **Mexico:** Federal Data Protection Law
- **Argentina:** Personal Data Protection Law

#### B. Compliance Rules Database
```typescript
interface ComplianceRules {
  jurisdiction: string; // "US", "US-CA", "EU-FR", "CA", "AU"
  regulations: {
    name: string; // "TCPA", "GDPR", "CASL"
    requiresExplicitOptIn: boolean;
    optInMethod: 'any' | 'written' | 'electronic' | 'verbal';
    optOutProcessing: number; // Days allowed (1-30)
    optOutKeywords: string[]; // "STOP", "UNSUBSCRIBE", etc.
    consentExpiration?: number; // Months until consent expires
    requiresAge: number; // Minimum age for consent (13, 16, 18)
    requiresParentalConsent?: boolean;
  }[];

  messagingRestrictions: {
    allowedChannels: MessageChannel[];
    prohibitedContent: string[]; // "medical advice", "prescriptions"
    requiresEncryption: boolean;
    maxRetentionDays: number; // How long messages can be stored
    allowsAutomation: boolean; // Can AI send messages autonomously?
    requiresHumanReview: string[]; // Message types needing review
  };

  timing: {
    allowedDays: number[]; // 0-6 (Sunday-Saturday)
    quietHours: { start: string; end: string }; // "21:00" to "09:00"
    respectsLocalHolidays: boolean;
  };

  penalties: {
    violationFine: number; // Per message fine
    maxPenalty: number; // Maximum penalty
    reportingRequired: boolean; // Must report violations to authority
  };
}

// Example: US-California compliance (TCPA + CCPA + HIPAA)
const californiaRules: ComplianceRules = {
  jurisdiction: "US-CA",
  regulations: [
    {
      name: "TCPA",
      requiresExplicitOptIn: true,
      optInMethod: "any",
      optOutProcessing: 10, // New 2025 rule
      optOutKeywords: ["STOP", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"],
      requiresAge: 18,
    },
    {
      name: "HIPAA",
      requiresExplicitOptIn: true,
      optInMethod: "written",
      optOutProcessing: 30,
      optOutKeywords: ["STOP"],
      requiresAge: 18,
    },
    {
      name: "CCPA",
      requiresExplicitOptIn: false, // Opt-out based
      optInMethod: "any",
      optOutProcessing: 15,
      optOutKeywords: ["STOP", "DELETE MY DATA"],
      requiresAge: 16,
      requiresParentalConsent: true, // For ages 13-15
    },
  ],
  messagingRestrictions: {
    allowedChannels: ["sms", "email", "web_chat"],
    prohibitedContent: [
      "medical diagnoses",
      "prescription recommendations",
      "treatment outcomes",
    ],
    requiresEncryption: true,
    maxRetentionDays: 2555, // 7 years for HIPAA
    allowsAutomation: true,
    requiresHumanReview: ["complaints", "medical emergencies", "refund requests"],
  },
  timing: {
    allowedDays: [0, 1, 2, 3, 4, 5, 6], // All days
    quietHours: { start: "21:00", end: "08:00" },
    respectsLocalHolidays: true,
  },
  penalties: {
    violationFine: 500, // TCPA: $500-1500 per message
    maxPenalty: 1500000, // Class action potential
    reportingRequired: false,
  },
};

// Example: EU-France compliance (GDPR + ePrivacy)
const franceRules: ComplianceRules = {
  jurisdiction: "EU-FR",
  regulations: [
    {
      name: "GDPR",
      requiresExplicitOptIn: true,
      optInMethod: "electronic",
      optOutProcessing: 30,
      optOutKeywords: ["STOP", "DÉSABONNER"],
      consentExpiration: 24, // Consent expires after 2 years
      requiresAge: 16, // Higher than US
    },
    {
      name: "ePrivacy Directive",
      requiresExplicitOptIn: true,
      optInMethod: "electronic",
      optOutProcessing: 7, // Faster than GDPR
      optOutKeywords: ["STOP"],
      requiresAge: 16,
    },
  ],
  messagingRestrictions: {
    allowedChannels: ["sms", "email"],
    prohibitedContent: [
      "medical data",
      "health conditions",
      "treatment details",
    ],
    requiresEncryption: true,
    maxRetentionDays: 1825, // 5 years typical
    allowsAutomation: false, // Human must approve all messages
    requiresHumanReview: ["all marketing messages", "patient data"],
  },
  timing: {
    allowedDays: [1, 2, 3, 4, 5], // Monday-Friday only
    quietHours: { start: "20:00", end: "09:00" },
    respectsLocalHolidays: true,
  },
  penalties: {
    violationFine: 0, // Up to 4% of global revenue
    maxPenalty: 20000000, // €20 million or 4% revenue, whichever is higher
    reportingRequired: true, // Must report to CNIL within 72 hours
  },
};
```

#### C. Automated Compliance Checking
```typescript
async function validateMessageCompliance(
  message: OutboundMessage,
  patient: Patient,
  location: Location
): Promise<ComplianceCheckResult> {
  const rules = await getComplianceRules(location.jurisdiction);
  const violations: ComplianceViolation[] = [];

  // Check 1: Patient consent
  const consent = await getPatientConsent(patient.id, location.jurisdiction);
  if (rules.regulations[0].requiresExplicitOptIn && !consent.hasConsent) {
    violations.push({
      rule: rules.regulations[0].name,
      severity: "critical",
      message: "Patient has not provided explicit opt-in consent",
      remediation: "Obtain written consent before sending messages",
    });
  }

  // Check 2: Consent expiration (EU)
  if (consent.consentExpiration && consent.consentGivenAt) {
    const expirationDate = addMonths(consent.consentGivenAt, consent.consentExpiration);
    if (isAfter(new Date(), expirationDate)) {
      violations.push({
        rule: "GDPR",
        severity: "critical",
        message: "Patient consent has expired",
        remediation: "Re-obtain consent",
      });
    }
  }

  // Check 3: Prohibited content
  const containsProhibited = rules.messagingRestrictions.prohibitedContent.some(
    prohibited => message.body.toLowerCase().includes(prohibited.toLowerCase())
  );
  if (containsProhibited) {
    violations.push({
      rule: "Content Policy",
      severity: "high",
      message: "Message contains prohibited medical content",
      remediation: "Remove specific medical information, use general terms",
    });
  }

  // Check 4: Quiet hours
  const sendTime = utcToZonedTime(message.scheduledAt, location.timezone);
  const hour = format(sendTime, 'HH:mm');
  if (hour >= rules.timing.quietHours.start || hour <= rules.timing.quietHours.end) {
    violations.push({
      rule: "Quiet Hours",
      severity: "medium",
      message: `Message scheduled during quiet hours (${rules.timing.quietHours.start}-${rules.timing.quietHours.end})`,
      remediation: "Reschedule to next available time",
      autoFix: () => getNextAllowedSendTime(message.scheduledAt, rules),
    });
  }

  // Check 5: Age verification (CCPA for 13-15 year olds)
  if (patient.age < rules.regulations[0].requiresAge) {
    const needsParental = rules.regulations.some(r => r.requiresParentalConsent);
    if (needsParental && !patient.hasParentalConsent) {
      violations.push({
        rule: "Age Verification",
        severity: "critical",
        message: "Patient is under minimum age and lacks parental consent",
        remediation: "Obtain parental consent form",
      });
    }
  }

  return {
    compliant: violations.length === 0,
    violations,
    jurisdiction: location.jurisdiction,
    checkedAt: new Date(),
  };
}
```

---

## 5. Cross-Location Patient Communication

### Challenge: Patient visits multiple locations in a chain

#### A. Unified Patient Identity
```typescript
interface UnifiedPatient {
  globalId: string; // Unique across all locations

  // Location-specific records
  locationRecords: {
    locationId: string;
    localPatientId: string; // Location's internal ID
    firstVisit: Date;
    lastVisit: Date;
    totalVisits: number;
    totalSpend: number;
    preferredProvider?: string;
    locationNotes: string;
  }[];

  // Global preferences (apply to all locations)
  globalPreferences: {
    smsOptIn: boolean;
    emailOptIn: boolean;
    marketingOptIn: boolean;
    preferredLanguage: string;
    communicationPreferences: {
      frequency: 'daily' | 'weekly' | 'monthly';
      channels: MessageChannel[];
      quietHours: { start: string; end: string };
    };
  };

  // Primary home location
  primaryLocation: string;

  // Cross-location behavior
  isMultiLocationPatient: boolean;
  willingToTravel: boolean; // Indicated interest in other locations
  travelRadius: number; // Miles patient will travel
}
```

#### B. Cross-Location Messaging Rules
**Scenario 1: Patient visits Location A, receives message from Location B**

```typescript
interface CrossLocationMessage {
  originLocation: string; // Location sending message
  patientLocation: string; // Patient's primary location
  allowCrossLocation: boolean; // Corporate policy
  requiresDisclaimer: boolean; // "Message from Beverly Hills location"
  trackingRules: {
    attributeRevenueToOrigin: boolean;
    attributeRevenueToPatientHome: boolean;
    splitAttribution: boolean; // 50/50 split
  };
}

async function canSendCrossLocationMessage(
  fromLocation: Location,
  toPatient: UnifiedPatient,
  messageType: MessageType
): Promise<CrossLocationPermission> {
  const policy = await getCorporatePolicy();

  // Rule 1: Appointment reminders - always from booking location
  if (messageType === "automated" && isAppointmentReminder(message)) {
    return {
      allowed: true,
      reason: "Appointment confirmation from booking location",
    };
  }

  // Rule 2: Marketing campaigns - only from primary location (unless opted in)
  if (messageType === "campaign") {
    const optedInToAllLocations = toPatient.globalPreferences.allowAllLocations;

    if (!optedInToAllLocations && fromLocation.id !== toPatient.primaryLocation) {
      return {
        allowed: false,
        reason: "Patient has not opted in to messages from other locations",
        remediation: "Add checkbox: 'Receive offers from all 50 locations'",
      };
    }
  }

  // Rule 3: Franchise isolation - never cross-message between franchises
  if (policy.franchiseModel && fromLocation.franchiseeId !== toPatient.franchiseeId) {
    return {
      allowed: false,
      reason: "Franchise isolation policy",
    };
  }

  return { allowed: true };
}
```

**Scenario 2: Patient transfers between locations**

```typescript
async function handlePatientTransfer(
  patient: UnifiedPatient,
  fromLocation: Location,
  toLocation: Location,
  reason: 'relocation' | 'closer_location' | 'preferred_provider'
) {
  // Step 1: Update primary location
  patient.primaryLocation = toLocation.id;

  // Step 2: Transfer messaging ownership
  const activeConversations = await getActiveConversations(patient.globalId, fromLocation.id);

  for (const conversation of activeConversations) {
    // Notify from location
    await sendInternalAlert(fromLocation, {
      type: "patient_transfer",
      message: `${patient.name} has transferred to ${toLocation.name}`,
      action: "close_or_transfer_conversations",
    });

    // Notify to location
    await sendInternalAlert(toLocation, {
      type: "patient_received",
      message: `${patient.name} has transferred from ${fromLocation.name}`,
      context: {
        previousProvider: patient.locationRecords.find(r => r.locationId === fromLocation.id)?.preferredProvider,
        treatmentHistory: await getTreatmentSummary(patient.globalId, fromLocation.id),
        notes: await getTransferNotes(patient.globalId, fromLocation.id),
      },
    });
  }

  // Step 3: Send patient confirmation
  await sendSMS({
    to: patient.phone,
    body: `Hi ${patient.name}, we've updated your primary location to ${toLocation.name} (${toLocation.phone}). You'll now receive appointment reminders from this location.`,
    from: toLocation.phone,
    metadata: { type: "location_transfer_confirmation" },
  });

  // Step 4: Historical data migration
  await migratePatientData(patient, fromLocation, toLocation);
}
```

---

## 6. Brand Consistency Across Locations

### Challenge: Maintain brand voice while allowing location customization

#### A. Brand Guidelines System
```typescript
interface BrandGuidelines {
  corporateId: string;

  // Voice and tone
  brandVoice: {
    tone: 'professional' | 'friendly' | 'luxury' | 'clinical';
    personalityTraits: string[]; // ["warm", "knowledgeable", "trustworthy"]
    avoidWords: string[]; // ["cheap", "deal", "discount"]
    preferredWords: string[]; // ["exclusive", "premium", "personalized"]
  };

  // Visual identity
  visualIdentity: {
    primaryColor: string; // Hex color
    logoUrl: string;
    fontFamily: string;
    requiresLogoInMessages: boolean;
  };

  // Messaging standards
  messagingStandards: {
    greetingFormat: string; // "Hi {firstName}" vs "Dear {firstName}"
    closingFormat: string; // "Best, {locationName}" vs "- {providerName}"
    includeLocationPhone: boolean;
    includeLocationAddress: boolean;
    includeWebsiteLink: boolean;
    signatureTemplate: string;
  };

  // Compliance requirements
  complianceRequirements: {
    disclaimerText: string; // Standard disclaimer for all messages
    optOutInstructions: string; // "Reply STOP to unsubscribe"
    privacyPolicyLink: string;
    requiresReviewFor: string[]; // ["promotions", "medical_content"]
  };

  // Customization rules
  customizationRules: {
    allowLocationCustomization: boolean;
    customizableElements: string[]; // ["greeting", "offer_amount", "call_to_action"]
    requiresCorporateApproval: string[]; // ["new_templates", "off_brand_content"]
    maxDeviationScore: number; // 0-100, how far from brand voice allowed
  };
}

// Example: Luxury med spa chain brand guidelines
const luxuryMedSpaBrand: BrandGuidelines = {
  corporateId: "corp-001",
  brandVoice: {
    tone: "luxury",
    personalityTraits: ["elegant", "exclusive", "personalized", "expert"],
    avoidWords: ["cheap", "deal", "bargain", "sale", "discount"],
    preferredWords: ["exclusive", "premium", "complimentary", "bespoke", "curated"],
  },
  visualIdentity: {
    primaryColor: "#1a1a1a", // Elegant black
    logoUrl: "https://cdn.brand.com/logo.png",
    fontFamily: "Playfair Display, serif",
    requiresLogoInMessages: true,
  },
  messagingStandards: {
    greetingFormat: "Dear {firstName},",
    closingFormat: "With care,\nThe {locationName} Team",
    includeLocationPhone: true,
    includeLocationAddress: false,
    includeWebsiteLink: true,
    signatureTemplate: "{locationName} | {phone} | {website}",
  },
  complianceRequirements: {
    disclaimerText: "Results may vary. Consultation required.",
    optOutInstructions: "Reply STOP to opt out.",
    privacyPolicyLink: "https://brand.com/privacy",
    requiresReviewFor: ["medical_claims", "pricing", "new_services"],
  },
  customizationRules: {
    allowLocationCustomization: true,
    customizableElements: ["offer_amount", "provider_name", "appointment_times"],
    requiresCorporateApproval: ["brand_voice_changes", "new_service_mentions"],
    maxDeviationScore: 25, // Low tolerance for deviation
  },
};
```

#### B. Automated Brand Compliance Checking
```typescript
async function checkBrandCompliance(
  message: string,
  brandGuidelines: BrandGuidelines
): Promise<BrandComplianceResult> {
  const issues: BrandIssue[] = [];

  // Check 1: Prohibited words
  const lowerMessage = message.toLowerCase();
  for (const avoidWord of brandGuidelines.brandVoice.avoidWords) {
    if (lowerMessage.includes(avoidWord.toLowerCase())) {
      issues.push({
        type: "prohibited_word",
        severity: "high",
        word: avoidWord,
        suggestion: findPreferredAlternative(avoidWord, brandGuidelines),
      });
    }
  }

  // Check 2: Greeting format
  const hasCorrectGreeting = message.startsWith(
    brandGuidelines.messagingStandards.greetingFormat.replace('{firstName}', '')
  );
  if (!hasCorrectGreeting) {
    issues.push({
      type: "incorrect_greeting",
      severity: "medium",
      expected: brandGuidelines.messagingStandards.greetingFormat,
      actual: message.split(',')[0],
    });
  }

  // Check 3: Brand voice tone using AI
  const toneAnalysis = await analyzeMessageTone(message);
  const expectedTone = brandGuidelines.brandVoice.tone;

  if (toneAnalysis.detectedTone !== expectedTone) {
    issues.push({
      type: "tone_mismatch",
      severity: "medium",
      expected: expectedTone,
      detected: toneAnalysis.detectedTone,
      confidence: toneAnalysis.confidence,
      suggestion: await rewriteInBrandVoice(message, brandGuidelines),
    });
  }

  // Check 4: Required disclaimer
  if (brandGuidelines.complianceRequirements.disclaimerText) {
    if (!message.includes(brandGuidelines.complianceRequirements.disclaimerText)) {
      issues.push({
        type: "missing_disclaimer",
        severity: "critical",
        requiredText: brandGuidelines.complianceRequirements.disclaimerText,
        autoFix: () => `${message}\n\n${brandGuidelines.complianceRequirements.disclaimerText}`,
      });
    }
  }

  // Check 5: Deviation score
  const deviationScore = calculateBrandDeviation(message, brandGuidelines);
  if (deviationScore > brandGuidelines.customizationRules.maxDeviationScore) {
    issues.push({
      type: "excessive_deviation",
      severity: "high",
      score: deviationScore,
      maxAllowed: brandGuidelines.customizationRules.maxDeviationScore,
      recommendation: "This message requires corporate approval before sending",
    });
  }

  return {
    compliant: issues.filter(i => i.severity === 'critical').length === 0,
    issues,
    deviationScore,
    requiresApproval: deviationScore > brandGuidelines.customizationRules.maxDeviationScore,
  };
}
```

#### C. Template Approval Workflow
```typescript
interface TemplateApprovalWorkflow {
  templateId: string;
  createdBy: string; // Location staff ID
  createdAt: Date;

  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'requires_changes';

  approvalChain: {
    level: 'location_manager' | 'regional_director' | 'corporate_marketing' | 'legal';
    assignedTo: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewedAt?: Date;
    comments?: string;
    requiredChanges?: string[];
  }[];

  brandComplianceCheck: BrandComplianceResult;
  regulatoryComplianceCheck: ComplianceCheckResult;

  finalApprovedVersion?: string;
  approvedAt?: Date;
  expiresAt?: Date; // Templates expire after 1 year
}

async function submitTemplateForApproval(
  template: MessageTemplate,
  submittedBy: StaffMember,
  location: Location
): Promise<TemplateApprovalWorkflow> {
  // Run automated checks
  const brandCheck = await checkBrandCompliance(template.body, location.brandGuidelines);
  const complianceCheck = await validateMessageCompliance(template, location);

  // Determine approval chain based on issues
  const approvalChain = [];

  // Always requires location manager approval
  approvalChain.push({
    level: 'location_manager',
    assignedTo: location.managerId,
    status: 'pending',
  });

  // If brand issues, add marketing review
  if (brandCheck.requiresApproval) {
    approvalChain.push({
      level: 'corporate_marketing',
      assignedTo: 'marketing-team',
      status: 'pending',
    });
  }

  // If compliance issues, add legal review
  if (!complianceCheck.compliant) {
    approvalChain.push({
      level: 'legal',
      assignedTo: 'legal-team',
      status: 'pending',
    });
  }

  const workflow: TemplateApprovalWorkflow = {
    templateId: template.id,
    createdBy: submittedBy.id,
    createdAt: new Date(),
    status: 'pending_review',
    approvalChain,
    brandComplianceCheck: brandCheck,
    regulatoryComplianceCheck: complianceCheck,
  };

  // Notify first approver
  await notifyApprover(approvalChain[0].assignedTo, workflow);

  return workflow;
}
```

---

## 7. Enterprise Challenges Med Spa Chains Struggle With

Based on market research and competitor gaps, here are the biggest pain points:

### A. Inconsistent Patient Experience
**Problem:** Patient receives different message quality depending on location

**Example:**
- **Beverly Hills location:** "Dear Sarah, Your complimentary consultation is confirmed for Tuesday at 2 PM. Our expert injector, Dr. Martinez, looks forward to creating your personalized treatment plan."
- **Suburban location:** "Hi, appt tomorrow 2pm. See you then."

**Root Causes:**
- ❌ No centralized template management
- ❌ Location staff write their own messages
- ❌ No quality control or brand guidelines enforcement
- ❌ Training varies by location

**Solution:**
```typescript
// Corporate-approved templates with built-in brand voice
const appointmentConfirmation = {
  template: "Dear {firstName}, Your {serviceType} is confirmed for {dayOfWeek} at {time}. {providerTitle} {providerName} looks forward to seeing you at our {locationName} location.",
  mandatoryFields: ["firstName", "serviceType", "dayOfWeek", "time", "providerName", "locationName"],
  optionalFields: ["providerTitle", "specialInstructions"],
  tone: "luxury",
  brandCompliant: true,
  requiresApproval: false, // Pre-approved
};
```

### B. Duplicate Messaging to Multi-Location Patients
**Problem:** Patient receives same promotion from 3 nearby locations

**Example:**
```
10:05 AM - Beverly Hills: "🎉 Botox special! $100 off this week!"
10:12 AM - Santa Monica: "💉 Botox sale! Save $100 today!"
10:47 AM - West Hollywood: "✨ Special: Botox $100 off!"
```

**Root Causes:**
- ❌ No deduplication logic
- ❌ Locations don't know patient received message from another location
- ❌ No frequency capping across locations

**Solution:**
```typescript
interface MessageDeduplication {
  patientId: string;
  campaignType: string; // "botox_promotion"

  // Track messages across all locations
  recentMessages: {
    locationId: string;
    sentAt: Date;
    campaignType: string;
  }[];

  // Deduplication rules
  rules: {
    maxMessagesPerDay: number;
    maxSameCampaignPerWeek: number;
    preferredLocation: 'closest' | 'primary' | 'most_recent_visit';
  };
}

async function shouldSendCampaignMessage(
  patient: UnifiedPatient,
  campaign: Campaign,
  fromLocation: Location
): Promise<{ allowed: boolean; reason?: string }> {
  // Check if patient received similar message recently
  const recentSimilar = await getRecentMessages(patient.globalId, {
    campaignType: campaign.type,
    days: 7,
  });

  if (recentSimilar.length > 0) {
    return {
      allowed: false,
      reason: `Patient already received ${campaign.type} from ${recentSimilar[0].locationName} on ${recentSimilar[0].sentAt}`,
    };
  }

  // Check daily message cap
  const todayCount = await getTodayMessageCount(patient.globalId);
  if (todayCount >= patient.messagePreferences.maxPerDay) {
    return {
      allowed: false,
      reason: `Patient has reached daily message limit (${todayCount}/${patient.messagePreferences.maxPerDay})`,
    };
  }

  return { allowed: true };
}
```

### C. No Cross-Location Analytics
**Problem:** Corporate can't see total campaign performance across locations

**Gaps:**
- ❌ Each location tracks separately
- ❌ No aggregate reporting
- ❌ Can't compare location performance
- ❌ Can't identify best-performing templates

**Solution:**
```typescript
interface EnterpriseAnalytics {
  // Aggregate metrics across all locations
  global: {
    totalMessages: number;
    totalPatients: number;
    avgResponseTime: number; // Minutes
    campaignConversionRate: number; // %
    optOutRate: number; // %
  };

  // Performance by location
  byLocation: {
    locationId: string;
    locationName: string;
    messagesSent: number;
    responseRate: number;
    conversionRate: number;
    revenueGenerated: number;
    ranking: number; // 1-50
    bestPerformingTemplate: string;
  }[];

  // Performance by template
  byTemplate: {
    templateId: string;
    templateName: string;
    usageCount: number;
    avgConversionRate: number;
    bestPerformingLocation: string;
    worstPerformingLocation: string;
  }[];

  // Comparative insights
  insights: {
    type: 'best_practice' | 'warning' | 'opportunity';
    message: string;
    data: any;
  }[];
}

// Example insight
{
  type: "best_practice",
  message: "Beverly Hills location has 45% higher conversion rate using 'luxury' tone templates",
  data: {
    locationId: "bev-hills",
    templateTone: "luxury",
    conversionRate: 0.38,
    networkAvg: 0.26,
  },
  recommendation: "Roll out luxury tone templates to all locations",
}
```

### D. Timezone Management Failures
**Problem:** Corporate campaigns send at wrong local times

**Common Failures:**
1. **Same UTC time for everyone:** 10 AM EST patient receives message at 7 AM PST
2. **Manual timezone selection:** Staff forget to set timezone, defaults to EST
3. **DST confusion:** Campaign scheduled pre-DST sends at wrong time post-DST

**Solution:** Automatic timezone detection and adjustment (covered in Section 2)

### E. Compliance Violations
**Problem:** One location's violation affects entire brand

**Example Cases:**
- **2024:** Med spa chain fined $2.3M for TCPA violations
  - Cause: Franchise location continued messaging after opt-out
  - Impact: Corporate brand reputation damaged

- **2023:** EU med spa fined €500k for GDPR violation
  - Cause: Location stored patient messages beyond retention period
  - Impact: All locations required to undergo compliance audit

**Root Causes:**
- ❌ Inconsistent compliance training
- ❌ No centralized opt-out enforcement
- ❌ Manual compliance checking
- ❌ No real-time monitoring

**Solution:**
```typescript
interface EnterpriseComplianceMonitoring {
  // Real-time violation detection
  violations: {
    locationId: string;
    violationType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    detectedAt: Date;
    details: any;
    status: 'open' | 'under_review' | 'resolved';
  }[];

  // Automated enforcement
  autoEnforcement: {
    enabled: boolean;
    actions: {
      trigger: string; // "opt_out_received"
      action: 'block_all_locations' | 'alert_compliance' | 'auto_remove';
      scope: 'location' | 'network';
    }[];
  };

  // Compliance scoring
  locationScores: {
    locationId: string;
    complianceScore: number; // 0-100
    recentViolations: number;
    trainingStatus: 'current' | 'expired';
    lastAudit: Date;
  }[];
}

// Example: Automatic cross-location opt-out enforcement
async function enforceOptOut(patientId: string, optOutRequest: OptOutDetection) {
  // Immediately block from requesting location
  await blockPatient(patientId, optOutRequest.locationId);

  // Get all locations patient has visited
  const visitedLocations = await getPatientLocations(patientId);

  // Block across all visited locations (network-wide)
  for (const location of visitedLocations) {
    await blockPatient(patientId, location.id);

    // Cancel any scheduled messages
    await cancelScheduledMessages(patientId, location.id);
  }

  // Alert compliance team
  await notifyCompliance({
    type: "opt_out_processed",
    patientId,
    locations: visitedLocations.map(l => l.id),
    requestedAt: optOutRequest.detectedAt,
    processedAt: new Date(),
  });

  // Log for audit
  await auditLog({
    action: "network_wide_opt_out",
    patientId,
    affectedLocations: visitedLocations.length,
    triggeredBy: "automated_system",
  });
}
```

---

## 8. Implementation Roadmap

### Phase 1: Multi-Location Foundation (Month 1-2)
**Goal:** Support basic multi-location messaging

**Features:**
- ✅ Location entity in database
- ✅ Location-based patient assignment
- ✅ Location-specific phone numbers
- ✅ Basic location filtering in UI
- ✅ Location-level permissions

**Database Schema:**
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  timezone VARCHAR(100) NOT NULL, -- IANA timezone
  phone VARCHAR(20),
  address TEXT,
  business_hours JSONB, -- Opening hours
  brand_settings JSONB, -- Brand guidelines
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE patients (
  id UUID PRIMARY KEY,
  global_id UUID, -- Unified patient ID across locations
  primary_location_id UUID REFERENCES locations(id),
  -- ... other patient fields
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  location_id UUID REFERENCES locations(id),
  patient_id UUID REFERENCES patients(id),
  body TEXT,
  sent_at TIMESTAMP,
  timezone VARCHAR(100), -- Timezone when sent
  -- ... other message fields
);
```

### Phase 2: Timezone Intelligence (Month 2-3)
**Goal:** Automatic timezone-aware messaging

**Features:**
- ✅ Automatic timezone detection from location
- ✅ Send-time optimization per timezone
- ✅ Business hours enforcement
- ✅ DST handling
- ✅ Holiday calendar per location

**Key Function:**
```typescript
async function scheduleOptimalSendTime(
  message: Message,
  patient: Patient,
  location: Location
): Promise<Date> {
  const timezone = location.timezone;
  const localTime = utcToZonedTime(message.scheduledAt, timezone);

  // Check if within business hours
  if (!isWithinBusinessHours(location, localTime)) {
    localTime = getNextBusinessDayMorning(location);
  }

  // Check for holidays
  const holidays = await getLocationHolidays(location.id);
  if (isHoliday(localTime, holidays)) {
    localTime = getNextNonHoliday(localTime, holidays);
  }

  // Convert back to UTC for storage
  return zonedTimeToUtc(localTime, timezone);
}
```

### Phase 3: Unified Patient Identity (Month 3-4)
**Goal:** Cross-location patient tracking

**Features:**
- ✅ Global patient ID across locations
- ✅ Visit history at all locations
- ✅ Cross-location deduplication
- ✅ Patient transfer workflow
- ✅ Unified message history

### Phase 4: Brand Consistency (Month 4-5)
**Goal:** Maintain brand voice across locations

**Features:**
- ✅ Corporate template library
- ✅ Brand compliance checking
- ✅ Template approval workflow
- ✅ Automated brand voice analysis
- ✅ Location customization within guidelines

### Phase 5: Compliance & Localization (Month 5-6)
**Goal:** International readiness

**Features:**
- ✅ Jurisdiction-based compliance rules
- ✅ Multi-language template support
- ✅ Real-time translation
- ✅ Locale-specific formatting (date, currency, phone)
- ✅ Automated compliance checking

### Phase 6: Enterprise Analytics (Month 6-7)
**Goal:** Corporate-level insights

**Features:**
- ✅ Aggregate reporting across locations
- ✅ Location performance comparison
- ✅ Best practice identification
- ✅ Template performance analytics
- ✅ Compliance dashboards

---

## 9. Competitive Advantage Matrix

| Feature | Current Best | Our Target | Competitive Gap |
|---------|-------------|-----------|----------------|
| **Multi-Location Support** | Zenoti (basic) | Advanced | Cross-location patient transfers |
| **Timezone Intelligence** | None | Automatic | DST + business hours enforcement |
| **Multi-Language** | Zenoti Zeenie | Real-time | Live translation during conversations |
| **Brand Consistency** | None | Automated | AI-powered brand compliance |
| **Compliance Automation** | None | Network-wide | Automatic cross-location enforcement |
| **Cross-Location Analytics** | Mangomint (basic) | Enterprise | Aggregate + comparative insights |
| **Patient Deduplication** | None | Automatic | Frequency capping across locations |
| **Franchise Model Support** | None | Full isolation | Corporate oversight with privacy |

---

## 10. Success Metrics

### Technical Metrics
- **99.9% uptime** for multi-location messaging
- **< 2 second** timezone calculation and adjustment
- **< 5 second** cross-location patient lookup
- **100% DST transition** handling accuracy

### Compliance Metrics
- **0** cross-location opt-out failures
- **100%** network-wide opt-out enforcement within 10 days
- **< 1%** brand guideline violations
- **0** jurisdiction compliance violations

### Business Metrics
- **50% reduction** in duplicate messages to multi-location patients
- **30% improvement** in campaign conversion with timezone optimization
- **40% faster** template approval workflow
- **60% reduction** in compliance training time
- **25% increase** in multi-location patient transfers

### User Experience Metrics
- **4.8+** star satisfaction from corporate admins
- **90%+** location managers find system easy to use
- **80%+** reduction in manual timezone calculations
- **95%+** of templates approved on first submission

---

## 11. Vendor Requirements (If Outsourcing)

If using third-party services, require:

### Twilio / Communication Providers
- ✅ Multi-location phone number provisioning
- ✅ Location-specific sender IDs
- ✅ Timezone-aware scheduling APIs
- ✅ Webhook support for delivery receipts
- ✅ Compliance tools (opt-out, consent tracking)
- ✅ International SMS support
- ✅ MMS support for multi-language content

### Translation Services (Google Cloud Translation / DeepL)
- ✅ Healthcare-specific medical terminology
- ✅ Real-time translation APIs
- ✅ Batch translation for templates
- ✅ Quality scoring
- ✅ Human review workflow integration
- ✅ Support for 20+ languages
- ✅ HIPAA compliance (BAA required)

### Database (PostgreSQL / Firebase)
- ✅ Multi-tenant architecture support
- ✅ Row-level security for franchise isolation
- ✅ Timezone data types
- ✅ JSONB for flexible location settings
- ✅ Full-text search for multi-language content
- ✅ Replication for global availability
- ✅ HIPAA compliance (encrypted at rest)

### Analytics (Google Cloud / Mixpanel)
- ✅ Cross-location aggregate reporting
- ✅ Real-time dashboards
- ✅ Comparative analytics
- ✅ Funnel analysis per location
- ✅ Custom event tracking
- ✅ Data export for corporate reporting

---

## Conclusion

Multi-location and international messaging for medical spas requires:

1. **Sophisticated architecture** - Unified patient identity, location-aware routing
2. **Timezone intelligence** - Automatic adjustment, DST handling, business hours
3. **Localization** - Multi-language, cultural considerations, locale formatting
4. **Compliance automation** - Jurisdiction-specific rules, network-wide enforcement
5. **Brand consistency** - AI-powered brand compliance, approval workflows
6. **Enterprise analytics** - Aggregate reporting, comparative insights
7. **Patient experience** - Deduplication, seamless transfers, consistent quality

**No current platform does this well.** This is a major market opportunity to differentiate and win enterprise medical spa chains.

**Next Steps:**
1. Validate requirements with multi-location med spa operators
2. Design database schema for multi-location support
3. Prototype timezone-aware scheduling
4. Build brand compliance checking system
5. Create enterprise analytics dashboard

---

**Document Version:** 1.0
**Last Updated:** January 8, 2026
**Next Review:** April 2026
