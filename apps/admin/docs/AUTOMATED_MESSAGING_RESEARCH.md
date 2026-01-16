# Automated Messaging System - Research & Feature Specification

**Created:** January 8, 2026
**Status:** RESEARCH COMPLETE
**Purpose:** Comprehensive feature specification for building an automated messaging system that matches and EXCEEDS Mangomint's capabilities.

---

## Executive Summary

After deploying 12 research agents to analyze competitors, user reviews, compliance requirements, and advanced features, we've identified the complete feature set needed to build the industry's most sophisticated automated messaging system for medical spas.

**Key Findings:**
- Mangomint leads in automation (12+ trigger types) but lacks AI intelligence
- NO platform offers real-time AI conversation assistance
- Internal staff notifications are a CRITICAL gap across all platforms
- Compliance automation is primitive - major opportunity
- Multi-location/international support is weak across all competitors
- Two-way confirmation REQUESTS (not just reminders) reduce no-shows 50-60%

---

## Part 1: Current State Analysis

### What We Currently Have

| Settings Area | Location | Features |
|--------------|----------|----------|
| SMS Settings | `/settings/sms` | Twilio number, business hours, after-hours auto-reply, compliance (10DLC), staff permissions |
| SMS Templates | `/settings/sms/templates` | Appointment confirmation, 24hr reminder, 2hr reminder, post-care, review request |
| Prep Reminders | `/settings/prep-reminders` | Treatment-specific pre-visit instructions (UNIQUE STRENGTH) |
| Quick Replies | `/settings/quick-replies` | Canned responses for manual messaging |
| Waitlist Settings | `/settings/waitlist` | Basic waitlist configuration |
| Messages Page | `/messages` | Two-way patient SMS messaging with AI suggestions |

### Key Gap: NO Unified "Automated Messages" Hub

Settings are scattered across multiple pages with no central control for automation workflows.

---

## Part 2: Mangomint Feature Analysis (from webinar transcript)

### Their Structure: Settings > Automated Messages

Single unified hub with **timeline view** showing message flow from booking to post-visit.

### Event Tabs

#### 1. Appointment Booked
- Immediate email + text confirmation
- Status: "Unconfirmed" or "Confirmed" option
- Form request attachments
- Internal staff notifications (online + staff-made bookings)
- Timeline reminders (1, 2, 3, 5, 7+ days configurable)
- Confirmation REQUEST (client replies to confirm)
- Same-day reminders
- Per-message toggles (online vs staff bookings)
- Test send + preview functionality

#### 2. Appointment Canceled
- Immediate email + text confirmation

#### 3. Form Submitted
- Internal notification to specific email

#### 4. Waitlist Entries
- Email/text when added
- Internal notification when opening available

#### 5. Check-In Process
- 15-min pre-arrival with self check-in link
- Custom instructions (parking, directions)
- Staff notifications when client waiting
- Provider ready notifications
- Service check-in confirmation

#### 6. Sale Closed
- Thank you email with receipt link

#### 7. Gift Cards
- Receipt to buyer
- Card details to recipient

#### 8. Memberships
- Started, pre-renewal, renewed, canceled emails

---

## Part 3: Research Findings Summary

### Competitor Pain Points (from Reddit & Reviews)

