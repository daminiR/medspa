/**
 * PATCH /api/patient/appointments/[id]/reschedule
 * Reschedule an existing appointment
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError, apiValidationError, ErrorCodes } from '@/lib/api-response';
import { rescheduleAppointmentSchema } from '@/lib/validations/patient';
import { requireAuth, handlePreflight, corsHeaders } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { services, appointments as existingAppointments } from '@/lib/data';

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user: tokenUser } = authResult;

    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = rescheduleAppointmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        apiValidationError(validationResult.error.issues),
        { status: 400, headers: corsHeaders() }
      );
    }

    const { newStartTime, reason } = validationResult.data;

    // Get patient profile
    const patient = await db.patients.findByUserId(tokenUser.userId);
    if (!patient) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Patient profile not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Get appointment
    const appointment = await db.appointments.findById(id);
    if (!appointment) {
      return NextResponse.json(
        apiError(ErrorCodes.APPOINTMENT_NOT_FOUND, 'Appointment not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Verify ownership
    if (appointment.patientId !== patient.id && appointment.patientId !== patient.userId) {
      return NextResponse.json(
        apiError(ErrorCodes.FORBIDDEN, 'You do not have access to this appointment'),
        { status: 403, headers: corsHeaders() }
      );
    }

    // Check if can be rescheduled
    if (appointment.status === 'cancelled') {
      return NextResponse.json(
        apiError(ErrorCodes.RESCHEDULE_NOT_ALLOWED, 'Cannot reschedule a cancelled appointment'),
        { status: 400, headers: corsHeaders() }
      );
    }

    if (appointment.status === 'completed') {
      return NextResponse.json(
        apiError(ErrorCodes.RESCHEDULE_NOT_ALLOWED, 'Cannot reschedule a completed appointment'),
        { status: 400, headers: corsHeaders() }
      );
    }

    if (appointment.status === 'in_progress' || appointment.status === 'arrived') {
      return NextResponse.json(
        apiError(ErrorCodes.RESCHEDULE_NOT_ALLOWED, 'Cannot reschedule an appointment in progress'),
        { status: 400, headers: corsHeaders() }
      );
    }

    // Parse new start time
    const appointmentStartTime = new Date(newStartTime);

    // Validate appointment time is in the future
    if (appointmentStartTime <= new Date()) {
      return NextResponse.json(
        apiError(ErrorCodes.VALIDATION_ERROR, 'New appointment time must be in the future'),
        { status: 400, headers: corsHeaders() }
      );
    }

    // Get service for duration
    const service = services.find(s => s.name === appointment.serviceName);
    const duration = service?.scheduledDuration || service?.duration || appointment.duration;

    // Calculate new end time
    const appointmentEndTime = new Date(appointmentStartTime.getTime() + duration * 60000);

    // Check for conflicts (excluding current appointment)
    const providerAppointments = existingAppointments.filter(
      (apt) =>
        apt.practitionerId === appointment.practitionerId &&
        apt.id !== id &&
        apt.status !== 'cancelled' &&
        apt.status !== 'deleted'
    );

    const hasConflict = providerAppointments.some((apt) => {
      const existingStart = new Date(apt.startTime);
      const existingEnd = new Date(apt.endTime);
      return (
        (appointmentStartTime >= existingStart && appointmentStartTime < existingEnd) ||
        (appointmentEndTime > existingStart && appointmentEndTime <= existingEnd) ||
        (appointmentStartTime <= existingStart && appointmentEndTime >= existingEnd)
      );
    });

    if (hasConflict) {
      return NextResponse.json(
        apiError(ErrorCodes.SLOT_NOT_AVAILABLE, 'This time slot is not available'),
        { status: 409, headers: corsHeaders() }
      );
    }

    // Check if within reschedule limit (typically 24 hours before original time)
    const originalTime = new Date(appointment.startTime);
    const now = new Date();
    const hoursUntilOriginal = (originalTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let rescheduleFee = 0;
    if (hoursUntilOriginal < 24 && hoursUntilOriginal > 0) {
      // Late reschedule - may incur fee
      rescheduleFee = (service?.price || 0) * 0.25; // 25% late reschedule fee
    }

    // Store original times for response
    const originalStartTime = appointment.startTime;
    const originalEndTime = appointment.endTime;

    // Update appointment
    const updatedAppointment = await db.appointments.update(id, {
      startTime: appointmentStartTime,
      endTime: appointmentEndTime,
      status: 'scheduled', // Reset to scheduled status
      notes: reason
        ? `${appointment.notes || ''}\n[Rescheduled: ${reason}]`.trim()
        : appointment.notes,
    });

    // Get provider info
    const practitioner = await db.practitioners.findById(appointment.practitionerId);
    const location = await db.locations.findById(appointment.locationId || 'loc-1');

    return NextResponse.json(
      apiSuccess({
        message: 'Appointment rescheduled successfully',
        appointment: {
          id: updatedAppointment?.id,
          serviceName: appointment.serviceName,
          providerName: practitioner?.name,
          locationName: location?.name,
          originalStartTime: originalStartTime instanceof Date
            ? originalStartTime.toISOString()
            : originalStartTime,
          originalEndTime: originalEndTime instanceof Date
            ? originalEndTime.toISOString()
            : originalEndTime,
          newStartTime: appointmentStartTime.toISOString(),
          newEndTime: appointmentEndTime.toISOString(),
          duration,
          status: 'PENDING',
        },
        rescheduleFee: rescheduleFee > 0 ? rescheduleFee : null,
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while rescheduling appointment.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}
