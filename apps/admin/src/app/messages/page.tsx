'use client'

import React, { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { useConversations } from '@/hooks/useConversations'
import { useQuickReplies } from '@/hooks/useQuickReplies'
import { useCommandPalette } from '@/components/messaging/CommandPalette'
import ConversationList, { type ConversationFilter } from '@/components/messaging/ConversationList'
import MessageThread from '@/components/messaging/MessageThread'
import MessageComposer from '@/components/messaging/MessageComposer'
import PatientContextSidebar from '@/components/messaging/PatientContextSidebar'
import SnoozeModal from '@/components/messaging/SnoozeModal'
import ConsentBanner from '@/components/messaging/ConsentBanner'
import OptOutDetector from '@/components/messaging/OptOutDetector'
import { Clock, CheckCheck, Star, MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  // State management hooks
  const conversations = useConversations()
  const { quickReplies, trackUsage } = useQuickReplies()

  // Local state
  const [selectedQuickReplyCategory, setSelectedQuickReplyCategory] = useState('appointment')
  const [showSnoozeModal, setShowSnoozeModal] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)

  // Command palette for keyboard shortcuts
  const commands = [
    {
      id: 'close',
      name: 'Close conversation',
      icon: <CheckCheck className="h-4 w-4" />,
      action: () => conversations.selectedId && conversations.closeConversation(conversations.selectedId),
      shortcut: 'C',
    },
    {
      id: 'snooze',
      name: 'Snooze conversation',
      icon: <Clock className="h-4 w-4" />,
      action: () => setShowSnoozeModal(true),
      shortcut: 'S',
    },
    {
      id: 'star',
      name: 'Star conversation',
      icon: <Star className="h-4 w-4" />,
      action: () => conversations.selectedId && conversations.toggleStar(conversations.selectedId),
      shortcut: '*',
    },
  ]

  const palette = useCommandPalette(commands)

  // Handle sending message
  const handleSendMessage = async (message: string, closeAfterSend?: boolean) => {
    if (!conversations.selectedId) return

    setSendingMessage(true)
    try {
      // Call the API to send SMS
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: conversations.selectedConversation?.patient.phone,
          message,
          patientId: conversations.selectedConversation?.patient.id,
          type: 'manual'
        })
      })

      if (response.ok) {
        // Update conversation with new message
        conversations.sendMessage(conversations.selectedId, message)

        // Close if requested
        if (closeAfterSend && conversations.selectedId) {
          conversations.closeConversation(conversations.selectedId)
        }
      } else {
        console.error('Failed to send message')
        alert('Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error sending message. Please check your connection.')
    } finally {
      setSendingMessage(false)
    }
  }

  // Handle quick reply selection
  const handleQuickReplySelect = (reply: string) => {
    // Track usage if it's not a local/default reply
    const replyRecord = quickReplies[selectedQuickReplyCategory]?.find((r: string) => r === reply)
    if (replyRecord) {
      // In production, you would track usage here
    }
  }

  // Handle snooze
  const handleSnooze = (until: Date) => {
    if (conversations.selectedId) {
      conversations.snoozeConversation(conversations.selectedId, until)
      setShowSnoozeModal(false)
    }
  }

  // Handle close conversation
  const handleCloseConversation = () => {
    if (conversations.selectedId) {
      conversations.closeConversation(conversations.selectedId)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Command Palette */}
      <palette.CommandPalette />

      {/* Snooze Modal */}
      <SnoozeModal
        isOpen={showSnoozeModal}
        onClose={() => setShowSnoozeModal(false)}
        onSnooze={handleSnooze}
      />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-[1800px] mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">Manage patient communications and SMS messaging</p>
        </div>
      </div>

      {/* Main Three-Column Layout */}
      <div className="max-w-[1800px] mx-auto" style={{ height: 'calc(100vh - 140px)' }}>
        <div className="flex h-full bg-white shadow-lg">
          {/* Left Column: Conversation List */}
          <ConversationList
            conversations={conversations.conversations}
            selectedId={conversations.selectedId}
            onSelect={(id) => {
              conversations.setSelectedId(id)
              // Mark as read when selected
              conversations.markAsRead(id)
            }}
            filter={(conversations.filters.status as ConversationFilter) || 'all'}
            onFilterChange={(status) => conversations.setFilters({ ...conversations.filters, status })}
            searchQuery={conversations.filters.search || ''}
            onSearchChange={(search) => conversations.setFilters({ ...conversations.filters, search })}
          />

          {/* Center Column: Message Thread + Composer */}
          {conversations.selectedConversation ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Consent Banner - Compact */}
              <ConsentBanner
                patientId={conversations.selectedConversation.patient.id}
                consentStatus={{
                  transactional: conversations.selectedConversation.patient.smsOptIn ?? true,
                  marketing: conversations.selectedConversation.patient.smsOptIn ?? false,
                  consentGivenAt: conversations.selectedConversation.patient.smsOptIn ? new Date() : undefined,
                }}
              />

              {/* Opt-out Detection - Hidden unless detected */}
              <OptOutDetector
                messages={conversations.selectedConversation.messages.filter(m => m.sender === 'patient')}
                patientId={conversations.selectedConversation.patient.id}
                patientName={conversations.selectedConversation.patient.name}
                onOptOutDetected={async (keyword, type) => {
                  console.log(`[TCPA Compliance] Processing opt-out, keyword: ${keyword}, type: ${type}`)
                  alert(`Patient has opted out via "${keyword}". Their SMS preferences have been updated.`)
                }}
                onReviewRequired={(keyword) => {
                  console.log(`[TCPA Review] Informal opt-out detected: "${keyword}"`)
                }}
                onOptOutProcessed={() => {}}
              />

              {/* Message Thread - Takes most of the space */}
              <MessageThread
                messages={conversations.selectedConversation.messages}
                patient={conversations.selectedConversation.patient}
                onRetryMessage={(messageId) => {
                  if (conversations.selectedId) {
                    conversations.retryMessage(conversations.selectedId, messageId)
                  }
                }}
              />

              {/* Message Composer - Compact, expands on focus */}
              <MessageComposer
                patient={conversations.selectedConversation.patient}
                onSendMessage={handleSendMessage}
                quickReplies={quickReplies}
                onQuickReplySelect={handleQuickReplySelect}
                selectedQuickReplyCategory={selectedQuickReplyCategory}
                onSelectQuickReplyCategory={setSelectedQuickReplyCategory}
                lastMessage={conversations.selectedConversation.lastMessage}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-1">Select a conversation</p>
                <p className="text-sm text-gray-500">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}

          {/* Right Column: Patient Context Sidebar */}
          {conversations.selectedConversation && (
            <PatientContextSidebar
              patient={conversations.selectedConversation.patient}
              onClose={handleCloseConversation}
              onSnooze={() => setShowSnoozeModal(true)}
              conversationStatus={conversations.selectedConversation.status}
            />
          )}
        </div>
      </div>
    </div>
  )
}
