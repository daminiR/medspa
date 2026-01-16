/**
 * Pre-Visit Prep Reminders Data
 * Treatment-specific preparation instructions for better outcomes
 */

export interface PrepInstruction {
  id: string;
  treatment: string;
  category: 'injectable' | 'laser' | 'facial' | 'body' | 'wellness';
  timing: {
    daysBeforeMin: number;
    daysBeforeMax: number;
    idealDaysBefore: number;
  };
  instructions: PrepInstructionItem[];
  doNotList: string[];
  bringList: string[];
  smsTemplate: string;
  emailTemplate?: string;
  enabled: boolean;
}

export interface PrepInstructionItem {
  title: string;
  description: string;
  timeframe: string;
  priority: 'required' | 'recommended' | 'optional';
  icon?: string;
}

export interface PrepReminderSettings {
  enabled: boolean;
  defaultTimingDays: number;
  sendViaSMS: boolean;
  sendViaEmail: boolean;
  includeInConfirmation: boolean;
  sendSeparateReminder: boolean;
  reminderTime: string; // "09:00"
}

// Default prep reminder settings
export const DEFAULT_PREP_SETTINGS: PrepReminderSettings = {
  enabled: true,
  defaultTimingDays: 3,
  sendViaSMS: true,
  sendViaEmail: true,
  includeInConfirmation: true,
  sendSeparateReminder: true,
  reminderTime: '09:00',
};

