/**
 * API Services Index
 * Central export for all API services - NO MOCK DATA
 */

// Export client and utilities
export { apiClient, tokenStorage, apiRequest } from './client';
export type { ApiResponse } from './client';

// Export individual services
export { authService } from './auth';
export { appointmentsService } from './appointments';
export { referralsService } from './referrals';
export { notificationsApiService } from './notifications';

// Re-export types
export type {
  ReferralProgram,
  Referral,
  ReferralMilestone,
  ReferralStatus,
  ShareReferralRequest,
  ShareReferralResponse,
  ApplyReferralCodeRequest,
  ApplyReferralCodeResponse,
  ValidateReferralCodeResponse,
  ReferralStats,
} from './referrals';

export type {
  PushTokenRegistration,
  NotificationItem,
  NotificationListResponse,
  BackendNotificationPreferences,
} from './notifications';
