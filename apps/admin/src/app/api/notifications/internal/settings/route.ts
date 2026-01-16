/**
 * Internal Notification Settings API
 * GET /api/notifications/internal/settings - Get notification settings
 * PUT /api/notifications/internal/settings - Update notification settings
 *
 * Manages notification settings per event type and recipient configuration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { InternalNotificationEventType, InternalNotificationConfig } from '@/types/notifications';

// Validation schemas
const NotificationSettingsSchema = z.object({
  eventType: z.enum([
    'appointment_booked',
    'appointment_canceled',
    'appointment_rescheduled',
    'appointment_no_show',
    'patient_checked_in',
    'patient_late',
    'form_submitted',
    'waitlist_match',
    'waitlist_patient_added',
    'sale_closed',
    'gift_card_purchased',
    'membership_purchased',
    'payment_received',
    'payment_failed',
    'treatment_complete',
    'inventory_low',
    'online_booking',
    'express_booking',
  ] as const),
  enabled: z.boolean(),
  recipients: z.array(z.string().email()),
  includeDetails: z.boolean().optional(),
  customMessage: z.string().optional(),
});

type NotificationSettingsRequest = z.infer<typeof NotificationSettingsSchema>;

// In-memory store for notification settings (in production: database)
interface StoredNotificationSettings extends InternalNotificationConfig {
  eventType: InternalNotificationEventType;
  updatedAt: string;
  updatedBy?: string;
}

const notificationSettings: Map<InternalNotificationEventType, StoredNotificationSettings> = new Map();

/**
 * Initialize default settings
 */
function initializeDefaultSettings() {
  const defaultRecipients = ['admin@medspa.com', 'notifications@medspa.com'];

  const defaultConfigs: Record<InternalNotificationEventType, InternalNotificationConfig> = {
    'appointment_booked': {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: true,
    },
    'appointment_canceled': {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: true,
    },
    'appointment_rescheduled': {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: true,
    },
    'appointment_no_show': {
      enabled: true,
      recipients: [...defaultRecipients, 'managers@medspa.com'],
      includeDetails: true,
    },
    'patient_checked_in': {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: true,
    },
    'patient_late': {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: true,
    },
    'form_submitted': {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: false,
    },
    'waitlist_match': {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: true,
    },
    'waitlist_patient_added': {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: true,
    },
    'sale_closed': {
      enabled: true,
      recipients: [...defaultRecipients, 'sales@medspa.com'],
      includeDetails: true,
    },
    'gift_card_purchased': {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: true,
    },
    'membership_purchased': {
      enabled: true,
      recipients: [...defaultRecipients, 'sales@medspa.com'],
      includeDetails: true,
    },
    'payment_received': {
      enabled: true,
      recipients: ['billing@medspa.com'],
      includeDetails: true,
    },
    'payment_failed': {
      enabled: true,
      recipients: ['billing@medspa.com', 'managers@medspa.com'],
      includeDetails: true,
    },
    'treatment_complete': {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: true,
    },
    'inventory_low': {
      enabled: true,
      recipients: [...defaultRecipients, 'inventory@medspa.com'],
      includeDetails: true,
    },
    'online_booking': {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: true,
    },
    'express_booking': {
      enabled: true,
      recipients: defaultRecipients,
      includeDetails: true,
    },
  };

  // Initialize all settings
  for (const [eventType, config] of Object.entries(defaultConfigs)) {
    notificationSettings.set(eventType as InternalNotificationEventType, {
      ...config,
      eventType: eventType as InternalNotificationEventType,
      updatedAt: new Date().toISOString(),
    });
  }
}

// Initialize on module load
initializeDefaultSettings();

