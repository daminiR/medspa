# Check-In Messaging Service - Debug Guide

## Overview

This guide provides comprehensive debugging information for the check-in process messaging service. The service handles SMS communications throughout the patient check-in workflow.

## Files Created

```
/src/services/checkin/messaging.ts          - Core check-in messaging service
/src/app/api/checkin/notify/route.ts        - API endpoint for triggering notifications
/src/__tests__/checkin/messaging.test.ts    - Test suite with examples
```

## Architecture

### Service Layers

```
┌─────────────────────────────────────────┐
│   Patient / Staff Interface             │
│   (UI Components, Manual Triggers)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   /api/checkin/notify (Route Handler)   │
│   - Validates requests                  │
│   - Routes to service methods           │
│   - Returns formatted responses         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   CheckInMessagingService               │
│   - sendPreArrivalReminder()            │
│   - sendCustomInstructions()            │
│   - sendWaitingNotificationToStaff()    │
│   - sendProviderReadyNotification()     │
│   - sendCheckInConfirmation()           │
│   - sendCompleteCheckInPackage()        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│   MessagingService (Core)               │
│   - sendSMS()                           │
│   - Rate limiting                       │
│   - Message queueing                    │
│   - Twilio integration                  │
└─────────────────────────────────────────┘
```

## API Endpoints

### 1. Pre-Arrival 15-Minute Reminder

**Endpoint:** `POST /api/checkin/notify?type=pre-arrival`

**Purpose:** Send check-in link and appointment details 15 minutes before scheduled time

**Request Body:**
```json
{
  "appointmentId": "apt_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pre-arrival reminder sent successfully",
  "notification": {
    "type": "pre_arrival_15min",
    "appointmentId": "apt_123",
    "patientPhone": "+15551234567",
    "messageId": "SM1234567890abcdef",
    "status": "sent",
    "sentAt": "2024-01-09T15:30:00Z"
  }
}
```

**Message Template:**
```
Hi {{patientFirstName}}! You have your {{serviceName}} appointment in 15 minutes at
{{appointmentAddress}}. Check in here: {{checkInLink}} or text HERE when you arrive.
{{parkingInfo}}
```

**Debug Output:**
```
[CheckIn] Sending 15-min pre-arrival reminder to +15551234567
[CheckIn] Message: Hi John! You have your Botox Treatment appointment in 15 minutes...
```

---

### 2. Custom Instructions

**Endpoint:** `POST /api/checkin/notify?type=custom-instructions`

**Purpose:** Send parking, directions, and special instructions

**Request Body:**
```json
{
  "appointmentId": "apt_123",
  "parkingInstructions": "Free parking in front lot",
  "directionsLink": "https://maps.google.com/?q=...",
  "specialInstructions": "Please arrive 10 minutes early"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Custom instructions sent successfully",
  "notification": {
    "type": "custom_instructions",
    "appointmentId": "apt_123",
    "patientPhone": "+15551234567",
    "messageId": "SM1234567890abcdef",
    "status": "sent",
    "sentAt": "2024-01-09T15:30:00Z"
  }
}
```

**Message Template:**
```
Hi {{patientFirstName}}, here are your arrival instructions: {{instructions}}
```

**Debug Output:**
```
[CheckIn] Sending custom instructions to +15551234567
[CheckIn] Instructions: Directions: https://maps.google.com/?q=... | Parking: Free parking in front lot | Please arrive 10 minutes early
```

---

### 3. Patient Waiting Notification (Staff)

**Endpoint:** `POST /api/checkin/notify?type=waiting-notification`

**Purpose:** Notify staff that patient has checked in and is waiting

**Request Body:**
```json
{
  "appointmentId": "apt_123",
  "staffPhone": "+15559876543",
  "waitingMinutes": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Staff notification sent successfully",
  "notification": {
    "type": "waiting_notification_staff",
    "appointmentId": "apt_123",
    "staffPhone": "+15559876543",
    "messageId": "SM1234567890abcdef",
    "status": "sent",
    "sentAt": "2024-01-09T15:30:00Z",
    "waitingMinutes": 5
  }
}
```

**Message Template:**
```
New arrival! {{patientName}} has checked in and is waiting. Service: {{serviceName}} | Room: {{roomNumber}} [Waiting {{waitingMinutes}}m]
```

**Debug Output:**
```
[CheckIn] Notifying staff at +15559876543
[CheckIn] Message: New arrival! John Doe has checked in and is waiting. Service: Botox Treatment | Room: 5 [Waiting 5m]
```

