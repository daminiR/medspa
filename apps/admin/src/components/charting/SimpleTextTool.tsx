'use client';

/**
 * SimpleTextTool - Text annotations for charting using Konva
 *
 * DESIGN PHILOSOPHY:
 * This component copies the EXACT structure from SmoothBrushTool which has
 * working positioning. The key insight is: if SmoothBrushTool's coordinates
 * work perfectly, copying its exact pattern for text should also work.
 *
 * KEY PATTERNS COPIED FROM SmoothBrushTool:
 * 1. Container setup with ResizeObserver for dimensions
 * 2. Konva Stage with same pointer event handlers
 * 3. Pen vs touch detection (pen/mouse draws, touch passes through for zoom)
 * 4. Multi-touch detection with isMultiTouchActive state
 * 5. Same coordinate system using stage.getPointerPosition()
 *
 * WORKFLOW:
 * 1. Select a preset text from the panel (Avoid, Bruise, Note, etc.)
 * 2. Tap on the chart to place the text
 * 3. Tap on existing text to delete it
 */

import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Stage, Layer, Text, Rect, Group } from 'react-konva';
import Konva from 'konva';
import { useChartingTheme } from '@/contexts/ChartingThemeContext';

// =============================================================================
// DEBUG FLAG
// =============================================================================
const DEBUG_TEXT_TOOL = false;

// =============================================================================
// TYPES
// =============================================================================

export interface SimpleTextLabel {
  id: string;
  /** X position as percentage (0-100) of container width */
  x: number;
  /** Y position as percentage (0-100) of container height */
  y: number;
  text: string;
  color: string;
  createdAt: Date;
}

export interface SimpleTextToolRef {
  undo: () => void;
  clearAll: () => void;
  getLabels: () => SimpleTextLabel[];
  setLabels: (labels: SimpleTextLabel[]) => void;
}

export interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface SimpleTextToolProps {
  /** Whether the text tool is currently active */
  isActive: boolean;
  /** Currently selected preset text to place (null = tap to delete mode) */
  selectedPreset: TextPreset | null;
  /** Callback when labels change */
  onLabelsChange?: (labels: SimpleTextLabel[]) => void;
  /** Callback when a label is placed */
  onLabelPlaced?: (label: SimpleTextLabel) => void;
  /** Callback when undo availability changes */
  onCanUndoChange?: (canUndo: boolean) => void;
  /** Whether the tool is read-only */
  readOnly?: boolean;
  /** Initial labels to render */
  initialLabels?: SimpleTextLabel[];
  /** Zoom state from parent (for coordinate transforms) */
  zoomState?: ZoomState;
}

// =============================================================================
// PRESET LABELS - Essential presets for medical spa charting
// =============================================================================

export interface TextPreset {
  id: string;
  text: string;
  color: string;
  isWarning?: boolean;
  isCustom?: boolean; // If true, shows text input popup before placing
}

