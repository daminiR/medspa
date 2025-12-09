# 🏗️ LUXE MEDICAL SPA EMR - COMPLETE IMPLEMENTATION ROADMAP

**Last Updated:** October 18, 2025
**Total Features:** 73
**Current Status:** 3/73 Complete (4%)

---

## 📋 HOW TO USE THIS ROADMAP

**YOU ARE A ROBOT. EXECUTE IN ORDER. DO NOT SKIP.**

1. Start with Phase 1, Feature #1
2. Build exactly what's specified
3. Run the verification tests
4. Check it off
5. Move to next feature
6. **DO NOT** skip ahead - dependencies matter

Each feature shows:
- ✅ Prerequisites (what must exist first)
- 🎯 What to build
- 🔧 Technical specs (API, database, UI)
- ⚠️ Edge cases to handle
- 🧪 Verification tests
- 🔗 Connects to (what uses this)

---

## PHASE 1: FOUNDATION (Features 1-15)
**Goal:** Core data models and infrastructure. Everything else depends on these.

---

### ✅ FEATURE #1: Database Schema - Appointments Table
**Status:** 🟢 COMPLETE
**Time:** Already done
**Prerequisites:** None

**What exists:**
```typescript
// lib/data.ts - appointments array
interface Appointment {
  id: string
  patientId: string
  patientName: string
  phone: string
  serviceName: string
  practitionerId: string
  startTime: Date
  endTime: Date
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  waitingRoomStatus?: 'not_arrived' | 'in_car' | 'room_ready' | 'checked_in'
  // ... more fields
}
```

**What to add:**
```typescript
interface Appointment {
  // ... existing fields

  // Missing critical fields:
  price: number                    // Total price for this appointment
  deposit: number                  // Deposit paid upfront
  balanceOwed: number             // Remaining balance
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded'

  // Resource allocation:
  roomId?: string                 // Which treatment room
  equipmentIds?: string[]         // Which lasers/equipment needed

  // Timing breakdown:
  processingMinutes: number       // Numbing time
  serviceMinutes: number          // Actual treatment time
  finishingMinutes: number        // Recovery/observation time
  bufferMinutes: number           // Cleanup time
  currentPhase?: 'scheduled' | 'processing' | 'service' | 'finishing' | 'complete'

  // Tracking:
  createdAt: Date
  createdBy: string              // Staff member who booked it
  lastModifiedAt: Date
  lastModifiedBy: string

  // Notes:
  internalNotes?: string         // Staff-only notes
  patientNotes?: string          // Patient-facing notes

  // Recurring:
  isRecurring: boolean
  recurringGroupId?: string      // Links to other appointments in series
  recurrenceRule?: string        // "weekly", "every 3 months", etc.

  // Group booking:
  isGroupBooking: boolean
  groupId?: string              // Links to other appointments in group
  isPrimaryContact: boolean     // Is this the group organizer?
}
```

**Verification:**
- [ ] TypeScript interface updated
- [ ] Existing mock data still works
- [ ] No type errors in codebase

**Connects to:** Everything - this is the core data model

---

### 🔴 FEATURE #2: Database Schema - Patients Table
**Status:** 🔴 NOT STARTED
**Time:** 2 hours
**Prerequisites:** None

**What to build:**
```typescript
// lib/data.ts

interface Patient {
  id: string

  // Basic info:
  firstName: string
  lastName: string
  fullName: string                    // Computed: firstName + lastName
  dateOfBirth: Date
  age: number                         // Computed from DOB
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say'

  // Contact:
  email: string
  phone: string
  phoneType: 'mobile' | 'home' | 'work'
  alternatePhone?: string
  preferredContactMethod: 'phone' | 'sms' | 'email'

  // Address:
  address: {
    street: string
    city: string
    state: string
    zip: string
  }

  // Medical:
  allergies: string[]               // ["Penicillin", "Latex"]
  medications: Array<{
    name: string
    dosage: string
    frequency: string
  }>
  medicalConditions: string[]       // ["Diabetes", "High Blood Pressure"]
  isPregnant?: boolean
  isNursing?: boolean

  // Emergency contact:
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }

  // Practice info:
  status: 'active' | 'inactive' | 'blocked'
  tags: string[]                    // ["VIP", "Botox Regular", "High Value"]
  assignedPractitionerId?: string   // Preferred practitioner
  referralSource?: string          // "Instagram", "Friend", "Google"

  // Financial:
  totalLifetimeValue: number        // Total $ spent ever
  outstandingBalance: number        // $ owed
  creditBalance: number             // Prepaid credits
  membershipLevel?: 'None' | 'Silver' | 'Gold' | 'Platinum'

  // Tracking:
  firstVisitDate?: Date
  lastVisitDate?: Date
  totalVisits: number
  noShowCount: number
  cancellationCount: number

  // Consent & legal:
  hasSignedWaiver: boolean
  waiverSignedDate?: Date
  canReceiveMarketingMessages: boolean
  photoConsentGiven: boolean

  // System:
  createdAt: Date
  createdBy: string
  lastModifiedAt: Date
  internalNotes?: string           // Staff-only notes

  // Settings:
  languagePreference: 'en' | 'es'
  timezone: string
}

// Mock data
export const patients: Patient[] = [
  {
    id: 'p1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    fullName: 'Sarah Johnson',
    dateOfBirth: new Date('1988-05-15'),
    age: 37,
    gender: 'female',
    email: 'sarah.j@email.com',
    phone: '+15551234567',
    phoneType: 'mobile',
    preferredContactMethod: 'sms',
    address: {
      street: '123 Main St',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90210'
    },
    allergies: [],
    medications: [],
    medicalConditions: [],
    emergencyContact: {
      name: 'John Johnson',
      relationship: 'Spouse',
      phone: '+15557654321'
    },
    status: 'active',
    tags: ['VIP', 'Botox Regular'],
    totalLifetimeValue: 12500,
    outstandingBalance: 0,
    creditBalance: 0,
    totalVisits: 15,
    noShowCount: 0,
    cancellationCount: 1,
    hasSignedWaiver: true,
    waiverSignedDate: new Date('2024-01-10'),
    canReceiveMarketingMessages: true,
    photoConsentGiven: true,
    createdAt: new Date('2024-01-10'),
    createdBy: 'system',
    lastModifiedAt: new Date(),
    languagePreference: 'en',
    timezone: 'America/Los_Angeles'
  },
  // Add 2-3 more mock patients...
]
```

**API to create:**
```typescript
// app/api/patients/route.ts
export async function GET() {
  // Return all patients
}

export async function POST(request: Request) {
  // Create new patient
}

// app/api/patients/[id]/route.ts
export async function GET(request: Request, { params }) {
  // Get single patient by ID
}

export async function PATCH(request: Request, { params }) {
  // Update patient
}

export async function DELETE(request: Request, { params }) {
  // Soft delete (set status = 'inactive')
}
```

**Verification:**
- [ ] Patient interface defined
- [ ] 3+ mock patients created
- [ ] GET /api/patients returns array
- [ ] POST /api/patients creates new patient
- [ ] GET /api/patients/[id] returns single patient
- [ ] PATCH updates work
- [ ] All fields have proper types
- [ ] Age calculates correctly from DOB

**Connects to:**
- Appointments (patientId references this)
- Billing (credit balance, outstanding balance)
- Treatment charts (medical history)

---

### 🔴 FEATURE #3: Database Schema - Services Catalog
**Status:** 🔴 NOT STARTED
**Time:** 3 hours
**Prerequisites:** None

**What to build:**
```typescript
// lib/data.ts

interface Service {
  id: string
  name: string                      // "Botox - Forehead"
  category: string                  // "Injectables", "Lasers", "Facials"
  description: string

  // Pricing:
  basePrice: number
  pricingType: 'fixed' | 'per-unit' | 'per-area' | 'package'
  unitPrice?: number                // For Botox: $10/unit
  packagePrice?: number             // Buy 3 sessions for $500
  packageSessions?: number

  // Timing (in minutes):
  processingTime: number            // Numbing: 20 min
  serviceTime: number               // Injection: 15 min
  finishingTime: number             // Observation: 10 min
  bufferTime: number                // Cleanup: 5 min
  totalDuration: number             // Computed: sum of above

  // Requirements:
  requiresConsultation: boolean     // New patients need consult first?
  requiresDeposit: boolean
  depositAmount?: number
  minimumAge: number                // 18 for most, 21 for some

  // Resources needed:
  requiresRoom: boolean
  preferredRoomType?: string        // "Laser Room", "Treatment Room"
  requiresEquipment: string[]       // ["Candela Laser GentleMax Pro"]

  // Practitioner requirements:
  canBePerformedBy: string[]        // ["MD", "NP", "RN", "Aesthetician"]

  // Inventory:
  usesProducts: Array<{
    productId: string
    productName: string
    quantityUsed: number
    unit: string                    // "units", "syringes", "ml"
  }>

  // Status:
  isActive: boolean
  isBookableOnline: boolean
  displayOrder: number              // For sorting in lists

  // Marketing:
  shortDescription: string          // For online booking
  imageUrl?: string
  beforeAfterPhotos?: string[]

  // Aftercare:
  aftercareInstructions?: string
  sendAutomatedFollowUp: boolean
  followUpDays: number              // Send SMS 7 days after

  // Tracking:
  createdAt: Date
  lastModifiedAt: Date
}

// Mock data
export const services: Service[] = [
  {
    id: 's1',
    name: 'Botox - Full Face',
    category: 'Injectables',
    description: 'Botox injections for forehead, crow\'s feet, and frown lines',
    basePrice: 0,
    pricingType: 'per-unit',
    unitPrice: 12,
    processingTime: 20,
    serviceTime: 15,
    finishingTime: 10,
    bufferTime: 5,
    totalDuration: 50,
    requiresConsultation: false,
    requiresDeposit: true,
    depositAmount: 100,
    minimumAge: 18,
    requiresRoom: true,
    preferredRoomType: 'Treatment Room',
    requiresEquipment: [],
    canBePerformedBy: ['MD', 'NP', 'RN'],
    usesProducts: [
      {
        productId: 'prod-botox',
        productName: 'Botox Cosmetic',
        quantityUsed: 40,
        unit: 'units'
      }
    ],
    isActive: true,
    isBookableOnline: true,
    displayOrder: 1,
    shortDescription: 'Reduce wrinkles and fine lines',
    sendAutomatedFollowUp: true,
    followUpDays: 7,
    createdAt: new Date(),
    lastModifiedAt: new Date()
  },
  {
    id: 's2',
    name: 'Laser Hair Removal - Full Legs',
    category: 'Lasers',
    description: 'Permanent hair reduction using Candela laser',
    basePrice: 350,
    pricingType: 'fixed',
    processingTime: 0,
    serviceTime: 45,
    finishingTime: 5,
    bufferTime: 5,
    totalDuration: 55,
    requiresConsultation: true,
    requiresDeposit: true,
    depositAmount: 100,
    minimumAge: 18,
    requiresRoom: true,
    preferredRoomType: 'Laser Room',
    requiresEquipment: ['Candela Laser GentleMax Pro'],
    canBePerformedBy: ['MD', 'NP', 'Laser Tech'],
    usesProducts: [],
    isActive: true,
    isBookableOnline: true,
    displayOrder: 5,
    shortDescription: 'Long-lasting hair removal',
    sendAutomatedFollowUp: true,
    followUpDays: 14,
    createdAt: new Date(),
    lastModifiedAt: new Date()
  },
  // Add 5-10 more services...
]
```

**API to create:**
```typescript
// app/api/services/route.ts
export async function GET() {
  // Return all active services
}

// app/api/services/[id]/route.ts
export async function GET(request, { params }) {
  // Get single service
}
```

**Verification:**
- [ ] Service interface defined
- [ ] 5+ mock services created
- [ ] GET /api/services returns array
- [ ] Services include: Botox, Filler, Laser Hair Removal, Facial, Chemical Peel
- [ ] totalDuration calculates correctly
- [ ] Services have proper pricing info

