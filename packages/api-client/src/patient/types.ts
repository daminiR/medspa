/**
 * Patient Portal API Types
 * Type definitions for patient portal API requests and responses
 */

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    validationErrors?: Array<{
      field: string;
      message: string;
    }>;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// Authentication Types
// ============================================================================

export interface RegisterRequest {
  email: string;
  phone?: string;
  password?: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  referralCode?: string;
  marketingOptIn?: boolean;
  smsOptIn?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  patient: PatientProfile | null;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

// ============================================================================
// Patient Profile Types
// ============================================================================

export interface PatientProfile {
  id: string;
  referralCode?: string;
  availableCredits?: number;
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
  emergencyContact?: EmergencyContact;
  address?: Address;
  preferredLocationId?: string;
  preferredProviderId?: string;
  marketingOptIn?: boolean;
  smsOptIn?: boolean;
  membershipId?: string;
}

export interface EmergencyContact {
  name: string;
  phone?: string;
  relationship?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
  addressCountry?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  preferredLocationId?: string;
  preferredProviderId?: string;
  marketingOptIn?: boolean;
  smsOptIn?: boolean;
  allergies?: string[];
  medications?: string[];
  conditions?: string[];
}

// ============================================================================
// Appointment Types
// ============================================================================

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  serviceId?: string;
  locationId: string;
  serviceName: string;
  serviceCategory: string;
  providerName: string;
  providerTitle?: string;
  locationName: string;
  locationAddress: string;
  startTime: string;
  endTime: string;
  duration: number;
  timezone: string;
  status: AppointmentStatus;
  confirmedAt?: string;
  checkedInAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  bookedAt: string;
  bookedBy: 'patient' | 'staff';
  bookingSource: string;
  price: number;
  depositRequired: boolean;
  depositAmount?: number;
  depositPaid: boolean;
  paymentStatus: string;
  patientNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookAppointmentRequest {
  serviceId: string;
  providerId?: string;
  locationId: string;
  startTime: string;
  patientNotes?: string;
  paymentMethodId?: string;
}

export interface RescheduleRequest {
  newStartTime: string;
  reason?: string;
}

export interface CancelRequest {
  reason: string;
}

export interface AppointmentSlot {
  startTime: string;
  endTime: string;
  providerId: string;
  providerName: string;
  available: boolean;
}

export interface AvailableSlotsResponse {
  date: string;
  service: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
  location: {
    id: string;
    name: string;
    address?: string;
  } | null;
  providers: Array<{
    id: string;
    name: string;
    title?: string;
  }>;
  slots: AppointmentSlot[];
  availableCount: number;
  totalCount: number;
}

// ============================================================================
// Payment Types
// ============================================================================

export type PaymentMethodType =
  | 'card'
  | 'bank_account'
  | 'hsa'
  | 'fsa'
  | 'apple_pay'
  | 'google_pay';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  cardBrand?: string;
  cardLast4?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  bankName?: string;
  bankLast4?: string;
  hsaFsaProvider?: string;
  hsaFsaAccountLast4?: string;
  hsaFsaVerified?: boolean;
  isDefault: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddPaymentMethodRequest {
  type: 'CARD' | 'BANK_ACCOUNT' | 'HSA' | 'FSA' | 'APPLE_PAY' | 'GOOGLE_PAY';
  stripePaymentMethodId?: string;
  setDefault?: boolean;
}

export interface ProcessPaymentRequest {
  appointmentId?: string;
  invoiceId?: string;
  paymentMethodId: string;
  amount: number;
  tip?: number;
  isHsaFsa?: boolean;
}

export interface Payment {
  id: string;
  amount: number;
  tip?: number;
  totalAmount: number;
  currency: string;
  status: string;
  isHsaFsa: boolean;
  hsaFsaEligibleAmount?: number;
  receiptUrl?: string;
  createdAt: string;
}

// ============================================================================
// Referral Types
// ============================================================================

export type ReferralStatus =
  | 'PENDING'
  | 'SIGNED_UP'
  | 'FIRST_VISIT'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface ReferralProgram {
  id: string;
  userId: string;
  referralCode: string;
  shareUrl: string;
  totalReferrals: number;
  pendingReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  availableCredits: number;
  milestones: ReferralMilestone[];
  rewards: {
    referrerReward: number;
    refereeReward: number;
    refereeMinimumSpend: number;
    referralExpiration: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReferralMilestone {
  id: string;
  count: number;
  title: string;
  description: string;
  reward: number;
  icon: string;
  achieved: boolean;
  achievedAt?: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId?: string;
  refereeName?: string;
  refereeEmail?: string;
  status: ReferralStatus;
  referrerReward: number;
  refereeReward: number;
  statusChangedAt?: string;
  firstAppointmentDate?: string;
  completedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShareReferralRequest {
  method: 'SMS' | 'EMAIL' | 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'TWITTER' | 'COPY';
  recipients?: string[];
  message?: string;
}

export interface ApplyReferralCodeRequest {
  code: string;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface NotificationPreferences {
  enabled: boolean;
  appointmentReminders: boolean;
  appointmentReminder24h: boolean;
  appointmentReminder2h: boolean;
  promotions: boolean;
  rewards: boolean;
  messages: boolean;
  sound: boolean;
  badge: boolean;
  vibration: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface RegisterPushTokenRequest {
  token: string;
  platform: 'IOS' | 'ANDROID' | 'WEB';
  deviceModel?: string;
  deviceOS?: string;
}
