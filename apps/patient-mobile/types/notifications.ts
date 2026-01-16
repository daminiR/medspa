/**
 * Notification Types and Interfaces
 *
 * Defines all notification-related types for the patient mobile app.
 */

export type NotificationType =
  | 'appointment_reminder'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'new_message'
  | 'points_earned'
  | 'reward_available'
  | 'referral_signup'
  | 'promotion'
  | 'system';

export interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface AppointmentNotificationData extends NotificationData {
  type: 'appointment_reminder' | 'appointment_confirmed' | 'appointment_cancelled' | 'appointment_rescheduled';
  data: {
    appointmentId: string;
    serviceName: string;
    serviceType: string;
    startTime: string;
    providerName?: string;
    locationName?: string;
  };
}

export interface MessageNotificationData extends NotificationData {
  type: 'new_message';
  data: {
    messageId: string;
    threadId: string;
    senderName: string;
    senderType: 'admin' | 'provider' | 'system';
    preview: string;
  };
}

export interface RewardsNotificationData extends NotificationData {
  type: 'points_earned' | 'reward_available';
  data: {
    points?: number;
    rewardId?: string;
    rewardName?: string;
    rewardType?: string;
    expiresAt?: string;
  };
}

export interface ReferralNotificationData extends NotificationData {
  type: 'referral_signup';
  data: {
    referralId: string;
    referredUserName: string;
    bonusPoints: number;
  };
}

export interface PromotionNotificationData extends NotificationData {
  type: 'promotion';
  data: {
    promotionId: string;
    promotionTitle: string;
    promotionType: 'discount' | 'special_offer' | 'announcement';
    discountPercent?: number;
    discountAmount?: number;
    validUntil?: string;
    imageUrl?: string;
  };
}

export interface SystemNotificationData extends NotificationData {
  type: 'system';
  data: {
    action?: 'update_required' | 'maintenance' | 'announcement';
    url?: string;
  };
}

export interface NotificationPreferences {
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

export interface ScheduledNotification {
  id: string;
  type: NotificationType;
  scheduledFor: Date;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  appointmentReminders: true,
  appointmentReminder24h: true,
  appointmentReminder2h: true,
  appointmentChanges: true,
  messages: true,
  rewards: true,
  promotions: true,
  system: true,
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  sound: true,
  vibration: true,
  badge: true,
};
