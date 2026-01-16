'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Tag, ChevronDown, ChevronRight, Columns } from 'lucide-react';
import { PhotoCard } from './PhotoCard';
import { PhotoCompare } from './PhotoCompare';
import { photoService, type TreatmentPhoto } from '@/lib/photos/photoService';
import { formatDate } from '@/lib/utils';

interface PhotoTimelineProps {
  photos: TreatmentPhoto[];
  onPhotoClick?: (photo: TreatmentPhoto) => void;
  groupBy?: 'date' | 'treatment';
}

export function PhotoTimeline({
  photos,
  onPhotoClick,
  groupBy = 'date',
}: PhotoTimelineProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [compareSet, setCompareSet] = useState<{
    before: TreatmentPhoto;
    after: TreatmentPhoto;
    treatmentType: string;
  } | null>(null);

  const groupedPhotos = useMemo(() => {
    if (groupBy === 'treatment') {
      return photoService.getPhotosGroupedByTreatment();
    }
    return photoService.getPhotosGroupedByMonth();
  }, [groupBy]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const formatGroupLabel = (key: string): string => {
    if (groupBy === 'treatment') {
      return key;
    }
    // Format month key like "2024-01" to "January 2024"
    const [year, month] = key.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getBeforeAfterPair = (
    groupPhotos: TreatmentPhoto[]
  ): { before: TreatmentPhoto; after: TreatmentPhoto } | null => {
    const beforePhoto = groupPhotos.find((p) => p.type === 'before');
    const afterPhoto = groupPhotos.find((p) => p.type === 'after');
    if (beforePhoto && afterPhoto) {
      return { before: beforePhoto, after: afterPhoto };
    }
    return null;
  };

  // Expand all groups by default
  const isExpanded = (key: string) => {
    if (expandedGroups.size === 0) return true;
    return expandedGroups.has(key);
  };

  if (compareSet) {
    return (
      <div className="space-y-4">
        <PhotoCompare
          beforePhoto={compareSet.before}
          afterPhoto={compareSet.after}
          treatmentType={compareSet.treatmentType}
          onClose={() => setCompareSet(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Array.from(groupedPhotos.entries()).map(([key, groupPhotos]) => {
        const expanded = isExpanded(key);
        const pair = getBeforeAfterPair(groupPhotos);
        const progressPhotos = groupPhotos.filter((p) => p.type === 'progress');
        const beforeAfterPhotos = groupPhotos.filter((p) => p.type !== 'progress');

        return (
          <div key={key} className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 to-pink-300" />

            {/* Group Header */}
            <Card className="relative">
              <button
                onClick={() => toggleGroup(key)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center z-10">
                    {groupBy === 'treatment' ? (
                      <Tag className="w-5 h-5 text-white" />
                    ) : (
                      <Calendar className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">
                      {formatGroupLabel(key)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {groupPhotos.length} photo{groupPhotos.length !== 1 ? 's' : ''}
                      {pair && ' - Before/After available'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pair && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCompareSet({
                          before: pair.before,
                          after: pair.after,
                          treatmentType: groupBy === 'treatment' ? key : pair.before.treatmentType || '',
                        });
                      }}
                    >
                      <Columns className="w-4 h-4 mr-1" />
                      Compare
                    </Button>
                  )}
                  {expanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {expanded && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Before/After Pair */}
                  {beforeAfterPhotos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2 ml-14">
                        Before & After
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 ml-14">
                        {beforeAfterPhotos.map((photo) => (
                          <PhotoCard
                            key={photo.id}
                            photo={photo}
                            onClick={() => onPhotoClick?.(photo)}
                            size="sm"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Progress Photos */}
                  {progressPhotos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2 ml-14">
                        Progress Photos
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 ml-14">
                        {progressPhotos.map((photo) => (
                          <PhotoCard
                            key={photo.id}
                            photo={photo}
                            onClick={() => onPhotoClick?.(photo)}
                            size="sm"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        );
      })}

      {groupedPhotos.size === 0 && (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-600">No photos yet</h3>
          <p className="text-sm text-gray-400 mt-1">
            Upload your first photo to start tracking your progress
          </p>
        </Card>
      )}
    </div>
  );
}

export default PhotoTimeline;
