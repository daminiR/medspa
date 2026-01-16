/**
 * Group Bookings API Routes
 *
 * Full CRUD operations for group booking management:
 * - List/search group bookings
 * - Get single group booking
 * - Create group booking
 * - Update group booking
 * - Cancel/delete group booking
 * - Participant management (add, update, remove)
 * - Check-in (individual and group)
 * - Join group via invite code (public)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as crypto from 'crypto';
import { authMiddleware, optionalAuthMiddleware, requirePermission } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const groupBookings = new Hono();

// ===================
// Types
// ===================

export type GroupBookingType = 'couples' | 'party' | 'corporate' | 'family' | 'friends' | 'other';
export type GroupBookingStatus = 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentType = 'organizer_pays' | 'split_equal' | 'individual';
export type ParticipantStatus = 'invited' | 'confirmed' | 'arrived' | 'in_progress' | 'completed' | 'no_show' | 'cancelled';

export interface GroupParticipant {
  id: string;
  groupId: string;

  // Patient info (may be existing patient or new)
  patientId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;

  // Assignment
  serviceId: string;
  serviceName: string;
  providerId?: string;
  providerName?: string;
  roomId?: string;
  startTime: string;
  duration: number;

  // Status
  status: ParticipantStatus;
  checkedInAt?: string;

  // Payment
  amount: number;
  paid: boolean;
  paymentId?: string;

  // Consents
  consentSigned: boolean;
  consentSignedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export interface GroupBooking {
  id: string;
  name: string;
  type: GroupBookingType;

  // Organizer
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;

  // Scheduling
  date: string;
  startTime: string;
  endTime: string;
  locationId?: string;

  // Participants
  participants: GroupParticipant[];
  maxParticipants: number;
  minParticipants: number;

  // Services
  sharedServiceId?: string;
  allowIndividualServices: boolean;

  // Booking
  status: GroupBookingStatus;
  inviteCode: string;

  // Payment
  paymentType: PaymentType;
  depositRequired: boolean;
  depositAmount?: number;
  totalAmount: number;
  paidAmount: number;

  // Notes
  notes?: string;
  specialRequests?: string;

  createdAt: string;
  updatedAt: string;
}

// ===================
// Validation Schemas
// ===================

const uuidSchema = z.string().min(1);

const groupTypeSchema = z.enum(['couples', 'party', 'corporate', 'family', 'friends', 'other']);

const groupStatusSchema = z.enum(['draft', 'confirmed', 'in_progress', 'completed', 'cancelled']);

const paymentTypeSchema = z.enum(['organizer_pays', 'split_equal', 'individual']);

const participantStatusSchema = z.enum([
  'invited',
  'confirmed',
  'arrived',
  'in_progress',
  'completed',
  'no_show',
  'cancelled',
]);

const groupIdParamSchema = z.object({
  id: uuidSchema,
});

const participantIdParamSchema = z.object({
  id: uuidSchema,
  participantId: uuidSchema,
});

const inviteCodeParamSchema = z.object({
  code: z.string().min(4).max(10),
});

const listGroupsSchema = z.object({
  status: groupStatusSchema.optional(),
  type: groupTypeSchema.optional(),
  organizerId: uuidSchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  locationId: uuidSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const createGroupSchema = z.object({
  name: z.string().min(1).max(200),
  type: groupTypeSchema,
  organizerId: uuidSchema,
  organizerName: z.string().min(1),
  organizerEmail: z.string().email(),
  organizerPhone: z.string().min(1),
  date: z.string(), // YYYY-MM-DD
  startTime: z.string(), // HH:MM or ISO datetime
  endTime: z.string().optional(),
  locationId: uuidSchema.optional(),
  maxParticipants: z.coerce.number().int().min(2).max(50).default(10),
  minParticipants: z.coerce.number().int().min(1).max(50).default(2),
  sharedServiceId: uuidSchema.optional(),
  allowIndividualServices: z.boolean().default(true),
  paymentType: paymentTypeSchema.default('individual'),
  depositRequired: z.boolean().default(false),
  depositAmount: z.coerce.number().min(0).optional(),
  notes: z.string().max(5000).optional(),
  specialRequests: z.string().max(5000).optional(),
});

const updateGroupSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: groupTypeSchema.optional(),
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  locationId: uuidSchema.optional().nullable(),
  maxParticipants: z.coerce.number().int().min(2).max(50).optional(),
  minParticipants: z.coerce.number().int().min(1).max(50).optional(),
  sharedServiceId: uuidSchema.optional().nullable(),
  allowIndividualServices: z.boolean().optional(),
  paymentType: paymentTypeSchema.optional(),
  depositRequired: z.boolean().optional(),
  depositAmount: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  specialRequests: z.string().max(5000).optional().nullable(),
  status: groupStatusSchema.optional(),
});

const addParticipantSchema = z.object({
  patientId: uuidSchema.optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  serviceId: uuidSchema,
  serviceName: z.string().min(1),
  providerId: uuidSchema.optional(),
  providerName: z.string().optional(),
  roomId: uuidSchema.optional(),
  startTime: z.string(),
  duration: z.coerce.number().int().min(5).max(480),
  amount: z.coerce.number().min(0).default(0),
});

const updateParticipantSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  serviceId: uuidSchema.optional(),
  serviceName: z.string().min(1).optional(),
  providerId: uuidSchema.optional().nullable(),
  providerName: z.string().optional().nullable(),
  roomId: uuidSchema.optional().nullable(),
  startTime: z.string().optional(),
  duration: z.coerce.number().int().min(5).max(480).optional(),
  amount: z.coerce.number().min(0).optional(),
  paid: z.boolean().optional(),
  paymentId: z.string().optional().nullable(),
  status: participantStatusSchema.optional(),
  consentSigned: z.boolean().optional(),
});

const checkInSchema = z.object({
  participantIds: z.array(uuidSchema).optional(), // If not provided, check in all confirmed participants
});

const joinGroupSchema = z.object({
  patientId: uuidSchema.optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  serviceId: uuidSchema,
  serviceName: z.string().min(1),
  preferredTime: z.string().optional(),
});

// ===================
// Data Store (Now using Prisma)
// ===================

// All group booking data is now stored in the database via Prisma
// - GroupBooking model for groups
// - GroupParticipant model for participants
// - inviteCode field on GroupBooking is unique index for lookups

// ===================
// Helper Functions
// ===================

function generateId(): string {
  return crypto.randomUUID();
}

function generateParticipantId(): string {
  return crypto.randomUUID();
}

async function generateInviteCode(name: string): Promise<string> {
  // Generate a unique 6-character code based on name
  const baseName = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
  const suffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  let code = baseName + suffix;

  // Ensure uniqueness by checking database
  let attempts = 0;
  while (attempts < 100) {
    const existing = await prisma.groupBooking.findUnique({
      where: { inviteCode: code },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }

    const newSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    code = baseName.slice(0, 3) + newSuffix;
    attempts++;
  }

  // Fallback to random code if all attempts failed
  return crypto.randomUUID().substring(0, 6).toUpperCase();
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

/**
 * Calculate total amount from participants
 */
