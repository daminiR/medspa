import {
  ReferralProgram,
  Referral,
  ShareReferralRequest,
  ShareReferralResponse,
  ApplyReferralCodeRequest,
  ApplyReferralCodeResponse,
  ReferralStats,
} from '@medical-spa/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

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

/**
 * Referral Service
 * Handles all referral program API calls
 */
class ReferralService {
  /**
   * Get user's referral program details
   */
  async getReferralProgram(): Promise<ReferralProgram> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/referrals/program`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth token from store
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch referral program');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching referral program:', error);
      // Return mock data for development
      return this.getMockReferralProgram();
    }
  }

  /**
   * Get referral history
   */
  async getReferralHistory(): Promise<Referral[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/referrals/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth token from store
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch referral history');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching referral history:', error);
      // Return mock data for development
      return this.getMockReferralHistory();
    }
  }

  /**
   * Share referral code
   */
  async shareReferral(request: ShareReferralRequest): Promise<ShareReferralResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/referrals/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth token from store
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to share referral');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sharing referral:', error);
      // Return mock response for development
      return {
        success: true,
        shareId: `share_${Date.now()}`,
        trackingUrl: `https://luxe.spa/ref/SARAH25?sid=share_${Date.now()}`,
      };
    }
  }

  /**
   * Validate referral code
   */
  async validateReferralCode(code: string): Promise<ValidateReferralCodeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/referrals/validate/${code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          valid: false,
          message: 'Invalid referral code',
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error validating referral code:', error);
      // Return mock validation for development
      return {
        valid: true,
        referrerName: 'Sarah Johnson',
        reward: {
          type: 'credit',
          amount: 50,
          description: '$50 off your first service',
        },
      };
    }
  }

  /**
   * Apply referral code during signup
   */
  async applyReferralCode(request: ApplyReferralCodeRequest): Promise<ApplyReferralCodeResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/referrals/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to apply referral code');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error applying referral code:', error);
      throw error;
    }
  }

  /**
   * Get referral statistics
   */
  async getReferralStats(): Promise<ReferralStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/referrals/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth token from store
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch referral stats');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      return {
        totalShares: 0,
        clickThroughRate: 0,
        conversionRate: 0,
        topChannels: [],
      };
    }
  }

  /**
   * Mock data for development
   */
  private getMockReferralProgram(): ReferralProgram {
    return {
      id: '1',
      userId: '1',
      referralCode: 'SARAH25',
      shareUrl: 'https://luxe.spa/ref/SARAH25',
      totalReferrals: 7,
      pendingReferrals: 2,
      successfulReferrals: 5,
      totalEarnings: 125,
      availableCredits: 75,
      milestones: [
        {
          id: '1',
          count: 5,
          title: 'First 5 Referrals',
          description: 'Extra $10 bonus',
          reward: 10,
          icon: 'star',
          achieved: true,
          achievedAt: new Date('2024-11-15'),
        },
        {
          id: '2',
          count: 10,
          title: '10 Referrals',
          description: 'Extra $25 bonus',
          reward: 25,
          icon: 'trophy',
          achieved: false,
        },
        {
          id: '3',
          count: 25,
          title: '25 Referrals',
          description: 'Free HydraFacial',
          reward: 250,
          icon: 'gift',
          achieved: false,
        },
      ],
      createdAt: new Date('2024-08-01'),
      updatedAt: new Date(),
    };
  }

  private getMockReferralHistory(): Referral[] {
    return [
      {
        id: '1',
        referrerId: '1',
        refereeId: '2',
        refereeName: 'Emily Johnson',
        refereeEmail: 'emily@example.com',
        status: 'COMPLETED' as any,
        referrerReward: 25,
        refereeReward: 25,
        statusChangedAt: new Date('2024-12-05'),
        firstAppointmentDate: new Date('2024-12-05'),
        completedAt: new Date('2024-12-05'),
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2024-12-05'),
      },
      {
        id: '2',
        referrerId: '1',
        refereeId: '3',
        refereeName: 'Jessica Martinez',
        refereeEmail: 'jessica@example.com',
        status: 'FIRST_VISIT' as any,
        referrerReward: 25,
        refereeReward: 25,
        statusChangedAt: new Date('2024-12-08'),
        firstAppointmentDate: new Date('2024-12-08'),
        createdAt: new Date('2024-12-02'),
        updatedAt: new Date('2024-12-08'),
      },
      {
        id: '3',
        referrerId: '1',
        refereeEmail: 'amanda@example.com',
        status: 'SIGNED_UP' as any,
        referrerReward: 25,
        refereeReward: 25,
        statusChangedAt: new Date('2024-12-09'),
        createdAt: new Date('2024-12-09'),
        updatedAt: new Date('2024-12-09'),
      },
      {
        id: '4',
        referrerId: '1',
        refereeEmail: 'michelle@example.com',
        status: 'PENDING' as any,
        referrerReward: 25,
        refereeReward: 25,
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-10'),
      },
      {
        id: '5',
        referrerId: '1',
        refereeEmail: 'lisa@example.com',
        status: 'PENDING' as any,
        referrerReward: 25,
        refereeReward: 25,
        createdAt: new Date('2024-12-10'),
        updatedAt: new Date('2024-12-10'),
      },
    ];
  }
}

export const referralService = new ReferralService();
