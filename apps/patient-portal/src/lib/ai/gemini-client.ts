/**
 * Mock Gemini AI Client for Patient Portal
 * Simulates Google Gemini 2.0 Flash API for patient support chatbot
 *
 * HIPAA COMPLIANCE NOTE:
 * - No PHI stored in logs (only conversation IDs)
 * - Session-only storage (no server persistence)
 * - Production requires Google Cloud BAA + Vertex AI
 * - This mock implementation is for UI development only
 */

import {
  PatientIntent,
  UrgencyLevel,
  PatientSentiment,
  INTENT_ACTIONS,
} from './patient-intents';
import {
  detectEmergency,
  getEmergencyResponse,
  getComplicationResponse,
} from './emergency-detection';

/**
 * Conversation context for message processing
 */
export interface ConversationContext {
  conversationId: string;
  timestamp: string;
  patientName?: string;
  previousMessages?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

/**
 * AI Response structure
 */
export interface AIResponse {
  intent: PatientIntent;
  response: string;
  urgency: UrgencyLevel;
  sentiment: PatientSentiment;
  suggestedActions: string[];
  escalate: boolean;
  confidence: number;
}

/**
 * Mock Gemini 2.0 Flash Client
 * Provides AI-powered responses for patient support
 */
export class MockGeminiClient {
  private readonly modelId = 'gemini-2.0-flash';

  /**
   * Generate AI response for patient message
   */
  async generateResponse(
    message: string,
    context: ConversationContext
  ): Promise<AIResponse> {
    // Simulate API latency (1-3 seconds)
    await this.simulateLatency();

    // Check for emergency keywords first
    const emergencyCheck = detectEmergency(message);

    if (emergencyCheck.isEmergency) {
      return this.handleEmergency(message, context);
    }

    if (emergencyCheck.isComplication) {
      return this.handleComplication(message, emergencyCheck.matchedKeywords);
    }

    // Detect intent from message
    const intent = this.detectIntent(message);
    const sentiment = this.detectSentiment(message, emergencyCheck);

    // Generate mock response based on intent
    return this.generateMockResponse(intent, message, sentiment, context);
  }

  /**
   * Handle emergency messages
   */
  private handleEmergency(
    message: string,
    context: ConversationContext
  ): AIResponse {
    return {
      intent: PatientIntent.EMERGENCY_MEDICAL,
      response: getEmergencyResponse(),
      urgency: UrgencyLevel.CRITICAL,
      sentiment: PatientSentiment.URGENT,
      suggestedActions: ['Call 911', 'Go to ER', 'Call Emergency Line'],
      escalate: true,
      confidence: 1.0,
    };
  }

  /**
   * Handle complication reports
   */
  private handleComplication(
    message: string,
    matchedKeywords: string[]
  ): AIResponse {
    return {
      intent: PatientIntent.SIDE_EFFECT_REPORT,
      response: getComplicationResponse(matchedKeywords),
      urgency: UrgencyLevel.HIGH,
      sentiment: PatientSentiment.CONCERNED,
      suggestedActions: ['Speak to Nurse', 'Call Office Now', 'View Aftercare'],
      escalate: true,
      confidence: 0.9,
    };
  }

  /**
   * Detect intent from message content
   */
  private detectIntent(message: string): PatientIntent {
    const lower = message.toLowerCase();

    // Appointment booking
    if (
      lower.includes('book') ||
      lower.includes('schedule') ||
      lower.includes('make an appointment') ||
      lower.includes('want to come in')
    ) {
      return PatientIntent.APPOINTMENT_BOOKING;
    }

    // Appointment inquiry
    if (
      lower.includes('my appointment') ||
      lower.includes('when is') ||
      lower.includes('what time')
    ) {
      return PatientIntent.APPOINTMENT_INQUIRY;
    }

    // Cancellation
    if (lower.includes('cancel')) {
      return PatientIntent.APPOINTMENT_CANCELLATION;
    }

    // Rescheduling
    if (lower.includes('reschedule') || lower.includes('change my appointment')) {
      return PatientIntent.APPOINTMENT_RESCHEDULING;
    }

    // Pricing
    if (
      lower.includes('price') ||
      lower.includes('cost') ||
      lower.includes('how much') ||
      lower.includes('pricing')
    ) {
      return PatientIntent.PRICING_INQUIRY;
    }

    // Location & Hours
    if (
      lower.includes('location') ||
      lower.includes('address') ||
      lower.includes('where are') ||
      lower.includes('hours') ||
      lower.includes('open') ||
      lower.includes('directions')
    ) {
      return PatientIntent.LOCATION_HOURS;
    }

    // Treatment questions
    if (
      lower.includes('botox') ||
      lower.includes('filler') ||
      lower.includes('treatment') ||
      lower.includes('procedure') ||
      lower.includes('what is') ||
      lower.includes('tell me about')
    ) {
      return PatientIntent.TREATMENT_QUESTION;
    }

    // Post-treatment follow-up
    if (
      lower.includes('after my') ||
      lower.includes('recovery') ||
      lower.includes('healing') ||
      lower.includes('how long until')
    ) {
      return PatientIntent.POST_TREATMENT_FOLLOWUP;
    }

    // Pre-treatment questions
    if (
      lower.includes('before my') ||
      lower.includes('prepare') ||
      lower.includes('what should i') ||
      lower.includes('avoid')
    ) {
      return PatientIntent.PRE_TREATMENT_QUESTION;
    }

    // Feedback
    if (
      lower.includes('feedback') ||
      lower.includes('review') ||
      lower.includes('experience')
    ) {
      return PatientIntent.FEEDBACK;
    }

    return PatientIntent.GENERAL_INQUIRY;
  }

