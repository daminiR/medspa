'use client'

import React from 'react'

interface InjectionZone {
  id: string
  name: string
  muscle?: string
  type: 'neurotoxin' | 'filler' | 'both'
  path: string
  centerX: number
  centerY: number
  recommendedUnits?: {
    neurotoxin?: { min: number; max: number; typical: number }
    filler?: { min: number; max: number; typical: number }
  }
  side?: 'left' | 'right' | 'center'
  group: 'upper' | 'mid' | 'lower' | 'neck'
  description?: string
}

const INJECTION_ZONES: InjectionZone[] = [
  // UPPER FACE - NEUROTOXIN ZONES
  {
    id: 'frontalis',
    name: 'Forehead',
    muscle: 'Frontalis',
    type: 'neurotoxin',
    path: 'M 250 80 Q 300 70, 350 80 Q 350 120, 300 130 Q 250 120, 250 80',
    centerX: 300,
    centerY: 100,
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
    path: 'M 280 130 Q 300 120, 320 130 L 320 150 Q 300 160, 280 150 Z',
    centerX: 300,
    centerY: 140,
    recommendedUnits: {
      neurotoxin: { min: 15, max: 30, typical: 20 }
    },
    side: 'center',
    group: 'upper',
    description: 'Frown lines between eyebrows'
  },
  {
    id: 'corrugator-left',
    name: 'Left Corrugator',
    muscle: 'Corrugator Supercilii',
    type: 'neurotoxin',
    path: 'M 260 140 Q 270 135, 280 140 L 280 150 Q 270 155, 260 150 Z',
    centerX: 270,
    centerY: 145,
    recommendedUnits: {
      neurotoxin: { min: 6, max: 12, typical: 8 }
    },
    side: 'left',
    group: 'upper'
  },
  {
    id: 'corrugator-right',
    name: 'Right Corrugator',
    muscle: 'Corrugator Supercilii',
    type: 'neurotoxin',
    path: 'M 320 140 Q 330 135, 340 140 L 340 150 Q 330 155, 320 150 Z',
    centerX: 330,
    centerY: 145,
    recommendedUnits: {
      neurotoxin: { min: 6, max: 12, typical: 8 }
    },
    side: 'right',
    group: 'upper'
  },
  {
    id: 'crow-feet-left',
    name: 'Left Crow\'s Feet',
    muscle: 'Orbicularis Oculi',
    type: 'neurotoxin',
    path: 'M 200 160 Q 210 155, 220 160 L 215 180 Q 205 180, 200 175 Z',
    centerX: 210,
    centerY: 170,
    recommendedUnits: {
      neurotoxin: { min: 6, max: 15, typical: 12 }
    },
    side: 'left',
    group: 'upper',
    description: 'Lateral canthal lines'
  },
  {
    id: 'crow-feet-right',
    name: 'Right Crow\'s Feet',
    muscle: 'Orbicularis Oculi',
    type: 'neurotoxin',
    path: 'M 380 160 Q 390 155, 400 160 L 395 180 Q 385 180, 380 175 Z',
    centerX: 390,
    centerY: 170,
    recommendedUnits: {
      neurotoxin: { min: 6, max: 15, typical: 12 }
    },
    side: 'right',
    group: 'upper',
    description: 'Lateral canthal lines'
  },
  {
    id: 'bunny-lines-left',
    name: 'Left Bunny Lines',
    muscle: 'Nasalis',
    type: 'neurotoxin',
    path: 'M 270 180 L 280 175 L 280 185 Z',
    centerX: 275,
    centerY: 180,
    recommendedUnits: {
      neurotoxin: { min: 2, max: 6, typical: 4 }
    },
    side: 'left',
    group: 'upper'
  },
  {
    id: 'bunny-lines-right',
    name: 'Right Bunny Lines',
    muscle: 'Nasalis',
    type: 'neurotoxin',
    path: 'M 330 180 L 320 175 L 320 185 Z',
    centerX: 325,
    centerY: 180,
    recommendedUnits: {
      neurotoxin: { min: 2, max: 6, typical: 4 }
    },
    side: 'right',
    group: 'upper'
  },

  // MID FACE - FILLER ZONES
  {
    id: 'temple-left',
    name: 'Left Temple',
    type: 'filler',
    path: 'M 180 120 Q 200 110, 210 130 Q 200 140, 180 135 Z',
    centerX: 195,
    centerY: 125,
    recommendedUnits: {
      filler: { min: 0.5, max: 2, typical: 1 }
    },
    side: 'left',
    group: 'mid',
    description: 'Temple hollowing'
  },
  {
    id: 'temple-right',
    name: 'Right Temple',
    type: 'filler',
    path: 'M 420 120 Q 400 110, 390 130 Q 400 140, 420 135 Z',
    centerX: 405,
    centerY: 125,
    recommendedUnits: {
      filler: { min: 0.5, max: 2, typical: 1 }
    },
    side: 'right',
    group: 'mid',
    description: 'Temple hollowing'
  },
  {
    id: 'tear-trough-left',
    name: 'Left Tear Trough',
    type: 'filler',
    path: 'M 240 175 Q 250 180, 260 175 L 255 185 Q 245 185, 240 180 Z',
    centerX: 250,
    centerY: 180,
    recommendedUnits: {
      filler: { min: 0.3, max: 0.6, typical: 0.4 }
    },
    side: 'left',
    group: 'mid',
    description: 'Under eye hollows'
  },
  {
    id: 'tear-trough-right',
    name: 'Right Tear Trough',
    type: 'filler',
    path: 'M 360 175 Q 350 180, 340 175 L 345 185 Q 355 185, 360 180 Z',
    centerX: 350,
    centerY: 180,
    recommendedUnits: {
      filler: { min: 0.3, max: 0.6, typical: 0.4 }
    },
    side: 'right',
    group: 'mid',
    description: 'Under eye hollows'
  },
  {
    id: 'cheek-left',
    name: 'Left Cheek',
    type: 'filler',
    path: 'M 210 200 Q 240 195, 250 210 Q 240 230, 210 225 Q 195 210, 210 200 Z',
    centerX: 225,
    centerY: 210,
    recommendedUnits: {
      filler: { min: 0.5, max: 2, typical: 1.2 }
    },
    side: 'left',
    group: 'mid',
    description: 'Cheek augmentation'
  },
  {
    id: 'cheek-right',
    name: 'Right Cheek',
    type: 'filler',
    path: 'M 390 200 Q 360 195, 350 210 Q 360 230, 390 225 Q 405 210, 390 200 Z',
    centerX: 375,
    centerY: 210,
    recommendedUnits: {
      filler: { min: 0.5, max: 2, typical: 1.2 }
    },
    side: 'right',
    group: 'mid',
    description: 'Cheek augmentation'
  },
  {
    id: 'nasolabial-left',
    name: 'Left Nasolabial Fold',
    type: 'filler',
    path: 'M 260 220 Q 265 230, 260 240 L 255 240 Q 250 230, 255 220 Z',
    centerX: 257,
    centerY: 230,
    recommendedUnits: {
      filler: { min: 0.3, max: 1, typical: 0.6 }
    },
    side: 'left',
    group: 'mid',
    description: 'Smile lines'
  },
  {
    id: 'nasolabial-right',
    name: 'Right Nasolabial Fold',
    type: 'filler',
    path: 'M 340 220 Q 335 230, 340 240 L 345 240 Q 350 230, 345 220 Z',
    centerX: 343,
    centerY: 230,
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
    path: 'M 280 250 Q 300 245, 320 250 L 315 255 Q 300 258, 285 255 Z',
    centerX: 300,
    centerY: 252,
    recommendedUnits: {
      neurotoxin: { min: 2, max: 8, typical: 4 },
      filler: { min: 0.3, max: 1, typical: 0.6 }
    },
    side: 'center',
    group: 'lower',
    description: 'Lip flip or enhancement'
  },
  {
    id: 'lower-lip',
    name: 'Lower Lip',
    type: 'both',
    path: 'M 285 260 Q 300 265, 315 260 L 310 268 Q 300 270, 290 268 Z',
    centerX: 300,
    centerY: 264,
    recommendedUnits: {
      neurotoxin: { min: 2, max: 4, typical: 3 },
      filler: { min: 0.3, max: 1, typical: 0.6 }
    },
    side: 'center',
    group: 'lower',
    description: 'Lip enhancement'
  },
  {
    id: 'perioral-lines',
    name: 'Perioral Lines',
    type: 'both',
    path: 'M 270 245 L 275 240 L 280 245 M 320 245 L 325 240 L 330 245',
    centerX: 300,
    centerY: 242,
    recommendedUnits: {
      neurotoxin: { min: 2, max: 6, typical: 4 },
      filler: { min: 0.2, max: 0.4, typical: 0.3 }
    },
    side: 'center',
    group: 'lower',
    description: 'Smoker\'s lines'
  },
  {
    id: 'marionette-left',
    name: 'Left Marionette',
    type: 'filler',
    path: 'M 260 270 Q 255 280, 250 290 L 245 285 Q 250 275, 255 270 Z',
    centerX: 252,
    centerY: 280,
    recommendedUnits: {
      filler: { min: 0.3, max: 1, typical: 0.6 }
    },
    side: 'left',
    group: 'lower',
    description: 'Oral commissures'
  },
  {
    id: 'marionette-right',
    name: 'Right Marionette',
    type: 'filler',
    path: 'M 340 270 Q 345 280, 350 290 L 355 285 Q 350 275, 345 270 Z',
    centerX: 348,
    centerY: 280,
    recommendedUnits: {
      filler: { min: 0.3, max: 1, typical: 0.6 }
    },
    side: 'right',
    group: 'lower',
    description: 'Oral commissures'
  },
  {
    id: 'dao-left',
    name: 'Left DAO',
    muscle: 'Depressor Anguli Oris',
    type: 'neurotoxin',
    path: 'M 245 275 L 250 270 L 255 275 Z',
    centerX: 250,
    centerY: 273,
    recommendedUnits: {
      neurotoxin: { min: 2, max: 6, typical: 4 }
    },
    side: 'left',
    group: 'lower'
  },
  {
    id: 'dao-right',
    name: 'Right DAO',
    muscle: 'Depressor Anguli Oris',
    type: 'neurotoxin',
    path: 'M 345 275 L 350 270 L 355 275 Z',
    centerX: 350,
    centerY: 273,
    recommendedUnits: {
      neurotoxin: { min: 2, max: 6, typical: 4 }
    },
    side: 'right',
    group: 'lower'
  },
  {
    id: 'chin',
    name: 'Chin',
    muscle: 'Mentalis',
    type: 'both',
    path: 'M 280 295 Q 300 290, 320 295 Q 320 310, 300 315 Q 280 310, 280 295 Z',
    centerX: 300,
    centerY: 302,
    recommendedUnits: {
      neurotoxin: { min: 4, max: 10, typical: 6 },
      filler: { min: 0.5, max: 2, typical: 1 }
    },
    side: 'center',
    group: 'lower',
    description: 'Chin enhancement/dimpling'
  },
  {
    id: 'prejowl-left',
    name: 'Left Pre-jowl',
    type: 'filler',
    path: 'M 210 290 Q 220 295, 230 290 L 225 305 Q 215 305, 210 300 Z',
    centerX: 220,
    centerY: 297,
    recommendedUnits: {
      filler: { min: 0.3, max: 1, typical: 0.6 }
    },
    side: 'left',
    group: 'lower'
  },
  {
    id: 'prejowl-right',
    name: 'Right Pre-jowl',
    type: 'filler',
    path: 'M 390 290 Q 380 295, 370 290 L 375 305 Q 385 305, 390 300 Z',
    centerX: 380,
    centerY: 297,
    recommendedUnits: {
      filler: { min: 0.3, max: 1, typical: 0.6 }
    },
    side: 'right',
    group: 'lower'
  },
  {
    id: 'jawline-left',
    name: 'Left Jawline',
    type: 'filler',
    path: 'M 190 280 Q 210 285, 230 280 L 225 290 Q 205 295, 185 290 Z',
    centerX: 207,
    centerY: 285,
    recommendedUnits: {
      filler: { min: 0.5, max: 2, typical: 1.2 }
    },
    side: 'left',
    group: 'lower',
    description: 'Jawline definition'
  },
  {
    id: 'jawline-right',
    name: 'Right Jawline',
    type: 'filler',
    path: 'M 410 280 Q 390 285, 370 280 L 375 290 Q 395 295, 415 290 Z',
    centerX: 393,
    centerY: 285,
    recommendedUnits: {
      filler: { min: 0.5, max: 2, typical: 1.2 }
    },
    side: 'right',
    group: 'lower',
    description: 'Jawline definition'
  },
  {
    id: 'masseter-left',
    name: 'Left Masseter',
    muscle: 'Masseter',
    type: 'neurotoxin',
    path: 'M 180 260 Q 200 255, 210 265 Q 200 275, 180 270 Z',
    centerX: 195,
    centerY: 265,
    recommendedUnits: {
      neurotoxin: { min: 15, max: 35, typical: 25 }
    },
    side: 'left',
    group: 'lower',
    description: 'Jaw slimming/TMJ'
  },
  {
    id: 'masseter-right',
    name: 'Right Masseter',
    muscle: 'Masseter',
    type: 'neurotoxin',
    path: 'M 420 260 Q 400 255, 390 265 Q 400 275, 420 270 Z',
    centerX: 405,
    centerY: 265,
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
    path: 'M 270 320 L 270 350 M 300 320 L 300 350 M 330 320 L 330 350',
    centerX: 300,
    centerY: 335,
    recommendedUnits: {
      neurotoxin: { min: 20, max: 60, typical: 40 }
    },
    side: 'center',
    group: 'neck',
    description: 'Neck bands (Nefertiti lift)'
  }
]

