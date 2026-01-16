'use client';
import React from 'react';
import { Clock, Calendar, Info } from 'lucide-react';

interface EstimatedWaitProps {
  estimatedMinutes: number;
  scheduledTime: Date;
}

export default function EstimatedWait({ estimatedMinutes, scheduledTime }: EstimatedWaitProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getWaitColor = () => {
    if (estimatedMinutes <= 5) return 'bg-green-500';
    if (estimatedMinutes <= 15) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  const getWaitMessage = () => {
    if (estimatedMinutes <= 5) return "You'll be called soon!";
    if (estimatedMinutes <= 15) return 'Please stay nearby';
    return 'Feel free to relax';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <div className="flex items-center gap-2 mb-5">
        <Clock className="w-6 h-6 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Estimated Wait Time</h3>
      </div>

      <div className="flex justify-center mb-5">
        <div className={'rounded-2xl px-8 py-4 text-center min-w-40 ' + getWaitColor()}>
          <div className="text-4xl font-bold text-white leading-tight">
            ~{estimatedMinutes}
          </div>
          <div className="text-sm font-medium text-white mt-1">minutes</div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-gray-500" />
        <span className="text-gray-600">Scheduled for {formatTime(scheduledTime)}</span>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-3">
        <p className="text-center text-gray-900 font-medium">{getWaitMessage()}</p>
      </div>

      <div className="flex items-center justify-center gap-1">
        <Info className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500">Wait times are estimates and may vary</span>
      </div>
    </div>
  );
}
