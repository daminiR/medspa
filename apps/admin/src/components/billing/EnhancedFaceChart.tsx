'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Info } from 'lucide-react'

interface InjectionZone {
  id: string
  name: string
  muscle?: string
  type: 'neurotoxin' | 'filler' | 'both'
  coordinates: {
    x: number // percentage from left
    y: number // percentage from top
  }
  recommendedUnits?: {
    neurotoxin?: { min: number; max: number; typical: number }
    filler?: { min: number; max: number; typical: number }
  }
  side?: 'left' | 'right' | 'center'
  group: 'upper' | 'mid' | 'lower' | 'neck'
  description?: string
}

// Gender-specific coordinate adjustments
const COORDINATE_ADJUSTMENTS = {
  female: {
    xOffset: 0,
    yOffset: 0,
    scale: 1.0
  },
  male: {
    xOffset: 0,
    yOffset: -2, // Male face is positioned slightly higher
    scale: 1.05 // Male face is slightly larger
  }
}

// Injection zones with coordinates as percentages for responsive positioning
const INJECTION_ZONES: InjectionZone[] = [
  // UPPER FACE - NEUROTOXIN ZONES
  {
    id: 'frontalis',
    name: 'Forehead',
    muscle: 'Frontalis',
    type: 'neurotoxin',
    coordinates: { x: 50, y: 15 },
    recommendedUnits: {
      neurotoxin: { min: 10, max: 30, typical: 20 }
    },
    side: 'center',
    group: 'upper',
    description: 'Horizontal forehead lines'
  },
  {
    id: 'glabella',
    name: 'Glabella',
    muscle: 'Procerus',
    type: 'neurotoxin',
    coordinates: { x: 50, y: 22 },
    recommendedUnits: {
      neurotoxin: { min: 15, max: 30, typical: 20 }
    },
    side: 'center',
    group: 'upper',
    description: 'Frown lines between eyebrows'
  },
  {
    id: 'corrugator-left',
    name: 'L Corrugator',
    muscle: 'Corrugator Supercilii',
    type: 'neurotoxin',
    coordinates: { x: 43, y: 22 },
    recommendedUnits: {
      neurotoxin: { min: 6, max: 12, typical: 8 }
    },
    side: 'left',
    group: 'upper'
  },
  {
    id: 'corrugator-right',
    name: 'R Corrugator',
    muscle: 'Corrugator Supercilii',
    type: 'neurotoxin',
    coordinates: { x: 57, y: 22 },
    recommendedUnits: {
      neurotoxin: { min: 6, max: 12, typical: 8 }
    },
    side: 'right',
    group: 'upper'
  },
  {
    id: 'crow-feet-left',
    name: "L Crow's Feet",
    muscle: 'Orbicularis Oculi',
    type: 'neurotoxin',
    coordinates: { x: 30, y: 28 },
    recommendedUnits: {
      neurotoxin: { min: 6, max: 15, typical: 12 }
    },
    side: 'left',
    group: 'upper'
  },
  {
    id: 'crow-feet-right',
    name: "R Crow's Feet",
    muscle: 'Orbicularis Oculi',
    type: 'neurotoxin',
    coordinates: { x: 70, y: 28 },
    recommendedUnits: {
      neurotoxin: { min: 6, max: 15, typical: 12 }
    },
    side: 'right',
    group: 'upper'
  },
  {
    id: 'bunny-lines-left',
    name: 'L Bunny Lines',
    muscle: 'Nasalis',
    type: 'neurotoxin',
    coordinates: { x: 45, y: 33 },
    recommendedUnits: {
      neurotoxin: { min: 2, max: 6, typical: 4 }
    },
    side: 'left',
    group: 'upper'
  },
  {
    id: 'bunny-lines-right',
    name: 'R Bunny Lines',
    muscle: 'Nasalis',
    type: 'neurotoxin',
    coordinates: { x: 55, y: 33 },
    recommendedUnits: {
      neurotoxin: { min: 2, max: 6, typical: 4 }
    },
    side: 'right',
    group: 'upper'
  },

  // MID FACE - FILLER ZONES
  {
    id: 'temple-left',
    name: 'L Temple',
    type: 'filler',
    coordinates: { x: 28, y: 20 },
    recommendedUnits: {
      filler: { min: 0.5, max: 2, typical: 1 }
    },
    side: 'left',
    group: 'mid',
    description: 'Temple hollowing'
  },
  {
    id: 'temple-right',
    name: 'R Temple',
    type: 'filler',
    coordinates: { x: 72, y: 20 },
    recommendedUnits: {
      filler: { min: 0.5, max: 2, typical: 1 }
    },
    side: 'right',
    group: 'mid',
    description: 'Temple hollowing'
  },
  {
    id: 'tear-trough-left',
    name: 'L Tear Trough',
    type: 'filler',
    coordinates: { x: 41, y: 31 },
    recommendedUnits: {
      filler: { min: 0.3, max: 0.6, typical: 0.4 }
    },
    side: 'left',
    group: 'mid',
    description: 'Under eye hollows'
  },
  {
    id: 'tear-trough-right',
    name: 'R Tear Trough',
    type: 'filler',
    coordinates: { x: 59, y: 31 },
    recommendedUnits: {
      filler: { min: 0.3, max: 0.6, typical: 0.4 }
    },
    side: 'right',
    group: 'mid',
    description: 'Under eye hollows'
  },
  {
    id: 'cheek-left',
    name: 'L Cheek',
    type: 'filler',
    coordinates: { x: 35, y: 40 },
    recommendedUnits: {
      filler: { min: 0.5, max: 2, typical: 1.2 }
    },
    side: 'left',
    group: 'mid',
    description: 'Cheek augmentation'
  },
  {
    id: 'cheek-right',
    name: 'R Cheek',
    type: 'filler',
    coordinates: { x: 65, y: 40 },
    recommendedUnits: {
      filler: { min: 0.5, max: 2, typical: 1.2 }
    },
    side: 'right',
    group: 'mid',
    description: 'Cheek augmentation'
  },
  {
    id: 'nasolabial-left',
    name: 'L Nasolabial',
    type: 'filler',
    coordinates: { x: 42, y: 45 },
    recommendedUnits: {
      filler: { min: 0.3, max: 1, typical: 0.6 }
    },
    side: 'left',
    group: 'mid',
    description: 'Smile lines'
  },
  {
    id: 'nasolabial-right',
    name: 'R Nasolabial',
    type: 'filler',
    coordinates: { x: 58, y: 45 },
    recommendedUnits: {
      filler: { min: 0.3, max: 1, typical: 0.6 }
    },
    side: 'right',
    group: 'mid',
    description: 'Smile lines'
  },

  // LOWER FACE - MIXED ZONES
  {
    id: 'upper-lip',
    name: 'Upper Lip',
    type: 'both',
    coordinates: { x: 50, y: 49 },
    recommendedUnits: {
      neurotoxin: { min: 2, max: 8, typical: 4 },
      filler: { min: 0.3, max: 1, typical: 0.6 }
    },
    side: 'center',
    group: 'lower',
    description: 'Lip enhancement'
  },
  {
    id: 'lower-lip',
    name: 'Lower Lip',
    type: 'both',
    coordinates: { x: 50, y: 52 },
    recommendedUnits: {
      neurotoxin: { min: 2, max: 4, typical: 3 },
      filler: { min: 0.3, max: 1, typical: 0.6 }
    },
    side: 'center',
    group: 'lower',
    description: 'Lip enhancement'
  },
  {
    id: 'marionette-left',
    name: 'L Marionette',
    type: 'filler',
    coordinates: { x: 42, y: 54 },
    recommendedUnits: {
      filler: { min: 0.3, max: 1, typical: 0.6 }
    },
    side: 'left',
    group: 'lower',
    description: 'Oral commissures'
  },
  {
    id: 'marionette-right',
    name: 'R Marionette',
    type: 'filler',
    coordinates: { x: 58, y: 54 },
    recommendedUnits: {
      filler: { min: 0.3, max: 1, typical: 0.6 }
    },
    side: 'right',
    group: 'lower',
    description: 'Oral commissures'
  },
  {
    id: 'chin',
    name: 'Chin',
    muscle: 'Mentalis',
    type: 'both',
    coordinates: { x: 50, y: 58 },
    recommendedUnits: {
      neurotoxin: { min: 4, max: 10, typical: 6 },
      filler: { min: 0.5, max: 2, typical: 1 }
    },
    side: 'center',
    group: 'lower',
    description: 'Chin enhancement'
  },
  {
    id: 'jawline-left',
    name: 'L Jawline',
    type: 'filler',
    coordinates: { x: 33, y: 55 },
    recommendedUnits: {
      filler: { min: 0.5, max: 2, typical: 1.2 }
    },
    side: 'left',
    group: 'lower',
    description: 'Jawline definition'
  },
  {
    id: 'jawline-right',
    name: 'R Jawline',
    type: 'filler',
    coordinates: { x: 67, y: 55 },
    recommendedUnits: {
      filler: { min: 0.5, max: 2, typical: 1.2 }
    },
    side: 'right',
    group: 'lower',
    description: 'Jawline definition'
  },
  {
    id: 'masseter-left',
    name: 'L Masseter',
    muscle: 'Masseter',
    type: 'neurotoxin',
    coordinates: { x: 28, y: 48 },
    recommendedUnits: {
      neurotoxin: { min: 15, max: 35, typical: 25 }
    },
    side: 'left',
    group: 'lower',
    description: 'Jaw slimming/TMJ'
  },
  {
    id: 'masseter-right',
    name: 'R Masseter',
    muscle: 'Masseter',
    type: 'neurotoxin',
    coordinates: { x: 72, y: 48 },
    recommendedUnits: {
      neurotoxin: { min: 15, max: 35, typical: 25 }
    },
    side: 'right',
    group: 'lower',
    description: 'Jaw slimming/TMJ'
  },

  // NECK
  {
    id: 'platysma',
    name: 'Platysmal Bands',
    muscle: 'Platysma',
    type: 'neurotoxin',
    coordinates: { x: 50, y: 68 },
    recommendedUnits: {
      neurotoxin: { min: 20, max: 60, typical: 40 }
    },
    side: 'center',
    group: 'neck',
    description: 'Neck bands'
  }
]

