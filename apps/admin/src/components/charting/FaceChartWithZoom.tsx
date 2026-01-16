'use client'

/**
 * FaceChartWithZoom - Face chart with zoom and pan capabilities
 *
 * Wraps FaceChartCore with zoom/pan functionality:
 * - Pinch-to-zoom (two-finger gesture on touch devices)
 * - Mouse wheel zoom (with Ctrl/Cmd key)
 * - Two-finger pan when zoomed
 * - Single tap/click still adds injection points
 */

import React, { useCallback, useState, useEffect } from 'react'
import { FaceChartCore, FaceChartCoreProps } from './FaceChartCore'
import { useChartZoomPan } from '@/hooks/useChartZoomPan'
import { ZoomPanControls } from './ZoomPanControls'

export interface ZoomState {
  scale: number
  translateX: number
  translateY: number
}

export interface ZoomControls {
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  setScale: (scale: number) => void
}

export interface FaceChartWithZoomProps extends Omit<FaceChartCoreProps, 'zoom'> {
  /** Show zoom controls overlay */
  showControls?: boolean
  /** Position of zoom controls */
  controlsPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** Minimum zoom level (default: 0.5) */
  minScale?: number
  /** Maximum zoom level (default: 4) */
  maxScale?: number
  /** Selected dosage from floating product picker */
  selectedDosage?: number
  // Global action props for undo/redo/clear - always visible in toolbar
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  onClearAll?: () => void
  hasContent?: boolean
  // External zoom state management (optional - for bottom bar integration)
  onZoomStateChange?: (state: ZoomState, controls: ZoomControls, isZoomed: boolean) => void
}

export function FaceChartWithZoom({
  showControls = true,
  controlsPosition = 'bottom-right',
  minScale = 0.5,
  maxScale = 4,
  selectedDosage,
  // Global actions
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClearAll,
  hasContent,
  // External zoom state management
  onZoomStateChange,
  ...chartProps
}: FaceChartWithZoomProps) {
  // Debug: log the drawingMode being passed through
  console.log('[FaceChartWithZoom] chartProps.drawingMode:', (chartProps as any).drawingMode)
  // Track if user is in a zoom/pan gesture to prevent click events
  const [isGesturing, setIsGesturing] = useState(false)

  const {
    state,
    containerRef,
    contentRef,
    handlers,
    controls,
    isZoomed,
    isPanning,
    isAnimating
  } = useChartZoomPan({
    minScale,
    maxScale,
    onInteractionStart: () => setIsGesturing(true),
    onInteractionEnd: () => {
      // Small delay to prevent click events right after gesture ends
      setTimeout(() => setIsGesturing(false), 100)
    }
  })

  // NOTE: We do NOT wrap click handlers here - let them pass through to FaceChartCore
  // The FaceChartCore component handles its own click events for zone/freehand injection points

  // Notify parent of zoom state changes (for bottom bar integration)
  useEffect(() => {
    if (onZoomStateChange) {
      onZoomStateChange(state, controls, isZoomed)
    }
  }, [state, controls, isZoomed, onZoomStateChange])

  return (
    <div className="relative w-full h-full">
      {/* Zoom/Pan Container - Darker background with dot pattern */}
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden bg-gray-900 rounded-lg"
        onWheel={handlers.onWheel}
        onTouchStart={handlers.onTouchStart}
        onTouchMove={handlers.onTouchMove}
        onTouchEnd={handlers.onTouchEnd}
        onMouseDown={handlers.onMouseDown}
        onMouseMove={handlers.onMouseMove}
        onMouseUp={handlers.onMouseUp}
        onMouseLeave={handlers.onMouseLeave}
        style={{
          touchAction: 'none', // Let JavaScript handle all touch gestures (pinch-zoom, pan)
          cursor: isPanning ? 'grabbing' : isZoomed ? 'grab' : 'default',
          backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Zoomable Content - Floating card with lighter background */}
        <div
          ref={contentRef}
          className="w-full h-full bg-gray-800 border border-gray-700 rounded-lg shadow-2xl"
          style={{
            transform: `scale(${state.scale}) translate(${state.translateX / state.scale}px, ${state.translateY / state.scale}px)`,
            transformOrigin: 'center center',
            willChange: 'transform',
            transition: isAnimating ? 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
          }}
        >
          <FaceChartCore
            {...chartProps}
            zoom={state.scale}
            selectedDosage={selectedDosage}
          />
        </div>
      </div>

      {/* Zoom Controls Overlay with Global Actions */}
      {showControls && (
        <ZoomPanControls
          scale={state.scale}
          isZoomed={isZoomed}
          isPanning={isPanning}
          onZoomIn={controls.zoomIn}
          onZoomOut={controls.zoomOut}
          onReset={controls.resetZoom}
          minScale={minScale}
          maxScale={maxScale}
          position={controlsPosition}
          // Global actions - always visible
          onUndo={onUndo}
          onRedo={onRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          onClearAll={onClearAll}
          hasContent={hasContent}
        />
      )}

      {/* Zoom hint for users (shows briefly on first interaction) */}
      {!isZoomed && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="px-3 py-1.5 bg-gray-800/80 backdrop-blur-sm text-white text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            Pinch to zoom or Ctrl+scroll
          </div>
        </div>
      )}
    </div>
  )
}

export default FaceChartWithZoom