---

### 4. Provider Ready Notification

**Endpoint:** `POST /api/checkin/notify?type=provider-ready`

**Purpose:** Notify patient that provider is ready and they should come in

**Request Body:**
```json
{
  "appointmentId": "apt_123",
  "roomNumber": "Room 5"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Provider ready notification sent successfully",
  "notification": {
    "type": "provider_ready",
    "appointmentId": "apt_123",
    "patientPhone": "+15551234567",
    "messageId": "SM1234567890abcdef",
    "status": "sent",
    "sentAt": "2024-01-09T15:30:00Z",
    "roomNumber": "Room 5"
  }
}
```

**Message Template:**
```
Hi {{patientFirstName}}! {{providerName}} is ready for you. Please head to {{roomNumber}} now.
```

**Debug Output:**
```
[CheckIn] Notifying patient provider is ready: +15551234567
[CheckIn] Message: Hi John! Dr. Sarah Smith is ready for you. Please head to Room 5 now.
```

---

### 5. Check-In Confirmation

**Endpoint:** `POST /api/checkin/notify?type=confirmation`

**Purpose:** Confirm patient check-in status immediately after check-in

**Request Body:**
```json
{
  "appointmentId": "apt_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Check-in confirmation sent successfully",
  "notification": {
    "type": "checkin_confirmation",
    "appointmentId": "apt_123",
    "patientPhone": "+15551234567",
    "messageId": "SM1234567890abcdef",
    "status": "sent",
    "sentAt": "2024-01-09T15:30:00Z"
  }
}
```

**Message Template:**
```
You're all set, {{patientFirstName}}! Checked in for {{serviceName}} with {{providerName}}.
We'll let you know when your room is ready.
```

**Debug Output:**
```
[CheckIn] Sending check-in confirmation to +15551234567
[CheckIn] Message: You're all set, John! Checked in for Botox Treatment with Dr. Sarah Smith. We'll let you know when your room is ready.
```

---

### 6. Complete Check-In Package

**Endpoint:** `POST /api/checkin/notify?type=complete-package`

**Purpose:** Send all check-in communications in sequence (pre-arrival + custom instructions + confirmation)

**Request Body:**
```json
{
  "appointmentId": "apt_123",
  "includeCustomInstructions": true,
  "parkingInstructions": "Free parking in front lot",
  "directionsLink": "https://maps.google.com/?q=...",
  "specialInstructions": "Please arrive 10 minutes early",
  "roomNumber": "Room 5"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Complete check-in package sent successfully",
  "appointmentId": "apt_123",
  "patientPhone": "+15551234567",
  "notificationsSent": 3,
  "notifications": [
    {
      "type": "pre_arrival_15min",
      "messageId": "SM1234567890abc1",
      "status": "sent"
    },
    {
      "type": "custom_instructions",
      "messageId": "SM1234567890abc2",
      "status": "sent"
    },
    {
      "type": "checkin_confirmation",
      "messageId": "SM1234567890abc3",
      "status": "sent"
    }
  ],
  "sentAt": "2024-01-09T15:30:00Z"
}
```

**Debug Output:**
```
[CheckIn] Sending complete check-in package for appointment apt_123
[CheckIn] Pre-arrival reminder sent successfully
[CheckIn] Custom instructions sent successfully
[CheckIn] Check-in confirmation sent successfully
```

---

### 7. Get Notification History

**Endpoint:** `GET /api/checkin/notify?appointmentId=apt_123`

**Purpose:** Retrieve all notifications sent for a specific appointment

**Response:**
```json
{
  "success": true,
  "appointmentId": "apt_123",
  "notificationCount": 4,
  "notifications": [
    {
      "type": "pre_arrival_15min",
      "patientName": "John Doe",
      "patientPhone": "+15551234567",
      "sentAt": "2024-01-09T15:30:00Z",
      "status": "sent",
      "messageId": "SM1234567890abc1"
    },
    {
      "type": "custom_instructions",
      "patientName": "John Doe",
      "patientPhone": "+15551234567",
      "sentAt": "2024-01-09T15:30:30Z",
      "status": "sent",
      "messageId": "SM1234567890abc2"
    },
    {
      "type": "checkin_confirmation",
      "patientName": "John Doe",
      "patientPhone": "+15551234567",
      "sentAt": "2024-01-09T15:30:45Z",
      "status": "sent",
      "messageId": "SM1234567890abc3"
    },
    {
      "type": "provider_ready",
      "patientName": "John Doe",
      "patientPhone": "+15551234567",
      "sentAt": "2024-01-09T15:45:00Z",
      "status": "sent",
      "messageId": "SM1234567890abc4"
    }
  ]
}
```

