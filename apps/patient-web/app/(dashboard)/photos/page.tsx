'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import {
  Camera,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  Grid,
  Columns,
  Plus,
  Trash2,
  Download,
  ZoomIn,
  Loader2,
} from 'lucide-react';
import { photosApi, type Photo, type PhotoPair } from '@/lib/api';

type ViewMode = 'grid' | 'compare';

export default function PhotosPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pairs, setPairs] = useState<PhotoPair[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('compare');
  const [selectedPair, setSelectedPair] = useState<PhotoPair | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const [photosData, pairsData] = await Promise.all([
          photosApi.getAll(),
          photosApi.getPairs(),
        ]);
        setPhotos(photosData);
        setPairs(pairsData);
      } catch (error) {
        console.error('Failed to fetch photos:', error);
        // Mock data
        const mockPhotos: Photo[] = [
          { id: 'p1', url: '/api/placeholder/400/500', thumbnailUrl: '/api/placeholder/200/250', type: 'before', serviceName: 'Botox Treatment', takenAt: '2024-01-15T10:00:00Z' },
          { id: 'p2', url: '/api/placeholder/400/500', thumbnailUrl: '/api/placeholder/200/250', type: 'after', serviceName: 'Botox Treatment', takenAt: '2024-01-29T10:00:00Z' },
          { id: 'p3', url: '/api/placeholder/400/500', thumbnailUrl: '/api/placeholder/200/250', type: 'before', serviceName: 'Lip Fillers', takenAt: '2024-02-10T10:00:00Z' },
          { id: 'p4', url: '/api/placeholder/400/500', thumbnailUrl: '/api/placeholder/200/250', type: 'after', serviceName: 'Lip Fillers', takenAt: '2024-02-24T10:00:00Z' },
        ];
        setPhotos(mockPhotos);
        setPairs([
          { id: 'pair1', beforePhoto: mockPhotos[0], afterPhoto: mockPhotos[1], serviceName: 'Botox Treatment', treatmentDate: '2024-01-15' },
          { id: 'pair2', beforePhoto: mockPhotos[2], afterPhoto: mockPhotos[3], serviceName: 'Lip Fillers', treatmentDate: '2024-02-10' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newPhoto = await photosApi.upload(file, 'before');
      setPhotos((prev) => [newPhoto, ...prev]);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Failed to upload photo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      await photosApi.delete(photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setPairs((prev) => prev.filter((p) => p.beforePhoto.id !== photoId && p.afterPhoto?.id !== photoId));
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Photos</h1>
          <p className="text-gray-600">Track your transformation with before and after photos</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('compare')}
              className={'px-3 py-1.5 rounded-md text-sm font-medium transition-colors ' + (viewMode === 'compare' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600')}
            >
              <Columns className="w-4 h-4 inline mr-1" />
              Compare
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={'px-3 py-1.5 rounded-md text-sm font-medium transition-colors ' + (viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600')}
            >
              <Grid className="w-4 h-4 inline mr-1" />
              All
            </button>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary btn-md"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your photos...</p>
        </div>
      ) : photos.length === 0 ? (
        <div className="card p-12 text-center">
          <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No photos yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start documenting your aesthetic journey by uploading before and after photos.
            Track your progress and celebrate your transformation!
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary btn-md"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Your First Photo
          </button>
        </div>
      ) : viewMode === 'compare' ? (
        /* Compare View */
        <div className="space-y-6">
          {pairs.map((pair) => (
            <div
              key={pair.id}
              className="card overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedPair(pair)}
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{pair.serviceName}</h3>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(pair.treatmentDate), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <button className="btn-outline btn-sm">
                    <ZoomIn className="w-4 h-4 mr-1" />
                    View
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2">
                {/* Before */}
                <div className="relative aspect-[3/4] bg-gray-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="badge bg-gray-900 text-white">Before</span>
                  </div>
                </div>

                {/* After */}
                <div className="relative aspect-[3/4] bg-gray-100 border-l border-gray-200">
                  {pair.afterPhoto ? (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                          <Camera className="w-12 h-12 text-primary-400" />
                        </div>
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className="badge-primary">After</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <Plus className="w-8 h-8 mb-2" />
                      <span className="text-sm">Add after photo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="card overflow-hidden group relative cursor-pointer"
              onClick={() => setLightboxPhoto(photo)}
            >
              <div className="aspect-[3/4] bg-gray-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={'w-full h-full flex items-center justify-center ' + (photo.type === 'before' ? 'bg-gradient-to-br from-gray-200 to-gray-300' : 'bg-gradient-to-br from-primary-100 to-primary-200')}>
                    <Camera className={'w-12 h-12 ' + (photo.type === 'before' ? 'text-gray-400' : 'text-primary-400')} />
                  </div>
                </div>

                {/* Type badge */}
                <div className="absolute top-2 left-2">
                  <span className={'badge ' + (photo.type === 'before' ? 'bg-gray-900 text-white' : 'badge-primary')}>
                    {photo.type === 'before' ? 'Before' : 'After'}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLightboxPhoto(photo);
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                    >
                      <ZoomIn className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(photo.id);
                      }}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                    >
                      <Trash2 className="w-5 h-5 text-error-600" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <p className="font-medium text-gray-900 text-sm truncate">{photo.serviceName}</p>
                <p className="text-xs text-gray-500">{format(parseISO(photo.takenAt), 'MMM d, yyyy')}</p>
              </div>
            </div>
          ))}

          {/* Add photo card */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="card aspect-[3/4] flex flex-col items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-200 transition-colors"
          >
            <Plus className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Add Photo</span>
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowUploadModal(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Upload Photo</h3>
                <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-12 h-12 text-primary-600 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="font-medium text-gray-900 mb-1">Drop your photo here</p>
                    <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Tips for great photos</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>Use good, even lighting</li>
                  <li>Keep consistent angles for before/after</li>
                  <li>Remove makeup for skin treatments</li>
                  <li>Tie hair back for facial photos</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Lightbox */}
      {lightboxPhoto && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-3xl max-h-[80vh] mx-4">
            <div className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
              <Camera className="w-24 h-24 text-gray-600" />
            </div>
            <div className="mt-4 text-center text-white">
              <p className="font-medium">{lightboxPhoto.serviceName}</p>
              <p className="text-sm text-gray-400">
                {lightboxPhoto.type === 'before' ? 'Before' : 'After'} - {format(parseISO(lightboxPhoto.takenAt), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {selectedPair && (
        <div className="fixed inset-0 bg-black z-50">
          <button
            onClick={() => setSelectedPair(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="h-full flex flex-col">
            <div className="p-4 text-center text-white">
              <h3 className="font-semibold">{selectedPair.serviceName}</h3>
              <p className="text-sm text-gray-400">
                {format(parseISO(selectedPair.treatmentDate), 'MMMM d, yyyy')}
              </p>
            </div>

            <div className="flex-1 grid grid-cols-2">
              {/* Before */}
              <div className="relative border-r border-gray-800">
                <div className="absolute top-4 left-4">
                  <span className="badge bg-gray-900 text-white">Before</span>
                </div>
                <div className="h-full flex items-center justify-center bg-gray-900">
                  <Camera className="w-24 h-24 text-gray-700" />
                </div>
              </div>

              {/* After */}
              <div className="relative">
                <div className="absolute top-4 left-4">
                  <span className="badge-primary">After</span>
                </div>
                <div className="h-full flex items-center justify-center bg-gray-900">
                  {selectedPair.afterPhoto ? (
                    <Camera className="w-24 h-24 text-primary-700" />
                  ) : (
                    <div className="text-center text-gray-500">
                      <Plus className="w-12 h-12 mx-auto mb-2" />
                      <p>No after photo yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
