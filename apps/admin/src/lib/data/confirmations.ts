/**
 * Mock Confirmation Request Data
 * Used for testing and development
 */

import { ConfirmationRequest, ConfirmationResponse } from '@/types/confirmation';
import moment from 'moment';

/**
 * Mock confirmation requests
 * These simulate real-world confirmation scenarios
 */
export const mockConfirmationRequests: ConfirmationRequest[] = [
  {
    id: 'conf-001',
    appointmentId: 'apt-001',
    patientId: 'pat-001',
    patientName: 'Sarah Johnson',
    patientPhone: '+1-555-0101',
    patientEmail: 'sarah.j@example.com',
    serviceName: 'Botox Treatment',
    practitionerId: 'prac-001',
    practitionerName: 'Dr. Emily Chen',
    appointmentStart: moment().add(2, 'days').hour(10).minute(0).toDate(),
    appointmentEnd: moment().add(2, 'days').hour(10).minute(30).toDate(),
    status: 'confirmed',
    primaryChannel: 'sms',
    sentAt: moment().subtract(1, 'day').toDate(),
    respondedAt: moment().subtract(23, 'hours').toDate(),
    responseTimeMinutes: 60,
    responseAction: 'confirmed',
    responseNotes: 'Confirmed via SMS reply',
    escalationLevel: 'none',
    escalationAttempts: 0,
    isNewPatient: false,
    noShowRisk: 'low',
    requiresFollowUp: false,
    createdAt: moment().subtract(1, 'day').toDate(),
    updatedAt: moment().subtract(23, 'hours').toDate(),
  },
  {
    id: 'conf-002',
    appointmentId: 'apt-002',
    patientId: 'pat-002',
    patientName: 'Michael Rodriguez',
    patientPhone: '+1-555-0102',
    patientEmail: 'michael.r@example.com',
    serviceName: 'Laser Hair Removal',
    practitionerId: 'prac-002',
    practitionerName: 'Dr. James Wilson',
    appointmentStart: moment().add(1, 'day').hour(14).minute(0).toDate(),
    appointmentEnd: moment().add(1, 'day').hour(15).minute(0).toDate(),
    status: 'pending',
    primaryChannel: 'sms',
    sentAt: moment().subtract(12, 'hours').toDate(),
    escalationLevel: 'none',
    escalationAttempts: 0,
    isNewPatient: true,
    noShowRisk: 'medium',
    requiresFollowUp: false,
    createdAt: moment().subtract(12, 'hours').toDate(),
    updatedAt: moment().subtract(12, 'hours').toDate(),
  },
  {
    id: 'conf-003',
    appointmentId: 'apt-003',
    patientId: 'pat-003',
    patientName: 'Jessica Lee',
    patientPhone: '+1-555-0103',
    patientEmail: 'jessica.lee@example.com',
    serviceName: 'Dermal Filler',
    practitionerId: 'prac-001',
    practitionerName: 'Dr. Emily Chen',
    appointmentStart: moment().add(3, 'days').hour(11).minute(0).toDate(),
    appointmentEnd: moment().add(3, 'days').hour(11).minute(45).toDate(),
    status: 'no_response',
    primaryChannel: 'sms',
    secondaryChannels: ['email'],
    sentAt: moment().subtract(2, 'days').toDate(),
    escalationLevel: 'warning',
    escalationReason: 'No response after 48 hours',
    escalationAttempts: 1,
    lastEscalationAt: moment().subtract(4, 'hours').toDate(),
    isNewPatient: false,
    noShowRisk: 'high',
    requiresFollowUp: true,
    followUpAction: 'Send reminder SMS',
    followUpScheduledAt: moment().add(4, 'hours').toDate(),
    createdAt: moment().subtract(2, 'days').toDate(),
    updatedAt: moment().subtract(4, 'hours').toDate(),
  },
  {
    id: 'conf-004',
    appointmentId: 'apt-004',
    patientId: 'pat-004',
    patientName: 'David Thompson',
    patientPhone: '+1-555-0104',
    patientEmail: 'david.t@example.com',
    serviceName: 'Chemical Peel',
    practitionerId: 'prac-003',
    practitionerName: 'Dr. Patricia Moore',
    appointmentStart: moment().add(5, 'days').hour(9).minute(0).toDate(),
    appointmentEnd: moment().add(5, 'days').hour(10).minute(0).toDate(),
    status: 'rescheduled',
    primaryChannel: 'sms',
    sentAt: moment().subtract(3, 'days').toDate(),
    respondedAt: moment().subtract(2, 'days').toDate(),
    responseTimeMinutes: 1440, // 24 hours
    responseAction: 'rescheduled',
    responseNotes: 'Requested to reschedule to next week',
    escalationLevel: 'none',
    escalationAttempts: 0,
    isNewPatient: false,
    noShowRisk: 'low',
    requiresFollowUp: false,
    createdAt: moment().subtract(3, 'days').toDate(),
    updatedAt: moment().subtract(2, 'days').toDate(),
  },
  {
    id: 'conf-005',
    appointmentId: 'apt-005',
    patientId: 'pat-005',
    patientName: 'Amanda Martinez',
    patientPhone: '+1-555-0105',
    patientEmail: 'amanda.m@example.com',
    serviceName: 'Microdermabrasion',
    practitionerId: 'prac-002',
    practitionerName: 'Dr. James Wilson',
    appointmentStart: moment().add(4, 'days').hour(15).minute(0).toDate(),
    appointmentEnd: moment().add(4, 'days').hour(15).minute(30).toDate(),
    status: 'cancelled',
    primaryChannel: 'sms',
    sentAt: moment().subtract(4, 'days').toDate(),
    respondedAt: moment().subtract(3, 'days').toDate(),
    responseTimeMinutes: 1200, // 20 hours
    responseAction: 'cancelled',
    responseNotes: 'Patient requested cancellation due to scheduling conflict',
    escalationLevel: 'none',
    escalationAttempts: 0,
    isNewPatient: true,
    noShowRisk: 'medium',
    requiresFollowUp: true,
    followUpAction: 'Follow up on next week availability',
    createdAt: moment().subtract(4, 'days').toDate(),
    updatedAt: moment().subtract(3, 'days').toDate(),
  },
  {
    id: 'conf-006',
    appointmentId: 'apt-006',
    patientId: 'pat-006',
    patientName: 'Robert Chen',
    patientPhone: '+1-555-0106',
    patientEmail: 'robert.chen@example.com',
    serviceName: 'CoolSculpting',
    practitionerId: 'prac-001',
    practitionerName: 'Dr. Emily Chen',
    appointmentStart: moment().add(7, 'days').hour(16).minute(0).toDate(),
    appointmentEnd: moment().add(7, 'days').hour(17).minute(0).toDate(),
    status: 'no_response',
    primaryChannel: 'sms',
    secondaryChannels: ['email'],
    sentAt: moment().subtract(5, 'days').toDate(),
    escalationLevel: 'escalated',
    escalationReason: 'No response after multiple attempts',
    escalationAttempts: 2,
    lastEscalationAt: moment().subtract(1, 'day').toDate(),
    isNewPatient: true,
    noShowRisk: 'high',
    requiresFollowUp: true,
    followUpAction: 'Phone call needed',
    followUpScheduledAt: moment().add(2, 'hours').toDate(),
    createdAt: moment().subtract(5, 'days').toDate(),
    updatedAt: moment().subtract(1, 'day').toDate(),
  },
];

