// Charting Products Data
// Injectable products for treatment charting with colors, units, and pricing

export type ProductType = 'neurotoxin' | 'filler' | 'other';
export type ProductUnit = 'units' | 'mL' | 'mg' | 'vials';

export interface ChartingProduct {
  id: string;
  name: string;
  brand: string;
  type: ProductType;
  color: string;
  unit: ProductUnit;
  defaultDosages: number[];
  pricePerUnit: number;
}

export const chartingProducts: ChartingProduct[] = [
  // Neurotoxins
  {
    id: 'botox',
    name: 'Botox',
    brand: 'Allergan',
    type: 'neurotoxin',
    color: '#8B5CF6',
    unit: 'units',
    defaultDosages: [4, 8, 10, 12, 16, 20, 25, 30, 40, 50],
    pricePerUnit: 14,
  },
  {
    id: 'dysport',
    name: 'Dysport',
    brand: 'Galderma',
    type: 'neurotoxin',
    color: '#3B82F6',
    unit: 'units',
    defaultDosages: [10, 20, 30, 40, 50, 60, 75, 100, 120],
    pricePerUnit: 5,
  },
  {
    id: 'xeomin',
    name: 'Xeomin',
    brand: 'Merz',
    type: 'neurotoxin',
    color: '#14B8A6',
    unit: 'units',
    defaultDosages: [4, 8, 10, 12, 16, 20, 25, 30, 40, 50],
    pricePerUnit: 12,
  },
  {
    id: 'jeuveau',
    name: 'Jeuveau',
    brand: 'Evolus',
    type: 'neurotoxin',
    color: '#6366F1',
    unit: 'units',
    defaultDosages: [4, 8, 10, 12, 16, 20, 25, 30, 40, 50],
    pricePerUnit: 10,
  },

  // Fillers - Juvederm Family
  {
    id: 'juvederm-ultra',
    name: 'Juvederm Ultra',
    brand: 'Allergan',
    type: 'filler',
    color: '#F97316',
    unit: 'mL',
    defaultDosages: [0.25, 0.5, 0.75, 1.0, 1.5, 2.0],
    pricePerUnit: 550,
  },
  {
    id: 'juvederm-ultra-plus',
    name: 'Juvederm Ultra Plus',
    brand: 'Allergan',
    type: 'filler',
    color: '#EA580C',
    unit: 'mL',
    defaultDosages: [0.25, 0.5, 0.75, 1.0, 1.5, 2.0],
    pricePerUnit: 600,
  },
  {
    id: 'juvederm-voluma',
    name: 'Juvederm Voluma',
    brand: 'Allergan',
    type: 'filler',
    color: '#EC4899',
    unit: 'mL',
    defaultDosages: [0.25, 0.5, 0.75, 1.0, 1.5, 2.0],
    pricePerUnit: 800,
  },
  {
    id: 'juvederm-vollure',
    name: 'Juvederm Vollure',
    brand: 'Allergan',
    type: 'filler',
    color: '#DB2777',
    unit: 'mL',
    defaultDosages: [0.25, 0.5, 0.75, 1.0, 1.5, 2.0],
    pricePerUnit: 650,
  },

  // Fillers - Restylane Family
  {
    id: 'restylane',
    name: 'Restylane',
    brand: 'Galderma',
    type: 'filler',
    color: '#F59E0B',
    unit: 'mL',
    defaultDosages: [0.25, 0.5, 0.75, 1.0, 1.5, 2.0],
    pricePerUnit: 500,
  },
  {
    id: 'restylane-lyft',
    name: 'Restylane Lyft',
    brand: 'Galderma',
    type: 'filler',
    color: '#D97706',
    unit: 'mL',
    defaultDosages: [0.25, 0.5, 0.75, 1.0, 1.5, 2.0],
    pricePerUnit: 700,
  },
  {
    id: 'restylane-kysse',
    name: 'Restylane Kysse',
    brand: 'Galderma',
    type: 'filler',
    color: '#FBBF24',
    unit: 'mL',
    defaultDosages: [0.25, 0.5, 0.75, 1.0],
    pricePerUnit: 650,
  },

  // Other Injectables
  {
    id: 'sculptra',
    name: 'Sculptra',
    brand: 'Galderma',
    type: 'other',
    color: '#22C55E',
    unit: 'vials',
    defaultDosages: [1, 2, 3, 4],
    pricePerUnit: 850,
  },
  {
    id: 'kybella',
    name: 'Kybella',
    brand: 'Allergan',
    type: 'other',
    color: '#EAB308',
    unit: 'mL',
    defaultDosages: [1, 2, 3, 4, 5, 6],
    pricePerUnit: 600,
  },
  {
    id: 'radiesse',
    name: 'Radiesse',
    brand: 'Merz',
    type: 'filler',
    color: '#A855F7',
    unit: 'mL',
    defaultDosages: [0.5, 0.8, 1.0, 1.5],
    pricePerUnit: 750,
  },
];

/**
 * Get a product by its ID
 */
export function getProductById(id: string): ChartingProduct | undefined {
  return chartingProducts.find((product) => product.id === id);
}

/**
 * Get the color associated with a product
 * Returns a default gray if product not found
 */
export function getProductColor(id: string): string {
  const product = getProductById(id);
  return product?.color ?? '#9CA3AF';
}

/**
 * Get all products of a specific type
 */
export function getProductsByType(type: ProductType): ChartingProduct[] {
  return chartingProducts.filter((product) => product.type === type);
}

/**
 * Get all products from a specific brand
 */
export function getProductsByBrand(brand: string): ChartingProduct[] {
  return chartingProducts.filter((product) => product.brand === brand);
}

/**
 * Calculate total price for a given product and dosage
 */
export function calculateProductPrice(id: string, dosage: number): number {
  const product = getProductById(id);
  if (!product) return 0;
  return product.pricePerUnit * dosage;
}
