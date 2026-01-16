/**
 * React Hook for After-Hours Auto-Responder Service
 * Provides easy access to after-hours configuration and logic
 */

import { useState, useCallback, useEffect } from 'react';
import { afterHoursService, AutoResponderConfig, DayOfWeek, Holiday } from '@/services/messaging/after-hours';

interface UseAfterHoursReturn {
  config: AutoResponderConfig;
  isOpen: boolean;
  isOnHoliday: boolean;
  isOutOfOffice: boolean;
  isInQuietHours: boolean;
  updateConfig: (updates: Partial<AutoResponderConfig>) => void;
  updateBusinessHours: (day: DayOfWeek, hours: any) => void;
  addHoliday: (holiday: Holiday) => void;
  removeHoliday: (holidayId: string) => void;
  setOutOfOfficeMode: (enabled: boolean, startDate?: Date, endDate?: Date, message?: string) => void;
  updateAutoReplyMessage: (message: string) => void;
  updateTimezone: (timezone: string) => void;
  refetch: () => void;
}

/**
 * Hook to use after-hours responder configuration
 * Automatically re-renders when status changes
 */
export function useAfterHours(): UseAfterHoursReturn {
  const [config, setConfig] = useState<AutoResponderConfig>(afterHoursService.getConfig());
  const [isOpen, setIsOpen] = useState(afterHoursService.isWithinBusinessHours());
  const [isOnHoliday, setIsOnHoliday] = useState(!!afterHoursService.isHoliday());
  const [isOutOfOffice, setIsOutOfOffice] = useState(afterHoursService.isOutOfOffice());
  const [isInQuietHours, setIsInQuietHours] = useState(afterHoursService.isWithinQuietHours());

  // Update all states
  const updateAllStates = useCallback(() => {
    const now = new Date();
    setConfig(afterHoursService.getConfig());
    setIsOpen(afterHoursService.isWithinBusinessHours(now));
    setIsOnHoliday(!!afterHoursService.isHoliday(now));
    setIsOutOfOffice(afterHoursService.isOutOfOffice(now));
    setIsInQuietHours(afterHoursService.isWithinQuietHours(now));
  }, []);

  // Update states every minute
  useEffect(() => {
    const interval = setInterval(updateAllStates, 60000);
    return () => clearInterval(interval);
  }, [updateAllStates]);

  const handleUpdateConfig = useCallback(
    (updates: Partial<AutoResponderConfig>) => {
      afterHoursService.updateConfig(updates);
      updateAllStates();
    },
    [updateAllStates]
  );

  const handleUpdateBusinessHours = useCallback(
    (day: DayOfWeek, hours: any) => {
      afterHoursService.updateBusinessHours(day, hours);
      updateAllStates();
    },
    [updateAllStates]
  );

  const handleAddHoliday = useCallback(
    (holiday: Holiday) => {
      afterHoursService.addHoliday(holiday);
      updateAllStates();
    },
    [updateAllStates]
  );

  const handleRemoveHoliday = useCallback(
    (holidayId: string) => {
      afterHoursService.removeHoliday(holidayId);
      updateAllStates();
    },
    [updateAllStates]
  );

  const handleSetOutOfOfficeMode = useCallback(
    (enabled: boolean, startDate?: Date, endDate?: Date, message?: string) => {
      afterHoursService.setOutOfOfficeMode(enabled, startDate, endDate, message);
      updateAllStates();
    },
    [updateAllStates]
  );

  const handleUpdateAutoReplyMessage = useCallback(
    (message: string) => {
      afterHoursService.updateAutoReplyMessage(message);
      updateAllStates();
    },
    [updateAllStates]
  );

  const handleUpdateTimezone = useCallback(
    (timezone: string) => {
      afterHoursService.updateTimezone(timezone);
      updateAllStates();
    },
    [updateAllStates]
  );

  return {
    config,
    isOpen,
    isOnHoliday,
    isOutOfOffice,
    isInQuietHours,
    updateConfig: handleUpdateConfig,
    updateBusinessHours: handleUpdateBusinessHours,
    addHoliday: handleAddHoliday,
    removeHoliday: handleRemoveHoliday,
    setOutOfOfficeMode: handleSetOutOfOfficeMode,
    updateAutoReplyMessage: handleUpdateAutoReplyMessage,
    updateTimezone: handleUpdateTimezone,
    refetch: updateAllStates,
  };
}
