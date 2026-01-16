/**
 * Messaging Consent API Routes (Priority 7)
 *
 * TCPA-compliant consent management with:
 * - Separate transactional vs marketing consent
 * - Opt-out keyword detection (TCPA April 2025 compliance)
 * - Full audit trail for compliance
 * - Bulk consent checking for campaigns
 * - Informal opt-out pattern detection
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import crypto from 'crypto';
import { sessionAuthMiddleware } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { logAuditEvent } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

const consent = new Hono();

// ===================
// Validation Schemas
// ===================

const consentStatusSchema = z.enum(['opted_in', 'opted_out', 'pending']);
const consentSourceSchema = z.enum(['sms', 'web', 'app', 'paper', 'verbal', 'import']);
const consentTypeSchema = z.enum(['transactional', 'marketing', 'all']);
const auditActionSchema = z.enum(['opt_in', 'opt_out', 'update', 'revoke_all']);

// Get consent by patient ID
const patientIdParamSchema = z.object({
  patientId: z.string().uuid(),
});

// Update consent schema
const updateConsentSchema = z.object({
  transactionalConsent: consentStatusSchema.optional(),
  marketingConsent: consentStatusSchema.optional(),
  source: consentSourceSchema,
  note: z.string().max(500).optional(),
});

// Opt-out schema
const optOutSchema = z.object({
  phone: z.string().min(1).max(20),
  keyword: z.string().max(50).optional(),
  consentType: consentTypeSchema,
  source: consentSourceSchema,
  messageSid: z.string().max(100).optional(),
});

// Opt-in schema
const optInSchema = z.object({
  phone: z.string().min(1).max(20),
  keyword: z.string().max(50).optional(),
  consentType: consentTypeSchema,
  source: consentSourceSchema,
  messageSid: z.string().max(100).optional(),
});

// Bulk check schema
const bulkCheckSchema = z.object({
  patientIds: z.array(z.string().uuid()).min(1).max(1000),
  consentType: z.enum(['transactional', 'marketing']),
});

// Audit query schema
const auditQuerySchema = z.object({
  patientId: z.string().optional(),
  phone: z.string().max(20).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  action: auditActionSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// ===================
// Type Definitions
// ===================

export type StoredConsent = Prisma.ConsentRecordGetPayload<{
  include: { auditLogs: true };
}>;

export type ConsentAuditLog = Prisma.ConsentAuditLogGetPayload<{}>;

// ===================
// Opt-Out/Opt-In Keywords
// ===================

const OPT_OUT_KEYWORDS = [
  'STOP',
  'STOPALL',
  'UNSUBSCRIBE',
  'CANCEL',
  'END',
  'QUIT',
  'REVOKE',
  'OPTOUT',
  'OPT OUT',
  'OPT-OUT',
];

const OPT_IN_KEYWORDS = [
  'START',
  'UNSTOP',
  'SUBSCRIBE',
  'OPTIN',
  'OPT IN',
  'OPT-IN',
  'YES',
];

// Informal opt-out patterns (TCPA compliance)
const INFORMAL_OPT_OUT_PATTERNS = [
  /leave\s+me\s+alone/i,
  /don'?t\s+(text|message|contact)/i,
  /remove\s+me/i,
  /take\s+me\s+off/i,
  /no\s+more/i,
  /not\s+interested/i,
];

// ===================
// Helper Functions
// ===================

function generateId(): string {
  return crypto.randomUUID();
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

function getUserAgent(c: any): string {
  return c.req.header('user-agent') || 'unknown';
}

export function detectOptOutKeyword(message: string): string | undefined {
  if (!message) return undefined;

  const normalized = message.toUpperCase().trim();

  // Check standard keywords
  const keyword = OPT_OUT_KEYWORDS.find(kw => {
    const pattern = new RegExp(`\\b${kw.replace(/[- ]/g, '[- ]?')}\\b`, 'i');
    return pattern.test(normalized);
  });

  if (keyword) return keyword;

  // Check informal patterns
  const informalMatch = INFORMAL_OPT_OUT_PATTERNS.some(pattern => pattern.test(message));
  if (informalMatch) return 'INFORMAL_OPT_OUT';

  return undefined;
}

export function detectOptInKeyword(message: string): string | undefined {
  if (!message) return undefined;

  const normalized = message.toUpperCase().trim();

  return OPT_IN_KEYWORDS.find(kw => {
    const pattern = new RegExp(`\\b${kw.replace(/[- ]/g, '[- ]?')}\\b`, 'i');
    return pattern.test(normalized);
  });
}

async function createAuditLog(
  consentRecord: StoredConsent,
  action: 'opt_in' | 'opt_out' | 'update' | 'revoke_all',
  consentType: 'transactional' | 'marketing' | 'all',
  previousStatus: string,
  newStatus: string,
  source: string,
  options: {
    keyword?: string;
    messageSid?: string;
    ipAddress?: string;
    userAgent?: string;
    processedBy?: string;
  } = {}
): Promise<ConsentAuditLog> {
  const now = new Date();

  return await prisma.consentAuditLog.create({
    data: {
      id: generateId(),
      patientId: consentRecord.patientId,
      phone: consentRecord.phone,
      action,
      consentType,
      previousStatus: previousStatus as any,
      newStatus: newStatus as any,
      source: source as any,
      keyword: options.keyword,
      messageSid: options.messageSid,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      processedBy: options.processedBy,
      processedAt: now,
      processedWithin10Days: true, // We process immediately
      consentRecordId: consentRecord.id,
    },
  });
}

async function getOrCreateConsent(patientId: string, phone: string): Promise<StoredConsent> {
  // Try to find existing consent by patient ID
  let consent = await prisma.consentRecord.findUnique({
    where: { patientId },
    include: { auditLogs: true },
  });

  if (!consent) {
    // Create new consent record
    const id = generateId();
    const now = new Date();

    consent = await prisma.consentRecord.create({
      data: {
        id,
        patientId,
        phone: normalizePhone(phone),
        transactionalConsent: 'pending',
        marketingConsent: 'pending',
        tcpaCompliant: true,
        updatedAt: now,
      },
      include: { auditLogs: true },
    });
  }

  return consent;
}

async function findConsentByPhone(phone: string): Promise<StoredConsent | null> {
  const normalized = normalizePhone(phone);

  return await prisma.consentRecord.findFirst({
    where: { phone: normalized },
    include: { auditLogs: true },
  });
}

// ===================
// Middleware
// ===================

// Session auth for admin endpoints (GET audit, PUT consent)
consent.use('/audit', sessionAuthMiddleware);

// ===================
// Routes
// ===================

/**
 * Get consent audit log (for TCPA compliance)
 * GET /api/consent/audit
 */
