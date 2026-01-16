// =============================================================================
// CHARTING SETTINGS TYPES
// Shared types for all charting settings components
// =============================================================================

export type TreatmentCategory =
  | 'injectables'
  | 'lasers'
  | 'rf-microneedling'
  | 'skin-treatments'
  | 'body-contouring'
  | 'threads'
  | 'iv-therapy'
  | 'weight-loss'
  | 'hair-restoration'
  | 'hormone-therapy'
  | 'sexual-wellness'
  | 'vein-treatments'
  | 'hyperbaric-oxygen'
  | 'cryotherapy'
  | 'tattoo-removal'
  | 'acne-programs'
  | 'medical-skincare'

export interface CategoryTab {
  id: TreatmentCategory
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

export interface DeviceProduct {
  id: string
  name: string
  brand: string
  category: string
  subcategory?: string
  isActive: boolean
  isDefault: boolean
}

export interface TreatmentParameter {
  id: string
  name: string
  defaultValue: string | number
  unit: string
  minValue?: number
  maxValue?: number
  options?: string[]
  description?: string
  isActive: boolean
}

export interface NeedleCannulaSize {
  id: string
  gauge: string
  length: string
  type: 'needle' | 'cannula'
  recommendedFor: string[]
  isActive: boolean
  isDefault: boolean
}

export interface TreatmentZone {
  id: string
  name: string
  anatomicalName?: string
  category: string
  defaultSettings?: Record<string, string | number>
  isActive: boolean
  isCustom: boolean
}

export interface DocumentationTemplate {
  id: string
  name: string
  category: string
  template: string
  variables: string[]
  isActive: boolean
  isDefault: boolean
}

export interface CategorySettings {
  products: DeviceProduct[]
  parameters: TreatmentParameter[]
  needlesSizes: NeedleCannulaSize[]
  zones: TreatmentZone[]
  templates: DocumentationTemplate[]
}

export interface ToolVisibilitySettings {
  // Advanced drawing tools
  brushTool: boolean
  arrowTool: boolean
  textLabels: boolean
  shapeTool: boolean
  measurementTool: boolean
  cannulaPathTool: boolean
  veinDrawingTool: boolean
  dangerZoneOverlay: boolean
  // UI Settings
  showCalibrationControls: boolean
  showAdvancedPanels: boolean
  compactMode: boolean
}

export interface GeneralSettings {
  theme: 'light' | 'dark'
  autoSave: boolean
  requireSignOff: boolean
  requireLotNumbers: boolean
  showAnatomicalNames: boolean
}

export interface AllChartingSettings {
  injectables: CategorySettings
  lasers: CategorySettings
  'rf-microneedling': CategorySettings
  'skin-treatments': CategorySettings
  'body-contouring': CategorySettings
  threads: CategorySettings
  'iv-therapy': CategorySettings
  'weight-loss': CategorySettings
  'hair-restoration': CategorySettings
  'hormone-therapy': CategorySettings
  'sexual-wellness': CategorySettings
  'vein-treatments': CategorySettings
  'hyperbaric-oxygen': CategorySettings
  cryotherapy: CategorySettings
  'tattoo-removal': CategorySettings
  'acne-programs': CategorySettings
  'medical-skincare': CategorySettings
  general: GeneralSettings
  toolVisibility: ToolVisibilitySettings
}

// Theme classes type from ChartingThemeContext
export interface ThemeClasses {
  panelBg: string
  panelHandle: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  textDisabled: string
  buttonDefault: string
  buttonActive: string
  buttonDisabled: string
  input: string
  inputFocus: string
  divider: string
  hoverBg: string
  activeBg: string
  badge: string
  badgeActive: string
  canvasBg: string
  loadingBg: string
  loadingText: string
  loadingSpinner: string
  shadow: string
  shadowHover: string
  dragDots: string
  dropdown: string
  dropdownItem: string
  dropdownItemActive: string
}
