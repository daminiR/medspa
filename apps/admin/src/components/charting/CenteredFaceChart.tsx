'use client';

import React, { useState, useCallback } from 'react';

export interface InjectionPoint {
  id: string;
  x: number;
  y: number;
  units?: number;
  product?: string;
  zoneId: string;
}

export interface FaceZone {
  id: string;
  name: string;
  path: string;
}

interface CenteredFaceChartProps {
  onZoneClick?: (zoneId: string, event: React.MouseEvent) => void;
  injectionPoints?: InjectionPoint[];
  selectedZones?: string[];
  highlightedZone?: string | null;
  onInjectionPointClick?: (point: InjectionPoint, event: React.MouseEvent) => void;
  className?: string;
}

const FACE_ZONES: FaceZone[] = [
  {
    id: 'forehead',
    name: 'Forehead',
    path: 'M 120 80 Q 200 40 280 80 L 280 120 Q 200 100 120 120 Z',
  },
  {
    id: 'glabella',
    name: 'Glabella',
    path: 'M 175 120 L 225 120 L 225 155 L 175 155 Z',
  },
  {
    id: 'left-temple',
    name: 'Left Temple',
    path: 'M 80 90 Q 100 80 120 85 L 120 150 Q 100 145 80 150 Z',
  },
  {
    id: 'right-temple',
    name: 'Right Temple',
    path: 'M 280 85 Q 300 80 320 90 L 320 150 Q 300 145 280 150 Z',
  },
  {
    id: 'left-brow',
    name: 'Left Eyebrow',
    path: 'M 115 130 Q 150 115 180 130 L 175 150 Q 145 140 115 150 Z',
  },
  {
    id: 'right-brow',
    name: 'Right Eyebrow',
    path: 'M 220 130 Q 250 115 285 130 L 285 150 Q 255 140 225 150 Z',
  },
  {
    id: 'left-eye',
    name: 'Left Eye Area',
    path: 'M 120 155 Q 150 150 175 155 Q 175 175 150 185 Q 120 175 120 155 Z',
  },
  {
    id: 'right-eye',
    name: 'Right Eye Area',
    path: 'M 225 155 Q 250 150 280 155 Q 280 175 250 185 Q 225 175 225 155 Z',
  },
  {
    id: 'left-crow',
    name: 'Left Crow\'s Feet',
    path: 'M 95 155 L 120 155 L 120 190 L 95 185 Z',
  },
  {
    id: 'right-crow',
    name: 'Right Crow\'s Feet',
    path: 'M 280 155 L 305 155 L 305 185 L 280 190 Z',
  },
  {
    id: 'nose-bridge',
    name: 'Nose Bridge',
    path: 'M 185 155 L 215 155 L 212 200 L 188 200 Z',
  },
  {
    id: 'nose-tip',
    name: 'Nose Tip',
    path: 'M 180 200 Q 200 195 220 200 Q 225 230 200 240 Q 175 230 180 200 Z',
  },
  {
    id: 'left-cheek',
    name: 'Left Cheek',
    path: 'M 95 190 Q 120 185 150 195 L 155 260 Q 120 270 100 250 Z',
  },
  {
    id: 'right-cheek',
    name: 'Right Cheek',
    path: 'M 250 195 Q 280 185 305 190 L 300 250 Q 280 270 245 260 Z',
  },
  {
    id: 'left-nasolabial',
    name: 'Left Nasolabial Fold',
    path: 'M 155 240 L 175 240 L 165 295 L 145 290 Z',
  },
  {
    id: 'right-nasolabial',
    name: 'Right Nasolabial Fold',
    path: 'M 225 240 L 245 240 L 255 290 L 235 295 Z',
  },
  {
    id: 'upper-lip',
    name: 'Upper Lip',
    path: 'M 160 290 Q 200 280 240 290 L 235 310 Q 200 300 165 310 Z',
  },
  {
    id: 'lower-lip',
    name: 'Lower Lip',
    path: 'M 165 315 Q 200 310 235 315 L 230 340 Q 200 350 170 340 Z',
  },
  {
    id: 'left-marionette',
    name: 'Left Marionette',
    path: 'M 140 320 L 160 315 L 155 365 L 135 360 Z',
  },
  {
    id: 'right-marionette',
    name: 'Right Marionette',
    path: 'M 240 315 L 260 320 L 265 360 L 245 365 Z',
  },
  {
    id: 'chin',
    name: 'Chin',
    path: 'M 160 350 Q 200 345 240 350 Q 245 390 200 410 Q 155 390 160 350 Z',
  },
  {
    id: 'left-jawline',
    name: 'Left Jawline',
    path: 'M 100 260 L 140 270 L 145 360 Q 120 380 95 340 Z',
  },
  {
    id: 'right-jawline',
    name: 'Right Jawline',
    path: 'M 260 270 L 300 260 L 305 340 Q 280 380 255 360 Z',
  },
];

