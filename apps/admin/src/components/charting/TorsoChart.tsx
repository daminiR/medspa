'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  useChartingSettings,
  TreatmentZone
} from '@/contexts/ChartingSettingsContext'
import {
  Plus,
  Minus,
  RotateCcw,
  Check,
  X,
  RotateCw,
  MapPin
} from 'lucide-react'
import toast from 'react-hot-toast'
import { InjectionPoint, FreehandPoint } from './InteractiveFaceChart'
import { EditPointPopover, EditingPoint } from './EditPointPopover'

// =============================================================================
// TYPES
// =============================================================================

type SelectionMode = 'single' | 'multi'
type ViewType = 'front' | 'back'

// Drag state for freehand point repositioning
interface DragState {
  isDragging: boolean
  pointId: string | null
  startPosition: { x: number; y: number } | null
  currentPosition: { x: number; y: number } | null
  originalPosition: { x: number; y: number } | null
}

// Long-press drag constants
const LONG_PRESS_DURATION = 350 // ms before entering drag mode
const DRAG_MOVE_THRESHOLD = 5 // pixels - movement above this cancels long-press detection

interface QuickEditState {
  isOpen: boolean
  zoneId: string | null
  position: { x: number; y: number }
}

export interface TorsoChartProps {
  productType: 'neurotoxin' | 'filler'
  gender: 'male' | 'female'
  injectionPoints: Map<string, InjectionPoint>
  onInjectionPointsChange: (points: Map<string, InjectionPoint>) => void
  freehandPoints?: Map<string, FreehandPoint>
  onFreehandPointsChange?: (points: Map<string, FreehandPoint>) => void
  selectedProductId?: string
  selectedProductColor?: string // The color of the selected product (for new points)
  readOnly?: boolean
  view?: ViewType
  onViewChange?: (view: ViewType) => void
  // Zoom level for counter-scaling points (optional - defaults to 1)
  // When provided, points will counter-scale to maintain fixed screen size
  zoom?: number
  // Selected dosage from floating product picker (optional)
  // When provided, new injection points will use this dosage instead of smart defaults
  selectedDosage?: number
  // Callback when a freehand point position is updated via drag
  onFreehandPointUpdate?: (pointId: string, newX: number, newY: number) => void
}

// =============================================================================
// CONSTANTS
// =============================================================================

// SVG viewBox dimensions - designed for proper scaling
const VIEWBOX_WIDTH = 400
const VIEWBOX_HEIGHT = 500

// Color scheme
const COLORS = {
  neurotoxin: {
    primary: '#8B5CF6', // Purple
    light: '#C4B5FD',
    dark: '#6D28D9'
  },
  filler: {
    primary: '#EC4899', // Pink
    light: '#F9A8D4',
    dark: '#BE185D'
  }
}

// Zone positions as SVG coordinates (relative to viewBox 0 0 400 500)
// Front view zones
const FRONT_ZONE_POSITIONS: Record<string, { x: number; y: number; path?: string }> = {
  // Chest/Pectoral area
  'zone-chest-upper': { x: 200, y: 100, path: 'M 160 80 L 240 80 L 240 120 L 160 120 Z' },
  'zone-chest-left': { x: 145, y: 130, path: 'M 110 100 Q 130 95 160 100 L 160 170 Q 140 175 110 165 Z' },
  'zone-chest-right': { x: 255, y: 130, path: 'M 240 100 Q 270 95 290 100 L 290 165 Q 260 175 240 170 Z' },

  // Abdomen
  'zone-abdomen-upper': { x: 200, y: 200, path: 'M 150 170 L 250 170 L 250 230 L 150 230 Z' },
  'zone-abdomen-mid': { x: 200, y: 270, path: 'M 145 230 L 255 230 L 255 310 L 145 310 Z' },
  'zone-abdomen-lower': { x: 200, y: 350, path: 'M 150 310 L 250 310 L 260 380 Q 200 400 140 380 Z' },

  // Sides (Flanks)
  'zone-flank-left-upper': { x: 95, y: 200, path: 'M 80 160 L 110 160 L 115 240 L 85 240 Z' },
  'zone-flank-left-mid': { x: 90, y: 270, path: 'M 85 240 L 115 240 L 120 310 L 90 310 Z' },
  'zone-flank-left-lower': { x: 95, y: 340, path: 'M 90 310 L 120 310 L 130 370 L 100 370 Z' },
  'zone-flank-right-upper': { x: 305, y: 200, path: 'M 290 160 L 320 160 L 315 240 L 285 240 Z' },
  'zone-flank-right-mid': { x: 310, y: 270, path: 'M 285 240 L 315 240 L 310 310 L 280 310 Z' },
  'zone-flank-right-lower': { x: 305, y: 340, path: 'M 280 310 L 310 310 L 300 370 L 270 370 Z' }
}

