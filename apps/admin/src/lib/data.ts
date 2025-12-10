// Centralized data source for user/patient/practitioner information
// Single source of truth for all user-related data
import { Shift } from '@/types/calendar'
// Add these types to your @/lib/data.ts file

export interface Location {
  id: string;
  name: string;
  address?: string;
  color: string;
}

export interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  appointmentId?: string; // Optional - if not present, it's a patient-level note
  isImportant: boolean; // Starred notes that follow the patient
}



// Mock notes data
export const mockNotes: Note[] = [
  {
    id: 'note-1',
    content: 'Patient prefers morning appointments',
    authorId: 'staff-1',
    authorName: 'Admin Staff',
    createdAt: new Date(2023, 7, 10, 9, 30),
    appointmentId: undefined, // Patient-level note
    isImportant: true
  },
  {
    id: 'note-2',
    content: 'Shoulder pain - needs gentle treatment',
    authorId: '1',
    authorName: 'Jo-Ellen McKay',
    createdAt: new Date(2023, 7, 17, 8, 15),
    appointmentId: '1',
    isImportant: false
  }
];

export interface Practitioner {
  id: string;
  name: string;
  initials: string;
  discipline: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'on_leave';
  specializations?: string[];
  schedule?: {
    workDays: number[]; // 0-6 (Sunday-Saturday)
    startTime: string;
    endTime: string;
  };
  staggerOnlineBooking?: number; // Stagger interval in minutes (e.g., 30, 45, 60)
  
  // NEW: Capabilities System
  certifications?: string[]; // List of certifications/training (e.g., ["laser-certified", "injector-certified"])
  specialties?: string[]; // Areas of expertise (e.g., ["facial-aesthetics", "body-contouring"])
  experienceLevel?: Record<string, 'beginner' | 'intermediate' | 'advanced' | 'expert'>; // Per service type
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  notes?: string;
  notesList?: Note[]; // Patient-level notes
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: string[];
  allergies?: string[];
  notes?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  lastVisit?: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string; // Computed field for easy access
  serviceName: string;
  serviceCategory: 'physiotherapy' | 'chiropractic' | 'aesthetics' | 'massage';
  notes?: string; // Keep for backward compatibility
  notesList?: Note[]; // New notes array
  practitionerId: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'confirmed' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'deleted';
  color: string;
  duration: number; // minutes
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
  assignedResources?: Array<{
    resourceId: string;
    resourceName: string;
    resourcePoolId: string;
  }>;
  locationId?: string;
  roomId?: string; // Room assignment for this appointment
  postTreatmentTime?: number; // minutes for post-treatment reset/sanitization
  overriddenConflicts?: boolean; // true if appointment was booked despite conflicts
  cancellationReason?: string; // Reason for cancellation
  cancelledAt?: Date; // When the appointment was cancelled
  cancelledBy?: string; // Who cancelled the appointment
  deletedAt?: Date; // When appointment was deleted

  // NEW: Virtual Waiting Room fields
  waitingRoomStatus?: 'not_arrived' | 'in_car' | 'room_ready' | 'checked_in';
  arrivalTime?: Date; // When patient texted "HERE"
  waitingRoomPriority?: number; // 0 = normal, 1 = VIP, 2 = urgent
  roomReadyNotifiedAt?: Date; // When we sent "room ready" SMS

  // NEW: Express Booking fields
  expressBookingToken?: string; // Unique token for booking link
  expressBookingStatus?: 'pending' | 'confirmed' | 'expired' | 'cancelled';
  expressBookingExpiresAt?: Date; // When the booking link expires
  expressBookingSentAt?: Date; // When SMS was sent
  expressBookingCompletedAt?: Date; // When patient completed booking
  requireDeposit?: boolean; // Whether deposit is required
  depositAmount?: number; // Deposit amount in cents
  depositPaid?: boolean; // Whether deposit has been paid
  stripePaymentIntentId?: string; // Stripe payment intent for deposit
  cardOnFileId?: string; // Stripe payment method ID

  // NEW: Group Booking fields
  groupBookingId?: string; // Links to GroupBooking.id
  isGroupCoordinator?: boolean; // True if this patient is the group coordinator
  groupPosition?: number; // Position within the group (1, 2, 3...)
  individualPaymentStatus?: 'pending' | 'paid'; // For individual payment mode

  // NEW: Confirmation & Risk Tracking
  smsConfirmedAt?: Date; // When patient confirmed via SMS reply
  confirmationSentAt?: Date; // When confirmation SMS was sent
  reminderSentAt?: Date; // When reminder was sent
  isNewPatient?: boolean; // First-time patient (higher no-show risk)
  noShowRisk?: 'low' | 'medium' | 'high'; // Calculated risk level
}

// NEW: Waiting Room Queue Entry
export interface WaitingRoomEntry {
  appointmentId: string;
  patientId: string;
  patientName: string;
  phone: string;
  practitionerId: string;
  practitionerName: string;
  serviceName: string;
  scheduledTime: Date;
  arrivalTime: Date;
  status: 'in_car' | 'room_ready' | 'checked_in';
  priority: number; // 0 = normal, 1 = VIP, 2 = urgent
  estimatedWaitMinutes?: number;
  roomReadyNotifiedAt?: Date;
}

// NEW: Group Booking
export type GroupPaymentMode = 'individual' | 'coordinator' | 'split';
export type GroupBookingStatus = 'pending' | 'confirmed' | 'partially_confirmed' | 'cancelled';

export interface GroupBookingParticipant {
  patientId: string;
  patientName: string;
  phone?: string;
  email?: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  practitionerId: string;
  practitionerName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  appointmentId?: string; // Set after appointment is created
  status: 'pending' | 'confirmed' | 'arrived' | 'completed' | 'cancelled' | 'no_show';
  paymentStatus: 'pending' | 'paid';
  roomId?: string;
}

export interface GroupBooking {
  id: string;
  name: string; // e.g., "Sarah's Bridal Party"
  coordinatorPatientId: string;
  coordinatorName: string;
  coordinatorPhone?: string;
  coordinatorEmail?: string;

