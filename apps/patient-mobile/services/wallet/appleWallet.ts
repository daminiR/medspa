/**
 * Apple Wallet Integration Service
 *
 * Handles generation, addition, and updating of Apple Wallet passes for appointments.
 * Uses PKPass format with QR codes for easy check-in at the clinic.
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ============================================================================
// Types
// ============================================================================

export interface AppointmentDetails {
  id: string;
  service: string;
  provider: string;
  date: Date;
  duration: number;
  location: string;
  locationAddress: string;
  locationPhone?: string;
  price: number;
  confirmationNumber?: string;
  patientName?: string;
  patientId?: string;
}

export interface PassUpdatePayload {
  date?: Date;
  provider?: string;
  location?: string;
  locationAddress?: string;
  status?: 'confirmed' | 'cancelled' | 'rescheduled';
}

export interface GeneratePassResult {
  success: boolean;
  passUri?: string;
  error?: string;
}

export interface PassField {
  key: string;
  label: string;
  value: string;
  changeMessage?: string;
}

export interface PassJson {
  formatVersion: number;
  passTypeIdentifier: string;
  serialNumber: string;
  teamIdentifier: string;
  organizationName: string;
  description: string;
  logoText: string;
  foregroundColor: string;
  backgroundColor: string;
  labelColor: string;
  relevantDate?: string;
  locations?: Array<{
    latitude: number;
    longitude: number;
    relevantText: string;
  }>;
  barcode: {
    message: string;
    format: string;
    messageEncoding: string;
    altText?: string;
  };
  eventTicket: {
    primaryFields: PassField[];
    secondaryFields: PassField[];
    auxiliaryFields: PassField[];
    backFields: PassField[];
  };
}

// ============================================================================
// Constants
// ============================================================================

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'https://api.luxemedspa.com';
const PASS_TYPE_IDENTIFIER = 'pass.com.luxemedspa.appointment';
const TEAM_IDENTIFIER = 'YOUR_TEAM_ID'; // Replace with actual Apple Developer Team ID

const BRAND_COLORS = {
  background: '#8B5CF6', // Brand purple
  foreground: '#FFFFFF',
  label: '#F5F3FF',
};

const LOCATION_DETAILS: Record<string, { address: string; phone: string; lat: number; lng: number }> = {
  'Beverly Hills': {
    address: '123 Luxury Ave, Beverly Hills, CA 90210',
    phone: '(310) 555-0123',
    lat: 34.0736,
    lng: -118.4004,
  },
  'Santa Monica': {
    address: '456 Ocean Blvd, Santa Monica, CA 90401',
    phone: '(310) 555-0456',
    lat: 34.0195,
    lng: -118.4912,
  },
  'Malibu': {
    address: '789 Pacific Coast Hwy, Malibu, CA 90265',
    phone: '(310) 555-0789',
    lat: 34.0259,
    lng: -118.7798,
  },
};

const CANCELLATION_POLICY = `Cancellation Policy:
- Free cancellation up to 24 hours before your appointment
- Cancellations within 24 hours may incur a 50% fee
- No-shows will be charged the full service amount

To reschedule or cancel, please call us or use the Luxe MedSpa app.`;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Formats a date for display on the pass
 */
