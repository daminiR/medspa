'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
  pressure: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

interface FreehandCanvasProps {
  isActive: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  onStrokesChange?: (strokes: Stroke[]) => void;
}

export function FreehandCanvas({
  isActive,
  strokeColor = '#000000',
  strokeWidth = 2,
  onStrokesChange,
}: FreehandCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // =============================================================================
  // TWO-FINGER ZOOM/PAN GESTURE HANDLING
  // =============================================================================
  // Problem: When a user starts a two-finger gesture, the first finger touch starts
  // a stroke before we know the second finger is coming. We need to:
  // 1. Detect two-finger gestures as early as possible
  // 2. Cancel any in-progress stroke when second finger touches
  // 3. Prevent the canvas from receiving further events during the gesture
  // 4. Allow the gesture to pass through to parent FaceChartWithZoom for zoom/pan
  //
  // Solution:
  // - Use native event listeners with { passive: true } for earliest detection
  // - Track touch count and set isMultiTouchActive flag
  // - When second finger detected, cancel any partial stroke that was started
  // - Disable pointer-events on canvas wrapper during multi-touch

  const [isMultiTouchActive, setIsMultiTouchActive] = useState(false);
  const touchCountRef = useRef(0);
  const isTwoFingerGestureRef = useRef(false);
  const strokeCountBeforeMultiTouch = useRef(0);
  const isMultiTouchActiveRef = useRef(false);
  const isDrawingRef = useRef(false);
  const strokesLengthRef = useRef(0);

  // Keep refs in sync with state for use in native event handlers (avoids stale closures)
  useEffect(() => {
    isMultiTouchActiveRef.current = isMultiTouchActive;
  }, [isMultiTouchActive]);

  useEffect(() => {
    isDrawingRef.current = isDrawing;
  }, [isDrawing]);

  useEffect(() => {
    strokesLengthRef.current = strokes.length;
  }, [strokes.length]);

  // Resize canvas to match parent container
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

    // Redraw all strokes after resize
    redrawStrokes();
  }, []);

  // Redraw all strokes on canvas
  const redrawStrokes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

    strokes.forEach((stroke) => {
      drawStroke(ctx, stroke.points, stroke.color, stroke.width);
    });

    if (currentStroke.length > 0) {
      drawStroke(ctx, currentStroke, strokeColor, strokeWidth);
    }
  }, [strokes, currentStroke, strokeColor, strokeWidth]);

  // Draw a single stroke with bezier curves for smoothness
  const drawStroke = (
    ctx: CanvasRenderingContext2D,
    points: Point[],
    color: string,
    width: number
  ) => {
    if (points.length < 2) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];

      // Apply pressure sensitivity to stroke width
      const pressure = p1.pressure || 0.5;
      ctx.lineWidth = width * (0.5 + pressure);

      // Calculate control point for smooth bezier curve
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      ctx.quadraticCurveTo(p1.x, p1.y, midX, midY);
    }

    // Draw line to last point
    const lastPoint = points[points.length - 1];
    ctx.lineTo(lastPoint.x, lastPoint.y);
    ctx.stroke();
  };

  // Get pointer position relative to canvas
  const getPointerPosition = (
    e: React.PointerEvent<HTMLCanvasElement>
  ): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 0.5,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isActive) return;

    // Skip if multi-touch gesture is active
    if (isMultiTouchActiveRef.current) return;

    // Track touch count for touch events
    if (e.pointerType === 'touch') {
      touchCountRef.current++;
      // Record stroke count so we can undo if this becomes a two-finger gesture
      strokeCountBeforeMultiTouch.current = strokes.length;
    }

    // Only prevent default for single-touch to allow pinch-zoom to work
    if (e.pointerType !== 'touch' || touchCountRef.current === 1) {
      e.preventDefault();
    }

    setIsDrawing(true);

    const point = getPointerPosition(e);
    setCurrentStroke([point]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isActive || !isDrawing) return;

    // Skip if multi-touch gesture is active
    if (isMultiTouchActiveRef.current) return;

    // Only prevent default for single-touch to allow pinch-zoom to work
    if (e.pointerType !== 'touch' || touchCountRef.current === 1) {
      e.preventDefault();
    }

    const point = getPointerPosition(e);

    setCurrentStroke((prev) => [...prev, point]);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Decrement touch count for touch events
    if (e.pointerType === 'touch') {
      touchCountRef.current = Math.max(0, touchCountRef.current - 1);
    }

    if (!isActive || !isDrawing) return;

    // Skip if multi-touch gesture is active - don't finalize the stroke
    if (isMultiTouchActiveRef.current) {
      setIsDrawing(false);
      setCurrentStroke([]);
      return;
    }

    // Only prevent default for single-touch to allow pinch-zoom to work
    if (e.pointerType !== 'touch' || touchCountRef.current === 0) {
      e.preventDefault();
    }

    setIsDrawing(false);

    if (currentStroke.length > 1) {
      const newStroke: Stroke = {
        points: currentStroke,
        color: strokeColor,
        width: strokeWidth,
      };
      const newStrokes = [...strokes, newStroke];
      setStrokes(newStrokes);
      onStrokesChange?.(newStrokes);
    }

    setCurrentStroke([]);
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      handlePointerUp(e);
    }
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Decrement touch count for touch events
    if (e.pointerType === 'touch') {
      touchCountRef.current = Math.max(0, touchCountRef.current - 1);
    }

    // Cancel any in-progress stroke
    if (isDrawing) {
      setIsDrawing(false);
      setCurrentStroke([]);
    }
  };

  // Clear all strokes
  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
    onStrokesChange?.([]);
  };

  // Undo last stroke
  const handleUndo = () => {
    if (strokes.length === 0) return;
    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);
    onStrokesChange?.(newStrokes);
  };

  // Export strokes as SVG path string
  const exportToSVGPath = useCallback((): string => {
    return strokes
      .map((stroke) => {
        if (stroke.points.length < 2) return '';

        let path = `M ${stroke.points[0].x} ${stroke.points[0].y}`;

        for (let i = 1; i < stroke.points.length - 1; i++) {
          const p1 = stroke.points[i];
          const p2 = stroke.points[i + 1];
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          path += ` Q ${p1.x} ${p1.y} ${midX} ${midY}`;
        }

        const last = stroke.points[stroke.points.length - 1];
        path += ` L ${last.x} ${last.y}`;

        return path;
      })
      .filter(Boolean)
      .join(' ');
  }, [strokes]);

  // Handle resize
  useEffect(() => {
    resizeCanvas();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [resizeCanvas]);

  // Redraw when strokes change
  useEffect(() => {
    redrawStrokes();
  }, [redrawStrokes]);

  // =============================================================================
  // NATIVE TOUCH EVENT LISTENERS FOR EARLY MULTI-TOUCH DETECTION
  // =============================================================================
  // Use native event listeners for earliest possible detection of multi-touch.
  // This allows us to detect two-finger gestures before React synthetic events fire,
  // giving us the opportunity to cancel any partial stroke that was started.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStartNative = (e: TouchEvent) => {
      const previousCount = touchCountRef.current;
      touchCountRef.current = e.touches.length;

      if (e.touches.length === 1 && previousCount === 0) {
        // First finger down - record current stroke count so we can check
        // if this turns out to be the start of a two-finger gesture
        isTwoFingerGestureRef.current = false;
        strokeCountBeforeMultiTouch.current = strokes.length;
      }

      if (e.touches.length >= 2) {
        // Two-finger gesture detected!
        isTwoFingerGestureRef.current = true;
        isMultiTouchActiveRef.current = true;
        setIsMultiTouchActive(true);

        // CRITICAL: If the first finger already started drawing, cancel the stroke.
        // The user intended a zoom/pan gesture, not a stroke.
        if (isDrawing) {
          setIsDrawing(false);
          setCurrentStroke([]);
        }

        // Don't prevent default here - let the gesture propagate to parent
        // The parent FaceChartWithZoom will handle the zoom/pan
      }
    };

    const handleTouchEndNative = (e: TouchEvent) => {
      touchCountRef.current = e.touches.length;

      if (e.touches.length === 0) {
        // All fingers lifted - reset multi-touch state after a small delay
        // The delay prevents accidental strokes right after the gesture ends
        setTimeout(() => {
          isTwoFingerGestureRef.current = false;
          isMultiTouchActiveRef.current = false;
          setIsMultiTouchActive(false);
        }, 150);
      }
    };

    const handleTouchMoveNative = (e: TouchEvent) => {
      // If multi-touch is active, allow the event to propagate (don't prevent default)
      // This lets the parent handle the zoom/pan gesture
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
  }, [strokes.length, isDrawing]); // Include dependencies that are used in the handlers

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/*
        TWO-FINGER ZOOM/PAN SOLUTION:

        When two-finger gestures occur, we need to:
        1. Completely disable pointer events on the canvas
        2. Allow the gesture to propagate to the parent FaceChartWithZoom for zoom/pan

        Implementation:
        - Native event listeners (useEffect above) detect multi-touch gestures early
        - When second finger touches, we cancel any partial stroke that was started
        - isMultiTouchActive flag disables pointer-events on the canvas
        - touchAction: 'pinch-zoom' allows browser zoom gestures to pass through
        - Parent FaceChartWithZoom's useChartZoomPan hook handles the zoom/pan
      */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 ${isActive ? 'cursor-crosshair' : 'pointer-events-none'}`}
        style={{
          // IMPORTANT: Use 'pinch-zoom' instead of 'none' to allow two-finger zoom gestures
          // to pass through to the parent FaceChartWithZoom component.
          // This ensures practitioners can ALWAYS zoom in/out regardless of which tool is active.
          // Single-finger drawing is still captured by the canvas pointer events.
          touchAction: 'pinch-zoom',
          // CRITICAL: Disable pointer events when tool not active OR during two-finger gestures
          // This allows other tools to receive clicks and zoom gestures to pass through
          pointerEvents: !isActive ? 'none' : (isMultiTouchActive ? 'none' : 'auto'),
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerCancel}
      />

      {isActive && (
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Undo
          </button>
          <button
            onClick={handleClear}
            disabled={strokes.length === 0}
            className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
}

// Export utility function for external use
export function strokesToSVG(strokes: Stroke[], width: number, height: number): string {
  const paths = strokes
    .map((stroke) => {
      if (stroke.points.length < 2) return '';

      let d = `M ${stroke.points[0].x} ${stroke.points[0].y}`;

      for (let i = 1; i < stroke.points.length - 1; i++) {
        const p1 = stroke.points[i];
        const p2 = stroke.points[i + 1];
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        d += ` Q ${p1.x} ${p1.y} ${midX} ${midY}`;
      }

      const last = stroke.points[stroke.points.length - 1];
      d += ` L ${last.x} ${last.y}`;

      return `<path d="${d}" stroke="${stroke.color}" stroke-width="${stroke.width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    })
    .filter(Boolean)
    .join('\n  ');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${paths}
</svg>`;
}

export type { Point, Stroke, FreehandCanvasProps };
