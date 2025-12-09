import { NextRequest, NextResponse } from 'next/server';
import { appointments, practitioners, type Appointment } from '@/lib/data';
import { sendSMS, smsTemplates, formatPhoneNumber } from '@/lib/twilio';
import { v4 as uuidv4 } from 'crypto';

// Generate a simple unique token
function generateToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientFirstName,
      patientPhone,
      practitionerId,
      serviceId,
      serviceName,
      startTime,
      duration,
      requireDeposit = false,
      depositAmount = 0,
      expiryMinutes = 30,
    } = body;

    // Validate required fields
    if (!patientFirstName || !patientPhone || !practitionerId || !serviceName || !startTime) {
      return NextResponse.json(
        { error: 'Missing required fields: patientFirstName, patientPhone, practitionerId, serviceName, startTime' },
        { status: 400 }
      );
    }

    // Generate unique token for the booking link
    const token = generateToken();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Get practitioner info
    const practitioner = practitioners.find(p => p.id === practitionerId);

    // Create the pending appointment
    const appointmentId = `apt-express-${Date.now()}`;
    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + (duration || 30) * 60 * 1000);

    const newAppointment: Appointment = {
      id: appointmentId,
      patientId: '', // Will be filled when patient completes booking
      patientName: patientFirstName, // Just first name for now
      serviceName: serviceName,
      serviceCategory: 'aesthetics',
      practitionerId: practitionerId,
      startTime: startDate,
      endTime: endDate,
      status: 'scheduled', // Will show as pending via expressBookingStatus
      color: '#FCD34D', // Yellow for pending
      duration: duration || 30,
      phone: patientPhone,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Express Booking fields
      expressBookingToken: token,
      expressBookingStatus: 'pending',
      expressBookingExpiresAt: expiresAt,
      expressBookingSentAt: new Date(),
      requireDeposit: requireDeposit,
      depositAmount: depositAmount,
      depositPaid: false,
    };

    // Add to appointments array (in production, this would be a database insert)
    appointments.push(newAppointment);

    // Build the booking link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const bookingLink = `${baseUrl}/book/${token}`;

    // Format date and time for SMS
    const dateStr = startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    // Send SMS with booking link
    const smsBody = smsTemplates.expressBookingInvite(
      patientFirstName,
      serviceName,
      dateStr,
      timeStr,
      bookingLink,
      expiryMinutes
    );

    const formattedPhone = formatPhoneNumber(patientPhone);
    const smsResult = await sendSMS(formattedPhone, smsBody);

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointmentId,
        token: token,
        patientName: patientFirstName,
        serviceName: serviceName,
        practitionerName: practitioner?.name || 'Provider',
        startTime: startDate,
        expiresAt: expiresAt,
        status: 'pending',
      },
      bookingLink: bookingLink,
      sms: {
        sent: smsResult.success,
        messageId: smsResult.messageId,
        error: smsResult.error,
        preview: smsBody,
      },
    });
  } catch (error) {
    console.error('Express booking create error:', error);
    return NextResponse.json(
      { error: 'Failed to create express booking' },
      { status: 500 }
    );
  }
}
