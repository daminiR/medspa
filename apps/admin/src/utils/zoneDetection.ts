/**
 * Zone Detection Algorithm for Charting
 *
 * Determines which anatomical zone a point or stroke is in, supporting:
 * - Face charts (2D percentage-based positioning)
 * - Body charts (2D percentage-based positioning)
 * - SVG path-based hit testing when paths are available
 * - Polygon/rectangle region hit testing as fallback
 *
 * Designed with practitioner workflow in mind - fast, accurate, minimal friction.
 */

import { FacialZone, BodyZone } from '@/types/treatment-settings'

// =============================================================================
// TYPES
// =============================================================================

/**
 * A point in 2D space, can be pixels or percentage
 */
export interface Point {
  x: number
  y: number
}

/**
 * Chart type being analyzed
 */
export type ChartType = 'face' | 'body'

/**
 * Zone ID - can be facial or body zone
 */
export type ZoneId = FacialZone | BodyZone | string

/**
 * Zone definition with boundaries for detection
 */
export interface ZoneDefinition {
  id: ZoneId
  name: string
  category: 'facial' | 'body'
  parentZone?: ZoneId // For hierarchical zones (e.g., "upper_eyelid" parent is "periorbital")
  specificity: number // Higher = more specific (used for overlapping zones)
  bounds: ZoneBounds
}

/**
 * Zone boundaries - supports multiple formats
 */
export interface ZoneBounds {
  // Percentage-based rectangle (most common)
  rect?: {
    x: number      // Left edge (0-100)
    y: number      // Top edge (0-100)
    width: number  // Width (0-100)
    height: number // Height (0-100)
  }
  // Polygon points for irregular shapes
  polygon?: Point[]
  // SVG path string for complex shapes
  svgPath?: string
  // Ellipse for rounded zones
  ellipse?: {
    cx: number  // Center X (0-100)
    cy: number  // Center Y (0-100)
    rx: number  // Radius X
    ry: number  // Radius Y
  }
}

/**
 * Result of zone detection
 */
export interface ZoneDetectionResult {
  zone: ZoneId | null
  zoneName: string | null
  confidence: number // 0-1, how certain we are
  isExact: boolean   // True if point is clearly inside zone
  nearbyZones?: ZoneId[] // Other zones close to this point
}

/**
 * Result of stroke zone detection
 */
export interface StrokeZoneResult {
  primaryZone: ZoneId | null
  primaryZoneName: string | null
  zonesHit: {
    zoneId: ZoneId
    zoneName: string
    coverage: number // 0-1, percentage of stroke in this zone
    pointCount: number
  }[]
  confidence: number
  spansMultipleZones: boolean
}

// =============================================================================
// FACE ZONE DEFINITIONS
// Percentage-based coordinates (0-100) relative to chart area
// Based on standard frontal face view
// =============================================================================

