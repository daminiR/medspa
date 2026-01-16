'use client';

/**
 * Authentication Context
 *
 * Provides authentication state and actions throughout the app.
 * Uses NextAuth for secure session management (httpOnly cookies).
 * Supports WebAuthn/Passkey, OAuth, and fallback authentication methods.
 *
 * SECURITY: Sessions are managed by NextAuth using secure httpOnly cookies.
 * No sensitive auth data is stored in localStorage.
 */

import * as React from 'react';
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { create } from 'zustand';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';
import {
  type User,
  type Session,
  setPasskeyEnabled,
  isPasskeyEnabled,
  cleanupLegacySessionData,
} from '@/lib/auth/session';
import {
  registerPasskey,
  authenticateWithPasskey,
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  type WebAuthnRegistrationOptions,
} from '@/lib/auth/webauthn';
import { apiClient } from '@/lib/api/client';

// Auth store state interface
interface AuthState {
  // State (supplementary to NextAuth session)
  passkeyUser: User | null; // User from passkey auth (before NextAuth integration)
  passkeySession: Session | null; // Session from passkey auth
  isLoading: boolean;
  isPasskeySupported: boolean;
  isPlatformAuthenticatorAvailable: boolean;
  hasPasskeyEnabled: boolean;

  // Internal actions
  setLoading: (loading: boolean) => void;
  setPasskeySupport: (supported: boolean, platformAvailable: boolean) => void;
  setPasskeyAuth: (user: User | null, session: Session | null) => void;

  // Auth actions
  logout: () => Promise<void>;
  checkPasskeySupport: () => Promise<void>;

  // Passkey actions
  registerWithPasskey: (options: WebAuthnRegistrationOptions) => Promise<{
    success: boolean;
    recoveryCodes?: string[];
    error?: string;
  }>;
  signInWithPasskey: (email?: string) => Promise<{
    success: boolean;
    error?: string;
  }>;

  // Fallback auth actions (real API implementations)
  sendMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyMagicLink: (token: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  sendSmsOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifySmsOtp: (phone: string, code: string) => Promise<{ success: boolean; error?: string }>;
}

// Create Zustand store for supplementary auth state
export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  passkeyUser: null,
  passkeySession: null,
  isLoading: false,
  isPasskeySupported: false,
  isPlatformAuthenticatorAvailable: false,
  hasPasskeyEnabled: false,

  // Internal setters
  setLoading: (isLoading) => set({ isLoading }),
  setPasskeySupport: (supported, platformAvailable) =>
    set({
      isPasskeySupported: supported,
      isPlatformAuthenticatorAvailable: platformAvailable,
    }),
  setPasskeyAuth: (user, session) =>
    set({
      passkeyUser: user,
      passkeySession: session,
    }),

  // Check WebAuthn capabilities
  checkPasskeySupport: async () => {
    const supported = isWebAuthnSupported();
    const platformAvailable = await isPlatformAuthenticatorAvailable();
    set({
      isPasskeySupported: supported,
      isPlatformAuthenticatorAvailable: platformAvailable,
      hasPasskeyEnabled: isPasskeyEnabled(),
    });
  },

  // Logout - clear NextAuth session and local state
  logout: async () => {
    // Clear any legacy localStorage data
    cleanupLegacySessionData();

    // Clear passkey state
    set({
      passkeyUser: null,
      passkeySession: null,
    });

    // Call API client logout to clear backend session
    try {
      await apiClient.logout();
    } catch (e) {
      // Ignore logout errors
    }

    // Sign out through NextAuth (clears httpOnly cookie)
    await nextAuthSignOut({ redirect: false });
  },

  // Register with passkey
  registerWithPasskey: async (options) => {
    set({ isLoading: true });
    try {
      const result = await registerPasskey(options);

      if (result.success && result.user && result.token && result.expiresAt) {
        // Mark passkey as enabled for this device
        setPasskeyEnabled(true);

        // Store passkey auth result (will be synced with NextAuth later)
        const session: Session = {
          token: result.token,
          expiresAt: result.expiresAt,
        };

        set({
          passkeyUser: result.user,
          passkeySession: session,
          hasPasskeyEnabled: true,
        });

        return {
          success: true,
          recoveryCodes: result.recoveryCodes,
        };
      }

      return {
        success: false,
        error: result.error || 'Registration failed',
      };
    } finally {
      set({ isLoading: false });
    }
  },

