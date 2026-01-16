/**
 * GET /api/patient/appointments - List patient's appointments
 * POST /api/patient/appointments/book - Book a new appointment (handled in /book/route.ts)
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError, apiPaginatedSuccess, ErrorCodes } from '@/lib/api-response';
import { getAppointmentsSchema } from '@/lib/validations/patient';
import { requireAuth, handlePreflight, corsHeaders } from '@/lib/auth/middleware';
import { db } from '@/lib/db';

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function GET(request: NextRequest) {
  try {
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

    // Parse query params
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      status: searchParams.get('status'),
      upcoming: searchParams.get('upcoming'),
      past: searchParams.get('past'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    };

    const validationResult = getAppointmentsSchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        apiError(ErrorCodes.VALIDATION_ERROR, 'Invalid query parameters'),
        { status: 400, headers: corsHeaders() }
      );
    }

    const { page, limit, status, upcoming, past, startDate, endDate } = validationResult.data;

    // Get all appointments for this patient
    // In the current mock system, we match by patientId string
    // This needs to map patient.id to appointment.patientId
    let allAppointments = await db.appointments.findAll();

    // Filter by patient (using old patient id format from mock data)
    // In production with proper DB, this would be a direct query
    const patientAppointments = allAppointments.filter(apt => {
      // Try to match against patient's user ID or the patient ID in appointments
      return apt.patientId === patient.id || apt.patientId === patient.userId;
    });

    // Apply filters
    let filteredAppointments = [...patientAppointments];
    const now = new Date();

    // Filter by status
    if (status) {
      const statusMap: Record<string, string[]> = {
        PENDING: ['scheduled'],
        CONFIRMED: ['confirmed'],
        CHECKED_IN: ['arrived'],
        IN_PROGRESS: ['in_progress'],
        COMPLETED: ['completed'],
        CANCELLED: ['cancelled'],
        NO_SHOW: ['no_show'],
      };
      const mappedStatuses = statusMap[status] || [status.toLowerCase()];
      filteredAppointments = filteredAppointments.filter((apt) =>
        mappedStatuses.includes(apt.status)
      );
    }

    // Filter upcoming
    if (upcoming) {
      filteredAppointments = filteredAppointments.filter(
        (apt) => new Date(apt.startTime) >= now && apt.status !== 'cancelled' && apt.status !== 'completed'
      );
    }

    // Filter past
    if (past) {
      filteredAppointments = filteredAppointments.filter(
        (apt) => new Date(apt.startTime) < now || apt.status === 'completed'
      );
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      filteredAppointments = filteredAppointments.filter(
        (apt) => new Date(apt.startTime) >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate);
      filteredAppointments = filteredAppointments.filter(
        (apt) => new Date(apt.startTime) <= end
      );
    }

    // Sort by start time (upcoming first, then past)
    filteredAppointments.sort((a, b) => {
      const dateA = new Date(a.startTime);
      const dateB = new Date(b.startTime);
      // If both are upcoming, sort ascending (earliest first)
      // If both are past, sort descending (most recent first)
      if (dateA >= now && dateB >= now) {
        return dateA.getTime() - dateB.getTime();
      }
      if (dateA < now && dateB < now) {
        return dateB.getTime() - dateA.getTime();
      }
      // Upcoming before past
      return dateA >= now ? -1 : 1;
    });

    // Pagination
    const total = filteredAppointments.length;
    const startIndex = (page - 1) * limit;
    const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + limit);

    // Enrich appointments with provider and service details
    const enrichedAppointments = await Promise.all(
      paginatedAppointments.map(async (apt) => {
        const practitioner = await db.practitioners.findById(apt.practitionerId);
        const service = services.find(s => s.name === apt.serviceName);
        const location = await db.locations.findById(apt.locationId || 'loc-1');

        return {
          id: apt.id,
          patientId: apt.patientId,
          providerId: apt.practitionerId,
          serviceId: service?.id,
          locationId: apt.locationId || 'loc-1',

          serviceName: apt.serviceName,
          serviceCategory: apt.serviceCategory,

          providerName: practitioner?.name || apt.practitionerId,
          providerTitle: practitioner?.discipline,

          locationName: location?.name || 'Main Clinic',
          locationAddress: location?.address || '',

          startTime: apt.startTime instanceof Date ? apt.startTime.toISOString() : apt.startTime,
          endTime: apt.endTime instanceof Date ? apt.endTime.toISOString() : apt.endTime,
          duration: apt.duration,
          timezone: 'America/Los_Angeles',

          status: apt.status.toUpperCase(),
          confirmedAt: apt.smsConfirmedAt?.toISOString(),
          checkedInAt: apt.arrivalTime?.toISOString(),
          cancelledAt: apt.cancelledAt?.toISOString(),
          cancellationReason: apt.cancellationReason,

          bookedAt: apt.createdAt instanceof Date ? apt.createdAt.toISOString() : apt.createdAt,
          bookedBy: apt.bookingType === 'walk_in' ? 'staff' : 'patient',
          bookingSource: apt.bookingType || 'app',

          price: service?.price || 0,
          depositRequired: apt.requireDeposit || false,
          depositAmount: apt.depositAmount,
          depositPaid: apt.depositPaid || false,
          paymentStatus: apt.depositPaid ? 'paid' : 'pending',

          patientNotes: apt.notes,

          createdAt: apt.createdAt instanceof Date ? apt.createdAt.toISOString() : apt.createdAt,
          updatedAt: apt.updatedAt instanceof Date ? apt.updatedAt.toISOString() : apt.updatedAt,
        };
      })
    );

    return NextResponse.json(
      apiPaginatedSuccess(enrichedAppointments, page, limit, total),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while fetching appointments.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}

// Need to import services from db
import { services } from '@/lib/data';