interface EnhancedFaceChartProps {
  selectedZones: Map<string, number>
  onZoneClick: (zone: InjectionZone) => void
  productType: 'neurotoxin' | 'filler'
  gender: 'male' | 'female'
}

export function EnhancedFaceChart({
  selectedZones,
  onZoneClick,
  productType,
  gender
}: EnhancedFaceChartProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null)
  
  // Filter zones based on product type
  const relevantZones = INJECTION_ZONES.filter(
    zone => zone.type === productType || zone.type === 'both'
  )
  
  // Get zone details for hover
  const getHoveredZoneDetails = () => {
    if (!hoveredZone) return null
    return INJECTION_ZONES.find(z => z.id === hoveredZone)
  }

  const hoveredDetails = getHoveredZoneDetails()

  // Adjust coordinates based on gender
  const getAdjustedCoordinates = (zone: InjectionZone) => {
    const adjustment = COORDINATE_ADJUSTMENTS[gender]
    return {
      x: zone.coordinates.x * adjustment.scale + adjustment.xOffset,
      y: zone.coordinates.y * adjustment.scale + adjustment.yOffset
    }
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Face Image */}
      <div className="relative w-full" style={{ aspectRatio: gender === 'female' ? '546/888' : '585/847' }}>
        <Image
          src={`/images/face-chart-${gender}.png`}
          alt={`${gender} face chart`}
          fill
          className="object-contain opacity-50"
          priority
        />
        
        {/* Injection Points Overlay */}
        <div className="absolute inset-0">
          {relevantZones.map(zone => {
            const isSelected = selectedZones.has(zone.id)
            const units = selectedZones.get(zone.id) || 0
            const isHovered = hoveredZone === zone.id
            const coords = getAdjustedCoordinates(zone)
            
            return (
              <div
                key={zone.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`
                }}
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => onZoneClick(zone)}
              >
                {/* Clickable Area (invisible, larger) */}
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
                  {/* Glow effect for selected */}
                  {isSelected && (
                    <>
                      <div className={`absolute inset-0 rounded-full animate-ping ${
                        productType === 'neurotoxin' ? 'bg-purple-400' : 'bg-pink-400'
                      } opacity-30`} />
                      <div className={`absolute inset-0 rounded-full animate-pulse ${
                        productType === 'neurotoxin' ? 'bg-purple-500' : 'bg-pink-500'
                      } opacity-50`} />
                    </>
                  )}
                </div>
                
                {/* Units Badge (only for selected) */}
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
        
        {/* Hover Tooltip */}
        {hoveredDetails && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-3 shadow-lg">
            <div className="flex items-start gap-2">
              <div className={`w-3 h-3 rounded-full mt-1 ${
                productType === 'neurotoxin' ? 'bg-purple-500' : 'bg-pink-500'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{hoveredDetails.name}</span>
                  {hoveredDetails.muscle && (
                    <span className="text-xs text-gray-500 italic">({hoveredDetails.muscle})</span>
                  )}
                </div>
                {hoveredDetails.description && (
                  <p className="text-xs text-gray-600 mt-0.5">{hoveredDetails.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">
                    Recommended: {hoveredDetails.recommendedUnits?.[productType]?.min}-{hoveredDetails.recommendedUnits?.[productType]?.max} {productType === 'neurotoxin' ? 'units' : 'ml'}
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    Typical: {hoveredDetails.recommendedUnits?.[productType]?.typical} {productType === 'neurotoxin' ? 'units' : 'ml'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Instructions */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <Info className="w-3 h-3" />
        <span>Click on face to select injection points • Hover for details</span>
      </div>
    </div>
  )
}

export { INJECTION_ZONES }