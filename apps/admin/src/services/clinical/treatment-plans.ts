/**
 * Treatment Planning System
 * Comprehensive treatment planning for medical spa
 */

import { z } from 'zod';

// Treatment plan types
export enum PlanType {
  SINGLE_SESSION = 'single_session',
  MULTI_SESSION = 'multi_session',
  MAINTENANCE = 'maintenance',
  CORRECTIVE = 'corrective',
  PREVENTATIVE = 'preventative',
  COMBINATION = 'combination',
}

// Treatment goals
export enum TreatmentGoal {
  WRINKLE_REDUCTION = 'wrinkle_reduction',
  VOLUME_RESTORATION = 'volume_restoration',
  SKIN_TIGHTENING = 'skin_tightening',
  TEXTURE_IMPROVEMENT = 'texture_improvement',
  PIGMENTATION_CORRECTION = 'pigmentation_correction',
  ACNE_TREATMENT = 'acne_treatment',
  SCAR_REVISION = 'scar_revision',
  FAT_REDUCTION = 'fat_reduction',
  MUSCLE_TONING = 'muscle_toning',
  HAIR_RESTORATION = 'hair_restoration',
  VEIN_TREATMENT = 'vein_treatment',
  REJUVENATION = 'rejuvenation',
}

// Plan status
export enum PlanStatus {
  DRAFT = 'draft',
  PROPOSED = 'proposed',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

// Treatment session schema
export const TreatmentSessionSchema = z.object({
  id: z.string(),
  sessionNumber: z.number(),
  scheduledDate: z.date().optional(),
  completedDate: z.date().optional(),
  treatments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    units: z.number().optional(),
    areas: z.array(z.string()),
    provider: z.string().optional(),
    duration: z.number(), // minutes
    price: z.number(),
    notes: z.string().optional(),
  })),
  preCareinstructions: z.array(z.string()),
  postCareInstructions: z.array(z.string()),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']),
  results: z.object({
    photos: z.array(z.string()).optional(),
    notes: z.string().optional(),
    patientSatisfaction: z.number().min(1).max(5).optional(),
    complications: z.array(z.string()).optional(),
  }).optional(),
});

// Treatment plan schema
export const TreatmentPlanSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  createdBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  type: z.nativeEnum(PlanType),
  status: z.nativeEnum(PlanStatus),
  
  // Plan details
  name: z.string(),
  description: z.string(),
  goals: z.array(z.nativeEnum(TreatmentGoal)),
  expectedOutcomes: z.array(z.string()),
  duration: z.object({
    totalWeeks: z.number(),
    sessionsPerWeek: z.number().optional(),
    totalSessions: z.number(),
  }),
  
  // Medical considerations
  medicalHistory: z.object({
    allergies: z.array(z.string()),
    medications: z.array(z.string()),
    contraindications: z.array(z.string()),
    previousTreatments: z.array(z.string()),
  }),
  
  // Sessions
  sessions: z.array(TreatmentSessionSchema),
  
  // Pricing
  pricing: z.object({
    totalCost: z.number(),
    discount: z.number().optional(),
    discountType: z.enum(['percentage', 'fixed']).optional(),
    finalCost: z.number(),
    paymentPlan: z.object({
      enabled: z.boolean(),
      installments: z.number(),
      frequency: z.enum(['weekly', 'biweekly', 'monthly']),
      amount: z.number(),
    }).optional(),
    package: z.object({
      id: z.string(),
      name: z.string(),
      creditsUsed: z.number(),
    }).optional(),
  }),
  
  // Home care
  homeCare: z.object({
    products: z.array(z.object({
      id: z.string(),
      name: z.string(),
      usage: z.string(),
      frequency: z.string(),
      price: z.number().optional(),
    })),
    instructions: z.array(z.string()),
  }).optional(),
  
  // Follow-up
  followUp: z.object({
    schedule: z.array(z.object({
      weeksAfter: z.number(),
      type: z.enum(['phone', 'in_person', 'photo_review']),
      notes: z.string(),
    })),
    maintenanceRecommended: z.boolean(),
    maintenanceFrequency: z.string().optional(),
  }),
  
  // Consent and agreements
  consent: z.object({
    obtained: z.boolean(),
    date: z.date().optional(),
    method: z.enum(['electronic', 'paper', 'verbal']).optional(),
    documents: z.array(z.string()).optional(),
  }),
  
  // Results tracking
  results: z.object({
    beforePhotos: z.array(z.string()),
    afterPhotos: z.array(z.string()),
    measurements: z.record(z.number()).optional(),
    patientSatisfaction: z.number().min(1).max(5).optional(),
    providerAssessment: z.string().optional(),
    complications: z.array(z.string()).optional(),
    wouldRecommend: z.boolean().optional(),
  }).optional(),
  
  notes: z.string().optional(),
});

