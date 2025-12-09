import { NextRequest, NextResponse } from 'next/server';
import { appointments, updateAppointmentWaitingRoomStatus } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, message } = body;

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Normalize phone number (remove formatting)
    const normalizedPhone = phone.replace(/\D/g, '');

    // Find today's appointment for this phone number
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysAppointment = appointments.find(apt => {
      const aptDate = new Date(apt.startTime);
      aptDate.setHours(0, 0, 0, 0);
      const aptPhone = apt.phone?.replace(/\D/g, '') || '';

      return (
        aptDate.getTime() === today.getTime() &&
        aptPhone === normalizedPhone &&
        (apt.status === 'scheduled' || apt.status === 'confirmed') &&
        (!apt.waitingRoomStatus || apt.waitingRoomStatus === 'not_arrived')
      );
    });

    if (!todaysAppointment) {
      return NextResponse.json(
        { error: 'No appointment found for today with this phone number' },
        { status: 404 }
      );
    }

    // Check if message contains "HERE" (case insensitive)
    const isCheckingIn = message?.toUpperCase().includes('HERE');

    if (isCheckingIn) {
      // Mark patient as in waiting room
      const updated = updateAppointmentWaitingRoomStatus(
        todaysAppointment.id,
        'in_car',
        {
          arrivalTime: new Date(),
          priority: 0 // Default priority
        }
      );

      return NextResponse.json({
        success: true,
        message: 'Patient checked in successfully',
        appointment: {
          id: updated?.id,
          patientName: updated?.patientName,
          serviceName: updated?.serviceName,
          scheduledTime: updated?.startTime,
          status: updated?.waitingRoomStatus
        }
      });
    } else {
      // Invalid message
      return NextResponse.json(
        { error: 'Please text "HERE" to check in' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Failed to check in' },
      { status: 500 }
    );
  }
}
