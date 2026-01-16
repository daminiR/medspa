'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Grid3X3,
  Pencil,
  MousePointer,
  Paintbrush,
  Type,
  Ruler,
  GitBranch,
  Shapes,
  PenLine,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Check,
  Undo2,
  Trash2,
} from 'lucide-react';
import { useChartingTheme } from '@/contexts/ChartingThemeContext';
import { SimpleTextSettingsPanel, TEXT_PRESETS } from '@/components/charting/SimpleTextTool';
import type { TextPreset, SimpleTextLabel } from '@/components/charting/SimpleTextTool';

// =============================================================================
// RIGHT DOCK COMPONENT
// =============================================================================
// Fixed dock on the RIGHT side of the screen for action-oriented tools.
// Based on PRACTITIONER_CONTEXT.md and human behavior research:
// - 90% of users are right-handed
// - Right hand is 10% faster, 20% more accurate
// - Fitts' Law: frequent actions should be near where action happens
// - RIGHT side = actions/tools (frequent tapping, precision needed)
//
// This dock contains:
// 1. Tools Palette - Drawing tools (pen, brush, arrows, text, etc.)
// 2. Product/Dosage Picker - The MOST frequent action during charting
// 3. Treatment Summary - Running totals (units, cost)
// =============================================================================

// Types imported from related components
// IMPORTANT: These types MUST match FloatingToolPalette.tsx - keep them in sync
export type DrawingTool = 'zone' | 'freehand' | 'select' | 'brush' | 'simpleText' | 'measure' | 'shape' | 'sketch' | 'danger';
// Note: 'arrow' type removed - arrow functionality is now part of ShapeTool
// Note: 'cannula' and 'vein' are now sub-modes under 'sketch' tool

// Sub-modes for the Sketch umbrella tool
export type SketchMode = 'veins' | 'cannula';

export interface Product {
  id: string;
  name: string;
  color: string;
  abbreviation?: string;
  defaultDosage?: number;
  type?: 'neurotoxin' | 'filler' | 'biostimulator' | 'skin-booster';
}

export interface TreatmentTypeOption {
  id: string;
  name: string;
  color: string;
  defaultOpacity: number;
}

export type ToolSettingsMode = 'injection' | 'brush' | 'sketch' | 'shape' | 'simpleText' | 'measure';
// Note: 'arrow' mode removed - arrow functionality is now part of shape mode
// Note: 'cannula' mode removed - cannula is now a sub-mode of 'sketch'

