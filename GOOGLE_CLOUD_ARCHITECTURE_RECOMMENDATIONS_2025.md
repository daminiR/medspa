# Google Cloud Architecture Recommendations for HIPAA-Compliant Medical Spa Platform (2025)

**Last Updated:** December 23, 2025
**Target Scale:** 10-50 locations, 1,000-10,000 daily active patients
**Compliance Requirement:** HIPAA-compliant

---

## Executive Summary

This document provides comprehensive Google Cloud Platform (GCP) architecture recommendations for a medical spa platform requiring HIPAA compliance, real-time capabilities, and scalability for multi-location operations. All recommendations are based on 2025 best practices and current GCP capabilities.

### Key Architecture Decisions

1. **Compute:** Cloud Run (primary) + GKE (for complex stateful workloads)
2. **Primary Database:** Cloud SQL PostgreSQL with read replicas
3. **Real-time:** Firestore + Cloud Pub/Sub
4. **Analytics:** BigQuery with CMEK encryption
5. **Messaging:** Firebase Cloud Messaging (FCM)
6. **Security:** VPC Service Controls + Cloud Armor + Secret Manager

---

## 1. Compute & Hosting

### Recommended: Cloud Run (Primary) + GKE (Secondary)

#### Cloud Run for Most Services (RECOMMENDED)

**Use Cases:**
- REST APIs for appointments, patient management, billing
- Webhook handlers (Twilio, Stripe, etc.)
- Serverless functions for event-driven workflows
- Patient portal and admin dashboard backends

**Why Cloud Run:**
- ✅ **HIPAA Compliant:** Covered under Google Cloud BAA
- ✅ **Cost Effective:** Pay only for actual usage, scale to zero when idle
- ✅ **Auto-scaling:** Handles traffic spikes automatically (appointment rushes)
- ✅ **Simple Operations:** No cluster management, minimal DevOps overhead
- ✅ **Fast Deployment:** Built on Knative, portable to other clouds
- ✅ **Stateless Design:** Perfect for API-first architecture

**Configuration for Medical Spa:**
```yaml
Service: admin-api
Concurrency: 80 requests per container
Min Instances: 2 (for fast cold starts during business hours)
Max Instances: 100 (handles peak load)
CPU: 2 vCPU
Memory: 4GB
Timeout: 60s (appointment booking can be complex)
VPC Connector: Enabled (for Cloud SQL private IP)
```

**Cost Estimate (per location):**
- Low traffic hours (nights/weekends): ~$50/month (scaled to minimum)
- Business hours (10 locations): ~$500-800/month
- Total estimated: **$300-500/month for 10-50 locations**

---

#### GKE Autopilot for Complex Workloads (SECONDARY)

**Use Cases:**
- Charting application with 3D model rendering
- Long-running background jobs (inventory reconciliation, reports)
- Stateful applications requiring persistent storage
- Custom networking or OS requirements

**Why GKE Autopilot:**
- ✅ **HIPAA Compliant:** Covered under Google Cloud BAA
- ✅ **Kubernetes Power:** Full orchestration capabilities
- ✅ **Reduced Ops:** Autopilot manages nodes, updates, security
- ✅ **Multi-tenant Isolation:** Namespace-level isolation between locations
- ✅ **Stateful Support:** Persistent volumes for charting data

**Configuration for Medical Spa:**
```yaml
Cluster Mode: Autopilot (managed)
Region: us-central1 (or nearest to primary operations)
Workload Identity: Enabled (for secure service-to-service auth)
Binary Authorization: Enabled (only signed images)
Pod Security Standards: Enforced
Network Policy: Enabled (namespace isolation)
```

**Cost Estimate:**
- Small cluster (charting app): ~$200-400/month
- Medium cluster (20+ locations): ~$800-1,200/month

---

#### NOT Recommended: App Engine

**Why Skip App Engine:**
- ❌ Less flexibility than Cloud Run
- ❌ More expensive for bursty workloads
- ❌ Cloud Run has superseded it for most use cases in 2025
- ⚠️ Only consider if you need ultra-simple deployment with zero Docker knowledge

---

## 2. Database Architecture

### Primary Database: Cloud SQL PostgreSQL

**Recommended for:**
- Patient records (demographics, medical history, consent forms)
- Appointments and scheduling
- Staff and provider data
- Billing and payment records
- Inventory management

**Why Cloud SQL PostgreSQL:**
- ✅ **HIPAA Compliant:** Covered under BAA with automatic encryption (AES-256)
- ✅ **Proven Reliability:** 200% speed improvement in healthcare case studies
- ✅ **Familiar:** PostgreSQL is industry-standard, easy to migrate
- ✅ **High Availability:** 99.95% SLA with regional replication
- ✅ **Managed Backups:** Automated daily backups, point-in-time recovery
- ✅ **Private Connectivity:** VPC peering, no public internet exposure
- ✅ **Cost Effective:** More affordable than Cloud Spanner for this scale

**Configuration for Medical Spa (10-50 locations):**
```yaml
Instance Type: db-custom-8-32768 (8 vCPU, 32GB RAM)
High Availability: Enabled (automatic failover)
Region: us-central1 (primary)
Read Replicas: 2 (for reporting queries, read scaling)
Backup: Automated daily, 7-day retention minimum
Point-in-time Recovery: Enabled (up to 7 days)
Encryption:
  - At Rest: AES-256 (default)
  - In Transit: TLS 1.2+
  - CMEK: Customer-Managed Encryption Keys (for extra HIPAA control)
Private IP: Enabled (no public access)
SSL: Required for all connections
Connection Pooling: PgBouncer (500-1000 connections)
```

**Schema Design for Multi-Location:**
```sql
-- Tenant isolation strategy
CREATE TABLE locations (
  location_id UUID PRIMARY KEY,
  name VARCHAR(255),
  region VARCHAR(50),
  hipaa_entity_id VARCHAR(100), -- For BAA tracking
  created_at TIMESTAMP DEFAULT NOW()
);

-- All tables include location_id for row-level isolation
CREATE TABLE patients (
  patient_id UUID PRIMARY KEY,
  location_id UUID REFERENCES locations(location_id),
  encrypted_ssn TEXT, -- Use pgcrypto for SSN encryption
  -- ... other fields with column-level encryption for SSN, DOB
  CONSTRAINT patients_location_fk FOREIGN KEY (location_id)
    REFERENCES locations(location_id) ON DELETE RESTRICT
);

-- Row-Level Security (RLS) for multi-tenancy
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY location_isolation ON patients
  FOR ALL
  USING (location_id = current_setting('app.current_location_id')::UUID);
```

**Estimated Costs (10-50 locations):**
- Primary Instance (HA): ~$350-450/month
- 2 Read Replicas: ~$200-300/month each
- Storage (1TB): ~$170/month
- Backups (automated): ~$100/month
- **Total: $1,000-1,500/month**

---

### When to Consider Cloud Spanner

**Use Cloud Spanner If:**
- ⚠️ Growing beyond 100+ locations globally
- ⚠️ Need true global multi-region writes with strong consistency
- ⚠️ Require horizontal scaling beyond Cloud SQL's 416GB RAM limit
- ⚠️ Need 99.999% availability SLA

**Why NOT Cloud Spanner for 10-50 Locations:**
- ❌ **Expensive:** Minimum ~$3,000/month (3-node regional, 5-node multi-region)
- ❌ **Overkill:** Cloud SQL handles 10,000 DAU easily
- ❌ **Complexity:** NewSQL requires learning curve, migration complexity
- ❌ **Cost-Ineffective:** 3-5x more expensive than Cloud SQL at this scale

**Decision Point:** Switch to Cloud Spanner when you reach:
- 100+ locations across 3+ countries
- 50,000+ daily active users
- Need for sub-100ms global read latency

---

### Real-Time Database: Firestore

**Recommended for:**
- Real-time appointment calendar updates
- Live waitlist status
- Waiting room check-in notifications
- Staff presence/availability status
- Messaging/SMS delivery status

