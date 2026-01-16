# Group Booking Test Scenarios

Comprehensive test scenarios for validating the Group Booking feature.

## Test Scenario 1: Bridal Party - Sarah's Wedding Day

### Overview
Sarah is getting married and wants to book makeup services for herself and 6 bridesmaids.

### Participants
- **Coordinator:** Sarah Johnson (Bride)
- **Members:** 6 bridesmaids
  - Emily Rodriguez (Maid of Honor)
  - Jessica Martinez
  - Amanda Chen
  - Rachel Kim
  - Lauren Davis
  - Sophie Anderson

### Service Details
- **Service:** Bridal Makeup
- **Duration:** 90 minutes per person
- **Price:** $450 per person
- **Scheduling:** Staggered 30 minutes apart
- **Event Date:** December 20, 2025
- **Start Time:** 8:00 AM

### Test Steps

#### Phase 1: Create Group (Sarah)
1. Sarah opens app → Dashboard
2. Taps "Book Appointment" → "Book for Group"
3. Enters group details:
   - Name: "Sarah's Wedding Day"
   - Event Type: Bridal
   - Event Date: December 20, 2025
   - Expected Members: 7 (including herself)
4. Selects "Bridal Makeup" service
5. Chooses provider: "Dr. Sarah Chen"
6. Selects time slot: 8:00 AM
7. Chooses payment mode: "I'll pay for everyone"
8. Reviews summary:
   - 7 people = 10% discount
   - Original: $3,150
   - Discounted: $2,835
   - Deposit (20%): $567
9. Confirms and creates group
10. Group created with code: **SARAH2**

**Expected Results:**
- Group created successfully
- Sarah receives booking confirmation
- Booking code generated: SARAH2
- Deposit payment pending

#### Phase 2: Send Invites (Sarah)
1. Sarah taps "Invite Members"
2. Enters bridesmaids' contact info:
   - Emily: (555) 234-5678
   - Jessica: (555) 345-6789
   - Amanda: (555) 456-7890
   - Rachel: (555) 567-8901
   - Lauren: (555) 678-9012
   - Sophie: (555) 789-0123
3. Adds custom message: "Can't wait to get glam with you all! 💄"
4. Taps "Send Invites"

**Expected Results:**
- 6 SMS messages sent
- Each contains: Group name, booking code, invite link
- Sarah sees "6 invites sent"
- Group status: "1 of 7 booked"

#### Phase 3: Members Join (Bridesmaids)
**Emily (Maid of Honor) - Immediate Join:**
1. Receives SMS: "Sarah invited you to join 'Sarah's Wedding Day'! Code: SARAH2 [link]"
2. Taps link → App opens to Join Group screen
3. Sees group details:
   - Sarah's Wedding Day (Bridal Party)
   - December 20, 2025
   - Sarah Johnson (Coordinator) ✓ Confirmed
   - 10% group discount
4. Taps "Join Group"
5. Service pre-selected: Bridal Makeup
6. Time slots shown with coordination:
   - 8:00 AM (Sarah) - Taken
   - 8:30 AM ← Suggested
   - 9:00 AM
   - 9:30 AM
   - 10:00 AM
   - ...
7. Selects 8:30 AM
8. Confirms booking
9. Joins group chat

**Expected Results:**
- Emily successfully joined
- Time slot 8:30 AM confirmed
- Sarah receives notification: "Emily just joined!"
- Group status: "2 of 7 booked"
- Emily can access group chat

**Jessica - Delayed Join:**
1. Receives SMS but busy
2. Opens app 2 hours later
3. Taps "My Groups" → No groups yet
4. Taps "Join with Code"
5. Enters code: SARAH2
6. Finds group and joins
7. Selects 9:00 AM slot
8. Confirms

**Expected Results:**
- Late join works correctly
- Available slots updated (8:30 taken by Emily)
- Group status: "3 of 7 booked"

**Amanda, Rachel, Lauren - Sequential Joins:**
1. Each receives SMS and joins throughout the day
2. Amanda: 9:30 AM
3. Rachel: 10:00 AM
4. Lauren: 10:30 AM

**Sophie - Last Member:**
1. Joins last
2. Selects 11:00 AM (last available slot)
3. Group now complete: "7 of 7 booked"

**Expected Results:**
- All 7 members successfully booked
- Sequential time slots (30 min apart)
- Group discount applied: 10%
- Total: $2,835 (saved $315)
- All members in group chat

