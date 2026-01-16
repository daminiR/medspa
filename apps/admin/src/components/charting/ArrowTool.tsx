'use client';

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Undo2, Trash2 } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Represents a single arrow annotation on the chart
 * Used for: thread lift vectors, filler flow direction, treatment paths
 */
export interface Arrow {
  id: string;
  /** Start point as percentage (0-100) of container */
  startX: number;
  startY: number;
  /** End point as percentage (0-100) of container */
  endX: number;
  endY: number;
  /** Arrow color (hex) */
  color: string;
  /** Line thickness in pixels */
  thickness: number;
  /** Optional label for the arrow */
  label?: string;
  /** Product ID this arrow is associated with */
  productId?: string;
  /** Timestamp when created */
  timestamp: Date;
}

export interface ArrowToolRef {
  /** Undo the last arrow drawn */
  undo: () => void;
  /** Redo the last undone arrow */
  redo: () => void;
  /** Clear all arrows */
  clearAll: () => void;
  /** Export arrows as data */
  exportArrows: () => Arrow[];
  /** Get current arrow count */
  getArrowCount: () => number;
}

/**
 * Zoom state for coordinating with parent zoom/pan container
 */
export interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface ArrowToolProps {
  /** Whether the arrow tool is currently active */
  isActive: boolean;
  /** Existing arrows to render */
  arrows?: Arrow[];
  /** Callback when arrows change */
  onArrowsChange?: (arrows: Arrow[]) => void;
  /** Callback when an arrow is added */
  onArrowAdd?: (arrow: Arrow) => void;
  /** Callback when undo availability changes */
  onCanUndoChange?: (canUndo: boolean) => void;
  /** Callback when redo availability changes */
  onCanRedoChange?: (canRedo: boolean) => void;
  /** Whether the tool is read-only */
  readOnly?: boolean;
  /** Product ID to associate with new arrows */
  productId?: string;
  /** Show the minimal floating color picker (default: true when active) */
  showColorPicker?: boolean;
  /**
   * Zoom state from parent (FaceChartWithZoom, etc.)
   * When provided, arrows will transform to stay attached to the zoomed/panned chart.
   */
  zoomState?: ZoomState;
  /**
   * Controlled color prop - when provided, overrides internal color selection.
   * Use this to control the arrow color from a parent component (e.g., RightDock).
   */
  color?: string;
  /**
   * Callback when color changes (only used when showColorPicker is true).
   * Allows syncing color selection back to parent.
   */
  onColorChange?: (color: string) => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ARROWHEAD_LENGTH = 15; // Length of arrowhead sides
const ARROWHEAD_ANGLE = Math.PI / 6; // 30 degrees
const MIN_ARROW_LENGTH = 10; // Minimum length to register as an arrow
const DEFAULT_THICKNESS = 3; // Smart default thickness

// Quick color picks - focused palette for medical charting
export const ARROW_COLORS = [
  { id: 'purple', color: '#8B5CF6', label: 'Thread Lift' },
  { id: 'blue', color: '#3B82F6', label: 'Filler Flow' },
  { id: 'green', color: '#10B981', label: 'Entry Path' },
  { id: 'red', color: '#EF4444', label: 'Caution' },
] as const;

export type ArrowColorOption = typeof ARROW_COLORS[number];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate a unique ID for arrows
 */
function generateArrowId(): string {
  return `arrow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate distance between two points
 */
function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Convert pixel position to percentage
 */
function toPercentage(value: number, total: number): number {
  return (value / total) * 100;
}

/**
 * Convert percentage to pixel position
 */
function toPixels(percentage: number, total: number): number {
  return (percentage / 100) * total;
}

// =============================================================================
// ARROW TOOL COMPONENT
// =============================================================================

export const ArrowTool = forwardRef<ArrowToolRef, ArrowToolProps>(
  function ArrowTool(
    {
      isActive,
      arrows: externalArrows,
      onArrowsChange,
      onArrowAdd,
      onCanUndoChange,
      onCanRedoChange,
      readOnly = false,
      productId,
      showColorPicker = true,
      zoomState,
      color: controlledColor,
      onColorChange,
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Internal state for arrows (used if not controlled)
    const [internalArrows, setInternalArrows] = useState<Arrow[]>([]);
    const arrows = externalArrows ?? internalArrows;

    // Color selection - supports both controlled and uncontrolled modes
    // When controlledColor is provided, use it; otherwise use internal state
    // IMPORTANT: Initialize to controlledColor if provided to prevent color mismatch on first render
    // FIX: Always use a valid default color - the default purple (#8B5CF6) ensures drawing works immediately
    const DEFAULT_ARROW_COLOR = ARROW_COLORS[0].color; // '#8B5CF6' purple
    const [internalColor, setInternalColor] = useState<string>(controlledColor || DEFAULT_ARROW_COLOR);
    // FIX: Ensure selectedColor ALWAYS has a valid value by adding final fallback
    // This fixes the bug where first-selected arrow tool wouldn't draw until color was manually selected
    const selectedColor = controlledColor || internalColor || DEFAULT_ARROW_COLOR;

    // Sync internal color state when controlled color changes from parent
    // This ensures the internal state stays in sync for the floating color picker (when shown)
    // FIX: Only sync if controlledColor is a non-empty string to prevent clearing the color
    useEffect(() => {
      if (controlledColor && controlledColor.length > 0) {
        setInternalColor(controlledColor);
      }
    }, [controlledColor]);

    // DEBUG: Uncomment to trace color prop changes
    // console.log('[ArrowTool] color prop:', controlledColor, 'internal:', internalColor, 'selected:', selectedColor);

    // Handler for color changes - updates internal state and notifies parent if callback provided
    const handleColorChange = useCallback((newColor: string) => {
      setInternalColor(newColor);
      onColorChange?.(newColor);
    }, [onColorChange]);

    // Drawing state
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
    const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);

    // Undo/redo stacks
    const [undoStack, setUndoStack] = useState<Arrow[][]>([]);
    const [redoStack, setRedoStack] = useState<Arrow[][]>([]);

    // Update arrows (internal or via callback)
    const updateArrows = useCallback(
      (newArrows: Arrow[]) => {
        if (onArrowsChange) {
          onArrowsChange(newArrows);
        } else {
          setInternalArrows(newArrows);
        }
      },
      [onArrowsChange]
    );

    // Track undo/redo availability
    const canUndo = undoStack.length > 0;
    const canRedo = redoStack.length > 0;

    // Refs to store callbacks - prevents recreating effects when callbacks change
    const onCanUndoChangeRef = useRef(onCanUndoChange);
    const onCanRedoChangeRef = useRef(onCanRedoChange);

    // Keep callback refs up to date
    useEffect(() => {
      onCanUndoChangeRef.current = onCanUndoChange;
    }, [onCanUndoChange]);

    useEffect(() => {
      onCanRedoChangeRef.current = onCanRedoChange;
    }, [onCanRedoChange]);

    // Notify parent of undo/redo availability changes
    // IMPORTANT: Uses ref for callback to avoid dependency on callbacks which could change frequently
    useEffect(() => {
      onCanUndoChangeRef.current?.(canUndo);
    }, [canUndo]);

    useEffect(() => {
      onCanRedoChangeRef.current?.(canRedo);
    }, [canRedo]);

    // Memoized undo handler
    const handleUndo = useCallback(() => {
      if (undoStack.length === 0) return;
      const previousState = undoStack[undoStack.length - 1];
      setRedoStack((prev) => [...prev, arrows]);
      setUndoStack((prev) => prev.slice(0, -1));
      updateArrows(previousState);
    }, [undoStack, arrows, updateArrows]);

    // Memoized redo handler
    const handleRedo = useCallback(() => {
      if (redoStack.length === 0) return;
      const nextState = redoStack[redoStack.length - 1];
      setUndoStack((prev) => [...prev, arrows]);
      setRedoStack((prev) => prev.slice(0, -1));
      updateArrows(nextState);
    }, [redoStack, arrows, updateArrows]);

    // Memoized clear all handler
    const handleClearAll = useCallback(() => {
      if (arrows.length === 0) return;
      setUndoStack((prev) => [...prev, arrows]);
      setRedoStack([]);
      updateArrows([]);
    }, [arrows, updateArrows]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      undo: handleUndo,
      redo: handleRedo,
      clearAll: handleClearAll,
      exportArrows: () => arrows,
      getArrowCount: () => arrows.length,
    }), [handleUndo, handleRedo, handleClearAll, arrows]);

    // Track last canvas dimensions to avoid unnecessary resets that cause jitter
    const lastCanvasSizeRef = useRef<{ width: number; height: number } | null>(null);

    // Resize canvas to match container UNSCALED dimensions
    // The canvas is inside contentRef which has CSS transform applied.
    // IMPORTANT: We use the UNSCALED dimensions because:
    // 1. The canvas is inside the scaled contentRef
    // 2. CSS transform will scale the canvas visually
    // 3. If we set canvas to VISUAL size, it gets double-scaled
    // 4. Pointer coordinates need to be converted from visual to unscaled space
    const resizeCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const scale = zoomState?.scale || 1;

      // Calculate UNSCALED dimensions by dividing visual dimensions by scale
      // This is the actual CSS size the canvas should be before transform is applied
      const canvasWidth = rect.width / scale;
      const canvasHeight = rect.height / scale;

      // DEBUG: Uncomment to trace canvas resize
      // console.log('[ArrowTool] resizeCanvas:', { visualRect: { width: rect.width, height: rect.height }, scale, unscaledSize: { width: canvasWidth, height: canvasHeight } });

      // Skip if dimensions are invalid (container not laid out yet)
      if (canvasWidth <= 0 || canvasHeight <= 0) {
        return;
      }

      const newBufferWidth = Math.round(canvasWidth * dpr);
      const newBufferHeight = Math.round(canvasHeight * dpr);

      // CRITICAL FIX: Only resize if dimensions actually changed
      // Setting canvas.width/height clears the canvas buffer and resets the context transform,
      // which causes jitter/oscillation if done during the mount retry timeouts (50ms, 100ms, 200ms)
      // while the user has already started drawing
      if (
        lastCanvasSizeRef.current &&
        lastCanvasSizeRef.current.width === newBufferWidth &&
        lastCanvasSizeRef.current.height === newBufferHeight
      ) {
        return;
      }

      // Set the canvas BUFFER size (pixels for drawing) at high DPI
      canvas.width = newBufferWidth;
      canvas.height = newBufferHeight;

      // Track the new dimensions to avoid redundant resizes
      lastCanvasSizeRef.current = { width: newBufferWidth, height: newBufferHeight };

      // Set the canvas CSS display size to match UNSCALED dimensions
      // The CSS transform on the parent will scale this up to visual size
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }, [zoomState?.scale]);

    // Draw an arrow on the canvas
    const drawArrow = useCallback(
      (
        ctx: CanvasRenderingContext2D,
        fromX: number,
        fromY: number,
        toX: number,
        toY: number,
        color: string,
        thickness: number
      ) => {
        const angle = Math.atan2(toY - fromY, toX - fromX);

        // Draw the line
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Draw the arrowhead
        const headLength = Math.max(ARROWHEAD_LENGTH, thickness * 4);
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
          toX - headLength * Math.cos(angle - ARROWHEAD_ANGLE),
          toY - headLength * Math.sin(angle - ARROWHEAD_ANGLE)
        );
        ctx.moveTo(toX, toY);
        ctx.lineTo(
          toX - headLength * Math.cos(angle + ARROWHEAD_ANGLE),
          toY - headLength * Math.sin(angle + ARROWHEAD_ANGLE)
        );
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw filled arrowhead triangle for better visibility
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
          toX - headLength * Math.cos(angle - ARROWHEAD_ANGLE),
          toY - headLength * Math.sin(angle - ARROWHEAD_ANGLE)
        );
        ctx.lineTo(
          toX - headLength * Math.cos(angle + ARROWHEAD_ANGLE),
          toY - headLength * Math.sin(angle + ARROWHEAD_ANGLE)
        );
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      },
      []
    );

    // Redraw all arrows on canvas
    const redrawCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) {
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const scale = zoomState?.scale || 1;

      // Use UNSCALED dimensions (same as canvas sizing)
      const canvasWidth = rect.width / scale;
      const canvasHeight = rect.height / scale;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // Draw all saved arrows (stored as percentages of UNSCALED dimensions)
      arrows.forEach((arrow) => {
        const fromX = toPixels(arrow.startX, canvasWidth);
        const fromY = toPixels(arrow.startY, canvasHeight);
        const toX = toPixels(arrow.endX, canvasWidth);
        const toY = toPixels(arrow.endY, canvasHeight);
        drawArrow(ctx, fromX, fromY, toX, toY, arrow.color, arrow.thickness);
      });

      // Draw current arrow being drawn (already in unscaled coordinates)
      // Only draw preview if there's some distance between start and current points
      // This prevents drawing a weird-looking arrowhead at a single point when first clicking
      if (isDrawing && startPoint && currentPoint) {
        const previewLength = distance(startPoint.x, startPoint.y, currentPoint.x, currentPoint.y);
        if (previewLength > 5) {
          drawArrow(
            ctx,
            startPoint.x,
            startPoint.y,
            currentPoint.x,
            currentPoint.y,
            selectedColor,
            DEFAULT_THICKNESS
          );
        }
      }
    }, [arrows, isDrawing, startPoint, currentPoint, selectedColor, drawArrow, zoomState?.scale]);

    // Get pointer position relative to canvas in UNSCALED coordinates
    // The canvas is inside a scaled container, so we need to convert visual coordinates
    // to unscaled canvas coordinates by dividing by the scale factor.
    const getPointerPosition = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container) return { x: 0, y: 0 };

        const rect = container.getBoundingClientRect();
        const scale = zoomState?.scale || 1;

        // Get position relative to container's visual bounds
        const visualX = e.clientX - rect.left;
        const visualY = e.clientY - rect.top;

        // Convert to unscaled canvas coordinates
        // The canvas is sized to unscaled dimensions, so we divide visual coordinates by scale
        const x = visualX / scale;
        const y = visualY / scale;

        // DEBUG: Uncomment to trace pointer position calculation
        // console.log('[ArrowTool] getPointerPosition:', { clientX: e.clientX, clientY: e.clientY, scale, visualPos: { visualX, visualY }, unscaledPos: { x, y } });

        return { x, y };
      },
      [zoomState]
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

    // Handle pointer down - start drawing
    // Works with touch, mouse, AND stylus (Apple Pencil)
    // Two-finger gestures pass through for zoom/pan
    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isActive || readOnly) {
          return;
        }

        // Track touch count for multi-touch detection
        if (e.pointerType === 'touch') {
          touchCountRef.current++;

          // If more than one finger, mark as two-finger gesture and let it bubble
          // This allows the parent FaceChartWithZoom to handle zoom/pan
          if (touchCountRef.current > 1) {
            isTwoFingerGestureRef.current = true;
            // Cancel any in-progress drawing
            if (isDrawing) {
              setIsDrawing(false);
              setStartPoint(null);
              setCurrentPoint(null);
            }
            // IMPORTANT: Do NOT call preventDefault/stopPropagation
            // Let the event bubble up for zoom/pan handling
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
        // DEBUG: Uncomment to trace pointer down
        // console.log('[ArrowTool] handlePointerDown - start point:', point);
        setIsDrawing(true);
        setStartPoint(point);
        setCurrentPoint(point);
      },
      [isActive, readOnly, getPointerPosition, isDrawing]
    );

    // Handle pointer move - update current position
    // Works with touch, mouse, AND stylus (Apple Pencil)
    // Two-finger gestures pass through for zoom/pan
    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
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
        setCurrentPoint(point);
      },
      [isActive, isDrawing, readOnly, getPointerPosition]
    );

    // Handle pointer up - finish drawing
    // Works with touch, mouse, AND stylus (Apple Pencil)
    // Two-finger gestures pass through for zoom/pan
    const handlePointerUp = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        // Track touch count for multi-touch detection
        if (e.pointerType === 'touch') {
          touchCountRef.current = Math.max(0, touchCountRef.current - 1);

          // Reset two-finger gesture flag when all fingers are lifted
          if (touchCountRef.current === 0) {
            isTwoFingerGestureRef.current = false;
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

        if (startPoint && currentPoint) {
          const container = containerRef.current;
          if (!container) return;

          const rect = container.getBoundingClientRect();
          const scale = zoomState?.scale || 1;

          // Use UNSCALED dimensions (same as canvas sizing and pointer positions)
          const canvasWidth = rect.width / scale;
          const canvasHeight = rect.height / scale;

          const length = distance(startPoint.x, startPoint.y, currentPoint.x, currentPoint.y);

          // DEBUG: Uncomment to trace pointer up
          // console.log('[ArrowTool] handlePointerUp:', { startPoint, currentPoint, scale, canvasSize: { width: canvasWidth, height: canvasHeight }, arrowLength: length, selectedColor });

          // Only create arrow if it meets minimum length
          if (length >= MIN_ARROW_LENGTH) {
            const newArrow: Arrow = {
              id: generateArrowId(),
              startX: toPercentage(startPoint.x, canvasWidth),
              startY: toPercentage(startPoint.y, canvasHeight),
              endX: toPercentage(currentPoint.x, canvasWidth),
              endY: toPercentage(currentPoint.y, canvasHeight),
              color: selectedColor,
              thickness: DEFAULT_THICKNESS,
              productId: productId,
              timestamp: new Date(),
            };
            // DEBUG: Uncomment to trace arrow creation
            // console.log('[ArrowTool] Creating arrow with color:', selectedColor, 'newArrow:', newArrow);

            // Save current state for undo
            setUndoStack((prev) => [...prev, arrows]);
            setRedoStack([]);

            // Add new arrow
            const newArrows = [...arrows, newArrow];
            updateArrows(newArrows);
            onArrowAdd?.(newArrow);
          }
        }

        setStartPoint(null);
        setCurrentPoint(null);
      },
      [
        isActive,
        isDrawing,
        readOnly,
        startPoint,
        currentPoint,
        selectedColor,
        productId,
        arrows,
        updateArrows,
        onArrowAdd,
        zoomState?.scale,
      ]
    );

    // Handle pointer leave or cancel
    // Works with touch, mouse, AND stylus (Apple Pencil)
    // Also handles pointer cancel for multi-touch scenarios
    const handlePointerLeave = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        // Track touch count for multi-touch detection
        if (e.pointerType === 'touch') {
          touchCountRef.current = Math.max(0, touchCountRef.current - 1);

          // Reset two-finger gesture flag when all fingers are lifted
          if (touchCountRef.current === 0) {
            isTwoFingerGestureRef.current = false;
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

    // =========================================================================
    // NATIVE TOUCH EVENT HANDLERS
    // These are CRITICAL for two-finger zoom/pan to work properly.
    // The parent FaceChartWithZoom uses native touch events, not pointer events.
    // We must ensure two-finger gestures bubble up to the parent container.
    // =========================================================================

    // Handle native touch start - detect two-finger gestures early
    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
      // If two or more fingers, this is a zoom/pan gesture
      // Let it bubble to parent - do NOT prevent default
      if (e.touches.length >= 2) {
        isTwoFingerGestureRef.current = true;
        isMultiTouchActiveRef.current = true;
        setIsMultiTouchActive(true);
        // Cancel any in-progress drawing
        if (isDrawing) {
          setIsDrawing(false);
          setStartPoint(null);
          setCurrentPoint(null);
        }
        // DO NOT call preventDefault() - let it bubble for zoom/pan
        return;
      }
      // Single finger: let pointer events handle it (they fire after touch events)
    }, [isDrawing]);

    // Handle native touch move - allow two-finger gestures to pass through
    const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
      // If two or more fingers, this is a zoom/pan gesture
      if (e.touches.length >= 2 || isTwoFingerGestureRef.current) {
        // DO NOT call preventDefault() - let it bubble for zoom/pan
        return;
      }
      // Single finger drawing is handled by pointer events
    }, []);

    // Handle native touch end - reset two-finger gesture flag
    const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
      // Reset flag when all fingers are lifted
      if (e.touches.length === 0) {
        // Delay reset to prevent accidental marks after gesture ends
        setTimeout(() => {
          isTwoFingerGestureRef.current = false;
          isMultiTouchActiveRef.current = false;
          setIsMultiTouchActive(false);
        }, 150);
      }
    }, []);

    // Handle resize - with multiple retries for initial mount
    useEffect(() => {
      // Use requestAnimationFrame to ensure DOM has been laid out before measuring
      // This is critical when the component first appears (isActive becomes true)
      // because getBoundingClientRect may return 0 if called before paint
      //
      // Use multiple retries like SmoothBrushTool to handle cases where container
      // hasn't fully rendered yet
      const timeouts = [0, 50, 100, 200].map((delay) =>
        setTimeout(() => {
          requestAnimationFrame(resizeCanvas);
        }, delay)
      );

      const resizeObserver = new ResizeObserver(() => {
        // Also defer resize handler to ensure accurate measurements
        requestAnimationFrame(resizeCanvas);
      });
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        timeouts.forEach(clearTimeout);
        resizeObserver.disconnect();
      };
    }, [resizeCanvas]);

    // Resize and redraw when zoom state changes (CSS transform changes visual dimensions)
    // ResizeObserver doesn't track transform changes, so we need this separate effect
    useEffect(() => {
      requestAnimationFrame(() => {
        resizeCanvas();
        // Must redraw after resize since zoom changed the visual dimensions
        redrawCanvas();
      });
    }, [zoomState?.scale, resizeCanvas, redrawCanvas]);

    // Redraw when state changes
    useEffect(() => {
      redrawCanvas();
    }, [redrawCanvas]);

    // Don't render if not active and no arrows exist
    if (!isActive && arrows.length === 0) {
      return null;
    }

    return (
      <div
        ref={containerRef}
        className={`absolute inset-0 overflow-hidden ${isActive ? 'z-30' : 'z-10 pointer-events-none'}`}
      >
        <canvas
          ref={canvasRef}
          className={`absolute top-0 left-0 ${
            isActive && !readOnly ? 'cursor-crosshair' : 'pointer-events-none'
          }`}
          style={{
            // Canvas dimensions are set programmatically in resizeCanvas()
            // We use top-0 left-0 positioning instead of inset-0 so explicit
            // width/height styles are respected.
            // IMPORTANT: Use 'pinch-zoom' instead of 'none' to allow two-finger zoom gestures
            // to pass through to the parent FaceChartWithZoom component.
            // This ensures practitioners can ALWAYS zoom in/out regardless of which tool is active.
            touchAction: 'pinch-zoom',
            // CRITICAL: Disable pointer events when tool not active OR during two-finger gestures
            // This allows other tools to receive clicks and zoom gestures to pass through
            pointerEvents: !isActive ? 'none' : (isMultiTouchActive ? 'none' : 'auto'),
          }}
          // Pointer events for drawing (single finger, mouse, stylus)
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onPointerCancel={handlePointerLeave}
          // Native touch events to detect and allow two-finger zoom/pan gestures
          // These fire BEFORE pointer events and let us detect multi-touch early
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {/* Minimal Floating Color Picker - only when active */}
        {isActive && showColorPicker && !readOnly && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-700 p-2 z-40"
            style={{ pointerEvents: 'auto' }}
          >
            <div className="flex items-center gap-2">
              {/* Color Quick Picks */}
              <div className="flex gap-1.5">
                {ARROW_COLORS.map((colorOption) => (
                  <button
                    key={colorOption.id}
                    onClick={() => handleColorChange(colorOption.color)}
                    title={colorOption.label}
                    className={`w-8 h-8 rounded-lg transition-all duration-150 ${
                      selectedColor === colorOption.color
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800 scale-110'
                        : 'hover:scale-105 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: colorOption.color }}
                    aria-label={colorOption.label}
                    aria-pressed={selectedColor === colorOption.color}
                  />
                ))}
              </div>

              {/* Divider */}
              <div className="w-px h-6 bg-gray-600" />

              {/* Undo/Clear Actions */}
              <div className="flex gap-1">
                <button
                  onClick={handleUndo}
                  disabled={!canUndo}
                  title="Undo"
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                    canUndo
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  }`}
                  aria-label="Undo last arrow"
                >
                  <Undo2 size={16} />
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={arrows.length === 0}
                  title="Clear All"
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                    arrows.length > 0
                      ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70'
                      : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  }`}
                  aria-label="Clear all arrows"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Arrow Count Badge */}
              {arrows.length > 0 && (
                <div className="px-2 py-1 bg-gray-700 rounded-md text-xs text-gray-300">
                  {arrows.length} arrow{arrows.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Drag hint */}
            <div className="text-center mt-1.5 text-xs text-gray-500">
              Drag to draw arrow
            </div>
          </div>
        )}
      </div>
    );
  }
);

// =============================================================================
// HOOK FOR MANAGING ARROW STATE
// =============================================================================

export interface UseArrowsStateReturn {
  arrows: Arrow[];
  setArrows: React.Dispatch<React.SetStateAction<Arrow[]>>;
  addArrow: (arrow: Arrow) => void;
  removeArrow: (id: string) => void;
  clearArrows: () => void;
  getArrowsByProduct: (productId: string) => Arrow[];
  arrowCount: number;
}

export function useArrowsState(initialArrows: Arrow[] = []): UseArrowsStateReturn {
  const [arrows, setArrows] = useState<Arrow[]>(initialArrows);

  const addArrow = useCallback((arrow: Arrow) => {
    setArrows((prev) => [...prev, arrow]);
  }, []);

  const removeArrow = useCallback((id: string) => {
    setArrows((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearArrows = useCallback(() => {
    setArrows([]);
  }, []);

  const getArrowsByProduct = useCallback(
    (productId: string) => {
      return arrows.filter((a) => a.productId === productId);
    },
    [arrows]
  );

  return {
    arrows,
    setArrows,
    addArrow,
    removeArrow,
    clearArrows,
    getArrowsByProduct,
    arrowCount: arrows.length,
  };
}

export default ArrowTool;
