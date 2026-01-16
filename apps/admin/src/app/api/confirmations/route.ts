/**
 * GET /api/confirmations - List pending confirmations with filters
 * POST /api/confirmations - Create/send a new confirmation request
 *
 * Handles appointment confirmation tracking with:
 * - Confirmation status (pending/confirmed/rescheduled/no-response)
 * - Response time tracking
 * - Escalation flags for no-response cases
 * - Link to appointment calendar
 */

import { NextRequest, NextResponse } from 'next/server';
import moment from 'moment';
import {
  ConfirmationRequest,
  ConfirmationStatus,
  EscalationLevel,
  ConfirmationFilter,
  ConfirmationChannel,
} from '@/types/confirmation';
import {
  getConfirmationsByStatus,
  getEscalatedConfirmations,
  getHighRiskNoShows,
  calculateConfirmationStats,
} from '@/lib/data/confirmations';
import { confirmationRequests } from './store';

console.log('[DEBUG] Confirmations API initialized with', confirmationRequests.length, 'mock requests');

/**
 * GET /api/confirmations
 * Retrieve pending confirmations with advanced filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const status = searchParams.get('status')?.split(',') as ConfirmationStatus[] | undefined;
    const escalationLevel = searchParams.get('escalationLevel')?.split(',') as EscalationLevel[] | undefined;
    const channel = searchParams.get('channel')?.split(',') as ConfirmationChannel[] | undefined;
    const practitionerId = searchParams.get('practitionerId') || undefined;
    const patientId = searchParams.get('patientId') || undefined;
    const search = searchParams.get('search') || undefined;
    const requiresFollowUp = searchParams.get('requiresFollowUp') === 'true';
    const highRiskOnly = searchParams.get('highRiskOnly') === 'true';
    const sortBy = searchParams.get('sortBy') || 'sentAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    console.log('[DEBUG] GET confirmations with params:', {
      status,
      escalationLevel,
      channel,
      practitionerId,
      patientId,
      search,
      requiresFollowUp,
      highRiskOnly,
    });

    let result = [...confirmationRequests];

    // Calculate status counts BEFORE filtering
    const statusCounts = {
      pending: confirmationRequests.filter(c => c.status === 'pending').length,
      confirmed: confirmationRequests.filter(c => c.status === 'confirmed').length,
      rescheduled: confirmationRequests.filter(c => c.status === 'rescheduled').length,
      no_response: confirmationRequests.filter(c => c.status === 'no_response').length,
      cancelled: confirmationRequests.filter(c => c.status === 'cancelled').length,
    };

    // Apply filters
    if (status && status.length > 0) {
      result = result.filter(c => status.includes(c.status));
      console.log('[DEBUG] After status filter:', result.length);
    }

    if (escalationLevel && escalationLevel.length > 0) {
      result = result.filter(c => escalationLevel.includes(c.escalationLevel));
      console.log('[DEBUG] After escalation level filter:', result.length);
    }

    if (channel && channel.length > 0) {
      result = result.filter(
        c => channel.includes(c.primaryChannel) ||
          (c.secondaryChannels && c.secondaryChannels.some(ch => channel.includes(ch)))
      );
      console.log('[DEBUG] After channel filter:', result.length);
    }

    if (practitionerId) {
      result = result.filter(c => c.practitionerId === practitionerId);
      console.log('[DEBUG] After practitionerId filter:', result.length);
    }

    if (patientId) {
      result = result.filter(c => c.patientId === patientId);
      console.log('[DEBUG] After patientId filter:', result.length);
    }

    if (requiresFollowUp) {
      result = result.filter(c => c.requiresFollowUp);
      console.log('[DEBUG] After requiresFollowUp filter:', result.length);
    }

    if (highRiskOnly) {
      result = result.filter(c => c.noShowRisk === 'high' && c.status !== 'confirmed');
      console.log('[DEBUG] After highRiskOnly filter:', result.length);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(c =>
        c.patientName.toLowerCase().includes(searchLower) ||
        c.serviceName.toLowerCase().includes(searchLower) ||
        c.patientPhone.includes(search) ||
        c.patientEmail?.toLowerCase().includes(searchLower) ||
        c.practitionerName.toLowerCase().includes(searchLower)
      );
      console.log('[DEBUG] After search filter:', result.length);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      const aVal = a[sortBy as keyof ConfirmationRequest];
      const bVal = b[sortBy as keyof ConfirmationRequest];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        comparison = aVal.getTime() - bVal.getTime();
      } else if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const total = result.length;

    // Pagination
    const start = (page - 1) * limit;
    const paginatedResult = result.slice(start, start + limit);

    console.log(`[DEBUG] Returning page ${page} with ${paginatedResult.length} items (total: ${total})`);

    // Format response with dates as ISO strings
    const formattedResult = paginatedResult.map(conf => ({
      ...conf,
      sentAt: conf.sentAt instanceof Date ? conf.sentAt.toISOString() : conf.sentAt,
      respondedAt: conf.respondedAt instanceof Date ? conf.respondedAt.toISOString() : conf.respondedAt,
      escalatedAt: conf.escalatedAt instanceof Date ? conf.escalatedAt.toISOString() : conf.escalatedAt,
      lastEscalationAt: conf.lastEscalationAt instanceof Date ? conf.lastEscalationAt.toISOString() : conf.lastEscalationAt,
      appointmentStart: conf.appointmentStart instanceof Date ? conf.appointmentStart.toISOString() : conf.appointmentStart,
      appointmentEnd: conf.appointmentEnd instanceof Date ? conf.appointmentEnd.toISOString() : conf.appointmentEnd,
      followUpScheduledAt: conf.followUpScheduledAt instanceof Date ? conf.followUpScheduledAt.toISOString() : conf.followUpScheduledAt,
      createdAt: conf.createdAt instanceof Date ? conf.createdAt.toISOString() : conf.createdAt,
      updatedAt: conf.updatedAt instanceof Date ? conf.updatedAt.toISOString() : conf.updatedAt,
    }));

    // Calculate stats
    const stats = calculateConfirmationStats();

    return NextResponse.json({
      success: true,
      data: formattedResult,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
      statusCounts,
    });
  } catch (error) {
    console.error('[ERROR] Confirmations GET:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch confirmation requests', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * POST /api/confirmations
 * Create and send a new confirmation request
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[DEBUG] POST confirmation request body:', body);

    const {
      appointmentId,
      patientId,
      patientName,
      patientPhone,
      patientEmail,
      serviceName,
      practitionerId,
      practitionerName,
      appointmentStart,
      appointmentEnd,
      primaryChannel = 'sms',
      secondaryChannels = [],
      isNewPatient = false,
      noShowRisk = 'low',
    } = body;

    // Validate required fields
    const requiredFields = [
      'appointmentId',
      'patientId',
      'patientName',
      'patientPhone',
      'serviceName',
      'practitionerId',
      'practitionerName',
      'appointmentStart',
      'appointmentEnd',
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      console.warn('[DEBUG] Missing required fields:', missingFields);
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate channel
    const validChannels: ConfirmationChannel[] = ['sms', 'email', 'phone', 'in_person'];
    if (!validChannels.includes(primaryChannel)) {
      return NextResponse.json(
        { success: false, error: `Invalid primary channel. Must be one of: ${validChannels.join(', ')}` },
        { status: 400 }
      );
    }

    // Check for duplicate confirmations (not already sent for this appointment)
    const existingConfirmation = confirmationRequests.find(c => c.appointmentId === appointmentId);
    if (existingConfirmation && existingConfirmation.status === 'pending') {
      console.warn('[DEBUG] Confirmation already pending for appointment:', appointmentId);
      return NextResponse.json(
        { success: false, error: 'A confirmation request is already pending for this appointment' },
        { status: 400 }
      );
    }

    // Create new confirmation request
    const newConfirmation: ConfirmationRequest = {
      id: `conf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      appointmentId,
      patientId,
      patientName,
      patientPhone,
      patientEmail,
      serviceName,
      practitionerId,
      practitionerName,
      appointmentStart: new Date(appointmentStart),
      appointmentEnd: new Date(appointmentEnd),
      status: 'pending',
      primaryChannel,
      secondaryChannels: secondaryChannels || [],
      sentAt: new Date(),
      escalationLevel: 'none',
      escalationAttempts: 0,
      isNewPatient,
      noShowRisk,
      requiresFollowUp: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: body.createdBy || 'system',
    };

    confirmationRequests.push(newConfirmation);
    console.log('[DEBUG] Created new confirmation:', newConfirmation.id);
    console.log('[DEBUG] Total confirmations:', confirmationRequests.length);

    // Format response
    const response = {
      ...newConfirmation,
      sentAt: newConfirmation.sentAt.toISOString(),
      appointmentStart: newConfirmation.appointmentStart.toISOString(),
      appointmentEnd: newConfirmation.appointmentEnd.toISOString(),
      createdAt: newConfirmation.createdAt.toISOString(),
      updatedAt: newConfirmation.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: response,
      message: `Confirmation request sent via ${primaryChannel} to ${patientName}`,
    }, { status: 201 });
  } catch (error) {
    console.error('[ERROR] Confirmations POST:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create confirmation request', details: String(error) },
      { status: 500 }
    );
  }
}
