'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { PhotoUpload } from '@/components/photos';
import { useState } from 'react';

export default function UploadPage() {
  const router = useRouter();
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleUploadComplete = () => {
    setUploadSuccess(true);
    // Redirect after short delay
    setTimeout(() => {
      router.push('/photos');
    }, 2000);
  };

  const handleCancel = () => {
    router.push('/photos');
  };

  if (uploadSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Upload Complete!
          </h1>
          <p className="text-gray-600 mb-6">
            Your photos have been uploaded successfully and are pending review.
          </p>
          <p className="text-sm text-gray-400">
            Redirecting to your gallery...
          </p>
        </div>
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

      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Upload Photos
        </h1>
        <p className="text-gray-500 mt-2">
          Share your treatment progress with before, after, or progress photos
        </p>
      </div>

      {/* Upload Component */}
      <PhotoUpload
        onUploadComplete={handleUploadComplete}
        onCancel={handleCancel}
      />

      {/* Tips Section */}
      <div className="max-w-2xl mx-auto mt-8">
        <h3 className="font-semibold text-gray-900 mb-3">Photo Tips</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">1.</span>
            <span>
              Take photos in consistent lighting for better comparisons
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">2.</span>
            <span>
              Try to maintain the same angle and distance for before/after shots
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">3.</span>
            <span>
              Remove makeup and accessories for clearer skin documentation
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500 mt-0.5">4.</span>
            <span>
              Add notes to help remember the context of each photo
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
