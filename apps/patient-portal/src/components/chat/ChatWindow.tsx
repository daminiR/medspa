'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/lib/stores/chatStore';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { TypingBubble } from './TypingIndicator';
import EmergencyBanner from './EmergencyBanner';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  className?: string;
}

export default function ChatWindow({ className }: ChatWindowProps) {
  const { messages, isLoading, sendMessage } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Check for emergency intent in recent messages
  useEffect(() => {
    const hasEmergency = messages.some(
      (m) => m.role === 'assistant' && m.intent === 'emergency_medical'
    );
    setShowEmergencyBanner(hasEmergency);
  }, [messages]);

  const handleDismissEmergency = () => {
    setShowEmergencyBanner(false);
  };

  // Quick action suggestions for empty state
  const quickActions = [
    { label: 'Book an appointment', message: "I'd like to book an appointment" },
    { label: 'Hours & location', message: 'What are your hours?' },
    { label: 'Treatment info', message: 'Tell me about Botox' },
    { label: 'Pricing', message: 'How much do treatments cost?' }
  ];

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Emergency Banner */}
      {showEmergencyBanner && (
        <EmergencyBanner onDismiss={handleDismissEmergency} />
      )}

      {/* Header */}
      <div className="border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg">AI</span>
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">AI Assistant</h2>
            <p className="text-sm text-gray-500">Always here to help</p>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center gap-1.5 text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {/* Empty State */}
        {messages.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">AI</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Hi! I&apos;m your AI assistant.
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              I can help you book appointments, answer questions about treatments, and provide information about our services.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(action.message)}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages List */}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Typing Indicator */}
        {isLoading && <TypingBubble />}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
