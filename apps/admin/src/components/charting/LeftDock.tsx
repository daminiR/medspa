'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Eye,
  EyeOff,
  Paintbrush,
  Syringe,
  ChevronDown,
  ChevronRight,
  Layers,
  Box,
  User,
  ChevronLeft,
  Users,
  Grid3X3,
  Scan,
  Target,
  Map
} from 'lucide-react';
import { useChartingTheme } from '@/contexts/ChartingThemeContext';
import { TreatedZonesSummary, ZoneOverlayToggle, ZoneTreatmentSummary } from './ZoneDisplay';

// =============================================================================
// TYPES
// =============================================================================

export type ViewMode = '2D' | '3D';
export type BodyPart = 'face' | 'torso' | 'fullBody';
export type Gender = 'male' | 'female';

export interface Layer {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  pointCount: number;
}

export interface BrushLayer {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  strokeCount: number;
}

export interface PatientInfo {
  name: string;
  mrn?: string;
  photoUrl?: string;
}

export interface LeftDockProps {
  // View Options
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  bodyPart: BodyPart;
  onBodyPartChange: (part: BodyPart) => void;
  gender: Gender;
  onGenderChange: (gender: Gender) => void;

  // Grid & Anatomy Overlay toggles
  showGrid?: boolean;
  onToggleGrid?: () => void;
  showAnatomyOverlay?: boolean;
  onToggleAnatomyOverlay?: () => void;

  // Zone Boundary Overlay toggle (new)
  showZoneBoundaries?: boolean;
  onToggleZoneBoundaries?: () => void;

  // Layers
  layers: Layer[];
  onLayerVisibilityChange: (layerId: string, visible: boolean) => void;
  onToggleAllLayers?: (visible: boolean) => void;
  brushLayers?: BrushLayer[];
  onBrushLayerVisibilityChange?: (layerId: string, visible: boolean) => void;

  // Zone Summary (new) - Shows treated zones grouped by zone
  zoneSummaries?: ZoneTreatmentSummary[];
  onZoneClick?: (zoneId: string) => void;

  // Patient Context (optional - can be hidden)
  patient?: PatientInfo;

  // Initial state
  defaultCollapsed?: boolean;
}

// =============================================================================
// SECTION COMPONENTS
// =============================================================================

interface DockSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  isDark?: boolean;
}

