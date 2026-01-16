# Messaging Webhooks API

## Overview

The Messaging Webhooks API handles Twilio webhook callbacks for SMS messaging with patients. It provides automatic opt-out/opt-in processing, emergency detection, and message status tracking.

**File:** `/src/routes/messaging-webhooks.ts` (~835 lines)

## Endpoints

### Health Check

```
GET /api/webhooks/twilio/health
```

Returns the health status of the webhook service.

**Response:**
```json
{
  "status": "healthy",
  "service": "twilio-webhooks",
  "timestamp": "2024-12-20T10:30:00Z",
  "configured": true
}
```

### Inbound SMS Webhook

```
POST /api/webhooks/twilio/inbound
```

Receives incoming SMS messages from patients via Twilio.

**Twilio Configuration:**
- Content-Type: `application/x-www-form-urlencoded`
- Signature validation: Enabled in production
- Always returns `200 OK` (even on errors to prevent retries)

**Request Parameters (from Twilio):**
```
MessageSid: string       // Twilio message ID
From: string             // Patient phone number (E.164)
To: string               // Spa phone number
Body: string             // Message text
NumMedia: string         // Number of media attachments
MediaUrl0-9: string      // URLs to media files
```

**Processing Logic:**

1. **Signature Validation** - Validates Twilio signature (skipped in dev mode)
2. **Patient Lookup** - Finds patient by phone or creates new patient
3. **Opt-Out Detection** - Detects keywords: STOP, STOPALL, UNSUBSCRIBE, etc.
4. **Opt-In Detection** - Detects keywords: START, UNSTOP, YES
5. **Emergency Detection** - Detects: 911, EMERGENCY, SEVERE PAIN, etc.
6. **Command Detection** - Detects simple commands: C, R, HERE, YES, NO
7. **Conversation Management** - Creates/updates conversation thread
8. **Staff Alerts** - Creates urgent alerts for emergency messages

**Example Opt-Out Flow:**
```
Patient sends: "STOP"
→ System processes opt-out
→ Patient SMS consent = false
→ Auto-reply: "You've been unsubscribed from Luxe Medical Spa..."
→ Return 200 OK
```

**Example Emergency Flow:**
```
Patient sends: "Severe pain and swelling after botox"
→ System detects "SEVERE PAIN" keyword
→ Creates staff alert (type: emergency)
→ Auto-reply: "We received your message. If this is a medical emergency..."
→ Stores message in conversation
→ Return 200 OK
```

### Status Update Webhook

```
POST /api/webhooks/twilio/status
```

Receives delivery status updates from Twilio.

**Request Parameters:**
```
MessageSid: string       // Twilio message ID
MessageStatus: string    // queued, sending, sent, delivered, undelivered, failed
ErrorCode: string        // Error code (if failed)
ErrorMessage: string     // Error description
To: string               // Recipient phone
```

**Error Code Handling:**

| Code  | Meaning                    | Action                                    |
|-------|----------------------------|-------------------------------------------|
| 30003 | Unreachable handset        | Mark patient phone as invalid             |
| 30004 | Message blocked            | Carrier-level opt-out, disable SMS        |
| 30005 | Unknown destination        | Mark phone as invalid                     |
| 30006 | Landline/unreachable       | Mark as landline, disable SMS             |
| 30007 | Spam filter                | Create staff alert, review content        |

**Example Status Update:**
```
Twilio sends: MessageStatus=delivered
→ System finds outbound message by MessageSid
→ Updates status to "delivered"
→ Sets deliveredAt timestamp
→ Return 200 OK
```

## Testing Endpoints

### Get Inbound Messages

```
GET /api/webhooks/twilio/inbound-messages
```

Returns the last 50 inbound messages (for testing).

### Get Status Updates

```
GET /api/webhooks/twilio/status-updates
```

Returns the last 50 status updates (for testing).

### Get Staff Alerts

```
GET /api/webhooks/twilio/alerts
```

