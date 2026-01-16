# Waitlist Management: Deep Technical & UX Competitor Analysis

**Analysis Date:** December 2024
**Prepared For:** Medical Spa Platform Development Team

---

## Executive Summary

This analysis examines six leading platforms' waitlist management implementations to identify technical patterns, UX best practices, gaps, and opportunities for differentiation. Key findings reveal that **no platform has achieved a complete, flawless waitlist system** - each has significant gaps we can exploit.

### Key Competitive Insights

| Platform | Automation Level | Race Condition Handling | VIP Support | Major Weakness |
|----------|-----------------|------------------------|-------------|----------------|
| **Mangomint** | High (Intelligent) | 24-hour expiry | No explicit tiers | No automated patient notification |
| **Boulevard** | Low (Manual) | Not automated | Credit card required | Completely manual - no auto-matching |
| **Jane App** | High (Preference-based) | Exclusive hold period | No tiers | Group appointments not supported |
| **Zenoti** | High (FIFO) | Configurable timeout | No explicit tiers | Complex setup, steep learning curve |
| **Square** | Medium | Service mismatch issues | No tiers | Over-notification problems |
| **Vagaro** | Medium | Manual handling | No tiers | Customers don't receive self-add notifications |

---

## Platform-by-Platform Deep Dive

---

## 1. Mangomint - "Express Booking" & "Intelligent Waitlist"

### Technical Implementation

**Slot Detection:**
- System automatically scans calendar when appointments are cancelled, rescheduled, or staff hours change
- Matches waitlist entries against newly available slots automatically
- Checks duration fit, practitioner preference, and availability windows

**Notification Mechanism:**
- **Internal notification only** - alerts sent to front desk email or directly to service providers
- No automated SMS/email to patients on waitlist
- Staff must manually use Express Booking to contact patients

**Express Booking Flow:**
1. Staff creates appointment with minimal info (name, phone, service)
2. System sends SMS with secure booking link
3. Patient has **24 hours** to complete booking
4. If not completed, appointment auto-deletes and slot reopens

**Race Condition Handling:**
- 24-hour timeout acts as soft lock
- Appointment held in "Pending" status until completed
- If timeout expires, slot automatically released
- **No explicit distributed locking documented**

**Slot Reservation:**
- Express Booking creates temporary hold
- Staff can manually cancel pending Express Booking
- Rooms/equipment can be assigned to prevent double-booking

### UX Flow

**Patient Joining Waitlist:**
- Can self-add through online booking if no suitable times found
- Collects: Name, phone, email, preferred service, date range, time preferences
- Toggle to enable waitlist in online booking settings

**Notification Format:**
- SMS: Contains secure link to complete booking
- Patient enters: contact info, credit card (if required), accepts cancellation policy
- Customizable message templates

**Acceptance Mechanism:**
- Click SMS link
- Multi-step form completion required
- Must complete within 24 hours

### Business Logic

- **Preference-based matching** (not strict FIFO)
- Scoring considers: service match, practitioner preference, duration fit, availability window
- Staff can manually prioritize by viewing waitlist
- No explicit VIP/tiered system

### Pricing & Monetization

| Plan | Price | Waitlist Included |
|------|-------|-------------------|
| Essentials | $165/mo | Yes |
| Standard | $245/mo | Yes |
| Unlimited | $375/mo | Yes |

- Two-way texting: +$75/month add-on
- Marketing flows require additional credits
- Unlimited SMS/email reminders included in base

### Gaps & Weaknesses

**User Complaints:**
- "Scheduling issues, particularly missing complete views and batch editing options"
- "Deposits not tracked in easily accessible way"
- "No automated prompt for tips when using memberships/packages"
- "Daily system issues taking payment after 4 PM CST"

**Missing Features:**
- No automated patient notification when slot opens
- No explicit VIP/priority tier support
- No group booking waitlist
- Reporting described as "lacking"

---

## 2. Boulevard - Waitlist System

### Technical Implementation

**Slot Detection:**
- **CRITICAL GAP: Waitlist is NOT automated**
- No automatic slot matching when cancellations occur
- Staff must manually check waitlist periodically

**Notification Mechanism:**
- Dashboard notification when client joins waitlist
- Email confirmation sent to client upon joining
- **No automated "slot available" notifications**

**Booking Confirmation Flow:**
1. Client selects service/provider in online booking
2. If no availability, can join waitlist
3. Credit card required to secure spot
4. Staff manually monitors and contacts clients
5. Clients not charged until appointment completed

