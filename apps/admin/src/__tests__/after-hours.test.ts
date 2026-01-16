/**
 * After-Hours Auto-Responder Service Tests
 * Comprehensive tests for business hours, holidays, timezone, and auto-reply logic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { afterHoursService, DayOfWeek } from '@/services/messaging/after-hours';

describe('AfterHoursResponderService', () => {
  beforeEach(() => {
    // Reset to fresh instance for each test
    const config = afterHoursService.getConfig();
    // Clear holidays for clean state
    config.holidays.forEach(h => afterHoursService.removeHoliday(h.id));
  });

  describe('Business Hours Detection', () => {
    it('should detect when within business hours on a weekday', () => {
      // Monday 2024-01-08 at 10:00 AM
      const mondayMorning = new Date('2024-01-08T10:00:00');
      const isWithin = afterHoursService.isWithinBusinessHours(mondayMorning);
      console.log('[TEST] Monday 10:00 AM within business hours:', isWithin);
      expect(isWithin).toBe(true);
    });

    it('should detect when outside business hours before opening', () => {
      // Monday 2024-01-08 at 6:00 AM (before 9:00 AM open)
      const beforeOpen = new Date('2024-01-08T06:00:00');
      const isWithin = afterHoursService.isWithinBusinessHours(beforeOpen);
      console.log('[TEST] Monday 6:00 AM within business hours:', isWithin);
      expect(isWithin).toBe(false);
    });

    it('should detect when outside business hours after closing', () => {
      // Monday 2024-01-08 at 6:00 PM (after 5:00 PM close)
      const afterClose = new Date('2024-01-08T18:00:00');
      const isWithin = afterHoursService.isWithinBusinessHours(afterClose);
      console.log('[TEST] Monday 6:00 PM within business hours:', isWithin);
      expect(isWithin).toBe(false);
    });

    it('should detect closed days (Sunday)', () => {
      // Sunday 2024-01-07 at 2:00 PM
      const sunday = new Date('2024-01-07T14:00:00');
      const isWithin = afterHoursService.isWithinBusinessHours(sunday);
      console.log('[TEST] Sunday 2:00 PM within business hours:', isWithin);
      expect(isWithin).toBe(false);
    });

    it('should detect closed days (Saturday)', () => {
      // Saturday 2024-01-06 at 2:00 PM
      const saturday = new Date('2024-01-06T14:00:00');
      const isWithin = afterHoursService.isWithinBusinessHours(saturday);
      console.log('[TEST] Saturday 2:00 PM within business hours:', isWithin);
      expect(isWithin).toBe(false);
    });
  });

  describe('Quiet Hours Detection', () => {
    it('should detect when within quiet hours', () => {
      // 11:00 PM (within default quiet hours 9 PM - 9 AM)
      const quietTime = new Date('2024-01-08T23:00:00');
      const isQuiet = afterHoursService.isWithinQuietHours(quietTime);
      console.log('[TEST] 11:00 PM within quiet hours:', isQuiet);
      expect(isQuiet).toBe(true);
    });

    it('should detect when outside quiet hours', () => {
      // 2:00 PM (outside quiet hours)
      const normalTime = new Date('2024-01-08T14:00:00');
      const isQuiet = afterHoursService.isWithinQuietHours(normalTime);
      console.log('[TEST] 2:00 PM within quiet hours:', isQuiet);
      expect(isQuiet).toBe(false);
    });

    it('should handle overnight quiet hours correctly', () => {
      // 6:00 AM (within overnight quiet hours 9 PM - 9 AM)
      const earlyMorning = new Date('2024-01-08T06:00:00');
      const isQuiet = afterHoursService.isWithinQuietHours(earlyMorning);
      console.log('[TEST] 6:00 AM within quiet hours:', isQuiet);
      expect(isQuiet).toBe(true);
    });
  });

  describe('Holiday Detection', () => {
    it('should detect all-day holiday', () => {
      // Add Christmas 2024
      afterHoursService.addHoliday({
        id: 'christmas',
        date: new Date('2024-12-25'),
        name: 'Christmas Day',
        allDayEvent: true,
        isClosed: true,
      });

      const christmasDay = new Date('2024-12-25T14:00:00');
      const holiday = afterHoursService.isHoliday(christmasDay);
      console.log('[TEST] Christmas detected as holiday:', !!holiday);
      expect(holiday).not.toBeNull();
      expect(holiday?.name).toBe('Christmas Day');
    });

    it('should not detect non-holidays', () => {
      const randomDay = new Date('2024-06-15T14:00:00');
      const holiday = afterHoursService.isHoliday(randomDay);
      console.log('[TEST] Random day detected as holiday:', !!holiday);
      expect(holiday).toBeNull();
    });

    it('should detect holiday outside closure time', () => {
      // Add a 3-hour holiday closure window
      afterHoursService.addHoliday({
        id: 'partial-holiday',
        date: new Date('2024-01-15'),
        name: 'Partial Closure',
        allDayEvent: false,
        startTime: '12:00',
        endTime: '15:00',
        isClosed: true,
      });

      // Before closure window
      const beforeClosure = new Date('2024-01-15T11:00:00');
      const holidayBefore = afterHoursService.isHoliday(beforeClosure);
      console.log('[TEST] Before holiday window detected as holiday:', !!holidayBefore);
      expect(holidayBefore).toBeNull();

      // Within closure window
      const duringClosure = new Date('2024-01-15T13:00:00');
      const holidayDuring = afterHoursService.isHoliday(duringClosure);
      console.log('[TEST] During holiday window detected as holiday:', !!holidayDuring);
      expect(holidayDuring).not.toBeNull();

      // After closure window
      const afterClosure = new Date('2024-01-15T16:00:00');
      const holidayAfter = afterHoursService.isHoliday(afterClosure);
      console.log('[TEST] After holiday window detected as holiday:', !!holidayAfter);
      expect(holidayAfter).toBeNull();
    });

    it('should use custom message for specific holiday', () => {
      const customMsg = 'Happy New Year! We will reopen on Jan 2.';
      afterHoursService.addHoliday({
        id: 'new-year',
        date: new Date('2024-01-01'),
        name: 'New Year Day',
        allDayEvent: true,
        isClosed: true,
        customMessage: customMsg,
      });

      const message = afterHoursService.getAutoReplyMessage({
        patientPhone: '+15551234567',
        messageText: 'Hello',
        receivedAt: new Date('2024-01-01T14:00:00'),
      });

      console.log('[TEST] Holiday custom message:', message);
      expect(message).toBe(customMsg);
    });
  });

  describe('Out-of-Office Mode', () => {
    it('should detect when in out-of-office mode', () => {
      const startDate = new Date('2024-01-15T00:00:00');
      const endDate = new Date('2024-01-20T23:59:59');
      const message = 'We are out of the office and will return on Jan 21.';

      afterHoursService.setOutOfOfficeMode(true, startDate, endDate, message);

      const duringOOO = new Date('2024-01-17T14:00:00');
      const isOOO = afterHoursService.isOutOfOffice(duringOOO);
      console.log('[TEST] During OOO period detected:', isOOO);
      expect(isOOO).toBe(true);

      const beforeOOO = new Date('2024-01-14T14:00:00');
      const isNotOOOBefore = afterHoursService.isOutOfOffice(beforeOOO);
      console.log('[TEST] Before OOO period detected:', isNotOOOBefore);
      expect(isNotOOOBefore).toBe(false);

      const afterOOO = new Date('2024-01-21T14:00:00');
      const isNotOOOAfter = afterHoursService.isOutOfOffice(afterOOO);
      console.log('[TEST] After OOO period detected:', isNotOOOAfter);
      expect(isNotOOOAfter).toBe(false);
    });
  });

  describe('Auto-Reply Logic', () => {
    it('should send auto-reply when outside business hours', () => {
      const eveningTime = new Date('2024-01-08T19:00:00'); // 7 PM (after 5 PM close)
      const shouldReply = afterHoursService.shouldSendAutoReply({
        patientPhone: '+15551234567',
        messageText: 'Can I book an appointment?',
        receivedAt: eveningTime,
      });

      console.log('[TEST] Should send auto-reply after hours:', shouldReply);
      expect(shouldReply).toBe(true);
    });

    it('should not send auto-reply during business hours', () => {
      const daytime = new Date('2024-01-08T14:00:00'); // 2 PM (within 9 AM - 5 PM)
      const shouldReply = afterHoursService.shouldSendAutoReply({
        patientPhone: '+15551234567',
        messageText: 'Can I book an appointment?',
        receivedAt: daytime,
      });

      console.log('[TEST] Should send auto-reply during business hours:', shouldReply);
      expect(shouldReply).toBe(false);
    });

    it('should not send auto-reply during quiet hours', () => {
      const quietTime = new Date('2024-01-08T23:00:00'); // 11 PM (within quiet hours)
      const shouldReply = afterHoursService.shouldSendAutoReply({
        patientPhone: '+15551234567',
        messageText: 'Can I book an appointment?',
        receivedAt: quietTime,
      });

      console.log('[TEST] Should send auto-reply during quiet hours:', shouldReply);
      expect(shouldReply).toBe(false);
    });

    it('should respect respondOutsideHours setting', () => {
      // Disable auto-reply outside hours
      afterHoursService.updateConfig({
        responseModes: {
          respondOutsideHours: false,
          respondOnHolidays: true,
          respondInOutOfOfficeMode: true,
        },
      });

      const eveningTime = new Date('2024-01-08T19:00:00');
      const shouldReply = afterHoursService.shouldSendAutoReply({
        patientPhone: '+15551234567',
        messageText: 'Can I book an appointment?',
        receivedAt: eveningTime,
      });

      console.log('[TEST] Should send auto-reply with feature disabled:', shouldReply);
      expect(shouldReply).toBe(false);

      // Re-enable for other tests
      afterHoursService.updateConfig({
        responseModes: {
          respondOutsideHours: true,
          respondOnHolidays: true,
          respondInOutOfOfficeMode: true,
        },
      });
    });

    it('should respect respondOnHolidays setting', () => {
      afterHoursService.addHoliday({
        id: 'test-holiday',
        date: new Date('2024-01-15'),
        name: 'Test Holiday',
        allDayEvent: true,
        isClosed: true,
      });

      // Disable auto-reply on holidays
      afterHoursService.updateConfig({
        responseModes: {
          respondOutsideHours: true,
          respondOnHolidays: false,
          respondInOutOfOfficeMode: true,
        },
      });

      const holidayTime = new Date('2024-01-15T14:00:00');
      const shouldReply = afterHoursService.shouldSendAutoReply({
        patientPhone: '+15551234567',
        messageText: 'Can I book an appointment?',
        receivedAt: holidayTime,
      });

      console.log('[TEST] Should send auto-reply on holiday with feature disabled:', shouldReply);
      expect(shouldReply).toBe(false);

      // Re-enable for other tests
      afterHoursService.updateConfig({
        responseModes: {
          respondOutsideHours: true,
          respondOnHolidays: true,
          respondInOutOfOfficeMode: true,
        },
      });

      // Clean up
      afterHoursService.removeHoliday('test-holiday');
    });

    it('should disable all auto-replies when service disabled', () => {
      afterHoursService.updateConfig({ enabled: false });

      const eveningTime = new Date('2024-01-08T19:00:00');
      const shouldReply = afterHoursService.shouldSendAutoReply({
        patientPhone: '+15551234567',
        messageText: 'Can I book an appointment?',
        receivedAt: eveningTime,
      });

      console.log('[TEST] Should send auto-reply when service disabled:', shouldReply);
      expect(shouldReply).toBe(false);

      // Re-enable for other tests
      afterHoursService.updateConfig({ enabled: true });
    });
  });

  describe('Business Hours Configuration', () => {
    it('should update business hours for a day', () => {
      afterHoursService.updateBusinessHours('monday', {
        isOpen: true,
        openTime: '08:00',
        closeTime: '18:00',
      });

      const config = afterHoursService.getConfig();
      const monday = config.businessHours.find(h => h.dayOfWeek === 'monday');

      console.log('[TEST] Monday business hours:', monday);
      expect(monday?.openTime).toBe('08:00');
      expect(monday?.closeTime).toBe('18:00');
    });

    it('should close a day', () => {
      afterHoursService.updateBusinessHours('thursday', {
        isOpen: false,
      });

      const config = afterHoursService.getConfig();
      const thursday = config.businessHours.find(h => h.dayOfWeek === 'thursday');

      console.log('[TEST] Thursday is open:', thursday?.isOpen);
      expect(thursday?.isOpen).toBe(false);
    });
  });

  describe('Configuration Management', () => {
    it('should update auto-reply message', () => {
      const newMessage = 'Thanks for reaching out! We will respond during business hours.';
      afterHoursService.updateAutoReplyMessage(newMessage);

      const config = afterHoursService.getConfig();
      console.log('[TEST] Updated auto-reply message:', config.autoReplyMessage);
      expect(config.autoReplyMessage).toBe(newMessage);
    });

    it('should update timezone', () => {
      afterHoursService.updateTimezone('America/Los_Angeles');

      const config = afterHoursService.getConfig();
      console.log('[TEST] Updated timezone:', config.timezone);
      expect(config.timezone).toBe('America/Los_Angeles');

      // Reset to default
      afterHoursService.updateTimezone('America/New_York');
    });

    it('should update quiet hours', () => {
      afterHoursService.updateConfig({
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
        },
      });

      const config = afterHoursService.getConfig();
      console.log('[TEST] Updated quiet hours:', config.quietHours);
      expect(config.quietHours.startTime).toBe('22:00');
      expect(config.quietHours.endTime).toBe('08:00');
    });

    it('should preserve updatedAt timestamp', () => {
      const before = afterHoursService.getConfig().updatedAt;
      afterHoursService.updateAutoReplyMessage('New message');
      const after = afterHoursService.getConfig().updatedAt;

      console.log('[TEST] UpdatedAt timestamp changed:', before !== after);
      expect(after.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  describe('Get Auto-Reply Message', () => {
    it('should return default message outside hours', () => {
      const defaultMsg = 'Thank you for reaching out! We are currently closed.';
      afterHoursService.updateAutoReplyMessage(defaultMsg);

      const message = afterHoursService.getAutoReplyMessage({
        patientPhone: '+15551234567',
        messageText: 'Hello',
        receivedAt: new Date('2024-01-08T19:00:00'),
      });

      console.log('[TEST] Default auto-reply message:', message);
      expect(message).toBe(defaultMsg);
    });

    it('should return out-of-office message when in OOO mode', () => {
      const oooMessage = 'We are out of the office and will return on Jan 20.';
      afterHoursService.setOutOfOfficeMode(
        true,
        new Date('2024-01-15'),
        new Date('2024-01-20'),
        oooMessage
      );

      const message = afterHoursService.getAutoReplyMessage({
        patientPhone: '+15551234567',
        messageText: 'Hello',
        receivedAt: new Date('2024-01-17T14:00:00'),
      });

      console.log('[TEST] Out-of-office auto-reply message:', message);
      expect(message).toBe(oooMessage);

      // Clean up
      afterHoursService.setOutOfOfficeMode(false);
    });
  });
});