Returns the last 50 staff alerts (for testing).

### Get Conversations

```
GET /api/webhooks/twilio/conversations
```

Returns all active conversations (for testing).

## Keyword Detection

### Opt-Out Keywords (TCPA Compliant)
```
STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT,
REVOKE, OPTOUT, OPT OUT, OPT-OUT
```

### Opt-In Keywords
```
START, UNSTOP, SUBSCRIBE, OPTIN, OPT IN, YES
```

### Emergency Keywords
```
911, EMERGENCY, SEVERE PAIN, BLEEDING, ALLERGIC REACTION,
CAN'T BREATHE, CANNOT BREATHE, CHEST PAIN, INFECTION,
SWELLING FACE, VISION LOSS, SEIZURE, UNCONSCIOUS
```

### Simple Commands
```
C      → confirm appointment
R      → reschedule request
HERE   → check-in (arrived)
YES    → accept offer (waitlist)
NO     → decline offer
```

## Data Models

### InboundMessage
```typescript
{
  id: string;
  messageSid: string;        // Twilio message ID
  from: string;              // Patient phone (E.164)
  to: string;                // Spa phone
  body: string;              // Message text
  numMedia: number;          // Number of attachments
  mediaUrls: string[];       // Media file URLs
  timestamp: Date;
  conversationId?: string;
  patientId?: string;
  processed: boolean;
  isOptOut?: boolean;
  isOptIn?: boolean;
  isEmergency?: boolean;
  detectedCommand?: string;
}
```

### StatusUpdate
```typescript
{
  id: string;
  messageSid: string;
  messageStatus: 'queued' | 'sending' | 'sent' | 'delivered' | 'undelivered' | 'failed';
  errorCode?: string;
  errorMessage?: string;
  to: string;
  timestamp: Date;
}
```

### StaffAlert
```typescript
{
  id: string;
  type: 'emergency' | 'urgent' | 'normal';
  patientId?: string;
  patientPhone: string;
  message: string;             // Original message text
  triggerKeywords: string[];   // Keywords that triggered alert
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;     // Staff user ID
}
```

### Conversation
```typescript
{
  id: string;
  patientId: string;
  patientPhone: string;
  lastMessageAt: Date;
  messageCount: number;
  unreadCount: number;
  status: 'active' | 'archived';
  createdAt: Date;
}
```

## Configuration

Required environment variables:

```bash
# Twilio Configuration (from config.ts)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890

# If not set, webhooks run in development mode
# (no signature validation, console logging only)
```

## Twilio Setup

### 1. Configure Webhook URLs in Twilio Console

**Messaging > Settings > Webhook URLs:**

- **Inbound Messages:** `https://your-api.com/api/webhooks/twilio/inbound`
- **Status Callbacks:** `https://your-api.com/api/webhooks/twilio/status`

### 2. Enable Signature Validation

Twilio automatically sends `X-Twilio-Signature` header. The webhook validates this in production.

### 3. Configure Phone Number

For each Twilio phone number:
- Navigate to **Phone Numbers > Active Numbers**
- Select your number
- Under **Messaging Configuration:**
  - Set "A MESSAGE COMES IN" webhook to your inbound URL
  - Set "PRIMARY HANDLER" to webhook
  - Enable "STATUS CALLBACK URL" to your status URL

## Development Mode

When `TWILIO_AUTH_TOKEN` is not set:

- ✅ Signature validation is skipped
- ✅ SMS sending is mocked (console output only)
- ✅ All other logic works normally
- ✅ Perfect for local testing

**Example Console Output:**
```
=== SMS Response (Development Mode) ===
To: +11234567890
Body: You've been unsubscribed from Luxe Medical Spa...
======================================
```

## Security

### Signature Validation

Uses Twilio's `validateRequest()` to verify webhooks are from Twilio:

```typescript
import twilio from 'twilio';

const isValid = twilio.validateRequest(
  authToken,
  signature,
  url,
  params
);
```

