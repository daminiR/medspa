/**
 * Automated Messages Hook
 * Medical Spa Admin Platform
 *
 * Custom hook for managing automated message settings with localStorage persistence.
 * Provides functions to get, update, and reset automated message configurations.
 *
 * @see /src/app/settings/automated-messages - Automated messages settings page
 * @see /src/lib/data/automatedMessages.ts - Default message templates
 * @see /src/types/messaging.ts - Message type definitions
 */

import { useState, useEffect, useCallback } from 'react'
import { AutomatedMessageConfig, EventType } from '@/types/messaging'

// Storage key for localStorage
const STORAGE_KEY = 'automatedMessageSettings'

/**
 * Hook result interface
 */
interface UseAutomatedMessagesResult {
  // Data
  /** All automated message settings */
  settings: Record<string, AutomatedMessageConfig>

  // State
  /** Whether settings are being loaded */
  isLoading: boolean
  /** Error message if any operation fails */
  error: string | null

  // Actions
  /** Get settings for a specific event type */
  getSettings: (eventType: EventType) => AutomatedMessageConfig | null
  /** Update settings for a specific event type */
  updateSettings: (eventType: EventType, config: Partial<AutomatedMessageConfig>) => void
  /** Reset settings for a specific event type to defaults */
  resetToDefaults: (eventType: EventType) => void
  /** Get all settings */
  getAllSettings: () => Record<string, AutomatedMessageConfig>
  /** Reset all settings to defaults */
  resetAllToDefaults: () => void
  /** Check if settings for a specific event type are using defaults */
  isUsingDefaults: (eventType: EventType) => boolean
}

/**
 * Default automated message configurations
 * These are used for initialization and reset functionality
 */
