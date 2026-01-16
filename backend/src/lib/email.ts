/**
 * Email Service - SendGrid Integration
 *
 * Handles email sending for:
 * - Magic link authentication
 * - Email verification
 * - Appointment reminders
 * - Password reset
 */

import sgMail from '@sendgrid/mail';
import { config } from '../config';

// Initialize SendGrid
if (config.sendgridApiKey) {
  sgMail.setApiKey(config.sendgridApiKey);
}

const APP_URL = config.appUrl || 'http://localhost:3000';
const EMAIL_FROM = config.emailFrom || 'noreply@luxemedspa.com';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Send an email via SendGrid
 */
async function sendEmail(options: EmailOptions): Promise<void> {
  if (!config.sendgridApiKey) {
    // Development mode - log to console
    console.log('=== EMAIL (Development Mode) ===');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.text}`);
    console.log('================================');
    return;
  }

  try {
    await sgMail.send({
      from: EMAIL_FROM,
      ...options,
    });
  } catch (error) {
    console.error('SendGrid error:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Send a magic link email for passwordless authentication
 */
export async function sendMagicLinkEmail(
  email: string,
  token: string,
  isNewUser: boolean = false
): Promise<void> {
  const magicLink = `${APP_URL}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;

  const subject = isNewUser
    ? 'Welcome to Luxe Medical Spa - Verify Your Email'
    : 'Sign in to Luxe Medical Spa';

  const text = isNewUser
    ? `Welcome to Luxe Medical Spa!\n\nClick the link below to verify your email and complete your registration:\n\n${magicLink}\n\nThis link expires in 15 minutes.\n\nIf you didn't request this, you can safely ignore this email.`
    : `Click the link below to sign in to your Luxe Medical Spa account:\n\n${magicLink}\n\nThis link expires in 15 minutes.\n\nIf you didn't request this, you can safely ignore this email.`;

  const html = isNewUser
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7C3AED;">Welcome to Luxe Medical Spa!</h1>
        <p>Thank you for creating an account. Click the button below to verify your email and complete your registration.</p>
        <a href="${magicLink}" style="display: inline-block; background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 14px;">This link expires in 15 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7C3AED;">Sign in to Luxe Medical Spa</h1>
        <p>Click the button below to sign in to your account. No password needed!</p>
        <a href="${magicLink}" style="display: inline-block; background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Sign In
        </a>
        <p style="color: #666; font-size: 14px;">This link expires in 15 minutes.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `;

  await sendEmail({ to: email, subject, text, html });
}

/**
 * Send a verification code email (for 2FA or account verification)
 */
export async function sendVerificationCodeEmail(
  email: string,
  code: string
): Promise<void> {
  const subject = 'Your Luxe Medical Spa Verification Code';

  const text = `Your verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please contact us immediately.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #7C3AED;">Verification Code</h1>
      <p>Use the code below to verify your identity:</p>
      <div style="background-color: #F3F4F6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">
          ${code}
        </span>
      </div>
      <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
      <p style="color: #999; font-size: 12px;">If you didn't request this, please contact us immediately.</p>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetLink = `${APP_URL}/auth/reset-password?token=${token}`;

  const subject = 'Reset Your Luxe Medical Spa Password';

  const text = `You requested to reset your password.\n\nClick the link below to set a new password:\n\n${resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #7C3AED;">Reset Your Password</h1>
      <p>You requested to reset your password. Click the button below to set a new one.</p>
      <a href="${resetLink}" style="display: inline-block; background-color: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Reset Password
      </a>
      <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
      <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
}

/**
 * Send appointment reminder email
 */
export async function sendAppointmentReminderEmail(
  email: string,
  patientName: string,
  appointmentDate: string,
  appointmentTime: string,
  serviceName: string,
  providerName: string,
  locationAddress: string
): Promise<void> {
  const subject = `Appointment Reminder - ${serviceName} on ${appointmentDate}`;

  const text = `Hi ${patientName},\n\nThis is a reminder for your upcoming appointment:\n\nService: ${serviceName}\nProvider: ${providerName}\nDate: ${appointmentDate}\nTime: ${appointmentTime}\nLocation: ${locationAddress}\n\nPlease arrive 15 minutes early to complete any necessary paperwork.\n\nTo reschedule or cancel, please log in to your patient portal or call us.\n\nSee you soon!\nLuxe Medical Spa`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #7C3AED;">Appointment Reminder</h1>
      <p>Hi ${patientName},</p>
      <p>This is a reminder for your upcoming appointment:</p>
      <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Service:</strong> ${serviceName}</p>
        <p><strong>Provider:</strong> ${providerName}</p>
        <p><strong>Date:</strong> ${appointmentDate}</p>
        <p><strong>Time:</strong> ${appointmentTime}</p>
        <p><strong>Location:</strong> ${locationAddress}</p>
      </div>
      <p style="color: #666;">Please arrive 15 minutes early to complete any necessary paperwork.</p>
      <p style="color: #666;">To reschedule or cancel, please log in to your patient portal or call us.</p>
      <p style="margin-top: 30px;">See you soon!<br>Luxe Medical Spa</p>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
}

export default {
  sendMagicLinkEmail,
  sendVerificationCodeEmail,
  sendPasswordResetEmail,
  sendAppointmentReminderEmail,
};