#### Phase 4: Group Coordination (Day Before)
**Sarah's actions:**
1. Opens group details
2. Sees all 7 members confirmed
3. Posts in group chat: "Reminder: Arrive 10 min early!"
4. All members see message and reply

**Expected Results:**
- Chat messages sent/received
- Read receipts show who saw message
- Sarah has coordinator badge (👑) in chat

#### Phase 5: Event Day - Check-In
**8:00 AM - Sarah Arrives:**
1. Sarah checks in via app
2. Status changes to "Checked In"
3. Other members see her status update

**8:15 AM - Bulk Check-In:**
1. Emily, Jessica, Amanda arrive together
2. Coordinator (Sarah) checks them all in at once
3. Taps "Check In Group" → Selects 3 members
4. All 3 marked as "Checked In"

**Remaining Members:**
1. Rachel, Lauren, Sophie check in individually as they arrive

**Expected Results:**
- All members checked in successfully
- Timeline shows progression
- Admin can see group status in real-time

#### Phase 6: Payment Processing
1. Sarah pays deposit when creating group: $567
2. On event day, balance due: $2,268
3. Sarah pays via saved card
4. Each member receives email receipt
5. Sarah receives master invoice for tax purposes

**Expected Results:**
- Deposit processed correctly
- Balance calculated accurately
- Group discount applied
- Individual and master receipts generated

### Success Metrics
- ✅ All 7 members booked successfully
- ✅ 10% discount applied correctly
- ✅ Sequential scheduling worked
- ✅ Group chat facilitated coordination
- ✅ Check-in process smooth
- ✅ Payment processed correctly
- ✅ Total time saved vs individual bookings: ~20 minutes

---

## Test Scenario 2: Corporate Wellness Day

### Overview
TechCorp HR wants to book spa services for 12 employees as part of wellness program.

### Participants
- **Coordinator:** Jennifer Lee (HR Manager)
- **Members:** 12 employees (various departments)

### Service Details
- **Services:** Mixed (5 massages, 4 facials, 3 body treatments)
- **Duration:** 60-90 minutes each
- **Date:** January 15, 2026
- **Time:** 9:00 AM - 5:00 PM
- **Payment:** Corporate card (single invoice)

### Test Steps

#### Phase 1: Create Corporate Group
1. Jennifer opens app
2. Creates group: "TechCorp Wellness Day"
3. Event type: Corporate
4. Expected size: 12
5. Payment mode: Coordinator pays all
6. Date: January 15, 2026
7. Time range: 9 AM - 5 PM
8. Jennifer books massage for herself: 9:00 AM

**Expected Results:**
- Group created: TECHC1
- 20% discount (12+ people)
- Flexible scheduling (custom times)

#### Phase 2: Employee Sign-Up
1. Jennifer sends company-wide email with booking code
2. Employees join throughout the week
3. Each selects preferred service:
   - 5 choose 60-minute massage ($120)
   - 4 choose HydraFacial ($250)
   - 3 choose body contouring ($400)
4. Times distributed throughout the day

**Expected Results:**
- Self-service booking works
- Service variety supported
- Time slots don't conflict
- Total tracked in real-time

#### Phase 3: Corporate Payment
1. Jennifer reviews final group
2. Total: $2,640 (original: $3,300)
3. Saved $660 with 20% discount
4. Enters corporate credit card
5. Adds PO number: PO-2026-001
6. Submits payment

**Expected Results:**
- Corporate payment processed
- Invoice includes:
  - Company name and address
  - Tax ID
  - PO number
  - Itemized list of services
  - Individual employee names
  - Group discount breakdown
  - Total with tax

#### Phase 4: Event Day
1. Employees arrive throughout the day
2. Each checks in individually
3. HR dashboard shows real-time attendance
4. All 12 employees attended

**Expected Results:**
- Staggered arrival worked smoothly
- Individual check-ins tracked
- No scheduling conflicts
- Attendance report generated for HR

### Success Metrics
- ✅ 12 employees booked diverse services
- ✅ 20% corporate discount applied
- ✅ Single invoice for accounting
- ✅ PO number tracking
- ✅ Attendance tracking
- ✅ Company wellness program success

---

## Test Scenario 3: Friends Spa Day

### Overview
4 friends want to book together for a relaxing spa day.

### Participants
- **Coordinator:** Lily (organized friend)
- **Members:** 3 friends (Sarah, Emma, Rachel)

### Service Details
- **Service:** HydraFacial
- **Duration:** 60 minutes
- **Price:** $250 per person
- **Scheduling:** Sequential (back-to-back)
- **Payment:** Split equally

