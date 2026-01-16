'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Tag,
  User,
  FileText,
  Download,
  Columns,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { PhotoCompare } from '@/components/photos';
import { photoService, type TreatmentPhoto } from '@/lib/photos/photoService';
import { formatDate } from '@/lib/utils';

export default function PhotoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [photo, setPhoto] = useState<TreatmentPhoto | null>(null);
  const [relatedPhotos, setRelatedPhotos] = useState<TreatmentPhoto[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [comparePhoto, setComparePhoto] = useState<TreatmentPhoto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    const foundPhoto = photoService.getPhotoById(id);
    if (foundPhoto) {
      setPhoto(foundPhoto);
      // Get related photos from the same treatment
      if (foundPhoto.treatmentType) {
        const related = photoService
          .getPhotosByTreatment(foundPhoto.treatmentType)
          .filter((p) => p.id !== foundPhoto.id);
        setRelatedPhotos(related);

        // Find before/after pair for comparison
        if (foundPhoto.type === 'before') {
          const after = related.find((p) => p.type === 'after');
          if (after) setComparePhoto(after);
        } else if (foundPhoto.type === 'after') {
          const before = related.find((p) => p.type === 'before');
          if (before) setComparePhoto(before);
        }
      }
    }
  }, [params.id]);

  const handleDownload = async () => {
    if (!photo) return;
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

  const handleDelete = async () => {
    if (!photo || !window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }
    setIsDeleting(true);
    try {
      await photoService.deletePhoto(photo.id);
      router.push('/photos');
    } catch (error) {
      console.error('Failed to delete photo:', error);
      setIsDeleting(false);
    }
  };

  const navigateToPhoto = (targetPhoto: TreatmentPhoto) => {
    router.push('/photos/' + targetPhoto.id);
  };

  if (!photo) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-600">Photo not found</h3>
          <p className="text-sm text-gray-400 mt-1">
            This photo may have been deleted or does not exist.
          </p>
          <Link href="/photos">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Gallery
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const typeColor = photoService.getPhotoTypeColor(photo.type);
  const typeLabel = photoService.getPhotoTypeLabel(photo.type);
  const allPhotos = photoService.getAllPhotos();
  const currentIndex = allPhotos.findIndex((p) => p.id === photo.id);
  const prevPhoto = currentIndex > 0 ? allPhotos[currentIndex - 1] : null;
  const nextPhoto = currentIndex < allPhotos.length - 1 ? allPhotos[currentIndex + 1] : null;

  if (showCompare && comparePhoto) {
    const beforePhoto = photo.type === 'before' ? photo : comparePhoto;
    const afterPhoto = photo.type === 'after' ? photo : comparePhoto;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => setShowCompare(false)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Photo
        </Button>
        <PhotoCompare
          beforePhoto={beforePhoto}
          afterPhoto={afterPhoto}
          treatmentType={photo.treatmentType}
          onClose={() => setShowCompare(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        href="/photos"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Gallery
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Image */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative aspect-[4/3] bg-gray-100">
              {!imageError ? (
                <Image
                  src={photo.url}
                  alt={photo.notes || 'Treatment photo'}
                  fill
                  className="object-contain"
                  onError={() => setImageError(true)}
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <FileText className="w-16 h-16 mb-2" />
                  <span>Image unavailable</span>
                </div>
              )}

              {/* Navigation Arrows */}
              {prevPhoto && (
                <button
                  onClick={() => navigateToPhoto(prevPhoto)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
              )}
              {nextPhoto && (
                <button
                  onClick={() => navigateToPhoto(nextPhoto)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              )}

              {/* Type Badge */}
              <div className="absolute top-4 left-4">
                <span className={'px-3 py-1 rounded-full text-sm font-medium ' + typeColor}>
                  {typeLabel}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 flex flex-wrap gap-2">
              {comparePhoto && (
                <Button onClick={() => setShowCompare(true)}>
                  <Columns className="w-4 h-4 mr-2" />
                  Compare Before/After
                </Button>
              )}
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                className="text-red-600 hover:bg-red-50 ml-auto"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Details Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Photo Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Date Taken</div>
                  <div className="font-medium">{formatDate(photo.takenAt)}</div>
                </div>
              </div>

              {photo.treatmentType && (
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Treatment</div>
                    <div className="font-medium">{photo.treatmentType}</div>
                  </div>
                </div>
              )}

              {photo.bodyArea && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Body Area</div>
                    <div className="font-medium">{photo.bodyArea}</div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Uploaded By</div>
                  <div className="font-medium capitalize">{photo.uploadedBy}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">File Info</div>
                  <div className="text-sm">
                    <div className="font-medium">{photo.originalFilename}</div>
                    <div className="text-gray-400">
                      {photoService.formatFileSize(photo.fileSize)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {photo.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{photo.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Related Photos */}
          {relatedPhotos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {relatedPhotos.slice(0, 6).map((relatedPhoto) => (
                    <button
                      key={relatedPhoto.id}
                      onClick={() => navigateToPhoto(relatedPhoto)}
                      className="aspect-square relative rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                    >
                      <Image
                        src={relatedPhoto.thumbnailUrl || relatedPhoto.url}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute bottom-1 left-1">
                        <span className={'px-1.5 py-0.5 text-[10px] rounded-full font-medium ' + 
                          photoService.getPhotoTypeColor(relatedPhoto.type)}>
                          {photoService.getPhotoTypeLabel(relatedPhoto.type)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                {relatedPhotos.length > 6 && (
                  <Link
                    href={'/photos?treatment=' + encodeURIComponent(photo.treatmentType || '')}
                    className="block text-center text-sm text-purple-600 hover:text-purple-700 mt-3"
                  >
                    View all {relatedPhotos.length + 1} photos
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