### Always Return 200 OK

To prevent Twilio from retrying failed webhooks:
- All endpoints return `200 OK`
- Even when errors occur
- Errors are logged but not returned to Twilio

### No Patient Data Exposure

- Webhooks are receive-only
- No sensitive data returned to Twilio
- All data stored in memory (replace with database)

## Integration Example

### Send Outbound Message (from your code)

```typescript
import twilio from 'twilio';
import { config } from './config';

const client = twilio(
  config.twilioAccountSid,
  config.twilioAuthToken
);

// Send message
const message = await client.messages.create({
  from: config.twilioPhoneNumber,
  to: '+11234567890',
  body: 'Your appointment is tomorrow at 2pm',
  statusCallback: 'https://your-api.com/api/webhooks/twilio/status',
});

// Store in outboundMessages map
outboundMessages.set(message.sid, {
  id: crypto.randomUUID(),
  externalSid: message.sid,
  conversationId: 'conv-123',
  to: '+11234567890',
  body: 'Your appointment is tomorrow at 2pm',
  status: 'queued',
  sentAt: new Date(),
});
```

### Webhook Receives Status Update

```
Twilio → POST /api/webhooks/twilio/status
MessageSid=SM123...
MessageStatus=delivered
→ System updates outboundMessages map
→ Sets deliveredAt timestamp
```

## Testing with cURL

### Simulate Inbound Message

```bash
curl -X POST http://localhost:8080/api/webhooks/twilio/inbound \
  -d "MessageSid=SM123abc" \
  -d "From=%2B11234567890" \
  -d "To=%2B10987654321" \
  -d "Body=STOP" \
  -d "NumMedia=0"
```

### Simulate Status Update

```bash
curl -X POST http://localhost:8080/api/webhooks/twilio/status \
  -d "MessageSid=SM123abc" \
  -d "MessageStatus=delivered" \
  -d "To=%2B11234567890"
```

### Get Recent Messages

```bash
curl http://localhost:8080/api/webhooks/twilio/inbound-messages
```

### Get Staff Alerts

```bash
curl http://localhost:8080/api/webhooks/twilio/alerts
```

## TCPA Compliance (April 2025)

The webhooks are compliant with new TCPA regulations:

✅ **Automatic Opt-Out Processing** - Instant detection and confirmation
✅ **Opt-Out Keywords** - All required keywords supported
✅ **Confirmation Messages** - Auto-reply to opt-out/opt-in
✅ **Carrier Blocking Detection** - Error code 30004 handling
✅ **Consent Timestamps** - smsConsentedAt, smsOptOutAt tracked
✅ **No Retries on Failure** - Always return 200 OK

## Next Steps

### Replace In-Memory Storage

Currently uses `Map<>` for storage. Replace with Prisma/database:

```typescript
// Instead of:
const patient = findPatientByPhone(phone);

// Use:
const patient = await prisma.patient.findFirst({
  where: { phone: normalizedPhone }
});
```

### Add Real-Time Updates

Use WebSockets or SSE to push alerts to staff dashboard:

```typescript
// When emergency detected
createStaffAlert(...);
websocket.broadcast('staff-alert', alert);
```

### Implement Auto-Responses

Add AI-powered responses for common questions:

```typescript
if (!isOptOut && !isEmergency) {
  const response = await generateAutoResponse(Body);
  if (response) {
    await sendSMS(From, response);
  }
}
```

### Add Message Templates

Store common responses in database:

```typescript
const template = await prisma.messageTemplate.findFirst({
  where: { keyword: detectedCommand }
});
if (template) {
  await sendSMS(From, template.body);
}
```

## Support

For issues or questions:
- Check Twilio webhook logs in console
- Review staff alerts for emergency issues
- Use testing endpoints to debug message flow
- Enable signature validation only in production

## License

Part of the Medical Spa Platform - Internal Use Only