export const TEXT_PRESETS: TextPreset[] = [
  { id: 'avoid', text: 'Avoid', color: '#EF4444', isWarning: true }, // Red
  { id: 'bruise', text: 'Bruise', color: '#3B82F6' }, // Blue
  { id: 'tender', text: 'Tender', color: '#F59E0B' }, // Amber
  { id: 'nodule', text: 'Nodule', color: '#EC4899', isWarning: true }, // Pink
  { id: 'scar', text: 'Scar', color: '#8B5CF6' }, // Purple
  { id: 'custom', text: 'Custom', color: '#10B981', isCustom: true }, // Green - shows text input
] as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateLabelId(): string {
  return `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// =============================================================================
// SIMPLE TEXT TOOL COMPONENT
// =============================================================================

export const SimpleTextTool = forwardRef<SimpleTextToolRef, SimpleTextToolProps>(
  function SimpleTextTool(
    {
      isActive,
      selectedPreset,
      onLabelsChange,
      onLabelPlaced,
      onCanUndoChange,
      readOnly = false,
      initialLabels = [],
      zoomState,
    },
    ref
  ) {
    // ==========================================================================
    // THEME - Get dark mode state
    // ==========================================================================
    const { isDark } = useChartingTheme();

    // ==========================================================================
    // REFS - EXACT SAME PATTERN AS SmoothBrushTool
    // ==========================================================================
    const containerRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);

    // ==========================================================================
    // STATE - Labels and UI state
    // ==========================================================================
    const [labels, setLabels] = useState<SimpleTextLabel[]>(initialLabels);
    const [undoStack, setUndoStack] = useState<SimpleTextLabel[]>([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [isMounted, setIsMounted] = useState(false);

    // Track multi-touch for zoom passthrough - EXACT SAME AS SmoothBrushTool
    const [isMultiTouchActive, setIsMultiTouchActive] = useState(false);
    const touchCountRef = useRef(0);

    // Custom text input state
    const [customTextInput, setCustomTextInput] = useState<{
      isOpen: boolean;
      position: { x: number; y: number }; // Percentage position
      pixelPosition: { x: number; y: number }; // Pixel position for popup placement
      text: string;
    }>({
      isOpen: false,
      position: { x: 0, y: 0 },
      pixelPosition: { x: 0, y: 0 },
      text: '',
    });
    const customInputRef = useRef<HTMLInputElement>(null);

    // ==========================================================================
    // CLIENT-SIDE MOUNTING - Konva requires client-side rendering
    // ==========================================================================
    useEffect(() => {
      setIsMounted(true);
    }, []);

    // ==========================================================================
    // DIMENSION TRACKING - EXACT SAME PATTERN AS SmoothBrushTool
    // ==========================================================================
    useEffect(() => {
      const container = containerRef.current;

      const updateDimensions = () => {
        if (container) {
          const rect = container.getBoundingClientRect();
          if (DEBUG_TEXT_TOOL) {
            console.log('[SimpleTextTool] Container dimensions update:', {
              width: rect.width,
              height: rect.height,
              isActive,
              isMounted,
            });
          }
          if (rect.width > 0 && rect.height > 0) {
            setDimensions({ width: rect.width, height: rect.height });
          }
        }
      };

      // Try multiple times to capture dimensions with increasing delays
      const timeouts = [0, 50, 100, 200, 500].map((delay, i) =>
        setTimeout(() => {
          updateDimensions();
        }, delay)
      );

      const resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });

      if (container) {
        resizeObserver.observe(container);
      }

      return () => {
        timeouts.forEach(clearTimeout);
        resizeObserver.disconnect();
      };
    }, [isActive, isMounted]);

    // ==========================================================================
    // NOTIFY PARENT OF CHANGES
    // ==========================================================================
    const canUndo = undoStack.length > 0;

    useEffect(() => {
      onCanUndoChange?.(canUndo);
    }, [canUndo, onCanUndoChange]);

    useEffect(() => {
      onLabelsChange?.(labels);
    }, [labels, onLabelsChange]);

    // ==========================================================================
    // COORDINATE CONVERSION - Convert pixel position to percentage
    // ==========================================================================
    const pixelToPercent = useCallback(
      (pixelX: number, pixelY: number): { x: number; y: number } => {
        // Container dimensions
        const width = dimensions.width;
        const height = dimensions.height;

        if (width === 0 || height === 0) {
          return { x: 50, y: 50 };
        }

        // Convert to percentage
        const x = (pixelX / width) * 100;
        const y = (pixelY / height) * 100;

        // Clamp to 0-100
        return {
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
        };
      },
      [dimensions]
    );

    const percentToPixel = useCallback(
      (percentX: number, percentY: number): { x: number; y: number } => {
        const width = dimensions.width;
        const height = dimensions.height;

        return {
          x: (percentX / 100) * width,
          y: (percentY / 100) * height,
        };
      },
      [dimensions]
    );

    // ==========================================================================
    // POINTER EVENT HANDLERS - EXACT SAME PATTERN AS SmoothBrushTool
    // ==========================================================================

    const handlePointerDown = useCallback(
      (e: Konva.KonvaEventObject<PointerEvent>) => {
        const evt = e.evt;

        if (DEBUG_TEXT_TOOL) {
          console.log('[SimpleTextTool] handlePointerDown:', {
            pointerType: evt.pointerType,
            readOnly,
            isMultiTouchActive,
            selectedPreset: selectedPreset?.text,
          });
        }

        if (readOnly) return;

        // Allow pen or mouse, block touch (same as SmoothBrushTool)
        if (evt.pointerType === 'touch') {
          if (DEBUG_TEXT_TOOL) {
            console.log('[SimpleTextTool] Ignoring touch (reserved for zoom/pan)');
          }
          return;
        }

        evt.preventDefault();

        const stage = stageRef.current;
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        // Convert to percentage coordinates
        const percentPos = pixelToPercent(pos.x, pos.y);

        if (DEBUG_TEXT_TOOL) {
          console.log('[SimpleTextTool] Tap at:', {
            pixel: pos,
            percent: percentPos,
          });
        }

        // Check if tapped on an existing label (for deletion)
        const tappedLabel = findLabelAtPosition(pos.x, pos.y);

        if (tappedLabel) {
          // Delete the tapped label
          if (DEBUG_TEXT_TOOL) {
            console.log('[SimpleTextTool] Deleting label:', tappedLabel.text);
          }
          setUndoStack((prev) => [...prev, tappedLabel]);
          setLabels((prev) => prev.filter((l) => l.id !== tappedLabel.id));
        } else if (selectedPreset) {
          // Check if this is a custom text preset
          if (selectedPreset.isCustom) {
            // Show the custom text input popup
            if (DEBUG_TEXT_TOOL) {
              console.log('[SimpleTextTool] Opening custom text input at:', percentPos);
            }
            setCustomTextInput({
              isOpen: true,
              position: percentPos,
              pixelPosition: { x: pos.x, y: pos.y },
              text: '',
            });
            // Focus the input after it renders
            setTimeout(() => {
              customInputRef.current?.focus();
            }, 50);
          } else {
            // Place new label immediately for non-custom presets
            const newLabel: SimpleTextLabel = {
              id: generateLabelId(),
              x: percentPos.x,
              y: percentPos.y,
              text: selectedPreset.text,
              color: selectedPreset.color,
              createdAt: new Date(),
            };

            if (DEBUG_TEXT_TOOL) {
              console.log('[SimpleTextTool] Placing label:', newLabel);
            }

            setLabels((prev) => [...prev, newLabel]);
            onLabelPlaced?.(newLabel);
          }
        }
      },
      [readOnly, isMultiTouchActive, selectedPreset, pixelToPercent, onLabelPlaced]
    );

    // Find label at a given pixel position (for tap-to-delete)
    const findLabelAtPosition = useCallback(
      (pixelX: number, pixelY: number): SimpleTextLabel | null => {
        // Define a tap tolerance in pixels
        const TAP_TOLERANCE = 30;

        for (const label of labels) {
          const labelPixel = percentToPixel(label.x, label.y);
          const dx = Math.abs(pixelX - labelPixel.x);
          const dy = Math.abs(pixelY - labelPixel.y);

          // Check if within tolerance (rough bounding box)
          if (dx < TAP_TOLERANCE && dy < TAP_TOLERANCE) {
            return label;
          }
        }

        return null;
      },
      [labels, percentToPixel]
    );

    // ==========================================================================
    // CUSTOM TEXT INPUT HANDLERS
    // ==========================================================================

    const handleCustomTextConfirm = useCallback(() => {
      const trimmedText = customTextInput.text.trim();
      if (trimmedText && selectedPreset) {
        const newLabel: SimpleTextLabel = {
          id: generateLabelId(),
          x: customTextInput.position.x,
          y: customTextInput.position.y,
          text: trimmedText,
          color: selectedPreset.color,
          createdAt: new Date(),
        };

        if (DEBUG_TEXT_TOOL) {
          console.log('[SimpleTextTool] Placing custom label:', newLabel);
        }

        setLabels((prev) => [...prev, newLabel]);
        onLabelPlaced?.(newLabel);
      }

      // Close the input
      setCustomTextInput({
        isOpen: false,
        position: { x: 0, y: 0 },
        pixelPosition: { x: 0, y: 0 },
        text: '',
      });
    }, [customTextInput, selectedPreset, onLabelPlaced]);

    const handleCustomTextCancel = useCallback(() => {
      setCustomTextInput({
        isOpen: false,
        position: { x: 0, y: 0 },
        pixelPosition: { x: 0, y: 0 },
        text: '',
      });
    }, []);

    const handleCustomTextKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCustomTextConfirm();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          handleCustomTextCancel();
        }
      },
      [handleCustomTextConfirm, handleCustomTextCancel]
    );

    // ==========================================================================
    // TOUCH EVENT HANDLERS - EXACT SAME AS SmoothBrushTool
    // Multi-touch detection for zoom/pan passthrough
    // ==========================================================================

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleTouchStart = (e: TouchEvent) => {
        touchCountRef.current = e.touches.length;

        if (e.touches.length >= 2) {
          setIsMultiTouchActive(true);
          if (DEBUG_TEXT_TOOL) {
            console.log('[SimpleTextTool] Multi-touch detected, enabling zoom passthrough');
          }
        }
      };

      const handleTouchMove = () => {
        // Let multi-touch events bubble for zoom/pan
      };

      const handleTouchEnd = (e: TouchEvent) => {
        touchCountRef.current = e.touches.length;

        if (e.touches.length <= 1) {
          setTimeout(() => {
            setIsMultiTouchActive(false);
          }, 150);
        }
      };

      container.addEventListener('touchstart', handleTouchStart, { passive: true });
      container.addEventListener('touchmove', handleTouchMove, { passive: true });
      container.addEventListener('touchend', handleTouchEnd, { passive: true });
      container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('touchcancel', handleTouchEnd);
      };
    }, []);

    // Reset state when tool becomes inactive
    useEffect(() => {
      if (isActive) {
        touchCountRef.current = 0;
        setIsMultiTouchActive(false);
      } else {
        // Close custom text input when tool becomes inactive
        setCustomTextInput({
          isOpen: false,
          position: { x: 0, y: 0 },
          pixelPosition: { x: 0, y: 0 },
          text: '',
        });
      }
    }, [isActive]);

    // ==========================================================================
    // REF METHODS - Undo, Clear, Get/Set Labels
    // ==========================================================================

    const handleUndo = useCallback(() => {
      if (undoStack.length === 0) return;

      const lastDeleted = undoStack[undoStack.length - 1];
      setUndoStack((prev) => prev.slice(0, -1));
      setLabels((prev) => [...prev, lastDeleted]);

      if (DEBUG_TEXT_TOOL) {
        console.log('[SimpleTextTool] Undo - restored:', lastDeleted.text);
      }
    }, [undoStack]);

    const handleClearAll = useCallback(() => {
      // Add all labels to undo stack
      setUndoStack((prev) => [...prev, ...labels]);
      setLabels([]);

      if (DEBUG_TEXT_TOOL) {
        console.log('[SimpleTextTool] Cleared all labels');
      }
    }, [labels]);

    const getLabels = useCallback(() => {
      return [...labels];
    }, [labels]);

    const setLabelsExternal = useCallback((newLabels: SimpleTextLabel[]) => {
      setLabels(newLabels);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        undo: handleUndo,
        clearAll: handleClearAll,
        getLabels,
        setLabels: setLabelsExternal,
      }),
      [handleUndo, handleClearAll, getLabels, setLabelsExternal]
    );

    // ==========================================================================
    // RENDER - EXACT SAME STRUCTURE AS SmoothBrushTool
    // ==========================================================================

    if (DEBUG_TEXT_TOOL) {
      console.log('[SimpleTextTool] Render:', {
        isActive,
        isMounted,
        dimensions,
        labelsCount: labels.length,
        selectedPreset: selectedPreset?.text,
      });
    }

    // CRITICAL FIX: The Stage should only be INTERACTIVE when isActive
    // However, we always render labels so they stay visible
    // The fix: render Stage always for labels, but only attach event handlers when active
    const shouldRenderStage = isMounted && dimensions.width > 0 && dimensions.height > 0;

    return (
      <div
        ref={containerRef}
        className={`absolute inset-0 z-20 ${!isActive || readOnly ? 'pointer-events-none' : ''}`}
        style={{
          touchAction: 'manipulation',
          // CRITICAL: Only capture pointer events when ACTIVE and not in multi-touch
          // When not active, this MUST be 'none' so clicks pass through to other tools
          pointerEvents: !isActive || isMultiTouchActive ? 'none' : 'auto',
        }}
      >
        {shouldRenderStage ? (
          <Stage
            ref={stageRef}
            width={dimensions.width}
            height={dimensions.height}
            // CRITICAL FIX: Only attach event handler when active
            // This prevents the Stage from capturing events when another tool is selected
            onPointerDown={isActive ? handlePointerDown : undefined}
            style={{
              // CRITICAL FIX: Stage must have pointer-events: none when tool is NOT active
              // This allows clicks to pass through to other tools (brush, arrows, etc.)
              pointerEvents: !isActive || isMultiTouchActive ? 'none' : 'auto',
              touchAction: 'manipulation',
            }}
          >
            <Layer>
              {/* Render text labels */}
              {labels.map((label) => {
                const pos = percentToPixel(label.x, label.y);

                return (
                  <Group key={label.id} x={pos.x} y={pos.y}>
                    {/* Background rectangle for better visibility */}
                    <Rect
                      x={-4}
                      y={-2}
                      width={label.text.length * 8 + 8}
                      height={18}
                      fill="rgba(255, 255, 255, 0.9)"
                      cornerRadius={4}
                      shadowColor="black"
                      shadowBlur={2}
                      shadowOpacity={0.2}
                      listening={false}
                    />
                    {/* Text label */}
                    <Text
                      text={label.text}
                      fontSize={14}
                      fontFamily="system-ui, -apple-system, sans-serif"
                      fontStyle="bold"
                      fill={label.color}
                      listening={false}
                    />
                  </Group>
                );
              })}
            </Layer>
          </Stage>
        ) : null}

        {/* Custom text input popup */}
        {customTextInput.isOpen && (
          <div
            className="absolute z-50 pointer-events-auto"
            style={{
              left: Math.min(customTextInput.pixelPosition.x, dimensions.width - 200),
              top: Math.max(customTextInput.pixelPosition.y - 45, 10),
            }}
          >
            <div
              className={`
                rounded-lg shadow-xl p-2.5 flex items-center gap-2
                ${isDark
                  ? 'bg-gray-800 border border-gray-600 shadow-black/40'
                  : 'bg-white border border-gray-200 shadow-gray-300/50'
                }
              `}
            >
              <input
                ref={customInputRef}
                type="text"
                value={customTextInput.text}
                onChange={(e) =>
                  setCustomTextInput((prev) => ({ ...prev, text: e.target.value }))
                }
                onKeyDown={handleCustomTextKeyDown}
                placeholder="Enter text..."
                className={`
                  w-32 px-2.5 py-1.5 text-sm rounded-md
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-colors
                  ${isDark
                    ? 'bg-gray-700 text-white border border-gray-600 placeholder-gray-400'
                    : 'bg-white text-gray-900 border border-gray-300 placeholder-gray-400'
                  }
                `}
                autoFocus
              />
              <button
                onClick={handleCustomTextConfirm}
                disabled={!customTextInput.text.trim()}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                  ${isDark
                    ? 'bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed'
                  }
                `}
              >
                Done
              </button>
              <button
                onClick={handleCustomTextCancel}
                className={`
                  p-1.5 rounded-md transition-colors
                  ${isDark
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);

// =============================================================================
// SETTINGS PANEL COMPONENT
// =============================================================================

interface SimpleTextSettingsPanelProps {
  selectedPreset: TextPreset | null;
  onPresetSelect: (preset: TextPreset | null) => void;
  onClearAll: () => void;
  labelCount: number;
  isDark?: boolean;
}

export function SimpleTextSettingsPanel({
  selectedPreset,
  onPresetSelect,
  onClearAll,
  labelCount,
  isDark = false,
}: SimpleTextSettingsPanelProps) {
  return (
    <div className="space-y-3">
      {/* Instruction */}
      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Select a label, then tap on the chart to place it. Tap existing labels to delete.
      </p>

      {/* Preset buttons */}
      <div className="grid grid-cols-2 gap-2">
        {TEXT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() =>
              onPresetSelect(selectedPreset?.id === preset.id ? null : preset)
            }
            className={`
              flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-semibold
              transition-all active:scale-[0.98] border
              ${
                selectedPreset?.id === preset.id
                  ? isDark
                    ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-gray-800'
                    : 'ring-2 ring-blue-500 ring-offset-1'
                  : ''
              }
              ${
                isDark
                  ? 'bg-gray-700/80 border-gray-600 hover:bg-gray-600'
                  : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm'
              }
            `}
            style={{ color: preset.color }}
          >
            {preset.isWarning && (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            )}
            {preset.isCustom && (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            )}
            {preset.text}
          </button>
        ))}
      </div>

      {/* Clear all button */}
      {labelCount > 0 && (
        <button
          onClick={onClearAll}
          className={`
            w-full flex items-center justify-center gap-1.5 py-2 rounded-md
            text-sm font-medium transition-colors mt-2
            ${
              isDark
                ? 'text-red-400 hover:bg-red-900/30 border border-red-900/50'
                : 'text-red-500 hover:bg-red-50 border border-red-200'
            }
          `}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Clear All ({labelCount})
        </button>
      )}

      {/* Selected preset indicator */}
      {selectedPreset && (
        <div
          className={`
          text-center py-2 rounded-md text-sm
          ${isDark ? 'bg-gray-700' : 'bg-gray-100'}
        `}
        >
          Placing:{' '}
          <span className="font-semibold" style={{ color: selectedPreset.color }}>
            {selectedPreset.text}
          </span>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// HOOK FOR MANAGING TEXT LABELS STATE
// =============================================================================

export function useSimpleTextLabels(initialLabels: SimpleTextLabel[] = []) {
  const [labels, setLabels] = useState<SimpleTextLabel[]>(initialLabels);
  const [selectedPreset, setSelectedPreset] = useState<TextPreset | null>(null);
  const [isActive, setIsActive] = useState(false);

  const clearAll = useCallback(() => {
    setLabels([]);
  }, []);

  return {
    labels,
    setLabels,
    selectedPreset,
    setSelectedPreset,
    isActive,
    setIsActive,
    clearAll,
  };
}

export default SimpleTextTool;
