'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useChartingTheme, ChartingTheme } from '@/contexts/ChartingThemeContext';

interface CanvasDimensions {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  padding: number;
  contentArea: {
    width: number;
    height: number;
    top: number;
    left: number;
  };
}

interface CanvasContextValue {
  dimensions: CanvasDimensions;
  isFullScreen: boolean;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

export function useCanvasDimensions(): CanvasContextValue {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvasDimensions must be used within FullScreenChartCanvas');
  }
  return context;
}

interface FullScreenChartCanvasProps {
  mainContent: ReactNode;
  children?: ReactNode;
  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void;
  padding?: number;
  /** Offset from top of viewport (e.g., for nav bar). Default: 48px (h-12) */
  topOffset?: number;
  /**
   * Theme variant for the canvas background.
   * If 'auto' or not provided, uses the theme from ChartingThemeContext.
   */
  variant?: 'light' | 'dark' | 'auto';
}

export function FullScreenChartCanvas({
  mainContent,
  children,
  onOrientationChange,
  padding = 10,
  topOffset = 48, // Default to nav bar height (h-12 = 48px)
  variant = 'auto',
}: FullScreenChartCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Get theme from context (safely returns default if outside provider)
  const { theme: contextTheme } = useChartingTheme();

  // Determine effective theme: explicit variant overrides context
  const effectiveTheme: ChartingTheme =
    variant === 'auto' ? contextTheme : variant;

  // Theme-based styles
  const isDark = effectiveTheme === 'dark';
  const bgClass = isDark ? 'bg-gray-900' : 'bg-gray-100';
  // Use fixed initial values for SSR to avoid hydration mismatch
  // Actual values will be set in useEffect after mount
  const [dimensions, setDimensions] = useState<CanvasDimensions>({
    width: 1024,
    height: 768,
    orientation: 'landscape',
    padding,
    contentArea: {
      width: 1004, // 1024 - padding * 2
      height: 748, // 768 - padding * 2
      top: padding,
      left: padding,
    },
  });

  const calculateDimensions = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight - topOffset; // Subtract nav bar height
    const orientation: 'portrait' | 'landscape' = height > width ? 'portrait' : 'landscape';

    const contentWidth = width - padding * 2;
    const contentHeight = height - padding * 2;

    const newDimensions: CanvasDimensions = {
      width,
      height,
      orientation,
      padding,
      contentArea: {
        width: contentWidth,
        height: contentHeight,
        top: padding,
        left: padding,
      },
    };

    setDimensions((prev) => {
      if (prev.orientation !== orientation && onOrientationChange) {
        onOrientationChange(orientation);
      }
      return newDimensions;
    });
  }, [padding, topOffset, onOrientationChange]);

  useEffect(() => {
    calculateDimensions();

    const handleResize = () => {
      calculateDimensions();
    };

    const handleOrientationChange = () => {
      setTimeout(calculateDimensions, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, [calculateDimensions]);

  const contextValue: CanvasContextValue = {
    dimensions,
    isFullScreen: true,
  };

  return (
    <CanvasContext.Provider value={contextValue}>
      {/* Full viewport container - theme-aware background for charting */}
      {/* Uses topOffset to avoid covering the nav bar */}
      {/* z-index: 10 ensures it's above normal page content but below floating panels (z-1000+) */}
      <div
        ref={containerRef}
        className={`fixed left-0 right-0 bottom-0 overflow-hidden ${bgClass} transition-colors duration-200`}
        style={{ top: topOffset, zIndex: 10 }}
      >
        {/* Main content area - fills entire container */}
        {/* pointer-events: auto ensures the 3D canvas remains interactive */}
        <div className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'auto' }}>
          {mainContent}
        </div>

        {/* Children (floating panels) render on top of main content */}
        {/* NOTE: No wrapper divs - panels are rendered directly to avoid stacking context issues */}
        {/* Each DraggablePanel has position:fixed and handles its own z-index and pointer-events */}
        {children}
      </div>
    </CanvasContext.Provider>
  );
}

export default FullScreenChartCanvas;
