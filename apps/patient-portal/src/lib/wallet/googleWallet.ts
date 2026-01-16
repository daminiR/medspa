/**
 * Google Wallet Integration Service (Web Platform)
 *
 * Mock implementation for web platform - generates JWT structure that would
 * be used with Google Wallet API in production.
 *
 * In production, JWT signing would happen server-side using Google Cloud
 * service account credentials.
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AppointmentData {
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
}

export interface GoogleWalletPassConfig {
  issuerId: string;
  classId: string;
  objectId: string;
}

export interface WalletClassObject {
  id: string;
  eventName: {
    defaultValue: {
      language: string;
      value: string;
    };
  };
  logo: {
    sourceUri: {
      uri: string;
    };
    contentDescription: {
      defaultValue: {
        language: string;
        value: string;
      };
    };
  };
  venue: {
    name: {
      defaultValue: {
        language: string;
        value: string;
      };
    };
    address: {
      defaultValue: {
        language: string;
        value: string;
      };
    };
  };
  dateTime: {
    start: string;
    end: string;
  };
  reviewStatus: string;
  hexBackgroundColor: string;
}

export interface WalletObjectData {
  id: string;
  classId: string;
  state: string;
  ticketHolderName?: string;
  ticketNumber?: string;
  barcode: {
    type: string;
    value: string;
    alternateText?: string;
  };
  textModulesData?: Array<{
    header: string;
    body: string;
    id: string;
  }>;
  linksModuleData?: {
    uris: Array<{
      uri: string;
      description: string;
      id: string;
    }>;
  };
}

export interface GoogleWalletJWTPayload {
  iss: string;
  aud: string;
  typ: string;
  iat: number;
  payload: {
    eventTicketClasses?: WalletClassObject[];
    eventTicketObjects: WalletObjectData[];
  };
  origins: string[];
}

export interface WalletPassResult {
  success: boolean;
  saveUrl?: string;
  jwt?: string;
  error?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const BRAND_PRIMARY_COLOR = '#8B5CF6';
const BRAND_NAME = 'Glow Medical Spa';

const WALLET_CONFIG = {
  issuerId: 'MOCK_ISSUER_ID',
  apiBaseUrl: 'https://walletobjects.googleapis.com/walletobjects/v1',
  saveUrlBase: 'https://pay.google.com/gp/v/save',
  logoUri: 'https://portal.glowmedspa.com/images/wallet-logo.png',
  defaultVenue: {
    name: 'Glow Medical Spa',
    address: '123 Wellness Way, San Francisco, CA 94102',
  },
};

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
 * Formats a date to ISO 8601 format for Google Wallet
 */
function formatDateForWallet(date: Date): string {
  return date.toISOString();
}

/**
 * Calculates the end time based on start time and duration
 */
function calculateEndTime(startDate: Date, durationMinutes: number): Date {
  return new Date(startDate.getTime() + durationMinutes * 60 * 1000);
}

/**
 * Generates a unique class ID for the event ticket
 */
function generateClassId(issuerId: string, serviceName: string): string {
  const sanitizedService = serviceName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  return `${issuerId}.medspa_appointment_${sanitizedService}`;
}

/**
 * Generates a unique object ID for the specific appointment
 */
function generateObjectId(issuerId: string, appointmentId: string): string {
  return `${issuerId}.appointment_${appointmentId}`;
}

// ============================================================================
// Pass Creation Functions
// ============================================================================

/**
 * Creates the Event Ticket Class structure for Google Wallet
 */
function createEventTicketClass(
  appointment: AppointmentData,
  config: GoogleWalletPassConfig
): WalletClassObject {
  const startTime = parseAppointmentDateTime(appointment.date, appointment.time);
  const durationMinutes = parseDuration(appointment.duration);
  const endTime = calculateEndTime(startTime, durationMinutes);

  return {
    id: config.classId,
    eventName: {
      defaultValue: {
        language: 'en-US',
        value: appointment.service,
      },
    },
    logo: {
      sourceUri: {
        uri: WALLET_CONFIG.logoUri,
      },
      contentDescription: {
        defaultValue: {
          language: 'en-US',
          value: `${BRAND_NAME} Logo`,
        },
      },
    },
    venue: {
      name: {
        defaultValue: {
          language: 'en-US',
          value: appointment.location || WALLET_CONFIG.defaultVenue.name,
        },
      },
      address: {
        defaultValue: {
          language: 'en-US',
          value: appointment.address || WALLET_CONFIG.defaultVenue.address,
        },
      },
    },
    dateTime: {
      start: formatDateForWallet(startTime),
      end: formatDateForWallet(endTime),
    },
    reviewStatus: 'UNDER_REVIEW',
    hexBackgroundColor: BRAND_PRIMARY_COLOR,
  };
}

