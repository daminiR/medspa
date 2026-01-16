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

  // NOTE: We no longer apply svgTransform here because the MeasurementOverlay is now
  // rendered INSIDE the FaceChartWithZoom's contentRef, which already has the zoom/pan
  // transform applied. The overlay inherits the parent transform automatically.
  // Measurements use percentage coordinates (0-100), which scale correctly with the container.

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        overflow: 'visible',
        // No transform needed - the parent container is already transformed
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
        />
      )}
    </svg>
  );
}


// =============================================================================
// ENHANCED TOOLBAR - Shows measurement values with real-time display
// =============================================================================

interface MeasurementToolbarProps {
  onClearAll: () => void;
  measurements: Measurement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (id: string) => void;
}

function MeasurementToolbar({
  onClearAll,
  measurements,
  selectedId,
  onSelect,
  onDelete
}: MeasurementToolbarProps) {
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  // Only show toolbar when there are measurements
  if (measurements.length === 0) return null;

  // Calculate total distance
  const totalMm = measurements.reduce((sum, m) => sum + m.distanceMm, 0);

  return (
    <div
      className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-[110] flex flex-col gap-2 p-3 rounded-xl shadow-lg max-w-md ${
        isDark ? 'bg-gray-800/95 border border-gray-700' : 'bg-white/95 border border-gray-200'
      }`}
    >
      {/* Header with count and clear button */}
      <div className="flex items-center justify-between gap-4">
        <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {measurements.length} measurement{measurements.length !== 1 ? 's' : ''}
          {measurements.length > 0 && (
            <span className={`ml-2 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
              Total: {totalMm.toFixed(1)}mm
            </span>
          )}
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
          Clear All
        </button>
      </div>

      {/* Measurement list with actual values */}
      {measurements.length > 0 && (
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {measurements.map((m, index) => (
            <div
              key={m.id}
              onClick={() => onSelect(selectedId === m.id ? null : m.id)}
              className={`
                flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all text-xs
                ${selectedId === m.id
                  ? isDark
                    ? 'bg-cyan-600/30 border border-cyan-500 text-cyan-300'
                    : 'bg-cyan-100 border border-cyan-400 text-cyan-700'
                  : isDark
                    ? 'bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {/* Measurement number badge */}
              <span className={`
                w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold
                ${isDark ? 'bg-cyan-600 text-white' : 'bg-cyan-500 text-white'}
              `}>
                {index + 1}
              </span>
              {/* Distance value */}
              <span className="font-mono font-medium">
                {m.distanceMm.toFixed(1)}mm
              </span>
              {/* Delete button for selected measurement */}
              {selectedId === m.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(m.id);
                  }}
                  className={`
                    ml-1 p-0.5 rounded transition-colors
                    ${isDark ? 'hover:bg-red-500/30 text-red-400' : 'hover:bg-red-100 text-red-500'}
                  `}
                  title="Delete measurement"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
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
  // DEBUG: Track renders to detect oscillation
  const renderCountRef = useRef(0);
  renderCountRef.current++;
  console.log(`[MeasurementTool] Render #${renderCountRef.current}, isActive=${isActive}, pendingPoint exists=${!!arguments}`);

  // Pending point state (first point of a new measurement)
  const [pendingPoint, setPendingPoint] = useState<MeasurementPoint | null>(null);
  // Mouse/touch position for live preview
  const [mousePosition, setMousePosition] = useState<MeasurementPoint | null>(null);
  // Selected measurement for deletion
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Track if we're in a two-finger gesture (for passing through to parent zoom)
  const [isTwoFingerGesture, setIsTwoFingerGesture] = useState(false);
  // Track if we just handled a touch event (to prevent click from firing too)
  const justHandledTouchRef = useRef(false);

  // CRITICAL: Internal container ref for coordinate calculations
  // This ref points to the overlay div that fills the transformed content area.
  // Using this instead of external containerRef ensures getBoundingClientRect()
  // returns the correct visual bounds for coordinate conversion.
  const internalContainerRef = useRef<HTMLDivElement>(null);

  // Reset pending point when tool becomes inactive
  useEffect(() => {
    if (!isActive) {
      setPendingPoint(null);
      setMousePosition(null);
    }
  }, [isActive]);

  // =============================================================================
  // STABILIZATION: Store zoomState in ref to avoid recreating clientToPercent
  // =============================================================================
  // The clientToPercent callback is used in all click/touch handlers. If it changes
  // reference frequently (due to zoomState changing), all those handlers get recreated,
  // which can cause subtle timing issues and potential jitter.
  const zoomStateRef = useRef(zoomState);
  useEffect(() => {
    zoomStateRef.current = zoomState;
  }, [zoomState]);

  // Convert client coordinates to percentage position, accounting for zoom transform
  //
  // COORDINATE CONVERSION EXPLANATION:
  // The MeasurementTool is rendered INSIDE the transformed contentRef (FaceChartWithZoom).
  // Using internalContainerRef (which is our overlay div with absolute inset-0) ensures
  // getBoundingClientRect() returns the SCALED visual bounds of the content area.
  //
  // To convert click coordinates to content-space percentages:
  // 1. Get click position relative to container: relX = clientX - rect.left
  // 2. The rect dimensions are SCALED, so divide by scale: contentX = relX / scale
  // 3. Content dimensions (unscaled) = rect dimensions / scale
  // 4. Percentage = (contentX / contentWidth) * 100
  //
  // STABILIZATION: Uses zoomStateRef instead of zoomState in dependencies to prevent
  // this callback from being recreated on every zoom change. This helps prevent jitter.
  const clientToPercent = useCallback(
    (clientX: number, clientY: number): MeasurementPoint | null => {
      // Use internal container ref (inside the transformed content) for accurate coordinates
      const container = internalContainerRef.current;
      if (!container) {
        console.warn('[MeasurementTool] clientToPercent: internalContainerRef is null');
        return null;
      }

      const rect = container.getBoundingClientRect();
      const scale = zoomStateRef.current?.scale || 1;

      // Get click position relative to the container's visual bounds
      const relX = clientX - rect.left;
      const relY = clientY - rect.top;

      // DEBUG: Log all coordinate values
      console.log('[MeasurementTool] clientToPercent:', {
        clientX,
        clientY,
        rectLeft: rect.left,
        rectTop: rect.top,
        rectWidth: rect.width,
        rectHeight: rect.height,
        relX,
        relY,
        scale,
        zoomState: zoomStateRef.current,
      });

      // Convert to content space by dividing by scale
      const contentX = relX / scale;
      const contentY = relY / scale;

      // Content dimensions (unscaled)
      const contentWidth = rect.width / scale;
      const contentHeight = rect.height / scale;

      // Calculate percentage
      const x = (contentX / contentWidth) * 100;
      const y = (contentY / contentHeight) * 100;

      console.log('[MeasurementTool] Calculated percentage:', { x, y, contentX, contentY, contentWidth, contentHeight });

      // Clamp to bounds
      return {
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      };
    },
    [] // No dependencies - uses refs
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

  // =============================================================================
  // STABILIZATION: Track the last placed point coordinates to prevent jitter
  // =============================================================================
  // When clicking to place the first point, if the component re-renders (e.g., from
  // calibration updates or other state changes), the SVG circle could briefly show
  // at a slightly different position before settling. By storing the coordinates
  // in a ref and checking if they match before updating state, we avoid redundant
  // state updates that could cause visual jitter.
  //
  // NOTE: This ref must be declared before handleTouchEnd and handleClick since
  // both handlers use it for stabilization.
  const lastPlacedPointRef = useRef<MeasurementPoint | null>(null);

  // Handle touch end - only process single-finger taps for measurement
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      console.log('[MeasurementTool] handleTouchEnd called, touches:', e.touches.length, 'isTwoFingerGesture:', isTwoFingerGesture);

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

      // CRITICAL: Set flag to prevent click handler from also firing
      justHandledTouchRef.current = true;
      // Reset the flag after a short delay (click events fire ~100ms after touchend)
      setTimeout(() => {
        justHandledTouchRef.current = false;
      }, 300);

      // Use changedTouches for the finger that was lifted
      const touch = e.changedTouches[0];
      const point = clientToPercent(touch.clientX, touch.clientY);
      if (!point || !internalContainerRef.current) return;

      console.log('[MeasurementTool] handleTouchEnd - placing point at:', point, 'pendingPoint:', pendingPoint);

      if (!pendingPoint) {
        // STABILIZATION: Check if we're placing at the same coordinates as last time
        // This prevents jitter from double-firing events or rapid re-renders
        if (
          lastPlacedPointRef.current &&
          Math.abs(lastPlacedPointRef.current.x - point.x) < 0.1 &&
          Math.abs(lastPlacedPointRef.current.y - point.y) < 0.1
        ) {
          console.log('[MeasurementTool] Skipping touch - same point as last');
          return; // Same point, skip to prevent jitter
        }
        lastPlacedPointRef.current = point;

        // Start new measurement
        console.log('[MeasurementTool] Setting pending point (touch):', point);
        setPendingPoint(point);
        setSelectedId(null);
      } else {
        // Clear the last placed point ref since we're completing the measurement
        lastPlacedPointRef.current = null;

        // Complete measurement - use internal container for dimensions
        const rect = internalContainerRef.current.getBoundingClientRect();
        const scale = zoomStateRef.current?.scale || 1;
        const contentWidth = rect.width / scale;
        const contentHeight = rect.height / scale;
        const distancePx = calculatePixelDistance(pendingPoint, point, contentWidth, contentHeight);
        const distanceMm = pxToMm(distancePx, calibration);

        const newMeasurement: Measurement = {
          id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          startPoint: pendingPoint,
          endPoint: point,
          distancePx,
          distanceMm,
          timestamp: new Date(),
        };

        console.log('[MeasurementTool] Creating measurement (touch):', newMeasurement);
        onMeasurementsChange([...measurements, newMeasurement]);
        setPendingPoint(null);
        setMousePosition(null);
      }
    },
    [isActive, readOnly, pendingPoint, clientToPercent, calibration, measurements, onMeasurementsChange, isTwoFingerGesture]
  );

  // Handle mouse click (for desktop/stylus)
  // IMPORTANT: On touch devices, both touchend AND click fire. We use justHandledTouchRef
  // to prevent the click handler from double-processing the same tap.
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      console.log('[MeasurementTool] handleClick called, justHandledTouch:', justHandledTouchRef.current);

      // If we just handled a touch event, skip this click to prevent double-firing
      if (justHandledTouchRef.current) {
        console.log('[MeasurementTool] Skipping click - just handled touch');
        justHandledTouchRef.current = false;
        return;
      }

      if (!isActive || readOnly) return;

      const point = clientToPercent(e.clientX, e.clientY);
      if (!point || !internalContainerRef.current) return;

      console.log('[MeasurementTool] handleClick - placing point at:', point, 'pendingPoint:', pendingPoint);

      if (!pendingPoint) {
        // STABILIZATION: Check if we're placing at the same coordinates as last time
        // This prevents jitter from double-firing events or rapid re-renders
        if (
          lastPlacedPointRef.current &&
          Math.abs(lastPlacedPointRef.current.x - point.x) < 0.1 &&
          Math.abs(lastPlacedPointRef.current.y - point.y) < 0.1
        ) {
          console.log('[MeasurementTool] Skipping - same point as last');
          return; // Same point, skip to prevent jitter
        }
        lastPlacedPointRef.current = point;

        // Start new measurement
        console.log('[MeasurementTool] Setting pending point:', point);
        setPendingPoint(point);
        setSelectedId(null);
      } else {
        // Clear the last placed point ref since we're completing the measurement
        lastPlacedPointRef.current = null;

        // Complete measurement - use internal container for dimensions
        const rect = internalContainerRef.current.getBoundingClientRect();
        const scale = zoomStateRef.current?.scale || 1;
        const contentWidth = rect.width / scale;
        const contentHeight = rect.height / scale;
        const distancePx = calculatePixelDistance(pendingPoint, point, contentWidth, contentHeight);
        const distanceMm = pxToMm(distancePx, calibration);

        const newMeasurement: Measurement = {
          id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          startPoint: pendingPoint,
          endPoint: point,
          distancePx,
          distanceMm,
          timestamp: new Date(),
        };

        console.log('[MeasurementTool] Creating measurement:', newMeasurement);
        onMeasurementsChange([...measurements, newMeasurement]);
        setPendingPoint(null);
        setMousePosition(null);
      }
    },
    [isActive, readOnly, pendingPoint, clientToPercent, calibration, measurements, onMeasurementsChange]
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

  // Delete a specific measurement by ID
  const handleDeleteMeasurement = useCallback(
    (id: string) => {
      onMeasurementsChange(measurements.filter((m) => m.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
    },
    [measurements, onMeasurementsChange, selectedId]
  );

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

  // =============================================================================
  // STABILIZATION: Track previous dimensions to avoid unnecessary updates
  // =============================================================================
  // This is the same pattern used in ArrowTool to prevent jitter/oscillation.
  // The key insight: Updating state (like calibration) triggers re-renders, and
  // if we update on every ResizeObserver callback or animation frame, we can
  // cause oscillation where the component re-renders repeatedly before settling.
  //
  // Solution: Track the previous width with a ref and only update if it actually
  // changed by a meaningful amount (threshold of 1px to handle sub-pixel differences).
  // =============================================================================

  // Track previous width to avoid unnecessary calibration updates
  const prevWidthRef = useRef<number | null>(null);

  // Store calibration reference value in a ref to avoid dependency issues
  const calibrationRefValueRef = useRef(calibration.referenceValueMm);
  useEffect(() => {
    calibrationRefValueRef.current = calibration.referenceValueMm;
  }, [calibration.referenceValueMm]);

  // Store the callback in a ref to avoid dependency on onCalibrationChange changing
  const onCalibrationChangeRef = useRef(onCalibrationChange);
  useEffect(() => {
    onCalibrationChangeRef.current = onCalibrationChange;
  }, [onCalibrationChange]);

  // Store calibration in a ref to avoid stale closure issues
  const calibrationRef = useRef(calibration);
  useEffect(() => {
    calibrationRef.current = calibration;
  }, [calibration]);

  // Memoize the calibration change callback to avoid infinite loops
  // CRITICAL: Use refs for all dependencies to prevent this callback from changing
  // and causing the ResizeObserver effect to re-run, which would cause jitter
  const stableCalibrationChange = useCallback(
    (newWidth: number) => {
      // CRITICAL FIX: Only update if width actually changed by more than 1px
      // This prevents oscillation from sub-pixel differences and repeated calls
      // during initial mount (similar to ArrowTool's lastCanvasSizeRef pattern)
      if (prevWidthRef.current !== null && Math.abs(prevWidthRef.current - newWidth) < 1) {
        return;
      }
      prevWidthRef.current = newWidth;

      onCalibrationChangeRef.current({
        ...calibrationRef.current,
        referencePx: newWidth,
        pixelsPerMm: newWidth / calibrationRefValueRef.current,
      });
    },
    [] // No dependencies - all values read from refs
  );

  // Update calibration reference pixels when container resizes
  // Using requestAnimationFrame to batch updates and prevent jitter
  useEffect(() => {
    if (!containerRef.current) return;

    let rafId: number | null = null;

    const updateReferencePx = () => {
      // Cancel any pending update to prevent multiple rapid updates
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }

      // Use requestAnimationFrame to ensure DOM has settled before measuring
      // This prevents jitter from measuring during layout/paint
      rafId = requestAnimationFrame(() => {
        if (containerRef.current) {
          const width = containerRef.current.getBoundingClientRect().width;
          // Only update if width is valid (container has been laid out)
          if (width > 0) {
            stableCalibrationChange(width);
          }
        }
        rafId = null;
      });
    };

    const resizeObserver = new ResizeObserver(updateReferencePx);
    resizeObserver.observe(containerRef.current);

    // Initial update
    updateReferencePx();

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      resizeObserver.disconnect();
    };
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
      {/* CRITICAL: This div uses internalContainerRef for coordinate calculations.
          It fills the transformed content area with absolute inset-0.
          pointer-events is 'none' during two-finger gestures so touch
          events pass through to parent FaceChartWithZoom for zoom/pan */}
      {isActive && !readOnly && (
        <div
          ref={internalContainerRef}
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

      {/* Measurement visualization overlay - NOTE: We pass internalContainerRef for coordinate
          calculations when active. When not active, we still need a ref for the overlay,
          so we pass containerRef as fallback (it's only used for distance calculation display). */}
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
        containerRef={isActive ? internalContainerRef : containerRef}
        isActive={isActive}
        readOnly={readOnly}
        zoomState={zoomState}
      />

      {/* REMOVED: MeasurementToolbar - the measurements panel is now shown in LeftDock
          instead of as an overlay on the map. This reduces visual clutter and matches
          how other tools display their information. */}
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
