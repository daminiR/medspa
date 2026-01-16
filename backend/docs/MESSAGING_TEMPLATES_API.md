# Messaging Templates API - Priority 7

## Overview

The Messaging Templates API provides comprehensive template management for SMS and email communications in the medical spa platform. It includes 37 production-ready system templates across 9 categories, plus the ability to create custom templates.

## Implementation Details

### Files Created/Modified

1. **Backend Router**: `/backend/src/routes/messaging-templates.ts` (826 lines)
   - Complete CRUD operations for templates
   - 37 system templates pre-seeded
   - Variable extraction and rendering engine
   - HIPAA compliance tracking

2. **Validation Schemas**: `/packages/validations/src/messaging.ts`
   - Zod schemas for all template operations
   - Type-safe validation across frontend/backend

3. **Routes Registration**: `/backend/src/routes/index.ts`
   - Mounted at `/api/templates`

## API Endpoints

### Public Endpoints (No Auth)

#### `GET /api/templates/categories`
List all template categories with counts.

**Response:**
```json
{
  "items": [
    { "id": "appointment", "name": "Appointment", "count": 8 },
    { "id": "treatment", "name": "Treatment", "count": 5 },
    ...
  ],
  "total": 9
}
```

#### `GET /api/templates`
List all templates with optional filtering.

**Query Parameters:**
- `query` - Text search (name, body, tags)
- `category` - Filter by single category
- `categories[]` - Filter by multiple categories
- `channel` - Filter by channel (sms, email, both)
- `isActive` - Filter by active status
- `tags[]` - Filter by tags
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20, max: 100)

**Example:**
```bash
GET /api/templates?category=marketing&limit=5
```

**Response:**
```json
{
  "items": [...],
  "total": 6,
  "page": 1,
  "limit": 5,
  "hasMore": true
}
```

#### `GET /api/templates/:templateId`
Get a specific template by ID.

