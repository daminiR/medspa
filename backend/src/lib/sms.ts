/**
 * SMS Service - Twilio Integration
 *
 * Handles SMS sending for:
 * - OTP verification codes
 * - Appointment reminders
 * - Two-factor authentication
 */

import twilio from 'twilio';
import { config } from '../config';

// Initialize Twilio client
let twilioClient: twilio.Twilio | null = null;

if (config.twilioAccountSid && config.twilioAuthToken) {
  twilioClient = twilio(config.twilioAccountSid, config.twilioAuthToken);
}

const TWILIO_PHONE = config.twilioPhoneNumber;

export interface SMSOptions {
  to: string;
  body: string;
}

/**
 * Normalize phone number to E.164 format
 */
function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // If starts with 1 and has 11 digits, assume US
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // If 10 digits, assume US and add +1
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // Otherwise, just prepend + if not already present
  return phone.startsWith('+') ? phone : `+${digits}`;
}

/**
 * Send an SMS via Twilio
 */
export async function sendSMS(options: SMSOptions): Promise<void> {
  const normalizedPhone = normalizePhone(options.to);

  if (!twilioClient || !TWILIO_PHONE) {
    // Development mode - log to console
    console.log('=== SMS (Development Mode) ===');
    console.log(`To: ${normalizedPhone}`);
    console.log(`Body: ${options.body}`);
    console.log('==============================');
    return;
  }

  try {
    await twilioClient.messages.create({
      from: TWILIO_PHONE,
      to: normalizedPhone,
      body: options.body,
    });
  } catch (error) {
    console.error('Twilio error:', error);
    throw new Error('Failed to send SMS');
  }
}

/**
 * Send OTP verification code
 */
export async function sendOTPCode(
  phone: string,
  code: string
): Promise<void> {
  const body = `Your Luxe Medical Spa verification code is: ${code}\n\nThis code expires in 5 minutes. Do not share this code with anyone.`;

  await sendSMS({ to: phone, body });
}

/**
 * Send appointment reminder
 */
export async function sendAppointmentReminder(
  phone: string,
  patientName: string,
  appointmentDate: string,
  appointmentTime: string,
  serviceName: string
): Promise<void> {
  const body = `Hi ${patientName}, this is a reminder for your ${serviceName} appointment on ${appointmentDate} at ${appointmentTime}. Reply CONFIRM to confirm or call us to reschedule. - Luxe Medical Spa`;

  await sendSMS({ to: phone, body });
}

/**
 * Send appointment confirmation
 */
export async function sendAppointmentConfirmation(
  phone: string,
  patientName: string,
  appointmentDate: string,
  appointmentTime: string,
  serviceName: string,
  providerName: string
): Promise<void> {
  const body = `Hi ${patientName}, your ${serviceName} appointment with ${providerName} on ${appointmentDate} at ${appointmentTime} is confirmed. See you then! - Luxe Medical Spa`;

  await sendSMS({ to: phone, body });
}

/**
 * Send cancellation confirmation
 */
export async function sendCancellationConfirmation(
  phone: string,
  patientName: string,
  appointmentDate: string,
  serviceName: string
): Promise<void> {
  const body = `Hi ${patientName}, your ${serviceName} appointment on ${appointmentDate} has been cancelled. To reschedule, visit our patient portal or call us. - Luxe Medical Spa`;

  await sendSMS({ to: phone, body });
}

/**
 * Send waitlist notification
 */
export async function sendWaitlistNotification(
  phone: string,
  patientName: string,
  serviceName: string,
  availableDate: string,
  availableTime: string,
  expiresIn: string
): Promise<void> {
  const body = `Hi ${patientName}, great news! A ${serviceName} slot opened up on ${availableDate} at ${availableTime}. Reply YES within ${expiresIn} to claim it or it will go to the next person. - Luxe Medical Spa`;

  await sendSMS({ to: phone, body });
}

/**
 * Send two-factor auth code
 */
export async function send2FACode(
  phone: string,
  code: string
): Promise<void> {
  const body = `Your Luxe Medical Spa login code is: ${code}\n\nThis code expires in 10 minutes.`;

  await sendSMS({ to: phone, body });
}

export default {
  sendOTPCode,
  sendAppointmentReminder,
  sendAppointmentConfirmation,
  sendCancellationConfirmation,
  sendWaitlistNotification,
  send2FACode,
};
