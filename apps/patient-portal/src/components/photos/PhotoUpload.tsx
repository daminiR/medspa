'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  Check,
  AlertCircle,
} from 'lucide-react';
import {
  photoService,
  TREATMENT_TYPES,
  BODY_AREAS,
  type PhotoType,
} from '@/lib/photos/photoService';

interface PhotoUploadProps {
  onUploadComplete?: () => void;
  onCancel?: () => void;
}

interface FilePreview {
  file: File;
  preview: string;
  error?: string;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function PhotoUpload({ onUploadComplete, onCancel }: PhotoUploadProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [photoType, setPhotoType] = useState<PhotoType>('progress');
  const [treatmentType, setTreatmentType] = useState('');
  const [bodyArea, setBodyArea] = useState('');
  const [notes, setNotes] = useState('');
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload JPG, PNG, or WebP images.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File is too large. Maximum size is 10MB.';
    }
    return null;
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const previews: FilePreview[] = fileArray.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      error: validateFile(file) || undefined,
    }));
    setFiles((prev) => [...prev, ...previews]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    const validFiles = files.filter((f) => !f.error);
    if (validFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < validFiles.length; i++) {
        await photoService.uploadPhoto(validFiles[i].file, {
          type: photoType,
          treatmentType: treatmentType || undefined,
          bodyArea: bodyArea || undefined,
          notes: notes || undefined,
          consentForMarketing: consentMarketing,
        });
        setUploadProgress(((i + 1) / validFiles.length) * 100);
      }

      // Clean up previews
      files.forEach((f) => URL.revokeObjectURL(f.preview));
      setFiles([]);

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const validFilesCount = files.filter((f) => !f.error).length;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-purple-600" />
          Upload Photos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Drop Zone */}
        <div
          className={'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ' + 
            (isDragOver
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50')}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-700 font-medium">
                Drag and drop your photos here
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to browse files
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </Button>
            <p className="text-xs text-gray-400">
              Accepts JPG, PNG, WebP up to 10MB
            </p>
          </div>
        </div>

        {/* File Previews */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">
              Selected Photos ({validFilesCount} valid)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {files.map((file, index) => (
                <div
                  key={index}
                  className={'relative rounded-lg overflow-hidden border ' + 
                    (file.error ? 'border-red-300 bg-red-50' : 'border-gray-200')}
                >
                  <div className="aspect-square relative">
                    <Image
                      src={file.preview}
                      alt={'Preview ' + (index + 1)}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    {file.error && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-gray-600 truncate">{file.file.name}</p>
                    <p className="text-xs text-gray-400">
                      {photoService.formatFileSize(file.file.size)}
                    </p>
                    {file.error && (
                      <p className="text-xs text-red-600 mt-1">{file.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photo Type Selection */}
        <div className="space-y-2">
          <Label>Photo Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {(['before', 'after', 'progress'] as PhotoType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setPhotoType(type)}
                className={'px-4 py-2 rounded-lg border text-sm font-medium transition-colors ' + 
                  (photoType === type
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50')}
              >
                {photoService.getPhotoTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Treatment Type */}
        <div className="space-y-2">
          <Label htmlFor="treatmentType">Treatment Type (Optional)</Label>
          <select
            id="treatmentType"
            value={treatmentType}
            onChange={(e) => setTreatmentType(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">Select treatment...</option>
            {TREATMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Body Area */}
        <div className="space-y-2">
          <Label htmlFor="bodyArea">Body Area (Optional)</Label>
          <select
            id="bodyArea"
            value={bodyArea}
            onChange={(e) => setBodyArea(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">Select area...</option>
            {BODY_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this photo..."
            className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
          />
        </div>

        {/* Marketing Consent */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consentMarketing}
            onChange={(e) => setConsentMarketing(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-600">
            I consent to having these photos used for marketing purposes
            (before/after galleries, promotional materials)
          </span>
        </label>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: uploadProgress + '%' }}
              />
            </div>
            <p className="text-sm text-center text-gray-600">
              Uploading... {Math.round(uploadProgress)}%
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isUploading}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            onClick={handleUpload}
            disabled={validFilesCount === 0 || isUploading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Upload {validFilesCount} Photo{validFilesCount !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PhotoUpload;
