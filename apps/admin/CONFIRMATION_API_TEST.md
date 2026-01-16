# Confirmation API Testing Guide

## Implementation Summary

The Confirmation API has been successfully built following existing codebase patterns. Here are the complete endpoints and test scenarios.

## Architecture Overview

### Files Created:
1. **`/src/types/confirmation.ts`** - TypeScript type definitions
2. **`/src/lib/data/confirmations.ts`** - Mock data and utility functions
3. **`/src/app/api/confirmations/route.ts`** - Main confirmations endpoint (GET/POST)
4. **`/src/app/api/confirmations/[appointmentId]/route.ts`** - Appointment-specific endpoint (GET/PUT)

### Key Features Implemented:

- **Status Tracking**: `pending` | `confirmed` | `rescheduled` | `no_response` | `cancelled`
- **Escalation Flags**: `none` | `warning` | `escalated` | `follow_up`
- **Response Time Tracking**: Automatic calculation in minutes
- **Appointment Linking**: Direct connection to appointment calendar
- **No-Response Detection**: Automatic escalation after 24 hours
- **Follow-Up Management**: Track required follow-ups and actions
- **Multi-Channel Support**: SMS, email, phone, in-person

---

## API Endpoints

### 1. GET /api/confirmations
**List all confirmation requests with advanced filtering**

#### Query Parameters:
```
- status: pending,confirmed,rescheduled,no_response,cancelled (comma-separated)
- escalationLevel: none,warning,escalated,follow_up (comma-separated)
- channel: sms,email,phone,in_person (comma-separated)
- practitionerId: string
- patientId: string
- requiresFollowUp: boolean
- highRiskOnly: boolean (filter for high no-show risk)
- search: string (searches name, phone, email, service)
- sortBy: sentAt (default), appointmentStart, status, patientName, responseTimeMinutes
- sortOrder: asc | desc (default: desc)
- page: integer (default: 1)
- limit: integer (default: 20)
```

#### Example Requests:

**Get all pending confirmations:**
```bash
curl "http://localhost:3000/api/confirmations?status=pending"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conf-002",
      "appointmentId": "apt-002",
      "patientId": "pat-002",
      "patientName": "Michael Rodriguez",
      "patientPhone": "+1-555-0102",
      "serviceName": "Laser Hair Removal",
      "practitionerName": "Dr. James Wilson",
      "appointmentStart": "2026-01-10T14:00:00.000Z",
      "appointmentEnd": "2026-01-10T15:00:00.000Z",
      "status": "pending",
      "primaryChannel": "sms",
      "sentAt": "2026-01-09T06:00:00.000Z",
      "escalationLevel": "none",
      "escalationAttempts": 0,
      "isNewPatient": true,
      "noShowRisk": "medium",
      "requiresFollowUp": false,
      "createdAt": "2026-01-09T06:00:00.000Z",
      "updatedAt": "2026-01-09T06:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  },
  "stats": {
    "total": 6,
    "pending": 1,
    "confirmed": 1,
    "rescheduled": 1,
    "noResponse": 2,
    "cancelled": 1,
    "averageResponseTimeMinutes": 960,
    "confirmationRate": 33,
    "escalatedCount": 2,
    "requiresFollowUpCount": 3
  },
  "statusCounts": {
    "pending": 1,
    "confirmed": 1,
    "rescheduled": 1,
    "no_response": 2,
    "cancelled": 1
  }
}
```

**Get high-risk no-shows requiring follow-up:**
```bash
curl "http://localhost:3000/api/confirmations?highRiskOnly=true&requiresFollowUp=true"
```

**Get escalated confirmations:**
```bash
curl "http://localhost:3000/api/confirmations?escalationLevel=escalated,warning"
```

**Search for specific patient:**
```bash
curl "http://localhost:3000/api/confirmations?search=Robert+Chen&limit=5"
```

---

### 2. POST /api/confirmations
**Create a new confirmation request**

