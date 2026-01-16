// Inventory Analytics API
// Provider accountability, cost-per-use, waste tracking, and profitability analysis
// Key insight from research: "If you're not breaking down cost per use, it's hard to price services profitably"

import { NextRequest, NextResponse } from 'next/server';
import {
  ProviderInventoryStats,
  TreatmentCostAnalysis,
  WasteRecord,
  WasteReason,
} from '@/types/inventory';
import {
  inventoryTransactions,
  products,
  getProductById,
} from '@/lib/data/inventory';

// In-memory waste records (replace with DB in production)
let wasteRecords: WasteRecord[] = [];

// Helper: Generate unique ID
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reportType = searchParams.get('type');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const providerId = searchParams.get('providerId');
  const productId = searchParams.get('productId');
  const locationId = searchParams.get('locationId');

  // Parse dates
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  switch (reportType) {
    case 'provider':
      return getProviderAnalytics(start, end, providerId, locationId);
    case 'provider-comparison':
      return getProviderComparison(start, end, locationId);
    case 'cost-per-treatment':
      return getTreatmentCostAnalysis(start, end, productId, locationId);
    case 'waste':
      return getWasteAnalytics(start, end, providerId, locationId);
    case 'profitability':
      return getProfitabilityAnalysis(start, end, productId, locationId);
    case 'usage-trends':
      return getUsageTrends(start, end, productId, locationId);
    default:
      return getSummaryAnalytics(start, end, locationId);
  }
}

// POST - Record waste
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      lotId,
      lotNumber,
      productId,
      openVialSessionId,
      unitsWasted,
      reason,
      reasonNotes,
      practitionerId,
      practitionerName,
      recordedBy,
      recordedByName,
      locationId,
      locationName,
      appointmentId,
    } = body;

    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const unitCost = product.costPrice / product.unitsPerPackage;
    const totalWasteValue = unitsWasted * unitCost;

    const wasteRecord: WasteRecord = {
      id: generateId('waste'),
      lotId: lotId || '',
      lotNumber: lotNumber || '',
      productId,
      productName: product.displayName || product.name,
      openVialSessionId,
      unitsWasted,
      unitType: product.unitType,
      reason: reason as WasteReason,
      reasonNotes,
      unitCost,
      totalWasteValue,
      recordedBy,
      recordedByName: recordedByName || 'Staff',
      recordedAt: new Date(),
      locationId,
      locationName: locationName || 'Main Location',
      practitionerId,
      practitionerName,
      appointmentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    wasteRecords.push(wasteRecord);

    return NextResponse.json({
      success: true,
      wasteRecord,
      impact: {
        totalWasteValue,
        monthlyWasteProjection: totalWasteValue * 30, // Simple projection
      },
    });
  } catch (error) {
    console.error('Waste recording error:', error);
    return NextResponse.json({ success: false, error: 'Failed to record waste' }, { status: 500 });
  }
}

