# Twilio SMS Integration Setup Guide

## Overview
This medical spa EMR platform uses Twilio for SMS messaging, providing:
- Two-way SMS conversations with patients
- Automated appointment reminders (48hr, 24hr, 2hr)
- Post-treatment follow-ups
- No-show follow-ups
- Marketing campaigns (with opt-in compliance)
- HIPAA-compliant messaging

## Setup Instructions

### 1. Create Twilio Account
1. Go to [Twilio.com](https://www.twilio.com)
2. Sign up for an account
3. Complete verification
4. **Important**: Request HIPAA compliance and sign BAA (Business Associate Agreement)

### 2. Get Your Credentials
From Twilio Console (console.twilio.com):
- Account SID: Found on dashboard
- Auth Token: Found on dashboard (keep secret!)
- Phone Number: Buy a phone number from Phone Numbers > Manage > Buy a Number
- Messaging Service SID: Create under Messaging > Services

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your credentials:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+15551234567

# Cron Secret (generate a random string)
CRON_SECRET=your-secret-string-here
```

### 4. Set Up Webhook URL
In Twilio Console:
1. Go to Phone Numbers > Manage > Active Numbers
2. Click on your phone number
3. In "Messaging" section, set webhook URL:
   - **Webhook URL**: `https://your-domain.com/api/sms/webhook`
   - **Method**: HTTP POST
4. Save

### 5. Configure Cron Jobs (for automated reminders)

#### Using Vercel Cron (recommended for Vercel deployments):
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/appointment-reminders",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

#### Using External Cron Service:
Services like EasyCron or Cron-job.org can call:
```
GET https://your-domain.com/api/cron/appointment-reminders
Headers: Authorization: Bearer [your-cron-secret]
```

## Features

### 1. Manual SMS Sending
Staff can send SMS messages directly from the Messages page:
- Real-time two-way conversations
- Quick reply templates
- Character count indicator
- Delivery status tracking

### 2. Automated Appointment Reminders
System automatically sends:
- **Confirmation**: Immediately after booking
- **48-hour reminder**: 2 days before appointment
- **24-hour reminder**: 1 day before appointment  
- **2-hour reminder**: 2 hours before appointment

### 3. Response Handling
Patients can reply with:
- **C** or **Confirm**: Confirms appointment
- **R** or **Reschedule**: Request to reschedule
- **Cancel**: Cancel appointment
- Any question: Flagged for staff response

### 4. Post-Treatment Follow-ups
- Sent 24 hours after treatment
- Checks on patient wellbeing
- Includes care instructions based on treatment type

### 5. No-Show Follow-ups
- Sent 1 hour after missed appointment
- Gentle reminder to reschedule
- Maintains patient relationship

## SMS Templates

Located in `/src/lib/twilio.ts`, templates include:

### Appointment Reminders
```javascript
appointmentConfirmation: "Hi [Name], your [Service] appointment is confirmed for [Date] at [Time]. Reply C to confirm or R to reschedule."

appointmentReminder48hr: "Hi [Name], reminder: You have a [Service] appointment on [Date] at [Time]. Reply C to confirm."

appointmentReminder24hr: "Reminder: Your appointment is tomorrow at [Time]. Please arrive with a clean face. Avoid alcohol & blood thinners 24hrs before."

appointmentReminder2hr: "Hi [Name], see you soon at [Time] today! If you're running late, please call us."
```

### Follow-up Messages
```javascript
noShowFollowUp: "Hi [Name], we missed you at your appointment today. Please call us to reschedule. We hope everything is okay!"

postTreatmentFollowUp: "Hi [Name], how are you feeling after your [Treatment]? If you have any concerns, please don't hesitate to call us."
```

### Treatment-Specific Instructions
- Botox aftercare
- Filler aftercare
- Chemical peel aftercare
- Microneedling aftercare
- Laser treatment aftercare

## API Endpoints

### Send SMS
```
POST /api/sms/send
Body: {
  to: "+15551234567",
  message: "Your message here",
  patientId: "p123",
  appointmentId: "apt123", // optional
  type: "manual" // or "reminder", "follow-up"
}
```

### Receive SMS (Webhook)
```
POST /api/sms/webhook
Automatically called by Twilio when patient replies
```

### Send Reminders
```
POST /api/sms/reminders
Body: {
  type: "confirmation" | "reminder_48hr" | "reminder_24hr" | "reminder_2hr" | "no_show" | "post_treatment",
  appointments: [{
    patientName: "Sarah",
    patientPhone: "+15551234567",
    appointmentDate: "2024-01-15",
    appointmentTime: "2:00 PM",
    service: "Botox",
    appointmentId: "apt123",
    patientId: "p123"
  }]
}
```

### Cron Job (Automated)
```
GET /api/cron/appointment-reminders
Headers: Authorization: Bearer [CRON_SECRET]
```

## HIPAA Compliance

### Requirements:
1. **Business Associate Agreement (BAA)**: Must be signed with Twilio
2. **Encryption**: All messages are encrypted in transit
3. **Audit Logs**: All messages logged with timestamps
4. **Access Controls**: Role-based access to messaging features
5. **Opt-in/Opt-out**: Patients must consent to SMS

### Best Practices:
- Never include full SSN or credit card numbers
- Use patient first name only in messages
- Include opt-out instructions in marketing messages
- Store message logs for audit purposes
- Regular security training for staff

## Troubleshooting

### Common Issues:

1. **Messages not sending**:
   - Check Twilio credentials in .env
   - Verify phone number format (+1 for US/Canada)
   - Check Twilio account balance

2. **Not receiving replies**:
   - Verify webhook URL is correct
   - Check webhook logs in Twilio Console
   - Ensure your server is publicly accessible

3. **Reminders not sending**:
   - Verify cron job is running
   - Check cron logs
   - Ensure CRON_SECRET matches

## Cost Considerations

Twilio pricing (as of 2024):
- SMS sending: ~$0.0079 per message
- SMS receiving: ~$0.0075 per message
- Phone number: ~$1.15/month
- No charge for webhook calls

Estimate for typical medical spa (500 patients):
- ~2000 reminders/month: $16
- ~500 manual messages/month: $4
- Phone number: $1.15
- **Total: ~$21/month**

## Testing

### Local Development:
1. Use ngrok to expose local webhook:
   ```bash
   ngrok http 3000
   ```
2. Update Twilio webhook to ngrok URL
3. Test with real phone numbers

### Test Numbers:
Twilio provides test credentials for development:
- Won't send real SMS
- Won't charge account
- Good for CI/CD testing

## Support

- Twilio Support: support.twilio.com
- Twilio Status: status.twilio.com
- HIPAA Guide: twilio.com/docs/sms/hipaa-compliance