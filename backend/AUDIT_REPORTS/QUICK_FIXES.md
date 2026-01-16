# Quick Fix Guide - Security Audit Action Items

**Priority Order:** HIGH → MEDIUM → LOW
**Estimated Total Time:** 8-12 hours

---

## 🔴 HIGH PRIORITY (Fix This Week)

### Issue #1: Unsafe Raw Query Functions

**File:** `/Users/daminirijhwani/medical-spa-platform/backend/src/lib/db.ts`
**Lines:** 86-91, 103-108
**Time:** 30 minutes
**Risk:** SQL Injection if misused

#### Current Code (UNSAFE):
```typescript
// Line 86-91
export async function executeRawQuery<T = unknown>(
  query: string,
  values?: any[]
): Promise<T> {
  return await prisma.$queryRawUnsafe<T>(query, ...(values || []));
}

// Line 103-108
export async function executeRawMutation(
  query: string,
  values?: any[]
): Promise<number> {
  return await prisma.$executeRawUnsafe(query, ...(values || []));
}
```

#### Fix Option 1: Mark as Deprecated (Quick)
```typescript
/**
 * @deprecated Use Prisma's type-safe queries instead
 * This function uses unsafe raw SQL and will be removed in v2.0
 */
export async function executeRawQuery<T = unknown>(
  query: string,
  values?: any[]
): Promise<T> {
  console.warn('WARNING: executeRawQuery is deprecated due to SQL injection risk');
  return await prisma.$queryRawUnsafe<T>(query, ...(values || []));
}
```

#### Fix Option 2: Remove Entirely (Recommended)
```typescript
// DELETE these functions - they're not used anywhere in the codebase
// Verified via: grep -r "executeRawQuery\|executeRawMutation" src/routes/
```

#### Verification:
```bash
# Ensure no code uses these functions
grep -r "executeRawQuery\|executeRawMutation" src/routes/
# Should return: no matches
```

---

## 🟡 MEDIUM PRIORITY (Fix This Month)

### Issue #2: Add Audit Fields to Medical Records

**Files:** `/Users/daminirijhwani/medical-spa-platform/backend/prisma/schema.prisma`
**Time:** 2 hours (including migration)

#### Models to Fix:

##### 2.1 Allergy Model (Line ~10-21)
```prisma
// BEFORE (Missing ALL audit fields)
model Allergy {
  id        String          @id
  patientId String
  allergen  String
  reaction  String
  severity  AllergySeverity
  onsetDate String?
  notes     String?
  Patient   Patient         @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@index([patientId])
}

// AFTER (Add audit fields)
model Allergy {
  id        String          @id
  patientId String
  allergen  String
  reaction  String
  severity  AllergySeverity
  onsetDate String?
  notes     String?
  createdAt DateTime        @default(now())  // ADD
  updatedAt DateTime        @updatedAt        // ADD
  createdBy String                            // ADD
  Patient   Patient         @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@index([patientId])
  @@index([createdAt])  // ADD for query performance
}
```

##### 2.2 Appointment Model (Line ~23-42)
```prisma
// BEFORE (Only has createdAt)
model Appointment {
  id               String            @id
  patientId        String
  patientName      String
  serviceName      String
  serviceCategory  String
  practitionerId   String
  practitionerName String
  startTime        DateTime
  endTime          DateTime
  status           AppointmentStatus
  notes            String?
  createdAt        DateTime          @default(now())  // EXISTS
  Patient          Patient           @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@index([patientId])
  @@index([practitionerId])
  @@index([startTime])
  @@index([status])
}

// AFTER (Add missing fields)
model Appointment {
  id               String            @id
  patientId        String
  patientName      String
  serviceName      String
  serviceCategory  String
  practitionerId   String
  practitionerName String
  startTime        DateTime
  endTime          DateTime
  status           AppointmentStatus
  notes            String?
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt        // ADD
  createdBy        String                              // ADD
  updatedBy        String?                             // ADD
  Patient          Patient           @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@index([patientId])
  @@index([practitionerId])
  @@index([startTime])
  @@index([status])
}
```

### Issue #3: Add Audit Fields to Financial Records

##### 3.1 InvoiceLineItem Model
```prisma
// BEFORE (Missing ALL audit fields)
model InvoiceLineItem {
  id             String       @id
  invoiceId      String
  type           LineItemType
  itemId         String?
  name           String
  description    String?
  quantity       Decimal
  unitPrice      Decimal
  unitType       UnitType?
  lotNumber      String?
  discountType   DiscountType?
  discountValue  Decimal?
  discountAmount Decimal      @default(0)
  taxRate        Decimal      @default(0)
  taxAmount      Decimal      @default(0)
  lineTotal      Decimal
  providerId     String?
  Invoice        Invoice      @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([invoiceId])
  @@index([itemId])
  @@index([type])
}

// AFTER (Add audit fields)
model InvoiceLineItem {
  id             String       @id
  invoiceId      String
  type           LineItemType
  itemId         String?
  name           String
  description    String?
  quantity       Decimal
  unitPrice      Decimal
  unitType       UnitType?
  lotNumber      String?
  discountType   DiscountType?
  discountValue  Decimal?
  discountAmount Decimal      @default(0)
  taxRate        Decimal      @default(0)
  taxAmount      Decimal      @default(0)
  lineTotal      Decimal
  providerId     String?
  createdAt      DateTime     @default(now())  // ADD
  updatedAt      DateTime     @updatedAt        // ADD
  createdBy      String                         // ADD
  Invoice        Invoice      @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([invoiceId])
  @@index([itemId])
  @@index([type])
  @@index([createdAt])  // ADD
}
```

