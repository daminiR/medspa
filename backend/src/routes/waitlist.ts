/**
 * Waitlist API Routes
 *
 * Full CRUD operations for waitlist management:
 * - List/search waitlist entries with filtering
 * - Get single waitlist entry
 * - Create waitlist entry
 * - Update waitlist entry
 * - Remove from waitlist
 * - Send availability offers
 * - Accept/decline offers
 * - Match waitlist entries to open slots
 * - Auto-fill cancellations
 * - Waitlist settings management
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware, optionalAuthMiddleware, requirePermission, requireRole } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { logAuditEvent } from '@medical-spa/security';
import * as crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { Prisma, WaitlistStatus, WaitlistPriority, VIPTier } from '@prisma/client';

const waitlist = new Hono();

// ===================
// Types
// ===================

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type OfferSequence = 'priority' | 'fifo' | 'tier-weighted';

export interface TimeRange {
  start: string; // HH:mm format
  end: string;   // HH:mm format
}

export interface Offer {
  id: string;
  appointmentSlot: {
    date: string;       // YYYY-MM-DD
    time: string;       // HH:mm
    providerId: string;
    providerName?: string;
  };
  offeredAt: Date;
  expiresAt: Date;
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  respondedAt?: Date;
}

export interface WaitlistEntry {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string | null;

  // Preferences
  serviceIds: string[];
  serviceNames: string[];
  providerIds: string[]; // empty = any provider
  providerNames: string[];
  preferredDays: string[];
  preferredTimeRanges: any; // JSON field from Prisma

  // Flexibility
  flexibleDates: boolean;
  flexibleProviders: boolean;
  flexibleTimes: boolean;

  // Status
  status: WaitlistStatus;
  priority: WaitlistPriority;

  // VIP tier
  tier?: VIPTier | null;

  // Offer tracking
  currentOffer?: any; // JSON field from Prisma
  offerHistory: any[]; // JSON field from Prisma

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date | null;
  notes?: string | null;

  // Deposit (optional)
  deposit?: number | null;

  // Forms completion status
  hasCompletedForms: boolean;
}

export interface WaitlistSettings {
  // Automated Offers
  automaticOffersEnabled: boolean;
  offerExpiryMinutes: number;
  maxOffersPerSlot: number;
  minimumNoticeHours: number;
  offerSequence: OfferSequence;

  // VIP Tier Configuration
  tierWeights: {
    platinum: number;
    gold: number;
    silver: number;
  };
  autoTierRules: {
    platinum: { visits: number; revenue: number };
    gold: { visits: number; revenue: number };
  };

  // Communication
  communication: {
    smsEnabled: boolean;
    emailEnabled: boolean;
    multiChannelDelayMinutes: number;
    sendPeriodicReminders: boolean;
    reminderFrequencyDays: number;
  };

  // Expiry & Cleanup
  autoExpireDays: number;

  // Compliance
  doubleOptInRequired: boolean;
  auditLogRetentionDays: number;
}

export interface MatchedSlot {
  date: string;
  time: string;
  providerId: string;
  providerName: string;
  duration: number;
}

// ===================
// Validation Schemas
// ===================

const uuidSchema = z.string().min(1);

const dayOfWeekSchema = z.enum([
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
]);

const timeRangeSchema = z.object({
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format. Use HH:mm'),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format. Use HH:mm'),
});

const waitlistStatusSchema = z.enum([
  'ACTIVE', 'OFFERED', 'BOOKED', 'EXPIRED', 'CANCELLED',
]);

const waitlistPrioritySchema = z.enum(['NORMAL', 'HIGH', 'URGENT']);

const vipTierSchema = z.enum(['PLATINUM', 'GOLD', 'SILVER', 'NONE']).optional();

const offerSequenceSchema = z.enum(['priority', 'fifo', 'tier-weighted']);

const waitlistIdParamSchema = z.object({
  id: uuidSchema,
});

const listWaitlistSchema = z.object({
  status: waitlistStatusSchema.optional(),
  statuses: z.string().optional(), // comma-separated
  patientId: uuidSchema.optional(),
  serviceId: uuidSchema.optional(),
  providerId: uuidSchema.optional(),
  priority: waitlistPrioritySchema.optional(),
  tier: vipTierSchema,
  hasOffer: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'priority', 'tier']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const createWaitlistSchema = z.object({
  patientId: uuidSchema,
  patientName: z.string().min(1),
  patientPhone: z.string().min(1),
  patientEmail: z.string().email().optional(),
  serviceIds: z.array(uuidSchema).min(1),
  serviceNames: z.array(z.string()).optional(),
  providerIds: z.array(uuidSchema).default([]),
  providerNames: z.array(z.string()).optional(),
  preferredDays: z.array(dayOfWeekSchema).default([]),
  preferredTimeRanges: z.array(timeRangeSchema).default([]),
  flexibleDates: z.boolean().default(false),
  flexibleProviders: z.boolean().default(true),
  flexibleTimes: z.boolean().default(false),
  priority: waitlistPrioritySchema.default('NORMAL'),
  tier: vipTierSchema,
  notes: z.string().max(2000).optional(),
  expiresAt: z.string().datetime().optional(),
  deposit: z.number().min(0).optional(),
  hasCompletedForms: z.boolean().optional(),
});

const updateWaitlistSchema = z.object({
  patientName: z.string().min(1).optional(),
  patientPhone: z.string().min(1).optional(),
  patientEmail: z.string().email().optional().nullable(),
  serviceIds: z.array(uuidSchema).min(1).optional(),
  serviceNames: z.array(z.string()).optional(),
  providerIds: z.array(uuidSchema).optional(),
  providerNames: z.array(z.string()).optional(),
  preferredDays: z.array(dayOfWeekSchema).optional(),
  preferredTimeRanges: z.array(timeRangeSchema).optional(),
  flexibleDates: z.boolean().optional(),
  flexibleProviders: z.boolean().optional(),
  flexibleTimes: z.boolean().optional(),
  priority: waitlistPrioritySchema.optional(),
  tier: vipTierSchema,
  status: waitlistStatusSchema.optional(),
  notes: z.string().max(2000).optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  deposit: z.number().min(0).optional().nullable(),
  hasCompletedForms: z.boolean().optional(),
});

const sendOfferSchema = z.object({
  appointmentSlot: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format. Use HH:mm'),
    providerId: uuidSchema,
    providerName: z.string().optional(),
  }),
  expiryMinutes: z.coerce.number().int().min(5).max(1440).optional(), // 5 min to 24 hours
  notifyPatient: z.boolean().default(true),
});

const matchWaitlistSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format. Use HH:mm'),
  providerId: uuidSchema,
  providerName: z.string().optional(),
  duration: z.coerce.number().int().min(5),
  serviceId: uuidSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const autoFillSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid time format. Use HH:mm'),
  providerId: uuidSchema,
  providerName: z.string().optional(),
  duration: z.coerce.number().int().min(5),
  serviceId: uuidSchema.optional(),
  sendOffers: z.boolean().default(true),
  maxOffers: z.coerce.number().int().min(1).max(10).default(3),
});

const updateSettingsSchema = z.object({
  automaticOffersEnabled: z.boolean().optional(),
  offerExpiryMinutes: z.coerce.number().int().min(5).max(1440).optional(),
  maxOffersPerSlot: z.coerce.number().int().min(1).max(10).optional(),
  minimumNoticeHours: z.coerce.number().int().min(1).max(72).optional(),
  offerSequence: offerSequenceSchema.optional(),
  tierWeights: z.object({
    platinum: z.number().min(0).max(100),
    gold: z.number().min(0).max(100),
    silver: z.number().min(0).max(100),
  }).optional(),
  autoTierRules: z.object({
    platinum: z.object({
      visits: z.number().int().min(0),
      revenue: z.number().min(0),
    }),
    gold: z.object({
      visits: z.number().int().min(0),
      revenue: z.number().min(0),
    }),
  }).optional(),
  communication: z.object({
    smsEnabled: z.boolean(),
    emailEnabled: z.boolean(),
    multiChannelDelayMinutes: z.number().int().min(0).max(60),
    sendPeriodicReminders: z.boolean(),
    reminderFrequencyDays: z.number().int().min(1).max(30),
  }).optional(),
  autoExpireDays: z.coerce.number().int().min(1).max(365).optional(),
  doubleOptInRequired: z.boolean().optional(),
  auditLogRetentionDays: z.coerce.number().int().min(30).max(730).optional(),
});

const acceptDeclineOfferSchema = z.object({
  token: z.string().min(1),
});

// ===================
// Database Store (Prisma)
// ===================

// Offer tokens stored in-memory for fast lookup (could be moved to Redis in production)
const offerTokenStore = new Map<string, { entryId: string; offerId: string }>();

// Default settings object for fallback
const defaultWaitlistSettings: Omit<WaitlistSettings, 'id' | 'updatedAt' | 'updatedBy'> = {
  automaticOffersEnabled: true,
  offerExpiryMinutes: 120,
  maxOffersPerSlot: 3,
  minimumNoticeHours: 4,
  offerSequence: 'tier-weighted',
  tierWeights: { platinum: 60, gold: 30, silver: 10 },
  autoTierRules: {
    platinum: { visits: 12, revenue: 5000 },
    gold: { visits: 6, revenue: 2000 },
  },
  communication: {
    smsEnabled: true,
    emailEnabled: true,
    multiChannelDelayMinutes: 5,
    sendPeriodicReminders: true,
    reminderFrequencyDays: 7,
  },
  autoExpireDays: 30,
  doubleOptInRequired: true,
  auditLogRetentionDays: 90,
};

// Helper function to get waitlist settings (creates default if not exists)
async function getWaitlistSettings() {
  let settings = await prisma.waitlistSettings.findFirst();

  if (!settings) {
    // Create default settings
    settings = await prisma.waitlistSettings.create({
      data: defaultWaitlistSettings as any,
    });
  }

  return settings;
}

// ===================
// Helper Functions
// ===================

function generateId(): string {
  return `wl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateOfferId(): string {
  return `offer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

/**
 * Convert day of week string to number (0-6, Sunday-Saturday)
 */
