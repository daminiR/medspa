// =============================================================================
// CHARTING COMPONENTS BARREL EXPORT
// =============================================================================
// Main entry point for all charting components
// Usage: import { InjectionMap, ViewModeToggle } from '@/components/charting'

// =============================================================================
// PRIMARY COMPONENTS
// =============================================================================

// Unified Injection Map Container (Main Component)
export { InjectionMap } from './InjectionMap'
export type { InjectionMapProps } from './InjectionMap'

// Enhanced Charting View (Legacy)
export { EnhancedChartingView } from './EnhancedChartingView'
export type { InjectionPoint } from './EnhancedChartingView'

// =============================================================================
// CHARTING INTERFACE COMPONENTS
// =============================================================================

// View Mode Toggle
export { ViewModeToggle } from './ViewModeToggle'
export type { ViewMode, BodyArea2D, Gender } from './ViewModeToggle'

// Minimal Chart Header
export { MinimalChartHeader } from './MinimalChartHeader'

// Collapsed Summary Footer
export { CollapsedSummaryFooter } from './CollapsedSummaryFooter'

// Floating Toolbar
export { FloatingToolbar } from './FloatingToolbar'
export type { FloatingToolbarProps } from './FloatingToolbar'

// Totals Panel
export { TotalsPanel } from './TotalsPanel'

// =============================================================================
// FLOATING UI COMPONENTS (NEW)
// =============================================================================

// Draggable Panel - Base component for floating panels
export { DraggablePanel } from './DraggablePanel'

// Full Screen Chart Canvas - Full viewport charting container
export { FullScreenChartCanvas, useCanvasDimensions } from './FullScreenChartCanvas'

// Floating View Toggle - 2D/3D and body part/gender selection
export { FloatingViewToggle, useViewToggleState } from './FloatingViewToggle'
export type {
  ViewMode as FloatingViewMode,
  BodyPart,
  Gender as FloatingGender,
} from './FloatingViewToggle'

// Floating Tool Palette - Drawing tools (zone, freehand, select)
export { default as FloatingToolPalette, useDrawingTools } from './FloatingToolPalette'
export type { DrawingTool } from './FloatingToolPalette'

// Floating Product Picker - Product and dosage selection
export { default as FloatingProductPicker } from './FloatingProductPicker'
export type { Product as FloatingProduct } from './FloatingProductPicker'

// Floating Summary Bar - Treatment summary with costs
export { FloatingSummaryBar } from './FloatingSummaryBar'

// Floating Action Buttons - Save, print, export, notes
export { FloatingActionButtons } from './FloatingActionButtons'

// Layers Panel - Product layer visibility control
export { LayersPanel, useLayersState } from './LayersPanel'
export type { Layer, LayersPanelProps } from './LayersPanel'

// =============================================================================
// HELP & ONBOARDING COMPONENTS
// =============================================================================

// Touch Gesture Hints - iPad onboarding for touch gestures
export { TouchGestureHints, useTouchGestureHints, GestureHelpButton } from './TouchGestureHints'

// Keyboard Shortcuts Help - Keyboard shortcut overlay
export { KeyboardShortcutsHelp, KeyboardHelpButton } from './KeyboardShortcutsHelp'

// =============================================================================
// CHART COMPONENTS
// =============================================================================

// Interactive Face Chart (2D)
export { InteractiveFaceChart } from './InteractiveFaceChart'
export type {
  InjectionPoint as InteractiveFaceChartInjectionPoint,
  FreehandPoint
} from './InteractiveFaceChart'

// Face Chart Core (Used inside InjectionMap)
export { FaceChartCore } from './FaceChartCore'
export type {
  InjectionPoint as FaceChartCoreInjectionPoint,
  FreehandPoint as FaceChartCoreFreehandPoint,
  FaceChartCoreProps
} from './FaceChartCore'

// Full Body Chart
export { FullBodyChart } from './FullBodyChart'
export type {
  InjectionPoint as FullBodyChartInjectionPoint
} from './FullBodyChart'

