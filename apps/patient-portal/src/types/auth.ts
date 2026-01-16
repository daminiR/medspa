/**
 * Auth-related TypeScript types for the Patient Portal
 * Supports NextAuth 5 with Google and Apple OAuth providers
 */

import type { DefaultSession } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

/**
 * Supported OAuth providers
 */
export type OAuthProvider = 'google' | 'apple';

/**
 * Extended user type with additional fields
 */
export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  provider?: OAuthProvider;
  emailVerified?: Date | null;
}

/**
 * Extended session type with user information
 */
export interface AuthSession {
  user: AuthUser & DefaultSession['user'];
  expires: string;
  accessToken?: string;
  error?: string;
}

/**
 * Extended JWT type with additional claims
 */
export interface AuthToken extends JWT {
  id?: string;
  provider?: OAuthProvider;
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
}

/**
 * Sign in result type
 */
export interface SignInResult {
  ok: boolean;
  error?: string;
  status?: number;
  url?: string | null;
}

/**
 * Sign out result type
 */
export interface SignOutResult {
  url: string;
}

/**
 * Auth error types
 */
export type AuthErrorType =
  | 'OAuthSignin'
  | 'OAuthCallback'
  | 'OAuthCreateAccount'
  | 'EmailCreateAccount'
  | 'Callback'
  | 'OAuthAccountNotLinked'
  | 'EmailSignin'
  | 'CredentialsSignin'
  | 'SessionRequired'
  | 'Default';

/**
 * Auth error with descriptive message
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
}

/**
 * Map of error types to user-friendly messages
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorType, string> = {
  OAuthSignin: 'Error occurred while signing in with the provider.',
  OAuthCallback: 'Error occurred during the authentication callback.',
  OAuthCreateAccount: 'Error creating your account with the provider.',
  EmailCreateAccount: 'Error creating your email account.',
  Callback: 'An error occurred during the callback process.',
  OAuthAccountNotLinked: 'This email is already associated with another account.',
  EmailSignin: 'Error sending the sign-in email.',
  CredentialsSignin: 'Invalid credentials provided.',
  SessionRequired: 'You must be signed in to access this page.',
  Default: 'An unexpected error occurred. Please try again.',
};

/**
 * Social login button props
 */
export interface SocialLoginButtonProps {
  provider: OAuthProvider;
  callbackUrl?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  error: string | null;
}

/**
 * Module augmentation for NextAuth types
 * Extends the default NextAuth types with our custom fields
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      provider?: OAuthProvider;
    } & DefaultSession['user'];
    accessToken?: string;
    error?: string;
  }

  interface User {
    id: string;
    provider?: OAuthProvider;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    provider?: OAuthProvider;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}
