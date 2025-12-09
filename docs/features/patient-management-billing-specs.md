# Patient Management & Billing Feature Specifications

## Based on Jane App Analysis with Medical Spa Enhancements

---

# SECTION 1: PATIENT MANAGEMENT

## 1.1 Patient Profile Structure

### Core Patient Information (Jane Features + Enhancements)
```typescript
interface PatientProfile {
  // Basic Information
  id: string
  firstName: string
  lastName: string
  preferredName?: string  // Jane feature
  pronouns?: string       // Jane feature
  dateOfBirth: Date
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  
  // Contact Information
  email: string
  phone: string
  alternatePhone?: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  
  // Medical Spa Specific
  skinType: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI'  // Fitzpatrick scale
  allergies: string[]
  medications: string[]
  medicalConditions: string[]
  
  // Aesthetic History (Enhancement)
  previousTreatments: {
    treatment: string
    date: Date
    provider: string
    notes: string
  }[]
  
  // Photos
  profilePhoto?: string
  beforeAfterPhotos: {
    id: string
    date: Date
    type: 'before' | 'after' | 'progress'
    treatmentId?: string
    url: string
    consent: boolean
  }[]
  
  // Administrative
  status: 'active' | 'inactive' | 'deceased' | 'discharged'
  createdAt: Date
  updatedAt: Date
  tags: string[]  // VIP, sensitive, etc.
  
  // Relationships (Jane feature)
  relationships: {
    patientId: string
    relationshipType: 'spouse' | 'parent' | 'child' | 'partner' | 'other'
    isPrimary: boolean  // For billing
  }[]
  
  // Preferences
  communicationPreferences: {
    email: boolean
    sms: boolean
    phone: boolean
    marketing: boolean
  }
  
  // Portal Access
  portalEnabled: boolean
  lastPortalLogin?: Date
  
  // Insurance (Optional for medical spa)
  insurance?: {
    provider: string
    policyNumber: string
    groupNumber: string
  }
}
```

### 1.2 Patient Search & Filter Features

#### Search Capabilities (Jane-inspired + Enhanced)
- **Quick Search**: Name, phone, email, patient ID
- **Advanced Filters**:
  - Age range
  - Last visit date range
  - Treatment history
  - Outstanding balance
  - Birthday this month
  - VIP/Tagged patients
  - Inactive patients
  - Consent status

#### UI Components Needed
```typescript
// Patient List View
interface PatientListView {
  searchBar: SearchComponent
  filterPanel: FilterPanel
  patientGrid: DataGrid
  quickActions: {
    bookAppointment: boolean
    viewProfile: boolean
    sendMessage: boolean
    viewChart: boolean
  }
  bulkActions: {
    exportList: boolean
    sendBulkMessage: boolean
    tagPatients: boolean
  }
}
```

### 1.3 Patient Details Page Layout

#### Tabs Structure (Based on Jane)
1. **Overview Tab**
   - Demographics
   - Contact info
   - Quick stats (last visit, total spent, upcoming appointments)
   - Medical alerts
   - Tags

2. **Appointments Tab**
   - Upcoming appointments
   - Past appointments
   - No-shows/cancellations
   - Appointment history timeline

3. **Billing Tab**
   - Outstanding balance
   - Payment history
   - Invoices
   - Credits
   - Packages/Memberships

4. **Charts Tab**
   - Treatment notes
   - Consent forms
   - Files/Documents
   - Photos

5. **Communications Tab**
   - Message history
   - Email/SMS log
   - Portal messages

6. **Relationships Tab** (Jane feature)
   - Family members
   - Shared payment methods
   - Authorized contacts

### 1.4 Medical Spa Specific Enhancements

#### Aesthetic Profile Section
```typescript
interface AestheticProfile {
  // Skin Analysis
  skinAnalysis: {
    date: Date
    fitzpatrickType: number
    concerns: string[]
    goals: string[]
    analysisImages?: string[]
  }
  
  // Treatment Preferences
  preferences: {
    painTolerance: 'low' | 'medium' | 'high'
    downtimeAcceptable: boolean
    budgetRange?: string
    areasOfConcern: string[]
  }
  
  // Contraindications
  contraindications: {
    pregnancy: boolean
    breastfeeding: boolean
    keloidScarring: boolean
    autoimmune: boolean
    bloodThinners: boolean
    recentSunExposure: boolean
    activeInfections: boolean
  }
  
  // Product Reactions
  productReactions: {
    product: string
    reaction: string
    date: Date
  }[]
}
```

