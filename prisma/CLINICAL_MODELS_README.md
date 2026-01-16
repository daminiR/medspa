# Clinical Features Prisma Models

This document describes the Prisma models created for clinical charting features based on the backend route implementations.

## Overview

The clinical models have been designed based on analyzing these route files:
- `/backend/src/routes/treatments.ts` - Treatment sessions with SOAP notes
- `/backend/src/routes/photos.ts` - Medical photo management
- `/backend/src/routes/forms.ts` - Form templates
- `/backend/src/routes/form-submissions.ts` - Form submissions with e-signatures
- `/backend/src/routes/treatment-templates.ts` - Treatment templates & provider playbooks
- `/backend/src/routes/charting-settings.ts` - Charting configuration

## Models Created

### 1. Treatment System

#### Treatment
Main treatment session model with SOAP notes support.

**Key Features:**
- Links to Patient, Provider, Appointment, Location
- Product type categorization (neurotoxin, filler, laser, skin, body, other)
- SOAP notes stored as JSON
- Sign-off workflow with co-signature support
- Status tracking (in-progress, completed, pending-review, cancelled)
- Audit trail with timestamps and user tracking

**Relations:**
- `injectionPoints` - InjectionPoint[]
- `productUsages` - ProductUsage[]
- `treatmentNotes` - TreatmentNote[]

#### TreatmentNote
Additional notes for treatments.

**Fields:**
- noteType: String (e.g., "clinical", "progress", "complication")
- content: String
- Audit fields

#### InjectionPoint
Face chart injection tracking.

**Key Features:**
- Zone-based positioning (references 25 standard face zones)
- X/Y coordinates as percentages (0-100)
- Product tracking (ID, name, units, volume)
- Technique details (depth, technique, needle gauge)
- Inventory tracking (lot number, expiration)
- Complication tracking

**Enums:**
- InjectionDepth: SUPERFICIAL, MID_DERMAL, DEEP_DERMAL, SUBCUTANEOUS, SUPRAPERIOSTEAL
- InjectionTechnique: SERIAL, LINEAR, FANNING, CROSS_HATCHING, BOLUS, DEPOT

#### ProductUsage
Product consumption tracking for treatments.

**Key Features:**
- Product identification and categorization
- Flexible quantity tracking (units, volume, packages)
- Inventory tracking (lot number, vial ID, expiration)
- Billing information (unit price, total price)

**Enum:**
- ProductCategory: NEUROTOXIN, FILLER, SKINCARE, ANESTHETIC, OTHER

### 2. Medical Photos & Annotations

#### Photo
Clinical photography with metadata.

**Key Features:**
- Storage keys for object storage (main image + thumbnail)
- Metadata (type, angle, body region, description)
- Consent tracking (photo consent, marketing consent)
- Processing status and dimensions
- Soft delete support
- Links to treatment and appointment

**Enums:**
- PhotoPhotoType: BEFORE, AFTER, DURING, PROGRESS, PROFILE, OTHER
- PhotoAngle: FRONT, LEFT, RIGHT, FORTY_FIVE_LEFT, FORTY_FIVE_RIGHT, TOP, CUSTOM

#### PhotoAnnotation
Annotations on medical photos.

**Key Features:**
- Percentage-based positioning (0-100)
- Multiple annotation types (marker, circle, arrow, text, measurement, area)
- Measurement tracking with units
- Reference linking to injection points, zones, or treatment areas
- Custom colors and labels

**Enums:**
- AnnotationType: MARKER, CIRCLE, ARROW, TEXT, MEASUREMENT, AREA
- AnnotationReferenceType: INJECTION_POINT, ZONE, TREATMENT_AREA

### 3. Digital Forms & Consent Management

#### FormTemplate
Reusable form templates.

**Key Features:**
- Slug-based identification
- Form type categorization
- Sections and fields stored as JSON
- Signature configuration (draw, type, both)
- Witness requirement flag
- Service ID linking
- Expiration days for validity
- Version tracking
- Active/inactive status
- Soft delete support

**Enum:**
- FormTemplateType: INTAKE, CONSENT, HIPAA, PHOTO_RELEASE, TREATMENT_SPECIFIC, MEDICAL_HISTORY, CUSTOM

**JSON Structure:**
- `sections`: Array of FormSection objects
  - Each section contains fields with validation rules
