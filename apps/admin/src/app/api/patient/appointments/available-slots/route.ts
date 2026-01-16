/**
 * GET /api/patient/appointments/available-slots
 * Get available appointment slots for a service
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiSuccess, apiError, ErrorCodes } from '@/lib/api-response';
import { getAvailableSlotsSchema } from '@/lib/validations/patient';
import { handlePreflight, corsHeaders } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { services, practitioners, appointments as existingAppointments, practitionerShifts } from '@/lib/data';

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function GET(request: NextRequest) {
  try {
    // Parse query params
    const { searchParams } = new URL(request.url);
    const queryParams = {
      serviceId: searchParams.get('serviceId') || '',
      providerId: searchParams.get('providerId') || undefined,
      locationId: searchParams.get('locationId') || '',
      date: searchParams.get('date') || '',
    };

    const validationResult = getAvailableSlotsSchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        apiError(ErrorCodes.VALIDATION_ERROR, 'Invalid query parameters'),
        { status: 400, headers: corsHeaders() }
      );
    }

    const { serviceId, providerId, locationId, date } = validationResult.data;

    // Get service
    const service = await db.services.findById(serviceId);
    if (!service) {
      return NextResponse.json(
        apiError(ErrorCodes.NOT_FOUND, 'Service not found'),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Get providers who can perform this service
    let availableProviders = practitioners.filter(
      (p) => service.practitionerIds.includes(p.id) && p.status === 'active'
    );

    // Filter by specific provider if requested
    if (providerId) {
      availableProviders = availableProviders.filter((p) => p.id === providerId);
      if (availableProviders.length === 0) {
        return NextResponse.json(
          apiError(ErrorCodes.NOT_FOUND, 'Provider not found or cannot perform this service'),
          { status: 404, headers: corsHeaders() }
        );
      }
    }

    // Parse the date
    const requestedDate = new Date(date + 'T00:00:00');
    const dayOfWeek = requestedDate.getDay();

    // Get duration for slot calculation
    const duration = service.scheduledDuration || service.duration;
    const slotInterval = 30; // 30-minute slot intervals

    // Generate slots for each provider
    const allSlots: Array<{
      startTime: string;
      endTime: string;
      providerId: string;
      providerName: string;
      available: boolean;
    }> = [];

    for (const provider of availableProviders) {
      // Get provider's schedule for this day
      const shifts = practitionerShifts.filter(
        (s) => s.practitionerId === provider.id && s.dayOfWeek === dayOfWeek
      );

      if (shifts.length === 0) {
        // Provider doesn't work this day
        continue;
      }

      for (const shift of shifts) {
        // Generate time slots within the shift
        let currentHour = shift.startHour;
        let currentMinute = shift.startMinute;

        while (
          currentHour < shift.endHour ||
          (currentHour === shift.endHour && currentMinute < shift.endMinute)
        ) {
          // Create slot start time
          const slotStart = new Date(requestedDate);
          slotStart.setHours(currentHour, currentMinute, 0, 0);

          // Create slot end time
          const slotEnd = new Date(slotStart.getTime() + duration * 60000);

          // Check if slot end is within shift
          const shiftEndTime = new Date(requestedDate);
          shiftEndTime.setHours(shift.endHour, shift.endMinute, 0, 0);

          if (slotEnd > shiftEndTime) {
            break; // Slot would extend past shift end
          }

          // Check if slot is in the past
          const now = new Date();
          if (slotStart <= now) {
            // Move to next slot
            currentMinute += slotInterval;
            if (currentMinute >= 60) {
              currentHour += Math.floor(currentMinute / 60);
              currentMinute = currentMinute % 60;
            }
            continue;
          }

          // Check for conflicts with existing appointments
          const providerAppointments = existingAppointments.filter(
            (apt) =>
              apt.practitionerId === provider.id &&
              apt.status !== 'cancelled' &&
              apt.status !== 'deleted'
          );

          const hasConflict = providerAppointments.some((apt) => {
            const existingStart = new Date(apt.startTime);
            const existingEnd = new Date(apt.endTime);

            // Only check appointments on the same day
            if (existingStart.toDateString() !== requestedDate.toDateString()) {
              return false;
            }

            return (
              (slotStart >= existingStart && slotStart < existingEnd) ||
              (slotEnd > existingStart && slotEnd <= existingEnd) ||
              (slotStart <= existingStart && slotEnd >= existingEnd)
            );
          });

          allSlots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            providerId: provider.id,
            providerName: provider.name,
            available: !hasConflict,
          });

          // Move to next slot
          currentMinute += slotInterval;
          if (currentMinute >= 60) {
            currentHour += Math.floor(currentMinute / 60);
            currentMinute = currentMinute % 60;
          }
        }
      }
    }

    // Sort slots by time, then by provider
    allSlots.sort((a, b) => {
      const timeCompare = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      if (timeCompare !== 0) return timeCompare;
      return a.providerName.localeCompare(b.providerName);
    });

    // Get location info
    const location = await db.locations.findById(locationId);

    return NextResponse.json(
      apiSuccess({
        date,
        service: {
          id: service.id,
          name: service.name,
          duration: service.duration,
          scheduledDuration: service.scheduledDuration,
          price: service.price,
        },
        location: location
          ? {
              id: location.id,
              name: location.name,
              address: location.address,
            }
          : null,
        providers: availableProviders.map((p) => ({
          id: p.id,
          name: p.name,
          title: p.discipline,
        })),
        slots: allSlots,
        availableCount: allSlots.filter((s) => s.available).length,
        totalCount: allSlots.length,
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    console.error('Get available slots error:', error);
    return NextResponse.json(
      apiError(ErrorCodes.INTERNAL_ERROR, 'An error occurred while fetching available slots.'),
      { status: 500, headers: corsHeaders() }
    );
  }
}
