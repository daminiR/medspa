/**
 * WebAuthn Client Utilities
 *
 * Client-side utilities for WebAuthn/Passkey authentication using @simplewebauthn/browser.
 * Handles registration and authentication flows.
 */

import {
  startRegistration,
  startAuthentication,
  browserSupportsWebAuthn,
  browserSupportsWebAuthnAutofill,
  platformAuthenticatorIsAvailable,
} from '@simplewebauthn/browser';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/types';

// API endpoints
const API_BASE = '/api/auth/passkey';

export interface WebAuthnRegistrationOptions {
  email: string;
  fullName: string;
  phone?: string;
}

export interface WebAuthnRegistrationResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  token?: string;
  expiresAt?: string;
  recoveryCodes?: string[];
  error?: string;
}

export interface WebAuthnAuthenticationResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  token?: string;
  expiresAt?: string;
  error?: string;
}

/**
 * Check if WebAuthn is supported in this browser
 */
export function isWebAuthnSupported(): boolean {
  return browserSupportsWebAuthn();
}

/**
 * Check if WebAuthn autofill is supported (conditional UI)
 */
export async function isWebAuthnAutofillSupported(): Promise<boolean> {
  return browserSupportsWebAuthnAutofill();
}

/**
 * Check if platform authenticator (Touch ID, Face ID, Windows Hello) is available
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  return platformAuthenticatorIsAvailable();
}

/**
 * Register a new passkey for a user
 *
 * Flow:
 * 1. Request registration options from server
 * 2. Start WebAuthn registration ceremony (browser prompts user)
 * 3. Send credential to server for verification
 * 4. Return session on success
 */
export async function registerPasskey(
  options: WebAuthnRegistrationOptions
): Promise<WebAuthnRegistrationResult> {
  try {
    // Step 1: Get registration options from server
    const optionsResponse = await fetch(`${API_BASE}/register/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: options.email,
        fullName: options.fullName,
        phone: options.phone,
      }),
    });

    if (!optionsResponse.ok) {
      const error = await optionsResponse.json();
      return {
        success: false,
        error: error.message || 'Failed to get registration options',
      };
    }

    const registrationOptions: PublicKeyCredentialCreationOptionsJSON =
      await optionsResponse.json();

    // Step 2: Start registration ceremony
    // This will prompt the user to create a passkey
    let credential: RegistrationResponseJSON;
    try {
      credential = await startRegistration({ optionsJSON: registrationOptions });
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'InvalidStateError') {
        return {
          success: false,
          error: 'A passkey already exists for this account',
        };
      }
      if (error.name === 'NotAllowedError') {
        return {
          success: false,
          error: 'Passkey creation was cancelled or timed out',
        };
      }
      throw error;
    }

    // Step 3: Verify registration with server
    const verifyResponse = await fetch(`${API_BASE}/register/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: options.email,
        credential,
      }),
    });

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json();
      return {
        success: false,
        error: error.message || 'Failed to verify registration',
      };
    }

    const verifyResult = await verifyResponse.json();

    return {
      success: true,
      user: verifyResult.user,
      token: verifyResult.token,
      expiresAt: verifyResult.expiresAt,
      recoveryCodes: verifyResult.recoveryCodes,
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Passkey registration error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Authenticate with an existing passkey
 *
 * Flow:
 * 1. Request authentication options from server
 * 2. Start WebAuthn authentication ceremony (browser prompts user)
 * 3. Send assertion to server for verification
 * 4. Return session on success
 */
export async function authenticateWithPasskey(
  email?: string
): Promise<WebAuthnAuthenticationResult> {
  try {
    // Step 1: Get authentication options from server
    const optionsResponse = await fetch(`${API_BASE}/authenticate/options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!optionsResponse.ok) {
      const error = await optionsResponse.json();
      return {
        success: false,
        error: error.message || 'Failed to get authentication options',
      };
    }

    const authOptions: PublicKeyCredentialRequestOptionsJSON =
      await optionsResponse.json();

    // Step 2: Start authentication ceremony
    // This will prompt the user to use their passkey
    let credential: AuthenticationResponseJSON;
    try {
      credential = await startAuthentication({ optionsJSON: authOptions });
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'NotAllowedError') {
        return {
          success: false,
          error: 'Authentication was cancelled or timed out',
        };
      }
      throw error;
    }

    // Step 3: Verify authentication with server
    const verifyResponse = await fetch(`${API_BASE}/authenticate/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json();
      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    }

    const verifyResult = await verifyResponse.json();

    return {
      success: true,
      user: verifyResult.user,
      token: verifyResult.token,
      expiresAt: verifyResult.expiresAt,
    };
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Passkey authentication error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Get passkey capabilities for the current browser/device
 */
export async function getPasskeyCapabilities(): Promise<{
  isSupported: boolean;
  isAutofillSupported: boolean;
  isPlatformAuthenticatorAvailable: boolean;
}> {
  const [isAutofillSupported, platformAvailable] = await Promise.all([
    isWebAuthnAutofillSupported(),
    isPlatformAuthenticatorAvailable(),
  ]);

  return {
    isSupported: isWebAuthnSupported(),
    isAutofillSupported,
    isPlatformAuthenticatorAvailable: platformAvailable,
  };
}