export const FACE_ZONE_DEFINITIONS: ZoneDefinition[] = [
  // Upper Face - General
  {
    id: FacialZone.FOREHEAD,
    name: 'Forehead',
    category: 'facial',
    specificity: 1,
    bounds: {
      rect: { x: 20, y: 5, width: 60, height: 20 }
    }
  },
  {
    id: FacialZone.FOREHEAD_LATERAL,
    name: 'Lateral Forehead',
    category: 'facial',
    parentZone: FacialZone.FOREHEAD,
    specificity: 2,
    bounds: {
      polygon: [
        { x: 10, y: 8 }, { x: 25, y: 8 }, { x: 25, y: 25 }, { x: 10, y: 25 }
      ]
    }
  },
  {
    id: FacialZone.GLABELLA,
    name: 'Glabella',
    category: 'facial',
    specificity: 3,
    bounds: {
      rect: { x: 40, y: 20, width: 20, height: 10 }
    }
  },
  {
    id: FacialZone.BROW,
    name: 'Brow',
    category: 'facial',
    specificity: 2,
    bounds: {
      rect: { x: 20, y: 25, width: 60, height: 8 }
    }
  },
  {
    id: FacialZone.BROW_TAIL,
    name: 'Brow Tail',
    category: 'facial',
    parentZone: FacialZone.BROW,
    specificity: 3,
    bounds: {
      polygon: [
        { x: 10, y: 25 }, { x: 22, y: 25 }, { x: 18, y: 33 }, { x: 10, y: 33 }
      ]
    }
  },
  {
    id: FacialZone.TEMPLE,
    name: 'Temple',
    category: 'facial',
    specificity: 2,
    bounds: {
      ellipse: { cx: 12, cy: 35, rx: 10, ry: 12 }
    }
  },

  // Periorbital Region
  {
    id: FacialZone.UPPER_EYELID,
    name: 'Upper Eyelid',
    category: 'facial',
    specificity: 4,
    bounds: {
      ellipse: { cx: 32, cy: 38, rx: 8, ry: 4 }
    }
  },
  {
    id: FacialZone.LOWER_EYELID,
    name: 'Lower Eyelid',
    category: 'facial',
    specificity: 4,
    bounds: {
      ellipse: { cx: 32, cy: 44, rx: 8, ry: 3 }
    }
  },
  {
    id: FacialZone.CROWS_FEET,
    name: "Crow's Feet",
    category: 'facial',
    specificity: 3,
    bounds: {
      polygon: [
        { x: 10, y: 35 }, { x: 20, y: 35 }, { x: 20, y: 48 }, { x: 10, y: 48 }
      ]
    }
  },
  {
    id: FacialZone.TEAR_TROUGH,
    name: 'Tear Trough',
    category: 'facial',
    specificity: 4,
    bounds: {
      polygon: [
        { x: 25, y: 46 }, { x: 40, y: 44 }, { x: 40, y: 50 }, { x: 25, y: 52 }
      ]
    }
  },
  {
    id: FacialZone.UNDER_EYE,
    name: 'Under Eye',
    category: 'facial',
    specificity: 3,
    bounds: {
      ellipse: { cx: 32, cy: 50, rx: 10, ry: 5 }
    }
  },

  // Mid Face
  {
    id: FacialZone.NOSE_BRIDGE,
    name: 'Nose Bridge',
    category: 'facial',
    specificity: 3,
    bounds: {
      rect: { x: 45, y: 38, width: 10, height: 15 }
    }
  },
  {
    id: FacialZone.NOSE_TIP,
    name: 'Nose Tip',
    category: 'facial',
    specificity: 4,
    bounds: {
      ellipse: { cx: 50, cy: 58, rx: 6, ry: 5 }
    }
  },
  {
    id: FacialZone.BUNNY_LINES,
    name: 'Bunny Lines',
    category: 'facial',
    specificity: 4,
    bounds: {
      rect: { x: 40, y: 48, width: 20, height: 8 }
    }
  },
  {
    id: FacialZone.NASAL_ALAR,
    name: 'Nasal Alar',
    category: 'facial',
    specificity: 4,
    bounds: {
      polygon: [
        { x: 38, y: 55 }, { x: 45, y: 55 }, { x: 45, y: 65 }, { x: 38, y: 65 }
      ]
    }
  },
  {
    id: FacialZone.CHEEK_APEX,
    name: 'Cheek Apex',
    category: 'facial',
    specificity: 3,
    bounds: {
      ellipse: { cx: 22, cy: 50, rx: 8, ry: 6 }
    }
  },
  {
    id: FacialZone.CHEEK_HOLLOW,
    name: 'Cheek Hollow',
    category: 'facial',
    specificity: 3,
    bounds: {
      ellipse: { cx: 22, cy: 60, rx: 8, ry: 5 }
    }
  },
  {
    id: FacialZone.ZYGOMA,
    name: 'Zygoma',
    category: 'facial',
    specificity: 2,
    bounds: {
      polygon: [
        { x: 12, y: 45 }, { x: 30, y: 42 }, { x: 35, y: 55 }, { x: 15, y: 58 }
      ]
    }
  },
  {
    id: FacialZone.MALAR,
    name: 'Malar',
    category: 'facial',
    specificity: 2,
    bounds: {
      ellipse: { cx: 20, cy: 52, rx: 12, ry: 10 }
    }
  },
  {
    id: FacialZone.NASOLABIAL,
    name: 'Nasolabial Fold',
    category: 'facial',
    specificity: 3,
    bounds: {
      polygon: [
        { x: 35, y: 60 }, { x: 42, y: 58 }, { x: 42, y: 78 }, { x: 35, y: 75 }
      ]
    }
  },

  // Lower Face - Lips
  {
    id: FacialZone.UPPER_LIP,
    name: 'Upper Lip',
    category: 'facial',
    specificity: 4,
    bounds: {
      rect: { x: 38, y: 68, width: 24, height: 6 }
    }
  },
  {
    id: FacialZone.LOWER_LIP,
    name: 'Lower Lip',
    category: 'facial',
    specificity: 4,
    bounds: {
      rect: { x: 38, y: 74, width: 24, height: 7 }
    }
  },
  {
    id: FacialZone.LIP_BORDER,
    name: 'Lip Border',
    category: 'facial',
    specificity: 5,
    bounds: {
      polygon: [
        { x: 36, y: 67 }, { x: 64, y: 67 }, { x: 64, y: 70 }, { x: 36, y: 70 }
      ]
    }
  },
  {
    id: FacialZone.CUPIDS_BOW,
    name: "Cupid's Bow",
    category: 'facial',
    specificity: 5,
    bounds: {
      polygon: [
        { x: 45, y: 66 }, { x: 55, y: 66 }, { x: 52, y: 70 }, { x: 48, y: 70 }
      ]
    }
  },
  {
    id: FacialZone.PHILTRUM,
    name: 'Philtrum',
    category: 'facial',
    specificity: 4,
    bounds: {
      rect: { x: 45, y: 62, width: 10, height: 6 }
    }
  },
  {
    id: FacialZone.ORAL_COMMISSURE,
    name: 'Oral Commissure',
    category: 'facial',
    specificity: 4,
    bounds: {
      ellipse: { cx: 35, cy: 73, rx: 4, ry: 4 }
    }
  },
  {
    id: FacialZone.PERIORAL,
    name: 'Perioral',
    category: 'facial',
    specificity: 2,
    bounds: {
      rect: { x: 32, y: 62, width: 36, height: 25 }
    }
  },

  // Lower Face - Chin & Jaw
  {
    id: FacialZone.MARIONETTE,
    name: 'Marionette Lines',
    category: 'facial',
    specificity: 3,
    bounds: {
      polygon: [
        { x: 32, y: 78 }, { x: 38, y: 76 }, { x: 40, y: 88 }, { x: 34, y: 90 }
      ]
    }
  },
  {
    id: FacialZone.CHIN,
    name: 'Chin',
    category: 'facial',
    specificity: 2,
    bounds: {
      ellipse: { cx: 50, cy: 90, rx: 12, ry: 8 }
    }
  },
  {
    id: FacialZone.CHIN_CREASE,
    name: 'Chin Crease',
    category: 'facial',
    specificity: 4,
    bounds: {
      rect: { x: 42, y: 82, width: 16, height: 4 }
    }
  },
  {
    id: FacialZone.PREJOWL,
    name: 'Prejowl',
    category: 'facial',
    specificity: 3,
    bounds: {
      ellipse: { cx: 30, cy: 85, rx: 8, ry: 5 }
    }
  },
  {
    id: FacialZone.JOWL,
    name: 'Jowl',
    category: 'facial',
    specificity: 2,
    bounds: {
      polygon: [
        { x: 15, y: 75 }, { x: 32, y: 78 }, { x: 30, y: 92 }, { x: 12, y: 88 }
      ]
    }
  },
  {
    id: FacialZone.JAWLINE,
    name: 'Jawline',
    category: 'facial',
    specificity: 2,
    bounds: {
      polygon: [
        { x: 8, y: 65 }, { x: 20, y: 75 }, { x: 35, y: 85 }, { x: 50, y: 95 },
        { x: 50, y: 98 }, { x: 30, y: 92 }, { x: 15, y: 82 }, { x: 5, y: 70 }
      ]
    }
  },
  {
    id: FacialZone.MENTALIS,
    name: 'Mentalis',
    category: 'facial',
    specificity: 3,
    bounds: {
      ellipse: { cx: 50, cy: 85, rx: 8, ry: 6 }
    }
  },

  // Neck
  {
    id: FacialZone.NECK_ANTERIOR,
    name: 'Anterior Neck',
    category: 'facial',
    specificity: 1,
    bounds: {
      rect: { x: 30, y: 95, width: 40, height: 10 }
    }
  },
  {
    id: FacialZone.NECK_LATERAL,
    name: 'Lateral Neck',
    category: 'facial',
    specificity: 2,
    bounds: {
      polygon: [
        { x: 5, y: 85 }, { x: 25, y: 90 }, { x: 25, y: 100 }, { x: 5, y: 100 }
      ]
    }
  },
  {
    id: FacialZone.PLATYSMA,
    name: 'Platysma',
    category: 'facial',
    specificity: 2,
    bounds: {
      rect: { x: 25, y: 92, width: 50, height: 8 }
    }
  },
  {
    id: FacialZone.SUBMENTAL,
    name: 'Submental',
    category: 'facial',
    specificity: 3,
    bounds: {
      ellipse: { cx: 50, cy: 96, rx: 15, ry: 4 }
    }
  },

  // Other
  {
    id: FacialZone.EAR_LOBE,
    name: 'Ear Lobe',
    category: 'facial',
    specificity: 3,
    bounds: {
      ellipse: { cx: 5, cy: 55, rx: 4, ry: 6 }
    }
  },
  {
    id: FacialZone.SCALP,
    name: 'Scalp',
    category: 'facial',
    specificity: 1,
    bounds: {
      rect: { x: 15, y: 0, width: 70, height: 10 }
    }
  },
  {
    id: FacialZone.FULL_FACE,
    name: 'Full Face',
    category: 'facial',
    specificity: 0,
    bounds: {
      rect: { x: 5, y: 5, width: 90, height: 90 }
    }
  },
]

