'use client';
import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';

interface QueuePositionProps {
  position: number;
  totalWaiting: number;
}

export default function QueuePosition({ position, totalWaiting }: QueuePositionProps) {
  const maxCircles = Math.min(5, totalWaiting);
  const circles = [];

  for (let i = 1; i <= maxCircles; i++) {
    const isCurrentPatient = i === position;
    const isPassed = i < position;
    
    circles.push(
      <div
        key={i}
        className={
          'w-12 h-12 rounded-full flex items-center justify-center border-2 font-semibold ' +
          (isCurrentPatient
            ? 'bg-green-500 border-green-500 text-white scale-110'
            : isPassed
            ? 'bg-green-50 border-green-500 text-green-600'
            : 'bg-gray-100 border-gray-300 text-gray-600')
        }
      >
        {isPassed ? <CheckCircle className="w-5 h-5" /> : i}
      </div>
    );
    
    if (i < maxCircles) {
      circles.push(
        <div
          key={'line-' + i}
          className={'h-0.5 w-6 ' + (i < position ? 'bg-green-500' : 'bg-gray-300')}
        />
      );
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-5 text-center">
        Your Position in Queue
      </h3>
      
      <div className="flex items-center justify-center mb-6 px-3">
        {circles}
      </div>
      
      <div className="flex items-center justify-around">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Your Position</p>
          <p className="text-2xl font-bold text-gray-900">#{position}</p>
        </div>
        
        <div className="w-px h-10 bg-gray-300" />
        
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">Total Waiting</p>
          <p className="text-2xl font-bold text-gray-900">{totalWaiting}</p>
        </div>
      </div>
      
      {position === 1 && (
        <div className="flex items-center justify-center gap-2 bg-amber-100 rounded-lg py-2 px-3 mt-4">
          <Clock className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-semibold text-amber-600">You're next!</span>
        </div>
      )}
    </div>
  );
}
