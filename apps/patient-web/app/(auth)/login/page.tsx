'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail,
  Phone,
  Key,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Check,
  AlertCircle,
} from 'lucide-react';
import { isPasskeySupported } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

type AuthMethod = 'select' | 'email' | 'phone' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, loginWithPasskey, loginWithSms, verifyOtp, isAuthenticated } = useAuth();

  const [authMethod, setAuthMethod] = useState<AuthMethod>('select');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passkeySupported, setPasskeySupported] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/appointments';

  useEffect(() => {
    setPasskeySupported(isPasskeySupported());
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  const handlePasskeyLogin = async () => {
    setIsLoading(true);
    setError('');

    const result = await loginWithPasskey();
    
    if (result.success) {
      router.push(redirectTo);
    } else {
      setError(result.error || 'Passkey authentication failed');
    }
    
    setIsLoading(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await login(email);
    
    if (result.success) {
      setSuccess('Check your email for a magic link to sign in');
    } else {
      setError(result.error || 'Failed to send magic link');
    }
    
    setIsLoading(false);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await loginWithSms(phone);
    
    if (result.success) {
      setAuthMethod('otp');
    } else {
      setError(result.error || 'Failed to send verification code');
    }
    
    setIsLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById('otp-' + (index + 1));
      nextInput?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every(digit => digit) && index === 5) {
      handleOtpSubmit(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById('otp-' + (index - 1));
      prevInput?.focus();
    }
  };

  const handleOtpSubmit = async (code?: string) => {
    setIsLoading(true);
    setError('');

    const result = await verifyOtp(phone, code || otp.join(''));
    
    if (result.success) {
      router.push(redirectTo);
    } else {
      setError(result.error || 'Invalid verification code');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to home
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          {/* Auth method selection */}
          {authMethod === 'select' && (
            <div className="space-y-4">
              {/* Passkey option */}
              {passkeySupported && (
                <button
                  onClick={handlePasskeyLogin}
                  disabled={isLoading}
                  className="w-full card p-4 flex items-center hover:shadow-md transition-shadow group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mr-4 group-hover:bg-primary-200 transition-colors">
                    <Key className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">Sign in with Passkey</div>
                    <div className="text-sm text-gray-500">Use Face ID, Touch ID, or security key</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </button>
              )}

              {/* Email option */}
              <button
                onClick={() => setAuthMethod('email')}
                className="w-full card p-4 flex items-center hover:shadow-md transition-shadow group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center mr-4 group-hover:bg-accent-200 transition-colors">
                  <Mail className="w-6 h-6 text-accent-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">Sign in with Email</div>
                  <div className="text-sm text-gray-500">We will send you a magic link</div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-accent-600 transition-colors" />
              </button>

              {/* Phone option */}
              <button
                onClick={() => setAuthMethod('phone')}
                className="w-full card p-4 flex items-center hover:shadow-md transition-shadow group"
              >
                <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center mr-4 group-hover:bg-success-200 transition-colors">
                  <Phone className="w-6 h-6 text-success-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900">Sign in with Phone</div>
                  <div className="text-sm text-gray-500">We will send you a verification code</div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-success-600 transition-colors" />
              </button>

              {/* Create account link */}
              <div className="text-center pt-6 border-t border-gray-200 mt-6">
                <p className="text-gray-600">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="text-primary-600 font-medium hover:text-primary-700">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          )}

          {/* Email form */}
          {authMethod === 'email' && (
            <div className="card p-6">
              <button
                onClick={() => {
                  setAuthMethod('select');
                  setError('');
                  setSuccess('');
                }}
                className="text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </button>

              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-success-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
                  <p className="text-gray-600 mb-6">{success}</p>
                  <button
                    onClick={() => {
                      setSuccess('');
                      setEmail('');
                    }}
                    className="text-primary-600 font-medium hover:text-primary-700"
                  >
                    Try a different email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sign in with email</h3>

                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-error-50 text-error-700 flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <div className="mb-4">
                    <label htmlFor="email" className="label mb-1 block">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input"
                      required
                      autoComplete="email"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="btn-primary btn-lg w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending link...
                      </>
                    ) : (
                      <>
                        Send magic link
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Phone form */}
          {authMethod === 'phone' && (
            <div className="card p-6">
              <button
                onClick={() => {
                  setAuthMethod('select');
                  setError('');
                }}
                className="text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </button>

              <form onSubmit={handlePhoneSubmit}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sign in with phone</h3>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-error-50 text-error-700 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="phone" className="label mb-1 block">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="input"
                    required
                    autoComplete="tel"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !phone}
                  className="btn-primary btn-lg w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    <>
                      Send verification code
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* OTP form */}
          {authMethod === 'otp' && (
            <div className="card p-6">
              <button
                onClick={() => {
                  setAuthMethod('phone');
                  setError('');
                  setOtp(['', '', '', '', '', '']);
                }}
                className="text-gray-500 hover:text-gray-700 mb-4 inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </button>

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter verification code</h3>
                <p className="text-gray-600 text-sm">
                  We sent a 6-digit code to {phone}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-error-50 text-error-700 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={'otp-' + index}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <button
                onClick={() => handleOtpSubmit()}
                disabled={isLoading || otp.some(d => !d)}
                className="btn-primary btn-lg w-full mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify'
                )}
              </button>

              <button
                onClick={handlePhoneSubmit}
                disabled={isLoading}
                className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
              >
                Didn&apos;t receive the code? <span className="font-medium text-primary-600">Resend</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
