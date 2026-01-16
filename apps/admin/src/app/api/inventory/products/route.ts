// Inventory Products API - CRUD operations for products
// GET: List all products
// POST: Create new product

import { NextRequest, NextResponse } from 'next/server';
import {
  products,
  vendors,
  getProductById,
  getProductsByCategory,
  getActiveProducts,
} from '@/lib/data/inventory';
import { Product, ProductCategory } from '@/types/inventory';

// GET /api/inventory/products - List products with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const category = searchParams.get('category') as ProductCategory | null;
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    const vendorId = searchParams.get('vendorId');
    const trackInventoryOnly = searchParams.get('trackInventoryOnly') === 'true';
    const injectablesOnly = searchParams.get('injectablesOnly') === 'true';

    let filteredProducts = activeOnly ? getActiveProducts() : [...products];

    // Apply filters
    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredProducts = filteredProducts.filter(
        product =>
          product.name.toLowerCase().includes(lowerQuery) ||
          product.displayName.toLowerCase().includes(lowerQuery) ||
          product.brand.toLowerCase().includes(lowerQuery) ||
          product.sku.toLowerCase().includes(lowerQuery)
      );
    }

    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (vendorId) {
      filteredProducts = filteredProducts.filter(p => p.manufacturerId === vendorId);
    }

    if (trackInventoryOnly) {
      filteredProducts = filteredProducts.filter(p => p.trackInventory);
    }

    if (injectablesOnly) {
      filteredProducts = filteredProducts.filter(
        p => p.category === 'neurotoxin' || p.category === 'filler'
      );
    }

    // Enrich with vendor details
    const enrichedProducts = filteredProducts.map(product => {
      const vendor = vendors.find(v => v.id === product.manufacturerId);
      return {
        ...product,
        vendor: vendor
          ? {
              id: vendor.id,
              name: vendor.name,
              shortName: vendor.shortName,
            }
          : null,
      };
    });

    // Group by category for UI convenience
    const byCategory = {
      neurotoxin: enrichedProducts.filter(p => p.category === 'neurotoxin'),
      filler: enrichedProducts.filter(p => p.category === 'filler'),
      skincare: enrichedProducts.filter(p => p.category === 'skincare'),
      device: enrichedProducts.filter(p => p.category === 'device'),
      consumable: enrichedProducts.filter(p => p.category === 'consumable'),
      supplement: enrichedProducts.filter(p => p.category === 'supplement'),
      other: enrichedProducts.filter(p => p.category === 'other'),
    };

    return NextResponse.json({
      success: true,
      data: {
        products: enrichedProducts,
        byCategory,
        total: enrichedProducts.length,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/inventory/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'category', 'brand', 'sku', 'costPrice', 'retailPrice', 'unitPrice', 'unitType'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check for duplicate SKU
    const existingSku = products.find(p => p.sku === body.sku);
    if (existingSku) {
      return NextResponse.json(
        { success: false, error: `Product with SKU ${body.sku} already exists` },
        { status: 400 }
      );
    }

    // Create new product
    const productId = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newProduct: Product = {
      id: productId,
      name: body.name,
      displayName: body.displayName || body.name,
      description: body.description,
      category: body.category,
      brand: body.brand,
      manufacturerId: body.manufacturerId || '',
      manufacturerName: body.manufacturerName || body.brand,
      sku: body.sku,
      ndc: body.ndc,
      upc: body.upc,
      gtin: body.gtin,
      costPrice: body.costPrice,
      retailPrice: body.retailPrice,
      markupPercent: ((body.retailPrice - body.costPrice) / body.costPrice) * 100,
      unitPrice: body.unitPrice,
      unitType: body.unitType,
      unitsPerPackage: body.unitsPerPackage || 1,
      injectableDetails: body.injectableDetails,
      storageRequirements: body.storageRequirements || {
        temperatureMin: 15,
        temperatureMax: 25,
        requiresRefrigeration: false,
        freezerStorage: false,
        lightSensitive: false,
        humidityControlled: false,
      },
      reorderPoint: body.reorderPoint || 10,
      reorderQuantity: body.reorderQuantity || 20,
      minStockLevel: body.minStockLevel || 5,
      maxStockLevel: body.maxStockLevel || 100,
      leadTimeDays: body.leadTimeDays || 5,
      trackInventory: body.trackInventory !== false,
      trackByLot: body.trackByLot !== false,
      trackBySerial: body.trackBySerial || false,
      requireExpirationDate: body.requireExpirationDate !== false,
      commissionable: body.commissionable || false,
      commissionRate: body.commissionRate,
      tags: body.tags || [],
      treatmentTypes: body.treatmentTypes || [],
      requiredCertifications: body.requiredCertifications,
      status: 'active',
      isActive: true,
      availableForSale: body.availableForSale || false,
      requiresPrescription: body.requiresPrescription || false,
      controlledSubstance: body.controlledSubstance || false,
      hsaFsaEligible: body.hsaFsaEligible || false,
      imageUrl: body.imageUrl,
      thumbnailUrl: body.thumbnailUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: body.createdBy || 'system',
      lastUpdatedBy: body.createdBy || 'system',
    };

    // Add to products array (in real app, this would be database)
    products.push(newProduct);

    return NextResponse.json({
      success: true,
      data: newProduct,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
