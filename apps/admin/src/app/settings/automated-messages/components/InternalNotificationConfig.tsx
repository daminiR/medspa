'use client'

import { useState, KeyboardEvent } from 'react'
import { Mail, Users, X, Plus } from 'lucide-react'

interface InternalNotificationConfigProps {
  enabled: boolean
  recipients: string[]
  onChange: (config: { enabled: boolean; recipients: string[] }) => void
}

export function InternalNotificationConfig({
  enabled,
  recipients,
  onChange
}: InternalNotificationConfigProps) {
  const [emailInput, setEmailInput] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)

  // Simple email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email.trim())
  }

  // Handle adding email via Enter or comma
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addEmail()
    }
  }

  // Add email to recipients list
  const addEmail = () => {
    const email = emailInput.trim().replace(/,$/, '') // Remove trailing comma

    if (!email) {
      return
    }

    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    if (recipients.includes(email)) {
      setEmailError('This email is already in the list')
      return
    }

    onChange({
      enabled,
      recipients: [...recipients, email]
    })
    setEmailInput('')
    setEmailError(null)
  }

  // Remove email from recipients list
  const removeEmail = (emailToRemove: string) => {
    onChange({
      enabled,
      recipients: recipients.filter(email => email !== emailToRemove)
    })
  }

  // Handle input change
  const handleInputChange = (value: string) => {
    setEmailInput(value)
    setEmailError(null)
  }

  // Handle toggle
  const handleToggle = () => {
    onChange({
      enabled: !enabled,
      recipients
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Internal Staff Notifications</h3>
            <p className="text-sm text-gray-500 mt-1">
              Send notification copies to staff members for monitoring and oversight
            </p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            enabled ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          aria-label={enabled ? 'Disable internal notifications' : 'Enable internal notifications'}
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
        <div className="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Staff-Only Notifications</p>
            <p>
              These notifications are sent to staff members only, not to patients.
              Use this to keep your team informed about important automated messages being sent.
            </p>
          </div>
        </div>

        {/* Email Recipients */}
        <div className={enabled ? '' : 'opacity-50 pointer-events-none'}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient Email Addresses
          </label>

          {/* Email Tags Display */}
          {recipients.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              {recipients.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  <Mail className="h-3 w-3" />
                  {email}
                  <button
                    onClick={() => removeEmail(email)}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${email}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Email Input */}
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={addEmail}
                placeholder="Enter email address and press Enter"
                disabled={!enabled}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  emailError
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300'
                }`}
              />
              {emailError && (
                <p className="text-sm text-red-600 mt-1">{emailError}</p>
              )}
            </div>
            <button
              onClick={addEmail}
              disabled={!enabled || !emailInput.trim()}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                enabled && emailInput.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              aria-label="Add email"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Enter email addresses separated by commas or press Enter after each address
          </p>
        </div>

        {/* Recipients Count */}
        {enabled && recipients.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600 pt-2 border-t border-gray-200">
            <Users className="h-4 w-4" />
            <span>
              {recipients.length} {recipients.length === 1 ? 'recipient' : 'recipients'} configured
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
