/**
 * QuickRepliesPopover Component
 *
 * An on-demand popover for quick reply selection in the messaging interface.
 * Replaces the always-visible quick replies section with a sleek, keyboard-accessible popover.
 *
 * Features:
 * - Search filtering across all categories
 * - Category tabs/pills for organization
 * - Recently used replies at top
 * - Full keyboard navigation (arrows, enter, escape)
 * - Trigger via button or `/` keyboard shortcut
 * - Link to quick replies settings
 *
 * @see /src/app/settings/quick-replies/page.tsx - Quick reply management
 * @see /src/hooks/useQuickReplies.ts - Quick replies data hook
 */

'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  Zap,
  Search,
  X,
  Settings,
  Clock,
  MessageSquare,
  Calendar,
  Heart,
  Bell,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

interface QuickRepliesPopoverProps {
  /** Quick replies organized by category */
  quickReplies: Record<string, string[]>
  /** Callback when a reply is selected */
  onSelect: (reply: string) => void
  /** Whether the popover is currently open */
  isOpen: boolean
  /** Callback to close the popover */
  onClose: () => void
}

interface ReplyItem {
  content: string
  category: string
  index: number
}

// Category display configuration
const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
  appointment: { label: 'Appointment', icon: <Calendar className="h-3.5 w-3.5" /> },
  postCare: { label: 'Post-Care', icon: <Heart className="h-3.5 w-3.5" /> },
  general: { label: 'General', icon: <MessageSquare className="h-3.5 w-3.5" /> },
  smsReminderTemplates: { label: 'Reminders', icon: <Bell className="h-3.5 w-3.5" /> },
}

// LocalStorage key for tracking recently used replies
const RECENT_REPLIES_KEY = 'quickReplies_recentlyUsed'
const MAX_RECENT_REPLIES = 5

