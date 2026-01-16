'use client';

import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect, useCallback, useMemo } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef, CanvasPath } from 'react-sketch-canvas';
import { MapPin, X, ChevronDown } from 'lucide-react';
import { detectZoneFromStroke, detectMultipleZones, FACE_ZONE_DEFINITIONS, type DetectedZone } from './zoneDetection';

// =============================================================================
// DEBUG FLAG - Set to true to enable verbose logging for brush layer tracking
// =============================================================================
const DEBUG_BRUSH_LAYERS = true;

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
}

// =============================================================================
// DEFAULT TREATMENT TYPES - Uniform colors with no opacity stacking
// =============================================================================

// SOLUTION FOR OPACITY STACKING:
// The issue was that overlapping brush strokes would create darker areas where they
// overlapped - unacceptable for medical charting where uniform color is needed.
//
// ROOT CAUSE: react-sketch-canvas renders each stroke as a separate SVG <path>.
// When paths overlap with any opacity < 1.0, colors accumulate (stack), creating
// darker regions. Even mix-blend-mode doesn't solve this because each path is
// rendered independently before blending.
//
// THE FIX: Layer-based opacity with solid vibrant colors.
// - Colors are defined as vibrant hex (#XXXXXX) with NO alpha channel
// - NO rgba() conversion - we use the hex color as-is at 100% solid
// - With fully opaque solid colors, overlapping strokes simply paint over each other
//   with the same color, resulting in uniform appearance (no stacking/darkening)
// - The CONTAINER div has opacity: 0.6, making all strokes uniformly translucent
// - This gives us vibrant, distinct colors that are still see-through to the face chart
export const DEFAULT_TREATMENT_TYPES: TreatmentTypeConfig[] = [
  {
    id: 'fractional_laser',
    name: 'Fractional Laser',
    color: '#DC2626', // Bold red (red-600) - ablative/aggressive treatments
    defaultOpacity: 1.0,
    description: 'Non-ablative fractional resurfacing',
  },
  {
    id: 'co2_laser',
    name: 'CO2 Laser',
    color: '#EA580C', // Bold orange (orange-600) - moderate/ablative treatments
    defaultOpacity: 1.0,
    description: 'Ablative CO2 laser resurfacing',
  },
  {
    id: 'ipl',
    name: 'IPL',
    color: '#F59E0B', // Bold amber (amber-500) - light treatments
    defaultOpacity: 1.0,
    description: 'Intense pulsed light therapy',
  },
  {
    id: 'microneedling',
    name: 'Microneedling',
    color: '#9333EA', // Bold purple (purple-600) - combination therapy
    defaultOpacity: 1.0,
    description: 'Collagen induction therapy',
  },
  {
    id: 'chemical_peel',
    name: 'Chemical Peel',
    color: '#0891B2', // Bold cyan (cyan-600) - cooling/chemical treatments
    defaultOpacity: 1.0,
    description: 'Chemical exfoliation treatment',
  },
  {
    id: 'radiofrequency',
    name: 'Radiofrequency',
    color: '#DB2777', // Bold pink (pink-600) - RF/energy treatments
    defaultOpacity: 1.0,
    description: 'RF skin tightening',
  },
  {
    id: 'custom',
    name: 'Custom',
    color: '#4B5563', // Darker gray (gray-600) - neutral for custom
    defaultOpacity: 1.0,
    description: 'Custom treatment area',
  },
];

// Brush size to stroke width mapping
// Sized for practitioners marking treatment areas quickly:
// - Small: for precise edges, fine detail (15-20px)
// - Medium: for moderate areas like forehead bands (35-45px)
// - Large: for quickly covering large areas like cheeks (60-80px)
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

// NOTE: We intentionally do NOT convert hex to rgba.
// Using solid hex colors (#XXXXXX) without any alpha channel ensures that
// overlapping brush strokes don't accumulate/stack to create darker regions.
// The vibrant hex colors remain bold and distinct while the container-level
// opacity (0.6) makes them uniformly translucent to see the face chart beneath.

// =============================================================================
// SMOOTH BRUSH TOOL COMPONENT
// =============================================================================

