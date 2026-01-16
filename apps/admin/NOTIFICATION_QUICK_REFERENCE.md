# Notification System - Quick Reference Card

**For Developers** | Last Updated: 2026-01-01

---

## TL;DR - The Basics

✅ **Status**: Production Ready
✅ **Mode**: Polling (will auto-upgrade to real-time when Firebase configured)
✅ **All Features**: Working perfectly
⚠️ **Optional**: Sound file, icon file, Firebase config

---

## How to Use

### In Your Component

```typescript
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user } = useAuth()

  const {
    notifications,      // Array of notifications
    unreadCount,       // Number of unread
    isLoading,         // Loading state
    connectionStatus,  // 'connected' | 'polling' | 'disconnected'
    markAsRead,        // (id: string) => void
    deleteNotification // (id: string) => void
  } = useNotifications({
    staffUserId: user?.id || '',
    enableRealtime: true
  })

  return (
    <div>
      <p>You have {unreadCount} unread notifications</p>
      {notifications.map(n => (
        <div key={n.id} onClick={() => markAsRead(n.id)}>
          {n.title}
        </div>
      ))}
    </div>
  )
}
```

---

## Connection Modes

### 🟢 Real-time Mode (Firebase)
- **When**: Firebase configured in .env.local + staffUserId provided
- **Latency**: < 1 second
- **Indicator**: Green dot
- **Network**: Low usage (websocket)

### 🟡 Polling Mode (REST API)
- **When**: Firebase not configured OR no staffUserId
- **Latency**: 0-30 seconds
- **Indicator**: Yellow dot
- **Network**: Moderate usage (fetch every 30s)

---

## Notification Types

```typescript
type NotificationType =
  | 'appointment'              // General appointments
  | 'appointment_reminder'     // Upcoming appointment
  | 'appointment_confirmation' // Appointment confirmed
  | 'appointment_cancelled'    // Appointment cancelled
  | 'appointment_rescheduled'  // Appointment rescheduled
  | 'message'                  // General message
  | 'message_received'         // New message
  | 'alert'                    // General alert
  | 'treatment_followup'       // Treatment follow-up
  | 'billing_reminder'         // Payment due
  | 'payment_received'         // Payment received
  | 'membership_renewal'       // Membership expiring
  | 'marketing_promotion'      // Marketing message
  | 'system'                   // System message
  | 'system_alert'             // System alert
  | 'waitlist_offer'           // Waitlist spot available
  | 'form_required'            // Form needs completion
```

---

## Auto-Generated Action URLs

When user clicks notification, they're navigated based on type:

| Type | URL |
|------|-----|
| `appointment_*` | `/calendar` |
| `message_*` | `/messages` |
| `billing_*`, `payment_*` | `/billing` |
| `waitlist_*` | `/calendar` |
| `form_*` | `/patients` |
| All others | `/dashboard` |

**Custom URL**: Set `data.actionUrl` in notification to override

---

## API Endpoints

### GET /api/notifications
```
Query: ?limit=50&sortOrder=desc
Returns: { items: Notification[] }
```

### PATCH /api/notifications/{id}/read
```
Marks notification as read
Returns: { success: boolean }
```

### POST /api/notifications/read-all
```
Marks all as read
Returns: { success: boolean }
```

### DELETE /api/notifications/{id}
```
Deletes notification
Returns: { success: boolean }
```

---

## Firebase Structure

```
notifications/
  {staffUserId}/
    items/
      {notificationId}/
        id: string
        type: string
        title: string
        body: string
        read: boolean
        createdAt: Timestamp
        data?: object
        channel?: 'push' | 'email' | 'sms' | 'in_app'
        priority?: 'low' | 'normal' | 'high' | 'urgent'
```

---

## Environment Variables

### Required for Real-time
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

**Where**: Add to `/apps/admin/.env.local`

**Get from**: Firebase Console → Project Settings → Web App

---

## Creating a Notification (Backend)

### Via Firestore (Real-time)
```typescript
import { firestore } from './firebase'
import { collection, addDoc } from 'firebase/firestore'

const notificationsRef = collection(
  firestore,
  `notifications/${staffUserId}/items`
)

await addDoc(notificationsRef, {
  type: 'appointment_reminder',
  title: 'Appointment in 15 minutes',
  body: 'Sarah Johnson - Botox Treatment',
  read: false,
  createdAt: new Date(),
  data: {
    appointmentId: 'apt-123',
    patientId: 'pat-456'
  },
  channel: 'in_app',
  priority: 'high'
})
```

### Via REST API (Polling)
```typescript
await fetch('/api/notifications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    staffUserId: 'staff-123',
    type: 'appointment_reminder',
    title: 'Appointment in 15 minutes',
    body: 'Sarah Johnson - Botox Treatment',
    data: { appointmentId: 'apt-123' }
  })
})
```

