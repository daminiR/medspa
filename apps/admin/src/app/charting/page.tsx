'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef, Suspense } from 'react';

// =============================================================================
// CHARTING MODE TYPE
// =============================================================================
// Mode state for 3D components - 'addPoints' allows immediate point placement,
// 'navigate' allows camera rotation/pan without placing points
export type ChartingMode = 'navigate' | 'addPoints';
import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import {
  FileText,
  Camera,
  ClipboardList,
  History,
  X,
  ChevronLeft,
  Users,
  Book,
  SplitSquareHorizontal,
  Check,
  Loader2,
  Circle,
  AlertCircle,
  Save,
  ArrowLeft,
  Sun,
  Moon,
  Settings,
  Syringe,
  Package,
  Palette,
  ZoomIn,
  ZoomOut,
  Maximize2,
  MapPin,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

// =============================================================================
// SAVE STATE TYPES
// =============================================================================
type SaveState = 'saved' | 'saving' | 'unsaved' | 'error';

// Charting theme context
import { ChartingThemeProvider, useChartingTheme } from '@/contexts/ChartingThemeContext';

// Charting settings context for products, templates, etc.
import { ChartingSettingsProvider, useChartingSettings } from '@/contexts/ChartingSettingsContext';
import type { ProductPreset } from '@/contexts/ChartingSettingsContext';

// Charting products data for colors lookup
import { chartingProducts, getProductColor } from '@/lib/data/chartingProducts';

// Floating panel components for GoodNotes-style UI
import { FullScreenChartCanvas } from '@/components/charting/FullScreenChartCanvas';
import { FloatingViewToggle, useViewToggleState } from '@/components/charting/FloatingViewToggle';
import type { ViewMode, BodyPart, Gender } from '@/components/charting/FloatingViewToggle';
// Import hook and types from FloatingToolPalette (component not used - RightDock handles tools)
import { useDrawingTools } from '@/components/charting/FloatingToolPalette';
import type { DrawingTool } from '@/components/charting/FloatingToolPalette';
// Import Product type (component not used - RightDock handles products)
import type { Product } from '@/components/charting/FloatingProductPicker';
import { FloatingSummaryBar } from '@/components/charting/FloatingSummaryBar';
import { RightDock } from '@/components/charting/RightDock';
import type { SketchMode } from '@/components/charting/RightDock';
import { FloatingActionButtons } from '@/components/charting/FloatingActionButtons';
// BottomActionBar available as reusable component for alternative layouts
// import { BottomActionBarSimple } from '@/components/charting/BottomActionBar';
import { LayersPanel, useLayersState, useBrushLayersState } from '@/components/charting/LayersPanel';
import { LeftDock } from '@/components/charting/LeftDock';

// Chart components
import { FaceChartCore } from '@/components/charting/FaceChartCore';
import type { InjectionPoint, FreehandPoint } from '@/components/charting/FaceChartCore';
import { TorsoChart } from '@/components/charting/TorsoChart';
import { FullBodyChart } from '@/components/charting/FullBodyChart';

// Brush area tool for painting treatment areas
import { BrushAreaTool, useBrushAreasState, DEFAULT_TREATMENT_TYPES } from '@/components/charting/BrushAreaTool';
import type { BrushArea, TreatmentAreaType, BrushSize } from '@/components/charting/BrushAreaTool';
// Smooth brush tool using react-sketch-canvas for better drawing experience
import { SmoothBrushTool, SmoothBrushToolRef, DEFAULT_TREATMENT_TYPES as SMOOTH_BRUSH_TREATMENT_TYPES } from '@/components/charting/SmoothBrushTool';
import type { BrushPathsByType, TreatmentAreaType as SmoothBrushTreatmentType } from '@/components/charting/SmoothBrushTool';
// Zone detection summary component for displaying detected treatment areas
import { ZoneDetectionSummary } from '@/components/charting/ZoneDetectionSummary';
import type { DetectedZone } from '@/components/charting/zoneDetection';
import type { ZoneTreatmentSummary } from '@/components/charting/ZoneDisplay';
// Note: ArrowTool removed - arrow functionality is now part of ShapeTool
// Measurement tool for precise distance measurements on charts
import { MeasurementTool, useMeasurementState, DEFAULT_CALIBRATION } from '@/components/charting/MeasurementTool';
import type { Measurement, CalibrationData } from '@/components/charting/MeasurementTool';
// Shape tool for drawing circles, rectangles, and freeform shapes
import { ShapeTool, useShapesState, DEFAULT_SHAPE_COLORS, DEFAULT_FILL_OPACITY, DEFAULT_STROKE_WIDTH } from '@/components/charting/ShapeTool';
import type { ShapeAnnotation, ShapeType, ShapeToolRef } from '@/components/charting/ShapeTool';
// Cannula path tool for documenting cannula injection paths and fanning techniques
import { CannulaPathTool, useCannulaPathsState } from '@/components/charting/CannulaPathTool';
import type { CannulaPath, CannulaTechnique } from '@/components/charting/CannulaPathTool';
// Danger zone overlay for safety warnings (arteries, nerves)
import { DangerZoneOverlay } from '@/components/charting/DangerZoneOverlay';
// Vein drawing tool for sclerotherapy documentation
import { VeinDrawingTool, useVeinPathsState } from '@/components/charting/VeinDrawingTool';
import type { VeinPath, VeinType, VeinDrawingToolRef } from '@/components/charting/VeinDrawingTool';
// Simple text tool for quick text label placement (Konva-based)
import { SimpleTextTool, SimpleTextSettingsPanel, useSimpleTextLabels, TEXT_PRESETS } from '@/components/charting/SimpleTextTool';
import type { SimpleTextLabel, SimpleTextToolRef, TextPreset } from '@/components/charting/SimpleTextTool';

// Zoom-enabled chart wrappers for 2D views
import { FaceChartWithZoom } from '@/components/charting/FaceChartWithZoom';
import type { ZoomState, ZoomControls } from '@/components/charting/FaceChartWithZoom';
import { TorsoChartWithZoom } from '@/components/charting/TorsoChartWithZoom';
import { FullBodyChartWithZoom } from '@/components/charting/FullBodyChartWithZoom';

// =============================================================================
// PRELOAD FUNCTIONS FOR 3D MODELS
// =============================================================================
// These functions trigger dynamic imports early so 3D components are cached
// and load instantly when user clicks the 3D toggle. Called on page mount via useEffect.

const preloadFaceChart3D = () => import('@/components/charting/FaceChart3D');
const preloadBodyChart3D = () => import('@/components/charting/BodyChart3D');

// Preload GLB model assets via dynamic import of drei (client-side only)
// This prevents SSR issues with three.js
const preloadGLBModels = async () => {
  const { useGLTF } = await import('@react-three/drei');
  useGLTF.preload('/models/face-3d.glb');
  useGLTF.preload('/models/body-torso-female.glb');
  useGLTF.preload('/models/body-torso-male.glb');
  useGLTF.preload('/models/body-full-female.glb');
  useGLTF.preload('/models/body-full-male.glb');
};

// Dynamic imports for 3D components to prevent SSR issues with Three.js
const FaceChart3D = dynamic(
  () => import('@/components/charting/FaceChart3D').then(mod => mod.FaceChart3D),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-purple-400 text-sm">Loading 3D Face Model...</span>
        </div>
      </div>
    ),
  }
);
const BodyChart3D = dynamic(
  () => import('@/components/charting/BodyChart3D').then(mod => mod.BodyChart3D),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-purple-400 text-sm">Loading 3D Body Model...</span>
        </div>
      </div>
    ),
  }
);
import type { InjectionPoint3D } from '@/components/charting/FaceChart3D';

// Hooks
import { useChartingLayout } from '@/hooks/useChartingLayout';
import { usePanelPositions } from '@/hooks/usePanelPositions';

// Additional components for tabs
import { SOAPNotesForm } from '@/components/charting/SOAPNotesForm';
import { PhotoUpload } from '@/components/charting/PhotoUpload';
import type { TreatmentPhoto } from '@/components/charting/PhotoUpload';
import { PhotoComparison } from '@/components/charting/PhotoComparison';
import { InjectorPlaybook } from '@/components/charting/InjectorPlaybook';

// Styles
import '@/styles/charting-responsive.css';
import '@/styles/charting-floating.css';

// Print component
import { PrintableChart, useChartPrintShortcut } from '@/components/charting/PrintableChart';
import type { TreatmentSummaryItem } from '@/components/charting/PrintableChart';

// Touch gesture hints for iPad users
import { TouchGestureHints, useTouchGestureHints, GestureHelpButton } from '@/components/charting/TouchGestureHints';

// Keyboard shortcuts help overlay
import { KeyboardShortcutsHelp, KeyboardHelpButton } from '@/components/charting/KeyboardShortcutsHelp';

// =============================================================================
// MOCK DATA
// =============================================================================

// Default products used as fallback if ChartingSettings has no products
const DEFAULT_FALLBACK_PRODUCTS: Product[] = [
  { id: 'botox', name: 'Botox', color: '#8B5CF6', abbreviation: 'BTX', defaultDosage: 20, type: 'neurotoxin' },
  { id: 'dysport', name: 'Dysport', color: '#3B82F6', abbreviation: 'DYS', defaultDosage: 50, type: 'neurotoxin' },
  { id: 'xeomin', name: 'Xeomin', color: '#14B8A6', abbreviation: 'XEO', defaultDosage: 20, type: 'neurotoxin' },
  { id: 'juvederm-ultra', name: 'Juvederm Ultra', color: '#F97316', abbreviation: 'JUV', defaultDosage: 1, type: 'filler' },
  { id: 'restylane', name: 'Restylane', color: '#F59E0B', abbreviation: 'RST', defaultDosage: 1, type: 'filler' },
  { id: 'radiesse', name: 'Radiesse', color: '#A855F7', abbreviation: 'RAD', defaultDosage: 1.5, type: 'filler' },
];

// Type-specific default colors for products from settings (used when no matching chartingProduct exists)
const PRODUCT_TYPE_COLORS: Record<string, string> = {
  'neurotoxin': '#8B5CF6',  // Purple for neurotoxins
  'filler': '#F97316',       // Orange for fillers
  'biostimulator': '#22C55E', // Green for biostimulators
  'skin-booster': '#3B82F6', // Blue for skin boosters
};

// Helper function to convert ProductPreset from settings to Product format for FloatingProductPicker
function convertSettingsProductToPickerProduct(preset: ProductPreset): Product {
  // Try to find a matching product in chartingProducts for the color
  const matchingChartingProduct = chartingProducts.find(
    p => p.id === preset.id || p.name.toLowerCase() === preset.name.toLowerCase()
  );

  // Use chartingProduct color if found, otherwise use type-based color, otherwise default purple
  const color = matchingChartingProduct?.color
    || PRODUCT_TYPE_COLORS[preset.type]
    || '#8B5CF6';

  // Generate abbreviation from name (first 3 letters uppercase)
  const abbreviation = preset.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 3);

  // Use defaultUnits for neurotoxins, defaultVolume for fillers
  const defaultDosage = preset.type === 'neurotoxin'
    ? preset.defaultUnits
    : preset.defaultVolume;

  return {
    id: preset.id,
    name: preset.name,
    color,
    abbreviation,
    defaultDosage: defaultDosage || (preset.type === 'neurotoxin' ? 20 : 1),
    // Include the type so we can correctly determine units vs volume for injection points
    type: preset.type as 'neurotoxin' | 'filler' | 'biostimulator' | 'skin-booster',
  };
}

// Default products for summary bar with pricing (fallback when settings are empty)
const DEFAULT_PRODUCTS_FOR_SUMMARY = [
  { id: 'botox', name: 'Botox', pricePerUnit: 15, type: 'toxin' as const, unitLabel: 'u' },
  { id: 'dysport', name: 'Dysport', pricePerUnit: 5, type: 'toxin' as const, unitLabel: 'u' },
  { id: 'xeomin', name: 'Xeomin', pricePerUnit: 14, type: 'toxin' as const, unitLabel: 'u' },
  { id: 'juvederm-ultra', name: 'Juvederm Ultra', pricePerUnit: 600, type: 'filler' as const, unitLabel: 'ml' },
  { id: 'restylane', name: 'Restylane', pricePerUnit: 550, type: 'filler' as const, unitLabel: 'ml' },
  { id: 'radiesse', name: 'Radiesse', pricePerUnit: 700, type: 'filler' as const, unitLabel: 'ml' },
];

// Helper function to convert ProductPreset to summary format
function convertSettingsProductToSummaryProduct(preset: ProductPreset): {
  id: string;
  name: string;
  pricePerUnit: number;
  type: 'toxin' | 'filler';
  unitLabel: string;
} {
  const isToxin = preset.type === 'neurotoxin';
  return {
    id: preset.id,
    name: preset.name,
    pricePerUnit: preset.unitPrice,
    type: isToxin ? 'toxin' : 'filler',
    unitLabel: isToxin ? 'u' : 'ml',
  };
}

const MOCK_PATIENT = {
  id: 'PT-001',
  name: 'Sarah Johnson',
  mrn: 'MRN-45678',
  age: 42,
  lastVisit: '2024-01-15',
  upcomingAppt: '2024-02-10 at 2:00 PM',
};

// =============================================================================
// TAB TYPES
// =============================================================================

type TabId = 'injection-map' | 'notes' | 'photos' | 'compare' | 'playbook' | 'history';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'injection-map', label: 'Injection Map', icon: <ClipboardList className="w-4 h-4" /> },
  { id: 'notes', label: 'SOAP Notes', icon: <FileText className="w-4 h-4" /> },
  { id: 'photos', label: 'Photos', icon: <Camera className="w-4 h-4" /> },
  { id: 'compare', label: 'Compare', icon: <SplitSquareHorizontal className="w-4 h-4" /> },
  { id: 'playbook', label: 'Playbook', icon: <Book className="w-4 h-4" /> },
  { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
];

// =============================================================================
// 2D VIEW KEY TYPE - For isolating injection points per view
// =============================================================================
// Each combination of body part and gender gets its own set of injection points
// This prevents points from transferring between different anatomy maps
type View2DKey = 'femaleFace' | 'maleFace' | 'femaleTorso' | 'maleTorso' | 'femaleFullBody' | 'maleFullBody';

