'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Eye, EyeOff, Paintbrush, Syringe, ChevronDown, ChevronRight } from 'lucide-react';
import { DraggablePanel } from './DraggablePanel';
import { useChartingTheme } from '@/contexts/ChartingThemeContext';

// =============================================================================
// TYPES
// =============================================================================

export interface Layer {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  pointCount: number;
}

/** Brush layer for treatment types (laser, microneedling, etc.) */
export interface BrushLayer {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  strokeCount: number;
}

/** Layer category for grouping */
export type LayerCategory = 'injections' | 'treatments';

export interface LayersPanelProps {
  /** List of injection product layers to display */
  layers: Layer[];
  /** Callback when layer visibility changes */
  onLayerVisibilityChange: (layerId: string, visible: boolean) => void;
  /** Callback to toggle all layers on/off */
  onToggleAll?: (visible: boolean) => void;
  /** Whether panel is visible */
  isVisible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Brush/treatment layers (Fractional Laser, CO2, etc.) */
  brushLayers?: BrushLayer[];
  /** Callback when brush layer visibility changes */
  onBrushLayerVisibilityChange?: (layerId: string, visible: boolean) => void;
}

// =============================================================================
// LAYER ITEM COMPONENT
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
        flex items-center gap-2 py-2 px-2 rounded-lg
        transition-all duration-150 ease-in-out
        ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'}
        ${!layer.visible ? 'opacity-50' : ''}
      `}
    >
      {/* Visibility Toggle */}
      <button
        onClick={() => onToggleVisibility(layer.id)}
        className={`
          w-8 h-8 flex items-center justify-center rounded-md
          transition-colors duration-150
          ${layer.visible
            ? isDark ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'
            : isDark ? 'text-gray-500 hover:bg-gray-600' : 'text-gray-400 hover:bg-gray-200'
          }
        `}
        aria-label={layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}
        aria-pressed={layer.visible}
      >
        {layer.visible ? (
          <Eye className="w-4 h-4" />
        ) : (
          <EyeOff className="w-4 h-4" />
        )}
      </button>

      {/* Color Indicator */}
      <div
        className={`
          w-3 h-3 rounded-full flex-shrink-0
          ring-1 shadow-sm
          transition-opacity duration-150
          ${isDark ? 'ring-gray-600' : 'ring-gray-300'}
        `}
        style={{ backgroundColor: layer.color }}
      />

      {/* Layer Name */}
      <span
        className={`
          text-sm font-medium flex-1
          transition-colors duration-150
          ${layer.visible
            ? isDark ? 'text-gray-200' : 'text-gray-700'
            : isDark ? 'text-gray-500' : 'text-gray-400'
          }
        `}
      >
        {layer.name}
      </span>

      {/* Point Count Badge */}
      {layer.pointCount > 0 && (
        <span
          className={`
            min-w-[20px] h-5 px-1.5 rounded-full
            text-xs font-semibold
            flex items-center justify-center
            transition-all duration-150
            ${layer.visible
              ? isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
              : isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'
            }
          `}
        >
          {layer.pointCount}
        </span>
      )}
    </div>
  );
}

// =============================================================================
// BRUSH LAYER ITEM COMPONENT
// =============================================================================

interface BrushLayerItemProps {
  layer: BrushLayer;
  onToggleVisibility: (layerId: string) => void;
  isDark?: boolean;
}

function BrushLayerItem({ layer, onToggleVisibility, isDark = true }: BrushLayerItemProps) {
  return (
    <div
      className={`
        flex items-center gap-2 py-2 px-2 rounded-lg
        transition-all duration-150 ease-in-out
        ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100'}
        ${!layer.visible ? 'opacity-50' : ''}
      `}
    >
      {/* Visibility Toggle */}
      <button
        onClick={() => onToggleVisibility(layer.id)}
        className={`
          w-8 h-8 flex items-center justify-center rounded-md
          transition-colors duration-150
          ${layer.visible
            ? isDark ? 'text-gray-200 hover:bg-gray-600' : 'text-gray-700 hover:bg-gray-200'
            : isDark ? 'text-gray-500 hover:bg-gray-600' : 'text-gray-400 hover:bg-gray-200'
          }
        `}
        aria-label={layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}
        aria-pressed={layer.visible}
      >
        {layer.visible ? (
          <Eye className="w-4 h-4" />
        ) : (
          <EyeOff className="w-4 h-4" />
        )}
      </button>

      {/* Color Indicator - with brush stroke style */}
      <div
        className={`
          w-4 h-2 rounded-sm flex-shrink-0
          ring-1 shadow-sm
          transition-opacity duration-150
          ${isDark ? 'ring-gray-600' : 'ring-gray-300'}
        `}
        style={{ backgroundColor: layer.color }}
      />

      {/* Layer Name */}
      <span
        className={`
          text-sm font-medium flex-1
          transition-colors duration-150
          ${layer.visible
            ? isDark ? 'text-gray-200' : 'text-gray-700'
            : isDark ? 'text-gray-500' : 'text-gray-400'
          }
        `}
      >
        {layer.name}
      </span>

      {/* Stroke Count Badge */}
      {layer.strokeCount > 0 && (
        <span
          className={`
            min-w-[20px] h-5 px-1.5 rounded-full
            text-xs font-semibold
            flex items-center justify-center
            transition-all duration-150
            ${layer.visible
              ? isDark ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
              : isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'
            }
          `}
        >
          {layer.strokeCount}
        </span>
      )}
    </div>
  );
}

// =============================================================================
// SECTION HEADER COMPONENT
// =============================================================================

interface SectionHeaderProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  itemCount: number;
  isDark?: boolean;
}

function SectionHeader({ title, icon, isExpanded, onToggle, itemCount, isDark = true }: SectionHeaderProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        w-full flex items-center gap-2 py-1.5 px-1 rounded-md
        transition-colors duration-150
        ${isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'}
      `}
    >
      {isExpanded ? (
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      ) : (
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
      )}
      <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {icon}
      </span>
      <span className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {title}
      </span>
      {itemCount > 0 && (
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          ({itemCount})
        </span>
      )}
    </button>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function LayersPanel({
  layers,
  onLayerVisibilityChange,
  onToggleAll,
  isVisible = true,
  defaultCollapsed = false,
  brushLayers = [],
  onBrushLayerVisibilityChange,
}: LayersPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [injectionsExpanded, setInjectionsExpanded] = useState(true);
  const [treatmentsExpanded, setTreatmentsExpanded] = useState(true);
  // Use fixed initial position for SSR to avoid hydration mismatch
  const [defaultPosition, setDefaultPosition] = useState({ x: 16, y: 400 });

  // Get theme from context (safely returns default if outside provider)
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  // Adjust position based on window size after mount (client-side only)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setDefaultPosition({ x: 16, y: window.innerHeight - 300 });
    }
  }, []);

  // Calculate if all layers are visible (including brush layers)
  const allVisible = useMemo(() => {
    const injectionLayersVisible = layers.every(l => l.visible);
    const brushLayersVisible = brushLayers.length === 0 || brushLayers.every(l => l.visible);
    return injectionLayersVisible && brushLayersVisible;
  }, [layers, brushLayers]);

  // Total point count
  const totalPoints = useMemo(
    () => layers.reduce((sum, l) => sum + l.pointCount, 0),
    [layers]
  );

  // Total stroke count
  const totalStrokes = useMemo(
    () => brushLayers.reduce((sum, l) => sum + l.strokeCount, 0),
    [brushLayers]
  );

  // Layers with points (for display priority)
  const layersWithPoints = useMemo(
    () => layers.filter(l => l.pointCount > 0),
    [layers]
  );

  // Brush layers with strokes
  const brushLayersWithStrokes = useMemo(
    () => brushLayers.filter(l => l.strokeCount > 0),
    [brushLayers]
  );

  // Check if we have any content to show
  const hasAnyContent = layersWithPoints.length > 0 || brushLayersWithStrokes.length > 0;

  // Toggle individual layer visibility
  const handleToggleVisibility = useCallback((layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      onLayerVisibilityChange(layerId, !layer.visible);
    }
  }, [layers, onLayerVisibilityChange]);

  // Toggle individual brush layer visibility
  const handleToggleBrushVisibility = useCallback((layerId: string) => {
    const layer = brushLayers.find(l => l.id === layerId);
    if (layer && onBrushLayerVisibilityChange) {
      onBrushLayerVisibilityChange(layerId, !layer.visible);
    }
  }, [brushLayers, onBrushLayerVisibilityChange]);

  // Toggle all layers
  const handleToggleAll = useCallback(() => {
    const newVisibility = !allVisible;

    if (onToggleAll) {
      onToggleAll(newVisibility);
    } else {
      // Toggle each injection layer individually
      layers.forEach(layer => {
        onLayerVisibilityChange(layer.id, newVisibility);
      });
    }

    // Also toggle brush layers
    if (onBrushLayerVisibilityChange) {
      brushLayers.forEach(layer => {
        onBrushLayerVisibilityChange(layer.id, newVisibility);
      });
    }
  }, [allVisible, layers, brushLayers, onLayerVisibilityChange, onToggleAll, onBrushLayerVisibilityChange]);

  if (!isVisible) return null;

  return (
    <DraggablePanel
      panelId="layers-panel"
      initialPosition={defaultPosition}
      title="Layers"
      variant="auto"
      onCollapse={() => setIsCollapsed(!isCollapsed)}
      isCollapsed={isCollapsed}
    >
      <div className="space-y-2" style={{ pointerEvents: 'auto' }}>
        {/* Toggle All Button */}
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={handleToggleAll}
            className={`
              text-xs px-2 py-1 rounded-md transition-colors
              ${allVisible
                ? isDark ? 'text-gray-400 hover:bg-gray-700/50' : 'text-gray-500 hover:bg-gray-100'
                : isDark ? 'text-purple-400 hover:bg-purple-900/30' : 'text-purple-600 hover:bg-purple-50'
              }
            `}
            title={allVisible ? 'Hide all layers' : 'Show all layers'}
          >
            {allVisible ? 'Hide All' : 'Show All'}
          </button>
        </div>

        {/* ============================================ */}
        {/* INJECTION POINTS SECTION                    */}
        {/* ============================================ */}
        {layersWithPoints.length > 0 && (
          <div className="space-y-1">
            <SectionHeader
              title="Injections"
              icon={<Syringe className="w-3.5 h-3.5" />}
              isExpanded={injectionsExpanded}
              onToggle={() => setInjectionsExpanded(!injectionsExpanded)}
              itemCount={layersWithPoints.length}
              isDark={isDark}
            />
            {injectionsExpanded && (
              <div className="space-y-0.5 pl-2">
                {layersWithPoints.map(layer => (
                  <LayerItem
                    key={layer.id}
                    layer={layer}
                    onToggleVisibility={handleToggleVisibility}
                    isDark={isDark}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================ */}
        {/* TREATMENT AREAS (BRUSH) SECTION             */}
        {/* ============================================ */}
        {brushLayersWithStrokes.length > 0 && (
          <div className="space-y-1">
            <SectionHeader
              title="Treatments"
              icon={<Paintbrush className="w-3.5 h-3.5" />}
              isExpanded={treatmentsExpanded}
              onToggle={() => setTreatmentsExpanded(!treatmentsExpanded)}
              itemCount={brushLayersWithStrokes.length}
              isDark={isDark}
            />
            {treatmentsExpanded && (
              <div className="space-y-0.5 pl-2">
                {brushLayersWithStrokes.map(layer => (
                  <BrushLayerItem
                    key={layer.id}
                    layer={layer}
                    onToggleVisibility={handleToggleBrushVisibility}
                    isDark={isDark}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state - no content yet */}
        {!hasAnyContent && (
          <div className={`py-4 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            No annotations yet
          </div>
        )}

        {/* Summary footer */}
        {hasAnyContent && (
          <div className={`pt-2 border-t mt-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            {totalPoints > 0 && (
              <div className={`flex items-center justify-between text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>Injection points</span>
                <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{totalPoints}</span>
              </div>
            )}
            {totalStrokes > 0 && (
              <div className={`flex items-center justify-between text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span>Treatment strokes</span>
                <span className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{totalStrokes}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </DraggablePanel>
  );
}

// =============================================================================
// HOOK FOR MANAGING LAYER STATE
// =============================================================================

export interface UseLayersStateOptions {
  /** Initial product definitions */
  products: Array<{ id: string; name: string; color: string }>;
}

export interface UseLayersStateReturn {
  layers: Layer[];
  visibleLayerIds: Set<string>;
  setLayerVisibility: (layerId: string, visible: boolean) => void;
  toggleAllLayers: (visible: boolean) => void;
  updatePointCounts: (pointsByProduct: Map<string, number>) => void;
  isLayerVisible: (layerId: string) => boolean;
}

export function useLayersState({ products }: UseLayersStateOptions): UseLayersStateReturn {
  // Initialize layers from products
  const [layers, setLayers] = useState<Layer[]>(() =>
    products.map(product => ({
      id: product.id,
      name: product.name,
      color: product.color,
      visible: true,
      pointCount: 0,
    }))
  );

  // Derived set of visible layer IDs for quick lookup
  const visibleLayerIds = useMemo(
    () => new Set(layers.filter(l => l.visible).map(l => l.id)),
    [layers]
  );

  // Set visibility for a single layer
  const setLayerVisibility = useCallback((layerId: string, visible: boolean) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === layerId ? { ...layer, visible } : layer
      )
    );
  }, []);

  // Toggle all layers on/off
  const toggleAllLayers = useCallback((visible: boolean) => {
    setLayers(prev =>
      prev.map(layer => ({ ...layer, visible }))
    );
  }, []);

  // Update point counts from injection points data
  // IMPORTANT: Only updates state if counts actually changed to prevent unnecessary re-renders
  const updatePointCounts = useCallback((pointsByProduct: Map<string, number>) => {
    setLayers(prev => {
      // Check if any counts actually changed
      const hasChanges = prev.some(layer => {
        const newCount = pointsByProduct.get(layer.id) || 0;
        return layer.pointCount !== newCount;
      });

      // Only create new state if there are actual changes
      if (!hasChanges) {
        return prev; // Return same reference to prevent re-render
      }

      return prev.map(layer => ({
        ...layer,
        pointCount: pointsByProduct.get(layer.id) || 0,
      }));
    });
  }, []);

  // Check if a specific layer is visible
  const isLayerVisible = useCallback(
    (layerId: string) => visibleLayerIds.has(layerId),
    [visibleLayerIds]
  );

  return {
    layers,
    visibleLayerIds,
    setLayerVisibility,
    toggleAllLayers,
    updatePointCounts,
    isLayerVisible,
  };
}

// =============================================================================
// HOOK FOR MANAGING BRUSH LAYER STATE
// =============================================================================

export interface UseBrushLayersStateOptions {
  /** Treatment type definitions */
  treatmentTypes: Array<{ id: string; name: string; color: string }>;
}

export interface UseBrushLayersStateReturn {
  brushLayers: BrushLayer[];
  visibleBrushLayerIds: Set<string>;
  hiddenBrushLayerIds: Set<string>;
  setBrushLayerVisibility: (layerId: string, visible: boolean) => void;
  toggleAllBrushLayers: (visible: boolean) => void;
  updateStrokeCounts: (strokesByType: Record<string, number>) => void;
  isBrushLayerVisible: (layerId: string) => boolean;
}

export function useBrushLayersState({ treatmentTypes }: UseBrushLayersStateOptions): UseBrushLayersStateReturn {
  // Initialize layers from treatment types
  const [brushLayers, setBrushLayers] = useState<BrushLayer[]>(() =>
    treatmentTypes.map(treatment => ({
      id: treatment.id,
      name: treatment.name,
      color: treatment.color,
      visible: true,
      strokeCount: 0,
    }))
  );

  // Track previous hidden IDs to provide stable reference when content hasn't changed
  // This prevents unnecessary re-renders in consuming components (like SmoothBrushTool)
  const prevHiddenIdsRef = React.useRef<Set<string>>(new Set());

  // Derived set of visible layer IDs for quick lookup
  const visibleBrushLayerIds = useMemo(
    () => new Set(brushLayers.filter(l => l.visible).map(l => l.id)),
    [brushLayers]
  );

  // Derived set of hidden layer IDs (for passing to SmoothBrushTool)
  // IMPORTANT: Returns stable reference if content hasn't changed to prevent
  // infinite update loops in components that depend on this Set
  const hiddenBrushLayerIds = useMemo(() => {
    const newHiddenIds = brushLayers.filter(l => !l.visible).map(l => l.id);
    const prevHiddenIds = prevHiddenIdsRef.current;

    // Check if content actually changed
    const contentChanged =
      newHiddenIds.length !== prevHiddenIds.size ||
      newHiddenIds.some(id => !prevHiddenIds.has(id));

    if (contentChanged) {
      const newSet = new Set(newHiddenIds);
      prevHiddenIdsRef.current = newSet;
      return newSet;
    }

    // Return previous reference if content is the same
    return prevHiddenIds;
  }, [brushLayers]);

  // Set visibility for a single layer
  const setBrushLayerVisibility = useCallback((layerId: string, visible: boolean) => {
    setBrushLayers(prev =>
      prev.map(layer =>
        layer.id === layerId ? { ...layer, visible } : layer
      )
    );
  }, []);

  // Toggle all layers on/off
  const toggleAllBrushLayers = useCallback((visible: boolean) => {
    setBrushLayers(prev =>
      prev.map(layer => ({ ...layer, visible }))
    );
  }, []);

  // Update stroke counts from brush paths data
  // IMPORTANT: Only updates state if counts actually changed to prevent infinite loops
  const updateStrokeCounts = useCallback((strokesByType: Record<string, number>) => {
    // DEBUG: Log incoming stroke counts (uncomment to debug)
    // console.log('[LayersPanel] updateStrokeCounts called:', strokesByType);

    setBrushLayers(prev => {
      // Check if any counts actually changed
      const hasChanges = prev.some(layer => {
        const newCount = strokesByType[layer.id] || 0;
        return layer.strokeCount !== newCount;
      });

      // Only create new state if there are actual changes
      if (!hasChanges) {
        return prev; // Return same reference to prevent re-render
      }

      return prev.map(layer => ({
        ...layer,
        strokeCount: strokesByType[layer.id] || 0,
      }));
    });
  }, []);

  // Check if a specific layer is visible
  const isBrushLayerVisible = useCallback(
    (layerId: string) => visibleBrushLayerIds.has(layerId),
    [visibleBrushLayerIds]
  );

  return {
    brushLayers,
    visibleBrushLayerIds,
    hiddenBrushLayerIds,
    setBrushLayerVisibility,
    toggleAllBrushLayers,
    updateStrokeCounts,
    isBrushLayerVisible,
  };
}

export default LayersPanel;
