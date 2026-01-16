'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChartingTheme, type ChartingTheme } from '@/contexts/ChartingThemeContext';

interface Position {
  x: number;
  y: number;
}

interface DraggablePanelProps {
  children: React.ReactNode;
  initialPosition: Position;
  panelId: string;
  title?: string;
  onCollapse?: () => void;
  isCollapsed?: boolean;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  /**
   * Theme variant for the panel.
   * If not provided, uses the theme from ChartingThemeContext.
   * Can be 'light', 'dark', or 'auto' (uses context theme).
   */
  variant?: 'light' | 'dark' | 'auto';
}

// Global z-index counter for bringing panels to front
// Starting at 1000 to ensure panels float above all page content including 3D canvas
// Note: The FullScreenChartCanvas container has z-index 10, so panels are well above that
// The nav bar typically uses z-index 50, so panels at 1000+ will always be on top
let globalZIndex = 1000;
// Higher z-index offset when actively dragging
const DRAGGING_Z_OFFSET = 500;
// Track panel initialization to assign incrementing z-indices
const panelZIndices = new Map<string, number>();

export function DraggablePanel({
  children,
  initialPosition,
  panelId,
  title,
  onCollapse,
  isCollapsed = false,
  className = '',
  minWidth = 200,
  minHeight = 100,
  variant = 'auto',
}: DraggablePanelProps) {
  // Get theme from context (safely returns default if outside provider)
  const { theme: contextTheme } = useChartingTheme();

  // Determine effective theme: explicit variant overrides context
  const effectiveTheme: ChartingTheme =
    variant === 'auto' ? contextTheme : variant;
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  // Initialize z-index: if panel was seen before, restore its z-index, otherwise assign new one
  const [zIndex, setZIndex] = useState(() => {
    const existing = panelZIndices.get(panelId);
    if (existing !== undefined) {
      return existing;
    }
    globalZIndex += 1;
    panelZIndices.set(panelId, globalZIndex);
    return globalZIndex;
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);

  // Load saved position from localStorage on mount
  // v2: Added nav bar offset constraint - clear old positions that might be behind nav
  useEffect(() => {
    const versionKey = `draggable-panel-version`;
    const currentVersion = '3'; // Bump this when layout changes - v3: panels outside FullScreenChartCanvas
    const savedVersion = localStorage.getItem(versionKey);

    // Clear old positions if version changed
    if (savedVersion !== currentVersion) {
      localStorage.setItem(versionKey, currentVersion);
      // Clear all draggable panel positions
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('draggable-panel-') && key !== versionKey) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }

    const savedPosition = localStorage.getItem(`draggable-panel-${panelId}`);
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition) as Position;
        // Validate the saved position is within viewport
        const constrainedPosition = constrainToViewport(parsed.x, parsed.y);
        setPosition(constrainedPosition);
      } catch {
        // Use initial position if parsing fails
        setPosition(initialPosition);
      }
    }
  }, [panelId, initialPosition]);

  // Constrain position to viewport bounds
  // minY is 48 to account for the nav bar height
  const constrainToViewport = useCallback((x: number, y: number): Position => {
    if (typeof window === 'undefined') return { x, y };

    const panel = panelRef.current;
    const panelWidth = panel?.offsetWidth || minWidth;
    const panelHeight = panel?.offsetHeight || minHeight;
    const navBarHeight = 48; // h-12 = 48px

    const maxX = window.innerWidth - panelWidth;
    const maxY = window.innerHeight - panelHeight;

    return {
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(navBarHeight, Math.min(y, maxY)),
    };
  }, [minWidth, minHeight]);

  // Save position to localStorage
  const savePosition = useCallback((pos: Position) => {
    localStorage.setItem(`draggable-panel-${panelId}`, JSON.stringify(pos));
  }, [panelId]);

  // Bring panel to front
  const bringToFront = useCallback(() => {
    globalZIndex += 1;
    panelZIndices.set(panelId, globalZIndex);
    setZIndex(globalZIndex);
  }, [panelId]);

  // Handle pointer down on drag handle
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    bringToFront();
    setIsDragging(true);

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };

    // Capture pointer for tracking outside the element
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [position, bringToFront]);

  // Handle pointer move during drag
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    e.preventDefault();

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    const newX = dragStartRef.current.posX + deltaX;
    const newY = dragStartRef.current.posY + deltaY;

    const constrainedPosition = constrainToViewport(newX, newY);
    setPosition(constrainedPosition);
  }, [isDragging, constrainToViewport]);

  // Handle pointer up to end drag
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;

    e.preventDefault();
    setIsDragging(false);
    dragStartRef.current = null;

    // Release pointer capture
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    // Save final position
    savePosition(position);
  }, [isDragging, position, savePosition]);

  // Handle click on panel body to bring to front
  const handlePanelClick = useCallback(() => {
    bringToFront();
  }, [bringToFront]);

  // Update position on window resize to keep within bounds
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => constrainToViewport(prev.x, prev.y));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [constrainToViewport]);

  // Calculate effective z-index (higher when dragging)
  const effectiveZIndex = isDragging ? zIndex + DRAGGING_Z_OFFSET : zIndex;

  // Theme-based styling - uses effectiveTheme determined from variant or context
  const isDark = effectiveTheme === 'dark';

  // Panel background
  const panelBgClass = isDark
    ? 'bg-gray-800/95 backdrop-blur-md border-gray-700'
    : 'bg-white/95 backdrop-blur-md border-gray-200 shadow-lg';

  // Handle/header background
  const handleBgClass = isDark
    ? 'bg-gradient-to-r from-gray-700/60 to-gray-800/40 border-b border-gray-700'
    : 'bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200';

  // Drag indicator dots
  const dotColor = isDark ? 'bg-gray-500' : 'bg-gray-400';

  // Title text color
  const titleColor = isDark ? 'text-white' : 'text-gray-700';

  // Chevron/collapse button color
  const chevronColor = isDark ? 'text-gray-400' : 'text-gray-500';

  // Hover/active states for collapse button
  const hoverBgClass = isDark
    ? 'hover:bg-gray-700/50 active:bg-gray-600/50'
    : 'hover:bg-gray-200 active:bg-gray-300';

  // Ring color when dragging
  const draggingRingClass = isDark
    ? 'ring-2 ring-blue-400/30'
    : 'ring-2 ring-blue-500/40';

  // Handle background when actively dragging
  const draggingHandleBg = isDark
    ? 'bg-gray-700/50'
    : 'bg-blue-50';

  return (
    <div
      ref={panelRef}
      className={`fixed shadow-lg rounded-xl overflow-hidden transition-shadow pointer-events-auto border ${panelBgClass} ${
        isDragging ? `shadow-2xl ${draggingRingClass}` : ''
      } ${className}`}
      style={{
        left: position.x,
        top: position.y,
        zIndex: effectiveZIndex,
        minWidth,
        minHeight: isCollapsed ? 'auto' : minHeight,
        willChange: isDragging ? 'transform' : 'auto',
        pointerEvents: 'auto',
      }}
      onClick={handlePanelClick}
    >
      {/* Drag Handle - min 44px height for iPad touch targets */}
      <div
        className={`flex items-center justify-between px-4 min-h-[44px] select-none ${handleBgClass} ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } ${isDragging ? draggingHandleBg : ''}`}
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className="flex items-center gap-3">
          {/* Drag indicator dots - larger for better visibility */}
          <div className="flex flex-col gap-1 py-2">
            <div className="flex gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
              <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            </div>
            <div className="flex gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
              <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            </div>
            <div className="flex gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
              <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            </div>
          </div>
          {title && (
            <span className={`text-sm font-medium ${titleColor}`}>{title}</span>
          )}
        </div>

        {onCollapse && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCollapse();
            }}
            className={`p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors ${hoverBgClass}`}
            aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            <svg
              className={`w-5 h-5 ${chevronColor} transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Panel Content */}
      {!isCollapsed && (
        <div className="p-3">
          {children}
        </div>
      )}
    </div>
  );
}

export default DraggablePanel;