// Back view zones
const BACK_ZONE_POSITIONS: Record<string, { x: number; y: number; path?: string }> = {
  // Upper back
  'zone-back-upper-left': { x: 145, y: 120, path: 'M 110 90 L 200 90 L 200 160 L 110 160 Z' },
  'zone-back-upper-right': { x: 255, y: 120, path: 'M 200 90 L 290 90 L 290 160 L 200 160 Z' },

  // Mid back
  'zone-back-mid': { x: 200, y: 210, path: 'M 115 160 L 285 160 L 285 260 L 115 260 Z' },

  // Lower back / Lumbar
  'zone-back-lower-left': { x: 155, y: 310, path: 'M 125 260 L 200 260 L 200 360 L 135 360 Z' },
  'zone-back-lower-right': { x: 245, y: 310, path: 'M 200 260 L 275 260 L 265 360 L 200 360 Z' },

  // Shoulder blades
  'zone-scapula-left': { x: 130, y: 140, path: 'M 95 110 L 145 110 L 145 180 L 95 180 Z' },
  'zone-scapula-right': { x: 270, y: 140, path: 'M 255 110 L 305 110 L 305 180 L 255 180 Z' },

  // Sides (Flanks) - back view
  'zone-flank-back-left': { x: 90, y: 250, path: 'M 75 180 L 105 180 L 110 320 L 80 320 Z' },
  'zone-flank-back-right': { x: 310, y: 250, path: 'M 295 180 L 325 180 L 320 320 L 290 320 Z' }
}

// Torso outline paths
const TORSO_OUTLINE_FRONT = `
  M 200 50
  C 150 50 120 70 105 100
  Q 85 130 80 170
  L 75 250
  Q 80 320 95 370
  L 120 420
  Q 160 440 200 445
  Q 240 440 280 420
  L 305 370
  Q 320 320 325 250
  L 320 170
  Q 315 130 295 100
  C 280 70 250 50 200 50
  Z
`

const TORSO_OUTLINE_BACK = `
  M 200 50
  C 150 50 120 70 105 100
  Q 85 130 80 170
  L 75 250
  Q 80 320 95 370
  L 120 420
  Q 160 440 200 445
  Q 240 440 280 420
  L 305 370
  Q 320 320 325 250
  L 320 170
  Q 315 130 295 100
  C 280 70 250 50 200 50
  Z
`

// Anatomical reference lines for front view
const FRONT_ANATOMY_LINES = {
  // Center line (sternum/midline)
  centerLine: { x1: 200, y1: 55, x2: 200, y2: 440 },
  // Horizontal guide lines
  horizontalLines: [
    { x1: 90, y1: 170, x2: 310, y2: 170 },  // Chest/abdomen boundary
    { x1: 100, y1: 250, x2: 300, y2: 250 },  // Upper/mid abdomen
    { x1: 105, y1: 330, x2: 295, y2: 330 },  // Mid/lower abdomen
  ],
  // Pectoral outlines
  pectorals: {
    left: { cx: 145, cy: 130, rx: 40, ry: 35 },
    right: { cx: 255, cy: 130, rx: 40, ry: 35 }
  },
  // Abdominal sections
  abdominalRects: [
    { x: 155, y: 175, width: 90, height: 50, rx: 5 },
    { x: 150, y: 235, width: 100, height: 55, rx: 5 },
    { x: 150, y: 300, width: 100, height: 55, rx: 5 }
  ]
}

