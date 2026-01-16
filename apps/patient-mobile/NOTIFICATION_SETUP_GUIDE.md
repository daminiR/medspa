# Push Notification System - Setup Guide

Complete setup guide for implementing the push notification system in the Medical Spa Patient Portal mobile app.

## Quick Start

### 1. Install Dependencies
Already installed in package.json:
- expo-notifications
- expo-device
- expo-constants
- date-fns
- @react-native-async-storage/async-storage

Run:
```bash
npm install
# or
yarn install
```

### 2. Configure Environment
Set your Expo project ID in `app.json`:
```json
{
  "extra": {
    "eas": {
      "projectId": "YOUR_EXPO_PROJECT_ID"
    }
  }
}
```

### 3. Update App Layout
The app _layout.tsx is already updated with notification initialization.

### 4. Update Profile Screen
Add notification preferences link to profile screen.

## Implementation Checklist

### Phase 1: Core Setup (COMPLETED)
- [x] Created notification services
- [x] Created local notifications service
- [x] Created remote notifications handler
- [x] Created notification templates
- [x] Created notification center screen
- [x] Created NotificationItem component
- [x] Updated app _layout.tsx
- [x] Updated API endpoints
- [x] Updated shared types
- [x] Created comprehensive documentation

### Phase 2: Integration (TODO)
- [ ] Connect notification center to backend API
- [ ] Implement backend notification endpoints
- [ ] Connect notification preferences to backend
- [ ] Test permission flows
- [ ] Test local notifications
- [ ] Test remote notifications
- [ ] Build and deploy

### Phase 3: Testing
- [ ] Unit tests for notification services
- [ ] Integration tests with API
- [ ] Manual testing on iOS device
- [ ] Manual testing on Android device
- [ ] Test deep linking
- [ ] Test permission flows

### Phase 4: Production
- [ ] Remove dev test button
- [ ] Enable analytics tracking
- [ ] Deploy to production
- [ ] Monitor notification delivery

## File Structure

New files created:
```
apps/patient-mobile/
├── services/notifications/
│   ├── localNotifications.ts (NEW)
│   ├── remoteNotifications.ts (NEW)
│   ├── templates.ts (NEW)
│   ├── COMPREHENSIVE_README.md (NEW)
│   └── [existing files updated]
├── components/notifications/
│   ├── NotificationItem.tsx (NEW)
│   └── DevTestNotificationButton.tsx (NEW)
└── app/
    ├── notifications/
    │   └── index.tsx (NEW)
    └── _layout.tsx (UPDATED)

packages/
├── api-client/src/
│   └── endpoints.ts (UPDATED)
└── types/src/
    └── common.ts (UPDATED)
```

## Backend Integration

### API Endpoints to Implement

```typescript
// Register push token
POST /api/notifications/register-token
Request: {
  userId: string;
  token: string;
  platform: 'ios' | 'android';
  deviceModel: string;
  deviceOS: string;
}
Response: { success: boolean }

// Get notifications
GET /api/notifications?limit=50&offset=0&type=all
Response: {
  data: Notification[];
  meta: { total, page, pageSize }
}

// Mark as read
PATCH /api/notifications/{id}/read
Request: { read: boolean }
Response: { success: boolean }

// Delete notification
DELETE /api/notifications/{id}
Response: { success: boolean }

// Get preferences
GET /api/notifications/preferences
Response: PushNotificationPreferences

// Update preferences
PATCH /api/notifications/preferences
Request: PushNotificationPreferences
Response: { success: boolean }

// Send test notification
POST /api/notifications/test (dev only)
Request: { type: NotificationType }
Response: { success: boolean }
```

## Testing Checklist

### Unit Tests
```bash
# Test notification services
npm test -- notification
```

### Integration Tests
1. Connect API endpoints
2. Test token registration
3. Test notification retrieval
4. Test preference syncing

### Device Testing

#### iOS
```bash
expo run:ios
# Test on physical device for push notifications
```

#### Android
```bash
expo run:android
# Test on physical device for push notifications
```

### Manual Test Scenarios

1. **Permission Flow**
   - First launch: Should show permission prompt
   - Grant: Should register for push
   - Deny: Should show graceful message
   - Re-enable: Should allow re-registration

2. **Local Notifications**
   - Schedule appointment reminder 24h before
   - Verify appears at correct time
   - Cancel appointment
   - Verify reminder is cancelled

3. **Remote Notifications**
   - Send test notification from admin
   - Verify appears on device
   - Tap notification
   - Should navigate to correct screen

