/**
 * AI Conversation Engine
 * Advanced AI-powered messaging system for Luxe Medical Spa
 */

import { OpenAI } from 'openai';
import { z } from 'zod';

// Initialize OpenAI (can be swapped with Claude or other models)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Intent categories for medical spa
export enum IntentCategory {
  // Appointment related
  APPOINTMENT_BOOKING = 'appointment_booking',
  APPOINTMENT_CONFIRMATION = 'appointment_confirmation',
  APPOINTMENT_CANCELLATION = 'appointment_cancellation',
  APPOINTMENT_RESCHEDULING = 'appointment_rescheduling',
  APPOINTMENT_INQUIRY = 'appointment_inquiry',
  
  // Treatment related
  TREATMENT_QUESTION = 'treatment_question',
  TREATMENT_CONCERN = 'treatment_concern',
  POST_TREATMENT_FOLLOWUP = 'post_treatment_followup',
  TREATMENT_RECOMMENDATION = 'treatment_recommendation',
  SIDE_EFFECT_REPORT = 'side_effect_report',
  
  // Financial
  PRICING_INQUIRY = 'pricing_inquiry',
  PAYMENT_QUESTION = 'payment_question',
  INSURANCE_QUESTION = 'insurance_question',
  PACKAGE_INQUIRY = 'package_inquiry',
  MEMBERSHIP_QUESTION = 'membership_question',
  
  // Emergency
  EMERGENCY_MEDICAL = 'emergency_medical',
  URGENT_CONCERN = 'urgent_concern',
  COMPLICATION_REPORT = 'complication_report',
  
  // General
  GENERAL_INQUIRY = 'general_inquiry',
  LOCATION_HOURS = 'location_hours',
  STAFF_REQUEST = 'staff_request',
  FEEDBACK_COMPLAINT = 'feedback_complaint',
  REVIEW_RESPONSE = 'review_response',
  
  // Marketing
  PROMOTION_INTEREST = 'promotion_interest',
  REFERRAL_INQUIRY = 'referral_inquiry',
  
  // Administrative
  FORMS_DOCUMENTS = 'forms_documents',
  CONSENT_RELATED = 'consent_related',
  OPT_OUT_REQUEST = 'opt_out_request',
  
  UNKNOWN = 'unknown',
}

// Urgency levels
export enum UrgencyLevel {
  CRITICAL = 'critical', // Immediate staff attention needed
  HIGH = 'high',        // Within 30 minutes
  MEDIUM = 'medium',    // Within 2 hours
  LOW = 'low',          // Within 24 hours
  NONE = 'none',        // No urgency
}

// Sentiment analysis
export enum Sentiment {
  VERY_POSITIVE = 'very_positive',
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  VERY_NEGATIVE = 'very_negative',
  ANGRY = 'angry',
}

