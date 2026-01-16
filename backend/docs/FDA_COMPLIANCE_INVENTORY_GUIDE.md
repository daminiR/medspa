# FDA Compliance & Medical Inventory Best Practices Guide
## For Medical Spa Inventory Management (Injectables: Botox, Dysport, Dermal Fillers)

**Research Date:** December 2024
**Last Updated:** December 2024

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [FDA Compliance Requirements](#fda-compliance-requirements)
3. [Lot Tracking Requirements](#lot-tracking-requirements)
4. [Expiration Date Management](#expiration-date-management)
5. [Product Recall Procedures](#product-recall-procedures)
6. [Storage Requirements](#storage-requirements)
7. [Multi-Patient Vial Tracking](#multi-patient-vial-tracking)
8. [Reconstitution Documentation](#reconstitution-documentation)
9. [DEA Controlled Substances](#dea-controlled-substances)
10. [HIPAA & Audit Trail Requirements](#hipaa--audit-trail-requirements)
11. [State Medical Board Compliance](#state-medical-board-compliance)
12. [Supply Chain Verification](#supply-chain-verification)
13. [Adverse Event Reporting](#adverse-event-reporting)
14. [Patient Consent & Documentation](#patient-consent--documentation)
15. [Audit Preparation Checklist](#audit-preparation-checklist)
16. [Required Software Features](#required-software-features)
17. [Sources](#sources)

---

## Executive Summary

Medical spas handling injectables (Botox, Dysport, dermal fillers) must comply with multiple regulatory frameworks:
- **FDA regulations** for medical devices (dermal fillers - Class III) and drugs (neurotoxins)
- **DEA requirements** for controlled substances (if applicable)
- **HIPAA** for patient health information protection
- **State medical board** requirements (vary by state)
- **CDC guidelines** for safe injection practices
- **OSHA** standards for workplace safety

### Key Compliance Takeaways

| Area | Minimum Requirement | Best Practice |
|------|---------------------|---------------|
| Lot Tracking | Record lot number for each patient | Link lot to patient record with timestamp |
| Record Retention | 2-6 years (varies by type) | 7 years minimum for all records |
| Multi-dose Vials | 28-day expiration after opening | Single patient use when possible |
| Temperature Logs | Twice daily manual logging | Continuous digital monitoring with alerts |
| Recall Response | 30-day notification | 24-hour internal response protocol |
| Audit Trails | Track PHI access | Full inventory + patient record audit trail |

---

## FDA Compliance Requirements

### Classification of Medical Spa Products

#### Dermal Fillers (Medical Devices)
- **Classification:** Class III Medical Devices
- **Product Codes:** LMH (dermal implant for aesthetic use) or PKY (dermal implant for hands)
- **Approval Path:** Premarket Approval (PMA) or 510(k) clearance
- **Regulation:** 21 CFR Part 820 (Quality System Regulation)

#### Neurotoxins (Botox, Dysport)
- **Classification:** Prescription drugs
- **Regulation:** Must be administered by licensed professionals
- **Promotion:** Must comply with FDA rules for prescription drug advertising

### Core FDA Requirements

1. **Use Only FDA-Approved Products**
   - Verify all injectables and devices are FDA-approved
   - Maintain documentation of FDA approval status
   - Never use products from unauthorized sources

2. **Follow Manufacturer Instructions**
   - Storage conditions
   - Reconstitution procedures
   - Administration guidelines
   - Disposal procedures

3. **Maintain Accurate Records**
   - Product receipt documentation
   - Lot number tracking
   - Patient administration records
   - Adverse event reports

4. **Medical Device Reporting (MDR)**
   - Report deaths and serious injuries to FDA
   - Report device malfunctions that could cause harm
   - Use FDA Form 3500A for mandatory reports

---

## Lot Tracking Requirements

### What Must Be Captured

For each product received and administered:

| Data Point | Required | Best Practice |
|------------|----------|---------------|
| Lot/Batch Number | Yes | Yes |
| Product Name | Yes | Yes |
| Manufacturer | Yes | Yes |
| Expiration Date | Yes | Yes |
| Receipt Date | Yes | Yes |
| Quantity Received | Yes | Yes |
| Supplier/Distributor | Yes | Yes |
| Storage Location | Recommended | Yes |
| Receiving Staff Signature | Recommended | Yes |

### Patient-Level Tracking

When administering to patients, capture:

| Data Point | Required | Best Practice |
|------------|----------|---------------|
| Patient ID | Yes | Yes |
| Lot Number Used | Yes | Yes |
| Date/Time of Administration | Yes | Yes |
| Quantity Used | Yes | Yes |
| Injection Site(s) | Recommended | Yes |
| Administering Practitioner | Yes | Yes |
| Dilution/Concentration (if applicable) | Yes | Yes |

### Unique Device Identification (UDI)

For dermal fillers (Class III devices):
- **Device Identifier (DI):** Fixed code identifying manufacturer/model
- **Production Identifier (PI):** Variable code including lot number
- **Required:** UDI on label in human-readable AND machine-readable (barcode) form
- **GUDID Database:** Manufacturers must submit device info to FDA's Global UDI Database

### Record Retention

| Record Type | Minimum Retention |
|-------------|-------------------|
| Device History Records | 2 years from release OR design/expected life |
| Drug Records | 1 year after expiration (3 years for OTC) |
| Patient Treatment Records | Per state law (typically 5-10 years) |
| HIPAA Disclosures | 6 years from last disclosure |
| DEA Controlled Substances | 2 years minimum |

**Recommendation:** Retain all inventory and patient records for **7 years minimum** to cover all requirements.

---

## Expiration Date Management

### FDA Requirements

1. **Never Use Expired Products**
   - Expired products must be immediately removed from usable inventory
   - Quarantine expired products pending proper disposal

2. **Multi-Dose Vial Expiration**
   - Once punctured: **28 days maximum** (unless manufacturer specifies otherwise)
   - Never exceed manufacturer's original expiration date
   - Document date and time of first puncture

3. **Beyond-Use Dating (BUD) for Reconstituted Products**
   - Follow manufacturer's specified timeframe after reconstitution
   - If not specified, follow USP <797> guidelines
   - Document reconstitution date/time prominently

### Disposal Procedures

1. **Documentation Required**
   - Product name and lot number
   - Quantity disposed
   - Reason for disposal (expired, recalled, damaged)
   - Date of disposal
   - Person performing disposal
   - Disposal method used

2. **Disposal Methods**
   - Drug take-back programs (preferred)
   - Authorized disposal companies
   - Never flush pharmaceuticals (unless on FDA flush list)

3. **Medical Waste Compliance**
   - Follow state environmental regulations
   - Sharps containers for needles/syringes
   - Hazardous pharmaceutical waste procedures

### Pre-Expiration Alert Best Practices

| Alert Level | Timeframe | Action |
|-------------|-----------|--------|
| Warning | 90 days before expiration | Review inventory, plan usage |
| Critical | 30 days before expiration | Prioritize use, consider return |
| Urgent | 14 days before expiration | Use immediately or quarantine |
| Expired | Day of expiration | Remove from inventory, dispose |

---

## Product Recall Procedures

### FDA Recall Classifications

| Class | Health Risk | Example |
|-------|-------------|---------|
| **Class I** | Serious adverse health consequences or death | Contaminated product |
| **Class II** | Temporary/reversible adverse health effects | Mislabeled product |
| **Class III** | Not likely to cause adverse health consequences | Minor labeling error |

### Reporting Requirements

- **Class I & II:** Must report corrections/removals to FDA
- **Class III:** Record-keeping only (no FDA report required)
- **Notification Timeline:** Within 24 hours of determining product is illegitimate

### Required Actions

1. **Immediate Quarantine**
   - Physically separate affected products
   - Use electronic quarantine in inventory system
   - Prevent any further distribution

2. **Patient Identification**
   - Query lot number to identify all affected patients
   - Maintain searchable lot-to-patient records
   - Document all patients who received recalled product

3. **Notification**
   - Notify FDA (for Class I/II)
   - Notify trading partners
   - Consider patient notification (based on risk level)

4. **Documentation**
   - Record all recall-related actions
   - Maintain evidence of notification receipt
   - Document disposition of recalled products

### Recall Response Checklist

- [ ] Verify recall notice authenticity
- [ ] Identify affected lot numbers in inventory
- [ ] Physically quarantine affected products
- [ ] Query patient records for lot number matches
- [ ] Notify medical director
- [ ] Contact manufacturer/distributor
- [ ] Document all actions with timestamps
- [ ] Determine patient notification needs
- [ ] Complete disposition of recalled products
- [ ] File final recall response report

---

## Storage Requirements

### Temperature Requirements

| Product Type | Temperature Range | Notes |
|--------------|-------------------|-------|
| Refrigerated Injectables | 2°C - 8°C (36°F - 46°F) | Standard medical refrigerator |
| Frozen Products | -50°C to -15°C (-58°F to +5°F) | If applicable |
| Room Temperature | Per manufacturer specifications | Check each product |

### Temperature Monitoring

#### CDC/Joint Commission Requirements

1. **Monitoring Frequency**
   - **Minimum:** Twice daily temperature logging
   - **Recommended:** Continuous digital monitoring

2. **Digital Data Logger Requirements** (per VFC program)
   - Accuracy: ±1.0°F (±0.5°C)
   - Reading frequency: At least every 30 minutes
   - Storage capacity: Minimum 4,000 readings
   - Buffered temperature probe (aluminum, Teflon, or liquid)
   - External display
   - Low-battery indicator
   - Audible/visual out-of-range alarm

3. **Calibration**
   - Annual calibration minimum
   - NIST-traceable standards
   - Documentation of calibration certificates

### Temperature Excursion Procedures

1. **Immediate Actions**
   - Do not use products until assessed
   - Document excursion (start time, end time, temperature range)
   - Contact manufacturer for guidance on product viability

2. **Documentation Required**
   - Temperature readings during excursion
   - Duration of excursion
   - Products affected
   - Manufacturer's response/guidance
   - Disposition decision (use or dispose)

### Storage Security

- Secure storage in locked areas
- Access limited to authorized personnel
- Video surveillance recommended
- Sign-in/sign-out procedures

---

## Multi-Patient Vial Tracking

### CDC Safe Injection Practices

#### Core Principle: "One Needle, One Syringe, Only One Time"

### Multi-Dose Vial Guidelines

1. **Assign to Single Patient When Possible**
   - Dedicate vials to single patient if feasible
   - Reduces contamination risk
   - Simplifies tracking

2. **When Multi-Patient Use Required**
   - Store in designated clean medication preparation area
   - Keep away from immediate patient treatment areas
   - Never leave needle inserted in vial septum
   - Document each withdrawal

3. **Expiration Rules**
   - **Unopened:** Manufacturer's expiration date
   - **Once Punctured:** 28 days maximum OR manufacturer's specification (whichever is sooner)
   - Never exceed original expiration date

### Documentation Requirements

For each withdrawal from multi-dose vial:

| Data Point | Required |
|------------|----------|
| Vial Lot Number | Yes |
| Patient ID | Yes |
| Date/Time of Withdrawal | Yes |
| Quantity Withdrawn | Yes |
| Practitioner ID | Yes |
| Injection Site | Yes |
| Running Total Used | Recommended |
| Remaining Quantity | Recommended |

### Prohibited Practices

- Reusing syringes between patients
- "Double dipping" (re-entering vial with used syringe)
- Leaving needles in vial septa
- Using single-dose vials for multiple patients
- Reusing single-use medications

---

## Reconstitution Documentation

### Required Documentation

When reconstituting products (e.g., neurotoxins with saline):

| Data Point | Required |
|------------|----------|
| Original Product Lot Number | Yes |
| Date and Time of Reconstitution | Yes |
| Diluent Type | Yes |
| Diluent Lot Number | Recommended |
| Volume of Diluent Added | Yes |
| Final Concentration/Dilution Ratio | Yes |
| Person Performing Reconstitution | Yes |
| Beyond-Use Date/Time | Yes |

### Beyond-Use Dating (BUD)

#### USP <797> Guidelines

| Risk Level | Room Temp | Refrigerated | Frozen |
|------------|-----------|--------------|--------|
| Low Risk | 12 hours | 24 hours | N/A |
| Medium Risk | 30 hours | 9 days | 45 days |
| High Risk | 1 hour | 24 hours | 3 days |

**Note:** Follow manufacturer's instructions when available; they supersede USP guidelines.

### Reconstitution Label Requirements

Each reconstituted product must be labeled with:
- Original product name and lot number
- Reconstitution date and time
- Beyond-use date and time
- Final concentration
- Preparer's initials or identifier
- Storage requirements

---

## DEA Controlled Substances

### Applicability

Most medical spa injectables (Botox, fillers) are **NOT** DEA controlled substances. However, if your practice uses any controlled substances (certain anesthetics, pain medications):

### DEA Registration Requirements

1. **Registration**
   - Register with DEA if handling controlled substances
   - State controlled substances registration may also be required
   - Check with state prescription monitoring program (PMP)

2. **Record-Keeping**
   - Initial inventory required
   - Biennial (every 2 years) inventory
   - Disposition logs for all scheduled drugs
   - **Retention:** Minimum 2 years

3. **Schedule II Requirements**
   - Cannot be refilled
   - DEA Form 222 for ordering
   - Stricter documentation requirements

### Security Requirements

- Secure storage (locked steel cabinets or safes)
- Video surveillance recommended
- Limited access to authorized personnel only
- Log-in/log-out procedures
- Regular inventory audits

### Loss/Theft Reporting

- Complete DEA Form 106 for any theft or loss
- Report to local DEA field office
- Document circumstances and investigation

---

## HIPAA & Audit Trail Requirements

### HIPAA Security Rule Requirements

Under 45 CFR § 164.312(b) - Audit Controls:

1. **Required Audit Trail Elements**
   - Who accessed the information
   - What information was accessed
   - When the access occurred
   - Where (device/location) access occurred
   - How (type of action: view, edit, delete, print)

2. **Retention**
   - **Minimum:** 6 years from date of creation or last effective date
   - Includes audit logs and security documentation

### Inventory-Specific Audit Trail

For inventory systems containing/linking to PHI:

| Action | Data to Log |
|--------|-------------|
| Product Receipt | User, timestamp, products, quantities |
| Inventory Adjustment | User, timestamp, reason, before/after |
| Product Assignment to Patient | User, timestamp, patient ID, lot number |
| Lot Number Query | User, timestamp, search parameters |
| Recall Response | User, timestamp, actions taken |
| Report Generation | User, timestamp, report type |
| System Access | User, timestamp, login/logout |

### Access Controls

- Role-based access control (RBAC)
- Minimum necessary access principle
- Unique user identification
- Automatic session timeout
- Encryption of PHI in transit and at rest

---

## State Medical Board Compliance

### General Requirements (Vary by State)

1. **Medical Director**
   - Licensed physician must oversee operations
   - Must be readily available for consultation
   - Responsible for protocol development

2. **Practitioner Licensing**
   - Staff must hold appropriate state licenses
   - Verify scope of practice for each procedure
   - Maintain current credentials

3. **Facility Licensing**
   - Many states require medical spa facility license
   - Inspection may be required
   - Renewal typically annual

4. **Record-Keeping**
   - Maintain patient records per state requirements
   - Typically 5-10 years (varies by state)
   - Include treatment details, products used

### Inventory-Specific State Requirements

- Some states require specific inventory controls
- Controlled substance registrations may be state-level
- Check with your state medical board for specific requirements

### Resources

- Contact your state medical board directly
- American Med Spa Association (AMSPA) provides state-by-state guidance
- Consider healthcare attorney consultation for complex situations

---

## Supply Chain Verification

### Drug Supply Chain Security Act (DSCSA)

Enacted 2013, full implementation phased through 2025.

#### Key Requirements

1. **Product Verification**
   - Verify authenticity before distribution/dispensing
   - Standard numerical identifier (SNI) at package level
   - Transaction history/transaction information (TH/TI) records

2. **Authorized Trading Partners**
   - Purchase only from authorized distributors
   - Verify supplier credentials
   - Maintain documentation of supplier authorization

3. **Suspect Product Handling**
   - Quarantine products if suspected counterfeit/illegitimate
   - Investigate within specified timeframes
   - Notify FDA within 24 hours if determined illegitimate

4. **Documentation**
   - Transaction information for each sale
   - Transaction history back to manufacturer
   - Transaction statement confirming legitimacy

### Best Practices for Medical Spas

1. **Vendor Management**
   - Verify distributor FDA registration
   - Request proof of authorized distributor status
   - Maintain vendor qualification records

2. **Receipt Verification**
   - Check product packaging for tampering
   - Verify lot numbers against packing slip
   - Confirm products are not expired

3. **Counterfeit Prevention**
   - Never purchase from unauthorized sources
   - Be suspicious of significantly discounted products
   - Report suspected counterfeits immediately

---

## Adverse Event Reporting

### FDA MedWatch Program

#### Voluntary vs. Mandatory Reporting

| Reporter Type | Requirement |
|---------------|-------------|
| Healthcare Professionals | Voluntary (FDA Form 3500) |
| Consumers/Patients | Voluntary (FDA Form 3500B) |
| Manufacturers | Mandatory within 30 days (FDA Form 3500A) |
| User Facilities | Mandatory for deaths/serious injuries |

### What to Report

- Serious adverse events (death, hospitalization, disability)
- Product quality problems
- Therapeutic failures
- Product use errors
- Device malfunctions

### Required Information

- Patient information (can be de-identified)
- Product information including:
  - Product name
  - Manufacturer
  - **Lot number**
  - Expiration date
  - NDC or UDI number
- Event description
- Outcome

### Reporting Methods

- **Online:** MedWatch Online
- **Phone:** 1-800-332-1088
- **Form:** FDA Form 3500 (voluntary) or 3500A (mandatory)

### Internal Adverse Event Tracking

Document internally for each adverse event:

| Data Point | Required |
|------------|----------|
| Patient ID | Yes |
| Event Date | Yes |
| Product(s) Involved | Yes |
| Lot Number(s) | Yes |
| Event Description | Yes |
| Severity | Yes |
| Treatment Provided | Yes |
| Outcome | Yes |
| Reported to FDA? | Yes |
| FDA Report Number | If applicable |

---

## Patient Consent & Documentation

### Informed Consent Requirements

For dermal filler and injectable procedures:

#### Required Disclosures

1. **Procedure Information**
   - Nature of the procedure
   - Expected results
   - Alternatives available

2. **Risks and Side Effects**
   - Common reactions (swelling, bruising)
   - Rare but serious complications
   - Vascular events (for fillers)
   - Allergic reactions
   - Late-onset adverse events (LOAEs)

3. **Product Information**
   - Product name and type
   - FDA approval status
   - General information about the product

4. **Post-Treatment Instructions**
   - Care instructions
   - What to expect
   - When to seek medical attention

### Documentation Requirements

| Element | Required |
|---------|----------|
| Patient signature | Yes |
| Date of consent | Yes |
| Practitioner signature | Yes |
| Witness (some states) | Varies |
| Copy provided to patient | Recommended |

### Patient Device Card

Consider providing patients with:
- Product name and lot number used
- Date of treatment
- Practitioner information
- Post-procedure instructions
- Adverse event reporting information
- Emergency contact information

---

## Audit Preparation Checklist

### Documentation Ready for Inspection

#### Inventory Records
- [ ] Product receipt logs with lot numbers
- [ ] Current inventory counts
- [ ] Expiration date tracking reports
- [ ] Temperature monitoring logs
- [ ] Disposal documentation
- [ ] Recall response records

#### Patient Records
- [ ] Signed informed consent forms
- [ ] Treatment records with lot numbers
- [ ] Adverse event documentation
- [ ] Lot-to-patient tracking capability

#### Staff Records
- [ ] Current licenses for all practitioners
- [ ] Controlled substance registrations (if applicable)
- [ ] Training documentation
- [ ] Credentialing files

#### Policies & Procedures
- [ ] Inventory management SOPs
- [ ] Recall response procedures
- [ ] Temperature excursion procedures
- [ ] Adverse event reporting procedures
- [ ] Infection control policies

#### Compliance Documentation
- [ ] FDA product approval documentation
- [ ] Supplier/vendor qualification records
- [ ] HIPAA policies and procedures
- [ ] OSHA safety documentation
- [ ] State license and registration

### Audit Response Protocol

1. **Before Inspection**
   - Designate inspection liaison
   - Review all documentation for completeness
   - Conduct internal mock audit
   - Train staff on inspection behavior

2. **During Inspection**
   - Be calm, professional, and cooperative
   - Provide requested documents promptly
   - Answer questions truthfully and concisely
   - Document all requests and observations

3. **After Inspection**
   - Review any observations or findings
   - Develop corrective action plan if needed
   - Implement corrections promptly
   - Document all corrective actions

---

## Required Software Features

### FDA Compliance Features (Required)

| Feature | Purpose | Regulation |
|---------|---------|------------|
| Lot Number Tracking | Track products to patients | FDA MDR, UDI |
| Expiration Date Management | Prevent use of expired products | FDA, USP |
| Patient-Lot Linkage | Enable recall response | FDA recall requirements |
| Audit Trail | Track all system access/changes | HIPAA Security Rule |
| Recall Alert System | Rapid response to FDA recalls | 21 CFR 7 |
| Temperature Logging | Document proper storage | CDC, Joint Commission |

### Medical Spa Compliance Features (Required)

| Feature | Purpose | Regulation |
|---------|---------|------------|
| Multi-dose Vial Tracking | Track 28-day expiration | CDC, USP <797> |
| Reconstitution Documentation | Record dilution details | USP <797> |
| Provider-level Tracking | Know who administered what | State medical boards |
| Open Vial Management | Track partially used vials | CDC safe injection |
| Consent Form Integration | Link consent to treatment | State requirements |

### Best Practice Features (Recommended)

| Feature | Purpose | Benefit |
|---------|---------|---------|
| Automated Expiration Alerts | Proactive inventory management | Reduce waste, prevent use of expired products |
| Barcode/UDI Scanning | Accurate product identification | Reduce errors, speed data entry |
| Real-time Recall Integration | Automatic recall notifications | Faster response time |
| Adverse Event Tracking | Internal safety monitoring | Trend analysis, risk mitigation |
| Analytics Dashboard | Inventory insights | Optimize ordering, reduce waste |
| DSCSA Compliance | Supply chain verification | Counterfeit prevention |
| Role-based Access | Security and privacy | HIPAA compliance |
| Electronic Signatures | Verify actions | Audit trail integrity |

### Risk Mitigation Features

| Feature | Risk Mitigated |
|---------|----------------|
| Duplicate Lot Alerts | Counterfeit detection |
| Supplier Verification | Unauthorized sourcing |
| Automatic Quarantine | Use of recalled products |
| Exception Reports | Identify compliance gaps |
| Batch Reporting | Audit preparation |
| Data Backup | Record preservation |

### Audit Preparation Features

| Feature | Purpose |
|---------|---------|
| Lot Number Search | Find all patients given specific lot |
| Date Range Reports | Generate records for inspection period |
| Compliance Reports | Pre-built reports for common audits |
| Export Capability | Provide records in required format |
| Signature Verification | Prove authorization of actions |
| Change History | Show document version control |

---

## Sources

### FDA Resources
- [FDA-Approved Dermal Fillers](https://www.fda.gov/medical-devices/aesthetic-cosmetic-devices/fda-approved-dermal-fillers)
- [FDA Unique Device Identification System](https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance/unique-device-identification-system-udi-system)
- [FDA Recalls, Corrections and Removals (Devices)](https://www.fda.gov/medical-devices/postmarket-requirements-devices/recalls-corrections-and-removals-devices)
- [FDA MedWatch Safety Information and Adverse Event Reporting](https://www.fda.gov/safety/medwatch-fda-safety-information-and-adverse-event-reporting-program)
- [FDA Drug Supply Chain Security Act (DSCSA)](https://www.fda.gov/drugs/drug-supply-chain-integrity/drug-supply-chain-security-act-dscsa)
- [21 CFR Part 820 Quality System Regulation](https://www.ecfr.gov/current/title-21/chapter-I/subchapter-H/part-820)
- [21 CFR Part 7 Recalls](https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-7/subpart-C)

### CDC Resources
- [CDC Preventing Unsafe Injection Practices](https://www.cdc.gov/injection-safety/hcp/clinical-safety/index.html)

### HIPAA Resources
- [HIPAA Audit Trail Requirements](https://compliancy-group.com/hipaa-audit-log-requirements/)
- [HHS HIPAA Audit Protocol](https://www.hhs.gov/hipaa/for-professionals/compliance-enforcement/audit/protocol/index.html)

### DEA Resources
- [DEA Controlled Substances Act](https://www.dea.gov/drug-information/csa)
- [DEA Practitioner's Manual](https://www.deadiversion.usdoj.gov/GDP/(DEA-DC-071)(EO-DEA226)_Practitioner's_Manual_(final).pdf)

### USP Resources
- [USP <797> Beyond-Use Dating](https://www.wolterskluwer.com/en/expert-insights/usp-forum-update-beyond-use-dates-buds)

### Industry Resources
- [Medspa Compliance Guide 2025](https://www.medicalsparx.com/medspa-compliance/)
- [Regulatory Compliance for Dermal Fillers](https://e-fillers.com/blog/understanding-regulatory-compliance-for-dermal-fillers-key-considerations-for-clinics-and-distributors)
- [FDA Guidelines for Medical Spa Products](https://www.newtonslawusa.com/2025/03/25/compliance-with-state-and-federal-regulators-fda-guidelines-for-medical-spa-products/)

---

## Disclaimer

This guide provides general information about FDA compliance and medical inventory management for medical spas. It is not intended as legal or regulatory advice. Regulations vary by state and change over time. Always consult with qualified healthcare attorneys, compliance specialists, and your state medical board for specific guidance applicable to your practice.

---

*Document prepared for Medical Spa Platform - December 2024*
