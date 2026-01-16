/**
 * Waiting Room / Check-In Type Definitions
 * Aligned with admin backend API types
 */

export type WaitingRoomStatus = 'not_arrived' | 'in_car' | 'room_ready' | 'checked_in';

export interface WaitingRoomQueueEntry {
  appointmentId: string;
  patientId: string;
  patientName: string;
  phone: string;
  practitionerId: string;
  practitionerName: string;
  serviceName: string;
  scheduledTime: Date;
  arrivalTime: Date;
  status: WaitingRoomStatus;
  priority: number; // 0 = normal, 1 = VIP, 2 = urgent
  estimatedWaitMinutes?: number;
  position?: number;
  roomReadyNotifiedAt?: Date;
}

export interface CheckInRequest {
  appointmentId?: string;
  phone?: string;
  message?: string;
  groupId?: string;
  patientId?: string;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  appointment?: {
    id: string;
    patientName: string;
    serviceName: string;
    scheduledTime: Date;
    status: string;
    isGroupBooking?: boolean;
    groupName?: string;
    groupArrivedCount?: number;
    groupTotalCount?: number;
  };
  participant?: {
    patientName: string;
    serviceName: string;
    status: string;
  };
  groupStatus?: string;
  error?: string;
}

export interface QueueStatusResponse {
  success: boolean;
  queue: WaitingRoomQueueEntry[];
  totalWaiting: number;
  error?: string;
}

export interface PatientQueueStatus {
  isInQueue: boolean;
  position?: number;
  estimatedWaitMinutes?: number;
  status?: WaitingRoomStatus;
  roomReadyNotifiedAt?: Date;
  queueEntry?: WaitingRoomQueueEntry;
}

export interface AppointmentWithCheckIn {
  id: string;
  service: string;
  provider: string;
  date: Date;
  duration: number;
  location: string;
  price: number;
  status: string;
  canCheckIn: boolean;
  checkInStatus?: WaitingRoomStatus;
  queuePosition?: number;
  estimatedWaitMinutes?: number;
}