const getDefaultSettings = (): Record<string, AutomatedMessageConfig> => {
  return {
    appointment_booked: {
      id: 'appointment_booked',
      eventType: 'appointment_booked',
      enabled: true,
      channels: ['sms', 'email'],
      timing: {
        type: 'immediate',
      },
      triggers: {
        onlineBookings: true,
        staffBookings: true,
      },
      template: {
        subject: 'Appointment Confirmation',
        body: 'Hi {{patientName}}, your appointment for {{serviceName}} is confirmed for {{appointmentDate}} at {{appointmentTime}} with {{providerName}}. See you soon!',
        variables: ['patientName', 'serviceName', 'appointmentDate', 'appointmentTime', 'providerName'],
      },
      internalNotification: {
        enabled: true,
        recipients: [],
      },
      confirmationRequest: {
        enabled: true,
        setStatusUnconfirmed: true,
      },
      timelineReminders: [
        {
          id: 'reminder_7d',
          value: 7,
          unit: 'days',
          enabled: true,
          template: {
            body: 'Hi {{patientName}}, reminder: {{serviceName}} in 7 days on {{appointmentDate}} at {{appointmentTime}} with {{providerName}}.',
            variables: ['patientName', 'serviceName', 'appointmentDate', 'appointmentTime', 'providerName'],
          },
          channels: ['sms'],
        },
        {
          id: 'reminder_3d',
          value: 3,
          unit: 'days',
          enabled: true,
          template: {
            body: 'Hi {{patientName}}, reminder: {{serviceName}} in 3 days on {{appointmentDate}} at {{appointmentTime}} with {{providerName}}. Reply C to confirm.',
            variables: ['patientName', 'serviceName', 'appointmentDate', 'appointmentTime', 'providerName'],
          },
          channels: ['sms'],
        },
        {
          id: 'reminder_1d',
          value: 1,
          unit: 'days',
          enabled: true,
          template: {
            body: 'Hi {{patientName}}, reminder: {{serviceName}} tomorrow at {{appointmentTime}} with {{providerName}}. Reply C to confirm, R to reschedule.',
            variables: ['patientName', 'serviceName', 'appointmentTime', 'providerName'],
          },
          channels: ['sms'],
        },
      ],
    },
    appointment_canceled: {
      id: 'appointment_canceled',
      eventType: 'appointment_canceled',
      enabled: true,
      channels: ['sms', 'email'],
      timing: {
        type: 'immediate',
      },
      triggers: {
        onlineBookings: true,
        staffBookings: true,
      },
      template: {
        subject: 'Appointment Canceled',
        body: 'Hi {{patientName}}, your appointment for {{serviceName}} on {{appointmentDate}} at {{appointmentTime}} has been canceled. Call us at {{locationPhone}} to reschedule.',
        variables: ['patientName', 'serviceName', 'appointmentDate', 'appointmentTime', 'locationPhone'],
      },
    },
    appointment_rescheduled: {
      id: 'appointment_rescheduled',
      eventType: 'appointment_rescheduled',
      enabled: true,
      channels: ['sms', 'email'],
      timing: {
        type: 'immediate',
      },
      triggers: {
        onlineBookings: true,
        staffBookings: true,
      },
      template: {
        subject: 'Appointment Rescheduled',
        body: 'Hi {{patientName}}, your {{serviceName}} appointment has been rescheduled to {{appointmentDate}} at {{appointmentTime}} with {{providerName}}.',
        variables: ['patientName', 'serviceName', 'appointmentDate', 'appointmentTime', 'providerName'],
      },
    },
    form_submitted: {
      id: 'form_submitted',
      eventType: 'form_submitted',
      enabled: true,
      channels: ['email'],
      timing: {
        type: 'immediate',
      },
      triggers: {
        onlineBookings: false,
        staffBookings: false,
      },
      template: {
        subject: 'Form Received - Thank You',
        body: 'Hi {{patientName}}, we received your {{formName}}. Thank you for completing it before your appointment.',
        variables: ['patientName', 'formName'],
      },
      internalNotification: {
        enabled: true,
        recipients: [],
      },
    },
    waitlist_added: {
      id: 'waitlist_added',
      eventType: 'waitlist_added',
      enabled: true,
      channels: ['sms', 'email'],
      timing: {
        type: 'immediate',
      },
      triggers: {
        onlineBookings: true,
        staffBookings: true,
      },
      template: {
        subject: 'Added to Waitlist',
        body: "Hi {{patientName}}, you've been added to the waitlist for {{serviceName}} with {{providerName}}. We'll notify you when a spot opens up!",
        variables: ['patientName', 'serviceName', 'providerName'],
      },
    },
    waitlist_opening: {
      id: 'waitlist_opening',
      eventType: 'waitlist_opening',
      enabled: true,
      channels: ['sms', 'email'],
      timing: {
        type: 'immediate',
      },
      triggers: {
        onlineBookings: true,
        staffBookings: true,
      },
      template: {
        subject: 'Waitlist Opening Available',
        body: 'Hi {{patientName}}, an opening is available for {{serviceName}} on {{appointmentDate}} at {{appointmentTime}}. Reply Y to book or call {{locationPhone}}.',
        variables: ['patientName', 'serviceName', 'appointmentDate', 'appointmentTime', 'locationPhone'],
      },
    },
    check_in_reminder: {
      id: 'check_in_reminder',
      eventType: 'check_in_reminder',
      enabled: true,
      channels: ['sms'],
      timing: {
        type: 'before_appointment',
        value: 1,
        unit: 'hours',
      },
      triggers: {
        onlineBookings: true,
        staffBookings: true,
      },
      template: {
        body: 'Hi {{patientName}}, your appointment is in 1 hour. Check in online at {{checkInUrl}} to save time.',
        variables: ['patientName', 'checkInUrl'],
      },
      checkInInstructions: 'Please arrive 10 minutes early to complete check-in.',
    },
    patient_waiting: {
      id: 'patient_waiting',
      eventType: 'patient_waiting',
      enabled: false,
      channels: ['sms'],
      timing: {
        type: 'immediate',
      },
      triggers: {
        onlineBookings: false,
        staffBookings: false,
      },
      template: {
        body: 'Thank you for checking in, {{patientName}}. {{providerName}} will be with you shortly.',
        variables: ['patientName', 'providerName'],
      },
    },
    provider_ready: {
      id: 'provider_ready',
      eventType: 'provider_ready',
      enabled: true,
      channels: ['sms'],
      timing: {
        type: 'immediate',
      },
      triggers: {
        onlineBookings: false,
        staffBookings: false,
      },
      template: {
        body: 'Hi {{patientName}}, {{providerName}} is ready for you now. Please proceed to {{roomName}}.',
        variables: ['patientName', 'providerName', 'roomName'],
      },
    },
    sale_closed: {
      id: 'sale_closed',
      eventType: 'sale_closed',
      enabled: true,
      channels: ['email', 'sms'],
      timing: {
        type: 'immediate',
      },
      triggers: {
        onlineBookings: false,
        staffBookings: false,
      },
      template: {
        subject: 'Purchase Receipt',
        body: 'Hi {{patientName}}, thank you for your purchase! Your receipt for {{amount}} has been emailed to you.',
        variables: ['patientName', 'amount'],
      },
    },
    gift_card_purchased: {
      id: 'gift_card_purchased',
      eventType: 'gift_card_purchased',
      enabled: true,
      channels: ['email'],
      timing: {
        type: 'immediate',
      },
      triggers: {
        onlineBookings: true,
        staffBookings: true,
      },
      template: {
        subject: 'Gift Card Purchase Confirmation',
        body: 'Hi {{purchaserName}}, your gift card purchase of {{amount}} is confirmed. The gift card code is {{giftCardCode}}.',
        variables: ['purchaserName', 'amount', 'giftCardCode'],
      },
    },
    gift_card_received: {
      id: 'gift_card_received',
      eventType: 'gift_card_received',
      enabled: true,
      channels: ['email', 'sms'],
      timing: {
        type: 'immediate',
      },
      triggers: {
        onlineBookings: true,
        staffBookings: true,
      },
      template: {
        subject: 'Gift Card Received',
        body: 'Hi {{recipientName}}, {{senderName}} sent you a gift card for {{amount}}! Use code {{giftCardCode}} when booking.',
        variables: ['recipientName', 'senderName', 'amount', 'giftCardCode'],
      },
    },
    membership_started: {
      id: 'membership_started',
      eventType: 'membership_started',
      enabled: true,
      channels: ['email', 'sms'],
      timing: {
        type: 'immediate',
      },
      triggers: {
        onlineBookings: true,
        staffBookings: true,
      },
      template: {
        subject: 'Membership Activated',
        body: 'Hi {{patientName}}, your {{membershipName}} membership is now active! Enjoy your benefits starting today.',
        variables: ['patientName', 'membershipName'],
      },
    },
    membership_renewal_reminder: {
      id: 'membership_renewal_reminder',
      eventType: 'membership_renewal_reminder',
      enabled: true,
      channels: ['email', 'sms'],
      timing: {
        type: 'before_appointment',
        value: 7,
        unit: 'days',
      },
      triggers: {
        onlineBookings: false,
        staffBookings: false,
      },
      template: {
        subject: 'Membership Renewal Reminder',
        body: 'Hi {{patientName}}, your {{membershipName}} membership renews in 7 days on {{renewalDate}}.',
        variables: ['patientName', 'membershipName', 'renewalDate'],
      },
    },
    membership_renewed: {
      id: 'membership_renewed',
      eventType: 'membership_renewed',
      enabled: true,
      channels: ['email'],
      timing: {
        type: 'immediate',
      },
      triggers: {
        onlineBookings: false,
        staffBookings: false,
      },
      template: {
        subject: 'Membership Renewed',
        body: 'Hi {{patientName}}, your {{membershipName}} membership has been renewed for another {{duration}}.',
        variables: ['patientName', 'membershipName', 'duration'],
      },
    },
    membership_canceled: {
      id: 'membership_canceled',
      eventType: 'membership_canceled',
      enabled: true,
      channels: ['email'],
      timing: {
        type: 'immediate',
      },
      triggers: {
        onlineBookings: false,
        staffBookings: false,
      },
      template: {
        subject: 'Membership Canceled',
        body: 'Hi {{patientName}}, your {{membershipName}} membership has been canceled. Your benefits remain active until {{expirationDate}}.',
        variables: ['patientName', 'membershipName', 'expirationDate'],
      },
    },
  }
}

