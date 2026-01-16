/**
 * Zone Detection Utility for Brush Strokes
 *
 * Auto-detects which facial zone a brush stroke covers based on the stroke's
 * coordinates and the predefined face zone boundaries.
 *
 * Design Philosophy (from PRACTITIONER_CONTEXT.md):
 * - Automatic detection with minimal friction
 * - No extra taps or confirmations required
 * - Subtle visual feedback
 * - Override capability when detection is wrong
 */

import type { BrushPoint } from './BrushAreaTool';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Result of zone detection for a brush stroke
 */
export interface DetectedZone {
  zoneId: string;
  zoneName: string;
  confidence: number; // 0-1 scale
  category?: string;
}

/**
 * Zone definition with bounding box for efficient detection
 */
export interface ZoneDefinition {
  id: string;
  name: string;
  category: 'upper-face' | 'mid-face' | 'lower-face' | 'periorbital' | 'body';
  // Bounding box in SVG coordinates (based on 400x450 viewBox)
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  // Center point for distance calculations
  center: {
    x: number;
    y: number;
  };
  // Weight for overlapping zones (higher = preferred)
  priority: number;
}

// =============================================================================
// FACE ZONE DEFINITIONS
// =============================================================================

/**
 * Face zones with bounding boxes derived from CenteredFaceChart.tsx SVG paths
 * Coordinates are in SVG viewBox space (400x450)
 *
 * IMPORTANT: These coordinates are extracted directly from the FACE_ZONES
 * paths in CenteredFaceChart.tsx. When the face chart is updated, these
 * must be updated to match.
 *
 * The face SVG viewBox is 400x450:
 * - Face outline: roughly 70-330 X, 30-420 Y
 * - All zones are within these bounds
 */