function calculateTotalAmount(participants: GroupParticipant[]): number {
  return participants.reduce((sum, p) => sum + p.amount, 0);
}

/**
 * Calculate paid amount from participants
 */
function calculatePaidAmount(participants: GroupParticipant[]): number {
  return participants.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
}

/**
 * Calculate end time based on participants
 */
function calculateEndTime(participants: GroupParticipant[]): string {
  if (participants.length === 0) return '';

  let maxEnd = new Date(0);
  for (const p of participants) {
    const start = new Date(p.startTime);
    const end = new Date(start.getTime() + p.duration * 60 * 1000);
    if (end > maxEnd) {
      maxEnd = end;
    }
  }

  return maxEnd.toISOString();
}

/**
 * Calculate group discount based on size
 */
function calculateGroupDiscount(size: number): number {
  if (size >= 10) return 20;
  if (size >= 5) return 15;
  if (size >= 3) return 10;
  if (size >= 2) return 5;
  return 0;
}

/**
 * Check for provider/room availability
 */
async function checkParticipantConflicts(
  groupId: string,
  providerId: string | undefined,
  roomId: string | undefined,
  startTime: string,
  duration: number,
  excludeParticipantId?: string
): Promise<{ hasConflict: boolean; message?: string }> {
  const newStart = new Date(startTime);
  const newEnd = new Date(newStart.getTime() + duration * 60 * 1000);

  // Build where clause to find overlapping participants
  const where: Prisma.GroupParticipantWhereInput = {
    id: excludeParticipantId ? { not: excludeParticipantId } : undefined,
    status: { not: 'CANCELLED' },
    AND: [
      {
        OR: [
          // Provider conflict
          providerId && providerId !== '' ? { providerId } : {},
          // Room conflict
          roomId && roomId !== '' ? { roomId } : {},
        ].filter(obj => Object.keys(obj).length > 0),
      },
    ],
  };

  // Find potentially conflicting participants
  const participants = await prisma.groupParticipant.findMany({
    where,
    select: {
      id: true,
      providerId: true,
      providerName: true,
      roomId: true,
      startTime: true,
      duration: true,
    },
  });

  // Check each participant for time overlap
  for (const participant of participants) {
    const pStart = new Date(participant.startTime);
    const pEnd = new Date(pStart.getTime() + participant.duration * 60 * 1000);

    // Check for time overlap
    const overlaps = newStart < pEnd && pStart < newEnd;

    if (overlaps) {
      // Provider conflict
      if (providerId && participant.providerId === providerId) {
        return {
          hasConflict: true,
          message: `Provider ${participant.providerName || providerId} is already booked at this time`,
        };
      }

      // Room conflict
      if (roomId && participant.roomId === roomId) {
        return {
          hasConflict: true,
          message: `Room ${roomId} is already booked at this time`,
        };
      }
    }
  }

  return { hasConflict: false };
}

/**
 * Valid status transitions for group bookings
 */
const validGroupTransitions: Record<GroupBookingStatus, GroupBookingStatus[]> = {
  draft: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [], // Terminal state
  cancelled: [], // Terminal state
};

function isValidGroupTransition(from: GroupBookingStatus, to: GroupBookingStatus): boolean {
  return validGroupTransitions[from]?.includes(to) ?? false;
}

/**
 * Valid status transitions for participants
 */
const validParticipantTransitions: Record<ParticipantStatus, ParticipantStatus[]> = {
  invited: ['confirmed', 'cancelled'],
  confirmed: ['arrived', 'no_show', 'cancelled'],
  arrived: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [], // Terminal state
  no_show: [], // Terminal state
  cancelled: [], // Terminal state
};

function isValidParticipantTransition(from: ParticipantStatus, to: ParticipantStatus): boolean {
  return validParticipantTransitions[from]?.includes(to) ?? false;
}

// ===================
// Mock Data Removed
// ===================

// Mock data has been removed. All data now lives in the Prisma database.
// Use Prisma seed scripts or migrations for test data.

// ===================
// Routes
// ===================