- `signature`: SignatureConfig object
  - required, type, legalText, dateRequired

#### FormSubmission
Patient form responses with e-signatures.

**Key Features:**
- Links to FormTemplate and Patient
- Status tracking (pending, in-progress, completed, expired)
- Field responses stored as JSON (field ID -> value mapping)
- Multiple signature types (patient, witness, provider)
- E-signature compliance (ESIGN Act)
  - Timestamps, IP address, user agent capture
  - Cannot modify after signing
- PDF generation tracking
- Expiration tracking

**Enum:**
- FormSubmissionStatus: PENDING, IN_PROGRESS, COMPLETED, EXPIRED

**JSON Structure:**
- `responses`: Record<string, any> - field ID to value mapping
- `patientSignature`, `witnessSignature`, `providerSignature`: SignatureData objects
  - type: 'draw' | 'type'
  - value: base64 image or typed name
  - timestamp, ipAddress, userAgent

#### PatientFormAssignment
Tracking of forms assigned to patients.

**Key Features:**
- Links form to patient and optionally appointment
- Due date tracking
- Status tracking
- Assignment audit trail

**Enum:**
- PatientFormStatus: PENDING, IN_PROGRESS, COMPLETED, EXPIRED

### 4. Treatment Templates & Protocols

#### TreatmentTemplate
Reusable treatment configurations.

**Key Features:**
- Product type categorization
- Default zones and products (JSON)
- SOAP note defaults (JSON)
- Estimated duration
- Required consents
- Aftercare instructions
- Global vs provider-specific visibility

**JSON Structure:**
- `defaultZones`: Array of TemplateZone objects
  - zoneId, defaultUnits, defaultVolume, technique, depth
- `defaultProducts`: Array of TemplateProduct objects
  - productId, productName, defaultUnits, defaultVolume
- `soapDefaults`: SOAPDefaults object
  - subjective, objective, assessment, plan sections

#### ProviderPlaybook
Personal protocols and quick phrases for providers.

**Key Features:**
- One per provider (unique constraint)
- Custom protocols (JSON array)
- DOT phrases for quick charting (JSON array)
- Product preferences (JSON object)

**JSON Structure:**
- `protocols`: Array of PlaybookProtocol objects
  - id, name, treatmentArea, productType, zones, notes
- `dotPhrases`: Array of DotPhrase objects
  - id, trigger (starts with '.'), expansion, category
- `defaultProductPreferences`: Record<string, string>

### 5. Charting Settings

#### ChartingSetting
Provider/location-specific charting preferences.

**Key Features:**
- Scoped by provider and/or location (unique combination)
- Display preferences (default view, auto-save interval)
- Zone configurations (JSON array)
- Measurement defaults (units vs ml)
- Quick actions (JSON array)

**Enums:**
- ChartingView: FACE_2D, FACE_3D, BODY
- MeasurementUnit: UNITS, ML

**JSON Structure:**
- `zoneConfigs`: Array of ZoneConfig objects
  - zoneId, zoneName, isEnabled, defaultUnits, defaultVolume, customColor
- `quickActions`: Array of QuickAction objects
  - id, label, action, productId, units

## Integration with Existing Models

### Patient Model
Add these relations to the existing Patient model:

```prisma
model Patient {
  // ... existing fields ...

  // Clinical relations
  treatments          Treatment[]      @relation("PatientTreatments")
  clinicalPhotos      Photo[]          @relation("clinicalPhotos")
  formSubmissions     FormSubmission[] @relation("formSubmissions")
}
```

### Appointment Model
The existing Appointment model already has photo relations. Consider adding:

```prisma
model Appointment {
  // ... existing fields ...

  // Clinical relation
  treatments          Treatment[]
}
```

## Face Zones Reference

The system supports 25 standard face zones for injection tracking:

**Upper Face:**
- forehead, glabella, temple-left, temple-right

**Mid Face:**
- crows-feet-left, crows-feet-right, bunny-lines, nasalis
- nasolabial-left, nasolabial-right, cheek-left, cheek-right
- tear-trough-left, tear-trough-right, nose

**Lower Face:**
- upper-lip, lower-lip, chin, marionette-left, marionette-right
- jawline-left, jawline-right, masseter-left, masseter-right, neck

Each zone has default units and/or volume recommendations.

## SOAP Notes Structure