export const FACE_ZONE_DEFINITIONS: ZoneDefinition[] = [
  // ==========================================================================
  // UPPER FACE - zones above the eyes
  // ==========================================================================
  {
    // Path: M 120 80 Q 200 40 280 80 L 280 120 Q 200 100 120 120 Z
    id: 'forehead',
    name: 'Forehead',
    category: 'upper-face',
    bounds: { minX: 120, maxX: 280, minY: 40, maxY: 120 },
    center: { x: 200, y: 80 },
    priority: 10,
  },
  {
    // Path: M 175 120 L 225 120 L 225 155 L 175 155 Z
    id: 'glabella',
    name: 'Glabella',
    category: 'upper-face',
    bounds: { minX: 175, maxX: 225, minY: 120, maxY: 155 },
    center: { x: 200, y: 137 },
    priority: 15, // Higher priority - smaller, more specific zone
  },
  {
    // Path: M 80 90 Q 100 80 120 85 L 120 150 Q 100 145 80 150 Z
    id: 'left-temple',
    name: 'Left Temple',
    category: 'upper-face',
    bounds: { minX: 80, maxX: 120, minY: 80, maxY: 150 },
    center: { x: 100, y: 115 },
    priority: 10,
  },
  {
    // Path: M 280 85 Q 300 80 320 90 L 320 150 Q 300 145 280 150 Z
    id: 'right-temple',
    name: 'Right Temple',
    category: 'upper-face',
    bounds: { minX: 280, maxX: 320, minY: 80, maxY: 150 },
    center: { x: 300, y: 115 },
    priority: 10,
  },

  // ==========================================================================
  // PERIORBITAL - eye area zones
  // ==========================================================================
  {
    // Path: M 115 130 Q 150 115 180 130 L 175 150 Q 145 140 115 150 Z
    id: 'left-brow',
    name: 'Left Eyebrow',
    category: 'periorbital',
    bounds: { minX: 115, maxX: 180, minY: 115, maxY: 150 },
    center: { x: 147, y: 132 },
    priority: 12,
  },
  {
    // Path: M 220 130 Q 250 115 285 130 L 285 150 Q 255 140 225 150 Z
    id: 'right-brow',
    name: 'Right Eyebrow',
    category: 'periorbital',
    bounds: { minX: 220, maxX: 285, minY: 115, maxY: 150 },
    center: { x: 252, y: 132 },
    priority: 12,
  },
  {
    // Path: M 120 155 Q 150 150 175 155 Q 175 175 150 185 Q 120 175 120 155 Z
    id: 'left-eye',
    name: 'Left Eye Area',
    category: 'periorbital',
    bounds: { minX: 120, maxX: 175, minY: 150, maxY: 185 },
    center: { x: 147, y: 167 },
    priority: 14,
  },
  {
    // Path: M 225 155 Q 250 150 280 155 Q 280 175 250 185 Q 225 175 225 155 Z
    id: 'right-eye',
    name: 'Right Eye Area',
    category: 'periorbital',
    bounds: { minX: 225, maxX: 280, minY: 150, maxY: 185 },
    center: { x: 252, y: 167 },
    priority: 14,
  },
  {
    // Path: M 95 155 L 120 155 L 120 190 L 95 185 Z
    id: 'left-crow',
    name: "Left Crow's Feet",
    category: 'periorbital',
    bounds: { minX: 95, maxX: 120, minY: 155, maxY: 190 },
    center: { x: 107, y: 172 },
    priority: 15,
  },
  {
    // Path: M 280 155 L 305 155 L 305 185 L 280 190 Z
    id: 'right-crow',
    name: "Right Crow's Feet",
    category: 'periorbital',
    bounds: { minX: 280, maxX: 305, minY: 155, maxY: 190 },
    center: { x: 292, y: 172 },
    priority: 15,
  },

  // ==========================================================================
  // MID-FACE - nose and cheek zones
  // ==========================================================================
  {
    // Path: M 185 155 L 215 155 L 212 200 L 188 200 Z
    id: 'nose-bridge',
    name: 'Nose Bridge',
    category: 'mid-face',
    bounds: { minX: 185, maxX: 215, minY: 155, maxY: 200 },
    center: { x: 200, y: 177 },
    priority: 12,
  },
  {
    // Path: M 180 200 Q 200 195 220 200 Q 225 230 200 240 Q 175 230 180 200 Z
    id: 'nose-tip',
    name: 'Nose Tip',
    category: 'mid-face',
    bounds: { minX: 175, maxX: 225, minY: 195, maxY: 240 },
    center: { x: 200, y: 217 },
    priority: 13,
  },
  {
    // Path: M 95 190 Q 120 185 150 195 L 155 260 Q 120 270 100 250 Z
    id: 'left-cheek',
    name: 'Left Cheek',
    category: 'mid-face',
    bounds: { minX: 95, maxX: 155, minY: 185, maxY: 270 },
    center: { x: 125, y: 227 },
    priority: 8,
  },
  {
    // Path: M 250 195 Q 280 185 305 190 L 300 250 Q 280 270 245 260 Z
    id: 'right-cheek',
    name: 'Right Cheek',
    category: 'mid-face',
    bounds: { minX: 245, maxX: 305, minY: 185, maxY: 270 },
    center: { x: 275, y: 227 },
    priority: 8,
  },
  {
    // Path: M 155 240 L 175 240 L 165 295 L 145 290 Z
    id: 'left-nasolabial',
    name: 'Left Nasolabial Fold',
    category: 'mid-face',
    bounds: { minX: 145, maxX: 175, minY: 240, maxY: 295 },
    center: { x: 160, y: 267 },
    priority: 14,
  },
  {
    // Path: M 225 240 L 245 240 L 255 290 L 235 295 Z
    id: 'right-nasolabial',
    name: 'Right Nasolabial Fold',
    category: 'mid-face',
    bounds: { minX: 225, maxX: 255, minY: 240, maxY: 295 },
    center: { x: 240, y: 267 },
    priority: 14,
  },

  // ==========================================================================
  // LOWER FACE - lips, chin, and jawline
  // ==========================================================================
  {
    // Path: M 160 290 Q 200 280 240 290 L 235 310 Q 200 300 165 310 Z
    id: 'upper-lip',
    name: 'Upper Lip',
    category: 'lower-face',
    bounds: { minX: 160, maxX: 240, minY: 280, maxY: 310 },
    center: { x: 200, y: 295 },
    priority: 13,
  },
  {
    // Path: M 165 315 Q 200 310 235 315 L 230 340 Q 200 350 170 340 Z
    id: 'lower-lip',
    name: 'Lower Lip',
    category: 'lower-face',
    bounds: { minX: 165, maxX: 235, minY: 310, maxY: 350 },
    center: { x: 200, y: 330 },
    priority: 13,
  },
  {
    // Path: M 140 320 L 160 315 L 155 365 L 135 360 Z
    id: 'left-marionette',
    name: 'Left Marionette',
    category: 'lower-face',
    bounds: { minX: 135, maxX: 160, minY: 315, maxY: 365 },
    center: { x: 147, y: 340 },
    priority: 14,
  },
  {
    // Path: M 240 315 L 260 320 L 265 360 L 245 365 Z
    id: 'right-marionette',
    name: 'Right Marionette',
    category: 'lower-face',
    bounds: { minX: 240, maxX: 265, minY: 315, maxY: 365 },
    center: { x: 252, y: 340 },
    priority: 14,
  },
  {
    // Path: M 160 350 Q 200 345 240 350 Q 245 390 200 410 Q 155 390 160 350 Z
    id: 'chin',
    name: 'Chin',
    category: 'lower-face',
    bounds: { minX: 155, maxX: 245, minY: 345, maxY: 410 },
    center: { x: 200, y: 377 },
    priority: 10,
  },
  {
    // Path: M 100 260 L 140 270 L 145 360 Q 120 380 95 340 Z
    id: 'left-jawline',
    name: 'Left Jawline',
    category: 'lower-face',
    bounds: { minX: 95, maxX: 145, minY: 260, maxY: 380 },
    center: { x: 120, y: 320 },
    priority: 9,
  },
  {
    // Path: M 260 270 L 300 260 L 305 340 Q 280 380 255 360 Z
    id: 'right-jawline',
    name: 'Right Jawline',
    category: 'lower-face',
    bounds: { minX: 255, maxX: 305, minY: 260, maxY: 380 },
    center: { x: 280, y: 320 },
    priority: 9,
  },

  // ==========================================================================
  // COMPOSITE ZONE - Full Face
  // ==========================================================================
  {
    id: 'full-face',
    name: 'Full Face',
    category: 'mid-face', // Use mid-face as default category
    bounds: { minX: 70, maxX: 330, minY: 30, maxY: 420 },
    center: { x: 200, y: 225 },
    priority: 1, // Lowest priority - only matches if nothing else does
  },
];

