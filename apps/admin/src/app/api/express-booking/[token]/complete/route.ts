import { NextRequest, NextResponse } from 'next/server';
import { appointments, practitioners } from '@/lib/data';
import { sendSMS, smsTemplates, formatPhoneNumber } from '@/lib/twilio';
import { autoSendFormsOnBooking } from '@/services/forms/formService';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil' as const
});

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
      paymentIntentId, // Stripe PaymentIntent ID from frontend
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

    // If deposit is required, verify Stripe payment
    if (appointment.requireDeposit && appointment.depositAmount && appointment.depositAmount > 0) {
      if (!paymentIntentId) {
        return NextResponse.json(
          { error: 'Payment required for deposit', code: 'PAYMENT_REQUIRED' },
          { status: 400 }
        );
      }

      try {
        // Verify payment intent is successful
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
          return NextResponse.json(
            { error: 'Payment not completed. Please try again.', code: 'PAYMENT_FAILED' },
            { status: 400 }
          );
        }

        // Verify amount matches expected deposit
        if (paymentIntent.amount !== appointment.depositAmount) {
          console.error(`Amount mismatch: expected ${appointment.depositAmount}, got ${paymentIntent.amount}`);
          return NextResponse.json(
            { error: 'Payment amount mismatch', code: 'AMOUNT_MISMATCH' },
            { status: 400 }
          );
        }

        // Mark deposit as paid and store payment reference
        appointment.depositPaid = true;
        appointment.stripePaymentIntentId = paymentIntentId;

      } catch (stripeError: any) {
        console.error('Stripe verification error:', stripeError);
        return NextResponse.json(
          { error: 'Unable to verify payment', code: 'STRIPE_ERROR' },
          { status: 500 }
        );
      }
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

    // Auto-send required forms for this service
    const formResult = await autoSendFormsOnBooking(
      appointment.patientId || appointment.id, // Use patient ID if available, fallback to appointment ID
      `${firstName} ${lastName}`,
      formattedPhone,
      appointment.serviceName,
      appointment.id
    );

    if (formResult.formsSent.length > 0) {
      console.log(`[ExpressBooking] Auto-sent ${formResult.formsSent.length} forms for ${appointment.serviceName}`);
    }

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
      forms: {
        sent: formResult.formsSent.length > 0,
        count: formResult.formsSent.length,
        formIds: formResult.formsSent,
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