  // Participants (each becomes an appointment)
  participants: GroupBookingParticipant[];

  // Scheduling
  date: Date;
  schedulingMode: 'simultaneous' | 'staggered_15' | 'staggered_30' | 'custom';

  // Pricing & Discounts
  discountPercent: number; // Auto-calculated: 5% for 2, 10% for 3-4, 15% for 5+
  totalOriginalPrice: number;
  totalDiscountAmount: number;
  totalDiscountedPrice: number;

  // Payment
  paymentMode: GroupPaymentMode;
  paymentStatus: 'pending' | 'partial' | 'paid';

  // Status
  status: GroupBookingStatus;

  // Metadata
  notes?: string;
  locationId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

// Group discount tiers
export const GROUP_DISCOUNT_TIERS = [
  { minSize: 2, maxSize: 2, discount: 5 },
  { minSize: 3, maxSize: 4, discount: 10 },
  { minSize: 5, maxSize: Infinity, discount: 15 }
] as const;

// Calculate group discount based on size
export function calculateGroupDiscount(groupSize: number): number {
  const tier = GROUP_DISCOUNT_TIERS.find(t => groupSize >= t.minSize && groupSize <= t.maxSize);
  return tier?.discount ?? 0;
}

export interface Service {
  id: string;
  name: string;
  category: 'physiotherapy' | 'chiropractic' | 'aesthetics' | 'massage';
  duration: number; // minutes - actual treatment duration
  scheduledDuration?: number; // minutes - how much time to block on calendar (for staggered booking)
  price: number;
  description?: string;
  practitionerIds: string[]; // Which practitioners can perform this service
  isActive: boolean;
  requiredResources?: Array<{
    resourcePoolId: string;
    quantity: number;
  }>;
  postTreatmentTime?: number; // minutes for post-treatment reset/sanitation
  isInitialVisit?: boolean; // Whether this is an initial/new patient visit
  
  // NEW: Capabilities & Equipment System
  requiredCapabilities?: string[]; // Must-have practitioner capabilities (e.g., "laser-certified")
  preferredCapabilities?: string[]; // Nice-to-have capabilities (e.g., "experienced-injector")
  requiredEquipment?: string[]; // Specific equipment needed (e.g., "CO2-laser", "hydrafacial-machine")
  