// =============================================================================
// DETECTION UTILITIES
// =============================================================================

/**
 * Check if a point is within a zone's bounding box
 */
function isPointInZone(x: number, y: number, zone: ZoneDefinition): boolean {
  return (
    x >= zone.bounds.minX &&
    x <= zone.bounds.maxX &&
    y >= zone.bounds.minY &&
    y <= zone.bounds.maxY
  );
}

/**
 * Calculate distance from a point to a zone's center
 */
function distanceToZoneCenter(x: number, y: number, zone: ZoneDefinition): number {
  const dx = x - zone.center.x;
  const dy = y - zone.center.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the coverage ratio of stroke points within a zone
 */
function calculateZoneCoverage(
  points: BrushPoint[],
  zone: ZoneDefinition
): number {
  if (points.length === 0) return 0;

  const pointsInZone = points.filter((p) => isPointInZone(p.x, p.y, zone));
  return pointsInZone.length / points.length;
}

/**
 * Calculate the centroid of a set of brush points
 */
function calculateCentroid(points: BrushPoint[]): { x: number; y: number } {
  if (points.length === 0) return { x: 0, y: 0 };

  const sum = points.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );

  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
  };
}

// =============================================================================
// MAIN DETECTION FUNCTION
// =============================================================================

/**
 * Detect which zone a brush stroke primarily covers
 *
 * Algorithm:
 * 1. Calculate the centroid of the stroke
 * 2. Find all zones that contain the centroid
 * 3. Calculate coverage ratio for each candidate zone
 * 4. Score each zone based on coverage, distance to center, and priority
 * 5. Return the highest-scoring zone
 *
 * @param points - Array of brush points forming the stroke
 * @param canvasWidth - Width of the canvas (for coordinate normalization)
 * @param canvasHeight - Height of the canvas (for coordinate normalization)
 * @param zones - Optional custom zone definitions (defaults to FACE_ZONE_DEFINITIONS)
 * @returns DetectedZone or null if no zone detected
 */