// Public routes for joining groups
groupBookings.get(
  '/join/:code',
  optionalAuthMiddleware,
  zValidator('param', inviteCodeParamSchema),
  async (c) => {
    const { code } = c.req.valid('param');

    const group = await prisma.groupBooking.findUnique({
      where: { inviteCode: code.toUpperCase() },
      include: {
        GroupParticipant: {
          where: { status: { not: 'CANCELLED' } },
        },
      },
    });

    if (!group) {
      throw APIError.notFound('Group booking');
    }

    // Don't allow joining cancelled groups
    if (group.status === 'CANCELLED') {
      throw APIError.badRequest('This group booking has been cancelled');
    }

    // Don't allow joining completed groups
    if (group.status === 'COMPLETED') {
      throw APIError.badRequest('This group booking has already been completed');
    }

    // Check if group is full
    const activeParticipants = group.GroupParticipant.length;

    if (activeParticipants >= group.maxParticipants) {
      throw APIError.badRequest('This group booking is full');
    }

    // Return public group info
    return c.json({
      success: true,
      group: {
        id: group.id,
        name: group.name,
        type: group.type.toLowerCase(),
        organizerName: group.organizerName,
        date: group.date,
        startTime: group.startTime.toISOString(),
        locationId: group.locationId,
        sharedServiceId: group.sharedServiceId,
        allowIndividualServices: group.allowIndividualServices,
        currentParticipants: activeParticipants,
        maxParticipants: group.maxParticipants,
        discount: calculateGroupDiscount(activeParticipants + 1),
      },
    });
  }
);

groupBookings.post(
  '/join/:code',
  optionalAuthMiddleware,
  zValidator('param', inviteCodeParamSchema),
  zValidator('json', joinGroupSchema),
  async (c) => {
    const { code } = c.req.valid('param');
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const group = await prisma.groupBooking.findUnique({
      where: { inviteCode: code.toUpperCase() },
      include: {
        GroupParticipant: true,
      },
    });

    if (!group) {
      throw APIError.notFound('Group booking');
    }

    // Validation checks
    if (group.status === 'CANCELLED') {
      throw APIError.badRequest('This group booking has been cancelled');
    }

    if (group.status === 'COMPLETED') {
      throw APIError.badRequest('This group booking has already been completed');
    }

    const activeParticipants = group.GroupParticipant.filter(
      (p: { status: string }) => p.status !== 'CANCELLED'
    );

    if (activeParticipants.length >= group.maxParticipants) {
      throw APIError.badRequest('This group booking is full');
    }

    // Check if patient is already in group
    if (data.patientId) {
      const existing = group.GroupParticipant.find(
        (p) => p.patientId === data.patientId && p.status !== 'CANCELLED'
      );
      if (existing) {
        throw APIError.conflict('You are already a participant in this group');
      }
    }

    // Check email uniqueness
    if (data.email) {
      const existingEmail = group.GroupParticipant.find(
        (p) => p.email?.toLowerCase() === data.email?.toLowerCase() && p.status !== 'CANCELLED'
      );
      if (existingEmail) {
        throw APIError.conflict('A participant with this email is already in the group');
      }
    }

    // Determine start time
    let startTime: string = data.preferredTime || '';
    if (!startTime) {
      // Find next available slot
      if (activeParticipants.length > 0) {
        const lastParticipant = activeParticipants
          .sort((a: { startTime: Date }, b: { startTime: Date }) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];
        const lastEnd = new Date(lastParticipant.startTime);
        lastEnd.setMinutes(lastEnd.getMinutes() + lastParticipant.duration);
        startTime = lastEnd.toISOString();
      } else {
        startTime = group.startTime.toISOString();
      }
    }

    // Create participant in database
    const participantId = generateParticipantId();
    const participant = await prisma.groupParticipant.create({
      data: {
        id: participantId,
        groupId: group.id,
        patientId: data.patientId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        serviceId: data.serviceId,
        serviceName: data.serviceName,
        startTime: new Date(startTime),
        duration: 60, // Default duration
        status: 'CONFIRMED',
        amount: 0, // Will be calculated based on service
        paid: false,
        consentSigned: false,
        updatedAt: new Date(),
      },
    });

    // Recalculate group totals
    const allParticipants = await prisma.groupParticipant.findMany({
      where: { groupId: group.id },
    });

    const totalAmount = allParticipants.reduce((sum, p) => sum + p.amount, 0);
    const endTime = calculateEndTime(allParticipants.map(p => ({
      startTime: p.startTime.toISOString(),
      duration: p.duration,
    } as GroupParticipant)));

    await prisma.groupBooking.update({
      where: { id: group.id },
      data: {
        totalAmount,
        endTime: new Date(endTime),
        updatedAt: new Date(),
      },
    });

    // Log audit event
    await logAuditEvent({
      userId: user?.uid || 'anonymous',
      action: 'CREATE',
      resourceType: 'group_participant',
      resourceId: participantId,
      patientId: data.patientId,
      phiAccessed: true,
      ipAddress,
      metadata: {
        groupId: group.id,
        groupName: group.name,
        action: 'join_group',
      },
    });

    return c.json({
      success: true,
      message: 'Successfully joined group booking',
      participant,
      group: {
        id: group.id,
        name: group.name,
        type: group.type.toLowerCase(),
        date: group.date,
        startTime: group.startTime.toISOString(),
        currentParticipants: activeParticipants.length + 1,
        maxParticipants: group.maxParticipants,
      },
    }, 201);
  }
);

// All other routes require authentication
groupBookings.use('/*', authMiddleware);

/**
 * List group bookings
 * GET /api/groups
 */
