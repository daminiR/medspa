'use client'

import React, { useState, useCallback, useMemo, useRef } from 'react'
import {
  useChartingSettings,
  TreatmentZone
} from '@/contexts/ChartingSettingsContext'
import {
  Plus,
  Minus,
  RotateCw,
  X,
  Check,
  FlipHorizontal
} from 'lucide-react'
import toast from 'react-hot-toast'
import { EditPointPopover, EditingPoint } from './EditPointPopover'

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

type SelectionMode = 'single' | 'multi'
type BodyView = 'front' | 'back'

interface QuickEditState {
  isOpen: boolean
  zoneId: string | null
  position: { x: number; y: number }
}

interface FullBodyChartProps {
  productType: 'neurotoxin' | 'filler'
  injectionPoints: Map<string, InjectionPoint>
  onInjectionPointsChange: (points: Map<string, InjectionPoint>) => void
  onSave?: () => void
  selectedProductId?: string
  selectedProductColor?: string // The color of the selected product (for new points)
  patientLastTreatment?: Map<string, InjectionPoint>
  readOnly?: boolean
  // Zoom level for counter-scaling points (optional - defaults to 1)
  // When provided, points will counter-scale to maintain fixed screen size
  zoom?: number
  // Selected dosage from floating product picker (optional)
  // When provided, new injection points will use this dosage instead of smart defaults
  selectedDosage?: number
}

// =============================================================================
// SVG BODY ZONE DEFINITIONS
// =============================================================================

interface BodyZoneDefinition {
  id: string
  name: string
  path: string
  labelPosition: { x: number; y: number }
}

