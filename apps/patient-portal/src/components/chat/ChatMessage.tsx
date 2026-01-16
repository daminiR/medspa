'use client';

import { cn } from '@/lib/utils';
import ActionButton from './ActionButton';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  intent?: string;
  suggestedActions?: string[];
}

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // System messages have a special display
  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="max-w-[80%] text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <p className="text-sm text-blue-800">{message.content}</p>
            <p className="text-xs text-blue-600 mt-1">{formatTime(message.timestamp)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[80%]', isUser ? 'order-2' : 'order-1')}>
        {/* Avatar for assistant */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">AI</span>
            </div>
            <span className="text-xs text-gray-500">AI Assistant</span>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 transition-all duration-200',
            isUser
              ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
              : 'bg-gray-100 text-gray-900'
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>

        {/* Suggested Actions */}
        {!isUser && message.suggestedActions && message.suggestedActions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.suggestedActions.map((action, idx) => (
              <ActionButton key={idx} action={action} />
            ))}
          </div>
        )}

        {/* Timestamp */}
        <p className={cn(
          'text-xs mt-1 px-2',
          isUser ? 'text-right text-gray-400' : 'text-gray-400'
        )}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}
