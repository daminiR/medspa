'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DraggablePanel } from './DraggablePanel';
import { useChartingTheme } from '@/contexts/ChartingThemeContext';
import { Trash2, Undo2, X } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

/**
 * A single point in a cannula path
 */
export interface CannulaPoint {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  timestamp: number;
}

/**
 * Cannula injection technique styles
 */
export type CannulaTechnique = 'linear' | 'fanning' | 'bolus';

/**
 * A complete cannula path with entry point and path line(s)
 */
export interface CannulaPath {
  id: string;
  entryPoint: CannulaPoint; // The puncture/entry point
  paths: CannulaPathSegment[]; // Multiple paths from same entry (for fanning)
  productId?: string;
  productColor: string;
  technique: CannulaTechnique;
  depositZones: DepositZone[]; // Markers along paths showing where product was deposited
  volume?: number; // Total volume deposited (mL)
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  locked: boolean;
  visible: boolean;
}

/**
 * A single path segment from the entry point
 */
export interface CannulaPathSegment {
  id: string;
  points: CannulaPoint[]; // Path from entry to endpoint
  direction?: string; // Optional: "superior", "inferior", "lateral", etc.
}

/**
 * Deposit zone marker along a path
 */
export interface DepositZone {
  id: string;
  pathSegmentId: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  volume?: number; // volume at this specific zone
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
 * Props for the CannulaPathTool component
 */
export interface CannulaPathToolProps {
  /** Whether the cannula tool is currently active */
  isActive: boolean;
  /** Current cannula paths */
  cannulaPaths: CannulaPath[];
  /** Callback when cannula paths change */
  onCannulaPathsChange: (paths: CannulaPath[]) => void;
  /** Currently selected path ID */
  selectedPathId?: string | null;
  /** Callback when selection changes */
  onSelectionChange?: (pathId: string | null) => void;
  /** Whether the canvas is read-only */
  readOnly?: boolean;
  /** Product color to use for new paths */
  productColor?: string;
  /** Product ID for the current product */
  productId?: string;
  /** Initial technique */
  initialTechnique?: CannulaTechnique;
  /** Callback when a cannula path is completed */
  onPathComplete?: (path: CannulaPath) => void;
  /** Whether to show the built-in floating toolbar (default: true) */
  showToolbar?: boolean;
  /** Container zoom level for scaling */
  zoom?: number;
  /**
   * Zoom state from parent (FaceChartWithZoom, etc.)
   * When provided, cannula paths will transform to stay attached to the zoomed/panned chart.
   */
  zoomState?: ZoomState;
}

/**
 * Props for the CannulaPathToolbar floating panel (simplified)
 */
export interface CannulaPathToolbarProps {
  technique: CannulaTechnique;
  onTechniqueChange: (technique: CannulaTechnique) => void;
  onUndo?: () => void;
  onClearAll?: () => void;
  canUndo?: boolean;
  isVisible?: boolean;
  isAddingPath: boolean;
  onCancelPath?: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Technique configurations - simplified for quick selection
 */
export const TECHNIQUE_CONFIGS: Record<CannulaTechnique, {
  name: string;
  icon: 'linear' | 'fan' | 'dots';
  lineStyle: 'solid' | 'dashed' | 'dotted';
}> = {
  linear: {
    name: 'Linear',
    icon: 'linear',
    lineStyle: 'solid',
  },
  fanning: {
    name: 'Fan',
    icon: 'fan',
    lineStyle: 'dashed',
  },
  bolus: {
    name: 'Bolus',
    icon: 'dots',
    lineStyle: 'dotted',
  },
};

/**
 * Default path width
 * Note: These values are in viewBox units (100x100) which scales 10x,
 * so smaller values are appropriate for medical charting precision.
 */
export const DEFAULT_PATH_WIDTH = 0.3;
export const MIN_PATH_WIDTH = 0.1;
export const MAX_PATH_WIDTH = 1.0;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate unique ID for cannula elements
 */
export function generateCannulaId(prefix: string = 'cannula'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get line dash pattern for technique
 */
export function getTechniqueDashPattern(technique: CannulaTechnique): string {
  switch (technique) {
    case 'linear':
      return '0'; // solid
    case 'fanning':
      return '8,4'; // dashed
    case 'bolus':
      return '2,4'; // dotted
    default:
      return '0';
  }
}

/**
 * Calculate distance between two points
 */
function distanceBetweenPoints(p1: CannulaPoint, p2: CannulaPoint): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// =============================================================================
// CANNULA PATH TOOLBAR COMPONENT
// =============================================================================

/**
 * Simplified icon for each technique
 */
function TechniqueIcon({ type, isSelected, isDark }: { type: 'linear' | 'fan' | 'dots'; isSelected: boolean; isDark: boolean }) {
  const color = isSelected ? (isDark ? 'white' : '#6B21A8') : (isDark ? '#9CA3AF' : '#6B7280');

  switch (type) {
    case 'linear':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
          <line x1="4" y1="10" x2="16" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx="4" cy="10" r="2" fill={color} />
          <polygon points="16,10 13,7 13,13" fill={color} />
        </svg>
      );
    case 'fan':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
          <circle cx="4" cy="10" r="2" fill={color} />
          <line x1="4" y1="10" x2="16" y2="5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="4" y1="10" x2="16" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="4" y1="10" x2="16" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'dots':
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" className="flex-shrink-0">
          <circle cx="4" cy="10" r="2" fill={color} />
          <line x1="4" y1="10" x2="16" y2="10" stroke={color} strokeWidth="1" strokeDasharray="2,2" />
          <circle cx="8" cy="10" r="1.5" fill={color} />
          <circle cx="12" cy="10" r="1.5" fill={color} />
          <circle cx="16" cy="10" r="1.5" fill={color} />
        </svg>
      );
  }
}

export function CannulaPathToolbar({
  technique,
  onTechniqueChange,
  onUndo,
  onClearAll,
  canUndo = false,
  isVisible = true,
  isAddingPath,
  onCancelPath,
}: CannulaPathToolbarProps) {
  const [defaultPosition, setDefaultPosition] = useState({ x: 16, y: 200 });

  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  // Adjust position on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDefaultPosition({ x: 16, y: Math.min(200, window.innerHeight - 250) });
    }
  }, []);

  if (!isVisible) return null;

  return (
    <DraggablePanel
      panelId="cannula-path-toolbar"
      initialPosition={defaultPosition}
      title="Cannula"
      variant="auto"
      minWidth={160}
    >
      <div className="space-y-3" style={{ pointerEvents: 'auto' }}>
        {/* Active drawing indicator - compact */}
        {isAddingPath && (
          <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs ${
            isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-700'
          }`}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>Drawing...</span>
            {onCancelPath && (
              <button
                onClick={onCancelPath}
                className="ml-auto p-0.5 rounded hover:bg-black/10"
                title="Cancel"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Technique Selector - Icon buttons in a row */}
        <div className="flex gap-1">
          {(Object.keys(TECHNIQUE_CONFIGS) as CannulaTechnique[]).map((tech) => {
            const config = TECHNIQUE_CONFIGS[tech];
            const isSelected = technique === tech;
            return (
              <button
                key={tech}
                onClick={() => onTechniqueChange(tech)}
                title={config.name}
                className={`
                  flex-1 flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs
                  transition-colors
                  ${
                    isSelected
                      ? isDark
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-purple-800 ring-1 ring-purple-300'
                      : isDark
                      ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <TechniqueIcon type={config.icon} isSelected={isSelected} isDark={isDark} />
                <span className="font-medium">{config.name}</span>
              </button>
            );
          })}
        </div>

        {/* Quick tip - minimal */}
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Tap entry + draw path. Tap same entry to fan.
        </p>

        {/* Action Buttons - compact */}
        <div className="flex gap-1.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            className={`
              flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium
              transition-colors
              ${
                canUndo
                  ? isDark
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : isDark
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
              }
            `}
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClearAll}
            title="Clear all"
            className={`
              flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium
              transition-colors
              ${
                isDark
                  ? 'bg-gray-700 text-red-400 hover:bg-gray-600'
                  : 'bg-gray-100 text-red-500 hover:bg-red-50'
              }
            `}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </DraggablePanel>
  );
}

// =============================================================================
// MAIN CANNULA PATH TOOL COMPONENT
// =============================================================================

export function CannulaPathTool({
  isActive,
  cannulaPaths,
  onCannulaPathsChange,
  selectedPathId,
  onSelectionChange,
  readOnly = false,
  productColor = '#F97316', // Default orange for filler
  productId,
  initialTechnique = 'linear',
  onPathComplete,
  showToolbar = true,
  zoom = 1,
  zoomState,
}: CannulaPathToolProps) {
  // Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentEntryPoint, setCurrentEntryPoint] = useState<CannulaPoint | null>(null);
  const [currentPathPoints, setCurrentPathPoints] = useState<CannulaPoint[]>([]);
  const [currentPathInProgress, setCurrentPathInProgress] = useState<CannulaPath | null>(null);

  // Tool settings - simplified: use smart defaults, no user configuration needed
  const [technique, setTechnique] = useState<CannulaTechnique>(initialTechnique);
  // Fixed smart defaults - no need for users to configure these
  const showArrowheads = true;
  const pathWidth = DEFAULT_PATH_WIDTH;

  // Track if we're adding a new path to an existing entry point
  const [addingToExistingPath, setAddingToExistingPath] = useState<string | null>(null);

  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  // ==========================================================================
  // POINTER EVENT HANDLERS
  // ==========================================================================

  /**
   * Get pointer position as percentage relative to SVG
   */
  const getPointerPosition = useCallback(
    (e: React.PointerEvent<SVGSVGElement>): CannulaPoint | null => {
      const svg = svgRef.current;
      if (!svg) return null;

      const rect = svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      return {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
        timestamp: Date.now(),
      };
    },
    []
  );

  // Track active touch count for two-finger gesture detection
  const touchCountRef = useRef(0);

  // Track if we're in a two-finger gesture (for canceling single-finger drawing)
  const isTwoFingerGestureRef = useRef(false);

  // State to toggle pointer-events during multi-touch gestures
  // This allows zoom/pan gestures to pass through to parent FaceChartWithZoom
  const [isMultiTouchActive, setIsMultiTouchActive] = useState(false);
  const isMultiTouchActiveRef = useRef(false);

  // Keep ref in sync with state for use in event handlers
  useEffect(() => {
    isMultiTouchActiveRef.current = isMultiTouchActive;
  }, [isMultiTouchActive]);

  /**
   * Handle pointer down - start drawing or select existing path
   * Works with touch, mouse, AND stylus (Apple Pencil)
   * Two-finger gestures pass through for zoom/pan
   */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!isActive || readOnly) return;

      // Track touch count for multi-touch detection
      if (e.pointerType === 'touch') {
        touchCountRef.current++;

        // If more than one finger, mark as two-finger gesture and let it bubble
        // This allows the parent FaceChartWithZoom to handle zoom/pan
        if (touchCountRef.current > 1) {
          isTwoFingerGestureRef.current = true;
          isMultiTouchActiveRef.current = true;
          setIsMultiTouchActive(true);
          // Cancel any in-progress drawing
          if (isDrawing) {
            setIsDrawing(false);
            setCurrentEntryPoint(null);
            setCurrentPathPoints([]);
            setAddingToExistingPath(null);
          }
          // Do NOT prevent default - let parent handle zoom/pan
          return;
        }
      }

      // Single finger/mouse/stylus - proceed with drawing
      // Only prevent default for single-touch to allow two-finger gestures
      if (e.pointerType !== 'touch' || touchCountRef.current === 1) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Capture the pointer to ensure we receive all subsequent events
      // This is critical for stylus/Apple Pencil support
      const target = e.currentTarget;
      if (target && typeof target.setPointerCapture === 'function') {
        try {
          target.setPointerCapture(e.pointerId);
        } catch {
          // Pointer capture may fail in some edge cases, continue anyway
        }
      }

      const point = getPointerPosition(e);
      if (!point) return;

      // Check if clicking near an existing entry point to add another path
      for (const path of cannulaPaths) {
        const entryDist = distanceBetweenPoints(point, path.entryPoint);
        if (entryDist < 3) { // Within 3% of entry point
          // Start adding a new path segment to this entry point
          setAddingToExistingPath(path.id);
          setCurrentEntryPoint(path.entryPoint);
          setCurrentPathPoints([path.entryPoint]);
          setIsDrawing(true);
          onSelectionChange?.(path.id);
          return;
        }
      }

      // Check if clicking on an existing path for selection
      for (const path of [...cannulaPaths].reverse()) {
        if (path.visible) {
          // Simple hit test - check if near entry point or any path segment
          const entryDist = distanceBetweenPoints(point, path.entryPoint);
          if (entryDist < 5) {
            onSelectionChange?.(path.id);
            return;
          }
          // Check path segments
          for (const segment of path.paths) {
            for (const segPoint of segment.points) {
              const segDist = distanceBetweenPoints(point, segPoint);
              if (segDist < 3) {
                onSelectionChange?.(path.id);
                return;
              }
            }
          }
        }
      }

      // Start new cannula path
      setCurrentEntryPoint(point);
      setCurrentPathPoints([point]);
      setIsDrawing(true);
      setAddingToExistingPath(null);
      onSelectionChange?.(null);
    },
    [isActive, readOnly, isDrawing, cannulaPaths, getPointerPosition, onSelectionChange]
  );

  /**
   * Handle pointer move - extend current path
   * Works with touch, mouse, AND stylus (Apple Pencil)
   * Two-finger gestures pass through for zoom/pan
   */
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      // If in a two-finger gesture, let it bubble for zoom/pan
      if (isTwoFingerGestureRef.current || (e.pointerType === 'touch' && touchCountRef.current > 1)) {
        // Do NOT prevent default - let parent handle zoom/pan
        return;
      }

      if (!isActive || !isDrawing || readOnly) return;

      // Only prevent default for single-touch/mouse/stylus drawing
      e.preventDefault();
      e.stopPropagation();
      const point = getPointerPosition(e);
      if (!point) return;

      // Only add point if moved minimum distance (performance)
      const lastPoint = currentPathPoints[currentPathPoints.length - 1];
      if (lastPoint) {
        const distance = distanceBetweenPoints(point, lastPoint);
        if (distance < 0.5) return; // Less than 0.5% movement, skip
      }

      setCurrentPathPoints((prev) => [...prev, point]);
    },
    [isActive, isDrawing, readOnly, currentPathPoints, getPointerPosition]
  );

  /**
   * Handle pointer up - complete path
   * Works with touch, mouse, AND stylus (Apple Pencil)
   * Two-finger gestures pass through for zoom/pan
   */
  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      // Track touch count for multi-touch detection
      if (e.pointerType === 'touch') {
        touchCountRef.current = Math.max(0, touchCountRef.current - 1);

        // Reset two-finger gesture flag when all fingers are lifted
        if (touchCountRef.current === 0) {
          // Delay reset to prevent accidental marks after gesture ends
          setTimeout(() => {
            isTwoFingerGestureRef.current = false;
            isMultiTouchActiveRef.current = false;
            setIsMultiTouchActive(false);
          }, 150);
        }
      }

      // If we were in a two-finger gesture, just let it pass through
      if (isTwoFingerGestureRef.current) {
        return;
      }

      if (!isActive || !isDrawing || readOnly) return;

      e.preventDefault();
      e.stopPropagation();

      // Release pointer capture
      const target = e.currentTarget;
      if (target && typeof target.releasePointerCapture === 'function') {
        try {
          target.releasePointerCapture(e.pointerId);
        } catch {
          // Release may fail if not captured, ignore
        }
      }

      setIsDrawing(false);

      // Need at least 2 points to form a path
      if (currentPathPoints.length < 2 || !currentEntryPoint) {
        setCurrentEntryPoint(null);
        setCurrentPathPoints([]);
        setAddingToExistingPath(null);
        return;
      }

      // Create path segment from points
      const newSegment: CannulaPathSegment = {
        id: generateCannulaId('segment'),
        points: currentPathPoints,
      };

      if (addingToExistingPath) {
        // Add segment to existing path
        const updatedPaths = cannulaPaths.map((path) => {
          if (path.id === addingToExistingPath) {
            return {
              ...path,
              paths: [...path.paths, newSegment],
              updatedAt: new Date(),
            };
          }
          return path;
        });
        onCannulaPathsChange(updatedPaths);
      } else {
        // Create new cannula path
        const newPath: CannulaPath = {
          id: generateCannulaId('cannula'),
          entryPoint: currentEntryPoint,
          paths: [newSegment],
          productId,
          productColor,
          technique,
          depositZones: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          locked: false,
          visible: true,
        };

        onCannulaPathsChange([...cannulaPaths, newPath]);
        onPathComplete?.(newPath);
      }

      // Reset drawing state
      setCurrentEntryPoint(null);
      setCurrentPathPoints([]);
      setAddingToExistingPath(null);
    },
    [
      isActive,
      isDrawing,
      readOnly,
      currentPathPoints,
      currentEntryPoint,
      addingToExistingPath,
      cannulaPaths,
      productId,
      productColor,
      technique,
      onCannulaPathsChange,
      onPathComplete,
    ]
  );

  /**
   * Handle pointer leave or cancel
   * Works with touch, mouse, AND stylus (Apple Pencil)
   * Also handles pointer cancel for multi-touch scenarios
   */
  const handlePointerLeave = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      // Track touch count for multi-touch detection
      if (e.pointerType === 'touch') {
        touchCountRef.current = Math.max(0, touchCountRef.current - 1);

        // Reset two-finger gesture flag when all fingers are lifted
        if (touchCountRef.current === 0) {
          // Delay reset to prevent accidental marks after gesture ends
          setTimeout(() => {
            isTwoFingerGestureRef.current = false;
            isMultiTouchActiveRef.current = false;
            setIsMultiTouchActive(false);
          }, 150);
        }
      }

      // If in two-finger gesture, don't interfere
      if (isTwoFingerGestureRef.current) {
        return;
      }

      // For stylus/pen, we may receive pointerleave even when captured
      // Only end drawing if we're actually drawing
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
   * Undo last cannula path
   */
  const handleUndo = useCallback(() => {
    if (cannulaPaths.length === 0) return;

    const lastPath = cannulaPaths[cannulaPaths.length - 1];

    // If last path has multiple segments, just remove the last segment
    if (lastPath.paths.length > 1) {
      const updatedPaths = cannulaPaths.map((path, idx) => {
        if (idx === cannulaPaths.length - 1) {
          return {
            ...path,
            paths: path.paths.slice(0, -1),
            updatedAt: new Date(),
          };
        }
        return path;
      });
      onCannulaPathsChange(updatedPaths);
    } else {
      // Remove entire path
      const newPaths = cannulaPaths.slice(0, -1);
      onCannulaPathsChange(newPaths);
    }
    onSelectionChange?.(null);
  }, [cannulaPaths, onCannulaPathsChange, onSelectionChange]);

  /**
   * Clear all cannula paths
   */
  const handleClearAll = useCallback(() => {
    onCannulaPathsChange([]);
    onSelectionChange?.(null);
    setCurrentEntryPoint(null);
    setCurrentPathPoints([]);
  }, [onCannulaPathsChange, onSelectionChange]);

  /**
   * Delete selected path
   */
  const handleDeleteSelected = useCallback(() => {
    if (!selectedPathId) return;
    const newPaths = cannulaPaths.filter((path) => path.id !== selectedPathId);
    onCannulaPathsChange(newPaths);
    onSelectionChange?.(null);
  }, [selectedPathId, cannulaPaths, onCannulaPathsChange, onSelectionChange]);

  /**
   * Cancel current path drawing
   */
  const handleCancelPath = useCallback(() => {
    setIsDrawing(false);
    setCurrentEntryPoint(null);
    setCurrentPathPoints([]);
    setAddingToExistingPath(null);
  }, []);

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  /**
   * Render entry point marker (X shape)
   *
   * Selection indicator design rationale:
   * - Uses a subtle static ring instead of pulsating animation
   * - Practitioners are mid-treatment and need calm, focused UI
   * - Constant animation is distracting and adds cognitive load
   * - The static ring clearly indicates selection without demanding attention
   */
  const renderEntryPoint = useCallback(
    (point: CannulaPoint, color: string, isSelected: boolean = false, scale: number = 1) => {
      const size = 6 * scale;
      const strokeWidth = 2 * scale;

      return (
        <g key={`entry-${point.x}-${point.y}`}>
          {/* Selection indicator - subtle static ring (no animation) */}
          {isSelected && (
            <circle
              cx={`${point.x}%`}
              cy={`${point.y}%`}
              r={size * 1.2}
              fill="none"
              stroke={color}
              strokeWidth={1.5 * scale}
              opacity={0.5}
            />
          )}
          {/* X marker */}
          <line
            x1={`calc(${point.x}% - ${size}px)`}
            y1={`calc(${point.y}% - ${size}px)`}
            x2={`calc(${point.x}% + ${size}px)`}
            y2={`calc(${point.y}% + ${size}px)`}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <line
            x1={`calc(${point.x}% + ${size}px)`}
            y1={`calc(${point.y}% - ${size}px)`}
            x2={`calc(${point.x}% - ${size}px)`}
            y2={`calc(${point.y}% + ${size}px)`}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Center dot */}
          <circle
            cx={`${point.x}%`}
            cy={`${point.y}%`}
            r={2 * scale}
            fill={color}
          />
        </g>
      );
    },
    []
  );

  /**
   * Render a path segment
   */
  const renderPathSegment = useCallback(
    (
      segment: CannulaPathSegment,
      color: string,
      tech: CannulaTechnique,
      width: number,
      showArrows: boolean,
      isSelected: boolean = false,
      scale: number = 1
    ) => {
      if (segment.points.length < 2) return null;

      // Build path string
      const pathPoints = segment.points;
      let pathD = `M ${pathPoints[0].x} ${pathPoints[0].y}`;

      for (let i = 1; i < pathPoints.length; i++) {
        pathD += ` L ${pathPoints[i].x} ${pathPoints[i].y}`;
      }

      const dashArray = getTechniqueDashPattern(tech);
      const effectiveWidth = width * scale;
      const arrowId = `arrow-${segment.id}`;

      // Calculate arrow position (end of path)
      const lastPoint = pathPoints[pathPoints.length - 1];
      const secondLastPoint = pathPoints[pathPoints.length - 2] || pathPoints[0];
      const angle = Math.atan2(
        lastPoint.y - secondLastPoint.y,
        lastPoint.x - secondLastPoint.x
      ) * (180 / Math.PI);

      return (
        <g key={segment.id}>
          {/* Arrow marker definition */}
          {showArrows && (
            <defs>
              <marker
                id={arrowId}
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path
                  d="M0,0 L0,6 L9,3 z"
                  fill={color}
                />
              </marker>
            </defs>
          )}

          {/* Selection highlight */}
          {isSelected && (
            <path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth={effectiveWidth + 4}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.3}
            />
          )}

          {/* Main path */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={effectiveWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={dashArray}
            markerEnd={showArrows ? `url(#${arrowId})` : undefined}
          />
        </g>
      );
    },
    []
  );

  /**
   * Render deposit zone markers
   */
  const renderDepositZone = useCallback(
    (zone: DepositZone, color: string, scale: number = 1) => {
      const size = 4 * scale;

      return (
        <g key={zone.id}>
          <circle
            cx={`${zone.x}%`}
            cy={`${zone.y}%`}
            r={size}
            fill={color}
            opacity={0.8}
          />
          <circle
            cx={`${zone.x}%`}
            cy={`${zone.y}%`}
            r={size * 0.5}
            fill="white"
          />
        </g>
      );
    },
    []
  );

  // Counter-scale for zoom
  const pointScale = 1 / zoom;

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
      {/* SVG Canvas for cannula paths */}
      <svg
        ref={svgRef}
        className={`absolute inset-0 w-full h-full ${
          isActive ? 'cursor-crosshair' : 'pointer-events-none'
        }`}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          // IMPORTANT: Use 'pinch-zoom' instead of 'none' to allow two-finger zoom gestures
          // to pass through to the parent FaceChartWithZoom component.
          // This ensures practitioners can ALWAYS zoom in/out regardless of which tool is active.
          touchAction: 'pinch-zoom',
          // CRITICAL: Disable pointer events when tool not active OR during two-finger gestures
          // This allows other tools to receive clicks and zoom gestures to pass through
          pointerEvents: !isActive ? 'none' : (isMultiTouchActive ? 'none' : 'auto'),
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerLeave}
      >
        {/* Render existing cannula paths */}
        {cannulaPaths.map((path) => {
          if (!path.visible) return null;
          const isSelected = selectedPathId === path.id;

          return (
            <g key={path.id}>
              {/* Entry point */}
              {renderEntryPoint(path.entryPoint, path.productColor, isSelected, pointScale)}

              {/* Path segments */}
              {path.paths.map((segment) =>
                renderPathSegment(
                  segment,
                  path.productColor,
                  path.technique,
                  pathWidth,
                  showArrowheads,
                  isSelected,
                  pointScale
                )
              )}

              {/* Deposit zones */}
              {path.depositZones.map((zone) =>
                renderDepositZone(zone, path.productColor, pointScale)
              )}
            </g>
          );
        })}

        {/* Render current drawing in progress */}
        {isDrawing && currentEntryPoint && currentPathPoints.length > 0 && (
          <g>
            {/* Entry point (only if new path) */}
            {!addingToExistingPath && (
              renderEntryPoint(currentEntryPoint, productColor, false, pointScale)
            )}

            {/* Current path preview */}
            {currentPathPoints.length >= 2 && (
              <path
                d={`M ${currentPathPoints.map(p => `${p.x} ${p.y}`).join(' L ')}`}
                fill="none"
                stroke={productColor}
                strokeWidth={pathWidth * pointScale}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={getTechniqueDashPattern(technique)}
                opacity={0.7}
              />
            )}
          </g>
        )}
      </svg>

      {/* Floating toolbar - minimal, focused on quick selection */}
      {isActive && showToolbar && (
        <CannulaPathToolbar
          technique={technique}
          onTechniqueChange={setTechnique}
          onUndo={handleUndo}
          onClearAll={handleClearAll}
          canUndo={cannulaPaths.length > 0}
          isAddingPath={isDrawing}
          onCancelPath={handleCancelPath}
        />
      )}

      {/* Selection controls */}
      {selectedPathId && isActive && (
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <button
            onClick={handleDeleteSelected}
            className="px-3 py-1.5 text-sm font-medium bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 transition-colors"
          >
            Delete Selected
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// HOOK FOR MANAGING CANNULA PATH STATE
// =============================================================================

export interface UseCannulaPathsStateOptions {
  initialPaths?: CannulaPath[];
}

export interface UseCannulaPathsStateReturn {
  cannulaPaths: CannulaPath[];
  selectedPathId: string | null;
  setCannulaPaths: (paths: CannulaPath[]) => void;
  setSelectedPathId: (id: string | null) => void;
  addPath: (path: CannulaPath) => void;
  updatePath: (id: string, updates: Partial<CannulaPath>) => void;
  deletePath: (id: string) => void;
  addPathSegment: (pathId: string, segment: CannulaPathSegment) => void;
  addDepositZone: (pathId: string, zone: DepositZone) => void;
  togglePathVisibility: (id: string) => void;
  clearAllPaths: () => void;
  getTotalVolume: () => number;
  getPathCount: () => number;
}

export function useCannulaPathsState({
  initialPaths = [],
}: UseCannulaPathsStateOptions = {}): UseCannulaPathsStateReturn {
  const [cannulaPaths, setCannulaPathsInternal] = useState<CannulaPath[]>(initialPaths);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);

  const setCannulaPaths = useCallback((paths: CannulaPath[]) => {
    setCannulaPathsInternal(paths);
  }, []);

  const addPath = useCallback((path: CannulaPath) => {
    setCannulaPathsInternal((prev) => [...prev, path]);
  }, []);

  const updatePath = useCallback((id: string, updates: Partial<CannulaPath>) => {
    setCannulaPathsInternal((prev) =>
      prev.map((path) =>
        path.id === id
          ? { ...path, ...updates, updatedAt: new Date() }
          : path
      )
    );
  }, []);

  const deletePath = useCallback((id: string) => {
    setCannulaPathsInternal((prev) => prev.filter((path) => path.id !== id));
    if (selectedPathId === id) {
      setSelectedPathId(null);
    }
  }, [selectedPathId]);

  const addPathSegment = useCallback((pathId: string, segment: CannulaPathSegment) => {
    setCannulaPathsInternal((prev) =>
      prev.map((path) =>
        path.id === pathId
          ? { ...path, paths: [...path.paths, segment], updatedAt: new Date() }
          : path
      )
    );
  }, []);

  const addDepositZone = useCallback((pathId: string, zone: DepositZone) => {
    setCannulaPathsInternal((prev) =>
      prev.map((path) =>
        path.id === pathId
          ? { ...path, depositZones: [...path.depositZones, zone], updatedAt: new Date() }
          : path
      )
    );
  }, []);

  const togglePathVisibility = useCallback((id: string) => {
    setCannulaPathsInternal((prev) =>
      prev.map((path) =>
        path.id === id ? { ...path, visible: !path.visible } : path
      )
    );
  }, []);

  const clearAllPaths = useCallback(() => {
    setCannulaPathsInternal([]);
    setSelectedPathId(null);
  }, []);

  const getTotalVolume = useCallback(() => {
    return cannulaPaths.reduce((total, path) => total + (path.volume || 0), 0);
  }, [cannulaPaths]);

  const getPathCount = useCallback(() => {
    return cannulaPaths.length;
  }, [cannulaPaths]);

  return {
    cannulaPaths,
    selectedPathId,
    setCannulaPaths,
    setSelectedPathId,
    addPath,
    updatePath,
    deletePath,
    addPathSegment,
    addDepositZone,
    togglePathVisibility,
    clearAllPaths,
    getTotalVolume,
    getPathCount,
  };
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default CannulaPathTool;
