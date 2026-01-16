# Waitlist Management Edge Cases and Error Scenarios Research

## Executive Summary

This document consolidates comprehensive research on edge cases and error scenarios for waitlist management systems in medical spas. Based on industry research, real-world implementations, and healthcare compliance requirements, these scenarios represent critical points of failure that impact patient satisfaction, operational efficiency, and business revenue.

---

## 1. Multiple Patients Responding to Same Slot

### Scenario
Multiple patients from the waitlist are notified about the same available appointment slot. If offers go out simultaneously or in rapid succession, two or more patients may attempt to confirm the slot before the system realizes it's been claimed.

### Real-World Impact
- **Patient Frustration**: When a patient finds the slot unavailable after receiving an offer, they feel the system failed them
- **Revenue Loss**: Slots remain unfilled due to poor acceptance rates if too many are offered
- **Staff Burden**: Manual cleanup required when double-bookings occur

### Industry Solutions

**1. Cap-Based Offering**
- Offer slots to a calculated number of patients simultaneously (typically 3-5 based on historical acceptance rates)
- Calculate optimal cap size: too few results in unfilled slots; too many results in disappointed patients
- Track acceptance conversion rates to refine the cap

**2. Slot Locking/Race Condition Prevention**
- When Patient A clicks "accept," the slot is locked for 60 seconds
- If Patient B clicks during those 60 seconds, they receive: "This slot just filled. Checking for alternatives..." message
- System immediately searches for next compatible match
- Real-time synchronization prevents double-booking from parallel staff attempts

**3. First-Come-First-Served with Timestamps**
- Record exact acceptance timestamp
- Award slot to patient with earliest timestamp
- Immediately notify other candidates that slot was claimed

---

## 2. Slot Fills Before Patient Responds (Graceful Degradation)

### Scenario
A patient is sent a waitlist notification offering a slot, but before they respond:
- Another patient accepts it first
- Staff manually books the slot
- The slot is cancelled by provider

### Handling Strategies

**Graceful Slot Unavailability Message**
- Present clear UI: "Sorry, this slot filled. Here are 3 other options matching your preferences"
- Immediately offer alternative times within next 48 hours
- Use AutoFillSuggestion logic to find similar opportunities

---

## 3. Patient Accepts But Then Wants to Cancel

### Scenario
After confirming appointment from waitlist, patient changes mind and wants to cancel.

### Medical Spa Cancellation Policies (Industry Standard)

**Typical Fee Structure:**
- **24-hour notice**: 50% of service cost forfeited
- **Less than 24 hours**: 100% charge (full no-show fee)
- **High-ticket services (injectables)**: 48-hour notice required
- **Common amounts**: $25-$100 per service

**Recommended Strategy:**
- First 10-15 minutes: free cancellation with 1-click option
- After grace period: inform patient of fees before allowing cancellation
- Track patients who frequently accept then cancel (more than 2x per month)

---

## 4. Patient No-Show Tracking

### Scenario
Patient confirms waitlist appointment but fails to appear, with no cancellation notice.

### Industry Impact
- **Annual US Healthcare Loss**: ~$150 billion due to missed appointments
- **Per Appointment Cost**: ~$196 per missed appointment

### Recommended Tracking System

**Multi-Step Reminder Protocol:**
- **T-48 hours**: Email reminder with link to confirm/cancel/reschedule
- **T-24 hours**: SMS reminder (HIPAA-compliant) with 1-click confirm
- **T-2 hours**: SMS pre-appointment reminder
- **No-show**: Automatic notification to staff and patient

**No-Show Classification:**
- First no-show: Send apology, offer 20% discount on rescheduling
- Second no-show (within 6 months): Require 24-hour deposit for future bookings
- Third no-show: Require full prepayment; possible suspension

---

## 5. Patient Accepts But Wants Different Service

### Scenario
Patient accepts appointment for "Botox Treatment" but wants "Lip Filler" instead.

### Handling Approach

**Acceptance Negotiation Window:**
- Allow service/practitioner changes within 24 hours of booking
- Beyond 24 hours: treat as modification requiring new consultation
- If new service has different price: charge/refund difference

---

## 6. Staff Manually Books Slot While Waitlist Notifications Pending

### Scenario
System sends waitlist notifications about available slot while staff simultaneously manually books a patient into that same slot.

### Race Condition Prevention

**Real-Time Synchronization (Essential):**
- Waitlist system must have READ + WRITE access to scheduling software
- Calendar must continuously broadcast availability updates
- When staff manually books: immediately remove slot from pending waitlist offers

**Booking Lock Period:**
- Once waitlist offers sent: 10-30 minute lock on manual bookings
- Staff CAN override with warning/confirmation
- Automatic timeout if no patient accepts
- Detailed audit logging of all overrides

