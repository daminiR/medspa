/**
 * Chat Store - Zustand State Management
 * Manages chat messages and conversation state for patient portal
 *
 * HIPAA COMPLIANCE NOTE:
 * - No PHI stored in logs (only conversation IDs)
 * - Session-only storage (no server persistence)
 * - Production requires Google Cloud BAA + Vertex AI
 * - This mock implementation is for UI development only
 */

'use client';

import { create } from 'zustand';
import { PatientIntent, UrgencyLevel, PatientSentiment } from '@/lib/ai/patient-intents';

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  intent?: PatientIntent | string;
  urgency?: UrgencyLevel;
  sentiment?: PatientSentiment;
  suggestedActions?: string[];
  isError?: boolean;
}

/**
 * Conversation metadata
 */
export interface ConversationMeta {
  conversationId: string;
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
  hasEscalation: boolean;
}

/**
 * Chat store state
 */
interface ChatState {
  // State
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  isOpen: boolean;
  isMinimized: boolean;

  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'> | ChatMessage) => void;
  sendMessage: (content: string, patientName?: string) => Promise<void>;
  clearMessages: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setIsMinimized: (isMinimized: boolean) => void;
  toggleChat: () => void;
  resetError: () => void;
  getConversationMeta: () => ConversationMeta | null;
}

/**
 * Generate unique message ID
 */
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate conversation ID
 */
function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Welcome message for new conversations
 */
const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `Hello! I'm your virtual assistant at Luxe Medical Spa. I'm here to help you with:

- Booking or managing appointments
- Treatment information and pricing
- Pre and post-treatment questions
- Location and hours

How can I assist you today?`,
  timestamp: new Date().toISOString(),
  suggestedActions: ['Book Appointment', 'View Treatments', 'Contact Us'],
};

/**
 * Chat store with Zustand
 */
export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  messages: [WELCOME_MESSAGE],
  isLoading: false,
  error: null,
  conversationId: null,
  isOpen: false,
  isMinimized: false,

  // Add a message to the chat
  addMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: 'id' in message && message.id ? message.id : generateMessageId(),
      timestamp: 'timestamp' in message && message.timestamp ? message.timestamp : new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, newMessage],
      error: null,
    }));
  },

  // Send a message and get AI response
  sendMessage: async (content: string, patientName?: string) => {
    const { addMessage, conversationId } = get();
    const trimmedContent = content.trim();

    if (!trimmedContent) return;

    // Initialize conversation ID if needed
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      currentConversationId = generateConversationId();
      set({ conversationId: currentConversationId });
    }

    // Add user message immediately
    addMessage({
      role: 'user',
      content: trimmedContent,
    });

    // Set loading state
    set({ isLoading: true, error: null });

    try {
      // Get previous messages for context (last 5)
      const previousMessages = get()
        .messages.filter((m) => m.role !== 'system')
        .slice(-5)
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmedContent,
          conversationId: currentConversationId,
          patientName,
          previousMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();

      // Add AI response
      addMessage({
        role: 'assistant',
        content: data.response,
        intent: data.intent,
        urgency: data.urgency,
        sentiment: data.sentiment,
        suggestedActions: data.suggestedActions,
      });

      // If escalated, add system message
      if (data.escalate) {
        addMessage({
          role: 'system',
          content: `This conversation has been escalated to our medical team. Priority: ${data.urgency}`,
        });
      }
    } catch (error) {
      console.error('Chat error:', error);

      // Add error message
      addMessage({
        role: 'assistant',
        content:
          "I'm sorry, I encountered an error processing your message. Please try again, or contact us directly at (555) 123-4567.",
        isError: true,
      });

      set({
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // Clear all messages and reset conversation
  clearMessages: () => {
    set({
      messages: [
        {
          ...WELCOME_MESSAGE,
          id: generateMessageId(),
          timestamp: new Date().toISOString(),
        },
      ],
      conversationId: null,
      error: null,
    });
  },

  // Control chat visibility
  setIsOpen: (isOpen) => {
    set({ isOpen, isMinimized: false });
  },

  setIsMinimized: (isMinimized) => {
    set({ isMinimized });
  },

  toggleChat: () => {
    const { isOpen, isMinimized } = get();
    if (isMinimized) {
      set({ isMinimized: false });
    } else {
      set({ isOpen: !isOpen });
    }
  },

  // Reset error state
  resetError: () => {
    set({ error: null });
  },

  // Get conversation metadata
  getConversationMeta: () => {
    const { messages, conversationId } = get();

    if (!conversationId || messages.length <= 1) {
      return null;
    }

    const userMessages = messages.filter((m) => m.role === 'user');
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];
    const hasEscalation = messages.some((m) => m.role === 'system');

    return {
      conversationId,
      startedAt: firstMessage.timestamp,
      lastMessageAt: lastMessage.timestamp,
      messageCount: userMessages.length,
      hasEscalation,
    };
  },
}));

/**
 * Selector hooks for performance optimization
 */
export const useChatMessages = () => useChatStore((state) => state.messages);
export const useChatIsLoading = () => useChatStore((state) => state.isLoading);
export const useChatIsOpen = () => useChatStore((state) => state.isOpen);
export const useChatError = () => useChatStore((state) => state.error);
