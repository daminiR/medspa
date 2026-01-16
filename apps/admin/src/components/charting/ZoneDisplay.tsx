'use client';

/**
 * ZoneDisplay - Components for displaying and managing detected zones on charting
 *
 * Per PRACTITIONER_CONTEXT.md:
 * - Zone detection should HELP by reducing documentation work, not interrupt
 * - UI should be minimal/subtle - don't clutter the chart
 * - One-tap to change if user disagrees with detected zone
 */

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check, X, Eye, EyeOff, Map, Target } from 'lucide-react';
import { useChartingTheme } from '@/contexts/ChartingThemeContext';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Detected zone information for a stroke/treatment area
 */
export interface DetectedZone {
  id: string;
  name: string;
  category: string;
  confidence?: number; // 0-1 confidence score from detection
}

/**
 * Zone definition with boundaries for overlay visualization
 */
export interface ZoneBoundary {
  id: string;
  name: string;
  category: string;
  color: string;
  // Path or bounds for SVG rendering
  path?: string;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  // Percentage-based position (for face charts)
  center?: { x: number; y: number };
}

/**
 * Stroke with zone detection result
 */
export interface StrokeWithZone {
  id: string;
  treatmentType: string;
  treatmentName: string;
  color: string;
  zoneId?: string;
  zoneName?: string;
  zoneCategory?: string;
  zoneConfidence?: number;
  // Position for badge placement
  centerX: number;
  centerY: number;
}

/**
 * Treatment summary grouped by zone
 */
export interface ZoneTreatmentSummary {
  zoneId: string;
  zoneName: string;
  zoneCategory: string;
  treatments: {
    treatmentType: string;
    treatmentName: string;
    color: string;
    strokeCount: number;
  }[];
}

// =============================================================================
// ZONE BADGE COMPONENT
// =============================================================================

export interface ZoneBadgeProps {
  /** Detected zone information */
  zone: DetectedZone;
  /** Position to render the badge (percentage 0-100) */
  position: { x: number; y: number };
  /** Whether the zone can be changed */
  editable?: boolean;
  /** Callback when user wants to change the zone */
  onChangeZone?: () => void;
  /** Size variant */
  size?: 'small' | 'medium';
  /** Counter-scale for zoom (to keep badge fixed size) */
  scale?: number;
}

/**
 * ZoneBadge - Small label showing detected zone near a stroke
 * Minimal design per PRACTITIONER_CONTEXT: subtle, doesn't clutter
 */
