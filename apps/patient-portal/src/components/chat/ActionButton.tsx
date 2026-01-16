'use client';

import { useChatStore } from '@/lib/stores/chatStore';
import { cn } from '@/lib/utils';

interface ActionButtonProps {
  action: string;
  className?: string;
}

export default function ActionButton({ action, className }: ActionButtonProps) {
  const { sendMessage, isLoading } = useChatStore();

  const handleClick = () => {
    if (!isLoading) {
      sendMessage(action);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'px-3 py-1.5 bg-white border border-gray-300 rounded-lg',
        'text-sm text-gray-700',
        'hover:bg-gray-50 hover:border-gray-400',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1',
        className
      )}
    >
      {action}
    </button>
  );
}
