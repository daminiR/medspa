// Inventory Deduction API - FIFO-based automatic inventory deduction
// POST: Deduct inventory from treatment usage

import { NextRequest, NextResponse } from 'next/server';
import {
  products,
  inventoryLots,
  inventoryLevels,
  inventoryTransactions,
  inventoryAlerts,
  getProductById,
  getLotsForProduct,
  selectLotForDeduction,
  calculateInventoryLevels,
} from '@/lib/data/inventory';
import {
  InventoryTransaction,
  InventoryDeductionRequest,
  InventoryDeductionResponse,
  InventoryAlert,
  StockStatus,
} from '@/types/inventory';

// POST /api/inventory/deduct - Deduct inventory (treatment usage)
export async function POST(request: NextRequest) {
  try {
    const body: InventoryDeductionRequest = await request.json();
    const {
      productId,
      quantity,
      lotId,
      appointmentId,
      patientId,
      practitionerId,
      treatmentDetails,
      performedBy,
    } = body;

    // Validate product exists
    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: `Product not found: ${productId}` },
        { status: 400 }
      );
    }

    // Get default location (in real app, this would come from context)
    const locationId = 'loc-1';

    // Select lots to deduct from (FIFO)
    let lotsToDeduct: { lot: (typeof inventoryLots)[0]; quantityFromLot: number }[] = [];

    if (lotId) {
      // Specific lot requested
      const specificLot = inventoryLots.find(l => l.id === lotId);
      if (!specificLot) {
        return NextResponse.json(
          { success: false, error: `Lot not found: ${lotId}` },
          { status: 400 }
        );
      }
      if (specificLot.availableQuantity < quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient quantity in lot ${specificLot.lotNumber}. Available: ${specificLot.availableQuantity}, Requested: ${quantity}`,
          },
          { status: 400 }
        );
      }
      lotsToDeduct = [{ lot: specificLot, quantityFromLot: quantity }];
    } else {
      // FIFO selection
      lotsToDeduct = selectLotForDeduction(productId, quantity, locationId);
      const totalAvailable = lotsToDeduct.reduce((sum, s) => sum + s.quantityFromLot, 0);
      if (totalAvailable < quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient inventory. Available: ${totalAvailable}, Requested: ${quantity}`,
          },
          { status: 400 }
        );
      }
    }

    // Perform deduction from each selected lot
    const transactions: InventoryTransaction[] = [];
    let totalDeducted = 0;

    for (const { lot, quantityFromLot } of lotsToDeduct) {
      const quantityBefore = lot.currentQuantity;

      // Update lot quantities
      lot.currentQuantity -= quantityFromLot;
      lot.availableQuantity -= quantityFromLot;
      lot.updatedAt = new Date();

      // Mark as depleted if empty
      if (lot.currentQuantity <= 0) {
        lot.status = 'depleted';
      }

      // Create transaction record
      const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const transaction: InventoryTransaction = {
        id: transactionId,
        type: 'treatment_use',
        status: 'completed',
        timestamp: new Date(),
        productId,
        productName: product.name,
        lotId: lot.id,
        lotNumber: lot.lotNumber,
        quantity: -quantityFromLot, // Negative for deduction
        unitType: product.unitType,
        quantityBefore,
        quantityAfter: lot.currentQuantity,
        unitCost: lot.purchaseCost / lot.initialQuantity,
        totalCost: (lot.purchaseCost / lot.initialQuantity) * quantityFromLot,
        locationId,
        locationName: lot.locationName,
        appointmentId,
        patientId,
        practitionerId,
        treatmentDetails: treatmentDetails
          ? {
              serviceName: treatmentDetails.serviceName,
              areasInjected: treatmentDetails.areasInjected,
              chartId: treatmentDetails.chartId,
              treatmentNotes: treatmentDetails.notes,
            }
          : undefined,
        reason: 'Patient treatment',
        notes: `${product.name} used in treatment`,
        performedBy,
        performedByName: performedBy, // In real app, look up name
        approvalRequired: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      transactions.push(transaction);
      inventoryTransactions.push(transaction);
      totalDeducted += quantityFromLot;
    }

    // Recalculate inventory levels
    const updatedLevels = calculateInventoryLevels();

    // Find updated level for this product
    const productLevel = updatedLevels.find(
      l => l.productId === productId && l.locationId === locationId
    );

    // Generate alerts if needed
    const generatedAlerts: InventoryAlert[] = [];

    if (productLevel) {
      if (productLevel.status === 'out_of_stock') {
        generatedAlerts.push({
          id: `alert-stock-out-${Date.now()}`,
          type: 'out_of_stock',
          severity: 'critical',
          status: 'active',
          productId,
          productName: product.name,
          locationId,
          locationName: 'The Village',
          title: `Out of Stock: ${product.name}`,
          message: `${product.name} is now out of stock. Cannot perform treatments requiring this product.`,
          actionRequired: 'Place order immediately',
          currentValue: productLevel.availableQuantity,
          thresholdValue: product.minStockLevel,
          notificationSent: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else if (productLevel.status === 'critical') {
        generatedAlerts.push({
          id: `alert-stock-critical-${Date.now()}`,
          type: 'low_stock',
          severity: 'critical',
          status: 'active',
          productId,
          productName: product.name,
          locationId,
          locationName: 'The Village',
          title: `Critical Low Stock: ${product.name}`,
          message: `Only ${productLevel.availableQuantity} ${product.unitType} remaining.`,
          actionRequired: 'Order urgently',
          currentValue: productLevel.availableQuantity,
          thresholdValue: product.minStockLevel,
          notificationSent: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else if (productLevel.status === 'low_stock') {
        generatedAlerts.push({
          id: `alert-stock-low-${Date.now()}`,
          type: 'low_stock',
          severity: 'warning',
          status: 'active',
          productId,
          productName: product.name,
          locationId,
          locationName: 'The Village',
          title: `Low Stock: ${product.name}`,
          message: `${productLevel.availableQuantity} ${product.unitType} remaining.`,
          actionRequired: 'Place reorder',
          currentValue: productLevel.availableQuantity,
          thresholdValue: product.reorderPoint,
          notificationSent: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Add alerts to store
    generatedAlerts.forEach(alert => inventoryAlerts.push(alert));

    const response: InventoryDeductionResponse = {
      success: true,
      transaction: transactions[0], // Primary transaction
      lotUsed: {
        lotId: lotsToDeduct[0].lot.id,
        lotNumber: lotsToDeduct[0].lot.lotNumber,
        quantityDeducted: lotsToDeduct[0].quantityFromLot,
        remainingInLot: lotsToDeduct[0].lot.currentQuantity,
      },
      productStock: {
        productId,
        totalAvailable: productLevel?.availableQuantity || 0,
        status: (productLevel?.status as StockStatus) || 'out_of_stock',
      },
      alerts: generatedAlerts.length > 0 ? generatedAlerts : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deducting inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to deduct inventory' },
      { status: 500 }
    );
  }
}