**Why Firestore over Realtime Database:**
- ✅ **HIPAA Compliant:** Can be deployed under GCP BAA (Realtime DB cannot)
- ✅ **Better Security:** IAM integration, automatic data validation
- ✅ **Scalability:** Handles millions of concurrent users
- ✅ **Querying:** Rich query capabilities vs. Realtime DB's JSON tree
- ✅ **Multi-Region:** Automatic replication across regions
- ✅ **Offline Support:** Mobile apps work offline, sync when online

**Configuration for HIPAA Compliance:**
```javascript
// Firestore Security Rules for HIPAA
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // No PHI should be stored in Firestore
    // Only status, metadata, non-sensitive real-time data

    match /appointments/{appointmentId} {
      allow read: if request.auth != null
        && request.auth.token.location_id == resource.data.location_id;
      allow write: if request.auth != null
        && request.auth.token.role in ['admin', 'provider', 'staff'];
    }

    match /waitlist/{waitlistId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role in ['admin', 'staff'];
    }
  }
}
```

**Data Model Example:**
```javascript
// appointments/{appointmentId}
{
  appointmentId: "appt_123",
  locationId: "loc_456",
  status: "confirmed", // in-progress, completed, cancelled
  startTime: Timestamp,
  endTime: Timestamp,
  providerId: "prov_789",
  roomId: "room_001",
  // NO PHI here - keep in Cloud SQL
  // Name, DOB, SSN, medical history stays in PostgreSQL
  updatedAt: ServerTimestamp
}
```

**Estimated Costs:**
- Reads: 50K/day × 30 days = 1.5M reads/month = **Free** (50K/day free tier)
- Writes: 20K/day × 30 days = 600K writes/month = ~$11/month
- Storage: 10GB = ~$2/month
- **Total: $10-20/month**

---

### Analytics Database: BigQuery

**Recommended for:**
- Patient acquisition analytics
- Appointment analytics and trends
- Revenue and billing reports
- Marketing campaign performance
- Waitlist analytics
- Provider productivity metrics

**Why BigQuery:**
- ✅ **HIPAA Compliant:** Covered under BAA with CMEK
- ✅ **Serverless:** No infrastructure management
- ✅ **Fast Analytics:** Petabyte-scale queries in seconds
- ✅ **Cost Effective:** Pay only for queries run
- ✅ **ML Integration:** BigQuery ML for predictive analytics
- ✅ **Real-Time:** Streaming inserts for near-real-time dashboards

**HIPAA Configuration:**
```yaml
Dataset Configuration:
  Location: us-central1 (single region for data residency)
  Encryption: CMEK (Customer-Managed Encryption Keys)
  Access Control:
    - Column-level security (mask PHI columns)
    - Row-level security (location-based filtering)
  Audit Logging:
    - Data Access Logs: Enabled
    - Admin Activity Logs: Enabled
  Retention: 6+ years (HIPAA requirement)
  VPC Service Controls: Enabled (prevent data exfiltration)
```

**Data Pipeline:**
```
Cloud SQL PostgreSQL → Cloud Pub/Sub → Dataflow → BigQuery
(Nightly ETL)           (Change Data Capture)  (Transform)  (Analytics)

Or simpler:
Cloud SQL → Scheduled Query → BigQuery
(Direct federated query for smaller datasets)
```

**De-identification Strategy:**
```sql
-- Create de-identified view for analytics
CREATE VIEW analytics.patient_visits_deidentified AS
SELECT
  -- Hash patient ID for privacy
  TO_BASE64(SHA256(CAST(patient_id AS STRING))) as patient_hash,
  location_id,
  appointment_date,
  service_category,
  revenue,
  payment_method,
  -- Remove all direct identifiers
  -- NO name, DOB, SSN, address, phone
FROM analytics.appointments
WHERE appointment_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEARS);
```

**Estimated Costs:**
- Queries: 1TB/month scanned = ~$5/month (first 1TB free)
- Storage: 100GB = ~$2/month (first 10GB free)
- Streaming Inserts: 10M rows/month = ~$5/month
- **Total: $10-30/month**

---

## 3. Real-Time & Messaging Architecture

### Cloud Pub/Sub for Event-Driven Architecture

**Use Cases:**
- Appointment created → send confirmation SMS
- Payment processed → update billing, send receipt
- Inventory depleted → alert staff
- FHIR data ingestion → notify care team
- Waitlist spot available → notify patient

**Why Cloud Pub/Sub:**
- ✅ **HIPAA Compliant:** Covered under BAA
- ✅ **Scalable:** Handles millions of messages/second
- ✅ **Reliable:** At-least-once delivery, 7-day retention
- ✅ **Async Decoupling:** Services communicate without tight coupling
- ✅ **Low Latency:** ~100ms message delivery
- ✅ **Cost Effective:** $40 per TB of data (first 10GB free/month)

**Topic Design:**
```yaml
Topics:
  - appointment-events (created, updated, cancelled)
  - payment-events (charged, refunded, failed)
  - inventory-events (depleted, restocked, expired)
  - notification-events (sms, email, push)
  - waitlist-events (added, removed, spot-available)
  - audit-events (all HIPAA-required audit logs)

Subscriptions:
  - sms-service subscribes to appointment-events, waitlist-events
  - billing-service subscribes to payment-events
  - analytics-service subscribes to all events (for BigQuery streaming)
  - audit-service subscribes to audit-events (for compliance)
```

**Message Format (No PHI in Messages):**
```json
{
  "eventType": "appointment.created",
  "eventId": "evt_12345",
  "timestamp": "2025-12-23T10:30:00Z",
  "locationId": "loc_456",
  "appointmentId": "appt_789",
  "metadata": {
    "serviceCategory": "injectable",
    "providerId": "prov_123"
  }
  // NO patient name, DOB, SSN in Pub/Sub messages
  // Services fetch PHI from Cloud SQL using IDs
}
```

**Cloud Healthcare API Integration:**
```yaml
# Pub/Sub notifications for FHIR resources
FHIR Store: medspa-fhir
Notification Config:
  Topic: projects/medspa-prod/topics/fhir-events
  Filter: resource.resourceType = "Appointment" OR resource.resourceType = "Patient"
  Events:
    - CREATE
    - UPDATE
    - DELETE
```

**Estimated Costs:**
- 1M messages/month = ~$0.40/month (first 10GB free)
- 10M messages/month = ~$4/month
- **Total: $5-20/month**

---

### Cloud Tasks for Scheduled Jobs

**Use Cases:**
- Appointment reminders (send 24h before, 1h before)
- Follow-up messages (post-treatment care)
- Payment plan reminders (monthly billing)
- Inventory expiration alerts (30 days before)
- Report generation (daily, weekly, monthly)

**Why Cloud Tasks:**
- ✅ **Scheduled Execution:** Run tasks at specific future times (up to 30 days)
- ✅ **Reliable:** Automatic retries with exponential backoff
- ✅ **Rate Limiting:** Control downstream API load (e.g., Twilio)
- ✅ **Deduplication:** Prevent duplicate task execution
- ✅ **Task Retention:** 31-day task history

**Architecture:**
```
Cloud Scheduler (cron) → Cloud Run (reminder-scheduler) → Cloud Tasks
                                                           ↓
                                                   Cloud Run (send-sms)
                                                           ↓
                                                      Twilio API
```

**Task Queue Design:**
```yaml
Queues:
  - sms-reminders (max: 10 req/sec to respect Twilio limits)
  - email-queue (max: 50 req/sec)
  - report-generation (max: 5 req/sec, long-running)
  - payment-processing (max: 20 req/sec)

Retry Configuration:
  Max Attempts: 10
  Max Backoff: 3600s (1 hour)
  Min Backoff: 10s
  Max Doublings: 5
```

**Cloud Scheduler (Cron Jobs):**
```yaml
Jobs:
  - Name: daily-appointment-reminders
    Schedule: "0 9 * * *" (9 AM daily)
    Target: Cloud Run (reminder-scheduler service)

  - Name: weekly-inventory-report
    Schedule: "0 8 * * MON" (8 AM every Monday)
    Target: Cloud Run (inventory-report service)

  - Name: monthly-revenue-report
    Schedule: "0 9 1 * *" (9 AM first day of month)
    Target: Cloud Run (revenue-report service)
```

