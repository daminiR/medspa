// Patient Management Types - Based on Jane App with Medical Spa Enhancements

export interface PatientProfile {
  // Basic Information
  id: string
  firstName: string
  lastName: string
  preferredName?: string
  pronouns?: string
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
  skinType: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' // Fitzpatrick scale
  allergies: string[]
  medications: string[]
  medicalConditions: string[]
  
  // Aesthetic History
  previousTreatments: {
    id: string
    treatment: string
    date: Date
    provider: string
    notes: string
  }[]
  
  // Photos
  profilePhoto?: string
  beforeAfterPhotos: BeforeAfterPhoto[]
  
  // Administrative
  status: 'active' | 'inactive' | 'deceased' | 'discharged'
  createdAt: Date
  updatedAt: Date
  tags: PatientTag[]
  
  // Relationships
  relationships: PatientRelationship[]
  
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
  
  // Insurance (Optional)
  insurance?: {
    provider: string
    policyNumber: string
    groupNumber: string
  }
  
  // Financial
  accountBalance: number
  creditBalance: number
  packages: PatientPackage[]
  memberships: PatientMembership[]
  
  // Stats
  totalSpent: number
  averageSpend: number
  lastVisit?: Date
  nextAppointment?: Date
  visitCount: number
  noShowCount: number
  cancellationCount: number
}

export interface BeforeAfterPhoto {
  id: string
  date: Date
  type: 'before' | 'after' | 'progress'
  treatmentId?: string
  treatmentName?: string
  url: string
  thumbnailUrl?: string
  consent: boolean
  notes?: string
  area: string // face, body, specific area
  angle: string // front, side, oblique
}

export interface PatientRelationship {
  id: string
  patientId: string
  patientName: string
  relationshipType: 'spouse' | 'parent' | 'child' | 'partner' | 'guardian' | 'other'
  isPrimary: boolean // For billing purposes
  canBookFor: boolean
  canAccessRecords: boolean
}

export interface PatientTag {
  id: string
  name: string
  color: string
  icon?: string
}

export interface PatientPackage {
  id: string
  packageId: string
  name: string
  purchaseDate: Date
  expirationDate?: Date
  creditsTotal: number
  creditsUsed: number
  creditsRemaining: number
  status: 'active' | 'expired' | 'depleted'
}

export interface PatientMembership {
  id: string
  membershipId: string
  name: string
  tier: 'silver' | 'gold' | 'platinum' | 'vip'
  startDate: Date
  nextBillingDate: Date
  status: 'active' | 'paused' | 'cancelled'
  discountPercentage: number
}

// Aesthetic Profile for Medical Spa
export interface AestheticProfile {
  patientId: string
  
  // Skin Analysis
  skinAnalysis: {
    date: Date
    fitzpatrickType: number
    concerns: string[]
    goals: string[]
    analysisImages?: string[]
    hydrationLevel?: 'low' | 'normal' | 'high'
    oilLevel?: 'dry' | 'normal' | 'oily' | 'combination'
    sensitivity?: 'low' | 'medium' | 'high'
  }
  
  // Treatment Preferences
  preferences: {
    painTolerance: 'low' | 'medium' | 'high'
    downtimeAcceptable: boolean
    budgetRange?: {
      min: number
      max: number
    }
    areasOfConcern: string[]
    treatmentGoals: string[]
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
    isotretinoin: boolean // Accutane
    recentProcedures: {
      procedure: string
      date: Date
    }[]
  }
  
  // Product Reactions
  productReactions: {
    product: string
    reaction: string
    severity: 'mild' | 'moderate' | 'severe'
    date: Date
  }[]
  
  // Home Care Routine
  homeCareRoutine: {
    morningProducts: string[]
    eveningProducts: string[]
    weeklyTreatments: string[]
    sunscreen: string
    notes?: string
  }
}

// Search and Filter Types
export interface PatientSearchParams {
  query?: string
  status?: PatientProfile['status']
  tags?: string[]
  ageRange?: {
    min: number
    max: number
  }
  lastVisitRange?: {
    start: Date
    end: Date
  }
  hasBalance?: boolean
  hasPackage?: boolean
  hasMembership?: boolean
  birthdayMonth?: number
  sortBy?: 'name' | 'lastVisit' | 'createdAt' | 'balance'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Communication Types
export interface PatientCommunication {
  id: string
  patientId: string
  type: 'email' | 'sms' | 'phone' | 'portal'
  direction: 'inbound' | 'outbound'
  subject?: string
  content: string
  sentAt: Date
  sentBy: string
  status: 'sent' | 'delivered' | 'failed' | 'read'
  appointmentId?: string
}

// Medical History Types
export interface MedicalHistory {
  id: string
  patientId: string
  date: Date
  type: 'allergy' | 'medication' | 'condition' | 'surgery' | 'treatment'
  description: string
  severity?: 'mild' | 'moderate' | 'severe'
  status: 'active' | 'resolved' | 'inactive'
  notes?: string
  reportedBy: string
  verifiedBy?: string
}

// Consent Types
export interface PatientConsent {
  id: string
  patientId: string
  type: 'treatment' | 'photography' | 'marketing' | 'privacy'
  consentDate: Date
  expirationDate?: Date
  status: 'active' | 'expired' | 'revoked'
  signatureUrl?: string
  documentUrl?: string
  consentedBy: 'patient' | 'guardian'
  guardianName?: string
}

// Quick Stats for Dashboard
export interface PatientStats {
  totalPatients: number
  newPatientsThisMonth: number
  activePatients: number
  vipPatients: number
  averageLifetimeValue: number
  retentionRate: number
  birthdaysThisMonth: number
  outstandingBalances: number
}