/**
 * Treatment Settings Types - Medical Spa Platform
 *
 * Comprehensive type definitions for charting settings page covering ALL treatment types:
 * - Injectables (neurotoxins, fillers, biostimulators)
 * - Lasers (CO2, IPL, Nd:YAG, Alexandrite, etc.)
 * - RF Devices (Morpheus8, Thermage, etc.)
 * - Skin Treatments (microneedling, peels, hydrafacial)
 * - Body Contouring (CoolSculpting, Emsculpt)
 * - Threads (PDO, PLLA, PCL)
 * - IV Therapy (Myers, NAD+, vitamins)
 * - Weight Loss (Semaglutide, Tirzepatide)
 *
 * Based on professional med spa requirements and FDA compliance standards.
 */

// =============================================================================
// TREATMENT CATEGORIES
// =============================================================================

/**
 * Main treatment category enum - top-level classification
 */
export enum TreatmentCategory {
  INJECTABLES = 'injectables',
  LASERS = 'lasers',
  RF_DEVICES = 'rf_devices',
  SKIN_TREATMENTS = 'skin_treatments',
  BODY_CONTOURING = 'body_contouring',
  THREADS = 'threads',
  IV_THERAPY = 'iv_therapy',
  WEIGHT_LOSS = 'weight_loss',
}

/**
 * Injectable sub-categories
 */
export enum InjectableType {
  NEUROTOXIN = 'neurotoxin',
  FILLER = 'filler',
  BIOSTIMULATOR = 'biostimulator',
  ENZYME = 'enzyme', // Kybella, PCDC
  PRP_PRF = 'prp_prf',
  MESOTHERAPY = 'mesotherapy',
}

/**
 * Laser sub-categories
 */
export enum LaserType {
  CO2_FRACTIONAL = 'co2_fractional',
  CO2_ABLATIVE = 'co2_ablative',
  ERBIUM = 'erbium',
  IPL = 'ipl',
  ND_YAG = 'nd_yag',
  ALEXANDRITE = 'alexandrite',
  DIODE = 'diode',
  RUBY = 'ruby',
  PICO = 'pico',
  Q_SWITCHED = 'q_switched',
  VASCULAR = 'vascular',
  BBL = 'bbl', // BroadBand Light
  HALO = 'halo', // Hybrid fractional
}

/**
 * RF Device sub-categories
 */
export enum RFDeviceType {
  MORPHEUS8 = 'morpheus8',
  THERMAGE = 'thermage',
  PROFOUND = 'profound',
  VIVACE = 'vivace',
  SCARLET = 'scarlet',
  POTENZA = 'potenza',
  GENIUS = 'genius',
  SECRET_RF = 'secret_rf',
  AGNES = 'agnes',
  ENDYMED = 'endymed',
}

/**
 * Skin treatment sub-categories
 */
export enum SkinTreatmentType {
  MICRONEEDLING = 'microneedling',
  CHEMICAL_PEEL = 'chemical_peel',
  HYDRAFACIAL = 'hydrafacial',
  DERMAPLANING = 'dermaplaning',
  MICRODERMABRASION = 'microdermabrasion',
  OXYGEN_FACIAL = 'oxygen_facial',
  LED_THERAPY = 'led_therapy',
  ULTRASOUND = 'ultrasound', // Ultherapy
  PLASMA = 'plasma', // Plasma pen
  JET_PEEL = 'jet_peel',
}

/**
 * Body contouring sub-categories
 */
export enum BodyContouringType {
  COOLSCULPTING = 'coolsculpting',
  SCULPSURE = 'sculpsure',
  EMSCULPT = 'emsculpt',
  EMSCULPT_NEO = 'emsculpt_neo',
  VANQUISH = 'vanquish',
  TRUEBODY = 'truebody',
  KYBELLA_BODY = 'kybella_body',
  CELLULITE_RF = 'cellulite_rf',
  VELASHAPE = 'velashape',
  EMTONE = 'emtone',
  LYMPHATIC_MASSAGE = 'lymphatic_massage',
}

/**
 * Thread sub-categories
 */
export enum ThreadType {
  PDO_SMOOTH = 'pdo_smooth',
  PDO_BARBED = 'pdo_barbed',
  PDO_COG = 'pdo_cog',
  PDO_SCREW = 'pdo_screw',
  PLLA = 'plla', // Poly-L-lactic acid
  PCL = 'pcl', // Polycaprolactone
  SILHOUETTE_INSTALIFT = 'silhouette_instalift',
  NOVA_THREADS = 'nova_threads',
  MINT_THREADS = 'mint_threads',
}

/**
 * IV Therapy sub-categories
 */