// Front view zones with SVG paths
const FRONT_BODY_ZONES: BodyZoneDefinition[] = [
  // Head
  {
    id: 'zone-body-head',
    name: 'Head',
    path: 'M 200 20 C 175 20 155 40 155 70 C 155 100 175 120 200 120 C 225 120 245 100 245 70 C 245 40 225 20 200 20 Z',
    labelPosition: { x: 200, y: 70 }
  },
  // Neck
  {
    id: 'zone-body-neck-front',
    name: 'Neck (Front)',
    path: 'M 185 120 L 215 120 L 220 145 L 180 145 Z',
    labelPosition: { x: 200, y: 132 }
  },
  // Left Shoulder
  {
    id: 'zone-body-shoulder-l',
    name: 'Left Shoulder',
    path: 'M 145 145 L 180 145 L 175 175 L 140 175 Q 130 160 145 145 Z',
    labelPosition: { x: 157, y: 160 }
  },
  // Right Shoulder
  {
    id: 'zone-body-shoulder-r',
    name: 'Right Shoulder',
    path: 'M 220 145 L 255 145 Q 270 160 260 175 L 225 175 L 220 145 Z',
    labelPosition: { x: 243, y: 160 }
  },
  // Chest
  {
    id: 'zone-body-chest',
    name: 'Chest',
    path: 'M 175 145 L 225 145 L 230 200 L 170 200 Z',
    labelPosition: { x: 200, y: 172 }
  },
  // Left Upper Arm
  {
    id: 'zone-body-upper-arm-l',
    name: 'Left Upper Arm',
    path: 'M 130 175 L 145 175 L 140 250 L 115 250 Q 110 210 130 175 Z',
    labelPosition: { x: 127, y: 212 }
  },
  // Right Upper Arm
  {
    id: 'zone-body-upper-arm-r',
    name: 'Right Upper Arm',
    path: 'M 255 175 L 270 175 Q 290 210 285 250 L 260 250 L 255 175 Z',
    labelPosition: { x: 273, y: 212 }
  },
  // Upper Abdomen
  {
    id: 'zone-body-abdomen-upper',
    name: 'Upper Abdomen',
    path: 'M 170 200 L 230 200 L 232 260 L 168 260 Z',
    labelPosition: { x: 200, y: 230 }
  },
  // Left Forearm
  {
    id: 'zone-body-forearm-l',
    name: 'Left Forearm',
    path: 'M 105 250 L 130 250 L 115 340 L 90 340 Q 85 290 105 250 Z',
    labelPosition: { x: 107, y: 295 }
  },
  // Right Forearm
  {
    id: 'zone-body-forearm-r',
    name: 'Right Forearm',
    path: 'M 270 250 L 295 250 Q 315 290 310 340 L 285 340 L 270 250 Z',
    labelPosition: { x: 293, y: 295 }
  },
  // Lower Abdomen
  {
    id: 'zone-body-abdomen-lower',
    name: 'Lower Abdomen',
    path: 'M 168 260 L 232 260 L 235 320 L 165 320 Z',
    labelPosition: { x: 200, y: 290 }
  },
  // Left Hip
  {
    id: 'zone-body-hip-l',
    name: 'Left Hip',
    path: 'M 155 320 L 168 320 L 175 365 L 150 365 Q 145 340 155 320 Z',
    labelPosition: { x: 162, y: 342 }
  },
  // Right Hip
  {
    id: 'zone-body-hip-r',
    name: 'Right Hip',
    path: 'M 232 320 L 245 320 Q 255 340 250 365 L 225 365 L 232 320 Z',
    labelPosition: { x: 238, y: 342 }
  },
  // Left Hand
  {
    id: 'zone-body-hand-l',
    name: 'Left Hand',
    path: 'M 80 340 L 105 340 L 100 400 L 70 400 Q 60 370 80 340 Z',
    labelPosition: { x: 85, y: 370 }
  },
  // Right Hand
  {
    id: 'zone-body-hand-r',
    name: 'Right Hand',
    path: 'M 295 340 L 320 340 Q 340 370 330 400 L 300 400 L 295 340 Z',
    labelPosition: { x: 315, y: 370 }
  },
  // Left Thigh
  {
    id: 'zone-body-thigh-l',
    name: 'Left Thigh',
    path: 'M 160 365 L 195 365 L 190 480 L 155 480 Q 150 420 160 365 Z',
    labelPosition: { x: 175, y: 422 }
  },
  // Right Thigh
  {
    id: 'zone-body-thigh-r',
    name: 'Right Thigh',
    path: 'M 205 365 L 240 365 Q 250 420 245 480 L 210 480 L 205 365 Z',
    labelPosition: { x: 225, y: 422 }
  },
  // Left Knee
  {
    id: 'zone-body-knee-l',
    name: 'Left Knee',
    path: 'M 155 480 L 190 480 L 188 530 L 157 530 Z',
    labelPosition: { x: 172, y: 505 }
  },
  // Right Knee
  {
    id: 'zone-body-knee-r',
    name: 'Right Knee',
    path: 'M 210 480 L 245 480 L 243 530 L 212 530 Z',
    labelPosition: { x: 228, y: 505 }
  },
  // Left Calf
  {
    id: 'zone-body-calf-l',
    name: 'Left Calf',
    path: 'M 157 530 L 188 530 L 185 640 L 160 640 Q 152 580 157 530 Z',
    labelPosition: { x: 172, y: 585 }
  },
  // Right Calf
  {
    id: 'zone-body-calf-r',
    name: 'Right Calf',
    path: 'M 212 530 L 243 530 Q 248 580 240 640 L 215 640 L 212 530 Z',
    labelPosition: { x: 228, y: 585 }
  },
  // Left Foot
  {
    id: 'zone-body-foot-l',
    name: 'Left Foot',
    path: 'M 155 640 L 190 640 L 195 690 L 145 690 Q 140 665 155 640 Z',
    labelPosition: { x: 170, y: 665 }
  },
  // Right Foot
  {
    id: 'zone-body-foot-r',
    name: 'Right Foot',
    path: 'M 210 640 L 245 640 Q 260 665 255 690 L 205 690 L 210 640 Z',
    labelPosition: { x: 230, y: 665 }
  }
]