  // LEGACY: Keep for backward compatibility
  tags?: string[]; // Tags that must match shift tags for this service to be bookable
}

export interface Break {
  id: string;
  practitionerId: string;
  practitionerName: string;
  type: 'lunch' | 'personal' | 'meeting' | 'training';
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  isRecurring: boolean;
  recurringDays?: number[]; // 0-6 (Sunday-Saturday)
  availableForEmergencies?: boolean;
  notes?: string;
}

export interface Break {
  id: string;
  practitionerId: string;
  practitionerName: string;
  type: 'lunch' | 'personal' | 'meeting' | 'training';
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  isRecurring: boolean;
  recurringDays?: number[]; // 0-6 (Sunday-Saturday)
  availableForEmergencies?: boolean;
  notes?: string;
}

// NEW: Available capabilities and equipment (moved here to be available before use)
export const AVAILABLE_CAPABILITIES = {
  // Certifications & Training
  LASER_CERTIFIED: 'laser-certified',
  INJECTOR_CERTIFIED: 'injector-certified',
  ADVANCED_LASER: 'advanced-laser',
  MEDICAL_DIRECTOR: 'medical-director',
  HYDRAFACIAL_TRAINED: 'hydrafacial-trained',
  IPL_CERTIFIED: 'ipl-certified',
  MICRONEEDLING_TRAINED: 'microneedling-trained',
  CHEMICAL_PEEL_CERTIFIED: 'chemical-peel-certified',
  
  // Specialties
  FACIAL_AESTHETICS: 'facial-aesthetics',
  BODY_CONTOURING: 'body-contouring',
  LASER_TREATMENTS: 'laser-treatments',
  INJECTION_THERAPY: 'injection-therapy',
  SKIN_RESURFACING: 'skin-resurfacing',
  
  // Experience Levels
  EXPERIENCED_INJECTOR: 'experienced-injector',
  SENIOR_TECHNICIAN: 'senior-technician'
} as const;

export const AVAILABLE_EQUIPMENT = {
  // Laser Equipment
  CO2_LASER: 'CO2-laser',
  IPL_MACHINE: 'IPL-machine',
  FRACTIONAL_LASER: 'fractional-laser',
  ALEXANDRITE_LASER: 'alexandrite-laser',
  
  // Injection Equipment
  INJECTION_STATION: 'injection-station',
  NUMBING_SYSTEM: 'numbing-system',
  
  // Facial Equipment
  HYDRAFACIAL_MACHINE: 'hydrafacial-machine',
  MICRONEEDLING_DEVICE: 'microneedling-device',
  DIAMOND_DERMABRASION: 'diamond-dermabrasion',
  OXYGEN_INFUSION: 'oxygen-infusion',
  
  // Body Equipment
  COOLSCULPTING_MACHINE: 'coolsculpting-machine',
  RADIOFREQUENCY_DEVICE: 'radiofrequency-device',
  ULTRASOUND_THERAPY: 'ultrasound-therapy',
  
  // General Equipment
  STERILIZATION_UNIT: 'sterilization-unit',
  LED_LIGHT_THERAPY: 'led-light-therapy'
} as const;

// Mock data - single source of truth
export const locations: Location[] = [
  {
    id: 'loc-1',
    name: 'The Village',
    address: '123 Main St, Suite 100',
    color: '#8B5CF6'
  },
  {
    id: 'loc-2',
    name: 'Downtown Clinic',
    address: '456 Center Ave, Floor 2',
    color: '#3B82F6'
  },
  {
    id: 'loc-3',
    name: 'Westside Medical',
    address: '789 West Blvd',
    color: '#10B981'
  }
];

export const practitioners: Practitioner[] = [
  {
    id: '1',
    name: 'Jo-Ellen McKay',
    initials: 'JM',
    discipline: 'Physiotherapy / Clinical Pilates',
    email: 'jo-ellen@medispa.com',
    phone: '(555) 100-0001',
    status: 'active',
    specializations: ['Clinical Pilates', 'Sports Physiotherapy'],
    schedule: {
      workDays: [1, 2, 3, 4, 5], // Monday to Friday
      startTime: '08:00',
      endTime: '17:00'
    },
    // NEW: Capabilities
    certifications: [],
    specialties: ['physiotherapy'],
    experienceLevel: {
      'clinical-pilates': 'expert',
      'sports-physiotherapy': 'advanced'
    }
  },
  {
    id: '2',
    name: 'D.O. Demo Owner',
    initials: 'DO',
    discipline: 'Aesthetic Massage Therapy',
    email: 'demo@medispa.com',
    phone: '(555) 100-0002',
    status: 'active',
    specializations: ['Deep Tissue Massage', 'Relaxation Therapy'],
    schedule: {
      workDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
      startTime: '09:00',
      endTime: '18:00'
    },
    // NEW: Capabilities
    certifications: [],
    specialties: ['massage-therapy'],
    experienceLevel: {
      'massage': 'expert'
    }
  },
  {
    id: '3',
    name: 'Dr. Marcus Gregory',
    initials: 'MG',
    discipline: 'Chiropractic',
    email: 'marcus@medispa.com',
    phone: '(555) 100-0003',
    status: 'active',
    specializations: ['Spinal Adjustment', 'Sports Chiropractic'],
    schedule: {
      workDays: [1, 2, 3, 4, 5], // Monday to Friday
      startTime: '08:30',
      endTime: '16:30'
    },
    // NEW: Capabilities
    certifications: [],
    specialties: ['chiropractic'],
    experienceLevel: {
      'chiropractic': 'expert'
    }
  },
  {
    id: '4',
    name: 'Susan Lo',
    initials: 'SL',
    discipline: 'Aesthetics',
    email: 'susan@medispa.com',
    phone: '(555) 100-0004',
    status: 'active',
    specializations: ['Botox', 'Dermal Fillers', 'Facial Aesthetics'],
    schedule: {
      workDays: [2, 3, 4, 5, 6], // Tuesday to Saturday
      startTime: '10:00',
      endTime: '19:00'
    },
    staggerOnlineBooking: 30, // 30-minute stagger for aesthetic treatments
    // NEW: Capabilities
    certifications: [
      AVAILABLE_CAPABILITIES.INJECTOR_CERTIFIED,
      AVAILABLE_CAPABILITIES.LASER_CERTIFIED,
      AVAILABLE_CAPABILITIES.ADVANCED_LASER,
      AVAILABLE_CAPABILITIES.HYDRAFACIAL_TRAINED,
      AVAILABLE_CAPABILITIES.IPL_CERTIFIED
    ],
    specialties: [
      AVAILABLE_CAPABILITIES.FACIAL_AESTHETICS,
      AVAILABLE_CAPABILITIES.INJECTION_THERAPY,
      AVAILABLE_CAPABILITIES.LASER_TREATMENTS,
      AVAILABLE_CAPABILITIES.SKIN_RESURFACING
    ],
    experienceLevel: {
      'botox': 'expert',
      'fillers': 'expert',
      'laser-facial': 'advanced',
      'ipl-treatment': 'advanced',
      'hydrafacial': 'intermediate'
    }
  }
];

export const patients: Patient[] = [
  {
    id: 'p1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    fullName: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '(555) 123-4567',
    dateOfBirth: new Date(1985, 3, 15),
    address: {
      street: '123 Main St',
      city: 'Toronto',
      state: 'ON',
      zipCode: 'M5V 3A8'
    },
    status: 'active',
    createdAt: new Date(2023, 0, 15),
    lastVisit: new Date(2023, 7, 17)
  },
  {
    id: 'p2',
    firstName: 'Lily',
    lastName: 'Gagnon',
    fullName: 'Lily Gagnon',
    phone: '(555) 234-5678',
    status: 'active',
    createdAt: new Date(2023, 1, 20),
    lastVisit: new Date(2023, 7, 17)
  },
  {
    id: 'p3',
    firstName: 'Emma',
    lastName: 'Wilson',
    fullName: 'Emma Wilson',
    email: 'emma.w@email.com',
    phone: '(555) 345-6789',
    status: 'active',
    createdAt: new Date(2023, 2, 10),
    lastVisit: new Date(2023, 7, 17)
  },
  {
    id: 'p4',
    firstName: 'Michael',
    lastName: 'Chen',
    fullName: 'Michael Chen',
    phone: '(555) 456-7890',
    status: 'active',
    createdAt: new Date(2023, 3, 5),
    lastVisit: new Date(2023, 7, 17)
  },
  {
    id: 'p5',
    firstName: 'Christina',
    lastName: 'Smith',
    fullName: 'Christina Smith',
    email: 'christina.s@email.com',
    phone: '(555) 567-8901',
    status: 'active',
    createdAt: new Date(2023, 4, 12),
    lastVisit: new Date(2023, 7, 17)
  }
];

// Available tags for shifts and services (LEGACY - kept for backward compatibility)
export const AVAILABLE_TAGS = {
  INJECTABLES: 'Injectables',
  INITIAL_CONSULT: 'Initial Consult',
  LASER_ROOM: 'Laser Room',
  HYDRAFACIAL: 'Hydrafacial Suite',
  ADVANCED_AESTHETICS: 'Advanced Aesthetics',
  MORNING_ONLY: 'Morning Only',
  BODY_CONTOURING: 'Body Contouring',
  MEDICAL_DIRECTOR: 'Medical Director',
  EXPRESS_TREATMENTS: 'Express Treatments'
} as const;


export const services: Service[] = [
  {
    id: 's1',
    name: 'Clinical Pilates',
    category: 'physiotherapy',
    duration: 60,
    price: 120,
    practitionerIds: ['1'],
    isActive: true
  },
  {
    id: 's2',
    name: '30 Minute Massage',
    category: 'massage',
    duration: 30,
    price: 80,
    practitionerIds: ['2'],
    isActive: true
  },
  {
    id: 's3',
    name: 'Lip Filler',
    category: 'aesthetics',
    duration: 45,
    scheduledDuration: 30, // Only block 30 min on calendar for staggered booking
    price: 350,
    practitionerIds: ['4'],
    isActive: true,
    postTreatmentTime: 15,  // Sanitization and room prep
    // NEW: Capabilities & Equipment
    requiredCapabilities: [AVAILABLE_CAPABILITIES.INJECTOR_CERTIFIED],
    preferredCapabilities: [AVAILABLE_CAPABILITIES.EXPERIENCED_INJECTOR],
    requiredEquipment: [AVAILABLE_EQUIPMENT.INJECTION_STATION, AVAILABLE_EQUIPMENT.NUMBING_SYSTEM],
    // LEGACY: Keep for backward compatibility
    tags: []
  },
  {
    id: 's4',
    name: 'Adjustment',
    category: 'chiropractic',
    duration: 30,
    price: 90,
    practitionerIds: ['3'],
    isActive: true
  },
  {
    id: 's5',
    name: 'Botox Consultation',
    category: 'aesthetics',
    duration: 30,
    scheduledDuration: 30, // Full time needed for consultation
    price: 200,
    practitionerIds: ['4'],
    isActive: true,
    postTreatmentTime: 10,  // Clean up and prep for next patient
    isInitialVisit: true, // This is typically for new patients
    // NEW: Capabilities & Equipment
    requiredCapabilities: [AVAILABLE_CAPABILITIES.INJECTOR_CERTIFIED],
    requiredEquipment: [AVAILABLE_EQUIPMENT.INJECTION_STATION],
    // LEGACY: Keep for backward compatibility
    tags: []
  },
  {
    id: 's6',
    name: '60 Minute Massage',
    category: 'massage',
    duration: 60,
    price: 120,
    practitionerIds: ['2'],
    isActive: true
  },
  {
    id: 's7',
    name: '90 Minute Massage',
    category: 'massage',
    duration: 90,
    price: 160,
    practitionerIds: ['2'],
    isActive: true
  },
  {
    id: 's8',
    name: 'Sports Physiotherapy',
    category: 'physiotherapy',
    duration: 45,
    price: 100,
    practitionerIds: ['1'],
    isActive: true
  },
  {
    id: 's9',
    name: 'Spinal Adjustment',
    category: 'chiropractic',
    duration: 45,
    price: 110,
    practitionerIds: ['3'],
    isActive: true
  },
  {
    id: 's10',
    name: 'Dermal Fillers',
    category: 'aesthetics',
    duration: 60,
    scheduledDuration: 30, // Only block 30 min for staggered booking
    price: 450,
    practitionerIds: ['4'],
    isActive: true,
    postTreatmentTime: 15,  // Sanitization and room prep
    // NEW: Capabilities & Equipment
    requiredCapabilities: [AVAILABLE_CAPABILITIES.INJECTOR_CERTIFIED],
    preferredCapabilities: [AVAILABLE_CAPABILITIES.EXPERIENCED_INJECTOR],
    requiredEquipment: [AVAILABLE_EQUIPMENT.INJECTION_STATION, AVAILABLE_EQUIPMENT.NUMBING_SYSTEM],
    // LEGACY: Keep for backward compatibility
    tags: []
  },
  {
    id: 's11',
    name: 'CO2 Laser Resurfacing',
    category: 'aesthetics',
    duration: 60,
    price: 500,
    practitionerIds: ['4'],
    isActive: true,
    postTreatmentTime: 20,  // Deep cleaning of laser equipment
    // NEW: Capabilities & Equipment
    requiredCapabilities: [AVAILABLE_CAPABILITIES.LASER_CERTIFIED, AVAILABLE_CAPABILITIES.ADVANCED_LASER],
    requiredEquipment: [AVAILABLE_EQUIPMENT.CO2_LASER, AVAILABLE_EQUIPMENT.STERILIZATION_UNIT],
    // LEGACY: Keep for backward compatibility
    tags: []
  },
  {
    id: 's12',
    name: 'IPL Photo Facial',
    category: 'aesthetics',
    duration: 45,
    price: 350,
    practitionerIds: ['4'],
    isActive: true,
    postTreatmentTime: 15,  // Equipment sanitization
    // NEW: Capabilities & Equipment
    requiredCapabilities: [AVAILABLE_CAPABILITIES.IPL_CERTIFIED, AVAILABLE_CAPABILITIES.LASER_CERTIFIED],
    requiredEquipment: [AVAILABLE_EQUIPMENT.IPL_MACHINE, AVAILABLE_EQUIPMENT.STERILIZATION_UNIT],
    // LEGACY: Keep for backward compatibility
    tags: []
  },
  {
    id: 's13',
    name: 'X-Ray Consultation',
    category: 'chiropractic',
    duration: 30,
    price: 150,
    practitionerIds: ['3'],
    isActive: true,
    requiredResources: [
      {
        resourcePoolId: 'pool-2',
        quantity: 1
      }
    ]
  }
];

export const appointments: Appointment[] = [
  // Existing appointments for Thursday Aug 17 (TODAY in demo)
  {
    id: '1',
    patientId: 'p1',
    patientName: 'Sarah Johnson',
    serviceName: 'Clinical Pilates',
    serviceCategory: 'physiotherapy',
    practitionerId: '1',
    startTime: new Date(2023, 7, 17, 8, 0),
    endTime: new Date(2023, 7, 17, 9, 0),
    status: 'arrived',
    color: '#10b981',
    duration: 60,
    phone: '(555) 123-4567',
    email: 'sarah.j@email.com',
    createdAt: new Date(2023, 7, 10),
    updatedAt: new Date(2023, 7, 17),
    roomId: 'room-1', // Treatment Room 1
    // Confirmed before arrival
    confirmationSentAt: new Date(2023, 7, 16, 9, 0),
    smsConfirmedAt: new Date(2023, 7, 16, 10, 30)
  },
  {
    id: '2',
    patientId: 'p2',
    patientName: 'Lily Gagnon',
    serviceName: '30 Minute Massage',
    serviceCategory: 'massage',
    practitionerId: '2',
    startTime: new Date(2023, 7, 17, 8, 0),
    endTime: new Date(2023, 7, 17, 8, 30),
    status: 'confirmed',
    color: '#3b82f6',
    duration: 30,
    phone: '(555) 234-5678',
    createdAt: new Date(2023, 7, 12),
    updatedAt: new Date(2023, 7, 16),
    roomId: 'room-2', // Treatment Room 2
    // SMS Confirmed
    confirmationSentAt: new Date(2023, 7, 15, 10, 0),
    smsConfirmedAt: new Date(2023, 7, 15, 12, 15)
  },
  {
    id: '3',
    patientId: 'p3',
    patientName: 'Emma Wilson',
    serviceName: 'Lip Filler',
    serviceCategory: 'aesthetics',
    practitionerId: '1',
    startTime: new Date(2023, 7, 17, 10, 0),
    endTime: new Date(2023, 7, 17, 10, 45),
    status: 'scheduled',
    color: '#ec4899',
    duration: 45,
    phone: '(555) 345-6789',
    email: 'emma.w@email.com',
    createdAt: new Date(2023, 7, 14),
    updatedAt: new Date(2023, 7, 14),
    roomId: 'room-1', // Treatment Room 1 (same practitioner, same room)
    // Unconfirmed - SMS sent but no reply
    confirmationSentAt: new Date(2023, 7, 16, 9, 0)
  },
  {
    id: '4',
    patientId: 'p4',
    patientName: 'Michael Chen',
    serviceName: 'Adjustment',
    serviceCategory: 'chiropractic',
    practitionerId: '3',
    startTime: new Date(2023, 7, 17, 9, 0),
    endTime: new Date(2023, 7, 17, 9, 30),
    status: 'confirmed',
    color: '#8b5cf6',
    duration: 30,
    phone: '(555) 456-7890',
    createdAt: new Date(2023, 7, 13),
    updatedAt: new Date(2023, 7, 16)
  },
  {
    id: '5',
    patientId: 'p5',
    patientName: 'Christina Smith',
    serviceName: 'Botox Consultation',
    serviceCategory: 'aesthetics',
    practitionerId: '4',
    startTime: new Date(2023, 7, 17, 11, 0),
    endTime: new Date(2023, 7, 17, 11, 30),
    status: 'scheduled',
    color: '#f59e0b',
    duration: 30,
    phone: '(555) 567-8901',
    email: 'christina.s@email.com',
    createdAt: new Date(2023, 7, 15),
    updatedAt: new Date(2023, 7, 15),
    roomId: 'room-4', // Laser Suite
    // HIGH RISK: New patient, unconfirmed, no deposit
    confirmationSentAt: new Date(2023, 7, 16, 9, 0),
    isNewPatient: true,
    noShowRisk: 'high'
  },
  
  // Example of staggered booking - Susan Lo working in multiple rooms
  {
    id: '6',
    patientId: 'p1',
    patientName: 'Sarah Johnson',
    serviceName: 'Dermal Fillers',
    serviceCategory: 'aesthetics',
    practitionerId: '4', // Susan Lo
    startTime: new Date(2023, 7, 17, 14, 0),
    endTime: new Date(2023, 7, 17, 14, 30), // Only blocks 30 min due to scheduledDuration
    status: 'scheduled',
    color: '#ec4899',
    duration: 60, // Actual treatment takes 60 minutes
    phone: '(555) 123-4567',
    email: 'sarah.j@email.com',
    createdAt: new Date(2023, 7, 16),
    updatedAt: new Date(2023, 7, 16),
    roomId: 'room-1' // Treatment Room 1
  },
  {
    id: '7',
    patientId: 'p2',
    patientName: 'Lily Gagnon',
    serviceName: 'Lip Filler',
    serviceCategory: 'aesthetics',
    practitionerId: '4', // Susan Lo
    startTime: new Date(2023, 7, 17, 14, 30),
    endTime: new Date(2023, 7, 17, 15, 0), // Staggered 30 min after previous
    status: 'scheduled',
    color: '#ec4899',
    duration: 45, // Actual treatment takes 45 minutes
    phone: '(555) 234-5678',
    createdAt: new Date(2023, 7, 16),
    updatedAt: new Date(2023, 7, 16),
    roomId: 'room-2' // Treatment Room 2 - different room allows overlap
  },

  // WEEK VIEW APPOINTMENTS - Rest of the week

  // Sunday Aug 13 - No appointments (most staff don't work Sundays)

  // Monday Aug 14
  {
    id: 'w1',
    patientId: 'p1',
    patientName: 'Sarah Johnson',
    serviceName: 'Clinical Pilates',
    serviceCategory: 'physiotherapy',
    practitionerId: '1',
    startTime: new Date(2023, 7, 14, 9, 0),
    endTime: new Date(2023, 7, 14, 10, 0),
    status: 'completed',
    color: '#10b981',
    duration: 60,
    createdAt: new Date(2023, 7, 7),
    updatedAt: new Date(2023, 7, 14)
  },
  {
    id: 'w2',
    patientId: 'p2',
    patientName: 'Lily Gagnon',
    serviceName: '30 Minute Massage',
    serviceCategory: 'massage',
    practitionerId: '2',
    startTime: new Date(2023, 7, 14, 10, 30),
    endTime: new Date(2023, 7, 14, 11, 0),
    status: 'completed',
    color: '#3b82f6',
    duration: 30,
    createdAt: new Date(2023, 7, 7),
    updatedAt: new Date(2023, 7, 14)
  },
  {
    id: 'w3',
    patientId: 'p3',
    patientName: 'Emma Wilson',
    serviceName: 'Adjustment',
    serviceCategory: 'chiropractic',
    practitionerId: '3',
    startTime: new Date(2023, 7, 14, 14, 0),
    endTime: new Date(2023, 7, 14, 14, 30),
    status: 'completed',
    color: '#8b5cf6',
    duration: 30,
    createdAt: new Date(2023, 7, 8),
    updatedAt: new Date(2023, 7, 14)
  },

  // Tuesday Aug 15
  {
    id: 'w4',
    patientId: 'p4',
    patientName: 'Michael Chen',
    serviceName: 'Botox Consultation',
    serviceCategory: 'aesthetics',
    practitionerId: '4',
    startTime: new Date(2023, 7, 15, 11, 0),
    endTime: new Date(2023, 7, 15, 11, 30),
    status: 'completed',
    color: '#f59e0b',
    duration: 30,
    createdAt: new Date(2023, 7, 9),
    updatedAt: new Date(2023, 7, 15)
  },
  {
    id: 'w5',
    patientId: 'p5',
    patientName: 'Christina Smith',
    serviceName: 'Clinical Pilates',
    serviceCategory: 'physiotherapy',
    practitionerId: '1',
    startTime: new Date(2023, 7, 15, 14, 0),
    endTime: new Date(2023, 7, 15, 15, 0),
    status: 'completed',
    color: '#10b981',
    duration: 60,
    createdAt: new Date(2023, 7, 10),
    updatedAt: new Date(2023, 7, 15)
  },
  {
    id: 'w6',
    patientId: 'p1',
    patientName: 'Sarah Johnson',
    serviceName: '30 Minute Massage',
    serviceCategory: 'massage',
    practitionerId: '2',
    startTime: new Date(2023, 7, 15, 15, 30),
    endTime: new Date(2023, 7, 15, 16, 0),
    status: 'completed',
    color: '#3b82f6',
    duration: 30,
    createdAt: new Date(2023, 7, 11),
    updatedAt: new Date(2023, 7, 15)
  },

  // Wednesday Aug 16
  {
    id: 'w7',
    patientId: 'p2',
    patientName: 'Lily Gagnon',
    serviceName: 'Lip Filler',
    serviceCategory: 'aesthetics',
    practitionerId: '4',
    startTime: new Date(2023, 7, 16, 10, 0),
    endTime: new Date(2023, 7, 16, 10, 45),
    status: 'completed',
    color: '#ec4899',
    duration: 45,
    createdAt: new Date(2023, 7, 11),
    updatedAt: new Date(2023, 7, 16)
  },
  {
    id: 'w8',
    patientId: 'p3',
    patientName: 'Emma Wilson',
    serviceName: 'Clinical Pilates',
    serviceCategory: 'physiotherapy',
    practitionerId: '1',
    startTime: new Date(2023, 7, 16, 13, 0),
    endTime: new Date(2023, 7, 16, 14, 0),
    status: 'scheduled',
    color: '#10b981',
    duration: 60,
    createdAt: new Date(2023, 7, 12),
    updatedAt: new Date(2023, 7, 12)
  },
  {
    id: 'w9',
    patientId: 'p4',
    patientName: 'Michael Chen',
    serviceName: 'Adjustment',
    serviceCategory: 'chiropractic',
    practitionerId: '3',
    startTime: new Date(2023, 7, 16, 16, 0),
    endTime: new Date(2023, 7, 16, 16, 30),
    status: 'scheduled',
    color: '#8b5cf6',
    duration: 30,
    createdAt: new Date(2023, 7, 13),
    updatedAt: new Date(2023, 7, 13)
  },

  // Friday Aug 18
  {
    id: 'w10',
    patientId: 'p5',
    patientName: 'Christina Smith',
    serviceName: 'Adjustment',
    serviceCategory: 'chiropractic',
    practitionerId: '3',
    startTime: new Date(2023, 7, 18, 11, 30),
    endTime: new Date(2023, 7, 18, 12, 0),
    status: 'scheduled',
    color: '#8b5cf6',
    duration: 30,
    createdAt: new Date(2023, 7, 14),
    updatedAt: new Date(2023, 7, 14)
  },
  {
    id: 'w11',
    patientId: 'p1',
    patientName: 'Sarah Johnson',
    serviceName: 'Lip Filler',
    serviceCategory: 'aesthetics',
    practitionerId: '4',
    startTime: new Date(2023, 7, 18, 14, 0),
    endTime: new Date(2023, 7, 18, 14, 45),
    status: 'scheduled',
    color: '#ec4899',
    duration: 45,
    createdAt: new Date(2023, 7, 15),
    updatedAt: new Date(2023, 7, 15)
  },
  {
    id: 'w12',
    patientId: 'p2',
    patientName: 'Lily Gagnon',
    serviceName: '30 Minute Massage',
    serviceCategory: 'massage',
    practitionerId: '2',
    startTime: new Date(2023, 7, 18, 16, 0),
    endTime: new Date(2023, 7, 18, 16, 30),
    status: 'scheduled',
    color: '#3b82f6',
    duration: 30,
    createdAt: new Date(2023, 7, 15),
    updatedAt: new Date(2023, 7, 15)
  },

  // Saturday Aug 19 (Only D.O. Demo Owner and Susan Lo work Saturdays)
  {
    id: 'w13',
    patientId: 'p3',
    patientName: 'Emma Wilson',
    serviceName: 'CO2 Laser Resurfacing',
    serviceCategory: 'aesthetics',
    practitionerId: '4',
    startTime: new Date(2023, 7, 19, 10, 0),
    endTime: new Date(2023, 7, 19, 11, 0),
    status: 'scheduled',
    color: '#f59e0b',
    duration: 60,
    createdAt: new Date(2023, 7, 16),
    updatedAt: new Date(2023, 7, 16),
    assignedResources: [{
      resourceId: 'res-1',
      resourceName: 'CO2 Laser 1',
      resourcePoolId: 'pool-1',
      resourcePoolName: 'CO2 Lasers'
    }],
    postTreatmentTime: 20
  },
  {
    id: 'w14',
    patientId: 'p4',
    patientName: 'Michael Chen',
    serviceName: '30 Minute Massage',
    serviceCategory: 'massage',
    practitionerId: '2',
    startTime: new Date(2023, 7, 19, 11, 0),
    endTime: new Date(2023, 7, 19, 11, 30),
    status: 'scheduled',
    color: '#3b82f6',
    duration: 30,
    createdAt: new Date(2023, 7, 16),
    updatedAt: new Date(2023, 7, 16)
  },
  {
    id: 'w15',
    patientId: 'p5',
    patientName: 'Christina Smith',
    serviceName: 'Lip Filler',
    serviceCategory: 'aesthetics',
    practitionerId: '4',
    startTime: new Date(2023, 7, 19, 14, 0),
    endTime: new Date(2023, 7, 19, 14, 45),
    status: 'scheduled',
    color: '#ec4899',
    duration: 45,
    createdAt: new Date(2023, 7, 16),
    updatedAt: new Date(2023, 7, 16)
  }
];

// Mock shift data - in real app, this would come from the database
export const practitionerShifts: Shift[] = [
  // Dr. Sarah Johnson - Mon-Fri 9-5
  { practitionerId: '1', dayOfWeek: 1, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
  { practitionerId: '1', dayOfWeek: 2, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
  { practitionerId: '1', dayOfWeek: 3, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
  { practitionerId: '1', dayOfWeek: 4, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },
  { practitionerId: '1', dayOfWeek: 5, startHour: 9, startMinute: 0, endHour: 17, endMinute: 0 },

  // Dr. Emily Wilson - Mon,Wed,Fri 10-6
  { practitionerId: '2', dayOfWeek: 1, startHour: 10, startMinute: 0, endHour: 18, endMinute: 0 },
  { practitionerId: '2', dayOfWeek: 3, startHour: 10, startMinute: 0, endHour: 18, endMinute: 0 },
  { practitionerId: '2', dayOfWeek: 5, startHour: 10, startMinute: 0, endHour: 18, endMinute: 0 },

  // Dr. Michael Chen - Tue,Thu,Sat 8-4
  { practitionerId: '3', dayOfWeek: 2, startHour: 8, startMinute: 0, endHour: 16, endMinute: 0 },
  { practitionerId: '3', dayOfWeek: 4, startHour: 8, startMinute: 0, endHour: 16, endMinute: 0 },
  { practitionerId: '3', dayOfWeek: 6, startHour: 8, startMinute: 0, endHour: 16, endMinute: 0 },

  // Rebecca Thompson - Mon-Thu 11-7
  { practitionerId: '4', dayOfWeek: 1, startHour: 11, startMinute: 0, endHour: 19, endMinute: 0 },
  { practitionerId: '4', dayOfWeek: 2, startHour: 11, startMinute: 0, endHour: 19, endMinute: 0 },
  { practitionerId: '4', dayOfWeek: 3, startHour: 11, startMinute: 0, endHour: 19, endMinute: 0 },
  { practitionerId: '4', dayOfWeek: 4, startHour: 11, startMinute: 0, endHour: 19, endMinute: 0 },
]

// Mock Group Bookings - empty by default, populated when groups are created
export const groupBookings: GroupBooking[] = [];

// Utility functions for data access
export const getPatientById = (id: string): Patient | undefined => {
  return patients.find(patient => patient.id === id);
};

export const getPractitionerById = (id: string): Practitioner | undefined => {
  return practitioners.find(practitioner => practitioner.id === id);
};

export const getServiceById = (id: string): Service | undefined => {
  return services.find(service => service.id === id);
};

export const getAppointmentsByPatient = (patientId: string): Appointment[] => {
  return appointments.filter(appointment => appointment.patientId === patientId);
};

export const getAppointmentsByPractitioner = (practitionerId: string): Appointment[] => {
  return appointments.filter(appointment => appointment.practitionerId === practitionerId);
};

export const getAppointmentsByDate = (date: Date): Appointment[] => {
  return appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.startTime);
    return appointmentDate.toDateString() === date.toDateString();
  });
};

export const getActivePractitioners = (): Practitioner[] => {
  return practitioners.filter(practitioner => practitioner.status === 'active');
};

export const getActivePatients = (): Patient[] => {
  return patients.filter(patient => patient.status === 'active');
};

export const getActiveServices = (): Service[] => {
  return services.filter(service => service.isActive);
};

// Get services that a practitioner can perform
export const getServicesForPractitioner = (practitionerId: string): Service[] => {
  return services.filter(service =>
    service.isActive && service.practitionerIds.includes(practitionerId)
  );
};

// NEW: Virtual Waiting Room utility functions
export const getWaitingRoomQueue = (): WaitingRoomEntry[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const waitingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.startTime);
    aptDate.setHours(0, 0, 0, 0);
    return (
      aptDate.getTime() === today.getTime() &&
      apt.waitingRoomStatus &&
      apt.waitingRoomStatus !== 'not_arrived' &&
      apt.waitingRoomStatus !== 'checked_in' &&
      apt.arrivalTime
    );
  });

  const queue: WaitingRoomEntry[] = waitingAppointments.map(apt => {
    const practitioner = getPractitionerById(apt.practitionerId);
    return {
      appointmentId: apt.id,
      patientId: apt.patientId,
      patientName: apt.patientName,
      phone: apt.phone || '',
      practitionerId: apt.practitionerId,
      practitionerName: practitioner?.name || 'Unknown',
      serviceName: apt.serviceName,
      scheduledTime: apt.startTime,
      arrivalTime: apt.arrivalTime!,
      status: apt.waitingRoomStatus as 'in_car' | 'room_ready' | 'checked_in',
      priority: apt.waitingRoomPriority || 0,
      roomReadyNotifiedAt: apt.roomReadyNotifiedAt
    };
  });

  // Sort by priority (descending), then by arrival time (ascending)
  queue.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return a.arrivalTime.getTime() - b.arrivalTime.getTime();
  });

  return queue;
};