export type TreatmentPlan = z.infer<typeof TreatmentPlanSchema>;
export type TreatmentSession = z.infer<typeof TreatmentSessionSchema>;

/**
 * Treatment Plan Templates
 */
export const TREATMENT_PLAN_TEMPLATES = {
  // Anti-aging comprehensive plan
  antiAging: {
    name: 'Comprehensive Anti-Aging Program',
    type: PlanType.MULTI_SESSION,
    goals: [
      TreatmentGoal.WRINKLE_REDUCTION,
      TreatmentGoal.VOLUME_RESTORATION,
      TreatmentGoal.SKIN_TIGHTENING,
    ],
    duration: {
      totalWeeks: 16,
      totalSessions: 6,
    },
    sessions: [
      {
        treatments: [
          { name: 'Botox - Full Face', category: 'neurotoxin', units: 50 },
          { name: 'Microneedling with PRP', category: 'resurfacing' },
        ],
      },
      {
        treatments: [
          { name: 'Juvederm - Cheeks', category: 'filler', units: 2 },
          { name: 'IPL Photofacial', category: 'laser' },
        ],
      },
    ],
  },
  
  // Acne treatment series
  acneTreatment: {
    name: 'Acne Clear Program',
    type: PlanType.CORRECTIVE,
    goals: [TreatmentGoal.ACNE_TREATMENT, TreatmentGoal.TEXTURE_IMPROVEMENT],
    duration: {
      totalWeeks: 12,
      totalSessions: 6,
    },
    sessions: [
      {
        treatments: [
          { name: 'Salicylic Acid Peel', category: 'chemical_peel' },
          { name: 'LED Light Therapy', category: 'light_therapy' },
        ],
      },
    ],
  },
  
  // Body contouring plan
  bodyContouring: {
    name: 'Body Transformation Package',
    type: PlanType.MULTI_SESSION,
    goals: [TreatmentGoal.FAT_REDUCTION, TreatmentGoal.MUSCLE_TONING],
    duration: {
      totalWeeks: 8,
      totalSessions: 4,
    },
    sessions: [
      {
        treatments: [
          { name: 'CoolSculpting - Abdomen', category: 'body_contouring' },
          { name: 'Emsculpt - Abdomen', category: 'muscle_toning' },
        ],
      },
    ],
  },
  
  // Maintenance botox plan
  maintenanceBotox: {
    name: 'Botox Maintenance Program',
    type: PlanType.MAINTENANCE,
    goals: [TreatmentGoal.WRINKLE_REDUCTION, TreatmentGoal.PREVENTATIVE],
    duration: {
      totalWeeks: 52,
      totalSessions: 4,
    },
    sessions: [
      {
        treatments: [
          { name: 'Botox - Forehead & Crow\'s Feet', category: 'neurotoxin', units: 35 },
        ],
      },
    ],
  },
};

/**
 * Treatment Planning Service
 */
export class TreatmentPlanningService {
  private static instance: TreatmentPlanningService;
  
  private constructor() {}
  
  static getInstance(): TreatmentPlanningService {
    if (!TreatmentPlanningService.instance) {
      TreatmentPlanningService.instance = new TreatmentPlanningService();
    }
    return TreatmentPlanningService.instance;
  }
  
