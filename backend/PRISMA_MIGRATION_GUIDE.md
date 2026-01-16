# Advanced Scheduling Routes - Prisma Migration Guide

This document provides comprehensive instructions for converting the four advanced scheduling route files from in-memory Map storage to Prisma database operations.

## Overview

The following routes need to be converted:
1. `/src/routes/waitlist.ts` - Waitlist management
2. `/src/routes/group-bookings.ts` - Group booking management
3. `/src/routes/recurring.ts` - Recurring appointments
4. `/src/routes/express-booking.ts` - Express booking tokens

## Database Schema

The Prisma schema has been updated in `/prisma/schema.prisma` with the following models:

- `WaitlistEntry` - Stores waitlist entries
- `WaitlistSettings` - Global waitlist configuration
- `GroupBooking` - Group booking information
- `GroupParticipant` - Individual participants in group bookings
- `RecurringPattern` - Recurring appointment patterns
- `RecurringException` - Exceptions to recurring patterns
- `ExpressBookingToken` - Express booking tokens

## Setup Steps

### 1. Generate Prisma Client

```bash
cd /Users/daminirijhwani/medical-spa-platform/backend
npx prisma generate
```

### 2. Run Database Migration

```bash
npx prisma migrate dev --name add_advanced_scheduling
```

## Conversion Patterns

### Pattern 1: List/Query Operations

**Before (Map):**
```typescript
const results = Array.from(waitlistStore.values());
results = results.filter(entry => entry.status === 'active');
```

**After (Prisma):**
```typescript
const results = await prisma.waitlistEntry.findMany({
  where: { status: 'ACTIVE' },
});
```

### Pattern 2: Get Single Record

**Before (Map):**
```typescript
const entry = waitlistStore.get(id);
if (!entry) {
  throw APIError.notFound('Waitlist entry');
}
```

**After (Prisma):**
```typescript
const entry = await prisma.waitlistEntry.findUnique({
  where: { id },
});
if (!entry) {
  throw APIError.notFound('Waitlist entry');
}
```

### Pattern 3: Create Record

**Before (Map):**
```typescript
const id = generateId();
const entry: WaitlistEntry = {
  id,
  patientId: data.patientId,
  // ... other fields
  createdAt: new Date(),
  updatedAt: new Date(),
};
waitlistStore.set(id, entry);
```

**After (Prisma):**
```typescript
const entry = await prisma.waitlistEntry.create({
  data: {
    patientId: data.patientId,
    patientName: data.patientName,
    // ... other fields
    // Note: id, createdAt, updatedAt are auto-generated
  },
});
```

### Pattern 4: Update Record

**Before (Map):**
```typescript
const entry = waitlistStore.get(id);
if (!entry) throw APIError.notFound('Waitlist entry');

entry.status = data.status;
entry.updatedAt = new Date();
```

**After (Prisma):**
```typescript
const entry = await prisma.waitlistEntry.update({
  where: { id },
  data: {
    status: data.status,
    // updatedAt is auto-updated
  },
});
```

### Pattern 5: Delete/Soft Delete

**Before (Map):**
```typescript
const entry = waitlistStore.get(id);
entry.status = 'cancelled';
```

**After (Prisma):**
```typescript
const entry = await prisma.waitlistEntry.update({
  where: { id },
  data: { status: 'CANCELLED' },
});
```

## File-Specific Migration Instructions

### 1. waitlist.ts

#### Import Changes
```typescript
// Add at top of file
import { prisma } from '../lib/prisma';
import type { WaitlistStatus, WaitlistPriority, VIPTier } from '@prisma/client';
```

#### Remove
- `const waitlistStore = new Map<string, WaitlistEntry>();`
- `const patientAppointmentsStore = new Map<string, Set<string>>();`
- `initMockData()` function and call

#### Key Function Conversions

**GET /api/waitlist (List)**
```typescript
// Replace waitlistStore iteration with:
let results = await prisma.waitlistEntry.findMany({
  where: {
    AND: [
      query.status ? { status: query.status.toUpperCase() as WaitlistStatus } : {},
      query.patientId ? { patientId: query.patientId } : {},
      // ... other filters
    ],
  },
  orderBy: {
    [query.sortBy]: query.sortOrder,
  },
  skip: (query.page - 1) * query.limit,
  take: query.limit,
});

const total = await prisma.waitlistEntry.count({
  where: { /* same filters */ },
});
```

