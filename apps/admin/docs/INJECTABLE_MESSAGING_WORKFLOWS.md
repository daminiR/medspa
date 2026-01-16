# Injectable Messaging Workflows for Medical Spas

**Research Date:** January 2026
**Purpose:** Document injectable-specific messaging workflows that differentiate medical spas from standard salon software
**Status:** ✅ Research Complete

---

## Executive Summary

Medical spa messaging systems require **specialized workflows** beyond standard salon appointment reminders due to:
1. **Medical compliance** (HIPAA, TCPA, state nursing board regulations)
2. **Clinical safety** (adverse event reporting, emergency protocols)
3. **Treatment-specific timing** (Botox wears off at 3-4 months, filler touch-ups)
4. **Provider oversight** (RN vs MD protocols, medical director supervision)
5. **Documentation requirements** (consent forms, before/after photos, lot tracking)

This research identifies **9 critical messaging workflows** unique to injectable treatments that standard salon software does not address.

---

## 1. Pre-Treatment Consultation Messaging

### Overview
Unlike salon services, injectables require **medical assessment** before treatment. Messaging must facilitate patient education, medical history collection, and practitioner evaluation.

### Key Requirements
- **Good Faith Exam Coordination**: RNs cannot treat without prior physician/NP/PA evaluation
- **Medical History Collection**: Allergies, medications, previous complications
- **Contraindication Screening**: Pregnancy, neuromuscular conditions, allergies
- **Expectation Management**: Results vary, "individual results not guaranteed" disclaimers

### Workflow Timeline

| Stage | Timing | Message Type | Content Example |
|-------|--------|--------------|-----------------|
| Initial Inquiry | Within 1 hour | Educational | "Hi Sarah! Thanks for your Botox inquiry. Before booking, we'll need a brief consultation ($50, applied to treatment). Our RN will review your medical history and Dr. Kim will approve your treatment plan. Book here: [link]" |
| Consultation Booked | Immediate | Confirmation | "Your consultation is confirmed for Tue, Jan 15 at 2pm. Please complete your medical history form before arrival: [link]. Bring your ID and list of current medications." |
| Pre-Consult (72hrs) | 3 days before | Form Reminder | "Reminder: Please complete your medical history form before your consultation on Tuesday. It takes 5 minutes: [link]. Questions? Reply here!" |
| Pre-Consult (24hrs) | 1 day before | Prep Instructions | "Tomorrow at 2pm: Arrive makeup-free. If you're on blood thinners (aspirin, Coumadin), let us know. We'll take photos and discuss your goals with Dr. Kim." |
| Post-Consult | Same day | Treatment Booking | "Great meeting you today! Dr. Kim has approved Botox for your forehead & glabellar lines. Ready to book? We have availability this Thursday: [link]" |

### Medical Spa vs Salon Software

**Standard Salon Software:**
- "Your haircut appointment is confirmed"
- Single-step booking with instant confirmation
- No medical assessment workflow

**Medical Spa Requirement:**
- Two-step process: consultation → treatment approval → booking
- Medical director oversight documentation
- State-specific compliance (e.g., California requires physician on-site for RN injections)

### Implementation Notes
- Track consultation → treatment conversion rates (55-75% typical)
- Flag patients who skip consultation (compliance risk)
- Auto-send provider notification: "New Botox consultation booked - review medical history before arrival"

---

## 2. Post-Treatment Check-Ins (Complication Monitoring)

### Overview
Injectable treatments carry **medical risks** (bruising, swelling, vascular occlusion, allergic reactions) requiring proactive follow-up beyond "how did you like your service?"

### Critical Complications to Monitor

| Complication | Onset Time | Severity | Response Time Required |
|--------------|------------|----------|------------------------|
| Vascular Occlusion | 0-24 hours | EMERGENCY | 60-90 minutes (vision loss risk) |
| Severe Swelling/Bruising | 0-48 hours | High | 4-8 hours |
| Allergic Reaction | 0-72 hours | High | Immediate (EpiPen) |
| Asymmetry/Migration | 3-7 days | Medium | 1-2 days |
| Infection | 3-10 days | High | 12-24 hours |
| Lumps/Nodules | 1-4 weeks | Medium | 2-7 days |
| Tyndall Effect (filler) | Weeks | Low | Routine follow-up |

### Workflow Timeline

| Timing | Purpose | Message Type | Response Protocol |
|--------|---------|--------------|-------------------|
| **Immediate (2hrs post)** | Aftercare instructions | Automated SMS | "Hi Sarah! Post-Botox care: No lying down for 4hrs, avoid touching treated areas, no exercise today. Ice if needed. Normal: slight redness/bumps. NOT normal: vision changes, severe pain, extreme swelling. Emergency? Call: (555) 0100" |
| **24 hours** | Early complication check | Check-in + Response | "How are you feeling after your Botox treatment? Any concerns about bruising, swelling, or pain? Reply with: 1=All good, 2=Minor concerns, 3=Need to talk" |
| **48 hours** | Swelling/bruising peak | Educational | "Day 2 check-in: Bruising/swelling peaks now and improves over 7-10 days. Try Arnica cream. Avoid alcohol, NSAIDs, salty foods. Questions? Reply anytime!" |
| **3 days** | Side effect window | Active monitoring | "Day 3! How's everything? Any headaches, drooping, or numbness? These can happen but are temporary. Reply if anything feels off!" |
| **7 days** | Initial results visible | Satisfaction check | "One week update! Botox takes 3-14 days to fully work. Seeing changes yet? Any areas need adjustment at your 2-week follow-up?" |
| **14 days** | Final assessment | Touch-up evaluation | "Your Botox should be fully settled now! Please come in for your complimentary follow-up this week. Dr. Kim will assess if any touch-ups are needed. Book here: [link]" |

### AI-Enhanced Complication Detection

Modern med spa software should use **NLP to detect complication keywords** in patient replies:

**High-Priority Keywords:**
- "vision" / "can't see" / "blurry" → IMMEDIATE escalation (vascular occlusion risk)
- "severe pain" / "unbearable" → 1-hour response
- "spreading" / "rash" / "hives" → Allergic reaction protocol
- "drooping" / "can't move" → Ptosis/nerve involvement

**Medium-Priority Keywords:**
- "bruise" / "swelling" / "lump" → Standard management advice
- "headache" / "tired" → Common side effects, reassure
- "asymmetric" / "uneven" → Schedule in-person assessment

**Auto-Response + Staff Alert Example:**
```
Patient: "My eye is blurry and I have sharp pain in my forehead"
System Actions:
1. Immediate SMS: "This is urgent. Please call us RIGHT NOW at (555) 0100. Do not wait."
2. Staff Alert: "🚨 URGENT: Sarah M. reports vision changes + severe pain 6hrs post-filler. VASCULAR OCCLUSION RISK. Call immediately."
3. If no response in 15min: Escalate to medical director cell phone
```

### Medical Spa vs Salon Software

**Standard Salon Software:**
- "How did you like your haircut? Rate us 1-5 stars!"
- Generic satisfaction survey
- No medical monitoring

**Medical Spa Requirement:**
- Symptom-specific questions ("Vision changes? Severe pain?")
- Clinical escalation protocols
- Medical director notification for red flags
- Documentation in patient EMR/chart

---

## 3. Touch-Up Scheduling Reminders

### Overview
Injectable results are **temporary** and require proactive retention messaging. Unlike permanent salon services, injectables follow predictable wear-off timelines requiring automated re-booking nudges.

### Treatment Duration Reference

| Treatment | Typical Duration | Touch-Up Window | Reminder Timing |
|-----------|------------------|-----------------|-----------------|
| Botox/Dysport/Xeomin | 3-4 months | 2.5-3.5 months | 10 weeks post-treatment |
| Juvederm (cheeks) | 12-18 months | 10-14 months | 9 months post-treatment |
| Juvederm (lips) | 6-9 months | 5-7 months | 5 months post-treatment |
| Restylane (under eye) | 9-12 months | 8-10 months | 7 months post-treatment |
| Sculptra | 2+ years | 18-24 months | 18 months post-treatment |
| Kybella (fat dissolving) | Permanent | N/A (series) | After 4-6 sessions complete |

### Proactive Re-Booking Workflow

#### **Phase 1: Early Touch-Up (2-3 Months Post-Botox)**

**Goal:** Prevent movement return, build loyalty

