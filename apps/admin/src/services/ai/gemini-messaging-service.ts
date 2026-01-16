/**
 * Gemini Messaging Service
 *
 * Main service for proactive AI message processing.
 * Analyzes incoming patient messages and generates response suggestions.
 */

import { getGeminiClient } from '@/lib/vertex-ai/client';
import { buildPatientContext, formatContextForPrompt, createUnknownPatientContext, PatientContext } from './context-builder';
import { MEDSPA_SYSTEM_INSTRUCTION, ANALYSIS_SYSTEM_INSTRUCTION, RESPONSE_GENERATION_INSTRUCTION } from './system-instructions';

// ============ Types ============

export type IntentCategory =
  | 'appointment_booking'
  | 'appointment_confirmation'
  | 'appointment_cancellation'
  | 'appointment_rescheduling'
  | 'appointment_inquiry'
  | 'treatment_question'
  | 'post_treatment_followup'
  | 'complication_report'
  | 'pricing_inquiry'
  | 'general_inquiry'
  | 'emergency';

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'ANGRY';

export interface MessageAnalysis {
  intent: IntentCategory;
  urgency: UrgencyLevel;
  sentiment: Sentiment;
  requiresHuman: boolean;
  riskFactors: string[];
}

export interface GeneratedResponse {
  id: string;
  text: string;
  confidence: number;
  characterCount: number;
}

export interface TenantContext {
  medSpaId: string;
  locationId: string;
}

export interface AIProcessingResult {
  messageId: string;
  patientId: string;
  patientName: string;
  analysis: MessageAnalysis;
  responses: GeneratedResponse[];
  context: PatientContext | null;
  generatedAt: Date;
  processingTimeMs: number;
  // Multi-tenant support
  tenant: TenantContext;
}

// ============ Constants ============

// Emergency keywords - always CRITICAL urgency
const EMERGENCY_KEYWORDS = [
  '911', 'emergency', 'urgent help', 'severe pain', 'cant breathe',
  'allergic reaction', 'chest pain', 'vision loss', 'uncontrolled bleeding',
  'swelling throat', 'difficulty breathing', 'anaphylaxis'
];

// Complication keywords - HIGH urgency
const COMPLICATION_KEYWORDS = [
  'bruising', 'swelling', 'pain', 'redness', 'bump', 'lump', 'hard',
  'asymmetry', 'asymmetric', 'drooping', 'droop', 'migrated', 'migration',
  'infection', 'infected', 'fever', 'hot to touch', 'pus', 'discharge',
  'numbness', 'numb', 'tingling', 'burning', 'itching', 'hives'
];

// ============ Main Processing Function ============

/**
 * Get tenant context from environment or params
 */
function getTenantContext(providedTenant?: Partial<TenantContext>): TenantContext {
  return {
    medSpaId: providedTenant?.medSpaId || process.env.DEFAULT_MEDSPA_ID || 'default',
    locationId: providedTenant?.locationId || process.env.DEFAULT_LOCATION_ID || 'default',
  };
}

/**
 * Process an incoming message and generate AI analysis + response suggestions
 *
 * @param messageId - Unique message identifier
 * @param phoneNumber - Patient's phone number
 * @param messageText - The message content
 * @param recentMessages - Recent conversation history
 * @param tenantContext - Multi-tenant context (medSpaId, locationId)
 */
export async function processIncomingMessage(
  messageId: string,
  phoneNumber: string,
  messageText: string,
  recentMessages: Array<{ sender: string; text: string; time?: Date }> = [],
  tenantContext?: Partial<TenantContext>
): Promise<AIProcessingResult> {
  const startTime = Date.now();
  const client = getGeminiClient();
  const tenant = getTenantContext(tenantContext);

  // Build patient context
  const context = await buildPatientContext(phoneNumber, recentMessages);
  const contextPrompt = context
    ? formatContextForPrompt(context)
    : createUnknownPatientContext();

  const lowerMessage = messageText.toLowerCase();

  // Quick emergency check (before AI call for speed)
  const isEmergency = EMERGENCY_KEYWORDS.some(kw => lowerMessage.includes(kw.toLowerCase()));
  if (isEmergency) {
    return createEmergencyResult(messageId, context, messageText, startTime, tenant);
  }

  // Check for complication keywords
  const hasComplicationKeywords = COMPLICATION_KEYWORDS.some(kw => lowerMessage.includes(kw.toLowerCase()));

  // Check if patient is in critical period after treatment
  const inCriticalPeriod = context?.recentTreatments.some(tx => tx.inCriticalPeriod) || false;

  // ============ AI Analysis ============
  let analysis: MessageAnalysis;

  if (client.isReady()) {
    try {
      analysis = await analyzeWithGemini(client, messageText, contextPrompt);
    } catch (error) {
      console.error('Gemini analysis failed, using fallback:', error);
      analysis = createFallbackAnalysis(messageText, hasComplicationKeywords);
    }
  } else {
    // Gemini not configured - use rule-based fallback
    analysis = createFallbackAnalysis(messageText, hasComplicationKeywords);
  }

  // Override urgency for complications during critical period
  if (hasComplicationKeywords && inCriticalPeriod && analysis.urgency !== 'CRITICAL') {
    analysis.urgency = 'HIGH';
    analysis.requiresHuman = true;
    analysis.riskFactors.push('complication_during_critical_period');
  }

  // ============ Response Generation ============
  let responses: GeneratedResponse[];

  if (client.isReady() && !analysis.requiresHuman) {
    try {
      responses = await generateResponsesWithGemini(client, messageText, contextPrompt, analysis);
    } catch (error) {
      console.error('Gemini response generation failed:', error);
      responses = createFallbackResponses(messageId, analysis);
    }
  } else {
    responses = createFallbackResponses(messageId, analysis);
  }

  // Sort by confidence (highest first)
  responses.sort((a, b) => b.confidence - a.confidence);

  return {
    messageId,
    patientId: context?.patientId || 'unknown',
    patientName: context?.firstName || 'Patient',
    analysis,
    responses,
    context,
    generatedAt: new Date(),
    processingTimeMs: Date.now() - startTime,
    tenant,
  };
}