export const SmoothBrushTool = forwardRef<SmoothBrushToolRef, SmoothBrushToolProps>(
  function SmoothBrushTool(
    {
      isActive,
      treatmentType = 'fractional_laser',
      treatmentTypes = DEFAULT_TREATMENT_TYPES,
      brushSize = 'medium',
      opacity: _opacity, // Deprecated - ignored to prevent stacking (we use 100% solid colors)
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
    },
    ref
  ) {
    const canvasRef = useRef<ReactSketchCanvasRef>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    // Zone feedback state - shows a temporary label when zone is detected
    const [zoneFeedback, setZoneFeedback] = useState<{
      zoneName: string;
      position: { x: number; y: number };
      confidence: number;
    } | null>(null);

    // Zone picker state for manual override
    const [zonePickerOpen, setZonePickerOpen] = useState(false);

    // Track paths by treatment type (maps color to treatment type for lookup)
    const [pathsByType, setPathsByType] = useState<BrushPathsByType>({});
    const [pathTypeMapping, setPathTypeMapping] = useState<Map<number, TreatmentAreaType>>(new Map());
    const pathIndexRef = useRef(0);

    // CRITICAL: Use ref to track current path type mapping to avoid stale closure issues
    // When handleStroke updates pathTypeMapping state, the updatePathsByType callback
    // may still have the old pathTypeMapping in its closure. Using a ref ensures
    // updatePathsByType always sees the latest mapping, fixing the bug where the first
    // stroke after switching products doesn't register correctly in the layers panel.
    const pathTypeMappingRef = useRef<Map<number, TreatmentAreaType>>(new Map());
    useEffect(() => {
      pathTypeMappingRef.current = pathTypeMapping;
    }, [pathTypeMapping]);

    // CRITICAL: Use ref to track current treatment type to avoid stale closure issues
    // When user switches products, the first stroke must use the NEW product, not the old one.
    // Without this ref, the handleStroke callback would capture the old treatmentType value
    // and the first stroke after switching wouldn't register correctly in the layers panel.
    const treatmentTypeRef = useRef<TreatmentAreaType>(treatmentType);
    useEffect(() => {
      treatmentTypeRef.current = treatmentType;
    }, [treatmentType]);

    // Ref to track previous pathsByType for comparison (prevents unnecessary callback invocations)
    const prevPathsByTypeRef = useRef<BrushPathsByType>({});

    // Refs to store callbacks - prevents recreating effects when callbacks change
    const onCanUndoChangeRef = useRef(onCanUndoChange);
    const onPathsByTypeChangeRef = useRef(onPathsByTypeChange);

    // Keep callback refs up to date
    useEffect(() => {
      onCanUndoChangeRef.current = onCanUndoChange;
    }, [onCanUndoChange]);

    useEffect(() => {
      onPathsByTypeChangeRef.current = onPathsByTypeChange;
    }, [onPathsByTypeChange]);

    // Notify parent when undo availability changes
    // IMPORTANT: Uses ref for callback to avoid dependency on onCanUndoChange which could change frequently
    useEffect(() => {
      onCanUndoChangeRef.current?.(canUndo);
    }, [canUndo]);

    // Notify parent when paths by type change
    // IMPORTANT: Uses ref for callback to prevent infinite loops when callback reference changes
    useEffect(() => {
      // Compare path counts to determine if we actually have meaningful changes
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

      // Check if counts actually changed
      const countsChanged =
        Object.keys(newCounts).length !== Object.keys(prevCounts).length ||
        Object.entries(newCounts).some(([key, count]) => prevCounts[key] !== count);

      // DEBUG: Log the comparison
      if (DEBUG_BRUSH_LAYERS) {
        console.log('[SmoothBrushTool] pathsByType effect:', {
          prevCounts,
          newCounts,
          countsChanged,
          hasCallback: !!onPathsByTypeChangeRef.current,
        });
      }

      if (countsChanged) {
        prevPathsByTypeRef.current = pathsByType;
        if (DEBUG_BRUSH_LAYERS) {
          console.log('[SmoothBrushTool] Calling onPathsByTypeChange callback');
        }
        onPathsByTypeChangeRef.current?.(pathsByType);
      }
    }, [pathsByType]); // Note: only depends on pathsByType, not the callback

    // Get current treatment config
    const currentTypeConfig = getTreatmentTypeConfig(treatmentType, treatmentTypes);
    // Use the hex color directly - NO rgba conversion!
    // This ensures overlapping strokes don't accumulate/stack to darker colors.
    // The container opacity (0.6) handles transparency uniformly for all strokes.
    const strokeColor = currentTypeConfig.color;
    const strokeWidth = BRUSH_SIZE_TO_WIDTH[brushSize];

    // Update paths by type from canvas paths
    // IMPORTANT: Uses pathTypeMappingRef.current instead of pathTypeMapping state to avoid
    // stale closure issues. When handleStroke calls setPathTypeMapping and then updatePathsByType
    // in quick succession (via setTimeout), the state update may not have propagated yet.
    // Using the ref ensures we always get the latest mapping.
    const updatePathsByType = useCallback(async () => {
      const allPaths = await canvasRef.current?.exportPaths();
      if (!allPaths) return;

      const newPathsByType: BrushPathsByType = {};
      // Use ref to get the LATEST mapping, not the potentially stale closure value
      const currentMapping = pathTypeMappingRef.current;

      // DEBUG: Log path count and mapping state
      if (DEBUG_BRUSH_LAYERS) {
        console.log('[SmoothBrushTool] updatePathsByType called:', {
          pathCount: allPaths.length,
          mappingSize: currentMapping.size,
          mappingEntries: Array.from(currentMapping.entries()),
        });
      }

      allPaths.forEach((path, index) => {
        // Get the treatment type from our mapping, or try to infer from color
        let pathTreatmentType = currentMapping.get(index);

        // DEBUG: Log each path lookup
        if (DEBUG_BRUSH_LAYERS) {
          console.log('[SmoothBrushTool] Path lookup:', {
            index,
            mappedType: pathTreatmentType,
            strokeColor: path.strokeColor,
          });
        }

        if (!pathTreatmentType) {
          // Try to match by color (for paths created before tracking)
          // Normalize both colors to lowercase for comparison
          const strokeColorLower = path.strokeColor.toLowerCase();
          const matchedType = treatmentTypes.find(t => {
            const typeColorLower = t.color.toLowerCase();
            return strokeColorLower === typeColorLower ||
                   strokeColorLower.includes(typeColorLower) ||
                   typeColorLower.includes(strokeColorLower);
          });
          pathTreatmentType = matchedType?.id || 'custom';
          if (DEBUG_BRUSH_LAYERS) {
            console.log('[SmoothBrushTool] Fallback color match:', {
              index,
              strokeColor: path.strokeColor,
              matchedType: pathTreatmentType,
            });
          }
        }

        if (!newPathsByType[pathTreatmentType]) {
          newPathsByType[pathTreatmentType] = [];
        }
        newPathsByType[pathTreatmentType]!.push(path);
      });

      // DEBUG: Log final result
      if (DEBUG_BRUSH_LAYERS) {
        console.log('[SmoothBrushTool] newPathsByType:', Object.fromEntries(
          Object.entries(newPathsByType).map(([key, paths]) => [key, paths?.length || 0])
        ));
      }

      setPathsByType(newPathsByType);
    }, [treatmentTypes]); // Note: removed pathTypeMapping from deps since we use the ref

    // Get path count by type for layer display
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

      Object.entries(pathsByType).forEach(([type, paths]) => {
        if (paths) {
          counts[type as TreatmentAreaType] = paths.length;
        }
      });

      return counts;
    }, [pathsByType]);

    // Clear paths for a specific treatment type
    const clearByTreatmentType = useCallback(async (typeToRemove: TreatmentAreaType) => {
      const allPaths = await canvasRef.current?.exportPaths();
      if (!allPaths) return;

      // Filter out paths of the specified type
      // Use ref to get the latest mapping
      const currentMapping = pathTypeMappingRef.current;
      const pathsToKeep: CanvasPath[] = [];
      const newMapping = new Map<number, TreatmentAreaType>();

      allPaths.forEach((path, index) => {
        const pathType = currentMapping.get(index);
        if (pathType !== typeToRemove) {
          newMapping.set(pathsToKeep.length, pathType || 'custom');
          pathsToKeep.push(path);
        }
      });

      // Clear and reload paths
      await canvasRef.current?.clearCanvas();
      if (pathsToKeep.length > 0) {
        await canvasRef.current?.loadPaths(pathsToKeep);
      }

      // Update both ref and state
      pathTypeMappingRef.current = newMapping;
      setPathTypeMapping(newMapping);
      pathIndexRef.current = pathsToKeep.length;

      // Update paths by type
      setTimeout(updatePathsByType, 50);
      onDrawingChange?.();
    }, [updatePathsByType, onDrawingChange]); // Removed pathTypeMapping from deps since we use ref

    // Track previous hidden types to detect changes
    const prevHiddenTypesRef = useRef<Set<TreatmentAreaType>>(new Set());

    // Apply visibility by loading/unloading paths based on hidden types
    // Only runs when hiddenTreatmentTypes changes (not when pathsByType changes)
    useEffect(() => {
      const applyVisibility = async () => {
        if (!canvasRef.current) return;

        // Check if hiddenTreatmentTypes actually changed
        const prevHidden = prevHiddenTypesRef.current;
        const currentHidden = hiddenTreatmentTypes || new Set();

        // Compare sets
        const setsEqual = prevHidden.size === currentHidden.size &&
          Array.from(prevHidden).every(item => currentHidden.has(item));

        if (setsEqual) return;

        // Update ref for next comparison
        prevHiddenTypesRef.current = new Set(currentHidden);

        // Get all paths from canvas
        const allPaths = await canvasRef.current.exportPaths();
        if (!allPaths || allPaths.length === 0) return;

        // Build visibility based on path type mapping
        const visiblePaths: CanvasPath[] = [];

        allPaths.forEach((path, index) => {
          const pathType = pathTypeMapping.get(index);
          if (!pathType || !currentHidden.has(pathType)) {
            visiblePaths.push(path);
          }
        });

        // Clear and reload only visible paths
        await canvasRef.current.clearCanvas();
        if (visiblePaths.length > 0) {
          await canvasRef.current.loadPaths(visiblePaths);
        }
      };

      applyVisibility();
    }, [hiddenTreatmentTypes, pathTypeMapping]);

    // Memoized undo handler
    const handleUndo = useCallback(() => {
      canvasRef.current?.undo();
      // Update path tracking after undo
      pathIndexRef.current = Math.max(0, pathIndexRef.current - 1);
      setTimeout(updatePathsByType, 50);
      onDrawingChange?.();
    }, [updatePathsByType, onDrawingChange]);

    // Memoized redo handler
    const handleRedo = useCallback(() => {
      canvasRef.current?.redo();
      setTimeout(updatePathsByType, 50);
      onDrawingChange?.();
    }, [updatePathsByType, onDrawingChange]);

    // Memoized clear all handler
    const handleClearAll = useCallback(() => {
      canvasRef.current?.clearCanvas();
      setPathsByType({});
      // Reset both ref and state
      pathTypeMappingRef.current = new Map();
      setPathTypeMapping(new Map());
      pathIndexRef.current = 0;
      onDrawingChange?.();
    }, [onDrawingChange]);

    // Memoized export paths handler
    const handleExportPaths = useCallback(async () => {
      const paths = await canvasRef.current?.exportPaths();
      return paths || [];
    }, []);

    // Memoized export paths by type handler
    const handleExportPathsByType = useCallback(async () => {
      await updatePathsByType();
      return pathsByType;
    }, [updatePathsByType, pathsByType]);

    // Memoized export image handler
    const handleExportImage = useCallback(async (imageType: 'png' | 'jpeg') => {
      const image = await canvasRef.current?.exportImage(imageType);
      return image || '';
    }, []);

    /**
     * Detect zones from ALL current brush strokes at once.
     * This is the preferred way to detect zones - user draws freely, then calls this
     * when done to get a summary of all treated areas.
     */
    const detectAllZones = useCallback(async (): Promise<DetectedZone[]> => {
      const paths = await canvasRef.current?.exportPaths();
      if (!paths || paths.length === 0) return [];

      const container = containerRef.current;
      if (!container) return [];

      const rect = container.getBoundingClientRect();

      // Collect ALL points from ALL strokes
      const allPoints: Array<{ x: number; y: number; pressure: number; timestamp: number }> = [];

      for (const path of paths) {
        if (path.paths && path.paths.length > 0) {
          for (const p of path.paths) {
            allPoints.push({
              x: p.x,
              y: p.y,
              pressure: 0.5,
              timestamp: Date.now(),
            });
          }
        }
      }

      if (allPoints.length === 0) return [];

      // Detect all zones that these points cover
      const detectedZones = detectMultipleZones(allPoints, rect.width, rect.height, 0.05);

      // Notify parent if callback provided
      onAllZonesDetected?.(detectedZones);

      return detectedZones;
    }, [onAllZonesDetected]);

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

    // Handle stroke changes to update undo/redo state, track treatment type, and detect zone
    const handleStroke = useCallback(async () => {
      // CRITICAL: Use treatmentTypeRef.current to get the CURRENT treatment type
      // This avoids stale closure issues when the user switches products.
      // The ref is always up-to-date, whereas treatmentType from props could be stale.
      const currentTreatmentType = treatmentTypeRef.current;

      // Track this path's treatment type
      const currentIndex = pathIndexRef.current;

      // DEBUG: Log stroke start
      if (DEBUG_BRUSH_LAYERS) {
        console.log('[SmoothBrushTool] handleStroke called:', {
          currentTreatmentType,
          currentIndex,
        });
      }

      // CRITICAL FIX: Update the ref IMMEDIATELY (synchronously) so that when
      // updatePathsByType runs in the setTimeout, it will see the new mapping.
      // State updates (setPathTypeMapping) are batched and asynchronous, so they
      // won't be visible to the setTimeout callback. But ref updates are synchronous.
      const newMapping = new Map(pathTypeMappingRef.current);
      newMapping.set(currentIndex, currentTreatmentType);
      pathTypeMappingRef.current = newMapping;

      // Also update state for React re-renders and other state-dependent code
      setPathTypeMapping(newMapping);
      pathIndexRef.current++;

      setCanUndo(true);
      setCanRedo(false);

      // Update paths by type after a brief delay to ensure canvas state is updated
      setTimeout(() => {
        updatePathsByType();
        onStrokeComplete?.(currentTreatmentType, pathIndexRef.current);
      }, 50);

      onDrawingChange?.();

      // Zone detection - extract the last stroke and detect zone
      if (enableZoneDetection && containerRef.current) {
        // Wait a bit for canvas to update
        setTimeout(async () => {
          const paths = await canvasRef.current?.exportPaths();
          if (!paths || paths.length === 0) return;

          // Get the last path (most recent stroke)
          const lastPath = paths[paths.length - 1];
          if (!lastPath.paths || lastPath.paths.length === 0) return;

          // Convert path points to the format expected by zone detection
          const points = lastPath.paths.map(p => ({
            x: p.x,
            y: p.y,
            pressure: 0.5,
            timestamp: Date.now(),
          }));

          // Get container dimensions for coordinate normalization
          const container = containerRef.current;
          if (!container) return;
          const rect = container.getBoundingClientRect();

          // Detect zone from stroke
          const detectedZone = detectZoneFromStroke(points, rect.width, rect.height);

          if (detectedZone && showZoneFeedback) {
            // Calculate centroid for feedback position
            const centroid = points.reduce(
              (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
              { x: 0, y: 0 }
            );
            centroid.x /= points.length;
            centroid.y /= points.length;

            // Show zone feedback
            setZoneFeedback({
              zoneName: detectedZone.zoneName,
              position: { x: centroid.x, y: centroid.y - 30 },
              confidence: detectedZone.confidence,
            });

            // Notify parent
            onZoneDetected?.(detectedZone.zoneName, detectedZone.confidence);

            // Auto-dismiss after 2 seconds
            setTimeout(() => {
              setZoneFeedback(null);
            }, 2000);
          }
        }, 100);
      }
    // Note: treatmentType is NOT in dependencies because we use treatmentTypeRef.current
    // This is intentional to avoid stale closure issues - the ref always has the current value
    }, [updatePathsByType, onStrokeComplete, onDrawingChange, enableZoneDetection, showZoneFeedback, onZoneDetected]);

    // =============================================================================
    // TWO-FINGER ZOOM/PAN GESTURE HANDLING
    // =============================================================================
    // Problem: ReactSketchCanvas uses pointer events to capture drawing. When a user
    // starts a two-finger gesture, the first finger touch starts a stroke before we
    // know the second finger is coming. We need to:
    // 1. Detect two-finger gestures as early as possible
    // 2. Cancel any in-progress stroke when second finger touches
    // 3. Prevent the canvas from receiving further events during the gesture
    // 4. Allow the gesture to pass through to parent FaceChartWithZoom for zoom/pan
    //
    // Solution:
    // - Use native event listeners with { passive: false } for earliest detection
    // - Track touch count and set isMultiTouchActive flag
    // - When second finger detected, undo any partial stroke that was started
    // - Disable pointer-events on canvas wrapper during multi-touch

    const [isMultiTouchActive, setIsMultiTouchActive] = useState(false);
    const touchCountRef = useRef(0);
    const hadStrokeBeforeMultiTouch = useRef(false);
    const pathCountBeforeMultiTouch = useRef(0);
    const isMultiTouchActiveRef = useRef(false);

    // Keep ref in sync with state for use in event handlers
    useEffect(() => {
      isMultiTouchActiveRef.current = isMultiTouchActive;
    }, [isMultiTouchActive]);

    // SAFETY: Reset multi-touch state when component becomes active
    // This prevents the brush from being stuck in a disabled state if a previous
    // gesture didn't complete properly (e.g., user switched away during a gesture)
    useEffect(() => {
      if (isActive) {
        // Reset touch tracking when tool becomes active
        touchCountRef.current = 0;
        isMultiTouchActiveRef.current = false;
        setIsMultiTouchActive(false);
      }
    }, [isActive]);

    // Use native event listeners for earliest possible detection of multi-touch
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleTouchStartNative = (e: TouchEvent) => {
        const previousCount = touchCountRef.current;
        touchCountRef.current = e.touches.length;

        if (e.touches.length === 1 && previousCount === 0) {
          // First finger down - record current path count so we can undo if this
          // turns out to be the start of a two-finger gesture
          hadStrokeBeforeMultiTouch.current = false;
          canvasRef.current?.exportPaths().then(paths => {
            pathCountBeforeMultiTouch.current = paths?.length || 0;
          });
        }

        if (e.touches.length >= 2) {
          // Two-finger gesture detected!
          isMultiTouchActiveRef.current = true;
          setIsMultiTouchActive(true);

          // CRITICAL: Stop the event from reaching ReactSketchCanvas
          // This prevents the canvas from interpreting the gesture as a stroke
          e.stopPropagation();

          // CRITICAL: If the first finger already started a partial stroke,
          // we need to undo it. The user intended a zoom/pan gesture, not a stroke.
          // We do this by comparing current path count to what it was before.
          canvasRef.current?.exportPaths().then(paths => {
            const currentPathCount = paths?.length || 0;
            if (currentPathCount > pathCountBeforeMultiTouch.current) {
              // A stroke was started - undo it
              canvasRef.current?.undo();
              hadStrokeBeforeMultiTouch.current = true;
            }
          });

          // Don't prevent default here - let the gesture propagate to parent
          // The parent FaceChartWithZoom will handle the zoom/pan
        }
      };

      const handleTouchEndNative = (e: TouchEvent) => {
        touchCountRef.current = e.touches.length;

        // Reset multi-touch state when we're down to 0 or 1 finger
        // Previously we only reset at 0 fingers, which could leave the state stuck
        // if the user lifted one finger but kept one down
        if (e.touches.length <= 1) {
          // Small delay to prevent accidental strokes right after the gesture ends
          // but only if we were actually in multi-touch mode
          const wasMultiTouch = isMultiTouchActiveRef.current;
          const delay = wasMultiTouch ? 150 : 0;

          setTimeout(() => {
            isMultiTouchActiveRef.current = false;
            setIsMultiTouchActive(false);
            hadStrokeBeforeMultiTouch.current = false;
          }, delay);
        }
      };

      const handleTouchMoveNative = (e: TouchEvent) => {
        // If multi-touch is active, allow the event to propagate (don't prevent default)
        // This lets the parent handle the zoom/pan gesture
        // Use ref to get current value without stale closure issues
        if (e.touches.length >= 2 || isMultiTouchActiveRef.current) {
          // The parent FaceChartWithZoom will handle this
          return;
        }
      };

      // Use { passive: true } to allow browser zoom gestures to work smoothly
      container.addEventListener('touchstart', handleTouchStartNative, { passive: true });
      container.addEventListener('touchend', handleTouchEndNative, { passive: true });
      container.addEventListener('touchcancel', handleTouchEndNative, { passive: true });
      container.addEventListener('touchmove', handleTouchMoveNative, { passive: true });

      return () => {
        container.removeEventListener('touchstart', handleTouchStartNative);
        container.removeEventListener('touchend', handleTouchEndNative);
        container.removeEventListener('touchcancel', handleTouchEndNative);
        container.removeEventListener('touchmove', handleTouchMoveNative);
      };
    }, []); // Empty deps - event listeners set up once

    if (!isActive) {
      return null;
    }

    return (
      <div
        ref={containerRef}
        className={`absolute inset-0 z-20 ${readOnly ? 'pointer-events-none' : ''}`}
        style={{
          // Allow pinch-zoom gestures
          touchAction: 'manipulation',
          pointerEvents: 'auto',
          // LAYER-BASED OPACITY SOLUTION:
          // Strokes are drawn at 100% solid color (no alpha in stroke color) to prevent
          // overlapping strokes from stacking/darkening. Then we apply uniform opacity
          // to the ENTIRE container, making all strokes uniformly translucent.
          // This way: individual strokes don't stack, but the whole layer is see-through
          // so the underlying face image remains visible.
          opacity: 0.6,
        }}
        // NOTE: Touch events are handled by native event listeners in useEffect above
        // for earliest possible detection of two-finger gestures
      >
        {/*
          TWO-FINGER ZOOM/PAN SOLUTION:

          The ReactSketchCanvas component uses pointer events internally to capture drawing.
          When two-finger gestures occur, we need to:
          1. Completely disable pointer events on the canvas wrapper
          2. Allow the gesture to propagate to the parent FaceChartWithZoom for zoom/pan

          Implementation:
          - Native event listeners (useEffect above) detect multi-touch gestures early
          - When second finger touches, we undo any partial stroke that was started
          - isMultiTouchActive flag disables pointer-events on the canvas wrapper
          - touchAction: 'pinch-zoom' on container allows browser zoom gestures to pass through
          - Parent FaceChartWithZoom's useChartZoomPan hook handles the zoom/pan

          Why native event listeners instead of React events:
          - Native events fire before React synthetic events
          - We can detect multi-touch ASAP to minimize partial stroke issues
          - We can undo any partial stroke that was started before second finger detected
        */}
        <div
          style={{
            width: '100%',
            height: '100%',
            // Allow stylus events to reach the canvas
            pointerEvents: 'auto',
          }}
        >
          <ReactSketchCanvas
            ref={canvasRef}
            width="100%"
            height="100%"
            strokeWidth={strokeWidth}
            strokeColor={strokeColor}
            canvasColor="transparent"
            style={{
              border: 'none',
              borderRadius: 0,
              // Override library's internal touch-action: none to allow pinch-zoom
              touchAction: 'manipulation',
            }}
            svgStyle={{
              // Ensure SVG captures all pointer events including on transparent areas
              pointerEvents: 'all',
              // Allow pinch-zoom gestures to pass through to parent
              touchAction: 'manipulation',
              // NOTE: We removed mixBlendMode: 'darken' because it doesn't actually
              // solve opacity stacking - each SVG path is rendered independently before
              // blending occurs. The correct solution (implemented above) is to use
              // 100% solid hex colors with no alpha channel whatsoever.
            }}
            exportWithBackgroundImage={false}
            withTimestamp={false}
            // STYLUS-ONLY DRAWING: Only Apple Pencil/stylus can draw.
            // Finger touch gestures pass through for zoom/pan.
            // This is the cleanest solution for brush + zoom conflict:
            // - Pen draws brush strokes with precision
            // - One finger pans the chart
            // - Two fingers pinch to zoom
            allowOnlyPointerType="pen"
            onStroke={handleStroke}
          />
        </div>

        {/* Zone Detection Feedback Label - subtle, non-intrusive */}
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

        {/* Zone Picker Dropdown for override */}
        {zonePickerOpen && zoneFeedback && (
          <>
            {/* Click-away handler */}
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
                        confidence: 1.0, // User-selected = 100% confidence
                      });
                      onZoneDetected?.(zone.name, 1.0);
                      setZonePickerOpen(false);
                      // Auto-dismiss after 2 seconds
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
