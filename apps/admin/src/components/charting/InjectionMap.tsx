'use client'

import React, { useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import {
  Layers,
  Grid3x3,
  User,
  Users,
  Sparkles,
  Droplets,
  RotateCcw,
  Save,
  Box,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react'
import { InteractiveFaceChart, InjectionPoint as InjectionPoint2D, FreehandPoint } from './InteractiveFaceChart'
import { TotalsPanel } from './TotalsPanel'
import { useChartingSettings } from '@/contexts/ChartingSettingsContext'
import type { InjectionPoint3D } from './FaceChart3D'
import toast from 'react-hot-toast'

// =============================================================================
// DYNAMIC IMPORTS - 3D components loaded only when needed
// =============================================================================

const FaceChart3D = dynamic(() => import('./FaceChart3D'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-gray-900 rounded-xl">
      <div className="text-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
        <p>Loading 3D Face Model...</p>
      </div>
    </div>
  )
})

const BodyChart3D = dynamic(() => import('./BodyChart3D'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-gray-900 rounded-xl">
      <div className="text-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
        <p>Loading 3D Body Model...</p>
      </div>
    </div>
  )
})

// =============================================================================
// TYPES
// =============================================================================

type ViewMode = '2d' | '3d'
type BodyPart = 'face' | 'torso' | 'full-body'
type Gender = 'male' | 'female'

export interface InjectionMapProps {
  // Patient info
  patientId: string
  patientName: string
  patientGender?: Gender

  // Product selection
  productType: 'neurotoxin' | 'filler'
  selectedProductId?: string

  // State management
  injectionPoints2D: Map<string, InjectionPoint2D>
  onInjectionPoints2DChange: (points: Map<string, InjectionPoint2D>) => void

  freehandPoints?: Map<string, FreehandPoint>
  onFreehandPointsChange?: (points: Map<string, FreehandPoint>) => void

  injectionPoints3DFace: Map<string, InjectionPoint3D>
  onInjectionPoints3DFaceChange: (points: Map<string, InjectionPoint3D>) => void

  injectionPoints3DBody: Map<string, InjectionPoint3D>
  onInjectionPoints3DBodyChange: (points: Map<string, InjectionPoint3D>) => void

  // Previous treatment for smart defaults
  patientLastTreatment?: Map<string, InjectionPoint2D>

  // Callbacks
  onSave?: () => void
  onReset?: () => void

