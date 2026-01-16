'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatWindow } from '@/components/chat';
import { useChatStore } from '@/lib/stores/chatStore';

function AIAssistantContent() {
  const searchParams = useSearchParams();
  const { sendMessage, messages } = useChatStore();

  // Handle quick action URL parameters
  useEffect(() => {
    const action = searchParams.get('action');
    if (action && messages.length === 0) {
      const actionMessages: Record<string, string> = {
        book: "I'd like to book an appointment",
        pricing: 'How much do treatments cost?',
        hours: 'What are your hours and location?',
        treatments: 'Tell me about your available treatments'
      };
      const message = actionMessages[action];
      if (message) {
        // Small delay to ensure store is ready
        setTimeout(() => sendMessage(message), 100);
      }
    }
  }, [searchParams, sendMessage, messages.length]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Navigation Header */}
      <div className="flex items-center gap-4 px-4 sm:px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
        <Link href="/messages">
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold truncate">AI Assistant</h1>
          <p className="text-sm text-gray-500">Powered by AI</p>
        </div>
      </div>

      {/* Chat Window - takes remaining height */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow className="h-full" />
      </div>
    </div>
  );
}

export default function AIAssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <div className="flex items-center gap-4 px-4 sm:px-6 py-4 border-b border-gray-200 bg-white">
            <div className="w-10 h-10 bg-gray-200 rounded animate-pulse" />
            <div className="flex-1">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-1" />
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500">Loading chat...</div>
          </div>
        </div>
      }
    >
      <AIAssistantContent />
    </Suspense>
  );
}
