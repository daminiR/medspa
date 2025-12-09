// Comprehensive Patient Management Types
// Medical Spa Platform - Patient Entity Definitions

// ============= Core Types =============

export type PatientStatus = 'active' | 'inactive' | 'deceased'
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'
export type FitzpatrickType = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI'
export type RelationshipType = 'spouse' | 'parent' | 'child' | 'sibling' | 'guardian' | 'other'
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
export type AlertType = 'allergy' | 'condition' | 'medication' | 'contraindication' | 'other'

// ============= Sub-Entities =============

export interface Address {
  street: string
  street2?: string
  city: string
  state: string
  zipCode: string
  country?: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  alternatePhone?: string
}

export interface Allergy {
  id: string
  allergen: string
  reaction: string
  severity: AlertSeverity
  onsetDate?: Date
  notes?: string
}

export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: Date
  endDate?: Date
  prescribedBy?: string
  notes?: string
}

export interface MedicalAlert {
  id: string
  type: AlertType
  severity: AlertSeverity
  description: string
  addedDate: Date
  addedBy: string
  active: boolean
}

export interface MedicalHistory {
  id: string
  condition: string
  diagnosedDate?: Date
  status: 'active' | 'resolved' | 'managed'
  notes?: string
}

export interface InsurancePolicy {
  id: string
  provider: string
  policyNumber: string
  groupNumber?: string
  subscriberName: string
  subscriberRelation: string
  effectiveDate: Date
  expirationDate?: Date
  copay?: number
  deductible?: number
}

export interface FamilyRelationship {
  patientId: string
  patientName?: string // Denormalized for display
  relationship: RelationshipType
  isPrimaryContact: boolean
  hasFinancialAccess: boolean
  hasMedicalAccess: boolean
  notes?: string
}

export interface CommunicationPreferences {
  preferredMethod: 'email' | 'sms' | 'phone' | 'none'
  appointmentReminders: boolean
  marketingEmails: boolean
  smsNotifications: boolean
  emailNotifications: boolean
  language: string
}

export interface AppointmentPreferences {
  preferredDays?: string[]
  preferredTimes?: string[]
  preferredProvider?: string
  notes?: string
}

export interface PrivacySettings {
  shareWithFamily: boolean
  allowPhotos: boolean
  allowResearch: boolean
  restrictedProviders?: string[]
  privacyMode: boolean // VIP/sensitive patient
}

export interface PatientSource {
  type: 'referral' | 'online' | 'walkin' | 'advertising' | 'other'
  details?: string
  referredById?: string
  referredByName?: string
}

// ============= Medical Spa Specific =============

export interface AestheticProfile {
  skinType: FitzpatrickType
  skinConcerns: string[]
  treatmentGoals: string[]
  previousTreatments: PreviousTreatment[]
  contraindications: string[]
  photoConsent: boolean
  photoConsentDate?: Date
}

export interface PreviousTreatment {
  id: string
  treatment: string
  date: Date
  provider: string
  location?: string
  results?: string
  complications?: string
}

export interface TreatmentTracking {
  botoxUnits: Record<string, number> // Area -> units
  fillerVolumes: Record<string, number> // Area -> ml
  lastTreatmentDates: Record<string, Date>
  nextRecommended?: Date
  totalSpent?: number
  favoriteProducts?: string[]
}

export interface ProductReaction {
  id: string
  productName: string
  reaction: string
  severity: 'mild' | 'moderate' | 'severe'
  date: Date
  treatedBy?: string
  resolved: boolean
  notes?: string
}

export interface PatientPhoto {
  id: string
  url: string
  type: 'before' | 'after' | 'progress'
  treatmentId?: string
  angle: string
  date: Date
  notes?: string
  uploadedBy: string
}

// ============= Main Patient Entity =============

export interface Patient {
  // Identity
  id: string
  patientNumber: string // Auto-generated unique identifier (e.g., "P-2024-0001")
  
  // Demographics
  firstName: string
  lastName: string
  middleName?: string
  preferredName?: string
  pronouns?: string
  dateOfBirth: Date
  age?: number // Calculated field
  gender: Gender
  
  // Contact Information
  email: string
  phone: string
  alternatePhone?: string
  workPhone?: string
  address: Address
  timezone?: string
  
  // Emergency Contact
  emergencyContact: EmergencyContact
  
  // Medical Information
  allergies: Allergy[]
  medications: Medication[]
  medicalAlerts: MedicalAlert[]
  medicalHistory: MedicalHistory[]
  bloodType?: string
  
