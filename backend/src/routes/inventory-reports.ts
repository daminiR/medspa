/**
 * Inventory Reports & Analytics API Routes
 *
 * Comprehensive reporting for inventory valuation, usage analytics, and provider accountability.
 * KEY DIFFERENTIATOR: Provider analytics that competitors (Zenoti, Boulevard, Jane) don't have.
 *
 * Features:
 * - Inventory valuation reports
 * - Usage by product/provider/period
 * - Expiration tracking (30/60/90 days)
 * - Stock movement analysis
 * - Variance/shrinkage reports
 * - Inventory turnover metrics
 * - Waste analysis
 * - Provider usage analytics (unique to our platform)
 * - Treatment cost analysis
 * - Profitability reports
 * - Dashboard metrics
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { sessionAuthMiddleware, requireRole } from '../middleware/auth';
import { APIError } from '../middleware/error';
import { handlePrismaError } from '../middleware/prisma-error-handler';
import { logAuditEvent, logDataExport } from '@medical-spa/security';
import { prisma } from '../lib/prisma';
import {
  ProductCategoryType,
  InventoryTransactionType,
  WasteReason,
  LotStatusType,
  ProductUnitType
} from '@prisma/client';

const inventoryReports = new Hono();

// ===================
// Data Interfaces
// ===================

export interface ProviderInventoryStats {
  providerId: string;
  providerName: string;
  totalUnitsUsed: number;
  totalTreatments: number;
  averageUnitsPerTreatment: number;
  averageUnitsVsClinicAverage: number; // +15% means 15% more than average
  isAboveAverage: boolean;
  byProduct: {
    productId: string;
    productName: string;
    unitsUsed: number;
    treatments: number;
    avgPerTreatment: number;
    vsClinicAverage: number;
  }[];
  byArea: {
    area: string;
    unitsUsed: number;
    treatments: number;
    avgPerTreatment: number;
  }[];
  wasteUnits: number;
  wasteValue: number;
  wastePercent: number;
  revenueGenerated: number;
  costOfGoodsUsed: number;
  grossProfit: number;
  profitMargin: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface InventoryMetrics {
  totalValue: number;
  totalCost: number;
  potentialProfit: number;
  totalProducts: number;
  inStockProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  expiringIn30Days: number;
  expiringIn60Days: number;
  expiringIn90Days: number;
  expiredValue: number;
  inventoryTurnoverRatio: number;
  averageDaysToSell: number;
  totalVarianceValue: number;
  variancePercent: number;
  calculatedAt: Date;
}

export interface ValuationReport {
  totalRetailValue: number;
  totalCostValue: number;
  potentialProfit: number;
  profitMargin: number;
  byCategory: {
    category: string;
    retailValue: number;
    costValue: number;
    profit: number;
    itemCount: number;
    unitCount: number;
  }[];
  byProduct: {
    productId: string;
    productName: string;
    category: string;
    quantity: number;
    unitCost: number;
    unitRetail: number;
    totalCost: number;
    totalRetail: number;
    profit: number;
  }[];
  asOfDate: Date;
}

export interface UsageReport {
  startDate: string;
  endDate: string;
  totalUnitsUsed: number;
  totalTreatments: number;
  totalCost: number;
  totalRevenue: number;
  byProduct: {
    productId: string;
    productName: string;
    category: string;
    unitsUsed: number;
    treatments: number;
    avgPerTreatment: number;
    cost: number;
    revenue: number;
  }[];
  byProvider?: {
    providerId: string;
    providerName: string;
    unitsUsed: number;
    treatments: number;
    avgPerTreatment: number;
  }[];
  byPeriod: {
    period: string;
    unitsUsed: number;
    treatments: number;
    cost: number;
    revenue: number;
  }[];
}

export interface ExpirationReport {
  expiringIn30Days: ExpiringLot[];
  expiringIn60Days: ExpiringLot[];
  expiringIn90Days: ExpiringLot[];
  alreadyExpired: ExpiringLot[];
  totalExpiringValue: number;
  totalExpiredValue: number;
}

export interface ExpiringLot {
  lotId: string;
  lotNumber: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  expirationDate: Date;
  daysUntilExpiration: number;
  locationId: string;
  locationName: string;
}

export interface MovementReport {
  startDate: string;
  endDate: string;
  summary: {
    received: number;
    used: number;
    wasted: number;
    adjusted: number;
    transferred: number;
    returned: number;
  };
  transactions: {
    id: string;
    type: string;
    productId: string;
    productName: string;
    lotNumber: string;
    quantity: number;
    timestamp: Date;
    performedBy: string;
    reason?: string;
  }[];
  byProduct: {
    productId: string;
    productName: string;
    received: number;
    used: number;
    wasted: number;
    adjusted: number;
  }[];
}

export interface VarianceReport {
  totalVarianceUnits: number;
  totalVarianceValue: number;
  variancePercent: number;
  byProduct: {
    productId: string;
    productName: string;
    systemQuantity: number;
    countedQuantity: number;
    varianceUnits: number;
    varianceValue: number;
    variancePercent: number;
    lastCountDate?: Date;
  }[];
  byLocation?: {
    locationId: string;
    locationName: string;
    varianceUnits: number;
    varianceValue: number;
  }[];
  countHistory: {
    countId: string;
    countDate: Date;
    countType: string;
    itemsCounted: number;
    varianceValue: number;
  }[];
}

export interface TurnoverReport {
  averageTurnoverRatio: number;
  averageDaysToSell: number;
  byProduct: {
    productId: string;
    productName: string;
    category: string;
    turnoverRatio: number;
    daysToSell: number;
    averageStock: number;
    totalSold: number;
    trend: 'fast' | 'normal' | 'slow';
  }[];
  byCategory: {
    category: string;
    turnoverRatio: number;
    daysToSell: number;
    productCount: number;
  }[];
  slowMovingItems: {
    productId: string;
    productName: string;
    daysInStock: number;
    quantity: number;
    value: number;
  }[];
}

export interface WasteReport {
  startDate: string;
  endDate: string;
  totalUnitsWasted: number;
  totalWasteValue: number;
  wastePercent: number;
  byReason: {
    reason: string;
    unitsWasted: number;
    value: number;
    percentage: number;
  }[];
  byProduct: {
    productId: string;
    productName: string;
    unitsWasted: number;
    value: number;
    percentage: number;
  }[];
  byProvider?: {
    providerId: string;
    providerName: string;
    unitsWasted: number;
    value: number;
  }[];
  wasteRecords: {
    id: string;
    productName: string;
    lotNumber: string;
    unitsWasted: number;
    reason: string;
    value: number;
    recordedBy: string;
    recordedAt: Date;
  }[];
}

export interface TreatmentCostReport {
  startDate: string;
  endDate: string;
  byTreatment: {
    treatmentId: string;
    treatmentName: string;
    totalTreatments: number;
    avgProductCost: number;
    avgRevenue: number;
    avgProfit: number;
    profitMargin: number;
    productBreakdown: {
      productId: string;
      productName: string;
      avgUnitsUsed: number;
      avgCost: number;
    }[];
  }[];
  overallAvgCost: number;
  overallAvgRevenue: number;
  overallAvgProfit: number;
}

export interface ProfitabilityReport {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  profitMargin: number;
  byProduct: {
    productId: string;
    productName: string;
    category: string;
    unitsUsed: number;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }[];
  byTreatment: {
    treatmentId: string;
    treatmentName: string;
    treatmentCount: number;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }[];
}

// ===================
// Cache for Reports
// ===================

// Simple cache for reports (5 minute TTL) - KEEP THIS, it's transient aggregation
const reportCache = new Map<string, { data: any; expiresAt: Date }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ===================
// Validation Schemas
// ===================

const dateRangeSchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date'),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date'),
  locationId: z.string().uuid().optional(),
  providerId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  category: z.enum(['neurotoxin', 'filler', 'skincare', 'device', 'consumable', 'supplement', 'other']).optional(),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day'),
});

const providerIdSchema = z.object({
  id: z.string().uuid(),
});

const metricsQuerySchema = z.object({
  locationId: z.string().uuid().optional(),
});

const expirationQuerySchema = z.object({
  locationId: z.string().uuid().optional(),
  category: z.enum(['neurotoxin', 'filler', 'skincare', 'device', 'consumable', 'supplement', 'other']).optional(),
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

function isWithinDateRange(date: Date, startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return date >= start && date <= end;
}

function getDaysDiff(date1: Date, date2: Date): number {
  const diffTime = date2.getTime() - date1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

function groupByPeriod(date: Date, groupBy: string): string {
  const d = new Date(date);
  switch (groupBy) {
    case 'week':
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      return formatDate(weekStart);
    case 'month':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    default:
      return formatDate(d);
  }
}

// Helper to get location name (placeholder for now)
function getLocationName(locationId: string): string {
  return 'Main Clinic'; // TODO: Replace with actual location lookup
}

// ===================
// Middleware
// ===================

// All report routes require session authentication
inventoryReports.use('/*', sessionAuthMiddleware);

// ===================
// Standard Reports
// ===================

/**
 * Get inventory valuation report
 * GET /api/inventory/reports/valuation
 */