**Connects to:**
- Appointments (serviceName → Service lookup)
- Billing (pricing)
- Treatment charting (products used)
- Calendar (timing affects scheduling)

---

### 🔴 FEATURE #4: Database Schema - Practitioners/Staff
**Status:** 🔴 NOT STARTED
**Time:** 2 hours
**Prerequisites:** None

**What to build:**
```typescript
// lib/data.ts

interface Practitioner {
  id: string

  // Basic info:
  firstName: string
  lastName: string
  fullName: string
  title: string                     // "MD", "NP", "RN", "Aesthetician"
  credentials: string               // "MD, FAAD"

  // Contact:
  email: string
  phone: string

  // Role:
  role: 'Practitioner' | 'Front Desk' | 'Manager' | 'Admin'
  permissions: string[]             // ["book-appointments", "process-payments", "edit-charts"]

  // Availability:
  workingHours: Array<{
    dayOfWeek: number              // 0=Sunday, 1=Monday, etc.
    startTime: string              // "09:00"
    endTime: string                // "17:00"
    isAvailable: boolean
  }>

  // Services they can perform:
  canPerformServices: string[]     // Service IDs
  serviceCategories: string[]      // ["Injectables", "Lasers"]

  // Settings:
  defaultRoomId?: string
  color: string                    // Calendar color: "#4CAF50"
  bookableOnline: boolean
  acceptsNewPatients: boolean

  // Financial:
  payType: 'hourly' | 'salary' | 'commission'
  hourlyRate?: number
  salary?: number
  commissionRate?: number          // 0.40 = 40% commission

  // Status:
  isActive: boolean
  hireDate: Date
  terminationDate?: Date

  // Bio/Marketing:
  bio?: string
  photoUrl?: string
  specialties: string[]

  // System:
  createdAt: Date
  lastModifiedAt: Date
}

// Mock data
export const practitioners: Practitioner[] = [
  {
    id: 'prac1',
    firstName: 'Dr. Emily',
    lastName: 'Chen',
    fullName: 'Dr. Emily Chen',
    title: 'MD',
    credentials: 'MD, FAAD',
    email: 'emily.chen@luxemedspa.com',
    phone: '+15559876543',
    role: 'Practitioner',
    permissions: ['view-schedule', 'chart-patients', 'order-products'],
    workingHours: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { dayOfWeek: 5, startTime: '09:00', endTime: '13:00', isAvailable: true },
    ],
    canPerformServices: ['s1', 's2', 's3'],
    serviceCategories: ['Injectables', 'Lasers'],
    color: '#4CAF50',
    bookableOnline: true,
    acceptsNewPatients: true,
    payType: 'commission',
    commissionRate: 0.45,
    isActive: true,
    hireDate: new Date('2023-01-15'),
    specialties: ['Botox', 'Fillers', 'Laser'],
    createdAt: new Date(),
    lastModifiedAt: new Date()
  },
  // Add 2-3 more practitioners...
]
```

**API:**
```typescript
// app/api/practitioners/route.ts
export async function GET() {
  // Return all active practitioners
}

// app/api/practitioners/[id]/availability/route.ts
export async function GET(request, { params }) {
  // Get practitioner availability for date range
  // Used for calendar booking
}
```

**Verification:**
- [ ] Practitioner interface defined
- [ ] 3+ mock practitioners created
- [ ] workingHours covers Mon-Fri
- [ ] Each has different specialties
- [ ] GET /api/practitioners works

**Connects to:**
- Appointments (practitionerId)
- Calendar (availability, color coding)
- Billing (commission calculations)

---

### 🔴 FEATURE #5: Database Schema - Rooms & Equipment
**Status:** 🔴 NOT STARTED
**Time:** 1 hour
**Prerequisites:** None

**What to build:**
```typescript
// lib/data.ts

interface Room {
  id: string
  name: string                      // "Treatment Room 1", "Laser Room"
  type: 'treatment' | 'laser' | 'consultation' | 'procedure'
  isActive: boolean
  canBeBookedOnline: boolean
  equipment: string[]               // Equipment IDs in this room
  features: string[]                // ["Adjustable bed", "Privacy door", "Sink"]
  displayOrder: number
  color: string                     // For calendar color coding
}

interface Equipment {
  id: string
  name: string                      // "Candela Laser GentleMax Pro"
  type: string                      // "Laser", "IPL", "Microneedling Device"
  manufacturer: string
  modelNumber: string
  serialNumber: string

  // Availability:
  isOperational: boolean
  requiresCertification: boolean    // Staff need special training?

  // Maintenance:
  lastMaintenanceDate?: Date
  nextMaintenanceDate?: Date
  shotsRemaining?: number           // For lasers with shot counts

  // Booking:
  canBeShared: boolean              // Can multiple rooms use it?
  currentRoomId?: string            // Which room is it in now?

  // Tracking:
  purchaseDate: Date
  purchasePrice: number
  warrantyExpirationDate?: Date
}

// Mock data
export const rooms: Room[] = [
  {
    id: 'room1',
    name: 'Treatment Room 1',
    type: 'treatment',
    isActive: true,
    canBeBookedOnline: true,
    equipment: [],
    features: ['Adjustable bed', 'Privacy door', 'Sink'],
    displayOrder: 1,
    color: '#E3F2FD'
  },
  {
    id: 'room2',
    name: 'Laser Room',
    type: 'laser',
    isActive: true,
    canBeBookedOnline: true,
    equipment: ['eq1'],
    features: ['Laser safety equipment', 'Cooling system'],
    displayOrder: 2,
    color: '#FCE4EC'
  }
]

export const equipment: Equipment[] = [
  {
    id: 'eq1',
    name: 'Candela Laser GentleMax Pro',
    type: 'Laser',
    manufacturer: 'Candela',
    modelNumber: 'GentleMax Pro',
    serialNumber: 'SN123456',
    isOperational: true,
    requiresCertification: true,
    lastMaintenanceDate: new Date('2025-09-01'),
    nextMaintenanceDate: new Date('2026-03-01'),
    shotsRemaining: 45000,
    canBeShared: false,
    currentRoomId: 'room2',
    purchaseDate: new Date('2024-01-15'),
    purchasePrice: 75000
  }
]
```

**Verification:**
- [ ] Room and Equipment interfaces defined
- [ ] 3+ rooms created
- [ ] 2+ equipment items created
- [ ] Equipment linked to rooms

**Connects to:**
- Appointments (roomId, equipmentIds)
- Calendar (room availability)
- Services (requiresEquipment)

---

### 🔴 FEATURE #6: Database Schema - Products & Inventory
**Status:** 🔴 NOT STARTED
**Time:** 2 hours
**Prerequisites:** None

**What to build:**
```typescript
// lib/data.ts

interface Product {
  id: string
  name: string                      // "Botox Cosmetic"
  manufacturer: string              // "Allergan"

  // Type:
  category: 'Injectable' | 'Topical' | 'Supplement' | 'Device' | 'Skincare'
  isControlledSubstance: boolean    // Requires special logging

  // Inventory:
  currentStock: number
  unit: string                      // "units", "syringes", "vials", "bottles"
  reorderLevel: number              // Alert when stock drops below this
  reorderQuantity: number           // How many to reorder

  // Pricing:
  costPerUnit: number               // What we pay
  sellingPricePerUnit: number       // What patient pays

  // Tracking:
  lotNumber?: string
  expirationDate?: Date

  // Usage:
  isActive: boolean
  requiresRefrigeration: boolean

  // Supplier:
  supplierId: string
  supplierName: string
  supplierSKU: string

  // System:
  createdAt: Date
  lastModifiedAt: Date
}

interface InventoryTransaction {
  id: string
  productId: string
  type: 'purchase' | 'usage' | 'adjustment' | 'waste'
  quantity: number                  // Positive for adding, negative for using

  // Context:
  appointmentId?: string            // If used in treatment
  practitionerId: string            // Who used/ordered it
  reason?: string                   // For adjustments/waste

  // Tracking:
  timestamp: Date
  performedBy: string
  notes?: string
}

// Mock data
export const products: Product[] = [
  {
    id: 'prod-botox',
    name: 'Botox Cosmetic',
    manufacturer: 'Allergan',
    category: 'Injectable',
    isControlledSubstance: true,
    currentStock: 500,
    unit: 'units',
    reorderLevel: 200,
    reorderQuantity: 1000,
    costPerUnit: 8.50,
    sellingPricePerUnit: 12,
    lotNumber: 'LOT2025A',
    expirationDate: new Date('2026-06-30'),
    isActive: true,
    requiresRefrigeration: true,
    supplierId: 'supplier1',
    supplierName: 'Allergan',
    supplierSKU: 'BOT-100U',
    createdAt: new Date(),
    lastModifiedAt: new Date()
  }
]

export const inventoryTransactions: InventoryTransaction[] = []
```

**API:**
```typescript
// app/api/products/route.ts
export async function GET() {
  // Return all products
}

// app/api/products/low-stock/route.ts
export async function GET() {
  // Return products below reorder level
}

// app/api/inventory/transactions/route.ts
export async function POST(request: Request) {
  // Record inventory transaction
  // Automatically update product.currentStock
}
```

**Verification:**
- [ ] Product and InventoryTransaction interfaces defined
- [ ] 5+ products created (Botox, Filler, Skincare products)
- [ ] Low stock API returns correct products
- [ ] Transaction recording updates stock levels

**Connects to:**
- Services (usesProducts)
- Appointments (product usage)
- Billing (product costs)
- Reports (inventory reports)

---

### 🔴 FEATURE #7: Database Schema - Payment Methods & Transactions
**Status:** 🔴 NOT STARTED
**Time:** 2 hours
**Prerequisites:** Feature #2 (Patients)

**What to build:**
```typescript
// lib/data.ts

interface PaymentMethod {
  id: string
  patientId: string
  type: 'credit_card' | 'debit_card' | 'bank_account'

  // Card info (tokenized):
  last4: string                     // "4242"
  brand: string                     // "Visa", "Mastercard"
  expirationMonth: number
  expirationYear: number

  // Billing address:
  billingZip: string

  // Status:
  isDefault: boolean
  isActive: boolean

  // Stripe:
  stripePaymentMethodId: string     // "pm_xxxxx"

  // System:
  createdAt: Date
  lastUsedAt?: Date
}

interface PaymentTransaction {
  id: string
  appointmentId?: string
  patientId: string

  // Amount:
  amount: number                    // In dollars: 150.00
  currency: string                  // "USD"

  // Payment:
  paymentMethodId: string
  type: 'charge' | 'refund' | 'credit'
  status: 'pending' | 'succeeded' | 'failed' | 'refunded'

  // Processing:
  processorTransactionId?: string   // Stripe charge ID
  processorFee?: number             // Stripe takes 2.9% + $0.30
  netAmount?: number                // What we actually receive

  // Context:
  description: string               // "Botox - Full Face"
  practitionerId?: string           // Who performed service

  // Tracking:
  processedAt: Date
  processedBy: string               // Staff member who processed
  refundedAt?: Date
  refundReason?: string

  // Receipt:
  receiptUrl?: string
  receiptNumber: string             // "REC-2025-00123"

  // System:
  createdAt: Date
  notes?: string
}

// Mock data
export const paymentMethods: PaymentMethod[] = []
export const paymentTransactions: PaymentTransaction[] = []
```

**API:**
```typescript
// app/api/payments/process/route.ts
export async function POST(request: Request) {
  // Process payment via Stripe
  // Create PaymentTransaction record
  // Update Appointment.paymentStatus
  // Update Patient.outstandingBalance
}

// app/api/payments/refund/route.ts
export async function POST(request: Request) {
  // Process refund via Stripe
  // Create refund transaction
}
```

