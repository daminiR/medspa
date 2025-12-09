# Quick Reference - Backend Requirements

## Completed Frontend Features Requiring Backend

### 🟢 Injectable Billing
**Status**: Frontend complete, backend needed

**Required APIs**:
```
POST /api/treatments/injectable
GET  /api/products/inventory
POST /api/documentation/face-chart
GET  /api/products/lot-numbers
POST /api/treatments/photos
```

**Key Backend Logic**:
- Lot number tracking
- Unit consumption calculation
- Expiration monitoring
- Legal documentation generation

---

### 🟢 Package System
**Status**: Frontend complete, backend needed

**Required APIs**:
```
POST /api/packages/create
GET  /api/packages/list
POST /api/packages/purchase
POST /api/packages/redeem
GET  /api/packages/balance/{patientId}
GET  /api/packages/suggestions
GET  /api/packages/roi-calculator
```

**Key Backend Logic**:
- Smart package suggestions (ML)
- ROI calculations
- Auto-redemption rules
- Family sharing
- Payment plans
- Usage tracking

---

### 🟢 Provider Tablet Sync
**Status**: Frontend complete, backend needed

**Required WebSocket Events**:
```
ws://api/treatments/room-status
ws://api/treatments/provider-sync
ws://api/treatments/documentation-update
```

**Key Backend Logic**:
- Real-time synchronization
- Conflict resolution
- Offline mode queue
- Multi-provider coordination

---

### 🟢 Payment Processing
**Status**: Frontend complete, backend integration needed

**Required APIs**:
```
POST /api/payments/charge
POST /api/payments/refund
GET  /api/payments/methods/{patientId}
POST /api/payments/split
POST /api/payments/plan/create
```

**Key Integrations**:
- Stripe Connect
- Square POS
- Payment tokenization
- PCI compliance

---

## Database Schema Overview

```sql
-- Core Tables Needed
CREATE TABLE packages (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(50),
    purchase_price DECIMAL(10,2),
    settings JSONB,  -- All configuration
    created_at TIMESTAMP
);

CREATE TABLE package_purchases (
    id UUID PRIMARY KEY,
    package_id UUID REFERENCES packages,
    patient_id UUID REFERENCES patients,
    purchase_date DATE,
    remaining_value DECIMAL(10,2),
    remaining_quantity INT,
    status VARCHAR(50)
);

CREATE TABLE package_usage (
    id UUID PRIMARY KEY,
    purchase_id UUID REFERENCES package_purchases,
    appointment_id UUID REFERENCES appointments,
    amount_used DECIMAL(10,2),
    units_used INT,
    used_at TIMESTAMP
);

CREATE TABLE injection_documentation (
    id UUID PRIMARY KEY,
    appointment_id UUID REFERENCES appointments,
    face_zones JSONB,  -- {zone: 'glabella', units: 20, x: 50, y: 30}
    custom_points JSONB,
    photos JSONB,
    provider_signature TEXT
);
```

---

## Environment Variables Needed

```bash
# Payment Processing
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SQUARE_ACCESS_TOKEN=

# Storage
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Real-time
REDIS_URL=
WEBSOCKET_PORT=

# Analytics
MIXPANEL_TOKEN=
GOOGLE_ANALYTICS_ID=

# Communications
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
SENDGRID_API_KEY=

# ML Services (Phase 2)
OPENAI_API_KEY=
HUGGINGFACE_TOKEN=
```

---

## Critical Path for MVP

### Week 1-2: Core Infrastructure
- [ ] Authentication system
- [ ] Database schema
- [ ] Basic CRUD APIs
- [ ] File upload system

### Week 3-4: Payment & Packages
- [ ] Stripe integration
- [ ] Package purchase flow
- [ ] Package redemption logic
- [ ] Invoice generation

### Week 5-6: Real-time Features
- [ ] WebSocket server
- [ ] Room status sync
- [ ] Provider tablet sync
- [ ] Notification system

### Week 7-8: Analytics & Reporting
- [ ] Basic analytics
- [ ] Package reports
- [ ] Revenue tracking
- [ ] Usage patterns

---

## Performance Benchmarks

| Feature | Target | Critical |
|---------|--------|----------|
| API Response | < 200ms | < 500ms |
| WebSocket Latency | < 100ms | < 300ms |
| Image Upload | < 2s | < 5s |
| Package Search | < 150ms | < 300ms |
| Report Generation | < 3s | < 10s |
| Payment Processing | < 2s | < 5s |

---

## Testing Requirements

### Unit Test Coverage
- Business logic: > 90%
- API endpoints: > 85%
- Database queries: > 80%

### Load Testing Targets
- 1000 concurrent users
- 100 appointments/minute
- 50 package redemptions/minute
- 10GB photo storage/day

---

## Security Checklist

- [ ] HIPAA compliance audit
- [ ] PCI DSS certification
- [ ] Penetration testing
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Rate limiting
- [ ] API authentication
- [ ] Encryption at rest
- [ ] Encryption in transit
- [ ] Audit logging
- [ ] GDPR compliance
- [ ] Backup strategy

---

## Contact Points

**Frontend Features**: `/apps/admin/src/`  
**Backend Requirements**: `/docs/backend-requirements/`  
**API Specs**: `/docs/api/` (to be created)  
**Database Schema**: `/docs/database/` (to be created)  

---

**Last Updated**: 2024-12-27  
**Next Review**: 2025-01-03