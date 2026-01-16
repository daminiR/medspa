/**
 * Patient Context Builder
 *
 * Aggregates patient information from various sources to build
 * context for AI analysis. Follows HIPAA guidelines by minimizing
 * PHI exposure while providing relevant context.
 */

import { patients, appointments, practitioners } from '@/lib/data';
import { findRecentTreatment, findAllRecentTreatments, findPatientIdByPhone, isWithinCriticalPeriod } from '@/lib/data/treatmentLookup';
import { getCurrentDateTimeContext } from './system-instructions';

export interface RecentTreatment {
  name: string;
  date: string;
  daysAgo: number;
  inCriticalPeriod: boolean;
  provider?: string;
}

export interface UpcomingAppointment {
  date: string;
  time: string;
  service: string;
  provider: string;
  daysUntil: number;
}

export interface ConversationMessage {
  sender: 'patient' | 'staff';
  message: string;
  timestamp?: Date;
}

export interface PatientContext {
  patientId: string;
  firstName: string;
  isVIP: boolean;
  membershipTier?: string;
  allergies?: string[];
  recentTreatments: RecentTreatment[];
  upcomingAppointment?: UpcomingAppointment;
  conversationHistory: ConversationMessage[];
  patientSince?: string;
  totalVisits?: number;
}

/**
 * Normalize phone number to 10 digits for lookup
 */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  // Handle +1 prefix
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1);
  }
  return digits.slice(-10);
}

/**
 * Build patient context from phone number
 */
export async function buildPatientContext(
  phoneNumber: string,
  recentMessages: Array<{ sender: string; text: string; time?: Date }> = []
): Promise<PatientContext | null> {
  const normalizedPhone = normalizePhone(phoneNumber);

  // Find patient by phone
  const patientId = findPatientIdByPhone(normalizedPhone);
  if (!patientId) {
    // Try finding in patients array directly
    const patient = patients.find(p => p.phone && normalizePhone(p.phone) === normalizedPhone);
    if (!patient) {
      return null;
    }
    return buildContextForPatient(patient, recentMessages);
  }

  const patient = patients.find(p => p.id === patientId);
  if (!patient) {
    return null;
  }

  return buildContextForPatient(patient, recentMessages);
}

/**
 * Build context for a known patient
 */
function buildContextForPatient(
  patient: any,
  recentMessages: Array<{ sender: string; text: string; time?: Date }> = []
): PatientContext {
  const now = new Date();

  // Get recent treatments (last 30 days)
  const recentTreatments: RecentTreatment[] = [];
  const treatments = findAllRecentTreatments(patient.id, { daysBack: 30 });

  for (const tx of treatments) {
    const treatmentDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
    const daysAgo = Math.floor((now.getTime() - treatmentDate.getTime()) / (1000 * 60 * 60 * 24));
    recentTreatments.push({
      name: tx.serviceName,
      date: treatmentDate.toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
      daysAgo,
      inCriticalPeriod: isWithinCriticalPeriod(tx),
      provider: tx.practitionerName,
    });
  }

  // Get upcoming appointment
  let upcomingAppointment: UpcomingAppointment | undefined;
  const upcomingAppts = appointments.filter(
    a => a.patientId === patient.id &&
        new Date(a.startTime) > now &&
        a.status !== 'cancelled' &&
        a.status !== 'deleted'
  ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  if (upcomingAppts.length > 0) {
    const appt = upcomingAppts[0];
    const apptDate = new Date(appt.startTime);
    const daysUntil = Math.ceil((apptDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Look up practitioner name from practitionerId
    const practitioner = practitioners.find(p => p.id === appt.practitionerId);
    const providerName = (appt as any).practitionerName || practitioner?.name || 'Your provider';

    upcomingAppointment = {
      date: apptDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: apptDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      service: appt.serviceName,
      provider: providerName,
      daysUntil,
    };
  }

  // Build conversation history (last 5 messages)
  const conversationHistory: ConversationMessage[] = recentMessages.slice(-5).map(m => ({
    sender: m.sender === 'clinic' ? 'staff' : 'patient',
    message: m.text,
    timestamp: m.time,
  }));

  // Extract relevant patient info
  const isVIP = patient.tags?.includes('VIP') ||
                patient.membershipTier === 'VIP' ||
                patient.membershipTier === 'Platinum';

  // Get allergies that are relevant for aesthetic treatments
  const relevantAllergies = patient.allergies?.filter((a: any) =>
    ['Lidocaine', 'Latex', 'Hyaluronic Acid', 'Botulinum Toxin'].some(
      allergen => a.allergen?.toLowerCase().includes(allergen.toLowerCase())
    )
  ).map((a: any) => a.allergen) || [];

  return {
    patientId: patient.id,
    firstName: patient.firstName,
    isVIP,
    membershipTier: patient.membershipTier,
    allergies: relevantAllergies.length > 0 ? relevantAllergies : undefined,
    recentTreatments,
    upcomingAppointment,
    conversationHistory,
    patientSince: patient.registrationDate ?
      new Date(patient.registrationDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) :
      undefined,
    totalVisits: patient.totalVisits,
  };
}

/**
 * Format patient context into a prompt-ready string
 */
export function formatContextForPrompt(context: PatientContext): string {
  const lines: string[] = [
    getCurrentDateTimeContext(),
    '',
    '## Patient Context',
    `- Name: ${context.firstName}`,
    `- VIP Status: ${context.isVIP ? 'Yes - prioritize response' : 'No'}`,
  ];

  if (context.membershipTier) {
    lines.push(`- Membership: ${context.membershipTier}`);
  }

  if (context.patientSince) {
    lines.push(`- Patient since: ${context.patientSince}`);
  }

  if (context.allergies && context.allergies.length > 0) {
    lines.push(`- Known allergies: ${context.allergies.join(', ')}`);
  }

  // Recent treatments (critical for post-care context)
  if (context.recentTreatments.length > 0) {
    lines.push('');
    lines.push('### Recent Treatments:');
    for (const tx of context.recentTreatments) {
      let txLine = `- ${tx.name} (${tx.daysAgo} day${tx.daysAgo !== 1 ? 's' : ''} ago)`;
      if (tx.inCriticalPeriod) {
        txLine += ' [IN CRITICAL MONITORING PERIOD - 48-72hrs post-treatment]';
      }
      lines.push(txLine);
    }
  }

  // Upcoming appointment
  if (context.upcomingAppointment) {
    lines.push('');
    lines.push('### Upcoming Appointment:');
    lines.push(`- ${context.upcomingAppointment.service}`);
    lines.push(`- ${context.upcomingAppointment.date} at ${context.upcomingAppointment.time}`);
    lines.push(`- Provider: ${context.upcomingAppointment.provider}`);
    if (context.upcomingAppointment.daysUntil <= 1) {
      lines.push(`- [APPOINTMENT IS ${context.upcomingAppointment.daysUntil === 0 ? 'TODAY' : 'TOMORROW'}]`);
    }
  }

  // Recent conversation for context
  if (context.conversationHistory.length > 0) {
    lines.push('');
    lines.push('### Recent Conversation:');
    for (const msg of context.conversationHistory) {
      lines.push(`${msg.sender.toUpperCase()}: "${msg.message}"`);
    }
  }

  return lines.join('\n');
}

/**
 * Create a minimal context for unknown patients
 */
export function createUnknownPatientContext(): string {
  return `${getCurrentDateTimeContext()}

## Patient Context
- Unknown patient (not in system)
- Treat as new inquiry
- Be welcoming and helpful
- Suggest scheduling a consultation if treatment-related`;
}
