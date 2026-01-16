# Push Notifications Setup Complete

## What Was Created

### 1. Core Services (`/services/notifications/`)
- **pushNotifications.ts** - Main notification service with all core functionality
- **notificationCategories.ts** - Interactive notification actions (iOS)
- **index.ts** - Clean exports for easy imports

### 2. Type Definitions (`/types/notifications.ts`)
- NotificationType enum
- NotificationData interfaces
- NotificationPreferences interface
- ScheduledNotification interface
- DEFAULT_NOTIFICATION_PREFERENCES constant

### 3. React Integration (`/hooks/useNotifications.ts`)
- useNotifications() - Main hook for permission management and listeners
- useLastNotificationResponse() - Handle app opened from notification

### 4. UI Components (`/components/notifications/`)
- **NotificationPrompt.tsx** - Beautiful permission request modal with benefits explanation

### 5. Settings Screen (`/app/settings/notifications.tsx`)
- Complete notification preferences UI
- Granular control over notification types
- Quiet hours configuration
- Sound, vibration, and badge settings
- Link to system settings

### 6. App Integration
- **app/_layout.tsx** - Initialized notifications, added prompt, set up listeners
- **app/booking/confirmed.tsx** - Schedules 24h and 2h appointment reminders

### 7. Configuration
- **app.json** - Added notification permissions and config
- **package.json** - Added expo-blur and expo-linear-gradient dependencies

## Installation

Run this command to install the new dependencies:

```bash
cd /Users/daminirijhwani/medical-spa-platform/apps/patient-mobile
npm install
```

## Testing

### 1. Test Permission Flow
- Launch app on a physical device (notifications don't work on simulator)
- Sign in to trigger the notification prompt
- Tap "Enable Notifications" and grant permission
- Verify prompt doesn't show again

### 2. Test Appointment Reminders
- Book an appointment using the booking flow
- Navigate to `/booking/confirmed` with appointment details
- Check that local notifications are scheduled:
```typescript
import { getScheduledNotifications } from '@/services/notifications/pushNotifications';
const scheduled = await getScheduledNotifications();
console.log('Scheduled notifications:', scheduled);
```

### 3. Test Settings Screen
Navigate to `/settings/notifications` and verify:
- All toggles work correctly
- Master toggle shows warning when disabling
- Preferences persist after app restart
- System settings link opens device settings

### 4. Test Deep Linking
Send a test notification and verify navigation:
```typescript
import * as Notifications from 'expo-notifications';

await Notifications.scheduleNotificationAsync({
  content: {
    title: "Test Appointment Reminder",
    body: "Your Botox is tomorrow!",
    data: {
      type: 'appointment_reminder',
      appointmentId: 'test_123',
    },
  },
  trigger: { seconds: 5 },
});
```

Tap the notification and verify it navigates to `/appointment/test_123`

### 5. Test Quiet Hours
- Go to Settings → Notifications
- Enable quiet hours
- Set current time within quiet hours range
- Send a test notification
- Verify it appears in notification center but doesn't alert

## Usage Examples

### Schedule Custom Notification
```typescript
import { scheduleAppointmentReminder } from '@/services/notifications';

const notificationId = await scheduleAppointmentReminder(
  'appt_123',
  'Laser Hair Removal',
  'laser',
  new Date('2025-12-20T10:00:00'),
  'day_before',
  'Dr. Emily Chen',
  'Beverly Hills'
);
```

### Update User Preferences
```typescript
import { updateNotificationPreferences } from '@/services/notifications';

await updateNotificationPreferences({
  promotions: false,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
});
```

### Get Current Preferences
```typescript
import { getNotificationPreferences } from '@/services/notifications';

const prefs = await getNotificationPreferences();
console.log('User preferences:', prefs);
```

### Cancel Appointment Notifications
```typescript
import { cancelAppointmentNotifications } from '@/services/notifications';

// Cancel all notifications for an appointment
await cancelAppointmentNotifications('appt_123');
```

## Backend Integration Required

To complete the notification system, the backend needs these endpoints:

### 1. Register Push Token
```
POST /api/notifications/register-token
Body: {
  userId: string;
  token: string; // Expo push token
  platform: 'ios' | 'android';
  deviceModel: string;
  deviceOS: string;
}
```

### 2. Send Push Notification
```
POST /api/notifications/send
Body: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, any>;
}
```

### 3. Update Notification Preferences (Optional)
```
PUT /api/notifications/preferences
Body: NotificationPreferences
```

The backend should use the Expo Push Notification service to send notifications:
https://docs.expo.dev/push-notifications/sending-notifications/

## Notification Types Implemented

1. **appointment_reminder** - Scheduled locally 24h and 2h before
2. **appointment_confirmed** - Sent from backend when appointment confirmed
3. **appointment_cancelled** - Sent from backend when appointment cancelled
4. **appointment_rescheduled** - Sent from backend when appointment rescheduled
5. **new_message** - Sent from backend when provider sends message
6. **points_earned** - Sent from backend when user earns points
7. **reward_available** - Sent from backend when reward unlocked
8. **referral_signup** - Sent from backend when referral joins
9. **promotion** - Sent from backend for special offers
10. **system** - Sent from backend for important announcements

## Navigation Routes

Each notification type automatically navigates to the appropriate screen:

- `appointment_*` → `/appointment/[id]` or `/(tabs)/appointments`
- `new_message` → `/messages/[threadId]` or `/(tabs)/messages`
- `points_earned` → `/(tabs)/membership`
- `reward_available` → `/(tabs)/membership`
- `referral_signup` → `/(tabs)/referrals`
- `promotion` → `/promotions/[id]` or `/(tabs)/dashboard`
- `system` → Custom URL from notification data

## Next Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Add Notification Icons**
   - Create `assets/images/notification-icon.png` (96x96px, transparent)
   - Optional: Add custom notification sound to `assets/sounds/notification.wav`

3. **Test on Physical Device**
   - Build and run on physical iOS/Android device
   - Test permission flow
   - Test appointment booking and reminder scheduling
   - Test notification tapping and navigation

4. **Backend Implementation**
   - Implement push token registration endpoint
   - Set up Expo Push Notification service
   - Implement notification sending for each type
   - Test remote notifications

5. **Production Setup**
   - Configure Expo push notification credentials
   - Set up notification analytics
   - Monitor opt-in rates and engagement
   - Implement A/B testing for notification content

## Files Changed/Created

```
apps/patient-mobile/
├── services/
│   └── notifications/
│       ├── pushNotifications.ts       (NEW)
│       ├── notificationCategories.ts  (NEW)
│       ├── index.ts                   (NEW)
│       └── README.md                  (NEW)
├── types/
│   └── notifications.ts               (NEW)
├── hooks/
│   └── useNotifications.ts            (NEW)
├── components/
│   └── notifications/
│       └── NotificationPrompt.tsx     (NEW)
├── app/
│   ├── settings/
│   │   └── notifications.tsx          (NEW)
│   ├── _layout.tsx                    (UPDATED)
│   └── booking/
│       └── confirmed.tsx              (UPDATED)
├── app.json                           (UPDATED)
├── package.json                       (UPDATED)
└── NOTIFICATIONS_SETUP.md             (NEW - this file)
```

## Support

For issues or questions:
1. Check the README in `/services/notifications/`
2. Review Expo Notifications docs: https://docs.expo.dev/versions/latest/sdk/notifications/
3. Test on physical device (notifications don't work in simulator)
4. Verify permissions are granted in device settings