export function detectZoneFromStroke(
  points: BrushPoint[],
  canvasWidth: number,
  canvasHeight: number,
  zones: ZoneDefinition[] = FACE_ZONE_DEFINITIONS
): DetectedZone | null {
  if (points.length === 0) return null;

  // Normalize points to SVG viewBox coordinates (400x450)
  const SVG_WIDTH = 400;
  const SVG_HEIGHT = 450;

  const normalizedPoints = points.map((p) => ({
    ...p,
    x: (p.x / canvasWidth) * SVG_WIDTH,
    y: (p.y / canvasHeight) * SVG_HEIGHT,
  }));

  // Calculate the centroid of the stroke
  const centroid = calculateCentroid(normalizedPoints);

  // Score each zone
  const zoneScores: Array<{ zone: ZoneDefinition; score: number; coverage: number }> = [];

  for (const zone of zones) {
    const coverage = calculateZoneCoverage(normalizedPoints, zone);
    const centroidInZone = isPointInZone(centroid.x, centroid.y, zone);
    const distanceToCenter = distanceToZoneCenter(centroid.x, centroid.y, zone);

    // Skip zones with no coverage and centroid outside
    if (coverage === 0 && !centroidInZone) continue;

    // Calculate score:
    // - Base score from coverage (0-50 points)
    // - Bonus for centroid being in zone (20 points)
    // - Priority bonus (0-15 points)
    // - Distance penalty (closer to center = better)
    let score = coverage * 50;
    if (centroidInZone) score += 20;
    score += zone.priority;
    score -= distanceToCenter * 0.1; // Small penalty for distance

    zoneScores.push({ zone, score, coverage });
  }

  // Sort by score descending
  zoneScores.sort((a, b) => b.score - a.score);

  // No zones matched
  if (zoneScores.length === 0) return null;

  // Return the top match
  const bestMatch = zoneScores[0];

  // Calculate confidence (0-1 scale)
  // Based on coverage and whether centroid is in zone
  const confidence = Math.min(
    1,
    bestMatch.coverage * 0.7 +
    (isPointInZone(centroid.x, centroid.y, bestMatch.zone) ? 0.3 : 0)
  );

  return {
    zoneId: bestMatch.zone.id,
    zoneName: bestMatch.zone.name,
    confidence: Math.round(confidence * 100) / 100,
    category: bestMatch.zone.category,
  };
}

/**
 * Detect multiple zones that a stroke covers (for strokes spanning multiple zones)
 * Returns zones sorted by coverage
 */
export function detectMultipleZones(
  points: BrushPoint[],
  canvasWidth: number,
  canvasHeight: number,
  minCoverage: number = 0.1,
  zones: ZoneDefinition[] = FACE_ZONE_DEFINITIONS
): DetectedZone[] {
  if (points.length === 0) return [];

  // Normalize points
  const SVG_WIDTH = 400;
  const SVG_HEIGHT = 450;

  const normalizedPoints = points.map((p) => ({
    ...p,
    x: (p.x / canvasWidth) * SVG_WIDTH,
    y: (p.y / canvasHeight) * SVG_HEIGHT,
  }));

  const detectedZones: DetectedZone[] = [];

  for (const zone of zones) {
    const coverage = calculateZoneCoverage(normalizedPoints, zone);

    if (coverage >= minCoverage) {
      detectedZones.push({
        zoneId: zone.id,
        zoneName: zone.name,
        confidence: Math.round(coverage * 100) / 100,
        category: zone.category,
      });
    }
  }

  // Sort by confidence descending
  return detectedZones.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get a zone definition by ID
 */
export function getZoneById(zoneId: string): ZoneDefinition | undefined {
  return FACE_ZONE_DEFINITIONS.find((z) => z.id === zoneId);
}

/**
 * Get all zones in a category
 */
export function getZonesByCategory(category: ZoneDefinition['category']): ZoneDefinition[] {
  return FACE_ZONE_DEFINITIONS.filter((z) => z.category === category);
}

/**
 * Get zone name by ID (convenience function)
 */
export function getZoneName(zoneId: string): string {
  return getZoneById(zoneId)?.name || 'Unknown Zone';
}