**Estimated Costs:**
- Cloud Tasks: Free (first 1M operations/month)
- Cloud Scheduler: $0.10/job/month × 10 jobs = **$1/month**
- **Total: ~$1-5/month**

---

### Firebase Cloud Messaging (FCM) for Push Notifications

**Use Cases:**
- Appointment confirmations/reminders
- Waitlist spot available notifications
- Payment confirmations
- Treatment plan updates
- Promotional offers

**Why FCM:**
- ✅ **Free:** No cost for basic push notifications
- ✅ **Cross-Platform:** iOS, Android, Web
- ✅ **Scalable:** Billions of messages/day
- ✅ **Reliable:** Google's infrastructure
- ✅ **Segmentation:** Target users by location, behavior

**Security Considerations:**
- ⚠️ **NOT for PHI:** Do not send patient names, DOB, SSN in push notifications
- ✅ **Generic Messages:** "You have a new message" instead of patient details
- ✅ **Deep Linking:** Link to app where user authenticates to see details

**Message Strategy:**
```javascript
// WRONG - Contains PHI
{
  "notification": {
    "title": "Appointment Reminder",
    "body": "Your Botox appointment with Dr. Smith tomorrow at 2 PM"
  }
}

// CORRECT - No PHI
{
  "notification": {
    "title": "Appointment Reminder",
    "body": "You have an appointment tomorrow. Tap to view details."
  },
  "data": {
    "type": "appointment_reminder",
    "appointmentId": "appt_789"
  }
}
// App fetches appointment details from API after user authenticates
```

**Best Practices for Scale:**
- Ramp up traffic gradually (0 to max over 60 seconds minimum)
- Implement exponential backoff with jitter (10s min delay)
- Monitor via Cloud Logging
- For 100K+ RPS, contact Firebase Support in advance

**Estimated Costs:**
- **Free** (no charges for FCM basic functionality)
- Bandwidth charges apply for large payloads (1MB image to 3M devices = $450)
- Keep notifications small (<4KB) to avoid bandwidth costs

---

## 4. Security & HIPAA Compliance

### Business Associate Agreement (BAA)

**CRITICAL FIRST STEP:**
1. Review and execute Google Cloud BAA before handling any PHI
2. Instructions: https://cloud.google.com/security/compliance/hipaa-compliance
3. Covers all Google Cloud infrastructure (all regions, zones, networks)

**Covered Services (Verified for 2025):**
- ✅ Compute Engine
- ✅ Google Kubernetes Engine (GKE)
- ✅ Cloud Run
- ✅ Cloud SQL
- ✅ Cloud Storage
- ✅ BigQuery
- ✅ Cloud Pub/Sub
- ✅ Firestore
- ✅ Cloud Healthcare API
- ✅ Cloud Functions
- ✅ Cloud Tasks
- ✅ Cloud Scheduler
- ✅ VPC Service Controls
- ✅ Secret Manager
- ✅ Cloud KMS
- ✅ Cloud Logging
- ✅ Cloud Monitoring

**NOT Covered (Do Not Use with PHI):**
- ❌ Pre-GA (alpha/beta) products
- ❌ Firebase Realtime Database (use Firestore instead)
- ❌ Firebase Authentication (use Cloud Identity Platform)
- ❌ Any service not explicitly listed in BAA

---

### VPC Service Controls (Data Exfiltration Prevention)

**Why VPC Service Controls:**
- ✅ **HIPAA Required:** Prevents unauthorized data exfiltration
- ✅ **Context-Aware Access:** Control based on IP, identity, device
- ✅ **No Extra Cost:** Free to use
- ✅ **Perimeter Isolation:** Create security boundaries around resources

**Perimeter Design:**
```yaml
Perimeter: medspa-production
Projects:
  - medspa-prod-compute (Cloud Run, GKE)
  - medspa-prod-data (Cloud SQL, BigQuery, Cloud Storage)
  - medspa-prod-analytics (BigQuery, Dataflow)

Protected Resources:
  - storage.googleapis.com (Cloud Storage)
  - bigquery.googleapis.com
  - sqladmin.googleapis.com
  - pubsub.googleapis.com
  - healthcare.googleapis.com

Access Levels:
  - Allow from corporate office IPs: 203.0.113.0/24
  - Allow from GCP internal networks
  - Require device policy compliance (managed devices only)
  - Block all public internet access to data services

Ingress/Egress Rules:
  Ingress: Allow from trusted perimeters only
  Egress: Block all except approved APIs (Twilio, Stripe with allowlist)
```

**Multi-Tier Perimeter Strategy:**
```yaml
# High-Security Perimeter (PHI data)
Perimeter: medspa-phi-data
Resources:
  - Cloud SQL (patient records)
  - Cloud Storage (medical images)
  - BigQuery (analytics with PHI)
Access: Strict - only from production services

# Low-Security Perimeter (De-identified data)
Perimeter: medspa-public-analytics
Resources:
  - BigQuery (de-identified analytics)
  - Cloud Storage (public marketing assets)
Access: Relaxed - data science team, BI tools
```

---

### Encryption Strategy

**Encryption at Rest:**
```yaml
Default Encryption: AES-256 (all GCP services)
Customer-Managed Encryption Keys (CMEK):
  Services:
    - Cloud SQL: Enabled
    - Cloud Storage: Enabled
    - BigQuery: Enabled
    - Firestore: Enabled
  Key Ring: medspa-hipaa-keys
  Location: us-central1
  Rotation: Automatic 90-day rotation
  Permissions: Limit to CloudKMS CryptoKey Encrypter/Decrypter role
```

**Encryption in Transit:**
```yaml
TLS Version: 1.2+ (enforce minimum)
Cloud SQL: SSL required for all connections
Cloud Load Balancer: HTTPS-only, HSTS enabled
Internal Services: mTLS (mutual TLS) between services
API Gateway: OAuth 2.0 + JWT tokens
```

**Application-Level Encryption (for SSN, Credit Cards):**
```sql
-- PostgreSQL pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt SSN at application level
INSERT INTO patients (ssn_encrypted)
VALUES (
  pgp_sym_encrypt('123-45-6789', 'app-encryption-key-from-secret-manager')
);

-- Decrypt SSN (only when needed)
SELECT pgp_sym_decrypt(ssn_encrypted::bytea, 'key') FROM patients;
```

---

### Secret Manager

**Store ALL Sensitive Credentials:**
```yaml
Secrets:
  - database-password (Cloud SQL root password)
  - twilio-auth-token
  - stripe-api-key-production
  - jwt-signing-key
  - app-encryption-key (for SSN/CC encryption)
  - firebase-service-account-key
  - google-oauth-client-secret

Configuration:
  Replication: Automatic (multi-region)
  Versioning: Enabled (rollback capability)
  Rotation: 90-day rotation policy
  Access Control:
    - Cloud Run service accounts: Secret Accessor role
    - Humans: Secret Viewer role (read-only, no access to values)
```

**Access Pattern:**
```javascript
// Cloud Run service fetches secret at startup
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

async function getSecret(secretName) {
  const [version] = await client.accessSecretVersion({
    name: `projects/medspa-prod/secrets/${secretName}/versions/latest`,
  });
  return version.payload.data.toString('utf8');
}

const twilioAuthToken = await getSecret('twilio-auth-token');
```

---

### Cloud Armor (DDoS Protection)

**Why Cloud Armor:**
- ✅ **DDoS Protection:** Mitigate large-scale attacks
- ✅ **WAF Rules:** Block SQL injection, XSS, etc.
- ✅ **Rate Limiting:** Prevent API abuse
- ✅ **Geo-Blocking:** Block traffic from non-US regions (if needed)

**Configuration:**
```yaml
Security Policy: medspa-cloud-armor
Backend Services:
  - admin-api (Cloud Run)
  - patient-portal (Cloud Run)

Rules:
  1. Priority 1000: Block known malicious IPs (Google managed list)
  2. Priority 2000: Rate limit to 1000 req/min per IP
  3. Priority 3000: Block countries outside US (optional, for HIPAA data residency)
  4. Priority 5000: Allow specific SQL injection patterns (OWASP ModSecurity CRS)
  5. Priority 10000: Default allow

Adaptive Protection: Enabled (ML-based DDoS detection)
```

