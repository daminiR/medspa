/**
 * Confirmation Request Types
 * Track appointment confirmation status, response times, and escalation flags
 */

export type ConfirmationStatus = 'pending' | 'confirmed' | 'rescheduled' | 'no_response' | 'cancelled';
export type ConfirmationChannel = 'sms' | 'email' | 'phone' | 'in_person';
export type EscalationLevel = 'none' | 'warning' | 'escalated' | 'follow_up';

export interface ConfirmationRequest {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  serviceName: string;
  practitionerId: string;
  practitionerName: string;
  appointmentStart: Date;
  appointmentEnd: Date;

  // Confirmation tracking
  status: ConfirmationStatus;
  primaryChannel: ConfirmationChannel;
  secondaryChannels?: ConfirmationChannel[];

  // Timing
  sentAt: Date;
  respondedAt?: Date;
  responseTimeMinutes?: number; // null if no response yet
  escalatedAt?: Date;

  // Response details
  responseAction?: 'confirmed' | 'rescheduled' | 'cancelled' | 'no_response';
  responseNotes?: string;

  // Escalation
  escalationLevel: EscalationLevel;
  escalationReason?: string;
  escalationAttempts: number;
  lastEscalationAt?: Date;

  // Flags & Metadata
  isNewPatient: boolean;
  noShowRisk: 'low' | 'medium' | 'high';
  requiresFollowUp: boolean;
  followUpAction?: string;
  followUpScheduledAt?: Date;

  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface ConfirmationResponse {
  id: string;
  confirmationRequestId: string;
  patientId: string;
  appointmentId: string;
  responseType: 'confirmed' | 'rescheduled' | 'cancelled';
  respondedAt: Date;
  responseChannel: ConfirmationChannel;
  responseMessage?: string;
  rescheduledTo?: Date; // If rescheduled
  notes?: string;
}

export interface ConfirmationStats {
  total: number;
  pending: number;
  confirmed: number;
  rescheduled: number;
  noResponse: number;
  cancelled: number;
  averageResponseTimeMinutes: number;
  confirmationRate: number; // percentage
  escalatedCount: number;
  requiresFollowUpCount: number;
}

export interface ConfirmationFilter {
  status?: ConfirmationStatus | ConfirmationStatus[];
  escalationLevel?: EscalationLevel | EscalationLevel[];
  channel?: ConfirmationChannel | ConfirmationChannel[];
  practitionerId?: string;
  patientId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  requiresFollowUp?: boolean;
  search?: string;
  noShowRisk?: 'low' | 'medium' | 'high';
}
