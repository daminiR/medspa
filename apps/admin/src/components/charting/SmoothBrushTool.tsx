'use client';

import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import Konva from 'konva';
import { MapPin, X, ChevronDown } from 'lucide-react';
import { detectZoneFromStroke, detectMultipleZones, FACE_ZONE_DEFINITIONS, type DetectedZone } from './zoneDetection';

// =============================================================================
// DEBUG FLAG - Set to true to enable verbose logging for brush layer tracking
// =============================================================================
const DEBUG_BRUSH_LAYERS = true;

// =============================================================================
// KONVA GLOBAL PERFORMANCE SETTINGS
// =============================================================================
// Optimize for mobile/retina devices - reduce pixel ratio for better performance
// See: https://konvajs.org/docs/performance/All_Performance_Tips.html
// Note: Only apply this if drawing feels sluggish on retina devices
if (typeof window !== 'undefined') {
  // On high-DPI devices, Konva automatically scales up which can hurt performance
  // Setting pixelRatio to 1 trades visual crispness for better drawing speed
  // Uncomment the following line if performance is an issue on retina displays:
  // Konva.pixelRatio = 1;
}

// =============================================================================
// TYPES
// =============================================================================

export type TreatmentAreaType =
  | 'fractional_laser'
  | 'co2_laser'
  | 'ipl'
  | 'microneedling'
  | 'chemical_peel'
  | 'radiofrequency'
  | 'custom';

export interface TreatmentTypeConfig {
  id: TreatmentAreaType;
  name: string;
  color: string;
  defaultOpacity: number;
  description?: string;
}

export type BrushSize = 'small' | 'medium' | 'large';

/** A single point in a brush stroke with optional pressure */
interface BrushPoint {
  x: number;
  y: number;
  pressure?: number;
}

/** Internal representation of a brush stroke in Konva */
interface KonvaStroke {
  id: string;
  points: number[]; // Flattened [x1, y1, x2, y2, ...]
  treatmentType: TreatmentAreaType;
  color: string;
  strokeWidth: number;
  /** Original points with pressure for export */
  originalPoints: BrushPoint[];
}

/** CanvasPath format for compatibility with react-sketch-canvas exports */
export interface CanvasPath {
  drawMode: boolean;
  strokeColor: string;
  strokeWidth: number;
  paths: Array<{ x: number; y: number }>;
}

/** Extended path with treatment type metadata */
export interface BrushPath extends CanvasPath {
  treatmentType: TreatmentAreaType;
}

/** Paths grouped by treatment type */
export type BrushPathsByType = Partial<Record<TreatmentAreaType, CanvasPath[]>>;

export interface SmoothBrushToolRef {
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  clearByTreatmentType: (treatmentType: TreatmentAreaType) => void;
  exportPaths: () => Promise<CanvasPath[]>;
  exportPathsByType: () => Promise<BrushPathsByType>;
  exportImage: (imageType: 'png' | 'jpeg') => Promise<string>;
  getPathCountByType: () => Record<TreatmentAreaType, number>;
  /** Detect zones from ALL current brush strokes - call when user is done drawing */
  detectAllZones: () => Promise<DetectedZone[]>;
}

/**
 * Zoom state for coordinating with parent zoom/pan container
 */
export interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface SmoothBrushToolProps {
  /** Whether the brush tool is currently active */
  isActive: boolean;
  /** Current treatment type */
  treatmentType?: TreatmentAreaType;
  /** Treatment type configurations */
  treatmentTypes?: TreatmentTypeConfig[];
  /** Current brush size */
  brushSize?: BrushSize;
  /** @deprecated Opacity is ignored - we use 100% solid colors to prevent stacking */
  opacity?: number;
  /** Callback when drawing changes */
  onDrawingChange?: () => void;
  /** Callback when a stroke is completed with treatment type info */
  onStrokeComplete?: (treatmentType: TreatmentAreaType, pathCount: number) => void;
  /** Callback when paths by type change (for layer tracking) */
  onPathsByTypeChange?: (pathsByType: BrushPathsByType) => void;
  /** Callback when undo availability changes */
  onCanUndoChange?: (canUndo: boolean) => void;
  /** Whether the tool is read-only */
  readOnly?: boolean;
  /** Background image URL */
  backgroundImage?: string;
  /** Hidden treatment types (layers that are toggled off) */
  hiddenTreatmentTypes?: Set<TreatmentAreaType>;
  /** Enable automatic zone detection for brush strokes (default: false - use detectAllZones instead) */
  enableZoneDetection?: boolean;
  /** Show zone detection feedback labels (default: false - use summary modal instead) */
  showZoneFeedback?: boolean;
  /** Callback when a zone is detected for a single stroke (used with enableZoneDetection) */
  onZoneDetected?: (zoneName: string, confidence: number) => void;
  /** Callback when detectAllZones completes - receives all detected zones from all strokes */
  onAllZonesDetected?: (zones: DetectedZone[]) => void;
  /**
   * Zoom state from parent (FaceChartWithZoom, etc.)
   * When provided, brush strokes will transform to stay attached to the zoomed/panned chart.
   * NOTE: Zoom is handled by FaceChartWithZoom - this is read-only for applying transforms.
   */
  zoomState?: ZoomState;
}

// =============================================================================
// DEFAULT TREATMENT TYPES - Uniform colors with no opacity stacking
// =============================================================================