  /**
   * Detect sentiment from message
   */
  private detectSentiment(
    message: string,
    emergencyCheck: ReturnType<typeof detectEmergency>
  ): PatientSentiment {
    if (emergencyCheck.isPositive) {
      return PatientSentiment.POSITIVE;
    }

    const lower = message.toLowerCase();

    if (
      lower.includes('frustrated') ||
      lower.includes('annoyed') ||
      lower.includes('disappointed') ||
      lower.includes('upset')
    ) {
      return PatientSentiment.FRUSTRATED;
    }

    if (
      lower.includes('worried') ||
      lower.includes('concerned') ||
      lower.includes('nervous') ||
      lower.includes('anxious')
    ) {
      return PatientSentiment.CONCERNED;
    }

    return PatientSentiment.NEUTRAL;
  }

  /**
   * Generate mock response based on intent
   */
  private generateMockResponse(
    intent: PatientIntent,
    message: string,
    sentiment: PatientSentiment,
    context: ConversationContext
  ): AIResponse {
    const responses: Record<PatientIntent, { response: string; urgency: UrgencyLevel }> = {
      [PatientIntent.APPOINTMENT_BOOKING]: {
        response: `I'd be happy to help you book an appointment! We have several treatment options available.

What type of treatment are you interested in? Our most popular services include:
- Botox & Dysport
- Dermal Fillers
- Chemical Peels
- Microneedling
- HydraFacials

Once you let me know your preference, I can check our availability and find a time that works for you.`,
        urgency: UrgencyLevel.NONE,
      },

      [PatientIntent.APPOINTMENT_INQUIRY]: {
        response: `I can help you with information about your appointments!

To view your upcoming appointments, please check the "My Appointments" section in your patient portal dashboard.

Is there something specific you'd like to know about an upcoming appointment? I can help with:
- Confirming appointment times
- Pre-appointment instructions
- What to expect during your visit`,
        urgency: UrgencyLevel.NONE,
      },

      [PatientIntent.APPOINTMENT_CANCELLATION]: {
        response: `I understand you need to cancel an appointment. We're sorry to see you go!

To cancel your appointment, you can:
1. Go to "My Appointments" in your portal
2. Select the appointment you wish to cancel
3. Click "Cancel Appointment"

Please note: Cancellations made less than 24 hours before your appointment may be subject to a cancellation fee.

Would you prefer to reschedule instead? We'd love to find another time that works for you.`,
        urgency: UrgencyLevel.LOW,
      },

      [PatientIntent.APPOINTMENT_RESCHEDULING]: {
        response: `No problem! I can help you reschedule your appointment.

To reschedule:
1. Go to "My Appointments" in your portal
2. Select the appointment you wish to change
3. Click "Reschedule" to view available times

When would work better for you? I can help you find availability that fits your schedule.`,
        urgency: UrgencyLevel.LOW,
      },

      [PatientIntent.TREATMENT_QUESTION]: {
        response: `Great question! I'm happy to provide information about our treatments.

We offer a wide range of services including:

**Injectables:**
- Botox/Dysport for wrinkles and fine lines
- Dermal fillers for volume and contouring

**Skin Rejuvenation:**
- Chemical peels
- Microneedling
- HydraFacials
- IPL/Laser treatments

**Body Contouring:**
- CoolSculpting
- EmSculpt

Would you like more details about a specific treatment? Or would you prefer to schedule a consultation with one of our providers?`,
        urgency: UrgencyLevel.NONE,
      },

      [PatientIntent.POST_TREATMENT_FOLLOWUP]: {
        response: `Thank you for following up after your treatment! Your recovery is important to us.

Here are some general aftercare tips:
- Keep the treated area clean and dry
- Avoid strenuous exercise for 24-48 hours
- Stay hydrated
- Avoid direct sun exposure

You can also view detailed aftercare instructions in the "Aftercare" section of your portal.

How are you feeling? Is there anything specific about your recovery you'd like to discuss?`,
        urgency: UrgencyLevel.LOW,
      },

      [PatientIntent.SIDE_EFFECT_REPORT]: {
        response: `I want to make sure you're taken care of. Side effects can sometimes occur, and we're here to help.

Please describe what you're experiencing in detail, and I'll make sure our medical team is notified right away.

If you're experiencing any of the following, please call us immediately:
- Severe pain
- Difficulty breathing
- Vision changes
- Signs of infection

Our nurse line is available at (555) 123-4567.`,
        urgency: UrgencyLevel.HIGH,
      },

      [PatientIntent.PRE_TREATMENT_QUESTION]: {
        response: `Great thinking to prepare for your appointment! Proper preparation can help ensure the best results.

General pre-treatment guidelines:
- Avoid blood thinners and alcohol 48 hours before
- Come with clean skin (no makeup on treatment area)
- Eat a light meal before your appointment
- Bring a list of any medications you're taking

You can view specific pre-treatment instructions for your appointment in your portal under "My Appointments."

Is there anything specific about your upcoming treatment you'd like to know?`,
        urgency: UrgencyLevel.NONE,
      },

      [PatientIntent.PRICING_INQUIRY]: {
        response: `I can help with pricing information!

Our treatment prices vary based on the specific service and treatment area. Here are some general ranges:

**Injectables:**
- Botox: Starting at $12/unit
- Dermal Fillers: Starting at $650/syringe

**Facials & Skin Treatments:**
- HydraFacial: Starting at $175
- Chemical Peels: Starting at $150
- Microneedling: Starting at $300

We also offer package deals and membership options for additional savings!

Would you like to schedule a consultation to discuss pricing for your specific needs?`,
        urgency: UrgencyLevel.NONE,
      },

      [PatientIntent.LOCATION_HOURS]: {
        response: `Here's our location and hours information:

**Address:**
Luxe Medical Spa
123 Beauty Boulevard, Suite 100
Beverly Hills, CA 90210

**Hours:**
Monday - Friday: 9:00 AM - 7:00 PM
Saturday: 9:00 AM - 5:00 PM
Sunday: Closed

**Contact:**
Phone: (555) 123-4567
Email: info@luxemedicalspa.com

Would you like directions or help scheduling an appointment?`,
        urgency: UrgencyLevel.NONE,
      },

      [PatientIntent.GENERAL_INQUIRY]: {
        response: `Thank you for reaching out! I'm here to help with any questions you have.

I can assist you with:
- Booking or managing appointments
- Treatment information and pricing
- Pre and post-treatment care
- Location and hours
- Account questions

How can I help you today?`,
        urgency: UrgencyLevel.NONE,
      },

      [PatientIntent.FEEDBACK]: {
        response: `Thank you for wanting to share your feedback! We truly value hearing from our patients.

You can:
1. Submit feedback through your patient portal
2. Leave a review on Google or Yelp
3. Speak directly with our management team

Your input helps us continue to improve our services.

Would you like me to connect you with someone from our team directly?`,
        urgency: UrgencyLevel.NONE,
      },

      [PatientIntent.EMERGENCY_MEDICAL]: {
        response: getEmergencyResponse(),
        urgency: UrgencyLevel.CRITICAL,
      },

      [PatientIntent.URGENT_CONCERN]: {
        response: `I understand you have an urgent concern. Your wellbeing is our top priority.

I'm flagging this for immediate attention from our team. In the meantime:

**For urgent medical concerns:** Call our nurse line at (555) 123-4567
**For emergencies:** Call 911 or go to your nearest ER

Can you tell me more about what's happening so I can better assist you?`,
        urgency: UrgencyLevel.HIGH,
      },
    };

    const responseData = responses[intent] || responses[PatientIntent.GENERAL_INQUIRY];

    // Adjust response for sentiment
    let finalResponse = responseData.response;
    if (sentiment === PatientSentiment.FRUSTRATED && context.patientName) {
      finalResponse = `${context.patientName}, I apologize for any inconvenience you've experienced. ` + finalResponse;
    } else if (sentiment === PatientSentiment.CONCERNED) {
      finalResponse = `I understand your concerns and want to make sure you feel supported. ` + finalResponse;
    }

    return {
      intent,
      response: finalResponse,
      urgency: responseData.urgency,
      sentiment,
      suggestedActions: INTENT_ACTIONS[intent] || ['Speak to Staff', 'View FAQ'],
      escalate: responseData.urgency >= UrgencyLevel.HIGH,
      confidence: 0.85 + Math.random() * 0.1, // 0.85-0.95 confidence
    };
  }

  /**
   * Simulate network latency
   */
  private async simulateLatency(): Promise<void> {
    const delay = 1000 + Math.random() * 2000; // 1-3 seconds
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Get model information
   */
  getModelInfo(): { modelId: string; provider: string; version: string } {
    return {
      modelId: this.modelId,
      provider: 'Google AI (Mock)',
      version: '2.0-flash',
    };
  }
}

// Export singleton instance
export const geminiClient = new MockGeminiClient();
