/**
 * Notifications API Routes
 *
 * Real-time notifications system for push notifications, preferences, and notification history:
 * - Push token registration (FCM/Expo)
 * - Notification preferences management
 * - Notification history (paginated)
 * - Mark notifications as read
 * - Admin notification sending
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sessionAuthMiddleware, requireRole } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { handlePrismaError } from '../middleware/prisma-error-handler';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { sendToDevice, sendToMultipleDevices, SafeNotifications } from '../services/fcm';
import { onNotificationCreated, onNotificationRead, onNotificationDeleted } from '../services/firestore-sync';

const notifications = new Hono();

// ===================
// Validation Schemas
// ===================

// Push platform enum
const pushPlatformSchema = z.enum(['ios', 'android', 'web', 'expo']);

// Notification type enum
const notificationTypeSchema = z.enum([
  'appointment_reminder',
  'appointment_confirmation',
  'appointment_cancelled',
  'appointment_rescheduled',
  'message_received',
  'treatment_followup',
  'billing_reminder',
  'payment_received',
  'membership_renewal',
  'marketing_promotion',
  'system_alert',
  'waitlist_offer',
  'form_required',
]);

// Notification channel enum
const notificationChannelSchema = z.enum(['push', 'email', 'sms', 'in_app']);

// Notification priority enum
const notificationPrioritySchema = z.enum(['low', 'normal', 'high', 'urgent']);

// Register push token schema
const registerTokenSchema = z.object({
  token: z.string().min(1).max(500),
  platform: pushPlatformSchema,
  deviceId: z.string().max(255).optional(),
});

// Unregister push token schema
const unregisterTokenSchema = z.object({
  token: z.string().min(1).max(500),
});

// Update preferences schema (PATCH - partial update)
const updatePreferencesSchema = z.object({
  // Email preferences
  appointmentReminders: z.boolean().optional(),
  appointmentChanges: z.boolean().optional(),
  messageNotifications: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
  treatmentReminders: z.boolean().optional(),
  billingAlerts: z.boolean().optional(),

  // Push preferences
  pushEnabled: z.boolean().optional(),
  pushAppointments: z.boolean().optional(),
  pushMessages: z.boolean().optional(),
  pushPromotions: z.boolean().optional(),

  // SMS preferences
  smsEnabled: z.boolean().optional(),
  smsAppointments: z.boolean().optional(),
  smsReminders: z.boolean().optional(),

  // Quiet hours
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  quietHoursEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  timezone: z.string().max(100).optional(),
});

// PUT preferences schema (simplified structure for full replacement)
// Maps simplified fields to the full schema:
// - appointmentReminders -> appointmentReminders
// - treatmentUpdates -> treatmentReminders
// - messageAlerts -> messageNotifications
// - promotionalMessages -> marketingEmails, pushPromotions
const putPreferencesSchema = z.object({
  // Core notification preferences
  appointmentReminders: z.boolean(),
  treatmentUpdates: z.boolean(),
  messageAlerts: z.boolean(),
  promotionalMessages: z.boolean(),

  // Quiet hours
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'quietHoursStart must be in HH:MM format (24-hour)')
    .nullable()
    .optional(),
  quietHoursEnd: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'quietHoursEnd must be in HH:MM format (24-hour)')
    .nullable()
    .optional(),
}).refine((data) => {
  // If quiet hours is enabled, both start and end must be provided
  if (data.quietHoursEnabled) {
    return data.quietHoursStart !== null && data.quietHoursStart !== undefined &&
           data.quietHoursEnd !== null && data.quietHoursEnd !== undefined;
  }
  return true;
}, {
  message: 'Both quietHoursStart and quietHoursEnd are required when quietHoursEnabled is true',
  path: ['quietHoursEnabled'],
});

// List notifications schema
const listNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  read: z.string().optional().transform(val => {
    if (val === undefined) return undefined;
    return val === 'true' || val === '1';
  }),
  type: notificationTypeSchema.optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Notification ID param schema
const notificationIdSchema = z.object({
  id: z.string().uuid(),
});

// Send notification schema (admin)
const sendNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: notificationTypeSchema,
  title: z.string().min(1).max(255),
  body: z.string().min(1).max(2000),
  data: z.record(z.unknown()).optional(),
  channel: notificationChannelSchema.default('push'),
  priority: notificationPrioritySchema.default('normal'),
  expiresAt: z.string().datetime().optional(),
});

// Bulk send notification schema (admin)
const bulkSendNotificationSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1).max(100),
  type: notificationTypeSchema,
  title: z.string().min(1).max(255),
  body: z.string().min(1).max(2000),
  data: z.record(z.unknown()).optional(),
  channel: notificationChannelSchema.default('push'),
  priority: notificationPrioritySchema.default('normal'),
  expiresAt: z.string().datetime().optional(),
});

// ===================
// Helper Functions
// ===================

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

/**
 * Send push notification via FCM
 * Uses the FCM service for actual push delivery
 */