**GET /api/waitlist/:id (Get One)**
```typescript
const entry = await prisma.waitlistEntry.findUnique({
  where: { id },
});
```

**POST /api/waitlist (Create)**
```typescript
const entry = await prisma.waitlistEntry.create({
  data: {
    patientId: data.patientId,
    patientName: data.patientName,
    patientPhone: data.patientPhone,
    patientEmail: data.patientEmail,
    serviceIds: data.serviceIds,
    serviceNames: data.serviceNames || [],
    providerIds: data.providerIds,
    providerNames: data.providerNames || [],
    preferredDays: data.preferredDays,
    preferredTimeRanges: data.preferredTimeRanges,
    flexibleDates: data.flexibleDates,
    flexibleProviders: data.flexibleProviders,
    flexibleTimes: data.flexibleTimes,
    priority: data.priority.toUpperCase() as WaitlistPriority,
    tier: data.tier?.toUpperCase() as VIPTier,
    notes: data.notes,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    deposit: data.deposit,
    hasCompletedForms: data.hasCompletedForms,
    offerHistory: [],
  },
});
```

**PUT /api/waitlist/:id (Update)**
```typescript
const entry = await prisma.waitlistEntry.update({
  where: { id },
  data: {
    ...(data.patientName && { patientName: data.patientName }),
    ...(data.status && { status: data.status.toUpperCase() as WaitlistStatus }),
    ...(data.priority && { priority: data.priority.toUpperCase() as WaitlistPriority }),
    // ... other conditional updates
  },
});
```

**DELETE /api/waitlist/:id (Cancel)**
```typescript
const entry = await prisma.waitlistEntry.update({
  where: { id },
  data: {
    status: 'CANCELLED',
    notes: reason ? `${existing.notes || ''}\n\nCancellation reason: ${reason}` : existing.notes,
  },
});
```

**Settings Management**
```typescript
// GET /api/waitlist/settings
const settings = await getWaitlistSettings(); // Helper function

// PUT /api/waitlist/settings
const settings = await prisma.waitlistSettings.upsert({
  where: { id: existingSettings.id },
  update: {
    automaticOffersEnabled: data.automaticOffersEnabled,
    offerExpiryMinutes: data.offerExpiryMinutes,
    // ... other fields
  },
  create: {
    // ... default values
  },
});
```

### 2. group-bookings.ts

#### Import Changes
```typescript
import { prisma } from '../lib/prisma';
import type { GroupBookingType, GroupBookingStatus, GroupPaymentType, ParticipantStatus } from '@prisma/client';
```

#### Remove
- `const groupsStore = new Map<string, GroupBooking>();`
- `const inviteCodeIndex = new Map<string, string>();`
- `initMockData()` function

#### Key Function Conversions

**GET /api/groups (List)**
```typescript
const results = await prisma.groupBooking.findMany({
  where: {
    ...(query.status && { status: query.status.toUpperCase() as GroupBookingStatus }),
    ...(query.type && { type: query.type.toUpperCase() as GroupBookingType }),
    ...(query.organizerId && { organizerId: query.organizerId }),
    ...(query.dateFrom && { date: { gte: query.dateFrom } }),
    ...(query.dateTo && { date: { lte: query.dateTo } }),
  },
  include: {
    participants: true, // Include participants
  },
  skip: (query.page - 1) * query.limit,
  take: query.limit,
  orderBy: { date: 'asc' },
});
```

**POST /api/groups (Create)**
```typescript
const group = await prisma.groupBooking.create({
  data: {
    name: data.name,
    type: data.type.toUpperCase() as GroupBookingType,
    organizerId: data.organizerId,
    organizerName: data.organizerName,
    organizerEmail: data.organizerEmail,
    organizerPhone: data.organizerPhone,
    date: data.date,
    startTime: new Date(data.startTime),
    endTime: new Date(data.endTime || data.startTime),
    locationId: data.locationId,
    maxParticipants: data.maxParticipants,
    minParticipants: data.minParticipants,
    sharedServiceId: data.sharedServiceId,
    allowIndividualServices: data.allowIndividualServices,
    inviteCode,
    paymentType: data.paymentType.toUpperCase() as GroupPaymentType,
    depositRequired: data.depositRequired,
    depositAmount: data.depositAmount,
    notes: data.notes,
    specialRequests: data.specialRequests,
  },
  include: {
    participants: true,
  },
});
```

