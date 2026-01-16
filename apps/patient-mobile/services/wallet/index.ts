/**
 * Wallet Services Index
 *
 * Exports all wallet-related services and types for easy importing.
 *
 * Apple Wallet (iOS):
 * - generateAppleWalletPass: Creates PKPass structure for backend signing
 * - addToAppleWallet: Generates and opens pass for adding to wallet
 * - updateAppleWalletPass: Updates existing pass via push notification
 * - revokeAppleWalletPass: Voids a cancelled appointment pass
 * - isAppleWalletAvailable: Checks if Apple Wallet is supported
 * - createPassTemplate: Generates the pass.json structure
 *
 * Google Wallet (Android):
 * - generateGoogleWalletPass: Creates JWT payload for backend signing
 * - addToGoogleWallet: Generates and opens save URL
 * - updateGoogleWalletPass: Updates existing pass via API
 * - isGoogleWalletAvailable: Checks if Google Wallet is available
 * - getWalletPassPreview: Generates preview data for UI
 */

// ============================================================================
// Apple Wallet exports
// ============================================================================

export {
  // Main functions
  generateAppleWalletPass,
  addToAppleWallet,
  updateAppleWalletPass,
  revokeAppleWalletPass,
  isAppleWalletAvailable,
  // Template generation
  createPassTemplate,
  // Development utilities
  generateMockPass,
  // Types
  type AppointmentDetails,
  type PassUpdatePayload,
  type GeneratePassResult,
  type PassField,
  type PassJson,
} from './appleWallet';

// ============================================================================
// Google Wallet exports
// ============================================================================

export {
  // Main functions
  generateGoogleWalletPass,
  addToGoogleWallet,
  updateGoogleWalletPass,
  isGoogleWalletAvailable,
  // Preview utilities
  getWalletPassPreview,
  // Types
  type AppointmentData,
  type GoogleWalletPassConfig,
  type WalletClassObject,
  type WalletObjectData,
  type GoogleWalletJWTPayload,
  type WalletPassResult,
  type WalletUpdateResult,
} from './googleWallet';
