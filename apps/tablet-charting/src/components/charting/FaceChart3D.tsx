import { useCallback, useRef, useState, useMemo, Suspense } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Canvas, useFrame, useThree } from '@react-three/fiber/native'
import * as THREE from 'three'
import * as Haptics from 'expo-haptics'
import { InjectionPoint } from '../../stores/chartingStore'

// =============================================================================
// TYPES
// =============================================================================

export interface InjectionPoint3D {
  id: string
  position: THREE.Vector3
  units?: number
  volume?: number
  depthId: string
  techniqueId: string
  needleGaugeId: string
  notes?: string
  timestamp: Date
  productType: 'neurotoxin' | 'filler'
}

interface FaceChart3DProps {
  productType: 'neurotoxin' | 'filler'
  injectionPoints: InjectionPoint3D[]
  onAddPoint: (position: THREE.Vector3) => void
  onSelectPoint: (id: string | null) => void
  onUpdatePoint: (id: string, updates: Partial<InjectionPoint3D>) => void
  onRemovePoint: (id: string) => void
  selectedPointId: string | null
  readOnly?: boolean
}

// =============================================================================
// 3D FACE MESH (Simple geometry - no GLTF in RN)
// =============================================================================

function FaceMesh({
  productType,
  onAddPoint,
  readOnly,
}: {
  productType: 'neurotoxin' | 'filler'
  onAddPoint: (position: THREE.Vector3) => void
  readOnly?: boolean
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { raycaster, pointer, camera } = useThree()

  // Create face-like ellipsoid geometry
  const faceGeometry = useMemo(() => {
    const geometry = new THREE.SphereGeometry(1, 64, 64)
    // Scale to make it more face-shaped (oval)
    geometry.scale(0.8, 1.1, 0.7)
    return geometry
  }, [])

  // Subtle idle animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02
    }
  })

  const handlePointerDown = useCallback(
    (event: any) => {
      if (readOnly) return
      event.stopPropagation()

      // Get intersection point
      if (event.point) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        onAddPoint(event.point.clone())
      }
    },
    [onAddPoint, readOnly]
  )

  const faceColor = productType === 'neurotoxin' ? '#fef7f7' : '#fff5f8'

  return (
    <mesh
      ref={meshRef}
      geometry={faceGeometry}
      onPointerDown={handlePointerDown}
    >
      <meshStandardMaterial
        color={faceColor}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  )
}

// =============================================================================
// FACIAL FEATURES (Eyes, Nose, Mouth guides)
// =============================================================================