// Tool visibility settings
interface ToolVisibilitySettings {
  brushTool: boolean;
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

const STORAGE_KEY = 'chartingToolSettings';

// Hook to get tool visibility settings
function useToolVisibility(): ToolVisibilitySettings {
  const [visibility, setVisibility] = useState<ToolVisibilitySettings>(DEFAULT_TOOL_VISIBILITY);

  useEffect(() => {
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

    const handleSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.toolVisibility) {
        setVisibility({ ...DEFAULT_TOOL_VISIBILITY, ...customEvent.detail.toolVisibility });
      }
    };

    window.addEventListener('chartingToolSettingsUpdated', handleSettingsUpdate);

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

// Summary data types
interface InjectionPointForSummary {
  id: string;
  productId: string;
  units: number;
}

interface ProductForSummary {
  id: string;
  name: string;
  pricePerUnit: number;
  type: 'toxin' | 'filler' | 'other';
  unitLabel: string;
  color?: string;
}

interface ProductSummary {
  productId: string;
  name: string;
  shortName: string;
  totalUnits: number;
  totalCost: number;
  unitLabel: string;
  pointCount: number;
  color?: string;
}

// Product abbreviations
const PRODUCT_ABBREVIATIONS: Record<string, string> = {
  'Botox': 'BTX',
  'Dysport': 'DYS',
  'Xeomin': 'XEO',
  'Jeuveau': 'JEU',
  'Juvederm': 'JUV',
  'Restylane': 'RST',
  'Sculptra': 'SCP',
  'Radiesse': 'RAD',
  'Belotero': 'BEL',
  'Versa': 'VRS',
  'RHA': 'RHA',
  'Kybella': 'KYB',
};

// =============================================================================
// PROPS INTERFACE
// =============================================================================
interface RightDockProps {
  // Tool palette props
  activeTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;

  // Product picker props
  mode?: ToolSettingsMode;
  products?: Product[];
  selectedProduct?: Product | null;
  onProductChange?: (product: Product) => void;
  dosage?: number;
  onDosageChange?: (dosage: number) => void;
  quickDosages?: number[];

  // Brush mode props
  treatmentTypes?: TreatmentTypeOption[];
  selectedTreatmentType?: TreatmentTypeOption | null;
  onTreatmentTypeChange?: (type: TreatmentTypeOption) => void;
  brushOpacity?: number;
  onBrushOpacityChange?: (opacity: number) => void;
  brushSize?: 'small' | 'medium' | 'large';
  onBrushSizeChange?: (size: 'small' | 'medium' | 'large') => void;
  onBrushUndo?: () => void;
  onBrushClearAll?: () => void;
  canBrushUndo?: boolean;

  // Sketch mode props (umbrella for Veins and Cannula sub-modes)
  sketchMode?: SketchMode;
  onSketchModeChange?: (mode: SketchMode) => void;

  // Sketch > Veins sub-mode props
  sketchType?: 'spider' | 'reticular';
  onSketchTypeChange?: (type: 'spider' | 'reticular') => void;
  onSketchUndo?: () => void;
  onSketchClearAll?: () => void;
  canSketchUndo?: boolean;
  isSketchDrawing?: boolean;

  // Sketch > Cannula sub-mode props
  cannulaType?: 'linear' | 'fanning';
  onCannulaTypeChange?: (type: 'linear' | 'fanning') => void;
  cannulaColor?: string;
  onCannulaColorChange?: (color: string) => void;
  onCannulaUndo?: () => void;
  onCannulaClearAll?: () => void;
  canCannulaUndo?: boolean;

  // Shape mode props
  shapeType?: 'circle' | 'rectangle' | 'ellipse' | 'line' | 'arrow';
  onShapeTypeChange?: (type: 'circle' | 'rectangle' | 'ellipse' | 'line' | 'arrow') => void;
  shapeColor?: string;
  onShapeColorChange?: (color: string) => void;
  shapeFilled?: boolean;
  onShapeFilledChange?: (filled: boolean) => void;
  onShapeUndo?: () => void;
  onShapeClearAll?: () => void;
  canShapeUndo?: boolean;

  // Simple text mode props (Labels tool)
  simpleTextSelectedPreset?: TextPreset | null;
  onSimpleTextPresetChange?: (preset: TextPreset | null) => void;
  simpleTextLabels?: SimpleTextLabel[];
  onSimpleTextUndo?: () => void;
  onSimpleTextClearAll?: () => void;
  canSimpleTextUndo?: boolean;

  // Measure mode props
  measurements?: Array<{ id: string; length: number; label?: string }>;
  onMeasurementClearAll?: () => void;

  // Summary props
  injectionPoints?: InjectionPointForSummary[];
  productsForSummary?: ProductForSummary[];

  // Visibility
  isVisible?: boolean;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export function RightDock({
  // Tool palette
  activeTool,
  onToolChange,
  // Product picker
  mode = 'injection',
  products = [],
  selectedProduct,
  onProductChange,
  dosage = 0,
  onDosageChange,
  quickDosages = [5, 10, 15, 20, 25],
  // Brush mode
  treatmentTypes = [],
  selectedTreatmentType,
  onTreatmentTypeChange,
  brushOpacity = 0.2,
  onBrushOpacityChange,
  brushSize = 'medium',
  onBrushSizeChange,
  onBrushUndo,
  onBrushClearAll,
  canBrushUndo = false,
  // Sketch mode (umbrella for Veins and Cannula)
  sketchMode = 'veins',
  onSketchModeChange,
  // Sketch > Veins sub-mode
  sketchType = 'spider',
  onSketchTypeChange,
  onSketchUndo,
  onSketchClearAll,
  canSketchUndo = false,
  isSketchDrawing = false,
  // Sketch > Cannula sub-mode
  cannulaType = 'linear',
  onCannulaTypeChange,
  cannulaColor = '#10B981',
  onCannulaColorChange,
  onCannulaUndo,
  onCannulaClearAll,
  canCannulaUndo = false,
  // Shape mode
  shapeType = 'circle',
  onShapeTypeChange,
  shapeColor = '#3B82F6',
  onShapeColorChange,
  shapeFilled = false,
  onShapeFilledChange,
  onShapeUndo,
  onShapeClearAll,
  canShapeUndo = false,
  // Simple text mode (Labels tool)
  simpleTextSelectedPreset,
  onSimpleTextPresetChange,
  simpleTextLabels = [],
  onSimpleTextUndo,
  onSimpleTextClearAll,
  canSimpleTextUndo = false,
  // Measure mode
  measurements = [],
  onMeasurementClearAll,
  // Summary
  injectionPoints = [],
  productsForSummary = [],
  // Visibility
  isVisible = true,
}: RightDockProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProductList, setShowProductList] = useState(false);
  const [showTreatmentList, setShowTreatmentList] = useState(false);
  const [customDosage, setCustomDosage] = useState('');
  const [isCustomActive, setIsCustomActive] = useState(false);

  const toolVisibility = useToolVisibility();
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  // Check if current dosage matches any quick dosage button
  const isQuickDosageSelected = quickDosages.includes(dosage);

  // Update custom dosage display
  useEffect(() => {
    if (!isQuickDosageSelected && dosage > 0) {
      setCustomDosage(dosage.toString());
      setIsCustomActive(true);
    } else {
      setIsCustomActive(false);
    }
  }, [dosage, isQuickDosageSelected]);

  // Define all available tools
  // Note: 'sketch' is now an umbrella tool containing Veins and Cannula sub-modes
  const allTools: { id: DrawingTool; Icon: React.ComponentType<{ size?: number }>; label: string; visibilityKey?: keyof ToolVisibilitySettings; isBasic?: boolean }[] = [
    { id: 'select', Icon: MousePointer, label: 'Select', isBasic: true },
    { id: 'zone', Icon: Grid3X3, label: 'Zone', isBasic: true },
    { id: 'freehand', Icon: Pencil, label: 'Draw', isBasic: true },
    { id: 'brush', Icon: Paintbrush, label: 'Brush', visibilityKey: 'brushTool' },
    { id: 'simpleText', Icon: Type, label: 'Labels', visibilityKey: 'textLabels' },
    // Arrow tool removed - arrow functionality available in Shape tool
    { id: 'shape', Icon: Shapes, label: 'Shape', visibilityKey: 'shapeTool' },
    { id: 'measure', Icon: Ruler, label: 'Measure', visibilityKey: 'measurementTool' },
    // Sketch tool: umbrella for Veins (sclerotherapy) and Cannula paths
    { id: 'sketch', Icon: PenLine, label: 'Sketch', visibilityKey: 'veinDrawingTool' },
    { id: 'danger', Icon: AlertTriangle, label: 'Anatomy', visibilityKey: 'dangerZoneOverlay' },
  ];

  // Filter tools based on visibility settings
  const visibleTools = useMemo(() => {
    return allTools.filter(tool => {
      if (tool.isBasic) return true;
      if (tool.visibilityKey) {
        return toolVisibility[tool.visibilityKey];
      }
      return true;
    });
  }, [toolVisibility]);

  // Compact mode settings
  const isCompact = toolVisibility.compactMode;
  const buttonSize = isCompact ? 40 : 48;
  const iconSize = isCompact ? 18 : 22;

  // Calculate product summaries
  const productSummaries: ProductSummary[] = useMemo(() => {
    const summaryMap = new Map<string, ProductSummary>();

    injectionPoints.forEach((point) => {
      const product = productsForSummary.find((p) => p.id === point.productId);
      if (!product) return;

      const existing = summaryMap.get(point.productId);
      if (existing) {
        existing.totalUnits += point.units;
        existing.totalCost += point.units * product.pricePerUnit;
        existing.pointCount += 1;
      } else {
        const shortName = Object.entries(PRODUCT_ABBREVIATIONS).find(
          ([key]) => product.name.toLowerCase().includes(key.toLowerCase())
        )?.[1] || product.name.substring(0, 3).toUpperCase();

        summaryMap.set(point.productId, {
          productId: point.productId,
          name: product.name,
          shortName,
          totalUnits: point.units,
          totalCost: point.units * product.pricePerUnit,
          unitLabel: product.unitLabel,
          pointCount: 1,
          color: product.color,
        });
      }
    });

    return Array.from(summaryMap.values());
  }, [injectionPoints, productsForSummary]);

  const grandTotal = productSummaries.reduce((sum, p) => sum + p.totalCost, 0);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${Math.round(amount)}`;
  };

  // Handlers
  const handleQuickDosage = (value: number) => {
    onDosageChange?.(value);
    setCustomDosage('');
    setIsCustomActive(false);
  };

  const handleCustomDosageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomDosage(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      onDosageChange?.(numValue);
      setIsCustomActive(true);
    }
  };

  const handleProductSelect = (product: Product) => {
    onProductChange?.(product);
    setShowProductList(false);
    if (product.defaultDosage) {
      onDosageChange?.(product.defaultDosage);
    }
  };

  const handleTreatmentSelect = (type: TreatmentTypeOption) => {
    onTreatmentTypeChange?.(type);
    setShowTreatmentList(false);
    if (onBrushOpacityChange) {
      onBrushOpacityChange(type.defaultOpacity);
    }
  };

  const brushSizes: Array<{ id: 'small' | 'medium' | 'large'; label: string }> = [
    { id: 'small', label: 'S' },
    { id: 'medium', label: 'M' },
    { id: 'large', label: 'L' },
  ];

  if (!isVisible) return null;

  return (
    <>
      {/* Collapse Toggle Button - Fixed position, separate from dock */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`
          fixed z-[1101] top-1/2
          w-6 h-16 rounded-l-lg
          flex items-center justify-center
          transition-colors duration-200
          ${isDark
            ? 'bg-gray-800/95 hover:bg-gray-700 border-gray-700 text-gray-400 hover:text-gray-200'
            : 'bg-white/95 hover:bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-700'
          }
          border border-r-0
          shadow-lg
        `}
        style={{
          transform: 'translateY(-50%)',
          right: isCollapsed ? '48px' : '256px',
          transition: 'right 300ms ease-in-out, background-color 200ms, color 200ms',
        }}
        aria-label={isCollapsed ? 'Expand dock' : 'Collapse dock'}
      >
        {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Main Dock Container */}
      <div
        className={`
          fixed top-14 right-0 bottom-0 z-[1100]
          flex flex-col
          transition-[width] duration-300 ease-in-out
          ${isCollapsed ? 'w-12' : 'w-64'}
          ${isDark
            ? 'bg-gray-800/95 backdrop-blur-md border-l border-gray-700'
            : 'bg-white/95 backdrop-blur-md border-l border-gray-200 shadow-lg'
          }
          overflow-hidden
        `}
      >
        {isCollapsed ? (
          // Collapsed View - Just tool icons in a vertical strip
          <div className="flex flex-col items-center py-2 gap-1">
            {visibleTools.slice(0, 6).map((tool) => {
              const ToolIcon = tool.Icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => onToolChange(tool.id)}
                  className={`
                    w-10 h-10 flex items-center justify-center rounded-lg
                    transition-all duration-150
                    ${activeTool === tool.id
                      ? 'bg-purple-600 text-white'
                      : isDark
                        ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }
                  `}
                  title={tool.label}
                >
                  <ToolIcon size={20} />
                </button>
              );
            })}
          </div>
        ) : (
          // Expanded View - Full dock content
          <div className="flex flex-col h-full overflow-y-auto">
            {/* ============================================================ */}
            {/* SECTION 1: TOOLS PALETTE */}
            {/* ============================================================ */}
            <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Tools
              </h3>
              <div className="grid grid-cols-4 gap-1.5">
                {visibleTools.map((tool) => {
                  const ToolIcon = tool.Icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => onToolChange(tool.id)}
                      aria-label={tool.label}
                      aria-pressed={activeTool === tool.id}
                      style={{ width: buttonSize, height: buttonSize }}
                      className={`
                        flex flex-col items-center justify-center rounded-lg
                        transition-all duration-150 gap-0.5
                        ${activeTool === tool.id
                          ? 'bg-purple-600 text-white shadow-md'
                          : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                        active:scale-95
                      `}
                    >
                      <ToolIcon size={iconSize} />
                      <span className="text-[9px] font-medium leading-none">{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ============================================================ */}
            {/* SECTION 2: PRODUCT & DOSAGE PICKER */}
            {/* ============================================================ */}
            <div className={`p-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex-shrink-0`}>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {mode === 'brush' ? 'Treatment' :
                 mode === 'sketch' ? 'Sketch Tool' :
                 mode === 'shape' ? 'Shape Tool' :
                 mode === 'simpleText' ? 'Quick Labels' :
                 mode === 'measure' ? 'Measurements' :
                 'Product & Dosage'}
              </h3>

              {mode === 'sketch' ? (
                // SKETCH MODE CONTENT - Umbrella for Veins and Cannula sub-modes
                <>
                  {/* Sub-mode selector: Veins vs Cannula */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={() => onSketchModeChange?.('veins')}
                      className={`
                        flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg text-sm
                        transition-all duration-150
                        ${sketchMode === 'veins'
                          ? 'bg-purple-600 text-white shadow-md'
                          : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      <PenLine className="w-4 h-4" />
                      <span className="font-medium text-xs">Veins</span>
                    </button>
                    <button
                      onClick={() => onSketchModeChange?.('cannula')}
                      className={`
                        flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg text-sm
                        transition-all duration-150
                        ${sketchMode === 'cannula'
                          ? 'bg-purple-600 text-white shadow-md'
                          : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      <GitBranch className="w-4 h-4" />
                      <span className="font-medium text-xs">Cannula</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className={`border-t mb-3 ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />

                  {/* Conditional content based on sketchMode */}
                  {sketchMode === 'veins' ? (
                    // VEINS SUB-MODE CONTENT
                    <>
                      {/* Drawing indicator */}
                      {isSketchDrawing && (
                        <div
                          className={`flex items-center gap-2 p-2 rounded-lg mb-3 ${
                            isDark
                              ? 'bg-blue-900/30 text-blue-400'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-sm font-medium">Drawing...</span>
                        </div>
                      )}

                      {/* Vein Type Selector */}
                      <div className="mb-3">
                        <label className={`text-xs font-medium uppercase tracking-wide block mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Vein Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['spider', 'reticular'] as const).map((type) => {
                            const isSelected = sketchType === type;
                            const config = type === 'spider'
                              ? { name: 'Spider', color: '#DC2626', strokeWidth: 1.5 }
                              : { name: 'Reticular', color: '#2563EB', strokeWidth: 2.5 };
                            return (
                              <button
                                key={type}
                                onClick={() => onSketchTypeChange?.(type)}
                                className={`
                                  flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg text-sm
                                  transition-colors
                                  ${isSelected
                                    ? isDark
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-blue-100 text-blue-800 ring-1 ring-blue-300'
                                    : isDark
                                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }
                                `}
                              >
                                <svg width="36" height="8" className="flex-shrink-0">
                                  <line
                                    x1="2"
                                    y1="4"
                                    x2="34"
                                    y2="4"
                                    stroke={config.color}
                                    strokeWidth={config.strokeWidth}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <span className="font-medium text-xs">{config.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quick tip */}
                      <p className={`text-xs mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Draw to trace veins, click to select
                      </p>

                      {/* Undo / Clear for Veins */}
                      <div className="flex gap-2">
                        <button
                          onClick={onSketchUndo}
                          disabled={!canSketchUndo}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                            canSketchUndo
                              ? isDark
                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : isDark
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Undo2 className="w-4 h-4" />
                          Undo
                        </button>
                        <button
                          onClick={onSketchClearAll}
                          disabled={!canSketchUndo}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                            canSketchUndo
                              ? isDark
                                ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                              : isDark
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                          Clear
                        </button>
                      </div>
                    </>
                  ) : (
                    // CANNULA SUB-MODE CONTENT
                    <>
                      {/* Cannula Type Selector */}
                      <div className="mb-3">
                        <label className={`text-xs font-medium uppercase tracking-wide block mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Path Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['linear', 'fanning'] as const).map((type) => {
                            const isSelected = cannulaType === type;
                            return (
                              <button
                                key={type}
                                onClick={() => onCannulaTypeChange?.(type)}
                                className={`
                                  flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg text-sm
                                  transition-colors
                                  ${isSelected
                                    ? isDark
                                      ? 'bg-green-600 text-white'
                                      : 'bg-green-100 text-green-800 ring-1 ring-green-300'
                                    : isDark
                                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }
                                `}
                              >
                                <svg width="36" height="16" className="flex-shrink-0">
                                  {type === 'linear' ? (
                                    <line
                                      x1="4"
                                      y1="8"
                                      x2="32"
                                      y2="8"
                                      stroke={cannulaColor}
                                      strokeWidth={2}
                                      strokeLinecap="round"
                                    />
                                  ) : (
                                    <>
                                      <line x1="4" y1="8" x2="32" y2="2" stroke={cannulaColor} strokeWidth={1.5} strokeLinecap="round" />
                                      <line x1="4" y1="8" x2="32" y2="8" stroke={cannulaColor} strokeWidth={1.5} strokeLinecap="round" />
                                      <line x1="4" y1="8" x2="32" y2="14" stroke={cannulaColor} strokeWidth={1.5} strokeLinecap="round" />
                                    </>
                                  )}
                                </svg>
                                <span className="font-medium text-xs capitalize">{type}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Cannula Color Picker */}
                      <div className="mb-3">
                        <label className={`text-xs font-medium uppercase tracking-wide block mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Color
                        </label>
                        <div className="grid grid-cols-6 gap-1.5">
                          {['#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899'].map((color) => (
                            <button
                              key={color}
                              onClick={() => onCannulaColorChange?.(color)}
                              className={`w-8 h-8 rounded-lg transition-all ${
                                cannulaColor === color ? 'ring-2 ring-offset-2 ring-purple-500 scale-110' : 'hover:scale-105'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Quick tip */}
                      <p className={`text-xs mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Click entry point, drag to end
                      </p>

                      {/* Undo / Clear for Cannula */}
                      <div className="flex gap-2">
                        <button
                          onClick={onCannulaUndo}
                          disabled={!canCannulaUndo}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                            canCannulaUndo
                              ? isDark
                                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : isDark
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Undo2 className="w-4 h-4" />
                          Undo
                        </button>
                        <button
                          onClick={onCannulaClearAll}
                          disabled={!canCannulaUndo}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                            canCannulaUndo
                              ? isDark
                                ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                              : isDark
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                          Clear
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : mode === 'brush' ? (
                // BRUSH MODE CONTENT
                <>
                  {/* Treatment Type Selector */}
                  <div className="relative mb-3">
                    <button
                      onClick={() => setShowTreatmentList(!showTreatmentList)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 hover:border-purple-500'
                          : 'border-gray-300 bg-white hover:border-purple-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {selectedTreatmentType ? (
                          <>
                            <span
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: selectedTreatmentType.color, opacity: brushOpacity + 0.3 }}
                            />
                            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {selectedTreatmentType.name}
                            </span>
                          </>
                        ) : (
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Select treatment...</span>
                        )}
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform ${showTreatmentList ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showTreatmentList && treatmentTypes.length > 0 && (
                      <div className={`absolute z-50 top-full left-0 right-0 mt-1 rounded-lg shadow-lg border max-h-48 overflow-y-auto ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                      }`}>
                        {treatmentTypes.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => handleTreatmentSelect(type)}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 transition-colors text-left ${
                              selectedTreatmentType?.id === type.id
                                ? isDark ? 'bg-purple-900/40' : 'bg-purple-50'
                                : isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: type.color }}
                            />
                            <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{type.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Brush Size */}
                  <div className="mb-3">
                    <label className={`text-xs font-medium uppercase tracking-wide block mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Size
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {brushSizes.map((size) => (
                        <button
                          key={size.id}
                          onClick={() => onBrushSizeChange?.(size.id)}
                          className={`py-2 text-sm font-medium rounded-md transition-all ${
                            brushSize === size.id
                              ? 'bg-purple-600 text-white shadow-md'
                              : isDark
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Opacity Slider */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Opacity
                      </label>
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {Math.round(brushOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      value={brushOpacity * 100}
                      onChange={(e) => onBrushOpacityChange?.(parseInt(e.target.value) / 100)}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>

                  {/* Undo / Clear */}
                  <div className="flex gap-2">
                    <button
                      onClick={onBrushUndo}
                      disabled={!canBrushUndo}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                        canBrushUndo
                          ? isDark
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : isDark
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Undo2 className="w-4 h-4" />
                      Undo
                    </button>
                    <button
                      onClick={onBrushClearAll}
                      disabled={!canBrushUndo}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                        canBrushUndo
                          ? isDark
                            ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                          : isDark
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear
                    </button>
                  </div>
                </>
              ) : mode === 'shape' ? (
                // SHAPE MODE CONTENT
                <>
                  {/* Shape Type Selector */}
                  <div className="mb-3">
                    <label className={`text-xs font-medium uppercase tracking-wide block mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Shape
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {(['circle', 'rectangle', 'ellipse', 'line', 'arrow'] as const).map((type) => {
                        const isSelected = shapeType === type;
                        return (
                          <button
                            key={type}
                            onClick={() => onShapeTypeChange?.(type)}
                            className={`
                              flex flex-col items-center gap-1 px-1.5 py-2 rounded-lg text-xs
                              transition-colors
                              ${
                                isSelected
                                  ? isDark
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-100 text-blue-800 ring-1 ring-blue-300'
                                  : isDark
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }
                            `}
                          >
                            {/* Shape preview */}
                            <svg width="24" height="16" className="flex-shrink-0">
                              {type === 'circle' && (
                                <circle cx="12" cy="8" r="6" stroke={shapeColor} strokeWidth={1.5} fill={shapeFilled ? shapeColor : 'none'} fillOpacity={0.3} />
                              )}
                              {type === 'rectangle' && (
                                <rect x="3" y="2" width="18" height="12" stroke={shapeColor} strokeWidth={1.5} fill={shapeFilled ? shapeColor : 'none'} fillOpacity={0.3} rx="1" />
                              )}
                              {type === 'ellipse' && (
                                <ellipse cx="12" cy="8" rx="10" ry="5" stroke={shapeColor} strokeWidth={1.5} fill={shapeFilled ? shapeColor : 'none'} fillOpacity={0.3} />
                              )}
                              {type === 'line' && (
                                <line x1="2" y1="14" x2="22" y2="2" stroke={shapeColor} strokeWidth={2} strokeLinecap="round" />
                              )}
                              {type === 'arrow' && (
                                <>
                                  <line x1="2" y1="10" x2="18" y2="10" stroke={shapeColor} strokeWidth={2} strokeLinecap="round" />
                                  <polyline points="14,6 18,10 14,14" stroke={shapeColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                </>
                              )}
                            </svg>
                            <span className="font-medium capitalize">{type === 'rectangle' ? 'Rect' : type}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Shape Color Picker */}
                  <div className="mb-3">
                    <label className={`text-xs font-medium uppercase tracking-wide block mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Color
                    </label>
                    <div className="grid grid-cols-6 gap-1.5">
                      {['#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B', '#EC4899'].map((color) => (
                        <button
                          key={color}
                          onClick={() => onShapeColorChange?.(color)}
                          className={`w-8 h-8 rounded-lg transition-all ${
                            shapeColor === color ? 'ring-2 ring-offset-2 ring-purple-500 scale-110' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Fill Toggle - iOS-style switch */}
                  <div className="mb-3">
                    <button
                      onClick={() => onShapeFilledChange?.(!shapeFilled)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        isDark
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Fill Shape</span>
                      <div
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                          shapeFilled
                            ? 'bg-purple-600'
                            : isDark ? 'bg-gray-600' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out"
                          style={{
                            transform: shapeFilled ? 'translateX(22px)' : 'translateX(2px)',
                          }}
                        />
                      </div>
                    </button>
                  </div>

                  {/* Undo / Clear */}
                  <div className="flex gap-2">
                    <button
                      onClick={onShapeUndo}
                      disabled={!canShapeUndo}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                        canShapeUndo
                          ? isDark
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : isDark
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Undo2 className="w-4 h-4" />
                      Undo
                    </button>
                    <button
                      onClick={onShapeClearAll}
                      disabled={!canShapeUndo}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                        canShapeUndo
                          ? isDark
                            ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                          : isDark
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear
                    </button>
                  </div>
                </>
              ) : mode === 'simpleText' ? (
                // SIMPLE TEXT MODE CONTENT - Uses SimpleTextSettingsPanel component
                <>
                  <SimpleTextSettingsPanel
                    selectedPreset={simpleTextSelectedPreset ?? null}
                    onPresetSelect={onSimpleTextPresetChange ?? (() => {})}
                    onClearAll={onSimpleTextClearAll ?? (() => {})}
                    labelCount={simpleTextLabels.length}
                    isDark={isDark}
                  />

                  {/* Undo/Clear buttons */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={onSimpleTextUndo}
                      disabled={!canSimpleTextUndo}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-all ${
                        canSimpleTextUndo
                          ? isDark
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          : isDark
                            ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Undo2 className="w-4 h-4" />
                      Undo
                    </button>
                  </div>
                </>
              ) : mode === 'measure' ? (
                // MEASURE MODE CONTENT - Measurements shown in Left Dock
                <div className={`text-center py-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Ruler className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p className="text-sm font-medium mb-1">Measurement Tool Active</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Click two points on the chart to measure distance.
                  </p>
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    View measurements in the left panel.
                  </p>
                </div>
              ) : (
                // INJECTION MODE CONTENT
                <>
                  {/* Product Selector */}
                  <div className="relative mb-3">
                    <button
                      onClick={() => setShowProductList(!showProductList)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border transition-colors ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 hover:border-purple-500'
                          : 'border-gray-300 bg-white hover:border-purple-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {selectedProduct ? (
                          <>
                            <span
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: selectedProduct.color }}
                            />
                            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {selectedProduct.name}
                            </span>
                          </>
                        ) : (
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Select product...</span>
                        )}
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform ${showProductList ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {showProductList && (
                      <div className={`absolute z-50 top-full left-0 right-0 mt-1 rounded-lg shadow-lg border max-h-48 overflow-y-auto ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                      }`}>
                        {products.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleProductSelect(product)}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 transition-colors text-left ${
                              selectedProduct?.id === product.id
                                ? isDark ? 'bg-purple-900/40' : 'bg-purple-50'
                                : isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: product.color }}
                            />
                            <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{product.name}</span>
                            {selectedProduct?.id === product.id && (
                              <Check className={`w-4 h-4 ml-auto ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Dosage Buttons */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Quick Dosage
                      </label>
                      {isQuickDosageSelected && (
                        <span className="flex items-center gap-1 text-xs text-green-500">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {quickDosages.map((value) => (
                        <button
                          key={value}
                          onClick={() => handleQuickDosage(value)}
                          className={`py-2 text-sm font-medium rounded-md transition-all ${
                            dosage === value
                              ? 'bg-purple-600 text-white shadow-md scale-105'
                              : isDark
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Dosage */}
                  <div>
                    <label className={`text-xs font-medium uppercase tracking-wide block mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Custom
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={customDosage}
                        onChange={handleCustomDosageChange}
                        placeholder="Enter..."
                        min="0.1"
                        step="0.5"
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          isDark
                            ? `bg-gray-700 text-white placeholder-gray-500 ${isCustomActive ? 'border-purple-500' : 'border-gray-600'}`
                            : `bg-white text-gray-900 placeholder-gray-400 ${isCustomActive ? 'border-purple-500' : 'border-gray-300'}`
                        }`}
                      />
                      <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        units
                      </span>
                    </div>
                  </div>

                  {/* Current Selection Summary */}
                  {selectedProduct && (
                    <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className={`flex items-center gap-3 rounded-lg px-3 py-2 ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <span
                          className="w-5 h-5 rounded-full flex-shrink-0 shadow-md"
                          style={{ backgroundColor: selectedProduct.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedProduct.name}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-purple-600 rounded-md px-2 py-1">
                          <span className="text-lg font-bold text-white">{dosage}</span>
                          <span className="text-xs text-purple-200">u</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ============================================================ */}
            {/* SECTION 3: TREATMENT SUMMARY */}
            {/* ============================================================ */}
            <div className={`p-3 mt-auto ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
              <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Treatment Summary
              </h3>

              {productSummaries.length > 0 ? (
                <div className="space-y-2">
                  {productSummaries.map((summary) => (
                    <div
                      key={summary.productId}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: summary.color || '#7C3AED' }}
                        />
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          {summary.shortName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {summary.totalUnits}{summary.unitLabel}
                        </span>
                        <span className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          {formatCurrency(summary.totalCost)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Grand Total */}
                  <div className={`flex items-center justify-between px-2 py-2 mt-2 rounded-lg border-2 ${
                    isDark ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'
                  }`}>
                    <span className={`text-sm font-semibold ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                      Total
                    </span>
                    <span className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className={`text-center py-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  No injection points yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default RightDock;
