# Form Notification Service - Quick Reference

## Files Created

```
src/services/forms/notification-service.ts       (Primary service)
src/app/api/forms/notify/route.ts                (API endpoint)
src/__tests__/forms/notification-service.test.ts (Tests & examples)
FORM_NOTIFICATION_GUIDE.md                       (Full documentation)
FORM_NOTIFICATION_QUICK_REFERENCE.md             (This file)
```

## Quick Start

### 1. Notify Staff of Form Completion

```typescript
import { handleFormCompletion } from '@/services/forms/notification-service';

// Single form
await handleFormCompletion('patient-123', 'John Doe', 'form-hipaa', 'apt-456');

// Via API
await fetch('/api/forms/notify', {
  method: 'POST',
  body: JSON.stringify({
    patientId: 'patient-123',
    patientName: 'John Doe',
    formId: 'form-hipaa',
    appointmentId: 'apt-456',
    action: 'completed'
  })
});
```

### 2. Track Form Completion

```typescript
import { getFormCompletionTracking } from '@/services/forms/notification-service';

const tracking = getFormCompletionTracking('patient-123');
console.log(tracking.completedCount, tracking.completionPercentage);
```

### 3. Send Pre-Visit Reminder

```typescript
import { sendPreVisitFormReminder } from '@/services/forms/notification-service';

await sendPreVisitFormReminder(
  'patient-123',
  'John Doe',
  'Botox',
  'apt-456',
  '2:00 PM'
);
```

### 4. Get Recipients for a Form

```typescript
import { getFormNotificationRecipients } from '@/services/forms/notification-service';

const recipients = getFormNotificationRecipients('form-botox');
// { enabled: true, roles: ['admin', 'staff'], emails: [] }
```

### 5. Generate Form View Link

```typescript
import { generateFormViewLink } from '@/services/forms/notification-service';

const link = generateFormViewLink('patient-123', 'form-hipaa', 'apt-456');
// https://app.example.com/patients/patient-123?form=form-hipaa&apt=apt-456
```

## Key Exports

### Functions

| Function | Purpose |
|----------|---------|
| `notifyFormSubmitted()` | Notify staff when form submitted |
| `handleFormCompletion()` | Mark form complete + notify |
| `sendPreVisitFormReminder()` | Send reminder for incomplete forms |
| `getFormCompletionTracking()` | Get patient's form progress |
| `getFormNotificationRecipients()` | Get who to notify for form |
| `generateFormViewLink()` | Create link to view form |
| `notifyBatchFormSubmissions()` | Notify on multiple forms |
| `markFormAsViewed()` | Mark form as viewed |
| `updateFormNotificationConfig()` | Customize recipients |

### Types

```typescript
interface FormNotificationConfig {
  enabled: boolean;
  recipientRoles?: string[];
  recipientEmails?: string[];
  includeDetails: boolean;
  customMessage?: string;
}
```

## API Endpoint: POST /api/forms/notify

### Actions

| Action | Required | Purpose |
|--------|----------|---------|
| `completed` | formId \| formIds | Mark form(s) complete + notify |
| `viewed` | formId | Mark form viewed |
| `reminder` | serviceName, appointmentTime | Send incomplete forms reminder |
| `status` | formId | Get form status |
| `recipients` | formId | Get who to notify |
| `tracking` | (none) | Get patient's progress |

### Example Requests

```bash
# Single form completion
curl -X POST http://localhost:3000/api/forms/notify \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "p1",
    "patientName": "John Doe",
    "formId": "form-hipaa",
    "action": "completed"
  }'

# Batch forms
curl -X POST http://localhost:3000/api/forms/notify \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "p1",
    "patientName": "John Doe",
    "formIds": ["form-hipaa", "form-botox"],
    "action": "completed"
  }'

# Pre-visit reminder
curl -X POST http://localhost:3000/api/forms/notify \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "p1",
    "patientName": "John Doe",
    "serviceName": "Botox",
    "appointmentTime": "2:00 PM",
    "action": "reminder"
  }'

# Get tracking
curl -X GET "http://localhost:3000/api/forms/notify?patientId=p1"
```

## Integration Points

### In Form Submission Component

