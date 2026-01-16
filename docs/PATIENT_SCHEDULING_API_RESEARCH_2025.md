# Patient & Scheduling APIs: Best Practices Research 2025

## Executive Summary

This document provides comprehensive research and recommendations for implementing Patient Data Management and Appointment Scheduling APIs for a medical spa platform. The recommendations are tailored for a TypeScript-first stack using Hono, PostgreSQL with Prisma, Zod validation, and Vitest for testing.

---

## Table of Contents

1. [Patient Data Management Best Practices](#1-patient-data-management-best-practices)
2. [Appointment Scheduling Best Practices](#2-appointment-scheduling-best-practices)
3. [API Design Patterns 2025](#3-api-design-patterns-2025)
4. [Competitor Analysis](#4-competitor-analysis)
5. [Security Best Practices](#5-security-best-practices)
6. [Performance Considerations](#6-performance-considerations)
7. [Implementation Recommendations](#7-implementation-recommendations)
8. [Code Patterns & Examples](#8-code-patterns--examples)

---

## 1. Patient Data Management Best Practices

### 1.1 HIPAA-Compliant Data Structures

HIPAA compliance requires adherence to three key rules:
- **Security Rule**: Encryption, access control, audit logging, integrity checks
- **Privacy Rule**: "Minimum necessary" data standard, restricted access per role
- **Breach Notification Rule**: Prompt investigation and notification for incidents

#### Key Requirements:
- AES-256 encryption at rest for PHI (Protected Health Information)
- TLS 1.2+ for all data in transit
- Customer-managed encryption keys with regular rotation
- Field-level encryption for sensitive data (SSN, medical history)

#### Recommended Schema Pattern:

```prisma
// Patient identity - separated from PHI for security
model Patient {
  id            String   @id @default(cuid())  // Opaque identifier for API
  mrn           String   @unique               // Internal Medical Record Number
  externalId    String?  @unique               // Enterprise MPI identifier

  // Non-PHI demographics (searchable)
  firstName     String
  lastName      String
  dateOfBirth   DateTime

  // Audit fields
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  createdBy     String
  lastModifiedBy String
  version       Int      @default(1)           // Optimistic locking

  // Multi-tenant isolation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])

  // Relations
  profile       PatientProfile?
  appointments  Appointment[]
  auditLogs     PatientAuditLog[]

  @@index([organizationId, lastName, firstName])
  @@index([mrn])
  @@index([dateOfBirth])
}

// PHI stored separately with additional encryption
model PatientProfile {
  id            String   @id @default(cuid())
  patientId     String   @unique
  patient       Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)

  // Encrypted PHI fields
  ssnEncrypted  String?  // AES-256 encrypted
  medicalHistory Json?   // Encrypted JSON blob
  allergies     Json?    // Encrypted array
  medications   Json?    // Encrypted array

  // HIPAA audit requirement
  lastAccessedAt DateTime?
  lastAccessedBy String?

  @@index([patientId])
}
```

### 1.2 Patient Identifier Strategies

#### Best Practice: Dual Identifier System

| Identifier Type | Use Case | Format | Example |
|----------------|----------|--------|---------|
| **UUID (id)** | API paths, external references | CUID/UUID v7 | `clx123abc...` |
| **MRN** | Internal/clinical use | Sequential with prefix | `MRN-2024-000001` |
| **Enterprise ID** | Cross-system linking | UUID | `ent_abc123...` |

**Critical Rules:**
1. Always use UUIDs/opaque identifiers in API paths - never expose MRNs or PHI in URLs
2. MRNs should be in `Patient.identifier[]` list, not as primary resource ID (MRNs can change due to merges)
3. Never put PHI in URLs or query parameters (they end up in logs)

```typescript
// CORRECT: Opaque UUID in path
GET /api/patients/clx123abc.../appointments

// INCORRECT: MRN in path (exposes internal numbering)
GET /api/patients/MRN-2024-000001/appointments

// INCORRECT: PHI in query params
GET /api/patients?ssn=123-45-6789
```

### 1.3 Data Encryption at Rest

#### Recommended Encryption Strategy:

```typescript
// lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class PHIEncryption {
  private algorithm = 'aes-256-gcm';

  async encrypt(plaintext: string, key: Buffer): Promise<string> {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:ciphertext
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  async decrypt(ciphertext: string, key: Buffer): Promise<string> {
    const [ivHex, authTagHex, encrypted] = ciphertext.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
```

### 1.4 Audit Trail Requirements

HIPAA requires comprehensive audit logging for 6+ years:

```prisma
model PatientAuditLog {
  id            String   @id @default(cuid())
  patientId     String
  patient       Patient  @relation(fields: [patientId], references: [id])

  // What happened
  action        AuditAction
  resourceType  String   // e.g., "appointment", "profile", "consent"
  resourceId    String?

  // Who did it
  userId        String
  userRole      String
  userIp        String?
  userAgent     String?

  // Details
  oldValue      Json?    // Previous state (encrypted if PHI)
  newValue      Json?    // New state (encrypted if PHI)
  reason        String?  // Required for certain actions (break-glass)

  // When
  timestamp     DateTime @default(now())

  // Immutability - stored in append-only format
  checksum      String   // SHA-256 of log entry for tamper detection

  @@index([patientId, timestamp])
  @@index([userId, timestamp])
  @@index([action, timestamp])
}

enum AuditAction {
  VIEW
  CREATE
  UPDATE
  DELETE
  EXPORT
  PRINT
  ACCESS_OVERRIDE  // Break-glass access
}
```

### 1.5 Patient Merge/Deduplication Strategies

#### Matching Algorithms:

| Algorithm | Use Case | Accuracy |
|-----------|----------|----------|
| **Deterministic** | Exact matches (SSN, email) | High precision, low recall |
| **Probabilistic** | Fuzzy matching (name, DOB) | Balanced |
| **Jaro-Winkler** | Name similarity | Good for typos |
| **Soundex/Metaphone** | Phonetic matching | African/international names |

#### Recommended Approach: Two-Phase Matching

```typescript
// services/patient-matching.ts
import { jaroWinkler } from 'jaro-winkler';

interface MatchResult {
  patientId: string;
  score: number;
  matchedFields: string[];
  confidence: 'high' | 'medium' | 'low';
}

export async function findDuplicates(
  input: PatientInput,
  threshold: number = 0.85
): Promise<MatchResult[]> {
  // Phase 1: Blocking - reduce search space
  const candidates = await prisma.patient.findMany({
    where: {
      OR: [
        { lastName: { startsWith: input.lastName.substring(0, 3) } },
        { dateOfBirth: input.dateOfBirth },
        { email: input.email },
      ],
    },
  });

  // Phase 2: Scoring
  const results: MatchResult[] = [];

  for (const candidate of candidates) {
    let score = 0;
    const matchedFields: string[] = [];

    // Exact matches (high weight)
    if (candidate.email === input.email) {
      score += 0.3;
      matchedFields.push('email');
    }
    if (candidate.phone === input.phone) {
      score += 0.25;
      matchedFields.push('phone');
    }
    if (candidate.dateOfBirth.getTime() === input.dateOfBirth.getTime()) {
      score += 0.2;
      matchedFields.push('dateOfBirth');
    }

    // Fuzzy matches (lower weight)
    const nameSimilarity = jaroWinkler(
      `${candidate.firstName} ${candidate.lastName}`.toLowerCase(),
      `${input.firstName} ${input.lastName}`.toLowerCase()
    );
    score += nameSimilarity * 0.25;
    if (nameSimilarity > 0.9) matchedFields.push('name');

    if (score >= threshold) {
      results.push({
        patientId: candidate.id,
        score,
        matchedFields,
        confidence: score >= 0.95 ? 'high' : score >= 0.85 ? 'medium' : 'low',
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
```

#### Merge Operation (FHIR-Compliant):

```typescript
// services/patient-merge.ts
export async function mergePatients(
  masterId: string,
  duplicateId: string,
  userId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1. Update all references to point to master
    await tx.appointment.updateMany({
      where: { patientId: duplicateId },
      data: { patientId: masterId },
    });

    // 2. Merge profile data (keep master, supplement from duplicate)
    const [master, duplicate] = await Promise.all([
      tx.patient.findUnique({ where: { id: masterId }, include: { profile: true } }),
      tx.patient.findUnique({ where: { id: duplicateId }, include: { profile: true } }),
    ]);

    // 3. Mark duplicate as inactive with link to master (FHIR pattern)
    await tx.patient.update({
      where: { id: duplicateId },
      data: {
        active: false,
        mergedIntoId: masterId,
        mergedAt: new Date(),
        mergedBy: userId,
      },
    });

    // 4. Create audit trail
    await tx.patientAuditLog.create({
      data: {
        patientId: masterId,
        action: 'MERGE',
        resourceType: 'patient',
        resourceId: duplicateId,
        userId,
        newValue: { mergedFrom: duplicateId },
      },
    });
  });
}
```

---

## 2. Appointment Scheduling Best Practices

### 2.1 Calendar Data Structures for High Performance

#### Optimized Schema:

```prisma
model Appointment {
  id              String   @id @default(cuid())

  // Core scheduling fields
  startTime       DateTime
  endTime         DateTime
  duration        Int      // minutes (denormalized for queries)
  timezone        String   @default("UTC")

  // Relations
  patientId       String
  patient         Patient  @relation(fields: [patientId], references: [id])
  providerId      String
  provider        Provider @relation(fields: [providerId], references: [id])
  locationId      String
  location        Location @relation(fields: [locationId], references: [id])
  serviceId       String
  service         Service  @relation(fields: [serviceId], references: [id])
  roomId          String?
  room            Room?    @relation(fields: [roomId], references: [id])

  // Status
  status          AppointmentStatus @default(PENDING)
  confirmedAt     DateTime?
  checkedInAt     DateTime?

  // Buffer times
  bufferBefore    Int      @default(0)  // minutes
  bufferAfter     Int      @default(0)  // minutes

  // Recurrence (RRULE format)
  recurrenceRule  String?  // e.g., "FREQ=WEEKLY;BYDAY=TU,TH;COUNT=10"
  recurrenceId    String?  // Groups recurring instances
  isRecurrenceException Boolean @default(false)

  // Multi-tenant
  organizationId  String

  // Audit
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  version         Int      @default(1)

  // Optimized indexes for calendar queries
  @@index([organizationId, providerId, startTime])
  @@index([organizationId, locationId, startTime])
  @@index([organizationId, startTime, endTime])
  @@index([patientId, startTime])
  @@index([status, startTime])
  @@index([recurrenceId])
}
```

### 2.2 Conflict Detection Algorithms

#### SQL-Based Overlap Detection:

```sql
-- Efficient overlap detection query
SELECT * FROM appointments
WHERE provider_id = $1
  AND organization_id = $2
  AND status NOT IN ('CANCELLED', 'NO_SHOW')
  AND start_time < $4  -- proposed end time
  AND end_time > $3    -- proposed start time
  AND id != $5;        -- exclude self when rescheduling
```

#### TypeScript Implementation:

```typescript
// utils/conflict-detection.ts
import { prisma } from '@/lib/prisma';

interface TimeSlot {
  startTime: Date;
  endTime: Date;
}

interface ConflictResult {
  hasConflict: boolean;
  conflicts: Appointment[];
  bufferConflicts: Appointment[];
}

export async function detectConflicts(
  organizationId: string,
  providerId: string,
  slot: TimeSlot,
  excludeAppointmentId?: string
): Promise<ConflictResult> {
  // Include buffer times in conflict check
  const bufferMinutes = 15; // configurable
  const bufferedStart = new Date(slot.startTime.getTime() - bufferMinutes * 60000);
  const bufferedEnd = new Date(slot.endTime.getTime() + bufferMinutes * 60000);

  const overlapping = await prisma.appointment.findMany({
    where: {
      organizationId,
      providerId,
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      startTime: { lt: slot.endTime },
      endTime: { gt: slot.startTime },
      ...(excludeAppointmentId && { id: { not: excludeAppointmentId } }),
    },
    orderBy: { startTime: 'asc' },
  });

  // Separate hard conflicts from buffer conflicts
  const hardConflicts = overlapping.filter(apt =>
    apt.startTime < slot.endTime && apt.endTime > slot.startTime
  );

  const bufferConflicts = overlapping.filter(apt =>
    !hardConflicts.includes(apt) &&
    apt.startTime < bufferedEnd && apt.endTime > bufferedStart
  );

  return {
    hasConflict: hardConflicts.length > 0,
    conflicts: hardConflicts,
    bufferConflicts,
  };
}
```

#### Interval Tree for In-Memory Conflict Detection (High-Volume):

```typescript
// utils/interval-tree.ts
interface Interval {
  start: number; // Unix timestamp
  end: number;
  data: any;
}

class IntervalTreeNode {
  center: number;
  intervals: Interval[] = [];
  left: IntervalTreeNode | null = null;
  right: IntervalTreeNode | null = null;

  constructor(intervals: Interval[]) {
    if (intervals.length === 0) return;

    const points = intervals.flatMap(i => [i.start, i.end]).sort((a, b) => a - b);
    this.center = points[Math.floor(points.length / 2)];

    const left: Interval[] = [];
    const right: Interval[] = [];

    for (const interval of intervals) {
      if (interval.end < this.center) {
        left.push(interval);
      } else if (interval.start > this.center) {
        right.push(interval);
      } else {
        this.intervals.push(interval);
      }
    }

    if (left.length > 0) this.left = new IntervalTreeNode(left);
    if (right.length > 0) this.right = new IntervalTreeNode(right);
  }

  query(start: number, end: number): Interval[] {
    const results: Interval[] = [];

    // Check intervals at this node
    for (const interval of this.intervals) {
      if (interval.start < end && interval.end > start) {
        results.push(interval);
      }
    }

    // Check children
    if (this.left && start < this.center) {
      results.push(...this.left.query(start, end));
    }
    if (this.right && end > this.center) {
      results.push(...this.right.query(start, end));
    }

    return results;
  }
}
```

### 2.3 Time Zone Handling

#### Best Practice: Store UTC, Display Local

```typescript
// utils/timezone.ts
import { formatInTimeZone, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

export function toUTC(localTime: Date, timezone: string): Date {
  return zonedTimeToUtc(localTime, timezone);
}

export function toLocal(utcTime: Date, timezone: string): Date {
  return utcToZonedTime(utcTime, timezone);
}

export function formatForDisplay(
  utcTime: Date,
  timezone: string,
  format: string = 'yyyy-MM-dd HH:mm'
): string {
  return formatInTimeZone(utcTime, timezone, format);
}

// API Input/Output transformation
export function normalizeAppointmentInput(
  input: AppointmentInput,
  locationTimezone: string
): { startTimeUtc: Date; endTimeUtc: Date } {
  const startTimeUtc = toUTC(new Date(input.startTime), locationTimezone);
  const endTimeUtc = new Date(startTimeUtc.getTime() + input.duration * 60000);

  return { startTimeUtc, endTimeUtc };
}

export function formatAppointmentResponse(
  appointment: Appointment,
  userTimezone?: string
): AppointmentResponse {
  const displayTimezone = userTimezone || appointment.location.timezone;

  return {
    ...appointment,
    startTimeLocal: formatForDisplay(appointment.startTime, displayTimezone),
    endTimeLocal: formatForDisplay(appointment.endTime, displayTimezone),
    timezone: displayTimezone,
  };
}
```

### 2.4 Recurring Appointment Patterns (RRULE)

#### Storage Strategy:

```typescript
// Store RRULE string, expand occurrences on-demand
const recurrenceRule = 'FREQ=WEEKLY;BYDAY=TU,TH;UNTIL=20250630T000000Z';

// For querying, store expanded occurrences with reference to master
model AppointmentOccurrence {
  id              String   @id @default(cuid())
  masterAppointmentId String
  masterAppointment   Appointment @relation(fields: [masterAppointmentId], references: [id])

  occurrenceDate  DateTime
  startTime       DateTime
  endTime         DateTime

  // Override fields (null means use master values)
  statusOverride  AppointmentStatus?
  notesOverride   String?

  @@unique([masterAppointmentId, occurrenceDate])
  @@index([occurrenceDate])
}
```

#### RRULE Expansion with rrule.js:

```typescript
// utils/recurrence.ts
import { RRule, RRuleSet, rrulestr } from 'rrule';

export function expandRecurrence(
  rruleString: string,
  dtstart: Date,
  rangeStart: Date,
  rangeEnd: Date
): Date[] {
  const rule = rrulestr(rruleString, { dtstart });
  return rule.between(rangeStart, rangeEnd, true);
}

export function createWeeklyRecurrence(
  daysOfWeek: number[], // 0=Monday, 6=Sunday
  count?: number,
  until?: Date
): string {
  const byweekday = daysOfWeek.map(d => ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'][d]);

  let rule = `FREQ=WEEKLY;BYDAY=${byweekday.join(',')}`;
  if (count) rule += `;COUNT=${count}`;
  if (until) rule += `;UNTIL=${until.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;

  return rule;
}
```

### 2.5 Buffer Time Between Appointments

```typescript
// services/scheduling.ts
interface BufferConfig {
  default: number;           // minutes
  byServiceType: Record<string, number>;
  byProvider: Record<string, number>;
  locationTravel: number;    // for multi-location providers
}

export function calculateEffectiveBuffer(
  service: Service,
  provider: Provider,
  config: BufferConfig
): { before: number; after: number } {
  const serviceBuffer = config.byServiceType[service.category] || 0;
  const providerBuffer = config.byProvider[provider.id] || 0;

  return {
    before: Math.max(config.default, serviceBuffer, providerBuffer),
    after: service.requiresCleanup ? 15 : Math.max(config.default, providerBuffer),
  };
}
```

---

## 3. API Design Patterns 2025

### 3.1 REST vs GraphQL vs tRPC

| Criteria | REST | GraphQL | tRPC |
|----------|------|---------|------|
| **Type Safety** | Manual (OpenAPI) | Schema-based | End-to-end auto |
| **Performance** | ~923ms avg | ~1864ms avg | Fastest |
| **Learning Curve** | Low | Medium-High | Low (TS devs) |
| **Public API** | Best | Good | Not recommended |
| **Flexibility** | Fixed responses | Client controls | Fixed |
| **N+1 Problem** | Manual handling | Requires DataLoader | Not applicable |

#### Recommendation for Medical Spa Platform:

**Use tRPC for internal APIs** (admin dashboard, mobile app) due to:
- 35-40% faster development vs REST
- 60% reduction in development errors
- End-to-end type safety without code generation
- Perfect fit for TypeScript-first stack

**Keep REST for public/partner APIs** (webhook receivers, third-party integrations)

### 3.2 Pagination Strategies

#### Cursor-Based Pagination (Recommended):

```typescript
// types/pagination.ts
import { z } from 'zod';

export const PaginationInputSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  direction: z.enum(['forward', 'backward']).default('forward'),
});

export interface PaginatedResponse<T> {
  data: T[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
    totalCount?: number; // Optional, expensive for large datasets
  };
}

// Implementation
export async function paginateAppointments(
  params: z.infer<typeof PaginationInputSchema>,
  filters: AppointmentFilters
): Promise<PaginatedResponse<Appointment>> {
  const { cursor, limit, direction } = params;

  // Decode cursor (base64 encoded: id:startTime)
  let cursorData: { id: string; startTime: Date } | undefined;
  if (cursor) {
    const decoded = Buffer.from(cursor, 'base64').toString('utf8');
    const [id, startTime] = decoded.split(':');
    cursorData = { id, startTime: new Date(startTime) };
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      ...filters,
      ...(cursorData && {
        OR: [
          { startTime: { gt: cursorData.startTime } },
          {
            startTime: cursorData.startTime,
            id: { gt: cursorData.id },
          },
        ],
      }),
    },
    orderBy: [{ startTime: 'asc' }, { id: 'asc' }],
    take: limit + 1, // Fetch one extra to check for next page
  });

  const hasMore = appointments.length > limit;
  const data = hasMore ? appointments.slice(0, -1) : appointments;

  return {
    data,
    pageInfo: {
      hasNextPage: hasMore,
      hasPreviousPage: !!cursor,
      startCursor: data[0] ? encodeCursor(data[0]) : null,
      endCursor: data.length > 0 ? encodeCursor(data[data.length - 1]) : null,
    },
  };
}

function encodeCursor(appointment: Appointment): string {
  return Buffer.from(`${appointment.id}:${appointment.startTime.toISOString()}`).toString('base64');
}
```

### 3.3 Filtering and Sorting Patterns

```typescript
// schemas/appointment-filters.ts
import { z } from 'zod';

export const AppointmentFiltersSchema = z.object({
  // Date range (required for calendar queries)
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),

  // Entity filters
  providerId: z.string().cuid().optional(),
  providerIds: z.array(z.string().cuid()).optional(),
  patientId: z.string().cuid().optional(),
  locationId: z.string().cuid().optional(),
  serviceId: z.string().cuid().optional(),

  // Status filters
  status: z.enum(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED']).optional(),
  statuses: z.array(z.enum(['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED'])).optional(),

  // Sorting
  sortBy: z.enum(['startTime', 'createdAt', 'patientName']).default('startTime'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
}).refine(
  data => data.endDate >= data.startDate,
  { message: 'endDate must be after startDate' }
).refine(
  data => {
    const diffDays = (data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 90; // Max 90 day range
  },
  { message: 'Date range cannot exceed 90 days' }
);
```

### 3.4 Batch Operations

```typescript
// routes/appointments/batch.ts
import { z } from 'zod';

const BatchUpdateSchema = z.object({
  appointmentIds: z.array(z.string().cuid()).min(1).max(50),
  updates: z.object({
    status: z.enum(['CONFIRMED', 'CANCELLED']).optional(),
    providerId: z.string().cuid().optional(),
  }),
});

export async function batchUpdateAppointments(
  input: z.infer<typeof BatchUpdateSchema>,
  userId: string
) {
  const results = await prisma.$transaction(async (tx) => {
    const outcomes: { id: string; success: boolean; error?: string }[] = [];

    for (const id of input.appointmentIds) {
      try {
        // Validate each appointment can be updated
        const appointment = await tx.appointment.findUnique({ where: { id } });

        if (!appointment) {
          outcomes.push({ id, success: false, error: 'Not found' });
          continue;
        }

        if (appointment.status === 'COMPLETED') {
          outcomes.push({ id, success: false, error: 'Cannot modify completed appointment' });
          continue;
        }

        await tx.appointment.update({
          where: { id },
          data: { ...input.updates, updatedAt: new Date() },
        });

        outcomes.push({ id, success: true });
      } catch (error) {
        outcomes.push({ id, success: false, error: 'Update failed' });
      }
    }

    return outcomes;
  });

  return {
    total: input.appointmentIds.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  };
}
```

### 3.5 Optimistic Updates Pattern

```typescript
// Client-side pattern (React Query example)
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAppointment,

    // Optimistic update
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['appointments'] });

      // Snapshot previous value
      const previousAppointments = queryClient.getQueryData(['appointments']);

      // Optimistically update
      queryClient.setQueryData(['appointments'], (old: Appointment[]) =>
        old.map(apt => apt.id === newData.id ? { ...apt, ...newData } : apt)
      );

      return { previousAppointments };
    },

    // Rollback on error
    onError: (err, newData, context) => {
      queryClient.setQueryData(['appointments'], context?.previousAppointments);
    },

    // Refetch on success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
```

---

## 4. Competitor Analysis

### 4.1 Zenoti

**API Architecture:**
- RESTful API with clear resource hierarchy
- Sequential booking flow: Create -> Get Slots -> Reserve -> Confirm
- Separate APIs for service booking vs. class booking

**Key Patterns:**
```
POST /bookings              # Create booking shell
GET  /bookings/{id}/slots   # Get available slots
POST /bookings/{id}/reserve # Reserve a slot (temporary hold)
POST /bookings/{id}/confirm # Confirm booking
PUT  /bookings/{id}         # Reschedule
DELETE /bookings/{id}       # Cancel
```

**Strengths:**
- Clear state machine for booking flow
- Support for employee block-outs
- Holiday/leave calendar integration

### 4.2 Boulevard

**API Architecture:**
- GraphQL API (not REST)
- TypeScript SDK with generated bindings
- "Precision Scheduling" optimization

**Key Patterns:**
```graphql
query GetAvailability {
  availableTimeSlots(
    serviceId: "...",
    staffId: "...",
    dateRange: { start: "...", end: "..." }
  ) {
    startAt
    endAt
    staffVariant { name }
  }
}

mutation CreateAppointment {
  createAppointment(input: {
    clientId: "...",
    cartId: "...",
  }) {
    appointment { id status }
  }
}
```

**Strengths:**
- Cart-based booking (multiple services)
- Staff variant support
- Integrated payments

### 4.3 Mangomint

**Architecture:**
- HIPAA-compliant EMR system
- Zapier integration for extensibility
- Focus on client profile management

**Key Features:**
- 7+ year data retention (compliance)
- Detailed treatment/SOAP notes
- Membership management

### 4.4 Jane App

**Architecture:**
- Single-tenant (each clinic has isolated database)
- OAuth 2.0 PKCE authentication
- Regional data centers (USA, Canada, UK, Australia)

**Key Patterns:**
- Manifest API for extensions
- Context variables in URLs
- Limited public API (partner-focused)

### 4.5 Vagaro

**Architecture:**
- Widget-based booking embeds
- Multi-location sync ("Flagship Syncing")
- Marketplace discovery

**Key Features:**
- Real-time calendar sync (personal + business)
- Social media booking integrations
- Data lakes for enterprise analytics

### Competitive Feature Matrix:

| Feature | Zenoti | Boulevard | Mangomint | Jane | Vagaro |
|---------|--------|-----------|-----------|------|--------|
| API Type | REST | GraphQL | REST/Zapier | OAuth REST | Widget |
| Multi-location | Yes | Yes | Yes | Limited | Yes |
| HIPAA | Yes | Yes | Yes | Yes | Limited |
| Recurring Appts | Yes | Yes | Yes | Yes | Yes |
| Group Booking | Yes | Yes | No | Yes | Yes |
| Waitlist | Yes | Yes | Yes | Yes | Yes |

---

## 5. Security Best Practices

### 5.1 Row-Level Security for Multi-Tenant

```sql
-- PostgreSQL RLS policy setup
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Policy for tenant isolation
CREATE POLICY tenant_isolation ON patients
  USING (organization_id = current_setting('app.current_organization_id')::text);

-- Policy for role-based access
CREATE POLICY provider_access ON patients
  FOR SELECT
  USING (
    organization_id = current_setting('app.current_organization_id')::text
    AND (
      current_setting('app.user_role') = 'admin'
      OR id IN (
        SELECT patient_id FROM appointments
        WHERE provider_id = current_setting('app.current_user_id')::text
      )
    )
  );
```

```typescript
// middleware/tenant-context.ts
import { Hono } from 'hono';
import { prisma } from '@/lib/prisma';

export const tenantMiddleware = async (c: Context, next: Next) => {
  const organizationId = c.get('organizationId');
  const userId = c.get('userId');
  const userRole = c.get('userRole');

  // Set PostgreSQL session variables for RLS
  await prisma.$executeRaw`
    SELECT set_config('app.current_organization_id', ${organizationId}, true);
    SELECT set_config('app.current_user_id', ${userId}, true);
    SELECT set_config('app.user_role', ${userRole}, true);
  `;

  await next();
};
```

### 5.2 API Rate Limiting Patterns

```typescript
// middleware/rate-limit.ts
import { rateLimiter } from 'hono-rate-limiter';

// Tiered rate limiting
const rateLimits = {
  public: { windowMs: 60000, limit: 30 },
  authenticated: { windowMs: 60000, limit: 100 },
  admin: { windowMs: 60000, limit: 500 },
  burst: { windowMs: 1000, limit: 10 }, // Prevent DoS
};

export const createRateLimiter = (tier: keyof typeof rateLimits) => {
  return rateLimiter({
    windowMs: rateLimits[tier].windowMs,
    limit: rateLimits[tier].limit,
    standardHeaders: 'draft-7',
    keyGenerator: (c) => {
      // Use user ID for authenticated, IP for public
      return c.get('userId') || c.req.header('x-forwarded-for') || 'unknown';
    },
    handler: (c) => {
      return c.json({
        error: 'Too many requests',
        retryAfter: c.res.headers.get('Retry-After'),
      }, 429);
    },
  });
};
```

### 5.3 Input Validation for Medical Data

```typescript
// schemas/patient.ts
import { z } from 'zod';

// Phone number validation
const PhoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164)')
  .transform(val => val.replace(/\D/g, ''));

// Date of birth validation (not future, not too old)
const DateOfBirthSchema = z.coerce.date()
  .refine(date => date <= new Date(), 'Date of birth cannot be in the future')
  .refine(date => {
    const age = (Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return age < 150;
  }, 'Invalid date of birth');

// Medical record number format
const MRNSchema = z.string()
  .regex(/^MRN-\d{4}-\d{6}$/, 'Invalid MRN format');

// Allergy severity validation
const AllergySchema = z.object({
  allergen: z.string().min(1).max(100),
  reaction: z.string().min(1).max(500),
  severity: z.enum(['mild', 'moderate', 'severe', 'life-threatening']),
  onsetDate: z.coerce.date().optional(),
  verifiedBy: z.string().cuid().optional(),
});

// Complete patient input schema
export const PatientCreateSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  dateOfBirth: DateOfBirthSchema,
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  email: z.string().email().toLowerCase(),
  phone: PhoneSchema,

  // Optional fields
  middleName: z.string().max(100).optional(),
  preferredName: z.string().max(100).optional(),

  // Medical (validated but encrypted before storage)
  allergies: z.array(AllergySchema).optional(),
  medications: z.array(z.object({
    name: z.string().min(1).max(200),
    dosage: z.string().max(100),
    frequency: z.string().max(100),
  })).optional(),
}).strict(); // Reject unknown fields
```

### 5.4 PHI Access Logging Requirements

```typescript
// middleware/phi-audit.ts
import { Hono } from 'hono';

const PHI_ENDPOINTS = [
  '/patients/:id',
  '/patients/:id/profile',
  '/patients/:id/medical-history',
  '/appointments/:id/notes',
];

export const phiAuditMiddleware = async (c: Context, next: Next) => {
  const startTime = Date.now();
  const path = c.req.path;
  const method = c.req.method;

  // Check if this is a PHI endpoint
  const isPHIAccess = PHI_ENDPOINTS.some(pattern =>
    new RegExp(pattern.replace(/:id/g, '[^/]+')).test(path)
  );

  await next();

  if (isPHIAccess) {
    const patientId = c.req.param('id');
    const userId = c.get('userId');
    const statusCode = c.res.status;

    // Log asynchronously (don't block response)
    queueMicrotask(async () => {
      await prisma.patientAuditLog.create({
        data: {
          patientId,
          action: method === 'GET' ? 'VIEW' : method === 'POST' ? 'CREATE' : 'UPDATE',
          resourceType: extractResourceType(path),
          userId,
          userRole: c.get('userRole'),
          userIp: c.req.header('x-forwarded-for'),
          userAgent: c.req.header('user-agent'),
          timestamp: new Date(),
          responseStatus: statusCode,
          durationMs: Date.now() - startTime,
        },
      });
    });
  }
};
```

---

## 6. Performance Considerations

### 6.1 Database Indexing for Calendar Queries

```sql
-- Essential indexes for appointment queries
CREATE INDEX idx_appointments_org_provider_time
  ON appointments(organization_id, provider_id, start_time);

CREATE INDEX idx_appointments_org_location_time
  ON appointments(organization_id, location_id, start_time);

-- Composite index for date range queries
CREATE INDEX idx_appointments_time_range
  ON appointments(organization_id, start_time, end_time)
  WHERE status NOT IN ('CANCELLED');

-- BRIN index for time-series data (very large tables)
CREATE INDEX idx_appointments_brin_time
  ON appointments USING BRIN (start_time);

-- Partial index for active appointments only
CREATE INDEX idx_appointments_active
  ON appointments(organization_id, provider_id, start_time)
  WHERE status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN');

-- Index for patient lookup
CREATE INDEX idx_appointments_patient
  ON appointments(patient_id, start_time DESC);
```

### 6.2 Caching Strategies

```typescript
// lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

interface CacheConfig {
  ttl: number; // seconds
  staleWhileRevalidate?: number;
}

const CACHE_CONFIGS: Record<string, CacheConfig> = {
  'provider-availability': { ttl: 60, staleWhileRevalidate: 30 },
  'services-list': { ttl: 300 },
  'locations-list': { ttl: 600 },
  'appointment-slots': { ttl: 30 }, // Short TTL for availability
};

export async function cacheGet<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: CacheConfig
): Promise<T> {
  const cached = await redis.get(key);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const age = (Date.now() - timestamp) / 1000;

    // Return cached data, refresh in background if stale
    if (config.staleWhileRevalidate && age > config.ttl) {
      queueMicrotask(async () => {
        const fresh = await fetcher();
        await cacheSet(key, fresh, config);
      });
    }

    return data;
  }

  const fresh = await fetcher();
  await cacheSet(key, fresh, config);
  return fresh;
}

