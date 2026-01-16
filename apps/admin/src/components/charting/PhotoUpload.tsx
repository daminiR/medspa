'use client'

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react'
import {
  Camera,
  Upload,
  Image as ImageIcon,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Trash2,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  Grid,
  Maximize2,
  Eye,
  Calendar,
  Clock
} from 'lucide-react'
import { useChartingTheme } from '@/contexts/ChartingThemeContext'

// Photo types
export type PhotoType = 'before' | 'after' | 'during' | 'progress'
export type PhotoAngle = 'front' | 'left' | 'right' | '45-left' | '45-right' | 'top' | 'bottom'

export interface TreatmentPhoto {
  id: string
  file?: File
  url: string
  thumbnailUrl?: string
  type: PhotoType
  angle: PhotoAngle
  timestamp: Date
  notes?: string
  uploadProgress?: number
  uploadStatus?: 'pending' | 'uploading' | 'complete' | 'error'
  errorMessage?: string
}

interface PhotoUploadProps {
  photos: TreatmentPhoto[]
  onPhotosChange: (photos: TreatmentPhoto[] | ((prev: TreatmentPhoto[]) => TreatmentPhoto[])) => void
  onUpload?: (photo: TreatmentPhoto) => Promise<string> // Returns uploaded URL
  maxPhotos?: number
  allowedTypes?: PhotoType[]
  requireConsent?: boolean
  consentSigned?: boolean
  onConsentChange?: (signed: boolean) => void
  patientName?: string
  treatmentDate?: Date
  disabled?: boolean
}

// Photo angle configurations
const PHOTO_ANGLES: {
  id: PhotoAngle
  label: string
  icon: string
  description: string
}[] = [
  { id: 'front', label: 'Front', icon: '👤', description: 'Direct frontal view' },
  { id: 'left', label: 'Left Profile', icon: '👈', description: 'Left side profile' },
  { id: 'right', label: 'Right Profile', icon: '👉', description: 'Right side profile' },
  { id: '45-left', label: '45° Left', icon: '↖️', description: 'Left oblique view' },
  { id: '45-right', label: '45° Right', icon: '↗️', description: 'Right oblique view' },
  { id: 'top', label: 'Top', icon: '⬆️', description: 'Bird\'s eye view' },
  { id: 'bottom', label: 'Bottom', icon: '⬇️', description: 'Under chin view' },
]

// Photo type configurations
const PHOTO_TYPES: {
  id: PhotoType
  label: string
  color: string
  description: string
}[] = [
  { id: 'before', label: 'Before', color: 'blue', description: 'Pre-treatment photos' },
  { id: 'after', label: 'After', color: 'green', description: 'Post-treatment photos' },
  { id: 'during', label: 'During', color: 'orange', description: 'During treatment' },
  { id: 'progress', label: 'Progress', color: 'purple', description: 'Progress tracking' },
]

const getTypeColor = (type: PhotoType, isDark: boolean = false) => {
  if (isDark) {
    const darkColors: Record<PhotoType, { bg: string; border: string; text: string }> = {
      before: { bg: 'bg-blue-900/50', border: 'border-blue-700', text: 'text-blue-400' },
      after: { bg: 'bg-green-900/50', border: 'border-green-700', text: 'text-green-400' },
      during: { bg: 'bg-orange-900/50', border: 'border-orange-700', text: 'text-orange-400' },
      progress: { bg: 'bg-purple-900/50', border: 'border-purple-700', text: 'text-purple-400' },
    }
    return darkColors[type]
  }
  const colors: Record<PhotoType, { bg: string; border: string; text: string }> = {
    before: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' },
    after: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700' },
    during: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700' },
    progress: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700' },
  }
  return colors[type]
}

