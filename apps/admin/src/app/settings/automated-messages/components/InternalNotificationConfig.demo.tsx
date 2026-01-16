'use client'

/**
 * Interactive Demo of InternalNotificationConfig Component
 *
 * This page demonstrates all features and states of the component.
 * Navigate to /settings/automated-messages/demo to view this page.
 */

import { useState } from 'react'
import { InternalNotificationConfig } from './InternalNotificationConfig'
import { Navigation } from '@/components/Navigation'
import { ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'

export default function InternalNotificationConfigDemo() {
  // Demo state 1: Enabled with recipients
  const [config1, setConfig1] = useState({
    enabled: true,
    recipients: ['admin@luxemedicalspa.com', 'manager@luxemedicalspa.com']
  })

  // Demo state 2: Disabled with no recipients
  const [config2, setConfig2] = useState<{ enabled: boolean; recipients: string[] }>({
    enabled: false,
    recipients: []
  })

  // Demo state 3: Enabled with many recipients
  const [config3, setConfig3] = useState({
    enabled: true,
    recipients: [
      'owner@luxemedicalspa.com',
      'admin@luxemedicalspa.com',
      'frontdesk@luxemedicalspa.com',
      'manager@luxemedicalspa.com',
      'billing@luxemedicalspa.com'
    ]
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <Link
              href="/settings"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                InternalNotificationConfig Demo
              </h1>
              <p className="text-gray-500 mt-1">
                Interactive demonstration of all component features and states
              </p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Component Testing Playground</p>
            <p>
              Try adding/removing emails, toggling the switches, and testing different input methods
              (Enter key, comma separation, Add button). Check the browser console for state changes.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Demo 1: Standard Configuration */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Demo 1: Enabled with Recipients
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Standard use case with toggle enabled and some recipients configured
              </p>
            </div>

            <InternalNotificationConfig
              enabled={config1.enabled}
              recipients={config1.recipients}
              onChange={(newConfig) => {
                console.log('Config 1 changed:', newConfig)
                setConfig1(newConfig)
              }}
            />

            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-xs font-mono text-gray-700 mb-1">Current State:</p>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify(config1, null, 2)}
              </pre>
            </div>
          </div>

          {/* Demo 2: Disabled State */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Demo 2: Disabled State
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Toggle disabled - notice how input becomes non-interactive
              </p>
            </div>

            <InternalNotificationConfig
              enabled={config2.enabled}
              recipients={config2.recipients}
              onChange={(newConfig) => {
                console.log('Config 2 changed:', newConfig)
                setConfig2(newConfig)
              }}
            />

            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-xs font-mono text-gray-700 mb-1">Current State:</p>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify(config2, null, 2)}
              </pre>
            </div>
          </div>

          {/* Demo 3: Multiple Recipients */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Demo 3: Multiple Recipients
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Shows how the component handles multiple email tags with wrapping
              </p>
            </div>

            <InternalNotificationConfig
              enabled={config3.enabled}
              recipients={config3.recipients}
              onChange={(newConfig) => {
                console.log('Config 3 changed:', newConfig)
                setConfig3(newConfig)
              }}
            />

            <div className="bg-gray-100 rounded-lg p-4">
              <p className="text-xs font-mono text-gray-700 mb-1">Current State:</p>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify(config3, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Feature List */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Features to Test</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Adding Emails:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Type email and press Enter</li>
                <li>• Type email and press comma (,)</li>
                <li>• Type email and click Add button</li>
                <li>• Type email and click outside input (blur)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Validation:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Try invalid email format</li>
                <li>• Try adding duplicate email</li>
                <li>• Try empty input</li>
                <li>• See error messages display</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Removal:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Click X button on any tag</li>
                <li>• Watch recipient count update</li>
                <li>• Remove all recipients</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Toggle:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Enable/disable notifications</li>
                <li>• Watch UI become disabled</li>
                <li>• Recipients preserved when disabled</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Testing Scenarios */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">Testing Scenarios</h3>
          <div className="space-y-3 text-sm text-amber-800">
            <div>
              <span className="font-medium">Scenario 1:</span> Add 5 emails using different methods
              (Enter, comma, button, blur)
            </div>
            <div>
              <span className="font-medium">Scenario 2:</span> Try adding invalid emails like "test",
              "test@", "@domain.com"
            </div>
            <div>
              <span className="font-medium">Scenario 3:</span> Add an email, disable toggle, try to
              modify (should be blocked)
            </div>
            <div>
              <span className="font-medium">Scenario 4:</span> Paste comma-separated emails:
              "test1@example.com,test2@example.com"
            </div>
            <div>
              <span className="font-medium">Scenario 5:</span> Remove all emails one by one, watch
              count disappear
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
