# Confirmation API - Complete Implementation

## Overview
Built a comprehensive backend API for appointment confirmation requests with status tracking, response time management, escalation flags for no-response cases, and direct appointment calendar linking.

## Files Created

### 1. Type Definitions
**File**: `/src/types/confirmation.ts`

Defines all TypeScript interfaces:
- `ConfirmationRequest` - Main confirmation data structure
- `ConfirmationResponse` - Patient response details
- `ConfirmationStats` - Statistics aggregation
- `ConfirmationFilter` - Query filter interface
- Type unions: `ConfirmationStatus`, `ConfirmationChannel`, `EscalationLevel`

**Key Fields in ConfirmationRequest**:
```typescript
interface ConfirmationRequest {
  id: string;
  appointmentId: string;  // Links to appointment calendar
  patientId: string;
  patientName: string;
  patientPhone: string;
  serviceName: string;
  practitionerId: string;
  practitionerName: string;
  appointmentStart: Date;   // Appointment details
  appointmentEnd: Date;

  // Status tracking
  status: 'pending' | 'confirmed' | 'rescheduled' | 'no_response' | 'cancelled';
  primaryChannel: 'sms' | 'email' | 'phone' | 'in_person';
  sentAt: Date;
  respondedAt?: Date;
  responseTimeMinutes?: number;  // Auto-calculated

  // Escalation for no-response
  escalationLevel: 'none' | 'warning' | 'escalated' | 'follow_up';
  escalationAttempts: number;
  lastEscalationAt?: Date;

  // Follow-up management
  requiresFollowUp: boolean;
  followUpAction?: string;
  followUpScheduledAt?: Date;

  // Risk assessment
  noShowRisk: 'low' | 'medium' | 'high';
  isNewPatient: boolean;
}
```

### 2. Mock Data
**File**: `/src/lib/data/confirmations.ts`

Provides:
- 6 realistic mock confirmation requests covering all statuses
- 3 example responses
- Utility functions for data access
- Statistics calculation function

**Mock Data Includes**:
- 1 Confirmed (Sarah Johnson - 60 min response)
- 1 Pending (Michael Rodriguez - new patient, medium risk)
- 2 No Response (Jessica Lee - escalated, Robert Chen - highly escalated)
- 1 Rescheduled (David Thompson)
- 1 Cancelled (Amanda Martinez)

**Utility Functions**:
```typescript
getConfirmationById(id)
getConfirmationsByAppointmentId(appointmentId)
getConfirmationsByStatus(status)
getPendingConfirmations()
getNoResponseConfirmations()
getEscalatedConfirmations(level?)
getHighRiskNoShows()
calculateConfirmationStats()
```

### 3. Main API Route
**File**: `/src/app/api/confirmations/route.ts`

#### GET /api/confirmations
Retrieves confirmations with advanced filtering:

**Query Parameters**:
- `status` - Filter by status (comma-separated)
- `escalationLevel` - Filter by escalation (none, warning, escalated)
- `channel` - Filter by communication channel
- `practitionerId` - Filter by practitioner
- `patientId` - Filter by patient
- `requiresFollowUp` - Boolean flag
- `highRiskOnly` - Show only high no-show risk cases
- `search` - Full-text search (name, phone, email, service)
- `sortBy` - Sort field (sentAt, appointmentStart, status, patientName)
- `page` - Pagination (default: 1)
- `limit` - Results per page (default: 20)

**Response Includes**:
- Paginated confirmation requests
- Status counts breakdown
- Statistics object with metrics
- Total pages

#### POST /api/confirmations
Creates a new confirmation request:

**Required Fields**:
- appointmentId, patientId, patientName
- patientPhone, serviceName
- practitionerId, practitionerName
- appointmentStart, appointmentEnd

**Optional Fields**:
- patientEmail
- primaryChannel (default: 'sms')
- secondaryChannels (array)
- isNewPatient (boolean)
- noShowRisk (low/medium/high)
- createdBy (staff ID)

**Response**:
- Returns created ConfirmationRequest with ID
- Status code 201 Created
- Includes confirmation message

### 4. Appointment-Specific Route
**File**: `/src/app/api/confirmations/[appointmentId]/route.ts`

#### GET /api/confirmations/[appointmentId]
Gets confirmation status for a specific appointment:

**Response Includes**:
- Full confirmation request details
- Array of all responses from patient
- Metrics object:
  - `timeUntilAppointmentMinutes`
  - `hoursUntilAppointment`
  - `shouldEscalate` - Boolean flag for auto-escalation
  - `escalationDue` - Null or 'immediate'

#### PUT /api/confirmations/[appointmentId]
Updates confirmation status with multiple action types:

**Action Types**:

1. **confirmed** - Mark appointment confirmed
   - Sets status to 'confirmed'
   - Records response time
   - Clears escalation flags
   ```json
   {"action": "confirmed", "responseNotes": "...", "updatedBy": "..."}
   ```

2. **rescheduled** - Mark as rescheduled
   - Sets status to 'rescheduled'
   - Sets requiresFollowUp to true
   - Records reschedule action
   ```json
   {"action": "rescheduled", "responseNotes": "..."}
   ```

3. **cancelled** - Mark as cancelled
   - Sets status to 'cancelled'
   - Sets requiresFollowUp to true
   - Records cancellation details
   ```json
   {"action": "cancelled", "responseNotes": "..."}
   ```

4. **escalate** - Escalate no-response
   - Increments escalationAttempts
   - Updates escalationLevel based on attempt count:
     - 1st attempt: 'warning'
     - 2nd+ attempts: 'escalated'
   - Sets requiresFollowUp on escalation
   ```json
   {"action": "escalate", "escalationReason": "..."}
   ```

5. **mark_followed_up** - Complete follow-up
   - Sets requiresFollowUp to false
   - Clears followUpScheduledAt
   ```json
   {"action": "mark_followed_up"}
   ```

**Additional Updates**:
- `followUpAction` - Update follow-up action
- `followUpScheduledAt` - Schedule follow-up
- `status` - Direct status update
- `updatedBy` - Track who made the change

## Implementation Patterns

### Following Existing Codebase Conventions

**Pattern 1: In-Memory Store**
```typescript
// matches /src/app/api/waitlist/route.ts pattern
let confirmationRequests: ConfirmationRequest[] = [...mockConfirmationRequests];

// Export for child routes
export { confirmationRequests };

// Child routes import from parent
import { confirmationRequests } from '../route';
```

**Pattern 2: Date Serialization**
```typescript
// Convert all Date objects to ISO strings in response
const formatted = {
  ...confirmation,
  sentAt: confirmation.sentAt instanceof Date
    ? confirmation.sentAt.toISOString()
    : confirmation.sentAt,
  // ... other dates
};
```

**Pattern 3: Filter Arrays**
```typescript
// Support both single and comma-separated parameters
const status = searchParams.get('status')?.split(',');
if (status && status.length > 0) {
  result = result.filter(c => status.includes(c.status));
}
```

**Pattern 4: Pagination**
```typescript
const page = parseInt(searchParams.get('page') || '1', 10);
const limit = parseInt(searchParams.get('limit') || '20', 10);
const start = (page - 1) * limit;
result = result.slice(start, start + limit);
```

**Pattern 5: Error Handling**
```typescript
if (missingFields.length > 0) {
  return NextResponse.json(
    { success: false, error: `Missing: ${missingFields.join(', ')}` },
    { status: 400 }
  );
}
```

## Debug Features

### Comprehensive Logging
Every endpoint includes `[DEBUG]` and `[ERROR]` prefixed logs:

```typescript
console.log('[DEBUG] GET confirmations with params:', {...});
console.log('[DEBUG] After status filter:', result.length);
console.log('[DEBUG] Created new confirmation:', newConfirmation.id);
console.error('[ERROR] Confirmations GET:', error);
```

### Response Details
Error responses include details:
```json
{
  "success": false,
  "error": "Failed to fetch confirmations",
  "details": "actual error message"
}
```

## Key Features

### 1. Status Tracking
- **pending**: Waiting for patient response
- **confirmed**: Patient confirmed appointment
- **rescheduled**: Patient requested reschedule
- **no_response**: No patient response (escalation candidate)
- **cancelled**: Patient or staff cancelled

### 2. Escalation System
- **none**: Normal status
- **warning**: First escalation after 24 hours no-response
- **escalated**: Multiple escalation attempts, requires immediate action
- **follow_up**: Marked for follow-up action

**Auto-Escalation Detection**:
```typescript
if (confirmation.status === 'pending' &&
    moment().diff(moment(confirmation.sentAt), 'hours') >= 24 &&
    confirmation.escalationAttempts === 0) {
  shouldEscalate = true;
}
```

### 3. Response Time Tracking
```typescript
responseTimeMinutes = moment(respondedAt).diff(moment(sentAt), 'minutes');

// Statistics aggregation
averageResponseTimeMinutes = sum(all responseTimes) / count
```

### 4. Appointment Linking
Each confirmation contains full appointment details:
- appointmentId (primary link)
- appointmentStart and appointmentEnd
- practitionerId and practitionerName
- serviceName

Enables direct calendar integration.

### 5. Risk Assessment
- **isNewPatient**: First-time patient (higher risk)
- **noShowRisk**: low/medium/high (for targeting)
- **requiresFollowUp**: Boolean flag for action items