// Provider-level analytics
function getProviderAnalytics(
  startDate: Date,
  endDate: Date,
  providerId?: string | null,
  locationId?: string | null
): NextResponse {
  // Filter transactions
  let transactions = inventoryTransactions.filter(
    t =>
      t.type === 'treatment_use' &&
      t.timestamp >= startDate &&
      t.timestamp <= endDate
  );

  if (locationId) {
    transactions = transactions.filter(t => t.locationId === locationId);
  }

  // Group by provider
  const providerMap = new Map<string, {
    totalUnits: number;
    treatments: number;
    products: Map<string, { units: number; treatments: number }>;
    areas: Map<string, { units: number; treatments: number }>;
    revenue: number;
    cost: number;
  }>();

  transactions.forEach(t => {
    const pid = t.practitionerId || 'unknown';
    if (providerId && pid !== providerId) return;

    let providerData = providerMap.get(pid);
    if (!providerData) {
      providerData = {
        totalUnits: 0,
        treatments: 0,
        products: new Map(),
        areas: new Map(),
        revenue: 0,
        cost: 0,
      };
      providerMap.set(pid, providerData);
    }

    const units = Math.abs(t.quantity);
    providerData.totalUnits += units;
    providerData.treatments += 1;
    providerData.cost += t.totalCost;

    // Estimate revenue (would come from billing in production)
    const product = getProductById(t.productId);
    if (product) {
      providerData.revenue += units * product.unitPrice;
    }

    // Track by product
    const productKey = t.productId;
    const productData = providerData.products.get(productKey) || { units: 0, treatments: 0 };
    productData.units += units;
    productData.treatments += 1;
    providerData.products.set(productKey, productData);

    // Track by area
    if (t.treatmentDetails?.areasInjected) {
      t.treatmentDetails.areasInjected.forEach(area => {
        const areaData = providerData.areas.get(area.name) || { units: 0, treatments: 0 };
        areaData.units += area.units;
        areaData.treatments += 1;
        providerData.areas.set(area.name, areaData);
      });
    }
  });

  // Calculate clinic averages
  let totalClinicUnits = 0;
  let totalClinicTreatments = 0;
  providerMap.forEach(data => {
    totalClinicUnits += data.totalUnits;
    totalClinicTreatments += data.treatments;
  });
  const clinicAvgUnitsPerTreatment = totalClinicTreatments > 0 ? totalClinicUnits / totalClinicTreatments : 0;

  // Build provider stats
  const providerStats: ProviderInventoryStats[] = [];
  providerMap.forEach((data, pid) => {
    const avgUnits = data.treatments > 0 ? data.totalUnits / data.treatments : 0;
    const variance = clinicAvgUnitsPerTreatment > 0
      ? ((avgUnits - clinicAvgUnitsPerTreatment) / clinicAvgUnitsPerTreatment) * 100
      : 0;

    // Get waste for this provider
    const providerWaste = wasteRecords.filter(
      w => w.practitionerId === pid && w.recordedAt >= startDate && w.recordedAt <= endDate
    );
    const wasteUnits = providerWaste.reduce((sum, w) => sum + w.unitsWasted, 0);
    const wasteValue = providerWaste.reduce((sum, w) => sum + w.totalWasteValue, 0);

    const byProduct = Array.from(data.products.entries()).map(([productId, pData]) => {
      const product = getProductById(productId);
      return {
        productId,
        productName: product?.displayName || product?.name || productId,
        unitsUsed: pData.units,
        treatments: pData.treatments,
        avgPerTreatment: pData.treatments > 0 ? pData.units / pData.treatments : 0,
        vsClinicAverage: 0, // Would calculate per-product clinic average
      };
    });

    const byArea = Array.from(data.areas.entries()).map(([area, aData]) => ({
      area,
      unitsUsed: aData.units,
      treatments: aData.treatments,
      avgPerTreatment: aData.treatments > 0 ? aData.units / aData.treatments : 0,
    }));

    const grossProfit = data.revenue - data.cost;

    providerStats.push({
      providerId: pid,
      providerName: transactions.find(t => t.practitionerId === pid)?.practitionerName || pid,
      totalUnitsUsed: data.totalUnits,
      totalTreatments: data.treatments,
      averageUnitsPerTreatment: avgUnits,
      averageUnitsVsClinicAverage: variance,
      isAboveAverage: variance > 0,
      variancePercent: Math.abs(variance),
      byProduct,
      byArea,
      wasteUnits,
      wasteValue,
      wastePercent: data.totalUnits > 0 ? (wasteUnits / data.totalUnits) * 100 : 0,
      revenueGenerated: data.revenue,
      costOfGoodsUsed: data.cost,
      grossProfit,
      profitMargin: data.revenue > 0 ? (grossProfit / data.revenue) * 100 : 0,
      periodStart: startDate,
      periodEnd: endDate,
      calculatedAt: new Date(),
    });
  });

  // Sort by usage (highest first)
  providerStats.sort((a, b) => b.totalUnitsUsed - a.totalUnitsUsed);

  return NextResponse.json({
    success: true,
    providers: providerStats,
    clinicAverage: {
      unitsPerTreatment: clinicAvgUnitsPerTreatment,
      totalTreatments: totalClinicTreatments,
      totalUnits: totalClinicUnits,
    },
    period: { start: startDate, end: endDate },
  });
}

