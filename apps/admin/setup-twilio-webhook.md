# Setting Up Two-Way SMS with Twilio

## Quick Setup for Testing (5 minutes)

### Step 1: Install ngrok
```bash
brew install ngrok
```

### Step 2: Start ngrok tunnel
```bash
# In a new terminal window
ngrok http 3000
```

You'll see something like:
```
Forwarding: https://abc123.ngrok.io -> http://localhost:3000
```

### Step 3: Configure Twilio Webhook

1. Go to https://console.twilio.com
2. Navigate to: Phone Numbers > Manage > Active Numbers
3. Click on your phone number
4. In the "Messaging" section:
   - Set "A message comes in" webhook to:
   ```
   https://YOUR-NGROK-URL.ngrok.io/api/messaging/webhook
   ```
   - Method: HTTP POST
5. Click "Save"

### Step 4: Test It!

1. Send a text TO your Twilio number
2. Check the terminal running `npm run dev` - you'll see the incoming message logged
3. The system will:
   - Process the message with AI
   - Determine intent (appointment confirmation, question, etc.)
   - Auto-respond if appropriate
   - Create alerts for urgent messages

## What Happens When Someone Texts You

When a patient texts your Twilio number:

1. **Twilio receives the SMS**
2. **Twilio sends it to your webhook** `/api/messaging/webhook`
3. **Your system processes it:**
   ```javascript
   // The webhook handler does this:
   - Identifies the patient by phone number
   - Analyzes message with AI
   - Checks for urgency/emergencies
   - Stores in conversation history
   - Sends auto-response if appropriate
   - Creates staff notifications
   ```

4. **Auto-responses work for:**
   - Appointment confirmations (Reply: C, CONFIRM, YES)
   - Appointment cancellations (Reply: CANCEL)
   - Reschedule requests (Reply: R, RESCHEDULE)
   - Emergency keywords (triggers immediate alert)

## Current Webhook Capabilities

Your `/api/messaging/webhook/route.ts` already handles:

✅ Incoming SMS parsing
✅ Patient identification
✅ AI intent analysis
✅ Emergency detection
✅ Auto-responses for common requests
✅ Appointment status updates
✅ Staff notifications
✅ Conversation threading

## For Production

When you deploy to production:

1. **Get a real domain** (e.g., luxemedspa.com)
2. **Set webhook to:** `https://luxemedspa.com/api/messaging/webhook`
3. **Register for A2P 10DLC** (for business messaging)
4. **Get a toll-free number** (easier approval process)

## Testing Without Ngrok

If you don't want to set up ngrok, you can still:

1. **Send messages** from the system (one-way)
2. **Test the webhook** manually:
```bash
curl -X POST http://localhost:3000/api/messaging/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=%2B17652500332&To=%2B1234567890&Body=I+need+to+reschedule&MessageSid=test123"
```

This simulates an incoming SMS for testing.