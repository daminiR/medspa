/**
 * INTEGRATION EXAMPLE
 * This file shows how to integrate the AISuggestions component into the Messages page
 */

import { useState } from 'react'
import { AISuggestions } from './AISuggestions'

/**
 * Example 1: Basic Integration in Message Input Section
 * Add this inside your message input area
 */
export function ExampleBasicIntegration() {
  const [messageText, setMessageText] = useState('')
  const currentMessages: { text: string }[] = [] // Your messages array
  const lastPatientMessage = currentMessages.length > 0
    ? currentMessages[currentMessages.length - 1]?.text
    : ''

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      {/* Message Input */}
      <div className="flex items-end space-x-3 mb-3">
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type an SMS message..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={1}
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Send SMS
        </button>
      </div>

      {/* AI Suggestions - NEW! */}
      <AISuggestions
        lastMessage={lastPatientMessage}
        onSelect={(suggestion) => setMessageText(suggestion)}
      />

      {/* Quick Replies (optional, can keep alongside AI suggestions) */}
      <div className="mt-3">
        {/* Your existing quick replies section */}
      </div>
    </div>
  )
}

/**
 * Example 2: Integration in Messages Page /app/messages/page.tsx
 * This shows where to add the component in the actual messages page
 */
export function ExampleMessagesPageIntegration() {
  // Example state - replace with your actual state
  const [messageText, setMessageText] = useState('')
  const currentMessages: Array<{ text?: string }> = []
  // Inside your MessagesPage component, around line 867 (where Message Input section is):

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      {/* Forms Panel (shows above input when active) */}
      {/* ... existing forms panel code ... */}

      <div className="flex items-end space-x-3">
        {/* ... existing buttons and textarea ... */}
      </div>

      {/* Add AI Suggestions here - NEW ADDITION */}
      {/* This should replace or be placed above the existing Quick Responses section */}
      <AISuggestions
        lastMessage={
          currentMessages && currentMessages.length > 0
            ? currentMessages[currentMessages.length - 1]?.text || ''
            : ''
        }
        onSelect={(suggestion) => setMessageText(suggestion)}
      />

      {/* Optional: Keep quick replies below if desired */}
      {/* Your existing Quick Responses section */}
    </div>
  )
}

/**
 * Example 3: Extracting last patient message (not clinic message)
 * Helper function to get only patient messages
 */
export function getLastPatientMessage(messages: any[]) {
  if (!messages || messages.length === 0) return ''

  // Find the last message from the patient (sender === 'patient')
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].sender === 'patient') {
      return messages[i].text
    }
  }

  return ''
}

/**
 * Example 4: Advanced - Show/Hide AI Suggestions based on conditions
 */
export function ExampleConditionalDisplay() {
  const [messageText, setMessageText] = 'your-message-state'
  const currentMessages = []
  const selectedPatient = null // Your selected patient

  const lastPatientMessage = getLastPatientMessage(currentMessages)
  const shouldShowAISuggestions =
    lastPatientMessage.trim().length > 0 && selectedPatient

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      {/* Message Input */}
      <div className="flex items-end space-x-3 mb-3">
        {/* ... your input code ... */}
      </div>

      {/* AI Suggestions - Only show if there's a patient message */}
      {shouldShowAISuggestions && (
        <AISuggestions
          lastMessage={lastPatientMessage}
          onSelect={(suggestion) => setMessageText(suggestion)}
        />
      )}
    </div>
  )
}

/**
 * Example 5: Using the getLastPatientMessage helper
 */
export function ExampleWithHelper() {
  const [messageText, setMessageText] = 'your-message-state'
  const conversations = [] // Your conversations data
  const selectedConversation = 1 // Selected conversation ID

  const selectedConv = conversations.find((c) => c.id === selectedConversation)
  const currentMessages = selectedConv?.messages || []

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      {/* Message Input */}
      <div className="flex items-end space-x-3 mb-3">
        {/* ... your input code ... */}
      </div>

      {/* AI Suggestions using helper function */}
      <AISuggestions
        lastMessage={getLastPatientMessage(currentMessages)}
        onSelect={(suggestion) => setMessageText(suggestion)}
      />
    </div>
  )
}

/**
 * Quick Implementation Checklist:
 *
 * 1. Import the component at the top of your messages page:
 *    import { AISuggestions } from '@/components/messaging/AISuggestions'
 *
 * 2. Find your message input section (around line 867 in the current messages page)
 *
 * 3. Add the AISuggestions component after your textarea/input but before or after quick replies:
 *    <AISuggestions
 *      lastMessage={lastPatientMessage}
 *      onSelect={(suggestion) => setMessageText(suggestion)}
 *    />
 *
 * 4. Make sure you have the correct lastMessage state:
 *    - Should be the text of the last patient message
 *    - Use getLastPatientMessage helper if filtering from mixed clinic/patient messages
 *
 * 5. Test with different message types:
 *    - "Can I reschedule my appointment?" (appointment related)
 *    - "Is the swelling normal?" (post-care related)
 *    - "How much is the treatment?" (pricing)
 *    - Any question? (general question)
 *    - "Thank you so much!" (gratitude)
 *
 * 6. Click suggestions to populate the message input
 *
 * That's it! The component is self-contained and handles all its own state.
 */