// Back view zones with SVG paths
const BACK_BODY_ZONES: BodyZoneDefinition[] = [
  // Head (Back)
  {
    id: 'zone-body-head-back',
    name: 'Head (Back)',
    path: 'M 200 20 C 175 20 155 40 155 70 C 155 100 175 120 200 120 C 225 120 245 100 245 70 C 245 40 225 20 200 20 Z',
    labelPosition: { x: 200, y: 70 }
  },
  // Neck (Back)
  {
    id: 'zone-body-neck-back',
    name: 'Neck (Back)',
    path: 'M 185 120 L 215 120 L 220 145 L 180 145 Z',
    labelPosition: { x: 200, y: 132 }
  },
  // Left Shoulder (Back)
  {
    id: 'zone-body-shoulder-back-l',
    name: 'Left Shoulder (Back)',
    path: 'M 145 145 L 180 145 L 175 175 L 140 175 Q 130 160 145 145 Z',
    labelPosition: { x: 157, y: 160 }
  },
  // Right Shoulder (Back)
  {
    id: 'zone-body-shoulder-back-r',
    name: 'Right Shoulder (Back)',
    path: 'M 220 145 L 255 145 Q 270 160 260 175 L 225 175 L 220 145 Z',
    labelPosition: { x: 243, y: 160 }
  },
  // Upper Back
  {
    id: 'zone-body-upper-back',
    name: 'Upper Back',
    path: 'M 175 145 L 225 145 L 230 200 L 170 200 Z',
    labelPosition: { x: 200, y: 172 }
  },
  // Left Tricep
  {
    id: 'zone-body-tricep-l',
    name: 'Left Tricep',
    path: 'M 130 175 L 145 175 L 140 250 L 115 250 Q 110 210 130 175 Z',
    labelPosition: { x: 127, y: 212 }
  },
  // Right Tricep
  {
    id: 'zone-body-tricep-r',
    name: 'Right Tricep',
    path: 'M 255 175 L 270 175 Q 290 210 285 250 L 260 250 L 255 175 Z',
    labelPosition: { x: 273, y: 212 }
  },
  // Mid Back
  {
    id: 'zone-body-mid-back',
    name: 'Mid Back',
    path: 'M 170 200 L 230 200 L 232 260 L 168 260 Z',
    labelPosition: { x: 200, y: 230 }
  },
  // Left Forearm (Back)
  {
    id: 'zone-body-forearm-back-l',
    name: 'Left Forearm (Back)',
    path: 'M 105 250 L 130 250 L 115 340 L 90 340 Q 85 290 105 250 Z',
    labelPosition: { x: 107, y: 295 }
  },
  // Right Forearm (Back)
  {
    id: 'zone-body-forearm-back-r',
    name: 'Right Forearm (Back)',
    path: 'M 270 250 L 295 250 Q 315 290 310 340 L 285 340 L 270 250 Z',
    labelPosition: { x: 293, y: 295 }
  },
  // Lower Back
  {
    id: 'zone-body-lower-back',
    name: 'Lower Back',
    path: 'M 168 260 L 232 260 L 235 320 L 165 320 Z',
    labelPosition: { x: 200, y: 290 }
  },
  // Left Gluteal
  {
    id: 'zone-body-gluteal-l',
    name: 'Left Gluteal',
    path: 'M 155 320 L 200 320 L 200 380 L 150 380 Q 145 350 155 320 Z',
    labelPosition: { x: 175, y: 350 }
  },
  // Right Gluteal
  {
    id: 'zone-body-gluteal-r',
    name: 'Right Gluteal',
    path: 'M 200 320 L 245 320 Q 255 350 250 380 L 200 380 L 200 320 Z',
    labelPosition: { x: 225, y: 350 }
  },
  // Left Hamstring
  {
    id: 'zone-body-hamstring-l',
    name: 'Left Hamstring',
    path: 'M 155 380 L 195 380 L 190 480 L 155 480 Q 150 430 155 380 Z',
    labelPosition: { x: 172, y: 430 }
  },
  // Right Hamstring
  {
    id: 'zone-body-hamstring-r',
    name: 'Right Hamstring',
    path: 'M 205 380 L 245 380 Q 250 430 245 480 L 210 480 L 205 380 Z',
    labelPosition: { x: 228, y: 430 }
  },
  // Left Knee (Back)
  {
    id: 'zone-body-knee-back-l',
    name: 'Left Knee (Back)',
    path: 'M 155 480 L 190 480 L 188 530 L 157 530 Z',
    labelPosition: { x: 172, y: 505 }
  },
  // Right Knee (Back)
  {
    id: 'zone-body-knee-back-r',
    name: 'Right Knee (Back)',
    path: 'M 210 480 L 245 480 L 243 530 L 212 530 Z',
    labelPosition: { x: 228, y: 505 }
  },
  // Left Calf (Back)
  {
    id: 'zone-body-calf-back-l',
    name: 'Left Calf (Back)',
    path: 'M 157 530 L 188 530 L 185 640 L 160 640 Q 152 580 157 530 Z',
    labelPosition: { x: 172, y: 585 }
  },
  // Right Calf (Back)
  {
    id: 'zone-body-calf-back-r',
    name: 'Right Calf (Back)',
    path: 'M 212 530 L 243 530 Q 248 580 240 640 L 215 640 L 212 530 Z',
    labelPosition: { x: 228, y: 585 }
  }
]

// Full body outline path for front view
const FRONT_BODY_OUTLINE = `
  M 200 20
  C 175 20 155 40 155 70
  C 155 100 175 120 200 120
  C 225 120 245 100 245 70
  C 245 40 225 20 200 20
  M 185 120
  L 180 145
  L 145 145
  Q 120 155 115 175
  L 100 250
  Q 80 290 75 340
  L 60 400
  L 100 405
  L 115 345
  L 130 260
  L 145 260
  L 150 365
  L 155 480
  L 150 530
  Q 145 580 155 640
  L 145 690
  L 195 695
  L 195 640
  L 188 530
  L 190 365
  L 200 320
  L 210 365
  L 212 530
  L 205 640
  L 205 695
  L 255 690
  L 245 640
  Q 255 580 250 530
  L 245 480
  L 250 365
  L 255 260
  L 270 260
  L 285 345
  L 300 405
  L 340 400
  L 325 340
  Q 320 290 300 250
  L 285 175
  Q 280 155 255 145
  L 220 145
  L 215 120
  L 200 120
  Z
`