async function sendPushNotification(
  token: string,
  platform: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
  notificationType?: string
): Promise<{ success: boolean; invalidToken?: boolean }> {
  // Get HIPAA-compliant message if available
  const safeMessage = getSafeNotificationMessage(notificationType);
  const safeTitle = safeMessage?.title || title;
  const safeBody = safeMessage?.body || body;

  // Convert data to string values for FCM (FCM data must be string values)
  const fcmData: Record<string, string> = {};
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      fcmData[key] = typeof value === 'string' ? value : JSON.stringify(value);
    });
  }
  // Add notification type for client-side handling
  fcmData.type = notificationType || 'general';

  const result = await sendToDevice(token, {
    notification: {
      title: safeTitle,
      body: safeBody,
    },
    data: fcmData,
    priority: 'high',
    ttl: 86400, // 24 hours
  });

  return {
    success: result.success,
    invalidToken: result.invalidToken,
  };
}

/**
 * Get HIPAA-compliant notification message based on type
 * These are safe to display on lock screens
 */
function getSafeNotificationMessage(type?: string): { title: string; body: string } | null {
  if (!type) return null;

  const safeMessages: Record<string, { title: string; body: string }> = {
    appointment_reminder: SafeNotifications.APPOINTMENT_REMINDER,
    appointment_confirmation: SafeNotifications.APPOINTMENT_CONFIRMED,
    appointment_cancelled: SafeNotifications.APPOINTMENT_CANCELLED,
    appointment_rescheduled: SafeNotifications.APPOINTMENT_RESCHEDULED,
    message_received: SafeNotifications.NEW_MESSAGE,
    treatment_followup: SafeNotifications.ACCOUNT_UPDATE,
    billing_reminder: SafeNotifications.PAYMENT_REMINDER,
    payment_received: SafeNotifications.PAYMENT_RECEIVED,
    form_required: SafeNotifications.FORMS_REQUIRED,
    waitlist_offer: {
      title: 'Appointment Available',
      body: 'An earlier appointment slot is now available. Open the app to book.',
    },
    system_alert: SafeNotifications.ACCOUNT_UPDATE,
  };

  return safeMessages[type] || null;
}

/**
 * Check if current time is within quiet hours
 */
function isWithinQuietHours(
  quietHoursStart: string | null,
  quietHoursEnd: string | null,
  timezone: string
): boolean {
  if (!quietHoursStart || !quietHoursEnd) return false;

  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const currentTime = formatter.format(now);
    const [currentHour, currentMinute] = currentTime.split(':').map(Number);
    const currentMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = quietHoursStart.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;

    const [endHour, endMinute] = quietHoursEnd.split(':').map(Number);
    const endMinutes = endHour * 60 + endMinute;

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } catch {
    return false;
  }
}

// ===================
// Middleware
// ===================

// All notification routes require session authentication
notifications.use('/*', sessionAuthMiddleware);

// ===================
// Push Token Routes
// ===================