---

# SECTION 2: BILLING & PAYMENTS

## 2.1 Invoice Management System

### Invoice Structure (Jane-based + Enhanced)
```typescript
interface Invoice {
  // Basic Info
  id: string
  invoiceNumber: string
  patientId: string
  practitionerId: string
  locationId: string
  
  // Dates
  invoiceDate: Date
  dueDate: Date
  serviceDate: Date
  
  // Line Items (Jane feature + enhancements)
  lineItems: {
    id: string
    type: 'service' | 'product' | 'package' | 'membership'
    itemId: string
    description: string
    quantity: number
    unitPrice: number
    
    // Per-unit billing (Jane feature for Botox/fillers)
    unitType?: 'unit' | 'syringe' | 'vial' | 'ml' | 'hour'
    
    // Discounts
    discount?: {
      type: 'percentage' | 'fixed'
      value: number
      reason: string
    }
    
    tax: {
      rate: number
      amount: number
    }
    
    total: number
  }[]
  
  // Totals
  subtotal: number
  taxTotal: number
  discountTotal: number
  total: number
  
  // Payments
  payments: {
    id: string
    date: Date
    amount: number
    method: PaymentMethod
    reference?: string
  }[]
  
  // Status
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled'
  
  // Notes
  internalNotes?: string
  patientNotes?: string
  
  // Attachments
  attachments?: {
    type: 'consent' | 'photo' | 'other'
    url: string
  }[]
}
```

### 2.2 Payment Processing Features

#### Payment Methods (Jane Payments equivalent)
```typescript
enum PaymentMethod {
  CASH = 'cash',
  CHECK = 'check',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  ACH = 'ach',
  GIFT_CARD = 'gift_card',
  PACKAGE_CREDIT = 'package_credit',
  MEMBERSHIP_CREDIT = 'membership_credit',
  INSURANCE = 'insurance',
  FINANCING = 'financing',  // CareCredit, Cherry (Enhancement)
  CRYPTO = 'crypto'  // Enhancement
}
```

#### Payment Processing Workflow
1. **Quick Payment** (from appointment)
   - Auto-populate from appointment
   - Add products/units on the fly
   - Split payment options
   - Print/email receipt

2. **Invoice Creation** (standalone)
   - Create without appointment
   - Add multiple services/products
   - Apply discounts
   - Set payment terms

3. **Payment Collection**
   - In-person terminal
   - Online payment links
   - Recurring payments
   - Payment plans

### 2.3 Unit-Based Billing (Medical Spa Focus)

#### Injection Billing System (Jane's Botox billing + enhancements)
```typescript
interface InjectionBilling {
  // Product Management
  product: {
    id: string
    name: string  // Botox, Dysport, Juvederm, etc.
    type: 'neurotoxin' | 'filler'
    manufacturer: string
    unitType: 'unit' | 'syringe' | 'ml'
    costPerUnit: number
    pricePerUnit: number
    
    // Inventory tracking (Enhancement)
    inventory: {
      lotNumber: string
      expirationDate: Date
      unitsInStock: number
      reorderPoint: number
    }
  }
  
  // Usage Tracking
  usage: {
    patientId: string
    date: Date
    areas: {
      area: string  // Forehead, glabella, crow's feet, etc.
      unitsUsed: number
      practitionerId: string
    }[]
    totalUnits: number
    wasteUnits: number  // Track waste for inventory
    photos?: string[]
  }
  
  // Billing
  billing: {
    basePrice: number
    volumeDiscount?: number
    memberDiscount?: number
    finalPrice: number
  }
}
```

### 2.4 Package & Membership Billing