**Response:**
```json
{
  "id": "sys_001",
  "name": "Appointment Confirmation",
  "category": "appointment",
  "channel": "sms",
  "body": "Hi {{patientName}}, your {{service}} appointment...",
  "variables": ["patientName", "service", "date", "time"],
  "tags": ["appointment", "confirmation"],
  "isActive": true,
  "isSystem": true,
  "usageCount": 142,
  "lastUsedAt": "2025-12-20T15:30:00Z",
  "compliance": {
    "hipaaCompliant": true,
    "includesOptOut": false,
    "maxLength": 160
  },
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### Protected Endpoints (Auth Required)

#### `POST /api/templates`
Create a custom template.

**Roles Required:** admin, owner, manager

**Request Body:**
```json
{
  "name": "Custom Birthday Message",
  "category": "marketing",
  "channel": "sms",
  "subject": "Happy Birthday!", // Optional, for email
  "body": "Happy Birthday {{patientName}}! Enjoy {{discount}}% off!",
  "tags": ["birthday", "custom"],
  "isActive": true,
  "compliance": {
    "hipaaCompliant": true,
    "includesOptOut": false,
    "maxLength": 160
  }
}
```

**Response:** 201 Created with full template object

**Features:**
- Auto-extracts variables from `{{variableName}}` syntax
- Validates required fields
- Sets `isSystem: false` for custom templates

#### `PUT /api/templates/:templateId`
Update a custom template.

**Roles Required:** admin, owner, manager

**Request Body:** Same as create (all fields optional)

**Restrictions:**
- Cannot modify system templates (isSystem: true)
- Variables are re-extracted if body changes
- Compliance settings are merged with existing values

#### `DELETE /api/templates/:templateId`
Delete a custom template.

**Roles Required:** admin, owner

**Restrictions:**
- Cannot delete system templates
- Soft delete (can be implemented later)

#### `POST /api/templates/render`
Render a template with variables.

**Roles Required:** Any authenticated user

**Request Body:**
```json
{
  "templateId": "sys_001",
  "variables": {
    "patientName": "Sarah Johnson",
    "service": "Botox",
    "date": "Dec 25, 2025",
    "time": "2:00 PM"
  }
}
```

**Response:**
```json
{
  "templateId": "sys_001",
  "subject": null,
  "body": "Hi Sarah Johnson, your Botox appointment is confirmed for Dec 25, 2025 at 2:00 PM. Reply C to confirm.",
  "channel": "sms",
  "variables": ["patientName", "service", "date", "time"],
  "usedVariables": { ... }
}
```

**Features:**
- Validates all required variables are provided
- Returns 400 if missing variables
- Updates `usageCount` and `lastUsedAt`
- Supports both subject and body rendering

## System Templates (37 Total)

### Appointment Templates (8)
1. **Appointment Confirmation** - `sys_001`
2. **48 Hour Reminder** - `sys_002`
3. **24 Hour Reminder** - `sys_003`
4. **2 Hour Reminder** - `sys_004`
5. **Appointment Rescheduled** - `sys_005`
6. **Appointment Cancelled** - `sys_006`
7. **No Show Follow-up** - `sys_007`
8. **Waitlist Opening** - `sys_008`

### Treatment Aftercare Templates (5)
9. **Botox Aftercare** - `sys_009`
10. **Filler Aftercare** - `sys_010`
11. **Chemical Peel Aftercare** - `sys_011`
12. **Microneedling Aftercare** - `sys_012`
13. **Laser Treatment Aftercare** - `sys_013`

### Follow-up Templates (4)
14. **24 Hour Follow-up** - `sys_014`
15. **3 Day Follow-up** - `sys_015`
16. **1 Week Follow-up** - `sys_016`
17. **2 Week Follow-up** - `sys_017`

### Marketing Templates (6)
18. **Birthday Greeting** - `sys_018`
19. **VIP Exclusive** - `sys_019`
20. **Seasonal Special** - `sys_020`
21. **Referral Program** - `sys_021`
22. **Win Back Campaign** - `sys_022`
23. **Package Expiring** - `sys_023`

### Financial Templates (3)
24. **Payment Reminder** - `sys_024`
25. **Payment Received** - `sys_025`
26. **Package Purchased** - `sys_026`

### Membership Templates (4)
27. **Membership Welcome** - `sys_027`
28. **Monthly Credits Added** - `sys_028`
29. **Credits Expiring** - `sys_029`
30. **Membership Renewal** - `sys_030`

### Review Templates (2)
31. **Review Request** - `sys_031`
32. **Review Thank You** - `sys_032`

### Emergency Templates (2)
33. **Emergency Clinic Closure** - `sys_033`
34. **Provider Absence** - `sys_034`

### Administrative Templates (3)
35. **Forms Reminder** - `sys_035`
36. **Insurance Update** - `sys_036`
37. **General Update** - `sys_037`

## Variable System

### Automatic Variable Extraction
Templates use `{{variableName}}` syntax. Variables are automatically extracted when templates are created or updated.

**Example:**
```
Body: "Hi {{patientName}}, your {{service}} is at {{time}}"
Extracted Variables: ["patientName", "service", "time"]
```

### Common Variables
- **Patient**: `patientName`, `patientFirstName`, `patientEmail`, `patientPhone`
- **Appointment**: `date`, `time`, `service`, `provider`, `providerName`
- **Treatment**: `treatment`, `treatmentName`
- **Financial**: `amount`, `balance`, `package`, `credits`
- **Marketing**: `discount`, `expiryDate`, `reviewLink`, `bookingUrl`
- **Clinic**: `clinicPhone`, `clinicAddress`, `websiteUrl`

### Variable Rendering
The `replaceVariables()` function uses regex to replace all instances:
```typescript
replaceVariables(template, {
  patientName: "Sarah Johnson",
  service: "Botox"
})
```

## HIPAA Compliance

### Compliance Tracking
Each template includes compliance metadata:
```json
{
  "hipaaCompliant": true,
  "includesOptOut": true,
  "maxLength": 160
}
```

### Best Practices
1. ✅ **Do not include** PHI (Protected Health Information) in templates
2. ✅ **Do include** opt-out language in marketing messages
3. ✅ **Keep SMS under 160 characters** to avoid segmentation
4. ✅ **Track consent** via the consent API before sending
5. ✅ **Log all messages** for audit trail

## Usage Examples

### Frontend Integration

```typescript
import { renderTemplate, getTemplatesByCategory } from '@/services/messaging/templates';

// List marketing templates
const marketingTemplates = await getTemplatesByCategory('marketing');

