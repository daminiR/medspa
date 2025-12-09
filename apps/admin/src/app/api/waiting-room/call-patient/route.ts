import { NextRequest, NextResponse } from 'next/server';
import { appointments, updateAppointmentWaitingRoomStatus, getPractitionerById } from '@/lib/data';
import { sendSMS, formatPhoneNumber } from '@/lib/twilio';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'appointmentId is required' },
        { status: 400 }
      );
    }

    const appointment = appointments.find(apt => apt.id === appointmentId);

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (appointment.waitingRoomStatus !== 'in_car') {
      return NextResponse.json(
        { error: 'Patient must be in waiting room to be called' },
        { status: 400 }
      );
    }

    if (!appointment.phone) {
      return NextResponse.json(
        { error: 'Patient phone number not found' },
        { status: 400 }
      );
    }

    // Update status to room_ready
    const updated = updateAppointmentWaitingRoomStatus(
      appointmentId,
      'room_ready',
      {
        roomReadyNotifiedAt: new Date()
      }
    );

    // Send SMS via Twilio
    const practitioner = getPractitionerById(appointment.practitionerId);
    const firstName = appointment.patientName.split(' ')[0];
    const message = `Hi ${firstName}! Your room is ready. ${practitioner?.name} will see you shortly. Please come in.`;

    console.log(`[SMS] Sending to ${appointment.phone}: ${message}`);

    // Format phone number and send SMS
    const formattedPhone = formatPhoneNumber(appointment.phone);
    const smsResult = await sendSMS(formattedPhone, message);

    if (!smsResult.success) {
      // Still update the status even if SMS fails, but log the error
      console.error('SMS send failed:', smsResult.error);
      return NextResponse.json({
        success: true,
        warning: 'Status updated but SMS failed to send',
        smsError: smsResult.error,
        appointment: {
          id: updated?.id,
          patientName: updated?.patientName,
          status: updated?.waitingRoomStatus,
          notifiedAt: updated?.roomReadyNotifiedAt
        },
        smsPreview: message
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Patient notified successfully',
      appointment: {
        id: updated?.id,
        patientName: updated?.patientName,
        status: updated?.waitingRoomStatus,
        notifiedAt: updated?.roomReadyNotifiedAt
      },
      sms: {
        messageId: smsResult.messageId,
        status: smsResult.status,
        to: formattedPhone
      },
      smsPreview: message // For testing
    });
  } catch (error) {
    console.error('Call patient error:', error);
    return NextResponse.json(
      { error: 'Failed to notify patient' },
      { status: 500 }
    );
  }
}