// Torso Chart
export { TorsoChart } from './TorsoChart'

// =============================================================================
// CHART COMPONENTS WITH ZOOM/PAN
// =============================================================================

// Face Chart with Zoom/Pan
export { FaceChartWithZoom } from './FaceChartWithZoom'
export type { FaceChartWithZoomProps, ZoomState, ZoomControls } from './FaceChartWithZoom'

// Torso Chart with Zoom/Pan
export { TorsoChartWithZoom } from './TorsoChartWithZoom'
export type { TorsoChartWithZoomProps } from './TorsoChartWithZoom'

// Full Body Chart with Zoom/Pan
export { FullBodyChartWithZoom } from './FullBodyChartWithZoom'

// Zoom/Pan Controls Component
export { ZoomPanControls, ZoomPanControlsCompact } from './ZoomPanControls'

// Zoom/Pan Hook
export { useChartZoomPan } from '@/hooks/useChartZoomPan'
export type { ZoomPanState, UseChartZoomPanOptions, UseChartZoomPanReturn } from '@/hooks/useChartZoomPan'

// 3D Charts - NOTE: These should be dynamically imported, not used from this barrel export
// Use: dynamic(() => import('@/components/charting/FaceChart3D'), { ssr: false })
// Use: dynamic(() => import('@/components/charting/BodyChart3D'), { ssr: false })
export type { InjectionPoint3D } from './FaceChart3D'

// =============================================================================
// FORM COMPONENTS
// =============================================================================

// SOAP Notes Form
export { SOAPNotesForm } from './SOAPNotesForm'
export type { SOAPNotes } from './SOAPNotesForm'

// Injection Technique Selector
export { InjectionTechniqueSelector, InlineInjectionTechnique } from './InjectionTechniqueSelector'
export type {
  InjectionTechnique,
  InjectionDepth,
  DeliveryMethod,
  NeedleGauge,
  CannulaGauge
} from './InjectionTechniqueSelector'

// =============================================================================
// PHOTO COMPONENTS
// =============================================================================

// Photo Upload
export { PhotoUpload } from './PhotoUpload'
export type {
  TreatmentPhoto,
  PhotoType,
  PhotoAngle
} from './PhotoUpload'

// Photo Comparison
export { PhotoComparison, PhotoCaptureGuide } from './PhotoComparison'
export type { ComparisonPhoto } from './PhotoComparison'

// =============================================================================
// REFERENCE & EDUCATION
// =============================================================================

// Injector Playbook
export { InjectorPlaybook } from './InjectorPlaybook'

// =============================================================================
// PRINT COMPONENTS
// =============================================================================

// Printable Chart
export { PrintableChart, useChartPrintShortcut } from './PrintableChart'
export type { PrintableChartProps, TreatmentSummaryItem } from './PrintableChart'

// =============================================================================
// UTILITIES
// =============================================================================

// Handwriting input utilities
export {
  detectScribbleSupport,
  parseHandwrittenInput
} from './handwritingUtils'

// =============================================================================
// SAFETY FEATURES
// =============================================================================

// Danger Zone Overlay - Critical safety feature for injectable procedures
// Shows anatomical danger zones (arteries, nerves, high-risk areas) on face charts
export {
  DangerZoneOverlay,
  DangerZoneToggle,
  DangerZoneIconToggle,
  useDangerZoneState,
} from './DangerZoneOverlay'
export type {
  DangerZoneCategory,
  AnatomicalStructure,
  DangerZoneOverlayProps,
  DangerZoneToggleProps,
  DangerZoneIconToggleProps,
  UseDangerZoneStateReturn,
} from './DangerZoneOverlay'

// =============================================================================
// FREEHAND PEN TOOL (Smooth Drawing)
// =============================================================================

