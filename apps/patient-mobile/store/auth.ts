/**
 * Authentication Store
 *
 * Manages authentication state using Zustand with secure storage.
 * Supports:
 * - Passkey authentication (primary)
 * - Magic link fallback
 * - SMS OTP fallback
 * - Biometric authentication for returning users
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

// Storage keys
const SESSION_KEY = 'user_session';
const USER_KEY = 'user_data';
const PASSKEY_ENABLED_KEY = 'passkey_enabled';

interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  avatarUrl?: string;
  membershipTier?: 'standard' | 'gold' | 'platinum';
  membershipCredits?: number;
  createdAt: string;
}

interface Session {
  token: string;
  expiresAt: string;
  refreshToken?: string;
}

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPasskeyAvailable: boolean;
  isBiometricAvailable: boolean;
  biometricType: 'fingerprint' | 'facial' | 'iris' | null;

  // Actions
  checkAuthStatus: () => Promise<void>;
  checkBiometricAvailability: () => Promise<void>;
  login: (user: User, session: Session) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;

  // Passkey actions
  registerPasskey: (email: string, fullName: string) => Promise<{
    success: boolean;
    recoveryCodes?: string[];
    error?: string;
  }>;
  authenticateWithPasskey: (email?: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  // Fallback authentication
  sendMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyMagicLink: (token: string) => Promise<{ success: boolean; error?: string }>;
  sendSmsOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifySmsOtp: (phone: string, code: string) => Promise<{ success: boolean; error?: string }>;

  // Biometric
  authenticateWithBiometric: () => Promise<{ success: boolean; error?: string }>;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.luxemedspa.com';

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  isPasskeyAvailable: false,
  isBiometricAvailable: false,
  biometricType: null,

  /**
   * Check authentication status on app launch
   */
  checkAuthStatus: async () => {
    try {
      set({ isLoading: true });

      // Check for existing session
      const sessionJson = await SecureStore.getItemAsync(SESSION_KEY);
      const userJson = await SecureStore.getItemAsync(USER_KEY);

      if (sessionJson && userJson) {
        const session: Session = JSON.parse(sessionJson);
        const user: User = JSON.parse(userJson);

        // Check if session is expired
        if (new Date(session.expiresAt) > new Date()) {
          set({
            session,
            user,
            isAuthenticated: true,
          });
        } else {
          // Try to refresh session
          const refreshed = await get().refreshSession();
          if (!refreshed) {
            // Session expired, clear auth
            await get().logout();
          }
        }
      }

      // Check biometric availability
      await get().checkBiometricAvailability();
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Check biometric authentication availability
   */
  checkBiometricAvailability: async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

      let biometricType: 'fingerprint' | 'facial' | 'iris' | null = null;

      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'facial';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'fingerprint';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = 'iris';
      }

      // Check if passkey API is available
      const isPasskeyAvailable = typeof window !== 'undefined' &&
        window.PublicKeyCredential !== undefined;

      set({
        isBiometricAvailable: hasHardware && isEnrolled,
        biometricType,
        isPasskeyAvailable,
      });
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      set({ isBiometricAvailable: false, biometricType: null });
    }
  },

  /**
   * Store user session after successful login
   */
  login: async (user: User, session: Session) => {
    try {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

      set({
        user,
        session,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('Error storing session:', error);
      throw error;
    }
  },

  /**
   * Clear authentication state
   */
  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(SESSION_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);

      set({
        user: null,
        session: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  },

  /**
   * Refresh expired session
   */
  refreshSession: async () => {
    try {
      const { session } = get();
      if (!session?.refreshToken) return false;

      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newSession: Session = {
          token: data.token,
          expiresAt: data.expiresAt,
          refreshToken: data.refreshToken,
        };

        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(newSession));
        set({ session: newSession });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  },

  /**
   * Register a new passkey for the user
   */
  registerPasskey: async (email: string, fullName: string) => {
    try {
      // Step 1: Get registration options from server
      const optionsResponse = await fetch(`${API_BASE_URL}/api/auth/passkey/register/generate-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName }),
      });

      if (!optionsResponse.ok) {
        const error = await optionsResponse.json();
        return { success: false, error: error.message || 'Failed to generate registration options' };
      }

      const options = await optionsResponse.json();

      // Step 2: Create credential using native passkey API
      // Note: This uses the WebAuthn API which works in React Native WebView
      // For native implementation, we'd use expo-local-authentication + react-native-passkey
      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
          user: {
            ...options.user,
            id: Uint8Array.from(atob(options.user.id), c => c.charCodeAt(0)),
          },
          excludeCredentials: options.excludeCredentials?.map((cred: any) => ({
            ...cred,
            id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
          })),
        },
      });

      if (!credential) {
        return { success: false, error: 'Failed to create passkey' };
      }

      // Step 3: Verify with server
      const publicKeyCredential = credential as PublicKeyCredential;
      const response = publicKeyCredential.response as AuthenticatorAttestationResponse;

      const verifyResponse = await fetch(`${API_BASE_URL}/api/auth/passkey/register/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          credential: {
            id: credential.id,
            rawId: btoa(String.fromCharCode(...new Uint8Array(publicKeyCredential.rawId))),
            type: credential.type,
            response: {
              clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(response.clientDataJSON))),
              attestationObject: btoa(String.fromCharCode(...new Uint8Array(response.attestationObject))),
              transports: response.getTransports?.() || [],
            },
          },
        }),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        return { success: false, error: error.message || 'Failed to verify registration' };
      }

      const verifyData = await verifyResponse.json();

      // Store passkey enabled flag
      await SecureStore.setItemAsync(PASSKEY_ENABLED_KEY, 'true');

      // Login the user
      await get().login(verifyData.user, {
        token: verifyData.sessionToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });

      return {
        success: true,
        recoveryCodes: verifyData.recoveryCodes,
      };
    } catch (error: any) {
      console.error('Passkey registration error:', error);

      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'Passkey creation was cancelled or timed out' };
      }

      return { success: false, error: error.message || 'An error occurred during registration' };
    }
  },

  /**
   * Authenticate with existing passkey
   */
  authenticateWithPasskey: async (email?: string) => {
    try {
      // Step 1: Get authentication options from server
      const optionsResponse = await fetch(`${API_BASE_URL}/api/auth/passkey/authenticate/generate-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!optionsResponse.ok) {
        return { success: false, error: 'Failed to generate authentication options' };
      }

      const options = await optionsResponse.json();

      // Step 2: Get credential using native passkey API
      const credential = await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
          allowCredentials: options.allowCredentials?.map((cred: any) => ({
            ...cred,
            id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
          })),
        },
      });

      if (!credential) {
        return { success: false, error: 'Failed to get passkey' };
      }

      // Step 3: Verify with server
      const publicKeyCredential = credential as PublicKeyCredential;
      const response = publicKeyCredential.response as AuthenticatorAssertionResponse;

      const verifyResponse = await fetch(`${API_BASE_URL}/api/auth/passkey/authenticate/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: {
            id: credential.id,
            rawId: btoa(String.fromCharCode(...new Uint8Array(publicKeyCredential.rawId))),
            type: credential.type,
            response: {
              clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(response.clientDataJSON))),
              authenticatorData: btoa(String.fromCharCode(...new Uint8Array(response.authenticatorData))),
              signature: btoa(String.fromCharCode(...new Uint8Array(response.signature))),
              userHandle: response.userHandle
                ? btoa(String.fromCharCode(...new Uint8Array(response.userHandle)))
                : null,
            },
          },
        }),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        return { success: false, error: error.message || 'Authentication failed' };
      }

      const verifyData = await verifyResponse.json();

      // Login the user
      await get().login(verifyData.user, {
        token: verifyData.sessionToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      return { success: true };
    } catch (error: any) {
      console.error('Passkey authentication error:', error);

      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'Authentication was cancelled or timed out' };
      }

      return { success: false, error: error.message || 'An error occurred during authentication' };
    }
  },

  /**
   * Send magic link to email
   */
  sendMagicLink: async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/magic-link/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        return { success: true };
      }

      const error = await response.json();
      return { success: false, error: error.message || 'Failed to send magic link' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  /**
   * Verify magic link token
   */
  verifyMagicLink: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/magic-link/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();

        await get().login(data.user, {
          token: data.sessionToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

        return { success: true };
      }

      const error = await response.json();
      return { success: false, error: error.message || 'Invalid or expired link' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  /**
   * Send SMS OTP
   */
  sendSmsOtp: async (phone: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/sms-otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (response.ok) {
        return { success: true };
      }

      const error = await response.json();
      return { success: false, error: error.message || 'Failed to send code' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  /**
   * Verify SMS OTP
   */
  verifySmsOtp: async (phone: string, code: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/sms-otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });

      if (response.ok) {
        const data = await response.json();

        await get().login(data.user, {
          token: data.sessionToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

        return { success: true };
      }

      const error = await response.json();
      return { success: false, error: error.message || 'Invalid code' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Network error' };
    }
  },

  /**
   * Authenticate returning user with biometrics
   */
  authenticateWithBiometric: async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in to Luxe MedSpa',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // If biometric succeeds, try passkey auth silently
        const passkeyResult = await get().authenticateWithPasskey();
        return passkeyResult;
      }

      return { success: false, error: 'Biometric authentication failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Biometric error' };
    }
  },
}));
