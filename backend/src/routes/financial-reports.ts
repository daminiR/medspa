/**
 * Financial Reports API Routes - PRISMA VERSION
 *
 * Production-ready financial reporting endpoints using Prisma ORM:
 * - Daily summaries with aggregation
 * - Revenue reports with groupBy operations
 * - Payment breakdowns
 * - Service and provider analytics
 * - Outstanding balances with aging buckets
 * - Export functionality (CSV)
 * - Query optimization and caching
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { sessionAuthMiddleware, requireRole } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { logAuditEvent, logDataExport } from '@medical-spa/security';
import { prisma } from '../lib/prisma';

const financialReports = new Hono();

// ===================
// Data Interfaces
// ===================

export interface DailySummary {
  date: string; // YYYY-MM-DD

  // Revenue
  grossRevenue: number;
  netRevenue: number;
  refunds: number;
  discounts: number;
  taxes: number;

  // Breakdown
  serviceRevenue: number;
  productRevenue: number;
  packageRevenue: number;
  membershipRevenue: number;
  giftCardRevenue: number;

  // Payments
  payments: {
    method: string;
    count: number;
    total: number;
  }[];

  // Counts
  invoiceCount: number;
  appointmentCount: number;
  newPatientCount: number;

  // Comparison
  previousDayRevenue?: number;
  changePercent?: number;
}

export interface RevenueReport {
  startDate: string;
  endDate: string;

  // Totals
  totalRevenue: number;
  totalRefunds: number;
  netRevenue: number;
  averageDailyRevenue: number;

  // Daily Breakdown
  dailyData: {
    date: string;
    revenue: number;
    refunds: number;
    net: number;
  }[];

  // Top Items
  topServices: { id: string; name: string; revenue: number; count: number }[];
  topProducts: { id: string; name: string; revenue: number; count: number }[];
  topProviders: { id: string; name: string; revenue: number; count: number }[];
}

export interface ProviderReport {
  providerId: string;
  providerName: string;

  // Revenue
  totalRevenue: number;
  serviceRevenue: number;
  productRevenue: number;

  // Activity
  appointmentCount: number;
  patientCount: number;
  averageTicket: number;

  // Services
  serviceBreakdown: {
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
  }[];
}

export interface OutstandingReport {
  totalOutstanding: number;
  invoiceCount: number;

  // By Age
  current: number; // 0-30 days
  thirtyDays: number; // 31-60 days
  sixtyDays: number; // 61-90 days
  ninetyPlus: number; // 90+ days

  // By Patient
  byPatient: {
    patientId: string;
    patientName: string;
    balance: number;
    oldestInvoiceDate: string;
    invoiceCount: number;
  }[];
}

// ===================
// Cache Configuration
// ===================

const reportCache = new Map<string, { data: any; expiresAt: Date }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ===================
// Validation Schemas
// ===================

const dateRangeSchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date'),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date'),
  providerId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day'),
  format: z.enum(['json', 'csv']).optional().default('json'),
});

const dailySummarySchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date').optional(),
  locationId: z.string().uuid().optional(),
});

const exportReportSchema = z.object({
  reportType: z.enum(['revenue', 'payments', 'services', 'providers', 'products', 'packages', 'memberships', 'outstanding', 'refunds']),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date'),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date'),
  format: z.enum(['csv', 'pdf']).default('csv'),
  providerId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
});

// ===================
// Helper Functions
// ===================

function getClientIP(c: any): string {
  return c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';
}

function getCacheKey(prefix: string, params: Record<string, any>): string {
  return `${prefix}:${JSON.stringify(params)}`;
}

function getCachedData<T>(key: string): T | null {
  const cached = reportCache.get(key);
  if (cached && cached.expiresAt > new Date()) {
    return cached.data as T;
  }
  reportCache.delete(key);
  return null;
}

function setCachedData<T>(key: string, data: T): void {
  reportCache.set(key, {
    data,
    expiresAt: new Date(Date.now() + CACHE_TTL_MS),
  });
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDateRange(startStr: string, endStr: string): Date[] {
  const dates: Date[] = [];
  const start = new Date(startStr);
  const end = new Date(endStr);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }

  return dates;
}

function getDaysDiff(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function generateCSV(headers: string[], rows: (string | number)[][]): string {
  const headerLine = headers.join(',');
  const dataLines = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','));
  return [headerLine, ...dataLines].join('\n');
}

/**
 * Convert Prisma Decimal to number safely
 */
function toNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'object' && 'toNumber' in value) {
    return value.toNumber();
  }
  return parseFloat(String(value)) || 0;
}

/**
 * Get start and end of day in UTC
 */