inventoryReports.get('/valuation', zValidator('query', metricsQuerySchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const cacheKey = getCacheKey('valuation', query);
  const cached = getCachedData<ValuationReport>(cacheKey);
  if (cached) {
    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_report',
      ipAddress,
      metadata: { reportType: 'valuation', cached: true },
    });
    return c.json({ report: cached });
  }

  try {
    // Get all lots with stock
    const lots = await prisma.inventoryLot.findMany({
      where: {
        ...(query.locationId && { locationId: query.locationId }),
        currentQuantity: { gt: 0 },
        status: { notIn: [LotStatusType.expired, LotStatusType.recalled] },
        deletedAt: null,
      },
      include: {
        product: true,
      },
    });

    // Calculate by category - KEEP THIS MAP, it's for aggregation
    const categoryMap = new Map<string, { retailValue: number; costValue: number; profit: number; itemCount: number; unitCount: number }>();
    // KEEP THIS MAP, it's for aggregation
    const productMap = new Map<string, { productId: string; productName: string; category: string; quantity: number; unitCost: number; unitRetail: number; totalCost: number; totalRetail: number; profit: number }>();

    for (const lot of lots) {
      const product = lot.product;
      if (!product) continue;

      const unitCost = lot.purchaseCost || product.costPrice;
      const costValue = lot.currentQuantity * unitCost;
      const unitRetail = product.unitType === ProductUnitType.units ? product.retailPrice / 100 : product.retailPrice;
      const retailValue = lot.currentQuantity * unitRetail;
      const profit = retailValue - costValue;

      const category = product.category || 'other';

      // By category
      const catData = categoryMap.get(category) || { retailValue: 0, costValue: 0, profit: 0, itemCount: 0, unitCount: 0 };
      catData.retailValue += retailValue;
      catData.costValue += costValue;
      catData.profit += profit;
      catData.itemCount += 1;
      catData.unitCount += lot.currentQuantity;
      categoryMap.set(category, catData);

      // By product
      const prodData = productMap.get(lot.productId) || {
        productId: lot.productId,
        productName: product.name,
        category,
        quantity: 0,
        unitCost,
        unitRetail,
        totalCost: 0,
        totalRetail: 0,
        profit: 0,
      };
      prodData.quantity += lot.currentQuantity;
      prodData.totalCost += costValue;
      prodData.totalRetail += retailValue;
      prodData.profit += profit;
      productMap.set(lot.productId, prodData);
    }

    const totalCostValue = Array.from(productMap.values()).reduce((sum, p) => sum + p.totalCost, 0);
    const totalRetailValue = Array.from(productMap.values()).reduce((sum, p) => sum + p.totalRetail, 0);

    const report: ValuationReport = {
      totalRetailValue,
      totalCostValue,
      potentialProfit: totalRetailValue - totalCostValue,
      profitMargin: totalRetailValue > 0 ? ((totalRetailValue - totalCostValue) / totalRetailValue) * 100 : 0,
      byCategory: Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        ...data,
      })).sort((a, b) => b.retailValue - a.retailValue),
      byProduct: Array.from(productMap.values()).sort((a, b) => b.totalRetail - a.totalRetail),
      asOfDate: new Date(),
    };

    setCachedData(cacheKey, report);

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_report',
      ipAddress,
      metadata: { reportType: 'valuation' },
    });

    return c.json({ report });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get usage report
 * GET /api/inventory/reports/usage
 */
