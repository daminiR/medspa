/**
 * MessageThread Component
 *
 * Center column showing message history for the selected conversation.
 * Displays messages with date separators, status indicators, and auto-scrolling.
 */

'use client'

import React, { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { MessageCircle, Bot, Sparkles } from 'lucide-react'
import type { Message, ConversationPatient } from '@/hooks/useConversations'
import MessageStatus from './MessageStatus'

interface MessageThreadProps {
  messages: Message[]
  patient: ConversationPatient
  onRetryMessage?: (messageId: number) => void
}

export default function MessageThread({ messages, patient, onRetryMessage }: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900 mb-1">
            No messages yet
          </p>
          <p className="text-xs text-gray-500">
            Start the conversation by sending a message
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-3 bg-gray-50">
      {messages.map((message, index) => {
        const isClinic = message.sender === 'clinic'
        const isAutomated = message.type === 'automated' || message.type === 'system'
        const showDate = index === 0 ||
          format(message.time, 'MMM d, yyyy') !== format(messages[index - 1].time, 'MMM d, yyyy')

        return (
          <div key={message.id}>
            {/* Date separator */}
            {showDate && (
              <div className="flex items-center justify-center my-4">
                <div className="px-3 py-1 bg-white rounded-full text-xs text-gray-500 shadow-sm border border-gray-200">
                  {format(message.time, 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
            )}

            {/* Message bubble */}
            <div className={`flex items-end gap-2 ${isClinic ? 'justify-end' : 'justify-start'}`}>
              {/* Patient avatar on left */}
              {!isClinic && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-sm">
                  {patient.initials}
                </div>
              )}

              <div className={`max-w-md ${isClinic ? 'items-end' : 'items-start'} flex flex-col`}>
                {/* Automated message type indicator */}
                {isClinic && isAutomated && (
                  <div className="flex items-center gap-1 mb-1 px-1">
                    <Bot className="h-3 w-3 text-indigo-400" />
                    <span className="text-xs text-indigo-600 font-medium">Automated</span>
                  </div>
                )}

                {/* Message content */}
                <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                  isClinic
                    ? isAutomated
                      ? 'bg-gradient-to-br from-indigo-400 to-indigo-500 text-white rounded-br-sm border-2 border-indigo-300'
                      : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>

                {/* Timestamp and status */}
                <div className={`flex items-center gap-1.5 mt-1 px-1 ${
                  isClinic ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <span className="text-xs text-gray-500">
                    {format(message.time, 'h:mm a')}
                  </span>
                  {message.channel === 'sms' && (
                    <MessageCircle className="h-3 w-3 text-green-500" />
                  )}
                  {isClinic && isAutomated && (
                    <Sparkles className="h-3 w-3 text-indigo-400" />
                  )}
                  {isClinic && (
                    <MessageStatus
                      status={message.status as 'queued' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed'}
                      timestamp={message.time}
                      onRetry={message.status === 'failed' && onRetryMessage ? () => onRetryMessage(message.id) : undefined}
                    />
                  )}
                </div>
              </div>

              {/* Clinic avatar on right */}
              {isClinic && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-sm ${
                  isAutomated
                    ? 'bg-gradient-to-br from-indigo-400 to-indigo-500'
                    : 'bg-gradient-to-br from-indigo-600 to-purple-600'
                }`}>
                  {isAutomated ? <Bot className="h-4 w-4" /> : 'CS'}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Scroll anchor for auto-scroll to bottom */}
      <div ref={messagesEndRef} />
    </div>
  )
}
