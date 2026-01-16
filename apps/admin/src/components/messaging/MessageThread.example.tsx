/**
 * MessageThread Component - Usage Example
 *
 * This file demonstrates how to use the MessageThread component
 * in your messaging interface.
 */

'use client'

import React, { useState } from 'react'
import MessageThread from './MessageThread'

// Example usage in a messaging page
export default function MessageThreadExample() {
  const [conversation] = useState({
    id: 'conv-1',
    patientId: 'p-1',
    patientName: 'Sarah Johnson',
    patientPhone: '+1 (555) 123-4567',
    lastMessage: 'Thank you for the reminder!',
    lastMessageAt: new Date(),
    unreadCount: 0,
    status: 'active' as const,
    channel: 'sms' as const,
    tags: ['vip'],
    metadata: {
      lastAppointment: 'Botox - 2 days ago',
      nextAppointment: 'Follow-up - Next Tuesday 2:00 PM'
    }
  })

  const [messages] = useState([
    {
      id: 1,
      sender: 'clinic' as const,
      text: 'Hi Sarah! Your follow-up appointment is confirmed for Tuesday at 2:00 PM.',
      time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'delivered' as const,
      channel: 'sms' as const,
      type: 'automated' as const
    },
    {
      id: 2,
      sender: 'patient' as const,
      text: 'Great! Should I avoid anything before coming in?',
      time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'delivered' as const,
      channel: 'sms' as const,
      type: 'manual' as const
    },
    {
      id: 3,
      sender: 'clinic' as const,
      text: 'Just avoid any blood thinners and alcohol 24 hours before. Also, please arrive with a clean face.',
      time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'delivered' as const,
      channel: 'sms' as const,
      type: 'manual' as const
    },
    {
      id: 4,
      sender: 'patient' as const,
      text: 'Thank you for the reminder!',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'delivered' as const,
      channel: 'sms' as const,
      type: 'manual' as const
    }
  ])

  const handleSendMessage = (text: string) => {
    console.log('Sending message:', text)
    // In a real app, you would:
    // 1. Call your API to send the message
    // 2. Update the messages state with the new message
    // 3. Handle any errors
  }

  const handleCloseConversation = () => {
    console.log('Closing conversation')
    // In a real app, you would:
    // 1. Update conversation status to 'resolved'
    // 2. Remove from active conversations list
    // 3. Show success notification
  }

  const handleSnoozeConversation = (duration: string) => {
    console.log('Snoozing conversation for:', duration)
    // In a real app, you would:
    // 1. Calculate snooze until time
    // 2. Update conversation with snooze timestamp
    // 3. Hide from active list until time
    // 4. Show notification when snoozed conversation returns
  }

  // Create patient object from conversation for MessageThread
  const patient = {
    id: conversation.patientId,
    name: conversation.patientName,
    initials: conversation.patientName.split(' ').map(n => n[0]).join(''),
    phone: conversation.patientPhone,
    email: '', // Not provided in this example
    lastAppointment: conversation.metadata.lastAppointment,
    nextAppointment: conversation.metadata.nextAppointment,
    smsOptIn: true,
    preferredChannel: conversation.channel as 'sms' | 'email'
  }

  return (
    <div className="h-screen flex">
      <MessageThread
        messages={messages}
        patient={patient}
      />
    </div>
  )
}

/**
 * INTEGRATION NOTES:
 *
 * 1. Props:
 *    - conversation: The active conversation object or null for empty state
 *    - messages: Array of messages to display in chronological order
 *    - onSendMessage: Callback when user sends a message (receives message text)
 *    - onCloseConversation: Callback when user closes the conversation
 *    - onSnoozeConversation: Callback when user snoozes (receives duration string)
 *    - isTyping: Optional boolean to show typing indicator
 *
 * 2. Message Status Flow:
 *    - 'queued': Message is queued for sending
 *    - 'sending': Currently being sent
 *    - 'sent': Successfully sent to carrier
 *    - 'delivered': Delivered to patient's device
 *    - 'read': Patient has read the message
 *    - 'failed': Message failed to send
 *
 * 3. Conversation Channels:
 *    - 'sms': SMS text messaging (shows green badge)
 *    - 'email': Email messaging (shows blue badge)
 *    - 'portal': Patient portal messaging (shows purple badge)
 *
 * 4. Message Types:
 *    - 'automated': Automatically sent (appointment reminders, etc)
 *    - 'manual': Manually sent by staff
 *    - 'system': System-generated messages
 *
 * 5. Metadata Fields:
 *    - lastAppointment: String describing last appointment
 *    - nextAppointment: String describing next appointment
 *    - These are displayed in the collapsible patient info strip
 *
 * 6. Features:
 *    - Auto-scrolls to bottom when new messages arrive
 *    - Date separators between different days
 *    - Collapsible patient info strip with appointment details
 *    - Action buttons: Call, Email, Calendar, More menu
 *    - Snooze options: 1 hour, 4 hours, until tomorrow
 *    - Empty state when no conversation selected
 *    - Typing indicator support
 *    - Message delivery status indicators
 *    - Channel badges (SMS Active, Email, Portal)
 *
 * 7. Styling:
 *    - Uses Tailwind CSS
 *    - Gradient purple/indigo theme for clinic messages
 *    - Professional spacing and shadows
 *    - Responsive design
 *    - Matches existing admin platform design
 */
