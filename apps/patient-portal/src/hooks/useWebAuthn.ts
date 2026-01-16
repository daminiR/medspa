'use client';

/**
 * useWebAuthn Hook
 *
 * Specialized hook for WebAuthn/Passkey operations.
 * Provides capabilities detection, registration, and authentication.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  isWebAuthnSupported,
  isWebAuthnAutofillSupported,
  isPlatformAuthenticatorAvailable,
  registerPasskey,
  authenticateWithPasskey,
  getPasskeyCapabilities,
  type WebAuthnRegistrationOptions,
  type WebAuthnRegistrationResult,
  type WebAuthnAuthenticationResult,
} from '@/lib/auth/webauthn';

export interface PasskeyCapabilities {
  isSupported: boolean;
  isAutofillSupported: boolean;
  isPlatformAuthenticatorAvailable: boolean;
  isLoading: boolean;
}

export interface UseWebAuthnReturn {
  // Capabilities
  capabilities: PasskeyCapabilities;
  refreshCapabilities: () => Promise<void>;

  // Registration
  isRegistering: boolean;
  registrationError: string | null;
  register: (
    options: WebAuthnRegistrationOptions
  ) => Promise<WebAuthnRegistrationResult>;
  clearRegistrationError: () => void;

  // Authentication
  isAuthenticating: boolean;
  authenticationError: string | null;
  authenticate: (email?: string) => Promise<WebAuthnAuthenticationResult>;
  clearAuthenticationError: () => void;
}

export function useWebAuthn(): UseWebAuthnReturn {
  // Capabilities state
  const [capabilities, setCapabilities] = useState<PasskeyCapabilities>({
    isSupported: false,
    isAutofillSupported: false,
    isPlatformAuthenticatorAvailable: false,
    isLoading: true,
  });

  // Registration state
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );

  // Authentication state
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authenticationError, setAuthenticationError] = useState<string | null>(
    null
  );

  // Load capabilities on mount
  useEffect(() => {
    async function loadCapabilities() {
      try {
        const caps = await getPasskeyCapabilities();
        setCapabilities({
          ...caps,
          isLoading: false,
        });
      } catch (error) {
        console.error('Failed to load passkey capabilities:', error);
        setCapabilities({
          isSupported: false,
          isAutofillSupported: false,
          isPlatformAuthenticatorAvailable: false,
          isLoading: false,
        });
      }
    }

    loadCapabilities();
  }, []);

  // Refresh capabilities
  const refreshCapabilities = useCallback(async () => {
    setCapabilities((prev) => ({ ...prev, isLoading: true }));
    try {
      const caps = await getPasskeyCapabilities();
      setCapabilities({
        ...caps,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to refresh passkey capabilities:', error);
      setCapabilities((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Register a new passkey
  const register = useCallback(
    async (
      options: WebAuthnRegistrationOptions
    ): Promise<WebAuthnRegistrationResult> => {
      setIsRegistering(true);
      setRegistrationError(null);

      try {
        const result = await registerPasskey(options);

        if (!result.success && result.error) {
          setRegistrationError(result.error);
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Registration failed';
        setRegistrationError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsRegistering(false);
      }
    },
    []
  );

  // Authenticate with existing passkey
  const authenticate = useCallback(
    async (email?: string): Promise<WebAuthnAuthenticationResult> => {
      setIsAuthenticating(true);
      setAuthenticationError(null);

      try {
        const result = await authenticateWithPasskey(email);

        if (!result.success && result.error) {
          setAuthenticationError(result.error);
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Authentication failed';
        setAuthenticationError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsAuthenticating(false);
      }
    },
    []
  );

  // Clear error states
  const clearRegistrationError = useCallback(() => {
    setRegistrationError(null);
  }, []);

  const clearAuthenticationError = useCallback(() => {
    setAuthenticationError(null);
  }, []);

  return {
    // Capabilities
    capabilities,
    refreshCapabilities,

    // Registration
    isRegistering,
    registrationError,
    register,
    clearRegistrationError,

    // Authentication
    isAuthenticating,
    authenticationError,
    authenticate,
    clearAuthenticationError,
  };
}

export default useWebAuthn;

// Additional utility hooks

/**
 * Simple hook to check if passkeys are supported
 */
export function usePasskeySupport(): {
  isSupported: boolean;
  isLoading: boolean;
} {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsSupported(isWebAuthnSupported());
    setIsLoading(false);
  }, []);

  return { isSupported, isLoading };
}

/**
 * Hook to check platform authenticator availability
 */
export function usePlatformAuthenticator(): {
  isAvailable: boolean;
  isLoading: boolean;
} {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        const available = await isPlatformAuthenticatorAvailable();
        setIsAvailable(available);
      } catch {
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    }
    check();
  }, []);

  return { isAvailable, isLoading };
}
