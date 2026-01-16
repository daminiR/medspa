/**
 * Treatment Presets - Comprehensive Default Values for Med Spa Treatments
 *
 * These presets represent industry-standard dosing, volumes, and parameters.
 * Always verify with manufacturer guidelines and individual patient needs.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface NeurotoxinPreset {
  id: string;
  brand: string;
  product: string;
  manufacturer: string;
  unitType: 'units' | 'speywood_units';
  conversionRatio?: number; // relative to Botox (e.g., Dysport 2.5-3:1)
  zones: NeurotoxinZone[];
  dilution: DilutionOption[];
  storage: string;
  reconstitutedStability: string;
}

export interface NeurotoxinZone {
  name: string;
  anatomicalRegion: string;
  defaultUnits: number;
  unitRange: [number, number];
  injectionPoints: number;
  unitsPerPoint?: number;
  notes?: string;
}

export interface DilutionOption {
  salineVolume: number; // mL
  unitsPerML: number;
  concentration: string;
  useCase: string;
}

export interface FillerPreset {
  id: string;
  brand: string;
  product: string;
  manufacturer: string;
  type: 'HA' | 'CaHA' | 'PLLA' | 'PCL';
  lidocaine: boolean;
  viscosity: 'low' | 'medium' | 'high' | 'very_high';
  gPrime: number; // elasticity measure in Pascals
  syringeSize: number; // mL
  areas: FillerArea[];
  depth: string;
  longevity: string;
  needleGauge: string;
  cannulaGauge?: string;
}

export interface FillerArea {
  name: string;
  defaultVolume: number; // mL
  volumeRange: [number, number];
  technique: string;
  depth: string;
  notes?: string;
}

export interface LaserPreset {
  id: string;
  category: string;
  type: string;
  wavelength: string;
  mechanism: string;
  indications: string[];
  parameters: LaserParameter[];
  skinTypes: string;
  cooling?: string;
  pulseWidths?: string[];
}

export interface LaserParameter {
  indication: string;
  fluence: { value: number; range: [number, number]; unit: string };
  pulseWidth: { value: number; range: [number, number]; unit: string };
  spotSize: { value: number; options: number[]; unit: string };
  frequency?: { value: number; range: [number, number]; unit: string };
  passes?: number;
  endpoint?: string;
  notes?: string;
}

export interface RFDevicePreset {
  id: string;
  brand: string;
  device: string;
  manufacturer: string;
  technology: string;
  mechanism: string;
  areas: RFTreatmentArea[];
  tips: RFTip[];
  contraindications: string[];
}

export interface RFTreatmentArea {
  name: string;
  tipSize: string;
  depth: { value: number; range: [number, number]; unit: string };
  energy: { value: number; range: [number, number]; unit: string };
  passes: number;
  pattern: string;
  notes?: string;
}

export interface RFTip {
  name: string;
  pins: number;
  size: string;
  useCase: string;
  maxDepth: number;
}

export interface SkinTreatmentPreset {
  id: string;
  category: string;
  name: string;
  type: string;
  protocols: SkinProtocol[];
  contraindications: string[];
  downtime: string;
  frequency: string;
}

export interface SkinProtocol {
  name: string;
  depth?: string;
  concentration?: string;
  duration?: string;
  passes?: number;
  settings?: Record<string, string | number>;
  skinTypes?: string;
  notes?: string;
}

export interface BiostimulatorPreset {
  id: string;
  brand: string;
  product: string;
  manufacturer: string;
  activeIngredient: string;
  mechanism: string;
  reconstitution: ReconstitutionOption[];
  areas: BiostimulatorArea[];
  sessionProtocol: string;
  longevity: string;
}

export interface ReconstitutionOption {
  name: string;
  diluentVolume: number;
  diluentType: string;
  lidocaineVolume?: number;
  useCase: string;
}

export interface BiostimulatorArea {
  name: string;
  volumePerSession: number;
  technique: string;
  depth: string;
  sessions: number;
  interval: string;
}

export interface ThreadPreset {
  id: string;
  brand: string;
  product: string;
  material: string;
  type: 'smooth' | 'barbed' | 'cog' | 'screw' | 'mesh';
  absorbable: boolean;
  duration: string;
  areas: ThreadArea[];
  gauges: string[];
  lengths: number[]; // mm
}

export interface ThreadArea {
  name: string;
  threadCount: [number, number];
  technique: string;
  depth: string;
  notes?: string;
}

export interface NeedleCannulaPreset {
  id: string;
  type: 'needle' | 'cannula';
  gauge: number;
  lengths: number[]; // mm
  color?: string;
  innerDiameter: number; // mm
  outerDiameter: number; // mm
  useCases: string[];
  compatibility: string[];
}

// ============================================================================
// NEUROTOXINS
// ============================================================================

export const NEUROTOXIN_PRESETS: NeurotoxinPreset[] = [
  {
    id: 'botox',
    brand: 'BOTOX',
    product: 'BOTOX Cosmetic (onabotulinumtoxinA)',
    manufacturer: 'Allergan/AbbVie',
    unitType: 'units',
    zones: [
      {
        name: 'Glabella (Frown Lines)',
        anatomicalRegion: 'Between eyebrows',
        defaultUnits: 20,
        unitRange: [15, 25],
        injectionPoints: 5,
        unitsPerPoint: 4,
        notes: 'Standard 5-point injection pattern'
      },
      {
        name: 'Forehead Lines',
        anatomicalRegion: 'Frontalis muscle',
        defaultUnits: 20,
        unitRange: [10, 30],
        injectionPoints: 5,
        unitsPerPoint: 4,
        notes: 'Adjust based on muscle mass; always treat glabella first'
      },
      {
        name: "Crow's Feet",
        anatomicalRegion: 'Lateral orbicularis oculi',
        defaultUnits: 24,
        unitRange: [12, 30],
        injectionPoints: 6,
        unitsPerPoint: 4,
        notes: '3 points per side, 1cm lateral to orbital rim'
      },
      {
        name: 'Bunny Lines',
        anatomicalRegion: 'Nasalis muscle',
        defaultUnits: 8,
        unitRange: [4, 12],
        injectionPoints: 2,
        unitsPerPoint: 4,
        notes: 'Inject at upper lateral nose'
      },
      {
        name: 'Lip Flip',
        anatomicalRegion: 'Orbicularis oris',
        defaultUnits: 6,
        unitRange: [4, 10],
        injectionPoints: 4,
        unitsPerPoint: 1.5,
        notes: 'Superficial injection at vermillion border'
      },
      {
        name: 'Gummy Smile',
        anatomicalRegion: 'Levator labii superioris alaeque nasi',
        defaultUnits: 4,
        unitRange: [2, 6],
        injectionPoints: 2,
        unitsPerPoint: 2,
        notes: 'Bilateral injection at nasal ala level'
      },
      {
        name: 'Masseter (Jawline Slimming)',
        anatomicalRegion: 'Masseter muscle',
        defaultUnits: 50,
        unitRange: [25, 60],
        injectionPoints: 6,
        unitsPerPoint: 8,
        notes: '25 units per side, 3 points in thickest part'
      },
      {
        name: 'Platysmal Bands',
        anatomicalRegion: 'Platysma muscle',
        defaultUnits: 30,
        unitRange: [20, 50],
        injectionPoints: 6,
        unitsPerPoint: 5,
        notes: 'Along visible bands when tensed'
      },
      {
        name: 'Chin Dimpling',
        anatomicalRegion: 'Mentalis muscle',
        defaultUnits: 8,
        unitRange: [4, 12],
        injectionPoints: 2,
        unitsPerPoint: 4,
        notes: 'Central chin, avoid lower injection'
      },
      {
        name: 'DAO (Downturned Mouth)',
        anatomicalRegion: 'Depressor anguli oris',
        defaultUnits: 6,
        unitRange: [4, 10],
        injectionPoints: 2,
        unitsPerPoint: 3,
        notes: '3 units per side at oral commissure'
      },
      {
        name: 'Hyperhidrosis (Underarms)',
        anatomicalRegion: 'Axillary region',
        defaultUnits: 100,
        unitRange: [50, 100],
        injectionPoints: 20,
        unitsPerPoint: 2.5,
        notes: '50 units per axilla, 10 injection points each'
      }
    ],
    dilution: [
      { salineVolume: 1.0, unitsPerML: 100, concentration: 'Standard', useCase: 'Precise dosing, experienced injectors' },
      { salineVolume: 2.0, unitsPerML: 50, concentration: 'Light', useCase: 'Most common for cosmetic use' },
      { salineVolume: 2.5, unitsPerML: 40, concentration: 'Medium', useCase: 'General cosmetic, good spread' },
      { salineVolume: 4.0, unitsPerML: 25, concentration: 'Dilute', useCase: 'Large areas, hyperhidrosis' }
    ],
    storage: 'Refrigerate at 2-8°C (36-46°F)',
    reconstitutedStability: '24 hours refrigerated (manufacturer), up to 4 weeks in practice'
  },
  {
    id: 'dysport',
    brand: 'Dysport',
    product: 'Dysport (abobotulinumtoxinA)',
    manufacturer: 'Galderma',
    unitType: 'speywood_units',
    conversionRatio: 2.5,
    zones: [
      {
        name: 'Glabella (Frown Lines)',
        anatomicalRegion: 'Between eyebrows',
        defaultUnits: 50,
        unitRange: [40, 60],
        injectionPoints: 5,
        unitsPerPoint: 10,
        notes: 'FDA-approved dose is 50 units'
      },
      {
        name: 'Forehead Lines',
        anatomicalRegion: 'Frontalis muscle',
        defaultUnits: 50,
        unitRange: [30, 60],
        injectionPoints: 5,
        unitsPerPoint: 10,
        notes: 'Greater diffusion than Botox'
      },
      {
        name: "Crow's Feet",
        anatomicalRegion: 'Lateral orbicularis oculi',
        defaultUnits: 60,
        unitRange: [30, 75],
        injectionPoints: 6,
        unitsPerPoint: 10,
        notes: 'May see faster onset'
      },
      {
        name: 'Bunny Lines',
        anatomicalRegion: 'Nasalis muscle',
        defaultUnits: 20,
        unitRange: [10, 30],
        injectionPoints: 2,
        unitsPerPoint: 10
      },
      {
        name: 'Lip Flip',
        anatomicalRegion: 'Orbicularis oris',
        defaultUnits: 10,
        unitRange: [6, 16],
        injectionPoints: 4,
        unitsPerPoint: 2.5
      },
      {
        name: 'Masseter (Jawline Slimming)',
        anatomicalRegion: 'Masseter muscle',
        defaultUnits: 120,
        unitRange: [60, 150],
        injectionPoints: 6,
        unitsPerPoint: 20,
        notes: '60 units per side'
      },
      {
        name: 'Platysmal Bands',
        anatomicalRegion: 'Platysma muscle',
        defaultUnits: 75,
        unitRange: [50, 100],
        injectionPoints: 6,
        unitsPerPoint: 12.5
      }
    ],
    dilution: [
      { salineVolume: 1.5, unitsPerML: 200, concentration: 'Standard', useCase: 'Precise cosmetic dosing' },
      { salineVolume: 2.5, unitsPerML: 120, concentration: 'Common', useCase: 'Standard cosmetic use' },
      { salineVolume: 3.0, unitsPerML: 100, concentration: 'Dilute', useCase: 'Larger treatment areas' }
    ],
    storage: 'Refrigerate at 2-8°C (36-46°F)',
    reconstitutedStability: '4 hours at room temp, 24 hours refrigerated'
  },
  {
    id: 'xeomin',
    brand: 'Xeomin',
    product: 'Xeomin (incobotulinumtoxinA)',
    manufacturer: 'Merz',
    unitType: 'units',
    zones: [
      {
        name: 'Glabella (Frown Lines)',
        anatomicalRegion: 'Between eyebrows',
        defaultUnits: 20,
        unitRange: [15, 25],
        injectionPoints: 5,
        unitsPerPoint: 4,
        notes: '1:1 conversion with Botox'
      },
      {
        name: 'Forehead Lines',
        anatomicalRegion: 'Frontalis muscle',
        defaultUnits: 20,
        unitRange: [10, 30],
        injectionPoints: 5,
        unitsPerPoint: 4
      },
      {
        name: "Crow's Feet",
        anatomicalRegion: 'Lateral orbicularis oculi',
        defaultUnits: 24,
        unitRange: [12, 30],
        injectionPoints: 6,
        unitsPerPoint: 4
      },
      {
        name: 'Bunny Lines',
        anatomicalRegion: 'Nasalis muscle',
        defaultUnits: 8,
        unitRange: [4, 12],
        injectionPoints: 2,
        unitsPerPoint: 4
      },
      {
        name: 'Lip Flip',
        anatomicalRegion: 'Orbicularis oris',
        defaultUnits: 6,
        unitRange: [4, 10],
        injectionPoints: 4,
        unitsPerPoint: 1.5
      },
      {
        name: 'Masseter (Jawline Slimming)',
        anatomicalRegion: 'Masseter muscle',
        defaultUnits: 50,
        unitRange: [25, 60],
        injectionPoints: 6,
        unitsPerPoint: 8
      }
    ],
    dilution: [
      { salineVolume: 1.0, unitsPerML: 100, concentration: 'Standard', useCase: 'Precise dosing' },
      { salineVolume: 2.0, unitsPerML: 50, concentration: 'Common', useCase: 'General cosmetic use' },
      { salineVolume: 2.5, unitsPerML: 40, concentration: 'Dilute', useCase: 'Larger areas' }
    ],
    storage: 'Room temperature (before reconstitution)',
    reconstitutedStability: '24 hours refrigerated'
  },
  {
    id: 'jeuveau',
    brand: 'Jeuveau',
    product: 'Jeuveau (prabotulinumtoxinA)',
    manufacturer: 'Evolus',
    unitType: 'units',
    zones: [
      {
        name: 'Glabella (Frown Lines)',
        anatomicalRegion: 'Between eyebrows',
        defaultUnits: 20,
        unitRange: [15, 25],
        injectionPoints: 5,
        unitsPerPoint: 4,
        notes: 'FDA-approved for glabellar lines only'
      },
      {
        name: 'Forehead Lines',
        anatomicalRegion: 'Frontalis muscle',
        defaultUnits: 20,
        unitRange: [10, 30],
        injectionPoints: 5,
        unitsPerPoint: 4,
        notes: 'Off-label but commonly used'
      },
      {
        name: "Crow's Feet",
        anatomicalRegion: 'Lateral orbicularis oculi',
        defaultUnits: 24,
        unitRange: [12, 30],
        injectionPoints: 6,
        unitsPerPoint: 4
      },
      {
        name: 'Lip Flip',
        anatomicalRegion: 'Orbicularis oris',
        defaultUnits: 6,
        unitRange: [4, 10],
        injectionPoints: 4,
        unitsPerPoint: 1.5
      },
      {
        name: 'Masseter (Jawline Slimming)',
        anatomicalRegion: 'Masseter muscle',
        defaultUnits: 50,
        unitRange: [25, 60],
        injectionPoints: 6,
        unitsPerPoint: 8
      }
    ],
    dilution: [
      { salineVolume: 1.0, unitsPerML: 100, concentration: 'Standard', useCase: 'Precise dosing' },
      { salineVolume: 2.0, unitsPerML: 50, concentration: 'Common', useCase: 'General cosmetic use' },
      { salineVolume: 2.5, unitsPerML: 40, concentration: 'Dilute', useCase: 'Larger areas' }
    ],
    storage: 'Refrigerate at 2-8°C (36-46°F)',
    reconstitutedStability: '24 hours refrigerated'
  },
  {
    id: 'daxxify',
    brand: 'Daxxify',
    product: 'Daxxify (daxibotulinumtoxinA)',
    manufacturer: 'Revance',
    unitType: 'units',
    zones: [
      {
        name: 'Glabella (Frown Lines)',
        anatomicalRegion: 'Between eyebrows',
        defaultUnits: 40,
        unitRange: [30, 50],
        injectionPoints: 5,
        unitsPerPoint: 8,
        notes: 'FDA-approved 40 units; longer duration 6-9 months'
      },
      {
        name: 'Forehead Lines',
        anatomicalRegion: 'Frontalis muscle',
        defaultUnits: 30,
        unitRange: [20, 40],
        injectionPoints: 5,
        unitsPerPoint: 6,
        notes: 'Off-label; use conservative dosing initially'
      },
      {
        name: "Crow's Feet",
        anatomicalRegion: 'Lateral orbicularis oculi',
        defaultUnits: 36,
        unitRange: [24, 48],
        injectionPoints: 6,
        unitsPerPoint: 6
      },
      {
        name: 'Masseter (Jawline Slimming)',
        anatomicalRegion: 'Masseter muscle',
        defaultUnits: 80,
        unitRange: [50, 100],
        injectionPoints: 6,
        unitsPerPoint: 13,
        notes: '40 units per side'
      }
    ],
    dilution: [
      { salineVolume: 1.8, unitsPerML: 50, concentration: 'Standard', useCase: 'Glabellar lines (FDA-approved)' },
      { salineVolume: 2.4, unitsPerML: 37.5, concentration: 'Dilute', useCase: 'Off-label areas' }
    ],
    storage: 'Refrigerate at 2-8°C (36-46°F)',
    reconstitutedStability: '4 hours at room temp, 24 hours refrigerated'
  }
];

// ============================================================================
// DERMAL FILLERS
// ============================================================================

export const FILLER_PRESETS: FillerPreset[] = [
  // JUVEDERM COLLECTION
  {
    id: 'juvederm-ultra',
    brand: 'Juvederm',
    product: 'Juvederm Ultra XC',
    manufacturer: 'Allergan/AbbVie',
    type: 'HA',
    lidocaine: true,
    viscosity: 'medium',
    gPrime: 180,
    syringeSize: 1.0,
    areas: [
      {
        name: 'Lips (Augmentation)',
        defaultVolume: 1.0,
        volumeRange: [0.5, 2.0],
        technique: 'Linear threading, serial puncture',
        depth: 'Submucosal',
        notes: 'FDA-approved for lip augmentation'
      },
      {
        name: 'Perioral Lines',
        defaultVolume: 0.5,
        volumeRange: [0.3, 1.0],
        technique: 'Serial puncture, cross-hatching',
        depth: 'Mid-dermis'
      },
      {
        name: 'Nasolabial Folds',
        defaultVolume: 1.0,
        volumeRange: [0.5, 1.5],
        technique: 'Linear threading, fanning',
        depth: 'Deep dermis to subcutis'
      }
    ],
    depth: 'Mid to deep dermis',
    longevity: '6-12 months',
    needleGauge: '27G or 30G',
    cannulaGauge: '25G'
  },
  {
    id: 'juvederm-ultra-plus',
    brand: 'Juvederm',
    product: 'Juvederm Ultra Plus XC',
    manufacturer: 'Allergan/AbbVie',
    type: 'HA',
    lidocaine: true,
    viscosity: 'high',
    gPrime: 260,
    syringeSize: 1.0,
    areas: [
      {
        name: 'Nasolabial Folds',
        defaultVolume: 1.0,
        volumeRange: [0.5, 2.0],
        technique: 'Linear threading, fanning',
        depth: 'Deep dermis to subcutis',
        notes: 'FDA-approved indication'
      },
      {
        name: 'Marionette Lines',
        defaultVolume: 0.8,
        volumeRange: [0.5, 1.5],
        technique: 'Linear threading',
        depth: 'Deep dermis'
      },
      {
        name: 'Chin Augmentation',
        defaultVolume: 1.0,
        volumeRange: [0.5, 2.0],
        technique: 'Bolus, linear threading',
        depth: 'Supraperiosteal'
      }
    ],
    depth: 'Deep dermis to subcutaneous',
    longevity: '12-18 months',
    needleGauge: '27G',
    cannulaGauge: '25G'
  },
  {
    id: 'juvederm-voluma',
    brand: 'Juvederm',
    product: 'Juvederm Voluma XC',
    manufacturer: 'Allergan/AbbVie',
    type: 'HA',
    lidocaine: true,
    viscosity: 'very_high',
    gPrime: 420,
    syringeSize: 1.0,
    areas: [
      {
        name: 'Cheeks/Midface',
        defaultVolume: 2.0,
        volumeRange: [1.0, 4.0],
        technique: 'Deep bolus, linear threading',
        depth: 'Supraperiosteal',
        notes: 'FDA-approved for cheek augmentation'
      },
      {
        name: 'Chin Augmentation',
        defaultVolume: 1.5,
        volumeRange: [0.5, 3.0],
        technique: 'Deep bolus',
        depth: 'Supraperiosteal',
        notes: 'FDA-approved indication'
      },
      {
        name: 'Temples',
        defaultVolume: 1.5,
        volumeRange: [1.0, 2.5],
        technique: 'Deep bolus, fanning',
        depth: 'Supraperiosteal'
      },
      {
        name: 'Jawline Contouring',
        defaultVolume: 2.0,
        volumeRange: [1.0, 4.0],
        technique: 'Linear threading, bolus',
        depth: 'Supraperiosteal'
      }
    ],
    depth: 'Supraperiosteal/Deep subcutaneous',
    longevity: '18-24 months',
    needleGauge: '27G',
    cannulaGauge: '22G-25G'
  },
  {
    id: 'juvederm-vollure',
    brand: 'Juvederm',
    product: 'Juvederm Vollure XC',
    manufacturer: 'Allergan/AbbVie',
    type: 'HA',
    lidocaine: true,
    viscosity: 'medium',
    gPrime: 220,
    syringeSize: 1.0,
    areas: [
      {
        name: 'Nasolabial Folds',
        defaultVolume: 1.0,
        volumeRange: [0.5, 1.5],
        technique: 'Linear threading',
        depth: 'Deep dermis',
        notes: 'VYCROSS technology for smooth integration'
      },
      {
        name: 'Marionette Lines',
        defaultVolume: 0.8,
        volumeRange: [0.4, 1.2],
        technique: 'Linear threading, serial puncture',
        depth: 'Deep dermis'
      },
      {
        name: 'Prejowl Sulcus',
        defaultVolume: 1.0,
        volumeRange: [0.5, 1.5],
        technique: 'Linear threading, fanning',
        depth: 'Subcutaneous'
      }
    ],
    depth: 'Deep dermis to superficial subcutis',
    longevity: '15-18 months',
    needleGauge: '27G-30G',
    cannulaGauge: '25G-27G'
  },
  {
    id: 'juvederm-volbella',
    brand: 'Juvederm',
    product: 'Juvederm Volbella XC',
    manufacturer: 'Allergan/AbbVie',
    type: 'HA',
    lidocaine: true,
    viscosity: 'low',
    gPrime: 120,
    syringeSize: 1.0,
    areas: [
      {
        name: 'Lips (Subtle Enhancement)',
        defaultVolume: 0.5,
        volumeRange: [0.25, 1.0],
        technique: 'Serial puncture, linear threading',
        depth: 'Submucosal',
        notes: 'Natural, subtle lip enhancement'
      },
      {
        name: 'Perioral Lines',
        defaultVolume: 0.3,
        volumeRange: [0.2, 0.6],
        technique: 'Blanching technique, serial puncture',
        depth: 'Superficial dermis'
      },
      {
        name: 'Under Eyes (Tear Troughs)',
        defaultVolume: 0.5,
        volumeRange: [0.3, 0.8],
        technique: 'Cannula technique, microdroplet',
        depth: 'Deep supraperiosteal',
        notes: 'Avoid superficial placement - Tyndall effect'
      }
    ],
    depth: 'Superficial to mid dermis',
    longevity: '12-15 months',
    needleGauge: '30G-32G',
    cannulaGauge: '27G'
  },
  // RESTYLANE COLLECTION
  {
    id: 'restylane',
    brand: 'Restylane',
    product: 'Restylane',
    manufacturer: 'Galderma',
    type: 'HA',
    lidocaine: true,
    viscosity: 'medium',
    gPrime: 280,
    syringeSize: 1.0,
    areas: [
      {
        name: 'Nasolabial Folds',
        defaultVolume: 1.0,
        volumeRange: [0.5, 2.0],
        technique: 'Serial puncture, linear threading',
        depth: 'Mid dermis'
      },
      {
        name: 'Lips',
        defaultVolume: 1.0,
        volumeRange: [0.5, 1.5],
        technique: 'Serial puncture, linear threading',
        depth: 'Submucosal'
      },
      {
        name: 'Under Eyes',
        defaultVolume: 0.5,
        volumeRange: [0.3, 0.8],
        technique: 'Cannula, microdroplet',
        depth: 'Supraperiosteal'
      }
    ],
    depth: 'Mid to deep dermis',
    longevity: '6-12 months',
    needleGauge: '27G-30G',
    cannulaGauge: '25G-27G'
  },
  {
    id: 'restylane-lyft',
    brand: 'Restylane',
    product: 'Restylane Lyft',
    manufacturer: 'Galderma',
    type: 'HA',
    lidocaine: true,
    viscosity: 'very_high',
    gPrime: 480,
    syringeSize: 1.0,
    areas: [
      {
        name: 'Cheeks/Midface',
        defaultVolume: 2.0,
        volumeRange: [1.0, 4.0],
        technique: 'Deep bolus injection',
        depth: 'Supraperiosteal',
        notes: 'FDA-approved for midface'
      },
      {
        name: 'Hands',
        defaultVolume: 2.0,
        volumeRange: [1.0, 3.0],
        technique: 'Bolus, linear threading',
        depth: 'Subcutaneous',
        notes: 'FDA-approved for dorsal hands'
      },
      {
        name: 'Temples',
        defaultVolume: 1.5,
        volumeRange: [1.0, 2.5],
        technique: 'Deep bolus',
        depth: 'Supraperiosteal'
      },
      {
        name: 'Jawline',
        defaultVolume: 2.0,
        volumeRange: [1.0, 4.0],
        technique: 'Linear threading, bolus',
        depth: 'Supraperiosteal'
      }
    ],
    depth: 'Deep dermis to supraperiosteal',
    longevity: '12-18 months',
    needleGauge: '27G',
    cannulaGauge: '22G-25G'
  },
  {
    id: 'restylane-defyne',
    brand: 'Restylane',
    product: 'Restylane Defyne',
    manufacturer: 'Galderma',
    type: 'HA',
    lidocaine: true,
    viscosity: 'medium',
    gPrime: 220,
    syringeSize: 1.0,
    areas: [
      {
        name: 'Nasolabial Folds',
        defaultVolume: 1.0,
        volumeRange: [0.5, 2.0],
        technique: 'Linear threading',
        depth: 'Deep dermis',
        notes: 'XpresHAn technology for natural movement'
      },
      {
        name: 'Marionette Lines',
        defaultVolume: 0.8,
        volumeRange: [0.5, 1.5],
        technique: 'Linear threading, fanning',
        depth: 'Deep dermis'
      },
      {
        name: 'Chin',
        defaultVolume: 1.0,
        volumeRange: [0.5, 2.0],
        technique: 'Bolus, linear threading',
        depth: 'Supraperiosteal',
        notes: 'FDA-approved for chin'
      }
    ],
    depth: 'Deep dermis',
    longevity: '12-18 months',
    needleGauge: '27G-30G',
    cannulaGauge: '25G'
  },
  {
    id: 'restylane-refyne',
    brand: 'Restylane',
    product: 'Restylane Refyne',
    manufacturer: 'Galderma',
    type: 'HA',
    lidocaine: true,
    viscosity: 'low',
    gPrime: 140,
    syringeSize: 1.0,
    areas: [
      {
        name: 'Nasolabial Folds (Moderate)',
        defaultVolume: 0.8,
        volumeRange: [0.5, 1.5],
        technique: 'Linear threading, serial puncture',
        depth: 'Mid dermis',
        notes: 'For subtle, natural correction'
      },
      {
        name: 'Marionette Lines (Mild)',
        defaultVolume: 0.5,
        volumeRange: [0.3, 1.0],
        technique: 'Linear threading',
        depth: 'Mid dermis'
      },
      {
        name: 'Perioral Area',
        defaultVolume: 0.5,
        volumeRange: [0.3, 0.8],
        technique: 'Serial puncture',
        depth: 'Mid dermis'
      }
    ],
    depth: 'Mid dermis',
    longevity: '12 months',
    needleGauge: '30G',
    cannulaGauge: '27G'
  },
  {
    id: 'restylane-kysse',
    brand: 'Restylane',
    product: 'Restylane Kysse',
    manufacturer: 'Galderma',
    type: 'HA',
    lidocaine: true,
    viscosity: 'medium',
    gPrime: 190,
    syringeSize: 1.0,
    areas: [
      {
        name: 'Lips (Augmentation)',
        defaultVolume: 1.0,
        volumeRange: [0.5, 1.5],
        technique: 'Serial puncture, linear threading',
        depth: 'Submucosal',
        notes: 'FDA-approved for lip augmentation and perioral lines'
      },
      {
        name: 'Vermillion Border',
        defaultVolume: 0.3,
        volumeRange: [0.2, 0.5],
        technique: 'Serial puncture',
        depth: 'Superficial submucosal'
      },
      {
        name: 'Perioral Lines',
        defaultVolume: 0.4,
        volumeRange: [0.2, 0.6],
        technique: 'Blanching technique',
        depth: 'Superficial dermis'
      }
    ],
    depth: 'Submucosal to dermis',
    longevity: '12 months',
    needleGauge: '30G',
    cannulaGauge: '27G'
  },
  {
    id: 'restylane-contour',
    brand: 'Restylane',
    product: 'Restylane Contour',
    manufacturer: 'Galderma',
    type: 'HA',
    lidocaine: true,
    viscosity: 'high',
    gPrime: 380,
    syringeSize: 1.0,
    areas: [
      {
        name: 'Cheeks',
        defaultVolume: 1.5,
        volumeRange: [1.0, 3.0],
        technique: 'Deep bolus, fanning',
        depth: 'Supraperiosteal',
        notes: 'FDA-approved for cheek augmentation'
      },
      {
        name: 'Midface Contour',
        defaultVolume: 1.5,
        volumeRange: [1.0, 2.5],
        technique: 'Bolus, linear threading',
        depth: 'Deep subcutaneous'
      }
    ],
    depth: 'Subcutaneous to supraperiosteal',
    longevity: '12-18 months',
    needleGauge: '27G',
    cannulaGauge: '25G'
  },
  {
    id: 'restylane-eyelight',
    brand: 'Restylane',
    product: 'Restylane Eyelight',
    manufacturer: 'Galderma',
    type: 'HA',
    lidocaine: true,
    viscosity: 'low',
    gPrime: 100,
    syringeSize: 0.5,
    areas: [
      {
        name: 'Under Eyes (Tear Troughs)',
        defaultVolume: 0.5,
        volumeRange: [0.3, 0.7],
        technique: 'Cannula microdroplet, bolus',
        depth: 'Deep supraperiosteal',
        notes: 'FDA-approved for undereye hollows'
      }
    ],
    depth: 'Deep to periosteum',
    longevity: '12-18 months',
    needleGauge: '30G (entry)',
    cannulaGauge: '25G-27G'
  },
  // RHA COLLECTION
  {
    id: 'rha-2',
    brand: 'RHA',
    product: 'RHA 2',
    manufacturer: 'Revance',
    type: 'HA',
    lidocaine: true,
    viscosity: 'low',
    gPrime: 130,
    syringeSize: 1.0,
    areas: [
      {
        name: 'Perioral Lines',
        defaultVolume: 0.5,
        volumeRange: [0.3, 0.8],
        technique: 'Serial puncture, blanching',
        depth: 'Superficial dermis',
        notes: 'Dynamic wrinkle treatment'
      },
      {
        name: 'Nasolabial Folds (Moderate)',
        defaultVolume: 0.8,
        volumeRange: [0.5, 1.2],
        technique: 'Linear threading',
        depth: 'Mid dermis'
      }
    ],
    depth: 'Superficial to mid dermis',
    longevity: '12-15 months',
    needleGauge: '30G-32G',
    cannulaGauge: '27G'
  },
  {
    id: 'rha-3',
    brand: 'RHA',
    product: 'RHA 3',
    manufacturer: 'Revance',
    type: 'HA',
    lidocaine: true,
    viscosity: 'medium',
    gPrime: 200,
    syringeSize: 1.0,
    areas: [
      {
        name: 'Nasolabial Folds',
        defaultVolume: 1.0,
        volumeRange: [0.5, 1.5],
        technique: 'Linear threading, fanning',
        depth: 'Deep dermis',
        notes: 'FDA-approved for dynamic facial wrinkles'
      },
      {
        name: 'Marionette Lines',
        defaultVolume: 0.8,
        volumeRange: [0.5, 1.2],
        technique: 'Linear threading',
        depth: 'Deep dermis'
      },
      {
        name: 'Lips',
        defaultVolume: 1.0,
        volumeRange: [0.5, 1.5],
        technique: 'Serial puncture, linear threading',
        depth: 'Submucosal'
      }
    ],
    depth: 'Deep dermis',
    longevity: '12-15 months',
    needleGauge: '27G-30G',
    cannulaGauge: '25G-27G'
  },
  {
    id: 'rha-4',
    brand: 'RHA',
    product: 'RHA 4',
    manufacturer: 'Revance',
    type: 'HA',
    lidocaine: true,
    viscosity: 'high',
    gPrime: 340,
    syringeSize: 1.0,
    areas: [
      {
        name: 'Cheeks',
        defaultVolume: 2.0,
        volumeRange: [1.0, 3.0],
        technique: 'Deep bolus, fanning',
        depth: 'Supraperiosteal',
        notes: 'FDA-approved for midface volume'
      },
      {
        name: 'Jawline',
        defaultVolume: 2.0,
        volumeRange: [1.0, 4.0],
        technique: 'Linear threading, bolus',
        depth: 'Supraperiosteal'
      },
      {
        name: 'Chin',
        defaultVolume: 1.5,
        volumeRange: [0.5, 2.5],
        technique: 'Deep bolus',
        depth: 'Supraperiosteal'
      }
    ],
    depth: 'Deep subcutaneous to supraperiosteal',
    longevity: '15-18 months',
    needleGauge: '27G',
    cannulaGauge: '22G-25G'
  },
  // REVANESSE VERSA
  {
    id: 'versa',
    brand: 'Revanesse',
    product: 'Revanesse Versa+',
    manufacturer: 'Prollenium',
    type: 'HA',
    lidocaine: true,
    viscosity: 'medium',
    gPrime: 240,
    syringeSize: 1.0,
    areas: [
      {
        name: 'Nasolabial Folds',
        defaultVolume: 1.0,
        volumeRange: [0.5, 2.0],
        technique: 'Linear threading, serial puncture',
        depth: 'Mid to deep dermis',
        notes: 'FDA-approved for moderate to severe facial wrinkles'
      },
      {
        name: 'Marionette Lines',
        defaultVolume: 0.8,
        volumeRange: [0.5, 1.5],
        technique: 'Linear threading',
        depth: 'Deep dermis'
      },
      {
        name: 'Lips',
        defaultVolume: 1.0,
        volumeRange: [0.5, 1.5],
        technique: 'Serial puncture, linear threading',
        depth: 'Submucosal'
      },
      {
        name: 'Cheeks',
        defaultVolume: 1.5,
        volumeRange: [1.0, 2.5],
        technique: 'Bolus, fanning',
        depth: 'Subcutaneous'
      }
    ],
    depth: 'Mid to deep dermis',
    longevity: '12 months',
    needleGauge: '27G-30G',
    cannulaGauge: '25G'
  }
];

// ============================================================================
// LASER DEVICES
// ============================================================================

export const LASER_PRESETS: LaserPreset[] = [
  {
    id: 'co2-fractional',
    category: 'Ablative Fractional',
    type: 'CO2 Fractional Laser',
    wavelength: '10,600 nm',
    mechanism: 'Water absorption, tissue vaporization',
    indications: ['Deep wrinkles', 'Acne scars', 'Skin resurfacing', 'Surgical scars', 'Photodamage'],
    skinTypes: 'Fitzpatrick I-IV (caution III-IV)',
    cooling: 'Integrated air cooling',
    parameters: [
      {
        indication: 'Mild Photodamage/Fine Lines',
        fluence: { value: 15, range: [10, 20], unit: 'mJ' },
        pulseWidth: { value: 1.0, range: [0.5, 2.0], unit: 'ms' },
        spotSize: { value: 120, options: [120, 300], unit: 'μm' },
        frequency: { value: 300, range: [100, 500], unit: 'Hz' },
        passes: 1,
        endpoint: 'Pinpoint bleeding, frosted appearance',
        notes: 'Coverage 10-15%'
      },
      {
        indication: 'Moderate Wrinkles/Acne Scars',
        fluence: { value: 30, range: [20, 40], unit: 'mJ' },
        pulseWidth: { value: 1.0, range: [0.5, 2.0], unit: 'ms' },
        spotSize: { value: 120, options: [120, 300], unit: 'μm' },
        frequency: { value: 300, range: [100, 500], unit: 'Hz' },
        passes: 2,
        endpoint: 'Uniform pinpoint bleeding',
        notes: 'Coverage 15-25%'
      },
      {
        indication: 'Deep Resurfacing/Severe Scars',
        fluence: { value: 50, range: [40, 70], unit: 'mJ' },
        pulseWidth: { value: 1.5, range: [1.0, 2.5], unit: 'ms' },
        spotSize: { value: 120, options: [120, 300], unit: 'μm' },
        frequency: { value: 250, range: [100, 400], unit: 'Hz' },
        passes: 2,
        endpoint: 'Visible tissue contraction',
        notes: 'Coverage 25-35%, consider regional anesthesia'
      }
    ]
  },
  {
    id: 'ipl',
    category: 'Non-Ablative',
    type: 'Intense Pulsed Light (IPL)',
    wavelength: '500-1200 nm (filtered)',
    mechanism: 'Selective photothermolysis - melanin and hemoglobin targets',
    indications: ['Photodamage', 'Vascular lesions', 'Pigmentation', 'Rosacea', 'Hair removal'],
    skinTypes: 'Fitzpatrick I-III',
    cooling: 'Contact cooling or cryogen spray',
    parameters: [
      {
        indication: 'Photodamage/Brown Spots',
        fluence: { value: 16, range: [12, 22], unit: 'J/cm²' },
        pulseWidth: { value: 20, range: [15, 30], unit: 'ms' },
        spotSize: { value: 15, options: [10, 15, 20], unit: 'mm' },
        endpoint: 'Immediate darkening of spots',
        notes: 'Use 515nm or 560nm cut-off filter'
      },
      {
        indication: 'Vascular/Telangiectasia',
        fluence: { value: 14, range: [10, 18], unit: 'J/cm²' },
        pulseWidth: { value: 25, range: [20, 35], unit: 'ms' },
        spotSize: { value: 10, options: [8, 10, 15], unit: 'mm' },
        endpoint: 'Vessel blanching or darkening',
        notes: 'Use 560nm or 590nm cut-off filter'
      },
      {
        indication: 'Rosacea',
        fluence: { value: 12, range: [8, 15], unit: 'J/cm²' },
        pulseWidth: { value: 30, range: [20, 40], unit: 'ms' },
        spotSize: { value: 15, options: [10, 15], unit: 'mm' },
        endpoint: 'Mild erythema',
        notes: 'Multiple passes, 560nm filter'
      },
      {
        indication: 'Hair Removal',
        fluence: { value: 20, range: [15, 35], unit: 'J/cm²' },
        pulseWidth: { value: 30, range: [20, 50], unit: 'ms' },
        spotSize: { value: 15, options: [10, 15, 20], unit: 'mm' },
        endpoint: 'Perifollicular edema',
        notes: '695nm or 755nm filter for dark hair'
      }
    ]
  },
  {
    id: 'ndyag-1064',
    category: 'Non-Ablative',
    type: 'Nd:YAG 1064nm',
    wavelength: '1064 nm',
    mechanism: 'Deep dermal heating, hemoglobin absorption',
    indications: ['Vascular lesions', 'Hair removal (dark skin)', 'Skin tightening', 'Leg veins', 'Deep pigment'],
    skinTypes: 'Fitzpatrick I-VI',
    cooling: 'Contact cooling or cryogen',
    pulseWidths: ['Long pulse (ms)', 'Q-switched (ns)'],
    parameters: [
      {
        indication: 'Leg Veins (1-3mm)',
        fluence: { value: 120, range: [80, 180], unit: 'J/cm²' },
        pulseWidth: { value: 30, range: [15, 50], unit: 'ms' },
        spotSize: { value: 3, options: [2, 3, 5, 6], unit: 'mm' },
        endpoint: 'Vessel spasm, darkening',
        notes: 'Trace vessel slowly, avoid overlap'
      },
      {
        indication: 'Facial Veins/Telangiectasia',
        fluence: { value: 100, range: [60, 140], unit: 'J/cm²' },
        pulseWidth: { value: 20, range: [10, 30], unit: 'ms' },
        spotSize: { value: 3, options: [2, 3, 5], unit: 'mm' },
        endpoint: 'Blanching',
        notes: 'Lower fluence for facial vessels'
      },
      {
        indication: 'Hair Removal (Skin Type IV-VI)',
        fluence: { value: 45, range: [30, 60], unit: 'J/cm²' },
        pulseWidth: { value: 30, range: [20, 50], unit: 'ms' },
        spotSize: { value: 10, options: [6, 10, 15], unit: 'mm' },
        endpoint: 'Perifollicular edema',
        notes: 'Safer for darker skin types'
      },
      {
        indication: 'Skin Tightening (Genesis)',
        fluence: { value: 14, range: [12, 16], unit: 'J/cm²' },
        pulseWidth: { value: 0.3, range: [0.3, 0.5], unit: 'ms' },
        spotSize: { value: 5, options: [5], unit: 'mm' },
        frequency: { value: 7, range: [5, 10], unit: 'Hz' },
        passes: 5000,
        endpoint: 'Tissue warming to 41-42°C',
        notes: 'Moving technique, 3-6 treatments'
      }
    ]
  },
  {
    id: 'alexandrite-755',
    category: 'Non-Ablative',
    type: 'Alexandrite 755nm',
    wavelength: '755 nm',
    mechanism: 'Melanin absorption, selective photothermolysis',
    indications: ['Hair removal', 'Pigmented lesions', 'Tattoo removal (green/blue)'],
    skinTypes: 'Fitzpatrick I-III',
    cooling: 'Cryogen spray or contact cooling',
    pulseWidths: ['Long pulse (ms)', 'Q-switched (ns)'],
    parameters: [
      {
        indication: 'Hair Removal - Fine Hair',
        fluence: { value: 18, range: [14, 22], unit: 'J/cm²' },
        pulseWidth: { value: 3, range: [3, 10], unit: 'ms' },
        spotSize: { value: 15, options: [12, 15, 18], unit: 'mm' },
        endpoint: 'Perifollicular edema, hair singe smell',
        notes: 'Most effective for light skin/dark hair'
      },
      {
        indication: 'Hair Removal - Coarse Hair',
        fluence: { value: 22, range: [18, 30], unit: 'J/cm²' },
        pulseWidth: { value: 10, range: [5, 20], unit: 'ms' },
        spotSize: { value: 18, options: [15, 18], unit: 'mm' },
        endpoint: 'Perifollicular edema',
        notes: 'Longer pulse for thicker hair'
      },
      {
        indication: 'Pigmented Lesions',
        fluence: { value: 6, range: [4, 10], unit: 'J/cm²' },
        pulseWidth: { value: 50, range: [50, 100], unit: 'ns' },
        spotSize: { value: 3, options: [2, 3, 4], unit: 'mm' },
        endpoint: 'Immediate whitening (frosting)',
        notes: 'Q-switched mode, test spot recommended'
      }
    ]
  },
  {
    id: 'pico-laser',
    category: 'Non-Ablative',
    type: 'Picosecond Laser',
    wavelength: '532nm, 755nm, 1064nm (wavelength dependent)',
    mechanism: 'Photomechanical (photoacoustic) effect',
    indications: ['Tattoo removal', 'Pigmented lesions', 'Acne scars', 'Skin rejuvenation', 'Melasma'],
    skinTypes: 'Fitzpatrick I-VI (wavelength dependent)',
    cooling: 'Contact cooling',
    parameters: [
      {
        indication: 'Tattoo Removal - Black Ink',
        fluence: { value: 2.5, range: [1.5, 4.0], unit: 'J/cm²' },
        pulseWidth: { value: 450, range: [300, 750], unit: 'ps' },
        spotSize: { value: 4, options: [3, 4, 5, 6], unit: 'mm' },
        endpoint: 'Immediate whitening (frosting)',
        notes: '1064nm wavelength, 4-6 week intervals'
      },
      {
        indication: 'Tattoo Removal - Red/Orange Ink',
        fluence: { value: 1.5, range: [0.8, 2.5], unit: 'J/cm²' },
        pulseWidth: { value: 375, range: [300, 550], unit: 'ps' },
        spotSize: { value: 3, options: [2, 3, 4], unit: 'mm' },
        endpoint: 'Immediate whitening',
        notes: '532nm wavelength'
      },
      {
        indication: 'Pigmentation/Melasma',
        fluence: { value: 0.7, range: [0.4, 1.2], unit: 'J/cm²' },
        pulseWidth: { value: 450, range: [300, 750], unit: 'ps' },
        spotSize: { value: 6, options: [6, 8], unit: 'mm' },
        passes: 3,
        endpoint: 'Mild erythema, no frosting',
        notes: 'Low fluence toning technique'
      },
      {
        indication: 'Skin Rejuvenation (FOCUS array)',
        fluence: { value: 0.6, range: [0.4, 1.0], unit: 'J/cm²' },
        pulseWidth: { value: 450, range: [300, 750], unit: 'ps' },
        spotSize: { value: 8, options: [6, 8, 10], unit: 'mm' },
        passes: 3,
        endpoint: 'Uniform erythema',
        notes: 'Diffractive lens array for collagen remodeling'
      }
    ]
  },
  {
    id: 'erbium-yag',
    category: 'Ablative',
    type: 'Erbium:YAG 2940nm',
    wavelength: '2940 nm',
    mechanism: 'Water absorption, precise tissue ablation',
    indications: ['Fine lines', 'Superficial resurfacing', 'Acne scars', 'Skin texture'],
    skinTypes: 'Fitzpatrick I-V',
    cooling: 'Not typically required',
    parameters: [
      {
        indication: 'Superficial Resurfacing',
        fluence: { value: 5, range: [3, 8], unit: 'J/cm²' },
        pulseWidth: { value: 0.25, range: [0.2, 0.5], unit: 'ms' },
        spotSize: { value: 7, options: [5, 7], unit: 'mm' },
        passes: 2,
        endpoint: 'Pink, moist appearance',
        notes: 'Minimal thermal damage, faster healing'
      },
      {
        indication: 'Medium Depth Resurfacing',
        fluence: { value: 12, range: [8, 18], unit: 'J/cm²' },
        pulseWidth: { value: 0.3, range: [0.25, 0.5], unit: 'ms' },
        spotSize: { value: 7, options: [5, 7], unit: 'mm' },
        passes: 3,
        endpoint: 'Pinpoint bleeding, chamois appearance',
        notes: 'Consider regional blocks'
      },
      {
        indication: 'Fractional Resurfacing',
        fluence: { value: 20, range: [10, 40], unit: 'mJ' },
        pulseWidth: { value: 0.25, range: [0.2, 0.5], unit: 'ms' },
        spotSize: { value: 250, options: [200, 250, 300], unit: 'μm' },
        passes: 2,
        endpoint: 'Pinpoint ablation pattern',
        notes: 'Coverage 10-20%'
      }
    ]
  }
];

// ============================================================================
// RF (RADIOFREQUENCY) DEVICES
// ============================================================================

export const RF_DEVICE_PRESETS: RFDevicePreset[] = [
  {
    id: 'morpheus8',
    brand: 'Morpheus8',
    device: 'Morpheus8',
    manufacturer: 'InMode',
    technology: 'Fractional RF Microneedling',
    mechanism: 'Bipolar RF energy delivered through microneedles for subdermal adipose remodeling',
    areas: [
      {
        name: 'Face - Standard',
        tipSize: '24-pin Prime',
        depth: { value: 3.0, range: [1.0, 4.0], unit: 'mm' },
        energy: { value: 40, range: [20, 60], unit: 'mJ' },
        passes: 2,
        pattern: '15% overlap',
        notes: 'Start conservative, build up'
      },
      {
        name: 'Face - Deep Treatment',
        tipSize: '24-pin Prime',
        depth: { value: 4.0, range: [3.0, 4.0], unit: 'mm' },
        energy: { value: 50, range: [40, 70], unit: 'mJ' },
        passes: 2,
        pattern: 'Cross-hatch pattern',
        notes: 'For fat remodeling, jowls'
      },
      {
        name: 'Neck',
        tipSize: '24-pin Prime',
        depth: { value: 2.5, range: [1.5, 3.0], unit: 'mm' },
        energy: { value: 35, range: [25, 45], unit: 'mJ' },
        passes: 2,
        pattern: 'Horizontal passes',
        notes: 'Careful over thyroid/trachea'
      },
      {
        name: 'Body - Abdomen',
        tipSize: '40-pin Body',
        depth: { value: 5.0, range: [4.0, 7.0], unit: 'mm' },
        energy: { value: 60, range: [45, 80], unit: 'mJ' },
        passes: 2,
        pattern: 'Grid pattern',
        notes: 'Morpheus8 Body tip for larger areas'
      },
      {
        name: 'Under Eyes',
        tipSize: '24-pin Prime',
        depth: { value: 1.0, range: [0.5, 1.5], unit: 'mm' },
        energy: { value: 20, range: [15, 30], unit: 'mJ' },
        passes: 1,
        pattern: 'Single pass',
        notes: 'Very conservative settings'
      },
      {
        name: 'Acne Scars',
        tipSize: '24-pin Prime',
        depth: { value: 3.5, range: [2.5, 4.0], unit: 'mm' },
        energy: { value: 45, range: [35, 55], unit: 'mJ' },
        passes: 2,
        pattern: 'Multiple angles',
        notes: '3-4 treatments, 4-6 weeks apart'
      }
    ],
    tips: [
      { name: 'Prime 12-pin', pins: 12, size: 'Small', useCase: 'Perioral, periorbital', maxDepth: 4 },
      { name: 'Prime 24-pin', pins: 24, size: 'Standard', useCase: 'Face, neck', maxDepth: 4 },
      { name: 'Resurfacing', pins: 24, size: 'Standard', useCase: 'Superficial treatment, texture', maxDepth: 0.5 },
      { name: 'Body 40-pin', pins: 40, size: 'Large', useCase: 'Body contouring', maxDepth: 7 }
    ],
    contraindications: ['Pacemaker/ICD', 'Metal implants in area', 'Active infection', 'Pregnancy', 'Accutane within 6 months']
  },
  {
    id: 'vivace',
    brand: 'Vivace',
    device: 'Vivace Ultra',
    manufacturer: 'Aesthetics Biomedical',
    technology: 'RF Microneedling with LED',
    mechanism: 'Bipolar RF energy with microneedling and optional LED therapy',
    areas: [
      {
        name: 'Face - Full',
        tipSize: '36-pin',
        depth: { value: 2.5, range: [0.5, 3.5], unit: 'mm' },
        energy: { value: 30, range: [15, 45], unit: 'W' },
        passes: 2,
        pattern: 'Overlapping stamps',
        notes: 'Add blue LED for acne, red for collagen'
      },
      {
        name: 'Neck',
        tipSize: '36-pin',
        depth: { value: 2.0, range: [1.0, 2.5], unit: 'mm' },
        energy: { value: 25, range: [15, 35], unit: 'W' },
        passes: 2,
        pattern: 'Horizontal',
        notes: 'Reduce energy near thyroid'
      },
      {
        name: 'Periorbital',
        tipSize: '36-pin',
        depth: { value: 0.8, range: [0.5, 1.5], unit: 'mm' },
        energy: { value: 15, range: [10, 25], unit: 'W' },
        passes: 1,
        pattern: 'Gentle stamps',
        notes: 'Very superficial, minimal energy'
      }
    ],
    tips: [
      { name: 'Standard 36-pin', pins: 36, size: 'Standard', useCase: 'Face and neck', maxDepth: 3.5 },
      { name: 'Precision 20-pin', pins: 20, size: 'Small', useCase: 'Periorbital, lips', maxDepth: 2.5 }
    ],
    contraindications: ['Pacemaker/ICD', 'Pregnancy', 'Active herpes', 'Keloid history', 'Blood thinners']
  },
  {
    id: 'secret-rf',
    brand: 'Secret RF',
    device: 'Secret RF',
    manufacturer: 'Cutera',
    technology: 'Fractional RF Microneedling',
    mechanism: 'Semi-insulated or non-insulated needles delivering RF at adjustable depths',
    areas: [
      {
        name: 'Face - Standard',
        tipSize: '64-pin SF',
        depth: { value: 2.5, range: [0.5, 3.5], unit: 'mm' },
        energy: { value: 50, range: [30, 70], unit: 'intensity level' },
        passes: 2,
        pattern: 'Overlapping grid',
        notes: 'Semi-insulated for dermis targeting'
      },
      {
        name: 'Neck',
        tipSize: '64-pin SF',
        depth: { value: 2.0, range: [1.0, 2.5], unit: 'mm' },
        energy: { value: 45, range: [30, 60], unit: 'intensity level' },
        passes: 2,
        pattern: 'Horizontal passes'
      },
      {
        name: 'Acne Scars',
        tipSize: '25-pin NI',
        depth: { value: 3.0, range: [2.0, 3.5], unit: 'mm' },
        energy: { value: 55, range: [40, 70], unit: 'intensity level' },
        passes: 2,
        pattern: 'Multiple directions',
        notes: 'Non-insulated for scar remodeling'
      },
      {
        name: 'Stretch Marks',
        tipSize: '64-pin SF',
        depth: { value: 2.5, range: [2.0, 3.5], unit: 'mm' },
        energy: { value: 50, range: [40, 65], unit: 'intensity level' },
        passes: 2,
        pattern: 'Follow striae direction'
      }
    ],
    tips: [
      { name: '64-pin SF', pins: 64, size: 'Standard', useCase: 'Face, body - dermal heating', maxDepth: 3.5 },
      { name: '25-pin NI', pins: 25, size: 'Standard', useCase: 'Scars, aggressive treatment', maxDepth: 3.5 },
      { name: '64-pin NI', pins: 64, size: 'Standard', useCase: 'Full thermal column', maxDepth: 3.5 }
    ],
    contraindications: ['Pacemaker', 'Metal implants', 'Pregnancy', 'Active infection', 'Isotretinoin use']
  },
  {
    id: 'thermage',
    brand: 'Thermage',
    device: 'Thermage FLX',
    manufacturer: 'Solta Medical',
    technology: 'Monopolar Radiofrequency',
    mechanism: 'Volumetric deep tissue heating for collagen remodeling',
    areas: [
      {
        name: 'Face - Full',
        tipSize: '4.0 Total Tip',
        depth: { value: 4.0, range: [2.5, 4.5], unit: 'mm' },
        energy: { value: 4.0, range: [2.5, 5.0], unit: 'REP level' },
        passes: 1,
        pattern: 'Grid stamping, no overlap',
        notes: '300-400 REPs typical for face'
      },
      {
        name: 'Eyes',
        tipSize: '0.25 Eye Tip',
        depth: { value: 2.5, range: [1.5, 3.0], unit: 'mm' },
        energy: { value: 3.5, range: [2.5, 4.5], unit: 'REP level' },
        passes: 1,
        pattern: 'Periorbital only',
        notes: '225 REPs typical, lid only with eye shield'
      },
      {
        name: 'Body - Abdomen',
        tipSize: '16.0 Body Tip',
        depth: { value: 5.0, range: [4.0, 6.0], unit: 'mm' },
        energy: { value: 4.5, range: [3.0, 5.5], unit: 'REP level' },
        passes: 1,
        pattern: 'Grid, systematic coverage',
        notes: '500-900 REPs depending on area'
      }
    ],
    tips: [
      { name: '4.0 Total Tip', pins: 0, size: '4cm²', useCase: 'Face', maxDepth: 4.3 },
      { name: '3.0 Total Tip', pins: 0, size: '3cm²', useCase: 'Smaller facial areas', maxDepth: 4.3 },
      { name: '0.25 Eye Tip', pins: 0, size: '0.25cm²', useCase: 'Periorbital', maxDepth: 2.4 },
      { name: '16.0 Body Tip', pins: 0, size: '16cm²', useCase: 'Body', maxDepth: 5.1 }
    ],
    contraindications: ['Pacemaker/ICD', 'Metal implants', 'Pregnancy', 'Active implants']
  },
  {
    id: 'profound-rf',
    brand: 'Profound RF',
    device: 'Profound RF',
    manufacturer: 'Candela',
    technology: 'Bipolar RF with Temperature Control',
    mechanism: 'Precise temperature control (67°C) for collagen, elastin, and HA production',
    areas: [
      {
        name: 'Lower Face/Jowls',
        tipSize: '5-pair electrode',
        depth: { value: 4.0, range: [3.0, 6.0], unit: 'mm' },
        energy: { value: 67, range: [65, 69], unit: '°C target' },
        passes: 1,
        pattern: 'Systematic coverage',
        notes: 'Single treatment protocol, 45 min/zone'
      },
      {
        name: 'Neck',
        tipSize: '5-pair electrode',
        depth: { value: 3.0, range: [2.0, 4.0], unit: 'mm' },
        energy: { value: 67, range: [65, 69], unit: '°C target' },
        passes: 1,
        pattern: 'Grid pattern',
        notes: 'Avoid midline, thyroid area'
      },
      {
        name: 'Cellulite',
        tipSize: '5-pair electrode',
        depth: { value: 5.0, range: [4.0, 8.0], unit: 'mm' },
        energy: { value: 67, range: [65, 69], unit: '°C target' },
        passes: 1,
        pattern: 'Treat cellulite pits',
        notes: 'FDA-cleared for cellulite'
      }
    ],
    tips: [
      { name: '5-pair electrode', pins: 10, size: '5 pairs', useCase: 'Face, neck, body', maxDepth: 8 }
    ],
    contraindications: ['Pacemaker', 'Metal implants', 'Pregnancy', 'Bleeding disorders', 'Active infection']
  }
];

// ============================================================================
// SKIN TREATMENTS
// ============================================================================

export const SKIN_TREATMENT_PRESETS: SkinTreatmentPreset[] = [
  {
    id: 'skinpen',
    category: 'Microneedling',
    name: 'SkinPen',
    type: 'Mechanical Microneedling',
    protocols: [
      {
        name: 'Face - Standard',
        depth: '1.0-1.5mm',
        passes: 3,
        settings: { speed: 'High', pattern: 'Cross-hatch' },
        notes: 'Apply serum during treatment'
      },
      {
        name: 'Face - Aggressive (Scars)',
        depth: '1.5-2.0mm',
        passes: 4,
        settings: { speed: 'Medium', pattern: 'Multi-directional' },
        notes: 'Pinpoint bleeding expected'
      },
      {
        name: 'Neck',
        depth: '0.5-1.0mm',
        passes: 2,
        settings: { speed: 'High', pattern: 'Horizontal' },
        notes: 'Thinner skin, reduce depth'
      },
      {
        name: 'Under Eyes',
        depth: '0.25-0.5mm',
        passes: 1,
        settings: { speed: 'High', pattern: 'Gentle' },
        notes: 'Very superficial, no bleeding'
      },
      {
        name: 'Stretch Marks',
        depth: '2.0-2.5mm',
        passes: 4,
        settings: { speed: 'Medium', pattern: 'Follow striae' },
        notes: 'Multiple treatments needed'
      }
    ],
    contraindications: ['Active acne', 'Herpes outbreak', 'Blood thinners', 'Keloid history', 'Active skin infection'],
    downtime: '1-3 days redness',
    frequency: '4-6 weeks apart, 3-6 treatments'
  },
  {
    id: 'chemical-peel-glycolic',
    category: 'Chemical Peel',
    name: 'Glycolic Acid Peel',
    type: 'AHA (Alpha Hydroxy Acid)',
    protocols: [
      {
        name: 'Superficial (20-35%)',
        concentration: '20-35%',
        duration: '1-3 minutes',
        skinTypes: 'All skin types',
        notes: 'No neutralization needed, minimal frosting'
      },
      {
        name: 'Medium (50-70%)',
        concentration: '50-70%',
        duration: '2-5 minutes',
        skinTypes: 'Fitzpatrick I-IV',
        notes: 'May see frosting, neutralize with water or bicarb'
      },
      {
        name: 'Buffered/Neutralized',
        concentration: '30% buffered',
        duration: '5-10 minutes',
        skinTypes: 'Sensitive skin',
        notes: 'Self-neutralizing formulas available'
      }
    ],
    contraindications: ['Isotretinoin (6 months)', 'Active herpes', 'Recent waxing', 'Open wounds', 'Pregnancy'],
    downtime: '1-7 days depending on depth',
    frequency: 'Every 2-4 weeks'
  },
  {
    id: 'chemical-peel-tca',
    category: 'Chemical Peel',
    name: 'TCA Peel (Trichloroacetic Acid)',
    type: 'Medium Depth Peel',
    protocols: [
      {
        name: 'Light TCA (10-20%)',
        concentration: '10-20%',
        duration: 'Until light frost',
        skinTypes: 'Fitzpatrick I-IV',
        notes: 'Superficial peeling, minimal downtime'
      },
      {
        name: 'Medium TCA (25-35%)',
        concentration: '25-35%',
        duration: 'Until white frost',
        skinTypes: 'Fitzpatrick I-III',
        notes: 'Full epidermal peel, 7-10 days healing'
      },
      {
        name: 'TCA CROSS (70-100%)',
        concentration: '70-100%',
        duration: 'Point application',
        skinTypes: 'Fitzpatrick I-IV',
        notes: 'Ice pick scars only, wooden applicator'
      },
      {
        name: 'Blue Peel (15-20% TCA)',
        concentration: '15-20%',
        duration: 'Multiple coats',
        skinTypes: 'Fitzpatrick I-IV',
        notes: 'Blue base for even application tracking'
      }
    ],
    contraindications: ['Pregnancy', 'Isotretinoin', 'Active infection', 'History of keloids', 'Recent facial surgery'],
    downtime: '7-14 days',
    frequency: 'Every 2-3 months for medium'
  },
  {
    id: 'vi-peel',
    category: 'Chemical Peel',
    name: 'VI Peel',
    type: 'Medium Depth Blend Peel',
    protocols: [
      {
        name: 'VI Peel Original',
        concentration: 'TCA, Retinoic Acid, Salicylic Acid, Phenol, Vitamin C',
        duration: 'Self-timed, leave on 4+ hours',
        skinTypes: 'All skin types including darker',
        notes: 'Great first medium peel, safe for Fitzpatrick I-VI'
      },
      {
        name: 'VI Peel Precision Plus',
        concentration: 'Original + Hydroquinone, Kojic Acid',
        duration: 'Self-timed',
        skinTypes: 'Fitzpatrick I-VI',
        notes: 'Hyperpigmentation, melasma'
      },
      {
        name: 'VI Peel Purify',
        concentration: 'Original + Benzoyl Peroxide, Salicylic Acid boost',
        duration: 'Self-timed',
        skinTypes: 'All skin types',
        notes: 'Acne-prone skin, active acne'
      },
      {
        name: 'VI Peel Advanced',
        concentration: 'Higher concentration actives',
        duration: 'Self-timed',
        skinTypes: 'Fitzpatrick I-IV',
        notes: 'Experienced patients, deeper results'
      }
    ],
    contraindications: ['Pregnancy/nursing', 'Active cold sores', 'Open wounds', 'Aspirin allergy (relative)'],
    downtime: '5-7 days peeling',
    frequency: 'Every 4-6 weeks initially'
  },
  {
    id: 'hydrafacial',
    category: 'Hydradermabrasion',
    name: 'HydraFacial',
    type: 'Hydradermabrasion with Serums',
    protocols: [
      {
        name: 'Signature HydraFacial',
        passes: 1,
        settings: {
          step1: 'Cleanse + Peel (ActiDerm)',
          step2: 'Extract + Hydrate (GlySal)',
          step3: 'Fuse + Protect (Antiox+)'
        },
        notes: '30-minute treatment'
      },
      {
        name: 'Deluxe HydraFacial',
        passes: 1,
        settings: {
          step1: 'Lymphatic drainage',
          step2: 'Full Signature',
          step3: 'LED light therapy',
          step4: 'Booster serum'
        },
        notes: '60-minute treatment with add-ons'
      },
      {
        name: 'Platinum HydraFacial',
        passes: 1,
        settings: {
          step1: 'Full Deluxe',
          step2: 'Perk lip treatment',
          step3: 'Perk eye treatment',
          step4: 'Premium booster'
        },
        notes: '90-minute comprehensive treatment'
      }
    ],
    contraindications: ['Active rashes', 'Sunburn', 'Rosacea flare (relative)'],
    downtime: 'None',
    frequency: 'Monthly for maintenance'
  },
  {
    id: 'dermaplaning',
    category: 'Mechanical Exfoliation',
    name: 'Dermaplaning',
    type: 'Manual Exfoliation',
    protocols: [
      {
        name: 'Standard Dermaplaning',
        passes: 1,
        settings: {
          blade: '#10 scalpel',
          angle: '45 degrees',
          direction: 'Short, feathering strokes'
        },
        notes: 'Stretch skin taut, avoid active acne'
      },
      {
        name: 'Dermaplaning + Peel',
        passes: 1,
        settings: {
          blade: '#10 scalpel',
          peel: 'Light glycolic or lactic',
          duration: '5-10 min peel'
        },
        notes: 'Enhances peel penetration'
      }
    ],
    contraindications: ['Active acne', 'Raised moles', 'Rosacea', 'Inflamed skin', 'Blood thinners'],
    downtime: 'None',
    frequency: 'Every 3-4 weeks'
  }
];

// ============================================================================
// BIOSTIMULATORS
// ============================================================================

export const BIOSTIMULATOR_PRESETS: BiostimulatorPreset[] = [
  {
    id: 'sculptra',
    brand: 'Sculptra',
    product: 'Sculptra Aesthetic',
    manufacturer: 'Galderma',
    activeIngredient: 'Poly-L-lactic acid (PLLA)',
    mechanism: 'Stimulates collagen production through foreign body response',
    reconstitution: [
      {
        name: 'Standard Facial',
        diluentVolume: 8,
        diluentType: 'Sterile water',
        lidocaineVolume: 2,
        useCase: 'Facial volume restoration'
      },
      {
        name: 'Dilute (Body/Buttocks)',
        diluentVolume: 10,
        diluentType: 'Sterile water',
        lidocaineVolume: 2,
        useCase: 'Hip dips, buttocks'
      },
      {
        name: 'Hyperdilute',
        diluentVolume: 20,
        diluentType: 'Sterile water + saline',
        lidocaineVolume: 2,
        useCase: 'Skin quality, large areas'
      }
    ],
    areas: [
      {
        name: 'Temples',
        volumePerSession: 1.5,
        technique: 'Deep bolus, fanning',
        depth: 'Supraperiosteal',
        sessions: 3,
        interval: '4-6 weeks'
      },
      {
        name: 'Cheeks/Midface',
        volumePerSession: 3.0,
        technique: 'Bolus, linear threading',
        depth: 'Subcutaneous/Supraperiosteal',
        sessions: 3,
        interval: '4-6 weeks'
      },
      {
        name: 'Jawline',
        volumePerSession: 2.0,
        technique: 'Linear threading',
        depth: 'Subcutaneous',
        sessions: 3,
        interval: '4-6 weeks'
      },
      {
        name: 'Hip Dips',
        volumePerSession: 4.0,
        technique: 'Fanning, cross-hatching',
        depth: 'Subcutaneous',
        sessions: 3,
        interval: '6-8 weeks'
      },
      {
        name: 'Buttocks',
        volumePerSession: 8.0,
        technique: 'Grid injection',
        depth: 'Subcutaneous',
        sessions: 4,
        interval: '6-8 weeks'
      }
    ],
    sessionProtocol: '3-4 sessions, 4-6 weeks apart',
    longevity: '2+ years'
  },
  {
    id: 'radiesse',
    brand: 'Radiesse',
    product: 'Radiesse',
    manufacturer: 'Merz',
    activeIngredient: 'Calcium Hydroxylapatite (CaHA)',
    mechanism: 'Immediate volume + collagen stimulation',
    reconstitution: [
      {
        name: 'Standard (1:1)',
        diluentVolume: 1.5,
        diluentType: 'Lidocaine 2%',
        useCase: 'Facial volumization, hands'
      },
      {
        name: 'Hyperdilute (1:2)',
        diluentVolume: 2.4,
        diluentType: 'Lidocaine + saline',
        useCase: 'Skin quality face/neck'
      },
      {
        name: 'Hyperdilute (1:4)',
        diluentVolume: 4.5,
        diluentType: 'Lidocaine + saline',
        useCase: 'Body biostimulation'
      },
      {
        name: 'Ultra Hyperdilute (1:6)',
        diluentVolume: 7.5,
        diluentType: 'Saline + Lidocaine',
        useCase: 'Large body areas'
      }
    ],
    areas: [
      {
        name: 'Cheeks (Standard)',
        volumePerSession: 1.5,
        technique: 'Deep bolus injection',
        depth: 'Supraperiosteal',
        sessions: 1,
        interval: 'Single treatment'
      },
      {
        name: 'Hands',
        volumePerSession: 1.5,
        technique: 'Bolus + massage',
        depth: 'Subcutaneous',
        sessions: 1,
        interval: 'FDA-approved indication'
      },
      {
        name: 'Face (Hyperdilute)',
        volumePerSession: 2.0,
        technique: 'Fanning, linear threading',
        depth: 'Deep dermis',
        sessions: 2,
        interval: '4-6 weeks'
      },
      {
        name: 'Neck (Hyperdilute)',
        volumePerSession: 1.5,
        technique: 'Linear threading, fanning',
        depth: 'Subcutaneous',
        sessions: 2,
        interval: '4-6 weeks'
      },
      {
        name: 'Arms (Hyperdilute)',
        volumePerSession: 3.0,
        technique: 'Grid injection',
        depth: 'Subcutaneous',
        sessions: 2,
        interval: '6-8 weeks'
      }
    ],
    sessionProtocol: '1-2 sessions for face, 2-3 for body',
    longevity: '12-18 months'
  }
];

// ============================================================================
// PDO THREADS
// ============================================================================

export const THREAD_PRESETS: ThreadPreset[] = [
  {
    id: 'novathreads-smooth',
    brand: 'NovaThreads',
    product: 'NovaThreads Smooth (Mono)',
    material: 'PDO (Polydioxanone)',
    type: 'smooth',
    absorbable: true,
    duration: '4-6 months dissolution, collagen lasting 12-15 months',
    areas: [
      {
        name: 'Forehead Lines',
        threadCount: [10, 20],
        technique: 'Cross-hatching pattern',
        depth: 'Subdermal',
        notes: 'Superficial placement for line smoothing'
      },
      {
        name: 'Crow\'s Feet',
        threadCount: [6, 10],
        technique: 'Fan pattern',
        depth: 'Subdermal',
        notes: 'Per side'
      },
      {
        name: 'Perioral Lines',
        threadCount: [10, 20],
        technique: 'Perpendicular to lines',
        depth: 'Subdermal'
      },
      {
        name: 'Neck Lines',
        threadCount: [20, 40],
        technique: 'Horizontal cross-hatch',
        depth: 'Subdermal'
      },
      {
        name: 'Cheek Skin Quality',
        threadCount: [20, 30],
        technique: 'Mesh pattern',
        depth: 'Subdermal',
        notes: 'Combined with lifting threads'
      }
    ],
    gauges: ['29G', '30G'],
    lengths: [30, 40, 50, 60]
  },
  {
    id: 'novathreads-twist',
    brand: 'NovaThreads',
    product: 'NovaThreads Twist (Screw)',
    material: 'PDO',
    type: 'screw',
    absorbable: true,
    duration: '4-6 months dissolution, 12-15 months collagen',
    areas: [
      {
        name: 'Nasolabial Folds',
        threadCount: [2, 4],
        technique: 'Linear placement',
        depth: 'Deep subdermal',
        notes: 'Per side'
      },
      {
        name: 'Marionette Lines',
        threadCount: [2, 4],
        technique: 'Along the fold',
        depth: 'Deep subdermal'
      },
      {
        name: 'Lip Border',
        threadCount: [4, 8],
        technique: 'Along vermillion',
        depth: 'Submucosal',
        notes: 'Volume boost without filler'
      },
      {
        name: 'Chin',
        threadCount: [2, 4],
        technique: 'Central placement',
        depth: 'Deep subdermal'
      }
    ],
    gauges: ['27G', '26G'],
    lengths: [50, 60, 70]
  },
  {
    id: 'mint-pdo-lifting',
    brand: 'MINT',
    product: 'MINT PDO Lifting Threads',
    material: 'PDO',
    type: 'cog',
    absorbable: true,
    duration: '6-8 months dissolution, 18-24 months lift',
    areas: [
      {
        name: 'Midface Lift',
        threadCount: [4, 8],
        technique: 'Entry at temporal hairline',
        depth: 'Subcutaneous/SMAS interface',
        notes: '2-4 threads per side, bi-directional barbs'
      },
      {
        name: 'Jowl Lift',
        threadCount: [4, 6],
        technique: 'Pre-auricular entry',
        depth: 'Subcutaneous',
        notes: '2-3 threads per side'
      },
      {
        name: 'Neck Lift',
        threadCount: [4, 8],
        technique: 'Submental approach',
        depth: 'Subcutaneous',
        notes: 'Platysmal repositioning'
      },
      {
        name: 'Brow Lift',
        threadCount: [2, 4],
        technique: 'Hairline entry, vertical vector',
        depth: 'Subcutaneous',
        notes: '1-2 threads per side'
      },
      {
        name: 'Jawline Definition',
        threadCount: [4, 6],
        technique: 'Mandibular border',
        depth: 'Subcutaneous',
        notes: '2-3 threads per side'
      }
    ],
    gauges: ['19G', '21G'],
    lengths: [100, 120, 140, 160]
  },
  {
    id: 'silhouette-instalift',
    brand: 'Silhouette InstaLift',
    product: 'Silhouette InstaLift',
    material: 'PLLA + PLGA (bioabsorbable cones)',
    type: 'cog',
    absorbable: true,
    duration: '18-24 months with collagen stimulation',
    areas: [
      {
        name: 'Midface Lift',
        threadCount: [4, 8],
        technique: 'Temple to midface vector',
        depth: 'Subcutaneous',
        notes: '2-4 threads per side, FDA-cleared'
      },
      {
        name: 'Lower Face',
        threadCount: [4, 6],
        technique: 'Pre-auricular to jowl',
        depth: 'Subcutaneous',
        notes: '2-3 threads per side'
      },
      {
        name: 'Neck',
        threadCount: [4, 8],
        technique: 'Superior to inferior vector',
        depth: 'Subcutaneous',
        notes: 'Platysma suspension'
      }
    ],
    gauges: ['23G cannula'],
    lengths: [230, 300]
  },
  {
    id: 'pdo-mesh',
    brand: 'PDO Mesh',
    product: 'PDO Mesh/Cage Threads',
    material: 'PDO',
    type: 'mesh',
    absorbable: true,
    duration: '4-6 months dissolution',
    areas: [
      {
        name: 'Under Eye',
        threadCount: [2, 4],
        technique: 'Horizontal placement',
        depth: 'Subdermal',
        notes: 'For crepey skin, dark circles'
      },
      {
        name: 'Neck Crepiness',
        threadCount: [4, 8],
        technique: 'Mesh pattern',
        depth: 'Subdermal'
      }
    ],
    gauges: ['29G', '30G'],
    lengths: [40, 50]
  }
];

// ============================================================================
// NEEDLES AND CANNULAS
// ============================================================================

export const NEEDLE_CANNULA_PRESETS: NeedleCannulaPreset[] = [
  // NEEDLES
  {
    id: 'needle-25g',
    type: 'needle',
    gauge: 25,
    lengths: [16, 25, 38],
    color: 'Orange',
    innerDiameter: 0.26,
    outerDiameter: 0.51,
    useCases: ['Deep filler injection', 'Bolus technique', 'Biostimulators'],
    compatibility: ['Voluma', 'Radiesse', 'Sculptra', 'RHA 4']
  },
  {
    id: 'needle-27g',
    type: 'needle',
    gauge: 27,
    lengths: [13, 19, 32, 38],
    color: 'Gray',
    innerDiameter: 0.21,
    outerDiameter: 0.41,
    useCases: ['Standard filler injection', 'Lip augmentation', 'Linear threading'],
    compatibility: ['Most HA fillers', 'Juvederm Ultra', 'Restylane', 'RHA 3']
  },
  {
    id: 'needle-30g',
    type: 'needle',
    gauge: 30,
    lengths: [6, 13, 25],
    color: 'Yellow',
    innerDiameter: 0.16,
    outerDiameter: 0.31,
    useCases: ['Precise injection', 'Perioral lines', 'Tear trough entry', 'Fine detail work'],
    compatibility: ['Low viscosity fillers', 'Volbella', 'Refyne', 'Skinvive']
  },
  {
    id: 'needle-32g',
    type: 'needle',
    gauge: 32,
    lengths: [4, 6, 13],
    color: 'N/A',
    innerDiameter: 0.11,
    outerDiameter: 0.24,
    useCases: ['Superficial injection', 'Blanching technique', 'Fine lines'],
    compatibility: ['Very low viscosity fillers', 'Mesotherapy']
  },
  {
    id: 'needle-34g',
    type: 'needle',
    gauge: 34,
    lengths: [4, 6],
    color: 'N/A',
    innerDiameter: 0.08,
    outerDiameter: 0.18,
    useCases: ['Mesotherapy', 'PRP', 'Superficial treatment'],
    compatibility: ['Liquids only', 'PRP', 'Mesotherapy cocktails']
  },
  // CANNULAS
  {
    id: 'cannula-22g',
    type: 'cannula',
    gauge: 22,
    lengths: [50, 70],
    innerDiameter: 0.41,
    outerDiameter: 0.72,
    useCases: ['Deep volume restoration', 'Cheek augmentation', 'Temple filling'],
    compatibility: ['Voluma', 'Lyft', 'RHA 4', 'Radiesse']
  },
  {
    id: 'cannula-25g',
    type: 'cannula',
    gauge: 25,
    lengths: [38, 50, 70],
    innerDiameter: 0.26,
    outerDiameter: 0.51,
    useCases: ['Standard facial filling', 'Nasolabial folds', 'Jawline', 'Marionettes'],
    compatibility: ['Most HA fillers', 'Voluma', 'Vollure', 'Defyne', 'RHA 3-4']
  },
  {
    id: 'cannula-27g',
    type: 'cannula',
    gauge: 27,
    lengths: [38, 50],
    innerDiameter: 0.21,
    outerDiameter: 0.41,
    useCases: ['Lip augmentation', 'Under eye', 'Delicate areas'],
    compatibility: ['Medium viscosity HA', 'Volbella', 'Restylane', 'RHA 2-3']
  },
  {
    id: 'cannula-30g',
    type: 'cannula',
    gauge: 30,
    lengths: [25, 38],
    innerDiameter: 0.16,
    outerDiameter: 0.31,
    useCases: ['Tear trough', 'Superficial placement', 'Periorbital'],
    compatibility: ['Low viscosity fillers', 'Volbella', 'Eyelight', 'RHA 2']
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getNeurotoxinByBrand(brand: string): NeurotoxinPreset | undefined {
  return NEUROTOXIN_PRESETS.find(n => n.brand.toLowerCase() === brand.toLowerCase());
}

export function getFillerByProduct(product: string): FillerPreset | undefined {
  return FILLER_PRESETS.find(f => f.product.toLowerCase().includes(product.toLowerCase()));
}

export function getFillersByViscosity(viscosity: FillerPreset['viscosity']): FillerPreset[] {
  return FILLER_PRESETS.filter(f => f.viscosity === viscosity);
}

export function getFillersByArea(area: string): FillerPreset[] {
  return FILLER_PRESETS.filter(f =>
    f.areas.some(a => a.name.toLowerCase().includes(area.toLowerCase()))
  );
}

export function getLaserByType(type: string): LaserPreset | undefined {
  return LASER_PRESETS.find(l => l.type.toLowerCase().includes(type.toLowerCase()));
}

export function getRFDeviceByBrand(brand: string): RFDevicePreset | undefined {
  return RF_DEVICE_PRESETS.find(r => r.brand.toLowerCase() === brand.toLowerCase());
}

export function getThreadsByType(type: ThreadPreset['type']): ThreadPreset[] {
  return THREAD_PRESETS.filter(t => t.type === type);
}

export function getNeedlesByGauge(gauge: number): NeedleCannulaPreset | undefined {
  return NEEDLE_CANNULA_PRESETS.find(n => n.type === 'needle' && n.gauge === gauge);
}

export function getCannulasByGauge(gauge: number): NeedleCannulaPreset | undefined {
  return NEEDLE_CANNULA_PRESETS.find(n => n.type === 'cannula' && n.gauge === gauge);
}

export function getAllTreatmentCategories(): string[] {
  return [
    'Neurotoxins',
    'Dermal Fillers',
    'Lasers',
    'RF Devices',
    'Skin Treatments',
    'Biostimulators',
    'PDO Threads',
    'Needles & Cannulas'
  ];
}

// ============================================================================
// EXPORTS
// ============================================================================

export const TREATMENT_PRESETS = {
  neurotoxins: NEUROTOXIN_PRESETS,
  fillers: FILLER_PRESETS,
  lasers: LASER_PRESETS,
  rfDevices: RF_DEVICE_PRESETS,
  skinTreatments: SKIN_TREATMENT_PRESETS,
  biostimulators: BIOSTIMULATOR_PRESETS,
  threads: THREAD_PRESETS,
  needlesCannulas: NEEDLE_CANNULA_PRESETS
};

export default TREATMENT_PRESETS;
