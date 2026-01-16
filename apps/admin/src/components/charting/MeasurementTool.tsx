'use client';

/**
 * MeasurementTool - Simple two-point measurement tool for medical charting
 *
 * Designed for minimal cognitive load during treatments:
 * - Click/tap first point to start
 * - Click/tap second point to complete
 * - Tap a measurement to select, then delete
 * - Press Escape to cancel, Delete to remove selected
 *
 * TWO-FINGER ZOOM/PAN:
 * - Two-finger gestures are passed through to parent FaceChartWithZoom
 * - Only single-finger touches are captured for measurement placement
 * - This ensures practitioners can ALWAYS zoom/pan regardless of active tool
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { useChartingTheme } from '@/contexts/ChartingThemeContext';

// =============================================================================
// TYPES
// =============================================================================

export interface MeasurementPoint {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}

export interface Measurement {
  id: string;
  startPoint: MeasurementPoint;
  endPoint: MeasurementPoint;
  distancePx: number; // distance in pixels
  distanceMm: number; // distance in mm (after calibration)
  label?: string; // optional custom label (e.g., "Brow lift")
  timestamp: Date;
}

export interface CalibrationData {
  isCalibrated: boolean;
  pixelsPerMm: number;
  referenceType: 'face-width' | 'custom';
  referenceValueMm: number;
  referencePx: number;
}

/**
 * Zoom state for coordinating with parent zoom/pan container
 */
export interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface MeasurementToolProps {
  /** Whether the measurement tool is active */
  isActive: boolean;
  /** Current measurements */
  measurements: Measurement[];
  /** Callback when measurements change */
  onMeasurementsChange: (measurements: Measurement[]) => void;
  /** Calibration data for accurate measurements */
  calibration: CalibrationData;
  /** Callback when calibration changes */
  onCalibrationChange: (calibration: CalibrationData) => void;
  /** Container ref for coordinate calculations */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Zoom level for counter-scaling (optional - defaults to 1) */
  zoom?: number;
  /** Whether to show as mm (false) or cm (true) - simplified: always mm */
  showCm?: boolean;
  /** Read-only mode */
  readOnly?: boolean;
  /**
   * Zoom state from parent (FaceChartWithZoom, etc.)
   * When provided, measurements will transform to stay attached to the zoomed/panned chart.
   */
  zoomState?: ZoomState;
}

// =============================================================================
// CONSTANTS
// =============================================================================

// Standard face width in mm for auto-calibration
const STANDARD_FACE_WIDTH_MM = 140; // 14 cm average face width