// =============================================================================
// BODY ZONE DEFINITIONS
// Percentage-based coordinates for body chart (anterior view)
// =============================================================================

export const BODY_ZONE_DEFINITIONS: ZoneDefinition[] = [
  // Upper Body
  {
    id: BodyZone.DECOLLETAGE,
    name: 'Decolletage',
    category: 'body',
    specificity: 2,
    bounds: {
      rect: { x: 30, y: 15, width: 40, height: 10 }
    }
  },
  {
    id: BodyZone.UPPER_CHEST,
    name: 'Upper Chest',
    category: 'body',
    specificity: 2,
    bounds: {
      rect: { x: 25, y: 20, width: 50, height: 12 }
    }
  },
  {
    id: BodyZone.BREAST,
    name: 'Breast',
    category: 'body',
    specificity: 2,
    bounds: {
      ellipse: { cx: 35, cy: 28, rx: 10, ry: 8 }
    }
  },
  {
    id: BodyZone.UPPER_ARM,
    name: 'Upper Arm',
    category: 'body',
    specificity: 2,
    bounds: {
      rect: { x: 8, y: 22, width: 12, height: 18 }
    }
  },
  {
    id: BodyZone.ELBOW,
    name: 'Elbow',
    category: 'body',
    specificity: 3,
    bounds: {
      ellipse: { cx: 12, cy: 42, rx: 5, ry: 4 }
    }
  },
  {
    id: BodyZone.FOREARM,
    name: 'Forearm',
    category: 'body',
    specificity: 2,
    bounds: {
      rect: { x: 5, y: 44, width: 10, height: 16 }
    }
  },
  {
    id: BodyZone.HAND_DORSAL,
    name: 'Hand (Dorsal)',
    category: 'body',
    specificity: 3,
    bounds: {
      rect: { x: 2, y: 60, width: 8, height: 10 }
    }
  },

  // Abdomen
  {
    id: BodyZone.UPPER_ABDOMEN,
    name: 'Upper Abdomen',
    category: 'body',
    specificity: 2,
    bounds: {
      rect: { x: 35, y: 35, width: 30, height: 12 }
    }
  },
  {
    id: BodyZone.LOWER_ABDOMEN,
    name: 'Lower Abdomen',
    category: 'body',
    specificity: 2,
    bounds: {
      rect: { x: 35, y: 47, width: 30, height: 12 }
    }
  },
  {
    id: BodyZone.UMBILICAL,
    name: 'Umbilical',
    category: 'body',
    specificity: 4,
    bounds: {
      ellipse: { cx: 50, cy: 48, rx: 5, ry: 4 }
    }
  },
  {
    id: BodyZone.FLANK,
    name: 'Flank',
    category: 'body',
    specificity: 2,
    bounds: {
      polygon: [
        { x: 20, y: 35 }, { x: 30, y: 35 }, { x: 30, y: 55 }, { x: 20, y: 55 }
      ]
    }
  },
  {
    id: BodyZone.LOVE_HANDLES,
    name: 'Love Handles',
    category: 'body',
    specificity: 3,
    bounds: {
      ellipse: { cx: 22, cy: 48, rx: 8, ry: 10 }
    }
  },

  // Hip & Buttocks
  {
    id: BodyZone.HIP,
    name: 'Hip',
    category: 'body',
    specificity: 2,
    bounds: {
      ellipse: { cx: 25, cy: 58, rx: 10, ry: 8 }
    }
  },
  {
    id: BodyZone.BUTTOCK,
    name: 'Buttock',
    category: 'body',
    specificity: 2,
    bounds: {
      ellipse: { cx: 35, cy: 62, rx: 12, ry: 10 }
    }
  },
  {
    id: BodyZone.BANANA_ROLL,
    name: 'Banana Roll',
    category: 'body',
    specificity: 3,
    bounds: {
      polygon: [
        { x: 28, y: 68 }, { x: 45, y: 68 }, { x: 45, y: 72 }, { x: 28, y: 72 }
      ]
    }
  },

  // Thigh
  {
    id: BodyZone.INNER_THIGH,
    name: 'Inner Thigh',
    category: 'body',
    specificity: 2,
    bounds: {
      rect: { x: 42, y: 62, width: 8, height: 20 }
    }
  },
  {
    id: BodyZone.OUTER_THIGH,
    name: 'Outer Thigh',
    category: 'body',
    specificity: 2,
    bounds: {
      rect: { x: 20, y: 62, width: 10, height: 20 }
    }
  },
  {
    id: BodyZone.ANTERIOR_THIGH,
    name: 'Anterior Thigh',
    category: 'body',
    specificity: 2,
    bounds: {
      rect: { x: 30, y: 62, width: 12, height: 22 }
    }
  },
  {
    id: BodyZone.KNEE,
    name: 'Knee',
    category: 'body',
    specificity: 3,
    bounds: {
      ellipse: { cx: 35, cy: 85, rx: 6, ry: 5 }
    }
  },

  // Lower Leg
  {
    id: BodyZone.CALF,
    name: 'Calf',
    category: 'body',
    specificity: 2,
    bounds: {
      rect: { x: 30, y: 88, width: 12, height: 10 }
    }
  },
  {
    id: BodyZone.ANKLE,
    name: 'Ankle',
    category: 'body',
    specificity: 3,
    bounds: {
      ellipse: { cx: 35, cy: 96, rx: 4, ry: 3 }
    }
  },

  // Full Areas
  {
    id: BodyZone.FULL_BODY,
    name: 'Full Body',
    category: 'body',
    specificity: 0,
    bounds: {
      rect: { x: 0, y: 0, width: 100, height: 100 }
    }
  },
  {
    id: BodyZone.BIKINI,
    name: 'Bikini Area',
    category: 'body',
    specificity: 2,
    bounds: {
      polygon: [
        { x: 38, y: 55 }, { x: 62, y: 55 }, { x: 58, y: 68 }, { x: 42, y: 68 }
      ]
    }
  },
  {
    id: BodyZone.UNDERARM,
    name: 'Underarm',
    category: 'body',
    specificity: 3,
    bounds: {
      ellipse: { cx: 18, cy: 25, rx: 5, ry: 8 }
    }
  },
]