function formatDateForPass(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Formats a time for display on the pass
 */
function formatTimeForPass(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Formats date to ISO 8601 format for relevantDate field
 */
function formatISODate(date: Date): string {
  return date.toISOString();
}

/**
 * Generates a unique confirmation number if not provided
 */
function generateConfirmationNumber(appointmentId: string): string {
  const prefix = 'LX';
  const now = Date.now();
  const timestamp = now.toString(36).toUpperCase().slice(-4);
  const idPart = appointmentId.slice(-4).toUpperCase();
  return prefix + timestamp + idPart;
}

/**
 * Creates the QR code data for check-in
 */
function generateQRCodeData(appointment: AppointmentDetails): string {
  const confirmNum = appointment.confirmationNumber || generateConfirmationNumber(appointment.id);
  return JSON.stringify({
    type: 'appointment_checkin',
    appointmentId: appointment.id,
    confirmationNumber: confirmNum,
    patientId: appointment.patientId,
    timestamp: Date.now(),
  });
}

/**
 * Gets location details for a given location name
 */
function getLocationDetails(locationName: string) {
  return LOCATION_DETAILS[locationName] || LOCATION_DETAILS['Beverly Hills'];
}

// ============================================================================
// Pass Template Generation
// ============================================================================

/**
 * Creates the pass.json structure for an appointment
 */
export function createPassTemplate(appointment: AppointmentDetails): PassJson {
  const confirmationNumber = appointment.confirmationNumber || generateConfirmationNumber(appointment.id);
  const locationDetails = getLocationDetails(appointment.location);
  const endTime = new Date(appointment.date.getTime() + appointment.duration * 60000);
  const serialNumber = 'APT-' + appointment.id + '-' + Date.now().toString();

  return {
    formatVersion: 1,
    passTypeIdentifier: PASS_TYPE_IDENTIFIER,
    serialNumber: serialNumber,
    teamIdentifier: TEAM_IDENTIFIER,
    organizationName: 'Luxe MedSpa',
    description: appointment.service + ' Appointment',
    logoText: 'Luxe MedSpa',
    foregroundColor: BRAND_COLORS.foreground,
    backgroundColor: BRAND_COLORS.background,
    labelColor: BRAND_COLORS.label,
    relevantDate: formatISODate(appointment.date),
    locations: [
      {
        latitude: locationDetails.lat,
        longitude: locationDetails.lng,
        relevantText: 'Your ' + appointment.service + ' appointment is nearby!',
      },
    ],
    barcode: {
      message: generateQRCodeData(appointment),
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1',
      altText: confirmationNumber,
    },
    eventTicket: {
      primaryFields: [
        {
          key: 'service',
          label: 'SERVICE',
          value: appointment.service,
          changeMessage: 'Your service has been updated to %@',
        },
      ],
      secondaryFields: [
        {
          key: 'date',
          label: 'DATE',
          value: formatDateForPass(appointment.date),
          changeMessage: 'Your appointment date has been changed to %@',
        },
        {
          key: 'time',
          label: 'TIME',
          value: formatTimeForPass(appointment.date) + ' - ' + formatTimeForPass(endTime),
          changeMessage: 'Your appointment time has been changed to %@',
        },
      ],
      auxiliaryFields: [
        {
          key: 'provider',
          label: 'PROVIDER',
          value: appointment.provider,
          changeMessage: 'Your provider has been changed to %@',
        },
        {
          key: 'location',
          label: 'LOCATION',
          value: appointment.location,
        },
      ],
      backFields: [
        {
          key: 'confirmationNumber',
          label: 'Confirmation Number',
          value: confirmationNumber,
        },
        {
          key: 'address',
          label: 'Address',
          value: appointment.locationAddress || locationDetails.address,
        },
        {
          key: 'phone',
          label: 'Phone',
          value: appointment.locationPhone || locationDetails.phone,
        },
        {
          key: 'duration',
          label: 'Duration',
          value: appointment.duration + ' minutes',
        },
        {
          key: 'price',
          label: 'Price',
          value: '$' + appointment.price.toFixed(2),
        },
        {
          key: 'cancellationPolicy',
          label: 'Cancellation Policy',
          value: CANCELLATION_POLICY,
        },
        {
          key: 'website',
          label: 'Website',
          value: 'https://portal.luxemedspa.com',
        },
        {
          key: 'appLink',
          label: 'Manage Appointment',
          value: 'Open the Luxe MedSpa app to reschedule or cancel',
        },
      ],
    },
  };
}

// ============================================================================
// Main API Functions
// ============================================================================

/**
 * Generates an Apple Wallet pass for an appointment.
 *
 * This function calls our backend API which handles the actual PKPass generation
 * including signing with Apple certificates. The mobile app receives the
 * generated .pkpass file which can then be added to Apple Wallet.
 *
 * @param appointment - The appointment details to generate a pass for
 * @returns Promise with the result containing the pass URI or error
 */
export async function generateAppleWalletPass(
  appointment: AppointmentDetails
): Promise<GeneratePassResult> {
  try {
    // Check if we're on iOS - Apple Wallet is only available on iOS
    if (Platform.OS !== 'ios') {
      return {
        success: false,
        error: 'Apple Wallet is only available on iOS devices',
      };
    }

    // Create the pass template data
    const passTemplate = createPassTemplate(appointment);

    // Call the backend API to generate the signed PKPass
    const response = await fetch(API_BASE_URL + '/api/wallet/generate-pass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add auth headers - should be handled by auth interceptor in real app
      },
      body: JSON.stringify({
        appointmentId: appointment.id,
        passData: passTemplate,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Server error: ' + response.status);
    }

    // Get the pass file as base64 or blob
    const data = await response.json();

    if (!data.passBase64) {
      throw new Error('Invalid response: missing pass data');
    }

    // Save the pass to a temporary file
    const passFileName = 'appointment_' + appointment.id + '.pkpass';
    const passUri = FileSystem.cacheDirectory + passFileName;

    await FileSystem.writeAsStringAsync(passUri, data.passBase64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return {
      success: true,
      passUri,
    };
  } catch (error) {
    console.error('Error generating Apple Wallet pass:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate pass',
    };
  }
}

/**
 * Adds an appointment to Apple Wallet.
 *
 * This is the main function called from UI components. It generates the pass
 * and opens it so iOS can prompt the user to add it to their Wallet.
 *
 * @param appointmentId - The ID of the appointment
 * @param appointmentDetails - Optional pre-fetched appointment details
 * @returns Promise with success status and optional error message
 */
export async function addToAppleWallet(
  appointmentId: string,
  appointmentDetails?: AppointmentDetails
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check platform
    if (Platform.OS !== 'ios') {
      return {
        success: false,
        error: 'Apple Wallet is only available on iOS devices',
      };
    }

    let appointment = appointmentDetails;

    // If appointment details not provided, fetch them
    if (!appointment) {
      const response = await fetch(API_BASE_URL + '/api/appointments/' + appointmentId);

      if (!response.ok) {
        throw new Error('Failed to fetch appointment details');
      }

      const data = await response.json();
      appointment = {
        id: data.id,
        service: data.service,
        provider: data.provider,
        date: new Date(data.date),
        duration: data.duration,
        location: data.location,
        locationAddress: data.locationAddress,
        locationPhone: data.locationPhone,
        price: data.price,
        confirmationNumber: data.confirmationNumber,
        patientName: data.patientName,
        patientId: data.patientId,
      };
    }

    // Generate the pass
    const result = await generateAppleWalletPass(appointment);

    if (!result.success || !result.passUri) {
      return {
        success: false,
        error: result.error || 'Failed to generate pass',
      };
    }

    // Check if sharing is available (needed for opening .pkpass files)
    const isSharingAvailable = await Sharing.isAvailableAsync();

    if (isSharingAvailable) {
      // Open the pass file - iOS will recognize .pkpass and offer to add to Wallet
      await Sharing.shareAsync(result.passUri, {
        mimeType: 'application/vnd.apple.pkpass',
        dialogTitle: 'Add to Apple Wallet',
        UTI: 'com.apple.pkpass',
      });
    } else {
      // Fallback: Try opening with WebBrowser (less reliable)
      await WebBrowser.openBrowserAsync(result.passUri);
    }

    // Clean up the temporary file after a delay
    const passUriToDelete = result.passUri;
    setTimeout(async () => {
      try {
        await FileSystem.deleteAsync(passUriToDelete, { idempotent: true });
      } catch {
        // Ignore cleanup errors
      }
    }, 60000); // Clean up after 1 minute

    return { success: true };
  } catch (error) {
    console.error('Error adding to Apple Wallet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add to wallet',
    };
  }
}

/**
 * Updates an existing Apple Wallet pass.
 *
 * When appointment details change (reschedule, provider change, etc.),
 * this function sends push notifications to update passes that have
 * been added to users' wallets.
 *
 * Note: This requires the backend to have stored the device tokens
 * when passes were initially added.
 *
 * @param appointmentId - The ID of the appointment to update
 * @param updates - The fields to update on the pass
 * @returns Promise with success status and optional error message
 */
export async function updateAppleWalletPass(
  appointmentId: string,
  updates: PassUpdatePayload
): Promise<{ success: boolean; error?: string }> {
  try {
    // The actual pass update is handled server-side via Apple's Push Notification Service
    // for passes (APNS for passes). The client just notifies the server of changes.
    const response = await fetch(API_BASE_URL + '/api/wallet/update-pass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appointmentId,
        updates: {
          ...updates,
          date: updates.date?.toISOString(),
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Server error: ' + response.status);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Failed to update pass');
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating Apple Wallet pass:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update pass',
    };
  }
}

/**
 * Checks if Apple Wallet passes are supported on this device.
 *
 * @returns boolean indicating if Apple Wallet is available
 */
export function isAppleWalletAvailable(): boolean {
  return Platform.OS === 'ios';
}

/**
 * Revokes/invalidates an Apple Wallet pass.
 *
 * Called when an appointment is cancelled. Sends a push notification
 * to remove or mark the pass as void.
 *
 * @param appointmentId - The ID of the appointment to revoke
 * @returns Promise with success status and optional error message
 */
export async function revokeAppleWalletPass(
  appointmentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(API_BASE_URL + '/api/wallet/revoke-pass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ appointmentId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Server error: ' + response.status);
    }

    return { success: true };
  } catch (error) {
    console.error('Error revoking Apple Wallet pass:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to revoke pass',
    };
  }
}

// ============================================================================
// Development/Testing Utilities
// ============================================================================

/**
 * Generates a mock pass for development/testing without calling the API.
 * This creates a local file that simulates what the pass would look like.
 *
 * @param appointment - The appointment details
 * @returns Promise with the result containing the pass template data
 */
export async function generateMockPass(
  appointment: AppointmentDetails
): Promise<{ success: boolean; passData?: PassJson; error?: string }> {
  try {
    const passTemplate = createPassTemplate(appointment);
    return {
      success: true,
      passData: passTemplate,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate mock pass',
    };
  }
}
