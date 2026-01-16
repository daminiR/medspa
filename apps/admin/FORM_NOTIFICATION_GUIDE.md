# Form Submission Notification Service - Implementation Guide

## Overview

The Form Submission Notification Service handles internal staff notifications when patients complete forms. It integrates with the existing form lifecycle system to notify staff, track form completion, and manage pre-visit form reminders.

## Files Created

### 1. Service Layer
**File:** `/src/services/forms/notification-service.ts`

The core notification service that handles:
- Form submission notifications
- Pre-visit form reminders
- Form completion tracking
- Recipient configuration per form type
- Batch notifications

### 2. API Endpoint
**File:** `/src/app/api/forms/notify/route.ts`

REST API endpoint for triggering notifications with actions:
- `completed` - Mark form as completed and notify staff
- `viewed` - Mark form as viewed by patient
- `reminder` - Send pre-visit reminder for incomplete forms
- `status` - Get form status
- `recipients` - Get notification recipients for a form type
- `tracking` - Get form completion tracking

### 3. Tests
**File:** `/src/__tests__/forms/notification-service.test.ts`

Comprehensive test suite covering:
- Link generation
- Recipient configuration
- Form submission notifications
- Form completion handling
- Pre-visit reminders
- Batch notifications
- Integration workflows

## Architecture

```
Patient Submits Form
         |
         v
    Form UI Calls API
         |
         v
/api/forms/notify (POST)
         |
         v
notification-service.ts
         |
         +--- notifyFormSubmitted() -----> createStaffNotification()
         |
         +--- markFormCompleted() -------> patientForms.ts
         |
         +--- getFormCompletionTracking() -> notificationStore.ts
         |
         v
Staff Dashboard Notification
```

## Key Features

### 1. Form Submission Notifications

When a patient completes a form, staff are notified immediately.

```typescript
// Example: Single form completion
const result = await handleFormCompletion(
  patientId: 'patient-123',
  patientName: 'John Doe',
  formId: 'form-hipaa',
  appointmentId: 'apt-456'
);
```

**Notification Configuration:**
- HIPAA forms: Notify admins only
- Consent forms: Notify admins and staff
- Intake forms: Notify admins and staff (high priority)
- Aftercare forms: Notify admins only

### 2. View Links

Generate clickable links to view forms in the admin interface:

```typescript
const link = generateFormViewLink('patient-123', 'form-hipaa', 'apt-456');
// Output: https://app.example.com/patients/patient-123?form=form-hipaa&apt=apt-456
```

### 3. Recipient Management

Configure who gets notified for each form type:

```typescript
// Get recipients for a form
const recipients = getFormNotificationRecipients('form-botox');
// Returns: { enabled: true, roles: ['admin', 'staff'], emails: [] }

// Update notification config
updateFormNotificationConfig('form-custom', {
  enabled: true,
  recipientRoles: ['admin'],
  includeDetails: true,
  customMessage: 'Custom form completed'
});
```

### 4. Form Completion Tracking

Track patient form completion progress:

```typescript
const tracking = getFormCompletionTracking('patient-123');
// Returns:
// {
//   completedForms: ['form-hipaa', 'form-botox'],
//   completedCount: 2,
//   completionPercentage: 100,
//   lastCompletedForm: 'form-botox',
//   lastCompletedAt: Date
// }
```

### 5. Pre-Visit Form Reminders

Send reminders for incomplete forms before appointment:

```typescript
const result = await sendPreVisitFormReminder(
  patientId: 'patient-123',
  patientName: 'John Doe',
  serviceName: 'Botox',
  appointmentId: 'apt-456',
  appointmentTime: '2:00 PM'
);
```

Creates staff notification with:
- Patient name and appointment time
- List of incomplete forms
- Link to send form reminder to patient
- Suggested actions (Send Reminder, Contact Patient, Reschedule)

### 6. Batch Notifications

Process multiple forms at once:

```typescript
const result = await notifyBatchFormSubmissions(
  patientId: 'patient-123',
  patientName: 'John Doe',
  formIds: ['form-hipaa', 'form-botox', 'form-general'],
  appointmentId: 'apt-456'
);
// Returns: { success, notifiedForms[], failedForms[], errors{} }
```

## API Endpoints

### POST /api/forms/notify

Trigger form notifications with different actions.

#### Action: `completed`
Mark form as completed and notify staff.

```bash
POST /api/forms/notify
Content-Type: application/json

{
  "patientId": "patient-123",
  "patientName": "John Doe",
  "formId": "form-hipaa",
  "appointmentId": "apt-456",
  "action": "completed"
}
```

Response:
```json
{
  "success": true,
  "message": "Form submitted and staff notified",
  "data": { "formId": "form-hipaa" }
}
```