---

## Common Tasks

### Check if Firebase is Configured
```typescript
import { isFirebaseConfigured } from '@/lib/firebase'

if (isFirebaseConfigured()) {
  console.log('Firebase ready for real-time!')
} else {
  console.log('Using polling mode')
}
```

### Listen to Real-time Events
```typescript
import { websocketService } from '@/services/websocket'

const unsubscribe = websocketService.on('notification.received', (data) => {
  console.log('New notification:', data)
})

// Cleanup
return () => unsubscribe()
```

### Manually Subscribe to Notifications
```typescript
import { websocketService } from '@/services/websocket'

websocketService.subscribeToNotifications('staff-user-123')
```

---

## Troubleshooting

### Problem: Yellow dot instead of green
**Cause**: Firebase not configured
**Fix**: Add Firebase env vars to .env.local and restart server

### Problem: Notifications not updating
**Cause**: API endpoint not working OR staffUserId missing
**Fix**: Check browser console, verify API, pass correct staffUserId

### Problem: No sound
**Cause**: Sound file missing
**Fix**: Add notification.mp3 to /public/sounds/ (optional)

### Problem: Browser notifications not showing
**Cause**: Permission denied OR icon missing
**Fix**: Click bell to request permission, add icon to /public/icons/ (optional)

### Problem: Duplicate notifications
**Cause**: Should not happen (has duplicate prevention)
**Fix**: Check processedIdsRef logic in useNotifications.ts

---

## Performance Tips

### ✅ Do This
- Use the hook at component level (not page level if possible)
- Pass staffUserId for real-time updates
- Enable sound/browser notifications for better UX
- Use optimistic updates (already implemented)

### ❌ Don't Do This
- Don't create multiple instances of useNotifications
- Don't poll more frequently than 30s without Firebase
- Don't store notifications in global state (hook handles it)
- Don't manually call API endpoints (hook handles it)

---

## Testing

### Manual Test - Polling Mode
```bash
# Start dev server
npm run dev

# Open http://localhost:3000
# Click notification bell
# Should see yellow dot (polling)
# Notifications should load from API
```

### Manual Test - Real-time Mode
```bash
# Add Firebase config to .env.local
# Restart server
npm run dev

# Open http://localhost:3000
# Click notification bell
# Should see green dot (connected)

# In another terminal/tool, add notification to Firestore
# Should appear instantly in UI
```

### Unit Test Example
```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useNotifications } from '@/hooks/useNotifications'

test('loads notifications', async () => {
  const { result } = renderHook(() => useNotifications({
    staffUserId: 'test-user',
    enableRealtime: false
  }))

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false)
  })

  expect(result.current.notifications.length).toBeGreaterThan(0)
})
```

---

## File Locations

```
src/
  hooks/
    useNotifications.ts          # Main hook
  components/
    notifications/
      NotificationBell.tsx       # Bell icon component
      NotificationPanel.tsx      # Dropdown panel
      NotificationItem.tsx       # Individual item
      index.ts                   # Exports
  services/
    websocket.ts                 # Real-time service
  lib/
    firebase.ts                  # Firebase config
  contexts/
    AuthContext.tsx              # User context

public/
  sounds/
    notification.mp3             # Sound file (optional)
  icons/
    notification-icon.png        # Icon file (optional)
```

---

## Quick Checklist

### ✅ Working Now
- [x] Notification display
- [x] Unread count badge
- [x] Mark as read
- [x] Delete notifications
- [x] Clear all
- [x] Click to navigate
- [x] Connection status
- [x] Sound toggle
- [x] Polling mode

### ⚠️ Optional Setup
- [ ] Add Firebase config (for real-time)
- [ ] Add notification.mp3 (for sound)
- [ ] Add notification-icon.png (for custom icon)
- [ ] Add unit tests
- [ ] Add E2E tests

---

## Need Help?

1. **Architecture**: Read `NOTIFICATION_SYSTEM_FLOW.md`
2. **Full Review**: Read `NOTIFICATION_INTEGRATION_REVIEW.md`
3. **Setup**: Read `NOTIFICATION_INTEGRATION_FIXES.md`
4. **Complete Info**: Read `NOTIFICATION_VERIFICATION_COMPLETE.md`
5. **Sound Setup**: Read `public/sounds/README.md`
6. **Icon Setup**: Read `public/icons/README.md`

---

## Version Info

- **Implementation Date**: December 2024
- **Last Verified**: 2026-01-01
- **Status**: Production Ready ✅
- **Mode**: Polling (upgrades to real-time with Firebase)

---

**Happy coding! 🚀**
