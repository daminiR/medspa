/**
 * Quick Replies API Routes
 *
 * Handles CRUD operations for quick reply templates used in messaging.
 * Quick replies are short, pre-written responses for common scenarios.
 *
 * Features:
 * - System-provided defaults
 * - Custom user-created replies
 * - Category organization
 * - Usage tracking
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { sessionAuthMiddleware, requireRole } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const quickReplies = new Hono();

// =============================================================================
// Validation Schemas
// =============================================================================

const createQuickReplySchema = z.object({
  category: z.string().min(1).max(50),
  content: z.string().min(1).max(500),
  order: z.number().int().min(0).optional(),
});

const updateQuickReplySchema = z.object({
  content: z.string().min(1).max(500).optional(),
  order: z.number().int().min(0).optional(),
  category: z.string().min(1).max(50).optional(),
});

const createCategorySchema = z.object({
  name: z.string().min(1).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Category name must be alphanumeric'),
  displayName: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  order: z.number().int().min(0).optional(),
  icon: z.string().max(50).optional(),
});

const updateCategorySchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  order: z.number().int().min(0).optional(),
  icon: z.string().max(50).optional(),
});

// =============================================================================
// System Default Quick Replies
// =============================================================================

const SYSTEM_QUICK_REPLIES = [
  // Appointment category
  { category: 'appointment', content: 'Your appointment is confirmed. See you soon!', order: 1 },
  { category: 'appointment', content: 'Please call us at 555-0100 to reschedule.', order: 2 },
  { category: 'appointment', content: 'Reply C to confirm or R to reschedule your appointment.', order: 3 },
  { category: 'appointment', content: 'We have availability tomorrow. Would you like to book?', order: 4 },
  { category: 'appointment', content: 'Your appointment has been rescheduled. Check your email for details.', order: 5 },

  // Post-care category
  { category: 'postCare', content: "That's normal. Apply ice if needed and keep the area moisturized.", order: 1 },
  { category: 'postCare', content: 'Some tightness is normal. Use gentle cleanser and moisturize well.', order: 2 },
  { category: 'postCare', content: 'Avoid sun exposure and use SPF 30+ daily.', order: 3 },
  { category: 'postCare', content: 'Avoid strenuous exercise for 24 hours after treatment.', order: 4 },
  { category: 'postCare', content: 'If you experience severe pain or swelling, please call us immediately.', order: 5 },

  // General category
  { category: 'general', content: "Thank you for your message. We'll respond shortly.", order: 1 },
  { category: 'general', content: 'Please call us at 555-0100 for immediate assistance.', order: 2 },
  { category: 'general', content: 'Our office hours are Mon-Fri 9AM-6PM, Sat 10AM-4PM.', order: 3 },
  { category: 'general', content: 'Thank you for choosing our practice!', order: 4 },
  { category: 'general', content: 'Is there anything else I can help you with?', order: 5 },

  // SMS Reminder Templates category
  // 24-hour reminder (under 160 chars for single SMS segment)
  { category: 'smsReminderTemplates', content: 'Hi {{firstName}}, reminder: {{serviceName}} tomorrow at {{appointmentTime}} with {{providerName}}. Reply C to confirm, R to reschedule.', order: 1 },
  // 1-hour reminder
  { category: 'smsReminderTemplates', content: '{{firstName}}, your {{serviceName}} is in 1 hour! See you soon at {{locationName}}.', order: 2 },
  // Booking confirmation
  { category: 'smsReminderTemplates', content: 'Hi {{firstName}}! Appt confirmed: {{appointmentDate}} at {{appointmentTime}} with {{providerName}}. Questions? {{locationPhone}}', order: 3 },
  // Reschedule offer
  { category: 'smsReminderTemplates', content: 'Hi {{firstName}}, we have an opening on {{appointmentDate}} at {{appointmentTime}}. Reply Y to book or call {{locationPhone}}.', order: 4 },
  // Post-treatment follow-up
  { category: 'smsReminderTemplates', content: 'Hi {{firstName}}, how are you feeling after your {{serviceName}}? Any concerns, call us at {{locationPhone}}. We care about your results!', order: 5 },
];

const SYSTEM_CATEGORIES = [
  { name: 'appointment', displayName: 'Appointment', description: 'Appointment-related responses', order: 1, icon: 'Calendar' },
  { name: 'postCare', displayName: 'Post-Care', description: 'Post-treatment care instructions', order: 2, icon: 'Heart' },
  { name: 'general', displayName: 'General', description: 'General responses', order: 3, icon: 'MessageCircle' },
  { name: 'smsReminderTemplates', displayName: 'SMS Reminder Templates', description: 'Automated SMS reminder templates with tokens like {{firstName}}, {{appointmentTime}}', order: 4, icon: 'Bell' },
];

// =============================================================================
// Quick Reply Routes
// =============================================================================

/**
 * GET /quick-replies
 * List all quick replies, grouped by category
 */
