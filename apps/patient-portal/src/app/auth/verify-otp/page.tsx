'use client';

/**
 * OTP Verification Page
 * Handles SMS OTP verification after patient enters phone number
 * Features:
 * - 6 separate input boxes for OTP digits
 * - Auto-advance on digit entry
 * - Backspace navigation
 * - Paste support
 * - Auto-submit on complete
 * - Resend code with cooldown
 * - Error handling with shake animation
 */

import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Smartphone, RefreshCw, CheckCircle, AlertCircle, Lock } from 'lucide-react';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

// Shake animation keyframes injected into document head
const shakeKeyframes = `
@keyframes otp-shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}
.otp-shake {
  animation: otp-shake 0.5s ease-in-out;
}
`;

export default function VerifyOtpPage() {
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // State
  const [phone, setPhone] = useState<string>('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Mask phone number: (XXX) XXX-1234
  const maskPhone = useCallback((phoneNumber: string): string => {
    // Remove all non-digits
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length < 4) return phoneNumber;
    const lastFour = digits.slice(-4);
    return `(XXX) XXX-${lastFour}`;
  }, []);

  // Inject shake animation styles on mount
  useEffect(() => {
    const styleId = 'otp-shake-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = shakeKeyframes;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById(styleId);
      if (style) {
        style.remove();
      }
    };
  }, []);

  // Check for phone in sessionStorage on mount
  useEffect(() => {
    const storedPhone = sessionStorage.getItem('otpPhone');
    if (!storedPhone) {
      router.push('/auth/login');
      return;
    }
    setPhone(storedPhone);
    // Start with a cooldown to prevent immediate resend spam
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  }, [router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Lockout timer
  useEffect(() => {
    if (!lockoutTime) return;

    const timer = setInterval(() => {
      const remaining = Math.max(0, lockoutTime - Date.now());
      if (remaining <= 0) {
        setLockoutTime(null);
        setError(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutTime]);

  // Auto-submit when all digits are filled
  useEffect(() => {
    const code = otp.join('');
    // Check that every digit is filled (not just that the joined string has 6 chars)
    const allFilled = otp.every(digit => digit !== '');
    if (allFilled && code.length === OTP_LENGTH && !loading && !lockoutTime) {
      verifyOtp(code);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, loading, lockoutTime]);

  // Focus first input on mount
  useEffect(() => {
    if (phone) {
      inputRefs.current[0]?.focus();
    }
  }, [phone]);

  const verifyOtp = async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/patient/sms-otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });

      if (response.status === 429) {
        // Rate limited - too many attempts
        const data = await response.json();
        const retryAfter = data.retryAfter || 60;
        setLockoutTime(Date.now() + retryAfter * 1000);
        setError(`Too many attempts. Please try again in ${retryAfter} seconds.`);
        triggerShake();
        clearOtp();
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || 'Invalid verification code. Please try again.');
        triggerShake();
        clearOtp();
        return;
      }

      // Success
      setVerificationSuccess(true);
      sessionStorage.removeItem('otpPhone');

      // Brief delay to show success state
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch {
      setError('Something went wrong. Please try again.');
      triggerShake();
      clearOtp();
    } finally {
      setLoading(false);
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const clearOtp = () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  };

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, '').slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Clear error on input
    if (error && !lockoutTime) {
      setError(null);
    }

    // Auto-advance to next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current input is empty, move to previous
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
      e.preventDefault();
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, OTP_LENGTH);

    if (digits.length > 0) {
      const newOtp = Array(OTP_LENGTH).fill('');
      for (let i = 0; i < digits.length; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);

      // Focus the next empty input or last input
      const nextIndex = Math.min(digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isResending || lockoutTime) return;

    setIsResending(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/patient/sms-otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (response.status === 429) {
        const data = await response.json();
        const retryAfter = data.retryAfter || 60;
        setLockoutTime(Date.now() + retryAfter * 1000);
        setError(`Too many requests. Please try again in ${retryAfter} seconds.`);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to resend code');
      }

      // Reset cooldown
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      clearOtp();
    } catch {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const getLockoutRemaining = () => {
    if (!lockoutTime) return 0;
    return Math.ceil((lockoutTime - Date.now()) / 1000);
  };

  // Don't render until we've checked for phone
  if (!phone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-teal-50 p-4">
        <div className="animate-pulse text-teal-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-teal-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center relative">
          <Link
            href="/auth/login"
            className="absolute left-4 top-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {verificationSuccess ? (
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          ) : lockoutTime ? (
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-2">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
          ) : (
            <div className="w-16 h-16 mx-auto bg-teal-100 rounded-full flex items-center justify-center mb-2">
              <Smartphone className="w-8 h-8 text-teal-600" />
            </div>
          )}

          <CardTitle className="text-2xl font-bold">
            {verificationSuccess ? 'Verified!' : 'Verify your phone'}
          </CardTitle>
          <CardDescription>
            {verificationSuccess ? (
              'Redirecting to your dashboard...'
            ) : lockoutTime ? (
              `Account temporarily locked. Try again in ${getLockoutRemaining()}s`
            ) : (
              <>
                Enter the 6-digit code sent to
                <br />
                <span className="font-medium text-gray-700">{maskPhone(phone)}</span>
              </>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* OTP Input Boxes */}
          {!verificationSuccess && (
            <div
              className={`flex justify-center gap-2 sm:gap-3 ${isShaking ? 'otp-shake' : ''}`}
              onPaste={handlePaste}
            >
              {Array(OTP_LENGTH).fill(0).map((_, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  value={otp[index]}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading || !!lockoutTime}
                  className={`
                    w-12 h-14 sm:w-14 sm:h-16
                    text-center text-2xl font-semibold
                    border-2 rounded-lg
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
                    disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
                    ${otp[index]
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                    }
                    ${error && !lockoutTime ? 'border-red-300' : ''}
                  `}
                  aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                />
              ))}
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center gap-2 text-teal-600">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-medium">Verifying...</span>
            </div>
          )}

          {/* Resend Code */}
          {!verificationSuccess && !lockoutTime && (
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Didn&apos;t receive the code?</p>
              {resendCooldown > 0 ? (
                <span className="text-sm text-gray-400">
                  Resend in {resendCooldown}s
                </span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend code
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Link
            href="/auth/login"
            className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
          >
            Use a different number
          </Link>
          <p className="text-xs text-center text-gray-400">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