// Full body outline path for back view
const BACK_BODY_OUTLINE = `
  M 200 20
  C 175 20 155 40 155 70
  C 155 100 175 120 200 120
  C 225 120 245 100 245 70
  C 245 40 225 20 200 20
  M 185 120
  L 180 145
  L 145 145
  Q 120 155 115 175
  L 100 250
  Q 80 290 75 340
  L 60 400
  L 100 405
  L 115 345
  L 130 260
  L 145 260
  L 150 380
  L 155 480
  L 150 530
  Q 145 580 155 640
  L 145 690
  L 195 695
  L 195 640
  L 188 530
  L 190 480
  L 195 380
  L 200 320
  L 205 380
  L 210 480
  L 212 530
  L 205 640
  L 205 695
  L 255 690
  L 245 640
  Q 255 580 250 530
  L 245 480
  L 250 380
  L 255 260
  L 270 260
  L 285 345
  L 300 405
  L 340 400
  L 325 340
  Q 320 290 300 250
  L 285 175
  Q 280 155 255 145
  L 220 145
  L 215 120
  L 200 120
  Z
`

// =============================================================================
// CONSTANTS
// =============================================================================

// Color scheme
const COLORS = {
  neurotoxin: {
    primary: '#8B5CF6',
    light: '#C4B5FD',
    dark: '#6D28D9',
    fill: 'rgba(139, 92, 246, 0.3)',
    stroke: '#8B5CF6'
  },
  filler: {
    primary: '#EC4899',
    light: '#F9A8D4',
    dark: '#BE185D',
    fill: 'rgba(236, 72, 153, 0.3)',
    stroke: '#EC4899'
  }
}

// Quick unit presets based on zone
const QUICK_UNIT_PRESETS: Record<string, number[]> = {
  'zone-body-shoulder-l': [20, 30, 40, 50],
  'zone-body-shoulder-r': [20, 30, 40, 50],
  'zone-body-upper-arm-l': [30, 40, 50, 60],
  'zone-body-upper-arm-r': [30, 40, 50, 60],
  default: [10, 20, 30, 40]
}

