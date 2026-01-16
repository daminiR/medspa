'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// Needle gauge options
export interface NeedleGaugeOption {
  id: string
  gauge: string // e.g., "30G", "27G"
  diameter: string // e.g., "0.30mm"
  length: string // e.g., "13mm"
  color: string // Color coding for visual identification
  recommendedFor: string[] // e.g., ["Botox", "Fine lines"]
  isDefault: boolean
  isActive: boolean
}

// Cannula options
export interface CannulaOption {
  id: string
  gauge: string // e.g., "25G", "22G"
  length: string // e.g., "38mm", "50mm"
  flexibility: 'rigid' | 'semi-flexible' | 'flexible'
  recommendedFor: string[]
  isDefault: boolean
  isActive: boolean
}

// Injection depth presets
export interface InjectionDepthPreset {
  id: string
  name: string
  depth: 'superficial' | 'intradermal' | 'mid-dermis' | 'deep-dermis' | 'subcutaneous' | 'supraperiosteal' | 'periosteal' | 'intramuscular'
  depthMm: string // e.g., "0.5-1mm"
  description: string
  recommendedFor: string[]
  color: string
  isActive: boolean
}

// Injection technique presets
export interface InjectionTechniquePreset {
  id: string
  name: string
  technique: 'serial-puncture' | 'linear-threading' | 'fanning' | 'cross-hatching' | 'bolus' | 'micro-droplet' | 'blanching'
  description: string
  recommendedFor: string[]
  icon?: string
  isActive: boolean
}

// Treatment area/zone customization
export interface TreatmentZone {
  id: string
  name: string
  anatomicalName?: string
  category: 'face' | 'body' | 'hands' | 'neck' | 'scalp'
  subCategory?: string // e.g., "upper-face", "mid-face", "lower-face"
  defaultUnits?: number
  defaultVolume?: number // ml for fillers
  defaultDepth: string
  defaultTechnique: string
  defaultNeedleGauge: string
  coordinates?: { x: number; y: number } // For face/body chart positioning
  isActive: boolean
  isCustom: boolean
}

// Product preset (for quick selection)
export interface ProductPreset {
  id: string
  name: string
  brand: string
  type: 'neurotoxin' | 'filler' | 'biostimulator' | 'skin-booster'
  defaultUnits?: number
  defaultVolume?: number
  unitPrice: number
  recommendedDepths: string[]
  recommendedTechniques: string[]
  recommendedGauges: string[]
  dilutionRatio?: string
  isActive: boolean
}

// Treatment template (for quick charting)
export interface TreatmentTemplate {
  id: string
  name: string
  description: string
  category: string
  productType?: 'botox' | 'filler' | 'prf' | 'other'
  zones: {
    zoneId: string
    units?: number
    volume?: number
    depth: string
    technique: string
    needleGauge: string
  }[]
  products: string[] // Product preset IDs
  estimatedTime: number // minutes
  isDefault: boolean
  isActive: boolean
  createdBy?: string
  createdAt: Date
}

// Provider preferences
export interface ProviderPreferences {
  providerId: string
  providerName: string
  defaultNeedleGauge: string
  defaultCannulaGauge: string
  defaultDepth: string
  defaultTechnique: string
  preferredProducts: string[]
  favoriteTemplates: string[]
  chartingNotes?: string
}

// Photo settings
export interface PhotoSettings {
  requireConsent: boolean
  defaultAngles: string[]
  watermarkEnabled: boolean
  watermarkText: string
  autoBackup: boolean
  compressionQuality: 'high' | 'medium' | 'low'
  standardizedLighting: boolean
}

// Tool visibility settings - controls which tools appear in the charting toolbar
export interface ToolVisibilitySettings {
  // Basic tools (always visible, cannot be disabled)
  // - Select, Freehand/Pen, Undo/Redo

  // Advanced drawing tools
  brushTool: boolean           // Treatment areas painting
  arrowTool: boolean          // Thread lifts, flow direction
  textLabels: boolean         // Annotations (Avoid, Bruise, Notes)
  shapeTool: boolean          // Circles, rectangles
  measurementTool: boolean    // Distance measurements
  cannulaPathTool: boolean    // Cannula entry points and fanning
  veinDrawingTool: boolean    // Smooth freehand pen drawing tool
  dangerZoneOverlay: boolean  // Mark danger/avoid zones

  // UI Settings
  showCalibrationControls: boolean  // For measurement tool
  showAdvancedPanels: boolean       // Additional detail panels
  compactMode: boolean              // Smaller UI elements
}

// SOAP Notes settings
export interface SOAPNotesSettings {
  autoSave: boolean
  autoSaveInterval: number // seconds
  defaultTemplates: {
    subjective: string
    objective: string
    assessment: string
    plan: string
  }
  requiredFields: ('subjective' | 'objective' | 'assessment' | 'plan')[]
  enableVoiceDictation: boolean
  enableAISuggestions: boolean
}

// Complete charting settings
export interface ChartingSettings {
  // Injection settings
  needleGauges: NeedleGaugeOption[]
  cannulas: CannulaOption[]
  injectionDepths: InjectionDepthPreset[]
  injectionTechniques: InjectionTechniquePreset[]

  // Treatment areas
  treatmentZones: TreatmentZone[]

  // Products & Templates
  productPresets: ProductPreset[]
  treatmentTemplates: TreatmentTemplate[]

  // Provider settings
  providerPreferences: ProviderPreferences[]
  currentProviderId?: string

  // Photo settings
  photoSettings: PhotoSettings

  // SOAP Notes settings
  soapNotesSettings: SOAPNotesSettings

  // Tool visibility settings
  toolVisibility: ToolVisibilitySettings

