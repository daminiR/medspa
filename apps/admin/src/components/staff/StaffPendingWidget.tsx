'use client';

import React from 'react';
import { Clock, AlertCircle, Users, Calendar, ChevronRight } from 'lucide-react';

interface PendingItem {
  type: 'timeoff' | 'shift' | 'onboarding' | 'training';
  count: number;
  urgent?: boolean;
}

interface StaffPendingWidgetProps {
  onViewTimeOff?: () => void;
  onViewShifts?: () => void;
  onViewOnboarding?: () => void;
  onViewTraining?: () => void;
}

export default function StaffPendingWidget({
  onViewTimeOff,
  onViewShifts,
  onViewOnboarding,
  onViewTraining
}: StaffPendingWidgetProps) {
  // In real app, these would come from API/context
  const pendingItems: PendingItem[] = [
    { type: 'shift', count: 4, urgent: true },
    { type: 'timeoff', count: 3 },
    { type: 'onboarding', count: 2 },
    { type: 'training', count: 1 }
  ];

  const totalPending = pendingItems.reduce((sum, item) => sum + item.count, 0);

  const getItemDetails = (type: string) => {
    switch (type) {
      case 'shift':
        return {
          label: 'Shift Requests',
          icon: Calendar,
          color: 'text-orange-600 bg-orange-50',
          onClick: onViewShifts
        };
      case 'timeoff':
        return {
          label: 'Time Off Requests',
          icon: Clock,
          color: 'text-blue-600 bg-blue-50',
          onClick: onViewTimeOff
        };
      case 'onboarding':
        return {
          label: 'Onboarding Incomplete',
          icon: Users,
          color: 'text-purple-600 bg-purple-50',
          onClick: onViewOnboarding
        };
      case 'training':
        return {
          label: 'Training Due',
          icon: AlertCircle,
          color: 'text-yellow-600 bg-yellow-50',
          onClick: onViewTraining
        };
      default:
        return {
          label: 'Unknown',
          icon: AlertCircle,
          color: 'text-gray-600 bg-gray-50',
          onClick: undefined
        };
    }
  };

  if (totalPending === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 text-green-700">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="font-medium">All caught up!</span>
          <span className="text-sm">No pending staff items require attention</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Today's Tasks</h3>
              <p className="text-xs text-gray-500 mt-0.5">A few items to review when you have a moment</p>
            </div>
          </div>
          <span className="text-sm text-gray-400">
            {totalPending} total
          </span>
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {pendingItems.map((item) => {
          const details = getItemDetails(item.type);
          const Icon = details.icon;
          
          return (
            <button
              key={item.type}
              onClick={details.onClick}
              className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm bg-gray-50 hover:bg-white"
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${details.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {item.urgent && (
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                )}
              </div>
              <div className="text-left">
                <div className="text-xl font-medium text-gray-700">{item.count}</div>
                <div className="text-xs text-gray-500 mt-1">{details.label}</div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                <span>Review</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            You're doing great! Take these one at a time.
          </span>
          <button className="text-blue-600 hover:text-blue-700">
            Quick Actions →
          </button>
        </div>
      </div>
    </div>
  );
}