interface AnatomicalFaceChartProps {
  selectedZones: Map<string, number>
  onZoneClick: (zone: InjectionZone) => void
  productType: 'neurotoxin' | 'filler'
  showLabels?: boolean
  showMuscles?: boolean
}

export function AnatomicalFaceChart({
  selectedZones,
  onZoneClick,
  productType,
  showLabels = true,
  showMuscles = false
}: AnatomicalFaceChartProps) {
  // Filter zones based on product type
  const relevantZones = INJECTION_ZONES.filter(
    zone => zone.type === productType || zone.type === 'both'
  )

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox="0 0 600 450"
        className="w-full h-full"
        style={{ maxWidth: '600px', margin: '0 auto' }}
      >
        {/* Face outline */}
        <g id="face-outline" opacity="0.3">
          {/* Head shape */}
          <ellipse
            cx="300"
            cy="200"
            rx="120"
            ry="150"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          
          {/* Jaw */}
          <path
            d="M 180 250 Q 180 300, 220 320 Q 260 330, 300 330 Q 340 330, 380 320 Q 420 300, 420 250"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          
          {/* Neck */}
          <path
            d="M 250 320 L 250 380 M 350 320 L 350 380"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1"
          />
        </g>

        {/* Facial features for reference */}
        <g id="facial-features" opacity="0.2">
          {/* Eyebrows */}
          <path d="M 240 140 Q 260 135, 280 140" fill="none" stroke="#94a3b8" strokeWidth="1" />
          <path d="M 320 140 Q 340 135, 360 140" fill="none" stroke="#94a3b8" strokeWidth="1" />
          
          {/* Eyes */}
          <ellipse cx="260" cy="165" rx="25" ry="15" fill="none" stroke="#94a3b8" strokeWidth="1" />
          <ellipse cx="340" cy="165" rx="25" ry="15" fill="none" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="260" cy="165" r="8" fill="#94a3b8" opacity="0.3" />
          <circle cx="340" cy="165" r="8" fill="#94a3b8" opacity="0.3" />
          
          {/* Nose */}
          <path
            d="M 300 170 L 295 210 M 300 170 L 305 210 M 285 210 Q 300 215, 315 210"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1"
          />
          
          {/* Mouth */}
          <path
            d="M 270 250 Q 300 245, 330 250 Q 315 262, 300 260 Q 285 262, 270 250"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1"
          />
        </g>

        {/* Injection zones */}
        <g id="injection-zones">
          {relevantZones.map(zone => {
            const isSelected = selectedZones.has(zone.id)
            const units = selectedZones.get(zone.id) || 0
            
            return (
              <g
                key={zone.id}
                className="cursor-pointer transition-all"
                onClick={() => onZoneClick(zone)}
              >
                {/* Zone area */}
                <path
                  d={zone.path}
                  fill={isSelected ? 
                    (productType === 'neurotoxin' ? '#8b5cf6' : '#ec4899') : 
                    'transparent'
                  }
                  fillOpacity={isSelected ? 0.3 : 0}
                  stroke={isSelected ? 
                    (productType === 'neurotoxin' ? '#7c3aed' : '#db2777') : 
                    '#cbd5e1'
                  }
                  strokeWidth={isSelected ? 2 : 1}
                  strokeDasharray={zone.type === 'both' ? '4,2' : 'none'}
                />
                
                {/* Center point */}
                <circle
                  cx={zone.centerX}
                  cy={zone.centerY}
                  r={isSelected ? 5 : 3}
                  fill={isSelected ? 
                    (productType === 'neurotoxin' ? '#7c3aed' : '#db2777') : 
                    '#64748b'
                  }
                />
                
                {/* Units label if selected */}
                {isSelected && (
                  <text
                    x={zone.centerX}
                    y={zone.centerY - 10}
                    fontSize="12"
                    fontWeight="bold"
                    fill={productType === 'neurotoxin' ? '#7c3aed' : '#db2777'}
                    textAnchor="middle"
                  >
                    {units}{productType === 'neurotoxin' ? 'u' : 'ml'}
                  </text>
                )}
                
                {/* Zone name label */}
                {showLabels && (
                  <text
                    x={zone.centerX}
                    y={zone.centerY + 15}
                    fontSize="9"
                    fill="#475569"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {zone.name}
                  </text>
                )}
                
                {/* Muscle name if enabled */}
                {showMuscles && zone.muscle && (
                  <text
                    x={zone.centerX}
                    y={zone.centerY + 25}
                    fontSize="8"
                    fill="#94a3b8"
                    fontStyle="italic"
                    textAnchor="middle"
                    className="pointer-events-none"
                  >
                    {zone.muscle}
                  </text>
                )}
              </g>
            )
          })}
        </g>

        {/* Legend */}
        <g id="legend" transform="translate(20, 380)">
          <text fontSize="10" fill="#64748b">
            Click zones to select • {productType === 'neurotoxin' ? 'Units' : 'ML'} shown above points
          </text>
        </g>
      </svg>
    </div>
  )
}

export { INJECTION_ZONES }