/**
 * Creates the Event Ticket Object structure for Google Wallet
 */
function createEventTicketObject(
  appointment: AppointmentData,
  config: GoogleWalletPassConfig
): WalletObjectData {
  const textModulesData: Array<{ header: string; body: string; id: string }> = [
    {
      header: 'Provider',
      body: appointment.provider,
      id: 'provider',
    },
    {
      header: 'Service',
      body: appointment.service,
      id: 'service',
    },
    {
      header: 'Duration',
      body: appointment.duration,
      id: 'duration',
    },
  ];

  if (appointment.price) {
    textModulesData.push({
      header: 'Price',
      body: `$${appointment.price}`,
      id: 'price',
    });
  }

  return {
    id: config.objectId,
    classId: config.classId,
    state: 'ACTIVE',
    ticketHolderName: appointment.patientName || 'Valued Patient',
    ticketNumber: appointment.id,
    barcode: {
      type: 'QR_CODE',
      value: appointment.id,
      alternateText: `Appointment #${appointment.id}`,
    },
    textModulesData,
    linksModuleData: {
      uris: [
        {
          uri: `https://portal.glowmedspa.com/appointments/${appointment.id}`,
          description: 'View Appointment Details',
          id: 'appointment_link',
        },
        {
          uri: 'https://portal.glowmedspa.com/directions',
          description: 'Get Directions',
          id: 'directions_link',
        },
        {
          uri: 'tel:+15551234567',
          description: 'Call to Reschedule',
          id: 'phone_link',
        },
      ],
    },
  };
}

/**
 * Creates the JWT payload structure for Google Wallet
 */
export function createJWTPayload(appointment: AppointmentData): GoogleWalletJWTPayload {
  const config: GoogleWalletPassConfig = {
    issuerId: WALLET_CONFIG.issuerId,
    classId: generateClassId(WALLET_CONFIG.issuerId, appointment.service),
    objectId: generateObjectId(WALLET_CONFIG.issuerId, appointment.id),
  };

  const eventTicketClass = createEventTicketClass(appointment, config);
  const eventTicketObject = createEventTicketObject(appointment, config);

  return {
    iss: 'appointments@glowmedspa.com',
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    payload: {
      eventTicketClasses: [eventTicketClass],
      eventTicketObjects: [eventTicketObject],
    },
    origins: ['https://portal.glowmedspa.com', 'https://glowmedspa.com'],
  };
}

// ============================================================================
// Main Service Functions
// ============================================================================

/**
 * Generates a mock Google Wallet pass for an appointment (Web Platform)
 *
 * In production, this would call the backend API to generate a signed JWT.
 * For web platform, this demonstrates the structure that would be used.
 */
export async function generateGoogleWalletPass(
  appointment: AppointmentData
): Promise<WalletPassResult> {
  try {
    // Call the mock API route
    const response = await fetch('/api/wallet/google/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: appointment.id, appointment }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      saveUrl: data.saveUrl,
      jwt: data.jwt,
    };
  } catch (error) {
    console.error('Error generating Google Wallet pass:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate wallet pass',
    };
  }
}

/**
 * Adds an appointment to Google Wallet
 *
 * For web platform, this generates the pass and shows how the redirect would work.
 * In production, it would redirect to the Google Wallet save URL.
 */
export async function addToGoogleWallet(
  appointment: AppointmentData
): Promise<WalletPassResult> {
  try {
    const passResult = await generateGoogleWalletPass(appointment);

    if (!passResult.success || !passResult.saveUrl) {
      throw new Error(passResult.error || 'Failed to generate wallet pass');
    }

    // In production, this would redirect to Google Wallet:
    // window.open(passResult.saveUrl, '_blank');

    return {
      success: true,
      saveUrl: passResult.saveUrl,
      jwt: passResult.jwt,
    };
  } catch (error) {
    console.error('Error adding to Google Wallet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add to Google Wallet',
    };
  }
}

/**
 * Generates a preview of what the wallet pass will look like
 */
export function getWalletPassPreview(appointment: AppointmentData) {
  const startTime = parseAppointmentDateTime(appointment.date, appointment.time);
  const durationMinutes = parseDuration(appointment.duration);
  const endTime = calculateEndTime(startTime, durationMinutes);

  return {
    title: appointment.service,
    subtitle: appointment.provider,
    location: appointment.location,
    dateTime: {
      date: startTime.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      time: startTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      endTime: endTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    },
    backgroundColor: BRAND_PRIMARY_COLOR,
    logoUrl: WALLET_CONFIG.logoUri,
  };
}

// ============================================================================
// Default Export
// ============================================================================

const walletService = {
  generateGoogleWalletPass,
  addToGoogleWallet,
  createJWTPayload,
  getWalletPassPreview,
};

export default walletService;
