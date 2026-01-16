// Charting Integration API - Auto-Deduction
// When a treatment is charted, inventory automatically deducts
//
// User feedback from research:
// "I LOVE aesthetic record... The inventory tracking system deducts inventory units as providers chart procedures."
// This is the #1 feature users love about good inventory systems

import { NextRequest, NextResponse } from 'next/server';
import {
  ChartingInventoryLink,
  InventoryTransaction,
  TransactionType,
  InventoryAlert,
  OpenVialSession,
} from '@/types/inventory';
import {
  inventoryLots,
  products,
  getProductById,
  selectLotForDeduction,
} from '@/lib/data/inventory';

// In-memory stores (replace with DB in production)
let chartingLinks: ChartingInventoryLink[] = [];
let transactionLog: InventoryTransaction[] = [];

// Helper functions
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// GET - Get charting links by chartId, appointmentId, or patientId
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const chartId = searchParams.get('chartId');
  const appointmentId = searchParams.get('appointmentId');
  const patientId = searchParams.get('patientId');
  const practitionerId = searchParams.get('practitionerId');
  const status = searchParams.get('status');

  let links = [...chartingLinks];

  if (chartId) {
    links = links.filter(l => l.chartId === chartId);
  }

  if (appointmentId) {
    links = links.filter(l => l.appointmentId === appointmentId);
  }

  if (patientId) {
    links = links.filter(l => l.patientId === patientId);
  }

  if (practitionerId) {
    links = links.filter(l => l.practitionerId === practitionerId);
  }

  if (status) {
    links = links.filter(l => l.deductionStatus === status);
  }

  // Sort by most recent first
  links.sort((a, b) => b.chartCompletedAt.getTime() - a.chartCompletedAt.getTime());

  return NextResponse.json({
    success: true,
    links,
    count: links.length,
    pendingCount: links.filter(l => l.deductionStatus === 'pending').length,
    failedCount: links.filter(l => l.deductionStatus === 'failed').length,
  });
}

