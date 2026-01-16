/**
 * Memberships API Routes
 *
 * Full CRUD operations for membership management with:
 * - Membership tier management
 * - Patient enrollment
 * - Benefits tracking
 * - Pause/Resume/Cancel functionality
 * - Service redemption
 * - Audit logging
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import crypto from 'crypto';
import { sessionAuthMiddleware, optionalSessionAuthMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const memberships = new Hono();

// ===================
// Validation Schemas
// ===================

// Membership tier levels
const tierLevelSchema = z.enum(['bronze', 'silver', 'gold', 'platinum', 'vip']);

// Billing cycle
const billingCycleSchema = z.enum(['monthly', 'quarterly', 'annual']);

// Membership status
const membershipStatusSchema = z.enum(['active', 'paused', 'cancelled', 'past_due', 'expired']);

// Included service schema
const includedServiceSchema = z.object({
  serviceId: z.string().min(1),
  serviceName: z.string().min(1).max(255),
  quantity: z.number().int().positive(),
});

// Benefits schema
const benefitsSchema = z.object({
  discountPercentage: z.number().min(0).max(100).default(0),
  includedServices: z.array(includedServiceSchema).default([]),
  productDiscount: z.number().min(0).max(100).default(0),
  priorityBooking: z.boolean().default(false),
  guestPasses: z.number().int().min(0).default(0),
  perks: z.array(z.string()).default([]),
});

// Create membership tier schema
const createTierSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  tier: tierLevelSchema,
  imageUrl: z.string().url().optional(),
  billingCycle: billingCycleSchema,
  price: z.number().int().positive(),
  setupFee: z.number().int().min(0).default(0),
  benefits: benefitsSchema,
  minimumTermMonths: z.number().int().min(0).default(0),
  cancellationNoticeDays: z.number().int().min(0).default(30),
  isActive: z.boolean().default(true),
  acceptingNewMembers: z.boolean().default(true),
  displayOrder: z.number().int().min(0).default(0),
});

// Update membership tier schema
const updateTierSchema = createTierSchema.partial();

// Enroll patient schema
const enrollPatientSchema = z.object({
  patientId: z.string().uuid(),
  paymentMethodId: z.string().optional(),
  startDate: z.string().optional(), // ISO date string, defaults to now
});

// Update patient membership schema
const updateMembershipSchema = z.object({
  tierId: z.string().uuid().optional(), // For upgrade/downgrade
  paymentMethodId: z.string().optional(),
});

// Tier ID param schema
const tierIdSchema = z.object({
  id: z.string().uuid(),
});

// Patient ID param schema
const patientIdSchema = z.object({
  patientId: z.string().uuid(),
});

// Redeem benefit schema
const redeemBenefitSchema = z.object({
  serviceId: z.string().min(1),
  appointmentId: z.string().uuid().optional(),
});

// Helper to parse boolean query params properly
const booleanQuerySchema = z.preprocess(
  (val) => val === 'true' || val === '1' || val === true,
  z.boolean()
);

// List tiers query schema
const listTiersSchema = z.object({
  activeOnly: booleanQuerySchema.optional().default(true),
  acceptingNew: booleanQuerySchema.optional(),
});

// ===================
// Type Definitions (now from Prisma)
// ===================

export type MembershipTier = Prisma.MembershipTierGetPayload<{}>;
export type PatientMembership = Prisma.PatientMembershipGetPayload<{
  include: { MembershipTier: true; BenefitRedemption: true };
}>;
export type BenefitRedemption = Prisma.BenefitRedemptionGetPayload<{}>;

// ===================
// Helper Functions
// ===================

function generateId(): string {
  return crypto.randomUUID();
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

function calculatePeriodEnd(start: Date, billingCycle: 'monthly' | 'quarterly' | 'annual'): Date {
  const end = new Date(start);
  switch (billingCycle) {
    case 'monthly':
      end.setMonth(end.getMonth() + 1);
      break;
    case 'quarterly':
      end.setMonth(end.getMonth() + 3);
      break;
    case 'annual':
      end.setFullYear(end.getFullYear() + 1);
      break;
  }
  return end;
}

function initializeBenefits(tier: MembershipTier) {
  const benefits = tier.benefits as any;
  return benefits.includedServices.map((service: any) => ({
    serviceId: service.serviceId,
    serviceName: service.serviceName,
    quantityIncluded: service.quantity,
    quantityUsed: 0,
    quantityRemaining: service.quantity,
  }));
}

async function getPatientActiveMembership(patientId: string) {
  return await prisma.patientMembership.findFirst({
    where: {
      patientId,
      status: { in: ['ACTIVE', 'PAUSED'] },
    },
    include: {
      MembershipTier: true,
      BenefitRedemption: true,
    },
  });
}

// ===================
// Public Routes (no auth required)
// ===================

/**
 * List membership tiers (public)
 * GET /api/memberships
 */
