# Waitlist Management: Quick Reference Competitive Matrix

## At-a-Glance Comparison

### Automation Level
```
Fully Automated     [===Jane===][===Zenoti===]
Semi-Automated      [===Mangomint===]        [Square]        [Vagaro]
Manual Only         [===Boulevard===]
```

### Matching Algorithm
```
FIFO Only           [===Zenoti===]
Preference-Based    [===Jane===][===Mangomint===]
Basic Matching      [Square][Vagaro]
No Matching         [===Boulevard===]
```

### Race Condition Handling
```
Sequential (Best)   [===Zenoti===] (one at a time, timeout cascade)
First-Click         [===Jane===] (all notified, race to book)
Timeout Lock        [===Mangomint===] (24hr express booking hold)
No Handling         [Boulevard][Square][Vagaro]
```

---

## Feature Matrix

| Feature | Mangomint | Boulevard | Jane | Zenoti | Square | Vagaro |
|---------|:---------:|:---------:|:----:|:------:|:------:|:------:|
| **Auto Slot Detection** | :white_check_mark: | :x: | :white_check_mark: | :white_check_mark: | :warning: | :white_check_mark: |
| **Auto Patient Notification** | :x: | :x: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :warning: |
| **Slot Holding/Locking** | :white_check_mark: 24hr | :x: | :white_check_mark: 3-5hr | :white_check_mark: Config | :x: | :x: |
| **Duration Matching** | :white_check_mark: | :x: | :warning: | :x: | :x: | :x: |
| **FIFO Support** | :x: | :x: | :x: | :white_check_mark: | :x: | :x: |
| **Preference Matching** | :white_check_mark: | :x: | :white_check_mark: | :x: | :warning: | :warning: |
| **VIP/Priority Tiers** | :x: | :x: | :x: | :x: | :x: | :x: |
| **Position Visibility** | :x: | :x: | :x: | :x: | :x: | :x: |
| **Group Booking Support** | :x: | :x: | :x: | :question: | :x: | :question: |
| **SMS Notifications** | :white_check_mark: | :x: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| **Email Notifications** | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| **Client Self-Add** | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: | :white_check_mark: |
| **Credit Card Required** | Optional | Required | :x: | :x: | :x: | :x: |
| **Deposit Integration** | :white_check_mark: | :white_check_mark: | :x: | :white_check_mark: | :x: | :x: |

**Legend:** :white_check_mark: = Yes | :x: = No | :warning: = Partial | :question: = Unknown

---

## Pricing Comparison

| Platform | Base Price | Waitlist Included | SMS Model |
|----------|------------|-------------------|-----------|
| **Mangomint** | $165/mo | All plans | Included (reminders) |
| **Boulevard** | $158/mo | All plans | Per segment ($) |
| **Jane App** | $79/mo | All plans | Included |
| **Zenoti** | Custom | All plans | Credit packs |
| **Square** | $29/mo | Plus+ only | Unknown |
| **Vagaro** | $30/mo | All plans | Add-on (+$10-20) |

---

## Critical Gaps by Platform

### Mangomint
- :warning: Staff notified, but NO automated patient notification
- :warning: No VIP tier support

### Boulevard
- :x: **Completely manual** - no automation at all
- :x: Must manually check waitlist periodically

### Jane App
- :x: No group/class booking waitlist
- :x: Clinic not alerted when client self-adds
- :warning: Tag matching required (can fail silently)

### Zenoti
- :warning: Complex setup (4-month onboarding)
- :warning: FIFO only - no preference matching
- :x: No duration filtering

### Square
- :x: **Service duration mismatch** (biggest complaint)
- :x: Over-notification/"spam" issues
- :x: Hard to bulk-manage entries

### Vagaro
- :x: Self-added customers may not receive notifications
- :x: Multiple date preferences create duplicate entries

---

## Our Competitive Opportunities

### Nobody Has These Features:

1. **VIP/Tiered Priority System**
   - Platinum/Gold/Silver tiers
   - Configurable priority multipliers
   - Integration with loyalty programs

2. **Real-Time Position + ETA**
   - "You are #3 on the waitlist"
   - "Estimated wait: 5-7 days"

3. **Hybrid FIFO + Preference Algorithm**
   - Configurable weights
   - Best of both worlds

4. **Smart Duration Matching**
   - Only notify clients whose service fits
   - Solve Square's #1 complaint

5. **Cancellation Prediction**
   - Pre-notify top candidates
   - "A slot may open tomorrow"

6. **Group Booking Waitlist**
   - Classes and group sessions
   - Partial availability notifications

---

## Implementation Priority

### Phase 1: Match Best-in-Class
- [ ] Auto slot detection (match Jane/Zenoti)
- [ ] Auto patient notifications (match Jane/Zenoti)
- [ ] Configurable hold period (match Jane)
- [ ] Preference-based matching (match Mangomint)

### Phase 2: Beat the Competition
- [ ] VIP tier system (UNIQUE)
- [ ] Smart duration matching (solve Square's pain)
- [ ] Real-time position display (UNIQUE)
- [ ] Group booking waitlist (UNIQUE)

### Phase 3: Market Leadership
- [ ] Cancellation prediction AI
- [ ] Deposit-protected priority boost
- [ ] Proactive waitlist building
- [ ] Advanced analytics dashboard

---

## Technical Quick Reference

### Race Condition Strategy
```
Recommended: Zenoti-style sequential notification with VIP priority
1. Sort eligible patients by priority score
2. Notify #1, start timeout (5-15 mins)
3. If no response, notify #2, repeat
4. First to confirm wins
5. Others notified slot is taken
```

### Slot Locking
```
Use distributed lock (Redis) with configurable TTL:
- Short notice (<24hr): 5-15 minute lock
- Standard: 1-4 hour lock
- Express booking: Up to 24 hour lock
```

### Notification Timing
```
Configurable cutoff time:
- Don't notify for slots < X minutes away
- Default: 30 minutes
- Prevents last-minute scrambles
```