  // General settings
  showAnatomicalNames: boolean
  showRecommendedUnits: boolean
  enableInventoryTracking: boolean
  requireLotNumbers: boolean
  requireSignOff: boolean
  defaultChartView: 'face' | 'body' | 'photos' | 'soap-notes'
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_NEEDLE_GAUGES: NeedleGaugeOption[] = [
  { id: 'ng-18', gauge: '18G', diameter: '1.27mm', length: '38mm', color: '#FF6B6B', recommendedFor: ['Drawing up product'], isDefault: false, isActive: true },
  { id: 'ng-22', gauge: '22G', diameter: '0.72mm', length: '32mm', color: '#4ECDC4', recommendedFor: ['Deep fillers', 'Cannula entry'], isDefault: false, isActive: true },
  { id: 'ng-25', gauge: '25G', diameter: '0.51mm', length: '25mm', color: '#45B7D1', recommendedFor: ['Fillers', 'Voluma', 'Cheeks'], isDefault: false, isActive: true },
  { id: 'ng-27', gauge: '27G', diameter: '0.41mm', length: '19mm', color: '#96CEB4', recommendedFor: ['Fillers', 'Lips', 'Tear trough'], isDefault: true, isActive: true },
  { id: 'ng-30', gauge: '30G', diameter: '0.30mm', length: '13mm', color: '#FFEAA7', recommendedFor: ['Botox', 'Dysport', 'Fine lines'], isDefault: true, isActive: true },
  { id: 'ng-31', gauge: '31G', diameter: '0.26mm', length: '8mm', color: '#DDA0DD', recommendedFor: ['Superficial injections', 'Skin boosters'], isDefault: false, isActive: true },
  { id: 'ng-32', gauge: '32G', diameter: '0.24mm', length: '6mm', color: '#98D8C8', recommendedFor: ['Mesotherapy', 'PRP'], isDefault: false, isActive: true },
  { id: 'ng-33', gauge: '33G', diameter: '0.20mm', length: '4mm', color: '#F7DC6F', recommendedFor: ['Micro-injections', 'Delicate areas'], isDefault: false, isActive: true },
]

const DEFAULT_CANNULAS: CannulaOption[] = [
  { id: 'cn-22', gauge: '22G', length: '50mm', flexibility: 'semi-flexible', recommendedFor: ['Cheeks', 'Jawline', 'Large areas'], isDefault: false, isActive: true },
  { id: 'cn-25', gauge: '25G', length: '38mm', flexibility: 'flexible', recommendedFor: ['Lips', 'Tear trough', 'Nasolabial'], isDefault: true, isActive: true },
  { id: 'cn-27', gauge: '27G', length: '25mm', flexibility: 'flexible', recommendedFor: ['Fine lines', 'Delicate areas'], isDefault: false, isActive: true },
]

const DEFAULT_INJECTION_DEPTHS: InjectionDepthPreset[] = [
  { id: 'depth-superficial', name: 'Superficial/Intradermal', depth: 'superficial', depthMm: '0.5-1mm', description: 'Papillary dermis - for skin boosters and fine lines', recommendedFor: ['Skin boosters', 'Mesotherapy', 'Fine lines'], color: '#FFF3CD', isActive: true },
  { id: 'depth-mid', name: 'Mid-Dermis', depth: 'mid-dermis', depthMm: '1-2mm', description: 'Reticular dermis - for moderate corrections', recommendedFor: ['Lip border', 'Tear trough', 'Moderate wrinkles'], color: '#FFE5B4', isActive: true },
  { id: 'depth-deep', name: 'Deep Dermis', depth: 'deep-dermis', depthMm: '2-4mm', description: 'Deep reticular dermis - for deeper folds', recommendedFor: ['Nasolabial folds', 'Marionette lines', 'Deep wrinkles'], color: '#FFCCCB', isActive: true },
  { id: 'depth-subq', name: 'Subcutaneous', depth: 'subcutaneous', depthMm: '4-8mm', description: 'Fat layer - for volume restoration', recommendedFor: ['Cheek augmentation', 'Temple hollows', 'Volume loss'], color: '#E6E6FA', isActive: true },
  { id: 'depth-supra', name: 'Supraperiosteal', depth: 'supraperiosteal', depthMm: '8-12mm', description: 'Just above periosteum - for structural support', recommendedFor: ['Chin projection', 'Jawline', 'Cheekbones'], color: '#D8BFD8', isActive: true },
  { id: 'depth-peri', name: 'Periosteal', depth: 'periosteal', depthMm: '10-15mm', description: 'On the bone - for maximum structural support', recommendedFor: ['Chin augmentation', 'Jaw angle', 'Malar augmentation'], color: '#B0C4DE', isActive: true },
  { id: 'depth-im', name: 'Intramuscular', depth: 'intramuscular', depthMm: 'Variable', description: 'Into muscle belly - for neurotoxins', recommendedFor: ['Botox', 'Dysport', 'Xeomin', 'Muscle relaxation'], color: '#ADD8E6', isActive: true },
]

const DEFAULT_INJECTION_TECHNIQUES: InjectionTechniquePreset[] = [
  { id: 'tech-serial', name: 'Serial Puncture', technique: 'serial-puncture', description: 'Multiple small injections along a line', recommendedFor: ['Lip border', 'Fine lines', 'Wrinkles'], isActive: true },
  { id: 'tech-linear', name: 'Linear Threading', technique: 'linear-threading', description: 'Continuous deposit while withdrawing needle', recommendedFor: ['Nasolabial folds', 'Marionette lines', 'Linear defects'], isActive: true },
  { id: 'tech-fan', name: 'Fanning', technique: 'fanning', description: 'Multiple threads from single entry point', recommendedFor: ['Cheeks', 'Temples', 'Large areas'], isActive: true },
  { id: 'tech-cross', name: 'Cross-Hatching', technique: 'cross-hatching', description: 'Crisscross pattern for even distribution', recommendedFor: ['Cheeks', 'Chin', 'Areas needing volume'], isActive: true },
  { id: 'tech-bolus', name: 'Bolus/Depot', technique: 'bolus', description: 'Single large deposit at one point', recommendedFor: ['Deep structural support', 'Chin', 'Cheekbones'], isActive: true },
  { id: 'tech-micro', name: 'Micro-droplet', technique: 'micro-droplet', description: 'Tiny superficial deposits', recommendedFor: ['Skin quality', 'Fine lines', 'Skin boosters'], isActive: true },
  { id: 'tech-blanch', name: 'Blanching Technique', technique: 'blanching', description: 'Inject until skin blanches then stop', recommendedFor: ['Superficial wrinkles', 'Lip lines'], isActive: true },
]

const DEFAULT_TREATMENT_ZONES: TreatmentZone[] = [
  // Upper Face
  { id: 'zone-forehead', name: 'Forehead', anatomicalName: 'Frontalis', category: 'face', subCategory: 'upper-face', defaultUnits: 20, defaultDepth: 'depth-im', defaultTechnique: 'tech-serial', defaultNeedleGauge: 'ng-30', coordinates: { x: 50, y: 15 }, isActive: true, isCustom: false },
  { id: 'zone-glabella', name: 'Glabella (11s)', anatomicalName: 'Procerus/Corrugator', category: 'face', subCategory: 'upper-face', defaultUnits: 20, defaultDepth: 'depth-im', defaultTechnique: 'tech-serial', defaultNeedleGauge: 'ng-30', coordinates: { x: 50, y: 22 }, isActive: true, isCustom: false },
  { id: 'zone-brow-l', name: 'Brow Lift Left', anatomicalName: 'Lateral Orbicularis', category: 'face', subCategory: 'upper-face', defaultUnits: 4, defaultDepth: 'depth-im', defaultTechnique: 'tech-serial', defaultNeedleGauge: 'ng-30', coordinates: { x: 35, y: 25 }, isActive: true, isCustom: false },
  { id: 'zone-brow-r', name: 'Brow Lift Right', anatomicalName: 'Lateral Orbicularis', category: 'face', subCategory: 'upper-face', defaultUnits: 4, defaultDepth: 'depth-im', defaultTechnique: 'tech-serial', defaultNeedleGauge: 'ng-30', coordinates: { x: 65, y: 25 }, isActive: true, isCustom: false },

  // Periorbital
  { id: 'zone-crows-l', name: "Crow's Feet Left", anatomicalName: 'Lateral Orbicularis Oculi', category: 'face', subCategory: 'periorbital', defaultUnits: 12, defaultDepth: 'depth-im', defaultTechnique: 'tech-serial', defaultNeedleGauge: 'ng-30', coordinates: { x: 28, y: 30 }, isActive: true, isCustom: false },
  { id: 'zone-crows-r', name: "Crow's Feet Right", anatomicalName: 'Lateral Orbicularis Oculi', category: 'face', subCategory: 'periorbital', defaultUnits: 12, defaultDepth: 'depth-im', defaultTechnique: 'tech-serial', defaultNeedleGauge: 'ng-30', coordinates: { x: 72, y: 30 }, isActive: true, isCustom: false },
  { id: 'zone-tear-l', name: 'Tear Trough Left', anatomicalName: 'Infraorbital Hollow', category: 'face', subCategory: 'periorbital', defaultVolume: 0.3, defaultDepth: 'depth-supra', defaultTechnique: 'tech-linear', defaultNeedleGauge: 'ng-27', coordinates: { x: 40, y: 35 }, isActive: true, isCustom: false },
  { id: 'zone-tear-r', name: 'Tear Trough Right', anatomicalName: 'Infraorbital Hollow', category: 'face', subCategory: 'periorbital', defaultVolume: 0.3, defaultDepth: 'depth-supra', defaultTechnique: 'tech-linear', defaultNeedleGauge: 'ng-27', coordinates: { x: 60, y: 35 }, isActive: true, isCustom: false },

  // Mid Face
  { id: 'zone-cheek-l', name: 'Cheek Left', anatomicalName: 'Malar/Zygomatic', category: 'face', subCategory: 'mid-face', defaultVolume: 1.0, defaultDepth: 'depth-supra', defaultTechnique: 'tech-bolus', defaultNeedleGauge: 'ng-25', coordinates: { x: 30, y: 42 }, isActive: true, isCustom: false },
  { id: 'zone-cheek-r', name: 'Cheek Right', anatomicalName: 'Malar/Zygomatic', category: 'face', subCategory: 'mid-face', defaultVolume: 1.0, defaultDepth: 'depth-supra', defaultTechnique: 'tech-bolus', defaultNeedleGauge: 'ng-25', coordinates: { x: 70, y: 42 }, isActive: true, isCustom: false },
  { id: 'zone-naso-l', name: 'Nasolabial Fold Left', anatomicalName: 'Nasolabial Crease', category: 'face', subCategory: 'mid-face', defaultVolume: 0.5, defaultDepth: 'depth-deep', defaultTechnique: 'tech-linear', defaultNeedleGauge: 'ng-27', coordinates: { x: 38, y: 52 }, isActive: true, isCustom: false },
  { id: 'zone-naso-r', name: 'Nasolabial Fold Right', anatomicalName: 'Nasolabial Crease', category: 'face', subCategory: 'mid-face', defaultVolume: 0.5, defaultDepth: 'depth-deep', defaultTechnique: 'tech-linear', defaultNeedleGauge: 'ng-27', coordinates: { x: 62, y: 52 }, isActive: true, isCustom: false },
  { id: 'zone-nose', name: 'Nose (Non-surgical)', anatomicalName: 'Nasal Dorsum', category: 'face', subCategory: 'mid-face', defaultVolume: 0.3, defaultDepth: 'depth-supra', defaultTechnique: 'tech-linear', defaultNeedleGauge: 'ng-27', coordinates: { x: 50, y: 42 }, isActive: true, isCustom: false },

  // Lower Face
  { id: 'zone-lip-upper', name: 'Upper Lip', anatomicalName: 'Vermillion/Cupid\'s Bow', category: 'face', subCategory: 'lower-face', defaultVolume: 0.5, defaultDepth: 'depth-mid', defaultTechnique: 'tech-serial', defaultNeedleGauge: 'ng-27', coordinates: { x: 50, y: 58 }, isActive: true, isCustom: false },
  { id: 'zone-lip-lower', name: 'Lower Lip', anatomicalName: 'Vermillion', category: 'face', subCategory: 'lower-face', defaultVolume: 0.5, defaultDepth: 'depth-mid', defaultTechnique: 'tech-serial', defaultNeedleGauge: 'ng-27', coordinates: { x: 50, y: 62 }, isActive: true, isCustom: false },
  { id: 'zone-marionette-l', name: 'Marionette Left', anatomicalName: 'Oral Commissure', category: 'face', subCategory: 'lower-face', defaultVolume: 0.5, defaultDepth: 'depth-deep', defaultTechnique: 'tech-linear', defaultNeedleGauge: 'ng-27', coordinates: { x: 40, y: 65 }, isActive: true, isCustom: false },
  { id: 'zone-marionette-r', name: 'Marionette Right', anatomicalName: 'Oral Commissure', category: 'face', subCategory: 'lower-face', defaultVolume: 0.5, defaultDepth: 'depth-deep', defaultTechnique: 'tech-linear', defaultNeedleGauge: 'ng-27', coordinates: { x: 60, y: 65 }, isActive: true, isCustom: false },
  { id: 'zone-chin', name: 'Chin', anatomicalName: 'Mentalis/Pogonion', category: 'face', subCategory: 'lower-face', defaultVolume: 1.0, defaultDepth: 'depth-peri', defaultTechnique: 'tech-bolus', defaultNeedleGauge: 'ng-25', coordinates: { x: 50, y: 72 }, isActive: true, isCustom: false },
  { id: 'zone-jaw-l', name: 'Jawline Left', anatomicalName: 'Mandibular Angle', category: 'face', subCategory: 'lower-face', defaultVolume: 1.0, defaultDepth: 'depth-supra', defaultTechnique: 'tech-linear', defaultNeedleGauge: 'ng-25', coordinates: { x: 25, y: 60 }, isActive: true, isCustom: false },
  { id: 'zone-jaw-r', name: 'Jawline Right', anatomicalName: 'Mandibular Angle', category: 'face', subCategory: 'lower-face', defaultVolume: 1.0, defaultDepth: 'depth-supra', defaultTechnique: 'tech-linear', defaultNeedleGauge: 'ng-25', coordinates: { x: 75, y: 60 }, isActive: true, isCustom: false },
  { id: 'zone-masseter-l', name: 'Masseter Left', anatomicalName: 'Masseter Muscle', category: 'face', subCategory: 'lower-face', defaultUnits: 25, defaultDepth: 'depth-im', defaultTechnique: 'tech-serial', defaultNeedleGauge: 'ng-30', coordinates: { x: 22, y: 55 }, isActive: true, isCustom: false },
  { id: 'zone-masseter-r', name: 'Masseter Right', anatomicalName: 'Masseter Muscle', category: 'face', subCategory: 'lower-face', defaultUnits: 25, defaultDepth: 'depth-im', defaultTechnique: 'tech-serial', defaultNeedleGauge: 'ng-30', coordinates: { x: 78, y: 55 }, isActive: true, isCustom: false },

  // Neck
  { id: 'zone-platysma', name: 'Platysmal Bands', anatomicalName: 'Platysma Muscle', category: 'neck', defaultUnits: 30, defaultDepth: 'depth-im', defaultTechnique: 'tech-serial', defaultNeedleGauge: 'ng-30', isActive: true, isCustom: false },
  { id: 'zone-nefertiti', name: 'Nefertiti Lift', anatomicalName: 'Platysma/Jawline', category: 'neck', defaultUnits: 20, defaultDepth: 'depth-im', defaultTechnique: 'tech-serial', defaultNeedleGauge: 'ng-30', isActive: true, isCustom: false },
]

const DEFAULT_PRODUCT_PRESETS: ProductPreset[] = [
  { id: 'prod-botox', name: 'Botox Cosmetic', brand: 'Allergan', type: 'neurotoxin', defaultUnits: 50, unitPrice: 14, recommendedDepths: ['depth-im'], recommendedTechniques: ['tech-serial'], recommendedGauges: ['ng-30', 'ng-31'], dilutionRatio: '2.5ml/100u', isActive: true },
  { id: 'prod-dysport', name: 'Dysport', brand: 'Galderma', type: 'neurotoxin', defaultUnits: 150, unitPrice: 4.5, recommendedDepths: ['depth-im'], recommendedTechniques: ['tech-serial'], recommendedGauges: ['ng-30', 'ng-31'], dilutionRatio: '2.5ml/300u', isActive: true },
  { id: 'prod-xeomin', name: 'Xeomin', brand: 'Merz', type: 'neurotoxin', defaultUnits: 50, unitPrice: 12, recommendedDepths: ['depth-im'], recommendedTechniques: ['tech-serial'], recommendedGauges: ['ng-30', 'ng-31'], dilutionRatio: '2.5ml/100u', isActive: true },
  { id: 'prod-juvederm-ultra', name: 'Juvederm Ultra XC', brand: 'Allergan', type: 'filler', defaultVolume: 1.0, unitPrice: 650, recommendedDepths: ['depth-mid', 'depth-deep'], recommendedTechniques: ['tech-serial', 'tech-linear'], recommendedGauges: ['ng-27', 'ng-30'], isActive: true },
  { id: 'prod-juvederm-voluma', name: 'Juvederm Voluma XC', brand: 'Allergan', type: 'filler', defaultVolume: 1.0, unitPrice: 850, recommendedDepths: ['depth-supra', 'depth-peri'], recommendedTechniques: ['tech-bolus', 'tech-fan'], recommendedGauges: ['ng-25', 'ng-27'], isActive: true },
  { id: 'prod-restylane', name: 'Restylane', brand: 'Galderma', type: 'filler', defaultVolume: 1.0, unitPrice: 600, recommendedDepths: ['depth-mid', 'depth-deep'], recommendedTechniques: ['tech-serial', 'tech-linear'], recommendedGauges: ['ng-27', 'ng-30'], isActive: true },
  { id: 'prod-restylane-lyft', name: 'Restylane Lyft', brand: 'Galderma', type: 'filler', defaultVolume: 1.0, unitPrice: 750, recommendedDepths: ['depth-supra', 'depth-subq'], recommendedTechniques: ['tech-bolus', 'tech-fan'], recommendedGauges: ['ng-25', 'ng-27'], isActive: true },
  { id: 'prod-radiesse', name: 'Radiesse', brand: 'Merz', type: 'biostimulator', defaultVolume: 1.5, unitPrice: 700, recommendedDepths: ['depth-supra', 'depth-subq'], recommendedTechniques: ['tech-fan', 'tech-cross'], recommendedGauges: ['ng-25', 'ng-27'], isActive: true },
  { id: 'prod-sculptra', name: 'Sculptra Aesthetic', brand: 'Galderma', type: 'biostimulator', defaultVolume: 1.0, unitPrice: 950, recommendedDepths: ['depth-subq', 'depth-supra'], recommendedTechniques: ['tech-fan', 'tech-cross'], recommendedGauges: ['ng-25', 'ng-22'], isActive: true },
  { id: 'prod-skinvive', name: 'SkinVive', brand: 'Allergan', type: 'skin-booster', defaultVolume: 1.0, unitPrice: 550, recommendedDepths: ['depth-superficial', 'depth-mid'], recommendedTechniques: ['tech-micro', 'tech-serial'], recommendedGauges: ['ng-30', 'ng-31', 'ng-32'], isActive: true },
]

const DEFAULT_TREATMENT_TEMPLATES: TreatmentTemplate[] = [
  {
    id: 'tmpl-full-face-tox',
    name: 'Full Face Neurotoxin',
    description: 'Standard full face Botox/Dysport treatment',
    category: 'neurotoxin',
    zones: [
      { zoneId: 'zone-forehead', units: 20, depth: 'depth-im', technique: 'tech-serial', needleGauge: 'ng-30' },
      { zoneId: 'zone-glabella', units: 20, depth: 'depth-im', technique: 'tech-serial', needleGauge: 'ng-30' },
      { zoneId: 'zone-crows-l', units: 12, depth: 'depth-im', technique: 'tech-serial', needleGauge: 'ng-30' },
      { zoneId: 'zone-crows-r', units: 12, depth: 'depth-im', technique: 'tech-serial', needleGauge: 'ng-30' },
    ],
    products: ['prod-botox'],
    estimatedTime: 15,
    isDefault: true,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'tmpl-lip-filler',
    name: 'Lip Augmentation',
    description: 'Standard lip filler treatment',
    category: 'filler',
    zones: [
      { zoneId: 'zone-lip-upper', volume: 0.5, depth: 'depth-mid', technique: 'tech-serial', needleGauge: 'ng-27' },
      { zoneId: 'zone-lip-lower', volume: 0.5, depth: 'depth-mid', technique: 'tech-serial', needleGauge: 'ng-27' },
    ],
    products: ['prod-juvederm-ultra'],
    estimatedTime: 30,
    isDefault: true,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'tmpl-cheek-augmentation',
    name: 'Cheek Augmentation',
    description: 'Volumizing cheeks with filler',
    category: 'filler',
    zones: [
      { zoneId: 'zone-cheek-l', volume: 1.0, depth: 'depth-supra', technique: 'tech-bolus', needleGauge: 'ng-25' },
      { zoneId: 'zone-cheek-r', volume: 1.0, depth: 'depth-supra', technique: 'tech-bolus', needleGauge: 'ng-25' },
    ],
    products: ['prod-juvederm-voluma'],
    estimatedTime: 30,
    isDefault: true,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'tmpl-jawline',
    name: 'Jawline Contouring',
    description: 'Define and sculpt the jawline',
    category: 'filler',
    zones: [
      { zoneId: 'zone-jaw-l', volume: 1.0, depth: 'depth-supra', technique: 'tech-linear', needleGauge: 'ng-25' },
      { zoneId: 'zone-jaw-r', volume: 1.0, depth: 'depth-supra', technique: 'tech-linear', needleGauge: 'ng-25' },
      { zoneId: 'zone-chin', volume: 1.0, depth: 'depth-peri', technique: 'tech-bolus', needleGauge: 'ng-25' },
    ],
    products: ['prod-juvederm-voluma', 'prod-restylane-lyft'],
    estimatedTime: 45,
    isDefault: true,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'tmpl-masseter-slim',
    name: 'Masseter Slimming',
    description: 'Jaw slimming with neurotoxin',
    category: 'neurotoxin',
    zones: [
      { zoneId: 'zone-masseter-l', units: 25, depth: 'depth-im', technique: 'tech-serial', needleGauge: 'ng-30' },
      { zoneId: 'zone-masseter-r', units: 25, depth: 'depth-im', technique: 'tech-serial', needleGauge: 'ng-30' },
    ],
    products: ['prod-botox'],
    estimatedTime: 15,
    isDefault: true,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'tmpl-baby-botox',
    name: 'Baby Botox',
    description: 'Light preventative neurotoxin treatment',
    category: 'neurotoxin',
    zones: [
      { zoneId: 'zone-forehead', units: 10, depth: 'depth-im', technique: 'tech-serial', needleGauge: 'ng-30' },
      { zoneId: 'zone-glabella', units: 15, depth: 'depth-im', technique: 'tech-serial', needleGauge: 'ng-30' },
    ],
    products: ['prod-botox'],
    estimatedTime: 10,
    isDefault: true,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'tmpl-lip-flip',
    name: 'Lip Flip',
    description: 'Upper lip flip with neurotoxin',
    category: 'neurotoxin',
    zones: [
      { zoneId: 'zone-lip-upper', units: 4, depth: 'depth-im', technique: 'tech-micro', needleGauge: 'ng-30' },
    ],
    products: ['prod-botox'],
    estimatedTime: 5,
    isDefault: true,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: 'tmpl-crows-only',
    name: "Crow's Feet Only",
    description: "Just crow's feet treatment",
    category: 'neurotoxin',
    zones: [
      { zoneId: 'zone-crows-l', units: 12, depth: 'depth-im', technique: 'tech-serial', needleGauge: 'ng-30' },
      { zoneId: 'zone-crows-r', units: 12, depth: 'depth-im', technique: 'tech-serial', needleGauge: 'ng-30' },
    ],
    products: ['prod-botox'],
    estimatedTime: 10,
    isDefault: true,
    isActive: true,
    createdAt: new Date(),
  },
]

const DEFAULT_PHOTO_SETTINGS: PhotoSettings = {
  requireConsent: true,
  defaultAngles: ['front', 'left', 'right', '45-left', '45-right'],
  watermarkEnabled: false,
  watermarkText: '',
  autoBackup: true,
  compressionQuality: 'high',
  standardizedLighting: true,
}

const DEFAULT_SOAP_SETTINGS: SOAPNotesSettings = {
  autoSave: true,
  autoSaveInterval: 30,
  defaultTemplates: {
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  },
  requiredFields: ['subjective', 'objective', 'assessment', 'plan'],
  enableVoiceDictation: false,
  enableAISuggestions: false,
}

// Default tool visibility - ALL TOOLS ENABLED for demo purposes
const DEFAULT_TOOL_VISIBILITY: ToolVisibilitySettings = {
  // Advanced drawing tools - ALL ON for demo
  brushTool: true,
  arrowTool: true,
  textLabels: true,
  shapeTool: true,
  measurementTool: true,
  cannulaPathTool: true,
  veinDrawingTool: true,
  dangerZoneOverlay: true,

  // UI Settings - advanced panels enabled for demo
  showCalibrationControls: true,
  showAdvancedPanels: true,
  compactMode: false,
}

const DEFAULT_SETTINGS: ChartingSettings = {
  needleGauges: DEFAULT_NEEDLE_GAUGES,
  cannulas: DEFAULT_CANNULAS,
  injectionDepths: DEFAULT_INJECTION_DEPTHS,
  injectionTechniques: DEFAULT_INJECTION_TECHNIQUES,
  treatmentZones: DEFAULT_TREATMENT_ZONES,
  productPresets: DEFAULT_PRODUCT_PRESETS,
  treatmentTemplates: DEFAULT_TREATMENT_TEMPLATES,
  providerPreferences: [],
  photoSettings: DEFAULT_PHOTO_SETTINGS,
  soapNotesSettings: DEFAULT_SOAP_SETTINGS,
  toolVisibility: DEFAULT_TOOL_VISIBILITY,
  showAnatomicalNames: true,
  showRecommendedUnits: true,
  enableInventoryTracking: true,
  requireLotNumbers: true,
  requireSignOff: false,
  defaultChartView: 'face',
}

// ============================================================================
// CONTEXT
// ============================================================================

interface ChartingSettingsContextType {
  settings: ChartingSettings
  isLoading: boolean