### Test Steps

#### Phase 1: Create Friends Group
1. Lily creates group: "Girls Day Out"
2. Event type: Friends
3. Date: Saturday, March 15
4. Expected: 4 people
5. Payment mode: Split payment
6. Lily books her slot: 10:00 AM

**Expected Results:**
- Group created: LILY4
- 10% discount (4 people)
- Split payment enabled

#### Phase 2: Friends Join via Group Chat
1. Lily shares code in WhatsApp group chat
2. Sarah taps link and joins: 11:00 AM
3. Emma joins: 12:00 PM
4. Rachel joins: 1:00 PM

**Expected Results:**
- Easy join via link
- Sequential times selected
- Each sees group discount

#### Phase 3: Split Payment
1. Each member pays individually
2. Lily: $225 (paid first)
3. Sarah: $225
4. Emma: $225
5. Rachel: $225
6. Total: $900 (saved $100)

**Expected Results:**
- Individual payment prompts
- Each gets their own receipt
- Group total tracked
- All payments required before event

#### Phase 4: Group Chat Coordination
1. Lily: "Should we get lunch after?"
2. Sarah: "Yes! I know a great place"
3. Emma: "Count me in 🍕"
4. Rachel: "Perfect!"
5. Lily shares restaurant link
6. Everyone confirms

**Expected Results:**
- Chat enhances social experience
- Members feel connected
- Coordination easy

#### Phase 5: Event Day
1. All 4 arrive on time
2. Check in individually
3. Enjoy sequential treatments
4. Meet in lobby after
5. Leave together for lunch

**Expected Results:**
- Sequential scheduling worked perfectly
- Social aspect enhanced experience
- Group discount provided value
- Would book again

### Success Metrics
- ✅ Quick and easy booking process
- ✅ Split payment worked smoothly
- ✅ Group chat enhanced experience
- ✅ 10% discount saved money
- ✅ Social bonding achieved
- ✅ High likelihood of repeat bookings

---

## Test Scenario 4: Last-Minute Addition

### Overview
Test adding someone to an existing group at the last minute.

### Setup
- Existing group of 4 (2 hours before appointment)
- 5th person wants to join

### Test Steps

#### Phase 1: Existing Group
1. Group "Spa Sunday" created yesterday
2. 4 members confirmed for 2:00 PM - 5:00 PM
3. Sarah (coordinator) receives text from friend: "Can I join?"

#### Phase 2: Late Addition
1. Sarah opens group details
2. Taps "Invite More"
3. Sends code to friend: SUNDA5
4. Friend receives text 2 hours before
5. Taps link to join

#### Phase 3: Availability Check
1. System checks real-time availability
2. Finds slot: 3:30 PM - 4:30 PM (between existing)
3. Shows friend the available slot
4. Friend confirms immediately

#### Phase 4: Price Recalculation
1. Group size: 4 → 5
2. Discount: 10% → 15%
3. System recalculates for ALL members
4. New total shown
5. Coordinator notified of savings increase

#### Phase 5: Fast Payment
1. Late joiner pays immediately
2. Confirms within 5 minutes
3. Receives instant confirmation
4. Added to group chat

**Expected Results:**
- Real-time availability check worked
- Slot found without conflicts
- Discount recalculated correctly
- Payment processed quickly
- Group chat updated
- All members notified

### Success Metrics
- ✅ Late addition supported
- ✅ No booking conflicts
- ✅ Discount recalculation automatic
- ✅ Fast confirmation process
- ✅ Flexibility appreciated by users

---

## Test Scenario 5: Cancellation Cascade

### Overview
Test handling multiple cancellations and group dissolution.

### Setup
- Group of 5 people
- 3 members cancel sequentially

### Test Steps

#### Phase 1: Initial Group
1. "Spa Squad" with 5 members
2. 15% discount applied
3. All confirmed and paid deposit

#### Phase 2: First Cancellation
1. Member 1 cancels due to emergency
2. Group size: 5 → 4
3. Discount changes: 15% → 10%
4. Coordinator notified
5. Refund processed for Member 1
6. System asks: "Continue with 4?"

**Expected Results:**
- Cancellation processed
- Discount recalculated
- Coordinator notified immediately
- Option to continue shown

#### Phase 3: Second Cancellation
1. Member 2 cancels (sick)
2. Group size: 4 → 3
3. Discount stays: 10%
4. Coordinator notified again
5. System shows: "Group still has 3 members"

