/**
 * TestSendButton Component
 *
 * Button to send test messages for SMS and email templates.
 * Opens a modal asking for test phone/email and sends the message.
 */

'use client'

import React, { useState } from 'react'
import { Send, Check, AlertCircle, X } from 'lucide-react'

interface TestSendButtonProps {
  messageType: 'sms' | 'email'
  template: {
    name: string
    content: string
  }
  onSend: (recipient: string) => Promise<void>
}

export default function TestSendButton({ messageType, template, onSend }: TestSendButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Validation helpers
  const isValidPhone = (phone: string): boolean => {
    // Basic phone validation (10 digits)
    const cleaned = phone.replace(/\D/g, '')
    return cleaned.length === 10 || cleaned.length === 11
  }

  const isValidEmail = (email: string): boolean => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValid = messageType === 'sms' ? isValidPhone(recipient) : isValidEmail(recipient)

  // Format phone number
  const formatPhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    if (cleaned.length === 11 && cleaned[0] === '1') {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    return phone
  }

  // Handle send test
  const handleSend = async () => {
    if (!isValid) {
      setErrorMessage(`Please enter a valid ${messageType === 'sms' ? 'phone number' : 'email address'}`)
      return
    }

    setSendState('sending')
    setErrorMessage('')

    try {
      await onSend(recipient)
      setSendState('success')

      // Auto-close after success
      setTimeout(() => {
        setShowModal(false)
        setSendState('idle')
        setRecipient('')
      }, 2000)
    } catch (error) {
      setSendState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Failed to send test message')

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setSendState('idle')
      }, 3000)
    }
  }

  // Handle modal close
  const handleClose = () => {
    if (sendState === 'sending') return // Don't allow close while sending
    setShowModal(false)
    setSendState('idle')
    setRecipient('')
    setErrorMessage('')
  }

  // Get input placeholder
  const inputPlaceholder = messageType === 'sms'
    ? '(555) 123-4567'
    : 'user@example.com'

  // Get input label
  const inputLabel = messageType === 'sms'
    ? 'Phone Number'
    : 'Email Address'

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg flex items-center gap-2 transition-colors"
        title={`Send test ${messageType}`}
      >
        <Send className="h-4 w-4" />
        Send Test
      </button>

      {/* Test Send Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Send className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Send Test Message</h3>
                  <p className="text-sm text-gray-500">{template.name}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={sendState === 'sending'}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4">
              {/* Template Preview */}
              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs font-medium text-gray-500 mb-1">Message Preview:</p>
                <p className="text-sm text-gray-700 line-clamp-3">{template.content}</p>
              </div>

              {/* Recipient Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {inputLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  type={messageType === 'sms' ? 'tel' : 'email'}
                  value={recipient}
                  onChange={(e) => {
                    setRecipient(e.target.value)
                    setErrorMessage('')
                  }}
                  placeholder={inputPlaceholder}
                  disabled={sendState === 'sending'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  autoFocus
                />
                {recipient && !isValid && (
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {messageType === 'sms' ? 'Enter 10-digit phone number' : 'Enter valid email address'}
                  </p>
                )}
              </div>

              {/* Error Message */}
              {sendState === 'error' && errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Failed to send</p>
                    <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {sendState === 'success' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Test message sent!</p>
                    <p className="text-xs text-green-700 mt-1">
                      Sent to {messageType === 'sms' ? formatPhone(recipient) : recipient}
                    </p>
                  </div>
                </div>
              )}

              {/* Info Message */}
              {sendState === 'idle' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Variables like {'{patient_name}'} will be replaced with sample data in the test message.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex items-center justify-end gap-3">
              <button
                onClick={handleClose}
                disabled={sendState === 'sending'}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!isValid || sendState === 'sending' || sendState === 'success'}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2 min-w-[120px] justify-center"
              >
                {sendState === 'sending' && (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                )}
                {sendState === 'success' && (
                  <>
                    <Check className="h-4 w-4" />
                    Sent!
                  </>
                )}
                {(sendState === 'idle' || sendState === 'error') && (
                  <>
                    <Send className="h-4 w-4" />
                    Send Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
