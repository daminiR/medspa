/**
 * Authentication validation schemas
 */

import { z } from 'zod';
import { emailSchema, phoneSchema } from './common';

// User role
export const userRoleSchema = z.enum([
  'admin',
  'medical_director',
  'physician',
  'nurse_practitioner',
  'registered_nurse',
  'aesthetician',
  'laser_technician',
  'injection_specialist',
  'front_desk',
  'office_manager',
  'billing_specialist',
  'marketing_coordinator',
  'patient_coordinator',
  'patient',
]);

// Login input
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
  mfaToken: z.string().length(6).optional(),
  rememberMe: z.boolean().optional(),
});

// Register input (for patients via portal)
export const registerPatientSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: emailSchema,
  phone: phoneSchema,
  dateOfBirth: z.string(), // ISO date string
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
  marketingConsent: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Create staff user input (for admin creating users)
export const createStaffUserSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: emailSchema,
  phone: phoneSchema.optional(),
  role: userRoleSchema,
  locationIds: z.array(z.string().uuid()).min(1),
  primaryLocationId: z.string().uuid(),
  sendInvite: z.boolean().default(true),
});

// Forgot password input
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password input
export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Change password input
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

// MFA setup input
export const setupMfaSchema = z.object({
  verificationCode: z.string().length(6).regex(/^\d+$/, 'Code must be 6 digits'),
});

// MFA verify input
export const verifyMfaSchema = z.object({
  code: z.string().length(6).regex(/^\d+$/, 'Code must be 6 digits'),
});

// Use backup code input
export const useBackupCodeSchema = z.object({
  code: z.string().regex(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/, 'Invalid backup code format'),
});

// Refresh token input
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

// Verify email input
export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

// Phone verification
export const requestPhoneVerificationSchema = z.object({
  phone: phoneSchema,
});

export const verifyPhoneSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6).regex(/^\d+$/, 'Code must be 6 digits'),
});

// Passkey registration
export const registerPasskeySchema = z.object({
  credentialId: z.string(),
  publicKey: z.string(),
  transports: z.array(z.string()).optional(),
  deviceName: z.string().max(255).optional(),
});

// Passkey authentication
export const authenticatePasskeySchema = z.object({
  credentialId: z.string(),
  authenticatorData: z.string(),
  clientDataJSON: z.string(),
  signature: z.string(),
});

// Type exports
export type UserRole = z.infer<typeof userRoleSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterPatientInput = z.infer<typeof registerPatientSchema>;
export type CreateStaffUserInput = z.infer<typeof createStaffUserSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