export const DEFAULT_TREATMENT_TYPES: TreatmentTypeConfig[] = [
  {
    id: 'fractional_laser',
    name: 'Fractional Laser',
    color: '#DC2626',
    defaultOpacity: 1.0,
    description: 'Non-ablative fractional resurfacing',
  },
  {
    id: 'co2_laser',
    name: 'CO2 Laser',
    color: '#EA580C',
    defaultOpacity: 1.0,
    description: 'Ablative CO2 laser resurfacing',
  },
  {
    id: 'ipl',
    name: 'IPL',
    color: '#F59E0B',
    defaultOpacity: 1.0,
    description: 'Intense pulsed light therapy',
  },
  {
    id: 'microneedling',
    name: 'Microneedling',
    color: '#9333EA',
    defaultOpacity: 1.0,
    description: 'Collagen induction therapy',
  },
  {
    id: 'chemical_peel',
    name: 'Chemical Peel',
    color: '#0891B2',
    defaultOpacity: 1.0,
    description: 'Chemical exfoliation treatment',
  },
  {
    id: 'radiofrequency',
    name: 'Radiofrequency',
    color: '#DB2777',
    defaultOpacity: 1.0,
    description: 'RF skin tightening',
  },
  {
    id: 'custom',
    name: 'Custom',
    color: '#4B5563',
    defaultOpacity: 1.0,
    description: 'Custom treatment area',
  },
];

