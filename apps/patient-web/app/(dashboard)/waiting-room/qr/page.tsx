'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { QrCode, CheckCircle, AlertCircle } from 'lucide-react';
import { waitingRoomService } from '@/lib/services/waitingRoomService';

export default function QRCheckInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentId = searchParams.get('appointmentId') || '';
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const performCheckIn = async () => {
      if (!appointmentId) {
        setStatus('error');
        setMessage('Invalid QR code - missing appointment ID');
        return;
      }

      try {
        const response = await waitingRoomService.checkIn({ appointmentId });

        if (response.success) {
          setStatus('success');
          setMessage('Successfully checked in! Redirecting to waiting room...');
          
          // Redirect after 2 seconds
          setTimeout(() => {
            router.push('/waiting-room/status?appointmentId=' + appointmentId);
          }, 2000);
        } else {
          setStatus('error');
          setMessage(response.error || 'Check-in failed');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'An error occurred during check-in');
      }
    };

    performCheckIn();
  }, [appointmentId, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 border-t-purple-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Checking you in...</h2>
            <p className="text-gray-600">Please wait a moment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Check-In Successful!</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Check-In Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl"
            >
              Return to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