```
Week 10 Message:
"Hi Sarah! Your Botox is still looking great 🙂 Want to keep those smooth results?
Booking your next appointment now ensures you never lose them!
We have appointments available: [link]

P.S. Patients who book before results wear off need less product = lower cost!"
```

**Why This Works:**
- 88% retention rate for patients who pre-book next appointment
- Reduces no-shows (commitment device)
- Prevents competitive switching

#### **Phase 2: Wear-Off Detection (3-4 Months)**

**Goal:** Re-engage before movement returns

```
Month 3.5 Message:
"Noticing your Botox starting to wear off? It's been 14 weeks—right on schedule!
Let's get you back in before full movement returns. Reply BOOK to schedule 📅"
```

**Conversion Strategy:**
- Limited-time offer: "Book this week: Save $50 on your touch-up"
- Scarcity: "Only 3 slots left with Amanda this month"
- Social proof: "423 patients refreshed their Botox this month!"

#### **Phase 3: Lapsed Patient Reactivation (5-6 Months)**

**Goal:** Win-back before they switch providers

```
Month 5 Message:
"We miss you, Sarah! It's been 5 months since your last Botox treatment.
Ready to smooth those lines again?

WELCOME BACK OFFER: 20% off your next Botox session (expires in 7 days)
Book now: [link]"
```

**Win-Back Tactics:**
- Emphasize relationship: "We kept your before photos—let's see your progress!"
- Remove barriers: "Flexible scheduling—we added evening appointments!"
- Acknowledge gap: "No judgment if you tried somewhere else 😊 Come back home!"

### Touch-Up Conversion Metrics

**Industry Benchmarks:**
- Pre-book rate (same visit): 35-45%
- 3-month reminder conversion: 25-35%
- 6-month win-back conversion: 10-15%
- 12+ month reactivation: 3-5%

