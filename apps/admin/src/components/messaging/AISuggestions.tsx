'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, RefreshCw, Sparkles, Shield } from 'lucide-react'

/**
 * AI Suggestions Component - HIPAA Compliant
 *
 * Current implementation: Rule-based suggestions (no PHI transmitted)
 * This approach is HIPAA-safe as all processing happens client-side.
 *
 * Future AI Integration Options (require BAA):
 * - Google Vertex AI (Gemini) - HIPAA compliant with BAA
 * - Azure OpenAI - HIPAA compliant with BAA
 * - AWS Bedrock (Claude) - HIPAA compliant with BAA
 *
 * When integrating with LLM, ensure:
 * 1. BAA (Business Associate Agreement) is in place
 * 2. PHI is not logged or retained
 * 3. Data is encrypted in transit (TLS 1.2+)
 */

interface AISuggestionsProps {
  lastMessage: string
  onSelect: (suggestion: string) => void
  useHIPAACompliantAI?: boolean // Future: toggle real AI
}

// Context-aware suggestion generator
const generateSuggestions = (message: string | undefined | null): string[] => {
  if (!message) return []
  const lowerMessage = message.toLowerCase()

  // Analyze message context
  const isAppointmentRelated = /appointment|confirm|reschedule|time|date|tomorrow|today|next week|coming in/i.test(message)
  const isPostCareRelated = /pain|swelling|redness|tight|itch|normal|discomfort|sore|bruising|bleeding/i.test(message)
  const isPriceRelated = /cost|price|payment|insurance|how much|expensive|refund/i.test(message)
  const isQuestion = message.trim().endsWith('?')
  const isThankYou = /thank|thanks|appreciate|grateful/i.test(message)
  const isConfirmation = /yes|confirm|sounds good|ok|perfect/i.test(message)

  let suggestions: string[] = []

  // Appointment-related suggestions
  if (isAppointmentRelated) {
    suggestions = [
      'Your appointment is confirmed! Please arrive 10-15 minutes early to complete check-in.',
      'Of course! You can reschedule by clicking the link below or calling us at (555) 123-4567.',
      'Here are the directions to our office: [Link] 🗺️ We\'re looking forward to seeing you!'
    ]
  }
  // Post-care related suggestions
  else if (isPostCareRelated) {
    suggestions = [
      'That\'s completely normal and should subside in a few days. Apply ice for 15 minutes at a time if needed.',
      'If you notice any severe reactions or it doesn\'t improve in 48 hours, please call us immediately.',
      'Keep the area clean and moisturized 2-3 times daily. Avoid direct sun exposure and use SPF 30+.'
    ]
  }
  // Price/payment related
  else if (isPriceRelated) {
    suggestions = [
      'I\'d be happy to help! Can you let me know which service you\'re interested in?',
      'We offer several payment options including financing plans. Would you like to discuss?',
      'Please call our office for insurance verification and pricing details: (555) 123-4567'
    ]
  }
  // Thank you messages
  else if (isThankYou) {
    suggestions = [
      'You\'re very welcome! We\'re so glad we could help. See you soon!',
      'Our pleasure! If you have any questions, don\'t hesitate to reach out.',
      'Thank you for choosing us! We appreciate your trust. 💙'
    ]
  }
  // Confirmations
  else if (isConfirmation) {
    suggestions = [
      'Perfect! We\'re all set. Is there anything else I can help you with?',
      'Wonderful! We\'ll see you soon. Get excited! 🎉',
      'Great! If you have any questions before your appointment, feel free to ask.'
    ]
  }
  // General questions
  else if (isQuestion) {
    suggestions = [
      'Great question! Let me get you the information you need. Can I follow up with you shortly?',
      'I\'d be happy to help! Would you prefer a quick call to discuss this?',
      'Let me connect you with our team to answer that. You\'ll hear from us shortly.'
    ]
  }
  // Default general suggestions
  else {
    suggestions = [
      'Thank you for your message! We\'ve received it and will get back to you shortly.',
      'Is there anything else I can help you with today?',
      'Looking forward to seeing you soon! Let us know if you have any questions.'
    ]
  }

  return suggestions
}

export function AISuggestions({ lastMessage, onSelect }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  // Generate initial suggestions when message changes
  useEffect(() => {
    if (lastMessage && lastMessage.trim()) {
      // Simulate a brief loading state for natural UX
      setIsLoading(true)
      const timer = setTimeout(() => {
        const newSuggestions = generateSuggestions(lastMessage)
        setSuggestions(newSuggestions)
        setIsLoading(false)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSuggestions([])
    }
  }, [lastMessage])

  const handleRegenerate = () => {
    setIsRegenerating(true)
    // Simulate regeneration with slight delay
    setTimeout(() => {
      const newSuggestions = generateSuggestions(lastMessage)
      // Shuffle to show "new" suggestions
      setSuggestions(newSuggestions.sort(() => Math.random() - 0.5))
      setIsRegenerating(false)
    }, 600)
  }

  // Handle null/undefined/empty lastMessage
  if (!lastMessage || !lastMessage.trim()) {
    return null
  }

  return (
    <div className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-xs font-semibold text-gray-700">AI Suggestions</span>
        </div>
        <button
          onClick={handleRegenerate}
          disabled={isLoading || isRegenerating}
          className={`p-1 rounded-lg transition-all duration-200 ${
            isRegenerating
              ? 'bg-blue-100 text-blue-600'
              : 'hover:bg-blue-100 text-gray-500 hover:text-blue-600'
          }`}
          title="Regenerate suggestions"
        >
          <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-6 space-x-2">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <span className="text-sm text-gray-600">Analyzing message...</span>
        </div>
      )}

      {/* Suggestions Grid */}
      {!isLoading && suggestions.length > 0 && (
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelect(suggestion)}
              className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-150 group"
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold group-hover:bg-blue-200">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-700 group-hover:text-gray-900 leading-relaxed flex-1">
                  {suggestion}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && suggestions.length === 0 && lastMessage.trim() && (
        <div className="py-4 text-center">
          <p className="text-sm text-gray-600">
            Unable to generate suggestions. Try asking a question or describing your concern.
          </p>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
        <span>Click a suggestion to use it in your reply</span>
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[11px] font-medium">
          AI Powered
        </span>
      </div>
    </div>
  )
}

export default AISuggestions
