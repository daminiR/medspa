import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock Google Wallet Pass Generation API
 *
 * In production, this would:
 * 1. Validate the request and authenticate the user
 * 2. Fetch appointment details from the database
 * 3. Create the Google Wallet class and object
 * 4. Sign the JWT using Google Cloud service account credentials
 * 5. Return the signed JWT and save URL
 *
 * For this mock implementation, we generate a simulated JWT structure
 * that demonstrates what the real implementation would produce.
 */

interface AppointmentData {
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
  appointment?: AppointmentData;
}

// Mock issuer ID - in production this would come from env
const MOCK_ISSUER_ID = 'MOCK_ISSUER_3141592653';
const MOCK_SAVE_URL_BASE = 'https://pay.google.com/gp/v/save';

/**
 * Generate a mock JWT token
 * In production, this would be a proper signed JWT
 */
function generateMockJWT(appointment: AppointmentData): string {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const payload = {
    iss: 'appointments@glowmedspa.iam.gserviceaccount.com',
    aud: 'google',
    typ: 'savetowallet',
    iat: Math.floor(Date.now() / 1000),
    payload: {
      eventTicketObjects: [
        {
          id: `${MOCK_ISSUER_ID}.appointment_${appointment.id}`,
          classId: `${MOCK_ISSUER_ID}.medspa_appointment_class`,
          state: 'ACTIVE',
          ticketHolderName: appointment.patientName || 'Valued Patient',
          ticketNumber: appointment.id,
          barcode: {
            type: 'QR_CODE',
            value: appointment.id,
          },
          textModulesData: [
            { header: 'Service', body: appointment.service, id: 'service' },
            { header: 'Provider', body: appointment.provider, id: 'provider' },
            { header: 'Date', body: appointment.date, id: 'date' },
            { header: 'Time', body: appointment.time, id: 'time' },
          ],
        },
      ],
    },
    origins: ['https://portal.glowmedspa.com'],
  };

  // Create mock base64-encoded JWT parts
  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');

  // Mock signature (in production this would be a real RS256 signature)
  const mockSignature = Buffer.from(
    `mock_signature_for_appointment_${appointment.id}_${Date.now()}`
  ).toString('base64url');

  return `${headerB64}.${payloadB64}.${mockSignature}`;
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
    // For mock purposes, use provided data or create mock data
    const appointmentData: AppointmentData = appointment || {
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

    // Generate the mock JWT
    const jwt = generateMockJWT(appointmentData);

    // Construct the save URL
    const saveUrl = `${MOCK_SAVE_URL_BASE}/${jwt}`;

    // Log for debugging
    console.log('[Mock Google Wallet API] Generated pass for appointment:', appointmentId);

    return NextResponse.json({
      success: true,
      jwt,
      saveUrl,
      message: 'Mock Google Wallet pass generated successfully',
      note: 'This is a mock implementation. In production, the JWT would be signed with Google Cloud credentials.',
    });
  } catch (error) {
    console.error('[Mock Google Wallet API] Error:', error);
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
    service: 'Google Wallet Pass Generator',
    status: 'Mock Implementation',
    usage: 'POST with { appointmentId, appointment? }',
  });
}
