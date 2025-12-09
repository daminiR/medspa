// Mock Patient Data for Medical Spa
import { PatientProfile, BeforeAfterPhoto, AestheticProfile } from '@/types/patients'

export const mockPatients: PatientProfile[] = [
  {
    id: 'patient-1',
    firstName: 'Emma',
    lastName: 'Thompson',
    preferredName: 'Emma',
    pronouns: 'she/her',
    dateOfBirth: new Date('1985-03-15'),
    gender: 'female',
    email: 'emma.thompson@email.com',
    phone: '(555) 123-4567',
    alternatePhone: '(555) 987-6543',
    address: {
      street: '123 Wellness Ave',
      city: 'Beverly Hills',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    skinType: 'II',
    allergies: ['Latex', 'Penicillin'],
    medications: ['Vitamin D', 'Biotin'],
    medicalConditions: ['Mild Rosacea'],
    previousTreatments: [
      {
        id: 'treat-1',
        treatment: 'Botox - Forehead',
        date: new Date('2024-06-15'),
        provider: 'Dr. Sarah Chen',
        notes: '20 units, excellent results'
      },
      {
        id: 'treat-2',
        treatment: 'HydraFacial',
        date: new Date('2024-07-20'),
        provider: 'Jessica Mills',
        notes: 'Sensitive skin protocol used'
      }
    ],
    profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    beforeAfterPhotos: [],
    status: 'active',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-08-01'),
    tags: [
      { id: 'tag-1', name: 'VIP', color: 'gold', icon: 'star' },
      { id: 'tag-2', name: 'Sensitive Skin', color: 'pink', icon: 'alert' }
    ],
    relationships: [],
    communicationPreferences: {
      email: true,
      sms: true,
      phone: false,
      marketing: true
    },
    portalEnabled: true,
    lastPortalLogin: new Date('2024-07-28'),
    accountBalance: 0,
    creditBalance: 250,
    packages: [
      {
        id: 'pkg-1',
        packageId: 'botox-pkg',
        name: 'Botox Touch-Up Package',
        purchaseDate: new Date('2024-07-01'),
        expirationDate: new Date('2025-07-01'),
        creditsTotal: 3,
        creditsUsed: 1,
        creditsRemaining: 2,
        status: 'active'
      }
    ],
    memberships: [
      {
        id: 'mem-1',
        membershipId: 'gold-membership',
        name: 'Gold Membership',
        tier: 'gold',
        startDate: new Date('2024-01-01'),
        nextBillingDate: new Date('2024-09-01'),
        status: 'active',
        discountPercentage: 15
      }
    ],
    totalSpent: 8500,
    averageSpend: 850,
    lastVisit: new Date('2024-07-20'),
    nextAppointment: new Date('2024-08-15'),
    visitCount: 10,
    noShowCount: 0,
    cancellationCount: 1
  },
  {
    id: 'patient-2',
    firstName: 'Michael',
    lastName: 'Rodriguez',
    preferredName: 'Mike',
    pronouns: 'he/him',
    dateOfBirth: new Date('1978-09-22'),
    gender: 'male',
    email: 'michael.rodriguez@email.com',
    phone: '(555) 234-5678',
    address: {
      street: '456 Sunset Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90028',
      country: 'USA'
    },
    skinType: 'IV',
    allergies: [],
    medications: ['Finasteride'],
    medicalConditions: ['Acne Scarring'],
    previousTreatments: [
      {
        id: 'treat-3',
        treatment: 'Microneedling',
        date: new Date('2024-05-10'),
        provider: 'Dr. James Park',
        notes: 'Series 2 of 4 completed'
      }
    ],
    profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    beforeAfterPhotos: [],
    status: 'active',
    createdAt: new Date('2023-06-20'),
    updatedAt: new Date('2024-07-15'),
    tags: [],
    relationships: [
      {
        id: 'rel-1',
        patientId: 'patient-3',
        patientName: 'Sofia Rodriguez',
        relationshipType: 'spouse',
        isPrimary: true,
        canBookFor: true,
        canAccessRecords: false
      }
    ],
    communicationPreferences: {
      email: true,
      sms: false,
      phone: true,
      marketing: false
    },
    portalEnabled: true,
    accountBalance: 450,
    creditBalance: 0,
    packages: [],
    memberships: [],
    totalSpent: 3200,
    averageSpend: 800,
    lastVisit: new Date('2024-07-10'),
    nextAppointment: new Date('2024-08-12'),
    visitCount: 4,
    noShowCount: 0,
    cancellationCount: 0
  },
  {
    id: 'patient-3',
    firstName: 'Sofia',
    lastName: 'Rodriguez',
    dateOfBirth: new Date('1980-12-05'),
    gender: 'female',
    email: 'sofia.rodriguez@email.com',
    phone: '(555) 234-5679',
    address: {
      street: '456 Sunset Blvd',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90028',
      country: 'USA'
    },
    skinType: 'III',
    allergies: ['Sulfa'],
    medications: [],
    medicalConditions: [],
    previousTreatments: [
      {
        id: 'treat-4',
        treatment: 'Juvederm Lips',
        date: new Date('2024-06-01'),
        provider: 'Dr. Sarah Chen',
        notes: '1ml, natural enhancement'
      }
    ],
    profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
    beforeAfterPhotos: [],
    status: 'active',
    createdAt: new Date('2023-08-10'),
    updatedAt: new Date('2024-06-01'),
    tags: [
      { id: 'tag-3', name: 'Birthday Month', color: 'purple', icon: 'cake' }
    ],
    relationships: [
      {
        id: 'rel-2',
        patientId: 'patient-2',
        patientName: 'Michael Rodriguez',
        relationshipType: 'spouse',
        isPrimary: false,
        canBookFor: true,
        canAccessRecords: false
      }
    ],
    communicationPreferences: {
      email: true,
      sms: true,
      phone: false,
      marketing: true
    },
    portalEnabled: false,
    accountBalance: 0,
    creditBalance: 0,
    packages: [],
    memberships: [
      {
        id: 'mem-2',
        membershipId: 'silver-membership',
        name: 'Silver Membership',
        tier: 'silver',
        startDate: new Date('2024-03-01'),
        nextBillingDate: new Date('2024-09-01'),
        status: 'active',
        discountPercentage: 10
      }
    ],
    totalSpent: 4800,
    averageSpend: 600,
    lastVisit: new Date('2024-06-01'),
    visitCount: 8,
    noShowCount: 1,
    cancellationCount: 2
  },
  {
    id: 'patient-4',
    firstName: 'Jennifer',
    lastName: 'Chang',
    dateOfBirth: new Date('1992-07-18'),
    gender: 'female',
    email: 'jennifer.chang@email.com',
    phone: '(555) 345-6789',
    address: {
      street: '789 Palm Drive',
      city: 'Santa Monica',
      state: 'CA',
      zipCode: '90401',
      country: 'USA'
    },
    skinType: 'III',
    allergies: [],
    medications: ['Birth Control'],
    medicalConditions: ['Melasma'],
    previousTreatments: [
      {
        id: 'treat-5',
        treatment: 'IPL Photofacial',
        date: new Date('2024-07-05'),
        provider: 'Dr. James Park',
        notes: 'Melasma protocol, good response'
      },
      {
        id: 'treat-6',
        treatment: 'Chemical Peel',
        date: new Date('2024-06-15'),
        provider: 'Jessica Mills',
        notes: 'VI Peel, no complications'
      }
    ],
    profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
    beforeAfterPhotos: [],
    status: 'active',
    createdAt: new Date('2023-11-01'),
    updatedAt: new Date('2024-07-05'),
    tags: [
      { id: 'tag-4', name: 'Pregnant', color: 'red', icon: 'alert' }
    ],
    relationships: [],
    communicationPreferences: {
      email: true,
      sms: true,
      phone: true,
      marketing: true
    },
    portalEnabled: true,
    lastPortalLogin: new Date('2024-07-30'),
    accountBalance: 0,
    creditBalance: 500,
    packages: [
      {
        id: 'pkg-2',
        packageId: 'laser-pkg',
        name: 'Laser Package - 6 Sessions',
        purchaseDate: new Date('2024-05-01'),
        expirationDate: new Date('2025-05-01'),
        creditsTotal: 6,
        creditsUsed: 2,
        creditsRemaining: 4,
        status: 'active'
      }
    ],
    memberships: [],
    totalSpent: 6200,
    averageSpend: 775,
    lastVisit: new Date('2024-07-05'),
    nextAppointment: new Date('2024-08-20'),
    visitCount: 8,
    noShowCount: 0,
    cancellationCount: 0
  },
  {
    id: 'patient-5',
    firstName: 'Robert',
    lastName: 'Johnson',
    preferredName: 'Bob',
    dateOfBirth: new Date('1965-11-30'),
    gender: 'male',
    email: 'robert.johnson@email.com',
    phone: '(555) 456-7890',
    address: {
      street: '321 Executive Plaza',
      city: 'Malibu',
      state: 'CA',
      zipCode: '90265',
      country: 'USA'
    },
    skinType: 'I',
    allergies: ['Aspirin'],
    medications: ['Blood Pressure Medication'],
    medicalConditions: ['Hypertension'],
    previousTreatments: [
      {
        id: 'treat-7',
        treatment: 'Botox - Full Face',
        date: new Date('2024-07-25'),
        provider: 'Dr. Sarah Chen',
        notes: '50 units total'
      }
    ],
    profilePhoto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    beforeAfterPhotos: [],
    status: 'active',
    createdAt: new Date('2022-09-15'),
    updatedAt: new Date('2024-07-25'),
    tags: [
      { id: 'tag-1', name: 'VIP', color: 'gold', icon: 'star' },
      { id: 'tag-5', name: 'Executive Package', color: 'blue', icon: 'briefcase' }
    ],
    relationships: [],
    communicationPreferences: {
      email: true,
      sms: false,
      phone: true,
      marketing: false
    },
    portalEnabled: false,
    accountBalance: 0,
    creditBalance: 1000,
    packages: [],
    memberships: [
      {
        id: 'mem-3',
        membershipId: 'platinum-membership',
        name: 'Platinum Membership',
        tier: 'platinum',
        startDate: new Date('2023-01-01'),
        nextBillingDate: new Date('2025-01-01'),
        status: 'active',
        discountPercentage: 20
      }
    ],
    totalSpent: 25000,
    averageSpend: 2500,
    lastVisit: new Date('2024-07-25'),
    nextAppointment: new Date('2024-08-25'),
    visitCount: 10,
    noShowCount: 0,
    cancellationCount: 0
  }
]

// Helper function to filter patients
export function searchPatients(query: string): PatientProfile[] {
  const searchTerm = query.toLowerCase()
  return mockPatients.filter(patient => 
    patient.firstName.toLowerCase().includes(searchTerm) ||
    patient.lastName.toLowerCase().includes(searchTerm) ||
    patient.email.toLowerCase().includes(searchTerm) ||
    patient.phone.includes(query)
  )
}

// Helper function to get patient by ID
export function getPatientById(id: string): PatientProfile | undefined {
  return mockPatients.find(patient => patient.id === id)
}

// Helper function to get patients with birthdays this month
export function getPatientsWithBirthdaysThisMonth(): PatientProfile[] {
  const currentMonth = new Date().getMonth()
  return mockPatients.filter(patient => 
    patient.dateOfBirth.getMonth() === currentMonth
  )
}

// Helper function to get VIP patients
export function getVIPPatients(): PatientProfile[] {
  return mockPatients.filter(patient => 
    patient.tags.some(tag => tag.name === 'VIP')
  )
}

// Helper function to get patients with balance
export function getPatientsWithBalance(): PatientProfile[] {
  return mockPatients.filter(patient => patient.accountBalance > 0)
}