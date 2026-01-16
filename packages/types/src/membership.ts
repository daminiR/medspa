/**
 * Membership & Rewards Types
 */

export type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'vip';

export interface Membership {
  id: string;
  patientId: string;
  tier: MembershipTier;

  // Points
  currentPoints: number;
  lifetimePoints: number;
  pointsToNextTier?: number;
  nextTier?: MembershipTier;

  // Savings
  totalSavings: number;
  yearToDateSavings: number;

  // Benefits
  discountPercentage: number;
  freeServices: number;
  priorityBooking: boolean;
  exclusiveOffers: boolean;

  // Status
  status: 'active' | 'inactive' | 'expired';
  startDate: string;
  renewalDate?: string;

  createdAt: string;
  updatedAt: string;
}

export interface PointsTransaction {
  id: string;
  membershipId: string;
  type: 'earned' | 'redeemed' | 'expired' | 'adjustment';
  amount: number;
  balance: number;
  description: string;
  relatedId?: string;
  relatedType?: 'appointment' | 'referral' | 'purchase' | 'reward';
  createdAt: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'free_service' | 'product' | 'upgrade';
  value: number;
  valueType: 'percentage' | 'fixed';

  // Restrictions
  minTier?: MembershipTier;
  serviceIds?: string[];
  validDays: number;
  maxRedemptions?: number;
  currentRedemptions: number;

  // Status
  active: boolean;
  startDate?: string;
  endDate?: string;

  imageUrl?: string;
}

export interface RedeemedReward {
  id: string;
  membershipId: string;
  rewardId: string;
  rewardName: string;
  pointsSpent: number;
  status: 'active' | 'used' | 'expired';
  code?: string;
  expiresAt: string;
  usedAt?: string;
  usedForAppointmentId?: string;
  createdAt: string;
}
