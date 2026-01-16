import { NextRequest, NextResponse } from 'next/server';
import { appointments, practitioners } from '@/lib/data';

// Clinic branding info
const demoClinic = {
  name: 'Dalphene Medical Spa',
  address: '123 Beauty Lane, Los Angeles, CA 90001',
  phone: '(555) 123-4567',
  cancellationPolicy: 'Please provide at least 24 hours notice for cancellations. Late cancellations or no-shows may result in a charge of up to 50% of the service cost.',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find appointment by token
    const appointment = appointments.find(apt => apt.expressBookingToken === token);

    if (!appointment) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if booking is expired
    if (appointment.expressBookingExpiresAt && new Date() > new Date(appointment.expressBookingExpiresAt)) {
      // Update status to expired
      appointment.expressBookingStatus = 'expired';
      return NextResponse.json(
        { error: 'This booking link has expired', code: 'EXPIRED' },
        { status: 410 }
      );
    }

    // Check if already completed
    if (appointment.expressBookingStatus === 'confirmed') {
      return NextResponse.json(
        { error: 'This booking has already been completed', code: 'ALREADY_COMPLETED' },
        { status: 400 }
      );
    }

    // Check if cancelled
    if (appointment.expressBookingStatus === 'cancelled') {
      return NextResponse.json(
        { error: 'This booking has been cancelled', code: 'CANCELLED' },
        { status: 400 }
      );
    }

    // Get practitioner info
    const practitioner = practitioners.find(p => p.id === appointment.practitionerId);

    // Return appointment details for the booking form
    return NextResponse.json({
      success: true,
      booking: {
        id: appointment.id,
        patientFirstName: appointment.patientName,
        phone: appointment.phone,
        serviceName: appointment.serviceName,
        practitionerName: practitioner?.name || 'Provider',
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        duration: appointment.duration,
        requireDeposit: appointment.requireDeposit,
        depositAmount: appointment.depositAmount,
        expiresAt: appointment.expressBookingExpiresAt,
      },
      clinic: demoClinic,
    });
  } catch (error) {
    console.error('Express booking fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    );
  }
}