memberships.get('/', optionalSessionAuthMiddleware, zValidator('query', listTiersSchema), async (c) => {
  const { activeOnly, acceptingNew } = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    // Build where clause
    const where: Prisma.MembershipTierWhereInput = {};

    // For public access, only show active tiers
    // For authenticated users, can optionally show all if activeOnly=false
    const shouldFilterActive = !user || activeOnly === true;
    if (shouldFilterActive) {
      where.isActive = true;
    }

    if (acceptingNew !== undefined) {
      where.acceptingNewMembers = acceptingNew;
    }

    const tiers = await prisma.membershipTier.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
    });

    if (user) {
      await logAuditEvent({
        userId: user.uid,
        action: 'READ',
        resourceType: 'membership_tier_list',
        ipAddress,
        metadata: { resultCount: tiers.length },
      });
    }

    return c.json({
      items: tiers.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        tier: t.tier.toLowerCase(),
        imageUrl: t.imageUrl,
        billingCycle: t.billingCycle.toLowerCase(),
        price: t.price,
        setupFee: t.setupFee,
        benefits: t.benefits,
        minimumTermMonths: t.minimumTermMonths,
        cancellationNoticeDays: t.cancellationNoticeDays,
        isActive: t.isActive,
        acceptingNewMembers: t.acceptingNewMembers,
        displayOrder: t.displayOrder,
      })),
      total: tiers.length,
    });
  } catch (error) {
    console.error('Error listing membership tiers:', error);
    throw APIError.internal('Failed to list membership tiers');
  }
});

/**
 * Get single membership tier
 * GET /api/memberships/:id
 */