inventoryReports.get('/usage', zValidator('query', dateRangeSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const cacheKey = getCacheKey('usage', query);
  const cached = getCachedData<UsageReport>(cacheKey);
  if (cached) {
    return c.json({ report: cached });
  }

  try {
    const startDate = new Date(query.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(query.endDate);
    endDate.setHours(23, 59, 59, 999);

    // Get usage transactions
    const transactions = await prisma.inventoryTransaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        type: InventoryTransactionType.TREATMENT_USE,
        ...(query.locationId && { locationId: query.locationId }),
        ...(query.providerId && { practitionerId: query.providerId }),
        ...(query.productId && { productId: query.productId }),
      },
    });

    // Get products for pricing info
    const productIds = [...new Set(transactions.map(t => t.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productLookup = new Map(products.map(p => [p.id, p]));

    // KEEP THESE MAPS - they're for aggregation
    const productMap = new Map<string, { productId: string; productName: string; category: string; unitsUsed: number; treatments: number; cost: number; revenue: number }>();
    const providerMap = new Map<string, { providerId: string; providerName: string; unitsUsed: number; treatments: number }>();
    const periodMap = new Map<string, { period: string; unitsUsed: number; treatments: number; cost: number; revenue: number }>();

    for (const txn of transactions) {
      const unitsUsed = Math.abs(txn.quantity);
      const cost = txn.totalCost || (unitsUsed * (txn.unitCost || 0));
      const product = productLookup.get(txn.productId);
      const unitRetail = product ? (product.unitType === ProductUnitType.units ? product.retailPrice / 100 : product.retailPrice) : 0;
      const revenue = product ? unitsUsed * unitRetail : cost * 2;

      // Get product name from transaction or lookup
      const productName = product?.name || 'Unknown Product';
      const category = product?.category || 'other';

      // By product
      const prodData = productMap.get(txn.productId) || {
        productId: txn.productId,
        productName,
        category,
        unitsUsed: 0,
        treatments: 0,
        cost: 0,
        revenue: 0,
      };
      prodData.unitsUsed += unitsUsed;
      prodData.treatments += 1;
      prodData.cost += cost;
      prodData.revenue += revenue;
      productMap.set(txn.productId, prodData);

      // By provider
      if (txn.practitionerId) {
        const provData = providerMap.get(txn.practitionerId) || {
          providerId: txn.practitionerId,
          providerName: 'Provider', // TODO: Get from user lookup
          unitsUsed: 0,
          treatments: 0,
        };
        provData.unitsUsed += unitsUsed;
        provData.treatments += 1;
        providerMap.set(txn.practitionerId, provData);
      }

      // By period
      const period = groupByPeriod(txn.createdAt, query.groupBy);
      const periodData = periodMap.get(period) || { period, unitsUsed: 0, treatments: 0, cost: 0, revenue: 0 };
      periodData.unitsUsed += unitsUsed;
      periodData.treatments += 1;
      periodData.cost += cost;
      periodData.revenue += revenue;
      periodMap.set(period, periodData);
    }

    const byProduct = Array.from(productMap.values()).map(p => ({
      ...p,
      avgPerTreatment: p.treatments > 0 ? p.unitsUsed / p.treatments : 0,
    })).sort((a, b) => b.unitsUsed - a.unitsUsed);

    const byProvider = Array.from(providerMap.values()).map(p => ({
      ...p,
      avgPerTreatment: p.treatments > 0 ? p.unitsUsed / p.treatments : 0,
    })).sort((a, b) => b.unitsUsed - a.unitsUsed);

    const byPeriod = Array.from(periodMap.values()).sort((a, b) => a.period.localeCompare(b.period));

    const report: UsageReport = {
      startDate: query.startDate,
      endDate: query.endDate,
      totalUnitsUsed: byProduct.reduce((sum, p) => sum + p.unitsUsed, 0),
      totalTreatments: byProduct.reduce((sum, p) => sum + p.treatments, 0),
      totalCost: byProduct.reduce((sum, p) => sum + p.cost, 0),
      totalRevenue: byProduct.reduce((sum, p) => sum + p.revenue, 0),
      byProduct,
      byProvider,
      byPeriod,
    };

    setCachedData(cacheKey, report);

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_report',
      ipAddress,
      metadata: { reportType: 'usage', startDate: query.startDate, endDate: query.endDate },
    });

    return c.json({ report });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get expiration report
 * GET /api/inventory/reports/expiration
 */
inventoryReports.get('/expiration', zValidator('query', expirationQuerySchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const cacheKey = getCacheKey('expiration', query);
  const cached = getCachedData<ExpirationReport>(cacheKey);
  if (cached) {
    return c.json({ report: cached });
  }

  try {
    const today = new Date();
    const in30Days = new Date(today);
    in30Days.setDate(in30Days.getDate() + 30);
    const in60Days = new Date(today);
    in60Days.setDate(in60Days.getDate() + 60);
    const in90Days = new Date(today);
    in90Days.setDate(in90Days.getDate() + 90);

    const lots = await prisma.inventoryLot.findMany({
      where: {
        ...(query.locationId && { locationId: query.locationId }),
        currentQuantity: { gt: 0 },
        deletedAt: null,
      },
      include: {
        product: true,
      },
    });

    // Filter by category if specified
    const filteredLots = query.category
      ? lots.filter(lot => lot.product?.category === query.category)
      : lots;

    const mapLotToExpiring = (lot: any): ExpiringLot => {
      const unitCost = lot.purchaseCost || lot.product?.costPrice || 0;
      return {
        lotId: lot.id,
        lotNumber: lot.lotNumber,
        productId: lot.productId,
        productName: lot.product?.name || 'Unknown',
        category: lot.product?.category || 'other',
        quantity: lot.currentQuantity,
        unitCost,
        totalValue: lot.currentQuantity * unitCost,
        expirationDate: lot.expirationDate,
        daysUntilExpiration: getDaysDiff(today, lot.expirationDate),
        locationId: lot.locationId,
        locationName: getLocationName(lot.locationId),
      };
    };

    const alreadyExpired = filteredLots.filter(lot => lot.expirationDate < today).map(mapLotToExpiring);
    const expiringIn30Days = filteredLots.filter(lot => lot.expirationDate >= today && lot.expirationDate <= in30Days).map(mapLotToExpiring);
    const expiringIn60Days = filteredLots.filter(lot => lot.expirationDate > in30Days && lot.expirationDate <= in60Days).map(mapLotToExpiring);
    const expiringIn90Days = filteredLots.filter(lot => lot.expirationDate > in60Days && lot.expirationDate <= in90Days).map(mapLotToExpiring);

    const report: ExpirationReport = {
      expiringIn30Days,
      expiringIn60Days,
      expiringIn90Days,
      alreadyExpired,
      totalExpiringValue: [...expiringIn30Days, ...expiringIn60Days, ...expiringIn90Days].reduce((sum, l) => sum + l.totalValue, 0),
      totalExpiredValue: alreadyExpired.reduce((sum, l) => sum + l.totalValue, 0),
    };

    setCachedData(cacheKey, report);

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_report',
      ipAddress,
      metadata: { reportType: 'expiration' },
    });

    return c.json({ report });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get stock movement report
 * GET /api/inventory/reports/movement
 */
inventoryReports.get('/movement', zValidator('query', dateRangeSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const cacheKey = getCacheKey('movement', query);
  const cached = getCachedData<MovementReport>(cacheKey);
  if (cached) {
    return c.json({ report: cached });
  }

  try {
    const startDate = new Date(query.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(query.endDate);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await prisma.inventoryTransaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        ...(query.productId && { productId: query.productId }),
      },
    });

    // Get product names
    const productIds = [...new Set(transactions.map(t => t.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });
    const productLookup = new Map(products.map(p => [p.id, p.name]));

    // Get lot numbers
    const lotIds = transactions.filter(t => t.lotId).map(t => t.lotId!);
    const lots = await prisma.inventoryLot.findMany({
      where: { id: { in: lotIds } },
      select: { id: true, lotNumber: true },
    });
    const lotLookup = new Map(lots.map(l => [l.id, l.lotNumber]));

    // Summary by type
    let received = 0, used = 0, wasted = 0, adjusted = 0, transferred = 0, returned = 0;
    // KEEP THIS MAP - it's for aggregation
    const productMap = new Map<string, { productId: string; productName: string; received: number; used: number; wasted: number; adjusted: number }>();

    for (const txn of transactions) {
      const qty = Math.abs(txn.quantity);

      switch (txn.type) {
        case InventoryTransactionType.PURCHASE:
          received += qty;
          break;
        case InventoryTransactionType.TREATMENT_USE:
        case InventoryTransactionType.SALE:
          used += qty;
          break;
        case InventoryTransactionType.WASTE:
        case InventoryTransactionType.EXPIRED:
          wasted += qty;
          break;
        case InventoryTransactionType.ADJUSTMENT:
        case InventoryTransactionType.COUNT_ADJUSTMENT:
          adjusted += txn.quantity; // Keep sign for adjustments
          break;
        case InventoryTransactionType.TRANSFER_OUT:
        case InventoryTransactionType.TRANSFER_IN:
          transferred += qty;
          break;
        case InventoryTransactionType.RETURN:
          returned += qty;
          break;
      }

      // By product
      const productName = productLookup.get(txn.productId) || 'Unknown Product';
      const prodData = productMap.get(txn.productId) || { productId: txn.productId, productName, received: 0, used: 0, wasted: 0, adjusted: 0 };
      if (txn.type === InventoryTransactionType.PURCHASE) prodData.received += qty;
      else if (txn.type === InventoryTransactionType.TREATMENT_USE || txn.type === InventoryTransactionType.SALE) prodData.used += qty;
      else if (txn.type === InventoryTransactionType.WASTE || txn.type === InventoryTransactionType.EXPIRED) prodData.wasted += qty;
      else if (txn.type === InventoryTransactionType.ADJUSTMENT || txn.type === InventoryTransactionType.COUNT_ADJUSTMENT) prodData.adjusted += txn.quantity;
      productMap.set(txn.productId, prodData);
    }

    // Add waste records to summary
    const wasteRecords = await prisma.wasteRecord.findMany({
      where: {
        recordedAt: { gte: startDate, lte: endDate },
      },
    });
    for (const w of wasteRecords) {
      wasted += w.quantity;
    }

    const report: MovementReport = {
      startDate: query.startDate,
      endDate: query.endDate,
      summary: { received, used, wasted, adjusted, transferred, returned },
      transactions: transactions.map(txn => ({
        id: txn.id,
        type: txn.type,
        productId: txn.productId,
        productName: productLookup.get(txn.productId) || 'Unknown Product',
        lotNumber: txn.lotId ? lotLookup.get(txn.lotId) || 'N/A' : 'N/A',
        quantity: txn.quantity,
        timestamp: txn.createdAt,
        performedBy: txn.createdBy || 'System',
        reason: txn.reason ?? undefined,
      })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
      byProduct: Array.from(productMap.values()).sort((a, b) => b.used - a.used),
    };

    setCachedData(cacheKey, report);

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_report',
      ipAddress,
      metadata: { reportType: 'movement', startDate: query.startDate, endDate: query.endDate },
    });

    return c.json({ report });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get variance/shrinkage report
 * GET /api/inventory/reports/variance
 */
inventoryReports.get('/variance', zValidator('query', metricsQuerySchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const cacheKey = getCacheKey('variance', query);
  const cached = getCachedData<VarianceReport>(cacheKey);
  if (cached) {
    return c.json({ report: cached });
  }

  try {
    const counts = await prisma.inventoryCount.findMany({
      where: {
        ...(query.locationId && { locationId: query.locationId }),
      },
    });

    // KEEP THIS MAP - it's for aggregation
    const productVarianceMap = new Map<string, { productId: string; productName: string; systemQuantity: number; countedQuantity: number; varianceUnits: number; varianceValue: number; lastCountDate?: Date }>();

    for (const count of counts) {
      const items = count.items as any[];
      for (const item of items) {
        const existing = productVarianceMap.get(item.productId) || {
          productId: item.productId,
          productName: item.productName,
          systemQuantity: 0,
          countedQuantity: 0,
          varianceUnits: 0,
          varianceValue: 0,
          lastCountDate: undefined,
        };
        existing.systemQuantity += item.systemQuantity;
        existing.countedQuantity += item.countedQuantity;
        existing.varianceUnits += item.variance;
        existing.varianceValue += item.varianceValue;
        if (!existing.lastCountDate || count.startedAt > existing.lastCountDate) {
          existing.lastCountDate = count.startedAt;
        }
        productVarianceMap.set(item.productId, existing);
      }
    }

    const byProduct = Array.from(productVarianceMap.values()).map(p => ({
      ...p,
      variancePercent: p.systemQuantity > 0 ? (p.varianceUnits / p.systemQuantity) * 100 : 0,
    })).sort((a, b) => Math.abs(b.varianceValue) - Math.abs(a.varianceValue));

    const totalVarianceUnits = byProduct.reduce((sum, p) => sum + p.varianceUnits, 0);
    const totalVarianceValue = byProduct.reduce((sum, p) => sum + p.varianceValue, 0);
    const totalSystemQty = byProduct.reduce((sum, p) => sum + p.systemQuantity, 0);

    const report: VarianceReport = {
      totalVarianceUnits,
      totalVarianceValue,
      variancePercent: totalSystemQty > 0 ? (totalVarianceUnits / totalSystemQty) * 100 : 0,
      byProduct,
      countHistory: counts.map(c => ({
        countId: c.id,
        countDate: c.startedAt,
        countType: c.countType,
        itemsCounted: (c.items as any[]).length,
        varianceValue: c.varianceTotal || 0,
      })).sort((a, b) => b.countDate.getTime() - a.countDate.getTime()),
    };

    setCachedData(cacheKey, report);

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_report',
      ipAddress,
      metadata: { reportType: 'variance' },
    });

    return c.json({ report });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get inventory turnover metrics
 * GET /api/inventory/reports/turnover
 */
inventoryReports.get('/turnover', zValidator('query', dateRangeSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const cacheKey = getCacheKey('turnover', query);
  const cached = getCachedData<TurnoverReport>(cacheKey);
  if (cached) {
    return c.json({ report: cached });
  }

  try {
    const startDate = new Date(query.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(query.endDate);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await prisma.inventoryTransaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        type: { in: [InventoryTransactionType.TREATMENT_USE, InventoryTransactionType.SALE] },
      },
    });

    // Calculate usage per product - KEEP THIS MAP
    const productUsageMap = new Map<string, number>();
    for (const txn of transactions) {
      const current = productUsageMap.get(txn.productId) || 0;
      productUsageMap.set(txn.productId, current + Math.abs(txn.quantity));
    }

    // Calculate average stock and turnover
    const lots = await prisma.inventoryLot.findMany({
      where: { deletedAt: null },
      include: { product: true },
    });

    // KEEP THIS MAP
    const productStockMap = new Map<string, { avgStock: number; category: string; name: string }>();
    for (const lot of lots) {
      const existing = productStockMap.get(lot.productId) || { avgStock: 0, category: lot.product?.category || 'other', name: lot.product?.name || 'Unknown' };
      existing.avgStock += (lot.initialQuantity + lot.currentQuantity) / 2;
      productStockMap.set(lot.productId, existing);
    }

    const periodDays = getDaysDiff(new Date(query.startDate), new Date(query.endDate));

    const byProduct = Array.from(productStockMap.entries()).map(([productId, stockData]) => {
      const totalSold = productUsageMap.get(productId) || 0;
      const turnoverRatio = stockData.avgStock > 0 ? totalSold / stockData.avgStock : 0;
      const daysToSell = turnoverRatio > 0 ? periodDays / turnoverRatio : 999;

      return {
        productId,
        productName: stockData.name,
        category: stockData.category,
        turnoverRatio: Math.round(turnoverRatio * 100) / 100,
        daysToSell: Math.round(daysToSell),
        averageStock: Math.round(stockData.avgStock),
        totalSold,
        trend: daysToSell < 30 ? 'fast' as const : daysToSell < 90 ? 'normal' as const : 'slow' as const,
      };
    }).sort((a, b) => b.turnoverRatio - a.turnoverRatio);

    // By category - KEEP THIS MAP
    const categoryMap = new Map<string, { turnoverRatio: number; daysToSell: number; productCount: number; totalTurnover: number }>();
    for (const prod of byProduct) {
      const existing = categoryMap.get(prod.category) || { turnoverRatio: 0, daysToSell: 0, productCount: 0, totalTurnover: 0 };
      existing.totalTurnover += prod.turnoverRatio;
      existing.productCount += 1;
      categoryMap.set(prod.category, existing);
    }

    const byCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      turnoverRatio: Math.round((data.totalTurnover / data.productCount) * 100) / 100,
      daysToSell: data.turnoverRatio > 0 ? Math.round(periodDays / (data.totalTurnover / data.productCount)) : 999,
      productCount: data.productCount,
    })).sort((a, b) => b.turnoverRatio - a.turnoverRatio);

    // Slow moving items
    const slowMovingItems = byProduct
      .filter(p => p.trend === 'slow' && p.averageStock > 0)
      .map(p => {
        const lot = lots.find(l => l.productId === p.productId);
        const unitCost = lot?.purchaseCost || lot?.product?.costPrice || 0;
        return {
          productId: p.productId,
          productName: p.productName,
          daysInStock: p.daysToSell,
          quantity: p.averageStock,
          value: p.averageStock * unitCost,
        };
      });

    const avgTurnover = byProduct.length > 0
      ? byProduct.reduce((sum, p) => sum + p.turnoverRatio, 0) / byProduct.length
      : 0;

    const report: TurnoverReport = {
      averageTurnoverRatio: Math.round(avgTurnover * 100) / 100,
      averageDaysToSell: avgTurnover > 0 ? Math.round(periodDays / avgTurnover) : 999,
      byProduct,
      byCategory,
      slowMovingItems,
    };

    setCachedData(cacheKey, report);

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_report',
      ipAddress,
      metadata: { reportType: 'turnover', startDate: query.startDate, endDate: query.endDate },
    });

    return c.json({ report });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get waste analysis report
 * GET /api/inventory/reports/waste
 */
inventoryReports.get('/waste', zValidator('query', dateRangeSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const cacheKey = getCacheKey('waste', query);
  const cached = getCachedData<WasteReport>(cacheKey);
  if (cached) {
    return c.json({ report: cached });
  }

  try {
    const startDate = new Date(query.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(query.endDate);
    endDate.setHours(23, 59, 59, 999);

    const wasteRecords = await prisma.wasteRecord.findMany({
      where: {
        recordedAt: { gte: startDate, lte: endDate },
        ...(query.locationId && { locationId: query.locationId }),
      },
    });

    // Get product info
    const productIds = [...new Set(wasteRecords.map(w => w.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productLookup = new Map(products.map(p => [p.id, p]));

    // Get lot info
    const lotIds = wasteRecords.filter(w => w.lotId).map(w => w.lotId!);
    const lots = await prisma.inventoryLot.findMany({
      where: { id: { in: lotIds } },
      select: { id: true, lotNumber: true },
    });
    const lotLookup = new Map(lots.map(l => [l.id, l.lotNumber]));

    // KEEP THESE MAPS - they're for aggregation
    const reasonMap = new Map<string, { unitsWasted: number; value: number }>();
    const productMap = new Map<string, { productId: string; productName: string; unitsWasted: number; value: number }>();
    const providerMap = new Map<string, { providerId: string; providerName: string; unitsWasted: number; value: number }>();

    for (const w of wasteRecords) {
      const value = w.totalCost || (w.quantity * (w.unitCost || 0));

      // By reason
      const reasonData = reasonMap.get(w.reason) || { unitsWasted: 0, value: 0 };
      reasonData.unitsWasted += w.quantity;
      reasonData.value += value;
      reasonMap.set(w.reason, reasonData);

      // By product
      const product = productLookup.get(w.productId);
      const prodData = productMap.get(w.productId) || { productId: w.productId, productName: product?.name || 'Unknown', unitsWasted: 0, value: 0 };
      prodData.unitsWasted += w.quantity;
      prodData.value += value;
      productMap.set(w.productId, prodData);

      // By provider (if available in notes or we add a field)
      // TODO: Add practitionerId field to WasteRecord model
    }

    const totalUnitsWasted = wasteRecords.reduce((sum, w) => sum + w.quantity, 0);
    const totalWasteValue = wasteRecords.reduce((sum, w) => sum + (w.totalCost || (w.quantity * (w.unitCost || 0))), 0);

    // Calculate total usage for waste percentage
    const usageTransactions = await prisma.inventoryTransaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        type: InventoryTransactionType.TREATMENT_USE,
      },
    });
    const totalUsed = usageTransactions.reduce((sum, txn) => sum + Math.abs(txn.quantity), 0);

    const report: WasteReport = {
      startDate: query.startDate,
      endDate: query.endDate,
      totalUnitsWasted,
      totalWasteValue,
      wastePercent: totalUsed > 0 ? (totalUnitsWasted / totalUsed) * 100 : 0,
      byReason: Array.from(reasonMap.entries()).map(([reason, data]) => ({
        reason,
        unitsWasted: data.unitsWasted,
        value: data.value,
        percentage: totalWasteValue > 0 ? (data.value / totalWasteValue) * 100 : 0,
      })).sort((a, b) => b.value - a.value),
      byProduct: Array.from(productMap.values()).map(p => ({
        ...p,
        percentage: totalWasteValue > 0 ? (p.value / totalWasteValue) * 100 : 0,
      })).sort((a, b) => b.value - a.value),
      byProvider: Array.from(providerMap.values()).sort((a, b) => b.value - a.value),
      wasteRecords: wasteRecords.map(w => ({
        id: w.id,
        productName: productLookup.get(w.productId)?.name || 'Unknown',
        lotNumber: w.lotId ? lotLookup.get(w.lotId) || 'N/A' : 'N/A',
        unitsWasted: w.quantity,
        reason: w.reason,
        value: w.totalCost || (w.quantity * (w.unitCost || 0)),
        recordedBy: w.recordedBy || 'System',
        recordedAt: w.recordedAt,
      })).sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime()),
    };

    setCachedData(cacheKey, report);

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_report',
      ipAddress,
      metadata: { reportType: 'waste', startDate: query.startDate, endDate: query.endDate },
    });

    return c.json({ report });
  } catch (error) {
    handlePrismaError(error);
  }
});