// Brush size to stroke width mapping
const BRUSH_SIZE_TO_WIDTH: Record<BrushSize, number> = {
  small: 18,
  medium: 40,
  large: 70,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getTreatmentTypeConfig(
  typeId: TreatmentAreaType,
  customTypes?: TreatmentTypeConfig[]
): TreatmentTypeConfig {
  const types = customTypes || DEFAULT_TREATMENT_TYPES;
  return types.find((t) => t.id === typeId) || types[types.length - 1];
}

/** Generate a unique ID for strokes */
function generateStrokeId(): string {
  return `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/** Convert KonvaStroke to CanvasPath format for compatibility */
function konvaStrokeToCanvasPath(stroke: KonvaStroke): CanvasPath {
  return {
    drawMode: true,
    strokeColor: stroke.color,
    strokeWidth: stroke.strokeWidth,
    paths: stroke.originalPoints.map(p => ({ x: p.x, y: p.y })),
  };
}

// =============================================================================
// SMOOTH BRUSH TOOL COMPONENT - KONVA IMPLEMENTATION
// =============================================================================

export const SmoothBrushTool = forwardRef<SmoothBrushToolRef, SmoothBrushToolProps>(
  function SmoothBrushTool(
    {
      isActive,
      treatmentType = 'fractional_laser',
      treatmentTypes = DEFAULT_TREATMENT_TYPES,
      brushSize = 'medium',
      opacity: _opacity,
      onDrawingChange,
      onStrokeComplete,
      onPathsByTypeChange,
      onCanUndoChange,
      readOnly = false,
      hiddenTreatmentTypes,
      enableZoneDetection = false,
      showZoneFeedback = false,
      onZoneDetected,
      onAllZonesDetected,
      zoomState,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);

    // All strokes (history)
    const [strokes, setStrokes] = useState<KonvaStroke[]>([]);
    // Undo stack (strokes that were undone)
    const [undoneStrokes, setUndoneStrokes] = useState<KonvaStroke[]>([]);
    // Current stroke being drawn
    const [currentStroke, setCurrentStroke] = useState<KonvaStroke | null>(null);
    // Track if we're currently drawing
    const isDrawingRef = useRef(false);
    // Track the active pointer ID we're drawing with (to prevent accidental touches from stopping pen strokes)
    // This is the KEY FIX: we only respond to pointer events that match our active pointer
    const activePointerIdRef = useRef<number | null>(null);
    // Track if multi-touch is happening (for zoom/pan passthrough)
    // When multi-touch is active, we disable pointer events to let events bubble to parent
    // FaceChartWithZoom handles the actual zoom calculation
    const [isMultiTouchActive, setIsMultiTouchActive] = useState(false);
    const touchCountRef = useRef(0);

    // ==========================================================================
    // PERFORMANCE OPTIMIZATION: Point accumulation with batched updates
    // ==========================================================================
    // Instead of updating state on every pointermove (which causes a re-render),
    // we accumulate points in refs and sync to state at a throttled rate.
    // This dramatically reduces render calls during fast drawing.
    const pendingPointsRef = useRef<number[]>([]);
    const pendingOriginalPointsRef = useRef<BrushPoint[]>([]);
    const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const SYNC_INTERVAL_MS = 16; // ~60fps sync rate

    // Container dimensions
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Client-side mounting check - Konva requires client-side rendering
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
      setIsMounted(true);
    }, []);

    // Zone feedback state
    const [zoneFeedback, setZoneFeedback] = useState<{
      zoneName: string;
      position: { x: number; y: number };
      confidence: number;
    } | null>(null);
    const [zonePickerOpen, setZonePickerOpen] = useState(false);

    // Refs for callbacks to avoid stale closures
    const onCanUndoChangeRef = useRef(onCanUndoChange);
    const onPathsByTypeChangeRef = useRef(onPathsByTypeChange);
    const treatmentTypeRef = useRef<TreatmentAreaType>(treatmentType);

    // Keep refs updated
    useEffect(() => {
      onCanUndoChangeRef.current = onCanUndoChange;
    }, [onCanUndoChange]);

    useEffect(() => {
      onPathsByTypeChangeRef.current = onPathsByTypeChange;
    }, [onPathsByTypeChange]);

    useEffect(() => {
      treatmentTypeRef.current = treatmentType;
    }, [treatmentType]);

    // Track container size - ALWAYS run to capture dimensions even before tool is active
    // This ensures the Stage is ready to render immediately when tool becomes active
    useEffect(() => {
      const container = containerRef.current;

      const updateDimensions = () => {
        if (container) {
          const rect = container.getBoundingClientRect();
          if (DEBUG_BRUSH_LAYERS) {
            console.log('[SmoothBrushTool/Konva] Container dimensions update:', {
              width: rect.width,
              height: rect.height,
              isActive,
              isMounted,
              containerElement: container.tagName,
              containerClasses: container.className,
            });
          }
          if (rect.width > 0 && rect.height > 0) {
            setDimensions({ width: rect.width, height: rect.height });
          } else if (DEBUG_BRUSH_LAYERS) {
            console.warn('[SmoothBrushTool/Konva] WARNING: Container has zero dimensions!', {
              parentElement: container.parentElement?.tagName,
              parentWidth: container.parentElement?.clientWidth,
              parentHeight: container.parentElement?.clientHeight,
            });
          }
        } else if (DEBUG_BRUSH_LAYERS) {
          console.warn('[SmoothBrushTool/Konva] WARNING: containerRef.current is null');
        }
      };

      // Try multiple times to capture dimensions with increasing delays
      // This handles cases where the container hasn't fully rendered yet
      const timeouts = [0, 50, 100, 200, 500].map((delay, i) =>
        setTimeout(() => {
          if (DEBUG_BRUSH_LAYERS && i > 0) {
            console.log(`[SmoothBrushTool/Konva] Retry ${i} measuring dimensions (delay: ${delay}ms)`);
          }
          updateDimensions();
        }, delay)
      );

      const resizeObserver = new ResizeObserver((entries) => {
        if (DEBUG_BRUSH_LAYERS) {
          console.log('[SmoothBrushTool/Konva] ResizeObserver triggered', entries.length, 'entries');
        }
        updateDimensions();
      });

      if (container) {
        resizeObserver.observe(container);
        if (DEBUG_BRUSH_LAYERS) {
          console.log('[SmoothBrushTool/Konva] ResizeObserver attached to container');
        }
      }

      return () => {
        timeouts.forEach(clearTimeout);
        resizeObserver.disconnect();
      };
    }, [isActive, isMounted]);

    // Get current treatment config
    const currentTypeConfig = useMemo(
      () => getTreatmentTypeConfig(treatmentType, treatmentTypes),
      [treatmentType, treatmentTypes]
    );
    const strokeColor = currentTypeConfig.color;
    const strokeWidth = BRUSH_SIZE_TO_WIDTH[brushSize];

    // Compute paths by type for callbacks
    const pathsByType = useMemo((): BrushPathsByType => {
      const result: BrushPathsByType = {};
      for (const stroke of strokes) {
        if (!result[stroke.treatmentType]) {
          result[stroke.treatmentType] = [];
        }
        result[stroke.treatmentType]!.push(konvaStrokeToCanvasPath(stroke));
      }
      return result;
    }, [strokes]);

    // Notify parent of undo availability
    const canUndo = strokes.length > 0;
    const canRedo = undoneStrokes.length > 0;

    useEffect(() => {
      onCanUndoChangeRef.current?.(canUndo);
    }, [canUndo]);

    // Notify parent of paths by type changes
    const prevPathsByTypeRef = useRef<BrushPathsByType>({});
    useEffect(() => {
      const prevCounts = Object.entries(prevPathsByTypeRef.current).reduce<Record<string, number>>(
        (acc, [key, paths]) => {
          acc[key] = paths?.length || 0;
          return acc;
        },
        {}
      );
      const newCounts = Object.entries(pathsByType).reduce<Record<string, number>>(
        (acc, [key, paths]) => {
          acc[key] = paths?.length || 0;
          return acc;
        },
        {}
      );

      const countsChanged =
        Object.keys(newCounts).length !== Object.keys(prevCounts).length ||
        Object.entries(newCounts).some(([key, count]) => prevCounts[key] !== count);

      if (countsChanged) {
        prevPathsByTypeRef.current = pathsByType;
        if (DEBUG_BRUSH_LAYERS) {
          console.log('[SmoothBrushTool/Konva] pathsByType changed:', newCounts);
        }
        onPathsByTypeChangeRef.current?.(pathsByType);
      }
    }, [pathsByType]);

    // =============================================================================
    // POINTER EVENT HANDLERS - Stylus vs Touch Detection
    // =============================================================================
    //
    // Key insight: PointerEvents have a `pointerType` property that tells us
    // exactly what type of input device is being used:
    // - "pen" = Apple Pencil or other stylus (SHOULD draw)
    // - "touch" = finger touch (should NOT draw, allows zoom/pan)
    // - "mouse" = mouse pointer (should NOT draw for consistency)
    //
    // This is the cleanest way to implement pen-only drawing.
    // =============================================================================

    const handlePointerDown = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
      const evt = e.evt;

      if (DEBUG_BRUSH_LAYERS) {
        console.log('[SmoothBrushTool/Konva] handlePointerDown fired!', {
          pointerType: evt.pointerType,
          pointerId: evt.pointerId,
          readOnly,
          isMultiTouchActive,
          pressure: evt.pressure,
          activePointerId: activePointerIdRef.current,
        });
      }

      if (readOnly) {
        if (DEBUG_BRUSH_LAYERS) {
          console.log('[SmoothBrushTool/Konva] Blocked: readOnly is true');
        }
        return;
      }

      // Allow drawing with pen (stylus) OR mouse (for development/testing)
      // Touch input is blocked to allow two-finger zoom/pan gestures
      if (evt.pointerType === 'touch') {
        if (DEBUG_BRUSH_LAYERS) {
          console.log('[SmoothBrushTool/Konva] Ignoring touch pointer (reserved for zoom/pan)');
        }
        return;
      }

      // If we're already drawing with a different pointer, ignore this one
      // This prevents issues with multiple pointers interfering
      if (activePointerIdRef.current !== null && activePointerIdRef.current !== evt.pointerId) {
        if (DEBUG_BRUSH_LAYERS) {
          console.log('[SmoothBrushTool/Konva] Ignoring pointer - already drawing with different pointer', {
            activePointerId: activePointerIdRef.current,
            newPointerId: evt.pointerId,
          });
        }
        return;
      }

      // Prevent default to stop touch events from also firing
      evt.preventDefault();

      const stage = stageRef.current;
      if (!stage) {
        if (DEBUG_BRUSH_LAYERS) {
          console.log('[SmoothBrushTool/Konva] ERROR: stageRef.current is null!');
        }
        return;
      }

      const pos = stage.getPointerPosition();
      if (!pos) {
        if (DEBUG_BRUSH_LAYERS) {
          console.log('[SmoothBrushTool/Konva] ERROR: getPointerPosition() returned null!');
        }
        return;
      }

      // Get pressure (Apple Pencil provides pressure in the range 0-1)
      // Mouse clicks have pressure 0.5 as default
      const pressure = evt.pressure || 0.5;

      // CRITICAL: Track which pointer we're drawing with
      // This prevents accidental touches from interrupting pen strokes
      activePointerIdRef.current = evt.pointerId;
      isDrawingRef.current = true;

      const newStroke: KonvaStroke = {
        id: generateStrokeId(),
        points: [pos.x, pos.y],
        treatmentType: treatmentTypeRef.current,
        color: strokeColor,
        strokeWidth: strokeWidth,
        originalPoints: [{ x: pos.x, y: pos.y, pressure }],
      };

      setCurrentStroke(newStroke);
      // Clear redo stack when starting new stroke
      setUndoneStrokes([]);

      if (DEBUG_BRUSH_LAYERS) {
        console.log('[SmoothBrushTool/Konva] Started stroke:', {
          pointerType: evt.pointerType,
          pointerId: evt.pointerId,
          pressure,
          position: pos,
          color: strokeColor,
          width: strokeWidth,
          stageDimensions: dimensions,
          stageRef: stageRef.current ? 'attached' : 'null',
        });
      }
    }, [readOnly, strokeColor, strokeWidth, isMultiTouchActive, dimensions]);

    // Sync pending points to state (called at throttled intervals during drawing)
    const syncPendingPoints = useCallback(() => {
      if (pendingPointsRef.current.length === 0) return;

      const pointsToAdd = [...pendingPointsRef.current];
      const originalPointsToAdd = [...pendingOriginalPointsRef.current];

      // Clear pending refs
      pendingPointsRef.current = [];
      pendingOriginalPointsRef.current = [];

      setCurrentStroke(prev => {
        if (!prev) return null;
        return {
          ...prev,
          points: [...prev.points, ...pointsToAdd],
          originalPoints: [...prev.originalPoints, ...originalPointsToAdd],
        };
      });
    }, []);

    const handlePointerMove = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
      if (!isDrawingRef.current || readOnly) return;

      const evt = e.evt;

      // Only continue drawing with pen or mouse (not touch)
      if (evt.pointerType === 'touch') return;

      // CRITICAL FIX: Only process moves from our active pointer
      // This prevents accidental palm touches from interfering with stylus drawing
      if (activePointerIdRef.current !== null && evt.pointerId !== activePointerIdRef.current) {
        if (DEBUG_BRUSH_LAYERS) {
          console.log('[SmoothBrushTool/Konva] Ignoring pointer move - not our active pointer', {
            activePointerId: activePointerIdRef.current,
            eventPointerId: evt.pointerId,
          });
        }
        return;
      }

      evt.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      const pressure = evt.pressure || 0.5;

      // PERFORMANCE: Accumulate points in refs instead of updating state immediately
      // This reduces re-renders during fast drawing from potentially 100s to ~60/sec
      pendingPointsRef.current.push(pos.x, pos.y);
      pendingOriginalPointsRef.current.push({ x: pos.x, y: pos.y, pressure });

      // Schedule a throttled sync to state if not already scheduled
      if (!syncTimeoutRef.current) {
        syncTimeoutRef.current = setTimeout(() => {
          syncTimeoutRef.current = null;
          syncPendingPoints();
        }, SYNC_INTERVAL_MS);
      }
    }, [readOnly, syncPendingPoints]);

    const handlePointerUp = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
      const evt = e.evt;

      if (DEBUG_BRUSH_LAYERS) {
        console.log('[SmoothBrushTool/Konva] handlePointerUp fired!', {
          pointerType: evt.pointerType,
          pointerId: evt.pointerId,
          activePointerId: activePointerIdRef.current,
          isDrawing: isDrawingRef.current,
        });
      }

      // Only finish drawing with pen or mouse (not touch)
      if (evt.pointerType === 'touch') return;

      // CRITICAL FIX: Only finish if this is our active pointer
      // This prevents accidental touches from prematurely ending strokes
      if (activePointerIdRef.current !== null && evt.pointerId !== activePointerIdRef.current) {
        if (DEBUG_BRUSH_LAYERS) {
          console.log('[SmoothBrushTool/Konva] Ignoring pointer up - not our active pointer', {
            activePointerId: activePointerIdRef.current,
            eventPointerId: evt.pointerId,
          });
        }
        return;
      }

      if (!isDrawingRef.current) return;

      // Reset tracking state
      activePointerIdRef.current = null;
      isDrawingRef.current = false;

      // PERFORMANCE: Clear any pending sync timeout and immediately sync remaining points
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }

      // Get any remaining pending points that haven't been synced yet
      const finalPoints = [...pendingPointsRef.current];
      const finalOriginalPoints = [...pendingOriginalPointsRef.current];
      pendingPointsRef.current = [];
      pendingOriginalPointsRef.current = [];

      // Build the complete stroke with all points
      const completeStroke = currentStroke ? {
        ...currentStroke,
        points: [...currentStroke.points, ...finalPoints],
        originalPoints: [...currentStroke.originalPoints, ...finalOriginalPoints],
      } : null;

      if (completeStroke && completeStroke.points.length >= 4) {
        // Stroke has at least 2 points (4 values: x1,y1,x2,y2)
        setStrokes(prev => [...prev, completeStroke]);

        if (DEBUG_BRUSH_LAYERS) {
          console.log('[SmoothBrushTool/Konva] Completed stroke:', {
            id: completeStroke.id,
            treatmentType: completeStroke.treatmentType,
            pointCount: completeStroke.points.length / 2,
          });
        }

        onDrawingChange?.();
        onStrokeComplete?.(completeStroke.treatmentType, strokes.length + 1);

        // Zone detection
        if (enableZoneDetection && containerRef.current) {
          const points = completeStroke.originalPoints.map(p => ({
            x: p.x,
            y: p.y,
            pressure: p.pressure || 0.5,
            timestamp: Date.now(),
          }));

          const rect = containerRef.current.getBoundingClientRect();
          const detectedZone = detectZoneFromStroke(points, rect.width, rect.height);

          if (detectedZone && showZoneFeedback) {
            const centroid = points.reduce(
              (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
              { x: 0, y: 0 }
            );
            centroid.x /= points.length;
            centroid.y /= points.length;

            setZoneFeedback({
              zoneName: detectedZone.zoneName,
              position: { x: centroid.x, y: centroid.y - 30 },
              confidence: detectedZone.confidence,
            });

            onZoneDetected?.(detectedZone.zoneName, detectedZone.confidence);

            setTimeout(() => setZoneFeedback(null), 2000);
          }
        }
      }

      setCurrentStroke(null);
    }, [currentStroke, strokes.length, enableZoneDetection, showZoneFeedback, onDrawingChange, onStrokeComplete, onZoneDetected]);

    // Handle pointer cancel events (e.g., when system takes over, palm rejection kicks in late, etc.)
    // This ensures strokes are properly finalized even when the pointer is unexpectedly lost
    const handlePointerCancel = useCallback((e: Konva.KonvaEventObject<PointerEvent>) => {
      const evt = e.evt;

      if (DEBUG_BRUSH_LAYERS) {
        console.log('[SmoothBrushTool/Konva] handlePointerCancel fired!', {
          pointerType: evt.pointerType,
          pointerId: evt.pointerId,
          activePointerId: activePointerIdRef.current,
          isDrawing: isDrawingRef.current,
        });
      }

      // Only handle cancel for our active pointer
      if (activePointerIdRef.current === null || evt.pointerId !== activePointerIdRef.current) {
        return;
      }

      if (!isDrawingRef.current) {
        // Just reset the active pointer
        activePointerIdRef.current = null;
        return;
      }

      // Reset tracking state
      activePointerIdRef.current = null;
      isDrawingRef.current = false;

      // Clear any pending sync
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }

      // Sync remaining points
      const finalPoints = [...pendingPointsRef.current];
      const finalOriginalPoints = [...pendingOriginalPointsRef.current];
      pendingPointsRef.current = [];
      pendingOriginalPointsRef.current = [];

      // Try to save what we have
      const partialStroke = currentStroke ? {
        ...currentStroke,
        points: [...currentStroke.points, ...finalPoints],
        originalPoints: [...currentStroke.originalPoints, ...finalOriginalPoints],
      } : null;

      if (partialStroke && partialStroke.points.length >= 4) {
        setStrokes(prev => [...prev, partialStroke]);
        if (DEBUG_BRUSH_LAYERS) {
          console.log('[SmoothBrushTool/Konva] Saved partial stroke on cancel:', {
            id: partialStroke.id,
            pointCount: partialStroke.points.length / 2,
          });
        }
        onDrawingChange?.();
      }

      setCurrentStroke(null);
    }, [currentStroke, onDrawingChange]);

    // =============================================================================
    // TOUCH EVENT HANDLERS - For Zoom/Pan Passthrough
    // =============================================================================
    //
    // IMPORTANT: Touch events and Pointer events are SEPARATE event systems!
    //
    // - TouchEvents: Used for multi-finger gestures (pinch-zoom, pan)
    // - PointerEvents: Used for stylus/pen drawing (Apple Pencil)
    //
    // When two fingers touch, we enable zoom/pan mode but we DO NOT stop any
    // ongoing pen strokes. This is critical because:
    // 1. Palm rejection isn't perfect - accidental touches happen while drawing
    // 2. The pen uses PointerEvents which are separate from TouchEvents
    // 3. Stopping pen strokes on multi-touch was THE BUG causing "brush works then stops"
    //
    // The activePointerIdRef tracking in the Pointer event handlers ensures
    // only the correct pointer can continue/complete a stroke.
    // =============================================================================

    // =========================================================================
    // TOUCH EVENT HANDLERS - For Zoom/Pan Passthrough (Pattern: ArrowTool)
    // =========================================================================
    // Multi-touch detection ONLY - zoom calculation is handled by FaceChartWithZoom
    // When multi-touch is detected:
    //   1. Set isMultiTouchActive to disable pointer events
    //   2. Let touch events bubble to parent for zoom/pan handling
    //   3. Do NOT calculate zoom ourselves - parent handles that
    // =========================================================================

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleTouchStart = (e: TouchEvent) => {
        touchCountRef.current = e.touches.length;

        // If two or more fingers, this is a zoom/pan gesture
        // Let it bubble to parent - do NOT prevent default
        if (e.touches.length >= 2) {
          setIsMultiTouchActive(true);

          // CRITICAL: Do NOT stop pen drawing when multi-touch occurs!
          // Pen uses PointerEvents which are separate from TouchEvents.
          // This prevents palm touches from interrupting stylus strokes.

          if (DEBUG_BRUSH_LAYERS) {
            console.log('[SmoothBrushTool/Konva] Multi-touch detected, disabling pointer events for zoom passthrough', {
              isCurrentlyDrawing: isDrawingRef.current,
              activePointerId: activePointerIdRef.current,
              note: 'Letting events bubble to FaceChartWithZoom for zoom handling',
            });
          }
        }
        // Single finger: let pointer events handle it (they fire after touch events)
      };

      const handleTouchMove = (e: TouchEvent) => {
        // If two or more fingers, this is a zoom/pan gesture
        // DO NOT call preventDefault() - let it bubble for zoom/pan
        // FaceChartWithZoom handles the actual zoom calculation
        // Single finger drawing is handled by pointer events
      };

      const handleTouchEnd = (e: TouchEvent) => {
        touchCountRef.current = e.touches.length;

        // Reset flag when all fingers are lifted
        if (e.touches.length <= 1) {
          // Delay reset to prevent accidental marks after gesture ends
          setTimeout(() => {
            setIsMultiTouchActive(false);
          }, 150);
        }
      };

      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
      container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('touchcancel', handleTouchEnd);
      };
    }, []);

    // Reset state when tool becomes active/inactive
    useEffect(() => {
      if (isActive) {
        // Reset multi-touch and pointer tracking when becoming active
        touchCountRef.current = 0;
        setIsMultiTouchActive(false);
        activePointerIdRef.current = null;
        isDrawingRef.current = false;
      } else {
        // Reset drawing state when becoming inactive
        // This ensures we don't have orphaned drawing state
        activePointerIdRef.current = null;
        isDrawingRef.current = false;
        // Don't clear currentStroke here - it will be cleared naturally
      }
    }, [isActive]);

    // PERFORMANCE: Cleanup sync timeout on unmount to prevent memory leaks
    useEffect(() => {
      return () => {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
          syncTimeoutRef.current = null;
        }
      };
    }, []);

    // =============================================================================
    // REF METHODS - Undo, Redo, Clear, Export
    // =============================================================================

    const handleUndo = useCallback(() => {
      if (strokes.length === 0) return;

      const lastStroke = strokes[strokes.length - 1];
      setStrokes(prev => prev.slice(0, -1));
      setUndoneStrokes(prev => [...prev, lastStroke]);
      onDrawingChange?.();

      if (DEBUG_BRUSH_LAYERS) {
        console.log('[SmoothBrushTool/Konva] Undo, strokes remaining:', strokes.length - 1);
      }
    }, [strokes, onDrawingChange]);

    const handleRedo = useCallback(() => {
      if (undoneStrokes.length === 0) return;

      const strokeToRedo = undoneStrokes[undoneStrokes.length - 1];
      setUndoneStrokes(prev => prev.slice(0, -1));
      setStrokes(prev => [...prev, strokeToRedo]);
      onDrawingChange?.();

      if (DEBUG_BRUSH_LAYERS) {
        console.log('[SmoothBrushTool/Konva] Redo, strokes now:', strokes.length + 1);
      }
    }, [undoneStrokes, strokes.length, onDrawingChange]);

    const handleClearAll = useCallback(() => {
      setStrokes([]);
      setUndoneStrokes([]);
      setCurrentStroke(null);
      onDrawingChange?.();

      if (DEBUG_BRUSH_LAYERS) {
        console.log('[SmoothBrushTool/Konva] Cleared all strokes');
      }
    }, [onDrawingChange]);

    const clearByTreatmentType = useCallback((typeToRemove: TreatmentAreaType) => {
      setStrokes(prev => prev.filter(s => s.treatmentType !== typeToRemove));
      onDrawingChange?.();

      if (DEBUG_BRUSH_LAYERS) {
        console.log('[SmoothBrushTool/Konva] Cleared strokes for type:', typeToRemove);
      }
    }, [onDrawingChange]);

    const handleExportPaths = useCallback(async (): Promise<CanvasPath[]> => {
      return strokes.map(konvaStrokeToCanvasPath);
    }, [strokes]);

    const handleExportPathsByType = useCallback(async (): Promise<BrushPathsByType> => {
      return pathsByType;
    }, [pathsByType]);

    const handleExportImage = useCallback(async (imageType: 'png' | 'jpeg'): Promise<string> => {
      const stage = stageRef.current;
      if (!stage) return '';

      const mimeType = imageType === 'jpeg' ? 'image/jpeg' : 'image/png';
      return stage.toDataURL({ mimeType });
    }, []);

    const getPathCountByType = useCallback((): Record<TreatmentAreaType, number> => {
      const counts: Record<TreatmentAreaType, number> = {
        fractional_laser: 0,
        co2_laser: 0,
        ipl: 0,
        microneedling: 0,
        chemical_peel: 0,
        radiofrequency: 0,
        custom: 0,
      };

      for (const stroke of strokes) {
        counts[stroke.treatmentType]++;
      }

      return counts;
    }, [strokes]);

    const detectAllZones = useCallback(async (): Promise<DetectedZone[]> => {
      if (strokes.length === 0) return [];

      const container = containerRef.current;
      if (!container) return [];

      const rect = container.getBoundingClientRect();

      // Collect ALL points from ALL strokes
      const allPoints: Array<{ x: number; y: number; pressure: number; timestamp: number }> = [];

      for (const stroke of strokes) {
        for (const p of stroke.originalPoints) {
          allPoints.push({
            x: p.x,
            y: p.y,
            pressure: p.pressure || 0.5,
            timestamp: Date.now(),
          });
        }
      }

      if (allPoints.length === 0) return [];

      const detectedZones = detectMultipleZones(allPoints, rect.width, rect.height, 0.05);
      onAllZonesDetected?.(detectedZones);

      return detectedZones;
    }, [strokes, onAllZonesDetected]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      undo: handleUndo,
      redo: handleRedo,
      clearAll: handleClearAll,
      clearByTreatmentType,
      exportPaths: handleExportPaths,
      exportPathsByType: handleExportPathsByType,
      exportImage: handleExportImage,
      getPathCountByType,
      detectAllZones,
    }), [handleUndo, handleRedo, handleClearAll, clearByTreatmentType, handleExportPaths, handleExportPathsByType, handleExportImage, getPathCountByType, detectAllZones]);

    // =============================================================================
    // VISIBLE STROKES - Filter by hidden treatment types
    // =============================================================================

    const visibleStrokes = useMemo(() => {
      if (!hiddenTreatmentTypes || hiddenTreatmentTypes.size === 0) {
        return strokes;
      }
      return strokes.filter(s => !hiddenTreatmentTypes.has(s.treatmentType));
    }, [strokes, hiddenTreatmentTypes]);

    // =============================================================================
    // RENDER
    // =============================================================================

    if (DEBUG_BRUSH_LAYERS) {
      console.log('[SmoothBrushTool/Konva] Render check:', {
        isActive,
        readOnly,
        isMounted,
        dimensions,
        willRenderStage: isMounted && dimensions.width > 0 && dimensions.height > 0,
        strokesCount: strokes.length,
        currentStroke: currentStroke ? `drawing (${currentStroke.points.length / 2} points)` : 'none',
        isMultiTouchActive,
        containerRef: containerRef.current ? 'attached' : 'null',
      });
    }

    // Additional debug: log why Stage might not render
    if (DEBUG_BRUSH_LAYERS && isActive && !(isMounted && dimensions.width > 0 && dimensions.height > 0)) {
      console.warn('[SmoothBrushTool/Konva] Stage will NOT render! Conditions:', {
        isMounted,
        'dimensions.width > 0': dimensions.width > 0,
        'dimensions.height > 0': dimensions.height > 0,
        dimensionValues: dimensions,
      });
    }

    // CRITICAL FIX: Always render the container div to allow dimension capture
    // Only the content inside (Stage) is conditionally rendered based on isActive
    // This ensures dimensions are captured before the tool becomes active
    return (
      <div
        ref={containerRef}
        className={`absolute inset-0 z-20 ${!isActive || readOnly ? 'pointer-events-none' : ''}`}
        style={{
          // Allow touch events to pass through for zoom/pan when multi-touch
          touchAction: 'manipulation',
          // CRITICAL: Only capture pointer events when active and NOT in multi-touch mode
          // This allows two-finger zoom/pan to pass through to parent
          pointerEvents: !isActive || isMultiTouchActive ? 'none' : 'auto',
          // Layer-based opacity for uniform translucency - increased for better visibility
          opacity: isActive ? 0.85 : 0,
          // Hide visually when not active but keep in DOM for dimension tracking
          visibility: isActive ? 'visible' : 'hidden',
        }}
      >
        {isActive && isMounted && dimensions.width > 0 && dimensions.height > 0 ? (
          <>
            {DEBUG_BRUSH_LAYERS && console.log('[SmoothBrushTool/Konva] STAGE IS RENDERING with dimensions:', dimensions.width, 'x', dimensions.height)}
            <Stage
              ref={stageRef}
              width={dimensions.width}
              height={dimensions.height}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onPointerLeave={handlePointerCancel}
              style={{
                // CRITICAL FOR ZOOM PASSTHROUGH:
                // When multi-touch is active, disable pointer events on the Stage itself
                // This allows touch events to pass through to FaceChartWithZoom for pinch-zoom
                pointerEvents: isMultiTouchActive ? 'none' : 'auto',
                // ALWAYS allow manipulation gestures (pinch-zoom, pan)
                // Stylus drawing uses Pointer Events which are separate from Touch Events
                // This lets the browser handle pinch-zoom while Konva handles stylus drawing
                touchAction: 'manipulation',
              }}
            >
            {/*
              KONVA PERFORMANCE OPTIMIZATIONS:
              1. listening={false} - Disables hit detection for strokes (not needed for drawing)
              2. perfectDrawEnabled={false} - Skips extra rendering for fill+stroke+opacity combo
              3. hitGraphEnabled={false} - Skips hit graph generation entirely
              4. transformsEnabled="position" - Only allow position transforms (no scale/rotation)

              These optimizations are critical for smooth drawing performance, especially
              with many strokes on screen. See: https://konvajs.org/docs/performance/All_Performance_Tips.html
            */}
            <Layer listening={false}>
              {/* Render completed strokes */}
              {DEBUG_BRUSH_LAYERS && visibleStrokes.length > 0 && console.log('[SmoothBrushTool/Konva] Rendering', visibleStrokes.length, 'strokes')}
              {visibleStrokes.map((stroke) => (
                <Line
                  key={stroke.id}
                  points={stroke.points}
                  stroke={stroke.color}
                  strokeWidth={stroke.strokeWidth}
                  lineCap="round"
                  lineJoin="round"
                  tension={0.5}
                  globalCompositeOperation="source-over"
                  listening={false}
                  perfectDrawEnabled={false}
                  transformsEnabled="position"
                />
              ))}

              {/* Render current stroke being drawn */}
              {currentStroke && (
                <>
                  {DEBUG_BRUSH_LAYERS && console.log('[SmoothBrushTool/Konva] Rendering currentStroke with', currentStroke.points.length / 2, 'points, color:', currentStroke.color, 'strokeWidth:', currentStroke.strokeWidth)}
                  <Line
                    points={currentStroke.points}
                    stroke={currentStroke.color}
                    strokeWidth={currentStroke.strokeWidth}
                    lineCap="round"
                    lineJoin="round"
                    tension={0.5}
                    globalCompositeOperation="source-over"
                    listening={false}
                    perfectDrawEnabled={false}
                    transformsEnabled="position"
                  />
                </>
              )}
            </Layer>
          </Stage>
          </>
        ) : (
          DEBUG_BRUSH_LAYERS && isActive && (
            <div className="absolute inset-0 flex items-center justify-center text-red-500 text-sm bg-red-100/50">
              Stage not rendered: isActive={String(isActive)}, mounted={String(isMounted)}, dimensions={JSON.stringify(dimensions)}
            </div>
          )
        )}

        {/* Zone Detection Feedback Label */}
        {zoneFeedback && showZoneFeedback && (
          <div
            className="
              absolute z-30 pointer-events-auto
              flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg shadow-lg
              bg-white dark:bg-gray-800 text-gray-900 dark:text-white
              border border-gray-200 dark:border-gray-700
              animate-in fade-in slide-in-from-bottom-2 duration-200
            "
            style={{
              left: `${Math.max(60, Math.min(zoneFeedback.position.x, (containerRef.current?.clientWidth || 400) - 160))}px`,
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
              onClick={() => setZoneFeedback(null)}
              className="ml-1 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Dismiss"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
            <button
              onClick={() => setZonePickerOpen(true)}
              className="ml-0.5 p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Change zone"
            >
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
          </div>
        )}

        {/* Zone Picker Dropdown */}
        {zonePickerOpen && zoneFeedback && (
          <>
            <div
              className="fixed inset-0 z-35"
              onClick={() => setZonePickerOpen(false)}
            />
            <div
              className="
                absolute z-40 pointer-events-auto
                w-48 max-h-64 overflow-y-auto rounded-lg shadow-xl
                bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
              "
              style={{
                left: `${Math.max(60, Math.min(zoneFeedback.position.x, (containerRef.current?.clientWidth || 400) - 200))}px`,
                top: `${zoneFeedback.position.y + 40}px`,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Select Zone
                  </span>
                  <button
                    onClick={() => setZonePickerOpen(false)}
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
                    onClick={() => {
                      setZoneFeedback({
                        ...zoneFeedback,
                        zoneName: zone.name,
                        confidence: 1.0,
                      });
                      onZoneDetected?.(zone.name, 1.0);
                      setZonePickerOpen(false);
                      setTimeout(() => setZoneFeedback(null), 2000);
                    }}
                    className="
                      w-full px-3 py-1.5 text-left text-sm
                      flex items-center gap-2
                      hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200
                      transition-colors
                    "
                  >
                    <MapPin className="w-3 h-3 text-purple-400" />
                    <span>{zone.name}</span>
                    <span className="text-xs ml-auto text-gray-400 dark:text-gray-500">
                      {zone.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

export default SmoothBrushTool;
