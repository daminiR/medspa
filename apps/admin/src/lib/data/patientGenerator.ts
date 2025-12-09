// Large-scale patient data generator for production testing
// Generates realistic patient data for 10,000+ patients

import { 
  Patient, 
  PatientListItem, 
  Gender, 
  PatientStatus,
  FitzpatrickType 
} from '@/types/patient'

// Name lists for realistic data
const firstNames = {
  male: ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Christopher', 
         'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Kenneth', 'Steven', 'Paul', 'Andrew', 'Joshua'],
  female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen',
           'Nancy', 'Betty', 'Helen', 'Sandra', 'Donna', 'Carol', 'Ruth', 'Sharon', 'Michelle', 'Laura']
}

const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 
                   'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 
                   'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 
                   'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 
                   'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 
                   'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts']

const cities = ['Los Angeles', 'Beverly Hills', 'Santa Monica', 'Malibu', 'Pasadena', 'Glendale', 'Burbank', 
                'West Hollywood', 'Culver City', 'Marina del Rey', 'Manhattan Beach', 'Hermosa Beach', 
                'Redondo Beach', 'Torrance', 'Long Beach', 'Newport Beach', 'Irvine', 'Costa Mesa']

const skinConcerns = ['Acne', 'Aging', 'Dark spots', 'Dryness', 'Fine lines', 'Large pores', 'Melasma', 
                      'Redness', 'Rosacea', 'Scarring', 'Sun damage', 'Uneven texture', 'Wrinkles']

const treatments = ['Botox', 'Dysport', 'Xeomin', 'Juvederm', 'Restylane', 'Sculptra', 'Radiesse', 
                    'Chemical Peel', 'Microneedling', 'IPL', 'Laser Hair Removal', 'CoolSculpting', 
                    'HydraFacial', 'Dermaplaning', 'Microdermabrasion', 'PDO Threads', 'PRP', 'PRF']

// Cache for generated patients (singleton pattern)
let cachedPatients: Patient[] | null = null
let cachedPatientList: PatientListItem[] | null = null

// Helper functions
function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function generatePhone(): string {
  const area = Math.floor(Math.random() * 900) + 100
  const prefix = Math.floor(Math.random() * 900) + 100
  const line = Math.floor(Math.random() * 9000) + 1000
  return `(${area}) ${prefix}-${line}`
}

function generatePatientNumber(index: number): string {
  const year = 2024 - Math.floor(index / 5000) // Different years as practice grows
  return `P-${year}-${(index + 1).toString().padStart(5, '0')}`
}