// Anatomical reference lines for back view
const BACK_ANATOMY_LINES = {
  // Spine line
  centerLine: { x1: 200, y1: 55, x2: 200, y2: 400 },
  // Horizontal guide lines
  horizontalLines: [
    { x1: 90, y1: 160, x2: 310, y2: 160 },   // Scapula line
    { x1: 100, y1: 260, x2: 300, y2: 260 },  // Mid back
    { x1: 120, y1: 360, x2: 280, y2: 360 },  // Lower back
  ],
  // Scapula outlines
  scapulas: {
    left: { points: '100,120 145,110 150,175 95,180' },
    right: { points: '255,110 300,120 305,180 250,175' }
  }
}

// Quick unit presets based on zone
const QUICK_UNIT_PRESETS: Record<string, number[]> = {
  'zone-chest-left': [20, 30, 40, 50],
  'zone-chest-right': [20, 30, 40, 50],
  'zone-abdomen-upper': [30, 40, 50, 60],
  'zone-abdomen-mid': [30, 40, 50, 60],
  'zone-abdomen-lower': [30, 40, 50, 60],
  default: [20, 30, 40, 50]
}

const QUICK_VOLUME_PRESETS: Record<string, number[]> = {
  'zone-chest-left': [1.0, 1.5, 2.0, 2.5],
  'zone-chest-right': [1.0, 1.5, 2.0, 2.5],
  default: [0.5, 1.0, 1.5, 2.0]
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TorsoChart({
  productType,
  gender,
  injectionPoints,
  onInjectionPointsChange,
  freehandPoints: externalFreehandPoints,
  onFreehandPointsChange,
  selectedProductId,
  readOnly = false,
  view: controlledView,
  onViewChange,
  zoom = 1,
  selectedDosage,
  onFreehandPointUpdate
}: TorsoChartProps) {
  // Calculate counter-scale factor for SVG elements to keep points fixed size when zoomed
  const pointScaleFactor = 1 / zoom
  const {
    getActiveZones,
    getActiveDepths,
    getActiveTechniques,
    getActiveNeedleGauges,
    getActiveProducts,
    getZoneById
  } = useChartingSettings()

  // State
  const [internalView, setInternalView] = useState<ViewType>('front')
  const view = controlledView ?? internalView
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [quickEdit, setQuickEdit] = useState<QuickEditState>({
    isOpen: false,
    zoneId: null,
    position: { x: 0, y: 0 }
  })

  // Multi-select mode state
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('single')
  const [multiSelectedZones, setMultiSelectedZones] = useState<Set<string>>(new Set())
  const [batchUnits, setBatchUnits] = useState<number>(productType === 'neurotoxin' ? 20 : 1.0)

  // Freehand mode state
  const [internalFreehandPoints, setInternalFreehandPoints] = useState<Map<string, FreehandPoint>>(new Map())
  const [hoveredFreehandPoint, setHoveredFreehandPoint] = useState<string | null>(null)
  const [selectedFreehandPoint, setSelectedFreehandPoint] = useState<string | null>(null)

  // Drag state for long-press repositioning of freehand points
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    pointId: null,
    startPosition: null,
    currentPosition: null,
    originalPosition: null
  })
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isDraggingRef = useRef(false) // For event handlers that need sync access
  const pointerStartPosRef = useRef<{ x: number; y: number } | null>(null)
  const tapStartTimeRef = useRef<number>(0)
  const TAP_THRESHOLD = 200 // ms - taps shorter than this open edit popover

  // Tap-to-edit state using shared EditPointPopover
  const [editingPoint, setEditingPoint] = useState<EditingPoint | null>(null)

  const chartRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Use external freehand points if provided, otherwise use internal state
  const freehandPoints = externalFreehandPoints ?? internalFreehandPoints
  const setFreehandPoints = onFreehandPointsChange ?? setInternalFreehandPoints

  // Get active items from settings - filter for body zones only
  const activeZones = useMemo(() => getActiveZones('body'), [getActiveZones])
  const activeDepths = useMemo(() => getActiveDepths(), [getActiveDepths])
  const activeTechniques = useMemo(() => getActiveTechniques(), [getActiveTechniques])
  const activeGauges = useMemo(() => getActiveNeedleGauges(), [getActiveNeedleGauges])
  const activeProducts = useMemo(() => getActiveProducts(productType), [getActiveProducts, productType])

  // Get zone positions based on current view
  const zonePositions = useMemo(() => {
    return view === 'front' ? FRONT_ZONE_POSITIONS : BACK_ZONE_POSITIONS
  }, [view])

  // Get torso outline based on current view
  const torsoOutline = useMemo(() => {
    return view === 'front' ? TORSO_OUTLINE_FRONT : TORSO_OUTLINE_BACK
  }, [view])

  // Get anatomy lines based on current view
  const anatomyLines = useMemo(() => {
    return view === 'front' ? FRONT_ANATOMY_LINES : BACK_ANATOMY_LINES
  }, [view])

  // Handle view toggle
  const handleViewToggle = useCallback(() => {
    const newView = view === 'front' ? 'back' : 'front'
    setInternalView(newView)
    onViewChange?.(newView)
  }, [view, onViewChange])

  // Haptic feedback
  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy') => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [30],
        heavy: [50]
      }
      navigator.vibrate(patterns[type])
    }
  }, [])

  // Smart defaults helper
  const getSmartDefaults = useCallback((zone: TreatmentZone) => {
    return {
      units: zone.defaultUnits || (productType === 'neurotoxin' ? 20 : undefined),
      volume: zone.defaultVolume || (productType === 'filler' ? 1.0 : undefined),
      depthId: zone.defaultDepth || activeDepths[0]?.id || 'depth-im',
      techniqueId: zone.defaultTechnique || activeTechniques[0]?.id || 'tech-serial',
      needleGaugeId: zone.defaultNeedleGauge || activeGauges[0]?.id || 'ng-30'
    }
  }, [productType, activeDepths, activeTechniques, activeGauges])

  // Handle zone click
  const handleZoneClick = useCallback((zone: TreatmentZone, event: React.MouseEvent) => {
    if (readOnly) return

    triggerHaptic('light')

    // Multi-select mode: toggle zone selection
    if (selectionMode === 'multi') {
      setMultiSelectedZones(prev => {
        const newSet = new Set(prev)
        if (newSet.has(zone.id)) {
          newSet.delete(zone.id)
        } else {
          newSet.add(zone.id)
        }
        return newSet
      })
      return
    }

    const existingPoint = injectionPoints.get(zone.id)
    const rect = chartRef.current?.getBoundingClientRect()

    if (existingPoint) {
      // Zone already has injection - open edit popover
      setSelectedZone(zone.id)
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
      const smartDefaults = getSmartDefaults(zone)

      // Use selectedDosage if provided, otherwise fall back to smart defaults
      const dosageValue = selectedDosage !== undefined
        ? selectedDosage
        : (productType === 'neurotoxin' ? smartDefaults.units : smartDefaults.volume)

      const newPoint: InjectionPoint = {
        id: `ip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        zoneId: zone.id,
        units: productType === 'neurotoxin' ? dosageValue : undefined,
        volume: productType === 'filler' ? dosageValue : undefined,
        depthId: smartDefaults.depthId,
        techniqueId: smartDefaults.techniqueId,
        needleGaugeId: smartDefaults.needleGaugeId,
        productId: selectedProductId || activeProducts[0]?.id,
        timestamp: new Date()
      }

      const newPoints = new Map(injectionPoints)
      newPoints.set(zone.id, newPoint)
      onInjectionPointsChange(newPoints)

      setSelectedZone(zone.id)
    }
  }, [readOnly, selectionMode, injectionPoints, onInjectionPointsChange, triggerHaptic, productType, selectedProductId, activeProducts, getSmartDefaults, selectedDosage])

  // Update injection point value
  const updateInjectionValue = useCallback((zoneId: string, value: number) => {
    const point = injectionPoints.get(zoneId)
    if (!point) return

    const newPoints = new Map(injectionPoints)
    newPoints.set(zoneId, {
      ...point,
      ...(productType === 'neurotoxin' ? { units: value } : { volume: value })
    })
    onInjectionPointsChange(newPoints)
  }, [injectionPoints, onInjectionPointsChange, productType])

  // Remove injection point
  const removeInjectionPoint = useCallback((zoneId: string) => {
    const newPoints = new Map(injectionPoints)
    newPoints.delete(zoneId)
    onInjectionPointsChange(newPoints)
    setQuickEdit({ isOpen: false, zoneId: null, position: { x: 0, y: 0 } })
    setEditingPoint(null)
    toast.success('Injection point removed')
  }, [injectionPoints, onInjectionPointsChange])

  // Handle updating injection point value from EditPointPopover
  const handleUpdatePointValue = useCallback((pointId: string, value: number) => {
    // Find the zone for this point
    const zoneEntry = Array.from(injectionPoints.entries()).find(([_, p]) => p.id === pointId)
    if (zoneEntry) {
      const [zoneId, point] = zoneEntry
      const newPoints = new Map(injectionPoints)
      newPoints.set(zoneId, {
        ...point,
        ...(productType === 'neurotoxin' ? { units: value } : { volume: value })
      })
      onInjectionPointsChange(newPoints)
    }
  }, [injectionPoints, onInjectionPointsChange, productType])

  // Handle deleting an injection point from EditPointPopover
  const handleDeletePoint = useCallback((pointId: string) => {
    const zoneEntry = Array.from(injectionPoints.entries()).find(([_, p]) => p.id === pointId)
    if (zoneEntry) {
      const [zoneId] = zoneEntry
      removeInjectionPoint(zoneId)
    }
  }, [injectionPoints, removeInjectionPoint])

  // Close edit popover
  const closeEditPopover = useCallback(() => {
    setEditingPoint(null)
  }, [])

  // Get presets for current editing point
  const getPresetsForEditingPoint = useCallback(() => {
    if (!editingPoint) return undefined
    const presets = productType === 'neurotoxin'
      ? QUICK_UNIT_PRESETS[editingPoint.zoneId || ''] || QUICK_UNIT_PRESETS.default
      : QUICK_VOLUME_PRESETS[editingPoint.zoneId || ''] || QUICK_VOLUME_PRESETS.default
    return presets
  }, [editingPoint, productType])

  // Toggle selection mode
  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => prev === 'single' ? 'multi' : 'single')
    if (selectionMode === 'multi') {
      setMultiSelectedZones(new Set())
    }
  }, [selectionMode])

  // Apply batch units to selected zones
  const applyBatchUnits = useCallback(() => {
    if (multiSelectedZones.size === 0) {
      toast.error('No zones selected')
      return
    }

    const newPoints = new Map(injectionPoints)
    multiSelectedZones.forEach(zoneId => {
      const zone = getZoneById(zoneId)
      if (!zone) return

      const existingPoint = newPoints.get(zoneId)
      const smartDefaults = getSmartDefaults(zone)

      if (existingPoint) {
        newPoints.set(zoneId, {
          ...existingPoint,
          ...(productType === 'neurotoxin' ? { units: batchUnits } : { volume: batchUnits })
        })
      } else {
        const newPoint: InjectionPoint = {
          id: `ip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          zoneId: zone.id,
          units: productType === 'neurotoxin' ? batchUnits : undefined,
          volume: productType === 'filler' ? batchUnits : undefined,
          depthId: smartDefaults.depthId,
          techniqueId: smartDefaults.techniqueId,
          needleGaugeId: smartDefaults.needleGaugeId,
          productId: selectedProductId || activeProducts[0]?.id,
          timestamp: new Date()
        }
        newPoints.set(zone.id, newPoint)
      }
    })

    onInjectionPointsChange(newPoints)
    toast.success(`Applied ${batchUnits}${productType === 'neurotoxin' ? 'u' : 'ml'} to ${multiSelectedZones.size} zones`)
    setMultiSelectedZones(new Set())
    setSelectionMode('single')
  }, [multiSelectedZones, injectionPoints, onInjectionPointsChange, batchUnits, productType, getZoneById, getSmartDefaults, selectedProductId, activeProducts])

  // Clear all points
  const clearAll = useCallback(() => {
    if (confirm('Clear all injection points?')) {
      onInjectionPointsChange(new Map())
      setFreehandPoints(new Map())
      setMultiSelectedZones(new Set())
      toast.success('All points cleared')
    }
  }, [onInjectionPointsChange, setFreehandPoints])

  // Calculate totals
  const totals = useMemo(() => {
    let totalUnits = 0
    let totalVolume = 0
    let zoneCount = 0

    injectionPoints.forEach((point) => {
      zoneCount++
      if (point.units) totalUnits += point.units
      if (point.volume) totalVolume += point.volume
    })

    freehandPoints.forEach((point) => {
      if (point.units) totalUnits += point.units
      if (point.volume) totalVolume += point.volume
    })

    return { totalUnits, totalVolume, zoneCount }
  }, [injectionPoints, freehandPoints])

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Torso Chart - {gender === 'female' ? 'Female' : 'Male'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {productType === 'neurotoxin' ? 'Neurotoxin' : 'Filler'} Injections - {view === 'front' ? 'Front' : 'Back'} View
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <button
            onClick={handleViewToggle}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            title={`Switch to ${view === 'front' ? 'back' : 'front'} view`}
          >
            <RotateCw className={`w-4 h-4 transition-transform duration-300 ${view === 'back' ? 'rotate-180' : ''}`} />
            {view === 'front' ? 'Front' : 'Back'}
          </button>

          {/* Selection mode toggle */}
          <button
            onClick={toggleSelectionMode}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectionMode === 'multi'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={readOnly}
          >
            Multi-Select
          </button>

          {/* Clear all */}
          <button
            onClick={clearAll}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            disabled={readOnly || injectionPoints.size === 0}
            title="Clear all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Chart Area - fills 80% of available space */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center" ref={chartRef}>
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="w-[80%] h-[80%] transition-all duration-300 ease-in-out"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* SVG Definitions */}
          <defs>
            <linearGradient id="torsoBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <filter id="torsoZoneShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15" />
            </filter>
            <filter id="torsoInjectionGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Pulse animation for injection points */}
            <radialGradient id="pulseGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={productType === 'neurotoxin' ? '#8B5CF6' : '#EC4899'} stopOpacity="0.8" />
              <stop offset="100%" stopColor={productType === 'neurotoxin' ? '#8B5CF6' : '#EC4899'} stopOpacity="0" />
            </radialGradient>
          </defs>

          <g className="transition-opacity duration-300">
            {/* Torso outline */}
            <path
              d={torsoOutline}
              fill="url(#torsoBodyGradient)"
              stroke="#94a3b8"
              strokeWidth="2.5"
              className="transition-all duration-300"
            />

            {/* Anatomical reference lines */}
            {/* Center line */}
            <line
              x1={anatomyLines.centerLine.x1}
              y1={anatomyLines.centerLine.y1}
              x2={anatomyLines.centerLine.x2}
              y2={anatomyLines.centerLine.y2}
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="6 3"
              opacity="0.6"
            />

            {/* Horizontal guide lines */}
            {anatomyLines.horizontalLines.map((line, idx) => (
              <line
                key={`h-line-${idx}`}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke="#e2e8f0"
                strokeWidth="1"
                opacity="0.5"
              />
            ))}

            {/* Front view: Pectoral outlines */}
            {view === 'front' && 'pectorals' in anatomyLines && (
              <>
                <ellipse
                  cx={(anatomyLines as typeof FRONT_ANATOMY_LINES).pectorals.left.cx}
                  cy={(anatomyLines as typeof FRONT_ANATOMY_LINES).pectorals.left.cy}
                  rx={(anatomyLines as typeof FRONT_ANATOMY_LINES).pectorals.left.rx}
                  ry={(anatomyLines as typeof FRONT_ANATOMY_LINES).pectorals.left.ry}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <ellipse
                  cx={(anatomyLines as typeof FRONT_ANATOMY_LINES).pectorals.right.cx}
                  cy={(anatomyLines as typeof FRONT_ANATOMY_LINES).pectorals.right.cy}
                  rx={(anatomyLines as typeof FRONT_ANATOMY_LINES).pectorals.right.rx}
                  ry={(anatomyLines as typeof FRONT_ANATOMY_LINES).pectorals.right.ry}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  opacity="0.6"
                />
                {/* Abdominal sections */}
                {(anatomyLines as typeof FRONT_ANATOMY_LINES).abdominalRects.map((rect, idx) => (
                  <rect
                    key={`ab-rect-${idx}`}
                    x={rect.x}
                    y={rect.y}
                    width={rect.width}
                    height={rect.height}
                    rx={rect.rx}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                ))}
              </>
            )}

            {/* Back view: Scapula outlines */}
            {view === 'back' && 'scapulas' in anatomyLines && (
              <>
                <polygon
                  points={(anatomyLines as typeof BACK_ANATOMY_LINES).scapulas.left.points}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  opacity="0.6"
                />
                <polygon
                  points={(anatomyLines as typeof BACK_ANATOMY_LINES).scapulas.right.points}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  opacity="0.6"
                />
              </>
            )}

            {/* Clickable Zones */}
            {Object.entries(zonePositions).map(([zoneId, zoneData]) => {
              // Find matching zone from active zones or use zoneId as fallback name
              const zone = activeZones.find(z => z.id === zoneId) || { id: zoneId, name: zoneId.replace('zone-', '').replace(/-/g, ' ') }
              const point = injectionPoints.get(zoneId)
              const isSelected = selectedZone === zoneId
              const isHovered = hoveredZone === zoneId
              const hasInjection = point && (point.units || point.volume)
              const isMultiSelected = multiSelectedZones.has(zoneId)

              // Determine fill color based on state
              let fillColor = 'transparent'
              let fillOpacity = 0
              let strokeColor = 'transparent'
              let strokeWidth = 0

              // Only show visual zone fills for zones with injections or multi-selected zones
              // (empty zones without multi-selection stay clean/transparent)
              if (isMultiSelected) {
                fillColor = productType === 'neurotoxin' ? '#8B5CF6' : '#EC4899'
                fillOpacity = 0.4
                strokeColor = productType === 'neurotoxin' ? '#7C3AED' : '#DB2777'
                strokeWidth = 2
              } else if (hasInjection) {
                fillColor = productType === 'neurotoxin' ? '#8B5CF6' : '#EC4899'
                fillOpacity = isSelected ? 0.5 : 0.3
                strokeColor = productType === 'neurotoxin' ? '#7C3AED' : '#DB2777'
                strokeWidth = isSelected ? 3 : 2
              }
              // Note: Removed hover/selected states for empty zones to keep chart clean

              return (
                <g key={zoneId}>
                  {/* Zone path if available */}
                  {zoneData.path && (
                    <path
                      d={zoneData.path}
                      fill={fillColor}
                      fillOpacity={fillOpacity}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      className={`transition-all duration-200 ${!readOnly ? 'cursor-pointer hover:fill-opacity-20' : ''}`}
                      filter={hasInjection || isMultiSelected ? 'url(#torsoZoneShadow)' : undefined}
                      onClick={(e) => {
                        if (!readOnly) {
                          e.stopPropagation()
                          handleZoneClick(zone as TreatmentZone, e as unknown as React.MouseEvent)
                        }
                      }}
                      onMouseEnter={() => !readOnly && setHoveredZone(zoneId)}
                      onMouseLeave={() => setHoveredZone(null)}
                    >
                      <title>{typeof zone === 'object' && 'name' in zone ? zone.name : zoneId}</title>
                    </path>
                  )}

                  {/* Injection point marker - Reduced size by ~30% to prevent overlap */}
                  {hasInjection && (
                    <g filter="url(#torsoInjectionGlow)">
                      {/* Pulse ring animation - counter-scaled to maintain fixed screen size */}
                      <circle
                        cx={zoneData.x}
                        cy={zoneData.y}
                        r={7.5 * pointScaleFactor}
                        fill="url(#pulseGradient)"
                        className="animate-ping"
                        opacity="0.4"
                      />
                      {/* Main point - counter-scaled to maintain fixed screen size */}
                      <circle
                        cx={zoneData.x}
                        cy={zoneData.y}
                        r={5.5 * pointScaleFactor}
                        fill={productType === 'neurotoxin' ? '#8B5CF6' : '#EC4899'}
                        stroke="#fff"
                        strokeWidth={1 * pointScaleFactor}
                        className="transition-all duration-200"
                      />
                      {/* Value text label - positioned closer above the point */}
                      <text
                        x={zoneData.x}
                        y={zoneData.y - 8 * pointScaleFactor}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={7 * pointScaleFactor}
                        fontWeight="bold"
                        fill={productType === 'neurotoxin' ? '#8B5CF6' : '#EC4899'}
                        className="pointer-events-none"
                      >
                        {productType === 'neurotoxin' ? point.units : point.volume}{productType === 'neurotoxin' ? 'u' : 'ml'}
                      </text>
                    </g>
                  )}

                  {/* Interactive point marker - only shown for multi-selected zones without injections */}
                  {/* (empty zones without multi-selection are not rendered - clean chart) */}
                  {!hasInjection && isMultiSelected && (
                    <circle
                      cx={zoneData.x}
                      cy={zoneData.y}
                      r={5 * pointScaleFactor}
                      fill={productType === 'neurotoxin' ? '#8B5CF6' : '#EC4899'}
                      fillOpacity={0.9}
                      stroke={productType === 'neurotoxin' ? '#7C3AED' : '#DB2777'}
                      strokeWidth={1 * pointScaleFactor}
                      className={`transition-all duration-200 ${!readOnly ? 'cursor-pointer' : ''}`}
                      onClick={(e) => {
                        if (!readOnly) {
                          e.stopPropagation()
                          handleZoneClick(zone as TreatmentZone, e as unknown as React.MouseEvent)
                        }
                      }}
                      onMouseEnter={() => !readOnly && setHoveredZone(zoneId)}
                      onMouseLeave={() => setHoveredZone(null)}
                    />
                  )}

                  {/* Tooltip on hover/select - counter-scaled and positioned closer */}
                  {(isHovered || isSelected) && (
                    <g className="pointer-events-none" transform={`translate(${zoneData.x}, ${zoneData.y}) scale(${pointScaleFactor}) translate(${-zoneData.x}, ${-zoneData.y})`}>
                      <rect
                        x={zoneData.x - 45}
                        y={zoneData.y + 12}
                        width={90}
                        height={hasInjection ? 28 : 20}
                        rx={4}
                        fill="#1F2937"
                        fillOpacity="0.95"
                      />
                      <text
                        x={zoneData.x}
                        y={zoneData.y + 24}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#fff"
                      >
                        {typeof zone === 'object' && 'name' in zone ? zone.name : zoneId.replace('zone-', '').replace(/-/g, ' ')}
                      </text>
                      {hasInjection && (
                        <text
                          x={zoneData.x}
                          y={zoneData.y + 34}
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="bold"
                          fill={productType === 'neurotoxin' ? '#C4B5FD' : '#F9A8D4'}
                        >
                          {productType === 'neurotoxin' ? `${point.units}u` : `${point.volume}ml`}
                        </text>
                      )}
                    </g>
                  )}
                </g>
              )
            })}
          </g>
        </svg>

        {/* Edit Point Popover - Tap-to-edit for injection points */}
        <EditPointPopover
          editingPoint={editingPoint}
          productType={productType}
          containerRef={chartRef}
          onUpdateValue={handleUpdatePointValue}
          onDelete={handleDeletePoint}
          onClose={closeEditPopover}
          presets={getPresetsForEditingPoint()}
          readOnly={readOnly}
        />

        {/* Multi-select batch panel */}
        {selectionMode === 'multi' && multiSelectedZones.size > 0 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
            <div className="text-sm text-gray-600 mb-3">
              {multiSelectedZones.size} zones selected
            </div>

            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setBatchUnits(Math.max(0, batchUnits - (productType === 'neurotoxin' ? 5 : 0.5)))}
                className="p-2 rounded bg-gray-100 hover:bg-gray-200"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={batchUnits}
                onChange={(e) => setBatchUnits(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold"
                step={productType === 'neurotoxin' ? 5 : 0.5}
              />
              <span className="text-sm text-gray-600">
                {productType === 'neurotoxin' ? 'units' : 'ml'}
              </span>
              <button
                onClick={() => setBatchUnits(batchUnits + (productType === 'neurotoxin' ? 5 : 0.5))}
                className="p-2 rounded bg-gray-100 hover:bg-gray-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={applyBatchUnits}
              className={`w-full px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                productType === 'neurotoxin'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-pink-600 hover:bg-pink-700'
              }`}
            >
              <Check className="w-4 h-4 inline mr-2" />
              Apply to Selected Zones
            </button>
          </div>
        )}
      </div>

      {/* Footer with totals */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Total</div>
            <div className={`text-2xl font-bold ${
              productType === 'neurotoxin' ? 'text-purple-700' : 'text-pink-700'
            }`}>
              {productType === 'neurotoxin'
                ? `${totals.totalUnits} units`
                : `${totals.totalVolume.toFixed(1)} ml`
              }
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Zones</div>
            <div className="text-2xl font-bold text-gray-900">{totals.zoneCount}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export additional types for external use
export type { ViewType }