/**
 * Mock confirmation responses
 */
export const mockConfirmationResponses: ConfirmationResponse[] = [
  {
    id: 'resp-001',
    confirmationRequestId: 'conf-001',
    patientId: 'pat-001',
    appointmentId: 'apt-001',
    responseType: 'confirmed',
    respondedAt: moment().subtract(23, 'hours').toDate(),
    responseChannel: 'sms',
    responseMessage: 'Yes, confirmed for Friday 10am',
  },
  {
    id: 'resp-002',
    confirmationRequestId: 'conf-004',
    patientId: 'pat-004',
    appointmentId: 'apt-004',
    responseType: 'rescheduled',
    respondedAt: moment().subtract(2, 'days').toDate(),
    responseChannel: 'sms',
    responseMessage: 'Can we move to next Tuesday?',
    rescheduledTo: moment().add(8, 'days').hour(10).minute(0).toDate(),
  },
  {
    id: 'resp-003',
    confirmationRequestId: 'conf-005',
    patientId: 'pat-005',
    appointmentId: 'apt-005',
    responseType: 'cancelled',
    respondedAt: moment().subtract(3, 'days').toDate(),
    responseChannel: 'email',
    responseMessage: 'I need to cancel this appointment',
  },
];

/**
 * Utility functions for working with confirmation data
 */

export function getConfirmationById(id: string): ConfirmationRequest | undefined {
  return mockConfirmationRequests.find(conf => conf.id === id);
}

export function getConfirmationsByAppointmentId(appointmentId: string): ConfirmationRequest[] {
  return mockConfirmationRequests.filter(conf => conf.appointmentId === appointmentId);
}

export function getConfirmationsByStatus(
  status: string | string[]
): ConfirmationRequest[] {
  const statuses = Array.isArray(status) ? status : [status];
  return mockConfirmationRequests.filter(conf => statuses.includes(conf.status));
}

export function getPendingConfirmations(): ConfirmationRequest[] {
  return mockConfirmationRequests.filter(conf => conf.status === 'pending');
}

export function getNoResponseConfirmations(): ConfirmationRequest[] {
  return mockConfirmationRequests.filter(conf => conf.status === 'no_response');
}

export function getEscalatedConfirmations(level?: string): ConfirmationRequest[] {
  if (!level) {
    return mockConfirmationRequests.filter(
      conf => conf.escalationLevel !== 'none'
    );
  }
  return mockConfirmationRequests.filter(
    conf => conf.escalationLevel === level
  );
}

export function getHighRiskNoShows(): ConfirmationRequest[] {
  return mockConfirmationRequests.filter(
    conf => conf.noShowRisk === 'high' && conf.status !== 'confirmed'
  );
}

export function calculateConfirmationStats() {
  const total = mockConfirmationRequests.length;
  const pending = mockConfirmationRequests.filter(c => c.status === 'pending').length;
  const confirmed = mockConfirmationRequests.filter(c => c.status === 'confirmed').length;
  const rescheduled = mockConfirmationRequests.filter(c => c.status === 'rescheduled').length;
  const noResponse = mockConfirmationRequests.filter(c => c.status === 'no_response').length;
  const cancelled = mockConfirmationRequests.filter(c => c.status === 'cancelled').length;

  const responseTimes = mockConfirmationRequests
    .filter(c => c.responseTimeMinutes !== undefined)
    .map(c => c.responseTimeMinutes as number);

  const averageResponseTimeMinutes =
    responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

  const confirmationRate =
    total > 0 ? Math.round(((confirmed + rescheduled) / total) * 100) : 0;

  const escalatedCount = mockConfirmationRequests.filter(
    c => c.escalationLevel !== 'none'
  ).length;

  const requiresFollowUpCount = mockConfirmationRequests.filter(
    c => c.requiresFollowUp
  ).length;

  return {
    total,
    pending,
    confirmed,
    rescheduled,
    noResponse,
    cancelled,
    averageResponseTimeMinutes,
    confirmationRate,
    escalatedCount,
    requiresFollowUpCount,
  };
}
