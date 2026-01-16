// =============================================================================
// DEFAULT CHARTING SETTINGS DATA
// Contains all default settings for 17+ treatment categories
// =============================================================================

import type {
  CategorySettings,
  AllChartingSettings,
  CategoryTab,
  TreatmentCategory,
} from './types'
import {
  Syringe,
  Zap,
  Activity,
  Droplets,
  Target,
  Scissors,
  Heart,
  Scale,
  Sparkles,
  Pill,
  Layers,
  Package,
} from 'lucide-react'

// =============================================================================
// INJECTABLES
// =============================================================================

export const DEFAULT_INJECTABLES_SETTINGS: CategorySettings = {
  products: [
    { id: 'botox', name: 'Botox Cosmetic', brand: 'Allergan', category: 'neurotoxin', isActive: true, isDefault: true },
    { id: 'dysport', name: 'Dysport', brand: 'Galderma', category: 'neurotoxin', isActive: true, isDefault: false },
    { id: 'xeomin', name: 'Xeomin', brand: 'Merz', category: 'neurotoxin', isActive: true, isDefault: false },
    { id: 'daxxify', name: 'Daxxify', brand: 'Revance', category: 'neurotoxin', isActive: true, isDefault: false },
    { id: 'jeuveau', name: 'Jeuveau', brand: 'Evolus', category: 'neurotoxin', isActive: false, isDefault: false },
    { id: 'juvederm-ultra', name: 'Juvederm Ultra XC', brand: 'Allergan', category: 'filler', subcategory: 'HA', isActive: true, isDefault: true },
    { id: 'juvederm-voluma', name: 'Juvederm Voluma XC', brand: 'Allergan', category: 'filler', subcategory: 'HA', isActive: true, isDefault: false },
    { id: 'juvederm-vollure', name: 'Juvederm Vollure XC', brand: 'Allergan', category: 'filler', subcategory: 'HA', isActive: true, isDefault: false },
    { id: 'juvederm-volbella', name: 'Juvederm Volbella XC', brand: 'Allergan', category: 'filler', subcategory: 'HA', isActive: true, isDefault: false },
    { id: 'restylane', name: 'Restylane', brand: 'Galderma', category: 'filler', subcategory: 'HA', isActive: true, isDefault: false },
    { id: 'restylane-lyft', name: 'Restylane Lyft', brand: 'Galderma', category: 'filler', subcategory: 'HA', isActive: true, isDefault: false },
    { id: 'restylane-kysse', name: 'Restylane Kysse', brand: 'Galderma', category: 'filler', subcategory: 'HA', isActive: true, isDefault: false },
    { id: 'rha-2', name: 'RHA 2', brand: 'Revance', category: 'filler', subcategory: 'HA', isActive: true, isDefault: false },
    { id: 'rha-3', name: 'RHA 3', brand: 'Revance', category: 'filler', subcategory: 'HA', isActive: true, isDefault: false },
    { id: 'rha-4', name: 'RHA 4', brand: 'Revance', category: 'filler', subcategory: 'HA', isActive: true, isDefault: false },
    { id: 'radiesse', name: 'Radiesse', brand: 'Merz', category: 'biostimulator', isActive: true, isDefault: false },
    { id: 'radiesse-plus', name: 'Radiesse (+)', brand: 'Merz', category: 'biostimulator', isActive: true, isDefault: false },
    { id: 'sculptra', name: 'Sculptra Aesthetic', brand: 'Galderma', category: 'biostimulator', isActive: true, isDefault: false },
    { id: 'skinvive', name: 'SkinVive', brand: 'Allergan', category: 'skin-booster', isActive: true, isDefault: false },
  ],
  parameters: [
    { id: 'depth-superficial', name: 'Superficial', defaultValue: '0.5-1mm', unit: 'mm', description: 'Papillary dermis', isActive: true },
    { id: 'depth-mid', name: 'Mid-Dermis', defaultValue: '1-2mm', unit: 'mm', description: 'Reticular dermis', isActive: true },
    { id: 'depth-deep', name: 'Deep Dermis', defaultValue: '2-4mm', unit: 'mm', description: 'Deep reticular', isActive: true },
    { id: 'depth-subq', name: 'Subcutaneous', defaultValue: '4-8mm', unit: 'mm', description: 'Fat layer', isActive: true },
    { id: 'depth-supra', name: 'Supraperiosteal', defaultValue: '8-12mm', unit: 'mm', description: 'Above periosteum', isActive: true },
    { id: 'tech-serial', name: 'Serial Puncture', defaultValue: 'serial', unit: '', description: 'Multiple small injections', isActive: true },
    { id: 'tech-linear', name: 'Linear Threading', defaultValue: 'linear', unit: '', description: 'Deposit while withdrawing', isActive: true },
    { id: 'tech-fanning', name: 'Fanning', defaultValue: 'fanning', unit: '', description: 'Multiple threads from one point', isActive: true },
    { id: 'tech-bolus', name: 'Bolus/Depot', defaultValue: 'bolus', unit: '', description: 'Single large deposit', isActive: true },
    { id: 'dilution-botox', name: 'Botox Dilution', defaultValue: 2.5, unit: 'ml/100u', minValue: 1, maxValue: 10, isActive: true },
    { id: 'dilution-dysport', name: 'Dysport Dilution', defaultValue: 2.5, unit: 'ml/300u', minValue: 1, maxValue: 10, isActive: true },
  ],
  needlesSizes: [
    { id: 'ng-27', gauge: '27G', length: '13mm', type: 'needle', recommendedFor: ['Fillers', 'Lips'], isActive: true, isDefault: false },
    { id: 'ng-30', gauge: '30G', length: '13mm', type: 'needle', recommendedFor: ['Neurotoxins', 'Fine lines'], isActive: true, isDefault: true },
    { id: 'ng-31', gauge: '31G', length: '8mm', type: 'needle', recommendedFor: ['Superficial', 'Skin boosters'], isActive: true, isDefault: false },
    { id: 'ng-32', gauge: '32G', length: '4mm', type: 'needle', recommendedFor: ['Mesotherapy', 'PRP'], isActive: true, isDefault: false },
    { id: 'cn-22', gauge: '22G', length: '50mm', type: 'cannula', recommendedFor: ['Cheeks', 'Jawline'], isActive: true, isDefault: false },
    { id: 'cn-25', gauge: '25G', length: '38mm', type: 'cannula', recommendedFor: ['Lips', 'Nasolabial'], isActive: true, isDefault: true },
    { id: 'cn-27', gauge: '27G', length: '25mm', type: 'cannula', recommendedFor: ['Fine areas', 'Touch-ups'], isActive: true, isDefault: false },
  ],
  zones: [
    { id: 'zone-forehead', name: 'Forehead', anatomicalName: 'Frontalis', category: 'upper-face', isActive: true, isCustom: false },
    { id: 'zone-glabella', name: 'Glabella', anatomicalName: 'Procerus/Corrugator', category: 'upper-face', isActive: true, isCustom: false },
    { id: 'zone-crows', name: "Crow's Feet", anatomicalName: 'Orbicularis Oculi', category: 'periorbital', isActive: true, isCustom: false },
    { id: 'zone-tear', name: 'Tear Trough', anatomicalName: 'Infraorbital Hollow', category: 'periorbital', isActive: true, isCustom: false },
    { id: 'zone-cheek', name: 'Cheeks', anatomicalName: 'Malar/Zygomatic', category: 'mid-face', isActive: true, isCustom: false },
    { id: 'zone-naso', name: 'Nasolabial Folds', anatomicalName: 'Nasolabial Crease', category: 'mid-face', isActive: true, isCustom: false },
    { id: 'zone-lips', name: 'Lips', anatomicalName: 'Vermillion', category: 'lower-face', isActive: true, isCustom: false },
    { id: 'zone-marionette', name: 'Marionette Lines', anatomicalName: 'Oral Commissure', category: 'lower-face', isActive: true, isCustom: false },
    { id: 'zone-chin', name: 'Chin', anatomicalName: 'Mentalis/Pogonion', category: 'lower-face', isActive: true, isCustom: false },
    { id: 'zone-jaw', name: 'Jawline', anatomicalName: 'Mandibular Angle', category: 'lower-face', isActive: true, isCustom: false },
    { id: 'zone-masseter', name: 'Masseter', anatomicalName: 'Masseter Muscle', category: 'lower-face', isActive: true, isCustom: false },
  ],
  templates: [
    { id: 'tmpl-tox-full', name: 'Full Face Neurotoxin', category: 'neurotoxin', template: 'Standard full face treatment: Forehead {forehead_units}u, Glabella {glabella_units}u, Crow\'s Feet {crows_units}u bilateral', variables: ['forehead_units', 'glabella_units', 'crows_units'], isActive: true, isDefault: true },
    { id: 'tmpl-lip-aug', name: 'Lip Augmentation', category: 'filler', template: 'Lip augmentation with {product}: Upper lip {upper_vol}ml, Lower lip {lower_vol}ml', variables: ['product', 'upper_vol', 'lower_vol'], isActive: true, isDefault: true },
  ],
}

// =============================================================================
// LASERS
// =============================================================================