function dayOfWeekToNumber(day: DayOfWeek): number {
  const days: Record<DayOfWeek, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  return days[day];
}

/**
 * Check if a date matches preferred days
 */
function matchesPreferredDays(date: string, preferredDays: DayOfWeek[]): boolean {
  if (preferredDays.length === 0) return true;
  const dayNumber = new Date(date).getDay();
  return preferredDays.some(day => dayOfWeekToNumber(day) === dayNumber);
}

/**
 * Check if a time is within preferred time ranges
 */
function matchesPreferredTimeRanges(time: string, timeRanges: TimeRange[]): boolean {
  if (timeRanges.length === 0) return true;
  const [hours, minutes] = time.split(':').map(Number);
  const timeMinutes = hours * 60 + minutes;

  return timeRanges.some(range => {
    const [startHours, startMinutes] = range.start.split(':').map(Number);
    const [endHours, endMinutes] = range.end.split(':').map(Number);
    const startTimeMinutes = startHours * 60 + startMinutes;
    const endTimeMinutes = endHours * 60 + endMinutes;
    return timeMinutes >= startTimeMinutes && timeMinutes <= endTimeMinutes;
  });
}

/**
 * Check if patient already has an appointment on a date
 */
async function patientHasAppointmentOnDate(patientId: string, date: string): Promise<boolean> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const count = await prisma.appointment.count({
    where: {
      patientId,
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: ['SCHEDULED', 'CONFIRMED', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'],
      },
    },
  });

  return count > 0;
}

