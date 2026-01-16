# Virtual Waiting Room - Quick Start Guide

## For Developers

### Installation

No additional dependencies required! The waiting room system uses existing packages:
- Mobile: React Native, Expo Notifications, Expo Haptics
- Web: Next.js, Lucide React icons, Tailwind CSS

### Configuration

1. **Set API URLs**

Mobile (`.env`):
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Web (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

2. **Test Check-In Flow**

```typescript
// Mobile
import { checkInService } from '@/services/waiting-room/checkInService';

const response = await checkInService.checkIn({
  appointmentId: 'apt-123'
});

// Web
import { waitingRoomService } from '@/lib/services/waitingRoomService';

const response = await waitingRoomService.checkIn({
  appointmentId: 'apt-123'
});
```

3. **Test Notifications (Mobile)**

```typescript
import { notificationHandler } from '@/services/waiting-room/notificationHandler';

// Request permissions
await notificationHandler.requestPermissions();

// Test notification
await notificationHandler.scheduleTestNotification('apt-123');
```

### Usage in Components

#### Mobile Dashboard Integration
```typescript
import CheckInCard from '@/components/waiting-room/CheckInCard';

<CheckInCard
  appointmentId="apt-123"
  service="Botox - Full Face"
  provider="Dr. Sarah Chen"
  time={new Date()}
  canCheckIn={true}
  isCheckedIn={false}
/>
```

#### Navigation
```typescript
import { router } from 'expo-router';

// Go to check-in
router.push({
  pathname: '/waiting-room/check-in',
  params: { appointmentId: 'apt-123' }
});

// Go to status
router.push({
  pathname: '/waiting-room/status',
  params: { appointmentId: 'apt-123' }
});
```

## For End Users (Patients)

### How to Check In

#### Option 1: Mobile App
1. Open the app on your phone
2. You'll see your appointment on the dashboard
3. Tap the green **"Check In"** button
4. Done! You'll see your position in the queue

#### Option 2: Text Message
1. Send a text to **(555) 123-4567**
2. Type: **"HERE"**
3. You'll receive a confirmation text
4. Open the app to see your position

#### Option 3: QR Code (Web)
1. Scan the QR code at clinic entrance
2. Your phone will open the check-in page
3. Automatic check-in
4. See your waiting room status

### What to Expect

**After Check-In:**
- See your position in queue (#1, #2, etc.)
- Estimated wait time (~15 minutes)
- Status updates every 10 seconds

**When Room is Ready:**
- Push notification on your phone
- SMS text message
- App shows "Room Ready!"
- Message tells you which room to go to

### Troubleshooting

**"Can't check in" error:**
- Make sure you're at the clinic
- Check-in opens 2 hours before your appointment
- If still having trouble, see the front desk

**Not receiving notifications:**
- Check your phone's notification settings
- Make sure the app has permission to send notifications
- Try restarting the app

**Status not updating:**
- Check your internet connection
- Pull down to refresh manually
- Try closing and reopening the app

## For Clinic Staff

### How It Works

1. **Patient checks in** (app, SMS, or QR code)
2. **Backend adds them to queue** (sorted by priority, then arrival time)
3. **Patient sees position** and estimated wait
4. **Status updates automatically** every 10 seconds
5. **Staff calls patient** when room is ready
6. **Notification sent** to patient's phone

### Admin Portal Integration

The check-in data flows into your existing admin portal:
- View queue: `/api/waiting-room/queue`
- Update status: `/api/waiting-room/queue` (PATCH)
- Send "room ready" notification from admin

### QR Code Setup

1. Generate QR codes for each location
2. URL format: `https://yoursite.com/waiting-room/qr?appointmentId=XXX`
3. Print and place at clinic entrance
4. Laminate for durability

### SMS Configuration

Already configured! Uses existing Twilio integration:
- Webhook: `/api/waiting-room/check-in`
- Keywords: "HERE", "ARRIVED", "I'M HERE"

## Testing Checklist

### Mobile App
- [ ] Check-in from dashboard works
- [ ] Check-in from appointments list works
- [ ] Queue position displays correctly
- [ ] Estimated wait time shows
- [ ] Status updates every 10 seconds
- [ ] Push notification received when room ready
- [ ] Tapping notification opens status screen
- [ ] Haptic feedback on button press
- [ ] "Too early" message shows correctly
- [ ] "Already checked in" redirects to status

### Web Portal
- [ ] Check-in button works
- [ ] QR code check-in works
- [ ] Queue visualization shows
- [ ] Estimated wait displays
- [ ] Auto-refresh works (10s)
- [ ] Manual refresh button works
- [ ] Responsive on mobile browser
- [ ] Directions button opens maps
- [ ] Call button works

### Backend Integration
- [ ] POST check-in creates queue entry
- [ ] GET queue returns correct data
- [ ] Estimated wait calculated correctly
- [ ] SMS check-in works
- [ ] Group booking check-in works
- [ ] Priority sorting works (VIP first)

## Production Checklist

### Before Launch
- [ ] Update API URLs to production
- [ ] Configure push notification certificates
- [ ] Test on physical devices (iOS & Android)
- [ ] Print QR codes for all locations
- [ ] Train staff on new system
- [ ] Send announcement to patients

### Monitoring
- [ ] Check-in success rate
- [ ] Notification delivery rate
- [ ] Average wait times
- [ ] API error logs
- [ ] Patient feedback

## Support Contacts

**Technical Issues:**
- Developer: dev@medispa.com
- Support: support@medispa.com

**Patient Questions:**
- Front Desk: (555) 123-4567
- Help: help@medispa.com

## Additional Resources

- Full documentation: `/WAITING_ROOM_IMPLEMENTATION.md`
- User flows: `/WAITING_ROOM_FLOWS.txt`
- API docs: Admin portal README
