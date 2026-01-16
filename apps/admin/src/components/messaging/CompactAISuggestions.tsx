'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Sparkles, ChevronRight } from 'lucide-react'

interface CompactAISuggestionsProps {
  lastMessage: string
  onSelect: (suggestion: string) => void
}

// Keywords that trigger showing suggestions
const TRIGGER_KEYWORDS = [
  'schedule', 'scheduling', 'appointment', 'book', 'booking',
  'price', 'pricing', 'cost', 'how much', 'payment',
  'help', 'question', 'wondering', 'can you', 'could you',
  'reschedule', 'cancel', 'change', 'available', 'availability',
  'pain', 'swelling', 'normal', 'worried', 'concern'
]

// Context-aware compact suggestion generator
const generateCompactSuggestions = (message: string | undefined | null): string[] => {
  if (!message) return []
  const lowerMessage = message.toLowerCase()

  // Analyze message context
  const isAppointmentRelated = /appointment|confirm|reschedule|time|date|tomorrow|today|next week|coming in|book|schedule|available/i.test(message)
  const isPostCareRelated = /pain|swelling|redness|tight|itch|normal|discomfort|sore|bruising|bleeding|worried/i.test(message)
  const isPriceRelated = /cost|price|payment|insurance|how much|expensive|refund|financing/i.test(message)
  const isQuestion = message.trim().endsWith('?')
  const isThankYou = /thank|thanks|appreciate|grateful/i.test(message)
  const isConfirmation = /yes|confirm|sounds good|ok|perfect|great/i.test(message)

  // Generate shorter, more concise suggestions for compact display
  if (isAppointmentRelated) {
    return [
      "Your appointment is confirmed! Please arrive 10-15 min early.",
      "You can reschedule online or call us at (555) 123-4567.",
      "We have availability this week. Would you like to book?"
    ]
  }

  if (isPostCareRelated) {
    return [
      "That's completely normal and should subside in a few days.",
      "Apply ice for 15 min at a time if you're experiencing discomfort.",
      "If symptoms persist beyond 48 hours, please call us."
    ]
  }

  if (isPriceRelated) {
    return [
      "I'd be happy to help with pricing! Which service interests you?",
      "We offer flexible payment plans. Would you like details?",
      "Please call us for a personalized quote: (555) 123-4567"
    ]
  }

  if (isThankYou) {
    return [
      "You're welcome! Let us know if you need anything else.",
      "Our pleasure! We're here if you have questions.",
      "Thank you for choosing us! See you soon."
    ]
  }

  if (isConfirmation) {
    return [
      "Perfect! Is there anything else I can help with?",
      "Great! We'll see you soon.",
      "Wonderful! Feel free to reach out if questions come up."
    ]
  }

  if (isQuestion) {
    return [
      "Great question! Let me get you that information.",
      "I'd be happy to help! Would you prefer a quick call?",
      "Let me connect you with our team for that."
    ]
  }

  // Default suggestions
  return [
    "Thank you for your message! We'll get back to you shortly.",
    "Is there anything else I can help you with today?",
    "Looking forward to seeing you soon!"
  ]
}

// Check if suggestions should be shown based on message content
const shouldShowSuggestions = (message: string | undefined | null): boolean => {
  if (!message || !message.trim()) return false

  const trimmedMessage = message.trim()

  // Show if message ends with question mark
  if (trimmedMessage.endsWith('?')) return true

  // Show if message contains trigger keywords
  const lowerMessage = trimmedMessage.toLowerCase()
  return TRIGGER_KEYWORDS.some(keyword => lowerMessage.includes(keyword))
}

// Truncate text with ellipsis
const truncateText = (text: string, maxLength: number = 30): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

export function CompactAISuggestions({ lastMessage, onSelect }: CompactAISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showAll, setShowAll] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Generate suggestions when message changes
  useEffect(() => {
    if (shouldShowSuggestions(lastMessage)) {
      // Brief delay for natural UX
      const timer = setTimeout(() => {
        const newSuggestions = generateCompactSuggestions(lastMessage)
        setSuggestions(newSuggestions)
        setIsVisible(true)
        setShowAll(false)
      }, 150)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
      setSuggestions([])
    }
  }, [lastMessage])

  // Handle Tab key to accept first suggestion
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Tab' && isVisible && suggestions.length > 0) {
      // Only capture Tab if the component is focused or suggestions are visible
      const activeElement = document.activeElement
      const isInComposer = activeElement?.closest('[data-messaging-composer]')

      if (isInComposer) {
        e.preventDefault()
        onSelect(suggestions[0])
      }
    }
  }, [isVisible, suggestions, onSelect])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Don't render if not visible or no suggestions
  if (!isVisible || suggestions.length === 0) {
    return null
  }

  const visibleSuggestions = showAll ? suggestions : suggestions.slice(0, 3)
  const remainingCount = suggestions.length - 3

  return (
    <div
      className="flex items-center gap-2 py-1.5 px-1 overflow-x-auto scrollbar-hide"
      style={{ maxHeight: '40px' }}
      role="listbox"
      aria-label="AI Suggestions"
    >
      {/* Suggestions chips */}
      {visibleSuggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5
            rounded-full text-xs font-medium
            transition-all duration-150 ease-in-out
            whitespace-nowrap flex-shrink-0
            ${hoveredIndex === index
              ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
              : 'bg-gray-100 text-gray-700 border-gray-200'
            }
            border hover:bg-indigo-100 hover:text-indigo-700 hover:border-indigo-300
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1
          `}
          title={suggestion}
          role="option"
          aria-selected={hoveredIndex === index}
        >
          {/* Sparkle icon - visible on hover */}
          <Sparkles
            className={`h-3 w-3 transition-opacity duration-150 ${
              hoveredIndex === index ? 'opacity-100 text-indigo-500' : 'opacity-0 w-0'
            }`}
          />
          <span>{truncateText(suggestion)}</span>
        </button>
      ))}

      {/* Show more button */}
      {!showAll && remainingCount > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="
            inline-flex items-center gap-1 px-2.5 py-1.5
            rounded-full text-xs font-medium
            bg-gray-50 text-gray-500 border border-gray-200
            hover:bg-gray-100 hover:text-gray-700
            transition-all duration-150 ease-in-out
            whitespace-nowrap flex-shrink-0
            focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1
          "
        >
          <span>+{remainingCount} more</span>
          <ChevronRight className="h-3 w-3" />
        </button>
      )}

      {/* Keyboard hint - shows briefly */}
      <span className="text-[10px] text-gray-400 ml-1 whitespace-nowrap flex-shrink-0 hidden sm:inline">
        <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[10px] font-mono">Tab</kbd> to accept
      </span>
    </div>
  )
}

export default CompactAISuggestions