**POST /api/groups/:id/participants (Add Participant)**
```typescript
const participant = await prisma.groupParticipant.create({
  data: {
    groupId: id,
    patientId: data.patientId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    serviceId: data.serviceId,
    serviceName: data.serviceName,
    providerId: data.providerId,
    providerName: data.providerName,
    roomId: data.roomId,
    startTime: new Date(data.startTime),
    duration: data.duration,
    amount: data.amount,
    status: 'INVITED',
  },
});

// Update group totals
await prisma.groupBooking.update({
  where: { id },
  data: {
    totalAmount: { increment: data.amount },
  },
});
```

**GET /join/:code (Public Join)**
```typescript
const group = await prisma.groupBooking.findUnique({
  where: { inviteCode: code.toUpperCase() },
  include: {
    participants: {
      where: { status: { not: 'CANCELLED' } },
    },
  },
});
```

### 3. recurring.ts

#### Import Changes
```typescript
import { prisma } from '../lib/prisma';
import type { RecurringFrequency, RecurringStatus, ExceptionType } from '@prisma/client';
```

#### Remove
- `const recurringStore = new Map<string, RecurringPattern>();`
- `clearRecurringStore()` export function

#### Key Function Conversions

**GET /api/recurring (List)**
```typescript
const results = await prisma.recurringPattern.findMany({
  where: {
    ...(query.patientId && { patientId: query.patientId }),
    ...(query.providerId && { providerId: query.providerId }),
    ...(query.status && { status: query.status.toUpperCase() as RecurringStatus }),
  },
  include: {
    exceptions: true,
  },
  skip: (query.page - 1) * query.limit,
  take: query.limit,
  orderBy: { createdAt: 'desc' },
});
```

**POST /api/recurring (Create)**
```typescript
const pattern = await prisma.recurringPattern.create({
  data: {
    patientId: data.patientId,
    patientName: data.patientName,
    serviceId: data.serviceId,
    serviceName: data.serviceName,
    providerId: data.providerId,
    providerName: data.providerName,
    duration: data.duration,
    roomId: data.roomId,
    locationId: data.locationId,
    notes: data.notes,
    color: data.color || '#8B5CF6',
    frequency: data.frequency.toUpperCase() as RecurringFrequency,
    interval: data.interval,
    byDayOfWeek: data.byDayOfWeek || [],
    byDayOfMonth: data.byDayOfMonth,
    bySetPos: data.bySetPos,
    startDate: data.startDate,
    startTime: data.startTime,
    endDate: data.endDate,
    occurrenceCount: data.occurrenceCount,
    rruleString,
    createdBy: user?.uid || 'system',
  },
});
```

**PUT /api/recurring/:id/occurrences/:date (Modify Occurrence)**
```typescript
const exception = await prisma.recurringException.create({
  data: {
    patternId: id,
    originalDate: date,
    type: data.type.toUpperCase() as ExceptionType,
    newDate: data.newDate,
    newTime: data.newTime,
    newProviderId: data.newProviderId,
    modifiedFields: data.type === 'modify' ? {
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      duration: data.duration,
      notes: data.notes,
    } : undefined,
    reason: data.reason,
    createdBy: user?.uid,
  },
});

// Update the pattern's updatedAt
await prisma.recurringPattern.update({
  where: { id },
  data: { updatedAt: new Date() },
});
```

### 4. express-booking.ts

#### Import Changes
```typescript
import { prisma } from '../lib/prisma';
import type { ExpressBookingStatus } from '@prisma/client';
```

#### Remove
- `const tokenStore = new Map<string, ExpressBookingToken>();`
- `const appointmentsStore = new Map<string, any>();`

#### Key Function Conversions