**Estimated Costs:**
- Security Policy: $6/month
- Rules (5 rules): $1/rule/month = $5/month
- Requests: $0.75 per 1M requests (first 1M free)
- **Total: $15-30/month**

---

### Cloud Identity Platform (Authentication)

**Why Cloud Identity Platform over Firebase Auth:**
- ✅ **HIPAA Compliant:** Covered under BAA (Firebase Auth is NOT)
- ✅ **Enterprise Features:** SAML, multi-tenancy, advanced security
- ✅ **Multi-Factor Auth:** Built-in MFA for HIPAA compliance
- ✅ **Audit Logging:** Detailed logs for compliance

**Configuration:**
```yaml
Tenants:
  - admin-app (staff, providers)
  - patient-portal (patients)
  - tablet-charting (providers only)

Authentication Methods:
  - Email/Password (with MFA required)
  - Google OAuth (for staff)
  - SAML (for enterprise customers with SSO)

Password Policy:
  Min Length: 12 characters
  Complexity: Uppercase, lowercase, number, special char
  Expiration: 90 days
  History: Prevent reuse of last 5 passwords

Session Management:
  Session Timeout: 15 minutes (idle)
  Absolute Timeout: 8 hours (force re-auth)
  Device Binding: Enabled (prevent session hijacking)
```

**Estimated Costs:**
- First 50,000 MAU: Free
- 50,000-100,000 MAU: $0.0055/user
- **Total: Free for 10-50 locations (under 50K users)**

---

### Audit Logging & Compliance

**Required HIPAA Audit Logs:**
```yaml
Cloud Audit Logs:
  Admin Activity Logs: Enabled (free, always on)
  Data Access Logs: Enabled (read/write to PHI)
  System Event Logs: Enabled (GCP-initiated actions)
  Policy Denied Logs: Enabled (unauthorized access attempts)

Log Retention:
  Cloud Logging: 400 days (default 30, extend for HIPAA)
  Cloud Storage (archive): 6+ years (HIPAA requirement)
  BigQuery (analytics): 6+ years

Log Sink Configuration:
  - Sink 1: All logs → Cloud Storage (long-term archive)
  - Sink 2: Data Access logs → BigQuery (query/analyze)
  - Sink 3: Security logs → SIEM (if using third-party)
```

**Audit Log Examples:**
```json
// Data Access Log (Cloud SQL query)
{
  "protoPayload": {
    "@type": "type.googleapis.com/google.cloud.audit.AuditLog",
    "authenticationInfo": {
      "principalEmail": "nurse@medspa.com"
    },
    "requestMetadata": {
      "callerIp": "10.128.0.5"
    },
    "resourceName": "projects/medspa-prod/instances/medspa-db",
    "methodName": "cloudsql.instances.query",
    "request": {
      "query": "SELECT * FROM patients WHERE patient_id = '123'"
    }
  },
  "timestamp": "2025-12-23T14:30:00Z"
}
```

**Compliance Monitoring:**
```yaml
Cloud Security Command Center:
  Tier: Premium (for HIPAA compliance scanning)
  Continuous Scanning:
    - Misconfigurations (public buckets, open firewall rules)
    - Vulnerabilities (outdated OS, libraries)
    - Threats (anomalous access patterns)
  Alerts:
    - Public IP assigned to Cloud SQL
    - Encryption disabled on Cloud Storage bucket
    - IAM role granted to external user
```

**Estimated Costs:**
- Data Access Logs: ~$0.50/GB ingested
- Cloud Logging Storage (400 days): ~$100-200/month
- Cloud Storage Archive (6 years): ~$50-100/month
- Security Command Center Premium: ~$300-500/month
- **Total: $500-1,000/month**

---

## 5. Monitoring & Observability

### Cloud Monitoring & Logging

**Why Cloud Monitoring:**
- ✅ **Built-In:** Integrated with all GCP services
- ✅ **Free Tier:** Generous free quota for metrics/logs
- ✅ **Alerting:** PagerDuty, Slack, email, SMS integrations
- ✅ **SLO Tracking:** Service-level objective monitoring
- ✅ **Uptime Checks:** External HTTP/HTTPS monitoring

**SLA & Uptime:**
```yaml
Cloud Observability SLA: 99.95% monthly uptime
Cloud Healthcare SLA: 99.95% monthly uptime
Cloud SQL HA: 99.95% monthly uptime
Cloud Run: 99.95% monthly uptime (multi-region)

Target SLOs for Medical Spa:
  - API Response Time (p95): < 500ms
  - API Response Time (p99): < 1000ms
  - Availability: 99.9% (43 minutes downtime/month)
  - Error Rate: < 0.1%
```

**Monitoring Configuration:**
```yaml
Dashboards:
  1. Infrastructure Health
     - Cloud SQL CPU/Memory/Connections
     - Cloud Run instances/requests/latency
     - GKE cluster health (if using)

  2. Application Performance
     - API response times (p50, p95, p99)
     - Error rates (4xx, 5xx)
     - Request throughput (req/sec)

  3. Business Metrics
     - Appointments booked (hourly, daily)
     - Revenue processed (hourly, daily)
     - SMS sent/delivered
     - Waitlist conversions

  4. Security & Compliance
     - Failed login attempts
     - Data access patterns
     - Encryption key usage
     - VPC Service Controls denials

Alerting Policies:
  - Critical: Cloud SQL down (PagerDuty)
  - Critical: API error rate > 1% (PagerDuty)
  - Warning: Cloud SQL CPU > 80% (Email)
  - Warning: Cloud Run instances > 80 (Email)
  - Info: Daily summary report (Email)
```

**Uptime Checks:**
```yaml
Checks:
  - Name: admin-api-health
    Frequency: 1 minute
    Endpoint: https://api.medspa.com/health
    Locations: 6 regions (us-central1, us-east1, us-west1, etc.)
    Timeout: 10s
    Expected Status: 200
    Alert: Email + PagerDuty on failure

  - Name: patient-portal-health
    Frequency: 1 minute
    Endpoint: https://patients.medspa.com/health
    Alert: Email on failure
```

**Error Reporting:**
```javascript
// Automatic error reporting from Cloud Run
const {ErrorReporting} = require('@google-cloud/error-reporting');
const errors = new ErrorReporting();

app.use((err, req, res, next) => {
  errors.report(err);
  res.status(500).json({error: 'Internal server error'});
});
```

**Cloud Trace (Distributed Tracing):**
```yaml
Enable Cloud Trace: Yes (no cost for first 2.5M spans/month)

Traced Services:
  - Cloud Run APIs (automatic)
  - Cloud SQL queries (via OpenTelemetry)
  - Pub/Sub messages (automatic)
  - External API calls (Twilio, Stripe)

Example Trace:
  POST /appointments/create → 450ms
    ├─ Authenticate user → 20ms
    ├─ Validate request → 10ms
    ├─ Check provider availability (Cloud SQL) → 150ms
    ├─ Create appointment (Cloud SQL) → 100ms
    ├─ Publish event (Pub/Sub) → 50ms
    ├─ Update Firestore calendar → 80ms
    └─ Send confirmation SMS (Twilio) → 40ms
```

**Estimated Costs (2025 Pricing):**
- Cloud Monitoring Metrics: Free for GCP metrics, $0.258/MiB for custom metrics
- Cloud Logging: $0.50/GB ingested (first 50GB/month free)
- Uptime Checks: Free for first 1M checks/month
- Error Reporting: Free
- Cloud Trace: Free for first 2.5M spans/month
- **Total: $50-150/month** (mostly logging)

**Note:** Starting January 7, 2025, Cloud Monitoring charges for alerting. Budget accordingly.

---

### Performance Optimization

**Cloud CDN (for Patient Portal):**
```yaml
Enable Cloud CDN: Yes (for static assets)
Backend Service: patient-portal (Cloud Run)
Cache Mode: CACHE_ALL_STATIC
TTL: 3600s (1 hour)
Negative Caching: Enabled (cache 404s for 5 minutes)

Estimated Performance:
  - Static assets (JS/CSS/images): 200ms → 20ms (10x faster)
  - TTFB from edge locations: < 50ms globally
  - Cost: $0.08/GB (cheaper than Cloud Run egress)
```

