/**
 * Setup Wizard Integration Example
 *
 * This file demonstrates how to integrate the Setup Wizard with your settings pages
 * and apply the wizard configuration to actual automated message settings.
 */

import { WizardConfig, getWizardConfig, saveWizardConfig } from './SetupWizard'

/**
 * Example: Apply wizard configuration to appointment reminder settings
 */
export function applyWizardToAppointmentSettings(config: WizardConfig) {
  if (config.appointmentReminders) {
    // Enable 24-hour reminder
    const reminder24h = {
      id: '24h-reminder',
      timing: { value: 1, unit: 'days' as const },
      enabled: true,
      messageType: 'reminder' as const,
      label: '24-Hour Reminder',
    }

    // Enable 2-hour reminder
    const reminder2h = {
      id: '2h-reminder',
      timing: { value: 2, unit: 'hours' as const },
      enabled: true,
      messageType: 'reminder' as const,
      label: '2-Hour Reminder',
    }

    // In your actual implementation, you would:
    // 1. Update the reminders state in AppointmentBookedTab
    // 2. Save to localStorage or API
    console.log('Enabling appointment reminders:', { reminder24h, reminder2h })
  }
}

/**
 * Example: Apply wizard configuration to confirmation request settings
 */
export function applyWizardToConfirmationSettings(config: WizardConfig) {
  if (config.confirmationRequests) {
    // Enable 48-hour confirmation request
    const confirmationSettings = {
      enabled: true,
      setUnconfirmed: true, // Mark appointments as unconfirmed until patient responds
      followUpEnabled: true,
      followUpHours: 48, // 48 hours before appointment
    }

    // In your actual implementation, you would:
    // 1. Update the confirmation request state in AppointmentBookedTab
    // 2. Save to localStorage or API
    console.log('Enabling confirmation requests:', confirmationSettings)
  }
}

/**
 * Example: Apply wizard configuration to thank you message settings
 */
export function applyWizardToThankYouSettings(config: WizardConfig) {
  if (config.thankYouMessages) {
    // Enable thank you messages on sale closed
    const thankYouSettings = {
      thankYouSMS: {
        enabled: true,
        template: {
          body: 'Hi {firstName}! Thanks for visiting {locationName} today! Your receipt: {receiptLink}. Questions? Reply here anytime!',
          variables: ['{firstName}', '{locationName}', '{receiptLink}'],
        },
      },
      thankYouEmail: {
        enabled: true,
        template: {
          subject: 'Thank you for visiting {locationName}!',
          body: 'Hi {firstName},\n\nThank you for choosing {locationName}...',
          variables: ['{firstName}', '{locationName}', '{receiptLink}'],
        },
      },
    }

    // In your actual implementation, you would:
    // 1. Update the thank you settings in SaleClosedTab
    // 2. Save to localStorage or API
    console.log('Enabling thank you messages:', thankYouSettings)
  }
}

/**
 * Example: Complete integration function
 */
export function applyWizardConfiguration(config: WizardConfig) {
  console.log('Applying wizard configuration:', config)

  // Apply all settings
  applyWizardToAppointmentSettings(config)
  applyWizardToConfirmationSettings(config)
  applyWizardToThankYouSettings(config)

  // You could also:
  // - Show a success toast notification
  // - Navigate to the appropriate tab
  // - Send analytics event
  // - Save to API endpoint

  return {
    success: true,
    message: 'Automated messages configured successfully!',
  }
}

/**
 * Example: Load wizard configuration on page load
 */
export function loadWizardConfiguration() {
  const config = getWizardConfig()

  if (config) {
    console.log('Found wizard configuration:', config)
    // Apply the configuration if it hasn't been applied yet
    // You might want to check if settings have been manually changed
    // since the wizard was completed
  }

  return config
}

/**
 * Example: Reset wizard (for testing or re-onboarding)
 */
export function resetWizard() {
  if (typeof window === 'undefined') return

  localStorage.removeItem('setupWizardCompleted')
  localStorage.removeItem('setupWizardConfig')

  console.log('Wizard reset - user will see wizard on next visit')
}

/**
 * Example: Update specific wizard setting
 */
export function updateWizardSetting(
  key: keyof WizardConfig,
  value: boolean
) {
  const config = getWizardConfig()

  if (config) {
    const updatedConfig = {
      ...config,
      [key]: value,
    }

    saveWizardConfig(updatedConfig)
    console.log('Wizard configuration updated:', updatedConfig)

    return updatedConfig
  }

  return null
}

// Usage in AutomatedMessagesPage:
//
// const handleWizardComplete = (config: WizardConfig) => {
//   // Apply the configuration
//   const result = applyWizardConfiguration(config)
//
//   // Show success message
//   toast.success(result.message)
//
//   // Close wizard
//   setShowWizard(false)
//
//   // Optional: Navigate to a specific tab
//   if (config.appointmentReminders) {
//     setActiveTab('appointment-booked')
//   }
// }
