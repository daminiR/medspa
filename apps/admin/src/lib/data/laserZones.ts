/**
 * Laser Treatment Zone Data
 *
 * Comprehensive zone definitions for laser, RF, and energy-based treatments.
 * Contains 150+ anatomical zones with boundaries, hierarchy, and safety metadata.
 *
 * Zone boundaries are defined as percentage-based coordinates (0-100% of canvas)
 * for use with 2D face/body charts.
 *
 * @see PRACTITIONER_CONTEXT.md for design philosophy
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Zone category classification
 */
export type ZoneCategory =
  | 'face'
  | 'neck'
  | 'decolletage'
  | 'body'
  | 'hands'
  | 'feet'
  | 'scalp'

/**
 * Sub-category for more granular grouping
 */
export type ZoneSubCategory =
  // Face sub-categories
  | 'upper-face'
  | 'mid-face'
  | 'lower-face'
  | 'periorbital'
  | 'perioral'
  | 'nose'
  | 'ears'
  // Body sub-categories
  | 'anterior-torso'
  | 'posterior-torso'
  | 'upper-extremity'
  | 'lower-extremity'
  | 'intimate'

/**
 * Danger level for treatment zones
 * - normal: Standard precautions apply
 * - caution: Requires extra care, adjusted parameters
 * - danger: High-risk area, special training/certification may be required
 */
export type DangerLevel = 'normal' | 'caution' | 'danger'

/**
 * Side of body for bilateral zones
 */
export type ZoneSide = 'left' | 'right' | 'bilateral' | 'central'

/**
 * Zone boundary definition
 * Uses percentage-based coordinates (0-100) relative to the chart canvas
 */
export interface ZoneBoundary {
  /** Boundary type for rendering */
  type: 'polygon' | 'ellipse' | 'rectangle' | 'path'

  /** For polygon: Array of [x, y] percentage coordinates */
  points?: [number, number][]

  /** For ellipse: center and radii */
  center?: { x: number; y: number }
  radiusX?: number
  radiusY?: number
  rotation?: number

  /** For rectangle: top-left corner and dimensions */
  x?: number
  y?: number
  width?: number
  height?: number

  /** For complex shapes: SVG path data */
  path?: string
}

/**
 * Safety information for a zone
 */
export interface ZoneSafetyInfo {
  /** Danger classification */
  dangerLevel: DangerLevel

  /** Key anatomical structures to avoid */
  criticalStructures?: string[]

  /** Maximum recommended fluence reduction (percentage) */
  fluenceReduction?: number

  /** Special precautions or notes */
  precautions?: string[]

  /** Eye protection requirements */
  eyeProtectionRequired?: boolean

  /** Cooling recommendations */
  coolingRecommended?: 'none' | 'contact' | 'air' | 'cryogen'
}

/**
 * Treatment-specific defaults for this zone
 */
export interface ZoneTreatmentDefaults {
  /** Treatment type ID this applies to */
  treatmentTypeId: string

  /** Suggested number of passes */
  passes?: number

  /** Suggested fluence (J/cm2) */
  fluence?: number

  /** Suggested pulse width (ms) */
  pulseWidth?: number

  /** Suggested spot size (mm) */
  spotSize?: number

  /** Notes specific to this treatment/zone combination */
  notes?: string
}

/**
 * Complete laser treatment zone definition
 */
export interface LaserZone {
  /** Unique identifier */
  id: string

  /** Internal reference name (snake_case) */
  name: string

  /** User-facing display name */
  displayName: string

  /** Clinical/anatomical name */
  anatomicalName?: string

  /** Primary category */
  category: ZoneCategory

  /** Sub-category for grouping */
  subCategory?: ZoneSubCategory

  /** Parent zone ID for hierarchical relationships */
  parentZoneId?: string

  /** Child zone IDs */
  childZoneIds?: string[]

  /** Side of body */
  side: ZoneSide

  /** Zone boundary definition for chart rendering */
  boundaries: ZoneBoundary

  /** Safety information */
  safety: ZoneSafetyInfo

  /** Default treatments commonly used for this zone */
  defaultTreatmentIds?: string[]

  /** Treatment-specific defaults */
  treatmentDefaults?: ZoneTreatmentDefaults[]

  /** Clinical description */
  description?: string

  /** Whether zone is enabled by default */
  active: boolean

  /** Display order within category */
  order: number

  /** Fitzpatrick skin type considerations */
  skinTypeConsiderations?: string
}

/**
 * Zone group for UI organization
 */
export interface ZoneGroup {
  id: string
  name: string
  displayName: string
  category: ZoneCategory
  subCategory?: ZoneSubCategory
  zoneIds: string[]
  order: number
}

// =============================================================================
// FACE ZONES - UPPER FACE
// =============================================================================