#### Package System (Jane feature + enhancements)
```typescript
interface Package {
  id: string
  name: string
  description: string
  
  // Package Contents
  contents: {
    type: 'service' | 'product'
    itemId: string
    quantity: number
    value: number
  }[]
  
  // Pricing
  regularPrice: number
  salePrice: number
  savings: number
  
  // Validity
  purchaseDate: Date
  expirationDate?: Date
  
  // Usage
  creditsTotal: number
  creditsUsed: number
  creditsRemaining: number
  
  // Restrictions
  restrictions?: {
    specificPractitioners?: string[]
    specificLocations?: string[]
    blackoutDates?: Date[]
    shareable: boolean  // Can share with family
  }
}
```

#### Membership System (Enhanced)
```typescript
interface Membership {
  id: string
  name: string
  tier: 'silver' | 'gold' | 'platinum' | 'vip'
  
  // Billing
  billingCycle: 'monthly' | 'quarterly' | 'annual'
  price: number
  autopay: boolean
  nextBillingDate: Date
  
  // Benefits
  benefits: {
    discountPercentage: number
    includedServices: {
      serviceId: string
      quantity: number
      resetPeriod: 'monthly' | 'quarterly' | 'annual'
    }[]
    perks: string[]  // Priority booking, exclusive events, etc.
  }
  
  // Status
  status: 'active' | 'paused' | 'cancelled'
  startDate: Date
  endDate?: Date
}
```

### 2.5 Receipt Customization (Jane feature)

#### Receipt Template
```typescript
interface ReceiptTemplate {
  // Header
  header: {
    logo: string
    clinicName: string
    address: string
    phone: string
    email: string
    taxId?: string
  }
  
  // Content Sections
  sections: {
    showServiceDetails: boolean
    showPractitioner: boolean
    showNextAppointments: boolean  // Jane feature
    showBalance: boolean
    showPaymentMethod: boolean
    showTaxBreakdown: boolean
  }
  
  // Footer
  footer: {
    customMessage?: string
    cancellationPolicy?: boolean
    returnPolicy?: boolean
    website?: string
    socialMedia?: string[]
  }
  
  // Format
  format: {
    paperSize: 'letter' | 'A4' | 'thermal'
    font: string
    fontSize: number
  }
}
```

### 2.6 Financial Reports (Jane-inspired)

#### Report Types
1. **Daily Reports**
   - Cash reconciliation
   - Payment summary
   - Services performed
   - Products sold

2. **Period Reports**
   - Revenue by service
   - Revenue by practitioner
   - Outstanding balances
   - Package/membership sales

3. **Analytics**
   - Average transaction value
   - Payment method breakdown
   - Top services/products
   - Refund analysis

---

# SECTION 3: IMPLEMENTATION REQUIREMENTS

## 3.1 UI Components Needed

### Patient Management
- [ ] Patient search with autocomplete
- [ ] Advanced filter panel
- [ ] Patient data grid with sorting
- [ ] Patient detail tabs
- [ ] Photo upload/gallery
- [ ] Relationship manager
- [ ] Tag manager
- [ ] Merge patient tool

### Billing Components
- [ ] Invoice builder
- [ ] Payment form with multiple methods
- [ ] Receipt preview/print
- [ ] Package/membership manager
- [ ] Unit calculator (for injectables)
- [ ] Discount manager
- [ ] Tax calculator
- [ ] Payment plan builder

## 3.2 API Endpoints Required

### Patient APIs
```typescript
// Patient CRUD
GET    /api/patients
GET    /api/patients/:id
POST   /api/patients
PUT    /api/patients/:id
DELETE /api/patients/:id

// Patient Search
GET    /api/patients/search?q=
GET    /api/patients/filter

// Relationships
GET    /api/patients/:id/relationships
POST   /api/patients/:id/relationships

// Photos
POST   /api/patients/:id/photos
GET    /api/patients/:id/photos
DELETE /api/patients/:id/photos/:photoId
```

### Billing APIs
```typescript
// Invoices
GET    /api/invoices
GET    /api/invoices/:id
POST   /api/invoices
PUT    /api/invoices/:id
DELETE /api/invoices/:id

// Payments
POST   /api/invoices/:id/payments
GET    /api/payments
PUT    /api/payments/:id
DELETE /api/payments/:id

// Packages & Memberships
GET    /api/packages
POST   /api/packages
GET    /api/memberships
POST   /api/memberships

// Reports
GET    /api/reports/daily
GET    /api/reports/period
GET    /api/reports/analytics
```

