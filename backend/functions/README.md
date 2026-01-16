# Medical Spa Cloud Functions

Event-driven notifications and scheduled reminders for the Medical Spa Platform.

## Overview

This package contains Firebase Cloud Functions that handle:

1. **Firestore Triggers** - Real-time event handling
2. **Cloud Tasks** - Scheduled reminder delivery
3. **Push Notifications** - FCM-based patient notifications

## Functions

### Firestore Triggers

| Function | Trigger | Description |
|----------|---------|-------------|
| `onAppointmentCreated` | `appointments/{id}` created | Sends confirmation + schedules reminders |
| `onAppointmentUpdated` | `appointments/{id}` updated | Handles cancellation/rescheduling |
| `onMessageCreated` | `messages/{conv}/items/{id}` created | Sends new message notification |
| `onWaitingRoomReady` | `waitingRoom/{loc}/queue/{id}` updated | "Your room is ready" notification |
| `onCheckInAvailable` | `appointments/{id}` updated | Mobile check-in available notification |

### HTTP Functions

| Function | Method | Description |
|----------|--------|-------------|
| `sendScheduledReminder` | POST | Cloud Tasks calls this when reminder is due |
| `triggerManualReminder` | POST | Admin endpoint for manual reminder testing |

## HIPAA Compliance

All notifications use generic messages without PHI:

- "Appointment Confirmed" (not "Your Botox at 2pm")
- "You have an upcoming appointment" (not treatment details)
- "New Message" (not message content)
- "Your room is ready" (no room number in push)

## Setup

### Prerequisites

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Install gcloud CLI (for Cloud Tasks)
# https://cloud.google.com/sdk/docs/install
```

### Installation

```bash
cd backend/functions
npm install
```

### Local Development

```bash
# Start emulators
npm run serve

# Or use Firebase Emulator Suite
firebase emulators:start
```

### Deployment

```bash
# Deploy all functions
./deploy.sh --project your-project-id --env production

# Deploy specific functions
./deploy.sh --only onAppointmentCreated,sendScheduledReminder
```

## Cloud Tasks Queue

The `appointment-reminders` queue handles scheduled reminder delivery:

```bash
# Create queue manually
gcloud tasks queues create appointment-reminders \
  --project=your-project \
  --location=us-central1 \
  --max-dispatches-per-second=10 \
  --max-concurrent-dispatches=100
```

## Configuration

Environment variables (set in Firebase):

```bash
firebase functions:config:set \
  app.region="us-central1" \
  tasks.queue="appointment-reminders"
```

## Project Structure

```
functions/
├── src/
│   ├── index.ts          # Main entry, Firestore triggers
│   ├── config.ts         # Configuration and message templates
│   ├── notifications.ts  # FCM push notification service
│   ├── reminders.ts      # HTTP reminder handlers
│   ├── tasks.ts          # Cloud Tasks integration
│   └── types.ts          # TypeScript type definitions
├── package.json
├── tsconfig.json
├── firebase.json
└── deploy.sh
```

## Testing

```bash
# Run tests
npm test

# Test with emulators
firebase emulators:exec "npm test"
```

## Monitoring

```bash
# View logs
firebase functions:log

# Stream logs
firebase functions:log --follow

# Filter by function
firebase functions:log --only onAppointmentCreated
```

## Error Handling

- Failed notifications are logged for audit
- Cloud Tasks retries failed reminders (max 5 attempts)
- Invalid FCM tokens are automatically cleaned up
- Cancelled appointments don't receive reminders
