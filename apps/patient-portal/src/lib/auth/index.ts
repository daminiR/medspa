/**
 * Auth Library Index
 *
 * Re-exports all authentication utilities for convenient importing.
 */

// NextAuth utilities (for social login)
export {
  auth,
  signIn,
  signOut,
  handlers,
  getServerSession,
  isAuthenticated,
  getCurrentUser,
} from './next-auth';

// WebAuthn utilities
export {
  isWebAuthnSupported,
  isWebAuthnAutofillSupported,
  isPlatformAuthenticatorAvailable,
  registerPasskey,
  authenticateWithPasskey,
  getPasskeyCapabilities,
  type WebAuthnRegistrationOptions,
  type WebAuthnRegistrationResult,
  type WebAuthnAuthenticationResult,
} from './webauthn';

// Session utilities
export {
  storeSession,
  getStoredSession,
  clearSession,
  updateStoredUser,
  setPasskeyEnabled,
  isPasskeyEnabled,
  isSessionValid,
  getSessionTimeRemaining,
  createMockSession,
  type User,
  type Session,
  type StoredSession,
} from './session';