// Provider comparison (identify outliers)
function getProviderComparison(
  startDate: Date,
  endDate: Date,
  locationId?: string | null
): NextResponse {
  // This would call getProviderAnalytics and add comparison insights
  const analyticsResponse = getProviderAnalytics(startDate, endDate, null, locationId);

  // Add insights about outliers
  return analyticsResponse;
}

// Treatment cost analysis
function getTreatmentCostAnalysis(
  startDate: Date,
  endDate: Date,
  productId?: string | null,
  locationId?: string | null
): NextResponse {
  let transactions = inventoryTransactions.filter(
    t =>
      t.type === 'treatment_use' &&
      t.timestamp >= startDate &&
      t.timestamp <= endDate
  );

  if (locationId) {
    transactions = transactions.filter(t => t.locationId === locationId);
  }

  if (productId) {
    transactions = transactions.filter(t => t.productId === productId);
  }

  // Group by treatment type
  const treatmentMap = new Map<string, {
    costs: number[];
    units: number[];
    revenues: number[];
    products: Map<string, { units: number; cost: number }>;
  }>();

  transactions.forEach(t => {
    const treatmentName = t.treatmentDetails?.serviceName || 'Unknown Treatment';

    let treatmentData = treatmentMap.get(treatmentName);
    if (!treatmentData) {
      treatmentData = { costs: [], units: [], revenues: [], products: new Map() };
      treatmentMap.set(treatmentName, treatmentData);
    }

    const units = Math.abs(t.quantity);
    treatmentData.costs.push(t.totalCost);
    treatmentData.units.push(units);

    const product = getProductById(t.productId);
    if (product) {
      treatmentData.revenues.push(units * product.unitPrice);

      const productData = treatmentData.products.get(t.productId) || { units: 0, cost: 0 };
      productData.units += units;
      productData.cost += t.totalCost;
      treatmentData.products.set(t.productId, productData);
    }
  });

  // Calculate analysis for each treatment
  const analyses: TreatmentCostAnalysis[] = [];
  treatmentMap.forEach((data, treatmentName) => {
    const totalCost = data.costs.reduce((a, b) => a + b, 0);
    const totalUnits = data.units.reduce((a, b) => a + b, 0);
    const totalRevenue = data.revenues.reduce((a, b) => a + b, 0);
    const count = data.costs.length;

    const avgCost = count > 0 ? totalCost / count : 0;
    const avgUnits = count > 0 ? totalUnits / count : 0;
    const avgRevenue = count > 0 ? totalRevenue / count : 0;
    const avgProfit = avgRevenue - avgCost;

    // Calculate variance
    const variance = count > 1
      ? Math.sqrt(data.costs.reduce((sum, cost) => sum + Math.pow(cost - avgCost, 2), 0) / count)
      : 0;

    const productBreakdown = Array.from(data.products.entries()).map(([pid, pData]) => {
      const product = getProductById(pid);
      return {
        productId: pid,
        productName: product?.displayName || product?.name || pid,
        avgUnitsUsed: count > 0 ? pData.units / count : 0,
        avgCost: count > 0 ? pData.cost / count : 0,
        percentOfTotalCost: totalCost > 0 ? (pData.cost / totalCost) * 100 : 0,
      };
    });

    analyses.push({
      treatmentId: treatmentName.toLowerCase().replace(/\s+/g, '-'),
      treatmentName,
      avgProductCost: avgCost,
      avgUnitsUsed: avgUnits,
      avgCostPerUnit: avgUnits > 0 ? avgCost / avgUnits : 0,
      avgRevenuePerTreatment: avgRevenue,
      avgProfitPerTreatment: avgProfit,
      avgProfitMargin: avgRevenue > 0 ? (avgProfit / avgRevenue) * 100 : 0,
      productBreakdown,
      costVariance: variance,
      highCostTreatments: data.costs.filter(c => c > avgCost * 1.2).length,
      lowCostTreatments: data.costs.filter(c => c < avgCost * 0.8).length,
      trend: 'stable', // Would calculate from historical data
      trendPercent: 0,
      periodStart: startDate,
      periodEnd: endDate,
      totalTreatments: count,
      calculatedAt: new Date(),
    });
  });

  // Sort by total treatments
  analyses.sort((a, b) => b.totalTreatments - a.totalTreatments);

  return NextResponse.json({
    success: true,
    treatments: analyses,
    summary: {
      totalTreatments: analyses.reduce((sum, a) => sum + a.totalTreatments, 0),
      avgProfitMargin: analyses.length > 0
        ? analyses.reduce((sum, a) => sum + a.avgProfitMargin, 0) / analyses.length
        : 0,
    },
    period: { start: startDate, end: endDate },
  });
}