// =============================================================================
// GEOMETRY UTILITIES
// =============================================================================

/**
 * Check if a point is inside a rectangle
 */
function pointInRect(
  point: Point,
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}

/**
 * Check if a point is inside an ellipse
 */
function pointInEllipse(
  point: Point,
  ellipse: { cx: number; cy: number; rx: number; ry: number }
): boolean {
  const dx = (point.x - ellipse.cx) / ellipse.rx
  const dy = (point.y - ellipse.cy) / ellipse.ry
  return dx * dx + dy * dy <= 1
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
function pointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false
  const n = polygon.length

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi

    if (intersect) {
      inside = !inside
    }
  }

  return inside
}

/**
 * Check if a point is inside an SVG path
 * Uses a canvas-based approach for complex paths
 */
function pointInSvgPath(point: Point, svgPath: string): boolean {
  // For browser environments, we can use Path2D
  if (typeof Path2D !== 'undefined' && typeof document !== 'undefined') {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const path = new Path2D(svgPath)
        return ctx.isPointInPath(path, point.x, point.y)
      }
    } catch {
      // Fall through to return false if path parsing fails
    }
  }
  return false
}

/**
 * Calculate distance from point to rectangle center
 */
function distanceToRectCenter(
  point: Point,
  rect: { x: number; y: number; width: number; height: number }
): number {
  const centerX = rect.x + rect.width / 2
  const centerY = rect.y + rect.height / 2
  return Math.sqrt(
    Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
  )
}