async function cacheSet<T>(key: string, data: T, config: CacheConfig) {
  await redis.setex(
    key,
    config.ttl + (config.staleWhileRevalidate || 0),
    JSON.stringify({ data, timestamp: Date.now() })
  );
}

// Cache invalidation patterns
export async function invalidateCache(patterns: string[]) {
  for (const pattern of patterns) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

// Usage example
export async function getAvailableSlots(
  providerId: string,
  date: string
): Promise<TimeSlot[]> {
  const cacheKey = `slots:${providerId}:${date}`;

  return cacheGet(
    cacheKey,
    () => calculateAvailableSlots(providerId, new Date(date)),
    CACHE_CONFIGS['appointment-slots']
  );
}
```

### 6.3 Query Optimization for Date Ranges

```typescript
// Efficient calendar query patterns
export async function getCalendarData(
  organizationId: string,
  providerIds: string[],
  startDate: Date,
  endDate: Date
): Promise<CalendarData> {
  // Use Promise.all for parallel queries
  const [appointments, breaks, availability] = await Promise.all([
    // Appointments query with selective fields
    prisma.appointment.findMany({
      where: {
        organizationId,
        providerId: { in: providerIds },
        startTime: { gte: startDate, lt: endDate },
        status: { notIn: ['CANCELLED'] },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        providerId: true,
        patient: {
          select: { id: true, firstName: true, lastName: true },
        },
        service: {
          select: { id: true, name: true, color: true },
        },
      },
      orderBy: { startTime: 'asc' },
    }),

    // Provider breaks
    prisma.providerBreak.findMany({
      where: {
        providerId: { in: providerIds },
        startTime: { gte: startDate, lt: endDate },
      },
    }),

    // Availability (cached query)
    getProviderAvailability(providerIds, startDate, endDate),
  ]);

  return { appointments, breaks, availability };
}
```

### 6.4 Connection Pooling

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Connection pool configuration (in DATABASE_URL or env)
// postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=30

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

---

## 7. Implementation Recommendations

### 7.1 Hono API Structure

```
src/
├── routes/
│   ├── patients/
│   │   ├── index.ts          # Router setup
│   │   ├── handlers.ts       # Route handlers
│   │   ├── schemas.ts        # Zod schemas
│   │   └── services.ts       # Business logic
│   ├── appointments/
│   │   ├── index.ts
│   │   ├── handlers.ts
│   │   ├── schemas.ts
│   │   ├── services.ts
│   │   └── conflict-detection.ts
│   └── index.ts              # Main router
├── middleware/
│   ├── auth.ts
│   ├── tenant.ts
│   ├── rate-limit.ts
│   ├── audit.ts
│   └── error-handler.ts
├── lib/
│   ├── prisma.ts
│   ├── redis.ts
│   ├── encryption.ts
│   └── timezone.ts
├── types/
│   └── index.ts
└── index.ts                  # App entry point
```

### 7.2 Testing Strategy with Vitest

```typescript
// __tests__/appointments/conflict-detection.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { detectConflicts } from '@/services/appointments/conflict-detection';
import { prisma } from '@/lib/prisma';

describe('Appointment Conflict Detection', () => {
  beforeEach(async () => {
    // Reset test data
    await prisma.appointment.deleteMany({
      where: { organizationId: 'test-org' },
    });
  });

  it('should detect overlapping appointments', async () => {
    // Create existing appointment: 10:00 - 11:00
    await prisma.appointment.create({
      data: {
        organizationId: 'test-org',
        providerId: 'provider-1',
        patientId: 'patient-1',
        startTime: new Date('2025-01-15T10:00:00Z'),
        endTime: new Date('2025-01-15T11:00:00Z'),
        status: 'CONFIRMED',
      },
    });

    // Try to book: 10:30 - 11:30 (overlaps)
    const result = await detectConflicts(
      'test-org',
      'provider-1',
      {
        startTime: new Date('2025-01-15T10:30:00Z'),
        endTime: new Date('2025-01-15T11:30:00Z'),
      }
    );

    expect(result.hasConflict).toBe(true);
    expect(result.conflicts).toHaveLength(1);
  });

  it('should allow adjacent appointments', async () => {
    // Create existing appointment: 10:00 - 11:00
    await prisma.appointment.create({
      data: {
        organizationId: 'test-org',
        providerId: 'provider-1',
        patientId: 'patient-1',
        startTime: new Date('2025-01-15T10:00:00Z'),
        endTime: new Date('2025-01-15T11:00:00Z'),
        status: 'CONFIRMED',
      },
    });

    // Try to book: 11:00 - 12:00 (adjacent, no overlap)
    const result = await detectConflicts(
      'test-org',
      'provider-1',
      {
        startTime: new Date('2025-01-15T11:00:00Z'),
        endTime: new Date('2025-01-15T12:00:00Z'),
      }
    );

    expect(result.hasConflict).toBe(false);
  });

  it('should ignore cancelled appointments', async () => {
    await prisma.appointment.create({
      data: {
        organizationId: 'test-org',
        providerId: 'provider-1',
        patientId: 'patient-1',
        startTime: new Date('2025-01-15T10:00:00Z'),
        endTime: new Date('2025-01-15T11:00:00Z'),
        status: 'CANCELLED',
      },
    });

    const result = await detectConflicts(
      'test-org',
      'provider-1',
      {
        startTime: new Date('2025-01-15T10:00:00Z'),
        endTime: new Date('2025-01-15T11:00:00Z'),
      }
    );

    expect(result.hasConflict).toBe(false);
  });
});
```

### 7.3 Migration Strategy

```typescript
// prisma/migrations/YYYYMMDD_add_multi_tenant_rls/migration.sql

-- Enable RLS on all tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create base policy
CREATE POLICY tenant_isolation_patients ON patients
  USING (organization_id = current_setting('app.current_organization_id', true)::text);

CREATE POLICY tenant_isolation_appointments ON appointments
  USING (organization_id = current_setting('app.current_organization_id', true)::text);

-- Add organization_id to existing tables
ALTER TABLE patients ADD COLUMN organization_id TEXT REFERENCES organizations(id);
ALTER TABLE appointments ADD COLUMN organization_id TEXT REFERENCES organizations(id);

-- Backfill organization_id (if needed)
UPDATE patients SET organization_id = 'default-org' WHERE organization_id IS NULL;
UPDATE appointments SET organization_id = 'default-org' WHERE organization_id IS NULL;

-- Make organization_id required
ALTER TABLE patients ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE appointments ALTER COLUMN organization_id SET NOT NULL;
```

---

## 8. Code Patterns & Examples

### 8.1 Complete Hono Route Example

```typescript
// routes/appointments/index.ts
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '@/middleware/auth';
import { tenantMiddleware } from '@/middleware/tenant';
import { rateLimiter } from '@/middleware/rate-limit';
import * as handlers from './handlers';
import * as schemas from './schemas';

const appointments = new Hono();

// Apply middleware
appointments.use('*', authMiddleware);
appointments.use('*', tenantMiddleware);
appointments.use('*', rateLimiter('authenticated'));

// List appointments with filtering
appointments.get(
  '/',
  zValidator('query', schemas.AppointmentFiltersSchema),
  handlers.listAppointments
);

// Get single appointment
appointments.get(
  '/:id',
  zValidator('param', z.object({ id: z.string().cuid() })),
  handlers.getAppointment
);

// Create appointment
appointments.post(
  '/',
  zValidator('json', schemas.AppointmentCreateSchema),
  handlers.createAppointment
);

// Update appointment
appointments.put(
  '/:id',
  zValidator('param', z.object({ id: z.string().cuid() })),
  zValidator('json', schemas.AppointmentUpdateSchema),
  handlers.updateAppointment
);

// Cancel appointment
appointments.post(
  '/:id/cancel',
  zValidator('param', z.object({ id: z.string().cuid() })),
  zValidator('json', schemas.CancelAppointmentSchema),
  handlers.cancelAppointment
);

// Reschedule appointment
appointments.post(
  '/:id/reschedule',
  zValidator('param', z.object({ id: z.string().cuid() })),
  zValidator('json', schemas.RescheduleAppointmentSchema),
  handlers.rescheduleAppointment
);

// Check availability
appointments.get(
  '/availability',
  zValidator('query', schemas.AvailabilityQuerySchema),
  handlers.checkAvailability
);

export { appointments };
```

### 8.2 Service Layer Pattern

```typescript
// routes/appointments/services.ts
import { prisma } from '@/lib/prisma';
import { detectConflicts } from './conflict-detection';
import { invalidateCache } from '@/lib/cache';
import type { AppointmentCreate, AppointmentUpdate } from './schemas';

export class AppointmentService {
  async create(
    organizationId: string,
    input: AppointmentCreate,
    userId: string
  ) {
    // 1. Validate slot availability
    const conflicts = await detectConflicts(
      organizationId,
      input.providerId,
      { startTime: input.startTime, endTime: input.endTime }
    );

    if (conflicts.hasConflict) {
      throw new ConflictError('Time slot is not available', conflicts.conflicts);
    }

    // 2. Create appointment in transaction
    const appointment = await prisma.$transaction(async (tx) => {
      // Create the appointment
      const apt = await tx.appointment.create({
        data: {
          organizationId,
          ...input,
          status: 'PENDING',
          createdBy: userId,
        },
        include: {
          patient: true,
          provider: true,
          service: true,
          location: true,
        },
      });

      // Create audit log
      await tx.appointmentAuditLog.create({
        data: {
          appointmentId: apt.id,
          action: 'CREATE',
          userId,
          newValue: apt,
        },
      });

      return apt;
    });

    // 3. Invalidate relevant caches
    await invalidateCache([
      `slots:${input.providerId}:*`,
      `appointments:${organizationId}:*`,
    ]);

    // 4. Queue notifications (async)
    await this.queueNotifications(appointment);

    return appointment;
  }

  async reschedule(
    appointmentId: string,
    newSlot: { startTime: Date; endTime: Date },
    userId: string,
    reason?: string
  ) {
    const existing = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!existing) {
      throw new NotFoundError('Appointment not found');
    }

    if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
      throw new ValidationError('Cannot reschedule completed or cancelled appointment');
    }

    // Check new slot availability
    const conflicts = await detectConflicts(
      existing.organizationId,
      existing.providerId,
      newSlot,
      appointmentId // Exclude self
    );

    if (conflicts.hasConflict) {
      throw new ConflictError('New time slot is not available', conflicts.conflicts);
    }

    return prisma.$transaction(async (tx) => {
      const oldValues = {
        startTime: existing.startTime,
        endTime: existing.endTime,
      };

      const updated = await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          startTime: newSlot.startTime,
          endTime: newSlot.endTime,
          rescheduledAt: new Date(),
          rescheduledBy: userId,
          rescheduledReason: reason,
          version: { increment: 1 },
        },
      });

      await tx.appointmentAuditLog.create({
        data: {
          appointmentId,
          action: 'RESCHEDULE',
          userId,
          oldValue: oldValues,
          newValue: { startTime: newSlot.startTime, endTime: newSlot.endTime },
          reason,
        },
      });

      return updated;
    });
  }

  private async queueNotifications(appointment: any) {
    // Queue confirmation email/SMS
    // This would use a job queue like BullMQ
  }
}
```

### 8.3 Error Handling Pattern

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, conflicts?: any) {
    super(message, 'CONFLICT', 409, { conflicts });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

// middleware/error-handler.ts
import { Context } from 'hono';
import { AppError } from '@/lib/errors';
import { ZodError } from 'zod';

export const errorHandler = (err: Error, c: Context) => {
  // Log error (but not to console in production)
  console.error(err);

  if (err instanceof AppError) {
    return c.json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    }, err.statusCode);
  }

  if (err instanceof ZodError) {
    return c.json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.errors,
      },
    }, 400);
  }

  // Unknown error - don't leak details
  return c.json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  }, 500);
};
```

