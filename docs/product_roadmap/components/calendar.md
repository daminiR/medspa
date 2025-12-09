# Calendar & Appointments - Product Roadmap

**Owner**: Product Team
**Last Updated**: 2025-10-17
**Status**: Planning

---

## Current State

### What We Have ✅
- Basic appointment scheduling
- Calendar views (day/week/month)
- Time slot management
- Practitioner column view
- Appointment CRUD operations
- Basic recurring appointments

### What We're Missing ❌
- Express Booking™ (Mango Mint)
- Virtual Waiting Room (Mango Mint)
- Resource Management for lasers/rooms (Mango Mint)
- Processing/Finishing/Buffer Times (Mango Mint)
- Intelligent Waitlist (Mango Mint)
- Group Booking (Mango Mint)
- Client Self Check-in/Checkout (Mango Mint)

### Feature Parity
- **Mango Mint**: 33%
- **Overall**: 33%

---

## Priority Features

### P0 - Critical (Ship Q4 2025)

| Feature | Source | Effort | Value | Status |
|---------|--------|--------|-------|--------|
| Virtual Waiting Room | Mango Mint | 1-2 weeks | High | ⬜ Not Started |
| Resource Management | Mango Mint | 1-2 months | Critical | ⬜ Not Started |
| Processing/Buffer Times | Mango Mint | 2-4 weeks | High | ⬜ Not Started |

### P1 - High Priority (Ship Q1 2026)

| Feature | Source | Effort | Value | Status |
|---------|--------|--------|--------|--------|
| Express Booking™ | Mango Mint | 2-4 weeks | High | ⬜ Not Started |
| Intelligent Waitlist | Mango Mint | 1-2 months | High | ⬜ Not Started |
| Client Self Check-in | Mango Mint | 1-2 weeks | Medium | ⬜ Not Started |

### P2 - Medium Priority (Ship Q2 2026)

| Feature | Source | Effort | Value | Status |
|---------|--------|--------|--------|--------|
| Group Booking | Mango Mint | 2-4 weeks | Low | ⬜ Not Started |
| Advanced Recurring | Mango Mint | 2 weeks | Medium | ⬜ Not Started |

---

## Timeline

### Q4 2025 (Oct-Dec)
- [x] Gap analysis complete
- [ ] Virtual Waiting Room - **Ship by Nov 15**
- [ ] Resource Management design - **Complete by Nov 30**
- [ ] Resource Management implementation - **Ship by Dec 31**
- [ ] Processing Times MVP - **Ship by Dec 15**

### Q1 2026 (Jan-Mar)
- [ ] Express Booking™ - **Ship by Feb 15**
- [ ] Intelligent Waitlist design - **Complete by Feb 1**
- [ ] Intelligent Waitlist - **Ship by Mar 31**
- [ ] Client Self Check-in - **Ship by Jan 31**

### Q2 2026 (Apr-Jun)
- [ ] Group Booking - **Ship by May 31**
- [ ] Advanced features polish

---

## Detailed Feature Specs

### Feature 1: Virtual Waiting Room

**Competitor Inspiration**: Mango Mint

**User Story**: As a patient, I want to check in from my car via SMS so that I can wait safely until my treatment room is ready.

**Requirements**:
1. SMS-based check-in system
2. Digital waiting room status dashboard for staff
3. Automatic SMS when room ready
4. Integration with appointment system
5. Queue management (FIFO with priority options)
6. Patient arrival tracking

**Technical Approach**:
- Twilio SMS integration
- Real-time status updates (WebSocket or polling)
- Queue management system in database
- Staff dashboard component

**Success Metrics**:
- 80% of patients use virtual waiting room
- Average wait time visible to patients
- Front desk time saved: 30 min/day

**Effort Estimate**: 1-2 weeks

**Status**: ⬜ Not Started

---

### Feature 2: Resource Management (Laser/Room Booking)

**Competitor Inspiration**: Mango Mint

**User Story**: As a scheduler, I want to see which laser rooms and equipment are available so that I never double-book limited resources.

**Requirements**:
1. Resource catalog (rooms, laser machines, equipment)
2. Resource-to-appointment linking
3. Conflict detection and prevention
4. Resource availability calendar view
5. Resource requirements per service type
6. Multi-resource booking support

**Technical Approach**:
- Resources table with availability tracking
- Appointment-Resource junction table
- Conflict detection algorithm
- Calendar UI overlay showing resource conflicts
- Service-Resource mapping

**Success Metrics**:
- Zero resource conflicts
- Resource utilization > 75%
- Scheduling time reduced by 40%

**Effort Estimate**: 1-2 months

**Status**: ⬜ Not Started

---

### Feature 3: Processing/Finishing/Buffer Times

**Competitor Inspiration**: Mango Mint - Perfect for injectables workflow

**User Story**: As a practitioner, I want to optimize my schedule during patient numbing time so that I can see more patients per day.

**Requirements**:
1. Service timing breakdown:
   - Processing time (numbing cream application)
   - Service time (actual injection/treatment)
   - Finishing time (recovery/observation)
   - Buffer time (room turnover)
2. Calendar shows different time phases
3. Practitioner can see other patients during processing
4. Automatic alerts when patient ready
5. Resource availability during different phases

