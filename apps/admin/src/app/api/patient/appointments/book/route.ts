/**
 * POST /api/patient/appointments/book
 * Book a new appointment
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError, apiValidationError, ErrorCodes } from '@/lib/api-response';
import { bookAppointmentSchema } from '@/lib/validations/patient';
import { requireAuth, handlePreflight, corsHeaders } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { services, practitioners, appointments as existingAppointments } from '@/lib/data';

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user: tokenUser } = authResult;

    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = bookAppointmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        apiValidationError(validationResult.error.issues),
        { status: 400, headers: corsHeaders() }
      );
    }

    const {
      serviceId,
      providerId,
      locationId,
      startTime,
      patientNotes,
      paymentMethodId,
    } = validationResult.data;

    // Get patient profile
    const patient = await db.patients.findByUserId(tokenUser.userId);
    if (!patient) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Patient profile not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Get user for name
    const user = await db.users.findById(tokenUser.userId);
    if (!user) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'User not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Validate service
    const service = await db.services.findById(serviceId);
    if (!service) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Service not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    if (!service.isActive) {
      return NextResponse.json(
        apiError(ErrorCodes.CONFLICT, 'This service is not currently available'),
        { status: 409, headers: corsHeaders() }
      );
    }

    // Validate location
    const location = await db.locations.findById(locationId);
    if (!location) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Location not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Validate provider (if specified)
    let selectedProvider = null;
    if (providerId) {
      selectedProvider = await db.practitioners.findById(providerId);
      if (!selectedProvider) {
        return NextResponse.json(
          apiError(ErrorCodes.NOT_FOUND, 'Provider not found'),
          { status: 404, headers: corsHeaders() }
        );
      }

      // Check if provider can perform this service
      if (!service.practitionerIds.includes(providerId)) {
        return NextResponse.json(
          apiError(ErrorCodes.CONFLICT, 'Selected provider cannot perform this service'),
          { status: 409, headers: corsHeaders() }
        );
      }
    } else {
      // Auto-assign first available provider for this service
      const availableProviders = practitioners.filter(
        (p) => service.practitionerIds.includes(p.id) && p.status === 'active'
      );
      if (availableProviders.length > 0) {
        selectedProvider = availableProviders[0];
      }
    }

    if (!selectedProvider) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'No available provider for this service'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Parse start time
    const appointmentStartTime = new Date(startTime);

    // Validate appointment time is in the future
    if (appointmentStartTime <= new Date()) {
      return NextResponse.json(
        apiError(ErrorCodes.VALIDATION_ERROR, 'Appointment time must be in the future'),
        { status: 400, headers: corsHeaders() }
      );
    }

    // Calculate end time based on service duration
    const duration = service.scheduledDuration || service.duration;
    const appointmentEndTime = new Date(appointmentStartTime.getTime() + duration * 60000);

    // Check for conflicts
    const providerAppointments = existingAppointments.filter(
      (apt) =>
        apt.practitionerId === selectedProvider!.id &&
        apt.status !== 'cancelled' &&
        apt.status !== 'deleted'
    );

    const hasConflict = providerAppointments.some((apt) => {
      const existingStart = new Date(apt.startTime);
      const existingEnd = new Date(apt.endTime);
      // Check if times overlap
      return (
        (appointmentStartTime >= existingStart && appointmentStartTime < existingEnd) ||
        (appointmentEndTime > existingStart && appointmentEndTime <= existingEnd) ||
        (appointmentStartTime <= existingStart && appointmentEndTime >= existingEnd)
      );
    });

    if (hasConflict) {
      return NextResponse.json(
        apiError(ErrorCodes.SLOT_NOT_AVAILABLE, 'This time slot is no longer available'),
        { status: 409, headers: corsHeaders() }
      );
    }

    // Create appointment
    const appointment = await db.appointments.create({
      patientId: patient.id,
      patientName: user.fullName,
      serviceName: service.name,
      serviceCategory: service.category as any,
      practitionerId: selectedProvider.id,
      startTime: appointmentStartTime,
      endTime: appointmentEndTime,
      status: 'scheduled',
      color: service.category === 'aesthetics' ? '#ec4899' : '#10b981',
      duration: service.duration,
      phone: user.phone,
      email: user.email,
      notes: patientNotes,
      locationId,
      requireDeposit: service.depositRequired,
      depositAmount: service.depositAmount,
      depositPaid: false,
      bookingType: 'scheduled',
    });

    // Get full appointment details for response
    const appointmentResponse = {
      id: appointment.id,
      patientId: appointment.patientId,
      providerId: appointment.practitionerId,
      serviceId: service.id,
      locationId,

      serviceName: service.name,
      serviceCategory: service.category,

      providerName: selectedProvider.name,
      providerTitle: selectedProvider.discipline,

      locationName: location.name,
      locationAddress: location.address || '',

      startTime: appointmentStartTime.toISOString(),
      endTime: appointmentEndTime.toISOString(),
      duration: service.duration,
      timezone: 'America/Los_Angeles',

      status: 'PENDING',

      bookedAt: appointment.createdAt.toISOString(),
      bookedBy: 'patient',
      bookingSource: 'app',

      price: service.price,
      depositRequired: service.depositRequired,
      depositAmount: service.depositAmount,
      depositPaid: false,
      paymentStatus: 'pending',

      patientNotes,

      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
    };

    return NextResponse.json(
      apiSuccess({
        message: 'Appointment booked successfully',
        appointment: appointmentResponse,
        confirmationNumber: `APT-${appointment.id.slice(-8).toUpperCase()}`,
        depositRequired: service.depositRequired,
        depositAmount: service.depositAmount,
      }),
      { status: 201, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Book appointment error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while booking appointment.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}
