/**
 * Business Hours API Route
 * GET: Retrieve current business hours configuration
 * PUT: Update business hours configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { afterHoursService, AutoResponderConfig, DayOfWeek, Holiday } from '@/services/messaging/after-hours';

// Type definitions for API payloads
interface UpdateBusinessHoursPayload {
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

interface UpdateConfigPayload {
  enabled?: boolean;
  autoReplyMessage?: string;
  timezone?: string;
  responseModes?: {
    respondOutsideHours?: boolean;
    respondOnHolidays?: boolean;
    respondInOutOfOfficeMode?: boolean;
  };
  quietHours?: {
    enabled?: boolean;
    startTime?: string;
    endTime?: string;
  };
}

interface OutOfOfficeModePayload {
  enabled: boolean;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  message?: string;
}

interface HolidayPayload {
  id?: string;
  date: string; // ISO date string
  name: string;
  allDayEvent: boolean;
  startTime?: string;
  endTime?: string;
  isClosed: boolean;
  customMessage?: string;
}

// ============= GET Handler =============

export async function GET(request: NextRequest) {
  try {
    // In production, validate user has admin/settings permissions
    console.log('[API] GET /api/settings/business-hours');

    const config = afterHoursService.getConfig();

    return NextResponse.json(
      {
        success: true,
        data: config,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] GET business-hours error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to retrieve business hours',
      },
      { status: 500 }
    );
  }
}

// ============= PUT Handler =============

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[API] PUT /api/settings/business-hours with body:', JSON.stringify(body, null, 2));

    // Validate request body
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: action',
        },
        { status: 400 }
      );
    }

    let updatedConfig: AutoResponderConfig;

    // Handle different actions
    switch (action) {
      case 'update-config': {
        const updates = payload as UpdateConfigPayload;
        updatedConfig = afterHoursService.updateConfig({
          ...(updates.enabled !== undefined && { enabled: updates.enabled }),
          ...(updates.autoReplyMessage && { autoReplyMessage: updates.autoReplyMessage }),
          ...(updates.timezone && { timezone: updates.timezone }),
          ...(updates.responseModes && {
            responseModes: {
              ...afterHoursService.getConfig().responseModes,
              ...updates.responseModes,
            },
          }),
          ...(updates.quietHours && {
            quietHours: {
              ...afterHoursService.getConfig().quietHours,
              ...updates.quietHours,
            },
          }),
        });
        break;
      }

      case 'update-business-hours': {
        const hours = payload as UpdateBusinessHoursPayload;

        if (!hours.dayOfWeek) {
          return NextResponse.json(
            {
              success: false,
              error: 'Missing required field: dayOfWeek',
            },
            { status: 400 }
          );
        }

        updatedConfig = afterHoursService.updateBusinessHours(hours.dayOfWeek, {
          isOpen: hours.isOpen,
          ...(hours.openTime && { openTime: hours.openTime }),
          ...(hours.closeTime && { closeTime: hours.closeTime }),
        });
        break;
      }

      case 'add-holiday': {
        const holiday = payload as HolidayPayload;

        if (!holiday.date || !holiday.name) {
          return NextResponse.json(
            {
              success: false,
              error: 'Missing required fields: date, name',
            },
            { status: 400 }
          );
        }

        updatedConfig = afterHoursService.addHoliday({
          id: holiday.id || `holiday-${Date.now()}`,
          date: new Date(holiday.date),
          name: holiday.name,
          allDayEvent: holiday.allDayEvent,
          startTime: holiday.startTime,
          endTime: holiday.endTime,
          isClosed: holiday.isClosed,
          customMessage: holiday.customMessage,
        });
        break;
      }

      case 'remove-holiday': {
        const { holidayId } = payload as { holidayId: string };

        if (!holidayId) {
          return NextResponse.json(
            {
              success: false,
              error: 'Missing required field: holidayId',
            },
            { status: 400 }
          );
        }

        updatedConfig = afterHoursService.removeHoliday(holidayId);
        break;
      }

      case 'set-out-of-office': {
        const oooPayload = payload as OutOfOfficeModePayload;
        let startDate = afterHoursService.getConfig().outOfOfficeMode.startDate;
        let endDate = afterHoursService.getConfig().outOfOfficeMode.endDate;

        if (oooPayload.startDate) {
          startDate = new Date(oooPayload.startDate);
        }
        if (oooPayload.endDate) {
          endDate = new Date(oooPayload.endDate);
        }

        updatedConfig = afterHoursService.setOutOfOfficeMode(
          oooPayload.enabled,
          startDate,
          endDate,
          oooPayload.message
        );
        break;
      }

      case 'update-auto-reply-message': {
        const { message } = payload as { message: string };

        if (!message) {
          return NextResponse.json(
            {
              success: false,
              error: 'Missing required field: message',
            },
            { status: 400 }
          );
        }

        updatedConfig = afterHoursService.updateAutoReplyMessage(message);
        break;
      }

      case 'update-timezone': {
        const { timezone } = payload as { timezone: string };

        if (!timezone) {
          return NextResponse.json(
            {
              success: false,
              error: 'Missing required field: timezone',
            },
            { status: 400 }
          );
        }

        updatedConfig = afterHoursService.updateTimezone(timezone);
        break;
      }

      default: {
        return NextResponse.json(
          {
            success: false,
            error: `Unknown action: ${action}`,
            supportedActions: [
              'update-config',
              'update-business-hours',
              'add-holiday',
              'remove-holiday',
              'set-out-of-office',
              'update-auto-reply-message',
              'update-timezone',
            ],
          },
          { status: 400 }
        );
      }
    }

    console.log('[API] Config updated successfully with action:', action);

    return NextResponse.json(
      {
        success: true,
        data: updatedConfig,
        message: `Business hours updated: ${action}`,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API] PUT business-hours error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update business hours',
      },
      { status: 500 }
    );
  }
}

// ============= OPTIONS Handler (for CORS) =============

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}