export enum IVTherapyType {
  MYERS_COCKTAIL = 'myers_cocktail',
  NAD_PLUS = 'nad_plus',
  GLUTATHIONE = 'glutathione',
  VITAMIN_C = 'vitamin_c',
  B12 = 'b12',
  HYDRATION = 'hydration',
  IMMUNITY = 'immunity',
  BEAUTY = 'beauty',
  ATHLETIC = 'athletic',
  HANGOVER = 'hangover',
  CUSTOM = 'custom',
}

/**
 * Weight loss sub-categories
 */
export enum WeightLossType {
  SEMAGLUTIDE = 'semaglutide', // Ozempic, Wegovy
  TIRZEPATIDE = 'tirzepatide', // Mounjaro, Zepbound
  LIRAGLUTIDE = 'liraglutide', // Saxenda
  PHENTERMINE = 'phentermine',
  B12_LIPO = 'b12_lipo', // Lipotropic injections
  HCG = 'hcg',
  AOD_9604 = 'aod_9604', // Peptide
  CUSTOM_COMPOUND = 'custom_compound',
}

// =============================================================================
// TREATMENT ZONES
// =============================================================================

/**
 * Facial zones for precise treatment mapping
 */
export enum FacialZone {
  // Upper Face
  FOREHEAD = 'forehead',
  FOREHEAD_LATERAL = 'forehead_lateral',
  GLABELLA = 'glabella',
  BROW = 'brow',
  BROW_TAIL = 'brow_tail',
  TEMPLE = 'temple',

  // Periorbital
  UPPER_EYELID = 'upper_eyelid',
  LOWER_EYELID = 'lower_eyelid',
  CROWS_FEET = 'crows_feet',
  TEAR_TROUGH = 'tear_trough',
  UNDER_EYE = 'under_eye',

  // Mid Face
  NOSE_BRIDGE = 'nose_bridge',
  NOSE_TIP = 'nose_tip',
  BUNNY_LINES = 'bunny_lines',
  NASAL_ALAR = 'nasal_alar',
  CHEEK_APEX = 'cheek_apex',
  CHEEK_HOLLOW = 'cheek_hollow',
  ZYGOMA = 'zygoma',
  MALAR = 'malar',
  NASOLABIAL = 'nasolabial',

  // Lower Face
  UPPER_LIP = 'upper_lip',
  LOWER_LIP = 'lower_lip',
  LIP_BORDER = 'lip_border',
  CUPIDS_BOW = 'cupids_bow',
  PHILTRUM = 'philtrum',
  ORAL_COMMISSURE = 'oral_commissure',
  MARIONETTE = 'marionette',
  PERIORAL = 'perioral',
  CHIN = 'chin',
  CHIN_CREASE = 'chin_crease',
  PREJOWL = 'prejowl',
  JOWL = 'jowl',
  JAWLINE = 'jawline',
  MENTALIS = 'mentalis',

  // Neck
  NECK_ANTERIOR = 'neck_anterior',
  NECK_LATERAL = 'neck_lateral',
  PLATYSMA = 'platysma',
  SUBMENTAL = 'submental',

  // Other
  EAR_LOBE = 'ear_lobe',
  SCALP = 'scalp',
  FULL_FACE = 'full_face',
}

/**
 * Body zones for treatment mapping
 */
export enum BodyZone {
  // Upper Body
  DECOLLETAGE = 'decolletage',
  UPPER_CHEST = 'upper_chest',
  BREAST = 'breast',
  UPPER_ARM = 'upper_arm',
  ELBOW = 'elbow',
  FOREARM = 'forearm',
  HAND_DORSAL = 'hand_dorsal',
  HAND_PALMAR = 'hand_palmar',

  // Back
  UPPER_BACK = 'upper_back',
  MID_BACK = 'mid_back',
  LOWER_BACK = 'lower_back',
  BRA_FAT = 'bra_fat',

  // Abdomen
  UPPER_ABDOMEN = 'upper_abdomen',
  LOWER_ABDOMEN = 'lower_abdomen',
  UMBILICAL = 'umbilical',
  FLANK = 'flank',
  LOVE_HANDLES = 'love_handles',

  // Hip & Buttocks
  HIP = 'hip',
  BUTTOCK = 'buttock',
  BANANA_ROLL = 'banana_roll',

  // Thigh
  INNER_THIGH = 'inner_thigh',
  OUTER_THIGH = 'outer_thigh',
  ANTERIOR_THIGH = 'anterior_thigh',
  POSTERIOR_THIGH = 'posterior_thigh',
  KNEE = 'knee',

  // Lower Leg
  CALF = 'calf',
  ANKLE = 'ankle',
  FOOT = 'foot',

  // Full Areas
  FULL_BODY = 'full_body',
  FULL_ARM = 'full_arm',
  FULL_LEG = 'full_leg',
  BIKINI = 'bikini',
  BRAZILIAN = 'brazilian',
  UNDERARM = 'underarm',
}