  /**
   * Create a new treatment plan
   */
  async createPlan(
    patientId: string,
    planData: Partial<TreatmentPlan>,
    createdBy: string
  ): Promise<TreatmentPlan> {
    const plan: TreatmentPlan = {
      id: this.generateId(),
      patientId,
      patientName: '', // Would be fetched from patient service
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: PlanStatus.DRAFT,
      type: PlanType.SINGLE_SESSION,
      name: '',
      description: '',
      goals: [],
      expectedOutcomes: [],
      duration: {
        totalWeeks: 1,
        totalSessions: 1,
      },
      medicalHistory: {
        allergies: [],
        medications: [],
        contraindications: [],
        previousTreatments: [],
      },
      sessions: [],
      pricing: {
        totalCost: 0,
        finalCost: 0,
      },
      followUp: {
        schedule: [],
        maintenanceRecommended: false,
      },
      consent: {
        obtained: false,
      },
      ...planData,
    };
    
    // Validate the plan
    const validated = TreatmentPlanSchema.parse(plan);
    
    // Calculate pricing
    validated.pricing = this.calculatePricing(validated);
    
    // Save to database (mock)
    await this.savePlan(validated);
    
    return validated;
  }
  
  /**
   * Create plan from template
   */
  async createFromTemplate(
    patientId: string,
    templateName: keyof typeof TREATMENT_PLAN_TEMPLATES,
    customizations?: Partial<TreatmentPlan>
  ): Promise<TreatmentPlan> {
    const template = TREATMENT_PLAN_TEMPLATES[templateName];
    
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }
    
    // Generate sessions from template
    const sessions = this.generateSessionsFromTemplate(template);
    
    const plan = await this.createPlan(
      patientId,
      {
        ...template,
        sessions,
        ...customizations,
      },
      'system'
    );
    
