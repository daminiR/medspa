'use client';

/**
 * Login Page
 * Provides multiple authentication methods:
 * - Email magic link
 * - Phone number
 * - Google OAuth
 * - Apple OAuth
 */

import * as React from 'react';
import { Suspense } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SocialLoginButtons, OrDivider } from '@/components/auth';
import { Mail, Smartphone, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type LoginMethod = 'email' | 'phone' | 'social';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const error = searchParams.get('error');

  // Get auth methods from context
  const { sendMagicLink, sendSmsOtp, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [method, setMethod] = useState<LoginMethod>('social');
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setEmailSent(false);

    const result = await sendMagicLink(email);

    if (result.success) {
      setEmailSent(true);
      // Show "Check your email" message
    } else {
      setLocalError(result.error || 'Failed to send magic link');
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const result = await sendSmsOtp(phone);

    if (result.success) {
      // Store phone in sessionStorage for OTP page
      sessionStorage.setItem('otpPhone', phone);
      router.push('/auth/verify-otp');
    } else {
      setLocalError(result.error || 'Failed to send verification code');
    }
  };

  const resetForm = () => {
    setMethod('social');
    setEmailSent(false);
    setLocalError(null);
    setEmail('');
    setPhone('');
  };

  // Error message mapping
  const errorMessages: Record<string, string> = {
    OAuthSignin: 'Error signing in with provider. Please try again.',
    OAuthCallback: 'Error during authentication callback.',
    OAuthCreateAccount: 'Could not create account. Please try again.',
    OAuthAccountNotLinked: 'This email is linked to another account.',
    Callback: 'Authentication error. Please try again.',
    Default: 'An error occurred. Please try again.',
  };

  const errorMessage = error ? errorMessages[error] || errorMessages.Default : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          {method !== 'social' && (
            <button
              onClick={resetForm}
              className="absolute left-4 top-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to access your patient portal</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Alert */}
          {(errorMessage || localError) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {localError || errorMessage}
            </div>
          )}

          {/* Social Login (default view) */}
          {method === 'social' && (
            <>
              <SocialLoginButtons
                callbackUrl={callbackUrl}
                disabled={isLoading}
              />

              <OrDivider className="my-6" />

              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMethod('email')}
                  className="w-full justify-start gap-3"
                >
                  <Mail className="w-4 h-4" />
                  Continue with email
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMethod('phone')}
                  className="w-full justify-start gap-3"
                >
                  <Smartphone className="w-4 h-4" />
                  Continue with phone
                </Button>
              </div>
            </>
          )}

          {/* Email Login */}
          {method === 'email' && !emailSent && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Magic Link
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Email Sent Confirmation */}
          {method === 'email' && emailSent && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <Mail className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <h3 className="font-semibold text-green-800">Check your email</h3>
              <p className="text-green-600 text-sm mt-1">
                We sent a sign-in link to {email}
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="text-teal-600 text-sm mt-3 hover:underline"
              >
                Use a different email
              </button>
            </div>
          )}

          {/* Phone Login */}
          {method === 'phone' && (
            <form onSubmit={handlePhoneLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4 mr-2" />
                    Send Verification Code
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <div className="text-center text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-purple-600 hover:text-purple-700 font-medium">
              Create one
            </Link>
          </div>
          <p className="text-xs text-center text-gray-400">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-gray-600">Privacy Policy</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