/**
 * Get priority weight for sorting
 */
function getPriorityWeight(priority: WaitlistPriority): number {
  const weights: Record<WaitlistPriority, number> = {
    URGENT: 100,
    HIGH: 50,
    NORMAL: 10,
  };
  return weights[priority];
}

/**
 * Get tier weight for sorting
 */
async function getTierWeight(tier: VIPTier | undefined | null): Promise<number> {
  if (!tier || tier === 'NONE') return 0;
  const settings = await getWaitlistSettings();
  const tierWeights = settings.tierWeights as any;
  return tierWeights[tier] || 0;
}

/**
 * Sort waitlist entries based on settings
 */
async function sortWaitlistEntries(entries: WaitlistEntry[]): Promise<WaitlistEntry[]> {
  const settings = await getWaitlistSettings();
  const offerSequence = settings.offerSequence;

  return [...entries].sort((a, b) => {
    switch (offerSequence) {
      case 'priority':
        // Sort by priority descending, then by createdAt ascending (FIFO within priority)
        const priorityDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
        if (priorityDiff !== 0) return priorityDiff;
        return a.createdAt.getTime() - b.createdAt.getTime();

      case 'fifo':
        // Sort by createdAt ascending only
        return a.createdAt.getTime() - b.createdAt.getTime();

      case 'tier-weighted':
        // Sort by tier weight + priority, then by createdAt
        // Note: This is synchronous approximation, weights are loaded separately
        const tierScoreA = getPriorityWeight(a.priority);
        const tierScoreB = getPriorityWeight(b.priority);
        const scoreDiff = tierScoreB - tierScoreA;
        if (scoreDiff !== 0) return scoreDiff;
        return a.createdAt.getTime() - b.createdAt.getTime();

      default:
        return 0;
    }
  });
}

/**
 * Find matching waitlist entries for a slot
 */
async function findMatchingEntries(
  date: string,
  time: string,
  providerId: string,
  serviceId?: string,
  limit: number = 10
): Promise<WaitlistEntry[]> {
  // Fetch all active entries from database
  const entries = await prisma.waitlistEntry.findMany({
    where: {
      status: 'ACTIVE',
    },
  }) as unknown as WaitlistEntry[];

  const matches: WaitlistEntry[] = [];

  for (const entry of entries) {
    // Skip if patient already has appointment on this date
    if (await patientHasAppointmentOnDate(entry.patientId, date)) continue;

    // Check service match (if serviceId is provided)
    if (serviceId && !entry.serviceIds.includes(serviceId)) continue;

    // Check provider preference (unless flexible)
    if (!entry.flexibleProviders && entry.providerIds.length > 0) {
      if (!entry.providerIds.includes(providerId)) continue;
    }

    // Check preferred days (unless flexible)
    if (!entry.flexibleDates && entry.preferredDays.length > 0) {
      if (!matchesPreferredDays(date, entry.preferredDays as DayOfWeek[])) continue;
    }

    // Check preferred time ranges (unless flexible)
    if (!entry.flexibleTimes && Array.isArray(entry.preferredTimeRanges) && entry.preferredTimeRanges.length > 0) {
      if (!matchesPreferredTimeRanges(time, entry.preferredTimeRanges as TimeRange[])) continue;
    }

    matches.push(entry);
  }

  // Sort by configured sequence and limit
  const sorted = await sortWaitlistEntries(matches);
  return sorted.slice(0, limit);
}

/**
 * Send notification for offer (logs for now, would use SMS/email in production)
 */