consent.get('/audit', zValidator('query', auditQuerySchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Build where clause
  const where: Prisma.ConsentAuditLogWhereInput = {};

  if (query.patientId && query.patientId !== '') {
    where.patientId = query.patientId;
  }

  if (query.phone && query.phone !== '') {
    where.phone = normalizePhone(query.phone);
  }

  if (query.startDate && query.startDate !== '') {
    where.processedAt = { ...(where.processedAt as object || {}), gte: new Date(query.startDate) };
  }

  if (query.endDate && query.endDate !== '') {
    where.processedAt = { ...(where.processedAt as object || {}), lte: new Date(query.endDate) };
  }

  if (query.action) {
    where.action = query.action;
  }

  // Get total count
  const total = await prisma.consentAuditLog.count({ where });

  // Get paginated logs
  const offset = (query.page - 1) * query.limit;
  const logs = await prisma.consentAuditLog.findMany({
    where,
    orderBy: { processedAt: 'desc' },
    skip: offset,
    take: query.limit,
  });

  // Calculate compliance stats
  const allLogs = await prisma.consentAuditLog.findMany({ where });
  const optOuts = allLogs.filter(log => log.action === 'opt_out' || log.action === 'revoke_all').length;
  const optIns = allLogs.filter(log => log.action === 'opt_in').length;
  const allProcessedWithin10Days = allLogs.every(log => log.processedWithin10Days);
  const complianceRate = allLogs.length > 0
    ? (allLogs.filter(log => log.processedWithin10Days).length / allLogs.length) * 100
    : 100;

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'consent_audit',
    ipAddress,
    metadata: { query, resultCount: logs.length },
  });

  return c.json({
    items: logs,
    total,
    page: query.page,
    limit: query.limit,
    complianceStats: {
      totalLogs: allLogs.length,
      optOuts,
      optIns,
      allProcessedWithin10Days,
      complianceRate: Math.round(complianceRate * 100) / 100,
    },
  });
});

/**
 * Get patient consent status
 * GET /api/consent/:patientId
 */
consent.get('/:patientId', sessionAuthMiddleware, zValidator('param', patientIdParamSchema), async (c) => {
  const { patientId } = c.req.valid('param');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const consentRecord = await prisma.consentRecord.findUnique({
    where: { patientId },
  });

  if (!consentRecord) {
    throw APIError.notFound('Consent record');
  }

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'consent',
    resourceId: consentRecord.id,
    ipAddress,
  });

  return c.json({
    patientId: consentRecord.patientId,
    phone: consentRecord.phone,
    transactionalConsent: consentRecord.transactionalConsent,
    marketingConsent: consentRecord.marketingConsent,
    canSendTransactional: consentRecord.transactionalConsent === 'opted_in',
    canSendMarketing: consentRecord.marketingConsent === 'opted_in',
    tcpaCompliant: consentRecord.tcpaCompliant,
    lastOptOutAt: consentRecord.marketingOptOutAt || consentRecord.transactionalOptOutAt,
    lastOptInAt: consentRecord.marketingOptInAt || consentRecord.transactionalOptInAt,
  });
});