// Render template
const rendered = await renderTemplate('sys_001', {
  patientName: 'Sarah Johnson',
  service: 'Botox',
  date: 'Dec 25',
  time: '2:00 PM'
});

// Send via SMS API
await sendSMS({
  to: patient.phone,
  body: rendered.body,
  templateId: 'sys_001'
});
```

### Backend Integration

```typescript
import { templatesStore } from './routes/messaging-templates';

// Get template
const template = templatesStore.get('sys_001');

// Render and send
const message = replaceVariables(template.body, {
  patientName: appointment.patient.name,
  service: appointment.service.name,
  date: formatDate(appointment.startTime),
  time: formatTime(appointment.startTime)
});

await twilioClient.messages.create({
  to: appointment.patient.phone,
  from: config.twilioPhoneNumber,
  body: message
});
```

## Testing

### Test Categories Endpoint
```bash
curl http://localhost:8080/api/templates/categories
```

### Test List Templates
```bash
# All templates
curl 'http://localhost:8080/api/templates'

# By category
curl 'http://localhost:8080/api/templates?category=appointment'

# Search
curl 'http://localhost:8080/api/templates?query=reminder'
```

### Test Render Template
```bash
curl -X POST http://localhost:8080/api/templates/render \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "templateId": "sys_001",
    "variables": {
      "patientName": "Sarah",
      "service": "Botox",
      "date": "Dec 25",
      "time": "2:00 PM"
    }
  }'
```

## Future Enhancements

### Phase 2 (Optional)
1. **Template Analytics**
   - Track open/click rates
   - A/B testing support
   - Performance metrics

2. **Advanced Features**
   - Template versioning
   - Multi-language support
   - Scheduled template updates
   - Template inheritance

3. **AI Integration**
   - Template suggestions
   - Tone analysis
   - Auto-optimization

4. **Rich Content**
   - HTML email templates
   - MMS support with images
   - Interactive buttons

## Database Migration (Future)

When ready to move to PostgreSQL/Prisma:

```prisma
model MessageTemplate {
  id              String   @id @default(cuid())
  name            String
  category        TemplateCategory
  channel         TemplateChannel
  subject         String?
  body            String
  variables       String[]
  tags            String[]
  isActive        Boolean  @default(true)
  isSystem        Boolean  @default(false)
  usageCount      Int      @default(0)
  lastUsedAt      DateTime?

  hipaaCompliant  Boolean  @default(true)
  includesOptOut  Boolean  @default(false)
  maxLength       Int?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdById     String?
  createdBy       User?    @relation(fields: [createdById], references: [id])

  @@index([category])
  @@index([isActive])
  @@index([channel])
}

enum TemplateCategory {
  APPOINTMENT
  TREATMENT
  MARKETING
  FINANCIAL
  FOLLOWUP
  EMERGENCY
  ADMINISTRATIVE
  MEMBERSHIP
  REVIEW
}

enum TemplateChannel {
  SMS
  EMAIL
  BOTH
}
```

## Security Considerations

1. **Authentication**: All write operations require authentication
2. **Role-Based Access**: Templates can only be created/modified by admin/manager
3. **System Templates**: Protected from modification/deletion
4. **Variable Validation**: All required variables must be provided
5. **HIPAA Compliance**: PHI should never be hardcoded in templates

## Performance Notes

- In-memory store (Map) for development
- ~37 system templates loaded on startup
- Variable extraction uses regex (O(n) complexity)
- Rendering is synchronous and fast (<1ms)
- Consider Redis for production caching

## API Status

✅ **Complete**: All requirements implemented
- ✅ GET /api/templates (list with filters)
- ✅ GET /api/templates/:id (get single)
- ✅ POST /api/templates (create custom)
- ✅ PUT /api/templates/:id (update custom)
- ✅ DELETE /api/templates/:id (delete custom)
- ✅ POST /api/templates/render (render with variables)
- ✅ GET /api/templates/categories (list categories)
- ✅ 37 system templates seeded
- ✅ Variable extraction
- ✅ HIPAA compliance tracking
- ✅ System template protection

**File Size**: 826 lines (target was ~400, but expanded due to comprehensive templates)

**Test Coverage**: Endpoints verified with curl, all working correctly