**Technical Approach**:
- Service timing configuration
- Enhanced appointment model with phase tracking
- Calendar rendering with time blocks
- Staff scheduling optimization
- SMS/notification system for phase transitions

**Success Metrics**:
- Practitioners see 20% more patients/day
- Reduced idle time by 30%
- Better resource utilization

**Effort Estimate**: 2-4 weeks

**Status**: ⬜ Not Started

**Example Workflow**:
```
10:00 AM - Patient A arrives (Botox)
10:05 AM - Numbing cream applied (Processing: 20 min)
  └─> Practitioner can see Patient B during this time
10:25 AM - Inject Patient A (Service: 15 min)
10:40 AM - Patient A recovery (Finishing: 10 min)
  └─> Practitioner can start Patient C
10:50 AM - Patient A checkout (Buffer: 5 min)
```

---

### Feature 4: Express Booking™

**Competitor Inspiration**: Mango Mint

**User Story**: As a front desk, I want to send a quick booking link via SMS so patients can self-book without phone calls.

**Requirements**:
1. Generate unique booking link per service
2. SMS delivery with Twilio
3. Mobile-optimized booking page
4. Payment/deposit collection
5. Automatic appointment confirmation
6. Link expiration (24-48 hours)
7. Pre-filled patient information

**Technical Approach**:
- Booking token generation system
- Mobile booking flow (Next.js pages)
- Stripe payment integration
- SMS sending with Twilio
- Appointment auto-creation

**Success Metrics**:
- 60% of bookings via Express Booking
- No-show rate reduced by 25%
- Front desk time saved: 2 hours/day

**Effort Estimate**: 2-4 weeks

**Status**: ⬜ Not Started

---

### Feature 5: Intelligent Waitlist

**Competitor Inspiration**: Mango Mint

**User Story**: As a scheduler, I want the system to automatically match waitlist clients to cancellations so I maximize appointment utilization.

**Requirements**:
1. Waitlist management (add/remove/prioritize)
2. Automatic matching algorithm:
   - Service type match
   - Time preference match
   - Practitioner preference
   - Distance from clinic
3. Automated SMS notifications to matched clients
4. First-to-respond gets slot
5. Waitlist analytics

**Technical Approach**:
- Waitlist table with preferences
- Matching algorithm service
- Real-time notification system
- Booking race condition handling
- Analytics dashboard

**Success Metrics**:
- 80% of cancellations filled from waitlist
- Revenue recovery: $10k+/month
- Patient satisfaction increase

**Effort Estimate**: 1-2 months

**Status**: ⬜ Not Started

---

### Feature 6: Client Self Check-in/Checkout

**Competitor Inspiration**: Mango Mint

**User Story**: As a patient, I want to check in and pay via my phone so I minimize contact and waiting.

**Requirements**:
1. SMS check-in link on appointment day
2. One-tap check-in confirmation
3. Forms/waivers via mobile
4. Mobile payment checkout
5. Digital receipt
6. Integration with waiting room

**Technical Approach**:
- SMS trigger on appointment day
- Mobile-optimized check-in page
- Stripe mobile payment
- Digital signature for forms
- Real-time status updates

**Success Metrics**:
- 70% of patients use self-service
- Front desk calls reduced by 50%
- Check-in time < 30 seconds

**Effort Estimate**: 1-2 weeks

**Status**: ⬜ Not Started

---

## Competitor Insights

### Mango Mint Calendar Features

**Core Strengths**:
- Resource management prevents conflicts
- Processing times maximize practitioner efficiency
- Express Booking reduces no-shows
- Intelligent waitlist recovers revenue
- Contactless operations (waiting room + self check-in)

**How They Do It**:
- Heavy SMS automation (Twilio-like)
- Real-time calendar updates
- Complex scheduling algorithm
- Mobile-first design for client features
- Integrated payment throughout

**What We Can Learn**:
- Build for mobile first (patient-facing)
- Automate everything with SMS
- Focus on resource optimization (their biggest value prop)
- Payment collection at every touchpoint

---

## Tech Debt

| Item | Impact | Effort | Priority |
|------|--------|--------|----------|
| Calendar re-render optimization | Medium | 1 week | P1 |
| Appointment model refactor | High | 2 weeks | P0 |
| WebSocket for real-time updates | Medium | 1 week | P1 |

---

## Questions & Decisions

| Date | Question | Decision | Rationale |
|------|----------|----------|-----------|
| 2025-10-17 | Build Virtual Waiting Room before Express Booking? | Yes | Faster to build, post-COVID necessity |
| 2025-10-17 | Use Twilio for all SMS? | Yes | Reliable, scales well |
| 2025-10-17 | Resource management before processing times? | Yes | Prevents conflicts, more critical |

---

## Dependencies

- **Twilio Integration**: Required for Virtual Waiting Room, Express Booking, Waitlist
- **Payment Processing**: Required for Express Booking, Self Check-in
- **Real-time Updates**: Required for Waiting Room, Waitlist
- **Mobile UI Components**: Required for all patient-facing features

---

## Links

- [Gap Analysis Report](../../competitor_analysis/reports/GAP_ANALYSIS_REPORT.md)
- [Mango Mint Calendar Features](../../competitor_analysis/consolidated_categories/02-calendar-and-appointments.md)
- [Master Roadmap](../master_roadmap.md)
