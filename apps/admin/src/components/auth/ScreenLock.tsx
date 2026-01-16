'use client';

/**
 * Screen Lock Component
 *
 * Shows a PIN entry overlay when the session is locked due to inactivity.
 * Also shows a warning before the session times out.
 *
 * Features:
 * - PIN keypad input (4-6 digits)
 * - Timeout warning modal
 * - "Switch User" option for full re-login
 * - Lockout handling after failed attempts
 */

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Lock, LogOut, AlertCircle, Clock } from 'lucide-react';

// TODO: REMOVE BEFORE PRODUCTION - Demo mode disables screen lock
// @cleanup - Remove DEMO_MODE check before production deploy
const DEMO_MODE = true;

export function ScreenLock() {
  const { isLocked, isAuthenticated, user, unlockWithPIN, logout } = useAuth();

  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningCountdown, setWarningCountdown] = useState(120); // 2 minutes

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when locked
  useEffect(() => {
    if (DEMO_MODE) return; // Skip in demo mode
    if (isLocked && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLocked]);

  // Listen for timeout warning
  useEffect(() => {
    if (DEMO_MODE) return; // Skip in demo mode
    const handleWarning = (e: CustomEvent<{ remainingMs: number }>) => {
      setShowWarning(true);
      setWarningCountdown(Math.ceil(e.detail.remainingMs / 1000));
    };

    window.addEventListener('session-timeout-warning', handleWarning as EventListener);
    return () => {
      window.removeEventListener('session-timeout-warning', handleWarning as EventListener);
    };
  }, []);

  // Countdown timer for warning
  useEffect(() => {
    if (DEMO_MODE) return; // Skip in demo mode
    if (!showWarning || warningCountdown <= 0) return;

    const timer = setInterval(() => {
      setWarningCountdown(prev => {
        if (prev <= 1) {
          setShowWarning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showWarning, warningCountdown]);

  // DEMO MODE: Don't render screen lock at all
  if (DEMO_MODE) {
    return null;
  }

  // Handle PIN input
  const handlePinChange = (value: string) => {
    // Only allow digits and max 6 characters
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setPin(cleaned);
    setError(null);
  };

  // Handle keypad button click
  const handleKeypadClick = (digit: string) => {
    if (digit === 'clear') {
      setPin('');
    } else if (digit === 'backspace') {
      setPin(prev => prev.slice(0, -1));
    } else if (pin.length < 6) {
      setPin(prev => prev + digit);
    }
    setError(null);
  };

  // Handle PIN submit
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await unlockWithPIN(pin);
      setPin('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid PIN');
      setPin('');
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Dismiss warning and extend session
  const handleExtendSession = () => {
    setShowWarning(false);
    // Activity was already detected by clicking the button
  };

  // Format countdown time
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't render if not authenticated or not locked/warning
  if (!isAuthenticated) return null;

  // Warning Modal
  if (showWarning && !isLocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-amber-100 rounded-full">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Session Timeout Warning</h2>
              <p className="text-gray-500">Your session will expire due to inactivity</p>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-amber-600 mb-2">
              {formatCountdown(warningCountdown)}
            </div>
            <p className="text-sm text-gray-500">until automatic lock</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleExtendSession}
              className="flex-1"
            >
              Stay Signed In
            </Button>
            <Button
              onClick={() => logout()}
              variant="outline"
              className="flex-1"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Lock Screen
  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Screen Locked</h2>
          <p className="text-gray-500 text-sm mt-1">
            Enter your PIN to unlock
          </p>
          {user && (
            <p className="text-sm text-gray-600 mt-2">
              {user.firstName} {user.lastName}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* PIN Display */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="flex justify-center gap-2 mb-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`w-10 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                    pin.length > i
                      ? 'border-purple-500 bg-purple-50'
                      : pin.length === i
                      ? 'border-purple-400'
                      : 'border-gray-200'
                  }`}
                >
                  {pin.length > i && (
                    <div className="w-3 h-3 bg-purple-600 rounded-full" />
                  )}
                </div>
              ))}
            </div>

            {/* Hidden input for accessibility */}
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => handlePinChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              className="sr-only"
              autoFocus
            />
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'backspace'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleKeypadClick(key)}
                disabled={loading}
                className={`h-14 rounded-lg font-semibold text-lg transition-all ${
                  key === 'clear' || key === 'backspace'
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm'
                    : 'bg-gray-50 text-gray-900 hover:bg-purple-100 hover:text-purple-700'
                } disabled:opacity-50`}
              >
                {key === 'clear' ? 'Clear' : key === 'backspace' ? '⌫' : key}
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || pin.length < 4}
            className="w-full mb-4"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying...
              </span>
            ) : (
              'Unlock'
            )}
          </Button>
        </form>

        {/* Switch User Link */}
        <button
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Switch User
        </button>

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-6">
          Locked due to inactivity. Contact admin if you forgot your PIN.
        </p>
      </div>
    </div>
  );
}
