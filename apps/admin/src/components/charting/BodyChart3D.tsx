'use client'

import React, { Suspense, useRef, useState, useCallback, useMemo, memo, startTransition, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Html, Environment } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import {
  useChartingSettings
} from '@/contexts/ChartingSettingsContext'
import {
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  Droplets,
  Target,
  Keyboard,
  X,
  Undo2,
  Redo2,
  Trash2,
  Copy,
  User,
  Users
} from 'lucide-react'
import toast from 'react-hot-toast'
import { InjectionPoint3D } from './FaceChart3D'

// =============================================================================
// TYPES
// =============================================================================

type BodyType = 'torso' | 'full'
type Gender = 'male' | 'female'

interface BodyChart3DProps {
  productType: 'neurotoxin' | 'filler'
  productId?: string // Specific product ID for layer tracking (e.g., 'botox', 'juvederm-ultra')
  injectionPoints: Map<string, InjectionPoint3D>
  onInjectionPointsChange: (points: Map<string, InjectionPoint3D>) => void
  onSave?: () => void
  readOnly?: boolean
  // Optional external control of gender and body type
  gender?: Gender
  bodyType?: BodyType
}

// =============================================================================
// 3D BODY MODEL COMPONENT
// =============================================================================

function BodyModel({
  modelPath,
  productType,
  injectionPoints,
  onAddPoint,
  onSelectPoint,
  selectedPointId,
  readOnly
}: {
  modelPath: string
  productType: 'neurotoxin' | 'filler'
  injectionPoints: Map<string, InjectionPoint3D>
  onAddPoint: (position: THREE.Vector3) => void
  onSelectPoint: (id: string | null) => void
  selectedPointId: string | null
  readOnly?: boolean
}) {
  const { scene } = useGLTF(modelPath)
  const meshRef = useRef<THREE.Group>(null)
  const { camera, raycaster, pointer } = useThree()

  // OPTIMIZED: Track pointer state for instant tap detection
  const pointerDownTime = useRef<number>(0)
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null)
  const pointerTypeRef = useRef<string>('mouse')

  // Clone the scene to avoid mutation issues
  const clonedScene = useMemo(() => scene.clone(), [scene])

  // OPTIMIZED: Track pointer down with timestamp for instant detection
  const handlePointerDown = useCallback((event: any) => {
    pointerDownTime.current = performance.now()
    pointerDownPos.current = { x: event.clientX, y: event.clientY }
    // Track pointer type for Apple Pencil detection
    pointerTypeRef.current = event.pointerType || 'mouse'
  }, [])

  // OPTIMIZED: Use pointerUp instead of click for faster response
  // pointerUp fires immediately on release, click waits for full cycle
  // APPLE PENCIL FIX: Pencil has smaller contact area, so we use more forgiving thresholds
  const handlePointerUp = useCallback((event: any) => {
    if (readOnly) return
    if (!pointerDownPos.current) return

    const pointerType = event.pointerType || pointerTypeRef.current

    // APPLE PENCIL FIX: Use more forgiving thresholds for pen/stylus
    // Pencil taps can have slight movement and may be faster than finger taps
    const isPen = pointerType === 'pen'
    const TAP_THRESHOLD_PX = isPen ? 15 : 5  // Larger threshold for pencil (smaller contact area)
    const TAP_MAX_TIME_MS = isPen ? 500 : 200 // More time for pencil taps

    // OPTIMIZED: Calculate time and distance immediately
    const elapsed = performance.now() - pointerDownTime.current
    const dx = event.clientX - pointerDownPos.current.x
    const dy = event.clientY - pointerDownPos.current.y
    const distanceSq = dx * dx + dy * dy // Skip sqrt for speed

    // Reset immediately
    pointerDownPos.current = null

    // APPLE PENCIL FIX: For pen, be very lenient - almost always treat as tap
    // unless there's significant movement (drag gesture)
    if (isPen) {
      // Only reject if clearly a drag (moved more than 15px)
      if (distanceSq > TAP_THRESHOLD_PX * TAP_THRESHOLD_PX) {
        return
      }
      // For pencil, don't care about time - even long presses should add points
    } else {
      // For touch/mouse, use normal tap detection
      if (distanceSq > TAP_THRESHOLD_PX * TAP_THRESHOLD_PX || elapsed > TAP_MAX_TIME_MS) {
        return
      }
    }

    event.stopPropagation()

    // Cast ray to find intersection point
    raycaster.setFromCamera(pointer, camera)
    const intersects = raycaster.intersectObject(clonedScene, true)

    if (intersects.length > 0) {
      const point = intersects[0].point
      // OPTIMIZED: Call immediately without any delays
      onAddPoint(point.clone())
    }
  }, [camera, raycaster, pointer, clonedScene, onAddPoint, readOnly])

  // Subtle rotation animation when idle
  useFrame((state) => {
    if (meshRef.current) {
      // Very subtle breathing animation
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02
    }
  })

  return (
    <group ref={meshRef}>
      {/* The 3D Body Model */}
      <primitive
        object={clonedScene}
        scale={1}
        position={[0, 0, 0]}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      />

      {/* Injection Point Markers */}
      {Array.from(injectionPoints.entries()).map(([id, point]) => (
        <InjectionMarker
          key={id}
          point={point}
          isSelected={selectedPointId === id}
          onClick={() => onSelectPoint(id)}
          productType={point.productType}
        />
      ))}
    </group>
  )
}

