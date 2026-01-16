'use client'

import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Target points on the face (normalized screen coordinates)
const INJECTION_TARGETS = [
  // Forehead - neurotoxin (horizontal line across forehead)
  { screenX: 0, screenY: 0.38, type: 'neurotoxin' as const },
  { screenX: 0.06, screenY: 0.36, type: 'neurotoxin' as const },
  { screenX: -0.06, screenY: 0.36, type: 'neurotoxin' as const },

  // Glabella / frown lines (between eyebrows) - neurotoxin
  { screenX: 0, screenY: 0.24, type: 'neurotoxin' as const },
  { screenX: 0.025, screenY: 0.22, type: 'neurotoxin' as const },
  { screenX: -0.025, screenY: 0.22, type: 'neurotoxin' as const },

  // Crow's feet - OUTER corners of eyes where smile wrinkles form - neurotoxin
  { screenX: 0.32, screenY: 0.14, type: 'neurotoxin' as const },
  { screenX: 0.30, screenY: 0.10, type: 'neurotoxin' as const },
  { screenX: -0.32, screenY: 0.14, type: 'neurotoxin' as const },
  { screenX: -0.30, screenY: 0.10, type: 'neurotoxin' as const },

  // Lips - filler (upper and lower lip)
  { screenX: 0, screenY: -0.22, type: 'filler' as const },
  { screenX: 0.03, screenY: -0.20, type: 'filler' as const },
  { screenX: -0.03, screenY: -0.20, type: 'filler' as const },
  { screenX: 0, screenY: -0.26, type: 'filler' as const },

  // Nasolabial folds / smile lines (from nose to corners of mouth) - filler
  { screenX: 0.12, screenY: -0.10, type: 'filler' as const },
  { screenX: -0.12, screenY: -0.10, type: 'filler' as const },
  { screenX: 0.10, screenY: -0.16, type: 'filler' as const },
  { screenX: -0.10, screenY: -0.16, type: 'filler' as const },
]

// Injection marker component - minimal with only basic materials
function InjectionMarker({ position, type }: {
  position: THREE.Vector3,
  type: 'neurotoxin' | 'filler'
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  const colors = {
    neurotoxin: { primary: '#7C3AED', glow: '#A78BFA' },
    filler: { primary: '#DB2777', glow: '#F472B6' }
  }

  const colorSet = colors[type]

  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.5 + position.x * 10) * 0.25
      meshRef.current.scale.setScalar(pulse)
    }
    if (glowRef.current) {
      const glowPulse = 1.3 + Math.sin(state.clock.elapsedTime * 2 + position.x * 10) * 0.3
      glowRef.current.scale.setScalar(glowPulse)
      const mat = glowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.2
    }
  })

  return (
    <group position={position}>
      {/* Outer glow - basic material only */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshBasicMaterial color={colorSet.glow} transparent opacity={0.5} />
      </mesh>

      {/* Main sphere - basic material only */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.01, 16, 16]} />
        <meshBasicMaterial color={colorSet.primary} />
      </mesh>

      {/* Inner bright core */}
      <mesh>
        <sphereGeometry args={[0.003, 8, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

// Manual auto-rotation component (replaces OrbitControls)
function AutoRotate() {
  useFrame(({ camera, clock }) => {
    // Very gentle oscillating rotation (back and forth)
    const radius = 1.5
    const speed = 0.15 // Very slow
    const angle = Math.sin(clock.getElapsedTime() * speed) * 0.5 // Oscillate ~30 degrees each way

    camera.position.x = Math.sin(angle) * radius
    camera.position.z = Math.cos(angle) * radius
    camera.position.y = 0 // Keep camera level
    camera.lookAt(0, 0, 0)
  })

  return null
}

// Face model component with vanilla GLTF loader
function FaceModel() {
  const groupRef = useRef<THREE.Group>(null)
  const [model, setModel] = useState<THREE.Group | null>(null)
  const [injectionPoints, setInjectionPoints] = useState<Array<{ position: THREE.Vector3, type: 'neurotoxin' | 'filler' }>>([])

  // Load GLTF using vanilla Three.js loader
  useEffect(() => {
    const loader = new GLTFLoader()
    loader.load(
      '/models/face-3d.glb',
      (gltf) => {
        // Keep original materials from the GLB file
        setModel(gltf.scene)
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error)
      }
    )
  }, [])

  // Calculate injection points using raycasting
  useEffect(() => {
    if (!model) return

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000)
    camera.position.set(0, 0, 1.5)
    camera.lookAt(0, 0, 0)

    const raycaster = new THREE.Raycaster()
    const points: Array<{ position: THREE.Vector3, type: 'neurotoxin' | 'filler' }> = []

    // Cast rays from camera through target screen positions
    INJECTION_TARGETS.forEach((target) => {
      const screenPos = new THREE.Vector2(target.screenX, target.screenY)
      raycaster.setFromCamera(screenPos, camera)

      const intersects = raycaster.intersectObject(model, true)
      if (intersects.length > 0) {
        // Offset slightly outward from surface so marker is visible
        const normal = intersects[0].face?.normal || new THREE.Vector3(0, 0, 1)
        const worldNormal = normal.clone().transformDirection(intersects[0].object.matrixWorld)
        const offsetPoint = intersects[0].point.clone().add(worldNormal.multiplyScalar(0.005))

        points.push({
          position: offsetPoint,
          type: target.type
        })
      }
    })

    setInjectionPoints(points)
  }, [model])

  // Subtle breathing animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.03
    }
  })

  if (!model) {
    return null
  }

  return (
    <group ref={groupRef}>
      <primitive object={model} scale={1} position={[0, 0, 0]} />

      {/* Injection points placed on actual mesh surface */}
      {injectionPoints.map((point, idx) => (
        <InjectionMarker
          key={idx}
          position={point.position}
          type={point.type}
        />
      ))}
    </group>
  )
}

// 3D Scene component - minimal setup with manual rotation
export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 1.5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      {/* Simple lighting with basic materials */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <directionalLight position={[-5, 5, 5]} intensity={0.3} />

      {/* The face model with injection points */}
      <FaceModel />

      {/* Manual auto-rotation (no OrbitControls) */}
      <AutoRotate />
    </Canvas>
  )
}
