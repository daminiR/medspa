'use client';

import React, { useState, useCallback } from 'react';

type BodyType = 'torso' | 'fullBody';
type ViewType = 'front' | 'back';

interface InjectionPoint {
  id: string;
  x: number;
  y: number;
  color?: string;
  label?: string;
  units?: number;
}

interface BodyZone {
  id: string;
  name: string;
  path: string;
  bodyType: BodyType[];
}

interface CenteredBodyChartProps {
  bodyType?: BodyType;
  view?: ViewType;
  onZoneClick?: (zoneId: string, zoneName: string) => void;
  injectionPoints?: InjectionPoint[];
  selectedZones?: string[];
  className?: string;
  onViewChange?: (view: ViewType) => void;
}

const FRONT_ZONES: BodyZone[] = [
  // Torso zones
  {
    id: 'chest-left',
    name: 'Left Chest',
    path: 'M 140 120 Q 150 115 180 115 L 180 160 Q 160 165 140 160 Z',
    bodyType: ['torso', 'fullBody'],
  },
  {
    id: 'chest-right',
    name: 'Right Chest',
    path: 'M 220 115 Q 250 115 260 120 L 260 160 Q 240 165 220 160 Z',
    bodyType: ['torso', 'fullBody'],
  },
  {
    id: 'abdomen-upper',
    name: 'Upper Abdomen',
    path: 'M 160 160 L 240 160 L 240 200 L 160 200 Z',
    bodyType: ['torso', 'fullBody'],
  },
  {
    id: 'abdomen-lower',
    name: 'Lower Abdomen',
    path: 'M 160 200 L 240 200 L 240 250 Q 200 260 160 250 Z',
    bodyType: ['torso', 'fullBody'],
  },
  {
    id: 'side-left',
    name: 'Left Side',
    path: 'M 130 130 L 140 120 L 140 240 Q 135 235 130 220 L 130 130 Z',
    bodyType: ['torso', 'fullBody'],
  },
  {
    id: 'side-right',
    name: 'Right Side',
    path: 'M 260 120 L 270 130 L 270 220 Q 265 235 260 240 L 260 120 Z',
    bodyType: ['torso', 'fullBody'],
  },
  // Full body zones
  {
    id: 'arm-left',
    name: 'Left Arm',
    path: 'M 100 130 L 130 120 L 130 220 L 90 300 L 80 295 L 100 220 Z',
    bodyType: ['fullBody'],
  },
  {
    id: 'arm-right',
    name: 'Right Arm',
    path: 'M 270 120 L 300 130 L 300 220 L 320 295 L 310 300 L 270 220 Z',
    bodyType: ['fullBody'],
  },
  {
    id: 'hand-left',
    name: 'Left Hand',
    path: 'M 70 295 L 90 300 L 95 340 L 65 345 Q 60 320 70 295 Z',
    bodyType: ['fullBody'],
  },
  {
    id: 'hand-right',
    name: 'Right Hand',
    path: 'M 310 300 L 330 295 Q 340 320 335 345 L 305 340 Z',
    bodyType: ['fullBody'],
  },
  {
    id: 'leg-left',
    name: 'Left Leg',
    path: 'M 160 260 L 195 260 L 185 400 L 150 400 Z',
    bodyType: ['fullBody'],
  },
  {
    id: 'leg-right',
    name: 'Right Leg',
    path: 'M 205 260 L 240 260 L 250 400 L 215 400 Z',
    bodyType: ['fullBody'],
  },
  {
    id: 'foot-left',
    name: 'Left Foot',
    path: 'M 145 400 L 185 400 L 180 440 L 140 440 Q 135 420 145 400 Z',
    bodyType: ['fullBody'],
  },
  {
    id: 'foot-right',
    name: 'Right Foot',
    path: 'M 215 400 L 255 400 Q 265 420 260 440 L 220 440 Z',
    bodyType: ['fullBody'],
  },
];