export const updateAppointmentWaitingRoomStatus = (
  appointmentId: string,
  status: 'not_arrived' | 'in_car' | 'room_ready' | 'checked_in',
  options?: {
    arrivalTime?: Date;
    priority?: number;
    roomReadyNotifiedAt?: Date;
  }
): Appointment | null => {
  const appointment = appointments.find(apt => apt.id === appointmentId);
  if (!appointment) return null;

  appointment.waitingRoomStatus = status;
  if (options?.arrivalTime) appointment.arrivalTime = options.arrivalTime;
  if (options?.priority !== undefined) appointment.waitingRoomPriority = options.priority;
  if (options?.roomReadyNotifiedAt) appointment.roomReadyNotifiedAt = options.roomReadyNotifiedAt;
  appointment.updatedAt = new Date();

  return appointment;
};

// ============================================================================
// GROUP BOOKING UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a group booking by ID
 */
export const getGroupBookingById = (groupId: string): GroupBooking | undefined => {
  return groupBookings.find(group => group.id === groupId);
};

/**
 * Get all appointments in a group
 */
export const getAppointmentsByGroupId = (groupId: string): Appointment[] => {
  return appointments.filter(apt => apt.groupBookingId === groupId);
};

/**
 * Get group booking info for an appointment
 */
export const getGroupInfoForAppointment = (appointmentId: string): {
  group: GroupBooking | null;
  siblingAppointments: Appointment[];
  position: number;
  totalInGroup: number;
} | null => {
  const appointment = appointments.find(apt => apt.id === appointmentId);
  if (!appointment || !appointment.groupBookingId) return null;

  const group = getGroupBookingById(appointment.groupBookingId);
  if (!group) return null;

  const siblings = getAppointmentsByGroupId(appointment.groupBookingId);

  return {
    group,
    siblingAppointments: siblings,
    position: appointment.groupPosition || 1,
    totalInGroup: siblings.length
  };
};