  // UI state
  readOnly?: boolean
  initialViewMode?: ViewMode
  initialBodyPart?: BodyPart
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function InjectionMap({
  patientId,
  patientName,
  patientGender = 'female',
  productType,
  selectedProductId,
  injectionPoints2D,
  onInjectionPoints2DChange,
  freehandPoints,
  onFreehandPointsChange,
  injectionPoints3DFace,
  onInjectionPoints3DFaceChange,
  injectionPoints3DBody,
  onInjectionPoints3DBodyChange,
  patientLastTreatment,
  onSave,
  onReset,
  readOnly = false,
  initialViewMode = '2d',
  initialBodyPart = 'face'
}: InjectionMapProps) {
  const { getZoneById, getProductById } = useChartingSettings()

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const [bodyPart, setBodyPart] = useState<BodyPart>(initialBodyPart)
  const [gender, setGender] = useState<Gender>(patientGender)

  // UI state
  const [totalsPanelExpanded, setTotalsPanelExpanded] = useState(true)
  const [showControls, setShowControls] = useState(true)

  // ==========================================================================
  // TOTALS CALCULATION
  // ==========================================================================

  const totals = useMemo(() => {
    let totalUnits = 0
    let totalVolume = 0
    let totalSites = 0
    let estimatedCost = 0

    const regionTotals: {
      'upper-face': { units: number; volume: number; sites: number }
      'periorbital': { units: number; volume: number; sites: number }
      'mid-face': { units: number; volume: number; sites: number }
      'lower-face': { units: number; volume: number; sites: number }
    } = {
      'upper-face': { units: 0, volume: 0, sites: 0 },
      'periorbital': { units: 0, volume: 0, sites: 0 },
      'mid-face': { units: 0, volume: 0, sites: 0 },
      'lower-face': { units: 0, volume: 0, sites: 0 }
    }

    // Calculate from 2D points (face only)
    if (viewMode === '2d' && bodyPart === 'face') {
      injectionPoints2D.forEach((point) => {
        const units = point.units || 0
        const volume = point.volume || 0
        totalUnits += units
        totalVolume += volume
        totalSites += 1

        // Get zone to determine region
        const zone = getZoneById(point.zoneId)
        if (zone?.subCategory) {
          const region = zone.subCategory as keyof typeof regionTotals
          if (regionTotals[region]) {
            regionTotals[region].units += units
            regionTotals[region].volume += volume
            regionTotals[region].sites += 1
          }
        }

        // Calculate cost if product is selected
        if (point.productId) {
          const product = getProductById(point.productId)
          if (product && units) {
            estimatedCost += product.unitPrice * units
          } else if (product && volume) {
            estimatedCost += product.unitPrice * volume
          }
        }
      })

      // Add freehand points
      if (freehandPoints) {
        freehandPoints.forEach((point) => {
          const units = point.units || 0
          const volume = point.volume || 0
          totalUnits += units
          totalVolume += volume
          totalSites += 1

          if (point.productId) {
            const product = getProductById(point.productId)
            if (product && units) {
              estimatedCost += product.unitPrice * units
            } else if (product && volume) {
              estimatedCost += product.unitPrice * volume
            }
          }
        })
      }
    }

    // Calculate from 3D points
    if (viewMode === '3d') {
      const points3D = bodyPart === 'face' ? injectionPoints3DFace : injectionPoints3DBody

      points3D.forEach((point) => {
        const units = point.units || 0
        const volume = point.volume || 0
        totalUnits += units
        totalVolume += volume
        totalSites += 1

        // For 3D, we don't have region breakdown, but we still calculate cost
        // Note: InjectionPoint3D doesn't have productId, so we skip cost calculation
        // In production, we'd need to add productId to InjectionPoint3D interface
      })
    }

    const freehandCount = freehandPoints?.size || 0

    return {
      totalUnits,
      totalVolume,
      totalSites,
      estimatedCost,
      regionTotals,
      freehandCount
    }
  }, [
    viewMode,
    bodyPart,
    injectionPoints2D,
    injectionPoints3DFace,
    injectionPoints3DBody,
    freehandPoints,
    getZoneById,
    getProductById
  ])

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleViewModeToggle = useCallback(() => {
    const newMode = viewMode === '2d' ? '3d' : '2d'
    setViewMode(newMode)
    toast.success(`Switched to ${newMode.toUpperCase()} mode`)
  }, [viewMode])

  const handleBodyPartChange = useCallback((part: BodyPart) => {
    setBodyPart(part)
    toast.success(`Switched to ${part === 'face' ? 'Face' : part === 'torso' ? 'Torso' : 'Full Body'} view`)
  }, [])

  const handleGenderToggle = useCallback(() => {
    const newGender = gender === 'male' ? 'female' : 'male'
    setGender(newGender)
  }, [gender])

  const handleResetAll = useCallback(() => {
    if (confirm('Are you sure you want to clear all injection points?')) {
      onInjectionPoints2DChange(new Map())
      onFreehandPointsChange?.(new Map())
      onInjectionPoints3DFaceChange(new Map())
      onInjectionPoints3DBodyChange(new Map())
      onReset?.()
      toast.success('All injection points cleared')
    }
  }, [
    onInjectionPoints2DChange,
    onFreehandPointsChange,
    onInjectionPoints3DFaceChange,
    onInjectionPoints3DBodyChange,
    onReset
  ])

  const handleSave = useCallback(() => {
    onSave?.()
    toast.success('Injection map saved')
  }, [onSave])

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  const renderChart = () => {
    // 3D Mode
    if (viewMode === '3d') {
      if (bodyPart === 'face') {
        return (
          <FaceChart3D
            productType={productType}
            injectionPoints={injectionPoints3DFace}
            onInjectionPointsChange={onInjectionPoints3DFaceChange}
            onSave={handleSave}
            readOnly={readOnly}
          />
        )
      } else {
        // Torso or Full Body
        return (
          <BodyChart3D
            productType={productType}
            injectionPoints={injectionPoints3DBody}
            onInjectionPointsChange={onInjectionPoints3DBodyChange}
            onSave={handleSave}
            readOnly={readOnly}
          />
        )
      }
    }

    // 2D Mode
    if (bodyPart === 'face') {
      return (
        <InteractiveFaceChart
          productType={productType}
          gender={gender}
          injectionPoints={injectionPoints2D}
          onInjectionPointsChange={onInjectionPoints2DChange}
          freehandPoints={freehandPoints}
          onFreehandPointsChange={onFreehandPointsChange}
          onSave={handleSave}
          selectedProductId={selectedProductId}
          patientLastTreatment={patientLastTreatment}
          readOnly={readOnly}
        />
      )
    }

    // 2D Torso/Body view (placeholder - to be implemented)
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-center text-gray-500">
          <Box className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">2D {bodyPart === 'torso' ? 'Torso' : 'Full Body'} View</p>
          <p className="text-sm mt-2">Coming soon</p>
          <button
            onClick={() => handleBodyPartChange('face')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Switch to Face View
          </button>
        </div>
      </div>
    )
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="relative">
      {/* Header - Minimal patient info and controls */}
      <div className="bg-white rounded-t-xl border border-gray-200 border-b-0 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Patient Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
              {patientName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{patientName}</h3>
              <p className="text-xs text-gray-500">
                {productType === 'neurotoxin' ? (
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-500" />
                    Neurotoxin Treatment
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-pink-500" />
                    Filler Treatment
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Toggle Controls Visibility */}
            <button
              onClick={() => setShowControls(!showControls)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              {showControls ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Control Bar - Collapsible */}
        {showControls && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              {/* Left: View Mode Controls */}
              <div className="flex items-center gap-2">
                {/* 2D/3D Toggle */}
                <div className="inline-flex rounded-lg border border-gray-300 p-0.5 bg-gray-50">
                  <button
                    onClick={() => setViewMode('2d')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                      viewMode === '2d'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                    2D
                  </button>
                  <button
                    onClick={() => setViewMode('3d')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                      viewMode === '3d'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    3D
                  </button>
                </div>

                {/* Body Part Selection */}
                <div className="inline-flex rounded-lg border border-gray-300 p-0.5 bg-gray-50">
                  <button
                    onClick={() => handleBodyPartChange('face')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      bodyPart === 'face'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Face
                  </button>
                  <button
                    onClick={() => handleBodyPartChange('torso')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                      bodyPart === 'torso'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Torso
                  </button>
                  <button
                    onClick={() => handleBodyPartChange('full-body')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                      bodyPart === 'full-body'
                        ? 'bg-white text-purple-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Full Body
                  </button>
                </div>

                {/* Gender Toggle (only for 2D face) */}
                {viewMode === '2d' && bodyPart === 'face' && (
                  <div className="inline-flex rounded-lg border border-gray-300 p-0.5 bg-gray-50">
                    <button
                      onClick={() => setGender('female')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        gender === 'female'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Female
                    </button>
                    <button
                      onClick={() => setGender('male')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        gender === 'male'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Male
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Action Buttons */}
              <div className="flex items-center gap-2">
                {!readOnly && totals.totalSites > 0 && (
                  <button
                    onClick={handleResetAll}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1.5 rounded-lg hover:bg-gray-100"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear All
                  </button>
                )}

                {!readOnly && onSave && (
                  <button
                    onClick={handleSave}
                    disabled={totals.totalSites === 0}
                    className={`px-3 py-1.5 text-sm flex items-center gap-1.5 rounded-lg ${
                      totals.totalSites === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    Save Map
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Content */}
      <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 p-6">
        {renderChart()}
      </div>

      {/* Totals Panel - Floating at bottom right */}
      {totals.totalSites > 0 && (
        <TotalsPanel
          productType={productType}
          totalUnits={totals.totalUnits}
          totalVolume={totals.totalVolume}
          totalSites={totals.totalSites}
          estimatedCost={totals.estimatedCost}
          regionTotals={totals.regionTotals}
          freehandCount={totals.freehandCount}
          isExpanded={totalsPanelExpanded}
          onToggleExpanded={() => setTotalsPanelExpanded(!totalsPanelExpanded)}
        />
      )}
    </div>
  )
}