const QUICK_VOLUME_PRESETS: Record<string, number[]> = {
  'zone-body-hand-l': [1.0, 1.5, 2.0, 2.5],
  'zone-body-hand-r': [1.0, 1.5, 2.0, 2.5],
  'zone-body-gluteal-l': [5.0, 10.0, 15.0, 20.0],
  'zone-body-gluteal-r': [5.0, 10.0, 15.0, 20.0],
  default: [0.5, 1.0, 2.0, 3.0]
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function FullBodyChart({
  productType,
  injectionPoints,
  onInjectionPointsChange,
  onSave,
  selectedProductId,
  patientLastTreatment,
  readOnly = false,
  zoom = 1,
  selectedDosage
}: FullBodyChartProps) {
  // Calculate counter-scale factor for SVG elements to keep points fixed size when zoomed
  const pointScaleFactor = 1 / zoom
  const {
    getActiveZones,
    getActiveDepths,
    getActiveTechniques,
    getActiveNeedleGauges,
    getActiveProducts,
    getZoneById,
    getProductById
  } = useChartingSettings()

  // State
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [quickEdit, setQuickEdit] = useState<QuickEditState>({
    isOpen: false,
    zoneId: null,
    position: { x: 0, y: 0 }
  })
  const [bodyView, setBodyView] = useState<BodyView>('front')
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('single')
  const [multiSelectedZones, setMultiSelectedZones] = useState<Set<string>>(new Set())
  const [batchUnits, setBatchUnits] = useState<number>(productType === 'neurotoxin' ? 10 : 1.0)

  // Tap-to-edit state using shared EditPointPopover
  const [editingPoint, setEditingPoint] = useState<EditingPoint | null>(null)

  const chartRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Get active items from settings
  const activeBodyZones = useMemo(() => getActiveZones('body'), [getActiveZones])
  const activeDepths = useMemo(() => getActiveDepths(), [getActiveDepths])
  const activeTechniques = useMemo(() => getActiveTechniques(), [getActiveTechniques])
  const activeGauges = useMemo(() => getActiveNeedleGauges(), [getActiveNeedleGauges])
  const activeProducts = useMemo(() => getActiveProducts(productType), [getActiveProducts, productType])

  // Current body zones based on view
  const currentBodyZones = bodyView === 'front' ? FRONT_BODY_ZONES : BACK_BODY_ZONES
  const currentOutline = bodyView === 'front' ? FRONT_BODY_OUTLINE : BACK_BODY_OUTLINE

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

    const product = selectedProductId ? getProductById(selectedProductId) : activeProducts[0]
    const estimatedCost = product
      ? (productType === 'neurotoxin' ? totalUnits * product.unitPrice : totalVolume * product.unitPrice)
      : 0

    return { totalUnits, totalVolume, zoneCount, estimatedCost }
  }, [injectionPoints, selectedProductId, getProductById, activeProducts, productType])

  // ==========================================================================
  // HAPTIC FEEDBACK UTILITY
  // ==========================================================================

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

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  // Get smart defaults based on zone + patient history
  const getSmartDefaults = useCallback((zoneId: string, lastTreatment?: Map<string, InjectionPoint>) => {
    if (lastTreatment?.has(zoneId)) {
      const last = lastTreatment.get(zoneId)!
      return {
        units: last.units || 20,
        volume: last.volume || 1.0,
        depthId: last.depthId,
        techniqueId: last.techniqueId,
        needleGaugeId: last.needleGaugeId
      }
    }

    // Use context zone if available
    const contextZone = getZoneById(zoneId)
    if (contextZone) {
      return {
        units: contextZone.defaultUnits || 20,
        volume: contextZone.defaultVolume || 1.0,
        depthId: contextZone.defaultDepth || activeDepths[0]?.id || 'depth-im',
        techniqueId: contextZone.defaultTechnique || activeTechniques[0]?.id || 'tech-serial',
        needleGaugeId: contextZone.defaultNeedleGauge || activeGauges[0]?.id || 'ng-30'
      }
    }

    return {
      units: 20,
      volume: 1.0,
      depthId: activeDepths[0]?.id || 'depth-im',
      techniqueId: activeTechniques[0]?.id || 'tech-serial',
      needleGaugeId: activeGauges[0]?.id || 'ng-30'
    }
  }, [getZoneById, activeDepths, activeTechniques, activeGauges])

  // Handle zone click
  const handleZoneClick = useCallback((zone: BodyZoneDefinition, event: React.MouseEvent) => {
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
      const smartDefaults = getSmartDefaults(zone.id, patientLastTreatment)

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
      // Open edit popover for the new point
      if (rect) {
        setEditingPoint({
          id: newPoint.id,
          zoneId: zone.id,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          currentValue: dosageValue || 0,
          pointName: zone.name || zone.id
        })
      }
    }
  }, [injectionPoints, onInjectionPointsChange, productType, patientLastTreatment, selectedProductId, activeProducts, readOnly, selectionMode, getSmartDefaults, triggerHaptic, selectedDosage])

  // Update injection point
  const updateInjectionPoint = useCallback((zoneId: string, updates: Partial<InjectionPoint>) => {
    const newPoints = new Map(injectionPoints)
    const existing = newPoints.get(zoneId)
    if (existing) {
      newPoints.set(zoneId, { ...existing, ...updates })
      onInjectionPointsChange(newPoints)
    }
  }, [injectionPoints, onInjectionPointsChange])

  // Remove injection point
  const removeInjectionPoint = useCallback((zoneId: string) => {
    const newPoints = new Map(injectionPoints)
    newPoints.delete(zoneId)
    onInjectionPointsChange(newPoints)
    setQuickEdit({ isOpen: false, zoneId: null, position: { x: 0, y: 0 } })
    setEditingPoint(null)
    setSelectedZone(null)
    toast.success('Removed', { duration: 1000 })
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

  // Quick unit adjustment
  const quickAdjustUnits = useCallback((zoneId: string, delta: number) => {
    const point = injectionPoints.get(zoneId)
    if (!point) return

    if (productType === 'neurotoxin') {
      const newUnits = Math.max(0, (point.units || 0) + delta)
      updateInjectionPoint(zoneId, { units: newUnits })
    } else {
      const newVolume = Math.max(0, parseFloat(((point.volume || 0) + delta).toFixed(2)))
      updateInjectionPoint(zoneId, { volume: newVolume })
    }
  }, [injectionPoints, productType, updateInjectionPoint])

  // Set exact units
  const setExactUnits = useCallback((zoneId: string, value: number) => {
    if (productType === 'neurotoxin') {
      updateInjectionPoint(zoneId, { units: value })
    } else {
      updateInjectionPoint(zoneId, { volume: value })
    }
  }, [productType, updateInjectionPoint])

  // Toggle selection mode
  const toggleSelectionMode = useCallback(() => {
    setSelectionMode(prev => {
      const newMode = prev === 'single' ? 'multi' : 'single'
      if (newMode === 'single') {
        setMultiSelectedZones(new Set())
      }
      toast.success(newMode === 'multi' ? 'Multi-select enabled' : 'Single-select mode', { duration: 1500 })
      return newMode
    })
  }, [])

  // Apply batch units to all selected zones
  const applyBatchUnits = useCallback(() => {
    if (multiSelectedZones.size === 0) return

    const newPoints = new Map(injectionPoints)

    multiSelectedZones.forEach(zoneId => {
      const zoneDef = currentBodyZones.find(z => z.id === zoneId)
      if (!zoneDef) return

      const existing = newPoints.get(zoneId)
      if (existing) {
        // Update existing point
        if (productType === 'neurotoxin') {
          newPoints.set(zoneId, { ...existing, units: batchUnits })
        } else {
          newPoints.set(zoneId, { ...existing, volume: batchUnits })
        }
      } else {
        // Create new point
        const smartDefaults = getSmartDefaults(zoneId, patientLastTreatment)
        newPoints.set(zoneId, {
          id: `ip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          zoneId: zoneId,
          units: productType === 'neurotoxin' ? batchUnits : undefined,
          volume: productType === 'filler' ? batchUnits : undefined,
          depthId: smartDefaults.depthId,
          techniqueId: smartDefaults.techniqueId,
          needleGaugeId: smartDefaults.needleGaugeId,
          productId: selectedProductId || activeProducts[0]?.id,
          timestamp: new Date()
        })
      }
    })

    onInjectionPointsChange(newPoints)
    setMultiSelectedZones(new Set())
    setSelectionMode('single')
    toast.success(`Applied ${batchUnits}${productType === 'neurotoxin' ? 'u' : 'ml'} to ${multiSelectedZones.size} zones`)
  }, [multiSelectedZones, injectionPoints, batchUnits, productType, currentBodyZones, getSmartDefaults, patientLastTreatment, selectedProductId, activeProducts, onInjectionPointsChange])

  // Clear all zones
  const clearAllZones = useCallback(() => {
    if (window.confirm('Clear all injection points?')) {
      onInjectionPointsChange(new Map())
      setQuickEdit({ isOpen: false, zoneId: null, position: { x: 0, y: 0 } })
      setSelectedZone(null)
      toast.success('All zones cleared')
    }
  }, [onInjectionPointsChange])

  // Toggle body view
  const toggleBodyView = useCallback(() => {
    setBodyView(prev => prev === 'front' ? 'back' : 'front')
    toast.success(`Viewing ${bodyView === 'front' ? 'back' : 'front'} of body`, { duration: 1500 })
  }, [bodyView])

  // Get zone name from ID
  const getZoneName = useCallback((zoneId: string) => {
    const allZones = [...FRONT_BODY_ZONES, ...BACK_BODY_ZONES]
    return allZones.find(z => z.id === zoneId)?.name || zoneId
  }, [])

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
        <div className="flex items-center gap-3 md:gap-4">
          <h3 className="font-medium text-base md:text-lg text-gray-900">Full Body Injection Map</h3>
          <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            productType === 'neurotoxin'
              ? 'bg-purple-50 text-purple-700'
              : 'bg-pink-50 text-pink-700'
          }`}>
            {productType === 'neurotoxin' ? 'Neurotoxin' : 'Filler'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Multi-Select Toggle */}
          <button
            onClick={toggleSelectionMode}
            className={`p-2 rounded-lg text-sm font-medium transition-colors ${
              selectionMode === 'multi'
                ? productType === 'neurotoxin'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-pink-100 text-pink-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Toggle multi-select mode (M)"
          >
            {selectionMode === 'multi' ? 'Multi' : 'Single'}
          </button>

          {/* View Toggle */}
          <button
            onClick={toggleBodyView}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
            title="Toggle front/back view"
          >
            <FlipHorizontal className="w-5 h-5" />
          </button>

          {/* Clear All */}
          <button
            onClick={clearAllZones}
            disabled={injectionPoints.size === 0}
            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Clear all zones"
          >
            <RotateCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Body Chart Area */}
        <div
          ref={chartRef}
          className="flex-1 relative overflow-hidden bg-gray-50"
        >
          {/* Centered SVG Container - fills 80% of space */}
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-6 lg:p-8">
            <div
              className="relative flex items-center justify-center"
              style={{
                width: '80%',
                height: '80%',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              <svg
                ref={svgRef}
                viewBox="0 0 400 720"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full transition-all duration-300"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              >
                {/* Definitions for filters and gradients */}
                <defs>
                  <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>
                  <filter id="zoneShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
                  </filter>
                  <filter id="zoneGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="selectedGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Body outline */}
                <path
                  d={currentOutline}
                  fill="url(#bodyGradient)"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />

                {/* Center line reference */}
                <line
                  x1="200"
                  y1="20"
                  x2="200"
                  y2="695"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  strokeDasharray="8 4"
                  opacity="0.4"
                />

                {/* Clickable zones */}
                {currentBodyZones.map((zone) => {
                  const point = injectionPoints.get(zone.id)
                  const isSelected = selectedZone === zone.id
                  const isHovered = hoveredZone === zone.id
                  const hasInjection = point && (point.units || point.volume)
                  const isMultiSelected = multiSelectedZones.has(zone.id)
                  const colors = COLORS[productType]

                  return (
                    <g key={zone.id}>
                      {/* Zone path */}
                      <path
                        d={zone.path}
                        fill={
                          isMultiSelected || hasInjection
                            ? colors.fill
                            : isHovered
                              ? 'rgba(148, 163, 184, 0.2)'
                              : 'transparent'
                        }
                        stroke={
                          isMultiSelected || hasInjection
                            ? colors.stroke
                            : isHovered || isSelected
                              ? '#64748b'
                              : 'transparent'
                        }
                        strokeWidth={isSelected || isMultiSelected ? 3 : 2}
                        className={`
                          cursor-pointer transition-all duration-200
                          ${!readOnly ? 'hover:fill-slate-100' : ''}
                        `}
                        filter={isSelected || isMultiSelected ? 'url(#zoneShadow)' : undefined}
                        onClick={(e) => handleZoneClick(zone, e)}
                        onMouseEnter={() => !readOnly && setHoveredZone(zone.id)}
                        onMouseLeave={() => setHoveredZone(null)}
                        style={{ touchAction: 'manipulation' }}
                      >
                        <title>{zone.name}</title>
                      </path>

                      {/* Injection marker - counter-scaled to maintain fixed screen size */}
                      {hasInjection && (
                        <g filter="url(#zoneGlow)">
                          <circle
                            cx={zone.labelPosition.x}
                            cy={zone.labelPosition.y}
                            r={(isSelected ? 11 : 10) * pointScaleFactor}
                            fill={colors.primary}
                            stroke="#fff"
                            strokeWidth={1.5 * pointScaleFactor}
                            className="transition-all duration-200"
                          />
                          <text
                            x={zone.labelPosition.x}
                            y={zone.labelPosition.y + 1}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={7 * pointScaleFactor}
                            fontWeight="bold"
                            fill="#fff"
                            className="pointer-events-none select-none"
                          >
                            {point.units || point.volume}
                            {productType === 'neurotoxin' ? 'u' : ''}
                          </text>
                        </g>
                      )}

                      {/* Multi-select indicator - counter-scaled to maintain fixed screen size */}
                      {isMultiSelected && !hasInjection && (
                        <g>
                          <circle
                            cx={zone.labelPosition.x}
                            cy={zone.labelPosition.y}
                            r={8.5 * pointScaleFactor}
                            fill={colors.primary}
                            stroke="#fff"
                            strokeWidth={1.5 * pointScaleFactor}
                            className="animate-pulse"
                          />
                          <text
                            x={zone.labelPosition.x}
                            y={zone.labelPosition.y + 1}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={7 * pointScaleFactor}
                            fontWeight="bold"
                            fill="#fff"
                            className="pointer-events-none select-none"
                          >
                            {Array.from(multiSelectedZones).indexOf(zone.id) + 1}
                          </text>
                        </g>
                      )}
                    </g>
                  )
                })}

                {/* View Label - counter-scaled to maintain fixed screen size */}
                <g transform={`translate(200, 16) scale(${pointScaleFactor}) translate(-200, -16)`}>
                  <rect
                    x="160"
                    y="5"
                    width="80"
                    height="22"
                    rx="11"
                    fill="#1f2937"
                    opacity="0.9"
                  />
                  <text
                    x="200"
                    y="18"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                    fontWeight="500"
                    fill="#fff"
                    className="pointer-events-none select-none"
                  >
                    {bodyView === 'front' ? 'Front View' : 'Back View'}
                  </text>
                </g>
              </svg>
            </div>
          </div>

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
        </div>

        {/* Right Sidebar - Totals & Controls */}
        <div className="w-72 lg:w-80 border-l border-gray-200 bg-white overflow-y-auto flex-shrink-0">
          {/* Totals */}
          <div className="p-4 border-b border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Treatment Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Sites:</span>
                <span className="text-sm font-semibold text-gray-900">{totals.zoneCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {productType === 'neurotoxin' ? 'Total Units:' : 'Total Volume:'}
                </span>
                <span className={`text-lg font-bold ${
                  productType === 'neurotoxin' ? 'text-purple-600' : 'text-pink-600'
                }`}>
                  {productType === 'neurotoxin' ? totals.totalUnits : totals.totalVolume.toFixed(1)}
                  {productType === 'neurotoxin' ? 'u' : 'ml'}
                </span>
              </div>
              {totals.estimatedCost > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-600">Estimated Cost:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${totals.estimatedCost.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Multi-Select Panel */}
          {selectionMode === 'multi' && (
            <div className={`p-4 border-b ${
              productType === 'neurotoxin' ? 'bg-purple-50' : 'bg-pink-50'
            }`}>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Batch Input ({multiSelectedZones.size} zones)
              </h4>

              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {productType === 'neurotoxin' ? 'Units per zone' : 'Volume per zone (ml)'}
                </label>
                <input
                  type="number"
                  value={batchUnits}
                  onChange={(e) => setBatchUnits(parseFloat(e.target.value) || 0)}
                  step={productType === 'neurotoxin' ? 5 : 0.5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <button
                onClick={applyBatchUnits}
                disabled={multiSelectedZones.size === 0}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  productType === 'neurotoxin'
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-pink-600 hover:bg-pink-700'
                }`}
              >
                Apply to Selected Zones
              </button>
            </div>
          )}

          {/* Quick Edit Panel */}
          {quickEdit.isOpen && quickEdit.zoneId && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  {getZoneName(quickEdit.zoneId)}
                </h4>
                <button
                  onClick={() => setQuickEdit({ isOpen: false, zoneId: null, position: { x: 0, y: 0 } })}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Quick Adjust */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    {productType === 'neurotoxin' ? 'Units' : 'Volume (ml)'}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => quickAdjustUnits(quickEdit.zoneId!, productType === 'neurotoxin' ? -5 : -0.5)}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      value={
                        productType === 'neurotoxin'
                          ? injectionPoints.get(quickEdit.zoneId)?.units || 0
                          : injectionPoints.get(quickEdit.zoneId)?.volume || 0
                      }
                      onChange={(e) => setExactUnits(quickEdit.zoneId!, parseFloat(e.target.value) || 0)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center font-semibold"
                      step={productType === 'neurotoxin' ? 1 : 0.1}
                    />
                    <button
                      onClick={() => quickAdjustUnits(quickEdit.zoneId!, productType === 'neurotoxin' ? 5 : 0.5)}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Quick Select</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(productType === 'neurotoxin'
                      ? QUICK_UNIT_PRESETS[quickEdit.zoneId] || QUICK_UNIT_PRESETS.default
                      : QUICK_VOLUME_PRESETS[quickEdit.zoneId] || QUICK_VOLUME_PRESETS.default
                    ).map(preset => (
                      <button
                        key={preset}
                        onClick={() => setExactUnits(quickEdit.zoneId!, preset)}
                        className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          productType === 'neurotoxin'
                            ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                            : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                        }`}
                      >
                        {preset}{productType === 'neurotoxin' ? 'u' : 'ml'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeInjectionPoint(quickEdit.zoneId!)}
                  className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg transition-colors"
                >
                  Remove Zone
                </button>
              </div>
            </div>
          )}

          {/* Zone List */}
          <div className="p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Injected Zones</h4>
            {injectionPoints.size === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No zones selected yet</p>
            ) : (
              <div className="space-y-2">
                {Array.from(injectionPoints.entries()).map(([zoneId, point]) => {
                  const zoneName = getZoneName(zoneId)

                  return (
                    <div
                      key={zoneId}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedZone === zoneId
                          ? productType === 'neurotoxin'
                            ? 'bg-purple-50 border-purple-300'
                            : 'bg-pink-50 border-pink-300'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedZone(zoneId)
                        setQuickEdit({
                          isOpen: true,
                          zoneId,
                          position: { x: 0, y: 0 }
                        })
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{zoneName}</span>
                        <span className={`text-sm font-bold ${
                          productType === 'neurotoxin' ? 'text-purple-600' : 'text-pink-600'
                        }`}>
                          {point.units || point.volume}{productType === 'neurotoxin' ? 'u' : 'ml'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Button (Mobile Bottom Bar) */}
      {onSave && (
        <div className="lg:hidden border-t border-gray-200 p-4 bg-white">
          <button
            onClick={onSave}
            disabled={injectionPoints.size === 0}
            className={`w-full px-4 py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              productType === 'neurotoxin'
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-pink-600 hover:bg-pink-700'
            }`}
          >
            <Check className="w-5 h-5 inline-block mr-2" />
            Save Treatment
          </button>
        </div>
      )}
    </div>
  )
}
