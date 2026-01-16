'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as auth from '@/lib/auth';

interface User {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPasskey: (email?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithSms: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await auth.getSession();
        if (session) {
          setUser(session.user);
        }
      } catch (error) {
        console.error('Failed to get session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, []);

  // Login with magic link
  const login = useCallback(async (email: string) => {
    const result = await auth.requestMagicLink(email);
    return result;
  }, []);

  // Login with passkey
  const loginWithPasskey = useCallback(async (email?: string) => {
    const result = await auth.authenticateWithPasskey(email);
    if (result.success && result.session) {
      setUser(result.session.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  }, []);

  // Login with SMS
  const loginWithSms = useCallback(async (phone: string) => {
    const result = await auth.requestSmsOtp(phone);
    return result;
  }, []);

  // Verify OTP
  const verifyOtp = useCallback(async (phone: string, code: string) => {
    const result = await auth.verifySmsOtp(phone, code);
    if (result.success && result.session) {
      setUser(result.session.user);
      return { success: true };
    }
    return { success: false, error: result.error };
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await auth.logout();
    setUser(null);
    router.push('/');
  }, [router]);

  // Refresh session
  const refreshSession = useCallback(async () => {
    const session = await auth.refreshSession();
    if (session) {
      setUser(session.user);
    } else {
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithPasskey,
    loginWithSms,
    verifyOtp,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
