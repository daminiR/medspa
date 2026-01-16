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
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Internal state for arrows (used if not controlled)
    const [internalArrows, setInternalArrows] = useState<Arrow[]>([]);
    const arrows = externalArrows ?? internalArrows;

    // Color selection - simple internal state with smart default
    const [selectedColor, setSelectedColor] = useState<string>(ARROW_COLORS[0].color);

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

    // Resize canvas to match container
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
    }, []);

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
      if (!canvas || !container) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // Draw all saved arrows
      arrows.forEach((arrow) => {
        const fromX = toPixels(arrow.startX, rect.width);
        const fromY = toPixels(arrow.startY, rect.height);
        const toX = toPixels(arrow.endX, rect.width);
        const toY = toPixels(arrow.endY, rect.height);
        drawArrow(ctx, fromX, fromY, toX, toY, arrow.color, arrow.thickness);
      });

      // Draw current arrow being drawn
      if (isDrawing && startPoint && currentPoint) {
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
    }, [arrows, isDrawing, startPoint, currentPoint, selectedColor, drawArrow]);

    // Get pointer position relative to canvas
    const getPointerPosition = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
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

    // Handle pointer down - start drawing
    // Works with touch, mouse, AND stylus (Apple Pencil)
    // Two-finger gestures pass through for zoom/pan
    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isActive || readOnly) return;

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
          const length = distance(startPoint.x, startPoint.y, currentPoint.x, currentPoint.y);

          // Only create arrow if it meets minimum length
          if (length >= MIN_ARROW_LENGTH) {
            const newArrow: Arrow = {
              id: generateArrowId(),
              startX: toPercentage(startPoint.x, rect.width),
              startY: toPercentage(startPoint.y, rect.height),
              endX: toPercentage(currentPoint.x, rect.width),
              endY: toPercentage(currentPoint.y, rect.height),
              color: selectedColor,
              thickness: DEFAULT_THICKNESS,
              productId: productId,
              timestamp: new Date(),
            };

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

    // Handle resize
    useEffect(() => {
      resizeCanvas();

      const resizeObserver = new ResizeObserver(resizeCanvas);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => resizeObserver.disconnect();
    }, [resizeCanvas]);

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
          className={`absolute inset-0 ${
            isActive && !readOnly ? 'cursor-crosshair' : 'pointer-events-none'
          }`}
          style={{
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
                    onClick={() => setSelectedColor(colorOption.color)}
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