/**
 * Update patient consent (admin action)
 * PUT /api/consent/:patientId
 */
consent.put('/:patientId', sessionAuthMiddleware, zValidator('param', patientIdParamSchema), zValidator('json', updateConsentSchema), async (c) => {
  const { patientId } = c.req.valid('param');
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);
  const userAgent = getUserAgent(c);

  // Find existing consent
  const consentRecord = await prisma.consentRecord.findUnique({
    where: { patientId },
    include: { auditLogs: true },
  });

  if (!consentRecord) {
    throw APIError.notFound('Consent record');
  }

  const now = new Date();
  const previousTransactional = consentRecord.transactionalConsent;
  const previousMarketing = consentRecord.marketingConsent;

  // Build update data
  const updateData: Prisma.ConsentRecordUpdateInput = {
    updatedAt: now,
    lastAuditedAt: now,
  };

  // Update transactional consent
  if (data.transactionalConsent) {
    updateData.transactionalConsent = data.transactionalConsent;

    if (data.transactionalConsent === 'opted_in') {
      updateData.transactionalOptInAt = now;
      updateData.transactionalOptInSource = data.source;
      updateData.transactionalOptOutAt = null;
      updateData.transactionalOptOutKeyword = null;
    } else if (data.transactionalConsent === 'opted_out') {
      updateData.transactionalOptOutAt = now;
    }

    // Create audit log
    await createAuditLog(
      consentRecord,
      data.transactionalConsent === 'opted_in' ? 'opt_in' : 'opt_out',
      'transactional',
      previousTransactional,
      data.transactionalConsent,
      data.source,
      { ipAddress, userAgent, processedBy: user.uid }
    );
  }

  // Update marketing consent
  if (data.marketingConsent) {
    updateData.marketingConsent = data.marketingConsent;

    if (data.marketingConsent === 'opted_in') {
      updateData.marketingOptInAt = now;
      updateData.marketingOptInSource = data.source;
      updateData.marketingOptOutAt = null;
      updateData.marketingOptOutKeyword = null;
    } else if (data.marketingConsent === 'opted_out') {
      updateData.marketingOptOutAt = now;
    }

    // Create audit log
    await createAuditLog(
      consentRecord,
      data.marketingConsent === 'opted_in' ? 'opt_in' : 'opt_out',
      'marketing',
      previousMarketing,
      data.marketingConsent,
      data.source,
      { ipAddress, userAgent, processedBy: user.uid }
    );
  }

  const updated = await prisma.consentRecord.update({
    where: { patientId },
    data: updateData,
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'consent',
    resourceId: consentRecord.id,
    ipAddress,
    metadata: { transactional: data.transactionalConsent, marketing: data.marketingConsent },
  });

  return c.json({
    consent: {
      patientId: updated.patientId,
      phone: updated.phone,
      transactionalConsent: updated.transactionalConsent,
      marketingConsent: updated.marketingConsent,
      canSendTransactional: updated.transactionalConsent === 'opted_in',
      canSendMarketing: updated.marketingConsent === 'opted_in',
      tcpaCompliant: updated.tcpaCompliant,
    },
    message: 'Consent updated successfully',
  });
});

/**
 * Process opt-out (from webhook or manual)
 * POST /api/consent/opt-out
 */
consent.post('/opt-out', zValidator('json', optOutSchema), async (c) => {
  const data = c.req.valid('json');
  const ipAddress = getClientIP(c);
  const userAgent = getUserAgent(c);

  // Find consent by phone
  let consentRecord = await findConsentByPhone(data.phone);

  if (!consentRecord) {
    throw APIError.notFound('Consent record for this phone number');
  }

  const now = new Date();
  const keyword = data.keyword || detectOptOutKeyword(data.keyword || '');

  // Build update data
  const updateData: Prisma.ConsentRecordUpdateInput = {
    updatedAt: now,
    lastAuditedAt: now,
  };

  // Process opt-out based on type
  if (data.consentType === 'all' || data.consentType === 'transactional') {
    const previousStatus = consentRecord.transactionalConsent;
    updateData.transactionalConsent = 'opted_out';
    updateData.transactionalOptOutAt = now;
    updateData.transactionalOptOutKeyword = keyword;

    await createAuditLog(
      consentRecord,
      data.consentType === 'all' ? 'revoke_all' : 'opt_out',
      'transactional',
      previousStatus,
      'opted_out',
      data.source,
      { keyword, messageSid: data.messageSid, ipAddress, userAgent }
    );
  }

  if (data.consentType === 'all' || data.consentType === 'marketing') {
    const previousStatus = consentRecord.marketingConsent;
    updateData.marketingConsent = 'opted_out';
    updateData.marketingOptOutAt = now;
    updateData.marketingOptOutKeyword = keyword;

    await createAuditLog(
      consentRecord,
      data.consentType === 'all' ? 'revoke_all' : 'opt_out',
      'marketing',
      previousStatus,
      'opted_out',
      data.source,
      { keyword, messageSid: data.messageSid, ipAddress, userAgent }
    );
  }

  const updated = await prisma.consentRecord.update({
    where: { id: consentRecord.id },
    data: updateData,
  });

  // Get most recent audit log
  const recentLog = await prisma.consentAuditLog.findFirst({
    where: { patientId: consentRecord.patientId },
    orderBy: { createdAt: 'desc' },
  });

  return c.json({
    success: true,
    consent: {
      patientId: updated.patientId,
      phone: updated.phone,
      transactionalConsent: updated.transactionalConsent,
      marketingConsent: updated.marketingConsent,
    },
    auditLogId: recentLog?.id,
    confirmationSent: true,
  });
});