// Default calibration (assume 500px = 140mm for typical face chart)
const DEFAULT_CALIBRATION: CalibrationData = {
  isCalibrated: false,
  pixelsPerMm: 500 / STANDARD_FACE_WIDTH_MM, // ~3.57 px/mm
  referenceType: 'face-width',
  referenceValueMm: STANDARD_FACE_WIDTH_MM,
  referencePx: 500,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate distance between two points in pixels
 */
function calculatePixelDistance(
  p1: MeasurementPoint,
  p2: MeasurementPoint,
  containerWidth: number,
  containerHeight: number
): number {
  const x1Px = (p1.x / 100) * containerWidth;
  const y1Px = (p1.y / 100) * containerHeight;
  const x2Px = (p2.x / 100) * containerWidth;
  const y2Px = (p2.y / 100) * containerHeight;

  return Math.sqrt(Math.pow(x2Px - x1Px, 2) + Math.pow(y2Px - y1Px, 2));
}

/**
 * Convert pixel distance to mm using calibration
 */
function pxToMm(px: number, calibration: CalibrationData): number {
  return px / calibration.pixelsPerMm;
}

/**
 * Format measurement for display
 */
function formatMeasurement(mm: number, showCm: boolean): string {
  if (showCm) {
    return `${(mm / 10).toFixed(1)} cm`;
  }
  return `${mm.toFixed(1)} mm`;
}

/**
 * Calculate angle of a line for label rotation
 */
function calculateAngle(p1: MeasurementPoint, p2: MeasurementPoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  let angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Keep label readable (not upside down)
  if (angle > 90) angle -= 180;
  if (angle < -90) angle += 180;

  return angle;
}

/**
 * Calculate midpoint of a line
 */
function getMidpoint(p1: MeasurementPoint, p2: MeasurementPoint): MeasurementPoint {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

// =============================================================================
// MEASUREMENT OVERLAY COMPONENT
// =============================================================================

interface MeasurementOverlayProps {
  measurements: Measurement[];
  pendingPoint: MeasurementPoint | null;
  mousePosition: MeasurementPoint | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
  calibration: CalibrationData;
  showCm: boolean;
  zoom: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isActive: boolean;
  readOnly: boolean;
  /** Zoom state for following chart zoom/pan transforms */
  zoomState?: ZoomState;
}

function MeasurementOverlay({
  measurements,
  pendingPoint,
  mousePosition,
  selectedId,
  onSelect,
  onDelete,
  calibration,
  showCm,
  zoom,
  containerRef,
  isActive,
  readOnly,
  zoomState,
}: MeasurementOverlayProps) {
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  // Scale for points to stay consistent size at different zoom levels
  const pointScale = 1 / zoom;

  // Calculate pending measurement distance for live preview
  const pendingDistance = useMemo(() => {
    if (!pendingPoint || !mousePosition || !containerRef.current) return null;

    const rect = containerRef.current.getBoundingClientRect();
    const distancePx = calculatePixelDistance(
      pendingPoint,
      mousePosition,
      rect.width,
      rect.height
    );
    const distanceMm = pxToMm(distancePx, calibration);

    return { distancePx, distanceMm };
  }, [pendingPoint, mousePosition, containerRef, calibration]);

  // Calculate the transform to match the parent zoom/pan container
  // This ensures measurements stay "attached to the map" when zooming/panning
  const svgTransform = zoomState
    ? `scale(${zoomState.scale}) translate(${zoomState.translateX / zoomState.scale}px, ${zoomState.translateY / zoomState.scale}px)`
    : undefined;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        overflow: 'visible',
        // Apply the same transform as the parent zoom/pan container so measurements follow the chart
        // This makes measurements "attached to the map" - when you zoom in, measurements move with the face chart
        transform: svgTransform,
        transformOrigin: 'center center',
      }}
    >
      <defs>
        {/* Gradient for lines */}
        <linearGradient id="measureLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={isDark ? '#60A5FA' : '#3B82F6'} />
          <stop offset="100%" stopColor={isDark ? '#A78BFA' : '#8B5CF6'} />
        </linearGradient>

        {/* Drop shadow filter for labels */}
        <filter id="labelShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Render completed measurements */}
      {measurements.map((m) => {
        const isSelected = selectedId === m.id;
        const midpoint = getMidpoint(m.startPoint, m.endPoint);
        const angle = calculateAngle(m.startPoint, m.endPoint);

        return (
          <g key={m.id} className="measurement-group">
            {/* Measurement line */}
            <line
              x1={`${m.startPoint.x}%`}
              y1={`${m.startPoint.y}%`}
              x2={`${m.endPoint.x}%`}
              y2={`${m.endPoint.y}%`}
              stroke={isSelected ? '#EF4444' : 'url(#measureLineGradient)'}
              strokeWidth={isSelected ? 3 : 2}
              strokeLinecap="round"
              strokeDasharray={isSelected ? 'none' : 'none'}
              className="transition-all duration-150"
            />

            {/* End caps (small circles at endpoints) */}
            {[m.startPoint, m.endPoint].map((point, idx) => (
              <circle
                key={idx}
                cx={`${point.x}%`}
                cy={`${point.y}%`}
                r={isSelected ? 5 * pointScale : 4 * pointScale}
                fill={isSelected ? '#EF4444' : isDark ? '#60A5FA' : '#3B82F6'}
                stroke={isDark ? '#1F2937' : '#FFFFFF'}
                strokeWidth={2 * pointScale}
                className="transition-all duration-150"
              />
            ))}

            {/* Clickable hit area (invisible but captures clicks) */}
            {!readOnly && (
              <line
                x1={`${m.startPoint.x}%`}
                y1={`${m.startPoint.y}%`}
                x2={`${m.endPoint.x}%`}
                y2={`${m.endPoint.y}%`}
                stroke="transparent"
                strokeWidth={20}
                strokeLinecap="round"
                className="pointer-events-auto cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(isSelected ? null : m.id);
                }}
              />
            )}

            {/* Measurement label */}
            <g
              transform={`
                translate(${midpoint.x}%, ${midpoint.y}%)
              `}
              filter="url(#labelShadow)"
            >
              {/* Background pill */}
              <rect
                x={-30 * pointScale}
                y={-14 * pointScale - 6}
                width={60 * pointScale}
                height={20 * pointScale}
                rx={10 * pointScale}
                fill={isSelected ? '#EF4444' : isDark ? '#374151' : '#FFFFFF'}
                stroke={isSelected ? '#DC2626' : isDark ? '#4B5563' : '#E5E7EB'}
                strokeWidth={1}
                className="transition-all duration-150"
              />

              {/* Distance text */}
              <text
                x={0}
                y={-8 * pointScale}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isSelected ? '#FFFFFF' : isDark ? '#E5E7EB' : '#374151'}
                fontSize={11 * pointScale}
                fontWeight="600"
                fontFamily="system-ui, -apple-system, sans-serif"
                className="select-none"
              >
                {formatMeasurement(m.distanceMm, showCm)}
              </text>
            </g>

            {/* Delete button when selected */}
            {isSelected && !readOnly && (
              <g
                transform={`translate(${m.endPoint.x}%, ${m.endPoint.y}%)`}
                className="pointer-events-auto cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(m.id);
                }}
              >
                <circle
                  cx={20 * pointScale}
                  cy={-20 * pointScale}
                  r={14 * pointScale}
                  fill="#EF4444"
                  stroke="#DC2626"
                  strokeWidth={1}
                />
                <text
                  x={20 * pointScale}
                  y={-20 * pointScale}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#FFFFFF"
                  fontSize={14 * pointScale}
                  fontWeight="bold"
                >
                  x
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Pending measurement (in progress) */}
      {isActive && pendingPoint && mousePosition && (
        <g className="pending-measurement">
          {/* Preview line */}
          <line
            x1={`${pendingPoint.x}%`}
            y1={`${pendingPoint.y}%`}
            x2={`${mousePosition.x}%`}
            y2={`${mousePosition.y}%`}
            stroke={isDark ? '#60A5FA' : '#3B82F6'}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="4 4"
            opacity={0.8}
          />

          {/* Start point */}
          <circle
            cx={`${pendingPoint.x}%`}
            cy={`${pendingPoint.y}%`}
            r={6 * pointScale}
            fill={isDark ? '#60A5FA' : '#3B82F6'}
            stroke={isDark ? '#1F2937' : '#FFFFFF'}
            strokeWidth={2 * pointScale}
            className="animate-pulse"
          />

          {/* End point (preview) */}
          <circle
            cx={`${mousePosition.x}%`}
            cy={`${mousePosition.y}%`}
            r={5 * pointScale}
            fill={isDark ? '#60A5FA' : '#3B82F6'}
            stroke={isDark ? '#1F2937' : '#FFFFFF'}
            strokeWidth={2 * pointScale}
            opacity={0.6}
          />

          {/* Live distance preview */}
          {pendingDistance && (
            <g
              transform={`translate(${getMidpoint(pendingPoint, mousePosition).x}%, ${
                getMidpoint(pendingPoint, mousePosition).y
              }%)`}
            >
              <rect
                x={-30 * pointScale}
                y={-14 * pointScale - 6}
                width={60 * pointScale}
                height={20 * pointScale}
                rx={10 * pointScale}
                fill={isDark ? '#374151' : '#FFFFFF'}
                stroke={isDark ? '#60A5FA' : '#3B82F6'}
                strokeWidth={1}
                opacity={0.9}
              />
              <text
                x={0}
                y={-8 * pointScale}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isDark ? '#E5E7EB' : '#374151'}
                fontSize={11 * pointScale}
                fontWeight="600"
                fontFamily="system-ui, -apple-system, sans-serif"
                opacity={0.9}
              >
                {formatMeasurement(pendingDistance.distanceMm, showCm)}
              </text>
            </g>
          )}
        </g>
      )}

      {/* Pending point indicator (when waiting for second point) */}
      {isActive && pendingPoint && !mousePosition && (
        <circle
          cx={`${pendingPoint.x}%`}
          cy={`${pendingPoint.y}%`}
          r={6 * pointScale}
          fill={isDark ? '#60A5FA' : '#3B82F6'}
          stroke={isDark ? '#1F2937' : '#FFFFFF'}
          strokeWidth={2 * pointScale}
          className="animate-pulse"
        />
      )}
    </svg>
  );
}