export default function QuickRepliesPopover({
  quickReplies,
  onSelect,
  isOpen,
  onClose,
}: QuickRepliesPopoverProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | 'all' | 'recent'>('all')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentReplies, setRecentReplies] = useState<string[]>([])

  const popoverRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Load recent replies from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_REPLIES_KEY)
      if (stored) {
        setRecentReplies(JSON.parse(stored))
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [])

  // Focus search input when popover opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setSelectedCategory('all')
      setSelectedIndex(0)
      // Small delay to ensure popover is rendered
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 10)
    }
  }, [isOpen])

  // Get all categories from quickReplies
  const categories = useMemo(() => {
    return Object.keys(quickReplies)
  }, [quickReplies])

  // Get category display info
  const getCategoryInfo = useCallback((category: string) => {
    return CATEGORY_CONFIG[category] || {
      label: category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' '),
      icon: <MessageSquare className="h-3.5 w-3.5" />,
    }
  }, [])

  // Flatten all replies for searching and display
  const allReplies = useMemo((): ReplyItem[] => {
    const replies: ReplyItem[] = []
    Object.entries(quickReplies).forEach(([category, categoryReplies]) => {
      categoryReplies.forEach((content, index) => {
        replies.push({ content, category, index })
      })
    })
    return replies
  }, [quickReplies])

  // Filter replies based on search and category
  const filteredReplies = useMemo((): ReplyItem[] => {
    let replies: ReplyItem[] = []

    // Handle "recent" pseudo-category
    if (selectedCategory === 'recent') {
      replies = recentReplies
        .map((content) => {
          // Find the original category for this reply
          for (const [category, categoryReplies] of Object.entries(quickReplies)) {
            const index = categoryReplies.indexOf(content)
            if (index !== -1) {
              return { content, category, index }
            }
          }
          // If not found in any category, still show it
          return { content, category: 'recent', index: 0 }
        })
        .filter((item) => item.content) // Filter out empty
    } else if (selectedCategory === 'all') {
      replies = allReplies
    } else {
      replies = allReplies.filter((reply) => reply.category === selectedCategory)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      replies = replies.filter((reply) =>
        reply.content.toLowerCase().includes(query)
      )
    }

    return replies
  }, [selectedCategory, allReplies, recentReplies, quickReplies, searchQuery])

  // Reset selected index when filtered replies change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredReplies])

  // Handle reply selection
  const handleSelectReply = useCallback((reply: ReplyItem) => {
    // Track this reply as recently used
    const updatedRecent = [
      reply.content,
      ...recentReplies.filter((r) => r !== reply.content),
    ].slice(0, MAX_RECENT_REPLIES)

    setRecentReplies(updatedRecent)
    try {
      localStorage.setItem(RECENT_REPLIES_KEY, JSON.stringify(updatedRecent))
    } catch {
      // Ignore localStorage errors
    }

    onSelect(reply.content)
    onClose()
  }, [recentReplies, onSelect, onClose])

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault()
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < filteredReplies.length - 1 ? prev + 1 : prev
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredReplies[selectedIndex]) {
            handleSelectReply(filteredReplies[selectedIndex])
          }
          break
        case 'Tab':
          // Allow tab to cycle through categories
          e.preventDefault()
          const allCats = ['all', 'recent', ...categories]
          const currentIdx = allCats.indexOf(selectedCategory as string)
          const nextIdx = e.shiftKey
            ? (currentIdx - 1 + allCats.length) % allCats.length
            : (currentIdx + 1) % allCats.length
          setSelectedCategory(allCats[nextIdx] as 'all' | 'recent' | string)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredReplies, categories, selectedCategory, handleSelectReply, onClose])

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [selectedIndex])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    // Delay adding listener to prevent immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={popoverRef}
      className="absolute bottom-full left-0 mb-2 w-[360px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{ maxHeight: '400px' }}
    >
      {/* Header with Search */}
      <div className="p-3 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-gray-900">Quick Replies</h3>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/settings/quick-replies"
              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Manage quick replies"
              onClick={onClose}
            >
              <Settings className="h-4 w-4" />
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search replies..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-white"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-3 py-2 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-wrap gap-1.5">
          {/* All Tab */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All
          </button>

          {/* Recent Tab */}
          {recentReplies.length > 0 && (
            <button
              onClick={() => setSelectedCategory('recent')}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1 ${
                selectedCategory === 'recent'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Clock className="h-3 w-3" />
              Recent
            </button>
          )}

          {/* Category Tabs */}
          {categories.map((category) => {
            const { label, icon } = getCategoryInfo(category)
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all flex items-center gap-1 ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {icon}
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Replies List */}
      <div
        ref={listRef}
        className="overflow-y-auto"
        style={{ maxHeight: '260px' }}
      >
        {filteredReplies.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {searchQuery
                ? `No replies found for "${searchQuery}"`
                : selectedCategory === 'recent'
                ? 'No recently used replies'
                : 'No replies in this category'}
            </p>
            <Link
              href="/settings/quick-replies"
              className="inline-flex items-center gap-1 mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              onClick={onClose}
            >
              Add quick replies
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        ) : (
          <div className="py-1">
            {filteredReplies.map((reply, index) => {
              const { label, icon } = getCategoryInfo(reply.category)
              const isSelected = index === selectedIndex

              return (
                <button
                  key={`${reply.category}-${reply.index}-${index}`}
                  data-index={index}
                  onClick={() => handleSelectReply(reply)}
                  className={`w-full px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 border-l-2 border-indigo-600'
                      : 'hover:bg-gray-50 border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {/* Category Icon */}
                    <div
                      className={`flex-shrink-0 mt-0.5 ${
                        isSelected ? 'text-indigo-600' : 'text-gray-400'
                      }`}
                    >
                      {icon}
                    </div>

                    {/* Reply Content */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-relaxed ${
                          isSelected ? 'text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        {reply.content.length > 120
                          ? reply.content.substring(0, 120) + '...'
                          : reply.content}
                      </p>
                      {/* Category Badge (only show in "all" or "recent" view) */}
                      {(selectedCategory === 'all' || selectedCategory === 'recent') && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded">
                          {label}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer with Keyboard Hints */}
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/80">
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-mono shadow-sm">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-mono shadow-sm">
                Enter
              </kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-mono shadow-sm">
                Tab
              </kbd>
              Categories
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-mono shadow-sm">
              Esc
            </kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * QuickRepliesButton Component
 *
 * Trigger button for opening the QuickRepliesPopover.
 * Can be placed in the message composer toolbar.
 */
interface QuickRepliesButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
}

export function QuickRepliesButton({
  onClick,
  isActive = false,
  disabled = false,
}: QuickRepliesButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
        isActive
          ? 'bg-indigo-100 text-indigo-600'
          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
      }`}
      title="Quick replies (/ or \)"
    >
      <Zap className="h-5 w-5" />
    </button>
  )
}

/**
 * useQuickRepliesPopover Hook
 *
 * Provides state management and keyboard shortcut handling for the popover.
 * Use this hook in the message composer to integrate the popover.
 *
 * @example
 * ```tsx
 * const { isOpen, open, close, PopoverButton } = useQuickRepliesPopover()
 *
 * return (
 *   <div className="relative">
 *     <PopoverButton />
 *     <QuickRepliesPopover
 *       quickReplies={quickReplies}
 *       onSelect={handleSelectReply}
 *       isOpen={isOpen}
 *       onClose={close}
 *     />
 *   </div>
 * )
 * ```
 */
export function useQuickRepliesPopover(composerRef?: React.RefObject<HTMLTextAreaElement>) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the composer is focused (if ref provided)
      if (composerRef?.current) {
        const isComposerFocused = document.activeElement === composerRef.current
        if (!isComposerFocused) return
      }

      // Trigger on `/` or `\` when text area is empty or at start
      if ((e.key === '/' || e.key === '\\') && !isOpen) {
        const target = e.target as HTMLTextAreaElement
        if (target.tagName === 'TEXTAREA' && target.value === '') {
          e.preventDefault()
          setIsOpen(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, composerRef])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])

  const PopoverButton = useCallback(
    ({ disabled }: { disabled?: boolean }) => (
      <QuickRepliesButton onClick={open} isActive={isOpen} disabled={disabled} />
    ),
    [open, isOpen]
  )

  return {
    isOpen,
    open,
    close,
    PopoverButton,
  }
}