// Helper to get the view key from body part and gender
const getView2DKey = (bodyPart: BodyPart, gender: Gender): View2DKey => {
  const genderPrefix = gender === 'female' ? 'female' : 'male';
  const bodyPartSuffix = bodyPart === 'face' ? 'Face' : bodyPart === 'torso' ? 'Torso' : 'FullBody';
  return `${genderPrefix}${bodyPartSuffix}` as View2DKey;
};

// Type for the isolated injection points state
interface InjectionPointsByView {
  femaleFace: Map<string, InjectionPoint>;
  maleFace: Map<string, InjectionPoint>;
  femaleTorso: Map<string, InjectionPoint>;
  maleTorso: Map<string, InjectionPoint>;
  femaleFullBody: Map<string, InjectionPoint>;
  maleFullBody: Map<string, InjectionPoint>;
}

// Type for the isolated freehand points state
interface FreehandPointsByView {
  femaleFace: Map<string, FreehandPoint>;
  maleFace: Map<string, FreehandPoint>;
  femaleTorso: Map<string, FreehandPoint>;
  maleTorso: Map<string, FreehandPoint>;
  femaleFullBody: Map<string, FreehandPoint>;
  maleFullBody: Map<string, FreehandPoint>;
}

// =============================================================================
// UNDO/REDO HISTORY TYPES AND CONSTANTS
// =============================================================================
// Represents a UNIFIED snapshot of ALL chart state for undo/redo
// This includes injection points, brush strokes, text labels, veins, shapes, etc.
// All tools use this single history so ONE undo button works for ANY action.
// Note: Arrow tool was removed - arrow functionality is now part of ShapeTool
interface HistorySnapshot {
  // Injection points (2D zone-based)
  injectionPointsByView: {
    femaleFace: [string, InjectionPoint][];
    maleFace: [string, InjectionPoint][];
    femaleTorso: [string, InjectionPoint][];
    maleTorso: [string, InjectionPoint][];
    femaleFullBody: [string, InjectionPoint][];
    maleFullBody: [string, InjectionPoint][];
  };
  // Freehand points (2D custom placement)
  freehandPointsByView: {
    femaleFace: [string, FreehandPoint][];
    maleFace: [string, FreehandPoint][];
    femaleTorso: [string, FreehandPoint][];
    maleTorso: [string, FreehandPoint][];
    femaleFullBody: [string, FreehandPoint][];
    maleFullBody: [string, FreehandPoint][];
  };
  // 3D injection points
  injectionPoints3DByBodyPart: {
    face: [string, InjectionPoint3D][];
    torso: [string, InjectionPoint3D][];
    fullBody: [string, InjectionPoint3D][];
  };
  // Vein paths (for sclerotherapy)
  veinPaths: VeinPath[];
  // Shape annotations
  shapes: ShapeAnnotation[];
  // Measurements
  measurements: Measurement[];
  // Cannula paths
  cannulaPaths: CannulaPath[];
  // Metadata
  timestamp: number;
  operation: 'add' | 'move' | 'edit' | 'delete' | 'initial' | 'brush' | 'vein' | 'shape' | 'measurement' | 'cannula';
}

const MAX_HISTORY_SIZE = 50;

// =============================================================================
// MAIN CHARTING PAGE
// =============================================================================

// Wrap the main content with the theme and settings providers
export default function ChartingPage() {
  return (
    <ChartingThemeProvider defaultTheme="dark">
      <ChartingSettingsProvider>
        <ChartingPageContent />
      </ChartingSettingsProvider>
    </ChartingThemeProvider>
  );
}

