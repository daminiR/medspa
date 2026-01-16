/**
 * Message Types
 */

export type MessageSender = 'patient' | 'provider' | 'staff' | 'ai' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: MessageSender;
  senderName: string;

  // Content
  text: string;
  attachments?: MessageAttachment[];

  // Status
  status: MessageStatus;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;

  // AI
  isAiGenerated?: boolean;
  aiConfidence?: number;

  createdAt: string;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'document' | 'link';
  url: string;
  name?: string;
  mimeType?: string;
  size?: number;
}

export interface Conversation {
  id: string;
  patientId: string;

  // Participants
  participants: ConversationParticipant[];

  // Last message preview
  lastMessage?: Message;
  lastMessageAt?: string;

  // Unread count for patient
  unreadCount: number;

  // Type
  type: 'provider' | 'staff' | 'ai';

  // Status
  status: 'active' | 'archived';

  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  id: string;
  type: MessageSender;
  name: string;
  avatarUrl?: string;
  role?: string;
}

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AiSuggestion {
  id: string;
  text: string;
  confidence: number;
  category: 'booking' | 'faq' | 'followup' | 'general';
}

export interface SendMessageRequest {
  conversationId: string;
  text: string;
  attachments?: File[];
}