/**
 * Calculate distance from point to ellipse center
 */
function distanceToEllipseCenter(
  point: Point,
  ellipse: { cx: number; cy: number; rx: number; ry: number }
): number {
  return Math.sqrt(
    Math.pow(point.x - ellipse.cx, 2) + Math.pow(point.y - ellipse.cy, 2)
  )
}

/**
 * Calculate centroid of a polygon
 */
function polygonCentroid(polygon: Point[]): Point {
  let sumX = 0
  let sumY = 0
  for (const p of polygon) {
    sumX += p.x
    sumY += p.y
  }
  return {
    x: sumX / polygon.length,
    y: sumY / polygon.length
  }
}

// =============================================================================
// ZONE DETECTION FUNCTIONS
// =============================================================================

/**
 * Check if a point is inside a zone's bounds
 */
function pointInZone(point: Point, zone: ZoneDefinition): boolean {
  const { bounds } = zone

  // Check SVG path first (most precise)
  if (bounds.svgPath) {
    if (pointInSvgPath(point, bounds.svgPath)) {
      return true
    }
  }

  // Check polygon
  if (bounds.polygon) {
    if (pointInPolygon(point, bounds.polygon)) {
      return true
    }
  }

  // Check ellipse
  if (bounds.ellipse) {
    if (pointInEllipse(point, bounds.ellipse)) {
      return true
    }
  }

  // Check rectangle
  if (bounds.rect) {
    if (pointInRect(point, bounds.rect)) {
      return true
    }
  }

  return false
}