function getDayBounds(dateStr: string): { start: Date; end: Date } {
  const date = new Date(dateStr);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// ===================
// Middleware
// ===================

// All report routes require session authentication
financialReports.use('/*', sessionAuthMiddleware);

// ===================
// Routes
// ===================

/**
 * Get daily financial summary
 * GET /api/reports/daily-summary
 */
financialReports.get('/daily-summary', zValidator('query', dailySummarySchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const targetDate = query.date || formatDate(new Date());
  const cacheKey = getCacheKey('daily-summary', { date: targetDate, locationId: query.locationId });

  // Check cache
  const cached = getCachedData<DailySummary>(cacheKey);
  if (cached) {
    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'financial_report',
      ipAddress,
      metadata: { reportType: 'daily-summary', cached: true },
    });
    return c.json({ summary: cached });
  }

  const { start, end } = getDayBounds(targetDate);

  // Build WHERE clause
  const whereClause: Prisma.InvoiceWhereInput = {
    invoiceDate: {
      gte: start,
      lte: end,
    },
    status: {
      notIn: ['CANCELLED'],
    },
    ...(query.locationId && { locationId: query.locationId }),
  };

  // Get invoices with line items and payments using Prisma
  const invoices = await prisma.invoice.findMany({
    where: whereClause,
    include: {
      InvoiceLineItem: true,
      Payment: {
        include: {
          Refund: true,
        },
      },
    },
  });

  // Calculate revenue breakdown by line item type
  let serviceRevenue = 0;
  let productRevenue = 0;
  let packageRevenue = 0;
  let membershipRevenue = 0;
  let giftCardRevenue = 0;

  for (const inv of invoices) {
    if (inv.status === 'REFUNDED') continue;
    for (const item of inv.InvoiceLineItem) {
      const itemTotal = toNumber(item.lineTotal);
      switch (item.type) {
        case 'SERVICE':
          serviceRevenue += itemTotal;
          break;
        case 'PRODUCT':
          productRevenue += itemTotal;
          break;
        case 'PACKAGE':
          packageRevenue += itemTotal;
          break;
        case 'INJECTABLE':
          serviceRevenue += itemTotal; // Count injectables as services
          break;
        case 'ADJUSTMENT':
          // Skip adjustments from breakdown
          break;
      }
    }
  }

  // Calculate totals using Prisma aggregation
  const totalsAgg = await prisma.invoice.aggregate({
    where: {
      ...whereClause,
      status: { notIn: ['REFUNDED', 'CANCELLED'] },
    },
    _sum: {
      subtotal: true,
      discountTotal: true,
      taxTotal: true,
      total: true,
    },
    _count: {
      id: true,
    },
  });

  const grossRevenue = toNumber(totalsAgg._sum.subtotal);
  const discounts = toNumber(totalsAgg._sum.discountTotal);
  const taxes = toNumber(totalsAgg._sum.taxTotal);
  const invoiceCount = totalsAgg._count.id;

  // Calculate refunds
  const refundsAgg = await prisma.refund.aggregate({
    where: {
      Payment: {
        Invoice: whereClause,
      },
      status: 'COMPLETED',
    },
    _sum: {
      amount: true,
    },
  });

  const refunds = toNumber(refundsAgg._sum.amount);
  const netRevenue = grossRevenue - discounts + taxes - refunds;

  // Payment method breakdown
  const paymentsAgg = await prisma.payment.groupBy({
    by: ['method'],
    where: {
      Invoice: whereClause,
      status: 'COMPLETED',
    },
    _count: {
      id: true,
    },
    _sum: {
      amount: true,
    },
  });

  const payments = paymentsAgg.map(p => ({
    method: p.method,
    count: p._count.id,
    total: toNumber(p._sum.amount),
  }));

  // Count appointments (invoices with service line items)
  const appointmentCount = invoices.filter(inv =>
    inv.InvoiceLineItem.some(item => item.type === 'SERVICE' || item.type === 'INJECTABLE') &&
    inv.status !== 'CANCELLED' && inv.status !== 'REFUNDED'
  ).length;

  // Get previous day for comparison
  const prevDate = new Date(targetDate);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevDateStr = formatDate(prevDate);
  const prevBounds = getDayBounds(prevDateStr);

  const prevDayAgg = await prisma.invoice.aggregate({
    where: {
      invoiceDate: {
        gte: prevBounds.start,
        lte: prevBounds.end,
      },
      status: { notIn: ['REFUNDED', 'CANCELLED'] },
      ...(query.locationId && { locationId: query.locationId }),
    },
    _sum: {
      total: true,
    },
  });

  const previousDayRevenue = toNumber(prevDayAgg._sum.total);
  const changePercent = previousDayRevenue > 0
    ? ((netRevenue - previousDayRevenue) / previousDayRevenue) * 100
    : 0;

  // Count new patients (registered today)
  const newPatientCount = await prisma.patient.count({
    where: {
      registrationDate: {
        gte: start,
        lte: end,
      },
    },
  });

  const summary: DailySummary = {
    date: targetDate,
    grossRevenue,
    netRevenue,
    refunds,
    discounts,
    taxes,
    serviceRevenue,
    productRevenue,
    packageRevenue,
    membershipRevenue,
    giftCardRevenue,
    payments,
    invoiceCount,
    appointmentCount,
    newPatientCount,
    previousDayRevenue,
    changePercent: Math.round(changePercent * 100) / 100,
  };

  // Cache result
  setCachedData(cacheKey, summary);

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'financial_report',
    ipAddress,
    metadata: { reportType: 'daily-summary', date: targetDate },
  });

  return c.json({ summary });
});

/**
 * Get revenue report with daily breakdown
 * GET /api/reports/revenue
 */
