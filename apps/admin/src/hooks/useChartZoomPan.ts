'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'

export interface ZoomPanState {
  scale: number
  translateX: number
  translateY: number
}

export interface UseChartZoomPanOptions {
  minScale?: number
  maxScale?: number
  initialScale?: number
  onInteractionStart?: () => void
  onInteractionEnd?: () => void
  /** Enable momentum/inertia on pan release (default: true) */
  enableMomentum?: boolean
  /** Friction factor for momentum (0-1, lower = more friction, default: 0.92) */
  momentumFriction?: number
}

export interface UseChartZoomPanReturn {
  state: ZoomPanState
  containerRef: React.RefObject<HTMLDivElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
  handlers: {
    onWheel: (e: React.WheelEvent) => void
    onTouchStart: (e: React.TouchEvent) => void
    onTouchMove: (e: React.TouchEvent) => void
    onTouchEnd: (e: React.TouchEvent) => void
    onMouseDown: (e: React.MouseEvent) => void
    onMouseMove: (e: React.MouseEvent) => void
    onMouseUp: (e: React.MouseEvent) => void
    onMouseLeave: (e: React.MouseEvent) => void
  }
  controls: {
    zoomIn: () => void
    zoomOut: () => void
    resetZoom: () => void
    setScale: (scale: number) => void
  }
  isZoomed: boolean
  isPanning: boolean
  /** Whether CSS transitions should be enabled (disabled during active gestures) */
  isAnimating: boolean
}

/**
 * Custom hook for smooth zoom and pan functionality on chart components.
 * Optimized for 60fps performance with:
 * - requestAnimationFrame batching
 * - CSS transform hardware acceleration
 * - Momentum/inertia on pan release
 * - Smart transition toggling (off during gestures, on for animations)
 *
 * Supports:
 * - Pinch-to-zoom (two-finger gesture)
 * - Mouse wheel zoom (with Ctrl/Cmd)
 * - Two-finger pan when zoomed
 * - Mouse drag pan when zoomed
 * - Single tap/click still passes through for adding points
 */