/**
 * Calculate confidence score based on how centered the point is in the zone
 */
function calculateConfidence(point: Point, zone: ZoneDefinition): number {
  const { bounds } = zone
  let distance = 100 // Max distance

  if (bounds.rect) {
    const maxPossibleDist = Math.sqrt(
      Math.pow(bounds.rect.width / 2, 2) + Math.pow(bounds.rect.height / 2, 2)
    )
    distance = Math.min(
      distance,
      distanceToRectCenter(point, bounds.rect) / maxPossibleDist
    )
  }

  if (bounds.ellipse) {
    const maxPossibleDist = Math.max(bounds.ellipse.rx, bounds.ellipse.ry)
    distance = Math.min(
      distance,
      distanceToEllipseCenter(point, bounds.ellipse) / maxPossibleDist
    )
  }

  if (bounds.polygon) {
    const centroid = polygonCentroid(bounds.polygon)
    const pointDist = Math.sqrt(
      Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2)
    )
    // Estimate max distance as distance from centroid to farthest vertex
    let maxDist = 0
    for (const v of bounds.polygon) {
      const d = Math.sqrt(
        Math.pow(v.x - centroid.x, 2) + Math.pow(v.y - centroid.y, 2)
      )
      maxDist = Math.max(maxDist, d)
    }
    distance = Math.min(distance, pointDist / maxDist)
  }

  // Convert distance (0-1 where 0 is center) to confidence (1-0 where 1 is center)
  return Math.max(0, 1 - distance)
}

/**
 * Detect which zone a point is in
 *
 * @param x X coordinate (percentage 0-100 or pixels if converted)
 * @param y Y coordinate (percentage 0-100 or pixels if converted)
 * @param chartType 'face' or 'body'
 * @returns Zone detection result with zone ID, name, and confidence
 */
export function detectZone(
  x: number,
  y: number,
  chartType: ChartType
): ZoneDetectionResult {
  const point: Point = { x, y }
  const zones =
    chartType === 'face' ? FACE_ZONE_DEFINITIONS : BODY_ZONE_DEFINITIONS

  // Find all zones the point is in
  const matchingZones: { zone: ZoneDefinition; confidence: number }[] = []

  for (const zone of zones) {
    if (pointInZone(point, zone)) {
      const confidence = calculateConfidence(point, zone)
      matchingZones.push({ zone, confidence })
    }
  }

  if (matchingZones.length === 0) {
    return {
      zone: null,
      zoneName: null,
      confidence: 0,
      isExact: false,
      nearbyZones: []
    }
  }

  // Sort by specificity (higher = more specific) then by confidence
  matchingZones.sort((a, b) => {
    const specDiff = b.zone.specificity - a.zone.specificity
    if (specDiff !== 0) return specDiff
    return b.confidence - a.confidence
  })

  // Return the most specific zone with highest confidence
  const best = matchingZones[0]
  const nearbyZones = matchingZones.slice(1).map((m) => m.zone.id)

  return {
    zone: best.zone.id,
    zoneName: best.zone.name,
    confidence: best.confidence,
    isExact: best.confidence > 0.5,
    nearbyZones
  }
}

