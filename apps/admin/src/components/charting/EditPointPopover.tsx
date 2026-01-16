'use client'

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { X, Trash2, Minus, Plus } from 'lucide-react'

// =============================================================================
// TYPES
// =============================================================================

export interface EditingPoint {
  id: string
  zoneId?: string  // For zone-based points
  x: number        // Screen position for popover
  y: number
  currentValue: number  // Current units or volume
  pointName?: string    // Display name for the point
}

interface EditPointPopoverProps {
  editingPoint: EditingPoint | null
  productType: 'neurotoxin' | 'filler'
  containerRef: React.RefObject<HTMLElement | null>
  onUpdateValue: (id: string, value: number) => void
  onDelete: (id: string) => void
  onClose: () => void
  presets?: number[]
  readOnly?: boolean
}

// Default presets
const DEFAULT_NEUROTOXIN_PRESETS = [5, 10, 15, 20]
const DEFAULT_FILLER_PRESETS = [0.2, 0.5, 1.0, 1.5]

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function EditPointPopover({
  editingPoint,
  productType,
  containerRef,
  onUpdateValue,
  onDelete,
  onClose,
  presets,
  readOnly = false
}: EditPointPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const [localValue, setLocalValue] = useState<number>(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  // Update local value when editing point changes
  useEffect(() => {
    if (editingPoint) {
      setLocalValue(editingPoint.currentValue)
    }
  }, [editingPoint])

  // Calculate smart position to stay within bounds
  useEffect(() => {
    if (!editingPoint || !containerRef.current || !popoverRef.current) return

    const container = containerRef.current.getBoundingClientRect()
    const popover = popoverRef.current.getBoundingClientRect()

    const PADDING = 8
    const OFFSET_Y = 10 // Offset below the point

    let x = editingPoint.x
    let y = editingPoint.y + OFFSET_Y

    // Ensure popover stays within horizontal bounds
    const popoverWidth = popover.width || 200
    if (x + popoverWidth / 2 > container.width - PADDING) {
      x = container.width - popoverWidth / 2 - PADDING
    }
    if (x - popoverWidth / 2 < PADDING) {
      x = popoverWidth / 2 + PADDING
    }

    // Ensure popover stays within vertical bounds
    const popoverHeight = popover.height || 120
    if (y + popoverHeight > container.height - PADDING) {
      // Show above the point instead
      y = editingPoint.y - popoverHeight - OFFSET_Y
    }
    if (y < PADDING) {
      y = PADDING
    }

    setPosition({ x, y })
  }, [editingPoint, containerRef])

  // Handle click outside to close
  useEffect(() => {
    if (!editingPoint) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    // Small delay to prevent immediate close from the same tap that opened it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [editingPoint, onClose])

  // Handle value change with immediate update
  const handleValueChange = useCallback((newValue: number) => {
    const clampedValue = Math.max(0, newValue)
    setLocalValue(clampedValue)
    if (editingPoint) {
      onUpdateValue(editingPoint.id, clampedValue)
    }
  }, [editingPoint, onUpdateValue])

  // Handle increment/decrement
  const handleIncrement = useCallback(() => {
    const step = productType === 'neurotoxin' ? 1 : 0.1
    handleValueChange(parseFloat((localValue + step).toFixed(2)))
  }, [localValue, productType, handleValueChange])

  const handleDecrement = useCallback(() => {
    const step = productType === 'neurotoxin' ? 1 : 0.1
    handleValueChange(parseFloat((localValue - step).toFixed(2)))
  }, [localValue, productType, handleValueChange])

  // Handle delete with confirmation
  const handleDelete = useCallback(() => {
    if (editingPoint) {
      onDelete(editingPoint.id)
      onClose()
    }
  }, [editingPoint, onDelete, onClose])

  // Handle keyboard input
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value)) {
      handleValueChange(value)
    }
  }, [handleValueChange])

  if (!editingPoint) return null

  const effectivePresets = presets || (productType === 'neurotoxin' ? DEFAULT_NEUROTOXIN_PRESETS : DEFAULT_FILLER_PRESETS)
  const unitLabel = productType === 'neurotoxin' ? 'u' : 'ml'
  const colors = productType === 'neurotoxin'
    ? { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', light: 'bg-purple-50', text: 'text-purple-700' }
    : { bg: 'bg-pink-600', hover: 'hover:bg-pink-700', light: 'bg-pink-50', text: 'text-pink-700' }

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 p-3 min-w-[200px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)'
      }}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-300 truncate max-w-[140px]">
          {editingPoint.pointName || 'Injection Point'}
        </span>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white rounded transition-colors"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Value Input Row */}
      <div className="flex items-center gap-2 mb-2">
        {!readOnly && (
          <button
            onClick={handleDecrement}
            className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors touch-manipulation"
            aria-label="Decrease"
          >
            <Minus className="w-4 h-4" />
          </button>
        )}

        <div className="flex-1 relative">
          <input
            type="number"
            value={localValue}
            onChange={handleInputChange}
            step={productType === 'neurotoxin' ? 1 : 0.1}
            min={0}
            readOnly={readOnly}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-center font-bold text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            style={{
              WebkitAppearance: 'none',
              MozAppearance: 'textfield',
              appearance: 'textfield'
            }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
            {unitLabel}
          </span>
        </div>

        {!readOnly && (
          <button
            onClick={handleIncrement}
            className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors touch-manipulation"
            aria-label="Increase"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Presets */}
      {!readOnly && (
        <div className="flex gap-1.5 mb-2">
          {effectivePresets.map((preset) => (
            <button
              key={preset}
              onClick={() => handleValueChange(preset)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors touch-manipulation ${
                localValue === preset
                  ? `${colors.bg} text-white`
                  : `${colors.light} ${colors.text} ${colors.hover} hover:text-white`
              }`}
            >
              {preset}{unitLabel}
            </button>
          ))}
        </div>
      )}

      {/* Delete Button */}
      {!readOnly && (
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 text-sm font-medium rounded-lg transition-colors touch-manipulation"
          aria-label="Delete point"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      )}
    </div>
  )
}

export default EditPointPopover
