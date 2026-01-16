'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  Tag,
  User,
  FileText,
  Columns,
} from 'lucide-react';
import { photoService, type TreatmentPhoto } from '@/lib/photos/photoService';
import { formatDate } from '@/lib/utils';

interface PhotoModalProps {
  photo: TreatmentPhoto;
  photos?: TreatmentPhoto[];
  onClose: () => void;
  onPhotoChange?: (photo: TreatmentPhoto) => void;
  onCompare?: () => void;
}

export function PhotoModal({
  photo,
  photos = [],
  onClose,
  onPhotoChange,
  onCompare,
}: PhotoModalProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentIndex = photos.findIndex((p) => p.id === photo.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const typeColor = photoService.getPhotoTypeColor(photo.type);
  const typeLabel = photoService.getPhotoTypeLabel(photo.type);

  const handlePrev = useCallback(() => {
    if (hasPrev && onPhotoChange) {
      onPhotoChange(photos[currentIndex - 1]);
      setIsLoading(true);
      setImageError(false);
    }
  }, [hasPrev, currentIndex, photos, onPhotoChange]);

  const handleNext = useCallback(() => {
    if (hasNext && onPhotoChange) {
      onPhotoChange(photos[currentIndex + 1]);
      setIsLoading(true);
      setImageError(false);
    }
  }, [hasNext, currentIndex, photos, onPhotoChange]);

  const handleDownload = async () => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = photo.originalFilename || 'photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const prevButtonClass = !hasPrev ? 'opacity-30 cursor-not-allowed' : '';
  const nextButtonClass = !hasNext ? 'opacity-30 cursor-not-allowed' : '';
  const imageOpacityClass = isLoading ? 'opacity-0' : 'opacity-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-6xl mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md rounded-t-lg">
          <div className="flex items-center gap-3">
            <span className={'px-3 py-1 rounded-full text-sm font-medium ' + typeColor}>
              {typeLabel}
            </span>
            {photo.treatmentType && (
              <span className="text-white/80 text-sm">{photo.treatmentType}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onCompare && photo.type !== 'progress' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCompare}
                className="text-white hover:bg-white/20"
              >
                <Columns className="w-4 h-4 mr-2" />
                Compare
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="relative flex-1 bg-black/50 backdrop-blur-md min-h-[400px]">
          {photos.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className={'absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors ' + prevButtonClass}
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className={'absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors ' + nextButtonClass}
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          <div className="relative w-full h-full flex items-center justify-center p-4">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            )}
            {!imageError ? (
              <Image
                src={photo.url}
                alt={photo.notes || 'Treatment photo'}
                width={800}
                height={600}
                className={'max-w-full max-h-[60vh] object-contain transition-opacity ' + imageOpacityClass}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setImageError(true);
                  setIsLoading(false);
                }}
                unoptimized
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-white/60">
                <FileText className="w-16 h-16 mb-2" />
                <span>Image unavailable</span>
              </div>
            )}
          </div>

          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-white/80 text-sm">
              {currentIndex + 1} / {photos.length}
            </div>
          )}
        </div>

        <div className="p-4 bg-white rounded-b-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-purple-500 mt-0.5" />
              <div>
                <div className="text-xs text-gray-500">Date Taken</div>
                <div className="text-sm font-medium">{formatDate(photo.takenAt)}</div>
              </div>
            </div>

            {photo.treatmentType && (
              <div className="flex items-start gap-2">
                <Tag className="w-4 h-4 text-purple-500 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">Treatment</div>
                  <div className="text-sm font-medium">{photo.treatmentType}</div>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-purple-500 mt-0.5" />
              <div>
                <div className="text-xs text-gray-500">Uploaded By</div>
                <div className="text-sm font-medium capitalize">{photo.uploadedBy}</div>
              </div>
            </div>
          </div>

          {photo.notes && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-xs text-gray-500 mb-1">Notes</div>
              <p className="text-sm text-gray-700">{photo.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PhotoModal;