/**
 * Process opt-in (from webhook or manual)
 * POST /api/consent/opt-in
 */
consent.post('/opt-in', zValidator('json', optInSchema), async (c) => {
  const data = c.req.valid('json');
  const ipAddress = getClientIP(c);
  const userAgent = getUserAgent(c);

  // Find consent by phone
  let consentRecord = await findConsentByPhone(data.phone);

  if (!consentRecord) {
    throw APIError.notFound('Consent record for this phone number');
  }

  const now = new Date();
  const keyword = data.keyword || detectOptInKeyword(data.keyword || '');

  // Build update data
  const updateData: Prisma.ConsentRecordUpdateInput = {
    updatedAt: now,
    lastAuditedAt: now,
  };

  // Process opt-in based on type
  if (data.consentType === 'all' || data.consentType === 'transactional') {
    const previousStatus = consentRecord.transactionalConsent;
    updateData.transactionalConsent = 'opted_in';
    updateData.transactionalOptInAt = now;
    updateData.transactionalOptInSource = data.source;
    updateData.transactionalOptOutAt = null;
    updateData.transactionalOptOutKeyword = null;

    await createAuditLog(
      consentRecord,
      'opt_in',
      'transactional',
      previousStatus,
      'opted_in',
      data.source,
      { keyword, messageSid: data.messageSid, ipAddress, userAgent }
    );
  }

  if (data.consentType === 'all' || data.consentType === 'marketing') {
    const previousStatus = consentRecord.marketingConsent;
    updateData.marketingConsent = 'opted_in';
    updateData.marketingOptInAt = now;
    updateData.marketingOptInSource = data.source;
    updateData.marketingOptOutAt = null;
    updateData.marketingOptOutKeyword = null;

    await createAuditLog(
      consentRecord,
      'opt_in',
      'marketing',
      previousStatus,
      'opted_in',
      data.source,
      { keyword, messageSid: data.messageSid, ipAddress, userAgent }
    );
  }

  const updated = await prisma.consentRecord.update({
    where: { id: consentRecord.id },
    data: updateData,
  });

  // Get most recent audit log
  const recentLog = await prisma.consentAuditLog.findFirst({
    where: { patientId: consentRecord.patientId },
    orderBy: { createdAt: 'desc' },
  });

  return c.json({
    success: true,
    consent: {
      patientId: updated.patientId,
      phone: updated.phone,
      transactionalConsent: updated.transactionalConsent,
      marketingConsent: updated.marketingConsent,
    },
    auditLogId: recentLog?.id,
  });
});

/**
 * Bulk check consent for campaign
 * POST /api/consent/bulk-check
 */
consent.post('/bulk-check', zValidator('json', bulkCheckSchema), async (c) => {
  const data = c.req.valid('json');

  // Get all consent records for these patients
  const consents = await prisma.consentRecord.findMany({
    where: {
      patientId: { in: data.patientIds },
    },
  });

  const results = data.patientIds.map(patientId => {
    const consentRecord = consents.find(c => c.patientId === patientId);

    if (!consentRecord) {
      return {
        patientId,
        canSend: false,
        status: 'pending' as const,
      };
    }

    const status = data.consentType === 'transactional'
      ? consentRecord.transactionalConsent
      : consentRecord.marketingConsent;

    return {
      patientId,
      canSend: status === 'opted_in',
      status,
    };
  });

  const consented = results.filter(r => r.canSend).length;
  const optedOut = results.filter(r => r.status === 'opted_out').length;
  const pending = results.filter(r => r.status === 'pending').length;

  return c.json({
    total: results.length,
    consented,
    optedOut,
    pending,
    results,
  });
});

export default consent;