// ===================
// Provider Analytics (KEY DIFFERENTIATOR)
// ===================

/**
 * Get provider usage summary (all providers)
 * GET /api/inventory/reports/providers
 */
inventoryReports.get('/providers', zValidator('query', dateRangeSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const cacheKey = getCacheKey('providers', query);
  const cached = getCachedData<{ providers: ProviderInventoryStats[] }>(cacheKey);
  if (cached) {
    return c.json(cached);
  }

  try {
    const startDate = new Date(query.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(query.endDate);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await prisma.inventoryTransaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        type: InventoryTransactionType.TREATMENT_USE,
        practitionerId: { not: null },
        ...(query.productId && { productId: query.productId }),
      },
    });

    // Get products
    const productIds = [...new Set(transactions.map(t => t.productId))];
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        ...(query.category && { category: query.category as ProductCategoryType }),
      },
    });
    const productLookup = new Map(products.map(p => [p.id, p]));

    // Filter transactions by category if specified
    const filteredTransactions = query.category
      ? transactions.filter(t => productLookup.get(t.productId)?.category === query.category)
      : transactions;

    // Calculate clinic average
    const clinicTotalUnits = filteredTransactions.reduce((sum, txn) => sum + Math.abs(txn.quantity), 0);
    const clinicTotalTreatments = filteredTransactions.length;
    const clinicAvgUnitsPerTreatment = clinicTotalTreatments > 0 ? clinicTotalUnits / clinicTotalTreatments : 0;

    // By provider - KEEP THIS MAP
    const providerMap = new Map<string, {
      providerId: string;
      providerName: string;
      totalUnitsUsed: number;
      totalTreatments: number;
      productMap: Map<string, { productId: string; productName: string; unitsUsed: number; treatments: number }>;
      areaMap: Map<string, { area: string; unitsUsed: number; treatments: number }>;
      cost: number;
      revenue: number;
    }>();

    for (const txn of filteredTransactions) {
      if (!txn.practitionerId) continue;

      const unitsUsed = Math.abs(txn.quantity);
      const cost = txn.totalCost || (unitsUsed * (txn.unitCost || 0));
      const product = productLookup.get(txn.productId);
      const unitRetail = product ? (product.unitType === ProductUnitType.units ? product.retailPrice / 100 : product.retailPrice) : 0;
      const revenue = product ? unitsUsed * unitRetail : cost * 2;

      const provData = providerMap.get(txn.practitionerId) || {
        providerId: txn.practitionerId,
        providerName: 'Provider', // TODO: Get from user lookup
        totalUnitsUsed: 0,
        totalTreatments: 0,
        productMap: new Map(),
        areaMap: new Map(),
        cost: 0,
        revenue: 0,
      };

      provData.totalUnitsUsed += unitsUsed;
      provData.totalTreatments += 1;
      provData.cost += cost;
      provData.revenue += revenue;

      // By product
      const productName = product?.name || 'Unknown';
      const prodData = provData.productMap.get(txn.productId) || { productId: txn.productId, productName, unitsUsed: 0, treatments: 0 };
      prodData.unitsUsed += unitsUsed;
      prodData.treatments += 1;
      provData.productMap.set(txn.productId, prodData);

      // TODO: By area - need to add treatment details to transaction or join with Treatment table

      providerMap.set(txn.practitionerId, provData);
    }

    // Get waste by provider
    const wasteRecords = await prisma.wasteRecord.findMany({
      where: {
        recordedAt: { gte: startDate, lte: endDate },
      },
    });
    // KEEP THIS MAP
    const wasteByProvider = new Map<string, { units: number; value: number }>();
    for (const w of wasteRecords) {
      // TODO: Add practitionerId to WasteRecord model
      // For now, waste is not attributed to providers
    }

    // Calculate per-product clinic averages - KEEP THIS MAP
    const productClinicAvg = new Map<string, number>();
    for (const txn of filteredTransactions) {
      const current = productClinicAvg.get(txn.productId) || 0;
      productClinicAvg.set(txn.productId, current + Math.abs(txn.quantity));
    }
    for (const [productId, total] of productClinicAvg) {
      const treatmentCount = filteredTransactions.filter(t => t.productId === productId).length;
      productClinicAvg.set(productId, treatmentCount > 0 ? total / treatmentCount : 0);
    }

    const providers: ProviderInventoryStats[] = Array.from(providerMap.values()).map(prov => {
      const avgUnitsPerTreatment = prov.totalTreatments > 0 ? prov.totalUnitsUsed / prov.totalTreatments : 0;
      const vsClinicAvg = clinicAvgUnitsPerTreatment > 0
        ? ((avgUnitsPerTreatment - clinicAvgUnitsPerTreatment) / clinicAvgUnitsPerTreatment) * 100
        : 0;

      const waste = wasteByProvider.get(prov.providerId) || { units: 0, value: 0 };
      const grossProfit = prov.revenue - prov.cost;

      return {
        providerId: prov.providerId,
        providerName: prov.providerName,
        totalUnitsUsed: prov.totalUnitsUsed,
        totalTreatments: prov.totalTreatments,
        averageUnitsPerTreatment: Math.round(avgUnitsPerTreatment * 100) / 100,
        averageUnitsVsClinicAverage: Math.round(vsClinicAvg * 100) / 100,
        isAboveAverage: vsClinicAvg > 0,
        byProduct: Array.from(prov.productMap.values()).map(p => {
          const clinicAvg = productClinicAvg.get(p.productId) || 0;
          const providerAvg = p.treatments > 0 ? p.unitsUsed / p.treatments : 0;
          return {
            productId: p.productId,
            productName: p.productName,
            unitsUsed: p.unitsUsed,
            treatments: p.treatments,
            avgPerTreatment: Math.round(providerAvg * 100) / 100,
            vsClinicAverage: clinicAvg > 0 ? Math.round(((providerAvg - clinicAvg) / clinicAvg) * 10000) / 100 : 0,
          };
        }).sort((a, b) => b.unitsUsed - a.unitsUsed),
        byArea: Array.from(prov.areaMap.values()).map(a => ({
          area: a.area,
          unitsUsed: a.unitsUsed,
          treatments: a.treatments,
          avgPerTreatment: a.treatments > 0 ? Math.round((a.unitsUsed / a.treatments) * 100) / 100 : 0,
        })).sort((a, b) => b.unitsUsed - a.unitsUsed),
        wasteUnits: waste.units,
        wasteValue: waste.value,
        wastePercent: prov.totalUnitsUsed > 0 ? (waste.units / prov.totalUnitsUsed) * 100 : 0,
        revenueGenerated: prov.revenue,
        costOfGoodsUsed: prov.cost,
        grossProfit,
        profitMargin: prov.revenue > 0 ? (grossProfit / prov.revenue) * 100 : 0,
        periodStart: new Date(query.startDate),
        periodEnd: new Date(query.endDate),
      };
    }).sort((a, b) => b.totalUnitsUsed - a.totalUnitsUsed);

    const result = { providers };
    setCachedData(cacheKey, result);

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_report',
      ipAddress,
      metadata: { reportType: 'providers', startDate: query.startDate, endDate: query.endDate },
    });

    return c.json(result);
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get individual provider stats
 * GET /api/inventory/reports/providers/:id
 */
