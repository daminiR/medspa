// Mock Patient Data for Medical Spa Platform
// This integrates with existing appointment and billing systems

import { 
  Patient, 
  PatientListItem, 
  Gender, 
  PatientStatus,
  FitzpatrickType 
} from '@/types/patient'

// Generate mock patients that align with existing appointment data
export const mockPatients: Patient[] = [
  {
    // Identity
    id: 'patient-1',
    patientNumber: 'P-2024-0001',
    
    // Demographics
    firstName: 'Sarah',
    lastName: 'Johnson',
    preferredName: 'Sarah',
    pronouns: 'she/her',
    dateOfBirth: new Date('1985-03-15'),
    age: 39,
    gender: 'female' as Gender,
    
    // Contact
    email: 'sarah.johnson@example.com',
    phone: '(555) 123-4567',
    alternatePhone: '(555) 123-4568',
    address: {
      street: '123 Oak Street',
      city: 'Beverly Hills',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    timezone: 'America/Los_Angeles',
    
    // Emergency Contact
    emergencyContact: {
      name: 'Michael Johnson',
      relationship: 'Spouse',
      phone: '(555) 987-6543'
    },
    
    // Medical Information
    allergies: [
      {
        id: 'allergy-1',
        allergen: 'Latex',
        reaction: 'Skin rash',
        severity: 'medium',
        notes: 'Use latex-free gloves'
      }
    ],
    medications: [
      {
        id: 'med-1',
        name: 'Retin-A',
        dosage: '0.025%',
        frequency: 'Nightly',
        startDate: new Date('2023-06-01'),
        prescribedBy: 'Dr. Smith'
      }
    ],
    medicalAlerts: [
      {
        id: 'alert-1',
        type: 'allergy',
        severity: 'medium',
        description: 'Latex allergy - use latex-free products',
        addedDate: new Date('2023-01-15'),
        addedBy: 'Admin Staff',
        active: true
      }
    ],
    medicalHistory: [
      {
        id: 'history-1',
        condition: 'Rosacea',
        diagnosedDate: new Date('2020-03-01'),
        status: 'managed',
        notes: 'Responds well to IPL treatments'
      }
    ],
    
    // Medical Spa Specific
    aestheticProfile: {
      skinType: 'II' as FitzpatrickType,
      skinConcerns: ['Fine lines', 'Redness', 'Sun damage'],
      treatmentGoals: ['Anti-aging', 'Skin rejuvenation'],
      previousTreatments: [
        {
          id: 'prev-1',
          treatment: 'Botox - Forehead',
          date: new Date('2023-12-01'),
          provider: 'Dr. Chen',
          location: 'Our Clinic',
          results: 'Excellent'
        }
      ],
      contraindications: [],
      photoConsent: true,
      photoConsentDate: new Date('2023-01-15')
    },
    treatmentTracking: {
      botoxUnits: {
        'forehead': 20,
        'glabella': 25,
        'crows_feet': 24
      },
      fillerVolumes: {
        'nasolabial_folds': 2,
        'lips': 1
      },
      lastTreatmentDates: {
        'botox': new Date('2024-01-15'),
        'filler': new Date('2023-11-20')
      },
      nextRecommended: new Date('2024-04-15'),
      totalSpent: 12500,
      favoriteProducts: ['Botox', 'Juvederm']
    },
    
    // Administrative
    status: 'active' as PatientStatus,
    registrationDate: new Date('2023-01-15'),
    firstVisit: new Date('2023-01-20'),
    lastVisit: new Date('2024-01-15'),
    totalVisits: 12,
    source: {
      type: 'referral',
      referredById: 'patient-5',
      referredByName: 'Emma Davis'
    },
    
    // Relationships
    familyMembers: [
      {
        patientId: 'patient-8',
        patientName: 'Michael Johnson',
        relationship: 'spouse',
        isPrimaryContact: true,
        hasFinancialAccess: true,
        hasMedicalAccess: false
      }
    ],
    primaryProviderId: '2',
    primaryProviderName: 'Dr. Michael Chen',
    
    // Financial
    balance: 0,
    credits: 250,
    lifetimeValue: 12500,
    
    // Preferences
    communicationPreferences: {
      preferredMethod: 'email',
      appointmentReminders: true,
      marketingEmails: true,
      smsNotifications: true,
      emailNotifications: true,
      language: 'en'
    },
    appointmentPreferences: {
      preferredDays: ['Tuesday', 'Thursday'],
      preferredTimes: ['morning'],
      preferredProvider: '2',
      notes: 'Prefers early morning appointments before work'
    },
    privacySettings: {
      shareWithFamily: true,
      allowPhotos: true,
      allowResearch: false,
      privacyMode: false
    },
    
    // Notes
    generalNotes: 'VIP client - always offer complimentary skin analysis',
    internalNotes: 'Refers many new clients',
    importantNotes: 'Latex allergy - use latex-free gloves',
    
    // Metadata
    tags: ['VIP', 'Frequent', 'Referrer'],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'admin',
    lastModifiedBy: 'reception'
  },
  {
    id: 'patient-2',
    patientNumber: 'P-2024-0002',
    firstName: 'Michael',
    lastName: 'Thompson',
    dateOfBirth: new Date('1978-07-22'),
    age: 46,
    gender: 'male' as Gender,
    email: 'michael.thompson@example.com',
    phone: '(555) 234-5678',
    address: {
      street: '456 Pine Avenue',
      city: 'Santa Monica',
      state: 'CA',
      zipCode: '90401'
    },
    emergencyContact: {
      name: 'Lisa Thompson',
      relationship: 'Wife',
      phone: '(555) 234-5679'
    },
    allergies: [],
    medications: [],
    medicalAlerts: [],
    medicalHistory: [],
    aestheticProfile: {
      skinType: 'III' as FitzpatrickType,
      skinConcerns: ['Aging', 'Sun damage'],
      treatmentGoals: ['Anti-aging', 'Preventative care'],
      previousTreatments: [],
      contraindications: [],
      photoConsent: true
    },
    status: 'active' as PatientStatus,
    registrationDate: new Date('2023-03-10'),
    firstVisit: new Date('2023-03-15'),
    lastVisit: new Date('2024-02-01'),
    totalVisits: 8,
    balance: 450,
    credits: 0,
    lifetimeValue: 6800,
    communicationPreferences: {
      preferredMethod: 'sms',
      appointmentReminders: true,
      marketingEmails: false,
      smsNotifications: true,
      emailNotifications: false,
      language: 'en'
    },
    privacySettings: {
      shareWithFamily: false,
      allowPhotos: true,
      allowResearch: false,
      privacyMode: false
    },
    tags: ['Regular'],
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2024-02-01'),
    createdBy: 'admin',
    lastModifiedBy: 'admin'
  },
  {
    id: 'patient-3',
    patientNumber: 'P-2024-0003',
    firstName: 'Emma',
    lastName: 'Davis',
    preferredName: 'Em',
    pronouns: 'she/her',
    dateOfBirth: new Date('1992-11-08'),
    age: 31,
    gender: 'female' as Gender,
    email: 'emma.davis@example.com',
    phone: '(555) 345-6789',
    address: {
      street: '789 Maple Drive',
      city: 'Malibu',
      state: 'CA',
      zipCode: '90265'
    },
    emergencyContact: {
      name: 'Jennifer Davis',
      relationship: 'Mother',
      phone: '(555) 345-6790'
    },
    allergies: [
      {
        id: 'allergy-2',
        allergen: 'Lidocaine',
        reaction: 'Nausea',
        severity: 'high',
        notes: 'Use alternative numbing agent'
      }
    ],
    medications: [],
    medicalAlerts: [
      {
        id: 'alert-2',
        type: 'allergy',
        severity: 'high',
        description: 'Lidocaine allergy - DO NOT USE',
        addedDate: new Date('2023-05-01'),
        addedBy: 'Dr. Chen',
        active: true
      }
    ],
    medicalHistory: [],
    aestheticProfile: {
      skinType: 'I' as FitzpatrickType,
      skinConcerns: ['Acne', 'Scarring', 'Large pores'],
      treatmentGoals: ['Acne treatment', 'Scar reduction'],
      previousTreatments: [
        {
          id: 'prev-2',
          treatment: 'Chemical Peel',
          date: new Date('2023-10-15'),
          provider: 'Sarah Williams',
          location: 'Our Clinic',
          results: 'Good improvement'
        }
      ],
      contraindications: ['Retinoids'],
      photoConsent: true
    },
    status: 'active' as PatientStatus,
    registrationDate: new Date('2023-05-01'),
    firstVisit: new Date('2023-05-05'),
    lastVisit: new Date('2024-01-20'),
    totalVisits: 15,
    balance: 0,
    credits: 500,
    lifetimeValue: 8900,
    communicationPreferences: {
      preferredMethod: 'email',
      appointmentReminders: true,
      marketingEmails: true,
      smsNotifications: true,
      emailNotifications: true,
      language: 'en'
    },
    privacySettings: {
      shareWithFamily: false,
      allowPhotos: true,
      allowResearch: true,
      privacyMode: false
    },
    tags: ['Frequent', 'Package Member'],
    createdAt: new Date('2023-05-01'),
    updatedAt: new Date('2024-01-20'),
    createdBy: 'admin',
    lastModifiedBy: 'admin'
  },
  {
    id: 'patient-4',
    patientNumber: 'P-2024-0004',
    firstName: 'David',
    lastName: 'Wilson',
    dateOfBirth: new Date('1965-02-28'),
    age: 59,
    gender: 'male' as Gender,
    email: 'david.wilson@example.com',
    phone: '(555) 456-7890',
    address: {
      street: '321 Elm Street',
      city: 'Bel Air',
      state: 'CA',
      zipCode: '90077'
    },
    emergencyContact: {
      name: 'Patricia Wilson',
      relationship: 'Wife',
      phone: '(555) 456-7891'
    },
    allergies: [],
    medications: [
      {
        id: 'med-2',
        name: 'Aspirin',
        dosage: '81mg',
        frequency: 'Daily',
        startDate: new Date('2020-01-01'),
        prescribedBy: 'Dr. Johnson'
      }
    ],
    medicalAlerts: [],
    medicalHistory: [
      {
        id: 'history-2',
        condition: 'Hypertension',
        diagnosedDate: new Date('2019-06-01'),
        status: 'managed',
        notes: 'Well controlled with medication'
      }
    ],
    status: 'active' as PatientStatus,
    registrationDate: new Date('2023-02-20'),
    firstVisit: new Date('2023-02-25'),
    lastVisit: new Date('2023-12-15'),
    totalVisits: 6,
    balance: 1200,
    credits: 0,
    lifetimeValue: 15600,
    communicationPreferences: {
      preferredMethod: 'phone',
      appointmentReminders: true,
      marketingEmails: false,
      smsNotifications: false,
      emailNotifications: true,
      language: 'en'
    },
    privacySettings: {
      shareWithFamily: true,
      allowPhotos: false,
      allowResearch: false,
      privacyMode: true // VIP privacy
    },
    tags: ['VIP', 'Privacy'],
    createdAt: new Date('2023-02-20'),
    updatedAt: new Date('2023-12-15'),
    createdBy: 'admin',
    lastModifiedBy: 'admin'
  },
  {
    id: 'patient-5',
    patientNumber: 'P-2024-0005',
    firstName: 'Sophia',
    lastName: 'Martinez',
    pronouns: 'she/her',
    dateOfBirth: new Date('1988-09-12'),
    age: 36,
    gender: 'female' as Gender,
    email: 'sophia.martinez@example.com',
    phone: '(555) 567-8901',
    address: {
      street: '654 Cedar Lane',
      city: 'West Hollywood',
      state: 'CA',
      zipCode: '90069'
    },
    emergencyContact: {
      name: 'Carlos Martinez',
      relationship: 'Brother',
      phone: '(555) 567-8902'
    },
    allergies: [],
    medications: [],
    medicalAlerts: [],
    medicalHistory: [],
    aestheticProfile: {
      skinType: 'IV' as FitzpatrickType,
      skinConcerns: ['Melasma', 'Dark spots', 'Uneven texture'],
      treatmentGoals: ['Pigmentation correction', 'Skin rejuvenation'],
      previousTreatments: [],
      contraindications: [],
      photoConsent: true
    },
    status: 'active' as PatientStatus,
    registrationDate: new Date('2023-06-15'),
    firstVisit: new Date('2023-06-20'),
    lastVisit: new Date('2024-02-10'),
    totalVisits: 10,
    balance: 0,
    credits: 0,
    lifetimeValue: 7200,
    communicationPreferences: {
      preferredMethod: 'email',
      appointmentReminders: true,
      marketingEmails: true,
      smsNotifications: true,
      emailNotifications: true,
      language: 'es'
    },
    privacySettings: {
      shareWithFamily: false,
      allowPhotos: true,
      allowResearch: false,
      privacyMode: false
    },
    tags: ['Spanish Speaking'],
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2024-02-10'),
    createdBy: 'admin',
    lastModifiedBy: 'admin'
  }
]

// Convert full Patient to PatientListItem for list views
export const mockPatientListItems: PatientListItem[] = mockPatients.map(patient => ({
  id: patient.id,
  patientNumber: patient.patientNumber,
  firstName: patient.firstName,
  lastName: patient.lastName,
  preferredName: patient.preferredName,
  email: patient.email,
  phone: patient.phone,
  lastVisit: patient.lastVisit,
  upcomingAppointment: undefined, // Will be populated from appointment data
  balance: patient.balance,
  status: patient.status,
  hasAlerts: patient.medicalAlerts.length > 0,
  photoUrl: undefined // Will be populated if photos exist
}))

// Helper function to search patients
export function searchPatients(query: string): PatientListItem[] {
  const lowerQuery = query.toLowerCase()
  
  return mockPatientListItems.filter(patient => {
    return (
      patient.firstName.toLowerCase().includes(lowerQuery) ||
      patient.lastName.toLowerCase().includes(lowerQuery) ||
      patient.email.toLowerCase().includes(lowerQuery) ||
      patient.phone.includes(query) ||
      patient.patientNumber.toLowerCase().includes(lowerQuery) ||
      (patient.preferredName && patient.preferredName.toLowerCase().includes(lowerQuery))
    )
  })
}

// Helper function to get patient by ID
export function getPatientById(id: string): Patient | undefined {
  return mockPatients.find(p => p.id === id)
}

// Helper function to get patients with alerts
export function getPatientsWithAlerts(): PatientListItem[] {
  return mockPatientListItems.filter(p => p.hasAlerts)
}

// Helper function to get VIP patients
export function getVIPPatients(): PatientListItem[] {
  return mockPatients
    .filter(p => p.tags?.includes('VIP'))
    .map(patient => mockPatientListItems.find(item => item.id === patient.id)!)
}

// Generate patient number for new patients
export function generatePatientNumber(): string {
  const year = new Date().getFullYear()
  const lastNumber = mockPatients.length + 1
  return `P-${year}-${lastNumber.toString().padStart(4, '0')}`
}