'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  useChartingSettings,
  TreatmentZone,
  TreatmentTemplate,
  InjectionDepthPreset,
  InjectionTechniquePreset,
  NeedleGaugeOption
} from '@/contexts/ChartingSettingsContext'
import Image from 'next/image'
import {
  Syringe,
  Target,
  Layers,
  Settings,
  Plus,
  Minus,
  Info,
  ChevronDown,
  ChevronRight,
  Save,
  RotateCcw,
  Sparkles,
  FileText,
  Zap,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'

// Injection point data structure
export interface InjectionPoint {
  zoneId: string
  units?: number
  volume?: number
  depthId: string
  techniqueId: string
  needleGaugeId: string
  notes?: string
}

interface EnhancedChartingViewProps {
  productType: 'neurotoxin' | 'filler'
  gender: 'male' | 'female'
  injectionPoints: Map<string, InjectionPoint>
  onInjectionPointsChange: (points: Map<string, InjectionPoint>) => void
  onApplyTemplate?: (template: TreatmentTemplate) => void
  selectedProductId?: string
}

export function EnhancedChartingView({
  productType,
  gender,
  injectionPoints,
  onInjectionPointsChange,
  onApplyTemplate,
  selectedProductId
}: EnhancedChartingViewProps) {
  const {
    settings,
    getActiveZones,
    getActiveDepths,
    getActiveTechniques,
    getActiveNeedleGauges,
    getActiveTemplates,
    getZoneById,
    getDepthById,
    getTechniqueById,
    getNeedleGaugeById
  } = useChartingSettings()

  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['upper-face', 'mid-face', 'lower-face']))

  // Get active items from settings
  const activeZones = useMemo(() => getActiveZones('face'), [getActiveZones])
  const activeDepths = useMemo(() => getActiveDepths(), [getActiveDepths])
  const activeTechniques = useMemo(() => getActiveTechniques(), [getActiveTechniques])
  const activeGauges = useMemo(() => getActiveNeedleGauges(), [getActiveNeedleGauges])
  const activeTemplates = useMemo(() => getActiveTemplates(productType), [getActiveTemplates, productType])

  // Group zones by subCategory
  const zonesByGroup = useMemo(() => {
    const groups: Record<string, TreatmentZone[]> = {}
    activeZones.forEach(zone => {
      const group = zone.subCategory || 'other'
      if (!groups[group]) groups[group] = []
      groups[group].push(zone)
    })
    return groups
  }, [activeZones])

  // Handle zone click
  const handleZoneClick = useCallback((zone: TreatmentZone) => {
    const existingPoint = injectionPoints.get(zone.id)

    if (existingPoint) {
      // Zone already selected - open detail view
      setSelectedZone(zone.id)
    } else {
      // Add new injection point with defaults
      const newPoint: InjectionPoint = {
        zoneId: zone.id,
        units: productType === 'neurotoxin' ? zone.defaultUnits : undefined,
        volume: productType === 'filler' ? zone.defaultVolume : undefined,
        depthId: zone.defaultDepth,
        techniqueId: zone.defaultTechnique,
        needleGaugeId: zone.defaultNeedleGauge
      }
      const newPoints = new Map(injectionPoints)
      newPoints.set(zone.id, newPoint)
      onInjectionPointsChange(newPoints)
      setSelectedZone(zone.id)
    }
  }, [injectionPoints, onInjectionPointsChange, productType])

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
    if (selectedZone === zoneId) setSelectedZone(null)
  }, [injectionPoints, onInjectionPointsChange, selectedZone])

  // Apply template
  const handleApplyTemplate = useCallback((template: TreatmentTemplate) => {
    const newPoints = new Map<string, InjectionPoint>()
    template.zones.forEach(tz => {
      newPoints.set(tz.zoneId, {
        zoneId: tz.zoneId,
        units: tz.units,
        volume: tz.volume,
        depthId: tz.depth,
        techniqueId: tz.technique,
        needleGaugeId: tz.needleGauge
      })
    })
    onInjectionPointsChange(newPoints)
    setShowTemplates(false)
    toast.success(`Applied "${template.name}" template`)
    onApplyTemplate?.(template)
  }, [onInjectionPointsChange, onApplyTemplate])

  // Calculate totals
  const totals = useMemo(() => {
    let totalUnits = 0
    let totalVolume = 0
    injectionPoints.forEach(point => {
      if (point.units) totalUnits += point.units
      if (point.volume) totalVolume += point.volume
    })
    return { units: totalUnits, volume: totalVolume }
  }, [injectionPoints])

  // Get zone style based on selection state
  const getZoneStyle = (zone: TreatmentZone) => {
    const isSelected = injectionPoints.has(zone.id)
    const isHovered = hoveredZone === zone.id
    const isActive = selectedZone === zone.id

    if (isActive) {
      return 'bg-purple-600 ring-4 ring-purple-300'
    }
    if (isSelected) {
      return 'bg-purple-500 hover:bg-purple-600'
    }
    if (isHovered) {
      return 'bg-purple-400'
    }
    return 'bg-gray-400 hover:bg-purple-300'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Face Chart */}
      <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Face Injection Map</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 flex items-center gap-1"
            >
              <Zap className="w-4 h-4" />
              Quick Templates
            </button>
            {injectionPoints.size > 0 && (
              <button
                onClick={() => {
                  onInjectionPointsChange(new Map())
                  setSelectedZone(null)
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Quick Templates Dropdown */}
        {showTemplates && activeTemplates.length > 0 && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm font-medium text-purple-800 mb-2">Apply a treatment template:</p>
            <div className="grid grid-cols-2 gap-2">
              {activeTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleApplyTemplate(template)}
                  className="text-left p-2 bg-white rounded-lg border border-purple-200 hover:border-purple-400 transition-colors"
                >
                  <p className="font-medium text-sm text-gray-900">{template.name}</p>
                  <p className="text-xs text-gray-500">{template.zones.length} zones • {template.estimatedTime}min</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Face Diagram */}
        <div className="relative w-full max-w-md mx-auto" style={{ aspectRatio: '546/888' }}>
          <Image
            src={gender === 'female' ? '/images/face-chart-female.png' : '/images/face-chart-male.png'}
            alt={`${gender} face chart`}
            fill
            className="object-contain opacity-50"
          />

          {/* Injection Points Overlay */}
          <div className="absolute inset-0">
            {activeZones.filter(z => z.coordinates).map(zone => {
              const point = injectionPoints.get(zone.id)
              return (
                <div
                  key={zone.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                  style={{
                    left: `${zone.coordinates!.x}%`,
                    top: `${zone.coordinates!.y}%`
                  }}
                  onClick={() => handleZoneClick(zone)}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                >
                  <div className={`
                    relative w-5 h-5 rounded-full transition-all duration-200
                    ${getZoneStyle(zone)}
                    flex items-center justify-center text-white text-xs font-bold
                  `}>
                    {point && (point.units || point.volume) ? (
                      <span>{point.units || point.volume}</span>
                    ) : null}
                  </div>

                  {/* Tooltip */}
                  {(hoveredZone === zone.id || selectedZone === zone.id) && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
                      <p className="font-medium">{zone.name}</p>
                      {settings.showAnatomicalNames && zone.anatomicalName && (
                        <p className="text-gray-400 italic">{zone.anatomicalName}</p>
                      )}
                      {point ? (
                        <p className="mt-1">
                          {point.units ? `${point.units} units` : `${point.volume}ml`}
                        </p>
                      ) : (
                        <p className="mt-1 text-gray-400">Click to add</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-purple-600 ring-2 ring-purple-300" />
            <span>Editing</span>
          </div>
        </div>

        {/* Totals Summary */}
        {injectionPoints.size > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total Points</p>
                  <p className="text-lg font-semibold text-gray-900">{injectionPoints.size}</p>
                </div>
                {productType === 'neurotoxin' && totals.units > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">Total Units</p>
                    <p className="text-lg font-semibold text-purple-600">{totals.units}u</p>
                  </div>
                )}
                {productType === 'filler' && totals.volume > 0 && (
                  <div>
                    <p className="text-xs text-gray-500">Total Volume</p>
                    <p className="text-lg font-semibold text-pink-600">{totals.volume.toFixed(1)}ml</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zone List & Detail Panel */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 max-h-[700px] overflow-y-auto">
        <h3 className="font-semibold text-gray-900 mb-4">Injection Points</h3>

        {selectedZone && injectionPoints.has(selectedZone) ? (
          // Detail View for selected zone
          <SelectedZoneDetail
            zoneId={selectedZone}
            point={injectionPoints.get(selectedZone)!}
            zone={getZoneById(selectedZone)!}
            depths={activeDepths}
            techniques={activeTechniques}
            gauges={activeGauges}
            productType={productType}
            showAnatomicalNames={settings.showAnatomicalNames}
            onUpdate={(updates) => updateInjectionPoint(selectedZone, updates)}
            onRemove={() => removeInjectionPoint(selectedZone)}
            onClose={() => setSelectedZone(null)}
            getDepthById={getDepthById}
            getTechniqueById={getTechniqueById}
            getNeedleGaugeById={getNeedleGaugeById}
          />
        ) : (
          // Zone List View
          <div className="space-y-4">
            {Object.entries(zonesByGroup).map(([group, zones]) => (
              <div key={group}>
                <button
                  onClick={() => {
                    const newExpanded = new Set(expandedGroups)
                    if (newExpanded.has(group)) {
                      newExpanded.delete(group)
                    } else {
                      newExpanded.add(group)
                    }
                    setExpandedGroups(newExpanded)
                  }}
                  className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-2"
                >
                  <span className="capitalize">{group.replace('-', ' ')}</span>
                  {expandedGroups.has(group) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>

                {expandedGroups.has(group) && (
                  <div className="space-y-1 ml-2">
                    {zones.map(zone => {
                      const point = injectionPoints.get(zone.id)
                      return (
                        <button
                          key={zone.id}
                          onClick={() => handleZoneClick(zone)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                            point
                              ? 'bg-purple-50 border border-purple-200'
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {point ? (
                              <Check className="w-4 h-4 text-purple-600" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{zone.name}</p>
                              {settings.showAnatomicalNames && zone.anatomicalName && (
                                <p className="text-xs text-gray-500">{zone.anatomicalName}</p>
                              )}
                            </div>
                          </div>
                          {point && (
                            <span className="text-sm font-medium text-purple-600">
                              {point.units ? `${point.units}u` : `${point.volume}ml`}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Selected Zone Detail Component
function SelectedZoneDetail({
  zoneId,
  point,
  zone,
  depths,
  techniques,
  gauges,
  productType,
  showAnatomicalNames,
  onUpdate,
  onRemove,
  onClose,
  getDepthById,
  getTechniqueById,
  getNeedleGaugeById
}: {
  zoneId: string
  point: InjectionPoint
  zone: TreatmentZone
  depths: InjectionDepthPreset[]
  techniques: InjectionTechniquePreset[]
  gauges: NeedleGaugeOption[]
  productType: 'neurotoxin' | 'filler'
  showAnatomicalNames: boolean
  onUpdate: (updates: Partial<InjectionPoint>) => void
  onRemove: () => void
  onClose: () => void
  getDepthById: (id: string) => InjectionDepthPreset | undefined
  getTechniqueById: (id: string) => InjectionTechniquePreset | undefined
  getNeedleGaugeById: (id: string) => NeedleGaugeOption | undefined
}) {
  const selectedDepth = getDepthById(point.depthId)
  const selectedTechnique = getTechniqueById(point.techniqueId)
  const selectedGauge = getNeedleGaugeById(point.needleGaugeId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to list
        </button>
        <button
          onClick={onRemove}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Remove
        </button>
      </div>

      <div className="p-3 bg-purple-50 rounded-lg">
        <h4 className="font-medium text-gray-900">{zone.name}</h4>
        {showAnatomicalNames && zone.anatomicalName && (
          <p className="text-sm text-gray-500 italic">{zone.anatomicalName}</p>
        )}
      </div>

      {/* Units/Volume */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          {productType === 'neurotoxin' ? 'Units' : 'Volume (ml)'}
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (productType === 'neurotoxin') {
                onUpdate({ units: Math.max(0, (point.units || 0) - 1) })
              } else {
                onUpdate({ volume: Math.max(0, (point.volume || 0) - 0.1) })
              }
            }}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            value={productType === 'neurotoxin' ? point.units || 0 : point.volume || 0}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0
              if (productType === 'neurotoxin') {
                onUpdate({ units: val })
              } else {
                onUpdate({ volume: val })
              }
            }}
            step={productType === 'neurotoxin' ? 1 : 0.1}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={() => {
              if (productType === 'neurotoxin') {
                onUpdate({ units: (point.units || 0) + 1 })
              } else {
                onUpdate({ volume: (point.volume || 0) + 0.1 })
              }
            }}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Injection Depth */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
          <Layers className="w-4 h-4" />
          Injection Depth
        </label>
        <select
          value={point.depthId}
          onChange={(e) => onUpdate({ depthId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          {depths.map(depth => (
            <option key={depth.id} value={depth.id}>
              {depth.name} ({depth.depthMm})
            </option>
          ))}
        </select>
        {selectedDepth && (
          <p className="mt-1 text-xs text-gray-500">{selectedDepth.description}</p>
        )}
      </div>

      {/* Technique */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
          <Target className="w-4 h-4" />
          Technique
        </label>
        <select
          value={point.techniqueId}
          onChange={(e) => onUpdate({ techniqueId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          {techniques.map(tech => (
            <option key={tech.id} value={tech.id}>
              {tech.name}
            </option>
          ))}
        </select>
        {selectedTechnique && (
          <p className="mt-1 text-xs text-gray-500">{selectedTechnique.description}</p>
        )}
      </div>

      {/* Needle Gauge */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
          <Syringe className="w-4 h-4" />
          Needle Gauge
        </label>
        <select
          value={point.needleGaugeId}
          onChange={(e) => onUpdate({ needleGaugeId: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          {gauges.map(gauge => (
            <option key={gauge.id} value={gauge.id}>
              {gauge.gauge} ({gauge.diameter})
            </option>
          ))}
        </select>
        {selectedGauge && selectedGauge.recommendedFor.length > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            Recommended for: {selectedGauge.recommendedFor.join(', ')}
          </p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
          <FileText className="w-4 h-4" />
          Notes
        </label>
        <textarea
          value={point.notes || ''}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="Add notes for this injection point..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
        />
      </div>
    </div>
  )
}
