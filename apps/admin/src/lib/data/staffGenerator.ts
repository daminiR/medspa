import { 
  StaffMember, 
  StaffListItem, 
  StaffRole, 
  AccessLevel, 
  StaffStatus,
  Specialization,
  License,
  Certification,
  Schedule,
  TimeOff,
  Commission,
  PerformanceMetrics
} from '@/types/staff';

const firstNames = [
  'Emma', 'Olivia', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn', 'Abigail',
  'Emily', 'Madison', 'Victoria', 'Grace', 'Chloe', 'Zoey', 'Lily', 'Hannah', 'Natalie', 'Aria',
  'James', 'Michael', 'Robert', 'David', 'William', 'Joseph', 'Charles', 'Thomas', 'Christopher', 'Daniel',
  'Matthew', 'Anthony', 'Mark', 'Paul', 'Steven', 'Andrew', 'Kenneth', 'Joshua', 'Kevin', 'Brian'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee',
  'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Hall', 'Allen', 'Young'
];

const pronouns = ['she/her', 'he/him', 'they/them'];

const languages = ['English', 'Spanish', 'French', 'Mandarin', 'Portuguese', 'Russian', 'Korean', 'Japanese'];

const qualifications = [
  'Board Certified Dermatologist',
  'Certified Aesthetic Nurse Specialist',
  'Licensed Medical Aesthetician',
  'Certified Laser Technician',
  'Advanced Injector Certification',
  'Master Aesthetician',
  'Certified in Advanced Chemical Peels',
  'Microneedling Specialist',
  'Body Contouring Expert',
  'PRP/PRF Certified'
];

const certificationNames = [
  'Advanced Botox Techniques',
  'Dermal Filler Masterclass',
  'Laser Safety Certification',
  'Chemical Peel Certification',
  'Microneedling Advanced',
  'Thread Lift Certification',
  'Body Contouring Specialist',
  'Medical Sales Representative',
  'HIPAA Compliance',
  'CPR/First Aid'
];

const issuers = [
  'American Board of Cosmetic Surgery',
  'American Society of Plastic Surgeons',
  'International Association for Physicians in Aesthetic Medicine',
  'American Med Spa Association',
  'National Laser Institute',
  'Aesthetic Medical Educators Training',
  'American Academy of Facial Esthetics'
];

const locations = [
  'Beverly Hills Main',
  'Santa Monica Branch',
  'Newport Beach',
  'Malibu Center',
  'West Hollywood'
];

const rooms = [
  'Treatment Room 1',
  'Treatment Room 2',
  'Laser Suite A',
  'Laser Suite B',
  'Injection Room 1',
  'Injection Room 2',
  'Consultation Room',
  'VIP Suite'
];

function randomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEmployeeId(): string {
  return 'EMP' + randomBetween(10000, 99999);
}

function generatePhoneNumber(): string {
  return `(${randomBetween(200, 999)}) ${randomBetween(200, 999)}-${randomBetween(1000, 9999)}`;
}