**Verification:**
- [ ] PaymentMethod and PaymentTransaction interfaces defined
- [ ] Can process test payment
- [ ] Stripe integration works (test mode)
- [ ] Receipt numbers generate correctly

**Connects to:**
- Appointments (payment for services)
- Patients (payment methods, balance)
- Billing dashboard

---

### 🔴 FEATURE #8: Database Schema - Memberships & Packages
**Status:** 🔴 NOT STARTED
**Time:** 3 hours
**Prerequisites:** Feature #2 (Patients), #3 (Services)

**What to build:**
```typescript
// lib/data.ts

interface MembershipTier {
  id: string
  name: string                      // "Silver", "Gold", "Platinum"
  description: string

  // Pricing:
  monthlyPrice: number              // $299/month
  annualPrice?: number              // $2990/year (2 months free)
  billingFrequency: 'monthly' | 'annual'

  // Benefits:
  discountPercentage: number        // 15% off all services
  includedServices: Array<{
    serviceId: string
    serviceName: string
    quantityPerMonth: number        // "1 facial per month"
  }>

  // Perks:
  priorityBooking: boolean
  freeProducts: string[]            // Product IDs

  // Status:
  isActive: boolean
  displayOrder: number
}

interface PatientMembership {
  id: string
  patientId: string
  membershipTierId: string

  // Status:
  status: 'active' | 'paused' | 'cancelled' | 'expired'
  startDate: Date
  endDate?: Date                    // For annual memberships
  nextBillingDate: Date

  // Billing:
  paymentMethodId: string
  autoRenew: boolean

  // Usage tracking:
  servicesUsedThisMonth: Array<{
    serviceId: string
    dateUsed: Date
    appointmentId: string
  }>

  // System:
  createdAt: Date
  cancelledAt?: Date
  cancelReason?: string
  pausedAt?: Date
  pauseReason?: string
}

interface ServicePackage {
  id: string
  name: string                      // "Laser Hair Removal - 6 Sessions"
  serviceId: string

  // Pricing:
  packagePrice: number              // $1500 for 6 sessions
  individualPrice: number           // Would be $2100 if bought separately
  savingsAmount: number             // $600 saved

  // Sessions:
  totalSessions: number             // 6
  validityDays: number              // 365 days to use all sessions

  // Status:
  isActive: boolean
  isBookableOnline: boolean
}

interface PatientPackage {
  id: string
  patientId: string
  packageId: string

  // Purchase:
  purchaseDate: Date
  purchasePrice: number
  expirationDate: Date

  // Usage:
  sessionsTotal: number             // 6
  sessionsUsed: number              // 2
  sessionsRemaining: number         // 4
  usedAppointments: Array<{
    appointmentId: string
    dateUsed: Date
  }>

  // Status:
  status: 'active' | 'completed' | 'expired'
}

// Mock data
export const membershipTiers: MembershipTier[] = [
  {
    id: 'tier-gold',
    name: 'Gold Membership',
    description: '15% off all services + 1 free facial per month',
    monthlyPrice: 299,
    annualPrice: 2990,
    billingFrequency: 'monthly',
    discountPercentage: 15,
    includedServices: [
      {
        serviceId: 's-facial',
        serviceName: 'Signature Facial',
        quantityPerMonth: 1
      }
    ],
    priorityBooking: true,
    freeProducts: [],
    isActive: true,
    displayOrder: 2
  }
]

export const servicePackages: ServicePackage[] = []
export const patientMemberships: PatientMembership[] = []
export const patientPackages: PatientPackage[] = []
```

**Verification:**
- [ ] All membership/package interfaces defined
- [ ] 2+ membership tiers created
- [ ] 2+ service packages created
- [ ] Usage tracking works correctly

**Connects to:**
- Patients (membership status)
- Appointments (apply membership discounts)
- Billing (recurring billing)

---

### 🔴 FEATURE #9: Appointments API - Full CRUD Operations
**Status:** 🔴 NOT STARTED
**Time:** 4 hours
**Prerequisites:** Features #1-4 (all database schemas)

**What to build:**
```typescript
// app/api/appointments/route.ts

export async function GET(request: NextRequest) {
  // Query params: ?start=2025-10-18&end=2025-10-25&practitionerId=prac1
  const { searchParams } = new URL(request.url)
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  const practitionerId = searchParams.get('practitionerId')

  let filtered = appointments

  if (start && end) {
    const startDate = new Date(start)
    const endDate = new Date(end)
    filtered = filtered.filter(apt =>
      apt.startTime >= startDate && apt.startTime <= endDate
    )
  }

  if (practitionerId) {
    filtered = filtered.filter(apt => apt.practitionerId === practitionerId)
  }

  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Validate required fields
  if (!body.patientId || !body.serviceId || !body.practitionerId || !body.startTime) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  // Get service to calculate timing
  const service = services.find(s => s.id === body.serviceId)
  if (!service) {
    return NextResponse.json(
      { error: 'Service not found' },
      { status: 404 }
    )
  }

  // Calculate end time
  const startTime = new Date(body.startTime)
  const endTime = new Date(startTime.getTime() + service.totalDuration * 60000)

  // Check for conflicts
  const hasConflict = appointments.some(apt =>
    apt.practitionerId === body.practitionerId &&
    apt.status !== 'cancelled' &&
    (
      (startTime >= apt.startTime && startTime < apt.endTime) ||
      (endTime > apt.startTime && endTime <= apt.endTime) ||
      (startTime <= apt.startTime && endTime >= apt.endTime)
    )
  )

  if (hasConflict) {
    return NextResponse.json(
      { error: 'Time slot conflict detected' },
      { status: 409 }
    )
  }

  // Create appointment
  const newApt: Appointment = {
    id: `apt${Date.now()}`,
    patientId: body.patientId,
    patientName: body.patientName,
    phone: body.phone,
    serviceId: body.serviceId,
    serviceName: service.name,
    practitionerId: body.practitionerId,
    startTime,
    endTime,
    status: 'scheduled',
    price: service.basePrice,
    deposit: service.depositAmount || 0,
    balanceOwed: service.basePrice - (service.depositAmount || 0),
    paymentStatus: 'unpaid',
    processingMinutes: service.processingTime,
    serviceMinutes: service.serviceTime,
    finishingMinutes: service.finishingTime,
    bufferMinutes: service.bufferTime,
    createdAt: new Date(),
    createdBy: body.createdBy || 'system',
    lastModifiedAt: new Date(),
    lastModifiedBy: body.createdBy || 'system',
    isRecurring: false,
    isGroupBooking: false,
    isPrimaryContact: true
  }

  appointments.push(newApt)

  return NextResponse.json(newApt, { status: 201 })
}

// app/api/appointments/[id]/route.ts

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const apt = appointments.find(a => a.id === params.id)

  if (!apt) {
    return NextResponse.json(
      { error: 'Appointment not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(apt)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const aptIndex = appointments.findIndex(a => a.id === params.id)

  if (aptIndex === -1) {
    return NextResponse.json(
      { error: 'Appointment not found' },
      { status: 404 }
    )
  }

  const body = await request.json()

  // Update appointment
  appointments[aptIndex] = {
    ...appointments[aptIndex],
    ...body,
    lastModifiedAt: new Date(),
    lastModifiedBy: body.modifiedBy || 'system'
  }

  return NextResponse.json(appointments[aptIndex])
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const aptIndex = appointments.findIndex(a => a.id === params.id)

  if (aptIndex === -1) {
    return NextResponse.json(
      { error: 'Appointment not found' },
      { status: 404 }
    )
  }

  // Soft delete - mark as cancelled
  appointments[aptIndex].status = 'cancelled'
  appointments[aptIndex].lastModifiedAt = new Date()

  return NextResponse.json({ success: true })
}

// app/api/appointments/check-conflicts/route.ts

export async function POST(request: NextRequest) {
  const { practitionerId, startTime, endTime, excludeId } = await request.json()

  const conflicts = appointments.filter(apt =>
    apt.id !== excludeId &&
    apt.practitionerId === practitionerId &&
    apt.status !== 'cancelled' &&
    (
      (new Date(startTime) >= apt.startTime && new Date(startTime) < apt.endTime) ||
      (new Date(endTime) > apt.startTime && new Date(endTime) <= apt.endTime)
    )
  )

  return NextResponse.json({
    hasConflict: conflicts.length > 0,
    conflicts
  })
}
```

**Verification:**
- [ ] GET /api/appointments returns all appointments
- [ ] GET with date range filter works
- [ ] GET with practitioner filter works
- [ ] POST creates appointment with conflict checking
- [ ] POST calculates end time from service duration
- [ ] PATCH updates appointment
- [ ] DELETE soft-deletes (marks as cancelled)
- [ ] Conflict check API works

**Edge cases to handle:**
- Same practitioner double booked
- Appointment spans midnight
- Service not found
- Patient not found
- Invalid date formats

**Connects to:**
- Calendar UI (reads from this API)
- Booking flows (creates via this API)
- Treatment room (updates status via this API)

---

### 🔴 FEATURE #10: Real-time Data Sync Setup
**Status:** 🔴 NOT STARTED
**Time:** 3 hours
**Prerequisites:** Feature #9 (Appointments API)

**What to build:**
```typescript
// lib/use-realtime-appointments.ts

import { useEffect, useState } from 'react'

export function useRealtimeAppointments(dateRange?: { start: Date; end: Date }) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAppointments()

    // Poll every 10 seconds for updates
    const interval = setInterval(fetchAppointments, 10000)

    return () => clearInterval(interval)
  }, [dateRange])

  async function fetchAppointments() {
    try {
      let url = '/api/appointments'
      if (dateRange) {
        url += `?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`
      }

      const res = await fetch(url)
      const data = await res.json()
      setAppointments(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
    }
  }

  return { appointments, loading, refresh: fetchAppointments }
}

// lib/use-optimistic-update.ts

export function useOptimisticUpdate() {
  async function updateAppointment(id: string, updates: Partial<Appointment>) {
    // Optimistically update UI
    const originalApt = appointments.find(a => a.id === id)
    updateLocalState(id, updates)

    try {
      // Send to server
      await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
    } catch (error) {
      // Revert on error
      if (originalApt) {
        updateLocalState(id, originalApt)
      }
      throw error
    }
  }

  return { updateAppointment }
}
```

**Verification:**
- [ ] Appointments auto-refresh every 10 seconds
- [ ] Changes on one device appear on others within 10 seconds
- [ ] Optimistic updates work (instant UI response)
- [ ] Failed updates revert gracefully

**Connects to:**
- All pages that display appointments
- Calendar
- Waiting room dashboard

---

### 🔴 FEATURE #11: Time Zone Handling
**Status:** 🔴 NOT STARTED
**Time:** 2 hours
**Prerequisites:** None

**What to build:**
```typescript
// lib/timezone.ts

import { format, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'

const PRACTICE_TIMEZONE = 'America/Los_Angeles'

export function formatAppointmentTime(date: Date, timezone: string = PRACTICE_TIMEZONE): string {
  const zonedDate = utcToZonedTime(date, timezone)
  return format(zonedDate, 'h:mm a', { timeZone: timezone })
}

export function formatAppointmentDate(date: Date, timezone: string = PRACTICE_TIMEZONE): string {
  const zonedDate = utcToZonedTime(date, timezone)
  return format(zonedDate, 'MMM d, yyyy', { timeZone: timezone })
}

export function parseAppointmentTime(dateStr: string, timeStr: string): Date {
  // Convert "2025-10-18" + "2:30 PM" to UTC Date
  const localDateStr = `${dateStr} ${timeStr}`
  return zonedTimeToUtc(localDateStr, PRACTICE_TIMEZONE)
}

// Always store in UTC, display in practice timezone
```

**Verification:**
- [ ] All times display in practice timezone
- [ ] Database stores UTC
- [ ] Daylight saving time handled correctly

