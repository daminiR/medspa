# Notifications Quick Reference

## Common Tasks

### Import the Service
```typescript
import {
  scheduleAppointmentReminder,
  cancelAppointmentNotifications,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/services/notifications';
```

### Schedule Appointment Reminder
```typescript
// Schedule 24-hour reminder
await scheduleAppointmentReminder(
  appointmentId,
  serviceName,
  serviceType,
  appointmentDateTime,
  'day_before',
  providerName,
  locationName
);

// Schedule 2-hour reminder
await scheduleAppointmentReminder(
  appointmentId,
  serviceName,
  serviceType,
  appointmentDateTime,
  '2_hours_before',
  providerName,
  locationName
);
```

### Cancel Appointment Notifications
```typescript
// Cancel all notifications for an appointment
await cancelAppointmentNotifications(appointmentId);
```

### Check User Preferences
```typescript
const prefs = await getNotificationPreferences();

if (prefs.appointmentReminders && prefs.appointmentReminder24h) {
  // User wants 24-hour reminders
}
```

### Update Preferences
```typescript
await updateNotificationPreferences({
  promotions: false,
  quietHoursEnabled: true,
});
```

### Use in Components
```typescript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const { isRegistered, requestPermissions } = useNotifications();
  
  if (!isRegistered) {
    // Show prompt or request permissions
    await requestPermissions();
  }
}
```

### Navigate from Settings
```typescript
import { router } from 'expo-router';

// Link to notification settings
router.push('/settings/notifications');
```

## Notification Data Structure

### Appointment Reminder
```typescript
{
  type: 'appointment_reminder',
  title: 'Appointment Tomorrow',
  body: 'Your Botox is tomorrow at 2:00 PM!',
  data: {
    appointmentId: 'appt_123',
    serviceName: 'Botox',
    serviceType: 'injectable',
    startTime: '2025-12-15T14:00:00Z',
    providerName: 'Dr. Sarah',
    locationName: 'Beverly Hills',
  }
}
```

### New Message
```typescript
{
  type: 'new_message',
  title: 'New Message from Dr. Sarah',
  body: 'Your treatment plan is ready to review',
  data: {
    messageId: 'msg_456',
    threadId: 'thread_789',
    senderName: 'Dr. Sarah Johnson',
    senderType: 'provider',
    preview: 'Your treatment plan is ready...',
  }
}
```

### Points Earned
```typescript
{
  type: 'points_earned',
  title: 'Points Earned!',
  body: 'You earned 50 points for your recent visit',
  data: {
    points: 50,
  }
}
```

## Backend Endpoints

### Register Push Token
```http
POST /api/notifications/register-token
Content-Type: application/json
Authorization: Bearer <session-token>

{
  "userId": "user_123",
  "token": "ExponentPushToken[...]",
  "platform": "ios",
  "deviceModel": "iPhone 15 Pro",
  "deviceOS": "iOS 17.2"
}
```

### Send Push Notification
```http
POST /api/notifications/send
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "userId": "user_123",
  "type": "appointment_confirmed",
  "title": "Appointment Confirmed",
  "body": "Your Botox appointment on Dec 15 at 2 PM is confirmed",
  "data": {
    "appointmentId": "appt_123",
    "serviceName": "Botox",
    "startTime": "2025-12-15T14:00:00Z"
  }
}
```

## Testing Commands

### Schedule Test Notification
```typescript
import * as Notifications from 'expo-notifications';

await Notifications.scheduleNotificationAsync({
  content: {
    title: "Test",
    body: "This is a test notification",
    data: { type: 'system' },
  },
  trigger: { seconds: 5 },
});
```

### Get All Scheduled Notifications
```typescript
import { getScheduledNotifications } from '@/services/notifications';

const scheduled = await getScheduledNotifications();
console.log('Scheduled:', scheduled);
```

### Clear Badge
```typescript
import { clearBadgeCount } from '@/services/notifications';

await clearBadgeCount();
```

### Open System Settings
```typescript
import * as Notifications from 'expo-notifications';

await Notifications.openSettingsAsync();
```

## Troubleshooting

### Notifications not appearing?
1. Check permission status
2. Verify app is on physical device (not simulator)
3. Check quiet hours settings
4. Verify notification preferences enabled

### Deep linking not working?
1. Check notification data includes required fields
2. Verify router paths match handlers
3. Test with `console.log` in handleNotificationPressed

### Badge count wrong?
1. Call clearBadgeCount() when app becomes active
2. Sync with actual unread count from backend

## File Locations

```
/services/notifications/
├── pushNotifications.ts       - Core service
├── notificationCategories.ts  - Interactive actions
├── index.ts                   - Exports
├── README.md                  - Full documentation
└── QUICK_REFERENCE.md         - This file

/types/notifications.ts        - Type definitions
/hooks/useNotifications.ts     - React hook
/components/notifications/     - UI components
/app/settings/notifications.tsx - Settings screen
```
