'use client';

/**
 * Authentication Context
 *
 * Manages authentication state across the Admin App
 * - User session management
 * - Token refresh
 * - Inactivity detection (90-day timeout for development)
 * - Screen lock with PIN
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  locationIds: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLocked: boolean;
  sessionId: string | null;
}

interface AuthContextType extends AuthState {
  login: (accessToken: string, refreshToken: string, user: User, sessionId: string) => void;
  logout: () => Promise<void>;
  lockScreen: () => void;
  unlockWithPIN: (pin: string) => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  extendSession: () => void;
}

// Constants
const INACTIVITY_TIMEOUT_MS = 90 * 24 * 60 * 60 * 1000; // 90 days (3 months for development)
const WARNING_BEFORE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes
const TOKEN_REFRESH_INTERVAL_MS = 10 * 60 * 1000; // Refresh every 10 minutes
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// TODO: REMOVE BEFORE PRODUCTION - Demo mode bypasses authentication
// DEMO MODE - Set to true to bypass authentication for demos
// @cleanup - Remove DEMO_MODE, DEMO_USER, DEMO_PIN, and demo mode logic before production deploy
const DEMO_MODE = true;
const DEMO_PIN = '1234'; // Demo PIN for unlocking screen in demo mode

// Demo user for demo mode
const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'demo@luxemedspa.com',
  firstName: 'Demo',
  lastName: 'User',
  role: 'admin',
  permissions: ['*'],
  locationIds: ['loc-001'],
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password'];

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // State
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isLocked: false,
    sessionId: null,
  });

  // Refs for timers
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = () => {
      if (typeof window === 'undefined') return;

      // DEMO MODE: Auto-authenticate with demo user
      if (DEMO_MODE) {
        setState({
          user: DEMO_USER,
          isAuthenticated: true,
          isLoading: false,
          isLocked: false,
          sessionId: 'demo-session',
        });
        return;
      }

      const accessToken = sessionStorage.getItem('accessToken');
      const storedUser = sessionStorage.getItem('user');
      const sessionId = sessionStorage.getItem('sessionId');

      if (accessToken && storedUser && sessionId) {
        try {
          const user = JSON.parse(storedUser);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            isLocked: false,
            sessionId,
          });
        } catch {
          // Invalid stored data, clear it
          clearStorage();
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  // Redirect based on auth state
  useEffect(() => {
    if (state.isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

    if (!state.isAuthenticated && !isPublicRoute) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || '/charting')}`);
    } else if (state.isAuthenticated && pathname === '/login') {
      router.push('/charting');
    }
  }, [state.isAuthenticated, state.isLoading, pathname, router]);

  // Setup inactivity detection (disabled in demo mode)
  useEffect(() => {
    if (DEMO_MODE) return; // Skip inactivity detection in demo mode
    if (!state.isAuthenticated || state.isLocked) return;

    const resetInactivityTimer = () => {
      // Clear existing timers
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

      // Set warning timer
      warningTimerRef.current = setTimeout(() => {
        // Dispatch event for warning UI (handled by ScreenLock component)
        window.dispatchEvent(new CustomEvent('session-timeout-warning', {
          detail: { remainingMs: WARNING_BEFORE_TIMEOUT_MS }
        }));
      }, INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_TIMEOUT_MS);

      // Set lockout timer
      inactivityTimerRef.current = setTimeout(() => {
        lockScreen();
      }, INACTIVITY_TIMEOUT_MS);
    };

    // Activity events to track
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    // Throttle activity handling
    let lastActivity = Date.now();
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity > 1000) { // Throttle to 1 second
        lastActivity = now;
        resetInactivityTimer();
      }
    };

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Initial timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    };
  }, [state.isAuthenticated, state.isLocked]);

  // Setup token refresh (disabled in demo mode)
  useEffect(() => {
    // DEMO MODE: Skip token refresh to prevent logout on failed API calls
    if (DEMO_MODE) return;
    if (!state.isAuthenticated) return;

    const refreshTokens = async () => {
      const success = await refreshSession();
      if (!success) {
        // If refresh fails, logout
        await logout();
      }
    };

    // Refresh immediately if close to expiration
    refreshTimerRef.current = setInterval(refreshTokens, TOKEN_REFRESH_INTERVAL_MS);

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [state.isAuthenticated]);

  // Clear storage
  const clearStorage = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('sessionId');
    localStorage.removeItem('refreshToken');
  };

  // Login
  const login = useCallback((
    accessToken: string,
    refreshToken: string,
    user: User,
    sessionId: string
  ) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('sessionId', sessionId);
    }

    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
      isLocked: false,
      sessionId,
    });
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem('accessToken');
      if (accessToken) {
        await fetch(`${API_BASE_URL}/api/auth/staff/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearStorage();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isLocked: false,
        sessionId: null,
      });
      router.push('/login');
    }
  }, [router]);

  // Lock screen (disabled in demo mode)
  const lockScreen = useCallback(() => {
    if (DEMO_MODE) return; // Don't lock in demo mode
    setState(prev => ({ ...prev, isLocked: true }));
  }, []);

  // Unlock with PIN
  const unlockWithPIN = useCallback(async (pin: string): Promise<boolean> => {
    if (!state.user) return false;

    // DEMO MODE: Accept demo PIN without API call
    if (DEMO_MODE) {
      if (pin === DEMO_PIN) {
        setState(prev => ({ ...prev, isLocked: false }));
        return true;
      } else {
        throw new Error('Invalid PIN. Demo PIN is: 1234');
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/staff/pin/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: state.user.id,
          pin,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'PIN verification failed');
      }

      const data = await response.json();

      // Update tokens
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('accessToken', data.accessToken);
      }

      setState(prev => ({ ...prev, isLocked: false }));
      return true;

    } catch (error) {
      console.error('PIN unlock error:', error);
      throw error;
    }
  }, [state.user]);

  // Refresh session
  const refreshSession = useCallback(async (): Promise<boolean> => {
    const refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/staff/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      // Update tokens
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('accessToken', data.accessToken);
        sessionStorage.setItem('sessionId', data.session.id);

        // Refresh token is rotated, update it
        if (localStorage.getItem('refreshToken')) {
          localStorage.setItem('refreshToken', data.refreshToken);
        } else {
          sessionStorage.setItem('refreshToken', data.refreshToken);
        }
      }

      setState(prev => ({ ...prev, sessionId: data.session.id }));
      return true;

    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }, []);

  // Check permission
  const hasPermission = useCallback((permission: string): boolean => {
    if (!state.user) return false;
    return state.user.permissions.includes(permission);
  }, [state.user]);

  // Check role
  const hasRole = useCallback((role: string): boolean => {
    if (!state.user) return false;
    return state.user.role === role;
  }, [state.user]);

  // Extend session (reset inactivity timer)
  const extendSession = useCallback(() => {
    // Dispatch activity event to reset timer
    window.dispatchEvent(new Event('keydown'));
  }, []);

  // Memoize the context value to prevent unnecessary re-renders of consuming components
  const value = useMemo<AuthContextType>(() => ({
    ...state,
    login,
    logout,
    lockScreen,
    unlockWithPIN,
    refreshSession,
    hasPermission,
    hasRole,
    extendSession,
  }), [
    state,
    login,
    logout,
    lockScreen,
    unlockWithPIN,
    refreshSession,
    hasPermission,
    hasRole,
    extendSession,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission?: string
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, hasPermission } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/login');
      }

      if (!isLoading && isAuthenticated && requiredPermission && !hasPermission(requiredPermission)) {
        router.push('/unauthorized');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      return null;
    }

    return <Component {...props} />;
  };
}
