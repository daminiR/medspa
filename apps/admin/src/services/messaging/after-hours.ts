/**
 * After-Hours Auto-Responder Service
 * Sends automated responses to patient messages outside of business hours
 * Supports business hours per day, holidays, timezones, and out-of-office mode
 */

import { messagingService } from './core';

// ============= Types =============

export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export interface BusinessHours {
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openTime?: string; // Format: "09:00" (24-hour)
  closeTime?: string; // Format: "17:00" (24-hour)
}

export interface Holiday {
  id: string;
  date: Date;
  name: string;
  allDayEvent: boolean;
  startTime?: string; // Format: "09:00"
  endTime?: string;
  isClosed: boolean;
  customMessage?: string; // Optional specific message for this holiday
}

export interface AutoResponderConfig {
  id: string;
  enabled: boolean;
  timezone: string; // e.g., "America/New_York", "America/Los_Angeles"
  businessHours: BusinessHours[];
  holidays: Holiday[];
  outOfOfficeMode: {
    enabled: boolean;
    startDate: Date;
    endDate: Date;
    message: string;
  };
  autoReplyMessage: string;
  responseModes: {
    respondOutsideHours: boolean; // Send auto-reply after hours
    respondOnHolidays: boolean; // Send auto-reply on holidays
    respondInOutOfOfficeMode: boolean; // Send auto-reply when out of office
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // "21:00"
    endTime: string; // "09:00"
  };
  responders: ResponderAssignment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ResponderAssignment {
  id: string;
  staffMemberId: string;
  staffMemberName: string;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface AutoReplyContext {
  patientPhone: string;
  patientId?: string;
  messageText: string;
  receivedAt: Date;
  conversationId?: string;
}

// ============= Default Config =============

const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { dayOfWeek: 'sunday', isOpen: false },
  { dayOfWeek: 'monday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
  { dayOfWeek: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
  { dayOfWeek: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
  { dayOfWeek: 'thursday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
  { dayOfWeek: 'friday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
  { dayOfWeek: 'saturday', isOpen: false },
];

const DEFAULT_AUTO_REPLY = `Thank you for reaching out! We're currently closed. We'll get back to you during business hours. For urgent matters, please call us or visit our website.`;

// ============= Mock Storage =============

// In production, this would be stored in a database
let configStorage: Map<string, AutoResponderConfig> = new Map();

// Initialize with default config
const getDefaultConfig = (): AutoResponderConfig => ({
  id: 'default-config',
  enabled: true,
  timezone: 'America/New_York',
  businessHours: DEFAULT_BUSINESS_HOURS,
  holidays: [],
  outOfOfficeMode: {
    enabled: false,
    startDate: new Date(),
    endDate: new Date(),
    message: 'We are currently out of the office and will return on [DATE]. Thank you for your patience!',
  },
  autoReplyMessage: DEFAULT_AUTO_REPLY,
  responseModes: {
    respondOutsideHours: true,
    respondOnHolidays: true,
    respondInOutOfOfficeMode: true,
  },
  quietHours: {
    enabled: true,
    startTime: '21:00',
    endTime: '09:00',
  },
  responders: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

// ============= After-Hours Service =============

export class AfterHoursResponderService {
  private static instance: AfterHoursResponderService;
  private config: AutoResponderConfig;

  private constructor() {
    this.config = getDefaultConfig();
  }

  static getInstance(): AfterHoursResponderService {
    if (!AfterHoursResponderService.instance) {
      AfterHoursResponderService.instance = new AfterHoursResponderService();
    }
    return AfterHoursResponderService.instance;
  }

  /**
   * Get current configuration
   */
  getConfig(): AutoResponderConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<AutoResponderConfig>): AutoResponderConfig {
    this.config = {
      ...this.config,
      ...updates,
      updatedAt: new Date(),
    };
    // In production, persist to database
    configStorage.set(this.config.id, this.config);
    console.log('[AfterHours] Config updated:', this.config.id);
    return { ...this.config };
  }

  /**
   * Check if currently within business hours
   */
  isWithinBusinessHours(now: Date = new Date()): boolean {
    // Convert to timezone
    const localTime = this.convertToTimezone(now);
    const dayOfWeek = this.getDayOfWeek(localTime);
    const timeStr = this.formatTime(localTime);

    // Check business hours for this day
    const dayHours = this.config.businessHours.find(h => h.dayOfWeek === dayOfWeek);
    if (!dayHours || !dayHours.isOpen) {
      return false;
    }

    // Check if within open hours
    if (dayHours.openTime && dayHours.closeTime) {
      const isAfterOpen = timeStr >= dayHours.openTime;
      const isBeforeClose = timeStr < dayHours.closeTime;
      return isAfterOpen && isBeforeClose;
    }

    return true;
  }

  /**
   * Check if within quiet hours (should not send SMS)
   */
  isWithinQuietHours(now: Date = new Date()): boolean {
    if (!this.config.quietHours.enabled) {
      return false;
    }

    const localTime = this.convertToTimezone(now);
    const timeStr = this.formatTime(localTime);
    const { startTime, endTime } = this.config.quietHours;

    // Handle overnight quiet hours (e.g., 21:00 to 09:00)
    if (startTime > endTime) {
      return timeStr >= startTime || timeStr < endTime;
    }

    return timeStr >= startTime && timeStr < endTime;
  }

  /**
   * Check if given date is a holiday
   */
  isHoliday(date: Date = new Date()): Holiday | null {
    const dateStr = this.formatDate(date);

    for (const holiday of this.config.holidays) {
      const holidayDateStr = this.formatDate(holiday.date);

      if (holidayDateStr === dateStr && holiday.isClosed) {
        // For all-day holidays
        if (holiday.allDayEvent) {
          return holiday;
        }

        // For time-based holidays, check if current time is within closure time
        if (holiday.startTime && holiday.endTime) {
          const timeStr = this.formatTime(date);
          if (timeStr >= holiday.startTime && timeStr < holiday.endTime) {
            return holiday;
          }
        }
      }
    }

    return null;
  }

  /**
   * Check if currently in out-of-office mode
   */
  isOutOfOffice(now: Date = new Date()): boolean {
    const { enabled, startDate, endDate } = this.config.outOfOfficeMode;
    return enabled && now >= startDate && now <= endDate;
  }

  /**
   * Determine if an auto-reply should be sent
   */
  shouldSendAutoReply(context: AutoReplyContext): boolean {
    if (!this.config.enabled) {
      return false;
    }

    const receivedAt = context.receivedAt;

    // Check quiet hours (no messages during quiet hours regardless of business hours)
    if (this.isWithinQuietHours(receivedAt)) {
      console.log('[AfterHours] Within quiet hours, no auto-reply');
      return false;
    }

    // Check out of office mode
    if (this.isOutOfOffice(receivedAt)) {
      if (this.config.responseModes.respondInOutOfOfficeMode) {
        console.log('[AfterHours] Out of office mode active, sending auto-reply');
        return true;
      }
      return false;
    }

    // Check holidays
    const holiday = this.isHoliday(receivedAt);
    if (holiday) {
      if (this.config.responseModes.respondOnHolidays) {
        console.log('[AfterHours] Holiday detected, sending auto-reply');
        return true;
      }
      return false;
    }

    // Check business hours
    if (!this.isWithinBusinessHours(receivedAt)) {
      if (this.config.responseModes.respondOutsideHours) {
        console.log('[AfterHours] Outside business hours, sending auto-reply');
        return true;
      }
      return false;
    }

    return false;
  }

  /**
   * Get the appropriate auto-reply message
   */
  getAutoReplyMessage(context: AutoReplyContext): string {
    const receivedAt = context.receivedAt;

    // Check for specific holiday message
    const holiday = this.isHoliday(receivedAt);
    if (holiday?.customMessage) {
      return holiday.customMessage;
    }

    // Check for out-of-office message
    if (this.isOutOfOffice(receivedAt)) {
      return this.config.outOfOfficeMode.message;
    }

    // Return default auto-reply
    return this.config.autoReplyMessage;
  }

  /**
   * Send auto-reply message
   */
  async sendAutoReply(context: AutoReplyContext): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Determine if we should send auto-reply
      if (!this.shouldSendAutoReply(context)) {
        return { success: false, error: 'Auto-reply conditions not met' };
      }

      // Get the appropriate message
      const message = this.getAutoReplyMessage(context);

      // Log the context
      console.log('[AfterHours] Sending auto-reply to', context.patientPhone, 'at', context.receivedAt);

      // Send via messaging service
      const result = await messagingService.sendSMS({
        to: context.patientPhone,
        body: message,
        patientId: context.patientId,
        conversationId: context.conversationId,
        metadata: {
          type: 'auto_response',
          autoResponder: true,
          timestamp: context.receivedAt.toISOString(),
        },
      });

      return {
        success: true,
        messageId: result.sid,
      };
    } catch (error: any) {
      console.error('[AfterHours] Failed to send auto-reply:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Add a holiday to the calendar
   */
  addHoliday(holiday: Holiday): AutoResponderConfig {
    const newHoliday = {
      ...holiday,
      id: holiday.id || `holiday-${Date.now()}`,
    };

    this.config.holidays.push(newHoliday);
    this.config.updatedAt = new Date();
    configStorage.set(this.config.id, this.config);

    console.log('[AfterHours] Holiday added:', newHoliday.name);
    return { ...this.config };
  }

  /**
   * Remove a holiday
   */
  removeHoliday(holidayId: string): AutoResponderConfig {
    this.config.holidays = this.config.holidays.filter(h => h.id !== holidayId);
    this.config.updatedAt = new Date();
    configStorage.set(this.config.id, this.config);

    console.log('[AfterHours] Holiday removed:', holidayId);
    return { ...this.config };
  }

  /**
   * Update business hours for a specific day
   */
  updateBusinessHours(dayOfWeek: DayOfWeek, hours: Partial<BusinessHours>): AutoResponderConfig {
    const dayIndex = this.config.businessHours.findIndex(h => h.dayOfWeek === dayOfWeek);
    if (dayIndex !== -1) {
      this.config.businessHours[dayIndex] = {
        ...this.config.businessHours[dayIndex],
        ...hours,
        dayOfWeek, // Ensure day doesn't change
      };
    }

    this.config.updatedAt = new Date();
    configStorage.set(this.config.id, this.config);

    console.log('[AfterHours] Business hours updated for', dayOfWeek);
    return { ...this.config };
  }

  /**
   * Enable/disable out-of-office mode
   */
  setOutOfOfficeMode(enabled: boolean, startDate?: Date, endDate?: Date, message?: string): AutoResponderConfig {
    this.config.outOfOfficeMode = {
      ...this.config.outOfOfficeMode,
      enabled,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(message && { message }),
    };

    this.config.updatedAt = new Date();
    configStorage.set(this.config.id, this.config);

    console.log('[AfterHours] Out-of-office mode:', enabled ? 'enabled' : 'disabled');
    return { ...this.config };
  }

  /**
   * Update auto-reply message
   */
  updateAutoReplyMessage(message: string): AutoResponderConfig {
    this.config.autoReplyMessage = message;
    this.config.updatedAt = new Date();
    configStorage.set(this.config.id, this.config);

    console.log('[AfterHours] Auto-reply message updated');
    return { ...this.config };
  }

  /**
   * Update timezone
   */
  updateTimezone(timezone: string): AutoResponderConfig {
    this.config.timezone = timezone;
    this.config.updatedAt = new Date();
    configStorage.set(this.config.id, this.config);

    console.log('[AfterHours] Timezone updated to', timezone);
    return { ...this.config };
  }

  // ============= Helper Methods =============

  private convertToTimezone(date: Date): Date {
    // Using Intl API for timezone conversion
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: this.config.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const partMap: Record<string, string> = {};
    parts.forEach(part => {
      partMap[part.type] = part.value;
    });

    return new Date(
      `${partMap.year}-${partMap.month}-${partMap.day}T${partMap.hour}:${partMap.minute}:${partMap.second}`
    );
  }

  private getDayOfWeek(date: Date): DayOfWeek {
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  private formatTime(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

// Export singleton instance
export const afterHoursService = AfterHoursResponderService.getInstance();
