/**
 * Emergency Detection Module
 * Detects emergency keywords and urgent medical concerns in patient messages
 *
 * HIPAA COMPLIANCE NOTE:
 * - No PHI stored in logs (only conversation IDs)
 * - Session-only storage (no server persistence)
 * - Production requires Google Cloud BAA + Vertex AI
 * - This mock implementation is for UI development only
 */

/**
 * Emergency keywords that trigger immediate alerts
 * Based on admin ai-engine.ts lines 150-154
 */
export const EMERGENCY_KEYWORDS = [
  // Life-threatening emergencies
  'emergency',
  'urgent',
  '911',
  'call ambulance',

  // Severe symptoms
  'severe pain',
  'cant breathe',
  "can't breathe",
  'cannot breathe',
  'difficulty breathing',
  'chest pain',
  'heart attack',

  // Allergic reactions
  'allergic reaction',
  'anaphylaxis',
  'throat closing',
  'swelling face',
  'swelling throat',

  // Bleeding & wounds
  'bleeding heavily',
  'excessive bleeding',
  'wont stop bleeding',
  "won't stop bleeding",

  // Neurological
  'vision loss',
  'numbness',
  'cant move',
  "can't move",
  'paralysis',
  'stroke',
  'seizure',

  // Infection signs
  'high fever',
  'infection',
  'pus',
  'spreading redness',

  // Consciousness
  'passed out',
  'fainted',
  'unconscious',
];

/**
 * Complication keywords that require high-priority attention
 * (Not emergency, but needs staff response within 30 min)
 */
export const COMPLICATION_KEYWORDS = [
  // Visual changes
  'bruising',
  'unusual bruising',
  'excessive bruising',

  // Swelling
  'swelling',
  'swollen',
  'lump',
  'bump',
  'hard spot',

  // Pain levels
  'increasing pain',
  'throbbing',
  'burning sensation',

  // Aesthetic concerns
  'asymmetry',
  'drooping',
  'migration',
  'uneven',

  // Skin issues
  'redness',
  'discoloration',
  'blistering',
  'rash',
  'itching',

  // Discharge
  'discharge',
  'oozing',
  'weeping',

  // Temperature
  'warm to touch',
  'hot',
  'fever',
  'chills',
];

/**
 * Positive keywords indicating satisfaction
 */
export const POSITIVE_KEYWORDS = [
  'love',
  'amazing',
  'perfect',
  'excellent',
  'wonderful',
  'fantastic',
  'great results',
  'so happy',
  'thank you',
  'best',
  'recommend',
  'beautiful',
  'natural looking',
];

export interface EmergencyDetectionResult {
  isEmergency: boolean;
  isComplication: boolean;
  isPositive: boolean;
  matchedKeywords: string[];
  severity: 'critical' | 'high' | 'medium' | 'low' | 'none';
  recommendedAction: string;
}

/**
 * Detect if a message contains emergency keywords
 */
export function detectEmergency(message: string): EmergencyDetectionResult {
  const lowerMessage = message.toLowerCase();
  const matchedEmergencyKeywords: string[] = [];
  const matchedComplicationKeywords: string[] = [];
  const matchedPositiveKeywords: string[] = [];

  // Check emergency keywords
  for (const keyword of EMERGENCY_KEYWORDS) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      matchedEmergencyKeywords.push(keyword);
    }
  }

  // Check complication keywords
  for (const keyword of COMPLICATION_KEYWORDS) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      matchedComplicationKeywords.push(keyword);
    }
  }

  // Check positive keywords
  for (const keyword of POSITIVE_KEYWORDS) {
    if (lowerMessage.includes(keyword.toLowerCase())) {
      matchedPositiveKeywords.push(keyword);
    }
  }

  const isEmergency = matchedEmergencyKeywords.length > 0;
  const isComplication = matchedComplicationKeywords.length > 0 && !isEmergency;
  const isPositive = matchedPositiveKeywords.length > 0 && !isEmergency && !isComplication;

  // Determine severity
  let severity: EmergencyDetectionResult['severity'] = 'none';
  if (isEmergency) {
    severity = 'critical';
  } else if (isComplication) {
    // Multiple complication keywords = higher severity
    severity = matchedComplicationKeywords.length >= 2 ? 'high' : 'medium';
  } else if (!isPositive) {
    severity = 'low';
  }

  // Recommended action
  let recommendedAction = 'Continue conversation normally';
  if (isEmergency) {
    recommendedAction = 'Escalate immediately - potential medical emergency';
  } else if (isComplication) {
    recommendedAction = 'Alert staff for follow-up within 30 minutes';
  } else if (isPositive) {
    recommendedAction = 'Acknowledge positive feedback';
  }

  return {
    isEmergency,
    isComplication,
    isPositive,
    matchedKeywords: [
      ...matchedEmergencyKeywords,
      ...matchedComplicationKeywords,
      ...matchedPositiveKeywords,
    ],
    severity,
    recommendedAction,
  };
}

/**
 * Get emergency response message
 */
export function getEmergencyResponse(): string {
  return `I've detected this might be a medical emergency. Your safety is our top priority.

**If you are experiencing a life-threatening emergency:**
- Call 911 immediately
- Go to your nearest emergency room

**If you need urgent medical attention:**
- Our medical team has been alerted
- Please call our emergency line: (555) 123-4567
- A staff member will contact you within minutes

Please stay calm and seek immediate medical attention if needed.`;
}

/**
 * Get complication response message
 */
export function getComplicationResponse(keywords: string[]): string {
  return `I understand you're experiencing some concerns (${keywords.slice(0, 2).join(', ')}). Your wellbeing is our priority.

I'm alerting our medical team to follow up with you. In the meantime:

- Take photos of the affected area if safe to do so
- Note any changes in symptoms
- Avoid touching or manipulating the treatment area

A staff member will contact you shortly. If symptoms worsen or you feel this is an emergency, please call 911 or go to your nearest ER.

Would you like me to connect you with our nurse line right now?`;
}