## 3.3 Database Schema Updates

### New Tables Needed
```sql
-- Patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  preferred_name VARCHAR(100),
  date_of_birth DATE,
  -- ... other fields
);

-- Patient relationships
CREATE TABLE patient_relationships (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  related_patient_id UUID REFERENCES patients(id),
  relationship_type VARCHAR(50),
  is_primary BOOLEAN
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  invoice_number VARCHAR(50) UNIQUE,
  patient_id UUID REFERENCES patients(id),
  practitioner_id UUID REFERENCES staff(id),
  -- ... other fields
);

-- Invoice line items
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id),
  type VARCHAR(50),
  description TEXT,
  quantity DECIMAL,
  unit_price DECIMAL,
  -- ... other fields
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  invoice_id UUID REFERENCES invoices(id),
  amount DECIMAL,
  method VARCHAR(50),
  -- ... other fields
);

-- Packages
CREATE TABLE packages (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  name VARCHAR(200),
  credits_total INTEGER,
  credits_used INTEGER,
  -- ... other fields
);

-- Memberships
CREATE TABLE memberships (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  tier VARCHAR(50),
  billing_cycle VARCHAR(50),
  -- ... other fields
);
```

## 3.4 Third-Party Integrations

### Payment Processing
- **Stripe** (like Jane Payments)
- **Square** (alternative)
- **CareCredit** (financing)
- **Cherry** (financing)

### Communication
- **Twilio** (SMS)
- **SendGrid** (Email)
- **Postmark** (Transactional email)

### Storage
- **AWS S3** (photos, documents)
- **Cloudinary** (image optimization)

---

# SECTION 4: ENHANCEMENTS OVER JANE APP

## 4.1 Medical Spa Specific Features

1. **Visual Face/Body Mapping**
   - Interactive injection site tracking
   - Treatment area photos with annotations
   - Progress tracking overlays

2. **Advanced Inventory Integration**
   - Lot number tracking
   - Expiration alerts
   - Automatic reordering
   - Cost analysis per treatment

3. **Treatment Outcome Tracking**
   - Before/after photo AI analysis
   - Patient satisfaction scores
   - Treatment efficacy metrics

4. **Financing Integration**
   - Direct CareCredit/Cherry applications
   - Payment plan calculator
   - Approval status tracking

5. **Loyalty Program**
   - Points-based rewards
   - Tier progression
   - Referral tracking
   - Birthday/anniversary rewards

## 4.2 UI/UX Improvements

1. **Smart Search**
   - AI-powered patient matching
   - Fuzzy search for names
   - Search by treatment history

2. **Quick Actions**
   - One-click rebooking
   - Instant payment collection
   - Rapid check-in process

3. **Mobile Optimization**
   - Responsive design
   - Touch-friendly interfaces
   - Offline capability

4. **Bulk Operations**
   - Mass messaging
   - Batch invoice creation
   - Group appointment booking

---

# SECTION 5: IMPLEMENTATION PHASES

## Phase 1: Core Patient Management (Week 1-2)
- [ ] Patient CRUD operations
- [ ] Search and filter functionality
- [ ] Basic patient profile page
- [ ] Patient list view

## Phase 2: Enhanced Patient Features (Week 3-4)
- [ ] Relationship management
- [ ] Photo management
- [ ] Medical history
- [ ] Communication preferences

## Phase 3: Basic Billing (Week 5-6)
- [ ] Invoice creation
- [ ] Payment recording
- [ ] Receipt generation
- [ ] Basic reports

## Phase 4: Advanced Billing (Week 7-8)
- [ ] Unit-based billing
- [ ] Package management
- [ ] Membership system
- [ ] Payment plans

## Phase 5: Integration & Polish (Week 9-10)
- [ ] Payment gateway integration
- [ ] Email/SMS integration
- [ ] Report generation
- [ ] UI polish and testing

---

*Last Updated: August 2025*
*Reference: Jane App Features + Medical Spa Enhancements*