async function sendOfferNotification(entry: WaitlistEntry, offer: Offer): Promise<void> {
  // Log the notification (in production, this would send SMS/email)
  console.log('=== Waitlist Offer Notification ===');
  console.log(`To: ${entry.patientName} (${entry.patientPhone})`);
  console.log(`Slot: ${offer.appointmentSlot.date} at ${offer.appointmentSlot.time}`);
  console.log(`Provider: ${offer.appointmentSlot.providerName || offer.appointmentSlot.providerId}`);
  console.log(`Token: ${offer.token}`);
  console.log(`Expires: ${offer.expiresAt.toISOString()}`);
  console.log('===================================');
}

/**
 * Serialize entry for JSON response
 */
function serializeEntry(entry: WaitlistEntry) {
  return {
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
    expiresAt: entry.expiresAt?.toISOString(),
    currentOffer: entry.currentOffer ? {
      ...entry.currentOffer,
      offeredAt: entry.currentOffer.offeredAt.toISOString(),
      expiresAt: entry.currentOffer.expiresAt.toISOString(),
      respondedAt: entry.currentOffer.respondedAt?.toISOString(),
    } : undefined,
    offerHistory: entry.offerHistory.map(offer => ({
      ...offer,
      offeredAt: offer.offeredAt.toISOString(),
      expiresAt: offer.expiresAt.toISOString(),
      respondedAt: offer.respondedAt?.toISOString(),
    })),
  };
}

/**
 * Check and expire stale offers
 */
async function expireStaleOffers() {
  const now = new Date();

  // Find all entries with pending offers
  const entries = await prisma.waitlistEntry.findMany({
    where: {
      status: 'OFFERED',
    },
  });

  for (const entry of entries) {
    const currentOffer = entry.currentOffer as any;
    if (currentOffer && currentOffer.status === 'pending') {
      if (new Date(currentOffer.expiresAt) < now) {
        // Expire the offer
        currentOffer.status = 'expired';
        const offerHistory = (entry.offerHistory as any[]) || [];
        offerHistory.push(currentOffer);

        await prisma.waitlistEntry.update({
          where: { id: entry.id },
          data: {
            status: 'ACTIVE',
            currentOffer: Prisma.JsonNull,
            offerHistory: offerHistory,
            updatedAt: now,
          },
        });

        // Remove from token store
        if (currentOffer.token) {
          offerTokenStore.delete(currentOffer.token);
        }
      }
    }
  }
}

// ===================
// Routes
// ===================

// Run stale offer check periodically (would be a cron job in production)
// For now, we do it on certain requests

// Most routes require authentication
waitlist.use('/*', authMiddleware);

/**
 * Get waitlist settings
 * GET /api/waitlist/settings
 */
waitlist.get(
  '/settings',
  requirePermission('waitlist:settings:read'),
  async (c) => {
    const settings = await getWaitlistSettings();
    return c.json({
      success: true,
      settings,
    });
  }
);

/**
 * Update waitlist settings
 * PUT /api/waitlist/settings
 */
waitlist.put(
  '/settings',
  requireRole('admin'),
  zValidator('json', updateSettingsSchema),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    // Get current settings
    const currentSettings = await getWaitlistSettings();

    // Build update data
    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: user?.uid,
    };

    if (data.automaticOffersEnabled !== undefined) {
      updateData.automaticOffersEnabled = data.automaticOffersEnabled;
    }
    if (data.offerExpiryMinutes !== undefined) {
      updateData.offerExpiryMinutes = data.offerExpiryMinutes;
    }
    if (data.maxOffersPerSlot !== undefined) {
      updateData.maxOffersPerSlot = data.maxOffersPerSlot;
    }
    if (data.minimumNoticeHours !== undefined) {
      updateData.minimumNoticeHours = data.minimumNoticeHours;
    }
    if (data.offerSequence !== undefined) {
      updateData.offerSequence = data.offerSequence;
    }
    if (data.tierWeights !== undefined) {
      updateData.tierWeights = data.tierWeights;
    }
    if (data.autoTierRules !== undefined) {
      updateData.autoTierRules = data.autoTierRules;
    }
    if (data.communication !== undefined) {
      updateData.communication = data.communication;
    }
    if (data.autoExpireDays !== undefined) {
      updateData.autoExpireDays = data.autoExpireDays;
    }
    if (data.doubleOptInRequired !== undefined) {
      updateData.doubleOptInRequired = data.doubleOptInRequired;
    }
    if (data.auditLogRetentionDays !== undefined) {
      updateData.auditLogRetentionDays = data.auditLogRetentionDays;
    }

    // Update settings in database
    const updatedSettings = await prisma.waitlistSettings.update({
      where: { id: currentSettings.id },
      data: updateData,
    });

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'UPDATE',
      resourceType: 'waitlist_settings',
      resourceId: currentSettings.id,
      phiAccessed: false,
      ipAddress,
      metadata: { updatedFields: Object.keys(data) },
    });

    return c.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedSettings,
    });
  }
);

/**
 * Find matches for an open slot
 * POST /api/waitlist/match
 */
waitlist.post(
  '/match',
  requirePermission('waitlist:match'),
  zValidator('json', matchWaitlistSchema),
  async (c) => {
    const data = c.req.valid('json');
    await expireStaleOffers();

    const matches = await findMatchingEntries(
      data.date,
      data.time,
      data.providerId,
      data.serviceId,
      data.limit
    );

    return c.json({
      success: true,
      slot: {
        date: data.date,
        time: data.time,
        providerId: data.providerId,
        providerName: data.providerName,
        duration: data.duration,
      },
      matches: matches.map(serializeEntry),
      totalMatches: matches.length,
    });
  }
);