**Med Spa Software Should Track:**
- Days since last treatment (by product type)
- Pre-booking rates by provider
- Touch-up revenue per patient (lifetime value)
- Competitive loss rate (didn't return = likely switched providers)

### Medical Spa vs Salon Software

**Standard Salon Software:**
- "We haven't seen you in a while! Come back for a haircut"
- Generic re-booking campaigns
- No product-specific timing

**Medical Spa Requirement:**
- Treatment-specific reminders (Botox ≠ Filler timelines)
- Results-based language ("wear off" vs "time for another haircut")
- Medical accuracy (don't say "Botox lasts 6 months" when it's 3-4 months)

---

## 4. Complication Reporting via Text

### Overview
Medical spas need **secure, HIPAA-compliant** text-based complication reporting workflows that trigger clinical protocols and documentation.

### HIPAA-Compliant Texting Requirements

**Key Compliance Rules:**
✅ Use **encrypted, HIPAA-compliant platform** (Klara, OhMD, Curogram, TxtSquad)
✅ Obtain **patient consent** for SMS communication (transactional + PHI)
✅ Sign **Business Associate Agreement (BAA)** with SMS provider
✅ Enable **secure message deletion** and access controls
✅ Document all PHI communications in patient EMR

❌ Standard SMS (carrier servers store messages indefinitely)
❌ Personal cell phones without secure platform
❌ Group texts with patient info

**CMS 2024 Update:** Text messaging patient information is now permissible in hospitals if accomplished through a HIPAA-compliant Secure Texting Platform (STP).

### Complication Reporting Workflow

#### **Step 1: Patient-Initiated Report**

```
Patient Text (Day 3 Post-Filler):
"Hi, I have a hard lump on my cheek and it's tender. Is this normal?"
```

#### **Step 2: AI Triage + Staff Alert**

```
System Analysis:
- Keyword detected: "lump" + "tender" + "cheek"
- Treatment: Filler (48hrs ago)
- Risk Level: MEDIUM (possible nodule/granuloma)
- Action: Flag for RN review within 2 hours

Staff Alert (sent to Amanda RN):
"⚠️ Patient complication report: Sarah M. (ID: 12345)
Treatment: Juvederm Ultra (cheek) - 72hrs ago
Symptom: Hard lump, tender
Lot #: 2024-J-8745
Action Required: Call patient for photo + in-person assessment
Chart: [link]"
```

#### **Step 3: Clinical Response Protocol**

```
RN Response (within 1 hour):
"Hi Sarah! I'm Amanda, the RN who did your filler. Small lumps can happen—
let's figure this out together. Can you send me a photo? Also:
1. Is the area hot/red?
2. On a scale of 1-10, pain level?
3. Getting bigger or staying same?

I'm here until 7pm today. Worst case, we can dissolve it easily. You're in good hands 🙂"
```

#### **Step 4: Escalation to Medical Director (If Needed)**

```
If patient reports:
- Vision changes
- Severe/worsening pain
- Spreading redness (infection)
- Skin color changes (vascular issue)

Auto-notify Medical Director:
"Dr. Kim - URGENT complication alert: Sarah M. reports [symptoms]
Last seen: [date] by Amanda RN
Treatment: [product name/lot]
Patient phone: [number]
Please call ASAP"
```

#### **Step 5: Documentation + Follow-Up**

**EMR Chart Note Auto-Generated:**
```
Date: 1/12/2026 3:45pm
Chief Complaint: Patient-reported hard lump, tender, right cheek
Treatment Date: 1/9/2026 (Juvederm Ultra, 1.0mL, Lot #2024-J-8745)
Provider: Amanda Chen, RN (Supervised by Dr. James Kim, MD)
Assessment: Likely inflammatory nodule vs product aggregation
Plan:
- Patient sent photos via secure SMS
- Scheduled in-person evaluation 1/13/2026 10am
- Advised ice, arnica, massage technique
- Hyaluronidase available if needed
Follow-up: Phone call scheduled 1/13 morning
Reported to: Medical Director notified (non-urgent)
```

### Emergency Complication Protocol

**VASCULAR OCCLUSION (Medical Emergency):**

```
Patient: "My skin looks white and I have really bad pain in my nose"

AUTOMATED RESPONSE (within 60 seconds):
"🚨 THIS IS AN EMERGENCY.
Call us RIGHT NOW: (555) 0100
If we don't answer, GO TO ER IMMEDIATELY.
Do NOT wait. This is time-sensitive.

We are calling you now."

Staff Actions (Simultaneous):
1. Call patient's phone (3 attempts)
2. Alert medical director cell phone
3. Prepare hyaluronidase emergency kit
4. Document in chart with timestamp
5. If no contact in 15min → Call emergency contact on file
```

**Why This Matters:**
- 90-minute window for vision-threatening vascular occlusion
- Delays can cause permanent blindness or tissue necrosis
- Medical malpractice cases often cite "inadequate emergency response"

### Medical Spa vs Salon Software

**Standard Salon Software:**
- "Reply HELP for assistance"
- No clinical escalation
- No EMR integration

**Medical Spa Requirement:**
- Symptom-based triage with urgency levels
- Direct-to-provider routing (RN, MD, NP)
- Automatic chart documentation
- Product lot number tracking (FDA recall requirement)
- Emergency protocol triggers

---

## 5. Before/After Photo Collection via Text

### Overview
Before/after photos are **medical documentation** for aesthetic treatments, requiring consent, standardization, and HIPAA-compliant storage—not just marketing content.

### Photo Collection Workflow

#### **Phase 1: Pre-Treatment Consent**

```
Booking Confirmation Message:
"Your Botox appointment is confirmed for Thu, Jan 18 at 2pm.

Before your visit, please review our Photo Consent Form: [link]
- We take before/after photos for your medical record
- You control if photos are used for marketing
- All photos are HIPAA-secure and never shared without written permission

Questions? Reply here!"
```

**Consent Form Must Cover:**
- ✅ Medical record use (always required)
- ✅ Internal training/education use (opt-in)
- ✅ Social media/website use (separate opt-in)
- ✅ Unedited photos with disclaimers ("results may vary")
- ✅ Right to revoke consent at any time

**Legal Requirement:** HIPAA compliance demands written consent before using patient photos in marketing. Fines for violations: $100-$50,000 per incident.

#### **Phase 2: In-Office Photo Capture**

**Standardized Documentation:**
- Consistent lighting, angles, distance
- Same background (white/neutral)
- No makeup, hair tied back
- Multiple views (frontal, 45°, profile)
- Metadata: Date, provider, product/lot #, treatment areas

**Example Documentation:**
```
Patient: Sarah Martinez (ID: 12345)
Date: 1/18/2026
Provider: Amanda Chen, RN (supervised by Dr. Kim, MD)
Treatment: Botox Cosmetic (Lot #C3456A89)
Areas: Glabellar lines (20 units), forehead (12 units)
Photos: 5 captured (frontal relaxed, frontal animated, left/right profile)
Consent: Medical record ✅ | Marketing ❌
```

#### **Phase 3: Post-Treatment Photo Requests (2-Week Results)**

```
Day 14 Text:
"Hi Sarah! Your Botox results should be fully visible now 😊

Can you snap a quick selfie for your medical record?
1. No makeup, natural light
2. Neutral expression (don't smile or frown)
3. Reply with photo

This helps us track your progress and adjust future treatments.
Or, stop by anytime for professional photos—no appointment needed!"
```

**Why Patient-Submitted Photos Matter:**
- Track product efficacy over time
- Detect complications (asymmetry, ptosis)
- Adjust dosing for next treatment
- Document for insurance/litigation (if needed)

#### **Phase 4: Touch-Up Progress Tracking (3-Month Series)**

```
Treatment Series Example: Kybella (fat dissolving, requires 4-6 sessions)

After Session 1 (Week 4):
"Photo check-in! Your Kybella results develop over 4-6 weeks.
Can you send a front + side photo? We'll compare to your before pics 📸
Reply with photos or book your in-person progress check: [link]"

After Session 2 (Week 8):
"Wow! Comparing your photos—we're seeing 30% reduction already!
Send another update photo? You're halfway through the series 💪"

After Session 4 (Week 16):
"Final photos! Let's document your complete transformation.
Come in this week for professional photos + celebrate your results 🎉"
```

### HIPAA-Compliant Photo Storage

**Security Requirements:**
✅ Encrypted cloud storage (AWS S3, Google Cloud with encryption)
✅ Role-based access control (only authorized staff)
✅ Audit logs (who accessed photos, when)
✅ Patient portal access (patients can view their own photos)
✅ Retention policy (typically 7 years medical records)

**Photo Platforms for Med Spas:**
- TouchMD (aesthetic-specific, iPad photo capture)
- Aesthetic Record (photo overlays, side-by-side comparisons)
- Zenoti Photo Manager (grid/guidelines for alignment)
- Calysta EMR (integrated with patient charts)

### Marketing Use Workflow

**If patient opts in for marketing:**

```
Post-Treatment (6 weeks later):
"Sarah, your Botox results look AMAZING! 😍
Would you like to share your transformation on our Instagram?

We'll:
- Keep your name private (initials only: "S.M.")
- Add disclaimer: 'Individual results may vary'
- Pay you $50 credit toward your next treatment
- Let you approve the post before it goes live

Interested? Reply YES and we'll set it up!"
```

**Marketing Photo Checklist:**
- ✅ Signed marketing consent (separate from medical)
- ✅ Patient approval of final post
- ✅ Disclaimer text ("Results may vary")
- ✅ No blood/needles (Instagram/Facebook ban)
- ✅ Physician name disclosed (if required by state)

### Medical Spa vs Salon Software

**Standard Salon Software:**
- "Share your new haircut on Instagram and tag us!"
- No consent workflow
- Photos used freely for marketing

**Medical Spa Requirement:**
- Dual-purpose photos (medical record + optional marketing)
- HIPAA-compliant storage with encryption
- Standardized angles/lighting for clinical comparison
- FDA/FTC compliance (can't show blood, must include disclaimers)
- State medical board rules (TX, CA have strict advertising laws)

---

## 6. Consent Form Follow-Ups

### Overview
Injectable treatments require **informed consent documentation** beyond a generic waiver. Medical spas need workflows to ensure patients complete legally required forms before treatment.

### Required Consent Forms for Injectables

| Form Type | Purpose | When Completed | Validity Period |
|-----------|---------|----------------|-----------------|
| **Medical History** | Screen contraindications | Before first treatment | Update annually |
| **Informed Consent** | Treatment risks/benefits | Per treatment type | Per visit or annually |
| **HIPAA Privacy Notice** | Patient rights explanation | First visit | Update when policy changes |
| **Photo Consent** | Medical + marketing use | Before first photos | Ongoing (can revoke) |
| **Payment Authorization** | Credit card on file | Before treatment | Per transaction or standing |
| **Cancellation Policy** | No-show/late cancel fees | At booking | One-time |
| **State-Specific** | Varies (CA, TX, NY, FL) | Before treatment | Per state requirements |

### Consent Form Messaging Workflow

#### **Phase 1: Booking Confirmation (Immediate)**

```
Booking Confirmation:
"Your Botox consultation is confirmed for Wed, Jan 22 at 3pm with Dr. Kim.

Before your appointment, please complete these forms (10 min):
📋 Medical History: [link]
📋 Informed Consent: [link]
📋 Photo Authorization: [link]

Incomplete forms = rescheduled appointment (we can't treat without them!)
Questions? Reply here or call (555) 0100"
```

**Digital Signature Platforms:**
- DocuSign (legally binding e-signatures)
- TouchMD Consents (iPad at check-in)
- Jotform (HIPAA-compliant forms)
- Calysta EMR (built-in consent templates)

#### **Phase 2: 72-Hour Gentle Reminder**

```
3 Days Before Appointment:
"Hi Sarah! Your appointment is in 3 days (Wed at 3pm).

We still need you to complete:
✅ Medical History (done!)
❌ Informed Consent - [link]
❌ Photo Authorization - [link]

Takes 5 minutes. We can't proceed without them—please finish today!
Need help? Reply and I'll walk you through it 😊"
```

**Form Completion Tracking:**
- Show progress bar: "2 of 3 forms complete"
- Mobile-friendly forms (80% patients use phones)
- Save partial progress (patients can finish later)
- Auto-populate from previous visits

#### **Phase 3: 24-Hour Urgent Reminder**

```
1 Day Before Appointment:
"⚠️ URGENT: Your appointment is TOMORROW (Wed at 3pm)

We still need these forms or we'll have to reschedule:
❌ Informed Consent (5 min): [link]
❌ Photo Authorization (1 min): [link]

Our policy requires 24hr advance completion. Please finish now!
Already done? Reply DONE and I'll double-check our system.

Need to reschedule? Reply RESCHEDULE"
```

**Escalation Protocol:**
- If forms not complete 12hrs before → Call patient
- If forms not complete 2hrs before → Offer telehealth to complete forms
- If forms not complete at arrival → Complete on iPad (delays appointment)

#### **Phase 4: At Check-In (Last Resort)**

```
Patient arrives without forms completed:

Staff Script:
"Hi Sarah! Before we can start, we need you to complete your consent forms on this iPad.
It'll take about 10 minutes, which will delay your appointment.
We texted you these forms 3 days ago—did you receive them?"

iPad Workflow:
1. Hand patient iPad with pre-loaded forms
2. Staff explains each section briefly
3. Patient signs electronically
4. Forms instantly saved to EMR
5. Print copy for patient if requested
```

### Consent Form Content Requirements

#### **Informed Consent Must Include:**

**For Botox/Dysport:**
- How neuromodulators work (blocks nerve signals)
- FDA-approved uses vs off-label
- Expected results (3-4 months duration)
- Alternative treatments
- Common side effects (bruising, headache)
- Rare risks (ptosis, dysphagia, allergic reaction)
- Pregnancy/breastfeeding contraindication
- Medication interactions (aminoglycosides, muscle relaxants)
- When to seek medical attention
- Follow-up requirements (2-week assessment)

**For Dermal Fillers:**
- Product type (HA vs. non-HA) and brand (Juvederm, Restylane, etc.)
- Duration (6-18 months depending on product)
- Risks specific to injection site (lips = herpes reactivation, under-eye = Tyndall effect)
- **Vascular occlusion risk** (rare but serious—vision loss, tissue necrosis)
- Hyaluronidase emergency reversal option
- Lumps/nodules management
- Biofilm formation (rare, late complication)
- Dental procedure timing (avoid 2 weeks before/after lip filler)

**State-Specific Requirements:**

**Texas Medical Board:**
- Physician name on consent form
- "Individual results not guaranteed" statement
- Cancellation policy clearly stated

**California:**
- Physician must examine patient before RN injection
- Supervision documentation required
- No "before/after" photos without results disclaimer

#### **Example Consent Language:**

```
BOTOX COSMETIC INFORMED CONSENT

I, Sarah Martinez, voluntarily consent to receive Botox Cosmetic (onabotulinumtoxinA)
treatment administered by Amanda Chen, RN, under the supervision of Dr. James Kim, MD.

I understand:
✓ Botox temporarily relaxes facial muscles to reduce wrinkles for 3-4 months
✓ Results take 3-14 days to appear and are not permanent
✓ Common side effects include bruising, swelling, headache, temporary drooping (rare)
✓ I should avoid lying down for 4 hours after treatment
✓ I am not pregnant, breastfeeding, or allergic to botulinum toxin
✓ I will contact the clinic immediately if I experience vision changes, difficulty swallowing,
  or severe pain (emergency complications)

I have been given the opportunity to ask questions and understand this is an elective
cosmetic procedure. I authorize photography for medical records.

Patient Signature: _____________ Date: 1/22/2026
Provider Signature: _____________ Date: 1/22/2026
Medical Director: Dr. James Kim, MD (License #A12345)
```

### Medical Spa vs Salon Software

**Standard Salon Software:**
- Generic waiver: "I agree to the terms and conditions"
- One-size-fits-all consent
- No treatment-specific risks

**Medical Spa Requirement:**
- Product-specific consents (Botox ≠ Filler risks)
- FDA/state medical board compliance
- Medical director signature required
- Electronic signature audit trail (DocuSign standards)
- Annual consent updates (protocols change)

---

## 7. "Results Wearing Off" Reminders (Retention Strategy)

### Overview
Injectable retention strategy requires **predictive timing** based on product metabolism, not generic "haven't seen you in a while" messages.

### Treatment-Specific Retention Timelines

#### **Neuromodulators (Botox/Dysport/Xeomin)**

**Timeline:**
- Week 1-2: Results appearing
- Week 3-10: Peak results
- Week 11-14: Subtle wear-off begins
- Week 15-16: Noticeable movement returns
- Week 17+: Full movement restored

**Retention Messaging Strategy:**

```
Week 10 (Pre-Emptive):
"Hi Sarah! Your Botox is still looking smooth 😊 Want to keep it that way?
Book your next appointment now = never lose your results!
Plus: Patients who stay consistent use less product over time = savings 💰
Book here: [link]"
Goal: Pre-booking (highest retention rate)

Week 14 (Wear-Off Detection):
"Noticing your Botox starting to fade? It's been 14 weeks—totally normal!
Come back in before full movement returns. Amanda has availability this week 📅
Reply BOOK or click: [link]"
Goal: Immediate re-booking

Week 18 (Lapsed Patient):
"It's been 4+ months since your last Botox 😢 Miss those smooth results?
WELCOME BACK OFFER: $50 off your next treatment (expires 1/31)
Let's get you back on track! [link]"
Goal: Win-back with incentive

Week 26 (Dormancy Risk):
"We miss you, Sarah! It's been 6 months since you last visited.
Life gets busy—we get it! Ready to smooth those lines again?
Reply INTEREST and we'll send you our current Botox pricing + availability 🙂"
Goal: Low-pressure re-engagement
```

#### **Hyaluronic Acid Fillers (Juvederm, Restylane)**

**Cheek Filler Timeline (12-18 months):**

```
Month 3: "Your cheek filler is looking gorgeous! 😍 Take a selfie and compare to your before photo. Reply with pic?"
Month 9: "9 months post-filler check-in! Still loving your results? Most patients book a touch-up around month 12. Want us to reach out then?"
Month 12: "Your filler results typically last 12-18 months. Ready to refresh? We can add just 0.5mL for a subtle boost. Book consultation: [link]"
Month 15 (No Response): "It's been 15 months since your cheek filler. Noticing volume loss? Let's bring back that lifted look! 20% off touch-ups this month only."
```

**Lip Filler Timeline (6-9 months):**

```
Month 3: "Lip check! How are you loving your results? Any adjustments needed? Complimentary touch-up if needed within first 4 weeks (reply asap!)"
Month 5: "Your lip filler is about halfway through its lifespan. Want to book your next appointment now? Stay ahead of the fade!"
Month 7: "Lips feeling thinner? Totally normal at the 7-month mark. Come back in before they fully fade = easier to maintain."
Month 10 (Lapsed): "Miss those full lips? It's been 10 months! Let's get you back to plump. Same as before: 1mL for $650. [link]"
```

### Retention Conversion Strategies

**Strategy 1: Loss Aversion Messaging**

```
"Don't lose your results! Book your next Botox now → stay wrinkle-free year-round"

Psychology: Fear of losing progress > desire to gain progress
Conversion lift: +18%
```

**Strategy 2: Pre-Booking Incentive**

```
"Pre-book today = $25 off your next treatment + priority scheduling"

Benefit: Secures future revenue, reduces patient churn
Conversion: 35-40% of patients pre-book at checkout
```

**Strategy 3: Treatment Series Discount**

```
"Buy 3 Botox sessions upfront = Save $150 + never worry about booking again (auto-scheduled)"

Revenue: Higher upfront cash flow
Risk: Patient might leave before using all sessions (require 12-month expiration)
```

**Strategy 4: Membership Model**

```
"Join our Botox Membership: $99/month = 30 units every 3 months + 10% off fillers"

Benefits:
- Predictable recurring revenue
- 88% retention rate (vs 60% pay-per-visit)
- Patients spend 3x more annually
```

### Retention Metrics to Track

| Metric | Good | Great | Calculation |
|--------|------|-------|-------------|
| **Pre-booking rate** | 30% | 45%+ | % of patients who book next appt at checkout |
| **3-month retention** | 60% | 75%+ | % of patients who return within 1 month of product wear-off |
| **6-month retention** | 40% | 60%+ | % of patients who return within 6 months |
| **Annual retention** | 50% | 70%+ | % of patients who return at least once per year |
| **Lifetime value** | $2,500 | $5,000+ | Total revenue per patient over 5 years |
| **Treatment frequency** | 2.5x/year | 4x/year | Average # of injectable appointments per patient |

### Medical Spa vs Salon Software

**Standard Salon Software:**
- "We haven't seen you in 90 days! Come back!"
- Generic time-based reminders
- No product-specific tracking

**Medical Spa Requirement:**
- **Treatment-specific messaging** (Botox ≠ Filler timelines)
- **Results-based language** ("wearing off" vs "time for another haircut")
- **Retention science** (loss aversion, pre-booking incentives)
- **Product tracking** (know what patient received + when + lot #)
- **Provider continuity** ("Book with Amanda again—she knows your face!")

---

## 8. Emergency Contact Workflows

### Overview
Injectable complications can be **medical emergencies** requiring immediate provider contact and escalation protocols beyond standard business hours.

### Emergency Triage System

#### **Tier 1: IMMEDIATE EMERGENCY (Call 911 or Go to ER)**

**Symptoms Requiring Emergency Services:**
- Vision loss, blurriness, or eye pain (vascular occlusion risk)
- Severe difficulty breathing or swallowing (anaphylaxis or airway swelling)
- Chest pain or heart palpitations (rare autonomic nervous system involvement)
- Stroke-like symptoms (numbness, weakness, confusion)
- Seizures

**Patient Message Auto-Response:**
```
"🚨 CALL 911 IMMEDIATELY or go to the nearest ER.
These symptoms can be life-threatening. Do not wait.

Tell ER staff:
- You received [BOTOX/FILLER] on [DATE]
- Product: [Brand + Lot Number]
- Provider: Dr. James Kim, MD
- Clinic phone: (555) 0100

We are calling you now. If we don't reach you, we will contact your emergency contact."
```

**Staff Escalation Protocol:**
1. Immediate call to patient (3 attempts)
2. Text/call emergency contact on file
3. Notify medical director (cell phone)
4. Document in EMR with timestamp
5. Follow up with patient next day (confirm they received care)

#### **Tier 2: URGENT (Call Clinic Emergency Line Within 1 Hour)**

**Symptoms Requiring Same-Day Provider Contact:**
- Severe pain (8-10/10 scale)
- Skin color changes (white, purple, dusky)
- Spreading redness or warmth (infection signs)
- New rash, hives, or severe itching (allergic reaction)
- Sudden asymmetry or drooping (ptosis, migration)
- Difficulty moving jaw or mouth (rare muscle involvement)

**Patient Message Auto-Response:**
```
"⚠️ This needs immediate attention.
Call our emergency line NOW: (555) 0100

Available 24/7 for emergencies.

If you can't reach us, go to Urgent Care or ER.
Do not wait—these symptoms can worsen quickly."
```

**After-Hours Coverage:**

Med spas must have 24/7 emergency contact protocol:

**Option 1: On-Call Provider Rotation**
- Rotating schedule: Medical director + 2 senior RNs
- Forwarded phone number (clinic line → on-call cell)
- Compensation: $200/night on-call stipend

**Option 2: Medical Director Cell Phone**
- Direct cell phone for emergencies only
- Answering service for triage (RubyReceptionist, AnswerConnect)
- Medical director called only for Tier 1-2 emergencies

**Option 3: Telemedicine Platform**
- Patient opens video call for urgent assessment
- Provider evaluates via camera (skin color, swelling, asymmetry)
- Decision: Manage remotely vs send to ER

#### **Tier 3: NON-URGENT (Next Business Day Response OK)**

**Symptoms That Can Wait:**
- Mild bruising or swelling (expected)
- Mild headache (common side effect)
- Small bump at injection site (resolves in days)
- Questions about aftercare ("Can I work out yet?")

**Patient Message Auto-Response:**
```
"Thanks for reaching out! This sounds like a normal reaction.

For mild bruising/swelling:
- Ice 10min every hour today
- Arnica cream 2x daily
- Avoid alcohol, NSAIDs, salty foods

If symptoms worsen, call us: (555) 0100
Otherwise, we'll check in with you in 24 hours 🙂"
```

**Automated Follow-Up:**
```
24 Hours Later:
"Quick check-in! How's the [bruising/swelling] today?
Getting better? Reply YES or NO so we know how you're doing."

If NO → Staff callback within 4 hours
If YES → "Great! It should continue improving over the next week. Questions? Reply anytime!"
```

### Emergency Kit Notification System

**When patient reports emergency symptoms, auto-notify staff:**

```
🚨 VASCULAR OCCLUSION PROTOCOL ACTIVATED

Patient: Sarah Martinez (ID: 12345)
Phone: (555) 123-4567
Symptom: "White skin patch + severe pain on nose"
Treatment: Juvederm Ultra (1.0mL) - 4 hours ago
Provider: Amanda Chen, RN
Lot Number: 2024-J-8745

EMERGENCY KIT NEEDED:
✅ Hyaluronidase (1500 units)
✅ Aspirin 325mg
✅ Nitroglycerin paste 2%
✅ Warm compress
✅ EpiPen (for hyaluronidase reaction)

ACTION REQUIRED:
1. Call patient immediately: (555) 123-4567
2. If vascular occlusion confirmed → Patient must come to clinic NOW
3. If patient unreachable → Call emergency contact + consider calling EMS
4. Notify Dr. Kim (cell: 555-999-8888)

Time-sensitive: 60-90 minute window for treatment
```

### Legal Documentation Requirements

**After any emergency contact, document:**

```
EMERGENCY CONTACT LOG

Date/Time: 1/22/2026 8:45pm
Patient: Sarah Martinez (ID: 12345)
Emergency Type: Tier 2 (Urgent - Severe Pain)

Symptom Report:
"I have terrible pain in my forehead, like 9 out of 10. It started 2 hours ago."

Treatment Context:
- Botox Cosmetic (32 units) - administered today at 2pm
- Provider: Amanda Chen, RN
- Medical Director: Dr. James Kim, MD
- Lot #: C3456A89

Response Timeline:
8:45pm - Patient text received, auto-response sent
8:47pm - Amanda Chen, RN called patient (connected)
8:52pm - Phone assessment: Severe headache, no vision changes, no other neuro symptoms
8:55pm - Advised: Tylenol 500mg, ice, call back if worsens
9:00pm - Notified Dr. Kim (non-urgent, monitoring)
Next Day 10am - Follow-up call scheduled

Outcome:
Patient reported improvement by 11pm. Follow-up call 1/23 10am confirmed full resolution.
Likely tension headache (common side effect). No further action needed.

Documented by: Amanda Chen, RN
Reviewed by: Dr. James Kim, MD (1/23/2026)
```

**Why This Matters:**
- Medical malpractice cases often hinge on "Did provider respond appropriately + timely?"
- Documentation proves you took emergency seriously
- Audit trail for state nursing board investigations

### Medical Spa vs Salon Software

**Standard Salon Software:**
- "Call us during business hours: Mon-Fri 9am-5pm"
- No after-hours coverage
- No emergency protocols

**Medical Spa Requirement:**
- **24/7 emergency contact** (medical director cell, on-call line)
- **Tiered triage system** (life-threatening vs urgent vs routine)
- **Product lot tracking** (patient texts emergency → staff knows exact product/lot)
- **EHR integration** (emergency call → auto-creates chart note)
- **Regulatory compliance** (state nursing boards require emergency response plans)

---

## 9. Provider-Specific Communication (RN vs MD Protocols)

### Overview
Medical spas operate under **complex oversight structures** where RNs require physician supervision, creating unique messaging workflows for compliance.

### State-by-State Supervision Requirements

#### **Full Practice Authority States (NPs Can Operate Independently)**

**States where NPs can own med spas without physician oversight:**
- Alaska, Arizona, Colorado, Connecticut, Hawaii, Idaho, Iowa, Maine, Maryland, Minnesota, Montana, Nebraska, Nevada, New Mexico, North Dakota, Oregon, Rhode Island, South Dakota, Vermont, Washington, Wyoming (21+ states)

**Messaging Implication:**
- NPs can directly approve treatments
- No "medical director" mentioned in patient communications
- Streamlined workflow (no physician chart review step)

#### **Restricted Practice States (RNs Require Physician Supervision)**

**States with strict supervision rules:**
- **California**: Physician must be on-site, RNs can't inject without direct supervision
- **Texas**: Physician must examine patient, written protocol required
- **Florida**: Physician must examine + prescribe, RN follows protocol
- **New York**: Physician oversight required, medical director must be practicing physician

**Messaging Implication:**
- Must mention medical director in communications
- Two-step approval process (RN sees patient → MD approves → RN injects)

### Supervision Workflow Examples

#### **Scenario 1: RN-Led Treatment (California)**

**Patient Inquiry:**
```
Patient: "Hi, can I book Botox for next week?"
```

**Response (Compliance Required):**
```
"Hi Sarah! Yes, we'd love to help you!

Your Botox appointment works like this:
1. Dr. Kim (our medical director) will examine you and approve your treatment plan
2. Amanda, our experienced RN, will perform your injections under Dr. Kim's supervision
3. Dr. Kim is on-site during all treatments (required by CA law)

First-time patients need a consultation first ($50, applied to treatment).
Available times: [link]

Questions? Reply here!"
```

**Why This Matters:**
- California Medical Board requires physician to examine patient before RN injection
- "Good faith exam" must be documented in chart
- Failure to disclose supervision = unlicensed practice of medicine

#### **Scenario 2: NP-Led Treatment (Full Practice Authority State)**

**Patient Inquiry:**
```
Patient: "Can I book Botox?"
```

**Response (Simplified):**
```
"Hi Sarah! Absolutely! Book your Botox with our Nurse Practitioner, Jessica:
Available times: [link]

New patient? We'll start with a quick consultation to assess your goals + medical history.
See you soon! 😊"
```

**Difference:**
- No mention of physician oversight (not required)
- NP is independent practitioner
- Faster workflow (no physician approval step)

### Medical Director Oversight Messaging

#### **When to Notify Medical Director:**

**High-Risk Treatments:**
- First-time injectable patient (physician chart review)
- Patient with concerning medical history (autoimmune, neuromuscular)
- Complication reported (emergency or unusual)
- Large-volume filler treatment (>2mL)

**Staff Internal Notification:**
```
To: Dr. Kim (Medical Director)
From: Amanda Chen, RN
Subject: New Patient Chart Review - Sarah Martinez

Patient: Sarah Martinez (ID: 12345)
Appointment: 1/25/2026 2pm - Botox consultation
Medical History:
- Hx of Bells Palsy (2019) ✅ Resolved, cleared by neurologist
- Takes Lexapro (SSRI) - no interaction with Botox
- No known allergies

Request: Please review chart before appointment and approve Botox treatment plan.
Proposed: 20 units glabellar, 12 units forehead

Thank you!
```

**Medical Director Response (Required Documentation):**
```
Chart Note:
"Reviewed pre-appointment. History of Bells Palsy is not a contraindication if fully resolved
(patient states no residual weakness). Approved for Botox as outlined. RN may proceed with
treatment. Will be on-site during appointment per CA Medical Practice Act.

- Dr. James Kim, MD (License #A12345)
  Date: 1/24/2026 4:15pm"
```

#### **Patient-Facing Communication of Oversight:**

**Post-Treatment Summary:**
```
"Thank you for visiting Luxe Medical Spa today! 🙂

Treatment Summary:
- Service: Botox Cosmetic (32 units)
- Areas: Forehead + glabellar lines
- Provider: Amanda Chen, RN
- Medical Director: Dr. James Kim, MD (supervised)
- Product: Botox Cosmetic (Lot #C3456A89)
- Date: 1/25/2026

Post-care instructions: [link]
Questions? Text us anytime!

Your next Botox touch-up: ~April 2026 (we'll remind you!)
Book now: [link]"
```

**Why Include Medical Director Name:**
- Demonstrates medical oversight (regulatory compliance)
- Builds patient confidence (physician-supervised care)
- Legal protection (clear chain of responsibility)

### Training & Competency Communication

**State nursing boards require ongoing training for injectables. Med spas should communicate this to patients:**

```
Staff Bio Page:
"Amanda Chen, RN
California RN License #123456

Certifications:
✅ Botox & Dermal Filler Training (National Laser Institute, 2023)
✅ Advanced Facial Anatomy (Empire Medical Training, 2024)
✅ Complication Management (AAFE, 2024)
✅ HIPAA & Medical Ethics (Ongoing)

Experience: 500+ injectable treatments performed
Supervised by: Dr. James Kim, MD (Board-Certified Dermatologist)

'I love helping patients feel confident in their skin!
Let's create natural-looking results together.' - Amanda"
```

**Patient Reassurance Messaging:**
```
"All our injectors complete 100+ hours of training and are supervised by
Dr. Kim, a board-certified physician. You're in expert hands! 😊"
```

### Medical Spa vs Salon Software

**Standard Salon Software:**
- Single provider workflow (hairstylist = independent)
- No oversight documentation
- No state-specific compliance tracking

**Medical Spa Requirement:**
- **Two-tier provider workflow** (RN + MD supervision)
- **State-specific messaging** (CA requires different language than WA)
- **Medical director notifications** (chart review, complication alerts)
- **License verification tracking** (RN license expires → system alerts)
- **Supervision documentation** (every RN treatment = MD chart note required)

---

## 10. Product Lot Tracking & Recall Notifications

### Overview
FDA regulations require medical spas to track injectable product lot numbers and notify patients in case of recalls—a critical safety workflow absent from salon software.

### Why Lot Tracking Matters

**FDA Medical Device Tracking (21 CFR Part 821):**
- Dermal fillers = Class III medical devices (highest risk)
- Botox = Biologic licensed under FDA oversight
- Manufacturers must track from factory → distributor → clinic → patient
- Clinics must document product lot # in patient chart

**Real-World Recall Example:**
- 2023: Sculptra recalled for particulate matter contamination
- Clinics had 48 hours to identify + notify affected patients
- Required: Patient name, contact info, treatment date, lot #

**Without Lot Tracking:**
- Can't identify which patients received recalled product
- Potential FDA violation + patient safety risk
- Liability if patient develops complication from recalled batch

### Lot Tracking Workflow

#### **Step 1: Product Receipt**

**When new product arrives:**

```
Inventory Management:
Product: Juvederm Ultra Plus XC
Lot Number: 2025-J-1234
Expiration: 12/31/2026
Units Received: 10 syringes
Cost: $350/syringe
Storage: Refrigerator (2-8°C)
Received By: Amanda Chen, RN
Date: 1/15/2026
```

**Barcode Scanning:**
- Many med spas use barcode scanners to auto-capture lot #
- Software: AestheticsPro, Calysta EMR, OptiMantra
- Integrates with inventory + patient charts

#### **Step 2: Treatment Documentation**

**During patient treatment:**

```
Patient Chart Note:
Patient: Sarah Martinez (ID: 12345)
Date: 1/22/2026
Treatment: Lip Filler Augmentation
Product: Juvederm Ultra Plus XC
Lot Number: 2025-J-1234 ⬅️ CRITICAL DATA POINT
Volume: 1.0mL
Expiration: 12/31/2026 (verified before use)
Provider: Amanda Chen, RN
Supervised by: Dr. James Kim, MD
Patient Consent: Signed 1/22/2026
Photos: Before/after captured

Post-Care:
- Ice + arnica advised
- Avoid exercise 24hrs
- Follow-up in 2 weeks
```

**Why This Matters:**
- If Lot #2025-J-1234 is recalled → Search system for all patients who received it
- Time-sensitive notification (FDA requires 48hr notification)
- Defensible documentation if patient claims complication

#### **Step 3: Recall Notification Workflow**

**Manufacturer Issues Recall:**

```
URGENT: FDA Recall Notice
Product: Juvederm Ultra Plus XC
Affected Lots: 2025-J-1234, 2025-J-1235, 2025-J-1236
Reason: Potential bacterial contamination in manufacturing facility
Date Issued: 2/10/2026
Action Required: Notify all patients who received affected lots within 48 hours

Patient Symptoms to Monitor:
- Redness, warmth, swelling (beyond normal)
- Fever or flu-like symptoms
- Pus or drainage from injection site
```

**Step 3A: Identify Affected Patients**

**System Search:**
```
Query: "Find all patients who received Lot #2025-J-1234"
Results: 12 patients treated between 1/15/2026 - 2/8/2026
```

**Affected Patient List:**
```
1. Sarah Martinez (1/22/2026) - Lips (1.0mL)
2. Emily Chen (1/25/2026) - Nasolabial folds (1.5mL)
3. Jennifer Lopez (1/29/2026) - Lips (0.8mL)
... (12 total)
```

**Step 3B: Patient Notification (URGENT)**

**SMS + Email + Phone Call (Multi-Channel):**

```
URGENT SMS:
"Hi Sarah - Important safety notice from Luxe Medical Spa.

The Juvederm filler you received on 1/22 is part of an FDA recall due to
potential contamination. You likely have NO risk, but please watch for:
- Unusual redness, warmth, or swelling
- Fever or pain

If you have ANY of these symptoms, call us immediately: (555) 0100

We'll call you today to discuss. You're safe—this is precautionary.
More info: [FDA link]"

Email (Full Details):
Subject: URGENT - FDA Recall Notification for Your Recent Treatment

Dear Sarah,

We are contacting you regarding an FDA recall affecting the dermal filler
you received at our clinic.

WHAT HAPPENED:
On January 22, 2026, you received Juvederm Ultra Plus XC (Lot #2025-J-1234)
in your lips (1.0mL).

The manufacturer (Allergan) has issued a voluntary recall of this lot due to
potential bacterial contamination during manufacturing.

WHAT YOU SHOULD DO:
1. Monitor for infection signs (unusual redness, warmth, swelling, fever, pain)
2. If you have ANY symptoms, call us immediately: (555) 0100 (24/7 emergency line)
3. Attend your scheduled follow-up appointment (or book one if you haven't)

WHAT WE ARE DOING:
- We've removed all affected product from our inventory
- Dr. Kim (our medical director) is available to assess you at no charge
- We're reporting this to the FDA as required

IMPORTANT: Most patients will have NO issues. This is a precautionary measure.

Questions? Call us: (555) 0100 or reply to this email.

Sincerely,
Dr. James Kim, MD
Medical Director, Luxe Medical Spa
```

**Phone Call Script:**
```
"Hi Sarah, this is Amanda from Luxe Medical Spa. I'm calling about an important
FDA recall. Do you have a moment to talk?

[Explain recall]

How are you feeling? Any redness, swelling, or pain?

[If YES → Schedule urgent appointment]
[If NO → Reassure, ask to monitor, schedule follow-up]

We're here 24/7 if anything changes. Do you have any questions?"
```

**Step 3C: Document Patient Notification**

```
RECALL NOTIFICATION LOG

Patient: Sarah Martinez (ID: 12345)
Product: Juvederm Ultra Plus XC (Lot #2025-J-1234)
Treatment Date: 1/22/2026
Recall Issue Date: 2/10/2026

Notification Timeline:
- 2/10/2026 10:00am - SMS sent (delivered)
- 2/10/2026 10:05am - Email sent (opened)
- 2/10/2026 2:15pm - Phone call (connected, spoke with patient)

Patient Status:
- No symptoms reported
- Patient reassured and educated
- Follow-up scheduled: 2/15/2026
- Patient aware to call if symptoms develop

Documented by: Amanda Chen, RN
Reviewed by: Dr. James Kim, MD
FDA Reporting: Completed 2/10/2026 (MedWatch)
```

### Lot Tracking Best Practices

**Inventory System Requirements:**
✅ Barcode scanning for product receipt
✅ Auto-populate lot # into patient chart during treatment
✅ Expiration date tracking (auto-alert when product nears expiration)
✅ FIFO inventory management (use oldest stock first)
✅ Recall alert integration (FDA MedWatch API)

**Software Solutions:**
- **AestheticsPro**: Built-in lot tracking + FDA recall alerts
- **Calysta EMR**: Barcode scanner integration + patient notification tools
- **Zenoti**: Inventory management + treatment history linking
- **OptiMantra**: Product traceability + compliance reporting

**Manual Tracking (Small Clinics):**
- Excel spreadsheet: Date | Patient Name | Product | Lot # | Provider
- Print label with lot # and stick on patient chart
- Keep product boxes for 2 years (FDA audit requirement)

### Medical Spa vs Salon Software

**Standard Salon Software:**
- No product lot tracking
- Generic inventory ("10 units of shampoo in stock")
- No recall notification workflow

**Medical Spa Requirement:**
- **FDA-compliant lot tracking** (medical device requirement)
- **Patient-to-product linking** (know exactly who got which lot)
- **Multi-channel recall notifications** (SMS + email + phone)
- **48-hour notification requirement** (FDA mandate)
- **Audit trail documentation** (prove you notified patients)

---

## Implementation Checklist

### Phase 1: Messaging Infrastructure (Weeks 1-4)

**Technical Setup:**
- [ ] Implement HIPAA-compliant SMS platform (Klara, OhMD, Curogram)
- [ ] Sign Business Associate Agreement (BAA) with SMS provider
- [ ] Enable two-way messaging (patient can reply)
- [ ] Integrate SMS platform with EMR/patient management system
- [ ] Set up secure message storage (encrypted, 7-year retention)

**Compliance:**
- [ ] Create SMS consent form (transactional + marketing opt-in)
- [ ] Build opt-out detection system (STOP keyword → auto-remove from lists)
- [ ] Implement quiet hours (no texts 9pm-8am per TCPA)
- [ ] Document consent tracking (when/how patient opted in)

### Phase 2: Injectable-Specific Workflows (Weeks 5-8)

**Consultation Workflows:**
- [ ] Two-step booking: consultation → treatment approval
- [ ] Medical history form auto-send (at booking confirmation)
- [ ] Good faith exam coordination (for RN treatments)
- [ ] Medical director chart review notification

**Pre-Treatment Prep:**
- [ ] Treatment-specific prep instructions (Botox vs filler)
- [ ] Blood thinner avoidance reminders (7 days before)
- [ ] Photo consent form integration
- [ ] Medication list collection

**Post-Treatment Monitoring:**
- [ ] Immediate aftercare instructions (within 2 hours)
- [ ] 24-hour complication check-in (bruising, swelling, pain)
- [ ] 48-hour symptom monitoring
- [ ] 2-week follow-up scheduling reminder

**Complication Protocols:**
- [ ] AI keyword detection (vision, severe pain, spreading redness)
- [ ] Emergency escalation workflow (RN → MD)
- [ ] Vascular occlusion emergency protocol (90-minute response)
- [ ] After-hours emergency line setup

### Phase 3: Retention & Touch-Up Workflows (Weeks 9-12)

**Product-Specific Reminders:**
- [ ] Botox 10-week pre-booking reminder
- [ ] Botox 14-week wear-off reminder
- [ ] Filler 9-month touch-up reminder (for 12-month products)
- [ ] Filler 5-month touch-up reminder (for 6-9 month lip fillers)

**Retention Strategies:**
- [ ] Pre-booking incentives ($25 off if booked at checkout)
- [ ] Loss aversion messaging ("Don't lose your results!")
- [ ] Treatment series packages (buy 3 Botox, save $150)
- [ ] Membership program setup (monthly recurring revenue)

**Win-Back Campaigns:**
- [ ] 5-month lapsed patient message (20% off welcome back)
- [ ] 6-month dormancy risk message
- [ ] 12-month reactivation campaign

### Phase 4: Advanced Features (Weeks 13-16)

**Photo Collection:**
- [ ] Before/after photo consent workflow
- [ ] Standardized photo protocols (lighting, angles, distance)
- [ ] Patient-submitted photo requests (2-week, 3-month milestones)
- [ ] HIPAA-compliant photo storage (encrypted)
- [ ] Marketing photo approval workflow (separate consent)

**Consent Form Automation:**
- [ ] Digital signature platform integration (DocuSign, Jotform)
- [ ] Mobile-friendly forms (80% patients use phones)
- [ ] 72-hour form completion reminder
- [ ] 24-hour urgent reminder (or reschedule appointment)
- [ ] At-check-in iPad completion (backup)

**Lot Tracking & Recalls:**
- [ ] Barcode scanner integration (product receipt)
- [ ] Auto-populate lot # into patient chart
- [ ] FDA recall alert system
- [ ] Patient notification workflow (SMS + email + phone)
- [ ] 48-hour compliance reporting

**Medical Director Oversight:**
- [ ] Chart review notifications (new patients, high-risk cases)
- [ ] Complication escalation alerts (emergency, urgent, routine)
- [ ] Supervision documentation (every RN treatment)
- [ ] State-specific compliance messaging (CA, TX, NY, FL)

### Phase 5: Analytics & Optimization (Ongoing)

**Track Key Metrics:**
- [ ] Pre-booking rate (goal: 35-45%)
- [ ] 3-month retention rate (goal: 75%+)
- [ ] Touch-up conversion rate (goal: 60%+)
- [ ] Complication response time (goal: <1 hour for urgent)
- [ ] Form completion rate (goal: 90%+ before appointment)
- [ ] Patient satisfaction (post-treatment survey)

**Continuous Improvement:**
- [ ] A/B test message templates (which gets better conversion?)
- [ ] Optimize reminder timing (does 10-week work better than 12-week for Botox?)
- [ ] Review complication escalation logs (any missed red flags?)
- [ ] Survey patients (what messaging is most helpful?)

---

## Competitive Analysis: Med Spa Software vs Salon Software

### Med Spa Software (Injectable-Aware)

**AestheticsPro:**
- ✅ Treatment-specific prep reminders (Botox, filler, laser)
- ✅ Post-treatment complication monitoring
- ✅ Lot # tracking + FDA recall alerts
- ✅ HIPAA-compliant SMS platform
- ✅ Medical director oversight workflows
- ✅ Before/after photo management
- **Pricing:** $399-799/month

**Calysta EMR:**
- ✅ Injectable-specific consent forms
- ✅ Barcode scanning for inventory
- ✅ Patient portal for form completion
- ✅ Digital signatures (legally binding)
- ✅ Photo consent + HIPAA storage
- **Pricing:** $299-599/month

**TouchMD:**
- ✅ iPad-based before/after photos (grids, overlays)
- ✅ Photo consent workflow
- ✅ Patient education library (injectable videos)
- ✅ Side-by-side photo comparisons
- ✅ Marketing photo approval
- **Pricing:** $495/month + setup fees

### Salon Software (Not Injectable-Ready)

**Vagaro:**
- ❌ Generic appointment reminders
- ❌ No treatment-specific messaging
- ❌ No lot tracking
- ❌ No medical director workflows
- ✅ Basic SMS (not HIPAA-compliant)
- **Pricing:** $25-125/month

**Boulevard:**
- ❌ Salon-focused (hair, nails, spa)
- ❌ No injectable-specific features
- ❌ No complication monitoring
- ✅ Automated reminders (generic)
- **Pricing:** $175-395/month

**Mindbody:**
- ❌ Fitness/wellness focus
- ❌ No medical compliance features
- ❌ No FDA reporting
- ✅ Class/appointment scheduling
- **Pricing:** $129-349/month

### Key Differentiators

| Feature | Med Spa Software | Salon Software |
|---------|------------------|----------------|
| **Compliance** | HIPAA, FDA, state nursing boards | None (cosmetic services) |
| **Messaging** | Treatment-specific (Botox ≠ filler) | Generic ("time for a haircut") |
| **Safety Protocols** | Complication monitoring, emergency escalation | N/A |
| **Provider Oversight** | RN supervision, MD chart review | Independent stylist |
| **Documentation** | EMR integration, lot tracking, consent forms | Appointment notes only |
| **Retention Strategy** | Product-specific wear-off reminders | Generic "we miss you" |
| **Photo Management** | Medical + marketing consent, HIPAA storage | Social media sharing (no consent) |
| **Pricing** | $299-799/month (medical-grade) | $25-395/month (basic) |

**Bottom Line:**
Standard salon software **cannot safely support injectable treatments** due to lack of:
1. HIPAA-compliant messaging
2. Medical complication protocols
3. FDA lot tracking
4. State nursing board compliance
5. Medical director oversight workflows

---

## Regulatory Compliance Summary

### HIPAA (Health Insurance Portability and Accountability Act)

**Requirements:**
- ✅ Encrypted SMS platform (no standard SMS)
- ✅ Business Associate Agreement (BAA) with vendor
- ✅ Patient consent for PHI in text messages
- ✅ Secure storage (encrypted, role-based access)
- ✅ Audit logs (who accessed what, when)

**Violations:**
- ❌ Using personal cell phone for patient texts
- ❌ Sending appointment details via unencrypted SMS
- ❌ Including patient name + treatment in text ("Sarah's Botox appt tomorrow")

**Penalties:**
- $100-50,000 per violation
- Criminal charges for willful neglect

### TCPA (Telephone Consumer Protection Act)

**Requirements:**
- ✅ Prior express written consent for marketing texts
- ✅ Opt-out mechanism (STOP keyword)
- ✅ Respect quiet hours (9pm-8am local time)
- ✅ Clear identification (who's texting)

**Violations:**
- ❌ Texting without consent
- ❌ No opt-out option
- ❌ Texting after opt-out

**Penalties:**
- $500-1,500 per text (can add up to millions)

### FDA (Food and Drug Administration)

**Requirements:**
- ✅ Lot number tracking (dermal fillers = Class III device)
- ✅ Adverse event reporting (MedWatch)
- ✅ Product recall patient notification (48 hours)
- ✅ Accurate product claims (can't say "lasts 2 years" if it's 12 months)

**Marketing Rules:**
- ✅ "Results may vary" disclaimer
- ✅ No unsubstantiated claims ("Botox cures migraines" without FDA approval)
- ✅ Before/after photos must be unedited

### State Medical Boards

**Requirements vary by state:**

**California:**
- Physician must examine patient before RN injection
- Physician must be on-site during treatment
- Marketing must include physician name

**Texas:**
- Physician must establish treatment plan
- Written protocols required for RN delegation
- Medical director oversight documented

**New York:**
- Physician oversight required (can't be absentee medical director)
- Marketing rules (no false/misleading claims)

---

## Key Takeaways

### What Makes Injectable Messaging Different?

1. **Medical Compliance** - HIPAA, FDA, state boards (not just appointment reminders)
2. **Clinical Safety** - Complication monitoring, emergency escalation (potential blindness from vascular occlusion)
3. **Provider Oversight** - RN requires MD supervision in most states (two-tier workflow)
4. **Treatment Timing** - Product-specific reminders (Botox ≠ filler wear-off timelines)
5. **Documentation** - Lot tracking, consent forms, medical record integration
6. **Retention Science** - Loss aversion, pre-booking incentives (not generic "come back" messages)
7. **Photo Management** - Medical + marketing consent, HIPAA storage (not just social media)
8. **Emergency Protocols** - 24/7 on-call, vascular occlusion response (90-min window)
9. **Patient Education** - Blood thinner avoidance, aftercare instructions (not haircut tips)

### Implementation Priorities

**Must Have (Day 1):**
1. HIPAA-compliant SMS platform
2. Complication monitoring workflow
3. Emergency contact protocol
4. Consent form automation

**Should Have (Month 1):**
5. Treatment-specific prep reminders
6. Post-treatment follow-ups
7. Medical director oversight notifications
8. Lot number tracking

**Nice to Have (Month 3):**
9. Touch-up retention reminders
10. Before/after photo collection
11. AI complication detection
12. Win-back campaigns

---

## Research Sources

Sources:
- [Next-Gen Medical Spa Growth: Technology, Treatments, and Training for 2026](https://www.medicalsparx.com/next-gen-medical-spa-growth-technology-treatments-and-training-for-2026/)
- [American Med Spa Association: Medical Spa Forms & Consents](https://americanmedspa.org/medspaforms)
- [The Best Med Spa Software for 2026: Top Platforms](https://withcherry.com/blog/med-spa-software)
- [OhMD HIPAA Compliant Texting](https://www.ohmd.com/)
- [Is Text Messaging HIPAA Compliant - HIPAA Journal](https://www.hipaajournal.com/is-text-messaging-hipaa-compliant/)
- [Texting - Joint Commission Standards](https://www.jointcommission.org/en/knowledge-library/support-center/standards-interpretation/standards-faqs/000002483)
- [TouchMD Digital Consent Forms](https://www.touchmd.com/consents)
- [Mangomint: Med Spa Consent Form Templates](https://www.mangomint.com/blog/med-spa-consent-forms/)
- [Patient Privacy in Medical Spa Marketing](https://americanmedspa.org/blog/patient-privacy-in-your-medical-spa-marketing)
- [Med Spa Advertising Rules 2025: U.S. Compliance Guide](https://10xmedspamarketing.com/med-spa-advertising-rules-in-the-u-s-a-2025-compliance-guide/)
- [Botox & Filler Post Treatment Instructions](https://www.virginiafacialplasticsurgery.com/operation-instructions/botox-filler-post-treatment-instructions)
- [How to Avoid Bruising After Injectable Treatments](https://www.austinplasticsurgery.com/news/how-to-avoid-bruising-after-injectable-treatments/)
- [10 Proven Strategies to Boost Patient Retention at Your Med Spa](https://americanmedspa.org/blog/10-proven-strategies-to-boost-patient-retention-at-your-med-spa)
- [Med Spa Software Tips to Boost Client Retention](https://www.practiceq.com/resources/med-spa-software-tips-client-retention)
- [Vascular Occlusion: Clinic Protocols & Emergency Kit](https://healthsuppliesplus.com/vascular-occlusion-preparedness-clinic-protocols-emergency-kit-essentials/)
- [Guideline for Management of Hyaluronic Acid Filler-induced Vascular Occlusion - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8211329/)
- [How Safe Med Spas Manage Complications](https://americanmedspa.org/blog/how-safe-med-spas-manage-complications)
- [Why a Medical Director Is Critical for Your Medical Aesthetic Practice](https://aptinjectiontraining.com/blog/why-a-medical-director-is-critical-for-your-medical-aesthetic-practice/)
- [Do I need a Medical Director to Inject Botox?](https://injectablesedu.com/do-i-need-a-medical-director-to-inject-botox/)
- [Laws for Opening a Med Spa - American Med Spa Association](https://americanmedspa.org/opening-a-med-spa-laws)
- [Understanding Who Can Open a Med Spa](https://www.joinmoxie.com/post/who-can-open-a-med-spa-rules-and-regulations-around-starting-a-med-spa)
- [Can Nurses Do Botox Independently: What The Rules Say](https://injectco.com/can-nurses-do-botox-independently-what-the-rules-say/)
- [Botox Injection Regulations for Nurses: State-by-State Guide](https://aaopm.com/blog/botox-injection-regulations-for-nurses-state-by-state-guide-rns-lpns-nps/)
- [Lot-Track: Track By Lot Number - Recall Notifications](https://www.fffenterprises.com/services/lot-track.html)
- [eCFR: 21 CFR Part 821 - Medical Device Tracking Requirements](https://www.ecfr.gov/current/title-21/chapter-I/subchapter-H/part-821)
- [FDA: Recalls, Corrections and Removals (Devices)](https://www.fda.gov/medical-devices/postmarket-requirements-devices/recalls-corrections-and-removals-devices)
- [Best Salon & Medi-Spa Software in 2026: Complete Guide](https://www.yocale.com/blog/best-salon-and-medspa-software-2026)
- [What's the Best Medical Spa Software? - Calysta EMR](https://calystaemr.com/best-medical-spa-software/)

---

**Document Version:** 1.0
**Last Updated:** January 9, 2026
**Next Review:** June 2026 (or when regulations change)
