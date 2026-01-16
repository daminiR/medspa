'use client';

import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { DraggablePanel } from './DraggablePanel';
import { useChartingTheme } from '@/contexts/ChartingThemeContext';
import { Circle, Square, PenTool, Trash2, Undo2, Plus } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Shape type options
 */
export type ShapeType = 'circle' | 'rectangle' | 'freeform';

/**
 * A single point in a shape path (for freeform)
 */
export interface ShapePoint {
  x: number;
  y: number;
  timestamp?: number;
}

/**
 * Shape annotation definition
 */
export interface ShapeAnnotation {
  id: string;
  type: ShapeType;
  // Common properties
  color: string;
  fillOpacity: number;
  strokeWidth: number;
  label?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  visible: boolean;
  locked: boolean;
  // Circle specific
  centerX?: number;
  centerY?: number;
  radiusX?: number;
  radiusY?: number;
  // Rectangle specific
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  // Freeform specific
  points?: ShapePoint[];
}

/**
 * Shape tool state for drawing in progress
 */
export interface DrawingState {
  isDrawing: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  points: ShapePoint[];
}

/**
 * Shape Tool Ref interface for imperative actions
 */
export interface ShapeToolRef {
  undo: () => void;
  redo: () => void;
  clearAll: () => void;
  deleteSelected: () => void;
  exportShapes: () => ShapeAnnotation[];
  getSelectedShape: () => ShapeAnnotation | null;
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
 * Props for ShapeTool component
 */
export interface ShapeToolProps {
  /** Whether the shape tool is currently active */
  isActive: boolean;
  /** Current shapes */
  shapes: ShapeAnnotation[];
  /** Callback when shapes change */
  onShapesChange: (shapes: ShapeAnnotation[]) => void;
  /** Currently selected shape ID */
  selectedShapeId?: string | null;
  /** Callback when selection changes */
  onSelectionChange?: (shapeId: string | null) => void;
  /** Whether the canvas is read-only */
  readOnly?: boolean;
  /** Current shape type to draw */
  shapeType?: ShapeType;
  /** Callback when shape type changes */
  onShapeTypeChange?: (type: ShapeType) => void;
  /** Current fill color */
  fillColor?: string;
  /** Callback when fill color changes */
  onFillColorChange?: (color: string) => void;
  /** Current fill opacity (0-1) */
  fillOpacity?: number;
  /** Callback when fill opacity changes */
  onFillOpacityChange?: (opacity: number) => void;
  /** Current stroke width */
  strokeWidth?: number;
  /** Callback when stroke width changes */
  onStrokeWidthChange?: (width: number) => void;
  /** Whether to show the built-in floating toolbar */
  showToolbar?: boolean;
  /** Callback when a shape is completed */
  onShapeComplete?: (shape: ShapeAnnotation) => void;
  /** Available colors for the picker */
  availableColors?: string[];
  /** Auto-close threshold for freeform shapes (pixels) */
  freeformCloseThreshold?: number;
  /**
   * Zoom state from parent (FaceChartWithZoom, etc.)
   * When provided, shapes will transform to stay attached to the zoomed/panned chart.
   * This ensures shapes move with the map when zooming/panning.
   */
  zoomState?: ZoomState;
}

/**
 * Props for ShapeToolbar component
 */
export interface ShapeToolbarProps {
  shapeType: ShapeType;
  onShapeTypeChange: (type: ShapeType) => void;
  fillColor: string;
  onFillColorChange: (color: string) => void;
  fillOpacity: number;
  onFillOpacityChange: (opacity: number) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onUndo?: () => void;
  onClearAll?: () => void;
  canUndo?: boolean;
  isVisible?: boolean;
  defaultCollapsed?: boolean;
  availableColors?: string[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Default colors for shape annotations - simplified to 5 essential colors
 */
export const DEFAULT_SHAPE_COLORS: string[] = [
  '#EF4444', // Red - areas to avoid
  '#22C55E', // Green - safe zones
  '#3B82F6', // Blue - target areas
  '#8B5CF6', // Purple - injection zones
  '#FBBF24', // Amber - treatment areas
];

/**
 * Default fill opacity for shapes
 */
export const DEFAULT_FILL_OPACITY = 0.35;

/**
 * Default stroke width
 */
export const DEFAULT_STROKE_WIDTH = 2;

/**
 * Distance threshold for auto-closing freeform shapes
 */
export const DEFAULT_CLOSE_THRESHOLD = 20;

/**
 * Shape type configurations
 */
export const SHAPE_TYPE_CONFIG: Record<ShapeType, { name: string; icon: React.ReactNode; description: string }> = {
  circle: {
    name: 'Circle/Oval',
    icon: <Circle className="w-4 h-4" />,
    description: 'Tap center, drag to set size',
  },
  rectangle: {
    name: 'Rectangle',
    icon: <Square className="w-4 h-4" />,
    description: 'Tap corner, drag to opposite',
  },
  freeform: {
    name: 'Freeform',
    icon: <PenTool className="w-4 h-4" />,
    description: 'Draw freely, auto-closes',
  },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate unique ID for shapes
 */
export function generateShapeId(): string {
  return `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate distance between two points
 */
function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Check if a point is inside a shape (for selection)
 */
export function isPointInShape(x: number, y: number, shape: ShapeAnnotation): boolean {
  if (!shape.visible) return false;

  switch (shape.type) {
    case 'circle': {
      if (shape.centerX === undefined || shape.centerY === undefined) return false;
      const radiusX = shape.radiusX || 0;
      const radiusY = shape.radiusY || radiusX;
      // Ellipse equation: ((x-h)/a)^2 + ((y-k)/b)^2 <= 1
      const normalizedX = (x - shape.centerX) / radiusX;
      const normalizedY = (y - shape.centerY) / radiusY;
      return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
    }
    case 'rectangle': {
      if (shape.x === undefined || shape.y === undefined) return false;
      return (
        x >= shape.x &&
        x <= shape.x + (shape.width || 0) &&
        y >= shape.y &&
        y <= shape.y + (shape.height || 0)
      );
    }
    case 'freeform': {
      if (!shape.points || shape.points.length < 3) return false;
      // Ray casting algorithm for polygon
      let inside = false;
      const points = shape.points;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const xi = points[i].x;
        const yi = points[i].y;
        const xj = points[j].x;
        const yj = points[j].y;
        if (((yi > y) !== (yj > y)) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside;
        }
      }
      return inside;
    }
    default:
      return false;
  }
}

/**
 * Get bounding box of a shape
 */
export function getShapeBounds(shape: ShapeAnnotation): { x: number; y: number; width: number; height: number } {
  switch (shape.type) {
    case 'circle': {
      const radiusX = shape.radiusX || 0;
      const radiusY = shape.radiusY || radiusX;
      return {
        x: (shape.centerX || 0) - radiusX,
        y: (shape.centerY || 0) - radiusY,
        width: radiusX * 2,
        height: radiusY * 2,
      };
    }
    case 'rectangle': {
      return {
        x: shape.x || 0,
        y: shape.y || 0,
        width: shape.width || 0,
        height: shape.height || 0,
      };
    }
    case 'freeform': {
      if (!shape.points || shape.points.length === 0) {
        return { x: 0, y: 0, width: 0, height: 0 };
      }
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const point of shape.points) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      }
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    default:
      return { x: 0, y: 0, width: 0, height: 0 };
  }
}

/**
 * Convert hex color to rgba string
 */
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
}

/**
 * Smooth freeform path points using Catmull-Rom spline
 */
function smoothFreeformPath(points: ShapePoint[]): ShapePoint[] {
  if (points.length <= 2) return points;

  const smoothed: ShapePoint[] = [];

  for (let i = 0; i < points.length; i++) {
    smoothed.push(points[i]);

    if (i < points.length - 1) {
      // Add midpoint for smoother curves
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];

      // Catmull-Rom interpolation at t=0.5
      const t = 0.5;
      const t2 = t * t;
      const t3 = t2 * t;

      const midX = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
      );

      const midY = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
      );

      smoothed.push({ x: midX, y: midY });
    }
  }

  return smoothed;
}

// =============================================================================
// SHAPE TOOLBAR COMPONENT
// =============================================================================

export function ShapeToolbar({
  shapeType,
  onShapeTypeChange,
  fillColor,
  onFillColorChange,
  fillOpacity,
  onFillOpacityChange,
  strokeWidth,
  onStrokeWidthChange,
  onUndo,
  onClearAll,
  canUndo = false,
  isVisible = true,
  defaultCollapsed = true, // Collapsed by default for minimal distraction
  availableColors = DEFAULT_SHAPE_COLORS,
}: ShapeToolbarProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [defaultPosition, setDefaultPosition] = useState({ x: 16, y: 200 });

  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  // Adjust position on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDefaultPosition({ x: 16, y: Math.min(200, window.innerHeight - 300) });
    }
  }, []);

  if (!isVisible) return null;

  // Collapsed state - minimal floating button
  if (isCollapsed) {
    return (
      <div
        className={`
          fixed z-50 shadow-lg rounded-xl cursor-pointer
          transition-all hover:scale-105
          ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
        `}
        style={{ left: defaultPosition.x, top: defaultPosition.y }}
        onClick={() => setIsCollapsed(false)}
      >
        <div className="flex items-center gap-2 px-3 py-2.5">
          <div
            className="w-5 h-5 rounded-full border-2"
            style={{ backgroundColor: fillColor, borderColor: fillColor }}
          />
          <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Shapes
          </span>
          <Plus className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
      </div>
    );
  }

  // Expanded state - simplified toolbar
  return (
    <DraggablePanel
      panelId="shape-tool-toolbar"
      initialPosition={defaultPosition}
      title="Shapes"
      variant="auto"
      onCollapse={() => setIsCollapsed(true)}
      isCollapsed={false}
      minWidth={200}
    >
      <div className="space-y-3" style={{ pointerEvents: 'auto' }}>
        {/* Shape Type Selector - Simple row of icons */}
        <div className={`flex gap-1 p-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          {(Object.keys(SHAPE_TYPE_CONFIG) as ShapeType[]).map((type) => (
            <button
              key={type}
              onClick={() => onShapeTypeChange(type)}
              className={`
                flex-1 py-2 rounded-md flex items-center justify-center
                transition-colors
                ${shapeType === type
                  ? 'bg-purple-500 text-white'
                  : isDark
                    ? 'text-gray-300 hover:bg-gray-600'
                    : 'text-gray-600 hover:bg-gray-200'
                }
              `}
              title={SHAPE_TYPE_CONFIG[type].description}
            >
              {SHAPE_TYPE_CONFIG[type].icon}
            </button>
          ))}
        </div>

        {/* Quick Color Picker - Direct swatches, no dropdown */}
        <div className="flex gap-1.5 justify-center">
          {availableColors.map((color) => (
            <button
              key={color}
              onClick={() => onFillColorChange(color)}
              className={`
                w-8 h-8 rounded-full border-2 transition-transform hover:scale-110
                ${fillColor === color
                  ? 'border-purple-500 ring-2 ring-purple-400 ring-offset-1'
                  : isDark ? 'border-gray-600' : 'border-gray-300'
                }
              `}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Action Buttons - Minimal */}
        <div className="flex gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`
              flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium
              transition-colors
              ${canUndo
                ? isDark
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : isDark
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClearAll}
            disabled={!canUndo}
            className={`
              flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium
              transition-colors
              ${canUndo
                ? isDark
                  ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
                : isDark
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </DraggablePanel>
  );
}

// =============================================================================
// MAIN SHAPE TOOL COMPONENT
// =============================================================================

export const ShapeTool = forwardRef<ShapeToolRef, ShapeToolProps>(
  function ShapeTool(
    {
      isActive,
      shapes,
      onShapesChange,
      selectedShapeId,
      onSelectionChange,
      readOnly = false,
      shapeType: controlledShapeType,
      onShapeTypeChange,
      fillColor: controlledFillColor,
      onFillColorChange,
      fillOpacity: controlledFillOpacity,
      onFillOpacityChange,
      strokeWidth: controlledStrokeWidth,
      onStrokeWidthChange,
      showToolbar = true,
      onShapeComplete,
      availableColors = DEFAULT_SHAPE_COLORS,
      freeformCloseThreshold = DEFAULT_CLOSE_THRESHOLD,
      zoomState,
    },
    ref
  ) {
    // Canvas refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Drawing state
    const [drawingState, setDrawingState] = useState<DrawingState>({
      isDrawing: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      points: [],
    });
    const [resizeCounter, setResizeCounter] = useState(0);

    // Internal state (when not controlled)
    const [internalShapeType, setInternalShapeType] = useState<ShapeType>('circle');
    const [internalFillColor, setInternalFillColor] = useState(availableColors[0] || '#EF4444');
    const [internalFillOpacity, setInternalFillOpacity] = useState(DEFAULT_FILL_OPACITY);
    const [internalStrokeWidth, setInternalStrokeWidth] = useState(DEFAULT_STROKE_WIDTH);

    // Undo history
    const [undoStack, setUndoStack] = useState<ShapeAnnotation[][]>([]);
    const [redoStack, setRedoStack] = useState<ShapeAnnotation[][]>([]);

    // Use controlled values if provided, otherwise use internal state
    const shapeType = controlledShapeType ?? internalShapeType;
    const fillColor = controlledFillColor ?? internalFillColor;
    const fillOpacity = controlledFillOpacity ?? internalFillOpacity;
    const strokeWidth = controlledStrokeWidth ?? internalStrokeWidth;

    // Setters that work for both controlled and uncontrolled modes
    const setShapeType = useCallback((type: ShapeType) => {
      if (onShapeTypeChange) {
        onShapeTypeChange(type);
      } else {
        setInternalShapeType(type);
      }
    }, [onShapeTypeChange]);

    const setFillColor = useCallback((color: string) => {
      if (onFillColorChange) {
        onFillColorChange(color);
      } else {
        setInternalFillColor(color);
      }
    }, [onFillColorChange]);

    const setFillOpacity = useCallback((opacity: number) => {
      if (onFillOpacityChange) {
        onFillOpacityChange(opacity);
      } else {
        setInternalFillOpacity(opacity);
      }
    }, [onFillOpacityChange]);

    const setStrokeWidth = useCallback((width: number) => {
      if (onStrokeWidthChange) {
        onStrokeWidthChange(width);
      } else {
        setInternalStrokeWidth(width);
      }
    }, [onStrokeWidthChange]);

    // ==========================================================================
    // CANVAS SIZING & RENDERING
    // ==========================================================================

    /**
     * Resize canvas to match parent container
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

      setResizeCounter(prev => prev + 1);
    }, []);

    /**
     * Draw a single shape on canvas
     */
    const drawShape = useCallback(
      (ctx: CanvasRenderingContext2D, shape: ShapeAnnotation, isPreview: boolean = false) => {
        if (!shape.visible && !isPreview) return;

        ctx.save();

        // Set fill style
        ctx.fillStyle = hexToRgba(shape.color, isPreview ? shape.fillOpacity * 0.7 : shape.fillOpacity);
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = shape.strokeWidth;

        switch (shape.type) {
          case 'circle': {
            if (shape.centerX === undefined || shape.centerY === undefined) break;
            const radiusX = shape.radiusX || 0;
            const radiusY = shape.radiusY || radiusX;

            ctx.beginPath();
            ctx.ellipse(shape.centerX, shape.centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
          }
          case 'rectangle': {
            if (shape.x === undefined || shape.y === undefined) break;
            const width = shape.width || 0;
            const height = shape.height || 0;

            ctx.beginPath();
            ctx.rect(shape.x, shape.y, width, height);
            ctx.fill();
            ctx.stroke();
            break;
          }
          case 'freeform': {
            if (!shape.points || shape.points.length < 2) break;

            ctx.beginPath();
            ctx.moveTo(shape.points[0].x, shape.points[0].y);

            for (let i = 1; i < shape.points.length; i++) {
              ctx.lineTo(shape.points[i].x, shape.points[i].y);
            }

            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
          }
        }

        // Draw selection indicator
        if (selectedShapeId === shape.id && !isPreview) {
          const bounds = getShapeBounds(shape);
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = '#A855F7';
          ctx.lineWidth = 2;
          ctx.strokeRect(
            bounds.x - 4,
            bounds.y - 4,
            bounds.width + 8,
            bounds.height + 8
          );
        }

        ctx.restore();
      },
      [selectedShapeId]
    );

    /**
     * Redraw all shapes on canvas
     */
    const redrawCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      // Draw all visible shapes
      for (const shape of shapes) {
        drawShape(ctx, shape);
      }

      // Draw current drawing preview
      if (drawingState.isDrawing) {
        const previewShape: ShapeAnnotation = {
          id: 'preview',
          type: shapeType,
          color: fillColor,
          fillOpacity: fillOpacity,
          strokeWidth: strokeWidth,
          createdAt: new Date(),
          updatedAt: new Date(),
          visible: true,
          locked: false,
        };

        switch (shapeType) {
          case 'circle': {
            const radiusX = Math.abs(drawingState.currentX - drawingState.startX);
            const radiusY = Math.abs(drawingState.currentY - drawingState.startY);
            previewShape.centerX = drawingState.startX;
            previewShape.centerY = drawingState.startY;
            previewShape.radiusX = radiusX;
            previewShape.radiusY = radiusY;
            break;
          }
          case 'rectangle': {
            const x = Math.min(drawingState.startX, drawingState.currentX);
            const y = Math.min(drawingState.startY, drawingState.currentY);
            const width = Math.abs(drawingState.currentX - drawingState.startX);
            const height = Math.abs(drawingState.currentY - drawingState.startY);
            previewShape.x = x;
            previewShape.y = y;
            previewShape.width = width;
            previewShape.height = height;
            break;
          }
          case 'freeform': {
            if (drawingState.points.length >= 2) {
              previewShape.points = drawingState.points;
            }
            break;
          }
        }

        drawShape(ctx, previewShape, true);
      }
    }, [shapes, drawingState, shapeType, fillColor, fillOpacity, strokeWidth, drawShape]);

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
    }, [redrawCanvas, resizeCounter]);

    // ==========================================================================
    // POINTER EVENT HANDLERS
    // ==========================================================================

    /**
     * Get pointer position relative to canvas, accounting for zoom transform
     *
     * When the canvas has a CSS transform (scale + translate) applied for zoom/pan,
     * we need to convert screen coordinates to canvas coordinates.
     *
     * The getBoundingClientRect() returns the transformed bounds, so we need to:
     * 1. Get the position relative to the transformed rect (screen space)
     * 2. Divide by the zoom scale to convert to canvas space
     */
    const getPointerPosition = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();

        // Position relative to the transformed canvas rect (in screen pixels)
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;

        // If we have zoom state, convert from screen coordinates to canvas coordinates
        // The canvas is scaled by zoomState.scale, so we divide to get canvas coords
        if (zoomState && zoomState.scale !== 1) {
          return {
            x: screenX / zoomState.scale,
            y: screenY / zoomState.scale,
          };
        }

        return { x: screenX, y: screenY };
      },
      [zoomState]
    );

    // Track active touch count for two-finger gesture detection
    const touchCountRef = useRef(0);
    // Track if we're in a multi-touch gesture (pinch-zoom)
    const isMultiTouchRef = useRef(false);
    // Track the pointer ID we're using for drawing (to ignore other touches)
    const activePointerIdRef = useRef<number | null>(null);

    // State to toggle pointer-events during multi-touch gestures
    // This allows zoom/pan gestures to pass through to parent FaceChartWithZoom
    const [isMultiTouchActive, setIsMultiTouchActive] = useState(false);
    const isMultiTouchActiveRef = useRef(false);

    // Track timeout for resetting multi-touch state (shared across handlers)
    const pointerMultiTouchResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Keep ref in sync with state for use in event handlers
    useEffect(() => {
      isMultiTouchActiveRef.current = isMultiTouchActive;
    }, [isMultiTouchActive]);

    // FAILSAFE: Reset multi-touch state when tool becomes inactive
    // This prevents the tool from getting stuck in a "disabled" state
    useEffect(() => {
      if (!isActive) {
        // Clear any pending timeouts
        if (pointerMultiTouchResetTimeoutRef.current) {
          clearTimeout(pointerMultiTouchResetTimeoutRef.current);
          pointerMultiTouchResetTimeoutRef.current = null;
        }
        // Reset all multi-touch tracking state
        touchCountRef.current = 0;
        isMultiTouchRef.current = false;
        isMultiTouchActiveRef.current = false;
        setIsMultiTouchActive(false);
        activePointerIdRef.current = null;
      }
    }, [isActive]);

    /**
     * Handle pointer down - start drawing or select shape
     * Two-finger gestures pass through for zoom/pan
     */
    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isActive || readOnly) return;

        // Track touch count for multi-touch detection
        if (e.pointerType === 'touch') {
          touchCountRef.current++;

          // If this is a second finger (or more), mark as multi-touch gesture
          // and cancel any ongoing drawing - let parent handle zoom/pan
          if (touchCountRef.current > 1) {
            isMultiTouchRef.current = true;
            isMultiTouchActiveRef.current = true;
            setIsMultiTouchActive(true);
            // Cancel any drawing in progress
            if (drawingState.isDrawing) {
              setDrawingState({
                isDrawing: false,
                startX: 0,
                startY: 0,
                currentX: 0,
                currentY: 0,
                points: [],
              });
              // Remove from undo stack since we're canceling
              setUndoStack(prev => prev.slice(0, -1));
            }
            activePointerIdRef.current = null;
            return;
          }

          // If we were recently in a multi-touch gesture, wait a bit before allowing drawing
          // This prevents accidental drawing when lifting one finger from a pinch gesture
          if (isMultiTouchRef.current) {
            return;
          }

          // Track this as our active drawing pointer
          activePointerIdRef.current = e.pointerId;
        }

        // IMPORTANT: Only preventDefault for single-touch/mouse drawing
        // This allows multi-touch gestures to bubble up for zoom/pan
        e.preventDefault();
        const pos = getPointerPosition(e);

        // Check if clicking on existing shape for selection
        for (const shape of [...shapes].reverse()) {
          if (isPointInShape(pos.x, pos.y, shape)) {
            onSelectionChange?.(shape.id);
            return;
          }
        }

        // Deselect and start new shape
        onSelectionChange?.(null);

        setDrawingState({
          isDrawing: true,
          startX: pos.x,
          startY: pos.y,
          currentX: pos.x,
          currentY: pos.y,
          points: shapeType === 'freeform' ? [{ x: pos.x, y: pos.y, timestamp: Date.now() }] : [],
        });

        // Save current state to undo stack
        setUndoStack(prev => [...prev, shapes]);
        setRedoStack([]);
      },
      [isActive, readOnly, shapes, shapeType, getPointerPosition, onSelectionChange]
    );

    /**
     * Handle pointer move - update drawing
     * Two-finger gestures pass through for zoom/pan
     */
    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isActive || !drawingState.isDrawing || readOnly) return;

        // Don't process if multi-touch gesture is happening
        if (e.pointerType === 'touch') {
          if (isMultiTouchRef.current || touchCountRef.current > 1) {
            return;
          }
          // Only process events from the pointer we started drawing with
          if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) {
            return;
          }
        }

        e.preventDefault();
        const pos = getPointerPosition(e);

        if (shapeType === 'freeform') {
          // Only add point if moved minimum distance
          const lastPoint = drawingState.points[drawingState.points.length - 1];
          if (lastPoint) {
            const distance = calculateDistance(pos.x, pos.y, lastPoint.x, lastPoint.y);
            if (distance < 4) return;
          }

          setDrawingState(prev => ({
            ...prev,
            currentX: pos.x,
            currentY: pos.y,
            points: [...prev.points, { x: pos.x, y: pos.y, timestamp: Date.now() }],
          }));
        } else {
          setDrawingState(prev => ({
            ...prev,
            currentX: pos.x,
            currentY: pos.y,
          }));
        }
      },
      [isActive, readOnly, drawingState.isDrawing, drawingState.points, shapeType, getPointerPosition]
    );

    /**
     * Handle pointer up - complete shape
     * Two-finger gestures pass through for zoom/pan
     */
    const handlePointerUp = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        // Track touch count for multi-touch detection
        if (e.pointerType === 'touch') {
          touchCountRef.current = Math.max(0, touchCountRef.current - 1);

          // When all touches are released, reset the multi-touch flag after a short delay
          // This prevents accidental drawing immediately after a pinch gesture
          if (touchCountRef.current === 0) {
            // Clear any existing timeout to prevent race conditions
            if (pointerMultiTouchResetTimeoutRef.current) {
              clearTimeout(pointerMultiTouchResetTimeoutRef.current);
            }
            pointerMultiTouchResetTimeoutRef.current = setTimeout(() => {
              isMultiTouchRef.current = false;
              isMultiTouchActiveRef.current = false;
              setIsMultiTouchActive(false);
              pointerMultiTouchResetTimeoutRef.current = null;
            }, 150); // 150ms debounce to prevent accidental drawing
          }

          // If this was a multi-touch gesture, don't complete any shape
          if (isMultiTouchRef.current) {
            return;
          }

          // Only process if this is our active drawing pointer
          if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) {
            return;
          }
        }

        if (!isActive || !drawingState.isDrawing || readOnly) return;

        e.preventDefault();
        const pos = getPointerPosition(e);

        let newShape: ShapeAnnotation | null = null;

        switch (shapeType) {
          case 'circle': {
            const radiusX = Math.abs(pos.x - drawingState.startX);
            const radiusY = Math.abs(pos.y - drawingState.startY);

            // Only create if has meaningful size
            if (radiusX > 5 || radiusY > 5) {
              newShape = {
                id: generateShapeId(),
                type: 'circle',
                color: fillColor,
                fillOpacity: fillOpacity,
                strokeWidth: strokeWidth,
                centerX: drawingState.startX,
                centerY: drawingState.startY,
                radiusX: radiusX,
                radiusY: radiusY,
                createdAt: new Date(),
                updatedAt: new Date(),
                visible: true,
                locked: false,
              };
            }
            break;
          }
          case 'rectangle': {
            const width = Math.abs(pos.x - drawingState.startX);
            const height = Math.abs(pos.y - drawingState.startY);

            // Only create if has meaningful size
            if (width > 5 || height > 5) {
              newShape = {
                id: generateShapeId(),
                type: 'rectangle',
                color: fillColor,
                fillOpacity: fillOpacity,
                strokeWidth: strokeWidth,
                x: Math.min(drawingState.startX, pos.x),
                y: Math.min(drawingState.startY, pos.y),
                width: width,
                height: height,
                createdAt: new Date(),
                updatedAt: new Date(),
                visible: true,
                locked: false,
              };
            }
            break;
          }
          case 'freeform': {
            const finalPoints = [...drawingState.points, { x: pos.x, y: pos.y, timestamp: Date.now() }];

            // Only create if has enough points
            if (finalPoints.length >= 3) {
              // Check if should auto-close
              const firstPoint = finalPoints[0];
              const lastPoint = finalPoints[finalPoints.length - 1];
              const distance = calculateDistance(firstPoint.x, firstPoint.y, lastPoint.x, lastPoint.y);

              // Smooth and optionally close the path
              const smoothedPoints = smoothFreeformPath(finalPoints);

              newShape = {
                id: generateShapeId(),
                type: 'freeform',
                color: fillColor,
                fillOpacity: fillOpacity,
                strokeWidth: strokeWidth,
                points: smoothedPoints,
                createdAt: new Date(),
                updatedAt: new Date(),
                visible: true,
                locked: false,
              };
            }
            break;
          }
        }

        if (newShape) {
          const newShapes = [...shapes, newShape];
          onShapesChange(newShapes);
          onShapeComplete?.(newShape);
        } else {
          // No shape created, remove from undo stack
          setUndoStack(prev => prev.slice(0, -1));
        }

        setDrawingState({
          isDrawing: false,
          startX: 0,
          startY: 0,
          currentX: 0,
          currentY: 0,
          points: [],
        });
      },
      [
        isActive,
        readOnly,
        drawingState,
        shapeType,
        fillColor,
        fillOpacity,
        strokeWidth,
        shapes,
        getPointerPosition,
        onShapesChange,
        onShapeComplete,
      ]
    );

    /**
     * Handle pointer leave - cancel drawing
     * Also handles pointer cancel for multi-touch scenarios
     */
    const handlePointerLeave = useCallback(
      (e: React.PointerEvent<HTMLCanvasElement>) => {
        // Track touch count for multi-touch detection
        if (e.pointerType === 'touch') {
          touchCountRef.current = Math.max(0, touchCountRef.current - 1);

          // When all touches are released, reset the multi-touch flag
          if (touchCountRef.current === 0) {
            // Clear any existing timeout to prevent race conditions
            if (pointerMultiTouchResetTimeoutRef.current) {
              clearTimeout(pointerMultiTouchResetTimeoutRef.current);
            }
            pointerMultiTouchResetTimeoutRef.current = setTimeout(() => {
              isMultiTouchRef.current = false;
              isMultiTouchActiveRef.current = false;
              setIsMultiTouchActive(false);
              pointerMultiTouchResetTimeoutRef.current = null;
            }, 150);
          }

          // If leaving during a multi-touch gesture, don't finalize drawing
          if (isMultiTouchRef.current) {
            return;
          }
        }

        if (drawingState.isDrawing && !isMultiTouchRef.current) {
          handlePointerUp(e);
        }
      },
      [drawingState.isDrawing, handlePointerUp]
    );

    // ==========================================================================
    // ACTION HANDLERS
    // ==========================================================================

    /**
     * Undo last action
     */
    const handleUndo = useCallback(() => {
      if (undoStack.length === 0) return;

      const previousState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [...prev, shapes]);
      setUndoStack(prev => prev.slice(0, -1));
      onShapesChange(previousState);
      onSelectionChange?.(null);
    }, [undoStack, shapes, onShapesChange, onSelectionChange]);

    /**
     * Redo last undone action
     */
    const handleRedo = useCallback(() => {
      if (redoStack.length === 0) return;

      const nextState = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, shapes]);
      setRedoStack(prev => prev.slice(0, -1));
      onShapesChange(nextState);
      onSelectionChange?.(null);
    }, [redoStack, shapes, onShapesChange, onSelectionChange]);

    /**
     * Clear all shapes
     */
    const handleClearAll = useCallback(() => {
      if (shapes.length === 0) return;

      setUndoStack(prev => [...prev, shapes]);
      setRedoStack([]);
      onShapesChange([]);
      onSelectionChange?.(null);
    }, [shapes, onShapesChange, onSelectionChange]);

    /**
     * Delete selected shape
     */
    const handleDeleteSelected = useCallback(() => {
      if (!selectedShapeId) return;

      setUndoStack(prev => [...prev, shapes]);
      setRedoStack([]);
      const newShapes = shapes.filter(s => s.id !== selectedShapeId);
      onShapesChange(newShapes);
      onSelectionChange?.(null);
    }, [selectedShapeId, shapes, onShapesChange, onSelectionChange]);

    /**
     * Get selected shape
     */
    const getSelectedShape = useCallback(() => {
      if (!selectedShapeId) return null;
      return shapes.find(s => s.id === selectedShapeId) || null;
    }, [selectedShapeId, shapes]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      undo: handleUndo,
      redo: handleRedo,
      clearAll: handleClearAll,
      deleteSelected: handleDeleteSelected,
      exportShapes: () => shapes,
      getSelectedShape,
    }), [handleUndo, handleRedo, handleClearAll, handleDeleteSelected, shapes, getSelectedShape]);

    // ==========================================================================
    // NATIVE TOUCH EVENT HANDLING FOR MULTI-TOUCH DETECTION
    // ==========================================================================
    // We need native touch events to detect multi-touch BEFORE pointer events fire.
    // This allows us to properly identify pinch-zoom gestures and let them pass through.

    // Use a ref to track drawing state without causing effect re-runs
    const drawingStateRef = useRef(drawingState);
    drawingStateRef.current = drawingState;

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !isActive) return;

      const handleNativeTouchStart = (e: TouchEvent) => {
        // Update touch count immediately on native touch event
        // This runs before pointer events, so we can detect multi-touch early
        touchCountRef.current = e.touches.length;

        if (e.touches.length >= 2) {
          // Multi-touch detected! Set the flag BEFORE pointer events fire
          isMultiTouchRef.current = true;
          isMultiTouchActiveRef.current = true;
          setIsMultiTouchActive(true);
          activePointerIdRef.current = null;

          // Cancel any drawing in progress - use ref to avoid stale closure
          if (drawingStateRef.current.isDrawing) {
            setDrawingState({
              isDrawing: false,
              startX: 0,
              startY: 0,
              currentX: 0,
              currentY: 0,
              points: [],
            });
            setUndoStack(prev => prev.slice(0, -1));
          }

          // DON'T preventDefault - let the browser handle pinch-zoom
        }
      };

      const handleNativeTouchEnd = (e: TouchEvent) => {
        touchCountRef.current = e.touches.length;

        // Reset multi-touch flag when all touches are released
        if (e.touches.length === 0) {
          // Clear any existing timeout to prevent race conditions
          // Use the shared timeout ref for all multi-touch resets
          if (pointerMultiTouchResetTimeoutRef.current) {
            clearTimeout(pointerMultiTouchResetTimeoutRef.current);
          }
          pointerMultiTouchResetTimeoutRef.current = setTimeout(() => {
            isMultiTouchRef.current = false;
            isMultiTouchActiveRef.current = false;
            setIsMultiTouchActive(false);
            pointerMultiTouchResetTimeoutRef.current = null;
          }, 150);
        }
      };

      // Use passive: true so browser handles gestures natively
      canvas.addEventListener('touchstart', handleNativeTouchStart, { passive: true });
      canvas.addEventListener('touchend', handleNativeTouchEnd, { passive: true });
      canvas.addEventListener('touchcancel', handleNativeTouchEnd, { passive: true });

      return () => {
        canvas.removeEventListener('touchstart', handleNativeTouchStart);
        canvas.removeEventListener('touchend', handleNativeTouchEnd);
        canvas.removeEventListener('touchcancel', handleNativeTouchEnd);
        // Note: Don't clear the timeout here - let the failsafe effect handle cleanup
      };
    }, [isActive]); // FIXED: Removed drawingState.isDrawing from dependencies

    // ==========================================================================
    // RENDER
    // ==========================================================================

    return (
      <div
        ref={containerRef}
        className={`absolute inset-0 overflow-hidden z-20 ${isActive ? '' : 'pointer-events-none'}`}
      >
        {/* Canvas for shape drawing - transforms with zoom/pan to stay attached to the chart */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 z-[15] ${isActive ? 'cursor-crosshair' : 'pointer-events-none'}`}
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
        />

        {/* Floating toolbar */}
        {isActive && showToolbar && (
          <ShapeToolbar
            shapeType={shapeType}
            onShapeTypeChange={setShapeType}
            fillColor={fillColor}
            onFillColorChange={setFillColor}
            fillOpacity={fillOpacity}
            onFillOpacityChange={setFillOpacity}
            strokeWidth={strokeWidth}
            onStrokeWidthChange={setStrokeWidth}
            onUndo={handleUndo}
            onClearAll={handleClearAll}
            canUndo={undoStack.length > 0}
            availableColors={availableColors}
          />
        )}

        {/* Selection controls */}
        {selectedShapeId && isActive && (
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
);

// =============================================================================
// HOOK FOR MANAGING SHAPE STATE
// =============================================================================

export interface UseShapesStateOptions {
  /** Initial shapes */
  initialShapes?: ShapeAnnotation[];
}

export interface UseShapesStateReturn {
  shapes: ShapeAnnotation[];
  selectedShapeId: string | null;
  setShapes: (shapes: ShapeAnnotation[]) => void;
  setSelectedShapeId: (id: string | null) => void;
  addShape: (shape: ShapeAnnotation) => void;
  updateShape: (id: string, updates: Partial<ShapeAnnotation>) => void;
  deleteShape: (id: string) => void;
  toggleShapeVisibility: (id: string) => void;
  clearAllShapes: () => void;
  getShapesByType: (type: ShapeType) => ShapeAnnotation[];
  getTotalShapeCount: () => number;
}

export function useShapesState({
  initialShapes = [],
}: UseShapesStateOptions = {}): UseShapesStateReturn {
  const [shapes, setShapesInternal] = useState<ShapeAnnotation[]>(initialShapes);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);

  const setShapes = useCallback((newShapes: ShapeAnnotation[]) => {
    setShapesInternal(newShapes);
  }, []);

  const addShape = useCallback((shape: ShapeAnnotation) => {
    setShapesInternal(prev => [...prev, shape]);
  }, []);

  const updateShape = useCallback((id: string, updates: Partial<ShapeAnnotation>) => {
    setShapesInternal(prev =>
      prev.map(shape =>
        shape.id === id
          ? { ...shape, ...updates, updatedAt: new Date() }
          : shape
      )
    );
  }, []);

  const deleteShape = useCallback((id: string) => {
    setShapesInternal(prev => prev.filter(shape => shape.id !== id));
    if (selectedShapeId === id) {
      setSelectedShapeId(null);
    }
  }, [selectedShapeId]);

  const toggleShapeVisibility = useCallback((id: string) => {
    setShapesInternal(prev =>
      prev.map(shape =>
        shape.id === id ? { ...shape, visible: !shape.visible } : shape
      )
    );
  }, []);

  const clearAllShapes = useCallback(() => {
    setShapesInternal([]);
    setSelectedShapeId(null);
  }, []);

  const getShapesByType = useCallback(
    (type: ShapeType) => {
      return shapes.filter(shape => shape.type === type);
    },
    [shapes]
  );

  const getTotalShapeCount = useCallback(() => {
    return shapes.length;
  }, [shapes]);

  return {
    shapes,
    selectedShapeId,
    setShapes,
    setSelectedShapeId,
    addShape,
    updateShape,
    deleteShape,
    toggleShapeVisibility,
    clearAllShapes,
    getShapesByType,
    getTotalShapeCount,
  };
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default ShapeTool;
