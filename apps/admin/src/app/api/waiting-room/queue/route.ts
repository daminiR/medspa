import { NextRequest, NextResponse } from 'next/server';
import { getWaitingRoomQueue } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const queue = getWaitingRoomQueue();

    // Calculate estimated wait times based on position in queue
    const queueWithEstimates = queue.map((entry, index) => {
      // Estimate ~15 minutes per person ahead in queue
      const estimatedWaitMinutes = index === 0 ? 0 : index * 15;

      return {
        ...entry,
        estimatedWaitMinutes,
        position: index + 1
      };
    });

    return NextResponse.json({
      success: true,
      queue: queueWithEstimates,
      totalWaiting: queueWithEstimates.length
    });
  } catch (error) {
    console.error('Queue fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waiting room queue' },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update queue entry status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, status } = body;

    if (!appointmentId || !status) {
      return NextResponse.json(
        { error: 'appointmentId and status are required' },
        { status: 400 }
      );
    }

    const { updateAppointmentWaitingRoomStatus } = await import('@/lib/data');

    const updated = updateAppointmentWaitingRoomStatus(appointmentId, status);

    if (!updated) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      appointment: updated
    });
  } catch (error) {
    console.error('Queue update error:', error);
    return NextResponse.json(
      { error: 'Failed to update queue' },
      { status: 500 }
    );
  }
}
