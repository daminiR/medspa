// Centralized data source for user/patient/practitioner information
// Single source of truth for all user-related data
import { Shift } from '@/types/calendar'
import { User, UserRole, UserStatus, UserFormData, UserFilter } from '@/types/users'
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

  // NEW: Booking Type & Check-In Time (Walk-In Support)
  bookingType?: 'scheduled' | 'walk_in' | 'express_booking' | 'from_waitlist';
  checkInTime?: Date; // When patient checked in (especially for walk-ins)

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
  // SMS tracking
  confirmationSentAt?: Date;
  reminderSentAt?: Date;
  smsConfirmedAt?: Date;
  checkedInAt?: Date;
}

// Activity log for group bookings
export type GroupActivityType =
  | 'created'
  | 'participant_added'
  | 'participant_removed'
  | 'sms_sent'
  | 'checked_in'
  | 'check_in_all'
  | 'payment_updated'
  | 'rescheduled'
  | 'cancelled'
  | 'notes_updated'
  | 'status_changed';

export interface GroupBookingActivity {
  id: string;
  groupBookingId: string;
  type: GroupActivityType;
  description: string;
  performedBy: string; // User ID or name
  performedAt: Date;
  metadata?: {
    participantId?: string;
    participantName?: string;
    smsType?: string;
    oldValue?: string;
    newValue?: string;
  };
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

  // SMS tracking at group level
  confirmationSentAt?: Date;
  reminderSentAt?: Date;
  lastSmsType?: 'confirmation' | 'reminder' | 'checkin' | 'cancellation';
  lastSmsSentAt?: Date;

  // Activity history (embedded for simplicity)
  activities?: GroupBookingActivity[];
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

  // Deposit/Payment settings
  depositRequired?: boolean;
  depositAmount?: number;
}

export interface Break {
  id: string;
  practitionerId: string;
  practitionerName: string;
  type: 'lunch' | 'personal' | 'meeting' | 'training' | 'out_of_office' | 'other';
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  isRecurring: boolean;
  recurringDays?: number[]; // 0-6 (Sunday-Saturday)
  availableForEmergencies?: boolean;
  notes?: string;
}

