'use client';

import React from 'react';
import { ChevronDown, ChevronRight, MessageSquare, Mail, CheckCircle2, RotateCcw } from 'lucide-react';

interface MessageCardProps {
  id?: string;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  channels?: {
    sms?: boolean;
    email?: boolean;
  };
  children?: React.ReactNode;
  defaultExpanded?: boolean;
  isExpanded?: boolean;
  onExpand?: (id: string) => void;
  summary?: string;
  isUsingDefaults?: boolean;
  onResetToDefaults?: () => void;
}

export function MessageCard({
  id,
  title,
  description,
  enabled,
  onToggle,
  channels = { sms: true, email: false },
  children,
  defaultExpanded = false,
  isExpanded: controlledExpanded,
  onExpand,
  summary,
  isUsingDefaults = false,
  onResetToDefaults,
}: MessageCardProps) {
  // Use controlled expansion if provided, otherwise default to collapsed
  const isControlled = controlledExpanded !== undefined && onExpand !== undefined && id !== undefined;
  const isExpanded = isControlled ? controlledExpanded : false;

  const handleExpandClick = () => {
    if (isControlled && id) {
      onExpand(id);
    }
  };

  // Generate default summary if not provided
  const getSummary = () => {
    if (summary) return summary;

    const channelParts: string[] = [];
    if (channels.sms) channelParts.push('SMS');
    if (channels.email) channelParts.push('Email');

    const channelText = channelParts.length > 0
      ? `${channelParts.join(' + ')} enabled`
      : 'No channels enabled';

    return channelText;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Card Header */}
      <div
        className="p-4 border-b border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={handleExpandClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Expand/Collapse Button */}
            <div
              className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-600" />
              )}
            </div>

            {/* Title and Description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                {/* Default Status Indicator - Only show when collapsed */}
                {!isExpanded && isUsingDefaults && (
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-md"
                    title="Using recommended settings"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Default</span>
                  </div>
                )}
                {!isExpanded && !isUsingDefaults && onResetToDefaults && (
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-md"
                    title="Customized settings"
                  >
                    <span className="text-xs font-medium">Customized</span>
                  </div>
                )}
              </div>
              {isExpanded ? (
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
              ) : (
                <p className="text-sm text-gray-500 mt-0.5">{getSummary()}</p>
              )}
            </div>

            {/* Channel Icons - Only show when collapsed */}
            {!isExpanded && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {channels.sms && (
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded-md"
                    title="SMS enabled"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-xs font-medium">SMS</span>
                  </div>
                )}
                {channels.email && (
                  <div
                    className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 text-purple-600 rounded-md"
                    title="Email enabled"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="text-xs font-medium">Email</span>
                  </div>
                )}
              </div>
            )}

            {/* Toggle Switch */}
            <label
              className="relative inline-flex items-center cursor-pointer flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => onToggle(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 bg-white">
          {/* Reset to Defaults Button */}
          {!isUsingDefaults && onResetToDefaults && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <button
                onClick={onResetToDefaults}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Reset to Recommended Settings
              </button>
            </div>
          )}

          {/* Success Message when using defaults */}
          {isUsingDefaults && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Using Recommended Settings</p>
                  <p className="text-xs text-green-700 mt-1">
                    This message is configured with our recommended default settings that work well for most medical spas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {children}
        </div>
      )}
    </div>
  );
}