memberships.get('/:id', optionalSessionAuthMiddleware, zValidator('param', tierIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const tier = await prisma.membershipTier.findUnique({
      where: { id },
    });

    if (!tier) {
      throw APIError.notFound('Membership tier');
    }

    // Non-authenticated users can only see active tiers
    if (!tier.isActive && !user) {
      throw APIError.notFound('Membership tier');
    }

    if (user) {
      await logAuditEvent({
        userId: user.uid,
        action: 'READ',
        resourceType: 'membership_tier',
        resourceId: id,
        ipAddress,
      });
    }

    return c.json({
      tier: {
        id: tier.id,
        name: tier.name,
        description: tier.description,
        tier: tier.tier.toLowerCase(),
        imageUrl: tier.imageUrl,
        billingCycle: tier.billingCycle.toLowerCase(),
        price: tier.price,
        setupFee: tier.setupFee,
        benefits: tier.benefits,
        minimumTermMonths: tier.minimumTermMonths,
        cancellationNoticeDays: tier.cancellationNoticeDays,
        isActive: tier.isActive,
        acceptingNewMembers: tier.acceptingNewMembers,
        displayOrder: tier.displayOrder,
        createdAt: tier.createdAt.toISOString(),
        updatedAt: tier.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error fetching membership tier:', error);
    throw APIError.internal('Failed to fetch membership tier');
  }
});

// ===================
// Protected Routes (auth required)
// ===================

// Apply auth middleware to all subsequent routes
memberships.use('/*', sessionAuthMiddleware);

/**
 * Create membership tier (admin only)
 * POST /api/memberships
 */
memberships.post('/', zValidator('json', createTierSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Check admin permission
  if (!user.role || !['admin', 'owner'].includes(user.role)) {
    throw APIError.forbidden('Only administrators can create membership tiers');
  }

  try {
    const tier = await prisma.membershipTier.create({
      data: {
        id: generateId(),
        name: data.name,
        description: data.description,
        tier: data.tier.toUpperCase() as any,
        imageUrl: data.imageUrl,
        billingCycle: data.billingCycle.toUpperCase() as any,
        price: data.price,
        setupFee: data.setupFee,
        benefits: data.benefits as any,
        minimumTermMonths: data.minimumTermMonths,
        cancellationNoticeDays: data.cancellationNoticeDays,
        isActive: data.isActive,
        acceptingNewMembers: data.acceptingNewMembers,
        displayOrder: data.displayOrder,
        updatedAt: new Date(),
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'membership_tier',
      resourceId: tier.id,
      ipAddress,
      metadata: { tierName: tier.name, tierLevel: tier.tier },
    });

    return c.json({
      tier: {
        ...tier,
        tier: tier.tier.toLowerCase(),
        billingCycle: tier.billingCycle.toLowerCase(),
        createdAt: tier.createdAt.toISOString(),
        updatedAt: tier.updatedAt.toISOString(),
      },
      message: 'Membership tier created successfully',
    }, 201);
  } catch (error) {
    console.error('Error creating membership tier:', error);
    throw APIError.internal('Failed to create membership tier');
  }
});

/**
 * Update membership tier
 * PUT /api/memberships/:id
 */
memberships.put('/:id', zValidator('param', tierIdSchema), zValidator('json', updateTierSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Check admin permission
  if (!user.role || !['admin', 'owner'].includes(user.role)) {
    throw APIError.forbidden('Only administrators can update membership tiers');
  }

  try {
    const tier = await prisma.membershipTier.findUnique({ where: { id } });

    if (!tier) {
      throw APIError.notFound('Membership tier');
    }

    const updateData: Prisma.MembershipTierUpdateInput = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.tier !== undefined) updateData.tier = data.tier.toUpperCase() as any;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.billingCycle !== undefined) updateData.billingCycle = data.billingCycle.toUpperCase() as any;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.setupFee !== undefined) updateData.setupFee = data.setupFee;
    if (data.benefits !== undefined) updateData.benefits = data.benefits as any;
    if (data.minimumTermMonths !== undefined) updateData.minimumTermMonths = data.minimumTermMonths;
    if (data.cancellationNoticeDays !== undefined) updateData.cancellationNoticeDays = data.cancellationNoticeDays;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.acceptingNewMembers !== undefined) updateData.acceptingNewMembers = data.acceptingNewMembers;
    if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;

    const updatedTier = await prisma.membershipTier.update({
      where: { id },
      data: updateData,
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'membership_tier',
      resourceId: id,
      ipAddress,
      metadata: { updatedFields: Object.keys(data) },
    });

    return c.json({
      tier: {
        ...updatedTier,
        tier: updatedTier.tier.toLowerCase(),
        billingCycle: updatedTier.billingCycle.toLowerCase(),
        createdAt: updatedTier.createdAt.toISOString(),
        updatedAt: updatedTier.updatedAt.toISOString(),
      },
      message: 'Membership tier updated successfully',
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error updating membership tier:', error);
    throw APIError.internal('Failed to update membership tier');
  }
});

/**
 * Deactivate membership tier (soft delete)
 * DELETE /api/memberships/:id
 */
memberships.delete('/:id', zValidator('param', tierIdSchema), async (c) => {
  const { id } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Check admin permission
  if (!user.role || !['admin', 'owner'].includes(user.role)) {
    throw APIError.forbidden('Only administrators can deactivate membership tiers');
  }

  try {
    const tier = await prisma.membershipTier.findUnique({ where: { id } });

    if (!tier) {
      throw APIError.notFound('Membership tier');
    }

    // Soft delete - mark as inactive and not accepting new members
    await prisma.membershipTier.update({
      where: { id },
      data: {
        isActive: false,
        acceptingNewMembers: false,
        updatedAt: new Date(),
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'DELETE',
      resourceType: 'membership_tier',
      resourceId: id,
      ipAddress,
    });

    return c.json({
      success: true,
      message: 'Membership tier deactivated successfully',
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error deactivating membership tier:', error);
    throw APIError.internal('Failed to deactivate membership tier');
  }
});

/**
 * Enroll patient in membership
 * POST /api/memberships/:id/enroll
 */
memberships.post('/:id/enroll', zValidator('param', tierIdSchema), zValidator('json', enrollPatientSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const tier = await prisma.membershipTier.findUnique({ where: { id } });

    if (!tier) {
      throw APIError.notFound('Membership tier');
    }

    if (!tier.isActive) {
      throw APIError.badRequest('This membership tier is no longer active');
    }

    if (!tier.acceptingNewMembers) {
      throw APIError.badRequest('This membership tier is not accepting new members');
    }

    // Check if patient already has an active membership
    const existingMembership = await getPatientActiveMembership(data.patientId);
    if (existingMembership) {
      throw APIError.conflict('Patient already has an active membership. Please cancel or upgrade their existing membership.');
    }

    const now = data.startDate ? new Date(data.startDate) : new Date();
    const billingCycle = tier.billingCycle.toLowerCase() as 'monthly' | 'quarterly' | 'annual';
    const periodEnd = calculatePeriodEnd(now, billingCycle);

    const membership = await prisma.patientMembership.create({
      data: {
        id: generateId(),
        patientId: data.patientId,
        tierId: tier.id,
        tierName: tier.name,
        enrolledAt: now,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        nextBillingDate: periodEnd,
        status: 'ACTIVE',
        currentPeriodBenefits: initializeBenefits(tier) as any,
        paymentMethodId: data.paymentMethodId,
        lastPaymentDate: now,
        lastPaymentAmount: tier.price + tier.setupFee,
        createdBy: user.uid,
        updatedAt: now,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'patient_membership',
      resourceId: membership.id,
      ipAddress,
      metadata: {
        patientId: data.patientId,
        tierId: tier.id,
        tierName: tier.name,
      },
    });

    return c.json({
      membership: {
        ...membership,
        status: membership.status.toLowerCase(),
        enrolledAt: membership.enrolledAt.toISOString(),
        currentPeriodStart: membership.currentPeriodStart.toISOString(),
        currentPeriodEnd: membership.currentPeriodEnd.toISOString(),
        nextBillingDate: membership.nextBillingDate?.toISOString(),
        lastPaymentDate: membership.lastPaymentDate?.toISOString(),
        createdAt: membership.createdAt.toISOString(),
        updatedAt: membership.updatedAt.toISOString(),
      },
      message: 'Patient enrolled successfully',
    }, 201);
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error enrolling patient:', error);
    throw APIError.internal('Failed to enroll patient');
  }
});

/**
 * Get patient's active membership
 * GET /api/patients/:patientId/membership
 */
memberships.get('/patients/:patientId/membership', zValidator('param', patientIdSchema), async (c) => {
  const { patientId } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const membership = await getPatientActiveMembership(patientId);

    if (!membership) {
      throw APIError.notFound('Patient membership');
    }

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'patient_membership',
      resourceId: membership.id,
      ipAddress,
      metadata: { patientId },
    });

    return c.json({
      membership: {
        ...membership,
        status: membership.status.toLowerCase(),
        enrolledAt: membership.enrolledAt.toISOString(),
        currentPeriodStart: membership.currentPeriodStart.toISOString(),
        currentPeriodEnd: membership.currentPeriodEnd.toISOString(),
        nextBillingDate: membership.nextBillingDate?.toISOString(),
        pausedAt: membership.pausedAt?.toISOString(),
        cancelledAt: membership.cancelledAt?.toISOString(),
        lastPaymentDate: membership.lastPaymentDate?.toISOString(),
        createdAt: membership.createdAt.toISOString(),
        updatedAt: membership.updatedAt.toISOString(),
      },
      tier: membership.MembershipTier ? {
        id: membership.MembershipTier.id,
        name: membership.MembershipTier.name,
        tier: membership.MembershipTier.tier.toLowerCase(),
        billingCycle: membership.MembershipTier.billingCycle.toLowerCase(),
        price: membership.MembershipTier.price,
        benefits: membership.MembershipTier.benefits,
      } : null,
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error fetching patient membership:', error);
    throw APIError.internal('Failed to fetch patient membership');
  }
});

/**
 * Update patient membership (upgrade/downgrade)
 * PUT /api/patients/:patientId/membership
 */
memberships.put('/patients/:patientId/membership', zValidator('param', patientIdSchema), zValidator('json', updateMembershipSchema), async (c) => {
  const { patientId } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const membership = await getPatientActiveMembership(patientId);

    if (!membership) {
      throw APIError.notFound('Patient membership');
    }

    const updateData: Prisma.PatientMembershipUpdateInput = {
      updatedAt: new Date(),
    };

    // Handle tier upgrade/downgrade
    if (data.tierId && data.tierId !== membership.tierId) {
      const newTier = await prisma.membershipTier.findUnique({
        where: { id: data.tierId },
      });

      if (!newTier) {
        throw APIError.notFound('New membership tier');
      }

      if (!newTier.isActive || !newTier.acceptingNewMembers) {
        throw APIError.badRequest('The selected membership tier is not available');
      }

      updateData.MembershipTier = {
        connect: { id: newTier.id }
      };
      updateData.tierName = newTier.name;
      updateData.currentPeriodBenefits = initializeBenefits(newTier) as any;
    }

    // Update payment method if provided
    if (data.paymentMethodId !== undefined) {
      updateData.paymentMethodId = data.paymentMethodId;
    }

    const updatedMembership = await prisma.patientMembership.update({
      where: { id: membership.id },
      data: updateData,
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'patient_membership',
      resourceId: membership.id,
      ipAddress,
      metadata: {
        patientId,
        updatedFields: Object.keys(data),
        newTierId: data.tierId,
      },
    });

    return c.json({
      membership: {
        ...updatedMembership,
        status: updatedMembership.status.toLowerCase(),
        enrolledAt: updatedMembership.enrolledAt.toISOString(),
        currentPeriodStart: updatedMembership.currentPeriodStart.toISOString(),
        currentPeriodEnd: updatedMembership.currentPeriodEnd.toISOString(),
        nextBillingDate: updatedMembership.nextBillingDate?.toISOString(),
        pausedAt: updatedMembership.pausedAt?.toISOString(),
        cancelledAt: updatedMembership.cancelledAt?.toISOString(),
        lastPaymentDate: updatedMembership.lastPaymentDate?.toISOString(),
        createdAt: updatedMembership.createdAt.toISOString(),
        updatedAt: updatedMembership.updatedAt.toISOString(),
      },
      message: 'Membership updated successfully',
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error updating patient membership:', error);
    throw APIError.internal('Failed to update patient membership');
  }
});

/**
 * Cancel patient membership
 * POST /api/patients/:patientId/membership/cancel
 */
memberships.post('/patients/:patientId/membership/cancel', zValidator('param', patientIdSchema), async (c) => {
  const { patientId } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const membership = await getPatientActiveMembership(patientId);

    if (!membership) {
      throw APIError.notFound('Patient membership');
    }

    if (membership.status === 'CANCELLED') {
      throw APIError.badRequest('Membership is already cancelled');
    }

    const now = new Date();
    const updatedMembership = await prisma.patientMembership.update({
      where: { id: membership.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: now,
        nextBillingDate: null,
        updatedAt: now,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'patient_membership',
      resourceId: membership.id,
      ipAddress,
      metadata: {
        patientId,
        action: 'cancel',
      },
    });

    return c.json({
      membership: {
        ...updatedMembership,
        status: updatedMembership.status.toLowerCase(),
        enrolledAt: updatedMembership.enrolledAt.toISOString(),
        currentPeriodStart: updatedMembership.currentPeriodStart.toISOString(),
        currentPeriodEnd: updatedMembership.currentPeriodEnd.toISOString(),
        cancelledAt: updatedMembership.cancelledAt?.toISOString(),
        lastPaymentDate: updatedMembership.lastPaymentDate?.toISOString(),
        createdAt: updatedMembership.createdAt.toISOString(),
        updatedAt: updatedMembership.updatedAt.toISOString(),
      },
      message: 'Membership cancelled successfully',
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error cancelling membership:', error);
    throw APIError.internal('Failed to cancel membership');
  }
});

/**
 * Pause patient membership
 * POST /api/patients/:patientId/membership/pause
 */
memberships.post('/patients/:patientId/membership/pause', zValidator('param', patientIdSchema), async (c) => {
  const { patientId } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const membership = await getPatientActiveMembership(patientId);

    if (!membership) {
      throw APIError.notFound('Patient membership');
    }

    if (membership.status === 'PAUSED') {
      throw APIError.badRequest('Membership is already paused');
    }

    if (membership.status !== 'ACTIVE') {
      throw APIError.badRequest('Only active memberships can be paused');
    }

    const now = new Date();
    const updatedMembership = await prisma.patientMembership.update({
      where: { id: membership.id },
      data: {
        status: 'PAUSED',
        pausedAt: now,
        updatedAt: now,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'patient_membership',
      resourceId: membership.id,
      ipAddress,
      metadata: {
        patientId,
        action: 'pause',
      },
    });

    return c.json({
      membership: {
        ...updatedMembership,
        status: updatedMembership.status.toLowerCase(),
        enrolledAt: updatedMembership.enrolledAt.toISOString(),
        currentPeriodStart: updatedMembership.currentPeriodStart.toISOString(),
        currentPeriodEnd: updatedMembership.currentPeriodEnd.toISOString(),
        nextBillingDate: updatedMembership.nextBillingDate?.toISOString(),
        pausedAt: updatedMembership.pausedAt?.toISOString(),
        lastPaymentDate: updatedMembership.lastPaymentDate?.toISOString(),
        createdAt: updatedMembership.createdAt.toISOString(),
        updatedAt: updatedMembership.updatedAt.toISOString(),
      },
      message: 'Membership paused successfully',
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error pausing membership:', error);
    throw APIError.internal('Failed to pause membership');
  }
});

/**
 * Resume patient membership
 * POST /api/patients/:patientId/membership/resume
 */
memberships.post('/patients/:patientId/membership/resume', zValidator('param', patientIdSchema), async (c) => {
  const { patientId } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const membership = await prisma.patientMembership.findFirst({
      where: {
        patientId,
        status: 'PAUSED',
      },
      include: {
        MembershipTier: true,
      },
    });

    if (!membership) {
      throw APIError.notFound('Paused patient membership');
    }

    const now = new Date();
    const tier = membership.MembershipTier;
    const billingCycle = tier.billingCycle.toLowerCase() as 'monthly' | 'quarterly' | 'annual';
    const periodEnd = calculatePeriodEnd(now, billingCycle);

    const updatedMembership = await prisma.patientMembership.update({
      where: { id: membership.id },
      data: {
        status: 'ACTIVE',
        pausedAt: null,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        nextBillingDate: periodEnd,
        currentPeriodBenefits: initializeBenefits(tier) as any,
        updatedAt: now,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'patient_membership',
      resourceId: membership.id,
      ipAddress,
      metadata: {
        patientId,
        action: 'resume',
      },
    });

    return c.json({
      membership: {
        ...updatedMembership,
        status: updatedMembership.status.toLowerCase(),
        enrolledAt: updatedMembership.enrolledAt.toISOString(),
        currentPeriodStart: updatedMembership.currentPeriodStart.toISOString(),
        currentPeriodEnd: updatedMembership.currentPeriodEnd.toISOString(),
        nextBillingDate: updatedMembership.nextBillingDate?.toISOString(),
        lastPaymentDate: updatedMembership.lastPaymentDate?.toISOString(),
        createdAt: updatedMembership.createdAt.toISOString(),
        updatedAt: updatedMembership.updatedAt.toISOString(),
      },
      message: 'Membership resumed successfully',
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error resuming membership:', error);
    throw APIError.internal('Failed to resume membership');
  }
});

/**
 * Get available benefits for patient membership
 * GET /api/patients/:patientId/membership/benefits
 */
memberships.get('/patients/:patientId/membership/benefits', zValidator('param', patientIdSchema), async (c) => {
  const { patientId } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const membership = await getPatientActiveMembership(patientId);

    if (!membership) {
      throw APIError.notFound('Patient membership');
    }

    const tier = membership.MembershipTier;
    const benefits = tier.benefits as any;

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'patient_membership_benefits',
      resourceId: membership.id,
      ipAddress,
      metadata: { patientId },
    });

    return c.json({
      membershipId: membership.id,
      status: membership.status.toLowerCase(),
      currentPeriodStart: membership.currentPeriodStart.toISOString(),
      currentPeriodEnd: membership.currentPeriodEnd.toISOString(),
      includedServices: membership.currentPeriodBenefits,
      discountPercentage: benefits?.discountPercentage || 0,
      productDiscount: benefits?.productDiscount || 0,
      priorityBooking: benefits?.priorityBooking || false,
      guestPasses: benefits?.guestPasses || 0,
      perks: benefits?.perks || [],
    });
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error fetching membership benefits:', error);
    throw APIError.internal('Failed to fetch membership benefits');
  }
});

/**
 * Redeem included service
 * POST /api/patients/:patientId/membership/redeem
 */
memberships.post('/patients/:patientId/membership/redeem', zValidator('param', patientIdSchema), zValidator('json', redeemBenefitSchema), async (c) => {
  const { patientId } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const membership = await getPatientActiveMembership(patientId);

    if (!membership) {
      throw APIError.notFound('Patient membership');
    }

    if (membership.status !== 'ACTIVE') {
      throw APIError.badRequest('Benefits can only be redeemed on active memberships');
    }

    // Find the service benefit
    const benefits = membership.currentPeriodBenefits as any;
    const benefitIndex = benefits.findIndex(
      (b: any) => b.serviceId === data.serviceId
    );

    if (benefitIndex === -1) {
      throw APIError.badRequest('Service is not included in this membership tier');
    }

    const benefit = benefits[benefitIndex];

    if (benefit.quantityRemaining <= 0) {
      throw APIError.badRequest('No remaining uses for this service in the current period');
    }

    // Create redemption record
    const redemption = await prisma.benefitRedemption.create({
      data: {
        id: generateId(),
        membershipId: membership.id,
        patientId,
        serviceId: data.serviceId,
        serviceName: benefit.serviceName,
        appointmentId: data.appointmentId,
        redeemedAt: new Date(),
        redeemedBy: user.uid,
      },
    });

    // Update benefit counts
    benefits[benefitIndex] = {
      ...benefit,
      quantityUsed: benefit.quantityUsed + 1,
      quantityRemaining: benefit.quantityRemaining - 1,
    };

    await prisma.patientMembership.update({
      where: { id: membership.id },
      data: {
        currentPeriodBenefits: benefits as any,
        updatedAt: new Date(),
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'benefit_redemption',
      resourceId: redemption.id,
      ipAddress,
      metadata: {
        patientId,
        membershipId: membership.id,
        serviceId: data.serviceId,
        appointmentId: data.appointmentId,
      },
    });

    return c.json({
      redemption: {
        id: redemption.id,
        membershipId: redemption.membershipId,
        serviceId: redemption.serviceId,
        serviceName: redemption.serviceName,
        appointmentId: redemption.appointmentId,
        redeemedAt: redemption.redeemedAt.toISOString(),
      },
      benefit: benefits[benefitIndex],
      message: 'Service redeemed successfully',
    }, 201);
  } catch (error) {
    if (error instanceof APIError) throw error;
    console.error('Error redeeming benefit:', error);
    throw APIError.internal('Failed to redeem benefit');
  }
});

// ===================
// Export Functions (for testing)
// ===================

export async function clearStores() {
  await prisma.$transaction([
    prisma.benefitRedemption.deleteMany({}),
    prisma.patientMembership.deleteMany({}),
    prisma.membershipTier.deleteMany({}),
  ]);
}

export function getPrismaClient() {
  return prisma;
}

export default memberships;
