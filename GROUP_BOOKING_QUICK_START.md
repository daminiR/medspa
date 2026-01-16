# Group Booking - Developer Quick Start

**⚡ Get started in 5 minutes**

## What Is This?

Group Booking allows patients to book appointments for multiple people with automatic discounts. Think: bridal parties, corporate wellness, friend groups.

**Discounts:**
- 2 people: 5% off
- 3-4 people: 10% off  
- 5-9 people: 15% off
- 10+ people: 20% off

## Files You Need

```
📁 Types (shared)
   /packages/types/src/group.ts

📱 Mobile Service  
   /apps/patient-mobile/services/groupService.ts

📋 Documentation
   GROUP_BOOKING_IMPLEMENTATION.md    (Read first)
   GROUP_BOOKING_SCREENS.md           (Screen specs)
   GROUP_BOOKING_TEST_SCENARIOS.md    (Test cases)
```

## Quick Code Examples

### Import Types

```typescript
import {
  GroupBooking,
  GroupBookingParticipant,
  calculateGroupDiscount,
  getStatusColor,
  getStatusLabel,
} from '@medical-spa/types';
```

### Use Service

```typescript
import { groupService } from '../../services/groupService';

// Get all my groups
const groups = await groupService.getMyGroups(patientId);

// Create group
const group = await groupService.createGroupBooking({
  name: "Sarah's Bridal Party",
  eventType: 'bridal',
  coordinatorPatientId: 'p1',
  date: new Date('2025-12-20'),
  schedulingMode: 'staggered_30',
  paymentMode: 'coordinator',
  depositRequired: true,
  participants: [/* ... */],
});

// Join group
await groupService.joinGroupBooking({
  bookingCode: 'SARAH2',
  patientId: 'p1',
  serviceId: 's3',
});

// Send chat message
await groupService.sendChatMessage({
  groupBookingId: 'group-1',
  senderId: 'p1',
  message: 'See you tomorrow!',
});
```

### Calculate Discount

```typescript
const discount = calculateGroupDiscount(5);  // Returns 15
const label = getDiscountLabel(5);            // Returns "15% off for 5-9"
```

### Status Colors

```typescript
const color = getStatusColor('confirmed');    // Returns "#10B981" (green)
const label = getStatusLabel('confirmed');    // Returns "Confirmed"
```

## Implementing a Screen

### 1. Copy Template

Find your screen in `GROUP_BOOKING_SCREENS.md`:
- CreateGroup
- JoinGroup  
- GroupDetails
- GroupChat
- MyGroups (already complete)

### 2. Basic Structure

```typescript
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { groupService } from '../../services/groupService';
import { GroupBooking } from '@medical-spa/types';

export default function YourScreen() {
  const [group, setGroup] = useState<GroupBooking | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      // Load your data
      const data = await groupService.getGroupBooking('group-1');
      setGroup(data);
    } catch (error) {
      console.error('Failed to load:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Your UI here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
```

### 3. Test with Mock Data

Service is in mock mode by default. Test everything before switching to real API.

```typescript
// In groupService.ts
private mockMode = true;  // ← Change to false when backend ready
```

## Common Patterns

### Loading State

```typescript
if (loading) {
  return (
    <View style={styles.loadingContainer}>
      <Text>Loading...</Text>
    </View>
  );
}
```

### Error Handling

```typescript
try {
  await groupService.joinGroupBooking(request);
  router.push('/groups/' + groupId);
} catch (error) {
  console.error('Join failed:', error);
  Alert.alert('Error', 'Failed to join group. Please try again.');
}
```

### Member List

```typescript
{group.participants.map(participant => (
  <GroupMemberCard
    key={participant.patientId}
    participant={participant}
    isCoordinator={isCoordinator}
    canRemove={isCoordinator && participant.patientId !== currentUserId}
  />
))}
```

### Status Badge

```typescript
<View style={[styles.badge, { backgroundColor: getStatusColor(status) + '20' }]}>
  <View style={[styles.dot, { backgroundColor: getStatusColor(status) }]} />
  <Text style={[styles.text, { color: getStatusColor(status) }]}>
    {getStatusLabel(status)}
  </Text>
</View>
```