// =============================================================================
// INJECTION MARKER (3D Sphere on the body) - PERFORMANCE OPTIMIZED
// Uses React.memo with custom comparison to prevent unnecessary re-renders
// =============================================================================

// Pre-defined color sets - moved outside component to avoid recreation
const BODY_MARKER_COLORS = {
  neurotoxin: {
    primary: '#7C3AED',
    glow: '#A78BFA',
    selected: '#5B21B6',
    ring: '#C4B5FD'
  },
  filler: {
    primary: '#DB2777',
    glow: '#F472B6',
    selected: '#9D174D',
    ring: '#FBCFE8'
  }
} as const

const InjectionMarker = memo(function InjectionMarker({
  point,
  isSelected,
  onClick,
  productType
}: {
  point: InjectionPoint3D
  isSelected: boolean
  onClick: () => void
  productType: 'neurotoxin' | 'filler'
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const { camera } = useThree()

  // Use pre-defined colors - no object creation on each render
  const colorSet = BODY_MARKER_COLORS[productType]

  // Base distance for scale calculation (typical viewing distance)
  const BASE_DISTANCE = 1.5
  // Scale multiplier to keep markers at consistent screen size
  const SCALE_FACTOR = 1.0

  // Pulsing animation for selected marker with fixed screen-size rendering
  useFrame((state) => {
    // Calculate distance from camera to point for fixed screen-size rendering
    const distance = camera.position.distanceTo(point.position)
    const distanceScale = (distance / BASE_DISTANCE) * SCALE_FACTOR

    if (meshRef.current) {
      const baseScale = isSelected ? 1.3 : hovered ? 1.15 : 1
      const pulseScale = isSelected
        ? baseScale + Math.sin(state.clock.elapsedTime * 3) * 0.15
        : baseScale
      // Apply distance-based scaling to keep marker same screen size when zooming
      meshRef.current.scale.setScalar(pulseScale * distanceScale)
    }
    if (glowRef.current && isSelected) {
      const glowScale = 1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.3
      // Apply distance-based scaling to glow as well
      glowRef.current.scale.setScalar(glowScale * distanceScale)
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2
    }
    // Scale inner core and ring based on distance too
    if (groupRef.current) {
      // Scale children that aren't already scaled (inner core mesh is child index 2 or 3)
      groupRef.current.children.forEach((child, index) => {
        // Skip the main mesh (index 0 or 1) and glow (handled separately)
        // Scale the inner core and ring
        if (child !== meshRef.current && child !== glowRef.current) {
          child.scale.setScalar(distanceScale)
        }
      })
    }
  })

  const value = point.units || point.volume || 0
  const label = productType === 'neurotoxin' ? `${value}u` : `${value}ml`

  // Memoize click handler to prevent unnecessary re-creation
  const handleClick = useCallback((e: any) => {
    e.stopPropagation()
    onClick()
  }, [onClick])

  const handlePointerOver = useCallback(() => setHovered(true), [])
  const handlePointerOut = useCallback(() => setHovered(false), [])

  return (
    <group ref={groupRef} position={point.position}>
      {/* Outer glow ring - only for selected */}
      {isSelected && (
        <mesh ref={glowRef}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshBasicMaterial
            color={colorSet.glow}
            transparent
            opacity={0.4}
          />
        </mesh>
      )}

      {/* Main marker sphere */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[0.012, 16, 16]} />
        <meshStandardMaterial
          color={isSelected ? colorSet.selected : colorSet.primary}
          emissive={colorSet.primary}
          emissiveIntensity={isSelected ? 1.2 : hovered ? 0.8 : 0.5}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>

      {/* Inner bright core */}
      <mesh>
        <sphereGeometry args={[0.004, 8, 8]} />
        <meshBasicMaterial color={colorSet.glow} />
      </mesh>

      {/* Selection ring indicator */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.018, 0.022, 32]} />
          <meshBasicMaterial color={colorSet.ring} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Label showing units/volume */}
      {(hovered || isSelected) && value > 0 && (
        <Html
          position={[0, 0.04, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div
            className={`px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg whitespace-nowrap border-2 ${
              productType === 'neurotoxin'
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 border-purple-400'
                : 'bg-gradient-to-r from-pink-600 to-rose-600 border-pink-400'
            }`}
            style={{
              boxShadow: productType === 'neurotoxin'
                ? '0 0 12px rgba(139, 92, 246, 0.6)'
                : '0 0 12px rgba(236, 72, 153, 0.6)'
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  )
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render when these specific props change
  // This prevents all markers from re-rendering when a new point is added
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.productType === nextProps.productType &&
    prevProps.point.units === nextProps.point.units &&
    prevProps.point.volume === nextProps.point.volume &&
    prevProps.point.position.x === nextProps.point.position.x &&
    prevProps.point.position.y === nextProps.point.position.y &&
    prevProps.point.position.z === nextProps.point.position.z
  )
})

// =============================================================================
// LOADING COMPONENT
// =============================================================================

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-purple-400 text-sm">Loading 3D Model...</span>
      </div>
    </Html>
  )
}

// =============================================================================
// TOUCH-BASED ORBIT CONTROLS
// Single finger: DISABLED (passthrough to click handler for adding points)
// Two fingers: ALL navigation (zoom, rotate, pan)
//
// IMPORTANT: OrbitControls must ALWAYS be enabled. The touch configuration
// is set via useEffect to ensure two-finger gestures work correctly on iPad.
// Previously, conditionally enabling based on touchCount caused gestures to
// be ignored because the gesture had already started before we detected 2 fingers.
// =============================================================================

interface TouchBasedOrbitControlsProps {
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  minDistance?: number
  maxDistance?: number
  minPolarAngle?: number
  maxPolarAngle?: number
  zoomSpeed?: number
  rotateSpeed?: number
}

function TouchBasedOrbitControls({
  controlsRef,
  minDistance = 0.5,
  maxDistance = 1.8,
  minPolarAngle = Math.PI / 4,
  maxPolarAngle = Math.PI * 3 / 4,
  zoomSpeed = 0.5,
  rotateSpeed = 0.8
}: TouchBasedOrbitControlsProps) {
  // Configure touch and mouse behavior in useEffect to ensure proper gesture handling
  // This MUST be done after the controls are mounted to properly configure touches/mouse
  useEffect(() => {
    if (controlsRef.current) {
      // Configure touches: disable single-finger, enable two-finger for dolly+rotate
      controlsRef.current.touches = {
        ONE: undefined as unknown as THREE.TOUCH,  // Disable single-finger completely
        TWO: THREE.TOUCH.DOLLY_ROTATE  // Two-finger for zoom + rotate
      }
      // CRITICAL: Also disable mouse left-click rotation
      // This prevents stylus/pencil and mouse from rotating with single pointer
      controlsRef.current.mouseButtons = {
        LEFT: undefined as unknown as THREE.MOUSE,  // Disable left-click rotate
        MIDDLE: THREE.MOUSE.DOLLY,  // Middle click/scroll for zoom
        RIGHT: undefined as unknown as THREE.MOUSE  // Disable right-click pan
      }
    }
  }, [controlsRef])

  return (
    <OrbitControls
      ref={controlsRef}
      // ALWAYS enabled - touch filtering is handled by the touches config above
      enabled={true}
      enableRotate={true}  // Must be true for two-finger rotate to work
      enablePan={true}
      enableZoom={true}
      // Initial touches config (will be updated by useEffect for proper iPad support)
      touches={{
        ONE: undefined as unknown as THREE.TOUCH,  // Disable single-finger completely
        TWO: THREE.TOUCH.DOLLY_ROTATE  // Two-finger for zoom + rotate
      }}
      // CRITICAL: Disable all mouse button actions except scroll wheel zoom
      // This ensures single-pointer (mouse, stylus, pencil) never rotates
      mouseButtons={{
        LEFT: undefined as unknown as THREE.MOUSE,  // NO left-click rotate
        MIDDLE: THREE.MOUSE.DOLLY,  // Scroll wheel zoom only
        RIGHT: undefined as unknown as THREE.MOUSE  // NO right-click pan
      }}
      panSpeed={1.5}
      screenSpacePanning={true}
      minDistance={minDistance}
      maxDistance={maxDistance}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
      zoomSpeed={zoomSpeed}
      rotateSpeed={rotateSpeed}
      enableDamping={true}
      dampingFactor={0.1}
    />
  )
}

// =============================================================================
// MAIN BODY CHART 3D COMPONENT
// =============================================================================

export function BodyChart3D({
  productType,
  productId,
  injectionPoints,
  onInjectionPointsChange,
  onSave,
  readOnly = false,
  gender: externalGender,
  bodyType: externalBodyType
}: BodyChart3DProps) {
  const {
    settings,
    getActiveDepths,
    getActiveTechniques,
    getActiveNeedleGauges,
    getActiveTemplates
  } = useChartingSettings()

  const [selectedPointId, setSelectedPointId] = useState<string | null>(null)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  // Use external props if provided, otherwise use internal state
  const [internalBodyType, setInternalBodyType] = useState<BodyType>('torso')
  const [internalGender, setInternalGender] = useState<Gender>('female')

  // Determine which values to use - external takes precedence
  const bodyType = externalBodyType ?? internalBodyType
  const gender = externalGender ?? internalGender
  const setBodyType = setInternalBodyType
  const setGender = setInternalGender

  const controlsRef = useRef<OrbitControlsImpl>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  // Undo/Redo history
  const [history, setHistory] = useState<Map<string, InjectionPoint3D>[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const maxHistorySize = 50

  // Track last added point
  const [lastAddedPointId, setLastAddedPointId] = useState<string | null>(null)

  // Three-finger pan state
  const [panStart, setPanStart] = useState<{x: number, y: number} | null>(null)

  const activeDepths = useMemo(() => getActiveDepths(), [getActiveDepths])
  const activeTechniques = useMemo(() => getActiveTechniques(), [getActiveTechniques])
  const activeGauges = useMemo(() => getActiveNeedleGauges(), [getActiveNeedleGauges])

  // OPTIMIZED: Use ref to track points for immediate visual feedback
  const pointsRef = useRef<Map<string, InjectionPoint3D>>(injectionPoints)
  pointsRef.current = injectionPoints

  // OPTIMIZED: Cache defaults in refs for instant access (no lookup during tap)
  const defaultDepthRef = useRef(activeDepths[0]?.id || 'intramuscular')
  const defaultTechniqueRef = useRef(activeTechniques[0]?.id || 'serial-puncture')
  const defaultGaugeRef = useRef(activeGauges[0]?.id || '30g')

  // Keep refs in sync
  if (activeDepths[0]?.id) defaultDepthRef.current = activeDepths[0].id
  if (activeTechniques[0]?.id) defaultTechniqueRef.current = activeTechniques[0].id
  if (activeGauges[0]?.id) defaultGaugeRef.current = activeGauges[0].id

  // OPTIMIZED: Counter for fast ID generation
  const pointIdCounter = useRef(0)

  // Determine which model to load based on body type and gender
  const modelPath = `/models/body-${bodyType}-${gender}.glb`

  // Save to history
  const saveToHistory = useCallback((points: Map<string, InjectionPoint3D>) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(new Map(points))
      if (newHistory.length > maxHistorySize) {
        newHistory.shift()
      }
      return newHistory
    })
    setHistoryIndex(prev => Math.min(prev + 1, maxHistorySize - 1))
  }, [historyIndex, maxHistorySize])

  // PERFORMANCE: Removed toast notifications - UI state changes provide instant feedback
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      onInjectionPointsChange(new Map(prevState))
      setHistoryIndex(prev => prev - 1)
      setSelectedPointId(null)
    }
  }, [history, historyIndex, onInjectionPointsChange])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      onInjectionPointsChange(new Map(nextState))
      setHistoryIndex(prev => prev + 1)
    }
  }, [history, historyIndex, onInjectionPointsChange])

  // PERFORMANCE: Use startTransition for non-critical updates, removed toast
  const removeLastPoint = useCallback(() => {
    if (lastAddedPointId && injectionPoints.has(lastAddedPointId)) {
      const newPoints = new Map(injectionPoints)
      newPoints.delete(lastAddedPointId)
      // Critical: update UI immediately
      onInjectionPointsChange(newPoints)
      // Defer non-critical updates
      startTransition(() => {
        saveToHistory(newPoints)
        setLastAddedPointId(null)
        setSelectedPointId(null)
      })
    } else if (injectionPoints.size > 0) {
      const points = Array.from(injectionPoints.entries())
      const lastPoint = points.sort((a, b) =>
        new Date(b[1].timestamp).getTime() - new Date(a[1].timestamp).getTime()
      )[0]
      if (lastPoint) {
        const newPoints = new Map(injectionPoints)
        newPoints.delete(lastPoint[0])
        // Critical: update UI immediately
        onInjectionPointsChange(newPoints)
        // Defer non-critical updates
        startTransition(() => {
          saveToHistory(newPoints)
          setSelectedPointId(null)
        })
      }
    }
  }, [lastAddedPointId, injectionPoints, saveToHistory, onInjectionPointsChange])

  // PERFORMANCE: Use startTransition for non-critical updates, removed toast
  const duplicatePoint = useCallback(() => {
    if (!selectedPointId) return
    const point = injectionPoints.get(selectedPointId)
    if (!point) return

    const newPoint: InjectionPoint3D = {
      ...point,
      id: `ip3d-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: new THREE.Vector3(
        point.position.x + 0.02,
        point.position.y,
        point.position.z + 0.01
      ),
      timestamp: new Date()
    }

    const newPoints = new Map(injectionPoints)
    newPoints.set(newPoint.id, newPoint)
    // Critical: update UI immediately
    onInjectionPointsChange(newPoints)
    // Defer non-critical updates
    startTransition(() => {
      saveToHistory(newPoints)
      setSelectedPointId(newPoint.id)
      setLastAddedPointId(newPoint.id)
    })
  }, [selectedPointId, injectionPoints, saveToHistory, onInjectionPointsChange])

  // OPTIMIZED: handleAddPoint for maximum speed
  // - Uses cached refs instead of array lookups
  // - Uses performance.now() counter for unique IDs (faster than Date.now + random)
  // - Prioritizes immediate visual update via onInjectionPointsChange
  // - Defers history/selection to startTransition for non-blocking UI
  const handleAddPoint = useCallback((position: THREE.Vector3) => {
    // OPTIMIZED: Generate ID with simple counter (faster than Date.now + random)
    const id = `ip3d-${++pointIdCounter.current}-${performance.now().toString(36)}`

    // OPTIMIZED: Create point object using cached ref values (no array access)
    const newPoint: InjectionPoint3D = {
      id,
      position,
      units: productType === 'neurotoxin' ? 5 : undefined,
      volume: productType === 'filler' ? 0.1 : undefined,
      depthId: defaultDepthRef.current,
      techniqueId: defaultTechniqueRef.current,
      needleGaugeId: defaultGaugeRef.current,
      timestamp: new Date(),
      productType,
      productId // Track specific product for per-product layer filtering
    }

    // OPTIMIZED: Update ref immediately for instant visual (bypasses React scheduling)
    const newPoints = new Map(pointsRef.current)
    newPoints.set(id, newPoint)
    pointsRef.current = newPoints

    // OPTIMIZED: Trigger parent update immediately (shows point visually)
    onInjectionPointsChange(newPoints)

    // OPTIMIZED: Defer non-visual updates (history, selection) to avoid blocking
    startTransition(() => {
      saveToHistory(newPoints)
      setSelectedPointId(id)
      setLastAddedPointId(id)
    })
  }, [productType, productId, onInjectionPointsChange, saveToHistory])

  // Update point
  const updatePoint = useCallback((id: string, updates: Partial<InjectionPoint3D>) => {
    const newPoints = new Map(injectionPoints)
    const existing = newPoints.get(id)
    if (existing) {
      newPoints.set(id, { ...existing, ...updates })
      onInjectionPointsChange(newPoints)
    }
  }, [injectionPoints, onInjectionPointsChange])

  // PERFORMANCE: Removed toast - point disappearing is instant visual feedback
  const removePoint = useCallback((id: string) => {
    const newPoints = new Map(injectionPoints)
    newPoints.delete(id)
    onInjectionPointsChange(newPoints)
    setSelectedPointId(null)
  }, [injectionPoints, onInjectionPointsChange])

  // Quick adjust units/volume
  const quickAdjust = useCallback((delta: number) => {
    if (!selectedPointId) return
    const point = injectionPoints.get(selectedPointId)
    if (!point) return

    if (point.productType === 'neurotoxin') {
      const newUnits = Math.max(0, (point.units || 0) + delta)
      updatePoint(selectedPointId, { units: newUnits })
    } else {
      const newVolume = Math.max(0, parseFloat(((point.volume || 0) + delta).toFixed(2)))
      updatePoint(selectedPointId, { volume: newVolume })
    }
  }, [selectedPointId, injectionPoints, updatePoint])

  // Reset camera
  const resetCamera = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }, [])

  // PERFORMANCE: Removed toast - empty canvas is instant visual feedback
  const clearAll = useCallback(() => {
    onInjectionPointsChange(new Map())
    setSelectedPointId(null)
  }, [onInjectionPointsChange])

  // Calculate totals
  const totals = useMemo(() => {
    let neurotoxinUnits = 0
    let fillerVolume = 0
    let neurotoxinCount = 0
    let fillerCount = 0

    injectionPoints.forEach(point => {
      if (point.productType === 'neurotoxin') {
        neurotoxinUnits += point.units || 0
        neurotoxinCount++
      } else {
        fillerVolume += point.volume || 0
        fillerCount++
      }
    })
    return {
      neurotoxinUnits,
      fillerVolume,
      neurotoxinCount,
      fillerCount,
      totalCount: injectionPoints.size
    }
  }, [injectionPoints])

  const selectedPoint = selectedPointId ? injectionPoints.get(selectedPointId) : null

  // Three-finger pan handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 3) {
      // Three fingers - start pan
      const centerX = (e.touches[0].clientX + e.touches[1].clientX + e.touches[2].clientX) / 3
      const centerY = (e.touches[0].clientY + e.touches[1].clientY + e.touches[2].clientY) / 3
      setPanStart({ x: centerX, y: centerY })
      e.preventDefault()
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 3 && panStart && controlsRef.current) {
      const centerX = (e.touches[0].clientX + e.touches[1].clientX + e.touches[2].clientX) / 3
      const centerY = (e.touches[0].clientY + e.touches[1].clientY + e.touches[2].clientY) / 3

      const deltaX = centerX - panStart.x
      const deltaY = centerY - panStart.y

      // Pan the camera target
      const panSpeed = 0.002
      controlsRef.current.target.x -= deltaX * panSpeed
      controlsRef.current.target.y += deltaY * panSpeed
      controlsRef.current.update()

      setPanStart({ x: centerX, y: centerY })
      e.preventDefault()
    }
  }, [panStart])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (e.touches.length < 3) {
      setPanStart(null)
    }
  }, [])

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault()
        duplicatePoint()
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedPointId) {
          removePoint(selectedPointId)
        } else {
          removeLastPoint()
        }
      }
      if (e.key === 'r' || e.key === 'R') {
        resetCamera()
      }
      if (e.key === 'Escape') {
        setSelectedPointId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, duplicatePoint, removeLastPoint, removePoint, resetCamera, selectedPointId])


  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      {/* Header - Hidden in floating panel mode */}
      <div className="hidden">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">Body Injection Map</h3>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            productType === 'neurotoxin'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-pink-100 text-pink-700'
          }`}>
            {productType === 'neurotoxin' ? <Sparkles className="w-3 h-3 inline mr-1" /> : <Droplets className="w-3 h-3 inline mr-1" />}
            {productType === 'neurotoxin' ? 'Neurotoxin' : 'Filler'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Model Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setBodyType('torso')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                bodyType === 'torso'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-3 h-3 inline mr-1" />
              Torso
            </button>
            <button
              onClick={() => setBodyType('full')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                bodyType === 'full'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-3 h-3 inline mr-1" />
              Full Body
            </button>
          </div>

          {/* Gender Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setGender('male')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                gender === 'male'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Male
            </button>
            <button
              onClick={() => setGender('female')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                gender === 'female'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Female
            </button>
          </div>

          {/* Keyboard Shortcuts */}
          <button
            onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            title="Keyboard shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Controls Help Modal */}
      {showKeyboardHelp && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Controls & Shortcuts</h4>
            <button onClick={() => setShowKeyboardHelp(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Touch/Mouse Controls Section */}
          <div className="mb-4 pb-3 border-b border-gray-200">
            <p className="font-medium text-gray-700 uppercase tracking-wide text-[10px] mb-2">Touch & Mouse Controls</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">Tap/Click:</span>
                <span className="text-gray-600">Add point</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">Two fingers:</span>
                <span className="text-gray-600">Rotate & zoom</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">Three fingers:</span>
                <span className="text-gray-600">Pan view</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">Scroll:</span>
                <span className="text-gray-600">Zoom in/out</span>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
            <div className="space-y-1.5">
              <p className="font-medium text-gray-500 uppercase tracking-wide text-[10px]">Controls</p>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-gray-600 text-[10px]">R</kbd>
                <span className="text-gray-600">Reset view</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-gray-600 text-[10px]">Esc</kbd>
                <span className="text-gray-600">Deselect point</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="font-medium text-gray-500 uppercase tracking-wide text-[10px]">Editing</p>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-gray-600 text-[10px]">Cmd+Z</kbd>
                <span className="text-gray-600">Undo</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-gray-600 text-[10px]">Delete</kbd>
                <span className="text-gray-600">Remove point</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-white border rounded text-gray-600 text-[10px]">Cmd+D</kbd>
                <span className="text-gray-600">Duplicate</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content - Full screen for floating panel mode */}
      <div className="w-full h-full relative">
        {/* 3D Canvas - Full screen */}
        {/* touchAction: none prevents Scribble interference on iPad and ensures */}
        {/* proper touch gesture handling for OrbitControls */}
        <div
          ref={canvasContainerRef}
          className="absolute inset-0"
          style={{ touchAction: 'none', pointerEvents: 'auto' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >

          {/* Left Controls - Reset View */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <button
              onClick={resetCamera}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-sm transition-colors"
              title="Reset View (R)"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Top Right Controls */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <div className="flex items-center bg-black/50 backdrop-blur-sm rounded-lg overflow-hidden">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className={`p-2 transition-colors ${
                  historyIndex > 0
                    ? 'text-white hover:bg-white/20'
                    : 'text-gray-600 cursor-not-allowed'
                }`}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className={`p-2 transition-colors ${
                  historyIndex < history.length - 1
                    ? 'text-white hover:bg-white/20'
                    : 'text-gray-600 cursor-not-allowed'
                }`}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {!readOnly && (
              <div className="flex items-center bg-black/50 backdrop-blur-sm rounded-lg overflow-hidden">
                <button
                  onClick={removeLastPoint}
                  disabled={injectionPoints.size === 0}
                  className={`p-2 transition-colors ${
                    injectionPoints.size > 0
                      ? 'text-orange-400 hover:bg-white/20'
                      : 'text-gray-600 cursor-not-allowed'
                  }`}
                  title="Remove Last Point"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={duplicatePoint}
                  disabled={!selectedPointId}
                  className={`p-2 transition-colors ${
                    selectedPointId
                      ? 'text-blue-400 hover:bg-white/20'
                      : 'text-gray-600 cursor-not-allowed'
                  }`}
                  title="Duplicate Selected"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            )}

            {injectionPoints.size > 0 && (
              <div className={`px-2.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm ${
                productType === 'neurotoxin'
                  ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50'
                  : 'bg-pink-500/30 text-pink-200 border border-pink-500/50'
              }`}>
                {injectionPoints.size} {injectionPoints.size === 1 ? 'point' : 'points'}
              </div>
            )}
          </div>

          {/* Bottom Right - Clear All Button */}
          {injectionPoints.size > 0 && !readOnly && (
            <div className="absolute bottom-4 right-4 z-10">
              <button
                onClick={clearAll}
                className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs backdrop-blur-sm transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear All
              </button>
            </div>
          )}

          {/* Three.js Canvas */}
          <Canvas
            key={modelPath}
            camera={{ position: [0, 0, 1.5], fov: 50 }}
            gl={{ antialias: true, alpha: false }}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', touchAction: 'none', cursor: 'pointer' }}
          >
          <Suspense fallback={<LoadingFallback />}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <directionalLight position={[-5, 5, 5]} intensity={0.4} />
            <pointLight position={[0, 0, 2]} intensity={0.3} />

            <Environment preset="studio" />

            <BodyModel
              modelPath={modelPath}
              productType={productType}
              injectionPoints={injectionPoints}
              onAddPoint={handleAddPoint}
              onSelectPoint={setSelectedPointId}
              selectedPointId={selectedPointId}
              readOnly={readOnly}
            />

            {/* Orbit Controls - Always enabled, configured for two-finger navigation */}
            {/* Single tap adds points, two fingers zoom/rotate/pan */}
            <TouchBasedOrbitControls
              controlsRef={controlsRef}
              minDistance={0.5}
              maxDistance={bodyType === 'full' ? 2.5 : 1.8}
              minPolarAngle={bodyType === 'full' ? 0 : Math.PI / 4}
              maxPolarAngle={bodyType === 'full' ? Math.PI : Math.PI * 3 / 4}
              zoomSpeed={0.5}
              rotateSpeed={0.8}
            />
          </Suspense>
        </Canvas>
        </div>
      </div>

        {/* Right Panel - Hidden in floating panel mode */}
        <div className="hidden">
        {/* Treatment Summary - FIRST (at top) */}
        <div className="rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
          <div className="px-4 py-2 bg-gray-100">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
              <Target className="w-4 h-4" />
              Treatment Summary
            </h4>
          </div>

          <div className="p-3 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-white rounded-lg border border-gray-100">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-lg font-bold text-gray-900">{totals.totalCount}</p>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-[10px] text-purple-600 uppercase tracking-wide flex items-center justify-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Tox
                </p>
                <p className="text-lg font-bold text-purple-600">{totals.neurotoxinUnits}u</p>
              </div>
              <div className="text-center p-2 bg-pink-50 rounded-lg border border-pink-100">
                <p className="text-[10px] text-pink-600 uppercase tracking-wide flex items-center justify-center gap-0.5">
                  <Droplets className="w-2.5 h-2.5" /> Fill
                </p>
                <p className="text-lg font-bold text-pink-600">{totals.fillerVolume.toFixed(1)}ml</p>
              </div>
            </div>

            <div className={`flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs ${
              productType === 'neurotoxin' ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700'
            }`}>
              {productType === 'neurotoxin' ? <Sparkles className="w-3 h-3" /> : <Droplets className="w-3 h-3" />}
              <span className="font-medium">Adding {productType === 'neurotoxin' ? 'Neurotoxin' : 'Filler'}</span>
            </div>

            {injectionPoints.size > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">All Points</p>
                <div className="max-h-28 overflow-y-auto space-y-0.5">
                  {Array.from(injectionPoints.entries()).map(([id, point], idx) => (
                    <div
                      key={id}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-xs ${
                        selectedPointId === id
                          ? (point.productType === 'neurotoxin' ? 'bg-purple-100 ring-1 ring-purple-300' : 'bg-pink-100 ring-1 ring-pink-300')
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedPointId(id)}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          point.productType === 'neurotoxin' ? 'bg-purple-500' : 'bg-pink-500'
                        }`} />
                        <span className="text-gray-700 truncate max-w-[100px]">
                          {point.customName || `Point ${idx + 1}`}
                        </span>
                      </div>
                      <span className={`font-medium ${
                        point.productType === 'neurotoxin' ? 'text-purple-600' : 'text-pink-600'
                      }`}>
                        {point.productType === 'neurotoxin' ? `${point.units || 0}u` : `${(point.volume || 0).toFixed(1)}ml`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Edit Panel - SECOND (below summary) */}
        {selectedPoint && !readOnly && (
          <div className={`rounded-xl border-2 overflow-hidden ${
            selectedPoint.productType === 'neurotoxin' ? 'border-purple-300 bg-white' : 'border-pink-300 bg-white'
          }`}>
            <div className={`px-4 py-3 flex items-center justify-between ${
              selectedPoint.productType === 'neurotoxin' ? 'bg-purple-100' : 'bg-pink-100'
            }`}>
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                {selectedPoint.productType === 'neurotoxin'
                  ? <Sparkles className="w-4 h-4 text-purple-600" />
                  : <Droplets className="w-4 h-4 text-pink-600" />}
                {selectedPoint.customName || 'Selected Point'}
              </h4>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                selectedPoint.productType === 'neurotoxin'
                  ? 'bg-purple-200 text-purple-700'
                  : 'bg-pink-200 text-pink-700'
              }`}>
                {selectedPoint.productType === 'neurotoxin' ? 'Neurotoxin' : 'Filler'}
              </span>
            </div>

            <div className="p-4 space-y-4">
              {/* Units/Volume Adjuster */}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
                  {selectedPoint.productType === 'neurotoxin' ? 'Units' : 'Volume (ml)'}
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => quickAdjust(selectedPoint.productType === 'neurotoxin' ? -5 : -0.1)}
                    className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className={`flex-1 text-center py-3 rounded-xl font-bold text-2xl ${
                    selectedPoint.productType === 'neurotoxin' ? 'bg-purple-50 text-purple-700' : 'bg-pink-50 text-pink-700'
                  }`}>
                    {selectedPoint.productType === 'neurotoxin'
                      ? `${selectedPoint.units || 0}u`
                      : `${(selectedPoint.volume || 0).toFixed(1)}ml`}
                  </div>
                  <button
                    onClick={() => quickAdjust(selectedPoint.productType === 'neurotoxin' ? 5 : 0.1)}
                    className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Custom Name */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Custom Name</label>
                <input
                  type="text"
                  value={selectedPoint.customName || ''}
                  onChange={(e) => updatePoint(selectedPointId!, { customName: e.target.value })}
                  placeholder="e.g., Upper abdomen point"
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent ${
                    selectedPoint.productType === 'neurotoxin' ? 'focus:ring-purple-500' : 'focus:ring-pink-500'
                  }`}
                />
              </div>

              {/* Advanced Options */}
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Advanced Options</h5>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Injection Depth</label>
                  <select
                    value={selectedPoint.depthId}
                    onChange={(e) => updatePoint(selectedPointId!, { depthId: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {activeDepths.map(depth => (
                      <option key={depth.id} value={depth.id}>{depth.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Technique</label>
                  <select
                    value={selectedPoint.techniqueId}
                    onChange={(e) => updatePoint(selectedPointId!, { techniqueId: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {activeTechniques.map(technique => (
                      <option key={technique.id} value={technique.id}>{technique.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Needle Gauge</label>
                  <select
                    value={selectedPoint.needleGaugeId}
                    onChange={(e) => updatePoint(selectedPointId!, { needleGaugeId: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {activeGauges.map(gauge => (
                      <option key={gauge.id} value={gauge.id}>{gauge.gauge}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Notes</label>
                <textarea
                  value={selectedPoint.notes || ''}
                  onChange={(e) => updatePoint(selectedPointId!, { notes: e.target.value })}
                  placeholder="Add notes..."
                  rows={2}
                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:border-transparent resize-none ${
                    selectedPoint.productType === 'neurotoxin' ? 'focus:ring-purple-500' : 'focus:ring-pink-500'
                  }`}
                />
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removePoint(selectedPointId!)}
                className="w-full py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Remove Point
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedPoint && injectionPoints.size === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
            <User className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-2">No injection points yet</p>
            <p className="text-xs text-gray-400">
              Click anywhere on the 3D body to add injection points
            </p>
          </div>
        )}
        </div>
    </div>
  )
}

// Preload models
useGLTF.preload('/models/body-torso-female.glb')
useGLTF.preload('/models/body-torso-male.glb')
useGLTF.preload('/models/body-full-female.glb')
useGLTF.preload('/models/body-full-male.glb')

export default BodyChart3D
