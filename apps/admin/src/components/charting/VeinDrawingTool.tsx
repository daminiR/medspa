'use client';

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef, CanvasPath } from 'react-sketch-canvas';
import { DraggablePanel } from './DraggablePanel';
import { useChartingTheme } from '@/contexts/ChartingThemeContext';
import {
  Trash2,
  Undo2,
  X,
  CheckCircle,
  Circle,
  Syringe,
} from 'lucide-react';

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
  /** Internal: stores the react-sketch-canvas path data for smooth rendering */
  canvasPath?: CanvasPath;
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
  /** Whether to show toolbar */
  showToolbar?: boolean;
  /** Zoom level for scaling */
  zoom?: number;
  /** View: which leg (for future multi-view support) */
  legView?: 'front' | 'back' | 'left' | 'right';
  /** Background image URL (optional) */
  backgroundImage?: string;
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

/**
 * Convert canvas path points to VeinPoints (for backwards compatibility)
 */
function canvasPathToVeinPoints(canvasPath: CanvasPath, containerWidth: number, containerHeight: number): VeinPoint[] {
  return canvasPath.paths.map(point => ({
    x: (point.x / containerWidth) * 100,
    y: (point.y / containerHeight) * 100,
    timestamp: Date.now(),
  }));
}

/**
 * Smooth points using Catmull-Rom splines for natural vein appearance
 * Used only for rendering existing paths in the overlay SVG
 */