/**
 * Treatment zone definition with metadata
 */
export interface TreatmentZone {
  id: string;
  name: string;
  displayName: string;
  category: 'facial' | 'body';
  zone: FacialZone | BodyZone;
  subZone?: string;

  // Positioning for charting
  position?: {
    x: number; // Percentage
    y: number; // Percentage
  };
  svgPath?: string;

  // Defaults by treatment type
  defaults: {
    neurotoxin?: { units: number; depth: string; technique: string };
    filler?: { volume: number; depth: string; technique: string };
    laser?: { passes: number; fluence: number };
    rf?: { energy: number; passes: number };
    microneedling?: { depth: number; passes: number };
    thread?: { count: number; length: string };
  };

  // Safety
  maxUnits?: number;
  maxVolume?: number;
  cautionNotes?: string;
  contraindications?: string[];

  // Status
  active: boolean;
  order: number;
}

// =============================================================================
// EQUIPMENT & SUPPLIES
// =============================================================================

/**
 * Needle types for injectables
 */
export interface NeedleConfig {
  id: string;
  gauge: string; // '27G', '30G', '32G', etc.
  length: string; // '0.5"', '1"', '1.5"', etc.
  type: 'needle' | 'cannula';
  bevel?: 'short' | 'regular' | 'intradermal';

  // Usage recommendations
  recommendedFor: InjectableType[];
  recommendedZones: string[];

  // Safety
  safetyFeatures?: string[];
  singleUse: boolean;

  active: boolean;
  order: number;
}

/**
 * Cannula configurations
 */
export interface CannulaConfig {
  id: string;
  gauge: string; // '22G', '25G', '27G'
  length: string; // '38mm', '50mm', '70mm'
  tip: 'blunt' | 'micro-blunt';
  flexibility: 'rigid' | 'flexible' | 'super-flexible';

  // Usage
  recommendedProducts: string[];
  recommendedZones: string[];
  entryPointsRequired: number;

  active: boolean;
  order: number;
}

/**
 * Laser handpiece configurations
 */
export interface LaserHandpiece {
  id: string;
  deviceId: string;
  deviceName: string;
  name: string;
  spotSize: string; // '2mm', '4mm', '10mm'
  type: 'fractional' | 'ablative' | 'non-ablative' | 'vascular' | 'pigment';

  // Parameters
  wavelength?: number; // nm
  fluenceRange: { min: number; max: number; unit: string };
  pulseWidthRange?: { min: number; max: number; unit: string };
  repetitionRate?: { min: number; max: number; unit: string };

  // Cooling
  coolingType?: 'contact' | 'cryogen' | 'air' | 'none';
  coolingLevel?: number;

  active: boolean;
  order: number;
}

/**
 * RF device tip configurations
 */
export interface RFTipConfig {
  id: string;
  deviceId: string;
  deviceName: string;
  name: string;

  // Tip specifications
  tipType: 'microneedle' | 'bipolar' | 'monopolar' | 'multipolar';
  needleCount?: number; // For microneedle tips
  needleLength?: string; // '0.5mm', '1mm', '2mm', '3mm', '4mm'
  needleInsulation?: 'coated' | 'non-coated' | 'semi-insulated';
  activeArea?: string; // Treatment area size

  // Parameters
  energyRange: { min: number; max: number; unit: string };
  depthRange?: { min: number; max: number; unit: string };

  // Usage
  recommendedZones: string[];
  singleUse: boolean;

  active: boolean;
  order: number;
}

/**
 * Microneedling device/cartridge configurations
 */
export interface MicroneedlingConfig {
  id: string;
  deviceId: string;
  deviceName: string;
  cartridgeName: string;

  // Needle specifications
  needleCount: number; // 12, 24, 36, etc.
  needleConfiguration: 'nano' | 'micro' | 'standard';
  needleType: 'stamping' | 'gliding';

  // Depth settings
  depthRange: { min: number; max: number; unit: string }; // mm
  depthIncrements: number[]; // [0.25, 0.5, 0.75, 1.0, 1.5, 2.0]

  // Speed
  speedRange: { min: number; max: number; unit: string }; // rpm or frequency

  // Usage
  recommendedSerums?: string[];
  singleUse: boolean;

  active: boolean;
  order: number;
}

// =============================================================================
// INJECTABLE PRODUCT PRESETS
// =============================================================================

/**
 * Neurotoxin product preset
 */
export interface NeurotoxinPreset {
  id: string;
  name: string;
  displayName: string;
  manufacturer: string;

  // Product details
  type: 'onabotulinumtoxinA' | 'abobotulinumtoxinA' | 'incobotulinumtoxinA' | 'prabotulinumtoxinA' | 'daxibotulinumtoxinA';
  brand: 'Botox' | 'Dysport' | 'Xeomin' | 'Jeuveau' | 'Daxxify';