4. **Preferences**
   - Disable appointment reminders
   - Should not receive appointment notifications
   - Enable quiet hours (10 PM - 8 AM)
   - Send notification during quiet hours
   - Should be silenced

5. **Deep Linking**
   - Tap appointment notification
   - Should navigate to appointments screen
   - Tap message notification
   - Should navigate to messages screen

## Development Tips

### Debug Notifications
Enable in development:
```typescript
// In app.tsx
if (__DEV__) {
  // Notifications will log to console
}
```

### Test Notification Component
Use the DevTestNotificationButton for quick testing:
```typescript
import DevTestNotificationButton from '@/components/notifications/DevTestNotificationButton';

export default function MyScreen() {
  return (
    <>
      {/* Your content */}
      <DevTestNotificationButton visible={__DEV__} />
    </>
  );
}
```

### View Scheduled Notifications
```typescript
import { getScheduledNotifications } from '@/services/notifications';

const scheduled = await getScheduledNotifications();
console.log('Scheduled notifications:', scheduled);
```

### View Notification Logs
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const logs = await AsyncStorage.getItem('notification_logs');
console.log('Notification logs:', JSON.parse(logs || '[]'));
```

## Troubleshooting

### Notifications Not Appearing

1. **Check Permissions**
   ```typescript
   import * as Notifications from 'expo-notifications';
   const { status } = await Notifications.getPermissionsAsync();
   console.log('Permission status:', status);
   ```

2. **Check Device Type**
   - Notifications only work on physical devices
   - Simulator will log messages but not show notifications

3. **Check Preferences**
   ```typescript
   import { getNotificationPreferences } from '@/services/notifications';
   const prefs = await getNotificationPreferences();
   console.log('Preferences:', prefs);
   ```

4. **Check Quiet Hours**
   - Notifications are silenced during quiet hours
   - Set quiet hours to disable if testing outside those times

5. **Android Channels**
   - Must create channels before scheduling
   - Already configured in pushNotifications.ts
   - Check if channel exists: Settings > Apps > Luxe MedSpa > Notifications

### Token Not Registering

1. **Check Network**
   - Verify device has internet connectivity
   - Check backend is running

2. **Check Backend Endpoint**
   - Verify `/api/notifications/register-token` exists
   - Check authentication headers

3. **Check Logs**
   - Look for errors in console
   - Check backend logs

### Deep Linking Not Working

1. **Check Deep Link URL Format**
   - Must match scheme in app.json: `luxemedspa://`
   - Verify path is correct

2. **Test Direct Deep Link**
   ```bash
   # iOS
   xcrun simctl openurl booted "luxemedspa://notifications"
   
   # Android
   adb shell am start -a android.intent.action.VIEW      -d "luxemedspa://notifications"
   ```

3. **Check Navigation Setup**
   - Verify routes exist in app navigation
   - Check for typos in route names

## Performance Considerations

1. **Limit Scheduled Notifications**
   - Too many scheduled notifications can slow app
   - Regularly clean up old notifications

2. **Badge Count Optimization**
   - Badge count updates are frequent
   - Batch updates when possible

3. **Analytics Logging**
   - Limited to last 100 entries
   - Older entries automatically removed

4. **Preference Persistence**
   - Uses AsyncStorage for performance
   - Sync to backend periodically

## Security Considerations

1. **Token Storage**
   - Store in secure storage, not plain text
   - Never log tokens in production

2. **Notification Content**
   - Validate notification content from backend
   - Sanitize URLs to prevent injection attacks

3. **Deep Links**
   - Validate deep links before navigation
   - Check user has permission to access resource

4. **Sensitive Data**
   - Don't include sensitive data in notification body
   - Use data payload for sensitive info

## Next Steps

1. Implement backend API endpoints
2. Connect notification center to API
3. Test on real devices
4. Deploy to TestFlight/Google Play
5. Monitor push notification delivery
6. Gather user feedback
7. Iterate and improve

## Support

For issues or questions:
1. Check COMPREHENSIVE_README.md in services/notifications/
2. Review examples in this guide
3. Check Expo documentation: https://docs.expo.dev/push-notifications/overview/
4. Check device settings for notification permissions
5. Enable debug logging and check console

## Resources

- Expo Notifications: https://docs.expo.dev/push-notifications/overview/
- Expo Device Info: https://docs.expo.dev/modules/expo-device/
- Date-fns: https://date-fns.org/
- React Native Documentation: https://reactnative.dev/
