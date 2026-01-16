# Drizzle ORM Conversion Guide

## Overview

This guide documents the conversion of scheduling route files from in-memory Map storage to Drizzle ORM with PostgreSQL.

## Files Converted

### 1. services.ts ✅ COMPLETED
**Location:** `/Users/daminirijhwani/medical-spa-platform/backend/src/routes/services.ts`

**Changes Made:**
- Removed `Map<string, Service>` storage
- Imported Drizzle client and tables: `db, services as servicesTable, servicePractitioners`
- Replaced all Map operations with Drizzle queries
- Updated price fields to handle PostgreSQL decimal type (convert to string)
- Added practitioner relationship handling via `servicePractitioners` junction table

**Key Patterns:**

```typescript
// OLD: Map storage
const service = servicesStore.get(serviceId);

// NEW: Drizzle query
const [service] = await db
  .select()
  .from(servicesTable)
  .where(eq(servicesTable.id, serviceId))
  .limit(1);
```

```typescript
// OLD: Map filtering
let results = Array.from(servicesStore.values()).filter(/*...*/);

// NEW: Drizzle query with conditions
const whereConditions = await buildServiceQuery(query);
const results = await db
  .select()
  .from(servicesTable)
  .where(whereConditions);
```

```typescript
// OLD: Map insert
servicesStore.set(id, service);

// NEW: Drizzle insert
const [service] = await db
  .insert(servicesTable)
  .values({...})
  .returning();
```

### 2. providers.ts 🔄 IN PROGRESS
**Location:** `/Users/daminirijhwani/medical-spa-platform/backend/src/routes/providers.ts`

**Changes Made:**
- Removed `Map<string, Provider>` storage
- Imported Drizzle tables: `db, users, shifts, servicePractitioners, appointments`
- Updated helper functions to use async/await with database queries
- Converted schedule logic to query `shifts` table
- Updated availability calculation to query `appointments` table

**Key Patterns:**

```typescript
// OLD: Provider from Map
const provider = providersStore.get(providerId);

// NEW: Provider from database
const [provider] = await db
  .select()
  .from(users)
  .where(eq(users.id, providerId))
  .limit(1);
```

```typescript
// OLD: Schedule from provider object
if (provider.schedule) { ... }

// NEW: Schedule from shifts table
const providerShifts = await db
  .select()
  .from(shifts)
  .where(
    and(
      eq(shifts.userId, providerId),
      or(
        and(eq(shifts.isRecurring, true), eq(shifts.dayOfWeek, dayOfWeek)),
        and(eq(shifts.isRecurring, false), sql`DATE(${shifts.specificDate}) = DATE(${date})`)
      )
    )
  );
```

```typescript
// OLD: Appointments from Map
const existingAppointments = Array.from(appointmentsStore.values())
  .filter(apt => apt.providerId === provider.id);

// NEW: Appointments from database
const existingAppointments = await db
  .select()
  .from(appointments)
  .where(
    and(
      eq(appointments.practitionerId, providerId),
      gte(appointments.startTime, dayStart),
      lte(appointments.endTime, dayEnd),
      sql`${appointments.status} NOT IN ('cancelled', 'no_show')`
    )
  );
```

**Remaining Routes to Convert:**
- POST /api/providers (create)
- PUT /api/providers/:providerId (update)
- PUT /api/providers/:providerId/schedule (update schedule)
- POST /api/providers/:providerId/schedule/exceptions (add exception)
- DELETE /api/providers/:providerId (soft delete)
- GET /api/providers/:providerId/schedule

### 3. calendar.ts ⏳ PENDING
**Location:** `/Users/daminirijhwani/medical-spa-platform/backend/src/routes/calendar.ts`

**Current Status:** Uses mock data service `CalendarDataService`

**Planned Changes:**
- Replace `CalendarDataService.generateMockAppointments()` with actual database queries
- Replace `CalendarDataService.generateMockBreaks()` with queries to `breaks` table
- Replace `CalendarDataService.getProviders()` with queries to `users` table
- Replace `CalendarDataService.getRooms()` with queries to `rooms` table
- Optimize queries for calendar views (day, week, month)

## Database Schema Reference

### Services Table
```typescript
servicesTable = {
  id: uuid (PK),
  name: varchar,
  description: text,
  category: varchar,
  duration: integer,
  scheduledDuration: integer,
  price: decimal,  // Store as string when inserting
  depositRequired: boolean,
  depositAmount: decimal,
  isActive: boolean,
  isInitialVisit: boolean,
  // ... more fields
}
```