  // Concentration & reconstitution
  unitsPerVial: number; // 50, 100, 200
  recommendedDilution: number; // mL saline
  concentrationPerMl: number; // Units per mL after dilution

  // Stability
  refrigerationRequired: boolean;
  stabilityHoursReconstituted: number; // Hours after reconstitution
  preservativeFree: boolean;

  // Conversion factor (relative to Botox)
  conversionFactor: number; // Dysport 2.5-3:1, Xeomin 1:1, etc.

  // Pricing
  defaultPricePerUnit: number;
  costPerUnit?: number;

  // Defaults
  defaultNeedleGauge: string;
  defaultDilution: number;

  // Zone defaults (units per zone)
  zoneDefaults: {
    zoneId: string;
    defaultUnits: number;
    rangeMin: number;
    rangeMax: number;
  }[];

  active: boolean;
  order: number;
}

/**
 * Dermal filler product preset
 */
export interface FillerPreset {
  id: string;
  name: string;
  displayName: string;
  manufacturer: string;

  // Product details
  type: 'hyaluronic_acid' | 'calcium_hydroxylapatite' | 'plla' | 'pcl' | 'pmma';
  brand: string;
  productLine: string; // Juvederm, Restylane, RHA, etc.

  // Syringe details
  volumePerSyringe: number; // mL
  concentration?: string; // mg/mL
  particleSize?: string; // For HA fillers
  gPrime?: number; // Elasticity rating
  cohesivity?: string; // Low, medium, high

  // Lidocaine
  containsLidocaine: boolean;
  lidocaineConcentration?: number; // Percentage

  // Duration
  expectedDurationMonths: { min: number; max: number };

  // Pricing
  defaultPricePerSyringe: number;
  costPerSyringe?: number;

  // Injection recommendations
  recommendedDepth: string[]; // 'intradermal', 'subcutaneous', 'supraperiosteal'
  recommendedTechnique: string[]; // 'linear', 'bolus', 'fanning', 'cross-hatch'
  recommendedNeedle: string; // '27G', '30G'
  cannulaCompatible: boolean;
  recommendedCannula?: string;

  // Zone recommendations
  recommendedZones: string[];

  // Zone defaults
  zoneDefaults: {
    zoneId: string;
    defaultVolume: number; // mL
    rangeMin: number;
    rangeMax: number;
  }[];

  active: boolean;
  order: number;
}

/**
 * Biostimulator product preset (Sculptra, Radiesse, etc.)
 */
export interface BiostimulatorPreset {
  id: string;
  name: string;
  displayName: string;
  manufacturer: string;

  // Product details
  type: 'plla' | 'caha' | 'pcl';
  brand: string;

  // Reconstitution (for PLLA)
  requiresReconstitution: boolean;
  reconstitutionVolume?: number; // mL
  reconstitutionTime?: number; // Hours before use
  diluentType?: string;

  // Syringe/vial details
  volumePerVial: number;
  reconstitutedVolume?: number;

  // Injection technique
  injectionDepth: string[];
  recommendedTechnique: string[];
  massageRequired: boolean;
  massageInstructions?: string;

  // Treatment protocol
  sessionsRequired: { min: number; max: number };
  sessionIntervalWeeks: number;
  expectedDurationMonths: { min: number; max: number };

  // Pricing
  defaultPricePerVial: number;
  costPerVial?: number;

  // Zone recommendations
  recommendedZones: string[];
  contraindicatedZones: string[];

  active: boolean;
  order: number;
}

// =============================================================================
// LASER & ENERGY DEVICE PRESETS
// =============================================================================

/**
 * Laser device preset
 */
export interface LaserDevicePreset {
  id: string;
  name: string;
  displayName: string;
  manufacturer: string;

  // Device classification
  laserType: LaserType;
  wavelengths: number[]; // nm
  platform?: string; // Multi-platform devices

  // Available handpieces
  handpieces: LaserHandpiece[];

  // Default parameters by indication
  indicationPresets: LaserIndicationPreset[];

  // Safety
  eyeProtectionRequired: boolean;
  eyewearOD?: number; // Optical density required
  skinCoolingRequired: boolean;
  numbing?: 'required' | 'recommended' | 'optional' | 'none';

  // Fitzpatrick restrictions
  fitzpatrickRange: { min: number; max: number };

  active: boolean;
  order: number;
}

/**
 * Laser indication preset (settings for specific conditions)
 */
export interface LaserIndicationPreset {
  id: string;
  name: string;
  indication: string; // 'hair_removal', 'pigmentation', 'vascular', 'resurfacing', etc.

