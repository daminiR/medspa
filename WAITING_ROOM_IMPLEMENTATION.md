# Virtual Waiting Room / Check-In System Implementation

## Overview

A complete contactless check-in system for patients arriving at the medical spa. This post-COVID essential feature allows patients to check in via mobile app, web portal, or SMS, and receive real-time updates on their waiting room status.

## System Architecture

### Backend APIs (Admin Portal)
- **POST `/api/waiting-room/check-in`** - Check in patient
- **GET `/api/waiting-room/queue`** - Get queue status
- **PATCH `/api/waiting-room/queue`** - Update queue entry

### Patient-Side Applications

#### 1. Mobile App (React Native + Expo SDK 52)
**Location:** `/apps/patient-mobile/`

**Key Components:**
- `screens/waiting-room/CheckIn.tsx` - Main check-in screen
- `screens/waiting-room/WaitingStatus.tsx` - Queue position display
- `components/waiting-room/CheckInButton.tsx` - Large "I'm Here" button
- `components/waiting-room/QueuePosition.tsx` - Visual queue indicator
- `components/waiting-room/EstimatedWait.tsx` - Wait time display
- `components/waiting-room/CheckInCard.tsx` - Dashboard integration card
- `services/waiting-room/checkInService.ts` - API integration
- `services/waiting-room/notificationHandler.ts` - Push notifications
- `types/waiting-room.ts` - TypeScript definitions

**Routes:**
- `/waiting-room/check-in` - Check-in interface
- `/waiting-room/status` - Waiting room status

#### 2. Web Portal (Next.js 14)
**Location:** `/apps/patient-web/`

**Key Components:**
- `app/(dashboard)/waiting-room/check-in/page.tsx` - Check-in page
- `app/(dashboard)/waiting-room/status/page.tsx` - Status page
- `app/(dashboard)/waiting-room/qr/page.tsx` - QR code check-in
- `components/waiting-room/CheckInButton.tsx` - Check-in button
- `components/waiting-room/QueuePosition.tsx` - Queue visualization
- `components/waiting-room/EstimatedWait.tsx` - Wait time display
- `lib/services/waitingRoomService.ts` - API integration
- `lib/types/waiting-room.ts` - TypeScript definitions

## Features Implemented

### 1. Patient-Side Features

#### "I'm Here" Button
- One-tap check-in when arriving at clinic
- Prominent green button with haptic feedback (mobile)
- Immediate confirmation and redirect to status screen

#### SMS Check-In
- Text "HERE" or "ARRIVED" to clinic number
- Automatic appointment lookup by phone number
- Confirmation SMS sent back to patient
- App automatically updates status

#### Arrival Status Display
- Real-time queue position visualization
- Circular indicators showing patients ahead/behind
- Color-coded status (checked in, waiting, room ready)

#### Estimated Wait Time
- Dynamic calculation: ~15 minutes per person ahead
- Color-coded badges (green: <5min, orange: 5-15min, blue: >15min)
- Contextual messages ("You'll be called soon!", "Feel free to relax")

#### Queue Updates
- Automatic polling every 10 seconds
- Real-time position updates
- Status changes reflected immediately

#### Pre-Arrival Check-In
- Can check in up to 2 hours before appointment
- Check-in window: 2 hours before to 30 minutes after
- Shows directions if checked in early

#### Directions
- "Directions" button opens maps app
- Clinic address displayed
- Integration with device's default maps

#### Push Notifications
- "Your room is ready!" notification
- Tapping notification opens status screen
- High-priority Android notifications
- Sound and vibration enabled

### 2. User Flows

#### Flow 1: Pre-Arrival Check-In
```
1. Patient receives reminder 2h before appointment
2. Notification includes "Check In Early" option
3. Tap → Shows check-in screen with appointment details
4. When arriving → Tap "I'm Here"
5. Status changes to "Waiting" → Shows position in queue
6. Room ready → Push notification
7. Check status → See "Room Ready!" message
```