**Connects to:**
- Calendar
- Appointments
- SMS messages (show correct times)

---

### 🔴 FEATURE #12: Currency Formatting
**Status:** 🔴 NOT STARTED
**Time:** 1 hour
**Prerequisites:** None

**What to build:**
```typescript
// lib/currency.ts

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function parseCurrency(str: string): number {
  return parseFloat(str.replace(/[^0-9.-]+/g, ''))
}

// Always store as numbers (150.00), format for display
```

**Verification:**
- [ ] $150.50 displays correctly
- [ ] Handles negative numbers (refunds)
- [ ] Parses input correctly

**Connects to:**
- Billing
- Checkout
- Reports

---

### 🔴 FEATURE #13: Date/Time Utilities
**Status:** 🔴 NOT STARTED
**Time:** 2 hours
**Prerequisites:** None

**What to build:**
```typescript
// lib/date-utils.ts

export function getToday(): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function getStartOfWeek(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  const diff = result.getDate() - day
  result.setDate(diff)
  result.setHours(0, 0, 0, 0)
  return result
}

export function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date)
  return addDays(start, 6)
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  return {
    start: getStartOfWeek(date),
    end: getEndOfWeek(date)
  }
}
```

**Verification:**
- [ ] All utility functions work correctly
- [ ] Edge cases handled (month boundaries, year boundaries)

**Connects to:**
- Calendar navigation
- Date filters
- Reports

---

### 🔴 FEATURE #14: Validation Helpers
**Status:** 🔴 NOT STARTED
**Time:** 2 hours
**Prerequisites:** None

**What to build:**
```typescript
// lib/validation.ts

export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export function validatePhone(phone: string): boolean {
  // Accept various formats: (555) 123-4567, 555-123-4567, 5551234567
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.length === 10 || cleaned.length === 11
}

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return '+1' + cleaned
  }
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return '+' + cleaned
  }
  return phone
}

export function validateDate(date: string): boolean {
  const parsed = new Date(date)
  return !isNaN(parsed.getTime())
}

export function validateAppointment(apt: Partial<Appointment>): string[] {
  const errors: string[] = []

  if (!apt.patientId) errors.push('Patient is required')
  if (!apt.serviceId) errors.push('Service is required')
  if (!apt.practitionerId) errors.push('Practitioner is required')
  if (!apt.startTime) errors.push('Start time is required')

  if (apt.startTime && apt.endTime) {
    if (apt.endTime <= apt.startTime) {
      errors.push('End time must be after start time')
    }
  }

  return errors
}
```

**Verification:**
- [ ] Email validation works
- [ ] Phone validation accepts multiple formats
- [ ] Phone normalization adds +1 prefix
- [ ] Appointment validation catches errors

**Connects to:**
- Forms (patient registration, booking)
- API validation

---

### 🔴 FEATURE #15: Mock Data Generators
**Status:** 🔴 NOT STARTED
**Time:** 3 hours
**Prerequisites:** Features #1-8 (all schemas)

**What to build:**
```typescript
// lib/mock-data-generator.ts

export function generateMockPatients(count: number): Patient[] {
  const firstNames = ['Sarah', 'Jessica', 'Emily', 'Rachel', 'Amanda', 'Melissa']
  const lastNames = ['Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson']

  return Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    firstName: firstNames[i % firstNames.length],
    lastName: lastNames[i % lastNames.length],
    fullName: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    dateOfBirth: new Date(1980 + Math.random() * 30, Math.random() * 12, Math.random() * 28),
    age: 25 + Math.floor(Math.random() * 30),
    gender: 'female',
    email: `patient${i}@email.com`,
    phone: `+1555${String(Math.floor(Math.random() * 10000000)).padStart(7, '0')}`,
    // ... rest of fields
  }))
}

export function generateMockAppointments(
  patients: Patient[],
  practitioners: Practitioner[],
  services: Service[],
  startDate: Date,
  days: number
): Appointment[] {
  const appointments: Appointment[] = []

  for (let day = 0; day < days; day++) {
    const date = addDays(startDate, day)

    // 8-12 appointments per day
    const aptsPerDay = 8 + Math.floor(Math.random() * 5)

    for (let i = 0; i < aptsPerDay; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)]
      const practitioner = practitioners[Math.floor(Math.random() * practitioners.length)]
      const service = services[Math.floor(Math.random() * services.length)]

      const hour = 9 + Math.floor(Math.random() * 8) // 9am-5pm
      const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)]

      const startTime = new Date(date)
      startTime.setHours(hour, minute, 0, 0)

      const endTime = new Date(startTime.getTime() + service.totalDuration * 60000)

      appointments.push({
        id: `apt${appointments.length + 1}`,
        patientId: patient.id,
        patientName: patient.fullName,
        phone: patient.phone,
        serviceId: service.id,
        serviceName: service.name,
        practitionerId: practitioner.id,
        startTime,
        endTime,
        status: 'scheduled',
        // ... rest of fields
      })
    }
  }

  return appointments.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
}
```

**Verification:**
- [ ] Can generate 50+ patients
- [ ] Can generate 100+ appointments
- [ ] Appointments don't conflict
- [ ] Data looks realistic

**Connects to:**
- Testing
- Demo mode
- Development

---

## PHASE 2: CALENDAR & SCHEDULING (Features 16-27)
**Goal:** Full-featured calendar with drag-and-drop, resource management, and conflict prevention.

---

### 🔴 FEATURE #16: Calendar UI - Day/Week/Month Views
**Status:** 🔴 NOT STARTED
**Time:** 8 hours
**Prerequisites:** Feature #9 (Appointments API), #13 (Date utils)

**What to build:**

Create `app/calendar/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRealtimeAppointments } from '@/lib/use-realtime-appointments'
import { getWeekRange, addDays } from '@/lib/date-utils'

type ViewMode = 'day' | 'week' | 'month'

export default function CalendarPage() {
  const [view, setView] = useState<ViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())

  const dateRange = view === 'day'
    ? { start: currentDate, end: currentDate }
    : getWeekRange(currentDate)

  const { appointments, loading } = useRealtimeAppointments(dateRange)

  return (
    <div className="calendar-container">
      <CalendarHeader
        view={view}
        onViewChange={setView}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />

      {view === 'day' && <DayView date={currentDate} appointments={appointments} />}
      {view === 'week' && <WeekView date={currentDate} appointments={appointments} />}
      {view === 'month' && <MonthView date={currentDate} appointments={appointments} />}
    </div>
  )
}
```

**Day View:**
```typescript
function DayView({ date, appointments }: { date: Date; appointments: Appointment[] }) {
  const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 8am-8pm
  const dayAppointments = appointments.filter(apt => isSameDay(apt.startTime, date))

  return (
    <div className="day-view">
      <div className="time-column">
        {hours.map(hour => (
          <div key={hour} className="time-slot">
            {formatHour(hour)}
          </div>
        ))}
      </div>

      <div className="appointments-column">
        {dayAppointments.map(apt => (
          <AppointmentBlock
            key={apt.id}
            appointment={apt}
            style={calculatePosition(apt)}
          />
        ))}
      </div>
    </div>
  )
}
```

**Week View:**
```typescript
function WeekView({ date, appointments }: { date: Date; appointments: Appointment[] }) {
  const week = getWeekRange(date)
  const days = Array.from({ length: 7 }, (_, i) => addDays(week.start, i))

  return (
    <div className="week-view">
      <div className="week-header">
        {days.map(day => (
          <div key={day.toISOString()} className="day-header">
            {format(day, 'EEE M/d')}
          </div>
        ))}
      </div>

      <div className="week-grid">
        {days.map(day => (
          <DayColumn
            key={day.toISOString()}
            date={day}
            appointments={appointments.filter(apt => isSameDay(apt.startTime, day))}
          />
        ))}
      </div>
    </div>
  )
}
```

**Month View:**
```typescript
function MonthView({ date, appointments }: { date: Date; appointments: Appointment[] }) {
  // Show entire month in grid format
  // Each cell shows count of appointments that day
  // Click cell to view day detail
}
```

**Styling (Tailwind):**
```typescript
// components/AppointmentBlock.tsx

export function AppointmentBlock({ appointment, style }: Props) {
  const practitioner = practitioners.find(p => p.id === appointment.practitionerId)

  return (
    <div
      className="absolute rounded-lg p-2 text-sm cursor-pointer hover:shadow-lg"
      style={{
        ...style,
        backgroundColor: practitioner?.color || '#E3F2FD',
        borderLeft: `4px solid ${getStatusColor(appointment.status)}`
      }}
    >
      <div className="font-semibold">{appointment.patientName}</div>
      <div className="text-xs">{appointment.serviceName}</div>
      <div className="text-xs">{formatTime(appointment.startTime)}</div>
    </div>
  )
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'scheduled': return '#FFA726'
    case 'confirmed': return '#66BB6A'
    case 'completed': return '#42A5F5'
    case 'cancelled': return '#EF5350'
    case 'no-show': return '#AB47BC'
    default: return '#9E9E9E'
  }
}
```

**Verification:**
- [ ] Day view shows all appointments for single day
- [ ] Week view shows 7 days
- [ ] Month view shows entire month
- [ ] Can navigate between days/weeks/months
- [ ] Appointments display with correct times
- [ ] Practitioner colors show correctly
- [ ] Status indicators show correctly
- [ ] Appointments auto-refresh

**Edge cases:**
- Overlapping appointments (stack them side-by-side)
- Long appointment spans multiple hours
- Appointments outside business hours
- Empty days

**Connects to:**
- Drag-and-drop (Feature #17)
- Appointment clicking → detail view
- Resource allocation display

---

### 🔴 FEATURE #17: Drag-and-Drop Appointments
**Status:** 🔴 NOT STARTED
**Time:** 6 hours
**Prerequisites:** Feature #16 (Calendar UI)

**What to build:**

Install `@dnd-kit/core`:
```bash
npm install @dnd-kit/core @dnd-kit/utilities
```

```typescript
// components/DraggableAppointment.tsx

import { useDraggable } from '@dnd-kit/core'

export function DraggableAppointment({ appointment }: { appointment: Appointment }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: appointment.id,
    data: appointment
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <AppointmentBlock appointment={appointment} />
    </div>
  )
}

// components/DroppableTimeSlot.tsx

import { useDroppable } from '@dnd-kit/core'

export function DroppableTimeSlot({
  practitionerId,
  date,
  hour
}: {
  practitionerId: string
  date: Date
  hour: number
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `${practitionerId}-${date.toISOString()}-${hour}`,
    data: { practitionerId, date, hour }
  })

  return (
    <div
      ref={setNodeRef}
      className={`time-slot ${isOver ? 'bg-blue-100' : ''}`}
    />
  )
}

// app/calendar/page.tsx (updated)

import { DndContext, DragEndEvent } from '@dnd-kit/core'

export default function CalendarPage() {
  // ... existing code

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over) return

    const appointment = active.data.current as Appointment
    const { practitionerId, date, hour } = over.data.current

    // Calculate new start time
    const newStartTime = new Date(date)
    newStartTime.setHours(hour, 0, 0, 0)

    // Check for conflicts
    const conflicts = await checkConflicts(
      practitionerId,
      newStartTime,
      appointment.endTime
    )

    if (conflicts.hasConflict) {
      alert('Cannot move: time slot conflict')
      return
    }

    // Update appointment
    await fetch(`/api/appointments/${appointment.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        practitionerId,
        startTime: newStartTime,
        endTime: new Date(newStartTime.getTime() + (appointment.endTime.getTime() - appointment.startTime.getTime()))
      })
    })

    // Refresh calendar
    refresh()
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* calendar components */}
    </DndContext>
  )
}
```

**Verification:**
- [ ] Can drag appointment to new time slot
- [ ] Can drag appointment to different practitioner
- [ ] Conflict checking works (prevents invalid drops)
- [ ] UI updates immediately (optimistic)
- [ ] Error handling if server update fails
- [ ] Visual feedback during drag (cursor, highlighting)

**Edge cases:**
- Drop outside valid time range
- Drop on cancelled appointment
- Drag multi-day appointment
- Network error during update

**Connects to:**
- Calendar UI
- Conflict detection API

---

### 🔴 FEATURE #18: Time Blocks (Manual Blocking)
**Status:** 🔴 NOT STARTED
**Time:** 4 hours
**Prerequisites:** Feature #16 (Calendar UI)

**What to build:**
```typescript
// lib/data.ts