### Issue #4: Add Soft Delete Fields

**Time:** 3 hours (schema + code updates)

##### 4.1 Patient Model
```prisma
model Patient {
  // ... existing fields ...
  deletedAt DateTime?  // ADD

  @@index([deletedAt])  // ADD for filtering
}
```

##### 4.2 Invoice Model
```prisma
model Invoice {
  // ... existing fields ...
  deletedAt DateTime?  // ADD

  @@index([deletedAt])  // ADD
}
```

##### 4.3 Treatment Model
```prisma
model Treatment {
  // ... existing fields ...
  deletedAt DateTime?  // ADD

  @@index([deletedAt])  // ADD
}
```

#### Update Query Logic (Example):
```typescript
// BEFORE
const patients = await prisma.patient.findMany();

// AFTER
const patients = await prisma.patient.findMany({
  where: { deletedAt: null }  // Exclude soft-deleted records
});
```

---

## 🟢 LOW PRIORITY (Enhance When Possible)

### Issue #5: SSL Documentation

**File:** Create `/Users/daminirijhwani/medical-spa-platform/backend/docs/PRODUCTION_DATABASE.md`
**Time:** 30 minutes

```markdown
# Production Database Configuration

## SSL/TLS Requirements

### PostgreSQL Connection String

Production databases MUST use SSL encryption:

```bash
# .env (Production)
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require&sslcert=/path/to/cert.pem"
```

### SSL Modes
- `sslmode=require` - Enforce SSL (recommended)
- `sslmode=verify-full` - Verify SSL certificate (most secure)

### Verification
```bash
# Test SSL connection
psql "$DATABASE_URL" -c "SELECT version();"
```
```

### Issue #6: Query Logging Redaction

**File:** `/Users/daminirijhwani/medical-spa-platform/backend/src/lib/prisma.ts`
**Time:** 2 hours

```typescript
// Add parameter redaction for sensitive fields
const SENSITIVE_FIELDS = ['password', 'ssn', 'cardNumber', 'token'];

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});

if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    let params = e.params;
    
    // Redact sensitive parameters
    SENSITIVE_FIELDS.forEach(field => {
      params = params.replace(
        new RegExp(`"${field}":\\s*"[^"]*"`, 'gi'),
        `"${field}": "[REDACTED]"`
      );
    });
    
    console.log('Query:', e.query);
    console.log('Params:', params);
    console.log('Duration:', e.duration, 'ms');
  });
}
```

---

## 🔧 Migration Commands

### Step 1: Update Schema
```bash
cd /Users/daminirijhwani/medical-spa-platform/backend

# Edit prisma/schema.prisma with changes above
vim prisma/schema.prisma
```

### Step 2: Create Migration
```bash
# Create new migration
npx prisma migrate dev --name add_audit_fields_security_audit

# Review migration SQL
cat prisma/migrations/*/migration.sql
```

### Step 3: Apply to Production
```bash
# Backup first!
pg_dump $DATABASE_URL > backup_before_audit_fields.sql

# Apply migration
npx prisma migrate deploy
```

### Step 4: Verify
```bash
# Check new fields exist
npx prisma studio
# Or
psql $DATABASE_URL -c "\d+ Allergy"
```

---

## ✅ Testing Checklist

After implementing fixes:

```bash
# 1. Check no unsafe functions are called
grep -r "executeRawQuery\|executeRawMutation" src/routes/
# Expected: no matches

# 2. Verify audit fields in database
npx prisma studio
# Check: Allergy, Appointment, InvoiceLineItem have createdAt, updatedAt, createdBy

# 3. Test soft delete
# In code:
const patient = await prisma.patient.update({
  where: { id: 'test-id' },
  data: { deletedAt: new Date() }
});
// Verify: Patient still exists but is marked deleted

# 4. Verify queries exclude soft-deleted
const activePatients = await prisma.patient.findMany({
  where: { deletedAt: null }
});
// Verify: Soft-deleted patients not returned

# 5. Run existing tests
npm test

# 6. Security scan
npm audit
```

---

## 📊 Progress Tracking

- [ ] HIGH #1: Remove/deprecate unsafe query functions
- [ ] MEDIUM #2: Add audit fields to Allergy
- [ ] MEDIUM #2: Add audit fields to Appointment
- [ ] MEDIUM #3: Add audit fields to InvoiceLineItem
- [ ] MEDIUM #4: Add soft delete to Patient
- [ ] MEDIUM #4: Add soft delete to Invoice
- [ ] MEDIUM #4: Add soft delete to Treatment
- [ ] LOW #5: Document SSL requirements
- [ ] LOW #6: Implement query logging redaction
- [ ] Create GitHub issues for tracking
- [ ] Schedule penetration test

---

**Total Estimated Time:** 8-12 hours across 3 phases
**Next Review:** March 2025 (Quarterly)
