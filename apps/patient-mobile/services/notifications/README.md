# Push Notifications System

Comprehensive push notification system for the Luxe MedSpa patient mobile app.

## Features

- **Local & Remote Notifications**: Support for both local scheduled notifications and remote push notifications from the server
- **Smart Permissions**: Beautiful permission prompt with clear benefits explanation
- **Granular Preferences**: User control over every notification type
- **Quiet Hours**: Automatic silence during user-defined hours
- **Interactive Actions**: Quick actions directly from notifications (iOS)
- **Deep Linking**: Automatic navigation to relevant screens when notifications are tapped
- **Badge Management**: Smart badge count updates

## Notification Types

### Appointment Reminders
- **24-hour reminder**: "Your [service] is tomorrow at [time]!"
- **2-hour reminder**: "See you soon! Your [service] starts at [time]"
- Automatically scheduled when appointments are confirmed
- Respects user preferences and quiet hours

### Appointment Changes
- **Confirmed**: "Your appointment has been confirmed"
- **Cancelled**: "Your appointment has been cancelled"
- **Rescheduled**: "Your appointment has been rescheduled"

### Messages
- **New Message**: Real-time notifications when providers send messages
- Shows sender name and message preview
- Deep links to message thread

### Rewards & Points
- **Points Earned**: "You earned 50 points!"
- **Reward Available**: "You unlocked a free facial!"
- **Referral Bonus**: "[Friend] joined using your code. You earned 100 points!"

### Promotions
- **Special Offers**: Limited-time discounts and deals
- **Seasonal Promotions**: Holiday specials, birthday offers
- Can be disabled by users who prefer fewer notifications

### System
- **Updates Required**: Critical app updates
- **Maintenance Notices**: Scheduled maintenance windows
- **Announcements**: Important clinic updates

## Architecture

```
services/notifications/
├── pushNotifications.ts       # Core notification logic
├── notificationCategories.ts  # Interactive notification actions
├── index.ts                   # Main exports
└── README.md                  # This file

types/
└── notifications.ts           # TypeScript types and interfaces

hooks/
└── useNotifications.ts        # React hook for components

components/notifications/
└── NotificationPrompt.tsx     # Permission request modal

app/settings/
└── notifications.tsx          # User preferences screen
```

## Usage

### In App Root Layout

```tsx
import { useNotifications } from '@/hooks/useNotifications';

export default function RootLayout() {
  useNotifications(); // Initialize notifications
  
  return (
    // Your app layout
  );
}
```

### Schedule Appointment Reminder

```tsx
import { scheduleAppointmentReminder } from '@/services/notifications/pushNotifications';

const notificationId = await scheduleAppointmentReminder(
  appointmentId,
  'Botox Treatment',
  'injectable',
  new Date('2025-12-15T14:00:00'),
  'day_before', // or '2_hours_before'
  'Dr. Sarah Johnson',
  'Beverly Hills'
);
```

### Cancel Notifications

```tsx
import { cancelAppointmentNotifications } from '@/services/notifications/pushNotifications';

// Cancel all notifications for an appointment
await cancelAppointmentNotifications(appointmentId);
```

### Update User Preferences

```tsx
import { updateNotificationPreferences } from '@/services/notifications/pushNotifications';

await updateNotificationPreferences({
  appointmentReminders: true,
  promotions: false,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
});
```

### Handle Navigation from Notification

Notification handling is automatic when using the `useNotifications` hook. Deep linking is configured for all notification types:

- `appointment_reminder` → `/appointment/[id]`
- `new_message` → `/messages/[threadId]`
- `points_earned` → `/(tabs)/membership`
- `promotion` → `/promotions/[id]`

## Android Channels

Notifications are organized into channels on Android for better user control:

- **Appointments** (High priority, vibration, LED)
- **Messages** (High priority, vibration)
- **Rewards & Points** (Default priority)
- **Promotions** (Low priority)
- **System** (High priority)

## iOS Categories

Interactive notifications with actions:

### Appointment Notifications
- Confirm
- Reschedule
- Cancel (destructive)

### Message Notifications
- Reply
- Mark as Read

### Promotion Notifications
- View Offer
- Dismiss

### Reward Notifications
- View Reward
- Share

## Backend Integration

### Register Push Token

```typescript
POST /api/notifications/register-token
{
  "userId": "user_123",
  "token": "ExponentPushToken[...]",
  "platform": "ios",
  "deviceModel": "iPhone 15 Pro",
  "deviceOS": "iOS 17.2"
}
```

### Send Push Notification

```typescript
POST /api/notifications/send
{
  "userId": "user_123",
  "type": "appointment_reminder",
  "title": "Appointment Tomorrow",
  "body": "Your Botox treatment is tomorrow at 2:00 PM!",
  "data": {
    "appointmentId": "appt_456",
    "serviceName": "Botox",
    "startTime": "2025-12-15T14:00:00Z"
  }
}
```

## Testing

### Test on Physical Device
Push notifications only work on physical devices, not simulators.

### Test Local Notifications
```typescript
import * as Notifications from 'expo-notifications';

// Schedule test notification in 5 seconds
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Test Notification",
    body: "This is a test!",
  },
  trigger: { seconds: 5 },
});
```

### Test Deep Linking
Tap on notifications and verify correct navigation to screens.

### Test Quiet Hours
Set quiet hours to current time and verify notifications are silenced.

### Test Permission States
- **Granted**: Full notification functionality
- **Denied**: Graceful degradation, show system settings link
- **Not Determined**: Show permission prompt

## Best Practices

1. **User Consent**: Always explain benefits before requesting permissions
2. **Respectful Timing**: Use quiet hours, don't spam users
3. **Clear Actions**: Make notifications actionable and valuable
4. **Graceful Degradation**: App works without notifications enabled
5. **Test Thoroughly**: Test all notification types and edge cases
6. **Monitor Metrics**: Track opt-in rates, engagement, and opt-outs

## Troubleshooting

### Notifications not appearing
- Check permission status in device settings
- Verify push token is registered with backend
- Check notification preferences in app settings
- Ensure app is not in quiet hours mode

### Badge count incorrect
- Clear badge when app becomes active
- Sync badge count with actual unread items

### Deep linking not working
- Verify notification data includes required fields
- Check router paths match notification handlers
- Test with `Linking.canOpenURL()` for custom schemes

## Future Enhancements

- [ ] Rich media notifications (images, videos)
- [ ] Notification grouping and stacking
- [ ] Smart delivery (ML-based timing)
- [ ] A/B testing for notification content
- [ ] Push notification analytics dashboard
- [ ] Multi-language support
- [ ] Custom notification sounds
- [ ] Location-based notifications (geofencing)