interface TimeBlock {
  id: string
  practitionerId: string
  startTime: Date
  endTime: Date
  type: 'lunch' | 'meeting' | 'blocked' | 'personal'
  reason?: string
  isRecurring: boolean
  recurrenceRule?: string         // If recurring
  createdBy: string
  createdAt: Date
}

export const timeBlocks: TimeBlock[] = []

// app/api/time-blocks/route.ts

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Check for appointment conflicts
  const conflicts = appointments.filter(apt =>
    apt.practitionerId === body.practitionerId &&
    apt.status !== 'cancelled' &&
    (
      (new Date(body.startTime) >= apt.startTime && new Date(body.startTime) < apt.endTime) ||
      (new Date(body.endTime) > apt.startTime && new Date(body.endTime) <= apt.endTime)
    )
  )

  if (conflicts.length > 0) {
    return NextResponse.json({
      error: 'Cannot create time block: appointments exist in this time slot',
      conflicts
    }, { status: 409 })
  }

  const timeBlock: TimeBlock = {
    id: `tb${Date.now()}`,
    ...body,
    createdAt: new Date()
  }

  timeBlocks.push(timeBlock)

  return NextResponse.json(timeBlock, { status: 201 })
}
```

**UI Component:**
```typescript
// components/TimeBlockDialog.tsx

export function TimeBlockDialog({ practitionerId, date }: Props) {
  const [type, setType] = useState<'lunch' | 'meeting' | 'blocked' | 'personal'>('blocked')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [reason, setReason] = useState('')

  async function handleCreate() {
    await fetch('/api/time-blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        practitionerId,
        startTime: new Date(`${date} ${startTime}`),
        endTime: new Date(`${date} ${endTime}`),
        type,
        reason,
        isRecurring: false,
        createdBy: 'current-user-id'
      })
    })
  }

  return (
    <dialog>
      <h2>Block Time</h2>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="lunch">Lunch Break</option>
        <option value="meeting">Meeting</option>
        <option value="blocked">Blocked</option>
        <option value="personal">Personal Time</option>
      </select>
      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" />
      <button onClick={handleCreate}>Create Block</button>
    </dialog>
  )
}
```

**Calendar Display:**
- Show time blocks as gray/striped bars
- Prevent booking appointments over time blocks
- Allow drag-and-drop to move time blocks

**Verification:**
- [ ] Can create time block for practitioner
- [ ] Time blocks prevent appointment booking
- [ ] Time blocks display on calendar
- [ ] Cannot create block if appointments exist
- [ ] Can delete time blocks

**Edge cases:**
- Creating block over existing appointments
- Overlapping time blocks
- Time block spans multiple days

**Connects to:**
- Calendar (display blocks)
- Booking flow (prevent booking over blocks)
- Recurring time blocks (Feature #19)

---

### 🔴 FEATURE #19: Repeating Time Blocks
**Status:** 🔴 NOT STARTED
**Time:** 5 hours
**Prerequisites:** Feature #18 (Time Blocks)

**What to build:**
```typescript
// lib/recurrence.ts

export function generateRecurringTimeBlocks(
  baseBlock: TimeBlock,
  recurrenceRule: string,
  endDate: Date
): TimeBlock[] {
  const blocks: TimeBlock[] = []

  // Parse recurrence rule: "daily", "weekly", "every-weekday", "custom"
  switch (recurrenceRule) {
    case 'daily':
      // Generate daily blocks
      break

    case 'weekly':
      // Generate weekly blocks (same day of week)
      break

    case 'every-weekday':
      // Monday-Friday only
      break

    case 'bi-weekly':
      // Every 2 weeks
      break
  }

  return blocks
}

// app/api/time-blocks/recurring/route.ts

export async function POST(request: NextRequest) {
  const { baseBlock, recurrenceRule, endDate } = await request.json()

  const recurringBlocks = generateRecurringTimeBlocks(
    baseBlock,
    recurrenceRule,
    new Date(endDate)
  )

  // Save all generated blocks
  timeBlocks.push(...recurringBlocks)

  return NextResponse.json({
    created: recurringBlocks.length,
    blocks: recurringBlocks
  })
}

// app/api/time-blocks/recurring/[groupId]/route.ts

export async function DELETE(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  const { searchParams } = new URL(request.url)
  const deleteType = searchParams.get('type') // 'this' | 'following' | 'all'

  // Delete based on type
  if (deleteType === 'all') {
    // Delete all blocks in recurring group
  } else if (deleteType === 'following') {
    // Delete this and all future blocks
  } else {
    // Delete only this instance
  }
}
```

**UI:**
```typescript
// components/RecurringTimeBlockDialog.tsx

export function RecurringTimeBlockDialog() {
  const [recurrence, setRecurrence] = useState('weekly')
  const [endDate, setEndDate] = useState('')

  return (
    <dialog>
      <h2>Recurring Time Block</h2>

      {/* Base time block fields */}

      <div className="recurrence-options">
        <label>
          <input type="radio" value="daily" checked={recurrence === 'daily'} onChange={e => setRecurrence(e.target.value)} />
          Every day
        </label>

        <label>
          <input type="radio" value="weekly" checked={recurrence === 'weekly'} onChange={e => setRecurrence(e.target.value)} />
          Every week (same day)
        </label>

        <label>
          <input type="radio" value="every-weekday" checked={recurrence === 'every-weekday'} onChange={e => setRecurrence(e.target.value)} />
          Every weekday (Mon-Fri)
        </label>
      </div>

      <label>
        End date:
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </label>

      <button onClick={handleCreate}>Create Recurring Block</button>
    </dialog>
  )
}
```

**Verification:**
- [ ] Can create daily recurring blocks
- [ ] Can create weekly recurring blocks
- [ ] Can create weekday-only blocks
- [ ] Editing one instance shows options: "Edit this", "Edit following", "Edit all"
- [ ] Deleting one instance shows same options
- [ ] Calendar displays recurring blocks correctly

**Edge cases:**
- Recurring block conflicts with existing appointments
- Editing past recurring blocks
- Deleting middle instance in recurring series

**Connects to:**
- Calendar (display recurring blocks)
- Time blocks (base functionality)
- Practitioner schedules

---

### 🔴 FEATURE #20: Resource Allocation (Rooms/Equipment)
**Status:** 🔴 NOT STARTED
**Time:** 6 hours
**Prerequisites:** Feature #5 (Rooms & Equipment), #9 (Appointments API)

**What to build:**
```typescript
// lib/resource-allocator.ts

export function checkResourceAvailability(
  startTime: Date,
  endTime: Date,
  requiredRoomType?: string,
  requiredEquipmentIds?: string[]
): {
  availableRooms: Room[]
  availableEquipment: Equipment[]
  hasAvailability: boolean
} {
  // Check which rooms are available
  const availableRooms = rooms.filter(room => {
    // Match room type if specified
    if (requiredRoomType && room.type !== requiredRoomType) {
      return false
    }

    // Check if room is booked
    const isBooked = appointments.some(apt =>
      apt.roomId === room.id &&
      apt.status !== 'cancelled' &&
      (
        (startTime >= apt.startTime && startTime < apt.endTime) ||
        (endTime > apt.startTime && endTime <= apt.endTime)
      )
    )

    return !isBooked && room.isActive
  })

  // Check equipment availability
  const availableEquipment = equipment.filter(eq => {
    if (!requiredEquipmentIds || !requiredEquipmentIds.includes(eq.id)) {
      return false
    }

    const isInUse = appointments.some(apt =>
      apt.equipmentIds?.includes(eq.id) &&
      apt.status !== 'cancelled' &&
      (
        (startTime >= apt.startTime && startTime < apt.endTime) ||
        (endTime > apt.startTime && endTime <= apt.endTime)
      )
    )

    return !isInUse && eq.isOperational
  })

  return {
    availableRooms,
    availableEquipment,
    hasAvailability: availableRooms.length > 0 &&
      (!requiredEquipmentIds || availableEquipment.length >= requiredEquipmentIds.length)
  }
}

export function autoAssignResources(appointment: Appointment): {
  roomId?: string
  equipmentIds?: string[]
} {
  const service = services.find(s => s.id === appointment.serviceId)
  if (!service) return {}

  const { availableRooms, availableEquipment } = checkResourceAvailability(
    appointment.startTime,
    appointment.endTime,
    service.preferredRoomType,
    service.requiresEquipment
  )

  return {
    roomId: availableRooms[0]?.id,
    equipmentIds: availableEquipment.map(eq => eq.id)
  }
}

// app/api/resources/availability/route.ts

export async function POST(request: NextRequest) {
  const { startTime, endTime, serviceId } = await request.json()

  const service = services.find(s => s.id === serviceId)
  if (!service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  const availability = checkResourceAvailability(
    new Date(startTime),
    new Date(endTime),
    service.preferredRoomType,
    service.requiresEquipment
  )

  return NextResponse.json(availability)
}
```

**Calendar Display:**
- Add room/equipment columns to calendar
- Show which room each appointment is in
- Highlight equipment usage
- Warning icon if resources not assigned

**Booking Flow Integration:**
```typescript
// components/BookingForm.tsx

export function BookingForm() {
  // ... existing fields

  async function handleSubmit() {
    // Check resource availability before booking
    const availability = await fetch('/api/resources/availability', {
      method: 'POST',
      body: JSON.stringify({ startTime, endTime, serviceId })
    }).then(r => r.json())

    if (!availability.hasAvailability) {
      alert('No rooms or equipment available for this time')
      return
    }

    // Auto-assign resources
    const { roomId, equipmentIds } = autoAssignResources({
      startTime,
      endTime,
      serviceId,
      // ... other fields
    })

    // Create appointment with resources
    await createAppointment({
      // ... appointment fields
      roomId,
      equipmentIds
    })
  }
}
```

**Verification:**
- [ ] Rooms cannot be double-booked
- [ ] Equipment cannot be double-booked
- [ ] Auto-assignment selects available resources
- [ ] Calendar shows room assignments
- [ ] Can manually reassign rooms
- [ ] Laser equipment shows shot count
- [ ] Equipment maintenance alerts

**Edge cases:**
- No available rooms
- Equipment under maintenance
- Shared equipment conflicts
- Room change mid-appointment

**Connects to:**
- Calendar (resource display)
- Booking flow (resource assignment)
- Equipment maintenance tracking

---

### 🔴 FEATURE #21: Processing/Buffer Time Display
**Status:** 🔴 NOT STARTED
**Time:** 4 hours
**Prerequisites:** Feature #16 (Calendar UI), #3 (Services with timing)

**What to build:**
```typescript
// components/AppointmentBlockDetailed.tsx

export function AppointmentBlockDetailed({ appointment }: { appointment: Appointment }) {
  const service = services.find(s => s.id === appointment.serviceId)

  return (
    <div className="appointment-detailed">
      {/* Processing phase (numbing) */}
      {appointment.processingMinutes > 0 && (
        <div
          className="phase-processing"
          style={{
            height: `${(appointment.processingMinutes / totalMinutes) * 100}%`,
            background: 'repeating-linear-gradient(45deg, #FFE5E5, #FFE5E5 10px, #FFCCCC 10px, #FFCCCC 20px)'
          }}
        >
          <span className="phase-label">⏱️ Processing {appointment.processingMinutes}min</span>
        </div>
      )}

      {/* Service phase (actual treatment) */}
      <div
        className="phase-service"
        style={{
          height: `${(appointment.serviceMinutes / totalMinutes) * 100}%`,
          background: practitioner.color
        }}
      >
        <div className="appointment-info">
          <strong>{appointment.patientName}</strong>
          <div>{appointment.serviceName}</div>
          <div>🔬 Service {appointment.serviceMinutes}min</div>
        </div>
      </div>

      {/* Finishing phase (recovery/observation) */}
      {appointment.finishingMinutes > 0 && (
        <div
          className="phase-finishing"
          style={{
            height: `${(appointment.finishingMinutes / totalMinutes) * 100}%`,
            background: 'repeating-linear-gradient(45deg, #E3F2FD, #E3F2FD 10px, #BBDEFB 10px, #BBDEFB 20px)'
          }}
        >
          <span className="phase-label">✓ Finishing {appointment.finishingMinutes}min</span>
        </div>
      )}

      {/* Buffer phase (cleanup) */}
      {appointment.bufferMinutes > 0 && (
        <div
          className="phase-buffer"
          style={{
            height: `${(appointment.bufferMinutes / totalMinutes) * 100}%`,
            background: 'repeating-linear-gradient(45deg, #FFF8E1, #FFF8E1 10px, #FFECB3 10px, #FFECB3 20px)'
          }}
        >
          <span className="phase-label">🧹 Buffer {appointment.bufferMinutes}min</span>
        </div>
      )}
    </div>
  )
}
```

**Phase Tracking:**
```typescript
// app/api/appointments/[id]/phase/route.ts

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { currentPhase } = await request.json()

  const apt = appointments.find(a => a.id === params.id)
  if (!apt) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  apt.currentPhase = currentPhase
  apt.lastModifiedAt = new Date()

  // Track phase timestamps
  if (currentPhase === 'processing') {
    apt.processingStartedAt = new Date()
  } else if (currentPhase === 'service') {
    apt.serviceStartedAt = new Date()
  } else if (currentPhase === 'finishing') {
    apt.finishingStartedAt = new Date()
  }

  return NextResponse.json(apt)
}
```

**Treatment Room UI:**
```typescript
// app/treatment-room/[appointmentId]/page.tsx