**Race Condition Handling:**
- Not applicable (manual process)
- No concurrent booking scenarios in waitlist flow
- Credit card acts as commitment mechanism

### UX Flow

**Patient Joining Waitlist:**
- After selecting service/provider, if no times available
- Click "Join Waitlist"
- Enter credit card to secure spot
- Receive email confirmation

**What's Collected:**
- Service desired
- Provider preference (optional)
- Preferred dates/times
- Credit card information

**Post-Joining Experience:**
- No position visibility
- No preference display
- Must wait for manual staff contact

### Business Logic

- No automated matching logic
- First Available appointment concept (not FIFO)
- No VIP tiers documented
- No business closure/provider availability validation on self-booking waitlist

### Pricing & Monetization

| Plan | Price | Waitlist |
|------|-------|----------|
| Essentials | $158/mo | Yes |
| Premier | $263/mo | Yes |
| Prestige | $369/mo | Yes |

- SMS charged per segment (160 chars = 1 segment)
- Emoji/unicode: 70 chars = 1 segment
- MMS = 3 billable segments
- Contact Center (two-way texting): Premium add-on +$25/mo

### Gaps & Weaknesses

**Critical Issues:**
- **"Waitlist is not automated, meaning you will not receive future notifications if a potential matching spot opens up"**
- Manual process only - no efficiency gain
- Credit card requirement may deter casual interest

**User Complaints:**
- Mobile app bugs (Android especially)
- Missing reporting features
- Transaction corrections difficult
- Premium pricing for manual features

---

## 3. Jane App - Preference-Based Matching

### Technical Implementation

**Slot Detection:**
- Automatic scanning when appointments cancelled, no-showed, or moved
- Checks waitlist for eligible clients matching preferences
- Real-time matching against availability windows

**Notification Mechanism:**
- Dual channel: SMS and/or email (client preference)
- Can be automatic or manual (staff-triggered)
- 15-minute admin buffer for short-notice cancellations

**Exclusive Access Period (Slot Locking):**
- Configurable hold time (example: 3-5 hours)
- Slot held exclusively for waitlist clients during this period
- After timeout, auto-releases to general public
- Can manually release early

**Race Condition Handling:**
- First-come-first-served within notification group
- All eligible clients notified simultaneously
- First to click and book gets the slot
- Others see "no longer available" message

### UX Flow

**Patient Joining Waitlist:**
- Can self-add through online booking
- Enter: appointment type, availability (days, times, date range)
- Choose notification preference (SMS/email/both)
- Default availability = all day on selected date

**Notification Format:**
- Contains "View Available Openings" link
- Shows slot is held exclusively for waitlist
- If slot taken, prompts to look for other times or call clinic

**Acceptance Mechanism:**
- Click link in notification
- Redirected to booking page
- Complete booking (or see unavailable message)
- Some settings may require calling clinic

### Business Logic

- **Preference-based matching** (availability + appointment type)
- Tags must match (service tags vs shift tags)
- No explicit FIFO - all eligible clients notified together
- No VIP tier system

### Pricing & Monetization

| Plan | Price | Notes |
|------|-------|-------|
| Balance | $79/mo | Base practitioner included |
| Practice | ~$104/mo | +insurance billing option |
| Thrive | Higher | Full features |

- +$25-30 per additional FTE
- Insurance billing: +$20/mo
- **Unlimited SMS reminders reported** (no per-message cost mentioned)
- SMS availability varies by region

### Gaps & Weaknesses

**Documented Issues:**
- No waitlist notifications for group/class appointments
- Clinic not alerted when client self-adds to waitlist
- Available times don't respect shift/working hours
- US billing integration "not ready"
- Basic reporting capabilities

**User Pain Points:**
- Page loading slow for payments
- Platform locks into last patient when navigating
- Cannot search for all open appointments
- Tags must match exactly or notifications fail

---

## 4. Zenoti - FIFO Automated Waitlist

### Technical Implementation

**Slot Detection:**
- Real-time monitoring of cancellations/reschedules
- Integrates with Webstore and Customer Mobile App (CMA)
- Excludes providers marked as "Exclude from catalog"

**FIFO Logic:**
- Strict first-in-first-out queue
- When slot opens, identifies FIRST person in line for that slot
- Notifies first guest via SMS/email

**Notification Timing:**
- Configurable lead time (e.g., "Send notifications with X mins lead time")
- Example: 30 mins = no notifications for slots starting within 30 mins
- Prevents last-minute scrambles

