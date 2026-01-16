/**
 * GET /api/confirmations/[appointmentId] - Get confirmation status for an appointment
 * PUT /api/confirmations/[appointmentId] - Process confirmation response or update status
 *
 * Tracks:
 * - Confirmation status changes
 * - Response time from patient
 * - Escalation flags
 * - Follow-up actions
 */

import { NextRequest, NextResponse } from 'next/server';
import moment from 'moment';
import {
  ConfirmationStatus,
  ConfirmationChannel,
  EscalationLevel,
  ConfirmationRequest,
} from '@/types/confirmation';
import {
  mockConfirmationResponses,
  getConfirmationsByAppointmentId,
} from '@/lib/data/confirmations';

// Import shared store from main route
import { confirmationRequests } from '../store';

console.log('[DEBUG] Confirmation [appointmentId] API loaded');

/**
 * GET /api/confirmations/[appointmentId]
 * Get confirmation request details for an appointment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;
    console.log('[DEBUG] GET confirmation for appointment:', appointmentId);

    // Find confirmation(s) for this appointment
    const confirmations = confirmationRequests.filter(c => c.appointmentId === appointmentId);

    if (confirmations.length === 0) {
      console.warn('[DEBUG] No confirmation found for appointment:', appointmentId);
      return NextResponse.json(
        { success: false, error: 'Confirmation request not found for this appointment' },
        { status: 404 }
      );
    }

    // Return the most recent confirmation (in case there are multiple)
    const confirmation = confirmations[confirmations.length - 1];

    // Get any responses for this confirmation
    const responses = mockConfirmationResponses.filter(
      r => r.confirmationRequestId === confirmation.id
    );

    console.log('[DEBUG] Found confirmation:', confirmation.id, 'with', responses.length, 'responses');

    // Calculate additional metrics
    const timeUntilAppointment = moment(confirmation.appointmentStart).diff(moment(), 'minutes');
    const hoursUntilAppointment = Math.ceil(timeUntilAppointment / 60);

    // Check if escalation is needed
    const shouldEscalate =
      confirmation.status === 'pending' &&
      moment().diff(moment(confirmation.sentAt), 'hours') >= 24 &&
      confirmation.escalationAttempts === 0;

    const formattedConfirmation = {
      ...confirmation,
      sentAt: confirmation.sentAt instanceof Date ? confirmation.sentAt.toISOString() : confirmation.sentAt,
      respondedAt: confirmation.respondedAt instanceof Date ? confirmation.respondedAt.toISOString() : confirmation.respondedAt,
      escalatedAt: confirmation.escalatedAt instanceof Date ? confirmation.escalatedAt.toISOString() : confirmation.escalatedAt,
      lastEscalationAt: confirmation.lastEscalationAt instanceof Date ? confirmation.lastEscalationAt.toISOString() : confirmation.lastEscalationAt,
      appointmentStart: confirmation.appointmentStart instanceof Date ? confirmation.appointmentStart.toISOString() : confirmation.appointmentStart,
      appointmentEnd: confirmation.appointmentEnd instanceof Date ? confirmation.appointmentEnd.toISOString() : confirmation.appointmentEnd,
      followUpScheduledAt: confirmation.followUpScheduledAt instanceof Date ? confirmation.followUpScheduledAt.toISOString() : confirmation.followUpScheduledAt,
      createdAt: confirmation.createdAt instanceof Date ? confirmation.createdAt.toISOString() : confirmation.createdAt,
      updatedAt: confirmation.updatedAt instanceof Date ? confirmation.updatedAt.toISOString() : confirmation.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...formattedConfirmation,
        responses: responses.map(r => ({
          ...r,
          respondedAt: r.respondedAt instanceof Date ? r.respondedAt.toISOString() : r.respondedAt,
          rescheduledTo: r.rescheduledTo instanceof Date ? r.rescheduledTo.toISOString() : r.rescheduledTo,
        })),
        metrics: {
          timeUntilAppointmentMinutes: timeUntilAppointment,
          hoursUntilAppointment,
          shouldEscalate,
          escalationDue: shouldEscalate ? 'immediate' : null,
        },
      },
    });
  } catch (error) {
    console.error('[ERROR] Confirmation GET [appointmentId]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch confirmation request', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/confirmations/[appointmentId]
 * Update confirmation status or process a patient response
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;
    const body = await request.json();

    console.log('[DEBUG] PUT confirmation for appointment:', appointmentId, 'body:', body);

    // Find the confirmation
    const confirmationIndex = confirmationRequests.findIndex(
      c => c.appointmentId === appointmentId
    );

    if (confirmationIndex === -1) {
      console.warn('[DEBUG] Confirmation not found for appointment:', appointmentId);
      return NextResponse.json(
        { success: false, error: 'Confirmation request not found' },
        { status: 404 }
      );
    }

    const confirmation = confirmationRequests[confirmationIndex];
    console.log('[DEBUG] Updating confirmation:', confirmation.id);

    const {
      action, // 'confirmed', 'rescheduled', 'cancelled', 'escalate', 'mark_followed_up'
      status,
      responseAction,
      responseNotes,
      escalationReason,
      followUpAction,
      followUpScheduledAt,
      updatedBy,
    } = body;

    // Handle different actions
    if (action === 'confirmed') {
      confirmation.status = 'confirmed';
      confirmation.responseAction = 'confirmed';
      confirmation.respondedAt = new Date();
      confirmation.responseTimeMinutes = moment().diff(moment(confirmation.sentAt), 'minutes');
      confirmation.responseNotes = responseNotes || 'Confirmed by patient';
      confirmation.escalationLevel = 'none';
      confirmation.escalationAttempts = 0;
      confirmation.requiresFollowUp = false;
      console.log('[DEBUG] Marked as confirmed. Response time:', confirmation.responseTimeMinutes, 'minutes');
    } else if (action === 'rescheduled') {
      confirmation.status = 'rescheduled';
      confirmation.responseAction = 'rescheduled';
      confirmation.respondedAt = new Date();
      confirmation.responseTimeMinutes = moment().diff(moment(confirmation.sentAt), 'minutes');
      confirmation.responseNotes = responseNotes || 'Patient requested reschedule';
      confirmation.escalationLevel = 'none';
      confirmation.escalationAttempts = 0;
      confirmation.requiresFollowUp = true;
      confirmation.followUpAction = 'Schedule new appointment';
      console.log('[DEBUG] Marked as rescheduled');
    } else if (action === 'cancelled') {
      confirmation.status = 'cancelled';
      confirmation.responseAction = 'cancelled';
      confirmation.respondedAt = new Date();
      confirmation.responseTimeMinutes = moment().diff(moment(confirmation.sentAt), 'minutes');
      confirmation.responseNotes = responseNotes || 'Patient cancelled';
      confirmation.escalationLevel = 'none';
      confirmation.escalationAttempts = 0;
      confirmation.requiresFollowUp = true;
      confirmation.followUpAction = 'Follow up on rescheduling';
      console.log('[DEBUG] Marked as cancelled');
    } else if (action === 'escalate') {
      // Escalate for no response
      confirmation.escalationAttempts += 1;
      confirmation.lastEscalationAt = new Date();

      if (confirmation.escalationAttempts === 1) {
        confirmation.escalationLevel = 'warning';
        confirmation.escalationReason = escalationReason || 'No response after 24 hours';
      } else if (confirmation.escalationAttempts >= 2) {
        confirmation.escalationLevel = 'escalated';
        confirmation.escalationReason = escalationReason || `No response after ${confirmation.escalationAttempts} attempts`;
        confirmation.requiresFollowUp = true;
        confirmation.followUpAction = 'Phone call required';
      }

      console.log('[DEBUG] Escalated. Level:', confirmation.escalationLevel, 'Attempt:', confirmation.escalationAttempts);
    } else if (action === 'mark_followed_up') {
      confirmation.requiresFollowUp = false;
      confirmation.followUpScheduledAt = undefined;
      confirmation.updatedAt = new Date();
      console.log('[DEBUG] Marked as followed up');
    }

    // Handle explicit status updates
    if (status) {
      const validStatuses: ConfirmationStatus[] = ['pending', 'confirmed', 'rescheduled', 'no_response', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      confirmation.status = status;
      console.log('[DEBUG] Status updated to:', status);
    }

    // Update follow-up details if provided
    if (followUpAction) {
      confirmation.followUpAction = followUpAction;
      confirmation.requiresFollowUp = true;
    }

    if (followUpScheduledAt) {
      confirmation.followUpScheduledAt = new Date(followUpScheduledAt);
    }

    // Update timestamps
    confirmation.updatedAt = new Date();
    if (updatedBy) {
      confirmation.updatedBy = updatedBy;
    }

    console.log('[DEBUG] Confirmation updated:', confirmation.id, 'New status:', confirmation.status);

    // Format response
    const formattedResponse = {
      ...confirmation,
      sentAt: confirmation.sentAt instanceof Date ? confirmation.sentAt.toISOString() : confirmation.sentAt,
      respondedAt: confirmation.respondedAt instanceof Date ? confirmation.respondedAt.toISOString() : confirmation.respondedAt,
      escalatedAt: confirmation.escalatedAt instanceof Date ? confirmation.escalatedAt.toISOString() : confirmation.escalatedAt,
      lastEscalationAt: confirmation.lastEscalationAt instanceof Date ? confirmation.lastEscalationAt.toISOString() : confirmation.lastEscalationAt,
      appointmentStart: confirmation.appointmentStart instanceof Date ? confirmation.appointmentStart.toISOString() : confirmation.appointmentStart,
      appointmentEnd: confirmation.appointmentEnd instanceof Date ? confirmation.appointmentEnd.toISOString() : confirmation.appointmentEnd,
      followUpScheduledAt: confirmation.followUpScheduledAt instanceof Date ? confirmation.followUpScheduledAt.toISOString() : confirmation.followUpScheduledAt,
      createdAt: confirmation.createdAt instanceof Date ? confirmation.createdAt.toISOString() : confirmation.createdAt,
      updatedAt: confirmation.updatedAt instanceof Date ? confirmation.updatedAt.toISOString() : confirmation.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: formattedResponse,
      message: `Confirmation request updated: ${confirmation.status}`,
    });
  } catch (error) {
    console.error('[ERROR] Confirmation PUT [appointmentId]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update confirmation request', details: String(error) },
      { status: 500 }
    );
  }
}