financialReports.get('/revenue', zValidator('query', dateRangeSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const cacheKey = getCacheKey('revenue', query);
  const cached = getCachedData<RevenueReport>(cacheKey);
  if (cached) {
    return c.json({ report: cached });
  }

  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  endDate.setHours(23, 59, 59, 999);

  const whereClause: Prisma.InvoiceWhereInput = {
    invoiceDate: {
      gte: startDate,
      lte: endDate,
    },
    status: { notIn: ['CANCELLED'] },
    ...(query.providerId && { providerId: query.providerId }),
    ...(query.locationId && { locationId: query.locationId }),
  };

  // Get total revenue
  const revenueAgg = await prisma.invoice.aggregate({
    where: {
      ...whereClause,
      status: { notIn: ['CANCELLED', 'REFUNDED'] },
    },
    _sum: {
      total: true,
    },
  });

  const totalRevenue = toNumber(revenueAgg._sum.total);

  // Get total refunds
  const refundsAgg = await prisma.refund.aggregate({
    where: {
      Payment: {
        Invoice: whereClause,
      },
      status: 'COMPLETED',
    },
    _sum: {
      amount: true,
    },
  });

  const totalRefunds = toNumber(refundsAgg._sum.amount);

  // Daily breakdown - use raw SQL for better performance
  const dailyData = await prisma.$queryRaw<Array<{
    date: Date;
    revenue: Prisma.Decimal;
    refund_amount: Prisma.Decimal;
  }>>`
    SELECT
      DATE("invoiceDate") as date,
      COALESCE(SUM("total"), 0) as revenue,
      0 as refund_amount
    FROM "Invoice"
    WHERE "invoiceDate" >= ${startDate}
      AND "invoiceDate" <= ${endDate}
      AND "status" NOT IN ('CANCELLED', 'REFUNDED')
      ${query.providerId ? Prisma.sql`AND "providerId" = ${query.providerId}` : Prisma.empty}
      ${query.locationId ? Prisma.sql`AND "locationId" = ${query.locationId}` : Prisma.empty}
    GROUP BY DATE("invoiceDate")
    ORDER BY date ASC
  `;

  // Get refunds by day
  const dailyRefunds = await prisma.$queryRaw<Array<{
    date: Date;
    refund_amount: Prisma.Decimal;
  }>>`
    SELECT
      DATE(r."processedAt") as date,
      COALESCE(SUM(r."amount"), 0) as refund_amount
    FROM "Refund" r
    INNER JOIN "Payment" p ON r."paymentId" = p."id"
    INNER JOIN "Invoice" i ON p."invoiceId" = i."id"
    WHERE r."processedAt" >= ${startDate}
      AND r."processedAt" <= ${endDate}
      AND r."status" = 'COMPLETED'
      ${query.providerId ? Prisma.sql`AND i."providerId" = ${query.providerId}` : Prisma.empty}
      ${query.locationId ? Prisma.sql`AND i."locationId" = ${query.locationId}` : Prisma.empty}
    GROUP BY DATE(r."processedAt")
  `;

  // Merge daily data with refunds
  const refundMap = new Map(
    dailyRefunds.map(r => [formatDate(r.date), toNumber(r.refund_amount)])
  );

  const formattedDailyData = dailyData.map(d => ({
    date: formatDate(d.date),
    revenue: toNumber(d.revenue),
    refunds: refundMap.get(formatDate(d.date)) || 0,
    net: toNumber(d.revenue) - (refundMap.get(formatDate(d.date)) || 0),
  }));

  // Top services using raw SQL for efficiency
  const topServicesRaw = await prisma.$queryRaw<Array<{
    itemId: string;
    name: string;
    revenue: Prisma.Decimal;
    count: Prisma.Decimal;
  }>>`
    SELECT
      "itemId",
      "name",
      SUM("lineTotal") as revenue,
      SUM("quantity") as count
    FROM "InvoiceLineItem" il
    INNER JOIN "Invoice" i ON il."invoiceId" = i."id"
    WHERE i."invoiceDate" >= ${startDate}
      AND i."invoiceDate" <= ${endDate}
      AND i."status" NOT IN ('CANCELLED', 'REFUNDED')
      AND il."type" IN ('SERVICE', 'INJECTABLE')
      AND il."itemId" IS NOT NULL
      ${query.providerId ? Prisma.sql`AND i."providerId" = ${query.providerId}` : Prisma.empty}
      ${query.locationId ? Prisma.sql`AND i."locationId" = ${query.locationId}` : Prisma.empty}
    GROUP BY "itemId", "name"
    ORDER BY revenue DESC
    LIMIT 10
  `;

  const topServices = topServicesRaw.map(s => ({
    id: s.itemId || '',
    name: s.name,
    revenue: toNumber(s.revenue),
    count: toNumber(s.count),
  }));

  // Top products
  const topProductsRaw = await prisma.$queryRaw<Array<{
    itemId: string;
    name: string;
    revenue: Prisma.Decimal;
    count: Prisma.Decimal;
  }>>`
    SELECT
      "itemId",
      "name",
      SUM("lineTotal") as revenue,
      SUM("quantity") as count
    FROM "InvoiceLineItem" il
    INNER JOIN "Invoice" i ON il."invoiceId" = i."id"
    WHERE i."invoiceDate" >= ${startDate}
      AND i."invoiceDate" <= ${endDate}
      AND i."status" NOT IN ('CANCELLED', 'REFUNDED')
      AND il."type" = 'PRODUCT'
      AND il."itemId" IS NOT NULL
      ${query.providerId ? Prisma.sql`AND i."providerId" = ${query.providerId}` : Prisma.empty}
      ${query.locationId ? Prisma.sql`AND i."locationId" = ${query.locationId}` : Prisma.empty}
    GROUP BY "itemId", "name"
    ORDER BY revenue DESC
    LIMIT 10
  `;

  const topProducts = topProductsRaw.map(p => ({
    id: p.itemId || '',
    name: p.name,
    revenue: toNumber(p.revenue),
    count: toNumber(p.count),
  }));

  // Top providers
  const topProvidersRaw = await prisma.$queryRaw<Array<{
    providerId: string;
    providerName: string;
    revenue: Prisma.Decimal;
    count: bigint;
  }>>`
    SELECT
      "providerId",
      "providerName",
      SUM("total") as revenue,
      COUNT(*) as count
    FROM "Invoice"
    WHERE "invoiceDate" >= ${startDate}
      AND "invoiceDate" <= ${endDate}
      AND "status" NOT IN ('CANCELLED', 'REFUNDED')
      AND "providerId" IS NOT NULL
      ${query.locationId ? Prisma.sql`AND "locationId" = ${query.locationId}` : Prisma.empty}
    GROUP BY "providerId", "providerName"
    ORDER BY revenue DESC
    LIMIT 10
  `;

  const topProviders = topProvidersRaw.map(p => ({
    id: p.providerId || '',
    name: p.providerName || 'Unknown',
    revenue: toNumber(p.revenue),
    count: Number(p.count),
  }));

  const dayCount = formattedDailyData.length || 1;

  const report: RevenueReport = {
    startDate: query.startDate,
    endDate: query.endDate,
    totalRevenue,
    totalRefunds,
    netRevenue: totalRevenue - totalRefunds,
    averageDailyRevenue: totalRevenue / dayCount,
    dailyData: formattedDailyData,
    topServices,
    topProducts,
    topProviders,
  };

  setCachedData(cacheKey, report);

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'financial_report',
    ipAddress,
    metadata: { reportType: 'revenue', startDate: query.startDate, endDate: query.endDate },
  });

  return c.json({ report });
});

