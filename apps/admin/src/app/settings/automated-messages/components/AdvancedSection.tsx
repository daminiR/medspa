'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AdvancedSectionProps {
  children: ReactNode;
  defaultExpanded?: boolean;
}

export function AdvancedSection({ children, defaultExpanded = false }: AdvancedSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-t border-gray-200 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
      >
        <span>Advanced options</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}
