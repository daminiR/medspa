'use client';

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';
import { Stage, Layer, Line, Circle, Text, Group } from 'react-konva';
import Konva from 'konva';
import { DraggablePanel } from './DraggablePanel';
import { useChartingTheme } from '@/contexts/ChartingThemeContext';
import {
  Trash2,
  Undo2,
  X,
  CheckCircle,
  Circle as CircleIcon,
  Syringe,
} from 'lucide-react';

// =============================================================================
// DEBUG FLAG - Set to true to enable verbose logging
// =============================================================================
const DEBUG_VEIN_DRAWING = true; // Temporarily enabled to debug delete issue

// =============================================================================
// TYPES
// =============================================================================

/**
 * Types of veins that can be drawn for sclerotherapy documentation
 * Simplified to 2 essential types for faster workflow
 */
export type VeinType = 'spider' | 'reticular';

/**
 * Treatment status for veins
 */
export type VeinTreatmentStatus = 'untreated' | 'treated';

/**
 * Configuration for each vein type
 */
export interface VeinTypeConfig {
  id: VeinType;
  name: string;
  description: string;
  color: string;           // Default untreated color
  treatedColor: string;    // Color when marked as treated
  strokeWidth: number;
  dashArray?: string;      // For varicose veins - dashed to show bulging
}

/**
 * A single point in a vein path
 */
export interface VeinPoint {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  pressure?: number;
  timestamp: number;
}

/**
 * Injection site marker on a vein
 */
export interface InjectionSite {
  id: string;
  veinId: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  concentration?: string;  // e.g., "0.25%", "0.5%", "1%"
  volume?: number;         // in mL
  notes?: string;
}

/**
 * Internal representation of a vein stroke in Konva
 */
interface KonvaVeinStroke {
  id: string;
  points: number[]; // Flattened [x1, y1, x2, y2, ...] in pixel coordinates
  veinType: VeinType;
  color: string;
  strokeWidth: number;
  /** Original points with pressure for export */
  originalPoints: Array<{ x: number; y: number; pressure?: number }>;
}

/**
 * A complete vein path
 */