    return plan;
  }
  
  /**
   * Update treatment plan
   */
  async updatePlan(
    planId: string,
    updates: Partial<TreatmentPlan>
  ): Promise<TreatmentPlan> {
    const existing = await this.getPlan(planId);
    
    if (!existing) {
      throw new Error('Plan not found');
    }
    
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    
    // Recalculate pricing if sessions changed
    if (updates.sessions) {
      updated.pricing = this.calculatePricing(updated);
    }
    
    const validated = TreatmentPlanSchema.parse(updated);
    await this.savePlan(validated);
    
    return validated;
  }
  
  /**
   * Complete a session
   */
  async completeSession(
    planId: string,
    sessionId: string,
    results: any
  ): Promise<void> {
    const plan = await this.getPlan(planId);
    
    if (!plan) {
      throw new Error('Plan not found');
    }
    
    const session = plan.sessions.find(s => s.id === sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    session.completedDate = new Date();
    session.status = 'completed';
    session.results = results;
    
    // Update plan status if needed
    const allSessionsComplete = plan.sessions.every(s => s.status === 'completed');
    
    if (allSessionsComplete) {
      plan.status = PlanStatus.COMPLETED;
    } else if (plan.status === PlanStatus.PROPOSED) {
      plan.status = PlanStatus.IN_PROGRESS;
    }
    
    await this.savePlan(plan);
  }
  
  /**
   * Get treatment recommendations
   */
  async getRecommendations(patientId: string): Promise<{
    recommended: string[];
    reasoning: string[];
    contraindicated: string[];
  }> {
    // In production, this would use AI and patient history
    const patientHistory = await this.getPatientHistory(patientId);
    
    const recommendations = {
      recommended: [] as string[],
      reasoning: [] as string[],
      contraindicated: [] as string[],
    };
    
    // Basic recommendation logic
    if (patientHistory.age > 30) {
      recommendations.recommended.push('Botox for prevention');
      recommendations.reasoning.push('Preventative treatment recommended for 30+');
    }
    
    if (patientHistory.skinType === 'acne-prone') {
      recommendations.recommended.push('Chemical peels');
      recommendations.reasoning.push('Effective for acne-prone skin');
    }
    
    if (patientHistory.allergies?.includes('lidocaine')) {
      recommendations.contraindicated.push('Dermal fillers with lidocaine');
    }
    
    return recommendations;
  }
  
  /**
   * Calculate treatment plan pricing
   */
  private calculatePricing(plan: TreatmentPlan): TreatmentPlan['pricing'] {
    let totalCost = 0;
    
    plan.sessions.forEach(session => {
      session.treatments.forEach(treatment => {
        totalCost += treatment.price || 0;
      });
    });
    
    // Add home care products
    if (plan.homeCare) {
      plan.homeCare.products.forEach(product => {
        totalCost += product.price || 0;
      });
    }
    
    let finalCost = totalCost;
    
    // Apply discount
    if (plan.pricing.discount) {
      if (plan.pricing.discountType === 'percentage') {
        finalCost = totalCost * (1 - plan.pricing.discount / 100);
      } else {
        finalCost = totalCost - plan.pricing.discount;
      }
    }
    
    // Calculate payment plan if enabled
    let paymentPlan = plan.pricing.paymentPlan;
    
    if (paymentPlan?.enabled) {
      paymentPlan = {
        ...paymentPlan,
        amount: finalCost / paymentPlan.installments,
      };
    }
    
    return {
      totalCost,
      discount: plan.pricing.discount,
      discountType: plan.pricing.discountType,
      finalCost,
      paymentPlan,
      package: plan.pricing.package,
    };
  }
  
  /**
   * Generate sessions from template
   */
  private generateSessionsFromTemplate(template: any): TreatmentSession[] {
    const sessions: TreatmentSession[] = [];
    const sessionCount = template.duration.totalSessions;
    const weeksBetween = template.duration.totalWeeks / sessionCount;
    
    for (let i = 0; i < sessionCount; i++) {
      const session: TreatmentSession = {
        id: this.generateId(),
        sessionNumber: i + 1,
        scheduledDate: undefined, // To be scheduled
        treatments: template.sessions[i % template.sessions.length].treatments.map((t: any) => ({
          id: this.generateId(),
          name: t.name,
          category: t.category,
          units: t.units,
          areas: t.areas || [],
          duration: t.duration || 30,
          price: t.price || 0,
        })),
        preCareinstructions: this.getPreCareInstructions(template.sessions[i % template.sessions.length].treatments),
        postCareInstructions: this.getPostCareInstructions(template.sessions[i % template.sessions.length].treatments),
        status: 'scheduled',
      };
      
      sessions.push(session);
    }
    
    return sessions;
  }
  
  /**
   * Get pre-care instructions based on treatments
   */
  private getPreCareInstructions(treatments: any[]): string[] {
    const instructions = new Set<string>();
    
    treatments.forEach(treatment => {
      if (treatment.category === 'neurotoxin') {
        instructions.add('Avoid alcohol and blood thinners 24 hours before');
        instructions.add('Avoid anti-inflammatory medications 48 hours before');
      }
      if (treatment.category === 'filler') {
        instructions.add('Avoid blood thinners 48 hours before');
        instructions.add('Arrive with clean skin');
      }
      if (treatment.category === 'laser') {
        instructions.add('Avoid sun exposure 2 weeks before');
        instructions.add('No self-tanner for 2 weeks before');
      }
      if (treatment.category === 'chemical_peel') {
        instructions.add('Stop retinoids 3 days before');
        instructions.add('Arrive makeup-free');
      }
    });
    
    return Array.from(instructions);
  }
  
  /**
   * Get post-care instructions based on treatments
   */
  private getPostCareInstructions(treatments: any[]): string[] {
    const instructions = new Set<string>();
    
    treatments.forEach(treatment => {
      if (treatment.category === 'neurotoxin') {
        instructions.add('No lying down for 4 hours');
        instructions.add('Avoid exercise for 24 hours');
        instructions.add('No facial massage for 2 weeks');
      }
      if (treatment.category === 'filler') {
        instructions.add('Apply ice for swelling');
        instructions.add('Sleep elevated for 2 nights');
        instructions.add('Gentle massage as directed');
      }
      if (treatment.category === 'laser') {
        instructions.add('Apply SPF 50+ daily');
        instructions.add('Keep skin moisturized');
        instructions.add('Avoid heat and sweating for 48 hours');
      }
    });
    
    return Array.from(instructions);
  }
  
  // Mock database methods
  
  private generateId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private async savePlan(plan: TreatmentPlan): Promise<void> {
    // In production, save to database
    console.log('Saving treatment plan:', plan.id);
  }
  
  private async getPlan(planId: string): Promise<TreatmentPlan | null> {
    // In production, fetch from database
    return null;
  }
  
  private async getPatientHistory(patientId: string): Promise<any> {
    // In production, fetch from patient service
    return {
      age: 35,
      skinType: 'normal',
      allergies: [],
    };
  }
}

// Export singleton instance
export const treatmentPlanning = TreatmentPlanningService.getInstance();