/**
 * GET /api/settings/automated-messages - Get all automated message configurations
 * POST /api/settings/automated-messages - Create a new automated message configuration
 *
 * Manages automated messaging settings for various events (appointments, waitlist, etc.)
 * Stores in memory for now - in production would use database
 */

import { NextRequest, NextResponse } from 'next/server';
import { AutomatedMessageConfig, EventType } from '@/types/messaging';
import { z } from 'zod';
import { automatedMessageConfigs } from './store';

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

const CreateAutomatedMessageSchema = z.object({
  eventType: z.string(),
  enabled: z.boolean().default(true),
  channels: z.array(z.enum(['sms', 'email'])).min(1),
  timing: z.object({
    type: z.enum(['immediate', 'before_appointment', 'after_event']),
    value: z.number().optional(),
    unit: z.enum(['minutes', 'hours', 'days']).optional(),
  }),
  triggers: z.object({
    onlineBookings: z.boolean(),
    staffBookings: z.boolean(),
    specificServices: z.array(z.string()).optional(),
  }),
  template: MessageTemplateSchema,
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

// GET - Retrieve all automated message configurations
export async function GET(request: NextRequest) {
  try {
    const configs = Object.values(automatedMessageConfigs);

    return NextResponse.json({
      success: true,
      data: configs,
      total: configs.length,
    });
  } catch (error: any) {
    console.error('Get automated messages error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch automated message settings' },
      { status: 500 }
    );
  }
}

// POST - Create a new automated message configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request
    const validated = CreateAutomatedMessageSchema.parse(body);

    // Check if config already exists for this event type
    if (automatedMessageConfigs[validated.eventType]) {
      return NextResponse.json(
        {
          success: false,
          error: `Configuration for event type "${validated.eventType}" already exists`
        },
        { status: 409 }
      );
    }

    // Create new config
    const newConfig: AutomatedMessageConfig = {
      id: validated.eventType,
      eventType: validated.eventType as EventType,
      enabled: validated.enabled,
      channels: validated.channels,
      timing: validated.timing,
      triggers: validated.triggers,
      template: validated.template,
      internalNotification: validated.internalNotification,
      confirmationRequest: validated.confirmationRequest,
      timelineReminders: validated.timelineReminders,
      checkInInstructions: validated.checkInInstructions,
    };

    automatedMessageConfigs[validated.eventType] = newConfig;

    return NextResponse.json({
      success: true,
      data: newConfig,
      message: 'Automated message configuration created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create automated message error:', error);

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
      { success: false, error: error.message || 'Failed to create automated message configuration' },
      { status: 500 }
    );
  }
}