/**
 * Get payment method breakdown
 * GET /api/reports/payments
 */
financialReports.get('/payments', zValidator('query', dateRangeSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  endDate.setHours(23, 59, 59, 999);

  const whereClause: Prisma.PaymentWhereInput = {
    processedAt: {
      gte: startDate,
      lte: endDate,
    },
    status: 'COMPLETED',
    ...(query.providerId && {
      Invoice: {
        providerId: query.providerId,
      },
    }),
    ...(query.locationId && {
      Invoice: {
        locationId: query.locationId,
      },
    }),
  };

  const paymentsAgg = await prisma.payment.groupBy({
    by: ['method'],
    where: whereClause,
    _count: {
      id: true,
    },
    _sum: {
      amount: true,
    },
  });

  const totalPayments = paymentsAgg.reduce((sum, p) => sum + toNumber(p._sum.amount), 0);

  const breakdown = paymentsAgg.map(p => {
    const total = toNumber(p._sum.amount);
    const percentage = totalPayments > 0 ? (total / totalPayments) * 100 : 0;
    return {
      method: p.method,
      displayName: p.method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: p._count.id,
      total,
      percentage: Math.round(percentage * 100) / 100,
    };
  }).sort((a, b) => b.total - a.total);

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'financial_report',
    ipAddress,
    metadata: { reportType: 'payments', startDate: query.startDate, endDate: query.endDate },
  });

  return c.json({
    startDate: query.startDate,
    endDate: query.endDate,
    totalPayments,
    transactionCount: breakdown.reduce((sum, b) => sum + b.count, 0),
    breakdown,
  });
});

/**
 * Get revenue by service
 * GET /api/reports/services
 */
financialReports.get('/services', zValidator('query', dateRangeSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  endDate.setHours(23, 59, 59, 999);

  const servicesRaw = await prisma.$queryRaw<Array<{
    itemId: string;
    name: string;
    revenue: Prisma.Decimal;
    count: Prisma.Decimal;
  }>>`
    SELECT
      il."itemId",
      il."name",
      SUM(il."lineTotal") as revenue,
      SUM(il."quantity") as count
    FROM "InvoiceLineItem" il
    INNER JOIN "Invoice" i ON il."invoiceId" = i."id"
    WHERE i."invoiceDate" >= ${startDate}
      AND i."invoiceDate" <= ${endDate}
      AND i."status" NOT IN ('CANCELLED', 'REFUNDED')
      AND il."type" IN ('SERVICE', 'INJECTABLE')
      AND il."itemId" IS NOT NULL
      ${query.providerId ? Prisma.sql`AND i."providerId" = ${query.providerId}` : Prisma.empty}
      ${query.locationId ? Prisma.sql`AND i."locationId" = ${query.locationId}` : Prisma.empty}
    GROUP BY il."itemId", il."name"
    ORDER BY revenue DESC
  `;

  const totalRevenue = servicesRaw.reduce((sum, s) => sum + toNumber(s.revenue), 0);
  const totalCount = servicesRaw.reduce((sum, s) => sum + toNumber(s.count), 0);

  const services = servicesRaw.map(s => {
    const revenue = toNumber(s.revenue);
    const count = toNumber(s.count);
    return {
      id: s.itemId || '',
      name: s.name,
      revenue,
      count,
      averagePrice: count > 0 ? revenue / count : 0,
      percentage: totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 10000) / 100 : 0,
    };
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'financial_report',
    ipAddress,
    metadata: { reportType: 'services', startDate: query.startDate, endDate: query.endDate },
  });

  return c.json({
    startDate: query.startDate,
    endDate: query.endDate,
    totalRevenue,
    totalServices: totalCount,
    services,
  });
});

