'use client'

import { useState } from 'react'
import { ConfirmationRequestConfig } from './ConfirmationRequestConfig'

/**
 * Example usage of ConfirmationRequestConfig component
 *
 * This example demonstrates how to integrate the confirmation request
 * configuration into your automated messages settings.
 */
export default function ConfirmationRequestConfigExample() {
  const [config, setConfig] = useState({
    enabled: true,
    setUnconfirmed: true,
    followUpEnabled: true,
    followUpHours: 24
  })

  const handleConfigChange = (newConfig: typeof config) => {
    setConfig(newConfig)
    console.log('Configuration updated:', newConfig)
    // Here you would typically save to your backend/state management
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Confirmation Request Configuration
          </h1>
          <p className="text-gray-600 mt-2">
            Configure how patients confirm their appointments via SMS
          </p>
        </div>

        <ConfirmationRequestConfig
          enabled={config.enabled}
          setUnconfirmed={config.setUnconfirmed}
          followUpEnabled={config.followUpEnabled}
          followUpHours={config.followUpHours}
          onChange={handleConfigChange}
        />

        {/* Display current config (for demo purposes) */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Current Configuration
          </h3>
          <pre className="text-xs text-gray-600 overflow-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
