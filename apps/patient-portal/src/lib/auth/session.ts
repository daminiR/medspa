/**
 * Session Management Utilities
 *
 * SECURITY NOTE: Session data is now managed by NextAuth using httpOnly cookies.
 * This module provides helper types and non-sensitive preference storage.
 *
 * For session access:
 * - Server components: use `auth()` from '@/lib/auth/next-auth'
 * - Client components: use `useSession()` from 'next-auth/react'
 */

// Storage keys (only for non-sensitive preferences)
const PASSKEY_ENABLED_KEY = 'patient_portal_passkey_enabled';
const PREFERENCES_KEY = 'patient_portal_preferences';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  membershipTier?: 'standard' | 'gold' | 'platinum';
  membershipCredits?: number;
  avatarUrl?: string;
  createdAt?: string;
}

export interface Session {
  token: string;
  expiresAt: string;
  refreshToken?: string;
}

export interface StoredSession {
  user: User;
  session: Session;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: boolean;
  passkeyEnabled?: boolean;
}

/**
 * Check if we're running in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * @deprecated Use NextAuth session management instead.
 * Sessions are now stored in secure httpOnly cookies.
 *
 * For client components: useSession() from 'next-auth/react'
 * For server components: auth() from '@/lib/auth/next-auth'
 */
export function storeSession(_user: User, _session: Session): void {
  console.warn(
    '[DEPRECATED] storeSession is deprecated. ' +
    'Sessions are now managed by NextAuth using secure httpOnly cookies.'
  );
}

/**
 * @deprecated Use NextAuth session management instead.
 * Sessions are now stored in secure httpOnly cookies.
 *
 * For client components: useSession() from 'next-auth/react'
 * For server components: auth() from '@/lib/auth/next-auth'
 */
export function getStoredSession(): StoredSession | null {
  console.warn(
    '[DEPRECATED] getStoredSession is deprecated. ' +
    'Use useSession() from next-auth/react instead.'
  );
  return null;
}

/**
 * @deprecated Use NextAuth signOut instead.
 * Call signOut() from 'next-auth/react' to clear sessions.
 */
export function clearSession(): void {
  console.warn(
    '[DEPRECATED] clearSession is deprecated. ' +
    'Use signOut() from next-auth/react instead.'
  );
  // Clear any legacy localStorage data for migration
  if (isBrowser()) {
    try {
      localStorage.removeItem('patient_portal_session');
      localStorage.removeItem('patient_portal_user');
    } catch {
      // Ignore errors during cleanup
    }
  }
}

/**
 * @deprecated User data is now managed through NextAuth session.
 */
export function updateStoredUser(_user: Partial<User>): void {
  console.warn(
    '[DEPRECATED] updateStoredUser is deprecated. ' +
    'User updates should go through your API and NextAuth will handle session refresh.'
  );
}

/**
 * Store passkey enabled flag (non-sensitive preference)
 * This is safe to store in localStorage as it's just a UI preference
 */
export function setPasskeyEnabled(enabled: boolean): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(PASSKEY_ENABLED_KEY, JSON.stringify(enabled));
  } catch (error) {
    console.error('Failed to store passkey flag:', error);
  }
}

/**
 * Check if passkey is enabled for this user/device
 */
export function isPasskeyEnabled(): boolean {
  if (!isBrowser()) return false;

  try {
    const value = localStorage.getItem(PASSKEY_ENABLED_KEY);
    return value ? JSON.parse(value) : false;
  } catch (error) {
    console.error('Failed to read passkey flag:', error);
    return false;
  }
}

/**
 * Store user preferences (non-sensitive UI preferences only)
 */
export function storePreferences(preferences: UserPreferences): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to store preferences:', error);
  }
}

/**
 * Get user preferences
 */
export function getPreferences(): UserPreferences {
  if (!isBrowser()) return {};

  try {
    const value = localStorage.getItem(PREFERENCES_KEY);
    return value ? JSON.parse(value) : {};
  } catch (error) {
    console.error('Failed to read preferences:', error);
    return {};
  }
}

/**
 * @deprecated Use NextAuth's session check instead.
 * For client: useSession().status !== 'loading' && useSession().data
 * For server: await auth() !== null
 */
export function isSessionValid(): boolean {
  console.warn(
    '[DEPRECATED] isSessionValid is deprecated. ' +
    'Use useSession() from next-auth/react to check session status.'
  );
  return false;
}

/**
 * @deprecated Session timing is now handled by NextAuth cookies.
 */
export function getSessionTimeRemaining(): number {
  console.warn(
    '[DEPRECATED] getSessionTimeRemaining is deprecated. ' +
    'Session management is now handled by NextAuth.'
  );
  return 0;
}

/**
 * Create mock user data for development/testing
 * Note: This doesn't create a real session - use NextAuth for that
 */
export function createMockUserData(): User {
  return {
    id: 'user-123',
    email: 'patient@example.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    phone: '555-0123',
    membershipTier: 'gold',
    membershipCredits: 250,
    createdAt: new Date().toISOString(),
  };
}

/**
 * @deprecated Use createMockUserData instead. Sessions should be created through NextAuth.
 */
export function createMockSession(): StoredSession {
  console.warn(
    '[DEPRECATED] createMockSession is deprecated. ' +
    'Use NextAuth for session management.'
  );
  return {
    user: createMockUserData(),
    session: {
      token: 'deprecated-mock-token',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  };
}

/**
 * Clean up legacy localStorage session data
 * Call this during migration to remove insecure session data
 */
export function cleanupLegacySessionData(): void {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem('patient_portal_session');
    localStorage.removeItem('patient_portal_user');
    console.log('[Auth] Cleaned up legacy session data from localStorage');
  } catch (error) {
    console.error('Failed to cleanup legacy session data:', error);
  }
}
