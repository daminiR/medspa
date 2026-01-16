/**
 * PreviewModal Component
 *
 * Modal for previewing automated message templates with sample data.
 * Shows SMS in phone mockup and email in email mockup with realistic styling.
 */

'use client'

import React from 'react'
import { X, Smartphone, Mail } from 'lucide-react'

export type MessageType = 'sms' | 'email'

export interface MessageTemplate {
  id?: string
  name: string
  type: MessageType
  subject?: string // Email only
  content: string
  timing?: string
}

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  template: MessageTemplate
  messageType: MessageType
}

// Sample data for variable replacement
const SAMPLE_DATA: Record<string, string> = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  fullName: 'Sarah Johnson',
  patient_name: 'Sarah',
  appointmentDate: 'Tuesday, Jan 14 at 2:00 PM',
  appointment_date: 'Tuesday, Jan 14',
  appointment_time: '2:00 PM',
  serviceName: 'Botox Treatment',
  service_name: 'Botox Treatment',
  providerName: 'Dr. Smith',
  provider_name: 'Dr. Smith',
  clinicName: 'Luxe Medical Spa',
  clinic_name: 'Luxe Medical Spa',
  clinicPhone: '(555) 123-4567',
  clinic_phone: '(555) 123-4567',
  confirmLink: 'https://luxespa.com/confirm',
  rescheduleLink: 'https://luxespa.com/reschedule',
  bookingLink: 'https://luxespa.com/book',
}

/**
 * Replace template variables with sample values
 * Supports both {{variable}} and {variable} syntax
 */
function replaceVariables(text: string): string {
  let result = text

  // Replace {{variable}} format
  Object.entries(SAMPLE_DATA).forEach(([key, value]) => {
    const regex1 = new RegExp(`\\{\\{${key}\\}\\}`, 'g')
    const regex2 = new RegExp(`\\{${key}\\}`, 'g')
    result = result.replace(regex1, value)
    result = result.replace(regex2, value)
  })

  return result
}

export default function PreviewModal({
  isOpen,
  onClose,
  template,
  messageType,
}: PreviewModalProps) {
  if (!isOpen) return null

  const previewContent = replaceVariables(template.content)
  const previewSubject = template.subject ? replaceVariables(template.subject) : ''

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                messageType === 'sms' ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                {messageType === 'sms' ? (
                  <Smartphone className="h-5 w-5 text-green-600" />
                ) : (
                  <Mail className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Message Preview</h3>
                <p className="text-sm text-gray-500">
                  {messageType === 'sms' ? 'SMS Message' : 'Email Message'} with sample data
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Preview Content */}
          <div className="p-6">
            {messageType === 'sms' ? (
              <SMSPreview content={previewContent} />
            ) : (
              <EmailPreview subject={previewSubject} content={previewContent} />
            )}

            {/* Template Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Template Information</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Name:</span> {template.name}</p>
                {template.timing && (
                  <p><span className="font-medium">Timing:</span> {template.timing}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Variables shown with sample data. Actual messages will use real patient and appointment information.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * SMS Phone Mockup
 */
function SMSPreview({ content }: { content: string }) {
  const now = new Date()
  const timeString = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return (
    <div className="flex justify-center">
      {/* Phone Frame */}
      <div className="w-full max-w-sm">
        <div className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
          {/* Phone Notch */}
          <div className="bg-black rounded-[2rem] overflow-hidden">
            {/* Status Bar */}
            <div className="bg-gray-100 px-6 py-2 flex items-center justify-between text-xs">
              <span className="font-medium">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-3 border border-gray-400 rounded-sm relative">
                  <div className="absolute inset-0.5 bg-gray-400 rounded-sm"></div>
                </div>
              </div>
            </div>

            {/* Messages Header */}
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  LS
                </div>
                <div>
                  <p className="font-semibold text-sm">Luxe Medical Spa</p>
                  <p className="text-xs text-gray-500">(555) 123-4567</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="bg-white px-4 py-6 min-h-[400px] max-h-[500px] overflow-y-auto">
              {/* Received Message Bubble */}
              <div className="flex justify-start mb-4">
                <div className="max-w-[85%]">
                  <div className="bg-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                      {content}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-2">{timeString}</p>
                </div>
              </div>
            </div>

            {/* Message Input (disabled) */}
            <div className="bg-gray-100 border-t border-gray-200 px-4 py-2">
              <div className="bg-white rounded-full px-4 py-2 flex items-center gap-2 border border-gray-300">
                <span className="text-sm text-gray-400">iMessage</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Email Mockup
 */
function EmailPreview({ subject, content }: { subject: string; content: string }) {
  const now = new Date()
  const dateString = now.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      {/* Email Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
              LS
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm text-gray-900">Luxe Medical Spa</p>
                <span className="text-xs text-gray-500">&lt;noreply@luxespa.com&gt;</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                to me
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 whitespace-nowrap ml-2">{dateString}</p>
        </div>

        {/* Subject Line */}
        {subject && (
          <div className="mt-2">
            <p className="text-base font-semibold text-gray-900">{subject}</p>
          </div>
        )}
      </div>

      {/* Email Body */}
      <div className="bg-white px-6 py-5">
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap break-words leading-relaxed">
            {content}
          </p>
        </div>

        {/* Email Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            This email was sent from Luxe Medical Spa
          </p>
          <p className="text-xs text-gray-400 mt-1">
            123 Main Street, Suite 100 | (555) 123-4567
          </p>
        </div>
      </div>
    </div>
  )
}
