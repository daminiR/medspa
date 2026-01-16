# Group Booking Implementation Guide

## Overview

This document provides a comprehensive guide to the Group Booking feature implementation for the Medical Spa Platform's patient-facing applications (mobile and web). Group Booking is a CRITICAL competitive feature that enables coordinators to book appointments for multiple people simultaneously with automatic group discounts.

## Architecture

### Technology Stack

**Mobile (React Native + Expo SDK 52)**
- Location: `/apps/patient-mobile/`
- Framework: React Native with Expo Router
- State Management: Zustand
- Styling: React Native StyleSheet
- Animations: React Native Reanimated

**Web (Next.js 14)**
- Location: `/apps/patient-web/`
- Framework: Next.js 14 with App Router
- State Management: Zustand
- Styling: Tailwind CSS
- UI Components: Custom + Lucide Icons

**Shared Types**
- Location: `/packages/types/src/group.ts`
- Exported from `@medical-spa/types`
- Used across mobile, web, and admin

### Data Flow

```
Patient App → groupService → API → Admin Backend
     ↓
Deep Link Handler → Join Group Flow
     ↓
Group Chat → Real-time Updates
```

## Key Features

### 1. Use Cases

#### Bridal Parties
- Bride books 6-8 bridesmaids for makeup/hair
- Same-day services with staggered timing
- Coordinator pays for all, split payment optional
- Group chat for coordination

#### Corporate Events
- Company books 10+ employees for spa day
- Multiple services at once
- Corporate payment (single invoice)
- Activity tracking for billing

#### Friends Groups
- 3-4 friends book together for treatments
- Individual service selection
- Split payment or coordinator pays
- Social experience with group chat

#### Family Events
- Family celebration bookings
- Different services for different members
- Flexible payment options
- Gift certificates integration

### 2. Group Discount Tiers

```typescript
- 2 people: 5% off
- 3-4 people: 10% off
- 5-9 people: 15% off
- 10+ people: 20% off
```

### 3. Booking Codes

Each group gets a unique 6-character code:
- Format: `SARAH2`, `EMILY5`, `CORP42`
- Generated from coordinator's first name + digit
- Used for: Deep links, SMS invites, manual join

## Implementation Details

### File Structure

#### Mobile App (`/apps/patient-mobile/`)

```
app/
├── groups/
│   ├── index.tsx                # My Groups list
│   ├── create.tsx               # Create new group
│   ├── [id].tsx                 # Group details
│   ├── join.tsx                 # Join via code
│   └── chat/[id].tsx            # Group chat

components/groups/
├── GroupMemberCard.tsx          # Member status card
├── GroupTimeline.tsx            # Appointment timeline
├── GroupInviteModal.tsx         # Send invites modal
├── GroupPaymentSummary.tsx      # Payment breakdown
└── GroupActivityFeed.tsx        # Activity history

services/
└── groupService.ts              # API client
```

#### Web App (`/apps/patient-web/`)

```
app/
├── groups/
│   ├── page.tsx                 # Groups list
│   ├── create/page.tsx          # Create wizard
│   ├── [id]/page.tsx            # Group dashboard
│   ├── join/page.tsx            # Join flow
│   └── [id]/chat/page.tsx      # Group chat

components/groups/
├── GroupManagementDashboard.tsx # Coordinator dashboard
├── MemberGrid.tsx               # Desktop member grid
├── GroupCalendar.tsx            # Availability calendar
├── InviteManager.tsx            # Manage invitations
└── PaymentManager.tsx           # Group payment handling
```

#### Shared Types (`/packages/types/src/group.ts`)

```typescript
export interface GroupBooking {
  id: string;
  bookingCode: string;
  name: string;
  eventType: 'bridal' | 'corporate' | 'friends' | 'family';
  coordinatorPatientId: string;
  participants: GroupBookingParticipant[];
  discountPercent: number;
  totalDiscountedPrice: number;
  paymentMode: 'individual' | 'coordinator' | 'split';
  // ... more fields
}
```

### Core Flows

#### Flow 1: Create Group (Coordinator)

**Steps:**
1. Dashboard → "Book for Group"
2. Enter group details:
   - Name (e.g., "Sarah's Bridal Party")
   - Event type (bridal/corporate/friends/family)
   - Event date
   - Number of expected participants
   - Preferred date/time range
3. Select coordinator's service & time
4. Choose payment mode:
   - Coordinator pays all
   - Each pays individually
   - Split payment
5. Generate invite link
6. Send invites via SMS/email
7. Monitor member bookings

