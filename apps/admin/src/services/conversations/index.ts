/**
 * Conversations Service Exports
 * Central point for all conversation-related services
 */

export {
  AutoCloseConversationsService,
  autoCloseConversationsService,
} from './auto-close';

export type {
  AutoCloseConfig,
  ConversationForAutoClose,
  ConversureClosure,
} from './auto-close';
