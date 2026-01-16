'use client'

/**
 * Example usage of InternalNotificationConfig component
 *
 * This component demonstrates how to integrate the InternalNotificationConfig
 * into your automated messages settings page.
 */

import { useState } from 'react'
import { InternalNotificationConfig } from './InternalNotificationConfig'
import { Save } from 'lucide-react'

export function InternalNotificationConfigExample() {
  const [config, setConfig] = useState({
    enabled: true,
    recipients: [
      'admin@luxemedicalspa.com',
      'manager@luxemedicalspa.com'
    ]
  })

  const handleSave = () => {
    console.log('Saving configuration:', config)
    // In a real app, you would save to backend here
    // e.g., await fetch('/api/settings/notifications', { method: 'POST', body: JSON.stringify(config) })
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Automated Messages Settings</h1>
        <p className="text-gray-500 mt-1">Configure internal staff notifications</p>
      </div>

      <InternalNotificationConfig
        enabled={config.enabled}
        recipients={config.recipients}
        onChange={setConfig}
      />

      <div className="flex justify-end gap-3">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      {/* Display current config state for demo purposes */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Current Configuration (for demo):</h3>
        <pre className="text-xs text-gray-600 overflow-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
    </div>
  )
}