/**
 * Create a new group booking and its associated appointments
 */
export const createGroupBooking = (
  groupData: Omit<GroupBooking, 'id' | 'createdAt' | 'updatedAt' | 'discountPercent' | 'totalDiscountAmount' | 'totalDiscountedPrice'>
): { group: GroupBooking; appointments: Appointment[] } => {
  // Generate group ID
  const groupId = `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Calculate discount
  const participantCount = groupData.participants.length;
  const discountPercent = calculateGroupDiscount(participantCount);
  const totalOriginalPrice = groupData.totalOriginalPrice;
  const totalDiscountAmount = (totalOriginalPrice * discountPercent) / 100;
  const totalDiscountedPrice = totalOriginalPrice - totalDiscountAmount;

  // Create group booking
  const group: GroupBooking = {
    ...groupData,
    id: groupId,
    discountPercent,
    totalDiscountAmount,
    totalDiscountedPrice,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Create appointments for each participant
  const createdAppointments: Appointment[] = groupData.participants.map((participant, index) => {
    const appointmentId = `apt-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate discounted price for this participant
    const individualDiscount = (participant.servicePrice * discountPercent) / 100;

    const appointment: Appointment = {
      id: appointmentId,
      patientId: participant.patientId,
      patientName: participant.patientName,
      serviceName: participant.serviceName,
      serviceCategory: 'aesthetics', // Default, should be set from service
      practitionerId: participant.practitionerId,
      startTime: participant.startTime,
      endTime: participant.endTime,
      status: 'scheduled',
      color: '#8B5CF6', // Purple for group bookings
      duration: participant.duration,
      phone: participant.phone,
      email: participant.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      roomId: participant.roomId,
      // Group booking fields
      groupBookingId: groupId,
      isGroupCoordinator: participant.patientId === groupData.coordinatorPatientId,
      groupPosition: index + 1,
      individualPaymentStatus: 'pending'
    };

    // Update participant with appointmentId
    participant.appointmentId = appointmentId;

    return appointment;
  });

  // Add to mock data
  groupBookings.push(group);
  appointments.push(...createdAppointments);

  return { group, appointments: createdAppointments };
};

