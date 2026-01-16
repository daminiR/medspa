/**
 * Check-In Notification API Route
 * Handles triggering various check-in related messages
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkInMessagingService, CheckInMessageType, CheckInAppointment } from '@/services/checkin/messaging';
import { appointments, getPractitionerById } from '@/lib/data';
import { z } from 'zod';

// Request validation schemas
const PreArrivalReminderSchema = z.object({
  appointmentId: z.string().min(1),
  sendTo: z.enum(['patient']).optional().default('patient'),
});

const CustomInstructionsSchema = z.object({
  appointmentId: z.string().min(1),
  parkingInstructions: z.string().optional(),
  directionsLink: z.string().url().optional(),
  specialInstructions: z.string().optional(),
});

const WaitingNotificationSchema = z.object({
  appointmentId: z.string().min(1),
  staffPhone: z.string().min(10),
  waitingMinutes: z.number().optional().default(0),
});

const ProviderReadySchema = z.object({
  appointmentId: z.string().min(1),
  roomNumber: z.string().optional(),
});

const CheckInConfirmationSchema = z.object({
  appointmentId: z.string().min(1),
});

const CompletePackageSchema = z.object({
  appointmentId: z.string().min(1),
  includeCustomInstructions: z.boolean().optional().default(true),
  parkingInstructions: z.string().optional(),
  directionsLink: z.string().url().optional(),
  specialInstructions: z.string().optional(),
  roomNumber: z.string().optional(),
});

/**
 * POST /api/checkin/notify
 *
 * Query parameters:
 * - type: pre-arrival | custom-instructions | waiting-notification | provider-ready | confirmation | complete-package
 *
 * Body varies by type (see schemas above)
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationType = searchParams.get('type');
    const body = await request.json();

    console.log(`[CheckIn API] Received notification request: type=${notificationType}`);
    console.log(`[CheckIn API] Body:`, JSON.stringify(body, null, 2));

    // Route to appropriate handler
    switch (notificationType) {
      case 'pre-arrival':
        return await handlePreArrivalReminder(body);

      case 'custom-instructions':
        return await handleCustomInstructions(body);

      case 'waiting-notification':
        return await handleWaitingNotification(body);

      case 'provider-ready':
        return await handleProviderReady(body);

      case 'confirmation':
        return await handleCheckInConfirmation(body);

      case 'complete-package':
        return await handleCompletePackage(body);

      default:
        return NextResponse.json(
          { error: `Unknown notification type: ${notificationType}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[CheckIn API] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle pre-arrival 15-minute reminder
 */