export default function CenteredFaceChart({
  onZoneClick,
  injectionPoints = [],
  selectedZones = [],
  highlightedZone = null,
  onInjectionPointClick,
  className = '',
}: CenteredFaceChartProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const handleZoneClick = useCallback(
    (zoneId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      onZoneClick?.(zoneId, event);
    },
    [onZoneClick]
  );

  const handleZoneMouseEnter = useCallback((zoneId: string) => {
    setHoveredZone(zoneId);
  }, []);

  const handleZoneMouseLeave = useCallback(() => {
    setHoveredZone(null);
  }, []);

  const handleInjectionPointClick = useCallback(
    (point: InjectionPoint, event: React.MouseEvent) => {
      event.stopPropagation();
      onInjectionPointClick?.(point, event);
    },
    [onInjectionPointClick]
  );

  const getZoneFill = (zoneId: string): string => {
    if (highlightedZone === zoneId) {
      return 'rgba(59, 130, 246, 0.4)';
    }
    if (selectedZones.includes(zoneId)) {
      return 'rgba(34, 197, 94, 0.3)';
    }
    if (hoveredZone === zoneId) {
      return 'rgba(156, 163, 175, 0.2)';
    }
    return 'transparent';
  };

  const getZoneStroke = (zoneId: string): string => {
    if (highlightedZone === zoneId) {
      return '#3b82f6';
    }
    if (selectedZones.includes(zoneId)) {
      return '#22c55e';
    }
    if (hoveredZone === zoneId) {
      return '#9ca3af';
    }
    return 'transparent';
  };

  return (
    <div
      className={`flex items-center justify-center w-full h-full min-h-0 ${className}`}
      style={{ background: 'transparent' }}
    >
      <svg
        viewBox="0 0 400 450"
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '85%',
          height: '85%',
          maxWidth: '100%',
          maxHeight: '100%',
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))',
        }}
      >
        <defs>
          <linearGradient id="skinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef3e2" />
            <stop offset="50%" stopColor="#fde7c8" />
            <stop offset="100%" stopColor="#f5d5b0" />
          </linearGradient>
          <filter id="faceShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Face outline */}
        <path
          d="M 200 30
             Q 320 30 330 150
             Q 335 250 310 320
             Q 280 400 200 420
             Q 120 400 90 320
             Q 65 250 70 150
             Q 80 30 200 30 Z"
          fill="url(#skinGradient)"
          stroke="#d4a574"
          strokeWidth="2"
          filter="url(#faceShadow)"
        />

        {/* Hairline hint */}
        <path
          d="M 120 70 Q 200 35 280 70"
          fill="none"
          stroke="#c4956a"
          strokeWidth="1"
          strokeDasharray="4 2"
          opacity="0.5"
        />

        {/* Eyebrow lines */}
        <path
          d="M 115 138 Q 148 125 178 140"
          fill="none"
          stroke="#8b7355"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 222 140 Q 252 125 285 138"
          fill="none"
          stroke="#8b7355"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Eye outlines */}
        <ellipse cx="147" cy="168" rx="25" ry="14" fill="white" stroke="#a08060" strokeWidth="1.5" />
        <ellipse cx="253" cy="168" rx="25" ry="14" fill="white" stroke="#a08060" strokeWidth="1.5" />

        {/* Pupils */}
        <circle cx="147" cy="168" r="8" fill="#4a3728" />
        <circle cx="253" cy="168" r="8" fill="#4a3728" />
        <circle cx="145" cy="166" r="2.5" fill="white" />
        <circle cx="251" cy="166" r="2.5" fill="white" />

        {/* Nose */}
        <path
          d="M 200 160 L 200 220"
          fill="none"
          stroke="#c4a080"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <path
          d="M 185 228 Q 175 235 180 242 Q 190 248 200 245 Q 210 248 220 242 Q 225 235 215 228"
          fill="none"
          stroke="#c4a080"
          strokeWidth="1.5"
        />

        {/* Nostrils */}
        <ellipse cx="188" cy="238" rx="5" ry="4" fill="#c4a080" opacity="0.4" />
        <ellipse cx="212" cy="238" rx="5" ry="4" fill="#c4a080" opacity="0.4" />

        {/* Lips */}
        <path
          d="M 165 298 Q 183 290 200 294 Q 217 290 235 298"
          fill="none"
          stroke="#c98080"
          strokeWidth="2"
        />
        <path
          d="M 165 298 Q 200 310 235 298 Q 225 328 200 332 Q 175 328 165 298 Z"
          fill="#e8a0a0"
          stroke="#c98080"
          strokeWidth="1.5"
          opacity="0.7"
        />
        <path
          d="M 165 298 Q 200 315 235 298"
          fill="none"
          stroke="#c98080"
          strokeWidth="1"
        />

        {/* Clickable zones */}
        <g className="zones">
          {FACE_ZONES.map((zone) => (
            <path
              key={zone.id}
              d={zone.path}
              fill={getZoneFill(zone.id)}
              stroke={getZoneStroke(zone.id)}
              strokeWidth="1.5"
              className="cursor-pointer transition-all duration-200"
              onClick={(e) => handleZoneClick(zone.id, e)}
              onMouseEnter={() => handleZoneMouseEnter(zone.id)}
              onMouseLeave={handleZoneMouseLeave}
            >
              <title>{zone.name}</title>
            </path>
          ))}
        </g>

        {/* Injection points */}
        <g className="injection-points">
          {injectionPoints.map((point) => (
            <g
              key={point.id}
              className="cursor-pointer"
              onClick={(e) => handleInjectionPointClick(point, e)}
            >
              <circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill="#ef4444"
                stroke="white"
                strokeWidth="2"
                className="transition-transform duration-150 hover:scale-110"
              />
              {point.units && (
                <text
                  x={point.x}
                  y={point.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                >
                  {point.units}
                </text>
              )}
              <title>
                {point.product ? `${point.product}: ${point.units}u` : `${point.units} units`}
              </title>
            </g>
          ))}
        </g>

        {/* Zone label on hover */}
        {hoveredZone && (
          <text
            x="200"
            y="440"
            textAnchor="middle"
            fill="#6b7280"
            fontSize="12"
            fontWeight="500"
          >
            {FACE_ZONES.find((z) => z.id === hoveredZone)?.name || ''}
          </text>
        )}
      </svg>
    </div>
  );
}

export { FACE_ZONES };
