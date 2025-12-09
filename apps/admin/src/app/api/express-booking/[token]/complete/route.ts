import { NextRequest, NextResponse } from 'next/server';
import { appointments, practitioners } from '@/lib/data';
import { sendSMS, smsTemplates, formatPhoneNumber } from '@/lib/twilio';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      acceptedPolicy,
      paymentMethodId, // Stripe payment method ID (card on file)
    } = body;

    // Find appointment by token
    const appointmentIndex = appointments.findIndex(apt => apt.expressBookingToken === token);

    if (appointmentIndex === -1) {
      return NextResponse.json(
        { error: 'Booking not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const appointment = appointments[appointmentIndex];

    // Check if booking is expired
    if (appointment.expressBookingExpiresAt && new Date() > new Date(appointment.expressBookingExpiresAt)) {
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

    // Validate required fields
    if (!firstName || !lastName || !email || !acceptedPolicy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // If deposit is required, handle Stripe payment
    if (appointment.requireDeposit && appointment.depositAmount && appointment.depositAmount > 0) {
      if (!paymentMethodId) {
        return NextResponse.json(
          { error: 'Payment method required for deposit' },
          { status: 400 }
        );
      }

      // In production, you would:
      // 1. Create a Stripe PaymentIntent
      // 2. Confirm the payment
      // 3. Store the payment details

      // For now, we'll simulate successful payment
      appointment.depositPaid = true;
      appointment.cardOnFileId = paymentMethodId;
      console.log(`[Stripe] Would charge $${appointment.depositAmount / 100} deposit with payment method ${paymentMethodId}`);
    }

    // Update appointment with patient details
    appointment.patientName = `${firstName} ${lastName}`;
    appointment.email = email;
    appointment.phone = phone || appointment.phone;
    appointment.expressBookingStatus = 'confirmed';
    appointment.expressBookingCompletedAt = new Date();
    appointment.status = 'confirmed';
    appointment.color = '#10B981'; // Green for confirmed
    appointment.updatedAt = new Date();

    // Get practitioner info for SMS
    const practitioner = practitioners.find(p => p.id === appointment.practitionerId);

    // Send confirmation SMS
    const dateStr = new Date(appointment.startTime).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = new Date(appointment.startTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });

    const confirmationSms = smsTemplates.expressBookingConfirmed(
      firstName,
      appointment.serviceName,
      dateStr,
      timeStr
    );

    const formattedPhone = formatPhoneNumber(appointment.phone || phone);
    const smsResult = await sendSMS(formattedPhone, confirmationSms);

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        patientName: appointment.patientName,
        serviceName: appointment.serviceName,
        practitionerName: practitioner?.name || 'Provider',
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: 'confirmed',
        depositPaid: appointment.depositPaid,
      },
      confirmation: {
        smsSent: smsResult.success,
        message: 'Your appointment has been confirmed!',
      },
    });
  } catch (error) {
    console.error('Express booking complete error:', error);
    return NextResponse.json(
      { error: 'Failed to complete booking' },
      { status: 500 }
    );
  }
}
