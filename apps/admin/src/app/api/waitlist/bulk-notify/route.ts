/**
 * POST /api/waitlist/bulk-notify - Send reminders to all active waitlist patients
 */

import { NextRequest, NextResponse } from 'next/server';
import moment from 'moment';
import {
  WaitlistPriority,
  WaitlistTier,
  DEFAULT_WAITLIST_SETTINGS,
  waitlistSmsTemplates,
} from '@/lib/waitlist';
import { services, practitioners } from '@/lib/data';
import { waitlistEntries } from '../store';

// Rate limiting tracking for bulk notifications
const bulkNotifyRateLimit: Map<string, { count: number; resetAt: Date }> = new Map();

// POST - Send bulk notifications to waitlist patients
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      minDaysWaiting,
      serviceCategory,
      practitionerId,
      priority,
      tier,
      maxNotifications = 50,
      messageType = 'reminder', // 'reminder', 'availability', 'custom'
      customMessage,
    } = body;

    // Rate limiting check
    const rateLimitKey = 'bulk-notify';
    const rateLimit = bulkNotifyRateLimit.get(rateLimitKey);
    const now = new Date();

    if (rateLimit && now < rateLimit.resetAt && rateLimit.count >= 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Maximum 3 bulk notifications per hour.',
          code: 'RATE_LIMIT_EXCEEDED',
          data: {
            resetAt: rateLimit.resetAt.toISOString(),
            remainingSeconds: Math.ceil((rateLimit.resetAt.getTime() - now.getTime()) / 1000),
          },
        },
        { status: 429 }
      );
    }

    // Reset rate limit if expired
    if (!rateLimit || now >= rateLimit.resetAt) {
      bulkNotifyRateLimit.set(rateLimitKey, { count: 0, resetAt: new Date(now.getTime() + 60 * 60 * 1000) });
    }

    // Validate practitioner if provided
    if (practitionerId) {
      const practitioner = practitioners.find(p => p.id === practitionerId);
      if (!practitioner) {
        return NextResponse.json(
          { success: false, error: 'Practitioner not found' },
          { status: 404 }
        );
      }
    }

    // Validate priority if provided
    if (priority) {
      const priorities = Array.isArray(priority) ? priority : [priority];
      const validPriorities: WaitlistPriority[] = ['low', 'medium', 'high'];
      for (const p of priorities) {
        if (!validPriorities.includes(p)) {
          return NextResponse.json(
            { success: false, error: `Invalid priority: ${p}. Must be one of: ${validPriorities.join(', ')}` },
            { status: 400 }
          );
        }
      }
    }

    // Validate tier if provided
    if (tier) {
      const tiers = Array.isArray(tier) ? tier : [tier];
      const validTiers: WaitlistTier[] = ['platinum', 'gold', 'silver'];
      for (const t of tiers) {
        if (!validTiers.includes(t)) {
          return NextResponse.json(
            { success: false, error: `Invalid tier: ${t}. Must be one of: ${validTiers.join(', ')}` },
            { status: 400 }
          );
        }
      }
    }

    // Validate max notifications
    if (maxNotifications > 100) {
      return NextResponse.json(
        { success: false, error: 'maxNotifications cannot exceed 100' },
        { status: 400 }
      );
    }

    // Filter eligible entries
    let eligibleEntries = waitlistEntries.filter(e => e.status === 'active');

    // Apply filters
    if (minDaysWaiting !== undefined) {
      const minDate = moment().subtract(minDaysWaiting, 'days').toDate();
      eligibleEntries = eligibleEntries.filter(e => new Date(e.waitingSince) <= minDate);
    }

    if (serviceCategory) {
      eligibleEntries = eligibleEntries.filter(e => e.serviceCategory === serviceCategory);
    }

    if (practitionerId) {
      eligibleEntries = eligibleEntries.filter(e => e.practitionerId === practitionerId);
    }

    if (priority) {
      const priorities = Array.isArray(priority) ? priority : [priority];
      eligibleEntries = eligibleEntries.filter(e => priorities.includes(e.priority));
    }

    if (tier) {
      const tiers = Array.isArray(tier) ? tier : [tier];
      eligibleEntries = eligibleEntries.filter(e => tiers.includes(e.tier));
    }

    // Limit notifications
    eligibleEntries = eligibleEntries.slice(0, maxNotifications);

    // Build notification message based on type
    const notifications = eligibleEntries.map(entry => {
      const daysWaiting = moment().diff(moment(entry.waitingSince), 'days');

      let message: string;
      switch (messageType) {
        case 'availability':
          message = 'New appointment slots are available! Reply or call to book.';
          break;
        case 'custom':
          message = customMessage || 'You are on our waitlist. We will contact you when a slot opens.';
          break;
        case 'reminder':
        default:
          message = waitlistSmsTemplates.waitlistReminder(entry.name, entry.requestedService, daysWaiting);
      }

      // Update entry tracking
      entry.lastOfferAt = now;

      return {
        entryId: entry.id,
        patientId: entry.id,
        patientName: entry.name,
        phone: entry.phone,
        email: entry.email,
        tier: entry.tier,
        priority: entry.priority,
        daysWaiting,
        channel: DEFAULT_WAITLIST_SETTINGS.smsEnabled && DEFAULT_WAITLIST_SETTINGS.emailEnabled
          ? 'both'
          : DEFAULT_WAITLIST_SETTINGS.smsEnabled ? 'sms' : 'email',
        sentAt: now.toISOString(),
        message,
      };
    });

    // Update rate limit
    const currentLimit = bulkNotifyRateLimit.get(rateLimitKey)!;
    currentLimit.count++;

    // Calculate statistics about who was notified
    const stats = {
      byPriority: {
        high: notifications.filter(n => eligibleEntries.find(e => e.id === n.entryId)?.priority === 'high').length,
        medium: notifications.filter(n => eligibleEntries.find(e => e.id === n.entryId)?.priority === 'medium').length,
        low: notifications.filter(n => eligibleEntries.find(e => e.id === n.entryId)?.priority === 'low').length,
      },
      byTier: {
        platinum: notifications.filter(n => eligibleEntries.find(e => e.id === n.entryId)?.tier === 'platinum').length,
        gold: notifications.filter(n => eligibleEntries.find(e => e.id === n.entryId)?.tier === 'gold').length,
        silver: notifications.filter(n => eligibleEntries.find(e => e.id === n.entryId)?.tier === 'silver').length,
      },
      byChannel: {
        sms: notifications.filter(n => n.channel === 'sms' || n.channel === 'both').length,
        email: notifications.filter(n => n.channel === 'email' || n.channel === 'both').length,
      },
      averageDaysWaiting: notifications.length > 0
        ? Math.round(notifications.reduce((sum, n) => sum + n.daysWaiting, 0) / notifications.length)
        : 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        sentCount: notifications.length,
        messageType,
        notifications,
        statistics: stats,
        filters: {
          minDaysWaiting,
          serviceCategory,
          practitionerId,
          priority,
          tier,
          maxNotifications,
        },
        rateLimit: {
          remaining: 3 - currentLimit.count,
          resetAt: currentLimit.resetAt.toISOString(),
        },
      },
      message: `Successfully sent ${notifications.length} notification(s)`,
    });
  } catch (error) {
    console.error('Waitlist bulk-notify POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send bulk notifications' },
      { status: 500 }
    );
  }
}
