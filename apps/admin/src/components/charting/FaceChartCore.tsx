'use client'

/**
 * FaceChartCore - Core face chart component for InjectionMap
 *
 * This is a refactored sub-component that contains just the face SVG
 * and interaction logic. It's designed to be embedded in InjectionMap
 * which provides the header, controls, and layout.
 *
 * Key differences from InteractiveFaceChart:
 * - No outer container/layout
 * - No header/toolbar
 * - Controlled component (accepts injections as props, emits onChange)
 * - Just the core face chart and zone interactions
 *
 * Features:
 * - Long-press drag to reposition freehand injection points
 * - Visual feedback during drag mode (glow effect, color change)
 * - Works with both touch and stylus input
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import Image from 'next/image'
import {
  useChartingSettings,
  TreatmentZone,
} from '@/contexts/ChartingSettingsContext'
import { MapPin } from 'lucide-react'
import { EditPointPopover, EditingPoint } from './EditPointPopover'
import { getProductColor } from '@/lib/data/chartingProducts'

// =============================================================================
// DRAG STATE TYPES
// =============================================================================

interface DragState {
  isDragging: boolean
  pointId: string | null
  startPosition: { x: number; y: number } | null
  currentPosition: { x: number; y: number } | null
  originalPosition: { x: number; y: number } | null
}

const LONG_PRESS_DURATION = 350 // ms before entering drag mode
const DRAG_MOVE_THRESHOLD = 5 // pixels - movement above this cancels long-press detection

// =============================================================================
// TYPES
// =============================================================================

export interface InjectionPoint {
  id: string
  zoneId: string
  units?: number
  volume?: number
  depthId: string
  techniqueId: string
  needleGaugeId: string
  productId?: string
  productColor?: string // Store the product color when the point is created
  notes?: string
  timestamp: Date
}

export interface FreehandPoint {
  id: string
  x: number // percentage 0-100
  y: number // percentage 0-100
  customName?: string
  units?: number
  volume?: number
  depthId: string
  techniqueId: string
  needleGaugeId: string
  productId?: string
  productColor?: string // Store the product color when the point is created
  notes?: string
  timestamp: Date
}

type DrawingMode = 'zones' | 'freehand'

export interface FaceChartCoreProps {
  // Required props
  productType: 'neurotoxin' | 'filler'
  gender: 'male' | 'female'

  // Injection data (controlled)
  injectionPoints: Map<string, InjectionPoint>
  onInjectionPointsChange: (points: Map<string, InjectionPoint>) => void

  freehandPoints?: Map<string, FreehandPoint>
  onFreehandPointsChange?: (points: Map<string, FreehandPoint>) => void

  // Configuration
  selectedProductId?: string
  selectedProductColor?: string // The color of the selected product (for new points)
  patientLastTreatment?: Map<string, InjectionPoint>
  readOnly?: boolean

  // Drawing mode control (optional - defaults to 'zones')
  drawingMode?: DrawingMode
  onDrawingModeChange?: (mode: DrawingMode) => void

  // Zoom level for counter-scaling points (optional - defaults to 1)
  // When provided, points will counter-scale to maintain fixed screen size
  zoom?: number

  // Callback when a freehand point position is updated via drag
  onFreehandPointUpdate?: (pointId: string, newX: number, newY: number) => void

  // Selected dosage from floating product picker (optional)
  // When provided, new injection points will use this dosage instead of smart defaults
  selectedDosage?: number
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Zone positions as percentages relative to the face image
const ZONE_POSITIONS: Record<string, { x: number; y: number }> = {
  // Upper Face
  'zone-forehead': { x: 50, y: 15 },
  'zone-glabella': { x: 50, y: 22 },
  'zone-brow-l': { x: 43, y: 22 },
  'zone-brow-r': { x: 57, y: 22 },
  'zone-crows-l': { x: 30, y: 28 },
  'zone-crows-r': { x: 70, y: 28 },

  // Periorbital
  'zone-tear-l': { x: 41, y: 31 },
  'zone-tear-r': { x: 59, y: 31 },

  // Mid Face
  'zone-cheek-l': { x: 35, y: 40 },
  'zone-cheek-r': { x: 65, y: 40 },
  'zone-nose': { x: 50, y: 38 },
  'zone-naso-l': { x: 42, y: 45 },
  'zone-naso-r': { x: 58, y: 45 },

  // Lower Face
  'zone-lip-upper': { x: 50, y: 49 },
  'zone-lip-lower': { x: 50, y: 52 },
  'zone-marionette-l': { x: 42, y: 54 },
  'zone-marionette-r': { x: 58, y: 54 },
  'zone-chin': { x: 50, y: 58 },

  // Jaw & Masseter
  'zone-jaw-l': { x: 33, y: 55 },
  'zone-jaw-r': { x: 67, y: 55 },
  'zone-masseter-l': { x: 28, y: 48 },
  'zone-masseter-r': { x: 72, y: 48 },

  // Neck
  'zone-platysma': { x: 50, y: 68 }
}

// Quick unit/volume presets
const QUICK_UNIT_PRESETS: Record<string, number[]> = {
  'zone-forehead': [10, 15, 20, 25],
  'zone-glabella': [15, 20, 25, 30],
  'zone-crows-l': [8, 10, 12, 15],
  'zone-crows-r': [8, 10, 12, 15],
  'zone-masseter-l': [20, 25, 30, 40],
  'zone-masseter-r': [20, 25, 30, 40],
  default: [5, 10, 15, 20]
}

const QUICK_VOLUME_PRESETS: Record<string, number[]> = {
  'zone-lip-upper': [0.3, 0.5, 0.7, 1.0],
  'zone-lip-lower': [0.3, 0.5, 0.7, 1.0],
  'zone-cheek-l': [0.5, 1.0, 1.5, 2.0],
  'zone-cheek-r': [0.5, 1.0, 1.5, 2.0],
  'zone-naso-l': [0.2, 0.3, 0.5, 0.7],
  'zone-naso-r': [0.2, 0.3, 0.5, 0.7],
  default: [0.2, 0.5, 1.0, 1.5]
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get smart defaults for a zone based on previous treatment
 */
