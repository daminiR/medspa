'use client'

import React, { useState, useCallback } from 'react'
import { ZoomIn, ZoomOut, Maximize2, Move, Undo2, Redo2, Trash2, Check, X } from 'lucide-react'

interface ZoomPanControlsProps {
  scale: number
  isZoomed: boolean
  isPanning: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  minScale?: number
  maxScale?: number
  className?: string
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  // Global action props (optional - for enhanced mode)
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  onClearAll?: () => void
  hasContent?: boolean
}

/**
 * ZoomPanControls - A floating control panel for zoom/pan operations
 * Designed to be overlaid on chart components
 *
 * Now enhanced with global CRUD actions (undo, redo, clear) that are always visible
 * Following PRACTITIONER_CONTEXT.md: "Undo is one tap. Always visible."
 */
export function ZoomPanControls({
  scale,
  isZoomed,
  isPanning,
  onZoomIn,
  onZoomOut,
  onReset,
  minScale = 0.5,
  maxScale = 4,
  className = '',
  position = 'bottom-right',
  // Global actions (optional - enables enhanced mode)
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onClearAll,
  hasContent = false
}: ZoomPanControlsProps) {
  // State for clear all confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const positionClasses = {
    'top-left': 'top-3 left-3',
    'top-right': 'top-3 right-3',
    'bottom-left': 'bottom-3 left-3',
    'bottom-right': 'bottom-3 right-3'
  }

  const zoomPercentage = Math.round(scale * 100)
  const canZoomIn = scale < maxScale
  const canZoomOut = scale > minScale

  // Check if global actions are enabled
  const hasGlobalActions = onUndo && onRedo

  // Handle clear all with confirmation
  const handleClearClick = useCallback(() => {
    if (!onClearAll) return
    if (showClearConfirm) {
      onClearAll()
      setShowClearConfirm(false)
    } else {
      setShowClearConfirm(true)
      // Auto-hide after 3 seconds if not confirmed
      setTimeout(() => setShowClearConfirm(false), 3000)
    }
  }, [showClearConfirm, onClearAll])

  return (
    <div
      className={`
        absolute ${positionClasses[position]} z-20
        flex items-center gap-1 p-1.5
        bg-gray-800/95 backdrop-blur-sm
        rounded-lg shadow-lg border border-gray-700
        ${className}
      `}
    >
      {/* Global Actions Section - Undo, Redo, Clear (when enabled) */}
      {hasGlobalActions && (
        <>
          {/* Undo */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`
              p-2 rounded-md transition-colors
              ${canUndo
                ? 'text-gray-200 hover:bg-gray-700 active:bg-gray-600'
                : 'text-gray-500 cursor-not-allowed'
              }
            `}
            title="Undo last action (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          {/* Redo */}
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`
              p-2 rounded-md transition-colors
              ${canRedo
                ? 'text-gray-200 hover:bg-gray-700 active:bg-gray-600'
                : 'text-gray-500 cursor-not-allowed'
              }
            `}
            title="Redo last action (Ctrl+Shift+Z)"
            aria-label="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {/* Clear All - with inline confirmation */}
          {onClearAll && (
            showClearConfirm ? (
              <div className="flex items-center gap-1">
                <span className="text-xs text-red-400 px-1">Clear?</span>
                <button
                  onClick={handleClearClick}
                  className="p-2 rounded-md transition-colors bg-red-500 text-white hover:bg-red-600"
                  title="Confirm clear all"
                  aria-label="Confirm clear all"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="p-2 rounded-md transition-colors text-gray-200 hover:bg-gray-700"
                  title="Cancel"
                  aria-label="Cancel clear"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleClearClick}
                disabled={!hasContent}
                className={`
                  p-2 rounded-md transition-colors
                  ${hasContent
                    ? 'text-red-400 hover:bg-red-500/20 active:bg-red-500/30'
                    : 'text-gray-500 cursor-not-allowed'
                  }
                `}
                title="Clear all markings"
                aria-label="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )
          )}

          {/* Divider between actions and zoom */}
          <div className="w-px h-6 bg-gray-600 mx-1" />
        </>
      )}

      {/* Zoom Out */}
      <button
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className={`
          p-2 rounded-md transition-colors
          ${canZoomOut
            ? 'text-gray-200 hover:bg-gray-700 active:bg-gray-600'
            : 'text-gray-500 cursor-not-allowed'
          }
        `}
        title="Zoom out (Ctrl/Cmd + scroll down)"
        aria-label="Zoom out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      {/* Zoom Level Indicator */}
      <div
        className={`
          min-w-[52px] px-2 py-1 text-center text-xs font-medium
          rounded transition-colors
          ${isZoomed ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-300'}
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
          p-2 rounded-md transition-colors
          ${canZoomIn
            ? 'text-gray-200 hover:bg-gray-700 active:bg-gray-600'
            : 'text-gray-500 cursor-not-allowed'
          }
        `}
        title="Zoom in (Ctrl/Cmd + scroll up)"
        aria-label="Zoom in"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-600 mx-1" />

      {/* Reset / Fit to View */}
      <button
        onClick={onReset}
        disabled={!isZoomed}
        className={`
          p-2 rounded-md transition-colors
          ${isZoomed
            ? 'text-gray-200 hover:bg-gray-700 active:bg-gray-600'
            : 'text-gray-500 cursor-not-allowed'
          }
        `}
        title="Reset to fit view"
        aria-label="Reset zoom"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      {/* Pan Mode Indicator */}
      {isPanning && (
        <div
          className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium"
        >
          <Move className="w-3 h-3" />
          <span>Pan</span>
        </div>
      )}
    </div>
  )
}

/**
 * Compact version for smaller charts
 */
export function ZoomPanControlsCompact({
  scale,
  isZoomed,
  onZoomIn,
  onZoomOut,
  onReset,
  minScale = 0.5,
  maxScale = 4,
  className = ''
}: Omit<ZoomPanControlsProps, 'isPanning' | 'position'>) {
  const zoomPercentage = Math.round(scale * 100)
  const canZoomIn = scale < maxScale
  const canZoomOut = scale > minScale

  return (
    <div
      className={`
        inline-flex items-center gap-0.5 p-1
        bg-gray-100 rounded-md
        ${className}
      `}
    >
      <button
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className={`
          p-1.5 rounded transition-colors
          ${canZoomOut
            ? 'text-gray-600 hover:bg-gray-200'
            : 'text-gray-300 cursor-not-allowed'
          }
        `}
        title="Zoom out"
        aria-label="Zoom out"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      <span className="min-w-[40px] text-center text-xs font-medium text-gray-600">
        {zoomPercentage}%
      </span>

      <button
        onClick={onZoomIn}
        disabled={!canZoomIn}
        className={`
          p-1.5 rounded transition-colors
          ${canZoomIn
            ? 'text-gray-600 hover:bg-gray-200'
            : 'text-gray-300 cursor-not-allowed'
          }
        `}
        title="Zoom in"
        aria-label="Zoom in"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      {isZoomed && (
        <button
          onClick={onReset}
          className="p-1.5 rounded text-gray-600 hover:bg-gray-200 transition-colors"
          title="Reset zoom"
          aria-label="Reset zoom"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

export default ZoomPanControls