**Cloud SQL Connection Pooling:**
```yaml
PgBouncer Configuration:
  Pool Mode: Transaction (for stateless connections)
  Max Connections: 1000
  Default Pool Size: 20 per Cloud Run instance
  Reserve Pool Size: 5 (for admin connections)

Benefits:
  - Reduce connection overhead (100ms → 5ms)
  - Handle more concurrent users (10K+ DAU)
  - Prevent "too many connections" errors
```

---

## 6. Cost Optimization Best Practices (2025)

### FinOps Strategy

**1. Tagging & Cost Allocation**
```yaml
Labels (apply to ALL resources):
  - environment: production | staging | development
  - location_id: loc_001 | loc_002 | ... (track per-location costs)
  - team: engineering | operations | analytics
  - cost_center: location-ops | engineering | marketing
  - compliance: hipaa | non-hipaa

Cost Breakdown Views:
  - By Location (which locations are most expensive?)
  - By Service (Cloud SQL vs Cloud Run costs)
  - By Team (engineering vs ops spending)
```

**2. Committed Use Discounts (CUDs)**
```yaml
Cloud SQL:
  - Commit to 1-year: 25% discount
  - Commit to 3-year: 52% discount
  - Recommendation: Start with 1-year CUD after 3 months in production

Compute Engine / GKE:
  - Commit to 1-year: 37% discount
  - Commit to 3-year: 55% discount
  - Start with 70% of baseline usage on CUD (leave 30% flex)

Estimated Savings:
  - Cloud SQL (1-year CUD): $1,500/month → $1,125/month = $375 saved
  - GKE (1-year CUD): $800/month → $504/month = $296 saved
  - Total Annual Savings: ~$8,000/year
```

**3. Spot VMs for Non-Critical Workloads**
```yaml
Use Spot VMs for:
  - Batch report generation (90% cost savings)
  - Data processing pipelines (Dataflow with Spot workers)
  - Development/staging environments

Avoid Spot VMs for:
  - Production APIs (30-second preemption warning)
  - Real-time appointment booking
  - Patient-facing services
```

**4. Serverless for Variable Workloads**
```yaml
Cloud Run Benefits:
  - Scale to zero during off-hours (nights, weekends)
  - Pay per request (vs. paying for idle VMs)

Example Cost Savings:
  Traditional VM: $200/month (24/7 running)
  Cloud Run: $50/month (only business hours + scale-to-zero)
  Savings: 75% reduction
```

**5. Data Lifecycle Management**
```yaml
Cloud Storage Lifecycle:
  - Medical images (DICOM files):
    - 0-30 days: Standard Storage ($0.020/GB)
    - 30-365 days: Nearline Storage ($0.010/GB)
    - 1+ years: Coldline Storage ($0.004/GB)
    - 7+ years: Archive Storage ($0.0012/GB)

  - HIPAA Requirement: Retain 6+ years

Example Savings:
  1TB medical images:
    - Standard (all year): $240/year
    - Lifecycle (auto-tiering): $100/year
    - Savings: 58% reduction
```

**6. BigQuery Cost Controls**
```yaml
Query Cost Controls:
  - Set maximum bytes billed per query: 1TB
  - Enable partition pruning (query only recent data)
  - Use clustering for faster queries
  - Materialize frequently-queried results

Example:
  Without optimization: 10TB scanned/month = $50
  With partitioning: 1TB scanned/month = $5
  Savings: 90% reduction
```

**7. Monitoring & Budgets**
```yaml
Budget Alerts:
  - Budget 1: $5,000/month (overall GCP spend)
    - Alert at 50%, 90%, 100%
    - Send to: finance@medspa.com, cto@medspa.com

  - Budget 2: $100/month per location
    - Alert at 90%, 100%
    - Send to: location manager

  - Budget 3: $1,000/month (Cloud SQL)
    - Alert at 80%, 100%
    - Action: Review if we need to scale down
```

**8. Rightsizing Recommendations**
```yaml
Cloud SQL Rightsizing:
  - Enable "Idle instance management" (auto-shutdown after hours)
  - Review "Recommender" service weekly
  - Downsize if CPU < 50% for 7 days

Cloud Run Rightsizing:
  - Start with 1 vCPU, 2GB RAM
  - Monitor actual usage
  - Reduce if memory < 50% used
```

---

### Estimated Total Monthly Costs (10-50 Locations)

**Compute:**
- Cloud Run (10 services): $300-500
- GKE Autopilot (optional): $200-400
- **Subtotal: $500-900**

**Database:**
- Cloud SQL (HA + replicas): $1,000-1,500
- Firestore: $10-20
- BigQuery: $10-30
- **Subtotal: $1,020-1,550**

**Networking:**
- Cloud Load Balancer: $20-40
- Cloud Armor: $15-30
- Cloud CDN: $50-100
- **Subtotal: $85-170**

**Messaging:**
- Cloud Pub/Sub: $5-20
- Cloud Tasks: $1-5
- FCM: Free
- **Subtotal: $6-25**

**Security & Compliance:**
- Secret Manager: Free
- Cloud KMS: $6-12
- VPC Service Controls: Free
- Security Command Center: $300-500
- Audit Logging: $100-200
- **Subtotal: $406-712**

**Monitoring:**
- Cloud Monitoring: $50-150
- **Subtotal: $50-150**

**Third-Party Services (not GCP):**
- Twilio SMS: $500-2,000/month (depends on volume)
- Stripe Payments: 2.9% + $0.30 per transaction
- **Subtotal: Variable**

**GRAND TOTAL (GCP Only):**
- **Small (10 locations): $2,000-3,000/month**
- **Medium (25 locations): $3,500-5,000/month**
- **Large (50 locations): $5,000-7,500/month**

**Cost per Location:**
- **$100-150/month per location**

**With Committed Use Discounts (1-year):**
- **Save 25-37% annually = $6,000-18,000/year savings**

---

## 7. Multi-Region Architecture & Disaster Recovery

### Recommended Multi-Region Strategy

**For 10-50 Locations:**
```yaml
Primary Region: us-central1 (Iowa)
  - Cloud SQL (High Availability)
  - Cloud Run services
  - GKE cluster (if used)
  - Primary Firestore database
  - Cloud Storage (Standard)

Secondary Region: us-east1 (South Carolina)
  - Cloud SQL Read Replica (for failover)
  - Cloud Run services (auto-deployed for DR)
  - Firestore (automatic multi-region replication)
  - Cloud Storage (dual-region: us-central1 + us-east1)

Disaster Recovery Tier:
  - RTO (Recovery Time Objective): 1 hour
  - RPO (Recovery Point Objective): 15 minutes
  - Pattern: Warm Standby (services deployed, scaled to minimum)
```

### Cloud SQL Disaster Recovery

**High Availability Configuration:**
```yaml
Primary Instance:
  Region: us-central1
  Zone: us-central1-a (primary)
  HA Zone: us-central1-b (automatic failover)
  Failover Time: < 60 seconds (automatic)

Read Replica (Disaster Recovery):
  Region: us-east1
  Zone: us-east1-b
  Replication: Asynchronous (lag < 1 second)
  Purpose:
    - Read scaling during normal operations
    - Promote to primary if us-central1 fails
  Promotion Time: < 5 minutes (manual or automated)
```

**Failover Procedure:**
```bash
# Automatic failover (HA zone failure)
# Google Cloud handles automatically - no action needed

# Manual failover (regional disaster)
gcloud sql instances promote-replica medspa-db-replica \
  --project=medspa-prod

# Update application DNS/connection strings
# Cloud Run environment variable update
gcloud run services update admin-api \
  --set-env-vars DB_HOST=medspa-db-replica \
  --region=us-east1
```

### Cloud Storage Multi-Region