export const DEFAULT_LASERS_SETTINGS: CategorySettings = {
  products: [
    { id: 'co2-fractional', name: 'CO2 Fractional', brand: 'Various', category: 'ablative', isActive: true, isDefault: true },
    { id: 'erbium-yag', name: 'Erbium:YAG', brand: 'Various', category: 'ablative', isActive: true, isDefault: false },
    { id: 'nd-yag', name: 'Nd:YAG', brand: 'Various', category: 'non-ablative', isActive: true, isDefault: false },
    { id: 'alexandrite', name: 'Alexandrite', brand: 'Various', category: 'hair-removal', isActive: true, isDefault: true },
    { id: 'diode', name: 'Diode', brand: 'Various', category: 'hair-removal', isActive: true, isDefault: false },
    { id: 'ipl', name: 'IPL', brand: 'Various', category: 'photofacial', isActive: true, isDefault: true },
    { id: 'bbl', name: 'BBL Hero', brand: 'Sciton', category: 'photofacial', isActive: true, isDefault: false },
    { id: 'pico', name: 'Picosecond Laser', brand: 'Various', category: 'pigmentation', isActive: true, isDefault: false },
    { id: 'q-switched', name: 'Q-Switched', brand: 'Various', category: 'tattoo-removal', isActive: true, isDefault: false },
    { id: 'vbeam', name: 'VBeam Perfecta', brand: 'Candela', category: 'vascular', isActive: true, isDefault: true },
    { id: 'excel-v', name: 'Excel V+', brand: 'Cutera', category: 'vascular', isActive: true, isDefault: false },
    { id: 'halo', name: 'HALO', brand: 'Sciton', category: 'hybrid', isActive: true, isDefault: false },
    { id: 'moxi', name: 'MOXI', brand: 'Sciton', category: 'non-ablative', isActive: true, isDefault: false },
    { id: 'clear-brilliant', name: 'Clear + Brilliant', brand: 'Solta', category: 'non-ablative', isActive: true, isDefault: false },
    { id: 'fraxel', name: 'Fraxel', brand: 'Solta', category: 'non-ablative', isActive: true, isDefault: false },
  ],
  parameters: [
    { id: 'energy', name: 'Energy', defaultValue: 20, unit: 'mJ', minValue: 5, maxValue: 100, isActive: true },
    { id: 'fluence', name: 'Fluence', defaultValue: 12, unit: 'J/cm2', minValue: 5, maxValue: 50, isActive: true },
    { id: 'pulse-width', name: 'Pulse Width', defaultValue: 10, unit: 'ms', minValue: 0.5, maxValue: 100, isActive: true },
    { id: 'spot-size', name: 'Spot Size', defaultValue: 8, unit: 'mm', minValue: 2, maxValue: 18, isActive: true },
    { id: 'repetition-rate', name: 'Repetition Rate', defaultValue: 1, unit: 'Hz', minValue: 0.5, maxValue: 10, isActive: true },
    { id: 'density', name: 'Density', defaultValue: 20, unit: '%', minValue: 5, maxValue: 100, isActive: true },
    { id: 'passes', name: 'Number of Passes', defaultValue: 2, unit: '', minValue: 1, maxValue: 10, isActive: true },
    { id: 'cooling', name: 'Cooling', defaultValue: 'contact', unit: '', options: ['none', 'air', 'contact', 'cryogen'], isActive: true },
    { id: 'wavelength', name: 'Wavelength', defaultValue: 1064, unit: 'nm', options: ['532', '755', '810', '1064', '1550', '2940', '10600'], isActive: true },
  ],
  needlesSizes: [],
  zones: [
    { id: 'zone-full-face', name: 'Full Face', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-peri-oral', name: 'Perioral', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-peri-orbital', name: 'Periorbital', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-forehead-laser', name: 'Forehead', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-neck', name: 'Neck', category: 'neck', isActive: true, isCustom: false },
    { id: 'zone-decollete', name: 'Decolletage', category: 'chest', isActive: true, isCustom: false },
    { id: 'zone-hands', name: 'Hands', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-arms', name: 'Arms', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-legs', name: 'Legs', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-back', name: 'Back', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-bikini', name: 'Bikini Area', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-underarms', name: 'Underarms', category: 'body', isActive: true, isCustom: false },
  ],
  templates: [
    { id: 'tmpl-ipl-face', name: 'IPL Full Face', category: 'photofacial', template: 'IPL photofacial: {passes} passes at {fluence} J/cm2, {spot_size}mm spot', variables: ['passes', 'fluence', 'spot_size'], isActive: true, isDefault: true },
    { id: 'tmpl-lhr', name: 'Laser Hair Removal', category: 'hair-removal', template: '{device} hair removal: {fluence} J/cm2, {pulse_width}ms, {spot_size}mm', variables: ['device', 'fluence', 'pulse_width', 'spot_size'], isActive: true, isDefault: true },
  ],
}

// =============================================================================
// RF MICRONEEDLING
// =============================================================================

export const DEFAULT_RF_MICRONEEDLING_SETTINGS: CategorySettings = {
  products: [
    { id: 'morpheus8', name: 'Morpheus8', brand: 'InMode', category: 'rf-microneedling', isActive: true, isDefault: true },
    { id: 'morpheus8-body', name: 'Morpheus8 Body', brand: 'InMode', category: 'rf-microneedling', isActive: true, isDefault: false },
    { id: 'vivace', name: 'Vivace', brand: 'Aesthetics Biomedical', category: 'rf-microneedling', isActive: true, isDefault: false },
    { id: 'vivace-ultra', name: 'Vivace Ultra', brand: 'Aesthetics Biomedical', category: 'rf-microneedling', isActive: true, isDefault: false },
    { id: 'genius', name: 'Genius', brand: 'Lutronic', category: 'rf-microneedling', isActive: true, isDefault: false },
    { id: 'potenza', name: 'Potenza', brand: 'Cynosure', category: 'rf-microneedling', isActive: true, isDefault: false },
    { id: 'scarlet-srf', name: 'Scarlet SRF', brand: 'Viol', category: 'rf-microneedling', isActive: true, isDefault: false },
    { id: 'sylfirm-x', name: 'Sylfirm X', brand: 'Benev', category: 'rf-microneedling', isActive: true, isDefault: false },
    { id: 'secret-rf', name: 'Secret RF', brand: 'Cutera', category: 'rf-microneedling', isActive: true, isDefault: false },
    { id: 'infini', name: 'Infini', brand: 'Lutronic', category: 'rf-microneedling', isActive: true, isDefault: false },
  ],
  parameters: [
    { id: 'needle-depth', name: 'Needle Depth', defaultValue: 2.0, unit: 'mm', minValue: 0.5, maxValue: 8.0, isActive: true },
    { id: 'rf-energy', name: 'RF Energy', defaultValue: 30, unit: 'mJ', minValue: 10, maxValue: 80, isActive: true },
    { id: 'rf-time', name: 'RF Time', defaultValue: 100, unit: 'ms', minValue: 50, maxValue: 500, isActive: true },
    { id: 'tip-type', name: 'Tip Type', defaultValue: 'standard', unit: '', options: ['prime', 'standard', 'deep', 'resurfacing', 'body'], isActive: true },
    { id: 'needle-count', name: 'Needle Count', defaultValue: 24, unit: 'pins', options: ['12', '24', '40', '64'], isActive: true },
    { id: 'mode', name: 'Treatment Mode', defaultValue: 'standard', unit: '', options: ['burst', 'standard', 'deep'], isActive: true },
    { id: 'passes-rf', name: 'Number of Passes', defaultValue: 3, unit: '', minValue: 1, maxValue: 6, isActive: true },
    { id: 'overlap', name: 'Overlap', defaultValue: 20, unit: '%', minValue: 0, maxValue: 50, isActive: true },
  ],
  needlesSizes: [],
  zones: [
    { id: 'zone-rf-face', name: 'Full Face', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-rf-neck', name: 'Neck', category: 'neck', isActive: true, isCustom: false },
    { id: 'zone-rf-jowls', name: 'Jowls', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-rf-peri-oral', name: 'Perioral', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-rf-abdomen', name: 'Abdomen', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-rf-arms', name: 'Arms', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-rf-thighs', name: 'Thighs', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-rf-buttocks', name: 'Buttocks', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-rf-scars', name: 'Acne Scars', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-rf-striae', name: 'Stretch Marks', category: 'body', isActive: true, isCustom: false },
  ],
  templates: [
    { id: 'tmpl-morpheus8-face', name: 'Morpheus8 Full Face', category: 'rf-microneedling', template: 'Morpheus8 full face: {passes} passes, {depth}mm depth, {energy}mJ', variables: ['passes', 'depth', 'energy'], isActive: true, isDefault: true },
  ],
}

// =============================================================================
// SKIN TREATMENTS
// =============================================================================

export const DEFAULT_SKIN_TREATMENTS_SETTINGS: CategorySettings = {
  products: [
    { id: 'micro-skinpen', name: 'SkinPen', brand: 'Crown', category: 'microneedling', isActive: true, isDefault: true },
    { id: 'micro-dermapen', name: 'Dermapen', brand: 'Dermapen World', category: 'microneedling', isActive: true, isDefault: false },
    { id: 'micro-rejuvapen', name: 'Rejuvapen', brand: 'Refine USA', category: 'microneedling', isActive: true, isDefault: false },
    { id: 'hydra-hydrafacial', name: 'HydraFacial MD', brand: 'HydraFacial', category: 'hydrafacial', isActive: true, isDefault: true },
    { id: 'hydra-elite', name: 'HydraFacial Elite', brand: 'HydraFacial', category: 'hydrafacial', isActive: true, isDefault: false },
    { id: 'hydra-syndeo', name: 'HydraFacial Syndeo', brand: 'HydraFacial', category: 'hydrafacial', isActive: true, isDefault: false },
    { id: 'peel-vi', name: 'VI Peel', brand: 'VI Aesthetics', category: 'chemical-peel', isActive: true, isDefault: true },
    { id: 'peel-perfect', name: 'Perfect Derma Peel', brand: 'Perfect Derma', category: 'chemical-peel', isActive: true, isDefault: false },
    { id: 'peel-jes', name: 'Jessner Peel', brand: 'Various', category: 'chemical-peel', isActive: true, isDefault: false },
    { id: 'peel-tca', name: 'TCA Peel', brand: 'Various', category: 'chemical-peel', isActive: true, isDefault: false },
    { id: 'peel-glycolic', name: 'Glycolic Peel', brand: 'Various', category: 'chemical-peel', isActive: true, isDefault: false },
    { id: 'peel-salicylic', name: 'Salicylic Peel', brand: 'Various', category: 'chemical-peel', isActive: true, isDefault: false },
    { id: 'derma-blade', name: 'Dermaplaning', brand: 'Various', category: 'dermaplaning', isActive: true, isDefault: true },
    { id: 'oxy-geneo', name: 'OxyGeneo', brand: 'Pollogen', category: 'oxygenation', isActive: true, isDefault: false },
    { id: 'prp', name: 'PRP', brand: 'In-house', category: 'regenerative', isActive: true, isDefault: true },
    { id: 'prf', name: 'PRF', brand: 'In-house', category: 'regenerative', isActive: true, isDefault: false },
    { id: 'exo', name: 'Exosomes', brand: 'Various', category: 'regenerative', isActive: true, isDefault: false },
  ],
  parameters: [
    { id: 'micro-depth', name: 'Needle Depth', defaultValue: 1.0, unit: 'mm', minValue: 0.25, maxValue: 3.0, isActive: true },
    { id: 'micro-speed', name: 'Pen Speed', defaultValue: 'medium', unit: '', options: ['low', 'medium', 'high'], isActive: true },
    { id: 'peel-strength', name: 'Peel Strength', defaultValue: 'medium', unit: '', options: ['light', 'medium', 'deep'], isActive: true },
    { id: 'peel-layers', name: 'Layers Applied', defaultValue: 2, unit: '', minValue: 1, maxValue: 5, isActive: true },
    { id: 'peel-time', name: 'Contact Time', defaultValue: 5, unit: 'min', minValue: 1, maxValue: 15, isActive: true },
    { id: 'hydra-tips', name: 'HydraFacial Tips', defaultValue: 'standard', unit: '', options: ['vortex', 'standard', 'CTGF'], isActive: true },
    { id: 'hydra-serums', name: 'Boosters', defaultValue: 'none', unit: '', options: ['none', 'britenol', 'growth-factor', 'dermabuilder'], isActive: true },
    { id: 'prp-tubes', name: 'PRP Tubes', defaultValue: 2, unit: '', minValue: 1, maxValue: 6, isActive: true },
    { id: 'prp-method', name: 'Application Method', defaultValue: 'topical', unit: '', options: ['topical', 'injection', 'microneedling'], isActive: true },
  ],
  needlesSizes: [
    { id: 'micro-12', gauge: '12-pin', length: '', type: 'needle', recommendedFor: ['Microneedling'], isActive: true, isDefault: false },
    { id: 'micro-36', gauge: '36-pin', length: '', type: 'needle', recommendedFor: ['Microneedling'], isActive: true, isDefault: true },
  ],
  zones: [
    { id: 'zone-skin-face', name: 'Full Face', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-skin-neck', name: 'Neck', category: 'neck', isActive: true, isCustom: false },
    { id: 'zone-skin-decollete', name: 'Decolletage', category: 'chest', isActive: true, isCustom: false },
    { id: 'zone-skin-hands', name: 'Hands', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-skin-scalp', name: 'Scalp', category: 'scalp', isActive: true, isCustom: false },
  ],
  templates: [
    { id: 'tmpl-micro', name: 'Microneedling with PRP', category: 'microneedling', template: 'Microneedling at {depth}mm depth with {tubes} tubes PRP applied topically', variables: ['depth', 'tubes'], isActive: true, isDefault: true },
    { id: 'tmpl-hydra', name: 'HydraFacial Signature', category: 'hydrafacial', template: 'HydraFacial with {booster} booster, all standard steps completed', variables: ['booster'], isActive: true, isDefault: true },
  ],
}

// =============================================================================
// BODY CONTOURING
// =============================================================================

export const DEFAULT_BODY_CONTOURING_SETTINGS: CategorySettings = {
  products: [
    { id: 'cool-sculpt', name: 'CoolSculpting Elite', brand: 'Allergan', category: 'cryolipolysis', isActive: true, isDefault: true },
    { id: 'cool-mini', name: 'CoolMini', brand: 'Allergan', category: 'cryolipolysis', isActive: true, isDefault: false },
    { id: 'emsculpt', name: 'EMSculpt', brand: 'BTL', category: 'muscle-toning', isActive: true, isDefault: true },
    { id: 'emsculpt-neo', name: 'EMSculpt NEO', brand: 'BTL', category: 'muscle-toning', isActive: true, isDefault: false },
    { id: 'cooltone', name: 'CoolTone', brand: 'Allergan', category: 'muscle-toning', isActive: true, isDefault: false },
    { id: 'truSculpt', name: 'truSculpt iD', brand: 'Cutera', category: 'rf-lipolysis', isActive: true, isDefault: false },
    { id: 'truSculpt-flex', name: 'truSculpt flex', brand: 'Cutera', category: 'muscle-toning', isActive: true, isDefault: false },
    { id: 'sculpsure', name: 'SculpSure', brand: 'Cynosure', category: 'laser-lipolysis', isActive: true, isDefault: false },
    { id: 'kybella', name: 'Kybella', brand: 'Allergan', category: 'injection-lipolysis', isActive: true, isDefault: true },
    { id: 'vanquish', name: 'Vanquish ME', brand: 'BTL', category: 'rf-lipolysis', isActive: true, isDefault: false },
    { id: 'velashape', name: 'VelaShape III', brand: 'Syneron Candela', category: 'cellulite', isActive: true, isDefault: false },
    { id: 'qwo', name: 'QWO', brand: 'Endo', category: 'cellulite', isActive: false, isDefault: false },
    { id: 'emtone', name: 'Emtone', brand: 'BTL', category: 'cellulite', isActive: true, isDefault: false },
    { id: 'exilis', name: 'Exilis Ultra 360', brand: 'BTL', category: 'skin-tightening', isActive: true, isDefault: false },
    { id: 'sofwave', name: 'Sofwave', brand: 'Sofwave', category: 'skin-tightening', isActive: true, isDefault: false },
    { id: 'ulthera', name: 'Ultherapy', brand: 'Merz', category: 'skin-tightening', isActive: true, isDefault: true },
  ],
  parameters: [
    { id: 'cool-temp', name: 'Temperature', defaultValue: -11, unit: 'C', minValue: -15, maxValue: 0, isActive: true },
    { id: 'cool-time', name: 'Treatment Time', defaultValue: 35, unit: 'min', minValue: 25, maxValue: 75, isActive: true },
    { id: 'cool-cycles', name: 'Cycles', defaultValue: 1, unit: '', minValue: 1, maxValue: 4, isActive: true },
    { id: 'ems-intensity', name: 'EMSculpt Intensity', defaultValue: 100, unit: '%', minValue: 0, maxValue: 100, isActive: true },
    { id: 'ems-time', name: 'EMSculpt Time', defaultValue: 30, unit: 'min', minValue: 20, maxValue: 45, isActive: true },
    { id: 'kybella-vials', name: 'Kybella Vials', defaultValue: 2, unit: '', minValue: 1, maxValue: 6, isActive: true },
    { id: 'kybella-injections', name: 'Injection Points', defaultValue: 20, unit: '', minValue: 10, maxValue: 50, isActive: true },
    { id: 'ulthera-lines', name: 'Ultherapy Lines', defaultValue: 400, unit: '', minValue: 100, maxValue: 1200, isActive: true },
    { id: 'ulthera-depth', name: 'Transducer Depth', defaultValue: '4.5', unit: 'mm', options: ['1.5', '3.0', '4.5'], isActive: true },
  ],
  needlesSizes: [],
  zones: [
    { id: 'zone-submental', name: 'Submental (Double Chin)', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-abdomen', name: 'Abdomen', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-flanks', name: 'Flanks', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-inner-thigh', name: 'Inner Thighs', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-outer-thigh', name: 'Outer Thighs', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-bra-fat', name: 'Bra Fat', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-back-fat', name: 'Back Fat', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-banana-roll', name: 'Banana Roll', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-arms-body', name: 'Upper Arms', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-buttocks', name: 'Buttocks', category: 'body', isActive: true, isCustom: false },
  ],
  templates: [
    { id: 'tmpl-coolsculpt', name: 'CoolSculpting Treatment', category: 'cryolipolysis', template: 'CoolSculpting {cycles} cycles, {time} min at {temp}C', variables: ['cycles', 'time', 'temp'], isActive: true, isDefault: true },
    { id: 'tmpl-kybella', name: 'Kybella Submental', category: 'injection-lipolysis', template: 'Kybella {vials} vials, {injections} injection points in submental area', variables: ['vials', 'injections'], isActive: true, isDefault: true },
  ],
}

// =============================================================================
// THREADS
// =============================================================================

export const DEFAULT_THREADS_SETTINGS: CategorySettings = {
  products: [
    { id: 'pdo-smooth', name: 'PDO Smooth Threads', brand: 'Various', category: 'pdo', isActive: true, isDefault: true },
    { id: 'pdo-twist', name: 'PDO Twist/Screw', brand: 'Various', category: 'pdo', isActive: true, isDefault: false },
    { id: 'pdo-cog', name: 'PDO Cog Threads', brand: 'Various', category: 'pdo', isActive: true, isDefault: false },
    { id: 'pdo-mono', name: 'PDO Mono Threads', brand: 'Various', category: 'pdo', isActive: true, isDefault: false },
    { id: 'plla', name: 'PLLA Threads', brand: 'Various', category: 'plla', isActive: true, isDefault: false },
    { id: 'pca', name: 'PCA Threads', brand: 'Various', category: 'pca', isActive: true, isDefault: false },
    { id: 'silhouette', name: 'Silhouette InstaLift', brand: 'Sinclair', category: 'plla', isActive: true, isDefault: true },
    { id: 'novathreads', name: 'NovaThreads', brand: 'NovaThreads', category: 'pdo', isActive: true, isDefault: false },
    { id: 'aptos', name: 'Aptos Threads', brand: 'Aptos', category: 'plla', isActive: true, isDefault: false },
    { id: 'mint', name: 'MINT Threads', brand: 'MINT', category: 'pdo', isActive: true, isDefault: false },
  ],
  parameters: [
    { id: 'thread-length', name: 'Thread Length', defaultValue: 60, unit: 'mm', minValue: 25, maxValue: 300, isActive: true },
    { id: 'thread-gauge', name: 'Thread Gauge', defaultValue: '19G', unit: '', options: ['18G', '19G', '21G', '23G', '25G', '29G', '30G'], isActive: true },
    { id: 'thread-type', name: 'Thread Type', defaultValue: 'cog', unit: '', options: ['smooth', 'twist', 'cog', 'barbed'], isActive: true },
    { id: 'thread-count', name: 'Thread Count', defaultValue: 4, unit: '', minValue: 1, maxValue: 20, isActive: true },
    { id: 'insertion-depth', name: 'Insertion Depth', defaultValue: 'subdermal', unit: '', options: ['intradermal', 'subdermal', 'subcutaneous', 'SMAS'], isActive: true },
    { id: 'vector', name: 'Vector Direction', defaultValue: 'vertical', unit: '', options: ['vertical', 'oblique', 'horizontal', 'custom'], isActive: true },
  ],
  needlesSizes: [
    { id: 'thread-18g', gauge: '18G', length: '100mm', type: 'cannula', recommendedFor: ['Large cog threads'], isActive: true, isDefault: false },
    { id: 'thread-19g', gauge: '19G', length: '90mm', type: 'cannula', recommendedFor: ['Standard cog threads'], isActive: true, isDefault: true },
    { id: 'thread-21g', gauge: '21G', length: '60mm', type: 'cannula', recommendedFor: ['Small cog threads'], isActive: true, isDefault: false },
    { id: 'thread-25g', gauge: '25G', length: '50mm', type: 'needle', recommendedFor: ['Smooth threads'], isActive: true, isDefault: false },
    { id: 'thread-29g', gauge: '29G', length: '38mm', type: 'needle', recommendedFor: ['Fine smooth threads'], isActive: true, isDefault: false },
  ],
  zones: [
    { id: 'zone-thread-brow', name: 'Brow Lift', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-thread-midface', name: 'Mid-Face Lift', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-thread-jowl', name: 'Jowl Lift', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-thread-neck', name: 'Neck Lift', category: 'neck', isActive: true, isCustom: false },
    { id: 'zone-thread-nose', name: 'Nose Lift', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-thread-lip', name: 'Lip Lift', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-thread-marionette', name: 'Marionette Area', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-thread-nasolabial', name: 'Nasolabial Area', category: 'face', isActive: true, isCustom: false },
  ],
  templates: [
    { id: 'tmpl-thread-lift', name: 'PDO Thread Lift', category: 'pdo', template: '{count} {type} threads inserted {depth} for {area} lift using {gauge} cannula', variables: ['count', 'type', 'depth', 'area', 'gauge'], isActive: true, isDefault: true },
  ],
}

// =============================================================================
// IV THERAPY
// =============================================================================

export const DEFAULT_IV_THERAPY_SETTINGS: CategorySettings = {
  products: [
    { id: 'iv-myers', name: 'Myers Cocktail', brand: 'Custom', category: 'vitamin', isActive: true, isDefault: true },
    { id: 'iv-glutathione', name: 'Glutathione', brand: 'Custom', category: 'antioxidant', isActive: true, isDefault: false },
    { id: 'iv-vitamin-c', name: 'High-Dose Vitamin C', brand: 'Custom', category: 'vitamin', isActive: true, isDefault: false },
    { id: 'iv-nad', name: 'NAD+', brand: 'Custom', category: 'anti-aging', isActive: true, isDefault: false },
    { id: 'iv-immune', name: 'Immune Boost', brand: 'Custom', category: 'immune', isActive: true, isDefault: false },
    { id: 'iv-hydration', name: 'Hydration', brand: 'Custom', category: 'hydration', isActive: true, isDefault: true },
    { id: 'iv-athletic', name: 'Athletic Performance', brand: 'Custom', category: 'performance', isActive: true, isDefault: false },
    { id: 'iv-beauty', name: 'Beauty Drip', brand: 'Custom', category: 'beauty', isActive: true, isDefault: false },
    { id: 'iv-hangover', name: 'Hangover Recovery', brand: 'Custom', category: 'recovery', isActive: true, isDefault: false },
    { id: 'iv-weight-loss', name: 'Weight Loss Support', brand: 'Custom', category: 'metabolism', isActive: true, isDefault: false },
    { id: 'iv-b12', name: 'B12 Shot', brand: 'Custom', category: 'injection', isActive: true, isDefault: true },
    { id: 'iv-lipo', name: 'Lipotropic Injection', brand: 'Custom', category: 'injection', isActive: true, isDefault: false },
    { id: 'iv-biotin', name: 'Biotin', brand: 'Custom', category: 'injection', isActive: true, isDefault: false },
  ],
  parameters: [
    { id: 'iv-volume', name: 'Fluid Volume', defaultValue: 500, unit: 'ml', options: ['250', '500', '1000'], isActive: true },
    { id: 'iv-rate', name: 'Drip Rate', defaultValue: 'moderate', unit: '', options: ['slow', 'moderate', 'fast'], isActive: true },
    { id: 'iv-duration', name: 'Infusion Duration', defaultValue: 45, unit: 'min', minValue: 20, maxValue: 120, isActive: true },
    { id: 'iv-additives', name: 'Add-On Nutrients', defaultValue: '', unit: '', isActive: true },
    { id: 'glutathione-dose', name: 'Glutathione Dose', defaultValue: 1000, unit: 'mg', options: ['400', '600', '1000', '2000'], isActive: true },
    { id: 'vitc-dose', name: 'Vitamin C Dose', defaultValue: 5000, unit: 'mg', options: ['2500', '5000', '10000', '25000'], isActive: true },
    { id: 'nad-dose', name: 'NAD+ Dose', defaultValue: 250, unit: 'mg', options: ['100', '250', '500', '1000'], isActive: true },
    { id: 'b12-dose', name: 'B12 Dose', defaultValue: 1, unit: 'ml', options: ['0.5', '1', '2'], isActive: true },
  ],
  needlesSizes: [
    { id: 'iv-18g', gauge: '18G', length: '1.25"', type: 'needle', recommendedFor: ['Large volume infusions'], isActive: true, isDefault: false },
    { id: 'iv-20g', gauge: '20G', length: '1.25"', type: 'needle', recommendedFor: ['Standard infusions'], isActive: true, isDefault: true },
    { id: 'iv-22g', gauge: '22G', length: '1"', type: 'needle', recommendedFor: ['Smaller veins'], isActive: true, isDefault: false },
    { id: 'iv-24g', gauge: '24G', length: '0.75"', type: 'needle', recommendedFor: ['Pediatric/fragile veins'], isActive: true, isDefault: false },
    { id: 'butterfly-21g', gauge: '21G', length: 'butterfly', type: 'needle', recommendedFor: ['IM injections'], isActive: true, isDefault: true },
    { id: 'butterfly-23g', gauge: '23G', length: 'butterfly', type: 'needle', recommendedFor: ['IM injections'], isActive: true, isDefault: false },
  ],
  zones: [
    { id: 'zone-antecubital', name: 'Antecubital Fossa', category: 'arm', isActive: true, isCustom: false },
    { id: 'zone-forearm', name: 'Forearm', category: 'arm', isActive: true, isCustom: false },
    { id: 'zone-hand-iv', name: 'Hand', category: 'arm', isActive: true, isCustom: false },
    { id: 'zone-deltoid', name: 'Deltoid (IM)', category: 'arm', isActive: true, isCustom: false },
    { id: 'zone-gluteal', name: 'Gluteal (IM)', category: 'body', isActive: true, isCustom: false },
  ],
  templates: [
    { id: 'tmpl-myers', name: 'Myers Cocktail', category: 'vitamin', template: 'Myers Cocktail: {volume}ml IV over {duration} min with {additives}', variables: ['volume', 'duration', 'additives'], isActive: true, isDefault: true },
    { id: 'tmpl-glut', name: 'Glutathione IV Push', category: 'antioxidant', template: 'Glutathione {dose}mg IV push', variables: ['dose'], isActive: true, isDefault: true },
  ],
}

// =============================================================================
// WEIGHT LOSS
// =============================================================================

export const DEFAULT_WEIGHT_LOSS_SETTINGS: CategorySettings = {
  products: [
    { id: 'wl-semaglutide', name: 'Semaglutide', brand: 'Compounded', category: 'glp1', isActive: true, isDefault: true },
    { id: 'wl-ozempic', name: 'Ozempic', brand: 'Novo Nordisk', category: 'glp1', isActive: true, isDefault: false },
    { id: 'wl-wegovy', name: 'Wegovy', brand: 'Novo Nordisk', category: 'glp1', isActive: true, isDefault: false },
    { id: 'wl-tirzepatide', name: 'Tirzepatide', brand: 'Compounded', category: 'glp1-gip', isActive: true, isDefault: true },
    { id: 'wl-mounjaro', name: 'Mounjaro', brand: 'Eli Lilly', category: 'glp1-gip', isActive: true, isDefault: false },
    { id: 'wl-zepbound', name: 'Zepbound', brand: 'Eli Lilly', category: 'glp1-gip', isActive: true, isDefault: false },
    { id: 'wl-phentermine', name: 'Phentermine', brand: 'Various', category: 'appetite-suppressant', isActive: true, isDefault: false },
    { id: 'wl-contrave', name: 'Contrave', brand: 'Nalpropion', category: 'combination', isActive: false, isDefault: false },
    { id: 'wl-lipo-shot', name: 'Lipotropic Injection', brand: 'Compounded', category: 'injection', isActive: true, isDefault: true },
    { id: 'wl-b12-shot', name: 'B12 Injection', brand: 'Compounded', category: 'injection', isActive: true, isDefault: false },
    { id: 'wl-mic-shot', name: 'MIC Injection', brand: 'Compounded', category: 'injection', isActive: true, isDefault: false },
  ],
  parameters: [
    { id: 'sema-dose', name: 'Semaglutide Dose', defaultValue: 0.25, unit: 'mg', options: ['0.25', '0.5', '1.0', '1.7', '2.4'], isActive: true },
    { id: 'tirz-dose', name: 'Tirzepatide Dose', defaultValue: 2.5, unit: 'mg', options: ['2.5', '5', '7.5', '10', '12.5', '15'], isActive: true },
    { id: 'inj-site', name: 'Injection Site', defaultValue: 'abdomen', unit: '', options: ['abdomen', 'thigh', 'upper-arm'], isActive: true },
    { id: 'inj-rotation', name: 'Site Rotation', defaultValue: 'yes', unit: '', options: ['yes', 'no'], isActive: true },
    { id: 'frequency', name: 'Dosing Frequency', defaultValue: 'weekly', unit: '', options: ['weekly', 'twice-weekly', 'monthly'], isActive: true },
    { id: 'titration-week', name: 'Titration Week', defaultValue: 1, unit: '', minValue: 1, maxValue: 20, isActive: true },
    { id: 'lipo-volume', name: 'Lipo Shot Volume', defaultValue: 1, unit: 'ml', options: ['0.5', '1', '2'], isActive: true },
  ],
  needlesSizes: [
    { id: 'wl-29g', gauge: '29G', length: '0.5"', type: 'needle', recommendedFor: ['Subcutaneous injection'], isActive: true, isDefault: true },
    { id: 'wl-30g', gauge: '30G', length: '0.5"', type: 'needle', recommendedFor: ['Subcutaneous injection'], isActive: true, isDefault: false },
    { id: 'wl-31g', gauge: '31G', length: '5/16"', type: 'needle', recommendedFor: ['Pen needles'], isActive: true, isDefault: false },
    { id: 'wl-25g', gauge: '25G', length: '1"', type: 'needle', recommendedFor: ['IM injections'], isActive: true, isDefault: false },
  ],
  zones: [
    { id: 'zone-wl-abdomen', name: 'Abdomen', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-wl-thigh', name: 'Thigh', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-wl-arm', name: 'Upper Arm', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-wl-gluteal', name: 'Gluteal', category: 'body', isActive: true, isCustom: false },
  ],
  templates: [
    { id: 'tmpl-sema', name: 'Semaglutide Weekly', category: 'glp1', template: 'Semaglutide {dose}mg subcutaneous injection in {site}, titration week {week}', variables: ['dose', 'site', 'week'], isActive: true, isDefault: true },
    { id: 'tmpl-tirz', name: 'Tirzepatide Weekly', category: 'glp1-gip', template: 'Tirzepatide {dose}mg subcutaneous injection in {site}, titration week {week}', variables: ['dose', 'site', 'week'], isActive: true, isDefault: true },
  ],
}

// =============================================================================
// HAIR RESTORATION
// =============================================================================

export const DEFAULT_HAIR_RESTORATION_SETTINGS: CategorySettings = {
  products: [
    { id: 'prp-hair', name: 'PRP for Hair', brand: 'In-house', category: 'prp', isActive: true, isDefault: true },
    { id: 'prf-hair', name: 'PRF for Hair', brand: 'In-house', category: 'prf', isActive: true, isDefault: false },
    { id: 'exosomes-hair', name: 'Exosomes', brand: 'Various', category: 'regenerative', isActive: true, isDefault: false },
    { id: 'laser-cap', name: 'Laser Cap/LLLT', brand: 'Various', category: 'lllt', isActive: true, isDefault: true },
    { id: 'theradome', name: 'Theradome', brand: 'Theradome', category: 'lllt', isActive: true, isDefault: false },
    { id: 'capillus', name: 'Capillus', brand: 'Capillus', category: 'lllt', isActive: true, isDefault: false },
    { id: 'minoxidil', name: 'Minoxidil', brand: 'Various', category: 'topical', isActive: true, isDefault: true },
    { id: 'finasteride', name: 'Finasteride', brand: 'Various', category: 'oral', isActive: true, isDefault: false },
    { id: 'nutrafol', name: 'Nutrafol', brand: 'Nutrafol', category: 'supplement', isActive: true, isDefault: false },
    { id: 'viviscal', name: 'Viviscal', brand: 'Viviscal', category: 'supplement', isActive: true, isDefault: false },
    { id: 'keravive', name: 'HydraFacial Keravive', brand: 'HydraFacial', category: 'scalp', isActive: true, isDefault: false },
  ],
  parameters: [
    { id: 'prp-tubes-hair', name: 'PRP Tubes', defaultValue: 2, unit: '', minValue: 1, maxValue: 6, isActive: true },
    { id: 'prp-spins', name: 'Centrifuge Spins', defaultValue: 2, unit: '', options: ['1', '2'], isActive: true },
    { id: 'injection-depth-hair', name: 'Injection Depth', defaultValue: 'dermal', unit: '', options: ['superficial', 'dermal', 'subdermal'], isActive: true },
    { id: 'session-spacing', name: 'Session Spacing', defaultValue: 4, unit: 'weeks', minValue: 2, maxValue: 8, isActive: true },
    { id: 'lllt-duration', name: 'LLLT Duration', defaultValue: 20, unit: 'min', minValue: 6, maxValue: 30, isActive: true },
    { id: 'lllt-frequency', name: 'LLLT Frequency', defaultValue: 'daily', unit: '', options: ['daily', 'every-other-day', '3x-weekly'], isActive: true },
  ],
  needlesSizes: [
    { id: 'hair-30g', gauge: '30G', length: '13mm', type: 'needle', recommendedFor: ['PRP scalp injections'], isActive: true, isDefault: true },
    { id: 'hair-32g', gauge: '32G', length: '4mm', type: 'needle', recommendedFor: ['Superficial injections'], isActive: true, isDefault: false },
    { id: 'meso-gun', gauge: 'Meso Gun', length: 'variable', type: 'needle', recommendedFor: ['Rapid injections'], isActive: true, isDefault: false },
  ],
  zones: [
    { id: 'zone-hair-frontal', name: 'Frontal Hairline', category: 'scalp', isActive: true, isCustom: false },
    { id: 'zone-hair-temple', name: 'Temples', category: 'scalp', isActive: true, isCustom: false },
    { id: 'zone-hair-crown', name: 'Crown/Vertex', category: 'scalp', isActive: true, isCustom: false },
    { id: 'zone-hair-midscalp', name: 'Mid-Scalp', category: 'scalp', isActive: true, isCustom: false },
    { id: 'zone-hair-occipital', name: 'Occipital', category: 'scalp', isActive: true, isCustom: false },
    { id: 'zone-hair-brow', name: 'Eyebrows', category: 'face', isActive: true, isCustom: false },
  ],
  templates: [
    { id: 'tmpl-prp-hair', name: 'PRP Hair Restoration', category: 'prp', template: 'PRP hair restoration: {tubes} tubes, injected into {zones} using {gauge} needle', variables: ['tubes', 'zones', 'gauge'], isActive: true, isDefault: true },
  ],
}

// =============================================================================
// HORMONE THERAPY
// =============================================================================

export const DEFAULT_HORMONE_THERAPY_SETTINGS: CategorySettings = {
  products: [
    { id: 'bhrt-estrogen', name: 'Bioidentical Estrogen', brand: 'Compounded', category: 'bhrt', isActive: true, isDefault: true },
    { id: 'bhrt-progesterone', name: 'Bioidentical Progesterone', brand: 'Compounded', category: 'bhrt', isActive: true, isDefault: true },
    { id: 'bhrt-testosterone-f', name: 'Testosterone (Female)', brand: 'Compounded', category: 'bhrt', isActive: true, isDefault: false },
    { id: 'bhrt-testosterone-m', name: 'Testosterone (Male)', brand: 'Compounded', category: 'trt', isActive: true, isDefault: true },
    { id: 'bhrt-dhea', name: 'DHEA', brand: 'Various', category: 'supplement', isActive: true, isDefault: false },
    { id: 'pellet-testopel', name: 'Testopel', brand: 'Endo', category: 'pellet', isActive: true, isDefault: true },
    { id: 'pellet-biote', name: 'BioTE Pellets', brand: 'BioTE', category: 'pellet', isActive: true, isDefault: false },
    { id: 'pellet-sottopelle', name: 'SottoPelle', brand: 'SottoPelle', category: 'pellet', isActive: true, isDefault: false },
    { id: 'thyroid', name: 'Thyroid (Compounded)', brand: 'Compounded', category: 'thyroid', isActive: true, isDefault: false },
    { id: 'hcg', name: 'HCG', brand: 'Various', category: 'ancillary', isActive: true, isDefault: false },
    { id: 'anastrozole', name: 'Anastrozole', brand: 'Various', category: 'ancillary', isActive: true, isDefault: false },
  ],
  parameters: [
    { id: 'pellet-dose', name: 'Pellet Dosage', defaultValue: 100, unit: 'mg', minValue: 25, maxValue: 400, isActive: true },
    { id: 'pellet-count', name: 'Number of Pellets', defaultValue: 4, unit: '', minValue: 1, maxValue: 12, isActive: true },
    { id: 'test-dose', name: 'Testosterone Dose', defaultValue: 100, unit: 'mg/week', minValue: 25, maxValue: 300, isActive: true },
    { id: 'injection-frequency', name: 'Injection Frequency', defaultValue: 'weekly', unit: '', options: ['twice-weekly', 'weekly', 'bi-weekly'], isActive: true },
    { id: 'pellet-spacing', name: 'Pellet Replacement', defaultValue: 4, unit: 'months', minValue: 3, maxValue: 6, isActive: true },
    { id: 'lab-monitoring', name: 'Lab Monitoring', defaultValue: '6-weeks', unit: '', options: ['4-weeks', '6-weeks', '8-weeks', '12-weeks'], isActive: true },
  ],
  needlesSizes: [
    { id: 'hrt-trocar', gauge: '10G', length: 'Trocar', type: 'cannula', recommendedFor: ['Pellet insertion'], isActive: true, isDefault: true },
    { id: 'hrt-25g', gauge: '25G', length: '1"', type: 'needle', recommendedFor: ['IM testosterone'], isActive: true, isDefault: true },
    { id: 'hrt-23g', gauge: '23G', length: '1.5"', type: 'needle', recommendedFor: ['Deep IM injection'], isActive: true, isDefault: false },
    { id: 'hrt-27g', gauge: '27G', length: '0.5"', type: 'needle', recommendedFor: ['Subcutaneous injection'], isActive: true, isDefault: false },
  ],
  zones: [
    { id: 'zone-pellet-hip', name: 'Upper Hip/Buttock', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-pellet-flank', name: 'Flank', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-hrt-deltoid', name: 'Deltoid (IM)', category: 'arm', isActive: true, isCustom: false },
    { id: 'zone-hrt-gluteal', name: 'Gluteal (IM)', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-hrt-thigh', name: 'Thigh (IM)', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-hrt-abdomen', name: 'Abdomen (SubQ)', category: 'body', isActive: true, isCustom: false },
  ],
  templates: [
    { id: 'tmpl-pellet', name: 'Hormone Pellet Insertion', category: 'pellet', template: '{count} pellets ({dose}mg each) inserted in {site} via {gauge} trocar', variables: ['count', 'dose', 'site', 'gauge'], isActive: true, isDefault: true },
    { id: 'tmpl-trt', name: 'TRT Injection', category: 'trt', template: 'Testosterone cypionate {dose}mg IM in {site}', variables: ['dose', 'site'], isActive: true, isDefault: true },
  ],
}

// =============================================================================
// SEXUAL WELLNESS
// =============================================================================

export const DEFAULT_SEXUAL_WELLNESS_SETTINGS: CategorySettings = {
  products: [
    { id: 'oshot', name: 'O-Shot', brand: 'In-house PRP', category: 'prp', isActive: true, isDefault: true },
    { id: 'pshot', name: 'P-Shot/Priapus Shot', brand: 'In-house PRP', category: 'prp', isActive: true, isDefault: true },
    { id: 'votiva', name: 'Votiva', brand: 'InMode', category: 'rf', isActive: true, isDefault: true },
    { id: 'femilift', name: 'FemiLift', brand: 'Alma', category: 'laser', isActive: true, isDefault: false },
    { id: 'mona-lisa', name: 'MonaLisa Touch', brand: 'Cynosure', category: 'laser', isActive: true, isDefault: false },
    { id: 'diVa', name: 'diVa', brand: 'Sciton', category: 'laser', isActive: true, isDefault: false },
    { id: 'viveve', name: 'Viveve', brand: 'Viveve', category: 'rf', isActive: true, isDefault: false },
    { id: 'thermiVa', name: 'ThermiVa', brand: 'ThermiGen', category: 'rf', isActive: true, isDefault: false },
    { id: 'emsella', name: 'Emsella', brand: 'BTL', category: 'hifem', isActive: true, isDefault: true },
    { id: 'gainswave', name: 'GAINSWave', brand: 'GAINSWave', category: 'shockwave', isActive: true, isDefault: false },
    { id: 'pt-141', name: 'PT-141 (Bremelanotide)', brand: 'Compounded', category: 'peptide', isActive: true, isDefault: false },
  ],
  parameters: [
    { id: 'prp-tubes-sw', name: 'PRP Tubes', defaultValue: 2, unit: '', minValue: 1, maxValue: 4, isActive: true },
    { id: 'rf-temp-sw', name: 'RF Temperature', defaultValue: 42, unit: 'C', minValue: 38, maxValue: 45, isActive: true },
    { id: 'laser-energy-sw', name: 'Laser Energy', defaultValue: 20, unit: 'mJ', minValue: 10, maxValue: 40, isActive: true },
    { id: 'emsella-intensity', name: 'Emsella Intensity', defaultValue: 100, unit: '%', minValue: 0, maxValue: 100, isActive: true },
    { id: 'emsella-sessions', name: 'Sessions per Protocol', defaultValue: 6, unit: '', minValue: 4, maxValue: 12, isActive: true },
    { id: 'shockwave-pulses', name: 'Shockwave Pulses', defaultValue: 3000, unit: '', minValue: 1500, maxValue: 5000, isActive: true },
  ],
  needlesSizes: [
    { id: 'sw-27g', gauge: '27G', length: '13mm', type: 'needle', recommendedFor: ['PRP injections'], isActive: true, isDefault: true },
    { id: 'sw-30g', gauge: '30G', length: '13mm', type: 'needle', recommendedFor: ['Fine PRP work'], isActive: true, isDefault: false },
  ],
  zones: [
    { id: 'zone-sw-clitoral', name: 'Clitoral Hood', category: 'vaginal', isActive: true, isCustom: false },
    { id: 'zone-sw-anterior', name: 'Anterior Wall', category: 'vaginal', isActive: true, isCustom: false },
    { id: 'zone-sw-labia', name: 'Labia', category: 'vaginal', isActive: true, isCustom: false },
    { id: 'zone-sw-penile', name: 'Penile Shaft', category: 'male', isActive: true, isCustom: false },
    { id: 'zone-sw-glans', name: 'Glans', category: 'male', isActive: true, isCustom: false },
    { id: 'zone-sw-pelvic', name: 'Pelvic Floor', category: 'body', isActive: true, isCustom: false },
  ],
  templates: [
    { id: 'tmpl-oshot', name: 'O-Shot Treatment', category: 'prp', template: 'O-Shot: {tubes} tubes PRP injected into clitoral hood and anterior wall', variables: ['tubes'], isActive: true, isDefault: true },
    { id: 'tmpl-emsella', name: 'Emsella Session', category: 'hifem', template: 'Emsella session {session} of {total}, {intensity}% intensity, 28 minutes', variables: ['session', 'total', 'intensity'], isActive: true, isDefault: true },
  ],
}

// =============================================================================
// VEIN TREATMENTS
// =============================================================================

export const DEFAULT_VEIN_TREATMENTS_SETTINGS: CategorySettings = {
  products: [
    { id: 'sotradecol', name: 'Sotradecol (STS)', brand: 'Angiodynamics', category: 'sclerosant', isActive: true, isDefault: true },
    { id: 'polidocanol', name: 'Asclera (Polidocanol)', brand: 'Merz', category: 'sclerosant', isActive: true, isDefault: true },
    { id: 'glycerin', name: 'Chromated Glycerin', brand: 'Various', category: 'sclerosant', isActive: true, isDefault: false },
    { id: 'saline-hypertonic', name: 'Hypertonic Saline', brand: 'Various', category: 'sclerosant', isActive: false, isDefault: false },
    { id: 'vein-laser', name: 'Vascular Laser', brand: 'Various', category: 'laser', isActive: true, isDefault: true },
    { id: 'vein-ipl', name: 'Vascular IPL', brand: 'Various', category: 'ipl', isActive: true, isDefault: false },
    { id: 'excel-v-vein', name: 'Excel V+ (Vascular)', brand: 'Cutera', category: 'laser', isActive: true, isDefault: false },
    { id: 'vbeam-vein', name: 'VBeam (Vascular)', brand: 'Candela', category: 'laser', isActive: true, isDefault: false },
  ],
  parameters: [
    { id: 'sclerosant-conc', name: 'Concentration', defaultValue: 0.5, unit: '%', options: ['0.25', '0.5', '0.75', '1.0', '3.0'], isActive: true },
    { id: 'sclerosant-vol', name: 'Volume per Injection', defaultValue: 0.1, unit: 'ml', minValue: 0.05, maxValue: 0.5, isActive: true },
    { id: 'total-volume', name: 'Total Volume', defaultValue: 5, unit: 'ml', minValue: 1, maxValue: 10, isActive: true },
    { id: 'vein-laser-fluence', name: 'Laser Fluence', defaultValue: 15, unit: 'J/cm2', minValue: 8, maxValue: 25, isActive: true },
    { id: 'vein-pulse', name: 'Pulse Duration', defaultValue: 20, unit: 'ms', minValue: 5, maxValue: 50, isActive: true },
    { id: 'vein-spot', name: 'Spot Size', defaultValue: 3, unit: 'mm', minValue: 1, maxValue: 6, isActive: true },
    { id: 'compression-time', name: 'Compression Duration', defaultValue: 48, unit: 'hours', options: ['24', '48', '72', '1-week', '2-weeks'], isActive: true },
  ],
  needlesSizes: [
    { id: 'vein-30g', gauge: '30G', length: '0.5"', type: 'needle', recommendedFor: ['Spider veins', 'Telangiectasias'], isActive: true, isDefault: true },
    { id: 'vein-27g', gauge: '27G', length: '0.5"', type: 'needle', recommendedFor: ['Reticular veins'], isActive: true, isDefault: false },
    { id: 'vein-25g', gauge: '25G', length: '0.625"', type: 'needle', recommendedFor: ['Larger reticular veins'], isActive: true, isDefault: false },
  ],
  zones: [
    { id: 'zone-vein-thigh', name: 'Thigh', category: 'leg', isActive: true, isCustom: false },
    { id: 'zone-vein-calf', name: 'Calf', category: 'leg', isActive: true, isCustom: false },
    { id: 'zone-vein-ankle', name: 'Ankle/Foot', category: 'leg', isActive: true, isCustom: false },
    { id: 'zone-vein-knee', name: 'Behind Knee', category: 'leg', isActive: true, isCustom: false },
    { id: 'zone-vein-face', name: 'Facial Veins', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-vein-nose', name: 'Nasal Veins', category: 'face', isActive: true, isCustom: false },
  ],
  templates: [
    { id: 'tmpl-sclero', name: 'Sclerotherapy Session', category: 'sclerosant', template: 'Sclerotherapy with {agent} {conc}%, {vol}ml total, {zones}', variables: ['agent', 'conc', 'vol', 'zones'], isActive: true, isDefault: true },
  ],
}

// =============================================================================
// HYPERBARIC OXYGEN
// =============================================================================

export const DEFAULT_HYPERBARIC_OXYGEN_SETTINGS: CategorySettings = {
  products: [
    { id: 'hbot-hard', name: 'Hard Chamber HBOT', brand: 'Various', category: 'hbot', isActive: true, isDefault: true },
    { id: 'hbot-soft', name: 'Soft Chamber mHBOT', brand: 'Various', category: 'mhbot', isActive: true, isDefault: false },
    { id: 'hbot-multiplace', name: 'Multiplace Chamber', brand: 'Various', category: 'hbot', isActive: true, isDefault: false },
    { id: 'oxygen-facial', name: 'Oxygen Facial', brand: 'Various', category: 'topical', isActive: true, isDefault: true },
    { id: 'intranasal-o2', name: 'Intranasal Oxygen', brand: 'Various', category: 'supplemental', isActive: true, isDefault: false },
  ],
  parameters: [
    { id: 'hbot-pressure', name: 'Pressure (ATA)', defaultValue: 2.0, unit: 'ATA', options: ['1.3', '1.5', '2.0', '2.4', '3.0'], isActive: true },
    { id: 'hbot-duration', name: 'Session Duration', defaultValue: 60, unit: 'min', minValue: 30, maxValue: 120, isActive: true },
    { id: 'hbot-o2-purity', name: 'Oxygen Purity', defaultValue: 100, unit: '%', options: ['90', '95', '100'], isActive: true },
    { id: 'dive-profile', name: 'Dive Profile', defaultValue: 'standard', unit: '', options: ['standard', 'wound-healing', 'neuro'], isActive: true },
    { id: 'compression-rate', name: 'Compression Rate', defaultValue: 2, unit: 'psi/min', minValue: 1, maxValue: 5, isActive: true },
    { id: 'sessions-protocol', name: 'Sessions per Protocol', defaultValue: 40, unit: '', minValue: 10, maxValue: 60, isActive: true },
  ],
  needlesSizes: [],
  zones: [
    { id: 'zone-hbot-whole', name: 'Whole Body', category: 'systemic', isActive: true, isCustom: false },
    { id: 'zone-hbot-wound', name: 'Wound Site', category: 'targeted', isActive: true, isCustom: false },
    { id: 'zone-hbot-brain', name: 'Neurological', category: 'targeted', isActive: true, isCustom: false },
  ],
  templates: [
    { id: 'tmpl-hbot', name: 'HBOT Session', category: 'hbot', template: 'HBOT session: {pressure} ATA, {duration} min, 100% O2, {profile} protocol', variables: ['pressure', 'duration', 'profile'], isActive: true, isDefault: true },
  ],
}

// =============================================================================
// CRYOTHERAPY
// =============================================================================

export const DEFAULT_CRYOTHERAPY_SETTINGS: CategorySettings = {
  products: [
    { id: 'cryo-whole', name: 'Whole Body Cryotherapy', brand: 'Various', category: 'wbc', isActive: true, isDefault: true },
    { id: 'cryo-localized', name: 'Localized Cryotherapy', brand: 'Various', category: 'local', isActive: true, isDefault: true },
    { id: 'cryo-facial', name: 'Cryo Facial', brand: 'Various', category: 'facial', isActive: true, isDefault: true },
    { id: 'cryo-scalp', name: 'Cryo Scalp', brand: 'Various', category: 'scalp', isActive: true, isDefault: false },
    { id: 'cryoslimming', name: 'CryoSlimming', brand: 'Various', category: 'body', isActive: true, isDefault: false },
    { id: 'cryotoning', name: 'CryoToning', brand: 'Various', category: 'body', isActive: true, isDefault: false },
    { id: 'cryo-t-shock', name: 'Cryo T-Shock', brand: 'Pagani', category: 'combo', isActive: true, isDefault: false },
  ],
  parameters: [
    { id: 'cryo-temp-wbc', name: 'WBC Temperature', defaultValue: -120, unit: 'C', minValue: -160, maxValue: -90, isActive: true },
    { id: 'cryo-duration-wbc', name: 'WBC Duration', defaultValue: 3, unit: 'min', minValue: 1, maxValue: 4, isActive: true },
    { id: 'cryo-temp-local', name: 'Local Cryo Temp', defaultValue: -30, unit: 'C', minValue: -40, maxValue: -10, isActive: true },
    { id: 'cryo-duration-local', name: 'Local Duration', defaultValue: 10, unit: 'min', minValue: 5, maxValue: 20, isActive: true },
    { id: 'cryo-facial-temp', name: 'Facial Cryo Temp', defaultValue: -10, unit: 'C', minValue: -20, maxValue: 0, isActive: true },
    { id: 'cryo-cycles', name: 'Treatment Cycles', defaultValue: 3, unit: '', minValue: 1, maxValue: 6, isActive: true },
  ],
  needlesSizes: [],
  zones: [
    { id: 'zone-cryo-whole', name: 'Whole Body', category: 'systemic', isActive: true, isCustom: false },
    { id: 'zone-cryo-face', name: 'Face', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-cryo-neck', name: 'Neck', category: 'neck', isActive: true, isCustom: false },
    { id: 'zone-cryo-abdomen', name: 'Abdomen', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-cryo-thigh', name: 'Thighs', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-cryo-arm', name: 'Arms', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-cryo-back', name: 'Back', category: 'body', isActive: true, isCustom: false },
  ],
  templates: [
    { id: 'tmpl-wbc', name: 'Whole Body Cryo', category: 'wbc', template: 'WBC session: {temp}C for {duration} minutes', variables: ['temp', 'duration'], isActive: true, isDefault: true },
    { id: 'tmpl-cryo-facial', name: 'Cryo Facial', category: 'facial', template: 'Cryo facial: {temp}C, {cycles} cycles', variables: ['temp', 'cycles'], isActive: true, isDefault: true },
  ],
}

// =============================================================================
// TATTOO REMOVAL
// =============================================================================

export const DEFAULT_TATTOO_REMOVAL_SETTINGS: CategorySettings = {
  products: [
    { id: 'pico-tattoo', name: 'PicoSure', brand: 'Cynosure', category: 'picosecond', isActive: true, isDefault: true },
    { id: 'picoway', name: 'PicoWay', brand: 'Candela', category: 'picosecond', isActive: true, isDefault: false },
    { id: 'enlighten', name: 'Enlighten', brand: 'Cutera', category: 'picosecond', isActive: true, isDefault: false },
    { id: 'qswitch-nd', name: 'Q-Switched Nd:YAG', brand: 'Various', category: 'nanosecond', isActive: true, isDefault: true },
    { id: 'qswitch-ruby', name: 'Q-Switched Ruby', brand: 'Various', category: 'nanosecond', isActive: true, isDefault: false },
    { id: 'qswitch-alex', name: 'Q-Switched Alexandrite', brand: 'Various', category: 'nanosecond', isActive: true, isDefault: false },
    { id: 'revlite', name: 'RevLite', brand: 'Cynosure', category: 'nanosecond', isActive: true, isDefault: false },
  ],
  parameters: [
    { id: 'tattoo-wavelength', name: 'Wavelength', defaultValue: 1064, unit: 'nm', options: ['532', '694', '755', '1064'], isActive: true },
    { id: 'tattoo-fluence', name: 'Fluence', defaultValue: 3, unit: 'J/cm2', minValue: 1, maxValue: 10, isActive: true },
    { id: 'tattoo-spot', name: 'Spot Size', defaultValue: 4, unit: 'mm', minValue: 2, maxValue: 8, isActive: true },
    { id: 'tattoo-rep-rate', name: 'Repetition Rate', defaultValue: 2, unit: 'Hz', minValue: 1, maxValue: 10, isActive: true },
    { id: 'tattoo-passes', name: 'Passes', defaultValue: 1, unit: '', minValue: 1, maxValue: 4, isActive: true },
    { id: 'session-interval', name: 'Session Interval', defaultValue: 8, unit: 'weeks', minValue: 6, maxValue: 12, isActive: true },
    { id: 'kirby-desai', name: 'Kirby-Desai Score', defaultValue: '', unit: '', isActive: true },
  ],
  needlesSizes: [],
  zones: [
    { id: 'zone-tattoo-arm', name: 'Arms', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-tattoo-back', name: 'Back', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-tattoo-chest', name: 'Chest', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-tattoo-leg', name: 'Legs', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-tattoo-hand', name: 'Hands/Fingers', category: 'extremity', isActive: true, isCustom: false },
    { id: 'zone-tattoo-neck', name: 'Neck', category: 'neck', isActive: true, isCustom: false },
    { id: 'zone-tattoo-face', name: 'Face', category: 'face', isActive: true, isCustom: false },
  ],
  templates: [
    { id: 'tmpl-tattoo', name: 'Tattoo Removal Session', category: 'removal', template: '{device} tattoo removal: {wavelength}nm, {fluence} J/cm2, {spot}mm spot, {passes} pass(es)', variables: ['device', 'wavelength', 'fluence', 'spot', 'passes'], isActive: true, isDefault: true },
  ],
}

// =============================================================================
// ACNE PROGRAMS
// =============================================================================

export const DEFAULT_ACNE_PROGRAMS_SETTINGS: CategorySettings = {
  products: [
    { id: 'isotretinoin', name: 'Isotretinoin (Accutane)', brand: 'Various', category: 'oral', isActive: true, isDefault: true },
    { id: 'spironolactone', name: 'Spironolactone', brand: 'Various', category: 'oral', isActive: true, isDefault: false },
    { id: 'doxy', name: 'Doxycycline', brand: 'Various', category: 'oral', isActive: true, isDefault: false },
    { id: 'tretinoin', name: 'Tretinoin', brand: 'Various', category: 'topical', isActive: true, isDefault: true },
    { id: 'clindamycin', name: 'Clindamycin', brand: 'Various', category: 'topical', isActive: true, isDefault: false },
    { id: 'benzoyl-peroxide', name: 'Benzoyl Peroxide', brand: 'Various', category: 'topical', isActive: true, isDefault: false },
    { id: 'salicylic-acne', name: 'Salicylic Acid', brand: 'Various', category: 'topical', isActive: true, isDefault: false },
    { id: 'aerolase-acne', name: 'Aerolase Neo (Acne)', brand: 'Aerolase', category: 'laser', isActive: true, isDefault: true },
    { id: 'bbl-acne', name: 'BBL Forever Clear', brand: 'Sciton', category: 'ipl', isActive: true, isDefault: false },
    { id: 'pdt', name: 'Photodynamic Therapy', brand: 'Various', category: 'pdt', isActive: true, isDefault: false },
    { id: 'cortisone-shot', name: 'Cortisone Injection', brand: 'Various', category: 'injection', isActive: true, isDefault: true },
    { id: 'acne-peel', name: 'Acne Peel', brand: 'Various', category: 'chemical-peel', isActive: true, isDefault: true },
  ],
  parameters: [
    { id: 'accutane-dose', name: 'Isotretinoin Dose', defaultValue: 40, unit: 'mg/day', minValue: 10, maxValue: 80, isActive: true },
    { id: 'cumulative-dose', name: 'Cumulative Dose Target', defaultValue: 150, unit: 'mg/kg', minValue: 120, maxValue: 220, isActive: true },
    { id: 'spiro-dose', name: 'Spironolactone Dose', defaultValue: 100, unit: 'mg/day', minValue: 25, maxValue: 200, isActive: true },
    { id: 'cortisone-conc', name: 'Cortisone Concentration', defaultValue: 2.5, unit: 'mg/ml', options: ['2.5', '5', '10'], isActive: true },
    { id: 'cortisone-vol', name: 'Cortisone Volume', defaultValue: 0.1, unit: 'ml', minValue: 0.05, maxValue: 0.3, isActive: true },
    { id: 'laser-fluence-acne', name: 'Laser Fluence', defaultValue: 10, unit: 'J/cm2', minValue: 5, maxValue: 20, isActive: true },
    { id: 'lab-interval', name: 'Lab Monitoring Interval', defaultValue: 'monthly', unit: '', options: ['bi-weekly', 'monthly', 'bi-monthly'], isActive: true },
  ],
  needlesSizes: [
    { id: 'acne-30g', gauge: '30G', length: '0.5"', type: 'needle', recommendedFor: ['Cortisone injections'], isActive: true, isDefault: true },
    { id: 'acne-31g', gauge: '31G', length: '5/16"', type: 'needle', recommendedFor: ['Small lesions'], isActive: true, isDefault: false },
  ],
  zones: [
    { id: 'zone-acne-face', name: 'Face', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-acne-forehead', name: 'Forehead', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-acne-cheek', name: 'Cheeks', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-acne-chin', name: 'Chin', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-acne-jaw', name: 'Jawline', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-acne-back', name: 'Back', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-acne-chest', name: 'Chest', category: 'body', isActive: true, isCustom: false },
  ],
  templates: [
    { id: 'tmpl-accutane', name: 'Accutane Follow-up', category: 'oral', template: 'Isotretinoin {dose}mg/day, month {month}, cumulative dose {cumulative}mg/kg', variables: ['dose', 'month', 'cumulative'], isActive: true, isDefault: true },
    { id: 'tmpl-cortisone', name: 'Cortisone Injection', category: 'injection', template: 'Intralesional {conc}mg/ml, {vol}ml injected into {location}', variables: ['conc', 'vol', 'location'], isActive: true, isDefault: true },
  ],
}

// =============================================================================
// MEDICAL SKINCARE
// =============================================================================

export const DEFAULT_MEDICAL_SKINCARE_SETTINGS: CategorySettings = {
  products: [
    { id: 'zo-ossential', name: 'ZO Ossential', brand: 'ZO Skin Health', category: 'cleansers', isActive: true, isDefault: true },
    { id: 'zo-brightenex', name: 'ZO Brightenex', brand: 'ZO Skin Health', category: 'brightening', isActive: true, isDefault: false },
    { id: 'zo-retinol', name: 'ZO Retinol', brand: 'ZO Skin Health', category: 'retinoids', isActive: true, isDefault: true },
    { id: 'skinceuticals-ce', name: 'SkinCeuticals CE Ferulic', brand: 'SkinCeuticals', category: 'antioxidants', isActive: true, isDefault: true },
    { id: 'skinceuticals-ha', name: 'SkinCeuticals HA Intensifier', brand: 'SkinCeuticals', category: 'hydration', isActive: true, isDefault: false },
    { id: 'skinceuticals-retinol', name: 'SkinCeuticals Retinol', brand: 'SkinCeuticals', category: 'retinoids', isActive: true, isDefault: false },
    { id: 'obagi-c', name: 'Obagi-C System', brand: 'Obagi', category: 'systems', isActive: true, isDefault: false },
    { id: 'obagi-nu-derm', name: 'Obagi Nu-Derm', brand: 'Obagi', category: 'systems', isActive: true, isDefault: false },
    { id: 'revision-intellishade', name: 'Revision Intellishade', brand: 'Revision', category: 'sunscreen', isActive: true, isDefault: true },
    { id: 'elta-md', name: 'EltaMD UV Clear', brand: 'EltaMD', category: 'sunscreen', isActive: true, isDefault: true },
    { id: 'alastin-restorative', name: 'Alastin Restorative', brand: 'Alastin', category: 'regenerative', isActive: true, isDefault: false },
    { id: 'alastin-ha', name: 'Alastin HA Immerse', brand: 'Alastin', category: 'hydration', isActive: true, isDefault: false },
    { id: 'neocutis-lumiere', name: 'Neocutis Lumiere', brand: 'Neocutis', category: 'eye-care', isActive: true, isDefault: false },
    { id: 'latisse', name: 'Latisse', brand: 'Allergan', category: 'lashes', isActive: true, isDefault: true },
    { id: 'rx-tretinoin', name: 'Rx Tretinoin', brand: 'Compounded', category: 'rx-topical', isActive: true, isDefault: true },
    { id: 'rx-hydroquinone', name: 'Rx Hydroquinone', brand: 'Compounded', category: 'rx-topical', isActive: true, isDefault: false },
  ],
  parameters: [
    { id: 'tretinoin-strength', name: 'Tretinoin Strength', defaultValue: 0.05, unit: '%', options: ['0.025', '0.05', '0.1'], isActive: true },
    { id: 'hydroquinone-strength', name: 'Hydroquinone Strength', defaultValue: 4, unit: '%', options: ['2', '4', '6', '8'], isActive: true },
    { id: 'usage-frequency', name: 'Usage Frequency', defaultValue: 'nightly', unit: '', options: ['every-other-night', 'nightly', 'twice-daily'], isActive: true },
    { id: 'skin-type', name: 'Fitzpatrick Skin Type', defaultValue: 'III', unit: '', options: ['I', 'II', 'III', 'IV', 'V', 'VI'], isActive: true },
    { id: 'sensitivity', name: 'Skin Sensitivity', defaultValue: 'normal', unit: '', options: ['sensitive', 'normal', 'tolerant'], isActive: true },
    { id: 'protocol-duration', name: 'Protocol Duration', defaultValue: 12, unit: 'weeks', minValue: 4, maxValue: 24, isActive: true },
  ],
  needlesSizes: [],
  zones: [
    { id: 'zone-skincare-face', name: 'Full Face', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-skincare-neck', name: 'Neck', category: 'neck', isActive: true, isCustom: false },
    { id: 'zone-skincare-chest', name: 'Chest', category: 'chest', isActive: true, isCustom: false },
    { id: 'zone-skincare-hands', name: 'Hands', category: 'body', isActive: true, isCustom: false },
    { id: 'zone-skincare-eyes', name: 'Eye Area', category: 'face', isActive: true, isCustom: false },
    { id: 'zone-skincare-lips', name: 'Lips', category: 'face', isActive: true, isCustom: false },
  ],
  templates: [
    { id: 'tmpl-skincare-rx', name: 'Rx Skincare Protocol', category: 'rx-topical', template: 'Prescribed: Tretinoin {tret}%, {frequency} application. Skin type: Fitzpatrick {type}', variables: ['tret', 'frequency', 'type'], isActive: true, isDefault: true },
    { id: 'tmpl-skincare-regimen', name: 'Skincare Regimen', category: 'systems', template: 'Recommended regimen: {cleanser}, {treatment}, {moisturizer}, {sunscreen}', variables: ['cleanser', 'treatment', 'moisturizer', 'sunscreen'], isActive: true, isDefault: true },
  ],
}

// =============================================================================
// COMBINED DEFAULT SETTINGS
// =============================================================================

export const DEFAULT_ALL_SETTINGS: AllChartingSettings = {
  injectables: DEFAULT_INJECTABLES_SETTINGS,
  lasers: DEFAULT_LASERS_SETTINGS,
  'rf-microneedling': DEFAULT_RF_MICRONEEDLING_SETTINGS,
  'skin-treatments': DEFAULT_SKIN_TREATMENTS_SETTINGS,
  'body-contouring': DEFAULT_BODY_CONTOURING_SETTINGS,
  threads: DEFAULT_THREADS_SETTINGS,
  'iv-therapy': DEFAULT_IV_THERAPY_SETTINGS,
  'weight-loss': DEFAULT_WEIGHT_LOSS_SETTINGS,
  'hair-restoration': DEFAULT_HAIR_RESTORATION_SETTINGS,
  'hormone-therapy': DEFAULT_HORMONE_THERAPY_SETTINGS,
  'sexual-wellness': DEFAULT_SEXUAL_WELLNESS_SETTINGS,
  'vein-treatments': DEFAULT_VEIN_TREATMENTS_SETTINGS,
  'hyperbaric-oxygen': DEFAULT_HYPERBARIC_OXYGEN_SETTINGS,
  cryotherapy: DEFAULT_CRYOTHERAPY_SETTINGS,
  'tattoo-removal': DEFAULT_TATTOO_REMOVAL_SETTINGS,
  'acne-programs': DEFAULT_ACNE_PROGRAMS_SETTINGS,
  'medical-skincare': DEFAULT_MEDICAL_SKINCARE_SETTINGS,
  general: {
    theme: 'light',
    autoSave: true,
    requireSignOff: false,
    requireLotNumbers: true,
    showAnatomicalNames: true,
  },
  toolVisibility: {
    // Advanced drawing tools - all OFF by default for simplicity
    brushTool: false,
    arrowTool: false,
    textLabels: false,
    shapeTool: false,
    measurementTool: false,
    cannulaPathTool: false,
    veinDrawingTool: false,
    dangerZoneOverlay: false,
    // UI Settings - all OFF by default
    showCalibrationControls: false,
    showAdvancedPanels: false,
    compactMode: false,
  },
}

// =============================================================================
// CATEGORY TABS
// =============================================================================

export const CATEGORY_TABS: CategoryTab[] = [
  { id: 'injectables', label: 'Injectables', icon: Syringe, description: 'Neurotoxins, fillers, and biostimulators' },
  { id: 'lasers', label: 'Lasers & Energy', icon: Zap, description: 'IPL, laser hair removal, photofacials' },
  { id: 'rf-microneedling', label: 'RF Microneedling', icon: Activity, description: 'Morpheus8, Vivace, Potenza' },
  { id: 'skin-treatments', label: 'Skin Treatments', icon: Droplets, description: 'HydraFacial, peels, microneedling, PRP' },
  { id: 'body-contouring', label: 'Body Contouring', icon: Target, description: 'CoolSculpting, EMSculpt, Kybella' },
  { id: 'threads', label: 'Threads', icon: Scissors, description: 'PDO, PLLA thread lifts' },
  { id: 'iv-therapy', label: 'IV Therapy', icon: Heart, description: 'Vitamin drips and injections' },
  { id: 'weight-loss', label: 'Weight Loss', icon: Scale, description: 'GLP-1 medications and metabolic support' },
  { id: 'hair-restoration', label: 'Hair Restoration', icon: Sparkles, description: 'PRP for hair, laser caps, transplant tracking' },
  { id: 'hormone-therapy', label: 'Hormone Therapy', icon: Pill, description: 'Bioidentical hormones, pellets, HRT' },
  { id: 'sexual-wellness', label: 'Sexual Wellness', icon: Heart, description: 'O-Shot, P-Shot, vaginal rejuvenation' },
  { id: 'vein-treatments', label: 'Vein Treatments', icon: Activity, description: 'Sclerotherapy, spider vein lasers' },
  { id: 'hyperbaric-oxygen', label: 'Hyperbaric Oxygen', icon: Target, description: 'HBOT chambers and oxygen therapy' },
  { id: 'cryotherapy', label: 'Cryotherapy', icon: Droplets, description: 'Whole body cryo, cryo facials' },
  { id: 'tattoo-removal', label: 'Tattoo Removal', icon: Zap, description: 'Laser tattoo removal protocols' },
  { id: 'acne-programs', label: 'Acne Programs', icon: Layers, description: 'Accutane tracking, specialized protocols' },
  { id: 'medical-skincare', label: 'Medical Skincare', icon: Package, description: 'ZO Skin, SkinCeuticals, retail products' },
]

// Storage key constant
export const STORAGE_KEY = 'chartingToolSettings'