// GET /api/notifications/internal/settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    console.log('[NotificationSettings] GET request');

    // Get specific event type if requested
    const eventType = searchParams.get('eventType') as InternalNotificationEventType | null;

    if (eventType) {
      console.log('[NotificationSettings] Fetching settings for event type:', eventType);

      let settings = notificationSettings.get(eventType);

      if (!settings) {
        // Initialize default if not found
        console.log('[NotificationSettings] Settings not found for', eventType, '- initializing defaults');
        const defaultConfig = getDefaultConfigForEventType(eventType);
        settings = {
          ...defaultConfig,
          eventType,
          updatedAt: new Date().toISOString(),
        };
        notificationSettings.set(eventType, settings);
      }

      return NextResponse.json({
        success: true,
        settings: {
          eventType: settings.eventType,
          enabled: settings.enabled,
          recipients: settings.recipients,
          includeDetails: settings.includeDetails,
          customMessage: settings.customMessage,
          updatedAt: settings.updatedAt,
          updatedBy: settings.updatedBy,
        },
      });
    }

    // Return all settings
    console.log('[NotificationSettings] Fetching all settings');
    const allSettings = Array.from(notificationSettings.values()).map(setting => ({
      eventType: setting.eventType,
      enabled: setting.enabled,
      recipients: setting.recipients,
      includeDetails: setting.includeDetails,
      customMessage: setting.customMessage,
      updatedAt: setting.updatedAt,
      updatedBy: setting.updatedBy,
    }));

    return NextResponse.json({
      success: true,
      settings: allSettings,
      total: allSettings.length,
    });
  } catch (error) {
    console.error('[NotificationSettings] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notification settings' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/internal/settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('[NotificationSettings] PUT request:', {
      eventType: body.eventType,
    });

    // Validate request
    let validated: NotificationSettingsRequest;
    try {
      validated = NotificationSettingsSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('[NotificationSettings] Validation error:', error.issues);
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid request data',
            details: error.issues,
          },
          { status: 400 }
        );
      }
      throw error;
    }

    const eventType = validated.eventType;

    // Get or create settings
    let settings = notificationSettings.get(eventType);
    if (!settings) {
      settings = {
        eventType,
        enabled: true,
        recipients: [],
        updatedAt: new Date().toISOString(),
      };
    }

    // Validate recipients
    if (validated.recipients.length === 0 && validated.enabled) {
      console.error('[NotificationSettings] Cannot enable notifications without recipients');
      return NextResponse.json(
        {
          success: false,
          error: 'At least one recipient email is required to enable notifications',
        },
        { status: 400 }
      );
    }

    // Update settings
    const previousSettings = { ...settings };
    settings.enabled = validated.enabled;
    settings.recipients = validated.recipients;
    settings.includeDetails = validated.includeDetails ?? settings.includeDetails ?? true;
    settings.customMessage = validated.customMessage ?? settings.customMessage;
    settings.updatedAt = new Date().toISOString();
    // In production: get actual user from auth context
    settings.updatedBy = 'system-admin';

    notificationSettings.set(eventType, settings);

    console.log('[NotificationSettings] Updated settings:', {
      eventType,
      enabled: settings.enabled,
      recipientCount: settings.recipients.length,
      previousRecipientCount: previousSettings.recipients.length,
    });

    // Log audit trail
    logAuditTrail({
      action: 'UPDATE_NOTIFICATION_SETTINGS',
      eventType,
      changes: {
        enabled: { from: previousSettings.enabled, to: settings.enabled },
        recipientCount: { from: previousSettings.recipients.length, to: settings.recipients.length },
        recipients: { from: previousSettings.recipients, to: settings.recipients },
      },
      timestamp: new Date().toISOString(),
      updatedBy: settings.updatedBy,
    });

    return NextResponse.json({
      success: true,
      message: `Settings updated for ${eventType}`,
      settings: {
        eventType: settings.eventType,
        enabled: settings.enabled,
        recipients: settings.recipients,
        includeDetails: settings.includeDetails,
        customMessage: settings.customMessage,
        updatedAt: settings.updatedAt,
        updatedBy: settings.updatedBy,
      },
    });
  } catch (error: any) {
    console.error('[NotificationSettings] PUT error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update notification settings',
      },
      { status: 500 }
    );
  }
}

/**
 * Get default configuration for event type
 */
function getDefaultConfigForEventType(eventType: InternalNotificationEventType): InternalNotificationConfig {
  const defaultRecipients = ['admin@medspa.com', 'notifications@medspa.com'];

  const defaults: Record<InternalNotificationEventType, InternalNotificationConfig> = {
    'appointment_booked': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'appointment_canceled': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'appointment_rescheduled': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'appointment_no_show': { enabled: true, recipients: [...defaultRecipients, 'managers@medspa.com'], includeDetails: true },
    'patient_checked_in': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'patient_late': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'form_submitted': { enabled: true, recipients: defaultRecipients, includeDetails: false },
    'waitlist_match': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'waitlist_patient_added': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'sale_closed': { enabled: true, recipients: [...defaultRecipients, 'sales@medspa.com'], includeDetails: true },
    'gift_card_purchased': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'membership_purchased': { enabled: true, recipients: [...defaultRecipients, 'sales@medspa.com'], includeDetails: true },
    'payment_received': { enabled: true, recipients: ['billing@medspa.com'], includeDetails: true },
    'payment_failed': { enabled: true, recipients: ['billing@medspa.com', 'managers@medspa.com'], includeDetails: true },
    'treatment_complete': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'inventory_low': { enabled: true, recipients: [...defaultRecipients, 'inventory@medspa.com'], includeDetails: true },
    'online_booking': { enabled: true, recipients: defaultRecipients, includeDetails: true },
    'express_booking': { enabled: true, recipients: defaultRecipients, includeDetails: true },
  };

  return defaults[eventType] || { enabled: false, recipients: [], includeDetails: false };
}

// Audit trail storage
interface AuditEntry {
  action: string;
  eventType?: InternalNotificationEventType;
  changes?: Record<string, any>;
  timestamp: string;
  updatedBy?: string;
}

const auditTrail: AuditEntry[] = [];

/**
 * Log settings changes to audit trail
 */
function logAuditTrail(entry: AuditEntry) {
  auditTrail.unshift(entry);

  console.log('[AuditTrail] Settings change logged:', {
    action: entry.action,
    eventType: entry.eventType,
    timestamp: entry.timestamp,
    updatedBy: entry.updatedBy,
  });

  // Keep audit trail manageable (max 500 entries)
  if (auditTrail.length > 500) {
    auditTrail.splice(500);
  }
}