---

## Sources

### HIPAA Compliance
- [HIPAA Compliance for APIs: Technical Implementation Guide](https://intuitionlabs.ai/articles/hipaa-compliant-api-guide)
- [HIPAA Compliant API: A Complete Guide](https://arkenea.com/blog/hipaa-api/)
- [Building HIPAA Compliant APIs](https://www.moesif.com/blog/business/compliance/Building-HIPAA-Compliant-APIs/)
- [What Is a HIPAA API in 2025?](https://www.atlantic.net/hipaa-compliant-hosting/hipaa-api-explained/)

### Scheduling & Calendar APIs
- [OnSched Online Booking API](https://www.onsched.com/)
- [Cronofy Scheduling API](https://www.cronofy.com/developer)
- [Appointment Scheduling API Guide](https://gotapi.com/appointment-scheduling-api/)
- [Calendar Events and RRULEs](https://www.nylas.com/blog/calendar-events-rrules/)

### Competitor APIs
- [Zenoti API Documentation](https://docs.zenoti.com/docs/overview)
- [Boulevard SDK](https://boulevard.github.io/book-sdk/)
- [Mangomint HIPAA Compliance](https://www.mangomint.com/blog/mangomint-is-now-hipaa-compliant/)
- [Jane Developer Platform](https://developers.jane.app/docs/getting-started)

### API Design
- [REST vs GraphQL vs tRPC](https://directus.io/blog/rest-graphql-tprc)
- [tRPC vs GraphQL Comparison](https://betterstack.com/community/guides/scaling-nodejs/trpc-vs-graphql/)
- [API Pagination Best Practices](https://engineeringatscale.substack.com/p/api-pagination-limit-offset-vs-cursor)
- [Evolving API Pagination at Slack](https://slack.engineering/evolving-api-pagination-at-slack/)

### Database & Performance
- [PostgreSQL Indexing Best Practices](https://www.mydbops.com/blog/postgresql-indexing-best-practices-guide/)
- [Multi-tenant Data Isolation with PostgreSQL RLS](https://aws.amazon.com/blogs/database/multi-tenant-data-isolation-with-postgresql-row-level-security/)
- [Postgres RLS Implementation Guide](https://www.permit.io/blog/postgres-rls-implementation-guide)
- [Database Caching Strategies Using Redis](https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html)

### Patient Data Management
- [Patient Deduplication Architectures](https://www.medplum.com/docs/fhir-datastore/patient-deduplication)
- [FHIR Patient Resource](https://www.hl7.org/fhir/patient.html)
- [Patient Matching Algorithms](https://www.clinfowiki.org/wiki/index.php/Patient_Matching_Algorithms)

### Hono Framework
- [Hono Best Practices](https://hono.dev/docs/guides/best-practices)
- [Hono Middleware Guide](https://hono.dev/docs/guides/middleware)
- [Building Production-Ready Hono APIs](https://medium.com/@yannick.burkard/building-production-ready-hono-apis-a-modern-architecture-guide-fed8a415ca96)

### Security & Rate Limiting
- [10 Best Practices for API Rate Limiting](https://www.getknit.dev/blog/10-best-practices-for-api-rate-limiting-and-throttling)
- [API Rate Limiting Explained](https://tyk.io/learning-center/api-rate-limiting/)

### Scheduling Algorithms
- [Appointment Conflict Detection](https://www.geeksforgeeks.org/dsa/given-n-appointments-find-conflicting-appointments/)
- [Buffer Time Between Appointments](https://acuityscheduling.com/learn/adding-appointment-padding)
- [Timezone Handling in Scheduling](https://medium.com/@saniaalikhan224/mastering-timezones-in-your-appointment-app-a-backend-guide-089cddb562c2)

---

## Document Information

- **Created**: December 2025
- **Author**: Backend Architecture Research
- **Stack**: Hono, PostgreSQL, Prisma, Zod, Vitest
- **Last Updated**: December 18, 2025