// Waste analytics
function getWasteAnalytics(
  startDate: Date,
  endDate: Date,
  providerId?: string | null,
  locationId?: string | null
): NextResponse {
  let records = wasteRecords.filter(
    w => w.recordedAt >= startDate && w.recordedAt <= endDate
  );

  if (providerId) {
    records = records.filter(w => w.practitionerId === providerId);
  }

  if (locationId) {
    records = records.filter(w => w.locationId === locationId);
  }

  // Group by reason
  const byReason = new Map<WasteReason, { count: number; units: number; value: number }>();
  records.forEach(w => {
    const data = byReason.get(w.reason) || { count: 0, units: 0, value: 0 };
    data.count += 1;
    data.units += w.unitsWasted;
    data.value += w.totalWasteValue;
    byReason.set(w.reason, data);
  });

  // Group by product
  const byProduct = new Map<string, { count: number; units: number; value: number }>();
  records.forEach(w => {
    const data = byProduct.get(w.productId) || { count: 0, units: 0, value: 0 };
    data.count += 1;
    data.units += w.unitsWasted;
    data.value += w.totalWasteValue;
    byProduct.set(w.productId, data);
  });

  // Group by provider
  const byProvider = new Map<string, { count: number; units: number; value: number }>();
  records.forEach(w => {
    if (!w.practitionerId) return;
    const data = byProvider.get(w.practitionerId) || { count: 0, units: 0, value: 0 };
    data.count += 1;
    data.units += w.unitsWasted;
    data.value += w.totalWasteValue;
    byProvider.set(w.practitionerId, data);
  });

  const totalWasteValue = records.reduce((sum, w) => sum + w.totalWasteValue, 0);
  const totalWasteUnits = records.reduce((sum, w) => sum + w.unitsWasted, 0);

  return NextResponse.json({
    success: true,
    summary: {
      totalRecords: records.length,
      totalUnitsWasted: totalWasteUnits,
      totalWasteValue,
      avgWastePerIncident: records.length > 0 ? totalWasteValue / records.length : 0,
    },
    byReason: Array.from(byReason.entries()).map(([reason, data]) => ({
      reason,
      ...data,
      percentOfTotal: totalWasteValue > 0 ? (data.value / totalWasteValue) * 100 : 0,
    })).sort((a, b) => b.value - a.value),
    byProduct: Array.from(byProduct.entries()).map(([productId, data]) => {
      const product = getProductById(productId);
      return {
        productId,
        productName: product?.displayName || product?.name || productId,
        ...data,
        percentOfTotal: totalWasteValue > 0 ? (data.value / totalWasteValue) * 100 : 0,
      };
    }).sort((a, b) => b.value - a.value),
    byProvider: Array.from(byProvider.entries()).map(([providerId, data]) => ({
      providerId,
      providerName: records.find(r => r.practitionerId === providerId)?.practitionerName || providerId,
      ...data,
    })).sort((a, b) => b.value - a.value),
    recentRecords: records.slice(0, 20),
    period: { start: startDate, end: endDate },
  });
}