#### Flow 2: On-Site Check-In
```
1. Patient arrives at clinic
2. Opens app → Dashboard shows today's appointment
3. Prominent "Check In" button on appointment card
4. Tap → Confirm check-in → Shows waiting status
5. Real-time updates on position
6. Room ready notification
```

#### Flow 3: SMS Check-In
```
1. Patient texts clinic number
2. Text "HERE" or "ARRIVED"
3. System finds appointment by phone number
4. Receives confirmation text
5. App automatically updates status (if open)
6. SMS when room is ready
```

#### Flow 4: QR Code Check-In (Web Only)
```
1. QR code displayed at clinic entrance
2. Patient scans with phone camera
3. Opens web portal automatically
4. Instant check-in via URL parameter
5. Redirects to waiting status page
```

### 3. Visual Design

#### Mobile (React Native)
- **Colors:** Green (#10B981) for check-in, Blue (#3B82F6) for waiting, Orange (#F59E0B) for ready
- **Typography:** System fonts, bold 22px for buttons, 18px for headers
- **Layout:** Card-based with rounded corners (16px), shadows for depth
- **Animations:** FadeIn, FadeInDown, scale transforms
- **Haptics:** Medium impact on button press

#### Web (Next.js + Tailwind)
- **Colors:** Purple gradient headers, green for check-in buttons
- **Typography:** System fonts, responsive sizing
- **Layout:** Max-width containers (2xl), centered content
- **Components:** Lucide icons, rounded-2xl cards
- **Responsive:** Mobile-first, adapts to desktop

### 4. Edge Cases Handled

| Scenario | Behavior |
|----------|----------|
| No appointment today | Show "No appointment scheduled" message |
| Too early to check in | Show "You can check in starting at [time]" |
| Already checked in | Redirect to waiting status screen |
| Appointment passed | Show "Appointment time passed, please call us" |
| Invalid QR code | Error message with return to dashboard button |
| Network error | Graceful error message, retry button |
| Group booking | Shows "Checked in to group: [name]. X/Y guests arrived" |

### 5. Dashboard Integration

#### Mobile Dashboard
- `CheckInCard` component shows when appointment is today
- Displays within 2 hours of appointment time
- Shows check-in status if already checked in
- Color-coded by status (green, blue, orange)

#### Web Dashboard
- Similar card component (to be integrated)
- Prominent placement above other content
- Click to check in or view status

## API Integration

### Data Models

```typescript
// Waiting Room Status
type WaitingRoomStatus = 'not_arrived' | 'in_car' | 'room_ready' | 'checked_in';

// Queue Entry
interface WaitingRoomQueueEntry {
  appointmentId: string;
  patientId: string;
  patientName: string;
  phone: string;
  practitionerId: string;
  practitionerName: string;
  serviceName: string;
  scheduledTime: Date;
  arrivalTime: Date;
  status: WaitingRoomStatus;
  priority: number; // 0 = normal, 1 = VIP, 2 = urgent
  estimatedWaitMinutes?: number;
  position?: number;
}
```

### Check-In Request
```typescript
POST /api/waiting-room/check-in
{
  appointmentId?: string,    // Direct check-in
  phone?: string,            // SMS check-in
  message?: string,          // SMS message content
  groupId?: string,          // Group booking check-in
  patientId?: string         // For group participant
}
```

### Queue Status Request
```typescript
GET /api/waiting-room/queue
Response: {
  success: true,
  queue: [WaitingRoomQueueEntry[]],
  totalWaiting: number
}
```

## Real-Time Updates

### Polling Implementation
- Polls every 10 seconds for queue status
- Compares previous status to detect changes
- Triggers notifications on status change
- Cleanup function prevents memory leaks

### Notification Triggers
- Room status changes to 'room_ready'
- First notification only (tracks roomReadyNotifiedAt)
- High-priority push notification
- In-app alert if app is open

## Configuration

### Environment Variables

#### Mobile (.env)
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
```

#### Web (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Notification Channels (Android)
```typescript
{
  name: 'default',
  importance: AndroidImportance.MAX,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#FF231F7C'
}
```

## Testing

### Manual Testing Checklist

#### Mobile
- [ ] Check in from dashboard
- [ ] Check in from appointment details
- [ ] See queue position
- [ ] See estimated wait time
- [ ] Receive room ready notification
- [ ] Tap notification opens status screen
- [ ] Refresh updates status
- [ ] Handle network errors gracefully
- [ ] Too early to check in message
- [ ] Already checked in redirect

#### Web
- [ ] Check in via button
- [ ] Check in via QR code
- [ ] See queue position
- [ ] See estimated wait time
- [ ] Auto-refresh every 10 seconds
- [ ] Manual refresh button works
- [ ] Directions button works
- [ ] Responsive on mobile browser

#### Backend Integration
- [ ] Check-in API creates queue entry
- [ ] Queue API returns correct position
- [ ] Estimated wait time calculated
- [ ] SMS check-in works
- [ ] Group booking check-in works

### Test Scenarios

1. **Happy Path:** Patient checks in → waits → room ready → sees notification
2. **Early Arrival:** Patient checks in 2 hours early → sees check-in allowed
3. **Late Arrival:** Patient checks in 30 minutes late → allowed
4. **Very Late:** Patient checks in 1 hour late → error message
5. **Already Checked In:** Patient tries to check in twice → shows status
6. **Group Booking:** All participants check in → shows group status

## Production Deployment

### Prerequisites
1. Backend APIs deployed and accessible
2. Push notification credentials configured (Expo)
3. QR codes generated for each clinic location
4. SMS service configured (Twilio)

### Configuration Steps

#### Mobile App
1. Update `EXPO_PUBLIC_API_URL` to production URL
2. Configure push notification certificates
3. Build and submit to app stores
4. Test on physical devices

#### Web Portal
1. Update `NEXT_PUBLIC_API_URL` to production URL
2. Deploy to hosting (Vercel, Netlify, etc.)
3. Configure domain and SSL
4. Test across browsers

#### Backend
1. Ensure endpoints are secured (authentication)
2. Configure rate limiting
3. Set up monitoring and logging
4. Test SMS webhook endpoint

### Monitoring
- Track check-in success rate
- Monitor notification delivery
- Log API errors
- Track polling performance

## Future Enhancements

### Phase 2 Features
- [ ] Video waiting room with practitioner intro
- [ ] Estimated wait time ML model (learning from actual times)
- [ ] Digital intake forms during wait
- [ ] Parking space finder integration
- [ ] Language translation support
- [ ] Accessibility improvements (screen reader support)
- [ ] Apple Watch app for status

### Advanced Features
- [ ] Geofencing auto-check-in
- [ ] Queue position trading (swap with consent)
- [ ] Virtual queue (wait at home)
- [ ] Companion app for someone driving patient
- [ ] Integration with patient portal medication reminders

## Support & Troubleshooting

### Common Issues

**"Can't check in" error:**
- Verify appointment exists and is today
- Check if within check-in window (2h before to 30m after)
- Ensure appointment status is 'scheduled' or 'confirmed'

**Notifications not working:**
- Check notification permissions in device settings
- Verify Expo push token is registered
- Test with local notification first

**Queue position not updating:**
- Check network connectivity
- Verify polling is active (console logs)
- Check backend API response

**QR code check-in fails:**
- Verify URL includes appointmentId parameter
- Check backend API is accessible
- Test QR code with multiple devices

## Documentation Files

- `/WAITING_ROOM_IMPLEMENTATION.md` - This file (technical implementation)
- `/WAITING_ROOM_USER_GUIDE.md` - End-user instructions
- `/WAITING_ROOM_FLOWS.txt` - ASCII art user flow diagrams
- API documentation in admin portal README

## License & Credits

Built for Medical Spa Platform by elite full-stack engineering team.
