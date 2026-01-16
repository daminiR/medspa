'use client';

import { Heart } from 'lucide-react';

interface HsaFsaBadgeProps {
  amount?: number;
  showAmount?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function HsaFsaBadge({
  amount = 0,
  showAmount = true,
  size = 'medium'
}: HsaFsaBadgeProps) {
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-2 text-sm',
    large: 'px-4 py-3 text-base'
  };

  const iconSizes = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-50 to-green-100 ${sizeClasses[size]}`}
    >
      <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full">
        <Heart className={`${iconSizes[size]} text-emerald-500`} />
      </div>
      <div>
        <p className="font-semibold text-emerald-700">HSA/FSA Eligible</p>
        {showAmount && amount > 0 && (
          <p className="font-bold text-emerald-600 text-lg">${amount.toFixed(2)}</p>
        )}
      </div>
    </div>
  );
}