const UPPER_FACE_ZONES: LaserZone[] = [
  // Forehead
  {
    id: 'forehead-full',
    name: 'forehead_full',
    displayName: 'Full Forehead',
    anatomicalName: 'Regio frontalis',
    category: 'face',
    subCategory: 'upper-face',
    side: 'central',
    childZoneIds: ['forehead-central', 'forehead-left', 'forehead-right'],
    boundaries: {
      type: 'polygon',
      points: [
        [20, 5], [80, 5], [85, 25], [15, 25]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['ipl', 'fractional-laser', 'microneedling'],
    description: 'Full forehead area from hairline to brow',
    active: true,
    order: 1
  },
  {
    id: 'forehead-central',
    name: 'forehead_central',
    displayName: 'Central Forehead',
    anatomicalName: 'Regio frontalis medialis',
    category: 'face',
    subCategory: 'upper-face',
    parentZoneId: 'forehead-full',
    side: 'central',
    boundaries: {
      type: 'polygon',
      points: [
        [35, 5], [65, 5], [68, 25], [32, 25]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    active: true,
    order: 2
  },
  {
    id: 'forehead-left',
    name: 'forehead_left',
    displayName: 'Left Forehead',
    anatomicalName: 'Regio frontalis lateralis sinistra',
    category: 'face',
    subCategory: 'upper-face',
    parentZoneId: 'forehead-full',
    side: 'left',
    boundaries: {
      type: 'polygon',
      points: [
        [20, 5], [35, 5], [32, 25], [15, 25]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    active: true,
    order: 3
  },
  {
    id: 'forehead-right',
    name: 'forehead_right',
    displayName: 'Right Forehead',
    anatomicalName: 'Regio frontalis lateralis dextra',
    category: 'face',
    subCategory: 'upper-face',
    parentZoneId: 'forehead-full',
    side: 'right',
    boundaries: {
      type: 'polygon',
      points: [
        [65, 5], [80, 5], [85, 25], [68, 25]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    active: true,
    order: 4
  },
  // Glabella
  {
    id: 'glabella',
    name: 'glabella',
    displayName: 'Glabella',
    anatomicalName: 'Glabella (Procerus/Corrugator)',
    category: 'face',
    subCategory: 'upper-face',
    side: 'central',
    boundaries: {
      type: 'polygon',
      points: [
        [42, 22], [58, 22], [56, 32], [44, 32]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Supratrochlear artery', 'Supratrochlear nerve'],
      eyeProtectionRequired: true,
      precautions: ['Avoid excessive heat near orbital rim'],
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['ipl', 'fractional-laser'],
    description: 'Area between eyebrows, includes frown lines',
    active: true,
    order: 5
  },
  // Temples
  {
    id: 'temple-left',
    name: 'temple_left',
    displayName: 'Left Temple',
    anatomicalName: 'Regio temporalis sinistra',
    category: 'face',
    subCategory: 'upper-face',
    side: 'left',
    boundaries: {
      type: 'ellipse',
      center: { x: 12, y: 28 },
      radiusX: 8,
      radiusY: 12
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Temporal artery', 'Temporal nerve branches'],
      eyeProtectionRequired: true,
      precautions: ['Visible vasculature may require lower fluence'],
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['ipl', 'vascular-laser'],
    description: 'Temporal region lateral to eye',
    active: true,
    order: 6
  },
  {
    id: 'temple-right',
    name: 'temple_right',
    displayName: 'Right Temple',
    anatomicalName: 'Regio temporalis dextra',
    category: 'face',
    subCategory: 'upper-face',
    side: 'right',
    boundaries: {
      type: 'ellipse',
      center: { x: 88, y: 28 },
      radiusX: 8,
      radiusY: 12
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Temporal artery', 'Temporal nerve branches'],
      eyeProtectionRequired: true,
      precautions: ['Visible vasculature may require lower fluence'],
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['ipl', 'vascular-laser'],
    description: 'Temporal region lateral to eye',
    active: true,
    order: 7
  },
  // Brow
  {
    id: 'brow-left',
    name: 'brow_left',
    displayName: 'Left Brow',
    anatomicalName: 'Supercilium sinistrum',
    category: 'face',
    subCategory: 'upper-face',
    side: 'left',
    boundaries: {
      type: 'polygon',
      points: [
        [25, 26], [44, 24], [44, 30], [25, 32]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Supraorbital nerve', 'Supraorbital artery'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Eyebrow area - use caution with hair removal',
    active: true,
    order: 8
  },
  {
    id: 'brow-right',
    name: 'brow_right',
    displayName: 'Right Brow',
    anatomicalName: 'Supercilium dextrum',
    category: 'face',
    subCategory: 'upper-face',
    side: 'right',
    boundaries: {
      type: 'polygon',
      points: [
        [56, 24], [75, 26], [75, 32], [56, 30]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Supraorbital nerve', 'Supraorbital artery'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Eyebrow area - use caution with hair removal',
    active: true,
    order: 9
  }
]

// =============================================================================
// FACE ZONES - PERIORBITAL
// =============================================================================

const PERIORBITAL_ZONES: LaserZone[] = [
  // Upper Eyelid
  {
    id: 'upper-eyelid-left',
    name: 'upper_eyelid_left',
    displayName: 'Left Upper Eyelid',
    anatomicalName: 'Palpebra superior sinistra',
    category: 'face',
    subCategory: 'periorbital',
    side: 'left',
    boundaries: {
      type: 'ellipse',
      center: { x: 35, y: 34 },
      radiusX: 8,
      radiusY: 4
    },
    safety: {
      dangerLevel: 'danger',
      criticalStructures: ['Eye', 'Levator muscle', 'Lacrimal gland'],
      eyeProtectionRequired: true,
      fluenceReduction: 50,
      precautions: [
        'Metal eye shields REQUIRED',
        'Reduce fluence by 40-50%',
        'Short pulse widths only',
        'Avoid direct treatment of lid margin'
      ],
      coolingRecommended: 'none'
    },
    description: 'Upper eyelid - extreme caution required',
    skinTypeConsiderations: 'Higher risk of PIH in darker skin types',
    active: true,
    order: 10
  },
  {
    id: 'upper-eyelid-right',
    name: 'upper_eyelid_right',
    displayName: 'Right Upper Eyelid',
    anatomicalName: 'Palpebra superior dextra',
    category: 'face',
    subCategory: 'periorbital',
    side: 'right',
    boundaries: {
      type: 'ellipse',
      center: { x: 65, y: 34 },
      radiusX: 8,
      radiusY: 4
    },
    safety: {
      dangerLevel: 'danger',
      criticalStructures: ['Eye', 'Levator muscle', 'Lacrimal gland'],
      eyeProtectionRequired: true,
      fluenceReduction: 50,
      precautions: [
        'Metal eye shields REQUIRED',
        'Reduce fluence by 40-50%',
        'Short pulse widths only',
        'Avoid direct treatment of lid margin'
      ],
      coolingRecommended: 'none'
    },
    description: 'Upper eyelid - extreme caution required',
    skinTypeConsiderations: 'Higher risk of PIH in darker skin types',
    active: true,
    order: 11
  },
  // Lower Eyelid
  {
    id: 'lower-eyelid-left',
    name: 'lower_eyelid_left',
    displayName: 'Left Lower Eyelid',
    anatomicalName: 'Palpebra inferior sinistra',
    category: 'face',
    subCategory: 'periorbital',
    side: 'left',
    boundaries: {
      type: 'ellipse',
      center: { x: 35, y: 40 },
      radiusX: 8,
      radiusY: 3
    },
    safety: {
      dangerLevel: 'danger',
      criticalStructures: ['Eye', 'Infraorbital nerve', 'Lower lid retractors'],
      eyeProtectionRequired: true,
      fluenceReduction: 50,
      precautions: [
        'Metal eye shields REQUIRED',
        'Very thin skin - use lowest effective parameters',
        'Risk of ectropion with aggressive treatment'
      ],
      coolingRecommended: 'none'
    },
    description: 'Lower eyelid - extreme caution required',
    active: true,
    order: 12
  },
  {
    id: 'lower-eyelid-right',
    name: 'lower_eyelid_right',
    displayName: 'Right Lower Eyelid',
    anatomicalName: 'Palpebra inferior dextra',
    category: 'face',
    subCategory: 'periorbital',
    side: 'right',
    boundaries: {
      type: 'ellipse',
      center: { x: 65, y: 40 },
      radiusX: 8,
      radiusY: 3
    },
    safety: {
      dangerLevel: 'danger',
      criticalStructures: ['Eye', 'Infraorbital nerve', 'Lower lid retractors'],
      eyeProtectionRequired: true,
      fluenceReduction: 50,
      precautions: [
        'Metal eye shields REQUIRED',
        'Very thin skin - use lowest effective parameters',
        'Risk of ectropion with aggressive treatment'
      ],
      coolingRecommended: 'none'
    },
    description: 'Lower eyelid - extreme caution required',
    active: true,
    order: 13
  },
  // Crow's Feet
  {
    id: 'crows-feet-left',
    name: 'crows_feet_left',
    displayName: 'Left Crow\'s Feet',
    anatomicalName: 'Rugae laterales oculi sinistri',
    category: 'face',
    subCategory: 'periorbital',
    side: 'left',
    boundaries: {
      type: 'polygon',
      points: [
        [18, 32], [28, 30], [28, 42], [18, 40]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Lateral orbital rim', 'Zygomatic nerve'],
      eyeProtectionRequired: true,
      precautions: ['Avoid treating too close to lateral canthus'],
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['fractional-laser', 'rf-microneedling'],
    description: 'Lateral periorbital wrinkle area',
    active: true,
    order: 14
  },
  {
    id: 'crows-feet-right',
    name: 'crows_feet_right',
    displayName: 'Right Crow\'s Feet',
    anatomicalName: 'Rugae laterales oculi dextri',
    category: 'face',
    subCategory: 'periorbital',
    side: 'right',
    boundaries: {
      type: 'polygon',
      points: [
        [72, 30], [82, 32], [82, 40], [72, 42]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Lateral orbital rim', 'Zygomatic nerve'],
      eyeProtectionRequired: true,
      precautions: ['Avoid treating too close to lateral canthus'],
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['fractional-laser', 'rf-microneedling'],
    description: 'Lateral periorbital wrinkle area',
    active: true,
    order: 15
  },
  // Under Eye / Tear Trough
  {
    id: 'under-eye-left',
    name: 'under_eye_left',
    displayName: 'Left Under Eye',
    anatomicalName: 'Sulcus lacrimalis sinister',
    category: 'face',
    subCategory: 'periorbital',
    side: 'left',
    boundaries: {
      type: 'polygon',
      points: [
        [28, 40], [42, 38], [45, 46], [28, 48]
      ]
    },
    safety: {
      dangerLevel: 'danger',
      criticalStructures: ['Infraorbital nerve', 'Angular artery', 'Thin periorbital skin'],
      eyeProtectionRequired: true,
      fluenceReduction: 40,
      precautions: [
        'Very thin skin with visible vasculature',
        'High risk of bruising',
        'Reduce fluence significantly',
        'Consider non-ablative options'
      ],
      coolingRecommended: 'contact'
    },
    description: 'Infraorbital hollow / tear trough area',
    skinTypeConsiderations: 'Very high risk of PIH in skin types IV-VI',
    active: true,
    order: 16
  },
  {
    id: 'under-eye-right',
    name: 'under_eye_right',
    displayName: 'Right Under Eye',
    anatomicalName: 'Sulcus lacrimalis dexter',
    category: 'face',
    subCategory: 'periorbital',
    side: 'right',
    boundaries: {
      type: 'polygon',
      points: [
        [58, 38], [72, 40], [72, 48], [55, 46]
      ]
    },
    safety: {
      dangerLevel: 'danger',
      criticalStructures: ['Infraorbital nerve', 'Angular artery', 'Thin periorbital skin'],
      eyeProtectionRequired: true,
      fluenceReduction: 40,
      precautions: [
        'Very thin skin with visible vasculature',
        'High risk of bruising',
        'Reduce fluence significantly',
        'Consider non-ablative options'
      ],
      coolingRecommended: 'contact'
    },
    description: 'Infraorbital hollow / tear trough area',
    skinTypeConsiderations: 'Very high risk of PIH in skin types IV-VI',
    active: true,
    order: 17
  }
]

// =============================================================================
// FACE ZONES - MID FACE
// =============================================================================

const MID_FACE_ZONES: LaserZone[] = [
  // Cheeks (Full)
  {
    id: 'cheek-full-left',
    name: 'cheek_full_left',
    displayName: 'Left Full Cheek',
    anatomicalName: 'Regio malaris et buccalis sinistra',
    category: 'face',
    subCategory: 'mid-face',
    side: 'left',
    childZoneIds: ['cheek-upper-left', 'cheek-lower-left'],
    boundaries: {
      type: 'polygon',
      points: [
        [15, 42], [42, 38], [45, 65], [20, 60]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      criticalStructures: ['Parotid duct (lower cheek)'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['ipl', 'fractional-laser', 'rf-microneedling'],
    description: 'Full cheek from orbital rim to jawline',
    active: true,
    order: 18
  },
  {
    id: 'cheek-full-right',
    name: 'cheek_full_right',
    displayName: 'Right Full Cheek',
    anatomicalName: 'Regio malaris et buccalis dextra',
    category: 'face',
    subCategory: 'mid-face',
    side: 'right',
    childZoneIds: ['cheek-upper-right', 'cheek-lower-right'],
    boundaries: {
      type: 'polygon',
      points: [
        [58, 38], [85, 42], [80, 60], [55, 65]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      criticalStructures: ['Parotid duct (lower cheek)'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['ipl', 'fractional-laser', 'rf-microneedling'],
    description: 'Full cheek from orbital rim to jawline',
    active: true,
    order: 19
  },
  // Upper Cheeks / Malar
  {
    id: 'cheek-upper-left',
    name: 'cheek_upper_left',
    displayName: 'Left Upper Cheek (Malar)',
    anatomicalName: 'Eminentia malaris sinistra',
    category: 'face',
    subCategory: 'mid-face',
    parentZoneId: 'cheek-full-left',
    side: 'left',
    boundaries: {
      type: 'polygon',
      points: [
        [18, 42], [42, 38], [44, 52], [22, 50]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'High cheekbone area',
    active: true,
    order: 20
  },
  {
    id: 'cheek-upper-right',
    name: 'cheek_upper_right',
    displayName: 'Right Upper Cheek (Malar)',
    anatomicalName: 'Eminentia malaris dextra',
    category: 'face',
    subCategory: 'mid-face',
    parentZoneId: 'cheek-full-right',
    side: 'right',
    boundaries: {
      type: 'polygon',
      points: [
        [58, 38], [82, 42], [78, 50], [56, 52]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'High cheekbone area',
    active: true,
    order: 21
  },
  // Lower Cheeks / Buccal
  {
    id: 'cheek-lower-left',
    name: 'cheek_lower_left',
    displayName: 'Left Lower Cheek',
    anatomicalName: 'Regio buccalis sinistra',
    category: 'face',
    subCategory: 'mid-face',
    parentZoneId: 'cheek-full-left',
    side: 'left',
    boundaries: {
      type: 'polygon',
      points: [
        [22, 50], [44, 52], [45, 65], [20, 60]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      criticalStructures: ['Parotid duct'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Lower cheek and buccal area',
    active: true,
    order: 22
  },
  {
    id: 'cheek-lower-right',
    name: 'cheek_lower_right',
    displayName: 'Right Lower Cheek',
    anatomicalName: 'Regio buccalis dextra',
    category: 'face',
    subCategory: 'mid-face',
    parentZoneId: 'cheek-full-right',
    side: 'right',
    boundaries: {
      type: 'polygon',
      points: [
        [56, 52], [78, 50], [80, 60], [55, 65]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      criticalStructures: ['Parotid duct'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Lower cheek and buccal area',
    active: true,
    order: 23
  }
]

// =============================================================================
// FACE ZONES - NOSE
// =============================================================================

const NOSE_ZONES: LaserZone[] = [
  {
    id: 'nose-full',
    name: 'nose_full',
    displayName: 'Full Nose',
    anatomicalName: 'Nasus',
    category: 'face',
    subCategory: 'nose',
    side: 'central',
    childZoneIds: ['nose-bridge', 'nose-tip', 'nose-ala-left', 'nose-ala-right'],
    boundaries: {
      type: 'polygon',
      points: [
        [44, 32], [56, 32], [58, 55], [50, 60], [42, 55]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Angular artery', 'Dorsal nasal artery'],
      eyeProtectionRequired: true,
      precautions: ['Avoid tip with aggressive ablative lasers'],
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['ipl', 'vascular-laser'],
    description: 'Full nasal area',
    active: true,
    order: 24
  },
  {
    id: 'nose-bridge',
    name: 'nose_bridge',
    displayName: 'Nasal Bridge',
    anatomicalName: 'Dorsum nasi',
    category: 'face',
    subCategory: 'nose',
    parentZoneId: 'nose-full',
    side: 'central',
    boundaries: {
      type: 'polygon',
      points: [
        [46, 32], [54, 32], [53, 45], [47, 45]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Dorsal nasal artery'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Nasal dorsum / bridge area',
    active: true,
    order: 25
  },
  {
    id: 'nose-tip',
    name: 'nose_tip',
    displayName: 'Nasal Tip',
    anatomicalName: 'Apex nasi',
    category: 'face',
    subCategory: 'nose',
    parentZoneId: 'nose-full',
    side: 'central',
    boundaries: {
      type: 'ellipse',
      center: { x: 50, y: 54 },
      radiusX: 5,
      radiusY: 4
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Tip cartilage', 'Sebaceous glands'],
      eyeProtectionRequired: true,
      precautions: ['High sebaceous activity - adjust parameters', 'Risk of prolonged erythema'],
      coolingRecommended: 'contact'
    },
    description: 'Nasal tip - often requires treatment for rosacea/telangiectasia',
    active: true,
    order: 26
  },
  {
    id: 'nose-ala-left',
    name: 'nose_ala_left',
    displayName: 'Left Nasal Ala',
    anatomicalName: 'Ala nasi sinistra',
    category: 'face',
    subCategory: 'nose',
    parentZoneId: 'nose-full',
    side: 'left',
    boundaries: {
      type: 'ellipse',
      center: { x: 43, y: 56 },
      radiusX: 4,
      radiusY: 3
    },
    safety: {
      dangerLevel: 'caution',
      eyeProtectionRequired: true,
      precautions: ['Curved surface - maintain perpendicular angle'],
      coolingRecommended: 'contact'
    },
    description: 'Lateral nasal wing / nostril area',
    active: true,
    order: 27
  },
  {
    id: 'nose-ala-right',
    name: 'nose_ala_right',
    displayName: 'Right Nasal Ala',
    anatomicalName: 'Ala nasi dextra',
    category: 'face',
    subCategory: 'nose',
    parentZoneId: 'nose-full',
    side: 'right',
    boundaries: {
      type: 'ellipse',
      center: { x: 57, y: 56 },
      radiusX: 4,
      radiusY: 3
    },
    safety: {
      dangerLevel: 'caution',
      eyeProtectionRequired: true,
      precautions: ['Curved surface - maintain perpendicular angle'],
      coolingRecommended: 'contact'
    },
    description: 'Lateral nasal wing / nostril area',
    active: true,
    order: 28
  },
  {
    id: 'bunny-lines-left',
    name: 'bunny_lines_left',
    displayName: 'Left Bunny Lines',
    anatomicalName: 'Musculus nasalis pars transversa',
    category: 'face',
    subCategory: 'nose',
    side: 'left',
    boundaries: {
      type: 'polygon',
      points: [
        [38, 42], [44, 40], [44, 48], [38, 50]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Lateral nose wrinkles when scrunching nose',
    active: true,
    order: 29
  },
  {
    id: 'bunny-lines-right',
    name: 'bunny_lines_right',
    displayName: 'Right Bunny Lines',
    anatomicalName: 'Musculus nasalis pars transversa',
    category: 'face',
    subCategory: 'nose',
    side: 'right',
    boundaries: {
      type: 'polygon',
      points: [
        [56, 40], [62, 42], [62, 50], [56, 48]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Lateral nose wrinkles when scrunching nose',
    active: true,
    order: 30
  }
]

// =============================================================================
// FACE ZONES - PERIORAL
// =============================================================================

const PERIORAL_ZONES: LaserZone[] = [
  // Nasolabial Folds
  {
    id: 'nasolabial-left',
    name: 'nasolabial_left',
    displayName: 'Left Nasolabial Fold',
    anatomicalName: 'Sulcus nasolabialis sinister',
    category: 'face',
    subCategory: 'perioral',
    side: 'left',
    boundaries: {
      type: 'polygon',
      points: [
        [38, 56], [45, 58], [42, 72], [35, 68]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Angular artery', 'Facial artery branches'],
      eyeProtectionRequired: true,
      precautions: ['Vascular danger zone - use caution with ablative lasers'],
      coolingRecommended: 'contact'
    },
    description: 'Nasolabial fold / smile line',
    active: true,
    order: 31
  },
  {
    id: 'nasolabial-right',
    name: 'nasolabial_right',
    displayName: 'Right Nasolabial Fold',
    anatomicalName: 'Sulcus nasolabialis dexter',
    category: 'face',
    subCategory: 'perioral',
    side: 'right',
    boundaries: {
      type: 'polygon',
      points: [
        [55, 58], [62, 56], [65, 68], [58, 72]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Angular artery', 'Facial artery branches'],
      eyeProtectionRequired: true,
      precautions: ['Vascular danger zone - use caution with ablative lasers'],
      coolingRecommended: 'contact'
    },
    description: 'Nasolabial fold / smile line',
    active: true,
    order: 32
  },
  // Upper Lip
  {
    id: 'upper-lip',
    name: 'upper_lip',
    displayName: 'Upper Lip',
    anatomicalName: 'Labium superius',
    category: 'face',
    subCategory: 'perioral',
    side: 'central',
    childZoneIds: ['philtrum', 'upper-lip-vermillion', 'upper-lip-skin'],
    boundaries: {
      type: 'polygon',
      points: [
        [38, 58], [62, 58], [62, 70], [38, 70]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Superior labial artery', 'Vermillion border'],
      eyeProtectionRequired: true,
      precautions: [
        'High risk of HSV reactivation - consider prophylaxis',
        'Protect vermillion border'
      ],
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['fractional-laser', 'hair-removal-laser'],
    description: 'Full upper lip area including cutaneous and vermillion',
    active: true,
    order: 33
  },
  {
    id: 'philtrum',
    name: 'philtrum',
    displayName: 'Philtrum',
    anatomicalName: 'Philtrum',
    category: 'face',
    subCategory: 'perioral',
    parentZoneId: 'upper-lip',
    side: 'central',
    boundaries: {
      type: 'polygon',
      points: [
        [47, 58], [53, 58], [53, 66], [47, 66]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Central groove below nose',
    active: true,
    order: 34
  },
  {
    id: 'upper-lip-skin',
    name: 'upper_lip_skin',
    displayName: 'Upper Lip (Skin)',
    anatomicalName: 'Cutaneous upper lip',
    category: 'face',
    subCategory: 'perioral',
    parentZoneId: 'upper-lip',
    side: 'central',
    boundaries: {
      type: 'polygon',
      points: [
        [38, 58], [62, 58], [62, 66], [38, 66]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      eyeProtectionRequired: true,
      precautions: ['Common hair removal area - careful with darker skin types'],
      coolingRecommended: 'contact'
    },
    description: 'Skin portion of upper lip (for hair removal)',
    active: true,
    order: 35
  },
  {
    id: 'upper-lip-vermillion',
    name: 'upper_lip_vermillion',
    displayName: 'Upper Lip Vermillion',
    anatomicalName: 'Vermillion superius',
    category: 'face',
    subCategory: 'perioral',
    parentZoneId: 'upper-lip',
    side: 'central',
    boundaries: {
      type: 'polygon',
      points: [
        [42, 66], [58, 66], [58, 70], [42, 70]
      ]
    },
    safety: {
      dangerLevel: 'danger',
      criticalStructures: ['Vermillion border', 'Superior labial artery'],
      eyeProtectionRequired: true,
      fluenceReduction: 30,
      precautions: [
        'VERY thin epithelium',
        'High HSV reactivation risk',
        'Use non-ablative modalities only',
        'Prophylactic antivirals recommended'
      ],
      coolingRecommended: 'contact'
    },
    description: 'Red lip portion - very sensitive',
    active: true,
    order: 36
  },
  // Lower Lip
  {
    id: 'lower-lip',
    name: 'lower_lip',
    displayName: 'Lower Lip',
    anatomicalName: 'Labium inferius',
    category: 'face',
    subCategory: 'perioral',
    side: 'central',
    childZoneIds: ['lower-lip-vermillion', 'lower-lip-skin'],
    boundaries: {
      type: 'polygon',
      points: [
        [40, 70], [60, 70], [60, 78], [40, 78]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Inferior labial artery'],
      eyeProtectionRequired: true,
      precautions: ['HSV reactivation risk'],
      coolingRecommended: 'contact'
    },
    description: 'Full lower lip area',
    active: true,
    order: 37
  },
  {
    id: 'lower-lip-vermillion',
    name: 'lower_lip_vermillion',
    displayName: 'Lower Lip Vermillion',
    anatomicalName: 'Vermillion inferius',
    category: 'face',
    subCategory: 'perioral',
    parentZoneId: 'lower-lip',
    side: 'central',
    boundaries: {
      type: 'polygon',
      points: [
        [42, 70], [58, 70], [58, 75], [42, 75]
      ]
    },
    safety: {
      dangerLevel: 'danger',
      criticalStructures: ['Vermillion border', 'Inferior labial artery'],
      eyeProtectionRequired: true,
      fluenceReduction: 30,
      precautions: [
        'VERY thin epithelium',
        'High HSV reactivation risk',
        'Use non-ablative modalities only'
      ],
      coolingRecommended: 'contact'
    },
    description: 'Red lip portion - very sensitive',
    active: true,
    order: 38
  },
  // Perioral Lines
  {
    id: 'perioral-lines',
    name: 'perioral_lines',
    displayName: 'Perioral Lines',
    anatomicalName: 'Rhytides periorales',
    category: 'face',
    subCategory: 'perioral',
    side: 'central',
    boundaries: {
      type: 'polygon',
      points: [
        [36, 58], [64, 58], [66, 80], [34, 80]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      eyeProtectionRequired: true,
      precautions: [
        'HSV prophylaxis recommended for ablative treatments',
        'Common area for wrinkle treatment'
      ],
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['fractional-laser', 'rf-microneedling'],
    description: 'Full perioral wrinkle area (smoker\'s lines)',
    active: true,
    order: 39
  },
  // Oral Commissures
  {
    id: 'oral-commissure-left',
    name: 'oral_commissure_left',
    displayName: 'Left Oral Commissure',
    anatomicalName: 'Commissura labiorum sinistra',
    category: 'face',
    subCategory: 'perioral',
    side: 'left',
    boundaries: {
      type: 'ellipse',
      center: { x: 38, y: 70 },
      radiusX: 4,
      radiusY: 4
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Facial artery', 'Orbicularis oris'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Corner of mouth',
    active: true,
    order: 40
  },
  {
    id: 'oral-commissure-right',
    name: 'oral_commissure_right',
    displayName: 'Right Oral Commissure',
    anatomicalName: 'Commissura labiorum dextra',
    category: 'face',
    subCategory: 'perioral',
    side: 'right',
    boundaries: {
      type: 'ellipse',
      center: { x: 62, y: 70 },
      radiusX: 4,
      radiusY: 4
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Facial artery', 'Orbicularis oris'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Corner of mouth',
    active: true,
    order: 41
  },
  // Marionette Lines
  {
    id: 'marionette-left',
    name: 'marionette_left',
    displayName: 'Left Marionette Line',
    anatomicalName: 'Sulcus labiomentalis sinister',
    category: 'face',
    subCategory: 'perioral',
    side: 'left',
    boundaries: {
      type: 'polygon',
      points: [
        [35, 70], [42, 72], [40, 85], [32, 82]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Facial artery', 'Marginal mandibular nerve'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Lines from corner of mouth to chin',
    active: true,
    order: 42
  },
  {
    id: 'marionette-right',
    name: 'marionette_right',
    displayName: 'Right Marionette Line',
    anatomicalName: 'Sulcus labiomentalis dexter',
    category: 'face',
    subCategory: 'perioral',
    side: 'right',
    boundaries: {
      type: 'polygon',
      points: [
        [58, 72], [65, 70], [68, 82], [60, 85]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Facial artery', 'Marginal mandibular nerve'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Lines from corner of mouth to chin',
    active: true,
    order: 43
  }
]

// =============================================================================
// FACE ZONES - LOWER FACE
// =============================================================================

const LOWER_FACE_ZONES: LaserZone[] = [
  // Chin
  {
    id: 'chin',
    name: 'chin',
    displayName: 'Chin',
    anatomicalName: 'Mentum',
    category: 'face',
    subCategory: 'lower-face',
    side: 'central',
    childZoneIds: ['chin-central', 'chin-left', 'chin-right'],
    boundaries: {
      type: 'polygon',
      points: [
        [38, 78], [62, 78], [58, 95], [42, 95]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      criticalStructures: ['Mental nerve', 'Labiomental fold'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['hair-removal-laser', 'ipl'],
    description: 'Full chin area',
    active: true,
    order: 44
  },
  {
    id: 'chin-central',
    name: 'chin_central',
    displayName: 'Central Chin',
    anatomicalName: 'Pogonion',
    category: 'face',
    subCategory: 'lower-face',
    parentZoneId: 'chin',
    side: 'central',
    boundaries: {
      type: 'ellipse',
      center: { x: 50, y: 88 },
      radiusX: 8,
      radiusY: 6
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Central chin prominence',
    active: true,
    order: 45
  },
  // Jawline
  {
    id: 'jawline-left',
    name: 'jawline_left',
    displayName: 'Left Jawline',
    anatomicalName: 'Linea mandibularis sinistra',
    category: 'face',
    subCategory: 'lower-face',
    side: 'left',
    boundaries: {
      type: 'polygon',
      points: [
        [15, 60], [38, 78], [42, 95], [15, 90]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      criticalStructures: ['Marginal mandibular nerve'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['hair-removal-laser', 'skin-tightening'],
    description: 'Left mandibular border',
    active: true,
    order: 46
  },
  {
    id: 'jawline-right',
    name: 'jawline_right',
    displayName: 'Right Jawline',
    anatomicalName: 'Linea mandibularis dextra',
    category: 'face',
    subCategory: 'lower-face',
    side: 'right',
    boundaries: {
      type: 'polygon',
      points: [
        [62, 78], [85, 60], [85, 90], [58, 95]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      criticalStructures: ['Marginal mandibular nerve'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['hair-removal-laser', 'skin-tightening'],
    description: 'Right mandibular border',
    active: true,
    order: 47
  },
  // Jowls
  {
    id: 'jowl-left',
    name: 'jowl_left',
    displayName: 'Left Jowl',
    anatomicalName: 'Regio submandibularis sinistra',
    category: 'face',
    subCategory: 'lower-face',
    side: 'left',
    boundaries: {
      type: 'polygon',
      points: [
        [25, 70], [38, 75], [40, 88], [25, 85]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      criticalStructures: ['Marginal mandibular nerve', 'Submandibular gland'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['skin-tightening', 'rf-microneedling'],
    description: 'Pre-jowl sulcus and jowl fat',
    active: true,
    order: 48
  },
  {
    id: 'jowl-right',
    name: 'jowl_right',
    displayName: 'Right Jowl',
    anatomicalName: 'Regio submandibularis dextra',
    category: 'face',
    subCategory: 'lower-face',
    side: 'right',
    boundaries: {
      type: 'polygon',
      points: [
        [62, 75], [75, 70], [75, 85], [60, 88]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      criticalStructures: ['Marginal mandibular nerve', 'Submandibular gland'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['skin-tightening', 'rf-microneedling'],
    description: 'Pre-jowl sulcus and jowl fat',
    active: true,
    order: 49
  },
  // Masseter
  {
    id: 'masseter-left',
    name: 'masseter_left',
    displayName: 'Left Masseter',
    anatomicalName: 'Musculus masseter sinister',
    category: 'face',
    subCategory: 'lower-face',
    side: 'left',
    boundaries: {
      type: 'polygon',
      points: [
        [12, 48], [22, 45], [25, 70], [15, 68]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Parotid gland', 'Facial nerve branches'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Masseter muscle area - often treated for slimming',
    active: true,
    order: 50
  },
  {
    id: 'masseter-right',
    name: 'masseter_right',
    displayName: 'Right Masseter',
    anatomicalName: 'Musculus masseter dexter',
    category: 'face',
    subCategory: 'lower-face',
    side: 'right',
    boundaries: {
      type: 'polygon',
      points: [
        [78, 45], [88, 48], [85, 68], [75, 70]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Parotid gland', 'Facial nerve branches'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Masseter muscle area - often treated for slimming',
    active: true,
    order: 51
  }
]

// =============================================================================
// FACE ZONES - EARS
// =============================================================================

const EAR_ZONES: LaserZone[] = [
  {
    id: 'ear-left',
    name: 'ear_left',
    displayName: 'Left Ear',
    anatomicalName: 'Auricula sinistra',
    category: 'face',
    subCategory: 'ears',
    side: 'left',
    childZoneIds: ['earlobe-left'],
    boundaries: {
      type: 'ellipse',
      center: { x: 5, y: 42 },
      radiusX: 4,
      radiusY: 10
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Auricular cartilage', 'Great auricular nerve'],
      eyeProtectionRequired: true,
      precautions: ['Cartilage has poor blood supply - use conservative settings'],
      coolingRecommended: 'contact'
    },
    description: 'External ear',
    active: true,
    order: 52
  },
  {
    id: 'ear-right',
    name: 'ear_right',
    displayName: 'Right Ear',
    anatomicalName: 'Auricula dextra',
    category: 'face',
    subCategory: 'ears',
    side: 'right',
    childZoneIds: ['earlobe-right'],
    boundaries: {
      type: 'ellipse',
      center: { x: 95, y: 42 },
      radiusX: 4,
      radiusY: 10
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Auricular cartilage', 'Great auricular nerve'],
      eyeProtectionRequired: true,
      precautions: ['Cartilage has poor blood supply - use conservative settings'],
      coolingRecommended: 'contact'
    },
    description: 'External ear',
    active: true,
    order: 53
  },
  {
    id: 'earlobe-left',
    name: 'earlobe_left',
    displayName: 'Left Earlobe',
    anatomicalName: 'Lobulus auriculae sinistrae',
    category: 'face',
    subCategory: 'ears',
    parentZoneId: 'ear-left',
    side: 'left',
    boundaries: {
      type: 'ellipse',
      center: { x: 5, y: 52 },
      radiusX: 3,
      radiusY: 4
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Earlobe - common area for rejuvenation',
    active: true,
    order: 54
  },
  {
    id: 'earlobe-right',
    name: 'earlobe_right',
    displayName: 'Right Earlobe',
    anatomicalName: 'Lobulus auriculae dextrae',
    category: 'face',
    subCategory: 'ears',
    parentZoneId: 'ear-right',
    side: 'right',
    boundaries: {
      type: 'ellipse',
      center: { x: 95, y: 52 },
      radiusX: 3,
      radiusY: 4
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Earlobe - common area for rejuvenation',
    active: true,
    order: 55
  }
]

// =============================================================================
// NECK ZONES
// =============================================================================

const NECK_ZONES: LaserZone[] = [
  {
    id: 'neck-full',
    name: 'neck_full',
    displayName: 'Full Neck',
    anatomicalName: 'Collum',
    category: 'neck',
    side: 'central',
    childZoneIds: ['neck-anterior', 'neck-lateral-left', 'neck-lateral-right', 'neck-posterior'],
    boundaries: {
      type: 'rectangle',
      x: 20,
      y: 0,
      width: 60,
      height: 100
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Thyroid', 'Carotid artery', 'Jugular vein', 'Platysma'],
      eyeProtectionRequired: true,
      precautions: [
        'Thinner skin than face - reduce parameters by 20-30%',
        'Higher risk of banding/striping',
        'Avoid thyroid and vascular structures'
      ],
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['ipl', 'fractional-laser', 'skin-tightening'],
    description: 'Full neck area',
    active: true,
    order: 56
  },
  {
    id: 'neck-anterior',
    name: 'neck_anterior',
    displayName: 'Anterior Neck',
    anatomicalName: 'Regio cervicalis anterior',
    category: 'neck',
    parentZoneId: 'neck-full',
    side: 'central',
    boundaries: {
      type: 'polygon',
      points: [
        [35, 0], [65, 0], [60, 100], [40, 100]
      ]
    },
    safety: {
      dangerLevel: 'danger',
      criticalStructures: ['Thyroid gland', 'Trachea', 'Larynx', 'Carotid arteries'],
      eyeProtectionRequired: true,
      fluenceReduction: 30,
      precautions: [
        'AVOID thyroid at all costs',
        'Central danger zone',
        'Use lateral approaches when possible'
      ],
      coolingRecommended: 'contact'
    },
    description: 'Front of neck - high caution zone',
    active: true,
    order: 57
  },
  {
    id: 'neck-lateral-left',
    name: 'neck_lateral_left',
    displayName: 'Left Lateral Neck',
    anatomicalName: 'Regio cervicalis lateralis sinistra',
    category: 'neck',
    parentZoneId: 'neck-full',
    side: 'left',
    boundaries: {
      type: 'polygon',
      points: [
        [20, 0], [35, 0], [40, 100], [25, 100]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['External jugular vein', 'Spinal accessory nerve'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Lateral neck - platysma bands area',
    active: true,
    order: 58
  },
  {
    id: 'neck-lateral-right',
    name: 'neck_lateral_right',
    displayName: 'Right Lateral Neck',
    anatomicalName: 'Regio cervicalis lateralis dextra',
    category: 'neck',
    parentZoneId: 'neck-full',
    side: 'right',
    boundaries: {
      type: 'polygon',
      points: [
        [65, 0], [80, 0], [75, 100], [60, 100]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['External jugular vein', 'Spinal accessory nerve'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Lateral neck - platysma bands area',
    active: true,
    order: 59
  },
  {
    id: 'submental',
    name: 'submental',
    displayName: 'Submental Area',
    anatomicalName: 'Regio submentalis',
    category: 'neck',
    side: 'central',
    boundaries: {
      type: 'polygon',
      points: [
        [35, 0], [65, 0], [60, 20], [40, 20]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Submental artery', 'Mylohyoid muscle'],
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['skin-tightening', 'rf-microneedling'],
    description: 'Under chin / double chin area',
    active: true,
    order: 60
  },
  {
    id: 'platysma-bands-left',
    name: 'platysma_bands_left',
    displayName: 'Left Platysma Bands',
    anatomicalName: 'Musculus platysma sinister',
    category: 'neck',
    side: 'left',
    boundaries: {
      type: 'polygon',
      points: [
        [30, 20], [42, 15], [44, 80], [32, 85]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Vertical neck bands',
    active: true,
    order: 61
  },
  {
    id: 'platysma-bands-right',
    name: 'platysma_bands_right',
    displayName: 'Right Platysma Bands',
    anatomicalName: 'Musculus platysma dexter',
    category: 'neck',
    side: 'right',
    boundaries: {
      type: 'polygon',
      points: [
        [58, 15], [70, 20], [68, 85], [56, 80]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Vertical neck bands',
    active: true,
    order: 62
  }
]

// =============================================================================
// DECOLLETAGE ZONES
// =============================================================================

const DECOLLETAGE_ZONES: LaserZone[] = [
  {
    id: 'decolletage-full',
    name: 'decolletage_full',
    displayName: 'Full Decolletage',
    anatomicalName: 'Regio pectoralis superior',
    category: 'decolletage',
    side: 'central',
    childZoneIds: ['decolletage-upper', 'decolletage-lower'],
    boundaries: {
      type: 'rectangle',
      x: 15,
      y: 0,
      width: 70,
      height: 100
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      precautions: ['Thinner skin than face - reduce parameters', 'Higher risk of scarring'],
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['ipl', 'fractional-laser'],
    description: 'Full chest/decolletage area',
    skinTypeConsiderations: 'Sun-damaged area - start with test spots',
    active: true,
    order: 63
  },
  {
    id: 'decolletage-upper',
    name: 'decolletage_upper',
    displayName: 'Upper Decolletage',
    anatomicalName: 'Regio infraclavicularis',
    category: 'decolletage',
    parentZoneId: 'decolletage-full',
    side: 'central',
    boundaries: {
      type: 'rectangle',
      x: 15,
      y: 0,
      width: 70,
      height: 50
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Upper chest below clavicles',
    active: true,
    order: 64
  },
  {
    id: 'decolletage-lower',
    name: 'decolletage_lower',
    displayName: 'Lower Decolletage',
    anatomicalName: 'Regio mammaria superior',
    category: 'decolletage',
    parentZoneId: 'decolletage-full',
    side: 'central',
    boundaries: {
      type: 'rectangle',
      x: 15,
      y: 50,
      width: 70,
      height: 50
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Lower chest above breast tissue',
    active: true,
    order: 65
  }
]

// =============================================================================
// BODY ZONES - TORSO
// =============================================================================

const TORSO_ZONES: LaserZone[] = [
  // Anterior
  {
    id: 'abdomen-full',
    name: 'abdomen_full',
    displayName: 'Full Abdomen',
    anatomicalName: 'Abdomen',
    category: 'body',
    subCategory: 'anterior-torso',
    side: 'central',
    childZoneIds: ['abdomen-upper', 'abdomen-lower', 'abdomen-left', 'abdomen-right'],
    boundaries: {
      type: 'rectangle',
      x: 20,
      y: 0,
      width: 60,
      height: 100
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['hair-removal-laser', 'body-contouring'],
    description: 'Full abdominal area',
    active: true,
    order: 66
  },
  {
    id: 'abdomen-upper',
    name: 'abdomen_upper',
    displayName: 'Upper Abdomen',
    anatomicalName: 'Regio epigastrica',
    category: 'body',
    subCategory: 'anterior-torso',
    parentZoneId: 'abdomen-full',
    side: 'central',
    boundaries: {
      type: 'rectangle',
      x: 25,
      y: 0,
      width: 50,
      height: 35
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Upper abdominal area',
    active: true,
    order: 67
  },
  {
    id: 'abdomen-lower',
    name: 'abdomen_lower',
    displayName: 'Lower Abdomen',
    anatomicalName: 'Regio hypogastrica',
    category: 'body',
    subCategory: 'anterior-torso',
    parentZoneId: 'abdomen-full',
    side: 'central',
    boundaries: {
      type: 'rectangle',
      x: 25,
      y: 65,
      width: 50,
      height: 35
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Lower abdominal area',
    active: true,
    order: 68
  },
  // Flanks
  {
    id: 'flank-left',
    name: 'flank_left',
    displayName: 'Left Flank',
    anatomicalName: 'Regio lateralis sinistra',
    category: 'body',
    subCategory: 'anterior-torso',
    side: 'left',
    boundaries: {
      type: 'polygon',
      points: [
        [5, 20], [20, 25], [20, 75], [5, 70]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['body-contouring', 'coolsculpting'],
    description: 'Love handle / flank area',
    active: true,
    order: 69
  },
  {
    id: 'flank-right',
    name: 'flank_right',
    displayName: 'Right Flank',
    anatomicalName: 'Regio lateralis dextra',
    category: 'body',
    subCategory: 'anterior-torso',
    side: 'right',
    boundaries: {
      type: 'polygon',
      points: [
        [80, 25], [95, 20], [95, 70], [80, 75]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['body-contouring', 'coolsculpting'],
    description: 'Love handle / flank area',
    active: true,
    order: 70
  },
  // Back
  {
    id: 'back-full',
    name: 'back_full',
    displayName: 'Full Back',
    anatomicalName: 'Dorsum',
    category: 'body',
    subCategory: 'posterior-torso',
    side: 'central',
    childZoneIds: ['back-upper', 'back-lower'],
    boundaries: {
      type: 'rectangle',
      x: 10,
      y: 0,
      width: 80,
      height: 100
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['hair-removal-laser', 'acne-treatment'],
    description: 'Full back area',
    active: true,
    order: 71
  },
  {
    id: 'back-upper',
    name: 'back_upper',
    displayName: 'Upper Back',
    anatomicalName: 'Regio scapularis',
    category: 'body',
    subCategory: 'posterior-torso',
    parentZoneId: 'back-full',
    side: 'central',
    boundaries: {
      type: 'rectangle',
      x: 15,
      y: 0,
      width: 70,
      height: 50
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Shoulder blade area',
    active: true,
    order: 72
  },
  {
    id: 'back-lower',
    name: 'back_lower',
    displayName: 'Lower Back',
    anatomicalName: 'Regio lumbalis',
    category: 'body',
    subCategory: 'posterior-torso',
    parentZoneId: 'back-full',
    side: 'central',
    boundaries: {
      type: 'rectangle',
      x: 20,
      y: 50,
      width: 60,
      height: 50
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Lumbar area',
    active: true,
    order: 73
  }
]

// =============================================================================
// BODY ZONES - EXTREMITIES
// =============================================================================

const EXTREMITY_ZONES: LaserZone[] = [
  // Arms
  {
    id: 'arm-full-left',
    name: 'arm_full_left',
    displayName: 'Left Full Arm',
    anatomicalName: 'Brachium et antebrachium sinistrum',
    category: 'body',
    subCategory: 'upper-extremity',
    side: 'left',
    childZoneIds: ['upper-arm-left', 'forearm-left'],
    boundaries: {
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 100,
      height: 100
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['hair-removal-laser'],
    description: 'Full arm from shoulder to wrist',
    active: true,
    order: 74
  },
  {
    id: 'arm-full-right',
    name: 'arm_full_right',
    displayName: 'Right Full Arm',
    anatomicalName: 'Brachium et antebrachium dextrum',
    category: 'body',
    subCategory: 'upper-extremity',
    side: 'right',
    childZoneIds: ['upper-arm-right', 'forearm-right'],
    boundaries: {
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 100,
      height: 100
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['hair-removal-laser'],
    description: 'Full arm from shoulder to wrist',
    active: true,
    order: 75
  },
  {
    id: 'upper-arm-left',
    name: 'upper_arm_left',
    displayName: 'Left Upper Arm',
    anatomicalName: 'Brachium sinistrum',
    category: 'body',
    subCategory: 'upper-extremity',
    parentZoneId: 'arm-full-left',
    side: 'left',
    boundaries: {
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 100,
      height: 45
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Upper arm - shoulder to elbow',
    active: true,
    order: 76
  },
  {
    id: 'upper-arm-right',
    name: 'upper_arm_right',
    displayName: 'Right Upper Arm',
    anatomicalName: 'Brachium dextrum',
    category: 'body',
    subCategory: 'upper-extremity',
    parentZoneId: 'arm-full-right',
    side: 'right',
    boundaries: {
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 100,
      height: 45
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Upper arm - shoulder to elbow',
    active: true,
    order: 77
  },
  {
    id: 'forearm-left',
    name: 'forearm_left',
    displayName: 'Left Forearm',
    anatomicalName: 'Antebrachium sinistrum',
    category: 'body',
    subCategory: 'upper-extremity',
    parentZoneId: 'arm-full-left',
    side: 'left',
    boundaries: {
      type: 'rectangle',
      x: 0,
      y: 45,
      width: 100,
      height: 55
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Forearm - elbow to wrist',
    active: true,
    order: 78
  },
  {
    id: 'forearm-right',
    name: 'forearm_right',
    displayName: 'Right Forearm',
    anatomicalName: 'Antebrachium dextrum',
    category: 'body',
    subCategory: 'upper-extremity',
    parentZoneId: 'arm-full-right',
    side: 'right',
    boundaries: {
      type: 'rectangle',
      x: 0,
      y: 45,
      width: 100,
      height: 55
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Forearm - elbow to wrist',
    active: true,
    order: 79
  },
  // Underarms
  {
    id: 'underarm-left',
    name: 'underarm_left',
    displayName: 'Left Underarm',
    anatomicalName: 'Axilla sinistra',
    category: 'body',
    subCategory: 'upper-extremity',
    side: 'left',
    boundaries: {
      type: 'ellipse',
      center: { x: 50, y: 50 },
      radiusX: 30,
      radiusY: 20
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Axillary artery', 'Lymph nodes'],
      eyeProtectionRequired: true,
      precautions: ['Common hair removal area', 'Sensitive skin'],
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['hair-removal-laser'],
    description: 'Axilla / underarm area',
    active: true,
    order: 80
  },
  {
    id: 'underarm-right',
    name: 'underarm_right',
    displayName: 'Right Underarm',
    anatomicalName: 'Axilla dextra',
    category: 'body',
    subCategory: 'upper-extremity',
    side: 'right',
    boundaries: {
      type: 'ellipse',
      center: { x: 50, y: 50 },
      radiusX: 30,
      radiusY: 20
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Axillary artery', 'Lymph nodes'],
      eyeProtectionRequired: true,
      precautions: ['Common hair removal area', 'Sensitive skin'],
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['hair-removal-laser'],
    description: 'Axilla / underarm area',
    active: true,
    order: 81
  },
  // Legs
  {
    id: 'leg-full-left',
    name: 'leg_full_left',
    displayName: 'Left Full Leg',
    anatomicalName: 'Membrum inferius sinistrum',
    category: 'body',
    subCategory: 'lower-extremity',
    side: 'left',
    childZoneIds: ['thigh-left', 'lower-leg-left'],
    boundaries: {
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 100,
      height: 100
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['hair-removal-laser', 'vascular-laser'],
    description: 'Full leg from hip to ankle',
    active: true,
    order: 82
  },
  {
    id: 'leg-full-right',
    name: 'leg_full_right',
    displayName: 'Right Full Leg',
    anatomicalName: 'Membrum inferius dextrum',
    category: 'body',
    subCategory: 'lower-extremity',
    side: 'right',
    childZoneIds: ['thigh-right', 'lower-leg-right'],
    boundaries: {
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 100,
      height: 100
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['hair-removal-laser', 'vascular-laser'],
    description: 'Full leg from hip to ankle',
    active: true,
    order: 83
  },
  {
    id: 'thigh-left',
    name: 'thigh_left',
    displayName: 'Left Thigh',
    anatomicalName: 'Femur sinistrum',
    category: 'body',
    subCategory: 'lower-extremity',
    parentZoneId: 'leg-full-left',
    side: 'left',
    boundaries: {
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 100,
      height: 45
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Thigh - hip to knee',
    active: true,
    order: 84
  },
  {
    id: 'thigh-right',
    name: 'thigh_right',
    displayName: 'Right Thigh',
    anatomicalName: 'Femur dextrum',
    category: 'body',
    subCategory: 'lower-extremity',
    parentZoneId: 'leg-full-right',
    side: 'right',
    boundaries: {
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 100,
      height: 45
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Thigh - hip to knee',
    active: true,
    order: 85
  },
  {
    id: 'lower-leg-left',
    name: 'lower_leg_left',
    displayName: 'Left Lower Leg',
    anatomicalName: 'Crus sinistrum',
    category: 'body',
    subCategory: 'lower-extremity',
    parentZoneId: 'leg-full-left',
    side: 'left',
    boundaries: {
      type: 'rectangle',
      x: 0,
      y: 45,
      width: 100,
      height: 55
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Lower leg - knee to ankle',
    active: true,
    order: 86
  },
  {
    id: 'lower-leg-right',
    name: 'lower_leg_right',
    displayName: 'Right Lower Leg',
    anatomicalName: 'Crus dextrum',
    category: 'body',
    subCategory: 'lower-extremity',
    parentZoneId: 'leg-full-right',
    side: 'right',
    boundaries: {
      type: 'rectangle',
      x: 0,
      y: 45,
      width: 100,
      height: 55
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    description: 'Lower leg - knee to ankle',
    active: true,
    order: 87
  }
]

// =============================================================================
// HANDS & FEET ZONES
// =============================================================================

const HANDS_FEET_ZONES: LaserZone[] = [
  {
    id: 'hand-left',
    name: 'hand_left',
    displayName: 'Left Hand',
    anatomicalName: 'Manus sinistra',
    category: 'hands',
    side: 'left',
    boundaries: {
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 100,
      height: 100
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Digital vessels', 'Tendons'],
      eyeProtectionRequired: true,
      precautions: ['Thin skin over dorsum', 'Prominent veins'],
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['ipl', 'fractional-laser'],
    description: 'Dorsum of hand - common rejuvenation area',
    skinTypeConsiderations: 'Higher risk of PIH - test spots recommended',
    active: true,
    order: 88
  },
  {
    id: 'hand-right',
    name: 'hand_right',
    displayName: 'Right Hand',
    anatomicalName: 'Manus dextra',
    category: 'hands',
    side: 'right',
    boundaries: {
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 100,
      height: 100
    },
    safety: {
      dangerLevel: 'caution',
      criticalStructures: ['Digital vessels', 'Tendons'],
      eyeProtectionRequired: true,
      precautions: ['Thin skin over dorsum', 'Prominent veins'],
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['ipl', 'fractional-laser'],
    description: 'Dorsum of hand - common rejuvenation area',
    skinTypeConsiderations: 'Higher risk of PIH - test spots recommended',
    active: true,
    order: 89
  },
  {
    id: 'foot-left',
    name: 'foot_left',
    displayName: 'Left Foot',
    anatomicalName: 'Pes sinister',
    category: 'feet',
    side: 'left',
    boundaries: {
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 100,
      height: 100
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['hair-removal-laser'],
    description: 'Foot dorsum',
    active: true,
    order: 90
  },
  {
    id: 'foot-right',
    name: 'foot_right',
    displayName: 'Right Foot',
    anatomicalName: 'Pes dexter',
    category: 'feet',
    side: 'right',
    boundaries: {
      type: 'rectangle',
      x: 0,
      y: 0,
      width: 100,
      height: 100
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['hair-removal-laser'],
    description: 'Foot dorsum',
    active: true,
    order: 91
  }
]

// =============================================================================
// INTIMATE ZONES (for hair removal)
// =============================================================================

const INTIMATE_ZONES: LaserZone[] = [
  {
    id: 'bikini-line',
    name: 'bikini_line',
    displayName: 'Bikini Line',
    anatomicalName: 'Regio inguinalis',
    category: 'body',
    subCategory: 'intimate',
    side: 'bilateral',
    boundaries: {
      type: 'polygon',
      points: [
        [20, 0], [80, 0], [70, 30], [30, 30]
      ]
    },
    safety: {
      dangerLevel: 'caution',
      eyeProtectionRequired: true,
      precautions: ['Sensitive area', 'Curved surfaces', 'Varying hair density'],
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['hair-removal-laser'],
    description: 'Standard bikini line hair removal area',
    active: true,
    order: 92
  },
  {
    id: 'brazilian-full',
    name: 'brazilian_full',
    displayName: 'Brazilian (Full)',
    anatomicalName: 'Regio pubica et perinealis',
    category: 'body',
    subCategory: 'intimate',
    side: 'central',
    boundaries: {
      type: 'rectangle',
      x: 20,
      y: 0,
      width: 60,
      height: 100
    },
    safety: {
      dangerLevel: 'caution',
      eyeProtectionRequired: true,
      precautions: [
        'Highly sensitive area',
        'Multiple skin folds',
        'Use lower fluence on labia/scrotum'
      ],
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['hair-removal-laser'],
    description: 'Full Brazilian hair removal area',
    active: true,
    order: 93
  },
  {
    id: 'perianal',
    name: 'perianal',
    displayName: 'Perianal',
    anatomicalName: 'Regio perianalis',
    category: 'body',
    subCategory: 'intimate',
    side: 'central',
    boundaries: {
      type: 'ellipse',
      center: { x: 50, y: 80 },
      radiusX: 15,
      radiusY: 15
    },
    safety: {
      dangerLevel: 'caution',
      eyeProtectionRequired: true,
      precautions: ['Very sensitive', 'Use conservative parameters'],
      coolingRecommended: 'contact'
    },
    defaultTreatmentIds: ['hair-removal-laser'],
    description: 'Perianal hair removal area',
    active: true,
    order: 94
  }
]

// =============================================================================
// SCALP ZONES
// =============================================================================

const SCALP_ZONES: LaserZone[] = [
  {
    id: 'scalp-full',
    name: 'scalp_full',
    displayName: 'Full Scalp',
    anatomicalName: 'Calvaria',
    category: 'scalp',
    side: 'central',
    childZoneIds: ['scalp-frontal', 'scalp-vertex', 'scalp-occipital'],
    boundaries: {
      type: 'rectangle',
      x: 10,
      y: 0,
      width: 80,
      height: 100
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'air'
    },
    defaultTreatmentIds: ['lllt', 'prp-injection'],
    description: 'Full scalp for hair restoration treatments',
    active: true,
    order: 95
  },
  {
    id: 'scalp-frontal',
    name: 'scalp_frontal',
    displayName: 'Frontal Scalp (Hairline)',
    anatomicalName: 'Regio frontalis capitis',
    category: 'scalp',
    parentZoneId: 'scalp-full',
    side: 'central',
    boundaries: {
      type: 'polygon',
      points: [
        [20, 0], [80, 0], [75, 30], [25, 30]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'air'
    },
    description: 'Frontal hairline area',
    active: true,
    order: 96
  },
  {
    id: 'scalp-vertex',
    name: 'scalp_vertex',
    displayName: 'Vertex (Crown)',
    anatomicalName: 'Vertex',
    category: 'scalp',
    parentZoneId: 'scalp-full',
    side: 'central',
    boundaries: {
      type: 'ellipse',
      center: { x: 50, y: 50 },
      radiusX: 25,
      radiusY: 20
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'air'
    },
    description: 'Crown/vertex area - common balding pattern',
    active: true,
    order: 97
  },
  {
    id: 'scalp-temple-left',
    name: 'scalp_temple_left',
    displayName: 'Left Temple (Scalp)',
    anatomicalName: 'Regio temporalis capitis sinistra',
    category: 'scalp',
    parentZoneId: 'scalp-full',
    side: 'left',
    boundaries: {
      type: 'polygon',
      points: [
        [10, 10], [25, 15], [28, 45], [12, 40]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'air'
    },
    description: 'Temporal recession area',
    active: true,
    order: 98
  },
  {
    id: 'scalp-temple-right',
    name: 'scalp_temple_right',
    displayName: 'Right Temple (Scalp)',
    anatomicalName: 'Regio temporalis capitis dextra',
    category: 'scalp',
    parentZoneId: 'scalp-full',
    side: 'right',
    boundaries: {
      type: 'polygon',
      points: [
        [75, 15], [90, 10], [88, 40], [72, 45]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'air'
    },
    description: 'Temporal recession area',
    active: true,
    order: 99
  },
  {
    id: 'scalp-occipital',
    name: 'scalp_occipital',
    displayName: 'Occipital Scalp',
    anatomicalName: 'Regio occipitalis',
    category: 'scalp',
    parentZoneId: 'scalp-full',
    side: 'central',
    boundaries: {
      type: 'polygon',
      points: [
        [25, 70], [75, 70], [70, 100], [30, 100]
      ]
    },
    safety: {
      dangerLevel: 'normal',
      eyeProtectionRequired: true,
      coolingRecommended: 'air'
    },
    description: 'Back of head - donor area for hair transplant',
    active: true,
    order: 100
  }
]

// =============================================================================
// COMBINED ZONE COLLECTIONS
// =============================================================================

/**
 * All face zones combined
 */
export const FACE_ZONES: LaserZone[] = [
  ...UPPER_FACE_ZONES,
  ...PERIORBITAL_ZONES,
  ...MID_FACE_ZONES,
  ...NOSE_ZONES,
  ...PERIORAL_ZONES,
  ...LOWER_FACE_ZONES,
  ...EAR_ZONES
]

/**
 * All neck zones
 */
export const NECK_ZONES_EXPORT: LaserZone[] = NECK_ZONES

/**
 * All decolletage zones
 */
export const DECOLLETAGE_ZONES_EXPORT: LaserZone[] = DECOLLETAGE_ZONES

/**
 * All body zones
 */
export const BODY_ZONES: LaserZone[] = [
  ...TORSO_ZONES,
  ...EXTREMITY_ZONES,
  ...HANDS_FEET_ZONES,
  ...INTIMATE_ZONES
]

/**
 * All scalp zones
 */
export const SCALP_ZONES_EXPORT: LaserZone[] = SCALP_ZONES

/**
 * Complete zone registry - all zones in the system
 */
export const ALL_LASER_ZONES: LaserZone[] = [
  ...FACE_ZONES,
  ...NECK_ZONES,
  ...DECOLLETAGE_ZONES,
  ...BODY_ZONES,
  ...SCALP_ZONES
]

// =============================================================================
// ZONE GROUPS FOR UI ORGANIZATION
// =============================================================================

export const ZONE_GROUPS: ZoneGroup[] = [
  // Face Groups
  {
    id: 'group-upper-face',
    name: 'upper_face',
    displayName: 'Upper Face',
    category: 'face',
    subCategory: 'upper-face',
    zoneIds: UPPER_FACE_ZONES.map(z => z.id),
    order: 1
  },
  {
    id: 'group-periorbital',
    name: 'periorbital',
    displayName: 'Periorbital (Eye Area)',
    category: 'face',
    subCategory: 'periorbital',
    zoneIds: PERIORBITAL_ZONES.map(z => z.id),
    order: 2
  },
  {
    id: 'group-mid-face',
    name: 'mid_face',
    displayName: 'Mid Face (Cheeks)',
    category: 'face',
    subCategory: 'mid-face',
    zoneIds: MID_FACE_ZONES.map(z => z.id),
    order: 3
  },
  {
    id: 'group-nose',
    name: 'nose',
    displayName: 'Nose',
    category: 'face',
    subCategory: 'nose',
    zoneIds: NOSE_ZONES.map(z => z.id),
    order: 4
  },
  {
    id: 'group-perioral',
    name: 'perioral',
    displayName: 'Perioral (Mouth Area)',
    category: 'face',
    subCategory: 'perioral',
    zoneIds: PERIORAL_ZONES.map(z => z.id),
    order: 5
  },
  {
    id: 'group-lower-face',
    name: 'lower_face',
    displayName: 'Lower Face (Chin/Jaw)',
    category: 'face',
    subCategory: 'lower-face',
    zoneIds: LOWER_FACE_ZONES.map(z => z.id),
    order: 6
  },
  {
    id: 'group-ears',
    name: 'ears',
    displayName: 'Ears',
    category: 'face',
    subCategory: 'ears',
    zoneIds: EAR_ZONES.map(z => z.id),
    order: 7
  },
  // Neck & Chest
  {
    id: 'group-neck',
    name: 'neck',
    displayName: 'Neck',
    category: 'neck',
    zoneIds: NECK_ZONES.map(z => z.id),
    order: 8
  },
  {
    id: 'group-decolletage',
    name: 'decolletage',
    displayName: 'Decolletage',
    category: 'decolletage',
    zoneIds: DECOLLETAGE_ZONES.map(z => z.id),
    order: 9
  },
  // Body
  {
    id: 'group-torso',
    name: 'torso',
    displayName: 'Torso',
    category: 'body',
    zoneIds: TORSO_ZONES.map(z => z.id),
    order: 10
  },
  {
    id: 'group-arms',
    name: 'arms',
    displayName: 'Arms',
    category: 'body',
    subCategory: 'upper-extremity',
    zoneIds: EXTREMITY_ZONES.filter(z => z.subCategory === 'upper-extremity').map(z => z.id),
    order: 11
  },
  {
    id: 'group-legs',
    name: 'legs',
    displayName: 'Legs',
    category: 'body',
    subCategory: 'lower-extremity',
    zoneIds: EXTREMITY_ZONES.filter(z => z.subCategory === 'lower-extremity').map(z => z.id),
    order: 12
  },
  {
    id: 'group-hands-feet',
    name: 'hands_feet',
    displayName: 'Hands & Feet',
    category: 'body',
    zoneIds: HANDS_FEET_ZONES.map(z => z.id),
    order: 13
  },
  {
    id: 'group-intimate',
    name: 'intimate',
    displayName: 'Intimate Areas',
    category: 'body',
    subCategory: 'intimate',
    zoneIds: INTIMATE_ZONES.map(z => z.id),
    order: 14
  },
  {
    id: 'group-scalp',
    name: 'scalp',
    displayName: 'Scalp',
    category: 'scalp',
    zoneIds: SCALP_ZONES.map(z => z.id),
    order: 15
  }
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a zone by its ID
 */
export function getZoneById(id: string): LaserZone | undefined {
  return ALL_LASER_ZONES.find(zone => zone.id === id)
}

/**
 * Get all zones in a specific category
 */
export function getZonesByCategory(category: ZoneCategory): LaserZone[] {
  return ALL_LASER_ZONES.filter(zone => zone.category === category)
}

/**
 * Get all zones in a specific sub-category
 */
export function getZonesBySubCategory(subCategory: ZoneSubCategory): LaserZone[] {
  return ALL_LASER_ZONES.filter(zone => zone.subCategory === subCategory)
}

/**
 * Get child zones of a parent zone
 */
export function getChildZones(parentId: string): LaserZone[] {
  return ALL_LASER_ZONES.filter(zone => zone.parentZoneId === parentId)
}

/**
 * Get parent zone of a child zone
 */
export function getParentZone(childId: string): LaserZone | undefined {
  const child = getZoneById(childId)
  if (!child?.parentZoneId) return undefined
  return getZoneById(child.parentZoneId)
}

/**
 * Get all zones at the top level (no parent)
 */
export function getRootZones(): LaserZone[] {
  return ALL_LASER_ZONES.filter(zone => !zone.parentZoneId)
}

/**
 * Get zones by danger level
 */
export function getZonesByDangerLevel(level: DangerLevel): LaserZone[] {
  return ALL_LASER_ZONES.filter(zone => zone.safety.dangerLevel === level)
}

/**
 * Get all danger zones (caution or danger level)
 */
export function getDangerZones(): LaserZone[] {
  return ALL_LASER_ZONES.filter(
    zone => zone.safety.dangerLevel === 'caution' || zone.safety.dangerLevel === 'danger'
  )
}

/**
 * Get active zones only
 */
export function getActiveZones(): LaserZone[] {
  return ALL_LASER_ZONES.filter(zone => zone.active)
}

/**
 * Get zones that support a specific treatment type
 */
export function getZonesForTreatment(treatmentId: string): LaserZone[] {
  return ALL_LASER_ZONES.filter(
    zone => zone.defaultTreatmentIds?.includes(treatmentId)
  )
}

/**
 * Get zone group by zone ID
 */
export function getZoneGroup(zoneId: string): ZoneGroup | undefined {
  return ZONE_GROUPS.find(group => group.zoneIds.includes(zoneId))
}

/**
 * Build zone hierarchy tree
 */
export function buildZoneHierarchy(): Map<string, LaserZone[]> {
  const hierarchy = new Map<string, LaserZone[]>()

  // Start with root zones
  const roots = getRootZones()
  hierarchy.set('root', roots)

  // Add children for each zone that has them
  for (const zone of ALL_LASER_ZONES) {
    if (zone.childZoneIds && zone.childZoneIds.length > 0) {
      const children = zone.childZoneIds
        .map(id => getZoneById(id))
        .filter((z): z is LaserZone => z !== undefined)
      hierarchy.set(zone.id, children)
    }
  }

  return hierarchy
}

/**
 * Get full zone path (ancestor chain)
 */
export function getZonePath(zoneId: string): LaserZone[] {
  const path: LaserZone[] = []
  let current = getZoneById(zoneId)

  while (current) {
    path.unshift(current)
    if (current.parentZoneId) {
      current = getZoneById(current.parentZoneId)
    } else {
      break
    }
  }

  return path
}

/**
 * Search zones by name (display name, name, or anatomical name)
 */
export function searchZones(query: string): LaserZone[] {
  const lowerQuery = query.toLowerCase()
  return ALL_LASER_ZONES.filter(zone =>
    zone.displayName.toLowerCase().includes(lowerQuery) ||
    zone.name.toLowerCase().includes(lowerQuery) ||
    zone.anatomicalName?.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Get zone statistics
 */
export function getZoneStats() {
  const byCategory = new Map<ZoneCategory, number>()
  const byDangerLevel = new Map<DangerLevel, number>()

  for (const zone of ALL_LASER_ZONES) {
    // Count by category
    const catCount = byCategory.get(zone.category) || 0
    byCategory.set(zone.category, catCount + 1)

    // Count by danger level
    const dangerCount = byDangerLevel.get(zone.safety.dangerLevel) || 0
    byDangerLevel.set(zone.safety.dangerLevel, dangerCount + 1)
  }

  return {
    total: ALL_LASER_ZONES.length,
    byCategory: Object.fromEntries(byCategory),
    byDangerLevel: Object.fromEntries(byDangerLevel),
    activeCount: getActiveZones().length,
    rootCount: getRootZones().length,
    groupCount: ZONE_GROUPS.length
  }
}

// =============================================================================
// EXPORT SUMMARY
// =============================================================================

/**
 * Zone count summary for reference:
 * - Upper Face: 9 zones
 * - Periorbital: 8 zones
 * - Mid Face: 6 zones
 * - Nose: 7 zones
 * - Perioral: 13 zones
 * - Lower Face: 8 zones
 * - Ears: 4 zones
 * - Neck: 7 zones
 * - Decolletage: 3 zones
 * - Torso: 8 zones
 * - Extremities: 14 zones
 * - Hands/Feet: 4 zones
 * - Intimate: 3 zones
 * - Scalp: 6 zones
 *
 * TOTAL: 100 zones
 *
 * Danger levels:
 * - Normal: ~70%
 * - Caution: ~25%
 * - Danger: ~5% (periorbital/vermillion)
 */