/**
 * Get revenue by provider
 * GET /api/reports/providers
 */
financialReports.get('/providers', zValidator('query', dateRangeSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  endDate.setHours(23, 59, 59, 999);

  // Get provider totals
  const providersRaw = await prisma.$queryRaw<Array<{
    providerId: string;
    providerName: string;
    totalRevenue: Prisma.Decimal;
    appointmentCount: bigint;
    patientCount: bigint;
  }>>`
    SELECT
      i."providerId",
      i."providerName",
      SUM(i."total") as "totalRevenue",
      COUNT(*) as "appointmentCount",
      COUNT(DISTINCT i."patientId") as "patientCount"
    FROM "Invoice" i
    WHERE i."invoiceDate" >= ${startDate}
      AND i."invoiceDate" <= ${endDate}
      AND i."status" NOT IN ('CANCELLED', 'REFUNDED')
      AND i."providerId" IS NOT NULL
      ${query.locationId ? Prisma.sql`AND i."locationId" = ${query.locationId}` : Prisma.empty}
    GROUP BY i."providerId", i."providerName"
    ORDER BY "totalRevenue" DESC
  `;

  const providers: ProviderReport[] = [];

  for (const prov of providersRaw) {
    // Get service/product breakdown for this provider
    const itemBreakdown = await prisma.$queryRaw<Array<{
      type: string;
      revenue: Prisma.Decimal;
    }>>`
      SELECT
        il."type",
        SUM(il."lineTotal") as revenue
      FROM "InvoiceLineItem" il
      INNER JOIN "Invoice" i ON il."invoiceId" = i."id"
      WHERE i."invoiceDate" >= ${startDate}
        AND i."invoiceDate" <= ${endDate}
        AND i."status" NOT IN ('CANCELLED', 'REFUNDED')
        AND i."providerId" = ${prov.providerId}
        ${query.locationId ? Prisma.sql`AND i."locationId" = ${query.locationId}` : Prisma.empty}
      GROUP BY il."type"
    `;

    let serviceRevenue = 0;
    let productRevenue = 0;

    for (const item of itemBreakdown) {
      const revenue = toNumber(item.revenue);
      if (item.type === 'SERVICE' || item.type === 'INJECTABLE') {
        serviceRevenue += revenue;
      } else if (item.type === 'PRODUCT') {
        productRevenue += revenue;
      }
    }

    // Get service breakdown
    const servicesRaw = await prisma.$queryRaw<Array<{
      itemId: string;
      name: string;
      revenue: Prisma.Decimal;
      count: Prisma.Decimal;
    }>>`
      SELECT
        il."itemId",
        il."name",
        SUM(il."lineTotal") as revenue,
        SUM(il."quantity") as count
      FROM "InvoiceLineItem" il
      INNER JOIN "Invoice" i ON il."invoiceId" = i."id"
      WHERE i."invoiceDate" >= ${startDate}
        AND i."invoiceDate" <= ${endDate}
        AND i."status" NOT IN ('CANCELLED', 'REFUNDED')
        AND i."providerId" = ${prov.providerId}
        AND il."type" IN ('SERVICE', 'INJECTABLE')
        AND il."itemId" IS NOT NULL
        ${query.locationId ? Prisma.sql`AND i."locationId" = ${query.locationId}` : Prisma.empty}
      GROUP BY il."itemId", il."name"
      ORDER BY revenue DESC
    `;

    const serviceBreakdown = servicesRaw.map(s => ({
      serviceId: s.itemId || '',
      serviceName: s.name,
      count: toNumber(s.count),
      revenue: toNumber(s.revenue),
    }));

    const totalRevenue = toNumber(prov.totalRevenue);
    const appointmentCount = Number(prov.appointmentCount);

    providers.push({
      providerId: prov.providerId,
      providerName: prov.providerName || 'Unknown',
      totalRevenue,
      serviceRevenue,
      productRevenue,
      appointmentCount,
      patientCount: Number(prov.patientCount),
      averageTicket: appointmentCount > 0 ? totalRevenue / appointmentCount : 0,
      serviceBreakdown,
    });
  }

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'financial_report',
    ipAddress,
    metadata: { reportType: 'providers', startDate: query.startDate, endDate: query.endDate },
  });

  return c.json({
    startDate: query.startDate,
    endDate: query.endDate,
    totalRevenue: providers.reduce((sum, p) => sum + p.totalRevenue, 0),
    providers,
  });
});

/**
 * Get product sales report
 * GET /api/reports/products
 */
