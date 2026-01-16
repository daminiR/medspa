/**
 * Service Types
 */

export interface Service {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  categoryName: string;

  // Duration
  duration: number; // minutes
  durationRange?: {
    min: number;
    max: number;
  };

  // Pricing
  price: number;
  priceRange?: {
    min: number;
    max: number;
  };
  depositRequired: boolean;
  depositAmount?: number;

  // Availability
  active: boolean;
  onlineBookable: boolean;
  requiresConsultation: boolean;

  // Requirements
  minAge?: number;
  contraindications?: string[];
  preparationInstructions?: string;
  aftercareInstructions?: string;

  // Media
  imageUrl?: string;
  beforeAfterImages?: BeforeAfterImage[];

  // SEO
  slug: string;

  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  order: number;
  active: boolean;
  services: Service[];
}

export interface BeforeAfterImage {
  id: string;
  beforeUrl: string;
  afterUrl: string;
  treatmentDate: string;
  description?: string;
  consented: boolean;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  services: PackageService[];
  totalValue: number;
  price: number;
  savings: number;
  validityDays: number;
  active: boolean;
}

export interface PackageService {
  serviceId: string;
  serviceName: string;
  quantity: number;
  individualPrice: number;
}
