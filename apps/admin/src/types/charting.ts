/**
 * Charting System Types
 *
 * Comprehensive type definitions for the injection charting system including:
 * - 2D face charts with freehand drawing
 * - 3D face and body models with anatomical precision
 * - Injection point tracking with units, depth, technique
 * - Treatment documentation and SOAP notes
 * - Photo documentation and comparison
 */

import * as THREE from 'three'

// =============================================================================
// CORE ENUMS & TYPES
// =============================================================================

/**
 * Chart view types available in the system
 */
export type ChartView = 'face' | 'torso' | 'fullBody' | 'male3d' | 'female3d'

/**
 * Viewing mode for charts
 */
export type ViewMode = '2d' | '3d'

/**
 * Product types for injection charting
 */
export type ProductType = 'neurotoxin' | 'filler'

/**
 * Injection depth options
 */
export type InjectionDepth = 'intradermal' | 'subcutaneous' | 'intramuscular' | 'supraperiosteal'

/**
 * Injection techniques
 */
export type InjectionTechnique =
  | 'serial_puncture'
  | 'linear_threading'
  | 'cross_hatch'
  | 'fanning'
  | 'depot'
  | 'bolus'
  | 'cannula'

/**
 * Needle gauge options
 */
export type NeedleGauge = '27G' | '30G' | '31G' | '32G' | '33G' | '34G'

/**
 * Gender selection for anatomical models
 */
export type Gender = 'male' | 'female'

/**
 * Drawing mode for 2D charts
 */
export type DrawingMode = 'zones' | 'freehand'

/**
 * Selection mode for multi-zone editing
 */
export type SelectionMode = 'single' | 'multi'

// =============================================================================
// INJECTION POINT TYPES
// =============================================================================

/**
 * Base injection point properties shared across all chart types
 */
export interface BaseInjectionPoint {
  id: string
  units?: number                    // For neurotoxins (Botox, Dysport, Xeomin)
  volume?: number                   // For fillers (mL)
  depthId: string                   // Reference to depth preset
  techniqueId: string               // Reference to technique preset
  needleGaugeId: string             // Reference to needle gauge
  productId?: string                // Optional product reference
  notes?: string                    // Additional practitioner notes
  timestamp: Date                   // When point was created
}

/**
 * 2D injection point with zone-based placement
 * Used in EnhancedChartingView component
 */
export interface InjectionPoint extends BaseInjectionPoint {
  zoneId: string                    // Predefined anatomical zone
}

/**
 * 2D freehand injection point with custom positioning
 * Used in InteractiveFaceChart component for precise placement
 */
export interface FreehandPoint extends BaseInjectionPoint {
  x: number                         // X position (percentage 0-100)
  y: number                         // Y position (percentage 0-100)
  customName?: string               // Custom label for the point
}

/**
 * 3D injection point with spatial positioning
 * Used in FaceChart3D and BodyChart3D components
 */
export interface InjectionPoint3D extends BaseInjectionPoint {
  position: THREE.Vector3           // 3D coordinates on the mesh
  screenPosition?: {                // 2D screen position for UI rendering
    x: number
    y: number
  }
  zoneId?: string                   // Optional zone association
  customName?: string               // Custom label for custom points
  productType: ProductType          // Track which product type (neurotoxin/filler)
  productId?: string                // Specific product ID for per-product layer filtering
}

// =============================================================================
// ZONE & TEMPLATE TYPES
// =============================================================================

/**
 * Anatomical injection zone definition
 * Defines clickable regions on charts with default settings
 */
export interface InjectionZone {
  id: string
  name: string                      // Display name (e.g., "Forehead", "Glabella")
  category: 'face' | 'body'         // Primary category
  subCategory?: string              // Grouping (e.g., "upper-face", "mid-face")
  path?: string                     // SVG path for 2D charts
  defaultUnits?: number             // Default units for neurotoxins
  defaultVolume?: number            // Default volume for fillers (mL)
  description?: string              // Clinical description
  active: boolean                   // Whether zone is enabled
  order: number                     // Display order
}

/**
 * Treatment template for quick application
 * Allows practitioners to apply common treatment patterns
 */
export interface TreatmentTemplate {
  id: string
  name: string                      // Template name (e.g., "Standard Forehead")
  description?: string
  productType: ProductType          // Neurotoxin or filler
  zones: {
    zoneId: string
    units?: number
    volume?: number
    depthId: string
    techniqueId: string
    needleGaugeId: string
  }[]
  totalUnits?: number              // Precalculated total
  totalVolume?: number             // Precalculated total
  active: boolean
  order: number
}