  // Sign in with passkey
  signInWithPasskey: async (email) => {
    set({ isLoading: true });
    try {
      const result = await authenticateWithPasskey(email);

      if (result.success && result.user && result.token && result.expiresAt) {
        const session: Session = {
          token: result.token,
          expiresAt: result.expiresAt,
        };

        set({
          passkeyUser: result.user,
          passkeySession: session,
        });

        return { success: true };
      }

      return {
        success: false,
        error: result.error || 'Authentication failed',
      };
    } finally {
      set({ isLoading: false });
    }
  },

  // Magic link - real API implementation
  sendMagicLink: async (email) => {
    try {
      set({ isLoading: true });
      await apiClient.sendMagicLink(email);
      set({ isLoading: false });
      return { success: true };
    } catch (error: any) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  verifyMagicLink: async (token, email) => {
    try {
      set({ isLoading: true });
      const result = await apiClient.verifyMagicLink(token, email || '');
      // API client automatically stores the access token
      const user: User = {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        phone: result.user.phone,
        avatarUrl: result.user.avatarUrl,
      };
      const session: Session = {
        token: apiClient.getAccessToken() || '',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      set({
        passkeyUser: user,
        passkeySession: session,
        isLoading: false,
      });
      return { success: true };
    } catch (error: any) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  // SMS OTP - real API implementation
  sendSmsOtp: async (phone) => {
    try {
      set({ isLoading: true });
      await apiClient.sendSmsOtp(phone);
      set({ isLoading: false });
      return { success: true };
    } catch (error: any) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  verifySmsOtp: async (phone, code) => {
    try {
      set({ isLoading: true });
      const result = await apiClient.verifySmsOtp(phone, code);
      // API client automatically stores the access token
      const user: User = {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        phone: result.user.phone,
        avatarUrl: result.user.avatarUrl,
      };
      const session: Session = {
        token: apiClient.getAccessToken() || '',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };
      set({
        passkeyUser: user,
        passkeySession: session,
        isLoading: false,
      });
      return { success: true };
    } catch (error: any) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },
}));

// Combined auth state interface for consumers
interface CombinedAuthState {
  // From NextAuth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // From Zustand store
  isPasskeySupported: boolean;
  isPlatformAuthenticatorAvailable: boolean;
  hasPasskeyEnabled: boolean;

  // Actions
  logout: () => Promise<void>;
  checkPasskeySupport: () => Promise<void>;
  registerWithPasskey: AuthState['registerWithPasskey'];
  signInWithPasskey: AuthState['signInWithPasskey'];
  sendMagicLink: AuthState['sendMagicLink'];
  verifyMagicLink: AuthState['verifyMagicLink'];
  sendSmsOtp: AuthState['sendSmsOtp'];
  verifySmsOtp: AuthState['verifySmsOtp'];
}

// React context
const AuthContext = createContext<CombinedAuthState | null>(null);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: nextAuthSession, status } = useSession();
  const store = useAuthStore();

  // Initialize on mount
  useEffect(() => {
    // Clean up any legacy localStorage session data
    cleanupLegacySessionData();

    // Check passkey support
    store.checkPasskeySupport();
  }, [store]);

  // Build combined user from NextAuth session or passkey auth
  const user: User | null = React.useMemo(() => {
    // Prefer NextAuth session
    if (nextAuthSession?.user) {
      return {
        id: nextAuthSession.user.id || 'user-oauth',
        email: nextAuthSession.user.email || '',
        firstName: nextAuthSession.user.name?.split(' ')[0] || '',
        lastName: nextAuthSession.user.name?.split(' ').slice(1).join(' ') || '',
        avatarUrl: nextAuthSession.user.image || undefined,
      };
    }

    // Fall back to passkey user
    if (store.passkeyUser) {
      return store.passkeyUser;
    }

    return null;
  }, [nextAuthSession, store.passkeyUser]);

  const isAuthenticated = !!nextAuthSession?.user || !!store.passkeyUser;
  const isLoading = status === 'loading' || store.isLoading;

  // Combined auth value
  const value: CombinedAuthState = {
    user,
    isAuthenticated,
    isLoading,
    isPasskeySupported: store.isPasskeySupported,
    isPlatformAuthenticatorAvailable: store.isPlatformAuthenticatorAvailable,
    hasPasskeyEnabled: store.hasPasskeyEnabled,
    logout: store.logout,
    checkPasskeySupport: store.checkPasskeySupport,
    registerWithPasskey: store.registerWithPasskey,
    signInWithPasskey: store.signInWithPasskey,
    sendMagicLink: store.sendMagicLink,
    verifyMagicLink: store.verifyMagicLink,
    sendSmsOtp: store.sendSmsOtp,
    verifySmsOtp: store.verifySmsOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to access combined auth context
export function useAuth(): CombinedAuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Legacy hook for backward compatibility
export function useAuthContext() {
  return useAuth();
}

// Export types
export type { User, Session };
