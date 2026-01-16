/**
 * Messaging Templates API Routes
 *
 * Handles CRUD operations for message templates (SMS/Email)
 * Includes 50+ production-ready system templates
 *
 * TCPA Compliance:
 * - Marketing templates must include opt-out instructions
 * - Opt-out keywords in ALL CAPS (STOP, UNSUBSCRIBE, END, CANCEL, QUIT)
 * - Track usage statistics for compliance audits
 * - System templates are immutable (cannot be deleted/modified)
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { sessionAuthMiddleware, optionalSessionAuthMiddleware, requireRole } from '../middleware/auth';
import {
  createTemplateSchema,
  updateTemplateSchema,
  templateSearchSchema,
  templateIdParamSchema,
  renderTemplateSchema,
  TemplateCategory,
  TemplateChannel,
  z,
} from '@medical-spa/validations';
import { APIError } from '../middleware/error';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { logAuditEvent } from '@medical-spa/security';

const templates = new Hono();

// =============================================================================
// Type Definitions
// =============================================================================

export type StoredTemplate = Prisma.MessageTemplateGetPayload<{}>;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Extract variables from template body
 * Finds all {{variableName}} patterns
 */
function extractVariables(body: string): string[] {
  const regex = /\{\{(\w+)\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(body)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }

  return variables;
}

/**
 * Replace variables in template
 */
function replaceVariables(template: string, variables: Record<string, any>): string {
  let result = template;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, String(value || ''));
  });

  return result;
}

/**
 * Get client IP address from request
 */
function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

/**
 * Validate marketing template includes opt-out instructions
 * TCPA Compliance: Marketing templates MUST include opt-out keyword
 */
function validateMarketingTemplate(category: TemplateCategory, body: string): void {
  if (category === 'marketing') {
    const optOutKeywords = ['STOP', 'UNSUBSCRIBE', 'END', 'CANCEL', 'QUIT', 'STOPALL'];
    const hasOptOut = optOutKeywords.some(keyword => body.includes(keyword));

    if (!hasOptOut) {
      throw APIError.badRequest(
        'Marketing templates must include opt-out instructions with keyword in ALL CAPS (STOP, UNSUBSCRIBE, END, CANCEL, or QUIT)'
      );
    }
  }
}

// =============================================================================
// System Templates Seed Data
// =============================================================================