export interface VeinPath {
  id: string;
  points: VeinPoint[];
  veinType: VeinType;
  treatmentStatus: VeinTreatmentStatus;
  injectionSites: InjectionSite[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  visible: boolean;
  /** Internal: stores the Konva stroke data for smooth rendering */
  konvaStroke?: KonvaVeinStroke;
}

/**
 * Zoom state for coordinating with parent zoom/pan container
 */
export interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

/**
 * Props for VeinDrawingTool
 */
export interface VeinDrawingToolProps {
  /** Whether the tool is active */
  isActive: boolean;
  /** Current vein paths */
  veinPaths: VeinPath[];
  /** Callback when paths change */
  onVeinPathsChange: (paths: VeinPath[]) => void;
  /** Currently selected vein ID */
  selectedVeinId?: string | null;
  /** Callback when selection changes */
  onSelectionChange?: (veinId: string | null) => void;
  /** Whether read-only mode */
  readOnly?: boolean;
  /** Initial vein type */
  initialVeinType?: VeinType;
  /** Controlled vein type (when controlled externally via RightDock) */
  veinType?: VeinType;
  /** Callback when vein type changes (for controlled mode) */
  onVeinTypeChange?: (type: VeinType) => void;
  /** Callback when undo is called (for external state tracking) */
  onUndo?: () => void;
  /** Callback when clear all is called (for external state tracking) */
  onClearAll?: () => void;
  /** Report whether undo is available (for external UI) */
  onCanUndoChange?: (canUndo: boolean) => void;
  /** Report whether currently drawing (for external UI) */
  onIsDrawingChange?: (isDrawing: boolean) => void;
  /** Whether to show toolbar */
  showToolbar?: boolean;
  /** Zoom level for scaling */
  zoom?: number;
  /** View: which leg (for future multi-view support) */
  legView?: 'front' | 'back' | 'left' | 'right';
  /** Background image URL (optional) */
  backgroundImage?: string;
  /**
   * Zoom state from parent (FaceChartWithZoom, etc.)
   * When provided, veins will transform to stay attached to the zoomed/panned chart.
   */
  zoomState?: ZoomState;
}

/**
 * Ref methods exposed by VeinDrawingTool
 */
export interface VeinDrawingToolRef {
  undo: () => void;
  clearAll: () => void;
  markSelectedAsTreated: () => void;
  addInjectionSite: (veinId: string, x: number, y: number) => void;
  exportPaths: () => VeinPath[];
}

/**
 * Props for the VeinDrawingToolbar
 */
export interface VeinDrawingToolbarProps {
  veinType: VeinType;
  onVeinTypeChange: (type: VeinType) => void;
  showInjectionMode: boolean;
  onInjectionModeChange: (enabled: boolean) => void;
  concentration: string;
  onConcentrationChange: (value: string) => void;
  onUndo?: () => void;
  onClearAll?: () => void;
  canUndo?: boolean;
  isVisible?: boolean;
  isDrawing: boolean;
  onCancelDraw?: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Vein type configurations with colors and stroke widths
 * Simplified to 2 types with distinct colors (red/blue)
 */
export const VEIN_TYPE_CONFIGS: Record<VeinType, VeinTypeConfig> = {
  spider: {
    id: 'spider',
    name: 'Spider',
    description: 'Small surface veins',
    color: '#DC2626',        // Red
    treatedColor: '#22C55E', // Green
    strokeWidth: 3,          // Optimized for smooth canvas rendering
  },
  reticular: {
    id: 'reticular',
    name: 'Reticular',
    description: 'Feeder veins (1-3mm)',
    color: '#3B82F6',        // Blue
    treatedColor: '#22C55E', // Green
    strokeWidth: 5,          // Optimized for smooth canvas rendering
  },
};

/**
 * Common sclerosant concentrations
 */
export const CONCENTRATION_OPTIONS = [
  '0.1%',
  '0.25%',
  '0.5%',
  '0.75%',
  '1%',
  '2%',
  '3%',
];

/**
 * Default volume options in mL
 */
export const VOLUME_OPTIONS = [0.1, 0.2, 0.3, 0.5, 1.0];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate unique ID
 */
function generateId(prefix: string = 'vein'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate distance between two points (for selection hit testing)
 */
function distanceBetweenPoints(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// =============================================================================
// LEG TEMPLATE SVG
// =============================================================================

/**
 * Simple leg outline SVG for background
 * Front view of legs showing common sclerotherapy treatment areas
 */
const LEG_TEMPLATE_PATH = `
  M 120 20
  C 100 20 85 40 80 80
  L 75 180
  Q 70 220 75 280
  L 80 400
  Q 75 440 80 500
  L 85 600
  Q 80 640 85 680
  L 75 750
  L 125 750
  L 115 680
  Q 120 640 115 600
  L 120 500
  Q 125 440 120 400
  L 125 280
  Q 130 220 125 180
  L 120 80
  C 125 40 140 20 120 20
  Z

  M 180 20
  C 160 20 175 40 180 80
  L 175 180
  Q 170 220 175 280
  L 180 400
  Q 175 440 180 500
  L 185 600
  Q 180 640 185 680
  L 175 750
  L 225 750
  L 215 680
  Q 220 640 215 600
  L 220 500
  Q 225 440 220 400
  L 225 280
  Q 230 220 225 180
  L 220 80
  C 225 40 200 20 180 20
  Z
`;

// =============================================================================
// VEIN DRAWING TOOLBAR COMPONENT
// =============================================================================

export function VeinDrawingToolbar({
  veinType,
  onVeinTypeChange,
  showInjectionMode,
  onInjectionModeChange,
  concentration,
  onConcentrationChange,
  onUndo,
  onClearAll,
  canUndo = false,
  isVisible = true,
  isDrawing,
  onCancelDraw,
}: VeinDrawingToolbarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLegend, setShowLegend] = useState(false); // Legend collapsed by default
  const [showAdvanced, setShowAdvanced] = useState(false); // Injection mode hidden by default
  const [defaultPosition, setDefaultPosition] = useState({ x: 16, y: 200 });

  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDefaultPosition({ x: 16, y: Math.min(200, window.innerHeight - 400) });
    }
  }, []);

  if (!isVisible) return null;