// Analysis result schema
export const AnalysisResultSchema = z.object({
  intent: z.object({
    primary: z.nativeEnum(IntentCategory),
    secondary: z.nativeEnum(IntentCategory).optional(),
    confidence: z.number().min(0).max(1),
  }),
  urgency: z.nativeEnum(UrgencyLevel),
  sentiment: z.nativeEnum(Sentiment),
  requiresHuman: z.boolean(),
  autoResponseSafe: z.boolean(),
  extractedInfo: z.object({
    appointmentDate: z.string().optional(),
    appointmentTime: z.string().optional(),
    serviceName: z.string().optional(),
    providerName: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().optional(),
    preferredTimes: z.array(z.string()).optional(),
  }).optional(),
  suggestedResponses: z.array(z.string()),
  suggestedActions: z.array(z.object({
    type: z.string(),
    label: z.string(),
    description: z.string().optional(),
    data: z.record(z.any()).optional(),
  })),
  keywords: z.array(z.string()),
  riskFactors: z.array(z.string()),
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

// Context for message processing
export interface MessageContext {
  patientId: string;
  patientName?: string;
  conversationHistory?: Array<{
    sender: 'patient' | 'staff' | 'ai';
    message: string;
    timestamp: Date;
  }>;
  patientProfile?: {
    isVIP: boolean;
    membershipTier?: string;
    lastVisit?: Date;
    upcomingAppointments?: Array<{
      date: Date;
      service: string;
      provider: string;
    }>;
    recentTreatments?: Array<{
      date: Date;
      treatment: string;
      provider: string;
    }>;
    allergies?: string[];
    medicalNotes?: string[];
  };
  businessHours?: boolean;
  staffAvailable?: boolean;
}

/**
 * AI Conversation Engine
 */
export class AIConversationEngine {
  private static instance: AIConversationEngine;
  
  // Emergency keywords that trigger immediate alerts
  private emergencyKeywords = [
    'emergency', 'urgent', 'help', '911', 'severe pain', 'bleeding',
    'allergic reaction', 'cant breathe', 'chest pain', 'infection',
    'swelling face', 'vision loss', 'numbness', 'fever', 'emergency room'
  ];
  
  // Complication keywords
  private complicationKeywords = [
    'bruising', 'swelling', 'pain', 'redness', 'bump', 'lump',
    'asymmetry', 'drooping', 'migration', 'hard spot', 'infection signs',
    'yellow discharge', 'excessive bleeding', 'blistering'
  ];
  
  // Positive keywords
  private positiveKeywords = [
    'love', 'amazing', 'perfect', 'excellent', 'wonderful', 'fantastic',
    'great results', 'so happy', 'thank you', 'best', 'recommend'
  ];
  
  private constructor() {}
  
  static getInstance(): AIConversationEngine {
    if (!AIConversationEngine.instance) {
      AIConversationEngine.instance = new AIConversationEngine();
    }
    return AIConversationEngine.instance;
  }
  
  /**
   * Analyze incoming message
   */
  async analyzeMessage(
    message: string,
    context: MessageContext
  ): Promise<AnalysisResult> {
    try {
      // Quick emergency check
      const isEmergency = this.checkEmergency(message);
      if (isEmergency) {
        return this.handleEmergency(message, context);
      }
      
      // Build context prompt
      const contextPrompt = this.buildContextPrompt(context);
      
      // Call AI model for analysis
      const analysis = await this.callAIModel(message, contextPrompt);
      
      // Post-process and validate
      const validated = this.validateAndEnhance(analysis, message, context);
      
      return validated;
      
    } catch (error) {
      console.error('AI analysis error:', error);
      return this.getFallbackAnalysis(message);
    }
  }
  
  /**
   * Generate response suggestions
   */
  async generateResponses(
    analysis: AnalysisResult,
    context: MessageContext
  ): Promise<string[]> {
    const responses: string[] = [];
    
    switch (analysis.intent.primary) {
      case IntentCategory.APPOINTMENT_CONFIRMATION:
        responses.push(
          'Thank you for confirming your appointment! We look forward to seeing you.',
          `Perfect! Your appointment is confirmed. Please arrive 10 minutes early for check-in.`,
          'Great! Your appointment is all set. See you soon!'
        );
        break;
        
      case IntentCategory.APPOINTMENT_BOOKING:
        responses.push(
          `I'd be happy to help you book an appointment. What service are you interested in and when works best for you?`,
          'Let me check our availability. What treatment would you like to schedule?',
          'I can help with booking! What day and time works best for you?'
        );
        break;
        
      case IntentCategory.APPOINTMENT_RESCHEDULING:
        responses.push(
          'I understand you need to reschedule. What dates and times work better for you?',
          'No problem! Let me help you find a new time. When would you prefer?',
          'I'll help you reschedule. What are your preferred dates and times?'
        );
        break;
        
      case IntentCategory.TREATMENT_QUESTION:
        if (context.patientProfile?.recentTreatments?.length) {
          const lastTreatment = context.patientProfile.recentTreatments[0];
          responses.push(
            `I see you recently had ${lastTreatment.treatment}. How can I help with your question?`,
            'I'd be happy to answer your treatment question. What would you like to know?'
          );
        } else {
          responses.push(
            'I'd be happy to answer your treatment question. What would you like to know?',
            'Great question! Let me provide you with information about our treatments.',
            'I can help with treatment information. What specific details are you looking for?'
          );
        }
        break;
        
      case IntentCategory.POST_TREATMENT_FOLLOWUP:
        responses.push(
          'Thank you for the update! How are you feeling? Any specific concerns?',
          'I appreciate you checking in. Tell me more about your recovery.',
          'Thanks for following up! How has your healing been progressing?'
        );
        break;
        
      case IntentCategory.PRICING_INQUIRY:
        responses.push(
          'I can help with pricing information. Which treatment are you interested in?',
          'Our pricing varies by treatment. What service would you like pricing for?',
          'I'd be happy to provide pricing. Which treatment are you considering?'
        );
        break;
        
      case IntentCategory.EMERGENCY_MEDICAL:
      case IntentCategory.URGENT_CONCERN:
        responses.push(
          'This sounds urgent. A staff member will contact you immediately. If this is a medical emergency, please call 911.',
          'I'm alerting our medical team right away. Someone will call you within minutes.',
          'Your message has been marked as urgent. Our team is being notified immediately.'
        );
        break;
        
      default:
        responses.push(
          'Thank you for your message. How can I assist you today?',
          'I've received your message. Let me help you with that.',
          'Thanks for reaching out! I'm here to help.'
        );
    }
    
    // Add personalization if VIP
    if (context.patientProfile?.isVIP) {
      responses[0] = `${context.patientName || 'Valued VIP Member'}, ${responses[0]}`;
    }
    
    return responses;
  }
  
  /**
   * Determine if human intervention is needed
   */
  shouldEscalateToHuman(analysis: AnalysisResult, context: MessageContext): boolean {
    // Always escalate emergencies
    if (analysis.urgency === UrgencyLevel.CRITICAL || analysis.urgency === UrgencyLevel.HIGH) {
      return true;
    }
    
    // Escalate negative sentiment
    if (analysis.sentiment === Sentiment.VERY_NEGATIVE || analysis.sentiment === Sentiment.ANGRY) {
      return true;
    }
    
    // Escalate complications
    if (analysis.intent.primary === IntentCategory.COMPLICATION_REPORT ||
        analysis.intent.primary === IntentCategory.SIDE_EFFECT_REPORT) {
      return true;
    }
    
    // Escalate low confidence
    if (analysis.intent.confidence < 0.6) {
      return true;
    }
    
    // Escalate VIP concerns
    if (context.patientProfile?.isVIP && analysis.sentiment === Sentiment.NEGATIVE) {
      return true;
    }
    
    // Escalate specific intents that need human touch
    const humanRequiredIntents = [
      IntentCategory.FEEDBACK_COMPLAINT,
      IntentCategory.INSURANCE_QUESTION,
      IntentCategory.CONSENT_RELATED,
      IntentCategory.STAFF_REQUEST,
    ];
    
    if (humanRequiredIntents.includes(analysis.intent.primary)) {
      return true;
    }
    
    return analysis.requiresHuman;
  }
  
  /**
   * Extract structured information from message
   */
  extractInformation(message: string): Partial<AnalysisResult['extractedInfo']> {
    const extracted: Partial<AnalysisResult['extractedInfo']> = {};
    
    // Extract dates (various formats)
    const datePatterns = [
      /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g, // MM/DD or MM/DD/YY
      /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
      /\b(tomorrow|today|next week|this week)\b/gi,
      /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}\b/gi,
    ];
    
    datePatterns.forEach(pattern => {
      const matches = message.match(pattern);
      if (matches) {
        extracted.appointmentDate = matches[0];
      }
    });
    
    // Extract times
    const timePattern = /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?\b/g;
    const timeMatches = message.match(timePattern);
    if (timeMatches) {
      extracted.appointmentTime = timeMatches[0];
      if (timeMatches.length > 1) {
        extracted.preferredTimes = timeMatches;
      }
    }
    
    // Extract phone numbers
    const phonePattern = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
    const phoneMatches = message.match(phonePattern);
    if (phoneMatches) {
      extracted.phoneNumber = phoneMatches[0];
    }
    
    // Extract email
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emailMatches = message.match(emailPattern);
    if (emailMatches) {
      extracted.email = emailMatches[0];
    }
    
    // Extract service names (medical spa specific)
    const services = [
      'botox', 'filler', 'dysport', 'juvederm', 'restylane', 'sculptra',
      'microneedling', 'chemical peel', 'laser', 'ipl', 'hydrafacial',
      'prp', 'vampire facial', 'coolsculpting', 'emsculpt', 'kybella'
    ];
    
    services.forEach(service => {
      if (message.toLowerCase().includes(service)) {
        extracted.serviceName = service;
      }
    });
    
    // Extract provider names (if mentioned)
    const providerPattern = /\b(?:Dr\.|Doctor|Nurse)\s+([A-Z][a-z]+)\b/g;
    const providerMatches = message.match(providerPattern);
    if (providerMatches) {
      extracted.providerName = providerMatches[0];
    }
    
    return extracted;
  }
  
  // Private helper methods
  
  private checkEmergency(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    return this.emergencyKeywords.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
  }
  
  private handleEmergency(
    message: string,
    context: MessageContext
  ): AnalysisResult {
    return {
      intent: {
        primary: IntentCategory.EMERGENCY_MEDICAL,
        confidence: 1.0,
      },
      urgency: UrgencyLevel.CRITICAL,
      sentiment: Sentiment.NEGATIVE,
      requiresHuman: true,
      autoResponseSafe: false,
      extractedInfo: this.extractInformation(message),
      suggestedResponses: [
        'This appears to be an emergency. Please call 911 immediately if you need urgent medical attention.',
        'I\'m alerting our medical team immediately. If this is life-threatening, please call 911.',
        'Your message has been flagged as urgent. Our team is being notified now. For emergencies, call 911.'
      ],
      suggestedActions: [
        {
          type: 'alert_staff',
          label: 'Alert All Staff',
          description: 'Send immediate notification to all available staff',
        },
        {
          type: 'call_patient',
          label: 'Call Patient Immediately',
          description: 'Initiate immediate phone call to patient',
        },
      ],
      keywords: this.extractKeywords(message),
      riskFactors: ['emergency_keywords_detected', 'immediate_attention_required'],
    };
  }
  
  private async callAIModel(
    message: string,
    contextPrompt: string
  ): Promise<AnalysisResult> {
    if (!openai || !process.env.OPENAI_API_KEY) {
      return this.getFallbackAnalysis(message);
    }
    
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant for a medical spa. Analyze patient messages and provide structured analysis.
            
            ${contextPrompt}
            
            Return a JSON object with:
            - intent (primary category, confidence 0-1)
            - urgency (critical/high/medium/low/none)
            - sentiment (very_positive/positive/neutral/negative/very_negative/angry)
            - requiresHuman (boolean)
            - autoResponseSafe (boolean - is it safe to auto-respond)
            - suggestedResponses (array of 3 appropriate responses)
            - suggestedActions (array of recommended actions for staff)
            - keywords (important terms extracted)
            - riskFactors (any concerns or risks identified)
            
            Be especially careful with medical concerns and always err on the side of human intervention.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });
      
      const result = JSON.parse(completion.choices[0].message.content || '{}');
      
      // Map the AI response to our schema
      return this.mapAIResponse(result, message);
      
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.getFallbackAnalysis(message);
    }
  }
  
  private mapAIResponse(aiResponse: any, originalMessage: string): AnalysisResult {
    // Map AI response to our strict schema
    return {
      intent: {
        primary: this.mapIntent(aiResponse.intent?.primary) || IntentCategory.UNKNOWN,
        secondary: aiResponse.intent?.secondary ? this.mapIntent(aiResponse.intent.secondary) : undefined,
        confidence: aiResponse.intent?.confidence || 0.5,
      },
      urgency: this.mapUrgency(aiResponse.urgency) || UrgencyLevel.LOW,
      sentiment: this.mapSentiment(aiResponse.sentiment) || Sentiment.NEUTRAL,
      requiresHuman: aiResponse.requiresHuman || false,
      autoResponseSafe: aiResponse.autoResponseSafe || false,
      extractedInfo: this.extractInformation(originalMessage),
      suggestedResponses: aiResponse.suggestedResponses || [],
      suggestedActions: aiResponse.suggestedActions || [],
      keywords: aiResponse.keywords || this.extractKeywords(originalMessage),
      riskFactors: aiResponse.riskFactors || [],
    };
  }
  
  private mapIntent(intent: string): IntentCategory {
    // Map AI intent strings to our enum
    const intentMap: Record<string, IntentCategory> = {
      'booking': IntentCategory.APPOINTMENT_BOOKING,
      'confirmation': IntentCategory.APPOINTMENT_CONFIRMATION,
      'cancellation': IntentCategory.APPOINTMENT_CANCELLATION,
      'reschedule': IntentCategory.APPOINTMENT_RESCHEDULING,
      'treatment_question': IntentCategory.TREATMENT_QUESTION,
      'pricing': IntentCategory.PRICING_INQUIRY,
      'emergency': IntentCategory.EMERGENCY_MEDICAL,
      // Add more mappings as needed
    };
    
    return intentMap[intent?.toLowerCase()] || IntentCategory.UNKNOWN;
  }
  
  private mapUrgency(urgency: string): UrgencyLevel {
    const urgencyMap: Record<string, UrgencyLevel> = {
      'critical': UrgencyLevel.CRITICAL,
      'high': UrgencyLevel.HIGH,
      'medium': UrgencyLevel.MEDIUM,
      'low': UrgencyLevel.LOW,
      'none': UrgencyLevel.NONE,
    };
    
    return urgencyMap[urgency?.toLowerCase()] || UrgencyLevel.LOW;
  }
  
  private mapSentiment(sentiment: string): Sentiment {
    const sentimentMap: Record<string, Sentiment> = {
      'very_positive': Sentiment.VERY_POSITIVE,
      'positive': Sentiment.POSITIVE,
      'neutral': Sentiment.NEUTRAL,
      'negative': Sentiment.NEGATIVE,
      'very_negative': Sentiment.VERY_NEGATIVE,
      'angry': Sentiment.ANGRY,
    };
    
    return sentimentMap[sentiment?.toLowerCase()] || Sentiment.NEUTRAL;
  }
  
  private buildContextPrompt(context: MessageContext): string {
    let prompt = 'Context:\n';
    
    if (context.patientProfile) {
      prompt += `- Patient is ${context.patientProfile.isVIP ? 'VIP' : 'regular'} member\n`;
      
      if (context.patientProfile.membershipTier) {
        prompt += `- Membership tier: ${context.patientProfile.membershipTier}\n`;
      }
      
      if (context.patientProfile.lastVisit) {
        prompt += `- Last visit: ${context.patientProfile.lastVisit.toLocaleDateString()}\n`;
      }
      
      if (context.patientProfile.upcomingAppointments?.length) {
        const nextAppt = context.patientProfile.upcomingAppointments[0];
        prompt += `- Next appointment: ${nextAppt.service} on ${nextAppt.date.toLocaleDateString()}\n`;
      }
      
      if (context.patientProfile.recentTreatments?.length) {
        const recent = context.patientProfile.recentTreatments[0];
        prompt += `- Recent treatment: ${recent.treatment} on ${recent.date.toLocaleDateString()}\n`;
      }
    }
    
    prompt += `- Business hours: ${context.businessHours ? 'Yes' : 'No'}\n`;
    prompt += `- Staff available: ${context.staffAvailable ? 'Yes' : 'No'}\n`;
    
    if (context.conversationHistory?.length) {
      prompt += '\nRecent conversation:\n';
      context.conversationHistory.slice(-3).forEach(msg => {
        prompt += `${msg.sender}: ${msg.message}\n`;
      });
    }
    
    return prompt;
  }
  
  private validateAndEnhance(
    analysis: AnalysisResult,
    message: string,
    context: MessageContext
  ): AnalysisResult {
    // Add extracted info if not present
    if (!analysis.extractedInfo) {
      analysis.extractedInfo = this.extractInformation(message);
    }
    
    // Check for complications
    const hasComplication = this.complicationKeywords.some(keyword =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasComplication && analysis.intent.primary === IntentCategory.UNKNOWN) {
      analysis.intent.primary = IntentCategory.TREATMENT_CONCERN;
      analysis.urgency = UrgencyLevel.HIGH;
      analysis.requiresHuman = true;
    }
    
    // Adjust for VIP patients
    if (context.patientProfile?.isVIP && analysis.urgency === UrgencyLevel.LOW) {
      analysis.urgency = UrgencyLevel.MEDIUM;
    }
    
    // Ensure negative sentiment escalates
    if (analysis.sentiment === Sentiment.VERY_NEGATIVE || analysis.sentiment === Sentiment.ANGRY) {
      analysis.requiresHuman = true;
      if (analysis.urgency === UrgencyLevel.LOW) {
        analysis.urgency = UrgencyLevel.MEDIUM;
      }
    }
    
    return analysis;
  }
  
  private getFallbackAnalysis(message: string): AnalysisResult {
    // Basic fallback analysis when AI is unavailable
    const lowerMessage = message.toLowerCase();
    
    let intent = IntentCategory.UNKNOWN;
    let urgency = UrgencyLevel.LOW;
    let sentiment = Sentiment.NEUTRAL;
    
    // Basic intent detection
    if (lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
      intent = IntentCategory.APPOINTMENT_BOOKING;
    } else if (lowerMessage.includes('confirm') || lowerMessage === 'c') {
      intent = IntentCategory.APPOINTMENT_CONFIRMATION;
    } else if (lowerMessage.includes('cancel')) {
      intent = IntentCategory.APPOINTMENT_CANCELLATION;
    } else if (lowerMessage.includes('reschedule') || lowerMessage === 'r') {
      intent = IntentCategory.APPOINTMENT_RESCHEDULING;
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      intent = IntentCategory.PRICING_INQUIRY;
    }
    
    // Check urgency
    if (this.checkEmergency(message)) {
      urgency = UrgencyLevel.CRITICAL;
    } else if (this.complicationKeywords.some(k => lowerMessage.includes(k))) {
      urgency = UrgencyLevel.HIGH;
    }
    
    // Check sentiment
    if (this.positiveKeywords.some(k => lowerMessage.includes(k))) {
      sentiment = Sentiment.POSITIVE;
    } else if (lowerMessage.includes('angry') || lowerMessage.includes('upset')) {
      sentiment = Sentiment.NEGATIVE;
    }
    
    return {
      intent: {
        primary: intent,
        confidence: 0.5,
      },
      urgency,
      sentiment,
      requiresHuman: urgency >= UrgencyLevel.HIGH,
      autoResponseSafe: intent !== IntentCategory.UNKNOWN && urgency <= UrgencyLevel.MEDIUM,
      extractedInfo: this.extractInformation(message),
      suggestedResponses: [],
      suggestedActions: [],
      keywords: this.extractKeywords(message),
      riskFactors: [],
    };
  }
  
  private extractKeywords(message: string): string[] {
    // Extract important keywords from message
    const words = message.toLowerCase().split(/\s+/);
    const importantWords = words.filter(word => 
      word.length > 3 && 
      !['the', 'and', 'for', 'with', 'have', 'this', 'that', 'from', 'what', 'when', 'where'].includes(word)
    );
    
    return [...new Set(importantWords)].slice(0, 10);
  }
}

// Export singleton instance
export const aiEngine = AIConversationEngine.getInstance();