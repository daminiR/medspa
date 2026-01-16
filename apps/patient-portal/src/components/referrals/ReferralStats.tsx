'use client';

import { Users, UserCheck, Clock, TrendingUp, Gift, Percent } from 'lucide-react';

interface ReferralStatsProps {
  totalReferred: number;
  completed: number;
  pending: number;
  totalPointsEarned: number;
  conversionRate?: number;
}

export default function ReferralStats({
  totalReferred,
  completed,
  pending,
  totalPointsEarned,
  conversionRate,
}: ReferralStatsProps) {
  const calculatedConversionRate =
    conversionRate ?? (totalReferred > 0 ? (completed / totalReferred) * 100 : 0);

  const stats = [
    {
      label: 'Total Referred',
      value: totalReferred,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Friends you invited',
    },
    {
      label: 'Completed',
      value: completed,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Booked appointments',
    },
    {
      label: 'Pending',
      value: pending,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Awaiting booking',
    },
    {
      label: 'Points Earned',
      value: totalPointsEarned.toLocaleString(),
      icon: Gift,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'From referrals',
      suffix: 'pts',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">
                  {stat.value}
                  {stat.suffix && (
                    <span className="text-sm font-medium text-gray-500 ml-1">
                      {stat.suffix}
                    </span>
                  )}
                </p>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Conversion Rate Card */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Conversion Rate</span>
            </div>
            <p className="text-sm text-purple-100">
              How many referrals book appointments
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">
              {calculatedConversionRate.toFixed(0)}%
            </p>
            <div className="flex items-center gap-1 text-sm text-purple-100">
              <Percent className="w-3 h-3" />
              <span>success rate</span>
            </div>
          </div>
        </div>

        {/* Mini Progress Bar */}
        <div className="mt-4">
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${Math.min(calculatedConversionRate, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-purple-100">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm text-gray-600">
            {completed} successful referral{completed !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="text-sm font-semibold text-purple-600">
          ${(completed * 25).toLocaleString()} earned
        </div>
      </div>
    </div>
  );
}
