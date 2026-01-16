'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';

// =============================================================================
// TYPES
// =============================================================================

export type ChartingTheme = 'dark' | 'light';

interface ChartingThemeContextValue {
  /** Current theme ('dark' | 'light') */
  theme: ChartingTheme;
  /** Toggle between dark and light themes */
  toggleTheme: () => void;
  /** Set a specific theme */
  setTheme: (theme: ChartingTheme) => void;
  /** Check if current theme is dark */
  isDark: boolean;
  /** Check if current theme is light */
  isLight: boolean;
}

// =============================================================================
// CONTEXT
// =============================================================================

const ChartingThemeContext = createContext<ChartingThemeContextValue | null>(null);

// localStorage key for persisting theme preference
const THEME_STORAGE_KEY = 'charting-theme-preference';

// =============================================================================
// PROVIDER
// =============================================================================

interface ChartingThemeProviderProps {
  children: ReactNode;
  /** Default theme if no preference is stored. Defaults to 'dark' */
  defaultTheme?: ChartingTheme;
}

export function ChartingThemeProvider({
  children,
  defaultTheme = 'dark',
}: ChartingThemeProviderProps) {
  // Initialize theme state - start with default to avoid hydration mismatch
  const [theme, setThemeState] = useState<ChartingTheme>(defaultTheme);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved theme preference from localStorage after hydration
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setThemeState(savedTheme);
      }
    } catch (error) {
      // localStorage might not be available in some environments
      console.warn('Failed to load theme preference:', error);
    }
    setIsHydrated(true);
  }, []);

  // Persist theme preference to localStorage
  const persistTheme = useCallback((newTheme: ChartingTheme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, []);

  // Set a specific theme
  const setTheme = useCallback((newTheme: ChartingTheme) => {
    setThemeState(newTheme);
    persistTheme(newTheme);
  }, [persistTheme]);

  // Toggle between dark and light
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [theme, setTheme]);

  // Derived values
  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  // Memoize the context value to prevent unnecessary re-renders
  // This ensures children only re-render when theme actually changes
  const contextValue = useMemo<ChartingThemeContextValue>(() => ({
    theme,
    toggleTheme,
    setTheme,
    isDark,
    isLight,
  }), [theme, toggleTheme, setTheme, isDark, isLight]);

  return (
    <ChartingThemeContext.Provider value={contextValue}>
      {children}
    </ChartingThemeContext.Provider>
  );
}

// =============================================================================
// DEFAULT CONTEXT VALUE (for when used outside provider)
// =============================================================================

const defaultContextValue: ChartingThemeContextValue = {
  theme: 'dark',
  toggleTheme: () => {
    console.warn('useChartingTheme: toggleTheme called outside of ChartingThemeProvider');
  },
  setTheme: () => {
    console.warn('useChartingTheme: setTheme called outside of ChartingThemeProvider');
  },
  isDark: true,
  isLight: false,
};

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to access the charting theme context.
 * Returns default dark theme if used outside ChartingThemeProvider.
 *
 * @example
 * ```tsx
 * const { theme, toggleTheme, isDark } = useChartingTheme();
 * ```
 */
export function useChartingTheme(): ChartingThemeContextValue {
  const context = useContext(ChartingThemeContext);

  // Return default value if used outside provider (safe fallback)
  if (!context) {
    return defaultContextValue;
  }

  return context;
}

// =============================================================================
// THEME STYLE UTILITIES
// =============================================================================

/**
 * Get theme-aware class names for common UI patterns.
 * Useful for components that need to adapt to the charting theme.
 */
export function getThemeClasses(theme: ChartingTheme) {
  const isDark = theme === 'dark';

  return {
    // Panel backgrounds
    panelBg: isDark
      ? 'bg-gray-800/95 backdrop-blur-md border-gray-700'
      : 'bg-white/95 backdrop-blur-md border-gray-200',

    // Panel handle/header
    panelHandle: isDark
      ? 'bg-gradient-to-r from-gray-700/60 to-gray-800/40 border-b border-gray-700'
      : 'bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200',

    // Text colors
    textPrimary: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-500',
    textDisabled: isDark ? 'text-gray-500' : 'text-gray-400',

    // Interactive elements
    buttonDefault: isDark
      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300',
    buttonActive: isDark
      ? 'bg-purple-600 text-white'
      : 'bg-purple-600 text-white',
    buttonDisabled: isDark
      ? 'bg-gray-800 text-gray-600'
      : 'bg-gray-100 text-gray-400',

    // Inputs
    input: isDark
      ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-500'
      : 'bg-white text-gray-900 border-gray-300 placeholder-gray-400',
    inputFocus: isDark
      ? 'focus:ring-purple-500 focus:border-purple-500'
      : 'focus:ring-purple-500 focus:border-purple-500',

    // Dividers
    divider: isDark ? 'border-gray-700' : 'border-gray-200',

    // Hover effects
    hoverBg: isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100',
    activeBg: isDark ? 'active:bg-gray-600/50' : 'active:bg-gray-200',

    // Badges
    badge: isDark
      ? 'bg-gray-700 text-gray-200'
      : 'bg-gray-200 text-gray-700',
    badgeActive: isDark
      ? 'bg-purple-900/40 text-purple-400'
      : 'bg-purple-100 text-purple-700',

    // Canvas background
    canvasBg: isDark ? 'bg-gray-900' : 'bg-gray-100',

    // Loading states
    loadingBg: isDark ? 'bg-gray-900' : 'bg-gray-50',
    loadingText: isDark ? 'text-purple-400' : 'text-purple-600',
    loadingSpinner: isDark
      ? 'border-purple-500 border-t-transparent'
      : 'border-purple-600 border-t-transparent',

    // Shadows
    shadow: isDark ? 'shadow-lg shadow-black/30' : 'shadow-lg shadow-gray-300/50',
    shadowHover: isDark ? 'shadow-xl shadow-black/40' : 'shadow-xl shadow-gray-400/50',

    // Drag indicator dots
    dragDots: isDark ? 'bg-gray-500' : 'bg-gray-400',

    // Dropdown menus
    dropdown: isDark
      ? 'bg-gray-700 border-gray-600'
      : 'bg-white border-gray-200',
    dropdownItem: isDark
      ? 'hover:bg-gray-600'
      : 'hover:bg-gray-100',
    dropdownItemActive: isDark
      ? 'bg-purple-900/40'
      : 'bg-purple-50',
  };
}

export default ChartingThemeContext;