**Dual-Region Configuration:**
```yaml
Bucket: medspa-medical-images
Location Type: Dual-Region (us-central1 + us-east1)
Storage Class: Standard
Turbo Replication: Enabled (RPO = 15 minutes)
Versioning: Enabled (accidental deletion protection)

Benefits:
  - Synchronous metadata writes (strong consistency)
  - Asynchronous data replication (15-min RPO)
  - Automatic failover (transparent to applications)
  - 99.95% SLA (vs. 99.9% for single-region)
```

### Firestore Multi-Region

**Automatic Multi-Region Replication:**
```yaml
Database: (default)
Location Type: Multi-Region (nam5 = us-central, us-east)
Replication: Automatic across 5 zones in 3 regions

Benefits:
  - Strong consistency for reads/writes
  - Automatic failover (no manual intervention)
  - 99.999% availability SLA
  - Sub-100ms latency across US
```

### Cloud Run Multi-Region Deployment

**Active-Active Configuration:**
```yaml
Global Load Balancer:
  Backend Services:
    - us-central1: Cloud Run (admin-api)
    - us-east1: Cloud Run (admin-api)
  Traffic Splitting:
    - 80% to us-central1 (primary)
    - 20% to us-east1 (testing failover capacity)
  Health Checks:
    - Interval: 10s
    - Timeout: 5s
    - Unhealthy Threshold: 2 consecutive failures
  Failover:
    - Automatic (if us-central1 health check fails)
    - Traffic rerouted to us-east1 in < 30 seconds
```

**CI/CD for Multi-Region:**
```yaml
# Cloud Build - deploy to both regions
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/medspa-prod/admin-api', '.']

  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/medspa-prod/admin-api']

  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'admin-api'
      - '--image=gcr.io/medspa-prod/admin-api'
      - '--region=us-central1'

  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'admin-api'
      - '--image=gcr.io/medspa-prod/admin-api'
      - '--region=us-east1'
```

### Disaster Recovery Testing

**Quarterly DR Drills:**
```yaml
Test Scenarios:
  1. Cloud SQL Primary Failure
     - Simulate primary instance failure
     - Promote read replica
     - Verify application connectivity
     - Measure RTO (target: < 1 hour)

  2. Regional Outage (us-central1 down)
     - Disable all us-central1 traffic in Load Balancer
     - Verify us-east1 handles 100% traffic
     - Check data consistency
     - Measure RPO (target: < 15 minutes data loss)

  3. Application Rollback
     - Deploy bad code to production
     - Trigger Cloud Run rollback to previous revision
     - Verify zero data corruption

  4. Backup Restoration
     - Restore Cloud SQL from backup
     - Verify data integrity
     - Measure restoration time (target: < 30 minutes)
```

---

## 8. Recommended Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         INTERNET (HTTPS/TLS)                           │
└─────────────────────┬───────────────────────────────┬───────────────────┘
                      │                               │
                      ▼                               ▼
         ┌────────────────────────┐      ┌────────────────────────┐
         │  Cloud Armor (DDoS)    │      │  Cloud CDN (Static)    │
         │  + WAF Rules           │      │  Cache: 3600s          │
         └────────────┬───────────┘      └────────────┬───────────┘
                      │                               │
                      ▼                               ▼
         ┌────────────────────────────────────────────────────────┐
         │        Global HTTP(S) Load Balancer                    │
         │  SSL Termination | Health Checks | Multi-Region        │
         └────────────┬───────────────────────────────┬───────────┘
                      │                               │
        ┌─────────────┴─────────┐         ┌───────────┴──────────┐
        ▼                       ▼         ▼                      ▼
┌───────────────┐     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Cloud Run     │     │ Cloud Run    │  │ Cloud Run    │  │ Cloud Run    │
│ us-central1   │     │ us-east1     │  │ Admin Portal │  │ Patient API  │
│ Admin API     │     │ Admin API    │  │ (Frontend)   │  │              │
│ (Primary)     │     │ (DR/Failover)│  │              │  │              │
└───────┬───────┘     └──────────────┘  └──────┬───────┘  └──────┬───────┘
        │                                       │                 │
        │          ┌────────────────────────────┘                 │
        │          │                                              │
        └──────────┼──────────────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────────────────────────────────┐
        │              VPC Service Controls Perimeter              │
        │  (Data Exfiltration Prevention + Context-Aware Access)   │
        └──────────────────────────────────────────────────────────┘
                   │
        ┌──────────┴─────────────────────────────────┐
        │                                             │
        ▼                                             ▼
┌──────────────────┐                        ┌──────────────────┐
│  Cloud SQL       │                        │  Firestore       │
│  PostgreSQL      │                        │  Multi-Region    │
│  (PHI Data)      │◄───────┐               │  (Real-time)     │
│                  │        │               │                  │
│  Primary: us-c1  │        │               │  Location: nam5  │
│  HA Zone: us-c1-b│        │               │  (US Multi-Reg)  │
│  Read Replica:   │        │               │                  │
│    us-east1      │        │               │  • Appointments  │
│                  │        │               │  • Waitlist      │
│  Encryption:     │        │               │  • Presence      │
│  - CMEK (rest)   │        │               │                  │
│  - SSL (transit) │        │               │  Security Rules: │
│  - pgcrypto(SSN) │        │               │  Location-based  │
└────────┬─────────┘        │               └────────┬─────────┘
         │                  │                        │
         │                  │                        │
         ▼                  │                        ▼
┌──────────────────┐        │              ┌──────────────────┐
│  Cloud Storage   │        │              │  BigQuery        │
│  Medical Images  │        │              │  Analytics       │
│                  │        │              │                  │
│  Dual-Region:    │        │              │  • Revenue       │
│  us-central1 +   │        │              │  • Appointments  │
│  us-east1        │        │              │  • Waitlist      │
│                  │        │              │  • De-identified │
│  Lifecycle:      │        │              │                  │
│  0-30d: Standard │        │              │  CMEK Encrypted  │
│  30-365d:Nearline│        │              │  Column/Row RLS  │
│  1yr+: Coldline  │        │              └──────────────────┘
│  7yr+: Archive   │        │
└────────┬─────────┘        │
         │                  │
         │                  │
         ▼                  │
┌──────────────────────────────────┐
│     Cloud Pub/Sub Topics         │
│                                   │
│  • appointment-events             │
│  • payment-events         ────────┤
│  • inventory-events               │
│  • notification-events            │
│  • audit-events                   │
└────────┬─────────────────────────┘
         │
         ├───────────────┬────────────────┬─────────────────┐
         ▼               ▼                ▼                 ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Cloud Run    │ │ Cloud Run    │ │ Cloud Tasks  │ │ Dataflow     │
│ SMS Service  │ │ Email Service│ │ Reminders    │ │ ETL Pipeline │
│              │ │              │ │ (Scheduled)  │ │              │
│ → Twilio API │ │ → SendGrid   │ │              │ │ SQL→BigQuery │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Firebase Cloud Messaging (FCM)  │
│  Push Notifications              │
│  • iOS, Android, Web             │
│  • No PHI in notifications       │
└──────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    SECURITY & COMPLIANCE LAYER                   │
├──────────────────────────────────────────────────────────────────┤
│  • Cloud Identity Platform (Auth + MFA)                          │
│  • Secret Manager (API Keys, DB Passwords)                       │
│  • Cloud KMS (Encryption Keys - 90d Rotation)                    │
│  • Cloud Audit Logs (Admin, Data Access, System Events)         │
│  • Security Command Center (Threat Detection, Compliance Scan)   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  MONITORING & OBSERVABILITY                      │
├──────────────────────────────────────────────────────────────────┤
│  • Cloud Monitoring (Metrics, Dashboards, Alerts)                │
│  • Cloud Logging (Centralized Logs, 400-day Retention)          │
│  • Cloud Trace (Distributed Tracing)                            │
│  • Error Reporting (Exception Tracking)                         │
│  • Uptime Checks (External Monitoring, 6 Regions)               │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                       CI/CD PIPELINE                             │
├──────────────────────────────────────────────────────────────────┤
│  GitHub → Cloud Build → Container Registry → Cloud Run          │
│                                                                   │
│  • Automated Testing (Unit, Integration, E2E)                    │
│  • Binary Authorization (Signed Images Only)                     │
│  • Multi-Region Deployment (us-central1, us-east1)              │
│  • Rollback on Failure (Previous Revision)                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Week 1: GCP Project Setup & Security**
- [ ] Create GCP Organization and Projects (prod, staging, dev)
- [ ] Execute Google Cloud BAA for HIPAA compliance
- [ ] Enable required APIs (Cloud Run, Cloud SQL, Pub/Sub, etc.)
- [ ] Set up VPC with private subnets
- [ ] Configure Cloud Identity Platform (authentication)
- [ ] Set up Secret Manager (API keys, DB passwords)
- [ ] Configure Cloud KMS (encryption keys)
- [ ] Enable Cloud Audit Logs (Admin, Data Access, System Events)

