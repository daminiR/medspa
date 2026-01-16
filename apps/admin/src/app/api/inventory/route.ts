// Inventory API - Main endpoint for inventory management
// GET: List inventory levels with filters
// POST: Receive new inventory

import { NextRequest, NextResponse } from 'next/server';
import {
  products,
  inventoryLevels,
  inventoryLots,
  inventoryTransactions,
  inventoryAlerts,
  getProductById,
  getLotsForProduct,
  calculateInventoryLevels,
} from '@/lib/data/inventory';
import {
  InventoryLot,
  InventoryTransaction,
  ReceiveInventoryRequest,
  ReceiveInventoryResponse,
  StockStatus,
  ProductCategory,
} from '@/types/inventory';

// GET /api/inventory - List inventory with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const category = searchParams.get('category') as ProductCategory | null;
    const locationId = searchParams.get('locationId');
    const status = searchParams.get('status') as StockStatus | null;
    const lowStockOnly = searchParams.get('lowStockOnly') === 'true';
    const expiringWithinDays = searchParams.get('expiringWithinDays');
    const includeAlerts = searchParams.get('includeAlerts') !== 'false';
    const includeLots = searchParams.get('includeLots') === 'true';

    let filteredLevels = [...inventoryLevels];

    // Apply filters
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredLevels = filteredLevels.filter(
        level =>
          level.productName.toLowerCase().includes(lowerQuery) ||
          products.find(p => p.id === level.productId)?.sku.toLowerCase().includes(lowerQuery)
      );
    }

    if (category) {
      const categoryProductIds = products
        .filter(p => p.category === category)
        .map(p => p.id);
      filteredLevels = filteredLevels.filter(level =>
        categoryProductIds.includes(level.productId)
      );
    }

    if (locationId) {
      filteredLevels = filteredLevels.filter(level => level.locationId === locationId);
    }

    if (status) {
      filteredLevels = filteredLevels.filter(level => level.status === status);
    }

    if (lowStockOnly) {
      filteredLevels = filteredLevels.filter(
        level =>
          level.status === 'low_stock' ||
          level.status === 'critical' ||
          level.status === 'out_of_stock'
      );
    }

    // Enrich with product details
    const enrichedLevels = filteredLevels.map(level => {
      const product = getProductById(level.productId);
      const lots = includeLots ? getLotsForProduct(level.productId, level.locationId) : [];

      return {
        ...level,
        product: product
          ? {
              id: product.id,
              name: product.name,
              displayName: product.displayName,
              category: product.category,
              brand: product.brand,
              sku: product.sku,
              unitPrice: product.unitPrice,
              unitType: product.unitType,
              reorderPoint: product.reorderPoint,
              reorderQuantity: product.reorderQuantity,
              requiresRefrigeration: product.storageRequirements.requiresRefrigeration,
              trackByLot: product.trackByLot,
            }
          : null,
        lots: lots.map(lot => ({
          id: lot.id,
          lotNumber: lot.lotNumber,
          currentQuantity: lot.currentQuantity,
          availableQuantity: lot.availableQuantity,
          expirationDate: lot.expirationDate,
          status: lot.status,
          storageLocation: lot.storageLocation,
        })),
      };
    });

    // Get alerts if requested
    let alerts = includeAlerts ? inventoryAlerts.filter(a => a.status === 'active') : [];
    if (locationId) {
      alerts = alerts.filter(a => a.locationId === locationId);
    }

    // Calculate summary metrics
    const summary = {
      totalProducts: filteredLevels.length,
      inStock: filteredLevels.filter(l => l.status === 'in_stock').length,
      lowStock: filteredLevels.filter(l => l.status === 'low_stock').length,
      critical: filteredLevels.filter(l => l.status === 'critical').length,
      outOfStock: filteredLevels.filter(l => l.status === 'out_of_stock').length,
      totalValue: filteredLevels.reduce((sum, l) => sum + l.totalRetailValue, 0),
      totalCost: filteredLevels.reduce((sum, l) => sum + l.totalCost, 0),
      activeAlerts: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        inventory: enrichedLevels,
        alerts,
        summary,
      },
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory' },
      { status: 500 }
    );
  }
}

// POST /api/inventory - Receive new inventory
export async function POST(request: NextRequest) {
  try {
    const body: ReceiveInventoryRequest = await request.json();
    const { items, locationId, receivedBy, purchaseOrderId, notes } = body;

    const createdLots: InventoryLot[] = [];
    const createdTransactions: InventoryTransaction[] = [];
    const generatedAlerts: typeof inventoryAlerts = [];

    for (const item of items) {
      const product = getProductById(item.productId);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      // Create new lot
      const lotId = `lot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newLot: InventoryLot = {
        id: lotId,
        productId: item.productId,
        productName: product.name,
        lotNumber: item.lotNumber,
        manufacturingDate: item.manufacturingDate,
        expirationDate: new Date(item.expirationDate),
        receivedDate: new Date(),
        initialQuantity: item.quantity,
        currentQuantity: item.quantity,
        reservedQuantity: 0,
        availableQuantity: item.quantity,
        unitType: product.unitType,
        locationId,
        locationName: 'The Village', // TODO: Get from location service
        purchaseOrderId,
        purchaseCost: item.unitCost * item.quantity,
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: receivedBy,
        lastUpdatedBy: receivedBy,
      };

      // Add serial number if provided
      if (item.serialNumber) {
        newLot.serialNumber = item.serialNumber;
      }

      createdLots.push(newLot);

      // Create transaction record
      const transactionId = `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newTransaction: InventoryTransaction = {
        id: transactionId,
        type: 'receive',
        status: 'completed',
        timestamp: new Date(),
        productId: item.productId,
        productName: product.name,
        lotId,
        lotNumber: item.lotNumber,
        quantity: item.quantity,
        unitType: product.unitType,
        quantityBefore: 0,
        quantityAfter: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.unitCost * item.quantity,
        locationId,
        locationName: 'The Village',
        purchaseOrderId,
        reason: 'Inventory received',
        notes: notes || `Received ${item.quantity} ${product.unitType} of ${product.name}`,
        performedBy: receivedBy,
        performedByName: receivedBy,
        approvalRequired: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      createdTransactions.push(newTransaction);

      // Add to mock data stores (in real app, this would be database)
      inventoryLots.push(newLot);
      inventoryTransactions.push(newTransaction);

      // Check for expiration alerts
      const daysUntilExpiration = Math.ceil(
        (new Date(item.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiration <= 90) {
        generatedAlerts.push({
          id: `alert-exp-${lotId}`,
          type: 'expiring_soon',
          severity: daysUntilExpiration <= 30 ? 'warning' : 'info',
          status: 'active',
          productId: item.productId,
          productName: product.name,
          lotId,
          lotNumber: item.lotNumber,
          locationId,
          locationName: 'The Village',
          title: `New inventory expiring ${daysUntilExpiration <= 30 ? 'soon' : 'within 90 days'}`,
          message: `Lot ${item.lotNumber} expires in ${daysUntilExpiration} days`,
          expirationDate: new Date(item.expirationDate),
          daysUntilExpiration,
          notificationSent: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Recalculate inventory levels
    const updatedLevels = calculateInventoryLevels();

    const response: ReceiveInventoryResponse = {
      success: true,
      transactions: createdTransactions,
      lotsCreated: createdLots,
      alerts: generatedAlerts.length > 0 ? generatedAlerts : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error receiving inventory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to receive inventory' },
      { status: 500 }
    );
  }
}