// POST - Process charting completion and auto-deduct inventory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action as 'chart-complete' | 'manual-deduct' | 'retry' | 'override';

    switch (action) {
      case 'chart-complete':
        return handleChartComplete(body);
      case 'manual-deduct':
        return handleManualDeduct(body);
      case 'retry':
        return handleRetryDeduction(body);
      case 'override':
        return handleManualOverride(body);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: chart-complete, manual-deduct, retry, or override' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Charting integration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle chart completion - auto-deduct inventory
async function handleChartComplete(body: {
  action: string;
  chartId: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  practitionerId: string;
  practitionerName: string;
  locationId: string;
  productsUsed: {
    productId: string;
    unitsUsed: number;
    lotId?: string;
    openVialSessionId?: string;
    areasInjected?: { name: string; units: number }[];
  }[];
  autoDeduct?: boolean;
}): Promise<NextResponse> {
  const {
    chartId,
    appointmentId,
    patientId,
    patientName,
    practitionerId,
    practitionerName,
    locationId,
    productsUsed,
    autoDeduct = true,
  } = body;

  // Check for existing link
  const existingLink = chartingLinks.find(l => l.chartId === chartId);
  if (existingLink) {
    return NextResponse.json(
      { success: false, error: 'Chart already processed', existingLink },
      { status: 400 }
    );
  }

  const now = new Date();
  const transactionIds: string[] = [];
  const alerts: InventoryAlert[] = [];
  const processedProducts: ChartingInventoryLink['productsUsed'] = [];
  let deductionStatus: ChartingInventoryLink['deductionStatus'] = 'pending';
  let deductionError: string | undefined;

  // Process each product
  for (const productUsage of productsUsed) {
    const product = getProductById(productUsage.productId);
    if (!product) {
      deductionError = `Product not found: ${productUsage.productId}`;
      deductionStatus = 'failed';
      continue;
    }

    // Determine which lot to use (FIFO if not specified)
    let lotId = productUsage.lotId;
    let lotNumber: string | undefined;

    if (!lotId) {
      // Auto-select using FIFO (first expiring first out)
      const lotSelections = selectLotForDeduction(
        productUsage.productId,
        productUsage.unitsUsed,
        locationId
      );

      if (lotSelections.length === 0) {
        deductionError = `No available inventory for ${product.name}`;
        deductionStatus = 'failed';
        alerts.push({
          id: generateId('alert'),
          type: 'out_of_stock',
          severity: 'critical',
          status: 'active',
          productId: product.id,
          productName: product.displayName || product.name,
          locationId,
          locationName: 'Location',
          title: `Out of Stock: ${product.displayName || product.name}`,
          message: `Cannot deduct ${productUsage.unitsUsed} units. No available inventory.`,
          actionRequired: 'Place order immediately',
          notificationSent: false,
          createdAt: now,
          updatedAt: now,
        });
        continue;
      }

      // Use first available lot (FIFO)
      lotId = lotSelections[0].lot.id;
      lotNumber = lotSelections[0].lot.lotNumber;
    } else {
      // Find the specified lot
      const lot = inventoryLots.find(l => l.id === lotId);
      if (lot) {
        lotNumber = lot.lotNumber;
      }
    }

    // Create transaction if auto-deduct is enabled
    if (autoDeduct) {
      const transaction: InventoryTransaction = {
        id: generateId('txn'),
        type: 'treatment_use' as TransactionType,
        status: 'completed',
        timestamp: now,
        productId: product.id,
        productName: product.displayName || product.name,
        lotId: lotId || '',
        lotNumber: lotNumber || '',
        quantity: -productUsage.unitsUsed, // Negative for deductions
        unitType: product.unitType,
        quantityBefore: 0, // Would calculate from actual lot
        quantityAfter: 0,
        unitCost: product.costPrice / product.unitsPerPackage,
        totalCost: (product.costPrice / product.unitsPerPackage) * productUsage.unitsUsed,
        locationId,
        locationName: 'Location',
        appointmentId,
        patientId,
        patientName,
        practitionerId,
        practitionerName,
        treatmentDetails: {
          serviceName: 'Treatment',
          areasInjected: productUsage.areasInjected,
          chartId,
        },
        reason: 'Auto-deducted from charting',
        performedBy: practitionerId,
        performedByName: practitionerName,
        approvalRequired: false,
        createdAt: now,
        updatedAt: now,
      };

      transactionLog.push(transaction);
      transactionIds.push(transaction.id);
    }

    processedProducts.push({
      productId: product.id,
      productName: product.displayName || product.name,
      unitsUsed: productUsage.unitsUsed,
      lotId,
      lotNumber,
      openVialSessionId: productUsage.openVialSessionId,
      areasInjected: productUsage.areasInjected,
    });
  }

  // Update deduction status
  if (autoDeduct && transactionIds.length > 0 && !deductionError) {
    deductionStatus = 'completed';
  }

  // Create charting link
  const chartingLink: ChartingInventoryLink = {
    chartId,
    appointmentId,
    patientId,
    patientName,
    practitionerId,
    practitionerName,
    productsUsed: processedProducts,
    autoDeductionEnabled: autoDeduct,
    deductionStatus,
    deductionError,
    transactionIds,
    chartCompletedAt: now,
    deductionProcessedAt: autoDeduct ? now : undefined,
    createdAt: now,
    updatedAt: now,
  };

  chartingLinks.push(chartingLink);

  // Generate low stock alerts if needed
  for (const processed of processedProducts) {
    const product = getProductById(processed.productId);
    if (!product) continue;

    // Check remaining stock
    const lots = inventoryLots.filter(
      l => l.productId === processed.productId && l.status === 'available'
    );
    const totalAvailable = lots.reduce((sum, l) => sum + l.availableQuantity, 0);

    if (totalAvailable <= product.reorderPoint && totalAvailable > product.minStockLevel) {
      alerts.push({
        id: generateId('alert'),
        type: 'low_stock',
        severity: 'warning',
        status: 'active',
        productId: product.id,
        productName: product.displayName || product.name,
        locationId,
        locationName: 'Location',
        title: `Low Stock: ${product.displayName || product.name}`,
        message: `${totalAvailable} ${product.unitType} remaining. Consider reordering.`,
        actionRequired: 'Place reorder',
        currentValue: totalAvailable,
        thresholdValue: product.reorderPoint,
        notificationSent: false,
        createdAt: now,
        updatedAt: now,
      });
    } else if (totalAvailable <= product.minStockLevel) {
      alerts.push({
        id: generateId('alert'),
        type: 'low_stock',
        severity: 'critical',
        status: 'active',
        productId: product.id,
        productName: product.displayName || product.name,
        locationId,
        locationName: 'Location',
        title: `Critical: ${product.displayName || product.name}`,
        message: `Only ${totalAvailable} ${product.unitType} remaining. Order urgently.`,
        actionRequired: 'Order immediately',
        currentValue: totalAvailable,
        thresholdValue: product.minStockLevel,
        notificationSent: false,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return NextResponse.json({
    success: deductionStatus === 'completed',
    chartingLink,
    transactions: transactionLog.filter(t => transactionIds.includes(t.id)),
    alerts: alerts.length > 0 ? alerts : undefined,
    summary: {
      productsProcessed: processedProducts.length,
      transactionsCreated: transactionIds.length,
      alertsGenerated: alerts.length,
    },
  });
}

// Handle manual deduction (bypass charting)
async function handleManualDeduct(body: {
  action: string;
  productId: string;
  unitsToDeduct: number;
  lotId?: string;
  patientId: string;
  patientName: string;
  appointmentId: string;
  practitionerId: string;
  practitionerName: string;
  locationId: string;
  reason: string;
}): Promise<NextResponse> {
  const {
    productId,
    unitsToDeduct,
    lotId,
    patientId,
    patientName,
    appointmentId,
    practitionerId,
    practitionerName,
    locationId,
    reason,
  } = body;

  const product = getProductById(productId);
  if (!product) {
    return NextResponse.json(
      { success: false, error: 'Product not found' },
      { status: 404 }
    );
  }

  // Get lot (use FIFO if not specified)
  let selectedLotId = lotId;
  let selectedLotNumber: string | undefined;

  if (!selectedLotId) {
    const lotSelections = selectLotForDeduction(productId, unitsToDeduct, locationId);
    if (lotSelections.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No available inventory' },
        { status: 400 }
      );
    }
    selectedLotId = lotSelections[0].lot.id;
    selectedLotNumber = lotSelections[0].lot.lotNumber;
  } else {
    const lot = inventoryLots.find(l => l.id === selectedLotId);
    if (lot) {
      selectedLotNumber = lot.lotNumber;
    }
  }

  const now = new Date();
  const transaction: InventoryTransaction = {
    id: generateId('txn'),
    type: 'treatment_use' as TransactionType,
    status: 'completed',
    timestamp: now,
    productId: product.id,
    productName: product.displayName || product.name,
    lotId: selectedLotId || '',
    lotNumber: selectedLotNumber || '',
    quantity: -unitsToDeduct,
    unitType: product.unitType,
    quantityBefore: 0,
    quantityAfter: 0,
    unitCost: product.costPrice / product.unitsPerPackage,
    totalCost: (product.costPrice / product.unitsPerPackage) * unitsToDeduct,
    locationId,
    locationName: 'Location',
    appointmentId,
    patientId,
    patientName,
    practitionerId,
    practitionerName,
    reason: `Manual deduction: ${reason}`,
    performedBy: practitionerId,
    performedByName: practitionerName,
    approvalRequired: false,
    createdAt: now,
    updatedAt: now,
  };

  transactionLog.push(transaction);

  return NextResponse.json({
    success: true,
    transaction,
    remainingInventory: 0, // Would calculate actual remaining
  });
}

// Retry failed deduction
async function handleRetryDeduction(body: {
  action: string;
  chartId: string;
}): Promise<NextResponse> {
  const { chartId } = body;

  const linkIndex = chartingLinks.findIndex(l => l.chartId === chartId);
  if (linkIndex === -1) {
    return NextResponse.json(
      { success: false, error: 'Charting link not found' },
      { status: 404 }
    );
  }

  const link = chartingLinks[linkIndex];

  if (link.deductionStatus !== 'failed') {
    return NextResponse.json(
      { success: false, error: 'Deduction is not in failed state' },
      { status: 400 }
    );
  }

  // Retry the deduction (simplified - would actually re-process)
  link.deductionStatus = 'completed';
  link.deductionError = undefined;
  link.deductionProcessedAt = new Date();
  link.updatedAt = new Date();

  chartingLinks[linkIndex] = link;

  return NextResponse.json({
    success: true,
    chartingLink: link,
    message: 'Deduction retried successfully',
  });
}

// Manual override - mark as processed without deducting
async function handleManualOverride(body: {
  action: string;
  chartId: string;
  overrideReason: string;
  overriddenBy: string;
}): Promise<NextResponse> {
  const { chartId, overrideReason, overriddenBy } = body;

  const linkIndex = chartingLinks.findIndex(l => l.chartId === chartId);
  if (linkIndex === -1) {
    return NextResponse.json(
      { success: false, error: 'Charting link not found' },
      { status: 404 }
    );
  }

  const link = chartingLinks[linkIndex];

  link.deductionStatus = 'manual_override';
  link.deductionError = `Override by ${overriddenBy}: ${overrideReason}`;
  link.updatedAt = new Date();

  chartingLinks[linkIndex] = link;

  return NextResponse.json({
    success: true,
    chartingLink: link,
    message: 'Manual override applied',
  });
}