// Profitability analysis
function getProfitabilityAnalysis(
  startDate: Date,
  endDate: Date,
  productId?: string | null,
  locationId?: string | null
): NextResponse {
  let transactions = inventoryTransactions.filter(
    t =>
      t.type === 'treatment_use' &&
      t.timestamp >= startDate &&
      t.timestamp <= endDate
  );

  if (locationId) {
    transactions = transactions.filter(t => t.locationId === locationId);
  }

  if (productId) {
    transactions = transactions.filter(t => t.productId === productId);
  }

  // Calculate profitability by product
  const productProfitability = new Map<string, {
    unitsUsed: number;
    cost: number;
    revenue: number;
    treatments: number;
  }>();

  transactions.forEach(t => {
    const product = getProductById(t.productId);
    if (!product) return;

    const units = Math.abs(t.quantity);
    const data = productProfitability.get(t.productId) || {
      unitsUsed: 0, cost: 0, revenue: 0, treatments: 0,
    };

    data.unitsUsed += units;
    data.cost += t.totalCost;
    data.revenue += units * product.unitPrice;
    data.treatments += 1;
    productProfitability.set(t.productId, data);
  });

  // Get waste impact
  const wasteInPeriod = wasteRecords.filter(
    w => w.recordedAt >= startDate && w.recordedAt <= endDate
  );
  if (locationId) {
    wasteRecords.filter(w => w.locationId === locationId);
  }
  const totalWasteValue = wasteInPeriod.reduce((sum, w) => sum + w.totalWasteValue, 0);

  const productAnalysis = Array.from(productProfitability.entries()).map(([pid, data]) => {
    const product = getProductById(pid);
    const grossProfit = data.revenue - data.cost;
    const wasteForProduct = wasteInPeriod
      .filter(w => w.productId === pid)
      .reduce((sum, w) => sum + w.totalWasteValue, 0);
    const netProfit = grossProfit - wasteForProduct;

    return {
      productId: pid,
      productName: product?.displayName || product?.name || pid,
      unitsUsed: data.unitsUsed,
      cost: data.cost,
      revenue: data.revenue,
      grossProfit,
      wasteValue: wasteForProduct,
      netProfit,
      grossMargin: data.revenue > 0 ? (grossProfit / data.revenue) * 100 : 0,
      netMargin: data.revenue > 0 ? (netProfit / data.revenue) * 100 : 0,
      treatments: data.treatments,
      revenuePerTreatment: data.treatments > 0 ? data.revenue / data.treatments : 0,
      costPerTreatment: data.treatments > 0 ? data.cost / data.treatments : 0,
    };
  });

  // Sort by net profit
  productAnalysis.sort((a, b) => b.netProfit - a.netProfit);

  const totalRevenue = productAnalysis.reduce((sum, p) => sum + p.revenue, 0);
  const totalCost = productAnalysis.reduce((sum, p) => sum + p.cost, 0);
  const totalGrossProfit = totalRevenue - totalCost;
  const totalNetProfit = totalGrossProfit - totalWasteValue;

  return NextResponse.json({
    success: true,
    summary: {
      totalRevenue,
      totalCost,
      totalGrossProfit,
      totalWasteValue,
      totalNetProfit,
      grossMargin: totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0,
      netMargin: totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0,
      wasteImpactPercent: totalGrossProfit > 0 ? (totalWasteValue / totalGrossProfit) * 100 : 0,
    },
    byProduct: productAnalysis,
    insights: generateProfitabilityInsights(productAnalysis, totalWasteValue),
    period: { start: startDate, end: endDate },
  });
}