function generateEmail(firstName: string, lastName: string): string {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@medspa.com`;
}

function generateDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

function generateFutureDate(daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
}

function getRoleAccessLevel(role: StaffRole): AccessLevel {
  const roleAccessMap: Record<StaffRole, AccessLevel> = {
    'Medical Director': 'Account Owner',
    'Physician': 'Full Access',
    'Nurse Practitioner': 'Full Access',
    'Registered Nurse': 'Practitioner + Front Desk (All Locations)',
    'Aesthetician': 'Practitioner + Front Desk',
    'Laser Technician': 'Practitioner Limited',
    'Injection Specialist': 'Practitioner + Front Desk',
    'Front Desk': 'Front Desk Only',
    'Office Manager': 'Full Access',
    'Billing Specialist': 'Administrative/Billing',
    'Marketing Coordinator': 'Administrative/Billing',
    'Patient Coordinator': 'Front Desk Only'
  };
  return roleAccessMap[role];
}

function getRoleSpecializations(role: StaffRole): Specialization[] {
  const specializationMap: Record<StaffRole, Specialization[]> = {
    'Medical Director': ['Botox/Dysport', 'Dermal Fillers', 'PRP/PRF', 'Skin Resurfacing'],
    'Physician': ['Botox/Dysport', 'Dermal Fillers', 'Chemical Peels', 'Skin Resurfacing'],
    'Nurse Practitioner': ['Botox/Dysport', 'Dermal Fillers', 'PRP/PRF', 'Microneedling'],
    'Registered Nurse': ['Botox/Dysport', 'Dermal Fillers', 'Chemical Peels'],
    'Aesthetician': ['Medical-Grade Facials', 'Chemical Peels', 'Microneedling'],
    'Laser Technician': ['Laser Hair Removal', 'IPL/BBL', 'Skin Resurfacing'],
    'Injection Specialist': ['Botox/Dysport', 'Dermal Fillers', 'PRP/PRF'],
    'Front Desk': [],
    'Office Manager': [],
    'Billing Specialist': [],
    'Marketing Coordinator': [],
    'Patient Coordinator': []
  };
  
  const specs = specializationMap[role];
  const numSpecs = randomBetween(1, Math.min(3, specs.length));
  const selected: Specialization[] = [];
  
  while (selected.length < numSpecs && specs.length > 0) {
    const spec = randomFromArray(specs);
    if (!selected.includes(spec)) {
      selected.push(spec);
    }
  }
  
  return selected;
}

function generateLicenses(role: StaffRole): License[] {
  const licenses: License[] = [];
  
  if (['Medical Director', 'Physician'].includes(role)) {
    licenses.push({
      id: 'LIC' + randomBetween(10000, 99999),
      type: 'Medical License',
      number: 'MD' + randomBetween(100000, 999999),
      state: 'CA',
      expiryDate: generateFutureDate(randomBetween(180, 730)),
      status: 'active'
    });
  }
  
  if (['Nurse Practitioner', 'Registered Nurse'].includes(role)) {
    licenses.push({
      id: 'LIC' + randomBetween(10000, 99999),
      type: 'Nursing License',
      number: 'RN' + randomBetween(100000, 999999),
      state: 'CA',
      expiryDate: generateFutureDate(randomBetween(180, 730)),
      status: Math.random() > 0.1 ? 'active' : 'pending_renewal'
    });
  }
  
  if (role === 'Aesthetician') {
    licenses.push({
      id: 'LIC' + randomBetween(10000, 99999),
      type: 'Aesthetician License',
      number: 'AE' + randomBetween(100000, 999999),
      state: 'CA',
      expiryDate: generateFutureDate(randomBetween(180, 730)),
      status: 'active'
    });
  }
  
  return licenses;
}

function generateCertifications(role: StaffRole): Certification[] {
  const numCerts = randomBetween(1, 4);
  const certs: Certification[] = [];
  
  for (let i = 0; i < numCerts; i++) {
    certs.push({
      id: 'CERT' + randomBetween(10000, 99999),
      name: randomFromArray(certificationNames),
      issuer: randomFromArray(issuers),
      issueDate: generateDate(randomBetween(180, 1460)),
      expiryDate: Math.random() > 0.5 ? generateFutureDate(randomBetween(180, 730)) : undefined,
      certificationNumber: 'CN' + randomBetween(100000, 999999)
    });
  }
  
  return certs;
}

function generateSchedules(): Schedule[] {
  const schedules: Schedule[] = [];
  const daysWorking = randomBetween(3, 5);
  const workDays = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5).slice(0, daysWorking);
  
  workDays.forEach(day => {
    const startHour = randomBetween(7, 10);
    const endHour = randomBetween(16, 19);
    
    schedules.push({
      id: 'SCH' + randomBetween(10000, 99999),
      dayOfWeek: day,
      startTime: `${startHour.toString().padStart(2, '0')}:00`,
      endTime: `${endHour.toString().padStart(2, '0')}:00`,
      breakStart: '12:00',
      breakEnd: '13:00',
      location: randomFromArray(locations),
      room: Math.random() > 0.3 ? randomFromArray(rooms) : undefined,
      isRecurring: true
    });
  });
  
  return schedules;
}

function generateTimeOff(): TimeOff[] {
  const timeOff: TimeOff[] = [];
  
  if (Math.random() > 0.7) {
    const startDate = generateFutureDate(randomBetween(30, 180));
    const endDate = generateFutureDate(randomBetween(31, 187));
    
    timeOff.push({
      id: 'TO' + randomBetween(10000, 99999),
      type: randomFromArray(['vacation', 'sick', 'personal', 'training']),
      startDate,
      endDate,
      status: randomFromArray(['pending', 'approved', 'denied']),
      reason: 'Personal time off request'
    });
  }
  
  return timeOff;
}

function generateCommission(role: StaffRole): Commission[] {
  const commission: Commission[] = [];
  
  if (['Medical Director', 'Physician', 'Nurse Practitioner', 'Registered Nurse', 'Aesthetician', 'Injection Specialist'].includes(role)) {
    commission.push(
      {
        serviceCategory: 'Injectables',
        rate: randomBetween(15, 35),
        type: 'percentage'
      },
      {
        serviceCategory: 'Laser Treatments',
        rate: randomBetween(10, 25),
        type: 'percentage'
      },
      {
        serviceCategory: 'Product Sales',
        rate: randomBetween(5, 15),
        type: 'percentage'
      }
    );
  }
  
  return commission;
}

function generatePerformanceMetrics(): PerformanceMetrics {
  return {
    servicesPerformed: randomBetween(50, 500),
    revenueGenerated: randomBetween(10000, 150000),
    clientRetentionRate: randomBetween(65, 98) / 100,
    averageRating: randomBetween(42, 50) / 10,
    rebookingRate: randomBetween(60, 95) / 100,
    productSalesTotal: randomBetween(1000, 25000),
    utilizationRate: randomBetween(55, 95) / 100
  };
}

export function generateStaffMember(): StaffMember {
  const firstName = randomFromArray(firstNames);
  const lastName = randomFromArray(lastNames);
  const role = randomFromArray([
    'Medical Director', 'Physician', 'Nurse Practitioner', 'Registered Nurse',
    'Aesthetician', 'Laser Technician', 'Injection Specialist', 'Front Desk',
    'Office Manager', 'Billing Specialist', 'Marketing Coordinator', 'Patient Coordinator'
  ] as StaffRole[]);
  
  const primaryLocation = randomFromArray(locations);
  const numLocations = randomBetween(1, 3);
  const staffLocations = [primaryLocation];
  
  while (staffLocations.length < numLocations) {
    const loc = randomFromArray(locations);
    if (!staffLocations.includes(loc)) {
      staffLocations.push(loc);
    }
  }
  
  const status: StaffStatus = Math.random() > 0.9 ? 
    randomFromArray(['inactive', 'on_leave', 'terminated']) : 'active';
  
  return {
    id: 'STAFF' + randomBetween(10000, 99999),
    employeeId: generateEmployeeId(),
    firstName,
    lastName,
    pronouns: Math.random() > 0.3 ? randomFromArray(pronouns) : undefined,
    email: generateEmail(firstName, lastName),
    phone: generatePhoneNumber(),
    alternatePhone: Math.random() > 0.5 ? generatePhoneNumber() : undefined,
    profilePhoto: `/avatars/staff-${randomBetween(1, 20)}.jpg`,
    
    role,
    accessLevel: getRoleAccessLevel(role),
    status,
    specializations: getRoleSpecializations(role),
    
    hireDate: generateDate(randomBetween(30, 1825)),
    birthDate: generateDate(randomBetween(7300, 18250)),
    
    address: {
      street: `${randomBetween(100, 9999)} ${randomFromArray(['Main', 'Oak', 'Pine', 'Maple', 'Cedar'])} St`,
      city: randomFromArray(['Los Angeles', 'Beverly Hills', 'Santa Monica', 'Newport Beach', 'Malibu']),
      state: 'CA',
      zip: randomBetween(90001, 96161).toString()
    },
    
    emergencyContact: {
      name: `${randomFromArray(firstNames)} ${randomFromArray(lastNames)}`,
      relationship: randomFromArray(['Spouse', 'Parent', 'Sibling', 'Friend']),
      phone: generatePhoneNumber(),
      email: Math.random() > 0.5 ? `emergency${randomBetween(1, 999)}@gmail.com` : undefined
    },
    
    bio: `Experienced ${role.toLowerCase()} with ${randomBetween(2, 15)} years in medical aesthetics. Passionate about helping patients achieve their aesthetic goals through innovative treatments and personalized care.`,
    
    qualifications: Array.from({ length: randomBetween(1, 3) }, () => randomFromArray(qualifications)),
    languages: Array.from({ length: randomBetween(1, 3) }, () => randomFromArray(languages)),
    
    licenses: generateLicenses(role),
    certifications: generateCertifications(role),
    
    locations: staffLocations,
    primaryLocation,
    
    schedules: generateSchedules(),
    timeOffRequests: generateTimeOff(),
    
    commission: generateCommission(role),
    hourlyRate: ['Front Desk', 'Patient Coordinator'].includes(role) ? randomBetween(18, 35) : undefined,
    salary: ['Office Manager', 'Medical Director'].includes(role) ? randomBetween(60000, 250000) : undefined,
    
    performanceMetrics: status === 'active' ? generatePerformanceMetrics() : undefined,
    
    insuranceInfo: ['Medical Director', 'Physician', 'Nurse Practitioner'].includes(role) ? {
      provider: randomFromArray(['Medical Protective', 'ProAssurance', 'The Doctors Company']),
      policyNumber: 'POL' + randomBetween(100000, 999999),
      expiryDate: generateFutureDate(randomBetween(180, 365))
    } : undefined,
    
    deaNumber: ['Medical Director', 'Physician'].includes(role) ? 'BM' + randomBetween(1000000, 9999999) : undefined,
    npiNumber: ['Medical Director', 'Physician', 'Nurse Practitioner'].includes(role) ? randomBetween(1000000000, 9999999999).toString() : undefined,
    
    directReports: role === 'Office Manager' ? ['STAFF' + randomBetween(10000, 99999)] : undefined,
    reportsTo: ['Front Desk', 'Patient Coordinator', 'Billing Specialist'].includes(role) ? 'STAFF' + randomBetween(10000, 99999) : undefined,
    
    onboardingCompleted: Math.random() > 0.1,
    lastTrainingDate: Math.random() > 0.3 ? generateDate(randomBetween(30, 180)) : undefined,
    nextReviewDate: generateFutureDate(randomBetween(30, 365)),
    
    notes: Math.random() > 0.7 ? 'Great team player, excellent patient feedback' : undefined,
    createdAt: generateDate(randomBetween(30, 1825)),
    updatedAt: generateDate(randomBetween(0, 30))
  };
}

export function generateStaffListItem(staff: StaffMember): StaffListItem {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextShift = staff.schedules.length > 0 && staff.status === 'active' ? {
    date: tomorrow.toISOString().split('T')[0],
    startTime: staff.schedules[0].startTime,
    endTime: staff.schedules[0].endTime,
    location: staff.schedules[0].location
  } : undefined;
  
  return {
    id: staff.id,
    employeeId: staff.employeeId,
    firstName: staff.firstName,
    lastName: staff.lastName,
    email: staff.email,
    phone: staff.phone,
    profilePhoto: staff.profilePhoto,
    role: staff.role,
    status: staff.status,
    primaryLocation: staff.primaryLocation,
    specializations: staff.specializations,
    nextShift,
    rating: staff.performanceMetrics?.averageRating,
    utilizationRate: staff.performanceMetrics?.utilizationRate
  };
}

let cachedStaffData: StaffMember[] | null = null;

export function generateStaffDataset(count: number = 50): StaffMember[] {
  if (cachedStaffData) {
    return cachedStaffData;
  }
  
  const staff: StaffMember[] = [];
  
  const roleDistribution = {
    'Medical Director': 1,
    'Physician': 2,
    'Nurse Practitioner': 3,
    'Registered Nurse': 5,
    'Aesthetician': 8,
    'Laser Technician': 4,
    'Injection Specialist': 6,
    'Front Desk': 6,
    'Office Manager': 2,
    'Billing Specialist': 3,
    'Marketing Coordinator': 2,
    'Patient Coordinator': 4
  };
  
  Object.entries(roleDistribution).forEach(([role, roleCount]) => {
    for (let i = 0; i < Math.min(roleCount, count); i++) {
      const member = generateStaffMember();
      member.role = role as StaffRole;
      member.accessLevel = getRoleAccessLevel(member.role);
      member.specializations = getRoleSpecializations(member.role);
      staff.push(member);
    }
  });
  
  while (staff.length < count) {
    staff.push(generateStaffMember());
  }
  
  staff.sort((a, b) => a.lastName.localeCompare(b.lastName));
  
  cachedStaffData = staff;
  return staff;
}

export function getStaffById(id: string): StaffMember | undefined {
  const staff = generateStaffDataset();
  return staff.find(s => s.id === id);
}

export function searchStaff(query: string): StaffMember[] {
  const staff = generateStaffDataset();
  const lowerQuery = query.toLowerCase();
  
  return staff.filter(s => 
    s.firstName.toLowerCase().includes(lowerQuery) ||
    s.lastName.toLowerCase().includes(lowerQuery) ||
    s.email.toLowerCase().includes(lowerQuery) ||
    s.employeeId.toLowerCase().includes(lowerQuery) ||
    s.role.toLowerCase().includes(lowerQuery)
  );
}