## API Flow Examples

### Example 1: Send Confirmation
```
POST /api/confirmations
├─ Create new confirmation request
├─ Set status = 'pending'
├─ Record sentAt = now
├─ Initialize escalationLevel = 'none'
└─ Return created request (201 Created)
```

### Example 2: Patient Confirms
```
PUT /api/confirmations/apt-001 {action: 'confirmed'}
├─ Find confirmation
├─ Set status = 'confirmed'
├─ Set respondedAt = now
├─ Calculate responseTimeMinutes
├─ Clear escalation flags
└─ Return updated confirmation
```

### Example 3: Escalate No-Response
```
GET /api/confirmations/apt-001
├─ Check 24+ hours passed
├─ Check still pending
└─ Return shouldEscalate = true

PUT /api/confirmations/apt-001 {action: 'escalate'}
├─ Increment escalationAttempts
├─ First attempt: escalationLevel = 'warning'
├─ 2nd+ attempts: escalationLevel = 'escalated'
├─ Set requiresFollowUp = true
└─ Return updated confirmation
```

### Example 4: Filter High-Risk Cases
```
GET /api/confirmations?highRiskOnly=true&requiresFollowUp=true
├─ Filter: noShowRisk = 'high' AND status != 'confirmed'
├─ Filter: requiresFollowUp = true
└─ Return sorted by risk
```

## Integration Points

### Connects To:
1. **Appointments**: Lookup appointment details by appointmentId
2. **Patients**: Send SMS/email confirmations
3. **Practitioners**: Filter by practitioner dashboard
4. **Messaging**: Send SMS/email via external services

### Future Enhancements:
1. Webhook for SMS responses
2. Automated reminder system
3. Patient portal integration
4. Email confirmation support
5. Phone confirmation automation

## Test Data

### Status Distribution:
- 1 confirmed (16.7%)
- 1 pending (16.7%)
- 2 no_response (33.3%)
- 1 rescheduled (16.7%)
- 1 cancelled (16.7%)

### Risk Distribution:
- 1 low risk (confirmed)
- 2 medium risk (pending, cancelled)
- 3 high risk (all no-response)

### Escalation Examples:
- Jessica Lee: warning level (48+ hours no response)
- Robert Chen: escalated level (multiple attempts, requires phone call)

## Validation Rules

### Required for POST:
- appointmentId, patientId, patientName
- patientPhone, serviceName
- practitionerId, practitionerName
- appointmentStart, appointmentEnd

### Validation Checks:
- primaryChannel must be valid (sms|email|phone|in_person)
- Cannot create duplicate pending confirmations for same appointment
- appointmentStart must be valid date
- Patient name cannot be empty

### PUT Action Validation:
- action must be one of: confirmed, rescheduled, cancelled, escalate, mark_followed_up
- status must be valid if provided directly
- Cannot update already removed confirmations (future)

## Performance Characteristics

- **GET**: O(n) where n = total confirmations
  - Filter operations scan all records
  - Pagination applied after filtering
  - Status counts calculated before filtering

- **POST**: O(1) for creation + O(n) for validation
  - Duplicate check requires scan

- **PUT**: O(n) for finding appointment
  - Single record update is O(1)

## Error Handling

| Status | Scenario |
|--------|----------|
| 400 | Missing required fields |
| 400 | Invalid channel/status |
| 400 | Duplicate pending confirmation |
| 404 | Confirmation not found |
| 500 | Server error (with details) |

## Files Structure

```
/src/
├── types/
│   └── confirmation.ts           (2.5 KB)
├── lib/data/
│   └── confirmations.ts          (10 KB)
└── app/api/confirmations/
    ├── route.ts                  (11 KB)
    └── [appointmentId]/
        └── route.ts              (11 KB)
```

**Total New Code**: ~34.5 KB

## Status: COMPLETE ✓

### Implemented:
- [x] ConfirmationRequest type with all required fields
- [x] GET endpoint with advanced filtering
- [x] POST endpoint with validation
- [x] GET [appointmentId] with metrics
- [x] PUT [appointmentId] with 5 action types
- [x] Mock data with 6 realistic scenarios
- [x] Status tracking (5 statuses)
- [x] Escalation system (4 levels)
- [x] Response time auto-calculation
- [x] Appointment linking
- [x] Statistics aggregation
- [x] Pagination and sorting
- [x] Error handling with details
- [x] Debug logging throughout
- [x] Full documentation

### Ready for:
- Testing with curl/Postman
- Integration with SMS service
- Integration with patient portal
- Dashboard visualization
- Scheduled escalation jobs
- Email confirmation support
