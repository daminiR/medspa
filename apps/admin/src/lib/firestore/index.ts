/**
 * Firestore Module Index
 *
 * Exports Firestore utilities for the application.
 */

export {
  storeAIResponse,
  getLatestAIResponse,
  getAIResponseByMessageId,
  updateAIResponseOutcome,
  cleanupExpiredResponses,
  subscribeToAIResponses,
  subscribeToLatestAIResponse,
  getAIResponseStats,
  incrementAnalyticsCounter,
  type StoredAIResponse,
  type AIResponseUpdate,
  type TenantPath,
  type AIResponseStats,
} from './ai-responses';