**Mobile Screen: `CreateGroup.tsx`**
```typescript
export default function CreateGroupScreen() {
  const [step, setStep] = useState(1); // 4 steps
  const [groupData, setGroupData] = useState<Partial<CreateGroupBookingRequest>>();
  
  // Step 1: Group Details
  // Step 2: Coordinator Service Selection
  // Step 3: Invite Members
  // Step 4: Confirm & Create
}
```

#### Flow 2: Join Group (Member)

**Steps:**
1. Receive SMS: "Sarah invited you to join her bridal party! [link]"
2. Tap link → App opens (or web if no app)
   - Deep link: `medspa://group/SARAH2`
   - Web fallback: `https://app.medspa.com/group/SARAH2`
3. See group details:
   - Group name & event
   - Coordinator info
   - Current participants
   - Available services
   - Group discount
4. Select service
5. Choose preferred time (coordinated with group)
6. Confirm booking
7. Join group chat

**Mobile Screen: `JoinGroup.tsx`**
```typescript
export default function JoinGroupScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [group, setGroup] = useState<GroupBooking | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Load group by code
  // Show group details
  // Service selection
  // Time coordination
  // Confirm join
}
```

#### Flow 3: Manage Group (Coordinator)

**Features:**
- View dashboard: "5 of 8 members booked"
- Send reminders to pending members
- Adjust appointment times
- Add/remove participants
- Message entire group
- View payment status
- Process deposit payment
- Check-in group (bulk)

**Mobile Screen: `GroupDetails.tsx`**
```typescript
export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [group, setGroup] = useState<GroupBooking | null>(null);
  const isCoordinator = group?.coordinatorPatientId === currentUserId;
  
  // Coordinator actions
  if (isCoordinator) {
    // - Invite more members
    // - Send reminders
    // - Manage payment
    // - Cancel group
  }
  
  // Member actions
  // - View details
  // - Chat with group
  // - Manage my booking
}
```

#### Flow 4: Group Chat

**Features:**
- WhatsApp-style interface
- Real-time messaging
- Read receipts
- System messages (booking updates)
- Coordinator badge
- Share photos (optional)

**Mobile Screen: `GroupChat.tsx`**
```typescript
export default function GroupChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Real-time message updates
  // Send message
  // Mark as read
  // System notifications
}
```

### Components

#### GroupMemberCard

Shows individual member with status:
- Avatar (or initials)
- Name
- Service
- Time
- Status badge (invited/pending/confirmed/checked-in)
- Payment status

```typescript
interface GroupMemberCardProps {
  participant: GroupBookingParticipant;
  isCoordinator: boolean;
  canRemove: boolean;
  onRemove?: () => void;
  onReschedule?: () => void;
}
```

#### GroupTimeline

Visual timeline of all appointments:
- Timeline view with time markers
- Stacked appointments (simultaneous)
- Sequential appointments (staggered)
- Room assignments
- Provider assignments

```typescript
interface GroupTimelineProps {
  participants: GroupBookingParticipant[];
  schedulingMode: 'simultaneous' | 'staggered_15' | 'staggered_30';
}
```

#### GroupInviteModal

Send invites to join group:
- Enter phone numbers/emails
- Custom message
- Copy invite link
- Share via SMS/email/social
- Track sent invites

```typescript
interface GroupInviteModalProps {
  group: GroupBooking;
  onClose: () => void;
  onInvitesSent: (count: number) => void;
}
```

### Deep Linking

#### Setup

**Mobile (Expo)**
```typescript
// app.json
{
  "expo": {
    "scheme": "medspa",
    "plugins": [
      ["expo-linking", {
        "scheme": ["medspa"],
        "universalLinks": ["https://app.medspa.com"]
      }]
    ]
  }
}
```

**Handle Deep Links**
```typescript
// app/_layout.tsx
import * as Linking from 'expo-linking';

useEffect(() => {
  const handleDeepLink = (event: { url: string }) => {
    const { hostname, path, queryParams } = Linking.parse(event.url);
    
    if (hostname === 'group') {
      // medspa://group/SARAH2
      const code = path?.replace('/', '');
      if (code) {
        router.push('/groups/join?code=' + code);
      }
    }
  };
  
  Linking.addEventListener('url', handleDeepLink);
  return () => Linking.removeEventListener('url', handleDeepLink);
}, []);
```

#### Web Fallback

