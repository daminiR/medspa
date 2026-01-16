# Webhooks Integration Guide

## Quick Start (3 Steps)

### Step 1: Add to Routes Index

Edit `/src/routes/index.ts`:

```typescript
// Add import at top
import messagingWebhooks from './messaging-webhooks';

// Add route (around line 102, where webhooks comment is)
api.route('/webhooks', messagingWebhooks);
```

**Before:**
```typescript
// Webhooks (external service callbacks)
// api.route('/webhooks', webhooks);

export { api, health };
```

**After:**
```typescript
// Webhooks (external service callbacks)
api.route('/webhooks', messagingWebhooks);

export { api, health };
```

### Step 2: Set Environment Variables (Optional for dev)

Create `.env` in backend directory:

```bash
# Required for production only
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890

# Already in config.ts with defaults
PORT=8080
NODE_ENV=development
```

### Step 3: Test Locally

```bash
# Start server
npm run dev

# Test health endpoint
curl http://localhost:8080/api/webhooks/twilio/health

# Expected response:
{
  "status": "healthy",
  "service": "twilio-webhooks",
  "timestamp": "2024-12-20T15:30:00Z",
  "configured": false  // false in dev without credentials
}

# Test inbound webhook
curl -X POST http://localhost:8080/api/webhooks/twilio/inbound \
  -d "MessageSid=SM123test" \
  -d "From=%2B11234567890" \
  -d "To=%2B10987654321" \
  -d "Body=STOP" \
  -d "NumMedia=0"

# Check console for:
=== SMS Response (Development Mode) ===
To: +11234567890
Body: You've been unsubscribed from Luxe Medical Spa...
======================================

# Get inbound messages
curl http://localhost:8080/api/webhooks/twilio/inbound-messages

# Expected response:
{
  "messages": [
    {
      "id": "...",
      "messageSid": "SM123test",
      "from": "+11234567890",
      "to": "+10987654321",
      "body": "STOP",
      "isOptOut": true,
      "processed": true
    }
  ],
  "total": 1
}
```

## Production Deployment

### Step 1: Add Environment Variables to Cloud Run

```bash
gcloud run services update medical-spa-api \
  --set-env-vars TWILIO_ACCOUNT_SID=AC... \
  --set-env-vars TWILIO_AUTH_TOKEN=... \
  --set-env-vars TWILIO_PHONE_NUMBER=+1234567890
```

Or via Google Cloud Console:
1. Navigate to Cloud Run service
2. Edit service → Variables & Secrets
3. Add environment variables

### Step 2: Configure Twilio Webhooks