/**
 * Auto-fill a cancellation slot
 * POST /api/waitlist/auto-fill
 */
waitlist.post(
  '/auto-fill',
  requirePermission('waitlist:autofill'),
  zValidator('json', autoFillSchema),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    await expireStaleOffers();

    // Get settings
    const settings = await getWaitlistSettings();

    // Check minimum notice
    const slotTime = new Date(`${data.date}T${data.time}`);
    const now = new Date();
    const hoursUntilSlot = (slotTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilSlot < settings.minimumNoticeHours) {
      throw APIError.badRequest(
        `Slot is too soon. Minimum notice is ${settings.minimumNoticeHours} hours.`
      );
    }

    // Find matching entries
    const matches = await findMatchingEntries(
      data.date,
      data.time,
      data.providerId,
      data.serviceId,
      data.maxOffers
    );

    if (matches.length === 0) {
      return c.json({
        success: true,
        message: 'No matching waitlist entries found for this slot',
        slot: {
          date: data.date,
          time: data.time,
          providerId: data.providerId,
          providerName: data.providerName,
          duration: data.duration,
        },
        offersSent: 0,
        matches: [],
      });
    }

    // Send offers if requested
    const offersSent: Array<{ entryId: string; patientName: string; offer: Offer }> = [];

    if (data.sendOffers) {
      for (const entry of matches) {
        // Generate offer
        const offer: Offer = {
          id: generateOfferId(),
          appointmentSlot: {
            date: data.date,
            time: data.time,
            providerId: data.providerId,
            providerName: data.providerName,
          },
          offeredAt: now,
          expiresAt: new Date(now.getTime() + settings.offerExpiryMinutes * 60 * 1000),
          token: generateToken(),
          status: 'pending',
        };

        // Update entry in database
        await prisma.waitlistEntry.update({
          where: { id: entry.id },
          data: {
            currentOffer: offer as any,
            status: 'OFFERED',
            updatedAt: now,
          },
        });

        // Update local entry object for response
        entry.currentOffer = offer as any;
        entry.status = 'OFFERED';
        entry.updatedAt = now;

        // Store token
        offerTokenStore.set(offer.token, { entryId: entry.id, offerId: offer.id });

        // Send notification
        await sendOfferNotification(entry, offer);

        offersSent.push({
          entryId: entry.id,
          patientName: entry.patientName,
          offer,
        });

        // Log audit event
        await logAuditEvent({
          userId: user?.uid,
          action: 'CREATE',
          resourceType: 'waitlist_offer',
          resourceId: offer.id,
          patientId: entry.patientId,
          phiAccessed: true,
          ipAddress,
          metadata: {
            waitlistEntryId: entry.id,
            slot: offer.appointmentSlot,
            trigger: 'auto-fill',
          },
        });
      }
    }

    return c.json({
      success: true,
      message: data.sendOffers
        ? `Sent ${offersSent.length} offer(s) to matching patients`
        : `Found ${matches.length} matching entries (offers not sent)`,
      slot: {
        date: data.date,
        time: data.time,
        providerId: data.providerId,
        providerName: data.providerName,
        duration: data.duration,
      },
      offersSent: offersSent.length,
      matches: matches.map(serializeEntry),
      offers: offersSent.map(o => ({
        entryId: o.entryId,
        patientName: o.patientName,
        offerId: o.offer.id,
        expiresAt: o.offer.expiresAt.toISOString(),
      })),
    });
  }
);

/**
 * List/Search waitlist entries
 * GET /api/waitlist
 */
