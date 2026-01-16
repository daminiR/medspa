'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, CheckCircle, Clock, RefreshCw, Smartphone } from 'lucide-react';

type QRDisplayState = 'loading' | 'waiting' | 'confirmed' | 'expired' | 'error';

interface CheckedInAppointment {
  id: string;
  patientName: string;
  serviceName: string;
  checkedInAt: string;
}

interface QRDisplayProps {
  onCheckInComplete: (appointment: CheckedInAppointment) => void;
  onCancel: () => void;
  kioskId?: string;
}

interface SessionData {
  sessionId: string;
  sessionUrl: string;
  expiresIn: number;
}

export default function QRDisplay({
  onCheckInComplete,
  onCancel,
  kioskId = 'kiosk-001',
}: QRDisplayProps) {
  const [state, setState] = useState<QRDisplayState>('loading');
  const [session, setSession] = useState<SessionData | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(90);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<CheckedInAppointment | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  // Create a new session
  const createSession = useCallback(async () => {
    cleanup();
    setState('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/kiosk/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kioskId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();

      if (!isMountedRef.current) return;

      setSession({
        sessionId: data.sessionId,
        sessionUrl: data.sessionUrl,
        expiresIn: data.expiresIn || 90,
      });
      setSecondsRemaining(data.expiresIn || 90);
      setState('waiting');

      // Start polling for session status
      startPolling(data.sessionId);
      // Start countdown timer
      startCountdown(data.expiresIn || 90);
    } catch (error) {
      if (!isMountedRef.current) return;
      setState('error');
      setErrorMessage('Unable to create check-in session. Please try again.');
    }
  }, [kioskId, cleanup]);

  // Start polling for session status
  const startPolling = useCallback((sessionId: string) => {
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/kiosk/session/${sessionId}`);

        if (!response.ok) {
          throw new Error('Failed to check session status');
        }

        const data = await response.json();

        if (!isMountedRef.current) return;

        if (data.status === 'confirmed') {
          cleanup();
          setConfirmedAppointment({
            id: data.appointmentId || '',
            patientName: data.patientName || 'Guest',
            serviceName: data.serviceName || 'Appointment',
            checkedInAt: data.checkedInAt || new Date().toISOString(),
          });
          setState('confirmed');
        } else if (data.status === 'expired') {
          cleanup();
          setState('expired');
        }
      } catch (error) {
        // Continue polling even on error, unless component unmounted
        console.error('Polling error:', error);
      }
    }, 1500);
  }, [cleanup]);

  // Start countdown timer
  const startCountdown = useCallback((initialSeconds: number) => {
    let seconds = initialSeconds;

    countdownIntervalRef.current = setInterval(() => {
      seconds -= 1;

      if (!isMountedRef.current) return;

      if (seconds <= 0) {
        cleanup();
        setState('expired');
      } else {
        setSecondsRemaining(seconds);
      }
    }, 1000);
  }, [cleanup]);

  // Initialize session on mount
  useEffect(() => {
    isMountedRef.current = true;
    createSession();

    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [createSession, cleanup]);

  // Handle successful check-in callback
  useEffect(() => {
    if (state === 'confirmed' && confirmedAppointment) {
      // Small delay to show the success animation
      const timer = setTimeout(() => {
        onCheckInComplete(confirmedAppointment);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [state, confirmedAppointment, onCheckInComplete]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle retry
  const handleRetry = () => {
    createSession();
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
      {/* Loading State */}
      {state === 'loading' && (
        <div className="animate-fade-in">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <RefreshCw className="w-12 h-12 text-purple-600 animate-spin" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Generating QR Code...
          </h2>
          <p className="text-xl text-gray-600">
            Please wait a moment
          </p>
        </div>
      )}

      {/* Waiting State - QR Code Display */}
      {state === 'waiting' && session && (
        <div className="animate-fade-in">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Smartphone className="w-10 h-10 text-purple-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Scan to Check In
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Scan with your phone to check in
          </p>

          {/* QR Code Container */}
          <div className="bg-white border-4 border-gray-200 rounded-2xl p-6 inline-block mb-6 shadow-lg">
            <QRCodeSVG
              value={session.sessionUrl}
              size={280}
              level="H"
              includeMargin={true}
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          </div>

          {/* Countdown Timer */}
          <div className={`flex items-center justify-center gap-3 mb-8 ${
            secondsRemaining <= 30 ? 'text-orange-600' : 'text-gray-600'
          }`}>
            <Clock className={`w-6 h-6 ${secondsRemaining <= 30 ? 'animate-pulse' : ''}`} />
            <span className="text-2xl font-semibold">
              Expires in {formatTime(secondsRemaining)}
            </span>
          </div>

          {/* Instructions */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4 text-left">
              <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-700 font-bold">1</span>
              </div>
              <div>
                <p className="text-lg font-medium text-purple-900">
                  Open your phone's camera and scan the QR code
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-left mt-4">
              <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-700 font-bold">2</span>
              </div>
              <div>
                <p className="text-lg font-medium text-purple-900">
                  Follow the link to complete your check-in
                </p>
              </div>
            </div>
          </div>

          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-semibold text-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      )}

      {/* Confirmed State - Success */}
      {state === 'confirmed' && confirmedAppointment && (
        <div className="animate-fade-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            You're Checked In!
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Welcome, {confirmedAppointment.patientName.split(' ')[0]}!
          </p>

          <div className="bg-gray-50 rounded-2xl p-8 mb-8 text-left">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Service</div>
                <div className="text-xl font-semibold text-gray-900">
                  {confirmedAppointment.serviceName}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Checked In At</div>
                <div className="text-xl font-semibold text-gray-900">
                  {new Date(confirmedAppointment.checkedInAt).toLocaleTimeString([], {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <p className="text-lg text-blue-900 font-medium">
              Please have a seat. We'll call you when your room is ready.
            </p>
          </div>
        </div>
      )}

      {/* Expired State */}
      {state === 'expired' && (
        <div className="animate-fade-in">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-16 h-16 text-orange-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Session Expired
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            The QR code has expired. Please try again.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-semibold text-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>

            <button
              onClick={onCancel}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-semibold text-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {state === 'error' && (
        <div className="animate-fade-in">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">!</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Something Went Wrong
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {errorMessage || 'Unable to generate QR code. Please try again or see the front desk.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-semibold text-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>

            <button
              onClick={onCancel}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-semibold text-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
