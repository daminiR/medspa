# Appointments Route - Drizzle ORM Conversion Summary

## Overview
Converted `/backend/src/routes/appointments.ts` from in-memory Map storage to Drizzle ORM database operations.

## What Was Changed

### 1. Imports (Line 22)
**Before:**
```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, optionalAuthMiddleware, requirePermission } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { logAuditEvent } from '@medical-spa/security';
```

**After:**
```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, optionalAuthMiddleware, requirePermission } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { logAuditEvent } from '@medical-spa/security';
import { db, appointments as appointmentsTable, breaks as breaksTable, patients as patientsTable, users as usersTable, services as servicesTable, eq, and, or, gte, lte, inArray, isNull, desc, sql } from '@medical-spa/db';
```

### 2. Removed In-Memory Storage
**Removed** (Lines 214-400):
- `appointmentsStore = new Map<string, Appointment>()`
- `breaksStore = new Map<string, Break>()`
- `providerNames` object
- `initMockData()` function
- All mock appointment data

**Kept**:
- `providerSchedules` array (marked with TODO: Move to database table)
- `BUFFER_TIME_MINUTES` constant

### 3. Updated Helper Functions

#### `checkConflicts()` (Lines 278-414)
**Changes:**
- Made `async`
- Returns `Promise<{...}>`
- Added `if (!db)` check
- Replaced `breaksStore.values()` with Drizzle query:
  ```typescript
  const breaks = await db
    .select()
    .from(breaksTable)
    .where(and(
      eq(breaksTable.practitionerId, practitionerId),
      sql`${breaksTable.startTime} < ${endTime}`,
      sql`${breaksTable.endTime} > ${startTime}`
    ));
  ```
- Replaced `appointmentsStore.values()` with Drizzle query with JOIN:
  ```typescript
  const existingAppointments = await db
    .select({
      id: appointmentsTable.id,
      practitionerId: appointmentsTable.practitionerId,
      patientId: appointmentsTable.patientId,
      roomId: appointmentsTable.roomId,
      startTime: appointmentsTable.startTime,
      endTime: appointmentsTable.endTime,
      patient: {
        firstName: patientsTable.firstName,
        lastName: patientsTable.lastName,
      },
    })
    .from(appointmentsTable)
    .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
    .where(and(...whereConditions));
  ```

#### `calculateAvailableSlots()` (Lines 436-549)
**Changes:**
- Made `async`
- Returns `Promise<AvailableSlot[]>`
- Added `if (!db)` check
- Replaced `appointmentsStore.values()` with Drizzle query filtering by date
- Replaced `breaksStore.values()` with Drizzle query filtering by date
- Replaced `providerNames[practitionerId]` with database query:
  ```typescript
  const provider = await db
    .select({ firstName: usersTable.firstName, lastName: usersTable.lastName })
    .from(usersTable)
    .where(eq(usersTable.id, practitionerId))
    .limit(1);
  ```

### 4. Converted Routes

#### GET `/` - List/Search Appointments (Lines 589-744)
**Changes:**
- Added `if (!db)` check
- Built `whereConditions` array for dynamic filtering
- Replaced `Array.from(appointmentsStore.values())` with:
  ```typescript
  const results = await db
    .select({/* all fields */})
    .from(appointmentsTable)
    .leftJoin(patientsTable, eq(...))
    .leftJoin(usersTable, eq(...))
    .leftJoin(servicesTable, eq(...))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(appointmentsTable.startTime)
    .limit(query.limit)
    .offset(offset);
  ```
- Added separate count query for pagination
- Transformed results to match API interface (denormalizing patient/practitioner/service data)

#### GET `/:id` - Get Appointment by ID (Lines 750-848)
**Changes:**
- Added `if (!db)` check
- Replaced `appointmentsStore.get(id)` with Drizzle query with JOINs
- Transformed single result to API interface

#### POST `/` - Create Appointment (Lines 854-1005)
**Changes:**
- Added `if (!db)` check
- Made `checkConflicts()` call `await`
- Replaced `appointmentsStore.set(id, appointment)` with:
  ```typescript
  const [newAppointment] = await db
    .insert(appointmentsTable)
    .values({
      patientId: data.patientId,
      practitionerId: data.practitionerId,
      // ... all fields
    })
    .returning();
  ```
- Fetched created appointment with JOINs to get related data
- Transformed result to API interface

#### PUT `/:id` - Update Appointment (Lines 1011-1189)
**Changes:**
- Added `if (!db)` check
- Fetched existing appointment from database first
- Built dynamic `updateData` object
- Made `checkConflicts()` call `await`
- Replaced in-memory update with:
  ```typescript
  await db
    .update(appointmentsTable)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(appointmentsTable.id, id));
  ```
- Fetched updated appointment with JOINs
- Transformed result to API interface

#### DELETE `/:id` - Cancel Appointment (Lines 1195-1337)
**Changes:**
- Added `if (!db)` check
- Fetched existing appointment from database first
- Replaced status mutation with:
  ```typescript
  await db
    .update(appointmentsTable)
    .set({
      status: 'cancelled',
      cancellationReason: reason || 'Cancelled by staff',
      cancelledAt: new Date(),
      cancelledBy: user?.uid,
      updatedAt: new Date(),
    })
    .where(eq(appointmentsTable.id, id));
  ```