**Expected Results:**
- Second cancellation handled
- Group still viable
- Prices updated correctly

#### Phase 4: Third Cancellation
1. Member 3 cancels
2. Group size: 3 → 2
3. Below comfortable size
4. System alerts coordinator:
   - "Group reduced to 2 members"
   - "Discount now 5%"
   - "Options:"
     - A) Continue with 2
     - B) Invite more members
     - C) Cancel group

#### Phase 5: Coordinator Decision
1. Coordinator decides to cancel group
2. Confirms cancellation
3. Remaining member notified
4. Full refunds processed
5. Group archived (not deleted)

**Expected Results:**
- Cancellation cascade handled gracefully
- Clear communication at each step
- Multiple options provided
- Refunds processed correctly
- Group history preserved

### Success Metrics
- ✅ Multiple cancellations handled
- ✅ Real-time discount updates
- ✅ Clear coordinator notifications
- ✅ Flexible options provided
- ✅ Refunds processed correctly
- ✅ Group history maintained

---

## Edge Case Tests

### Edge Case 1: Duplicate Join Attempt
**Scenario:** Member tries to join same group twice

**Test:**
1. Member joins group with code PARTY1
2. Member receives SMS again (forwarded)
3. Member taps link again

**Expected Result:**
- System detects duplicate
- Shows: "You're already in this group!"
- Redirects to existing booking
- No duplicate created

### Edge Case 2: Invalid Booking Code
**Scenario:** User enters wrong code

**Test:**
1. User taps "Join with Code"
2. Enters: XXXXX1 (invalid)
3. System checks database

**Expected Result:**
- "Group not found" message
- Suggestion: "Check code with coordinator"
- Allow retry
- Show example format

### Edge Case 3: Group Full
**Scenario:** Group reaches max capacity

**Test:**
1. Group set for max 8 people
2. 8 members already joined
3. 9th person tries to join

**Expected Result:**
- "Group is full" message
- Show waitlist option
- Suggest contacting coordinator
- Offer alternative dates

### Edge Case 4: Payment Failure
**Scenario:** Deposit payment doesn't process

**Test:**
1. Coordinator creates group
2. Attempts deposit payment
3. Card declined

**Expected Result:**
- Clear error message
- Hold appointments for 1 hour
- Allow payment retry
- Show alternative payment methods
- Send reminder SMS
- Auto-cancel if no payment after 24hrs

### Edge Case 5: Network Interruption
**Scenario:** User loses internet mid-booking

**Test:**
1. User starts joining group
2. Selects service and time
3. Network drops during confirmation

**Expected Result:**
- Show offline indicator
- Save progress locally
- Auto-retry when online
- Prevent duplicate booking
- Show confirmation when successful

---

## Performance Tests

### Load Test 1: Concurrent Joins
**Test:** 10 members join same group simultaneously

**Expected:**
- All joins processed
- No duplicate time slots
- Correct discount calculation
- All notifications sent
- Average response time < 2 seconds

### Load Test 2: Large Group
**Test:** Corporate group with 50 members

**Expected:**
- Creation succeeds
- UI remains responsive
- Scrolling smooth
- All members trackable
- Payment processing works

### Load Test 3: High Chat Activity
**Test:** 20 members in active group chat

**Expected:**
- Messages delivered instantly
- Read receipts accurate
- No message loss
- UI remains smooth
- Notifications not overwhelming

---

## Accessibility Tests

### Test 1: Screen Reader
- All buttons properly labeled
- Status badges readable
- Progress indicators announced
- Form validation messages clear

### Test 2: Large Text
- UI scales properly
- No text cutoff
- Buttons remain tappable
- Cards resize correctly

### Test 3: High Contrast
- All text readable
- Status colors distinguishable
- Buttons clearly visible
- Focus indicators prominent

---

## Summary

**Total Test Scenarios:** 5 major + 5 edge cases + 3 performance + 3 accessibility

**Coverage:**
- ✅ All user types (coordinator, member)
- ✅ All event types (bridal, corporate, friends, family)
- ✅ All payment modes (coordinator, individual, split)
- ✅ All scheduling modes (simultaneous, staggered, custom)
- ✅ Edge cases and errors
- ✅ Performance under load
- ✅ Accessibility compliance

**Success Criteria:**
- 100% of happy paths work
- 90%+ of edge cases handled gracefully
- < 2 second response times
- Zero data loss
- Full accessibility support

**Ready for Production:** After all tests pass ✅

