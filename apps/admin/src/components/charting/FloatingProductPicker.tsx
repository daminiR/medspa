'use client';

import React, { useState } from 'react';
import { Check, Undo2, Trash2 } from 'lucide-react';
import { DraggablePanel } from './DraggablePanel';
import { useChartingTheme } from '@/contexts/ChartingThemeContext';

export interface Product {
  id: string;
  name: string;
  color: string;
  abbreviation?: string;
  defaultDosage?: number;
  /** Product type - determines if dosage is in units (neurotoxin) or mL (filler) */
  type?: 'neurotoxin' | 'filler' | 'biostimulator' | 'skin-booster';
}

// Brush treatment type configuration
export interface TreatmentTypeOption {
  id: string;
  name: string;
  color: string;
  defaultOpacity: number;
}

// Mode type for the panel
export type ToolSettingsMode = 'injection' | 'brush';

interface FloatingProductPickerProps {
  // Mode - determines what content to show
  mode?: ToolSettingsMode;

  // Injection mode props
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
  canUndo?: boolean;

  // Common props
  isVisible?: boolean;
  onClose?: () => void;
  defaultPosition?: { x: number; y: number };
  defaultCollapsed?: boolean;
}

export function FloatingProductPicker({
  mode = 'injection',
  // Injection props
  products = [],
  selectedProduct,
  onProductChange,
  dosage = 0,
  onDosageChange,
  quickDosages = [5, 10, 15, 20, 25],
  // Brush props
  treatmentTypes = [],
  selectedTreatmentType,
  onTreatmentTypeChange,
  brushOpacity = 0.2,
  onBrushOpacityChange,
  brushSize = 'medium',
  onBrushSizeChange,
  onBrushUndo,
  onBrushClearAll,
  canUndo = false,
  // Common props
  isVisible = true,
  onClose,
  defaultPosition,
  defaultCollapsed = false,
}: FloatingProductPickerProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [showProductList, setShowProductList] = useState(false);
  const [showTreatmentList, setShowTreatmentList] = useState(false);
  const [customDosage, setCustomDosage] = useState('');
  const [isCustomActive, setIsCustomActive] = useState(false);

  // Check if current dosage matches any quick dosage button
  const isQuickDosageSelected = quickDosages.includes(dosage);

  // Update custom dosage display when dosage changes from external source
  React.useEffect(() => {
    if (!isQuickDosageSelected && dosage > 0) {
      setCustomDosage(dosage.toString());
      setIsCustomActive(true);
    } else {
      setIsCustomActive(false);
    }
  }, [dosage, isQuickDosageSelected]);

  // Use fixed initial position for SSR to avoid hydration mismatch
  const [initialPosition, setInitialPosition] = useState(defaultPosition || { x: 800, y: 168 });

  // Adjust position based on window size after mount (client-side only)
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !defaultPosition) {
      setInitialPosition({ x: window.innerWidth - 280, y: 168 });
    }
  }, [defaultPosition]);

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

  const handleCustomDosageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleProductSelect = (product: Product) => {
    onProductChange?.(product);
    setShowProductList(false);
    if (product.defaultDosage) {
      onDosageChange?.(product.defaultDosage);
    }
  };

  // Get theme from context (safely returns default if outside provider)
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  if (!isVisible) return null;

  // Panel title is always "Product & Dosage" - content changes based on tool mode
  const panelTitle = 'Product & Dosage';

  // Handle treatment type selection
  const handleTreatmentSelect = (type: TreatmentTypeOption) => {
    onTreatmentTypeChange?.(type);
    setShowTreatmentList(false);
    if (onBrushOpacityChange) {
      onBrushOpacityChange(type.defaultOpacity);
    }
  };

  // Brush size presets
  const brushSizes: Array<{ id: 'small' | 'medium' | 'large'; label: string }> = [
    { id: 'small', label: 'S' },
    { id: 'medium', label: 'M' },
    { id: 'large', label: 'L' },
  ];

  return (
    <DraggablePanel
      panelId="floating-product-picker"
      initialPosition={initialPosition}
      title={panelTitle}
      variant="auto"
      className="w-56"
      onCollapse={() => {
        setIsCollapsed(!isCollapsed);
        setShowProductList(false);
        setShowTreatmentList(false);
      }}
      isCollapsed={isCollapsed}
    >
      <div className="space-y-3" style={{ pointerEvents: 'auto' }}>
        {/* ============ BRUSH MODE CONTENT ============ */}
        {mode === 'brush' && (
          <>
            {/* Treatment Type Selector */}
            <div className="relative">
              <button
                onClick={() => setShowTreatmentList(!showTreatmentList)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border transition-colors ${
                  isDark
                    ? 'border-gray-600 bg-gray-700 hover:border-purple-500 hover:bg-gray-600'
                    : 'border-gray-300 bg-white hover:border-purple-500 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedTreatmentType ? (
                    <>
                      <span
                        className={`w-4 h-4 rounded-full flex-shrink-0 ring-2 shadow-sm ${isDark ? 'ring-gray-800' : 'ring-gray-200'}`}
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
                  className={`w-4 h-4 transition-transform duration-200 ${showTreatmentList ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Treatment Type Dropdown */}
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
                        className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ring-1 ${isDark ? 'ring-gray-500' : 'ring-gray-300'}`}
                        style={{ backgroundColor: type.color }}
                      />
                      <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{type.name}</span>
                      {selectedTreatmentType?.id === type.id && (
                        <svg className={`w-4 h-4 ml-auto ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Brush Size - Presets + Visual Indicator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Brush Size
                </label>
                {/* Visual size indicator */}
                <div className="flex items-center gap-2">
                  <div
                    className="rounded-full"
                    style={{
                      width: brushSize === 'small' ? 8 : brushSize === 'medium' ? 16 : 28,
                      height: brushSize === 'small' ? 8 : brushSize === 'medium' ? 16 : 28,
                      backgroundColor: selectedTreatmentType?.color || '#7C3AED',
                      opacity: brushOpacity + 0.3,
                    }}
                  />
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {brushSize === 'small' ? '8px' : brushSize === 'medium' ? '16px' : '28px'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {brushSizes.map((size) => {
                  const isSelected = brushSize === size.id;
                  return (
                    <button
                      key={size.id}
                      onClick={() => onBrushSizeChange?.(size.id)}
                      className={`py-2 text-sm font-medium rounded-md transition-all duration-150 ${
                        isSelected
                          ? `bg-purple-600 text-white shadow-md ring-2 ring-purple-400 ring-offset-1 ${isDark ? 'ring-offset-gray-800' : 'ring-offset-white'}`
                          : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {size.label}
                    </button>
                  );
                })}
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {brushSize === 'small' ? 'Fine detail work' : brushSize === 'medium' ? 'Standard coverage' : 'Large area coverage'}
              </p>
            </div>

            {/* Opacity Slider */}
            <div>
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
                style={{
                  background: isDark
                    ? `linear-gradient(to right, #7C3AED 0%, #7C3AED ${((brushOpacity * 100 - 5) / 45) * 100}%, #374151 ${((brushOpacity * 100 - 5) / 45) * 100}%, #374151 100%)`
                    : `linear-gradient(to right, #7C3AED 0%, #7C3AED ${((brushOpacity * 100 - 5) / 45) * 100}%, #E5E7EB ${((brushOpacity * 100 - 5) / 45) * 100}%, #E5E7EB 100%)`,
                }}
              />
            </div>

            {/* Undo / Clear Actions */}
            <div className={`pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex gap-2">
                <button
                  onClick={onBrushUndo}
                  disabled={!canUndo}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                    canUndo
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
                  disabled={!canUndo}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                    canUndo
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
            </div>

            {/* Current Brush Summary */}
            {selectedTreatmentType && (
              <div className={`pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Brush Will Paint</span>
                </div>
                <div className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <span
                    className={`w-6 h-6 rounded-full ring-2 shadow-lg flex-shrink-0 ${isDark ? 'ring-gray-600' : 'ring-gray-300'}`}
                    style={{ backgroundColor: selectedTreatmentType.color, opacity: brushOpacity + 0.3 }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedTreatmentType.name}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {Math.round(brushOpacity * 100)}% opacity
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============ INJECTION MODE CONTENT ============ */}
        {mode === 'injection' && (
          <>
        {/* Current Product Display */}
        <div className="relative">
          <button
            onClick={() => setShowProductList(!showProductList)}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border transition-colors ${
              isDark
                ? 'border-gray-600 bg-gray-700 hover:border-purple-500 hover:bg-gray-600'
                : 'border-gray-300 bg-white hover:border-purple-500 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              {selectedProduct ? (
                <>
                  <span
                    className={`w-4 h-4 rounded-full flex-shrink-0 ring-2 shadow-sm ${isDark ? 'ring-gray-800' : 'ring-gray-200'}`}
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
              className={`w-4 h-4 transition-transform duration-200 ${showProductList ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Product Dropdown */}
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
                    className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ring-1 ${isDark ? 'ring-gray-500' : 'ring-gray-300'}`}
                    style={{ backgroundColor: product.color }}
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{product.name}</span>
                  {selectedProduct?.id === product.id && (
                    <svg className={`w-4 h-4 ml-auto ${isDark ? 'text-purple-400' : 'text-purple-600'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Dosage Buttons */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Quick Dosage
            </label>
            {isQuickDosageSelected && (
              <span className="flex items-center gap-1 text-xs text-green-500">
                <Check className="w-3 h-3" />
                Active
              </span>
            )}
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {quickDosages.map((value) => {
              const isSelected = dosage === value;
              return (
                <button
                  key={value}
                  onClick={() => handleQuickDosage(value)}
                  className={`relative py-2 text-sm font-medium rounded-md transition-all duration-150 ${
                    isSelected
                      ? `bg-purple-600 text-white shadow-md ring-2 ring-purple-400 ring-offset-1 ${isDark ? 'ring-offset-gray-800' : 'ring-offset-white'} scale-105`
                      : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  aria-pressed={isSelected}
                  title={`Set dosage to ${value} units`}
                >
                  {value}
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 text-white" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Dosage Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={`text-xs font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Custom Dosage
            </label>
            {isCustomActive && !isQuickDosageSelected && (
              <span className="flex items-center gap-1 text-xs text-green-500">
                <Check className="w-3 h-3" />
                Active
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="number"
              value={customDosage}
              onChange={handleCustomDosageChange}
              onKeyDown={handleCustomDosageKeyDown}
              placeholder="Enter value..."
              min="0.1"
              step="0.5"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                isDark
                  ? `bg-gray-700 text-white placeholder-gray-500 ${isCustomActive && !isQuickDosageSelected ? 'border-purple-500 ring-1 ring-purple-500/50' : 'border-gray-600'}`
                  : `bg-white text-gray-900 placeholder-gray-400 ${isCustomActive && !isQuickDosageSelected ? 'border-purple-500 ring-1 ring-purple-500/50' : 'border-gray-300'}`
              }`}
            />
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
              isCustomActive && !isQuickDosageSelected ? 'text-purple-500' : isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>
              units
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Type any value and press Enter
          </p>
        </div>

        {/* Current Selection Summary - Shows active dosage prominently */}
        {selectedProduct && (
          <div className={`pt-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Next Point Will Use</span>
            </div>
            <div className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
              <span
                className={`w-4 h-4 rounded-full ring-2 shadow-lg flex-shrink-0 ${isDark ? 'ring-gray-600' : 'ring-gray-300'}`}
                style={{ backgroundColor: selectedProduct.color }}
              />
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedProduct.name}
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-purple-600 rounded-md px-2.5 py-1">
                <span className="text-lg font-bold text-white">{dosage}</span>
                <span className="text-xs text-purple-200">u</span>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </DraggablePanel>
  );
}

export default FloatingProductPicker;