- Fetched cancelled appointment with JOINs
- Transformed result to API interface

### 5. Routes Still To Convert

The following routes still need conversion (user should complete these):

#### PATCH `/:id/status` - Update Status Only
- Replace `appointmentsStore.get(id)` with database fetch
- Replace in-memory mutation with `db.update()`
- Fetch and return updated appointment

#### POST `/:id/reschedule` - Reschedule Appointment
- Replace `appointmentsStore.get(id)` with database fetch
- Make `checkConflicts()` call `await`
- Replace in-memory mutation with `db.update()`
- Remove `providerNames` lookup (fetch from database if needed)
- Fetch and return updated appointment

#### POST `/check-conflicts` - Check for Conflicts
- Make `checkConflicts()` call `await` (already done in helper function)

### 6. Export Functions To Remove/Update

At the end of the file, these testing exports should be removed or updated:

```typescript
// REMOVE OR UPDATE THESE:
export function clearStores() {
  appointmentsStore.clear();
  breaksStore.clear();
  initMockData();
}

export function addMockAppointment(appointment: Appointment) {
  appointmentsStore.set(appointment.id, appointment);
}

export function getMockAppointment(id: string): Appointment | undefined {
  return appointmentsStore.get(id);
}

export function addMockBreak(brk: Break) {
  breaksStore.set(brk.id, brk);
}

export { appointmentsStore, breaksStore, providerSchedules, providerNames };
```

## Database Schema Used

The conversion uses these Drizzle tables from `@medical-spa/db`:

1. **appointments** (`appointmentsTable`)
   - id, patientId, practitionerId, serviceId, locationId, roomId
   - startTime, endTime, duration, status, bookingType
   - notes, internalNotes, color, groupBookingId, isGroupCoordinator
   - cancellationReason, cancelledAt, cancelledBy, overriddenConflicts
   - createdAt, updatedAt

2. **breaks** (`breaksTable`)
   - id, practitionerId, type, startTime, endTime, duration

3. **patients** (`patientsTable`)
   - id, firstName, lastName, phone, email

4. **users** (`usersTable`)
   - id, firstName, lastName (practitioners)

5. **services** (`servicesTable`)
   - id, name, category

## Key Patterns

### Database Check
Every route handler now starts with:
```typescript
if (!db) {
  throw new Error('Database not initialized');
}
```

### JOIN Pattern for Related Data
```typescript
const results = await db
  .select({
    // Appointment fields
    id: appointmentsTable.id,
    // ... other appointment fields

    // Related patient data
    patient: {
      firstName: patientsTable.firstName,
      lastName: patientsTable.lastName,
      phone: patientsTable.phone,
      email: patientsTable.email,
    },

    // Related practitioner data
    practitioner: {
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
    },

    // Related service data
    service: {
      name: servicesTable.name,
      category: servicesTable.category,
    },
  })
  .from(appointmentsTable)
  .leftJoin(patientsTable, eq(appointmentsTable.patientId, patientsTable.id))
  .leftJoin(usersTable, eq(appointmentsTable.practitionerId, usersTable.id))
  .leftJoin(servicesTable, eq(appointmentsTable.serviceId, servicesTable.id))
  .where(/* conditions */);
```

### Transformation Pattern
Results from database queries are transformed to match the API interface:
```typescript
const apt = results[0];
const appointment = {
  id: apt.id,
  patientId: apt.patientId,
  patientName: apt.patient ? `${apt.patient.firstName} ${apt.patient.lastName}` : 'Unknown',
  patientPhone: apt.patient?.phone,
  patientEmail: apt.patient?.email,
  practitionerId: apt.practitionerId,
  practitionerName: apt.practitioner ? `${apt.practitioner.firstName} ${apt.practitioner.lastName}` : 'Unknown',
  // ... transform all fields
  startTime: apt.startTime.toISOString(),
  endTime: apt.endTime.toISOString(),
  createdAt: apt.createdAt.toISOString(),
  updatedAt: apt.updatedAt.toISOString(),
};
```

## Benefits of This Conversion

1. **Persistent Data**: Appointments are now stored in PostgreSQL database
2. **Data Integrity**: Foreign key constraints ensure referential integrity
3. **Scalability**: Can handle thousands of appointments efficiently
4. **Joins**: Related data (patient, practitioner, service) fetched in single query
5. **Type Safety**: Drizzle provides full TypeScript type safety
6. **Transactions**: Can wrap operations in transactions if needed
7. **Indexes**: Database indexes optimize query performance

## Testing Notes

- All validation logic remains unchanged
- Conflict detection logic preserved
- Status transition validation preserved
- Audit logging preserved
- Permission checks preserved

## Next Steps

1. Complete conversion of remaining 3 routes (PATCH status, POST reschedule, POST check-conflicts)
2. Remove or update export functions at end of file
3. Test all endpoints with real database
4. Add database migrations if schema changes needed
5. Consider moving `providerSchedules` to database table
6. Add database indexes for commonly queried fields (startTime, status, practitionerId, patientId)
