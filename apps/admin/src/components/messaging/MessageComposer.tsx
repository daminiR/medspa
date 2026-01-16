/**
 * MessageComposer Component (Compact Redesign)
 *
 * Minimal-height message input (~100-120px collapsed) with:
 * - AI suggestions as inline chips above input (single row, 32-40px)
 * - Quick replies in a searchable popover (triggered by toolbar button)
 * - Auto-expanding textarea (max-height: 50vh)
 * - Send and Send & Close buttons with keyboard shortcuts
 */

'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import {
  Send,
  Paperclip,
  FileText,
  Loader2,
  CheckCheck,
  Sparkles,
  MessageSquareText,
  Search,
  Settings,
  X,
  ChevronDown,
} from 'lucide-react'
import type { ConversationPatient as Patient } from '@/hooks/useConversations'
import SMSCharacterCounter from './SMSCharacterCounter'

interface MessageComposerProps {
  patient: Patient
  onSendMessage: (message: string, closeAfterSend?: boolean) => Promise<void>
  quickReplies: Record<string, string[]>
  onQuickReplySelect: (reply: string) => void
  selectedQuickReplyCategory: string
  onSelectQuickReplyCategory: (category: string) => void
  lastMessage?: string
}

// Compact AI suggestion generator (same logic as AISuggestions but returns shorter chips)
const generateCompactSuggestions = (message: string | undefined | null): string[] => {
  if (!message) return []

  const isAppointmentRelated = /appointment|confirm|reschedule|time|date|tomorrow|today|next week|coming in/i.test(message)
  const isPostCareRelated = /pain|swelling|redness|tight|itch|normal|discomfort|sore|bruising|bleeding/i.test(message)
  const isPriceRelated = /cost|price|payment|insurance|how much|expensive|refund/i.test(message)
  const isThankYou = /thank|thanks|appreciate|grateful/i.test(message)
  const isConfirmation = /yes|confirm|sounds good|ok|perfect/i.test(message)
  const isQuestion = message.trim().endsWith('?')

  // Return shorter chip-friendly suggestions
  if (isAppointmentRelated) {
    return [
      'Appointment confirmed! Arrive 15 min early.',
      'Sure! Click link to reschedule or call us.',
      'Directions: [Link] See you soon!',
    ]
  }
  if (isPostCareRelated) {
    return [
      'Normal - apply ice 15 min if needed.',
      'Call us if no improvement in 48 hrs.',
      'Keep clean, moisturize, use SPF 30+.',
    ]
  }
  if (isPriceRelated) {
    return [
      'Which service interests you?',
      'We offer financing plans!',
      'Call for pricing: (555) 123-4567',
    ]
  }
  if (isThankYou) {
    return [
      "You're welcome! See you soon!",
      'Our pleasure! Reach out anytime.',
      'Thank you for choosing us!',
    ]
  }
  if (isConfirmation) {
    return [
      'Perfect! Anything else I can help with?',
      "Wonderful! We'll see you soon!",
      'Great! Questions before your visit?',
    ]
  }
  if (isQuestion) {
    return [
      "I'll get you that info shortly.",
      'Would a quick call help?',
      "I'll connect you with our team.",
    ]
  }
  return [
    "Thanks! We'll get back to you shortly.",
    'Anything else I can help with?',
    'Looking forward to seeing you!',
  ]
}

