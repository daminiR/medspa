'use client'

import React from 'react'
import { Box, User, Users } from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

export type ViewMode = '2d' | '3d'
export type BodyArea2D = 'face' | 'torso' | 'full-body'
export type Gender = 'male' | 'female'

export interface ViewModeToggleProps {
  // Current view mode (2D or 3D)
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void

  // 2D Body Area Selection (when viewMode is '2d')
  bodyArea2D?: BodyArea2D
  onBodyArea2DChange?: (area: BodyArea2D) => void

  // 3D Gender Selection (when viewMode is '3d')
  gender?: Gender
  onGenderChange?: (gender: Gender) => void

  // Optional compact mode for smaller spaces
  compact?: boolean
}

// =============================================================================
// VIEW MODE TOGGLE COMPONENT
// =============================================================================

/**
 * ViewModeToggle - Clean toggle between 2D and 3D charting modes
 *
 * Shows sub-options based on mode:
 * - 2D: Face, Torso, Full Body buttons
 * - 3D: Male, Female buttons
 *
 * Compact design with touch-friendly 44px+ targets
 */
export function ViewModeToggle({
  viewMode,
  onViewModeChange,
  bodyArea2D = 'face',
  onBodyArea2DChange,
  gender = 'female',
  onGenderChange,
  compact = false
}: ViewModeToggleProps) {
  return (
    <div className={`flex flex-col ${compact ? 'gap-2' : 'gap-3'}`}>
      {/* Primary Toggle: 2D vs 3D */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onViewModeChange('2d')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${
            viewMode === '2d'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          style={{ minHeight: '44px' }}
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            2D View
          </span>
        </button>
        <button
          onClick={() => onViewModeChange('3d')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-md transition-all ${
            viewMode === '3d'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          style={{ minHeight: '44px' }}
        >
          <span className="flex items-center justify-center gap-2">
            <Box className="w-4 h-4" />
            3D View
          </span>
        </button>
      </div>

      {/* Secondary Options - 2D Body Areas */}
      {viewMode === '2d' && onBodyArea2DChange && (
        <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => onBodyArea2DChange('face')}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
              bodyArea2D === 'face'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
            style={{ minHeight: '44px' }}
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="5" />
                <path d="M8.5 10.5c0 1 1.5 2 3.5 2s3.5-1 3.5-2" />
              </svg>
              Face
            </span>
          </button>
          <button
            onClick={() => onBodyArea2DChange('torso')}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
              bodyArea2D === 'torso'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
            style={{ minHeight: '44px' }}
          >
            <span className="flex items-center justify-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Torso
            </span>
          </button>
          <button
            onClick={() => onBodyArea2DChange('full-body')}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all ${
              bodyArea2D === 'full-body'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
            style={{ minHeight: '44px' }}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Full Body
            </span>
          </button>
        </div>
      )}

      {/* Secondary Options - 3D Gender Selection */}
      {viewMode === '3d' && onGenderChange && (
        <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => onGenderChange('male')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              gender === 'male'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
            style={{ minHeight: '44px' }}
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="10" cy="14" r="6" />
                <path d="M21 3l-6.5 6.5" />
                <path d="M15 3h6v6" />
              </svg>
              Male
            </span>
          </button>
          <button
            onClick={() => onGenderChange('female')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
              gender === 'female'
                ? 'bg-white text-pink-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
            style={{ minHeight: '44px' }}
          >
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="10" r="6" />
                <path d="M12 16v6" />
                <path d="M9 19h6" />
              </svg>
              Female
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

export default ViewModeToggle