  return (
    <DraggablePanel
      panelId="vein-drawing-toolbar"
      initialPosition={defaultPosition}
      title="Sketch"
      variant="auto"
      onCollapse={() => setIsCollapsed(!isCollapsed)}
      isCollapsed={isCollapsed}
      minWidth={200}
    >
      <div className="space-y-3" style={{ pointerEvents: 'auto' }}>
        {/* Drawing indicator */}
        {isDrawing && (
          <div
            className={`flex items-center gap-2 p-2 rounded-lg ${
              isDark
                ? 'bg-blue-900/30 text-blue-400'
                : 'bg-blue-50 text-blue-700'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-medium">Drawing...</span>
            {onCancelDraw && (
              <button
                onClick={onCancelDraw}
                className={`ml-auto p-1 rounded-md transition-colors ${
                  isDark ? 'hover:bg-blue-900/50' : 'hover:bg-blue-100'
                }`}
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Simplified Vein Type Selector - 2 buttons side by side */}
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(VEIN_TYPE_CONFIGS) as VeinType[]).map((type) => {
            const config = VEIN_TYPE_CONFIGS[type];
            const isSelected = veinType === type;
            return (
              <button
                key={type}
                onClick={() => onVeinTypeChange(type)}
                className={`
                  flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg text-sm
                  transition-colors
                  ${
                    isSelected
                      ? isDark
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-800 ring-1 ring-blue-300'
                      : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {/* Vein preview line */}
                <svg width="36" height="8" className="flex-shrink-0">
                  <line
                    x1="2"
                    y1="4"
                    x2="34"
                    y2="4"
                    stroke={config.color}
                    strokeWidth={config.strokeWidth}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="font-medium text-xs">{config.name}</span>
              </button>
            );
          })}
        </div>

        {/* Quick tip */}
        <p
          className={`text-xs ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}
        >
          Draw to trace, click to select
        </p>

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
            <Undo2 className="w-4 h-4" />
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

        {/* Collapsible Advanced Section (Injection Mode) */}
        <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-2`}>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`w-full flex items-center justify-between text-xs ${
              isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
            }`}
          >
            <span>Advanced</span>
            <span>{showAdvanced ? '−' : '+'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-2 space-y-2">
              {/* Injection Mode Toggle */}
              <div className="flex items-center justify-between">
                <label className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Injection Sites
                </label>
                <button
                  onClick={() => onInjectionModeChange(!showInjectionMode)}
                  className={`
                    w-9 h-5 rounded-full transition-colors relative
                    ${
                      showInjectionMode
                        ? 'bg-green-500'
                        : isDark
                        ? 'bg-gray-600'
                        : 'bg-gray-300'
                    }
                  `}
                >
                  <div
                    className={`
                      absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
                      ${showInjectionMode ? 'left-4' : 'left-0.5'}
                    `}
                  />
                </button>
              </div>

              {/* Concentration (only when injection mode active) */}
              {showInjectionMode && (
                <div className="space-y-1">
                  <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Concentration
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {['0.25%', '0.5%', '1%', '2%'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => onConcentrationChange(opt)}
                        className={`
                          px-1.5 py-1 text-xs font-medium rounded transition-colors
                          ${
                            concentration === opt
                              ? isDark
                                ? 'bg-green-600 text-white'
                                : 'bg-green-100 text-green-700'
                              : isDark
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Collapsible Legend */}
        <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} pt-2`}>
          <button
            onClick={() => setShowLegend(!showLegend)}
            className={`w-full flex items-center justify-between text-xs ${
              isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'
            }`}
          >
            <span>Legend</span>
            <span>{showLegend ? '−' : '+'}</span>
          </button>

          {showLegend && (
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded" style={{ backgroundColor: VEIN_TYPE_CONFIGS.spider.color }} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Spider</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1 rounded" style={{ backgroundColor: VEIN_TYPE_CONFIGS.reticular.color }} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Reticular</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: VEIN_TYPE_CONFIGS.spider.treatedColor }} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Treated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Syringe className="w-3 h-3 text-orange-500" />
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Injection</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </DraggablePanel>
  );
}

// =============================================================================
// MAIN VEIN DRAWING TOOL COMPONENT
// Uses Konva for smooth, professional drawing experience with stylus support
// =============================================================================

export const VeinDrawingTool = forwardRef<VeinDrawingToolRef, VeinDrawingToolProps>(
  function VeinDrawingTool(
    {
      isActive,
      veinPaths,
      onVeinPathsChange,
      selectedVeinId,
      onSelectionChange,
      readOnly = false,
      initialVeinType = 'spider',
      veinType: controlledVeinType,
      onVeinTypeChange: onControlledVeinTypeChange,
      onUndo: onExternalUndo,
      onClearAll: onExternalClearAll,
      onCanUndoChange,
      onIsDrawingChange,
      showToolbar = true,
      zoom = 1,
      legView = 'front',
      backgroundImage,
      zoomState,
    },
    ref
  ) {
    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);

    // Drawing state
    const [isDrawing, setIsDrawing] = useState(false);
    const isDrawingRef = useRef(false);

    // Current stroke being drawn
    const [currentStroke, setCurrentStroke] = useState<KonvaVeinStroke | null>(null);

    // Track if multi-touch is happening (for zoom/pan passthrough)
    const [isMultiTouchActive, setIsMultiTouchActive] = useState(false);
    const touchCountRef = useRef(0);

    // Container dimensions
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Tool settings - support controlled mode for external state management (RightDock)
    const [internalVeinType, setInternalVeinType] = useState<VeinType>(initialVeinType);
    const veinType = controlledVeinType ?? internalVeinType;
    const setVeinType = useCallback((type: VeinType) => {
      if (onControlledVeinTypeChange) {
        onControlledVeinTypeChange(type);
      } else {
        setInternalVeinType(type);
      }
    }, [onControlledVeinTypeChange]);

    const [injectionMode, setInjectionMode] = useState(false);
    const [concentration, setConcentration] = useState('0.5%');

    // Ref to track current vein type (avoid stale closure)
    const veinTypeRef = useRef<VeinType>(veinType);

    // Ref to track current veinPaths (avoid stale closure in delete handler)
    const veinPathsRef = useRef<VeinPath[]>(veinPaths);

    const { theme } = useChartingTheme();
    const isDark = theme === 'dark';

    // Keep veinType ref updated
    useEffect(() => {
      veinTypeRef.current = veinType;
    }, [veinType]);

    // Keep veinPaths ref updated (critical for delete to work properly)
    useEffect(() => {
      veinPathsRef.current = veinPaths;
      if (DEBUG_VEIN_DRAWING) {
        console.log('[VeinDrawingTool] veinPaths updated, count:', veinPaths.length, 'ids:', veinPaths.map(v => v.id));
      }
    }, [veinPaths]);

    // Get current vein config
    const currentConfig = VEIN_TYPE_CONFIGS[veinType];

    // Track container size
    useEffect(() => {
      const updateDimensions = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          setDimensions({ width: rect.width, height: rect.height });
        }
      };

      updateDimensions();

      const resizeObserver = new ResizeObserver(updateDimensions);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => resizeObserver.disconnect();
    }, []);

    // ==========================================================================
    // CONVERT EXISTING VEIN PATHS TO KONVA STROKES
    // ==========================================================================

    const konvaStrokes = useMemo((): KonvaVeinStroke[] => {
      if (dimensions.width === 0 || dimensions.height === 0) return [];

      if (DEBUG_VEIN_DRAWING) {
        console.log('[VeinDrawingTool] konvaStrokes memo recomputing');
        console.log('[VeinDrawingTool] veinPaths input count:', veinPaths.length, 'ids:', veinPaths.map(v => v.id));
      }

      const strokes = veinPaths
        .filter(vein => vein.visible)
        .map(vein => {
          // If we have a stored konvaStroke, use it
          if (vein.konvaStroke) {
            return vein.konvaStroke;
          }

          // Otherwise, convert VeinPoints (percentages) to pixel coordinates
          const config = VEIN_TYPE_CONFIGS[vein.veinType];
          const points: number[] = [];
          const originalPoints: Array<{ x: number; y: number; pressure?: number }> = [];

          for (const point of vein.points) {
            const pixelX = (point.x / 100) * dimensions.width;
            const pixelY = (point.y / 100) * dimensions.height;
            points.push(pixelX, pixelY);
            originalPoints.push({ x: pixelX, y: pixelY, pressure: point.pressure });
          }

          return {
            id: vein.id,
            points,
            veinType: vein.veinType,
            color: vein.treatmentStatus === 'treated' ? config.treatedColor : config.color,
            strokeWidth: config.strokeWidth,
            originalPoints,
          };
        });

      if (DEBUG_VEIN_DRAWING) {
        console.log('[VeinDrawingTool] konvaStrokes output count:', strokes.length, 'ids:', strokes.map(s => s.id));
      }

      return strokes;
    }, [veinPaths, dimensions]);

    // ==========================================================================
    // POINTER EVENT HANDLERS - Stylus vs Touch Detection
    // ==========================================================================
    //
    // Key insight: PointerEvents have a `pointerType` property that tells us
    // exactly what type of input device is being used:
    // - "pen" = Apple Pencil or other stylus (SHOULD draw)
    // - "touch" = finger touch (should NOT draw, allows zoom/pan)
    // - "mouse" = mouse pointer (SHOULD draw for desktop testing)
    //
    // This is the cleanest way to implement pen-only drawing on tablets
    // while still supporting mouse for desktop development.
    // ==========================================================================

    const handlePointerDown = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
      if (readOnly || injectionMode) return;

      const evt = e.evt;

      // Only allow drawing with pen (stylus) or mouse (for desktop testing)
      // Reject touch events (fingers) to allow zoom/pan
      if (evt.pointerType === 'touch') {
        if (DEBUG_VEIN_DRAWING) {
          console.log('[VeinDrawingTool/Konva] Ignoring touch pointer for zoom/pan passthrough');
        }
        return;
      }

      // Prevent default to stop touch events from also firing
      evt.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      // Get pressure (Apple Pencil provides pressure in the range 0-1)
      const pressure = evt.pressure || 0.5;

      isDrawingRef.current = true;
      setIsDrawing(true);

      const config = VEIN_TYPE_CONFIGS[veinTypeRef.current];
      const newStroke: KonvaVeinStroke = {
        id: generateId('vein'),
        points: [pos.x, pos.y],
        veinType: veinTypeRef.current,
        color: config.color,
        strokeWidth: config.strokeWidth,
        originalPoints: [{ x: pos.x, y: pos.y, pressure }],
      };

      setCurrentStroke(newStroke);

      if (DEBUG_VEIN_DRAWING) {
        console.log('[VeinDrawingTool/Konva] Started stroke with', evt.pointerType, 'pressure:', pressure);
      }
    }, [readOnly, injectionMode]);

    const handlePointerMove = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
      if (!isDrawingRef.current || readOnly) return;

      const evt = e.evt;

      // Only continue drawing with pen or mouse
      if (evt.pointerType === 'touch') return;

      evt.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      const pressure = evt.pressure || 0.5;

      setCurrentStroke(prev => {
        if (!prev) return null;
        return {
          ...prev,
          points: [...prev.points, pos.x, pos.y],
          originalPoints: [...prev.originalPoints, { x: pos.x, y: pos.y, pressure }],
        };
      });
    }, [readOnly]);

    const handlePointerUp = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
      if (!isDrawingRef.current) return;

      const evt = e.evt;

      // Only finish drawing if we started with pen or mouse
      if (evt.pointerType === 'touch') return;

      isDrawingRef.current = false;
      setIsDrawing(false);

      if (currentStroke && currentStroke.points.length >= 4) {
        // Stroke has at least 2 points (4 values: x1,y1,x2,y2)

        // Convert pixel coordinates to percentages for VeinPath
        const veinPoints: VeinPoint[] = currentStroke.originalPoints.map(p => ({
          x: (p.x / dimensions.width) * 100,
          y: (p.y / dimensions.height) * 100,
          pressure: p.pressure,
          timestamp: Date.now(),
        }));

        // Create new vein path
        const newVein: VeinPath = {
          id: currentStroke.id,
          points: veinPoints,
          veinType: currentStroke.veinType,
          treatmentStatus: 'untreated',
          injectionSites: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          visible: true,
          konvaStroke: currentStroke, // Store the Konva stroke for smooth rendering
        };

        if (DEBUG_VEIN_DRAWING) {
          console.log('[VeinDrawingTool/Konva] Completed stroke:', {
            id: newVein.id,
            veinType: newVein.veinType,
            pointCount: veinPoints.length,
          });
        }

        onVeinPathsChange([...veinPaths, newVein]);
        onSelectionChange?.(null);
      }

      setCurrentStroke(null);
    }, [currentStroke, dimensions, veinPaths, onVeinPathsChange, onSelectionChange]);

    // ==========================================================================
    // TOUCH EVENT HANDLERS - For Zoom/Pan Passthrough
    // ==========================================================================
    //
    // Native touch events are used to detect multi-touch gestures.
    // When two fingers touch, we disable drawing and let events propagate
    // to the parent FaceChartWithZoom for zoom/pan handling.
    // ==========================================================================

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleTouchStart = (e: TouchEvent) => {
        touchCountRef.current = e.touches.length;

        if (e.touches.length >= 2) {
          // Multi-touch detected - disable drawing, allow zoom/pan
          setIsMultiTouchActive(true);
          isDrawingRef.current = false;
          setIsDrawing(false);
          setCurrentStroke(null);

          if (DEBUG_VEIN_DRAWING) {
            console.log('[VeinDrawingTool/Konva] Multi-touch detected, disabling drawing');
          }
        }
      };

      const handleTouchEnd = (e: TouchEvent) => {
        touchCountRef.current = e.touches.length;

        if (e.touches.length <= 1) {
          // Delay reset to prevent accidental strokes after gesture
          setTimeout(() => {
            setIsMultiTouchActive(false);
          }, 150);
        }
      };

      // Use passive: true to allow gestures to propagate
      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
      container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('touchcancel', handleTouchEnd);
      };
    }, []);

    // Reset multi-touch state when tool becomes active
    useEffect(() => {
      if (isActive) {
        touchCountRef.current = 0;
        setIsMultiTouchActive(false);
      }
    }, [isActive]);

    // ==========================================================================
    // SELECTION & INJECTION HANDLING
    // ==========================================================================

    const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!isActive || readOnly) return;
      if (isDrawingRef.current) return; // Don't select while drawing

      const stage = stageRef.current;
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      // Convert to percentage coordinates
      const x = (pos.x / dimensions.width) * 100;
      const y = (pos.y / dimensions.height) * 100;
      const clickPoint = { x, y };

      // If in injection mode, try to add injection site to clicked vein
      if (injectionMode) {
        for (const vein of [...veinPaths].reverse()) {
          if (vein.visible && vein.points.length > 0) {
            for (const veinPoint of vein.points) {
              const dist = distanceBetweenPoints(clickPoint, veinPoint);
              if (dist < 5) {
                addInjectionSiteToVein(vein.id, x, y);
                return;
              }
            }
          }
        }
        return;
      }

      // Check if clicking on existing vein for selection
      for (const vein of [...veinPaths].reverse()) {
        if (vein.visible && vein.points.length > 0) {
          for (const veinPoint of vein.points) {
            const dist = distanceBetweenPoints(clickPoint, veinPoint);
            if (dist < 5) {
              onSelectionChange?.(vein.id);
              return;
            }
          }
        }
      }

      // Clicked empty space - clear selection
      onSelectionChange?.(null);
    }, [isActive, readOnly, injectionMode, veinPaths, dimensions, onSelectionChange]);

    // ==========================================================================
    // ACTION HANDLERS
    // ==========================================================================

    /**
     * Undo last vein
     */
    const handleUndo = useCallback(() => {
      if (veinPaths.length === 0) return;

      const newPaths = veinPaths.slice(0, -1);
      onVeinPathsChange(newPaths);
      onSelectionChange?.(null);
      onExternalUndo?.(); // Notify parent

      if (DEBUG_VEIN_DRAWING) {
        console.log('[VeinDrawingTool/Konva] Undo, veins remaining:', newPaths.length);
      }
    }, [veinPaths, onVeinPathsChange, onSelectionChange, onExternalUndo]);

    /**
     * Clear all veins
     */
    const handleClearAll = useCallback(() => {
      onVeinPathsChange([]);
      onSelectionChange?.(null);
      onExternalClearAll?.(); // Notify parent

      if (DEBUG_VEIN_DRAWING) {
        console.log('[VeinDrawingTool/Konva] Cleared all veins');
      }
    }, [onVeinPathsChange, onSelectionChange, onExternalClearAll]);

    /**
     * Toggle treatment status of a vein
     */
    const toggleTreatmentStatus = useCallback(
      (veinId: string) => {
        const updatedPaths = veinPaths.map((vein) => {
          if (vein.id === veinId) {
            const newStatus: VeinTreatmentStatus =
              vein.treatmentStatus === 'treated' ? 'untreated' : 'treated';
            const config = VEIN_TYPE_CONFIGS[vein.veinType];

            // Update the konvaStroke color if present
            let updatedKonvaStroke = vein.konvaStroke;
            if (updatedKonvaStroke) {
              updatedKonvaStroke = {
                ...updatedKonvaStroke,
                color: newStatus === 'treated' ? config.treatedColor : config.color,
              };
            }

            return {
              ...vein,
              treatmentStatus: newStatus,
              updatedAt: new Date(),
              konvaStroke: updatedKonvaStroke,
            };
          }
          return vein;
        });
        onVeinPathsChange(updatedPaths);
      },
      [veinPaths, onVeinPathsChange]
    );

    /**
     * Add injection site to a vein
     */
    const addInjectionSiteToVein = useCallback(
      (veinId: string, x: number, y: number) => {
        const newSite: InjectionSite = {
          id: generateId('injection'),
          veinId,
          x,
          y,
          concentration,
          volume: 0.2,
        };

        const updatedPaths = veinPaths.map((vein) => {
          if (vein.id === veinId) {
            return {
              ...vein,
              injectionSites: [...vein.injectionSites, newSite],
              updatedAt: new Date(),
            };
          }
          return vein;
        });
        onVeinPathsChange(updatedPaths);
      },
      [veinPaths, onVeinPathsChange, concentration]
    );

    /**
     * Delete selected vein
     * Uses ref to ensure we're working with the current veinPaths, not a stale closure
     */
    const handleDeleteSelected = useCallback(() => {
      if (!selectedVeinId) return;

      // Use ref to get current veinPaths (avoids stale closure issues)
      const currentPaths = veinPathsRef.current;

      if (DEBUG_VEIN_DRAWING) {
        console.log('[VeinDrawingTool] handleDeleteSelected called');
        console.log('[VeinDrawingTool] selectedVeinId:', selectedVeinId);
        console.log('[VeinDrawingTool] veinPaths from ref BEFORE delete:', currentPaths.length, 'ids:', currentPaths.map(v => v.id));
      }

      const remainingVeins = currentPaths.filter((vein) => vein.id !== selectedVeinId);

      if (DEBUG_VEIN_DRAWING) {
        console.log('[VeinDrawingTool] veinPaths AFTER filter:', remainingVeins.length, 'ids:', remainingVeins.map(v => v.id));
        console.log('[VeinDrawingTool] Calling onVeinPathsChange with', remainingVeins.length, 'veins');
      }

      onVeinPathsChange(remainingVeins);
      onSelectionChange?.(null);

      if (DEBUG_VEIN_DRAWING) {
        console.log('[VeinDrawingTool/Konva] Deleted vein:', selectedVeinId);
      }
    }, [selectedVeinId, onVeinPathsChange, onSelectionChange]);

    /**
     * Cancel current drawing
     */
    const handleCancelDraw = useCallback(() => {
      setIsDrawing(false);
      isDrawingRef.current = false;
      setCurrentStroke(null);
    }, []);

    // ==========================================================================
    // IMPERATIVE HANDLE - Expose methods to parent
    // ==========================================================================

    useImperativeHandle(ref, () => ({
      undo: handleUndo,
      clearAll: handleClearAll,
      markSelectedAsTreated: () => {
        if (selectedVeinId) {
          toggleTreatmentStatus(selectedVeinId);
        }
      },
      addInjectionSite: (veinId: string, x: number, y: number) => {
        addInjectionSiteToVein(veinId, x, y);
      },
      exportPaths: () => veinPaths,
    }), [handleUndo, handleClearAll, selectedVeinId, toggleTreatmentStatus, addInjectionSiteToVein, veinPaths]);

    // ==========================================================================
    // EXTERNAL STATE CALLBACKS
    // Report state changes to parent for RightDock integration
    // ==========================================================================

    // Report canUndo state to parent
    const canUndo = veinPaths.length > 0;
    useEffect(() => {
      onCanUndoChange?.(canUndo);
    }, [canUndo, onCanUndoChange]);

    // Report isDrawing state to parent
    useEffect(() => {
      onIsDrawingChange?.(isDrawing);
    }, [isDrawing, onIsDrawingChange]);

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
        {/* Background leg template */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 300 800"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#3f3f46' : '#fef3c7'} />
              <stop offset="100%" stopColor={isDark ? '#27272a' : '#fcd34d'} />
            </linearGradient>
          </defs>
          <path
            d={LEG_TEMPLATE_PATH}
            fill="url(#skinGradient)"
            stroke={isDark ? '#52525b' : '#d97706'}
            strokeWidth="1"
            opacity={0.4}
          />
        </svg>

        {/* Main Konva canvas for drawing */}
        {isActive && !readOnly && dimensions.width > 0 && dimensions.height > 0 && (
          <div
            className="absolute inset-0 z-10"
            style={{
              // Allow touch events to pass through for zoom/pan when multi-touch
              touchAction: 'manipulation',
              // CRITICAL: Only capture pointer events when NOT in multi-touch mode
              // and only when not in injection mode (injection mode uses click handling)
              pointerEvents: isMultiTouchActive ? 'none' : (injectionMode ? 'none' : 'auto'),
            }}
          >
            <Stage
              ref={stageRef}
              width={dimensions.width}
              height={dimensions.height}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onClick={handleStageClick}
              onTap={handleStageClick}
              style={{
                // Ensure stage captures stylus events
                touchAction: 'none',
              }}
            >
              <Layer>
                {/* Render completed strokes */}
                {konvaStrokes.map((stroke) => {
                  const isSelected = selectedVeinId === stroke.id;
                  return (
                    <Line
                      key={stroke.id}
                      points={stroke.points}
                      stroke={stroke.color}
                      strokeWidth={stroke.strokeWidth}
                      lineCap="round"
                      lineJoin="round"
                      tension={0.5}
                      globalCompositeOperation="source-over"
                      shadowColor={isSelected ? stroke.color : undefined}
                      shadowBlur={isSelected ? 8 : 0}
                      shadowOpacity={isSelected ? 0.6 : 0}
                    />
                  );
                })}

                {/* Render current stroke being drawn */}
                {currentStroke && (
                  <Line
                    points={currentStroke.points}
                    stroke={currentStroke.color}
                    strokeWidth={currentStroke.strokeWidth}
                    lineCap="round"
                    lineJoin="round"
                    tension={0.5}
                    globalCompositeOperation="source-over"
                  />
                )}

                {/* Render injection sites */}
                {veinPaths.map((vein) => {
                  if (!vein.visible) return null;
                  return vein.injectionSites.map((site) => {
                    const pixelX = (site.x / 100) * dimensions.width;
                    const pixelY = (site.y / 100) * dimensions.height;
                    return (
                      <Group key={site.id}>
                        <Circle
                          x={pixelX}
                          y={pixelY}
                          radius={8}
                          fill="#F97316"
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        />
                        <Text
                          x={pixelX + 10}
                          y={pixelY - 6}
                          text={site.concentration || ''}
                          fontSize={12}
                          fill={isDark ? '#FFFFFF' : '#333333'}
                        />
                      </Group>
                    );
                  });
                })}

                {/* Render treatment status indicators */}
                {veinPaths.map((vein) => {
                  if (!vein.visible || vein.treatmentStatus !== 'treated' || vein.points.length === 0) {
                    return null;
                  }
                  const config = VEIN_TYPE_CONFIGS[vein.veinType];
                  const firstPoint = vein.points[0];
                  const pixelX = (firstPoint.x / 100) * dimensions.width;
                  const pixelY = (firstPoint.y / 100) * dimensions.height;
                  return (
                    <Circle
                      key={`treated-${vein.id}`}
                      x={pixelX}
                      y={pixelY}
                      radius={10}
                      fill={config.treatedColor}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  );
                })}

                {/* Render selection indicator */}
                {selectedVeinId && (() => {
                  const selectedVein = veinPaths.find(v => v.id === selectedVeinId);
                  if (!selectedVein || selectedVein.points.length === 0) return null;
                  const config = VEIN_TYPE_CONFIGS[selectedVein.veinType];
                  const firstPoint = selectedVein.points[0];
                  const pixelX = (firstPoint.x / 100) * dimensions.width;
                  const pixelY = (firstPoint.y / 100) * dimensions.height;
                  return (
                    <Circle
                      x={pixelX}
                      y={pixelY}
                      radius={14}
                      fill="transparent"
                      stroke={config.color}
                      strokeWidth={2}
                      dash={[4, 4]}
                    />
                  );
                })()}
              </Layer>
            </Stage>
          </div>
        )}

        {/* Click layer for injection mode */}
        {isActive && injectionMode && !readOnly && (
          <div
            className="absolute inset-0 z-25 cursor-pointer"
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => {
              const rect = containerRef.current?.getBoundingClientRect();
              if (!rect) return;
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;

              // Find clicked vein
              for (const vein of [...veinPaths].reverse()) {
                if (vein.visible && vein.points.length > 0) {
                  for (const point of vein.points) {
                    if (distanceBetweenPoints({ x, y }, point) < 5) {
                      addInjectionSiteToVein(vein.id, x, y);
                      return;
                    }
                  }
                }
              }
            }}
          />
        )}

        {/* Floating toolbar */}
        {isActive && showToolbar && (
          <VeinDrawingToolbar
            veinType={veinType}
            onVeinTypeChange={setVeinType}
            showInjectionMode={injectionMode}
            onInjectionModeChange={setInjectionMode}
            concentration={concentration}
            onConcentrationChange={setConcentration}
            onUndo={handleUndo}
            onClearAll={handleClearAll}
            canUndo={veinPaths.length > 0}
            isDrawing={isDrawing}
            onCancelDraw={handleCancelDraw}
          />
        )}

        {/* Selection controls */}
        {selectedVeinId && isActive && (
          <div
            className={`absolute top-2 right-2 flex gap-2 z-30 p-2 rounded-lg ${
              isDark ? 'bg-gray-800/90' : 'bg-white/90'
            } backdrop-blur-sm shadow-lg`}
          >
            <button
              onClick={() => toggleTreatmentStatus(selectedVeinId)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                veinPaths.find((v) => v.id === selectedVeinId)?.treatmentStatus ===
                'treated'
                  ? isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : isDark
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {veinPaths.find((v) => v.id === selectedVeinId)?.treatmentStatus ===
              'treated' ? (
                <>
                  <CircleIcon className="w-4 h-4" />
                  Mark Untreated
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Mark Treated
                </>
              )}
            </button>
            <button
              onClick={handleDeleteSelected}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                isDark
                  ? 'bg-red-900/50 text-red-400 hover:bg-red-900/70'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    );
  }
);