groupBookings.get(
  '/',
  requirePermission('group:list'),
  zValidator('query', listGroupsSchema),
  async (c) => {
    const query = c.req.valid('query');

    // Build where clause
    const where: Prisma.GroupBookingWhereInput = {
      status: query.status ? (query.status.toUpperCase() as any) : undefined,
      type: query.type ? (query.type.toUpperCase() as any) : undefined,
      organizerId: query.organizerId,
      date: {
        gte: query.dateFrom,
        lte: query.dateTo,
      },
      locationId: query.locationId,
    };

    // Remove undefined fields
    Object.keys(where).forEach(key => {
      if (where[key as keyof typeof where] === undefined) {
        delete where[key as keyof typeof where];
      }
    });

    // Count total
    const total = await prisma.groupBooking.count({ where });

    // Fetch paginated results
    const offset = (query.page - 1) * query.limit;
    const results = await prisma.groupBooking.findMany({
      where,
      include: {
        GroupParticipant: {
          where: { status: { not: 'CANCELLED' } },
        },
      },
      orderBy: { date: 'asc' },
      skip: offset,
      take: query.limit,
    });

    // Transform to API format
    const items = results.map((g: any) => ({
      ...g,
      type: g.type.toLowerCase(),
      status: g.status.toLowerCase(),
      startTime: g.startTime.toISOString(),
      endTime: g.endTime.toISOString(),
      participants: g.GroupParticipant.map((p: any) => ({
        ...p,
        status: p.status.toLowerCase(),
        startTime: p.startTime.toISOString(),
        checkedInAt: p.checkedInAt?.toISOString(),
        consentSignedAt: p.consentSignedAt?.toISOString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
    }));

    return c.json({
      success: true,
      items,
      total,
      page: query.page,
      limit: query.limit,
      hasMore: offset + results.length < total,
    });
  }
);

/**
 * Get group booking by ID
 * GET /api/groups/:id
 */
groupBookings.get(
  '/:id',
  requirePermission('group:read'),
  zValidator('param', groupIdParamSchema),
  async (c) => {
    const { id } = c.req.valid('param');

    const group = await prisma.groupBooking.findUnique({
      where: { id },
      include: {
        GroupParticipant: true,
      },
    });

    if (!group) {
      throw APIError.notFound('Group booking');
    }

    // Transform to API format
    const formattedGroup = {
      ...group,
      type: group.type.toLowerCase(),
      status: group.status.toLowerCase(),
      startTime: group.startTime.toISOString(),
      endTime: group.endTime.toISOString(),
      participants: group.GroupParticipant.map((p: any) => ({
        ...p,
        status: p.status.toLowerCase(),
        startTime: p.startTime.toISOString(),
        checkedInAt: p.checkedInAt?.toISOString(),
        consentSignedAt: p.consentSignedAt?.toISOString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    };

    return c.json({
      success: true,
      group: formattedGroup,
    });
  }
);

/**
 * Create group booking
 * POST /api/groups
 */
groupBookings.post(
  '/',
  requirePermission('group:create'),
  zValidator('json', createGroupSchema),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const id = generateId();
    const inviteCode = await generateInviteCode(data.name);

    const group = await prisma.groupBooking.create({
      data: {
        id,
        name: data.name,
        type: data.type.toUpperCase() as any,
        organizerId: data.organizerId,
        organizerName: data.organizerName,
        organizerEmail: data.organizerEmail,
        organizerPhone: data.organizerPhone,
        date: data.date,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime || data.startTime),
        locationId: data.locationId,
        maxParticipants: data.maxParticipants,
        minParticipants: data.minParticipants,
        sharedServiceId: data.sharedServiceId,
        allowIndividualServices: data.allowIndividualServices,
        status: 'DRAFT',
        inviteCode,
        paymentType: data.paymentType.toUpperCase() as any,
        depositRequired: data.depositRequired,
        depositAmount: data.depositAmount,
        totalAmount: 0,
        paidAmount: 0,
        notes: data.notes,
        specialRequests: data.specialRequests,
        updatedAt: new Date(),
      },
      include: {
        GroupParticipant: true,
      },
    });

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'CREATE',
      resourceType: 'group_booking',
      resourceId: id,
      patientId: data.organizerId,
      phiAccessed: true,
      ipAddress,
      metadata: {
        groupName: data.name,
        groupType: data.type,
        inviteCode,
      },
    });

    // Transform to API format
    const formattedGroup = {
      ...group,
      type: group.type.toLowerCase(),
      status: group.status.toLowerCase(),
      paymentType: group.paymentType.toLowerCase(),
      startTime: group.startTime.toISOString(),
      endTime: group.endTime.toISOString(),
      participants: [],
      createdAt: group.createdAt.toISOString(),
      updatedAt: group.updatedAt.toISOString(),
    };

    return c.json({
      success: true,
      message: 'Group booking created successfully',
      group: formattedGroup,
    }, 201);
  }
);

/**
 * Update group booking
 * PUT /api/groups/:id
 */
groupBookings.put(
  '/:id',
  requirePermission('group:update'),
  zValidator('param', groupIdParamSchema),
  zValidator('json', updateGroupSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const group = await prisma.groupBooking.findUnique({
      where: { id },
      include: {
        GroupParticipant: true,
      },
    });

    if (!group) {
      throw APIError.notFound('Group booking');
    }

    // Cannot update cancelled or completed groups (except status change)
    if ((group.status === 'CANCELLED' || group.status === 'COMPLETED') && !data.status) {
      throw APIError.badRequest(`Cannot update ${group.status.toLowerCase()} group booking`);
    }

    // Validate status transition
    if (data.status && data.status !== group.status.toLowerCase()) {
      const currentStatus = group.status.toLowerCase() as GroupBookingStatus;
      if (!isValidGroupTransition(currentStatus, data.status)) {
        throw APIError.badRequest(
          `Invalid status transition from '${currentStatus}' to '${data.status}'`
        );
      }
    }

    // Build update data
    const updateData: Prisma.GroupBookingUpdateInput = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type.toUpperCase() as any;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.startTime !== undefined) updateData.startTime = new Date(data.startTime);
    if (data.endTime !== undefined) updateData.endTime = new Date(data.endTime);
    if (data.locationId !== undefined) updateData.locationId = data.locationId || null;
    if (data.maxParticipants !== undefined) updateData.maxParticipants = data.maxParticipants;
    if (data.minParticipants !== undefined) updateData.minParticipants = data.minParticipants;
    if (data.sharedServiceId !== undefined) updateData.sharedServiceId = data.sharedServiceId || null;
    if (data.allowIndividualServices !== undefined) updateData.allowIndividualServices = data.allowIndividualServices;
    if (data.paymentType !== undefined) updateData.paymentType = data.paymentType.toUpperCase() as any;
    if (data.depositRequired !== undefined) updateData.depositRequired = data.depositRequired;
    if (data.depositAmount !== undefined) updateData.depositAmount = data.depositAmount || null;
    if (data.notes !== undefined) updateData.notes = data.notes || null;
    if (data.specialRequests !== undefined) updateData.specialRequests = data.specialRequests || null;
    if (data.status !== undefined) updateData.status = data.status.toUpperCase() as any;

    const updatedGroup = await prisma.groupBooking.update({
      where: { id },
      data: updateData,
      include: {
        GroupParticipant: true,
      },
    });

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'UPDATE',
      resourceType: 'group_booking',
      resourceId: id,
      patientId: updatedGroup.organizerId,
      phiAccessed: true,
      ipAddress,
      metadata: { updatedFields: Object.keys(data) },
    });

    // Transform to API format
    const formattedGroup = {
      ...updatedGroup,
      type: updatedGroup.type.toLowerCase(),
      status: updatedGroup.status.toLowerCase(),
      paymentType: updatedGroup.paymentType.toLowerCase(),
      startTime: updatedGroup.startTime.toISOString(),
      endTime: updatedGroup.endTime.toISOString(),
      participants: updatedGroup.GroupParticipant.map((p: any) => ({
        ...p,
        status: p.status.toLowerCase(),
        startTime: p.startTime.toISOString(),
        checkedInAt: p.checkedInAt?.toISOString(),
        consentSignedAt: p.consentSignedAt?.toISOString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      createdAt: updatedGroup.createdAt.toISOString(),
      updatedAt: updatedGroup.updatedAt.toISOString(),
    };

    return c.json({
      success: true,
      message: 'Group booking updated successfully',
      group: formattedGroup,
    });
  }
);

/**
 * Delete/Cancel group booking
 * DELETE /api/groups/:id
 */
groupBookings.delete(
  '/:id',
  requirePermission('group:delete'),
  zValidator('param', groupIdParamSchema),
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

    const group = await prisma.groupBooking.findUnique({
      where: { id },
      include: {
        GroupParticipant: true,
      },
    });

    if (!group) {
      throw APIError.notFound('Group booking');
    }

    // Already cancelled
    if (group.status === 'CANCELLED') {
      throw APIError.badRequest('Group booking is already cancelled');
    }

    // Cannot cancel completed group
    if (group.status === 'COMPLETED') {
      throw APIError.badRequest('Cannot cancel completed group booking');
    }

    // Cancel the group
    const updatedNotes = reason
      ? `${group.notes || ''}\n\nCancelled: ${reason}`.trim()
      : group.notes;

    const updatedGroup = await prisma.groupBooking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: updatedNotes,
        updatedAt: new Date(),
      },
      include: {
        GroupParticipant: true,
      },
    });

    // Cancel all participants
    await prisma.groupParticipant.updateMany({
      where: {
        groupId: id,
        status: {
          notIn: ['CANCELLED', 'COMPLETED'],
        },
      },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'DELETE',
      resourceType: 'group_booking',
      resourceId: id,
      patientId: updatedGroup.organizerId,
      phiAccessed: true,
      ipAddress,
      metadata: { reason },
    });

    // Transform to API format
    const formattedGroup = {
      ...updatedGroup,
      type: updatedGroup.type.toLowerCase(),
      status: updatedGroup.status.toLowerCase(),
      paymentType: updatedGroup.paymentType.toLowerCase(),
      startTime: updatedGroup.startTime.toISOString(),
      endTime: updatedGroup.endTime.toISOString(),
      participants: updatedGroup.GroupParticipant.map((p: any) => ({
        ...p,
        status: 'cancelled',
        startTime: p.startTime.toISOString(),
        checkedInAt: p.checkedInAt?.toISOString(),
        consentSignedAt: p.consentSignedAt?.toISOString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: new Date().toISOString(),
      })),
      createdAt: updatedGroup.createdAt.toISOString(),
      updatedAt: updatedGroup.updatedAt.toISOString(),
    };

    return c.json({
      success: true,
      message: 'Group booking cancelled successfully',
      group: formattedGroup,
    });
  }
);