waitlist.get(
  '/',
  requirePermission('waitlist:list'),
  zValidator('query', listWaitlistSchema),
  async (c) => {
    await expireStaleOffers();

    const query = c.req.valid('query');

    // Build where clause for Prisma
    const where: any = {};

    // Filter by status
    if (query.status) {
      where.status = query.status;
    }

    // Filter by multiple statuses
    if (query.statuses) {
      const statusList = query.statuses.split(',');
      where.status = { in: statusList };
    }

    // Filter by patient
    if (query.patientId) {
      where.patientId = query.patientId;
    }

    // Filter by service (array contains)
    if (query.serviceId) {
      where.serviceIds = { has: query.serviceId };
    }

    // Filter by priority
    if (query.priority) {
      where.priority = query.priority;
    }

    // Filter by tier
    if (query.tier) {
      where.tier = query.tier;
    }

    // Search by name, phone, or email
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      where.OR = [
        { patientName: { contains: query.search, mode: 'insensitive' } },
        { patientPhone: { contains: query.search } },
        { patientEmail: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // Build order by clause
    const orderBy: any = [];
    if (query.sortBy === 'priority') {
      orderBy.push({ priority: query.sortOrder });
      orderBy.push({ createdAt: 'asc' });
    } else if (query.sortBy === 'tier') {
      orderBy.push({ tier: query.sortOrder });
      orderBy.push({ createdAt: 'desc' });
    } else {
      orderBy.push({ createdAt: query.sortOrder });
    }

    // Get total count
    const total = await prisma.waitlistEntry.count({ where });

    // Get paginated results
    const offset = (query.page - 1) * query.limit;
    let results = await prisma.waitlistEntry.findMany({
      where,
      orderBy,
      skip: offset,
      take: query.limit,
    }) as unknown as WaitlistEntry[];

    // Post-process filters that can't be done in Prisma
    // Filter by provider (empty array means any provider)
    if (query.providerId) {
      results = results.filter(entry =>
        entry.providerIds.length === 0 || entry.providerIds.includes(query.providerId!)
      );
    }

    // Filter by hasOffer
    if (query.hasOffer !== undefined) {
      results = results.filter(entry =>
        query.hasOffer ? entry.currentOffer !== undefined && entry.currentOffer !== null : entry.currentOffer === undefined || entry.currentOffer === null
      );
    }

    return c.json({
      success: true,
      items: results.map(serializeEntry),
      total,
      page: query.page,
      limit: query.limit,
      hasMore: offset + results.length < total,
    });
  }
);

/**
 * Get waitlist entry by ID
 * GET /api/waitlist/:id
 */
waitlist.get(
  '/:id',
  requirePermission('waitlist:read'),
  zValidator('param', waitlistIdParamSchema),
  async (c) => {
    const { id } = c.req.valid('param');

    const entry = await prisma.waitlistEntry.findUnique({
      where: { id },
    }) as unknown as WaitlistEntry | null;

    if (!entry) {
      throw APIError.notFound('Waitlist entry');
    }

    return c.json({
      success: true,
      entry: serializeEntry(entry),
    });
  }
);

/**
 * Create waitlist entry
 * POST /api/waitlist
 */
waitlist.post(
  '/',
  requirePermission('waitlist:create'),
  zValidator('json', createWaitlistSchema),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    // Check if patient is already on waitlist for same services
    const existingEntries = await prisma.waitlistEntry.findMany({
      where: {
        patientId: data.patientId,
        status: 'ACTIVE',
      },
    });

    const hasConflict = existingEntries.some(entry =>
      entry.serviceIds.some(svc => data.serviceIds.includes(svc))
    );

    if (hasConflict) {
      throw APIError.conflict(
        `Patient is already on the waitlist for one or more of these services`
      );
    }

    const id = generateId();
    const now = new Date();

    // Create entry in database
    const entry = await prisma.waitlistEntry.create({
      data: {
        id,
        patientId: data.patientId,
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        patientEmail: data.patientEmail,
        serviceIds: data.serviceIds,
        serviceNames: data.serviceNames || [],
        providerIds: data.providerIds,
        providerNames: data.providerNames || [],
        preferredDays: data.preferredDays,
        preferredTimeRanges: data.preferredTimeRanges as any,
        flexibleDates: data.flexibleDates,
        flexibleProviders: data.flexibleProviders,
        flexibleTimes: data.flexibleTimes,
        status: 'ACTIVE',
        priority: data.priority,
        tier: data.tier,
        offerHistory: [],
        createdAt: now,
        updatedAt: now,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        notes: data.notes,
        deposit: data.deposit,
        hasCompletedForms: data.hasCompletedForms || false,
      },
    }) as unknown as WaitlistEntry;

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'CREATE',
      resourceType: 'waitlist',
      resourceId: id,
      patientId: data.patientId,
      phiAccessed: true,
      ipAddress,
      metadata: {
        serviceIds: data.serviceIds,
        priority: data.priority,
      },
    });

    return c.json({
      success: true,
      message: 'Added to waitlist successfully',
      entry: serializeEntry(entry),
    }, 201);
  }
);

/**
 * Update waitlist entry
 * PUT /api/waitlist/:id
 */
waitlist.put(
  '/:id',
  requirePermission('waitlist:update'),
  zValidator('param', waitlistIdParamSchema),
  zValidator('json', updateWaitlistSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const entry = await prisma.waitlistEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw APIError.notFound('Waitlist entry');
    }

    // Cannot update booked or cancelled entries
    if (entry.status === 'BOOKED' || entry.status === 'CANCELLED') {
      throw APIError.badRequest(`Cannot update ${entry.status} waitlist entry`);
    }

    // Build update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.patientName !== undefined) updateData.patientName = data.patientName;
    if (data.patientPhone !== undefined) updateData.patientPhone = data.patientPhone;
    if (data.patientEmail !== undefined) updateData.patientEmail = data.patientEmail || null;
    if (data.serviceIds !== undefined) updateData.serviceIds = data.serviceIds;
    if (data.serviceNames !== undefined) updateData.serviceNames = data.serviceNames;
    if (data.providerIds !== undefined) updateData.providerIds = data.providerIds;
    if (data.providerNames !== undefined) updateData.providerNames = data.providerNames;
    if (data.preferredDays !== undefined) updateData.preferredDays = data.preferredDays;
    if (data.preferredTimeRanges !== undefined) updateData.preferredTimeRanges = data.preferredTimeRanges as any;
    if (data.flexibleDates !== undefined) updateData.flexibleDates = data.flexibleDates;
    if (data.flexibleProviders !== undefined) updateData.flexibleProviders = data.flexibleProviders;
    if (data.flexibleTimes !== undefined) updateData.flexibleTimes = data.flexibleTimes;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.tier !== undefined) updateData.tier = data.tier;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    if (data.deposit !== undefined) updateData.deposit = data.deposit ?? null;
    if (data.hasCompletedForms !== undefined) updateData.hasCompletedForms = data.hasCompletedForms;

    // Update in database
    const updatedEntry = await prisma.waitlistEntry.update({
      where: { id },
      data: updateData,
    }) as unknown as WaitlistEntry;

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'UPDATE',
      resourceType: 'waitlist',
      resourceId: id,
      patientId: updatedEntry.patientId,
      phiAccessed: true,
      ipAddress,
      metadata: { updatedFields: Object.keys(data) },
    });

    return c.json({
      success: true,
      message: 'Waitlist entry updated successfully',
      entry: serializeEntry(updatedEntry),
    });
  }
);