inventoryReports.get('/providers/:id', zValidator('param', providerIdSchema), zValidator('query', dateRangeSchema), async (c) => {
  const { id } = c.req.valid('param');
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const startDate = new Date(query.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(query.endDate);
    endDate.setHours(23, 59, 59, 999);

    // Reuse the providers report logic and filter
    const transactions = await prisma.inventoryTransaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        type: InventoryTransactionType.TREATMENT_USE,
        practitionerId: id,
      },
    });

    if (transactions.length === 0) {
      throw APIError.notFound('Provider stats');
    }

    // Calculate clinic average for comparison
    const allTransactions = await prisma.inventoryTransaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        type: InventoryTransactionType.TREATMENT_USE,
      },
    });
    const clinicAvg = allTransactions.length > 0
      ? allTransactions.reduce((sum, txn) => sum + Math.abs(txn.quantity), 0) / allTransactions.length
      : 0;

    // Get products
    const productIds = [...new Set(transactions.map(t => t.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productLookup = new Map(products.map(p => [p.id, p]));

    // Provider stats
    const providerName = 'Provider'; // TODO: Get from user lookup
    const totalUnitsUsed = transactions.reduce((sum, txn) => sum + Math.abs(txn.quantity), 0);
    const totalTreatments = transactions.length;
    const avgUnitsPerTreatment = totalTreatments > 0 ? totalUnitsUsed / totalTreatments : 0;

    // By product - KEEP THESE MAPS
    const productMap = new Map<string, { productId: string; productName: string; unitsUsed: number; treatments: number }>();
    const areaMap = new Map<string, { area: string; unitsUsed: number; treatments: number }>();
    let totalCost = 0;
    let totalRevenue = 0;

    for (const txn of transactions) {
      const unitsUsed = Math.abs(txn.quantity);
      const cost = txn.totalCost || (unitsUsed * (txn.unitCost || 0));
      const product = productLookup.get(txn.productId);
      const unitRetail = product ? (product.unitType === ProductUnitType.units ? product.retailPrice / 100 : product.retailPrice) : 0;
      const revenue = product ? unitsUsed * unitRetail : cost * 2;

      totalCost += cost;
      totalRevenue += revenue;

      const productName = product?.name || 'Unknown';
      const prodData = productMap.get(txn.productId) || { productId: txn.productId, productName, unitsUsed: 0, treatments: 0 };
      prodData.unitsUsed += unitsUsed;
      prodData.treatments += 1;
      productMap.set(txn.productId, prodData);

      // TODO: Add treatment details to get area information
    }

    // Waste
    const wasteRecords = await prisma.wasteRecord.findMany({
      where: {
        recordedAt: { gte: startDate, lte: endDate },
        // TODO: Add practitionerId filter when field is added
      },
    });
    const wasteUnits = 0; // wasteRecords.reduce((sum, w) => sum + w.quantity, 0);
    const wasteValue = 0; // wasteRecords.reduce((sum, w) => sum + (w.totalCost || 0), 0);

    // Per-product clinic averages - KEEP THIS MAP
    const productClinicAvg = new Map<string, number>();
    for (const txn of allTransactions) {
      const current = productClinicAvg.get(txn.productId) || 0;
      productClinicAvg.set(txn.productId, current + Math.abs(txn.quantity));
    }
    for (const [productId, total] of productClinicAvg) {
      const treatmentCount = allTransactions.filter(t => t.productId === productId).length;
      productClinicAvg.set(productId, treatmentCount > 0 ? total / treatmentCount : 0);
    }

    const vsClinicAvg = clinicAvg > 0 ? ((avgUnitsPerTreatment - clinicAvg) / clinicAvg) * 100 : 0;
    const grossProfit = totalRevenue - totalCost;

    const stats: ProviderInventoryStats = {
      providerId: id,
      providerName,
      totalUnitsUsed,
      totalTreatments,
      averageUnitsPerTreatment: Math.round(avgUnitsPerTreatment * 100) / 100,
      averageUnitsVsClinicAverage: Math.round(vsClinicAvg * 100) / 100,
      isAboveAverage: vsClinicAvg > 0,
      byProduct: Array.from(productMap.values()).map(p => {
        const clinicAvgForProduct = productClinicAvg.get(p.productId) || 0;
        const providerAvg = p.treatments > 0 ? p.unitsUsed / p.treatments : 0;
        return {
          productId: p.productId,
          productName: p.productName,
          unitsUsed: p.unitsUsed,
          treatments: p.treatments,
          avgPerTreatment: Math.round(providerAvg * 100) / 100,
          vsClinicAverage: clinicAvgForProduct > 0 ? Math.round(((providerAvg - clinicAvgForProduct) / clinicAvgForProduct) * 10000) / 100 : 0,
        };
      }).sort((a, b) => b.unitsUsed - a.unitsUsed),
      byArea: Array.from(areaMap.values()).map(a => ({
        area: a.area,
        unitsUsed: a.unitsUsed,
        treatments: a.treatments,
        avgPerTreatment: a.treatments > 0 ? Math.round((a.unitsUsed / a.treatments) * 100) / 100 : 0,
      })).sort((a, b) => b.unitsUsed - a.unitsUsed),
      wasteUnits,
      wasteValue,
      wastePercent: totalUnitsUsed > 0 ? (wasteUnits / totalUnitsUsed) * 100 : 0,
      revenueGenerated: totalRevenue,
      costOfGoodsUsed: totalCost,
      grossProfit,
      profitMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
      periodStart: new Date(query.startDate),
      periodEnd: new Date(query.endDate),
    };

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_report',
      resourceId: id,
      ipAddress,
      metadata: { reportType: 'provider-stats', providerId: id },
    });

    return c.json({ stats });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Compare provider to clinic average
 * GET /api/inventory/reports/providers/:id/comparison
 */
inventoryReports.get('/providers/:id/comparison', zValidator('param', providerIdSchema), zValidator('query', dateRangeSchema), async (c) => {
  const { id } = c.req.valid('param');
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  try {
    const startDate = new Date(query.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(query.endDate);
    endDate.setHours(23, 59, 59, 999);

    const allTransactions = await prisma.inventoryTransaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        type: InventoryTransactionType.TREATMENT_USE,
      },
    });

    const providerTransactions = allTransactions.filter(txn => txn.practitionerId === id);

    if (providerTransactions.length === 0) {
      throw APIError.notFound('Provider comparison data');
    }

    // Provider stats
    const providerTotalUnits = providerTransactions.reduce((sum, txn) => sum + Math.abs(txn.quantity), 0);
    const providerTreatments = providerTransactions.length;
    const providerAvg = providerTreatments > 0 ? providerTotalUnits / providerTreatments : 0;

    // Clinic stats
    const clinicTotalUnits = allTransactions.reduce((sum, txn) => sum + Math.abs(txn.quantity), 0);
    const clinicTreatments = allTransactions.length;
    const clinicAvg = clinicTreatments > 0 ? clinicTotalUnits / clinicTreatments : 0;

    // By product comparison
    const productComparison: { productId: string; productName: string; providerAvg: number; clinicAvg: number; difference: number; differencePercent: number }[] = [];
    const productIds = new Set(providerTransactions.map(t => t.productId));

    // Get product names
    const products = await prisma.product.findMany({
      where: { id: { in: Array.from(productIds) } },
    });
    const productLookup = new Map(products.map(p => [p.id, p]));

    for (const productId of productIds) {
      const provProdTxns = providerTransactions.filter(t => t.productId === productId);
      const clinicProdTxns = allTransactions.filter(t => t.productId === productId);

      const provProdUnits = provProdTxns.reduce((sum, t) => sum + Math.abs(t.quantity), 0);
      const clinicProdUnits = clinicProdTxns.reduce((sum, t) => sum + Math.abs(t.quantity), 0);

      const provProdAvg = provProdTxns.length > 0 ? provProdUnits / provProdTxns.length : 0;
      const clinicProdAvg = clinicProdTxns.length > 0 ? clinicProdUnits / clinicProdTxns.length : 0;

      productComparison.push({
        productId,
        productName: productLookup.get(productId)?.name || 'Unknown',
        providerAvg: Math.round(provProdAvg * 100) / 100,
        clinicAvg: Math.round(clinicProdAvg * 100) / 100,
        difference: Math.round((provProdAvg - clinicProdAvg) * 100) / 100,
        differencePercent: clinicProdAvg > 0 ? Math.round(((provProdAvg - clinicProdAvg) / clinicProdAvg) * 10000) / 100 : 0,
      });
    }

    const comparison = {
      providerId: id,
      providerName: 'Provider', // TODO: Get from user lookup
      periodStart: query.startDate,
      periodEnd: query.endDate,
      provider: {
        totalUnitsUsed: providerTotalUnits,
        totalTreatments: providerTreatments,
        averageUnitsPerTreatment: Math.round(providerAvg * 100) / 100,
      },
      clinicAverage: {
        totalUnitsUsed: clinicTotalUnits,
        totalTreatments: clinicTreatments,
        averageUnitsPerTreatment: Math.round(clinicAvg * 100) / 100,
      },
      comparison: {
        unitsVsAverage: Math.round((providerAvg - clinicAvg) * 100) / 100,
        percentVsAverage: clinicAvg > 0 ? Math.round(((providerAvg - clinicAvg) / clinicAvg) * 10000) / 100 : 0,
        isAboveAverage: providerAvg > clinicAvg,
        ranking: 0, // Would calculate based on all providers
      },
      byProduct: productComparison.sort((a, b) => Math.abs(b.differencePercent) - Math.abs(a.differencePercent)),
    };

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_report',
      resourceId: id,
      ipAddress,
      metadata: { reportType: 'provider-comparison', providerId: id },
    });

    return c.json({ comparison });
  } catch (error) {
    handlePrismaError(error);
  }
});

