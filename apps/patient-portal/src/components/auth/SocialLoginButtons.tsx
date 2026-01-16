'use client';

/**
 * Social Login Buttons Component
 * Provides Google and Apple OAuth login buttons using NextAuth 5
 */

import * as React from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import type { OAuthProvider } from '@/types/auth';

interface SocialLoginButtonsProps {
  /**
   * URL to redirect to after successful authentication
   * @default '/dashboard'
   */
  callbackUrl?: string;
  /**
   * Whether the buttons are disabled
   */
  disabled?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Display mode for buttons
   * @default 'full'
   */
  mode?: 'full' | 'compact' | 'icons';
  /**
   * Callback when sign in starts
   */
  onSignInStart?: (provider: OAuthProvider) => void;
  /**
   * Callback when sign in fails
   */
  onSignInError?: (provider: OAuthProvider, error: Error) => void;
}

/**
 * Google Icon SVG Component
 */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/**
 * Apple Icon SVG Component
 */
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

/**
 * Loading Spinner Component
 */
function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className || ''}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width="20"
      height="20"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Social Login Buttons Component
 * Renders Google and Apple OAuth login buttons
 */
export function SocialLoginButtons({
  callbackUrl = '/dashboard',
  disabled = false,
  className = '',
  mode = 'full',
  onSignInStart,
  onSignInError,
}: SocialLoginButtonsProps) {
  const [loadingProvider, setLoadingProvider] = React.useState<OAuthProvider | null>(null);

  const handleSignIn = async (provider: OAuthProvider) => {
    try {
      setLoadingProvider(provider);
      onSignInStart?.(provider);

      await signIn(provider, {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error(`[SocialLogin] Error signing in with ${provider}:`, error);
      onSignInError?.(provider, error as Error);
      setLoadingProvider(null);
    }
  };

  const isLoading = (provider: OAuthProvider) => loadingProvider === provider;
  const isDisabled = disabled || loadingProvider !== null;

  // Icon-only mode
  if (mode === 'icons') {
    return (
      <div className={`flex items-center justify-center gap-4 ${className}`}>
        <button
          onClick={() => handleSignIn('google')}
          disabled={isDisabled}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white transition-all hover:bg-gray-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Continue with Google"
        >
          {isLoading('google') ? <LoadingSpinner /> : <GoogleIcon />}
        </button>
        <button
          onClick={() => handleSignIn('apple')}
          disabled={isDisabled}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white transition-all hover:bg-gray-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Continue with Apple"
        >
          {isLoading('apple') ? <LoadingSpinner /> : <AppleIcon />}
        </button>
      </div>
    );
  }

  // Compact mode
  if (mode === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <button
          onClick={() => handleSignIn('google')}
          disabled={isDisabled}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium transition-all hover:bg-gray-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading('google') ? <LoadingSpinner /> : <GoogleIcon />}
          <span>Google</span>
        </button>
        <button
          onClick={() => handleSignIn('apple')}
          disabled={isDisabled}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-gray-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading('apple') ? <LoadingSpinner /> : <AppleIcon />}
          <span>Apple</span>
        </button>
      </div>
    );
  }

  // Full mode (default)
  return (
    <div className={`space-y-3 ${className}`}>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleSignIn('google')}
        disabled={isDisabled}
        className="flex w-full items-center justify-center gap-3 border-gray-300 bg-white px-4 py-3 text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md"
      >
        {isLoading('google') ? (
          <LoadingSpinner className="text-gray-600" />
        ) : (
          <GoogleIcon />
        )}
        <span className="font-medium">Continue with Google</span>
      </Button>

      <Button
        type="button"
        onClick={() => handleSignIn('apple')}
        disabled={isDisabled}
        className="flex w-full items-center justify-center gap-3 bg-black px-4 py-3 text-white transition-all hover:bg-gray-800 hover:shadow-md"
      >
        {isLoading('apple') ? (
          <LoadingSpinner className="text-white" />
        ) : (
          <AppleIcon />
        )}
        <span className="font-medium">Continue with Apple</span>
      </Button>
    </div>
  );
}

/**
 * Or Divider Component
 * Used to separate social login from other login methods
 */
export function OrDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white px-4 text-gray-500">or</span>
      </div>
    </div>
  );
}

export default SocialLoginButtons;
