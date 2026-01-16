/**
 * useAIResponses Hook
 *
 * React hook for subscribing to AI-generated response suggestions.
 * Uses Firestore real-time updates for instant UI refresh.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFirebaseApp } from '@/lib/firebase';
import {
  subscribeToLatestAIResponse,
  updateAIResponseOutcome,
  StoredAIResponse,
} from '@/lib/firestore/ai-responses';

export interface AIResponse {
  id: string;
  text: string;
  confidence: number;
  characterCount: number;
}

export interface AIAnalysis {
  intent: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  sentiment: string;
  requiresHuman: boolean;
  riskFactors: string[];
}

export interface AIResponseData {
  messageId: string;
  patientId: string;
  patientName: string;
  analysis: AIAnalysis;
  responses: AIResponse[];
  contextSummary: {
    hasRecentTreatment: boolean;
    inCriticalPeriod: boolean;
    isVIP: boolean;
    hasUpcomingAppointment: boolean;
  };
  generatedAt: Date;
  processingTimeMs: number;
}

interface UseAIResponsesOptions {
  conversationId: string | null;
  enabled?: boolean;
}

interface UseAIResponsesReturn {
  aiData: AIResponseData | null;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  markAsUsed: (responseId: string, staffId?: string) => Promise<void>;
  markAsEdited: (responseId: string, editedText: string, staffId?: string) => Promise<void>;
  markAsIgnored: (staffId?: string) => Promise<void>;
}

/**
 * Hook to subscribe to AI responses for a conversation
 */
export function useAIResponses({
  conversationId,
  enabled = true,
}: UseAIResponsesOptions): UseAIResponsesReturn {
  const [aiData, setAiData] = useState<AIResponseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);

  // Check if Firebase is configured
  useEffect(() => {
    const app = getFirebaseApp();
    setIsConfigured(!!app);
  }, []);

  // Subscribe to AI responses
  useEffect(() => {
    if (!conversationId || !enabled || !isConfigured) {
      setAiData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToLatestAIResponse(
      conversationId,
      (response: StoredAIResponse | null) => {
        setIsLoading(false);

        if (response) {
          setCurrentMessageId(response.messageId);
          setAiData({
            messageId: response.messageId,
            patientId: response.patientId,
            patientName: response.patientName,
            analysis: response.analysis,
            responses: response.responses,
            contextSummary: response.contextSummary,
            generatedAt: response.generatedAt,
            processingTimeMs: response.processingTimeMs,
          });
        } else {
          setAiData(null);
          setCurrentMessageId(null);
        }
      },
      (err) => {
        setIsLoading(false);
        setError(err.message);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [conversationId, enabled, isConfigured]);

  // Mark response as used (clicked send without editing)
  const markAsUsed = useCallback(async (responseId: string, staffId?: string) => {
    if (!conversationId || !currentMessageId) return;

    try {
      await updateAIResponseOutcome(conversationId, currentMessageId, {
        action: 'used',
        selectedResponseId: responseId,
        staffId,
        actionAt: new Date(),
      });
    } catch (err) {
      console.error('Failed to mark AI response as used:', err);
    }
  }, [conversationId, currentMessageId]);

  // Mark response as edited (clicked send after editing)
  const markAsEdited = useCallback(async (responseId: string, editedText: string, staffId?: string) => {
    if (!conversationId || !currentMessageId) return;

    try {
      await updateAIResponseOutcome(conversationId, currentMessageId, {
        action: 'edited',
        selectedResponseId: responseId,
        editedText,
        staffId,
        actionAt: new Date(),
      });
    } catch (err) {
      console.error('Failed to mark AI response as edited:', err);
    }
  }, [conversationId, currentMessageId]);

  // Mark as ignored (staff wrote their own response)
  const markAsIgnored = useCallback(async (staffId?: string) => {
    if (!conversationId || !currentMessageId) return;

    try {
      await updateAIResponseOutcome(conversationId, currentMessageId, {
        action: 'ignored',
        staffId,
        actionAt: new Date(),
      });
    } catch (err) {
      console.error('Failed to mark AI response as ignored:', err);
    }
  }, [conversationId, currentMessageId]);

  return {
    aiData,
    isLoading,
    error,
    isConfigured,
    markAsUsed,
    markAsEdited,
    markAsIgnored,
  };
}

export default useAIResponses;
