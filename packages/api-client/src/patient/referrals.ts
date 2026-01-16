/**
 * Referrals API Functions
 */

import type { ApiClient } from '../client';
import type {
  ReferralProgram,
  Referral,
  ShareReferralRequest,
  ApplyReferralCodeRequest,
} from './types';
import { patientEndpoints } from './index';

export interface ReferralsApi {
  /**
   * Get referral program details
   */
  getProgram(): Promise<ReferralProgram>;

  /**
   * Get referral history
   */
  getHistory(): Promise<{
    referrals: Referral[];
    stats: {
      total: number;
      pending: number;
      signedUp: number;
      firstVisit: number;
      completed: number;
      expired: number;
      cancelled: number;
    };
  }>;

  /**
   * Track a share event
   */
  share(data: ShareReferralRequest): Promise<{
    success: boolean;
    shareId: string;
    trackingUrl: string;
    method: string;
    recipientCount: number;
    message: string;
  }>;

  /**
   * Apply a referral code
   */
  apply(data: ApplyReferralCodeRequest): Promise<{
    success: boolean;
    referralId: string;
    reward: number;
    message: string;
  }>;

  /**
   * Validate a referral code (without applying)
   */
  validate(code: string): Promise<{
    valid: boolean;
    referrerName?: string;
    reward?: {
      type: string;
      amount: number;
      description: string;
    };
    message?: string;
  }>;
}

export function createReferralsApi(client: ApiClient): ReferralsApi {
  return {
    async getProgram() {
      const response = await client.get<{ data: ReferralProgram }>(
        patientEndpoints.referrals.program
      );
      return response.data;
    },

    async getHistory() {
      const response = await client.get<{
        data: {
          referrals: Referral[];
          stats: {
            total: number;
            pending: number;
            signedUp: number;
            firstVisit: number;
            completed: number;
            expired: number;
            cancelled: number;
          };
        };
      }>(patientEndpoints.referrals.history);
      return response.data;
    },

    async share(data: ShareReferralRequest) {
      const response = await client.post<{
        data: {
          success: boolean;
          shareId: string;
          trackingUrl: string;
          method: string;
          recipientCount: number;
          message: string;
        };
      }>(patientEndpoints.referrals.share, data);
      return response.data;
    },

    async apply(data: ApplyReferralCodeRequest) {
      const response = await client.post<{
        data: {
          success: boolean;
          referralId: string;
          reward: number;
          message: string;
        };
      }>(patientEndpoints.referrals.apply, data);
      return response.data;
    },

    async validate(code: string) {
      const response = await client.get<{
        data: {
          valid: boolean;
          referrerName?: string;
          reward?: {
            type: string;
            amount: number;
            description: string;
          };
          message?: string;
        };
      }>(patientEndpoints.referrals.validate(code));
      return response.data;
    },
  };
}