**Confirmation Time Window:**
- Configurable response time (example: 120 minutes)
- Guest must confirm within window
- If no response, automatically moves to NEXT person in queue
- Process repeats until slot filled

**Race Condition Handling:**
- Sequential notification eliminates race conditions
- Only ONE person notified at a time
- Slot held during confirmation window
- Automatic cascade to next guest if timeout

### UX Flow

**Patient Joining Waitlist:**
- "Join Waitlist" button on Webstore
- Select preferred service/slot
- Seamless integration with booking flow

**Notification Format:**
- Branded SMS and email alerts
- Direct link to booking confirmation
- Macros available for customization:
  - `[TreatmentList]` - services scheduled
  - `[ServiceTherapistList]` - therapists assigned
  - `[GuestDataLink]` - guest form link
  - `[ConfirmText]` - reply options (Yes/No)

**Acceptance Mechanism:**
- Click link to confirm
- Or reply via SMS (if configured)
- Immediate calendar update on confirmation

### Business Logic

- Strict FIFO - no preference matching
- No documented VIP/tier support
- AI can dynamically adjust schedules and auto-fill gaps
- Integrated with deposits and automated reminders

### Pricing & Monetization

- **Custom pricing** (no public rates)
- Based on: locations, providers, voice/data consumption
- SMS sold in credit packs (10K credits = Rs. 4,000 in India)
- Yearly, Monthly, or Perpetual License options
- No free plan

**Hidden Costs Reported:**
- Installation fees
- Add-on features
- Updates
- Better customer service requires higher tier

### Gaps & Weaknesses

**Setup Issues:**
- "Tremendous 4-month introductory" period
- "Onboarding process... large number of individual forms"
- "Almost nothing has been set up correctly"
- Steep learning curve

**Technical Problems:**
- Mobile app slow to process
- App glitchy on wifi
- System "constantly glitching"
- Double bookings reported during initial setup

**Service Issues:**
- "Can never get a hold of customer service"
- Critical changes take hours
- Users don't have full system access

---

## 5. Square Appointments - Waitlist Features

### Technical Implementation

**Slot Detection:**
- Triggered by reservation-driven events:
  - Cancellations
  - Declines
  - Reservation updates (e.g., end time changes)
- **NOT triggered by:**
  - Personal event cancellations
  - Staff hour changes

**Notification Mechanism:**
- Automated email/SMS to matching waitlist entries
- Can send to all clients with matching availability preferences
- Up to 5 availability preferences per client

**Booking Flow:**
1. Client joins waitlist via online booking
2. Selects up to 5 preferred date/time windows
3. When matching slot opens, notification sent
4. Client clicks link to book
5. Once booked, all waitlist entries auto-removed

**Race Condition Handling:**
- Not explicitly documented
- First to book gets slot
- Others may see notification but find slot taken

### UX Flow

**Patient Joining Waitlist:**
- "Don't see your preferred date or time? Join Waitlist"
- Date/time picker (pre-filled with viewed date)
- Up to 5 availability preferences
- Option to receive notifications toggle

**Post-Booking:**
- Automatic removal from waitlist
- Only removed for accepted appointments
- Pending/declined don't trigger removal

### Business Logic

- Basic availability matching
- No FIFO or preference scoring documented
- No VIP tiers

### Pricing & Monetization

| Plan | Price | Waitlist |
|------|-------|----------|
| Free | $0 | No |
| Plus | $29/mo/location | Yes |
| Premium | $69/mo/location | Yes |

- Processing fees: 2.5-2.6% + 15-30c
- 30-day free trial available

### Gaps & Weaknesses

**Critical User Issues:**

1. **Service Duration Mismatch:**
   > "When a 2-hour service appointment was canceled, all their 4-hour service clients were messaged"
   - No filtering by service duration
   - Clients disappointed when told no availability after all

2. **Over-Notification/"Spam":**
   > "Customers from last year's waitlist being spammed with notifications"
   - Old entries persist and trigger
   - Difficult to remove clients in bulk

3. **Customer Self-Removal:**
   - Clients selecting "any time" get excessive notifications
   - Neither client nor business can easily stop them

4. **No Class Waitlist:**
   - Waitlist only for appointments
   - Classes not supported

**Feature Requests:**
- Filter automation by service duration
- Better bulk management
- Self-service removal for clients

---

## 6. Vagaro - Waitlist Functionality

### Technical Implementation

**Slot Detection:**
- Manual or automated options
- Monitors calendar for cancellations/openings

