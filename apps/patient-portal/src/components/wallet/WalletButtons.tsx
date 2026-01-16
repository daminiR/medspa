'use client';

import GoogleWalletButton from './GoogleWalletButton';
import AppleWalletButton from './AppleWalletButton';
import AddToCalendarButton from './AddToCalendarButton';

interface AppointmentData {
  id: string;
  service: string;
  provider: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  address?: string;
  price?: number;
  patientName?: string;
  patientEmail?: string;
}

interface WalletButtonsProps {
  appointment: AppointmentData;
  showCalendar?: boolean;
  layout?: 'horizontal' | 'vertical' | 'grid';
  className?: string;
}

export default function WalletButtons({
  appointment,
  showCalendar = true,
  layout = 'vertical',
  className = '',
}: WalletButtonsProps) {
  const layoutClasses = {
    horizontal: 'flex flex-row flex-wrap gap-3',
    vertical: 'flex flex-col gap-3',
    grid: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
  };

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      {showCalendar && (
        <AddToCalendarButton appointment={appointment} />
      )}

      <GoogleWalletButton
        appointment={appointment}
        className="w-full"
      />

      <AppleWalletButton
        appointment={appointment}
        className="w-full"
      />
    </div>
  );
}

// Re-export individual components for convenience
export { default as GoogleWalletButton } from './GoogleWalletButton';
export { default as AppleWalletButton } from './AppleWalletButton';
export { default as AddToCalendarButton } from './AddToCalendarButton';
