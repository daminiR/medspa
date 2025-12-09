'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { 
  Info, 
  MapPin, 
  MousePointer, 
  Grid3x3, 
  Save,
  X,
  Plus,
  Minus,
  Target,
  Edit3
} from 'lucide-react'
import { INJECTION_ZONES } from './EnhancedFaceChart'

interface CustomPoint {
  id: string
  x: number // percentage
  y: number // percentage
  units: number
  label?: string
}

interface DocumentationFaceChartProps {
  selectedZones: Map<string, number>
  customPoints: CustomPoint[]
  onZoneClick: (zone: any) => void
  onCustomPointAdd: (point: CustomPoint) => void
  onCustomPointUpdate: (id: string, units: number) => void
  onCustomPointRemove: (id: string) => void
  productType: 'neurotoxin' | 'filler'
  gender: 'male' | 'female'
}

export function DocumentationFaceChart({
  selectedZones,
  customPoints,
  onZoneClick,
  onCustomPointAdd,
  onCustomPointUpdate,
  onCustomPointRemove,
  productType,
  gender
}: DocumentationFaceChartProps) {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset')
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  const [hoveredCustom, setHoveredCustom] = useState<string | null>(null)
  const [editingPoint, setEditingPoint] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [newPointPosition, setNewPointPosition] = useState<{x: number, y: number} | null>(null)
  const [newPointLabel, setNewPointLabel] = useState('')
  const imageRef = useRef<HTMLDivElement>(null)

  // Filter zones based on product type
  const relevantZones = INJECTION_ZONES.filter(
    zone => zone.type === productType || zone.type === 'both'
  )

  // Handle click on face for custom points
  const handleFaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== 'custom') return
    if (newPointPosition) return // Already creating a point
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    // Show the input form at this position
    setNewPointPosition({ x, y })
    setNewPointLabel('')
  }
  
  const createNewPoint = () => {
    if (!newPointPosition) return
    
    const newPoint: CustomPoint = {
      id: `custom-${Date.now()}`,
      x: newPointPosition.x,
      y: newPointPosition.y,
      units: productType === 'neurotoxin' ? 2 : 0.1,
      label: newPointLabel || undefined
    }
    
    onCustomPointAdd(newPoint)
    setNewPointPosition(null)
    setNewPointLabel('')
  }
  
  const cancelNewPoint = () => {
    setNewPointPosition(null)
    setNewPointLabel('')
  }

  const handleCustomPointEdit = (pointId: string, currentUnits: number) => {
    setEditingPoint(pointId)
    setEditValue(currentUnits.toString())
  }

  const saveCustomPointEdit = () => {
    if (editingPoint && editValue) {
      onCustomPointUpdate(editingPoint, parseFloat(editValue))
      setEditingPoint(null)
      setEditValue('')
    }
  }

  // Get total units including custom points
  const getTotalUnits = () => {
    let total = 0
    selectedZones.forEach(units => total += units)
    customPoints.forEach(point => total += point.units)
    return total
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Mode Toggle */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setMode('preset')}
            className={`px-4 py-2 text-sm rounded-md transition-all ${
              mode === 'preset'
                ? 'bg-white text-purple-600 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Grid3x3 className="w-4 h-4 inline mr-2" />
            Preset Zones
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`px-4 py-2 text-sm rounded-md transition-all ${
              mode === 'custom'
                ? 'bg-white text-pink-600 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Edit3 className="w-4 h-4 inline mr-2" />
            Custom Marking
          </button>
        </div>
        
        {/* Stats */}
        <div className="text-sm text-gray-600">
          Total: <span className="font-bold text-gray-900">
            {getTotalUnits().toFixed(productType === 'filler' ? 1 : 0)}
            {productType === 'neurotoxin' ? 'u' : 'ml'}
          </span>
        </div>
      </div>

      {/* Face Image */}
      <div 
        ref={imageRef}
        className="relative w-full cursor-crosshair" 
        style={{ aspectRatio: gender === 'female' ? '546/888' : '585/847' }}
        onClick={handleFaceClick}
      >
        <Image
          src={`/images/face-chart-${gender}.png`}
          alt={`${gender} face chart`}
          fill
          className="object-contain opacity-50 select-none"
          priority
        />
        
        {/* Preset Injection Points */}
        {mode === 'preset' && (
          <div className="absolute inset-0 pointer-events-none">
            {relevantZones.map(zone => {
              const isSelected = selectedZones.has(zone.id)
              const units = selectedZones.get(zone.id) || 0
              const isHovered = hoveredZone === zone.id
              
              return (
                <div
                  key={zone.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                  style={{
                    left: `${zone.coordinates.x}%`,
                    top: `${zone.coordinates.y}%`
                  }}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={(e) => {
                    e.stopPropagation()
                    onZoneClick(zone)
                  }}
                >
                  {/* Clickable Area */}
                  <div className="absolute w-10 h-10 -left-5 -top-5 cursor-pointer" />
                  
                  {/* Visual Point */}
                  <div
                    className={`
                      relative w-4 h-4 rounded-full cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? productType === 'neurotoxin' 
                          ? 'bg-purple-600 shadow-lg shadow-purple-300 scale-150' 
                          : 'bg-pink-600 shadow-lg shadow-pink-300 scale-150'
                        : isHovered
                          ? 'bg-gray-400 scale-125'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }
                    `}
                  >
                    {isSelected && (
                      <>
                        <div className={`absolute inset-0 rounded-full animate-ping ${
                          productType === 'neurotoxin' ? 'bg-purple-400' : 'bg-pink-400'
                        } opacity-30`} />
                      </>
                    )}
                  </div>
                  
                  {/* Units Badge */}
                  {isSelected && (
                    <div className={`
                      absolute -top-7 left-1/2 transform -translate-x-1/2
                      px-2.5 py-1 rounded-full text-xs font-bold text-white
                      ${productType === 'neurotoxin' 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700' 
                        : 'bg-gradient-to-r from-pink-600 to-pink-700'
                      }
                      shadow-lg whitespace-nowrap
                    `}>
                      {units}{productType === 'neurotoxin' ? 'u' : 'ml'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
        
        {/* Custom Points */}
        <div className="absolute inset-0 pointer-events-none">
          {customPoints.map(point => {
            const isHovered = hoveredCustom === point.id
            const isEditing = editingPoint === point.id
            
            return (
              <div
                key={point.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`
                }}
                onMouseEnter={() => setHoveredCustom(point.id)}
                onMouseLeave={() => setHoveredCustom(null)}
              >
                {/* Custom Point Visual */}
                <div
                  className={`
                    relative w-4 h-4 rounded-full transition-all duration-200 cursor-pointer
                    ${mode === 'custom' 
                      ? 'scale-125' 
                      : 'scale-100'
                    }
                    ${productType === 'neurotoxin'
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                      : 'bg-gradient-to-br from-pink-500 to-pink-600'
                    }
                    shadow-lg
                  `}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!isEditing) {
                      handleCustomPointEdit(point.id, point.units)
                    }
                  }}
                >
                  {/* Pulse effect */}
                  <div className={`
                    absolute inset-0 rounded-full animate-pulse
                    ${productType === 'neurotoxin'
                      ? 'bg-purple-400'
                      : 'bg-pink-400'
                    }
                    opacity-30
                  `} />
                </div>
                
                {/* Edit Input or Units Badge */}
                {isEditing ? (
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-50">
                    <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg p-1">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveCustomPointEdit()
                          if (e.key === 'Escape') setEditingPoint(null)
                        }}
                        step={productType === 'filler' ? '0.1' : '1'}
                        className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                        autoFocus
                      />
                      <button
                        onClick={saveCustomPointEdit}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Save className="w-3 h-3 text-green-600" />
                      </button>
                      <button
                        onClick={() => {
                          onCustomPointRemove(point.id)
                          setEditingPoint(null)
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="absolute -top-7 left-1/2 transform -translate-x-1/2">
                    {point.label && (
                      <div className="text-xs font-medium text-gray-700 mb-1 text-center whitespace-nowrap">
                        {point.label}
                      </div>
                    )}
                    <div className={`
                      px-2 py-0.5 rounded-full text-xs font-bold text-white
                      ${productType === 'neurotoxin' 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700' 
                        : 'bg-gradient-to-r from-pink-600 to-pink-700'
                      }
                      shadow-lg whitespace-nowrap text-center
                    `}>
                      {point.units}{productType === 'neurotoxin' ? 'u' : 'ml'}
                    </div>
                  </div>
                )}
                
                {/* Hover Actions */}
                {isHovered && !isEditing && mode === 'custom' && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onCustomPointUpdate(point.id, point.units + (productType === 'neurotoxin' ? 1 : 0.1))
                      }}
                      className="p-1 bg-white rounded shadow-md hover:bg-gray-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const newVal = point.units - (productType === 'neurotoxin' ? 1 : 0.1)
                        if (newVal > 0) {
                          onCustomPointUpdate(point.id, newVal)
                        }
                      }}
                      className="p-1 bg-white rounded shadow-md hover:bg-gray-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onCustomPointRemove(point.id)
                      }}
                      className="p-1 bg-white rounded shadow-md hover:bg-red-50"
                    >
                      <X className="w-3 h-3 text-red-600" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* New Point Creation Form */}
        {newPointPosition && (
          <div
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-50"
            style={{
              left: `${newPointPosition.x}%`,
              top: `${newPointPosition.y}%`
            }}
          >
            <div className="bg-white rounded-lg shadow-xl p-4 min-w-[250px]">
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={newPointLabel}
                  onChange={(e) => setNewPointLabel(e.target.value)}
                  placeholder="e.g., Glabella, Custom area..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') createNewPoint()
                    if (e.key === 'Escape') cancelNewPoint()
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={createNewPoint}
                  className="flex-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-md hover:from-purple-700 hover:to-pink-700"
                >
                  Add Point
                </button>
                <button
                  onClick={cancelNewPoint}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
            {/* Visual indicator for where the point will be placed */}
            <div className={`
              absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
              w-4 h-4 rounded-full
              ${productType === 'neurotoxin' 
                ? 'bg-purple-600' 
                : 'bg-pink-600'
              }
              animate-pulse shadow-lg pointer-events-none
            `} />
          </div>
        )}
        
        {/* Mode Instructions */}
        {mode === 'custom' && !newPointPosition && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-pink-600" />
              <p className="text-xs text-gray-700">
                Click anywhere on the face to add custom injection points
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${
              productType === 'neurotoxin' ? 'bg-purple-600' : 'bg-pink-600'
            }`} />
            <span>{mode === 'preset' ? 'Anatomical zones' : 'Injection points'}</span>
          </div>
        </div>
        {customPoints.length > 0 && (
          <span className="text-gray-600">
            {customPoints.length} custom point{customPoints.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  )
}