/**
 * Type definitions for Cloud Functions
 * Medical Spa Platform - Event-driven notifications
 */

// Appointment status types
export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'checked_in'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

// Reminder types
export type ReminderType = '24h' | '2h' | 'prep';

// Appointment document structure
export interface AppointmentDocument {
  id: string;
  patientId: string;
  providerId: string;
  locationId: string;
  serviceId: string;
  startTime: FirebaseFirestore.Timestamp;
  endTime: FirebaseFirestore.Timestamp;
  status: AppointmentStatus;
  notes?: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  cancelledAt?: FirebaseFirestore.Timestamp;
  cancelReason?: string;
}

// Patient document structure (subset for notifications)
export interface PatientDocument {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  fcmTokens?: string[]; // Firebase Cloud Messaging tokens
  notificationPreferences?: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    reminderTiming: ReminderType[];
  };
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// Message document structure
export interface MessageDocument {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'patient' | 'staff' | 'system';
  recipientId: string;
  recipientType: 'patient' | 'staff';
  content: string;
  contentType: 'text' | 'image' | 'document';
  status: 'sent' | 'delivered' | 'read';
  createdAt: FirebaseFirestore.Timestamp;
}

// Waiting room queue entry
export interface WaitingRoomEntry {
  patientId: string;
  appointmentId: string;
  checkInTime: FirebaseFirestore.Timestamp;
  status: 'waiting' | 'ready' | 'in_room' | 'completed';
  roomNumber?: string;
  estimatedWaitMinutes?: number;
  updatedAt: FirebaseFirestore.Timestamp;
}

// Notification payload (HIPAA-compliant - no PHI)
export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    type: string;
    appointmentId?: string;
    conversationId?: string;
    actionUrl?: string;
  };
}

// Scheduled task payload
export interface ReminderTaskPayload {
  appointmentId: string;
  patientId: string;
  reminderType: ReminderType;
  scheduledTime: string; // ISO timestamp
  locationId: string;
}

// Cloud Task configuration
export interface TaskConfig {
  projectId: string;
  location: string;
  queue: string;
  serviceAccountEmail: string;
  functionUrl: string;
}