export default function TreatmentRoomPage({ params }: { params: { appointmentId: string } }) {
  const appointment = useAppointment(params.appointmentId)

  return (
    <div className="treatment-room">
      <div className="phase-tracker">
        <PhaseButton
          phase="processing"
          label="Start Numbing"
          active={appointment.currentPhase === 'processing'}
          onClick={() => updatePhase('processing')}
        />

        <PhaseButton
          phase="service"
          label="Begin Treatment"
          active={appointment.currentPhase === 'service'}
          onClick={() => updatePhase('service')}
        />

        <PhaseButton
          phase="finishing"
          label="Finishing Up"
          active={appointment.currentPhase === 'finishing'}
          onClick={() => updatePhase('finishing')}
        />

        <PhaseButton
          phase="complete"
          label="Complete"
          active={appointment.currentPhase === 'complete'}
          onClick={() => updatePhase('complete')}
        />
      </div>

      {/* Timer showing phase progress */}
      <PhaseTimer appointment={appointment} />
    </div>
  )
}
```

**Verification:**
- [ ] Calendar shows multi-phase appointments
- [ ] Processing time displays with striped pattern
- [ ] Service time is solid color
- [ ] Finishing time displays differently
- [ ] Buffer time shows at end
- [ ] Treatment room can advance phases
- [ ] Phase timestamps tracked
- [ ] Total duration calculation correct

**Connects to:**
- Calendar (visual display)
- Treatment room (phase tracking)
- Services (timing configuration)

---

### 🔴 FEATURE #22: Double Booking Prevention
**Status:** 🔴 NOT STARTED
**Time:** 3 hours
**Prerequisites:** Feature #9 (Appointments API)

**What to build:**
```typescript
// lib/conflict-detector.ts

export interface ConflictCheck {
  hasConflict: boolean
  conflicts: Appointment[]
  conflictType: 'practitioner' | 'room' | 'equipment' | 'patient' | null
}

export function detectConflicts(
  newAppointment: Partial<Appointment>,
  existingAppointments: Appointment[]
): ConflictCheck {
  const conflicts = existingAppointments.filter(apt =>
    apt.id !== newAppointment.id &&
    apt.status !== 'cancelled' &&
    timesOverlap(newAppointment.startTime!, newAppointment.endTime!, apt.startTime, apt.endTime)
  )

  // Check practitioner conflicts
  const practitionerConflicts = conflicts.filter(apt =>
    apt.practitionerId === newAppointment.practitionerId
  )

  // Check room conflicts
  const roomConflicts = conflicts.filter(apt =>
    newAppointment.roomId && apt.roomId === newAppointment.roomId
  )

  // Check equipment conflicts
  const equipmentConflicts = conflicts.filter(apt =>
    newAppointment.equipmentIds?.some(eqId => apt.equipmentIds?.includes(eqId))
  )

  // Check patient conflicts (patient double-booked)
  const patientConflicts = conflicts.filter(apt =>
    apt.patientId === newAppointment.patientId
  )

  if (practitionerConflicts.length > 0) {
    return { hasConflict: true, conflicts: practitionerConflicts, conflictType: 'practitioner' }
  }

  if (roomConflicts.length > 0) {
    return { hasConflict: true, conflicts: roomConflicts, conflictType: 'room' }
  }

  if (equipmentConflicts.length > 0) {
    return { hasConflict: true, conflicts: equipmentConflicts, conflictType: 'equipment' }
  }

  if (patientConflicts.length > 0) {
    return { hasConflict: true, conflicts: patientConflicts, conflictType: 'patient' }
  }

  return { hasConflict: false, conflicts: [], conflictType: null }
}

function timesOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return (
    (start1 >= start2 && start1 < end2) ||
    (end1 > start2 && end1 <= end2) ||
    (start1 <= start2 && end1 >= end2)
  )
}

// Real-time conflict checking with debouncing
export function useConflictChecker(appointment: Partial<Appointment>) {
  const [conflicts, setConflicts] = useState<ConflictCheck | null>(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!appointment.startTime || !appointment.endTime) return

    const timer = setTimeout(async () => {
      setChecking(true)
      const result = await fetch('/api/appointments/check-conflicts', {
        method: 'POST',
        body: JSON.stringify(appointment)
      }).then(r => r.json())

      setConflicts(result)
      setChecking(false)
    }, 500) // Debounce 500ms

    return () => clearTimeout(timer)
  }, [appointment.startTime, appointment.endTime, appointment.practitionerId, appointment.roomId])

  return { conflicts, checking }
}
```

**UI Integration:**
```typescript
// components/ConflictWarning.tsx

