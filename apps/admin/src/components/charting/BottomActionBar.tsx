'use client'

/**
 * BottomActionBar - Always-visible action bar at bottom of charting area
 *
 * Psychology-based design (per PRACTITIONER_CONTEXT.md):
 * - Z-pattern scanning ends at bottom-right (completion zone)
 * - BOTTOM = global actions, accessible by either hand
 * - Undo/Redo must be ALWAYS visible, one tap
 * - Save/Complete actions go here (right side = completion zone)
 *
 * Layout:
 * - LEFT: Undo / Redo buttons (quick corrections)
 * - CENTER: Zoom controls [-] [100%] [+] [Reset]
 * - RIGHT: Save/Complete button (completion action)
 *
 * Design requirements:
 * - Fixed position at bottom of charting area
 * - Horizontal layout
 * - Touch targets 44px minimum (gloved fingers)
 * - Always visible (never hidden behind other elements)
 * - Theme-aware (light/dark mode support)
 */

import React, { useState, useCallback } from 'react'
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Save,
  Check,
  Loader2,
  Circle,
  AlertCircle,
} from 'lucide-react'

type SaveState = 'saved' | 'saving' | 'unsaved' | 'error'

export interface BottomActionBarProps {
  // Undo/Redo
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean

  // Zoom controls
  scale: number
  isZoomed: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  minScale?: number
  maxScale?: number

  // Save action
  onSave: () => void
  saveState: SaveState
  hasUnsavedChanges?: boolean

  // Theme
  isDark?: boolean

  // Optional className
  className?: string
}

