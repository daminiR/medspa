/**
 * AI Module Exports
 * Central export point for all AI-related functionality
 *
 * HIPAA COMPLIANCE NOTE:
 * - No PHI stored in logs (only conversation IDs)
 * - Session-only storage (no server persistence)
 * - Production requires Google Cloud BAA + Vertex AI
 * - This mock implementation is for UI development only
 */

// Patient Intents
export {
  PatientIntent,
  UrgencyLevel,
  PatientSentiment,
  INTENT_LABELS,
  INTENT_ACTIONS,
} from './patient-intents';

// Emergency Detection
export {
  EMERGENCY_KEYWORDS,
  COMPLICATION_KEYWORDS,
  POSITIVE_KEYWORDS,
  detectEmergency,
  getEmergencyResponse,
  getComplicationResponse,
  type EmergencyDetectionResult,
} from './emergency-detection';

// Gemini Client
export {
  MockGeminiClient,
  geminiClient,
  type ConversationContext,
  type AIResponse,
} from './gemini-client';
