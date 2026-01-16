'use client'

import { useState } from 'react'
import { InternalNotificationConfig } from '../components/InternalNotificationConfig'
import { FileCheck, Link2, Settings } from 'lucide-react'

interface FormTypeConfig {
  intake: boolean
  consent: boolean
  medicalHistory: boolean
}

interface FormSubmissionNotificationConfig {
  enabled: boolean
  recipients: string[]
  includeFormLink: boolean
  formTypes: FormTypeConfig
}

export function FormSubmittedTab() {
  // Master toggle for entire tab
  const [masterEnabled, setMasterEnabled] = useState(true);

  const [config, setConfig] = useState<FormSubmissionNotificationConfig>({
    enabled: true,
    recipients: ['admin@medspa.com', 'frontdesk@medspa.com'],
    includeFormLink: true,
    formTypes: {
      intake: true,
      consent: true,
      medicalHistory: true
    }
  })

  const handleInternalNotificationChange = (internalConfig: { enabled: boolean; recipients: string[] }) => {
    setConfig(prev => ({
      ...prev,
      enabled: internalConfig.enabled,
      recipients: internalConfig.recipients
    }))
  }

  const handleFormLinkToggle = () => {
    setConfig(prev => ({
      ...prev,
      includeFormLink: !prev.includeFormLink
    }))
  }

  const handleFormTypeToggle = (formType: keyof FormTypeConfig) => {
    setConfig(prev => ({
      ...prev,
      formTypes: {
        ...prev.formTypes,
        [formType]: !prev.formTypes[formType]
      }
    }))
  }

  const allFormTypesDisabled = !config.formTypes.intake && !config.formTypes.consent && !config.formTypes.medicalHistory

  return (
    <div className="space-y-6">
      {/* Header with Master Toggle */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FileCheck className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900">Form Submission Messages</h2>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-medium ${masterEnabled ? 'text-green-700' : 'text-gray-500'}`}>
                  {masterEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={masterEnabled}
                    onChange={(e) => setMasterEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
            <p className="text-gray-600">
              These notifications are sent to staff members when patients complete forms.
              No automated messages are sent to patients when forms are submitted.
            </p>
            {!masterEnabled && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium">
                  All form submission notifications are currently disabled. Enable this setting to activate automated messages.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content wrapper with disabled state */}
      <div className={masterEnabled ? '' : 'opacity-50 pointer-events-none'}>
      {/* Internal Notification Configuration */}
      <InternalNotificationConfig
        enabled={config.enabled}
        recipients={config.recipients}
        onChange={handleInternalNotificationChange}
      />

      {/* Additional Options */}
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${!config.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Settings className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notification Options</h3>
            <p className="text-sm text-gray-500 mt-1">
              Configure what information to include in staff notifications
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Include Form Link Option */}
          <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-3 flex-1">
              <Link2 className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Include Link to View Form</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Add a direct link in the notification to view the submitted form in the admin dashboard
                </p>
              </div>
            </div>
            <button
              onClick={handleFormLinkToggle}
              className={`relative w-14 h-8 rounded-full transition-colors flex-shrink-0 ml-4 ${
                config.includeFormLink ? 'bg-purple-600' : 'bg-gray-300'
              }`}
              aria-label={config.includeFormLink ? 'Disable form link' : 'Enable form link'}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                  config.includeFormLink ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Form Type Filters */}
          <div className="border-t border-gray-200 pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Notify for Specific Form Types
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Choose which form types should trigger staff notifications
            </p>

            <div className="space-y-3">
              {/* Intake Forms */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <FileCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Intake Forms</p>
                    <p className="text-xs text-gray-500">New patient intake and demographics</p>
                  </div>
                </div>
                <button
                  onClick={() => handleFormTypeToggle('intake')}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    config.formTypes.intake ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                  aria-label={config.formTypes.intake ? 'Disable intake notifications' : 'Enable intake notifications'}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                      config.formTypes.intake ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Consent Forms */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Consent Forms</p>
                    <p className="text-xs text-gray-500">Treatment-specific consent forms (Botox, fillers, etc.)</p>
                  </div>
                </div>
                <button
                  onClick={() => handleFormTypeToggle('consent')}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    config.formTypes.consent ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                  aria-label={config.formTypes.consent ? 'Disable consent notifications' : 'Enable consent notifications'}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                      config.formTypes.consent ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Medical History Forms */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FileCheck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Medical History Forms</p>
                    <p className="text-xs text-gray-500">Health history and HIPAA documentation</p>
                  </div>
                </div>
                <button
                  onClick={() => handleFormTypeToggle('medicalHistory')}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    config.formTypes.medicalHistory ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                  aria-label={config.formTypes.medicalHistory ? 'Disable medical history notifications' : 'Enable medical history notifications'}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                      config.formTypes.medicalHistory ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Warning if all types disabled */}
            {allFormTypesDisabled && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-medium">Warning:</span> All form types are disabled.
                  You won't receive notifications for any form submissions.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
        <div className="text-sm text-gray-600 space-y-1">
          {config.enabled ? (
            <>
              <p>
                Internal notifications are <span className="font-medium text-green-600">enabled</span> for{' '}
                {config.recipients.length} recipient{config.recipients.length !== 1 ? 's' : ''}
              </p>
              <p>
                Form link will {config.includeFormLink ? '' : 'not '}be included in notifications
              </p>
              <p>
                Monitoring {Object.values(config.formTypes).filter(Boolean).length} of 3 form type{Object.values(config.formTypes).filter(Boolean).length !== 1 ? 's' : ''}
              </p>
            </>
          ) : (
            <p className="text-gray-500 italic">
              Internal notifications are currently disabled
            </p>
          )}
        </div>
      </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