// Time block color scheme by type
export const BREAK_COLORS: Record<Break['type'], { bg: string; stripe: string; label: string }> = {
  lunch: { bg: '#FFE0B2', stripe: '#FFB74D', label: 'Lunch' },           // Orange
  meeting: { bg: '#BBDEFB', stripe: '#64B5F6', label: 'Meeting' },       // Blue
  personal: { bg: '#E1BEE7', stripe: '#BA68C8', label: 'Personal' },     // Purple
  out_of_office: { bg: '#FFCDD2', stripe: '#E57373', label: 'Out of Office' }, // Red
  training: { bg: '#C8E6C9', stripe: '#81C784', label: 'Training' },     // Green
  other: { bg: '#E0E0E0', stripe: '#9E9E9E', label: 'Other' }            // Gray
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
      resourcePoolId: 'pool-1'
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
 * Add an activity entry to a group booking
 */
export const addGroupActivity = (
  groupId: string,
  type: GroupActivityType,
  description: string,
  performedBy: string = 'System',
  metadata?: GroupBookingActivity['metadata']
): void => {
  const group = groupBookings.find(g => g.id === groupId);
  if (!group) return;

  const activity: GroupBookingActivity = {
    id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    groupBookingId: groupId,
    type,
    description,
    performedBy,
    performedAt: new Date(),
    metadata
  };

  if (!group.activities) {
    group.activities = [];
  }
  group.activities.unshift(activity); // Add to beginning (newest first)
  group.updatedAt = new Date();
};

/**
 * Get activity history for a group booking
 */
export const getGroupActivities = (groupId: string): GroupBookingActivity[] => {
  const group = groupBookings.find(g => g.id === groupId);
  return group?.activities || [];
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

  // Initialize activities array with creation event
  group.activities = [{
    id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    groupBookingId: groupId,
    type: 'created',
    description: `Group booking created with ${participantCount} participants`,
    performedBy: groupData.createdBy || 'System',
    performedAt: new Date()
  }];

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

  // Log cancellation activity
  addGroupActivity(
    groupId,
    'cancelled',
    `Group booking cancelled. ${cancelledCount} appointments affected.${reason ? ` Reason: ${reason}` : ''}`,
    'Current User'
  );

  return { success: true, cancelledCount };
};

/**
 * Check in all participants in a group
 */
export const checkInGroup = (groupId: string): { success: boolean; checkedInCount: number } => {
  const groupAppointments = getAppointmentsByGroupId(groupId);
  const group = getGroupBookingById(groupId);
  let checkedInCount = 0;
  const checkedInNames: string[] = [];

  groupAppointments.forEach(apt => {
    if (apt.status === 'scheduled' || apt.status === 'confirmed') {
      apt.status = 'arrived';
      apt.arrivalTime = new Date();
      apt.updatedAt = new Date();
      checkedInCount++;
      checkedInNames.push(apt.patientName);
    }
  });

  // Also update participant status in group
  if (group) {
    group.participants.forEach(p => {
      if (p.status === 'pending' || p.status === 'confirmed') {
        p.status = 'arrived';
        p.checkedInAt = new Date();
      }
    });

    // Log activity
    addGroupActivity(
      groupId,
      'check_in_all',
      `All ${checkedInCount} participants checked in`,
      'Current User'
    );
  }

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

/**
 * Get all group bookings with optional filters
 */
export const getAllGroupBookings = (filters?: {
  status?: GroupBookingStatus;
  startDate?: Date;
  endDate?: Date;
  locationId?: string;
}): GroupBooking[] => {
  let result = [...groupBookings];

  if (filters?.status) {
    result = result.filter(g => g.status === filters.status);
  }

  if (filters?.startDate) {
    const start = new Date(filters.startDate);
    start.setHours(0, 0, 0, 0);
    result = result.filter(g => new Date(g.date) >= start);
  }

  if (filters?.endDate) {
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);
    result = result.filter(g => new Date(g.date) <= end);
  }

  if (filters?.locationId) {
    result = result.filter(g => g.locationId === filters.locationId);
  }

  // Sort by date descending (most recent first)
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Update a group booking
 */
export const updateGroupBooking = (
  groupId: string,
  updates: Partial<Pick<GroupBooking, 'name' | 'notes' | 'paymentMode' | 'paymentStatus'>>
): GroupBooking | null => {
  const groupIndex = groupBookings.findIndex(g => g.id === groupId);
  if (groupIndex === -1) return null;

  const group = groupBookings[groupIndex];

  if (updates.name !== undefined) group.name = updates.name;
  if (updates.notes !== undefined) group.notes = updates.notes;
  if (updates.paymentMode !== undefined) group.paymentMode = updates.paymentMode;
  if (updates.paymentStatus !== undefined) group.paymentStatus = updates.paymentStatus;

  group.updatedAt = new Date();

  return group;
};

/**
 * Record that an SMS was sent to a group
 */
export const recordGroupSms = (
  groupId: string,
  smsType: 'confirmation' | 'reminder' | 'checkin' | 'cancellation',
  recipientCount: number
): void => {
  const group = getGroupBookingById(groupId);
  if (!group) return;

  const now = new Date();
  group.lastSmsType = smsType;
  group.lastSmsSentAt = now;
  group.updatedAt = now;

  // Update specific tracking fields
  if (smsType === 'confirmation') {
    group.confirmationSentAt = now;
  } else if (smsType === 'reminder') {
    group.reminderSentAt = now;
  }

  // Log activity
  const smsTypeLabels = {
    confirmation: 'Confirmation',
    reminder: 'Reminder',
    checkin: 'Check-in request',
    cancellation: 'Cancellation'
  };

  addGroupActivity(
    groupId,
    'sms_sent',
    `${smsTypeLabels[smsType]} SMS sent to ${recipientCount} recipient(s)`,
    'Current User',
    { smsType }
  );
};

/**
 * Add a participant to an existing group booking
 */
export const addParticipantToGroup = (
  groupId: string,
  participant: Omit<GroupBookingParticipant, 'appointmentId' | 'status' | 'paymentStatus'>
): { success: boolean; appointment?: Appointment; error?: string } => {
  const group = getGroupBookingById(groupId);
  if (!group) return { success: false, error: 'Group not found' };
  if (group.status === 'cancelled') return { success: false, error: 'Cannot add to cancelled group' };

  // Check if participant is already in group
  if (group.participants.some(p => p.patientId === participant.patientId)) {
    return { success: false, error: 'Participant already in group' };
  }

  // Create new participant
  const newParticipant: GroupBookingParticipant = {
    ...participant,
    status: 'pending',
    paymentStatus: 'pending'
  };

  // Create appointment for the new participant
  const appointmentId = `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const position = group.participants.length + 1;

  const newAppointment: Appointment = {
    id: appointmentId,
    patientId: participant.patientId,
    patientName: participant.patientName,
    serviceName: participant.serviceName,
    serviceCategory: 'aesthetics',
    practitionerId: participant.practitionerId,
    startTime: participant.startTime,
    endTime: participant.endTime,
    status: 'scheduled',
    color: '#8B5CF6',
    duration: participant.duration,
    phone: participant.phone,
    email: participant.email,
    createdAt: new Date(),
    updatedAt: new Date(),
    roomId: participant.roomId,
    groupBookingId: groupId,
    isGroupCoordinator: false,
    groupPosition: position,
    individualPaymentStatus: 'pending'
  };

  // Update participant with appointmentId
  newParticipant.appointmentId = appointmentId;

  // Add to group
  group.participants.push(newParticipant);

  // Recalculate pricing
  const newTotal = group.participants.reduce((sum, p) => sum + p.servicePrice, 0);
  const newDiscount = calculateGroupDiscount(group.participants.length);
  group.totalOriginalPrice = newTotal;
  group.discountPercent = newDiscount;
  group.totalDiscountAmount = (newTotal * newDiscount) / 100;
  group.totalDiscountedPrice = newTotal - group.totalDiscountAmount;
  group.updatedAt = new Date();

  // Add appointment to global list
  appointments.push(newAppointment);

  return { success: true, appointment: newAppointment };
};

/**
 * Remove a participant from a group booking
 */
export const removeParticipantFromGroup = (
  groupId: string,
  patientId: string
): { success: boolean; error?: string } => {
  const group = getGroupBookingById(groupId);
  if (!group) return { success: false, error: 'Group not found' };

  // Can't remove coordinator
  if (patientId === group.coordinatorPatientId) {
    return { success: false, error: 'Cannot remove coordinator. Cancel the group instead.' };
  }

  // Find participant
  const participantIndex = group.participants.findIndex(p => p.patientId === patientId);
  if (participantIndex === -1) return { success: false, error: 'Participant not found in group' };

  const participant = group.participants[participantIndex];

  // Cancel the associated appointment
  if (participant.appointmentId) {
    const aptIndex = appointments.findIndex(a => a.id === participant.appointmentId);
    if (aptIndex !== -1) {
      appointments[aptIndex].status = 'cancelled';
      appointments[aptIndex].cancellationReason = 'Removed from group booking';
      appointments[aptIndex].cancelledAt = new Date();
      appointments[aptIndex].updatedAt = new Date();
    }
  }

  // Remove from group
  group.participants.splice(participantIndex, 1);

  // Check if group still has minimum participants
  if (group.participants.length < 2) {
    // Automatically cancel the group if below minimum
    cancelGroupBooking(groupId, 'Group below minimum participants');
    return { success: true, error: 'Group cancelled - below minimum participants' };
  }

  // Recalculate pricing
  const newTotal = group.participants.reduce((sum, p) => sum + p.servicePrice, 0);
  const newDiscount = calculateGroupDiscount(group.participants.length);
  group.totalOriginalPrice = newTotal;
  group.discountPercent = newDiscount;
  group.totalDiscountAmount = (newTotal * newDiscount) / 100;
  group.totalDiscountedPrice = newTotal - group.totalDiscountAmount;
  group.updatedAt = new Date();

  // Update positions for remaining participants
  group.participants.forEach((p, index) => {
    if (p.appointmentId) {
      const apt = appointments.find(a => a.id === p.appointmentId);
      if (apt) {
        apt.groupPosition = index + 1;
        apt.updatedAt = new Date();
      }
    }
  });

  return { success: true };
};

/**
 * Reschedule a participant in a group booking
 */
export const rescheduleGroupParticipant = (
  groupId: string,
  patientId: string,
  newStartTime: Date,
  newEndTime: Date
): { success: boolean; error?: string } => {
  const group = getGroupBookingById(groupId);
  if (!group) return { success: false, error: 'Group not found' };

  const participant = group.participants.find(p => p.patientId === patientId);
  if (!participant) return { success: false, error: 'Participant not found in group' };

  // Update participant times
  participant.startTime = newStartTime;
  participant.endTime = newEndTime;

  // Update associated appointment
  if (participant.appointmentId) {
    const apt = appointments.find(a => a.id === participant.appointmentId);
    if (apt) {
      apt.startTime = newStartTime;
      apt.endTime = newEndTime;
      apt.updatedAt = new Date();
    }
  }

  group.updatedAt = new Date();
  return { success: true };
};

/**
 * Reschedule entire group to a new date
 */
export const rescheduleGroup = (
  groupId: string,
  newDate: Date,
  preserveTimeOffsets: boolean = true
): { success: boolean; error?: string } => {
  const group = getGroupBookingById(groupId);
  if (!group) return { success: false, error: 'Group not found' };

  const oldDate = new Date(group.date);
  const dayDiff = Math.floor((newDate.getTime() - oldDate.getTime()) / (1000 * 60 * 60 * 24));

  // Update each participant's times
  group.participants.forEach(participant => {
    const newStart = new Date(participant.startTime);
    newStart.setDate(newStart.getDate() + dayDiff);

    const newEnd = new Date(participant.endTime);
    newEnd.setDate(newEnd.getDate() + dayDiff);

    participant.startTime = newStart;
    participant.endTime = newEnd;

    // Update associated appointment
    if (participant.appointmentId) {
      const apt = appointments.find(a => a.id === participant.appointmentId);
      if (apt) {
        apt.startTime = newStart;
        apt.endTime = newEnd;
        apt.updatedAt = new Date();
      }
    }
  });

  group.date = newDate;
  group.updatedAt = new Date();

  return { success: true };
};

/**
 * Update individual participant check-in status
 */
export const checkInGroupParticipant = (
  groupId: string,
  patientId: string
): { success: boolean; error?: string } => {
  const group = getGroupBookingById(groupId);
  if (!group) return { success: false, error: 'Group not found' };

  const participant = group.participants.find(p => p.patientId === patientId);
  if (!participant) return { success: false, error: 'Participant not found' };

  participant.status = 'arrived';

  // Update associated appointment
  if (participant.appointmentId) {
    const apt = appointments.find(a => a.id === participant.appointmentId);
    if (apt) {
      apt.status = 'arrived';
      apt.arrivalTime = new Date();
      apt.updatedAt = new Date();
    }
  }

  // Check if all participants have arrived
  const allArrived = group.participants.every(p => p.status === 'arrived' || p.status === 'completed');
  if (allArrived) {
    group.status = 'confirmed';
  } else {
    group.status = 'partially_confirmed';
  }

  group.updatedAt = new Date();
  return { success: true };
};

/**
 * Update individual participant payment status
 */
export const updateParticipantPaymentStatus = (
  groupId: string,
  patientId: string,
  paymentStatus: 'pending' | 'paid'
): { success: boolean; error?: string } => {
  const group = getGroupBookingById(groupId);
  if (!group) return { success: false, error: 'Group not found' };

  const participant = group.participants.find(p => p.patientId === patientId);
  if (!participant) return { success: false, error: 'Participant not found' };

  participant.paymentStatus = paymentStatus;

  // Update associated appointment
  if (participant.appointmentId) {
    const apt = appointments.find(a => a.id === participant.appointmentId);
    if (apt) {
      apt.individualPaymentStatus = paymentStatus;
      apt.updatedAt = new Date();
    }
  }

  // Update group payment status
  const allPaid = group.participants.every(p => p.paymentStatus === 'paid');
  const somePaid = group.participants.some(p => p.paymentStatus === 'paid');

  if (allPaid) {
    group.paymentStatus = 'paid';
  } else if (somePaid) {
    group.paymentStatus = 'partial';
  } else {
    group.paymentStatus = 'pending';
  }

  group.updatedAt = new Date();
  return { success: true };
};

// ============================================================================
// USER MANAGEMENT DATA
// ============================================================================

// Mock users data
export const users: User[] = [
  {
    id: 'user-1',
    firstName: 'Amanda',
    lastName: 'Reynolds',
    email: 'amanda@luxemedicalspa.com',
    phone: '(555) 100-0001',
    role: 'Owner',
    status: 'active',
    lastLogin: new Date(2024, 11, 14, 9, 30),
    createdAt: new Date(2023, 0, 1),
    updatedAt: new Date(2024, 11, 14),
    locationIds: ['loc-1', 'loc-2', 'loc-3'],
  },
  {
    id: 'user-2',
    firstName: 'David',
    lastName: 'Chen',
    email: 'david@luxemedicalspa.com',
    phone: '(555) 100-0002',
    role: 'Admin',
    status: 'active',
    lastLogin: new Date(2024, 11, 14, 8, 15),
    createdAt: new Date(2023, 2, 15),
    updatedAt: new Date(2024, 11, 14),
    locationIds: ['loc-1', 'loc-2', 'loc-3'],
  },
  {
    id: 'user-3',
    firstName: 'Susan',
    lastName: 'Lo',
    email: 'susan@luxemedicalspa.com',
    phone: '(555) 100-0003',
    role: 'Provider',
    status: 'active',
    lastLogin: new Date(2024, 11, 13, 17, 45),
    createdAt: new Date(2023, 3, 1),
    updatedAt: new Date(2024, 11, 13),
    locationIds: ['loc-1'],
  },
  {
    id: 'user-4',
    firstName: 'Marcus',
    lastName: 'Gregory',
    email: 'marcus@luxemedicalspa.com',
    phone: '(555) 100-0004',
    role: 'Provider',
    status: 'active',
    lastLogin: new Date(2024, 11, 12, 14, 20),
    createdAt: new Date(2023, 4, 10),
    updatedAt: new Date(2024, 11, 12),
    locationIds: ['loc-1', 'loc-2'],
  },
  {
    id: 'user-5',
    firstName: 'Emily',
    lastName: 'Martinez',
    email: 'emily@luxemedicalspa.com',
    phone: '(555) 100-0005',
    role: 'Manager',
    status: 'active',
    lastLogin: new Date(2024, 11, 14, 7, 50),
    createdAt: new Date(2023, 5, 20),
    updatedAt: new Date(2024, 11, 14),
    locationIds: ['loc-1'],
  },
  {
    id: 'user-6',
    firstName: 'Jennifer',
    lastName: 'Williams',
    email: 'jennifer@luxemedicalspa.com',
    phone: '(555) 100-0006',
    role: 'Front Desk',
    status: 'active',
    lastLogin: new Date(2024, 11, 14, 8, 0),
    createdAt: new Date(2023, 6, 15),
    updatedAt: new Date(2024, 11, 14),
    locationIds: ['loc-1'],
  },
  {
    id: 'user-7',
    firstName: 'Robert',
    lastName: 'Kim',
    email: 'robert@luxemedicalspa.com',
    phone: '(555) 100-0007',
    role: 'Billing',
    status: 'active',
    lastLogin: new Date(2024, 11, 13, 16, 30),
    createdAt: new Date(2023, 7, 1),
    updatedAt: new Date(2024, 11, 13),
    locationIds: ['loc-1', 'loc-2', 'loc-3'],
  },
  {
    id: 'user-8',
    firstName: 'Sarah',
    lastName: 'Thompson',
    email: 'sarah.t@luxemedicalspa.com',
    phone: '(555) 100-0008',
    role: 'Front Desk',
    status: 'inactive',
    lastLogin: new Date(2024, 8, 15, 17, 0),
    createdAt: new Date(2023, 8, 10),
    updatedAt: new Date(2024, 9, 1),
    locationIds: ['loc-2'],
  },
  {
    id: 'user-9',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.b@luxemedicalspa.com',
    phone: '(555) 100-0009',
    role: 'Provider',
    status: 'active',
    lastLogin: new Date(2024, 11, 11, 10, 15),
    createdAt: new Date(2023, 9, 5),
    updatedAt: new Date(2024, 11, 11),
    locationIds: ['loc-2', 'loc-3'],
  },
  {
    id: 'user-10',
    firstName: 'Lisa',
    lastName: 'Anderson',
    email: 'lisa@luxemedicalspa.com',
    phone: '(555) 100-0010',
    role: 'Manager',
    status: 'active',
    lastLogin: new Date(2024, 11, 14, 9, 0),
    createdAt: new Date(2023, 10, 15),
    updatedAt: new Date(2024, 11, 14),
    locationIds: ['loc-2'],
  },
];

// User management utility functions
export const getAllUsers = (): User[] => {
  return [...users];
};

export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const getUsersByRole = (role: UserRole): User[] => {
  return users.filter(user => user.role === role);
};

export const getActiveUsers = (): User[] => {
  return users.filter(user => user.status === 'active');
};

export const filterUsers = (filters: UserFilter): User[] => {
  let result = [...users];

  if (filters.search) {
    const query = filters.search.toLowerCase();
    result = result.filter(user =>
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }

  if (filters.role && filters.role !== 'all') {
    result = result.filter(user => user.role === filters.role);
  }

  if (filters.status && filters.status !== 'all') {
    result = result.filter(user => user.status === filters.status);
  }

  return result;
};

export const addUser = (data: UserFormData): User => {
  const newUser: User = {
    id: `user-${Date.now()}`,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
    locationIds: ['loc-1'], // Default location
  };
  users.push(newUser);
  return newUser;
};

export const updateUser = (id: string, data: Partial<UserFormData>): User | null => {
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) return null;

  users[userIndex] = {
    ...users[userIndex],
    ...data,
    updatedAt: new Date(),
  };

  return users[userIndex];
};

export const deleteUser = (id: string): boolean => {
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex === -1) return false;

  users.splice(userIndex, 1);
  return true;
};

export const toggleUserStatus = (id: string): User | null => {
  const user = users.find(u => u.id === id);
  if (!user) return null;

  user.status = user.status === 'active' ? 'inactive' : 'active';
  user.updatedAt = new Date();

  return user;
};

// ============================================
// RESCHEDULE INTELLIGENCE HELPERS
// ============================================

/**
 * Normalize phone number for comparison
 * Handles: (555) 123-4567, 555-123-4567, 5551234567, +15551234567
 */
const normalizePhone = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  // Handle US country code
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1);
  }
  return digits;
};

/**
 * Find the next upcoming appointment for a phone number
 * Returns the soonest scheduled/confirmed appointment that hasn't started yet
 */
export const findUpcomingAppointmentByPhone = (phone: string): Appointment | undefined => {
  const normalizedPhone = normalizePhone(phone);
  const now = new Date();

  // Find all upcoming appointments for this phone number
  const upcomingAppointments = appointments
    .filter(apt => {
      // Match by phone (normalize both)
      const aptPhone = apt.phone ? normalizePhone(apt.phone) : '';
      const phoneMatch = aptPhone === normalizedPhone;

      // Only scheduled or confirmed appointments
      const validStatus = apt.status === 'scheduled' || apt.status === 'confirmed';

      // Must be in the future
      const isFuture = new Date(apt.startTime) > now;

      return phoneMatch && validStatus && isFuture;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return upcomingAppointments[0];
};

/**
 * Get available time slots for a provider on a specific date
 * Returns slots based on their shift schedule minus booked appointments
 */
export const getProviderAvailability = (
  practitionerId: string,
  date: Date,
  slotDurationMinutes: number = 30
): Array<{ startTime: Date; endTime: Date; available: boolean }> => {
  const slots: Array<{ startTime: Date; endTime: Date; available: boolean }> = [];

  // Get the day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = date.getDay();

  // Find provider's shift for this day
  const shift = practitionerShifts.find(
    s => s.practitionerId === practitionerId && s.dayOfWeek === dayOfWeek
  );

  if (!shift) {
    return slots; // Provider doesn't work this day
  }

  // Get all appointments for this provider on this date
  const providerAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.startTime);
    return (
      apt.practitionerId === practitionerId &&
      aptDate.toDateString() === date.toDateString() &&
      apt.status !== 'cancelled' &&
      apt.status !== 'deleted'
    );
  });

  // Generate slots within the shift
  const shiftStart = new Date(date);
  shiftStart.setHours(shift.startHour, shift.startMinute, 0, 0);

  const shiftEnd = new Date(date);
  shiftEnd.setHours(shift.endHour, shift.endMinute, 0, 0);

  let currentTime = new Date(shiftStart);
  const now = new Date();

  while (currentTime < shiftEnd) {
    const slotEnd = new Date(currentTime.getTime() + slotDurationMinutes * 60 * 1000);

    // Skip if slot end goes past shift end
    if (slotEnd > shiftEnd) break;

    // Skip past slots
    if (currentTime < now) {
      currentTime = new Date(currentTime.getTime() + slotDurationMinutes * 60 * 1000);
      continue;
    }

    // Check for conflicts with existing appointments
    const hasConflict = providerAppointments.some(apt => {
      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);
      // Overlap check: slot starts before apt ends AND slot ends after apt starts
      return currentTime < aptEnd && slotEnd > aptStart;
    });

    slots.push({
      startTime: new Date(currentTime),
      endTime: new Date(slotEnd),
      available: !hasConflict
    });

    currentTime = new Date(currentTime.getTime() + slotDurationMinutes * 60 * 1000);
  }

  return slots;
};

/**
 * Get next N available slots for a provider within a date range
 * Useful for offering reschedule options via SMS
 */
export const getNextAvailableSlots = (
  practitionerId: string,
  startDate: Date,
  maxSlots: number = 5,
  daysToSearch: number = 14,
  slotDurationMinutes: number = 30
): Array<{ startTime: Date; endTime: Date; dayLabel: string; timeLabel: string }> => {
  const availableSlots: Array<{ startTime: Date; endTime: Date; dayLabel: string; timeLabel: string }> = [];
  const currentDate = new Date(startDate);

  for (let day = 0; day < daysToSearch && availableSlots.length < maxSlots; day++) {
    const dateToCheck = new Date(currentDate);
    dateToCheck.setDate(currentDate.getDate() + day);

    const daySlots = getProviderAvailability(practitionerId, dateToCheck, slotDurationMinutes);
    const freeSlots = daySlots.filter(slot => slot.available);

    for (const slot of freeSlots) {
      if (availableSlots.length >= maxSlots) break;

      // Format for display
      const dayLabel = slot.startTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const timeLabel = slot.startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

      availableSlots.push({
        startTime: slot.startTime,
        endTime: slot.endTime,
        dayLabel,
        timeLabel
      });
    }
  }

  return availableSlots;
};

/**
 * Reschedule an appointment in-place (matches API pattern)
 * Updates existing appointment with new time rather than creating a new one
 * Returns: { success, appointment, lateFee, isLateReschedule }
 */
export const rescheduleAppointment = (
  appointmentId: string,
  newStartTime: Date,
  reason?: string
): {
  success: boolean;
  appointment?: Appointment;
  lateFee?: number;
  isLateReschedule: boolean;
  error?: string;
} => {
  const appointment = appointments.find(apt => apt.id === appointmentId);

  if (!appointment) {
    return { success: false, isLateReschedule: false, error: 'Appointment not found' };
  }

  // Check if can be rescheduled
  if (appointment.status === 'cancelled' || appointment.status === 'completed') {
    return { success: false, isLateReschedule: false, error: 'Cannot reschedule cancelled or completed appointment' };
  }

  if (appointment.status === 'in_progress' || appointment.status === 'arrived') {
    return { success: false, isLateReschedule: false, error: 'Cannot reschedule appointment in progress' };
  }

  // Calculate new end time based on duration
  const duration = appointment.duration || 30;
  const newEndTime = new Date(newStartTime.getTime() + duration * 60 * 1000);

  // Check for late reschedule (within 24 hours)
  const now = new Date();
  const originalTime = new Date(appointment.startTime);
  const hoursUntilOriginal = (originalTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isLateReschedule = hoursUntilOriginal < 24 && hoursUntilOriginal > 0;

  // Calculate late fee if applicable (25% of service price)
  let lateFee = 0;
  if (isLateReschedule) {
    const service = services.find(s => s.name === appointment.serviceName);
    lateFee = (service?.price || 0) * 0.25;
  }

  // Store original time for notes
  const originalDateStr = originalTime.toLocaleDateString();

  // Update appointment in-place (matching API pattern)
  appointment.startTime = newStartTime;
  appointment.endTime = newEndTime;
  appointment.status = 'scheduled'; // Reset to scheduled
  appointment.updatedAt = new Date();
  appointment.notes = reason
    ? `${appointment.notes || ''}\n[Rescheduled from ${originalDateStr}: ${reason}]`.trim()
    : `${appointment.notes || ''}\n[Rescheduled from ${originalDateStr}]`.trim();

  return {
    success: true,
    appointment,
    lateFee: lateFee > 0 ? lateFee : undefined,
    isLateReschedule
  };
};

/**
 * Check if an appointment would trigger late reschedule fee
 * Returns true if appointment is within 24 hours
 */
export const isLateReschedule = (appointmentId: string): boolean => {
  const appointment = appointments.find(apt => apt.id === appointmentId);
  if (!appointment) return false;

  const now = new Date();
  const originalTime = new Date(appointment.startTime);
  const hoursUntilOriginal = (originalTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  return hoursUntilOriginal < 24 && hoursUntilOriginal > 0;
};
