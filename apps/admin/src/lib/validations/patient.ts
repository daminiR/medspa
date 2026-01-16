/**
 * Zod Validation Schemas for Patient Portal API
 * Comprehensive input validation for all endpoints
 */

import { z } from 'zod';

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  referralCode: z.string().optional(),
  marketingOptIn: z.boolean().default(false),
  smsOptIn: z.boolean().default(true),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const passkeyLoginSchema = z.object({
  credentialId: z.string(),
  clientDataJSON: z.string(),
  authenticatorData: z.string(),
  signature: z.string(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const verifyPhoneSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

// ============================================================================
// PROFILE SCHEMAS
// ============================================================================

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional(),
  addressStreet: z.string().max(200).optional(),
  addressCity: z.string().max(100).optional(),
  addressState: z.string().max(100).optional(),
  addressZipCode: z.string().max(20).optional(),
  addressCountry: z.string().max(100).optional(),
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  emergencyContactRelationship: z.string().max(50).optional(),
  preferredLocationId: z.string().optional(),
  preferredProviderId: z.string().optional(),
  marketingOptIn: z.boolean().optional(),
  smsOptIn: z.boolean().optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
});

export const uploadPhotoSchema = z.object({
  type: z.enum(['BEFORE', 'AFTER', 'PROGRESS', 'PROFILE']),
  caption: z.string().max(500).optional(),
  appointmentId: z.string().optional(),
  consentGiven: z.boolean().default(false),
});

// ============================================================================
// APPOINTMENT SCHEMAS
// ============================================================================

export const getAppointmentsSchema = z.object({
  ...paginationSchema.shape,
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'CHECKED_IN',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW',
  ]).optional(),
  upcoming: z.coerce.boolean().optional(),
  past: z.coerce.boolean().optional(),
  ...dateRangeSchema.shape,
});

export const bookAppointmentSchema = z.object({
  serviceId: z.string().min(1, 'Service is required'),
  providerId: z.string().optional(),
  locationId: z.string().min(1, 'Location is required'),
  startTime: z.string().datetime('Invalid start time'),
  patientNotes: z.string().max(1000).optional(),
  paymentMethodId: z.string().optional(), // For deposit
});

export const rescheduleAppointmentSchema = z.object({
  newStartTime: z.string().datetime('Invalid start time'),
  reason: z.string().max(500).optional(),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required').max(500),
});

export const getAvailableSlotsSchema = z.object({
  serviceId: z.string().min(1, 'Service is required'),
  providerId: z.string().optional(),
  locationId: z.string().min(1, 'Location is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

// ============================================================================
// PAYMENT SCHEMAS
// ============================================================================

export const addPaymentMethodSchema = z.object({
  type: z.enum(['CARD', 'BANK_ACCOUNT', 'HSA', 'FSA', 'APPLE_PAY', 'GOOGLE_PAY']),
  stripePaymentMethodId: z.string().optional(),
  setDefault: z.boolean().default(false),
});

export const processPaymentSchema = z.object({
  appointmentId: z.string().optional(),
  invoiceId: z.string().optional(),
  paymentMethodId: z.string().min(1, 'Payment method is required'),
  amount: z.number().positive('Amount must be positive'),
  tip: z.number().min(0).optional(),
  isHsaFsa: z.boolean().default(false),
}).refine((data) => data.appointmentId || data.invoiceId, {
  message: 'Either appointmentId or invoiceId is required',
});

export const updatePaymentMethodSchema = z.object({
  setDefault: z.boolean().optional(),
  active: z.boolean().optional(),
});

// ============================================================================
// REFERRAL SCHEMAS
// ============================================================================

export const shareReferralSchema = z.object({
  method: z.enum(['SMS', 'EMAIL', 'WHATSAPP', 'INSTAGRAM', 'FACEBOOK', 'TWITTER', 'COPY']),
  recipients: z.array(z.string()).optional(),
  message: z.string().max(500).optional(),
});

export const applyReferralCodeSchema = z.object({
  code: z.string().min(1, 'Referral code is required'),
});

export const validateReferralCodeSchema = z.object({
  code: z.string().min(1, 'Referral code is required'),
});

// ============================================================================
// WALLET SCHEMAS
// ============================================================================

export const generateWalletPassSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
});

export const updateWalletPassSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  date: z.string().datetime().optional(),
  provider: z.string().optional(),
  location: z.string().optional(),
  locationAddress: z.string().optional(),
  status: z.enum(['confirmed', 'cancelled', 'rescheduled']).optional(),
});

// ============================================================================
// NOTIFICATION SCHEMAS
// ============================================================================

export const registerPushTokenSchema = z.object({
  token: z.string().min(1, 'Push token is required'),
  platform: z.enum(['IOS', 'ANDROID', 'WEB']),
  deviceModel: z.string().optional(),
  deviceOS: z.string().optional(),
});

export const updateNotificationPreferencesSchema = z.object({
  enabled: z.boolean().optional(),
  appointmentReminders: z.boolean().optional(),
  appointmentReminder24h: z.boolean().optional(),
  appointmentReminder2h: z.boolean().optional(),
  promotions: z.boolean().optional(),
  rewards: z.boolean().optional(),
  messages: z.boolean().optional(),
  sound: z.boolean().optional(),
  badge: z.boolean().optional(),
  vibration: z.boolean().optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
  quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
});

// ============================================================================
// MESSAGE SCHEMAS
// ============================================================================

export const getMessagesSchema = z.object({
  ...paginationSchema.shape,
  threadId: z.string().optional(),
});

export const sendMessageSchema = z.object({
  threadId: z.string().optional(), // If not provided, creates new thread
  content: z.string().min(1, 'Message content is required').max(5000),
  contentType: z.enum(['TEXT', 'IMAGE', 'DOCUMENT']).default('TEXT'),
});

export const markMessageReadSchema = z.object({
  messageIds: z.array(z.string()).optional(), // If not provided, marks single message
});

// ============================================================================
// PHOTO SCHEMAS
// ============================================================================

export const getPhotosSchema = z.object({
  ...paginationSchema.shape,
  type: z.enum(['BEFORE', 'AFTER', 'PROGRESS', 'PROFILE']).optional(),
  appointmentId: z.string().optional(),
});

export const deletePhotoSchema = z.object({
  photoId: z.string().min(1, 'Photo ID is required'),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PasskeyLoginInput = z.infer<typeof passkeyLoginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
export type GetAvailableSlotsInput = z.infer<typeof getAvailableSlotsSchema>;
export type AddPaymentMethodInput = z.infer<typeof addPaymentMethodSchema>;
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
export type ShareReferralInput = z.infer<typeof shareReferralSchema>;
export type ApplyReferralCodeInput = z.infer<typeof applyReferralCodeSchema>;
export type GenerateWalletPassInput = z.infer<typeof generateWalletPassSchema>;
export type UpdateWalletPassInput = z.infer<typeof updateWalletPassSchema>;
export type RegisterPushTokenInput = z.infer<typeof registerPushTokenSchema>;
export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
