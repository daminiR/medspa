/**
 * GET /api/settings/automated-messages/[eventType] - Get specific event type configuration
 * PUT /api/settings/automated-messages/[eventType] - Update specific event type configuration
 * DELETE /api/settings/automated-messages/[eventType] - Delete specific event type configuration
 *
 * Manages individual automated messaging configurations
 */

import { NextRequest, NextResponse } from 'next/server';
import { AutomatedMessageConfig, EventType } from '@/types/messaging';
import { automatedMessageConfigs } from '../store';
import { z } from 'zod';

// Validation schemas
const MessageTemplateSchema = z.object({
  subject: z.string().optional(),
  body: z.string().min(1),
  variables: z.array(z.string()),
});

const TimelineReminderSchema = z.object({
  id: z.string(),
  value: z.number().min(1),
  unit: z.enum(['minutes', 'hours', 'days']),
  enabled: z.boolean(),
  template: MessageTemplateSchema,
  channels: z.array(z.enum(['sms', 'email'])),
});

const UpdateAutomatedMessageSchema = z.object({
  enabled: z.boolean().optional(),
  channels: z.array(z.enum(['sms', 'email'])).optional(),
  timing: z.object({
    type: z.enum(['immediate', 'before_appointment', 'after_event']),
    value: z.number().optional(),
    unit: z.enum(['minutes', 'hours', 'days']).optional(),
  }).optional(),
  triggers: z.object({
    onlineBookings: z.boolean().optional(),
    staffBookings: z.boolean().optional(),
    specificServices: z.array(z.string()).optional(),
  }).optional(),
  template: MessageTemplateSchema.optional(),
  internalNotification: z.object({
    enabled: z.boolean(),
    recipients: z.array(z.string()),
  }).optional(),
  confirmationRequest: z.object({
    enabled: z.boolean(),
    setStatusUnconfirmed: z.boolean(),
  }).optional(),
  timelineReminders: z.array(TimelineReminderSchema).optional(),
  checkInInstructions: z.string().optional(),
});

// Valid event types
const VALID_EVENT_TYPES: EventType[] = [
  'appointment_booked',
  'appointment_canceled',
  'appointment_rescheduled',
  'form_submitted',
  'waitlist_added',
  'waitlist_opening',
  'check_in_reminder',
  'patient_waiting',
  'provider_ready',
  'sale_closed',
  'gift_card_purchased',
  'gift_card_received',
  'membership_started',
  'membership_renewal_reminder',
  'membership_renewed',
  'membership_canceled',
];

// GET - Get specific event type configuration
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventType: string }> }
) {
  try {
    const { eventType } = await params;

    // Validate event type format
    if (!VALID_EVENT_TYPES.includes(eventType as EventType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid event type: ${eventType}. Valid types are: ${VALID_EVENT_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const config = automatedMessageConfigs[eventType];

    if (!config) {
      return NextResponse.json(
        { success: false, error: `Configuration not found for event type: ${eventType}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    console.error('Get automated message by eventType error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch automated message configuration' },
      { status: 500 }
    );
  }
}

// PUT - Update specific event type configuration
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventType: string }> }
) {
  try {
    const { eventType } = await params;
    const body = await request.json();

    // Validate event type format
    if (!VALID_EVENT_TYPES.includes(eventType as EventType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid event type: ${eventType}. Valid types are: ${VALID_EVENT_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Check if configuration exists
    const existingConfig = automatedMessageConfigs[eventType];
    if (!existingConfig) {
      return NextResponse.json(
        { success: false, error: `Configuration not found for event type: ${eventType}` },
        { status: 404 }
      );
    }

    // Validate request
    const validated = UpdateAutomatedMessageSchema.parse(body);

    // Apply updates
    if (validated.enabled !== undefined) {
      existingConfig.enabled = validated.enabled;
    }

    if (validated.channels !== undefined) {
      existingConfig.channels = validated.channels;
    }

    if (validated.timing !== undefined) {
      existingConfig.timing = {
        type: validated.timing.type,
        value: validated.timing.value,
        unit: validated.timing.unit,
      };
    }

    if (validated.triggers !== undefined) {
      existingConfig.triggers = {
        onlineBookings: validated.triggers.onlineBookings ?? existingConfig.triggers.onlineBookings,
        staffBookings: validated.triggers.staffBookings ?? existingConfig.triggers.staffBookings,
        specificServices: validated.triggers.specificServices !== undefined
          ? validated.triggers.specificServices
          : existingConfig.triggers.specificServices,
      };
    }

    if (validated.template !== undefined) {
      existingConfig.template = {
        subject: validated.template.subject ?? existingConfig.template.subject,
        body: validated.template.body,
        variables: validated.template.variables,
      };
    }

    if (validated.internalNotification !== undefined) {
      existingConfig.internalNotification = validated.internalNotification;
    }

    if (validated.confirmationRequest !== undefined) {
      existingConfig.confirmationRequest = validated.confirmationRequest;
    }

    if (validated.timelineReminders !== undefined) {
      existingConfig.timelineReminders = validated.timelineReminders;
    }

    if (validated.checkInInstructions !== undefined) {
      existingConfig.checkInInstructions = validated.checkInInstructions;
    }

    return NextResponse.json({
      success: true,
      data: existingConfig,
      message: `Configuration for event type "${eventType}" updated successfully`,
    });
  } catch (error: any) {
    console.error('Update automated message error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update automated message configuration' },
      { status: 500 }
    );
  }
}

// DELETE - Delete specific event type configuration
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventType: string }> }
) {
  try {
    const { eventType } = await params;

    // Validate event type format
    if (!VALID_EVENT_TYPES.includes(eventType as EventType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid event type: ${eventType}. Valid types are: ${VALID_EVENT_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Check if configuration exists
    const config = automatedMessageConfigs[eventType];
    if (!config) {
      return NextResponse.json(
        { success: false, error: `Configuration not found for event type: ${eventType}` },
        { status: 404 }
      );
    }

    // Delete the configuration
    delete automatedMessageConfigs[eventType];

    return NextResponse.json({
      success: true,
      data: {
        eventType,
        deletedAt: new Date().toISOString(),
      },
      message: `Configuration for event type "${eventType}" deleted successfully`,
    });
  } catch (error: any) {
    console.error('Delete automated message error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete automated message configuration' },
      { status: 500 }
    );
  }
}