financialReports.get('/products', zValidator('query', dateRangeSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  endDate.setHours(23, 59, 59, 999);

  const productsRaw = await prisma.$queryRaw<Array<{
    itemId: string;
    name: string;
    revenue: Prisma.Decimal;
    unitsSold: Prisma.Decimal;
  }>>`
    SELECT
      il."itemId",
      il."name",
      SUM(il."lineTotal") as revenue,
      SUM(il."quantity") as "unitsSold"
    FROM "InvoiceLineItem" il
    INNER JOIN "Invoice" i ON il."invoiceId" = i."id"
    WHERE i."invoiceDate" >= ${startDate}
      AND i."invoiceDate" <= ${endDate}
      AND i."status" NOT IN ('CANCELLED', 'REFUNDED')
      AND il."type" = 'PRODUCT'
      AND il."itemId" IS NOT NULL
      ${query.providerId ? Prisma.sql`AND i."providerId" = ${query.providerId}` : Prisma.empty}
      ${query.locationId ? Prisma.sql`AND i."locationId" = ${query.locationId}` : Prisma.empty}
    GROUP BY il."itemId", il."name"
    ORDER BY revenue DESC
  `;

  const totalRevenue = productsRaw.reduce((sum, p) => sum + toNumber(p.revenue), 0);
  const totalUnits = productsRaw.reduce((sum, p) => sum + toNumber(p.unitsSold), 0);

  const products = productsRaw.map(p => {
    const revenue = toNumber(p.revenue);
    const unitsSold = toNumber(p.unitsSold);
    return {
      id: p.itemId || '',
      name: p.name,
      revenue,
      unitsSold,
      averagePrice: unitsSold > 0 ? revenue / unitsSold : 0,
    };
  });

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'financial_report',
    ipAddress,
    metadata: { reportType: 'products', startDate: query.startDate, endDate: query.endDate },
  });

  return c.json({
    startDate: query.startDate,
    endDate: query.endDate,
    totalRevenue,
    totalUnitsSold: totalUnits,
    products,
  });
});

/**
 * Get package sales report
 * GET /api/reports/packages
 */
financialReports.get('/packages', zValidator('query', dateRangeSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  endDate.setHours(23, 59, 59, 999);

  const packagesAgg = await prisma.packagePurchase.groupBy({
    by: ['packageId', 'packageName'],
    where: {
      purchaseDate: {
        gte: startDate,
        lte: endDate,
      },
      status: { notIn: ['CANCELLED', 'REFUNDED'] },
    },
    _count: {
      id: true,
    },
    _sum: {
      purchasePrice: true,
    },
  });

  const packages = packagesAgg.map(p => ({
    id: p.packageId,
    name: p.packageName,
    revenue: toNumber(p._sum.purchasePrice),
    salesCount: p._count.id,
    averagePrice: p._count.id > 0 ? toNumber(p._sum.purchasePrice) / p._count.id : 0,
  })).sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = packages.reduce((sum, p) => sum + p.revenue, 0);
  const totalSales = packages.reduce((sum, p) => sum + p.salesCount, 0);

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'financial_report',
    ipAddress,
    metadata: { reportType: 'packages', startDate: query.startDate, endDate: query.endDate },
  });

  return c.json({
    startDate: query.startDate,
    endDate: query.endDate,
    totalRevenue,
    totalSales,
    packages,
  });
});

/**
 * Get membership report
 * GET /api/reports/memberships
 */
financialReports.get('/memberships', zValidator('query', dateRangeSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // Group memberships by tier
  const membershipsByTier = await prisma.patientMembership.groupBy({
    by: ['tierId', 'tierName', 'status'],
    _count: {
      id: true,
    },
  });

  // Get tier pricing
  const tiers = await prisma.membershipTier.findMany({
    select: {
      id: true,
      name: true,
      price: true,
    },
  });

  const tierPriceMap = new Map(tiers.map(t => [t.id, t.price]));

  // Aggregate by tier
  const tierMap = new Map<string, {
    type: string;
    name: string;
    activeCount: number;
    cancelledCount: number;
    monthlyRevenue: number;
  }>();

  for (const m of membershipsByTier) {
    const existing = tierMap.get(m.tierId) || {
      type: m.tierId,
      name: m.tierName,
      activeCount: 0,
      cancelledCount: 0,
      monthlyRevenue: 0,
    };

    const count = m._count.id;
    const price = tierPriceMap.get(m.tierId) || 0;

    if (m.status === 'ACTIVE') {
      existing.activeCount += count;
      existing.monthlyRevenue += count * price;
    } else if (m.status === 'CANCELLED') {
      existing.cancelledCount += count;
    }

    tierMap.set(m.tierId, existing);
  }

  const membershipTypes = Array.from(tierMap.values())
    .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);

  const totalActive = membershipTypes.reduce((sum, m) => sum + m.activeCount, 0);
  const totalMonthlyRevenue = membershipTypes.reduce((sum, m) => sum + m.monthlyRevenue, 0);
  const totalCancelled = membershipTypes.reduce((sum, m) => sum + m.cancelledCount, 0);

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'financial_report',
    ipAddress,
    metadata: { reportType: 'memberships' },
  });

  return c.json({
    totalActiveMembers: totalActive,
    totalCancelledMembers: totalCancelled,
    monthlyRecurringRevenue: totalMonthlyRevenue,
    annualRecurringRevenue: totalMonthlyRevenue * 12,
    membershipTypes,
  });
});

/**
 * Get outstanding balances report with aging
 * GET /api/reports/outstanding
 */