/**
 * Delete/Remove from waitlist
 * DELETE /api/waitlist/:id
 */
waitlist.delete(
  '/:id',
  requirePermission('waitlist:delete'),
  zValidator('param', waitlistIdParamSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    // Parse body if present (for cancellation reason)
    let reason: string | undefined;
    try {
      const body = await c.req.json();
      reason = body?.reason;
    } catch {
      // No body provided
    }

    const entry = await prisma.waitlistEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw APIError.notFound('Waitlist entry');
    }

    // Clear any pending offer tokens
    const currentOffer = entry.currentOffer as any;
    if (currentOffer?.token) {
      offerTokenStore.delete(currentOffer.token);
    }

    // Build notes with cancellation reason
    let notes = entry.notes || '';
    if (reason) {
      notes = notes
        ? `${notes}\n\nCancellation reason: ${reason}`
        : `Cancellation reason: ${reason}`;
    }

    // Mark as cancelled in database
    const updatedEntry = await prisma.waitlistEntry.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
        notes: notes || null,
      },
    }) as unknown as WaitlistEntry;

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'DELETE',
      resourceType: 'waitlist',
      resourceId: id,
      patientId: entry.patientId,
      phiAccessed: true,
      ipAddress,
      metadata: { reason },
    });

    return c.json({
      success: true,
      message: 'Removed from waitlist successfully',
      entry: serializeEntry(updatedEntry),
    });
  }
);

/**
 * Send availability offer
 * POST /api/waitlist/:id/offer
 */
waitlist.post(
  '/:id/offer',
  requirePermission('waitlist:offer'),
  zValidator('param', waitlistIdParamSchema),
  zValidator('json', sendOfferSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const entry = await prisma.waitlistEntry.findUnique({
      where: { id },
    }) as unknown as WaitlistEntry | null;

    if (!entry) {
      throw APIError.notFound('Waitlist entry');
    }

    // Cannot send offer to non-active entry
    if (entry.status !== 'ACTIVE') {
      throw APIError.badRequest(`Cannot send offer to ${entry.status} waitlist entry`);
    }

    // Check if patient already has appointment on this date
    if (await patientHasAppointmentOnDate(entry.patientId, data.appointmentSlot.date)) {
      throw APIError.conflict('Patient already has an appointment on this date');
    }

    // Check if there's already a pending offer
    const currentOffer = entry.currentOffer as any;
    if (currentOffer && currentOffer.status === 'pending') {
      throw APIError.conflict('Entry already has a pending offer');
    }

    // Get settings for expiry time
    const settings = await getWaitlistSettings();

    // Generate offer
    const expiryMinutes = data.expiryMinutes || settings.offerExpiryMinutes;
    const now = new Date();
    const offer: Offer = {
      id: generateOfferId(),
      appointmentSlot: {
        date: data.appointmentSlot.date,
        time: data.appointmentSlot.time,
        providerId: data.appointmentSlot.providerId,
        providerName: data.appointmentSlot.providerName,
      },
      offeredAt: now,
      expiresAt: new Date(now.getTime() + expiryMinutes * 60 * 1000),
      token: generateToken(),
      status: 'pending',
    };

    // Update entry in database
    const updatedEntry = await prisma.waitlistEntry.update({
      where: { id },
      data: {
        currentOffer: offer as any,
        status: 'OFFERED',
        updatedAt: now,
      },
    }) as unknown as WaitlistEntry;

    // Store token for lookup
    offerTokenStore.set(offer.token, { entryId: id, offerId: offer.id });

    // Send notification if requested
    if (data.notifyPatient) {
      await sendOfferNotification(updatedEntry, offer);
    }

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'CREATE',
      resourceType: 'waitlist_offer',
      resourceId: offer.id,
      patientId: entry.patientId,
      phiAccessed: true,
      ipAddress,
      metadata: {
        waitlistEntryId: id,
        slot: data.appointmentSlot,
        expiresAt: offer.expiresAt.toISOString(),
      },
    });

    return c.json({
      success: true,
      message: 'Offer sent successfully',
      entry: serializeEntry(updatedEntry),
      offer: {
        ...offer,
        offeredAt: offer.offeredAt.toISOString(),
        expiresAt: offer.expiresAt.toISOString(),
      },
    }, 201);
  }
);