  // Parameters
  handpieceId: string;
  spotSize: string;
  fluence: number;
  pulseWidth?: number;
  repetitionRate?: number;
  passes: number;
  coolingLevel?: number;

  // Treatment areas
  applicableZones: string[];

  // Protocol
  treatmentIntervalWeeks: number;
  sessionsRequired: { min: number; max: number };

  // Pre/post care
  preTreatmentInstructions?: string[];
  postTreatmentInstructions?: string[];
  downtime?: string;

  active: boolean;
  order: number;
}

/**
 * RF device preset
 */
export interface RFDevicePreset {
  id: string;
  name: string;
  displayName: string;
  manufacturer: string;

  // Device classification
  deviceType: RFDeviceType;
  technology: 'microneedle' | 'monopolar' | 'bipolar' | 'multipolar' | 'hybrid';

  // Available tips
  tips: RFTipConfig[];

  // Default protocols
  protocols: RFProtocolPreset[];

  // Safety
  numbing: 'required' | 'recommended' | 'optional';
  numbingTime?: number; // Minutes

  active: boolean;
  order: number;
}

/**
 * RF treatment protocol preset
 */
export interface RFProtocolPreset {
  id: string;
  name: string;
  indication: string;

  // Parameters
  tipId: string;
  energy: number;
  depth?: number; // For microneedle
  passes: number;
  pulseMode?: string;

  // Treatment areas
  applicableZones: string[];

  // Protocol
  treatmentIntervalWeeks: number;
  sessionsRequired: { min: number; max: number };

  // Pre/post care
  preTreatmentInstructions?: string[];
  postTreatmentInstructions?: string[];
  downtime?: string;

  active: boolean;
  order: number;
}

// =============================================================================
// SKIN TREATMENT PRESETS
// =============================================================================

/**
 * Chemical peel preset
 */
export interface ChemicalPeelPreset {
  id: string;
  name: string;
  displayName: string;
  manufacturer: string;

  // Peel classification
  depth: 'superficial' | 'medium' | 'deep';
  peelType: 'aha' | 'bha' | 'tca' | 'jessner' | 'phenol' | 'combination';

  // Active ingredients
  activeIngredients: {
    name: string;
    concentration: number; // Percentage
  }[];

  // Application
  layers: { min: number; max: number };
  applicationTime: { min: number; max: number }; // Seconds
  neutralizationRequired: boolean;

  // Fitzpatrick
  fitzpatrickRange: { min: number; max: number };

  // Protocol
  treatmentIntervalWeeks: number;
  sessionsRequired: { min: number; max: number };

  // Pre/post care
  preTreatmentInstructions?: string[];
  postTreatmentInstructions?: string[];
  downtime?: string;

  // Pricing
  defaultPrice: number;
  cost?: number;

  active: boolean;
  order: number;
}

/**
 * Microneedling protocol preset
 */
export interface MicroneedlingProtocolPreset {
  id: string;
  name: string;
  indication: string;

  // Device/cartridge
  deviceId: string;
  cartridgeId: string;

  // Parameters by zone
  zoneParameters: {
    zoneId: string;
    depth: number; // mm
    passes: number;
    speed?: number;
  }[];

  // Serums/boosters
  recommendedSerums: {
    name: string;
    applicationTime: 'before' | 'during' | 'after';
  }[];

  // Protocol
  treatmentIntervalWeeks: number;
  sessionsRequired: { min: number; max: number };

  // Pre/post care
  preTreatmentInstructions?: string[];
  postTreatmentInstructions?: string[];
  downtime?: string;

  active: boolean;
  order: number;
}

// =============================================================================
// BODY CONTOURING PRESETS
// =============================================================================

/**
 * Body contouring device preset
 */
export interface BodyContouringPreset {
  id: string;
  name: string;
  displayName: string;
  manufacturer: string;

  // Device classification
  deviceType: BodyContouringType;
  technology: 'cryolipolysis' | 'laser_lipolysis' | 'rf' | 'hifem' | 'hifu' | 'ultrasound';

  // Applicators
  applicators: BodyContouringApplicator[];

  // Treatment protocols
  protocols: BodyContouringProtocol[];

  active: boolean;
  order: number;
}

/**
 * Body contouring applicator
 */
export interface BodyContouringApplicator {
  id: string;
  name: string;
  size: string;

  // Treatment area
  applicableZones: BodyZone[];
  treatmentAreaSize?: string; // sq cm or description

  // Parameters
  treatmentTimeMinutes: number;
  cyclesRequired?: number;

  active: boolean;
  order: number;
}

/**
 * Body contouring treatment protocol
 */
export interface BodyContouringProtocol {
  id: string;
  name: string;
  targetArea: BodyZone;

  // Applicators used
  applicatorIds: string[];
  applicatorPlacement?: string;

