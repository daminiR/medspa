'use client'

import { useState, useRef, useMemo } from 'react'
import { AlertCircle, Hash, Plus } from 'lucide-react'

/**
 * MessageEditor Component
 *
 * A message template editor for automated messages (SMS and Email).
 * Features:
 * - SMS character counting with segment tracking (160 chars per segment)
 * - Variable insertion via clickable chips
 * - Subject line input (email only)
 * - Live preview of variables
 * - Emoji detection for SMS
 *
 * @example
 * ```tsx
 * <MessageEditor
 *   template={{ subject: 'Appointment Reminder', body: 'Hi {firstName}...', variables: ['{firstName}'] }}
 *   onChange={(template) => console.log(template)}
 *   messageType="sms"
 * />
 * ```
 */

// =============================================================================
// Types
// =============================================================================

export interface MessageTemplate {
  subject?: string // Only for email
  body: string
  variables: string[] // Variables used in this template
}

export interface MessageEditorProps {
  /** Current template data */
  template: MessageTemplate
  /** Callback when template changes */
  onChange: (template: MessageTemplate) => void
  /** Type of message: SMS or Email */
  messageType: 'sms' | 'email'
  /** Optional CSS class name */
  className?: string
}

// =============================================================================
// Available Variables
// =============================================================================

interface VariableDefinition {
  key: string
  label: string
  example: string
  description: string
}

const AVAILABLE_VARIABLES: VariableDefinition[] = [
  {
    key: '{firstName}',
    label: 'First Name',
    example: 'Sarah',
    description: "Patient's first name"
  },
  {
    key: '{lastName}',
    label: 'Last Name',
    example: 'Johnson',
    description: "Patient's last name"
  },
  {
    key: '{appointmentDate}',
    label: 'Appointment Date',
    example: 'Wed, Jan 15',
    description: 'Date of appointment'
  },
  {
    key: '{appointmentTime}',
    label: 'Appointment Time',
    example: '2:30 PM',
    description: 'Time of appointment'
  },
  {
    key: '{providerName}',
    label: 'Provider Name',
    example: 'Dr. Smith',
    description: 'Name of the provider'
  },
  {
    key: '{serviceName}',
    label: 'Service Name',
    example: 'Botox Treatment',
    description: 'Name of the service/treatment'
  },
  {
    key: '{locationName}',
    label: 'Location Name',
    example: 'Luxe Medical Spa',
    description: 'Name of the clinic/spa'
  },
  {
    key: '{locationPhone}',
    label: 'Location Phone',
    example: '(555) 123-4567',
    description: 'Phone number of the clinic/spa'
  },
  {
    key: '{bookingLink}',
    label: 'Booking Link',
    example: 'spa.com/book',
    description: 'Link for online booking'
  },
  {
    key: '{checkInLink}',
    label: 'Check-In Link',
    example: 'spa.com/checkin',
    description: 'Link for online check-in'
  }
]

// =============================================================================
// Character Count Utilities
// =============================================================================

interface CharacterCountInfo {
  count: number
  segments: number
  hasEmoji: boolean
  limit: number
  status: 'ok' | 'warning' | 'over'
}

function calculateSMSCharacterCount(text: string): CharacterCountInfo {
  const count = text.length

  // Detect emojis and unicode characters
  const hasEmoji = /[^\x00-\x7F]/.test(text)

  // SMS limits: 160 for ASCII, 70 for unicode/emoji
  const limit = hasEmoji ? 70 : 160

  // Calculate segments
  const segments = count === 0 ? 0 : Math.ceil(count / limit)

  // Determine status
  let status: 'ok' | 'warning' | 'over'
  if (count <= limit * 0.85) {
    status = 'ok'
  } else if (count <= limit) {
    status = 'warning'
  } else {
    status = 'over'
  }

  return { count, segments, hasEmoji, limit, status }
}

// =============================================================================
// Component
// =============================================================================

