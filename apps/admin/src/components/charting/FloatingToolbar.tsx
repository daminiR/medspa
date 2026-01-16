'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, GripVertical, Pipette } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

export interface FloatingToolbarProps {
  // Product selection
  products: Array<{
    id: string
    name: string
    brand: string
    type: 'neurotoxin' | 'filler' | 'biostimulator' | 'skin-booster'
    color?: string
  }>
  selectedProductId?: string
  onProductSelect: (productId: string) => void

  // Dosage quick-picks
  dosageType: 'units' | 'ml'
  dosageOptions: number[] // e.g., [1, 2, 5, 10] for units or [0.1, 0.25, 0.5, 1.0] for ml
  selectedDosage?: number
  onDosageSelect: (dosage: number) => void

  // Color picker (for annotation/drawing tools)
  colorOptions: string[] // Array of hex colors
  selectedColor?: string
  onColorSelect: (color: string) => void

  // Toolbar behavior
  autoHideDelay?: number // ms before auto-hiding (default: 3000)
  initialPosition?: { x: number; y: number }
  minPosition?: { x: number; y: number }
  maxPosition?: { x: number; y: number }
  onClose?: () => void
}

// ============================================================================
// COMPONENT
// ============================================================================

export function FloatingToolbar({
  products,
  selectedProductId,
  onProductSelect,
  dosageType,
  dosageOptions,
  selectedDosage,
  onDosageSelect,
  colorOptions,
  selectedColor,
  onColorSelect,
  autoHideDelay = 3000,
  initialPosition = { x: 20, y: 100 },
  minPosition = { x: 0, y: 0 },
  maxPosition,
  onClose
}: FloatingToolbarProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const toolbarRef = useRef<HTMLDivElement>(null)
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastInteractionRef = useRef<number>(Date.now())

  // ============================================================================
  // AUTO-HIDE LOGIC
  // ============================================================================

  const resetAutoHideTimer = useCallback(() => {
    lastInteractionRef.current = Date.now()
    setIsVisible(true)

    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current)
    }

    autoHideTimerRef.current = setTimeout(() => {
      setIsVisible(false)
    }, autoHideDelay)
  }, [autoHideDelay])

  useEffect(() => {
    resetAutoHideTimer()
    return () => {
      if (autoHideTimerRef.current) {
        clearTimeout(autoHideTimerRef.current)
      }
    }
  }, [resetAutoHideTimer])

  // ============================================================================
  // DRAG FUNCTIONALITY
  // ============================================================================

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    resetAutoHideTimer()

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    setDragOffset({
      x: clientX - position.x,
      y: clientY - position.y
    })
  }, [position, resetAutoHideTimer])

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    let newX = clientX - dragOffset.x
    let newY = clientY - dragOffset.y

    // Apply position constraints
    newX = Math.max(minPosition.x, newX)
    newY = Math.max(minPosition.y, newY)

    if (maxPosition) {
      const toolbarWidth = toolbarRef.current?.offsetWidth || 0
      const toolbarHeight = toolbarRef.current?.offsetHeight || 0
      newX = Math.min(maxPosition.x - toolbarWidth, newX)
      newY = Math.min(maxPosition.y - toolbarHeight, newY)
    }

    setPosition({ x: newX, y: newY })
  }, [isDragging, dragOffset, minPosition, maxPosition])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove)
      window.addEventListener('mouseup', handleDragEnd)
      window.addEventListener('touchmove', handleDragMove)
      window.addEventListener('touchend', handleDragEnd)

      return () => {
        window.removeEventListener('mousemove', handleDragMove)
        window.removeEventListener('mouseup', handleDragEnd)
        window.removeEventListener('touchmove', handleDragMove)
        window.removeEventListener('touchend', handleDragEnd)
      }
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  // ============================================================================
  // INTERACTION HANDLERS
  // ============================================================================

  const handleProductSelect = (productId: string) => {
    onProductSelect(productId)
    resetAutoHideTimer()
  }

  const handleDosageSelect = (dosage: number) => {
    onDosageSelect(dosage)
    resetAutoHideTimer()
  }

  const handleColorSelect = (color: string) => {
    onColorSelect(color)
    resetAutoHideTimer()
  }

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
    resetAutoHideTimer()
  }

  const handleToolbarInteraction = () => {
    resetAutoHideTimer()
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      ref={toolbarRef}
      className={`fixed z-[1000] transition-all duration-300 pointer-events-auto ${
        isVisible ? 'opacity-100' : 'opacity-30 hover:opacity-100'
      } ${isDragging ? 'cursor-grabbing' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        touchAction: 'none'
      }}
      onMouseEnter={handleToolbarInteraction}
      onTouchStart={handleToolbarInteraction}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Drag Handle & Header */}
        <div
          className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 cursor-grab active:cursor-grabbing"
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="flex items-center gap-2 text-white">
            <GripVertical className="w-4 h-4" />
            <span className="text-xs font-medium">Charting Tools</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleToggleCollapse}
              className="w-6 h-6 rounded hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? '+' : '−'}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="w-6 h-6 rounded hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Toolbar Content */}
        {!isCollapsed && (
          <div className="p-3 space-y-3">
            {/* Product Selector */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                Product
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {products.map((product) => {
                  const isSelected = selectedProductId === product.id
                  const bgColor = product.type === 'neurotoxin'
                    ? 'from-purple-500 to-purple-600'
                    : product.type === 'filler'
                    ? 'from-pink-500 to-pink-600'
                    : product.type === 'biostimulator'
                    ? 'from-orange-500 to-orange-600'
                    : 'from-blue-500 to-blue-600'

                  return (
                    <button
                      key={product.id}
                      onClick={() => handleProductSelect(product.id)}
                      className={`
                        min-h-[48px] px-3 py-2 rounded-lg text-xs font-medium transition-all
                        ${isSelected
                          ? `bg-gradient-to-br ${bgColor} text-white shadow-md scale-105 ring-2 ring-offset-2 ring-purple-400`
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      title={`${product.brand} ${product.name}`}
                    >
                      <div className="truncate">{product.brand}</div>
                      <div className="truncate text-[10px] opacity-90">{product.name}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Dosage Quick-Picks */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                Dosage ({dosageType === 'units' ? 'units' : 'ml'})
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {dosageOptions.map((dosage) => {
                  const isSelected = selectedDosage === dosage
                  return (
                    <button
                      key={dosage}
                      onClick={() => handleDosageSelect(dosage)}
                      className={`
                        min-h-[48px] min-w-[48px] rounded-lg text-sm font-semibold transition-all
                        ${isSelected
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-md scale-105 ring-2 ring-offset-2 ring-purple-400'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      title={`${dosage} ${dosageType === 'units' ? 'units' : 'ml'}`}
                    >
                      {dosageType === 'units' ? dosage : dosage.toFixed(dosage < 1 ? 2 : 1)}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <Pipette className="w-3 h-3" />
                Annotation Color
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {colorOptions.map((color) => {
                  const isSelected = selectedColor === color
                  return (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`
                        min-h-[48px] min-w-[48px] rounded-lg transition-all
                        ${isSelected
                          ? 'scale-110 ring-2 ring-offset-2 ring-gray-400 shadow-md'
                          : 'hover:scale-105'
                        }
                      `}
                      style={{ backgroundColor: color }}
                      title={color}
                      aria-label={`Select color ${color}`}
                    >
                      {isSelected && (
                        <div className="flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white drop-shadow-md"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Hint Text */}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-[10px] text-gray-500 text-center">
                Drag toolbar to move • Auto-hides after {autoHideDelay / 1000}s
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/**
 * Example usage:
 *
 * ```tsx
 * const [showToolbar, setShowToolbar] = useState(true)
 * const [selectedProduct, setSelectedProduct] = useState<string>()
 * const [selectedDosage, setSelectedDosage] = useState<number>()
 * const [selectedColor, setSelectedColor] = useState('#9333EA')
 *
 * return (
 *   <div>
 *     {showToolbar && (
 *       <FloatingToolbar
 *         products={[
 *           { id: '1', name: 'Cosmetic', brand: 'Botox', type: 'neurotoxin' },
 *           { id: '2', name: 'Ultra Plus', brand: 'Juvederm', type: 'filler' }
 *         ]}
 *         selectedProductId={selectedProduct}
 *         onProductSelect={setSelectedProduct}
 *         dosageType="units"
 *         dosageOptions={[1, 2, 4, 5, 10, 15, 20, 25]}
 *         selectedDosage={selectedDosage}
 *         onDosageSelect={setSelectedDosage}
 *         colorOptions={[
 *           '#9333EA', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#3B82F6'
 *         ]}
 *         selectedColor={selectedColor}
 *         onColorSelect={setSelectedColor}
 *         autoHideDelay={3000}
 *         onClose={() => setShowToolbar(false)}
 *       />
 *     )}
 *   </div>
 * )
 * ```
 */
