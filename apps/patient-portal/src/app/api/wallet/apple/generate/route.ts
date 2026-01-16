import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock Apple Wallet Pass Generation API
 *
 * In production, this would:
 * 1. Validate the request and authenticate the user
 * 2. Fetch appointment details from the database
 * 3. Create the PKPass structure with all required files
 * 4. Sign the pass using Apple Developer certificates
 * 5. Return the signed .pkpass file
 *
 * For this mock implementation, we generate a JSON representation
 * of what the PKPass structure would contain.
 */

interface AppointmentDetails {
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

interface RequestBody {
  appointmentId: string;
  appointment?: AppointmentDetails;
}

// Mock team and pass identifiers
const MOCK_TEAM_ID = 'MOCK_TEAM_123456';
const MOCK_PASS_TYPE_ID = 'pass.com.glowmedspa.appointment';

/**
 * Parse appointment date and time strings into a Date object
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
 * Format date for pass display
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
 * Format time for pass display
 */
function formatTimeForPass(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Parse duration string to minutes
 */
function parseDuration(durationStr: string): number {
  const match = durationStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 60;
}

/**
 * Generate confirmation number
 */
function generateConfirmationNumber(appointmentId: string): string {
  const prefix = 'GL';
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  const idPart = appointmentId.slice(-4).toUpperCase();
  return prefix + timestamp + idPart;
}

/**
 * Create the pass.json structure
 */
function createPassJson(appointment: AppointmentDetails) {
  const startTime = parseAppointmentDateTime(appointment.date, appointment.time);
  const durationMinutes = parseDuration(appointment.duration);
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
  const confirmationNumber = generateConfirmationNumber(appointment.id);
  const serialNumber = `APT-${appointment.id}-${Date.now()}`;

  return {
    formatVersion: 1,
    passTypeIdentifier: MOCK_PASS_TYPE_ID,
    serialNumber: serialNumber,
    teamIdentifier: MOCK_TEAM_ID,
    organizationName: 'Glow Medical Spa',
    description: `${appointment.service} Appointment`,
    logoText: 'Glow MedSpa',
    foregroundColor: 'rgb(255, 255, 255)',
    backgroundColor: 'rgb(139, 92, 246)',
    labelColor: 'rgb(245, 243, 255)',
    relevantDate: startTime.toISOString(),
    locations: [
      {
        latitude: 37.7749,
        longitude: -122.4194,
        relevantText: `Your ${appointment.service} appointment is nearby!`,
      },
    ],
    barcode: {
      message: JSON.stringify({
        type: 'appointment_checkin',
        appointmentId: appointment.id,
        confirmationNumber: confirmationNumber,
        timestamp: Date.now(),
      }),
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
          value: `${formatTimeForPass(startTime)} - ${formatTimeForPass(endTime)}`,
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
          value: appointment.address || '123 Wellness Way, San Francisco, CA 94102',
        },
        {
          key: 'phone',
          label: 'Phone',
          value: '(555) 123-4567',
        },
        {
          key: 'duration',
          label: 'Duration',
          value: appointment.duration,
        },
        {
          key: 'price',
          label: 'Price',
          value: appointment.price ? `$${appointment.price.toFixed(2)}` : 'See receipt',
        },
        {
          key: 'cancellationPolicy',
          label: 'Cancellation Policy',
          value: 'Free cancellation up to 24 hours before. $50 fee within 24 hours.',
        },
        {
          key: 'website',
          label: 'Website',
          value: 'https://portal.glowmedspa.com',
        },
      ],
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { appointmentId, appointment } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { success: false, message: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // In production, we would fetch the appointment from the database
    const appointmentData: AppointmentDetails = appointment || {
      id: appointmentId,
      service: 'Botox Treatment',
      provider: 'Dr. Smith',
      date: 'December 15, 2025',
      time: '2:00 PM',
      duration: '30 minutes',
      location: 'Glow Medical Spa',
      address: '123 Wellness Way, San Francisco, CA 94102',
      price: 350,
      patientName: 'Jane Doe',
      patientEmail: 'jane.doe@email.com',
    };

    // Create the pass.json content
    const passJson = createPassJson(appointmentData);

    // In production, this would:
    // 1. Create all required files (pass.json, logo.png, icon.png, etc.)
    // 2. Create the manifest.json with SHA1 hashes
    // 3. Sign the manifest with Apple certificates
    // 4. Package everything into a .pkpass zip file

    // For mock purposes, we return the pass.json as a "pkpass" file
    // This won't actually work with Apple Wallet, but demonstrates the structure
    const mockPkpassContent = JSON.stringify(
      {
        _mockNotice: 'This is a mock PKPass file. Real PKPass files are ZIP archives containing signed data.',
        passJson: passJson,
        manifest: {
          'pass.json': 'mock_sha1_hash_pass_json',
          'logo.png': 'mock_sha1_hash_logo',
          'icon.png': 'mock_sha1_hash_icon',
        },
        signature: 'mock_pkcs7_signature_data',
      },
      null,
      2
    );

    // Log for debugging
    console.log('[Mock Apple Wallet API] Generated pass for appointment:', appointmentId);

    // Return as a downloadable file
    return new NextResponse(mockPkpassContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="appointment-${appointmentId}.pkpass"`,
      },
    });
  } catch (error) {
    console.error('[Mock Apple Wallet API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate wallet pass',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Apple Wallet Pass Generator',
    status: 'Mock Implementation',
    usage: 'POST with { appointmentId, appointment? }',
    note: 'Returns a mock .pkpass file structure. Real implementation requires Apple Developer certificates.',
  });
}