// =============================================================================
// HOOK FOR MANAGING VEIN PATH STATE
// =============================================================================

export interface UseVeinPathsStateOptions {
  initialPaths?: VeinPath[];
}

export interface UseVeinPathsStateReturn {
  veinPaths: VeinPath[];
  selectedVeinId: string | null;
  setVeinPaths: (paths: VeinPath[]) => void;
  setSelectedVeinId: (id: string | null) => void;
  addVein: (vein: VeinPath) => void;
  updateVein: (id: string, updates: Partial<VeinPath>) => void;
  deleteVein: (id: string) => void;
  toggleTreatmentStatus: (id: string) => void;
  addInjectionSite: (veinId: string, site: InjectionSite) => void;
  clearAllVeins: () => void;
  getVeinsByType: (type: VeinType) => VeinPath[];
  getTreatedVeins: () => VeinPath[];
  getUntreatedVeins: () => VeinPath[];
  getTotalInjectionSites: () => number;
}

export function useVeinPathsState({
  initialPaths = [],
}: UseVeinPathsStateOptions = {}): UseVeinPathsStateReturn {
  const [veinPaths, setVeinPathsInternal] = useState<VeinPath[]>(initialPaths);
  const [selectedVeinId, setSelectedVeinId] = useState<string | null>(null);

  const setVeinPaths = useCallback((paths: VeinPath[]) => {
    setVeinPathsInternal(paths);
  }, []);

  const addVein = useCallback((vein: VeinPath) => {
    setVeinPathsInternal((prev) => [...prev, vein]);
  }, []);

  const updateVein = useCallback((id: string, updates: Partial<VeinPath>) => {
    setVeinPathsInternal((prev) =>
      prev.map((vein) =>
        vein.id === id ? { ...vein, ...updates, updatedAt: new Date() } : vein
      )
    );
  }, []);

  const deleteVein = useCallback(
    (id: string) => {
      setVeinPathsInternal((prev) => prev.filter((vein) => vein.id !== id));
      if (selectedVeinId === id) {
        setSelectedVeinId(null);
      }
    },
    [selectedVeinId]
  );

  const toggleTreatmentStatus = useCallback((id: string) => {
    setVeinPathsInternal((prev) =>
      prev.map((vein) =>
        vein.id === id
          ? {
              ...vein,
              treatmentStatus:
                vein.treatmentStatus === 'treated' ? 'untreated' : 'treated',
              updatedAt: new Date(),
            }
          : vein
      )
    );
  }, []);

  const addInjectionSite = useCallback((veinId: string, site: InjectionSite) => {
    setVeinPathsInternal((prev) =>
      prev.map((vein) =>
        vein.id === veinId
          ? {
              ...vein,
              injectionSites: [...vein.injectionSites, site],
              updatedAt: new Date(),
            }
          : vein
      )
    );
  }, []);

  const clearAllVeins = useCallback(() => {
    setVeinPathsInternal([]);
    setSelectedVeinId(null);
  }, []);

  const getVeinsByType = useCallback(
    (type: VeinType) => {
      return veinPaths.filter((vein) => vein.veinType === type);
    },
    [veinPaths]
  );

  const getTreatedVeins = useCallback(() => {
    return veinPaths.filter((vein) => vein.treatmentStatus === 'treated');
  }, [veinPaths]);

  const getUntreatedVeins = useCallback(() => {
    return veinPaths.filter((vein) => vein.treatmentStatus === 'untreated');
  }, [veinPaths]);

  const getTotalInjectionSites = useCallback(() => {
    return veinPaths.reduce((total, vein) => total + vein.injectionSites.length, 0);
  }, [veinPaths]);

  return {
    veinPaths,
    selectedVeinId,
    setVeinPaths,
    setSelectedVeinId,
    addVein,
    updateVein,
    deleteVein,
    toggleTreatmentStatus,
    addInjectionSite,
    clearAllVeins,
    getVeinsByType,
    getTreatedVeins,
    getUntreatedVeins,
    getTotalInjectionSites,
  };
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default VeinDrawingTool;