// ===================
// Treatment Cost Analysis
// ===================

/**
 * Get cost per treatment analysis
 * GET /api/inventory/reports/treatment-costs
 */
inventoryReports.get('/treatment-costs', zValidator('query', dateRangeSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const cacheKey = getCacheKey('treatment-costs', query);
  const cached = getCachedData<TreatmentCostReport>(cacheKey);
  if (cached) {
    return c.json({ report: cached });
  }

  try {
    const startDate = new Date(query.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(query.endDate);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await prisma.inventoryTransaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        type: InventoryTransactionType.TREATMENT_USE,
      },
    });

    // Get products
    const productIds = [...new Set(transactions.map(t => t.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productLookup = new Map(products.map(p => [p.id, p]));

    // Group by treatment type - KEEP THIS MAP
    const treatmentMap = new Map<string, {
      treatmentId: string;
      treatmentName: string;
      treatments: number;
      totalCost: number;
      totalRevenue: number;
      productUsage: Map<string, { productId: string; productName: string; totalUnits: number; totalCost: number }>;
    }>();

    for (const txn of transactions) {
      // TODO: Get treatment name from appointmentId or add serviceName to transaction
      const serviceName = 'Treatment'; // Placeholder
      const treatmentId = serviceName.toLowerCase().replace(/\s+/g, '-');
      const unitsUsed = Math.abs(txn.quantity);
      const cost = txn.totalCost || (unitsUsed * (txn.unitCost || 0));
      const product = productLookup.get(txn.productId);
      const unitRetail = product ? (product.unitType === ProductUnitType.units ? product.retailPrice / 100 : product.retailPrice) : 0;
      const revenue = product ? unitsUsed * unitRetail : cost * 2;

      const treatmentData = treatmentMap.get(treatmentId) || {
        treatmentId,
        treatmentName: serviceName,
        treatments: 0,
        totalCost: 0,
        totalRevenue: 0,
        productUsage: new Map(),
      };

      treatmentData.treatments += 1;
      treatmentData.totalCost += cost;
      treatmentData.totalRevenue += revenue;

      const productName = product?.name || 'Unknown';
      const prodUsage = treatmentData.productUsage.get(txn.productId) || { productId: txn.productId, productName, totalUnits: 0, totalCost: 0 };
      prodUsage.totalUnits += unitsUsed;
      prodUsage.totalCost += cost;
      treatmentData.productUsage.set(txn.productId, prodUsage);

      treatmentMap.set(treatmentId, treatmentData);
    }

    const byTreatment = Array.from(treatmentMap.values()).map(t => ({
      treatmentId: t.treatmentId,
      treatmentName: t.treatmentName,
      totalTreatments: t.treatments,
      avgProductCost: t.treatments > 0 ? Math.round((t.totalCost / t.treatments) * 100) / 100 : 0,
      avgRevenue: t.treatments > 0 ? Math.round((t.totalRevenue / t.treatments) * 100) / 100 : 0,
      avgProfit: t.treatments > 0 ? Math.round(((t.totalRevenue - t.totalCost) / t.treatments) * 100) / 100 : 0,
      profitMargin: t.totalRevenue > 0 ? Math.round(((t.totalRevenue - t.totalCost) / t.totalRevenue) * 10000) / 100 : 0,
      productBreakdown: Array.from(t.productUsage.values()).map(p => ({
        productId: p.productId,
        productName: p.productName,
        avgUnitsUsed: t.treatments > 0 ? Math.round((p.totalUnits / t.treatments) * 100) / 100 : 0,
        avgCost: t.treatments > 0 ? Math.round((p.totalCost / t.treatments) * 100) / 100 : 0,
      })),
    })).sort((a, b) => b.totalTreatments - a.totalTreatments);

    const totalTreatments = byTreatment.reduce((sum, t) => sum + t.totalTreatments, 0);
    const totalCost = byTreatment.reduce((sum, t) => sum + t.avgProductCost * t.totalTreatments, 0);
    const totalRevenue = byTreatment.reduce((sum, t) => sum + t.avgRevenue * t.totalTreatments, 0);

    const report: TreatmentCostReport = {
      startDate: query.startDate,
      endDate: query.endDate,
      byTreatment,
      overallAvgCost: totalTreatments > 0 ? Math.round((totalCost / totalTreatments) * 100) / 100 : 0,
      overallAvgRevenue: totalTreatments > 0 ? Math.round((totalRevenue / totalTreatments) * 100) / 100 : 0,
      overallAvgProfit: totalTreatments > 0 ? Math.round(((totalRevenue - totalCost) / totalTreatments) * 100) / 100 : 0,
    };

    setCachedData(cacheKey, report);

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_report',
      ipAddress,
      metadata: { reportType: 'treatment-costs', startDate: query.startDate, endDate: query.endDate },
    });

    return c.json({ report });
  } catch (error) {
    handlePrismaError(error);
  }
});