export default function MessageEditor({
  template,
  onChange,
  messageType,
  className = ''
}: MessageEditorProps) {
  const [showVariablePicker, setShowVariablePicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Character count info (SMS only)
  const charInfo = useMemo(() => {
    if (messageType === 'sms') {
      return calculateSMSCharacterCount(template.body)
    }
    return null
  }, [template.body, messageType])

  // Handle subject change (email only)
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...template,
      subject: e.target.value
    })
  }

  // Handle body change
  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...template,
      body: e.target.value
    })
  }

  // Insert variable at cursor position
  const insertVariable = (variableKey: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = template.body

    // Insert variable at cursor position
    const newText = text.slice(0, start) + variableKey + text.slice(end)

    // Update template
    onChange({
      ...template,
      body: newText,
      variables: extractVariables(newText)
    })

    // Focus textarea and set cursor position after variable
    setTimeout(() => {
      textarea.focus()
      const newPosition = start + variableKey.length
      textarea.setSelectionRange(newPosition, newPosition)
    }, 0)

    // Close variable picker
    setShowVariablePicker(false)
  }

  // Extract variables used in text
  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{[^}]+\}/g) || []
    return Array.from(new Set(matches))
  }

  // Generate preview text with example values
  const generatePreview = (text: string): string => {
    let preview = text
    AVAILABLE_VARIABLES.forEach(variable => {
      preview = preview.replace(new RegExp(variable.key.replace(/[{}]/g, '\\$&'), 'g'), variable.example)
    })
    return preview
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Subject Line (Email Only) */}
      {messageType === 'email' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject Line
          </label>
          <input
            type="text"
            value={template.subject || ''}
            onChange={handleSubjectChange}
            placeholder="Enter email subject..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Message Body */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message Body
        </label>

        <textarea
          ref={textareaRef}
          value={template.body}
          onChange={handleBodyChange}
          placeholder={`Type your ${messageType === 'sms' ? 'SMS' : 'email'} message here. Click variables below to insert...`}
          rows={messageType === 'sms' ? 4 : 8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
        />

        {/* Character Count (SMS Only) */}
        {messageType === 'sms' && charInfo && (
          <div className="mt-2 flex items-center justify-between">
            <div className={`flex items-center gap-2 text-sm ${
              charInfo.status === 'ok' ? 'text-gray-600' :
              charInfo.status === 'warning' ? 'text-amber-600' :
              'text-red-600'
            }`}>
              <Hash className="h-4 w-4" />
              <span className="font-medium">
                {charInfo.count}/{charInfo.limit} characters
              </span>
              {charInfo.segments > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded ${
                  charInfo.segments === 1 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {charInfo.segments} segment{charInfo.segments > 1 ? 's' : ''}
                </span>
              )}
              {charInfo.hasEmoji && (
                <span className="text-xs text-purple-600">😀 Emojis detected</span>
              )}
            </div>

            {/* Warning for multi-segment messages */}
            {charInfo.segments > 1 && (
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <AlertCircle className="h-3 w-3" />
                <span>Multi-segment SMS (extra charges may apply)</span>
              </div>
            )}
          </div>
        )}

        {/* Info for Email */}
        {messageType === 'email' && template.body.length > 0 && (
          <div className="mt-2 text-xs text-gray-500">
            {template.body.length} characters
          </div>
        )}
      </div>

      {/* Available Variables */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-blue-900">
            Available Variables - Click to insert:
          </p>
          <button
            onClick={() => setShowVariablePicker(!showVariablePicker)}
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            {showVariablePicker ? 'Hide' : 'Show'} All
          </button>
        </div>

        <div className={`grid gap-2 ${showVariablePicker ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
          {(showVariablePicker ? AVAILABLE_VARIABLES : AVAILABLE_VARIABLES.slice(0, 4)).map((variable) => (
            <button
              key={variable.key}
              onClick={() => insertVariable(variable.key)}
              className="text-left p-2 bg-white border border-blue-200 rounded hover:bg-blue-100 hover:border-blue-300 transition-all text-sm group"
              title={variable.description}
            >
              <div className="font-medium text-blue-900 group-hover:text-blue-700">
                {variable.label}
              </div>
              <div className="text-xs text-blue-600 font-mono">{variable.key}</div>
              {showVariablePicker && (
                <div className="text-xs text-blue-500 mt-1">e.g., {variable.example}</div>
              )}
            </button>
          ))}
        </div>

        {!showVariablePicker && AVAILABLE_VARIABLES.length > 4 && (
          <div className="text-xs text-blue-600 mt-2 text-center">
            +{AVAILABLE_VARIABLES.length - 4} more variables available
          </div>
        )}
      </div>

      {/* Preview */}
      {template.body.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-500 mb-2">
            Preview with example values:
          </p>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {generatePreview(template.body)}
          </div>
        </div>
      )}

      {/* HIPAA Warning for SMS */}
      {messageType === 'sms' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-800">
              <span className="font-medium">HIPAA Compliance:</span> SMS is not encrypted.
              Avoid including specific diagnoses, conditions, or treatment details that could reveal
              protected health information (PHI).
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
