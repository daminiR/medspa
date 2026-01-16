# Staff Permissions for Messaging Systems in Medical Spas
## Best Practices & HIPAA Compliance Guide

**Last Updated:** January 9, 2026
**Platform:** Medical Spa Admin Platform
**Document Status:** Research Findings & Implementation Guidelines

---

## Executive Summary

This document provides comprehensive best practices for implementing staff permissions in medical spa messaging systems, ensuring HIPAA compliance, operational efficiency, and patient privacy. It addresses role-based access control (RBAC), the minimum necessary principle, audit logging, and multi-location considerations.

**Key Takeaways:**
- Implement granular role-based permissions aligned with HIPAA minimum necessary principle
- Provider-owned conversations maintain clinical continuity and accountability
- Hide sensitive contact details from non-clinical staff while allowing messaging
- Comprehensive audit logging is mandatory for HIPAA compliance
- Multi-location practices require location-specific permission boundaries

---

## Table of Contents

1. [Who Should Be Able to Send Messages?](#1-who-should-be-able-to-send-messages)
2. [Conversation Visibility: Own Patients vs All Patients](#2-conversation-visibility-own-patients-vs-all-patients)
3. [Client Ownership Models](#3-client-ownership-models)
4. [Hide Contact Details but Allow Messaging](#4-hide-contact-details-but-allow-messaging)
5. [Manager Oversight Requirements](#5-manager-oversight-requirements)
6. [Audit Logging for Compliance](#6-audit-logging-for-compliance)
7. [Permission Templates by Role](#7-permission-templates-by-role)
8. [Multi-Location Permission Considerations](#8-multi-location-permission-considerations)
9. [HIPAA Minimum Necessary Principle](#9-hipaa-minimum-necessary-principle)
10. [Implementation Checklist](#10-implementation-checklist)
11. [Security Updates for 2026](#11-security-updates-for-2026)

---

## 1. Who Should Be Able to Send Messages?

### Overview
Message sending permissions should be stratified by role and clinical necessity, balancing operational efficiency with patient privacy.

### Recommended Permission Levels

#### **Full Messaging Rights (Send & Receive)**
- **Medical Director / Physician**
- **Nurse Practitioners**
- **Registered Nurses**
- **Office Managers**
- **Patient Coordinators**

**Rationale:** These roles require direct patient communication for clinical care, appointment coordination, and administrative functions.

#### **Limited Messaging Rights (Templates/Quick Replies Only)**
- **Front Desk Staff**
- **Billing Specialists**

**Rationale:** These roles need to communicate operational information (appointments, billing) but should be restricted to pre-approved templates to ensure message consistency and reduce HIPAA risk.

#### **Read-Only (No Sending)**
- **Aestheticians** (unless they are the assigned provider)
- **Laser Technicians** (unless they are the assigned provider)
- **Marketing Coordinators**

**Rationale:** These roles may need context about patient communications but should not initiate unsupervised messages containing PHI.

#### **No Access**
- **Injection Specialists** (non-clinical administrative staff)
- **Contractors/Temporary Staff** (without specific authorization)

**Rationale:** Staff without ongoing patient relationships or clinical responsibilities should not access patient communications.

### Best Practices
- **Template-Based Messaging:** Front desk should use pre-approved templates for appointment reminders, confirmations, and rescheduling
- **Approval Workflows:** Non-clinical staff messages should be reviewed by clinical staff before sending (optional flag)
- **Emergency Override:** Clinical staff should have emergency override permissions to send urgent messages
- **After-Hours Restrictions:** Non-clinical staff should be blocked from sending messages outside business hours

### HIPAA Compliance Considerations
According to HIPAA regulations, text messaging PHI via platforms like MS Teams covered by a Business Associate Agreement (BAA) is HIPAA compliant, but SMS text messaging is a violation unless the recipient specifically requested it and was warned of risks. All messaging platforms must:
- Use end-to-end encryption
- Support multi-factor authentication (MFA)
- Maintain comprehensive audit trails
- Be covered by BAAs with vendors

---

## 2. Conversation Visibility: Own Patients vs All Patients

### The Core Question
**Should staff see all patient conversations, or only conversations for patients they directly treat/manage?**

### Recommended Approach: Hybrid Model

#### **View All Conversations**
**Roles:**
- Medical Director
- Office Manager
- Patient Coordinators (for scheduling purposes)
- Billing Specialists (for payment-related communications)

**Implementation:**
```typescript
permissions: {
  viewAllMessages: true,
  viewOwnMessages: true, // redundant but explicit
  sendMessages: true,
}
```

**Use Cases:**
- Manager oversight and quality assurance
- Cross-coverage when primary provider is unavailable
- Billing inquiries requiring communication context
- Emergency patient situations

#### **View Only Own Patients' Conversations**
**Roles:**
- Nurse Practitioners (primary providers)
- Registered Nurses (assigned to specific patients)
- Aestheticians (for their booked clients)
- Laser Technicians (for their booked clients)

**Implementation:**
```typescript
permissions: {
  viewOwnMessages: true,
  viewAllMessages: false,
  sendMessages: true,
}

// Filter conversations by provider assignment
const visibleConversations = conversations.filter(conv =>
  conv.assignedTo?.id === currentUser.id ||
  conv.patient.primaryProviderId === currentUser.id
)
```

**Use Cases:**
- Maintaining provider-patient continuity
- Clinical decision-making based on patient communication history
- Post-treatment follow-up
- Complication management

#### **View Assigned + Own Location**
**Roles:**
- Front Desk Staff (location-specific)

**Implementation:**
```typescript
permissions: {
  viewOwnMessages: false,
  viewAllMessages: false,
  viewLocationMessages: true,
  sendMessages: false, // or template-only
}

// Filter by location
const visibleConversations = conversations.filter(conv =>
  conv.patient.primaryLocation === currentUser.primaryLocation
)
```

### Best Practices
- **Default to Least Privilege:** Start with own-patients-only and expand access as needed
- **Provider Assignment Required:** All conversations must have an assigned provider for access control
- **Temporary Delegation:** Allow providers to temporarily delegate access (e.g., during vacation)
- **Location Boundaries:** Multi-location practices should enforce location-based visibility by default

---

## 3. Client Ownership Models

### Provider Ownership Model

The **provider-owned model** is the gold standard for medical spas, where each patient is assigned to a primary provider who "owns" the relationship and communication.

#### **Key Principles**

1. **Primary Provider Assignment**
   - Every patient has a designated primary provider (NP, RN, Aesthetician)
   - Primary provider automatically sees all conversations for their patients
   - Primary provider is notified of all new messages from their patients

2. **Ownership Transfer**
   - Ownership can be transferred when patients switch providers
   - Transfer requires explicit action and audit trail
   - Historical messages remain visible to new owner

3. **Shared Access**
   - Other providers can view conversations if:
     - They have an upcoming appointment with the patient
     - They are covering for the primary provider
     - They are escalated into a case (manager involvement)

#### **Implementation in Your Platform**

Current schema includes:
```typescript
// From patient.ts
interface Patient {
  primaryProviderId?: string
  primaryProviderName?: string
}

// From messaging.ts
interface Conversation {
  assignedTo?: StaffMember  // Currently handling conversation
  patient: MessagingPatient
}
```

**Recommended Enhancement:**
```typescript
interface Conversation {
  patient: MessagingPatient
  primaryProvider: StaffMember        // Patient's primary provider (from patient record)
  assignedTo?: StaffMember            // Staff currently handling this conversation (may differ from primary)
  sharedWith?: StaffMember[]          // Additional staff with temporary access
  ownershipHistory?: OwnershipTransfer[]
}

interface OwnershipTransfer {
  id: string
  fromProviderId: string
  toProviderId: string
  transferredBy: string
  transferredAt: Date
  reason?: string
}
```

#### **Business Rules**

- **Auto-Assignment:** When a patient books with a provider for the first time, that provider becomes the primary
- **Ownership Continuity:** Primary provider remains assigned unless explicitly changed
- **Multi-Provider Patients:** Patients seeing multiple providers have one primary provider (usually first or most frequent)
- **Coverage Model:** When primary provider is out, conversations can be assigned to covering provider temporarily

### Alternative Model: Team-Based Ownership

Some med spas operate with team-based care where multiple providers collaborate on patient care.

**Implementation:**
```typescript
interface Patient {
  primaryProviderId: string           // Still has one primary
  careTeam: string[]                  // Array of provider IDs in patient's care team
}

// Team members all see conversations
const hasAccess = currentUser.permissions.viewAllMessages ||
                  conversation.patient.primaryProviderId === currentUser.id ||
                  conversation.patient.careTeam.includes(currentUser.id)
```

**Use Cases:**
- Multi-disciplinary treatments (RN + Aesthetician)
- Training scenarios (experienced provider + trainee)
- Specialization handoffs (laser tech → injection specialist)

---

## 4. Hide Contact Details but Allow Messaging

### The Privacy Paradox

Medical spas often want to **restrict access to patient contact information** (phone numbers, email addresses) while still **allowing staff to send messages through the platform**. This protects patient privacy from staff who shouldn't have direct access but need to communicate operationally.

### Implementation Strategy

#### **Three-Tier Contact Visibility**

**Tier 1: Full Contact Access**
- Medical Director
- Office Manager
- Billing Specialists (need to reach patients for payments)
- Primary Provider (for their patients)

**Display:** Full phone number and email visible

```typescript
// Show full contact
<div>
  <p>Phone: {patient.phone}</p>
  <p>Email: {patient.email}</p>
</div>
```

**Tier 2: Masked Contact with In-App Messaging**
- Front Desk Staff
- Non-primary providers viewing shared patients
- Patient Coordinators

**Display:** Masked phone/email, but can send messages through the platform

```typescript
// Mask sensitive data
const maskPhoneNumber = (phone: string) => {
  // (555) 123-4567 → (555) ***-4567
  return phone.replace(/(\d{3})\s*(\d{3})(\d{4})/, '$1 ***-$3')
}

const maskEmail = (email: string) => {
  // john.doe@email.com → j****@email.com
  const [local, domain] = email.split('@')
  return `${local[0]}${'*'.repeat(local.length - 1)}@${domain}`
}

<div>
  <p>Phone: {maskPhoneNumber(patient.phone)}</p>
  <p>Email: {maskEmail(patient.email)}</p>
  <Button onClick={() => openMessageComposer(patient.id)}>
    Send Message
  </Button>
</div>
```

**Tier 3: No Contact Info, No Messaging**
- Marketing Coordinators (can see anonymized data for reports only)
- Contractors/Temporary Staff

**Display:** No contact information shown at all

#### **Audit Logging for Contact Views**

Every time a staff member views unmasked contact information, log it:

```typescript
interface ContactViewLog {
  id: string
  patientId: string
  staffId: string
  staffName: string
  viewedField: 'phone' | 'email' | 'address'
  viewedAt: Date
  ipAddress: string
  reason?: string // Optional "Why are you viewing this?"
}

// Log when contact info is accessed
const viewPatientContact = async (patientId: string, field: string) => {
  await logAudit({
    action: 'VIEW_CONTACT_INFO',
    patientId,
    staffId: currentUser.id,
    field,
    timestamp: new Date(),
  })
}
```

### Platform Message Routing

Messages sent through the platform never expose patient contact details to restricted staff:

```typescript
// API route: /api/messaging/send
export async function POST(req: Request) {
  const { patientId, message, staffId } = await req.json()

  // Check staff permissions
  const staff = await getStaffMember(staffId)
  if (!staff.permissions.sendMessages) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Get patient contact info (staff never sees this)
  const patient = await getPatient(patientId)

  // Send via messaging service (Twilio, etc.)
  await twilioClient.messages.create({
    to: patient.phone, // Staff doesn't see this
    from: CLINIC_NUMBER,
    body: message,
  })

  // Log audit trail
  await logMessageSent(staffId, patientId, message)

  return Response.json({ success: true })
}
```

### Benefits

- **Patient Privacy:** Staff can't take patient contact info to competitors
- **Audit Trail:** All communications go through traceable platform
- **Compliance:** Satisfies HIPAA minimum necessary principle
- **Operational Efficiency:** Staff can still do their jobs without unnecessary data access

---

## 5. Manager Oversight Requirements

### Why Manager Oversight Matters

Medical directors, office managers, and compliance officers need visibility into all staff-patient communications for:
- **Quality assurance:** Ensuring professional, accurate communication
- **Compliance monitoring:** Detecting HIPAA violations or inappropriate messages
- **Training:** Identifying coaching opportunities
- **Liability protection:** Documenting proper patient communication
- **Conflict resolution:** Investigating patient complaints

### Oversight Permission Levels

#### **Full Oversight (View All Conversations)**
**Roles:** Medical Director, Office Manager, Compliance Officer

**Capabilities:**
- View all conversations across all locations
- Read all messages (incoming and outgoing)
- View message history and timestamps
- Access audit logs
- Export conversation transcripts
- Reassign conversations to different staff

**Implementation:**
```typescript
permissions: {
  viewAllMessages: true,
  viewAllLocations: true,
  viewAuditLogs: true,
  exportConversations: true,
  reassignConversations: true,
  manageStaff: true,
}
```

#### **Location-Level Oversight**
**Roles:** Location Managers, Regional Directors

**Capabilities:**
- View all conversations within assigned location(s)
- Cannot see other locations unless explicitly granted
- Can reassign within their location

**Implementation:**
```typescript
permissions: {
  viewAllMessages: true,
  viewLocations: ['location-1', 'location-2'], // specific location IDs
  viewAuditLogs: true,
  reassignConversations: true,
  manageStaff: false, // can't change permissions
}
```

### Read-Only vs Intervention Capabilities

**Read-Only Oversight**
- View conversations but cannot send messages
- Used for compliance review and quality assurance
- Appropriate for compliance officers who are not clinical staff

**Intervention Oversight**
- Can view AND participate in conversations
- Can take over conversations from staff
- Appropriate for clinical managers handling escalations

```typescript
interface ManagerPermissions {
  viewAllMessages: boolean
  sendMessages: boolean           // Can manager send messages?
  takeOverConversations: boolean  // Can manager reassign to themselves?
  viewInternalNotes: boolean      // Can manager see staff notes about patients?
  flagMessages: boolean           // Can manager flag messages for review?
}
```

### Notification Settings for Managers

Managers should receive alerts for:

```typescript
interface ManagerAlertConfig {
  notifyOnOptOut: boolean           // Patient opts out of messages
  notifyOnComplaint: boolean        // Patient expresses dissatisfaction
  notifyOnLongResponse: boolean     // Staff takes >24hrs to respond
  notifyOnSensitiveKeywords: boolean // Message contains flagged words
  notifyOnHighVolume: boolean       // Unusual message volume from staff
}
```

### Compliance Dashboard

Managers should have access to a compliance dashboard showing:
- Average response times by staff member
- Message volume trends
- Opt-out rates
- Flagged conversations requiring review
- Staff performance metrics

---

## 6. Audit Logging for Compliance

### Legal Requirement

Under HIPAA Security Rule 45 CFR § 164.312(b), covered entities must implement mechanisms to **record and examine activity** in systems containing ePHI. This is non-negotiable for medical spas.

### What Must Be Logged

#### **Message Activity**
```typescript
interface MessageAuditLog {
  id: string
  action: 'MESSAGE_SENT' | 'MESSAGE_RECEIVED' | 'MESSAGE_VIEWED' | 'MESSAGE_DELETED'
  messageId: string
  conversationId: number
  patientId: string
  patientName: string            // Denormalized for reporting
  staffId: string
  staffName: string              // Denormalized for reporting
  staffRole: string
  messageChannel: 'sms' | 'email' | 'web_chat' | 'phone'
  messagePreview?: string        // First 50 chars for context
  timestamp: Date
  ipAddress: string
  deviceInfo?: string
  success: boolean
  errorMessage?: string
  externalMessageId?: string     // Twilio SID, etc.
}
```

#### **Conversation Management**
```typescript
interface ConversationAuditLog {
  id: string
  action: 'CONVERSATION_OPENED' | 'CONVERSATION_CLOSED' | 'CONVERSATION_SNOOZED' |
          'CONVERSATION_REASSIGNED' | 'CONVERSATION_STARRED'
  conversationId: number
  patientId: string
  performedBy: string
  performedByRole: string
  previousValue?: string         // e.g., previous assignee
  newValue?: string              // e.g., new assignee
  reason?: string
  timestamp: Date
}
```

#### **Access Logs**
```typescript
interface AccessAuditLog {
  id: string
  action: 'PATIENT_VIEWED' | 'CONTACT_INFO_VIEWED' | 'MESSAGES_SEARCHED' |
          'EXPORT_PERFORMED' | 'LOGIN' | 'LOGOUT' | 'PERMISSION_CHANGED'
  patientId?: string
  staffId: string
  staffRole: string
  accessLevel: string
  timestamp: Date
  ipAddress: string
  sessionId: string
  locationId: string
  successful: boolean
}
```

#### **Consent & Opt-Out Tracking**
```typescript
interface ConsentAuditLog {
  id: string
  action: 'SMS_CONSENT_GIVEN' | 'SMS_CONSENT_REVOKED' | 'EMAIL_CONSENT_GIVEN' |
          'EMAIL_CONSENT_REVOKED' | 'MARKETING_OPT_IN' | 'MARKETING_OPT_OUT'
  patientId: string
  consentType: 'transactional' | 'marketing' | 'both'
  method: 'in_person' | 'online_form' | 'phone' | 'text_reply' | 'email_reply'
  recordedBy?: string            // Staff member who recorded consent
  ipAddress?: string             // If online consent
  timestamp: Date
  documentUrl?: string           // Link to signed consent form
}
```

### Retention Requirements

**HIPAA Requirement:** Audit logs must be retained for **6 years** (some states require longer).

**Implementation:**
```typescript
interface AuditRetentionPolicy {
  retentionPeriodYears: 6
  archiveAfterMonths: 12          // Move to cold storage after 1 year
  deleteAfterYears: 7             // Delete after 7 years (exceeds requirement)
  backupFrequency: 'daily'
  backupRetention: '90 days'
  encryptionRequired: true
}
```

### Audit Log Review Process

**Weekly Review:**
- Manager reviews flagged messages
- Compliance officer spot-checks 5% of conversations

**Monthly Review:**
- Full audit of staff with high message volume
- Review all opt-outs and complaints

**Quarterly Review:**
- Compliance audit of all access logs
- Review permission changes and policy violations

### Tamper-Proof Logging

Audit logs must be **immutable** (cannot be edited or deleted):

```typescript
// Use append-only logging
const logAuditEvent = async (event: AuditLog) => {
  // Hash previous log entry
  const previousHash = await getLastLogHash()

  // Create new log entry with chain
  const logEntry = {
    ...event,
    id: generateUUID(),
    previousLogHash: previousHash,
    hash: hashEntry(event, previousHash),
  }

  // Write to append-only database
  await appendOnlyDB.insert(logEntry)

  // Also write to immutable cloud storage (S3 with versioning)
  await s3.putObject({
    Bucket: 'audit-logs',
    Key: `${event.timestamp.toISOString()}-${logEntry.id}.json`,
    Body: JSON.stringify(logEntry),
    Metadata: { 'x-amz-server-side-encryption': 'AES256' }
  })
}
```

### Penalties for Non-Compliance

Failing to maintain proper audit logs can result in HIPAA fines:
- **Tier 1:** $100 - $50,000 per violation (unknowing)
- **Tier 2:** $1,000 - $50,000 per violation (reasonable cause)
- **Tier 3:** $10,000 - $50,000 per violation (willful neglect, corrected)
- **Tier 4:** $50,000 per violation (willful neglect, not corrected)

---

## 7. Permission Templates by Role

### Pre-Configured Role Templates

Based on industry best practices and HIPAA compliance, here are recommended permission templates for each staff role.

#### **Medical Director / Physician**
```typescript
const medicalDirectorPermissions: StaffPermissions = {
  // Calendar
  viewOwnCalendar: true,
  editOwnCalendar: true,
  viewAllCalendars: true,
  editAllCalendars: true,
  manageTimeBlocks: true,
  manageWaitlist: true,

  // Client
  viewClientContactDetails: true,
  viewClientHistory: true,
  editClientRecords: true,

  // Sales
  viewOwnSales: true,
  viewAllSales: true,
  processCheckout: true,
  processRefunds: true,
  reopenSales: true,
  accessCashDrawer: false, // typically no

  // Messages (FULL ACCESS)
  viewOwnMessages: true,
  viewAllMessages: true,      // ✅ See all conversations
  sendMessages: true,

  // Reporting
  viewReports: true,
  exportReports: true,

  // Inventory
  manageProducts: true,
  managePurchaseOrders: true,

  // Gift Cards & Memberships
  manageGiftCards: true,
  manageMemberships: true,

  // Administrative (FULL ACCESS)
  manageStaff: true,
  manageServices: true,
  manageSettings: true,
  accessBilling: true,

  // Time
  useTimeClock: false,
  manageTimeCards: true,

  // Forms
  viewFormSubmissions: true,
  viewAllFormSubmissions: true,
  manageFormTemplates: true,
}
```

#### **Nurse Practitioner (NP)**
```typescript
const nursePractitionerPermissions: StaffPermissions = {
  // Calendar
  viewOwnCalendar: true,
  editOwnCalendar: true,
  viewAllCalendars: true,      // Can see other providers for coordination
  editAllCalendars: false,     // Cannot edit other providers
  manageTimeBlocks: false,
  manageWaitlist: true,

  // Client
  viewClientContactDetails: true, // For their patients
  viewClientHistory: true,
  editClientRecords: true,     // Clinical notes, charting

  // Sales
  viewOwnSales: true,
  viewAllSales: false,
  processCheckout: true,
  processRefunds: false,
  reopenSales: false,
  accessCashDrawer: false,

  // Messages (OWN PATIENTS ONLY)
  viewOwnMessages: true,       // ✅ See own patient conversations
  viewAllMessages: false,      // ❌ Cannot see other provider conversations
  sendMessages: true,

  // Reporting
  viewReports: true,           // Own performance only
  exportReports: false,

  // Inventory
  manageProducts: false,
  managePurchaseOrders: false,

  // Gift Cards & Memberships
  manageGiftCards: false,
  manageMemberships: false,

  // Administrative
  manageStaff: false,
  manageServices: false,
  manageSettings: false,
  accessBilling: false,

  // Time
  useTimeClock: true,
  manageTimeCards: false,

  // Forms
  viewFormSubmissions: true,   // For their patients
  viewAllFormSubmissions: false,
  manageFormTemplates: false,
}
```

#### **Registered Nurse (RN)**
```typescript
const registeredNursePermissions: StaffPermissions = {
  // Calendar
  viewOwnCalendar: true,
  editOwnCalendar: true,
  viewAllCalendars: true,
  editAllCalendars: false,
  manageTimeBlocks: false,
  manageWaitlist: true,

  // Client
  viewClientContactDetails: true, // For their patients
  viewClientHistory: true,
  editClientRecords: true,        // Clinical documentation

  // Sales
  viewOwnSales: true,
  viewAllSales: false,
  processCheckout: true,
  processRefunds: false,
  reopenSales: false,
  accessCashDrawer: false,

  // Messages (OWN PATIENTS ONLY)
  viewOwnMessages: true,
  viewAllMessages: false,
  sendMessages: true,

  // Reporting
  viewReports: false,
  exportReports: false,

  // Inventory
  manageProducts: false,
  managePurchaseOrders: false,

  // Gift Cards & Memberships
  manageGiftCards: false,
  manageMemberships: false,

  // Administrative
  manageStaff: false,
  manageServices: false,
  manageSettings: false,
  accessBilling: false,

  // Time
  useTimeClock: true,
  manageTimeCards: false,

  // Forms
  viewFormSubmissions: true,
  viewAllFormSubmissions: false,
  manageFormTemplates: false,
}
```

#### **Aesthetician**
```typescript
const aestheticianPermissions: StaffPermissions = {
  // Calendar
  viewOwnCalendar: true,
  editOwnCalendar: true,
  viewAllCalendars: false,        // Limited coordination needs
  editAllCalendars: false,
  manageTimeBlocks: false,
  manageWaitlist: false,

  // Client
  viewClientContactDetails: true,  // Masked for non-assigned patients
  viewClientHistory: true,         // Treatment history only
  editClientRecords: false,        // Cannot edit clinical records

  // Sales
  viewOwnSales: true,
  viewAllSales: false,
  processCheckout: true,           // Retail sales
  processRefunds: false,
  reopenSales: false,
  accessCashDrawer: false,

  // Messages (VERY LIMITED)
  viewOwnMessages: true,           // Only for their scheduled patients
  viewAllMessages: false,
  sendMessages: false,             // ❌ Template-only in production

  // Reporting
  viewReports: false,
  exportReports: false,

  // Inventory
  manageProducts: false,
  managePurchaseOrders: false,

  // Gift Cards & Memberships
  manageGiftCards: false,
  manageMemberships: false,

  // Administrative
  manageStaff: false,
  manageServices: false,
  manageSettings: false,
  accessBilling: false,

  // Time
  useTimeClock: true,
  manageTimeCards: false,

  // Forms
  viewFormSubmissions: true,       // For their clients
  viewAllFormSubmissions: false,
  manageFormTemplates: false,
}
```

#### **Front Desk / Receptionist**
```typescript
const frontDeskPermissions: StaffPermissions = {
  // Calendar
  viewOwnCalendar: false,
  editOwnCalendar: false,
  viewAllCalendars: true,          // ✅ Need to see availability for booking
  editAllCalendars: true,          // ✅ Book appointments for all providers
  manageTimeBlocks: false,
  manageWaitlist: true,

  // Client (CONTACT INFO MASKED)
  viewClientContactDetails: false,  // ❌ Masked phone/email
  viewClientHistory: false,         // ❌ No clinical history
  editClientRecords: false,

  // Sales
  viewOwnSales: false,
  viewAllSales: false,
  processCheckout: true,            // Check-out transactions
  processRefunds: false,
  reopenSales: false,
  accessCashDrawer: true,

  // Messages (TEMPLATE-ONLY)
  viewOwnMessages: false,
  viewAllMessages: false,           // ❌ No conversation access
  sendMessages: false,              // ⚠️ Template-only if enabled

  // Reporting
  viewReports: false,
  exportReports: false,

  // Inventory
  manageProducts: false,
  managePurchaseOrders: false,

  // Gift Cards & Memberships
  manageGiftCards: true,            // Sell gift cards
  manageMemberships: false,

  // Administrative
  manageStaff: false,
  manageServices: false,
  manageSettings: false,
  accessBilling: false,

  // Time
  useTimeClock: true,
  manageTimeCards: false,

  // Forms
  viewFormSubmissions: false,
  viewAllFormSubmissions: false,
  manageFormTemplates: false,
}
```

#### **Office Manager**
```typescript
const officeManagerPermissions: StaffPermissions = {
  // Calendar
  viewOwnCalendar: true,
  editOwnCalendar: true,
  viewAllCalendars: true,
  editAllCalendars: true,
  manageTimeBlocks: true,
  manageWaitlist: true,

  // Client
  viewClientContactDetails: true,
  viewClientHistory: true,
  editClientRecords: false,         // Cannot edit clinical records

  // Sales
  viewOwnSales: true,
  viewAllSales: true,               // ✅ Oversight
  processCheckout: true,
  processRefunds: true,
  reopenSales: true,
  accessCashDrawer: true,

  // Messages (FULL OVERSIGHT)
  viewOwnMessages: true,
  viewAllMessages: true,            // ✅ Manager oversight
  sendMessages: true,

  // Reporting
  viewReports: true,
  exportReports: true,

  // Inventory
  manageProducts: true,
  managePurchaseOrders: true,

  // Gift Cards & Memberships
  manageGiftCards: true,
  manageMemberships: true,

  // Administrative
  manageStaff: true,
  manageServices: true,
  manageSettings: false,            // Not system settings
  accessBilling: true,

  // Time
  useTimeClock: true,
  manageTimeCards: true,

  // Forms
  viewFormSubmissions: true,
  viewAllFormSubmissions: true,
  manageFormTemplates: true,
}
```

#### **Billing Specialist**
```typescript
const billingSpecialistPermissions: StaffPermissions = {
  // Calendar
  viewOwnCalendar: false,
  editOwnCalendar: false,
  viewAllCalendars: false,
  editAllCalendars: false,
  manageTimeBlocks: false,
  manageWaitlist: false,

  // Client
  viewClientContactDetails: true,   // ✅ Need to contact for payments
  viewClientHistory: false,         // ❌ No clinical history needed
  editClientRecords: false,

  // Sales
  viewOwnSales: false,
  viewAllSales: true,               // ✅ View all transactions
  processCheckout: true,
  processRefunds: true,
  reopenSales: true,
  accessCashDrawer: true,

  // Messages (BILLING ONLY)
  viewOwnMessages: false,
  viewAllMessages: false,           // ❌ No general conversations
  sendMessages: true,               // ⚠️ Billing-related only (template)

  // Reporting
  viewReports: true,                // Financial reports only
  exportReports: true,

  // Inventory
  manageProducts: false,
  managePurchaseOrders: false,

  // Gift Cards & Memberships
  manageGiftCards: true,
  manageMemberships: true,

  // Administrative
  manageStaff: false,
  manageServices: false,
  manageSettings: false,
  accessBilling: true,

  // Time
  useTimeClock: true,
  manageTimeCards: false,

  // Forms
  viewFormSubmissions: false,
  viewAllFormSubmissions: false,
  manageFormTemplates: false,
}
```

#### **Marketing Coordinator**
```typescript
const marketingCoordinatorPermissions: StaffPermissions = {
  // Calendar
  viewOwnCalendar: false,
  editOwnCalendar: false,
  viewAllCalendars: false,
  editAllCalendars: false,
  manageTimeBlocks: false,
  manageWaitlist: false,

  // Client (ANONYMIZED DATA ONLY)
  viewClientContactDetails: false,  // ❌ No PII access
  viewClientHistory: false,
  editClientRecords: false,

  // Sales
  viewOwnSales: false,
  viewAllSales: false,              // ❌ No sales data access
  processCheckout: false,
  processRefunds: false,
  reopenSales: false,
  accessCashDrawer: false,

  // Messages (NO ACCESS)
  viewOwnMessages: false,
  viewAllMessages: false,           // ❌ No message access
  sendMessages: false,              // ❌ Campaigns handled separately

  // Reporting (ANONYMIZED ONLY)
  viewReports: true,                // Anonymized analytics only
  exportReports: false,

  // Inventory
  manageProducts: false,
  managePurchaseOrders: false,

  // Gift Cards & Memberships
  manageGiftCards: false,
  manageMemberships: false,

  // Administrative
  manageStaff: false,
  manageServices: false,
  manageSettings: false,
  accessBilling: false,

  // Time
  useTimeClock: true,
  manageTimeCards: false,

  // Forms
  viewFormSubmissions: false,
  viewAllFormSubmissions: false,
  manageFormTemplates: false,
}
```

### Custom Permission Adjustments

While role templates provide a starting point, some med spas may need custom adjustments:

```typescript
interface CustomPermissionOverride {
  staffId: string
  permissionKey: keyof StaffPermissions
  customValue: boolean
  reason: string
  approvedBy: string
  approvedAt: Date
  expiresAt?: Date  // Temporary override
}

// Example: Give specific aesthetician messaging access
const customOverride: CustomPermissionOverride = {
  staffId: 'staff-123',
  permissionKey: 'sendMessages',
  customValue: true,
  reason: 'Senior aesthetician handles follow-up communications',
  approvedBy: 'medical-director-456',
  approvedAt: new Date('2026-01-01'),
  expiresAt: undefined, // Permanent
}
```

---

## 8. Multi-Location Permission Considerations

### Location-Based Access Control

Medical spas with multiple locations require **location-scoped permissions** to maintain privacy and operational boundaries.

### Permission Layers

#### **Single Location Access**
Most staff should only access data from their primary location:

```typescript
interface StaffMember {
  id: string
  primaryLocation: string       // 'location-downtown'
  locations: string[]           // ['location-downtown'] - single location
  permissions: StaffPermissions
}

// Filter conversations by location
const getVisibleConversations = (staff: StaffMember) => {
  return conversations.filter(conv =>
    staff.permissions.viewAllLocations ||
    staff.locations.includes(conv.patient.primaryLocation)
  )
}
```

**Applies to:**
- Front Desk Staff
- Aestheticians
- Laser Technicians
- Injection Specialists

#### **Multi-Location Access**
Some roles need access across locations:

```typescript
interface StaffMember {
  id: string
  primaryLocation: string       // 'location-downtown'
  locations: string[]           // ['location-downtown', 'location-uptown']
  permissions: StaffPermissions
}
```

**Applies to:**
- Traveling Nurse Practitioners
- Regional Managers
- Billing Specialists (handling all locations)

#### **All-Location Access**
Top-level roles see all locations:

```typescript
interface StaffMember {
  id: string
  primaryLocation: string
  locations: string[]           // All location IDs
  permissions: {
    ...basePermissions,
    viewAllLocations: true      // ✅ Special flag
  }
}
```

**Applies to:**
- Medical Director
- Account Owner
- Corporate Compliance Officer

### Location Switching

Staff with multi-location access should explicitly switch locations:

```typescript
interface LocationContext {
  currentLocationId: string
  availableLocations: Location[]
  switchLocation: (locationId: string) => void
}

// UI Component
const LocationSwitcher = () => {
  const { currentLocationId, availableLocations, switchLocation } = useLocationContext()

  return (
    <select
      value={currentLocationId}
      onChange={(e) => switchLocation(e.target.value)}
    >
      {availableLocations.map(loc => (
        <option key={loc.id} value={loc.id}>{loc.name}</option>
      ))}
    </select>
  )
}
```

### Cross-Location Communication

**Scenario:** A patient scheduled at Location A messages the clinic, but their primary provider is at Location B.

**Solution: Smart Routing**

```typescript
const routeMessage = async (incomingMessage: Message) => {
  const patient = await getPatient(incomingMessage.patientId)

  // 1. Find primary provider
  const primaryProvider = await getStaffMember(patient.primaryProviderId)

  // 2. Check if they're working today
  const isWorkingToday = await checkProviderSchedule(primaryProvider.id, new Date())

  // 3. Route appropriately
  if (isWorkingToday) {
    // Route to primary provider regardless of location
    return assignConversation(incomingMessage.conversationId, primaryProvider.id)
  } else {
    // Route to on-duty provider at patient's location
    const onDutyProvider = await getOnDutyProvider(patient.primaryLocation)
    return assignConversation(incomingMessage.conversationId, onDutyProvider.id)
  }
}
```

### Location-Specific Audit Logging

Track which location staff accessed data from:

```typescript
interface LocationAccessLog {
  staffId: string
  staffLocation: string         // Staff's primary location
  accessedLocation: string      // Location they accessed data from
  accessedAt: Date
  reason?: string
}

// Log when staff views data from another location
if (staff.primaryLocation !== patient.primaryLocation) {
  await logLocationAccess({
    staffId: staff.id,
    staffLocation: staff.primaryLocation,
    accessedLocation: patient.primaryLocation,
    accessedAt: new Date(),
  })
}
```

### Multi-Location Reporting

Location managers should only see reports for their locations:

```typescript
const getReportData = (staff: StaffMember, reportType: string) => {
  // Filter data by location access
  const accessibleLocations = staff.permissions.viewAllLocations
    ? allLocations
    : staff.locations

  return fetchReportData(reportType, { locations: accessibleLocations })
}
```

---

## 9. HIPAA Minimum Necessary Principle

### What is the Minimum Necessary Principle?

Under HIPAA, covered entities must make **reasonable efforts to ensure uses and disclosures of PHI are limited to the minimum necessary** to accomplish the intended purpose. This applies to **all formats:** electronic, written, and oral PHI.

### Application to Messaging Permissions

#### **Core Principle**
**Staff should only access the patient communications they need to do their job—nothing more.**

**Example Violations:**
- ❌ Front desk viewing clinical messages between provider and patient
- ❌ Billing specialist reading unrelated patient conversations
- ❌ Marketing coordinator accessing patient contact information

**Compliant Practices:**
- ✅ Provider seeing only their assigned patients' messages
- ✅ Office manager viewing all messages for oversight (legitimate business need)
- ✅ Billing specialist sending payment reminders via platform (no direct contact access)

### Implementing Minimum Necessary in Code

#### **Role-Based Filtering**

```typescript
const getMinimumNecessaryConversations = (staff: StaffMember) => {
  const { role, permissions, id: staffId, locations } = staff

  // Medical Director / Office Manager: All conversations (oversight)
  if (permissions.viewAllMessages) {
    return allConversations
  }

  // Provider: Own patients only
  if (permissions.viewOwnMessages && !permissions.viewAllMessages) {
    return conversations.filter(conv =>
      conv.patient.primaryProviderId === staffId ||
      conv.assignedTo?.id === staffId
    )
  }

  // Front Desk: Location-specific, no message content
  if (role === 'Front Desk') {
    return conversations
      .filter(conv => locations.includes(conv.patient.primaryLocation))
      .map(conv => ({
        ...conv,
        messages: [], // Hide message content
        lastMessage: '*** Restricted ***',
      }))
  }

  // Default: No access
  return []
}
```

#### **Field-Level Redaction**

Even when staff can see a conversation, they may not need all fields:

```typescript
const applyMinimumNecessaryRedaction = (
  conversation: Conversation,
  staff: StaffMember
): Conversation => {

  const redacted = { ...conversation }

  // Mask contact info for non-clinical staff
  if (!staff.permissions.viewClientContactDetails) {
    redacted.patient.phone = maskPhoneNumber(redacted.patient.phone)
    redacted.patient.email = maskEmail(redacted.patient.email)
  }

  // Hide clinical notes for billing staff
  if (staff.role === 'Billing Specialist') {
    redacted.patient.notes = redacted.patient.notes.filter(
      note => note.category === 'billing' || note.category === 'financial'
    )
  }

  // Hide sensitive medical history for front desk
  if (staff.role === 'Front Desk') {
    delete redacted.patient.medicalHistory
    delete redacted.patient.medications
    delete redacted.patient.allergies
  }

  return redacted
}
```

### Documentation Requirements

To demonstrate HIPAA compliance, document:

1. **Role-Permission Mapping:** Written policies defining what each role can access
2. **Business Justification:** Why each permission is necessary for job function
3. **Access Requests:** Approval workflow for permission changes
4. **Regular Reviews:** Quarterly audits of staff permissions

```typescript
interface PermissionJustification {
  role: StaffRole
  permission: keyof StaffPermissions
  businessNeed: string
  approvedBy: string
  approvedDate: Date
  lastReviewed: Date
  nextReviewDue: Date
}

// Example justification
const justification: PermissionJustification = {
  role: 'Billing Specialist',
  permission: 'viewClientContactDetails',
  businessNeed: 'Must contact patients for outstanding balances and payment arrangements',
  approvedBy: 'Medical Director',
  approvedDate: new Date('2026-01-01'),
  lastReviewed: new Date('2026-01-01'),
  nextReviewDue: new Date('2026-04-01'), // 90 days
}
```

### Exceptions to Minimum Necessary

HIPAA **does not require minimum necessary** in these situations:
- **Disclosures to healthcare providers for treatment purposes** (provider-to-provider)
- **Disclosures to the patient** (or their personal representative)
- **Uses or disclosures made pursuant to an authorization**
- **Disclosures to HHS for compliance investigations**
- **Uses or disclosures required by law**

This means:
- ✅ Nurse can share full patient history with consulting physician (treatment)
- ✅ Staff can send patient their full message history (disclosure to patient)
- ✅ All PHI can be shared with HIPAA auditors (compliance investigation)

---

## 10. Implementation Checklist

Use this checklist to implement messaging permissions in your platform:

### Phase 1: Database Schema & Types

- [ ] Add `StaffPermissions` interface with messaging fields
- [ ] Add `primaryProviderId` to Patient table
- [ ] Add `assignedTo` field to Conversation table
- [ ] Create `AuditLog` table with indexes on timestamp and staffId
- [ ] Create `ConsentLog` table for opt-in/opt-out tracking
- [ ] Add `locations` array to StaffMember table

### Phase 2: Permission System

- [ ] Create permission checking utility functions
- [ ] Implement role-based permission templates (7 roles minimum)
- [ ] Create permission override system for custom access
- [ ] Build permission UI in staff management settings
- [ ] Add permission validation middleware for API routes

### Phase 3: Conversation Access Control

- [ ] Implement `viewOwnMessages` filtering
- [ ] Implement `viewAllMessages` manager access
- [ ] Implement location-based filtering
- [ ] Add conversation assignment/reassignment logic
- [ ] Create "Take Over Conversation" feature for managers

### Phase 4: Contact Information Masking

- [ ] Create phone number masking function
- [ ] Create email masking function
- [ ] Update patient detail views with masked fields
- [ ] Add "View Full Contact" button with audit logging
- [ ] Implement in-platform messaging (no direct contact exposure)

### Phase 5: Audit Logging

- [ ] Log all message sends
- [ ] Log all message views
- [ ] Log conversation opens/closes
- [ ] Log contact info access
- [ ] Log permission changes
- [ ] Log opt-in/opt-out events
- [ ] Create tamper-proof log storage
- [ ] Implement 6-year retention policy

### Phase 6: UI Updates

- [ ] Add conversation filtering by assignment
- [ ] Add "Assigned to me" vs "All" toggle
- [ ] Show visual indicators for assigned conversations
- [ ] Add location switcher for multi-location staff
- [ ] Create manager oversight dashboard
- [ ] Add quick filters (unread, starred, by channel)

### Phase 7: Manager Oversight

- [ ] Create manager dashboard showing all conversations
- [ ] Add flag/report message feature
- [ ] Build conversation reassignment UI
- [ ] Create compliance report exports
- [ ] Add staff performance metrics

### Phase 8: Multi-Location Support

- [ ] Add location-based conversation filtering
- [ ] Implement cross-location message routing
- [ ] Create location switcher UI
- [ ] Add location-specific audit logs
- [ ] Build location access request workflow

### Phase 9: Testing & Compliance

- [ ] Unit tests for permission checking
- [ ] Integration tests for access control
- [ ] Audit log verification tests
- [ ] HIPAA compliance review
- [ ] Penetration testing
- [ ] User acceptance testing with staff

### Phase 10: Documentation & Training

- [ ] Document permission system for developers
- [ ] Create admin guide for managing permissions
- [ ] Train staff on new permission model
- [ ] Document audit log retention policy
- [ ] Create incident response plan

---

## 11. Security Updates for 2026

### Upcoming HIPAA Security Rule Changes

#### **Mandatory Encryption (Proposed 2026)**
The proposed HIPAA Security Rule update (published January 6, 2025) signals:
- **Mandatory encryption of ePHI in transit and at rest** (currently "addressable")
- **Mandatory multi-factor authentication (MFA)** for critical systems and remote access
- **Up-to-date asset inventories and network diagrams** showing where ePHI lives
- **Regular vulnerability scanning** and at least annual penetration tests
- **Annual Security Rule compliance audits** as part of HIPAA audit readiness

**Implementation:**
```typescript
// Enforce MFA for all staff logins
const requireMFA = (user: StaffMember): boolean => {
  return user.permissions.viewClientContactDetails ||
         user.permissions.viewAllMessages ||
         user.role === 'Medical Director' ||
         user.role === 'Office Manager'
}

// Encrypt all message data at rest
const encryptMessageContent = (message: string): string => {
  return crypto.encrypt(message, process.env.ENCRYPTION_KEY, {
    algorithm: 'aes-256-gcm',
    keyDerivation: 'pbkdf2',
  })
}
```

#### **Essential HPH Cybersecurity Performance Goals**
New proposed rules set minimum cybersecurity safeguards including:
- Email system controls
- Multi-factor authentication
- Encryption for all ePHI
- Workforce training programs

**Text messaging via SMS without encryption will be a HIPAA violation** unless:
- Recipient specifically requested SMS
- Recipient was warned of risks
- Consent is documented

**Compliant alternatives:**
- MS Teams (with BAA)
- Slack Healthcare (with BAA)
- Dedicated HIPAA-compliant SMS platforms (Twilio, etc. with BAA)

### New Privacy Rule Updates (Effective Feb 16, 2026)

**Reproductive Health Care Privacy:**
Compliance date for new Notice of Privacy Practices requirements related to reproductive health care is **February 16, 2026**.

**Patient Consent Preferences:**
Patient consent preferences must be shared with all involved parties when required by law, and must honor a patient's right to request restrictions on disclosures.

**Implementation:**
```typescript
interface PatientPrivacyPreferences {
  restrictedDisclosures: string[]   // Types of info patient restricts
  restrictedRecipients: string[]    // Staff/entities that cannot access
  reproductiveHealthRestrictions: boolean
  effectiveDate: Date
  consentFormUrl: string
}

const checkDisclosureRestriction = (
  patient: Patient,
  staff: StaffMember,
  messageType: string
): boolean => {
  if (patient.privacyPreferences?.restrictedDisclosures.includes(messageType)) {
    // Check if this staff member is restricted
    return !patient.privacyPreferences.restrictedRecipients.includes(staff.id)
  }
  return true // No restriction
}
```

### CMS Interoperability Requirements (2026-2027)

**Patient Access APIs:**
Starting January 1, 2026, healthcare organizations must provide patients secure access to their data through modern identity solutions—**without needing usernames and passwords for each website**.

**Impact on Med Spas:**
Med spas may need to provide patient portals with:
- Appointment history access
- Message history access
- Treatment records access
- Billing statements access

**Provider Directory Integration:**
Providers using identity-verified credentials (IAL2/AAL2) and validated in the CMS National Provider Directory get preferential access to patient data across networks.

### 2026 Implementation Requirements

- [ ] **Enable mandatory MFA** for all staff with messaging access
- [ ] **Audit encryption status** of all ePHI storage and transmission
- [ ] **Update Business Associate Agreements (BAAs)** with messaging vendors
- [ ] **Discontinue unencrypted SMS** or document patient consent
- [ ] **Implement patient consent preference tracking** system
- [ ] **Review Notice of Privacy Practices** for reproductive health updates
- [ ] **Conduct annual penetration testing**
- [ ] **Update asset inventory** with all systems containing ePHI
- [ ] **Review network diagrams** showing ePHI data flows
- [ ] **Schedule quarterly vulnerability scans**

---

## Recommended Implementation Priority

### Immediate (Q1 2026)
1. Implement basic role-based permissions (viewOwnMessages vs viewAllMessages)
2. Enable audit logging for all message sends
3. Add MFA for clinical staff
4. Document current permission policies

### Short-Term (Q2 2026)
5. Implement contact info masking
6. Add conversation assignment to providers
7. Build manager oversight dashboard
8. Complete HIPAA Security Rule compliance audit

### Medium-Term (Q3 2026)
9. Multi-location permission boundaries
10. Advanced audit log analytics
11. Custom permission overrides
12. Staff performance metrics

### Long-Term (Q4 2026)
13. Patient consent preference tracking
14. Automated compliance reporting
15. AI-powered message flagging for review
16. Integration with CMS provider directory

---

## References & Resources

### HIPAA Compliance
- [HIPAA Compliance for Med Spas: Protecting Patient Information](https://www.weitzmorgan.com/post/hipaa-compliance-for-med-spas-protecting-patient-information)
- [HIPAA Compliance for Medical Spas: What You Need to Know](https://djholtlaw.com/hipaa-compliance-for-medical-spas-what-you-need-to-know/)
- [New HIPAA Regulations in 2026](https://www.hipaajournal.com/new-hipaa-regulations/)
- [HIPAA FAQs: Navigating HIPAA Compliance in Your Medical Spa](https://americanmedspa.org/blog/hipaa-faqs-navigating-hipaa-compliance-in-your-medical-spa)
- [HIPAA Compliance Checklist for Medical Spas](https://pabau.com/blog/hipaa-compliance-for-medical-spas/)

### Minimum Necessary Principle
- [The HIPAA Minimum Necessary Rule Standard - Updated for 2025](https://www.hipaajournal.com/ahima-hipaa-minimum-necessary-standard-3481/)
- [Minimum Necessary Requirement | HHS.gov](https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/minimum-necessary-requirement/index.html)
- [What Is the HIPAA Minimum Necessary Rule? + How to Comply](https://secureframe.com/hub/hipaa/minimum-necessary-rule)

### Audit Logging
- [What Are HIPAA Audit Trail and Audit Log Requirements?](https://compliancy-group.com/hipaa-audit-log-requirements/)
- [HIPAA Audit Logs: Complete Requirements for Healthcare Compliance in 2025](https://www.kiteworks.com/hipaa-compliance/hipaa-audit-log-requirements/)
- [HIPAA Audit Log Requirements: What Healthcare Professionals Need to Know](https://www.chartrequest.com/articles/hipaa-audit-log-requirements)

### CMS Interoperability
- [CMS Interoperability and Prior Authorization Final Rule](https://www.cms.gov/cms-interoperability-and-prior-authorization-final-rule-cms-0057-f)
- [HIPAA Compliance 2026: PHI Security & Patient Trust](https://cookie-script.com/privacy-laws/hipaa-guide-2026)
- [Healthcare Regulations 2026: What's Changing for Data Sharing and Privacy](https://xtalks.com/healthcare-regulations-2026-whats-changing-for-data-sharing-and-privacy-4550/)

### Multi-Location Management
- [HIPAA Compliant Online Forms for Multi-Location Practices](https://formdr.com/hipaa-compliant-forms-for-multi-location-practices/)
- [Identity and Access Management in Healthcare Guide 2026](https://appinventiv.com/blog/identity-and-access-management-in-healthcare/)
- [Multi Location Management](https://securiteam.us/services/multi-location-management/)

### Medical Spa Software
- [Best Medical Spa Software 2026 | Capterra](https://www.capterra.com/medical-spa-software/)
- [Best Med Spa Management Software (2025)](https://www.portraitcare.com/post/7-best-med-spa-management-software)
- [Best HIPAA-Compliant Medical Spa Software | Mangomint](https://www.mangomint.com/solutions/medical-spa-software/)
- [Top 7 Medical Spa Software Platforms in 2025 (Compared for HIPAA, CRM, and Booking)](https://workee.net/blog/best-medical-spa-software)

### Role-Based Access Control
- [Whose Patient Is This? A Scoping Review of Patient Ownership](https://journals.lww.com/academicmedicine/fulltext/2019/11001/whose_patient_is_this__a_scoping_review_of_patient.21.aspx)
- [Medical Practice Ownership and Profit Allocation Models Explained](https://www.jmco.com/articles/healthcare/medical-practices-partnership-models/)

---

## Document Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-09 | Claude Opus 4.5 | Initial research compilation |

---

## Appendix A: Existing Platform Schema

### Current Staff Permissions (from `/src/types/staff.ts`)

```typescript
export interface StaffPermissions {
  // Calendar permissions
  viewOwnCalendar: boolean
  editOwnCalendar: boolean
  viewAllCalendars: boolean
  editAllCalendars: boolean
  manageTimeBlocks: boolean
  manageWaitlist: boolean

  // Client permissions
  viewClientContactDetails: boolean
  viewClientHistory: boolean
  editClientRecords: boolean

  // Sales permissions
  viewOwnSales: boolean
  viewAllSales: boolean
  processCheckout: boolean
  processRefunds: boolean
  reopenSales: boolean
  accessCashDrawer: boolean

  // Messages permissions
  viewOwnMessages: boolean
  viewAllMessages: boolean
  sendMessages: boolean

  // Reporting
  viewReports: boolean
  exportReports: boolean

  // Products & inventory
  manageProducts: boolean
  managePurchaseOrders: boolean

  // Gift cards & memberships
  manageGiftCards: boolean
  manageMemberships: boolean

  // Administrative
  manageStaff: boolean
  manageServices: boolean
  manageSettings: boolean
  accessBilling: boolean

  // Time clock
  useTimeClock: boolean
  manageTimeCards: boolean

  // Forms
  viewFormSubmissions: boolean
  viewAllFormSubmissions: boolean
  manageFormTemplates: boolean
}
```

### Current Conversation Schema (from `/src/types/messaging.ts`)

```typescript
export interface Conversation {
  id: number
  patient: MessagingPatient
  status: ConversationStatus
  channel: MessageChannel
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  starred: boolean
  snoozedUntil?: Date
  assignedTo?: StaffMember  // ✅ Already exists
  tags: string[]
  messages: Message[]
}
```

### Recommended Schema Additions

```typescript
// Add to Conversation interface
export interface Conversation {
  // ... existing fields ...
  primaryProvider?: StaffMember     // Patient's primary provider (from patient record)
  sharedWith?: StaffMember[]        // Additional staff with temporary access
  ownershipHistory?: OwnershipTransfer[]
  locationId: string                // Location this conversation belongs to
}

// Add to StaffPermissions interface
export interface StaffPermissions {
  // ... existing fields ...
  viewAllLocations: boolean         // Can view data from all locations
  viewLocationMessages: boolean     // Can view location-specific messages
  takeOverConversations: boolean    // Can reassign conversations to self
  viewAuditLogs: boolean            // Can view audit trails
}
```

---

## Appendix B: Sample Audit Log Queries

### Find all messages sent by a specific staff member
```sql
SELECT * FROM audit_logs
WHERE action = 'MESSAGE_SENT'
  AND staff_id = 'staff-123'
  AND timestamp >= NOW() - INTERVAL '30 days'
ORDER BY timestamp DESC;
```

### Find all contact info views in last week
```sql
SELECT * FROM audit_logs
WHERE action = 'CONTACT_INFO_VIEWED'
  AND timestamp >= NOW() - INTERVAL '7 days'
ORDER BY timestamp DESC;
```

### Find unauthorized access attempts
```sql
SELECT * FROM audit_logs
WHERE successful = false
  AND action IN ('PATIENT_VIEWED', 'MESSAGE_VIEWED', 'CONTACT_INFO_VIEWED')
ORDER BY timestamp DESC;
```

### Generate staff response time report
```sql
SELECT
  staff_id,
  staff_name,
  COUNT(*) as messages_sent,
  AVG(EXTRACT(EPOCH FROM (sent_timestamp - received_timestamp))/60) as avg_response_time_minutes
FROM audit_logs
WHERE action = 'MESSAGE_SENT'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY staff_id, staff_name
ORDER BY avg_response_time_minutes ASC;
```

---

**End of Document**
