'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  X,
  Edit3,
  Star,
  Clock,
  MessageCircle,
  Mail,
  MessageSquare,
  AlertTriangle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Import the Conversation type and helpers from the hook to ensure consistency
import type { Conversation, AutoCloseSettings } from '@/hooks/useConversations'
import { isAboutToAutoClose } from '@/hooks/useConversations'

export type ConversationFilter = 'all' | 'conversations' | 'automated' | 'unread' | 'open' | 'snoozed' | 'closed'

export interface ConversationListProps {
  conversations: Conversation[]
  selectedId: number | null
  onSelect: (id: number) => void
  filter: ConversationFilter
  onFilterChange: (filter: ConversationFilter) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange
}: ConversationListProps) {
  const [focusedIndex, setFocusedIndex] = useState<number>(0)
  const [autoCloseSettings, setAutoCloseSettings] = useState<AutoCloseSettings>({ days: 7 })

  // Load auto-close settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('autoCloseInactivity')
    if (stored === 'never') {
      setAutoCloseSettings({ days: 'never' })
    } else if (stored) {
      setAutoCloseSettings({ days: parseInt(stored) })
    }
  }, [])

  // Filter conversations based on selected filter and search query
  const filteredConversations = useMemo(() => {
    let filtered = conversations

    // Apply unified inbox filters
    if (filter === 'conversations') {
      // Show only conversations with manual (non-automated) messages
      filtered = filtered.filter(c =>
        c.messages.some(m => m.type === 'manual')
      )
    } else if (filter === 'automated') {
      // Show only conversations with automated messages (and no manual follow-ups)
      filtered = filtered.filter(c =>
        c.messages.every(m => m.type === 'automated' || m.type === 'system')
      )
    } else if (filter === 'unread') {
      // Show only conversations with unread messages
      filtered = filtered.filter(c => c.unreadCount > 0)
    } else if (filter === 'open' || filter === 'snoozed' || filter === 'closed') {
      // Legacy status filters
      filtered = filtered.filter(c => c.status === filter)
    }
    // 'all' shows everything

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        c =>
          c.patient.name.toLowerCase().includes(query) ||
          c.lastMessage.toLowerCase().includes(query) ||
          c.patient.phone.includes(query)
      )
    }

    // Sort by most recent first
    return filtered.sort(
      (a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
    )
  }, [conversations, filter, searchQuery])

  // Calculate counts for each filter tab
  const counts = useMemo(() => {
    return {
      all: conversations.length,
      conversations: conversations.filter(c => c.messages.some(m => m.type === 'manual')).length,
      automated: conversations.filter(c => c.messages.every(m => m.type === 'automated' || m.type === 'system')).length,
      unread: conversations.filter(c => c.unreadCount > 0).length,
      open: conversations.filter(c => c.status === 'open').length,
      snoozed: conversations.filter(c => c.status === 'snoozed').length,
      closed: conversations.filter(c => c.status === 'closed').length
    }
  }, [conversations])

  // Total unread count
  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations]
  )

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!filteredConversations.length) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex(prev =>
            prev < filteredConversations.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredConversations[focusedIndex]) {
            onSelect(filteredConversations[focusedIndex].id)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [filteredConversations, focusedIndex, onSelect])

  // Update focused index when filtered list changes
  useEffect(() => {
    if (focusedIndex >= filteredConversations.length) {
      setFocusedIndex(Math.max(0, filteredConversations.length - 1))
    }
  }, [filteredConversations.length, focusedIndex])

  // Check if appointment is today or tomorrow (urgent)
  const isUrgent = (conversation: Conversation): boolean => {
    return (
      conversation.patient.nextAppointment?.includes('Today') ||
      conversation.patient.nextAppointment?.includes('Tomorrow') ||
      false
    )
  }

  return (
    <div className="w-96 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          <div className="flex items-center gap-2">
            {totalUnread > 0 && (
              <span className="h-6 px-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                {totalUnread}
              </span>
            )}
            <button
              className="p-2 hover:bg-indigo-50 rounded-lg transition-colors text-indigo-600"
              title="New conversation"
            >
              <Edit3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-col gap-1.5">
          {/* Primary Filters - Unified Inbox */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            {(['all', 'conversations', 'automated', 'unread'] as const).map(filterType => (
              <button
                key={filterType}
                onClick={() => onFilterChange(filterType)}
                className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all relative ${
                  filter === filterType
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {filterType === 'all' && 'All'}
                {filterType === 'conversations' && 'Conversations'}
                {filterType === 'automated' && 'Automated'}
                {filterType === 'unread' && 'Unread'}
                {counts[filterType] > 0 && filter !== filterType && (
                  <span className="ml-1 text-[10px] text-gray-500">
                    ({counts[filterType]})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Secondary Status Filters */}
          <div className="flex gap-1 p-1 bg-gray-50 rounded-lg border border-gray-200">
            {(['open', 'snoozed', 'closed'] as const).map(filterType => (
              <button
                key={filterType}
                onClick={() => onFilterChange(filterType)}
                className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-all relative ${
                  filter === filterType
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {filterType === 'open' && 'Open'}
                {filterType === 'snoozed' && 'Snoozed'}
                {filterType === 'closed' && 'Closed'}
                {counts[filterType] > 0 && filter !== filterType && (
                  <span className="ml-1 text-[10px]">
                    ({counts[filterType]})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          // Empty State
          <div className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              No conversations found
            </p>
            <p className="text-xs text-gray-500 mb-3">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : `No ${filter === 'all' ? '' : filter} conversations`}
            </p>
            {(searchQuery || filter !== 'all') && (
              <button
                onClick={() => {
                  onSearchChange('')
                  onFilterChange('all')
                }}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          // Conversation Tiles
          filteredConversations.map((conversation, index) => {
            const isSelected = selectedId === conversation.id
            const isFocused = focusedIndex === index
            const isUnread = conversation.unreadCount > 0
            const urgent = isUrgent(conversation)
            const aboutToAutoClose = isAboutToAutoClose(conversation, autoCloseSettings)
            // Get the channel from the most recent message (default to 'sms')
            const channel = conversation.messages[conversation.messages.length - 1]?.channel || 'sms'

            return (
              <div
                key={conversation.id}
                onClick={() => onSelect(conversation.id)}
                className={`px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all relative ${
                  isSelected
                    ? 'bg-indigo-50 border-l-4 border-l-indigo-600'
                    : isUnread
                    ? 'bg-indigo-50/30 border-l-4 border-l-indigo-400'
                    : 'border-l-4 border-l-transparent'
                } ${isFocused ? 'ring-2 ring-indigo-500 ring-inset' : ''}`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0 relative">
                    <div
                      className={`w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm ${
                        isUnread ? 'ring-2 ring-indigo-400 ring-offset-2' : ''
                      }`}
                    >
                      {conversation.patient.initials}
                    </div>

                    {/* Channel indicator */}
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 border-white ${
                        channel === 'sms'
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      }`}
                    >
                      {channel === 'sms' ? (
                        <MessageCircle className="h-2 w-2 text-white fill-white" />
                      ) : (
                        <Mail className="h-2 w-2 text-white" />
                      )}
                    </div>

                    {/* Unread dot */}
                    {isUnread && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Name and time */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <p
                          className={`text-sm truncate ${
                            isUnread
                              ? 'font-bold text-gray-900'
                              : 'font-semibold text-gray-900'
                          }`}
                        >
                          {conversation.patient.name}
                        </p>
                        {conversation.starred && (
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p
                          className={`text-xs whitespace-nowrap ${
                            isUnread
                              ? 'text-indigo-700 font-medium'
                              : 'text-gray-500'
                          }`}
                        >
                          {formatDistanceToNow(conversation.lastMessageTime, {
                            addSuffix: true
                          }).replace('about ', '')}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="h-5 min-w-[20px] px-1.5 bg-indigo-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Message preview */}
                    <p
                      className={`text-xs leading-relaxed truncate mb-1.5 ${
                        isUnread
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-600'
                      }`}
                    >
                      {conversation.lastMessage}
                    </p>

                    {/* Status indicators */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {urgent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-semibold rounded-full">
                          <Clock className="h-2.5 w-2.5" />
                          Appt{' '}
                          {conversation.patient.nextAppointment?.includes(
                            'Today'
                          )
                            ? 'Today'
                            : 'Tomorrow'}
                        </span>
                      )}
                      {aboutToAutoClose && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded-full">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          Closing soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default ConversationList
