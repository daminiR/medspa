'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Upload,
  Grid,
  List,
  Calendar,
  Tag,
  Search,
  Filter,
  Columns,
  X,
} from 'lucide-react';
import {
  PhotoCard,
  PhotoModal,
  PhotoTimeline,
  PhotoCompare,
} from '@/components/photos';
import { photoService, type TreatmentPhoto, type PhotoType } from '@/lib/photos/photoService';

type ViewMode = 'grid' | 'timeline';
type GroupBy = 'date' | 'treatment';

export default function PhotosPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [groupBy, setGroupBy] = useState<GroupBy>('date');
  const [selectedPhoto, setSelectedPhoto] = useState<TreatmentPhoto | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<PhotoType | 'all'>('all');
  const [filterTreatment, setFilterTreatment] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const allPhotos = photoService.getAllPhotos();
  const treatmentTypes = photoService.getUniqueTreatmentTypes();
  const beforeAfterPairs = photoService.getBeforeAfterPairs();

  const filteredPhotos = useMemo(() => {
    let result = allPhotos;

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter((p) => p.type === filterType);
    }

    // Filter by treatment
    if (filterTreatment !== 'all') {
      result = result.filter((p) => p.treatmentType === filterTreatment);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.treatmentType?.toLowerCase().includes(query) ||
          p.bodyArea?.toLowerCase().includes(query) ||
          p.notes?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [allPhotos, filterType, filterTreatment, searchQuery]);

  const handlePhotoClick = (photo: TreatmentPhoto) => {
    setSelectedPhoto(photo);
  };

  const handleCloseModal = () => {
    setSelectedPhoto(null);
  };

  const handleCompareFromModal = () => {
    if (selectedPhoto) {
      const pair = beforeAfterPairs.find(
        (p) =>
          p.before.id === selectedPhoto.id || p.after.id === selectedPhoto.id
      );
      if (pair) {
        setShowCompare(true);
      }
    }
    setSelectedPhoto(null);
  };

  const activeFiltersCount =
    (filterType !== 'all' ? 1 : 0) +
    (filterTreatment !== 'all' ? 1 : 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Photo Gallery
          </h1>
          <p className="text-gray-500 mt-1">
            Track your treatment progress with before and after photos
          </p>
        </div>
        <Link href="/photos/upload">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Upload className="w-4 h-4 mr-2" />
            Upload Photos
          </Button>
        </Link>
      </div>

      {/* Before/After Comparison Section */}
      {beforeAfterPairs.length > 0 && !showCompare && (
        <Card className="p-4 mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Columns className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Before & After Comparisons
                </h3>
                <p className="text-sm text-gray-600">
                  {beforeAfterPairs.length} comparison{beforeAfterPairs.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowCompare(true)}
              className="border-purple-300 hover:bg-purple-100"
            >
              View Comparisons
            </Button>
          </div>
        </Card>
      )}

      {/* Comparison View */}
      {showCompare && (
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Before & After Comparisons</h2>
            <Button variant="ghost" onClick={() => setShowCompare(false)}>
              <X className="w-4 h-4 mr-1" />
              Close
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {beforeAfterPairs.map((pair, idx) => (
              <PhotoCompare
                key={idx}
                beforePhoto={pair.before}
                afterPhoto={pair.after}
                treatmentType={pair.treatmentType}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      {!showCompare && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by treatment, body area, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* View Mode Toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={'px-3 py-2 flex items-center gap-1 text-sm ' + 
                  (viewMode === 'grid'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-white text-gray-600 hover:bg-gray-50')}
              >
                <Grid className="w-4 h-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={'px-3 py-2 flex items-center gap-1 text-sm border-l ' + 
                  (viewMode === 'timeline'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-white text-gray-600 hover:bg-gray-50')}
              >
                <List className="w-4 h-4" />
                Timeline
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <Card className="p-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Photo Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as PhotoType | 'all')}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="before">Before</option>
                    <option value="after">After</option>
                    <option value="progress">Progress</option>
                  </select>
                </div>

                {/* Treatment Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Treatment
                  </label>
                  <select
                    value={filterTreatment}
                    onChange={(e) => setFilterTreatment(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="all">All Treatments</option>
                    {treatmentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Group By (Timeline only) */}
                {viewMode === 'timeline' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group By
                    </label>
                    <select
                      value={groupBy}
                      onChange={(e) => setGroupBy(e.target.value as GroupBy)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="date">Date</option>
                      <option value="treatment">Treatment</option>
                    </select>
                  </div>
                )}

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <div className="sm:col-span-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFilterType('all');
                        setFilterTreatment('all');
                        setSearchQuery('');
                      }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Results Count */}
          <div className="text-sm text-gray-500 mb-4">
            Showing {filteredPhotos.length} of {allPhotos.length} photos
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onClick={() => handlePhotoClick(photo)}
                />
              ))}
            </div>
          )}

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <PhotoTimeline
              photos={filteredPhotos}
              onPhotoClick={handlePhotoClick}
              groupBy={groupBy}
            />
          )}

          {/* Empty State */}
          {filteredPhotos.length === 0 && (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-600">No photos found</h3>
              <p className="text-sm text-gray-400 mt-1">
                {activeFiltersCount > 0
                  ? 'Try adjusting your filters'
                  : 'Upload your first photo to get started'}
              </p>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setFilterType('all');
                    setFilterTreatment('all');
                    setSearchQuery('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          )}
        </>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          photos={filteredPhotos}
          onClose={handleCloseModal}
          onPhotoChange={setSelectedPhoto}
          onCompare={
            beforeAfterPairs.some(
              (p) =>
                p.before.id === selectedPhoto.id ||
                p.after.id === selectedPhoto.id
            )
              ? handleCompareFromModal
              : undefined
          }
        />
      )}
    </div>
  );
}