/**
 * Get profitability by product/treatment
 * GET /api/inventory/reports/profitability
 */
inventoryReports.get('/profitability', zValidator('query', dateRangeSchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const cacheKey = getCacheKey('profitability', query);
  const cached = getCachedData<ProfitabilityReport>(cacheKey);
  if (cached) {
    return c.json({ report: cached });
  }

  try {
    const startDate = new Date(query.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(query.endDate);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await prisma.inventoryTransaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        type: InventoryTransactionType.TREATMENT_USE,
      },
    });

    // Get products
    const productIds = [...new Set(transactions.map(t => t.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productLookup = new Map(products.map(p => [p.id, p]));

    // By product - KEEP THESE MAPS
    const productMap = new Map<string, { productId: string; productName: string; category: string; unitsUsed: number; cost: number; revenue: number }>();
    const treatmentMap = new Map<string, { treatmentId: string; treatmentName: string; count: number; cost: number; revenue: number }>();

    for (const txn of transactions) {
      const unitsUsed = Math.abs(txn.quantity);
      const cost = txn.totalCost || (unitsUsed * (txn.unitCost || 0));
      const product = productLookup.get(txn.productId);
      const unitRetail = product ? (product.unitType === ProductUnitType.units ? product.retailPrice / 100 : product.retailPrice) : 0;
      const revenue = product ? unitsUsed * unitRetail : cost * 2;

      // By product
      const productName = product?.name || 'Unknown';
      const category = product?.category || 'other';
      const prodData = productMap.get(txn.productId) || { productId: txn.productId, productName, category, unitsUsed: 0, cost: 0, revenue: 0 };
      prodData.unitsUsed += unitsUsed;
      prodData.cost += cost;
      prodData.revenue += revenue;
      productMap.set(txn.productId, prodData);

      // By treatment
      // TODO: Get treatment name from appointmentId
      const serviceName = 'Treatment';
      const treatmentId = serviceName.toLowerCase().replace(/\s+/g, '-');
      const treatmentData = treatmentMap.get(treatmentId) || { treatmentId, treatmentName: serviceName, count: 0, cost: 0, revenue: 0 };
      treatmentData.count += 1;
      treatmentData.cost += cost;
      treatmentData.revenue += revenue;
      treatmentMap.set(treatmentId, treatmentData);
    }

    const byProduct = Array.from(productMap.values()).map(p => ({
      ...p,
      profit: p.revenue - p.cost,
      margin: p.revenue > 0 ? Math.round(((p.revenue - p.cost) / p.revenue) * 10000) / 100 : 0,
    })).sort((a, b) => b.profit - a.profit);

    const byTreatment = Array.from(treatmentMap.values()).map(t => ({
      treatmentId: t.treatmentId,
      treatmentName: t.treatmentName,
      treatmentCount: t.count,
      revenue: t.revenue,
      cost: t.cost,
      profit: t.revenue - t.cost,
      margin: t.revenue > 0 ? Math.round(((t.revenue - t.cost) / t.revenue) * 10000) / 100 : 0,
    })).sort((a, b) => b.profit - a.profit);

    const totalRevenue = byProduct.reduce((sum, p) => sum + p.revenue, 0);
    const totalCost = byProduct.reduce((sum, p) => sum + p.cost, 0);

    const report: ProfitabilityReport = {
      startDate: query.startDate,
      endDate: query.endDate,
      totalRevenue,
      totalCost,
      grossProfit: totalRevenue - totalCost,
      profitMargin: totalRevenue > 0 ? Math.round(((totalRevenue - totalCost) / totalRevenue) * 10000) / 100 : 0,
      byProduct,
      byTreatment,
    };

    setCachedData(cacheKey, report);

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_report',
      ipAddress,
      metadata: { reportType: 'profitability', startDate: query.startDate, endDate: query.endDate },
    });

    return c.json({ report });
  } catch (error) {
    handlePrismaError(error);
  }
});

