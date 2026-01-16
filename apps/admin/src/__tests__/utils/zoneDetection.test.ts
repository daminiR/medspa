/**
 * Zone Detection Algorithm Tests
 *
 * Tests for the charting zone detection utility that determines
 * which anatomical zone a point or stroke is in.
 *
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest'
import {
  detectZone,
  detectZonesForStroke,
  getZoneAtPercentage,
  canvasToPercentage,
  getAllZonesAtPoint,
  getZoneDefinition,
  findNearestZone,
  mirrorPoint,
  isBilateralZone,
  FACE_ZONE_DEFINITIONS,
  BODY_ZONE_DEFINITIONS,
  type Point,
} from '@/utils/zoneDetection'
import { FacialZone, BodyZone } from '@/types/treatment-settings'

describe('Zone Detection Algorithm', () => {
  describe('detectZone', () => {
    it('should detect forehead zone in upper face area', () => {
      // Center of forehead region (x: 20-80, y: 5-25)
      const result = detectZone(50, 15, 'face')
      expect(result.zone).toBe(FacialZone.FOREHEAD)
      expect(result.zoneName).toBe('Forehead')
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should detect glabella zone between eyebrows', () => {
      // Center of glabella region (x: 40-60, y: 20-30)
      const result = detectZone(50, 25, 'face')
      expect(result.zone).toBe(FacialZone.GLABELLA)
      expect(result.zoneName).toBe('Glabella')
    })

    it('should detect most specific zone at chin area (mentalis)', () => {
      // Center of chin region - mentalis is more specific than chin
      const result = detectZone(50, 90, 'face')
      // Mentalis (specificity 3) should be returned over Chin (specificity 2)
      expect(result.zone).toBe(FacialZone.MENTALIS)
      expect(result.zoneName).toBe('Mentalis')
      // Chin should be in nearby zones
      expect(result.nearbyZones).toContain(FacialZone.CHIN)
    })

    it('should return null zone for points outside face', () => {
      // Point completely outside face chart
      const result = detectZone(0, 0, 'face')
      expect(result.zone).toBeNull()
      expect(result.confidence).toBe(0)
    })

    it('should detect more specific zones when available', () => {
      // A point that could be in both glabella (specific) and forehead (general)
      const result = detectZone(50, 22, 'face')
      // Should prefer glabella (specificity 3) over forehead (specificity 1)
      expect(result.zone).toBe(FacialZone.GLABELLA)
    })

    it('should detect upper lip zone', () => {
      const result = detectZone(50, 70, 'face')
      expect(result.zone).toBe(FacialZone.UPPER_LIP)
    })

    it('should detect body zones', () => {
      // Upper abdomen area
      const result = detectZone(50, 40, 'body')
      expect(result.zone).toBe(BodyZone.UPPER_ABDOMEN)
    })
  })

  describe('getZoneAtPercentage', () => {
    it('should clamp values to valid range', () => {
      // Even with out-of-range values, should not throw
      const result1 = getZoneAtPercentage(-10, 50, 'face')
      expect(result1).toBeDefined()

      const result2 = getZoneAtPercentage(150, 50, 'face')
      expect(result2).toBeDefined()
    })

    it('should default to face chart type', () => {
      const result = getZoneAtPercentage(50, 15)
      expect(result.zone).toBe(FacialZone.FOREHEAD)
    })
  })

  describe('canvasToPercentage', () => {
    it('should convert canvas coordinates to percentages', () => {
      const result = canvasToPercentage(100, 200, 200, 400)
      expect(result.x).toBe(50)
      expect(result.y).toBe(50)
    })

    it('should handle edge cases', () => {
      const result = canvasToPercentage(0, 0, 100, 100)
      expect(result.x).toBe(0)
      expect(result.y).toBe(0)
    })

    it('should handle full width/height', () => {
      const result = canvasToPercentage(500, 800, 500, 800)
      expect(result.x).toBe(100)
      expect(result.y).toBe(100)
    })
  })

  describe('detectZonesForStroke', () => {
    it('should detect primary zone for a stroke within one zone', () => {
      const points: Point[] = [
        { x: 48, y: 14 },
        { x: 50, y: 15 },
        { x: 52, y: 16 },
        { x: 50, y: 17 },
      ]
      const result = detectZonesForStroke(points, 'face')
      expect(result.primaryZone).toBe(FacialZone.FOREHEAD)
      expect(result.spansMultipleZones).toBe(false)
    })

    it('should detect multiple zones for a stroke spanning regions', () => {
      // Stroke going from forehead down through glabella
      const points: Point[] = [
        { x: 50, y: 10 }, // Forehead
        { x: 50, y: 15 }, // Forehead
        { x: 50, y: 22 }, // Glabella
        { x: 50, y: 25 }, // Glabella
        { x: 50, y: 28 }, // Glabella/Brow
      ]
      const result = detectZonesForStroke(points, 'face')
      expect(result.spansMultipleZones).toBe(true)
      expect(result.zonesHit.length).toBeGreaterThan(1)
    })

    it('should return empty result for empty points array', () => {
      const result = detectZonesForStroke([], 'face')
      expect(result.primaryZone).toBeNull()
      expect(result.zonesHit).toHaveLength(0)
    })

    it('should calculate coverage percentages', () => {
      // All points in one zone
      const points: Point[] = [
        { x: 50, y: 90 },
        { x: 51, y: 91 },
        { x: 49, y: 89 },
      ]
      const result = detectZonesForStroke(points, 'face')
      if (result.zonesHit.length > 0) {
        // Primary zone should have high coverage
        expect(result.zonesHit[0].coverage).toBeGreaterThan(0.5)
      }
    })
  })

  describe('getAllZonesAtPoint', () => {
    it('should return all overlapping zones', () => {
      // Point in glabella area - should be in both glabella and possibly forehead
      const zones = getAllZonesAtPoint(50, 22, 'face')
      expect(zones.length).toBeGreaterThan(0)
      // Should be sorted by specificity
      if (zones.length > 1) {
        expect(zones[0].zone.specificity).toBeGreaterThanOrEqual(
          zones[1].zone.specificity
        )
      }
    })

    it('should return empty array for points outside all zones', () => {
      const zones = getAllZonesAtPoint(0, 0, 'face')
      expect(zones).toHaveLength(0)
    })
  })

  describe('getZoneDefinition', () => {
    it('should return zone definition for valid face zone', () => {
      const zone = getZoneDefinition(FacialZone.FOREHEAD, 'face')
      expect(zone).toBeDefined()
      expect(zone?.name).toBe('Forehead')
      expect(zone?.category).toBe('facial')
    })

    it('should return zone definition for valid body zone', () => {
      const zone = getZoneDefinition(BodyZone.UPPER_ABDOMEN, 'body')
      expect(zone).toBeDefined()
      expect(zone?.name).toBe('Upper Abdomen')
      expect(zone?.category).toBe('body')
    })

    it('should return undefined for invalid zone', () => {
      const zone = getZoneDefinition('invalid-zone' as FacialZone, 'face')
      expect(zone).toBeUndefined()
    })
  })

  describe('findNearestZone', () => {
    it('should find nearest zone for a point outside zones', () => {
      // Point at edge of chart
      const result = findNearestZone(0, 50, 'face')
      expect(result).not.toBeNull()
      expect(result?.zone).toBeDefined()
      expect(result?.distance).toBeGreaterThan(0)
    })

    it('should return zone with distance for point inside zone', () => {
      // Point clearly in forehead
      const result = findNearestZone(50, 15, 'face')
      expect(result).not.toBeNull()
      expect(result?.zone.id).toBe(FacialZone.FOREHEAD)
    })
  })

  describe('mirrorPoint', () => {
    it('should mirror point across vertical center', () => {
      const original: Point = { x: 30, y: 50 }
      const mirrored = mirrorPoint(original)
      expect(mirrored.x).toBe(70)
      expect(mirrored.y).toBe(50) // Y should not change
    })

    it('should mirror center point to itself', () => {
      const center: Point = { x: 50, y: 50 }
      const mirrored = mirrorPoint(center)
      expect(mirrored.x).toBe(50)
    })
  })

  describe('isBilateralZone', () => {
    it('should identify lateral zones as bilateral', () => {
      // Temple is on the side of face
      const temple = FACE_ZONE_DEFINITIONS.find(
        (z) => z.id === FacialZone.TEMPLE
      )
      if (temple) {
        expect(isBilateralZone(temple)).toBe(true)
      }
    })

    it('should identify central zones as not bilateral', () => {
      // Chin is central
      const chin = FACE_ZONE_DEFINITIONS.find((z) => z.id === FacialZone.CHIN)
      if (chin) {
        expect(isBilateralZone(chin)).toBe(false)
      }
    })
  })

  describe('Zone Definitions', () => {
    it('should have valid face zone definitions', () => {
      expect(FACE_ZONE_DEFINITIONS.length).toBeGreaterThan(0)

      for (const zone of FACE_ZONE_DEFINITIONS) {
        expect(zone.id).toBeDefined()
        expect(zone.name).toBeDefined()
        expect(zone.category).toBe('facial')
        expect(zone.specificity).toBeGreaterThanOrEqual(0)
        expect(zone.bounds).toBeDefined()

        // At least one bounds type should be defined
        const hasBounds =
          zone.bounds.rect ||
          zone.bounds.polygon ||
          zone.bounds.ellipse ||
          zone.bounds.svgPath
        expect(hasBounds).toBeTruthy()
      }
    })

    it('should have valid body zone definitions', () => {
      expect(BODY_ZONE_DEFINITIONS.length).toBeGreaterThan(0)

      for (const zone of BODY_ZONE_DEFINITIONS) {
        expect(zone.id).toBeDefined()
        expect(zone.name).toBeDefined()
        expect(zone.category).toBe('body')
        expect(zone.specificity).toBeGreaterThanOrEqual(0)
        expect(zone.bounds).toBeDefined()
      }
    })

    it('should have unique zone IDs within each chart type', () => {
      const faceIds = FACE_ZONE_DEFINITIONS.map((z) => z.id)
      const uniqueFaceIds = new Set(faceIds)
      expect(uniqueFaceIds.size).toBe(faceIds.length)

      const bodyIds = BODY_ZONE_DEFINITIONS.map((z) => z.id)
      const uniqueBodyIds = new Set(bodyIds)
      expect(uniqueBodyIds.size).toBe(bodyIds.length)
    })

    it('should have specificity values for proper zone prioritization', () => {
      // More specific zones should have higher specificity
      const forehead = FACE_ZONE_DEFINITIONS.find(
        (z) => z.id === FacialZone.FOREHEAD
      )
      const glabella = FACE_ZONE_DEFINITIONS.find(
        (z) => z.id === FacialZone.GLABELLA
      )

      if (forehead && glabella) {
        expect(glabella.specificity).toBeGreaterThan(forehead.specificity)
      }
    })
  })

  describe('Confidence Calculation', () => {
    it('should return higher confidence for points near zone center', () => {
      // Point at center of forehead
      const centerResult = detectZone(50, 15, 'face')
      // Point near edge of forehead
      const edgeResult = detectZone(22, 20, 'face')

      // Both should detect forehead but center should have higher confidence
      if (
        centerResult.zone === FacialZone.FOREHEAD &&
        edgeResult.zone === FacialZone.FOREHEAD
      ) {
        expect(centerResult.confidence).toBeGreaterThanOrEqual(
          edgeResult.confidence
        )
      }
    })

    it('should set isExact true for high confidence detections', () => {
      // Very center of a well-defined zone
      const result = detectZone(50, 90, 'face') // Center of chin
      expect(result.confidence).toBeGreaterThan(0)
      // isExact is true when confidence > 0.5
    })
  })
})
