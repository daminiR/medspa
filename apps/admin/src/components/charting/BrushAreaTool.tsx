'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { DraggablePanel } from './DraggablePanel';
import { useChartingTheme } from '@/contexts/ChartingThemeContext';
import { Trash2, Move, Minus, Plus, MapPin, X, ChevronDown } from 'lucide-react';
import { detectZoneFromStroke, FACE_ZONE_DEFINITIONS, type DetectedZone } from './zoneDetection';

// =============================================================================
// TYPES
// =============================================================================

/**
 * A single point in a brush stroke path
 */
export interface BrushPoint {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
}

/**
 * Brush size presets
 */
export type BrushSize = 'small' | 'medium' | 'large';

/**
 * Treatment type presets for area coverage
 */
export type TreatmentAreaType =
  | 'fractional_laser'
  | 'co2_laser'
  | 'ipl'
  | 'microneedling'
  | 'chemical_peel'
  | 'radiofrequency'
  | 'custom';

/**
 * Configuration for a treatment type with display properties
 */
export interface TreatmentTypeConfig {
  id: TreatmentAreaType;
  name: string;
  color: string;
  defaultOpacity: number;
  description?: string;
}

/**
 * Detected zone information attached to a brush stroke
 */
export interface BrushAreaDetectedZone {
  zoneId: string;
  zoneName: string;
  confidence: number; // 0-1 scale
  category?: string;
  userOverridden?: boolean; // True if user manually changed the zone
}

/**
 * A complete brush stroke/area with all metadata
 */
export interface BrushArea {
  id: string;
  points: BrushPoint[];
  treatmentType: TreatmentAreaType;
  color: string;
  opacity: number;
  brushRadius: number;
  customName?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  locked: boolean;
  visible: boolean;
  /** Auto-detected zone based on stroke location */
  detectedZone?: BrushAreaDetectedZone;
}

/**
 * Bounds of a brush area for selection/manipulation
 */
export interface BrushAreaBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  centerX: number;
  centerY: number;
}

/**
 * Props for the BrushAreaTool component
 */
export interface BrushAreaToolProps {
  /** Whether the brush tool is currently active */
  isActive: boolean;
  /** Current brush areas */
  brushAreas: BrushArea[];
  /** Callback when brush areas change */
  onBrushAreasChange: (areas: BrushArea[]) => void;
  /** Currently selected area ID */
  selectedAreaId?: string | null;
  /** Callback when selection changes */
  onSelectionChange?: (areaId: string | null) => void;
  /** Whether the canvas is read-only */
  readOnly?: boolean;
  /** Initial brush size */
  initialBrushSize?: BrushSize;
  /** Initial treatment type */
  initialTreatmentType?: TreatmentAreaType;
  /** Callback when a brush area is completed (stroke ends) */
  onAreaComplete?: (area: BrushArea) => void;
  /** Custom treatment type configurations */
  treatmentTypes?: TreatmentTypeConfig[];
  /** Whether to show the built-in floating toolbar (default: true) */
  showToolbar?: boolean;
  /** Controlled brush size - if provided, internal state won't be used */
  controlledBrushSize?: BrushSize;
  /** Callback when brush size changes (for controlled mode) */
  onBrushSizeChange?: (size: BrushSize) => void;
  /** Controlled treatment type - if provided, internal state won't be used */
  controlledTreatmentType?: TreatmentAreaType;
  /** Callback when treatment type changes (for controlled mode) */
  onTreatmentTypeChange?: (type: TreatmentAreaType) => void;
  /** Controlled opacity - if provided, internal state won't be used */
  controlledOpacity?: number;
  /** Callback when opacity changes (for controlled mode) */
  onOpacityChange?: (opacity: number) => void;
  /** Enable automatic zone detection for brush strokes (default: true) */
  enableZoneDetection?: boolean;
  /** Callback when a zone is detected for a stroke */
  onZoneDetected?: (area: BrushArea, zone: DetectedZone) => void;
  /** Show zone detection feedback labels (default: true) */
  showZoneFeedback?: boolean;
  /** Callback when user manually changes the detected zone */
  onZoneOverride?: (areaId: string, newZoneId: string) => void;
}

/**
 * Props for the BrushAreaToolbar floating panel
 */