function smoothPoints(points: VeinPoint[]): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let pathD = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];

    // Calculate control point for smooth bezier
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    pathD += ` Q ${p1.x} ${p1.y} ${midX} ${midY}`;
  }

  // Add final segment
  const last = points[points.length - 1];
  const secondLast = points[points.length - 2];
  pathD += ` Q ${secondLast.x} ${secondLast.y} ${last.x} ${last.y}`;

  return pathD;
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
// Uses react-sketch-canvas for smooth, professional drawing experience
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
      showToolbar = true,
      zoom = 1,
      legView = 'front',
      backgroundImage,
    },
    ref
  ) {
    // Refs
    const canvasRef = useRef<ReactSketchCanvasRef>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<SVGSVGElement>(null);

    // Drawing state
    const [isDrawing, setIsDrawing] = useState(false);

    // Track which vein paths have been loaded to canvas (by their ID)
    const loadedPathIdsRef = useRef<Set<string>>(new Set());

    // Track mapping from canvas path index to vein ID
    const canvasPathToVeinIdRef = useRef<Map<number, string>>(new Map());
    const nextCanvasPathIndexRef = useRef(0);

    // Tool settings
    const [veinType, setVeinType] = useState<VeinType>(initialVeinType);
    const [injectionMode, setInjectionMode] = useState(false);
    const [concentration, setConcentration] = useState('0.5%');

    const { theme } = useChartingTheme();
    const isDark = theme === 'dark';

    // Get current vein config
    const currentConfig = VEIN_TYPE_CONFIGS[veinType];

    // ==========================================================================
    // SYNC EXISTING PATHS TO CANVAS
    // Load existing vein paths into the canvas on mount or when paths change
    // ==========================================================================

    useEffect(() => {
      if (!canvasRef.current || !isActive) return;

      const loadExistingPaths = async () => {
        // Find paths that need to be loaded (have canvasPath data but not yet loaded)
        const pathsToLoad: CanvasPath[] = [];

        for (const vein of veinPaths) {
          if (vein.canvasPath && !loadedPathIdsRef.current.has(vein.id) && vein.visible) {
            pathsToLoad.push(vein.canvasPath);
            loadedPathIdsRef.current.add(vein.id);
          }
        }

        if (pathsToLoad.length > 0) {
          await canvasRef.current?.loadPaths(pathsToLoad);
        }
      };

      loadExistingPaths();
    }, [veinPaths, isActive]);

    // ==========================================================================
    // HANDLE STROKE COMPLETION
    // When a stroke is finished, create a VeinPath from it
    // ==========================================================================

    const handleStroke = useCallback(async () => {
      if (!canvasRef.current || !containerRef.current) return;

      setIsDrawing(false);

      // Get the latest paths from canvas
      const allCanvasPaths = await canvasRef.current.exportPaths();
      if (!allCanvasPaths || allCanvasPaths.length === 0) return;

      // The last path is the newly drawn one
      const newCanvasPath = allCanvasPaths[allCanvasPaths.length - 1];
      if (!newCanvasPath || newCanvasPath.paths.length < 2) return;

      // Get container dimensions for percentage conversion
      const rect = containerRef.current.getBoundingClientRect();

      // Convert canvas path to VeinPoints (as percentages)
      const veinPoints: VeinPoint[] = newCanvasPath.paths.map(point => ({
        x: (point.x / rect.width) * 100,
        y: (point.y / rect.height) * 100,
        timestamp: Date.now(),
      }));

      // Create new vein path
      const newVein: VeinPath = {
        id: generateId('vein'),
        points: veinPoints,
        veinType,
        treatmentStatus: 'untreated',
        injectionSites: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        visible: true,
        canvasPath: newCanvasPath, // Store the smooth canvas path
      };

      // Track this path
      canvasPathToVeinIdRef.current.set(nextCanvasPathIndexRef.current, newVein.id);
      loadedPathIdsRef.current.add(newVein.id);
      nextCanvasPathIndexRef.current++;

      onVeinPathsChange([...veinPaths, newVein]);
      onSelectionChange?.(null);
    }, [veinType, veinPaths, onVeinPathsChange, onSelectionChange]);

    // ==========================================================================
    // SELECTION & INJECTION HANDLING (via overlay)
    // ==========================================================================

    const handleOverlayClick = useCallback(
      (e: React.MouseEvent<SVGSVGElement>) => {
        if (!isActive || readOnly || !overlayRef.current) return;

        const rect = overlayRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
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
      },
      [isActive, readOnly, injectionMode, veinPaths, onSelectionChange]
    );

    // ==========================================================================
    // ACTION HANDLERS
    // ==========================================================================

    /**
     * Undo last vein
     */
    const handleUndo = useCallback(async () => {
      if (veinPaths.length === 0) return;

      // Remove from canvas
      await canvasRef.current?.undo();

      // Remove from vein paths
      const removedVein = veinPaths[veinPaths.length - 1];
      if (removedVein) {
        loadedPathIdsRef.current.delete(removedVein.id);
      }

      const newPaths = veinPaths.slice(0, -1);
      onVeinPathsChange(newPaths);
      onSelectionChange?.(null);
    }, [veinPaths, onVeinPathsChange, onSelectionChange]);

    /**
     * Clear all veins
     */
    const handleClearAll = useCallback(async () => {
      await canvasRef.current?.clearCanvas();
      loadedPathIdsRef.current.clear();
      canvasPathToVeinIdRef.current.clear();
      nextCanvasPathIndexRef.current = 0;
      onVeinPathsChange([]);
      onSelectionChange?.(null);
    }, [onVeinPathsChange, onSelectionChange]);

    /**
     * Toggle treatment status of a vein
     */
    const toggleTreatmentStatus = useCallback(
      (veinId: string) => {
        const updatedPaths = veinPaths.map((vein) => {
          if (vein.id === veinId) {
            return {
              ...vein,
              treatmentStatus:
                vein.treatmentStatus === 'treated' ? 'untreated' : 'treated',
              updatedAt: new Date(),
            } as VeinPath;
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
     */
    const handleDeleteSelected = useCallback(async () => {
      if (!selectedVeinId) return;

      // Find the index of the vein to remove
      const veinIndex = veinPaths.findIndex(v => v.id === selectedVeinId);
      if (veinIndex === -1) return;

      // We need to clear and reload all paths except the deleted one
      // This is necessary because react-sketch-canvas doesn't have a "delete specific path" API
      const remainingVeins = veinPaths.filter((vein) => vein.id !== selectedVeinId);
      const canvasPathsToReload: CanvasPath[] = [];

      // Reset tracking
      loadedPathIdsRef.current.clear();
      canvasPathToVeinIdRef.current.clear();
      nextCanvasPathIndexRef.current = 0;

      // Collect canvas paths from remaining veins
      for (const vein of remainingVeins) {
        if (vein.canvasPath && vein.visible) {
          canvasPathsToReload.push(vein.canvasPath);
          canvasPathToVeinIdRef.current.set(nextCanvasPathIndexRef.current, vein.id);
          loadedPathIdsRef.current.add(vein.id);
          nextCanvasPathIndexRef.current++;
        }
      }

      // Clear and reload
      await canvasRef.current?.clearCanvas();
      if (canvasPathsToReload.length > 0) {
        await canvasRef.current?.loadPaths(canvasPathsToReload);
      }

      onVeinPathsChange(remainingVeins);
      onSelectionChange?.(null);
    }, [selectedVeinId, veinPaths, onVeinPathsChange, onSelectionChange]);

    /**
     * Cancel current drawing
     */
    const handleCancelDraw = useCallback(() => {
      setIsDrawing(false);
      canvasRef.current?.undo();
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

        {/* Main smooth drawing canvas - using react-sketch-canvas */}
        {isActive && !injectionMode && !readOnly && (
          <div
            className="absolute inset-0 z-10"
            style={{
              // IMPORTANT: Use 'pinch-zoom' instead of 'none' to allow two-finger zoom gestures
              // to pass through to the parent FaceChartWithZoom component.
              // This ensures practitioners can ALWAYS zoom in/out regardless of which tool is active.
              touchAction: 'pinch-zoom'
            }}
          >
            <ReactSketchCanvas
              ref={canvasRef}
              width="100%"
              height="100%"
              strokeWidth={currentConfig.strokeWidth}
              strokeColor={currentConfig.color}
              canvasColor="transparent"
              style={{
                border: 'none',
                borderRadius: 0,
              }}
              svgStyle={{
                pointerEvents: 'all',
              }}
              exportWithBackgroundImage={false}
              withTimestamp={false}
              allowOnlyPointerType="all"
              onStroke={handleStroke}
            />
          </div>
        )}

        {/* Overlay SVG for selections, injection sites, and treatment indicators */}
        <svg
          ref={overlayRef}
          className={`absolute inset-0 w-full h-full z-20 ${
            injectionMode ? 'cursor-pointer' : 'pointer-events-none'
          }`}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          onClick={injectionMode ? handleOverlayClick : undefined}
        >
          {/* Render injection sites and treatment status for all veins */}
          {veinPaths.map((vein) => {
            if (!vein.visible) return null;
            const config = VEIN_TYPE_CONFIGS[vein.veinType];
            const isSelected = selectedVeinId === vein.id;

            return (
              <g key={vein.id}>
                {/* Selection highlight ring at start point */}
                {isSelected && vein.points.length > 0 && (
                  <circle
                    cx={vein.points[0].x}
                    cy={vein.points[0].y}
                    r={2}
                    fill="none"
                    stroke={config.color}
                    strokeWidth={0.5}
                    strokeDasharray="1,1"
                    opacity={0.8}
                  />
                )}

                {/* Injection site markers */}
                {vein.injectionSites.map((site) => (
                  <g key={site.id}>
                    <circle
                      cx={site.x}
                      cy={site.y}
                      r={1.2}
                      fill="#F97316"
                      stroke="#FFF"
                      strokeWidth={0.3}
                    />
                    <text
                      x={site.x + 1.5}
                      y={site.y - 0.5}
                      fontSize={2}
                      fill={isDark ? '#FFF' : '#333'}
                      className="pointer-events-none select-none"
                    >
                      {site.concentration}
                    </text>
                  </g>
                ))}

                {/* Treatment status indicator */}
                {vein.treatmentStatus === 'treated' && vein.points.length > 0 && (
                  <circle
                    cx={vein.points[0].x}
                    cy={vein.points[0].y}
                    r={1.5}
                    fill={config.treatedColor}
                    stroke="#FFF"
                    strokeWidth={0.3}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Click layer for selection (when not in drawing mode) */}
        {isActive && (injectionMode || readOnly) && (
          <div
            className="absolute inset-0 z-25"
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
                      if (injectionMode) {
                        addInjectionSiteToVein(vein.id, x, y);
                      } else {
                        onSelectionChange?.(vein.id);
                      }
                      return;
                    }
                  }
                }
              }
              onSelectionChange?.(null);
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
                  <Circle className="w-4 h-4" />
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
