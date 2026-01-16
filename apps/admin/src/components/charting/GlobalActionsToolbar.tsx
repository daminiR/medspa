'use client'

/**
 * GlobalActionsToolbar - Always-visible CRUD actions for charting
 *
 * Following PRACTITIONER_CONTEXT.md principles:
 * - Always visible (no collapsing/hiding)
 * - Works globally for whatever tool is active
 * - Positioned near zoom controls for easy access
 * - One tap for each action
 *
 * Actions:
 * - Undo: Revert last action
 * - Redo: Re-apply last undone action
 * - Clear All: Reset all markings (with confirmation for safety)
 */

import React, { useState, useCallback } from 'react'
import { Undo2, Redo2, Trash2, X, Check } from 'lucide-react'

interface GlobalActionsToolbarProps {
  // Undo/Redo callbacks and state
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean

  // Clear All callback - clears all markings
  onClearAll: () => void

  // Whether there's anything to clear
  hasContent?: boolean

  // Position relative to zoom controls
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

  // Theme support
  isDark?: boolean

  // Optional class name for additional styling
  className?: string
}

export function GlobalActionsToolbar({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClearAll,
  hasContent = true,
  position = 'bottom-right',
  isDark = true,
  className = ''
}: GlobalActionsToolbarProps) {
  // Confirmation state for clear all (prevents accidental taps)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // Position mapping - offset from zoom controls
  const positionClasses = {
    'top-left': 'top-3 left-3',
    'top-right': 'top-3 right-3',
    'bottom-left': 'bottom-3 left-3',
    // Bottom-right: position above where ZoomPanControls typically sits
    'bottom-right': 'bottom-16 right-3'
  }

  // Handle clear all with confirmation
  const handleClearClick = useCallback(() => {
    if (showClearConfirm) {
      // Already showing confirm, execute clear
      onClearAll()
      setShowClearConfirm(false)
    } else {
      // Show confirmation
      setShowClearConfirm(true)
      // Auto-hide after 3 seconds if not confirmed
      setTimeout(() => setShowClearConfirm(false), 3000)
    }
  }, [showClearConfirm, onClearAll])

  // Cancel clear confirmation
  const handleCancelClear = useCallback(() => {
    setShowClearConfirm(false)
  }, [])

  // Theme-based colors
  const bgClass = isDark ? 'bg-gray-800/95' : 'bg-white/95'
  const borderClass = isDark ? 'border-gray-700' : 'border-gray-200'
  const textClass = isDark ? 'text-gray-200' : 'text-gray-700'
  const hoverClass = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
  const activeClass = isDark ? 'active:bg-gray-600' : 'active:bg-gray-200'
  const disabledClass = isDark ? 'text-gray-500' : 'text-gray-300'

  return (
    <div
      className={`
        absolute ${positionClasses[position]} z-20
        flex items-center gap-1 p-1.5
        ${bgClass} backdrop-blur-sm
        rounded-lg shadow-lg border ${borderClass}
        ${className}
      `}
      role="toolbar"
      aria-label="Chart editing actions"
    >
      {/* Undo Button */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`
          p-2 rounded-md transition-colors
          ${canUndo
            ? `${textClass} ${hoverClass} ${activeClass}`
            : `${disabledClass} cursor-not-allowed`
          }
        `}
        title="Undo last action (Ctrl+Z)"
        aria-label="Undo"
      >
        <Undo2 className="w-4 h-4" />
      </button>

      {/* Redo Button */}
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`
          p-2 rounded-md transition-colors
          ${canRedo
            ? `${textClass} ${hoverClass} ${activeClass}`
            : `${disabledClass} cursor-not-allowed`
          }
        `}
        title="Redo last action (Ctrl+Shift+Z)"
        aria-label="Redo"
      >
        <Redo2 className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className={`w-px h-6 mx-1 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />

      {/* Clear All Button - with inline confirmation */}
      {showClearConfirm ? (
        <div className="flex items-center gap-1">
          <span className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'} px-1`}>
            Clear all?
          </span>
          <button
            onClick={handleClearClick}
            className={`
              p-2 rounded-md transition-colors
              bg-red-500 text-white hover:bg-red-600 active:bg-red-700
            `}
            title="Confirm clear all"
            aria-label="Confirm clear all"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancelClear}
            className={`
              p-2 rounded-md transition-colors
              ${textClass} ${hoverClass} ${activeClass}
            `}
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
              ? `${isDark ? 'text-red-400 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-50'} ${activeClass}`
              : `${disabledClass} cursor-not-allowed`
            }
          `}
          title="Clear all markings"
          aria-label="Clear all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

/**
 * Compact version for tighter spaces
 */
export function GlobalActionsToolbarCompact({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClearAll,
  hasContent = true,
  isDark = true,
  className = ''
}: Omit<GlobalActionsToolbarProps, 'position'>) {
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const handleClearClick = useCallback(() => {
    if (showClearConfirm) {
      onClearAll()
      setShowClearConfirm(false)
    } else {
      setShowClearConfirm(true)
      setTimeout(() => setShowClearConfirm(false), 3000)
    }
  }, [showClearConfirm, onClearAll])

  return (
    <div
      className={`
        inline-flex items-center gap-0.5 p-1
        ${isDark ? 'bg-gray-700' : 'bg-gray-100'} rounded-md
        ${className}
      `}
    >
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`
          p-1.5 rounded transition-colors
          ${canUndo
            ? `${isDark ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`
            : `${isDark ? 'text-gray-500' : 'text-gray-300'} cursor-not-allowed`
          }
        `}
        title="Undo"
        aria-label="Undo"
      >
        <Undo2 className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`
          p-1.5 rounded transition-colors
          ${canRedo
            ? `${isDark ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-600 hover:bg-gray-200'}`
            : `${isDark ? 'text-gray-500' : 'text-gray-300'} cursor-not-allowed`
          }
        `}
        title="Redo"
        aria-label="Redo"
      >
        <Redo2 className="w-3.5 h-3.5" />
      </button>

      {hasContent && (
        <>
          <div className={`w-px h-4 mx-0.5 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
          <button
            onClick={handleClearClick}
            className={`
              p-1.5 rounded transition-colors
              ${showClearConfirm
                ? 'bg-red-500 text-white'
                : `${isDark ? 'text-red-400 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-50'}`
              }
            `}
            title={showClearConfirm ? 'Click to confirm' : 'Clear all'}
            aria-label="Clear all"
          >
            {showClearConfirm ? <Check className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
        </>
      )}
    </div>
  )
}

export default GlobalActionsToolbar