#### Action: `viewed`
Mark form as viewed by patient.

```bash
POST /api/forms/notify
Content-Type: application/json

{
  "patientId": "patient-123",
  "formId": "form-botox",
  "action": "viewed"
}
```

#### Action: `reminder`
Send pre-visit reminder for incomplete forms.

```bash
POST /api/forms/notify
Content-Type: application/json

{
  "patientId": "patient-123",
  "patientName": "John Doe",
  "serviceName": "Botox",
  "appointmentTime": "2:00 PM",
  "appointmentId": "apt-456",
  "action": "reminder"
}
```

#### Action: `status`
Get status of a specific form.

```bash
POST /api/forms/notify
Content-Type: application/json

{
  "patientId": "patient-123",
  "formId": "form-hipaa",
  "action": "status"
}
```

Response:
```json
{
  "success": true,
  "message": "Form status retrieved",
  "data": {
    "formId": "form-hipaa",
    "status": {
      "id": "pfs-123",
      "patientId": "patient-123",
      "formId": "form-hipaa",
      "status": "completed",
      "sentAt": "2024-01-09T10:00:00Z",
      "completedAt": "2024-01-09T10:15:00Z"
    }
  }
}
```

#### Action: `recipients`
Get notification recipients for a form type.

```bash
POST /api/forms/notify
Content-Type: application/json

{
  "formId": "form-botox",
  "action": "recipients"
}
```

Response:
```json
{
  "success": true,
  "message": "Recipients retrieved",
  "data": {
    "formId": "form-botox",
    "recipients": {
      "enabled": true,
      "roles": ["admin", "staff"],
      "emails": []
    }
  }
}
```

#### Action: `tracking`
Get form completion tracking for a patient.

```bash
POST /api/forms/notify
Content-Type: application/json

{
  "patientId": "patient-123",
  "action": "tracking"
}
```

Response:
```json
{
  "success": true,
  "message": "Form completion tracking retrieved",
  "data": {
    "patientId": "patient-123",
    "tracking": {
      "completedForms": ["form-hipaa", "form-botox"],
      "completedCount": 2,
      "completionPercentage": 100,
      "lastCompletedForm": "form-botox",
      "lastCompletedAt": "2024-01-09T10:15:00Z"
    }
  }
}
```

### GET /api/forms/notify

Retrieve form tracking info or API documentation.

```bash
# Get tracking for a specific patient
GET /api/forms/notify?patientId=patient-123

# Get API documentation
GET /api/forms/notify
```

## Integration Points

### 1. Form Submission Workflow

When patient submits form:

```typescript
// In form submission handler (e.g., forms/[patientId]/page.tsx)
const response = await fetch('/api/forms/notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    patientId: patient.id,
    patientName: patient.name,
    formId: 'form-hipaa',
    appointmentId: appointment?.id,
    action: 'completed'
  })
});

if (response.ok) {
  console.log('Form submitted and staff notified');
  // Redirect to next form or confirmation
}
```

### 2. Check-In Workflow

When patient checks in, verify forms and send reminder if needed:

```typescript
// In check-in handler (e.g., waiting-room/page.tsx)
const response = await fetch('/api/forms/notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    patientId: patient.id,
    patientName: patient.name,
    serviceName: appointment.serviceName,
    appointmentTime: formatTime(appointment.scheduledTime),
    appointmentId: appointment.id,
    action: 'reminder'
  })
});
```

### 3. Cron Job Integration

Send pre-visit reminders automatically:

```typescript
// In cron job (e.g., /api/cron/form-reminders/route.ts)
for (const appointment of todayAppointments) {
  if (shouldSendFormReminder(appointment)) {
    await fetch('/api/forms/notify', {
      method: 'POST',
      body: JSON.stringify({
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        serviceName: appointment.serviceName,
        appointmentTime: formatTime(appointment.scheduledTime),
        appointmentId: appointment.id,
        action: 'reminder'
      })
    });
  }
}
```

### 4. Dashboard Notification Display

Display form completion notifications:

```typescript
// In notifications component
const notifications = notificationService.getNotifications();
const formNotifications = notifications.filter(n => n.data?.intent === 'form_submission');

return (
  <div className="space-y-2">
    {formNotifications.map(notif => (
      <NotificationCard
        key={notif.id}
        notification={notif}
        onAction={() => {
          // Navigate to form view
          const formLink = notif.data?.actionUrl;
          if (formLink) window.location.href = formLink;
        }}
      />
    ))}
  </div>
);
```

## Configuration

### Form Types and Recipients

The service comes pre-configured with recipient settings for all form types:

| Form Type | Category | Recipients | Priority |
|-----------|----------|-----------|----------|
| form-hipaa | Intake | Admin | Normal |
| form-general | Intake | Admin, Staff | High |
| form-botox | Consent | Admin, Staff | High |
| form-filler | Consent | Admin, Staff | High |
| form-laser | Consent | Admin, Staff | High |
| form-botox-aftercare | Aftercare | Admin | Normal |

### Customizing Recipients

Update recipient configuration:

```typescript
import { updateFormNotificationConfig } from '@/services/forms/notification-service';

// Add custom recipients for a form
updateFormNotificationConfig('form-custom', {
  enabled: true,
  recipientRoles: ['admin', 'staff', 'provider'],
  includeDetails: true,
  customMessage: 'Custom form submitted by patient'
});

// Disable notifications for a form type
updateFormNotificationConfig('form-aftercare', {
  enabled: false
});
```

## Debugging and Logging

The service includes comprehensive logging:

```
[FormNotification] Form completion: {...}
[FormNotification] Notified staff of form submission: {...}
[FormNotification] Pre-visit reminder: {...}
[FormNotification] Updated config for form-hipaa: {...}
```

Also logs to NotificationStore:
```
[NotificationStore] Created staff notification: {...}
```

Enable debug logging in environment:

```bash
# In .env.local
DEBUG=forms:*
```

## Testing

Run the test suite:

```bash
# Jest tests
npm run test -- notification-service.test.ts

# Development tests
npm run dev
# Then in browser console:
// import { runDevelopmentTests } from '@/tests/forms/notification-service.test'
// runDevelopmentTests()
```

## Common Use Cases

### 1. Notify on Single Form Completion

```typescript
import { handleFormCompletion } from '@/services/forms/notification-service';

const result = await handleFormCompletion(
  'patient-123',
  'John Doe',
  'form-hipaa',
  'apt-456'
);
```

### 2. Notify on Batch Form Completion

```typescript
import { notifyBatchFormSubmissions } from '@/services/forms/notification-service';

const result = await notifyBatchFormSubmissions(
  'patient-123',
  'John Doe',
  ['form-hipaa', 'form-general', 'form-botox'],
  'apt-456'
);

console.log(`Notified ${result.notifiedForms.length} forms`);
if (result.failedForms.length > 0) {
  console.error('Failed forms:', result.errors);
}
```

### 3. Send Pre-Visit Reminder

```typescript
import { sendPreVisitFormReminder } from '@/services/forms/notification-service';

const result = await sendPreVisitFormReminder(
  'patient-123',
  'John Doe',
  'Botox',
  'apt-456',
  '2:00 PM'
);
```

### 4. Track Form Completion

```typescript
import { getFormCompletionTracking } from '@/services/forms/notification-service';

const tracking = getFormCompletionTracking('patient-123');
console.log(`Patient has completed ${tracking.completedCount} forms`);
```

### 5. Get Notification Recipients

```typescript
import { getFormNotificationRecipients } from '@/services/forms/notification-service';

const recipients = getFormNotificationRecipients('form-botox');
if (recipients.enabled) {
  console.log('Form will notify:', recipients.roles);
}
```

## Production Considerations

### Database Integration

The current implementation uses in-memory storage via `notificationStore`. For production:

1. Replace `createStaffNotification()` calls with database inserts
2. Add email notifications for configured recipients
3. Add SMS notifications if needed
4. Implement notification delivery tracking

```typescript
// Example production integration
const notification = await database.notifications.create({
  userId: 'staff-all',
  type: 'form_required',
  title: `${formName} submitted`,
  body: message,
  data: { patientId, formId },
  channel: 'email', // or 'sms'
  priority: 'normal'
});

// Send email to recipients
for (const email of recipients.emails) {
  await sendEmail(email, notification);
}
```

### Scale Considerations

- Batch process notifications for high volume
- Use message queue (e.g., Bull, AWS SQS) for async notifications
- Cache recipient lists to reduce database queries
- Implement rate limiting on API endpoint

### Audit Trail

Add audit logging for compliance:

```typescript
import { logAuditEvent } from '@/services/security/audit-trail';

await logAuditEvent({
  action: 'form_submission_notification',
  userId: 'staff-1',
  patientId: 'patient-123',
  metadata: { formId, appointmentId }
});
```

## Summary

The Form Submission Notification Service provides:

- **Automated Notifications** - Staff notified when forms completed
- **Flexible Configuration** - Customize recipients per form type
- **Completion Tracking** - Monitor patient form progress
- **Pre-Visit Reminders** - Notify staff of incomplete forms
- **Batch Processing** - Handle multiple forms efficiently
- **View Links** - Direct links to completed forms
- **API Endpoint** - RESTful interface for integrations

The service integrates seamlessly with:
- Existing form lifecycle system
- Staff notification dashboard
- Patient form UI
- Appointment check-in workflow
- Cron job reminders