---

## 7. Appointment Gets Cancelled Again After Waitlist Patient Booked

### Scenario
Waitlist patient finally gets booked into appointment. Hours or days later, the appointment gets cancelled.

### Handling Strategy

**Immediate Notification Protocol:**
- Immediate SMS notification: "Your appointment cancelled. We're finding alternatives..."
- Search for alternative slots and present 3 options immediately
- Allow 1-click rescheduling
- Offer $X credit/discount for inconvenience

---

## 8. Patient on Waitlist for Multiple Time Slots (Deduplication)

### Scenario
Patient is on waitlist for multiple instances of the same service (Tuesday, Thursday, Friday). When they book one slot, should remaining waitlists be auto-removed?

### Recommended Approach

**Automatic Single-Service Deduplication:**
- When patient confirms appointment for Service X, search for other instances of Service X
- Send SMS: "You booked Botox on Tuesday. Keep also being on waitlist for Thursday and Friday [YES] or [CANCEL remaining]?"
- Default behavior: auto-cancel after 24 hours if no response

---

## 9. Invalid Phone Numbers and SMS Delivery Failures

### Scenario
Patient's phone number is invalid or SMS fails to deliver. Patient never receives waitlist offer but system marks them as "notified."

### Handling Strategy

**Phone Number Validation:**
- Validate format using libphonenumber library
- Confirm country code
- Check against known invalid/landline patterns
- Flag suspicious numbers for manual review

**SMS Delivery Tracking & Fallback Chain:**
1. SMS send attempt
2. If fails after 1 retry → Wait 2 minutes → Try phone call (text-to-speech)
3. If phone fails → Immediately send email
4. If email fails → Add to "manual outreach" queue (staff calls within 1 hour)
5. If all fail → Mark as "unreachable"

---

## 10. Patient Responds After Time Window Expired

### Scenario
Patient receives SMS with 30-minute response window but sees message 45 minutes later and tries to accept.

### Time Window Strategy

**Configurable Response Windows:**
- **High-demand services**: 10-20 minutes
- **Standard services**: 30 minutes
- **Less popular times**: 60 minutes
- **Emergency/urgent slots**: 5 minutes

**Graceful Expiration Handling:**
```
Patient clicks "ACCEPT" after window expires
  ↓
System checks: Window still open?
  ↓
If expired: Present 3 similar alternatives immediately
If they decline: Re-add to waitlist with updated preferences
```

---

## 11. Time Zone Handling for Notification Timing

### Scenario
Medical spa is in Eastern Time (ET). Patient is in Pacific Time (PT). Offer says "Your appointment is Tuesday 2 PM ET" but patient interprets as 2 PM PT and misses appointment.

### Implementation Strategy

**Patient Timezone Detection & Confirmation:**
- Attempt auto-detect from phone/browser
- Present for confirmation: "We'll send notifications in your time zone: Pacific Time (PT)"
- Store timezone with waitlist entry

**Multi-Timezone Notification Clarity:**
SMS should show BOTH:
```
"Your Botox appointment is:
Tuesday, August 15 at 2:00 PM (Eastern Time)
That's 11:00 AM in Pacific Time"
```

**Reminder Timing:**
- Send reminders at patient's local time, not practice timezone
- Handle daylight savings transitions automatically

---

## 12. Holiday and After-Hours Handling

### Scenario
Patient submits waitlist request Friday at 11 PM for Saturday morning appointment. Spa is closed Sunday-Monday. Holiday coming up. Staff is limited.

### Industry Research

**Patient Behavior:**
- ~50% of all appointments booked outside business hours
- 59% of clients frustrated by limited office hours
- 69% more likely to book with 24/7 online booking

### Implementation Strategy

**Holiday Calendar Setup:**
- Mark all closures (holidays, staff shortages)
- When patient requests unavailable date: "We're closed Nov 28-29. First available: Nov 30"
- Show available dates EXCLUDING holidays/closed days

**After-Hours Waitlist Sign-Up:**
- Chatbot responds immediately (24/7)
- Next business day: Staff reviews submissions and processes in priority order

**Holiday Surge Management:**
- Enable "premium holiday booking" (+20% pricing)
- Reduce response windows (must accept within 10 min)
- Increase number of simultaneous offers (5-7 instead of 3)
- Consider temporary staff increase

---

## 13. Current Codebase Implementation Status

### Existing Components

**1. `waitlistAutoFill.ts`** - Scoring and matching algorithm
- Service matching (exact/similar)
- Duration fitting
- Practitioner preference
- Waiting time bonus (up to 15 points)
- Availability alignment
- Forms completion status (10 point bonus)
- Deposit tracking (5 point bonus)
- Minimum score threshold: 50 for "good match"