// Inner component that uses the theme context
function ChartingPageContent() {
  // Router for navigation
  const router = useRouter();

  // Theme context for light/dark mode
  const { theme, toggleTheme, isDark } = useChartingTheme();

  // Charting settings context for products from /settings/charting
  const { settings, isLoading: settingsLoading, getActiveProducts } = useChartingSettings();

  // =============================================================================
  // PAGE LOADING STATE - Tracks overall page readiness
  // =============================================================================
  // Combines settings loading and minimum delay to prevent flash of loading state
  const [pageReady, setPageReady] = useState(false);
  const [loadingFadeOut, setLoadingFadeOut] = useState(false);
  const [minLoadTimeElapsed, setMinLoadTimeElapsed] = useState(false);

  // Effect to track minimum load time (500ms) to prevent flash
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadTimeElapsed(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Safety timeout - force page ready after 3 seconds if settings loading hangs
  // This is a critical failsafe to ensure the page always loads
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      // Use functional update to atomically check and set state
      // This avoids race conditions with the normal loading flow
      setPageReady((currentPageReady) => {
        if (!currentPageReady) {
          console.warn('Charting: Safety timeout triggered - forcing page ready');
          return true; // Force page ready
        }
        return currentPageReady; // Already ready, no change
      });
    }, 3000);

    return () => clearTimeout(safetyTimer);
  }, []);

  // Effect to handle when both conditions are met (settings loaded + min time elapsed)
  useEffect(() => {
    if (!settingsLoading && minLoadTimeElapsed && !pageReady) {
      setLoadingFadeOut(true);
      // After fade-out animation, set page ready
      const fadeTimer = setTimeout(() => setPageReady(true), 300);
      return () => clearTimeout(fadeTimer);
    }
  }, [settingsLoading, minLoadTimeElapsed, pageReady]);

  // =============================================================================
  // PRODUCTS FROM SETTINGS - Convert ProductPreset[] to Product[] format
  // =============================================================================
  // Get active products from settings and convert to the format expected by FloatingProductPicker
  // Falls back to DEFAULT_FALLBACK_PRODUCTS if settings have no products
  const products: Product[] = useMemo(() => {
    const activePresets = getActiveProducts();
    if (activePresets.length > 0) {
      return activePresets.map(convertSettingsProductToPickerProduct);
    }
    // Fallback to default products if no products in settings
    return DEFAULT_FALLBACK_PRODUCTS;
  }, [getActiveProducts]);

  // Products for summary bar with pricing information
  // Derives from settings when available, falls back to defaults
  const productsForSummary = useMemo(() => {
    const activePresets = getActiveProducts();
    if (activePresets.length > 0) {
      return activePresets.map(convertSettingsProductToSummaryProduct);
    }
    return DEFAULT_PRODUCTS_FOR_SUMMARY;
  }, [getActiveProducts]);

  // Layout and panel position hooks
  const layoutState = useChartingLayout();
  const { positions } = usePanelPositions();

  // View toggle state (2D/3D, body part, gender)
  const viewToggleState = useViewToggleState('2D', 'face', 'female');
  const { viewMode, bodyPart, gender } = viewToggleState;

  // Drawing tool state (we implement our own undo/redo below)
  const drawingToolsState = useDrawingTools('zone');
  const { activeTool, setActiveTool } = drawingToolsState;

  // Product selection state - initialize with first product from settings/fallback
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [dosage, setDosage] = useState<number>(20);
  const [productPickerVisible, setProductPickerVisible] = useState(true);

  // Initialize selected product once products are loaded
  useEffect(() => {
    if (products.length > 0 && selectedProduct === null) {
      setSelectedProduct(products[0]);
      if (products[0].defaultDosage) {
        setDosage(products[0].defaultDosage);
      }
    }
  }, [products, selectedProduct]);

  // Layers panel state for toggling visibility of different product types
  const layersState = useLayersState({
    products: products.map(p => ({ id: p.id, name: p.name, color: p.color })),
  });

  // Brush layers state for toggling visibility of treatment types (laser, microneedling, etc.)
  const brushLayersState = useBrushLayersState({
    treatmentTypes: SMOOTH_BRUSH_TREATMENT_TYPES.map(t => ({
      id: t.id,
      name: t.name,
      color: t.color,
    })),
  });

  // Extract stable references to avoid recreating callbacks
  const { updateStrokeCounts: brushUpdateStrokeCounts } = brushLayersState;

  // Touch gesture hints for iPad users (first-time user onboarding)
  const gestureHints = useTouchGestureHints();

  // Determine product type based on selected product's type field
  // This now correctly handles products from settings with custom IDs
  const productType: 'neurotoxin' | 'filler' = useMemo(() => {
    if (!selectedProduct) return 'neurotoxin';
    // Use the product's type field if available
    if (selectedProduct.type) {
      // Treat biostimulators and skin-boosters as fillers (volume-based)
      return selectedProduct.type === 'neurotoxin' ? 'neurotoxin' : 'filler';
    }
    // Fallback for legacy products without type field (hardcoded IDs)
    return ['juvederm-ultra', 'restylane', 'radiesse'].includes(selectedProduct.id)
      ? 'filler'
      : 'neurotoxin';
  }, [selectedProduct]);

  // =============================================================================
  // ZOOM STATE - Lifted to page level for bottom bar integration
  // =============================================================================
  // The active chart's zoom state is mirrored here so the bottom bar can display
  // and control zoom regardless of which chart type is currently active.
  const [zoomState, setZoomState] = useState<ZoomState>({ scale: 1, translateX: 0, translateY: 0 });
  const [zoomControls, setZoomControls] = useState<ZoomControls | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  // Handler for chart components to notify of zoom state changes
  const handleZoomStateChange = useCallback((state: ZoomState, controls: ZoomControls, zoomed: boolean) => {
    setZoomState(state);
    setZoomControls(controls);
    setIsZoomed(zoomed);
  }, []);

  // =============================================================================
  // 2D INJECTION POINTS - ISOLATED PER VIEW (body part + gender combination)
  // =============================================================================
  // Each view type maintains its own set of injection points so that points
  // placed on the female face don't appear on the male face, torso, etc.
  const [injectionPointsByView, setInjectionPointsByView] = useState<InjectionPointsByView>({
    femaleFace: new Map(),
    maleFace: new Map(),
    femaleTorso: new Map(),
    maleTorso: new Map(),
    femaleFullBody: new Map(),
    maleFullBody: new Map(),
  });

  const [freehandPointsByView, setFreehandPointsByView] = useState<FreehandPointsByView>({
    femaleFace: new Map(),
    maleFace: new Map(),
    femaleTorso: new Map(),
    maleTorso: new Map(),
    femaleFullBody: new Map(),
    maleFullBody: new Map(),
  });

  // =============================================================================
  // BRUSH AREAS STATE - For painting treatment areas (laser, microneedling, etc.)
  // =============================================================================
  const brushAreasState = useBrushAreasState();
  const {
    brushAreas,
    selectedAreaId: selectedBrushAreaId,
    setBrushAreas,
    setSelectedAreaId: setSelectedBrushAreaId,
  } = brushAreasState;

  // Check if brush tool is active
  const isBrushModeActive = activeTool === 'brush';

  // Brush settings state (for controlling brush tool from FloatingProductPicker)
  const [brushTreatmentType, setBrushTreatmentType] = useState<TreatmentAreaType>('fractional_laser');
  const [brushSize, setBrushSize] = useState<BrushSize>('medium');
  // Use full opacity (1.0) to prevent visual stacking when brush strokes overlap
  const [brushOpacity, setBrushOpacity] = useState(1.0);
  const [brushCanUndo, setBrushCanUndo] = useState(false);
  const smoothBrushRef = useRef<SmoothBrushToolRef>(null);

  // Convert treatment types for FloatingProductPicker
  const treatmentTypesForPicker = useMemo(() =>
    DEFAULT_TREATMENT_TYPES.map(t => ({
      id: t.id,
      name: t.name,
      color: t.color,
      defaultOpacity: t.defaultOpacity,
    })),
    []
  );

  // Get current treatment type config
  const currentBrushTreatmentConfig = useMemo(
    () => treatmentTypesForPicker.find(t => t.id === brushTreatmentType) || treatmentTypesForPicker[0],
    [brushTreatmentType, treatmentTypesForPicker]
  );

  // Brush undo/clear handlers
  const handleBrushUndo = useCallback(() => {
    smoothBrushRef.current?.undo();
  }, []);

  const handleBrushClearAll = useCallback(() => {
    smoothBrushRef.current?.clearAll();
  }, []);

  // Handler for when brush paths by type change - updates layer stroke counts
  // IMPORTANT: Uses extracted brushUpdateStrokeCounts to ensure stable reference
  const handleBrushPathsByTypeChange = useCallback((pathsByType: BrushPathsByType) => {
    const strokeCounts: Record<string, number> = {};
    Object.entries(pathsByType).forEach(([type, paths]) => {
      strokeCounts[type] = paths?.length || 0;
    });
    // DEBUG: Log received stroke counts (uncomment to debug)
    // console.log('[ChartingPage] handleBrushPathsByTypeChange:', strokeCounts);
    brushUpdateStrokeCounts(strokeCounts);
  }, [brushUpdateStrokeCounts]);

  // Compute hidden treatment types for brush tool visibility control
  const hiddenBrushTreatmentTypes = useMemo(() => {
    return brushLayersState.hiddenBrushLayerIds as Set<SmoothBrushTreatmentType>;
  }, [brushLayersState.hiddenBrushLayerIds]);

  // =============================================================================
  // ZONE DETECTION STATE - For detecting treatment zones from brush strokes
  // =============================================================================
  // Detected zones are shown in a summary panel when user triggers detection
  const [detectedZones, setDetectedZones] = useState<DetectedZone[]>([]);
  const [showZoneDetectionSummary, setShowZoneDetectionSummary] = useState(false);
  const [isDetectingZones, setIsDetectingZones] = useState(false);

  // Handler to detect zones from all brush strokes
  // This is triggered when user clicks "Detect Zones" button in bottom bar
  const handleDetectZones = useCallback(async () => {
    // Verify ref is connected (should be when viewMode === '2D')
    if (!smoothBrushRef.current) {
      console.error('[DetectZones] smoothBrushRef.current is null - SmoothBrushTool may not be mounted');
      toast.error('Brush tool not ready. Make sure you are in 2D view mode.');
      return;
    }

    setIsDetectingZones(true);
    try {
      const zones = await smoothBrushRef.current.detectAllZones();
      setDetectedZones(zones);
      setShowZoneDetectionSummary(true);

      if (zones.length === 0) {
        toast('No treatment areas detected. Draw on the chart first using the Brush tool.', {
          icon: '\u{1F58C}\u{FE0F}',
          duration: 4000,
        });
      } else {
        toast.success(`Detected ${zones.length} treatment area${zones.length !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('[DetectZones] Zone detection error:', error);
      toast.error('Failed to detect zones. Please try again.');
    } finally {
      setIsDetectingZones(false);
    }
  }, []);

  // Handler to confirm detected zones
  const handleConfirmZones = useCallback((zones: DetectedZone[]) => {
    // For now, just close the summary - zones are already shown
    setShowZoneDetectionSummary(false);
    toast.success('Zones confirmed');
  }, []);

  // Convert detectedZones to ZoneTreatmentSummary format for LeftDock display
  // This shows detected treatment areas underneath the Layers section
  const zoneSummaries: ZoneTreatmentSummary[] = useMemo(() => {
    if (detectedZones.length === 0) return [];

    // Group detected zones and add treatment info from brush layers
    return detectedZones.map(zone => {
      // Get active brush layers to show which treatments are in each zone
      const activeTreatments = brushLayersState.brushLayers
        .filter(layer => layer.strokeCount > 0)
        .map(layer => ({
          treatmentType: layer.id,
          treatmentName: layer.name,
          color: layer.color,
          strokeCount: layer.strokeCount,
        }));

      return {
        zoneId: zone.zoneId,
        zoneName: zone.zoneName,
        zoneCategory: zone.category || 'general',
        treatments: activeTreatments.length > 0 ? activeTreatments : [{
          treatmentType: 'treatment',
          treatmentName: 'Treatment Area',
          color: '#8B5CF6',
          strokeCount: 1,
        }],
      };
    });
  }, [detectedZones, brushLayersState.brushLayers]);

  // Note: Arrow tool state removed - arrow functionality is now part of ShapeTool

  // =============================================================================
  // VEIN/SKETCH TOOL STATE - For drawing veins (sclerotherapy documentation)
  // =============================================================================
  const veinToolRef = useRef<VeinDrawingToolRef>(null);
  const [veinCanUndo, setVeinCanUndo] = useState(false);
  const [veinType, setVeinType] = useState<VeinType>('spider');

  // Vein undo/clear handlers
  const handleVeinUndo = useCallback(() => {
    veinToolRef.current?.undo();
  }, []);

  const handleVeinClearAll = useCallback(() => {
    veinToolRef.current?.clearAll();
  }, []);

  // =============================================================================
  // MEASUREMENT TOOL STATE - For measuring distances on charts
  // =============================================================================
  const isMeasureModeActive = activeTool === 'measure';
  const measurementState = useMeasurementState();
  const {
    measurements,
    setMeasurements,
    calibration,
    setCalibration,
  } = measurementState;

  // =============================================================================
  // SHAPE TOOL STATE - For drawing circles, rectangles, freeform shapes
  // =============================================================================
  const isShapeModeActive = activeTool === 'shape';
  const shapesState = useShapesState();
  const {
    shapes,
    selectedShapeId,
    setShapes,
    setSelectedShapeId,
  } = shapesState;

  // Shape tool ref for RightDock integration (undo/clear via ref)
  const shapeToolRef = useRef<ShapeToolRef>(null);
  // Shape tool settings state (controlled by RightDock when active)
  const [shapeType, setShapeType] = useState<ShapeType>('circle');
  const [shapeColor, setShapeColor] = useState<string>(DEFAULT_SHAPE_COLORS[0] || '#3B82F6');
  const [shapeFilled, setShapeFilled] = useState<boolean>(false);

  // Shape undo/clear handlers (via ref)
  const handleShapeUndo = useCallback(() => {
    shapeToolRef.current?.undo();
  }, []);

  const handleShapeClearAll = useCallback(() => {
    shapeToolRef.current?.clearAll();
  }, []);

  // =============================================================================
  // SKETCH MODE STATE - Umbrella for Veins and Cannula sub-modes
  // =============================================================================
  // The Sketch tool combines vein drawing (sclerotherapy) and cannula path tools
  // into a unified tool with sub-mode selection in RightDock.
  const [sketchMode, setSketchMode] = useState<SketchMode>('veins');
  const isSketchModeActive = activeTool === 'sketch';
  // Backwards-compatible: cannula is active when sketch tool is active AND sketchMode is 'cannula'
  const isCannulaModeActive = isSketchModeActive && sketchMode === 'cannula';
  // Backwards-compatible: vein is active when sketch tool is active AND sketchMode is 'veins'
  const isVeinModeActive = isSketchModeActive && sketchMode === 'veins';

  // =============================================================================
  // CANNULA PATH TOOL STATE - For documenting cannula injection paths
  // =============================================================================
  // NOTE: Cannula tool has its OWN product/color state, independent from the
  // injection point tools. This prevents the FloatingProductPicker (which controls
  // pen/freehand injection points) from affecting cannula path colors.
  const cannulaState = useCannulaPathsState();
  const {
    cannulaPaths,
    selectedPathId: selectedCannulaPathId,
    setCannulaPaths,
    setSelectedPathId: setSelectedCannulaPathId,
  } = cannulaState;

  // Cannula-specific product selection (independent from injection point product)
  // Default to orange (#F97316) which is the traditional color for filler/cannula work
  const [cannulaProductColor, setCannulaProductColor] = useState('#F97316');
  const [cannulaProductId, setCannulaProductId] = useState<string | undefined>(undefined);
  // Cannula technique state (controlled by RightDock when active)
  const [cannulaType, setCannulaType] = useState<CannulaTechnique>('linear');

  // Cannula undo/clear handlers (using the state's clearAllPaths)
  const handleCannulaUndo = useCallback(() => {
    // Undo by removing the last path - simple approach
    if (cannulaPaths.length > 0) {
      setCannulaPaths(cannulaPaths.slice(0, -1));
    }
  }, [cannulaPaths, setCannulaPaths]);

  const handleCannulaClearAll = useCallback(() => {
    cannulaState.clearAllPaths();
  }, [cannulaState]);

  // =============================================================================
  // VEIN DRAWING TOOL STATE - For sclerotherapy documentation
  // =============================================================================
  // Note: isVeinModeActive is now derived from sketchMode above
  const veinState = useVeinPathsState();
  const {
    veinPaths,
    selectedVeinId,
    setVeinPaths,
    setSelectedVeinId,
  } = veinState;

  // DEBUG: Track veinPaths changes at the page level
  useEffect(() => {
    console.log('[ChartingPage] ===== veinPaths CHANGED (via useEffect) =====');
    console.log('[ChartingPage] veinPaths.length:', veinPaths.length);
    console.log('[ChartingPage] veinPaths ids:', veinPaths.map(v => v.id));
    console.log('[ChartingPage] ==============================================');
  }, [veinPaths]);

  // =============================================================================
  // SIMPLE TEXT TOOL STATE - Quick text annotations using Konva
  // =============================================================================
  const isSimpleTextModeActive = activeTool === 'simpleText';
  const simpleTextState = useSimpleTextLabels();
  const {
    labels: simpleTextLabels,
    setLabels: setSimpleTextLabels,
    selectedPreset: simpleTextSelectedPreset,
    setSelectedPreset: setSimpleTextSelectedPreset,
  } = simpleTextState;
  const simpleTextToolRef = useRef<SimpleTextToolRef>(null);
  const [simpleTextCanUndo, setSimpleTextCanUndo] = useState(false);

  // Simple text handlers
  const handleSimpleTextUndo = useCallback(() => {
    simpleTextToolRef.current?.undo();
  }, []);

  const handleSimpleTextClearAll = useCallback(() => {
    simpleTextToolRef.current?.clearAll();
  }, []);

  // =============================================================================
  // DANGER ZONE OVERLAY STATE - Safety overlay for arteries/nerves
  // =============================================================================
  const [showDangerZones, setShowDangerZones] = useState(false);
  const toggleDangerZones = useCallback(() => {
    setShowDangerZones(prev => !prev);
  }, []);

  // =============================================================================
  // OVERLAY TOOL DETECTION - When overlay tools are active, disable chart interactions
  // =============================================================================
  // These tools render on top of the chart and need the underlying chart to have
  // pointer-events-none so their overlays can receive mouse/touch/stylus events.
  // Without this, the FaceChartWithZoom/TorsoChartWithZoom handlers intercept events.
  // NOTE: Brush mode is EXCLUDED - it handles its own zoom passthrough via Konva Stage
  // and needs FaceChartWithZoom to remain active for two-finger zoom gestures.
  // NOTE: SimpleText mode uses Konva like Brush, so it also handles its own zoom passthrough.
  const isOverlayToolActive = isMeasureModeActive || isShapeModeActive || isSketchModeActive || isSimpleTextModeActive;

  // Get the current view key based on body part and gender
  const currentView2DKey = useMemo(() => getView2DKey(bodyPart, gender), [bodyPart, gender]);

  // Get the current view's injection points (for passing to chart components)
  const currentInjectionPoints = injectionPointsByView[currentView2DKey];
  const currentFreehandPoints = freehandPointsByView[currentView2DKey];

  // =============================================================================
  // LAYER-FILTERED INJECTION POINTS
  // =============================================================================
  // Filter injection points based on layer visibility - hidden layers' points won't render
  // But we keep the full points in state so they're not lost when toggling visibility

  const filteredInjectionPoints = useMemo(() => {
    const filtered = new Map<string, InjectionPoint>();
    currentInjectionPoints.forEach((point, key) => {
      const productId = point.productId || selectedProduct?.id || 'botox';
      if (layersState.isLayerVisible(productId)) {
        filtered.set(key, point);
      }
    });
    return filtered;
  }, [currentInjectionPoints, layersState, selectedProduct?.id]);

  const filteredFreehandPoints = useMemo(() => {
    const filtered = new Map<string, FreehandPoint>();
    currentFreehandPoints.forEach((point, key) => {
      const productId = point.productId || selectedProduct?.id || 'botox';
      if (layersState.isLayerVisible(productId)) {
        filtered.set(key, point);
      }
    });
    return filtered;
  }, [currentFreehandPoints, layersState, selectedProduct?.id]);

  // Injection points state (for 3D charts) - isolated per body part
  const [injectionPoints3DByBodyPart, setInjectionPoints3DByBodyPart] = useState<{
    face: Map<string, InjectionPoint3D>;
    torso: Map<string, InjectionPoint3D>;
    fullBody: Map<string, InjectionPoint3D>;
  }>({
    face: new Map(),
    torso: new Map(),
    fullBody: new Map(),
  });

  // Get the current body part's 3D injection points
  const injectionPoints3D = injectionPoints3DByBodyPart[bodyPart];

  // =============================================================================
  // REFS FOR HISTORY SNAPSHOT - Avoids recreating createSnapshot on every state change
  // =============================================================================
  // These refs hold the latest state values for use in callbacks without causing re-renders
  // IMPORTANT: ALL tool states must have refs for the unified history to work properly
  const injectionPointsByViewRef = useRef(injectionPointsByView);
  const freehandPointsByViewRef = useRef(freehandPointsByView);
  const injectionPoints3DByBodyPartRef = useRef(injectionPoints3DByBodyPart);
  const veinPathsRef = useRef(veinPaths);
  const shapesRef = useRef(shapes);
  const measurementsRef = useRef(measurements);
  const cannulaPathsRef = useRef(cannulaPaths);

  // Keep refs in sync with state
  useEffect(() => {
    injectionPointsByViewRef.current = injectionPointsByView;
  }, [injectionPointsByView]);

  useEffect(() => {
    freehandPointsByViewRef.current = freehandPointsByView;
  }, [freehandPointsByView]);

  useEffect(() => {
    injectionPoints3DByBodyPartRef.current = injectionPoints3DByBodyPart;
  }, [injectionPoints3DByBodyPart]);

  useEffect(() => {
    veinPathsRef.current = veinPaths;
  }, [veinPaths]);

  useEffect(() => {
    shapesRef.current = shapes;
  }, [shapes]);

  useEffect(() => {
    measurementsRef.current = measurements;
  }, [measurements]);

  useEffect(() => {
    cannulaPathsRef.current = cannulaPaths;
  }, [cannulaPaths]);

  // =============================================================================
  // FILTER 3D INJECTION POINTS BY LAYER VISIBILITY
  // =============================================================================
  // 3D points now track productId for per-product filtering
  // Falls back to productType-based defaults for legacy points without productId

  const filteredInjectionPoints3DByBodyPart = useMemo(() => {
    const filterPoints = (points: Map<string, InjectionPoint3D>) => {
      const filtered = new Map<string, InjectionPoint3D>();
      points.forEach((point, key) => {
        // Use productId if available, otherwise fallback to type-based default
        const productIdToCheck = point.productId ||
          (point.productType === 'neurotoxin' ? 'botox' : 'juvederm-ultra');

        // Filter by specific product layer visibility
        if (layersState.isLayerVisible(productIdToCheck)) {
          filtered.set(key, point);
        }
      });
      return filtered;
    };

    return {
      face: filterPoints(injectionPoints3DByBodyPart.face),
      torso: filterPoints(injectionPoints3DByBodyPart.torso),
      fullBody: filterPoints(injectionPoints3DByBodyPart.fullBody),
    };
  }, [injectionPoints3DByBodyPart, layersState]);

  // Summary bar state
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  // Action states
  const [isSaving, setIsSaving] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);

  // Tab state - default to injection-map (full-screen)
  const [activeTab, setActiveTab] = useState<TabId>('injection-map');

  // =============================================================================
  // CHARTING MODE STATE FOR 3D COMPONENTS
  // =============================================================================
  // Default to 'addPoints' so users can immediately start placing injection points
  // This mode is shared between the page and 3D components for coordination
  // Note: FaceChart3D and BodyChart3D manage their own internal interactionMode
  // ('add' | 'select') which maps to this: addPoints='add', navigate='select'
  const [chartingMode, setChartingMode] = useState<ChartingMode>('addPoints');

  // Handler to sync mode changes (can be passed to 3D components if needed)
  const handleChartingModeChange = useCallback((mode: ChartingMode) => {
    setChartingMode(mode);
  }, []);

  // =============================================================================
  // UNDO/REDO HISTORY STATE AND FUNCTIONS
  // =============================================================================
  // Comprehensive history tracking for injection point operations (add, move, edit, delete)
  // Maximum 50 states to prevent memory issues
  // IMPORTANT: Using a combined state object instead of separate state for history and index
  // to avoid callback dependency issues that cause infinite loops
  const [historyState, setHistoryState] = useState<{
    history: HistorySnapshot[];
    index: number;
  }>({
    history: [],
    index: -1,
  });
  // Extract for easier access (computed values, no state setter needed)
  const undoHistory = historyState.history;
  const undoHistoryIndex = historyState.index;
  const isRestoringFromHistory = useRef(false);
  // Ref to track if we should add to history after next state update
  // Used by handlers to defer history addition until AFTER state changes
  // This ensures snapshots capture the NEW state, not the old state
  const pendingHistoryOperation = useRef<HistorySnapshot['operation'] | null>(null);
  // Track initial load to avoid adding to history during initialization
  // Note: This is separate from the save state isInitialLoad ref
  const isHistoryInitialLoad = useRef(true);

  // Create a snapshot of current state for history
  // IMPORTANT: Uses refs instead of state to avoid recreating this callback on every state change
  // This prevents infinite loop issues where addToHistory -> createSnapshot -> state dependency -> rerender
  // This now captures ALL tool states for unified undo/redo across any action type
  const createSnapshot = useCallback((operation: HistorySnapshot['operation'] = 'add'): HistorySnapshot => {
    const ipbv = injectionPointsByViewRef.current;
    const fpbv = freehandPointsByViewRef.current;
    const ip3d = injectionPoints3DByBodyPartRef.current;
    const veins = veinPathsRef.current;
    const shapeAnnotations = shapesRef.current;
    const measurementData = measurementsRef.current;
    const cannulaData = cannulaPathsRef.current;

    return {
      // Injection points (2D zone-based)
      injectionPointsByView: {
        femaleFace: Array.from(ipbv.femaleFace.entries()),
        maleFace: Array.from(ipbv.maleFace.entries()),
        femaleTorso: Array.from(ipbv.femaleTorso.entries()),
        maleTorso: Array.from(ipbv.maleTorso.entries()),
        femaleFullBody: Array.from(ipbv.femaleFullBody.entries()),
        maleFullBody: Array.from(ipbv.maleFullBody.entries()),
      },
      // Freehand points (2D custom placement)
      freehandPointsByView: {
        femaleFace: Array.from(fpbv.femaleFace.entries()),
        maleFace: Array.from(fpbv.maleFace.entries()),
        femaleTorso: Array.from(fpbv.femaleTorso.entries()),
        maleTorso: Array.from(fpbv.maleTorso.entries()),
        femaleFullBody: Array.from(fpbv.femaleFullBody.entries()),
        maleFullBody: Array.from(fpbv.maleFullBody.entries()),
      },
      // 3D injection points
      injectionPoints3DByBodyPart: {
        face: Array.from(ip3d.face.entries()),
        torso: Array.from(ip3d.torso.entries()),
        fullBody: Array.from(ip3d.fullBody.entries()),
      },
      // Other tools (deep copy)
      veinPaths: [...veins],
      shapes: [...shapeAnnotations],
      measurements: [...measurementData],
      cannulaPaths: [...cannulaData],
      // Metadata
      timestamp: Date.now(),
      operation,
    };
  }, []); // No dependencies - uses refs for latest values

  // Restore state from a history snapshot
  // This now restores ALL tool states for unified undo/redo
  const restoreFromSnapshot = useCallback((snapshot: HistorySnapshot) => {
    isRestoringFromHistory.current = true;

    // Restore injection points (2D zone-based)
    setInjectionPointsByView({
      femaleFace: new Map(snapshot.injectionPointsByView.femaleFace),
      maleFace: new Map(snapshot.injectionPointsByView.maleFace),
      femaleTorso: new Map(snapshot.injectionPointsByView.femaleTorso),
      maleTorso: new Map(snapshot.injectionPointsByView.maleTorso),
      femaleFullBody: new Map(snapshot.injectionPointsByView.femaleFullBody),
      maleFullBody: new Map(snapshot.injectionPointsByView.maleFullBody),
    });

    // Restore freehand points (2D custom placement)
    setFreehandPointsByView({
      femaleFace: new Map(snapshot.freehandPointsByView.femaleFace),
      maleFace: new Map(snapshot.freehandPointsByView.maleFace),
      femaleTorso: new Map(snapshot.freehandPointsByView.femaleTorso),
      maleTorso: new Map(snapshot.freehandPointsByView.maleTorso),
      femaleFullBody: new Map(snapshot.freehandPointsByView.femaleFullBody),
      maleFullBody: new Map(snapshot.freehandPointsByView.maleFullBody),
    });

    // Restore 3D injection points
    setInjectionPoints3DByBodyPart({
      face: new Map(snapshot.injectionPoints3DByBodyPart.face),
      torso: new Map(snapshot.injectionPoints3DByBodyPart.torso),
      fullBody: new Map(snapshot.injectionPoints3DByBodyPart.fullBody),
    });

    // Restore other tools
    setVeinPaths([...snapshot.veinPaths]);
    setShapes([...snapshot.shapes]);
    setMeasurements([...snapshot.measurements]);
    setCannulaPaths([...snapshot.cannulaPaths]);

    // Reset the flag after a brief delay to allow state to settle
    setTimeout(() => {
      isRestoringFromHistory.current = false;
    }, 100);
  }, [setVeinPaths, setShapes, setMeasurements, setCannulaPaths]);

  // Add current state to history (called after any point operation)
  // IMPORTANT: Uses functional update on combined historyState to avoid dependency issues
  const addToHistory = useCallback((operation: HistorySnapshot['operation'] = 'add') => {
    // Don't add to history if we're restoring from history
    if (isRestoringFromHistory.current) return;

    const snapshot = createSnapshot(operation);

    setHistoryState(prev => {
      // Remove any future states if we're not at the end
      const newHistory = prev.history.slice(0, prev.index + 1);
      // Add new snapshot
      newHistory.push(snapshot);
      // Limit to MAX_HISTORY_SIZE
      const trimmedHistory = newHistory.length > MAX_HISTORY_SIZE
        ? newHistory.slice(-MAX_HISTORY_SIZE)
        : newHistory;

      return {
        history: trimmedHistory,
        index: Math.min(prev.index + 1, MAX_HISTORY_SIZE - 1),
      };
    });
  }, [createSnapshot]);

  // Can we undo/redo?
  const canUndo = undoHistoryIndex > 0;
  const canRedo = undoHistoryIndex < undoHistory.length - 1;

  // Undo function - go back in history
  // Uses functional update to avoid depending on changing state
  const undo = useCallback(() => {
    setHistoryState(prev => {
      if (prev.index <= 0) return prev;

      const newIndex = prev.index - 1;
      const snapshot = prev.history[newIndex];

      if (snapshot) {
        restoreFromSnapshot(snapshot);
        toast.success('Undo successful', { duration: 1000, icon: '↩️' });
        return { ...prev, index: newIndex };
      }
      return prev;
    });
  }, [restoreFromSnapshot]);

  // Redo function - go forward in history
  // Uses functional update to avoid depending on changing state
  const redo = useCallback(() => {
    setHistoryState(prev => {
      if (prev.index >= prev.history.length - 1) return prev;

      const newIndex = prev.index + 1;
      const snapshot = prev.history[newIndex];

      if (snapshot) {
        restoreFromSnapshot(snapshot);
        toast.success('Redo successful', { duration: 1000, icon: '↪️' });
        return { ...prev, index: newIndex };
      }
      return prev;
    });
  }, [restoreFromSnapshot]);

  // Initialize history with initial empty state on mount
  useEffect(() => {
    if (undoHistory.length === 0) {
      const initialSnapshot = createSnapshot('initial');
      setHistoryState({
        history: [initialSnapshot],
        index: 0,
      });
      // Mark initial load as complete after a brief delay
      // This prevents the first state changes from being added to history twice
      setTimeout(() => {
        isHistoryInitialLoad.current = false;
      }, 100);
    }
  }, []); // Only run once on mount

  // =============================================================================
  // UNIFIED UNDO/REDO - GLOBAL history that works for ALL actions
  // =============================================================================
  // These unified handlers are used by the UI buttons (GlobalActionsToolbar, FloatingToolPalette)
  // The HistorySnapshot now captures ALL tool states, so ONE undo works for ANY action:
  // - Botox point placement -> undo
  // - Brush stroke -> undo
  // - Vein drawing -> undo
  // - Text label -> undo
  // - Shape/Measurement/Cannula -> undo
  // Note: Arrow tool was removed - arrow shapes are now part of ShapeTool
  //
  // IMPORTANT: Brush strokes are a special case - they use react-sketch-canvas which has
  // its own internal undo. For brush strokes, we still route to the brush tool's undo
  // because the canvas paths aren't easily serializable to our snapshot format.
  const unifiedUndo = useCallback(() => {
    // Special case: Brush tool has its own internal undo via react-sketch-canvas
    // that isn't easily captured in our snapshot format
    if (isBrushModeActive && brushCanUndo) {
      smoothBrushRef.current?.undo();
    } else if (canUndo) {
      // Use the global history for everything else (text labels, veins, shapes, etc.)
      undo();
    }
  }, [isBrushModeActive, brushCanUndo, canUndo, undo]);

  const unifiedRedo = useCallback(() => {
    // Special case: Brush tool has its own internal redo
    if (isBrushModeActive) {
      smoothBrushRef.current?.redo();
    } else if (canRedo) {
      // Use the global history for everything else
      redo();
    }
  }, [isBrushModeActive, canRedo, redo]);

  // Unified canUndo/canRedo - global history covers all tools except brush strokes
  const unifiedCanUndo = isBrushModeActive ? brushCanUndo : canUndo;
  const unifiedCanRedo = isBrushModeActive ? false : canRedo; // SmoothBrushTool doesn't expose canRedo state

  // =============================================================================
  // HISTORY-AWARE HANDLERS FOR OTHER TOOLS
  // =============================================================================
  // IMPORTANT: These handlers use the same DEFERRED pattern as injection points.
  // They set pendingHistoryOperation THEN update state. The effect below will
  // then call addToHistory AFTER the state has been updated and refs are synced.
  // This ensures the snapshot captures the NEW state, not the old state.

  // Measurements - use deferred history pattern
  const handleMeasurementsChange = useCallback((newMeasurements: Measurement[]) => {
    pendingHistoryOperation.current = 'measurement';
    setMeasurements(newMeasurements);
  }, [setMeasurements]);

  // Shapes - use deferred history pattern
  const handleShapesChange = useCallback((newShapes: ShapeAnnotation[]) => {
    pendingHistoryOperation.current = 'shape';
    setShapes(newShapes);
  }, [setShapes]);

  // Cannula paths - use deferred history pattern
  const handleCannulaPathsChange = useCallback((newPaths: CannulaPath[]) => {
    pendingHistoryOperation.current = 'cannula';
    setCannulaPaths(newPaths);
  }, [setCannulaPaths]);

  // Vein paths - use deferred history pattern
  const handleVeinPathsChange = useCallback((newPaths: VeinPath[]) => {
    console.log('[ChartingPage] handleVeinPathsChange CALLED');
    console.log('[ChartingPage] newPaths count:', newPaths.length);
    console.log('[ChartingPage] newPaths ids:', newPaths.map(v => v.id));
    pendingHistoryOperation.current = 'vein';
    console.log('[ChartingPage] About to call setVeinPaths...');
    setVeinPaths(newPaths);
    console.log('[ChartingPage] setVeinPaths CALLED');
  }, [setVeinPaths]);

  // =============================================================================
  // CLEAR ALL - Global action to reset all chart markings
  // =============================================================================
  // Computes whether there's any content to clear (injection points, freehand points, 3D points, brush strokes)
  const hasChartContent = useMemo(() => {
    // Check 2D injection points
    const has2DInjections = Object.values(injectionPointsByView).some(map => map.size > 0);
    // Check 2D freehand points
    const has2DFreehand = Object.values(freehandPointsByView).some(map => map.size > 0);
    // Check 3D injection points
    const has3DInjections = Object.values(injectionPoints3DByBodyPart).some(map => map.size > 0);
    // Check brush strokes (if there are strokes to undo, there's content)
    const hasBrushStrokes = brushCanUndo;

    return has2DInjections || has2DFreehand || has3DInjections || hasBrushStrokes;
  }, [injectionPointsByView, freehandPointsByView, injectionPoints3DByBodyPart, brushCanUndo]);

  // Clear all markings from the current view (and optionally all views)
  const clearAllMarkings = useCallback(() => {
    // Save snapshot before clearing for undo
    addToHistory('delete');

    // Clear all 2D injection points
    setInjectionPointsByView({
      femaleFace: new Map(),
      maleFace: new Map(),
      femaleTorso: new Map(),
      maleTorso: new Map(),
      femaleFullBody: new Map(),
      maleFullBody: new Map(),
    });

    // Clear all 2D freehand points
    setFreehandPointsByView({
      femaleFace: new Map(),
      maleFace: new Map(),
      femaleTorso: new Map(),
      maleTorso: new Map(),
      femaleFullBody: new Map(),
      maleFullBody: new Map(),
    });

    // Clear all 3D injection points
    setInjectionPoints3DByBodyPart({
      face: new Map(),
      torso: new Map(),
      fullBody: new Map(),
    });

    // Clear brush strokes if brush tool is available
    if (smoothBrushRef.current) {
      smoothBrushRef.current.clearAll();
    }

    // Show toast confirmation
    toast.success('All markings cleared', { duration: 1500, icon: '🗑️' });
  }, [addToHistory]);

  // Photos state
  const [photos, setPhotos] = useState<TreatmentPhoto[]>([]);

  // Print modal state
  const [showPrintModal, setShowPrintModal] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // =============================================================================
  // SAVE AND AUTOSAVE STATE
  // =============================================================================
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const hasUnsavedChanges = useRef(false);
  const isInitialLoad = useRef(true);

  // =============================================================================
  // PRELOAD ALL 3D MODELS AND COMPONENTS ON PAGE MOUNT
  // =============================================================================
  // Optimistically preload ALL 3D content when the page loads so switching
  // between 2D/3D is instant with no loading spinner. This includes:
  // 1. Component chunks (JavaScript bundles)
  // 2. GLB/GLTF 3D model assets
  // 3. Pre-warming the WebGL context by rendering hidden 3D components
  // Start with true to allow immediate rendering - Suspense handles loading states
  const [modelsPreloaded, setModelsPreloaded] = useState(true);

  useEffect(() => {
    // Background preloading for faster subsequent loads (non-blocking)
    // The 3D components will render immediately via Suspense, this just warms the cache
    const preloadInBackground = async () => {
      try {
        // Preload component chunks in parallel
        await Promise.all([
          preloadFaceChart3D(),
          preloadBodyChart3D(),
        ]);

        // Attempt to preload GLB models (non-blocking)
        // Note: useGLTF.preload is synchronous and just schedules the loads
        preloadGLBModels().catch((err) => {
          console.warn('GLB preload warning (non-fatal):', err);
        });
      } catch (err) {
        console.warn('3D component preload warning (non-fatal):', err);
      }
    };

    preloadInBackground();
  }, []);

  // =============================================================================
  // SAVE CHART FUNCTION
  // =============================================================================
  // Saves current chart state to localStorage (mock backend for now)
  const saveChart = useCallback(async () => {
    if (!hasUnsavedChanges.current) return;

    setSaveState('saving');
    try {
      // Simulate network delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Convert Maps to serializable format
      const serializeMap = (map: Map<string, unknown>) =>
        Object.fromEntries(map);

      const chartData = {
        patientId: MOCK_PATIENT.id,
        timestamp: new Date().toISOString(),
        injectionPointsByView: {
          femaleFace: serializeMap(injectionPointsByView.femaleFace),
          maleFace: serializeMap(injectionPointsByView.maleFace),
          femaleTorso: serializeMap(injectionPointsByView.femaleTorso),
          maleTorso: serializeMap(injectionPointsByView.maleTorso),
          femaleFullBody: serializeMap(injectionPointsByView.femaleFullBody),
          maleFullBody: serializeMap(injectionPointsByView.maleFullBody),
        },
        freehandPointsByView: {
          femaleFace: serializeMap(freehandPointsByView.femaleFace),
          maleFace: serializeMap(freehandPointsByView.maleFace),
          femaleTorso: serializeMap(freehandPointsByView.femaleTorso),
          maleTorso: serializeMap(freehandPointsByView.maleTorso),
          femaleFullBody: serializeMap(freehandPointsByView.femaleFullBody),
          maleFullBody: serializeMap(freehandPointsByView.maleFullBody),
        },
        injectionPoints3DByBodyPart: {
          face: serializeMap(injectionPoints3DByBodyPart.face),
          torso: serializeMap(injectionPoints3DByBodyPart.torso),
          fullBody: serializeMap(injectionPoints3DByBodyPart.fullBody),
        },
        selectedProduct: selectedProduct,
        dosage: dosage,
      };

      localStorage.setItem(`chartDraft-${MOCK_PATIENT.id}`, JSON.stringify(chartData));

      setSaveState('saved');
      setLastSaved(new Date());
      hasUnsavedChanges.current = false;
    } catch (error) {
      console.error('Failed to save chart:', error);
      setSaveState('error');
      toast.error('Failed to save chart');
    }
  }, [injectionPointsByView, freehandPointsByView, injectionPoints3DByBodyPart, selectedProduct, dosage]);

  // =============================================================================
  // LOAD SAVED DRAFT ON PAGE LOAD
  // =============================================================================
  useEffect(() => {
    const loadSavedDraft = () => {
      try {
        const savedData = localStorage.getItem(`chartDraft-${MOCK_PATIENT.id}`);
        if (savedData) {
          const chartData = JSON.parse(savedData);

          // Convert serialized objects back to Maps
          const deserializeMap = <T,>(obj: Record<string, T>) =>
            new Map(Object.entries(obj));

          // Restore injection points
          if (chartData.injectionPointsByView) {
            setInjectionPointsByView({
              femaleFace: deserializeMap(chartData.injectionPointsByView.femaleFace || {}),
              maleFace: deserializeMap(chartData.injectionPointsByView.maleFace || {}),
              femaleTorso: deserializeMap(chartData.injectionPointsByView.femaleTorso || {}),
              maleTorso: deserializeMap(chartData.injectionPointsByView.maleTorso || {}),
              femaleFullBody: deserializeMap(chartData.injectionPointsByView.femaleFullBody || {}),
              maleFullBody: deserializeMap(chartData.injectionPointsByView.maleFullBody || {}),
            });
          }

          // Restore freehand points
          if (chartData.freehandPointsByView) {
            setFreehandPointsByView({
              femaleFace: deserializeMap(chartData.freehandPointsByView.femaleFace || {}),
              maleFace: deserializeMap(chartData.freehandPointsByView.maleFace || {}),
              femaleTorso: deserializeMap(chartData.freehandPointsByView.femaleTorso || {}),
              maleTorso: deserializeMap(chartData.freehandPointsByView.maleTorso || {}),
              femaleFullBody: deserializeMap(chartData.freehandPointsByView.femaleFullBody || {}),
              maleFullBody: deserializeMap(chartData.freehandPointsByView.maleFullBody || {}),
            });
          }

          // Restore 3D points
          if (chartData.injectionPoints3DByBodyPart) {
            setInjectionPoints3DByBodyPart({
              face: deserializeMap(chartData.injectionPoints3DByBodyPart.face || {}),
              torso: deserializeMap(chartData.injectionPoints3DByBodyPart.torso || {}),
              fullBody: deserializeMap(chartData.injectionPoints3DByBodyPart.fullBody || {}),
            });
          }

          // Restore product selection
          if (chartData.selectedProduct) {
            setSelectedProduct(chartData.selectedProduct);
          }
          if (chartData.dosage) {
            setDosage(chartData.dosage);
          }

          // Set last saved time
          if (chartData.timestamp) {
            setLastSaved(new Date(chartData.timestamp));
          }

          toast.success('Draft restored', { duration: 2000 });
        }
      } catch (error) {
        console.error('Failed to load saved draft:', error);
      }

      // Mark initial load complete
      isInitialLoad.current = false;
    };

    loadSavedDraft();
  }, []);

  // =============================================================================
  // TRACK UNSAVED CHANGES
  // =============================================================================
  useEffect(() => {
    // Skip marking unsaved during initial load
    if (isInitialLoad.current) return;

    hasUnsavedChanges.current = true;
    setSaveState('unsaved');
  }, [injectionPointsByView, freehandPointsByView, injectionPoints3DByBodyPart]);

  // =============================================================================
  // AUTOSAVE EVERY 30 SECONDS
  // =============================================================================
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasUnsavedChanges.current) {
        saveChart();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [saveChart]);

  // =============================================================================
  // KEYBOARD SHORTCUT: Cmd/Ctrl + S TO SAVE
  // =============================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveChart();
        toast.success('Chart saved', { duration: 1500 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveChart]);

  // =============================================================================
  // KEYBOARD SHORTCUTS: Cmd/Ctrl + Z FOR UNDO, Cmd/Ctrl + Shift + Z FOR REDO
  // =============================================================================
  useEffect(() => {
    const handleUndoRedo = (e: KeyboardEvent) => {
      // Check if we're in an input field where we shouldn't intercept
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (isInputField) return;

      // Undo: Cmd/Ctrl + Z (without Shift)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        // If brush tool is active and has strokes to undo, undo brush strokes first
        if (isBrushModeActive && brushCanUndo) {
          smoothBrushRef.current?.undo();
        } else if (canUndo) {
          undo();
        }
      }

      // Redo: Cmd/Ctrl + Shift + Z OR Cmd/Ctrl + Y
      if ((e.metaKey || e.ctrlKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        // If brush tool is active, redo brush strokes
        if (isBrushModeActive) {
          smoothBrushRef.current?.redo();
        } else if (canRedo) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleUndoRedo);
    return () => window.removeEventListener('keydown', handleUndoRedo);
  }, [canUndo, canRedo, undo, redo, isBrushModeActive, brushCanUndo]);

  // =============================================================================
  // KEYBOARD SHORTCUT: ? TO SHOW KEYBOARD SHORTCUTS HELP
  // =============================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show keyboard shortcuts help when ? is pressed (not in an input field)
      if (e.key === '?' && !showKeyboardShortcuts) {
        const target = e.target as HTMLElement;
        const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
        if (!isInputField) {
          e.preventDefault();
          setShowKeyboardShortcuts(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showKeyboardShortcuts]);

  // =============================================================================
  // KEYBOARD SHORTCUT: 1-9 FOR QUICK DOSAGE SELECTION
  // =============================================================================
  // Maps number keys to quick dosage values (1=5u, 2=10u, 3=15u, 4=20u, 5=25u for neurotoxins)
  // For fillers, maps to 0.5, 1.0, 1.5, 2.0 ml
  useEffect(() => {
    const handleNumberKeys = (e: KeyboardEvent) => {
      // Skip if in input field
      const target = e.target as HTMLElement;
      const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (isInputField) return;

      // Only handle number keys 1-9 (not numpad, not with modifiers)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const keyNumber = parseInt(e.key, 10);
      if (isNaN(keyNumber) || keyNumber < 1 || keyNumber > 9) return;

      // Get the appropriate quick dosages based on product type
      const quickDosages = productType === 'neurotoxin' ? [5, 10, 15, 20, 25] : [0.5, 1.0, 1.5, 2.0];

      // Map key 1-5 (or 1-4 for fillers) to dosage values
      const dosageIndex = keyNumber - 1;
      if (dosageIndex < quickDosages.length) {
        const newDosage = quickDosages[dosageIndex];
        setDosage(newDosage);
        toast.success(`Dosage: ${newDosage}${productType === 'neurotoxin' ? 'u' : 'ml'}`, { duration: 1000 });
      }
    };

    window.addEventListener('keydown', handleNumberKeys);
    return () => window.removeEventListener('keydown', handleNumberKeys);
  }, [productType]);

  // =============================================================================
  // WARN BEFORE LEAVING WITH UNSAVED CHANGES
  // =============================================================================
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Convert injection points for summary bar
  // Aggregates points from ALL views (2D and 3D) for a complete treatment summary
  const summaryInjectionPoints = useMemo(() => {
    const points: Array<{
      id: string;
      x: number;
      y: number;
      productId: string;
      units: number;
    }> = [];

    // Add 2D injection points from ALL views
    const all2DViewKeys: View2DKey[] = ['femaleFace', 'maleFace', 'femaleTorso', 'maleTorso', 'femaleFullBody', 'maleFullBody'];
    all2DViewKeys.forEach(viewKey => {
      const viewPoints = injectionPointsByView[viewKey];
      viewPoints.forEach((point, key) => {
        points.push({
          id: `2d-${viewKey}-${key}`,
          x: 0,
          y: 0,
          productId: selectedProduct?.id || 'botox',
          units: point.units || point.volume || 0,
        });
      });
    });

    // Add freehand points from ALL views
    all2DViewKeys.forEach(viewKey => {
      const viewFreehand = freehandPointsByView[viewKey];
      viewFreehand.forEach((point, key) => {
        points.push({
          id: `freehand-${viewKey}-${key}`,
          x: point.x,
          y: point.y,
          productId: selectedProduct?.id || 'botox',
          units: point.units || point.volume || 0,
        });
      });
    });

    // Add 3D points from ALL body parts for complete summary
    const allBodyParts: BodyPart[] = ['face', 'torso', 'fullBody'];
    allBodyParts.forEach(part => {
      const partPoints = injectionPoints3DByBodyPart[part];
      partPoints.forEach((point, key) => {
        points.push({
          id: `3d-${part}-${key}`,
          x: 0,
          y: 0,
          productId: selectedProduct?.id || 'botox',
          units: point.units || point.volume || 0,
        });
      });
    });

    return points;
  }, [injectionPointsByView, freehandPointsByView, injectionPoints3DByBodyPart, selectedProduct]);

  // =============================================================================
  // UPDATE LAYERS POINT COUNTS
  // =============================================================================
  // Calculate point counts per product and update the layers panel
  // Extract updatePointCounts to avoid including the entire layersState object in deps
  const { updatePointCounts } = layersState;

  useEffect(() => {
    const pointsByProduct = new Map<string, number>();

    // Count points from all 2D views
    const all2DViewKeys: View2DKey[] = ['femaleFace', 'maleFace', 'femaleTorso', 'maleTorso', 'femaleFullBody', 'maleFullBody'];
    all2DViewKeys.forEach(viewKey => {
      const viewPoints = injectionPointsByView[viewKey];
      viewPoints.forEach((point) => {
        const productId = point.productId || selectedProduct?.id || 'botox';
        pointsByProduct.set(productId, (pointsByProduct.get(productId) || 0) + 1);
      });

      const viewFreehand = freehandPointsByView[viewKey];
      viewFreehand.forEach((point) => {
        const productId = point.productId || selectedProduct?.id || 'botox';
        pointsByProduct.set(productId, (pointsByProduct.get(productId) || 0) + 1);
      });
    });

    // Count points from all 3D body parts
    const allBodyParts: BodyPart[] = ['face', 'torso', 'fullBody'];
    allBodyParts.forEach(part => {
      const partPoints = injectionPoints3DByBodyPart[part];
      partPoints.forEach((point) => {
        // Use productId if available, fallback to type-based default for legacy points
        const productIdToCount = point.productId ||
          (point.productType === 'neurotoxin' ? 'botox' : 'juvederm-ultra');
        pointsByProduct.set(productIdToCount, (pointsByProduct.get(productIdToCount) || 0) + 1);
      });
    });

    updatePointCounts(pointsByProduct);
  }, [injectionPointsByView, freehandPointsByView, injectionPoints3DByBodyPart, selectedProduct, updatePointCounts]);

  // =============================================================================
  // TREATMENT SUMMARY FOR PRINT
  // =============================================================================
  // Convert injection points to treatment summary items for the printable chart
  const treatmentSummaryItems: TreatmentSummaryItem[] = useMemo(() => {
    const items: TreatmentSummaryItem[] = [];
    const productPriceMap = new Map(productsForSummary.map(p => [p.id, p]));

    // Zone name mapping for readable area names
    const zoneNameMap: Record<string, string> = {
      'zone-forehead': 'Forehead',
      'zone-glabella': 'Glabella',
      'zone-brow-l': 'Left Brow',
      'zone-brow-r': 'Right Brow',
      'zone-crows-l': 'Left Crow\'s Feet',
      'zone-crows-r': 'Right Crow\'s Feet',
      'zone-tear-l': 'Left Tear Trough',
      'zone-tear-r': 'Right Tear Trough',
      'zone-cheek-l': 'Left Cheek',
      'zone-cheek-r': 'Right Cheek',
      'zone-nose': 'Nose',
      'zone-naso-l': 'Left Nasolabial Fold',
      'zone-naso-r': 'Right Nasolabial Fold',
      'zone-lip-upper': 'Upper Lip',
      'zone-lip-lower': 'Lower Lip',
      'zone-marionette-l': 'Left Marionette',
      'zone-marionette-r': 'Right Marionette',
      'zone-chin': 'Chin',
      'zone-jaw-l': 'Left Jawline',
      'zone-jaw-r': 'Right Jawline',
      'zone-masseter-l': 'Left Masseter',
      'zone-masseter-r': 'Right Masseter',
      'zone-platysma': 'Platysma/Neck',
    };

    // Process 2D injection points from all views
    const all2DViewKeys: View2DKey[] = ['femaleFace', 'maleFace', 'femaleTorso', 'maleTorso', 'femaleFullBody', 'maleFullBody'];
    all2DViewKeys.forEach(viewKey => {
      const viewPoints = injectionPointsByView[viewKey];
      viewPoints.forEach((point, zoneId) => {
        const productId = point.productId || selectedProduct?.id || 'botox';
        const productInfo = productPriceMap.get(productId);
        if (!productInfo) return;

        const isToxin = productInfo.type === 'toxin';
        items.push({
          productId: productId,
          productName: productInfo.name,
          area: zoneNameMap[zoneId] || zoneId.replace('zone-', '').replace(/-/g, ' '),
          units: isToxin ? point.units : undefined,
          volume: !isToxin ? point.volume : undefined,
          pricePerUnit: productInfo.pricePerUnit,
          type: productInfo.type,
        });
      });
    });

    // Process freehand points from all views
    all2DViewKeys.forEach(viewKey => {
      const viewFreehand = freehandPointsByView[viewKey];
      viewFreehand.forEach((point) => {
        const productId = point.productId || selectedProduct?.id || 'botox';
        const productInfo = productPriceMap.get(productId);
        if (!productInfo) return;

        const isToxin = productInfo.type === 'toxin';
        items.push({
          productId: productId,
          productName: productInfo.name,
          area: point.customName || 'Custom Point',
          units: isToxin ? point.units : undefined,
          volume: !isToxin ? point.volume : undefined,
          pricePerUnit: productInfo.pricePerUnit,
          type: productInfo.type,
        });
      });
    });

    // Process 3D points from all body parts
    const bodyPartNameMap: Record<string, string> = {
      face: 'Face (3D)',
      torso: 'Torso (3D)',
      fullBody: 'Full Body (3D)',
    };

    const allBodyParts: BodyPart[] = ['face', 'torso', 'fullBody'];
    allBodyParts.forEach(part => {
      const partPoints = injectionPoints3DByBodyPart[part];
      let pointIndex = 1;
      partPoints.forEach((point) => {
        const productId = selectedProduct?.id || 'botox';
        const productInfo = productPriceMap.get(productId);
        if (!productInfo) return;

        const isToxin = productInfo.type === 'toxin';
        items.push({
          productId: productId,
          productName: productInfo.name,
          area: `${bodyPartNameMap[part]} - Point ${pointIndex++}`,
          units: isToxin ? point.units : undefined,
          volume: !isToxin ? point.volume : undefined,
          pricePerUnit: productInfo.pricePerUnit,
          type: productInfo.type,
        });
      });
    });

    return items;
  }, [injectionPointsByView, freehandPointsByView, injectionPoints3DByBodyPart, selectedProduct, productsForSummary]);

  // Handlers
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    hasUnsavedChanges.current = true; // Force save even if no tracked changes
    await saveChart();
    setIsSaving(false);
    if (saveState !== 'error') {
      toast.success('Chart saved successfully');
    }
  }, [saveChart, saveState]);

  const handlePrint = useCallback(() => {
    setShowPrintModal(true);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + P to open print modal
  useChartPrintShortcut(handlePrint);

  const handleExport = useCallback(() => {
    // Export logic - could download as PDF or JSON
    toast.success('Chart exported');
  }, []);

  const handleNotes = useCallback(() => {
    setShowNotesPanel(true);
  }, []);

  // Handler for 2D injection points - updates only the current view's points
  const handleInjectionPointsChange = useCallback((points: Map<string, InjectionPoint>) => {
    pendingHistoryOperation.current = 'add';
    setInjectionPointsByView(prev => ({
      ...prev,
      [currentView2DKey]: points,
    }));
  }, [currentView2DKey]);

  // Handler for 2D freehand points - updates only the current view's points
  const handleFreehandPointsChange = useCallback((points: Map<string, FreehandPoint>) => {
    pendingHistoryOperation.current = 'add';
    setFreehandPointsByView(prev => ({
      ...prev,
      [currentView2DKey]: points,
    }));
  }, [currentView2DKey]);

  const handleInjectionPoints3DChange = useCallback((points: Map<string, InjectionPoint3D>) => {
    pendingHistoryOperation.current = 'add';
    setInjectionPoints3DByBodyPart(prev => ({
      ...prev,
      [bodyPart]: points,
    }));
  }, [bodyPart]);

  // Ref to store addToHistory callback for use in effect without causing re-runs
  const addToHistoryRef = useRef(addToHistory);
  useEffect(() => {
    addToHistoryRef.current = addToHistory;
  }, [addToHistory]);

  // Effect to add to history after ANY tool state changes
  // This ensures the snapshot captures the updated state for ALL tools
  // IMPORTANT: Uses ref for addToHistory to prevent this effect from re-running when the callback changes
  // IMPORTANT: ALL tool state variables must be listed in dependencies for unified undo to work
  useEffect(() => {
    if (pendingHistoryOperation.current && !isRestoringFromHistory.current && !isHistoryInitialLoad.current) {
      addToHistoryRef.current(pendingHistoryOperation.current);
      pendingHistoryOperation.current = null;
    }
  }, [
    // Injection points
    injectionPointsByView,
    freehandPointsByView,
    injectionPoints3DByBodyPart,
    // Other tools - these MUST be included for unified undo to work
    shapes,
    measurements,
    cannulaPaths,
    veinPaths,
  ]);

  const handleToolChange = useCallback((tool: DrawingTool) => {
    setActiveTool(tool);
  }, [setActiveTool]);

  // =============================================================================
  // SEAMLESS 2D/3D TRANSITION - KEEP ALL VIEWS MOUNTED
  // =============================================================================
  // Instead of conditionally rendering based on viewMode, we keep BOTH 2D and 3D
  // components mounted at all times and use CSS visibility to show/hide them.
  // This ensures:
  // - No re-mounting delay when switching views
  // - WebGL context stays warm (no shader recompilation)
  // - State is preserved across view switches
  // - Instant toggle with no loading spinner

  // Determine if 3D components should be in read-only mode based on charting mode
  const is3DReadOnly = activeTool === 'select' || chartingMode === 'navigate';

  // Render all chart views - both 2D and 3D are always mounted but visibility is toggled
  const renderChart = useCallback(() => {
    return (
      <div ref={chartContainerRef} className="w-full h-full relative">
        {/* =========================================================== */}
        {/* 2D VIEWS - All body parts rendered, visibility toggled      */}
        {/* =========================================================== */}

        {/* 2D Face Chart with Zoom/Pan - Uses layer-filtered injection points */}
        {/* When overlay tools are active, disable pointer events so overlays receive them */}
        <div
          className={`absolute inset-0 transition-opacity duration-150 ${
            viewMode === '2D' && bodyPart === 'face'
              ? `opacity-100 z-10 ${isOverlayToolActive ? 'pointer-events-none' : ''}`
              : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="max-w-2xl w-full h-full">
              <FaceChartWithZoom
                productType={productType}
                gender={gender}
                injectionPoints={filteredInjectionPoints}
                onInjectionPointsChange={handleInjectionPointsChange}
                freehandPoints={filteredFreehandPoints}
                onFreehandPointsChange={handleFreehandPointsChange}
                selectedProductId={selectedProduct?.id}
                selectedProductColor={selectedProduct?.color}
                drawingMode={activeTool === 'freehand' ? 'freehand' : 'zones'}
                showControls={false}
                selectedDosage={dosage}
                onUndo={unifiedUndo}
                onRedo={unifiedRedo}
                canUndo={unifiedCanUndo}
                canRedo={unifiedCanRedo}
                onClearAll={clearAllMarkings}
                hasContent={hasChartContent}
                onZoomStateChange={handleZoomStateChange}
                zoomState={zoomState}
              >
                <SmoothBrushTool
                  ref={smoothBrushRef}
                  isActive={isBrushModeActive}
                  treatmentType={brushTreatmentType}
                  brushSize={brushSize}
                  opacity={brushOpacity}
                  onCanUndoChange={setBrushCanUndo}
                  onPathsByTypeChange={handleBrushPathsByTypeChange}
                  hiddenTreatmentTypes={hiddenBrushTreatmentTypes}
                  readOnly={activeTool !== 'brush'}
                  zoomState={zoomState}
                />
                <MeasurementTool
                  isActive={isMeasureModeActive}
                  measurements={measurements}
                  onMeasurementsChange={handleMeasurementsChange}
                  calibration={calibration}
                  onCalibrationChange={setCalibration}
                  containerRef={chartContainerRef}
                  zoom={1}
                  showCm={false}
                  readOnly={activeTool !== 'measure'}
                  zoomState={zoomState}
                />
                <ShapeTool
                  ref={shapeToolRef}
                  isActive={isShapeModeActive}
                  shapes={shapes}
                  onShapesChange={handleShapesChange}
                  selectedShapeId={selectedShapeId}
                  onSelectionChange={setSelectedShapeId}
                  readOnly={activeTool !== 'shape'}
                  shapeType={shapeType}
                  onShapeTypeChange={setShapeType}
                  fillColor={shapeColor}
                  onFillColorChange={setShapeColor}
                  fillEnabled={shapeFilled}
                  showToolbar={false}
                  zoomState={zoomState}
                />
                <CannulaPathTool
                  isActive={isCannulaModeActive}
                  cannulaPaths={cannulaPaths}
                  onCannulaPathsChange={handleCannulaPathsChange}
                  selectedPathId={selectedCannulaPathId}
                  onSelectionChange={setSelectedCannulaPathId}
                  readOnly={!isCannulaModeActive}
                  productColor={cannulaProductColor}
                  productId={cannulaProductId}
                  initialTechnique={cannulaType}
                  showToolbar={false}
                  zoom={1}
                  zoomState={zoomState}
                />
                <VeinDrawingTool
                  ref={veinToolRef}
                  isActive={isVeinModeActive}
                  veinPaths={veinPaths}
                  onVeinPathsChange={handleVeinPathsChange}
                  selectedVeinId={selectedVeinId}
                  onSelectionChange={setSelectedVeinId}
                  readOnly={!isVeinModeActive}
                  showToolbar={false}
                  zoom={1}
                  zoomState={zoomState}
                  veinType={veinType}
                  onVeinTypeChange={setVeinType}
                  onCanUndoChange={setVeinCanUndo}
                />
                <SimpleTextTool
                  ref={simpleTextToolRef}
                  isActive={isSimpleTextModeActive}
                  selectedPreset={simpleTextSelectedPreset}
                  onLabelsChange={setSimpleTextLabels}
                  onCanUndoChange={setSimpleTextCanUndo}
                  readOnly={activeTool !== 'simpleText'}
                  initialLabels={simpleTextLabels}
                  zoomState={zoomState}
                />
                {bodyPart === 'face' && showDangerZones && (
                  <DangerZoneOverlay
                    isVisible={showDangerZones}
                    onToggle={toggleDangerZones}
                    gender={gender}
                    opacity={0.6}
                    showLegend={true}
                  />
                )}
              </FaceChartWithZoom>
            </div>
          </div>
        </div>

        {/* 2D Torso Chart with Zoom/Pan - Uses layer-filtered injection points */}
        {/* When overlay tools are active, disable pointer events so overlays receive them */}
        <div
          className={`absolute inset-0 transition-opacity duration-150 ${
            viewMode === '2D' && bodyPart === 'torso'
              ? `opacity-100 z-10 ${isOverlayToolActive ? 'pointer-events-none' : ''}`
              : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <div className="w-full h-full flex items-center justify-center p-4">
            <div className="max-w-xl w-full h-full">
              <TorsoChartWithZoom
                productType={productType}
                gender={gender}
                injectionPoints={filteredInjectionPoints}
                onInjectionPointsChange={handleInjectionPointsChange}
                freehandPoints={filteredFreehandPoints}
                onFreehandPointsChange={handleFreehandPointsChange}
                selectedProductId={selectedProduct?.id}
                selectedProductColor={selectedProduct?.color}
                showControls={false}
                selectedDosage={dosage}
                // Global actions are now in bottom bar
                onUndo={unifiedUndo}
                onRedo={unifiedRedo}
                canUndo={unifiedCanUndo}
                canRedo={unifiedCanRedo}
                onClearAll={clearAllMarkings}
                hasContent={hasChartContent}
                // Lift zoom state to page level for bottom bar
                onZoomStateChange={handleZoomStateChange}
                zoomState={zoomState}
              />
            </div>
          </div>
        </div>

        {/* 2D Full Body Chart with Zoom/Pan - Uses layer-filtered injection points */}
        {/* When overlay tools are active, disable pointer events so overlays receive them */}
        <div
          className={`absolute inset-0 transition-opacity duration-150 ${
            viewMode === '2D' && bodyPart === 'fullBody'
              ? `opacity-100 z-10 ${isOverlayToolActive ? 'pointer-events-none' : ''}`
              : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <div className="w-full h-full">
            <FullBodyChartWithZoom
              productType={productType}
              injectionPoints={filteredInjectionPoints}
              onInjectionPointsChange={handleInjectionPointsChange}
              selectedProductId={selectedProduct?.id}
              selectedProductColor={selectedProduct?.color}
              showControls={false}
              selectedDosage={dosage}
              // Global actions are now in bottom bar
              onUndo={unifiedUndo}
              onRedo={unifiedRedo}
              canUndo={unifiedCanUndo}
              canRedo={unifiedCanRedo}
              onClearAll={clearAllMarkings}
              hasContent={hasChartContent}
              // Lift zoom state to page level for bottom bar
              onZoomStateChange={handleZoomStateChange}
              zoomState={zoomState}
            />
          </div>
        </div>

        {/* =========================================================== */}
        {/* 3D VIEWS - All body parts rendered, visibility toggled      */}
        {/* Components stay mounted to keep WebGL context warm          */}
        {/* =========================================================== */}

        {/* 3D Face Chart - rendered once models are preloaded */}
        {modelsPreloaded && (
          <div
            className={`absolute inset-0 transition-opacity duration-150 ${
              viewMode === '3D' && bodyPart === 'face' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-purple-400 text-sm">Loading 3D Model...</span>
                </div>
              </div>
            }>
              <div className="w-full h-full flex items-center justify-center">
                <FaceChart3D
                  productType={productType}
                  productId={selectedProduct?.id}
                  injectionPoints={filteredInjectionPoints3DByBodyPart.face}
                  onInjectionPointsChange={(points) => {
                    pendingHistoryOperation.current = 'add';
                    setInjectionPoints3DByBodyPart(prev => ({
                      ...prev,
                      face: points,
                    }));
                  }}
                  readOnly={is3DReadOnly}
                />
              </div>
            </Suspense>
          </div>
        )}

        {/* 3D Torso Chart - rendered once models are preloaded */}
        {modelsPreloaded && (
          <div
            className={`absolute inset-0 transition-opacity duration-150 ${
              viewMode === '3D' && bodyPart === 'torso' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-purple-400 text-sm">Loading 3D Model...</span>
                </div>
              </div>
            }>
              <div className="w-full h-full flex items-center justify-center p-4">
                <BodyChart3D
                  productType={productType}
                  productId={selectedProduct?.id}
                  injectionPoints={filteredInjectionPoints3DByBodyPart.torso}
                  onInjectionPointsChange={(points) => {
                    pendingHistoryOperation.current = 'add';
                    setInjectionPoints3DByBodyPart(prev => ({
                      ...prev,
                      torso: points,
                    }));
                  }}
                  readOnly={is3DReadOnly}
                  gender={gender}
                  bodyType="torso"
                />
              </div>
            </Suspense>
          </div>
        )}

        {/* 3D Full Body Chart - rendered once models are preloaded */}
        {modelsPreloaded && (
          <div
            className={`absolute inset-0 transition-opacity duration-150 ${
              viewMode === '3D' && bodyPart === 'fullBody' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-purple-400 text-sm">Loading 3D Model...</span>
                </div>
              </div>
            }>
              <div className="w-full h-full flex items-center justify-center p-4">
                <BodyChart3D
                  productType={productType}
                  productId={selectedProduct?.id}
                  injectionPoints={filteredInjectionPoints3DByBodyPart.fullBody}
                  onInjectionPointsChange={(points) => {
                    pendingHistoryOperation.current = 'add';
                    setInjectionPoints3DByBodyPart(prev => ({
                      ...prev,
                      fullBody: points,
                    }));
                  }}
                  readOnly={is3DReadOnly}
                  gender={gender}
                  bodyType="full"
                />
              </div>
            </Suspense>
          </div>
        )}

        {/* Note: Loading states are handled by Suspense fallbacks in each 3D component */}

        {/* =========================================================== */}
        {/* ZONE DETECTION SUMMARY - Shows detected zones after detect  */}
        {/* =========================================================== */}
        {viewMode === '2D' && (
          <ZoneDetectionSummary
            zones={detectedZones}
            isVisible={showZoneDetectionSummary}
            onClose={() => setShowZoneDetectionSummary(false)}
            onConfirm={handleConfirmZones}
            position="top-right"
            title="Detected Treatment Areas"
          />
        )}

      </div>
    );
  }, [
    viewMode,
    bodyPart,
    gender,
    productType,
    filteredInjectionPoints,
    filteredFreehandPoints,
    filteredInjectionPoints3DByBodyPart,
    isBrushModeActive,
    brushTreatmentType,
    brushSize,
    brushOpacity,
    selectedProduct,
    activeTool,
    is3DReadOnly,
    modelsPreloaded,
    handleInjectionPointsChange,
    handleFreehandPointsChange,
    dosage,
    // Measurement tool deps
    isMeasureModeActive,
    measurements,
    handleMeasurementsChange,
    calibration,
    setCalibration,
    // Shape tool deps
    isShapeModeActive,
    shapes,
    handleShapesChange,
    selectedShapeId,
    setSelectedShapeId,
    // Cannula tool deps
    isCannulaModeActive,
    cannulaPaths,
    handleCannulaPathsChange,
    selectedCannulaPathId,
    setSelectedCannulaPathId,
    // Vein tool deps
    isVeinModeActive,
    veinPaths,
    handleVeinPathsChange,
    selectedVeinId,
    setSelectedVeinId,
    // Danger zone deps
    showDangerZones,
    toggleDangerZones,
    // Zone detection deps
    detectedZones,
    showZoneDetectionSummary,
    handleConfirmZones,
  ]);

  // Render tab content when not on injection map
  const renderTabContent = () => {
    // Theme-aware background classes for tab content
    const tabContentBg = isDark ? 'bg-gray-900' : 'bg-white';
    const tabContentText = isDark ? 'text-gray-100' : 'text-gray-900';

    switch (activeTab) {
      case 'notes':
        return (
          <div className={`h-full overflow-auto ${tabContentBg} p-6`}>
            <SOAPNotesForm
              onSave={() => {
                toast.success('SOAP notes saved');
              }}
            />
          </div>
        );

      case 'photos':
        return (
          <div className={`h-full overflow-auto ${tabContentBg} p-6`}>
            <PhotoUpload
              photos={photos}
              onPhotosChange={setPhotos}
              onUpload={async (photo) => {
                toast.success('Photo uploaded successfully');
                return photo.url || '';
              }}
              patientName={MOCK_PATIENT.name}
            />
          </div>
        );

      case 'compare':
        return (
          <div className={`h-full overflow-auto ${tabContentBg} p-6`}>
            <PhotoComparison
              beforePhoto={photos[0] ? { id: photos[0].id, url: photos[0].url, type: 'before', angle: 'front', timestamp: photos[0].timestamp || new Date() } : null}
              afterPhoto={photos[1] ? { id: photos[1].id, url: photos[1].url, type: 'after', angle: 'front', timestamp: photos[1].timestamp || new Date() } : null}
            />
          </div>
        );

      case 'playbook':
        return (
          <div className={`h-full overflow-auto ${tabContentBg} p-6`}>
            <InjectorPlaybook providerId="provider-001" providerName="Dr. Smith" />
          </div>
        );

      case 'history':
        return (
          <div className={`h-full overflow-auto ${tabContentBg} p-6`}>
            <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <History className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <h3 className={`text-lg font-medium mb-2 ${tabContentText}`}>Treatment History</h3>
              <p className="text-sm">Previous treatments for {MOCK_PATIENT.name} will appear here.</p>
              <div className="mt-6 space-y-3 max-w-md mx-auto">
                <div className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg text-left`}>
                  <p className={`text-sm font-medium ${tabContentText}`}>January 15, 2024</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Botox - Forehead, Glabella, Crow's Feet (45u total)</p>
                </div>
                <div className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg text-left`}>
                  <p className={`text-sm font-medium ${tabContentText}`}>October 20, 2023</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Juvederm - Nasolabial Folds (2ml total)</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Floating panels rendered OUTSIDE FullScreenChartCanvas to avoid stacking context issues
  // Since panels use position:fixed, they work regardless of DOM position
  const renderFloatingPanels = () => (
    <>
      {/* =============================================================================
          LEFT DOCK - Reference Information (Psychology-based layout)
          Contains: View Options, Layers Panel, Patient Context
          Position: Fixed/docked on LEFT edge - NOT draggable
          Purpose: Reference info for glancing (F-pattern scanning, right-handed users)
          ============================================================================= */}
      <LeftDock
        // View Options
        viewMode={viewToggleState.viewMode}
        onViewModeChange={viewToggleState.onViewModeChange}
        bodyPart={viewToggleState.bodyPart}
        onBodyPartChange={viewToggleState.onBodyPartChange}
        gender={viewToggleState.gender}
        onGenderChange={viewToggleState.onGenderChange}
        // Anatomy overlay - only show toggle for face view
        showAnatomyOverlay={showDangerZones}
        onToggleAnatomyOverlay={bodyPart === 'face' ? toggleDangerZones : undefined}
        // Layers
        layers={layersState.layers}
        onLayerVisibilityChange={layersState.setLayerVisibility}
        onToggleAllLayers={layersState.toggleAllLayers}
        brushLayers={brushLayersState.brushLayers}
        onBrushLayerVisibilityChange={brushLayersState.setBrushLayerVisibility}
        // Measurement mode props - show measurements panel in left dock when active
        isMeasurementModeActive={isMeasureModeActive}
        measurements={measurements.map(m => ({ id: m.id, length: m.distancePx, label: m.label }))}
        onMeasurementClearAll={() => setMeasurements([])}
        // Detected treatment zones - shows underneath Layers section
        zoneSummaries={zoneSummaries}
        // Patient context (shown in dock for quick reference)
        patient={{
          name: MOCK_PATIENT.name,
          mrn: MOCK_PATIENT.mrn,
        }}
      />

    </>
  );

  // Main injection map - using psychology-based docked layout
  // LEFT dock: Reference panels (Layers, View options) - for glancing
  // CENTER: Canvas (maximum space) - the main work area
  // RIGHT dock: Action panels (Tools, Products) - for right-handed interaction
  // BOTTOM bar: Global actions (Undo/Redo, Zoom, Save)
  const renderInjectionMapView = () => (
    <div
      className={`charting-docked-layout fixed left-0 right-0 bottom-0 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}
      style={{ top: 48 }} // Below nav bar (h-12 = 48px)
    >
      {/* =================================================================
          LEFT DOCK - Reference panels (Psychology: LEFT = Read/Reference)
          Contains: View Options, Layers Panel, Patient Context
          Uses the LeftDock component with position:fixed for consistent UI
          ================================================================= */}
      {renderFloatingPanels()}

      {/* =================================================================
          CENTER CANVAS - Maximum space for chart
          This is the main work area where the practitioner focuses
          ================================================================= */}
      <div className="charting-center-canvas">
        {renderChart()}
      </div>

      {/* =================================================================
          RIGHT DOCK - Action panels (Psychology: RIGHT = Actions/Tools)
          Contains: Tool Palette, Product Picker, Treatment Summary
          Based on PRACTITIONER_CONTEXT.md:
          - 90% of users are right-handed, dominant hand is 10% faster, 20% more accurate
          - Fitts' Law: frequent actions should be near where action happens
          - RIGHT side = actions/tools (frequent tapping, precision needed)
          ================================================================= */}
      <RightDock
        // Tool palette props
        activeTool={activeTool}
        onToolChange={handleToolChange}
        // Product picker props - mode determines which tool settings to show
        mode={
          isBrushModeActive ? 'brush' :
          isSketchModeActive ? 'sketch' :
          isShapeModeActive ? 'shape' :
          isSimpleTextModeActive ? 'simpleText' :
          isMeasureModeActive ? 'measure' :
          'injection'
        }
        products={products}
        selectedProduct={selectedProduct}
        onProductChange={setSelectedProduct}
        dosage={dosage}
        onDosageChange={setDosage}
        quickDosages={productType === 'neurotoxin' ? [5, 10, 15, 20, 25] : [0.5, 1.0, 1.5, 2.0]}
        // Brush mode props
        treatmentTypes={treatmentTypesForPicker}
        selectedTreatmentType={currentBrushTreatmentConfig}
        onTreatmentTypeChange={(type) => {
          setBrushTreatmentType(type.id as TreatmentAreaType);
          setBrushOpacity(type.defaultOpacity);
        }}
        brushOpacity={brushOpacity}
        onBrushOpacityChange={setBrushOpacity}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        onBrushUndo={handleBrushUndo}
        onBrushClearAll={handleBrushClearAll}
        canBrushUndo={brushCanUndo}
        // Sketch mode props (umbrella for Veins and Cannula)
        sketchMode={sketchMode}
        onSketchModeChange={setSketchMode}
        // Sketch > Veins sub-mode props
        sketchType={veinType}
        onSketchTypeChange={setVeinType}
        onSketchUndo={handleVeinUndo}
        onSketchClearAll={handleVeinClearAll}
        canSketchUndo={veinCanUndo}
        // Sketch > Cannula sub-mode props
        cannulaType={cannulaType as 'linear' | 'fanning'}
        onCannulaTypeChange={(type) => setCannulaType(type as CannulaTechnique)}
        cannulaColor={cannulaProductColor}
        onCannulaColorChange={setCannulaProductColor}
        onCannulaUndo={handleCannulaUndo}
        onCannulaClearAll={handleCannulaClearAll}
        canCannulaUndo={cannulaPaths.length > 0}
        // Shape mode props
        shapeType={shapeType as 'circle' | 'rectangle' | 'ellipse' | 'line' | 'arrow'}
        onShapeTypeChange={(type) => setShapeType(type as ShapeType)}
        shapeColor={shapeColor}
        onShapeColorChange={setShapeColor}
        shapeFilled={shapeFilled}
        onShapeFilledChange={setShapeFilled}
        onShapeUndo={handleShapeUndo}
        onShapeClearAll={handleShapeClearAll}
        canShapeUndo={shapes.length > 0}
        // Simple text mode props
        simpleTextSelectedPreset={simpleTextSelectedPreset}
        onSimpleTextPresetChange={setSimpleTextSelectedPreset}
        simpleTextLabels={simpleTextLabels}
        onSimpleTextUndo={handleSimpleTextUndo}
        onSimpleTextClearAll={handleSimpleTextClearAll}
        canSimpleTextUndo={simpleTextCanUndo}
        // Measure mode props
        measurements={measurements.map(m => ({ id: m.id, length: m.distancePx, label: m.label }))}
        onMeasurementClearAll={() => setMeasurements([])}
        // Summary props
        injectionPoints={summaryInjectionPoints}
        productsForSummary={productsForSummary}
        // Visibility
        isVisible={true}
      />

      {/* =================================================================
          BOTTOM BAR - Global actions (always visible)
          Contains: Undo/Redo (left), Zoom Controls (center), Save (right)
          ================================================================= */}
      <div className={`charting-bottom-bar ${isDark ? 'dark-mode' : 'light-mode'}`}>
        {/* Left: Undo/Redo */}
        <div className="charting-bottom-bar-left">
          <button
            onClick={unifiedUndo}
            disabled={!unifiedCanUndo}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors
              ${!unifiedCanUndo
                ? isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }
            `}
            title="Undo (Cmd+Z)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">Undo</span>
          </button>
          <button
            onClick={unifiedRedo}
            disabled={!unifiedCanRedo}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors
              ${!unifiedCanRedo
                ? isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                : isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
              }
            `}
            title="Redo (Cmd+Shift+Z)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
            <span className="text-sm font-medium hidden sm:inline">Redo</span>
          </button>

          {/* Detect Zones Button - Always visible in 2D view for zone detection after drawing */}
          {/* IMPORTANT: This button should be easily discoverable for practitioners */}
          {viewMode === '2D' && (
            <>
              {/* Divider */}
              <div className={`w-px h-6 mx-2 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />

              <button
                onClick={handleDetectZones}
                disabled={isDetectingZones}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors
                  min-w-[44px] min-h-[44px]
                  ${isDetectingZones
                    ? isDark ? 'bg-gray-700 text-gray-500 cursor-wait' : 'bg-gray-100 text-gray-400 cursor-wait'
                    : isDark
                      ? 'bg-purple-900/40 text-purple-300 hover:bg-purple-900/60 hover:text-purple-200 border border-purple-700/50'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 border border-purple-200'
                  }
                `}
                title="Detect treatment zones from brush strokes"
              >
                {isDetectingZones ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <MapPin className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">Detect Zones</span>
              </button>
            </>
          )}
        </div>

        {/* Center: Zoom Controls - Always visible, accessible by either hand */}
        {/* Per PRACTITIONER_CONTEXT.md: Bottom bar = global actions, touch targets 44px min */}
        <div className="charting-bottom-bar-center">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            {/* Zoom Out */}
            <button
              onClick={() => zoomControls?.zoomOut()}
              disabled={!zoomControls || zoomState.scale <= 0.5}
              className={`
                min-w-[44px] min-h-[44px] p-2.5 rounded-lg transition-colors
                flex items-center justify-center
                ${!zoomControls || zoomState.scale <= 0.5
                  ? isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                  : isDark ? 'text-gray-200 hover:bg-gray-700 active:bg-gray-600' : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                }
              `}
              title="Zoom out"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>

            {/* Zoom Percentage Indicator */}
            <div
              className={`
                min-w-[60px] px-3 py-2 text-center text-sm font-medium
                rounded-lg transition-colors
                ${isZoomed
                  ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                  : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                }
              `}
              title="Current zoom level"
            >
              {Math.round(zoomState.scale * 100)}%
            </div>

            {/* Zoom In */}
            <button
              onClick={() => zoomControls?.zoomIn()}
              disabled={!zoomControls || zoomState.scale >= 4}
              className={`
                min-w-[44px] min-h-[44px] p-2.5 rounded-lg transition-colors
                flex items-center justify-center
                ${!zoomControls || zoomState.scale >= 4
                  ? isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                  : isDark ? 'text-gray-200 hover:bg-gray-700 active:bg-gray-600' : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                }
              `}
              title="Zoom in"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            {/* Divider */}
            <div className={`w-px h-6 mx-1 ${isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />

            {/* Reset Zoom */}
            <button
              onClick={() => zoomControls?.resetZoom()}
              disabled={!zoomControls || !isZoomed}
              className={`
                min-w-[44px] min-h-[44px] p-2.5 rounded-lg transition-colors
                flex items-center justify-center
                ${!zoomControls || !isZoomed
                  ? isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed'
                  : isDark ? 'text-gray-200 hover:bg-gray-700 active:bg-gray-600' : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                }
              `}
              title="Reset to fit view"
              aria-label="Reset zoom"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Help Buttons */}
          <div className="flex items-center gap-2 ml-4">
            {gestureHints.isTouchDevice && (
              <GestureHelpButton onClick={gestureHints.showHints} />
            )}
            <KeyboardHelpButton onClick={() => setShowKeyboardShortcuts(true)} />
          </div>
        </div>

        {/* Right: Save Button - completion zone per Z-pattern scanning */}
        <div className="charting-bottom-bar-right">
          {/* Save Status Indicator */}
          <div className="flex items-center gap-1.5 text-sm">
            {saveState === 'saved' && !hasUnsavedChanges.current && (
              <span className={`flex items-center gap-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                <Check className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Saved</span>
              </span>
            )}
            {saveState === 'saving' && (
              <span className={`flex items-center gap-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs hidden sm:inline">Saving...</span>
              </span>
            )}
            {(saveState === 'unsaved' || (saveState === 'saved' && hasUnsavedChanges.current)) && (
              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Circle className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                <span className="text-xs hidden sm:inline">Unsaved</span>
              </span>
            )}
            {saveState === 'error' && (
              <span className={`flex items-center gap-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs hidden sm:inline">Error</span>
              </span>
            )}
          </div>

          {/* Save Button - 44px min touch target */}
          <button
            onClick={handleSave}
            disabled={saveState === 'saving'}
            className={`
              min-w-[44px] min-h-[44px] p-2.5 rounded-lg transition-colors
              flex items-center justify-center gap-2 font-medium
              ${saveState === 'saving'
                ? isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : (saveState === 'unsaved' || hasUnsavedChanges.current)
                  ? 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800'
                  : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
            title="Save chart (Cmd/Ctrl+S)"
            aria-label="Save chart"
          >
            <Save className="w-5 h-5" />
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Additional UI elements for injection map view (Modals only)
  // NOTE: Help buttons are now in the bottom bar center section
  // Patient name is shown in the top nav bar, Save button is in the bottom bar
  // This follows PRACTITIONER_CONTEXT.md psychology-based layout:
  // - LEFT = Reference (patient info in nav bar for quick glance)
  // - RIGHT = Actions (tools panel - RightDock)
  // - BOTTOM = Global actions (save, undo/redo, zoom, help)
  const renderInjectionMapUI = () => (
    <>
      {/* Modals for help overlays */}
      <TouchGestureHints
        isOpen={gestureHints.isOpen}
        onClose={gestureHints.close}
        onDontShowAgain={gestureHints.dontShowAgain}
      />
      <KeyboardShortcutsHelp
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </>
  );

  // Navigation tab labels for the persistent nav bar
  // Order: SOAP | Photos | Chart | Compare | Playbook | History
  const NAV_TABS = [
    { id: 'notes' as TabId, label: 'SOAP' },
    { id: 'photos' as TabId, label: 'Photos' },
    { id: 'injection-map' as TabId, label: 'Chart' },
    { id: 'compare' as TabId, label: 'Compare' },
    { id: 'playbook' as TabId, label: 'Playbook' },
    { id: 'history' as TabId, label: 'History' },
  ];

  return (
    <div className="flex flex-col h-screen charting-canvas" data-charting-area>
      <Toaster position="top-center" />

      {/* =============================================================================
          LOADING OVERLAY - Shows while page components are initializing
          Covers entire charting area with smooth fade-out transition
          ============================================================================= */}
      {!pageReady && (
        <div
          className={`
            fixed inset-0 z-[9999] flex items-center justify-center
            transition-opacity duration-300 ease-out
            ${loadingFadeOut ? 'opacity-0' : 'opacity-100'}
            ${isDark ? 'bg-gray-900' : 'bg-white'}
          `}
          style={{ pointerEvents: loadingFadeOut ? 'none' : 'auto' }}
        >
          <div className="flex flex-col items-center gap-4">
            {/* Animated spinner */}
            <div className="relative">
              {/* Outer ring */}
              <div className={`
                w-12 h-12 rounded-full border-4
                ${isDark ? 'border-gray-700' : 'border-gray-200'}
              `} />
              {/* Spinning arc */}
              <div className={`
                absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent
                border-t-purple-500 animate-spin
              `} />
            </div>

            {/* Loading text */}
            <div className="flex flex-col items-center gap-1">
              <p className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Loading chart...
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Preparing your workspace
              </p>
            </div>

            {/* Progress dots animation */}
            <div className="flex gap-1.5">
              <div className={`
                w-2 h-2 rounded-full animate-bounce
                ${isDark ? 'bg-purple-400' : 'bg-purple-500'}
              `} style={{ animationDelay: '0ms' }} />
              <div className={`
                w-2 h-2 rounded-full animate-bounce
                ${isDark ? 'bg-purple-400' : 'bg-purple-500'}
              `} style={{ animationDelay: '150ms' }} />
              <div className={`
                w-2 h-2 rounded-full animate-bounce
                ${isDark ? 'bg-purple-400' : 'bg-purple-500'}
              `} style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      {/* =============================================================================
          PERSISTENT NAVIGATION BAR - Fixed at top, visible on ALL tabs
          Design: <- Sarah Johnson | SOAP | Photos | Chart | Compare | Playbook | History
          Height: 48px (h-12), Theme-aware, Current tab highlighted purple
          FIXED position ensures header stays in same position regardless of active tab
          z-50 ensures nav bar stays above all content
          ============================================================================= */}
      <div className={`fixed top-0 left-0 right-0 h-12 border-b flex items-center px-4 transition-colors duration-200 z-50 ${
        isDark
          ? 'bg-gray-900 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        {/* Back button with patient name */}
        <button
          onClick={() => router.push('/patients')}
          className={`flex items-center gap-2 transition-colors group ${
            isDark
              ? 'text-white hover:text-purple-300'
              : 'text-gray-900 hover:text-purple-600'
          }`}
          title="Back to Patients"
        >
          <ArrowLeft className={`w-5 h-5 group-hover:text-purple-${isDark ? '300' : '600'} ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
          <span className="font-medium">{MOCK_PATIENT.name}</span>
        </button>

        {/* Divider pipe */}
        <span className={`mx-4 text-lg ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>|</span>

        {/* Tab pills */}
        <div className="flex items-center gap-1 flex-1">
          {NAV_TABS.map((tab, index) => (
            <div key={tab.id} className="flex items-center">
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : isDark
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
              {/* Pipe separator between tabs (except after last) */}
              {index < NAV_TABS.length - 1 && (
                <span className={`mx-1 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>|</span>
              )}
            </div>
          ))}
        </div>

        {/* Action buttons: Settings and Theme Toggle */}
        <div className="flex items-center gap-1">
          {/* Settings Button */}
          <button
            onClick={() => setShowQuickSettings(true)}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title="Charting Settings"
            aria-label="Charting Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Spacer div to account for fixed header height */}
      <div className="h-12 flex-shrink-0" />

      {/* Main Content - pt-0 since spacer above handles the fixed header offset */}
      <div className={activeTab !== 'injection-map' ? `min-h-screen pb-32 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}` : 'flex-1'}>
        {activeTab === 'injection-map' ? (
          renderInjectionMapView()
        ) : (
          renderTabContent()
        )}
      </div>

      {/* Additional UI overlays for injection map (Patient Badge, Modals) */}
      {/* Note: Floating panels are now integrated into the docked layout structure */}
      {activeTab === 'injection-map' && renderInjectionMapUI()}

      {/* =============================================================================
          CONSISTENT FOOTER FOR NON-CHART TABS
          Displays the same treatment summary bar and action buttons as the Chart tab
          ============================================================================= */}
      {activeTab !== 'injection-map' && (
        <>
          {/* Floating Summary Bar - Bottom */}
          <FloatingSummaryBar
            injectionPoints={summaryInjectionPoints}
            products={productsForSummary}
            isExpanded={summaryExpanded}
            onToggleExpand={setSummaryExpanded}
          />

          {/* Floating Action Buttons - Bottom Right */}
          <FloatingActionButtons
            onSave={handleSave}
            onPrint={handlePrint}
            onExport={handleExport}
            onNotes={handleNotes}
            isSaving={isSaving}
          />
        </>
      )}

      {/* Notes Side Panel - Slides in from right (available on all tabs) */}
      {showNotesPanel && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowNotesPanel(false)}
          />

          {/* Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform animate-slide-in-right">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Quick Notes</h2>
                <button
                  onClick={() => setShowNotesPanel(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <SOAPNotesForm
                  onSave={() => {
                    toast.success('Quick notes saved');
                    setShowNotesPanel(false);
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* =============================================================================
          HIDDEN 3D PRE-RENDER - Warms up WebGL context for instant switching
          ============================================================================= */}
      {/* Pre-render 3D components in a hidden container when in 2D mode.
          This initializes the WebGL context, compiles shaders, and loads textures
          so that switching to 3D is instant with no loading spinner. */}
      {modelsPreloaded && viewMode === '2D' && (
        <div
          className="fixed pointer-events-none"
          style={{
            position: 'fixed',
            left: '-9999px',
            top: '-9999px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
            opacity: 0,
            visibility: 'hidden'
          }}
          aria-hidden="true"
        >
          {/* Pre-render FaceChart3D */}
          <FaceChart3D
            productType={productType}
            injectionPoints={new Map()}
            onInjectionPointsChange={() => {}}
            readOnly={true}
          />
          {/* Pre-render BodyChart3D for all variants */}
          <BodyChart3D
            productType={productType}
            injectionPoints={new Map()}
            onInjectionPointsChange={() => {}}
            readOnly={true}
            gender="female"
            bodyType="torso"
          />
        </div>
      )}

      {/* Print Modal */}
      <PrintableChart
        patientName={MOCK_PATIENT.name}
        patientMrn={MOCK_PATIENT.mrn}
        date={new Date()}
        provider="Dr. Smith"
        clinicName="Medical Spa Clinic"
        chartImageRef={chartContainerRef}
        treatmentItems={treatmentSummaryItems}
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
      />

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .fixed {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
      `}</style>

      {/* Quick Settings Modal */}
      {showQuickSettings && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-[9998]"
            onClick={() => setShowQuickSettings(false)}
          />

          {/* Modal */}
          <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl shadow-2xl z-[9999] ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3 border-b ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Quick Settings
              </h2>
              <button
                onClick={() => setShowQuickSettings(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Settings Links */}
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  setShowQuickSettings(false);
                  router.push('/settings/charting#products');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Package className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                <div className="text-left">
                  <p className="font-medium">Product Presets</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Configure injectable products and pricing
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSettings(false);
                  router.push('/settings/charting#needle-gauges');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Syringe className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <div className="text-left">
                  <p className="font-medium">Needle & Cannula Sizes</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Customize needle gauges and cannula options
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSettings(false);
                  router.push('/settings/charting#templates');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <FileText className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                <div className="text-left">
                  <p className="font-medium">Treatment Templates</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Create quick-apply treatment presets
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowQuickSettings(false);
                  router.push('/settings/charting#appearance');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-700 text-gray-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Palette className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                <div className="text-left">
                  <p className="font-medium">Appearance</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Theme and visual preferences
                  </p>
                </div>
              </button>
            </div>

            {/* Footer with quick theme toggle and full settings link */}
            <div className={`flex items-center justify-between px-4 py-3 border-t ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={toggleTheme}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>

              <button
                onClick={() => {
                  setShowQuickSettings(false);
                  router.push('/settings/charting');
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'text-purple-400 hover:bg-gray-700'
                    : 'text-purple-600 hover:bg-purple-50'
                }`}
              >
                <span className="text-sm font-medium">All Settings</span>
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