**Week 2: Database & Core Infrastructure**
- [ ] Provision Cloud SQL PostgreSQL (HA config)
- [ ] Set up Cloud SQL read replica (us-east1)
- [ ] Configure CMEK encryption for Cloud SQL
- [ ] Create Firestore database (multi-region)
- [ ] Set up Cloud Storage buckets (dual-region, lifecycle policies)
- [ ] Configure VPC Service Controls perimeter
- [ ] Set up Cloud Armor security policies
- [ ] Configure Global HTTPS Load Balancer

---

### Phase 2: Core Services (Weeks 3-4)

**Week 3: API Development & Deployment**
- [ ] Develop Cloud Run services (Admin API, Patient API)
- [ ] Set up Cloud Build CI/CD pipeline
- [ ] Deploy Cloud Run to us-central1 (primary)
- [ ] Deploy Cloud Run to us-east1 (DR)
- [ ] Configure service-to-service authentication (Workload Identity)
- [ ] Set up Cloud SQL connection pooling (PgBouncer)
- [ ] Implement rate limiting and quota management

**Week 4: Real-Time & Messaging**
- [ ] Set up Cloud Pub/Sub topics (appointments, payments, etc.)
- [ ] Develop event-driven subscribers (SMS, email, analytics)
- [ ] Configure Cloud Tasks queues (reminders, scheduled jobs)
- [ ] Set up Cloud Scheduler cron jobs (daily reminders, reports)
- [ ] Integrate Firebase Cloud Messaging (push notifications)
- [ ] Implement Twilio integration (SMS)
- [ ] Implement Stripe integration (payments)

---

### Phase 3: Analytics & Monitoring (Weeks 5-6)

**Week 5: BigQuery Analytics**
- [ ] Create BigQuery datasets (analytics, de-identified views)
- [ ] Set up ETL pipeline (Cloud SQL → BigQuery)
- [ ] Configure column/row-level security
- [ ] Build analytics dashboards (Looker Studio)
- [ ] Set up streaming inserts for real-time metrics
- [ ] Create scheduled queries (daily aggregations)

**Week 6: Monitoring & Observability**
- [ ] Configure Cloud Monitoring dashboards
- [ ] Set up alerting policies (PagerDuty, email)
- [ ] Configure uptime checks (6 regions)
- [ ] Set up Cloud Trace for distributed tracing
- [ ] Configure Error Reporting
- [ ] Set up log sinks (Cloud Storage, BigQuery)
- [ ] Configure Security Command Center (compliance scanning)

---

### Phase 4: Compliance & Testing (Weeks 7-8)

**Week 7: HIPAA Compliance Hardening**
- [ ] Audit all services against BAA coverage
- [ ] Implement application-level encryption (SSN, credit cards)
- [ ] Configure 400-day log retention
- [ ] Set up 6-year Cloud Storage archive
- [ ] Perform vulnerability scanning (Security Command Center)
- [ ] Configure MFA for all user accounts
- [ ] Document access control policies
- [ ] Create incident response runbook

**Week 8: Testing & Validation**
- [ ] Load testing (1,000-10,000 concurrent users)
- [ ] Disaster recovery drill (failover to us-east1)
- [ ] Penetration testing (third-party HIPAA audit)
- [ ] Backup restoration testing
- [ ] Performance testing (API response times < 500ms p95)
- [ ] Security audit (HIPAA compliance checklist)
- [ ] User acceptance testing

---

### Phase 5: Production Launch (Week 9-10)

**Week 9: Soft Launch**
- [ ] Deploy to production (1-2 pilot locations)
- [ ] Monitor metrics closely (24/7 on-call)
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Optimize performance bottlenecks

**Week 10: Full Launch**
- [ ] Roll out to all 10-50 locations
- [ ] Train staff on new platform
- [ ] Monitor costs (verify budget alignment)
- [ ] Document operational procedures
- [ ] Set up support escalation (tier 1, 2, 3)
- [ ] Celebrate launch! 🎉

---

## 10. Key Takeaways & Recommendations

### Recommended Stack Summary

| **Component** | **Recommended Service** | **Why** | **Cost/Month** |
|---------------|------------------------|---------|----------------|
| **Compute** | Cloud Run (primary) | Serverless, HIPAA-compliant, cost-effective | $300-500 |
| **Compute** | GKE Autopilot (optional) | Complex stateful workloads | $200-400 |
| **Database** | Cloud SQL PostgreSQL | Proven, HIPAA-compliant, affordable | $1,000-1,500 |
| **Real-Time** | Firestore + Pub/Sub | HIPAA-compliant, scalable | $20-40 |
| **Analytics** | BigQuery | Serverless, HIPAA-compliant, fast | $10-30 |
| **Messaging** | FCM + Twilio | Free (FCM), reliable (Twilio) | Free + variable |
| **Security** | VPC SC + Cloud Armor | Data exfiltration prevention, DDoS | $15-30 |
| **Monitoring** | Cloud Monitoring/Logging | Built-in, comprehensive | $50-150 |
| **Auth** | Cloud Identity Platform | HIPAA-compliant (Firebase Auth is NOT) | Free |
| **Secrets** | Secret Manager | Centralized, versioned | Free |
| **Encryption** | Cloud KMS + CMEK | Customer-managed keys | $6-12 |

**Total Estimated Cost:** **$2,000-3,000/month** (10 locations) to **$5,000-7,500/month** (50 locations)

**Cost per Location:** **$100-150/month**

---

### Critical Success Factors

✅ **Execute BAA First:** Do not deploy ANY PHI to GCP until BAA is signed
✅ **VPC Service Controls:** Mandatory for HIPAA data exfiltration prevention
✅ **CMEK Encryption:** Use customer-managed keys for Cloud SQL, BigQuery, Storage
✅ **Audit Logging:** Enable 400-day retention, archive to Cloud Storage for 6+ years
✅ **MFA Everywhere:** Require multi-factor auth for all user accounts
✅ **No PHI in Firestore/Pub/Sub:** Store only IDs/status, fetch PHI from Cloud SQL
✅ **Regular DR Drills:** Test disaster recovery quarterly (Cloud SQL failover, regional outage)
✅ **Cost Monitoring:** Set budgets, use committed use discounts after 3 months
✅ **Security Scanning:** Use Security Command Center Premium for compliance monitoring
✅ **Penetration Testing:** Third-party HIPAA audit annually

---

### What NOT to Do

❌ **Do NOT use Firebase Realtime Database** (not HIPAA-compliant, use Firestore)
❌ **Do NOT use Firebase Authentication** (not covered under BAA, use Cloud Identity Platform)
❌ **Do NOT use Pre-GA/Beta services** with PHI (not covered under BAA)
❌ **Do NOT store PHI in Firestore** (keep in Cloud SQL, use Firestore for status/metadata only)
❌ **Do NOT send PHI in Pub/Sub messages** (publish event IDs, fetch PHI from Cloud SQL)
❌ **Do NOT send PHI in push notifications** (use generic messages, link to authenticated view)
❌ **Do NOT skip disaster recovery testing** (quarterly drills are critical for HIPAA)
❌ **Do NOT use public IPs for Cloud SQL** (VPC private IP only)
❌ **Do NOT skip committed use discounts** (save 25-55% after baseline usage is known)
❌ **Do NOT use Cloud Spanner yet** (overkill for 10-50 locations, 3-5x more expensive)

---

### When to Scale Up