**Mangomint Complaints:**
- Two-way texting costs extra $75/month
- Credits system is confusing
- No AI capabilities (unlike Zenoti's Zeenie)
- No quick replies/canned responses
- No template versioning or A/B testing

**Boulevard Complaints:**
- Most expensive ($175-200+ base)
- Per-message charges (hidden fees)
- 12-month contract required

**Vagaro Complaints:**
- Basic two-way texting
- Toll-free numbers (lower engagement than local)
- 1000 emails/month limit

**Zenoti Complaints:**
- No pricing transparency
- Complex UI, steep learning curve
- Expensive for small businesses

### What Users WANT That NO Platform Provides

1. **Real-time AI conversation assistance** (during live chats, not just campaigns)
2. **Proactive compliance engine** (PHI detection, opt-out variants, cross-channel)
3. **Advanced template management** (versioning, A/B testing, analytics)
4. **Predictive automation** (behavioral learning, churn prediction)
5. **True omnichannel threading** (SMS + Email + In-app unified)
6. **Interactive messaging** (buttons, payments, scheduling in-message)
7. **Internal staff notifications** (critical gap in all platforms)
8. **Client sentiment dashboard** (no platform tracks emotional tone)

---

## Part 4: Compliance Requirements (HIPAA/TCPA)

### Critical Compliance Features Needed

**TCPA 2025 Rules (Effective April 11, 2025):**
- 10-day opt-out processing (down from 30)
- Must accept misspellings: SOTP, STPO, STP
- Must accept non-English: PARA, ALTO, BASTA
- One clarification message allowed within 5 minutes

**TCPA 2026 Rules (Coming April 2026):**
- Cross-channel opt-outs (email STOP = SMS STOP)
- Must sync across ALL platforms simultaneously

**Current Platform Status:**
- Standard keyword detection (11 keywords)
- Informal pattern detection (60+ patterns)
- MISSING: Misspelling recognition
- MISSING: Non-English opt-out detection
- MISSING: Cross-channel enforcement
- MISSING: Consent enforcement before sending
- MISSING: PHI detection in outbound messages

**Compliance Grade: C+ (68%)**

---

## Part 5: AI-Powered Messaging Features

### What's Cutting Edge (2026)

**No-Show Prevention AI:**
- Multi-factor risk scoring (history, day/time, weather, engagement)
- Dynamic intervention strategies (extra confirmation for high-risk)
- Behavioral learning (adapts cadence per patient)
- **Research shows:** Two-way confirmation reduces no-shows 50-60% vs one-way reminders

**Smart Send Time Optimization:**
- Per-patient timing models
- Lifecycle-based timing (pre vs post-treatment)
- Urgency-aware delivery
- Multi-channel failover (SMS → email if no response)

**Conversational AI:**
- Natural language booking
- Multi-intent handling ("reschedule AND add facial")
- Graceful human escalation
- Voice-to-text transcription

**Photo Analysis (Med Spa Specific):**
- Post-treatment photo concern detection
- Before/after comparison
- Skin analysis for product recommendations

---

## Part 6: Two-Way Messaging Advanced Features

### Best-in-Class Features

**Conversation Management:**
- Status: Open, Snoozed, Closed
- Starring/flagging for priority
- Tags & labels (custom, color-coded)
- Search & filtering (sentiment, urgency, staff)
- Keyboard shortcuts

**Intelligent Routing:**
- Auto-assign based on patient's provider
- Skill-based routing (medical → nurse, billing → front desk)
- Workload balancing
- SLA tracking (response time goals)

**Escalation Workflows:**
- Sentiment-based triggers
- Emergency keyword detection
- VIP priority routing
- Tiered alerts (in-app → SMS → phone call)

**Internal Notes:**
- @mentions with notifications
- Reply threads
- Note templates
- Search within notes

**Analytics:**
- Response time metrics
- Staff performance comparison
- Template effectiveness
- Revenue attribution

---

## Part 7: Multi-Location Requirements

### What Enterprise Med Spa Chains Need

**Timezone Intelligence:**
- Auto-adjust send times per location
- Business hours enforcement
- DST handling
- Holiday calendar awareness

**Multi-Language Support:**
- Patient language preference
- Template translations (human + AI)
- Real-time translation during conversations
- Locale-specific formatting (date, currency, phone)

**Brand Consistency:**
- Corporate template library
- Brand compliance checking (AI-powered)
- Approval workflows
- Deviation scoring

**Cross-Location Features:**
- Unified patient identity
- Deduplication (don't send same promo from 3 locations)
- Patient transfer workflows
- Network-wide opt-out enforcement

**Enterprise Analytics:**
- Aggregate reporting across locations
- Location performance comparison
- Best practice identification

---

## Part 8: Final Feature Specification

### New Settings Structure

```
/settings/automated-messages/
├── overview/                    # Dashboard showing all automation status
│
├── APPOINTMENT LIFECYCLE
│   ├── appointment-booked/      # Confirmations & reminders
│   ├── appointment-confirmed/   # When patient confirms
│   ├── appointment-rescheduled/ # Reschedule confirmations
│   ├── appointment-canceled/    # Cancellation confirmations
│   └── no-show-followup/        # Post no-show outreach
│
├── PATIENT JOURNEY
│   ├── form-submitted/          # Form completion notifications (internal)
│   ├── waitlist/                # Waitlist automation
│   ├── check-in/                # Check-in process messages
│   ├── checkout/                # Sale closed / thank you
│   └── post-care/               # Post-treatment follow-ups
│
├── FINANCIAL
│   ├── gift-cards/              # Gift card emails
│   ├── memberships/             # Membership lifecycle
│   ├── packages/                # Package purchase/usage
│   ├── payment-failed/          # Failed payment alerts
│   └── balance-reminder/        # Credit/package balance alerts
│
├── ENGAGEMENT
│   ├── reviews/                 # Review request automation
│   ├── birthdays/               # Birthday messages
│   ├── loyalty/                 # Loyalty program notifications
│   ├── reactivation/            # Win-back campaigns
│   ├── treatment-reminders/     # "Time for your next Botox"
│   └── referrals/               # Referral notifications
│
├── COMPLIANCE
│   ├── consent-expiration/      # Forms expiring soon
│   ├── photo-consent/           # Before/after photo permissions
│   └── audit-log/               # Message audit trail
│
└── advanced/
    ├── quiet-hours/             # Global quiet hours
    ├── send-time-optimization/  # AI send time settings
    ├── multi-language/          # Language preferences
    ├── staff-notifications/     # Internal notification rules
    └── integrations/            # Webhook/API settings
```

### Per-Event Configuration Options

Each event trigger should have:

```typescript
interface AutomatedMessageConfig {
  // Basic settings
  enabled: boolean;
  channels: ('sms' | 'email' | 'push')[];

  // Timing
  timing: {
    type: 'immediate' | 'delayed' | 'scheduled';
    delay?: { value: number; unit: 'minutes' | 'hours' | 'days' };
    scheduledTime?: string; // "09:00"
  };

  // Triggers
  triggers: {
    onlineBookings: boolean;
    staffBookings: boolean;
    specificServices?: string[];
    specificProviders?: string[];
    patientTags?: string[];
  };

  // Content
  template: {
    subject?: string;
    body: string;
    variables: string[];
    translations: Record<string, string>;
  };

  // Staff notifications
  internalNotifications: {
    enabled: boolean;
    recipients: string[]; // Email addresses
    notifyOnFail: boolean;
  };

  // Confirmation request (for reminders)
  confirmationRequest?: {
    enabled: boolean;
    setStatusUnconfirmed: boolean;
    followUpIfNoResponse: boolean;
    followUpDelay: number; // hours
  };

  // Testing
  testMode: {
    sendTestTo: string;
    previewEnabled: boolean;
  };
}
```

---

## Part 9: Priority Implementation Roadmap

### P0 - Core Foundation (Weeks 1-4)

1. **Unified Automated Messages Hub**
   - Create `/settings/automated-messages` route
   - Event-based tab navigation
   - Timeline view for reminders

2. **Appointment Booked Automation**
   - Immediate confirmation (email + SMS)
   - Timeline reminder configurator (1d, 2d, 3d, 7d before)
   - Confirmation REQUEST (reply C/R)
   - Online vs staff booking toggles

3. **Appointment Canceled Automation**
   - Cancellation confirmation
   - Internal staff notification

4. **Internal Staff Notifications**
   - Email notifications for key events
   - Configurable recipient lists
   - Event-based triggers

5. **Check-In Process Automation**
   - 15-minute pre-arrival message
   - Self check-in link generation
   - Custom instructions field
   - Provider notification when waiting

### P1 - Competitive Parity (Weeks 5-8)

6. **Form Submitted Notifications**
   - Internal notification when completed
   - Link to view form in notification

7. **Waitlist Automation**
   - Added to waitlist confirmation
   - Opening available notification
   - Auto-offer workflow

8. **Membership Lifecycle**
   - Membership started
   - Pre-renewal reminder (10d before)
   - Renewal success
   - Canceled confirmation

9. **Sale Closed / Checkout**
   - Thank you email with receipt
   - Custom thank you message

10. **Gift Card Automation**
    - Receipt to buyer
    - Card details to recipient

11. **Test Send Functionality**
    - Preview with sample data
    - Send test to specific email/phone

### P2 - Differentiation (Weeks 9-12)

12. **48-Hour Confirmation Request System**
    - Set appointment status: Unconfirmed
    - Track confirmation responses
    - Flag non-responders as high-risk
    - Auto-escalation workflow

13. **No-Show Risk Scoring**
    - Multi-factor risk calculation
    - High-risk intervention triggers
    - Staff alerts for at-risk appointments

14. **Post-Care Automation**
    - 24hr, 3-day, 1-week, 2-week check-ins
    - Treatment-specific sequences
    - Photo request at optimal time

15. **Review Request Automation**
    - Timed after appointment (24-48hrs)
    - Happy patient → review request
    - Unhappy patient → recovery flow

16. **Birthday Automation**
    - Birthday wishes + special offer
    - Configurable offer amount

### P3 - Advanced Features (Weeks 13-16)

17. **AI Send Time Optimization**
    - Learn per-patient response patterns
    - Automatic timing adjustment
    - A/B testing for optimal times

18. **Treatment Series Reminders**
    - "Time for your next Botox" (based on avg interval)
    - Predictive rebooking suggestions

19. **Reactivation Campaigns**
    - Haven't visited in X days trigger
    - Tiered re-engagement sequence

20. **Multi-Language Support**
    - Patient language preference
    - Template translations
    - Auto-detect language from incoming

21. **Enhanced Compliance Engine**
    - Misspelling opt-out detection
    - Non-English opt-out detection
    - PHI scanning before send
    - Cross-channel opt-out sync (2026 ready)
    - Consent enforcement layer

22. **Loyalty Program Integration**
    - Points earned notifications
    - Reward available alerts
    - Tier upgrade celebrations

---

## Part 10: Success Metrics

### No-Show Reduction
- Target: 50-60% reduction with confirmation requests
- Current industry average: 15-30% no-show rate
- Goal: < 8% no-show rate

### Staff Efficiency
- Target: 70% reduction in manual reminder calls
- Target: 90% of forms completed before arrival
- Target: 50% of check-ins via self-service

### Patient Engagement
- Target: 80%+ confirmation request response rate
- Target: 40%+ review request conversion
- Target: 25%+ reactivation campaign success

### Compliance
- Target: 100% opt-out processing within 10 days
- Target: 0 TCPA/HIPAA violations
- Target: 100% consent verification before marketing

---

## Appendix A: Competitive Advantage Summary

| Feature | Mangomint | Boulevard | Zenoti | Vagaro | OUR TARGET |
|---------|-----------|-----------|--------|--------|------------|
| Unified Automation Hub | Yes | Basic | Yes | No | **Yes + Timeline View** |
| Internal Staff Notifications | Yes | No | Basic | No | **Yes + Routing** |
| AI Conversation Assistance | No | No | Zeenie (campaigns) | No | **Real-time in chat** |
| Confirmation Requests | Yes | No | Basic | No | **Yes + Risk Scoring** |
| No-Show Risk AI | No | No | No | No | **Multi-factor ML** |
| Template A/B Testing | No | No | No | No | **Yes + Analytics** |
| Multi-Language | No | No | Zeenie | No | **Full + Real-time** |
| Multi-Location | Basic | Basic | Enterprise | Basic | **Enterprise + Dedup** |
| Compliance Automation | Basic | Basic | Basic | Basic | **Proactive + 2026 Ready** |
| Two-Way Messaging | +$75/mo | Contact Center | Basic | Basic | **Included + AI** |

---

## Appendix B: Key Research Sources

- Mangomint Webinar Transcript (provided by user)
- Existing competitive analysis: `/docs/MESSAGING_COMPETITIVE_ANALYSIS_2025.md`
- Existing battle cards: `/docs/MESSAGING_BATTLE_CARDS.md`
- HIPAA/TCPA research: `/docs/FCM_HIPAA_BEST_PRACTICES_2025.md`
- Current AI engine: `/src/services/messaging/ai-engine.ts`
- Current reminders service: `/src/services/messaging/reminders.ts`
- Multi-location research: `/MULTI_LOCATION_MESSAGING_REQUIREMENTS.md`

---

## Appendix C: Quick Reference - What to Build

### MUST HAVE (Match Mangomint)
- Unified settings hub with 8 event tabs
- Timeline reminder configurator
- Internal staff notifications
- Form submission notifications
- Waitlist automation
- Check-in process automation
- Membership lifecycle
- Gift card emails
- Test send + preview

### DIFFERENTIATORS (Beat Mangomint)
- Real-time AI conversation assistance
- 48-hour confirmation REQUEST with risk scoring
- Proactive compliance (PHI detection, opt-out variants)
- Template A/B testing with analytics
- Multi-language with real-time translation
- No-show prediction + intervention
- Smart send time optimization
- Cross-location deduplication
- Unlimited messaging (no $75/mo add-on)

---

*Research complete. Ready for implementation planning.*
