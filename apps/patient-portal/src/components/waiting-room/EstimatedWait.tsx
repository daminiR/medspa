'use client';

/**
 * Estimated Wait Component
 * Shows countdown timer and estimated wait time
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EstimatedWaitProps {
  estimatedMinutes: number;
  scheduledTime?: Date;
}

export function EstimatedWait({ estimatedMinutes, scheduledTime }: EstimatedWaitProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(estimatedMinutes * 60);

  useEffect(() => {
    // Reset timer when estimatedMinutes changes
    setRemainingSeconds(estimatedMinutes * 60);
  }, [estimatedMinutes]);

  useEffect(() => {
    // Countdown timer
    if (remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  const formatCountdown = () => {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    const secsStr = secs.toString().padStart(2, '0');
    return mins + ':' + secsStr;
  };

  const formatScheduledTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isRunningLate = scheduledTime && new Date() > scheduledTime;
  const progressPercentage = Math.max(0, Math.min(100, 
    ((estimatedMinutes * 60 - remainingSeconds) / (estimatedMinutes * 60)) * 100
  ));

  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center',
            isRunningLate ? 'bg-amber-100' : 'bg-purple-100'
          )}>
            {isRunningLate ? (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            ) : (
              <Clock className="w-5 h-5 text-purple-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Estimated Wait</h3>
            {scheduledTime && (
              <p className="text-sm text-gray-500">
                Scheduled for {formatScheduledTime(scheduledTime)}
              </p>
            )}
          </div>
        </div>

        {/* Countdown Display */}
        <div className="text-center py-4">
          <div className="text-5xl font-bold text-gray-900 font-mono">
            {formatCountdown()}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {remainingSeconds > 0 ? 'remaining' : 'Any moment now!'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-1000',
                isRunningLate ? 'bg-amber-500' : 'bg-purple-500'
              )}
              style={{ width: progressPercentage + '%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Checked in</span>
            <span>Ready</span>
          </div>
        </div>

        {/* Late Notice */}
        {isRunningLate && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              We apologize for the delay. Thank you for your patience.
            </p>
          </div>
        )}

        {/* Almost Ready Notice */}
        {remainingSeconds <= 60 && remainingSeconds > 0 && (
          <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
            <p className="text-sm text-emerald-800 font-medium">
              Almost ready! Please stay nearby.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default EstimatedWait;