  // Settings management
  updateSettings: (updates: Partial<ChartingSettings>) => void
  resetToDefaults: () => void

  // Needle gauges
  addNeedleGauge: (gauge: Omit<NeedleGaugeOption, 'id'>) => void
  updateNeedleGauge: (id: string, updates: Partial<NeedleGaugeOption>) => void
  removeNeedleGauge: (id: string) => void

  // Cannulas
  addCannula: (cannula: Omit<CannulaOption, 'id'>) => void
  updateCannula: (id: string, updates: Partial<CannulaOption>) => void
  removeCannula: (id: string) => void

  // Injection depths
  addInjectionDepth: (depth: Omit<InjectionDepthPreset, 'id'>) => void
  updateInjectionDepth: (id: string, updates: Partial<InjectionDepthPreset>) => void
  removeInjectionDepth: (id: string) => void

  // Injection techniques
  addInjectionTechnique: (technique: Omit<InjectionTechniquePreset, 'id'>) => void
  updateInjectionTechnique: (id: string, updates: Partial<InjectionTechniquePreset>) => void
  removeInjectionTechnique: (id: string) => void

  // Treatment zones
  addTreatmentZone: (zone: Omit<TreatmentZone, 'id'>) => void
  updateTreatmentZone: (id: string, updates: Partial<TreatmentZone>) => void
  removeTreatmentZone: (id: string) => void