**Upgrade to Cloud Spanner when:**
- Growing beyond 100+ locations globally
- 50,000+ daily active users
- Need sub-100ms global read latency
- Cloud SQL hitting 416GB RAM limit

**Add GKE when:**
- Need stateful applications (charting with 3D models)
- Custom OS or network protocols required
- Long-running batch jobs (inventory reconciliation, reports)

**Add Dataflow when:**
- Real-time streaming analytics required
- Processing millions of events/hour
- Complex ETL transformations (beyond simple Cloud Functions)

---

## 11. Additional Resources

### Official Google Cloud Documentation

- [HIPAA Compliance on Google Cloud](https://cloud.google.com/security/compliance/hipaa)
- [Cloud SQL HIPAA Implementation Guide](https://cloud.google.com/sql/docs/postgres/security)
- [VPC Service Controls Overview](https://cloud.google.com/vpc-service-controls/docs/overview)
- [BigQuery HIPAA Compliance](https://www.getgalaxy.io/learn/glossary/how-to-achieve-hipaa-compliance-in-bigquery)
- [Cloud Run Best Practices](https://cloud.google.com/run/docs/best-practices)
- [Cloud Healthcare API](https://cloud.google.com/healthcare-api/docs)
- [Well-Architected Framework: Cost Optimization](https://cloud.google.com/architecture/framework/cost-optimization)

### Healthcare-Specific Case Studies

- [Idonia Case Study](https://cloud.google.com/customers/idonia) - Healthcare platform using Cloud SQL, Cloud Run, Pub/Sub
- [Healthcare & Life Sciences on GCP](https://cloud.google.com/solutions/healthcare-life-sciences)

### Security & Compliance

- [Google Workspace HIPAA Implementation Guide (Sept 2025)](https://services.google.com/fh/files/misc/gsuite_cloud_identity_hipaa_implementation_guide.pdf)
- [Assured Workloads Healthcare](https://cloud.google.com/assured-workloads)
- [HIPAA Enforcement Trends 2025](https://compliancy-group.com/is-google-cloud-hipaa-compliant/)

### Cost Optimization

- [GCP Cost Optimization Best Practices (2025)](https://redblink.com/google-cloud-cost-optimization/)
- [FinOps on Google Cloud](https://cloud.google.com/architecture/framework/perspectives/fsi/cost-optimization)

---

## Sources

This research is based on the latest 2025 best practices from the following sources:

- [HIPAA Compliance on Google Cloud | GCP Security](https://cloud.google.com/security/compliance/hipaa)
- [HIPAA - Compliance | Google Cloud](https://cloud.google.com/security/compliance/hipaa-compliance)
- [Google Workspace and Cloud Identity HIPAA Implementation Guide September 2025](https://services.google.com/fh/files/misc/gsuite_cloud_identity_hipaa_implementation_guide.pdf)
- [Google Cloud Healthcare Solutions: HIPAA Compliance Guide](https://www.hipaavault.com/resources/hipaa-compliant-hosting-insights/google-cloud-healthcare-solutions-hipaa-compliance-guide/)
- [Building Secure and Compliant Healthcare Applications with Google Cloud](https://www.d3vtech.com/insights/building-secure-and-compliant-healthcare-applications-with-google-cloud/)
- [Is Google Cloud Platform HIPAA Compliant?](https://www.hipaajournal.com/google-cloud-platform-hipaa-compliant/)
- [Idonia Case Study | Google Cloud](https://cloud.google.com/customers/idonia)
- [Cloud SQL for PostgreSQL](https://cloud.google.com/sql)
- [Google Cloud SQL: The Practical Guide For 2025](https://www.sedai.io/blog/google-cloud-sql-guide)
- [Pub/Sub for Application & Data Integration](https://cloud.google.com/pubsub)
- [Configuring Pub/Sub notifications | Cloud Healthcare API](https://cloud.google.com/healthcare-api/docs/how-tos/pubsub)
- [Mastering Real-Time Processing with Google Cloud Pub/Sub and Dataflow](https://jktech.com/blogs/real-time-processing-with-google-cloud-pub-sub-and-dataflow/)
- [Choose a Database: Cloud Firestore or Realtime Database](https://firebase.google.com/docs/database/rtdb-vs-firestore)
- [Firestore vs Realtime Database in 2025 – Which One Should You Use?](https://dezoko.com/blog/firestore-vs-realtime-database-2025-which-one-use)
- [Is Firebase HIPAA Compliant?](https://askfeather.com/resources/is-firebase-hipaa-compliant)
- [Google App Engine in 2025: Serverless Simplicity vs Cloud Run and GKE](https://medium.com/google-cloud/google-app-engine-in-2025-serverless-simplicity-vs-cloud-run-and-gke-d46f485cf908)
- [Choosing Between GKE and Cloud Run](https://medium.com/google-cloud/choosing-between-gke-and-cloud-run-46f57b87035c)
- [Cloud Run vs App Engine vs GKE: Complete GCP Compute Guide](https://cloudandclear.uk/cloud-run-vs-app-engine-vs-gke-gcp-compute-comparison/)
- [Compare Google Cloud Spanner vs. PostgreSQL](https://www.g2.com/compare/google-cloud-spanner-vs-postgresql)
- [Building Databases On GCP: Cloud SQL VS Cloud Spanner](https://www.geeksforgeeks.org/cloud-computing/building-databases-on-gcp-cloud-sql-vs-cloud-spanner-comparing-options/)
- [Cloud Tasks documentation](https://cloud.google.com/tasks/docs)
- [Compare Cloud Tasks to Cloud Scheduler](https://cloud.google.com/tasks/docs/comp-tasks-sched)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Best practices when sending FCM messages at scale](https://firebase.google.com/docs/cloud-messaging/scale-fcm)
- [Cloud Observability (Monitoring, Logging) SLA](https://cloud.google.com/operations/sla)
- [Cloud Healthcare SLA](https://cloud.google.com/healthcare/sla)
- [Monitoring Google Cloud Platform Service Health In 2025](https://expertbeacon.com/monitoring-google-cloud-platform-service-health-in-2024-best-practices-and-tools/)
- [Well-Architected Framework: Cost optimization pillar](https://docs.cloud.google.com/architecture/framework/cost-optimization)
- [Google Cloud Cost Optimization Best Practices in 2025](https://redblink.com/google-cloud-cost-optimization/)
- [GCP Cost Optimization: 7 Essential Tactics for 2025](https://cast.ai/blog/gcp-cost-optimization/)
- [VPC Service Controls](https://cloud.google.com/security/vpc-service-controls)
- [Overview of VPC Service Controls](https://docs.cloud.google.com/vpc-service-controls/docs/overview)
- [Google Cloud VPC: The Complete 2025 Architecture Guide](https://cloudknowledge.in/google-cloud/google-cloud-vpc/)
- [Is BigQuery HIPAA compliant?](https://www.paubox.com/blog/is-bigquery-hipaa-compliant)
- [HIPAA Compliance in BigQuery: CMEK, IAM, Logging](https://www.getgalaxy.io/learn/glossary/how-to-achieve-hipaa-compliance-in-bigquery)
- [Serverless Data Analytics with Google: BigQuery in 2025](https://hexaware.com/blogs/serverless-data-analytics-with-google-cloud-platform-why-bigquery-stands-out-in-2025/)
- [Architecting disaster recovery for cloud infrastructure outages](https://docs.cloud.google.com/architecture/disaster-recovery)
- [Implementing Multi-Region Disaster Recovery on Google Cloud Platform](https://medium.com/@rvala3386/implementing-multi-region-disaster-recovery-on-google-cloud-platform-mumbai-delhi-13d7043a7812)
- [Building a New Multi-Region Database Architecture in GCP](https://www.cloudthat.com/resources/blog/building-a-new-multi-region-database-architecture-in-google-cloud-platform-gcp)
- [Choosing HIPAA-Compliant Cloud in 2026: GCP vs AWS vs Azure](https://www.hipaavault.com/resources/hipaa-compliant-cloud-2026/)

---

**Document Version:** 1.0
**Last Updated:** December 23, 2025
**Author:** Claude Code Research
**Contact:** For implementation assistance, contact Google Cloud Healthcare Solutions team