**POST /api/express-booking/tokens (Create Token)**
```typescript
const expressToken = await prisma.expressBookingToken.create({
  data: {
    token: tokenHash,
    rawTokenPrefix: rawToken.slice(0, 12),
    patientId: data.patientId,
    patientName: data.patientName,
    patientEmail: data.patientEmail,
    patientPhone: data.patientPhone,
    serviceIds: data.serviceIds || [],
    providerIds: data.providerIds || [],
    locationId: data.locationId,
    validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
    validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
    allowedDays: data.allowedDays || [],
    maxUses: data.maxUses,
    message: data.message,
    redirectUrl: data.redirectUrl,
    requireDeposit: data.requireDeposit,
    depositAmount: data.depositAmount,
    createdBy: user.uid,
    expiresAt,
    bookings: [],
  },
});
```

**GET /api/express-booking/tokens/:token (Validate Token)**
```typescript
const storedToken = await prisma.expressBookingToken.findUnique({
  where: { token: hashToken(token) },
});

if (!storedToken) {
  throw APIError.notFound('Booking link');
}

// Update status based on expiration
if (new Date() > storedToken.expiresAt) {
  await prisma.expressBookingToken.update({
    where: { id: storedToken.id },
    data: { status: 'EXPIRED' },
  });
  throw APIError.badRequest('This booking link has expired.');
}
```

**POST /api/express-booking/book (Use Token)**
```typescript
// After validation, increment usage
await prisma.expressBookingToken.update({
  where: { id: storedToken.id },
  data: {
    usedCount: { increment: 1 },
    bookings: { push: appointmentId },
    status: storedToken.usedCount + 1 >= storedToken.maxUses ? 'USED' : 'ACTIVE',
  },
});
```

## Common Gotchas

### 1. Enum Capitalization
Prisma enums use UPPERCASE. Convert string values:
```typescript
// Before
status: 'active'

// After
status: 'ACTIVE' as WaitlistStatus
```

### 2. JSON Fields
For complex objects stored as JSON:
```typescript
// Prisma automatically handles JSON serialization
data: {
  preferredTimeRanges: [{ start: '09:00', end: '17:00' }], // Stored as JSON
  currentOffer: offerObject, // Stored as JSON
}
```

### 3. Array Operations
```typescript
// Adding to array
bookings: { push: newBookingId }

// Setting entire array
serviceIds: ['svc-1', 'svc-2']
```

### 4. Transactions
For operations that need atomicity:
```typescript
await prisma.$transaction(async (tx) => {
  const participant = await tx.groupParticipant.create({ data: {...} });
  await tx.groupBooking.update({
    where: { id: groupId },
    data: { totalAmount: { increment: amount } },
  });
});
```

### 5. Date Handling
```typescript
// Prisma handles ISO strings and Date objects
startTime: new Date(data.startTime), // ISO string to Date
expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,

// Comparing dates in queries
where: {
  expiresAt: { gt: new Date() }, // Greater than now
}
```

## Testing Strategy

1. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

2. **Create Migration**
   ```bash
   npx prisma migrate dev
   ```

3. **Seed Test Data** (optional)
   Create a seed script to populate test data

4. **Test Each Endpoint**
   - Use existing tests if available
   - Manual testing with Postman/curl
   - Check database records with Prisma Studio: `npx prisma studio`

## Performance Considerations

1. **Use Indexes**: The schema includes indexes on frequently queried fields
2. **Select Only Needed Fields**: Use `select` when you don't need all fields
   ```typescript
   select: { id: true, patientName: true, status: true }
   ```
3. **Pagination**: Always use `skip` and `take` for large result sets
4. **Include Relations Judiciously**: Only include when needed
5. **Use Transactions**: For multi-step operations that need atomicity

## Rollback Plan

If issues arise:
1. Keep original Map-based code commented out
2. Can revert migration: `npx prisma migrate resolve --rolled-back <migration_name>`
3. Restore from database backup if needed

## Next Steps

After conversion:
1. Remove old Map stores and helper functions
2. Update tests
3. Remove mock data initialization
4. Add database seeding script if needed
5. Update API documentation
6. Run performance tests