  // Protocol
  sessionsRequired: { min: number; max: number };
  sessionIntervalWeeks: number;

  // Expected results
  expectedReductionPercent?: number;
  resultTimelineWeeks: number;

  // Pre/post care
  preTreatmentInstructions?: string[];
  postTreatmentInstructions?: string[];

  active: boolean;
  order: number;
}

// =============================================================================
// THREAD PRESETS
// =============================================================================

/**
 * Thread product preset
 */
export interface ThreadPreset {
  id: string;
  name: string;
  displayName: string;
  manufacturer: string;

  // Thread classification
  threadType: ThreadType;
  material: 'pdo' | 'plla' | 'pcl';

  // Thread specifications
  length: string; // mm
  gauge: string;
  barbed: boolean;
  barbType?: 'uni-directional' | 'bi-directional' | 'cog' | 'none';
  barbSpacing?: string;

  // Packaging
  unitsPerPackage: number;

  // Duration
  expectedDurationMonths: { min: number; max: number };

  // Pricing
  defaultPricePerThread: number;
  costPerThread?: number;

  // Usage recommendations
  recommendedZones: string[];
  insertionTechnique: string;
  insertionDepth: string;

  // Zone recommendations
  zoneDefaults: {
    zoneId: string;
    recommendedCount: number;
    rangeMin: number;
    rangeMax: number;
  }[];

  active: boolean;
  order: number;
}

// =============================================================================
// IV THERAPY PRESETS
// =============================================================================

/**
 * IV therapy protocol preset
 */
export interface IVTherapyPreset {
  id: string;
  name: string;
  displayName: string;

  // Protocol classification
  therapyType: IVTherapyType;

  // Base fluid
  baseFluid: 'saline' | 'lactated_ringers' | 'dextrose';
  baseVolume: number; // mL

  // Additives
  additives: {
    name: string;
    dose: number;
    unit: string;
    optional: boolean;
  }[];

  // Administration
  administrationTime: number; // Minutes
  ivAccess: 'peripheral' | 'butterfly' | 'either';
  gaugeRecommended: string;

  // Frequency
  frequencyRecommendation: string;

  // Safety
  contraindications: string[];
  precautions: string[];

  // Pricing
  defaultPrice: number;
  cost?: number;

  active: boolean;
  order: number;
}

// =============================================================================
// WEIGHT LOSS PRESETS
// =============================================================================

/**
 * Weight loss medication preset
 */
export interface WeightLossMedicationPreset {
  id: string;
  name: string;
  displayName: string;
  manufacturer: string;

  // Medication classification
  medicationType: WeightLossType;
  drugClass: 'glp1' | 'glp1_gip' | 'sympathomimetic' | 'lipotropic' | 'peptide' | 'hormone';

  // Dosing schedule
  dosingSchedule: {
    week: number;
    dose: number;
    unit: string;
    frequency: string;
  }[];

  // Administration
  administrationRoute: 'subcutaneous' | 'intramuscular' | 'oral';
  injectionSites?: string[];

  // Titration
  startingDose: number;
  maintenanceDose: number;
  maxDose: number;
  titrationIntervalWeeks: number;

  // Monitoring
  labsRequired: string[];
  labFrequencyWeeks: number;
  vitalsMonitoring: string[];

  // Side effects & contraindications
  commonSideEffects: string[];
  seriousSideEffects: string[];
  contraindications: string[];
  drugInteractions: string[];

  // Pricing
  defaultPricePerDose: number;
  costPerDose?: number;

  active: boolean;
  order: number;
}

// =============================================================================
// DOCUMENTATION REQUIREMENTS
// =============================================================================

/**
 * Consent form types
 */
export enum ConsentType {
  GENERAL_TREATMENT = 'general_treatment',
  INJECTABLE = 'injectable',
  LASER = 'laser',
  RF_DEVICE = 'rf_device',
  CHEMICAL_PEEL = 'chemical_peel',
  MICRONEEDLING = 'microneedling',
  BODY_CONTOURING = 'body_contouring',
  THREAD_LIFT = 'thread_lift',
  IV_THERAPY = 'iv_therapy',
  WEIGHT_LOSS = 'weight_loss',
  PHOTO_VIDEO = 'photo_video',
  HIPAA = 'hipaa',
  FINANCIAL = 'financial',
}

/**
 * Documentation requirements per treatment type
 */
export interface DocumentationRequirements {
  id: string;
  treatmentCategory: TreatmentCategory;
  treatmentType?: string;

  // Required consents
  requiredConsents: ConsentType[];

  // Photo requirements
  photoRequirements: {
    required: boolean;
    beforePhotos: string[]; // Angles
    afterPhotos: string[];
    photoConsentRequired: boolean;
  };

  // Lot tracking
  lotTrackingRequired: boolean;