// =============================================================================
// MINIMAL TOOLBAR - Only shows when there are measurements to clear
// =============================================================================

interface MeasurementToolbarProps {
  onClearAll: () => void;
  measurementCount: number;
}

function MeasurementToolbar({ onClearAll, measurementCount }: MeasurementToolbarProps) {
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  // Only show toolbar when there are measurements
  if (measurementCount === 0) return null;

  return (
    <div
      className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-2 px-3 py-2 rounded-full shadow-lg ${
        isDark ? 'bg-gray-800/95 border border-gray-700' : 'bg-white/95 border border-gray-200'
      }`}
    >
      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {measurementCount} measurement{measurementCount !== 1 ? 's' : ''}
      </span>
      <button
        onClick={onClearAll}
        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
          isDark
            ? 'text-red-400 hover:bg-red-500/20'
            : 'text-red-600 hover:bg-red-50'
        }`}
        title="Clear all measurements"
      >
        <Trash2 className="w-3 h-3" />
        Clear
      </button>
    </div>
  );
}

// =============================================================================
// MAIN MEASUREMENT TOOL COMPONENT
// =============================================================================

export function MeasurementTool({
  isActive,
  measurements,
  onMeasurementsChange,
  calibration,
  onCalibrationChange,
  containerRef,
  zoom = 1,
  showCm = false,
  readOnly = false,
  zoomState,
}: MeasurementToolProps) {
  // Pending point state (first point of a new measurement)
  const [pendingPoint, setPendingPoint] = useState<MeasurementPoint | null>(null);
  // Mouse/touch position for live preview
  const [mousePosition, setMousePosition] = useState<MeasurementPoint | null>(null);
  // Selected measurement for deletion
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Track if we're in a two-finger gesture (for passing through to parent zoom)
  const [isTwoFingerGesture, setIsTwoFingerGesture] = useState(false);
  // Ref for the overlay div to attach native event listeners
  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset pending point when tool becomes inactive
  useEffect(() => {
    if (!isActive) {
      setPendingPoint(null);
      setMousePosition(null);
    }
  }, [isActive]);

  // Convert client coordinates to percentage position
  const clientToPercent = useCallback(
    (clientX: number, clientY: number): MeasurementPoint | null => {
      if (!containerRef.current) return null;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;

      // Clamp to bounds
      return {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      };
    },
    [containerRef]
  );

  // Handle touch start - detect two-finger gestures early
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isActive || readOnly) return;

      // Two or more fingers = zoom/pan gesture - DO NOT capture
      if (e.touches.length >= 2) {
        setIsTwoFingerGesture(true);
        // Cancel any pending measurement when switching to zoom
        setPendingPoint(null);
        setMousePosition(null);
        return; // Let the event bubble up to parent zoom handler
      }

      setIsTwoFingerGesture(false);
      // Single finger touch will be handled by handleClick on touchend
    },
    [isActive, readOnly]
  );

  // Handle touch end - only process single-finger taps for measurement
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      // If this was part of a two-finger gesture, reset flag and don't process
      if (isTwoFingerGesture) {
        // Check if all fingers lifted
        if (e.touches.length === 0) {
          setIsTwoFingerGesture(false);
        }
        return;
      }

      if (!isActive || readOnly) return;
      if (e.changedTouches.length === 0) return;

      // Use changedTouches for the finger that was lifted
      const touch = e.changedTouches[0];
      const point = clientToPercent(touch.clientX, touch.clientY);
      if (!point || !containerRef.current) return;

      if (!pendingPoint) {
        // Start new measurement
        setPendingPoint(point);
        setSelectedId(null);
      } else {
        // Complete measurement
        const rect = containerRef.current.getBoundingClientRect();
        const distancePx = calculatePixelDistance(pendingPoint, point, rect.width, rect.height);
        const distanceMm = pxToMm(distancePx, calibration);

        const newMeasurement: Measurement = {
          id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          startPoint: pendingPoint,
          endPoint: point,
          distancePx,
          distanceMm,
          timestamp: new Date(),
        };

        onMeasurementsChange([...measurements, newMeasurement]);
        setPendingPoint(null);
        setMousePosition(null);
      }
    },
    [isActive, readOnly, pendingPoint, clientToPercent, calibration, measurements, onMeasurementsChange, containerRef, isTwoFingerGesture]
  );

  // Handle mouse click (for desktop/stylus)
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isActive || readOnly) return;

      const point = clientToPercent(e.clientX, e.clientY);
      if (!point || !containerRef.current) return;

      if (!pendingPoint) {
        // Start new measurement
        setPendingPoint(point);
        setSelectedId(null);
      } else {
        // Complete measurement
        const rect = containerRef.current.getBoundingClientRect();
        const distancePx = calculatePixelDistance(pendingPoint, point, rect.width, rect.height);
        const distanceMm = pxToMm(distancePx, calibration);

        const newMeasurement: Measurement = {
          id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          startPoint: pendingPoint,
          endPoint: point,
          distancePx,
          distanceMm,
          timestamp: new Date(),
        };

        onMeasurementsChange([...measurements, newMeasurement]);
        setPendingPoint(null);
        setMousePosition(null);
      }
    },
    [isActive, readOnly, pendingPoint, clientToPercent, calibration, measurements, onMeasurementsChange, containerRef]
  );

  // Handle mouse move for live preview (desktop/stylus only)
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isActive || !pendingPoint) return;

      const point = clientToPercent(e.clientX, e.clientY);
      if (point) {
        setMousePosition(point);
      }
    },
    [isActive, pendingPoint, clientToPercent]
  );

  // Handle touch move for live preview - ONLY single finger
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      // Two or more fingers = zoom/pan gesture - don't capture
      if (e.touches.length >= 2) {
        setIsTwoFingerGesture(true);
        return; // Let it bubble up to parent zoom handler
      }

      // If we were in a two-finger gesture and now back to one finger,
      // don't immediately process as measurement move
      if (isTwoFingerGesture) return;

      if (!isActive || !pendingPoint) return;
      if (e.touches.length === 0) return;

      const touch = e.touches[0];
      const point = clientToPercent(touch.clientX, touch.clientY);
      if (point) {
        setMousePosition(point);
      }
    },
    [isActive, pendingPoint, clientToPercent, isTwoFingerGesture]
  );

  // Delete a measurement
  const handleDelete = useCallback(
    (id: string) => {
      onMeasurementsChange(measurements.filter((m) => m.id !== id));
      setSelectedId(null);
    },
    [measurements, onMeasurementsChange]
  );

  // Clear all measurements
  const handleClearAll = useCallback(() => {
    onMeasurementsChange([]);
    setPendingPoint(null);
    setMousePosition(null);
    setSelectedId(null);
  }, [onMeasurementsChange]);

  // Cancel pending measurement on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pendingPoint) {
        setPendingPoint(null);
        setMousePosition(null);
      }
      if (e.key === 'Delete' && selectedId) {
        handleDelete(selectedId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingPoint, selectedId, handleDelete]);

  // Track previous width to avoid unnecessary calibration updates
  const prevWidthRef = useRef<number | null>(null);

  // Store calibration reference value in a ref to avoid dependency issues
  const calibrationRefValueRef = useRef(calibration.referenceValueMm);
  useEffect(() => {
    calibrationRefValueRef.current = calibration.referenceValueMm;
  }, [calibration.referenceValueMm]);

  // Memoize the calibration change callback to avoid infinite loops
  const stableCalibrationChange = useCallback(
    (newWidth: number) => {
      // Only update if width actually changed
      if (prevWidthRef.current === newWidth) return;
      prevWidthRef.current = newWidth;

      onCalibrationChange({
        ...calibration,
        referencePx: newWidth,
        pixelsPerMm: newWidth / calibrationRefValueRef.current,
      });
    },
    [onCalibrationChange, calibration]
  );

  // Update calibration reference pixels when container resizes
  useEffect(() => {
    if (!containerRef.current) return;

    const updateReferencePx = () => {
      if (containerRef.current) {
        const width = containerRef.current.getBoundingClientRect().width;
        stableCalibrationChange(width);
      }
    };

    const resizeObserver = new ResizeObserver(updateReferencePx);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [containerRef, stableCalibrationChange]);

  // ============================================================================
  // CRITICAL: Pointer-events toggle for two-finger gesture passthrough
  // ============================================================================
  // The key insight: When we detect a two-finger gesture, we disable pointer-events
  // on the overlay so ALL touch events pass directly through to the parent
  // FaceChartWithZoom component. When fingers are lifted, we re-enable pointer-events.
  //
  // This is the same pattern used successfully in VeinDrawingTool/ReactSketchCanvas.
  // ============================================================================
  useEffect(() => {
    // Listen for touch events at the document level to detect gesture transitions
    const handleGlobalTouchStart = (e: TouchEvent) => {
      if (!isActive || readOnly) return;

      if (e.touches.length >= 2) {
        setIsTwoFingerGesture(true);
        // Cancel any pending measurement when switching to zoom
        setPendingPoint(null);
        setMousePosition(null);
      }
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      // When all fingers lifted, re-enable measurement mode
      if (e.touches.length === 0) {
        // Small delay to avoid immediately re-capturing after zoom gesture ends
        setTimeout(() => setIsTwoFingerGesture(false), 50);
      }
    };

    // Listen at capture phase to detect before React handlers
    document.addEventListener('touchstart', handleGlobalTouchStart, { capture: true, passive: true });
    document.addEventListener('touchend', handleGlobalTouchEnd, { capture: true, passive: true });

    return () => {
      document.removeEventListener('touchstart', handleGlobalTouchStart, { capture: true });
      document.removeEventListener('touchend', handleGlobalTouchEnd, { capture: true });
    };
  }, [isActive, readOnly]);

  return (
    <>
      {/* Interactive overlay that captures clicks when tool is active */}
      {/* CRITICAL: pointer-events is 'none' during two-finger gestures so touch
          events pass through to parent FaceChartWithZoom for zoom/pan */}
      {isActive && !readOnly && (
        <div
          ref={overlayRef}
          className="absolute inset-0 z-[100] cursor-crosshair"
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            // Toggle pointer-events based on gesture type:
            // - 'auto' for single-finger (measurement placement)
            // - 'none' for two-finger (let parent handle zoom/pan)
            pointerEvents: isTwoFingerGesture ? 'none' : 'auto',
            // Use pinch-zoom to hint to browser about gesture handling
            touchAction: 'pinch-zoom'
          }}
        />
      )}

      {/* Measurement visualization overlay */}
      <MeasurementOverlay
        measurements={measurements}
        pendingPoint={pendingPoint}
        mousePosition={mousePosition}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onDelete={handleDelete}
        calibration={calibration}
        showCm={showCm}
        zoom={zoom}
        containerRef={containerRef}
        isActive={isActive}
        readOnly={readOnly}
        zoomState={zoomState}
      />

      {/* Minimal toolbar - only shows when there are measurements */}
      {isActive && (
        <MeasurementToolbar
          onClearAll={handleClearAll}
          measurementCount={measurements.length}
        />
      )}
    </>
  );
}

// =============================================================================
// HOOK FOR MANAGING MEASUREMENT STATE
// =============================================================================

export function useMeasurementState(initialCalibration?: Partial<CalibrationData>) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [calibration, setCalibration] = useState<CalibrationData>({
    ...DEFAULT_CALIBRATION,
    ...initialCalibration,
  });

  const clearMeasurements = useCallback(() => {
    setMeasurements([]);
  }, []);

  return {
    measurements,
    setMeasurements,
    calibration,
    setCalibration,
    clearMeasurements,
  };
}

// Export default calibration for initial state
export { DEFAULT_CALIBRATION };

export default MeasurementTool;