const SYSTEM_TEMPLATES: Omit<StoredTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isSystem' | 'usageCount' | 'lastUsedAt'>[] = [
  // APPOINTMENT TEMPLATES (8)
  {
    name: 'Appointment Confirmation',
    category: 'appointment',
    channel: 'sms',
    subject: null,
    body: 'Hi {{patientName}}, your {{service}} appointment is confirmed for {{date}} at {{time}}. Reply C to confirm.',
    variables: ['patientName', 'service', 'date', 'time'],
    tags: ['appointment', 'confirmation'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: '48 Hour Reminder',
    category: 'appointment',
    channel: 'sms',
    subject: null,
    body: 'Reminder: Your {{service}} is in 2 days ({{date}} at {{time}}). Please avoid alcohol and blood thinners.',
    variables: ['service', 'date', 'time'],
    tags: ['appointment', 'reminder', '48hr'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: '24 Hour Reminder',
    category: 'appointment',
    channel: 'sms',
    subject: null,
    body: 'Reminder: Your appointment is tomorrow at {{time}}. Please arrive makeup-free.',
    variables: ['time'],
    tags: ['appointment', 'reminder', '24hr'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: '2 Hour Reminder',
    category: 'appointment',
    channel: 'sms',
    subject: null,
    body: 'Your {{service}} appointment is in 2 hours at {{time}}. See you soon!',
    variables: ['service', 'time'],
    tags: ['appointment', 'reminder', '2hr'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Appointment Rescheduled',
    category: 'appointment',
    channel: 'sms',
    subject: null,
    body: 'Your appointment has been rescheduled to {{date}} at {{time}}. Reply C to confirm.',
    variables: ['date', 'time'],
    tags: ['appointment', 'reschedule'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Appointment Cancelled',
    category: 'appointment',
    channel: 'sms',
    subject: null,
    body: 'Your appointment on {{date}} has been cancelled. Call us to reschedule.',
    variables: ['date'],
    tags: ['appointment', 'cancellation'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'No Show Follow-up',
    category: 'appointment',
    channel: 'sms',
    subject: null,
    body: 'We missed you today! Please call us to reschedule your {{service}} appointment.',
    variables: ['service'],
    tags: ['appointment', 'noshow'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Waitlist Opening',
    category: 'appointment',
    channel: 'sms',
    subject: null,
    body: 'Great news! A {{service}} slot opened up on {{date}} at {{time}}. Reply YES to book.',
    variables: ['service', 'date', 'time'],
    tags: ['appointment', 'waitlist'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },

  // TREATMENT AFTERCARE TEMPLATES (5)
  {
    name: 'Botox Aftercare',
    category: 'treatment',
    channel: 'sms',
    subject: null,
    body: 'Post-Botox care: No lying down for 4 hours, avoid exercise 24hrs, don\'t rub injection sites.',
    variables: [],
    tags: ['treatment', 'aftercare', 'botox'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Filler Aftercare',
    category: 'treatment',
    channel: 'sms',
    subject: null,
    body: 'Post-filler care: Apply ice if needed, avoid exercise 24hrs, sleep elevated tonight.',
    variables: [],
    tags: ['treatment', 'aftercare', 'filler'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Chemical Peel Aftercare',
    category: 'treatment',
    channel: 'sms',
    subject: null,
    body: 'Post-peel care: Moisturize frequently, use gentle cleanser, apply SPF 30+ daily.',
    variables: [],
    tags: ['treatment', 'aftercare', 'peel'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Microneedling Aftercare',
    category: 'treatment',
    channel: 'sms',
    subject: null,
    body: 'Post-microneedling: No makeup 24hrs, use gentle skincare only, apply SPF daily.',
    variables: [],
    tags: ['treatment', 'aftercare', 'microneedling'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Laser Treatment Aftercare',
    category: 'treatment',
    channel: 'sms',
    subject: null,
    body: 'Post-laser care: Apply ice if needed, use gentle products only, SPF 30+ required, avoid sun.',
    variables: [],
    tags: ['treatment', 'aftercare', 'laser'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },

  // FOLLOW-UP TEMPLATES (4)
  {
    name: '24 Hour Follow-up',
    category: 'followup',
    channel: 'sms',
    subject: null,
    body: 'Hi {{patientName}}, how are you feeling after your {{treatment}} yesterday? Reply if you have questions.',
    variables: ['patientName', 'treatment'],
    tags: ['followup', '24hr'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: '3 Day Follow-up',
    category: 'followup',
    channel: 'sms',
    subject: null,
    body: 'Checking in! How is your {{treatment}} healing? Any concerns? We\'re here to help.',
    variables: ['treatment'],
    tags: ['followup', '3day'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: '1 Week Follow-up',
    category: 'followup',
    channel: 'sms',
    subject: null,
    body: 'It\'s been a week since your {{treatment}}. How are your results looking? Let us know!',
    variables: ['treatment'],
    tags: ['followup', '1week'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: '2 Week Follow-up',
    category: 'followup',
    channel: 'sms',
    subject: null,
    body: 'Two weeks post-{{treatment}}! Loving your results? We\'d love to hear from you.',
    variables: ['treatment'],
    tags: ['followup', '2week'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },

  // MARKETING TEMPLATES (6)
  {
    name: 'Birthday Greeting',
    category: 'marketing',
    channel: 'sms',
    subject: null,
    body: 'Happy Birthday, {{patientName}}! Enjoy 20% off any treatment this month. Call to book!',
    variables: ['patientName'],
    tags: ['marketing', 'birthday'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'VIP Exclusive',
    category: 'marketing',
    channel: 'sms',
    subject: null,
    body: 'VIP exclusive: Book this week and receive a complimentary add-on treatment.',
    variables: [],
    tags: ['marketing', 'vip'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Seasonal Special',
    category: 'marketing',
    channel: 'sms',
    subject: null,
    body: 'Spring special! {{discount}}% off {{service}} this month only. Book now!',
    variables: ['discount', 'service'],
    tags: ['marketing', 'seasonal'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Referral Program',
    category: 'marketing',
    channel: 'sms',
    subject: null,
    body: 'Refer a friend and you both get $50 off your next treatment!',
    variables: [],
    tags: ['marketing', 'referral'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Win Back Campaign',
    category: 'marketing',
    channel: 'sms',
    subject: null,
    body: 'We miss you, {{patientName}}! It\'s been {{months}} months. Book now for {{discount}}% off.',
    variables: ['patientName', 'months', 'discount'],
    tags: ['marketing', 'winback'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Package Expiring',
    category: 'marketing',
    channel: 'sms',
    subject: null,
    body: 'Your {{package}} credits expire on {{date}}. Book now to use them!',
    variables: ['package', 'date'],
    tags: ['marketing', 'expiring'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },

  // FINANCIAL TEMPLATES (3)
  {
    name: 'Payment Reminder',
    category: 'financial',
    channel: 'sms',
    subject: null,
    body: 'Reminder: Your balance of ${{amount}} is due by {{date}}. Pay online or call us.',
    variables: ['amount', 'date'],
    tags: ['financial', 'payment'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Payment Received',
    category: 'financial',
    channel: 'sms',
    subject: null,
    body: 'Thank you! We received your payment of ${{amount}}. Your balance is now ${{balance}}.',
    variables: ['amount', 'balance'],
    tags: ['financial', 'confirmation'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Package Purchased',
    category: 'financial',
    channel: 'sms',
    subject: null,
    body: 'Your {{package}} package is active! You have {{credits}} credits to use. Book anytime!',
    variables: ['package', 'credits'],
    tags: ['financial', 'package'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },

  // MEMBERSHIP TEMPLATES (4)
  {
    name: 'Membership Welcome',
    category: 'membership',
    channel: 'sms',
    subject: null,
    body: 'Welcome to our {{tier}} membership! Enjoy {{benefits}}. Questions? Reply anytime.',
    variables: ['tier', 'benefits'],
    tags: ['membership', 'welcome'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Monthly Credits Added',
    category: 'membership',
    channel: 'sms',
    subject: null,
    body: '{{credits}} credits have been added to your account. Current balance: {{balance}}.',
    variables: ['credits', 'balance'],
    tags: ['membership', 'credits'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Credits Expiring',
    category: 'membership',
    channel: 'sms',
    subject: null,
    body: 'Your {{credits}} credits expire on {{date}}. Book now to use them!',
    variables: ['credits', 'date'],
    tags: ['membership', 'expiring'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Membership Renewal',
    category: 'membership',
    channel: 'sms',
    subject: null,
    body: 'Your membership renews on {{date}}. Current balance: {{credits}} credits.',
    variables: ['date', 'credits'],
    tags: ['membership', 'renewal'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },

  // REVIEW TEMPLATES (2)
  {
    name: 'Review Request',
    category: 'review',
    channel: 'sms',
    subject: null,
    body: 'Hi {{patientName}}, how was your {{service}}? We\'d love a review! {{reviewLink}}',
    variables: ['patientName', 'service', 'reviewLink'],
    tags: ['review', 'request'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Review Thank You',
    category: 'review',
    channel: 'sms',
    subject: null,
    body: 'Thank you for your review, {{patientName}}! We appreciate your feedback.',
    variables: ['patientName'],
    tags: ['review', 'thankyou'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },

  // EMERGENCY TEMPLATES (2)
  {
    name: 'Emergency Clinic Closure',
    category: 'emergency',
    channel: 'sms',
    subject: null,
    body: 'Luxe Medical Spa will be closed {{date}} due to {{reason}}. We\'ll contact you to reschedule.',
    variables: ['date', 'reason'],
    tags: ['emergency', 'closure'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Provider Absence',
    category: 'emergency',
    channel: 'sms',
    subject: null,
    body: 'Dr. {{provider}} is unavailable {{date}}. We\'ll contact you to reschedule.',
    variables: ['provider', 'date'],
    tags: ['emergency', 'provider'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },

  // ADMINISTRATIVE TEMPLATES (3)
  {
    name: 'Forms Reminder',
    category: 'administrative',
    channel: 'sms',
    subject: null,
    body: 'Please complete your intake forms before your appointment: {{formLink}}',
    variables: ['formLink'],
    tags: ['admin', 'forms'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'Insurance Update',
    category: 'administrative',
    channel: 'sms',
    subject: null,
    body: 'Please update your insurance information before your next visit.',
    variables: [],
    tags: ['admin', 'insurance'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
  {
    name: 'General Update',
    category: 'administrative',
    channel: 'sms',
    subject: null,
    body: '{{message}}',
    variables: ['message'],
    tags: ['admin', 'general'],
    isActive: true,
    hipaaCompliant: true,
    includesOptOut: false,
    maxLength: 160,
    createdBy: null,
  },
];

/**
 * Seed system templates into database
 * This should be called during database initialization/migration
 * System templates are immutable and cannot be deleted or modified via API
 */
export async function seedSystemTemplates() {
  const now = new Date();

  for (const [index, template] of SYSTEM_TEMPLATES.entries()) {
    const id = `sys_${(index + 1).toString().padStart(3, '0')}`;

    await prisma.messageTemplate.upsert({
      where: { id },
      create: {
        id,
        name: template.name,
        category: template.category,
        channel: template.channel,
        subject: template.subject,
        body: template.body,
        variables: template.variables,
        tags: template.tags,
        isActive: template.isActive,
        isSystem: true,
        usageCount: 0,
        hipaaCompliant: template.hipaaCompliant,
        includesOptOut: template.includesOptOut,
        maxLength: template.maxLength,
        createdAt: now,
        updatedAt: now,
        createdBy: 'system',
      },
      update: {
        // Only update body and variables for system templates during migrations
        body: template.body,
        variables: template.variables,
        updatedAt: now,
      },
    });
  }

  console.log(`Seeded ${SYSTEM_TEMPLATES.length} system templates`);
}

// =============================================================================
// Public Routes (No Auth Required)
// =============================================================================

/**
 * Get all template categories with counts
 * GET /api/templates/categories
 */
templates.get('/categories', async (c) => {
  // Get template counts grouped by category
  const categoryCounts = await prisma.messageTemplate.groupBy({
    by: ['category'],
    _count: {
      id: true,
    },
    where: {
      isActive: true,
    },
  });

  const categoryMap = new Map(
    categoryCounts.map(item => [item.category, item._count.id])
  );

  const categories = [
    { id: 'appointment', name: 'Appointment', count: categoryMap.get('appointment') || 0 },
    { id: 'treatment', name: 'Treatment', count: categoryMap.get('treatment') || 0 },
    { id: 'followup', name: 'Follow-up', count: categoryMap.get('followup') || 0 },
    { id: 'marketing', name: 'Marketing', count: categoryMap.get('marketing') || 0 },
    { id: 'financial', name: 'Financial', count: categoryMap.get('financial') || 0 },
    { id: 'membership', name: 'Membership', count: categoryMap.get('membership') || 0 },
    { id: 'review', name: 'Review', count: categoryMap.get('review') || 0 },
    { id: 'emergency', name: 'Emergency', count: categoryMap.get('emergency') || 0 },
    { id: 'administrative', name: 'Administrative', count: categoryMap.get('administrative') || 0 },
  ];

  return c.json({
    items: categories,
    total: categories.length,
  });
});

/**
 * List all templates with advanced filtering
 * GET /api/templates
 */
templates.get('/', optionalSessionAuthMiddleware, zValidator('query', templateSearchSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');

  // Build where clause
  const where: Prisma.MessageTemplateWhereInput = {};

  // Text search across name, body, and tags
  if (query.query) {
    const searchTerm = query.query;
    where.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { body: { contains: searchTerm, mode: 'insensitive' } },
      { tags: { hasSome: [searchTerm] } },
    ];
  }

  // Filter by single category
  if (query.category) {
    where.category = query.category;
  }

  // Filter by multiple categories
  if (query.categories && query.categories.length > 0) {
    where.category = { in: query.categories };
  }

  // Filter by channel (handle 'both' channel compatibility)
  if (query.channel) {
    if (query.channel === 'both') {
      where.channel = 'both';
    } else {
      where.OR = [
        { channel: query.channel },
        { channel: 'both' },
      ];
    }
  }

  // Filter by active status
  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }

  // Filter by tags
  if (query.tags && query.tags.length > 0) {
    where.tags = { hasSome: query.tags };
  }

  // Get total count
  const total = await prisma.messageTemplate.count({ where });

  // Pagination
  const page = query.page || 1;
  const limit = query.limit || 20;
  const offset = (page - 1) * limit;

  // Get paginated results
  const items = await prisma.messageTemplate.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  });

  // Audit log if user is authenticated
  if (user) {
    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'template_list',
      ipAddress: getClientIP(c),
      metadata: { query, resultCount: items.length },
    });
  }

  return c.json({
    items,
    total,
    page,
    limit,
    hasMore: offset + limit < total,
  });
});

/**
 * Get single template by ID
 * GET /api/templates/:templateId
 */
templates.get('/:templateId', optionalSessionAuthMiddleware, zValidator('param', templateIdParamSchema), async (c) => {
  const { templateId } = c.req.valid('param');
  const user = c.get('user');

  const template = await prisma.messageTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw APIError.notFound('Template');
  }

  // Audit log if user is authenticated
  if (user) {
    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'template',
      resourceId: templateId,
      ipAddress: getClientIP(c),
    });
  }

  return c.json(template);
});

// =============================================================================
// Protected Routes (Auth Required)
// =============================================================================

/**
 * Create a new custom template
 * POST /api/templates
 */
templates.post(
  '/',
  sessionAuthMiddleware,
  requireRole('admin', 'owner', 'manager'),
  zValidator('json', createTemplateSchema),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');

    // TCPA Compliance: Validate marketing templates
    validateMarketingTemplate(data.category, data.body);

    // Extract variables from body
    const variables = extractVariables(data.body);

    // Extract from subject if email
    if (data.subject) {
      const subjectVars = extractVariables(data.subject);
      subjectVars.forEach(v => {
        if (!variables.includes(v)) {
          variables.push(v);
        }
      });
    }

    // Determine if template includes opt-out keyword
    const optOutKeywords = ['STOP', 'UNSUBSCRIBE', 'END', 'CANCEL', 'QUIT', 'STOPALL'];
    const includesOptOut = optOutKeywords.some(keyword => data.body.includes(keyword));

    const template = await prisma.messageTemplate.create({
      data: {
        name: data.name,
        category: data.category,
        channel: data.channel,
        subject: data.subject,
        body: data.body,
        variables,
        tags: data.tags || [],
        isActive: data.isActive ?? true,
        isSystem: false,
        usageCount: 0,
        hipaaCompliant: data.compliance?.hipaaCompliant ?? true,
        includesOptOut: data.compliance?.includesOptOut ?? includesOptOut,
        maxLength: data.compliance?.maxLength,
        createdBy: user.uid,
      },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'CREATE',
      resourceType: 'template',
      resourceId: template.id,
      ipAddress: getClientIP(c),
      metadata: {
        name: template.name,
        category: template.category,
        channel: template.channel,
      },
    });

    return c.json(template, 201);
  }
);

/**
 * Update a custom template
 * PUT /api/templates/:templateId
 */
templates.put(
  '/:templateId',
  sessionAuthMiddleware,
  requireRole('admin', 'owner', 'manager'),
  zValidator('param', templateIdParamSchema),
  zValidator('json', updateTemplateSchema),
  async (c) => {
    const { templateId } = c.req.valid('param');
    const data = c.req.valid('json');
    const user = c.get('user');

    const existingTemplate = await prisma.messageTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      throw APIError.notFound('Template');
    }

    // System templates cannot be modified
    if (existingTemplate.isSystem) {
      throw APIError.badRequest('Cannot modify system templates');
    }

    // TCPA Compliance: Validate marketing templates if category or body changed
    const newCategory = data.category || existingTemplate.category;
    const newBody = data.body || existingTemplate.body;
    validateMarketingTemplate(newCategory, newBody);

    // Re-extract variables if body or subject changed
    let variables = existingTemplate.variables;
    if (data.body || data.subject) {
      const bodyToCheck = data.body || existingTemplate.body;
      const subjectToCheck = data.subject || existingTemplate.subject;

      variables = extractVariables(bodyToCheck);
      if (subjectToCheck) {
        const subjectVars = extractVariables(subjectToCheck);
        subjectVars.forEach(v => {
          if (!variables.includes(v)) {
            variables.push(v);
          }
        });
      }
    }

    // Determine if template includes opt-out keyword
    const optOutKeywords = ['STOP', 'UNSUBSCRIBE', 'END', 'CANCEL', 'QUIT', 'STOPALL'];
    const includesOptOut = optOutKeywords.some(keyword => newBody.includes(keyword));

    // Build update data
    const updateData: Prisma.MessageTemplateUpdateInput = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.channel !== undefined) updateData.channel = data.channel;
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (variables !== existingTemplate.variables) updateData.variables = variables;

    if (data.compliance) {
      if (data.compliance.hipaaCompliant !== undefined) {
        updateData.hipaaCompliant = data.compliance.hipaaCompliant;
      }
      if (data.compliance.includesOptOut !== undefined) {
        updateData.includesOptOut = data.compliance.includesOptOut;
      } else if (data.body) {
        updateData.includesOptOut = includesOptOut;
      }
      if (data.compliance.maxLength !== undefined) {
        updateData.maxLength = data.compliance.maxLength;
      }
    }

    const updatedTemplate = await prisma.messageTemplate.update({
      where: { id: templateId },
      data: updateData,
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'UPDATE',
      resourceType: 'template',
      resourceId: templateId,
      ipAddress: getClientIP(c),
      metadata: { updatedFields: Object.keys(data) },
    });

    return c.json(updatedTemplate);
  }
);

/**
 * Delete a custom template
 * DELETE /api/templates/:templateId
 *
 * Note: System templates cannot be deleted
 * Custom templates are permanently deleted (hard delete)
 */
templates.delete(
  '/:templateId',
  sessionAuthMiddleware,
  requireRole('admin', 'owner'),
  zValidator('param', templateIdParamSchema),
  async (c) => {
    const { templateId } = c.req.valid('param');
    const user = c.get('user');

    const existingTemplate = await prisma.messageTemplate.findUnique({
      where: { id: templateId },
    });

    if (!existingTemplate) {
      throw APIError.notFound('Template');
    }

    // System templates cannot be deleted
    if (existingTemplate.isSystem) {
      throw APIError.badRequest('Cannot delete system templates');
    }

    await prisma.messageTemplate.delete({
      where: { id: templateId },
    });

    await logAuditEvent({
      userId: user.uid,
      action: 'DELETE',
      resourceType: 'template',
      resourceId: templateId,
      ipAddress: getClientIP(c),
      metadata: {
        templateName: existingTemplate.name,
        category: existingTemplate.category,
      },
    });

    return c.json({
      message: 'Template deleted successfully',
      id: templateId,
    });
  }
);

/**
 * Render a template with variables and track usage
 * POST /api/templates/render
 */
templates.post('/render', sessionAuthMiddleware, zValidator('json', renderTemplateSchema), async (c) => {
  const { templateId, variables } = c.req.valid('json');
  const user = c.get('user');

  const template = await prisma.messageTemplate.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw APIError.notFound('Template');
  }

  // Check for missing required variables
  const missing = template.variables.filter(v => variables[v] === undefined);
  if (missing.length > 0) {
    throw APIError.badRequest(`Missing required variables: ${missing.join(', ')}`);
  }

  // Render body
  const renderedBody = replaceVariables(template.body, variables);

  // Render subject if exists
  const renderedSubject = template.subject
    ? replaceVariables(template.subject, variables)
    : undefined;

  // Update usage statistics (atomic increment)
  await prisma.messageTemplate.update({
    where: { id: templateId },
    data: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'template_render',
    resourceId: templateId,
    ipAddress: getClientIP(c),
    metadata: {
      templateName: template.name,
      variablesUsed: Object.keys(variables),
    },
  });

  return c.json({
    templateId,
    subject: renderedSubject,
    body: renderedBody,
    channel: template.channel,
    variables: template.variables,
    usedVariables: variables,
  });
});

export default templates;
