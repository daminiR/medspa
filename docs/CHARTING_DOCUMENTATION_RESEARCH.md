# Treatment Documentation & Injection Mapping Research for Medical Spas (2025)

## Executive Summary

This comprehensive research document covers treatment documentation best practices, injection mapping requirements, SOAP note templates, and product tracking for medical spas in 2025. The findings are based on current industry standards, regulatory requirements, and competitive analysis of leading aesthetic EMR platforms.

---

## Table of Contents

1. [Treatment Documentation Requirements](#1-treatment-documentation-requirements)
2. [SOAP Notes for Aesthetics](#2-soap-notes-for-aesthetics)
3. [Injection Mapping](#3-injection-mapping)
4. [Treatment Templates](#4-treatment-templates)
5. [Product/Inventory Tracking](#5-productinventory-tracking)
6. [Treatment Plans](#6-treatment-plans)
7. [Competitor Analysis](#7-competitor-analysis)
8. [API Design Recommendations](#8-api-design-recommendations)
9. [Implementation Checklist](#9-implementation-checklist)

---

## 1. Treatment Documentation Requirements

### 1.1 Legal and Regulatory Requirements

#### Initial Patient Examination
- **Good Faith Exam (GFE)**: A face-to-face examination by a qualified physician is required before any medical aesthetic treatment
- The GFE is considered the "Medical Spa Widow-maker" due to its critical importance for legal compliance
- Must include: medical history review and physical examination of treatment areas

#### Medical Director Requirements
- Most states require a licensed physician (M.D. or D.O.) as medical director
- Responsible for overseeing all medical treatments
- Must ensure compliance with healthcare laws and safety standards

#### Facility Requirements
- State-issued facility license from Health Department or Board of Medicine
- Rigorous cleaning protocols
- Equipment meeting regulatory standards
- Emergency preparedness requirements

#### Staff Documentation
- Each professional must have documented scope of practice
- Training records for all procedures performed
- Supervision requirements based on state law
- Delegation documentation for non-physician providers

### 1.2 Privacy and HIPAA Compliance

#### Protected Health Information (PHI)
- Patient records, treatment plans, and before/after photos are PHI
- Photos are considered part of the Designated Record Set (DRS)
- Must be stored on encrypted, access-controlled systems

#### Photography Requirements
- Written, signed consent required before any photo release
- Consent forms must specify:
  - Clear purpose (treatment, education, marketing)
  - Scope of use (internal, external, social media)
  - Revocation process
- De-identification required for non-consented uses
- Remove EXIF data (geotagging, timestamps)
- Photos of tattoos, birthmarks, distinctive features are identifying

### 1.3 Documentation Requirements Checklist

| Category | Required Elements |
|----------|------------------|
| **Patient Info** | Name, DOB, contact info, emergency contact |
| **Medical History** | Allergies, medications, bleeding disorders, previous treatments |
| **Consent** | Treatment consent, photo consent, HIPAA acknowledgment |
| **Pre-Treatment** | Vitals, skin assessment, Fitzpatrick type, contraindications |
| **Treatment** | Date, provider, procedure, products used, settings, lot numbers |
| **Post-Treatment** | Instructions given, adverse reactions, follow-up scheduled |
| **Photos** | Before/after with consistent lighting, angles, timestamped |

---

## 2. SOAP Notes for Aesthetics

### 2.1 SOAP Note Structure

SOAP (Subjective, Objective, Assessment, Plan) is the gold standard for structured clinical documentation.

#### Subjective
Document the patient's perspective:
- Chief complaint and treatment goals
- Areas of concern
- Previous treatments and outcomes
- Pain/discomfort levels
- Medication changes since last visit
- Lifestyle factors (sun exposure, skincare routine)

#### Objective
Clinical findings and observations:
- Vital signs (especially for IV therapy)
- Skin examination findings
- Fitzpatrick skin type
- Lesion/wrinkle characteristics
- Photo documentation
- Measurements (if applicable)

#### Assessment
Provider's clinical evaluation:
- Diagnosis or condition being treated
- Treatment appropriateness
- Risk assessment
- Expected outcomes
- Contraindications identified

#### Plan
Treatment and follow-up details:
- Procedure performed
- Products used (with lot numbers)
- Settings/parameters used
- Units/doses per area
- Post-care instructions
- Follow-up schedule
- Referrals if needed

### 2.2 SOAP Note Template for Aesthetics

```
PATIENT: [Name] | DOB: [Date] | Date of Service: [Date]
PROVIDER: [Name, Credentials]

SUBJECTIVE:
- Chief Complaint: [Patient's stated concerns]
- Treatment Goals: [Desired outcomes]
- Previous Treatments: [History of related procedures]
- Current Medications: [List]
- Allergies: [List]
- Pain Level: [0-10 scale]

OBJECTIVE:
- Vital Signs: BP [___] HR [___] Temp [___]
- Fitzpatrick Skin Type: [I-VI]
- Skin Assessment: [Findings by area]
- Photos Taken: [Yes/No - Reference numbers]
- Areas Examined: [List]

ASSESSMENT:
- Diagnosis/Condition: [ICD-10 codes if applicable]
- Treatment Candidacy: [Good/Fair/Poor]
- Risk Factors: [List any identified]

PLAN:
- Procedure: [Name]
- Products Used: [Name, Lot#, Expiry, Quantity]
- Treatment Areas: [With units/doses per area]
- Parameters/Settings: [Device-specific]
- Adverse Reactions: [None/Describe]
- Post-Care Instructions: [Given/Referenced]
- Follow-up: [Date/Timeframe]
- Next Treatment Plan: [Recommendations]

Provider Signature: _________________ Date: _________
```

### 2.3 DOT Phrases for Efficiency

Implement abbreviations for common documentation (as used by Zenoti):
- `.BOT` - Standard Botox post-treatment instructions
- `.FILLER` - Dermal filler aftercare
- `.LASER` - Laser treatment follow-up
- `.MICRO` - Microneedling post-care
- `.PEEL` - Chemical peel instructions

---

## 3. Injection Mapping

### 3.1 Face Mapping Overview

Face mapping is a technique to plan and mark exact injection points before administering neuromodulators or dermal fillers.

#### Purpose
- Ensure consistent results
- Avoid vascular structures
- Document treatment for future reference
- Enable side-by-side comparison
- Reduce complications (vascular occlusion, asymmetry)

### 3.2 Key Anatomical Landmarks

#### Critical Danger Zones
- Temporal vessels
- Supraorbital/supratrochlear vessels
- Angular artery (nose)
- Superior/inferior labial arteries
- Facial artery
- Zygomaticofacial vessels

#### Treatment Zones
| Zone | Common Treatments |
|------|-------------------|
| Glabella (11 lines) | Botox 20-30 units |
| Forehead | Botox 10-20 units |
| Crow's feet | Botox 10-30 units per side |
| Brow lift | Botox 4-10 units |
| Bunny lines | Botox 5-10 units per side |
| Lip flip | Botox 4-6 units |
| Masseter | Botox 15-50 units per side |
| Platysmal bands | Botox 25-50 units |
| Nasolabial folds | Filler 0.5-1.5mL per side |
| Marionette lines | Filler 0.5-1mL per side |
| Lips | Filler 0.5-2mL |
| Cheeks | Filler 1-2mL per side |
| Chin | Filler 1-2mL |
| Under eyes | Filler 0.5-1mL per side |

### 3.3 Injection Mapping Feature Requirements

#### Visual Mapping Interface
- Interactive face diagram (anterior, lateral, oblique views)
- Tap/click to add injection points
- Drag to reposition points
- Color coding by product type
- Size indicators for dosage

#### Data Capture Per Point
- X/Y coordinates on diagram
- Product name
- Units/mL injected
- Lot number (linked from inventory)
- Expiration date
- Needle/cannula gauge
- Depth notation
- Notes field

#### Comparison Features
- Side-by-side left/right comparison
- Historical comparison (previous visits)
- Overlay previous treatment maps
- Progress tracking over time

#### Templates
- Pre-built treatment patterns
- Customizable provider templates
- Save personal injection patterns
- Share templates across practice

### 3.4 Injection Map Data Model

```typescript
interface InjectionPoint {
  id: string;
  x: number;  // X coordinate on diagram (0-100%)
  y: number;  // Y coordinate on diagram (0-100%)
  zone: string;  // Anatomical zone
  side: 'left' | 'right' | 'center';
  product: {
    id: string;
    name: string;
    type: 'neurotoxin' | 'filler' | 'other';
    lotNumber: string;
    expirationDate: Date;
  };
  dosage: {
    amount: number;
    unit: 'units' | 'mL' | 'mg';
  };
  technique: {
    needle: string;  // e.g., "30G 1/2"
    depth: 'superficial' | 'dermal' | 'subcutaneous' | 'supraperiosteal';
    method: 'bolus' | 'linear' | 'fanning' | 'cross-hatching';
  };
  notes: string;
  timestamp: Date;
}

interface InjectionMap {
  id: string;
  patientId: string;
  providerId: string;
  treatmentId: string;
  date: Date;
  view: 'anterior' | 'left_lateral' | 'right_lateral' | 'oblique_left' | 'oblique_right';
  points: InjectionPoint[];
  totalUnits: { [productId: string]: number };
  photos: {
    before: string[];
    after: string[];
    marked: string[];
  };
  notes: string;
}
```

---

## 4. Treatment Templates

### 4.1 Botox/Neurotoxin Template

```
NEUROTOXIN TREATMENT RECORD

Patient: _________________ Date: _________
Provider: ________________

PRODUCT INFORMATION:
[ ] Botox  [ ] Dysport  [ ] Xeomin  [ ] Jeuveau  [ ] Daxxify
Lot Number: _____________ Expiry: _________
Reconstitution: ____mL saline = ____units/0.1mL
Vial opened: [time] Vial discarded: [time]

PRE-TREATMENT:
[ ] Consent signed
[ ] Contraindications reviewed (pregnancy, neuromuscular disease, aminoglycosides)
[ ] Photos taken
[ ] Allergies confirmed: _____________

TREATMENT AREAS:
| Area              | Units | Injection Points |
|-------------------|-------|------------------|
| Glabella          |       |                  |
| Frontalis         |       |                  |
| Crow's feet (L)   |       |                  |
| Crow's feet (R)   |       |                  |
| Brow lift         |       |                  |
| Bunny lines       |       |                  |
| Lip flip          |       |                  |
| Masseter (L)      |       |                  |
| Masseter (R)      |       |                  |
| Platysma          |       |                  |
| Hyperhidrosis     |       |                  |
| Other:            |       |                  |

TOTAL UNITS: _______

POST-TREATMENT:
[ ] Ice applied
[ ] Post-care instructions given
[ ] No immediate adverse reactions
[ ] Follow-up scheduled: _______

ADVERSE EVENTS: [ ] None
_______________________________________

Provider Signature: ___________________
```

### 4.2 Dermal Filler Template

```
DERMAL FILLER TREATMENT RECORD

Patient: _________________ Date: _________
Provider: ________________

PRODUCT INFORMATION:
Product: _________________
Type: [ ] HA  [ ] CaHA  [ ] PLLA  [ ] PMMA
Brand: ___________________
Lot Number: _____________ Expiry: _________
Syringe(s) Used: ______ Remaining: ______

PRE-TREATMENT:
[ ] Consent signed
[ ] Contraindications reviewed (autoimmune, keloids, active infection)
[ ] Photos taken (multiple angles)
[ ] Allergies confirmed: _____________
[ ] Previous filler history reviewed
[ ] Hyaluronidase available: [ ] Yes

TREATMENT AREAS:
| Area              | Volume (mL) | Technique    | Depth        |
|-------------------|-------------|--------------|--------------|
| Lips              |             |              |              |
| Nasolabial (L)    |             |              |              |
| Nasolabial (R)    |             |              |              |
| Marionette (L)    |             |              |              |
| Marionette (R)    |             |              |              |
| Cheeks (L)        |             |              |              |
| Cheeks (R)        |             |              |              |
| Under eye (L)     |             |              |              |
| Under eye (R)     |             |              |              |
| Chin              |             |              |              |
| Jawline (L)       |             |              |              |
| Jawline (R)       |             |              |              |
| Temple (L)        |             |              |              |
| Temple (R)        |             |              |              |
| Other:            |             |              |              |

TOTAL VOLUME: _______ mL

TECHNIQUE:
Needle gauge: _______ Cannula: _______
[ ] Aspiration performed before injection

POST-TREATMENT:
[ ] Ice applied
[ ] Massage performed (if indicated)
[ ] Post-care instructions given
[ ] Vascular compromise check: [ ] Pass
[ ] Follow-up scheduled: _______

ADVERSE EVENTS: [ ] None
[ ] Bruising  [ ] Swelling  [ ] Nodule  [ ] Asymmetry
[ ] Vascular concern: ________________
_______________________________________

Provider Signature: ___________________
```

### 4.3 Laser Treatment Template

```
LASER/ENERGY-BASED DEVICE TREATMENT RECORD

Patient: _________________ Date: _________
Provider: ________________

DEVICE INFORMATION:
Device: _________________
Handpiece: ______________
Last Calibration: _______

PRE-TREATMENT ASSESSMENT:
Fitzpatrick Skin Type: [ ] I  [ ] II  [ ] III  [ ] IV  [ ] V  [ ] VI
Indication: _____________
[ ] Consent signed
[ ] Contraindications reviewed
[ ] Sun exposure last 2 weeks: [ ] Yes [ ] No
[ ] Recent tanning: [ ] Yes [ ] No
[ ] Photosensitizing medications: [ ] Yes [ ] No
[ ] Test spot performed: [ ] Yes [ ] No - Results: _______
[ ] Eye protection provided (patient, operator, observers)
[ ] Photos taken

TREATMENT PARAMETERS:
| Setting      | Value |
|--------------|-------|
| Wavelength   |       |
| Fluence      |       |
| Pulse Width  |       |
| Spot Size    |       |
| Frequency    |       |
| Passes       |       |
| Cooling      |       |

TREATMENT AREAS:
_______________________________________
_______________________________________

TOPICAL ANESTHETIC:
[ ] None  [ ] EMLA  [ ] BLT  [ ] Other: _______
Applied: [time] Removed: [time]

IMMEDIATE RESPONSE:
[ ] Erythema  [ ] Edema  [ ] Frosting level: ___
[ ] Purpura  [ ] Other: _______

POST-TREATMENT:
[ ] Cooling applied
[ ] Post-care instructions given
[ ] SPF recommended
[ ] Follow-up scheduled: _______

ADVERSE EVENTS: [ ] None
[ ] Burn  [ ] Blister  [ ] Hyperpigmentation  [ ] Hypopigmentation
[ ] Scarring  [ ] Other: _______
_______________________________________

Provider Signature: ___________________
```

### 4.4 Microneedling Template

```
MICRONEEDLING TREATMENT RECORD

Patient: _________________ Date: _________
Provider: ________________

DEVICE INFORMATION:
Device: _________________
Cartridge Type: _________
[ ] Sterile cartridge used

PRE-TREATMENT ASSESSMENT:
Fitzpatrick Skin Type: [ ] I  [ ] II  [ ] III  [ ] IV  [ ] V  [ ] VI
Indication: [ ] Scarring  [ ] Wrinkles  [ ] Texture  [ ] Pigmentation  [ ] Other
[ ] Consent signed
[ ] Active infection/lesions: [ ] No
[ ] Recent isotretinoin (6 months): [ ] No
[ ] Keloidal tendency: [ ] No
[ ] Photos taken

TOPICAL ANESTHETIC:
Product: ________________
Applied: [time] Duration: ___ min

TREATMENT PARAMETERS:
| Area          | Depth (mm) | Speed | Passes | Serum Used |
|---------------|------------|-------|--------|------------|
| Forehead      |            |       |        |            |
| Cheeks        |            |       |        |            |
| Nose          |            |       |        |            |
| Chin          |            |       |        |            |
| Perioral      |            |       |        |            |
| Neck          |            |       |        |            |
| Other:        |            |       |        |            |

DEPTH GUIDELINES:
- Product absorption: 0.25mm
- Fine lines/pores: 0.5mm
- Moderate scars: 1.0mm
- Stubborn scars: 1.5mm
- Severe scars/stretch marks: 2.0mm+

POST-TREATMENT:
Immediate response: _______
[ ] Post-care mask applied
[ ] Growth factor/serum applied: _______
[ ] Post-care instructions given
[ ] Sun protection emphasized
[ ] Follow-up scheduled: _______

ADVERSE EVENTS: [ ] None
[ ] Excessive bleeding  [ ] Prolonged erythema
[ ] Infection  [ ] PIH  [ ] Other: _______

Provider Signature: ___________________
```

### 4.5 Chemical Peel Template

```
CHEMICAL PEEL TREATMENT RECORD

Patient: _________________ Date: _________
Provider: ________________

PRE-TREATMENT ASSESSMENT:
Fitzpatrick Skin Type: [ ] I  [ ] II  [ ] III  [ ] IV  [ ] V  [ ] VI
Previous peels: _________
Pre-conditioning regimen: [ ] Retinoid  [ ] Hydroquinone  [ ] Other
Duration of pre-conditioning: _______
[ ] Consent signed
[ ] Contraindications reviewed (isotretinoin, pregnancy, active HSV)
[ ] Photos taken

PEEL INFORMATION:
Peel Type: [ ] Superficial  [ ] Medium  [ ] Deep
Agent(s): ________________
Concentration: ___________%
pH: _____
Lot Number: _____________ Expiry: _________

TREATMENT:
Prep used: ______________
Application method: [ ] Gauze  [ ] Brush  [ ] Cotton-tipped
Number of layers/coats: _____
Total contact time: _____ min

AREAS TREATED:
[ ] Full face  [ ] Forehead  [ ] Cheeks  [ ] Nose
[ ] Chin  [ ] Perioral  [ ] Neck  [ ] Decollete
[ ] Hands  [ ] Other: _______

ENDPOINT OBSERVED:
[ ] Erythema only
[ ] Light frosting
[ ] White frosting
[ ] Gray/white solid frost
Neutralization time: _____

POST-TREATMENT:
Neutralizing agent: _______
Post-peel product: ________
[ ] Post-care instructions given
[ ] Sun avoidance emphasized
[ ] Antiviral prescribed (if indicated)
[ ] Follow-up scheduled: _______

ADVERSE EVENTS: [ ] None
[ ] Excessive erythema  [ ] Blistering  [ ] PIH
[ ] Hypopigmentation  [ ] Scarring  [ ] HSV outbreak

Provider Signature: ___________________
```

### 4.6 IV Therapy Template

```
IV THERAPY INFUSION RECORD

Patient: _________________ Date: _________
Provider: ________________
IV placed by: ____________

PRE-TREATMENT:
[ ] History & physical/good faith exam completed
[ ] Consent signed
[ ] Contraindications reviewed
[ ] Current medications confirmed
[ ] Labs reviewed (if applicable): _______

VITAL SIGNS:
| Time     | BP    | HR  | Temp  | SpO2  | Notes |
|----------|-------|-----|-------|-------|-------|
| Pre      |       |     |       |       |       |
| During   |       |     |       |       |       |
| Post     |       |     |       |       |       |

IV ACCESS:
Site: [ ] L antecubital  [ ] R antecubital  [ ] L forearm  [ ] R forearm  [ ] Hand
Gauge: [ ] 22G  [ ] 24G  [ ] Other: ____
Attempts: ___
Start time: ______

INFUSION CONTENTS:
Base fluid: _____________ Volume: _____mL
| Additive      | Dose    | Lot#     | Expiry   |
|---------------|---------|----------|----------|
|               |         |          |          |
|               |         |          |          |
|               |         |          |          |
|               |         |          |          |

[ ] Dual verification performed by: _______

INFUSION:
Start time: _______ End time: _______
Rate: _____mL/hr
Total volume infused: _____mL

MONITORING:
[ ] No adverse reactions during infusion
[ ] Patient tolerated well

POST-INFUSION:
[ ] IV removed without complication
[ ] Pressure applied, no hematoma
[ ] Post-care instructions given
[ ] Follow-up scheduled: _______

ADVERSE EVENTS: [ ] None
[ ] Infiltration  [ ] Extravasation  [ ] Allergic reaction
[ ] Nausea  [ ] Dizziness  [ ] Other: _______

Provider Signature: ___________________
```

---

## 5. Product/Inventory Tracking

### 5.1 Tracking Requirements by Product Type

#### Neurotoxins (Botox, Dysport, etc.)
- Track by individual units, not vials
- Cost per unit = vial price / units per vial
- Document reconstitution (saline volume, units/0.1mL)
- Record time opened and discarded
- Single-use vial documentation

#### Dermal Fillers
- Track by syringe (1mL = 1 syringe)
- Option to "bill for whole unit" even if partial use
- Document remaining product disposition
- Cross-linked vs. non-cross-linked notation

#### Device Consumables
- Cartridges (microneedling)
- Tips (radiofrequency, laser)
- Handpieces with usage counts

### 5.2 Lot Number Documentation

| Field | Description | Required |
|-------|-------------|----------|
| Product Name | Full product name | Yes |
| Manufacturer | Brand/manufacturer | Yes |
| Lot Number | Batch identifier | Yes |
| Expiration Date | Product expiry | Yes |
| Receipt Date | When received | Yes |
| Received By | Staff member | Yes |
| Storage Location | Refrigerator/shelf | Yes |
| Quantity | Units/syringes received | Yes |
| Unit Cost | Cost per unit | Yes |
| Supplier | Vendor name | Yes |

### 5.3 Vial Management Workflow

```
1. RECEIVE INVENTORY
   - Scan barcode (2D Datamatrix preferred)
   - Auto-populate: lot#, expiry, quantity
   - Verify against purchase order
   - Document storage location

2. OPEN VIAL/SYRINGE
   - Select from inventory
   - Record opening time
   - Assign to treatment/patient
   - For reconstitution: record diluent volume

3. USE PRODUCT
   - Link to treatment record
   - Deduct units/volume used
   - Calculate remaining

4. DISPOSE/RETURN
   - Document unused quantity
   - Record waste (required for controlled substances)
   - Time of disposal
   - Reason (expired, contaminated, patient no-show)
```

### 5.4 Waste Documentation

```typescript
interface ProductWaste {
  id: string;
  productId: string;
  lotNumber: string;
  quantityWasted: number;
  unit: 'units' | 'mL' | 'syringe';
  reason: 'expired' | 'contaminated' | 'unused' | 'spillage' | 'other';
  patientId?: string;  // If opened for specific patient
  treatmentId?: string;
  disposedBy: string;
  witnessedBy?: string;  // Required for controlled substances
  disposalTime: Date;
  notes: string;
}
```

### 5.5 Expiration Management

- Automated alerts at 90, 60, 30 days before expiry
- Dashboard for expiring products
- FIFO (First In, First Out) enforcement
- Prevent selection of expired products
- Track "almost expired" for promotional use

---

## 6. Treatment Plans

### 6.1 Multi-Session Treatment Series

#### Common Treatment Series
| Treatment | Sessions | Interval | Package |
|-----------|----------|----------|---------|
| Microneedling | 3-6 | 4-6 weeks | Yes |
| IPL/BBL | 3-5 | 3-4 weeks | Yes |
| Chemical Peels | 4-6 | 2-4 weeks | Yes |
| Laser Hair Removal | 6-8 | 4-8 weeks | Yes |
| Body Contouring | 3-6 | 4-6 weeks | Yes |
| PRP Therapy | 3 | 4 weeks | Yes |
| IV Therapy | Ongoing | 1-4 weeks | Membership |

### 6.2 Treatment Plan Data Model

```typescript
interface TreatmentPlan {
  id: string;
  patientId: string;
  createdBy: string;
  createdAt: Date;

  name: string;
  indication: string;
  goals: string[];

  treatments: TreatmentPlanItem[];

  status: 'active' | 'completed' | 'paused' | 'cancelled';

  package?: {
    packageId: string;
    totalSessions: number;
    usedSessions: number;
    remainingSessions: number;
    expirationDate: Date;
    price: number;
    paymentStatus: 'paid' | 'partial' | 'unpaid';
  };

  notes: string;
  outcomes: TreatmentOutcome[];
}

interface TreatmentPlanItem {
  id: string;
  treatmentType: string;
  scheduledDate?: Date;
  completedDate?: Date;
  status: 'scheduled' | 'completed' | 'missed' | 'rescheduled';
  sessionNumber: number;
  totalSessions: number;
  appointmentId?: string;
  notes: string;
}

interface TreatmentOutcome {
  date: Date;
  rating: 1 | 2 | 3 | 4 | 5;  // Satisfaction scale
  improvements: string[];
  concerns: string[];
  photos: string[];
  notes: string;
}
```

### 6.3 Results Documentation

#### Progress Tracking Elements
- Standardized photo angles and lighting
- Measurement tracking (if applicable)
- Patient satisfaction scores
- Before/during/after comparison
- Outcome vs. expectation assessment

#### Follow-Up Documentation
- Healing progression
- Adverse event monitoring
- Touch-up needs
- Next treatment recommendations
- Patient compliance with home care

---

## 7. Competitor Analysis

### 7.1 Zenoti

**Strengths:**
- AI-powered SOAP note generation
- Reduces charting time by 40%
- DOT phrases for efficiency
- Photo Manager with image ghosting/overlay
- Drag-and-drop form builder
- Built-in e-prescribing (95% US pharmacies)
- Multi-device access (desktop, tablet, mobile)
- Strong compliance dashboards

**Weaknesses:**
- Complex pricing structure
- Steeper learning curve
- Better suited for larger operations

**Best Feature to Emulate:** DOT phrases and AI-generated treatment summaries

### 7.2 PatientNow

**Strengths:**
- Aesthetic-specific since 2004
- Endorsed by ASPS
- Cosmetology-specific templates
- Before/after photo management
- ONC-ATCB certified
- Weight loss tracking
- Lab interface integration

**Weaknesses:**
- User interface requires significant training
- Reports of frequent crashes and slow performance
- Navigation can be difficult
- 65% of users are medical spas (focused market)

**Best Feature to Emulate:** Specialty-specific templates for aesthetics

### 7.3 Nextech

**Strengths:**
- Specialty-focused (derm, plastics, ophthalmology)
- iPad app replicates paper charting feel
- Smart stamping for efficiency
- Single-page customizable templates
- Automatic letter generation from findings
- Real-time dashboards

**Weaknesses:**
- Higher cost for full functionality
- Less focus on medical spas specifically
- More suited for surgical practices

**Best Feature to Emulate:** iPad charting experience and smart stamping

### 7.4 Pabau

**Strengths:**
- Face mapping with diagram plotting
- Automatic batch/lot tracking
- Client photo capture
- Pre-built toxin/filler templates
- Package management via client portal
- Unit calculator built-in

**Weaknesses:**
- Newer to US market
- Less robust reporting
- Limited integrations

**Best Feature to Emulate:** Interactive face mapping interface

### 7.5 Facetec

**Strengths:**
- Purpose-built for Botox and aesthetics
- Fast injection pattern recording
- Stores 29 photos per visit
- Dedicated injection site marking photos
- HIPAA and PIPEDA compliant
- Built for practitioners adding aesthetics to existing practice

**Weaknesses:**
- Limited practice management features
- Focused mainly on documentation

**Best Feature to Emulate:** Dedicated injection site marking photo storage

### 7.6 Common Practitioner Pain Points

Based on research, practitioners commonly complain about:

1. **Too Many Clicks** - Documentation requires excessive steps
2. **Poor Mobile Experience** - Mobile apps lack desktop functionality
3. **Hidden Costs** - Pricing complexity and unexpected fees
4. **Support Issues** - Reliance on chat vs. phone support
5. **Learning Curve** - Complex interfaces requiring extensive training
6. **Lack of Customization** - Templates that don't match workflow
7. **Photo Management** - Difficulty organizing and comparing photos
8. **Interoperability** - Systems don't talk to each other
9. **Contract Lock-in** - Long commitments without trials

---

## 8. API Design Recommendations

### 8.1 Standards Compliance

#### FHIR R4 (Recommended)
- 79% of vendors now support FHIR-enabled interfaces
- Required for 21st Century Cures Act compliance
- Uses modern REST, JSON, OAuth
- Modular resources for flexibility

#### Key FHIR Resources for Aesthetics
- `Patient` - Demographics, contact info
- `Practitioner` - Provider information
- `Appointment` - Scheduling
- `Encounter` - Treatment visits
- `Procedure` - Treatments performed
- `Observation` - Clinical findings, photos
- `MedicationAdministration` - Product usage
- `DocumentReference` - Photos, consent forms

### 8.2 REST API Endpoints

```
# Treatment Documentation
POST   /api/treatments
GET    /api/treatments/{id}
PUT    /api/treatments/{id}
DELETE /api/treatments/{id}

# SOAP Notes
POST   /api/patients/{patientId}/soap-notes
GET    /api/patients/{patientId}/soap-notes
GET    /api/soap-notes/{id}
PUT    /api/soap-notes/{id}

# Injection Mapping
POST   /api/treatments/{treatmentId}/injection-map
GET    /api/treatments/{treatmentId}/injection-map
PUT    /api/injection-maps/{id}
POST   /api/injection-maps/{id}/points
DELETE /api/injection-maps/{id}/points/{pointId}

# Photos
POST   /api/patients/{patientId}/photos
GET    /api/patients/{patientId}/photos
GET    /api/photos/{id}
DELETE /api/photos/{id}
POST   /api/photos/compare (side-by-side)

# Inventory
GET    /api/inventory
POST   /api/inventory/receive
POST   /api/inventory/{id}/use
POST   /api/inventory/{id}/waste
GET    /api/inventory/expiring

# Treatment Plans
POST   /api/patients/{patientId}/treatment-plans
GET    /api/patients/{patientId}/treatment-plans
GET    /api/treatment-plans/{id}
PUT    /api/treatment-plans/{id}
POST   /api/treatment-plans/{id}/sessions/{sessionNum}/complete

# Templates
GET    /api/templates
GET    /api/templates/{type}
POST   /api/templates
PUT    /api/templates/{id}
```

### 8.3 Data Models

```typescript
// Core Treatment Record
interface TreatmentRecord {
  id: string;
  patientId: string;
  providerId: string;
  appointmentId: string;

  date: Date;
  type: TreatmentType;
  status: 'in_progress' | 'completed' | 'cancelled';

  soapNote: SOAPNote;
  injectionMap?: InjectionMap;

  products: ProductUsage[];
  parameters?: DeviceParameters;

  photos: {
    before: Photo[];
    after: Photo[];
    marked: Photo[];
  };

  consent: {
    treatmentConsentId: string;
    photoConsentId: string;
    signedAt: Date;
  };

  postCare: {
    instructionsGiven: boolean;
    instructionsId: string;
    followUpDate?: Date;
  };

  adverseEvents: AdverseEvent[];

  createdAt: Date;
  updatedAt: Date;
  signedAt?: Date;
  signedBy?: string;
}

// Product Usage
interface ProductUsage {
  id: string;
  productId: string;
  productName: string;
  manufacturer: string;
  lotNumber: string;
  expirationDate: Date;
  quantity: number;
  unit: 'units' | 'mL' | 'mg' | 'syringe';
  vialOpenedAt?: Date;
  wasteQuantity?: number;
}

// Device Parameters
interface DeviceParameters {
  deviceId: string;
  deviceName: string;
  handpiece?: string;
  settings: { [key: string]: string | number };
  // Common settings:
  wavelength?: string;
  fluence?: string;
  pulseWidth?: string;
  spotSize?: string;
  frequency?: string;
  passes?: number;
  depth?: string;
  speed?: number;
}

// Adverse Event
interface AdverseEvent {
  id: string;
  type: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  onsetTime: Date;
  treatment?: string;
  resolution?: string;
  reportedToFDA: boolean;
  photos: string[];
}

// Photo
interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  type: 'before' | 'after' | 'marked' | 'progress' | 'adverse_event';
  angle: 'anterior' | 'left_lateral' | 'right_lateral' | 'oblique_left' | 'oblique_right' | 'other';
  takenAt: Date;
  takenBy: string;
  consentId: string;
  annotations?: PhotoAnnotation[];
  deidentified: boolean;
}
```

### 8.4 Webhook Events

```
treatment.created
treatment.updated
treatment.completed
treatment.cancelled

injection_map.created
injection_map.updated

photo.uploaded
photo.deleted

inventory.received
inventory.used
inventory.wasted
inventory.expiring_soon (7 days)
inventory.expired

treatment_plan.created
treatment_plan.session_completed
treatment_plan.completed

adverse_event.reported
```

---

## 9. Implementation Checklist

### 9.1 Phase 1: Core Documentation

- [ ] SOAP Note builder with aesthetic-specific sections
- [ ] Treatment record creation and management
- [ ] Consent form integration
- [ ] Basic photo capture and storage
- [ ] Provider signature/attestation

### 9.2 Phase 2: Injection Mapping

- [ ] Interactive face diagram (multiple views)
- [ ] Injection point placement
- [ ] Product/dosage per point
- [ ] Zone templates
- [ ] Historical comparison view
- [ ] Side-by-side left/right comparison

### 9.3 Phase 3: Treatment Templates

- [ ] Neurotoxin template
- [ ] Dermal filler template
- [ ] Laser/device template
- [ ] Microneedling template
- [ ] Chemical peel template
- [ ] IV therapy template
- [ ] Custom template builder

### 9.4 Phase 4: Inventory Integration

- [ ] Lot number tracking
- [ ] Expiration management
- [ ] Product usage linking
- [ ] Waste documentation
- [ ] Barcode scanning
- [ ] Reorder alerts

### 9.5 Phase 5: Treatment Plans

- [ ] Multi-session series creation
- [ ] Package tracking
- [ ] Session completion workflow
- [ ] Progress documentation
- [ ] Outcome tracking
- [ ] Patient satisfaction surveys

### 9.6 Phase 6: Advanced Features

- [ ] AI-assisted note generation
- [ ] DOT phrases
- [ ] Photo comparison tools (overlay, side-by-side)
- [ ] Complication reporting
- [ ] Analytics dashboard
- [ ] Mobile-optimized charting

---

## Sources

### Legal and Compliance
- [American Med Spa Association - Guidelines](https://facialesthetics.org/wp-content/uploads/2020/10/amspa_practice_guidelines.pdf)
- [MedSpa Compliance 2025 - Medical SPA RX](https://www.medicalsparx.com/medspa-compliance/)
- [Aesthetic Practice Standards 2025 - WAOCS](https://waocs.org/2025/11/18/aesthetic-practice-standards-2025-complete-guide-to-safety-regulations-certification-requirements-and-global-compliance/)
- [Med Spa Legal Requirements - AmSpa](https://americanmedspa.org/blog/medical-spa-legal-requirements)

### SOAP Notes
- [Dermatology SOAP Notes 2025 - TextExpander](https://textexpander.com/templates/dermatology-soap-note-examples)
- [SOAP Note Examples 2025 - S10.ai](https://s10.ai/blog/soap-note-examples-templates-2025)

### Injection Mapping
- [Botox Face Mapping Guide - Pabau](https://pabau.com/blog/botox-face-mapping/)
- [Filler Face Mapping - Pabau](https://pabau.com/blog/filler-face-mapping/)
- [Facetec Medical Aesthetics Software](https://facetec.ca/)
- [Botox Face Chart - Empire Medical Training](https://www.empiremedicaltraining.com/blog/botox-face-chart/)

### Treatment Documentation
- [Chemical Peels - StatPearls NCBI](https://www.ncbi.nlm.nih.gov/books/NBK547752/)
- [Standard Operating Protocol for Energy-Based Devices - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11626368/)
- [Microneedling Depth Guide - Essential Derma](https://essentialderma.com/blogs/learn/microneedling-depth-guide-chart)
- [IV Therapy in Medical Spas - AmSpa](https://americanmedspa.org/blog/iv-therapy-welcoming-wellness-in-medical-aesthetics)

### Photography and Privacy
- [HIPAA Photography Rules 2025 - HIPAA Journal](https://www.hipaajournal.com/hipaa-photography-rules/)
- [Before-and-After Photos HIPAA - Plastic Surgery Practice](https://plasticsurgerypractice.com/practice-management/photos-hipaa-compliant/)
- [HIPAA for Aesthetic Clinics - MERIDIQ](https://meridiq.com/en/security/understanding-hipaa-certification-for-aesthetic-clinics/)

### Inventory Management
- [Aesthetic Record Inventory Management](https://learn.aestheticrecord.com/en/articles/11095180-faq-inventory-management)
- [Vial Scanning - WeInfuse](https://weinfuse.com/vial-scanning-medication-administration/)

### Competitor Platforms
- [Zenoti Medical Spa Software](https://www.zenoti.com/medical-spa-software/)
- [Zenoti Forms and Charting](https://www.zenoti.com/platform/forms-and-charting/)
- [PatientNow Reviews 2025 - Software Advice](https://www.softwareadvice.com/medical/patientnow-profile/)
- [Nextech EMR 2025 - SelectHub](https://www.selecthub.com/p/ehr-software/nextech/)

### API Standards
- [FHIR and HL7 Integration Guide - BGO Software](https://www.bgosoftware.com/blog/understanding-the-roles-of-hl7-and-apis-in-a-healthcare-environment/)
- [Aesthetic EMR Development - Thinkitive](https://www.thinkitive.com/custom-ehr-emr-software-development/aesthetic.html)

### Complications and Adverse Events
- [Dermal Filler Adverse Events - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3865975/)
- [Complications of Toxins and Fillers - SAGE Journals](https://journals.sagepub.com/doi/10.1177/20501684231197717)

---

*Document prepared: December 2025*
*Research conducted using industry sources, regulatory guidelines, and competitive analysis*