export function ConflictWarning({ conflicts }: { conflicts: ConflictCheck }) {
  if (!conflicts.hasConflict) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
      <h4 className="text-red-800 font-semibold flex items-center">
        ⚠️ Booking Conflict Detected
      </h4>

      <p className="text-red-700 mt-2">
        {conflicts.conflictType === 'practitioner' && 'This practitioner is already booked at this time.'}
        {conflicts.conflictType === 'room' && 'This room is already booked.'}
        {conflicts.conflictType === 'equipment' && 'Required equipment is in use.'}
        {conflicts.conflictType === 'patient' && 'This patient already has an appointment at this time.'}
      </p>

      <div className="mt-3">
        <strong>Conflicting appointments:</strong>
        <ul className="list-disc ml-5">
          {conflicts.conflicts.map(apt => (
            <li key={apt.id}>
              {apt.patientName} - {apt.serviceName} ({formatTime(apt.startTime)} - {formatTime(apt.endTime)})
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// components/BookingForm.tsx (updated)

export function BookingForm() {
  const [appointment, setAppointment] = useState<Partial<Appointment>>({})
  const { conflicts, checking } = useConflictChecker(appointment)

  return (
    <form>
      {/* ... form fields */}

      {checking && <div className="text-blue-600">⏳ Checking availability...</div>}

      {conflicts && <ConflictWarning conflicts={conflicts} />}

      <button
        type="submit"
        disabled={conflicts?.hasConflict || checking}
      >
        {conflicts?.hasConflict ? 'Cannot Book - Conflict Exists' : 'Book Appointment'}
      </button>
    </form>
  )
}
```

**Verification:**
- [ ] Prevents practitioner double-booking
- [ ] Prevents room double-booking
- [ ] Prevents equipment double-booking
- [ ] Warns if patient already has appointment
- [ ] Real-time conflict checking (debounced)
- [ ] Clear error messages
- [ ] Shows conflicting appointments
- [ ] Drag-and-drop respects conflicts

**Edge cases:**
- Appointments touching but not overlapping (back-to-back OK)
- Cancelled appointments ignored
- Timezone-related edge cases
- Same-minute booking race conditions

**Connects to:**
- Booking form
- Calendar drag-and-drop
- API appointment creation

---

### 🔴 FEATURE #23: Multi-Practitioner View
**Status:** 🔴 NOT STARTED
**Time:** 5 hours
**Prerequisites:** Feature #16 (Calendar UI)

**What to build:**
```typescript
// app/calendar/page.tsx (enhanced)

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<'single' | 'multi'>('multi')
  const [selectedPractitioners, setSelectedPractitioners] = useState<string[]>([])

  const { practitioners } = usePractitioners()

  // Auto-select all active practitioners
  useEffect(() => {
    setSelectedPractitioners(practitioners.filter(p => p.isActive).map(p => p.id))
  }, [practitioners])

  return (
    <div className="calendar-page">
      <CalendarToolbar>
        <button onClick={() => setViewMode('single')}>Single View</button>
        <button onClick={() => setViewMode('multi')}>Multi View</button>

        <PractitionerFilter
          practitioners={practitioners}
          selected={selectedPractitioners}
          onChange={setSelectedPractitioners}
        />
      </CalendarToolbar>

      {viewMode === 'multi' ? (
        <MultiPractitionerCalendar practitioners={selectedPractitioners} />
      ) : (
        <SinglePractitionerCalendar practitionerId={selectedPractitioners[0]} />
      )}
    </div>
  )
}

// components/MultiPractitionerCalendar.tsx

export function MultiPractitionerCalendar({ practitioners }: { practitioners: string[] }) {
  const { appointments } = useRealtimeAppointments()
  const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 8am-8pm

  return (
    <div className="multi-practitioner-calendar">
      {/* Time column */}
      <div className="time-column">
        {hours.map(hour => (
          <div key={hour} className="hour-slot">
            {formatHour(hour)}
          </div>
        ))}
      </div>

      {/* Practitioner columns */}
      {practitioners.map(pracId => {
        const practitioner = getPractitionerById(pracId)
        const pracAppointments = appointments.filter(apt => apt.practitionerId === pracId)

        return (
          <div key={pracId} className="practitioner-column">
            <div className="practitioner-header" style={{ backgroundColor: practitioner.color }}>
              <div className="practitioner-name">{practitioner.fullName}</div>
              <div className="practitioner-title">{practitioner.title}</div>
            </div>

            <div className="practitioner-schedule">
              {hours.map(hour => (
                <DroppableTimeSlot
                  key={`${pracId}-${hour}`}
                  practitionerId={pracId}
                  date={currentDate}
                  hour={hour}
                />
              ))}

              {/* Overlay appointments */}
              {pracAppointments.map(apt => (
                <DraggableAppointment
                  key={apt.id}
                  appointment={apt}
                  style={calculatePosition(apt)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// components/PractitionerFilter.tsx

export function PractitionerFilter({ practitioners, selected, onChange }: Props) {
  return (
    <div className="practitioner-filter">
      <button onClick={() => onChange(practitioners.map(p => p.id))}>
        Select All
      </button>
      <button onClick={() => onChange([])}>
        Clear All
      </button>

      <div className="practitioner-checkboxes">
        {practitioners.map(prac => (
          <label key={prac.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(prac.id)}
              onChange={(e) => {
                if (e.target.checked) {
                  onChange([...selected, prac.id])
                } else {
                  onChange(selected.filter(id => id !== prac.id))
                }
              }}
            />
            <span
              className="color-indicator"
              style={{ backgroundColor: prac.color }}
            />
            {prac.fullName}
          </label>
        ))}
      </div>
    </div>
  )
}
```

**Verification:**
- [ ] Shows multiple practitioners side-by-side
- [ ] Each practitioner has own column
- [ ] Practitioner colors show in header
- [ ] Can filter which practitioners to show
- [ ] Can drag appointments between practitioners
- [ ] Mobile responsive (scrollable horizontally)
- [ ] Select all / clear all works

**Edge cases:**
- Too many practitioners (performance)
- Mobile view with 5+ practitioners
- Different working hours per practitioner

**Connects to:**
- Calendar UI
- Practitioner management
- Drag-and-drop

---

### 🔴 FEATURE #24: Color Coding by Practitioner
**Status:** 🔴 NOT STARTED
**Time:** 2 hours
**Prerequisites:** Feature #4 (Practitioners with colors), #16 (Calendar UI)

**What to build:**
```typescript
// lib/data.ts (already in Feature #4, but ensure colors assigned)

export const practitioners: Practitioner[] = [
  {
    id: 'prac1',
    fullName: 'Dr. Emily Chen',
    color: '#4CAF50',  // Green
    // ... other fields
  },
  {
    id: 'prac2',
    fullName: 'Jessica Williams, NP',
    color: '#2196F3',  // Blue
    // ... other fields
  },
  {
    id: 'prac3',
    fullName: 'Dr. Michael Torres',
    color: '#FF9800',  // Orange
    // ... other fields
  }
]

// components/AppointmentBlock.tsx (update)

export function AppointmentBlock({ appointment }: { appointment: Appointment }) {
  const practitioner = practitioners.find(p => p.id === appointment.practitionerId)
  const statusColor = getStatusColor(appointment.status)

  return (
    <div
      className="appointment-block"
      style={{
        backgroundColor: practitioner?.color + '22', // 22 = 13% opacity
        borderLeft: `4px solid ${statusColor}`,
        borderRight: `4px solid ${practitioner?.color}`
      }}
    >
      <div className="patient-name">{appointment.patientName}</div>
      <div className="service-name">{appointment.serviceName}</div>
      <div className="time-range">
        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
      </div>
    </div>
  )
}

// components/CalendarLegend.tsx

export function CalendarLegend() {
  const { practitioners } = usePractitioners()

  return (
    <div className="calendar-legend">
      <h4>Practitioners</h4>
      {practitioners.map(prac => (
        <div key={prac.id} className="legend-item">
          <span
            className="color-box"
            style={{ backgroundColor: prac.color }}
          />
          {prac.fullName} ({prac.title})
        </div>
      ))}

      <h4 className="mt-4">Status</h4>
      <div className="legend-item">
        <span className="color-box" style={{ backgroundColor: '#FFA726' }} />
        Scheduled
      </div>
      <div className="legend-item">
        <span className="color-box" style={{ backgroundColor: '#66BB6A' }} />
        Confirmed
      </div>
      <div className="legend-item">
        <span className="color-box" style={{ backgroundColor: '#42A5F5' }} />
        Completed
      </div>
      <div className="legend-item">
        <span className="color-box" style={{ backgroundColor: '#EF5350' }} />
        Cancelled
      </div>
    </div>
  )
}
```

**Verification:**
- [ ] Each practitioner has unique color
- [ ] Appointment background uses practitioner color (light)
- [ ] Status shown as colored left border
- [ ] Legend shows practitioner colors
- [ ] Color picker in practitioner settings
- [ ] Colors are WCAG-compliant (readable text)

**Connects to:**
- Calendar UI
- Practitioner settings
- Multi-practitioner view

---

### 🔴 FEATURE #25: Appointment Conflicts UI
**Status:** 🔴 NOT STARTED
**Time:** 3 hours
**Prerequisites:** Feature #22 (Conflict detection)

**What to build:**
```typescript
// components/ConflictIndicator.tsx

export function ConflictIndicator({ appointment }: { appointment: Appointment }) {
  const conflicts = useConflicts(appointment)

  if (!conflicts.hasConflict) return null

  return (
    <div className="conflict-indicator" title={`${conflicts.conflicts.length} conflicts`}>
      ⚠️
    </div>
  )
}

// components/ConflictResolutionDialog.tsx

export function ConflictResolutionDialog({ appointment, conflicts }: Props) {
  return (
    <dialog className="conflict-dialog">
      <h2>⚠️ Booking Conflict</h2>

      <div className="new-appointment">
        <h3>New Appointment</h3>
        <AppointmentCard appointment={appointment} />
      </div>

      <div className="conflicts-list">
        <h3>Conflicts with:</h3>
        {conflicts.conflicts.map(apt => (
          <div key={apt.id} className="conflict-item">
            <AppointmentCard appointment={apt} />
            <button onClick={() => moveAppointment(apt.id)}>
              Move This Instead
            </button>
          </div>
        ))}
      </div>

      <div className="resolution-options">
        <button onClick={suggestAlternativeTimes}>
          Suggest Alternative Times
        </button>
        <button onClick={forceBookAnyway} className="text-red-600">
          Force Book Anyway (Override)
        </button>
        <button onClick={cancel}>Cancel</button>
      </div>
    </dialog>
  )
}

// lib/conflict-resolver.ts

export function suggestAlternativeTimes(
  appointment: Partial<Appointment>,
  date: Date
): Date[] {
  const alternatives: Date[] = []
  const duration = (appointment.endTime!.getTime() - appointment.startTime!.getTime()) / 60000 // minutes

  // Try every 15-minute slot from 8am-8pm
  for (let hour = 8; hour < 20; hour++) {
    for (let minute of [0, 15, 30, 45]) {
      const testStart = new Date(date)
      testStart.setHours(hour, minute, 0, 0)

      const testEnd = new Date(testStart.getTime() + duration * 60000)

      // Check if this slot works
      const conflicts = detectConflicts({
        ...appointment,
        startTime: testStart,
        endTime: testEnd
      }, appointments)

      if (!conflicts.hasConflict) {
        alternatives.push(testStart)
        if (alternatives.length >= 5) return alternatives // Return first 5 options
      }
    }
  }

  return alternatives
}
```

**Verification:**
- [ ] Conflict warning shows before booking
- [ ] Lists all conflicting appointments
- [ ] Suggests alternative times
- [ ] Can override conflicts (with permission)
- [ ] Visual indicator on calendar for conflicts

**Connects to:**
- Booking form
- Calendar
- Conflict detection

---

### 🔴 FEATURE #26: Express Booking (Quick Add)
**Status:** 🔴 NOT STARTED
**Time:** 4 hours
**Prerequisites:** Feature #9 (Appointments API)

**What to build:**
```typescript
// components/ExpressBookingDialog.tsx

export function ExpressBookingDialog({ defaultDate, defaultTime, defaultPractitioner }: Props) {
  const [step, setStep] = useState<'patient' | 'service' | 'confirm'>('patient')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  async function handleQuickBook() {
    const startTime = new Date(`${defaultDate} ${defaultTime}`)
    const endTime = new Date(startTime.getTime() + selectedService!.totalDuration * 60000)

    await fetch('/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        patientId: selectedPatient!.id,
        patientName: selectedPatient!.fullName,
        phone: selectedPatient!.phone,
        serviceId: selectedService!.id,
        practitionerId: defaultPractitioner,
        startTime,
        endTime,
        createdBy: 'current-user-id'
      })
    })

    onClose()
  }

  return (
    <dialog className="express-booking">
      {step === 'patient' && (
        <PatientSearch
          onSelect={(patient) => {
            setSelectedPatient(patient)
            setStep('service')
          }}
        />
      )}

      {step === 'service' && (
        <ServiceSelector
          onSelect={(service) => {
            setSelectedService(service)
            setStep('confirm')
          }}
          onBack={() => setStep('patient')}
        />
      )}

      {step === 'confirm' && (
        <div>
          <h3>Confirm Booking</h3>
          <div className="booking-summary">
            <p><strong>Patient:</strong> {selectedPatient?.fullName}</p>
            <p><strong>Service:</strong> {selectedService?.name}</p>
            <p><strong>Time:</strong> {formatTime(defaultDate, defaultTime)}</p>
            <p><strong>Duration:</strong> {selectedService?.totalDuration} minutes</p>
          </div>

          <button onClick={handleQuickBook}>Book Now</button>
          <button onClick={() => setStep('service')}>Back</button>
        </div>
      )}
    </dialog>
  )
}

// Calendar integration - click empty time slot
// components/TimeSlot.tsx

export function TimeSlot({ date, hour, practitionerId }: Props) {
  const [showExpressBooking, setShowExpressBooking] = useState(false)

  function handleClick() {
    setShowExpressBooking(true)
  }

  return (
    <>
      <div className="time-slot" onClick={handleClick}>
        {/* Empty slot */}
      </div>

      {showExpressBooking && (
        <ExpressBookingDialog
          defaultDate={date}
          defaultTime={`${hour}:00`}
          defaultPractitioner={practitionerId}
          onClose={() => setShowExpressBooking(false)}
        />
      )}
    </>
  )
}

// Keyboard shortcut
// Press 'B' anywhere on calendar to quick-book

useEffect(() => {
  function handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'b' || e.key === 'B') {
      openExpressBooking()
    }
  }

  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [])
```

**Verification:**
- [ ] Click empty time slot → express booking opens
- [ ] 3-step flow: Patient → Service → Confirm
- [ ] Patient search with autocomplete
- [ ] Service selector with categories
- [ ] Keyboard shortcut 'B' works
- [ ] Booking completes in <10 seconds
- [ ] Auto-closes after booking

**Edge cases:**
- Patient not found (create new patient flow)
- Time slot conflicts (detected before confirmation)
- Service requires resources (auto-assign)

**Connects to:**
- Calendar
- Patient search
- Appointments API

---

### 🔴 FEATURE #27: Calendar Filters
**Status:** 🔴 NOT STARTED
**Time:** 3 hours
**Prerequisites:** Feature #16 (Calendar UI)

**What to build:**
```typescript
// components/CalendarFilters.tsx

export function CalendarFilters({ onFilterChange }: { onFilterChange: (filters: FilterState) => void }) {
  const [filters, setFilters] = useState<FilterState>({
    practitioners: [],
    services: [],
    statuses: [],
    search: ''
  })

  useEffect(() => {
    onFilterChange(filters)
  }, [filters])

  return (
    <div className="calendar-filters">
      {/* Search */}
      <input
        type="text"
        placeholder="Search patient name..."
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />

      {/* Practitioner filter */}
      <MultiSelect
        label="Practitioners"
        options={practitioners.map(p => ({ value: p.id, label: p.fullName }))}
        selected={filters.practitioners}
        onChange={(selected) => setFilters({ ...filters, practitioners: selected })}
      />

      {/* Service filter */}
      <MultiSelect
        label="Services"
        options={services.map(s => ({ value: s.id, label: s.name }))}
        selected={filters.services}
        onChange={(selected) => setFilters({ ...filters, services: selected })}
      />

      {/* Status filter */}
      <MultiSelect
        label="Status"
        options={[
          { value: 'scheduled', label: 'Scheduled' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' }
        ]}
        selected={filters.statuses}
        onChange={(selected) => setFilters({ ...filters, statuses: selected })}
      />

      {/* Quick filters */}
      <div className="quick-filters">
        <button onClick={() => setFilters({ ...defaultFilters, statuses: ['scheduled', 'confirmed'] })}>
          Today's Appointments
        </button>
        <button onClick={() => setFilters({ ...defaultFilters, statuses: ['completed'] })}>
          Completed
        </button>
        <button onClick={() => setFilters(defaultFilters)}>
          Clear All
        </button>
      </div>
    </div>
  )
}

// Apply filters
function applyFilters(appointments: Appointment[], filters: FilterState): Appointment[] {
  let filtered = appointments

  if (filters.search) {
    filtered = filtered.filter(apt =>
      apt.patientName.toLowerCase().includes(filters.search.toLowerCase())
    )
  }

  if (filters.practitioners.length > 0) {
    filtered = filtered.filter(apt => filters.practitioners.includes(apt.practitionerId))
  }

  if (filters.services.length > 0) {
    filtered = filtered.filter(apt => filters.services.includes(apt.serviceId))
  }

  if (filters.statuses.length > 0) {
    filtered = filtered.filter(apt => filters.statuses.includes(apt.status))
  }

  return filtered
}
```

**Verification:**
- [ ] Search filters by patient name
- [ ] Can filter by practitioners
- [ ] Can filter by services
- [ ] Can filter by status
- [ ] Quick filters work ("Today's", "Completed")
- [ ] Clear all resets filters
- [ ] Filters persist across page refresh (localStorage)

**Connects to:**
- Calendar UI
- Multi-practitioner view

---

## PHASE 3: PATIENT MANAGEMENT (Features 28-35)
**Goal:** Complete patient information system including intake, medical history, and patient portal.

---

### 🔴 FEATURE #28: Patient List & Search
**Status:** 🔴 NOT STARTED
**Time:** 5 hours
**Prerequisites:** Feature #2 (Patients table)

**What to build:**
```typescript
// app/patients/page.tsx

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<PatientFilters>({
    status: 'active',
    tags: [],
    sortBy: 'lastVisit'
  })

  return (
    <div className="patients-page">
      <div className="patients-header">
        <h1>Patients</h1>
        <button onClick={() => router.push('/patients/new')}>+ New Patient</button>
      </div>

      <PatientSearchBar value={search} onChange={setSearch} />
      <PatientFilters filters={filters} onChange={setFilters} />

      <PatientTable
        patients={filteredPatients}
        onPatientClick={(id) => router.push(`/patients/${id}`)}
      />
    </div>
  )
}

// components/PatientSearchBar.tsx

export function PatientSearchBar({ value, onChange }: Props) {
  const [results, setResults] = useState<Patient[]>([])

  // Debounced search
  useEffect(() => {
    if (value.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      const res = await fetch(`/api/patients/search?q=${encodeURIComponent(value)}`)
      const data = await res.json()
      setResults(data)
    }, 300)

    return () => clearTimeout(timer)
  }, [value])

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search by name, phone, or email..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {results.length > 0 && (
        <div className="search-results">
          {results.map(patient => (
            <PatientSearchResult key={patient.id} patient={patient} />
          ))}
        </div>
      )}
    </div>
  )
}

// app/api/patients/search/route.ts

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase() || ''

  const results = patients.filter(p =>
    p.fullName.toLowerCase().includes(query) ||
    p.email.toLowerCase().includes(query) ||
    p.phone.includes(query)
  )

  return NextResponse.json(results.slice(0, 10)) // Limit to 10 results
}
```

**Patient Table:**
```typescript
// components/PatientTable.tsx

export function PatientTable({ patients, onPatientClick }: Props) {
  return (
    <table className="patient-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Last Visit</th>
          <th>Total Visits</th>
          <th>Lifetime Value</th>
          <th>Status</th>
          <th>Tags</th>
        </tr>
      </thead>
      <tbody>
        {patients.map(patient => (
          <tr key={patient.id} onClick={() => onPatientClick(patient.id)} className="cursor-pointer hover:bg-gray-50">
            <td>
              <div className="patient-name">{patient.fullName}</div>
              <div className="patient-dob">{formatDate(patient.dateOfBirth)} ({patient.age} yrs)</div>
            </td>
            <td>{formatPhoneNumber(patient.phone)}</td>
            <td>{patient.email}</td>
            <td>{patient.lastVisitDate ? formatDate(patient.lastVisitDate) : 'Never'}</td>
            <td>{patient.totalVisits}</td>
            <td className="font-semibold">{formatCurrency(patient.totalLifetimeValue)}</td>
            <td>
              <StatusBadge status={patient.status} />
            </td>
            <td>
              <div className="tags">
                {patient.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

**Verification:**
- [ ] Patient list displays all patients
- [ ] Search works for name, phone, email
- [ ] Search results appear within 300ms
- [ ] Can sort by name, last visit, lifetime value
- [ ] Can filter by status (active/inactive)
- [ ] Can filter by tags
- [ ] Click patient row → navigate to patient profile
- [ ] Pagination works (50 patients per page)

**Edge cases:**
- No search results
- Special characters in search
- Very long patient list (1000+ patients)
- Mobile responsive table

**Connects to:**
- Patient profile (Feature #29)
- Booking flow
- Appointment viewing

---

### 🔴 FEATURE #29: Patient Profile Page
**Status:** 🔴 NOT STARTED
**Time:** 6 hours
**Prerequisites:** Feature #2 (Patients), #28 (Patient list)

**What to build:**
```typescript
// app/patients/[id]/page.tsx

export default function PatientProfilePage({ params }: { params: { id: string } }) {
  const patient = usePatient(params.id)
  const appointments = usePatientAppointments(params.id)
  const transactions = usePatientTransactions(params.id)

  return (
    <div className="patient-profile">
      {/* Header */}
      <div className="profile-header">
        <div className="patient-info">
          <h1>{patient.fullName}</h1>
          <div className="patient-meta">
            {patient.age} years old • {patient.gender}
          </div>
          <div className="tags">
            {patient.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
          </div>
        </div>

        <div className="quick-actions">
          <button onClick={() => openBookingDialog(patient.id)}>Book Appointment</button>
          <button onClick={() => router.push(`/patients/${patient.id}/edit`)}>Edit</button>
          <button onClick={() => sendSMS(patient.phone)}>Send SMS</button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="medical">Medical History</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="overview-grid">
            {/* Contact Info Card */}
            <Card>
              <CardHeader>Contact Information</CardHeader>
              <CardContent>
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <span>{formatPhoneNumber(patient.phone)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span>{patient.email}</span>
                </div>
                <div className="info-row">
                  <span className="label">Address:</span>
                  <span>{formatAddress(patient.address)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>Statistics</CardHeader>
              <CardContent>
                <Stat label="Total Visits" value={patient.totalVisits} />
                <Stat label="Lifetime Value" value={formatCurrency(patient.totalLifetimeValue)} />
                <Stat label="Outstanding Balance" value={formatCurrency(patient.outstandingBalance)} className={patient.outstandingBalance > 0 ? 'text-red-600' : ''} />
                <Stat label="No-Show Rate" value={`${Math.round((patient.noShowCount / patient.totalVisits) * 100)}%`} />
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>Upcoming Appointments</CardHeader>
              <CardContent>
                {appointments.filter(apt => apt.startTime > new Date()).map(apt => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>Recent Activity</CardHeader>
              <CardContent>
                <ActivityFeed patientId={patient.id} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <AppointmentHistory appointments={appointments} />
        </TabsContent>

        <TabsContent value="medical">
          <MedicalHistory patient={patient} />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialHistory transactions={transactions} patient={patient} />
        </TabsContent>

        <TabsContent value="documents">
          <PatientDocuments patientId={patient.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Verification:**
- [ ] Patient profile loads all data
- [ ] Tabs switch correctly
- [ ] Quick actions work (book, edit, SMS)
- [ ] Stats calculate correctly
- [ ] Upcoming appointments show
- [ ] Can view appointment history
- [ ] Can view medical history
- [ ] Can view financial history

**Connects to:**
- Patient editing
- Booking flow
- Medical history (Feature #31)
- Financial tracking

---

### 🔴 FEATURE #30: Patient Intake Forms
**Status:** 🔴 NOT STARTED
**Time:** 8 hours
**Prerequisites:** Feature #2 (Patients)

**What to build:**
```typescript
// app/patients/new/page.tsx

export default function NewPatientPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<Patient>>({})

  async function handleSubmit() {
    // Create patient
    const res = await fetch('/api/patients', {
      method: 'POST',
      body: JSON.stringify(formData)
    })

    const newPatient = await res.json()
    router.push(`/patients/${newPatient.id}`)
  }

  return (
    <div className="new-patient-page">
      <h1>New Patient Intake</h1>

      <ProgressSteps currentStep={step} totalSteps={4} />

      {step === 1 && (
        <BasicInfoForm
          data={formData}
          onChange={setFormData}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <ContactInfoForm
          data={formData}
          onChange={setFormData}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <MedicalHistoryForm
          data={formData}
          onChange={setFormData}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <ReviewAndSubmit
          data={formData}
          onSubmit={handleSubmit}
          onBack={() => setStep(3)}
        />
      )}
    </div>
  )
}

// components/forms/BasicInfoForm.tsx

export function BasicInfoForm({ data, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const newErrors: Record<string, string> = {}

    if (!data.firstName) newErrors.firstName = 'First name is required'
    if (!data.lastName) newErrors.lastName = 'Last name is required'
    if (!data.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
    if (!data.gender) newErrors.gender = 'Gender is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleNext() {
    if (validate()) {
      onNext()
    }
  }

  return (
    <form className="intake-form">
      <h2>Basic Information</h2>

      <FormField label="First Name *" error={errors.firstName}>
        <input
          type="text"
          value={data.firstName || ''}
          onChange={(e) => onChange({ ...data, firstName: e.target.value })}
        />
      </FormField>

      <FormField label="Last Name *" error={errors.lastName}>
        <input
          type="text"
          value={data.lastName || ''}
          onChange={(e) => onChange({ ...data, lastName: e.target.value })}
        />
      </FormField>

      <FormField label="Date of Birth *" error={errors.dateOfBirth}>
        <input
          type="date"
          value={data.dateOfBirth?.toISOString().split('T')[0] || ''}
          onChange={(e) => onChange({ ...data, dateOfBirth: new Date(e.target.value) })}
        />
      </FormField>

      <FormField label="Gender *" error={errors.gender}>
        <select
          value={data.gender || ''}
          onChange={(e) => onChange({ ...data, gender: e.target.value })}
        >
          <option value="">Select...</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="non-binary">Non-binary</option>
          <option value="prefer-not-to-say">Prefer not to say</option>
        </select>
      </FormField>

      <button type="button" onClick={handleNext}>Next</button>
    </form>
  )
}

// Similar forms for ContactInfo, MedicalHistory, etc.
```

**Digital Intake (Patient Portal):**
```typescript
// app/intake/[token]/page.tsx

export default function PatientIntakePage({ params }: { params: { token: string } }) {
  // Patient fills out form on their own device
  // Token ensures security and links to pre-created patient record

  return (
    <div className="digital-intake">
      <div className="practice-header">
        <img src="/logo.png" alt="Luxe Medical Spa" />
        <h1>Welcome to Luxe Medical Spa</h1>
        <p>Please complete this form before your appointment</p>
      </div>

      <IntakeFormSteps />

      <div className="hipaa-notice">
        This form is HIPAA compliant and encrypted.
      </div>
    </div>
  )
}
```

**Verification:**
- [ ] 4-step intake form works
- [ ] Validation works on each step
- [ ] Can go back and forward
- [ ] Progress bar shows current step
- [ ] Form data persists if page refreshed (localStorage)
- [ ] Patient created successfully
- [ ] Digital intake link works
- [ ] Mobile-friendly form

**Edge cases:**
- Invalid date of birth (future date)
- Missing required fields
- Network error during submission
- Patient already exists (duplicate check)

**Connects to:**
- Patient profile
- Medical history
- Booking flow

---

Due to length constraints, let me save progress and continue with the remaining features (31-73) in the next message. The roadmap is taking comprehensive shape!