```typescript
// app/group/[code]/page.tsx (Next.js)
export default function GroupJoinPage({ params }: { params: { code: string } }) {
  // Check if mobile app is installed
  // If yes: redirect to deep link
  // If no: show web join flow
  
  useEffect(() => {
    const tryDeepLink = () => {
      window.location.href = 'medspa://group/' + params.code;
      
      // Fallback to app store after 2 seconds
      setTimeout(() => {
        if (document.hasFocus()) {
          // Still on page, app not installed
          setShowAppDownload(true);
        }
      }, 2000);
    };
    
    tryDeepLink();
  }, [params.code]);
}
```

### API Service

#### groupService.ts

Mock-ready service layer:

```typescript
class GroupBookingService {
  private baseUrl = '/api/groups';
  private mockMode = true; // Switch to false for real API
  
  async createGroupBooking(request: CreateGroupBookingRequest): Promise<GroupBooking>
  async getGroupBooking(groupId: string): Promise<GroupBooking | null>
  async getGroupBookingByCode(code: string): Promise<GroupBooking | null>
  async getMyGroups(patientId: string): Promise<GroupBooking[]>
  async joinGroupBooking(request: JoinGroupBookingRequest): Promise<GroupBooking>
  async sendGroupInvites(request: SendGroupInviteRequest): Promise<void>
  async sendChatMessage(request: GroupChatMessageRequest): Promise<GroupChatMessage>
  
  // Helper methods
  getInviteLink(bookingCode: string): string
}
```

### UI/UX Design

#### Visual Design Elements

**Color Scheme:**
- Primary: `#8B5CF6` (Purple) - Group booking brand color
- Success: `#10B981` (Green) - Confirmed status
- Warning: `#F59E0B` (Yellow) - Pending status
- Danger: `#EF4444` (Red) - Cancelled
- Gray: `#9CA3AF` - Invited status

**Status Badges:**
```
Invited:   Gray circle + "Invited" (not joined yet)
Pending:   Yellow circle + "Pending" (joined, not confirmed)
Confirmed: Green circle + "Confirmed" (ready to go)
Checked In: Blue circle + "Checked In"
Completed: Purple circle + "Completed"
Cancelled: Red circle + "Cancelled"
No Show:   Dark red circle + "No Show"
```

**Avatar Circles:**
- Show profile photo if available
- Otherwise: initials in colored circle
- Size variants: 32px, 40px, 56px
- Stacked avatars: overlap by 8px for group display

**Progress Indicators:**
- "5 of 8 booked" with progress bar
- Circular progress for completion percentage
- Timeline with checkmarks for completed steps

**Group Timeline:**
- Vertical timeline with time markers
- Cards for each participant
- Lines connecting related appointments
- Room labels for simultaneous bookings

#### Mobile-Specific Features

**Gestures:**
- Swipe left on member card: Remove (coordinator only)
- Pull to refresh: Update group status
- Long press on message: Copy/react
- Pinch to zoom: Timeline view

**Animations:**
- FadeInDown for list items (staggered)
- Scale animation for button press
- Slide animation for modals
- Confetti effect on group completion

**Haptics:**
- Light impact: Button press
- Medium impact: Successful action
- Heavy impact: Error/warning
- Success notification: Booking confirmed

#### Web-Specific Features

**Desktop Layout:**
- Split view: Members list (left) + Timeline (right)
- Grid view option for multiple groups
- Bulk actions toolbar for coordinator
- Keyboard shortcuts (J/K navigation)

**Hover States:**
- Member cards: Show quick actions
- Timeline slots: Show details tooltip
- Invite buttons: Show preview
- Status badges: Show timestamp

### Edge Cases & Error Handling

#### Scenario 1: Member Cancels

**Trigger:** Member cancels their appointment

**Handling:**
1. Show cancellation modal with reason
2. Update participant status to 'cancelled'
3. Notify coordinator via push notification
4. Send group chat system message
5. Recalculate group discount (if below threshold)
6. Offer to replace or continue with fewer

**Code:**
```typescript
async cancelMemberBooking(groupId: string, patientId: string, reason: string) {
  // Update participant status
  // Notify coordinator
  // Check if group still meets minimum
  if (group.participants.filter(p => p.status !== 'cancelled').length < group.minParticipants) {
    // Show warning: "Group below minimum. Would you like to cancel entire group?"
  }
}
```

#### Scenario 2: Coordinator Cancels Entire Group

**Trigger:** Coordinator cancels group booking

