// Re-export all types from stores for convenience
export type {
  InjectionPoint,
  FreehandAnnotation,
  TreatmentPhoto,
  SOAPNotes,
  Patient,
  TreatmentSession,
} from '../stores/chartingStore'

// Zone definitions matching admin app
export interface FaceZone {
  id: string
  name: string
  anatomicalName?: string
  category: 'upper' | 'periorbital' | 'mid' | 'lower' | 'jaw' | 'neck'
  x: number // percentage position
  y: number // percentage position
  defaultUnits?: number
  defaultVolume?: number
  recommendedDepth: string
  recommendedTechnique: string
}

export const FACE_ZONES: FaceZone[] = [
  // Upper Face
  { id: 'forehead-center', name: 'Forehead Center', anatomicalName: 'Frontalis (center)', category: 'upper', x: 50, y: 15, defaultUnits: 10, recommendedDepth: 'intramuscular', recommendedTechnique: 'serial-puncture' },
  { id: 'forehead-left', name: 'Forehead Left', anatomicalName: 'Frontalis (left)', category: 'upper', x: 35, y: 15, defaultUnits: 5, recommendedDepth: 'intramuscular', recommendedTechnique: 'serial-puncture' },
  { id: 'forehead-right', name: 'Forehead Right', anatomicalName: 'Frontalis (right)', category: 'upper', x: 65, y: 15, defaultUnits: 5, recommendedDepth: 'intramuscular', recommendedTechnique: 'serial-puncture' },
  { id: 'glabella', name: 'Glabella', anatomicalName: 'Procerus & Corrugator', category: 'upper', x: 50, y: 22, defaultUnits: 20, recommendedDepth: 'intramuscular', recommendedTechnique: 'serial-puncture' },

  // Periorbital
  { id: 'crows-feet-left', name: "Crow's Feet Left", anatomicalName: 'Orbicularis oculi (lateral)', category: 'periorbital', x: 25, y: 28, defaultUnits: 12, recommendedDepth: 'intradermal', recommendedTechnique: 'serial-puncture' },
  { id: 'crows-feet-right', name: "Crow's Feet Right", anatomicalName: 'Orbicularis oculi (lateral)', category: 'periorbital', x: 75, y: 28, defaultUnits: 12, recommendedDepth: 'intradermal', recommendedTechnique: 'serial-puncture' },
  { id: 'under-eye-left', name: 'Under Eye Left', anatomicalName: 'Tear trough', category: 'periorbital', x: 38, y: 34, defaultVolume: 0.5, recommendedDepth: 'supraperiosteal', recommendedTechnique: 'linear-threading' },
  { id: 'under-eye-right', name: 'Under Eye Right', anatomicalName: 'Tear trough', category: 'periorbital', x: 62, y: 34, defaultVolume: 0.5, recommendedDepth: 'supraperiosteal', recommendedTechnique: 'linear-threading' },

  // Mid Face
  { id: 'cheek-left', name: 'Cheek Left', anatomicalName: 'Malar region', category: 'mid', x: 28, y: 42, defaultVolume: 1.0, recommendedDepth: 'supraperiosteal', recommendedTechnique: 'bolus' },
  { id: 'cheek-right', name: 'Cheek Right', anatomicalName: 'Malar region', category: 'mid', x: 72, y: 42, defaultVolume: 1.0, recommendedDepth: 'supraperiosteal', recommendedTechnique: 'bolus' },
  { id: 'nasolabial-left', name: 'Nasolabial Left', anatomicalName: 'Nasolabial fold', category: 'mid', x: 40, y: 52, defaultVolume: 0.8, recommendedDepth: 'deep-dermis', recommendedTechnique: 'linear-threading' },
  { id: 'nasolabial-right', name: 'Nasolabial Right', anatomicalName: 'Nasolabial fold', category: 'mid', x: 60, y: 52, defaultVolume: 0.8, recommendedDepth: 'deep-dermis', recommendedTechnique: 'linear-threading' },
  { id: 'bunny-lines-left', name: 'Bunny Lines Left', anatomicalName: 'Nasalis', category: 'mid', x: 43, y: 38, defaultUnits: 4, recommendedDepth: 'intradermal', recommendedTechnique: 'serial-puncture' },
  { id: 'bunny-lines-right', name: 'Bunny Lines Right', anatomicalName: 'Nasalis', category: 'mid', x: 57, y: 38, defaultUnits: 4, recommendedDepth: 'intradermal', recommendedTechnique: 'serial-puncture' },

  // Lower Face
  { id: 'lips-upper', name: 'Upper Lip', anatomicalName: 'Vermilion (upper)', category: 'lower', x: 50, y: 60, defaultVolume: 0.5, recommendedDepth: 'mid-dermis', recommendedTechnique: 'linear-threading' },
  { id: 'lips-lower', name: 'Lower Lip', anatomicalName: 'Vermilion (lower)', category: 'lower', x: 50, y: 66, defaultVolume: 0.5, recommendedDepth: 'mid-dermis', recommendedTechnique: 'linear-threading' },
  { id: 'marionette-left', name: 'Marionette Left', anatomicalName: 'Oral commissure', category: 'lower', x: 38, y: 68, defaultVolume: 0.5, recommendedDepth: 'deep-dermis', recommendedTechnique: 'fanning' },
  { id: 'marionette-right', name: 'Marionette Right', anatomicalName: 'Oral commissure', category: 'lower', x: 62, y: 68, defaultVolume: 0.5, recommendedDepth: 'deep-dermis', recommendedTechnique: 'fanning' },
  { id: 'chin', name: 'Chin', anatomicalName: 'Mentalis', category: 'lower', x: 50, y: 76, defaultVolume: 0.8, recommendedDepth: 'supraperiosteal', recommendedTechnique: 'bolus' },

  // Jaw & Masseter
  { id: 'jawline-left', name: 'Jawline Left', anatomicalName: 'Mandibular angle', category: 'jaw', x: 22, y: 62, defaultVolume: 1.0, recommendedDepth: 'supraperiosteal', recommendedTechnique: 'bolus' },
  { id: 'jawline-right', name: 'Jawline Right', anatomicalName: 'Mandibular angle', category: 'jaw', x: 78, y: 62, defaultVolume: 1.0, recommendedDepth: 'supraperiosteal', recommendedTechnique: 'bolus' },
  { id: 'masseter-left', name: 'Masseter Left', anatomicalName: 'Masseter muscle', category: 'jaw', x: 20, y: 52, defaultUnits: 25, recommendedDepth: 'intramuscular', recommendedTechnique: 'bolus' },
  { id: 'masseter-right', name: 'Masseter Right', anatomicalName: 'Masseter muscle', category: 'jaw', x: 80, y: 52, defaultUnits: 25, recommendedDepth: 'intramuscular', recommendedTechnique: 'bolus' },

  // Neck
  { id: 'platysma-left', name: 'Platysma Left', anatomicalName: 'Platysmal band', category: 'neck', x: 40, y: 88, defaultUnits: 15, recommendedDepth: 'intramuscular', recommendedTechnique: 'serial-puncture' },
  { id: 'platysma-right', name: 'Platysma Right', anatomicalName: 'Platysmal band', category: 'neck', x: 60, y: 88, defaultUnits: 15, recommendedDepth: 'intramuscular', recommendedTechnique: 'serial-puncture' },
]