SOAP notes are stored as JSON in the Treatment model with this structure:

```typescript
{
  subjective: {
    chiefComplaint: string
    patientGoals: string
    medicalHistory: string
    allergies: string
    currentMedications: string
    previousTreatments: string
    lastTreatmentDate?: string
    socialHistory?: string
  },
  objective: {
    vitalSigns?: {
      bloodPressure?: string
      heartRate?: number
      temperature?: number
    }
    skinAssessment: string
    fitzpatrickType?: number (1-6)
    photographs: string
    physicalExam?: string
  },
  assessment: {
    diagnosis: string
    treatmentCandidacy: string
    contraindications: string
    consentObtained: boolean
    consentFormId?: string
  },
  plan: {
    treatmentPerformed: string
    productsUsed: string
    technique: string
    aftercareInstructions: string
    followUpPlan: string
    prescriptions?: string
    warnings?: string
    nextAppointment?: string
  }
}
```

## E-Signature Compliance

FormSubmission signatures comply with ESIGN Act requirements:

1. **Capture Required Data:**
   - Signature type (draw or type)
   - Signature value (base64 image or typed name)
   - Timestamp
   - IP address
   - User agent

2. **Legal Safeguards:**
   - Legal disclosure text in form template
   - Cannot modify after signing
   - Audit log for all signature events

3. **Signature Types:**
   - Patient signature (always required)
   - Witness signature (when requiresWitness = true)
   - Provider signature (when requiresProviderSignature = true)

## Migration Steps

1. **Add the models to your main schema.prisma:**
   - Copy models from `schema-clinical-additions.prisma`
   - Add relations to Patient model

2. **Create and run migration:**
   ```bash
   npx prisma migrate dev --name add_clinical_models
   ```

3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Update backend routes to use Prisma:**
   - Replace in-memory stores with Prisma queries
   - Update validation to match Prisma types
   - Ensure proper transaction handling for related records

## Indexes

The models include strategic indexes for common query patterns:

- **Treatment**: patientId, providerId, status, startTime
- **InjectionPoint**: treatmentId, zoneId
- **ProductUsage**: treatmentId, productId
- **Photo**: patientId, treatmentId, type, uploadedAt
- **PhotoAnnotation**: photoId
- **FormTemplate**: type, isActive, slug
- **FormSubmission**: formId, patientId, status
- **PatientFormAssignment**: formId, patientId, status
- **TreatmentTemplate**: productType, isGlobal, providerId
- **ProviderPlaybook**: providerId (unique)
- **ChartingSetting**: providerId, locationId (unique combination)

## JSON Fields Best Practices

Several models use JSON fields for flexibility:

1. **SOAP Notes** (Treatment.soapNotes)
   - Allows for evolving structure
   - Use TypeScript types for type safety
   - Validate on application layer

2. **Form Sections** (FormTemplate.sections)
   - Dynamic form builder compatibility
   - Field definitions with validation rules

3. **Signatures** (FormSubmission signatures)
   - E-signature metadata
   - ESIGN compliance data

4. **Templates** (TreatmentTemplate zones/products)
   - Flexible configuration
   - Provider customization

5. **Settings** (ChartingSetting configs)
   - User preference storage
   - Quick action definitions

When working with JSON fields, always define TypeScript interfaces for type safety and validation schemas for runtime validation.

## Testing Considerations

When writing tests for these models:

1. **Relationships**: Test cascade deletes and relationship integrity
2. **Constraints**: Verify unique constraints (especially providerId in ProviderPlaybook)
3. **Enums**: Test all enum values are valid
4. **JSON Validation**: Test JSON structure validation at application layer
5. **Audit Fields**: Verify timestamps and user tracking
6. **Soft Deletes**: Test deletedAt filtering for Photo and FormTemplate
7. **Status Transitions**: Test valid state transitions for Treatment and FormSubmission
8. **E-Signature**: Test signature capture and immutability

## Performance Considerations

1. **Indexes**: All foreign keys and commonly filtered fields are indexed
2. **JSON Fields**: Consider adding GIN indexes for JSON fields if using PostgreSQL
3. **Pagination**: Use cursor-based pagination for large datasets
4. **Eager Loading**: Use Prisma include/select to avoid N+1 queries
5. **Soft Deletes**: Always filter deletedAt in queries for Photo and FormTemplate