export function BottomActionBar({
  // Undo/Redo
  onUndo,
  onRedo,
  canUndo,
  canRedo,

  // Zoom
  scale,
  isZoomed,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  minScale = 0.5,
  maxScale = 4,

  // Save
  onSave,
  saveState,
  hasUnsavedChanges = false,

  // Theme
  isDark = true,

  // Style
  className = '',
}: BottomActionBarProps) {
  const zoomPercentage = Math.round(scale * 100)
  const canZoomIn = scale < maxScale
  const canZoomOut = scale > minScale

  // Theme-based styling
  const bgClass = isDark ? 'bg-gray-800/95' : 'bg-white/95'
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200'
  const textClass = isDark ? 'text-gray-200' : 'text-gray-700'
  const disabledClass = isDark ? 'text-gray-500' : 'text-gray-300'
  const hoverClass = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  const activeClass = isDark ? 'active:bg-gray-600' : 'active:bg-gray-200'
  const dividerClass = isDark ? 'bg-gray-600' : 'bg-gray-300'

  // Button base class with minimum 44px touch target
  const buttonBase = `
    min-w-[44px] min-h-[44px] p-2.5 rounded-lg transition-colors
    flex items-center justify-center
  `

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-[1100]
        ${bgClass} backdrop-blur-sm
        border-t ${borderClass}
        shadow-lg
        ${className}
      `}
      role="toolbar"
      aria-label="Charting actions"
    >
      <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* LEFT SECTION: Undo / Redo */}
        <div className="flex items-center gap-1">
          {/* Undo Button */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`
              ${buttonBase}
              ${canUndo
                ? `${textClass} ${hoverClass} ${activeClass}`
                : `${disabledClass} cursor-not-allowed`
              }
            `}
            title="Undo (Ctrl+Z)"
            aria-label="Undo last action"
          >
            <Undo2 className="w-5 h-5" />
          </button>

          {/* Redo Button */}
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`
              ${buttonBase}
              ${canRedo
                ? `${textClass} ${hoverClass} ${activeClass}`
                : `${disabledClass} cursor-not-allowed`
              }
            `}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo last action"
          >
            <Redo2 className="w-5 h-5" />
          </button>
        </div>

        {/* CENTER SECTION: Zoom Controls */}
        <div className="flex items-center gap-1">
          {/* Zoom Out */}
          <button
            onClick={onZoomOut}
            disabled={!canZoomOut}
            className={`
              ${buttonBase}
              ${canZoomOut
                ? `${textClass} ${hoverClass} ${activeClass}`
                : `${disabledClass} cursor-not-allowed`
              }
            `}
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          {/* Zoom Percentage Indicator */}
          <div
            className={`
              min-w-[60px] px-3 py-2 text-center text-sm font-medium
              rounded-lg transition-colors
              ${isZoomed
                ? `${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`
                : `${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`
              }
            `}
            title="Current zoom level"
          >
            {zoomPercentage}%
          </div>

          {/* Zoom In */}
          <button
            onClick={onZoomIn}
            disabled={!canZoomIn}
            className={`
              ${buttonBase}
              ${canZoomIn
                ? `${textClass} ${hoverClass} ${activeClass}`
                : `${disabledClass} cursor-not-allowed`
              }
            `}
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          {/* Divider */}
          <div className={`w-px h-6 mx-1 ${dividerClass}`} />

          {/* Reset Zoom */}
          <button
            onClick={onZoomReset}
            disabled={!isZoomed}
            className={`
              ${buttonBase}
              ${isZoomed
                ? `${textClass} ${hoverClass} ${activeClass}`
                : `${disabledClass} cursor-not-allowed`
              }
            `}
            title="Reset to fit view"
            aria-label="Reset zoom"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>

        {/* RIGHT SECTION: Save Button with Status */}
        <div className="flex items-center gap-2">
          {/* Save Status Indicator */}
          <div className="flex items-center gap-1.5 text-sm">
            {saveState === 'saved' && !hasUnsavedChanges && (
              <span className={`flex items-center gap-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                <Check className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Saved</span>
              </span>
            )}
            {saveState === 'saving' && (
              <span className={`flex items-center gap-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs hidden sm:inline">Saving...</span>
              </span>
            )}
            {(saveState === 'unsaved' || (saveState === 'saved' && hasUnsavedChanges)) && (
              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Circle className={`w-2.5 h-2.5 fill-amber-400 text-amber-400`} />
                <span className="text-xs hidden sm:inline">Unsaved</span>
              </span>
            )}
            {saveState === 'error' && (
              <span className={`flex items-center gap-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Error</span>
              </span>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={onSave}
            disabled={saveState === 'saving'}
            className={`
              ${buttonBase}
              font-medium gap-2
              ${saveState === 'saving'
                ? `${isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
                : (saveState === 'unsaved' || hasUnsavedChanges)
                  ? 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
                  : `${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
              }
            `}
            title="Save chart (Cmd/Ctrl+S)"
            aria-label="Save chart"
          >
            <Save className="w-5 h-5" />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact version for narrower screens or when space is limited
 * Same functionality, smaller touch targets (still meets minimum)
 */
export function BottomActionBarCompact({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  scale,
  isZoomed,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  minScale = 0.5,
  maxScale = 4,
  onSave,
  saveState,
  hasUnsavedChanges = false,
  isDark = true,
  className = '',
}: BottomActionBarProps) {
  const zoomPercentage = Math.round(scale * 100)
  const canZoomIn = scale < maxScale
  const canZoomOut = scale > minScale

  const bgClass = isDark ? 'bg-gray-800/95' : 'bg-white/95'
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200'
  const textClass = isDark ? 'text-gray-200' : 'text-gray-700'
  const disabledClass = isDark ? 'text-gray-500' : 'text-gray-300'
  const hoverClass = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'

  const buttonBase = 'min-w-[40px] min-h-[40px] p-2 rounded-md transition-colors flex items-center justify-center'

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-[1100]
        ${bgClass} backdrop-blur-sm
        border-t ${borderClass}
        shadow-lg
        ${className}
      `}
    >
      <div className="px-3 py-1.5 flex items-center justify-between">
        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`${buttonBase} ${canUndo ? `${textClass} ${hoverClass}` : disabledClass}`}
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`${buttonBase} ${canRedo ? `${textClass} ${hoverClass}` : disabledClass}`}
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={onZoomOut}
            disabled={!canZoomOut}
            className={`${buttonBase} ${canZoomOut ? `${textClass} ${hoverClass}` : disabledClass}`}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className={`min-w-[48px] text-center text-xs font-medium ${textClass}`}>
            {zoomPercentage}%
          </span>
          <button
            onClick={onZoomIn}
            disabled={!canZoomIn}
            className={`${buttonBase} ${canZoomIn ? `${textClass} ${hoverClass}` : disabledClass}`}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          {isZoomed && (
            <button
              onClick={onZoomReset}
              className={`${buttonBase} ${textClass} ${hoverClass}`}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Save */}
        <button
          onClick={onSave}
          disabled={saveState === 'saving'}
          className={`
            ${buttonBase} px-3
            ${saveState === 'saving'
              ? 'bg-gray-700 text-gray-500'
              : (saveState === 'unsaved' || hasUnsavedChanges)
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : `${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
            }
          `}
        >
          {saveState === 'saving' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}

/**
 * Simple version without zoom controls
 * Use when zoom is handled by individual chart components
 */
export interface BottomActionBarSimpleProps {
  // Undo/Redo
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean

  // Save action
  onSave: () => void
  saveState: SaveState
  hasUnsavedChanges?: boolean

  // Theme
  isDark?: boolean

  // Optional className
  className?: string
}

export function BottomActionBarSimple({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  saveState,
  hasUnsavedChanges = false,
  isDark = true,
  className = '',
}: BottomActionBarSimpleProps) {
  // Theme-based styling
  const bgClass = isDark ? 'bg-gray-800/95' : 'bg-white/95'
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200'
  const textClass = isDark ? 'text-gray-200' : 'text-gray-700'
  const disabledClass = isDark ? 'text-gray-500' : 'text-gray-300'
  const hoverClass = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  const activeClass = isDark ? 'active:bg-gray-600' : 'active:bg-gray-200'

  // Button base class with minimum 44px touch target
  const buttonBase = `
    min-w-[44px] min-h-[44px] p-2.5 rounded-lg transition-colors
    flex items-center justify-center
  `

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-[1100]
        ${bgClass} backdrop-blur-sm
        border-t ${borderClass}
        shadow-lg
        ${className}
      `}
      role="toolbar"
      aria-label="Charting actions"
    >
      <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* LEFT SECTION: Undo / Redo */}
        <div className="flex items-center gap-1">
          {/* Undo Button */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`
              ${buttonBase}
              ${canUndo
                ? `${textClass} ${hoverClass} ${activeClass}`
                : `${disabledClass} cursor-not-allowed`
              }
            `}
            title="Undo (Ctrl+Z)"
            aria-label="Undo last action"
          >
            <Undo2 className="w-5 h-5" />
          </button>

          {/* Redo Button */}
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`
              ${buttonBase}
              ${canRedo
                ? `${textClass} ${hoverClass} ${activeClass}`
                : `${disabledClass} cursor-not-allowed`
              }
            `}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo last action"
          >
            <Redo2 className="w-5 h-5" />
          </button>
        </div>

        {/* CENTER SECTION: Spacer for visual balance */}
        <div className="flex-1" />

        {/* RIGHT SECTION: Save Button with Status */}
        <div className="flex items-center gap-2">
          {/* Save Status Indicator */}
          <div className="flex items-center gap-1.5 text-sm">
            {saveState === 'saved' && !hasUnsavedChanges && (
              <span className={`flex items-center gap-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                <Check className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Saved</span>
              </span>
            )}
            {saveState === 'saving' && (
              <span className={`flex items-center gap-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs hidden sm:inline">Saving...</span>
              </span>
            )}
            {(saveState === 'unsaved' || (saveState === 'saved' && hasUnsavedChanges)) && (
              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Circle className={`w-2.5 h-2.5 fill-amber-400 text-amber-400`} />
                <span className="text-xs hidden sm:inline">Unsaved</span>
              </span>
            )}
            {saveState === 'error' && (
              <span className={`flex items-center gap-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Error</span>
              </span>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={onSave}
            disabled={saveState === 'saving'}
            className={`
              ${buttonBase}
              font-medium gap-2
              ${saveState === 'saving'
                ? `${isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
                : (saveState === 'unsaved' || hasUnsavedChanges)
                  ? 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
                  : `${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
              }
            `}
            title="Save chart (Cmd/Ctrl+S)"
            aria-label="Save chart"
          >
            <Save className="w-5 h-5" />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default BottomActionBar