/**
 * Injection depth preset configuration
 */
export interface InjectionDepthPreset {
  id: string
  name: string                     // Display name
  depth: InjectionDepth            // Depth type
  description?: string             // Clinical guidance
  active: boolean
  order: number
}

/**
 * Injection technique preset configuration
 */
export interface InjectionTechniquePreset {
  id: string
  name: string                     // Display name
  technique: InjectionTechnique    // Technique type
  description?: string             // Clinical guidance
  active: boolean
  order: number
}

/**
 * Needle gauge option
 */
export interface NeedleGaugeOption {
  id: string
  gauge: NeedleGauge
  description?: string
  active: boolean
  order: number
}

/**
 * Product preset for quick selection
 */
export interface ProductPreset {
  id: string
  name: string                     // Product name (e.g., "Botox", "Juvederm Ultra")
  productType: ProductType
  manufacturer?: string
  concentration?: string           // e.g., "100 units/vial"
  unitType?: 'unit' | 'ml' | 'syringe'
  unitsPerPackage?: number
  defaultPrice?: number
  active: boolean
  order: number
}

// =============================================================================
// TREATMENT SUMMARY TYPES
// =============================================================================

/**
 * Product breakdown in treatment summary
 */
export interface ProductBreakdown {
  productId: string
  productName: string
  productType: ProductType
  totalUnits?: number              // For neurotoxins
  totalVolume?: number             // For fillers
  zoneBreakdown: {
    zoneId: string
    zoneName: string
    units?: number
    volume?: number
  }[]
  estimatedCost?: number
}

/**
 * Treatment summary with totals and cost
 */
export interface TreatmentSummary {
  totalUnits: number               // Total neurotoxin units
  totalVolume: number              // Total filler volume (mL)
  totalCost: number                // Estimated total cost
  products: ProductBreakdown[]     // Breakdown by product
  zoneCount: number                // Number of zones treated
  pointCount: number               // Total injection points
  timestamp: Date                  // Summary generation time
}

// =============================================================================
// CHARTING STATE TYPES
// =============================================================================

/**
 * Complete charting state for a treatment session
 * Manages all injection points and view settings
 */
export interface ChartingState {
  // View configuration
  viewMode: ViewMode                                    // 2D or 3D
  currentView: ChartView                                // Face, torso, body
  gender: Gender                                        // Male or female model
  productType: ProductType                              // Neurotoxin or filler
  drawingMode?: DrawingMode                             // For 2D charts
  selectionMode?: SelectionMode                         // Single or multi-select

  // Injection data (by chart type)
  injectionPoints: Map<string, InjectionPoint>          // Zone-based points
  freehandPoints?: Map<string, FreehandPoint>           // Freehand 2D points
  injectionPoints3D?: Map<string, InjectionPoint3D>     // 3D face points
  bodyInjectionPoints3D?: Map<string, InjectionPoint3D> // 3D body points

  // Selection state
  selectedZones: string[]                               // Currently selected zones
  selectedPointId?: string | null                       // Currently selected point
  hoveredZoneId?: string | null                         // Currently hovered zone

  // Treatment metadata
  patientId?: string
  appointmentId?: string
  practitionerId?: string
  startTime?: Date
  lastModified?: Date
}

// =============================================================================
// SOAP NOTES TYPES
// =============================================================================

/**
 * SOAP notes structure for clinical documentation
 */
export interface SOAPNotes {
  subjective: string               // Patient's complaint and goals
  objective: string                // Clinical findings
  assessment: string               // Diagnosis and rationale
  plan: string                     // Treatment performed and follow-up
}

/**
 * Voice dictation state for SOAP notes
 */
export interface VoiceInputState {
  isListening: boolean
  field: keyof SOAPNotes | null    // Which SOAP field is being dictated
  transcript: string
  error?: string
}

// =============================================================================
// PHOTO DOCUMENTATION TYPES
// =============================================================================

/**
 * Photo angles for before/after documentation
 */
export type PhotoAngle =
  | 'frontal'
  | 'left_profile'
  | 'right_profile'
  | 'left_oblique'
  | 'right_oblique'
  | 'chin_up'
  | 'eyes_closed'
  | 'smile'
  | 'custom'

/**
 * Photo type classification
 */
export type PhotoType = 'before' | 'after' | 'progress' | 'complication'

