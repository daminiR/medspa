'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ArrowLeftRight, Calendar } from 'lucide-react';
import { type TreatmentPhoto } from '@/lib/photos/photoService';
import { formatDate } from '@/lib/utils';

interface PhotoCompareProps {
  beforePhoto: TreatmentPhoto;
  afterPhoto: TreatmentPhoto;
  treatmentType?: string;
  onClose?: () => void;
  mode?: 'slider' | 'sideBySide';
}

export function PhotoCompare({
  beforePhoto,
  afterPhoto,
  treatmentType,
  onClose,
  mode: initialMode = 'slider',
}: PhotoCompareProps) {
  const [mode, setMode] = useState<'slider' | 'sideBySide'>(initialMode);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
      setSliderPosition(percentage);
    },
    [isDragging]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
      setSliderPosition(percentage);
    },
    []
  );

  const beforeDate = new Date(beforePhoto.takenAt);
  const afterDate = new Date(afterPhoto.takenAt);
  const daysBetween = Math.ceil(
    (afterDate.getTime() - beforeDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <div>
          <h3 className="font-semibold text-gray-900">
            {treatmentType || 'Before & After'}
          </h3>
          <p className="text-sm text-gray-500">
            {daysBetween === 0 ? 'Same day' : daysBetween + ' days between photos'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={mode === 'slider' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('slider')}
          >
            Slider
          </Button>
          <Button
            variant={mode === 'sideBySide' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('sideBySide')}
          >
            Side by Side
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Comparison View */}
      {mode === 'slider' ? (
        <div
          ref={containerRef}
          className="relative aspect-[4/3] cursor-ew-resize select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
        >
          {/* After Image (Full) */}
          <div className="absolute inset-0">
            <Image
              src={afterPhoto.url}
              alt="After"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-green-500/90 text-white text-xs font-medium rounded">
              After
            </div>
          </div>

          {/* Before Image (Clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: sliderPosition + '%' }}
          >
            <div className="relative w-full h-full" style={{ width: (100 / sliderPosition) * 100 + '%' }}>
              <Image
                src={beforePhoto.url}
                alt="Before"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-blue-500/90 text-white text-xs font-medium rounded">
              Before
            </div>
          </div>

          {/* Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10"
            style={{ left: sliderPosition + '%', transform: 'translateX(-50%)' }}
            onMouseDown={handleMouseDown}
            onTouchStart={() => setIsDragging(true)}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1">
          {/* Before */}
          <div className="relative aspect-[4/3]">
            <Image
              src={beforePhoto.url}
              alt="Before"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-blue-500/90 text-white text-xs font-medium rounded">
              Before
            </div>
          </div>

          {/* After */}
          <div className="relative aspect-[4/3]">
            <Image
              src={afterPhoto.url}
              alt="After"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-green-500/90 text-white text-xs font-medium rounded">
              After
            </div>
          </div>
        </div>
      )}

      {/* Date Info */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-blue-500" />
          <div>
            <span className="text-gray-500">Before: </span>
            <span className="font-medium">{formatDate(beforePhoto.takenAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-green-500" />
          <div>
            <span className="text-gray-500">After: </span>
            <span className="font-medium">{formatDate(afterPhoto.takenAt)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default PhotoCompare;