export function useChartZoomPan(options: UseChartZoomPanOptions = {}): UseChartZoomPanReturn {
  const {
    minScale = 0.5,
    maxScale = 5,
    initialScale = 1,
    onInteractionStart,
    onInteractionEnd,
    enableMomentum = true,
    momentumFriction = 0.92
  } = options

  // State - only updated at end of gestures for React re-renders
  const [state, setState] = useState<ZoomPanState>({
    scale: initialScale,
    translateX: 0,
    translateY: 0
  })
  const [isPanning, setIsPanning] = useState(false)
  const [isAnimating, setIsAnimating] = useState(true)

  // Refs for smooth, render-free updates during gestures
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Current transform values (updated without triggering re-renders)
  const currentTransform = useRef<ZoomPanState>({
    scale: initialScale,
    translateX: 0,
    translateY: 0
  })

  // Interaction tracking refs
  const lastTouchDistanceRef = useRef<number | null>(null)
  const lastTouchCenterRef = useRef<{ x: number; y: number } | null>(null)
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null)
  const isDraggingRef = useRef(false)
  const touchCountRef = useRef(0)
  const initialPinchScaleRef = useRef<number>(1)

  // Momentum/velocity tracking
  const velocityRef = useRef({ x: 0, y: 0 })
  const lastMoveTimeRef = useRef(0)
  const momentumRAFRef = useRef<number | null>(null)

  // ============================================================================
  // RUBBER-BAND EFFECT
  // When dragging past bounds, allow slight overshoot with resistance.
  // On release, spring back to clamped bounds for a natural iOS-like feel.
  // ============================================================================
  const springBackRAFRef = useRef<number | null>(null)
  const RUBBER_BAND_RESISTANCE = 0.3  // Damping factor for movement past bounds (0-1, lower = more resistance)
  const MAX_OVERSHOOT = 50            // Maximum pixels allowed past bounds
  const SPRING_STIFFNESS = 0.15       // Spring animation speed (higher = faster snap back)
  const SPRING_DAMPING = 0.75         // Spring damping (lower = more bounce, higher = smoother)

  // RAF batching
  const rafRef = useRef<number | null>(null)
  const pendingUpdateRef = useRef<ZoomPanState | null>(null)

  // Clamp value between min and max
  const clamp = useCallback((value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max)
  }, [])

  // Check if effectively at base scale (with floating point tolerance)
  // Use a very small tolerance to avoid false positives during active pinch gestures
  // where scale might fluctuate slightly around 1.0
  const isAtBaseScale = useCallback((scale: number) => {
    return scale < 1.005
  }, [])

  // Calculate distance between two touch points
  const getTouchDistance = useCallback((touches: React.TouchList | TouchList) => {
    if (touches.length < 2) return 0
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.hypot(dx, dy)
  }, [])

  // Calculate center point between two touches
  const getTouchCenter = useCallback((touches: React.TouchList | TouchList) => {
    if (touches.length < 2) {
      return { x: touches[0].clientX, y: touches[0].clientY }
    }
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    }
  }, [])

  // Calculate bounds for panning based on current scale
  // Smart bounds: allow access to entire image (face, neck, ears, forehead)
  // but prevent panning into infinite empty space
  const getBounds = useCallback((scale: number) => {
    const container = containerRef.current

    // Only return zero bounds when truly at base scale
    // If container is not ready, return generous bounds to avoid snap-to-center
    if (!container) {
      // Container not ready - return generous bounds rather than zero
      // This prevents snap-to-center while component is mounting
      const fallbackSize = 500
      const fallbackBound = fallbackSize * 0.5
      return { minX: -fallbackBound, maxX: fallbackBound, minY: -fallbackBound, maxY: fallbackBound }
    }

    if (isAtBaseScale(scale)) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 }
    }

    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Smart bounds formula:
    // - At any zoom level, the visible area is (1/scale) of the total image
    // - To see edges, we need to pan by the "hidden" fraction of the image
    // - Add padding for comfortable viewing of edges (ears, forehead, neck)
    //
    // Example at 2x zoom:
    // - Visible fraction: 50% of image
    // - Hidden fraction: 50% (need to pan this much to see edges)
    // - With 20% padding: can pan ~70% of container size
    //
    // Example at 4x zoom:
    // - Visible fraction: 25% of image
    // - Hidden fraction: 75%
    // - With 20% padding: can pan ~95% of container size

    const visibleFraction = 1 / scale // e.g., 0.5 at 2x zoom
    const hiddenFraction = 1 - visibleFraction // e.g., 0.5 at 2x zoom

    // Standard padding for left, right, top
    const standardPadding = 0.25

    // EXTRA padding for bottom (neck area) - much more generous for neck botox work
    const bottomPadding = 0.8 // 80% extra for neck viewing

    const maxPanX = (containerWidth * hiddenFraction / 2) + (containerWidth * standardPadding)

    // Top edge - standard padding
    const maxPanYTop = (containerHeight * hiddenFraction / 2) + (containerHeight * standardPadding)

    // Bottom edge - EXTRA padding for neck
    const maxPanYBottom = (containerHeight * hiddenFraction / 2) + (containerHeight * bottomPadding)

    return {
      minX: -maxPanX,
      maxX: maxPanX,
      minY: -maxPanYBottom,  // Bottom (neck) - EXTRA padding (drag UP = negative translateY)
      maxY: maxPanYTop       // Top (forehead) - standard (drag DOWN = positive translateY)
    }
  }, [isAtBaseScale])

  // Apply transform directly to DOM (bypasses React for smoothness)
  const applyTransformToDOM = useCallback((transform: ZoomPanState) => {
    if (!contentRef.current) return

    const { scale, translateX, translateY } = transform
    contentRef.current.style.transform =
      `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`
  }, [])

  // Batched update using requestAnimationFrame
  const scheduleUpdate = useCallback((newTransform: ZoomPanState) => {
    pendingUpdateRef.current = newTransform
    currentTransform.current = newTransform

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        if (pendingUpdateRef.current) {
          applyTransformToDOM(pendingUpdateRef.current)
          pendingUpdateRef.current = null
        }
        rafRef.current = null
      })
    }
  }, [applyTransformToDOM])

  // ============================================================================
  // CORNER-SPECIFIC DIAGONAL BOUNDS
  // ============================================================================
  // Problem: Rectangular bounds limit diagonal access to neck corners.
  // When panning diagonally to bottom-left or bottom-right, you might hit
  // the X limit before reaching the neck corner you want to view.
  //
  // Solution: Expand X bounds when in the bottom region (neck area).
  // The further down (toward the neck), the more X range is allowed.
  // This creates a graduated/tapered bounds shape that gives better
  // diagonal access to the bottom corners of the image.
  //
  // Visual representation of bounds shape:
  //   Standard rectangular bounds:     With diagonal corner expansion:
  //   +------------------+             +------------------+
  //   |                  |             |                  |
  //   |                  |             |                  |
  //   |                  |            /                    \
  //   +------------------+           +----------------------+
  //                                  (wider at bottom for neck corners)
  //
  const clampWithCornerExpansion = useCallback((
    x: number,
    y: number,
    bounds: { minX: number; maxX: number; minY: number; maxY: number }
  ): { x: number; y: number } => {
    // Check if we're in the bottom region (neck area)
    // Negative translateY means the image is shifted up, showing the bottom/neck area
    const isInBottomRegion = y < 0

    let effectiveMinX = bounds.minX
    let effectiveMaxX = bounds.maxX

    if (isInBottomRegion && bounds.minY !== 0) {
      // Calculate how far into the bottom region we are (0 to 1)
      // y is negative, bounds.minY is negative, so we use absolute values
      const bottomProgress = Math.min(1, Math.abs(y) / Math.abs(bounds.minY))

      // Expand X bounds by up to 25% more at the very bottom of the neck region
      // This allows diagonal panning to reach the neck corners more easily
      // The expansion is gradual: 0% expansion at center, 25% at full bottom extent
      const maxExpansionFactor = 0.25
      const xExpansion = 1 + (bottomProgress * maxExpansionFactor)

      // Apply expansion to both left and right bounds
      // Since bounds are negative/positive, multiplying by expansion factor works correctly
      effectiveMinX = bounds.minX * xExpansion
      effectiveMaxX = bounds.maxX * xExpansion
    }

    return {
      x: Math.max(effectiveMinX, Math.min(effectiveMaxX, x)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, y))
    }
  }, [])

  // Apply bounded translation
  // IMPORTANT: This function should never abruptly snap to center during active panning.
  // Only return {0,0} when truly at base scale (scale very close to 1.0)
  const applyBoundedTranslation = useCallback((x: number, y: number, scale: number): { x: number; y: number } => {
    // Only zero out translation when scale is very close to 1.0
    // Use stricter check to avoid snap-to-center during active gestures
    if (isAtBaseScale(scale)) {
      return { x: 0, y: 0 }
    }

    const bounds = getBounds(scale)

    // Safety check: if bounds are all zero (shouldn't happen when zoomed), preserve current position
    // This prevents unexpected snapping to center
    if (bounds.minX === 0 && bounds.maxX === 0 && bounds.minY === 0 && bounds.maxY === 0) {
      // Log for debugging - this indicates a logic error
      console.warn('[useChartZoomPan] getBounds returned zero bounds at scale:', scale)
      return { x, y }
    }

    // Use corner-aware clamping for better diagonal access to neck corners
    return clampWithCornerExpansion(x, y, bounds)
  }, [getBounds, clampWithCornerExpansion, isAtBaseScale])

  // ============================================================================
  // RUBBER-BAND TRANSLATION (for active dragging)
  // Allows overshoot past bounds with increasing resistance, like iOS scroll bounce.
  // Returns the "display" position which may be past bounds, capped at MAX_OVERSHOOT.
  // ============================================================================
  const applyRubberBandTranslation = useCallback((x: number, y: number, scale: number): {
    x: number;
    y: number;
    isOvershootX: boolean;
    isOvershootY: boolean
  } => {
    // At base scale, no panning allowed
    if (isAtBaseScale(scale)) {
      return { x: 0, y: 0, isOvershootX: false, isOvershootY: false }
    }

    const bounds = getBounds(scale)

    // Safety check for zero bounds
    if (bounds.minX === 0 && bounds.maxX === 0 && bounds.minY === 0 && bounds.maxY === 0) {
      return { x, y, isOvershootX: false, isOvershootY: false }
    }

    let finalX = x
    let finalY = y
    let isOvershootX = false
    let isOvershootY = false

    // Apply rubber-band effect on X axis
    if (x < bounds.minX) {
      // Past left edge: apply resistance and cap overshoot
      const overshoot = bounds.minX - x  // positive value
      const dampedOvershoot = Math.min(overshoot * RUBBER_BAND_RESISTANCE, MAX_OVERSHOOT)
      finalX = bounds.minX - dampedOvershoot
      isOvershootX = true
    } else if (x > bounds.maxX) {
      // Past right edge: apply resistance and cap overshoot
      const overshoot = x - bounds.maxX  // positive value
      const dampedOvershoot = Math.min(overshoot * RUBBER_BAND_RESISTANCE, MAX_OVERSHOOT)
      finalX = bounds.maxX + dampedOvershoot
      isOvershootX = true
    }

    // Apply rubber-band effect on Y axis
    if (y < bounds.minY) {
      // Past bottom edge (neck area): apply resistance and cap overshoot
      const overshoot = bounds.minY - y  // positive value
      const dampedOvershoot = Math.min(overshoot * RUBBER_BAND_RESISTANCE, MAX_OVERSHOOT)
      finalY = bounds.minY - dampedOvershoot
      isOvershootY = true
    } else if (y > bounds.maxY) {
      // Past top edge (forehead): apply resistance and cap overshoot
      const overshoot = y - bounds.maxY  // positive value
      const dampedOvershoot = Math.min(overshoot * RUBBER_BAND_RESISTANCE, MAX_OVERSHOOT)
      finalY = bounds.maxY + dampedOvershoot
      isOvershootY = true
    }

    return { x: finalX, y: finalY, isOvershootX, isOvershootY }
  }, [getBounds, isAtBaseScale, RUBBER_BAND_RESISTANCE, MAX_OVERSHOOT])

  // ============================================================================
  // SPRING-BACK ANIMATION
  // Called on touch/mouse release when position is past bounds.
  // Animates smoothly back to the clamped boundary position using spring physics.
  // Has priority over momentum - if in overshoot, spring back first.
  // ============================================================================
  const startSpringBack = useCallback((): boolean => {
    // Cancel any existing spring-back animation
    if (springBackRAFRef.current !== null) {
      cancelAnimationFrame(springBackRAFRef.current)
      springBackRAFRef.current = null
    }

    const current = currentTransform.current
    const bounds = getBounds(current.scale)

    // Determine target position (clamped to bounds)
    const targetX = clamp(current.translateX, bounds.minX, bounds.maxX)
    const targetY = clamp(current.translateY, bounds.minY, bounds.maxY)

    // Check if we're actually in overshoot (with small tolerance for floating point)
    const isInOvershoot =
      Math.abs(current.translateX - targetX) > 0.5 ||
      Math.abs(current.translateY - targetY) > 0.5

    if (!isInOvershoot) {
      // Not in overshoot, proceed with normal behavior
      return false
    }

    // We're in overshoot - animate back to bounds
    // Spring-back takes priority, so kill momentum velocity
    velocityRef.current = { x: 0, y: 0 }
    if (momentumRAFRef.current !== null) {
      cancelAnimationFrame(momentumRAFRef.current)
      momentumRAFRef.current = null
    }

    // Spring velocity for smooth animation
    let springVelocityX = 0
    let springVelocityY = 0

    const animate = () => {
      const curr = currentTransform.current

      // Calculate spring force (displacement from target)
      const displacementX = curr.translateX - targetX
      const displacementY = curr.translateY - targetY

      // Spring physics: F = -kx (restoring force proportional to displacement)
      // velocity += force, position += velocity
      // With damping: velocity *= damping
      springVelocityX += -displacementX * SPRING_STIFFNESS
      springVelocityY += -displacementY * SPRING_STIFFNESS
      springVelocityX *= SPRING_DAMPING
      springVelocityY *= SPRING_DAMPING

      const newX = curr.translateX + springVelocityX
      const newY = curr.translateY + springVelocityY

      const newTransform = {
        ...curr,
        translateX: newX,
        translateY: newY
      }

      scheduleUpdate(newTransform)

      // Check if animation is complete (close enough to target and velocity low)
      const distanceToTarget = Math.hypot(newX - targetX, newY - targetY)
      const velocity = Math.hypot(springVelocityX, springVelocityY)

      if (distanceToTarget < 0.5 && velocity < 0.5) {
        // Snap to exact target position
        const finalTransform = {
          ...curr,
          translateX: targetX,
          translateY: targetY
        }
        scheduleUpdate(finalTransform)
        setState(finalTransform)
        springBackRAFRef.current = null
      } else {
        // Continue animation
        springBackRAFRef.current = requestAnimationFrame(animate)
      }
    }

    springBackRAFRef.current = requestAnimationFrame(animate)
    return true // Indicates spring-back was started
  }, [getBounds, clamp, scheduleUpdate, SPRING_STIFFNESS, SPRING_DAMPING])

  // Stop spring-back animation (called when starting a new drag)
  const stopSpringBack = useCallback(() => {
    if (springBackRAFRef.current !== null) {
      cancelAnimationFrame(springBackRAFRef.current)
      springBackRAFRef.current = null
    }
  }, [])

  // Stop momentum animation
  const stopMomentum = useCallback(() => {
    if (momentumRAFRef.current !== null) {
      cancelAnimationFrame(momentumRAFRef.current)
      momentumRAFRef.current = null
    }
    velocityRef.current = { x: 0, y: 0 }
  }, [])

  // Start momentum animation
  const startMomentum = useCallback(() => {
    if (!enableMomentum) return

    const { x: vx, y: vy } = velocityRef.current
    if (Math.abs(vx) < 0.5 && Math.abs(vy) < 0.5) {
      // Velocity too low, just sync state
      setState(currentTransform.current)
      return
    }

    const animate = () => {
      const current = currentTransform.current
      velocityRef.current.x *= momentumFriction
      velocityRef.current.y *= momentumFriction

      const bounded = applyBoundedTranslation(
        current.translateX + velocityRef.current.x,
        current.translateY + velocityRef.current.y,
        current.scale
      )

      const newTransform = {
        ...current,
        translateX: bounded.x,
        translateY: bounded.y
      }

      scheduleUpdate(newTransform)

      // Continue animation if velocity is still significant
      if (Math.abs(velocityRef.current.x) > 0.5 || Math.abs(velocityRef.current.y) > 0.5) {
        momentumRAFRef.current = requestAnimationFrame(animate)
      } else {
        momentumRAFRef.current = null
        setState(newTransform)
      }
    }

    momentumRAFRef.current = requestAnimationFrame(animate)
  }, [enableMomentum, momentumFriction, applyBoundedTranslation, scheduleUpdate])

  // Sync state with current transform (call after gesture ends)
  const syncState = useCallback(() => {
    setState(currentTransform.current)
  }, [])

  /**
   * ============================================================================
   * ZOOM-TO-POINT CALCULATION
   * ============================================================================
   * When zooming, we want the point under the cursor/finger to stay in place.
   * This creates an intuitive zoom experience where users can pinch directly
   * on an area (like the neck) and zoom right into it without needing to
   * zoom first and then pan.
   *
   * Math explanation:
   * - The container uses transform-origin: center, so we work relative to center
   * - Find the content point under the zoom origin (in content coordinates)
   * - After scale change, adjust translation so that point stays at the same screen position
   *
   * Formula derivation:
   * 1. Screen position = contentPoint * scale + translate (relative to center)
   * 2. contentPoint = (screenPos - translate) / scale
   * 3. To keep screenPos fixed after zoom: newTranslate = screenPos - contentPoint * newScale
   *
   * @param zoomOriginX - X position relative to container left edge (screen coords)
   * @param zoomOriginY - Y position relative to container top edge (screen coords)
   * @param containerWidth - Width of the container
   * @param containerHeight - Height of the container
   * @param oldScale - Scale before zoom
   * @param newScale - Scale after zoom
   * @param oldTranslateX - Translation X before zoom
   * @param oldTranslateY - Translation Y before zoom
   * @returns New translation values to keep zoom origin stationary
   */
  const calculateZoomToPoint = useCallback((
    zoomOriginX: number,
    zoomOriginY: number,
    containerWidth: number,
    containerHeight: number,
    oldScale: number,
    newScale: number,
    oldTranslateX: number,
    oldTranslateY: number
  ): { translateX: number; translateY: number } => {
    // The container uses transform-origin: center, so work relative to center
    const centerX = containerWidth / 2
    const centerY = containerHeight / 2

    // Convert zoom origin to be relative to container center
    const originFromCenterX = zoomOriginX - centerX
    const originFromCenterY = zoomOriginY - centerY

    // Find the content point under the zoom origin (in content coordinates)
    // Screen position = contentPoint * scale + translate
    // So: contentPoint = (screenPos - translate) / scale
    const contentPointX = (originFromCenterX - oldTranslateX) / oldScale
    const contentPointY = (originFromCenterY - oldTranslateY) / oldScale

    // After zoom, we want the same content point to appear at the same screen position
    // newScreenPos = contentPoint * newScale + newTranslate
    // We want newScreenPos = originFromCenter (keep it stationary)
    // So: newTranslate = originFromCenter - contentPoint * newScale
    const newTranslateX = originFromCenterX - contentPointX * newScale
    const newTranslateY = originFromCenterY - contentPointY * newScale

    return { translateX: newTranslateX, translateY: newTranslateY }
  }, [])

  // Handle mouse wheel zoom with zoom-to-point (zooms toward mouse cursor position)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Zoom with Ctrl/Cmd key or trackpad pinch
    if (!e.ctrlKey && !e.metaKey) return

    e.preventDefault()
    stopMomentum()

    // Smoother zoom factor
    const zoomIntensity = 0.002
    const delta = -e.deltaY * zoomIntensity
    const current = currentTransform.current

    // Calculate new scale with smooth easing
    const newScale = clamp(current.scale * (1 + delta), minScale, maxScale)

    // Get container bounds for zoom-to-point calculation
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      // Mouse position relative to container left/top edge
      // (calculateZoomToPoint handles the center offset internally)
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // Calculate new translation to keep the point under mouse cursor stationary
      const { translateX: newTranslateX, translateY: newTranslateY } = calculateZoomToPoint(
        mouseX,
        mouseY,
        rect.width,
        rect.height,
        current.scale,
        newScale,
        current.translateX,
        current.translateY
      )

      // Apply bounds after zoom-to-point adjustment
      let finalTranslateX = newTranslateX
      let finalTranslateY = newTranslateY

      if (isAtBaseScale(newScale)) {
        finalTranslateX = 0
        finalTranslateY = 0
      } else {
        const bounded = applyBoundedTranslation(newTranslateX, newTranslateY, newScale)
        finalTranslateX = bounded.x
        finalTranslateY = bounded.y
      }

      const newTransform = {
        scale: newScale,
        translateX: finalTranslateX,
        translateY: finalTranslateY
      }

      scheduleUpdate(newTransform)
      setState(newTransform)
    }
  }, [minScale, maxScale, clamp, stopMomentum, calculateZoomToPoint, applyBoundedTranslation, scheduleUpdate, isAtBaseScale])

  // Handle touch start - NOW A NO-OP
  // Touch handling is done via native event listeners in the useEffect below
  // to ensure non-passive listeners that allow preventDefault()
  const handleTouchStart = useCallback((_e: React.TouchEvent) => {
    // All touch handling is now done via native event listeners
    // This React handler is kept for API compatibility but does nothing
  }, [])

  // Handle touch move - NOW A NO-OP
  // Touch handling is done via native event listeners in the useEffect below
  // to ensure non-passive listeners that allow preventDefault()
  const handleTouchMove = useCallback((_e: React.TouchEvent) => {
    // All touch handling is now done via native event listeners
    // This React handler is kept for API compatibility but does nothing
  }, [])

  // Handle touch end - NOW A NO-OP
  // Touch handling is done via native event listeners in the useEffect below
  // to ensure non-passive listeners that allow preventDefault()
  const handleTouchEnd = useCallback((_e: React.TouchEvent) => {
    // All touch handling is now done via native event listeners
    // This React handler is kept for API compatibility but does nothing
  }, [])

  // Handle mouse down - DISABLED for panning
  // On iPad, Apple Pencil triggers mouse events. If we captured mouse drag for panning,
  // it would interfere with stylus point placement. All panning must be two-finger touch only.
  // Desktop users can use Ctrl+scroll to zoom and trackpad gestures.
  const handleMouseDown = useCallback((_e: React.MouseEvent) => {
    // INTENTIONALLY EMPTY - mouse clicks pass through to chart for point placement
    // Do NOT capture mouse events for panning - this breaks Apple Pencil stylus
  }, [])

  // Handle mouse move - DISABLED for panning (see handleMouseDown comment)
  const handleMouseMove = useCallback((_e: React.MouseEvent) => {
    // INTENTIONALLY EMPTY - mouse drag panning disabled to allow Apple Pencil point placement
  }, [])

  // Handle mouse up - DISABLED for panning (see handleMouseDown comment)
  const handleMouseUp = useCallback(() => {
    // INTENTIONALLY EMPTY - mouse drag panning disabled
  }, [])

  // Handle mouse leave - DISABLED for panning (see handleMouseDown comment)
  const handleMouseLeave = useCallback(() => {
    // INTENTIONALLY EMPTY - mouse drag panning disabled
  }, [])

  // Control functions with smooth animation
  const zoomIn = useCallback(() => {
    stopMomentum()
    setIsAnimating(true)
    const current = currentTransform.current
    const newScale = clamp(current.scale * 1.5, minScale, maxScale)
    const newTransform = {
      scale: newScale,
      translateX: isAtBaseScale(newScale) ? 0 : current.translateX,
      translateY: isAtBaseScale(newScale) ? 0 : current.translateY
    }
    currentTransform.current = newTransform
    applyTransformToDOM(newTransform)
    setState(newTransform)
  }, [minScale, maxScale, clamp, stopMomentum, applyTransformToDOM, isAtBaseScale])

  const zoomOut = useCallback(() => {
    stopMomentum()
    setIsAnimating(true)
    const current = currentTransform.current
    const newScale = clamp(current.scale / 1.5, minScale, maxScale)
    const bounded = applyBoundedTranslation(current.translateX, current.translateY, newScale)
    const newTransform = {
      scale: newScale,
      translateX: isAtBaseScale(newScale) ? 0 : bounded.x,
      translateY: isAtBaseScale(newScale) ? 0 : bounded.y
    }
    currentTransform.current = newTransform
    applyTransformToDOM(newTransform)
    setState(newTransform)
  }, [minScale, maxScale, clamp, stopMomentum, applyBoundedTranslation, applyTransformToDOM, isAtBaseScale])

  const resetZoom = useCallback(() => {
    stopMomentum()
    setIsAnimating(true)
    const newTransform = {
      scale: 1,
      translateX: 0,
      translateY: 0
    }
    currentTransform.current = newTransform
    applyTransformToDOM(newTransform)
    setState(newTransform)
  }, [stopMomentum, applyTransformToDOM])

  const setScale = useCallback((scale: number) => {
    stopMomentum()
    setIsAnimating(true)
    const newScale = clamp(scale, minScale, maxScale)
    const current = currentTransform.current
    const bounded = applyBoundedTranslation(current.translateX, current.translateY, newScale)
    const newTransform = {
      scale: newScale,
      translateX: isAtBaseScale(newScale) ? 0 : bounded.x,
      translateY: isAtBaseScale(newScale) ? 0 : bounded.y
    }
    currentTransform.current = newTransform
    applyTransformToDOM(newTransform)
    setState(newTransform)
  }, [minScale, maxScale, clamp, stopMomentum, applyBoundedTranslation, applyTransformToDOM, isAtBaseScale])

  // Prevent default on wheel and touch events for the container
  // CRITICAL: Native event listeners are required because React's synthetic events
  // are passive by default, which prevents preventDefault() from working.
  // Two-finger pinch-to-zoom requires non-passive listeners for BOTH touchstart AND touchmove.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const preventWheelDefault = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
      }
    }

    // Touch start handler - MUST be non-passive for two-finger gestures
    // This prevents the browser from initiating its native pinch-to-zoom
    const handleNativeTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()
        // Also call our React handler logic for state tracking
        touchCountRef.current = e.touches.length
        stopMomentum()
        stopSpringBack()

        setIsAnimating(false)
        setIsPanning(true)
        onInteractionStart?.()

        lastTouchDistanceRef.current = getTouchDistance(e.touches)
        lastTouchCenterRef.current = getTouchCenter(e.touches)
        initialPinchScaleRef.current = currentTransform.current.scale
        velocityRef.current = { x: 0, y: 0 }
        lastMoveTimeRef.current = performance.now()
      }
      // NOTE: Single finger touches pass through for point placement
    }

    // Touch move handler - MUST be non-passive for two-finger gestures
    const handleNativeTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault()

        const now = performance.now()
        const dt = Math.max(1, now - lastMoveTimeRef.current)

        const currentDistance = getTouchDistance(e.touches)
        const currentCenter = getTouchCenter(e.touches)
        const current = currentTransform.current

        // Get container rect for zoom-to-point calculation
        const rect = container.getBoundingClientRect()

        let newScale = current.scale
        let newTranslateX = current.translateX
        let newTranslateY = current.translateY

        // Handle pinch-to-zoom with ZOOM-TO-POINT
        if (lastTouchDistanceRef.current !== null && lastTouchDistanceRef.current > 0) {
          const pinchRatio = currentDistance / lastTouchDistanceRef.current
          newScale = clamp(current.scale * pinchRatio, minScale, maxScale)

          // Apply zoom-to-point: keep the pinch center stationary during zoom
          if (rect && newScale !== current.scale) {
            const pinchCenterX = currentCenter.x - rect.left
            const pinchCenterY = currentCenter.y - rect.top

            const zoomAdjusted = calculateZoomToPoint(
              pinchCenterX,
              pinchCenterY,
              rect.width,
              rect.height,
              current.scale,
              newScale,
              current.translateX,
              current.translateY
            )

            newTranslateX = zoomAdjusted.translateX
            newTranslateY = zoomAdjusted.translateY
          }
        }

        // Handle two-finger pan (on top of zoom-to-point adjustment)
        if (lastTouchCenterRef.current !== null) {
          const deltaX = currentCenter.x - lastTouchCenterRef.current.x
          const deltaY = currentCenter.y - lastTouchCenterRef.current.y

          velocityRef.current = {
            x: deltaX * (16 / dt),
            y: deltaY * (16 / dt)
          }

          newTranslateX = newTranslateX + deltaX
          newTranslateY = newTranslateY + deltaY
        }

        // Reset translation if zoomed out
        if (isAtBaseScale(newScale)) {
          newTranslateX = 0
          newTranslateY = 0
        } else {
          const bounded = applyBoundedTranslation(newTranslateX, newTranslateY, newScale)
          newTranslateX = bounded.x
          newTranslateY = bounded.y
        }

        lastTouchDistanceRef.current = currentDistance
        lastTouchCenterRef.current = currentCenter
        lastMoveTimeRef.current = now

        scheduleUpdate({
          scale: newScale,
          translateX: newTranslateX,
          translateY: newTranslateY
        })
      }
      // NOTE: Single finger moves pass through for point placement
    }

    // Touch end handler
    const handleNativeTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        lastTouchDistanceRef.current = null
      }

      if (e.touches.length === 0) {
        lastTouchCenterRef.current = null
        setIsPanning(false)
        setIsAnimating(true)
        onInteractionEnd?.()

        const didSpringBack = startSpringBack()
        if (!didSpringBack) {
          startMomentum()
        }
      }

      touchCountRef.current = e.touches.length
    }

    // Add native event listeners with { passive: false } to allow preventDefault
    container.addEventListener('wheel', preventWheelDefault, { passive: false })
    container.addEventListener('touchstart', handleNativeTouchStart, { passive: false })
    container.addEventListener('touchmove', handleNativeTouchMove, { passive: false })
    container.addEventListener('touchend', handleNativeTouchEnd, { passive: false })

    return () => {
      container.removeEventListener('wheel', preventWheelDefault)
      container.removeEventListener('touchstart', handleNativeTouchStart)
      container.removeEventListener('touchmove', handleNativeTouchMove)
      container.removeEventListener('touchend', handleNativeTouchEnd)
    }
  }, [
    minScale,
    maxScale,
    clamp,
    getTouchDistance,
    getTouchCenter,
    calculateZoomToPoint,
    applyBoundedTranslation,
    scheduleUpdate,
    isAtBaseScale,
    stopMomentum,
    stopSpringBack,
    startMomentum,
    startSpringBack,
    onInteractionStart,
    onInteractionEnd
  ])

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
      if (momentumRAFRef.current !== null) {
        cancelAnimationFrame(momentumRAFRef.current)
      }
      // Also cleanup spring-back animation
      if (springBackRAFRef.current !== null) {
        cancelAnimationFrame(springBackRAFRef.current)
      }
    }
  }, [])

  // Memoize handlers to prevent unnecessary re-renders
  const handlers = useMemo(() => ({
    onWheel: handleWheel,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave
  }), [handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave])

  // Memoize controls to prevent infinite loop in parent useEffect
  const controls = useMemo(() => ({
    zoomIn,
    zoomOut,
    resetZoom,
    setScale
  }), [zoomIn, zoomOut, resetZoom, setScale])

  // Memoize isZoomed to prevent unnecessary re-renders
  const isZoomed = useMemo(() => state.scale >= 1.005, [state.scale])

  return {
    state,
    containerRef,
    contentRef,
    handlers,
    controls,
    isZoomed,
    isPanning,
    isAnimating
  }
}