// Main generator function
export function generatePatient(index: number): Patient {
  const gender = Math.random() > 0.5 ? 'female' : 'male'
  const firstName = randomFromArray(firstNames[gender as keyof typeof firstNames])
  const lastName = randomFromArray(lastNames)
  const birthDate = randomDate(new Date(1940, 0, 1), new Date(2006, 0, 1))
  const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  
  // Registration date between 2015 and now
  const registrationDate = randomDate(new Date(2015, 0, 1), new Date())
  
  // Last visit within past year
  const lastVisit = Math.random() > 0.3 
    ? randomDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), new Date())
    : undefined
  
  // Status based on last visit
  let status: PatientStatus = 'active'
  if (lastVisit) {
    const daysSinceLastVisit = (Date.now() - lastVisit.getTime()) / (24 * 60 * 60 * 1000)
    if (daysSinceLastVisit > 365) status = 'inactive'
  } else if (Math.random() > 0.9) {
    status = 'inactive'
  }
  
  // Generate medical alerts (20% of patients)
  const hasAlerts = Math.random() > 0.8
  const medicalAlerts = hasAlerts ? [{
    id: `alert-${index}`,
    type: randomFromArray(['allergy', 'condition', 'medication', 'contraindication'] as any),
    severity: randomFromArray(['low', 'medium', 'high'] as any),
    description: randomFromArray(['Latex allergy', 'Lidocaine sensitivity', 'Blood thinners', 'Pregnancy', 'Autoimmune condition']),
    addedDate: registrationDate,
    addedBy: 'System',
    active: true
  }] : []
  
  // Financial data
  const hasBalance = Math.random() > 0.7
  const balance = hasBalance ? Math.floor(Math.random() * 3000) : 0
  const lifetimeValue = Math.floor(Math.random() * 50000)
  
  // Skin type distribution (realistic for California demographics)
  const skinType = randomFromArray(['I', 'II', 'III', 'IV', 'V', 'VI'] as FitzpatrickType[])
  
  const patient: Patient = {
    id: `patient-${index}`,
    patientNumber: generatePatientNumber(index),
    
    firstName,
    lastName,
    preferredName: Math.random() > 0.9 ? firstName.substring(0, 3) : undefined,
    pronouns: gender === 'female' ? 'she/her' : gender === 'male' ? 'he/him' : undefined,
    dateOfBirth: birthDate,
    age,
    gender: gender as Gender,
    
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@example.com`,
    phone: generatePhone(),
    alternatePhone: Math.random() > 0.7 ? generatePhone() : undefined,
    address: {
      street: `${Math.floor(Math.random() * 9999) + 1} ${randomFromArray(['Main', 'Oak', 'Pine', 'Maple', 'Cedar', 'Elm', 'Washington', 'Park', 'Lake', 'Hill'])} ${randomFromArray(['St', 'Ave', 'Rd', 'Blvd', 'Dr', 'Ln'])}`,
      city: randomFromArray(cities),
      state: 'CA',
      zipCode: (90000 + Math.floor(Math.random() * 999)).toString()
    },
    
    emergencyContact: {
      name: `${randomFromArray(['John', 'Jane', 'Michael', 'Sarah'])} ${lastName}`,
      relationship: randomFromArray(['Spouse', 'Parent', 'Sibling', 'Friend']),
      phone: generatePhone()
    },
    
    allergies: Math.random() > 0.8 ? [
      randomFromArray(['Latex', 'Lidocaine', 'Penicillin', 'Iodine', 'Aspirin', 'Sulfa drugs'])
    ] : [],
    
    medications: Math.random() > 0.7 ? [
      randomFromArray(['Lisinopril', 'Metformin', 'Levothyroxine', 'Vitamin D', 'Birth control', 'Multivitamin'])
    ] : [],
    medicalAlerts,
    medicalHistory: [],
    
    aestheticProfile: {
      skinType,
      skinConcerns: [randomFromArray(skinConcerns), randomFromArray(skinConcerns)],
      treatmentGoals: ['Anti-aging', 'Skin rejuvenation'],
      previousTreatments: lastVisit ? [{
        id: `treat-${index}`,
        treatment: randomFromArray(treatments),
        date: lastVisit,
        provider: 'Dr. Smith',
        location: 'Our Clinic'
      }] : [],
      contraindications: [],
      photoConsent: Math.random() > 0.2,
      photoConsentDate: registrationDate
    },
    
    treatmentTracking: {
      botoxUnits: {},
      fillerVolumes: {},
      lastTreatmentDates: {},
      totalSpent: lifetimeValue
    },
    
    status,
    registrationDate,
    firstVisit: registrationDate,
    lastVisit,
    totalVisits: Math.floor(Math.random() * 50),
    
    balance,
    credits: Math.random() > 0.8 ? Math.floor(Math.random() * 1000) : 0,
    lifetimeValue,
    
    communicationPreferences: {
      preferredMethod: randomFromArray(['email', 'sms', 'phone'] as any),
      appointmentReminders: true,
      marketingEmails: Math.random() > 0.3,
      smsNotifications: Math.random() > 0.4,
      emailNotifications: true,
      language: 'en'
    },
    
    privacySettings: {
      shareWithFamily: Math.random() > 0.5,
      allowPhotos: Math.random() > 0.3,
      allowResearch: Math.random() > 0.7,
      privacyMode: Math.random() > 0.95 // 5% are VIP
    },
    
    tags: [],
    createdAt: registrationDate,
    updatedAt: lastVisit || registrationDate,
    createdBy: 'system',
    lastModifiedBy: 'system'
  }
  
  // Add tags based on characteristics
  if (lifetimeValue > 20000) patient.tags?.push('VIP')
  if (patient.totalVisits > 20) patient.tags?.push('Frequent')
  if (balance > 1000) patient.tags?.push('High Balance')
  if (hasAlerts) patient.tags?.push('Medical Alert')
  
  return patient
}

// Generate large dataset
export function generateLargePatientDataset(count: number = 10000): Patient[] {
  // Use cache if available
  if (cachedPatients && cachedPatients.length === count) {
    return cachedPatients
  }
  
  const patients: Patient[] = []
  
  for (let i = 0; i < count; i++) {
    patients.push(generatePatient(i))
  }
  
  // Cache the result
  cachedPatients = patients
  return patients
}

// Convert to list items (optimized)
export function generatePatientListItems(patients: Patient[]): PatientListItem[] {
  // Use cache if available
  if (cachedPatientList && cachedPatientList.length === patients.length) {
    return cachedPatientList
  }
  
  const listItems = patients.map(patient => ({
    id: patient.id,
    patientNumber: patient.patientNumber,
    firstName: patient.firstName,
    lastName: patient.lastName,
    preferredName: patient.preferredName,
    email: patient.email,
    phone: patient.phone,
    lastVisit: patient.lastVisit,
    upcomingAppointment: Math.random() > 0.7 
      ? randomDate(new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))
      : undefined,
    balance: patient.balance,
    status: patient.status,
    hasAlerts: patient.medicalAlerts.length > 0,
    photoUrl: undefined
  }))
  
  // Cache the result
  cachedPatientList = listItems
  return listItems
}

// Paginated search function with performance optimization
export function searchPatientsOptimized(
  patients: PatientListItem[], 
  query: string, 
  page: number = 1, 
  pageSize: number = 50
): {
  results: PatientListItem[]
  total: number
  pages: number
} {
  const lowerQuery = query.toLowerCase()
  
  // If no query, return paginated results
  if (!query) {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      results: patients.slice(start, end),
      total: patients.length,
      pages: Math.ceil(patients.length / pageSize)
    }
  }
  
  // Perform search
  const filtered = patients.filter(patient => {
    // Optimize search by checking most likely matches first
    if (patient.lastName.toLowerCase().startsWith(lowerQuery)) return true
    if (patient.firstName.toLowerCase().startsWith(lowerQuery)) return true
    if (patient.patientNumber.toLowerCase().includes(lowerQuery)) return true
    
    // Then check contains
    if (patient.lastName.toLowerCase().includes(lowerQuery)) return true
    if (patient.firstName.toLowerCase().includes(lowerQuery)) return true
    if (patient.email.toLowerCase().includes(lowerQuery)) return true
    if (patient.phone.includes(query)) return true
    if (patient.preferredName && patient.preferredName.toLowerCase().includes(lowerQuery)) return true
    
    return false
  })
  
  // Paginate results
  const start = (page - 1) * pageSize
  const end = start + pageSize
  
  return {
    results: filtered.slice(start, end),
    total: filtered.length,
    pages: Math.ceil(filtered.length / pageSize)
  }
}

// Get patient by ID (optimized with Map for O(1) lookup)
const patientMap = new Map<string, Patient>()

export function getPatientByIdOptimized(id: string, patients?: Patient[]): Patient | undefined {
  // Build map if not exists
  if (patientMap.size === 0 && patients) {
    patients.forEach(p => patientMap.set(p.id, p))
  }
  
  return patientMap.get(id)
}

// Clear cache when needed
export function clearPatientCache() {
  cachedPatients = null
  cachedPatientList = null
  patientMap.clear()
}