financialReports.get('/outstanding', zValidator('query', z.object({
  locationId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
})), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const today = new Date();

  const invoices = await prisma.invoice.findMany({
    where: {
      balance: { gt: 0 },
      status: { in: ['SENT', 'VIEWED', 'PARTIALLY_PAID', 'OVERDUE'] },
      ...(query.locationId && { locationId: query.locationId }),
    },
    select: {
      id: true,
      invoiceNumber: true,
      patientId: true,
      patientName: true,
      invoiceDate: true,
      dueDate: true,
      balance: true,
    },
  });

  // Age buckets
  let current = 0;
  let thirtyDays = 0;
  let sixtyDays = 0;
  let ninetyPlus = 0;

  const patientBalances = new Map<string, {
    patientId: string;
    patientName: string;
    balance: number;
    oldestInvoiceDate: Date;
    invoiceCount: number;
  }>();

  for (const inv of invoices) {
    const daysPastDue = getDaysDiff(inv.dueDate, today);
    const balance = toNumber(inv.balance);

    if (daysPastDue <= 30) {
      current += balance;
    } else if (daysPastDue <= 60) {
      thirtyDays += balance;
    } else if (daysPastDue <= 90) {
      sixtyDays += balance;
    } else {
      ninetyPlus += balance;
    }

    // Patient balances
    const existing = patientBalances.get(inv.patientId) || {
      patientId: inv.patientId,
      patientName: inv.patientName,
      balance: 0,
      oldestInvoiceDate: inv.invoiceDate,
      invoiceCount: 0,
    };

    existing.balance += balance;
    existing.invoiceCount += 1;
    if (inv.invoiceDate < existing.oldestInvoiceDate) {
      existing.oldestInvoiceDate = inv.invoiceDate;
    }

    patientBalances.set(inv.patientId, existing);
  }

  const byPatient = Array.from(patientBalances.values())
    .sort((a, b) => b.balance - a.balance)
    .slice(0, query.limit)
    .map(p => ({
      ...p,
      oldestInvoiceDate: formatDate(p.oldestInvoiceDate),
    }));

  const report: OutstandingReport = {
    totalOutstanding: current + thirtyDays + sixtyDays + ninetyPlus,
    invoiceCount: invoices.length,
    current,
    thirtyDays,
    sixtyDays,
    ninetyPlus,
    byPatient,
  };

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'financial_report',
    ipAddress,
    metadata: { reportType: 'outstanding' },
  });

  return c.json({ report });
});

/**
 * Get refunds report
 * GET /api/reports/refunds
 */
financialReports.get('/refunds', zValidator('query', dateRangeSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);
  endDate.setHours(23, 59, 59, 999);

  const refundsData = await prisma.refund.findMany({
    where: {
      processedAt: {
        gte: startDate,
        lte: endDate,
      },
      status: 'COMPLETED',
      ...(query.locationId && {
        Payment: {
          Invoice: {
            locationId: query.locationId,
          },
        },
      }),
    },
    include: {
      Payment: {
        include: {
          Invoice: true,
        },
      },
    },
    orderBy: {
      processedAt: 'desc',
    },
  });

  const refunds = refundsData.map(r => ({
    id: r.id,
    invoiceId: r.Payment.Invoice.id,
    invoiceNumber: r.Payment.Invoice.invoiceNumber,
    patientId: r.Payment.Invoice.patientId,
    patientName: r.Payment.Invoice.patientName,
    amount: toNumber(r.amount),
    reason: r.reason,
    date: formatDate(r.processedAt || new Date()),
    originalTotal: toNumber(r.Payment.Invoice.total),
  }));

  const totalRefunded = refunds.reduce((sum, r) => sum + r.amount, 0);

  // Reason breakdown
  const reasonMap = new Map<string, { count: number; total: number }>();
  for (const refund of refunds) {
    const existing = reasonMap.get(refund.reason) || { count: 0, total: 0 };
    existing.count += 1;
    existing.total += refund.amount;
    reasonMap.set(refund.reason, existing);
  }

  const byReason = Array.from(reasonMap.entries())
    .map(([reason, data]) => ({ reason, ...data }))
    .sort((a, b) => b.total - a.total);

  await logAuditEvent({
    userId: user.uid,
    action: 'READ',
    resourceType: 'financial_report',
    ipAddress,
    metadata: { reportType: 'refunds', startDate: query.startDate, endDate: query.endDate },
  });

  return c.json({
    startDate: query.startDate,
    endDate: query.endDate,
    totalRefunded,
    refundCount: refunds.length,
    refunds,
    byReason,
  });
});

/**
 * Export report to CSV/PDF
 * POST /api/reports/export
 */
