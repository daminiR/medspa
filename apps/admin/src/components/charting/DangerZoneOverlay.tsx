'use client';

/**
 * DangerZoneOverlay - Critical Safety Feature for Injectable Procedures
 *
 * This component displays anatomical danger zones on face charts to help
 * practitioners avoid injecting into high-risk areas that could cause:
 * - Vascular occlusion leading to potential blindness
 * - Tissue necrosis
 * - Nerve damage
 *
 * ANATOMICAL REFERENCE:
 * The facial danger zones are based on established aesthetic medicine literature
 * including the "triangle of death" and known vascular/nerve pathways.
 *
 * KEY DANGER AREAS:
 * 1. Glabella region - Supratrochlear and supraorbital arteries
 * 2. Nasal region - Angular artery, dorsal nasal artery
 * 3. Temple region - Temporal artery branches
 * 4. Infraorbital region - Infraorbital artery
 * 5. Periocular region - Multiple arterial anastomoses
 *
 * Color coding:
 * - Red: Major arteries (highest risk - DO NOT inject)
 * - Orange: Danger zones (caution - high risk areas)
 * - Yellow: Nerves (risk of numbness/weakness)
 */

import React, { useState, useCallback, useMemo } from 'react';
import { AlertTriangle, Eye, EyeOff, Info, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { DraggablePanel } from './DraggablePanel';

// =============================================================================
// TYPES
// =============================================================================

export type DangerZoneCategory = 'artery' | 'nerve' | 'danger-zone';

export interface AnatomicalStructure {
  id: string;
  name: string;
  category: DangerZoneCategory;
  description: string;
  clinicalNotes?: string;
  path: string; // SVG path data
  visible: boolean;
}

export interface DangerZoneOverlayProps {
  /** Whether the overlay is visible */
  isVisible: boolean;
  /** Callback to toggle visibility */
  onToggle: () => void;
  /** Gender for anatomical adjustments (positions slightly different) */
  gender?: 'male' | 'female';
  /** Optional opacity for the overlay (0-1) */
  opacity?: number;
  /** Whether to show the legend panel */
  showLegend?: boolean;
  /** Container dimensions for scaling */
  containerWidth?: number;
  containerHeight?: number;
}

// =============================================================================
// ANATOMICAL DATA - Based on Aesthetic Medicine Literature
// =============================================================================

/**
 * SVG paths are defined as percentages relative to a standard face chart
 * viewBox of 0 0 100 100. These are calibrated for the frontal face view.
 *
 * CRITICAL: These paths represent approximate locations based on
 * standard anatomical positioning. Individual patient anatomy varies.
 */

// Artery paths (Red - Highest Risk)
const ARTERY_PATHS: AnatomicalStructure[] = [
  {
    id: 'supratrochlear-l',
    name: 'Supratrochlear Artery (Left)',
    category: 'artery',
    description: 'Runs vertically from the medial brow into the forehead',
    clinicalNotes: 'Direct connection to ophthalmic artery. Risk of retrograde embolism causing blindness.',
    path: 'M 46 28 Q 45 24 45 20 Q 45 16 46 12',
    visible: true,
  },
  {
    id: 'supratrochlear-r',
    name: 'Supratrochlear Artery (Right)',
    category: 'artery',
    description: 'Runs vertically from the medial brow into the forehead',
    clinicalNotes: 'Direct connection to ophthalmic artery. Risk of retrograde embolism causing blindness.',
    path: 'M 54 28 Q 55 24 55 20 Q 55 16 54 12',
    visible: true,
  },
  {
    id: 'supraorbital-l',
    name: 'Supraorbital Artery (Left)',
    category: 'artery',
    description: 'Exits supraorbital foramen, courses superiorly and laterally',
    clinicalNotes: 'Anastomoses with supratrochlear. Injection here can cause vision impairment.',
    path: 'M 42 27 Q 40 22 38 17 Q 36 14 35 10',
    visible: true,
  },
  {
    id: 'supraorbital-r',
    name: 'Supraorbital Artery (Right)',
    category: 'artery',
    description: 'Exits supraorbital foramen, courses superiorly and laterally',
    clinicalNotes: 'Anastomoses with supratrochlear. Injection here can cause vision impairment.',
    path: 'M 58 27 Q 60 22 62 17 Q 64 14 65 10',
    visible: true,
  },
  {
    id: 'angular-l',
    name: 'Angular Artery (Left)',
    category: 'artery',
    description: 'Terminal branch of facial artery along the nose',
    clinicalNotes: 'CRITICAL: Connects to ophthalmic vessels. Nasal filler injections are high risk.',
    path: 'M 44 45 Q 44 40 44 36 Q 44 33 43 30',
    visible: true,
  },
  {
    id: 'angular-r',
    name: 'Angular Artery (Right)',
    category: 'artery',
    description: 'Terminal branch of facial artery along the nose',
    clinicalNotes: 'CRITICAL: Connects to ophthalmic vessels. Nasal filler injections are high risk.',
    path: 'M 56 45 Q 56 40 56 36 Q 56 33 57 30',
    visible: true,
  },
  {
    id: 'dorsal-nasal',
    name: 'Dorsal Nasal Artery',
    category: 'artery',
    description: 'Runs along the dorsum of the nose',
    clinicalNotes: 'High-risk area for filler. Compression or injection can cause nasal necrosis.',
    path: 'M 50 32 L 50 42',
    visible: true,
  },
  {
    id: 'temporal-l',
    name: 'Temporal Artery (Left)',
    category: 'artery',
    description: 'Superficial temporal artery in the temple region',
    clinicalNotes: 'Very superficial. Temple fillers must be deep to periosteum.',
    path: 'M 30 28 Q 28 24 27 20 Q 26 16 25 12',
    visible: true,
  },
  {
    id: 'temporal-r',
    name: 'Temporal Artery (Right)',
    category: 'artery',
    description: 'Superficial temporal artery in the temple region',
    clinicalNotes: 'Very superficial. Temple fillers must be deep to periosteum.',
    path: 'M 70 28 Q 72 24 73 20 Q 74 16 75 12',
    visible: true,
  },
  {
    id: 'facial-l',
    name: 'Facial Artery (Left)',
    category: 'artery',
    description: 'Main arterial supply to the face, crosses mandible',
    clinicalNotes: 'Deep injections near mandible can affect this artery.',
    path: 'M 36 58 Q 38 52 40 48 Q 42 46 44 45',
    visible: true,
  },
  {
    id: 'facial-r',
    name: 'Facial Artery (Right)',
    category: 'artery',
    description: 'Main arterial supply to the face, crosses mandible',
    clinicalNotes: 'Deep injections near mandible can affect this artery.',
    path: 'M 64 58 Q 62 52 60 48 Q 58 46 56 45',
    visible: true,
  },
  {
    id: 'labial-sup',
    name: 'Superior Labial Artery',
    category: 'artery',
    description: 'Runs within the upper lip',
    clinicalNotes: 'Lip filler injections must account for this vessel. Aspirate before injecting.',
    path: 'M 42 50 Q 46 49.5 50 49 Q 54 49.5 58 50',
    visible: true,
  },
  {
    id: 'labial-inf',
    name: 'Inferior Labial Artery',
    category: 'artery',
    description: 'Runs within the lower lip',
    clinicalNotes: 'Located 2-3mm below vermillion border. Risk of hematoma and necrosis.',
    path: 'M 44 53 Q 47 53.5 50 54 Q 53 53.5 56 53',
    visible: true,
  },
];

// Nerve paths (Yellow - Risk of numbness/weakness)
const NERVE_PATHS: AnatomicalStructure[] = [
  {
    id: 'supraorbital-nerve-l',
    name: 'Supraorbital Nerve (Left)',
    category: 'nerve',
    description: 'Provides sensation to forehead and scalp',
    clinicalNotes: 'Exit point at supraorbital notch. Trauma causes forehead numbness.',
    path: 'M 42 27 Q 41 25 40 23',
    visible: true,
  },
  {
    id: 'supraorbital-nerve-r',
    name: 'Supraorbital Nerve (Right)',
    category: 'nerve',
    description: 'Provides sensation to forehead and scalp',
    clinicalNotes: 'Exit point at supraorbital notch. Trauma causes forehead numbness.',
    path: 'M 58 27 Q 59 25 60 23',
    visible: true,
  },
  {
    id: 'supratrochlear-nerve-l',
    name: 'Supratrochlear Nerve (Left)',
    category: 'nerve',
    description: 'Sensation to medial forehead and upper eyelid',
    clinicalNotes: 'Runs with supratrochlear artery. Damage causes medial forehead numbness.',
    path: 'M 46 28 Q 45.5 26 45 24',
    visible: true,
  },
  {
    id: 'supratrochlear-nerve-r',
    name: 'Supratrochlear Nerve (Right)',
    category: 'nerve',
    description: 'Sensation to medial forehead and upper eyelid',
    clinicalNotes: 'Runs with supratrochlear artery. Damage causes medial forehead numbness.',
    path: 'M 54 28 Q 54.5 26 55 24',
    visible: true,
  },
  {
    id: 'infraorbital-nerve-l',
    name: 'Infraorbital Nerve (Left)',
    category: 'nerve',
    description: 'Exits infraorbital foramen, sensation to midface',
    clinicalNotes: 'Located ~1cm below orbital rim. Trauma causes cheek/upper lip numbness.',
    path: 'M 41 36 Q 40 38 39 40',
    visible: true,
  },
  {
    id: 'infraorbital-nerve-r',
    name: 'Infraorbital Nerve (Right)',
    category: 'nerve',
    description: 'Exits infraorbital foramen, sensation to midface',
    clinicalNotes: 'Located ~1cm below orbital rim. Trauma causes cheek/upper lip numbness.',
    path: 'M 59 36 Q 60 38 61 40',
    visible: true,
  },
  {
    id: 'mental-nerve-l',
    name: 'Mental Nerve (Left)',
    category: 'nerve',
    description: 'Exits mental foramen, sensation to chin and lower lip',
    clinicalNotes: 'Located at mandible. Damage causes chin/lower lip numbness.',
    path: 'M 42 56 Q 41 58 40 60',
    visible: true,
  },
  {
    id: 'mental-nerve-r',
    name: 'Mental Nerve (Right)',
    category: 'nerve',
    description: 'Exits mental foramen, sensation to chin and lower lip',
    clinicalNotes: 'Located at mandible. Damage causes chin/lower lip numbness.',
    path: 'M 58 56 Q 59 58 60 60',
    visible: true,
  },
  {
    id: 'temporal-branch-l',
    name: 'Temporal Branch of Facial Nerve (Left)',
    category: 'nerve',
    description: 'Motor nerve to frontalis muscle',
    clinicalNotes: 'Damage causes brow ptosis. Located in temple danger zone.',
    path: 'M 32 38 Q 30 34 28 30',
    visible: true,
  },
  {
    id: 'temporal-branch-r',
    name: 'Temporal Branch of Facial Nerve (Right)',
    category: 'nerve',
    description: 'Motor nerve to frontalis muscle',
    clinicalNotes: 'Damage causes brow ptosis. Located in temple danger zone.',
    path: 'M 68 38 Q 70 34 72 30',
    visible: true,
  },
  {
    id: 'marginal-mandibular-l',
    name: 'Marginal Mandibular Nerve (Left)',
    category: 'nerve',
    description: 'Motor nerve to depressor muscles',
    clinicalNotes: 'Damage causes asymmetric smile. Runs along mandible.',
    path: 'M 38 60 Q 40 62 42 64',
    visible: true,
  },
  {
    id: 'marginal-mandibular-r',
    name: 'Marginal Mandibular Nerve (Right)',
    category: 'nerve',
    description: 'Motor nerve to depressor muscles',
    clinicalNotes: 'Damage causes asymmetric smile. Runs along mandible.',
    path: 'M 62 60 Q 60 62 58 64',
    visible: true,
  },
];

// Danger zones (Orange - Areas requiring extra caution)
const DANGER_ZONES: AnatomicalStructure[] = [
  {
    id: 'glabella-zone',
    name: 'Glabella Danger Zone',
    category: 'danger-zone',
    description: 'High-risk area between eyebrows',
    clinicalNotes: 'CRITICAL: Part of "danger triangle". Multiple arterial anastomoses. Use low volumes, aspirate, inject slowly.',
    path: 'M 44 20 Q 44 24 44 28 Q 47 29 50 29 Q 53 29 56 28 Q 56 24 56 20 Q 53 19 50 19 Q 47 19 44 20 Z',
    visible: true,
  },
  {
    id: 'nasal-zone',
    name: 'Nasal Danger Zone',
    category: 'danger-zone',
    description: 'Nose - extremely high risk for vascular complications',
    clinicalNotes: 'HIGHEST RISK for blindness. Angular/dorsal nasal arteries connect to ophthalmic system. Consider alternatives to filler.',
    path: 'M 46 30 Q 44 34 44 38 Q 44 42 46 46 Q 48 48 50 48 Q 52 48 54 46 Q 56 42 56 38 Q 56 34 54 30 Q 52 28 50 28 Q 48 28 46 30 Z',
    visible: true,
  },
  {
    id: 'temple-zone-l',
    name: 'Temple Danger Zone (Left)',
    category: 'danger-zone',
    description: 'Temporal fossa - superficial vessels and nerves',
    clinicalNotes: 'Superficial temporal artery and temporal branch of facial nerve. Inject deep to periosteum only.',
    path: 'M 25 20 Q 28 24 30 28 Q 32 32 34 36 L 30 38 Q 26 34 24 30 Q 22 26 22 22 Z',
    visible: true,
  },
  {
    id: 'temple-zone-r',
    name: 'Temple Danger Zone (Right)',
    category: 'danger-zone',
    description: 'Temporal fossa - superficial vessels and nerves',
    clinicalNotes: 'Superficial temporal artery and temporal branch of facial nerve. Inject deep to periosteum only.',
    path: 'M 75 20 Q 72 24 70 28 Q 68 32 66 36 L 70 38 Q 74 34 76 30 Q 78 26 78 22 Z',
    visible: true,
  },
  {
    id: 'infraorbital-zone-l',
    name: 'Infraorbital Zone (Left)',
    category: 'danger-zone',
    description: 'Under-eye/tear trough region',
    clinicalNotes: 'Thin skin, infraorbital vessels close to surface. High risk of Tyndall effect, vascular occlusion.',
    path: 'M 38 30 Q 40 32 42 34 Q 42 36 40 38 Q 38 36 36 34 Q 36 32 38 30 Z',
    visible: true,
  },
  {
    id: 'infraorbital-zone-r',
    name: 'Infraorbital Zone (Right)',
    category: 'danger-zone',
    description: 'Under-eye/tear trough region',
    clinicalNotes: 'Thin skin, infraorbital vessels close to surface. High risk of Tyndall effect, vascular occlusion.',
    path: 'M 62 30 Q 60 32 58 34 Q 58 36 60 38 Q 62 36 64 34 Q 64 32 62 30 Z',
    visible: true,
  },
  {
    id: 'alar-zone-l',
    name: 'Alar/Nasolabial Zone (Left)',
    category: 'danger-zone',
    description: 'Nasal ala and nasolabial fold junction',
    clinicalNotes: 'Angular artery runs here. Filler can cause alar necrosis or vision loss.',
    path: 'M 42 42 Q 40 44 40 46 Q 42 48 44 48 Q 46 46 46 44 Q 44 42 42 42 Z',
    visible: true,
  },
  {
    id: 'alar-zone-r',
    name: 'Alar/Nasolabial Zone (Right)',
    category: 'danger-zone',
    description: 'Nasal ala and nasolabial fold junction',
    clinicalNotes: 'Angular artery runs here. Filler can cause alar necrosis or vision loss.',
    path: 'M 58 42 Q 60 44 60 46 Q 58 48 56 48 Q 54 46 54 44 Q 56 42 58 42 Z',
    visible: true,
  },
  {
    id: 'lip-zone',
    name: 'Lip Vascular Zone',
    category: 'danger-zone',
    description: 'Labial arteries within lip tissue',
    clinicalNotes: 'Superior and inferior labial arteries run 2-3mm from vermillion. Aspirate, inject superficially.',
    path: 'M 42 48 Q 46 47 50 47 Q 54 47 58 48 Q 58 55 56 56 Q 52 57 50 57 Q 48 57 44 56 Q 42 55 42 48 Z',
    visible: true,
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const getCategoryColor = (category: DangerZoneCategory): string => {
  switch (category) {
    case 'artery':
      return '#EF4444'; // Red
    case 'nerve':
      return '#EAB308'; // Yellow
    case 'danger-zone':
      return '#F97316'; // Orange
    default:
      return '#6B7280';
  }
};

const getCategoryLabel = (category: DangerZoneCategory): string => {
  switch (category) {
    case 'artery':
      return 'Major Arteries';
    case 'nerve':
      return 'Nerves';
    case 'danger-zone':
      return 'High-Risk Zones';
    default:
      return 'Unknown';
  }
};

// =============================================================================
// COMPONENT
// =============================================================================

export function DangerZoneOverlay({
  isVisible,
  onToggle,
  gender = 'female',
  opacity = 0.6,
  showLegend = true,
}: DangerZoneOverlayProps) {
  // State for controlling which categories are visible
  const [visibleCategories, setVisibleCategories] = useState<Record<DangerZoneCategory, boolean>>({
    artery: true,
    nerve: true,
    'danger-zone': true,
  });

  // State for legend panel
  const [legendExpanded, setLegendExpanded] = useState(true);

  // Combine all anatomical structures
  const allStructures = useMemo(() => {
    return [...ARTERY_PATHS, ...NERVE_PATHS, ...DANGER_ZONES];
  }, []);

  // Filter visible structures
  const visibleStructures = useMemo(() => {
    return allStructures.filter(
      structure => structure.visible && visibleCategories[structure.category]
    );
  }, [allStructures, visibleCategories]);

  // Toggle category visibility
  const toggleCategory = useCallback((category: DangerZoneCategory) => {
    setVisibleCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* SVG Overlay - Positioned absolutely over the face chart */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{ opacity }}
      >
        <defs>
          {/* Glow filter for arteries */}
          <filter id="artery-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Pattern for danger zones */}
          <pattern id="danger-pattern" patternUnits="userSpaceOnUse" width="2" height="2">
            <rect width="2" height="2" fill="rgba(249, 115, 22, 0.3)" />
            <circle cx="1" cy="1" r="0.5" fill="rgba(249, 115, 22, 0.5)" />
          </pattern>
        </defs>

        {/* Render danger zones first (background) */}
        {visibleCategories['danger-zone'] && DANGER_ZONES.filter(z => z.visible).map(zone => (
          <path
            key={zone.id}
            d={zone.path}
            fill={getCategoryColor('danger-zone')}
            fillOpacity={0.25}
            stroke={getCategoryColor('danger-zone')}
            strokeWidth="0.3"
            strokeOpacity={0.8}
            className="pointer-events-none transition-all"
          >
            <title>{zone.name}: {zone.description}</title>
          </path>
        ))}

        {/* Render nerves (middle layer) */}
        {visibleCategories['nerve'] && NERVE_PATHS.filter(n => n.visible).map(nerve => (
          <path
            key={nerve.id}
            d={nerve.path}
            fill="none"
            stroke={getCategoryColor('nerve')}
            strokeWidth="0.6"
            strokeLinecap="round"
            strokeDasharray="1,0.5"
            className="pointer-events-none transition-all"
          >
            <title>{nerve.name}: {nerve.description}</title>
          </path>
        ))}

        {/* Render arteries (top layer - most critical) */}
        {visibleCategories['artery'] && ARTERY_PATHS.filter(a => a.visible).map(artery => (
          <path
            key={artery.id}
            d={artery.path}
            fill="none"
            stroke={getCategoryColor('artery')}
            strokeWidth="0.8"
            strokeLinecap="round"
            filter="url(#artery-glow)"
            className="pointer-events-none transition-all"
          >
            <title>{artery.name}: {artery.description}</title>
          </path>
        ))}
      </svg>

      {/* Legend Panel */}
      {showLegend && (
        <DraggablePanel
          panelId="danger-zone-legend"
          initialPosition={{ x: 16, y: 150 }}
          title="Danger Zones"
          variant="dark"
          onCollapse={() => setLegendExpanded(!legendExpanded)}
          isCollapsed={!legendExpanded}
          minWidth={220}
          minHeight={legendExpanded ? 200 : 44}
        >
          <div className="space-y-3">
            {/* Warning Banner */}
            <div className="flex items-start gap-2 p-2 bg-red-900/30 rounded-lg border border-red-700/50">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-200">
                <span className="font-semibold">Safety Reminder:</span> Always aspirate before injecting. Use low volumes. Inject slowly.
              </p>
            </div>

            {/* Category Toggles */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Show/Hide</p>

              {/* Arteries Toggle */}
              <button
                onClick={() => toggleCategory('artery')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  visibleCategories.artery
                    ? 'bg-red-900/30 border border-red-700/50'
                    : 'bg-gray-800/50 border border-gray-700/50 opacity-50'
                }`}
              >
                <div
                  className="w-4 h-1 rounded-full"
                  style={{ backgroundColor: getCategoryColor('artery') }}
                />
                <span className="text-sm text-gray-200 flex-1 text-left">
                  {getCategoryLabel('artery')}
                </span>
                {visibleCategories.artery ? (
                  <Eye className="w-4 h-4 text-gray-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {/* Nerves Toggle */}
              <button
                onClick={() => toggleCategory('nerve')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  visibleCategories.nerve
                    ? 'bg-yellow-900/30 border border-yellow-700/50'
                    : 'bg-gray-800/50 border border-gray-700/50 opacity-50'
                }`}
              >
                <div
                  className="w-4 h-0.5 rounded-full"
                  style={{
                    backgroundColor: getCategoryColor('nerve'),
                    backgroundImage: 'repeating-linear-gradient(90deg, currentColor, currentColor 3px, transparent 3px, transparent 5px)',
                  }}
                />
                <span className="text-sm text-gray-200 flex-1 text-left">
                  {getCategoryLabel('nerve')}
                </span>
                {visibleCategories.nerve ? (
                  <Eye className="w-4 h-4 text-gray-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {/* Danger Zones Toggle */}
              <button
                onClick={() => toggleCategory('danger-zone')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  visibleCategories['danger-zone']
                    ? 'bg-orange-900/30 border border-orange-700/50'
                    : 'bg-gray-800/50 border border-gray-700/50 opacity-50'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-sm"
                  style={{
                    backgroundColor: `${getCategoryColor('danger-zone')}40`,
                    border: `1px solid ${getCategoryColor('danger-zone')}`,
                  }}
                />
                <span className="text-sm text-gray-200 flex-1 text-left">
                  {getCategoryLabel('danger-zone')}
                </span>
                {visibleCategories['danger-zone'] ? (
                  <Eye className="w-4 h-4 text-gray-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>

            {/* Quick Reference */}
            <div className="pt-2 border-t border-gray-700">
              <p className="text-xs text-gray-500 text-center">
                Hover over structures for tooltips
              </p>
            </div>
          </div>
        </DraggablePanel>
      )}
    </>
  );
}

// =============================================================================
// TOGGLE BUTTON COMPONENT
// =============================================================================

export interface DangerZoneToggleProps {
  isActive: boolean;
  onToggle: () => void;
  className?: string;
}

/**
 * Toggle button for enabling/disabling anatomical safety overlay
 * Shows arteries, nerves, and danger zones to prevent vascular complications
 * Can be placed in toolbar or settings panel
 */
export function DangerZoneToggle({ isActive, onToggle, className = '' }: DangerZoneToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg transition-all
        ${isActive
          ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 ring-2 ring-red-400/50'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }
        ${className}
      `}
      title={isActive
        ? 'Hide anatomical safety overlay'
        : 'Show anatomical safety overlay - displays arteries, nerves, and vascular danger zones to help prevent blindness and necrosis'
      }
      aria-pressed={isActive}
      aria-label={isActive
        ? 'Hide anatomical safety reference overlay'
        : 'Show anatomical safety reference - arteries (red), nerves (yellow), danger zones (orange)'
      }
    >
      <Shield className={`w-4 h-4 ${isActive ? 'text-white' : 'text-red-400'}`} />
      <span className="text-sm font-medium">
        {isActive ? 'Anatomy ON' : 'Anatomy'}
      </span>
    </button>
  );
}

// =============================================================================
// COMPACT TOGGLE FOR TOOLBAR
// =============================================================================

export interface DangerZoneIconToggleProps {
  isActive: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Compact icon-only toggle for space-constrained toolbars
 * Shows anatomical safety overlay (arteries, nerves, danger zones)
 */
export function DangerZoneIconToggle({
  isActive,
  onToggle,
  size = 'md',
  className = '',
}: DangerZoneIconToggleProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <button
      onClick={onToggle}
      className={`
        ${sizeClasses[size]}
        relative flex items-center justify-center rounded-lg transition-all
        ${isActive
          ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 ring-2 ring-red-400/50'
          : 'bg-gray-700/80 text-gray-300 hover:bg-gray-600 hover:text-white'
        }
        ${className}
      `}
      title={isActive
        ? 'Hide anatomical safety overlay'
        : 'Anatomical Safety: Show arteries (blindness risk), nerves (numbness), and danger zones on face chart'
      }
      aria-pressed={isActive}
      aria-label={isActive
        ? 'Hide anatomical safety reference'
        : 'Show anatomical safety reference - vascular danger zones to prevent complications'
      }
    >
      <Shield className={iconSizes[size]} />
      {isActive && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-300 rounded-full animate-pulse" />
      )}
    </button>
  );
}

// =============================================================================
// HOOK FOR MANAGING DANGER ZONE STATE
// =============================================================================

export interface UseDangerZoneStateReturn {
  isVisible: boolean;
  toggle: () => void;
  show: () => void;
  hide: () => void;
  opacity: number;
  setOpacity: (opacity: number) => void;
}

/**
 * Hook for managing danger zone overlay state
 * Can be used in parent components to control the overlay
 */
export function useDangerZoneState(initialVisible = false): UseDangerZoneStateReturn {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [opacity, setOpacity] = useState(0.6);

  const toggle = useCallback(() => setIsVisible(prev => !prev), []);
  const show = useCallback(() => setIsVisible(true), []);
  const hide = useCallback(() => setIsVisible(false), []);

  return {
    isVisible,
    toggle,
    show,
    hide,
    opacity,
    setOpacity,
  };
}

export default DangerZoneOverlay;