---

## Testing Check-In Messaging

### Using curl

```bash
# Pre-arrival reminder
curl -X POST http://localhost:3000/api/checkin/notify?type=pre-arrival \
  -H "Content-Type: application/json" \
  -d '{"appointmentId": "apt_1"}'

# Custom instructions
curl -X POST http://localhost:3000/api/checkin/notify?type=custom-instructions \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "apt_1",
    "parkingInstructions": "Front lot",
    "specialInstructions": "Arrive 10 min early"
  }'

# Waiting notification
curl -X POST http://localhost:3000/api/checkin/notify?type=waiting-notification \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "apt_1",
    "staffPhone": "+15559876543",
    "waitingMinutes": 5
  }'

# Provider ready
curl -X POST http://localhost:3000/api/checkin/notify?type=provider-ready \
  -H "Content-Type: application/json" \
  -d '{"appointmentId": "apt_1", "roomNumber": "Room 5"}'

# Confirmation
curl -X POST http://localhost:3000/api/checkin/notify?type=confirmation \
  -H "Content-Type: application/json" \
  -d '{"appointmentId": "apt_1"}'

# Complete package
curl -X POST http://localhost:3000/api/checkin/notify?type=complete-package \
  -H "Content-Type: application/json" \
  -d '{
    "appointmentId": "apt_1",
    "includeCustomInstructions": true,
    "parkingInstructions": "Front lot",
    "roomNumber": "Room 5"
  }'

# Get history
curl http://localhost:3000/api/checkin/notify?appointmentId=apt_1
```

### Using fetch

```javascript
// Pre-arrival reminder
const response = await fetch('/api/checkin/notify?type=pre-arrival', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ appointmentId: 'apt_1' })
});
const data = await response.json();
console.log(data);

// Custom instructions
const response2 = await fetch('/api/checkin/notify?type=custom-instructions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    appointmentId: 'apt_1',
    parkingInstructions: 'Front lot parking',
    directionsLink: 'https://maps.google.com/...',
    specialInstructions: 'Arrive 10 minutes early'
  })
});
const data2 = await response2.json();
console.log(data2);

// Get history
const historyResponse = await fetch('/api/checkin/notify?appointmentId=apt_1');
const history = await historyResponse.json();
console.log(history);
```

---

## Debugging Console Output

### Enable logging

The service logs all operations to console. Look for these prefixes:

- `[CheckIn]` - Service-level operations
- `[CheckIn API]` - API route operations
- `[SMS]` - SMS sending details

### Example debug trace

```
[CheckIn API] Received notification request: type=pre-arrival
[CheckIn API] Body: {
  "appointmentId": "apt_123"
}
[CheckIn] Sending 15-min pre-arrival reminder to +15551234567
[CheckIn] Message: Hi John! You have your Botox Treatment appointment in 15 minutes at Luxe Medical Spa. Check in here: http://localhost:3000/check-in?apt=apt_123 or text HERE when you arrive. Parking: Free parking in front lot
[SMS] Sending to +15551234567: Hi John! You have your Botox Treatment appointment in 15 minutes...
[CheckIn] Recorded notification: pre_arrival_15min (SM1234567890abcdef)
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Appointment not found" | Invalid appointmentId | Verify appointment exists in database |
| "Missing required appointment data" | Phone or patientName is missing | Ensure appointment has phone and patient name |
| "Failed to send SMS" | Twilio error | Check Twilio credentials and account status |
| "Invalid appointment type" | Unknown notification type | Use valid type: pre-arrival, custom-instructions, etc. |

### Error Response Format

```json
{
  "error": "Appointment not found",
  "status": 404
}
```

---

## Integration with Existing Check-In Flow

### Current Check-In Routes

1. **Check-In via SMS:** `/api/waiting-room/check-in`
   - Patient texts "HERE" to clinic number
   - Marks appointment as `in_car` status

2. **Call Patient:** `/api/waiting-room/call-patient`
   - Staff calls patient when room is ready
   - Updates status to `room_ready`
   - Sends SMS: "Your room is ready. Please come in."

3. **Check-In Confirmation:** `/api/waiting-room/queue`
   - Staff marks patient as `checked_in`
   - Updates waiting room dashboard

### Enhanced Flow with New Service

```
Patient arrives
    ↓
