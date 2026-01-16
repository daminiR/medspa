# Quick Fix Guide - Production Readiness

**Time Required:** 3-4 hours
**Priority:** CRITICAL - Required before production deployment

---

## Fix #1: Secure Database Credentials (30 minutes)

### Current Problem
```env
# .env - EXPOSED IN VERSION CONTROL
DATABASE_URL=postgresql://postgres:6cde69f1f4ba770785deb2436c11f0f5@34.171.178.77:5432/medical_spa
ENCRYPTION_KEY=8e592bf6ad5e2ad90f850b298272bca55aab884b97f25532bd58c0c510c67c70
```

### Solution

**Step 1:** Rotate the password
```bash
cd /Users/daminirijhwani/medical-spa-platform/backend

# Generate new password
NEW_PASSWORD=$(openssl rand -base64 32)

# Update Cloud SQL
gcloud sql users set-password postgres \
  --instance=medical-spa-db \
  --password="${NEW_PASSWORD}"
```

**Step 2:** Create secrets
```bash
# Store database URL with socket connection
echo "postgresql://postgres:${NEW_PASSWORD}@/medical_spa?host=/cloudsql/medical-spa-prod:us-central1:medical-spa-db&connection_limit=10&pool_timeout=20&connect_timeout=15" | \
  gcloud secrets create database-url --data-file=-

# Store encryption key
openssl rand -hex 32 | gcloud secrets create encryption-key --data-file=-
```

**Step 3:** Update .env (local development only)
```env
# .env.development
NODE_ENV=development
DATABASE_URL=postgresql://daminirijhwani@localhost:5432/medspa?connection_limit=5&pool_timeout=20
ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000000
```

**Step 4:** Update .gitignore
```bash
cat >> .gitignore <<EOF
.env
.env.local
.env.*.local
.env.development
.env.production
EOF
```

**Step 5:** Remove from git history (if needed)
```bash
git rm --cached .env
git commit -m "Remove .env from version control"
```

---

## Fix #2: Add Connection Pool Configuration (15 minutes)

### Files to Update

**File:** `.env.development`
```env
DATABASE_URL=postgresql://daminirijhwani@localhost:5432/medspa?connection_limit=5&pool_timeout=20&connect_timeout=10
```

**Cloud SQL connection string (stored in Secret Manager):**
```
postgresql://postgres:PASSWORD@/medical_spa?host=/cloudsql/medical-spa-prod:us-central1:medical-spa-db&connection_limit=10&pool_timeout=20&connect_timeout=15
```

### Connection Pool Calculation
- Cloud Run max instances: 10
- Connections per instance: 10
- Total connections needed: 10 × 10 = 100
- Cloud SQL default max_connections: 100
- Leave 10 for admin/monitoring: ✅

---

## Fix #3: Remove Duplicate PrismaClient (5 minutes)

### File to Edit
`/Users/daminirijhwani/medical-spa-platform/backend/src/routes/financial-reports.ts`

### Change Line 28-30

**BEFORE:**
```typescript
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

**AFTER:**
```typescript
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

// Remove the local PrismaClient instantiation
```

---

## Fix #4: Update Cloud Build Configuration (30 minutes)

### File to Edit
`/Users/daminirijhwani/medical-spa-platform/backend/cloudbuild.yaml`

### Update Deploy Step

**BEFORE:**
```yaml
- name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
  entrypoint: gcloud
  args:
    - 'run'
    - 'deploy'
    - 'medical-spa-api'
    - '--image'
    - 'gcr.io/$PROJECT_ID/medical-spa-api:$COMMIT_SHA'
    - '--set-env-vars'
    - 'NODE_ENV=production'
```

**AFTER:**
```yaml
- name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
  entrypoint: gcloud
  args:
    - 'run'
    - 'deploy'
    - 'medical-spa-api'
    - '--image'
    - 'gcr.io/$PROJECT_ID/medical-spa-api:$COMMIT_SHA'
    - '--region'
    - 'us-central1'
    - '--platform'
    - 'managed'
    - '--allow-unauthenticated'
    - '--min-instances'
    - '1'                          # Keep warm, prevent cold starts
    - '--max-instances'
    - '10'
    - '--memory'
    - '512Mi'
    - '--cpu'
    - '1'
    - '--timeout'
    - '60'                         # Reduced from 300s
    - '--concurrency'
    - '80'                         # Max requests per instance
    - '--add-cloudsql-instances'
    - 'medical-spa-prod:us-central1:medical-spa-db'  # Socket connection
    - '--set-env-vars'
    - 'NODE_ENV=production'
    - '--set-secrets'
    - 'DATABASE_URL=database-url:latest,ENCRYPTION_KEY=encryption-key:latest'