// Freehand Pen Tool - Smooth drawing with react-sketch-canvas
// General-purpose freehand drawing tool for annotations and markings
// Includes line style options and advanced stroke handling
export {
  VeinDrawingTool,
  VeinDrawingToolbar,
  useVeinPathsState,
  VEIN_TYPE_CONFIGS,
  CONCENTRATION_OPTIONS,
  VOLUME_OPTIONS,
} from './VeinDrawingTool'
export type {
  VeinType,
  VeinTreatmentStatus,
  VeinTypeConfig,
  VeinPoint,
  InjectionSite,
  VeinPath,
  VeinDrawingToolProps,
  VeinDrawingToolRef,
  VeinDrawingToolbarProps,
  UseVeinPathsStateOptions,
  UseVeinPathsStateReturn,
} from './VeinDrawingTool'

// =============================================================================
// ANNOTATION TOOLS
// =============================================================================

// Arrow Tool - For drawing directional arrows (thread lift vectors, filler flow)
export { ArrowTool, useArrowsState, ARROW_COLORS } from './ArrowTool'
export type {
  Arrow,
  ArrowToolRef,
  ArrowToolProps,
  ArrowColorOption,
  UseArrowsStateReturn,
} from './ArrowTool'

// Measurement Tool - Simple two-point distance measurement
export {
  MeasurementTool,
  useMeasurementState,
  DEFAULT_CALIBRATION,
} from './MeasurementTool'
export type {
  MeasurementPoint,
  Measurement,
  CalibrationData,
  MeasurementToolProps,
} from './MeasurementTool'

// Shape Tool - Circle, rectangle, and freeform shape annotations
export {
  ShapeTool,
  ShapeToolbar,
  useShapesState,
  generateShapeId,
  isPointInShape,
  getShapeBounds,
  DEFAULT_SHAPE_COLORS,
  DEFAULT_FILL_OPACITY,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_CLOSE_THRESHOLD,
  SHAPE_TYPE_CONFIG,
} from './ShapeTool'
export type {
  ShapeType,
  ShapePoint,
  ShapeAnnotation,
  DrawingState,
  ShapeToolRef,
  ShapeToolProps,
  ShapeToolbarProps,
  UseShapesStateOptions,
  UseShapesStateReturn,
  ZoomState as ShapeToolZoomState,
} from './ShapeTool'

// Text Label Tool - Quick text annotations on charts (simplified)
export {
  TextLabelTool,
  TextLabelSettingsPanel,
  useTextLabels,
  getAutoFontSize,
  PRESET_LABELS,
  TEXT_COLORS,
  FONT_SIZES,
} from './TextLabelTool'
export type {
  TextLabel,
  TextLabelSize,
  TextLabelToolProps,
} from './TextLabelTool'

// Floating Text Label Panel - Draggable settings panel for text tool
export { FloatingTextLabelPanel } from './FloatingTextLabelPanel'
export type { FloatingTextLabelPanelProps } from './FloatingTextLabelPanel'

// Simple Text Tool - Konva-based text annotations (copies SmoothBrushTool pattern)
// Use this for reliable positioning - it uses the exact same coordinate system as the brush tool
export {
  SimpleTextTool,
  SimpleTextSettingsPanel,
  useSimpleTextLabels,
  TEXT_PRESETS,
} from './SimpleTextTool'
export type {
  SimpleTextLabel,
  SimpleTextToolRef,
  SimpleTextToolProps,
  TextPreset,
} from './SimpleTextTool'

// Cannula Path Tool - For documenting cannula injection techniques
export {
  CannulaPathTool,
  CannulaPathToolbar,
  useCannulaPathsState,
  generateCannulaId,
  getTechniqueDashPattern,
  TECHNIQUE_CONFIGS,
  DEFAULT_PATH_WIDTH,
  MIN_PATH_WIDTH,
  MAX_PATH_WIDTH,
} from './CannulaPathTool'
export type {
  CannulaPoint,
  CannulaTechnique,
  CannulaPath,
  CannulaPathSegment,
  DepositZone,
  CannulaPathToolProps,
  CannulaPathToolbarProps,
  UseCannulaPathsStateOptions,
  UseCannulaPathsStateReturn,
} from './CannulaPathTool'