export default function MessageComposer({
  patient,
  onSendMessage,
  quickReplies,
  onQuickReplySelect,
  selectedQuickReplyCategory,
  onSelectQuickReplyCategory,
  lastMessage = '',
}: MessageComposerProps) {
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showQuickRepliesPopover, setShowQuickRepliesPopover] = useState(false)
  const [quickReplySearch, setQuickReplySearch] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const quickReplyButtonRef = useRef<HTMLButtonElement>(null)

  // AI suggestions as chips
  const aiSuggestions = useMemo(() => {
    if (!lastMessage?.trim()) return []
    return generateCompactSuggestions(lastMessage).slice(0, 3)
  }, [lastMessage])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      const maxHeight = window.innerHeight * 0.5 // 50vh
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`
    }
  }, [messageText])

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        quickReplyButtonRef.current &&
        !quickReplyButtonRef.current.contains(e.target as Node)
      ) {
        setShowQuickRepliesPopover(false)
      }
    }
    if (showQuickRepliesPopover) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showQuickRepliesPopover])

  // Filter quick replies by search
  const filteredQuickReplies = useMemo(() => {
    const currentReplies = quickReplies[selectedQuickReplyCategory] || []
    if (!quickReplySearch.trim()) return currentReplies
    const search = quickReplySearch.toLowerCase()
    return currentReplies.filter((reply) => reply.toLowerCase().includes(search))
  }, [quickReplies, selectedQuickReplyCategory, quickReplySearch])

  const handleSendMessage = async (closeAfterSend = false) => {
    if (!messageText.trim() || sendingMessage) return
    setSendingMessage(true)
    try {
      await onSendMessage(messageText, closeAfterSend)
      setMessageText('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSendingMessage(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSendMessage(true)
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(false)
    }
  }

  const handleAISuggestionClick = (suggestion: string) => {
    setMessageText(suggestion)
    textareaRef.current?.focus()
  }

  const handleQuickReplyClick = (reply: string) => {
    onQuickReplySelect(reply)
    setMessageText(reply)
    setShowQuickRepliesPopover(false)
    setQuickReplySearch('')
    textareaRef.current?.focus()
  }

  const formatCategoryName = (category: string) => {
    if (category === 'postCare') return 'Post-Care'
    if (category === 'smsReminderTemplates') return 'Reminders'
    return category.charAt(0).toUpperCase() + category.slice(1)
  }

  return (
    <div className="bg-white border-t border-gray-200">
      {/* AI Suggestions Row - Single line of chips (32-40px) */}
      {aiSuggestions.length > 0 && (
        <div className="px-4 py-1.5 flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 overflow-x-auto">
          <Sparkles className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
          {aiSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleAISuggestionClick(suggestion)}
              className="px-2.5 py-1 text-xs bg-white border border-blue-200 rounded-full text-gray-700 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-700 transition-colors whitespace-nowrap flex-shrink-0 max-w-[200px] truncate"
              title={suggestion}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Compact Input Area */}
      <div className="px-4 py-2">
        <div className="flex items-end gap-1.5">
          {/* Toolbar Buttons */}
          <div className="flex items-center gap-0.5 pb-1">
            {/* Attachment Button */}
            <button
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-gray-700"
              title="Attach file"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            {/* Forms Button */}
            <button
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-gray-700"
              title="Send forms"
            >
              <FileText className="h-4 w-4" />
            </button>

            {/* Quick Replies Button */}
            <div className="relative">
              <button
                ref={quickReplyButtonRef}
                onClick={() => setShowQuickRepliesPopover(!showQuickRepliesPopover)}
                className={`p-1.5 rounded-md transition-colors ${
                  showQuickRepliesPopover
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                }`}
                title="Quick replies (saved responses)"
              >
                <MessageSquareText className="h-4 w-4" />
              </button>

              {/* Quick Replies Popover */}
              {showQuickRepliesPopover && (
                <div
                  ref={popoverRef}
                  className="absolute bottom-full left-0 mb-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[400px] flex flex-col"
                >
                  {/* Popover Header */}
                  <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">Quick Replies</span>
                    <div className="flex items-center gap-1">
                      <a
                        href="/settings/quick-replies"
                        className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-indigo-600 transition-colors"
                        title="Manage quick replies"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => setShowQuickRepliesPopover(false)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="px-3 py-2 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search replies..."
                        value={quickReplySearch}
                        onChange={(e) => setQuickReplySearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="px-3 py-2 border-b border-gray-100 flex flex-wrap gap-1">
                    {Object.keys(quickReplies).map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          onSelectQuickReplyCategory(category)
                          setQuickReplySearch('')
                        }}
                        className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                          selectedQuickReplyCategory === category
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {formatCategoryName(category)}
                      </button>
                    ))}
                  </div>

                  {/* Quick Reply List */}
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredQuickReplies.length > 0 ? (
                      filteredQuickReplies.map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickReplyClick(reply)}
                          className="w-full text-left px-2.5 py-2 text-sm text-gray-700 rounded-md hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                        >
                          <span className="line-clamp-2">{reply}</span>
                        </button>
                      ))
                    ) : (
                      <div className="py-4 text-center text-sm text-gray-500">
                        {quickReplySearch
                          ? 'No matching replies found'
                          : 'No quick replies in this category'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Text Input - Compact with auto-expand */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm leading-5"
              rows={1}
              style={{ minHeight: '38px', maxHeight: '50vh' }}
            />
          </div>

          {/* Send Buttons */}
          <div className="flex items-center gap-1 pb-1">
            <button
              onClick={() => handleSendMessage(false)}
              disabled={!messageText.trim() || sendingMessage}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm font-medium transition-colors"
              title="Send (Enter)"
            >
              {sendingMessage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Send</span>
            </button>

            <button
              onClick={() => handleSendMessage(true)}
              disabled={!messageText.trim() || sendingMessage}
              className="px-2.5 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm font-medium transition-colors"
              title="Send & Close (Cmd+Enter)"
            >
              <CheckCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* Footer: Character counter and keyboard hints */}
        <div className="mt-1.5 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Enter</kbd> send
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Cmd+Enter</kbd> send & close
            </span>
          </div>
          <div className="scale-90 origin-right">
            <SMSCharacterCounter text={messageText} />
          </div>
        </div>
      </div>
    </div>
  )
}
