# Patient Management System - Architecture & Design

## System Overview

The Patient Management system is the core of our medical spa platform, managing all patient-related data and operations. It integrates seamlessly with our existing appointment, billing, and charting systems.

## Tech Stack Alignment

### Frontend
- **Next.js 14+** (App Router)
- **React 18+** with TypeScript
- **Tailwind CSS** for styling
- **React Hook Form + Zod** for form validation
- **Lucide React** for icons
- **Date-fns** for date handling

### Backend (Future)
- API routes in Next.js
- PostgreSQL database
- Prisma ORM

## Data Architecture

### Core Entities

```typescript
// Enhanced Patient entity extending existing basic structure
interface Patient {
  // Identity
  id: string
  patientNumber: string // Auto-generated unique identifier
  
  // Demographics
  firstName: string
  lastName: string
  preferredName?: string
  pronouns?: string
  dateOfBirth: Date
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  
  // Contact Information
  email: string
  phone: string
  alternatePhone?: string
  address: Address
  timezone?: string
  
  // Emergency Contact
  emergencyContact: EmergencyContact
  
  // Medical Information
  allergies: Allergy[]
  medications: Medication[]
  medicalAlerts: MedicalAlert[]
  medicalHistory: MedicalHistory[]
  skinType?: FitzpatrickType // Medical spa specific
  
  // Administrative
  status: 'active' | 'inactive' | 'deceased'
  registrationDate: Date
  lastVisit?: Date
  source?: PatientSource
  referredBy?: string
  
  // Relationships
  familyMembers?: FamilyRelationship[]
  primaryProviderId?: string
  
  // Financial
  balance: number
  credits: number
  insurance?: InsurancePolicy[]
  
  // Preferences
  communicationPreferences: CommunicationPrefs
  appointmentPreferences: AppointmentPrefs
  privacySettings: PrivacySettings
  
  // Metadata
  tags?: string[]
  customFields?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastModifiedBy: string
}

interface MedicalAlert {
  id: string
  type: 'allergy' | 'condition' | 'medication' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  addedDate: Date
  addedBy: string
  active: boolean
}

interface FamilyRelationship {
  patientId: string
  relationship: 'spouse' | 'parent' | 'child' | 'sibling' | 'other'
  isPrimaryContact: boolean
  hasFinancialAccess: boolean
  hasMedicalAccess: boolean
}
```

## Component Architecture

### Directory Structure
```
apps/admin/src/
├── components/
│   └── patients/
│       ├── PatientList.tsx          // Main list view
│       ├── PatientSearch.tsx        // Global search
│       ├── PatientProfile.tsx       // Full profile view
│       ├── PatientForm.tsx          // Create/Edit form
│       ├── PatientCard.tsx          // Compact view
│       ├── MedicalAlerts.tsx        // Alert management
│       ├── PatientNotes.tsx         // Note system
│       ├── FamilyMembers.tsx        // Family management
│       └── PatientHistory.tsx       // Visit history
├── app/
│   └── patients/
│       ├── page.tsx                 // Patient list page
│       ├── [id]/
│       │   ├── page.tsx             // Patient detail
│       │   ├── edit/page.tsx       // Edit patient
│       │   └── history/page.tsx    // Full history
│       └── new/page.tsx             // Create patient
└── lib/
    ├── patients/
    │   ├── actions.ts               // Server actions
    │   ├── utils.ts                 // Utilities
    │   └── validators.ts            // Zod schemas
    └── data/
        └── patients.ts              // Mock data
```

## UI/UX Design Principles

### Based on Jane App Analysis

1. **Clean, Card-Based Layout**
   - White cards on light gray background
   - Clear visual hierarchy
   - Consistent spacing and padding

2. **Quick Actions**
   - Single-click to view profile
   - Inline editing where appropriate
   - Bulk operations support

3. **Smart Search**
   - Search by name, email, phone, patient number
   - Auto-complete suggestions
   - Recent searches

4. **Visual Indicators**
   - Color-coded status badges
   - Medical alert icons
   - Last visit timestamps

## Integration Points

### 1. Appointment System
```typescript
// Existing appointment system integration
interface AppointmentIntegration {
  getPatientAppointments(patientId: string): Appointment[]
  getUpcomingAppointments(patientId: string): Appointment[]
  bookAppointment(patientId: string, data: AppointmentData): void
}
```