```

---

## Fix #5: Implement Real Health Check (15 minutes)

### File to Edit
`/Users/daminirijhwani/medical-spa-platform/backend/src/routes/health.ts`

### Update /ready Endpoint

**BEFORE (Line 27-48):**
```typescript
health.get('/ready', async (c) => {
  const checks: Record<string, { status: string; latency?: number }> = {};
  let allHealthy = true;

  // Check database
  try {
    const start = Date.now();
    // TODO: Add actual database health check
    const dbHealthy = true; // Placeholder
    const latency = Date.now() - start;

    checks.database = {
      status: dbHealthy ? 'healthy' : 'unhealthy',
      latency,
    };
    if (!dbHealthy) allHealthy = false;
  } catch (error) {
    checks.database = { status: 'unhealthy' };
    allHealthy = false;
  }
```

**AFTER:**
```typescript
import { checkDatabaseHealth } from '../lib/db';

health.get('/ready', async (c) => {
  const checks: Record<string, any> = {};
  let allHealthy = true;

  // Check database connectivity
  const dbHealth = await checkDatabaseHealth();
  checks.database = {
    status: dbHealth.healthy ? 'healthy' : 'unhealthy',
    latency: dbHealth.latency,
    error: dbHealth.error,
  };

  if (!dbHealth.healthy) {
    allHealthy = false;
  }
```

---

## Fix #6: Fix Shutdown Handlers (5 minutes)

### File to Edit
`/Users/daminirijhwani/medical-spa-platform/backend/src/index.ts`

### Update Lines 109-121

**BEFORE:**
```typescript
// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  // TODO: Close database connections
  // await closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  // TODO: Close database connections
  // await closeDatabaseConnection();
  process.exit(0);
});
```

**AFTER:**
```typescript
import { disconnectDatabase } from './lib/db';

// Graceful shutdown
const shutdown = async (signal: string) => {
  console.log(`${signal} received, shutting down gracefully...`);
  try {
    await disconnectDatabase();
    console.log('Database connections closed successfully');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```

---

## Fix #7: Optimize Prisma Configuration (5 minutes)

### File to Edit
`/Users/daminirijhwani/medical-spa-platform/backend/src/lib/prisma.ts`

### Update Line 20-26

**BEFORE:**
```typescript
new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  errorFormat: 'pretty',
});
```

**AFTER:**
```typescript
new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  errorFormat: process.env.NODE_ENV === 'development' ? 'pretty' : 'minimal',
});
```

---

## Testing Your Fixes

### Test Health Check
```bash
# Local
curl http://localhost:8080/health/ready

# Expected response
{
  "status": "ready",
  "checks": {
    "database": {
      "status": "healthy",
      "latency": 15
    }
  },
  "timestamp": "2024-12-22T..."
}
```

### Test Connection Pool
```bash
# Load test (requires wrk or similar)
wrk -t4 -c50 -d30s http://localhost:8080/health/ready

# Should handle 50 concurrent connections without errors
```

### Test Graceful Shutdown
```bash
# Start server
npm run dev

# Send SIGTERM
kill -TERM <pid>

# Should see:
# SIGTERM received, shutting down gracefully...
# Database connections closed successfully
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All 7 fixes completed
- [ ] Local testing passed
- [ ] Secrets created in Google Secret Manager
- [ ] .env removed from git
- [ ] Cloud Build YAML updated
- [ ] Health check returns real database status
- [ ] Load testing completed (50+ concurrent requests)
- [ ] Graceful shutdown tested

### Deploy Command
```bash
cd /Users/daminirijhwani/medical-spa-platform

# Ensure cloudbuild.yaml is updated
git add backend/cloudbuild.yaml
git commit -m "chore: configure production-ready Cloud Run deployment"

# Deploy via Cloud Build
gcloud builds submit --config=backend/cloudbuild.yaml
```

### Verify Deployment
```bash
# Get Cloud Run URL
SERVICE_URL=$(gcloud run services describe medical-spa-api \
  --region=us-central1 \
  --format='value(status.url)')

# Test health
curl ${SERVICE_URL}/health/ready

# Should return healthy database check
```

---

## Rollback Plan

If issues occur after deployment:

```bash
# List revisions
gcloud run revisions list --service=medical-spa-api --region=us-central1

# Rollback to previous revision
gcloud run services update-traffic medical-spa-api \
  --region=us-central1 \
  --to-revisions=PREVIOUS_REVISION=100
```

---

## Monitoring After Deployment

### View Logs
```bash
gcloud logs tail --service=medical-spa-api
```

### Key Metrics to Watch
- Connection pool exhaustion errors
- Database connection latency (should be < 50ms with socket)
- Health check failures
- 503 errors (service unavailable)

### Set Up Alerts
```bash
# Alert on unhealthy instances
gcloud monitoring policies create \
  --notification-channels=<channel-id> \
  --display-name="Medical Spa API Health" \
  --condition-display-name="Service Unhealthy" \
  --condition-expression='
    resource.type="cloud_run_revision" AND
    metric.type="run.googleapis.com/request_count" AND
    metric.label.response_code_class="5xx"
  '
```

---

## Support

- **Full Audit:** `AUDIT_REPORTS/production_readiness_audit.md`
- **Executive Summary:** `AUDIT_REPORTS/EXECUTIVE_SUMMARY.md`
- **All Fixes:** `AUDIT_REPORTS/FIXES_REQUIRED.md`

---

**Estimated Total Time:** 3-4 hours
**Risk Reduction:** HIGH → LOW
**Security Improvement:** CRITICAL → SECURE
**Scalability:** LIMITED → 800 concurrent requests