**Notification Mechanism:**
- Automated notification when spot opens
- Can manually accept waitlist appointments anytime
- Text reminders integration

**Booking Flow:**
1. Customer adds self to waitlist (or staff adds)
2. Calendar cancellation/opening detected
3. Notification sent
4. Customer can book via notification link

### UX Flow

**Patient Joining Waitlist:**
- Through business's Vagaro booking page
- Select desired service/provider
- Add availability preferences

**Known Issue:**
> "If the customer added themselves to the waitlist, they would not receive a notification"
- Self-added entries may not trigger notifications
- Design quirk or bug

**Multiple Entries Problem:**
> "Having 5 date options just ends up sending my client too many emails... I'll have 1 client listed 5 or more times!"

### Business Logic

- Basic matching
- No explicit FIFO or preference scoring
- No VIP tiers

### Pricing & Monetization

| Plan | Price | Notes |
|------|-------|-------|
| Solo | $30/mo | Base (was $25) |
| Per User | +$10/mo | Each additional |
| 7+ Users | $85/mo | Max tier |

**Add-ons:**
- Text marketing: +$10-20/mo
- Website builder: +$10/mo
- Online store: +$10/mo
- Forms: +$10/mo
- Custom branded app: $100/mo
- Email marketing: 1,000 free/mo, then charged

### Gaps & Weaknesses

**User Complaints:**
- "My waitlist also never worked from day one"
- Self-added customers don't receive notifications
- Multiple date preferences create duplicate entries
- Slow loading times
- "More than 50 support calls due to constant glitches" (new user report)

---

## Comprehensive Comparison Matrix

### Technical Features

| Feature | Mangomint | Boulevard | Jane App | Zenoti | Square | Vagaro |
|---------|-----------|-----------|----------|--------|--------|--------|
| **Auto Slot Detection** | Yes | No | Yes | Yes | Partial | Yes |
| **Auto Patient Notification** | No (staff only) | No | Yes | Yes | Yes | Partial |
| **FIFO Support** | No (preference) | No | No | Yes | No | No |
| **Preference Matching** | Yes | No | Yes | No | Basic | Basic |
| **Slot Locking/Hold** | 24hr Express | Credit card | Configurable | Timeout | No | No |
| **Race Condition Handling** | Timeout | Manual | First-click | Sequential | First-click | Unknown |
| **Configurable Timeout** | Fixed 24hr | N/A | Yes (3-5hr) | Yes | No | No |
| **Duration Matching** | Yes | No | Partial | No | No | No |

### UX Features

| Feature | Mangomint | Boulevard | Jane App | Zenoti | Square | Vagaro |
|---------|-----------|-----------|----------|--------|--------|--------|
| **Client Self-Add** | Yes | Yes | Yes | Yes | Yes | Yes |
| **Position Visibility** | No | No | No | No | No | No |
| **Preference Display** | Yes | No | Yes | No | Partial | Partial |
| **One-Click Accept** | Link + form | N/A | Link | Link/SMS reply | Link | Link |
| **Credit Card Required** | Optional | Yes | No | No | No | No |
| **Multiple Time Preferences** | Yes | Partial | Yes | No | Yes (5) | Yes (causes issues) |
| **Notification Channel Choice** | SMS only | Email only | SMS/Email/Both | SMS/Email | SMS/Email | SMS/Email |

### Business Features

| Feature | Mangomint | Boulevard | Jane App | Zenoti | Square | Vagaro |
|---------|-----------|-----------|----------|--------|--------|--------|
| **VIP/Tiered Priority** | No | No | No | No | No | No |
| **Staff Override** | Yes | Yes | Yes | Yes | Yes | Yes |
| **Group Booking Waitlist** | No | No | No | Unknown | No | Unknown |
| **Deposit Integration** | Yes | Yes | No | Yes | No | No |
| **Analytics/Reporting** | Basic | Basic | Basic | Yes | Basic | Basic |

### Pricing

| Platform | Base Price | Waitlist Tier | SMS Costs |
|----------|------------|---------------|-----------|
| **Mangomint** | $165/mo | All plans | Included (reminders) |
| **Boulevard** | $158/mo | All plans | Per segment |
| **Jane App** | $79/mo | All plans | Included |
| **Zenoti** | Custom | All plans | Credit packs |
| **Square** | $29/mo | Plus+ only | Unknown |
| **Vagaro** | $30/mo | All plans | Add-on |

---

## Identified Opportunities for Differentiation

### 1. **True Hybrid Matching Algorithm** (Nobody has this)