1. Log in to [Twilio Console](https://console.twilio.com)
2. Navigate to **Phone Numbers > Manage > Active Numbers**
3. Click your phone number
4. Scroll to **Messaging Configuration**

**Configure "A MESSAGE COMES IN":**
- Method: `POST`
- URL: `https://your-api.example.com/api/webhooks/twilio/inbound`

**Configure "STATUS CALLBACK URL":**
- URL: `https://your-api.example.com/api/webhooks/twilio/status`

5. Save changes

### Step 3: Verify Webhooks

Send a test SMS to your Twilio number:
```
Send: "Hello"
```

Check Cloud Run logs:
```bash
gcloud run logs read medical-spa-api --limit 50
```

Look for:
```
📩 Inbound SMS: {
  from: '+11234567890',
  patientId: '...',
  bodyLength: 5
}
```

## Testing Scenarios

### Test 1: Opt-Out

```bash
# Send STOP keyword
curl -X POST http://localhost:8080/api/webhooks/twilio/inbound \
  -d "MessageSid=SM001" \
  -d "From=%2B11234567890" \
  -d "Body=STOP"

# Expected console output:
Patient patient-xxx opted out of SMS messages

=== SMS Response (Development Mode) ===
To: +11234567890
Body: You've been unsubscribed from Luxe Medical Spa...
======================================

# Verify opt-out
curl http://localhost:8080/api/webhooks/twilio/inbound-messages

# Check message:
{
  "messageSid": "SM001",
  "body": "STOP",
  "isOptOut": true,
  "processed": true
}
```

### Test 2: Emergency Detection

```bash
# Send emergency message
curl -X POST http://localhost:8080/api/webhooks/twilio/inbound \
  -d "MessageSid=SM002" \
  -d "From=%2B11234567890" \
  -d "Body=Severe%20pain%20and%20swelling"

# Expected console output:
🚨 EMERGENCY ALERT CREATED: {
  alertId: 'alert-xxx',
  patientPhone: '+11234567890',
  keywords: ['SEVERE PAIN'],
  message: 'Severe pain and swelling'
}

=== SMS Response (Development Mode) ===
To: +11234567890
Body: We received your message. If this is a medical emergency...
======================================

# Get alerts
curl http://localhost:8080/api/webhooks/twilio/alerts

# Check alert:
{
  "alerts": [
    {
      "type": "emergency",
      "patientPhone": "+11234567890",
      "message": "Severe pain and swelling",
      "triggerKeywords": ["SEVERE PAIN"],
      "acknowledgedAt": null
    }
  ]
}
```

### Test 3: Simple Command

```bash
# Send confirm command
curl -X POST http://localhost:8080/api/webhooks/twilio/inbound \
  -d "MessageSid=SM003" \
  -d "From=%2B11234567890" \
  -d "Body=C"

# Expected console output:
📩 Inbound SMS: {
  from: '+11234567890',
  patientId: 'patient-xxx',
  bodyLength: 1,
  detectedCommand: 'confirm'
}

# Get messages
curl http://localhost:8080/api/webhooks/twilio/inbound-messages

# Check command:
{
  "messageSid": "SM003",
  "body": "C",
  "detectedCommand": "confirm"
}
```

### Test 4: Status Update

```bash
# Simulate delivery status
curl -X POST http://localhost:8080/api/webhooks/twilio/status \
  -d "MessageSid=SM123" \
  -d "MessageStatus=delivered" \
  -d "To=%2B11234567890"

# Expected console output:
📊 Status Update: {
  messageSid: 'SM123',
  status: 'delivered',
  to: '+11234567890'
}

# Get status updates
curl http://localhost:8080/api/webhooks/twilio/status-updates

# Check update:
{
  "updates": [
    {
      "messageSid": "SM123",
      "messageStatus": "delivered",
      "to": "+11234567890"
    }
  ]
}
```

### Test 5: Error Handling (Carrier Block)

```bash
# Simulate carrier block
curl -X POST http://localhost:8080/api/webhooks/twilio/status \
  -d "MessageSid=SM456" \
  -d "MessageStatus=failed" \
  -d "ErrorCode=30004" \
  -d "ErrorMessage=Message%20blocked" \
  -d "To=%2B11234567890"

# Expected console output:
Message blocked by carrier for +11234567890 (error 30004)

📊 Status Update: {
  messageSid: 'SM456',
  status: 'failed',
  errorCode: '30004',
  to: '+11234567890'
}
```

## Monitoring

### Health Check Endpoint

```bash
# Check webhook service status
curl https://your-api.example.com/api/webhooks/twilio/health

# Response:
{
  "status": "healthy",
  "service": "twilio-webhooks",
  "timestamp": "2024-12-20T15:30:00Z",
  "configured": true
}
```

Add to monitoring:
- **Google Cloud Monitoring:** Create uptime check
- **URL:** `https://your-api.example.com/api/webhooks/twilio/health`
- **Expected:** Status 200, body contains `"status": "healthy"`

### Debug Endpoints (Development Only)

```bash
# Get recent messages
curl https://your-api.example.com/api/webhooks/twilio/inbound-messages

# Get status updates
curl https://your-api.example.com/api/webhooks/twilio/status-updates

# Get emergency alerts
curl https://your-api.example.com/api/webhooks/twilio/alerts

# Get all conversations
curl https://your-api.example.com/api/webhooks/twilio/conversations
```

**Security Note:** In production, add authentication to these debug endpoints or disable them.

## Troubleshooting

### Issue: "Invalid Twilio signature"

**Cause:** URL mismatch or wrong auth token

**Solution:**
1. Check environment variable: `TWILIO_AUTH_TOKEN`
2. Verify webhook URL in Twilio matches exactly
3. Ensure using HTTPS in production
4. Check for trailing slashes

### Issue: Messages not received

**Cause:** Webhook URL not configured

**Solution:**
1. Check Twilio Console → Phone Numbers → Messaging Configuration
2. Verify webhook URL is correct
3. Test health endpoint: `curl https://your-api.../api/webhooks/twilio/health`
4. Check Cloud Run logs for errors

### Issue: SMS not sending

**Cause:** Missing Twilio credentials

**Solution:**
1. Verify environment variables are set
2. Check `configured: true` in health endpoint
3. In dev mode, SMS is mocked to console (expected behavior)

### Issue: Patient not found

**Cause:** Using in-memory storage

**Solution:**
This is expected with mock data. In production:
1. Migrate to Prisma database
2. Replace `findPatientByPhone()` with DB query
3. Patients will persist

## Database Migration (Future)

Replace in-memory Maps with Prisma:

```typescript
// Before (in-memory)
const patient = findPatientByPhone(phone);

// After (database)
const patient = await prisma.patient.findFirst({
  where: {
    phone: normalizedPhone,
  },
});

// Create patient
if (!patient) {
  patient = await prisma.patient.create({
    data: {
      phone: normalizedPhone,
      firstName: 'Unknown',
      lastName: 'Patient',
      smsConsent: false,
    },
  });
}
```

Add to Prisma schema:

```prisma
model Patient {
  id              String    @id @default(uuid())
  phone           String?   @unique
  phoneValid      Boolean   @default(true)
  phoneType       String?   // mobile, landline, voip
  smsConsent      Boolean   @default(false)
  smsConsentedAt  DateTime?
  smsOptOutAt     DateTime?
  // ... existing fields
}

model InboundMessage {
  id              String    @id @default(uuid())
  messageSid      String    @unique
  from            String
  to              String
  body            String
  numMedia        Int       @default(0)
  mediaUrls       String[]
  timestamp       DateTime  @default(now())
  conversationId  String?
  patientId       String?
  processed       Boolean   @default(false)
  isOptOut        Boolean   @default(false)
  isOptIn         Boolean   @default(false)
  isEmergency     Boolean   @default(false)
  detectedCommand String?

  conversation    Conversation? @relation(fields: [conversationId], references: [id])
  patient         Patient?      @relation(fields: [patientId], references: [id])
}

model StaffAlert {
  id               String    @id @default(uuid())
  type             String    // emergency, urgent, normal
  patientId        String?
  patientPhone     String
  message          String
  triggerKeywords  String[]
  createdAt        DateTime  @default(now())
  acknowledgedAt   DateTime?
  acknowledgedBy   String?

  patient          Patient?  @relation(fields: [patientId], references: [id])
}
```

## Next Steps

1. **Test locally:** Follow Quick Start above
2. **Deploy to staging:** Test with Twilio sandbox number
3. **Production deployment:** Configure production Twilio number
4. **Monitor webhooks:** Use Cloud Run logs and health endpoint
5. **Database migration:** Replace Maps with Prisma (when ready)

## Support

- **Documentation:** `/docs/MESSAGING_WEBHOOKS.md`
- **Flow diagrams:** `/docs/WEBHOOK_FLOWS.txt`
- **Implementation guide:** `/PRIORITY_7_WEBHOOKS_IMPLEMENTATION.md`
- **Twilio docs:** https://www.twilio.com/docs/messaging/webhooks

## Quick Reference

```bash
# Local development
npm run dev

# Test health
curl http://localhost:8080/api/webhooks/twilio/health

# Test opt-out
curl -X POST http://localhost:8080/api/webhooks/twilio/inbound \
  -d "MessageSid=SM001" -d "From=%2B11234567890" -d "Body=STOP"

# Test emergency
curl -X POST http://localhost:8080/api/webhooks/twilio/inbound \
  -d "MessageSid=SM002" -d "From=%2B11234567890" -d "Body=911"

# Get alerts
curl http://localhost:8080/api/webhooks/twilio/alerts

# Get messages
curl http://localhost:8080/api/webhooks/twilio/inbound-messages
```

---

**Integration Status:** Ready for testing
**Production Status:** Ready for deployment
**Database:** In-memory (migrate to Prisma when ready)