// Usage trends
function getUsageTrends(
  startDate: Date,
  endDate: Date,
  productId?: string | null,
  locationId?: string | null
): NextResponse {
  // Would calculate weekly/monthly trends
  return NextResponse.json({
    success: true,
    message: 'Usage trends coming soon',
    period: { start: startDate, end: endDate },
  });
}

// Summary analytics
function getSummaryAnalytics(
  startDate: Date,
  endDate: Date,
  locationId?: string | null
): NextResponse {
  let transactions = inventoryTransactions.filter(
    t => t.timestamp >= startDate && t.timestamp <= endDate
  );

  if (locationId) {
    transactions = transactions.filter(t => t.locationId === locationId);
  }

  const treatmentTransactions = transactions.filter(t => t.type === 'treatment_use');
  const totalUnitsUsed = treatmentTransactions.reduce((sum, t) => sum + Math.abs(t.quantity), 0);
  const totalCost = treatmentTransactions.reduce((sum, t) => sum + t.totalCost, 0);
  const uniquePatients = new Set(treatmentTransactions.map(t => t.patientId)).size;
  const uniqueProviders = new Set(treatmentTransactions.map(t => t.practitionerId)).size;

  // Calculate revenue estimate
  let totalRevenue = 0;
  treatmentTransactions.forEach(t => {
    const product = getProductById(t.productId);
    if (product) {
      totalRevenue += Math.abs(t.quantity) * product.unitPrice;
    }
  });

  // Waste summary
  const wasteInPeriod = wasteRecords.filter(
    w => w.recordedAt >= startDate && w.recordedAt <= endDate
  );
  const totalWasteValue = wasteInPeriod.reduce((sum, w) => sum + w.totalWasteValue, 0);

  return NextResponse.json({
    success: true,
    summary: {
      totalTreatments: treatmentTransactions.length,
      totalUnitsUsed,
      totalCost,
      totalRevenue,
      grossProfit: totalRevenue - totalCost,
      grossMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0,
      totalWasteValue,
      wastePercent: totalCost > 0 ? (totalWasteValue / totalCost) * 100 : 0,
      uniquePatients,
      uniqueProviders,
      avgUnitsPerTreatment: treatmentTransactions.length > 0 ? totalUnitsUsed / treatmentTransactions.length : 0,
      avgCostPerTreatment: treatmentTransactions.length > 0 ? totalCost / treatmentTransactions.length : 0,
    },
    period: { start: startDate, end: endDate },
  });
}

// Helper: Generate profitability insights
function generateProfitabilityInsights(
  productAnalysis: any[],
  totalWasteValue: number
): string[] {
  const insights: string[] = [];

  // High waste impact
  if (totalWasteValue > 500) {
    insights.push(`⚠️ High waste detected: $${totalWasteValue.toFixed(2)} in product waste this period. Consider reviewing vial management practices.`);
  }

  // Low margin products
  const lowMarginProducts = productAnalysis.filter(p => p.netMargin < 30);
  if (lowMarginProducts.length > 0) {
    insights.push(`💡 ${lowMarginProducts.length} product(s) have net margins below 30%. Consider pricing adjustments.`);
  }

  // Best performers
  const topProduct = productAnalysis[0];
  if (topProduct) {
    insights.push(`🌟 Top performer: ${topProduct.productName} with $${topProduct.netProfit.toFixed(2)} net profit.`);
  }

  // Waste by product
  const highWasteProducts = productAnalysis.filter(p => p.wasteValue > p.grossProfit * 0.1);
  if (highWasteProducts.length > 0) {
    insights.push(`📉 ${highWasteProducts.length} product(s) have waste exceeding 10% of gross profit.`);
  }

  return insights;
}
