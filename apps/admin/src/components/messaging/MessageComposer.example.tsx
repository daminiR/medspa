/**
 * MessageComposer Usage Example
 *
 * This file demonstrates how to integrate the MessageComposer component
 * into your messaging interface.
 */

'use client'

import React, { useState } from 'react'
import MessageComposer from '@/components/messaging/MessageComposerV2'

export default function MessageComposerExample() {
  const [messageText, setMessageText] = useState('')

  // Example quick replies structure
  const quickReplies = {
    appointment: [
      'Your appointment is confirmed! Please arrive 10-15 minutes early.',
      'We can reschedule your appointment. What day works best for you?',
      'Your appointment is coming up! Looking forward to seeing you.'
    ],
    postCare: [
      'That\'s completely normal and should subside in a few days.',
      'Apply ice for 15 minutes at a time if needed.',
      'Please call us if symptoms worsen or don\'t improve in 48 hours.'
    ],
    general: [
      'Thank you for your message! We\'ll get back to you shortly.',
      'Is there anything else I can help you with today?',
      'We\'re here to help! Feel free to reach out anytime.'
    ],
    reminders: [
      'This is a friendly reminder about your appointment tomorrow at 2:00 PM.',
      'Please remember to arrive with a clean face and avoid blood thinners.',
      'We\'re looking forward to seeing you! Reply CONFIRM to confirm your appointment.'
    ]
  }

  // Example AI suggestions (would typically come from an AI service)
  const aiSuggestions = [
    'Your appointment is confirmed for tomorrow at 2:00 PM. Please arrive 10 minutes early.',
    'That\'s a great question! Let me check with our team and get back to you shortly.',
    'Thank you for reaching out! We\'re happy to help with your concerns.'
  ]

  const handleSend = () => {
    if (messageText.trim()) {
      console.log('Sending message:', messageText)
      // Here you would typically call your API to send the message

      // Clear the input after sending
      setMessageText('')
    }
  }

  const handleSendAndClose = () => {
    if (messageText.trim()) {
      console.log('Sending message and closing:', messageText)
      // Here you would typically:
      // 1. Send the message via API
      // 2. Close the conversation/thread
      // 3. Navigate back or mark as resolved

      // Clear the input
      setMessageText('')
    }
  }

  const handleAttach = () => {
    console.log('Opening file picker...')
    // Here you would typically open a file picker or attachment modal
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          MessageComposer Component Demo
        </h1>

        {/* Example conversation area (mock) */}
        <div className="bg-white rounded-lg shadow-sm mb-4 p-6">
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Patient:</strong> Hi, I have an appointment tomorrow. Is it normal for my skin to feel tight after the chemical peel yesterday?
            </p>
          </div>
          <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-indigo-800">
              <strong>You:</strong> Yes, that's completely normal! Tightness is expected after a chemical peel.
            </p>
          </div>
        </div>

        {/* MessageComposer Component */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <MessageComposer
            value={messageText}
            onChange={setMessageText}
            onSend={handleSend}
            onSendAndClose={handleSendAndClose}
            onAttach={handleAttach}
            quickReplies={quickReplies}
            aiSuggestions={aiSuggestions}
            disabled={false}
            patientName="Sarah Johnson"
          />
        </div>

        {/* Usage Instructions */}
        <div className="mt-6 p-6 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Usage Instructions</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><strong>Enter:</strong> Send message</li>
            <li><strong>Shift + Enter:</strong> New line in message</li>
            <li><strong>Cmd/Ctrl + Enter:</strong> Send and close conversation</li>
            <li><strong>\ or #:</strong> Quick access to quick replies</li>
            <li><strong>Attachment button:</strong> Attach files/images</li>
            <li><strong>Forms button:</strong> Send consent forms or post-care instructions</li>
          </ul>

          <div className="mt-4 pt-4 border-t border-gray-300">
            <h3 className="font-semibold text-gray-900 mb-2">Features</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>✓ AI-powered reply suggestions</li>
              <li>✓ Quick reply templates by category</li>
              <li>✓ Forms panel with preview functionality</li>
              <li>✓ SMS character counter with segment tracking</li>
              <li>✓ Auto-resize textarea</li>
              <li>✓ Keyboard shortcuts</li>
              <li>✓ Professional gradient buttons</li>
              <li>✓ HIPAA-compliant design patterns</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