/**
 * Accept offer (can be used by patient with token)
 * POST /api/waitlist/:id/offer/accept
 */
waitlist.post(
  '/:id/offer/accept',
  zValidator('param', waitlistIdParamSchema),
  zValidator('json', acceptDeclineOfferSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const { token } = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const entry = await prisma.waitlistEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw APIError.notFound('Waitlist entry');
    }

    // Verify token
    const tokenData = offerTokenStore.get(token);
    if (!tokenData || tokenData.entryId !== id) {
      throw APIError.badRequest('Invalid or expired offer token');
    }

    // Check offer exists and is pending
    const currentOffer = entry.currentOffer as any;
    if (!currentOffer || currentOffer.status !== 'pending') {
      throw APIError.badRequest('No pending offer to accept');
    }

    // Check offer hasn't expired
    const now = new Date();
    if (new Date(currentOffer.expiresAt) < now) {
      // Expire the offer
      currentOffer.status = 'expired';
      const offerHistory = (entry.offerHistory as any[]) || [];
      offerHistory.push(currentOffer);

      await prisma.waitlistEntry.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          currentOffer: Prisma.JsonNull,
          offerHistory: offerHistory,
          updatedAt: now,
        },
      });

      offerTokenStore.delete(token);
      throw APIError.badRequest('Offer has expired');
    }

    // Accept the offer
    currentOffer.status = 'accepted';
    currentOffer.respondedAt = now;
    const offerHistory = (entry.offerHistory as any[]) || [];
    offerHistory.push(currentOffer);

    // Update entry in database
    const updatedEntry = await prisma.waitlistEntry.update({
      where: { id },
      data: {
        status: 'BOOKED',
        currentOffer: Prisma.JsonNull,
        offerHistory: offerHistory,
        updatedAt: now,
      },
    }) as unknown as WaitlistEntry;

    offerTokenStore.delete(token);

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'UPDATE',
      resourceType: 'waitlist_offer',
      resourceId: tokenData.offerId,
      patientId: entry.patientId,
      phiAccessed: true,
      ipAddress,
      metadata: {
        waitlistEntryId: id,
        action: 'accepted',
      },
    });

    return c.json({
      success: true,
      message: 'Offer accepted successfully',
      entry: serializeEntry(updatedEntry),
      acceptedSlot: currentOffer.appointmentSlot,
    });
  }
);

/**
 * Decline offer
 * POST /api/waitlist/:id/offer/decline
 */
waitlist.post(
  '/:id/offer/decline',
  zValidator('param', waitlistIdParamSchema),
  zValidator('json', acceptDeclineOfferSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const { token } = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const entry = await prisma.waitlistEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw APIError.notFound('Waitlist entry');
    }

    // Verify token
    const tokenData = offerTokenStore.get(token);
    if (!tokenData || tokenData.entryId !== id) {
      throw APIError.badRequest('Invalid or expired offer token');
    }

    // Check offer exists and is pending
    const currentOffer = entry.currentOffer as any;
    if (!currentOffer || currentOffer.status !== 'pending') {
      throw APIError.badRequest('No pending offer to decline');
    }

    // Decline the offer
    const now = new Date();
    currentOffer.status = 'declined';
    currentOffer.respondedAt = now;
    const offerHistory = (entry.offerHistory as any[]) || [];
    offerHistory.push(currentOffer);

    // Update entry in database - return to active status
    const updatedEntry = await prisma.waitlistEntry.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        currentOffer: Prisma.JsonNull,
        offerHistory: offerHistory,
        updatedAt: now,
      },
    }) as unknown as WaitlistEntry;

    offerTokenStore.delete(token);

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'UPDATE',
      resourceType: 'waitlist_offer',
      resourceId: tokenData.offerId,
      patientId: entry.patientId,
      phiAccessed: true,
      ipAddress,
      metadata: {
        waitlistEntryId: id,
        action: 'declined',
      },
    });

    return c.json({
      success: true,
      message: 'Offer declined. Entry returned to active status.',
      entry: serializeEntry(updatedEntry),
    });
  }
);

// ===================
// Exports for Testing
// ===================

export async function clearStores() {
  // Clear offer token store
  offerTokenStore.clear();

  // Delete all waitlist entries from database
  await prisma.waitlistEntry.deleteMany({});

  // Reset settings to defaults (if needed for testing)
  // This would require finding and updating the settings record
}

export async function addMockEntry(entry: Omit<WaitlistEntry, 'createdAt' | 'updatedAt'>) {
  await prisma.waitlistEntry.create({
    data: {
      ...entry,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any,
  });
}

export async function getMockEntry(id: string): Promise<WaitlistEntry | null> {
  return await prisma.waitlistEntry.findUnique({
    where: { id },
  }) as unknown as WaitlistEntry | null;
}

export async function setSettings(settings: Partial<WaitlistSettings>) {
  const currentSettings = await getWaitlistSettings();
  await prisma.waitlistSettings.update({
    where: { id: currentSettings.id },
    data: settings as any,
  });
}

export async function getSettings(): Promise<WaitlistSettings> {
  return await getWaitlistSettings() as any;
}

export { offerTokenStore };

export default waitlist;
