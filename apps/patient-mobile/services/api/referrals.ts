/**
 * Referrals API Service
 * Handles all referral program API calls - NO MOCK DATA
 */

import { apiClient, ApiResponse } from './client';

// Types (matching @medical-spa/types)
interface ReferralProgram {
  id: string;
  userId: string;
  referralCode: string;
  shareUrl: string;
  totalReferrals: number;
  pendingReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  availableCredits: number;
  milestones: ReferralMilestone[];
  rewards: {
    referrerReward: number;
    refereeReward: number;
    refereeMinimumSpend: number;
    referralExpiration: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface ReferralMilestone {
  id: string;
  count: number;
  title: string;
  description: string;
  reward: number;
  icon: string;
  achieved: boolean;
  achievedAt?: string;
}

interface Referral {
  id: string;
  referrerId: string;
  refereeId?: string;
  refereeName?: string;
  refereeEmail?: string;
  status: ReferralStatus;
  referrerReward: number;
  refereeReward: number;
  statusChangedAt?: string;
  firstAppointmentDate?: string;
  completedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

type ReferralStatus =
  | 'PENDING'
  | 'SIGNED_UP'
  | 'FIRST_VISIT'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'CANCELLED';

interface ShareReferralRequest {
  method: 'SMS' | 'EMAIL' | 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'TWITTER' | 'COPY';
  recipients?: string[];
  message?: string;
}

interface ShareReferralResponse {
  success: boolean;
  shareId: string;
  trackingUrl: string;
  method: string;
  recipientCount: number;
  message: string;
}

interface ApplyReferralCodeRequest {
  code: string;
}

interface ApplyReferralCodeResponse {
  success: boolean;
  referralId: string;
  reward: number;
  message: string;
}

interface ValidateReferralCodeResponse {
  valid: boolean;
  referrerName?: string;
  reward?: {
    type: string;
    amount: number;
    description: string;
  };
  message?: string;
}

interface ReferralStats {
  total: number;
  pending: number;
  signedUp: number;
  firstVisit: number;
  completed: number;
  expired: number;
  cancelled: number;
}

/**
 * Referrals Service - Production API
 */
class ReferralsService {
  /**
   * Get user's referral program details
   */
  async getReferralProgram(): Promise<ReferralProgram> {
    const response = await apiClient.get<ReferralProgram>('/api/patient/referrals/program');

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch referral program');
    }

    return response.data;
  }

  /**
   * Get referral history
   */
  async getReferralHistory(): Promise<Referral[]> {
    const response = await apiClient.get<{ referrals: Referral[]; stats: ReferralStats }>(
      '/api/patient/referrals/history'
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch referral history');
    }

    return response.data.referrals;
  }

  /**
   * Get referral statistics
   */
  async getReferralStats(): Promise<ReferralStats> {
    const response = await apiClient.get<{ referrals: Referral[]; stats: ReferralStats }>(
      '/api/patient/referrals/history'
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch referral stats');
    }

    return response.data.stats;
  }

  /**
   * Share referral code
   */
  async shareReferral(request: ShareReferralRequest): Promise<ShareReferralResponse> {
    const response = await apiClient.post<ShareReferralResponse>(
      '/api/patient/referrals/share',
      request
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to share referral');
    }

    return response.data;
  }

  /**
   * Validate referral code
   */
  async validateReferralCode(code: string): Promise<ValidateReferralCodeResponse> {
    const response = await apiClient.get<ValidateReferralCodeResponse>(
      `/api/patient/referrals/validate/${code}`,
      { skipAuth: true }
    );

    if (!response.success || !response.data) {
      return {
        valid: false,
        message: response.error?.message || 'Invalid referral code',
      };
    }

    return response.data;
  }

  /**
   * Apply referral code during signup
   */
  async applyReferralCode(request: ApplyReferralCodeRequest): Promise<ApplyReferralCodeResponse> {
    const response = await apiClient.post<ApplyReferralCodeResponse>(
      '/api/patient/referrals/apply',
      request
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to apply referral code');
    }

    return response.data;
  }
}

export const referralsService = new ReferralsService();
export default referralsService;

// Re-export types for consumers
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
};
