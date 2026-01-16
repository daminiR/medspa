'use client';

/**
 * Magic Link Verification Page
 * Handles the verification when patient clicks the magic link from email
 * URL format: /auth/verify?token=xxx&email=xxx
 */

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type VerificationState = 'verifying' | 'success' | 'error';

interface ErrorInfo {
  message: string;
  description: string;
}

function VerifyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [state, setState] = useState<VerificationState>('verifying');
  const [errorInfo, setErrorInfo] = useState<ErrorInfo>({
    message: 'Invalid link',
    description: 'The verification link is invalid or malformed.',
  });

  useEffect(() => {
    const verifyMagicLink = async () => {
      // Validate params exist
      if (!token || !email) {
        setState('error');
        setErrorInfo({
          message: 'Invalid link',
          description: 'The verification link is missing required parameters.',
        });
        return;
      }

      try {
        const response = await fetch('/api/auth/patient/magic-link/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email }),
        });

        if (response.ok) {
          setState('success');
          // Auto-redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          // Handle specific error codes
          const status = response.status;
          let errorData: ErrorInfo;

          switch (status) {
            case 410:
              errorData = {
                message: 'Link expired',
                description: 'This magic link has expired. Please request a new one to sign in.',
              };
              break;
            case 401:
              errorData = {
                message: 'Link already used',
                description: 'This magic link has already been used. Each link can only be used once.',
              };
              break;
            case 400:
            default:
              errorData = {
                message: 'Invalid link',
                description: 'The verification link is invalid or malformed. Please request a new one.',
              };
              break;
          }

          setState('error');
          setErrorInfo(errorData);
        }
      } catch (error) {
        console.error('Magic link verification error:', error);
        setState('error');
        setErrorInfo({
          message: 'Verification failed',
          description: 'Unable to verify your link. Please check your connection and try again.',
        });
      }
    };

    verifyMagicLink();
  }, [token, email, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Verifying State */}
        {state === 'verifying' && (
          <>
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Signing you in...
            </h1>
            <p className="text-gray-600">
              Please wait while we verify your magic link.
            </p>
          </>
        )}

        {/* Success State */}
        {state === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-once">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back!
            </h1>
            <p className="text-gray-600 mb-4">
              You have been successfully signed in.
            </p>
            <div className="flex items-center justify-center gap-2 text-teal-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Redirecting to dashboard...</span>
            </div>
          </>
        )}

        {/* Error State */}
        {state === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {errorInfo.message}
            </h1>
            <p className="text-gray-600 mb-6">
              {errorInfo.description}
            </p>
            <Link href="/auth/login">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                Request new link
              </Button>
            </Link>
          </>
        )}

        {/* Medical Spa Branding */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Glow MedSpa Patient Portal
          </p>
        </div>
      </div>

      {/* Custom animation for success checkmark */}
      <style jsx global>{`
        @keyframes bounce-once {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-once {
          animation: bounce-once 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Loading...
            </h1>
          </div>
        </div>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
}
