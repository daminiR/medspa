'use client';

import { useRef, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface TwoFingerOrbitControlsProps {
  enabled?: boolean;
  enableRotate?: boolean;
  enablePan?: boolean;
  enableZoom?: boolean;
}

export function TwoFingerOrbitControls({
  enabled = true,
  enableRotate = true,
  enablePan = true,
  enableZoom = true,
}: TwoFingerOrbitControlsProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { gl } = useThree();

  useEffect(() => {
    if (!controlsRef.current) return;

    const controls = controlsRef.current;

    // Configure touch behavior:
    // ONE finger = disabled (null) - reserved for annotation
    // TWO fingers = rotate + zoom/pan
    controls.touches = {
      ONE: undefined as any, // Disable single-finger completely
      TWO: THREE.TOUCH.DOLLY_ROTATE, // Two-finger for zoom + rotate
    };

    // Also configure mouse for consistency
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.DOLLY,
      RIGHT: THREE.MOUSE.PAN,
    };
  }, []);

  // Prevent default touch behavior on the canvas
  useEffect(() => {
    const canvas = gl.domElement;

    const handleTouchMove = (e: TouchEvent) => {
      // Only allow two-finger gestures
      if (e.touches.length < 2) {
        // Don't prevent single-finger - let it through for annotation clicks
      }
    };

    canvas.style.touchAction = 'none';
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gl]);

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={enabled}
      enableRotate={enableRotate}
      enablePan={enablePan}
      enableZoom={enableZoom}
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={0.5}
      panSpeed={0.5}
      zoomSpeed={0.8}
      makeDefault
    />
  );
}

export default TwoFingerOrbitControls;