export interface BrushAreaToolbarProps {
  /** Current brush size */
  brushSize: BrushSize;
  /** Callback to change brush size */
  onBrushSizeChange: (size: BrushSize) => void;
  /** Current brush radius in pixels */
  brushRadius: number;
  /** Callback to change brush radius */
  onBrushRadiusChange: (radius: number) => void;
  /** Current treatment type */
  treatmentType: TreatmentAreaType;
  /** Callback to change treatment type */
  onTreatmentTypeChange: (type: TreatmentAreaType) => void;
  /** Current opacity (0-1) */
  opacity: number;
  /** Callback to change opacity */
  onOpacityChange: (opacity: number) => void;
  /** Current color override (optional) */
  color?: string;
  /** Callback to change color */
  onColorChange?: (color: string) => void;
  /** Whether panel is visible */
  isVisible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Available treatment types */
  treatmentTypes?: TreatmentTypeConfig[];
  /** Undo callback */
  onUndo?: () => void;
  /** Clear all callback */
  onClearAll?: () => void;
  /** Whether undo is available */
  canUndo?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Default treatment type configurations with colors and settings
 *
 * IMPORTANT: Using opacity 1.0 for all treatment types to prevent opacity stacking
 * when brush strokes overlap. For medical charting, we need uniform appearance
 * across the entire brushed area regardless of overlapping strokes.
 * Colors are adjusted to be softer/lighter to compensate for full opacity.
 */
export const DEFAULT_TREATMENT_TYPES: TreatmentTypeConfig[] = [
  {
    id: 'fractional_laser',
    name: 'Fractional Laser',
    color: '#FECACA', // Light red (was #EF4444 at 0.18 opacity)
    defaultOpacity: 1.0,
    description: 'Non-ablative fractional resurfacing',
  },
  {
    id: 'co2_laser',
    name: 'CO2 Laser',
    color: '#FED7AA', // Light orange (was #F97316 at 0.2 opacity)
    defaultOpacity: 1.0,
    description: 'Ablative CO2 laser resurfacing',
  },
  {
    id: 'ipl',
    name: 'IPL',
    color: '#FEF08A', // Light amber (was #FBBF24 at 0.18 opacity)
    defaultOpacity: 1.0,
    description: 'Intense pulsed light therapy',
  },
  {
    id: 'microneedling',
    name: 'Microneedling',
    color: '#E9D5FF', // Light purple (was #A855F7 at 0.15 opacity)
    defaultOpacity: 1.0,
    description: 'Collagen induction therapy',
  },
  {
    id: 'chemical_peel',
    name: 'Chemical Peel',
    color: '#A5F3FC', // Light cyan (was #06B6D4 at 0.18 opacity)
    defaultOpacity: 1.0,
    description: 'Chemical exfoliation treatment',
  },
  {
    id: 'radiofrequency',
    name: 'Radiofrequency',
    color: '#FBCFE8', // Light pink (was #EC4899 at 0.15 opacity)
    defaultOpacity: 1.0,
    description: 'RF skin tightening',
  },
  {
    id: 'custom',
    name: 'Custom',
    color: '#D1D5DB', // Light gray (was #6B7280 at 0.15 opacity)
    defaultOpacity: 1.0,
    description: 'Custom treatment area',
  },
];

/**
 * Brush size presets with radius values
 */
export const BRUSH_SIZE_PRESETS: Record<BrushSize, number> = {
  small: 8,
  medium: 16,
  large: 32,
};

/**
 * Min/max brush radius for slider
 */
export const BRUSH_RADIUS_MIN = 4;
export const BRUSH_RADIUS_MAX = 64;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate a unique ID for a brush area
 */
export function generateBrushAreaId(): string {
  return `brush-area-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate the bounding box of a brush area
 */
export function calculateBrushAreaBounds(area: BrushArea): BrushAreaBounds {
  if (area.points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, centerX: 0, centerY: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const point of area.points) {
    // Account for brush radius in bounds
    minX = Math.min(minX, point.x - area.brushRadius);
    minY = Math.min(minY, point.y - area.brushRadius);
    maxX = Math.max(maxX, point.x + area.brushRadius);
    maxY = Math.max(maxY, point.y + area.brushRadius);
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

/**
 * Check if a point is inside a brush area (hit testing)
 */
export function isPointInBrushArea(
  x: number,
  y: number,
  area: BrushArea,
  tolerance: number = 0
): boolean {
  for (const point of area.points) {
    const distance = Math.sqrt(
      Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
    );
    if (distance <= area.brushRadius + tolerance) {
      return true;
    }
  }
  return false;
}

/**
 * Get treatment type config by ID
 */
export function getTreatmentTypeConfig(
  typeId: TreatmentAreaType,
  customTypes?: TreatmentTypeConfig[]
): TreatmentTypeConfig {
  const types = customTypes || DEFAULT_TREATMENT_TYPES;
  return types.find((t) => t.id === typeId) || types[types.length - 1];
}

/**
 * Convert brush areas to SVG path data for export
 */
export function brushAreasToSVG(
  areas: BrushArea[],
  width: number,
  height: number
): string {
  const paths = areas
    .filter((area) => area.visible && area.points.length > 0)
    .map((area) => {
      // Generate circles for each point to create the brush stroke effect
      const circles = area.points
        .map(
          (point) =>
            `<circle cx="${point.x}" cy="${point.y}" r="${area.brushRadius}" fill="${area.color}" fill-opacity="${area.opacity}" />`
        )
        .join('\n    ');

      return `  <g data-area-id="${area.id}" data-treatment-type="${area.treatmentType}">
    ${circles}
  </g>`;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
${paths}
</svg>`;
}

/**
 * Smooth a path of brush points using a simple moving average
 */
export function smoothBrushPath(
  points: BrushPoint[],
  windowSize: number = 3
): BrushPoint[] {
  if (points.length <= windowSize) return points;

  const smoothed: BrushPoint[] = [];
  const halfWindow = Math.floor(windowSize / 2);

  for (let i = 0; i < points.length; i++) {
    let sumX = 0;
    let sumY = 0;
    let count = 0;

    for (let j = i - halfWindow; j <= i + halfWindow; j++) {
      if (j >= 0 && j < points.length) {
        sumX += points[j].x;
        sumY += points[j].y;
        count++;
      }
    }

    smoothed.push({
      x: sumX / count,
      y: sumY / count,
      pressure: points[i].pressure,
      timestamp: points[i].timestamp,
    });
  }

  return smoothed;
}

// =============================================================================
// BRUSH AREA TOOLBAR COMPONENT
// =============================================================================

export function BrushAreaToolbar({
  brushSize,
  onBrushSizeChange,
  brushRadius,
  onBrushRadiusChange,
  treatmentType,
  onTreatmentTypeChange,
  opacity,
  onOpacityChange,
  color,
  onColorChange,
  isVisible = true,
  defaultCollapsed = false,
  treatmentTypes = DEFAULT_TREATMENT_TYPES,
  onUndo,
  onClearAll,
  canUndo = false,
}: BrushAreaToolbarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [defaultPosition, setDefaultPosition] = useState({ x: 16, y: 200 });

  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  // Get current treatment type config
  const currentTypeConfig = getTreatmentTypeConfig(treatmentType, treatmentTypes);

  // Adjust position on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDefaultPosition({ x: 16, y: Math.min(200, window.innerHeight - 400) });
    }
  }, []);

  if (!isVisible) return null;

  return (
    <DraggablePanel
      panelId="brush-area-toolbar"
      initialPosition={defaultPosition}
      title="Brush Tool"
      variant="auto"
      onCollapse={() => setIsCollapsed(!isCollapsed)}
      isCollapsed={isCollapsed}
      minWidth={220}
    >
      <div className="space-y-4" style={{ pointerEvents: 'auto' }}>
        {/* Treatment Type Selector */}
        <div className="space-y-2">
          <label
            className={`text-xs font-medium ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            Treatment Type
          </label>
          <select
            value={treatmentType}
            onChange={(e) =>
              onTreatmentTypeChange(e.target.value as TreatmentAreaType)
            }
            className={`
              w-full px-3 py-2 rounded-lg text-sm
              ${
                isDark
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-white text-gray-900 border-gray-300'
              }
              border focus:outline-none focus:ring-2 focus:ring-purple-500
            `}
          >
            {treatmentTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Color Preview */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg border-2 shadow-inner"
            style={{
              backgroundColor: color || currentTypeConfig.color,
              opacity: opacity,
              borderColor: isDark ? '#374151' : '#D1D5DB',
            }}
          />
          <span
            className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
          >
            {currentTypeConfig.name}
          </span>
        </div>

        {/* Brush Size Presets */}
        <div className="space-y-2">
          <label
            className={`text-xs font-medium ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            Brush Size
          </label>
          <div
            className={`flex gap-1 p-1 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-100'
            }`}
          >
            {(Object.keys(BRUSH_SIZE_PRESETS) as BrushSize[]).map((size) => (
              <button
                key={size}
                onClick={() => {
                  onBrushSizeChange(size);
                  onBrushRadiusChange(BRUSH_SIZE_PRESETS[size]);
                }}
                className={`
                  flex-1 py-2 rounded-md text-xs font-medium capitalize
                  transition-colors
                  ${
                    brushSize === size
                      ? 'bg-purple-500 text-white'
                      : isDark
                      ? 'text-gray-300 hover:bg-gray-600'
                      : 'text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Brush Radius Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              className={`text-xs font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Radius
            </label>
            <span
              className={`text-xs ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {brushRadius}px
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onBrushRadiusChange(Math.max(BRUSH_RADIUS_MIN, brushRadius - 2))
              }
              className={`
                p-1.5 rounded-md transition-colors
                ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="range"
              min={BRUSH_RADIUS_MIN}
              max={BRUSH_RADIUS_MAX}
              value={brushRadius}
              onChange={(e) => onBrushRadiusChange(Number(e.target.value))}
              className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-purple-500"
              style={{
                background: isDark
                  ? `linear-gradient(to right, #A855F7 0%, #A855F7 ${
                      ((brushRadius - BRUSH_RADIUS_MIN) /
                        (BRUSH_RADIUS_MAX - BRUSH_RADIUS_MIN)) *
                      100
                    }%, #374151 ${
                      ((brushRadius - BRUSH_RADIUS_MIN) /
                        (BRUSH_RADIUS_MAX - BRUSH_RADIUS_MIN)) *
                      100
                    }%, #374151 100%)`
                  : `linear-gradient(to right, #A855F7 0%, #A855F7 ${
                      ((brushRadius - BRUSH_RADIUS_MIN) /
                        (BRUSH_RADIUS_MAX - BRUSH_RADIUS_MIN)) *
                      100
                    }%, #E5E7EB ${
                      ((brushRadius - BRUSH_RADIUS_MIN) /
                        (BRUSH_RADIUS_MAX - BRUSH_RADIUS_MIN)) *
                      100
                    }%, #E5E7EB 100%)`,
              }}
            />
            <button
              onClick={() =>
                onBrushRadiusChange(Math.min(BRUSH_RADIUS_MAX, brushRadius + 2))
              }
              className={`
                p-1.5 rounded-md transition-colors
                ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Opacity Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              className={`text-xs font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Opacity
            </label>
            <span
              className={`text-xs ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {Math.round(opacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={80}
            value={opacity * 100}
            onChange={(e) => onOpacityChange(Number(e.target.value) / 100)}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-500"
            style={{
              background: isDark
                ? `linear-gradient(to right, #A855F7 0%, #A855F7 ${
                    ((opacity * 100 - 10) / 70) * 100
                  }%, #374151 ${((opacity * 100 - 10) / 70) * 100}%, #374151 100%)`
                : `linear-gradient(to right, #A855F7 0%, #A855F7 ${
                    ((opacity * 100 - 10) / 70) * 100
                  }%, #E5E7EB ${((opacity * 100 - 10) / 70) * 100}%, #E5E7EB 100%)`,
            }}
          />
        </div>

        {/* Divider */}
        <div
          className={`h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}
        />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium
              transition-colors
              ${
                canUndo
                  ? isDark
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'opacity-40 cursor-not-allowed'
              }
              ${isDark ? 'bg-gray-700' : 'bg-gray-100'}
            `}
          >
            <Move className="w-4 h-4 rotate-180" />
            Undo
          </button>
          <button
            onClick={onClearAll}
            className={`
              flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium
              transition-colors
              ${
                isDark
                  ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              }
            `}
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
    </DraggablePanel>
  );
}

// =============================================================================
// MAIN BRUSH AREA TOOL COMPONENT
// =============================================================================

export function BrushAreaTool({
  isActive,
  brushAreas,
  onBrushAreasChange,
  selectedAreaId,
  onSelectionChange,
  readOnly = false,
  initialBrushSize = 'medium',
  initialTreatmentType = 'fractional_laser',
  onAreaComplete,
  treatmentTypes = DEFAULT_TREATMENT_TYPES,
  showToolbar = true,
  controlledBrushSize,
  onBrushSizeChange,
  controlledTreatmentType,
  onTreatmentTypeChange,
  controlledOpacity,
  onOpacityChange,
  enableZoneDetection = true,
  onZoneDetected,
  showZoneFeedback = true,
  onZoneOverride,
}: BrushAreaToolProps) {
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<BrushPoint[]>([]);
  // Counter to trigger redraw after canvas resize (since resize clears the canvas)
  const [resizeCounter, setResizeCounter] = useState(0);

  // Zone feedback state - shows a temporary label when zone is detected
  const [zoneFeedback, setZoneFeedback] = useState<{
    areaId: string;
    zoneName: string;
    position: { x: number; y: number };
    confidence: number;
  } | null>(null);

  // Zone picker state for override
  const [zonePickerOpen, setZonePickerOpen] = useState<string | null>(null);

  // Brush settings state (internal - used when not controlled)
  const [internalBrushSize, setInternalBrushSize] = useState<BrushSize>(initialBrushSize);
  const [brushRadius, setBrushRadius] = useState(BRUSH_SIZE_PRESETS[initialBrushSize]);
  const [internalTreatmentType, setInternalTreatmentType] = useState<TreatmentAreaType>(initialTreatmentType);
  const [internalOpacity, setInternalOpacity] = useState(() =>
    getTreatmentTypeConfig(initialTreatmentType, treatmentTypes).defaultOpacity
  );

  // Use controlled values if provided, otherwise use internal state
  const brushSize = controlledBrushSize ?? internalBrushSize;
  const treatmentType = controlledTreatmentType ?? internalTreatmentType;
  const opacity = controlledOpacity ?? internalOpacity;

  // Setters that work for both controlled and uncontrolled modes
  const setBrushSize = useCallback((size: BrushSize) => {
    if (onBrushSizeChange) {
      onBrushSizeChange(size);
    } else {
      setInternalBrushSize(size);
    }
    setBrushRadius(BRUSH_SIZE_PRESETS[size]);
  }, [onBrushSizeChange]);

  const setTreatmentType = useCallback((type: TreatmentAreaType) => {
    if (onTreatmentTypeChange) {
      onTreatmentTypeChange(type);
    } else {
      setInternalTreatmentType(type);
    }
  }, [onTreatmentTypeChange]);

  const setOpacity = useCallback((newOpacity: number) => {
    if (onOpacityChange) {
      onOpacityChange(newOpacity);
    } else {
      setInternalOpacity(newOpacity);
    }
  }, [onOpacityChange]);

  // Get current treatment config
  const currentTypeConfig = useMemo(
    () => getTreatmentTypeConfig(treatmentType, treatmentTypes),
    [treatmentType, treatmentTypes]
  );

  // Update opacity when treatment type changes (only in uncontrolled mode)
  useEffect(() => {
    if (controlledOpacity === undefined) {
      setInternalOpacity(currentTypeConfig.defaultOpacity);
    }
  }, [currentTypeConfig, controlledOpacity]);

  // Update brush radius when controlled brush size changes
  useEffect(() => {
    if (controlledBrushSize !== undefined) {
      setBrushRadius(BRUSH_SIZE_PRESETS[controlledBrushSize]);
    }
  }, [controlledBrushSize]);

  // ==========================================================================
  // CANVAS SIZING & RENDERING
  // ==========================================================================

  /**
   * Resize canvas to match parent container
   * Increments resizeCounter to trigger a redraw via the redrawCanvas useEffect
   */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    // Trigger a redraw by updating the counter
    setResizeCounter(prev => prev + 1);
  }, []);

  /**
   * Draw a single brush area on canvas
   */
  const drawBrushArea = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      area: BrushArea,
      isPreview: boolean = false
    ) => {
      if (area.points.length === 0) return;

      const color = area.color;
      const effectiveOpacity = isPreview ? area.opacity * 0.6 : area.opacity;

      ctx.save();
      ctx.globalAlpha = effectiveOpacity;
      ctx.fillStyle = color;

      // Draw circles at each point to create brush stroke
      for (const point of area.points) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, area.brushRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // If selected, draw selection outline
      if (selectedAreaId === area.id && !isPreview) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#A855F7';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);

        const bounds = calculateBrushAreaBounds(area);
        ctx.strokeRect(
          bounds.minX - 4,
          bounds.minY - 4,
          bounds.maxX - bounds.minX + 8,
          bounds.maxY - bounds.minY + 8
        );
      }

      ctx.restore();
    },
    [selectedAreaId]
  );

  /**
   * Redraw all brush areas on canvas
   */
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    // Draw all visible brush areas
    for (const area of brushAreas) {
      if (area.visible) {
        drawBrushArea(ctx, area);
      }
    }

    // Draw current stroke preview
    if (currentStroke.length > 0) {
      const previewArea: BrushArea = {
        id: 'preview',
        points: currentStroke,
        treatmentType,
        color: currentTypeConfig.color,
        opacity,
        brushRadius,
        createdAt: new Date(),
        updatedAt: new Date(),
        locked: false,
        visible: true,
      };
      drawBrushArea(ctx, previewArea, true);
    }
  }, [brushAreas, currentStroke, drawBrushArea, treatmentType, currentTypeConfig, opacity, brushRadius]);

  // Handle resize
  useEffect(() => {
    resizeCanvas();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [resizeCanvas]);

  // Redraw when areas, stroke, or canvas size changes
  useEffect(() => {
    redrawCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redrawCanvas, resizeCounter]);

  // ==========================================================================
  // POINTER EVENT HANDLERS
  // ==========================================================================

  /**
   * Get pointer position relative to canvas
   */
  const getPointerPosition = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): BrushPoint => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0, pressure: 0.5, timestamp: Date.now() };

      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        pressure: e.pressure || 0.5,
        timestamp: Date.now(),
      };
    },
    []
  );

  // Track active touch count for two-finger gesture detection
  const touchCountRef = useRef(0);

  /**
   * Handle pointer down - start drawing or select area
   * Two-finger gestures pass through for zoom/pan
   */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isActive || readOnly) return;

      // Track touch count for multi-touch detection
      if (e.pointerType === 'touch') {
        touchCountRef.current++;
        // If more than one finger, don't start drawing - let parent handle zoom/pan
        if (touchCountRef.current > 1) {
          return;
        }
      }

      e.preventDefault();
      const point = getPointerPosition(e);

      // Check if clicking on existing area for selection
      for (const area of [...brushAreas].reverse()) {
        if (area.visible && isPointInBrushArea(point.x, point.y, area, 4)) {
          onSelectionChange?.(area.id);
          return;
        }
      }

      // Start new stroke
      setIsDrawing(true);
      setCurrentStroke([point]);
      onSelectionChange?.(null);
    },
    [isActive, readOnly, brushAreas, getPointerPosition, onSelectionChange]
  );

  /**
   * Handle pointer move - continue drawing
   * Two-finger gestures pass through for zoom/pan
   */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isActive || !isDrawing || readOnly) return;

      // Don't process if multi-touch gesture is happening
      if (e.pointerType === 'touch' && touchCountRef.current > 1) {
        return;
      }

      e.preventDefault();
      const point = getPointerPosition(e);

      // Only add point if moved minimum distance (performance optimization)
      const lastPoint = currentStroke[currentStroke.length - 1];
      if (lastPoint) {
        const distance = Math.sqrt(
          Math.pow(point.x - lastPoint.x, 2) + Math.pow(point.y - lastPoint.y, 2)
        );
        if (distance < brushRadius / 4) return;
      }

      setCurrentStroke((prev) => [...prev, point]);
    },
    [isActive, isDrawing, readOnly, currentStroke, brushRadius, getPointerPosition]
  );

  /**
   * Handle pointer up - complete stroke with zone detection
   * Two-finger gestures pass through for zoom/pan
   */
  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      // Track touch count for multi-touch detection
      if (e.pointerType === 'touch') {
        touchCountRef.current = Math.max(0, touchCountRef.current - 1);
      }

      if (!isActive || !isDrawing || readOnly) return;

      e.preventDefault();
      setIsDrawing(false);

      if (currentStroke.length > 1) {
        const canvas = canvasRef.current;
        const smoothedPoints = smoothBrushPath(currentStroke);

        // Detect zone if enabled
        let detectedZone: BrushAreaDetectedZone | undefined;
        if (enableZoneDetection && canvas) {
          const rect = canvas.getBoundingClientRect();
          const detected = detectZoneFromStroke(
            smoothedPoints,
            rect.width,
            rect.height
          );

          if (detected) {
            detectedZone = {
              zoneId: detected.zoneId,
              zoneName: detected.zoneName,
              confidence: detected.confidence,
              category: detected.category,
              userOverridden: false,
            };
          }
        }

        // Create new brush area from stroke
        const newArea: BrushArea = {
          id: generateBrushAreaId(),
          points: smoothedPoints,
          treatmentType,
          color: currentTypeConfig.color,
          opacity,
          brushRadius,
          createdAt: new Date(),
          updatedAt: new Date(),
          locked: false,
          visible: true,
          detectedZone,
        };

        const newAreas = [...brushAreas, newArea];
        onBrushAreasChange(newAreas);
        onAreaComplete?.(newArea);

        // Show zone feedback if enabled and zone was detected
        if (showZoneFeedback && detectedZone && smoothedPoints.length > 0) {
          // Calculate centroid of the stroke for feedback position
          const centroid = smoothedPoints.reduce(
            (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
            { x: 0, y: 0 }
          );
          centroid.x /= smoothedPoints.length;
          centroid.y /= smoothedPoints.length;

          setZoneFeedback({
            areaId: newArea.id,
            zoneName: detectedZone.zoneName,
            position: { x: centroid.x, y: centroid.y - 30 },
            confidence: detectedZone.confidence,
          });

          // Callback for zone detected
          if (onZoneDetected) {
            onZoneDetected(newArea, {
              zoneId: detectedZone.zoneId,
              zoneName: detectedZone.zoneName,
              confidence: detectedZone.confidence,
              category: detectedZone.category,
            });
          }

          // Auto-dismiss feedback after 2 seconds
          setTimeout(() => {
            setZoneFeedback((prev) =>
              prev?.areaId === newArea.id ? null : prev
            );
          }, 2000);
        }
      }

      setCurrentStroke([]);
    },
    [
      isActive,
      isDrawing,
      readOnly,
      currentStroke,
      brushAreas,
      treatmentType,
      currentTypeConfig,
      opacity,
      brushRadius,
      onBrushAreasChange,
      onAreaComplete,
      enableZoneDetection,
      showZoneFeedback,
      onZoneDetected,
    ]
  );

  /**
   * Handle pointer leave - cancel stroke
   * Also handles pointer cancel for multi-touch scenarios
   */
  const handlePointerLeave = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      // Track touch count for multi-touch detection
      if (e.pointerType === 'touch') {
        touchCountRef.current = Math.max(0, touchCountRef.current - 1);
      }

      if (isDrawing) {
        handlePointerUp(e);
      }
    },
    [isDrawing, handlePointerUp]
  );

  // ==========================================================================
  // ACTION HANDLERS
  // ==========================================================================

  /**
   * Undo last brush area
   */
  const handleUndo = useCallback(() => {
    if (brushAreas.length === 0) return;
    const newAreas = brushAreas.slice(0, -1);
    onBrushAreasChange(newAreas);
    onSelectionChange?.(null);
  }, [brushAreas, onBrushAreasChange, onSelectionChange]);

  /**
   * Clear all brush areas
   */
  const handleClearAll = useCallback(() => {
    onBrushAreasChange([]);
    onSelectionChange?.(null);
    setCurrentStroke([]);
  }, [onBrushAreasChange, onSelectionChange]);

  /**
   * Delete selected area
   */
  const handleDeleteSelected = useCallback(() => {
    if (!selectedAreaId) return;
    const newAreas = brushAreas.filter((area) => area.id !== selectedAreaId);
    onBrushAreasChange(newAreas);
    onSelectionChange?.(null);
  }, [selectedAreaId, brushAreas, onBrushAreasChange, onSelectionChange]);

  /**
   * Handle zone override - when user manually changes the detected zone
   */
  const handleZoneChange = useCallback(
    (areaId: string, newZoneId: string) => {
      const zone = FACE_ZONE_DEFINITIONS.find((z) => z.id === newZoneId);
      if (!zone) return;

      const newAreas = brushAreas.map((area) =>
        area.id === areaId
          ? {
              ...area,
              detectedZone: {
                zoneId: newZoneId,
                zoneName: zone.name,
                confidence: 1.0, // User-selected = 100% confidence
                category: zone.category,
                userOverridden: true,
              },
              updatedAt: new Date(),
            }
          : area
      );
      onBrushAreasChange(newAreas);
      onZoneOverride?.(areaId, newZoneId);
      setZonePickerOpen(null);
    },
    [brushAreas, onBrushAreasChange, onZoneOverride]
  );

  /**
   * Dismiss zone feedback
   */
  const dismissZoneFeedback = useCallback(() => {
    setZoneFeedback(null);
  }, []);

  // Get the theme
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden z-20 ${
        isActive ? '' : 'pointer-events-none'
      }`}
    >
      {/* Canvas for brush strokes - z-15 to render ABOVE chart images (z-10) */}
      {/* Container has pointer-events-none when inactive so injection points work */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 z-[15] ${
          isActive ? 'cursor-crosshair' : 'pointer-events-none'
        }`}
        style={{
          // IMPORTANT: Use 'pinch-zoom' instead of 'none' to allow two-finger zoom gestures
          // to pass through to the parent FaceChartWithZoom component.
          // This ensures practitioners can ALWAYS zoom in/out regardless of which tool is active.
          // Single-finger drawing is still captured by the canvas pointer events.
          touchAction: 'pinch-zoom'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerLeave}
      />

      {/* Floating toolbar for brush settings - can be hidden when using external toolbar */}
      {isActive && showToolbar && (
        <BrushAreaToolbar
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          brushRadius={brushRadius}
          onBrushRadiusChange={setBrushRadius}
          treatmentType={treatmentType}
          onTreatmentTypeChange={setTreatmentType}
          opacity={opacity}
          onOpacityChange={setOpacity}
          treatmentTypes={treatmentTypes}
          onUndo={handleUndo}
          onClearAll={handleClearAll}
          canUndo={brushAreas.length > 0}
        />
      )}

      {/* Selection controls for selected area */}
      {selectedAreaId && isActive && (
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <button
            onClick={handleDeleteSelected}
            className="px-3 py-1.5 text-sm font-medium bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 transition-colors"
          >
            Delete Selected
          </button>
        </div>
      )}

      {/* Zone Detection Feedback Label - subtle, non-intrusive */}
      {zoneFeedback && showZoneFeedback && (
        <div
          className={`
            absolute z-30 pointer-events-auto
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shadow-lg
            animate-in fade-in slide-in-from-bottom-2 duration-200
            ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
            border ${isDark ? 'border-gray-700' : 'border-gray-200'}
          `}
          style={{
            left: `${Math.max(60, Math.min(zoneFeedback.position.x, window.innerWidth - 160))}px`,
            top: `${Math.max(20, zoneFeedback.position.y)}px`,
            transform: 'translateX(-50%)',
          }}
        >
          <MapPin className="w-3.5 h-3.5 text-purple-500" />
          <span className="text-xs font-medium">{zoneFeedback.zoneName}</span>
          {zoneFeedback.confidence >= 0.7 && (
            <span className="text-green-500 text-xs">&#10003;</span>
          )}
          <button
            onClick={dismissZoneFeedback}
            className={`
              ml-1 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700
              transition-colors
            `}
            title="Dismiss"
          >
            <X className="w-3 h-3 text-gray-400" />
          </button>
          <button
            onClick={() => setZonePickerOpen(zoneFeedback.areaId)}
            className={`
              ml-0.5 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700
              transition-colors
            `}
            title="Change zone"
          >
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      )}

      {/* Zone Picker Dropdown for override */}
      {zonePickerOpen && (
        <div
          className={`
            absolute z-40 pointer-events-auto
            w-48 max-h-64 overflow-y-auto rounded-lg shadow-xl
            ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
            border
          `}
          style={{
            left: zoneFeedback
              ? `${Math.max(60, Math.min(zoneFeedback.position.x, window.innerWidth - 200))}px`
              : '50%',
            top: zoneFeedback ? `${zoneFeedback.position.y + 40}px` : '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <div className={`px-3 py-2 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Select Zone
              </span>
              <button
                onClick={() => setZonePickerOpen(null)}
                className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>
          <div className="py-1">
            {FACE_ZONE_DEFINITIONS.map((zone) => (
              <button
                key={zone.id}
                onClick={() => handleZoneChange(zonePickerOpen, zone.id)}
                className={`
                  w-full px-3 py-1.5 text-left text-sm
                  flex items-center gap-2
                  ${isDark
                    ? 'hover:bg-gray-700 text-gray-200'
                    : 'hover:bg-gray-100 text-gray-700'}
                  transition-colors
                `}
              >
                <MapPin className="w-3 h-3 text-purple-400" />
                <span>{zone.name}</span>
                <span className={`text-xs ml-auto ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {zone.category}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click-away handler for zone picker */}
      {zonePickerOpen && (
        <div
          className="fixed inset-0 z-35"
          onClick={() => setZonePickerOpen(null)}
        />
      )}
    </div>
  );
}

// =============================================================================
// HOOK FOR MANAGING BRUSH AREA STATE
// =============================================================================

export interface UseBrushAreasStateOptions {
  /** Initial brush areas */
  initialAreas?: BrushArea[];
  /** Max history size for undo */
  maxHistorySize?: number;
}

export interface UseBrushAreasStateReturn {
  brushAreas: BrushArea[];
  selectedAreaId: string | null;
  setBrushAreas: (areas: BrushArea[]) => void;
  setSelectedAreaId: (id: string | null) => void;
  addArea: (area: BrushArea) => void;
  updateArea: (id: string, updates: Partial<BrushArea>) => void;
  deleteArea: (id: string) => void;
  toggleAreaVisibility: (id: string) => void;
  clearAllAreas: () => void;
  getAreasByTreatmentType: (type: TreatmentAreaType) => BrushArea[];
  getTotalAreaCount: () => number;
  /** Get all areas that have a detected zone */
  getAreasWithZones: () => BrushArea[];
  /** Get areas by detected zone ID */
  getAreasByZone: (zoneId: string) => BrushArea[];
  /** Update the detected zone for an area */
  updateAreaZone: (areaId: string, zoneId: string, zoneName: string) => void;
}

export function useBrushAreasState({
  initialAreas = [],
  maxHistorySize = 50,
}: UseBrushAreasStateOptions = {}): UseBrushAreasStateReturn {
  const [brushAreas, setBrushAreasInternal] = useState<BrushArea[]>(initialAreas);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const setBrushAreas = useCallback((areas: BrushArea[]) => {
    setBrushAreasInternal(areas);
  }, []);

  const addArea = useCallback((area: BrushArea) => {
    setBrushAreasInternal((prev) => [...prev, area]);
  }, []);

  const updateArea = useCallback((id: string, updates: Partial<BrushArea>) => {
    setBrushAreasInternal((prev) =>
      prev.map((area) =>
        area.id === id
          ? { ...area, ...updates, updatedAt: new Date() }
          : area
      )
    );
  }, []);

  const deleteArea = useCallback((id: string) => {
    setBrushAreasInternal((prev) => prev.filter((area) => area.id !== id));
    if (selectedAreaId === id) {
      setSelectedAreaId(null);
    }
  }, [selectedAreaId]);

  const toggleAreaVisibility = useCallback((id: string) => {
    setBrushAreasInternal((prev) =>
      prev.map((area) =>
        area.id === id ? { ...area, visible: !area.visible } : area
      )
    );
  }, []);

  const clearAllAreas = useCallback(() => {
    setBrushAreasInternal([]);
    setSelectedAreaId(null);
  }, []);

  const getAreasByTreatmentType = useCallback(
    (type: TreatmentAreaType) => {
      return brushAreas.filter((area) => area.treatmentType === type);
    },
    [brushAreas]
  );

  const getTotalAreaCount = useCallback(() => {
    return brushAreas.length;
  }, [brushAreas]);

  const getAreasWithZones = useCallback(() => {
    return brushAreas.filter((area) => area.detectedZone != null);
  }, [brushAreas]);

  const getAreasByZone = useCallback(
    (zoneId: string) => {
      return brushAreas.filter((area) => area.detectedZone?.zoneId === zoneId);
    },
    [brushAreas]
  );

  const updateAreaZone = useCallback(
    (areaId: string, zoneId: string, zoneName: string) => {
      setBrushAreasInternal((prev) =>
        prev.map((area) =>
          area.id === areaId
            ? {
                ...area,
                detectedZone: {
                  zoneId,
                  zoneName,
                  confidence: 1.0,
                  userOverridden: true,
                },
                updatedAt: new Date(),
              }
            : area
        )
      );
    },
    []
  );

  return {
    brushAreas,
    selectedAreaId,
    setBrushAreas,
    setSelectedAreaId,
    addArea,
    updateArea,
    deleteArea,
    toggleAreaVisibility,
    clearAllAreas,
    getAreasByTreatmentType,
    getTotalAreaCount,
    getAreasWithZones,
    getAreasByZone,
    updateAreaZone,
  };
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default BrushAreaTool;