// Product definitions
export interface Product {
  id: string
  name: string
  brand: string
  type: 'neurotoxin' | 'filler' | 'biostimulator'
  unitPrice: number
  color: string
}

export const PRODUCTS: Product[] = [
  // Neurotoxins
  { id: 'botox', name: 'Botox', brand: 'Allergan', type: 'neurotoxin', unitPrice: 14, color: '#8b5cf6' },
  { id: 'dysport', name: 'Dysport', brand: 'Galderma', type: 'neurotoxin', unitPrice: 5, color: '#6366f1' },
  { id: 'xeomin', name: 'Xeomin', brand: 'Merz', type: 'neurotoxin', unitPrice: 12, color: '#a855f7' },
  { id: 'jeuveau', name: 'Jeuveau', brand: 'Evolus', type: 'neurotoxin', unitPrice: 10, color: '#c084fc' },

  // Fillers
  { id: 'juvederm-ultra', name: 'Juvederm Ultra', brand: 'Allergan', type: 'filler', unitPrice: 500, color: '#ec4899' },
  { id: 'juvederm-voluma', name: 'Juvederm Voluma', brand: 'Allergan', type: 'filler', unitPrice: 650, color: '#f472b6' },
  { id: 'juvederm-vollure', name: 'Juvederm Vollure', brand: 'Allergan', type: 'filler', unitPrice: 550, color: '#fb7185' },
  { id: 'restylane', name: 'Restylane', brand: 'Galderma', type: 'filler', unitPrice: 500, color: '#f43f5e' },
  { id: 'restylane-lyft', name: 'Restylane Lyft', brand: 'Galderma', type: 'filler', unitPrice: 600, color: '#e11d48' },
  { id: 'radiesse', name: 'Radiesse', brand: 'Merz', type: 'filler', unitPrice: 700, color: '#be185d' },

  // Biostimulators
  { id: 'sculptra', name: 'Sculptra', brand: 'Galderma', type: 'biostimulator', unitPrice: 800, color: '#9333ea' },
]