**Handling:**
1. Show confirmation dialog
2. Cancel all participant appointments
3. Process refunds (if applicable)
4. Send SMS to all members
5. Send push notifications
6. Archive group (don't delete)

#### Scenario 3: Group Exceeds Capacity

**Trigger:** Trying to book when all slots full

**Handling:**
1. Check room/provider capacity
2. If full: Show alternative dates/times
3. Offer waitlist option
4. Suggest splitting into multiple groups
5. Show availability calendar

#### Scenario 4: Members in Different Time Zones

**Trigger:** Group members in different locations

**Handling:**
1. Store all times in UTC
2. Display in user's local timezone
3. Show timezone indicator in UI
4. Coordinator timezone is "primary"
5. Warnings for large timezone differences

#### Scenario 5: Payment Fails

**Trigger:** Deposit payment doesn't go through

**Handling:**
1. Hold appointments for 1 hour
2. Send payment failure notification
3. Allow payment retry
4. Offer alternative payment methods
5. After 1 hour: Mark as pending, send reminder
6. After 24 hours: Cancel if no payment

#### Scenario 6: Duplicate Join Attempts

**Trigger:** Same person tries to join twice

**Handling:**
1. Check if patientId already in group
2. If yes: Redirect to existing booking
3. Show: "You're already in this group!"
4. Option to view/edit existing booking

#### Scenario 7: Invalid Booking Code

**Trigger:** Wrong code entered

**Handling:**
1. Show: "Group not found"
2. Allow retry
3. Suggest: "Check code with coordinator"
4. Option to request new invite link

### Testing Scenarios

#### Test 1: Bridal Party - 6 Bridesmaids

**Setup:**
- Coordinator: Sarah (bride)
- Members: 6 bridesmaids
- Service: Bridal makeup (90 min each)
- Scheduling: Staggered 30 minutes
- Payment: Coordinator pays all

**Test Flow:**
1. Sarah creates group "Sarah's Wedding Day"
2. Selects bridal event type
3. Books her makeup for 8:00 AM
4. Invites 6 bridesmaids via SMS
5. Members receive SMS, tap link
6. Each selects makeup service
7. Auto-suggests staggered times (8:30, 9:00, 9:30...)
8. Sarah reviews all bookings
9. Pays deposit (20% of total)
10. Group chat activates
11. Day-of: Bulk check-in all members

**Expected Results:**
- 10% group discount (7 people)
- Total: ~$2,835 (down from $3,150)
- All bookings sequential, no conflicts
- SMS confirmations sent to all
- Reminder 24 hours before

#### Test 2: Corporate Event - 10 Employees

**Setup:**
- Coordinator: HR Manager
- Members: 10 employees
- Services: Mix (massage, facial, etc.)
- Scheduling: Custom times
- Payment: Corporate card

**Test Flow:**
1. HR creates "Company Wellness Day"
2. Selects corporate event type
3. Adds 10 employees manually
4. Each employee selects preferred service
5. Times coordinated around lunch break
6. HR pays with corporate card
7. Invoice generated for accounting
8. Individual appointment confirmations

**Expected Results:**
- 20% group discount (10+ people)
- Proper invoice with tax ID
- Individual service selection works
- Payment processed as single transaction
- Activity log for audit trail

#### Test 3: Friends Group - 4 People

**Setup:**
- Coordinator: Lily
- Members: 3 friends
- Service: HydraFacial (60 min)
- Scheduling: Same day, sequential
- Payment: Split equally

**Test Flow:**
1. Lily creates "Girls Day Out"
2. Selects friends event type
3. Generates booking code: LILY4
4. Shares code in group text
5. Friends join via code
6. All select HydraFacial
7. Choose sequential times
8. Split payment setup
9. Each pays their portion
10. Group chat for coordination

**Expected Results:**
- 10% group discount (4 people)
- Split payment works correctly
- Each member gets individual receipt
- Flexible payment timing
- Social chat enhances experience

#### Test 4: Last-Minute Join

**Setup:**
- Existing group of 3
- 4th person joins 2 hours before

**Test Flow:**
1. Existing group already confirmed
2. Late joiner receives code
3. Attempts to join via link
4. System checks availability
5. Finds slot between existing bookings
6. Quick payment flow
7. Immediate confirmation
8. Updated group chat

**Expected Results:**
- Availability check works in real-time
- No conflicts with existing bookings
- Discount recalculates (5% → 10%)
- Fast payment processing
- Instant notifications to group

#### Test 5: Cancellation Chain Reaction

**Setup:**
- Group of 5 people
- 3 members cancel

**Test Flow:**
1. Member 1 cancels (5 → 4 people)
2. Discount changes (15% → 10%)
3. Coordinator notified
4. Member 2 cancels (4 → 3 people)
5. Discount changes (10% → 10%)
6. Member 3 cancels (3 → 2 people)
7. Below minimum threshold warning
8. Coordinator decides to cancel group

**Expected Results:**
- Real-time discount recalculation
- Notifications at each step
- Below-minimum warning triggered
- Graceful group cancellation
- Proper refund processing

### Push Notifications

#### Notification Types

**For Coordinator:**
```typescript
{
  title: "New member joined! 👋",
  body: "Emily just joined your group booking",
  data: { groupId, action: 'view_group' }
}

{
  title: "Group almost full! 🎉",
  body: "7 of 8 members have booked",
  data: { groupId, action: 'invite_more' }
}

{
  title: "Payment reminder 💳",
  body: "Deposit due in 24 hours to confirm group",
  data: { groupId, action: 'pay_deposit' }
}
```

**For Members:**
```typescript
{
  title: "You're invited! 💌",
  body: "Sarah invited you to join her bridal party booking",
  data: { bookingCode, action: 'join_group' }
}

{
  title: "Booking confirmed ✅",
  body: "Your group booking is confirmed for Dec 20 at 10:00 AM",
  data: { groupId, action: 'view_details' }
}

{
  title: "New group message 💬",
  body: "Sarah: Don't forget to bring your robe!",
  data: { groupId, action: 'open_chat' }
}
```

### Analytics & Tracking

**Key Metrics:**
- Group creation rate
- Average group size
- Conversion rate (invited → joined)
- Most popular event types
- Average booking value (group vs individual)
- Cancellation rates
- Payment method distribution
- Chat engagement

**Events to Track:**
```typescript
analytics.track('group_created', {
  eventType: 'bridal',
  initialSize: 3,
  estimatedSize: 8
});

analytics.track('group_joined', {
  groupId,
  joinMethod: 'link' | 'code',
  timeToJoin: 'minutes since invite'
});

analytics.track('group_completed', {
  groupId,
  finalSize: 7,
  totalValue: 2835,
  discountPercent: 10
});
```

### Admin Integration

The admin panel already has full Group Booking support. Patient apps integrate via:

**View in Admin:**
- Groups appear in calendar as connected appointments
- Purple color coding for group bookings
- Single block view or individual appointments
- Group indicator badge
- Click to see full group details

**Admin Actions:**
- View group dashboard
- Check in entire group
- Process group payment
- Reschedule group
- Send group SMS
- View activity log
- Generate group invoice

**Sync:**
- Real-time sync via WebSockets (optional)
- Polling every 30 seconds for updates
- Push notifications to coordinator
- SMS updates to all members

## Next Steps

### Phase 1: Foundation (Week 1)
- ✅ Create shared types
- ✅ Build service layer
- 🔄 Create mobile screens
- 🔄 Create web pages

### Phase 2: Core Features (Week 2)
- Create/join group flows
- Member management
- Payment integration
- Deep linking setup

### Phase 3: Polish (Week 3)
- Group chat implementation
- Push notifications
- Analytics integration
- Error handling

### Phase 4: Testing (Week 4)
- End-to-end testing
- Edge case validation
- Performance optimization
- User acceptance testing

## Deployment Checklist

**Mobile:**
- [ ] Deep linking configured
- [ ] Push notifications tested
- [ ] App Store/Play Store metadata updated
- [ ] Feature flag enabled

**Web:**
- [ ] Universal links configured
- [ ] SEO for group pages
- [ ] Social sharing meta tags
- [ ] Analytics tracking

**Backend:**
- [ ] API endpoints deployed
- [ ] Database migrations run
- [ ] SMS service configured
- [ ] Payment processing enabled

**Documentation:**
- [ ] User guide created
- [ ] Admin training video
- [ ] API documentation
- [ ] Support FAQ

## Support & Resources

**Code Files Created:**
- `/packages/types/src/group.ts` - Shared types
- `/apps/patient-mobile/services/groupService.ts` - Mobile API service
- Screen templates provided in this document

**Admin Reference:**
- `/apps/admin/src/lib/data.ts` - GroupBooking interface
- `/apps/admin/src/components/appointments/GroupBookingDetails.tsx`

**Questions?**
- Check admin implementation for reference
- Use mock data mode during development
- Test with realistic scenarios
- Monitor analytics for user behavior

---

**Implementation Status:** Foundation Complete, Ready for Screen Development
**Last Updated:** December 11, 2025
**Version:** 1.0.0