  // SOAP notes
  soapNotesRequired: boolean;
  soapTemplateId?: string;

  // Pre-treatment documentation
  preTreatmentChecklist: {
    item: string;
    required: boolean;
  }[];

  // Post-treatment documentation
  postTreatmentChecklist: {
    item: string;
    required: boolean;
  }[];

  // Follow-up requirements
  followUpRequired: boolean;
  followUpIntervalDays?: number;

  active: boolean;
}

// =============================================================================
// INJECTION TECHNIQUES & DEPTHS
// =============================================================================

/**
 * Injection depth presets
 */
export interface InjectionDepthConfig {
  id: string;
  name: string;
  displayName: string;
  depth: 'intradermal' | 'subcutaneous' | 'intramuscular' | 'supraperiosteal' | 'deep_fat' | 'superficial_fat';

  // Description
  description: string;
  anatomicalLayer: string;

  // Recommendations
  recommendedFor: string[];
  productTypes: InjectableType[];

  // Safety
  risks: string[];
  precautions: string[];

  active: boolean;
  order: number;
}

/**
 * Injection technique presets
 */
export interface InjectionTechniqueConfig {
  id: string;
  name: string;
  displayName: string;
  technique: 'serial_puncture' | 'linear_threading' | 'fanning' | 'cross_hatch' | 'bolus' | 'depot' | 'blanching' | 'retrograde' | 'anterograde' | 'pillar';

  // Description
  description: string;
  visualGuide?: string; // URL to diagram

  // Recommendations
  recommendedFor: string[];
  productTypes: InjectableType[];
  zones: string[];

  // Equipment
  needleOrCannula: 'needle' | 'cannula' | 'either';

  active: boolean;
  order: number;
}

// =============================================================================
// TREATMENT SETTINGS CONFIGURATION
// =============================================================================

/**
 * Master treatment settings configuration
 * This is the main interface for the charting settings page
 */
export interface TreatmentSettingsConfig {
  id: string;
  clinicId: string;

  // Treatment zones
  facialZones: TreatmentZone[];
  bodyZones: TreatmentZone[];
  customZones: TreatmentZone[];

  // Equipment
  needles: NeedleConfig[];
  cannulas: CannulaConfig[];
  laserHandpieces: LaserHandpiece[];
  rfTips: RFTipConfig[];
  microneedlingCartridges: MicroneedlingConfig[];

  // Product presets by category
  injectables: {
    neurotoxins: NeurotoxinPreset[];
    fillers: FillerPreset[];
    biostimulators: BiostimulatorPreset[];
  };

  lasers: LaserDevicePreset[];
  rfDevices: RFDevicePreset[];

  skinTreatments: {
    peels: ChemicalPeelPreset[];
    microneedling: MicroneedlingProtocolPreset[];
  };

  bodyContouring: BodyContouringPreset[];
  threads: ThreadPreset[];
  ivTherapy: IVTherapyPreset[];
  weightLoss: WeightLossMedicationPreset[];

  // Techniques & depths
  injectionDepths: InjectionDepthConfig[];
  injectionTechniques: InjectionTechniqueConfig[];

  // Documentation requirements
  documentationRequirements: DocumentationRequirements[];

  // Global defaults
  globalDefaults: {
    defaultNeedleId: string;
    defaultCannulaId: string;
    defaultInjectionDepthId: string;
    defaultInjectionTechniqueId: string;
    autoSelectFIFOLot: boolean;
    requireLotSelection: boolean;
    requirePhotosBefore: boolean;
    requirePhotosAfter: boolean;
    autoCalculatePricing: boolean;
  };

  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastUpdatedBy: string;
}

// =============================================================================
// DEFAULT CONSTANTS
// =============================================================================

/**
 * Treatment category display configuration
 */