quickReplies.get(
  '/',
  sessionAuthMiddleware,
  async (c) => {
    const replies = await prisma.quickReply.findMany({
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    // Group by category
    const grouped = replies.reduce((acc, reply) => {
      if (!acc[reply.category]) {
        acc[reply.category] = [];
      }
      acc[reply.category].push(reply);
      return acc;
    }, {} as Record<string, typeof replies>);

    return c.json({
      success: true,
      data: grouped,
      total: replies.length,
    });
  }
);

/**
 * GET /quick-replies/categories
 * List all categories
 */
quickReplies.get(
  '/categories',
  sessionAuthMiddleware,
  async (c) => {
    const categories = await prisma.quickReplyCategory.findMany({
      orderBy: { order: 'asc' },
    });

    return c.json({
      success: true,
      data: categories,
    });
  }
);

/**
 * GET /quick-replies/:id
 * Get a single quick reply
 */
quickReplies.get(
  '/:id',
  sessionAuthMiddleware,
  async (c) => {
    const { id } = c.req.param();

    const reply = await prisma.quickReply.findUnique({
      where: { id },
    });

    if (!reply) {
      throw APIError.notFound('Quick reply not found');
    }

    return c.json({
      success: true,
      data: reply,
    });
  }
);

/**
 * POST /quick-replies
 * Create a new quick reply
 */
quickReplies.post(
  '/',
  sessionAuthMiddleware,
  requireRole(['admin', 'office_manager', 'front_desk', 'patient_coordinator', 'physician', 'nurse_practitioner', 'aesthetician', 'laser_technician', 'injection_specialist']),
  zValidator('json', createQuickReplySchema),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');

    // Get the next order number if not provided
    let order = data.order;
    if (order === undefined) {
      const maxOrder = await prisma.quickReply.aggregate({
        where: { category: data.category },
        _max: { order: true },
      });
      order = (maxOrder._max.order ?? 0) + 1;
    }

    const reply = await prisma.quickReply.create({
      data: {
        category: data.category,
        content: data.content,
        order,
        isSystem: false,
        createdById: user?.id,
      },
    });

    return c.json({
      success: true,
      data: reply,
    }, 201);
  }
);

/**
 * PUT /quick-replies/:id
 * Update a quick reply
 */
quickReplies.put(
  '/:id',
  sessionAuthMiddleware,
  requireRole(['admin', 'office_manager', 'front_desk', 'patient_coordinator', 'physician', 'nurse_practitioner', 'aesthetician', 'laser_technician', 'injection_specialist']),
  zValidator('json', updateQuickReplySchema),
  async (c) => {
    const { id } = c.req.param();
    const data = c.req.valid('json');

    const existing = await prisma.quickReply.findUnique({
      where: { id },
    });

    if (!existing) {
      throw APIError.notFound('Quick reply not found');
    }

    // Prevent editing system replies
    if (existing.isSystem) {
      throw APIError.forbidden('System quick replies cannot be modified');
    }

    const updated = await prisma.quickReply.update({
      where: { id },
      data: {
        content: data.content,
        order: data.order,
        category: data.category,
      },
    });

    return c.json({
      success: true,
      data: updated,
    });
  }
);

/**
 * DELETE /quick-replies/:id
 * Delete a quick reply
 */
quickReplies.delete(
  '/:id',
  sessionAuthMiddleware,
  requireRole(['admin', 'office_manager', 'front_desk', 'patient_coordinator', 'physician', 'nurse_practitioner', 'aesthetician', 'laser_technician', 'injection_specialist']),
  async (c) => {
    const { id } = c.req.param();

    const existing = await prisma.quickReply.findUnique({
      where: { id },
    });

    if (!existing) {
      throw APIError.notFound('Quick reply not found');
    }

    // Prevent deleting system replies
    if (existing.isSystem) {
      throw APIError.forbidden('System quick replies cannot be deleted');
    }

    await prisma.quickReply.delete({
      where: { id },
    });

    return c.json({
      success: true,
      message: 'Quick reply deleted',
    });
  }
);

/**
 * POST /quick-replies/:id/use
 * Track usage of a quick reply
 */
quickReplies.post(
  '/:id/use',
  sessionAuthMiddleware,
  async (c) => {
    const { id } = c.req.param();

    await prisma.quickReply.update({
      where: { id },
      data: {
        useCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });

    return c.json({
      success: true,
      message: 'Usage tracked',
    });
  }
);

// =============================================================================
// Category Routes
// =============================================================================

/**
 * POST /quick-replies/categories
 * Create a new category
 */
quickReplies.post(
  '/categories',
  sessionAuthMiddleware,
  requireRole(['admin', 'office_manager']),
  zValidator('json', createCategorySchema),
  async (c) => {
    const data = c.req.valid('json');

    // Check if category name already exists
    const existing = await prisma.quickReplyCategory.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw APIError.conflict('Category with this name already exists');
    }

    // Get the next order number if not provided
    let order = data.order;
    if (order === undefined) {
      const maxOrder = await prisma.quickReplyCategory.aggregate({
        _max: { order: true },
      });
      order = (maxOrder._max.order ?? 0) + 1;
    }

    const category = await prisma.quickReplyCategory.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        order,
        icon: data.icon,
        isSystem: false,
      },
    });

    return c.json({
      success: true,
      data: category,
    }, 201);
  }
);