/**
 * Get zone at a percentage position (convenience wrapper)
 *
 * @param xPercent X position as percentage (0-100)
 * @param yPercent Y position as percentage (0-100)
 * @param chartType 'face' or 'body'
 * @returns Zone detection result
 */
export function getZoneAtPercentage(
  xPercent: number,
  yPercent: number,
  chartType: ChartType = 'face'
): ZoneDetectionResult {
  // Clamp values to valid range
  const x = Math.max(0, Math.min(100, xPercent))
  const y = Math.max(0, Math.min(100, yPercent))
  return detectZone(x, y, chartType)
}

/**
 * Convert canvas coordinates to percentage
 *
 * @param canvasX X coordinate in pixels
 * @param canvasY Y coordinate in pixels
 * @param chartWidth Width of the chart area in pixels
 * @param chartHeight Height of the chart area in pixels
 * @returns Point with x, y as percentages (0-100)
 */
export function canvasToPercentage(
  canvasX: number,
  canvasY: number,
  chartWidth: number,
  chartHeight: number
): Point {
  return {
    x: (canvasX / chartWidth) * 100,
    y: (canvasY / chartHeight) * 100
  }
}

/**
 * Detect zones for a stroke (array of points)
 *
 * @param points Array of points forming the stroke
 * @param chartType 'face' or 'body'
 * @returns Stroke zone result with primary zone, all zones hit, and coverage
 */
export function detectZonesForStroke(
  points: Point[],
  chartType: ChartType = 'face'
): StrokeZoneResult {
  if (points.length === 0) {
    return {
      primaryZone: null,
      primaryZoneName: null,
      zonesHit: [],
      confidence: 0,
      spansMultipleZones: false
    }
  }

  // Count how many points are in each zone
  const zoneCounts: Map<
    ZoneId,
    { name: string; count: number; totalConfidence: number }
  > = new Map()

  for (const point of points) {
    const result = detectZone(point.x, point.y, chartType)
    if (result.zone) {
      const existing = zoneCounts.get(result.zone)
      if (existing) {
        existing.count++
        existing.totalConfidence += result.confidence
      } else {
        zoneCounts.set(result.zone, {
          name: result.zoneName || '',
          count: 1,
          totalConfidence: result.confidence
        })
      }
    }
  }

  if (zoneCounts.size === 0) {
    return {
      primaryZone: null,
      primaryZoneName: null,
      zonesHit: [],
      confidence: 0,
      spansMultipleZones: false
    }
  }

  // Convert to array and calculate coverage
  const zonesHit = Array.from(zoneCounts.entries())
    .map(([zoneId, data]) => ({
      zoneId,
      zoneName: data.name,
      coverage: data.count / points.length,
      pointCount: data.count
    }))
    .sort((a, b) => b.coverage - a.coverage)

  // Primary zone is the one with most coverage
  const primary = zonesHit[0]
  const primaryZoneData = zoneCounts.get(primary.zoneId)
  const avgConfidence = primaryZoneData
    ? primaryZoneData.totalConfidence / primaryZoneData.count
    : 0

  return {
    primaryZone: primary.zoneId,
    primaryZoneName: primary.zoneName,
    zonesHit,
    confidence: avgConfidence,
    spansMultipleZones: zonesHit.length > 1
  }
}

/**
 * Get all zones at a point (including overlapping zones)
 *
 * @param x X coordinate (percentage 0-100)
 * @param y Y coordinate (percentage 0-100)
 * @param chartType 'face' or 'body'
 * @returns Array of all matching zones sorted by specificity
 */
export function getAllZonesAtPoint(
  x: number,
  y: number,
  chartType: ChartType = 'face'
): { zone: ZoneDefinition; confidence: number }[] {
  const point: Point = { x, y }
  const zones =
    chartType === 'face' ? FACE_ZONE_DEFINITIONS : BODY_ZONE_DEFINITIONS

  const matches: { zone: ZoneDefinition; confidence: number }[] = []

  for (const zone of zones) {
    if (pointInZone(point, zone)) {
      const confidence = calculateConfidence(point, zone)
      matches.push({ zone, confidence })
    }
  }

  // Sort by specificity descending
  return matches.sort((a, b) => b.zone.specificity - a.zone.specificity)
}

