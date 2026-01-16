'use client'

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react'
import {
  Send,
  Paperclip,
  FileText,
  Settings,
  Eye,
  X,
  FileSignature,
  Clock,
  Calendar,
  ClipboardCheck
} from 'lucide-react'
import SMSCharacterCounter from '@/components/messaging/SMSCharacterCounter'

// Props interface exactly as specified
export interface MessageComposerProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onSendAndClose: () => void
  onAttach: () => void
  quickReplies: Record<string, string[]>
  aiSuggestions?: string[]
  disabled?: boolean
  patientName?: string
}

// Form template interface for type safety
interface FormTemplate {
  id: string
  name: string
  description: string
  message?: string
  estimatedTime?: string
  validFor?: string
  fields?: string[]
  requiredFor?: string[]
  previewContent?: {
    title: string
    sections?: string[]
    instructions?: string[]
  }
}

// Mock form templates (in production, these would come from props or backend)
const CONSENT_FORMS: Record<string, FormTemplate> = {
  botox: {
    id: 'form-botox',
    name: 'Botox Consent Form',
    description: 'Consent for neurotoxin injections',
    estimatedTime: '5-7 minutes',
    validFor: 'per-visit',
    fields: ['medical_history', 'allergies', 'signature'],
    requiredFor: ['Botox', 'Dysport'],
    message: 'Please complete your Botox consent form before your appointment: [LINK]',
    previewContent: {
      title: 'Botox/Neurotoxin Treatment Consent',
      sections: [
        'Patient Information & Medical History',
        'Understanding of Treatment & Risks',
        'Pre/Post Treatment Instructions',
        'Patient Signature & Date'
      ]
    }
  },
  filler: {
    id: 'form-filler',
    name: 'Dermal Filler Consent',
    description: 'Consent for dermal filler treatments',
    estimatedTime: '5-7 minutes',
    validFor: 'per-visit',
    fields: ['medical_history', 'allergies', 'signature'],
    requiredFor: ['Juvederm', 'Restylane'],
    message: 'Please review and sign your filler consent form: [LINK]',
    previewContent: {
      title: 'Dermal Filler Treatment Consent',
      sections: [
        'Patient Information',
        'Treatment Areas & Product Selection',
        'Medical History & Contraindications',
        'Consent & E-Signature'
      ]
    }
  },
  general: {
    id: 'form-general',
    name: 'New Patient Intake',
    description: 'General medical history and information',
    estimatedTime: '10-15 minutes',
    validFor: '1-year',
    fields: ['demographics', 'medical_history', 'insurance', 'signature'],
    requiredFor: ['New Patient'],
    message: 'Welcome! Please complete your new patient forms: [LINK]',
    previewContent: {
      title: 'New Patient Registration',
      sections: [
        'Personal Information',
        'Medical History',
        'Current Medications',
        'Emergency Contact'
      ]
    }
  }
}

const POST_CARE_FORMS: Record<string, FormTemplate> = {
  botox: {
    id: 'form-botox-aftercare',
    name: 'Botox Post-Care Instructions',
    description: 'Care instructions after neurotoxin treatment',
    message: 'Your Botox post-care instructions: • No lying flat for 4 hours • No exercise for 24 hours • Full instructions: [LINK]',
    previewContent: {
      title: 'Botox Aftercare Instructions',
      instructions: [
        'Remain upright for 4 hours',
        'No strenuous exercise for 24 hours',
        'Avoid facial massage for 2 weeks',
        'Results visible in 3-7 days'
      ]
    }
  },
  filler: {
    id: 'form-filler-aftercare',
    name: 'Filler Post-Care Instructions',
    description: 'Care instructions after dermal filler',
    message: 'Your filler aftercare: • Apply ice for swelling • Avoid alcohol 24hrs • Full instructions: [LINK]',
    previewContent: {
      title: 'Filler Aftercare Instructions',
      instructions: [
        'Apply ice to reduce swelling',
        'Avoid alcohol for 24 hours',
        'Sleep with head elevated for 2 nights',
        'Gentle massage as directed'
      ]
    }
  },
  chemical_peel: {
    id: 'form-chemical-peel-aftercare',
    name: 'Chemical Peel Aftercare',
    description: 'Post-peel skin care instructions',
    message: 'Post-peel care: • Keep skin moisturized • SPF 30+ daily • No exfoliants for 1 week • Details: [LINK]',
    previewContent: {
      title: 'Chemical Peel Aftercare',
      instructions: [
        'Keep skin moisturized at all times',
        'Apply SPF 30+ sunscreen daily',
        'No exfoliants or retinoids for 1 week',
        'Expect peeling days 3-5'
      ]
    }
  }
}

