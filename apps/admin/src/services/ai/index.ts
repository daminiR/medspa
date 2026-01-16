/**
 * AI Services Index
 *
 * Exports all AI-related services for the proactive messaging system.
 */

// Main messaging service
export {
  processIncomingMessage,
  geminiMessagingService,
  type IntentCategory,
  type UrgencyLevel,
  type Sentiment,
  type MessageAnalysis,
  type GeneratedResponse,
  type AIProcessingResult,
  type TenantContext,
} from './gemini-messaging-service';

// Context builder
export {
  buildPatientContext,
  formatContextForPrompt,
  createUnknownPatientContext,
  type PatientContext,
  type RecentTreatment,
  type UpcomingAppointment,
  type ConversationMessage,
} from './context-builder';

// System instructions
export {
  MEDSPA_SYSTEM_INSTRUCTION,
  ANALYSIS_SYSTEM_INSTRUCTION,
  RESPONSE_GENERATION_INSTRUCTION,
  getCurrentDateTimeContext,
} from './system-instructions';

// Hit rate tracking
export {
  trackUsed,
  trackEdited,
  trackIgnored,
  hitTracker,
  getHitRateStats,
  getRecentHits,
  type HitAction,
  type HitRecord,
  type HitRateStats,
} from './hit-tracker';