#### Request Body:
```json
{
  "appointmentId": "apt-001",
  "patientId": "pat-001",
  "patientName": "Sarah Johnson",
  "patientPhone": "+1-555-0101",
  "patientEmail": "sarah.j@example.com",
  "serviceName": "Botox Treatment",
  "practitionerId": "prac-001",
  "practitionerName": "Dr. Emily Chen",
  "appointmentStart": "2026-01-11T10:00:00Z",
  "appointmentEnd": "2026-01-11T10:30:00Z",
  "primaryChannel": "sms",
  "secondaryChannels": ["email"],
  "isNewPatient": false,
  "noShowRisk": "low",
  "createdBy": "staff-001"
}
```

#### Example Request:
```bash
curl -X POST http://localhost:3000/api/confirmations \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "apt-007",
    "patientId": "pat-007",
    "patientName": "Jennifer Wilson",
    "patientPhone": "+1-555-0107",
    "patientEmail": "jennifer.w@example.com",
    "serviceName": "Microneedling",
    "practitionerId": "prac-001",
    "practitionerName": "Dr. Emily Chen",
    "appointmentStart": "2026-01-12T14:00:00Z",
    "appointmentEnd": "2026-01-12T14:30:00Z",
    "primaryChannel": "sms",
    "isNewPatient": true,
    "noShowRisk": "medium"
  }'
```

#### Response:
```json
{
  "success": true,
  "data": {
    "id": "conf-1705070400000-a1b2c3d4e",
    "appointmentId": "apt-007",
    "patientId": "pat-007",
    "patientName": "Jennifer Wilson",
    "patientPhone": "+1-555-0107",
    "serviceName": "Microneedling",
    "status": "pending",
    "primaryChannel": "sms",
    "sentAt": "2026-01-09T12:00:00.000Z",
    "escalationLevel": "none",
    "escalationAttempts": 0,
    "isNewPatient": true,
    "noShowRisk": "medium",
    "requiresFollowUp": false,
    "createdAt": "2026-01-09T12:00:00.000Z",
    "updatedAt": "2026-01-09T12:00:00.000Z"
  },
  "message": "Confirmation request sent via sms to Jennifer Wilson"
}
```

---

### 3. GET /api/confirmations/[appointmentId]
**Get confirmation status for a specific appointment**

#### Example Request:
```bash
curl "http://localhost:3000/api/confirmations/apt-001"
```

#### Response:
```json
{
  "success": true,
  "data": {
    "id": "conf-001",
    "appointmentId": "apt-001",
    "patientId": "pat-001",
    "patientName": "Sarah Johnson",
    "status": "confirmed",
    "primaryChannel": "sms",
    "sentAt": "2026-01-08T12:00:00.000Z",
    "respondedAt": "2026-01-08T13:00:00.000Z",
    "responseTimeMinutes": 60,
    "responseAction": "confirmed",
    "responseNotes": "Confirmed via SMS reply",
    "escalationLevel": "none",
    "escalationAttempts": 0,
    "appointmentStart": "2026-01-11T10:00:00.000Z",
    "appointmentEnd": "2026-01-11T10:30:00.000Z",
    "responses": [
      {
        "id": "resp-001",
        "confirmationRequestId": "conf-001",
        "patientId": "pat-001",
        "appointmentId": "apt-001",
        "responseType": "confirmed",
        "respondedAt": "2026-01-08T13:00:00.000Z",
        "responseChannel": "sms",
        "responseMessage": "Yes, confirmed for Friday 10am"
      }
    ],
    "metrics": {
      "timeUntilAppointmentMinutes": 4800,
      "hoursUntilAppointment": 80,
      "shouldEscalate": false,
      "escalationDue": null
    }
  }
}
```

---

### 4. PUT /api/confirmations/[appointmentId]
**Update confirmation status or process patient response**

#### Request Actions:

**A. Mark as Confirmed:**
```bash
curl -X PUT http://localhost:3000/api/confirmations/apt-002 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "confirmed",
    "responseNotes": "Confirmed in person at check-in",
    "updatedBy": "staff-001"
  }'
```

**B. Mark as Rescheduled:**
```bash
curl -X PUT http://localhost:3000/api/confirmations/apt-003 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "rescheduled",
    "responseNotes": "Patient wants to reschedule to next Monday",
    "updatedBy": "staff-001"
  }'
```

