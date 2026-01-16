# Digital Forms & E-Signature System

## Implementation Guide

This document provides a comprehensive overview of the Digital Forms & E-Signature system implemented for the Luxe Medical Spa patient portal.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Form Schema](#form-schema)
5. [Pre-built Templates](#pre-built-templates)
6. [API Integration](#api-integration)
7. [Features](#features)
8. [Testing Guide](#testing-guide)
9. [Security & Compliance](#security--compliance)

---

## Overview

The Digital Forms & E-Signature system enables patients to complete required medical forms electronically before their appointments. This system is critical for medical spa compliance and streamlines the patient intake process.

### Key Features

- **Dynamic Form Rendering** - JSON-based form schemas rendered into interactive forms
- **E-Signature Capture** - Touch/mouse signature pad with timestamp and IP capture
- **Progress Tracking** - Real-time completion percentage with section navigation
- **Auto-Save** - Automatic draft saving every 30 seconds
- **Pre-filling** - Auto-populate fields from patient profile data
- **Conditional Logic** - Show/hide fields based on previous answers
- **Offline Support** - Complete forms offline (mobile) and sync when online
- **PDF Generation** - Generate PDF copies of completed forms
- **Audit Trail** - Full history of form interactions for HIPAA compliance

---

## Architecture

### Directory Structure

```
/packages/types/src/
  forms.ts                 # Shared TypeScript types

/apps/patient-mobile/
  components/forms/
    FormField.tsx          # Individual field components
    FormProgress.tsx       # Progress indicator
    FormRenderer.tsx       # Main form rendering engine
    SignaturePad.tsx       # Signature capture
    index.ts
  app/forms/
    _layout.tsx            # Navigation layout
    index.tsx              # Forms list screen
    [formId].tsx           # Form completion screen
    history.tsx            # Form history screen
  services/forms/
    formService.ts         # API integration
    formTemplates.ts       # Pre-built form templates
    index.ts

/apps/patient-web/
  components/forms/
    FormField.tsx          # Web-optimized field components
    FormProgress.tsx       # Web progress indicator
    FormRenderer.tsx       # Web form renderer
    SignaturePad.tsx       # HTML5 canvas signature
    index.ts
  app/forms/
    page.tsx               # Forms list page
    [formId]/page.tsx      # Form completion page
    history/page.tsx       # Form history page
  lib/forms/
    formService.ts         # Web API integration
    formTemplates.ts       # Form templates
    index.ts
```

---

## Components

### FormRenderer

The main form rendering component that processes JSON schemas.

```typescript
import { FormRenderer, FormRendererRef } from '@/components/forms';

const formRef = useRef<FormRendererRef>(null);

<FormRenderer
  ref={formRef}
  schema={formSchema}
  initialResponses={[]}
  prefillData={patientData}
  onSubmit={handleSubmit}
  onSaveDraft={handleSaveDraft}
  onProgressChange={handleProgress}
  autoSaveEnabled={true}
  autoSaveInterval={30000}
  showProgress={true}
  showNavigation={true}
/>
```

**Ref Methods:**
- `validate()` - Validate all fields and return result
- `getResponses()` - Get current form responses
- `getSignatures()` - Get captured signatures
- `saveDraft()` - Manually save draft
- `submit()` - Submit the form
- `goToSection(index)` - Navigate to specific section

### SignaturePad

Touch/mouse-based signature capture component.

```typescript
import { SignaturePad, SignaturePadRef } from '@/components/forms';

const sigRef = useRef<SignaturePadRef>(null);

<SignaturePad
  ref={sigRef}
  label="Patient Signature"
  disclaimer="By signing, I certify..."
  required={true}
  onSignatureEnd={(base64) => handleSignature(base64)}
/>
```

### FormField

Renders individual form fields based on type.

**Supported Field Types:**
- text, email, phone, ssn
- number
- date, time, datetime
- select, multiselect, radio, checkboxGroup
- textarea, multiline
- checkbox, yesNo, consent
- slider, rating
- header, paragraph, divider, spacer
- signature, file, image, address

### FormProgress

Visual progress indicator with section navigation.

```typescript
<FormProgress
  sections={sectionProgress}
  currentSectionIndex={0}
  overallProgress={45}
  onSectionPress={(index) => goToSection(index)}
  variant="compact" // or "detailed", "minimal"
  estimatedMinutes={15}
/>
```

---

## Form Schema

Forms are defined using JSON schemas with the following structure:

```typescript
interface FormSchema {
  id: string;
  slug: string;
  title: string;
  description?: string;
  version: string;
  category: FormCategory;
  status: 'draft' | 'published' | 'archived';
  sections: FormSection[];
  signature?: FormSignatureConfig;
  settings: FormSettings;
  metadata: FormMetadata;
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  conditionalLogic?: ConditionalLogic;
}

interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  validation?: FieldValidation;
  conditionalLogic?: ConditionalLogic;
  prefillKey?: string; // Maps to patient profile data
  options?: SelectOption[]; // For select/radio/checkbox fields
}
```

### Conditional Logic Example

```typescript
{
  id: 'surgery_details',
  type: 'textarea',
  label: 'Surgery Details',
  conditionalLogic: {
    rules: [
      {
        id: 'show-if-surgery',
        sourceFieldId: 'had_surgery',
        operator: 'equals',
        value: true,
        action: 'show'
      }
    ],
    logic: 'and'
  }
}
```

---

## Pre-built Templates

### 1. Medical Intake Questionnaire
- Personal information
- Emergency contact
- Medical history (allergies, medications, conditions)
- Aesthetic treatment history
- Lifestyle questions
- **~15 minutes to complete**

### 2. HIPAA Authorization Form
- Patient identification
- Authorization types (treatment, payment, operations, marketing)
- Third-party disclosure consent
- Patient rights acknowledgment
- **~5 minutes to complete**

### 3. Photography Release Form
- Clinical photography consent
- Marketing/educational use options
- Platform selection
- Compensation and withdrawal acknowledgments
- **~5 minutes to complete**

### 4. Botox/Neurotoxin Consent Form
- Treatment area selection
- Benefits and risks disclosure
- Contraindications confirmation
- Pre/post care instructions
- Final consent and financial responsibility
- **~10 minutes to complete**

### 5. Payment Authorization Form
- Payment policies acknowledgment
- Cancellation policy acceptance
- Card-on-file authorization
- **~5 minutes to complete**

---

## API Integration

### Form Service Methods

```typescript
// Get patient form requirements
const requirements = await formService.getPatientFormRequirements(patientId);

// Get form schema and existing submission
const { form, submission, prefillData } = await formService.getForm(formId);

// Save draft
await formService.saveDraft(formId, submissionId, responses, signatures, progress);

// Submit completed form
const result = await formService.submitForm(formId, submissionId, responses, signatures);

// Get form history
const { submissions, total, hasMore } = await formService.getFormHistory(patientId);
```

### API Endpoints (Backend Integration)

| Endpoint | Method | Description |
|----------|--------|-------------|
| /patients/:id/form-requirements | GET | Get required/optional forms |
| /forms/:id | GET | Get form schema |
| /forms/:id/submissions/:subId | GET | Get specific submission |
| /forms/:id/draft | POST | Save draft |
| /forms/:id/submit | POST | Submit form |
| /patients/:id/form-history | GET | Get submission history |

---

## Features

### Auto-Save
Forms automatically save every 30 seconds (configurable). Draft indicator shows when changes are unsaved.

### Pre-filling
Fields can be auto-populated from patient profile data using the `prefillKey` property:
- `fullName` -> Patient's full name
- `email` -> Email address
- `phone` -> Phone number
- `dateOfBirth` -> Date of birth
- `address.city` -> City from address
- `emergencyContact.name` -> Emergency contact name

### Validation
- Required field validation
- Format validation (email, phone)
- Min/max length validation
- Pattern matching (regex)
- Custom validation rules

### Progress Tracking
- Overall completion percentage
- Section-by-section progress
- Visual indicators for completed/in-progress/error sections
- Estimated time remaining

---

## Testing Guide

### Mobile Testing (Expo)

1. Start the development server:
```bash
cd apps/patient-mobile
npx expo start
```

2. Test on device:
- Scan QR code with Expo Go app
- Navigate to Forms from the main menu
- Complete each form type
- Test signature capture with finger
- Verify auto-save functionality
- Test offline completion (airplane mode)

### Web Testing (Next.js)

1. Start the development server:
```bash
cd apps/patient-web
npm run dev
```

2. Open http://localhost:3000/forms

3. Test scenarios:
- Complete forms with mouse signature
- Test conditional field visibility
- Verify progress tracking accuracy
- Test draft save/restore
- Check PDF download functionality

### Test Checklist

- [ ] Forms list loads correctly
- [ ] Required forms show "Required" badge
- [ ] Form sections navigate properly
- [ ] All field types render correctly
- [ ] Conditional fields show/hide correctly
- [ ] Validation errors display properly
- [ ] Signature capture works (touch and mouse)
- [ ] Auto-save triggers after changes
- [ ] Draft restore works on page reload
- [ ] Form submission succeeds
- [ ] Success message displays
- [ ] History page shows completed forms
- [ ] PDF view/download works

---

## Security & Compliance

### HIPAA Compliance

1. **Encrypted Storage** - All form data marked with `encryptionRequired: true` is encrypted at rest
2. **Audit Trail** - Complete logging of all form interactions
3. **Access Control** - Forms require authentication
4. **Data Minimization** - Only collect necessary information
5. **Consent Tracking** - HIPAA authorization captured with signature

### Signature Legal Requirements

- Timestamp captured with each signature
- IP address logged (optional, configurable)
- User agent recorded
- Non-repudiation through audit trail

### Data Security

- All API calls over HTTPS
- Session-based authentication required
- Form data encrypted in transit
- Secure storage of signature images
- No sensitive data in client-side storage

---

## Integration Points

### Appointment Confirmation
Link patients to complete forms before appointments:
```
/forms?appointmentId=apt-123
```

### Dashboard Widget
Display incomplete forms count on patient dashboard:
```typescript
const { totalRequired, totalCompleted, allRequiredComplete } = 
  await formService.getPatientFormRequirements(patientId);
```

### Reminder Integration
Forms with `reminderEnabled: true` and `reminderHoursBefore: 24` in metadata will trigger reminder notifications.

---

## Future Enhancements

1. **PDF Generation** - Server-side PDF generation with form responses
2. **Form Builder** - Admin interface to create/edit form schemas
3. **Version Management** - Track form version changes and migrations
4. **Analytics** - Completion rates, drop-off analysis
5. **Multi-language** - Internationalization support
6. **Accessibility** - WCAG 2.1 AA compliance audit

---

## Support

For questions or issues, contact the development team or refer to the main project documentation.