### 2. Billing System
```typescript
// Billing system integration
interface BillingIntegration {
  getPatientInvoices(patientId: string): Invoice[]
  getPatientBalance(patientId: string): number
  applyCredit(patientId: string, amount: number): void
}
```

### 3. Charting System
```typescript
// Charting system integration
interface ChartingIntegration {
  getPatientCharts(patientId: string): ChartNote[]
  createChartNote(patientId: string, note: ChartNote): void
}
```

## State Management

### Client-Side State
```typescript
// Using React Context for patient state
interface PatientContextValue {
  patients: Patient[]
  selectedPatient: Patient | null
  isLoading: boolean
  error: Error | null
  
  // Actions
  searchPatients: (query: string) => Promise<Patient[]>
  getPatient: (id: string) => Promise<Patient>
  createPatient: (data: PatientInput) => Promise<Patient>
  updatePatient: (id: string, data: Partial<Patient>) => Promise<Patient>
  deletePatient: (id: string) => Promise<void>
}
```

### Server-Side State
- Use Next.js Server Components for initial data fetch
- Server Actions for mutations
- Revalidate on demand

## Security & Privacy

### Access Control
```typescript
enum PatientAccessLevel {
  VIEW_BASIC = 'view_basic',        // Name, contact
  VIEW_MEDICAL = 'view_medical',    // Medical history
  VIEW_FINANCIAL = 'view_financial', // Billing info
  EDIT_BASIC = 'edit_basic',
  EDIT_MEDICAL = 'edit_medical',
  EDIT_FINANCIAL = 'edit_financial',
  DELETE = 'delete'
}
```

### Privacy Features
- Privacy mode for sensitive patients
- Audit trail for all accesses
- Data encryption at rest
- HIPAA compliance logging

## Performance Optimization

### Frontend
- Virtual scrolling for large patient lists
- Lazy loading of patient details
- Optimistic UI updates
- Image optimization for patient photos

### Backend
- Indexed database searches
- Paginated results
- Query caching
- Batch operations

## Medical Spa Specific Features

### 1. Aesthetic Profile
```typescript
interface AestheticProfile {
  skinType: FitzpatrickType
  skinConcerns: string[]
  treatmentGoals: string[]
  previousTreatments: TreatmentHistory[]
  contraindications: string[]
  photoConsent: boolean
  photoGallery: Photo[]
}
```

### 2. Treatment Tracking
```typescript
interface TreatmentTracking {
  botoxUnits: Record<string, number> // Area -> units
  fillerVolumes: Record<string, number> // Area -> ml
  lastTreatmentDates: Record<string, Date>
  nextRecommended: Date
  provider: string
}
```

### 3. Product Reactions
```typescript
interface ProductReaction {
  productName: string
  reaction: string
  severity: 'mild' | 'moderate' | 'severe'
  date: Date
  notes: string
}
```

## Implementation Phases

### Phase 1: Core CRUD (Week 1)
- [x] Enhanced data models
- [ ] Basic patient list
- [ ] Create patient form
- [ ] View patient profile
- [ ] Edit patient info
- [ ] Delete patient

### Phase 2: Search & Filter (Week 1)
- [ ] Global search
- [ ] Advanced filters
- [ ] Sort options
- [ ] Bulk operations

### Phase 3: Medical Information (Week 2)
- [ ] Allergy management
- [ ] Medication tracking
- [ ] Medical alerts
- [ ] Skin typing

### Phase 4: Integration (Week 2)
- [ ] Link with appointments
- [ ] Link with billing
- [ ] Link with charting

## Success Criteria

1. **Performance**
   - Patient search < 200ms
   - Profile load < 500ms
   - Form submission < 1s

2. **Usability**
   - Intuitive navigation
   - Mobile responsive
   - Accessibility compliant

3. **Data Quality**
   - Validation on all inputs
   - Duplicate detection
   - Data consistency checks

4. **Security**
   - Role-based access
   - Audit trails
   - HIPAA compliance

## Next Steps

1. Implement enhanced Patient type
2. Create PatientList component
3. Build PatientSearch functionality
4. Develop PatientProfile view
5. Add PatientForm for CRUD
6. Integrate with existing systems

---

*This design ensures seamless integration with our existing codebase while providing a robust, scalable patient management system tailored for medical spa operations.*