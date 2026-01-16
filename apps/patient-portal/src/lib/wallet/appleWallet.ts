/**
 * Apple Wallet Integration Service (Web Platform)
 *
 * Mock implementation for web platform - generates PKPass structure that would
 * be used with Apple Wallet in production.
 *
 * In production, PKPass files would be generated server-side with Apple
 * Developer certificates for signing.
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AppointmentDetails {
  id: string;
  service: string;
  provider: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  address?: string;
  price?: number;
  patientName?: string;
  patientEmail?: string;
  confirmationNumber?: string;
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

export interface GeneratePassResult {
  success: boolean;
  passData?: PassJson;
  downloadUrl?: string;
  error?: string;
}

// ============================================================================
// Constants
// ============================================================================

const PASS_TYPE_IDENTIFIER = 'pass.com.glowmedspa.appointment';
const TEAM_IDENTIFIER = 'MOCK_TEAM_ID';

const BRAND_COLORS = {
  background: '#8B5CF6', // Brand purple
  foreground: '#FFFFFF',
  label: '#F5F3FF',
};

const LOCATION_DETAILS: Record<string, { address: string; phone: string; lat: number; lng: number }> = {
  'Downtown Medical Spa': {
    address: '123 Main St, Suite 200, San Francisco, CA 94102',
    phone: '(555) 123-4567',
    lat: 37.7749,
    lng: -122.4194,
  },
  'Glow Medical Spa': {
    address: '123 Wellness Way, San Francisco, CA 94102',
    phone: '(555) 123-4567',
    lat: 37.7849,
    lng: -122.4094,
  },
};

const CANCELLATION_POLICY = `Cancellation Policy:
- Free cancellation up to 24 hours before your appointment
- Cancellations within 24 hours may incur a 50% fee
- No-shows will be charged the full service amount

To reschedule or cancel, please call us or use the Glow MedSpa portal.`;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parses appointment date and time strings into a Date object
 */
function parseAppointmentDateTime(dateStr: string, timeStr: string): Date {
  const datePart = new Date(dateStr);
  const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);

  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    const isPM = timeMatch[3].toUpperCase() === 'PM';

    if (isPM && hours !== 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    datePart.setHours(hours, minutes, 0, 0);
  }

  return datePart;
}

/**
 * Parses duration string like "30 minutes" into minutes number
 */
function parseDuration(durationStr: string): number {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 60;
}

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
  const prefix = 'GL';
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
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
    timestamp: Date.now(),
  });
}

/**
 * Gets location details for a given location name
 */
function getLocationDetails(locationName: string) {
  return LOCATION_DETAILS[locationName] || LOCATION_DETAILS['Glow Medical Spa'];
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
  const startTime = parseAppointmentDateTime(appointment.date, appointment.time);
  const durationMinutes = parseDuration(appointment.duration);
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
  const serialNumber = 'APT-' + appointment.id + '-' + Date.now().toString();

  return {
    formatVersion: 1,
    passTypeIdentifier: PASS_TYPE_IDENTIFIER,
    serialNumber: serialNumber,
    teamIdentifier: TEAM_IDENTIFIER,
    organizationName: 'Glow Medical Spa',
    description: appointment.service + ' Appointment',
    logoText: 'Glow MedSpa',
    foregroundColor: BRAND_COLORS.foreground,
    backgroundColor: BRAND_COLORS.background,
    labelColor: BRAND_COLORS.label,
    relevantDate: formatISODate(startTime),
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
          value: formatDateForPass(startTime),
          changeMessage: 'Your appointment date has been changed to %@',
        },
        {
          key: 'time',
          label: 'TIME',
          value: formatTimeForPass(startTime) + ' - ' + formatTimeForPass(endTime),
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
          value: appointment.address || locationDetails.address,
        },
        {
          key: 'phone',
          label: 'Phone',
          value: locationDetails.phone,
        },
        {
          key: 'duration',
          label: 'Duration',
          value: appointment.duration,
        },
        {
          key: 'price',
          label: 'Price',
          value: appointment.price ? '$' + appointment.price.toFixed(2) : 'See receipt',
        },
        {
          key: 'cancellationPolicy',
          label: 'Cancellation Policy',
          value: CANCELLATION_POLICY,
        },
        {
          key: 'website',
          label: 'Website',
          value: 'https://portal.glowmedspa.com',
        },
        {
          key: 'appLink',
          label: 'Manage Appointment',
          value: 'Visit our patient portal to reschedule or cancel',
        },
      ],
    },
  };
}

// ============================================================================
// Main API Functions
// ============================================================================

/**
 * Generates an Apple Wallet pass for an appointment (Web Platform)
 *
 * In production, this would call the backend API to generate a signed PKPass.
 * For web platform, this generates the pass structure and simulates a download.
 */
export async function generateAppleWalletPass(
  appointment: AppointmentDetails
): Promise<GeneratePassResult> {
  try {
    // Call the mock API route
    const response = await fetch('/api/wallet/apple/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: appointment.id, appointment }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    // For web platform, we receive a blob/file
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);

    return {
      success: true,
      downloadUrl,
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
 * Adds an appointment to Apple Wallet (Web Platform)
 *
 * For web platform, this downloads the .pkpass file which users can then
 * open on their iOS device to add to Wallet.
 */
export async function addToAppleWallet(
  appointment: AppointmentDetails
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await generateAppleWalletPass(appointment);

    if (!result.success || !result.downloadUrl) {
      return {
        success: false,
        error: result.error || 'Failed to generate pass',
      };
    }

    // Download the .pkpass file
    const link = document.createElement('a');
    link.href = result.downloadUrl;
    link.download = `appointment-${appointment.id}.pkpass`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the object URL
    setTimeout(() => {
      URL.revokeObjectURL(result.downloadUrl!);
    }, 1000);

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
 * Checks if Apple Wallet might be available
 * On web platform, we can only detect iOS devices
 */
export function isAppleWalletAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

/**
 * Generates a mock pass for preview purposes
 */
export function generateMockPass(
  appointment: AppointmentDetails
): { success: boolean; passData?: PassJson; error?: string } {
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

/**
 * Gets pass preview information for UI display
 */
export function getPassPreview(appointment: AppointmentDetails) {
  const startTime = parseAppointmentDateTime(appointment.date, appointment.time);
  const durationMinutes = parseDuration(appointment.duration);
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
  const confirmationNumber = appointment.confirmationNumber || generateConfirmationNumber(appointment.id);

  return {
    service: appointment.service,
    provider: appointment.provider,
    date: formatDateForPass(startTime),
    time: `${formatTimeForPass(startTime)} - ${formatTimeForPass(endTime)}`,
    location: appointment.location,
    confirmationNumber,
    backgroundColor: BRAND_COLORS.background,
  };
}

// ============================================================================
// Default Export
// ============================================================================

const walletService = {
  generateAppleWalletPass,
  addToAppleWallet,
  isAppleWalletAvailable,
  createPassTemplate,
  generateMockPass,
  getPassPreview,
};

export default walletService;