  // Medical Spa Specific
  aestheticProfile?: AestheticProfile
  treatmentTracking?: TreatmentTracking
  productReactions?: ProductReaction[]
  photos?: PatientPhoto[]
  
  // Administrative
  status: PatientStatus
  registrationDate: Date
  firstVisit?: Date
  lastVisit?: Date
  totalVisits: number
  source?: PatientSource
  referredBy?: string
  
  // Relationships
  familyMembers?: FamilyRelationship[]
  primaryProviderId?: string
  primaryProviderName?: string // Denormalized
  
  // Financial
  balance: number
  credits: number
  lifetimeValue: number
  insurance?: InsurancePolicy[]
  paymentMethods?: PaymentMethod[]
  
  // Preferences
  communicationPreferences: CommunicationPreferences
  appointmentPreferences?: AppointmentPreferences
  privacySettings: PrivacySettings
  
  // Notes & Documentation
  generalNotes?: string
  internalNotes?: string // Staff-only notes
  importantNotes?: string // Shows as alert
  
  // Metadata
  tags?: string[]
  customFields?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastModifiedBy: string
}

// ============= Form/Input Types =============

export interface PatientFormData {
  // Required fields
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string // Form uses string, convert to Date
  gender: Gender
  
  // Optional fields
  middleName?: string
  preferredName?: string
  pronouns?: string
  alternatePhone?: string
  workPhone?: string
  
  // Address
  address?: {
    street: string
    street2?: string
    city: string
    state: string
    zipCode: string
    country?: string
  }
  
  // Emergency Contact
  emergencyContact?: {
    name: string
    relationship: string
    phone: string
    alternatePhone?: string
  }
  
  // Medical
  allergies?: string // Comma-separated for initial entry
  medications?: string // Comma-separated for initial entry
  medicalConditions?: string // Comma-separated for initial entry
  
  // Preferences
  appointmentReminders?: boolean
  marketingEmails?: boolean
  smsNotifications?: boolean
  
  // Source
  howDidYouHear?: string
  referredBy?: string
}

// ============= Search & Filter Types =============

export interface PatientSearchParams {
  query?: string // Search across name, email, phone, patient number
  status?: PatientStatus
  provider?: string
  lastVisitFrom?: Date
  lastVisitTo?: Date
  tags?: string[]
  hasBalance?: boolean
  hasUpcomingAppointment?: boolean
}

export interface PatientListItem {
  id: string
  patientNumber: string
  firstName: string
  lastName: string
  preferredName?: string
  email: string
  phone: string
  lastVisit?: Date
  upcomingAppointment?: Date
  balance: number
  status: PatientStatus
  hasAlerts: boolean
  photoUrl?: string
}

// ============= Payment Method =============

export interface PaymentMethod {
  id: string
  type: 'card' | 'cash' | 'check' | 'insurance' | 'other'
  isDefault: boolean
  
  // For cards
  cardBrand?: string
  cardLast4?: string
  expiryMonth?: number
  expiryYear?: number
  
  // Metadata
  addedDate: Date
  notes?: string
}

// ============= Response Types =============

export interface PatientResponse {
  patient: Patient
  success: boolean
  message?: string
}

export interface PatientListResponse {
  patients: PatientListItem[]
  total: number
  page: number
  pageSize: number
}

// ============= Utility Types =============

export type PatientCreateInput = Omit<Patient, 
  'id' | 'patientNumber' | 'age' | 'totalVisits' | 'lifetimeValue' | 
  'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'>

export type PatientUpdateInput = Partial<PatientCreateInput>

// ============= Constants =============

export const FITZPATRICK_TYPES = {
  'I': 'Always burns, never tans',
  'II': 'Usually burns, tans minimally',
  'III': 'Sometimes mild burn, tans uniformly',
  'IV': 'Burns minimally, always tans well',
  'V': 'Very rarely burns, tans very darkly',
  'VI': 'Never burns, deeply pigmented'
}

export const SKIN_CONCERNS = [
  'Acne',
  'Aging',
  'Dark spots',
  'Dryness',
  'Fine lines',
  'Large pores',
  'Melasma',
  'Redness',
  'Rosacea',
  'Scarring',
  'Sun damage',
  'Uneven texture',
  'Wrinkles'
]

export const TREATMENT_GOALS = [
  'Anti-aging',
  'Acne treatment',
  'Body contouring',
  'Hair removal',
  'Skin rejuvenation',
  'Skin tightening',
  'Pigmentation correction',
  'Preventative care',
  'Scar reduction',
  'Vein treatment'
]