/**
 * PUT /quick-replies/categories/:name
 * Update a category
 */
quickReplies.put(
  '/categories/:name',
  sessionAuthMiddleware,
  requireRole(['admin', 'office_manager']),
  zValidator('json', updateCategorySchema),
  async (c) => {
    const { name } = c.req.param();
    const data = c.req.valid('json');

    const existing = await prisma.quickReplyCategory.findUnique({
      where: { name },
    });

    if (!existing) {
      throw APIError.notFound('Category not found');
    }

    // Prevent editing system categories
    if (existing.isSystem) {
      throw APIError.forbidden('System categories cannot be modified');
    }

    const updated = await prisma.quickReplyCategory.update({
      where: { name },
      data,
    });

    return c.json({
      success: true,
      data: updated,
    });
  }
);

/**
 * DELETE /quick-replies/categories/:name
 * Delete a category (and all its replies)
 */
quickReplies.delete(
  '/categories/:name',
  sessionAuthMiddleware,
  requireRole(['admin', 'office_manager']),
  async (c) => {
    const { name } = c.req.param();

    const existing = await prisma.quickReplyCategory.findUnique({
      where: { name },
    });

    if (!existing) {
      throw APIError.notFound('Category not found');
    }

    // Prevent deleting system categories
    if (existing.isSystem) {
      throw APIError.forbidden('System categories cannot be deleted');
    }

    // Delete all replies in this category first
    await prisma.quickReply.deleteMany({
      where: { category: name },
    });

    // Then delete the category
    await prisma.quickReplyCategory.delete({
      where: { name },
    });

    return c.json({
      success: true,
      message: 'Category and all its replies deleted',
    });
  }
);

// =============================================================================
// Seed/Reset Routes
// =============================================================================

/**
 * POST /quick-replies/seed
 * Seed system defaults (admin only)
 */
quickReplies.post(
  '/seed',
  sessionAuthMiddleware,
  requireRole(['admin']),
  async (c) => {
    // Seed categories
    for (const cat of SYSTEM_CATEGORIES) {
      await prisma.quickReplyCategory.upsert({
        where: { name: cat.name },
        update: { ...cat, isSystem: true },
        create: { ...cat, isSystem: true },
      });
    }

    // Seed quick replies
    for (const reply of SYSTEM_QUICK_REPLIES) {
      // Check if a system reply with this content exists
      const existing = await prisma.quickReply.findFirst({
        where: {
          category: reply.category,
          content: reply.content,
          isSystem: true,
        },
      });

      if (!existing) {
        await prisma.quickReply.create({
          data: {
            ...reply,
            isSystem: true,
          },
        });
      }
    }

    return c.json({
      success: true,
      message: 'System defaults seeded',
    });
  }
);

/**
 * POST /quick-replies/reset
 * Reset to system defaults (deletes custom, restores system)
 */
quickReplies.post(
  '/reset',
  sessionAuthMiddleware,
  requireRole(['admin']),
  async (c) => {
    // Delete all non-system replies
    await prisma.quickReply.deleteMany({
      where: { isSystem: false },
    });

    // Delete all non-system categories
    await prisma.quickReplyCategory.deleteMany({
      where: { isSystem: false },
    });

    // Re-seed system defaults
    for (const cat of SYSTEM_CATEGORIES) {
      await prisma.quickReplyCategory.upsert({
        where: { name: cat.name },
        update: { ...cat, isSystem: true },
        create: { ...cat, isSystem: true },
      });
    }

    for (const reply of SYSTEM_QUICK_REPLIES) {
      const existing = await prisma.quickReply.findFirst({
        where: {
          category: reply.category,
          content: reply.content,
          isSystem: true,
        },
      });

      if (!existing) {
        await prisma.quickReply.create({
          data: {
            ...reply,
            isSystem: true,
          },
        });
      }
    }

    return c.json({
      success: true,
      message: 'Quick replies reset to system defaults',
    });
  }
);

export default quickReplies;