// =============================================================================
// BOTTOM ACTION BAR
// =============================================================================

// Bottom Action Bar - Always-visible action bar at bottom of charting area
// Contains: Undo/Redo (left), Zoom controls (center), Save (right)
// Psychology-based: Z-pattern scanning ends at bottom-right (completion zone)
export { BottomActionBar, BottomActionBarCompact, BottomActionBarSimple } from './BottomActionBar'
export type { BottomActionBarProps, BottomActionBarSimpleProps } from './BottomActionBar'

// =============================================================================
// ZONE DISPLAY COMPONENTS
// =============================================================================

// Zone Detection UI - Displays detected zones on strokes, allows overrides
// Per PRACTITIONER_CONTEXT.md: Zone detection should HELP by reducing
// documentation work, not interrupt with popups. One-tap to change.
export {
  ZoneBadge,
  ZoneOverridePopover,
  TreatedZonesSummary,
  ZoneBoundaryOverlay,
  ZoneOverlayToggle,
  useZoneOverlayState,
  useZoneOverridePopover,
  DEFAULT_FACE_ZONE_BOUNDARIES,
} from './ZoneDisplay'
export type {
  DetectedZone,
  ZoneBoundary,
  StrokeWithZone,
  ZoneTreatmentSummary,
  ZoneBadgeProps,
  ZoneOverridePopoverProps,
  TreatedZonesSummaryProps,
  ZoneBoundaryOverlayProps,
  ZoneOverlayToggleProps,
} from './ZoneDisplay'

// =============================================================================
// BRUSH AREA TOOL (Area Treatment Marking)
// =============================================================================

// Brush Area Tool - For painting treatment areas (laser, microneedling, etc.)
// with automatic zone detection based on stroke location
export {
  BrushAreaTool,
  BrushAreaToolbar,
  useBrushAreasState,
  DEFAULT_TREATMENT_TYPES,
  BRUSH_SIZE_PRESETS,
  BRUSH_RADIUS_MIN,
  BRUSH_RADIUS_MAX,
  generateBrushAreaId,
  calculateBrushAreaBounds,
  isPointInBrushArea,
  getTreatmentTypeConfig,
  brushAreasToSVG,
  smoothBrushPath,
} from './BrushAreaTool'
export type {
  BrushPoint,
  BrushSize,
  TreatmentAreaType,
  TreatmentTypeConfig,
  BrushArea,
  BrushAreaBounds,
  BrushAreaToolProps,
  BrushAreaToolbarProps,
  UseBrushAreasStateOptions,
  UseBrushAreasStateReturn,
  BrushAreaDetectedZone,
} from './BrushAreaTool'

// Zone Detection - Automatic detection of anatomical zones from brush strokes
export {
  detectZoneFromStroke,
  detectMultipleZones,
  getZoneById,
  getZonesByCategory,
  getZoneName,
  FACE_ZONE_DEFINITIONS,
} from './zoneDetection'
export type {
  DetectedZone as ZoneDetectionDetectedZone, // From zoneDetection.ts - has zoneId, zoneName
  DetectedZone as ZoneDetectionResult, // Alias for backward compatibility
  ZoneDefinition,
} from './zoneDetection'

// Zone Detection Summary - UI for displaying detected zones after drawing
export { ZoneDetectionSummary } from './ZoneDetectionSummary'
export type { ZoneDetectionSummaryProps } from './ZoneDetectionSummary'

// Smooth Brush Tool - Advanced brush drawing using react-sketch-canvas
export {
  SmoothBrushTool,
  DEFAULT_TREATMENT_TYPES as SMOOTH_BRUSH_TREATMENT_TYPES,
} from './SmoothBrushTool'
export type {
  SmoothBrushToolRef,
  SmoothBrushToolProps,
  BrushPathsByType,
  TreatmentAreaType as SmoothBrushTreatmentType,
} from './SmoothBrushTool'