/**
 * Treatment photo metadata
 */
export interface TreatmentPhoto {
  id: string
  url: string                      // Photo URL (local or cloud storage)
  type: PhotoType
  angle: PhotoAngle
  timestamp: Date
  notes?: string
  uploadedBy: string
  treatmentId?: string
  patientId?: string
  metadata?: {
    width?: number
    height?: number
    fileSize?: number
    mimeType?: string
  }
}

/**
 * Photo comparison pair for before/after view
 */
export interface ComparisonPhoto {
  before?: TreatmentPhoto
  after?: TreatmentPhoto
  angle: PhotoAngle
  notes?: string
}

// =============================================================================
// TREATMENT SESSION TYPES
// =============================================================================

/**
 * Complete treatment session data
 * Combines all charting data with clinical documentation
 */
export interface TreatmentSession {
  // Identity
  id: string
  patientId: string
  patientName?: string             // Denormalized for display
  appointmentId?: string
  practitionerId: string
  practitionerName?: string        // Denormalized for display

  // Session metadata
  startTime: Date
  endTime?: Date
  status: 'in_progress' | 'completed' | 'cancelled'

  // Charting data
  chartingState: ChartingState
  summary: TreatmentSummary

  // Clinical documentation
  soapNotes: SOAPNotes
  photos: TreatmentPhoto[]

  // Consent & compliance
  consentSigned: boolean
  consentSignedAt?: Date
  photoConsentSigned: boolean

  // Products used (for inventory tracking)
  productsUsed: {
    productId: string
    productName: string
    quantity: number               // Units or volume
    lotNumber?: string
    expirationDate?: Date
    cost?: number
  }[]

  // Billing integration
  invoiceGenerated: boolean
  invoiceId?: string

  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
  lastModifiedBy: string
}

// =============================================================================
// CHARTING SETTINGS TYPES
// =============================================================================

/**
 * User preferences for charting behavior
 */
export interface ChartingSettings {
  // Display preferences
  defaultViewMode: ViewMode
  defaultGender: Gender
  showZoneLabels: boolean
  showGridLines: boolean

  // Input preferences
  enableVoiceDictation: boolean
  autoSaveInterval: number         // Minutes
  defaultNeedleGauge: string
  defaultDepth: string
  defaultTechnique: string

  // Defaults by product type
  neurotoxinDefaults?: {
    productId?: string
    unitIncrement: number          // Default: 1 or 2
  }
  fillerDefaults?: {
    productId?: string
    volumeIncrement: number        // Default: 0.1 or 0.5
  }

  // Zone configuration
  activeZones: string[]            // Enabled zone IDs
  customZones?: InjectionZone[]    // User-defined zones

  // Template management
  favoriteTemplates: string[]      // Template IDs

  // Photo settings
  requirePhotos: boolean
  requiredPhotoAngles: PhotoAngle[]
  autoUploadToCloud: boolean

  // Compliance
  requireSOAPCompletion: boolean
  requireConsentSignature: boolean
}

// =============================================================================
// UI STATE TYPES
// =============================================================================

/**
 * Quick edit bubble state for zone editing
 */
export interface QuickEditState {
  isOpen: boolean
  zoneId: string | null
  position: { x: number; y: number }
}

/**
 * Zone info bubble state
 */
export interface QuickBubbleState {
  isOpen: boolean
  zoneId: string | null
  zone: InjectionZone | null
  position: { x: number; y: number }
}

/**
 * Toolbar state for charting interface
 */
export interface ToolbarState {
  activeTool: 'select' | 'add' | 'edit' | 'delete' | 'move'
  brushSize?: number               // For freehand drawing
  snapToZones: boolean             // Snap points to nearest zone
  showMeasurements: boolean        // Display measurements/distances
}

// =============================================================================
// EXPORT/PRINT TYPES
// =============================================================================

/**
 * Chart export format options
 */
export type ExportFormat = 'pdf' | 'json' | 'png' | 'print'

/**
 * Export configuration
 */
export interface ExportConfig {
  format: ExportFormat
  includePhotos: boolean
  includeSOAPNotes: boolean
  include3DScreenshots: boolean
  includeProductDetails: boolean
  includePatientInfo: boolean
  watermark?: string
}

/**
 * Complete chart data for export
 */
export interface ChartExportData {
  treatmentSession: TreatmentSession
  exportedAt: Date
  exportedBy: string
  format: ExportFormat
  metadata: {
    version: string
    platformVersion: string
  }
}