**Current Gap:** Platforms use either FIFO (Zenoti) OR preference-based (Jane/Mangomint), never both.

**Opportunity:**
```
Score = (FIFO_Points * FIFO_Weight) + (Preference_Points * Pref_Weight)
```
- Configurable weights let businesses choose their balance
- Default to preference-first with FIFO as tiebreaker
- VIP clients can override FIFO position

### 2. **VIP/Tiered Waitlist Priority** (Nobody has this)

**Current Gap:** No platform offers explicit VIP tier support for waitlist.

**Opportunity:**
- Platinum/Gold/Silver tiers with configurable priority multipliers
- VIP gets first notification regardless of join time
- Integration with loyalty programs
- Revenue-based auto-tier assignment

### 3. **Smart Duration Matching** (Square's biggest complaint)

**Current Gap:** Square notifies 4-hour clients about 2-hour openings.

**Opportunity:**
- Only notify clients whose service duration fits the opening
- Or offer "partial fit" notifications with clear messaging
- "A 2-hour slot opened - your 3-hour service could be split across days. Interested?"

### 4. **Real-Time Position & ETA** (Nobody has this)

**Current Gap:** No platform shows waitlist position or estimated wait time.

**Opportunity:**
- Show: "You are #3 on the waitlist for Botox"
- ETA: "Based on cancellation patterns, expected wait: 5-7 days"
- Historical conversion rates by service type

### 5. **Intelligent Race Condition Handling**

**Current Gap:** Jane's first-click wins frustrates clients who get notifications but miss out.

**Opportunity:**
- Implement short "claim window" (5 minutes) with lottery if multiple claims
- Or Zenoti-style sequential notification but with VIP priority
- Show "Someone else is confirming this slot - you're next in line"

### 6. **Group Booking Waitlist** (Jane explicitly doesn't support)

**Current Gap:** No waitlist for classes/groups.

**Opportunity:**
- Waitlist for specific classes
- "Notify me when any Botox group session opens"
- Partial availability: "2 of 4 spots available - join now?"

### 7. **SMS Cost Transparency & Optimization**

**Current Gap:** Boulevard charges per segment, confusing users.

**Opportunity:**
- Inclusive SMS in all plans
- Show "This notification will use X credits" before sending
- Auto-shorten URLs to save characters
- Offer email-first option to reduce SMS costs

### 8. **Proactive Waitlist Building**

**Current Gap:** All platforms are reactive (wait for clients to join).

**Opportunity:**
- AI suggests: "You have 3 cancellations next week. Send waitlist invites to recent inquiries?"
- "Jennifer asked about Botox last month but didn't book. Add to waitlist automatically?"
- Integration with marketing to target waitlist signups

### 9. **Cancellation Prediction + Pre-Notification**

**Current Gap:** All notify AFTER cancellation.

**Opportunity:**
- ML model predicts likely cancellations (patterns, weather, etc.)
- Pre-alert top waitlist candidates: "A slot may open tomorrow - be ready!"
- Instant notification when prediction materializes

### 10. **Deposit-Protected Instant Booking**

**Current Gap:** Boulevard requires card upfront but others don't protect against no-shows.

**Opportunity:**
- Optional: "Deposit $50 to move up in waitlist priority"
- Deposit automatically applied to booking
- If client no-shows, deposit covers gap
- Show clients their priority boost: "Your deposit moved you from #8 to #2"

---

## Implementation Priority Recommendations