// Comprehensive treatment prep instructions
export const PREP_INSTRUCTIONS: Record<string, PrepInstruction> = {
  // ============= INJECTABLES =============

  botox: {
    id: 'botox',
    treatment: 'Botox / Dysport / Xeomin',
    category: 'injectable',
    timing: {
      daysBeforeMin: 1,
      daysBeforeMax: 7,
      idealDaysBefore: 3,
    },
    instructions: [
      {
        title: 'Avoid Blood Thinners',
        description: 'Stop aspirin, ibuprofen, fish oil, vitamin E, and other blood thinners',
        timeframe: '7 days before',
        priority: 'required',
        icon: '💊',
      },
      {
        title: 'No Alcohol',
        description: 'Avoid alcohol consumption to reduce bruising risk',
        timeframe: '24-48 hours before',
        priority: 'required',
        icon: '🍷',
      },
      {
        title: 'Arnica Montana',
        description: 'Consider taking Arnica supplements to minimize bruising',
        timeframe: '3 days before',
        priority: 'recommended',
        icon: '🌿',
      },
      {
        title: 'Clean Face',
        description: 'Arrive with a clean face, no makeup',
        timeframe: 'Day of appointment',
        priority: 'required',
        icon: '✨',
      },
      {
        title: 'Eat Before',
        description: 'Have a light meal before your appointment',
        timeframe: 'Day of appointment',
        priority: 'recommended',
        icon: '🍽️',
      },
    ],
    doNotList: [
      'Take aspirin or NSAIDs (Advil, Motrin, Aleve)',
      'Consume alcohol 24-48 hours before',
      'Take fish oil or vitamin E supplements',
      'Schedule facials or skin treatments same day',
      'Exercise intensely the morning of',
    ],
    bringList: [
      'List of current medications',
      'ID and payment method',
      'Reference photos (if any)',
    ],
    smsTemplate: 'Hi {{patientFirstName}}! Prep for your Botox appointment on {{appointmentDate}}: Avoid alcohol, aspirin & blood thinners 24-48hrs before. Arrive makeup-free. Questions? Reply here!',
    enabled: true,
  },

  filler: {
    id: 'filler',
    treatment: 'Dermal Fillers (Juvederm, Restylane, etc.)',
    category: 'injectable',
    timing: {
      daysBeforeMin: 2,
      daysBeforeMax: 7,
      idealDaysBefore: 3,
    },
    instructions: [
      {
        title: 'Avoid Blood Thinners',
        description: 'Stop aspirin, ibuprofen, fish oil, vitamin E for 7 days',
        timeframe: '7 days before',
        priority: 'required',
        icon: '💊',
      },
      {
        title: 'No Alcohol',
        description: 'Alcohol increases bruising and swelling risk',
        timeframe: '48 hours before',
        priority: 'required',
        icon: '🍷',
      },
      {
        title: 'Avoid Dental Work',
        description: 'No dental procedures 2 weeks before/after lip filler',
        timeframe: '2 weeks before',
        priority: 'required',
        icon: '🦷',
      },
      {
        title: 'Arnica Montana',
        description: 'Start taking Arnica tablets to prevent bruising',
        timeframe: '5 days before',
        priority: 'recommended',
        icon: '🌿',
      },
      {
        title: 'Stay Hydrated',
        description: 'Drink plenty of water - hyaluronic acid loves hydration!',
        timeframe: '3 days before',
        priority: 'recommended',
        icon: '💧',
      },
      {
        title: 'Clean Face',
        description: 'Arrive with no makeup on treatment area',
        timeframe: 'Day of appointment',
        priority: 'required',
        icon: '✨',
      },
    ],
    doNotList: [
      'Take blood thinners or NSAIDs',
      'Drink alcohol 48 hours before',
      'Have dental work 2 weeks before/after (lip filler)',
      'Apply self-tanner to face',
      'Wax or thread treatment area',
    ],
    bringList: [
      'List of current medications and supplements',
      'ID and payment method',
      'Reference photos for desired results',
      'Sunglasses (eyes may be puffy after)',
    ],
    smsTemplate: 'Hi {{patientFirstName}}! Your filler appointment is {{appointmentDate}}. Prep: No alcohol/blood thinners 48hrs before, stay hydrated, arrive makeup-free. Excited to see you!',
    enabled: true,
  },

  kybella: {
    id: 'kybella',
    treatment: 'Kybella (Double Chin Treatment)',
    category: 'injectable',
    timing: {
      daysBeforeMin: 3,
      daysBeforeMax: 7,
      idealDaysBefore: 5,
    },
    instructions: [
      {
        title: 'Avoid Blood Thinners',
        description: 'Stop aspirin, ibuprofen, fish oil for best results',
        timeframe: '7 days before',
        priority: 'required',
        icon: '💊',
      },
      {
        title: 'No Alcohol',
        description: 'Avoid alcohol to reduce swelling',
        timeframe: '48 hours before',
        priority: 'required',
        icon: '🍷',
      },
      {
        title: 'Plan for Swelling',
        description: 'Expect significant swelling for 3-5 days - plan accordingly',
        timeframe: 'Schedule wisely',
        priority: 'required',
        icon: '📅',
      },
      {
        title: 'Ice Packs Ready',
        description: 'Have ice packs at home for post-treatment',
        timeframe: 'Before appointment',
        priority: 'recommended',
        icon: '🧊',
      },
    ],
    doNotList: [
      'Schedule before important events (swelling lasts 3-5 days)',
      'Take blood thinners',
      'Drink alcohol 48 hours before',
    ],
    bringList: [
      'Scarf or turtleneck for after',
      'Ice pack for the drive home',
    ],
    smsTemplate: 'Hi {{patientFirstName}}! Kybella prep for {{appointmentDate}}: Avoid alcohol/blood thinners, expect swelling 3-5 days. Bring a scarf! Questions? Reply here.',
    enabled: true,
  },

  // ============= LASER TREATMENTS =============

  laser_hair_removal: {
    id: 'laser_hair_removal',
    treatment: 'Laser Hair Removal',
    category: 'laser',
    timing: {
      daysBeforeMin: 1,
      daysBeforeMax: 14,
      idealDaysBefore: 7,
    },
    instructions: [
      {
        title: 'Shave Treatment Area',
        description: 'Shave the treatment area (do NOT wax or pluck)',
        timeframe: '24 hours before',
        priority: 'required',
        icon: '🪒',
      },
      {
        title: 'Avoid Sun Exposure',
        description: 'No tanning, sunbathing, or self-tanner',
        timeframe: '2 weeks before',
        priority: 'required',
        icon: '☀️',
      },
      {
        title: 'Stop Waxing/Plucking',
        description: 'Hair root must be present - only shave',
        timeframe: '4-6 weeks before',
        priority: 'required',
        icon: '⚠️',
      },
      {
        title: 'Discontinue Retinoids',
        description: 'Stop retinol/tretinoin on treatment area',
        timeframe: '3-5 days before',
        priority: 'required',
        icon: '🧴',
      },
      {
        title: 'Clean Skin',
        description: 'No lotions, deodorant, or products on treatment area',
        timeframe: 'Day of appointment',
        priority: 'required',
        icon: '✨',
      },
    ],
    doNotList: [
      'Wax, pluck, or use epilator (shave only)',
      'Tan or use self-tanner 2 weeks before',
      'Apply retinoids to treatment area',
      'Use numbing cream (unless approved)',
      'Apply deodorant/lotion day of (for underarm treatment)',
    ],
    bringList: [
      'Loose, comfortable clothing',
      'Sunscreen for after (if face treatment)',
    ],
    smsTemplate: 'Hi {{patientFirstName}}! Laser hair removal on {{appointmentDate}}: SHAVE (don\'t wax) 24hrs before, no sun exposure, arrive with clean skin. See you soon!',
    enabled: true,
  },

  ipl_photofacial: {
    id: 'ipl_photofacial',
    treatment: 'IPL / Photofacial',
    category: 'laser',
    timing: {
      daysBeforeMin: 3,
      daysBeforeMax: 14,
      idealDaysBefore: 7,
    },
    instructions: [
      {
        title: 'Avoid Sun Exposure',
        description: 'No sun, tanning beds, or self-tanner',
        timeframe: '2-4 weeks before',
        priority: 'required',
        icon: '☀️',
      },
      {
        title: 'Stop Retinoids',
        description: 'Discontinue retinol, Retin-A, tretinoin',
        timeframe: '5-7 days before',
        priority: 'required',
        icon: '🧴',
      },
      {
        title: 'No Chemical Peels',
        description: 'Avoid peels, acids, and exfoliating treatments',
        timeframe: '2 weeks before',
        priority: 'required',
        icon: '⚗️',
      },
      {
        title: 'Clean Face',
        description: 'Arrive makeup-free with clean skin',
        timeframe: 'Day of appointment',
        priority: 'required',
        icon: '✨',
      },
      {
        title: 'Inform About Medications',
        description: 'Tell us about any photosensitizing medications',
        timeframe: 'Before appointment',
        priority: 'required',
        icon: '💊',
      },
    ],
    doNotList: [
      'Get sun exposure or use tanning beds',
      'Use self-tanner 2 weeks before',
      'Apply retinoids 5-7 days before',
      'Have chemical peels 2 weeks before',
      'Take photosensitizing medications (discuss with us)',
    ],
    bringList: [
      'List of skincare products you use',
      'List of medications',
      'Sunscreen SPF 30+ for after',
      'Hat for sun protection after',
    ],
    smsTemplate: 'Hi {{patientFirstName}}! IPL prep for {{appointmentDate}}: No sun/tanning 2+ weeks, stop retinoids 5-7 days before, arrive makeup-free. Bring sunscreen!',
    enabled: true,
  },

  laser_resurfacing: {
    id: 'laser_resurfacing',
    treatment: 'Laser Skin Resurfacing (Fraxel, CO2)',
    category: 'laser',
    timing: {
      daysBeforeMin: 7,
      daysBeforeMax: 30,
      idealDaysBefore: 14,
    },
    instructions: [
      {
        title: 'Start Antiviral (if prescribed)',
        description: 'Take Valtrex/antiviral if you have history of cold sores',
        timeframe: '2 days before',
        priority: 'required',
        icon: '💊',
      },
      {
        title: 'Avoid Sun Completely',
        description: 'Zero sun exposure - wear hats and SPF daily',
        timeframe: '4 weeks before',
        priority: 'required',
        icon: '☀️',
      },
      {
        title: 'Stop All Actives',
        description: 'Discontinue retinoids, acids, vitamin C serums',
        timeframe: '7-10 days before',
        priority: 'required',
        icon: '🧴',
      },
      {
        title: 'Pre-Treatment Regimen',
        description: 'Use prescribed hydroquinone/prep products if given',
        timeframe: '2-4 weeks before',
        priority: 'required',
        icon: '📋',
      },
      {
        title: 'Arrange Transportation',
        description: 'You cannot drive after - arrange a ride home',
        timeframe: 'Day of appointment',
        priority: 'required',
        icon: '🚗',
      },
      {
        title: 'Plan Downtime',
        description: 'Expect 5-10 days of recovery - plan accordingly',
        timeframe: 'Schedule wisely',
        priority: 'required',
        icon: '📅',
      },
    ],
    doNotList: [
      'Get ANY sun exposure 4 weeks before',
      'Use retinoids, acids, or active products',
      'Have other facial treatments',
      'Schedule before important events',
      'Plan to drive yourself home',
    ],
    bringList: [
      'Driver (you cannot drive home)',
      'Comfortable, loose clothing',
      'Sunglasses',
      'Prescribed medications',
      'Aquaphor or Vaseline for aftercare',
    ],
    smsTemplate: 'Hi {{patientFirstName}}! Laser resurfacing on {{appointmentDate}}: No sun 4 weeks, stop all actives 7-10 days before, arrange a driver. Call us with any questions!',
    enabled: true,
  },

  // ============= FACIALS & PEELS =============

  chemical_peel: {
    id: 'chemical_peel',
    treatment: 'Chemical Peel',
    category: 'facial',
    timing: {
      daysBeforeMin: 3,
      daysBeforeMax: 14,
      idealDaysBefore: 5,
    },
    instructions: [
      {
        title: 'Stop Retinoids',
        description: 'Discontinue retinol, Retin-A, tretinoin',
        timeframe: '3-7 days before',
        priority: 'required',
        icon: '🧴',
      },
      {
        title: 'Avoid Waxing',
        description: 'Do not wax or use hair removal creams on face',
        timeframe: '7 days before',
        priority: 'required',
        icon: '⚠️',
      },
      {
        title: 'No Exfoliants',
        description: 'Stop using scrubs, AHAs, BHAs, or exfoliating tools',
        timeframe: '5-7 days before',
        priority: 'required',
        icon: '🧼',
      },
      {
        title: 'Limit Sun Exposure',
        description: 'Minimize sun exposure and wear SPF',
        timeframe: '1 week before',
        priority: 'recommended',
        icon: '☀️',
      },
      {
        title: 'Arrive Makeup-Free',
        description: 'Clean face, no makeup or products',
        timeframe: 'Day of appointment',
        priority: 'required',
        icon: '✨',
      },
    ],
    doNotList: [
      'Use retinoids 3-7 days before',
      'Wax face or use hair removal creams',
      'Use exfoliating products or scrubs',
      'Get excessive sun exposure',
      'Use at-home peeling products',
    ],
    bringList: [
      'Sunscreen SPF 30+ for after',
      'Wide-brimmed hat',
      'Gentle moisturizer',
    ],
    smsTemplate: 'Hi {{patientFirstName}}! Peel prep for {{appointmentDate}}: Stop retinoids 3-7 days before, no waxing, arrive makeup-free. Expect peeling 3-5 days after!',
    enabled: true,
  },

  microneedling: {
    id: 'microneedling',
    treatment: 'Microneedling / Collagen Induction',
    category: 'facial',
    timing: {
      daysBeforeMin: 3,
      daysBeforeMax: 7,
      idealDaysBefore: 5,
    },
    instructions: [
      {
        title: 'Stop Retinoids',
        description: 'Discontinue retinol and prescription retinoids',
        timeframe: '5-7 days before',
        priority: 'required',
        icon: '🧴',
      },
      {
        title: 'Avoid Sun Exposure',
        description: 'Minimize sun exposure, wear SPF daily',
        timeframe: '1 week before',
        priority: 'required',
        icon: '☀️',
      },
      {
        title: 'No Exfoliating',
        description: 'Stop using AHAs, BHAs, and physical exfoliants',
        timeframe: '3-5 days before',
        priority: 'required',
        icon: '🧼',
      },
      {
        title: 'Clean Face',
        description: 'Arrive completely makeup-free with clean skin',
        timeframe: 'Day of appointment',
        priority: 'required',
        icon: '✨',
      },
      {
        title: 'Hydrate',
        description: 'Drink plenty of water for optimal results',
        timeframe: '3 days before',
        priority: 'recommended',
        icon: '💧',
      },
    ],
    doNotList: [
      'Use retinoids or vitamin A products',
      'Get excessive sun exposure',
      'Use AHAs, BHAs, or scrubs',
      'Have Botox within 2 weeks',
      'Wear makeup to appointment',
    ],
    bringList: [
      'Sunscreen for after',
      'Gentle cleanser and moisturizer',
      'List of current skincare products',
    ],
    smsTemplate: 'Hi {{patientFirstName}}! Microneedling on {{appointmentDate}}: Stop retinoids 5-7 days before, avoid sun, arrive with clean skin. Redness normal 24-48hrs after!',
    enabled: true,
  },

  hydrafacial: {
    id: 'hydrafacial',
    treatment: 'HydraFacial',
    category: 'facial',
    timing: {
      daysBeforeMin: 1,
      daysBeforeMax: 3,
      idealDaysBefore: 1,
    },
    instructions: [
      {
        title: 'Stop Retinoids',
        description: 'Pause retinol products to avoid sensitivity',
        timeframe: '48 hours before',
        priority: 'recommended',
        icon: '🧴',
      },
      {
        title: 'No Waxing',
        description: 'Avoid facial waxing or threading',
        timeframe: '3-5 days before',
        priority: 'required',
        icon: '⚠️',
      },
      {
        title: 'Come Makeup-Free',
        description: 'Arrive with a clean face for best results',
        timeframe: 'Day of appointment',
        priority: 'recommended',
        icon: '✨',
      },
    ],
    doNotList: [
      'Wax or thread face 3-5 days before',
      'Use strong retinoids 48 hours before',
      'Have other facial treatments same day',
    ],
    bringList: [
      'Nothing special needed!',
      'Sunscreen if going outside after',
    ],
    smsTemplate: 'Hi {{patientFirstName}}! HydraFacial tomorrow at {{appointmentTime}}! Minimal prep needed - just arrive makeup-free. Your skin will glow! See you soon!',
    enabled: true,
  },

  // ============= BODY TREATMENTS =============

  coolsculpting: {
    id: 'coolsculpting',
    treatment: 'CoolSculpting / Cryolipolysis',
    category: 'body',
    timing: {
      daysBeforeMin: 1,
      daysBeforeMax: 7,
      idealDaysBefore: 3,
    },
    instructions: [
      {
        title: 'Avoid Anti-Inflammatories',
        description: 'Stop NSAIDs (ibuprofen, aspirin) if possible',
        timeframe: '1 week before',
        priority: 'recommended',
        icon: '💊',
      },
      {
        title: 'Wear Comfortable Clothes',
        description: 'Loose, comfortable clothing to appointment',
        timeframe: 'Day of appointment',
        priority: 'required',
        icon: '👕',
      },
      {
        title: 'Eat Normally',
        description: 'No need to fast - eat regular meals',
        timeframe: 'Day of appointment',
        priority: 'recommended',
        icon: '🍽️',
      },
      {
        title: 'Plan for Session Length',
        description: 'Sessions last 35-60 min per area - bring entertainment',
        timeframe: 'Day of appointment',
        priority: 'recommended',
        icon: '📱',
      },
    ],
    doNotList: [
      'Apply lotion to treatment area day of',
      'Take anti-inflammatories if avoidable',
      'Wear tight clothing',
    ],
    bringList: [
      'Entertainment (phone, book, tablet)',
      'Loose, comfortable clothing',
      'Light snack',
    ],
    smsTemplate: 'Hi {{patientFirstName}}! CoolSculpting on {{appointmentDate}}: Wear loose clothes, bring entertainment (35-60 min session). No lotion on treatment area. See you soon!',
    enabled: true,
  },

  body_contouring: {
    id: 'body_contouring',
    treatment: 'Body Contouring (RF, Ultrasound)',
    category: 'body',
    timing: {
      daysBeforeMin: 1,
      daysBeforeMax: 3,
      idealDaysBefore: 1,
    },
    instructions: [
      {
        title: 'Stay Hydrated',
        description: 'Drink plenty of water before and after',
        timeframe: '24 hours before',
        priority: 'required',
        icon: '💧',
      },
      {
        title: 'Avoid Caffeine',
        description: 'Limit caffeine and alcohol',
        timeframe: '24 hours before',
        priority: 'recommended',
        icon: '☕',
      },
      {
        title: 'Wear Comfortable Clothes',
        description: 'Easy to change, loose-fitting clothing',
        timeframe: 'Day of appointment',
        priority: 'required',
        icon: '👕',
      },
      {
        title: 'Light Meal',
        description: 'Eat a light meal 1-2 hours before',
        timeframe: 'Day of appointment',
        priority: 'recommended',
        icon: '🍽️',
      },
    ],
    doNotList: [
      'Apply lotions or oils to treatment area',
      'Consume excessive caffeine or alcohol',
      'Come dehydrated',
    ],
    bringList: [
      'Water bottle',
      'Comfortable change of clothes',
    ],
    smsTemplate: 'Hi {{patientFirstName}}! Body contouring on {{appointmentDate}}: Stay hydrated, wear comfortable clothes, light meal before. No lotions on treatment area!',
    enabled: true,
  },

  // ============= WELLNESS =============

  iv_therapy: {
    id: 'iv_therapy',
    treatment: 'IV Vitamin Therapy',
    category: 'wellness',
    timing: {
      daysBeforeMin: 0,
      daysBeforeMax: 1,
      idealDaysBefore: 1,
    },
    instructions: [
      {
        title: 'Stay Hydrated',
        description: 'Drink water before - hydration helps with vein access',
        timeframe: '24 hours before',
        priority: 'required',
        icon: '💧',
      },
      {
        title: 'Eat Before',
        description: 'Have a meal or snack - don\'t come on empty stomach',
        timeframe: '1-2 hours before',
        priority: 'required',
        icon: '🍽️',
      },
      {
        title: 'Wear Short Sleeves',
        description: 'Easy arm access for IV placement',
        timeframe: 'Day of appointment',
        priority: 'required',
        icon: '👕',
      },
      {
        title: 'Limit Caffeine',
        description: 'Caffeine can constrict veins',
        timeframe: 'Morning of appointment',
        priority: 'recommended',
        icon: '☕',
      },
    ],
    doNotList: [
      'Come dehydrated',
      'Come on an empty stomach',
      'Consume excessive caffeine',
    ],
    bringList: [
      'Water bottle',
      'Something to read/watch',
      'Snack for after',
    ],
    smsTemplate: 'Hi {{patientFirstName}}! IV Therapy on {{appointmentDate}}: Hydrate well, eat before, wear short sleeves. Session is 30-45 min - feel free to relax!',
    enabled: true,
  },

  prp_treatment: {
    id: 'prp_treatment',
    treatment: 'PRP (Platelet Rich Plasma) / Vampire Facial',
    category: 'wellness',
    timing: {
      daysBeforeMin: 3,
      daysBeforeMax: 7,
      idealDaysBefore: 5,
    },
    instructions: [
      {
        title: 'Avoid Blood Thinners',
        description: 'Stop aspirin, ibuprofen, fish oil, vitamin E',
        timeframe: '1 week before',
        priority: 'required',
        icon: '💊',
      },
      {
        title: 'Stay Hydrated',
        description: 'Drink plenty of water for good blood draw',
        timeframe: '48 hours before',
        priority: 'required',
        icon: '💧',
      },
      {
        title: 'No Alcohol',
        description: 'Avoid alcohol before treatment',
        timeframe: '48 hours before',
        priority: 'required',
        icon: '🍷',
      },
      {
        title: 'Eat Protein',
        description: 'Have a protein-rich meal',
        timeframe: '2-3 hours before',
        priority: 'required',
        icon: '🥩',
      },
      {
        title: 'Stop Retinoids',
        description: 'Discontinue retinol products (for facial PRP)',
        timeframe: '5 days before',
        priority: 'required',
        icon: '🧴',
      },
      {
        title: 'Clean Face',
        description: 'Arrive makeup-free (for facial PRP)',
        timeframe: 'Day of appointment',
        priority: 'required',
        icon: '✨',
      },
    ],
    doNotList: [
      'Take blood thinners or NSAIDs',
      'Drink alcohol 48 hours before',
      'Come dehydrated',
      'Skip meals before',
      'Use retinoids (facial PRP)',
    ],
    bringList: [
      'List of medications',
      'Comfortable clothes',
      'Sunglasses (if facial treatment)',
    ],
    smsTemplate: 'Hi {{patientFirstName}}! PRP prep for {{appointmentDate}}: No blood thinners/alcohol, stay hydrated, eat protein before, arrive makeup-free. Questions? Reply here!',
    enabled: true,
  },
};