export default function MessageComposerV2({
  value,
  onChange,
  onSend,
  onSendAndClose,
  onAttach,
  quickReplies,
  aiSuggestions = [],
  disabled = false,
  patientName
}: MessageComposerProps) {
  const [showFormsPanel, setShowFormsPanel] = useState(false)
  const [selectedFormCategory, setSelectedFormCategory] = useState<'intake' | 'postCare'>('intake')
  const [previewingForm, setPreviewingForm] = useState<FormTemplate | null>(null)
  const [selectedQuickReplyCategory, setSelectedQuickReplyCategory] = useState<string>(
    Object.keys(quickReplies)[0] || 'general'
  )

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }, [value])

  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault()
      if (!disabled && value.trim()) {
        onSend()
      }
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      if (!disabled && value.trim()) {
        onSendAndClose()
      }
    } else if ((e.key === '\\' || e.key === '#') && value === '') {
      e.preventDefault()
      const quickRepliesSection = document.getElementById('quick-replies-section')
      if (quickRepliesSection) {
        quickRepliesSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }

  // Handle form send
  const handleSendForm = (form: FormTemplate) => {
    if (form.message) {
      onChange(form.message)
    }
    setShowFormsPanel(false)
    setPreviewingForm(null)
  }

  // Get current forms based on category
  const currentForms = selectedFormCategory === 'intake' ? CONSENT_FORMS : POST_CARE_FORMS
  const isEmpty = !value.trim()

  return (
    <div className="bg-white border-t border-gray-200">
      {/* AI Suggestions Bar */}
      {aiSuggestions.length > 0 && (
        <div className="px-6 pt-4 pb-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">AI Suggestions</span>
            <button
              onClick={() => {/* In production, this would dismiss AI suggestions */}}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {aiSuggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onChange(suggestion)}
                className="px-3 py-2 text-sm bg-gradient-to-br from-indigo-50 to-purple-50 text-gray-800 rounded-lg hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 transition-all shadow-sm hover:shadow max-w-xs text-left"
                title={suggestion}
              >
                <span className="line-clamp-2">{suggestion.length > 60 ? suggestion.substring(0, 60) + '...' : suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Replies Section */}
      <div id="quick-replies-section" className="px-6 pt-4 pb-3 bg-gradient-to-b from-white to-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">Quick Replies</span>
          <a
            href="/settings/quick-replies"
            className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
          >
            <Settings className="h-3 w-3" />
            Manage
          </a>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Object.keys(quickReplies).map(category => (
            <button
              key={category}
              onClick={() => setSelectedQuickReplyCategory(category)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                selectedQuickReplyCategory === category
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category === 'postCare'
                ? 'Post-Care'
                : category === 'appointment'
                ? 'Appointment'
                : category === 'general'
                ? 'General'
                : category === 'reminders'
                ? 'Reminders'
                : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Quick Reply Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {quickReplies[selectedQuickReplyCategory] && quickReplies[selectedQuickReplyCategory].length > 0 ? (
            quickReplies[selectedQuickReplyCategory].slice(0, 6).map((reply, index) => (
              <button
                key={index}
                onClick={() => onChange(reply)}
                className="px-3 py-2 text-sm bg-white text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-all border border-gray-200 shadow-sm hover:shadow whitespace-nowrap flex-shrink-0"
                title={reply}
              >
                {reply.length > 50 ? reply.substring(0, 50) + '...' : reply}
              </button>
            ))
          ) : (
            <div className="text-xs text-gray-500 italic py-2">
              No quick replies in this category.
            </div>
          )}
        </div>
      </div>

      {/* Forms Panel */}
      {showFormsPanel && (
        <div className="px-6 pt-4 pb-0">
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Send Forms & Documents</h3>
              <button
                onClick={() => setShowFormsPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form Category Tabs */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setSelectedFormCategory('intake')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  selectedFormCategory === 'intake'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Consent Forms
              </button>
              <button
                onClick={() => setSelectedFormCategory('postCare')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  selectedFormCategory === 'postCare'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Post-Care Instructions
              </button>
            </div>

            {/* Forms Grid */}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(currentForms).map(([key, form]) => (
                <div
                  key={key}
                  className="relative p-3 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{form.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{form.description}</p>
                    </div>
                    {selectedFormCategory === 'intake' ? (
                      <FileSignature className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                    ) : (
                      <FileText className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                    )}
                  </div>

                  {/* Form metadata for consent forms */}
                  {selectedFormCategory === 'intake' && form.validFor && (
                    <div className="mb-2 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                        Valid: {form.validFor}
                      </span>
                      {form.estimatedTime && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">
                          {form.estimatedTime}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-1">
                    <button
                      onClick={() => setPreviewingForm(form)}
                      className="flex-1 px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center justify-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleSendForm(form)}
                      className="flex-1 px-2 py-1.5 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center justify-center gap-1"
                    >
                      <Send className="h-3 w-3" />
                      Send
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Composer Input Area */}
      <div className="px-6 py-4 border-t border-gray-100">
        {/* Character Counter & Keyboard Hint */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <SMSCharacterCounter text={value} />
          </div>
          <span className="text-xs text-gray-500">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-[10px]">Shift+Enter</kbd> for new line
          </span>
        </div>

        {/* Input and Buttons */}
        <div className="flex items-end gap-2">
          {/* Left Side: Action Buttons */}
          <div className="flex gap-1">
            {/* Attachment Button */}
            <button
              onClick={onAttach}
              disabled={disabled}
              className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            {/* Forms Button */}
            <button
              onClick={() => setShowFormsPanel(!showFormsPanel)}
              disabled={disabled}
              className={`p-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                showFormsPanel
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
              title="Send forms and documents"
            >
              <FileText className="h-5 w-5" />
            </button>
          </div>

          {/* Text Input */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Type your message...${patientName ? ` to ${patientName}` : ''}`}
              disabled={disabled}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>

          {/* Right Side: Send Buttons */}
          <div className="flex gap-2">
            {/* Send Button */}
            <button
              onClick={onSend}
              disabled={disabled || isEmpty}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-600 disabled:hover:to-purple-600 flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all"
            >
              <Send className="h-4 w-4" />
              <span>Send</span>
            </button>

            {/* Send & Close Button */}
            <button
              onClick={onSendAndClose}
              disabled={disabled || isEmpty}
              className="px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm hover:shadow transition-all"
              title="Send and close conversation (Cmd+Enter)"
            >
              <Send className="h-4 w-4" />
              <span>Send & Close</span>
            </button>
          </div>
        </div>
      </div>

      {/* Form Preview Modal */}
      {previewingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{previewingForm.name}</h3>
                <p className="text-sm text-gray-600 mt-0.5">{previewingForm.description}</p>
              </div>
              <button
                onClick={() => setPreviewingForm(null)}
                className="p-2 hover:bg-white/70 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(80vh-180px)]">
              {/* Form Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {previewingForm.estimatedTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Completion time:</span>
                      <span className="font-medium text-gray-900">{previewingForm.estimatedTime}</span>
                    </div>
                  )}
                  {previewingForm.validFor && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Valid for:</span>
                      <span className="font-medium text-gray-900">{previewingForm.validFor}</span>
                    </div>
                  )}
                  {previewingForm.fields?.includes('signature') && (
                    <div className="flex items-center gap-2">
                      <FileSignature className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">E-Signature required</span>
                    </div>
                  )}
                  {previewingForm.requiredFor && (
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Required for:</span>
                      <span className="font-medium text-gray-900">{previewingForm.requiredFor.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Content */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  {previewingForm.previewContent?.title || 'Form Preview'}
                </h4>

                {previewingForm.previewContent?.sections && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">This form includes the following sections:</p>
                    <div className="space-y-2">
                      {previewingForm.previewContent.sections.map((section: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <span className="text-sm text-gray-700">{section}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {previewingForm.previewContent?.instructions && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Instructions included:</p>
                    <ul className="space-y-2">
                      {previewingForm.previewContent.instructions.map((instruction: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-indigo-600 mt-0.5">•</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Patient will receive a secure link to complete this form
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewingForm(null)}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleSendForm(previewingForm)}
                  className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send to Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