/**
 * List participants
 * GET /api/groups/:id/participants
 */
groupBookings.get(
  '/:id/participants',
  requirePermission('group:read'),
  zValidator('param', groupIdParamSchema),
  async (c) => {
    const { id } = c.req.valid('param');

    const group = await prisma.groupBooking.findUnique({
      where: { id },
      include: {
        GroupParticipant: true,
      },
    });

    if (!group) {
      throw APIError.notFound('Group booking');
    }

    const participants = group.GroupParticipant.map((p: any) => ({
      ...p,
      status: p.status.toLowerCase(),
      startTime: p.startTime.toISOString(),
      checkedInAt: p.checkedInAt?.toISOString(),
      consentSignedAt: p.consentSignedAt?.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    return c.json({
      success: true,
      participants,
      total: participants.length,
      confirmed: participants.filter((p: any) => p.status === 'confirmed').length,
      arrived: participants.filter((p: any) => p.status === 'arrived').length,
      completed: participants.filter((p: any) => p.status === 'completed').length,
    });
  }
);

/**
 * Add participant
 * POST /api/groups/:id/participants
 */
groupBookings.post(
  '/:id/participants',
  requirePermission('group:update'),
  zValidator('param', groupIdParamSchema),
  zValidator('json', addParticipantSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const group = await prisma.groupBooking.findUnique({
      where: { id },
      include: {
        GroupParticipant: {
          where: { status: { not: 'CANCELLED' } },
        },
      },
    });

    if (!group) {
      throw APIError.notFound('Group booking');
    }

    // Cannot add to cancelled or completed groups
    if (group.status === 'CANCELLED') {
      throw APIError.badRequest('Cannot add participants to cancelled group');
    }

    if (group.status === 'COMPLETED') {
      throw APIError.badRequest('Cannot add participants to completed group');
    }

    // Check max participants
    const activeParticipants = group.GroupParticipant.length;

    if (activeParticipants >= group.maxParticipants) {
      throw APIError.badRequest('Group has reached maximum participants');
    }

    // Check for conflicts
    const conflictCheck = await checkParticipantConflicts(
      group.id,
      data.providerId,
      data.roomId,
      data.startTime,
      data.duration
    );

    if (conflictCheck.hasConflict) {
      throw APIError.conflict(conflictCheck.message!);
    }

    const participantId = generateParticipantId();
    const participant = await prisma.groupParticipant.create({
      data: {
        id: participantId,
        groupId: group.id,
        patientId: data.patientId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        serviceId: data.serviceId,
        serviceName: data.serviceName,
        providerId: data.providerId,
        providerName: data.providerName,
        roomId: data.roomId,
        startTime: new Date(data.startTime),
        duration: data.duration,
        status: 'INVITED',
        amount: data.amount,
        paid: false,
        consentSigned: false,
        updatedAt: new Date(),
      },
    });

    // Recalculate group totals
    const allParticipants = await prisma.groupParticipant.findMany({
      where: { groupId: group.id, status: { not: 'CANCELLED' } },
    });

    const totalAmount = allParticipants.reduce((sum, p) => sum + p.amount, 0);
    const endTime = calculateEndTime(allParticipants.map(p => ({
      startTime: p.startTime.toISOString(),
      duration: p.duration,
    } as GroupParticipant)));

    await prisma.groupBooking.update({
      where: { id: group.id },
      data: {
        totalAmount,
        endTime: new Date(endTime),
        updatedAt: new Date(),
      },
    });

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'CREATE',
      resourceType: 'group_participant',
      resourceId: participantId,
      patientId: data.patientId,
      phiAccessed: true,
      ipAddress,
      metadata: {
        groupId: group.id,
        groupName: group.name,
      },
    });

    // Transform to API format
    const formattedParticipant = {
      ...participant,
      status: participant.status.toLowerCase(),
      startTime: participant.startTime.toISOString(),
      checkedInAt: participant.checkedInAt?.toISOString(),
      consentSignedAt: participant.consentSignedAt?.toISOString(),
      createdAt: participant.createdAt.toISOString(),
      updatedAt: participant.updatedAt.toISOString(),
    };

    return c.json({
      success: true,
      message: 'Participant added successfully',
      participant: formattedParticipant,
    }, 201);
  }
);

/**
 * Update participant
 * PUT /api/groups/:id/participants/:participantId
 */
groupBookings.put(
  '/:id/participants/:participantId',
  requirePermission('group:update'),
  zValidator('param', participantIdParamSchema),
  zValidator('json', updateParticipantSchema),
  async (c) => {
    const { id, participantId } = c.req.valid('param');
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const group = await prisma.groupBooking.findUnique({
      where: { id },
    });

    if (!group) {
      throw APIError.notFound('Group booking');
    }

    const participant = await prisma.groupParticipant.findUnique({
      where: { id: participantId },
    });

    if (!participant || participant.groupId !== id) {
      throw APIError.notFound('Participant');
    }

    // Cannot update cancelled participants (except status revert)
    if (participant.status === 'CANCELLED' && data.status !== 'invited') {
      throw APIError.badRequest('Cannot update cancelled participant');
    }

    // Validate status transition
    if (data.status && data.status !== participant.status.toLowerCase()) {
      const currentStatus = participant.status.toLowerCase() as ParticipantStatus;
      if (!isValidParticipantTransition(currentStatus, data.status)) {
        throw APIError.badRequest(
          `Invalid status transition from '${currentStatus}' to '${data.status}'`
        );
      }
    }

    // Check for conflicts if time/provider/room is changing
    if (data.startTime || data.providerId !== undefined || data.roomId !== undefined || data.duration) {
      const conflictCheck = await checkParticipantConflicts(
        group.id,
        data.providerId !== undefined ? data.providerId || undefined : participant.providerId || undefined,
        data.roomId !== undefined ? data.roomId || undefined : participant.roomId || undefined,
        data.startTime || participant.startTime.toISOString(),
        data.duration || participant.duration,
        participantId
      );

      if (conflictCheck.hasConflict) {
        throw APIError.conflict(conflictCheck.message!);
      }
    }

    // Build update data
    const updateData: Prisma.GroupParticipantUpdateInput = {
      updatedAt: new Date(),
    };

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.serviceId !== undefined) updateData.serviceId = data.serviceId;
    if (data.serviceName !== undefined) updateData.serviceName = data.serviceName;
    if (data.providerId !== undefined) updateData.providerId = data.providerId || null;
    if (data.providerName !== undefined) updateData.providerName = data.providerName || null;
    if (data.roomId !== undefined) updateData.roomId = data.roomId || null;
    if (data.startTime !== undefined) updateData.startTime = new Date(data.startTime);
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.paid !== undefined) updateData.paid = data.paid;
    if (data.paymentId !== undefined) updateData.paymentId = data.paymentId || null;
    if (data.status !== undefined) updateData.status = data.status.toUpperCase() as any;
    if (data.consentSigned !== undefined) {
      updateData.consentSigned = data.consentSigned;
      if (data.consentSigned) {
        updateData.consentSignedAt = new Date();
      }
    }

    const updatedParticipant = await prisma.groupParticipant.update({
      where: { id: participantId },
      data: updateData,
    });

    // Recalculate totals
    const allParticipants = await prisma.groupParticipant.findMany({
      where: { groupId: group.id, status: { not: 'CANCELLED' } },
    });

    const totalAmount = allParticipants.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = allParticipants.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
    const endTime = calculateEndTime(allParticipants.map(p => ({
      startTime: p.startTime.toISOString(),
      duration: p.duration,
    } as GroupParticipant)));

    await prisma.groupBooking.update({
      where: { id: group.id },
      data: {
        totalAmount,
        paidAmount,
        endTime: new Date(endTime),
        updatedAt: new Date(),
      },
    });

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'UPDATE',
      resourceType: 'group_participant',
      resourceId: participantId,
      patientId: updatedParticipant.patientId || undefined,
      phiAccessed: true,
      ipAddress,
      metadata: {
        groupId: group.id,
        updatedFields: Object.keys(data),
      },
    });

    // Transform to API format
    const formattedParticipant = {
      ...updatedParticipant,
      status: updatedParticipant.status.toLowerCase(),
      startTime: updatedParticipant.startTime.toISOString(),
      checkedInAt: updatedParticipant.checkedInAt?.toISOString(),
      consentSignedAt: updatedParticipant.consentSignedAt?.toISOString(),
      createdAt: updatedParticipant.createdAt.toISOString(),
      updatedAt: updatedParticipant.updatedAt.toISOString(),
    };

    return c.json({
      success: true,
      message: 'Participant updated successfully',
      participant: formattedParticipant,
    });
  }
);