/**
 * Register push notification token
 * POST /api/notifications/register-token
 */
notifications.post('/register-token', zValidator('json', registerTokenSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Upsert the push token
    // If token exists, update it; if deviceId exists for user, update that
    const existingToken = await prisma.pushToken.findFirst({
      where: {
        OR: [
          { token: data.token },
          data.deviceId ? { userId: user.uid, deviceId: data.deviceId } : {},
        ].filter(obj => Object.keys(obj).length > 0),
      },
    });

    let pushToken;
    if (existingToken) {
      pushToken = await prisma.pushToken.update({
        where: { id: existingToken.id },
        data: {
          token: data.token,
          platform: data.platform,
          deviceId: data.deviceId,
          isActive: true,
          updatedAt: new Date(),
        },
      });
    } else {
      pushToken = await prisma.pushToken.create({
        data: {
          userId: user.uid,
          token: data.token,
          platform: data.platform,
          deviceId: data.deviceId,
          isActive: true,
        },
      });
    }

    await logAuditEvent({
      userId: user.uid,
      action: existingToken ? 'UPDATE' : 'CREATE',
      resourceType: 'push_token',
      resourceId: pushToken.id,
      ipAddress,
      metadata: { platform: data.platform, deviceId: data.deviceId },
    });

    return c.json({
      success: true,
      message: 'Push token registered successfully',
      tokenId: pushToken.id,
    }, 201);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Unregister push notification token (logout)
 * DELETE /api/notifications/unregister
 */
notifications.delete('/unregister', async (c) => {
  const user = c.get('user');
  const ipAddress = getClientIP(c);
  const token = c.req.query('token');
  const deviceId = c.req.query('deviceId');

  if (!token && !deviceId) {
    throw APIError.badRequest('Either token or deviceId must be provided');
  }

  try {
    const where: Prisma.PushTokenWhereInput = {
      userId: user.uid,
    };

    if (token) {
      where.token = token;
    } else if (deviceId) {
      where.deviceId = deviceId;
    }

    // Deactivate matching tokens (soft delete)
    const result = await prisma.pushToken.updateMany({
      where,
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'DELETE',
      resourceType: 'push_token',
      ipAddress,
      metadata: { token: token?.substring(0, 20), deviceId, deactivatedCount: result.count },
    });

    return c.json({
      success: true,
      message: 'Push token unregistered successfully',
      deactivatedCount: result.count,
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Unregister push notification token (POST version)
 * POST /api/notifications/unregister
 *
 * Soft deletes (deactivates) an FCM token.
 * Users can only unregister their own tokens.
 */
notifications.post('/unregister', zValidator('json', unregisterTokenSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Find the token that belongs to the authenticated user
    const existingToken = await prisma.pushToken.findFirst({
      where: {
        token: data.token,
        userId: user.uid,
      },
    });

    // Handle token not found gracefully - still return success
    // This prevents information leakage and handles idempotent requests
    if (!existingToken) {
      await logAuditEvent({
        userId: user.uid,
        action: 'DELETE',
        resourceType: 'push_token',
        ipAddress,
        metadata: { token: data.token.substring(0, 20) + '...', result: 'not_found_or_not_owned' },
      });

      return c.json({
        success: true,
      });
    }

    // Soft delete: set isActive = false
    await prisma.pushToken.update({
      where: { id: existingToken.id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'DELETE',
      resourceType: 'push_token',
      resourceId: existingToken.id,
      ipAddress,
      metadata: { token: data.token.substring(0, 20) + '...', platform: existingToken.platform },
    });

    return c.json({
      success: true,
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

// ===================
// Preferences Routes
// ===================

// Default preferences for new users (simplified format)
const DEFAULT_PREFERENCES_SIMPLIFIED = {
  appointmentReminders: true,
  treatmentUpdates: true,
  messageAlerts: true,
  promotionalMessages: false,
  quietHoursEnabled: false,
  quietHoursStart: null as string | null,
  quietHoursEnd: null as string | null,
};

/**
 * Get user notification preferences
 * GET /api/notifications/preferences
 *
 * Query params:
 * - format: 'full' (default) | 'simplified'
 *   - full: Returns all preference fields from the database
 *   - simplified: Returns only core preference fields for easier client consumption
 */
notifications.get('/preferences', async (c) => {
  const user = c.get('user');
  const ipAddress = getClientIP(c);
  const format = c.req.query('format') || 'full';

  try {
    // Get existing preferences
    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId: user.uid },
    });

    // Handle new users - return defaults without creating a record
    // Record will be created on first PUT/PATCH
    if (!preferences) {
      await logAuditEvent({
        userId: user.uid,
        action: 'READ',
        resourceType: 'notification_preferences',
        ipAddress,
        metadata: { status: 'defaults_returned' },
      });

      // Return defaults in requested format
      if (format === 'simplified') {
        return c.json(DEFAULT_PREFERENCES_SIMPLIFIED);
      }

      // Return full defaults matching database schema
      return c.json({
        appointmentReminders: true,
        treatmentUpdates: true,
        messageAlerts: true,
        promotionalMessages: false,
        quietHoursEnabled: false,
        quietHoursStart: null,
        quietHoursEnd: null,
        // Additional full schema fields with defaults
        appointmentChanges: true,
        messageNotifications: true,
        marketingEmails: false,
        treatmentReminders: true,
        billingAlerts: true,
        pushEnabled: true,
        pushAppointments: true,
        pushMessages: true,
        pushPromotions: false,
        smsEnabled: true,
        smsAppointments: true,
        smsReminders: true,
        timezone: 'America/New_York',
      });
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'notification_preferences',
      resourceId: preferences.id,
      ipAddress,
    });

    // Return simplified format if requested
    if (format === 'simplified') {
      return c.json({
        appointmentReminders: preferences.appointmentReminders,
        treatmentUpdates: preferences.treatmentReminders,
        messageAlerts: preferences.messageNotifications,
        promotionalMessages: preferences.marketingEmails,
        quietHoursEnabled: preferences.quietHoursEnabled,
        quietHoursStart: preferences.quietHoursStart,
        quietHoursEnd: preferences.quietHoursEnd,
      });
    }

    // Return full preferences
    return c.json(preferences);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Update user notification preferences
 * PATCH /api/notifications/preferences
 */
notifications.patch('/preferences', zValidator('json', updatePreferencesSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Upsert preferences
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: user.uid },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        userId: user.uid,
        ...data,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'notification_preferences',
      resourceId: preferences.id,
      ipAddress,
      metadata: { updatedFields: Object.keys(data) },
    });

    return c.json({
      preferences,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Replace user notification preferences (simplified API)
 * PUT /api/notifications/preferences
 *
 * This endpoint provides a simplified interface for updating preferences,
 * mapping simplified field names to the full schema:
 * - appointmentReminders: Controls appointment reminder notifications
 * - treatmentUpdates: Controls treatment reminder/follow-up notifications
 * - messageAlerts: Controls message notification preferences
 * - promotionalMessages: Controls marketing/promotional notifications
 * - quietHoursEnabled: Whether quiet hours are active
 * - quietHoursStart: Start time in HH:MM format (24-hour)
 * - quietHoursEnd: End time in HH:MM format (24-hour)
 */
notifications.put('/preferences', zValidator('json', putPreferencesSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Map simplified fields to full schema fields
    const mappedData = {
      // Core preferences - map simplified names to full schema
      appointmentReminders: data.appointmentReminders,
      appointmentChanges: data.appointmentReminders, // Group with appointment reminders
      treatmentReminders: data.treatmentUpdates,
      messageNotifications: data.messageAlerts,
      marketingEmails: data.promotionalMessages,

      // Push preferences - derive from core settings
      pushEnabled: true, // Keep enabled, individual prefs control what's sent
      pushAppointments: data.appointmentReminders,
      pushMessages: data.messageAlerts,
      pushPromotions: data.promotionalMessages,

      // SMS preferences - derive from core settings
      smsEnabled: true,
      smsAppointments: data.appointmentReminders,
      smsReminders: data.appointmentReminders,

      // Billing alerts - default to enabled (transactional)
      billingAlerts: true,

      // Quiet hours
      quietHoursEnabled: data.quietHoursEnabled,
      quietHoursStart: data.quietHoursStart ?? null,
      quietHoursEnd: data.quietHoursEnd ?? null,
    };

    // Upsert preferences with mapped data
    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: user.uid },
      update: {
        ...mappedData,
        updatedAt: new Date(),
      },
      create: {
        userId: user.uid,
        ...mappedData,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'notification_preferences',
      resourceId: preferences.id,
      ipAddress,
      metadata: {
        method: 'PUT',
        inputFields: Object.keys(data),
        mappedFields: Object.keys(mappedData),
      },
    });

    return c.json({
      success: true,
      preferences,
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

// ===================
// Notification History Routes
// ===================

/**
 * List user notifications (paginated)
 * GET /api/notifications
 */
notifications.get('/', zValidator('query', listNotificationsSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Build where clause
    const where: Prisma.NotificationWhereInput = {
      userId: user.uid,
    };

    if (query.read !== undefined) {
      where.read = query.read;
    }

    if (query.type) {
      where.type = query.type;
    }

    // Exclude expired notifications
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } },
    ];

    // Get total count
    const total = await prisma.notification.count({ where });

    // Get paginated results
    const offset = (query.page - 1) * query.limit;
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: query.sortOrder },
      skip: offset,
      take: query.limit,
    });

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.uid,
        read: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'notification_list',
      ipAddress,
      metadata: { query, resultCount: notifications.length },
    });

    return c.json({
      items: notifications,
      total,
      unreadCount,
      page: query.page,
      limit: query.limit,
      hasMore: offset + query.limit < total,
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Mark notification as read
 * PATCH /api/notifications/:id/read
 */
notifications.patch('/:id/read', zValidator('param', notificationIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Find notification and verify ownership
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw APIError.notFound('Notification');
    }

    if (notification.userId !== user.uid) {
      throw APIError.forbidden('Cannot access this notification');
    }

    if (notification.read) {
      return c.json({
        notification,
        message: 'Notification was already marked as read',
      });
    }

    // Mark as read
    const updated = await prisma.notification.update({
      where: { id },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    // Sync to Firestore for real-time updates
    try {
      await onNotificationRead(user.uid, id);
    } catch (error) {
      console.error('Failed to sync notification read status to Firestore:', error);
      // Don't fail the request if Firestore sync fails
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'notification',
      resourceId: id,
      ipAddress,
      metadata: { action: 'mark_read' },
    });

    return c.json({
      notification: updated,
      message: 'Notification marked as read',
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    handlePrismaError(error);
  }
});

/**
 * Mark all notifications as read
 * POST /api/notifications/read-all
 */
notifications.post('/read-all', async (c) => {
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: user.uid,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'notification_batch',
      ipAddress,
      metadata: { action: 'mark_all_read', updatedCount: result.count },
    });

    return c.json({
      success: true,
      message: 'All notifications marked as read',
      updatedCount: result.count,
    });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
notifications.delete('/:id', zValidator('param', notificationIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Find notification and verify ownership
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw APIError.notFound('Notification');
    }

    if (notification.userId !== user.uid) {
      throw APIError.forbidden('Cannot delete this notification');
    }

    await prisma.notification.delete({
      where: { id },
    });

    // Sync to Firestore for real-time updates
    try {
      await onNotificationDeleted(user.uid, id);
    } catch (error) {
      console.error('Failed to sync notification deletion to Firestore:', error);
      // Don't fail the request if Firestore sync fails
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'DELETE',
      resourceType: 'notification',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    handlePrismaError(error);
  }
});

// ===================
// Admin Routes
// ===================

/**
 * Send notification to a user (admin only)
 * POST /api/notifications/send
 */
notifications.post(
  '/send',
  requireRole('admin', 'medical_director', 'office_manager'),
  zValidator('json', sendNotificationSchema),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    try {
      // Verify target user exists
      const targetUser = await prisma.user.findUnique({
        where: { id: data.userId },
        include: {
          notificationPreferences: true,
          pushTokens: {
            where: { isActive: true },
          },
        },
      });

      if (!targetUser) {
        throw APIError.notFound('User');
      }

      // Check user preferences
      const preferences = targetUser.notificationPreferences;
      const shouldSendPush = preferences?.pushEnabled !== false;
      const isQuietHours = preferences?.quietHoursEnabled &&
        isWithinQuietHours(
          preferences.quietHoursStart,
          preferences.quietHoursEnd,
          preferences.timezone
        );

      // Create notification record
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          body: data.body,
          data: data.data || {},
          channel: data.channel,
          priority: data.priority,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        },
      });

      // Sync to Firestore for real-time updates
      try {
        await onNotificationCreated(data.userId, {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          data: notification.data as Record<string, unknown> | undefined,
          createdAt: notification.createdAt,
        });
      } catch (error) {
        console.error('Failed to sync notification to Firestore:', error);
        // Don't fail the request if Firestore sync fails
      }

      // Send push notification if enabled and not in quiet hours (unless urgent)
      let pushSent = false;
      const invalidTokenIds: string[] = [];
      if (
        data.channel === 'push' &&
        shouldSendPush &&
        targetUser.pushTokens.length > 0 &&
        (!isQuietHours || data.priority === 'urgent')
      ) {
        for (const token of targetUser.pushTokens) {
          try {
            const result = await sendPushNotification(
              token.token,
              token.platform,
              data.title,
              data.body,
              data.data,
              data.type
            );

            if (result.invalidToken) {
              invalidTokenIds.push(token.id);
            } else if (result.success) {
              pushSent = true;
            }
          } catch (error) {
            console.error(`Failed to send push to token ${token.id}:`, error);
          }
        }
      }

      // Deactivate invalid tokens
      if (invalidTokenIds.length > 0) {
        await prisma.pushToken.updateMany({
          where: {
            id: { in: invalidTokenIds },
          },
          data: {
            isActive: false,
            updatedAt: new Date(),
          },
        });
      }

      await logAuditEvent({
        userId: user.uid,
        action: 'CREATE',
        resourceType: 'notification',
        resourceId: notification.id,
        ipAddress,
        metadata: {
          targetUserId: data.userId,
          type: data.type,
          channel: data.channel,
          pushSent,
          isQuietHours,
        },
      });

      return c.json({
        notification,
        pushSent,
        message: 'Notification sent successfully',
      }, 201);
    } catch (error) {
      if (error instanceof APIError) throw error;
      handlePrismaError(error);
    }
  }
);

/**
 * Send notification to multiple users (admin only)
 * POST /api/notifications/send-bulk
 */
notifications.post(
  '/send-bulk',
  requireRole('admin', 'medical_director', 'office_manager'),
  zValidator('json', bulkSendNotificationSchema),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    try {
      // Process each user
      for (const userId of data.userIds) {
        try {
          // Verify target user exists
          const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            include: {
              notificationPreferences: true,
              pushTokens: {
                where: { isActive: true },
              },
            },
          });

          if (!targetUser) {
            results.failed++;
            results.errors.push(`User ${userId} not found`);
            continue;
          }

          // Create notification record
          const notification = await prisma.notification.create({
            data: {
              userId,
              type: data.type,
              title: data.title,
              body: data.body,
              data: data.data || {},
              channel: data.channel,
              priority: data.priority,
              expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
            },
          });

          // Sync to Firestore for real-time updates
          try {
            await onNotificationCreated(userId, {
              id: notification.id,
              type: notification.type,
              title: notification.title,
              body: notification.body,
              data: notification.data as Record<string, unknown> | undefined,
              createdAt: notification.createdAt,
            });
          } catch (error) {
            console.error('Failed to sync notification to Firestore:', error);
            // Don't fail the request if Firestore sync fails
          }

          // Send push notification if applicable
          const preferences = targetUser.notificationPreferences;
          const shouldSendPush = preferences?.pushEnabled !== false;
          const isQuietHours = preferences?.quietHoursEnabled &&
            isWithinQuietHours(
              preferences.quietHoursStart,
              preferences.quietHoursEnd,
              preferences.timezone
            );

          const invalidTokenIds: string[] = [];
          if (
            data.channel === 'push' &&
            shouldSendPush &&
            targetUser.pushTokens.length > 0 &&
            (!isQuietHours || data.priority === 'urgent')
          ) {
            for (const token of targetUser.pushTokens) {
              try {
                const result = await sendPushNotification(
                  token.token,
                  token.platform,
                  data.title,
                  data.body,
                  data.data,
                  data.type
                );

                if (result.invalidToken) {
                  invalidTokenIds.push(token.id);
                }
              } catch (error) {
                console.error(`Failed to send push to token ${token.id}:`, error);
              }
            }

            // Deactivate invalid tokens
            if (invalidTokenIds.length > 0) {
              await prisma.pushToken.updateMany({
                where: {
                  id: { in: invalidTokenIds },
                },
                data: {
                  isActive: false,
                  updatedAt: new Date(),
                },
              });
            }
          }

          results.sent++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(`User ${userId}: ${error.message || 'Unknown error'}`);
        }
      }

      await logAuditEvent({
        userId: user.uid,
        action: 'CREATE',
        resourceType: 'notification_bulk',
        ipAddress,
        metadata: {
          type: data.type,
          channel: data.channel,
          totalUsers: data.userIds.length,
          sent: results.sent,
          failed: results.failed,
        },
      });

      return c.json({
        success: true,
        message: `Bulk notification complete: ${results.sent} sent, ${results.failed} failed`,
        results,
      }, 201);
    } catch (error) {
      if (error instanceof APIError) throw error;
      handlePrismaError(error);
    }
  }
);

/**
 * Get notification statistics (admin only)
 * GET /api/notifications/stats
 */
notifications.get(
  '/stats',
  requireRole('admin', 'medical_director', 'office_manager'),
  async (c) => {
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    try {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get various stats
      const [
        totalNotifications,
        unreadNotifications,
        last24HourCount,
        last7DaysCount,
        last30DaysCount,
        byType,
        byChannel,
        activeTokens,
      ] = await Promise.all([
        prisma.notification.count(),
        prisma.notification.count({ where: { read: false } }),
        prisma.notification.count({ where: { createdAt: { gte: last24Hours } } }),
        prisma.notification.count({ where: { createdAt: { gte: last7Days } } }),
        prisma.notification.count({ where: { createdAt: { gte: last30Days } } }),
        prisma.notification.groupBy({
          by: ['type'],
          _count: true,
          orderBy: { _count: { type: 'desc' } },
          take: 10,
        }),
        prisma.notification.groupBy({
          by: ['channel'],
          _count: true,
        }),
        prisma.pushToken.count({ where: { isActive: true } }),
      ]);

      await logAuditEvent({
        userId: user.uid,
        action: 'READ',
        resourceType: 'notification_stats',
        ipAddress,
      });

      return c.json({
        totalNotifications,
        unreadNotifications,
        readRate: totalNotifications > 0
          ? ((totalNotifications - unreadNotifications) / totalNotifications * 100).toFixed(2)
          : '0.00',
        last24Hours: last24HourCount,
        last7Days: last7DaysCount,
        last30Days: last30DaysCount,
        byType: byType.map(t => ({ type: t.type, count: t._count })),
        byChannel: byChannel.map(c => ({ channel: c.channel, count: c._count })),
        activePushTokens: activeTokens,
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
);

export default notifications;
