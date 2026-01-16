'use client'

import { MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface ConfirmationRequestConfigProps {
  enabled: boolean
  setUnconfirmed: boolean
  followUpEnabled: boolean
  followUpHours: number
  onChange: (config: {
    enabled: boolean
    setUnconfirmed: boolean
    followUpEnabled: boolean
    followUpHours: number
  }) => void
}

export function ConfirmationRequestConfig({
  enabled,
  setUnconfirmed,
  followUpEnabled,
  followUpHours,
  onChange
}: ConfirmationRequestConfigProps) {
  const handleToggle = () => {
    onChange({
      enabled: !enabled,
      setUnconfirmed,
      followUpEnabled,
      followUpHours
    })
  }

  const handleSetUnconfirmedToggle = () => {
    onChange({
      enabled,
      setUnconfirmed: !setUnconfirmed,
      followUpEnabled,
      followUpHours
    })
  }

  const handleFollowUpToggle = () => {
    onChange({
      enabled,
      setUnconfirmed,
      followUpEnabled: !followUpEnabled,
      followUpHours
    })
  }

  const handleFollowUpHoursChange = (hours: number) => {
    onChange({
      enabled,
      setUnconfirmed,
      followUpEnabled,
      followUpHours: hours
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <MessageSquare className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Confirmation Request</h3>
            <p className="text-sm text-gray-500 mt-1">
              Request patients to confirm their appointments via SMS reply
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            enabled ? 'bg-amber-600' : 'bg-gray-300'
          }`}
          aria-label={enabled ? 'Disable confirmation request' : 'Enable confirmation request'}
        >
          <div
            className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
              enabled ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="space-y-4">
        {/* Description */}
        <div className="flex items-start gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">Reduce No-Shows by 50%</p>
            <p>
              Patients reply <span className="font-semibold">C</span> to confirm or{' '}
              <span className="font-semibold">R</span> to reschedule. This simple confirmation
              system significantly reduces missed appointments and keeps your schedule full.
            </p>
          </div>
        </div>

        {/* Set Status to Unconfirmed Checkbox */}
        <div className={enabled ? '' : 'opacity-50 pointer-events-none'}>
          <label className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={setUnconfirmed}
              onChange={handleSetUnconfirmedToggle}
              disabled={!enabled}
              className="mt-1 w-4 h-4 text-amber-600 rounded focus:ring-amber-500 focus:ring-2"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                Set appointment status to "Unconfirmed" until confirmed
              </div>
              <p className="text-sm text-gray-500 mt-1">
                New appointments will be marked as "Unconfirmed" until the patient replies with "C".
                Status automatically updates to "Confirmed" when they respond.
              </p>
            </div>
          </label>
        </div>

        {/* Follow-up if No Response */}
        <div className={enabled ? '' : 'opacity-50 pointer-events-none'}>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <Clock className="h-5 w-5 text-gray-600" />
                <div>
                  <h4 className="font-medium text-gray-900">Send follow-up if no response</h4>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Automatically send a reminder if patient hasn't confirmed
                  </p>
                </div>
              </div>
              <button
                onClick={handleFollowUpToggle}
                disabled={!enabled}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  followUpEnabled ? 'bg-amber-600' : 'bg-gray-300'
                }`}
                aria-label={followUpEnabled ? 'Disable follow-up' : 'Enable follow-up'}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    followUpEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Follow-up Delay Input */}
            {followUpEnabled && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up delay (hours)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={followUpHours}
                    onChange={(e) => handleFollowUpHoursChange(parseInt(e.target.value) || 24)}
                    disabled={!enabled}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-600">
                    hours after initial message
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: 24-48 hours. Follow-up will only be sent if patient hasn't confirmed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Example SMS Preview */}
        {enabled && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-2">Example SMS</p>
                <div className="p-3 bg-white border border-blue-200 rounded text-sm text-gray-700 font-mono">
                  Your appointment at Luxe Medical Spa is confirmed for Tuesday, Jan 9 at 2:00 PM
                  with Dr. Sarah Johnson. Reply C to confirm, R to reschedule.
                </div>
                {followUpEnabled && (
                  <div className="mt-3 p-3 bg-white border border-blue-200 rounded text-sm text-gray-700 font-mono">
                    <div className="text-xs text-blue-600 mb-1">
                      Follow-up ({followUpHours}h later):
                    </div>
                    Reminder: Please confirm your appointment on Tuesday, Jan 9 at 2:00 PM. Reply C
                    to confirm or R to reschedule. Call us at (555) 123-4567 if you have questions.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats/Benefits */}
        {enabled && (
          <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 text-sm text-amber-800">
              <p className="font-medium mb-1">Best Practices</p>
              <ul className="list-disc list-inside space-y-1 text-amber-700 ml-2">
                <li>Most patients confirm within 2-4 hours of receiving the message</li>
                <li>Enable follow-up to capture patients who forget to respond initially</li>
                <li>Unconfirmed appointments can be flagged for phone call follow-up</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