// =============================================================================
// VALIDATION TYPES
// =============================================================================

/**
 * Validation result for treatment session
 */
export interface TreatmentValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
  missingRequired: {
    soapNotes?: boolean
    photos?: boolean
    consent?: boolean
    productDetails?: boolean
  }
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Common anatomical zones for face treatments
 */
export const FACE_ZONES = {
  UPPER_FACE: {
    FOREHEAD: 'forehead',
    GLABELLA: 'glabella',
    BROW_LIFT: 'brow-lift'
  },
  MID_FACE: {
    CROWS_FEET: 'crows-feet',
    BUNNY_LINES: 'bunny-lines',
    CHEEKS: 'cheeks',
    UNDER_EYES: 'under-eyes'
  },
  LOWER_FACE: {
    NASOLABIAL_FOLDS: 'nasolabial-folds',
    MARIONETTE_LINES: 'marionette-lines',
    LIPS: 'lips',
    CHIN: 'chin',
    JAWLINE: 'jawline'
  }
} as const

/**
 * Common photo angles for documentation
 */
export const PHOTO_ANGLES: PhotoAngle[] = [
  'frontal',
  'left_profile',
  'right_profile',
  'left_oblique',
  'right_oblique',
  'chin_up',
  'eyes_closed',
  'smile'
]

/**
 * Unit increments for different product types
 */
export const UNIT_INCREMENTS = {
  neurotoxin: [1, 2, 5],           // Units
  filler: [0.1, 0.25, 0.5, 1.0]    // mL
} as const

// =============================================================================
// BRUSH / AREA TREATMENT TYPES
// =============================================================================

/**
 * Treatment category for brush/area marking
 * Used to categorize different treatment types for the paintbrush tool
 */
export type TreatmentCategory = 'laser' | 'skin' | 'body' | 'injectable' | 'other'

/**
 * Treatment area definition for brush tool
 * Defines a type of treatment that can be painted on charts
 */
export interface TreatmentArea {
  id: string
  name: string                      // Display name (e.g., "Fractional Laser")
  category: TreatmentCategory       // Treatment category
  color: string                     // Hex color for rendering
  opacity: number                   // Default opacity (0-1)
  description?: string              // Clinical description
  defaultRadius?: number            // Default brush radius in pixels
  icon?: string                     // Optional icon identifier
  active: boolean                   // Whether this treatment type is enabled
  order: number                     // Display order in picker
}

/**
 * Individual brush stroke data
 * Represents a single painted stroke on the chart
 */
export interface BrushStroke {
  id: string
  points: BrushPoint[]              // Array of points forming the stroke
  radius: number                    // Brush radius used for this stroke
  treatmentTypeId: string           // Reference to TreatmentArea.id
  color: string                     // Color used (from TreatmentArea)
  opacity: number                   // Opacity used (0-1)
  createdAt: Date                   // When stroke was created
  modifiedAt?: Date                 // When stroke was last modified
  label?: string                    // Optional custom label
  notes?: string                    // Clinical notes for this stroke
  createdBy?: string                // Practitioner ID who created it
}

/**
 * Individual point within a brush stroke
 * Contains position and optional pressure data for tablet support
 */
export interface BrushPoint {
  x: number                         // X position (percentage 0-100 or pixels)
  y: number                         // Y position (percentage 0-100 or pixels)
  pressure?: number                 // Pressure from stylus (0-1), optional
  timestamp?: number                // Time offset from stroke start in ms
}

/**
 * Layer containing brush strokes for a specific treatment type
 * Groups all strokes of the same treatment type together
 */
export interface BrushLayer {
  id: string
  name: string                      // Display name (can be customized)
  treatmentType: TreatmentArea      // The treatment type for this layer
  strokes: BrushStroke[]            // All strokes in this layer
  isVisible: boolean                // Whether layer is visible
  isLocked: boolean                 // Whether layer is editable
  opacity: number                   // Layer-level opacity modifier (0-1)
  order: number                     // Z-order for rendering
  createdAt: Date
  modifiedAt?: Date
}

/**
 * Brush tool settings state
 */
export interface BrushToolSettings {
  radius: number                    // Current brush radius (pixels)
  minRadius: number                 // Minimum allowed radius
  maxRadius: number                 // Maximum allowed radius
  opacity: number                   // Current opacity (0-1)
  hardness: number                  // Edge hardness (0=soft, 1=hard)
  pressureSensitivity: boolean      // Whether to use stylus pressure
  smoothing: number                 // Path smoothing level (0-1)
}

