'use client';

import { AlertTriangle, Phone, MapPin } from 'lucide-react';

interface EmergencyBannerProps {
  onDismiss?: () => void;
}

export default function EmergencyBanner({ onDismiss }: EmergencyBannerProps) {
  return (
    <div className="bg-red-50 border-b border-red-200 px-4 sm:px-6 py-4 animate-in slide-in-from-top duration-300">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-900">
            Medical Emergency Detected
          </p>
          <p className="text-sm text-red-700 mt-1">
            If this is a medical emergency, please call 911 or visit the nearest emergency room immediately.
            Our medical team has been notified.
          </p>
          <div className="flex flex-wrap gap-3 mt-3">
            <a
              href="tel:911"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <Phone className="w-4 h-4" />
              Call 911
            </a>
            <a
              href="https://www.google.com/maps/search/emergency+room+near+me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <MapPin className="w-4 h-4" />
              Find Nearest ER
            </a>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 text-red-600 text-sm font-medium hover:text-red-800 transition-colors"
              >
                I&apos;m okay
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
