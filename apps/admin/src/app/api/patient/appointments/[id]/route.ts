/**
 * GET /api/patient/appointments/[id] - Get appointment details
 * DELETE /api/patient/appointments/[id] - Cancel appointment
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError, apiValidationError, ErrorCodes } from '@/lib/api-response';
import { cancelAppointmentSchema } from '@/lib/validations/patient';
import { requireAuth, handlePreflight, corsHeaders } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { services } from '@/lib/data';

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function GET(
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

    // Get related data
    const practitioner = await db.practitioners.findById(appointment.practitionerId);
    const service = services.find(s => s.name === appointment.serviceName);
    const location = await db.locations.findById(appointment.locationId || 'loc-1');

    // Build detailed response
    const appointmentDetails = {
      id: appointment.id,
      patientId: appointment.patientId,
      providerId: appointment.practitionerId,
      serviceId: service?.id,
      locationId: appointment.locationId || 'loc-1',

      // Service info
      serviceName: appointment.serviceName,
      serviceCategory: appointment.serviceCategory,
      serviceDescription: service?.description,

      // Provider info
      provider: practitioner
        ? {
            id: practitioner.id,
            name: practitioner.name,
            title: practitioner.discipline,
            specializations: practitioner.specializations,
            avatarUrl: null,
          }
        : null,

      // Location info
      location: location
        ? {
            id: location.id,
            name: location.name,
            address: location.address,
            phone: null,
          }
        : null,

      // Timing
      startTime: appointment.startTime instanceof Date
        ? appointment.startTime.toISOString()
        : appointment.startTime,
      endTime: appointment.endTime instanceof Date
        ? appointment.endTime.toISOString()
        : appointment.endTime,
      duration: appointment.duration,
      timezone: 'America/Los_Angeles',

      // Status
      status: appointment.status.toUpperCase(),
      confirmedAt: appointment.smsConfirmedAt?.toISOString(),
      checkedInAt: appointment.arrivalTime?.toISOString(),
      completedAt: appointment.status === 'completed' ? appointment.updatedAt?.toISOString() : null,
      cancelledAt: appointment.cancelledAt?.toISOString(),
      cancellationReason: appointment.cancellationReason,

      // Booking
      bookedAt: appointment.createdAt instanceof Date
        ? appointment.createdAt.toISOString()
        : appointment.createdAt,
      bookedBy: appointment.bookingType === 'walk_in' ? 'staff' : 'patient',
      bookingSource: appointment.bookingType || 'app',

      // Payment
      price: service?.price || 0,
      depositRequired: appointment.requireDeposit || false,
      depositAmount: appointment.depositAmount,
      depositPaid: appointment.depositPaid || false,
      paymentStatus: appointment.depositPaid ? 'paid' : 'pending',

      // Notes
      patientNotes: appointment.notes,
      staffNotes: null, // Not shown to patient

      // Reminders
      remindersSent: [
        appointment.confirmationSentAt && {
          type: 'sms',
          sentAt: appointment.confirmationSentAt.toISOString(),
          scheduledFor: appointment.confirmationSentAt.toISOString(),
        },
        appointment.reminderSentAt && {
          type: 'sms',
          sentAt: appointment.reminderSentAt.toISOString(),
          scheduledFor: appointment.reminderSentAt.toISOString(),
        },
      ].filter(Boolean),

      // Group booking info
      groupBooking: appointment.groupBookingId
        ? {
            groupId: appointment.groupBookingId,
            isCoordinator: appointment.isGroupCoordinator,
            position: appointment.groupPosition,
          }
        : null,

      // Wallet pass
      walletPassId: null, // Would be populated from wallet pass table

      // Timestamps
      createdAt: appointment.createdAt instanceof Date
        ? appointment.createdAt.toISOString()
        : appointment.createdAt,
      updatedAt: appointment.updatedAt instanceof Date
        ? appointment.updatedAt.toISOString()
        : appointment.updatedAt,
    };

    return NextResponse.json(
      apiSuccess(appointmentDetails),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Get appointment error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while fetching appointment.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function DELETE(
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
    const validationResult = cancelAppointmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        apiValidationError(validationResult.error.issues),
        { status: 400, headers: corsHeaders() }
      );
    }

    const { reason } = validationResult.data;

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

    // Check if can be cancelled
    if (appointment.status === 'cancelled') {
      return NextResponse.json(
        apiError(ErrorCodes.CONFLICT, 'Appointment is already cancelled'),
        { status: 409, headers: corsHeaders() }
      );
    }

    if (appointment.status === 'completed') {
      return NextResponse.json(
        apiError(ErrorCodes.CANCELLATION_NOT_ALLOWED, 'Cannot cancel a completed appointment'),
        { status: 400, headers: corsHeaders() }
      );
    }

    if (appointment.status === 'in_progress') {
      return NextResponse.json(
        apiError(ErrorCodes.CANCELLATION_NOT_ALLOWED, 'Cannot cancel an appointment in progress'),
        { status: 400, headers: corsHeaders() }
      );
    }

    // Check if within cancellation window (24 hours before)
    const appointmentTime = new Date(appointment.startTime);
    const now = new Date();
    const hoursUntil = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let cancellationFee = 0;
    if (hoursUntil < 24 && hoursUntil > 0) {
      // Late cancellation - may incur fee
      const service = services.find(s => s.name === appointment.serviceName);
      cancellationFee = (service?.price || 0) * 0.5; // 50% late cancellation fee
    }

    // Update appointment
    const updatedAppointment = await db.appointments.update(id, {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: new Date(),
      cancelledBy: tokenUser.userId,
    });

    return NextResponse.json(
      apiSuccess({
        message: 'Appointment cancelled successfully',
        appointment: {
          id: updatedAppointment?.id,
          status: 'CANCELLED',
          cancelledAt: updatedAppointment?.cancelledAt?.toISOString(),
          cancellationReason: reason,
        },
        cancellationFee: cancellationFee > 0 ? cancellationFee : null,
        refundAmount: appointment.depositPaid && cancellationFee === 0
          ? appointment.depositAmount
          : null,
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Cancel appointment error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while cancelling appointment.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}