function DockSection({ title, icon, children, defaultExpanded = true, isDark = true }: DockSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-700/50 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full flex items-center gap-2 px-3 py-2.5
          transition-colors duration-150
          ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'}
        `}
      >
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        )}
        <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {icon}
        </span>
        <span className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {title}
        </span>
      </button>
      {isExpanded && (
        <div className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// VIEW OPTIONS CONTENT
// =============================================================================

interface ViewOptionsContentProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  bodyPart: BodyPart;
  onBodyPartChange: (part: BodyPart) => void;
  gender: Gender;
  onGenderChange: (gender: Gender) => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  showAnatomyOverlay?: boolean;
  onToggleAnatomyOverlay?: () => void;
  showZoneBoundaries?: boolean;
  onToggleZoneBoundaries?: () => void;
  isDark?: boolean;
}

function ViewOptionsContent({
  viewMode,
  onViewModeChange,
  bodyPart,
  onBodyPartChange,
  gender,
  onGenderChange,
  showGrid,
  onToggleGrid,
  showAnatomyOverlay,
  onToggleAnatomyOverlay,
  showZoneBoundaries,
  onToggleZoneBoundaries,
  isDark = true,
}: ViewOptionsContentProps) {
  const toggleGroupBg = isDark ? 'bg-gray-700/50' : 'bg-gray-100';
  const activeButtonBg = isDark ? 'bg-gray-600 text-white' : 'bg-white text-gray-900 shadow-sm';
  const inactiveButton = isDark ? 'text-gray-400 hover:text-white hover:bg-gray-600/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';

  const bodyPartOptions: { value: BodyPart; label: string }[] = [
    { value: 'face', label: 'Face' },
    { value: 'torso', label: 'Torso' },
    { value: 'fullBody', label: 'Full' },
  ];

  return (
    <div className="space-y-3">
      {/* 2D / 3D Toggle */}
      <div className="space-y-1.5">
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>View Mode</span>
        <div className={`flex ${toggleGroupBg} rounded-lg p-0.5`}>
          <button
            onClick={() => onViewModeChange('2D')}
            className={`
              flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium
              transition-all duration-150 min-h-[40px]
              ${viewMode === '2D' ? activeButtonBg : inactiveButton}
            `}
          >
            <Layers className="w-4 h-4" />
            2D
          </button>
          <button
            onClick={() => onViewModeChange('3D')}
            className={`
              flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium
              transition-all duration-150 min-h-[40px]
              ${viewMode === '3D' ? activeButtonBg : inactiveButton}
            `}
          >
            <Box className="w-4 h-4" />
            3D
          </button>
        </div>
      </div>

      {/* Body Part Toggle */}
      <div className="space-y-1.5">
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Body Area</span>
        <div className={`flex ${toggleGroupBg} rounded-lg p-0.5`}>
          {bodyPartOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onBodyPartChange(option.value)}
              className={`
                flex-1 px-2 py-2 rounded-md text-xs font-medium
                transition-all duration-150 min-h-[36px]
                ${bodyPart === option.value ? activeButtonBg : inactiveButton}
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gender Toggle */}
      <div className="space-y-1.5">
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Anatomy</span>
        <div className={`flex ${toggleGroupBg} rounded-lg p-0.5`}>
          <button
            onClick={() => onGenderChange('female')}
            className={`
              flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium
              transition-all duration-150 min-h-[36px]
              ${gender === 'female' ? activeButtonBg : inactiveButton}
            `}
          >
            <Users className="w-3.5 h-3.5" />
            Female
          </button>
          <button
            onClick={() => onGenderChange('male')}
            className={`
              flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium
              transition-all duration-150 min-h-[36px]
              ${gender === 'male' ? activeButtonBg : inactiveButton}
            `}
          >
            <User className="w-3.5 h-3.5" />
            Male
          </button>
        </div>
      </div>

      {/* Grid & Anatomy Overlay Toggles */}
      {(onToggleGrid || onToggleAnatomyOverlay || onToggleZoneBoundaries) && (
        <div className="space-y-2 pt-1">
          <div className="flex gap-2">
            {onToggleGrid && (
              <button
                onClick={onToggleGrid}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium
                  transition-all duration-150 min-h-[36px]
                  ${showGrid
                    ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    : isDark ? 'bg-gray-700/50 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }
                `}
                title="Toggle grid overlay"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                Grid
              </button>
            )}
            {onToggleAnatomyOverlay && (
              <button
                onClick={onToggleAnatomyOverlay}
                className={`
                  flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium
                  transition-all duration-150 min-h-[36px]
                  ${showAnatomyOverlay
                    ? 'bg-red-500 text-white'
                    : isDark ? 'bg-gray-700/50 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                  }
                `}
                title="Toggle anatomical safety overlay"
              >
                <Scan className="w-3.5 h-3.5" />
                Anatomy
              </button>
            )}
          </div>
          {/* Zone Boundaries Toggle - shows zone areas on chart */}
          {onToggleZoneBoundaries && (
            <button
              onClick={onToggleZoneBoundaries}
              className={`
                w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium
                transition-all duration-150 min-h-[36px]
                ${showZoneBoundaries
                  ? isDark ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'
                  : isDark ? 'bg-gray-700/50 text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }
              `}
              title="Show zone boundaries on chart"
            >
              <Map className="w-3.5 h-3.5" />
              Zone Boundaries
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// LAYER ITEM COMPONENTS
// =============================================================================

interface LayerItemProps {
  layer: Layer;
  onToggleVisibility: (layerId: string) => void;
  isDark?: boolean;
}

function LayerItem({ layer, onToggleVisibility, isDark = true }: LayerItemProps) {
  return (
    <div
      className={`
        flex items-center gap-2 py-1.5 px-2 rounded-lg
        transition-all duration-150 ease-in-out
        ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'}
        ${!layer.visible ? 'opacity-50' : ''}
      `}
    >
      {/* Visibility Toggle */}
      <button
        onClick={() => onToggleVisibility(layer.id)}
        className={`
          w-7 h-7 flex items-center justify-center rounded-md
          transition-colors duration-150
          ${layer.visible
            ? isDark ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'
            : isDark ? 'text-gray-500 hover:bg-gray-600' : 'text-gray-400 hover:bg-gray-200'
          }
        `}
        aria-label={layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}
      >
        {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      </button>

      {/* Color Indicator */}
      <div
        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ring-1 ${isDark ? 'ring-gray-600' : 'ring-gray-300'}`}
        style={{ backgroundColor: layer.color }}
      />

      {/* Layer Name */}
      <span className={`text-xs font-medium flex-1 truncate ${layer.visible ? (isDark ? 'text-gray-200' : 'text-gray-700') : (isDark ? 'text-gray-500' : 'text-gray-400')}`}>
        {layer.name}
      </span>

      {/* Point Count Badge */}
      {layer.pointCount > 0 && (
        <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold flex items-center justify-center ${
          layer.visible
            ? isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
            : isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'
        }`}>
          {layer.pointCount}
        </span>
      )}
    </div>
  );
}

interface BrushLayerItemProps {
  layer: BrushLayer;
  onToggleVisibility: (layerId: string) => void;
  isDark?: boolean;
}

function BrushLayerItem({ layer, onToggleVisibility, isDark = true }: BrushLayerItemProps) {
  return (
    <div
      className={`
        flex items-center gap-2 py-1.5 px-2 rounded-lg
        transition-all duration-150 ease-in-out
        ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'}
        ${!layer.visible ? 'opacity-50' : ''}
      `}
    >
      <button
        onClick={() => onToggleVisibility(layer.id)}
        className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors duration-150 ${
          layer.visible
            ? isDark ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'
            : isDark ? 'text-gray-500 hover:bg-gray-600' : 'text-gray-400 hover:bg-gray-200'
        }`}
        aria-label={layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}
      >
        {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      </button>

      <div
        className={`w-3.5 h-1.5 rounded-sm flex-shrink-0 ring-1 ${isDark ? 'ring-gray-600' : 'ring-gray-300'}`}
        style={{ backgroundColor: layer.color }}
      />

      <span className={`text-xs font-medium flex-1 truncate ${layer.visible ? (isDark ? 'text-gray-200' : 'text-gray-700') : (isDark ? 'text-gray-500' : 'text-gray-400')}`}>
        {layer.name}
      </span>

      {layer.strokeCount > 0 && (
        <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold flex items-center justify-center ${
          layer.visible
            ? isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
            : isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'
        }`}>
          {layer.strokeCount}
        </span>
      )}
    </div>
  );
}

// =============================================================================
// LAYERS CONTENT
// =============================================================================

interface LayersContentProps {
  layers: Layer[];
  onLayerVisibilityChange: (layerId: string, visible: boolean) => void;
  onToggleAllLayers?: (visible: boolean) => void;
  brushLayers?: BrushLayer[];
  onBrushLayerVisibilityChange?: (layerId: string, visible: boolean) => void;
  isDark?: boolean;
}

function LayersContent({
  layers,
  onLayerVisibilityChange,
  onToggleAllLayers,
  brushLayers = [],
  onBrushLayerVisibilityChange,
  isDark = true,
}: LayersContentProps) {
  const [injectionsExpanded, setInjectionsExpanded] = useState(true);
  const [treatmentsExpanded, setTreatmentsExpanded] = useState(true);

  // Filter to layers with content
  const layersWithPoints = useMemo(() => layers.filter(l => l.pointCount > 0), [layers]);
  const brushLayersWithStrokes = useMemo(() => brushLayers.filter(l => l.strokeCount > 0), [brushLayers]);
  const hasAnyContent = layersWithPoints.length > 0 || brushLayersWithStrokes.length > 0;

  // Check if all visible
  const allVisible = useMemo(() => {
    const injectionsVisible = layers.every(l => l.visible);
    const brushVisible = brushLayers.length === 0 || brushLayers.every(l => l.visible);
    return injectionsVisible && brushVisible;
  }, [layers, brushLayers]);

  // Toggle handlers
  const handleToggleVisibility = useCallback((layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) onLayerVisibilityChange(layerId, !layer.visible);
  }, [layers, onLayerVisibilityChange]);

  const handleToggleBrushVisibility = useCallback((layerId: string) => {
    const layer = brushLayers.find(l => l.id === layerId);
    if (layer && onBrushLayerVisibilityChange) {
      onBrushLayerVisibilityChange(layerId, !layer.visible);
    }
  }, [brushLayers, onBrushLayerVisibilityChange]);

  const handleToggleAll = useCallback(() => {
    const newVisibility = !allVisible;
    if (onToggleAllLayers) {
      onToggleAllLayers(newVisibility);
    } else {
      layers.forEach(layer => onLayerVisibilityChange(layer.id, newVisibility));
    }
    if (onBrushLayerVisibilityChange) {
      brushLayers.forEach(layer => onBrushLayerVisibilityChange(layer.id, newVisibility));
    }
  }, [allVisible, layers, brushLayers, onLayerVisibilityChange, onToggleAllLayers, onBrushLayerVisibilityChange]);

  // Totals
  const totalPoints = useMemo(() => layers.reduce((sum, l) => sum + l.pointCount, 0), [layers]);
  const totalStrokes = useMemo(() => brushLayers.reduce((sum, l) => sum + l.strokeCount, 0), [brushLayers]);

  return (
    <div className="space-y-2">
      {/* Toggle All Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleToggleAll}
          className={`text-xs px-2 py-1 rounded-md transition-colors ${
            allVisible
              ? isDark ? 'text-gray-400 hover:bg-gray-700/50' : 'text-gray-500 hover:bg-gray-100'
              : isDark ? 'text-purple-400 hover:bg-purple-900/30' : 'text-purple-600 hover:bg-purple-50'
          }`}
        >
          {allVisible ? 'Hide All' : 'Show All'}
        </button>
      </div>

      {/* Injection Points Section */}
      {layersWithPoints.length > 0 && (
        <div className="space-y-1">
          <button
            onClick={() => setInjectionsExpanded(!injectionsExpanded)}
            className={`w-full flex items-center gap-2 py-1 px-1 rounded-md transition-colors ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'}`}
          >
            {injectionsExpanded ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
            <Syringe className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-[10px] font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Injections</span>
            <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({layersWithPoints.length})</span>
          </button>
          {injectionsExpanded && (
            <div className="space-y-0.5 pl-1">
              {layersWithPoints.map(layer => (
                <LayerItem key={layer.id} layer={layer} onToggleVisibility={handleToggleVisibility} isDark={isDark} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Treatment Areas Section */}
      {brushLayersWithStrokes.length > 0 && (
        <div className="space-y-1">
          <button
            onClick={() => setTreatmentsExpanded(!treatmentsExpanded)}
            className={`w-full flex items-center gap-2 py-1 px-1 rounded-md transition-colors ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'}`}
          >
            {treatmentsExpanded ? <ChevronDown className="w-3 h-3 text-gray-400" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
            <Paintbrush className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
            <span className={`text-[10px] font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Treatments</span>
            <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({brushLayersWithStrokes.length})</span>
          </button>
          {treatmentsExpanded && (
            <div className="space-y-0.5 pl-1">
              {brushLayersWithStrokes.map(layer => (
                <BrushLayerItem key={layer.id} layer={layer} onToggleVisibility={handleToggleBrushVisibility} isDark={isDark} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!hasAnyContent && (
        <div className={`py-3 text-center text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          No annotations yet
        </div>
      )}

      {/* Summary Footer */}
      {hasAnyContent && (
        <div className={`pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          {totalPoints > 0 && (
            <div className={`flex items-center justify-between text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <span>Injection points</span>
              <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{totalPoints}</span>
            </div>
          )}
          {totalStrokes > 0 && (
            <div className={`flex items-center justify-between text-[10px] mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <span>Treatment strokes</span>
              <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{totalStrokes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN LEFT DOCK COMPONENT
// =============================================================================

export function LeftDock({
  // View Options
  viewMode,
  onViewModeChange,
  bodyPart,
  onBodyPartChange,
  gender,
  onGenderChange,
  showGrid,
  onToggleGrid,
  showAnatomyOverlay,
  onToggleAnatomyOverlay,
  // Zone Boundary Overlay
  showZoneBoundaries,
  onToggleZoneBoundaries,
  // Layers
  layers,
  onLayerVisibilityChange,
  onToggleAllLayers,
  brushLayers = [],
  onBrushLayerVisibilityChange,
  // Zone Summary
  zoneSummaries = [],
  onZoneClick,
  // Patient
  patient,
  // Initial state
  defaultCollapsed = false,
}: LeftDockProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  // Get theme from context
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  // Panel styling based on theme
  const panelBg = isDark
    ? 'bg-gray-800/95 backdrop-blur-md border-gray-700'
    : 'bg-white/95 backdrop-blur-md border-gray-200 shadow-lg';

  const toggleButtonBg = isDark
    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-600';

  return (
    <div
      className={`
        fixed left-0 top-12 bottom-0 z-[1100]
        flex flex-row
        transition-all duration-300 ease-in-out
      `}
      style={{ pointerEvents: 'none' }}
    >
      {/* Main Panel */}
      <div
        className={`
          ${panelBg}
          border-r
          overflow-hidden
          transition-all duration-300 ease-in-out
          flex flex-col
          ${isCollapsed ? 'w-0 opacity-0' : 'w-[220px] opacity-100'}
        `}
        style={{ pointerEvents: isCollapsed ? 'none' : 'auto' }}
      >
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* Patient Context (if provided) */}
          {patient && (
            <div className={`px-3 py-3 border-b ${isDark ? 'border-gray-700/50' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                {patient.photoUrl ? (
                  <img
                    src={patient.photoUrl}
                    alt={patient.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-purple-900/50 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                    <User className="w-4 h-4" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {patient.name}
                  </p>
                  {patient.mrn && (
                    <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      MRN: {patient.mrn}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* View Options Section */}
          <DockSection title="View" icon={<Layers className="w-3.5 h-3.5" />} isDark={isDark}>
            <ViewOptionsContent
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
              bodyPart={bodyPart}
              onBodyPartChange={onBodyPartChange}
              gender={gender}
              onGenderChange={onGenderChange}
              showGrid={showGrid}
              onToggleGrid={onToggleGrid}
              showAnatomyOverlay={showAnatomyOverlay}
              onToggleAnatomyOverlay={onToggleAnatomyOverlay}
              showZoneBoundaries={showZoneBoundaries}
              onToggleZoneBoundaries={onToggleZoneBoundaries}
              isDark={isDark}
            />
          </DockSection>

          {/* Layers Section */}
          <DockSection title="Layers" icon={<Eye className="w-3.5 h-3.5" />} isDark={isDark}>
            <LayersContent
              layers={layers}
              onLayerVisibilityChange={onLayerVisibilityChange}
              onToggleAllLayers={onToggleAllLayers}
              brushLayers={brushLayers}
              onBrushLayerVisibilityChange={onBrushLayerVisibilityChange}
              isDark={isDark}
            />
          </DockSection>

          {/* Treated Zones Section - Shows treated zones grouped by anatomical area */}
          {zoneSummaries.length > 0 && (
            <DockSection title="Treated Zones" icon={<Target className="w-3.5 h-3.5" />} isDark={isDark}>
              <TreatedZonesSummary
                zoneSummaries={zoneSummaries}
                onZoneClick={onZoneClick}
              />
            </DockSection>
          )}
        </div>
      </div>

      {/* Collapse/Expand Toggle Button - Always visible on the edge */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`
          ${toggleButtonBg}
          w-6 h-14 flex items-center justify-center
          rounded-r-lg shadow-md
          transition-all duration-200
          self-center
          border-y border-r
          ${isDark ? 'border-gray-600' : 'border-gray-300'}
        `}
        style={{ pointerEvents: 'auto' }}
        aria-label={isCollapsed ? 'Expand left panel' : 'Collapse left panel'}
        title={isCollapsed ? 'Expand (reference info)' : 'Collapse'}
      >
        <ChevronLeft
          className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  );
}

export default LeftDock;