/**
 * Remove participant
 * DELETE /api/groups/:id/participants/:participantId
 */
groupBookings.delete(
  '/:id/participants/:participantId',
  requirePermission('group:update'),
  zValidator('param', participantIdParamSchema),
  async (c) => {
    const { id, participantId } = c.req.valid('param');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const group = await prisma.groupBooking.findUnique({
      where: { id },
    });

    if (!group) {
      throw APIError.notFound('Group booking');
    }

    const participant = await prisma.groupParticipant.findUnique({
      where: { id: participantId },
    });

    if (!participant || participant.groupId !== id) {
      throw APIError.notFound('Participant');
    }

    // Mark as cancelled rather than removing
    const updatedParticipant = await prisma.groupParticipant.update({
      where: { id: participantId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });

    // Recalculate totals
    const allParticipants = await prisma.groupParticipant.findMany({
      where: { groupId: group.id, status: { not: 'CANCELLED' } },
    });

    const totalAmount = allParticipants.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = allParticipants.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);

    await prisma.groupBooking.update({
      where: { id: group.id },
      data: {
        totalAmount,
        paidAmount,
        updatedAt: new Date(),
      },
    });

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'DELETE',
      resourceType: 'group_participant',
      resourceId: participantId,
      patientId: updatedParticipant.patientId || undefined,
      phiAccessed: true,
      ipAddress,
      metadata: {
        groupId: group.id,
        groupName: group.name,
      },
    });

    // Transform to API format
    const formattedParticipant = {
      ...updatedParticipant,
      status: updatedParticipant.status.toLowerCase(),
      startTime: updatedParticipant.startTime.toISOString(),
      checkedInAt: updatedParticipant.checkedInAt?.toISOString(),
      consentSignedAt: updatedParticipant.consentSignedAt?.toISOString(),
      createdAt: updatedParticipant.createdAt.toISOString(),
      updatedAt: updatedParticipant.updatedAt.toISOString(),
    };

    return c.json({
      success: true,
      message: 'Participant removed successfully',
      participant: formattedParticipant,
    });
  }
);

