# Push Notification System - Medical Spa Patient Portal

Comprehensive push notification system with local and remote notifications for the React Native Expo mobile app.

## Features

### Setup & Permissions
- Request and manage notification permissions
- Register for push notifications with Expo
- Get and store Expo push token
- Handle permission denied gracefully
- Platform-specific handling (iOS/Android)

### Local Notifications
- **Appointment Reminders**: 24 hours before, 2 hours before, custom times
- **Review Requests**: Automatically 2 days after appointment
- **Birthday Notifications**: Special offers on birthdays
- **Membership Renewals**: 7-day advance reminder
- **Custom Reminders**: Flexible scheduling

### Remote Notifications (from backend)
- Appointment confirmations and changes
- New messages from providers
- Promotional offers
- Referral reward notifications
- Before/after photos ready
- Payment confirmations
- System announcements

### Notification Center
- List all notifications with filtering
- Unread badge count
- Mark as read/unread
- Delete notifications
- Pull to refresh
- Navigation to related content
- Beautiful UI with animations

### Notification Preferences
- Master enable/disable toggle
- Granular notification type controls
- Quiet hours (e.g., 10 PM - 8 AM)
- Sound and vibration settings
- Badge count settings
- Persistent preferences with AsyncStorage

### Advanced Features
- Rich notifications with images
- Action buttons (Reply, View, Reschedule)
- Notification categories with custom actions
- Android notification channels
- Deep linking support
- Badge count synchronization
- Notification analytics and logging

## Installation & Setup

### 1. Dependencies Already Installed
The following packages are already in `package.json`:
- `expo-notifications` - Push notification handling
- `expo-device` - Device information
- `expo-constants` - App constants
- `date-fns` - Date formatting

### 2. Configure App (app.json)
The app is already configured with notification plugin and permissions:

```json
{
  "plugins": [
    ["expo-notifications", {
      "icon": "./assets/images/notification-icon.png",
      "color": "#667eea",
      "sounds": ["./assets/sounds/notification.wav"],
      "mode": "production"
    }]
  ]
}
```

### 3. Android Permissions (already configured)
In `app.json` androidPermissions:
- `POST_NOTIFICATIONS` - Send notifications
- `RECEIVE_BOOT_COMPLETED` - Restore notifications on reboot

### 4. iOS Permissions (already configured)
In `app.json` infoPlist:
- `NSUserNotificationsUsageDescription` - Notification permission prompt

### 5. Expo Configuration
Set your Expo project ID in `app.json`:
```json
{
  "extra": {
    "eas": {
      "projectId": "your-project-id"
    }
  }
}
```

## File Structure

```
apps/patient-mobile/
├── services/notifications/
│   ├── index.ts                 # Main export
│   ├── pushNotifications.ts      # Core notification setup
│   ├── localNotifications.ts     # Local notification scheduling
│   ├── remoteNotifications.ts    # Remote notification handling
│   ├── notificationCategories.ts # Notification actions/categories
│   ├── templates.ts              # Notification message templates
│   └── README.md                 # Service documentation
├── components/notifications/
│   └── NotificationItem.tsx      # Notification list item component
├── app/
│   ├── _layout.tsx               # Initialize notifications
│   ├── notifications/
│   │   └── index.tsx             # Notification center screen
│   └── settings/
│       └── notifications.tsx      # Notification preferences screen
└── types/
    └── notifications.ts          # TypeScript types

packages/
├── api-client/src/
│   └── endpoints.ts              # API notification endpoints
└── types/src/
    └── common.ts                 # Shared notification types
```

## Usage Guide

### Initialize Notifications (in app _layout.tsx)