```typescript
// forms/[patientId]/page.tsx
async function onFormSubmit(formData) {
  // ... validate & submit form ...

  // Notify staff
  const response = await fetch('/api/forms/notify', {
    method: 'POST',
    body: JSON.stringify({
      patientId: patient.id,
      patientName: patient.name,
      formId: form.id,
      appointmentId: appointment?.id,
      action: 'completed'
    })
  });
}
```

### In Check-In Component

```typescript
// waiting-room/page.tsx
async function handleCheckIn() {
  // ... check in logic ...

  // Send reminder for incomplete forms
  await fetch('/api/forms/notify', {
    method: 'POST',
    body: JSON.stringify({
      patientId: patient.id,
      patientName: patient.name,
      serviceName: appointment.serviceName,
      appointmentTime: appointment.time,
      action: 'reminder'
    })
  });
}
```

### In Notification Dashboard

```typescript
// Display form notifications
const notifications = notificationService.getNotifications();
const formNotifs = notifications.filter(
  n => n.data?.intent === 'form_submission'
);

formNotifs.forEach(notif => {
  // Display as card with link to view form
  const link = notif.data?.actionUrl;
});
```

## Notification Types

Forms that trigger notifications:

```typescript
// Consent Forms (High Priority)
'form-botox'           -> Notify admin + staff
'form-filler'          -> Notify admin + staff
'form-laser'           -> Notify admin + staff
'form-chemical-peel'   -> Notify admin + staff
'form-microneedling'   -> Notify admin + staff
'form-massage'         -> Notify admin + staff
'form-physio'          -> Notify admin + staff
'form-chiro'           -> Notify admin + staff
'form-xray'            -> Notify admin + staff

// Intake Forms (High Priority)
'form-hipaa'           -> Notify admin
'form-general'         -> Notify admin + staff

// Aftercare Forms (Normal Priority)
'form-*-aftercare'     -> Notify admin only
```

## Logging Output

When using the service, you'll see logs like:

```
[FormNotification] Form completion: { patientId: 'p1', formId: 'form-hipaa' }
[FormNotification] Notified staff of form submission: { patientId: 'p1', priority: 'high' }
[NotificationStore] Created staff notification: notif-1234567
[FormNotification] Pre-visit reminder: { patientId: 'p1', serviceName: 'Botox' }
[FormNotification] Updated config for form-hipaa: { enabled: true, ... }
```

## Customization

### Change Notification Recipients

```typescript
import { updateFormNotificationConfig } from '@/services/forms/notification-service';

// Notify different people for a form
updateFormNotificationConfig('form-botox', {
  enabled: true,
  recipientRoles: ['admin', 'staff', 'provider'],
  includeDetails: true,
  customMessage: 'Botox consent received'
});
```

### Disable Notifications for a Form

```typescript
updateFormNotificationConfig('form-general', {
  enabled: false
});
```

## Testing

### Run Tests

```bash
npm test -- notification-service.test.ts
```

### Manual Testing

```typescript
// In browser console
import { runDevelopmentTests } from '@/tests/forms/notification-service.test'
runDevelopmentTests()
```

## Troubleshooting

### Notification Not Appearing

1. Check form is configured in `FORM_NOTIFICATION_RECIPIENTS`
2. Verify `enabled: true` in config
3. Check browser console for errors
4. Verify patient ID format

### Missing Links

1. Ensure `NEXT_PUBLIC_APP_URL` is set in `.env`
2. Check `generateFormViewLink()` output format
3. Verify `/patients/[patientId]` route exists

### Batch Notifications Failing

Check `failedForms` and `errors` in response:

```typescript
const result = await notifyBatchFormSubmissions(...);
if (result.failedForms.length > 0) {
  console.error(result.errors);
}
```

## Performance Tips

- Use batch notifications for multiple forms
- Cache recipient lists in production
- Implement async notifications with queue
- Limit notification frequency per patient
- Archive old notifications after 30 days

## Production Checklist

- [ ] Configure actual email/SMS recipients
- [ ] Implement database storage instead of in-memory
- [ ] Add audit logging
- [ ] Set up error monitoring (Sentry)
- [ ] Configure rate limiting
- [ ] Test with production data volume
- [ ] Set up notification delivery tracking
- [ ] Create admin UI for recipient management

## Support

For questions or issues:
1. Check FORM_NOTIFICATION_GUIDE.md for detailed docs
2. Review test cases in notification-service.test.ts
3. Check server logs for error details
4. Verify API response format