// ============ Gemini Integration ============

async function analyzeWithGemini(
  client: ReturnType<typeof getGeminiClient>,
  messageText: string,
  contextPrompt: string
): Promise<MessageAnalysis> {
  const prompt = `${contextPrompt}

## Message to Analyze:
"${messageText}"

Analyze this patient message and return a JSON object with:
- intent: one of [appointment_booking, appointment_confirmation, appointment_cancellation, appointment_rescheduling, appointment_inquiry, treatment_question, post_treatment_followup, complication_report, pricing_inquiry, general_inquiry, emergency]
- urgency: one of [CRITICAL, HIGH, MEDIUM, LOW]
- sentiment: one of [POSITIVE, NEUTRAL, NEGATIVE, ANGRY]
- requiresHuman: boolean - true if a staff member should review before responding
- riskFactors: array of strings describing any concerns`;

  const schema = {
    type: 'object',
    properties: {
      intent: {
        type: 'string',
        enum: ['appointment_booking', 'appointment_confirmation', 'appointment_cancellation',
               'appointment_rescheduling', 'appointment_inquiry', 'treatment_question',
               'post_treatment_followup', 'complication_report', 'pricing_inquiry',
               'general_inquiry', 'emergency']
      },
      urgency: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
      sentiment: { type: 'string', enum: ['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'ANGRY'] },
      requiresHuman: { type: 'boolean' },
      riskFactors: { type: 'array', items: { type: 'string' } },
    },
    required: ['intent', 'urgency', 'sentiment', 'requiresHuman', 'riskFactors'],
  };

  const result = await client.generateStructured<MessageAnalysis>(
    prompt,
    schema,
    { systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION }
  );

  return result;
}

async function generateResponsesWithGemini(
  client: ReturnType<typeof getGeminiClient>,
  messageText: string,
  contextPrompt: string,
  analysis: MessageAnalysis
): Promise<GeneratedResponse[]> {
  const prompt = `${contextPrompt}

## Patient Message:
"${messageText}"

## Analysis:
- Intent: ${analysis.intent}
- Urgency: ${analysis.urgency}
- Sentiment: ${analysis.sentiment}

Generate 3 professional SMS response options. Each response MUST be under 160 characters.
Make responses appropriate for the intent and urgency level.
${analysis.urgency === 'HIGH' ? 'Acknowledge the concern and offer to help immediately.' : ''}
${analysis.sentiment === 'NEGATIVE' || analysis.sentiment === 'ANGRY' ? 'Be extra empathetic and understanding.' : ''}

Return a JSON object with a "responses" array, where each item has:
- text: the response text (MUST be under 160 characters)
- confidence: number between 0 and 1 indicating how appropriate this response is`;

  const schema = {
    type: 'object',
    properties: {
      responses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            confidence: { type: 'number' },
          },
          required: ['text', 'confidence'],
        },
      },
    },
    required: ['responses'],
  };

  const result = await client.generateStructured<{ responses: Array<{ text: string; confidence: number }> }>(
    prompt,
    schema,
    { systemInstruction: RESPONSE_GENERATION_INSTRUCTION }
  );

  return result.responses.map((r, i) => ({
    id: `resp-${Date.now()}-${i}`,
    text: r.text.slice(0, 160), // Ensure SMS limit
    confidence: Math.max(0, Math.min(1, r.confidence)), // Clamp to 0-1
    characterCount: r.text.length,
  }));
}

// ============ Fallback Functions ============