/**
 * State for brush/area charting session
 */
export interface BrushChartingState {
  layers: BrushLayer[]              // All brush layers
  activeTreatmentType: TreatmentArea | null  // Currently selected treatment
  activeLayerId: string | null      // Currently active layer
  toolSettings: BrushToolSettings   // Current brush settings
  isDrawing: boolean                // Whether currently drawing
  currentStroke: BrushStroke | null // Stroke being drawn
  undoStack: BrushChartingAction[]  // Undo history
  redoStack: BrushChartingAction[]  // Redo history
}

/**
 * Action types for undo/redo
 */
export type BrushChartingActionType =
  | 'ADD_STROKE'
  | 'DELETE_STROKE'
  | 'MODIFY_STROKE'
  | 'ADD_LAYER'
  | 'DELETE_LAYER'
  | 'MODIFY_LAYER'
  | 'REORDER_LAYERS'

/**
 * Action record for undo/redo stack
 */
export interface BrushChartingAction {
  type: BrushChartingActionType
  layerId: string
  strokeId?: string
  previousState: Partial<BrushLayer | BrushStroke>
  newState: Partial<BrushLayer | BrushStroke>
  timestamp: Date
}

// =============================================================================
// TREATMENT AREA CATALOG (CONSTANTS)
// =============================================================================

/**
 * Default treatment areas for brush tool
 * Common MedSpa treatments with appropriate colors
 */
export const DEFAULT_TREATMENT_AREAS: TreatmentArea[] = [
  // Laser Treatments
  {
    id: 'fractional-laser',
    name: 'Fractional Laser',
    category: 'laser',
    color: '#F97316',               // Orange/Amber
    opacity: 0.5,
    description: 'Fractional CO2 or Erbium laser resurfacing zones',
    defaultRadius: 20,
    active: true,
    order: 1,
  },
  {
    id: 'co2-laser',
    name: 'CO2 Laser',
    category: 'laser',
    color: '#EF4444',               // Red
    opacity: 0.5,
    description: 'CO2 laser ablation treatment areas',
    defaultRadius: 15,
    active: true,
    order: 2,
  },
  {
    id: 'ipl-treatment',
    name: 'IPL Treatment',
    category: 'laser',
    color: '#EAB308',               // Yellow/Gold
    opacity: 0.45,
    description: 'Intense Pulsed Light photofacial zones',
    defaultRadius: 25,
    active: true,
    order: 3,
  },
  {
    id: 'nd-yag-laser',
    name: 'Nd:YAG Laser',
    category: 'laser',
    color: '#DC2626',               // Deeper red
    opacity: 0.5,
    description: 'Nd:YAG laser for vascular or hair removal',
    defaultRadius: 18,
    active: true,
    order: 4,
  },
  {
    id: 'alexandrite-laser',
    name: 'Alexandrite Laser',
    category: 'laser',
    color: '#A855F7',               // Purple
    opacity: 0.5,
    description: 'Alexandrite laser hair removal zones',
    defaultRadius: 22,
    active: true,
    order: 5,
  },

  // Skin Treatments
  {
    id: 'microneedling',
    name: 'Microneedling',
    category: 'skin',
    color: '#3B82F6',               // Blue
    opacity: 0.45,
    description: 'Microneedling/collagen induction therapy zones',
    defaultRadius: 20,
    active: true,
    order: 6,
  },
  {
    id: 'chemical-peel',
    name: 'Chemical Peel',
    category: 'skin',
    color: '#22C55E',               // Green
    opacity: 0.4,
    description: 'Chemical peel application areas',
    defaultRadius: 30,
    active: true,
    order: 7,
  },
  {
    id: 'hydrafacial',
    name: 'HydraFacial',
    category: 'skin',
    color: '#06B6D4',               // Cyan
    opacity: 0.4,
    description: 'HydraFacial treatment zones',
    defaultRadius: 28,
    active: true,
    order: 8,
  },
  {
    id: 'dermaplaning',
    name: 'Dermaplaning',
    category: 'skin',
    color: '#84CC16',               // Lime
    opacity: 0.35,
    description: 'Dermaplaning treatment areas',
    defaultRadius: 25,
    active: true,
    order: 9,
  },

  // RF & Energy Treatments
  {
    id: 'rf-skin-tightening',
    name: 'RF Skin Tightening',
    category: 'skin',
    color: '#8B5CF6',               // Purple/Violet
    opacity: 0.5,
    description: 'Radiofrequency skin tightening zones',
    defaultRadius: 22,
    active: true,
    order: 10,
  },
  {
    id: 'rf-microneedling',
    name: 'RF Microneedling',
    category: 'skin',
    color: '#6366F1',               // Indigo
    opacity: 0.5,
    description: 'RF microneedling (Morpheus8, Vivace) zones',
    defaultRadius: 18,
    active: true,
    order: 11,
  },
  {
    id: 'ultherapy',
    name: 'Ultherapy',
    category: 'skin',
    color: '#7C3AED',               // Violet
    opacity: 0.5,
    description: 'Ultrasound skin lifting treatment lines',
    defaultRadius: 12,
    active: true,
    order: 12,
  },

  // Body Treatments
  {
    id: 'coolsculpting',
    name: 'CoolSculpting Zone',
    category: 'body',
    color: '#14B8A6',               // Teal/Cyan
    opacity: 0.5,
    description: 'Cryolipolysis applicator placement zones',
    defaultRadius: 35,
    active: true,
    order: 13,
  },
  {
    id: 'emsculpt',
    name: 'EMSculpt',
    category: 'body',
    color: '#0EA5E9',               // Sky blue
    opacity: 0.45,
    description: 'EMSculpt/EMSculpt NEO treatment zones',
    defaultRadius: 40,
    active: true,
    order: 14,
  },
  {
    id: 'body-contouring',
    name: 'Body Contouring',
    category: 'body',
    color: '#10B981',               // Emerald
    opacity: 0.45,
    description: 'General body contouring treatment areas',
    defaultRadius: 35,
    active: true,
    order: 15,
  },
  {
    id: 'cellulite-treatment',
    name: 'Cellulite Treatment',
    category: 'body',
    color: '#F472B6',               // Pink
    opacity: 0.4,
    description: 'Cellulite reduction treatment zones',
    defaultRadius: 30,
    active: true,
    order: 16,
  },

  // Injectable Marking (for pre-treatment planning)
  {
    id: 'prp-injection',
    name: 'PRP Injection Zone',
    category: 'injectable',
    color: '#EC4899',               // Pink/Magenta
    opacity: 0.4,
    description: 'PRP/PRF injection treatment areas',
    defaultRadius: 15,
    active: true,
    order: 17,
  },
  {
    id: 'mesotherapy',
    name: 'Mesotherapy',
    category: 'injectable',
    color: '#F59E0B',               // Amber
    opacity: 0.4,
    description: 'Mesotherapy injection zones',
    defaultRadius: 18,
    active: true,
    order: 18,
  },

  // Custom/Other
  {
    id: 'custom',
    name: 'Custom Treatment',
    category: 'other',
    color: '#6B7280',               // Gray
    opacity: 0.5,
    description: 'User-defined treatment area',
    defaultRadius: 20,
    active: true,
    order: 99,
  },
]

