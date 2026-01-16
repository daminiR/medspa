'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface AppointmentDetails {
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

interface AppleWalletButtonProps {
  appointment: AppointmentDetails;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export default function AppleWalletButton({
  appointment,
  className = '',
  variant = 'outline',
}: AppleWalletButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if user is on iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
  }, []);

  const handleAddToAppleWallet = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/wallet/apple/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: appointment.id, appointment }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate wallet pass');
      }

      // Get the blob and create download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `appointment-${appointment.id}.pkpass`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (isIOS) {
        alert(
          'Apple Wallet pass downloaded!\n\n' +
          'Tap the downloaded file to add it to your Apple Wallet.'
        );
      } else {
        alert(
          'Apple Wallet pass downloaded! (Mock)\n\n' +
          'On iOS devices, tap the downloaded file to add it to Apple Wallet.\n\n' +
          'Note: Apple Wallet is only available on iOS devices.'
        );
      }
    } catch (error) {
      console.error('Failed to generate Apple Wallet pass:', error);
      alert('Failed to generate wallet pass. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToAppleWallet}
      disabled={isLoading}
      variant={variant}
      className={`${className} ${variant === 'default' ? 'bg-black text-white hover:bg-gray-800' : ''}`}
    >
      <svg
        className="w-5 h-5 mr-2"
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      {isLoading ? 'Downloading...' : 'Add to Apple Wallet'}
    </Button>
  );
}
