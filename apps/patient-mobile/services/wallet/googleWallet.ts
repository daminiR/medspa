/**
 * Google Wallet Integration Service
 *
 * Provides functionality to create, add, and update Google Wallet passes
 * for medical spa appointments using the Google Wallet REST API v1.
 *
 * @see https://developers.google.com/wallet/tickets/events/rest
 */

import * as Linking from 'expo-linking';
import Constants from 'expo-constants';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AppointmentData {
  id: string;
  service: string;
  provider: string;
  date: Date;
  duration: number;
  location: string;
  locationAddress?: string;
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
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
  heroImage?: {
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
  validTimeInterval?: {
    start: {
      date: string;
    };
    end: {
      date: string;
    };
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

export interface WalletUpdateResult {
  success: boolean;
  error?: string;
}

// ============================================================================
// Configuration
// ============================================================================

// Brand colors for the wallet pass
const BRAND_PRIMARY_COLOR = '#8B5CF6';
const BRAND_NAME = 'Luxe MedSpa';

// API Configuration - In production, these would come from environment/secure storage
const WALLET_CONFIG = {
  // Google Cloud Project credentials
  // IMPORTANT: In production, JWT signing should happen server-side
  issuerId: Constants.expoConfig?.extra?.googleWalletIssuerId || 'ISSUER_ID_HERE',

  // Base URL for the Google Wallet API
  apiBaseUrl: 'https://walletobjects.googleapis.com/walletobjects/v1',

  // Save URL base
  saveUrlBase: 'https://pay.google.com/gp/v/save',

  // App backend URL for JWT generation (production)
  backendUrl: Constants.expoConfig?.extra?.apiUrl || 'https://api.luxemedspa.com',

  // Logo and hero images (should be hosted on HTTPS)
  logoUri: 'https://portal.luxemedspa.com/images/wallet-logo.png',
  heroImageUri: 'https://portal.luxemedspa.com/images/wallet-hero.png',

  // Default venue information
  defaultVenue: {
    name: 'Luxe MedSpa',
    address: '123 Luxury Avenue, Beverly Hills, CA 90210',
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

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

/**
 * Creates the Event Ticket Class structure for Google Wallet
 */
function createEventTicketClass(
  appointment: AppointmentData,
  config: GoogleWalletPassConfig
): WalletClassObject {
  const endTime = calculateEndTime(appointment.date, appointment.duration);

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
    heroImage: {
      sourceUri: {
        uri: WALLET_CONFIG.heroImageUri,
      },
      contentDescription: {
        defaultValue: {
          language: 'en-US',
          value: `${appointment.service} at ${BRAND_NAME}`,
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
          value: appointment.locationAddress || WALLET_CONFIG.defaultVenue.address,
        },
      },
    },
    dateTime: {
      start: formatDateForWallet(appointment.date),
      end: formatDateForWallet(endTime),
    },
    reviewStatus: 'UNDER_REVIEW', // Will be 'APPROVED' after Google review
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
  const endTime = calculateEndTime(appointment.date, appointment.duration);

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
    textModulesData: [
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
        body: `${appointment.duration} minutes`,
        id: 'duration',
      },
      {
        header: 'Price',
        body: `$${appointment.price}`,
        id: 'price',
      },
    ],
    linksModuleData: {
      uris: [
        {
          uri: `https://portal.luxemedspa.com/appointments/${appointment.id}`,
          description: 'View Appointment Details',
          id: 'appointment_link',
        },
        {
          uri: 'https://portal.luxemedspa.com/directions',
          description: 'Get Directions',
          id: 'directions_link',
        },
        {
          uri: 'tel:+13105551234',
          description: 'Call to Reschedule',
          id: 'phone_link',
        },
      ],
    },
    validTimeInterval: {
      start: {
        date: formatDateForWallet(new Date()),
      },
      end: {
        date: formatDateForWallet(endTime),
      },
    },
  };
}

/**
 * Creates the JWT payload structure for Google Wallet
 */
function createJWTPayload(
  appointment: AppointmentData,
  config: GoogleWalletPassConfig
): GoogleWalletJWTPayload {
  const eventTicketClass = createEventTicketClass(appointment, config);
  const eventTicketObject = createEventTicketObject(appointment, config);

  return {
    iss: WALLET_CONFIG.backendUrl,
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    payload: {
      eventTicketClasses: [eventTicketClass],
      eventTicketObjects: [eventTicketObject],
    },
    origins: ['https://portal.luxemedspa.com', 'https://luxemedspa.com'],
  };
}

// ============================================================================
// Main Service Functions
// ============================================================================

/**
 * Generates a Google Wallet pass for an appointment
 *
 * In production, JWT signing should happen server-side to protect the
 * service account private key. This function calls the backend API
 * to generate the signed JWT.
 *
 * @param appointment - The appointment data to create a pass for
 * @returns Promise containing the save URL and JWT token
 */
export async function generateGoogleWalletPass(
  appointment: AppointmentData
): Promise<WalletPassResult> {
  try {
    // Generate IDs
    const config: GoogleWalletPassConfig = {
      issuerId: WALLET_CONFIG.issuerId,
      classId: generateClassId(WALLET_CONFIG.issuerId, appointment.service),
      objectId: generateObjectId(WALLET_CONFIG.issuerId, appointment.id),
    };

    // Create the JWT payload
    const jwtPayload = createJWTPayload(appointment, config);

    // In production, call the backend to sign the JWT
    // The backend should use the service account private key to sign
    const response = await fetch(`${WALLET_CONFIG.backendUrl}/api/wallet/google/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Include auth token if available
        // 'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        appointmentId: appointment.id,
        payload: jwtPayload,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    const data = await response.json();
    const jwt = data.jwt;

    // Construct the save URL
    const saveUrl = `${WALLET_CONFIG.saveUrlBase}/${jwt}`;

    return {
      success: true,
      saveUrl,
      jwt,
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
 * This function generates the wallet pass and opens Google Wallet
 * (or the web fallback) to save the pass.
 *
 * @param appointmentId - The ID of the appointment to add
 * @param appointmentData - Optional full appointment data (if not provided, will be fetched)
 * @returns Promise containing the result of the operation
 */
export async function addToGoogleWallet(
  appointmentId: string,
  appointmentData?: AppointmentData
): Promise<WalletPassResult> {
  try {
    let appointment = appointmentData;

    // If no appointment data provided, fetch it from the API
    if (!appointment) {
      const response = await fetch(
        `${WALLET_CONFIG.backendUrl}/api/appointments/${appointmentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Include auth token if available
            // 'Authorization': `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch appointment data');
      }

      const data = await response.json();
      appointment = {
        ...data,
        date: new Date(data.date),
      };
    }

    // Check if appointment was fetched successfully
    if (!appointment) {
      throw new Error('Failed to fetch appointment data');
    }

    // Generate the wallet pass
    const passResult = await generateGoogleWalletPass(appointment);

    if (!passResult.success || !passResult.saveUrl) {
      throw new Error(passResult.error || 'Failed to generate wallet pass');
    }

    // Check if we can open the URL
    const canOpen = await Linking.canOpenURL(passResult.saveUrl);

    if (canOpen) {
      // Open Google Wallet app or web fallback
      await Linking.openURL(passResult.saveUrl);
    } else {
      // Fallback: Open in web browser
      await Linking.openURL(passResult.saveUrl);
    }

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
 * Updates an existing Google Wallet pass
 *
 * This function calls the backend API to update the pass via
 * the Google Wallet REST API.
 *
 * @param appointmentId - The ID of the appointment to update
 * @param updates - Partial appointment data to update
 * @returns Promise containing the result of the update
 */
export async function updateGoogleWalletPass(
  appointmentId: string,
  updates: Partial<AppointmentData>
): Promise<WalletUpdateResult> {
  try {
    const objectId = generateObjectId(WALLET_CONFIG.issuerId, appointmentId);

    // Build the update payload
    const updatePayload: Record<string, unknown> = {};

    if (updates.date) {
      updatePayload.validTimeInterval = {
        start: {
          date: formatDateForWallet(new Date()),
        },
        end: {
          date: formatDateForWallet(
            calculateEndTime(updates.date, updates.duration || 60)
          ),
        },
      };
    }

    if (updates.provider || updates.service || updates.duration || updates.price) {
      const textModulesData: Array<{ header: string; body: string; id: string }> = [];

      if (updates.provider) {
        textModulesData.push({
          header: 'Provider',
          body: updates.provider,
          id: 'provider',
        });
      }

      if (updates.service) {
        textModulesData.push({
          header: 'Service',
          body: updates.service,
          id: 'service',
        });
      }

      if (updates.duration) {
        textModulesData.push({
          header: 'Duration',
          body: `${updates.duration} minutes`,
          id: 'duration',
        });
      }

      if (updates.price) {
        textModulesData.push({
          header: 'Price',
          body: `$${updates.price}`,
          id: 'price',
        });
      }

      if (textModulesData.length > 0) {
        updatePayload.textModulesData = textModulesData;
      }
    }

    // Handle status changes (cancelled appointments)
    if (updates.status === 'cancelled') {
      updatePayload.state = 'EXPIRED';
    }

    // Call backend to update via Google Wallet API
    const response = await fetch(
      `${WALLET_CONFIG.backendUrl}/api/wallet/google/update`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Include auth token if available
          // 'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          objectId,
          appointmentId,
          updates: updatePayload,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating Google Wallet pass:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update wallet pass',
    };
  }
}

/**
 * Checks if Google Wallet is available on the device
 *
 * Note: This is a basic check. Google Wallet availability may vary by region.
 *
 * @returns Promise<boolean> - True if Google Wallet might be available
 */
export async function isGoogleWalletAvailable(): Promise<boolean> {
  try {
    // Check if we can open the Google Pay URL scheme
    const testUrl = 'https://pay.google.com';
    return await Linking.canOpenURL(testUrl);
  } catch {
    return false;
  }
}

/**
 * Generates a preview of what the wallet pass will look like
 * (Useful for UI preview before adding to wallet)
 *
 * @param appointment - The appointment data
 * @returns Object containing display information
 */
export function getWalletPassPreview(appointment: AppointmentData) {
  const endTime = calculateEndTime(appointment.date, appointment.duration);

  return {
    title: appointment.service,
    subtitle: appointment.provider,
    location: appointment.location,
    dateTime: {
      date: appointment.date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      time: appointment.date.toLocaleTimeString('en-US', {
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

export default {
  generateGoogleWalletPass,
  addToGoogleWallet,
  updateGoogleWalletPass,
  isGoogleWalletAvailable,
  getWalletPassPreview,
};