export const TREATMENT_CATEGORY_CONFIG: Record<TreatmentCategory, {
  name: string;
  displayName: string;
  icon: string;
  color: string;
  description: string;
}> = {
  [TreatmentCategory.INJECTABLES]: {
    name: 'injectables',
    displayName: 'Injectables',
    icon: 'syringe',
    color: '#EC4899',
    description: 'Neurotoxins, fillers, and biostimulators',
  },
  [TreatmentCategory.LASERS]: {
    name: 'lasers',
    displayName: 'Lasers',
    icon: 'zap',
    color: '#EF4444',
    description: 'CO2, IPL, Nd:YAG, Alexandrite, and more',
  },
  [TreatmentCategory.RF_DEVICES]: {
    name: 'rf_devices',
    displayName: 'RF Devices',
    icon: 'radio',
    color: '#8B5CF6',
    description: 'Morpheus8, Thermage, and RF microneedling',
  },
  [TreatmentCategory.SKIN_TREATMENTS]: {
    name: 'skin_treatments',
    displayName: 'Skin Treatments',
    icon: 'sparkles',
    color: '#3B82F6',
    description: 'Microneedling, peels, HydraFacial',
  },
  [TreatmentCategory.BODY_CONTOURING]: {
    name: 'body_contouring',
    displayName: 'Body Contouring',
    icon: 'activity',
    color: '#14B8A6',
    description: 'CoolSculpting, Emsculpt, and more',
  },
  [TreatmentCategory.THREADS]: {
    name: 'threads',
    displayName: 'Threads',
    icon: 'git-branch',
    color: '#F59E0B',
    description: 'PDO, PLLA, and PCL threads',
  },
  [TreatmentCategory.IV_THERAPY]: {
    name: 'iv_therapy',
    displayName: 'IV Therapy',
    icon: 'droplet',
    color: '#06B6D4',
    description: 'Myers cocktail, NAD+, vitamins',
  },
  [TreatmentCategory.WEIGHT_LOSS]: {
    name: 'weight_loss',
    displayName: 'Weight Loss',
    icon: 'trending-down',
    color: '#22C55E',
    description: 'Semaglutide, Tirzepatide, and more',
  },
};

/**
 * Default needle gauges
 */
export const DEFAULT_NEEDLE_GAUGES = [
  '25G', '27G', '30G', '31G', '32G', '33G', '34G'
] as const;

/**
 * Default cannula gauges
 */
export const DEFAULT_CANNULA_GAUGES = [
  '18G', '20G', '22G', '25G', '27G'
] as const;

/**
 * Default injection depths
 */
export const DEFAULT_INJECTION_DEPTHS = [
  'intradermal',
  'subcutaneous',
  'intramuscular',
  'supraperiosteal',
  'deep_fat',
  'superficial_fat',
] as const;

/**
 * Default injection techniques
 */
export const DEFAULT_INJECTION_TECHNIQUES = [
  'serial_puncture',
  'linear_threading',
  'fanning',
  'cross_hatch',
  'bolus',
  'depot',
  'blanching',
  'retrograde',
  'anterograde',
  'pillar',
] as const;

/**
 * Fitzpatrick skin type scale
 */
export const FITZPATRICK_TYPES = [
  { type: 1, description: 'Very fair, always burns, never tans' },
  { type: 2, description: 'Fair, usually burns, tans minimally' },
  { type: 3, description: 'Medium, sometimes burns, tans uniformly' },
  { type: 4, description: 'Olive, rarely burns, tans well' },
  { type: 5, description: 'Brown, very rarely burns, tans very easily' },
  { type: 6, description: 'Dark brown/black, never burns, deeply pigmented' },
] as const;

/**
 * Standard photo angles for documentation
 */
export const STANDARD_PHOTO_ANGLES = {
  face: [
    'frontal',
    'right_oblique',
    'left_oblique',
    'right_profile',
    'left_profile',
    'chin_up',
    'chin_down',
    'smile',
    'animation',
  ],
  body: [
    'frontal',
    'right_lateral',
    'left_lateral',
    'posterior',
    'right_oblique',
    'left_oblique',
  ],
} as const;

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Type guard for checking treatment category
 */
export function isTreatmentCategory(value: string): value is TreatmentCategory {
  return Object.values(TreatmentCategory).includes(value as TreatmentCategory);
}

/**
 * Get all sub-types for a treatment category
 */
export type TreatmentSubType<T extends TreatmentCategory> =
  T extends TreatmentCategory.INJECTABLES ? InjectableType :
  T extends TreatmentCategory.LASERS ? LaserType :
  T extends TreatmentCategory.RF_DEVICES ? RFDeviceType :
  T extends TreatmentCategory.SKIN_TREATMENTS ? SkinTreatmentType :
  T extends TreatmentCategory.BODY_CONTOURING ? BodyContouringType :
  T extends TreatmentCategory.THREADS ? ThreadType :
  T extends TreatmentCategory.IV_THERAPY ? IVTherapyType :
  T extends TreatmentCategory.WEIGHT_LOSS ? WeightLossType :
  never;

/**
 * Zone type union
 */
export type AnyZone = FacialZone | BodyZone;

/**
 * Product preset type union
 */
export type AnyProductPreset =
  | NeurotoxinPreset
  | FillerPreset
  | BiostimulatorPreset
  | LaserDevicePreset
  | RFDevicePreset
  | ChemicalPeelPreset
  | BodyContouringPreset
  | ThreadPreset
  | IVTherapyPreset
  | WeightLossMedicationPreset;

/**
 * Equipment config type union
 */
export type AnyEquipmentConfig =
  | NeedleConfig
  | CannulaConfig
  | LaserHandpiece
  | RFTipConfig
  | MicroneedlingConfig;