/**
 * Get zone definition by ID
 *
 * @param zoneId The zone ID to look up
 * @param chartType 'face' or 'body'
 * @returns Zone definition or undefined if not found
 */
export function getZoneDefinition(
  zoneId: ZoneId,
  chartType: ChartType = 'face'
): ZoneDefinition | undefined {
  const zones =
    chartType === 'face' ? FACE_ZONE_DEFINITIONS : BODY_ZONE_DEFINITIONS
  return zones.find((z) => z.id === zoneId)
}

/**
 * Get all child zones of a parent zone
 *
 * @param parentZoneId The parent zone ID
 * @param chartType 'face' or 'body'
 * @returns Array of child zone definitions
 */
export function getChildZones(
  parentZoneId: ZoneId,
  chartType: ChartType = 'face'
): ZoneDefinition[] {
  const zones =
    chartType === 'face' ? FACE_ZONE_DEFINITIONS : BODY_ZONE_DEFINITIONS
  return zones.filter((z) => z.parentZone === parentZoneId)
}

/**
 * Find the nearest zone to a point (useful when point is outside all zones)
 *
 * @param x X coordinate (percentage 0-100)
 * @param y Y coordinate (percentage 0-100)
 * @param chartType 'face' or 'body'
 * @returns Nearest zone with estimated distance
 */
export function findNearestZone(
  x: number,
  y: number,
  chartType: ChartType = 'face'
): { zone: ZoneDefinition; distance: number } | null {
  const point: Point = { x, y }
  const zones =
    chartType === 'face' ? FACE_ZONE_DEFINITIONS : BODY_ZONE_DEFINITIONS

  let nearestZone: ZoneDefinition | null = null
  let minDistance = Infinity

  for (const zone of zones) {
    let distance = Infinity

    // Calculate distance to zone center
    if (zone.bounds.rect) {
      distance = Math.min(distance, distanceToRectCenter(point, zone.bounds.rect))
    }
    if (zone.bounds.ellipse) {
      distance = Math.min(
        distance,
        distanceToEllipseCenter(point, zone.bounds.ellipse)
      )
    }
    if (zone.bounds.polygon) {
      const centroid = polygonCentroid(zone.bounds.polygon)
      const d = Math.sqrt(
        Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2)
      )
      distance = Math.min(distance, d)
    }

    if (distance < minDistance) {
      minDistance = distance
      nearestZone = zone
    }
  }

  if (!nearestZone) {
    return null
  }

  return {
    zone: nearestZone,
    distance: minDistance
  }
}

// =============================================================================
// MIRROR ZONES (for bilateral face)
// =============================================================================

/**
 * Get the mirrored zone ID for bilateral zones
 * E.g., left crow's feet -> right crow's feet
 *
 * @param zoneId The zone ID
 * @param x X coordinate to determine which side
 * @returns The mirrored position x coordinate
 */
export function getMirroredX(x: number): number {
  return 100 - x
}

/**
 * Mirror a point across the vertical center line
 *
 * @param point The point to mirror
 * @returns Mirrored point
 */
export function mirrorPoint(point: Point): Point {
  return {
    x: getMirroredX(point.x),
    y: point.y
  }
}

/**
 * Check if a zone is bilateral (exists on both sides of face)
 * Based on the zone's bounds center being off-center
 *
 * @param zone The zone definition
 * @returns True if zone is on one side of the face
 */
export function isBilateralZone(zone: ZoneDefinition): boolean {
  // Check if zone center is significantly off the midline (50%)
  const midline = 50
  const threshold = 10 // Within 10% of midline is considered central

  let centerX = 50

  if (zone.bounds.rect) {
    centerX = zone.bounds.rect.x + zone.bounds.rect.width / 2
  } else if (zone.bounds.ellipse) {
    centerX = zone.bounds.ellipse.cx
  } else if (zone.bounds.polygon) {
    const centroid = polygonCentroid(zone.bounds.polygon)
    centerX = centroid.x
  }

  return Math.abs(centerX - midline) > threshold
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  FACE_ZONE_DEFINITIONS as faceZones,
  BODY_ZONE_DEFINITIONS as bodyZones
}