/**
 * Check in entire group
 * POST /api/groups/:id/check-in
 */
groupBookings.post(
  '/:id/check-in',
  requirePermission('group:update'),
  zValidator('param', groupIdParamSchema),
  zValidator('json', checkInSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const group = await prisma.groupBooking.findUnique({
      where: { id },
      include: {
        GroupParticipant: true,
      },
    });

    if (!group) {
      throw APIError.notFound('Group booking');
    }

    if (group.status === 'CANCELLED') {
      throw APIError.badRequest('Cannot check in cancelled group');
    }

    if (group.status === 'COMPLETED') {
      throw APIError.badRequest('Group is already completed');
    }

    const now = new Date();
    const checkedIn: string[] = [];
    const skipped: string[] = [];

    for (const participant of group.GroupParticipant) {
      // If specific IDs provided, only check in those
      if (data.participantIds && !data.participantIds.includes(participant.id)) {
        continue;
      }

      // Only check in confirmed participants
      if (participant.status === 'CONFIRMED') {
        await prisma.groupParticipant.update({
          where: { id: participant.id },
          data: {
            status: 'ARRIVED',
            checkedInAt: now,
            updatedAt: now,
          },
        });
        checkedIn.push(participant.id);
      } else {
        skipped.push(participant.id);
      }
    }

    // Update group status if all participants checked in
    const confirmedCount = await prisma.groupParticipant.count({
      where: {
        groupId: id,
        status: 'CONFIRMED',
      },
    });

    if (confirmedCount === 0 && group.status === 'CONFIRMED') {
      await prisma.groupBooking.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS',
          updatedAt: now,
        },
      });
    } else {
      await prisma.groupBooking.update({
        where: { id },
        data: {
          updatedAt: now,
        },
      });
    }

    // Get updated group
    const updatedGroup = await prisma.groupBooking.findUnique({
      where: { id },
      include: {
        GroupParticipant: true,
      },
    });

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'UPDATE',
      resourceType: 'group_booking',
      resourceId: id,
      phiAccessed: true,
      ipAddress,
      metadata: {
        action: 'check_in',
        checkedIn,
        skipped,
      },
    });

    // Transform to API format
    const formattedGroup = updatedGroup ? {
      ...updatedGroup,
      type: updatedGroup.type.toLowerCase(),
      status: updatedGroup.status.toLowerCase(),
      paymentType: updatedGroup.paymentType.toLowerCase(),
      startTime: updatedGroup.startTime.toISOString(),
      endTime: updatedGroup.endTime.toISOString(),
      participants: updatedGroup.GroupParticipant.map((p: any) => ({
        ...p,
        status: p.status.toLowerCase(),
        startTime: p.startTime.toISOString(),
        checkedInAt: p.checkedInAt?.toISOString(),
        consentSignedAt: p.consentSignedAt?.toISOString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      createdAt: updatedGroup.createdAt.toISOString(),
      updatedAt: updatedGroup.updatedAt.toISOString(),
    } : null;

    return c.json({
      success: true,
      message: `Checked in ${checkedIn.length} participant(s)`,
      checkedIn,
      skipped,
      group: formattedGroup,
    });
  }
);

/**
 * Check in individual participant
 * POST /api/groups/:id/participants/:participantId/check-in
 */
groupBookings.post(
  '/:id/participants/:participantId/check-in',
  requirePermission('group:update'),
  zValidator('param', participantIdParamSchema),
  async (c) => {
    const { id, participantId } = c.req.valid('param');
    const user = c.get('user');
    const ipAddress = getClientIP(c);

    const group = await prisma.groupBooking.findUnique({
      where: { id },
    });

    if (!group) {
      throw APIError.notFound('Group booking');
    }

    if (group.status === 'CANCELLED') {
      throw APIError.badRequest('Cannot check in participant for cancelled group');
    }

    const participant = await prisma.groupParticipant.findUnique({
      where: { id: participantId },
    });

    if (!participant || participant.groupId !== id) {
      throw APIError.notFound('Participant');
    }

    if (participant.status === 'CANCELLED') {
      throw APIError.badRequest('Cannot check in cancelled participant');
    }

    if (participant.status === 'ARRIVED' || participant.status === 'IN_PROGRESS' || participant.status === 'COMPLETED') {
      throw APIError.badRequest(`Participant is already ${participant.status.toLowerCase()}`);
    }

    if (participant.status !== 'CONFIRMED') {
      throw APIError.badRequest('Participant must be confirmed before check-in');
    }

    const now = new Date();
    const updatedParticipant = await prisma.groupParticipant.update({
      where: { id: participantId },
      data: {
        status: 'ARRIVED',
        checkedInAt: now,
        updatedAt: now,
      },
    });

    await prisma.groupBooking.update({
      where: { id },
      data: {
        updatedAt: now,
      },
    });

    // Log audit event
    await logAuditEvent({
      userId: user?.uid,
      action: 'UPDATE',
      resourceType: 'group_participant',
      resourceId: participantId,
      patientId: updatedParticipant.patientId || undefined,
      phiAccessed: true,
      ipAddress,
      metadata: {
        groupId: group.id,
        action: 'check_in',
      },
    });

    // Transform to API format
    const formattedParticipant = {
      ...updatedParticipant,
      status: updatedParticipant.status.toLowerCase(),
      startTime: updatedParticipant.startTime.toISOString(),
      checkedInAt: updatedParticipant.checkedInAt?.toISOString(),
      consentSignedAt: updatedParticipant.consentSignedAt?.toISOString(),
      createdAt: updatedParticipant.createdAt.toISOString(),
      updatedAt: updatedParticipant.updatedAt.toISOString(),
    };

    return c.json({
      success: true,
      message: 'Participant checked in successfully',
      participant: formattedParticipant,
    });
  }
);

// ===================
// Exports for Testing
// ===================

export async function clearStores() {
  // Clear all group bookings and participants from database
  await prisma.groupParticipant.deleteMany({});
  await prisma.groupBooking.deleteMany({});
}

export async function addMockGroup(group: any) {
  // Create group booking in database
  const { participants, ...groupData } = group;

  await prisma.groupBooking.create({
    data: {
      ...groupData,
      type: groupData.type.toUpperCase(),
      status: groupData.status.toUpperCase(),
      paymentType: groupData.paymentType.toUpperCase(),
      startTime: new Date(groupData.startTime),
      endTime: new Date(groupData.endTime),
      createdAt: new Date(groupData.createdAt),
      updatedAt: new Date(groupData.updatedAt),
    },
  });

  // Create participants if provided
  if (participants && participants.length > 0) {
    await prisma.groupParticipant.createMany({
      data: participants.map((p: any) => ({
        ...p,
        status: p.status.toUpperCase(),
        startTime: new Date(p.startTime),
        checkedInAt: p.checkedInAt ? new Date(p.checkedInAt) : null,
        consentSignedAt: p.consentSignedAt ? new Date(p.consentSignedAt) : null,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      })),
    });
  }
}

export async function getMockGroup(id: string): Promise<any> {
  const group = await prisma.groupBooking.findUnique({
    where: { id },
    include: {
      GroupParticipant: true,
    },
  });

  if (!group) {
    return undefined;
  }

  // Transform to API format
  return {
    ...group,
    type: group.type.toLowerCase(),
    status: group.status.toLowerCase(),
    paymentType: group.paymentType.toLowerCase(),
    startTime: group.startTime.toISOString(),
    endTime: group.endTime.toISOString(),
    participants: group.GroupParticipant.map((p: any) => ({
      ...p,
      status: p.status.toLowerCase(),
      startTime: p.startTime.toISOString(),
      checkedInAt: p.checkedInAt?.toISOString(),
      consentSignedAt: p.consentSignedAt?.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
  };
}

export async function getGroupByInviteCode(code: string): Promise<any> {
  const group = await prisma.groupBooking.findUnique({
    where: { inviteCode: code.toUpperCase() },
    include: {
      GroupParticipant: true,
    },
  });

  if (!group) {
    return undefined;
  }

  // Transform to API format
  return {
    ...group,
    type: group.type.toLowerCase(),
    status: group.status.toLowerCase(),
    paymentType: group.paymentType.toLowerCase(),
    startTime: group.startTime.toISOString(),
    endTime: group.endTime.toISOString(),
    participants: group.GroupParticipant.map((p: any) => ({
      ...p,
      status: p.status.toLowerCase(),
      startTime: p.startTime.toISOString(),
      checkedInAt: p.checkedInAt?.toISOString(),
      consentSignedAt: p.consentSignedAt?.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
    createdAt: group.createdAt.toISOString(),
    updatedAt: group.updatedAt.toISOString(),
  };
}

export default groupBookings;
