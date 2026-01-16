'use client';

import React from 'react';
import { MapPin, Check, X, AlertCircle } from 'lucide-react';
import type { DetectedZone } from './zoneDetection';

// =============================================================================
// TYPES
// =============================================================================

export interface ZoneDetectionSummaryProps {
  /** Detected zones from detectAllZones() */
  zones: DetectedZone[];
  /** Whether the summary is visible */
  isVisible: boolean;
  /** Callback to close/dismiss the summary */
  onClose: () => void;
  /** Callback when user confirms the detected zones */
  onConfirm?: (zones: DetectedZone[]) => void;
  /** Position of the summary panel */
  position?: 'top-right' | 'bottom-right' | 'center';
  /** Optional title override */
  title?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * ZoneDetectionSummary - Shows detected treatment zones after user draws on chart
 *
 * Design Philosophy (PRACTITIONER_CONTEXT.md):
 * - Appears only when explicitly triggered (not after every stroke)
 * - Clean, scannable list of detected zones
 * - One-tap confirm to accept, X to dismiss
 * - Non-blocking - practitioner can ignore and keep drawing
 */
export function ZoneDetectionSummary({
  zones,
  isVisible,
  onClose,
  onConfirm,
  position = 'top-right',
  title = 'Detected Treatment Areas',
}: ZoneDetectionSummaryProps) {
  if (!isVisible) return null;

  // Group zones by category for better organization
  const zonesByCategory: Record<string, DetectedZone[]> = {};
  for (const zone of zones) {
    const category = zone.category || 'other';
    if (!zonesByCategory[category]) {
      zonesByCategory[category] = [];
    }
    zonesByCategory[category].push(zone);
  }

  // Category display names
  const categoryNames: Record<string, string> = {
    'upper-face': 'Upper Face',
    'mid-face': 'Mid Face',
    'lower-face': 'Lower Face',
    'periorbital': 'Periorbital',
    'body': 'Body',
    'other': 'Other',
  };

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  };

  return (
    <div
      className={`
        absolute z-50 pointer-events-auto
        w-72 max-h-[400px] overflow-y-auto
        rounded-xl shadow-2xl
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        animate-in fade-in slide-in-from-top-2 duration-200
        ${positionClasses[position]}
      `}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {zones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No treatment areas detected.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Draw on the chart first, then tap Detect Zones.
            </p>
          </div>
        ) : (
          <>
            {/* Zone count badge */}
            <div className="mb-3 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-xs font-medium text-purple-700 dark:text-purple-300">
                {zones.length} zone{zones.length !== 1 ? 's' : ''} detected
              </p>
            </div>

            {/* Zones grouped by category */}
            <div className="space-y-3">
              {Object.entries(zonesByCategory).map(([category, categoryZones]) => (
                <div key={category}>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5 px-1">
                    {categoryNames[category] || category}
                  </h4>
                  <ul className="space-y-1">
                    {categoryZones.map((zone) => (
                      <li
                        key={zone.zoneId}
                        className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {zone.zoneName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {zone.confidence >= 0.5 && (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          )}
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              zone.confidence >= 0.7
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : zone.confidence >= 0.3
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                            }`}
                          >
                            {Math.round(zone.confidence * 100)}%
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer with confirm button */}
      {zones.length > 0 && onConfirm && (
        <div className="sticky bottom-0 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <button
            onClick={() => onConfirm(zones)}
            className="
              w-full px-4 py-2 rounded-lg
              bg-purple-600 hover:bg-purple-700
              text-white text-sm font-medium
              transition-colors
              flex items-center justify-center gap-2
            "
          >
            <Check className="w-4 h-4" />
            Confirm Zones
          </button>
        </div>
      )}
    </div>
  );
}

export default ZoneDetectionSummary;