```typescript
import {
  configureNotificationHandler,
  registerForPushNotifications,
  setupNotificationCategories,
  handleNotificationReceived,
  handleNotificationPressed,
} from '@/services/notifications';
import * as Notifications from 'expo-notifications';

// In useEffect during app initialization:
async function initializeNotifications() {
  // Configure how notifications appear when app is in foreground
  configureNotificationHandler();
  
  // Set up notification categories (iOS)
  await setupNotificationCategories();
  
  // Request permissions and get push token
  const { success, token } = await registerForPushNotifications();
  
  if (success && token) {
    // Store token or send to backend
  }
  
  // Listen for received notifications
  Notifications.addNotificationReceivedListener((notification) => {
    handleNotificationReceived(notification);
  });

  // Listen for notification taps
  Notifications.addNotificationResponseReceivedListener((response) => {
    handleNotificationPressed(response);
  });
}
```

### Schedule Appointment Reminder

```typescript
import {
  scheduleAppointmentReminderLocal,
} from '@/services/notifications';

const appointmentDate = new Date('2024-12-20T14:00:00');

// Schedule 24 hours before
await scheduleAppointmentReminderLocal(
  'apt123',
  'Botox',
  appointmentDate,
  24,
  'Dr. Sarah Chen',
  'Downtown Location'
);

// Schedule 2 hours before
await scheduleAppointmentReminderLocal(
  'apt123',
  'Botox',
  appointmentDate,
  2
);
```

### Schedule Custom Reminder

```typescript
import { scheduleCustomReminder } from '@/services/notifications';

const reminderDate = new Date();
reminderDate.setHours(reminderDate.getHours() + 3);

await scheduleCustomReminder(
  'custom_reminder_1',
  'Time to Get Ready',
  'Your appointment is in 3 hours',
  reminderDate,
  { customData: 'value' }
);
```

### Schedule Review Request

```typescript
import { scheduleReviewReminder } from '@/services/notifications';

const appointmentDate = new Date('2024-12-18T14:00:00');

// Schedule review request 2 days after appointment
await scheduleReviewReminder(
  'apt123',
  appointmentDate,
  'HydraFacial'
);
```

### Schedule Birthday Notification

```typescript
import { scheduleBirthdayNotification } from '@/services/notifications';

const birthDate = new Date('1990-06-15');

await scheduleBirthdayNotification(
  'user123',
  'John Doe',
  birthDate
);
```

### Cancel Notifications

```typescript
import {
  cancelAppointmentReminders,
  cancelScheduledNotification,
  clearAllScheduledNotifications,
} from '@/services/notifications';

// Cancel all reminders for an appointment
await cancelAppointmentReminders('apt123');

// Cancel a specific scheduled notification
await cancelScheduledNotification('notificationId');

// Clear all scheduled notifications
await clearAllScheduledNotifications();
```

### Manage Notification Preferences

```typescript
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/services/notifications';

// Get current preferences
const prefs = await getNotificationPreferences();

// Update preferences
await updateNotificationPreferences({
  enabled: true,
  appointmentReminders: true,
  appointmentReminder24h: true,
  appointmentReminder2h: true,
  messages: true,
  promotions: false,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  sound: true,
  vibration: true,
  badge: true,
});
```

### Use Notification Templates

```typescript
import { notificationTemplates, getNotificationTemplate } from '@/services/notifications';

// Use predefined templates
const template = notificationTemplates.appointment.reminder24h(
  'Botox',
  '2:00 PM',
  'Downtown Location'
);
// { title: 'Appointment Tomorrow', body: '...' }

// Use template helper
const template2 = getNotificationTemplate(
  'appointment',
  'confirmed',
  'HydraFacial',
  '3:00 PM',
  'Dr. Chen'
);
```

### Get Notification Analytics

```typescript
import { getNotificationAnalytics } from '@/services/notifications';

const analytics = await getNotificationAnalytics();
console.log('Total received:', analytics.totalReceived);
console.log('Total tapped:', analytics.totalTapped);
console.log('By type:', analytics.byType);
```

## API Integration

### Backend Endpoints

The following endpoints should be implemented on your backend:

```
POST /api/notifications/register-token
  - Register device push token
  - Body: { userId, token, platform, deviceModel, deviceOS }

GET /api/notifications
  - Get notification history for user
  - Query: ?limit=50&offset=0&type=all

PATCH /api/notifications/{id}/read
  - Mark notification as read
  - Body: { read: true }

DELETE /api/notifications/{id}
  - Delete notification

PATCH /api/notifications/preferences
  - Update user notification preferences
  - Body: { enabled, appointmentReminders, ... }

GET /api/notifications/unread-count
  - Get count of unread notifications
  - Returns: { unreadCount: number }
```

## Notification Types

```typescript
type NotificationType =
  | 'appointment_reminder'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'new_message'
  | 'payment_received'
  | 'points_earned'
  | 'reward_available'
  | 'referral_signup'
  | 'promotion'
  | 'system';
```

## Testing

### Manual Testing

1. **Test Permission Flows**
   - Grant permissions: App should register for push
   - Deny permissions: App should handle gracefully
   - No prompt shown again after initial response

2. **Test Local Notifications**
   - Schedule appointment reminder
   - Verify it appears at scheduled time
   - Test cancellation

3. **Test Navigation**
   - Tap notification
   - Should navigate to relevant screen
   - Deep linking should work

4. **Test Preferences**
   - Disable notification types
   - Verify they don't appear
   - Enable quiet hours
   - Verify notifications silenced

### Dev Testing Component

Add to a dev settings screen:

```typescript
import { Notifications } from 'expo-notifications';

function DevTestNotifications() {
  const testNotifications = async () => {
    // Test appointment reminder
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test: Appointment Tomorrow',
        body: 'Your Botox appointment is tomorrow at 2:00 PM',
        data: { type: 'appointment_reminder', appointmentId: 'test123' },
      },
      trigger: { seconds: 3 },
    });
  };

  return (
    <TouchableOpacity onPress={testNotifications}>
      <Text>Send Test Notification</Text>
    </TouchableOpacity>
  );
}
```

## Best Practices

1. **Always check preferences** before scheduling
2. **Use templates** for consistent messaging
3. **Handle quiet hours** appropriately
4. **Test on real devices** - simulators don't support push
5. **Clear badges** when notifications are viewed
6. **Sync preferences** to backend
7. **Log analytics** for insights
8. **Handle cancellation** when appointments change
9. **Request permissions** politely and at right time
10. **Respect user settings** - honor quiet hours and disable preferences

## Troubleshooting

### Notifications not appearing

1. Check device has notification permissions
2. Verify app is in notification settings
3. Check quiet hours aren't active
4. Verify notification preferences are enabled
5. Check Android notification channels
6. Test on physical device (not simulator)

### Token not registered

1. Verify push permissions are granted
2. Check network connectivity
3. Verify backend endpoint is correct
4. Check authentication token is valid
5. Review server logs for errors

### Deep linking not working

1. Verify app.json has correct scheme
2. Check notification data has correct URL format
3. Test with direct deep link first
4. Verify route exists in app navigation

### Android channel issues

1. Verify channel IDs match between scheduling and manifest
2. Check importance levels are appropriate
3. Ensure sounds exist in assets
4. Test on Android 8+ (required channels)

## Performance Considerations

- Notifications are lightweight but respect user preferences
- Local notifications run efficiently even with many scheduled
- Remote notifications handled in background
- Badge count optimized to reduce calls
- Analytics logs limited to last 100 entries

## Security

- Tokens never stored in unencrypted preference files
- Use secure storage for sensitive push token data
- Validate notification content from backend
- Sanitize deep links to prevent injection attacks
- Verify user authorization for notification actions

## Future Enhancements

- [ ] Notification sounds customization
- [ ] Scheduled notification management UI
- [ ] In-app notification center (done)
- [ ] Rich media notifications (images, video)
- [ ] Notification scheduling templates
- [ ] A/B testing for notification content
- [ ] Advanced analytics dashboard
- [ ] Notification read receipts
- [ ] Multi-language notification templates
- [ ] WhatsApp/SMS notification fallback