Send pre-arrival reminder (15 min before)
    ↓
Patient texts "HERE" → Check-In API processes
    ↓
Send check-in confirmation
    ↓
Send waiting notification to staff
    ↓
Staff sees patient waiting
    ↓
Staff calls "Call Patient" button
    ↓
Send provider-ready notification
    ↓
Patient comes in for treatment
```

---

## Data Flow Example

### Complete appointment check-in sequence

```
1. Appointment scheduled at 2:00 PM

2. 1:45 PM - Cron/Scheduled task triggers
   POST /api/checkin/notify?type=pre-arrival
   - Sends: "Hi John! You have your appointment in 15 minutes..."
   - Includes check-in link: http://localhost:3000/check-in?apt=apt_123

3. 1:55 PM - Patient arrives at clinic
   - Scans QR code or enters check-in page
   - Submits check-in form
   - Backend calls: POST /api/waiting-room/check-in
   - Status → "in_car"

4. Immediately - Auto-send confirmations
   POST /api/checkin/notify?type=confirmation
   - Sends: "You're all set, John! Checked in for Botox..."

5. Staff receives notification
   POST /api/checkin/notify?type=waiting-notification
   - Sends: "New arrival! John Doe checked in..."
   - Includes room assignment: "Room 5"

6. 2:05 PM - Room is ready, provider available
   Staff clicks "Call Patient"
   POST /api/checkin/notify?type=provider-ready
   - Sends: "Hi John! Dr. Sarah is ready. Please head to Room 5."

7. Patient enters treatment room
   Treatment begins
```

---

## Message Templates Reference

All templates use `{{variable}}` syntax for dynamic content replacement.

### Variables Available

- `{{patientFirstName}}` - First name from patientName
- `{{patientName}}` - Full name
- `{{serviceName}}` - Treatment/service name
- `{{providerName}}` - Provider/practitioner name
- `{{appointmentDate}}` - Formatted date
- `{{appointmentTime}}` - Scheduled time
- `{{appointmentAddress}}` - Clinic address
- `{{roomNumber}}` - Treatment room assignment
- `{{checkInLink}}` - Mobile check-in URL
- `{{parkingInfo}}` - Parking instructions
- `{{instructions}}` - Custom instructions combined
- `{{directionsLink}}` - Google Maps link
- `{{specialInstructions}}` - Special arrival instructions

---

## Performance Notes

- Messages are sent sequentially with 500ms delays to avoid rate limiting
- Complete package sends 3 messages with ~1.5s total execution time
- Service maintains in-memory history (cleared on app restart)
- Production: Implement database persistence for notification history

---

## Security Considerations

- All phone numbers validated before SMS sent
- SMS content limited to 1600 characters
- HIPAA-compliant message templates
- No sensitive data in unencrypted SMS
- Twilio integration with proper API authentication
- Rate limiting via Redis (100 messages/minute per phone)

---

## Files Reference

### `/src/services/checkin/messaging.ts`
- **Lines 1-50:** Imports and type definitions
- **Lines 50-125:** CheckInMessagingService class initialization
- **Lines 127-190:** sendPreArrivalReminder()
- **Lines 192-240:** sendCustomInstructions()
- **Lines 242-295:** sendWaitingNotificationToStaff()
- **Lines 297-350:** sendProviderReadyNotification()
- **Lines 352-410:** sendCheckInConfirmation()
- **Lines 412-500:** sendCompleteCheckInPackage()
- **Lines 502-600:** History management and helper methods

### `/src/app/api/checkin/notify/route.ts`
- **Lines 1-50:** Imports and request validation schemas
- **Lines 50-150:** POST request handler and routing logic
- **Lines 150-250:** Individual handler functions
- **Lines 250-350:** GET request handler for history

---

## Next Steps

1. **Database Integration:** Store notification history in persistent database
2. **Scheduled Reminders:** Wire up cron jobs to auto-send 15-min reminders
3. **UI Components:** Create dashboard to monitor and manually trigger notifications
4. **Analytics:** Track message delivery and patient engagement
5. **Customization:** Allow clinic admins to customize message templates

---

## Support & Troubleshooting

For detailed logs, check browser console and server logs with `[CheckIn]` prefix.

Test all endpoints with sample data before production deployment.

Ensure Twilio credentials are properly configured in `.env.local`.