  // Product presets
  addProductPreset: (product: Omit<ProductPreset, 'id'>) => void
  updateProductPreset: (id: string, updates: Partial<ProductPreset>) => void
  removeProductPreset: (id: string) => void

  // Treatment templates
  addTreatmentTemplate: (template: Omit<TreatmentTemplate, 'id' | 'createdAt'>) => void
  updateTreatmentTemplate: (id: string, updates: Partial<TreatmentTemplate>) => void
  removeTreatmentTemplate: (id: string) => void

  // Provider preferences
  setProviderPreferences: (preferences: ProviderPreferences) => void

  // Helper functions
  getActiveNeedleGauges: () => NeedleGaugeOption[]
  getActiveCannulas: () => CannulaOption[]
  getActiveDepths: () => InjectionDepthPreset[]
  getActiveTechniques: () => InjectionTechniquePreset[]
  getActiveZones: (category?: string) => TreatmentZone[]
  getActiveProducts: (type?: string) => ProductPreset[]
  getActiveTemplates: (category?: string) => TreatmentTemplate[]
  getZoneById: (id: string) => TreatmentZone | undefined
  getProductById: (id: string) => ProductPreset | undefined
  getDepthById: (id: string) => InjectionDepthPreset | undefined
  getTechniqueById: (id: string) => InjectionTechniquePreset | undefined
  getNeedleGaugeById: (id: string) => NeedleGaugeOption | undefined
}

const ChartingSettingsContext = createContext<ChartingSettingsContextType | undefined>(undefined)

// ============================================================================
// PROVIDER
// ============================================================================

const STORAGE_KEY = 'chartingSettings'

export function ChartingSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ChartingSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with defaults to ensure new fields are included
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      }
    } catch (error) {
      console.error('Error loading charting settings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
        // Dispatch event for other components to listen
        window.dispatchEvent(new CustomEvent('chartingSettingsUpdated', { detail: settings }))
      } catch (error) {
        console.error('Error saving charting settings:', error)
      }
    }
  }, [settings, isLoading])

  // Generate unique ID
  const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Settings management
  const updateSettings = useCallback((updates: Partial<ChartingSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  // Needle gauges
  const addNeedleGauge = useCallback((gauge: Omit<NeedleGaugeOption, 'id'>) => {
    const newGauge = { ...gauge, id: generateId('ng') }
    setSettings(prev => ({
      ...prev,
      needleGauges: [...prev.needleGauges, newGauge]
    }))
  }, [])

  const updateNeedleGauge = useCallback((id: string, updates: Partial<NeedleGaugeOption>) => {
    setSettings(prev => ({
      ...prev,
      needleGauges: prev.needleGauges.map(g => g.id === id ? { ...g, ...updates } : g)
    }))
  }, [])

  const removeNeedleGauge = useCallback((id: string) => {
    setSettings(prev => ({
      ...prev,
      needleGauges: prev.needleGauges.filter(g => g.id !== id)
    }))
  }, [])

  // Cannulas
  const addCannula = useCallback((cannula: Omit<CannulaOption, 'id'>) => {
    const newCannula = { ...cannula, id: generateId('cn') }
    setSettings(prev => ({
      ...prev,
      cannulas: [...prev.cannulas, newCannula]
    }))
  }, [])

  const updateCannula = useCallback((id: string, updates: Partial<CannulaOption>) => {
    setSettings(prev => ({
      ...prev,
      cannulas: prev.cannulas.map(c => c.id === id ? { ...c, ...updates } : c)
    }))
  }, [])

  const removeCannula = useCallback((id: string) => {
    setSettings(prev => ({
      ...prev,
      cannulas: prev.cannulas.filter(c => c.id !== id)
    }))
  }, [])

  // Injection depths
  const addInjectionDepth = useCallback((depth: Omit<InjectionDepthPreset, 'id'>) => {
    const newDepth = { ...depth, id: generateId('depth') }
    setSettings(prev => ({
      ...prev,
      injectionDepths: [...prev.injectionDepths, newDepth]
    }))
  }, [])

  const updateInjectionDepth = useCallback((id: string, updates: Partial<InjectionDepthPreset>) => {
    setSettings(prev => ({
      ...prev,
      injectionDepths: prev.injectionDepths.map(d => d.id === id ? { ...d, ...updates } : d)
    }))
  }, [])

  const removeInjectionDepth = useCallback((id: string) => {
    setSettings(prev => ({
      ...prev,
      injectionDepths: prev.injectionDepths.filter(d => d.id !== id)
    }))
  }, [])

  // Injection techniques
  const addInjectionTechnique = useCallback((technique: Omit<InjectionTechniquePreset, 'id'>) => {
    const newTechnique = { ...technique, id: generateId('tech') }
    setSettings(prev => ({
      ...prev,
      injectionTechniques: [...prev.injectionTechniques, newTechnique]
    }))
  }, [])

  const updateInjectionTechnique = useCallback((id: string, updates: Partial<InjectionTechniquePreset>) => {
    setSettings(prev => ({
      ...prev,
      injectionTechniques: prev.injectionTechniques.map(t => t.id === id ? { ...t, ...updates } : t)
    }))
  }, [])

  const removeInjectionTechnique = useCallback((id: string) => {
    setSettings(prev => ({
      ...prev,
      injectionTechniques: prev.injectionTechniques.filter(t => t.id !== id)
    }))
  }, [])

  // Treatment zones
  const addTreatmentZone = useCallback((zone: Omit<TreatmentZone, 'id'>) => {
    const newZone = { ...zone, id: generateId('zone'), isCustom: true }
    setSettings(prev => ({
      ...prev,
      treatmentZones: [...prev.treatmentZones, newZone]
    }))
  }, [])

  const updateTreatmentZone = useCallback((id: string, updates: Partial<TreatmentZone>) => {
    setSettings(prev => ({
      ...prev,
      treatmentZones: prev.treatmentZones.map(z => z.id === id ? { ...z, ...updates } : z)
    }))
  }, [])

  const removeTreatmentZone = useCallback((id: string) => {
    setSettings(prev => ({
      ...prev,
      treatmentZones: prev.treatmentZones.filter(z => z.id !== id)
    }))
  }, [])

  // Product presets
  const addProductPreset = useCallback((product: Omit<ProductPreset, 'id'>) => {
    const newProduct = { ...product, id: generateId('prod') }
    setSettings(prev => ({
      ...prev,
      productPresets: [...prev.productPresets, newProduct]
    }))
  }, [])

  const updateProductPreset = useCallback((id: string, updates: Partial<ProductPreset>) => {
    setSettings(prev => ({
      ...prev,
      productPresets: prev.productPresets.map(p => p.id === id ? { ...p, ...updates } : p)
    }))
  }, [])

  const removeProductPreset = useCallback((id: string) => {
    setSettings(prev => ({
      ...prev,
      productPresets: prev.productPresets.filter(p => p.id !== id)
    }))
  }, [])

  // Treatment templates
  const addTreatmentTemplate = useCallback((template: Omit<TreatmentTemplate, 'id' | 'createdAt'>) => {
    const newTemplate = { ...template, id: generateId('tmpl'), createdAt: new Date() }
    setSettings(prev => ({
      ...prev,
      treatmentTemplates: [...prev.treatmentTemplates, newTemplate]
    }))
  }, [])

  const updateTreatmentTemplate = useCallback((id: string, updates: Partial<TreatmentTemplate>) => {
    setSettings(prev => ({
      ...prev,
      treatmentTemplates: prev.treatmentTemplates.map(t => t.id === id ? { ...t, ...updates } : t)
    }))
  }, [])

  const removeTreatmentTemplate = useCallback((id: string) => {
    setSettings(prev => ({
      ...prev,
      treatmentTemplates: prev.treatmentTemplates.filter(t => t.id !== id)
    }))
  }, [])

  // Provider preferences
  const setProviderPreferences = useCallback((preferences: ProviderPreferences) => {
    setSettings(prev => {
      const existing = prev.providerPreferences.findIndex(p => p.providerId === preferences.providerId)
      if (existing >= 0) {
        const updated = [...prev.providerPreferences]
        updated[existing] = preferences
        return { ...prev, providerPreferences: updated }
      }
      return { ...prev, providerPreferences: [...prev.providerPreferences, preferences] }
    })
  }, [])

  // Helper functions
  const getActiveNeedleGauges = useCallback(() => {
    return settings.needleGauges.filter(g => g.isActive)
  }, [settings.needleGauges])

  const getActiveCannulas = useCallback(() => {
    return settings.cannulas.filter(c => c.isActive)
  }, [settings.cannulas])

  const getActiveDepths = useCallback(() => {
    return settings.injectionDepths.filter(d => d.isActive)
  }, [settings.injectionDepths])

  const getActiveTechniques = useCallback(() => {
    return settings.injectionTechniques.filter(t => t.isActive)
  }, [settings.injectionTechniques])

  const getActiveZones = useCallback((category?: string) => {
    return settings.treatmentZones.filter(z => z.isActive && (!category || z.category === category))
  }, [settings.treatmentZones])

  const getActiveProducts = useCallback((type?: string) => {
    return settings.productPresets.filter(p => p.isActive && (!type || p.type === type))
  }, [settings.productPresets])

  const getActiveTemplates = useCallback((category?: string) => {
    return settings.treatmentTemplates.filter(t => t.isActive && (!category || t.category === category))
  }, [settings.treatmentTemplates])

  const getZoneById = useCallback((id: string) => {
    return settings.treatmentZones.find(z => z.id === id)
  }, [settings.treatmentZones])

  const getProductById = useCallback((id: string) => {
    return settings.productPresets.find(p => p.id === id)
  }, [settings.productPresets])

  const getDepthById = useCallback((id: string) => {
    return settings.injectionDepths.find(d => d.id === id)
  }, [settings.injectionDepths])

  const getTechniqueById = useCallback((id: string) => {
    return settings.injectionTechniques.find(t => t.id === id)
  }, [settings.injectionTechniques])

  const getNeedleGaugeById = useCallback((id: string) => {
    return settings.needleGauges.find(g => g.id === id)
  }, [settings.needleGauges])

  // Memoize the context value to prevent unnecessary re-renders of consuming components
  // This ensures children only re-render when settings or callbacks actually change
  const value = useMemo<ChartingSettingsContextType>(() => ({
    settings,
    isLoading,
    updateSettings,
    resetToDefaults,
    addNeedleGauge,
    updateNeedleGauge,
    removeNeedleGauge,
    addCannula,
    updateCannula,
    removeCannula,
    addInjectionDepth,
    updateInjectionDepth,
    removeInjectionDepth,
    addInjectionTechnique,
    updateInjectionTechnique,
    removeInjectionTechnique,
    addTreatmentZone,
    updateTreatmentZone,
    removeTreatmentZone,
    addProductPreset,
    updateProductPreset,
    removeProductPreset,
    addTreatmentTemplate,
    updateTreatmentTemplate,
    removeTreatmentTemplate,
    setProviderPreferences,
    getActiveNeedleGauges,
    getActiveCannulas,
    getActiveDepths,
    getActiveTechniques,
    getActiveZones,
    getActiveProducts,
    getActiveTemplates,
    getZoneById,
    getProductById,
    getDepthById,
    getTechniqueById,
    getNeedleGaugeById,
  }), [
    settings,
    isLoading,
    updateSettings,
    resetToDefaults,
    addNeedleGauge,
    updateNeedleGauge,
    removeNeedleGauge,
    addCannula,
    updateCannula,
    removeCannula,
    addInjectionDepth,
    updateInjectionDepth,
    removeInjectionDepth,
    addInjectionTechnique,
    updateInjectionTechnique,
    removeInjectionTechnique,
    addTreatmentZone,
    updateTreatmentZone,
    removeTreatmentZone,
    addProductPreset,
    updateProductPreset,
    removeProductPreset,
    addTreatmentTemplate,
    updateTreatmentTemplate,
    removeTreatmentTemplate,
    setProviderPreferences,
    getActiveNeedleGauges,
    getActiveCannulas,
    getActiveDepths,
    getActiveTechniques,
    getActiveZones,
    getActiveProducts,
    getActiveTemplates,
    getZoneById,
    getProductById,
    getDepthById,
    getTechniqueById,
    getNeedleGaugeById,
  ])

  return (
    <ChartingSettingsContext.Provider value={value}>
      {children}
    </ChartingSettingsContext.Provider>
  )
}

// ============================================================================
// HOOK
// ============================================================================

export function useChartingSettings() {
  const context = useContext(ChartingSettingsContext)
  if (context === undefined) {
    throw new Error('useChartingSettings must be used within a ChartingSettingsProvider')
  }
  return context
}

// Export defaults for reference
export { DEFAULT_SETTINGS, DEFAULT_NEEDLE_GAUGES, DEFAULT_CANNULAS, DEFAULT_INJECTION_DEPTHS, DEFAULT_INJECTION_TECHNIQUES, DEFAULT_TREATMENT_ZONES, DEFAULT_PRODUCT_PRESETS, DEFAULT_TREATMENT_TEMPLATES, DEFAULT_TOOL_VISIBILITY }
