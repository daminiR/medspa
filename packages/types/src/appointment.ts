/**
 * Appointment Types
 */

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  serviceId: string;
  locationId: string;

  // Service details
  serviceName: string;
  serviceCategory: string;

  // Provider details
  providerName: string;
  providerTitle?: string;

  // Location details
  locationName: string;
  locationAddress: string;

  // Timing
  startTime: string;
  endTime: string;
  duration: number; // minutes
  timezone: string;

  // Status
  status: AppointmentStatus;
  confirmedAt?: string;
  checkedInAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;

  // Booking
  bookedAt: string;
  bookedBy: 'patient' | 'staff';
  bookingSource: 'app' | 'web' | 'phone' | 'walk_in';

  // Payment
  price: number;
  depositRequired: boolean;
  depositAmount?: number;
  depositPaid: boolean;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';

  // Notes
  patientNotes?: string;
  staffNotes?: string;

  // Reminders
  remindersSent: AppointmentReminder[];

  // Wallet
  walletPassId?: string;

  // Related
  beforePhotoIds?: string[];
  afterPhotoIds?: string[];

  createdAt: string;
  updatedAt: string;
}

export interface AppointmentReminder {
  type: 'email' | 'sms' | 'push';
  sentAt: string;
  scheduledFor: string;
}

export interface AppointmentSlot {
  startTime: string;
  endTime: string;
  providerId: string;
  providerName: string;
  available: boolean;
}

export interface BookingRequest {
  serviceId: string;
  providerId?: string;
  locationId: string;
  startTime: string;
  patientNotes?: string;
}

export interface RescheduleRequest {
  appointmentId: string;
  newStartTime: string;
  reason?: string;
}

export interface CancellationRequest {
  appointmentId: string;
  reason: string;
}