const BACK_ZONES: BodyZone[] = [
  // Torso zones
  {
    id: 'back-upper-left',
    name: 'Upper Left Back',
    path: 'M 140 120 Q 150 115 180 115 L 180 170 L 140 170 Z',
    bodyType: ['torso', 'fullBody'],
  },
  {
    id: 'back-upper-right',
    name: 'Upper Right Back',
    path: 'M 220 115 Q 250 115 260 120 L 260 170 L 220 170 Z',
    bodyType: ['torso', 'fullBody'],
  },
  {
    id: 'back-middle',
    name: 'Middle Back',
    path: 'M 145 170 L 255 170 L 255 220 L 145 220 Z',
    bodyType: ['torso', 'fullBody'],
  },
  {
    id: 'back-lower',
    name: 'Lower Back',
    path: 'M 150 220 L 250 220 L 250 260 Q 200 270 150 260 Z',
    bodyType: ['torso', 'fullBody'],
  },
  {
    id: 'shoulder-left',
    name: 'Left Shoulder',
    path: 'M 115 110 L 145 105 L 145 135 L 125 140 Z',
    bodyType: ['torso', 'fullBody'],
  },
  {
    id: 'shoulder-right',
    name: 'Right Shoulder',
    path: 'M 255 105 L 285 110 L 275 140 L 255 135 Z',
    bodyType: ['torso', 'fullBody'],
  },
  // Full body zones
  {
    id: 'arm-back-left',
    name: 'Left Arm (Back)',
    path: 'M 100 130 L 125 125 L 120 220 L 85 300 L 75 295 L 95 220 Z',
    bodyType: ['fullBody'],
  },
  {
    id: 'arm-back-right',
    name: 'Right Arm (Back)',
    path: 'M 275 125 L 300 130 L 305 220 L 325 295 L 315 300 L 280 220 Z',
    bodyType: ['fullBody'],
  },
  {
    id: 'hand-back-left',
    name: 'Left Hand (Back)',
    path: 'M 65 295 L 85 300 L 90 340 L 60 345 Q 55 320 65 295 Z',
    bodyType: ['fullBody'],
  },
  {
    id: 'hand-back-right',
    name: 'Right Hand (Back)',
    path: 'M 315 300 L 335 295 Q 345 320 340 345 L 310 340 Z',
    bodyType: ['fullBody'],
  },
  {
    id: 'leg-back-left',
    name: 'Left Leg (Back)',
    path: 'M 160 265 L 195 265 L 185 405 L 150 405 Z',
    bodyType: ['fullBody'],
  },
  {
    id: 'leg-back-right',
    name: 'Right Leg (Back)',
    path: 'M 205 265 L 240 265 L 250 405 L 215 405 Z',
    bodyType: ['fullBody'],
  },
  {
    id: 'foot-back-left',
    name: 'Left Foot (Back)',
    path: 'M 145 405 L 185 405 L 180 445 L 140 445 Q 135 425 145 405 Z',
    bodyType: ['fullBody'],
  },
  {
    id: 'foot-back-right',
    name: 'Right Foot (Back)',
    path: 'M 215 405 L 255 405 Q 265 425 260 445 L 220 445 Z',
    bodyType: ['fullBody'],
  },
];

const BODY_OUTLINE_FRONT = {
  torso: `
    M 200 80
    C 160 80 140 100 135 120
    L 130 130
    L 130 220
    Q 135 240 150 255
    L 160 260
    L 240 260
    L 250 255
    Q 265 240 270 220
    L 270 130
    L 265 120
    C 260 100 240 80 200 80
    Z
  `,
  fullBody: `
    M 200 60
    C 180 60 165 75 165 95
    C 165 115 180 130 200 130
    C 220 130 235 115 235 95
    C 235 75 220 60 200 60
    M 200 130
    C 160 130 140 140 130 150
    L 100 140
    L 80 200
    L 70 290
    L 65 340
    L 95 345
    L 105 300
    L 120 220
    L 130 240
    L 130 250
    Q 140 265 160 270
    L 165 400
    L 145 400
    Q 135 430 140 450
    L 185 450
    L 195 270
    L 200 270
    L 205 270
    L 215 450
    L 260 450
    Q 265 430 255 400
    L 235 400
    L 240 270
    Q 260 265 270 250
    L 270 240
    L 280 220
    L 295 300
    L 305 345
    L 335 340
    L 330 290
    L 320 200
    L 300 140
    L 270 150
    C 260 140 240 130 200 130
    Z
  `,
};

const BODY_OUTLINE_BACK = {
  torso: `
    M 200 80
    C 160 80 140 100 135 120
    L 130 130
    L 130 220
    Q 135 240 150 255
    L 160 260
    L 240 260
    L 250 255
    Q 265 240 270 220
    L 270 130
    L 265 120
    C 260 100 240 80 200 80
    Z
  `,
  fullBody: `
    M 200 60
    C 180 60 165 75 165 95
    C 165 115 180 130 200 130
    C 220 130 235 115 235 95
    C 235 75 220 60 200 60
    M 200 130
    C 160 130 140 140 130 150
    L 100 140
    L 75 200
    L 65 290
    L 60 340
    L 90 345
    L 100 300
    L 115 220
    L 125 240
    L 130 250
    Q 140 265 160 270
    L 165 405
    L 145 405
    Q 135 435 140 455
    L 185 455
    L 195 275
    L 200 275
    L 205 275
    L 215 455
    L 260 455
    Q 265 435 255 405
    L 235 405
    L 240 270
    Q 260 265 270 250
    L 275 240
    L 285 220
    L 300 300
    L 310 345
    L 340 340
    L 335 290
    L 325 200
    L 300 140
    L 270 150
    C 260 140 240 130 200 130
    Z
  `,
};