export function PhotoUpload({
  photos,
  onPhotosChange,
  onUpload,
  maxPhotos = 20,
  allowedTypes = ['before', 'after'],
  requireConsent = true,
  consentSigned = false,
  onConsentChange,
  patientName,
  treatmentDate,
  disabled = false
}: PhotoUploadProps) {
  // Theme context for dark/light mode
  const { isDark } = useChartingTheme()

  const [isDragging, setIsDragging] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<TreatmentPhoto | null>(null)
  const [activeType, setActiveType] = useState<PhotoType>(allowedTypes[0] || 'before')
  const [activeAngle, setActiveAngle] = useState<PhotoAngle>('front')
  const [viewMode, setViewMode] = useState<'grid' | 'comparison'>('grid')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Generate unique ID
  const generateId = () => `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    if (disabled || (requireConsent && !consentSigned)) return

    const fileArray = Array.from(files)
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'))

    if (photos.length + imageFiles.length > maxPhotos) {
      alert(`Maximum ${maxPhotos} photos allowed`)
      return
    }

    const newPhotos: TreatmentPhoto[] = []

    for (const file of imageFiles) {
      // Create object URL for preview
      const url = URL.createObjectURL(file)

      const photo: TreatmentPhoto = {
        id: generateId(),
        file,
        url,
        type: activeType,
        angle: activeAngle,
        timestamp: new Date(),
        uploadStatus: 'pending'
      }

      newPhotos.push(photo)
    }

    const updatedPhotos = [...photos, ...newPhotos]
    onPhotosChange(updatedPhotos)

    // Upload each photo if upload handler provided
    if (onUpload) {
      for (const photo of newPhotos) {
        try {
          // Update status to uploading
          const uploadingPhotos = updatedPhotos.map(p =>
            p.id === photo.id ? { ...p, uploadStatus: 'uploading' as const, uploadProgress: 0 } : p
          )
          onPhotosChange(uploadingPhotos)

          // Track upload progress locally
          let currentProgress = 0
          const progressInterval = setInterval(() => {
            currentProgress = Math.min(currentProgress + 10, 90)
          }, 200)

          // Perform actual upload
          const uploadedUrl = await onUpload(photo)

          clearInterval(progressInterval)

          // Update with final URL using direct array
          const completedPhotos = updatedPhotos.map(p =>
            p.id === photo.id
              ? { ...p, url: uploadedUrl, uploadStatus: 'complete' as const, uploadProgress: 100 }
              : p
          )
          onPhotosChange(completedPhotos)
        } catch (error) {
          // Handle upload error with direct array
          const errorPhotos = updatedPhotos.map(p =>
            p.id === photo.id
              ? { ...p, uploadStatus: 'error' as const, errorMessage: 'Upload failed' }
              : p
          )
          onPhotosChange(errorPhotos)
        }
      }
    } else {
      // Mark as complete if no upload handler (local preview mode)
      onPhotosChange(updatedPhotos.map(p => ({
        ...p,
        uploadStatus: 'complete' as const
      })))
    }
  }, [photos, activeType, activeAngle, maxPhotos, disabled, requireConsent, consentSigned, onPhotosChange, onUpload])

  // Drag and drop handlers
  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && (!requireConsent || consentSigned)) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }

  // File input change
  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  // Remove photo
  const removePhoto = (photoId: string) => {
    const photo = photos.find(p => p.id === photoId)
    if (photo?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(photo.url)
    }
    onPhotosChange(photos.filter(p => p.id !== photoId))
    if (selectedPhoto?.id === photoId) {
      setSelectedPhoto(null)
    }
  }

  // Update photo metadata
  const updatePhoto = (photoId: string, updates: Partial<TreatmentPhoto>) => {
    onPhotosChange(photos.map(p =>
      p.id === photoId ? { ...p, ...updates } : p
    ))
  }

  // Get photos grouped by type
  const getPhotosByType = (type: PhotoType) => photos.filter(p => p.type === type)

  // Check if we have before/after pairs for comparison
  const canCompare = getPhotosByType('before').length > 0 && getPhotosByType('after').length > 0

  return (
    <div className={`rounded-lg shadow-sm border transition-colors ${
      isDark
        ? 'bg-gray-800 border-gray-700'
        : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b ${
        isDark
          ? 'border-gray-700 bg-gradient-to-r from-blue-900/30 to-purple-900/30'
          : 'border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Treatment Photos</h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {patientName && <span>{patientName} - </span>}
                {photos.length} of {maxPhotos} photos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className={`flex rounded-lg p-0.5 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  viewMode === 'grid'
                    ? isDark
                      ? 'bg-gray-600 text-gray-100 shadow-sm'
                      : 'bg-white text-gray-900 shadow-sm'
                    : isDark
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('comparison')}
                disabled={!canCompare}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  viewMode === 'comparison'
                    ? isDark
                      ? 'bg-gray-600 text-gray-100 shadow-sm'
                      : 'bg-white text-gray-900 shadow-sm'
                    : isDark
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 hover:text-gray-900'
                } ${!canCompare ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Consent Warning */}
      {requireConsent && !consentSigned && (
        <div className={`px-6 py-4 border-b ${
          isDark
            ? 'bg-amber-900/30 border-amber-800'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>Photo consent required</p>
              <p className={`text-sm mt-1 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                Patient must sign photo consent before photos can be uploaded.
              </p>
              {onConsentChange && (
                <label className="flex items-center gap-2 mt-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentSigned}
                    onChange={(e) => onConsentChange(e.target.checked)}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className={`text-sm ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>Patient has signed photo consent form</span>
                </label>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Photo Type & Angle Selection */}
      <div className={`px-6 py-4 border-b space-y-4 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Type selection */}
        <div>
          <label className={`text-sm font-medium mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Photo Type</label>
          <div className="flex flex-wrap gap-2">
            {PHOTO_TYPES.filter(t => allowedTypes.includes(t.id)).map((type) => {
              const isSelected = activeType === type.id
              const colors = getTypeColor(type.id, isDark)
              const count = getPhotosByType(type.id).length

              return (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                    isSelected
                      ? `${colors.border} ${colors.bg} ${colors.text}`
                      : isDark
                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium">{type.label}</span>
                  {count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                      isSelected
                        ? 'bg-white/50'
                        : isDark ? 'bg-gray-600' : 'bg-gray-100'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Angle selection */}
        <div>
          <label className={`text-sm font-medium mb-2 block ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Camera Angle</label>
          <div className="flex flex-wrap gap-2">
            {PHOTO_ANGLES.map((angle) => (
              <button
                key={angle.id}
                onClick={() => setActiveAngle(angle.id)}
                className={`px-3 py-1.5 rounded-lg border transition-all text-sm ${
                  activeAngle === angle.id
                    ? isDark
                      ? 'border-purple-500 bg-purple-900/50 text-purple-300'
                      : 'border-purple-500 bg-purple-50 text-purple-700'
                    : isDark
                      ? 'border-gray-600 bg-gray-700 text-gray-400 hover:border-gray-500'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
                title={angle.description}
              >
                <span className="mr-1">{angle.icon}</span>
                {angle.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="p-6">
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !disabled && (!requireConsent || consentSigned) && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? isDark
                ? 'border-purple-500 bg-purple-900/30'
                : 'border-purple-500 bg-purple-50'
              : disabled || (requireConsent && !consentSigned)
              ? isDark
                ? 'border-gray-600 bg-gray-700/50 cursor-not-allowed'
                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : isDark
                ? 'border-gray-600 hover:border-purple-500 hover:bg-purple-900/20'
                : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled || (requireConsent && !consentSigned)}
          />

          <div className="flex flex-col items-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              isDragging
                ? isDark ? 'bg-purple-900/50' : 'bg-purple-100'
                : isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <Upload className={`w-8 h-8 ${
                isDragging
                  ? isDark ? 'text-purple-400' : 'text-purple-600'
                  : isDark ? 'text-gray-500' : 'text-gray-400'
              }`} />
            </div>
            <p className={`text-lg font-medium mb-1 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {isDragging ? 'Drop photos here' : 'Upload Treatment Photos'}
            </p>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Drag and drop or click to select images
            </p>
            <div className={`flex items-center gap-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <span>JPG, PNG, HEIC</span>
              <span>-</span>
              <span>Max 10MB each</span>
              <span>-</span>
              <span>{maxPhotos - photos.length} slots remaining</span>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Grid / Comparison View */}
      {photos.length > 0 && (
        <div className="px-6 pb-6">
          {viewMode === 'grid' ? (
            // Grid View
            <div>
              {allowedTypes.map((type) => {
                const typePhotos = getPhotosByType(type)
                if (typePhotos.length === 0) return null

                const typeConfig = PHOTO_TYPES.find(t => t.id === type)
                const colors = getTypeColor(type)

                return (
                  <div key={type} className="mb-6 last:mb-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
                        {typeConfig?.label} ({typePhotos.length})
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {typePhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                        >
                          <img
                            src={photo.url}
                            alt={`${photo.type} - ${photo.angle}`}
                            className="w-full h-full object-cover"
                          />

                          {/* Upload progress overlay */}
                          {photo.uploadStatus === 'uploading' && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                              <Loader2 className="w-6 h-6 text-white animate-spin mb-2" />
                              <div className="w-3/4 h-1 bg-gray-600 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-white transition-all duration-200"
                                  style={{ width: `${photo.uploadProgress || 0}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Error overlay */}
                          {photo.uploadStatus === 'error' && (
                            <div className="absolute inset-0 bg-red-500/80 flex flex-col items-center justify-center p-2">
                              <AlertCircle className="w-6 h-6 text-white mb-1" />
                              <p className="text-xs text-white text-center">Upload failed</p>
                            </div>
                          )}

                          {/* Success indicator */}
                          {photo.uploadStatus === 'complete' && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle className="w-5 h-5 text-green-500 bg-white rounded-full" />
                            </div>
                          )}

                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedPhoto(photo)
                              }}
                              className="p-2 bg-white rounded-full hover:bg-gray-100"
                              title="View"
                            >
                              <Eye className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removePhoto(photo.id)
                              }}
                              className="p-2 bg-white rounded-full hover:bg-red-50"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>

                          {/* Angle label */}
                          <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent">
                            <p className="text-xs text-white capitalize">{photo.angle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            // Comparison View
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">Before</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {getPhotosByType('before').map((photo) => (
                    <div key={photo.id} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img src={photo.url} alt="Before" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">After</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {getPhotosByType('after').map((photo) => (
                    <div key={photo.id} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img src={photo.url} alt="After" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-sm font-medium ${getTypeColor(selectedPhoto.type).bg} ${getTypeColor(selectedPhoto.type).text}`}>
                  {selectedPhoto.type}
                </span>
                <span className="text-sm text-gray-600 capitalize">{selectedPhoto.angle} view</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = selectedPhoto.url
                    link.download = `photo-${selectedPhoto.id}.jpg`
                    link.click()
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Download"
                >
                  <Download className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => removePhoto(selectedPhoto.id)}
                  className="p-2 hover:bg-red-50 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="relative">
              <img
                src={selectedPhoto.url}
                alt={`${selectedPhoto.type} - ${selectedPhoto.angle}`}
                className="max-h-[70vh] w-auto mx-auto"
              />
            </div>

            {/* Photo details */}
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {selectedPhoto.timestamp.toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {selectedPhoto.timestamp.toLocaleTimeString()}
                </div>
              </div>

              {/* Notes field */}
              <div className="mt-3">
                <label className="text-xs font-medium text-gray-700 block mb-1">Photo Notes</label>
                <input
                  type="text"
                  value={selectedPhoto.notes || ''}
                  onChange={(e) => updatePhoto(selectedPhoto.id, { notes: e.target.value })}
                  placeholder="Add notes about this photo..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Type/Angle editor */}
              <div className="mt-3 flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-700 block mb-1">Type</label>
                  <select
                    value={selectedPhoto.type}
                    onChange={(e) => updatePhoto(selectedPhoto.id, { type: e.target.value as PhotoType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {allowedTypes.map((type) => (
                      <option key={type} value={type}>
                        {PHOTO_TYPES.find(t => t.id === type)?.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-700 block mb-1">Angle</label>
                  <select
                    value={selectedPhoto.angle}
                    onChange={(e) => updatePhoto(selectedPhoto.id, { angle: e.target.value as PhotoAngle })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {PHOTO_ANGLES.map((angle) => (
                      <option key={angle.id} value={angle.id}>
                        {angle.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo tips */}
      {photos.length === 0 && (
        <div className="px-6 pb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Photo Documentation Tips</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                Use consistent lighting for before/after comparison
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                Maintain the same distance and camera angle
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                Patient should have neutral facial expression
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                Use a clean, plain background
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                Capture multiple angles: front, left profile, right profile, and 45°
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
