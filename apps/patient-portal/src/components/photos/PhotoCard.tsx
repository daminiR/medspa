'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Calendar, Tag, FileText, Maximize2 } from 'lucide-react';
import { photoService, type TreatmentPhoto } from '@/lib/photos/photoService';
import { formatDate } from '@/lib/utils';

interface PhotoCardProps {
  photo: TreatmentPhoto;
  onClick?: () => void;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PhotoCard({ photo, onClick, showDetails = true, size = 'md' }: PhotoCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'aspect-square',
    md: 'aspect-[4/3]',
    lg: 'aspect-[3/2]',
  };

  const typeColor = photoService.getPhotoTypeColor(photo.type);
  const typeLabel = photoService.getPhotoTypeLabel(photo.type);

  return (
    <Card
      className="overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`relative ${sizeClasses[size]} bg-gradient-to-br from-purple-50 to-pink-50`}>
        {!imageError ? (
          <Image
            src={photo.thumbnailUrl || photo.url}
            alt={photo.notes || 'Treatment photo'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <FileText className="w-8 h-8 mx-auto mb-1" />
              <span className="text-xs">Image unavailable</span>
            </div>
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor}`}>
            {typeLabel}
          </span>
        </div>

        {/* Expand icon on hover */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity">
            <Maximize2 className="w-8 h-8 text-white drop-shadow-lg" />
          </div>
        )}
      </div>

      {showDetails && (
        <div className="p-3 space-y-2">
          {photo.treatmentType && (
            <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
              <Tag className="w-3.5 h-3.5 text-purple-500" />
              {photo.treatmentType}
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            {formatDate(photo.takenAt)}
          </div>

          {photo.notes && (
            <p className="text-xs text-gray-600 line-clamp-2">{photo.notes}</p>
          )}
        </div>
      )}
    </Card>
  );
}

export default PhotoCard;
