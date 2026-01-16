/**
 * Check-In Button Component (Web)
 * Large, prominent button for one-tap check-in
 */

'use client';

import React from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

interface CheckInButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export default function CheckInButton({
  onPress,
  loading = false,
  disabled = false,
  label = "I'm Here!",
}: CheckInButtonProps) {
  const isDisabled = disabled || loading;
  
  return (
    <button
      onClick={onPress}
      disabled={isDisabled}
      className={
        'w-full h-18 rounded-2xl font-bold text-xl text-white flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl ' +
        (isDisabled
          ? 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed opacity-60'
          : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:scale-95')
      }
    >
      {loading ? (
        <Loader2 className="w-8 h-8 animate-spin" />
      ) : (
        <>
          <CheckCircle className="w-8 h-8" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
