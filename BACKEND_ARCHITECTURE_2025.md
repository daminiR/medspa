# Medical Spa Platform - Backend Architecture 2025

## Executive Summary

This document outlines a production-ready backend architecture for the Medical Spa Patient Portal, designed to integrate seamlessly with the existing admin portal while following 2025 best practices for security, scalability, and HIPAA compliance.

---

## Table of Contents

1. [Technology Stack Overview](#1-technology-stack-overview)
2. [Database Architecture](#2-database-architecture)
3. [Authentication System](#3-authentication-system)
4. [API Design](#4-api-design)
5. [Real-Time Communication](#5-real-time-communication)
6. [File Upload & Storage](#6-file-upload--storage)
7. [Caching Strategy](#7-caching-strategy)
8. [Security & HIPAA Compliance](#8-security--hipaa-compliance)
9. [Integration Architecture](#9-integration-architecture)
10. [Migration Strategy](#10-migration-strategy)
11. [Deployment & Infrastructure](#11-deployment--infrastructure)
12. [Monitoring & Observability](#12-monitoring--observability)

---

## 1. Technology Stack Overview

### Recommended Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Framework** | Next.js 14/15 (App Router) | Already in use; Server Actions for mutations, Route Handlers for public APIs |
| **Database** | PostgreSQL + Prisma ORM | Industry standard, battle-tested, excellent tooling, massive community |
| **Authentication** | Auth.js v5 + Custom Passkey Implementation | Zero vendor lock-in, existing passkey support, HIPAA-compliant control |
| **Real-time** | Server-Sent Events (SSE) | Simpler than WebSockets, auto-reconnect, sufficient for notifications |
| **Caching** | Vercel KV (Upstash Redis) | Edge-optimized, serverless-friendly, sub-millisecond latency |
| **File Storage** | Vercel Blob + AWS S3 | HIPAA-eligible, encrypted at rest, pre-signed URLs |
| **Payments** | Stripe (existing) | Already integrated, PCI compliant |
| **SMS/Communications** | Twilio (existing) | Already integrated, HIPAA-compliant BAA available |

### Why Prisma for 2025

**Prisma ORM** is the industry standard choice for this project:

1. **Battle-Tested**: Used by Netflix, Nvidia, Miro, and thousands of production apps
2. **Massive Community**: 40,000+ GitHub stars, extensive documentation, easy to find help
3. **Excellent Tooling**: Prisma Studio for data visualization, robust migrations, introspection
4. **Type Safety**: Auto-generated TypeScript types from schema - zero runtime overhead
5. **Team Scalability**: More developers know Prisma = easier hiring and maintenance
6. **Enterprise Ready**: Proven at scale for healthcare and HIPAA-compliant applications

```prisma
// Example Prisma schema (healthcare-optimized)
// schema.prisma

model Patient {
  id              String    @id @default(uuid())
  firstName       String    @map("first_name")
  lastName        String    @map("last_name")
  email           String?   @unique
  phone           String?
  dateOfBirth     DateTime? @map("date_of_birth")
  medicalHistory  Json?     @map("medical_history") // Encrypted JSON
  smsOptIn        Boolean   @default(false) @map("sms_opt_in")
  marketingOptIn  Boolean   @default(false) @map("marketing_opt_in")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  appointments    Appointment[]
  treatments      Treatment[]

  @@map("patients")
}
```

---

## 2. Database Architecture

### 2.1 Schema Design

```
medical_spa_db
|-- Core Tables
|   |-- users                    # Base user table (admin, staff, patients)
|   |-- patients                 # Extended patient data
|   |-- practitioners            # Staff/providers
|   |-- locations                # Clinic locations
|
|-- Scheduling
|   |-- appointments             # Core appointments
|   |-- appointment_history      # Audit trail
|   |-- breaks                   # Practitioner breaks
|   |-- shifts                   # Work schedules
|   |-- waitlist_entries         # Waitlist management
|   |-- group_bookings           # Group appointment packages
|
|-- Services & Products
|   |-- services                 # Treatment services
|   |-- service_categories       # Categorization
|   |-- packages                 # Service bundles
|   |-- resources                # Equipment/rooms
|
|-- Communication
|   |-- messages                 # SMS/Email records
|   |-- message_templates        # Reusable templates
|   |-- notifications            # Push/in-app notifications
|
|-- Billing & Payments
|   |-- invoices                 # Patient invoices
|   |-- payments                 # Payment records
|   |-- credits                  # Account credits
|   |-- memberships              # Recurring memberships
|
|-- Clinical
|   |-- consent_forms            # Signed consents
|   |-- photos                   # Before/after photos (metadata)
|   |-- treatment_notes          # Clinical documentation
|   |-- medical_alerts           # Patient allergies/conditions
|
|-- Security & Audit
    |-- sessions                 # Active sessions
    |-- passkey_credentials      # WebAuthn credentials
    |-- audit_logs               # HIPAA audit trail
    |-- api_keys                 # External integrations
```

### 2.2 Database Schema (Prisma)

```prisma
// /prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums
enum UserRole {
  admin
  practitioner
  patient
  staff
}

enum AppointmentStatus {
  scheduled
  confirmed
  arrived
  in_progress
  completed
  cancelled
  no_show
}

// Users (base table)
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  phone         String?
  firstName     String    @map("first_name")
  lastName      String    @map("last_name")
  role          UserRole  @default(patient)
  avatarUrl     String?   @map("avatar_url")
  isActive      Boolean   @default(true) @map("is_active")
  emailVerified DateTime? @map("email_verified")
  phoneVerified DateTime? @map("phone_verified")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  patient      Patient?
  practitioner Practitioner?
  passkeys     PasskeyCredential[]
  auditLogs    AuditLog[]

  @@map("users")
}

// Patients (extends users)
model Patient {
  id                      String    @id @default(uuid())
  userId                  String    @unique @map("user_id")
  dateOfBirth             DateTime? @map("date_of_birth")
  gender                  String?
  address                 Json?     // { street, city, state, zipCode }
  emergencyContact        Json?     @map("emergency_contact")
  medicalHistoryEncrypted String?   @map("medical_history_encrypted") // AES-256
  allergies               Json?     // string[]
  smsOptIn                Boolean   @default(true) @map("sms_opt_in")
  marketingOptIn          Boolean   @default(false) @map("marketing_opt_in")
  preferredLocationId     String?   @map("preferred_location_id")
  preferredPractitionerId String?   @map("preferred_practitioner_id")
  noShowCount             Int       @default(0) @map("no_show_count")
  creditBalance           Decimal   @default(0) @map("credit_balance") @db.Decimal(10, 2)
  createdAt               DateTime  @default(now()) @map("created_at")
  updatedAt               DateTime  @updatedAt @map("updated_at")

  user         User          @relation(fields: [userId], references: [id])
  appointments Appointment[]

  @@map("patients")
}

// Practitioners
model Practitioner {
  id                     String   @id @default(uuid())
  userId                 String   @unique @map("user_id")
  initials               String?
  discipline             String?
  specializations        Json?    // string[]
  certifications         Json?    // string[]
  bio                    String?
  calendarColor          String?  @map("calendar_color")
  isAcceptingNewPatients Boolean  @default(true) @map("is_accepting_new_patients")
  staggerBookingMinutes  Int?     @map("stagger_booking_minutes")
  createdAt              DateTime @default(now()) @map("created_at")
  updatedAt              DateTime @updatedAt @map("updated_at")

  user         User          @relation(fields: [userId], references: [id])
  appointments Appointment[]

  @@map("practitioners")
}

// Services
model Service {
  id                   String   @id @default(uuid())
  name                 String
  description          String?
  category             String
  duration             Int      // minutes
  scheduledDuration    Int?     @map("scheduled_duration")
  price                Decimal  @db.Decimal(10, 2)
  depositRequired      Boolean  @default(false) @map("deposit_required")
  depositAmount        Decimal? @map("deposit_amount") @db.Decimal(10, 2)
  requiredCapabilities Json?    @map("required_capabilities")
  requiredEquipment    Json?    @map("required_equipment")
  postTreatmentTime    Int?     @map("post_treatment_time")
  isActive             Boolean  @default(true) @map("is_active")
  createdAt            DateTime @default(now()) @map("created_at")
  updatedAt            DateTime @updatedAt @map("updated_at")

  appointments Appointment[]

  @@map("services")
}

// Appointments
model Appointment {
  id                   String            @id @default(uuid())
  patientId            String            @map("patient_id")
  practitionerId       String            @map("practitioner_id")
  serviceId            String            @map("service_id")
  locationId           String            @map("location_id")
  roomId               String?           @map("room_id")
  startTime            DateTime          @map("start_time")
  endTime              DateTime          @map("end_time")
  duration             Int
  status               AppointmentStatus @default(scheduled)
  bookingType          String?           @default("scheduled") @map("booking_type")
  bookingSource        String?           @default("web") @map("booking_source")
  waitingRoomStatus    String?           @map("waiting_room_status")
  arrivalTime          DateTime?         @map("arrival_time")
  checkInTime          DateTime?         @map("check_in_time")
  confirmationSentAt   DateTime?         @map("confirmation_sent_at")
  smsConfirmedAt       DateTime?         @map("sms_confirmed_at")
  reminderSentAt       DateTime?         @map("reminder_sent_at")
  depositPaid          Boolean           @default(false) @map("deposit_paid")
  depositAmount        Decimal?          @map("deposit_amount") @db.Decimal(10, 2)
  stripePaymentIntentId String?          @map("stripe_payment_intent_id")
  groupBookingId       String?           @map("group_booking_id")
  groupPosition        Int?              @map("group_position")
  patientNotes         String?           @map("patient_notes")
  staffNotes           String?           @map("staff_notes")
  cancelledAt          DateTime?         @map("cancelled_at")
  cancelledBy          String?           @map("cancelled_by")
  cancellationReason   String?           @map("cancellation_reason")
  createdAt            DateTime          @default(now()) @map("created_at")
  updatedAt            DateTime          @updatedAt @map("updated_at")
  createdBy            String?           @map("created_by")

  patient      Patient      @relation(fields: [patientId], references: [id])
  practitioner Practitioner @relation(fields: [practitionerId], references: [id])
  service      Service      @relation(fields: [serviceId], references: [id])

  @@map("appointments")
}

// Passkey Credentials (WebAuthn)
model PasskeyCredential {
  id           String    @id @default(uuid())
  userId       String    @map("user_id")
  credentialId String    @unique @map("credential_id")
  publicKey    String    @map("public_key")
  counter      Int       @default(0)
  deviceType   String?   @map("device_type")
  deviceName   String?   @map("device_name")
  transports   Json?     // ['internal', 'hybrid', etc.]
  createdAt    DateTime  @default(now()) @map("created_at")
  lastUsedAt   DateTime? @map("last_used_at")

  user User @relation(fields: [userId], references: [id])

  @@map("passkey_credentials")
}

// Audit Log (HIPAA requirement)
model AuditLog {
  id           String   @id @default(uuid())
  userId       String?  @map("user_id")
  action       String
  resourceType String   @map("resource_type")
  resourceId   String?  @map("resource_id")
  ipAddress    String?  @map("ip_address")
  userAgent    String?  @map("user_agent")
  metadata     Json?
  createdAt    DateTime @default(now()) @map("created_at")

  user User? @relation(fields: [userId], references: [id])

  @@map("audit_logs")
}
```

### 2.3 Database Migrations Strategy

Prisma provides robust migration tools for managing database schema changes:

**Migration Commands:**
```bash
# Create a new migration (development)
npx prisma migrate dev --name add_new_feature

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only - DESTRUCTIVE)
npx prisma migrate reset

# Generate Prisma Client after schema changes
npx prisma generate

# View database in Prisma Studio
npx prisma studio

# Introspect existing database to generate schema
npx prisma db pull
```

**Migration Best Practices:**
1. Always run `prisma generate` after schema changes
2. Use descriptive migration names: `add_patient_allergies`, `update_appointment_status`
3. Review generated SQL before applying to production
4. Keep migrations in version control

---

## 3. Authentication System

### 3.1 Architecture Overview

```
Authentication Flow (2025)
==========================

                    +-----------------------------------------------------------+
                    |                   Patient Portal                           |
                    +-----------------------------------------------------------+
                                              |
                    +-------------------------+-------------------------+
                    |                         |                         |
                    v                         v                         v
           +---------------+        +---------------+        +---------------+
           |   Passkey     |        |  Magic Link   |        |   OAuth 2.0   |
           |  (WebAuthn)   |        |   (Email)     |        | (Google/Apple)|
           |   PRIMARY     |        |   FALLBACK    |        |   OPTIONAL    |
           +---------------+        +---------------+        +---------------+
                    |                         |                         |
                    +-------------------------+-------------------------+
                                              |
                                              v
                                    +---------------+
                                    |   Auth.js v5  |
                                    |   Adapter     |
                                    +---------------+
                                              |
                         +--------------------+--------------------+
                         |                    |                    |
                         v                    v                    v
                +---------------+    +---------------+    +---------------+
                |   Session     |    |   JWT Token   |    |  Audit Log    |
                |   (Redis)     |    |   (Signed)    |    |  (Postgres)   |
                +---------------+    +---------------+    +---------------+
```

### 3.2 Why Auth.js v5 + Custom Passkey

1. **No Vendor Lock-in**: Unlike Clerk ($$$) or Supabase (ecosystem dependency)
2. **Passkey Already Built**: Your existing passkey types in `/packages/types/src/user.ts`
3. **HIPAA Control**: Full access to auth data, encryption keys, session management
4. **Customization**: Medical-specific flows (verified phone for SMS, consent tracking)

### 3.3 Implementation

```typescript
// /apps/patient-portal/src/lib/auth.ts
import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    // Passkey provider (WebAuthn)
    {
      id: 'passkey',
      name: 'Passkey',
      type: 'credentials',
      credentials: {},
      async authorize(credentials, request) {
        // WebAuthn verification logic
        const { credentialId, authenticatorData, clientDataJSON, signature } = credentials;
        const verified = await verifyWebAuthnAssertion({
          credentialId,
          authenticatorData,
          clientDataJSON,
          signature,
        });
        if (verified) {
          return verified.user;
        }
        return null;
      },
    },
    // Magic Link fallback
    {
      id: 'email',
      type: 'email',
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendMagicLinkEmail(identifier, url);
      },
    },
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.role = token.role as string;
      return session;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // HIPAA audit log
      await createAuditLog({
        userId: user.id,
        action: 'sign_in',
        resourceType: 'session',
        metadata: { provider: account?.provider, isNewUser },
      });
    },
    async signOut({ token }) {
      await createAuditLog({
        userId: token.userId as string,
        action: 'sign_out',
        resourceType: 'session',
      });
    },
  },
});
```

### 3.4 Passkey Registration Flow

```typescript
// /apps/patient-portal/src/app/api/auth/passkey/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { phase, credential } = await request.json();

  if (phase === 'generate') {
    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName: 'Medical Spa',
      rpID: process.env.WEBAUTHN_RP_ID || 'localhost',
      userID: session.user.id,
      userName: session.user.email!,
      userDisplayName: session.user.name || session.user.email!,
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'required',
        userVerification: 'required',
      },
    });

    // Store challenge in Redis for verification
    await redis.set(`passkey_challenge:${session.user.id}`, options.challenge, 'EX', 300);

    return NextResponse.json(options);
  }

  if (phase === 'verify') {
    const expectedChallenge = await redis.get(`passkey_challenge:${session.user.id}`);

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: process.env.NEXT_PUBLIC_APP_URL!,
      expectedRPID: process.env.WEBAUTHN_RP_ID || 'localhost',
    });

    if (verification.verified && verification.registrationInfo) {
      // Store credential in database
      await db.insert(passkeyCredentials).values({
        userId: session.user.id,
        credentialId: Buffer.from(verification.registrationInfo.credentialID).toString('base64url'),
        publicKey: Buffer.from(verification.registrationInfo.credentialPublicKey).toString('base64url'),
        counter: verification.registrationInfo.counter,
        deviceType: verification.registrationInfo.credentialDeviceType,
        transports: credential.response.transports,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
  }
}
```

---

## 4. API Design

### 4.1 API Strategy for 2025

Following 2025 best practices, we use a **hybrid approach**:

| Use Case | Approach | Reason |
|----------|----------|--------|
| Internal mutations | **Server Actions** | Type-safe, less code, CSRF protected |
| Public/External APIs | **Route Handlers** | RESTful, documented, rate-limited |
| Real-time updates | **SSE endpoints** | Auto-reconnect, simpler than WebSockets |
| Admin cross-portal calls | **Internal API client** | Shared authentication context |

### 4.2 API Endpoint Structure

```
/apps/patient-portal/src/app/api/
|-- auth/
|   |-- [...nextauth]/route.ts      # Auth.js handlers
|   |-- passkey/
|   |   |-- register/route.ts       # Register new passkey
|   |   |-- authenticate/route.ts   # Authenticate with passkey
|   |-- session/route.ts            # Session management
|
|-- v1/                             # Versioned public API
|   |-- appointments/
|   |   |-- route.ts                # GET list, POST create
|   |   |-- [id]/route.ts           # GET, PATCH, DELETE single
|   |   |-- [id]/reschedule/route.ts
|   |   |-- [id]/cancel/route.ts
|   |   |-- availability/route.ts   # GET available slots
|   |
|   |-- services/
|   |   |-- route.ts                # GET all services
|   |   |-- [id]/route.ts           # GET single service
|   |
|   |-- providers/
|   |   |-- route.ts                # GET all providers
|   |   |-- [id]/route.ts           # GET single provider
|   |
|   |-- profile/
|   |   |-- route.ts                # GET/PATCH profile
|   |   |-- medical-history/route.ts
|   |   |-- preferences/route.ts
|   |
|   |-- photos/
|   |   |-- route.ts                # GET list
|   |   |-- upload/route.ts         # POST upload
|   |   |-- [id]/route.ts           # GET single
|   |
|   |-- messages/
|   |   |-- route.ts                # GET conversations
|   |   |-- [id]/route.ts           # GET thread
|   |   |-- send/route.ts           # POST new message
|   |
|   |-- payments/
|   |   |-- methods/route.ts        # GET/POST payment methods
|   |   |-- history/route.ts        # GET payment history
|   |   |-- intent/route.ts         # POST create payment intent
|   |
|   |-- notifications/
|       |-- route.ts                # GET notifications
|       |-- preferences/route.ts    # GET/PATCH preferences
|       |-- stream/route.ts         # SSE endpoint
|
|-- internal/                       # Admin portal integration
    |-- patient/[id]/route.ts       # Patient data for admin
    |-- sync/route.ts               # Data sync endpoint
```

### 4.3 Route Handler Pattern

```typescript
// /apps/patient-portal/src/app/api/v1/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { appointments } from '@/lib/db/schema';
import { createAuditLog } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';

// Input validation schema
const CreateAppointmentSchema = z.object({
  serviceId: z.string().uuid(),
  practitionerId: z.string().uuid().optional(),
  locationId: z.string().uuid(),
  startTime: z.string().datetime(),
  patientNotes: z.string().max(500).optional(),
});

// GET /api/v1/appointments
export async function GET(request: NextRequest) {
  try {
    // Authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Rate limiting
    const rateLimitResult = await rateLimit.check(session.user.id, 'appointments:list');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
        { status: 429, headers: { 'Retry-After': rateLimitResult.retryAfter.toString() } }
      );
    }

    // Query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch appointments
    const patientAppointments = await db.query.appointments.findMany({
      where: (appt, { eq, and, gte, lte }) => and(
        eq(appt.patientId, session.user.patientId),
        status ? eq(appt.status, status) : undefined,
        from ? gte(appt.startTime, new Date(from)) : undefined,
        to ? lte(appt.startTime, new Date(to)) : undefined,
      ),
      with: {
        service: true,
        practitioner: { with: { user: true } },
        location: true,
      },
      limit,
      offset,
      orderBy: (appt, { desc }) => desc(appt.startTime),
    });

    // Audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'list_appointments',
      resourceType: 'appointment',
      metadata: { count: patientAppointments.length },
    });

    return NextResponse.json({
      data: patientAppointments,
      meta: {
        limit,
        offset,
        total: patientAppointments.length,
      },
    });
  } catch (error) {
    console.error('GET /api/v1/appointments error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}

// POST /api/v1/appointments
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Rate limiting (stricter for writes)
    const rateLimitResult = await rateLimit.check(session.user.id, 'appointments:create');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests' } },
        { status: 429 }
      );
    }

    // Parse and validate input
    const body = await request.json();
    const validationResult = CreateAppointmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', details: validationResult.error.flatten() } },
        { status: 400 }
      );
    }

    const { serviceId, practitionerId, locationId, startTime, patientNotes } = validationResult.data;

    // Check availability (critical business logic)
    const isAvailable = await checkSlotAvailability({
      practitionerId,
      startTime: new Date(startTime),
      serviceId,
    });

    if (!isAvailable) {
      return NextResponse.json(
        { error: { code: 'SLOT_UNAVAILABLE', message: 'This time slot is no longer available' } },
        { status: 409 }
      );
    }

    // Get service details for duration
    const service = await db.query.services.findFirst({
      where: (s, { eq }) => eq(s.id, serviceId),
    });

    if (!service) {
      return NextResponse.json(
        { error: { code: 'SERVICE_NOT_FOUND', message: 'Service not found' } },
        { status: 404 }
      );
    }

    // Create appointment
    const [appointment] = await db.insert(appointments).values({
      patientId: session.user.patientId,
      practitionerId: practitionerId!,
      serviceId,
      locationId,
      startTime: new Date(startTime),
      endTime: new Date(new Date(startTime).getTime() + service.duration * 60000),
      duration: service.duration,
      status: 'scheduled',
      bookingType: 'scheduled',
      bookingSource: 'web',
      patientNotes,
      depositAmount: service.depositAmount,
      depositPaid: false,
      createdBy: session.user.id,
    }).returning();

    // Audit log
    await createAuditLog({
      userId: session.user.id,
      action: 'create_appointment',
      resourceType: 'appointment',
      resourceId: appointment.id,
      metadata: { serviceId, practitionerId, startTime },
    });

    // Send confirmation (async, don't block response)
    sendAppointmentConfirmation(appointment.id).catch(console.error);

    return NextResponse.json(
      { data: appointment },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/v1/appointments error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
```

### 4.4 Server Actions for Internal Mutations

```typescript
// /apps/patient-portal/src/actions/appointments.ts
'use server';

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

const CancelAppointmentSchema = z.object({
  appointmentId: z.string().uuid(),
  reason: z.string().min(1).max(500),
});

export async function cancelAppointment(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const validatedFields = CancelAppointmentSchema.safeParse({
    appointmentId: formData.get('appointmentId'),
    reason: formData.get('reason'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid input' };
  }

  const { appointmentId, reason } = validatedFields.data;

  // Verify ownership
  const appointment = await db.query.appointments.findFirst({
    where: (appt, { eq, and }) => and(
      eq(appt.id, appointmentId),
      eq(appt.patientId, session.user.patientId),
    ),
  });

  if (!appointment) {
    return { error: 'Appointment not found' };
  }

  // Check cancellation policy (e.g., 24-hour notice)
  const hoursUntil = (new Date(appointment.startTime).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil < 24) {
    return { error: 'Appointments must be cancelled at least 24 hours in advance' };
  }

  // Update appointment
  await db.update(appointments)
    .set({
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: session.user.id,
      cancellationReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(appointments.id, appointmentId));

  // Revalidate cache
  revalidatePath('/appointments');
  revalidatePath(`/appointments/${appointmentId}`);

  return { success: true };
}
```

### 4.5 API Response Format

```typescript
// Success response
{
  "data": { ... } | [...],
  "meta": {
    "limit": 20,
    "offset": 0,
    "total": 150
  }
}

// Error response
{
  "error": {
    "code": "VALIDATION_ERROR" | "UNAUTHORIZED" | "NOT_FOUND" | "CONFLICT" | "RATE_LIMITED" | "INTERNAL_ERROR",
    "message": "Human-readable error message",
    "details": { ... } // Optional validation details
  }
}
```

---

## 5. Real-Time Communication

### 5.1 SSE for Notifications

Server-Sent Events are ideal for patient portal real-time updates:

- Appointment status changes
- New messages
- Waiting room updates
- Push notification fallback

```typescript
// /apps/patient-portal/src/app/api/v1/notifications/stream/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const encoder = new TextEncoder();
  const customReadable = new ReadableStream({
    async start(controller) {
      const userId = session.user.id;
      const channelKey = `notifications:${userId}`;

      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

      // Subscribe to Redis pub/sub
      const subscriber = redis.duplicate();
      await subscriber.subscribe(channelKey);

      subscriber.on('message', (channel, message) => {
        if (channel === channelKey) {
          controller.enqueue(encoder.encode(`data: ${message}\n\n`));
        }
      });

      // Heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: heartbeat\n\n`));
      }, 30000);

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        subscriber.unsubscribe(channelKey);
        subscriber.quit();
        controller.close();
      });
    },
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### 5.2 Publishing Notifications

```typescript
// /apps/patient-portal/src/lib/notifications.ts
import { redis } from '@/lib/redis';

export type NotificationType =
  | 'appointment_confirmed'
  | 'appointment_reminder'
  | 'room_ready'
  | 'new_message'
  | 'payment_received';

interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export async function publishNotification(
  userId: string,
  notification: Omit<NotificationPayload, 'timestamp'>
) {
  const payload: NotificationPayload = {
    ...notification,
    timestamp: new Date().toISOString(),
  };

  // Publish to SSE channel
  await redis.publish(
    `notifications:${userId}`,
    JSON.stringify(payload)
  );

  // Also store for later retrieval
  await redis.lpush(
    `notifications:history:${userId}`,
    JSON.stringify(payload)
  );
  await redis.ltrim(`notifications:history:${userId}`, 0, 99); // Keep last 100
}
```

### 5.3 Client-Side Hook

```typescript
// /apps/patient-portal/src/hooks/useNotifications.ts
'use client';

import { useEffect, useState } from 'react';

interface Notification {
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connect = () => {
      eventSource = new EventSource('/api/v1/notifications/stream');

      eventSource.onopen = () => setConnected(true);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type !== 'connected') {
          setNotifications(prev => [data, ...prev].slice(0, 50));

          // Show browser notification if permitted
          if (Notification.permission === 'granted') {
            new Notification(data.title, { body: data.body });
          }
        }
      };

      eventSource.onerror = () => {
        setConnected(false);
        eventSource?.close();
        // Auto-reconnect after 5 seconds
        setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      eventSource?.close();
    };
  }, []);

  return { notifications, connected };
}
```

---

## 6. File Upload & Storage

### 6.1 Architecture

```
File Upload Flow
================

+--------------+     1. Request upload URL     +--------------+
|    Client    | -----------------------------> |   API Route  |
+--------------+                                +--------------+
       |                                               |
       |                                               | 2. Generate
       |                                               |    presigned URL
       |                                               v
       |                                        +--------------+
       | <------------------------------------- |  Vercel Blob |
       |         3. Return upload URL           |  (or S3)     |
       |                                        +--------------+
       |
       | 4. Direct upload (bypass API)
       |
       v
+--------------------------------------------------------------+
|                        Cloud Storage                          |
|  - Encrypted at rest (AES-256)                               |
|  - Access controlled via signed URLs                         |
|  - CDN for fast delivery                                     |
+--------------------------------------------------------------+
```

### 6.2 Implementation

```typescript
// /apps/patient-portal/src/app/api/v1/photos/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { put } from '@vercel/blob';
import { db } from '@/lib/db';
import { photos } from '@/lib/db/schema';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const type = formData.get('type') as 'before' | 'after' | 'progress';
  const appointmentId = formData.get('appointmentId') as string | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/heic'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  // Validate file size (10MB max)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
  }

  // Generate unique filename
  const ext = file.name.split('.').pop();
  const filename = `patients/${session.user.patientId}/photos/${nanoid()}.${ext}`;

  // Upload to Vercel Blob (or S3)
  const blob = await put(filename, file, {
    access: 'private', // Requires signed URLs
    contentType: file.type,
  });

  // Store metadata in database
  const [photo] = await db.insert(photos).values({
    patientId: session.user.patientId,
    appointmentId,
    type,
    filename,
    url: blob.url,
    mimeType: file.type,
    size: file.size,
    uploadedBy: session.user.id,
  }).returning();

  return NextResponse.json({ data: photo }, { status: 201 });
}
```

---

## 7. Caching Strategy

### 7.1 Multi-Layer Caching

```
Caching Layers
==============

+-------------------------------------------------------------------------+
|                           Client Layer                                   |
|  - React Query cache (staleTime: 5min)                                  |
|  - Service Worker cache (static assets)                                  |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                           Edge Layer (CDN)                               |
|  - Static pages (ISR)                                                   |
|  - API responses (Cache-Control headers)                                |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                         Application Layer                                |
|  - Vercel KV (Redis) - Session data, rate limits, feature flags         |
|  - In-memory cache - Frequently accessed config                          |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                          Database Layer                                  |
|  - PostgreSQL query cache                                                |
|  - Connection pooling (PgBouncer)                                        |
+-------------------------------------------------------------------------+
```

### 7.2 Redis Caching Implementation

```typescript
// /apps/patient-portal/src/lib/cache.ts
import { kv } from '@vercel/kv';

type CacheOptions = {
  ttl?: number; // seconds
  tags?: string[];
};

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    return kv.get<T>(key);
  },

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    const { ttl = 3600 } = options;
    await kv.set(key, value, { ex: ttl });

    // Track tags for invalidation
    if (options.tags) {
      for (const tag of options.tags) {
        await kv.sadd(`tag:${tag}`, key);
      }
    }
  },

  async invalidate(key: string): Promise<void> {
    await kv.del(key);
  },

  async invalidateByTag(tag: string): Promise<void> {
    const keys = await kv.smembers(`tag:${tag}`);
    if (keys.length > 0) {
      await kv.del(...keys);
      await kv.del(`tag:${tag}`);
    }
  },

  // Cache-aside pattern helper
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fetcher();
    await this.set(key, value, options);
    return value;
  },
};
```

### 7.3 Rate Limiting

```typescript
// /apps/patient-portal/src/lib/rate-limit.ts
import { kv } from '@vercel/kv';

type RateLimitConfig = {
  window: number; // seconds
  limit: number;
};

const configs: Record<string, RateLimitConfig> = {
  'appointments:list': { window: 60, limit: 30 },
  'appointments:create': { window: 3600, limit: 10 },
  'messages:send': { window: 60, limit: 5 },
  'auth:login': { window: 300, limit: 5 },
  'photos:upload': { window: 3600, limit: 20 },
};

export const rateLimit = {
  async check(
    identifier: string,
    action: keyof typeof configs
  ): Promise<{ success: boolean; remaining: number; retryAfter: number }> {
    const config = configs[action];
    const key = `ratelimit:${action}:${identifier}`;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - config.window;

    // Remove old entries
    await kv.zremrangebyscore(key, 0, windowStart);

    // Count recent requests
    const count = await kv.zcard(key);

    if (count >= config.limit) {
      const oldestEntry = await kv.zrange(key, 0, 0, { withScores: true });
      const retryAfter = oldestEntry.length > 0
        ? Math.ceil(config.window - (now - (oldestEntry[0] as any).score))
        : config.window;

      return { success: false, remaining: 0, retryAfter };
    }

    // Add current request
    await kv.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    await kv.expire(key, config.window);

    return { success: true, remaining: config.limit - count - 1, retryAfter: 0 };
  },
};
```

---

## 8. Security & HIPAA Compliance

### 8.1 HIPAA Security Checklist

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| **Access Control** | Role-based access, session management | Required |
| **Audit Controls** | Comprehensive audit logging to database | Required |
| **Transmission Security** | TLS 1.3, HTTPS only | Required |
| **Encryption at Rest** | AES-256 for PHI, database encryption | Required |
| **Integrity Controls** | Input validation, checksums | Required |
| **Person/Entity Auth** | Passkey + MFA, session timeout | Required |
| **Automatic Logoff** | 30-minute session timeout | Required |
| **Unique User IDs** | UUID-based user identification | Required |
| **Emergency Access** | Admin override procedures | Addressable |

### 8.2 PHI Encryption

```typescript
// /apps/patient-portal/src/lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

// Derive key from master secret
async function deriveKey(salt: Buffer): Promise<Buffer> {
  const masterKey = process.env.PHI_ENCRYPTION_KEY!;
  return scryptAsync(masterKey, salt, KEY_LENGTH) as Promise<Buffer>;
}

export async function encryptPHI(plaintext: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = await deriveKey(salt);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  // Combine: salt + iv + authTag + encrypted
  const combined = Buffer.concat([
    salt,
    iv,
    authTag,
    Buffer.from(encrypted, 'base64'),
  ]);

  return combined.toString('base64');
}

export async function decryptPHI(ciphertext: string): Promise<string> {
  const combined = Buffer.from(ciphertext, 'base64');

  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
  );
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

  const key = await deriveKey(salt);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}
```

### 8.3 Audit Logging

```typescript
// /apps/patient-portal/src/lib/audit.ts
import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';
import { headers } from 'next/headers';

type AuditAction =
  | 'sign_in'
  | 'sign_out'
  | 'view_phi'
  | 'update_phi'
  | 'create_appointment'
  | 'cancel_appointment'
  | 'view_appointment'
  | 'upload_photo'
  | 'download_photo'
  | 'send_message'
  | 'view_message'
  | 'update_profile'
  | 'list_appointments';

interface AuditLogParams {
  userId: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

export async function createAuditLog({
  userId,
  action,
  resourceType,
  resourceId,
  metadata,
}: AuditLogParams) {
  const headersList = headers();
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] ||
                    headersList.get('x-real-ip') ||
                    'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  await db.insert(auditLogs).values({
    userId,
    action,
    resourceType,
    resourceId,
    ipAddress,
    userAgent,
    metadata,
  });
}
```

### 8.4 Security Headers Middleware

```typescript
// /apps/patient-portal/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://api.stripe.com wss:; " +
    "frame-src https://js.stripe.com;"
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

---

## 9. Integration Architecture

### 9.1 Admin Portal Integration

```
Cross-Portal Communication
==========================

+-------------------------------------------------------------------------+
|                        Shared Database (PostgreSQL)                      |
|                                                                          |
|  - Single source of truth for all data                                  |
|  - Both portals connect to the same database                            |
|  - Schema managed by shared @medical-spa/database package               |
+-------------------------------------------------------------------------+
                    |                           |
         +----------+----------+     +----------+----------+
         |                     |     |                     |
         v                     |     |                     v
+-----------------+           |     |           +-----------------+
|  Admin Portal   |           |     |           | Patient Portal  |
|  (Port 3001)    |           |     |           |  (Port 3000)    |
|                 |           |     |           |                 |
|  - Staff auth   |           |     |           |  - Patient auth |
|  - Full CRUD    |           |     |           |  - Limited CRUD |
|  - Reporting    |           |     |           |  - Self-service |
+-----------------+           |     |           +-----------------+
         |                    |     |                    |
         |         +----------+-----+----------+        |
         |         |                           |        |
         |         v                           v        |
         |  +-------------+             +-------------+ |
         |  |   Vercel    |             |    Twilio   | |
         |  |     KV      |             |     SMS     | |
         |  |  (Shared)   |             |  (Shared)   | |
         |  +-------------+             +-------------+ |
         |         |                           |        |
         +---------+-----------+---------------+--------+
                               |
                               v
                    +---------------------+
                    |   Real-time Sync    |
                    |   (Redis Pub/Sub)   |
                    +---------------------+
```

### 9.2 Shared Package Structure

```
/packages/
|-- database/              # Shared Drizzle schema and migrations
|   |-- src/
|   |   |-- schema/
|   |   |   |-- users.ts
|   |   |   |-- appointments.ts
|   |   |   |-- index.ts
|   |   |-- client.ts      # Database client
|   |   |-- index.ts
|   |-- drizzle.config.ts
|
|-- types/                 # Shared TypeScript types (existing)
|   |-- src/
|       |-- user.ts
|       |-- appointment.ts
|       |-- ...
|
|-- api-client/            # Shared API client for internal calls
|   |-- src/
|       |-- admin.ts       # Admin API client
|       |-- patient.ts     # Patient API client
|
|-- utils/                 # Shared utility functions
    |-- src/
        |-- encryption.ts
        |-- validation.ts
        |-- date.ts
```

---

## 10. Migration Strategy

### 10.1 Phase 1: Database Setup (Week 1-2)

1. Set up PostgreSQL database (Vercel Postgres or Neon)
2. Create Drizzle schema based on existing /lib/data.ts types
3. Run initial migrations
4. Set up Vercel KV (Redis)
5. Configure environment variables

**Deliverables:**
- Working database with schema
- Migration scripts
- Seed script for development data

### 10.2 Phase 2: Auth System (Week 3-4)

1. Implement Auth.js v5 with Drizzle adapter
2. Build passkey registration/authentication flows
3. Add magic link fallback
4. Set up session management with Redis
5. Implement audit logging

**Deliverables:**
- Working auth flows
- Passkey support
- HIPAA-compliant audit trail

### 10.3 Phase 3: Core API (Week 5-6)

1. Build appointment booking API
2. Build profile management API
3. Implement rate limiting
4. Add request validation
5. Integrate with existing Stripe endpoints

**Deliverables:**
- Complete REST API
- Server Actions for mutations
- Rate limiting

### 10.4 Phase 4: Integration & Testing (Week 7-8)

1. Connect patient portal to shared database
2. Implement admin portal sync
3. Set up real-time notifications (SSE)
4. Security audit and penetration testing
5. Load testing

**Deliverables:**
- Fully integrated portals
- Real-time sync working
- Security audit report

---

## 11. Deployment & Infrastructure

### 11.1 Environment Configuration

```bash
# .env.production (Patient Portal)

# Database
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."  # For migrations

# Authentication
NEXTAUTH_URL="https://app.medspa.com"
NEXTAUTH_SECRET="..."
WEBAUTHN_RP_ID="medspa.com"

# Encryption
PHI_ENCRYPTION_KEY="..."  # 32-byte key for AES-256

# Redis
KV_URL="..."
KV_REST_API_URL="..."
KV_REST_API_TOKEN="..."
KV_REST_API_READ_ONLY_TOKEN="..."

# Storage
BLOB_READ_WRITE_TOKEN="..."

# External Services
STRIPE_SECRET_KEY="..."
STRIPE_PUBLISHABLE_KEY="..."
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="..."

# Internal API
INTERNAL_API_SECRET="..."  # For admin <-> patient portal communication
ADMIN_API_URL="https://admin.medspa.com"
```

### 11.2 Vercel Project Configuration

```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ],
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/cleanup-sessions",
      "schedule": "0 0 * * *"
    }
  ]
}
```

---

## 12. Monitoring & Observability

### 12.1 Health Check Endpoint

```typescript
// /apps/patient-portal/src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const checks = {
    database: false,
    redis: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await db.execute('SELECT 1');
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    await redis.ping();
    checks.redis = true;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  const healthy = checks.database && checks.redis;

  return NextResponse.json(
    { status: healthy ? 'healthy' : 'unhealthy', checks },
    { status: healthy ? 200 : 503 }
  );
}
```

---

## Appendix A: Technology Decision Matrix

| Decision | Options Considered | Selected | Rationale |
|----------|-------------------|----------|-----------|
| **ORM** | Prisma, Drizzle, TypeORM | Prisma | Industry standard, battle-tested, excellent tooling, massive community |
| **Auth** | Clerk, Supabase Auth, Auth.js | Auth.js v5 | Zero vendor lock-in, HIPAA control, existing passkey types |
| **Real-time** | WebSockets, SSE, Polling | SSE | Auto-reconnect, sufficient for notifications, simpler than WS |
| **Cache** | Vercel KV, Redis Cloud, Memcached | Vercel KV | Native Vercel integration, edge-optimized |
| **Database** | Vercel Postgres, Supabase, PlanetScale | Vercel Postgres | Native integration, HIPAA-eligible, automatic backups |
| **Storage** | Vercel Blob, S3, Cloudflare R2 | Vercel Blob | Simple API, CDN included, S3-compatible |

---

## Appendix B: Security Compliance Checklist

### Pre-Launch Security Review

- [ ] All PHI encrypted at rest (AES-256)
- [ ] TLS 1.3 enforced on all endpoints
- [ ] HSTS headers configured
- [ ] CSP headers configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection (Server Actions + CORS)
- [ ] Session timeout configured (30 minutes)
- [ ] Audit logging implemented
- [ ] Error messages don't leak sensitive info
- [ ] Admin functions protected by role check
- [ ] File upload validation (type, size, content)
- [ ] Dependency vulnerabilities scanned

### HIPAA Technical Safeguards

- [ ] Unique user identification
- [ ] Emergency access procedure documented
- [ ] Automatic logoff implemented
- [ ] Encryption/decryption mechanisms
- [ ] Audit controls implemented
- [ ] Integrity controls (data validation)
- [ ] Person/entity authentication
- [ ] Transmission security (TLS)

---

## Appendix C: API Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `CONFLICT` | 409 | Resource conflict (e.g., slot taken) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## References

### 2025 Best Practices Sources

1. [Next.js API Guide 2025](https://artoonsolutions.com/nextjs-api-guide/) - Route Handlers and Server Actions patterns
2. [Drizzle vs Prisma Benchmarks 2025](https://www.bytebase.com/blog/drizzle-vs-prisma/) - ORM comparison
3. [Complete Authentication Guide for Next.js 2025](https://clerk.com/articles/complete-authentication-guide-for-nextjs-app-router) - Auth patterns
4. [HIPAA API Technical Guide](https://intuitionlabs.ai/articles/hipaa-compliant-api-guide) - Healthcare API security
5. [Redis Caching Strategies 2025](https://www.digitalapplied.com/blog/redis-caching-strategies-nextjs-production) - Caching patterns
6. [Passkey Best Practices 2025](https://www.hanko.io/blog/the-dos-and-donts-of-integrating-passkeys) - WebAuthn implementation
7. [SSE vs WebSockets 2025](https://dev.to/haraf/server-sent-events-sse-vs-websockets-vs-long-polling-whats-best-in-2025-5ep8) - Real-time communication

---

*Document Version: 1.0*
*Last Updated: December 2025*
*Author: Backend Architecture Team*
