// Inventory Data Store - Medical Spa Platform
// Comprehensive inventory management with FDA-compliant lot tracking

import {
  Product,
  ProductCategory,
  InventoryLot,
  LotStatus,
  InventoryTransaction,
  TransactionType,
  InventoryLevel,
  StockStatus,
  PurchaseOrder,
  PurchaseOrderStatus,
  Vendor,
  InventoryAlert,
  AlertType,
  AlertSeverity,
  UnitType,
  EXPIRATION_THRESHOLDS,
  STOCK_THRESHOLDS,
} from '@/types/inventory';

// ============================================================================
// VENDORS
// ============================================================================

export const vendors: Vendor[] = [
  {
    id: 'vendor-allergan',
    name: 'Allergan Aesthetics',
    shortName: 'Allergan',
    contactName: 'Account Manager',
    email: 'orders@allergan.com',
    phone: '(800) 433-8871',
    website: 'https://www.allergan.com',
    address: {
      street: '2525 Dupont Dr',
      city: 'Irvine',
      state: 'CA',
      zipCode: '92612',
      country: 'USA',
    },
    accountNumber: 'ALG-2024-001',
    paymentTerms: 'Net 30',
    productIds: ['prod-botox', 'prod-juvederm-ultra', 'prod-juvederm-voluma', 'prod-latisse'],
    primaryCategory: 'neurotoxin',
    averageLeadDays: 3,
    onTimeDeliveryRate: 98,
    qualityRating: 5,
    isActive: true,
    isPreferred: true,
    notes: 'Primary supplier for Botox and Juvederm products. Alle rewards program partner.',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'vendor-galderma',
    name: 'Galderma',
    shortName: 'Galderma',
    contactName: 'Sales Representative',
    email: 'orders@galderma.com',
    phone: '(866) 735-4137',
    website: 'https://www.galderma.com',
    address: {
      street: '14501 N Freeway',
      city: 'Fort Worth',
      state: 'TX',
      zipCode: '76177',
      country: 'USA',
    },
    accountNumber: 'GAL-2024-001',
    paymentTerms: 'Net 30',
    productIds: ['prod-dysport', 'prod-restylane', 'prod-restylane-lyft', 'prod-sculptra'],
    primaryCategory: 'neurotoxin',
    averageLeadDays: 4,
    onTimeDeliveryRate: 96,
    qualityRating: 5,
    isActive: true,
    isPreferred: true,
    notes: 'Primary supplier for Dysport, Restylane, and Sculptra. Aspire rewards program partner.',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'vendor-merz',
    name: 'Merz Aesthetics',
    shortName: 'Merz',
    contactName: 'Account Executive',
    email: 'orders@merzaesthetics.com',
    phone: '(866) 862-1211',
    website: 'https://www.merzaesthetics.com',
    address: {
      street: '6501 Six Forks Rd',
      city: 'Raleigh',
      state: 'NC',
      zipCode: '27615',
      country: 'USA',
    },
    accountNumber: 'MRZ-2024-001',
    paymentTerms: 'Net 30',
    productIds: ['prod-xeomin', 'prod-radiesse', 'prod-belotero'],
    primaryCategory: 'neurotoxin',
    averageLeadDays: 5,
    onTimeDeliveryRate: 94,
    qualityRating: 4,
    isActive: true,
    isPreferred: false,
    notes: 'Supplier for Xeomin, Radiesse, and Belotero products.',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'vendor-revance',
    name: 'Revance Therapeutics',
    shortName: 'Revance',
    contactName: 'Territory Manager',
    email: 'orders@revance.com',
    phone: '(855) 732-8626',
    website: 'https://www.revance.com',
    accountNumber: 'REV-2024-001',
    paymentTerms: 'Net 30',
    productIds: ['prod-daxxify'],
    primaryCategory: 'neurotoxin',
    averageLeadDays: 5,
    onTimeDeliveryRate: 92,
    qualityRating: 4,
    isActive: true,
    isPreferred: false,
    notes: 'Supplier for DAXXIFY - longer lasting neurotoxin.',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// ============================================================================
// PRODUCTS
// ============================================================================

export const products: Product[] = [
  // NEUROTOXINS
  {
    id: 'prod-botox',
    name: 'Botox Cosmetic',
    displayName: 'Botox® Cosmetic',
    description: 'OnabotulinumtoxinA for cosmetic use. FDA approved for glabellar lines, forehead lines, and crow\'s feet.',
    category: 'neurotoxin',
    brand: 'Allergan',
    manufacturerId: 'vendor-allergan',
    manufacturerName: 'Allergan Aesthetics',
    sku: 'BTX-100U',
    ndc: '0023-1145-01',
    costPrice: 420,
    retailPrice: 1400,
    markupPercent: 233,
    unitPrice: 14,
    unitType: 'units',
    unitsPerPackage: 100,
    injectableDetails: {
      type: 'neurotoxin',
      concentration: '100U/vial',
      dilutionRatio: '2.5ml saline per 100U',
      defaultDilution: 2.5,
      reconstitutionRequired: true,
      maxHoursAfterReconstitution: 24,
    },
    storageRequirements: {
      temperatureMin: 2,
      temperatureMax: 8,
      requiresRefrigeration: true,
      freezerStorage: false,
      lightSensitive: true,
      humidityControlled: false,
      specialInstructions: 'Store in refrigerator at 2-8°C. Protect from light. Use within 24 hours of reconstitution.',
    },
    reorderPoint: 300,
    reorderQuantity: 500,
    minStockLevel: 100,
    maxStockLevel: 1500,
    leadTimeDays: 3,
    trackInventory: true,
    trackByLot: true,
    trackBySerial: false,
    requireExpirationDate: true,
    commissionable: true,
    commissionRate: 10,
    tags: ['neurotoxin', 'botulinum', 'wrinkle-treatment', 'allergan'],
    treatmentTypes: ['Botox Consultation', 'Botox Treatment', 'Brow Lift', 'Gummy Smile'],
    requiredCertifications: ['injector-certified'],
    status: 'active',
    isActive: true,
    availableForSale: false,
    requiresPrescription: true,
    controlledSubstance: false,
    hsaFsaEligible: true,
    imageUrl: '/images/products/botox.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },
  {
    id: 'prod-dysport',
    name: 'Dysport',
    displayName: 'Dysport®',
    description: 'AbobotulinumtoxinA for cosmetic use. FDA approved for glabellar lines.',
    category: 'neurotoxin',
    brand: 'Galderma',
    manufacturerId: 'vendor-galderma',
    manufacturerName: 'Galderma',
    sku: 'DSP-300U',
    ndc: '0299-5920-01',
    costPrice: 380,
    retailPrice: 1350,
    markupPercent: 255,
    unitPrice: 4.5,
    unitType: 'units',
    unitsPerPackage: 300,
    injectableDetails: {
      type: 'neurotoxin',
      concentration: '300U/vial',
      dilutionRatio: '2.5ml saline per 300U',
      defaultDilution: 2.5,
      reconstitutionRequired: true,
      maxHoursAfterReconstitution: 4,
    },
    storageRequirements: {
      temperatureMin: 2,
      temperatureMax: 8,
      requiresRefrigeration: true,
      freezerStorage: false,
      lightSensitive: true,
      humidityControlled: false,
      specialInstructions: 'Store in refrigerator at 2-8°C. Protect from light. Use within 4 hours of reconstitution.',
    },
    reorderPoint: 600,
    reorderQuantity: 1200,
    minStockLevel: 300,
    maxStockLevel: 3000,
    leadTimeDays: 4,
    trackInventory: true,
    trackByLot: true,
    trackBySerial: false,
    requireExpirationDate: true,
    commissionable: true,
    commissionRate: 10,
    tags: ['neurotoxin', 'botulinum', 'wrinkle-treatment', 'galderma'],
    treatmentTypes: ['Dysport Treatment', 'Brow Lift'],
    requiredCertifications: ['injector-certified'],
    status: 'active',
    isActive: true,
    availableForSale: false,
    requiresPrescription: true,
    controlledSubstance: false,
    hsaFsaEligible: true,
    imageUrl: '/images/products/dysport.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },
  {
    id: 'prod-xeomin',
    name: 'Xeomin',
    displayName: 'Xeomin®',
    description: 'IncobotulinumtoxinA for cosmetic use. Pure neurotoxin without complexing proteins.',
    category: 'neurotoxin',
    brand: 'Merz',
    manufacturerId: 'vendor-merz',
    manufacturerName: 'Merz Aesthetics',
    sku: 'XEO-100U',
    ndc: '0259-1605-01',
    costPrice: 400,
    retailPrice: 1200,
    markupPercent: 200,
    unitPrice: 12,
    unitType: 'units',
    unitsPerPackage: 100,
    injectableDetails: {
      type: 'neurotoxin',
      concentration: '100U/vial',
      dilutionRatio: '2.5ml saline per 100U',
      defaultDilution: 2.5,
      reconstitutionRequired: true,
      maxHoursAfterReconstitution: 24,
    },
    storageRequirements: {
      temperatureMin: 20,
      temperatureMax: 25,
      requiresRefrigeration: false,
      freezerStorage: false,
      lightSensitive: false,
      humidityControlled: false,
      specialInstructions: 'Store at room temperature. Use within 24 hours of reconstitution.',
    },
    reorderPoint: 200,
    reorderQuantity: 400,
    minStockLevel: 100,
    maxStockLevel: 1000,
    leadTimeDays: 5,
    trackInventory: true,
    trackByLot: true,
    trackBySerial: false,
    requireExpirationDate: true,
    commissionable: true,
    commissionRate: 10,
    tags: ['neurotoxin', 'botulinum', 'wrinkle-treatment', 'merz', 'pure-toxin'],
    treatmentTypes: ['Xeomin Treatment', 'Brow Lift'],
    requiredCertifications: ['injector-certified'],
    status: 'active',
    isActive: true,
    availableForSale: false,
    requiresPrescription: true,
    controlledSubstance: false,
    hsaFsaEligible: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },
  {
    id: 'prod-daxxify',
    name: 'Daxxify',
    displayName: 'Daxxify™',
    description: 'DaxibotulinumtoxinA-lanm for cosmetic use. Longer lasting neurotoxin.',
    category: 'neurotoxin',
    brand: 'Revance',
    manufacturerId: 'vendor-revance',
    manufacturerName: 'Revance Therapeutics',
    sku: 'DAX-100U',
    ndc: '73384-0100-01',
    costPrice: 550,
    retailPrice: 1600,
    markupPercent: 191,
    unitPrice: 16,
    unitType: 'units',
    unitsPerPackage: 100,
    injectableDetails: {
      type: 'neurotoxin',
      concentration: '100U/vial',
      dilutionRatio: '2.5ml saline per 100U',
      defaultDilution: 2.5,
      reconstitutionRequired: true,
      maxHoursAfterReconstitution: 24,
    },
    storageRequirements: {
      temperatureMin: 2,
      temperatureMax: 8,
      requiresRefrigeration: true,
      freezerStorage: false,
      lightSensitive: true,
      humidityControlled: false,
      specialInstructions: 'Store in refrigerator at 2-8°C. Protect from light.',
    },
    reorderPoint: 200,
    reorderQuantity: 300,
    minStockLevel: 100,
    maxStockLevel: 800,
    leadTimeDays: 5,
    trackInventory: true,
    trackByLot: true,
    trackBySerial: false,
    requireExpirationDate: true,
    commissionable: true,
    commissionRate: 10,
    tags: ['neurotoxin', 'botulinum', 'wrinkle-treatment', 'revance', 'long-lasting'],
    treatmentTypes: ['Daxxify Treatment'],
    requiredCertifications: ['injector-certified'],
    status: 'active',
    isActive: true,
    availableForSale: false,
    requiresPrescription: true,
    controlledSubstance: false,
    hsaFsaEligible: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },

  // DERMAL FILLERS
  {
    id: 'prod-juvederm-ultra',
    name: 'Juvederm Ultra XC',
    displayName: 'Juvéderm® Ultra XC',
    description: 'Hyaluronic acid dermal filler for lip augmentation and correction of moderate to severe facial wrinkles.',
    category: 'filler',
    brand: 'Allergan',
    manufacturerId: 'vendor-allergan',
    manufacturerName: 'Allergan Aesthetics',
    sku: 'JUV-ULTRA-1ML',
    ndc: '0023-3919-01',
    costPrice: 280,
    retailPrice: 650,
    markupPercent: 132,
    unitPrice: 650,
    unitType: 'syringe',
    unitsPerPackage: 1,
    injectableDetails: {
      type: 'filler',
      concentration: '24mg/ml',
      volumePerSyringe: 1,
      reconstitutionRequired: false,
    },
    storageRequirements: {
      temperatureMin: 2,
      temperatureMax: 25,
      requiresRefrigeration: false,
      freezerStorage: false,
      lightSensitive: false,
      humidityControlled: false,
      specialInstructions: 'Store at room temperature. Do not freeze.',
    },
    reorderPoint: 10,
    reorderQuantity: 20,
    minStockLevel: 5,
    maxStockLevel: 50,
    leadTimeDays: 3,
    trackInventory: true,
    trackByLot: true,
    trackBySerial: false,
    requireExpirationDate: true,
    commissionable: true,
    commissionRate: 10,
    tags: ['filler', 'hyaluronic-acid', 'lip-filler', 'allergan'],
    treatmentTypes: ['Lip Filler', 'Nasolabial Folds', 'Marionette Lines'],
    requiredCertifications: ['injector-certified'],
    status: 'active',
    isActive: true,
    availableForSale: false,
    requiresPrescription: true,
    controlledSubstance: false,
    hsaFsaEligible: true,
    imageUrl: '/images/products/juvederm-ultra.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },
  {
    id: 'prod-juvederm-voluma',
    name: 'Juvederm Voluma XC',
    displayName: 'Juvéderm® Voluma XC',
    description: 'Hyaluronic acid dermal filler for cheek augmentation and correction of age-related volume loss.',
    category: 'filler',
    brand: 'Allergan',
    manufacturerId: 'vendor-allergan',
    manufacturerName: 'Allergan Aesthetics',
    sku: 'JUV-VOLUMA-1ML',
    ndc: '0023-3915-01',
    costPrice: 380,
    retailPrice: 850,
    markupPercent: 124,
    unitPrice: 850,
    unitType: 'syringe',
    unitsPerPackage: 1,
    injectableDetails: {
      type: 'filler',
      concentration: '20mg/ml',
      volumePerSyringe: 1,
      reconstitutionRequired: false,
    },
    storageRequirements: {
      temperatureMin: 2,
      temperatureMax: 25,
      requiresRefrigeration: false,
      freezerStorage: false,
      lightSensitive: false,
      humidityControlled: false,
      specialInstructions: 'Store at room temperature. Do not freeze.',
    },
    reorderPoint: 8,
    reorderQuantity: 15,
    minStockLevel: 4,
    maxStockLevel: 40,
    leadTimeDays: 3,
    trackInventory: true,
    trackByLot: true,
    trackBySerial: false,
    requireExpirationDate: true,
    commissionable: true,
    commissionRate: 10,
    tags: ['filler', 'hyaluronic-acid', 'cheek-filler', 'allergan', 'volumizer'],
    treatmentTypes: ['Cheek Augmentation', 'Midface Volume', 'Chin Augmentation'],
    requiredCertifications: ['injector-certified'],
    status: 'active',
    isActive: true,
    availableForSale: false,
    requiresPrescription: true,
    controlledSubstance: false,
    hsaFsaEligible: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },
  {
    id: 'prod-restylane',
    name: 'Restylane-L',
    displayName: 'Restylane®-L',
    description: 'Hyaluronic acid dermal filler for lip enhancement and correction of moderate to severe facial wrinkles.',
    category: 'filler',
    brand: 'Galderma',
    manufacturerId: 'vendor-galderma',
    manufacturerName: 'Galderma',
    sku: 'RST-L-1ML',
    ndc: '0299-5870-01',
    costPrice: 260,
    retailPrice: 600,
    markupPercent: 131,
    unitPrice: 600,
    unitType: 'syringe',
    unitsPerPackage: 1,
    injectableDetails: {
      type: 'filler',
      concentration: '20mg/ml',
      volumePerSyringe: 1,
      reconstitutionRequired: false,
    },
    storageRequirements: {
      temperatureMin: 2,
      temperatureMax: 25,
      requiresRefrigeration: false,
      freezerStorage: false,
      lightSensitive: false,
      humidityControlled: false,
      specialInstructions: 'Store at room temperature. Do not freeze.',
    },
    reorderPoint: 10,
    reorderQuantity: 20,
    minStockLevel: 5,
    maxStockLevel: 50,
    leadTimeDays: 4,
    trackInventory: true,
    trackByLot: true,
    trackBySerial: false,
    requireExpirationDate: true,
    commissionable: true,
    commissionRate: 10,
    tags: ['filler', 'hyaluronic-acid', 'lip-filler', 'galderma'],
    treatmentTypes: ['Lip Filler', 'Nasolabial Folds', 'Marionette Lines'],
    requiredCertifications: ['injector-certified'],
    status: 'active',
    isActive: true,
    availableForSale: false,
    requiresPrescription: true,
    controlledSubstance: false,
    hsaFsaEligible: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },
  {
    id: 'prod-restylane-lyft',
    name: 'Restylane Lyft',
    displayName: 'Restylane® Lyft',
    description: 'Hyaluronic acid dermal filler for cheek augmentation and correction of age-related volume deficit.',
    category: 'filler',
    brand: 'Galderma',
    manufacturerId: 'vendor-galderma',
    manufacturerName: 'Galderma',
    sku: 'RST-LYFT-1ML',
    ndc: '0299-5880-01',
    costPrice: 320,
    retailPrice: 750,
    markupPercent: 134,
    unitPrice: 750,
    unitType: 'syringe',
    unitsPerPackage: 1,
    injectableDetails: {
      type: 'filler',
      concentration: '20mg/ml',
      volumePerSyringe: 1,
      reconstitutionRequired: false,
    },
    storageRequirements: {
      temperatureMin: 2,
      temperatureMax: 25,
      requiresRefrigeration: false,
      freezerStorage: false,
      lightSensitive: false,
      humidityControlled: false,
      specialInstructions: 'Store at room temperature. Do not freeze.',
    },
    reorderPoint: 8,
    reorderQuantity: 15,
    minStockLevel: 4,
    maxStockLevel: 40,
    leadTimeDays: 4,
    trackInventory: true,
    trackByLot: true,
    trackBySerial: false,
    requireExpirationDate: true,
    commissionable: true,
    commissionRate: 10,
    tags: ['filler', 'hyaluronic-acid', 'cheek-filler', 'galderma', 'volumizer'],
    treatmentTypes: ['Cheek Augmentation', 'Midface Volume', 'Hand Rejuvenation'],
    requiredCertifications: ['injector-certified'],
    status: 'active',
    isActive: true,
    availableForSale: false,
    requiresPrescription: true,
    controlledSubstance: false,
    hsaFsaEligible: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },
  {
    id: 'prod-sculptra',
    name: 'Sculptra Aesthetic',
    displayName: 'Sculptra® Aesthetic',
    description: 'Poly-L-lactic acid biostimulator for gradual and natural-looking volume restoration.',
    category: 'filler',
    brand: 'Galderma',
    manufacturerId: 'vendor-galderma',
    manufacturerName: 'Galderma',
    sku: 'SCP-VIAL',
    ndc: '0299-5890-01',
    costPrice: 420,
    retailPrice: 950,
    markupPercent: 126,
    unitPrice: 950,
    unitType: 'vial',
    unitsPerPackage: 1,
    injectableDetails: {
      type: 'biostimulator',
      concentration: '367.5mg/vial',
      dilutionRatio: '5-8ml sterile water',
      defaultDilution: 7,
      reconstitutionRequired: true,
      maxHoursAfterReconstitution: 72,
    },
    storageRequirements: {
      temperatureMin: 15,
      temperatureMax: 25,
      requiresRefrigeration: false,
      freezerStorage: false,
      lightSensitive: false,
      humidityControlled: false,
      specialInstructions: 'Store at room temperature. Reconstitute at least 2 hours before use.',
    },
    reorderPoint: 6,
    reorderQuantity: 12,
    minStockLevel: 3,
    maxStockLevel: 30,
    leadTimeDays: 4,
    trackInventory: true,
    trackByLot: true,
    trackBySerial: false,
    requireExpirationDate: true,
    commissionable: true,
    commissionRate: 10,
    tags: ['biostimulator', 'poly-l-lactic-acid', 'volumizer', 'galderma', 'collagen-stimulator'],
    treatmentTypes: ['Sculptra Treatment', 'Hip Dips', 'Buttock Enhancement'],
    requiredCertifications: ['injector-certified', 'sculptra-trained'],
    status: 'active',
    isActive: true,
    availableForSale: false,
    requiresPrescription: true,
    controlledSubstance: false,
    hsaFsaEligible: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },
  {
    id: 'prod-radiesse',
    name: 'Radiesse',
    displayName: 'Radiesse®',
    description: 'Calcium hydroxylapatite dermal filler for volume restoration and hand rejuvenation.',
    category: 'filler',
    brand: 'Merz',
    manufacturerId: 'vendor-merz',
    manufacturerName: 'Merz Aesthetics',
    sku: 'RAD-1.5ML',
    ndc: '0259-1355-01',
    costPrice: 300,
    retailPrice: 700,
    markupPercent: 133,
    unitPrice: 700,
    unitType: 'syringe',
    unitsPerPackage: 1,
    injectableDetails: {
      type: 'biostimulator',
      concentration: 'CaHA microspheres',
      volumePerSyringe: 1.5,
      reconstitutionRequired: false,
    },
    storageRequirements: {
      temperatureMin: 15,
      temperatureMax: 30,
      requiresRefrigeration: false,
      freezerStorage: false,
      lightSensitive: false,
      humidityControlled: false,
      specialInstructions: 'Store at room temperature.',
    },
    reorderPoint: 8,
    reorderQuantity: 15,
    minStockLevel: 4,
    maxStockLevel: 40,
    leadTimeDays: 5,
    trackInventory: true,
    trackByLot: true,
    trackBySerial: false,
    requireExpirationDate: true,
    commissionable: true,
    commissionRate: 10,
    tags: ['biostimulator', 'calcium-hydroxylapatite', 'hand-filler', 'merz'],
    treatmentTypes: ['Hand Rejuvenation', 'Jawline Contouring', 'Cheek Augmentation'],
    requiredCertifications: ['injector-certified'],
    status: 'active',
    isActive: true,
    availableForSale: false,
    requiresPrescription: true,
    controlledSubstance: false,
    hsaFsaEligible: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-12-01'),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },
];

// ============================================================================
// INVENTORY LOTS (with realistic data)
// ============================================================================

const now = new Date();
const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
const twoYearsFromNow = new Date(now.getTime() + 730 * 24 * 60 * 60 * 1000);

export const inventoryLots: InventoryLot[] = [
  // Botox Lots
  {
    id: 'lot-btx-001',
    productId: 'prod-botox',
    productName: 'Botox Cosmetic',
    lotNumber: 'C3709C3',
    batchNumber: 'BTC-2024-001',
    manufacturingDate: new Date('2024-06-01'),
    expirationDate: new Date('2025-12-31'),
    receivedDate: new Date('2024-08-15'),
    initialQuantity: 500,
    currentQuantity: 420,
    reservedQuantity: 50,
    availableQuantity: 370,
    unitType: 'units',
    locationId: 'loc-1',
    locationName: 'The Village',
    storageLocation: 'Fridge A, Shelf 1',
    purchaseOrderId: 'po-001',
    vendorId: 'vendor-allergan',
    vendorName: 'Allergan Aesthetics',
    invoiceNumber: 'ALG-INV-2024-001',
    purchaseCost: 2100,
    status: 'available',
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date(),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },
  {
    id: 'lot-btx-002',
    productId: 'prod-botox',
    productName: 'Botox Cosmetic',
    lotNumber: 'C3710D4',
    batchNumber: 'BTC-2024-002',
    manufacturingDate: new Date('2024-08-01'),
    expirationDate: oneYearFromNow,
    receivedDate: new Date('2024-10-01'),
    initialQuantity: 400,
    currentQuantity: 400,
    reservedQuantity: 0,
    availableQuantity: 400,
    unitType: 'units',
    locationId: 'loc-1',
    locationName: 'The Village',
    storageLocation: 'Fridge A, Shelf 1',
    purchaseOrderId: 'po-002',
    vendorId: 'vendor-allergan',
    vendorName: 'Allergan Aesthetics',
    invoiceNumber: 'ALG-INV-2024-002',
    purchaseCost: 1680,
    status: 'available',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date(),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },
  // Expiring soon lot (for testing alerts)
  {
    id: 'lot-btx-003',
    productId: 'prod-botox',
    productName: 'Botox Cosmetic',
    lotNumber: 'C3700A1',
    batchNumber: 'BTC-2023-010',
    manufacturingDate: new Date('2023-12-01'),
    expirationDate: thirtyDaysFromNow,
    receivedDate: new Date('2024-02-01'),
    initialQuantity: 100,
    currentQuantity: 30,
    reservedQuantity: 0,
    availableQuantity: 30,
    unitType: 'units',
    locationId: 'loc-1',
    locationName: 'The Village',
    storageLocation: 'Fridge A, Shelf 1',
    purchaseOrderId: 'po-003',
    vendorId: 'vendor-allergan',
    vendorName: 'Allergan Aesthetics',
    invoiceNumber: 'ALG-INV-2024-003',
    purchaseCost: 420,
    status: 'available',
    qualityNotes: 'Use first - expiring soon',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date(),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },

  // Dysport Lots
  {
    id: 'lot-dsp-001',
    productId: 'prod-dysport',
    productName: 'Dysport',
    lotNumber: 'DSP2024A789',
    batchNumber: 'GAL-2024-001',
    manufacturingDate: new Date('2024-05-01'),
    expirationDate: oneYearFromNow,
    receivedDate: new Date('2024-07-01'),
    initialQuantity: 1200,
    currentQuantity: 900,
    reservedQuantity: 60,
    availableQuantity: 840,
    unitType: 'units',
    locationId: 'loc-1',
    locationName: 'The Village',
    storageLocation: 'Fridge A, Shelf 2',
    purchaseOrderId: 'po-004',
    vendorId: 'vendor-galderma',
    vendorName: 'Galderma',
    invoiceNumber: 'GAL-INV-2024-001',
    purchaseCost: 1520,
    status: 'available',
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date(),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },
  {
    id: 'lot-dsp-002',
    productId: 'prod-dysport',
    productName: 'Dysport',
    lotNumber: 'DSP2024B456',
    batchNumber: 'GAL-2024-002',
    manufacturingDate: new Date('2024-09-01'),
    expirationDate: oneYearFromNow,
    receivedDate: new Date('2024-11-01'),
    initialQuantity: 600,
    currentQuantity: 600,
    reservedQuantity: 0,
    availableQuantity: 600,
    unitType: 'units',
    locationId: 'loc-1',
    locationName: 'The Village',
    storageLocation: 'Fridge A, Shelf 2',
    purchaseOrderId: 'po-005',
    vendorId: 'vendor-galderma',
    vendorName: 'Galderma',
    invoiceNumber: 'GAL-INV-2024-002',
    purchaseCost: 760,
    status: 'available',
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date(),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },

  // Juvederm Ultra Lots
  {
    id: 'lot-juv-ultra-001',
    productId: 'prod-juvederm-ultra',
    productName: 'Juvederm Ultra XC',
    lotNumber: 'JUV2024XC001',
    batchNumber: 'ALG-JUV-2024-001',
    manufacturingDate: new Date('2024-03-01'),
    expirationDate: twoYearsFromNow,
    receivedDate: new Date('2024-05-01'),
    initialQuantity: 24,
    currentQuantity: 18,
    reservedQuantity: 2,
    availableQuantity: 16,
    unitType: 'syringe',
    locationId: 'loc-1',
    locationName: 'The Village',
    storageLocation: 'Storage Cabinet B, Drawer 1',
    purchaseOrderId: 'po-006',
    vendorId: 'vendor-allergan',
    vendorName: 'Allergan Aesthetics',
    invoiceNumber: 'ALG-INV-2024-004',
    purchaseCost: 6720,
    status: 'available',
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date(),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },
  {
    id: 'lot-juv-ultra-002',
    productId: 'prod-juvederm-ultra',
    productName: 'Juvederm Ultra XC',
    lotNumber: 'JUV2024XC002',
    batchNumber: 'ALG-JUV-2024-002',
    manufacturingDate: new Date('2024-07-01'),
    expirationDate: twoYearsFromNow,
    receivedDate: new Date('2024-09-01'),
    initialQuantity: 12,
    currentQuantity: 12,
    reservedQuantity: 0,
    availableQuantity: 12,
    unitType: 'syringe',
    locationId: 'loc-1',
    locationName: 'The Village',
    storageLocation: 'Storage Cabinet B, Drawer 1',
    purchaseOrderId: 'po-007',
    vendorId: 'vendor-allergan',
    vendorName: 'Allergan Aesthetics',
    invoiceNumber: 'ALG-INV-2024-005',
    purchaseCost: 3360,
    status: 'available',
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date(),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },

  // Juvederm Voluma Lots
  {
    id: 'lot-juv-voluma-001',
    productId: 'prod-juvederm-voluma',
    productName: 'Juvederm Voluma XC',
    lotNumber: 'VOL2024A001',
    batchNumber: 'ALG-VOL-2024-001',
    manufacturingDate: new Date('2024-04-01'),
    expirationDate: twoYearsFromNow,
    receivedDate: new Date('2024-06-01'),
    initialQuantity: 15,
    currentQuantity: 10,
    reservedQuantity: 1,
    availableQuantity: 9,
    unitType: 'syringe',
    locationId: 'loc-1',
    locationName: 'The Village',
    storageLocation: 'Storage Cabinet B, Drawer 2',
    purchaseOrderId: 'po-008',
    vendorId: 'vendor-allergan',
    vendorName: 'Allergan Aesthetics',
    invoiceNumber: 'ALG-INV-2024-006',
    purchaseCost: 5700,
    status: 'available',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date(),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },

  // Restylane Lots
  {
    id: 'lot-rst-001',
    productId: 'prod-restylane',
    productName: 'Restylane-L',
    lotNumber: 'RST2024L100',
    batchNumber: 'GAL-RST-2024-001',
    manufacturingDate: new Date('2024-02-01'),
    expirationDate: twoYearsFromNow,
    receivedDate: new Date('2024-04-01'),
    initialQuantity: 20,
    currentQuantity: 8,
    reservedQuantity: 0,
    availableQuantity: 8,
    unitType: 'syringe',
    locationId: 'loc-1',
    locationName: 'The Village',
    storageLocation: 'Storage Cabinet B, Drawer 3',
    purchaseOrderId: 'po-009',
    vendorId: 'vendor-galderma',
    vendorName: 'Galderma',
    invoiceNumber: 'GAL-INV-2024-003',
    purchaseCost: 5200,
    status: 'available',
    qualityNotes: 'Low stock - reorder needed',
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date(),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },

  // Sculptra Lot
  {
    id: 'lot-scp-001',
    productId: 'prod-sculptra',
    productName: 'Sculptra Aesthetic',
    lotNumber: 'SCP2024V001',
    batchNumber: 'GAL-SCP-2024-001',
    manufacturingDate: new Date('2024-05-01'),
    expirationDate: twoYearsFromNow,
    receivedDate: new Date('2024-07-01'),
    initialQuantity: 10,
    currentQuantity: 7,
    reservedQuantity: 0,
    availableQuantity: 7,
    unitType: 'vial',
    locationId: 'loc-1',
    locationName: 'The Village',
    storageLocation: 'Storage Cabinet C, Shelf 1',
    purchaseOrderId: 'po-010',
    vendorId: 'vendor-galderma',
    vendorName: 'Galderma',
    invoiceNumber: 'GAL-INV-2024-004',
    purchaseCost: 4200,
    status: 'available',
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date(),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },

  // Radiesse Lot
  {
    id: 'lot-rad-001',
    productId: 'prod-radiesse',
    productName: 'Radiesse',
    lotNumber: 'RAD2024A001',
    batchNumber: 'MRZ-RAD-2024-001',
    manufacturingDate: new Date('2024-06-01'),
    expirationDate: twoYearsFromNow,
    receivedDate: new Date('2024-08-01'),
    initialQuantity: 12,
    currentQuantity: 9,
    reservedQuantity: 0,
    availableQuantity: 9,
    unitType: 'syringe',
    locationId: 'loc-1',
    locationName: 'The Village',
    storageLocation: 'Storage Cabinet C, Shelf 2',
    purchaseOrderId: 'po-011',
    vendorId: 'vendor-merz',
    vendorName: 'Merz Aesthetics',
    invoiceNumber: 'MRZ-INV-2024-001',
    purchaseCost: 3600,
    status: 'available',
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date(),
    createdBy: 'system',
    lastUpdatedBy: 'system',
  },
];

// ============================================================================
// INVENTORY TRANSACTIONS
// ============================================================================

export const inventoryTransactions: InventoryTransaction[] = [
  // Recent Botox treatment usage
  {
    id: 'txn-001',
    type: 'treatment_use',
    status: 'completed',
    timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    productId: 'prod-botox',
    productName: 'Botox Cosmetic',
    lotId: 'lot-btx-001',
    lotNumber: 'C3709C3',
    quantity: -25,
    unitType: 'units',
    quantityBefore: 445,
    quantityAfter: 420,
    unitCost: 4.2,
    totalCost: 105,
    locationId: 'loc-1',
    locationName: 'The Village',
    appointmentId: 'apt-101',
    patientId: 'p1',
    patientName: 'Sarah Johnson',
    practitionerId: '4',
    practitionerName: 'Susan Lo',
    treatmentDetails: {
      serviceName: 'Botox Treatment',
      areasInjected: [
        { name: 'Forehead', units: 10 },
        { name: 'Glabella', units: 10 },
        { name: "Crow's Feet", units: 5 },
      ],
      chartId: 'chart-101',
      treatmentNotes: 'Standard treatment for glabellar lines',
    },
    reason: 'Patient treatment',
    notes: 'Routine Botox treatment',
    performedBy: '4',
    performedByName: 'Susan Lo',
    approvalRequired: false,
    createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'txn-002',
    type: 'treatment_use',
    status: 'completed',
    timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    productId: 'prod-juvederm-ultra',
    productName: 'Juvederm Ultra XC',
    lotId: 'lot-juv-ultra-001',
    lotNumber: 'JUV2024XC001',
    quantity: -1,
    unitType: 'syringe',
    quantityBefore: 19,
    quantityAfter: 18,
    unitCost: 280,
    totalCost: 280,
    locationId: 'loc-1',
    locationName: 'The Village',
    appointmentId: 'apt-102',
    patientId: 'p2',
    patientName: 'Lily Gagnon',
    practitionerId: '4',
    practitionerName: 'Susan Lo',
    treatmentDetails: {
      serviceName: 'Lip Filler',
      areasInjected: [{ name: 'Lips', units: 1 }],
      chartId: 'chart-102',
      treatmentNotes: 'Lip augmentation - 1ml',
    },
    reason: 'Patient treatment',
    notes: 'Lip filler treatment',
    performedBy: '4',
    performedByName: 'Susan Lo',
    approvalRequired: false,
    createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
  },
  // Inventory receipt
  {
    id: 'txn-003',
    type: 'receive',
    status: 'completed',
    timestamp: new Date('2024-11-01'),
    productId: 'prod-dysport',
    productName: 'Dysport',
    lotId: 'lot-dsp-002',
    lotNumber: 'DSP2024B456',
    quantity: 600,
    unitType: 'units',
    quantityBefore: 0,
    quantityAfter: 600,
    unitCost: 1.27,
    totalCost: 760,
    locationId: 'loc-1',
    locationName: 'The Village',
    purchaseOrderId: 'po-005',
    reason: 'Purchase order receipt',
    notes: 'Received from Galderma',
    performedBy: 'staff-1',
    performedByName: 'Admin Staff',
    approvalRequired: false,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
];

// ============================================================================
// INVENTORY LEVELS (calculated from lots)
// ============================================================================

export function calculateInventoryLevels(): InventoryLevel[] {
  const levelsMap = new Map<string, InventoryLevel>();

  // Group lots by product and location
  inventoryLots.forEach(lot => {
    if (lot.status !== 'available' && lot.status !== 'quarantine') return;

    const key = `${lot.productId}-${lot.locationId}`;
    const product = products.find(p => p.id === lot.productId);
    if (!product) return;

    let level = levelsMap.get(key);
    if (!level) {
      level = {
        id: `level-${key}`,
        productId: lot.productId,
        productName: lot.productName,
        locationId: lot.locationId,
        locationName: lot.locationName,
        totalQuantity: 0,
        availableQuantity: 0,
        reservedQuantity: 0,
        inTransitQuantity: 0,
        totalCost: 0,
        averageCost: 0,
        totalRetailValue: 0,
        status: 'in_stock',
        reorderPoint: product.reorderPoint,
        reorderQuantity: product.reorderQuantity,
        activeLots: 0,
        totalLots: 0,
        averageDailyUsage: 0,
        averageWeeklyUsage: 0,
        averageMonthlyUsage: 0,
        version: 1,
        lastCalculatedAt: new Date(),
        updatedAt: new Date(),
      };
      levelsMap.set(key, level);
    }

    // Aggregate quantities
    level.totalQuantity += lot.currentQuantity;
    level.availableQuantity += lot.availableQuantity;
    level.reservedQuantity += lot.reservedQuantity;
    level.totalCost += lot.purchaseCost;
    level.totalLots++;

    if (lot.status === 'available' && lot.currentQuantity > 0) {
      level.activeLots++;
    }

    // Track earliest expiration
    if (!level.earliestExpiration || lot.expirationDate < level.earliestExpiration) {
      level.earliestExpiration = lot.expirationDate;
      level.nearestExpiringLotId = lot.id;
      level.nearestExpiringLotNumber = lot.lotNumber;
    }
  });

  // Calculate derived values
  levelsMap.forEach((level, key) => {
    const product = products.find(p => p.id === level.productId);
    if (!product) return;

    // Average cost
    level.averageCost = level.totalQuantity > 0 ? level.totalCost / level.totalQuantity : 0;

    // Retail value
    level.totalRetailValue = level.totalQuantity * product.unitPrice;

    // Stock status
    if (level.availableQuantity === 0) {
      level.status = 'out_of_stock';
    } else if (level.availableQuantity <= product.minStockLevel) {
      level.status = 'critical';
    } else if (level.availableQuantity <= product.reorderPoint) {
      level.status = 'low_stock';
    } else if (level.availableQuantity > product.maxStockLevel) {
      level.status = 'overstocked';
    } else {
      level.status = 'in_stock';
    }

    // Estimated usage (mock data)
    level.averageDailyUsage = Math.round(level.totalQuantity * 0.02); // ~2% daily
    level.averageWeeklyUsage = level.averageDailyUsage * 7;
    level.averageMonthlyUsage = level.averageDailyUsage * 30;

    // Days until stockout
    if (level.averageDailyUsage > 0) {
      level.daysUntilStockout = Math.floor(level.availableQuantity / level.averageDailyUsage);
    }
  });

  return Array.from(levelsMap.values());
}

export const inventoryLevels: InventoryLevel[] = calculateInventoryLevels();

// ============================================================================
// INVENTORY ALERTS
// ============================================================================

export function generateInventoryAlerts(): InventoryAlert[] {
  const alerts: InventoryAlert[] = [];
  const now = new Date();

  // Check each lot for expiration alerts
  inventoryLots.forEach(lot => {
    if (lot.status !== 'available') return;

    const daysUntilExpiration = Math.ceil(
      (lot.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiration <= EXPIRATION_THRESHOLDS.critical) {
      alerts.push({
        id: `alert-exp-critical-${lot.id}`,
        type: 'expiring_soon',
        severity: 'critical',
        status: 'active',
        productId: lot.productId,
        productName: lot.productName,
        lotId: lot.id,
        lotNumber: lot.lotNumber,
        locationId: lot.locationId,
        locationName: lot.locationName,
        title: `Critical: ${lot.productName} Expiring in ${daysUntilExpiration} days`,
        message: `Lot ${lot.lotNumber} with ${lot.currentQuantity} ${lot.unitType} expires on ${lot.expirationDate.toLocaleDateString()}. Use immediately or consider disposal.`,
        actionRequired: 'Use immediately or prepare for disposal',
        expirationDate: lot.expirationDate,
        daysUntilExpiration,
        notificationSent: false,
        createdAt: now,
        updatedAt: now,
      });
    } else if (daysUntilExpiration <= EXPIRATION_THRESHOLDS.warning) {
      alerts.push({
        id: `alert-exp-warning-${lot.id}`,
        type: 'expiring_soon',
        severity: 'warning',
        status: 'active',
        productId: lot.productId,
        productName: lot.productName,
        lotId: lot.id,
        lotNumber: lot.lotNumber,
        locationId: lot.locationId,
        locationName: lot.locationName,
        title: `Warning: ${lot.productName} Expiring Soon`,
        message: `Lot ${lot.lotNumber} with ${lot.currentQuantity} ${lot.unitType} expires in ${daysUntilExpiration} days (${lot.expirationDate.toLocaleDateString()}).`,
        actionRequired: 'Prioritize usage of this lot',
        expirationDate: lot.expirationDate,
        daysUntilExpiration,
        notificationSent: false,
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  // Check stock levels
  inventoryLevels.forEach(level => {
    const product = products.find(p => p.id === level.productId);
    if (!product) return;

    if (level.status === 'out_of_stock') {
      alerts.push({
        id: `alert-stock-out-${level.id}`,
        type: 'out_of_stock',
        severity: 'critical',
        status: 'active',
        productId: level.productId,
        productName: level.productName,
        locationId: level.locationId,
        locationName: level.locationName,
        title: `Out of Stock: ${level.productName}`,
        message: `${level.productName} is completely out of stock at ${level.locationName}. Cannot perform treatments requiring this product.`,
        actionRequired: 'Place order immediately',
        currentValue: level.availableQuantity,
        thresholdValue: product.minStockLevel,
        notificationSent: false,
        createdAt: now,
        updatedAt: now,
      });
    } else if (level.status === 'critical') {
      alerts.push({
        id: `alert-stock-critical-${level.id}`,
        type: 'low_stock',
        severity: 'critical',
        status: 'active',
        productId: level.productId,
        productName: level.productName,
        locationId: level.locationId,
        locationName: level.locationName,
        title: `Critical Low Stock: ${level.productName}`,
        message: `Only ${level.availableQuantity} ${product.unitType} remaining (minimum: ${product.minStockLevel}).`,
        actionRequired: 'Order urgently',
        currentValue: level.availableQuantity,
        thresholdValue: product.minStockLevel,
        notificationSent: false,
        createdAt: now,
        updatedAt: now,
      });
    } else if (level.status === 'low_stock') {
      alerts.push({
        id: `alert-stock-low-${level.id}`,
        type: 'low_stock',
        severity: 'warning',
        status: 'active',
        productId: level.productId,
        productName: level.productName,
        locationId: level.locationId,
        locationName: level.locationName,
        title: `Low Stock: ${level.productName}`,
        message: `${level.availableQuantity} ${product.unitType} remaining (reorder point: ${product.reorderPoint}).`,
        actionRequired: 'Place reorder',
        currentValue: level.availableQuantity,
        thresholdValue: product.reorderPoint,
        notificationSent: false,
        createdAt: now,
        updatedAt: now,
      });
    }
  });

  return alerts;
}

export const inventoryAlerts: InventoryAlert[] = generateInventoryAlerts();

// ============================================================================
// PURCHASE ORDERS (Mock)
// ============================================================================

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-draft-001',
    orderNumber: 'PO-2024-012',
    vendorId: 'vendor-allergan',
    vendorName: 'Allergan Aesthetics',
    vendorEmail: 'orders@allergan.com',
    vendorPhone: '(800) 433-8871',
    locationId: 'loc-1',
    locationName: 'The Village',
    orderDate: new Date(),
    expectedDeliveryDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    items: [
      {
        id: 'poi-001',
        productId: 'prod-botox',
        productName: 'Botox Cosmetic',
        sku: 'BTX-100U',
        quantityOrdered: 5,
        quantityReceived: 0,
        quantityPending: 5,
        unitType: 'vial',
        unitCost: 420,
        totalCost: 2100,
        finalCost: 2100,
      },
      {
        id: 'poi-002',
        productId: 'prod-juvederm-ultra',
        productName: 'Juvederm Ultra XC',
        sku: 'JUV-ULTRA-1ML',
        quantityOrdered: 12,
        quantityReceived: 0,
        quantityPending: 12,
        unitType: 'syringe',
        unitCost: 280,
        totalCost: 3360,
        finalCost: 3360,
      },
    ],
    subtotal: 5460,
    taxAmount: 0,
    shippingCost: 0,
    discount: 0,
    total: 5460,
    status: 'draft',
    paymentStatus: 'pending',
    paymentTerms: 'Net 30',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'staff-1',
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Get product by ID
export function getProductById(productId: string): Product | undefined {
  return products.find(p => p.id === productId);
}

// Get lots for a product (FIFO order - earliest expiration first)
export function getLotsForProduct(
  productId: string,
  locationId?: string,
  availableOnly = true
): InventoryLot[] {
  return inventoryLots
    .filter(lot => {
      if (lot.productId !== productId) return false;
      if (locationId && lot.locationId !== locationId) return false;
      if (availableOnly && lot.status !== 'available') return false;
      if (availableOnly && lot.availableQuantity <= 0) return false;
      return true;
    })
    .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());
}

// Get inventory level for product at location
export function getInventoryLevel(
  productId: string,
  locationId: string
): InventoryLevel | undefined {
  return inventoryLevels.find(
    l => l.productId === productId && l.locationId === locationId
  );
}

// Get vendor by ID
export function getVendorById(vendorId: string): Vendor | undefined {
  return vendors.find(v => v.id === vendorId);
}

// Get products by category
export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter(p => p.category === category && p.isActive);
}

// Get all active products
export function getActiveProducts(): Product[] {
  return products.filter(p => p.isActive && p.status === 'active');
}

// Get expiring lots within days
export function getExpiringLots(days: number): InventoryLot[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + days);
  return inventoryLots.filter(
    lot => lot.status === 'available' && lot.expirationDate <= cutoff
  );
}

// Get low stock products
export function getLowStockProducts(): InventoryLevel[] {
  return inventoryLevels.filter(
    l => l.status === 'low_stock' || l.status === 'critical' || l.status === 'out_of_stock'
  );
}

// Calculate total inventory value
export function calculateTotalInventoryValue(): number {
  return inventoryLevels.reduce((sum, level) => sum + level.totalRetailValue, 0);
}

// Calculate total inventory cost
export function calculateTotalInventoryCost(): number {
  return inventoryLevels.reduce((sum, level) => sum + level.totalCost, 0);
}

// FIFO lot selection for deduction
export function selectLotForDeduction(
  productId: string,
  quantity: number,
  locationId: string
): { lot: InventoryLot; quantityFromLot: number }[] {
  const lots = getLotsForProduct(productId, locationId, true);
  const selections: { lot: InventoryLot; quantityFromLot: number }[] = [];
  let remaining = quantity;

  for (const lot of lots) {
    if (remaining <= 0) break;

    const quantityFromLot = Math.min(lot.availableQuantity, remaining);
    selections.push({ lot, quantityFromLot });
    remaining -= quantityFromLot;
  }

  return selections;
}