function createFallbackAnalysis(
  messageText: string,
  hasComplicationKeywords: boolean
): MessageAnalysis {
  const lower = messageText.toLowerCase();

  // Simple rule-based intent detection
  let intent: IntentCategory = 'general_inquiry';
  if (lower.includes('book') || lower.includes('schedule') || lower.includes('appointment')) {
    intent = 'appointment_booking';
  } else if (lower.includes('confirm')) {
    intent = 'appointment_confirmation';
  } else if (lower.includes('cancel')) {
    intent = 'appointment_cancellation';
  } else if (lower.includes('reschedule') || lower.includes('change time')) {
    intent = 'appointment_rescheduling';
  } else if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
    intent = 'pricing_inquiry';
  } else if (hasComplicationKeywords) {
    intent = 'complication_report';
  } else if (lower.includes('after') || lower.includes('normal') || lower.includes('healing')) {
    intent = 'post_treatment_followup';
  }

  return {
    intent,
    urgency: hasComplicationKeywords ? 'HIGH' : 'MEDIUM',
    sentiment: 'NEUTRAL',
    requiresHuman: hasComplicationKeywords || intent === 'complication_report',
    riskFactors: hasComplicationKeywords ? ['complication_keywords_detected'] : [],
  };
}

function createFallbackResponses(
  messageId: string,
  analysis: MessageAnalysis
): GeneratedResponse[] {
  const responses: GeneratedResponse[] = [];

  // Generate appropriate fallback responses based on intent
  switch (analysis.intent) {
    case 'appointment_booking':
      responses.push({
        id: `${messageId}-1`,
        text: "We'd love to help you schedule! What service are you interested in, and do you have preferred dates?",
        confidence: 0.7,
        characterCount: 99,
      });
      responses.push({
        id: `${messageId}-2`,
        text: "Thanks for reaching out! Our team will check availability and get back to you shortly.",
        confidence: 0.6,
        characterCount: 89,
      });
      break;

    case 'appointment_confirmation':
      responses.push({
        id: `${messageId}-1`,
        text: "Great, you're all confirmed! We look forward to seeing you. Reply HELP if you need anything.",
        confidence: 0.85,
        characterCount: 95,
      });
      break;

    case 'appointment_cancellation':
      responses.push({
        id: `${messageId}-1`,
        text: "We're sorry to hear that. Your appointment has been cancelled. Would you like to reschedule?",
        confidence: 0.75,
        characterCount: 96,
      });
      break;

    case 'appointment_rescheduling':
      responses.push({
        id: `${messageId}-1`,
        text: "No problem! What dates/times work better for you? We'll find something that fits your schedule.",
        confidence: 0.75,
        characterCount: 100,
      });
      break;

    case 'post_treatment_followup':
      responses.push({
        id: `${messageId}-1`,
        text: "Thanks for the update! What you're experiencing is common. If it persists beyond 48hrs, let us know.",
        confidence: 0.7,
        characterCount: 106,
      });
      responses.push({
        id: `${messageId}-2`,
        text: "We appreciate you reaching out. Our team will review and respond shortly with aftercare guidance.",
        confidence: 0.6,
        characterCount: 101,
      });
      break;

    case 'complication_report':
      responses.push({
        id: `${messageId}-1`,
        text: "Thank you for letting us know. A team member will contact you shortly to discuss your concerns.",
        confidence: 0.8,
        characterCount: 100,
      });
      break;

    case 'pricing_inquiry':
      responses.push({
        id: `${messageId}-1`,
        text: "Great question! Pricing varies by treatment area. Would you like to schedule a free consultation?",
        confidence: 0.7,
        characterCount: 101,
      });
      break;

    default:
      responses.push({
        id: `${messageId}-1`,
        text: "Thank you for your message! A team member will respond shortly.",
        confidence: 0.5,
        characterCount: 64,
      });
  }

  return responses;
}

function createEmergencyResult(
  messageId: string,
  context: PatientContext | null,
  messageText: string,
  startTime: number,
  tenant: TenantContext
): AIProcessingResult {
  return {
    messageId,
    patientId: context?.patientId || 'unknown',
    patientName: context?.firstName || 'Patient',
    analysis: {
      intent: 'emergency',
      urgency: 'CRITICAL',
      sentiment: 'NEGATIVE',
      requiresHuman: true,
      riskFactors: ['emergency_keywords_detected', 'immediate_attention_required'],
    },
    responses: [{
      id: `${messageId}-emergency`,
      text: 'If this is a medical emergency, please call 911 immediately. Our team has been notified and will contact you right away.',
      confidence: 1.0,
      characterCount: 127,
    }],
    context,
    generatedAt: new Date(),
    processingTimeMs: Date.now() - startTime,
    tenant,
  };
}

// ============ Export Singleton ============

export const geminiMessagingService = {
  processIncomingMessage,
};
