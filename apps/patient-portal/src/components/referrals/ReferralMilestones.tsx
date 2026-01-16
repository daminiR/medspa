'use client';

import { Trophy, Star, Crown, Award, Gift, Sparkles } from 'lucide-react';

interface Milestone {
  id: string;
  count: number;
  title: string;
  description: string;
  reward: number;
  icon: 'trophy' | 'star' | 'crown' | 'award' | 'gift' | 'sparkles';
  achieved: boolean;
}

interface ReferralMilestonesProps {
  totalReferrals: number;
  milestones?: Milestone[];
}

const defaultMilestones: Milestone[] = [
  {
    id: '1',
    count: 1,
    title: 'First Share',
    description: 'Make your first referral',
    reward: 500,
    icon: 'gift',
    achieved: false,
  },
  {
    id: '2',
    count: 5,
    title: 'Rising Star',
    description: 'Refer 5 friends',
    reward: 750,
    icon: 'star',
    achieved: false,
  },
  {
    id: '3',
    count: 10,
    title: 'Ambassador',
    description: 'Refer 10 friends',
    reward: 1000,
    icon: 'award',
    achieved: false,
  },
  {
    id: '4',
    count: 25,
    title: 'VIP',
    description: 'Refer 25 friends',
    reward: 2500,
    icon: 'trophy',
    achieved: false,
  },
  {
    id: '5',
    count: 50,
    title: 'Elite',
    description: 'Refer 50 friends',
    reward: 5000,
    icon: 'crown',
    achieved: false,
  },
];

const iconMap = {
  trophy: Trophy,
  star: Star,
  crown: Crown,
  award: Award,
  gift: Gift,
  sparkles: Sparkles,
};

export default function ReferralMilestones({
  totalReferrals,
  milestones = defaultMilestones,
}: ReferralMilestonesProps) {
  // Update milestone achievement status based on totalReferrals
  const updatedMilestones = milestones.map((milestone) => ({
    ...milestone,
    achieved: totalReferrals >= milestone.count,
  }));

  // Find next milestone
  const nextMilestone = updatedMilestones.find((m) => !m.achieved);
  const progress = nextMilestone
    ? (totalReferrals / nextMilestone.count) * 100
    : 100;

  return (
    <div className="space-y-6">
      {/* Progress to Next Milestone */}
      {nextMilestone && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">
                Next: {nextMilestone.title}
              </h3>
              <p className="text-sm text-gray-600">{nextMilestone.description}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">
                {totalReferrals}/{nextMilestone.count}
              </p>
              <p className="text-sm text-gray-500">referrals</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {nextMilestone.count - totalReferrals} more to unlock
            </span>
            <span className="text-sm font-semibold text-purple-600">
              +{nextMilestone.reward} pts reward
            </span>
          </div>
        </div>
      )}

      {/* All Milestones Completed */}
      {!nextMilestone && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 text-center">
          <Crown className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900">
            All Milestones Achieved!
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            You&apos;re a referral champion!
          </p>
        </div>
      )}

      {/* Milestone Badges */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Milestone Badges</h3>
        <div className="grid grid-cols-5 gap-3">
          {updatedMilestones.map((milestone) => {
            const IconComponent = iconMap[milestone.icon];
            return (
              <div
                key={milestone.id}
                className={`relative flex flex-col items-center p-3 rounded-xl transition-all ${
                  milestone.achieved
                    ? 'bg-gradient-to-br from-purple-100 to-pink-100 shadow-md'
                    : 'bg-gray-100 opacity-50'
                }`}
              >
                <div
                  className={`p-2 rounded-full ${
                    milestone.achieved
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <span
                  className={`mt-2 text-xs font-medium text-center ${
                    milestone.achieved ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {milestone.count}
                </span>
                <span
                  className={`text-[10px] text-center ${
                    milestone.achieved ? 'text-purple-600' : 'text-gray-400'
                  }`}
                >
                  {milestone.title}
                </span>
                {milestone.achieved && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Points Summary */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Milestone Bonus Points Earned</p>
            <p className="text-xs text-gray-500 mt-0.5">
              From completing milestones
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-purple-600">
              +
              {updatedMilestones
                .filter((m) => m.achieved)
                .reduce((sum, m) => sum + m.reward, 0)
                .toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">bonus points</p>
          </div>
        </div>
      </div>
    </div>
  );
}