export function ZoneBadge({
  zone,
  position,
  editable = true,
  onChangeZone,
  size = 'small',
  scale = 1,
}: ZoneBadgeProps) {
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  // Category colors (subtle, not distracting)
  const categoryColors: Record<string, { bg: string; text: string }> = {
    'upper-face': {
      bg: isDark ? 'bg-blue-900/60' : 'bg-blue-100/80',
      text: isDark ? 'text-blue-300' : 'text-blue-700',
    },
    'mid-face': {
      bg: isDark ? 'bg-purple-900/60' : 'bg-purple-100/80',
      text: isDark ? 'text-purple-300' : 'text-purple-700',
    },
    'lower-face': {
      bg: isDark ? 'bg-green-900/60' : 'bg-green-100/80',
      text: isDark ? 'text-green-300' : 'text-green-700',
    },
    'periorbital': {
      bg: isDark ? 'bg-amber-900/60' : 'bg-amber-100/80',
      text: isDark ? 'text-amber-300' : 'text-amber-700',
    },
    neck: {
      bg: isDark ? 'bg-teal-900/60' : 'bg-teal-100/80',
      text: isDark ? 'text-teal-300' : 'text-teal-700',
    },
    body: {
      bg: isDark ? 'bg-slate-700/60' : 'bg-slate-100/80',
      text: isDark ? 'text-slate-300' : 'text-slate-700',
    },
    default: {
      bg: isDark ? 'bg-gray-700/60' : 'bg-gray-100/80',
      text: isDark ? 'text-gray-300' : 'text-gray-700',
    },
  };

  const colors = categoryColors[zone.category] || categoryColors.default;
  const sizeClasses = size === 'small' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1';

  return (
    <div
      className="absolute pointer-events-auto z-20"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -100%) scale(${scale})`,
        transformOrigin: 'bottom center',
      }}
    >
      <button
        onClick={editable ? onChangeZone : undefined}
        disabled={!editable}
        className={`
          ${colors.bg} ${colors.text} ${sizeClasses}
          rounded-full font-medium whitespace-nowrap
          backdrop-blur-sm shadow-sm
          transition-all duration-150
          ${editable ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}
          flex items-center gap-1
        `}
        title={editable ? 'Tap to change zone' : zone.name}
      >
        <MapPin className="w-2.5 h-2.5" />
        <span className="truncate max-w-[80px]">{zone.name}</span>
        {editable && <ChevronDown className="w-2 h-2 opacity-60" />}
      </button>
    </div>
  );
}

// =============================================================================
// ZONE OVERRIDE POPOVER
// =============================================================================

export interface ZoneOverridePopoverProps {
  /** Currently detected zone */
  currentZone: DetectedZone;
  /** Nearby zones that could be alternatives */
  nearbyZones: DetectedZone[];
  /** Position for the popover (screen coordinates) */
  position: { x: number; y: number };
  /** Callback when zone is selected */
  onSelectZone: (zone: DetectedZone) => void;
  /** Callback to close the popover */
  onClose: () => void;
  /** Container ref for positioning */
  containerRef?: React.RefObject<HTMLElement>;
}

/**
 * ZoneOverridePopover - Dropdown to change detected zone
 * One tap to change per PRACTITIONER_CONTEXT
 */
export function ZoneOverridePopover({
  currentZone,
  nearbyZones,
  position,
  onSelectZone,
  onClose,
  containerRef,
}: ZoneOverridePopoverProps) {
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // All zones to show (current + nearby)
  const allZones = useMemo(() => {
    const zones = [currentZone, ...nearbyZones.filter((z) => z.id !== currentZone.id)];
    return zones;
  }, [currentZone, nearbyZones]);

  return (
    <div
      ref={popoverRef}
      className={`
        fixed z-50 min-w-[160px] max-w-[200px]
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        border rounded-lg shadow-xl
        animate-in fade-in zoom-in-95 duration-150
      `}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, 4px)',
      }}
    >
      {/* Header */}
      <div
        className={`
        px-3 py-2 border-b
        ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-gray-500'}
        text-[10px] font-medium uppercase tracking-wide
        flex items-center justify-between
      `}
      >
        <span>Select Zone</span>
        <button
          onClick={onClose}
          className={`p-0.5 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Zone list */}
      <div className="py-1 max-h-[200px] overflow-y-auto">
        {allZones.map((zone) => {
          const isSelected = zone.id === currentZone.id;
          return (
            <button
              key={zone.id}
              onClick={() => {
                onSelectZone(zone);
                onClose();
              }}
              className={`
                w-full px-3 py-2 text-left text-xs
                flex items-center gap-2
                transition-colors duration-100
                ${
                  isSelected
                    ? isDark
                      ? 'bg-purple-900/40 text-purple-300'
                      : 'bg-purple-50 text-purple-700'
                    : isDark
                      ? 'text-gray-300 hover:bg-gray-700/50'
                      : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {isSelected && <Check className="w-3 h-3 text-purple-500 flex-shrink-0" />}
              {!isSelected && <div className="w-3 h-3 flex-shrink-0" />}
              <span className="truncate">{zone.name}</span>
              {zone.confidence !== undefined && (
                <span
                  className={`ml-auto text-[9px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                >
                  {Math.round(zone.confidence * 100)}%
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// TREATED ZONES SUMMARY (FOR LEFT DOCK)
// =============================================================================

export interface TreatedZonesSummaryProps {
  /** Zone summaries with treatments */
  zoneSummaries: ZoneTreatmentSummary[];
  /** Whether collapsed by default */
  defaultCollapsed?: boolean;
  /** Callback when a zone is clicked */
  onZoneClick?: (zoneId: string) => void;
}

/**
 * TreatedZonesSummary - Shows list of treated zones in the left dock
 * Format: "Forehead - IPL", "Left Cheek - IPL", etc.
 */
export function TreatedZonesSummary({
  zoneSummaries,
  defaultCollapsed = false,
  onZoneClick,
}: TreatedZonesSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  if (zoneSummaries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full flex items-center gap-2 py-1 px-1 rounded-md
          transition-colors
          ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'}
        `}
      >
        <ChevronDown
          className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
        />
        <Target className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        <span
          className={`text-[10px] font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
          Treated Zones
        </span>
        <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          ({zoneSummaries.length})
        </span>
      </button>

      {/* Zone list */}
      {isExpanded && (
        <div className="space-y-0.5 pl-5">
          {zoneSummaries.map((summary) => (
            <button
              key={summary.zoneId}
              onClick={() => onZoneClick?.(summary.zoneId)}
              className={`
                w-full text-left py-1.5 px-2 rounded-md text-xs
                transition-colors duration-100
                ${isDark ? 'hover:bg-gray-700/50 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}
              `}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium truncate flex-1">{summary.zoneName}</span>
              </div>
              {/* Treatment types in this zone */}
              <div className="flex flex-wrap gap-1 mt-1">
                {summary.treatments.map((treatment, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${treatment.color}20`,
                      color: treatment.color,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: treatment.color }}
                    />
                    {treatment.treatmentName}
                    {treatment.strokeCount > 1 && ` (${treatment.strokeCount})`}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// ZONE BOUNDARY OVERLAY
// =============================================================================

export interface ZoneBoundaryOverlayProps {
  /** Zone boundaries to display */
  zones: ZoneBoundary[];
  /** Whether the overlay is visible */
  isVisible: boolean;
  /** Opacity of the overlay (0-1) */
  opacity?: number;
  /** Callback when a zone is clicked */
  onZoneClick?: (zoneId: string) => void;
  /** Currently highlighted zone */
  highlightedZoneId?: string;
}

/**
 * ZoneBoundaryOverlay - Semi-transparent overlays showing zone boundaries
 * Toggle to show/hide per user preference
 */
export function ZoneBoundaryOverlay({
  zones,
  isVisible,
  opacity = 0.15,
  onZoneClick,
  highlightedZoneId,
}: ZoneBoundaryOverlayProps) {
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  if (!isVisible || zones.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-5">
      <svg className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {zones.map((zone) => {
          const isHighlighted = zone.id === highlightedZoneId;
          const fillOpacity = isHighlighted ? opacity * 2 : opacity;
          const strokeOpacity = isHighlighted ? 0.6 : 0.3;

          // If zone has a path, render it
          if (zone.path) {
            return (
              <path
                key={zone.id}
                d={zone.path}
                fill={zone.color}
                fillOpacity={fillOpacity}
                stroke={zone.color}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeOpacity={strokeOpacity}
                className={`transition-all duration-200 ${onZoneClick ? 'cursor-pointer pointer-events-auto' : ''}`}
                onClick={() => onZoneClick?.(zone.id)}
              />
            );
          }

          // If zone has bounds, render a rect
          if (zone.bounds) {
            return (
              <rect
                key={zone.id}
                x={`${zone.bounds.x}%`}
                y={`${zone.bounds.y}%`}
                width={`${zone.bounds.width}%`}
                height={`${zone.bounds.height}%`}
                fill={zone.color}
                fillOpacity={fillOpacity}
                stroke={zone.color}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeOpacity={strokeOpacity}
                rx="4"
                className={`transition-all duration-200 ${onZoneClick ? 'cursor-pointer pointer-events-auto' : ''}`}
                onClick={() => onZoneClick?.(zone.id)}
              />
            );
          }

          // If zone has center only, render a circle
          if (zone.center) {
            return (
              <circle
                key={zone.id}
                cx={`${zone.center.x}%`}
                cy={`${zone.center.y}%`}
                r="8%"
                fill={zone.color}
                fillOpacity={fillOpacity}
                stroke={zone.color}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeOpacity={strokeOpacity}
                className={`transition-all duration-200 ${onZoneClick ? 'cursor-pointer pointer-events-auto' : ''}`}
                onClick={() => onZoneClick?.(zone.id)}
              />
            );
          }

          return null;
        })}

        {/* Zone labels */}
        {zones.map((zone) => {
          const labelPos = zone.center || (zone.bounds ? {
            x: zone.bounds.x + zone.bounds.width / 2,
            y: zone.bounds.y + zone.bounds.height / 2,
          } : null);

          if (!labelPos) return null;

          return (
            <text
              key={`label-${zone.id}`}
              x={`${labelPos.x}%`}
              y={`${labelPos.y}%`}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isDark ? '#9CA3AF' : '#6B7280'}
              fontSize="8"
              fontWeight="500"
              className="pointer-events-none select-none"
              style={{ textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.8)' : '0 1px 2px rgba(255,255,255,0.8)' }}
            >
              {zone.name}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// =============================================================================
// ZONE OVERLAY TOGGLE BUTTON
// =============================================================================

export interface ZoneOverlayToggleProps {
  /** Whether the overlay is currently visible */
  isVisible: boolean;
  /** Callback to toggle visibility */
  onToggle: () => void;
  /** Size variant */
  size?: 'small' | 'medium';
}

/**
 * ZoneOverlayToggle - Button to show/hide zone boundaries
 */
export function ZoneOverlayToggle({ isVisible, onToggle, size = 'small' }: ZoneOverlayToggleProps) {
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  const sizeClasses = size === 'small' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <button
      onClick={onToggle}
      className={`
        ${sizeClasses} rounded-lg flex items-center justify-center
        transition-all duration-150
        ${
          isVisible
            ? 'bg-purple-500 text-white shadow-md'
            : isDark
              ? 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
        }
      `}
      title={isVisible ? 'Hide zone boundaries' : 'Show zone boundaries'}
    >
      <Map className={iconSize} />
    </button>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to manage zone overlay visibility state
 */
export function useZoneOverlayState(defaultVisible: boolean = false) {
  const [isVisible, setIsVisible] = useState(defaultVisible);

  const toggle = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  const show = useCallback(() => setIsVisible(true), []);
  const hide = useCallback(() => setIsVisible(false), []);

  return {
    isVisible,
    toggle,
    show,
    hide,
    setIsVisible,
  };
}

/**
 * Hook to manage zone override popover state
 */
export function useZoneOverridePopover() {
  const [popoverState, setPopoverState] = useState<{
    isOpen: boolean;
    strokeId: string | null;
    currentZone: DetectedZone | null;
    nearbyZones: DetectedZone[];
    position: { x: number; y: number };
  }>({
    isOpen: false,
    strokeId: null,
    currentZone: null,
    nearbyZones: [],
    position: { x: 0, y: 0 },
  });

  const openPopover = useCallback(
    (
      strokeId: string,
      currentZone: DetectedZone,
      nearbyZones: DetectedZone[],
      position: { x: number; y: number }
    ) => {
      setPopoverState({
        isOpen: true,
        strokeId,
        currentZone,
        nearbyZones,
        position,
      });
    },
    []
  );

  const closePopover = useCallback(() => {
    setPopoverState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  return {
    ...popoverState,
    openPopover,
    closePopover,
  };
}

// =============================================================================
// DEFAULT FACE ZONE BOUNDARIES
// =============================================================================

/**
 * Default zone boundaries for face charts
 * Used by ZoneBoundaryOverlay
 */
export const DEFAULT_FACE_ZONE_BOUNDARIES: ZoneBoundary[] = [
  // Upper Face
  {
    id: 'zone-forehead',
    name: 'Forehead',
    category: 'upper-face',
    color: '#3B82F6',
    center: { x: 50, y: 15 },
    bounds: { x: 30, y: 8, width: 40, height: 14 },
  },
  {
    id: 'zone-glabella',
    name: 'Glabella',
    category: 'upper-face',
    color: '#6366F1',
    center: { x: 50, y: 22 },
    bounds: { x: 42, y: 19, width: 16, height: 8 },
  },
  {
    id: 'zone-brow-l',
    name: 'L Brow',
    category: 'upper-face',
    color: '#8B5CF6',
    center: { x: 35, y: 22 },
    bounds: { x: 28, y: 19, width: 14, height: 6 },
  },
  {
    id: 'zone-brow-r',
    name: 'R Brow',
    category: 'upper-face',
    color: '#8B5CF6',
    center: { x: 65, y: 22 },
    bounds: { x: 58, y: 19, width: 14, height: 6 },
  },

  // Periorbital
  {
    id: 'zone-crows-l',
    name: 'L Crows',
    category: 'periorbital',
    color: '#F59E0B',
    center: { x: 28, y: 28 },
    bounds: { x: 20, y: 24, width: 12, height: 10 },
  },
  {
    id: 'zone-crows-r',
    name: 'R Crows',
    category: 'periorbital',
    color: '#F59E0B',
    center: { x: 72, y: 28 },
    bounds: { x: 68, y: 24, width: 12, height: 10 },
  },
  {
    id: 'zone-tear-l',
    name: 'L Tear',
    category: 'periorbital',
    color: '#FBBF24',
    center: { x: 41, y: 31 },
    bounds: { x: 35, y: 28, width: 12, height: 6 },
  },
  {
    id: 'zone-tear-r',
    name: 'R Tear',
    category: 'periorbital',
    color: '#FBBF24',
    center: { x: 59, y: 31 },
    bounds: { x: 53, y: 28, width: 12, height: 6 },
  },

  // Mid Face
  {
    id: 'zone-cheek-l',
    name: 'L Cheek',
    category: 'mid-face',
    color: '#A855F7',
    center: { x: 32, y: 40 },
    bounds: { x: 22, y: 35, width: 18, height: 14 },
  },
  {
    id: 'zone-cheek-r',
    name: 'R Cheek',
    category: 'mid-face',
    color: '#A855F7',
    center: { x: 68, y: 40 },
    bounds: { x: 60, y: 35, width: 18, height: 14 },
  },
  {
    id: 'zone-nose',
    name: 'Nose',
    category: 'mid-face',
    color: '#EC4899',
    center: { x: 50, y: 38 },
    bounds: { x: 44, y: 30, width: 12, height: 18 },
  },
  {
    id: 'zone-naso-l',
    name: 'L NLF',
    category: 'mid-face',
    color: '#D946EF',
    center: { x: 42, y: 45 },
    bounds: { x: 36, y: 42, width: 10, height: 10 },
  },
  {
    id: 'zone-naso-r',
    name: 'R NLF',
    category: 'mid-face',
    color: '#D946EF',
    center: { x: 58, y: 45 },
    bounds: { x: 54, y: 42, width: 10, height: 10 },
  },

  // Lower Face
  {
    id: 'zone-lip-upper',
    name: 'Upper Lip',
    category: 'lower-face',
    color: '#22C55E',
    center: { x: 50, y: 49 },
    bounds: { x: 40, y: 47, width: 20, height: 4 },
  },
  {
    id: 'zone-lip-lower',
    name: 'Lower Lip',
    category: 'lower-face',
    color: '#16A34A',
    center: { x: 50, y: 52 },
    bounds: { x: 40, y: 51, width: 20, height: 4 },
  },
  {
    id: 'zone-marionette-l',
    name: 'L Marionette',
    category: 'lower-face',
    color: '#10B981',
    center: { x: 42, y: 54 },
    bounds: { x: 36, y: 52, width: 10, height: 6 },
  },
  {
    id: 'zone-marionette-r',
    name: 'R Marionette',
    category: 'lower-face',
    color: '#10B981',
    center: { x: 58, y: 54 },
    bounds: { x: 54, y: 52, width: 10, height: 6 },
  },
  {
    id: 'zone-chin',
    name: 'Chin',
    category: 'lower-face',
    color: '#14B8A6',
    center: { x: 50, y: 60 },
    bounds: { x: 40, y: 56, width: 20, height: 10 },
  },

  // Jaw & Masseter
  {
    id: 'zone-jaw-l',
    name: 'L Jaw',
    category: 'lower-face',
    color: '#06B6D4',
    center: { x: 30, y: 55 },
    bounds: { x: 20, y: 50, width: 18, height: 12 },
  },
  {
    id: 'zone-jaw-r',
    name: 'R Jaw',
    category: 'lower-face',
    color: '#06B6D4',
    center: { x: 70, y: 55 },
    bounds: { x: 62, y: 50, width: 18, height: 12 },
  },
  {
    id: 'zone-masseter-l',
    name: 'L Masseter',
    category: 'lower-face',
    color: '#0891B2',
    center: { x: 26, y: 48 },
    bounds: { x: 18, y: 44, width: 14, height: 10 },
  },
  {
    id: 'zone-masseter-r',
    name: 'R Masseter',
    category: 'lower-face',
    color: '#0891B2',
    center: { x: 74, y: 48 },
    bounds: { x: 68, y: 44, width: 14, height: 10 },
  },

  // Neck
  {
    id: 'zone-platysma',
    name: 'Platysma',
    category: 'neck',
    color: '#64748B',
    center: { x: 50, y: 72 },
    bounds: { x: 30, y: 66, width: 40, height: 14 },
  },
];

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  ZoneBadge,
  ZoneOverridePopover,
  TreatedZonesSummary,
  ZoneBoundaryOverlay,
  ZoneOverlayToggle,
  useZoneOverlayState,
  useZoneOverridePopover,
  DEFAULT_FACE_ZONE_BOUNDARIES,
};