function getSmartDefaults(
  zone: TreatmentZone,
  lastTreatment?: Map<string, InjectionPoint>,
  productType?: 'neurotoxin' | 'filler'
) {
  // If we have last treatment for this zone, use those values
  if (lastTreatment?.has(zone.id)) {
    const last = lastTreatment.get(zone.id)!
    return {
      units: last.units,
      volume: last.volume,
      depthId: last.depthId,
      techniqueId: last.techniqueId,
      needleGaugeId: last.needleGaugeId
    }
  }

  // Otherwise use zone defaults or general defaults
  const presets = productType === 'neurotoxin'
    ? QUICK_UNIT_PRESETS[zone.id] || QUICK_UNIT_PRESETS.default
    : QUICK_VOLUME_PRESETS[zone.id] || QUICK_VOLUME_PRESETS.default

  return {
    units: productType === 'neurotoxin' ? presets[1] : undefined, // Use second preset as default
    volume: productType === 'filler' ? presets[1] : undefined,
    depthId: (zone as any).recommendedDepth || '',
    techniqueId: (zone as any).recommendedTechnique || '',
    needleGaugeId: (zone as any).recommendedNeedleGauge || ''
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function FaceChartCore({
  productType,
  gender,
  injectionPoints,
  onInjectionPointsChange,
  freehandPoints,
  onFreehandPointsChange,
  selectedProductId,
  selectedProductColor,
  patientLastTreatment,
  readOnly = false,
  drawingMode: externalDrawingMode,
  onDrawingModeChange,
  zoom = 1,
  onFreehandPointUpdate,
  selectedDosage
}: FaceChartCoreProps) {
  // Calculate counter-scale to keep points fixed size regardless of zoom
  const pointScale = 1 / zoom
  const {
    getActiveZones,
    getActiveDepths,
    getActiveTechniques,
    getActiveNeedleGauges,
    getActiveProducts,
    getZoneById
  } = useChartingSettings()

  // Internal state
  const [internalDrawingMode, setInternalDrawingMode] = useState<DrawingMode>('zones')
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [hoveredFreehandPoint, setHoveredFreehandPoint] = useState<string | null>(null)
  const [selectedFreehandPoint, setSelectedFreehandPoint] = useState<string | null>(null)

  // Drag state for long-press repositioning
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    pointId: null,
    startPosition: null,
    currentPosition: null,
    originalPosition: null
  })
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isDraggingRef = useRef(false) // For event handlers that need sync access

  // Tap-to-edit state
  const [editingPoint, setEditingPoint] = useState<EditingPoint | null>(null)
  const tapStartTimeRef = useRef<number>(0)
  const TAP_THRESHOLD = 200 // ms - taps shorter than this open edit popover

  // Refs for drag handling
  const pointerStartPosRef = useRef<{ x: number; y: number } | null>(null)

  // Refs
  const imageContainerRef = useRef<HTMLDivElement>(null)

  // Use external or internal drawing mode
  // IMPORTANT: If external mode is passed, use it. Otherwise default to internal state.
  const drawingMode = externalDrawingMode !== undefined ? externalDrawingMode : internalDrawingMode
  console.log('[FaceChartCore] drawingMode:', drawingMode, 'external:', externalDrawingMode, 'internal:', internalDrawingMode)
  const setDrawingMode = useCallback((mode: DrawingMode) => {
    if (onDrawingModeChange) {
      onDrawingModeChange(mode)
    } else {
      setInternalDrawingMode(mode)
    }
  }, [onDrawingModeChange])

  // Get active data
  // Note: getActiveZones takes a category like 'face' or 'neck', NOT productType
  // For FaceChartCore, we want all face zones regardless of product type
  const activeZones = getActiveZones('face')
  const activeDepths = getActiveDepths()
  const activeTechniques = getActiveTechniques()
  const activeNeedleGauges = getActiveNeedleGauges()
  const activeProducts = getActiveProducts(productType)

  // ==========================================================================
  // DRAG HANDLERS FOR FREEHAND POINTS
  // ==========================================================================

  /**
   * Clear long-press timer and reset drag detection state
   */
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }, [])

  /**
   * Start drag mode for a freehand point
   */
  const startDragMode = useCallback((pointId: string, originalX: number, originalY: number) => {
    if (readOnly || !freehandPoints) return

    isDraggingRef.current = true
    setDragState({
      isDragging: true,
      pointId,
      startPosition: pointerStartPosRef.current,
      currentPosition: pointerStartPosRef.current,
      originalPosition: { x: originalX, y: originalY }
    })

    // Trigger haptic feedback for drag start
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([30])
    }
  }, [readOnly, freehandPoints])

  /**
   * Handle pointer down on a freehand point - start long-press detection
   */
  const handleFreehandPointerDown = useCallback((
    e: React.PointerEvent | React.TouchEvent,
    pointId: string,
    pointX: number,
    pointY: number
  ) => {
    if (readOnly) return

    // Record tap start time for tap detection
    tapStartTimeRef.current = Date.now()

    // Get client coordinates
    let clientX: number, clientY: number
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    pointerStartPosRef.current = { x: clientX, y: clientY }

    // Clear any existing timer
    clearLongPressTimer()

    // Start long-press timer
    longPressTimerRef.current = setTimeout(() => {
      startDragMode(pointId, pointX, pointY)
    }, LONG_PRESS_DURATION)
  }, [readOnly, clearLongPressTimer, startDragMode])

  /**
   * Handle pointer move - update drag position or cancel long-press if moved too much
   */
  const handleFreehandPointerMove = useCallback((e: React.PointerEvent | React.TouchEvent) => {
    // Get client coordinates
    let clientX: number, clientY: number
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    // If we have a start position but aren't dragging yet, check if we moved too much
    if (pointerStartPosRef.current && !isDraggingRef.current && longPressTimerRef.current) {
      const dx = clientX - pointerStartPosRef.current.x
      const dy = clientY - pointerStartPosRef.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > DRAG_MOVE_THRESHOLD) {
        // Moved too much - cancel long-press detection
        clearLongPressTimer()
      }
    }

    // If we're actively dragging, update the position
    if (isDraggingRef.current && dragState.isDragging && dragState.pointId) {
      const rect = imageContainerRef.current?.getBoundingClientRect()
      if (!rect) return

      // Calculate new position as percentage
      const newX = ((clientX - rect.left) / rect.width) * 100
      const newY = ((clientY - rect.top) / rect.height) * 100

      // Clamp to bounds (0-100)
      const clampedX = Math.max(0, Math.min(100, newX))
      const clampedY = Math.max(0, Math.min(100, newY))

      // Update drag state with current position
      setDragState(prev => ({
        ...prev,
        currentPosition: { x: clientX, y: clientY }
      }))

      // Update the freehand point position in real-time
      if (freehandPoints && onFreehandPointsChange) {
        const point = freehandPoints.get(dragState.pointId)
        if (point) {
          const newPoints = new Map(freehandPoints)
          newPoints.set(dragState.pointId, {
            ...point,
            x: clampedX,
            y: clampedY
          })
          onFreehandPointsChange(newPoints)
        }
      }

      // Also call the optional update callback
      if (onFreehandPointUpdate) {
        onFreehandPointUpdate(dragState.pointId, clampedX, clampedY)
      }
    }
  }, [dragState, freehandPoints, onFreehandPointsChange, onFreehandPointUpdate, clearLongPressTimer])

  /**
   * Handle pointer up - end drag or handle tap
   */
  const handleFreehandPointerUp = useCallback((
    e: React.PointerEvent | React.TouchEvent,
    pointId: string
  ) => {
    const tapDuration = Date.now() - tapStartTimeRef.current
    const wasDragging = isDraggingRef.current

    // Clear timer and reset refs
    clearLongPressTimer()
    isDraggingRef.current = false
    pointerStartPosRef.current = null

    // If we were dragging, finalize the drag
    if (wasDragging && dragState.isDragging) {
      // Check if dragged outside bounds - cancel if so
      const rect = imageContainerRef.current?.getBoundingClientRect()
      if (rect) {
        let clientX: number, clientY: number
        if ('changedTouches' in e) {
          clientX = e.changedTouches[0].clientX
          clientY = e.changedTouches[0].clientY
        } else {
          clientX = e.clientX
          clientY = e.clientY
        }

        const isOutOfBounds = (
          clientX < rect.left ||
          clientX > rect.right ||
          clientY < rect.top ||
          clientY > rect.bottom
        )

        // If out of bounds, restore original position
        if (isOutOfBounds && dragState.originalPosition && dragState.pointId) {
          if (freehandPoints && onFreehandPointsChange) {
            const point = freehandPoints.get(dragState.pointId)
            if (point) {
              const newPoints = new Map(freehandPoints)
              newPoints.set(dragState.pointId, {
                ...point,
                x: dragState.originalPosition.x,
                y: dragState.originalPosition.y
              })
              onFreehandPointsChange(newPoints)
            }
          }
        }
      }

      // Reset drag state
      setDragState({
        isDragging: false,
        pointId: null,
        startPosition: null,
        currentPosition: null,
        originalPosition: null
      })

      return
    }

    // If it was a quick tap (not a long-press that initiated drag), open edit popover
    if (tapDuration < TAP_THRESHOLD) {
      // This is handled by click event, so we don't need to do anything here
      setSelectedFreehandPoint(pointId)
      setSelectedZone(null)

      // Open edit popover
      if (freehandPoints) {
        const point = freehandPoints.get(pointId)
        if (point) {
          const rect = imageContainerRef.current?.getBoundingClientRect()
          if (rect) {
            let clientX: number, clientY: number
            if ('changedTouches' in e) {
              clientX = e.changedTouches[0].clientX
              clientY = e.changedTouches[0].clientY
            } else {
              clientX = e.clientX
              clientY = e.clientY
            }

            setEditingPoint({
              id: pointId,
              x: clientX - rect.left,
              y: clientY - rect.top,
              currentValue: productType === 'neurotoxin' ? (point.units || 0) : (point.volume || 0),
              pointName: point.customName || 'Custom Point'
            })
          }
        }
      }
    }
  }, [
    clearLongPressTimer,
    dragState,
    freehandPoints,
    onFreehandPointsChange,
    productType,
    TAP_THRESHOLD
  ])

  /**
   * Handle pointer cancel - cleanup drag state
   */
  const handleFreehandPointerCancel = useCallback(() => {
    clearLongPressTimer()

    // If we were dragging, restore original position
    if (isDraggingRef.current && dragState.isDragging && dragState.pointId && dragState.originalPosition) {
      if (freehandPoints && onFreehandPointsChange) {
        const point = freehandPoints.get(dragState.pointId)
        if (point) {
          const newPoints = new Map(freehandPoints)
          newPoints.set(dragState.pointId, {
            ...point,
            x: dragState.originalPosition.x,
            y: dragState.originalPosition.y
          })
          onFreehandPointsChange(newPoints)
        }
      }
    }

    isDraggingRef.current = false
    pointerStartPosRef.current = null
    setDragState({
      isDragging: false,
      pointId: null,
      startPosition: null,
      currentPosition: null,
      originalPosition: null
    })
  }, [clearLongPressTimer, dragState, freehandPoints, onFreehandPointsChange])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
      }
    }
  }, [])

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  /**
   * Handle zone click - add or edit injection point
   */
  const handleZoneClick = useCallback((zone: TreatmentZone, event: React.MouseEvent) => {
    if (readOnly) return

    const existingPoint = injectionPoints.get(zone.id)

    if (existingPoint) {
      // Zone already has injection - open edit popover
      setSelectedZone(zone.id)

      // Get position for popover
      const rect = imageContainerRef.current?.getBoundingClientRect()
      if (rect) {
        setEditingPoint({
          id: existingPoint.id,
          zoneId: zone.id,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          currentValue: productType === 'neurotoxin' ? (existingPoint.units || 0) : (existingPoint.volume || 0),
          pointName: zone.name || zone.id
        })
      }
    } else {
      // Add new injection point with smart defaults OR selected dosage from product picker
      const smartDefaults = getSmartDefaults(zone, patientLastTreatment, productType)

      // Use selectedDosage if provided, otherwise fall back to smart defaults
      const dosageValue = selectedDosage !== undefined
        ? selectedDosage
        : (productType === 'neurotoxin' ? smartDefaults.units : smartDefaults.volume)

      // Determine the product color to save with the point
      // Priority: selectedProductColor prop > lookup from chartingProducts > default based on type
      const productIdToUse = selectedProductId || activeProducts[0]?.id
      const colorToUse = selectedProductColor
        || getProductColor(productIdToUse || '')
        || (productType === 'neurotoxin' ? '#8B5CF6' : '#EC4899')

      const newPoint: InjectionPoint = {
        id: `ip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        zoneId: zone.id,
        units: productType === 'neurotoxin' ? dosageValue : undefined,
        volume: productType === 'filler' ? dosageValue : undefined,
        depthId: smartDefaults.depthId,
        techniqueId: smartDefaults.techniqueId,
        needleGaugeId: smartDefaults.needleGaugeId,
        productId: productIdToUse,
        productColor: colorToUse,
        timestamp: new Date()
      }

      const newPoints = new Map(injectionPoints)
      newPoints.set(zone.id, newPoint)
      onInjectionPointsChange(newPoints)
      setSelectedZone(zone.id)
    }
  }, [
    readOnly,
    injectionPoints,
    onInjectionPointsChange,
    patientLastTreatment,
    productType,
    selectedProductId,
    selectedProductColor,
    activeProducts,
    selectedDosage
  ])

  /**
   * Handle freehand click - add custom injection point
   */
  const handleFreehandClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    console.log('[FaceChartCore] handleFreehandClick called!', {
      readOnly,
      hasCallback: !!onFreehandPointsChange,
      target: (event.target as HTMLElement).tagName,
      currentTarget: (event.currentTarget as HTMLElement).tagName
    })
    if (readOnly) {
      console.log('[FaceChartCore] Click ignored: readOnly is true')
      return
    }
    if (!onFreehandPointsChange) {
      console.log('[FaceChartCore] Click ignored: onFreehandPointsChange is not provided')
      return
    }

    const rect = imageContainerRef.current?.getBoundingClientRect()
    if (!rect) return

    // Calculate position as percentage
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    // Use selectedDosage if provided, otherwise use defaults
    const defaultDosage = productType === 'neurotoxin' ? 5 : 0.5
    const dosageValue = selectedDosage !== undefined ? selectedDosage : defaultDosage

    // Determine the product color to save with the point
    // Priority: selectedProductColor prop > lookup from chartingProducts > default based on type
    const productIdToUse = selectedProductId || activeProducts[0]?.id
    const colorToUse = selectedProductColor
      || getProductColor(productIdToUse || '')
      || (productType === 'neurotoxin' ? '#8B5CF6' : '#EC4899')

    const newPoint: FreehandPoint = {
      id: `fp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x,
      y,
      customName: 'Custom Point',
      units: productType === 'neurotoxin' ? dosageValue : undefined,
      volume: productType === 'filler' ? dosageValue : undefined,
      depthId: activeDepths[0]?.id || '',
      techniqueId: activeTechniques[0]?.id || '',
      needleGaugeId: activeNeedleGauges[0]?.id || '',
      productId: productIdToUse,
      productColor: colorToUse,
      timestamp: new Date()
    }

    const newPoints = new Map(freehandPoints || new Map())
    newPoints.set(newPoint.id, newPoint)
    onFreehandPointsChange(newPoints)
  }, [
    readOnly,
    onFreehandPointsChange,
    productType,
    activeDepths,
    activeTechniques,
    activeNeedleGauges,
    selectedProductId,
    selectedProductColor,
    activeProducts,
    freehandPoints,
    selectedDosage
  ])

  /**
   * Handle removing a freehand point
   */
  const handleRemoveFreehandPoint = useCallback((pointId: string) => {
    if (readOnly || !onFreehandPointsChange || !freehandPoints) return

    const newPoints = new Map(freehandPoints)
    newPoints.delete(pointId)
    onFreehandPointsChange(newPoints)

    if (selectedFreehandPoint === pointId) {
      setSelectedFreehandPoint(null)
    }
  }, [readOnly, onFreehandPointsChange, freehandPoints, selectedFreehandPoint])

  /**
   * Handle updating injection point value (units or volume)
   */
  const handleUpdatePointValue = useCallback((pointId: string, value: number) => {
    // Check if it's a zone point
    const zoneEntry = Array.from(injectionPoints.entries()).find(([_, p]) => p.id === pointId)
    if (zoneEntry) {
      const [zoneId, point] = zoneEntry
      const newPoints = new Map(injectionPoints)
      newPoints.set(zoneId, {
        ...point,
        ...(productType === 'neurotoxin' ? { units: value } : { volume: value })
      })
      onInjectionPointsChange(newPoints)
      return
    }

    // Check if it's a freehand point
    if (freehandPoints && onFreehandPointsChange) {
      const freehandEntry = Array.from(freehandPoints.entries()).find(([id]) => id === pointId)
      if (freehandEntry) {
        const [id, point] = freehandEntry
        const newPoints = new Map(freehandPoints)
        newPoints.set(id, {
          ...point,
          ...(productType === 'neurotoxin' ? { units: value } : { volume: value })
        })
        onFreehandPointsChange(newPoints)
      }
    }
  }, [injectionPoints, onInjectionPointsChange, freehandPoints, onFreehandPointsChange, productType])

  /**
   * Handle deleting an injection point
   */
  const handleDeletePoint = useCallback((pointId: string) => {
    // Check if it's a zone point
    const zoneEntry = Array.from(injectionPoints.entries()).find(([_, p]) => p.id === pointId)
    if (zoneEntry) {
      const [zoneId] = zoneEntry
      const newPoints = new Map(injectionPoints)
      newPoints.delete(zoneId)
      onInjectionPointsChange(newPoints)
      setSelectedZone(null)
      setEditingPoint(null)
      return
    }

    // Check if it's a freehand point
    if (freehandPoints && onFreehandPointsChange) {
      const newPoints = new Map(freehandPoints)
      newPoints.delete(pointId)
      onFreehandPointsChange(newPoints)
      setSelectedFreehandPoint(null)
      setEditingPoint(null)
    }
  }, [injectionPoints, onInjectionPointsChange, freehandPoints, onFreehandPointsChange])

  /**
   * Open edit popover for a zone injection point
   */
  const openZoneEditPopover = useCallback((zoneId: string, event: React.MouseEvent | React.TouchEvent) => {
    const point = injectionPoints.get(zoneId)
    if (!point) return

    const zone = activeZones.find(z => z.id === zoneId)
    const rect = imageContainerRef.current?.getBoundingClientRect()
    if (!rect) return

    // Get click/touch position relative to container
    let clientX: number, clientY: number
    if ('touches' in event) {
      clientX = event.touches[0]?.clientX || event.changedTouches[0]?.clientX || 0
      clientY = event.touches[0]?.clientY || event.changedTouches[0]?.clientY || 0
    } else {
      clientX = event.clientX
      clientY = event.clientY
    }

    setEditingPoint({
      id: point.id,
      zoneId: zoneId,
      x: clientX - rect.left,
      y: clientY - rect.top,
      currentValue: productType === 'neurotoxin' ? (point.units || 0) : (point.volume || 0),
      pointName: zone?.name || zoneId
    })
  }, [injectionPoints, activeZones, productType])

  /**
   * Open edit popover for a freehand point
   */
  const openFreehandEditPopover = useCallback((pointId: string, event: React.MouseEvent | React.TouchEvent) => {
    if (!freehandPoints) return
    const point = freehandPoints.get(pointId)
    if (!point) return

    const rect = imageContainerRef.current?.getBoundingClientRect()
    if (!rect) return

    // Get click/touch position relative to container
    let clientX: number, clientY: number
    if ('touches' in event) {
      clientX = event.touches[0]?.clientX || event.changedTouches[0]?.clientX || 0
      clientY = event.touches[0]?.clientY || event.changedTouches[0]?.clientY || 0
    } else {
      clientX = event.clientX
      clientY = event.clientY
    }

    setEditingPoint({
      id: pointId,
      x: clientX - rect.left,
      y: clientY - rect.top,
      currentValue: productType === 'neurotoxin' ? (point.units || 0) : (point.volume || 0),
      pointName: point.customName || 'Custom Point'
    })
  }, [freehandPoints, productType])

  /**
   * Close edit popover
   */
  const closeEditPopover = useCallback(() => {
    setEditingPoint(null)
  }, [])

  /**
   * Get presets for current editing point
   */
  const getPresetsForEditingPoint = useCallback(() => {
    if (!editingPoint) return undefined

    const presets = productType === 'neurotoxin'
      ? QUICK_UNIT_PRESETS[editingPoint.zoneId || ''] || QUICK_UNIT_PRESETS.default
      : QUICK_VOLUME_PRESETS[editingPoint.zoneId || ''] || QUICK_VOLUME_PRESETS.default

    return presets
  }, [editingPoint, productType])

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="relative w-full">
      {/* Face Image Container */}
      <div
        ref={imageContainerRef}
        className={`relative w-full mx-auto max-w-[95%] sm:max-w-lg md:max-w-[700px] lg:max-w-[900px] ${
          drawingMode === 'freehand' ? 'cursor-crosshair' : ''
        }`}
        style={{
          aspectRatio: gender === 'female' ? '546/888' : '585/847'
        }}
        onClick={(e) => {
          // Always log clicks for debugging
          console.log('[FaceChartCore] Container clicked, drawingMode:', drawingMode)
          // Only handle freehand clicks when in freehand mode
          if (drawingMode === 'freehand') {
            handleFreehandClick(e)
          }
        }}
      >
        {/* Base Face Image */}
        <Image
          src={`/images/face-chart-${gender}.png`}
          alt={`${gender} face chart for injection mapping`}
          fill
          className="object-contain"
          style={{
            opacity: 0.85,
            pointerEvents: 'none'
          }}
          priority
        />

        {/* Zone Points Overlay - Only shows zones that have injection data (no predefined dots) */}
        <div
          className="absolute inset-0"
          style={{ pointerEvents: drawingMode === 'zones' ? 'auto' : 'none' }}
        >
          {activeZones.map(zone => {
            const zonePos = ZONE_POSITIONS[zone.id]
            if (!zonePos) return null

            const point = injectionPoints.get(zone.id)
            const isSelected = selectedZone === zone.id
            const isHovered = hoveredZone === zone.id
            const hasInjection = point && (point.units || point.volume)

            // Only render zones that have actual injection data - face should be clean/blank otherwise
            if (!hasInjection) return null

            return (
              <div
                key={zone.id}
                className={`absolute group ${
                  drawingMode === 'zones' ? 'cursor-pointer' : ''
                }`}
                style={{
                  left: `${zonePos.x}%`,
                  top: `${zonePos.y}%`,
                  // Counter-scale transform to keep points fixed size when zoomed
                  transform: `translate(-50%, -50%) scale(${pointScale})`,
                  pointerEvents: drawingMode === 'zones' ? 'auto' : 'none'
                }}
                onClick={(e) => {
                  if (drawingMode === 'zones') {
                    e.stopPropagation()
                    handleZoneClick(zone, e)
                  }
                }}
                onMouseEnter={() => drawingMode === 'zones' && setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
              >
                {/* Touch-friendly clickable area */}
                <div className="absolute w-14 h-14 md:w-12 md:h-12 lg:w-11 lg:h-11 -left-7 md:-left-6 lg:-left-5.5 -top-7 md:-top-6 lg:-top-5.5" />

                {/* Visual Point - Uses product-specific color */}
                {(() => {
                  // Get product-specific color for this injection point
                  // Priority: stored productColor > lookup from chartingProducts > default based on type
                  const pointColor = point?.productColor
                    || (point?.productId ? getProductColor(point.productId) : null)
                    || (productType === 'neurotoxin' ? '#8B5CF6' : '#EC4899') // Default fallback

                  return (
                    <div
                      className={`
                        relative w-2 h-2 rounded-full transition-all duration-200
                        ${isSelected
                          ? 'ring-2 scale-125'
                          : 'shadow-lg'
                        }
                      `}
                      style={{
                        backgroundColor: pointColor,
                        boxShadow: isSelected
                          ? undefined
                          : `0 10px 15px -3px ${pointColor}50`,
                        ...(isSelected ? {
                          '--tw-ring-color': `${pointColor}77`
                        } as React.CSSProperties : {})
                      }}
                    >
                      {/* Animated rings for injection points */}
                      <div
                        className="absolute inset-0 rounded-full animate-ping opacity-30"
                        style={{ backgroundColor: pointColor }}
                      />
                      <div
                        className="absolute inset-0 rounded-full animate-pulse opacity-40"
                        style={{ backgroundColor: pointColor }}
                      />
                    </div>
                  )
                })()}

                {/* Units Badge - Uses product-specific color */}
                {(() => {
                  // Priority: stored productColor > lookup from chartingProducts > default based on type
                  const badgeColor = point?.productColor
                    || (point?.productId ? getProductColor(point.productId) : null)
                    || (productType === 'neurotoxin' ? '#8B5CF6' : '#EC4899')

                  return (
                    <div
                      className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 px-1 py-0 rounded-full text-[9px] font-bold text-white shadow-md whitespace-nowrap z-10"
                      style={{ backgroundColor: badgeColor }}
                    >
                      {point?.units || point?.volume}{productType === 'neurotoxin' ? 'u' : 'ml'}
                    </div>
                  )
                })()}
              </div>
            )
          })}
        </div>

        {/* Freehand Points Overlay */}
        {freehandPoints && (
          <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
            {Array.from(freehandPoints.entries()).map(([pointId, point]) => {
              const isSelected = selectedFreehandPoint === pointId
              const isHovered = hoveredFreehandPoint === pointId
              const hasValue = point.units || point.volume
              const isDraggingThis = dragState.isDragging && dragState.pointId === pointId

              return (
                <div
                  key={pointId}
                  className={`absolute group ${isDraggingThis ? 'cursor-grabbing z-50' : 'cursor-pointer'}`}
                  style={{
                    left: `${point.x}%`,
                    top: `${point.y}%`,
                    // Counter-scale transform to keep points fixed size when zoomed
                    transform: `translate(-50%, -50%) scale(${pointScale})`,
                    // Only allow clicking on existing points when in zones mode (select mode)
                    // In freehand mode, clicks should pass through to add new points
                    pointerEvents: drawingMode === 'freehand' ? 'none' : 'auto',
                    // IMPORTANT: Use 'pinch-zoom' instead of 'none' to allow two-finger zoom gestures
                    // to pass through to the parent FaceChartWithZoom component.
                    // This ensures practitioners can ALWAYS zoom in/out regardless of what they're interacting with.
                    touchAction: 'pinch-zoom'
                  }}
                  onClick={(e) => {
                    // Don't open edit popover if we were dragging
                    if (isDraggingRef.current || dragState.isDragging) {
                      e.stopPropagation()
                      return
                    }
                    e.stopPropagation()
                    setSelectedFreehandPoint(pointId)
                    setSelectedZone(null)
                    // Open edit popover on click (for mouse/desktop)
                    openFreehandEditPopover(pointId, e)
                  }}
                  onPointerDown={(e) => handleFreehandPointerDown(e, pointId, point.x, point.y)}
                  onPointerMove={handleFreehandPointerMove}
                  onPointerUp={(e) => handleFreehandPointerUp(e, pointId)}
                  onPointerCancel={handleFreehandPointerCancel}
                  onMouseEnter={() => !dragState.isDragging && setHoveredFreehandPoint(pointId)}
                  onMouseLeave={() => !dragState.isDragging && setHoveredFreehandPoint(null)}
                >
                  {/* Visual Point - Custom freehand style with pin icon - Uses product-specific color */}
                  {(() => {
                    // Get product-specific color for this freehand point
                    // Priority: stored productColor > lookup from chartingProducts > default based on type
                    const freehandColor = point.productColor
                      || (point.productId ? getProductColor(point.productId) : null)
                      || (productType === 'neurotoxin' ? '#8B5CF6' : '#EC4899') // Default fallback

                    return (
                      <div
                        className={`
                          relative rounded-full flex items-center justify-center
                          ${isDraggingThis
                            ? 'w-4 h-4 ring-4 scale-125'
                            : `w-3 h-3 ${isSelected
                                ? 'ring-2 scale-110'
                                : isHovered
                                  ? 'scale-105'
                                  : 'shadow-lg'
                              }`
                          }
                          transition-all ${isDraggingThis ? 'duration-75' : 'duration-200'}
                        `}
                        style={{
                          backgroundColor: isDraggingThis
                            ? (productType === 'neurotoxin' ? '#EAB308' : '#F97316') // Yellow/Orange when dragging
                            : freehandColor,
                          boxShadow: isDraggingThis
                            ? `0 25px 50px -12px ${productType === 'neurotoxin' ? '#EAB30850' : '#F9731650'}`
                            : isSelected
                              ? undefined
                              : `0 10px 15px -3px ${freehandColor}50`,
                          ...(isDraggingThis ? {
                            '--tw-ring-color': productType === 'neurotoxin' ? '#EAB30850' : '#F9731650'
                          } as React.CSSProperties : {}),
                          ...(isSelected && !isDraggingThis ? {
                            '--tw-ring-color': `${freehandColor}77`
                          } as React.CSSProperties : {})
                        }}
                      >
                        <MapPin className={`text-white ${isDraggingThis ? 'w-2.5 h-2.5' : 'w-2 h-2'}`} />

                        {/* Animated rings for freehand points - hide during drag */}
                        {hasValue && !isDraggingThis && (
                          <div
                            className="absolute inset-0 rounded-full animate-ping opacity-30"
                            style={{ backgroundColor: freehandColor }}
                          />
                        )}

                        {/* Drag indicator glow effect */}
                        {isDraggingThis && (
                          <>
                            <div className="absolute inset-0 rounded-full animate-pulse bg-white/30" />
                            <div
                              className="absolute -inset-2 rounded-full opacity-20 animate-ping"
                              style={{ backgroundColor: productType === 'neurotoxin' ? '#EAB308' : '#F97316' }}
                            />
                          </>
                        )}
                      </div>
                    )
                  })()}

                  {/* Units/Name Badge - Uses product-specific color */}
                  {(() => {
                    // Priority: stored productColor > lookup from chartingProducts > default based on type
                    const badgeColor = point.productColor
                      || (point.productId ? getProductColor(point.productId) : null)
                      || (productType === 'neurotoxin' ? '#8B5CF6' : '#EC4899')

                    return (
                      <div
                        className="absolute left-1/2 transform -translate-x-1/2 px-1.5 py-0.5 rounded-md text-[9px] font-medium text-white shadow-md whitespace-nowrap z-10 transition-all"
                        style={{
                          top: isDraggingThis ? '-1.5rem' : '-1rem',
                          backgroundColor: isDraggingThis ? 'rgba(17, 24, 39, 0.9)' : badgeColor
                        }}
                      >
                        {isDraggingThis ? (
                          'Dragging...'
                        ) : hasValue ? (
                          <>{point.units || point.volume}{productType === 'neurotoxin' ? 'u' : 'ml'}</>
                        ) : (
                          point.customName || 'Custom'
                        )}
                      </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>
        )}

        {/* Edit Point Popover - Tap-to-edit for injection points */}
        <EditPointPopover
          editingPoint={editingPoint}
          productType={productType}
          containerRef={imageContainerRef}
          onUpdateValue={handleUpdatePointValue}
          onDelete={handleDeletePoint}
          onClose={closeEditPopover}
          presets={getPresetsForEditingPoint()}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}
