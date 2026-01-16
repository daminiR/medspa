'use client';

/**
 * Queue Position Component
 * Visual indicator showing patient's position in queue
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User, Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueuePositionProps {
  position: number;
  totalWaiting: number;
}

export function QueuePosition({ position, totalWaiting }: QueuePositionProps) {
  // Show up to 5 circles (people ahead + patient + people behind)
  const maxCircles = Math.min(5, totalWaiting);
  const circles = [];
  
  for (let i = 1; i <= maxCircles; i++) {
    const isCurrentPatient = i === position;
    const isPassed = i < position;
    
    circles.push(
      <React.Fragment key={i}>
        <div
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
            isCurrentPatient && 'bg-emerald-500 border-emerald-500 scale-110 shadow-lg',
            isPassed && 'bg-emerald-50 border-emerald-500',
            !isCurrentPatient && !isPassed && 'bg-gray-100 border-gray-200'
          )}
        >
          {isCurrentPatient ? (
            <User className="w-5 h-5 text-white" />
          ) : isPassed ? (
            <Check className="w-4 h-4 text-emerald-500" />
          ) : (
            <span className="text-sm font-semibold text-gray-500">{i}</span>
          )}
        </div>
        {i < maxCircles && (
          <div
            className={cn(
              'w-6 h-0.5 mx-1',
              i < position ? 'bg-emerald-500' : 'bg-gray-200'
            )}
          />
        )}
      </React.Fragment>
    );
  }

  return (
    <Card className="shadow-md">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-5">
          Your Position in Queue
        </h3>
        
        {/* Queue Visualization */}
        <div className="flex items-center justify-center mb-6 px-3">
          {circles}
        </div>
        
        {/* Position Info */}
        <div className="flex items-center justify-around">
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500 mb-1">Your Position</p>
            <p className="text-2xl font-bold text-gray-900">#{position}</p>
          </div>
          
          <div className="w-px h-10 bg-gray-200 mx-4" />
          
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500 mb-1">Total Waiting</p>
            <p className="text-2xl font-bold text-gray-900">{totalWaiting}</p>
          </div>
        </div>
        
        {/* You're Next Badge */}
        {position === 1 && (
          <div className="flex items-center justify-center gap-2 bg-amber-50 rounded-lg py-2 px-4 mt-4">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-600">You&apos;re next!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default QueuePosition;
