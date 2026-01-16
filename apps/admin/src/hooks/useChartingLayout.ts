import { useState, useEffect, useCallback } from 'react';

interface SafeArea {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface CanvasDimensions {
  width: number;
  height: number;
  optimalToolbarPosition: 'left' | 'right' | 'bottom';
}

interface ChartingLayoutState {
  isIPad: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  screenWidth: number;
  screenHeight: number;
  safeArea: SafeArea;
  canvasDimensions: CanvasDimensions;
}

const DEFAULT_SAFE_AREA: SafeArea = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

const IPAD_NOTCH_SAFE_AREA: SafeArea = {
  top: 20,
  bottom: 20,
  left: 20,
  right: 20,
};

function detectIPad(): boolean {
  if (typeof navigator === 'undefined') return false;

  const hasTouch = navigator.maxTouchPoints > 0;
  const platform = navigator.platform || '';
  const userAgent = navigator.userAgent || '';

  // Check for iPad specifically
  const isIPadPlatform = platform === 'iPad' || platform === 'MacIntel';
  const isIPadUserAgent = /iPad/.test(userAgent);
  const isMacWithTouch = platform === 'MacIntel' && hasTouch;

  // iPad Pro reports as MacIntel but has touch
  return isIPadUserAgent || (isIPadPlatform && hasTouch) || isMacWithTouch;
}

function calculateSafeArea(isIPad: boolean, isPortrait: boolean): SafeArea {
  if (!isIPad) return DEFAULT_SAFE_AREA;

  // iPad Pro models with rounded corners need safe area
  // Portrait mode has more top/bottom safe area
  // Landscape mode has more left/right safe area for the notch
  if (isPortrait) {
    return {
      top: 24,
      bottom: 20,
      left: 0,
      right: 0,
    };
  }

  return IPAD_NOTCH_SAFE_AREA;
}

function calculateCanvasDimensions(
  screenWidth: number,
  screenHeight: number,
  safeArea: SafeArea,
  isIPad: boolean,
  isPortrait: boolean
): CanvasDimensions {
  const availableWidth = screenWidth - safeArea.left - safeArea.right;
  const availableHeight = screenHeight - safeArea.top - safeArea.bottom;

  // Reserve space for toolbar
  const toolbarSpace = isIPad ? 80 : 60;

  let optimalToolbarPosition: 'left' | 'right' | 'bottom';
  let width: number;
  let height: number;

  if (isPortrait) {
    // Portrait: toolbar at bottom, canvas takes full width
    optimalToolbarPosition = 'bottom';
    width = availableWidth;
    height = availableHeight - toolbarSpace;
  } else {
    // Landscape: toolbar on right for right-handed users
    optimalToolbarPosition = 'right';
    width = availableWidth - toolbarSpace;
    height = availableHeight;
  }

  return {
    width: Math.max(width, 300),
    height: Math.max(height, 300),
    optimalToolbarPosition,
  };
}

export function useChartingLayout(): ChartingLayoutState {
  const [state, setState] = useState<ChartingLayoutState>(() => {
    const isIPad = detectIPad();
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
    const isPortrait = screenHeight > screenWidth;
    const isLandscape = !isPortrait;
    const safeArea = calculateSafeArea(isIPad, isPortrait);

    return {
      isIPad,
      isPortrait,
      isLandscape,
      screenWidth,
      screenHeight,
      safeArea,
      canvasDimensions: calculateCanvasDimensions(
        screenWidth,
        screenHeight,
        safeArea,
        isIPad,
        isPortrait
      ),
    };
  });

  const updateLayout = useCallback(() => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isPortrait = screenHeight > screenWidth;
    const isLandscape = !isPortrait;
    const isIPad = detectIPad();
    const safeArea = calculateSafeArea(isIPad, isPortrait);

    setState({
      isIPad,
      isPortrait,
      isLandscape,
      screenWidth,
      screenHeight,
      safeArea,
      canvasDimensions: calculateCanvasDimensions(
        screenWidth,
        screenHeight,
        safeArea,
        isIPad,
        isPortrait
      ),
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initial update
    updateLayout();

    // Listen for resize events
    window.addEventListener('resize', updateLayout);

    // Listen for orientation changes via matchMedia
    const portraitQuery = window.matchMedia('(orientation: portrait)');
    const handleOrientationChange = () => updateLayout();

    // Modern browsers
    if (portraitQuery.addEventListener) {
      portraitQuery.addEventListener('change', handleOrientationChange);
    } else {
      // Fallback for older browsers
      portraitQuery.addListener(handleOrientationChange);
    }

    // Also listen for orientationchange event (mobile Safari)
    window.addEventListener('orientationchange', updateLayout);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('orientationchange', updateLayout);

      if (portraitQuery.removeEventListener) {
        portraitQuery.removeEventListener('change', handleOrientationChange);
      } else {
        portraitQuery.removeListener(handleOrientationChange);
      }
    };
  }, [updateLayout]);

  return state;
}

export default useChartingLayout;
