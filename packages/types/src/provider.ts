/**
 * Provider Types
 */

export type ProviderRole = 'physician' | 'nurse_practitioner' | 'registered_nurse' | 'aesthetician' | 'coordinator';

export interface Provider {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  title?: string;
  credentials?: string[];
  role: ProviderRole;

  // Profile
  bio?: string;
  avatarUrl?: string;
  specialties?: string[];

  // Availability
  locationIds: string[];
  serviceIds: string[];
  acceptingNewPatients: boolean;

  // Ratings
  rating?: number;
  reviewCount?: number;

  createdAt: string;
  updatedAt: string;
}

export interface ProviderAvailability {
  providerId: string;
  date: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  reason?: string; // If not available
}

export interface ProviderSchedule {
  providerId: string;
  locationId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
  active: boolean;
}
