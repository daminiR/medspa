/**
 * Common Types
 */

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  meta?: ResponseMeta;
}

export interface ResponseMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  hasMore?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Location
export interface Location {
  id: string;
  name: string;
  address: Address;
  phone: string;
  email?: string;
  timezone: string;
  hours: BusinessHours[];
  active: boolean;
  imageUrl?: string;
  coordinates?: Coordinates;
}

export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface BusinessHours {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  openTime: string;
  closeTime: string;
  closed: boolean;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export type NotificationType =
  | 'appointment_reminder'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'new_message'
  | 'payment_received'
  | 'points_earned'
  | 'reward_available'
  | 'referral_signup'
  | 'promotion'
  | 'system';



// Push Notification Preferences
export interface PushNotificationPreferences {
  enabled: boolean;
  appointmentReminders: boolean;
  appointmentReminder24h: boolean;
  appointmentReminder2h: boolean;
  appointmentChanges: boolean;
  messages: boolean;
  rewards: boolean;
  promotions: boolean;
  system: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart: string; // HH:mm format (e.g., "22:00")
  quietHoursEnd: string; // HH:mm format (e.g., "08:00")
  sound: boolean;
  vibration: boolean;
  badge: boolean;
}

// Wallet Pass
export interface WalletPass {
  id: string;
  appointmentId: string;
  type: 'apple' | 'google';
  passUrl: string;
  serialNumber: string;
  createdAt: string;
  updatedAt: string;
}

// Error
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ErrorResponse {
  message: string;
  code?: string;
  errors?: ValidationError[];
}
