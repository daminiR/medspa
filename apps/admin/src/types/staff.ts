export type StaffRole = 
  | 'Medical Director'
  | 'Physician'
  | 'Nurse Practitioner'
  | 'Registered Nurse'
  | 'Aesthetician'
  | 'Laser Technician'
  | 'Injection Specialist'
  | 'Front Desk'
  | 'Office Manager'
  | 'Billing Specialist'
  | 'Marketing Coordinator'
  | 'Patient Coordinator';

export type AccessLevel = 
  | 'No Access'
  | 'Practitioner Limited'
  | 'Practitioner + Front Desk'
  | 'Practitioner + Front Desk (All Locations)'
  | 'Front Desk Only'
  | 'Administrative/Billing'
  | 'Full Access'
  | 'Account Owner';

export type StaffStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';

export type Specialization = 
  | 'Botox/Dysport'
  | 'Dermal Fillers'
  | 'Laser Hair Removal'
  | 'IPL/BBL'
  | 'Chemical Peels'
  | 'Microneedling'
  | 'Body Contouring'
  | 'PRP/PRF'
  | 'Skin Resurfacing'
  | 'Medical-Grade Facials';

export type ShiftType = 'morning' | 'afternoon' | 'evening' | 'full_day' | 'split';

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  certificationNumber: string;
}

export interface License {
  id: string;
  type: string;
  number: string;
  state: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending_renewal';
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Commission {
  serviceCategory: string;
  rate: number;
  type: 'percentage' | 'fixed';
}

// Notification preferences for staff members
export interface NotificationPreferences {
  // Appointment notifications
  newAppointmentEmail: boolean;
  newAppointmentSms: boolean;
  newAppointmentPush: boolean;
  appointmentCancelledEmail: boolean;
  appointmentCancelledSms: boolean;
  appointmentCancelledPush: boolean;
  appointmentRescheduledEmail: boolean;
  appointmentRescheduledPush: boolean;
  // Daily updates
  dailyScheduleSummary: boolean;
  patientArrivals: boolean;
  // Messages
  newMessagePush: boolean;
  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart: string; // e.g., "21:00"
  quietHoursEnd: string;   // e.g., "07:00"
}

// Service assignment for a staff member
export interface ServiceAssignment {
  serviceId: string;
  serviceName: string;
  category: string;
  enabled: boolean;
  customDuration?: number; // in minutes, overrides default
  customPrice?: number; // overrides default
  defaultDuration: number;
  defaultPrice: number;
  requiresCertification?: string; // certification required to perform
}

// Granular permissions (Mangomint-style)
export interface StaffPermissions {
  // Calendar permissions
  viewOwnCalendar: boolean;
  editOwnCalendar: boolean;
  viewAllCalendars: boolean;
  editAllCalendars: boolean;
  manageTimeBlocks: boolean;
  manageWaitlist: boolean;
  // Client permissions
  viewClientContactDetails: boolean;
  viewClientHistory: boolean;
  editClientRecords: boolean;
  // Sales permissions
  viewOwnSales: boolean;
  viewAllSales: boolean;
  processCheckout: boolean;
  processRefunds: boolean;
  reopenSales: boolean;
  accessCashDrawer: boolean;
  // Messages permissions
  viewOwnMessages: boolean;
  viewAllMessages: boolean;
  sendMessages: boolean;
  // Reporting
  viewReports: boolean;
  exportReports: boolean;
  // Products & inventory
  manageProducts: boolean;
  managePurchaseOrders: boolean;
  // Gift cards & memberships
  manageGiftCards: boolean;
  manageMemberships: boolean;
  // Administrative
  manageStaff: boolean;
  manageServices: boolean;
  manageSettings: boolean;
  accessBilling: boolean;
  // Time clock
  useTimeClock: boolean;
  manageTimeCards: boolean;
  // Forms
  viewFormSubmissions: boolean;
  viewAllFormSubmissions: boolean;
  manageFormTemplates: boolean;
}

export interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  location: string;
  room?: string;
  isRecurring: boolean;
}

export interface TimeOff {
  id: string;
  type: 'vacation' | 'sick' | 'personal' | 'training';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'denied';
  reason?: string;
  approvedBy?: string;
  approvedDate?: string;
}

export interface PerformanceMetrics {
  servicesPerformed: number;
  revenueGenerated: number;
  clientRetentionRate: number;
  averageRating: number;
  rebookingRate: number;
  productSalesTotal: number;
  utilizationRate: number;
}

export interface StaffMember {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  pronouns?: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  profilePhoto?: string;

  role: StaffRole;
  accessLevel: AccessLevel;
  status: StaffStatus;
  specializations: Specialization[];

  // New fields for enhanced staff management
  isServiceProvider: boolean; // Can they provide services? (affects subscription count)
  availableInOnlineBooking: boolean; // Show in online booking?
  permissions?: StaffPermissions; // Granular permissions
  notificationPreferences?: NotificationPreferences;
  serviceAssignments?: ServiceAssignment[];
  
  hireDate: string;
  birthDate?: string;
  
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  
  emergencyContact: EmergencyContact;
  
  bio?: string;
  qualifications: string[];
  languages: string[];
  
  licenses: License[];
  certifications: Certification[];
  
  locations: string[];
  primaryLocation: string;
  
  schedules: Schedule[];
  timeOffRequests: TimeOff[];
  
  commission: Commission[];
  hourlyRate?: number;
  salary?: number;
  
  performanceMetrics?: PerformanceMetrics;
  
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    expiryDate: string;
  };
  
  deaNumber?: string;
  npiNumber?: string;
  
  directReports?: string[];
  reportsTo?: string;
  
  onboardingCompleted: boolean;
  lastTrainingDate?: string;
  nextReviewDate?: string;
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffListItem {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  role: StaffRole;
  status: StaffStatus;
  primaryLocation: string;
  specializations: Specialization[];
  nextShift?: {
    date: string;
    startTime: string;
    endTime: string;
    location: string;
  };
  rating?: number;
  utilizationRate?: number;
}

export interface StaffFilter {
  search?: string;
  status?: StaffStatus[];
  roles?: StaffRole[];
  locations?: string[];
  specializations?: Specialization[];
  accessLevels?: AccessLevel[];
}

export interface StaffScheduleView {
  staffId: string;
  staffName: string;
  profilePhoto?: string;
  role: StaffRole;
  schedules: {
    date: string;
    shifts: {
      id: string;
      startTime: string;
      endTime: string;
      type: ShiftType;
      location: string;
      room?: string;
      appointments?: number;
      availability: 'available' | 'partially_booked' | 'fully_booked';
    }[];
  }[];
}