// ===================
// Dashboard Metrics
// ===================

/**
 * Get dashboard KPIs (all key metrics in one call)
 * GET /api/inventory/metrics
 */
inventoryReports.get('/', zValidator('query', metricsQuerySchema), async (c) => {
  const query = c.req.valid('query');
  const user = c.get('user');
  const ipAddress = getClientIP(c);

  const cacheKey = getCacheKey('metrics', query);
  const cached = getCachedData<InventoryMetrics>(cacheKey);
  if (cached) {
    return c.json({ metrics: cached });
  }

  try {
    const today = new Date();
    const in30Days = new Date(today);
    in30Days.setDate(in30Days.getDate() + 30);
    const in60Days = new Date(today);
    in60Days.setDate(in60Days.getDate() + 60);
    const in90Days = new Date(today);
    in90Days.setDate(in90Days.getDate() + 90);

    const lots = await prisma.inventoryLot.findMany({
      where: {
        ...(query.locationId && { locationId: query.locationId }),
        deletedAt: null,
      },
      include: {
        product: true,
      },
    });

    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        isActive: true,
      },
    });

    // Valuation
    let totalValue = 0;
    let totalCost = 0;
    let expiredValue = 0;

    for (const lot of lots) {
      const product = lot.product;
      if (!product) continue;

      const unitCost = lot.purchaseCost || product.costPrice;
      const costValue = lot.currentQuantity * unitCost;
      const unitRetail = product.unitType === ProductUnitType.units ? product.retailPrice / 100 : product.retailPrice;
      const retailValue = lot.currentQuantity * unitRetail;

      if (lot.status === LotStatusType.expired || lot.expirationDate < today) {
        expiredValue += costValue;
      } else if (lot.status === LotStatusType.available) {
        totalCost += costValue;
        totalValue += retailValue;
      }
    }

    // Stock health
    const activeLots = lots.filter(l => l.status === LotStatusType.available && l.currentQuantity > 0);
    const productWithStock = new Set(activeLots.map(l => l.productId));
    const inStockProducts = productWithStock.size;

    // Check low stock
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    for (const product of products) {
      const productLots = activeLots.filter(l => l.productId === product.id);
      const totalQty = productLots.reduce((sum, l) => sum + l.currentQuantity, 0);
      if (totalQty === 0) {
        outOfStockProducts++;
      } else if (totalQty <= product.reorderPoint) {
        lowStockProducts++;
      }
    }

    // Expiration counts
    const expiringIn30Days = lots.filter(l => l.status === LotStatusType.available && l.expirationDate >= today && l.expirationDate <= in30Days).length;
    const expiringIn60Days = lots.filter(l => l.status === LotStatusType.available && l.expirationDate > in30Days && l.expirationDate <= in60Days).length;
    const expiringIn90Days = lots.filter(l => l.status === LotStatusType.available && l.expirationDate > in60Days && l.expirationDate <= in90Days).length;

    // Turnover (simplified - last 30 days)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentTransactions = await prisma.inventoryTransaction.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        type: InventoryTransactionType.TREATMENT_USE,
      },
    });
    const totalUsed = recentTransactions.reduce((sum, txn) => sum + Math.abs(txn.quantity), 0);
    const avgStock = lots.reduce((sum, l) => sum + (l.initialQuantity + l.currentQuantity) / 2, 0);
    const turnoverRatio = avgStock > 0 ? (totalUsed / avgStock) * 12 : 0; // Annualized
    const averageDaysToSell = turnoverRatio > 0 ? 365 / turnoverRatio : 999;

    // Variance
    const counts = await prisma.inventoryCount.findMany();
    const totalVarianceValue = counts.reduce((sum, c) => sum + (c.varianceTotal || 0), 0);
    const variancePercent = totalCost > 0 ? (Math.abs(totalVarianceValue) / totalCost) * 100 : 0;

    const metrics: InventoryMetrics = {
      totalValue,
      totalCost,
      potentialProfit: totalValue - totalCost,
      totalProducts: products.length,
      inStockProducts,
      lowStockProducts,
      outOfStockProducts,
      expiringIn30Days,
      expiringIn60Days,
      expiringIn90Days,
      expiredValue,
      inventoryTurnoverRatio: Math.round(turnoverRatio * 100) / 100,
      averageDaysToSell: Math.round(averageDaysToSell),
      totalVarianceValue,
      variancePercent: Math.round(variancePercent * 100) / 100,
      calculatedAt: new Date(),
    };

    setCachedData(cacheKey, metrics);

    await logAuditEvent({
      userId: user.uid,
      action: 'READ',
      resourceType: 'inventory_report',
      ipAddress,
      metadata: { reportType: 'metrics' },
    });

    return c.json({ metrics });
  } catch (error) {
    handlePrismaError(error);
  }
});

// ===================
// Cache Management (for testing)
// ===================

export function clearCache() {
  reportCache.clear();
}

export default inventoryReports;
