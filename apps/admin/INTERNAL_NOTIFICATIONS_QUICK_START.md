# Internal Staff Notifications - Quick Start Guide

## Quick Overview

The internal staff notification system allows you to send notifications to staff members when important events occur. It's fully integrated, tested, and ready to use.

## How to Use It

### 1. Import the Service

```typescript
import { internalNotificationService, notifyStaff } from '@/services/internal-notifications'
```

### 2. Send a Notification

**Simple way (recommended)**:
```typescript
await notifyStaff('appointment_booked', {
  patient: {
    id: 'patient-123',
    name: 'Jane Doe',
    phone: '(555) 123-4567',
    email: 'jane@example.com'
  },
  appointment: {
    id: 'appt-456',
    date: 'January 15, 2026',
    time: '2:00 PM',
    service: 'Botox',
    provider: 'Dr. Smith'
  }
}, {
  source: 'online',  // 'online' | 'staff' | 'system' | 'patient'
  bookingChannel: 'online_portal',
  priority: 'high'
})
```

**Advanced way (more control)**:
```typescript
await internalNotificationService.sendNotification({
  eventType: 'appointment_booked',
  timestamp: new Date(),
  patient: { id, name, phone, email },
  appointment: { id, date, time, service, provider },
  performedBy: { id, name, role }
}, {
  source: 'online',
  priority: 'high',
  actionUrls: {
    view: '/calendar?appointmentId=123',
    edit: '/calendar/edit/123'
  }
})
```

## Available Event Types

| Event Type | When to Use | Priority |
|------------|-------------|----------|
| `appointment_booked` | Any appointment is booked | Normal |
| `online_booking` | Patient books online | High |
| `appointment_canceled` | Appointment is canceled | Normal |
| `appointment_rescheduled` | Appointment is rescheduled | Normal |
| `patient_checked_in` | Patient checks in | Normal |
| `form_submitted` | Patient submits a form | Normal |
| `waitlist_match` | Opening matches waitlist | High |
| `sale_closed` | Sale/checkout complete | Normal |
| `gift_card_purchased` | Gift card purchased | Normal |
| `membership_purchased` | Membership purchased | Normal |
| `payment_failed` | Payment fails | Urgent |

[See full list in documentation]

## Configuration

### Set Recipients for an Event

```typescript
internalNotificationService.setConfig('appointment_booked', {
  enabled: true,
  recipients: ['admin@spa.com', 'frontdesk@spa.com'],
  includeDetails: true
})
```

### Enable/Disable Service

```typescript
internalNotificationService.setEnabled(false)  // Disable all notifications
internalNotificationService.setEnabled(true)   // Enable all notifications
```

## UI Components

### InternalNotificationConfig Component

Already integrated in settings tabs. Shows email input with tags, validation, and toggle.

```typescript
import { InternalNotificationConfig } from '@/app/settings/automated-messages/components/InternalNotificationConfig'

<InternalNotificationConfig
  enabled={enabled}
  recipients={['admin@spa.com']}
  onChange={(config) => {
    // config.enabled
    // config.recipients
  }}
/>
```

### Demo Page

Visit `/settings/notifications-demo` to:
- Test all event types
- See notifications in action
- View statistics
- Debug issues

## What Happens When You Send a Notification?

1. **Console Log**: Detailed information in browser console (grouped)
2. **Toast Notification**: Visual feedback in bottom-right corner
3. **Statistics**: Tracked in service (view in demo page)
4. **Email** (Production): Would send actual emails to configured recipients

## Example: Add to Appointment Booking

```typescript
// In your appointment booking handler
async function handleAppointmentBooked(appointment: Appointment, patient: Patient) {
  // ... existing booking logic ...

  // Send staff notification
  await notifyStaff('appointment_booked', {
    patient: {
      id: patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
      phone: patient.phone,
      email: patient.email
    },
    appointment: {
      id: appointment.id,
      date: formatDate(appointment.date),
      time: formatTime(appointment.time),
      service: appointment.serviceName,
      provider: appointment.providerName
    }
  }, {
    source: appointment.bookedOnline ? 'online' : 'staff',
    bookingChannel: appointment.bookingChannel,
    priority: appointment.bookedOnline ? 'high' : 'normal',
    actionUrls: {
      view: `/calendar?appointmentId=${appointment.id}`,
      edit: `/calendar/edit/${appointment.id}`
    }
  })
}
```

## Debugging

### View Console Logs

Notifications log to console with detailed information:
```
[Internal Notification] appointment_booked
  Subject: New Appointment Booked - Jane Doe
  Recipients: admin@spa.com, frontdesk@spa.com
  Body: ...
  Context: ...
  Payload: ...
```

### Check Statistics

```typescript
const stats = internalNotificationService.getStats()
console.log(stats)
// {
//   total: 10,
//   sent: 10,
//   failed: 0,
//   pending: 0,
//   byEventType: { appointment_booked: 5, online_booking: 3, ... },
//   enabled: true,
//   configuredEvents: ['appointment_booked', 'online_booking', ...]
// }
```

### View History

```typescript
const recent = internalNotificationService.getHistory(10)  // Last 10 notifications
console.log(recent)
```

## Common Patterns

### Only notify for online bookings

```typescript
if (appointment.source === 'online') {
  await notifyStaff('online_booking', payload, context)
}
```

### High priority for urgent events

```typescript
await notifyStaff('payment_failed', payload, {
  source: 'system',
  priority: 'urgent'  // Will show as warning in toast
})
```

### Include action links

```typescript
await notifyStaff('form_submitted', payload, {
  source: 'patient',
  actionUrls: {
    view: `/patients/${patientId}/forms`,
    respond: `/messages?patientId=${patientId}`
  }
})
```

## Testing Your Implementation

1. **Add notification call** to your feature
2. **Trigger the event** (e.g., book an appointment)
3. **Check console logs** - Should see grouped notification details
4. **Look for toast** - Bottom-right corner notification
5. **Visit demo page** - See statistics updated
6. **Review history** - Check notification was recorded

## Files Reference

- **Types**: `/src/types/notifications.ts`
- **Service**: `/src/services/internal-notifications.ts`
- **Demo Page**: `/src/app/settings/notifications-demo/page.tsx`
- **Demo Component**: `/src/components/settings/InternalNotificationDemo.tsx`
- **Config Component**: `/src/app/settings/automated-messages/components/InternalNotificationConfig.tsx`

## Support

- Open browser console for detailed logs
- Visit `/settings/notifications-demo` to test
- Check `INTERNAL_NOTIFICATIONS_IMPLEMENTATION.md` for full documentation

## Quick Checklist

- [ ] Import the service
- [ ] Call `notifyStaff()` or `sendNotification()`
- [ ] Include required data (patient, appointment, etc.)
- [ ] Set appropriate source and priority
- [ ] Test in browser console
- [ ] Verify toast notification appears
- [ ] Check demo page statistics

---

**Remember**: Notifications are currently logged to console. For production, integrate with an email service provider.