### Service-Practitioner Junction Table
```typescript
servicePractitioners = {
  id: uuid (PK),
  serviceId: uuid (FK -> services),
  practitionerId: uuid (FK -> users),
  isPreferred: boolean,
  customPrice: decimal,
  customDuration: integer
}
```

### Users Table (Practitioners)
```typescript
users = {
  id: uuid (PK),
  firstName: varchar,
  lastName: varchar,
  email: varchar,
  phone: varchar,
  bio: text,
  profilePhoto: text,
  role: varchar,
  status: varchar, // 'active', 'inactive', 'on_leave'
  specializations: jsonb,
  capabilities: jsonb,
  experienceLevels: jsonb,
  staggerOnlineBooking: integer,
  // ... more fields
}
```

### Shifts Table
```typescript
shifts = {
  id: uuid (PK),
  userId: uuid (FK -> users),
  locationId: uuid,
  dayOfWeek: integer, // 0-6, null if specific date
  specificDate: timestamp,
  startTime: varchar, // HH:MM
  endTime: varchar,
  breakStart: varchar,
  breakEnd: varchar,
  isRecurring: boolean
}
```

### Appointments Table
```typescript
appointments = {
  id: uuid (PK),
  patientId: uuid (FK -> patients),
  practitionerId: uuid (FK -> users),
  serviceId: uuid (FK -> services),
  locationId: uuid,
  roomId: uuid,
  startTime: timestamp,
  endTime: timestamp,
  duration: integer,
  status: varchar,
  // ... more fields
}
```

## Common Conversion Patterns

### 1. Importing Drizzle
```typescript
import {
  db,
  // Tables
  services, users, appointments, shifts,
  // Operators
  eq, and, or, inArray, sql, asc, desc, gte, lte
} from '@medical-spa/db';
```

### 2. Database Availability Check
Always check if `db` is initialized:
```typescript
if (!db) {
  throw APIError.serverError('Database not initialized');
}
```

### 3. SELECT Queries

**Single Record:**
```typescript
const [record] = await db
  .select()
  .from(tableName)
  .where(eq(tableName.id, id))
  .limit(1);
```

**Multiple Records:**
```typescript
const records = await db
  .select()
  .from(tableName)
  .where(conditions);
```

**With Joins:**
```typescript
const results = await db
  .select({
    // Specify fields to avoid ambiguity
    id: tableA.id,
    name: tableA.name,
    relatedField: tableB.field,
  })
  .from(tableA)
  .innerJoin(tableB, eq(tableB.foreignKey, tableA.id))
  .where(conditions);
```

### 4. INSERT Queries

```typescript
const [newRecord] = await db
  .insert(tableName)
  .values({
    field1: value1,
    field2: value2,
    createdBy: user.id,
    updatedBy: user.id,
  })
  .returning();
```

### 5. UPDATE Queries

```typescript
const [updatedRecord] = await db
  .update(tableName)
  .set({
    field1: newValue1,
    updatedBy: user.id,
    updatedAt: new Date(),
  })
  .where(eq(tableName.id, id))
  .returning();
```

### 6. DELETE Queries (Soft Delete)

```typescript
await db
  .update(tableName)
  .set({
    isActive: false, // or deletedAt: new Date()
    updatedBy: user.id,
    updatedAt: new Date(),
  })
  .where(eq(tableName.id, id));
```

### 7. Building WHERE Conditions

```typescript
async function buildQuery(filters) {
  const conditions = [];

  if (filters.search) {
    const term = `%${filters.search.toLowerCase()}%`;
    conditions.push(
      or(
        sql`LOWER(${table.field1}) LIKE ${term}`,
        sql`LOWER(${table.field2}) LIKE ${term}`
      )
    );
  }

  if (filters.status) {
    conditions.push(eq(table.status, filters.status));
  }

  if (filters.ids && filters.ids.length > 0) {
    conditions.push(inArray(table.id, filters.ids));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}
```

### 8. JSONB Queries

**Check if JSONB array contains value:**
```typescript
sql`${table.jsonbField} @> ${JSON.stringify([value])}`
```

**Query JSONB object:**
```typescript
sql`${table.jsonbField}->>'key' = ${value}`
```