/**
 * Cancel a group booking and all associated appointments
 */
export const cancelGroupBooking = (
  groupId: string,
  reason?: string
): { success: boolean; cancelledCount: number } => {
  const group = getGroupBookingById(groupId);
  if (!group) return { success: false, cancelledCount: 0 };

  const groupAppointments = getAppointmentsByGroupId(groupId);
  let cancelledCount = 0;

  groupAppointments.forEach(apt => {
    if (apt.status !== 'cancelled' && apt.status !== 'deleted') {
      apt.status = 'cancelled';
      apt.cancellationReason = reason || 'Group booking cancelled';
      apt.cancelledAt = new Date();
      apt.updatedAt = new Date();
      cancelledCount++;
    }
  });

  group.status = 'cancelled';
  group.updatedAt = new Date();

  return { success: true, cancelledCount };
};

/**
 * Check in all participants in a group
 */
export const checkInGroup = (groupId: string): { success: boolean; checkedInCount: number } => {
  const groupAppointments = getAppointmentsByGroupId(groupId);
  let checkedInCount = 0;

  groupAppointments.forEach(apt => {
    if (apt.status === 'scheduled' || apt.status === 'confirmed') {
      apt.status = 'arrived';
      apt.arrivalTime = new Date();
      apt.updatedAt = new Date();
      checkedInCount++;
    }
  });

  return { success: true, checkedInCount };
};

/**
 * Get group bookings for a specific date
 */
export const getGroupBookingsForDate = (date: Date): GroupBooking[] => {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  return groupBookings.filter(group => {
    const groupDate = new Date(group.date);
    groupDate.setHours(0, 0, 0, 0);
    return groupDate.getTime() === targetDate.getTime() && group.status !== 'cancelled';
  });
};

/**
 * Get groups by coordinator patient ID
 */
export const getGroupsByCoordinator = (patientId: string): GroupBooking[] => {
  return groupBookings.filter(group => group.coordinatorPatientId === patientId);
};
