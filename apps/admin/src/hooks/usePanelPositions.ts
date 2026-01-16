import { useState, useEffect, useCallback, useRef } from 'react';

export interface PanelPosition {
  x: number;
  y: number;
}

export interface PanelPositions {
  viewToggle: PanelPosition;
  toolPalette: PanelPosition;
  productPicker: PanelPosition;
  summaryBar: PanelPosition;
  actionButtons: PanelPosition;
}

export type PanelId = keyof PanelPositions;

const STORAGE_KEY = 'charting-panel-positions';

// iPad safe area margins to prevent overlap with system UI
const SAFE_AREA = {
  top: 20,
  bottom: 34, // Account for home indicator on modern iPads
  left: 20,
  right: 20,
};

const PANEL_DIMENSIONS: Record<PanelId, { width: number; height: number }> = {
  viewToggle: { width: 200, height: 48 },
  toolPalette: { width: 56, height: 280 },
  productPicker: { width: 200, height: 400 },
  summaryBar: { width: 400, height: 60 },
  actionButtons: { width: 180, height: 56 },
};

const getDefaultPositions = (): PanelPositions => {
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 768;

  return {
    // Top left with safe margin
    viewToggle: {
      x: SAFE_AREA.left,
      y: SAFE_AREA.top
    },
    // Top right
    toolPalette: {
      x: screenWidth - PANEL_DIMENSIONS.toolPalette.width - SAFE_AREA.right - 14,
      y: SAFE_AREA.top
    },
    // Right side below tools
    productPicker: {
      x: screenWidth - PANEL_DIMENSIONS.productPicker.width - SAFE_AREA.right,
      y: SAFE_AREA.top + PANEL_DIMENSIONS.toolPalette.height + 20
    },
    // Bottom center
    summaryBar: {
      x: Math.max(SAFE_AREA.left, (screenWidth / 2) - (PANEL_DIMENSIONS.summaryBar.width / 2)),
      y: screenHeight - PANEL_DIMENSIONS.summaryBar.height - SAFE_AREA.bottom - 20
    },
    // Bottom right
    actionButtons: {
      x: screenWidth - PANEL_DIMENSIONS.actionButtons.width - SAFE_AREA.right,
      y: screenHeight - PANEL_DIMENSIONS.actionButtons.height - SAFE_AREA.bottom - 14
    },
  };
};

const clampPosition = (
  position: PanelPosition,
  panelId: PanelId
): PanelPosition => {
  if (typeof window === 'undefined') return position;

  const { width, height } = PANEL_DIMENSIONS[panelId];

  // Use safe areas as minimum bounds
  const minX = SAFE_AREA.left;
  const minY = SAFE_AREA.top;
  const maxX = window.innerWidth - width - SAFE_AREA.right;
  const maxY = window.innerHeight - height - SAFE_AREA.bottom;

  return {
    x: Math.max(minX, Math.min(position.x, maxX)),
    y: Math.max(minY, Math.min(position.y, maxY)),
  };
};

const loadFromStorage = (): PanelPositions | null => {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);

    const requiredKeys: PanelId[] = [
      'viewToggle',
      'toolPalette',
      'productPicker',
      'summaryBar',
      'actionButtons',
    ];

    for (const key of requiredKeys) {
      if (
        !parsed[key] ||
        typeof parsed[key].x !== 'number' ||
        typeof parsed[key].y !== 'number'
      ) {
        return null;
      }
    }

    return parsed as PanelPositions;
  } catch {
    return null;
  }
};

const saveToStorage = (positions: PanelPositions): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
  } catch {
    // Storage full or unavailable - fail silently
  }
};

export function usePanelPositions() {
  const [positions, setPositions] = useState<PanelPositions>(getDefaultPositions);
  const isInitialized = useRef(false);
  const previousDimensions = useRef({ width: 0, height: 0 });

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Store initial dimensions
    if (typeof window !== 'undefined') {
      previousDimensions.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }

    const stored = loadFromStorage();
    if (stored) {
      const clampedPositions = Object.keys(stored).reduce((acc, key) => {
        const panelId = key as PanelId;
        acc[panelId] = clampPosition(stored[panelId], panelId);
        return acc;
      }, {} as PanelPositions);
      setPositions(clampedPositions);
    }
  }, []);

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events for smoother orientation changes
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        const prevWidth = previousDimensions.current.width;
        const prevHeight = previousDimensions.current.height;

        // Detect significant orientation change (width/height swap)
        const isOrientationChange =
          (prevWidth > prevHeight && newWidth < newHeight) ||
          (prevWidth < prevHeight && newWidth > newHeight);

        previousDimensions.current = { width: newWidth, height: newHeight };

        setPositions((prev) => {
          // On orientation change, reset to new defaults to ensure proper layout
          if (isOrientationChange) {
            const defaults = getDefaultPositions();
            saveToStorage(defaults);
            return defaults;
          }

          // Otherwise, just clamp existing positions to screen bounds
          const clamped = Object.keys(prev).reduce((acc, key) => {
            const panelId = key as PanelId;
            acc[panelId] = clampPosition(prev[panelId], panelId);
            return acc;
          }, {} as PanelPositions);
          saveToStorage(clamped);
          return clamped;
        });
      }, 100);
    };

    // Handle orientation change event for iOS Safari
    const handleOrientationChange = () => {
      // Delay to allow browser to update dimensions
      setTimeout(() => {
        const defaults = getDefaultPositions();
        setPositions(defaults);
        saveToStorage(defaults);
        previousDimensions.current = {
          width: window.innerWidth,
          height: window.innerHeight,
        };
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      clearTimeout(resizeTimeout);
    };
  }, []);

  const updatePosition = useCallback(
    (panelId: PanelId, position: PanelPosition) => {
      setPositions((prev) => {
        const clampedPosition = clampPosition(position, panelId);
        const updated = { ...prev, [panelId]: clampedPosition };
        saveToStorage(updated);
        return updated;
      });
    },
    []
  );

  const resetPositions = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Fail silently
      }
    }
    const defaults = getDefaultPositions();
    setPositions(defaults);
  }, []);

  return {
    positions,
    updatePosition,
    resetPositions,
  };
}

export default usePanelPositions;
