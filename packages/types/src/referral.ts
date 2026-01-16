/**
 * Referral Program Types
 */

export interface ReferralProgram {
  id: string;
  userId: string;
  referralCode: string;
  totalReferrals: number;
  pendingReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  availableCredits: number;
  milestones: ReferralMilestone[];
  shareUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Referral {
  id: string;
  referrerId: string;
  refereeId?: string;
  refereeEmail?: string;
  refereePhone?: string;
  refereeName?: string;
  status: ReferralStatus;
  referrerReward: number;
  refereeReward: number;
  statusChangedAt?: Date;
  firstAppointmentDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReferralStatus {
  PENDING = 'PENDING',
  SIGNED_UP = 'SIGNED_UP',
  FIRST_VISIT = 'FIRST_VISIT',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface ReferralReward {
  id: string;
  referralId: string;
  userId: string;
  amount: number;
  type: 'REFERRER' | 'REFEREE';
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'EXPIRED';
  expiresAt?: Date;
  appliedToBookingId?: string;
  appliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReferralMilestone {
  id: string;
  count: number;
  title: string;
  description: string;
  reward: number;
  icon: string;
  achieved: boolean;
  achievedAt?: Date;
}

export interface ShareReferralRequest {
  method: 'SMS' | 'EMAIL' | 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'TWITTER' | 'COPY';
  recipients?: string[];
  message?: string;
}

export interface ShareReferralResponse {
  success: boolean;
  shareId: string;
  trackingUrl: string;
}

export interface ApplyReferralCodeRequest {
  code: string;
  userId?: string;
}

export interface ApplyReferralCodeResponse {
  success: boolean;
  referralId: string;
  reward: number;
  message: string;
}

export interface ReferralProgramConfig {
  referrerReward: number;
  refereeReward: number;
  refereeMinimumSpend: number;
  referralExpiration: number; // days
  maxReferralsPerUser?: number;
  enabled: boolean;
}

export interface ReferralStats {
  totalShares: number;
  clickThroughRate: number;
  conversionRate: number;
  topChannels: Array<{
    method: string;
    shares: number;
    conversions: number;
  }>;
}
