'use client';

/**
 * FloatingTextLabelPanel - Minimal floating panel for Text Label Tool
 *
 * Simplified design:
 * - 5 essential quick presets (tap and place)
 * - 4 color quick picks in a row
 * - Clear all button (when labels exist)
 * - No font size controls (auto-sizes based on zoom)
 */

import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { DraggablePanel } from './DraggablePanel';
import { useChartingTheme } from '@/contexts/ChartingThemeContext';
import { PRESET_LABELS, TEXT_COLORS } from './TextLabelTool';

// =============================================================================
// TYPES
// =============================================================================

export interface FloatingTextLabelPanelProps {
  /** Whether the panel should be visible */
  visible: boolean;
  /** Current selected color (for custom text) */
  selectedColor: string;
  /** Callback when color changes */
  onColorChange: (color: string) => void;
  /** Callback when a preset is selected - places immediately at next tap */
  onPresetSelect: (text: string, color: string) => void;
  /** Callback to clear all labels */
  onClearAll: () => void;
  /** Current number of labels */
  labelCount: number;
  /** Callback to close the panel */
  onClose?: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function FloatingTextLabelPanel({
  visible,
  selectedColor,
  onColorChange,
  onPresetSelect,
  onClearAll,
  labelCount,
  onClose,
}: FloatingTextLabelPanelProps) {
  // Get theme from context
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  // Initial position - left side of screen
  const [defaultPosition] = useState({ x: 16, y: 180 });

  if (!visible) return null;

  return (
    <DraggablePanel
      initialPosition={defaultPosition}
      panelId="floating-text-label-panel"
      title="Labels"
      variant="auto"
      minWidth={140}
    >
      <div
        className="flex flex-col gap-2"
        data-text-label-panel
        style={{ pointerEvents: 'auto' }}
      >
        {/* Quick Presets - Primary focus, single column for easy tapping */}
        <div className="flex flex-col gap-1">
          {PRESET_LABELS.map((preset) => (
            <button
              key={preset.text}
              onClick={() => onPresetSelect(preset.text, preset.color)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold
                transition-all active:scale-[0.97] border
                ${isDark
                  ? 'bg-gray-700/80 border-gray-600 hover:bg-gray-600'
                  : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm'
                }
              `}
              style={{ color: preset.color }}
            >
              {preset.isWarning && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
              {preset.text}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className={`h-px ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`} />

        {/* Color Quick Picks - For custom text */}
        <div className="flex items-center justify-between">
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Color:</span>
          <div className="flex gap-1.5">
            {TEXT_COLORS.map((colorOption) => (
              <button
                key={colorOption.id}
                onClick={() => onColorChange(colorOption.color)}
                className={`
                  w-6 h-6 rounded-full transition-all
                  ${selectedColor === colorOption.color
                    ? 'ring-2 ring-offset-1 ring-blue-400 scale-110'
                    : 'hover:scale-110 opacity-80 hover:opacity-100'
                  }
                `}
                style={{ backgroundColor: colorOption.color }}
                title={colorOption.name}
                aria-label={`Select ${colorOption.name}`}
              />
            ))}
          </div>
        </div>

        {/* Clear All - Compact, only when labels exist */}
        {labelCount > 0 && (
          <button
            onClick={onClearAll}
            className={`
              flex items-center justify-center gap-1.5 py-1.5 rounded-md
              text-xs font-medium transition-colors
              ${isDark
                ? 'text-red-400 hover:bg-red-900/30'
                : 'text-red-500 hover:bg-red-50'
              }
            `}
          >
            <Trash2 className="w-3 h-3" />
            Clear ({labelCount})
          </button>
        )}

        {/* Minimal instruction */}
        <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'} text-center`}>
          Tap preset, then tap chart
        </div>
      </div>
    </DraggablePanel>
  );
}

export default FloatingTextLabelPanel;
