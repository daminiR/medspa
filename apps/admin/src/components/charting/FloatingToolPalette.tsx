'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Grid3X3, Pencil, MousePointer, Paintbrush, MoveRight, Type, Ruler, GitBranch, Shapes, PenLine, AlertTriangle } from 'lucide-react';
import { DraggablePanel } from './DraggablePanel';
import { useChartingTheme } from '@/contexts/ChartingThemeContext';

export type DrawingTool = 'zone' | 'freehand' | 'select' | 'brush' | 'arrow' | 'text' | 'measure' | 'shape' | 'cannula' | 'vein' | 'danger';

// Tool visibility settings type
interface ToolVisibilitySettings {
  brushTool: boolean;
  arrowTool: boolean;
  textLabels: boolean;
  shapeTool: boolean;
  measurementTool: boolean;
  cannulaPathTool: boolean;
  veinDrawingTool: boolean;
  dangerZoneOverlay: boolean;
  showCalibrationControls: boolean;
  showAdvancedPanels: boolean;
  compactMode: boolean;
}

// ALL tools visible by default - no settings required to enable tools
const DEFAULT_TOOL_VISIBILITY: ToolVisibilitySettings = {
  brushTool: true,
  arrowTool: true,
  textLabels: true,
  shapeTool: true,
  measurementTool: true,
  cannulaPathTool: true,
  veinDrawingTool: true,
  dangerZoneOverlay: true,
  showCalibrationControls: true,
  showAdvancedPanels: true,
  compactMode: false,
};

// Storage key for charting tool settings
const STORAGE_KEY = 'chartingToolSettings';

// Hook to get tool visibility settings from localStorage
function useToolVisibility(): ToolVisibilitySettings {
  const [visibility, setVisibility] = useState<ToolVisibilitySettings>(DEFAULT_TOOL_VISIBILITY);

  useEffect(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.toolVisibility) {
          setVisibility({ ...DEFAULT_TOOL_VISIBILITY, ...parsed.toolVisibility });
        }
      }
    } catch (error) {
      console.error('Error loading tool visibility settings:', error);
    }

    // Listen for settings updates from the settings page
    const handleSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.toolVisibility) {
        setVisibility({ ...DEFAULT_TOOL_VISIBILITY, ...customEvent.detail.toolVisibility });
      }
    };

    window.addEventListener('chartingToolSettingsUpdated', handleSettingsUpdate);

    // Also listen for storage events from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (parsed.toolVisibility) {
            setVisibility({ ...DEFAULT_TOOL_VISIBILITY, ...parsed.toolVisibility });
          }
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('chartingToolSettingsUpdated', handleSettingsUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return visibility;
}

interface FloatingToolPaletteProps {
  activeTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  /** @deprecated Undo/redo moved to GlobalActionsToolbar - kept for backward compatibility */
  onUndo?: () => void;
  /** @deprecated Undo/redo moved to GlobalActionsToolbar - kept for backward compatibility */
  onRedo?: () => void;
  /** @deprecated Undo/redo moved to GlobalActionsToolbar - kept for backward compatibility */
  canUndo?: boolean;
  /** @deprecated Undo/redo moved to GlobalActionsToolbar - kept for backward compatibility */
  canRedo?: boolean;
  defaultCollapsed?: boolean;
}