export default function CenteredBodyChart({
  bodyType = 'torso',
  view: controlledView,
  onZoneClick,
  injectionPoints = [],
  selectedZones = [],
  className = '',
  onViewChange,
}: CenteredBodyChartProps) {
  const [internalView, setInternalView] = useState<ViewType>('front');
  const view = controlledView ?? internalView;

  const handleViewToggle = useCallback(() => {
    const newView = view === 'front' ? 'back' : 'front';
    setInternalView(newView);
    onViewChange?.(newView);
  }, [view, onViewChange]);

  const zones = view === 'front' ? FRONT_ZONES : BACK_ZONES;
  const filteredZones = zones.filter((zone) => zone.bodyType.includes(bodyType));
  const outline = view === 'front' ? BODY_OUTLINE_FRONT[bodyType] : BODY_OUTLINE_BACK[bodyType];
  const viewBoxHeight = bodyType === 'fullBody' ? 500 : 300;

  const handleZoneClick = useCallback(
    (zone: BodyZone) => {
      onZoneClick?.(zone.id, zone.name);
    },
    [onZoneClick]
  );

  return (
    <div className={`relative flex items-center justify-center w-full h-full ${className}`}>
      {/* Container that enforces 80-85% sizing while maintaining aspect ratio */}
      <div
        className="flex items-center justify-center"
        style={{
          width: '85%',
          height: '85%',
        }}
      >
        <svg
          viewBox={`0 0 400 ${viewBoxHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="transition-all duration-300 ease-in-out"
          style={{
            width: '100%',
            height: '100%',
          }}
        >
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <filter id="zoneShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15" />
          </filter>
          <filter id="injectionGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="transition-opacity duration-300">
          {/* Body outline */}
          <path
            d={outline}
            fill="url(#bodyGradient)"
            stroke="#94a3b8"
            strokeWidth="2"
            className="transition-all duration-300"
          />

          {/* Clickable zones */}
          {filteredZones.map((zone) => {
            const isSelected = selectedZones.includes(zone.id);
            return (
              <path
                key={zone.id}
                d={zone.path}
                fill={isSelected ? 'rgba(59, 130, 246, 0.3)' : 'transparent'}
                stroke={isSelected ? '#3b82f6' : 'transparent'}
                strokeWidth={isSelected ? 2 : 0}
                className="cursor-pointer transition-all duration-200 hover:fill-blue-100 hover:stroke-blue-400 hover:stroke-2"
                filter={isSelected ? 'url(#zoneShadow)' : undefined}
                onClick={() => handleZoneClick(zone)}
              >
                <title>{zone.name}</title>
              </path>
            );
          })}

          {/* Injection points */}
          {injectionPoints.map((point) => (
            <g key={point.id} filter="url(#injectionGlow)">
              <circle
                cx={point.x}
                cy={point.y}
                r={8}
                fill={point.color || '#ef4444'}
                stroke="#fff"
                strokeWidth="2"
                className="transition-all duration-200 cursor-pointer hover:r-10"
              />
              {point.units && (
                <text
                  x={point.x}
                  y={point.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                  fontWeight="bold"
                  fill="#fff"
                >
                  {point.units}
                </text>
              )}
              {point.label && (
                <text
                  x={point.x}
                  y={point.y + 20}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#374151"
                  className="pointer-events-none"
                >
                  {point.label}
                </text>
              )}
            </g>
          ))}

          {/* Center line reference (subtle) */}
          <line
            x1="200"
            y1={bodyType === 'fullBody' ? 60 : 80}
            x2="200"
            y2={bodyType === 'fullBody' ? 270 : 260}
            stroke="#cbd5e1"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.5"
          />
        </g>
      </svg>
      </div>

      {/* View toggle button */}
      <button
        onClick={handleViewToggle}
        className="absolute top-2 right-2 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        type="button"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-300 ${view === 'back' ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {view === 'front' ? 'Front' : 'Back'}
      </button>

      {/* Legend for selected zones */}
      {selectedZones.length > 0 && (
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 font-medium">
            {selectedZones.length} zone{selectedZones.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}

      {/* Injection point count */}
      {injectionPoints.length > 0 && (
        <div className="absolute bottom-2 right-2 bg-red-50 rounded-lg px-3 py-2 shadow-sm border border-red-200">
          <p className="text-xs text-red-600 font-medium">
            {injectionPoints.length} injection point{injectionPoints.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
}

export type { BodyType, ViewType, InjectionPoint, BodyZone, CenteredBodyChartProps };
