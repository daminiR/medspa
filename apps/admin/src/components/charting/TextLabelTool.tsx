'use client';

/**
 * TextLabelTool - Quick text annotations for charting
 *
 * Simplified workflow: Tap preset -> Tap chart -> Done
 *
 * 5 Essential Presets:
 * - Avoid (red) - Safety warning
 * - Bruise (blue) - Documentation
 * - Tender (amber) - Observation
 * - Nodule (pink) - Clinical finding
 * - Note (gray) - General note
 *
 * Features:
 * - Quick presets for one-tap placement
 * - Auto font size based on zoom level
 * - 4 color quick picks (red, blue, amber, gray)
 * - Long-press to drag labels
 * - Custom text input available
 */

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import {
  Type,
  X,
  Trash2,
  GripVertical,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { useChartingTheme } from '@/contexts/ChartingThemeContext';

// =============================================================================
// TYPES
// =============================================================================

export interface TextLabel {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  text: string;
  fontSize: TextLabelSize;
  color: string;
  createdAt: Date;
  modifiedAt?: Date;
}

export type TextLabelSize = 'small' | 'medium' | 'large';

/**
 * Zoom state for coordinating with parent zoom/pan container
 */
export interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface TextLabelToolProps {
  /** Array of text labels to render */
  labels: TextLabel[];
  /** Callback when labels change */
  onLabelsChange: (labels: TextLabel[]) => void;
  /** Whether tool is currently active (accepting new label placements) */
  isActive: boolean;
  /** Callback when tool active state changes */
  onActiveChange?: (isActive: boolean) => void;
  /** Current zoom level for counter-scaling (default: 1) */
  zoom?: number;
  /** Whether the chart is read-only */
  readOnly?: boolean;
  /** Container ref for positioning calculations */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /**
   * Zoom state from parent (FaceChartWithZoom, etc.)
   * When provided, labels will transform to stay attached to the zoomed/panned chart.
   */
  zoomState?: ZoomState;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/** Quick-add preset labels - essential 5 only */
export const PRESET_LABELS = [
  { text: 'Avoid', color: '#EF4444', isWarning: true }, // Red - safety warning
  { text: 'Bruise', color: '#3B82F6', isWarning: false }, // Blue - documentation
  { text: 'Tender', color: '#F59E0B', isWarning: false }, // Amber - observation
  { text: 'Nodule', color: '#EC4899', isWarning: true }, // Pink - clinical finding
  { text: 'Note', color: '#6B7280', isWarning: false }, // Gray - general note
] as const;

/** Available text colors - 4 quick picks */
export const TEXT_COLORS = [
  { id: 'red', color: '#EF4444', name: 'Red' },
  { id: 'blue', color: '#3B82F6', name: 'Blue' },
  { id: 'amber', color: '#F59E0B', name: 'Amber' },
  { id: 'gray', color: '#6B7280', name: 'Gray' },
] as const;

/** Font size configurations - used internally for auto-sizing */
export const FONT_SIZES: Record<TextLabelSize, { px: number; label: string }> = {
  small: { px: 12, label: 'S' },
  medium: { px: 14, label: 'M' },
  large: { px: 16, label: 'L' },
};

/** Get auto font size based on zoom level */
export function getAutoFontSize(zoom: number): TextLabelSize {
  if (zoom >= 1.5) return 'small';
  if (zoom <= 0.7) return 'large';
  return 'medium';
}

// Default color for new labels
const DEFAULT_COLOR = '#3B82F6';
const DEFAULT_SIZE: TextLabelSize = 'medium';

// Drag detection constants
const LONG_PRESS_DURATION = 300; // ms
const DRAG_MOVE_THRESHOLD = 5; // pixels

// =============================================================================
// TEXT LABEL OVERLAY COMPONENT
// =============================================================================

interface TextLabelOverlayProps {
  labels: TextLabel[];
  onLabelSelect: (label: TextLabel) => void;
  onLabelMove: (labelId: string, x: number, y: number) => void;
  onLabelDelete: (labelId: string) => void;
  selectedLabelId: string | null;
  zoom: number;
  readOnly: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isDark: boolean;
  isMultiTouchActive: boolean;
  isActive: boolean;
  /** Zoom state for following chart zoom/pan transforms */
  zoomState?: ZoomState;
}

function TextLabelOverlay({
  labels,
  onLabelSelect,
  onLabelMove,
  onLabelDelete,
  selectedLabelId,
  zoom,
  readOnly,
  containerRef,
  isDark,
  isMultiTouchActive,
  isActive,
  zoomState,
}: TextLabelOverlayProps) {
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    labelId: string | null;
    startX: number;
    startY: number;
    originalX: number;
    originalY: number;
  } | null>(null);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  // Track active touch count for two-finger gesture detection
  const touchCountRef = useRef(0);

  // Counter-scale to keep labels fixed size when zoomed
  const labelScale = 1 / zoom;

  // Clear long-press timer
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Handle pointer down - start long-press detection
  // Two-finger gestures pass through for zoom/pan
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, label: TextLabel) => {
      if (readOnly) return;

      // Track touch count for multi-touch detection
      if (e.pointerType === 'touch') {
        touchCountRef.current++;
        // If more than one finger, don't start interaction - let parent handle zoom/pan
        if (touchCountRef.current > 1) {
          clearLongPressTimer();
          return;
        }
      }

      e.stopPropagation();

      pointerStartRef.current = { x: e.clientX, y: e.clientY };
      clearLongPressTimer();

      // Start long-press timer for drag mode
      longPressTimerRef.current = setTimeout(() => {
        setDragState({
          isDragging: true,
          labelId: label.id,
          startX: e.clientX,
          startY: e.clientY,
          originalX: label.x,
          originalY: label.y,
        });
        // Haptic feedback
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([30]);
        }
      }, LONG_PRESS_DURATION);
    },
    [readOnly, clearLongPressTimer]
  );

  // Handle pointer move - update drag position
  // Two-finger gestures pass through for zoom/pan
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      // Don't process if multi-touch gesture is happening
      if (e.pointerType === 'touch' && touchCountRef.current > 1) {
        clearLongPressTimer();
        return;
      }

      // Check if moved too much before drag mode activated
      if (pointerStartRef.current && !dragState?.isDragging && longPressTimerRef.current) {
        const dx = e.clientX - pointerStartRef.current.x;
        const dy = e.clientY - pointerStartRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > DRAG_MOVE_THRESHOLD) {
          clearLongPressTimer();
        }
      }

      // If dragging, update position
      if (dragState?.isDragging && dragState.labelId) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const newX = ((e.clientX - rect.left) / rect.width) * 100;
        const newY = ((e.clientY - rect.top) / rect.height) * 100;

        // Clamp to bounds
        const clampedX = Math.max(0, Math.min(100, newX));
        const clampedY = Math.max(0, Math.min(100, newY));

        onLabelMove(dragState.labelId, clampedX, clampedY);
      }
    },
    [dragState, clearLongPressTimer, containerRef, onLabelMove]
  );

  // Handle pointer up - end drag or handle tap
  // Two-finger gestures pass through for zoom/pan
  const handlePointerUp = useCallback(
    (e: React.PointerEvent, label: TextLabel) => {
      // Track touch count for multi-touch detection
      if (e.pointerType === 'touch') {
        touchCountRef.current = Math.max(0, touchCountRef.current - 1);
      }

      clearLongPressTimer();

      if (dragState?.isDragging) {
        // End drag mode
        setDragState(null);
      } else {
        // It was a tap - select the label
        onLabelSelect(label);
      }

      pointerStartRef.current = null;
    },
    [dragState, clearLongPressTimer, onLabelSelect]
  );

  // Handle pointer cancel
  // Also handles pointer cancel for multi-touch scenarios
  const handlePointerCancel = useCallback((e?: React.PointerEvent) => {
    // Track touch count for multi-touch detection
    if (e && e.pointerType === 'touch') {
      touchCountRef.current = Math.max(0, touchCountRef.current - 1);
    }

    clearLongPressTimer();
    setDragState(null);
    pointerStartRef.current = null;
  }, [clearLongPressTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none"
    >
      {labels.map((label) => {
        const isSelected = selectedLabelId === label.id;
        const isDraggingThis = dragState?.isDragging && dragState.labelId === label.id;
        const fontConfig = FONT_SIZES[label.fontSize];

        return (
          <div
            key={label.id}
            className={`absolute pointer-events-auto transition-all ${
              isDraggingThis ? 'cursor-grabbing z-50' : 'cursor-pointer'
            }`}
            style={{
              left: `${label.x}%`,
              top: `${label.y}%`,
              transform: `translate(-50%, -50%) scale(${labelScale})`,
              // IMPORTANT: Use 'pinch-zoom' instead of 'none' to allow two-finger zoom gestures
              // to pass through to the parent FaceChartWithZoom component.
              // This ensures practitioners can ALWAYS zoom in/out regardless of which tool is active.
              touchAction: 'pinch-zoom',
              // CRITICAL: Disable pointer events when tool not active OR during two-finger gestures
              // This allows other tools to receive clicks and zoom gestures to pass through
              pointerEvents: !isActive ? 'none' : (isMultiTouchActive ? 'none' : 'auto'),
            }}
            onPointerDown={(e) => handlePointerDown(e, label)}
            onPointerMove={handlePointerMove}
            onPointerUp={(e) => handlePointerUp(e, label)}
            onPointerCancel={handlePointerCancel}
          >
            {/* Text with shadow/outline for readability */}
            <div
              className={`
                relative px-2 py-1 rounded-md font-semibold whitespace-nowrap
                transition-all duration-150
                ${isSelected ? 'ring-2 ring-offset-1 ring-blue-400' : ''}
                ${isDraggingThis ? 'scale-110 opacity-90' : ''}
              `}
              style={{
                fontSize: `${fontConfig.px}px`,
                color: label.color,
                // Background with transparency for readability
                backgroundColor: isDark
                  ? 'rgba(0, 0, 0, 0.75)'
                  : 'rgba(255, 255, 255, 0.9)',
                // Text shadow for extra contrast
                textShadow: isDark
                  ? '0 1px 2px rgba(0, 0, 0, 0.8)'
                  : '0 1px 2px rgba(255, 255, 255, 0.8)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              }}
            >
              {label.text}

              {/* Delete button when selected */}
              {isSelected && !readOnly && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLabelDelete(label.id);
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-md"
                  aria-label="Delete label"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Drag indicator when selected */}
              {isSelected && !readOnly && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 text-gray-400">
                  <GripVertical className="w-3 h-3" />
                </div>
              )}
            </div>

            {/* Dragging indicator */}
            {isDraggingThis && (
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap bg-black/70 px-2 py-0.5 rounded">
                Dragging...
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// TEXT INPUT MODAL
// =============================================================================

interface TextInputModalProps {
  isOpen: boolean;
  position: { x: number; y: number } | null;
  onSubmit: (text: string) => void;
  onClose: () => void;
  isDark: boolean;
}

function TextInputModal({
  isOpen,
  position,
  onSubmit,
  onClose,
  isDark,
}: TextInputModalProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset text when modal closes
  useEffect(() => {
    if (!isOpen) {
      setText('');
    }
  }, [isOpen]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (text.trim()) {
        onSubmit(text.trim());
        setText('');
      }
    },
    [text, onSubmit]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen || !position) return null;

  return (
    <div
      className="fixed z-[2000]"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        className={`
          flex items-center gap-2 p-2 rounded-lg shadow-xl border
          ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
        `}
      >
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter label text..."
          className={`
            w-40 px-3 py-2 text-sm rounded-md border outline-none
            ${isDark
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
              : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
            }
          `}
          maxLength={30}
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className={`
            p-2 rounded-md transition-colors
            ${text.trim()
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : isDark
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
          aria-label="Add label"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className={`
            p-2 rounded-md transition-colors
            ${isDark
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
          aria-label="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </form>

      {/* Pointer arrow */}
      <div
        className={`
          absolute left-1/2 -translate-x-1/2 top-full
          w-0 h-0 border-l-8 border-r-8 border-t-8
          border-l-transparent border-r-transparent
          ${isDark ? 'border-t-gray-800' : 'border-t-white'}
        `}
      />
    </div>
  );
}

// =============================================================================
// TEXT LABEL SETTINGS PANEL
// =============================================================================

interface TextLabelSettingsPanelProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  onPresetSelect: (text: string, color: string) => void;
  onClearAll: () => void;
  labelCount: number;
  isDark: boolean;
}

function TextLabelSettingsPanel({
  selectedColor,
  onColorChange,
  onPresetSelect,
  onClearAll,
  labelCount,
  isDark,
}: TextLabelSettingsPanelProps) {
  return (
    <div className="space-y-3">
      {/* Quick-add Presets - Primary focus */}
      <div className="grid grid-cols-1 gap-1.5">
        {PRESET_LABELS.map((preset) => (
          <button
            key={preset.text}
            onClick={() => onPresetSelect(preset.text, preset.color)}
            className={`
              flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold
              transition-all active:scale-[0.98] border
              ${isDark
                ? 'bg-gray-700/80 border-gray-600 hover:bg-gray-600'
                : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm'
              }
            `}
            style={{ color: preset.color }}
          >
            {preset.isWarning && <AlertTriangle className="w-4 h-4" />}
            {preset.text}
          </button>
        ))}
      </div>

      {/* Color Quick Picks - Inline row */}
      <div className="flex items-center gap-2 pt-1">
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
                  : 'hover:scale-110'
                }
              `}
              style={{ backgroundColor: colorOption.color }}
              title={colorOption.name}
              aria-label={`Select ${colorOption.name}`}
            />
          ))}
        </div>
      </div>

      {/* Clear All - Only show if labels exist */}
      {labelCount > 0 && (
        <button
          onClick={onClearAll}
          className={`
            w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md
            text-xs font-medium transition-colors mt-2
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
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TextLabelTool({
  labels,
  onLabelsChange,
  isActive,
  onActiveChange,
  zoom = 1,
  readOnly = false,
  containerRef,
  zoomState,
}: TextLabelToolProps) {
  // Theme
  const { theme } = useChartingTheme();
  const isDark = theme === 'dark';

  // Settings state - size is auto-calculated from zoom
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);

  // Auto-size based on zoom level
  const autoSize = useMemo(() => getAutoFontSize(zoom), [zoom]);

  // Text input state
  const [pendingPosition, setPendingPosition] = useState<{ x: number; y: number } | null>(null);
  const [inputScreenPosition, setInputScreenPosition] = useState<{ x: number; y: number } | null>(null);
  const [usePresetText, setUsePresetText] = useState<{ text: string; color: string } | null>(null);

  // State to toggle pointer-events during multi-touch gestures
  // This allows zoom/pan gestures to pass through to parent FaceChartWithZoom
  const [isMultiTouchActive, setIsMultiTouchActive] = useState(false);
  const isMultiTouchActiveRef = useRef(false);
  const touchCountRef = useRef(0);

  // Keep ref in sync with state for use in event handlers
  useEffect(() => {
    isMultiTouchActiveRef.current = isMultiTouchActive;
  }, [isMultiTouchActive]);

  // Native touch event handlers for multi-touch detection
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isActive) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchCountRef.current = e.touches.length;
      if (e.touches.length >= 2) {
        isMultiTouchActiveRef.current = true;
        setIsMultiTouchActive(true);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchCountRef.current = e.touches.length;
      if (e.touches.length === 0) {
        // Delay reset to prevent accidental marks after gesture ends
        setTimeout(() => {
          isMultiTouchActiveRef.current = false;
          setIsMultiTouchActive(false);
        }, 150);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isActive, containerRef]);

  // Handle chart click to place new label
  const handleChartClick = useCallback(
    (e: MouseEvent) => {
      if (!isActive || readOnly || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Clamp to bounds
      const clampedX = Math.max(0, Math.min(100, x));
      const clampedY = Math.max(0, Math.min(100, y));

      // Store the position and show input
      setPendingPosition({ x: clampedX, y: clampedY });
      setInputScreenPosition({ x: e.clientX, y: e.clientY - 10 });
      setSelectedLabelId(null);
    },
    [isActive, readOnly, containerRef]
  );

  // Attach click handler when active
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isActive) return;

    container.addEventListener('click', handleChartClick);
    return () => {
      container.removeEventListener('click', handleChartClick);
    };
  }, [isActive, handleChartClick, containerRef]);

  // Handle text input submission
  const handleTextSubmit = useCallback(
    (text: string) => {
      if (!pendingPosition) return;

      const newLabel: TextLabel = {
        id: `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: pendingPosition.x,
        y: pendingPosition.y,
        text,
        fontSize: autoSize,
        color: usePresetText?.color || selectedColor,
        createdAt: new Date(),
      };

      onLabelsChange([...labels, newLabel]);
      setPendingPosition(null);
      setInputScreenPosition(null);
      setUsePresetText(null);
    },
    [pendingPosition, autoSize, selectedColor, usePresetText, labels, onLabelsChange]
  );

  // Handle preset selection - place immediately with preset text
  const handlePresetSelect = useCallback(
    (text: string, color: string) => {
      setUsePresetText({ text, color });
      // If there's a pending position, place immediately
      if (pendingPosition) {
        const newLabel: TextLabel = {
          id: `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          x: pendingPosition.x,
          y: pendingPosition.y,
          text,
          fontSize: autoSize,
          color,
          createdAt: new Date(),
        };
        onLabelsChange([...labels, newLabel]);
        setPendingPosition(null);
        setInputScreenPosition(null);
        setUsePresetText(null);
      }
    },
    [pendingPosition, autoSize, labels, onLabelsChange]
  );

  // Handle input close
  const handleInputClose = useCallback(() => {
    setPendingPosition(null);
    setInputScreenPosition(null);
    setUsePresetText(null);
  }, []);

  // Handle label selection
  const handleLabelSelect = useCallback((label: TextLabel) => {
    setSelectedLabelId(label.id);
  }, []);

  // Handle label move
  const handleLabelMove = useCallback(
    (labelId: string, x: number, y: number) => {
      const updatedLabels = labels.map((label) =>
        label.id === labelId
          ? { ...label, x, y, modifiedAt: new Date() }
          : label
      );
      onLabelsChange(updatedLabels);
    },
    [labels, onLabelsChange]
  );

  // Handle label delete
  const handleLabelDelete = useCallback(
    (labelId: string) => {
      const updatedLabels = labels.filter((label) => label.id !== labelId);
      onLabelsChange(updatedLabels);
      if (selectedLabelId === labelId) {
        setSelectedLabelId(null);
      }
    },
    [labels, onLabelsChange, selectedLabelId]
  );

  // Handle clear all
  const handleClearAll = useCallback(() => {
    onLabelsChange([]);
    setSelectedLabelId(null);
  }, [onLabelsChange]);

  // Click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't deselect if clicking on the settings panel or a label
      if (target.closest('[data-text-label-panel]') || target.closest('[data-text-label]')) {
        return;
      }
      setSelectedLabelId(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      {/* Text Labels Overlay */}
      <TextLabelOverlay
        labels={labels}
        onLabelSelect={handleLabelSelect}
        onLabelMove={handleLabelMove}
        onLabelDelete={handleLabelDelete}
        selectedLabelId={selectedLabelId}
        zoom={zoom}
        readOnly={readOnly}
        containerRef={containerRef}
        isDark={isDark}
        isMultiTouchActive={isMultiTouchActive}
        isActive={isActive}
        zoomState={zoomState}
      />

      {/* Text Input Modal */}
      <TextInputModal
        isOpen={!!pendingPosition && !usePresetText}
        position={inputScreenPosition}
        onSubmit={handleTextSubmit}
        onClose={handleInputClose}
        isDark={isDark}
      />
    </>
  );
}

// =============================================================================
// SETTINGS PANEL EXPORT (for use in FloatingToolPalette or similar)
// =============================================================================

export { TextLabelSettingsPanel };

// =============================================================================
// HOOK FOR MANAGING TEXT LABELS STATE
// =============================================================================

export function useTextLabels(initialLabels: TextLabel[] = []) {
  const [labels, setLabels] = useState<TextLabel[]>(initialLabels);
  const [isActive, setIsActive] = useState(false);

  const addLabel = useCallback((label: Omit<TextLabel, 'id' | 'createdAt'>) => {
    const newLabel: TextLabel = {
      ...label,
      id: `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
    setLabels((prev) => [...prev, newLabel]);
    return newLabel;
  }, []);

  const updateLabel = useCallback((labelId: string, updates: Partial<TextLabel>) => {
    setLabels((prev) =>
      prev.map((label) =>
        label.id === labelId
          ? { ...label, ...updates, modifiedAt: new Date() }
          : label
      )
    );
  }, []);

  const deleteLabel = useCallback((labelId: string) => {
    setLabels((prev) => prev.filter((label) => label.id !== labelId));
  }, []);

  const clearAll = useCallback(() => {
    setLabels([]);
  }, []);

  return {
    labels,
    setLabels,
    isActive,
    setIsActive,
    addLabel,
    updateLabel,
    deleteLabel,
    clearAll,
  };
}

export default TextLabelTool;
