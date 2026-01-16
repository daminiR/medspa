/**
 * Wallet Integration Services
 *
 * Exports all wallet-related functionality for the patient portal.
 */

// ICS Calendar Generator
export {
  generateICS,
  downloadICS,
  downloadAppointmentICS,
  createEventFromAppointment,
  getGoogleCalendarUrl,
  getOutlookUrl,
  getOffice365Url,
  getYahooCalendarUrl,
  type ICSEvent,
  type AppointmentForCalendar,
} from './icsGenerator';

// Google Wallet Integration
export {
  generateGoogleWalletPass,
  addToGoogleWallet,
  createJWTPayload,
  getWalletPassPreview as getGoogleWalletPreview,
  type AppointmentData as GoogleWalletAppointment,
  type WalletPassResult as GoogleWalletResult,
} from './googleWallet';

// Apple Wallet Integration
export {
  generateAppleWalletPass,
  addToAppleWallet,
  isAppleWalletAvailable,
  createPassTemplate,
  generateMockPass,
  getPassPreview as getAppleWalletPreview,
  type AppointmentDetails as AppleWalletAppointment,
  type GeneratePassResult as AppleWalletResult,
  type PassJson,
} from './appleWallet';
