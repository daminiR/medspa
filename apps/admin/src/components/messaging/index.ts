// Messaging Components - Professional Three-Column Inbox
// Export all messaging components for easy imports

// Existing components
export { default as AISuggestions } from './AISuggestions'
export { default as ConsentBanner } from './ConsentBanner'
export { default as SMSCharacterCounter } from './SMSCharacterCounter'
export { default as MessageStatus } from './MessageStatus'
export { default as OptOutDetector } from './OptOutDetector'

// New three-column inbox components
export { default as ConversationList } from './ConversationList'
export { default as MessageThread } from './MessageThread'
export { default as MessageComposer } from './MessageComposer'
export { default as PatientContextSidebar } from './PatientContextSidebar'
export { default as CommandPalette, useCommandPalette } from './CommandPalette'
export { default as SnoozeModal } from './SnoozeModal'

// Type exports
export type { Command } from './CommandPalette'

// Re-export utility functions
export {
  detectOptOutKeyword,
  detectInformalOptOut,
  detectAnyOptOut,
  extractOptOutIntent,
  extractOptOutDetails,
  containsOptOutLanguage,
  getOptOutKeywords,
  getInformalOptOutPatterns,
  getAllOptOutPatterns,
  isOptOutMessage,
} from '@/utils/optOutDetector'
export type { OptOutType } from '@/utils/optOutDetector'