export function FloatingToolPalette({
  activeTool,
  onToolChange,
  // Deprecated props - kept for backward compatibility, now handled by GlobalActionsToolbar
  onUndo: _onUndo,
  onRedo: _onRedo,
  canUndo: _canUndo,
  canRedo: _canRedo,
  defaultCollapsed = false,
}: FloatingToolPaletteProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  // Use fixed initial position for SSR, then adjust in useEffect if needed
  const [defaultPosition, setDefaultPosition] = useState({ x: 920, y: 68 });

  // Get tool visibility settings
  const toolVisibility = useToolVisibility();

  // Adjust position based on window size after mount (client-side only)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setDefaultPosition({ x: window.innerWidth - 100, y: 68 });
    }
  }, []);

  // Define all available tools with their visibility mapping
  // Icon is a component that accepts size prop
  const allTools: { id: DrawingTool; Icon: React.ComponentType<{ size?: number }>; label: string; visibilityKey?: keyof ToolVisibilitySettings; isBasic?: boolean }[] = [
    // Basic tools - always visible
    { id: 'select', Icon: MousePointer, label: 'Select tool - Select and move elements', isBasic: true },
    { id: 'zone', Icon: Grid3X3, label: 'Zone tool - Draw rectangular zones', isBasic: true },
    { id: 'freehand', Icon: Pencil, label: 'Draw - Place injection points', isBasic: true },
    // Advanced tools - visibility controlled by settings
    { id: 'brush', Icon: Paintbrush, label: 'Brush tool - Paint treatment areas', visibilityKey: 'brushTool' },
    { id: 'text', Icon: Type, label: 'Text tool - Add text labels (Avoid, Bruise, Notes)', visibilityKey: 'textLabels' },
    { id: 'arrow', Icon: MoveRight, label: 'Arrow tool - Draw directional arrows for thread lifts', visibilityKey: 'arrowTool' },
    { id: 'shape', Icon: Shapes, label: 'Shape tool - Draw circles, rectangles, and freeform areas', visibilityKey: 'shapeTool' },
    { id: 'measure', Icon: Ruler, label: 'Measure tool - Measure distances (brow lift, lip ratio, symmetry)', visibilityKey: 'measurementTool' },
    { id: 'cannula', Icon: GitBranch, label: 'Cannula tool - Document cannula entry points and fanning paths', visibilityKey: 'cannulaPathTool' },
    { id: 'vein', Icon: PenLine, label: 'Sketch tool - Draw smooth strokes for vein mapping', visibilityKey: 'veinDrawingTool' },
    { id: 'danger', Icon: AlertTriangle, label: 'Anatomical safety overlay - Show arteries, nerves, and vascular danger zones to prevent complications', visibilityKey: 'dangerZoneOverlay' },
  ];

  // Filter tools based on visibility settings
  const visibleTools = useMemo(() => {
    return allTools.filter(tool => {
      // Basic tools are always visible
      if (tool.isBasic) return true;
      // Advanced tools check their visibility setting
      if (tool.visibilityKey) {
        return toolVisibility[tool.visibilityKey];
      }
      return true;
    });
  }, [toolVisibility]);

  // Get theme from context (safely returns default if outside provider)
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  // Compact mode uses smaller buttons and tighter spacing
  const isCompact = toolVisibility.compactMode;
  const buttonSize = isCompact ? 36 : 44;
  const iconSize = isCompact ? 16 : 20;
  const gapSize = isCompact ? 'gap-1' : 'gap-1.5';

  return (
    <DraggablePanel
      initialPosition={defaultPosition}
      panelId="floating-tool-palette"
      title="Tools"
      variant="auto"
      onCollapse={() => setIsCollapsed(!isCollapsed)}
      isCollapsed={isCollapsed}
    >
      <div
        className={`flex flex-col ${gapSize}`}
        role="toolbar"
        aria-label="Drawing tools"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Drawing Tools Section - 2-column grid */}
        <div className={`grid grid-cols-2 ${gapSize}`}>
          {visibleTools.map((tool) => {
            const ToolIcon = tool.Icon;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => onToolChange(tool.id)}
                aria-label={tool.label}
                aria-pressed={activeTool === tool.id}
                style={{ width: buttonSize, height: buttonSize }}
                className={`
                  flex items-center justify-center rounded-lg
                  transition-all duration-150 ease-in-out
                  ${activeTool === tool.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : isDark
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                  cursor-pointer active:scale-95
                  border ${isDark ? 'border-gray-600' : 'border-gray-300'}
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 ${isDark ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'}
                `}
              >
                <ToolIcon size={iconSize} />
              </button>
            );
          })}
        </div>
        {/* Note: Undo/Redo buttons moved to GlobalActionsToolbar for always-visible access */}
      </div>
    </DraggablePanel>
  );
}

// Export a hook for managing tool state
export function useDrawingTools(initialTool: DrawingTool = 'select') {
  const [activeTool, setActiveTool] = React.useState<DrawingTool>(initialTool);
  const [history, setHistory] = React.useState<unknown[]>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const addToHistory = React.useCallback((state: unknown) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, state];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const undo = React.useCallback(() => {
    if (canUndo) {
      setHistoryIndex((prev) => prev - 1);
    }
  }, [canUndo]);

  const redo = React.useCallback(() => {
    if (canRedo) {
      setHistoryIndex((prev) => prev + 1);
    }
  }, [canRedo]);

  return {
    activeTool,
    setActiveTool,
    canUndo,
    canRedo,
    undo,
    redo,
    addToHistory,
    currentState: history[historyIndex],
  };
}

// Export hook for tool visibility so other components can use it
export { useToolVisibility };

export default FloatingToolPalette;