/**
 * Load settings from localStorage
 */
const loadSettingsFromStorage = (): Record<string, AutomatedMessageConfig> | null => {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return null
    }

    const parsed = JSON.parse(stored) as Record<string, AutomatedMessageConfig>
    return parsed
  } catch (error) {
    console.error('Failed to load automated message settings from localStorage:', error)
    return null
  }
}

/**
 * Save settings to localStorage
 */
const saveSettingsToStorage = (settings: Record<string, AutomatedMessageConfig>): void => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))

    // Dispatch custom event for other components to listen to
    window.dispatchEvent(
      new CustomEvent('automatedMessagesUpdated', { detail: settings })
    )
  } catch (error) {
    console.error('Failed to save automated message settings to localStorage:', error)
  }
}

/**
 * Custom hook for managing automated message settings
 *
 * @example
 * ```tsx
 * const { settings, getSettings, updateSettings, isLoading } = useAutomatedMessages()
 *
 * // Get settings for a specific event
 * const appointmentSettings = getSettings('appointment_booked')
 *
 * // Update settings
 * updateSettings('appointment_booked', {
 *   enabled: false,
 *   channels: ['email']
 * })
 *
 * // Reset to defaults
 * resetToDefaults('appointment_booked')
 * ```
 */
export function useAutomatedMessages(): UseAutomatedMessagesResult {
  const [settings, setSettings] = useState<Record<string, AutomatedMessageConfig>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize settings on mount
  useEffect(() => {
    try {
      setIsLoading(true)
      setError(null)

      // Try to load from localStorage
      const stored = loadSettingsFromStorage()

      if (stored) {
        setSettings(stored)
      } else {
        // Initialize with defaults
        const defaults = getDefaultSettings()
        setSettings(defaults)
        saveSettingsToStorage(defaults)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings'
      setError(errorMessage)
      console.error('Error initializing automated message settings:', err)

      // Fall back to defaults on error
      setSettings(getDefaultSettings())
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Get settings for a specific event type
   */
  const getSettings = useCallback(
    (eventType: EventType): AutomatedMessageConfig | null => {
      return settings[eventType] || null
    },
    [settings]
  )

  /**
   * Update settings for a specific event type
   */
  const updateSettings = useCallback(
    (eventType: EventType, config: Partial<AutomatedMessageConfig>): void => {
      try {
        setError(null)

        setSettings((prev) => {
          const existing = prev[eventType]

          if (!existing) {
            console.warn(`No existing settings found for event type: ${eventType}`)
            return prev
          }

          // Deep merge the configuration
          const updated = {
            ...existing,
            ...config,
            // Ensure nested objects are properly merged
            template: config.template
              ? { ...existing.template, ...config.template }
              : existing.template,
            triggers: config.triggers
              ? { ...existing.triggers, ...config.triggers }
              : existing.triggers,
            timing: config.timing
              ? { ...existing.timing, ...config.timing }
              : existing.timing,
            internalNotification: config.internalNotification
              ? { ...existing.internalNotification, ...config.internalNotification }
              : existing.internalNotification,
            confirmationRequest: config.confirmationRequest
              ? { ...existing.confirmationRequest, ...config.confirmationRequest }
              : existing.confirmationRequest,
          }

          const newSettings = {
            ...prev,
            [eventType]: updated,
          }

          // Save to localStorage
          saveSettingsToStorage(newSettings)

          return newSettings
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update settings'
        setError(errorMessage)
        console.error('Error updating automated message settings:', err)
      }
    },
    []
  )

  /**
   * Reset settings for a specific event type to defaults
   */
  const resetToDefaults = useCallback((eventType: EventType): void => {
    try {
      setError(null)

      const defaults = getDefaultSettings()
      const defaultConfig = defaults[eventType]

      if (!defaultConfig) {
        console.warn(`No default settings found for event type: ${eventType}`)
        return
      }

      setSettings((prev) => {
        const newSettings = {
          ...prev,
          [eventType]: defaultConfig,
        }

        // Save to localStorage
        saveSettingsToStorage(newSettings)

        return newSettings
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset settings'
      setError(errorMessage)
      console.error('Error resetting automated message settings:', err)
    }
  }, [])

  /**
   * Get all settings
   */
  const getAllSettings = useCallback((): Record<string, AutomatedMessageConfig> => {
    return settings
  }, [settings])

  /**
   * Reset all settings to defaults
   */
  const resetAllToDefaults = useCallback((): void => {
    try {
      setError(null)

      const defaults = getDefaultSettings()
      setSettings(defaults)
      saveSettingsToStorage(defaults)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset all settings'
      setError(errorMessage)
      console.error('Error resetting all automated message settings:', err)
    }
  }, [])

  /**
   * Check if settings for a specific event type are using defaults
   * Performs deep comparison of current settings with defaults
   */
  const isUsingDefaults = useCallback((eventType: EventType): boolean => {
    try {
      const currentConfig = settings[eventType]
      const defaultConfig = getDefaultSettings()[eventType]

      if (!currentConfig || !defaultConfig) {
        return false
      }

      // Deep comparison - stringify and compare
      return JSON.stringify(currentConfig) === JSON.stringify(defaultConfig)
    } catch (err) {
      console.error('Error checking if settings are defaults:', err)
      return false
    }
  }, [settings])

  return {
    settings,
    isLoading,
    error,
    getSettings,
    updateSettings,
    resetToDefaults,
    getAllSettings,
    resetAllToDefaults,
    isUsingDefaults,
  }
}