**C. Mark as Cancelled:**
```bash
curl -X PUT http://localhost:3000/api/confirmations/apt-004 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "cancelled",
    "responseNotes": "Patient cancelled due to illness",
    "updatedBy": "staff-001"
  }'
```

**D. Escalate for No Response:**
```bash
curl -X PUT http://localhost:3000/api/confirmations/apt-005 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "escalate",
    "escalationReason": "No response after 24 hours - send reminder SMS",
    "updatedBy": "system"
  }'
```

**E. Mark Follow-Up Complete:**
```bash
curl -X PUT http://localhost:3000/api/confirmations/apt-006 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "mark_followed_up",
    "updatedBy": "staff-001"
  }'
```

**F. Update Follow-Up Action:**
```bash
curl -X PUT http://localhost:3000/api/confirmations/apt-003 \
  -H "Content-Type: application/json" \
  -d '{
    "followUpAction": "Call patient to confirm new appointment time",
    "followUpScheduledAt": "2026-01-10T10:00:00Z",
    "updatedBy": "staff-001"
  }'
```

#### Response (after confirmation):
```json
{
  "success": true,
  "data": {
    "id": "conf-002",
    "appointmentId": "apt-002",
    "patientId": "pat-002",
    "patientName": "Michael Rodriguez",
    "status": "confirmed",
    "primaryChannel": "sms",
    "sentAt": "2026-01-09T06:00:00.000Z",
    "respondedAt": "2026-01-09T12:00:00.000Z",
    "responseTimeMinutes": 360,
    "responseAction": "confirmed",
    "responseNotes": "Confirmed in person at check-in",
    "escalationLevel": "none",
    "escalationAttempts": 0,
    "isNewPatient": true,
    "noShowRisk": "medium",
    "requiresFollowUp": false,
    "createdAt": "2026-01-09T06:00:00.000Z",
    "updatedAt": "2026-01-09T12:00:00.000Z",
    "updatedBy": "staff-001"
  },
  "message": "Confirmation request updated: confirmed"
}
```

---

## Mock Data Summary

### Confirmation Statuses:
- **Confirmed (1)**: Sarah Johnson - Confirmed via SMS reply, 60 min response time
- **Pending (1)**: Michael Rodriguez - New patient, medium no-show risk
- **No Response (2)**: Jessica Lee (escalated), Robert Chen (highly escalated)
- **Rescheduled (1)**: David Thompson - Patient requested next week
- **Cancelled (1)**: Amanda Martinez - Scheduling conflict

### Escalation Examples:
- **Warning Level**: Jessica Lee (no response > 48 hours)
- **Escalated**: Robert Chen (multiple escalation attempts)

### Risk Assessment:
- High Risk: 3 patients (Jessica Lee, Robert Chen, others)
- Medium Risk: 2 patients (Michael Rodriguez, Amanda Martinez)
- Low Risk: 1 patient (Sarah Johnson)

---

## Key Implementation Details

### Automatic Escalation Logic:
```typescript
// In GET endpoint, checks:
- 24 hours passed since confirmation sent?
- No response yet?
- Not already escalated?
// Then marks for escalation in metrics

// In PUT endpoint with escalate action:
- First escalation: escalationLevel = 'warning'
- Second+ escalation: escalationLevel = 'escalated'
- Sets requiresFollowUp = true
```

### Response Time Calculation:
```typescript
responseTimeMinutes = moment(respondedAt).diff(moment(sentAt), 'minutes')
```

### Appointment Linking:
```typescript
// Each confirmation includes full appointment details:
- appointmentId (primary key)
- appointmentStart
- appointmentEnd
- pracitionerId + practitionerName
- serviceName
```

---

## Test Scenarios

### Scenario 1: Happy Path - Immediate Confirmation
```
1. POST /api/confirmations (send confirmation SMS)
   ✓ Status: pending
   ✓ Response time: null

2. PUT /api/confirmations/[appointmentId] with action='confirmed'
   ✓ Status: confirmed
   ✓ Response time: 60 minutes
   ✓ Escalation level: none
```