// Injection depths
export interface InjectionDepth {
  id: string
  name: string
  depthMm: string
  description: string
  color: string
}

export const INJECTION_DEPTHS: InjectionDepth[] = [
  { id: 'superficial', name: 'Superficial', depthMm: '0.5-1mm', description: 'Epidermis/superficial dermis', color: '#fef3c7' },
  { id: 'intradermal', name: 'Intradermal', depthMm: '1-2mm', description: 'Within the dermis', color: '#fde68a' },
  { id: 'mid-dermis', name: 'Mid-Dermis', depthMm: '2-3mm', description: 'Middle layer of dermis', color: '#fcd34d' },
  { id: 'deep-dermis', name: 'Deep Dermis', depthMm: '3-4mm', description: 'Deep dermis', color: '#fbbf24' },
  { id: 'subcutaneous', name: 'Subcutaneous', depthMm: '4-6mm', description: 'Fat layer', color: '#f59e0b' },
  { id: 'supraperiosteal', name: 'Supraperiosteal', depthMm: '6-10mm', description: 'On top of bone', color: '#d97706' },
  { id: 'intramuscular', name: 'Intramuscular', depthMm: 'Variable', description: 'Within muscle tissue', color: '#b45309' },
]

// Injection techniques
export interface InjectionTechnique {
  id: string
  name: string
  description: string
  icon: string
}

export const INJECTION_TECHNIQUES: InjectionTechnique[] = [
  { id: 'serial-puncture', name: 'Serial Puncture', description: 'Multiple small injections in a row', icon: '•••' },
  { id: 'linear-threading', name: 'Linear Threading', description: 'Inject while withdrawing needle', icon: '→' },
  { id: 'fanning', name: 'Fanning', description: 'Fan-shaped distribution from single entry', icon: '⌘' },
  { id: 'cross-hatching', name: 'Cross-Hatching', description: 'Grid pattern of threads', icon: '#' },
  { id: 'bolus', name: 'Bolus', description: 'Single depot injection', icon: '●' },
  { id: 'micro-droplet', name: 'Micro-Droplet', description: 'Many tiny superficial deposits', icon: '::' },
]

// Needle gauges
export interface NeedleGauge {
  id: string
  gauge: string
  diameter: string
  color: string
  recommendedFor: string[]
}

export const NEEDLE_GAUGES: NeedleGauge[] = [
  { id: '27g', gauge: '27G', diameter: '0.41mm', color: '#94a3b8', recommendedFor: ['neurotoxin', 'thin filler'] },
  { id: '30g', gauge: '30G', diameter: '0.31mm', color: '#fbbf24', recommendedFor: ['neurotoxin', 'lips'] },
  { id: '31g', gauge: '31G', diameter: '0.26mm', color: '#22c55e', recommendedFor: ['neurotoxin', 'superficial'] },
  { id: '32g', gauge: '32G', diameter: '0.24mm', color: '#3b82f6', recommendedFor: ['neurotoxin', 'fine lines'] },
  { id: '25g-cannula', gauge: '25G Cannula', diameter: '38mm', color: '#ec4899', recommendedFor: ['filler', 'cheeks', 'jawline'] },
  { id: '27g-cannula', gauge: '27G Cannula', diameter: '25mm', color: '#f472b6', recommendedFor: ['filler', 'lips', 'under-eye'] },
]

// Photo angles with visual guide positions
export interface PhotoAngleGuide {
  id: string
  name: string
  angle: 'front' | 'left' | 'right' | '45-left' | '45-right' | 'top' | 'bottom'
  rotationHint: string
  icon: string
}

export const PHOTO_ANGLE_GUIDES: PhotoAngleGuide[] = [
  { id: 'front', name: 'Front View', angle: 'front', rotationHint: 'Face camera directly', icon: '👤' },
  { id: 'left', name: 'Left Profile', angle: 'left', rotationHint: 'Turn head 90° left', icon: '👈' },
  { id: 'right', name: 'Right Profile', angle: 'right', rotationHint: 'Turn head 90° right', icon: '👉' },
  { id: '45-left', name: '45° Left', angle: '45-left', rotationHint: 'Turn head 45° left', icon: '↖️' },
  { id: '45-right', name: '45° Right', angle: '45-right', rotationHint: 'Turn head 45° right', icon: '↗️' },
]