**2. `WaitlistPanel.tsx`** - Waitlist UI management
- Drag-to-book functionality
- Priority grouping (high/medium/low)
- Search and filtering by practitioner and priority
- Quick-book feature that books next available
- Patient removal from waitlist
- Statistics: high-priority count, forms-ready count, deposits-in

**3. `AutoFillNotification.tsx`** - Suggestion notification UI
- Shows top match with match reasons
- Indicates additional matches available
- One-click booking action
- Bottom notification display

### Critical Gaps to Address

1. **No SMS/notification delivery tracking** - No implementation of fallback chain
2. **No race condition prevention** - Missing slot locking mechanism
3. **No grace period** for post-acceptance cancellations
4. **No timezone handling** in notifications
5. **No holiday/availability** calendar integration
6. **No state machine** for tracking offer/response/booking flow
7. **Limited error handling** for edge cases
8. **No audit logging** for operational issues and debugging

---

## 14. HIPAA Compliance Considerations

### SMS Requirements
1. **Encryption**: All SMS containing PHI must be encrypted end-to-end
2. **Written Consent**: Required before sending SMS
3. **Risk Warning**: Patient must be warned about SMS security risks
4. **Business Associate Agreement**: Required with SMS vendor
5. **Access Controls**: Log who sent/accessed SMS
6. **De-identification**: When possible, avoid sensitive health info in SMS

**Compliant SMS Example:**
"Your med spa appointment confirmed for tomorrow 2 PM. Reply CONFIRM to confirm, CANCEL to cancel."

**Non-Compliant SMS Example:**
"Your Botox injection appointment confirmed. Your practitioner is Dr. Smith who specializes in anti-wrinkle treatments."

### Email Requirements
- Can include more detail than SMS (encrypted)
- Must clearly label as from medical provider
- Include unsubscribe option
- Secure delivery only

---

## 15. Recommended Implementation Checklist

### Phase 1: Core Error Handling
- [ ] Implement slot locking (60-90 second hold on acceptance)
- [ ] Add graceful "slot filled" messages with alternatives
- [ ] Create fallback offer logic (find similar alternatives)
- [ ] Implement phone number validation + SMS retry logic
- [ ] Add confirmation window closing notifications
- [ ] Create no-show detection and tracking

### Phase 2: Patient Communication
- [ ] Add timezone detection and display
- [ ] Build SMS delivery failure handling (email/voice fallback)
- [ ] Implement cancellation grace period (first 15 min free)
- [ ] Create automatic deduplication for same-service waitlists
- [ ] Build holiday/after-hours messaging

### Phase 3: Staff Protection
- [ ] Implement appointment slot locking during pending offers
- [ ] Add warnings for staff manual bookings during offer windows
- [ ] Create audit logging for all overrides
- [ ] Build dashboards for monitoring edge cases
- [ ] Create playbooks for each scenario

### Phase 4: Compliance & Analytics
- [ ] Ensure all SMS is HIPAA-compliant
- [ ] Implement Business Associate Agreements with SMS vendors
- [ ] Create comprehensive error/incident reports
- [ ] Build analytics for acceptance rates, no-shows, cancellations
- [ ] Document policies and communicate to patients

---

## 16. Key Sources

- [Maximize Bookings: Waitlist Efficiency - American Med Spa Association](https://americanmedspa.org/blog/maximize-bookings-how-the-waitlist-feature-boosts-med-spa-efficiency)
- [Waitlist Management for Med Spas - Pabau](https://pabau.com/blog/waitlist-management-med-spas/)
- [Med Spa Cancellation Policy Guide - Pabau](https://pabau.com/blog/med-spa-cancellation-policy-guide/)
- [Best Practices for Managing Appointments in Med Spas - ProSpyR](https://www.prospyrmed.com/blog/post/best-practices-for-managing-appointments-in-med-spas/)
- [Automated Waitlist Performance - PMC/NIH](https://pmc.ncbi.nlm.nih.gov/articles/PMC11938453/)
- [Patient Waitlist Management for Hospitals - Waitwhile](https://waitwhile.com/blog/patient-waitlist-management-for-hospitals/)
- [HIPAA Compliant Texting - HIPAA Journal](https://www.hipaajournal.com/texting-violation-hipaa/)
- [HIPAA SMS Requirements - NexHealth](https://www.nexhealth.com/resources/hipaa-sms)
- [SMS Delivery Troubleshooting - SMSGlobal](https://knowledgebase.smsglobal.com/en/articles/5178502-troubleshooting-sms-delivery-problems)
- [Working with Patients Across Time Zones - Jane App](https://jane.app/guide/working-with-patients-across-time-zones)

