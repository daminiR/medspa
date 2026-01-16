# HIPAA Texting Compliance Guide for Medical Spas

**Last Updated:** January 2026
**Purpose:** Comprehensive guide to HIPAA-compliant two-way texting for medical spa practices

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [What Can and Cannot Be Said Via Text](#what-can-and-cannot-be-said-via-text)
3. [Patient Consent Requirements](#patient-consent-requirements)
4. [Encryption Requirements](#encryption-requirements)
5. [Audit Trail Requirements](#audit-trail-requirements)
6. [Staff Training Requirements](#staff-training-requirements)
7. [PHI in Text Messages](#phi-in-text-messages)
8. [Photo Sharing Compliance](#photo-sharing-compliance)
9. [Message Retention Policies](#message-retention-policies)
10. [BAA Requirements with Texting Vendors](#baa-requirements-with-texting-vendors)
11. [State-Specific Regulations](#state-specific-regulations)
12. [Implementation Checklist](#implementation-checklist)
13. [Penalties and Violations](#penalties-and-violations)
14. [Recommended Solutions](#recommended-solutions)

---

## Executive Summary

### Key Takeaway: Standard SMS is NOT HIPAA Compliant

**Critical Understanding:**
- Standard SMS text messages are NOT HIPAA compliant due to lack of encryption, inability to recall messages, and vulnerability to interception
- Medical spas ARE subject to HIPAA if they offer medical treatments like Botox, fillers, or any procedures involving prescription drugs
- Even cosmetic procedures fall under HIPAA if they alter the structure/function of body parts (including skin)
- HIPAA-compliant texting requires specialized platforms with encryption, audit trails, and Business Associate Agreements (BAAs)

### 2026 Regulatory Updates

**Important Changes:**
- New HIPAA Privacy Rule updates strengthen reproductive health care privacy (compliance date: February 16, 2026)
- Proposed cybersecurity performance goals may require enhanced email/text safeguards including:
  - Multi-factor authentication
  - Enhanced encryption standards
  - Improved workforce training
  - Email system controls

### When Medical Spas Must Comply with HIPAA

Medical spas are HIPAA covered entities if they:
- Offer treatments with prescription drugs (Botox Cosmetic, prescription topicals, etc.)
- Perform procedures that alter structure/function of body parts
- Bill insurance electronically
- Maintain electronic health records (EHRs)
- Conduct healthcare transactions electronically

**Exception:** If your med spa operates purely on out-of-pocket payments with no insurance billing or electronic health recordkeeping, HIPAA may not apply.

---

## 1. What Can and Cannot Be Said Via Text

### CAN Text (with proper safeguards):

#### Using HIPAA-Compliant Platforms:
- Appointment confirmations with full details
- Treatment reminders and prep instructions
- Medication refill notifications
- Follow-up care instructions
- Billing inquiries and payment reminders
- Lab results and treatment outcomes
- Patient questions and responses

#### Using Standard SMS (with limitations):
- Generic appointment reminders: "Your appointment is tomorrow at 2 PM"
- General office information: "We're open Monday-Friday 9 AM - 5 PM"
- General health education: "Don't forget to wear sunscreen!"
- Billing reminders without procedure details: "You have an outstanding balance"

### CANNOT Text (via standard SMS):

**Never include these via unencrypted SMS:**
- Patient name + specific treatment: "Sarah, your Botox appointment is tomorrow"
- Diagnosis information: "Your test results show..."
- Specific procedures: "Reminder for your lip filler session"
- Treatment plans or recommendations
- Lab results or medical findings
- Medication instructions with patient identifiers
- Insurance claim information
- Photos of treatments or before/after images
- Any combination of patient identifier + health information

### Examples of HIPAA Violations

**Non-Compliant Messages:**
- "Mr. Johnson, your diabetes medication needs adjustment based on recent A1C levels" (name + diagnosis + treatment)
- "Susan Miller requires transport from 456 Oak Street for dialysis" (name + address + treatment)
- "Hi Sarah! Reminder for your Botox appointment at 3 PM tomorrow" (name + specific aesthetic treatment)
- "Your lip filler treatment showed some swelling - this is normal" (treatment detail + medical observation)

**Compliant Alternative Messages:**
- "Your appointment is tomorrow at 3 PM. Please call 555-0100 with questions."
- "Reminder: You have an appointment scheduled. Reply CONFIRM or call us."
- "Please call our office regarding your recent visit."

---

## 2. Patient Consent Requirements

### Mandatory Consent Elements

**Before sending ANY PHI via text, obtain documented consent that includes:**

1. **Explicit Authorization**
   - Written or electronic consent required
   - Cannot be implied or verbal only
   - Must be documented and stored securely

2. **Risk Disclosure**
   - Inform patients about risks of text messaging PHI
   - Explain that messages could be intercepted
   - Clarify data storage on devices and telecom servers
   - Warn about public Wi-Fi vulnerabilities

3. **What They'll Receive**
   - Types of messages (appointment reminders, treatment info, etc.)
   - Frequency of messages
   - Who will send messages (clinic name, staff roles)

4. **Opt-Out Mechanism**
   - Clear instructions on how to revoke consent
   - Simple opt-out process (e.g., reply "STOP")
   - Confirmation when opt-out is processed

5. **Your Clinic's Policy**
   - Message retention period
   - Who has access to messages
   - Security measures in place

### Consent Form Template Elements

```
CONSENT FOR TEXT MESSAGE COMMUNICATIONS

I, [PATIENT NAME], authorize [MEDICAL SPA NAME] to communicate
with me via text messaging regarding my healthcare information.

I understand that:
☐ Text messages may contain Protected Health Information (PHI)
☐ Standard SMS messages are not encrypted and can be intercepted
☐ Messages will be stored on my device and telecom servers
☐ I should not use public Wi-Fi when accessing health information
☐ I can revoke this consent at any time by texting "STOP"
☐ Revoking consent will not affect my care

Types of messages I consent to receive:
☐ Appointment reminders
☐ Treatment follow-ups
☐ Billing information
☐ Lab results
☐ General health information
☐ Other: ________________

Preferred contact number: ________________

Patient Signature: ________________  Date: ________
```

### Exception: Patient-Initiated Contact

**When patients text you first:**
- You may respond via the same method they used
- Must still warn them of risks in your response
- Document the warning in patient record
- Example response: "Thanks for texting. Please note that texts aren't fully secure. We recommend calling for sensitive information. How can we help?"

### Documentation Requirements

**Must maintain records of:**
- Original consent form (signed and dated)
- Any modifications to consent
- Opt-out requests
- Risk warnings provided to patients
- Storage period: Minimum 6 years

---

## 3. Encryption Requirements

### Why Standard SMS Fails HIPAA

**Standard SMS is not HIPAA compliant because:**
- No end-to-end encryption
- Messages stored unencrypted on telecom servers
- Can be intercepted on public Wi-Fi networks
- Cannot be recalled or deleted remotely
- No access controls or authentication
- No audit trail capabilities

### Encryption Standards Required

#### For HIPAA-Compliant Texting:

**1. End-to-End Encryption**
- Encrypt data in transit (while being sent)
- Encrypt data at rest (when stored on servers/devices)
- Recommended standard: AES-256 encryption
- Transport Layer Security (TLS) for transmission

**2. NIST-Recommended Standards**
- **AES (Advanced Encryption Standard)**: Minimum 128-bit keys, preferably 256-bit
- **OpenPGP**: For email and file encryption
- **S/MIME**: For secure email communications
- **TLS 1.2 or higher**: For data in transit

**3. Platform Requirements**
- Closed messaging platform with login credentials
- Messages sent through encrypted channels (not SMS)
- Secure cloud storage with encryption
- Cannot use standard cellular SMS infrastructure

### HIPAA Encryption: Addressable vs. Required

**Important Distinction:**
- Encryption is technically an "addressable" safeguard under HIPAA
- However, if you choose NOT to encrypt, you must:
  - Document why encryption is not reasonable and appropriate
  - Implement equivalent alternative measures
  - Accept significantly higher liability risk

**Practical Reality in 2026:**
- Encryption is now effectively required for all PHI communications
- No reasonable alternative exists for text messaging
- Regulators expect encryption as standard practice
- "Addressable" status no longer means "optional"

### Alternative to Encryption: Patient Acceptance

**Only acceptable alternative:**
1. Warn patients about risks of unencrypted communication
2. Obtain documented acceptance of these risks
3. Patient must still explicitly request unencrypted texts
4. Not recommended - significant liability exposure

---

## 4. Audit Trail Requirements

### What Must Be Logged

**Comprehensive audit trails must track:**

#### Message Activity
- Date and timestamp of every message
- Sender identity (unique username/ID)
- Recipient identity
- Message content (full text)
- Message status (sent, delivered, read, failed)
- Message modifications or edits
- Message deletions (who, when, why)

#### Access Activity
- Who accessed the messaging system
- Login/logout timestamps
- Failed login attempts
- Device information (type, ID)
- IP address or location data
- Duration of access sessions

#### Administrative Actions
- User account creation/modification/deletion
- Permission/role changes
- Configuration changes
- System updates or maintenance
- Security incidents or breaches

### Technical Safeguard Requirements

**HIPAA Security Rule mandates:**

1. **Access Controls**
   - Unique username and PIN for each user
   - Role-based access permissions
   - Automatic session timeouts
   - Multi-factor authentication (recommended)

2. **Audit Controls**
   - Automatic logging of all activities
   - Tamper-proof audit logs
   - Regular review of access patterns
   - Alerts for suspicious activity

3. **Integrity Controls**
   - Prevent unauthorized changes to PHI
   - Verify data hasn't been altered
   - Detection of unauthorized access

4. **ID Authentication**
   - Confirm user identities before access
   - Unique credentials per user
   - Password complexity requirements
   - Regular password updates

5. **Transmission Security**
   - Encrypt all data leaving internal network
   - Secure VPN or encrypted channels
   - Protect against interception

### Audit Log Retention

**Requirements:**
- Maintain audit logs for minimum 6 years
- Must be readily accessible for investigations
- Should include all activities involving PHI
- Regular backups of audit data
- Protected from unauthorized access or modification

### Monitoring Best Practices

**Regular Reviews Should Check For:**
- Unusual access patterns
- Repeated failed login attempts
- Access from unrecognized devices
- Off-hours access without justification
- Bulk message sending
- Messages to wrong recipients
- Unusual data export or download activity

### Why Standard SMS Cannot Provide Audit Trails

**Standard SMS platforms lack:**
- No tracking of message delivery status
- No logs of who accessed messages
- No record of message modifications
- Cannot verify message receipt
- No way to confirm intended recipient received it
- No accountability for message handling

---

## 5. Staff Training Requirements

### Mandatory Training Components

#### Initial Training (Before System Access)

**All staff must complete training on:**

1. **HIPAA Basics**
   - What is PHI and how to identify it
   - Privacy Rule requirements
   - Security Rule requirements
   - Breach notification requirements
   - Individual rights under HIPAA

2. **Text Messaging Specific Training**
   - How to use HIPAA-compliant messaging platform
   - What can/cannot be said via text
   - Minimum necessary standard
   - How to handle patient-initiated texts
   - Risk warnings to provide patients

3. **Security Protocols**
   - Password management
   - Device security (auto-lock, encryption)
   - Physical safeguards for mobile devices
   - What to do if device is lost/stolen
   - Public Wi-Fi risks

4. **Incident Response**
   - How to recognize a breach
   - Immediate steps if message sent to wrong person
   - Escalation procedures
   - Who to notify internally
   - Documentation requirements

#### Content-Specific Training

**Craft Compliant Messages:**
- No diagnoses in subject lines or previews
- Limit details in message content
- Use generic language when possible
- Minimum necessary information only
- Examples of compliant vs. non-compliant messages

**Handle Misdirected Messages:**
- Immediate recall if platform allows
- Contact recipient to delete message
- Notify supervisor immediately
- Document incident in breach log
- Assess if breach notification required

**Device Safeguards:**
- Enable auto-lock on all devices (recommended: 2 minutes or less)
- Use strong passwords/biometric authentication
- Keep software updated
- Never jailbreak or root devices
- Don't use personal devices without MDM

### Ongoing Training Requirements

**Annual Refresher Training:**
- Review HIPAA requirements
- Update on policy changes
- New case studies of violations
- Platform updates or features
- Review of audit findings

**Additional Training Triggers:**
- New employee onboarding
- Job role changes
- New technology implementation
- After any security incident
- When new regulations take effect
- Upon policy updates

### Documentation Requirements

**Must maintain records of:**
- Training curriculum/materials
- Attendance records (who, when)
- Training completion certificates
- Test scores (if applicable)
- Signed attestations of understanding
- Refresher training dates

**Retention period:** Minimum 6 years from completion date

### Who Needs Training

**All workforce members who:**
- Send or receive text messages with patients
- Have access to messaging platform
- Handle patient information
- Provide administrative support
- Work with billing or scheduling
- IT staff managing the systems

**Note:** Temporary staff, contractors, and volunteers also require training if they access PHI.

### Training Delivery Methods

**Acceptable formats:**
- In-person classroom sessions
- Online/e-learning modules
- Webinars or virtual training
- Self-paced courses with assessments
- Combination of formats

**Best Practice:** Include practical demonstrations of your specific messaging platform.

### Consequences of Inadequate Training

**Risks:**
- Staff inadvertently violate HIPAA
- Increased breach likelihood
- Higher penalties during OCR audits
- Lack of documented training = evidence of non-compliance
- Individual staff liability exposure

**OCR Expectations:**
- Training must be "appropriate for members of the workforce to carry out their functions"
- Documentation proves due diligence
- First violations may result in warnings + mandatory training
- Repeated violations lead to serious sanctions

---

## 6. PHI in Text Messages (Treatment Names, Diagnosis)

### What Constitutes PHI

**Protected Health Information includes:**

1. **Individual Identifiers**
   - Name (first, last, maiden)
   - Address (street, city, state, ZIP)
   - Phone numbers
   - Email addresses
   - Social Security numbers
   - Medical record numbers
   - Patient account numbers
   - Date of birth
   - Full-face photos

2. **Health Information**
   - Past, present, or future physical/mental health conditions
   - Provision of health care to individual
   - Payment for health care services
   - Diagnoses and test results
   - Treatment plans
   - Medications prescribed
   - Procedures performed
   - Clinical notes

**Critical Rule:** Information becomes PHI when it combines:
- An individual identifier + Any health information

### Treatment Names and Aesthetic Procedures

#### For Medical Spas: What's Considered PHI

**These ARE PHI when linked to patient identity:**

**Injectable Treatments:**
- Botox/Dysport/Xeomin (neurotoxins)
- Dermal fillers (Juvederm, Restylane, Sculptra)
- Kybella (deoxycholic acid)
- PRF/PRP injections

**Skin Treatments:**
- Chemical peels
- Laser treatments (hair removal, resurfacing, pigmentation)
- Microneedling
- RF microneedling
- IPL (Intense Pulsed Light)

**Body Contouring:**
- CoolSculpting
- Body contouring procedures
- Cellulite treatments

**Medical Treatments:**
- Prescription skincare (tretinoin, hydroquinone)
- Medical-grade facials
- Acne treatments
- Scar treatments

**Why these are PHI:**
- Botox Cosmetic is FDA-regulated prescription drug
- Procedures alter structure/function of body parts
- Treatments involve medical decision-making
- Create medical records

### What CAN vs. CANNOT Be Texted

#### Without HIPAA-Compliant Platform:

**CAN text (no PHI):**
- "Your appointment is tomorrow at 3 PM"
- "We have an opening on Tuesday at 2 PM"
- "Please arrive 15 minutes early"
- "Your balance is $150. Please call to discuss"

**CANNOT text:**
- "Your Botox appointment is tomorrow"
- "Reminder: Lip filler touch-up at 3 PM"
- "How is your Juvederm settling?"
- "Your laser hair removal package starts next week"

#### With HIPAA-Compliant Platform:

**CAN text (with proper consent):**
- "Hi Sarah! Reminder: Botox appointment tomorrow at 3 PM"
- "Your dermal filler treatment went well. Here's your aftercare instructions..."
- "We can schedule your follow-up laser session next week"
- "Your prescription for tretinoin is ready for pickup"

### Minimum Necessary Standard

**Key Principle:** Only disclose the minimum PHI necessary to accomplish the intended purpose.

**Apply to text messages:**

**Instead of:**
- "Your full face Botox treatment (50 units) for forehead wrinkles is tomorrow"

**Send:**
- "Appointment reminder for tomorrow at 3 PM. Reply CONFIRM"

**Instead of:**
- "Your test results for your facial redness show you have rosacea"

**Send:**
- "Your test results are ready. Please call to discuss: 555-0100"

**Instead of:**
- "Since your Juvederm in lips last time, we should add more to nasolabial folds"

**Send:**
- "We'd like to discuss treatment options. Can you schedule a consultation?"

### Special Considerations for Med Spas

#### Marketing vs. Treatment Communications

**Marketing messages (generally not PHI):**
- "New Year special: 20% off all services!"
- "We're offering complimentary consultations this month"
- "Learn about our new laser technology at our open house"

**Treatment messages (PHI if patient identified):**
- Cannot mention specific patient's previous treatments
- Cannot reference ongoing treatment plans
- Cannot discuss patient's aesthetic goals tied to their identity

#### Social Media Acknowledgments

**CRITICAL RULE:** Never confirm patient status publicly

**If patient posts:**
"Just got Botox at [Your Med Spa]! Love the results!"

**DO NOT respond:**
- "So glad you loved your treatment, Sarah!"
- "Thanks for choosing us! See you for your follow-up!"

**CAN respond:**
- "Thank you for the kind words!"
- Generic likes or reactions only

**Why:** Acknowledging confirms patient status = HIPAA violation

#### Before and After Photos

**PHI Rules Apply:**
- Full-face photos = PHI even if anonymized
- Must have written authorization for any use
- Cannot be posted without explicit consent
- Consent must specify where photos will be used
- Patients can revoke consent at any time

**Blacking out eyes is NOT sufficient:**
- Modern facial recognition can still identify
- Body features can also identify individuals
- Always get explicit written consent

### Medical Diagnosis in Aesthetics

**Medical conditions treated in med spas:**
- Hyperhidrosis (excessive sweating) - treated with Botox
- Rosacea - treated with lasers, prescriptions
- Acne - treated with medical-grade products, procedures
- Melasma/hyperpigmentation - treated with peels, lasers
- Scarring - treated with microneedling, lasers

**All of these are diagnoses = definitely PHI**

**Never text:**
- "Your hyperhidrosis treatment with Botox is scheduled"
- "Here's your prescription for rosacea"
- "Your acne treatment plan includes..."

---

## 7. Photo Sharing Compliance

### HIPAA Photography Rules

#### When Photos Are PHI

**Photos constitute PHI if they:**
- Show full face (identifiable individual)
- Are linked to medical record
- Contain identifiable health information
- Show body parts with identifying features (tattoos, birthmarks, scars)
- Include any of the 18 HIPAA identifiers

**Important:** Photos don't have to show the face to be PHI. Any image that could reasonably identify a patient is protected.

### Regulatory Guidance

**Joint Commission & CMS Recommendations:**
- Prohibit SMS/MMS texting of identifiable photos from personal devices
- Require encrypted platforms for patient photos
- Prohibit patient care orders via text with photos
- Mandate organizational policies on photo messaging

**Updated Guidance (2026):**
- Even with encrypted platforms, texting patient care orders remains prohibited
- Use secure, proprietary messaging services only
- Photos must be encrypted both in transit and at rest

### Types of Medical Photos in Med Spas

#### Clinical Documentation Photos

**Common use cases:**
- Before and after treatment photos
- Documenting initial consultation
- Tracking treatment progress
- Complications or adverse reactions
- Insurance claim documentation

**HIPAA Requirements:**
- Can be taken without separate consent for Treatment, Payment, Operations (TPO)
- Must inform patients photos may be used for TPO
- Store securely in encrypted systems
- Limit access to authorized personnel only
- Do NOT require separate consent for clinical use

**Compliant Practices:**
- Use practice-owned devices only
- Encrypted photo storage
- Access controls (role-based)
- Audit trails of photo access
- Secure cloud storage with HIPAA compliance

#### Marketing/Social Media Photos

**Require explicit written authorization:**
- Cannot use clinical photos for marketing without separate consent
- Consent must specify: where photos will be used (website, social media, print)
- Who will see them (public, limited audience)
- Duration of use
- Right to revoke consent

**Authorization Form Must Include:**
```
PHOTO RELEASE AUTHORIZATION FOR MARKETING

I authorize [MED SPA NAME] to use photographs/videos of me for:
☐ Website
☐ Social media (Instagram, Facebook, etc.)
☐ Print marketing materials
☐ Before/after galleries
☐ Educational presentations

I understand:
☐ These photos may be viewed by the public
☐ Photos cannot be fully retracted once posted online
☐ I will not be compensated for use of my photos
☐ I can revoke this authorization at any time in writing
☐ Revocation won't affect photos already distributed

Patient Signature: ________________  Date: ________
```

### Text Messaging Photos: Compliance Requirements

#### With HIPAA-Compliant Platform

**Requirements:**
1. **End-to-End Encryption**
   - Photos encrypted in transit
   - Photos encrypted at rest on servers
   - Encryption maintained on recipient device

2. **Platform Features**
   - Secure photo sharing capability
   - Message/photo expiration options
   - Remote wipe capability
   - Access controls
   - Audit trails of photo access

3. **Patient Consent**
   - Authorization to receive photos via text
   - Understanding of security measures
   - Risk acknowledgment
   - Opt-out mechanism

#### Never Use Standard MMS

**Why standard MMS fails:**
- Photos stored unencrypted on telecom servers
- Can be intercepted during transmission
- Saved to recipient's device photo gallery
- No way to retract or expire photos
- No access controls
- No audit trail

### Sending Photos TO Patients

**Common scenarios:**
- Post-treatment instructions with visual guides
- Aftercare diagrams
- Product instructions
- Before photos as comparison
- Educational materials

**Best Practices:**
1. **Use HIPAA-compliant platform** with encrypted photo sharing
2. **Set photo expiration** (e.g., 24-48 hours)
3. **Limit photo details** to minimum necessary
4. **Watermark clinical photos** to prevent sharing
5. **Document all photo transmissions** in patient record

### Receiving Photos FROM Patients

**Common scenarios:**
- Patients sending treatment questions
- Progress updates between visits
- Suspected complications
- Consultation requests

**Compliance Protocol:**

**If patient texts photo via regular SMS:**
1. Acknowledge receipt: "Thank you for contacting us"
2. Warn about security: "Please note standard texts aren't secure. For your privacy, please use our secure portal or call us."
3. Do NOT respond with clinical advice via regular text
4. Direct them to secure communication method
5. Document in patient record

**If using compliant platform:**
1. Can provide clinical feedback
2. Document photo and response in EHR
3. Maintain in patient record
4. Follow retention policies

### Storage and Retention

**Photos containing PHI must:**
- Be stored in HIPAA-compliant systems
- Have restricted access (role-based)
- Be retained per state medical record retention laws
- Be encrypted at rest
- Have audit trails of all access
- Be securely disposed after retention period

**Do NOT store patient photos:**
- On personal devices
- In standard cloud storage (Dropbox, Google Drive, iCloud)
- On unsecured servers
- In standard messaging apps

### Best Practices for Med Spa Photo Compliance

#### Clinical Photography Protocol

1. **Use dedicated practice-owned devices**
   - Tablets or cameras for clinical use only
   - Not personal staff phones
   - Encrypted device storage
   - Mobile device management (MDM)

2. **Direct upload to EHR**
   - Photos go straight to patient record
   - No intermediate storage on device
   - Immediate encryption
   - Automatic backup

3. **Standardized photo procedures**
   - Consistent lighting, angles, backgrounds
   - Photo metadata includes: patient ID, date, provider, treatment area
   - Before and after in same session when possible

4. **Access controls**
   - Only authorized staff can view clinical photos
   - Audit logs of who accessed which photos
   - Regular review of access patterns

#### Secure Photo Sharing Technology

**Recommended approach:**
- Use HIPAA-compliant cloud storage
- Single copy shared with authorized parties
- No duplicate copies created
- View-only access (can't download)
- Automatic access expiration
- Audit trail of all views

**Platforms to consider:**
- Practice EHR with patient portal photo sharing
- Dedicated medical photo management systems
- HIPAA-compliant secure messaging apps
- Never: WhatsApp, Facebook Messenger, iMessage, standard SMS/MMS

---

## 8. Message Retention Policies

### HIPAA Retention Requirements

#### Federal Minimum: 6 Years

**HIPAA mandates:**
- Retain all documents/records for minimum 6 years from:
  - Date created, OR
  - Date last in effect (for policies/procedures)

**Applies to:**
- Text messages containing PHI
- Consent forms
- Authorization forms
- Business Associate Agreements
- Policies and procedures
- Training records
- Audit logs
- Breach notification records
- Compliance documentation

### What Must Be Retained

#### Text Messages

**Retain all messages that contain:**
- Any PHI (protected health information)
- Treatment discussions
- Appointment scheduling with patient identifiers
- Clinical advice or consultations
- Billing communications
- Patient consent/authorization communications

**Retention includes:**
- Original message content
- Timestamp (date and time sent/received)
- Sender and recipient identifiers
- Read receipts or delivery confirmations
- Any attachments (photos, documents)
- Message thread context

#### Audit Trails

**Must retain:**
- Login/logout records
- Message access logs
- Failed authentication attempts
- Administrative actions
- System configuration changes
- Security incidents

### State Medical Record Retention Laws

**Important: State laws may require LONGER retention than HIPAA**

Covered entities must follow the longer of:
- HIPAA's 6-year requirement, OR
- State medical record retention laws

#### State Examples (Medical Records):

**California:**
- Adult patients: 7 years from last service date
- Minors: 7 years after age 18 (or 1 year after last treatment, whichever is longer)
- Minors often protected until age 25-26

**Texas:**
- Adult patients: 10 years from last treatment
- Minors: Until age 20 or 10 years after last treatment, whichever is longer

**Florida:**
- Adult patients: 5 years from last service
- Minors: 7 years from last service or until age 25, whichever is longer
- Termination of practice: Must retain records as if still active or transfer to another provider

**Other Common Retention Periods:**
- 7 years: Most common across states
- 10 years: Conservative best practice
- Permanent: For immunization records, research data

**Note:** Text messages containing medical information should follow the same retention as medical records in your state.

### Retention Best Practices

#### Automated Retention Policies

**Configure messaging platform to:**
1. **Automatically archive** all messages containing PHI
2. **Never auto-delete** within retention period
3. **Set retention period** based on longest applicable requirement (state law vs. HIPAA)
4. **Backup archives** regularly to secure storage
5. **Index messages** for easy retrieval during audits

#### What to Archive

**Message metadata:**
- Unique message ID
- Sender (staff member name/ID)
- Recipient (patient identifier)
- Timestamp (sent, delivered, read)
- Message content (full text)
- Attachments (photos, files)
- Conversation thread ID
- Platform used

**Context information:**
- Patient medical record number
- Related appointment or visit
- Treatment or service discussed
- Authorization/consent references

### Secure Storage Requirements

**Archived messages must be:**

1. **Encrypted**
   - At rest on storage media
   - During backup processes
   - Throughout retention period

2. **Access-Controlled**
   - Role-based access only
   - Audit trail of all access to archives
   - Multi-factor authentication
   - Regular access reviews

3. **Backed Up**
   - Multiple backup copies
   - Geographically diverse locations
   - Regular backup verification
   - Disaster recovery plan

4. **Searchable**
   - Ability to find specific messages quickly
   - Search by patient, date, staff member
   - Required for legal discovery requests

5. **Tamper-Proof**
   - Cannot be altered after sending
   - Digital signatures or checksums
   - Proof of message integrity

### End of Retention Period

**Secure Disposal After Retention Period Expires:**

1. **Verify retention period complete**
   - Check both HIPAA (6 years) and state law requirements
   - Confirm no ongoing litigation or investigations
   - Review any legal holds on records

2. **Secure deletion methods**
   - Overwrite digital files multiple times
   - Use certified data destruction services
   - Destroy backup copies as well
   - Document destruction in disposal log

3. **Destruction documentation**
   - Date of destruction
   - Method used
   - Who performed destruction
   - Records/messages destroyed
   - Witness or certification

4. **Never dispose by:**
   - Simply deleting files
   - Throwing away devices
   - Selling or donating devices with data
   - Recycling without data wiping

### Legal Discovery and Litigation Holds

**If litigation or investigation pending:**
- Do NOT delete messages even if retention period expired
- Implement legal hold on all relevant records
- Notify all staff of preservation requirement
- Consult legal counsel before any deletions
- Document legal hold in compliance records

**E-discovery requests:**
- Must be able to produce archived messages
- Include message content, metadata, audit trails
- May need forensic copies
- Timely response required (avoid spoliation claims)

### Platform Selection Consideration

**Choose messaging platform that supports:**
- Configurable retention policies
- Automated archiving
- Long-term secure storage
- Easy export for legal requests
- Integration with EHR/document management
- Backup and disaster recovery
- Compliance reporting

### Documentation Requirements

**Maintain retention policy documentation:**
- Written retention policy (6+ years)
- Staff training on retention requirements
- Procedures for archiving messages
- Backup and recovery procedures
- Secure disposal procedures
- Audit logs of disposal actions

---

## 9. BAA Requirements with Texting Vendors

### What is a Business Associate Agreement (BAA)?

**Definition:**
A Business Associate Agreement is a legally binding contract required under HIPAA when a covered entity (your medical spa) shares PHI with a vendor or service provider (business associate) that will process, store, or transmit that PHI on your behalf.

**Purpose:**
- Establishes how business associate will handle PHI
- Defines permitted uses and disclosures
- Requires business associate to implement HIPAA safeguards
- Establishes liability and breach notification requirements
- Protects covered entity from vendor non-compliance

### When is a BAA Required for Texting?

**You MUST have a BAA if your texting vendor:**
- Transmits messages containing PHI
- Stores messages containing PHI
- Processes patient information
- Has any access to PHI
- Provides the platform/infrastructure for communications

**Examples requiring BAA:**
- Twilio for SMS/MMS messaging
- TigerConnect for secure messaging
- Any HIPAA-compliant texting platform
- Patient communication platforms
- Appointment reminder services
- Telehealth platforms with messaging

**Examples NOT requiring BAA:**
- Internet service provider (conduit exception)
- Electric company powering your servers
- Vendors with no access to PHI

### Key Elements of a Compliant BAA

**A valid BAA must include:**

1. **Permitted Uses and Disclosures**
   - Specifically what BA can do with PHI
   - Must be limited to activities covered entity authorized
   - Cannot use PHI for BA's own purposes (generally)

2. **Safeguards Requirement**
   - BA must implement appropriate safeguards
   - Protect PHI from misuse or disclosure
   - Follow HIPAA Security Rule requirements
   - Encryption, access controls, etc.

3. **Reporting Requirements**
   - BA must report any breaches or security incidents
   - Timeframe for reporting (typically immediately or within 24-48 hours)
   - Information required in breach reports

4. **Subcontractor Requirements**
   - If BA uses subcontractors with PHI access
   - Must have BAA with subcontractors
   - BA remains liable for subcontractor compliance

5. **Access to PHI**
   - BA must provide access to PHI when needed
   - Support covered entity's compliance obligations
   - Timely response to patient requests

6. **Amendment Rights**
   - BA must make amendments to PHI as directed
   - Support patient rights to amend records

7. **Audit Rights**
   - Covered entity can audit BA compliance
   - BA must make records available
   - Include audit logs, policies, security measures

8. **Return or Destruction**
   - At termination, BA must return or destroy all PHI
   - Include all copies in any form
   - If not feasible, extend protections and limit uses

9. **Breach Notification**
   - BA must notify covered entity of breaches
   - Specific timeline (e.g., within 60 days)
   - Information needed for breach assessment

10. **Indemnification (Recommended)**
    - BA liable for damages from their non-compliance
    - Protection for covered entity

### Twilio and HIPAA Compliance

#### Twilio-Specific Requirements

**Twilio offers HIPAA-eligible services:**
- Programmable SMS and MMS
- Programmable Voice
- Programmable Video
- SIP Trunking
- Certain runtime tools

**To use Twilio for HIPAA:**

1. **Sign Twilio's Business Associate Addendum (BAA)**
   - Must have Twilio Pro or Enterprise account tier
   - Standard accounts cannot get BAA
   - BAA covers only HIPAA-eligible products

2. **Use Only HIPAA-Eligible Products**
   - Not all Twilio products are HIPAA-eligible
   - Check current list: https://www.twilio.com/en-us/hipaa
   - Using non-eligible products = HIPAA violation even with BAA

3. **Designate Accounts as HIPAA**
   - Must explicitly designate accounts/subaccounts as HIPAA-eligible
   - Not automatic after signing BAA
   - Your responsibility to designate properly
   - Different data handling for HIPAA accounts

4. **Follow Twilio's "Architecting for HIPAA" Guidelines**
   - Shared responsibility model
   - Customer must implement proper controls on their end
   - End-to-end encryption
   - Access controls
   - Audit logging

5. **Recent Twilio HIPAA Updates (2025-2026)**
   - MMS now HIPAA-eligible (photo sharing)
   - Message scheduling HIPAA-eligible
   - Check changelog for latest eligible features

#### Twilio's Shared Responsibility Model

**Twilio's Responsibilities:**
- Secure infrastructure
- Data encryption in transit and at rest
- Physical security of data centers
- HIPAA-compliant data handling procedures
- Security monitoring and incident response
- Proper subcontractor BAAs

**Your Responsibilities:**
- Application-level security
- User authentication and access controls
- Proper encryption implementation
- Audit logging and monitoring
- Staff training
- Breach assessment and notification
- Patient consent management
- Only using HIPAA-eligible products

**Critical Understanding:** Twilio provides HIPAA-eligible infrastructure, but you must build HIPAA-compliant applications on top of it.

### Other Common Texting Vendors and BAA Status

#### Platforms That Typically Offer BAAs:

**Dedicated Healthcare Texting:**
- TigerConnect (formerly TigerText)
- Imprivata Cortext
- Klara
- OhMD
- Spruce Health
- Spok
- Halo Health
- Lua

**Communication Platforms:**
- Twilio (as discussed above)
- Vonage (with Enterprise plans)
- AWS SNS (with proper configuration)

#### Platforms That DO NOT Offer BAAs:

**Never use these for PHI:**
- Standard SMS/MMS
- iMessage
- WhatsApp
- Facebook Messenger
- Instagram Direct
- Snapchat
- Standard Google Voice
- Personal email accounts

### BAA Negotiation Tips

#### What to Request in BAA:

1. **Specific HIPAA Provisions**
   - Explicit reference to HIPAA requirements
   - Which products/services are covered
   - Which are not covered (exclusions)

2. **Breach Notification Timeline**
   - Immediate notification (within 24 hours preferred)
   - Not just "within 60 days" HIPAA minimum
   - Faster notification = faster response

3. **Security Measures Documentation**
   - What safeguards vendor implements
   - Encryption standards used
   - Access control methods
   - Audit logging capabilities

4. **Right to Audit**
   - Your right to audit vendor compliance
   - Frequency allowed
   - Vendor provides audit reports (SOC 2, etc.)

5. **Subcontractor Disclosure**
   - List of current subcontractors
   - Notification of new subcontractors
   - Confirmation of subcontractor BAAs

6. **Data Location**
   - Where data stored (US vs. international)
   - Data sovereignty concerns
   - Compliance with state laws

7. **Indemnification**
   - Vendor liable for their non-compliance
   - Defense costs covered
   - Damages capped or unlimited

### Red Flags in BAA Review

**Avoid vendors who:**
- Refuse to sign a BAA
- Only offer BAAs to enterprise customers (PHI requires BAA regardless)
- Have overly broad disclaimers of liability
- Won't specify their security measures
- Can't provide compliance certifications
- Have complex workarounds instead of simple HIPAA compliance
- Don't understand HIPAA requirements

### BAA Management Best Practices

**Maintain BAA compliance:**

1. **Centralized BAA Repository**
   - Store all executed BAAs in secure location
   - Easy access during audits
   - Track expiration dates
   - Note renewal requirements

2. **Regular BAA Reviews**
   - Annual review of all BAAs
   - Verify vendor still compliant
   - Check for service changes
   - Update as needed

3. **Vendor Due Diligence**
   - Before signing BAA, verify vendor security
   - Request SOC 2 Type II reports
   - HITRUST certification (if available)
   - Check vendor's breach history

4. **Monitor Vendor Compliance**
   - Review vendor security updates
   - Track reported breaches
   - Stay informed on vendor changes
   - Conduct periodic vendor audits

5. **Termination Planning**
   - Understand data return/destruction process
   - Timeline for PHI removal
   - Verification of complete deletion
   - Continuity plan if switching vendors

### BAA Checklist for Texting Vendors

**Before using any texting service, confirm:**

☐ Vendor explicitly states HIPAA compliance
☐ Vendor willing to sign BAA
☐ BAA includes all required HIPAA provisions
☐ Specific products/services covered under BAA
☐ Encryption in transit and at rest confirmed
☐ Audit logging capabilities verified
☐ Breach notification procedures clear
☐ Subcontractor list provided
☐ Data return/destruction procedures documented
☐ Vendor provides compliance certifications (SOC 2, HITRUST)
☐ Support for necessary features (message expiration, remote wipe, etc.)
☐ Cost structure understood and acceptable
☐ Implementation timeline reasonable
☐ Staff training materials available
☐ Integration with existing systems possible

---

## 10. State-Specific Regulations

### Federal HIPAA as Baseline

**Important Principle:**
- HIPAA establishes federal minimum standards
- States can enact MORE stringent privacy laws
- Cannot have LESS stringent laws than HIPAA
- Must comply with both federal HIPAA AND state laws
- When conflict, follow the MORE protective law

### Key 2026 Federal Updates

**Recent HIPAA Changes:**

1. **Reproductive Health Privacy Rule**
   - Strengthens privacy protections for reproductive health information
   - New Notice of Privacy Practices requirements
   - Compliance date: February 16, 2026
   - **Note:** Challenged in Texas (vacated by Texas federal judge June 2025)
   - Status uncertain - check current enforcement status

2. **Proposed Cybersecurity Performance Goals**
   - May require enhanced security for email/text communications
   - Multi-factor authentication
   - Advanced encryption standards
   - Enhanced workforce training
   - **Status:** Final rule potentially in 2026 (possibly scaled back due to industry feedback)

### California

#### State-Specific Privacy Laws

**California Confidentiality of Medical Information Act (CMIA):**
- Broader than HIPAA in some areas
- Applies to all healthcare providers in California
- Specific consent requirements for disclosure
- Civil penalties up to $250,000 per violation
- Private right of action for patients

**California Consumer Privacy Act (CCPA) / CPRA:**
- Generally does NOT apply to PHI covered by HIPAA
- May apply to non-medical information collected by med spas
- Marketing data, email lists, website tracking
- Gives consumers rights to know, delete, opt-out

#### Key Texting Considerations for California:

1. **Medical Record Retention**
   - Adult: 7 years from last service
   - Minors: Until age 18 + 7 years, or 1 year after last treatment, whichever is longer
   - Text messages should follow same retention

2. **Patient Consent**
   - Must be informed consent for electronic communications
   - Can be verbal but written recommended
   - Document consent in medical record

3. **Breach Notification**
   - Notify patients of breaches affecting 500+ California residents
   - Substitute notice may be required
   - California Attorney General notification required

4. **Minors**
   - Special protections for minor patients (under 18)
   - May need parental consent for communications
   - Exceptions for sensitive services (reproductive health, mental health, substance abuse)

5. **Language Access**
   - Threshold language requirements
   - If significant Spanish-speaking population, provide Spanish notices
   - Consider multi-language capabilities in texting platform

#### California-Specific Best Practices:

- Document all patient consents for electronic communication
- Implement robust breach notification procedures
- Train staff on CMIA in addition to HIPAA
- Review marketing communications for CCPA compliance
- Maintain records for full 7+ years

### Texas

#### State-Specific Privacy Laws

**Texas Medical Privacy Act:**
- Applies to healthcare providers
- Requires patient authorization for certain disclosures
- Penalties for violations

**Texas Health and Safety Code:**
- Governs medical records and confidentiality
- Electronic communications standards

#### Key Texting Considerations for Texas:

1. **Medical Record Retention**
   - Adult: 10 years from last treatment
   - Minors: Until age 20 OR 10 years from last treatment, whichever is longer
   - **Note:** Longer retention than federal HIPAA minimum

2. **Reproductive Health Information**
   - **CRITICAL:** Texas challenged federal reproductive health privacy rule
   - Vacated nationally by Texas federal judge (June 2025)
   - Texas enforces strict state laws on reproductive healthcare
   - Exercise extreme caution with any reproductive health communications
   - Consult legal counsel before texting about reproductive services

3. **Patient Authorization**
   - Written authorization required for most PHI disclosures
   - Electronic signatures acceptable
   - Specific elements required in authorization form

4. **Breach Notification**
   - Follow federal HIPAA timeline (60 days)
   - No additional state notification requirements (as of 2026)

5. **Telemedicine**
   - Texas has specific telemedicine regulations
   - If using texting for medical consultations, ensure compliance
   - Informed consent required
   - Documentation standards

#### Texas-Specific Best Practices:

- Extend message retention to 10 years minimum
- Be extremely cautious with reproductive health communications
- Obtain written authorization for electronic communications
- Stay updated on state legislative changes
- Consider consulting Texas healthcare attorney for compliance review

### Florida

#### State-Specific Privacy Laws

**Florida Statute 456.057:**
- Governs medical records and patient access
- Requirements for electronic health records

**Florida Information Protection Act (FIPA):**
- Data breach notification law
- Applies to personal information including medical data
- Specific notification requirements

#### Key Texting Considerations for Florida:

1. **Medical Record Retention**
   - Adult: 5 years from last service (or 7 years for certain services)
   - Minors: 7 years from last service OR until age 25, whichever is longer
   - Upon practice termination: Must retain or transfer records

2. **Breach Notification - Unique Requirements**
   - **Critical:** Florida has STRICTER breach notification than HIPAA
   - Must notify affected individuals **within 30 days** (vs. HIPAA's 60 days)
   - Notification to Florida Department of Legal Affairs if 500+ affected
   - Failure to notify = $500,000 fine + potential additional damages

3. **Patient Access to Records**
   - Must provide copies within reasonable time
   - May include text message communications in medical record
   - Reasonable fees allowed

4. **Telemedicine & Remote Communications**
   - Florida supports telemedicine
   - Informed consent required
   - Standard of care applies regardless of communication method

5. **Minor Confidentiality**
   - Special protections for minors
   - Certain services confidential (STD testing, mental health, substance abuse, prenatal care)
   - May not require parental consent for these communications

#### Florida-Specific Best Practices:

- Implement 30-day breach notification procedures (not 60-day)
- Retain minor records until at least age 25
- Plan for record retention/transfer if closing practice
- Document patient consent for electronic communications
- Train staff on Florida-specific breach timelines

### Multi-State Practice Considerations

**If your med spa has locations in multiple states:**

1. **Follow Most Stringent Law**
   - Apply the strictest standard across all locations
   - Simplifies compliance and training
   - Reduces risk of violations

2. **Example: Retention Periods**
   - California: 7 years
   - Florida: 5-7 years
   - Texas: 10 years
   - **Solution:** Retain all records for 10 years minimum

3. **Example: Breach Notification**
   - Federal HIPAA: 60 days
   - Florida: 30 days
   - **Solution:** Notify all breaches within 30 days regardless of location

4. **State-Specific Training**
   - Provide location-specific compliance training
   - Document state law requirements
   - Update policies for each state

### Staying Current on State Regulations

**State laws change frequently:**

1. **Monitor State Legislatures**
   - Subscribe to state health department updates
   - Join state medical spa associations
   - American Med Spa Association (AmSpa) resources

2. **Annual Compliance Review**
   - Review state law changes annually
   - Update policies and procedures
   - Retrain staff on new requirements

3. **Legal Counsel**
   - Consult healthcare attorney in each state
   - Annual compliance review recommended
   - Immediate review for new locations

4. **Professional Associations**
   - State medical boards
   - State medical associations
   - Specialty associations (aesthetics, dermatology)

### State Regulations Summary Table

| Requirement | Federal HIPAA | California | Texas | Florida |
|------------|---------------|------------|-------|---------|
| **Record Retention (Adults)** | 6 years | 7 years | 10 years | 5-7 years |
| **Record Retention (Minors)** | 6 years | Age 18 + 7 years | Age 20 or 10 years | Age 25 or 7 years |
| **Breach Notification** | 60 days | 60 days | 60 days | **30 days** |
| **Patient Consent for Texts** | Recommended | Required | Required | Recommended |
| **Reproduction Health** | Enhanced protections (2026) | Protections | Restricted | Standard |
| **Additional Privacy Laws** | HIPAA only | CMIA, CCPA | Medical Privacy Act | FIPA |

---

## 11. Implementation Checklist

### Phase 1: Assessment & Planning (Week 1-2)

#### Determine HIPAA Applicability

☐ **Assess if your med spa is a covered entity**
   - Do you offer prescription treatments (Botox, Rx skincare)?
   - Do you bill insurance electronically?
   - Do you maintain electronic health records?
   - Do you conduct electronic healthcare transactions?

☐ **Identify current texting practices**
   - Survey staff on current text messaging with patients
   - Document which platforms currently used
   - Identify PHI being transmitted via text
   - Assess compliance gaps

☐ **Review state-specific requirements**
   - Determine which states you operate in
   - Research state-specific privacy laws
   - Identify stricter state requirements
   - Document applicable retention periods

#### Assess Budget & Resources

☐ **Budget allocation**
   - HIPAA-compliant texting platform costs
   - Staff training expenses
   - Legal consultation fees
   - Implementation support
   - Ongoing maintenance costs

☐ **Identify internal resources**
   - Designate HIPAA compliance officer
   - Assign implementation project manager
   - Identify technical support staff
   - Schedule staff training time

### Phase 2: Platform Selection (Week 3-4)

#### Research HIPAA-Compliant Texting Platforms

☐ **Evaluate platform features**
   - End-to-end encryption
   - Business Associate Agreement offered
   - Audit trail capabilities
   - Message expiration/recall
   - Remote wipe functionality
   - Integration with existing EHR
   - Photo/file sharing security
   - User access controls
   - Mobile app availability (iOS/Android)
   - Desktop/web access

☐ **Compare vendors**
   - Request demos from 3-5 vendors
   - Compare pricing models
   - Review customer references
   - Check compliance certifications (SOC 2, HITRUST)
   - Evaluate customer support
   - Test user experience

☐ **Vendor due diligence**
   - Request SOC 2 Type II audit report
   - Review security documentation
   - Check breach history
   - Verify subcontractor BAAs
   - Confirm data storage locations
   - Understand data retention/deletion policies

#### Recommended Platforms to Evaluate:

**Dedicated Healthcare Texting:**
- TigerConnect
- Klara
- OhMD
- Spruce Health
- Imprivata Cortext

**Infrastructure Platforms:**
- Twilio (requires custom development)
- Vonage Business Communications

### Phase 3: Legal & Compliance Documentation (Week 5-6)

#### Policies & Procedures

☐ **Develop/Update policies**
   - Text messaging policy
   - Acceptable use policy
   - Patient consent procedures
   - Breach response plan
   - Data retention policy
   - Device security policy
   - Staff training policy

☐ **Create patient-facing documents**
   - Text messaging consent form
   - Risk disclosure language
   - Privacy practices notice (update)
   - Opt-out instructions

☐ **Create staff documents**
   - Standard operating procedures
   - Quick reference guides
   - Incident response checklist
   - Escalation contacts

#### Business Associate Agreements

☐ **Execute BAA with texting vendor**
   - Review BAA thoroughly
   - Negotiate terms if needed
   - Have legal counsel review
   - Sign and store securely
   - Set calendar reminder for renewal

☐ **Review existing BAAs**
   - EHR vendor
   - Cloud storage providers
   - IT support vendors
   - Any other vendors with PHI access

### Phase 4: Technical Implementation (Week 7-8)

#### Platform Configuration

☐ **Set up texting platform**
   - Create admin account
   - Configure organization settings
   - Set up user roles and permissions
   - Enable all security features
   - Configure audit logging
   - Set message retention policies
   - Configure message expiration (if applicable)
   - Set up backup/archiving

☐ **User account creation**
   - Create accounts for all authorized staff
   - Assign appropriate roles/permissions
   - Set up multi-factor authentication
   - Configure password policies
   - Test account access

☐ **Integration (if applicable)**
   - Integrate with EHR/practice management system
   - Test data flow
   - Verify PHI handling
   - Configure single sign-on (if available)

☐ **Mobile device management**
   - Deploy MDM solution (if needed)
   - Configure device encryption
   - Set auto-lock policies
   - Enable remote wipe capability
   - Install texting app on staff devices

### Phase 5: Training & Education (Week 9-10)

#### Staff Training Program

☐ **Develop training materials**
   - HIPAA basics presentation
   - Text messaging compliance guidelines
   - Platform user guide
   - Hands-on practice scenarios
   - Quiz/assessment
   - Quick reference cards

☐ **Conduct training sessions**
   - HIPAA overview (all staff)
   - Platform-specific training (users)
   - Hands-on practice time
   - Q&A sessions
   - Competency assessment

☐ **Document training**
   - Attendance records
   - Training completion certificates
   - Quiz/assessment scores
   - Signed attestations of understanding

#### Training Topics to Cover:

**HIPAA Fundamentals:**
- What is PHI
- Privacy Rule overview
- Security Rule overview
- Breach notification requirements
- Individual rights

**Text Messaging Compliance:**
- What can/cannot be said via text
- Minimum necessary standard
- Patient consent requirements
- Risk warnings
- Opt-out procedures

**Platform Usage:**
- How to log in securely
- Sending compliant messages
- Sharing photos securely
- Message lifecycle management
- Finding archived messages
- Reporting security incidents

**Security Practices:**
- Password management
- Device security
- Physical safeguards
- Public Wi-Fi risks
- Lost/stolen device procedures

**Incident Response:**
- Recognizing potential breaches
- Immediate actions for wrong recipient
- Who to notify
- Documentation requirements

### Phase 6: Patient Communication & Consent (Week 11-12)

#### Patient Enrollment

☐ **Develop patient communication plan**
   - Announcement of new secure texting
   - Benefits for patients
   - How to enroll
   - Opt-in/opt-out process

☐ **Create consent collection process**
   - In-person consent during visits
   - Online consent form option
   - Phone consent script
   - Consent confirmation messages

☐ **Set up consent tracking**
   - Database of patient text preferences
   - Opt-in date
   - Opt-out date (if applicable)
   - Consent form storage location

☐ **Launch patient enrollment**
   - Soft launch with existing patients
   - Collect consent during appointments
   - Send enrollment invitations via secure method
   - Track enrollment metrics

### Phase 7: Testing & Pilot (Week 13-14)

#### Pilot Program

☐ **Select pilot group**
   - 5-10 staff members
   - Mix of roles (front desk, nurses, providers)
   - 50-100 patients enrolled

☐ **Test key workflows**
   - Appointment reminders
   - Confirmation requests
   - Treatment follow-ups
   - Billing communications
   - Patient-initiated questions
   - Photo sharing (if applicable)

☐ **Gather feedback**
   - Staff usability survey
   - Patient satisfaction survey
   - Technical issues log
   - Process improvement suggestions

☐ **Refine processes**
   - Update procedures based on feedback
   - Adjust training materials
   - Fix technical issues
   - Optimize workflows

### Phase 8: Full Rollout (Week 15-16)

#### Organization-Wide Launch

☐ **Train remaining staff**
   - Complete training for all staff
   - Hands-on practice
   - Documentation

☐ **Enroll all patients**
   - Systematic outreach to patient base
   - Consent collection process
   - Track enrollment progress

☐ **Decommission non-compliant methods**
   - Discontinue use of personal phones for patient texts
   - Disable SMS features on practice numbers (if not integrated)
   - Remove personal messaging apps from work devices
   - Update all patient communications with new contact methods

☐ **Monitor closely**
   - Daily check-ins first week
   - Weekly check-ins first month
   - Address issues immediately
   - Track compliance metrics

### Phase 9: Ongoing Compliance (Ongoing)

#### Regular Audits & Reviews

☐ **Monthly compliance checks**
   - Review audit logs for unusual activity
   - Spot-check message content for compliance
   - Verify consent documentation current
   - Check for any security incidents

☐ **Quarterly reviews**
   - Staff refresher training
   - Policy review and updates
   - Vendor compliance verification
   - Platform usage metrics
   - Patient satisfaction assessment

☐ **Annual comprehensive audit**
   - Full HIPAA compliance audit
   - BAA review and renewal
   - Vendor due diligence update
   - Policy comprehensive review
   - Staff retraining/certification
   - Risk assessment update

☐ **Stay current on regulations**
   - Subscribe to HIPAA updates
   - Monitor state law changes
   - Attend compliance webinars
   - Professional association memberships

#### Continuous Improvement

☐ **Track metrics**
   - Texting platform adoption rate
   - Patient enrollment percentage
   - Message volume
   - Incident reports
   - Training completion rates

☐ **Solicit feedback**
   - Regular staff feedback sessions
   - Patient satisfaction surveys
   - Process improvement suggestions

☐ **Update procedures**
   - Incorporate lessons learned
   - Streamline workflows
   - Update training materials
   - Refine policies

### Quick Start Summary (Minimum Viable Compliance)

**If you need to get compliant FAST (4-6 weeks):**

**Week 1-2:**
- Select and purchase HIPAA-compliant platform
- Execute Business Associate Agreement
- Draft text messaging policy

**Week 3-4:**
- Configure platform with security settings
- Create patient consent form
- Develop staff training (basic)

**Week 5:**
- Train all staff (8-hour intensive)
- Begin collecting patient consent
- Launch pilot with one provider

**Week 6:**
- Full rollout to all staff
- Discontinue non-compliant texting
- Implement monitoring process

**Critical:** This accelerated timeline is NOT ideal but can work for urgent compliance needs. Full implementation is preferred.

---

## 12. Penalties and Violations

### HIPAA Violation Penalty Tiers

#### Tier 1: Lack of Knowledge
**Individual did not know (and could not have known) about the violation**

- **Minimum Fine:** $100 per violation
- **Maximum Fine:** $50,000 per violation
- **Annual Maximum:** $25,000 for repeat violations of same provision

**Example:** Staff member sends unencrypted text not knowing it contained PHI, and practice had no training program.

#### Tier 2: Reasonable Cause
**Violation due to reasonable cause and not willful neglect**

- **Minimum Fine:** $1,000 per violation
- **Maximum Fine:** $50,000 per violation
- **Annual Maximum:** $100,000 for repeat violations

**Example:** Despite training, staff accidentally texts wrong patient due to similar names in contact list.

#### Tier 3: Willful Neglect (Corrected)
**Violation due to willful neglect but corrected within 30 days**

- **Minimum Fine:** $10,000 per violation
- **Maximum Fine:** $50,000 per violation
- **Annual Maximum:** $250,000 for repeat violations

**Example:** Practice knows staff using personal phones to text patients but doesn't address it until OCR investigation begins, then immediately implements compliant system.

#### Tier 4: Willful Neglect (Not Corrected)
**Violation due to willful neglect and not corrected within 30 days**

- **Minimum Fine:** $50,000 per violation
- **Maximum Fine:** $1.5 million per violation
- **Annual Maximum:** $1.5 million for repeat violations

**Example:** Practice continues using standard SMS after OCR warning, makes no changes to come into compliance.

### State-Level Penalties

#### California (CMIA)
- **Civil Penalties:** Up to $250,000 per violation
- **Criminal Penalties:** Possible for intentional violations
- **Private Right of Action:** Patients can sue directly
- **Damages:** Actual damages, attorney fees, possible punitive damages

#### Florida (FIPA)
- **Failure to Notify Breach:** Up to $500,000 fine
- **Additional Damages:** Possible based on nature of breach
- **Attorney General Enforcement:** State AG can pursue violations

#### Texas
- **Texas Medical Privacy Act Violations:** Civil penalties
- **Additional State Penalties:** Vary based on violation type

### Real-World HIPAA Texting Violations & Penalties

#### Case Study 1: Cancer Center Texting Breach (2019)
**Violation:** Sent appointment reminders via unencrypted text messages containing patient names and appointment details

**Result:**
- $2.1 million settlement with OCR
- Required corrective action plan
- 3 years of monitoring

**Key Lessons:**
- Even appointment reminders need proper safeguards
- Name + appointment type = PHI
- "Everyone does it" is not a defense

#### Case Study 2: Medical Practice Employee Snooping
**Violation:** Employee accessed ex-boyfriend's medical records and texted details to friends

**Result:**
- $180,000 fine to practice
- Termination of employee
- Criminal charges against employee
- Mandatory workforce training

**Key Lessons:**
- Access controls must be enforced
- Audit logs should be monitored
- Personal use of PHI is never acceptable
- Both entity and individual can be held liable

#### Case Study 3: Hospital Staff Texting Orders
**Violation:** Nurses texting patient care orders via standard SMS including patient identifiers and medication details

**Result:**
- $400,000 settlement
- Overhaul of communication systems
- Enhanced staff training program

**Key Lessons:**
- Clinical communications need secure platforms
- Standard SMS not acceptable even for internal communications
- CMS prohibits texting orders even with secure platforms

### Individual Liability

**Healthcare workers can be personally liable:**

#### Criminal Penalties for Individuals:

**Tier 1: Wrongful Disclosure**
- Up to 1 year prison
- Up to $50,000 fine
- For knowingly obtaining/disclosing PHI

**Tier 2: False Pretenses**
- Up to 5 years prison
- Up to $100,000 fine
- For obtaining PHI under false pretenses

**Tier 3: Intent to Sell/Transfer/Use for Harm**
- Up to 10 years prison
- Up to $250,000 fine
- For obtaining/disclosing PHI with intent to sell, transfer, or use for commercial advantage, personal gain, or malicious harm

### Additional Consequences Beyond Fines

#### Business Impact

**Financial Costs:**
- Direct fines and penalties
- Legal fees and settlement costs
- Breach notification expenses
- Credit monitoring for affected patients
- Corrective action implementation
- Enhanced monitoring/auditing
- Potential lawsuits from patients

**Operational Impact:**
- OCR audits and investigations (time-consuming)
- Corrective action plans (1-3 years typically)
- Enhanced reporting requirements
- Restricted practice operations during investigation
- Staff time diverted to compliance activities

**Reputational Damage:**
- Loss of patient trust
- Negative media coverage
- Difficulty attracting new patients
- Impact on staff morale
- Professional reputation harm
- Social media backlash

**Professional Consequences:**
- Medical license disciplinary action (possible)
- Exclusion from federal healthcare programs
- Loss of privileges at hospitals/facilities
- Difficulty obtaining malpractice insurance
- Board complaints

#### Patient Impact

**Harm to Patients:**
- Privacy invasion
- Embarrassment or humiliation
- Discrimination (employment, insurance)
- Identity theft risk
- Emotional distress
- Loss of trust in healthcare system

### Warning Signs You're At Risk

**High-risk scenarios:**

☐ Staff using personal phones to text patients
☐ Sending patient names + appointment types via SMS
☐ No written text messaging policy
☐ No patient consent for text communications
☐ No Business Associate Agreement with texting vendor
☐ Staff haven't received HIPAA training
☐ No audit logs of text message communications
☐ Patients texting office number and staff responding via standard SMS
☐ Sharing patient photos via text/MMS
☐ No breach response plan
☐ Unaware of state-specific requirements
☐ "We've always done it this way" mentality

**If you checked ANY of these, you have compliance gaps to address immediately.**

### How Violations Are Discovered

**Common discovery methods:**

1. **Patient Complaints**
   - Most common trigger for investigations
   - Patient files complaint with OCR
   - OCR investigates regardless of harm

2. **Breach Self-Reporting**
   - Required under HIPAA for breaches affecting 500+ individuals
   - Voluntary reporting of smaller breaches
   - "Wall of Shame" public disclosure

3. **Random OCR Audits**
   - Periodic compliance audits
   - Desk audits (document requests)
   - On-site audits (rare)

4. **Media Reports**
   - News coverage of incidents
   - Social media disclosures
   - Triggers OCR investigation

5. **Whistleblower Reports**
   - Employees reporting violations
   - Competitors reporting violations
   - Anonymous tips

### Reducing Penalty Exposure

**Mitigating factors OCR considers:**

1. **Good Faith Effort**
   - Demonstrable compliance program
   - Regular training
   - Written policies
   - Timely breach response

2. **Cooperation with Investigation**
   - Prompt, complete responses
   - Transparency with OCR
   - Implementation of corrective actions
   - No obstruction

3. **Size and Resources**
   - Smaller practices may receive lower fines
   - But non-compliance not excused

4. **Prior History**
   - First offense vs. repeat violator
   - Previous corrective action plans
   - Pattern of non-compliance

5. **Nature and Extent of Harm**
   - Number of patients affected
   - Sensitivity of information
   - Actual harm caused

6. **Prompt Corrective Action**
   - Immediate steps to stop violation
   - System changes to prevent recurrence
   - Documentation of improvements

### Prevention is Key

**Best defense against penalties:**

✓ Implement HIPAA-compliant texting platform
✓ Train all staff thoroughly
✓ Obtain and document patient consent
✓ Execute Business Associate Agreements
✓ Maintain comprehensive audit trails
✓ Regular compliance audits
✓ Prompt breach response
✓ Continuous monitoring and improvement

**Cost of compliance << Cost of violations**

---

## 13. Recommended Solutions

### Top HIPAA-Compliant Texting Platforms

#### Tier 1: Dedicated Healthcare Texting Solutions

**1. TigerConnect (formerly TigerText)**

**Overview:**
- Industry leader in clinical communications
- Used by 6,000+ healthcare organizations
- Comprehensive secure messaging platform

**Key Features:**
- End-to-end 256-bit encryption
- Message recall and expiration
- Priority messaging for urgent communications
- Delivery and read receipts
- File/photo sharing (encrypted)
- Voice and video calling
- Integration with 100+ EHR systems
- Directory services
- On-call scheduling
- Nurse call integration
- Real-time presence indicators

**Compliance:**
- Business Associate Agreement included
- SOC 2 Type II certified
- HITRUST certified
- HIPAA compliant
- Comprehensive audit logs

**Pricing:**
- Contact for quote (typically $10-20/user/month)
- Enterprise pricing for larger organizations

**Best For:** Larger med spas, multi-location practices, those needing EHR integration

---

**2. Klara**

**Overview:**
- Patient communication platform designed for healthcare
- Focus on patient engagement
- Beautiful, user-friendly interface

**Key Features:**
- HIPAA-compliant messaging
- Shared team inbox
- Automated appointment reminders
- Video consultations
- Forms and intake
- Payment collection
- Patient portal
- Broadcast messaging
- Templates and quick replies
- Photo sharing (encrypted)
- Two-way texting

**Compliance:**
- Business Associate Agreement included
- HIPAA compliant
- Audit trails
- Data encryption

**Pricing:**
- Starter: $199/month (up to 3 users)
- Professional: $399/month (up to 10 users)
- Enterprise: Custom pricing

**Best For:** Med spas prioritizing patient experience, smaller to mid-size practices

---

**3. OhMD**

**Overview:**
- Simple, secure patient messaging
- Easy to implement
- Good for practices new to secure texting

**Key Features:**
- HIPAA-compliant texting
- Patient app (iOS/Android)
- Broadcast messaging
- Automated reminders
- Photo and file sharing
- Team messaging
- Patient surveys
- EHR integrations
- Desktop and mobile access

**Compliance:**
- Business Associate Agreement included
- HIPAA compliant
- Encrypted communications
- Audit logs

**Pricing:**
- Starter: $49/month (up to 2 providers)
- Professional: Custom pricing
- 14-day free trial

**Best For:** Small med spas, practices wanting simple solution, budget-conscious

---

**4. Spruce Health**

**Overview:**
- All-in-one communication platform
- Phone, text, fax, and video
- Strong telehealth features

**Key Features:**
- HIPAA-compliant calling and texting
- Shared phone numbers
- Voicemail transcription
- Secure fax
- Video visits
- Patient payments
- Scheduling integration
- Team collaboration
- Photo sharing
- Customizable workflows

**Compliance:**
- Business Associate Agreement included
- HIPAA compliant
- End-to-end encryption
- Comprehensive logs

**Pricing:**
- Contact for quote
- Typically $100-300/provider/month

**Best For:** Med spas offering telehealth, those wanting unified communications

---

#### Tier 2: Infrastructure Platforms (Require Development)

**5. Twilio**

**Overview:**
- Communications API platform
- Requires custom development
- Maximum flexibility and customization

**Key Features:**
- Programmable SMS/MMS
- Voice and video APIs
- WhatsApp Business API
- Phone number provisioning
- Advanced routing
- Analytics and reporting
- Global reach
- Scalable infrastructure

**HIPAA Compliance Requirements:**
- Must sign Business Associate Agreement
- Only Pro/Enterprise accounts eligible
- Use only HIPAA-eligible products
- Must designate accounts as HIPAA
- Implement encryption on your end
- Build audit logging
- Your responsibility to architect securely

**Pricing:**
- Pay-as-you-go
- SMS: $0.0079 per message (varies by country)
- Phone numbers: $1-15/month
- Pro account: $249/month minimum
- Enterprise: Custom pricing

**Best For:** Tech-savvy practices with development resources, custom integrations needed

**Note:** Requires significant technical expertise. Not recommended unless you have dedicated developers.

---

### Comparison Matrix

| Feature | TigerConnect | Klara | OhMD | Spruce | Twilio |
|---------|--------------|-------|------|--------|--------|
| **Ease of Use** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Setup Time** | 1-2 weeks | 1 week | Days | 1-2 weeks | 4-8 weeks |
| **BAA Included** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Patient App** | ✅ | ✅ | ✅ | ✅ | Custom |
| **Broadcast Messaging** | ✅ | ✅ | ✅ | ✅ | Custom |
| **Photo Sharing** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Video Calls** | ✅ | ✅ | ❌ | ✅ | Custom |
| **EHR Integration** | 100+ | Limited | 20+ | Limited | Custom |
| **Price Range** | $$$ | $$ | $ | $$$ | $ |
| **Best For** | Enterprise | Patient Experience | Budget | Telehealth | Custom Build |

**Price Key:**
- $ = Under $100/month
- $$ = $100-500/month
- $$$ = $500+/month

---

### Selection Guide by Practice Size

#### Solo Practitioner or Very Small Med Spa (1-3 Staff)

**Recommended: OhMD or Klara**

**Why:**
- Low cost
- Easy to implement
- Minimal training needed
- Great patient experience

**Budget:** $50-200/month

---

#### Small to Medium Med Spa (4-10 Staff)

**Recommended: Klara or Spruce Health**

**Why:**
- Scalable as you grow
- Good feature set
- Patient engagement tools
- Reasonable pricing

**Budget:** $200-500/month

---

#### Large Med Spa or Multi-Location (10+ Staff)

**Recommended: TigerConnect**

**Why:**
- Enterprise-grade features
- Advanced integrations
- Priority support
- Comprehensive reporting

**Budget:** $500-2,000+/month

---

#### Tech-Forward Practice with Development Team

**Recommended: Twilio + Custom Development**

**Why:**
- Complete customization
- Integration with existing systems
- Full control over features
- Scalable infrastructure

**Budget:** Variable (development costs + $100-1,000+/month usage)

---

### Implementation Recommendations

#### Recommended Implementation Approach

**Phase 1: Platform Selection (Week 1-2)**
1. Demo 3-4 platforms
2. Involve key staff in selection
3. Compare features vs. needs
4. Review pricing carefully
5. Check EHR integration compatibility

**Phase 2: Pilot Program (Week 3-6)**
1. Start with 2-3 staff members
2. Enroll 25-50 patients
3. Test all workflows
4. Gather feedback
5. Refine processes

**Phase 3: Full Rollout (Week 7-10)**
1. Train all staff
2. Enroll remaining patients
3. Decommission non-compliant methods
4. Monitor closely

**Phase 4: Optimization (Month 3-6)**
1. Analyze usage metrics
2. Optimize workflows
3. Add advanced features
4. Continuous improvement

---

### Additional Tools to Consider

#### Mobile Device Management (MDM)

**If staff use personal devices for work, consider:**

**1. Microsoft Intune**
- Comprehensive MDM solution
- App-level security
- Remote wipe capabilities
- Pricing: $6-14/user/month

**2. VMware Workspace ONE**
- Enterprise MDM
- Application management
- Pricing: Custom

**3. Jamf (for iOS devices)**
- Apple-focused MDM
- Excellent for iPhone/iPad
- Pricing: $4-10/device/month

#### Access Control & Authentication

**1. Okta**
- Single sign-on (SSO)
- Multi-factor authentication
- Pricing: $2-5/user/month

**2. Duo Security (Cisco)**
- Two-factor authentication
- Easy implementation
- Pricing: $3/user/month

#### Audit & Compliance Monitoring

**1. HIPAA One**
- Compliance management
- Risk assessments
- Policy templates
- Pricing: $99-499/month

**2. Compliancy Group**
- Full HIPAA compliance solution
- Training included
- Pricing: $300-500/month

---

### Cost-Benefit Analysis

#### Cost of Compliance

**One-Time Costs:**
- Platform setup: $0-1,000
- Legal review: $500-2,000
- Policy development: $500-2,000
- Staff training: $1,000-3,000
- **Total:** $2,000-8,000

**Annual Recurring Costs:**
- Texting platform: $600-10,000+
- BAA renewals: $0 (usually included)
- Annual training: $500-1,500
- Compliance audits: $1,000-5,000
- **Total:** $2,100-16,500/year

**Typical 5-Year Total Cost of Ownership:**
- Small practice: $12,000-35,000
- Medium practice: $25,000-60,000
- Large practice: $50,000-150,000

#### Cost of Non-Compliance

**Single Violation Scenario:**
- OCR fine (Tier 2 minimum): $50,000
- Legal fees: $10,000-50,000
- Corrective action implementation: $20,000-100,000
- Reputational damage: Incalculable
- **Potential Total:** $80,000-200,000+

**Return on Investment:**
- **Compliance costs are a fraction of potential violation penalties**
- Plus: Improved patient satisfaction, streamlined communications, enhanced reputation

**Conclusion: Compliance is not optional—it's essential and cost-effective.**

---

### Final Recommendations

#### Best Overall Solution for Most Med Spas:

**Klara**

**Why:**
- Perfect balance of features, ease of use, and cost
- Beautiful patient experience
- Quick implementation
- Excellent customer support
- Scales well as you grow
- Transparent pricing

#### Best Budget Option:

**OhMD**

**Why:**
- Most affordable
- Easy to use
- Includes essential features
- Quick setup
- Good for practices new to secure texting

#### Best Enterprise Solution:

**TigerConnect**

**Why:**
- Most comprehensive feature set
- Best for complex organizations
- Advanced integrations
- Industry leader
- Excellent security and compliance

#### Next Steps:

1. **This Week:** Demo 2-3 platforms
2. **Next Week:** Make selection and purchase
3. **Week 3-4:** Configure and pilot test
4. **Week 5-8:** Full rollout
5. **Ongoing:** Monitor, optimize, stay compliant

---

## Conclusion

HIPAA-compliant texting is not optional for medical spas—it's a legal requirement that protects both your patients and your practice. While implementing compliant solutions requires upfront investment and effort, the cost of non-compliance far exceeds the cost of doing it right.

**Key Takeaways:**

✅ Standard SMS is NOT HIPAA compliant
✅ Medical spas treating patients with prescriptions/medical procedures ARE covered entities
✅ Patient consent is required before texting PHI
✅ Business Associate Agreements are mandatory with texting vendors
✅ Staff training is essential and ongoing
✅ Audit trails must be maintained for 6+ years
✅ State laws may be stricter than federal HIPAA
✅ Violations can result in fines up to $1.5 million per incident
✅ Compliant solutions are available and affordable
✅ Implementation can be completed in 8-16 weeks

**The Bottom Line:**

Implement HIPAA-compliant texting to:
- Protect patient privacy
- Avoid massive fines and penalties
- Enhance patient experience
- Streamline communications
- Build trust and reputation
- Operate legally and ethically

**Start today. Your patients—and your practice—deserve nothing less.**

---

## Sources

This guide was compiled using the following authoritative sources:

### HIPAA Compliance & Texting Rules
- [Is Texting in Violation of HIPAA? 2026 Update](https://www.hipaajournal.com/texting-violation-hipaa/)
- [Is Text Messaging HIPAA Compliant](https://www.hipaajournal.com/is-text-messaging-hipaa-compliant/)
- [What are the HIPAA Rules Regarding Text Messaging? - The HIPAA Guide](https://www.hipaaguide.net/hipaa-rules-regarding-text-messaging/)
- [Understanding HIPAA-Compliant Texting: Guidelines & Compliance for Healthcare Communication](https://www.360training.com/blog/hipaa-compliant-messaging)
- [HIPAA Regulations for SMS](https://www.hipaajournal.com/hipaa-regulations-for-sms/)

### Patient Consent & Authorization
- [HIPAA Text Messaging Consent Form | Essential Guide](https://notifyre.com/us/blog/hipaa-text-messaging-consent-form)
- [Navigating HIPAA-compliant text messaging for better patient communication - The Intake](https://www.tebra.com/theintake/patient-experience/legal-and-compliance/navigating-hipaa-compliant-text-messaging)

### Encryption Requirements
- [HIPAA Encryption Requirements - 2026 Update](https://www.hipaajournal.com/hipaa-encryption-requirements/)
- [HIPAA Encryption: Protect ePHI Protected Health Information](https://www.kiteworks.com/hipaa-compliance/hipaa-encryption/)
- [HIPAA Encryption Requirements: The Key to Protecting Patient Privacy](https://sprinto.com/blog/hipaa-encryption-requirements/)

### Audit Trail Requirements
- [HIPAA Compliant Texting: Features, Examples & Violation Penalties | Exabeam](https://www.exabeam.com/explainers/hipaa-compliance/hipaa-compliant-texting-features-examples-violation-penalties/)
- [HIPAA Compliant Texting and Archiving](https://jatheon.com/blog/hipaa-compliance-with-mobile-archiving/)

### Staff Training Requirements
- [HIPAA Training Requirements - Updated for 2026](https://www.hipaajournal.com/hipaa-training-requirements/)
- [HIPAA Training and Resources | HHS.gov](https://www.hhs.gov/hipaa/for-professionals/training/index.html)

### PHI & Treatment Information
- [What is Considered PHI under HIPAA? Updated for 2026](https://www.hipaajournal.com/considered-phi-hipaa/)
- [Is Texting a Patient Name a HIPAA Violation?](https://emitrr.com/blog/is-texting-a-patients-name-a-hipaa-violation/)
- [Identifying PHI in text messages](https://www.paubox.com/blog/identifying-phi-in-text-messages)

### Photo Sharing Compliance
- [What are the HIPAA Photography Rules? Updated for 2026](https://www.hipaajournal.com/hipaa-photography-rules/)
- [HIPAA Pictures and Videos. What are the Rules? - The HIPAA Guide](https://www.hipaaguide.net/hipaa-pictures-videos/)
- [How to Ensure HIPAA Compliance with Image Sharing in 2022](https://www.purview.net/blog/how-to-ensure-image-sharing-hipaa-compliance)

### Message Retention Policies
- [HIPAA Retention Requirements - 2026 Update](https://www.hipaajournal.com/hipaa-retention-requirements/)
- [HIPAA Data Retention: HIPAA Record Retention & Requirements](https://www.kiteworks.com/hipaa-compliance/hipaa-compliant-data-retention/)
- [HIPAA Data Retention Requirements: A 2026 Guide with State-Wise Policies](https://sprinto.com/blog/hipaa-data-retention-requirements/)

### Business Associate Agreements
- [Twilio and HIPAA | Twilio](https://www.twilio.com/en-us/hipaa)
- [Understanding Twilio's Business Associate Addendum | Twilio](https://www.twilio.com/en-us/blog/understanding-twilio-baa)
- [Is Twilio HIPAA compliant? (2025 update)](https://www.paubox.com/blog/twilio-hipaa-compliant)

### State Regulations & Updates
- [New HIPAA Regulations in 2026](https://www.hipaajournal.com/new-hipaa-regulations/)
- [HIPAA Updates and HIPAA Changes in 2026](https://www.hipaajournal.com/hipaa-updates-hipaa-changes/)
- [Guidance: How the HIPAA Rules Permit Covered Health Care Providers and Health Plans to Use Remote Communication Technologies for Audio-Only Telehealth | HHS.gov](https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/hipaa-audio-telehealth/index.html)

### Medical Spas & Aesthetics Compliance
- [Does HIPAA Apply to Cosmetic Procedures?](https://askfeather.com/resources/does-hipaa-apply-to-cosmetic-procedures)
- [HIPAA Compliance for Med Spas: Protecting Patient Information](https://www.weitzmorgan.com/post/hipaa-compliance-for-med-spas-protecting-patient-information)
- [Are Medspas Considered "Covered Entities" According to HIPAA](https://rxphoto.com/resources/blog/are-medspas-considered-covered-entities-according-to-hipaa/)
- [HIPAA FAQs: Navigating HIPAA… | American Med Spa Association](https://americanmedspa.org/blog/hipaa-faqs-navigating-hipaa-compliance-in-your-medical-spa)

---

**Document Version:** 1.0
**Last Updated:** January 9, 2026
**Next Review Date:** July 1, 2026

**Disclaimer:** This document provides general information about HIPAA compliance for text messaging. It is not legal advice. Consult with a qualified healthcare attorney for specific guidance on your practice's compliance obligations.
