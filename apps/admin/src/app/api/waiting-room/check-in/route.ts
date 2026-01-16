import { NextRequest, NextResponse } from 'next/server';
import {
  appointments,
  updateAppointmentWaitingRoomStatus,
  getGroupBookingById,
  checkInGroupParticipant
} from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, message, appointmentId, groupId, patientId } = body;

    // Direct check-in by appointmentId (from UI)
    if (appointmentId) {
      const apt = appointments.find(a => a.id === appointmentId);
      if (!apt) {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        );
      }

      // If this is a group appointment, use group check-in
      if (apt.groupBookingId) {
        const result = checkInGroupParticipant(apt.groupBookingId, apt.patientId);
        if (!result.success) {
          return NextResponse.json(
            { error: result.error },
            { status: 400 }
          );
        }
      } else {
        updateAppointmentWaitingRoomStatus(appointmentId, 'in_car', {
          arrivalTime: new Date(),
          priority: 0
        });
      }

      const updatedApt = appointments.find(a => a.id === appointmentId);
      return NextResponse.json({
        success: true,
        message: 'Patient checked in successfully',
        appointment: {
          id: updatedApt?.id,
          patientName: updatedApt?.patientName,
          serviceName: updatedApt?.serviceName,
          scheduledTime: updatedApt?.startTime,
          status: updatedApt?.status,
          isGroupBooking: !!updatedApt?.groupBookingId
        }
      });
    }

    // Group check-in by groupId and patientId
    if (groupId && patientId) {
      const result = checkInGroupParticipant(groupId, patientId);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 400 }
        );
      }

      const group = getGroupBookingById(groupId);
      const participant = group?.participants.find(p => p.patientId === patientId);

      return NextResponse.json({
        success: true,
        message: 'Group participant checked in successfully',
        participant: {
          patientName: participant?.patientName,
          serviceName: participant?.serviceName,
          status: participant?.status
        },
        groupStatus: group?.status
      });
    }

    // SMS-based check-in (original flow)
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
    const isCheckingIn = message?.toUpperCase().includes('HERE') ||
                         message?.toUpperCase().includes('ARRIVED') ||
                         message?.toUpperCase() === "I'M HERE";

    if (isCheckingIn) {
      // Check if this is a group booking
      if (todaysAppointment.groupBookingId) {
        const result = checkInGroupParticipant(
          todaysAppointment.groupBookingId,
          todaysAppointment.patientId
        );

        const group = getGroupBookingById(todaysAppointment.groupBookingId);
        const arrivedCount = group?.participants.filter(p => p.status === 'arrived').length || 0;
        const totalCount = group?.participants.length || 0;

        return NextResponse.json({
          success: true,
          message: `Checked in to group: ${group?.name}. ${arrivedCount}/${totalCount} guests arrived.`,
          appointment: {
            id: todaysAppointment.id,
            patientName: todaysAppointment.patientName,
            serviceName: todaysAppointment.serviceName,
            scheduledTime: todaysAppointment.startTime,
            status: 'arrived',
            isGroupBooking: true,
            groupName: group?.name,
            groupArrivedCount: arrivedCount,
            groupTotalCount: totalCount
          }
        });
      }

      // Regular appointment check-in
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