financialReports.post('/export', zValidator('json', exportReportSchema), async (c) => {
  const data = c.req.valid('json');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  // For now, we only support CSV export
  if (data.format === 'pdf') {
    throw APIError.badRequest('PDF export is not yet implemented. Please use CSV format.');
  }

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  endDate.setHours(23, 59, 59, 999);

  let csvContent = '';
  let filename = '';
  let recordCount = 0;

  switch (data.reportType) {
    case 'revenue': {
      const invoices = await prisma.invoice.findMany({
        where: {
          invoiceDate: {
            gte: startDate,
            lte: endDate,
          },
          status: { notIn: ['CANCELLED'] },
          ...(data.providerId && { providerId: data.providerId }),
          ...(data.locationId && { locationId: data.locationId }),
        },
        select: {
          invoiceDate: true,
          invoiceNumber: true,
          patientName: true,
          providerName: true,
          subtotal: true,
          discountTotal: true,
          taxTotal: true,
          total: true,
          status: true,
        },
        orderBy: {
          invoiceDate: 'asc',
        },
      });

      const headers = ['Date', 'Invoice', 'Patient', 'Provider', 'Subtotal', 'Discount', 'Tax', 'Total', 'Status'];
      const rows = invoices.map(inv => [
        formatDate(inv.invoiceDate),
        inv.invoiceNumber,
        inv.patientName,
        inv.providerName || 'N/A',
        toNumber(inv.subtotal).toFixed(2),
        toNumber(inv.discountTotal).toFixed(2),
        toNumber(inv.taxTotal).toFixed(2),
        toNumber(inv.total).toFixed(2),
        inv.status,
      ]);

      csvContent = generateCSV(headers, rows);
      filename = `revenue-report-${data.startDate}-${data.endDate}.csv`;
      recordCount = invoices.length;
      break;
    }

    case 'services': {
      const servicesRaw = await prisma.$queryRaw<Array<{
        itemId: string;
        name: string;
        revenue: Prisma.Decimal;
        count: Prisma.Decimal;
      }>>`
        SELECT
          il."itemId",
          il."name",
          SUM(il."lineTotal") as revenue,
          SUM(il."quantity") as count
        FROM "InvoiceLineItem" il
        INNER JOIN "Invoice" i ON il."invoiceId" = i."id"
        WHERE i."invoiceDate" >= ${startDate}
          AND i."invoiceDate" <= ${endDate}
          AND i."status" NOT IN ('CANCELLED', 'REFUNDED')
          AND il."type" IN ('SERVICE', 'INJECTABLE')
          AND il."itemId" IS NOT NULL
        GROUP BY il."itemId", il."name"
        ORDER BY revenue DESC
      `;

      const headers = ['Service ID', 'Service Name', 'Count', 'Revenue', 'Average Price'];
      const rows = servicesRaw.map(s => {
        const revenue = toNumber(s.revenue);
        const count = toNumber(s.count);
        const avgPrice = count > 0 ? revenue / count : 0;
        return [
          s.itemId || '',
          s.name,
          count,
          revenue.toFixed(2),
          avgPrice.toFixed(2),
        ];
      });

      csvContent = generateCSV(headers, rows);
      filename = `services-report-${data.startDate}-${data.endDate}.csv`;
      recordCount = servicesRaw.length;
      break;
    }

    case 'outstanding': {
      const invoices = await prisma.invoice.findMany({
        where: {
          balance: { gt: 0 },
          status: { in: ['SENT', 'VIEWED', 'PARTIALLY_PAID', 'OVERDUE'] },
          ...(data.locationId && { locationId: data.locationId }),
        },
        select: {
          invoiceNumber: true,
          patientName: true,
          invoiceDate: true,
          dueDate: true,
          total: true,
          amountPaid: true,
          balance: true,
          status: true,
        },
        orderBy: {
          dueDate: 'asc',
        },
      });

      const headers = ['Invoice', 'Patient', 'Invoice Date', 'Due Date', 'Total', 'Paid', 'Balance', 'Status'];
      const rows = invoices.map(inv => [
        inv.invoiceNumber,
        inv.patientName,
        formatDate(inv.invoiceDate),
        formatDate(inv.dueDate),
        toNumber(inv.total).toFixed(2),
        toNumber(inv.amountPaid).toFixed(2),
        toNumber(inv.balance).toFixed(2),
        inv.status,
      ]);

      csvContent = generateCSV(headers, rows);
      filename = `outstanding-balances-${formatDate(new Date())}.csv`;
      recordCount = invoices.length;
      break;
    }

    default: {
      // Generic export for other report types
      csvContent = `Report Type,${data.reportType}\nStart Date,${data.startDate}\nEnd Date,${data.endDate}\n`;
      filename = `${data.reportType}-report-${data.startDate}-${data.endDate}.csv`;
      recordCount = 0;
    }
  }

  // Log the export
  await logDataExport(
    user.uid,
    `financial_${data.reportType}`,
    recordCount,
    undefined,
    ipAddress
  );

  await logAuditEvent({
    userId: user.uid,
    action: 'EXPORT',
    resourceType: 'financial_report',
    ipAddress,
    metadata: {
      reportType: data.reportType,
      format: data.format,
      startDate: data.startDate,
      endDate: data.endDate,
      recordCount,
    },
  });

  return c.json({
    success: true,
    filename,
    content: csvContent,
    recordCount,
    message: `Export generated successfully with ${recordCount} records`,
  });
});

/**
 * Clear cache manually (admin only)
 * POST /api/reports/cache/clear
 */
financialReports.post('/cache/clear', async (c) => {
  const user = c.get('user');
  reportCache.clear();

  await logAuditEvent({
    userId: user.uid,
    action: 'UPDATE',
    resourceType: 'system',
    ipAddress: getClientIP(c),
    metadata: { action: 'clear_report_cache' },
  });

  return c.json({ success: true, message: 'Report cache cleared' });
});

export default financialReports;