## Styling Guide

### Colors

```typescript
Primary:   '#8B5CF6'  // Purple (group booking brand)
Success:   '#10B981'  // Green (confirmed)
Warning:   '#F59E0B'  // Yellow (pending)
Error:     '#EF4444'  // Red (cancelled)
Gray:      '#9CA3AF'  // Invited
Blue:      '#3B82F6'  // Checked in
Dark:      '#1F2937'  // Text
Light:     '#F9FAFB'  // Background
```

### Common Styles

```typescript
const commonStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

## Testing Checklist

Before considering your screen done:

- [ ] Loads mock data correctly
- [ ] Handles loading state
- [ ] Handles error state
- [ ] Handles empty state
- [ ] All buttons work
- [ ] Navigation works
- [ ] Styles match design
- [ ] Works on iOS
- [ ] Works on Android
- [ ] Accessible (screen reader)

## Need Help?

**Check these in order:**

1. **Screen templates** → `GROUP_BOOKING_SCREENS.md`
2. **Full documentation** → `GROUP_BOOKING_IMPLEMENTATION.md`
3. **Test scenarios** → `GROUP_BOOKING_TEST_SCENARIOS.md`
4. **Admin reference** → `/apps/admin/src/lib/data.ts`

**Common questions:**

Q: How do I test without backend?
A: Service is in mock mode by default. Just use it!

Q: Where do I get booking codes?
A: Use `generateBookingCode()` or let service generate it

Q: How do I handle deep links?
A: See Deep Linking section in main docs

Q: Can I change the discount tiers?
A: Yes, edit `GROUP_DISCOUNT_TIERS` in group.ts

Q: Do I need to build the web version?
A: Eventually, but focus on mobile first

## Development Workflow

1. **Read** `GROUP_BOOKING_IMPLEMENTATION.md` (20 min)
2. **Read** `GROUP_BOOKING_SCREENS.md` for your screen (10 min)
3. **Copy** template code
4. **Test** with mock data
5. **Style** according to design
6. **Test** all scenarios
7. **Review** with team
8. **Merge**

## Priority Order

Build screens in this order:

1. ✅ **MyGroups** (already complete)
2. **JoinGroup** (most common flow)
3. **GroupDetails** (view existing)
4. **CreateGroup** (coordinator flow)
5. **GroupChat** (engagement feature)

## Key Concepts

**Coordinator:** Person who creates the group
**Member:** Person who joins the group
**Booking Code:** 6-character code like "SARAH2"
**Status:** invited → pending → confirmed → arrived → completed
**Payment Mode:** coordinator (pays all) | individual | split

## Mock Data

Service includes mock group for testing:

```typescript
{
  id: 'group-1',
  bookingCode: 'SARAH2',
  name: "Sarah's Bridal Party",
  coordinatorPatientId: 'p1',
  participants: [3 members],
  discountPercent: 10,
  status: 'partially_confirmed',
}
```

Use `groupService.getGroupBooking('group-1')` to load it.

## Timeline

**Week 1:** Implement all screens
**Week 2:** Integration + testing
**Week 3:** Deploy to production

## Success Criteria

Your implementation is ready when:
- All 5 screens work
- All 3 components render
- All 5 test scenarios pass
- Mock mode → production mode works
- Deep linking works
- No console errors

## Resources

**Files:**
- Types: `/packages/types/src/group.ts`
- Service: `/apps/patient-mobile/services/groupService.ts`
- Complete Screen: `/apps/patient-mobile/app/groups/index.tsx`

**Docs:**
- Implementation Guide (full details)
- Screen Templates (copy-paste)
- Test Scenarios (validation)
- This file (quick start)

---

**Ready to start?** Pick a screen from `GROUP_BOOKING_SCREENS.md` and start coding! 🚀

**Questions?** Check the main documentation files.

**Status:** Foundation complete, screens ready to build ✅