### Phase 1: Foundation (Must Have)
1. Auto slot detection on all calendar changes
2. Preference-based matching with FIFO tiebreaker
3. Configurable exclusive hold period (like Jane's 3-5 hours)
4. Dual-channel notifications (SMS + Email)
5. Service duration matching (solve Square's #1 complaint)

### Phase 2: Differentiation (Competitive Advantage)
1. VIP tier system with priority multipliers
2. Real-time position display
3. Smart race condition handling (claim window)
4. Group booking waitlist support

### Phase 3: Innovation (Market Leadership)
1. Cancellation prediction + pre-notification
2. Proactive waitlist building AI
3. Deposit-protected priority boost
4. Advanced analytics (conversion rates, wait time patterns)

---

## Technical Architecture Recommendations

### Slot Locking Strategy
```typescript
interface SlotLock {
  slotId: string;
  patientId: string;
  createdAt: Date;
  expiresAt: Date;  // Configurable: 5 mins - 24 hours
  status: 'pending' | 'confirmed' | 'expired' | 'released';
}

// Use Redis distributed lock for concurrent safety
await redis.set(`slot_lock:${slotId}`, patientId, 'NX', 'EX', 300);
```

### Notification Queue
```typescript
// Prevent race conditions with sequential processing
interface NotificationJob {
  slotId: string;
  eligiblePatients: string[];  // Ordered by priority score
  currentIndex: number;
  timeout: number;
}

// Process one patient at a time, with timeout cascade
```

### Scoring Algorithm
```typescript
function calculateWaitlistScore(patient: WaitlistPatient, slot: Slot): number {
  let score = 0;

  // VIP tier bonus (configurable weights)
  score += patient.tierMultiplier * 100;  // Platinum: 3x, Gold: 2x, Silver: 1.5x

  // FIFO component
  const daysWaiting = daysSince(patient.joinedAt);
  score += Math.min(daysWaiting * 2, 30);  // Cap at 30 points

  // Preference matches
  if (patient.preferredProvider === slot.providerId) score += 25;
  if (patient.preferredService === slot.serviceId) score += 25;
  if (patient.serviceDuration <= slot.duration) score += 20;
  if (isWithinAvailability(patient, slot)) score += 15;

  // Readiness bonus
  if (patient.formsCompleted) score += 10;
  if (patient.depositPaid) score += 10;

  return score;
}
```

---

## Sources

### Mangomint
- [How to Use Express Booking](https://www.mangomint.com/learn/how-to-use-express-booking/)
- [Intelligent Waitlist Overview](https://www.mangomint.com/learn/help-articles/calendar/intelligent-waitlist/)
- [Booking from Waitlist](https://www.mangomint.com/learn/book-from-the-waitlist/)
- [Mangomint Pricing](https://www.mangomint.com/pricing/)
- [Capterra Reviews](https://www.capterra.com/p/187593/Mangomint/reviews/)

### Boulevard
- [Waitlist Support Article](https://support.boulevard.io/en/articles/5941433-waitlist)
- [Text and Marketing Usage Rates](https://support.boulevard.io/en/articles/7042507-text-and-marketing-usage-rates)
- [Boulevard Pricing](https://www.joinblvd.com/pricing)
- [The Salon Business Review](https://thesalonbusiness.com/boulevard-software-review/)

### Jane App
- [Wait List Notifications Client Experience](https://jane.app/guide/wait-list-notifications-client-experience)
- [Setting Up Wait List Notifications](https://jane.app/guide/setting-up-your-wait-list-notifications)
- [Automatic Wait List Notifications](https://jane.app/guide/wait-list-management/using-automatic-wait-list-notifications)
- [Jane Pricing](https://jane.app/pricing)

### Zenoti
- [Automated Waitlist Management](https://www.zenoti.com/platform/waitlist-management/)
- [Zenoti Help: Automatic Waitlist](https://help.zenoti.com/en/zenoti-driven-growth/utilization/automatic-waitlist-management.html)
- [Set Time to Stop Waitlist Notifications](https://help.zenoti.com/en/configuration/appointments-configurations/personalization/toolbar/set-time-to-stop-waitlist-notifications.html)
- [Capterra Reviews](https://www.capterra.com/p/131057/ZENOTI/reviews/)

### Square Appointments
- [Waitlist Setup and Management](https://squareup.com/help/us/en/article/7923-waitlist-with-square-appointments)
- [Square Community: Waitlist Issues](https://community.squareup.com/t5/Square-Appointments/Square-Appointments-Waitlist-issues/td-p/746117)
- [Appointments Pricing](https://squareup.com/us/en/appointments/pricing)

### Vagaro
- [Managing Customers on Waitlist](https://support.vagaro.com/hc/en-us/articles/24205102514971-Managing-Customers-on-the-Waitlist)
- [Set Up Waitlist Feature](https://support.vagaro.com/hc/en-us/articles/360010609213-Create-a-Waitlist-Web-version)
- [Vagaro Pricing](https://www.vagaro.com/pro/pricing)
- [Trustpilot Reviews](https://www.trustpilot.com/review/vagaro.com)

### Technical References
- [Concurrency in Booking Systems - Medium](https://medium.com/@abhishekranjandev/concurrency-conundrum-in-booking-systems-2e53dc717e8c)
- [Race Conditions in Booking Systems - HackerNoon](https://hackernoon.com/how-to-solve-race-conditions-in-a-booking-system)
- [Double Booking Problem in Databases](https://adamdjellouli.com/articles/databases_notes/07_concurrency_control/04_double_booking_problem)
