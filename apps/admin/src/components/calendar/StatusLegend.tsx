'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  CircleAlert,
  UserCheck,
  Ban,
  Send,
  UsersRound,
  Info,
  ChevronDown,
} from 'lucide-react';

interface StatusLegendProps {
  compact?: boolean;
}

export default function StatusLegend({ compact = false }: StatusLegendProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const legendItems = [
    {
      icon: CheckCircle2,
      color: 'text-green-500',
      borderColor: 'border-l-green-500',
      label: 'Confirmed',
      description: 'Patient confirmed via SMS',
    },
    {
      icon: Clock,
      color: 'text-amber-500',
      borderColor: 'border-l-amber-400',
      label: 'Unconfirmed',
      description: 'Awaiting patient response',
    },
    {
      icon: CircleAlert,
      color: 'text-red-500',
      borderColor: 'border-l-red-500',
      label: 'High Risk',
      description: 'New patient, unconfirmed',
    },
    {
      icon: UserCheck,
      color: 'text-green-400',
      borderColor: 'ring-green-400',
      label: 'Arrived',
      description: 'Patient checked in',
    },
    {
      icon: Send,
      color: 'text-amber-400',
      borderColor: 'ring-amber-400',
      label: 'Express Pending',
      description: 'Awaiting SMS booking',
    },
    {
      icon: UsersRound,
      color: 'text-indigo-400',
      borderColor: 'ring-indigo-400',
      label: 'Group',
      description: 'Part of group booking',
    },
    {
      icon: Ban,
      color: 'text-gray-400',
      borderColor: 'bg-gray-400',
      label: 'Cancelled',
      description: 'Appointment cancelled',
    },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 hover:text-gray-700 transition-colors"
        >
          <Info className="h-3.5 w-3.5" />
          <span>Legend</span>
          <ChevronDown
            className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
        {isExpanded && (
          <div className="flex items-center gap-4 flex-wrap">
            {legendItems.slice(0, 4).map((item) => (
              <div key={item.label} className="flex items-center gap-1">
                <item.icon className={`h-3 w-3 ${item.color}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border-b px-4 py-2">
      <div className="flex items-center gap-6 flex-wrap">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Status:
        </span>
        {legendItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-1.5 text-xs text-gray-600"
            title={item.description}
          >
            <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