function FacialFeatures() {
  return (
    <group>
      {/* Left Eye */}
      <mesh position={[-0.25, 0.2, 0.55]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>

      {/* Right Eye */}
      <mesh position={[0.25, 0.2, 0.55]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 0, 0.65]}>
        <coneGeometry args={[0.06, 0.15, 16]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>

      {/* Mouth */}
      <mesh position={[0, -0.25, 0.55]}>
        <torusGeometry args={[0.1, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#fecaca" />
      </mesh>
    </group>
  )
}

// =============================================================================
// INJECTION POINT MARKER
// =============================================================================

function InjectionMarker({
  point,
  isSelected,
  onSelect,
}: {
  point: InjectionPoint3D
  isSelected: boolean
  onSelect: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const colors = {
    neurotoxin: {
      primary: '#8b5cf6',
      glow: '#c4b5fd',
      selected: '#6d28d9',
    },
    filler: {
      primary: '#ec4899',
      glow: '#fbcfe8',
      selected: '#be185d',
    },
  }

  const colorSet = colors[point.productType]

  // Pulsing animation for selected marker
  useFrame((state) => {
    if (meshRef.current) {
      const baseScale = isSelected ? 1.4 : hovered ? 1.2 : 1
      const pulseScale = isSelected
        ? baseScale + Math.sin(state.clock.elapsedTime * 4) * 0.15
        : baseScale
      meshRef.current.scale.setScalar(pulseScale)
    }
  })

  return (
    <group position={point.position}>
      {/* Glow ring for selected */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial
            color={colorSet.glow}
            transparent
            opacity={0.4}
          />
        </mesh>
      )}

      {/* Main marker */}
      <mesh
        ref={meshRef}
        onPointerDown={(e) => {
          e.stopPropagation()
          Haptics.selectionAsync()
          onSelect()
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial
          color={isSelected ? colorSet.selected : colorSet.primary}
          emissive={colorSet.primary}
          emissiveIntensity={isSelected ? 0.8 : 0.4}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Inner core */}
      <mesh>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

// =============================================================================
// CAMERA CONTROLS (Simple orbit for touch)
// =============================================================================

function CameraControls() {
  const { camera } = useThree()
  const isDragging = useRef(false)
  const previousTouch = useRef({ x: 0, y: 0 })
  const rotation = useRef({ x: 0, y: 0 })

  useFrame(() => {
    // Update camera position based on rotation
    const radius = 3
    const x = radius * Math.sin(rotation.current.y) * Math.cos(rotation.current.x)
    const y = radius * Math.sin(rotation.current.x)
    const z = radius * Math.cos(rotation.current.y) * Math.cos(rotation.current.x)

    camera.position.set(x, y, z)
    camera.lookAt(0, 0, 0)
  })

  return null
}

// =============================================================================
// LOADING FALLBACK
// =============================================================================

function LoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#8b5cf6" />
      <Text style={styles.loadingText}>Loading 3D Model...</Text>
    </View>
  )
}

// =============================================================================
// MAIN 3D CHART COMPONENT
// =============================================================================

export function FaceChart3D({
  productType,
  injectionPoints,
  onAddPoint,
  onSelectPoint,
  onUpdatePoint,
  onRemovePoint,
  selectedPointId,
  readOnly = false,
}: FaceChart3DProps) {
  const [interactionMode, setInteractionMode] = useState<'add' | 'select'>('add')

  const handleAddPoint = useCallback(
    (position: THREE.Vector3) => {
      if (interactionMode === 'select') {
        onSelectPoint(null)
        return
      }
      onAddPoint(position)
    },
    [interactionMode, onAddPoint, onSelectPoint]
  )

  const selectedPoint = useMemo(() => {
    return injectionPoints.find((p) => p.id === selectedPointId)
  }, [injectionPoints, selectedPointId])

  const totals = useMemo(() => {
    let units = 0
    let volume = 0
    injectionPoints.forEach((point) => {
      if (point.productType === 'neurotoxin') {
        units += point.units || 0
      } else {
        volume += point.volume || 0
      }
    })
    return { units, volume, count: injectionPoints.length }
  }, [injectionPoints])

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>3D Face Chart</Text>
          <View
            style={[
              styles.productBadge,
              productType === 'neurotoxin' ? styles.neurotoxinBadge : styles.fillerBadge,
            ]}
          >
            <Text
              style={[
                styles.productBadgeText,
                productType === 'neurotoxin' ? styles.neurotoxinText : styles.fillerText,
              ]}
            >
              {productType === 'neurotoxin' ? '💉 Neurotoxin' : '💧 Filler'}
            </Text>
          </View>
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeButton, interactionMode === 'add' && styles.modeButtonActive]}
            onPress={() => setInteractionMode('add')}
          >
            <Text style={styles.modeButtonText}>+ Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, interactionMode === 'select' && styles.modeButtonActive]}
            onPress={() => setInteractionMode('select')}
          >
            <Text style={styles.modeButtonText}>👆 Select</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3D Canvas */}
      <View style={styles.canvasContainer}>
        <Canvas
          camera={{ position: [0, 0, 3], fov: 50 }}
          style={styles.canvas}
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={0.8} />
            <directionalLight position={[-5, 5, 5]} intensity={0.4} />
            <pointLight position={[0, 0, 3]} intensity={0.3} />

            {/* Face Mesh */}
            <FaceMesh
              productType={productType}
              onAddPoint={handleAddPoint}
              readOnly={readOnly}
            />

            {/* Facial Features */}
            <FacialFeatures />

            {/* Injection Point Markers */}
            {injectionPoints.map((point) => (
              <InjectionMarker
                key={point.id}
                point={point}
                isSelected={selectedPointId === point.id}
                onSelect={() => onSelectPoint(point.id)}
              />
            ))}

            {/* Simple camera controls */}
            <CameraControls />
          </Suspense>
        </Canvas>

        {/* Instructions overlay */}
        <View style={styles.instructionsOverlay}>
          <Text style={styles.instructionsText}>
            {interactionMode === 'add'
              ? 'Tap face to add injection point'
              : 'Tap points to select • Drag to rotate'}
          </Text>
        </View>

        {/* Point counter */}
        {totals.count > 0 && (
          <View
            style={[
              styles.pointCounter,
              productType === 'neurotoxin' ? styles.pointCounterNeurotoxin : styles.pointCounterFiller,
            ]}
          >
            <Text style={styles.pointCounterText}>
              {totals.count} point{totals.count !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Points</Text>
            <Text style={styles.statValue}>{totals.count}</Text>
          </View>
          <View style={[styles.statItem, styles.statItemNeurotoxin]}>
            <Text style={styles.statLabel}>💉 Units</Text>
            <Text style={[styles.statValue, styles.statValueNeurotoxin]}>{totals.units}u</Text>
          </View>
          <View style={[styles.statItem, styles.statItemFiller]}>
            <Text style={styles.statLabel}>💧 Volume</Text>
            <Text style={[styles.statValue, styles.statValueFiller]}>{totals.volume.toFixed(1)}ml</Text>
          </View>
        </View>

        {/* Quick Edit for Selected Point */}
        {selectedPoint && !readOnly && (
          <View style={styles.quickEdit}>
            <TouchableOpacity
              style={styles.quickEditButton}
              onPress={() => {
                const delta = selectedPoint.productType === 'neurotoxin' ? -5 : -0.1
                const newValue =
                  selectedPoint.productType === 'neurotoxin'
                    ? Math.max(0, (selectedPoint.units || 0) + delta)
                    : Math.max(0, (selectedPoint.volume || 0) + delta)
                onUpdatePoint(selectedPoint.id, {
                  [selectedPoint.productType === 'neurotoxin' ? 'units' : 'volume']: newValue,
                })
              }}
            >
              <Text style={styles.quickEditButtonText}>−</Text>
            </TouchableOpacity>
            <View style={styles.quickEditValue}>
              <Text style={styles.quickEditValueText}>
                {selectedPoint.productType === 'neurotoxin'
                  ? `${selectedPoint.units || 0}u`
                  : `${(selectedPoint.volume || 0).toFixed(1)}ml`}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.quickEditButton}
              onPress={() => {
                const delta = selectedPoint.productType === 'neurotoxin' ? 5 : 0.1
                const newValue =
                  selectedPoint.productType === 'neurotoxin'
                    ? (selectedPoint.units || 0) + delta
                    : (selectedPoint.volume || 0) + delta
                onUpdatePoint(selectedPoint.id, {
                  [selectedPoint.productType === 'neurotoxin' ? 'units' : 'volume']: newValue,
                })
              }}
            >
              <Text style={styles.quickEditButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => onRemovePoint(selectedPoint.id)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fafafa',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  productBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  neurotoxinBadge: {
    backgroundColor: '#f3e8ff',
  },
  fillerBadge: {
    backgroundColor: '#fce7f3',
  },
  productBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  neurotoxinText: {
    color: '#7c3aed',
  },
  fillerText: {
    color: '#db2777',
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#1e293b',
    position: 'relative',
  },
  canvas: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#94a3b8',
  },
  instructionsOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  instructionsText: {
    fontSize: 12,
    color: '#e2e8f0',
  },
  pointCounter: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pointCounterNeurotoxin: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  pointCounterFiller: {
    backgroundColor: 'rgba(236, 72, 153, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.5)',
  },
  pointCounterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#fafafa',
  },
  summaryStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statItemNeurotoxin: {
    backgroundColor: '#faf5ff',
    borderColor: '#e9d5ff',
  },
  statItemFiller: {
    backgroundColor: '#fdf2f8',
    borderColor: '#fbcfe8',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  statValueNeurotoxin: {
    color: '#7c3aed',
  },
  statValueFiller: {
    color: '#db2777',
  },
  quickEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickEditButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickEditButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748b',
  },
  quickEditValue: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickEditValueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8b5cf6',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    fontSize: 16,
  },
})

export default FaceChart3D