### Scenario 2: High-Risk Patient - Requires Escalation
```
1. POST /api/confirmations (isNewPatient=true, noShowRisk=high)
   ✓ Status: pending

2. Wait 24 hours (simulated)

3. GET /api/confirmations/[appointmentId]
   ✓ metrics.shouldEscalate = true

4. PUT with action='escalate'
   ✓ Status: no_response (if not changed)
   ✓ escalationLevel: warning
   ✓ escalationAttempts: 1

5. PUT again with action='escalate'
   ✓ escalationLevel: escalated
   ✓ escalationAttempts: 2
   ✓ requiresFollowUp: true
```

### Scenario 3: Filter by Risk Level
```
GET /api/confirmations?highRiskOnly=true
✓ Returns only: noShowRisk='high' AND status != 'confirmed'
✓ Shows escalation flags and follow-up needs
```

### Scenario 4: Statistics Dashboard
```
GET /api/confirmations?limit=100
✓ Returns stats object:
  - confirmationRate: 33% (2 confirmed + 1 rescheduled / 6 total)
  - escalatedCount: 2
  - requiresFollowUpCount: 3
  - averageResponseTimeMinutes: 960
```

---

## Debug Features

### Console Logging:
All endpoints include `[DEBUG]` and `[ERROR]` logs for troubleshooting:
```
[DEBUG] GET confirmations with params: {...}
[DEBUG] After status filter: 6
[DEBUG] Returning page 1 with 6 items (total: 6)
[DEBUG] POST confirmation request body: {...}
[DEBUG] Created new confirmation: conf-1705070400000-a1b2c3d4e
[DEBUG] Total confirmations: 7
```

### Error Handling:
- Missing required fields: 400 Bad Request
- Invalid status/channel: 400 Bad Request
- Duplicate pending confirmation: 400 Bad Request
- Confirmation not found: 404 Not Found
- Server errors: 500 Internal Server Error (with details)

---

## Integration Points

### Links to Existing Systems:
1. **Appointments**: Each confirmation has `appointmentId` for calendar lookup
2. **Patients**: `patientId` and `patientName` for patient management
3. **Practitioners**: `practitionerId` and `practitionerName` for staff dashboard
4. **SMS/Messaging**: Primary channel configured (sms, email, phone)

### Future Extensions:
- Connect to Twilio for actual SMS sending
- Add webhook for patient SMS responses
- Connect to email service for email confirmations
- Add to patient portal for online confirmation
- Generate reminder reports by practitioner

---

## Files Reference

### Type Definitions:
- `/src/types/confirmation.ts` - All TypeScript interfaces

### Mock Data:
- `/src/lib/data/confirmations.ts` - Mock data + utility functions

### API Routes:
- `/src/app/api/confirmations/route.ts` - Main GET/POST endpoints
- `/src/app/api/confirmations/[appointmentId]/route.ts` - Appointment-specific GET/PUT

---

## Debug Commands

To test locally, you can use these curl commands after starting the dev server:

```bash
# List all confirmations
curl "http://localhost:3000/api/confirmations"

# Get pending only
curl "http://localhost:3000/api/confirmations?status=pending"

# Get high-risk with follow-ups needed
curl "http://localhost:3000/api/confirmations?highRiskOnly=true&requiresFollowUp=true"

# Get specific appointment
curl "http://localhost:3000/api/confirmations/apt-001"

# Confirm an appointment
curl -X PUT "http://localhost:3000/api/confirmations/apt-002" \
  -H "Content-Type: application/json" \
  -d '{"action":"confirmed","responseNotes":"Confirmed"}'

# Escalate no-response
curl -X PUT "http://localhost:3000/api/confirmations/apt-003" \
  -H "Content-Type: application/json" \
  -d '{"action":"escalate","escalationReason":"No response after 24 hours"}'
```

---

## Status: COMPLETE ✓

All endpoints implemented with:
- ✓ Full CRUD operations (GET, POST, PUT)
- ✓ Advanced filtering and search
- ✓ Automatic escalation detection
- ✓ Response time tracking
- ✓ Follow-up management
- ✓ Mock data with 6 realistic scenarios
- ✓ Statistics and status counts
- ✓ Debug logging throughout
- ✓ Error handling and validation
