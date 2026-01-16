/**
 * Authentication Library
 * Handles passkeys, magic links, and SMS OTP authentication
 */

import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
} from '@simplewebauthn/browser';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/browser';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Types
export interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface AuthResult {
  success: boolean;
  session?: Session;
  error?: string;
  requiresVerification?: boolean;
  verificationMethod?: 'email' | 'sms';
}

// Check if passkeys are supported
export function isPasskeySupported(): boolean {
  return browserSupportsWebAuthn();
}

// Register a new passkey
export async function registerPasskey(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get registration options from server
    const optionsRes = await fetch(`${API_BASE_URL}/auth/passkey/register/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
      credentials: 'include',
    });

    if (!optionsRes.ok) {
      throw new Error('Failed to get registration options');
    }

    const options: PublicKeyCredentialCreationOptionsJSON = await optionsRes.json();

    // Start WebAuthn registration
    const credential: RegistrationResponseJSON = await startRegistration({ optionsJSON: options });

    // Verify registration with server
    const verifyRes = await fetch(`${API_BASE_URL}/auth/passkey/register/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, credential }),
      credentials: 'include',
    });

    if (!verifyRes.ok) {
      throw new Error('Failed to verify registration');
    }

    return { success: true };
  } catch (error) {
    console.error('Passkey registration error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to register passkey',
    };
  }
}

// Authenticate with passkey
export async function authenticateWithPasskey(email?: string): Promise<AuthResult> {
  try {
    // Get authentication options from server
    const optionsRes = await fetch(`${API_BASE_URL}/auth/passkey/authenticate/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      credentials: 'include',
    });

    if (!optionsRes.ok) {
      throw new Error('Failed to get authentication options');
    }

    const options: PublicKeyCredentialRequestOptionsJSON = await optionsRes.json();

    // Start WebAuthn authentication
    const credential: AuthenticationResponseJSON = await startAuthentication({ optionsJSON: options });

    // Verify authentication with server
    const verifyRes = await fetch(`${API_BASE_URL}/auth/passkey/authenticate/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
      credentials: 'include',
    });

    if (!verifyRes.ok) {
      throw new Error('Failed to verify authentication');
    }

    const session: Session = await verifyRes.json();
    return { success: true, session };
  } catch (error) {
    console.error('Passkey authentication error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to authenticate with passkey',
    };
  }
}

// Request magic link
export async function requestMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/magic-link/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to send magic link');
    }

    return { success: true };
  } catch (error) {
    console.error('Magic link request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send magic link',
    };
  }
}

// Verify magic link token
export async function verifyMagicLink(token: string): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/magic-link/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      credentials: 'include',
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Invalid or expired link');
    }

    const session: Session = await res.json();
    return { success: true, session };
  } catch (error) {
    console.error('Magic link verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid or expired link',
    };
  }
}

// Request SMS OTP
export async function requestSmsOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/sms-otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to send verification code');
    }

    return { success: true };
  } catch (error) {
    console.error('SMS OTP request error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send verification code',
    };
  }
}

// Verify SMS OTP
export async function verifySmsOtp(phone: string, code: string): Promise<AuthResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/sms-otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
      credentials: 'include',
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Invalid verification code');
    }

    const session: Session = await res.json();
    return { success: true, session };
  } catch (error) {
    console.error('SMS OTP verification error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid verification code',
    };
  }
}

// Logout
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Get current session
export async function getSession(): Promise<Session | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/session`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

// Refresh session
export async function refreshSession(): Promise<Session | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('Refresh session error:', error);
    return null;
  }
}