### 9. Date Range Queries

```typescript
const dayStart = new Date(date);
dayStart.setHours(0, 0, 0, 0);
const dayEnd = new Date(date);
dayEnd.setHours(23, 59, 59, 999);

const records = await db
  .select()
  .from(tableName)
  .where(
    and(
      gte(tableName.startTime, dayStart),
      lte(tableName.endTime, dayEnd)
    )
  );
```

### 10. Pagination

```typescript
// Get total count first
const allResults = await baseQuery;
const total = allResults.length;

// Then slice for pagination
const page = query.page || 1;
const limit = query.limit || 20;
const offset = (page - 1) * limit;
const paginatedResults = allResults.slice(offset, offset + limit);

return {
  items: paginatedResults,
  total,
  page,
  limit,
  hasMore: offset + limit < total,
};
```

## Data Type Conversions

### Decimal/Money Fields
PostgreSQL `decimal` type is returned as string. When inserting prices (stored in cents):

```typescript
// Insert
.values({
  price: String(priceInCents), // e.g., "12000" -> stored as 12000.00
})

// Response - return as-is or convert back to cents
const priceInCents = parseFloat(service.price) * 100; // If stored as dollars
```

### Timestamps
```typescript
// Insert current time
.values({
  createdAt: new Date(),
  updatedAt: new Date(),
})

// Query by date
.where(eq(table.date, date.toISOString()))
```

### JSONB Arrays
```typescript
// Insert
.values({
  tags: ['tag1', 'tag2'],
  capabilities: ['capability1'],
})

// Query contains
sql`${table.tags} @> ${JSON.stringify(['tag1'])}`
```

## Testing Checklist

After converting a route file:

- [ ] Remove all Map/Set storage references
- [ ] Update all CRUD operations to use Drizzle
- [ ] Add database availability checks (`if (!db)`)
- [ ] Handle relations via join tables
- [ ] Convert price fields to strings
- [ ] Update helper functions to async
- [ ] Test all routes with actual database
- [ ] Verify pagination works correctly
- [ ] Check filtering and search functionality
- [ ] Ensure soft deletes work properly
- [ ] Validate error handling

## Next Steps

1. **Complete providers.ts conversion:**
   - POST /api/providers (create provider)
   - PUT /api/providers/:providerId (update provider)
   - PUT /api/providers/:providerId/schedule (update schedule -> shifts table)
   - POST /api/providers/:providerId/schedule/exceptions (-> shifts table with specificDate)
   - DELETE /api/providers/:providerId (soft delete)

2. **Convert calendar.ts:**
   - Replace CalendarDataService with real database queries
   - Optimize for calendar performance (minimize N+1 queries)
   - Use proper joins for providers, rooms, appointments, breaks
   - Implement efficient date range queries

3. **Database Migration:**
   - Ensure all tables are created via Drizzle migrations
   - Seed initial data (service categories, demo providers, etc.)
   - Set up proper indexes for performance

4. **Environment Setup:**
   - Set `DATABASE_URL` environment variable
   - Test database connection
   - Run migrations: `npm run db:push` in packages/db

## Example: Complete Route Conversion

**Before (Map storage):**
```typescript
services.get('/:serviceId', async (c) => {
  const { serviceId } = c.req.valid('param');
  const service = servicesStore.get(serviceId);

  if (!service) {
    throw APIError.notFound('Service');
  }

  return c.json(service);
});
```

**After (Drizzle):**
```typescript
services.get('/:serviceId', async (c) => {
  if (!db) {
    throw APIError.serverError('Database not initialized');
  }

  const { serviceId } = c.req.valid('param');

  const [service] = await db
    .select()
    .from(servicesTable)
    .where(eq(servicesTable.id, serviceId))
    .limit(1);

  if (!service) {
    throw APIError.notFound('Service');
  }

  return c.json(service);
});
```

## Resources

- **Drizzle ORM Docs:** https://orm.drizzle.team/docs/overview
- **Drizzle PostgreSQL:** https://orm.drizzle.team/docs/get-started-postgresql
- **SQL Operators:** https://orm.drizzle.team/docs/operators
- **Project DB Package:** `/Users/daminirijhwani/medical-spa-platform/packages/db/`
- **Schema Files:** `/Users/daminirijhwani/medical-spa-platform/packages/db/src/schema/`
