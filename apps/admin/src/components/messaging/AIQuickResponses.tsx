/**
 * AI Quick Responses Component
 *
 * Displays AI-generated response suggestions with one-click send.
 * Shows urgency indicators and confidence scores.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useAIResponses, AIResponse, AIAnalysis } from '@/hooks/useAIResponses';
import {
  Sparkles,
  Check,
  RefreshCw,
  AlertTriangle,
  Clock,
  Zap,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Send,
  User,
} from 'lucide-react';

interface AIQuickResponsesProps {
  conversationId: string;
  onSend: (text: string) => Promise<void>;
  onInsert: (text: string) => void;
  staffId?: string;
}

export function AIQuickResponses({
  conversationId,
  onSend,
  onInsert,
  staffId,
}: AIQuickResponsesProps) {
  const {
    aiData,
    isLoading,
    error,
    isConfigured,
    markAsUsed,
    markAsEdited,
  } = useAIResponses({ conversationId });

  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Handle quick send (one-click)
  const handleQuickSend = useCallback(async (response: AIResponse) => {
    setSendingId(response.id);
    try {
      await onSend(response.text);
      await markAsUsed(response.id, staffId);
      setSentId(response.id);
      setTimeout(() => setSentId(null), 3000);
    } catch (err) {
      console.error('Send failed:', err);
    } finally {
      setSendingId(null);
    }
  }, [onSend, markAsUsed, staffId]);

  // Handle insert into composer
  const handleInsert = useCallback((response: AIResponse) => {
    onInsert(response.text);
  }, [onInsert]);

  // Not configured - show nothing
  if (!isConfigured) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="border-t border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-3">
        <div className="flex items-center gap-2 text-sm text-purple-700">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>AI analyzing message...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return null; // Silently fail - don't block the UI
  }

  // No data
  if (!aiData) {
    return null;
  }

  const { analysis, responses, contextSummary, processingTimeMs } = aiData;

  return (
    <div className="border-t border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-purple-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-900">AI Suggestions</span>
          <UrgencyBadge urgency={analysis.urgency} />
          {analysis.requiresHuman && (
            <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
              <AlertTriangle className="h-3 w-3" />
              Review needed
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <span className="text-xs">{processingTimeMs}ms</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {/* Context indicators */}
          {(contextSummary.inCriticalPeriod || contextSummary.isVIP) && (
            <div className="flex gap-2 mb-2">
              {contextSummary.inCriticalPeriod && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Post-treatment monitoring
                </span>
              )}
              {contextSummary.isVIP && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <User className="h-3 w-3" />
                  VIP Patient
                </span>
              )}
            </div>
          )}

          {/* Response options */}
          <div className="space-y-2">
            {responses.map((response, index) => (
              <ResponseOption
                key={response.id}
                response={response}
                index={index}
                isSending={sendingId === response.id}
                isSent={sentId === response.id}
                onSend={() => handleQuickSend(response)}
                onInsert={() => handleInsert(response)}
              />
            ))}
          </div>

          {/* Intent info */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-1 border-t border-gray-200/50">
            <span>
              Intent: <span className="font-medium">{formatIntent(analysis.intent)}</span>
              {' · '}
              Sentiment: <span className="font-medium">{analysis.sentiment.toLowerCase()}</span>
            </span>
            {analysis.riskFactors.length > 0 && (
              <span className="text-amber-600">
                {analysis.riskFactors.length} risk factor{analysis.riskFactors.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ Sub-components ============

function UrgencyBadge({ urgency }: { urgency: AIAnalysis['urgency'] }) {
  const config = {
    CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: AlertCircle },
    HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: AlertTriangle },
    MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', icon: Clock },
    LOW: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: Zap },
  };

  const { bg, text, border, icon: Icon } = config[urgency];

  return (
    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${bg} ${text} ${border}`}>
      <Icon className="h-3 w-3" />
      {urgency}
    </span>
  );
}

function ResponseOption({
  response,
  index,
  isSending,
  isSent,
  onSend,
  onInsert,
}: {
  response: AIResponse;
  index: number;
  isSending: boolean;
  isSent: boolean;
  onSend: () => void;
  onInsert: () => void;
}) {
  const confidenceColor = response.confidence >= 0.9
    ? 'text-green-600'
    : response.confidence >= 0.7
    ? 'text-blue-600'
    : 'text-gray-500';

  return (
    <div
      className={`flex items-start gap-2 p-2 rounded-lg border transition-all ${
        isSent
          ? 'bg-green-50 border-green-300'
          : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm'
      }`}
    >
      {/* Confidence indicator */}
      <div className="flex-shrink-0 w-10 pt-0.5 text-center">
        <span className={`text-xs font-semibold ${confidenceColor}`}>
          {Math.round(response.confidence * 100)}%
        </span>
      </div>

      {/* Response text - clickable to insert */}
      <div
        className="flex-1 text-sm text-gray-700 cursor-pointer hover:text-gray-900"
        onClick={onInsert}
        title="Click to insert into composer"
      >
        {response.text}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {/* Character count */}
        <span className={`text-xs ${response.characterCount > 160 ? 'text-red-500' : 'text-gray-400'}`}>
          {response.characterCount}
        </span>

        {/* Copy button */}
        <button
          onClick={() => {
            navigator.clipboard.writeText(response.text);
          }}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
          title="Copy to clipboard"
        >
          <Copy className="h-4 w-4" />
        </button>

        {/* Send button */}
        <button
          onClick={onSend}
          disabled={isSending}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
            isSent
              ? 'bg-green-500 text-white'
              : isSending
              ? 'bg-gray-300 text-gray-500 cursor-wait'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
          title={index === 0 ? 'Best match - click to send' : 'Click to send'}
        >
          {isSent ? (
            <>
              <Check className="h-4 w-4" />
              Sent
            </>
          ) : isSending ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              <Send className="h-3 w-3" />
              Send
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ============ Helpers ============

function formatIntent(intent: string): string {
  return intent
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export default AIQuickResponses;