/**
 * Get a treatment area by ID
 */
export function getTreatmentAreaById(id: string): TreatmentArea | undefined {
  return DEFAULT_TREATMENT_AREAS.find(area => area.id === id)
}

/**
 * Get all treatment areas for a specific category
 */
export function getTreatmentAreasByCategory(category: TreatmentCategory): TreatmentArea[] {
  return DEFAULT_TREATMENT_AREAS.filter(area => area.category === category && area.active)
}

/**
 * Get all active treatment areas sorted by order
 */
export function getActiveTreatmentAreas(): TreatmentArea[] {
  return DEFAULT_TREATMENT_AREAS
    .filter(area => area.active)
    .sort((a, b) => a.order - b.order)
}

/**
 * Default brush tool settings
 */
export const DEFAULT_BRUSH_SETTINGS: BrushToolSettings = {
  radius: 20,
  minRadius: 5,
  maxRadius: 50,
  opacity: 0.5,
  hardness: 0.7,
  pressureSensitivity: true,
  smoothing: 0.3,
}

/**
 * Treatment category display names and colors
 */
export const TREATMENT_CATEGORIES: Record<TreatmentCategory, { name: string; color: string }> = {
  laser: { name: 'Laser Treatments', color: '#EF4444' },
  skin: { name: 'Skin Treatments', color: '#3B82F6' },
  body: { name: 'Body Treatments', color: '#14B8A6' },
  injectable: { name: 'Injectable Marking', color: '#EC4899' },
  other: { name: 'Other', color: '#6B7280' },
}
