// Inventory Lots API - Lot tracking and management
// GET: List lots with FIFO ordering
// POST: Create new lot manually

import { NextRequest, NextResponse } from 'next/server';
import {
  inventoryLots,
  products,
  inventoryTransactions,
  getProductById,
  getLotsForProduct,
} from '@/lib/data/inventory';
import { InventoryLot, LotStatus, InventoryTransaction } from '@/types/inventory';

// GET /api/inventory/lots - List lots with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const locationId = searchParams.get('locationId');
    const status = searchParams.get('status') as LotStatus | null;
    const expiringWithinDays = searchParams.get('expiringWithinDays');
    const query = searchParams.get('query');
    const fifoOrder = searchParams.get('fifoOrder') !== 'false';

    let filteredLots = [...inventoryLots];

    // Apply filters
    if (productId) {
      filteredLots = filteredLots.filter(lot => lot.productId === productId);
    }

    if (locationId) {
      filteredLots = filteredLots.filter(lot => lot.locationId === locationId);
    }

    if (status) {
      filteredLots = filteredLots.filter(lot => lot.status === status);
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredLots = filteredLots.filter(
        lot =>
          lot.lotNumber.toLowerCase().includes(lowerQuery) ||
          lot.productName.toLowerCase().includes(lowerQuery)
      );
    }

    if (expiringWithinDays) {
      const days = parseInt(expiringWithinDays, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + days);
      filteredLots = filteredLots.filter(
        lot => lot.expirationDate <= cutoff && lot.status === 'available'
      );
    }

    // Sort by expiration date (FIFO) if requested
    if (fifoOrder) {
      filteredLots.sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());
    }

    // Enrich with product details and calculate days until expiration
    const now = new Date();
    const enrichedLots = filteredLots.map(lot => {
      const product = getProductById(lot.productId);
      const daysUntilExpiration = Math.ceil(
        (lot.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        ...lot,
        daysUntilExpiration,
        expirationStatus:
          daysUntilExpiration <= 0
            ? 'expired'
            : daysUntilExpiration <= 7
            ? 'critical'
            : daysUntilExpiration <= 30
            ? 'warning'
            : daysUntilExpiration <= 90
            ? 'notice'
            : 'good',
        product: product
          ? {
              id: product.id,
              name: product.name,
              displayName: product.displayName,
              category: product.category,
              brand: product.brand,
              unitType: product.unitType,
              requiresRefrigeration: product.storageRequirements.requiresRefrigeration,
            }
          : null,
      };
    });

    // Summary by status
    const summary = {
      total: filteredLots.length,
      available: filteredLots.filter(l => l.status === 'available').length,
      quarantine: filteredLots.filter(l => l.status === 'quarantine').length,
      expired: filteredLots.filter(l => l.status === 'expired').length,
      depleted: filteredLots.filter(l => l.status === 'depleted').length,
      expiringIn7Days: enrichedLots.filter(
        l => l.daysUntilExpiration <= 7 && l.daysUntilExpiration > 0 && l.status === 'available'
      ).length,
      expiringIn30Days: enrichedLots.filter(
        l => l.daysUntilExpiration <= 30 && l.daysUntilExpiration > 0 && l.status === 'available'
      ).length,
      totalQuantity: filteredLots
        .filter(l => l.status === 'available')
        .reduce((sum, l) => sum + l.currentQuantity, 0),
      totalValue: filteredLots
        .filter(l => l.status === 'available')
        .reduce((sum, l) => sum + l.purchaseCost, 0),
    };

    return NextResponse.json({
      success: true,
      data: {
        lots: enrichedLots,
        summary,
      },
    });
  } catch (error) {
    console.error('Error fetching lots:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lots' },
      { status: 500 }
    );
  }
}

// POST /api/inventory/lots - Create lot manually (adjustment or correction)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      productId,
      lotNumber,
      quantity,
      expirationDate,
      locationId,
      purchaseCost,
      manufacturingDate,
      vendorId,
      vendorName,
      invoiceNumber,
      storageLocation,
      notes,
      createdBy,
    } = body;

    // Validate required fields
    if (!productId || !lotNumber || !quantity || !expirationDate || !locationId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: productId, lotNumber, quantity, expirationDate, locationId' },
        { status: 400 }
      );
    }

    // Validate product exists
    const product = getProductById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: `Product not found: ${productId}` },
        { status: 400 }
      );
    }

    // Check for duplicate lot number for same product
    const existingLot = inventoryLots.find(
      l => l.productId === productId && l.lotNumber === lotNumber && l.locationId === locationId
    );
    if (existingLot) {
      return NextResponse.json(
        { success: false, error: `Lot ${lotNumber} already exists for this product at this location` },
        { status: 400 }
      );
    }

    // Create new lot
    const lotId = `lot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newLot: InventoryLot = {
      id: lotId,
      productId,
      productName: product.name,
      lotNumber,
      manufacturingDate: manufacturingDate ? new Date(manufacturingDate) : undefined,
      expirationDate: new Date(expirationDate),
      receivedDate: new Date(),
      initialQuantity: quantity,
      currentQuantity: quantity,
      reservedQuantity: 0,
      availableQuantity: quantity,
      unitType: product.unitType,
      locationId,
      locationName: 'The Village', // TODO: Get from location service
      storageLocation,
      vendorId,
      vendorName,
      invoiceNumber,
      purchaseCost: purchaseCost || product.costPrice * quantity,
      status: 'available',
      qualityNotes: notes,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: createdBy || 'system',
      lastUpdatedBy: createdBy || 'system',
    };

    // Create transaction record
    const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const transaction: InventoryTransaction = {
      id: transactionId,
      type: 'adjustment_add',
      status: 'completed',
      timestamp: new Date(),
      productId,
      productName: product.name,
      lotId,
      lotNumber,
      quantity,
      unitType: product.unitType,
      quantityBefore: 0,
      quantityAfter: quantity,
      unitCost: (purchaseCost || product.costPrice * quantity) / quantity,
      totalCost: purchaseCost || product.costPrice * quantity,
      locationId,
      locationName: 'The Village',
      reason: 'Manual lot creation',
      notes: notes || `Created lot ${lotNumber} with ${quantity} ${product.unitType}`,
      performedBy: createdBy || 'system',
      performedByName: createdBy || 'System',
      approvalRequired: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add to data stores
    inventoryLots.push(newLot);
    inventoryTransactions.push(transaction);

    return NextResponse.json({
      success: true,
      data: {
        lot: newLot,
        transaction,
      },
    });
  } catch (error) {
    console.error('Error creating lot:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create lot' },
      { status: 500 }
    );
  }
}
