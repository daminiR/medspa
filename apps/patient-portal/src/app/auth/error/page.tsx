'use client';

/**
 * Auth Error Page
 * Displays user-friendly error messages for authentication failures
 */

import * as React from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, RefreshCw, Home } from 'lucide-react';
import { AUTH_ERROR_MESSAGES, type AuthErrorType } from '@/types/auth';

function AuthErrorPageContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') as AuthErrorType | null;

  // Get error message or use default
  const errorMessage = error
    ? AUTH_ERROR_MESSAGES[error] || AUTH_ERROR_MESSAGES.Default
    : AUTH_ERROR_MESSAGES.Default;

  // Determine if error is recoverable
  const isRecoverable = error !== 'OAuthAccountNotLinked';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Authentication Error
          </CardTitle>
          <CardDescription className="text-gray-600">
            We encountered a problem signing you in
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error Message Box */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>

          {/* Error Code (for debugging) */}
          {error && (
            <p className="text-xs text-center text-gray-400">
              Error code: {error}
            </p>
          )}

          {/* Specific guidance based on error type */}
          {error === 'OAuthAccountNotLinked' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Tip:</strong> Try signing in with the same method you used when you first created your account.
              </p>
            </div>
          )}

          {error === 'OAuthCreateAccount' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> If this is your first time signing in, try using a different email address or sign up manually.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          {isRecoverable && (
            <Link href="/auth/login" className="w-full">
              <Button className="w-full gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </Link>
          )}

          <Link href="/auth/login" className="w-full">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Button>
          </Link>

          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full gap-2 text-gray-500">
              <Home className="w-4 h-4" />
              Go to Home
            </Button>
          </Link>

          {/* Support link */}
          <p className="text-xs text-center text-gray-400 mt-2">
            Need help?{' '}
            <Link href="/support" className="text-purple-600 hover:text-purple-700 underline">
              Contact support
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <AuthErrorPageContent />
    </Suspense>
  );
}