/**
 * Get prep instructions for a service/treatment
 */
export function getPrepInstructions(treatmentType: string): PrepInstruction | null {
  const key = treatmentType.toLowerCase().replace(/\s+/g, '_');

  // Direct match
  if (PREP_INSTRUCTIONS[key]) {
    return PREP_INSTRUCTIONS[key];
  }

  // Fuzzy match
  const matches: Record<string, string[]> = {
    botox: ['botox', 'dysport', 'xeomin', 'neurotoxin', 'wrinkle', 'tox'],
    filler: ['filler', 'juvederm', 'restylane', 'voluma', 'lip', 'cheek filler', 'sculptra', 'radiesse'],
    kybella: ['kybella', 'double chin', 'chin fat'],
    laser_hair_removal: ['laser hair', 'hair removal', 'laser removal'],
    ipl_photofacial: ['ipl', 'photofacial', 'bbl', 'broadband'],
    laser_resurfacing: ['fraxel', 'co2', 'resurfacing', 'laser facial', 'pixel'],
    chemical_peel: ['peel', 'chemical peel', 'vi peel', 'jessner'],
    microneedling: ['microneedling', 'collagen induction', 'dermapen', 'skinpen'],
    hydrafacial: ['hydrafacial', 'hydra facial'],
    coolsculpting: ['coolsculpting', 'cool sculpting', 'cryolipolysis', 'fat freezing'],
    body_contouring: ['body contouring', 'velashape', 'vanquish', 'sculpsure', 'truebody'],
    iv_therapy: ['iv therapy', 'iv vitamin', 'vitamin drip', 'myers cocktail', 'nad'],
    prp_treatment: ['prp', 'vampire facial', 'platelet rich', 'vampire'],
  };

  for (const [instructionKey, keywords] of Object.entries(matches)) {
    if (keywords.some(kw => treatmentType.toLowerCase().includes(kw))) {
      return PREP_INSTRUCTIONS[instructionKey] || null;
    }
  }

  return null;
}

/**
 * Get SMS template for a treatment
 */
export function getPrepSMSTemplate(treatmentType: string, variables: Record<string, string>): string | null {
  const instructions = getPrepInstructions(treatmentType);
  if (!instructions || !instructions.smsTemplate) {
    return null;
  }

  let message = instructions.smsTemplate;
  for (const [key, value] of Object.entries(variables)) {
    message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }

  return message;
}

/**
 * Get all enabled prep instructions
 */
export function getEnabledPrepInstructions(): PrepInstruction[] {
  return Object.values(PREP_INSTRUCTIONS).filter(p => p.enabled);
}

/**
 * Get instructions by category
 */
export function getPrepInstructionsByCategory(category: PrepInstruction['category']): PrepInstruction[] {
  return Object.values(PREP_INSTRUCTIONS).filter(p => p.category === category);
}