async function handlePreArrivalReminder(body: any) {
  try {
    const validated = PreArrivalReminderSchema.parse(body);

    // Find appointment
    const appointment = appointments.find(a => a.id === validated.appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    if (!appointment.phone || !appointment.patientName) {
      return NextResponse.json(
        { error: 'Missing required appointment data (phone, patientName)' },
        { status: 400 }
      );
    }

    // Build check-in appointment object
    const checkInApt: CheckInAppointment = {
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      patientPhone: appointment.phone,
      providerName: getPractitionerById(appointment.practitionerId)?.name || 'Your Provider',
      serviceName: appointment.serviceName,
      scheduledTime: new Date(appointment.startTime),
      appointmentAddress: 'Luxe Medical Spa',
      parkingInstructions: 'Front lot parking available',
    };

    console.log(`[CheckIn API] Sending pre-arrival reminder for appointment ${appointment.id}`);

    const result = await checkInMessagingService.sendPreArrivalReminder(checkInApt);

    return NextResponse.json({
      success: true,
      message: 'Pre-arrival reminder sent successfully',
      notification: {
        type: CheckInMessageType.PRE_ARRIVAL_15MIN,
        appointmentId: appointment.id,
        patientPhone: appointment.phone,
        messageId: result.sid,
        status: result.status,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[CheckIn API] Pre-arrival error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send pre-arrival reminder' },
      { status: 500 }
    );
  }
}

/**
 * Handle custom arrival instructions
 */
async function handleCustomInstructions(body: any) {
  try {
    const validated = CustomInstructionsSchema.parse(body);

    // Find appointment
    const appointment = appointments.find(a => a.id === validated.appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (!appointment.phone || !appointment.patientName) {
      return NextResponse.json(
        { error: 'Missing required appointment data' },
        { status: 400 }
      );
    }

    // Build check-in appointment object with custom instructions
    const checkInApt: CheckInAppointment = {
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      patientPhone: appointment.phone,
      providerName: getPractitionerById(appointment.practitionerId)?.name || 'Your Provider',
      serviceName: appointment.serviceName,
      scheduledTime: new Date(appointment.startTime),
      appointmentAddress: 'Luxe Medical Spa',
      parkingInstructions: validated.parkingInstructions,
      directionsLink: validated.directionsLink,
      specialInstructions: validated.specialInstructions,
    };

    console.log(`[CheckIn API] Sending custom instructions for appointment ${appointment.id}`);

    const result = await checkInMessagingService.sendCustomInstructions(checkInApt);

    return NextResponse.json({
      success: true,
      message: 'Custom instructions sent successfully',
      notification: {
        type: CheckInMessageType.CUSTOM_INSTRUCTIONS,
        appointmentId: appointment.id,
        patientPhone: appointment.phone,
        messageId: result.sid,
        status: result.status,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[CheckIn API] Custom instructions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send custom instructions' },
      { status: 500 }
    );
  }
}

/**
 * Handle patient waiting notification to staff
 */
async function handleWaitingNotification(body: any) {
  try {
    const validated = WaitingNotificationSchema.parse(body);

    // Find appointment
    const appointment = appointments.find(a => a.id === validated.appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (!appointment.phone || !appointment.patientName) {
      return NextResponse.json(
        { error: 'Missing required appointment data' },
        { status: 400 }
      );
    }

    // Build check-in appointment object
    const checkInApt: CheckInAppointment = {
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      patientPhone: appointment.phone,
      providerName: getPractitionerById(appointment.practitionerId)?.name || 'Provider',
      serviceName: appointment.serviceName,
      scheduledTime: new Date(appointment.startTime),
      roomNumber: `Room ${Math.floor(Math.random() * 10) + 1}`, // Mock room assignment
    };

    console.log(`[CheckIn API] Sending waiting notification to staff ${validated.staffPhone}`);

    const result = await checkInMessagingService.sendWaitingNotificationToStaff(
      checkInApt,
      validated.staffPhone,
      validated.waitingMinutes
    );

    return NextResponse.json({
      success: true,
      message: 'Staff notification sent successfully',
      notification: {
        type: CheckInMessageType.WAITING_NOTIFICATION_STAFF,
        appointmentId: appointment.id,
        staffPhone: validated.staffPhone,
        messageId: result.sid,
        status: result.status,
        sentAt: new Date().toISOString(),
        waitingMinutes: validated.waitingMinutes,
      },
    });
  } catch (error: any) {
    console.error('[CheckIn API] Waiting notification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send waiting notification' },
      { status: 500 }
    );
  }
}

/**
 * Handle provider ready notification
 */
async function handleProviderReady(body: any) {
  try {
    const validated = ProviderReadySchema.parse(body);

    // Find appointment
    const appointment = appointments.find(a => a.id === validated.appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (!appointment.phone || !appointment.patientName) {
      return NextResponse.json(
        { error: 'Missing required appointment data' },
        { status: 400 }
      );
    }

    // Build check-in appointment object
    const checkInApt: CheckInAppointment = {
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      patientPhone: appointment.phone,
      providerName: getPractitionerById(appointment.practitionerId)?.name || 'Your Provider',
      serviceName: appointment.serviceName,
      scheduledTime: new Date(appointment.startTime),
      roomNumber: validated.roomNumber || `Room ${Math.floor(Math.random() * 10) + 1}`,
    };

    console.log(`[CheckIn API] Sending provider ready notification for appointment ${appointment.id}`);

    const result = await checkInMessagingService.sendProviderReadyNotification(checkInApt);

    return NextResponse.json({
      success: true,
      message: 'Provider ready notification sent successfully',
      notification: {
        type: CheckInMessageType.PROVIDER_READY,
        appointmentId: appointment.id,
        patientPhone: appointment.phone,
        messageId: result.sid,
        status: result.status,
        sentAt: new Date().toISOString(),
        roomNumber: checkInApt.roomNumber,
      },
    });
  } catch (error: any) {
    console.error('[CheckIn API] Provider ready error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send provider ready notification' },
      { status: 500 }
    );
  }
}

/**
 * Handle check-in confirmation
 */
async function handleCheckInConfirmation(body: any) {
  try {
    const validated = CheckInConfirmationSchema.parse(body);

    // Find appointment
    const appointment = appointments.find(a => a.id === validated.appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (!appointment.phone || !appointment.patientName) {
      return NextResponse.json(
        { error: 'Missing required appointment data' },
        { status: 400 }
      );
    }

    // Build check-in appointment object
    const checkInApt: CheckInAppointment = {
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      patientPhone: appointment.phone,
      providerName: getPractitionerById(appointment.practitionerId)?.name || 'Your Provider',
      serviceName: appointment.serviceName,
      scheduledTime: new Date(appointment.startTime),
    };

    console.log(`[CheckIn API] Sending check-in confirmation for appointment ${appointment.id}`);

    const result = await checkInMessagingService.sendCheckInConfirmation(checkInApt);

    return NextResponse.json({
      success: true,
      message: 'Check-in confirmation sent successfully',
      notification: {
        type: CheckInMessageType.CHECKIN_CONFIRMATION,
        appointmentId: appointment.id,
        patientPhone: appointment.phone,
        messageId: result.sid,
        status: result.status,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[CheckIn API] Check-in confirmation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send check-in confirmation' },
      { status: 500 }
    );
  }
}

/**
 * Handle complete check-in package
 * Sends pre-arrival reminder, custom instructions, and confirmation
 */
async function handleCompletePackage(body: any) {
  try {
    const validated = CompletePackageSchema.parse(body);

    // Find appointment
    const appointment = appointments.find(a => a.id === validated.appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (!appointment.phone || !appointment.patientName) {
      return NextResponse.json(
        { error: 'Missing required appointment data' },
        { status: 400 }
      );
    }

    // Build check-in appointment object with all available data
    const checkInApt: CheckInAppointment = {
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: appointment.patientName,
      patientPhone: appointment.phone,
      providerName: getPractitionerById(appointment.practitionerId)?.name || 'Your Provider',
      serviceName: appointment.serviceName,
      scheduledTime: new Date(appointment.startTime),
      appointmentAddress: 'Luxe Medical Spa',
      parkingInstructions: validated.parkingInstructions || 'Front lot parking available',
      directionsLink: validated.directionsLink,
      specialInstructions: validated.specialInstructions,
      roomNumber: validated.roomNumber,
    };

    console.log(`[CheckIn API] Sending complete check-in package for appointment ${appointment.id}`);

    const results = await checkInMessagingService.sendCompleteCheckInPackage(
      checkInApt,
      validated.includeCustomInstructions
    );

    const notifications: any[] = [];

    if (results.preArrival) {
      notifications.push({
        type: CheckInMessageType.PRE_ARRIVAL_15MIN,
        messageId: results.preArrival.sid,
        status: results.preArrival.status,
      });
    }

    if (results.customInstructions) {
      notifications.push({
        type: CheckInMessageType.CUSTOM_INSTRUCTIONS,
        messageId: results.customInstructions.sid,
        status: results.customInstructions.status,
      });
    }

    if (results.confirmation) {
      notifications.push({
        type: CheckInMessageType.CHECKIN_CONFIRMATION,
        messageId: results.confirmation.sid,
        status: results.confirmation.status,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Complete check-in package sent successfully',
      appointmentId: appointment.id,
      patientPhone: appointment.phone,
      notificationsSent: notifications.length,
      notifications,
      sentAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[CheckIn API] Complete package error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send complete check-in package' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/checkin/notify
 * Get check-in notification history for an appointment
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('appointmentId');

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'appointmentId is required' },
        { status: 400 }
      );
    }

    const history = checkInMessagingService.getNotificationHistory(appointmentId);

    console.log(`[CheckIn API] Retrieved notification history for appointment ${appointmentId}: ${history.length} records`);

    return NextResponse.json({
      success: true,
      appointmentId,
      notificationCount: history.length,
      notifications: history.map(n => ({
        type: n.messageType,
        patientName: n.patientName,
        patientPhone: n.patientPhone,
        sentAt: n.sentAt,
        status: n.status,
        messageId: n.messageId,
      })),
    });
  } catch (error: any) {
    console.error('[CheckIn API] Error fetching history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notification history' },
      { status: 500 }
    );
  }
}
