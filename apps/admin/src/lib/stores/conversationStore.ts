/**
 * Shared Conversation Store
 * In-memory store for conversations and messages
 * Used by all conversation API routes
 *
 * In production, this would be replaced with a database
 */

import type { Conversation, Message, MessageDeliveryStatus, MessageType, MessageChannel } from '@/types/messaging';

export interface StoredConversation extends Conversation {
  createdAt: Date;
  updatedAt: Date;
}

// In-memory store
let conversations: StoredConversation[] = [];
let messageIdCounter = 1000;
let conversationIdCounter = 100;
let initialized = false;

/**
 * Initialize mock data
 */
function initializeMockData() {
  if (initialized) return;

  const now = new Date();

  conversations = [
    {
      id: 1,
      patient: {
        id: 'patient-1',
        name: 'Sarah Johnson',
        initials: 'SJ',
        phone: '555-0101',
        email: 'sarah.johnson@email.com',
        smsOptIn: true,
        emailOptIn: true,
        marketingOptIn: false,
        preferredChannel: 'sms',
        patientSince: new Date('2023-01-15'),
        lastAppointment: {
          id: 'apt-1',
          date: new Date('2024-01-10'),
          time: '2:00 PM',
          service: 'Botox Treatment',
          provider: 'Dr. Lisa Chen',
          status: 'completed',
        },
        nextAppointment: {
          id: 'apt-2',
          date: new Date('2024-02-10'),
          time: '3:00 PM',
          service: 'Filler Injection',
          provider: 'Dr. Lisa Chen',
          status: 'scheduled',
        },
        upcomingAppointments: [],
        recentAppointments: [],
        tags: ['vip', 'regular'],
        notes: [],
      },
      status: 'open',
      channel: 'sms',
      lastMessage: 'Thanks! See you then.',
      lastMessageTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      unreadCount: 0,
      starred: true,
      assignedTo: {
        id: 'staff-1',
        name: 'Jessica Martinez',
        role: 'Patient Coordinator',
        status: 'available',
      },
      tags: ['follow-up-needed'],
      messages: [
        {
          id: 1001,
          conversationId: 1,
          sender: 'clinic',
          senderName: 'Jessica Martinez',
          text: 'Hi Sarah! Your appointment is confirmed for Feb 10th at 3 PM.',
          time: new Date(now.getTime() - 4 * 60 * 60 * 1000),
          status: 'delivered',
          channel: 'sms',
          type: 'manual',
        },
        {
          id: 1002,
          conversationId: 1,
          sender: 'patient',
          text: 'Thanks! See you then.',
          time: new Date(now.getTime() - 2 * 60 * 60 * 1000),
          status: 'delivered',
          channel: 'sms',
          type: 'manual',
        },
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
      id: 2,
      patient: {
        id: 'patient-2',
        name: 'Michael Chen',
        initials: 'MC',
        phone: '555-0102',
        email: 'michael.chen@email.com',
        smsOptIn: true,
        emailOptIn: true,
        marketingOptIn: true,
        preferredChannel: 'sms',
        patientSince: new Date('2023-06-20'),
        lastAppointment: {
          id: 'apt-3',
          date: new Date('2024-01-05'),
          time: '10:00 AM',
          service: 'Microneedling',
          provider: 'Dr. James Wilson',
          status: 'completed',
        },
        nextAppointment: {
          id: 'apt-4',
          date: new Date('2024-02-15'),
          time: '11:00 AM',
          service: 'Laser Hair Removal',
          provider: 'Dr. James Wilson',
          status: 'scheduled',
        },
        upcomingAppointments: [],
        recentAppointments: [],
        tags: ['regular'],
        notes: [],
      },
      status: 'open',
      channel: 'sms',
      lastMessage: 'Do you have any afternoon slots available?',
      lastMessageTime: new Date(now.getTime() - 30 * 60 * 1000),
      unreadCount: 2,
      starred: false,
      assignedTo: {
        id: 'staff-2',
        name: 'David Kumar',
        role: 'Customer Service',
        status: 'available',
      },
      tags: [],
      messages: [
        {
          id: 1003,
          conversationId: 2,
          sender: 'clinic',
          senderName: 'David Kumar',
          text: 'Hi Michael! We have several time slots available for your laser hair removal appointment.',
          time: new Date(now.getTime() - 45 * 60 * 1000),
          status: 'delivered',
          channel: 'sms',
          type: 'manual',
        },
        {
          id: 1004,
          conversationId: 2,
          sender: 'patient',
          text: 'Do you have any afternoon slots available?',
          time: new Date(now.getTime() - 30 * 60 * 1000),
          status: 'delivered',
          channel: 'sms',
          type: 'manual',
        },
      ],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
    },
    {
      id: 3,
      patient: {
        id: 'patient-3',
        name: 'Emma Rodriguez',
        initials: 'ER',
        phone: '555-0103',
        email: 'emma.r@email.com',
        smsOptIn: true,
        emailOptIn: false,
        marketingOptIn: false,
        preferredChannel: 'sms',
        patientSince: new Date('2023-11-10'),
        lastAppointment: {
          id: 'apt-5',
          date: new Date('2024-01-15'),
          time: '1:00 PM',
          service: 'Chemical Peel',
          provider: 'Dr. Lisa Chen',
          status: 'completed',
        },
        nextAppointment: undefined,
        upcomingAppointments: [],
        recentAppointments: [],
        tags: ['new-patient'],
        notes: [],
      },
      status: 'closed',
      channel: 'sms',
      lastMessage: 'Thank you for the reminder!',
      lastMessageTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      unreadCount: 0,
      starred: false,
      tags: [],
      messages: [
        {
          id: 1005,
          conversationId: 3,
          sender: 'clinic',
          senderName: 'Automated System',
          text: 'This is a reminder: Your Chemical Peel appointment is tomorrow at 1 PM. Please avoid sun exposure for 48 hours after treatment.',
          time: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          status: 'delivered',
          channel: 'sms',
          type: 'automated',
        },
        {
          id: 1006,
          conversationId: 3,
          sender: 'patient',
          text: 'Thank you for the reminder!',
          time: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          status: 'delivered',
          channel: 'sms',
          type: 'manual',
        },
      ],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
    },
    {
      id: 4,
      patient: {
        id: 'patient-4',
        name: 'Jennifer Lee',
        initials: 'JL',
        phone: '555-0104',
        email: 'jen.lee@email.com',
        smsOptIn: true,
        emailOptIn: true,
        marketingOptIn: true,
        preferredChannel: 'email',
        patientSince: new Date('2022-05-12'),
        lastAppointment: {
          id: 'apt-6',
          date: new Date('2024-01-12'),
          time: '4:00 PM',
          service: 'Hydration Facial',
          provider: 'Dr. Maria Garcia',
          status: 'completed',
        },
        nextAppointment: {
          id: 'apt-7',
          date: new Date('2024-02-20'),
          time: '10:00 AM',
          service: 'Anti-Aging Treatment',
          provider: 'Dr. Maria Garcia',
          status: 'scheduled',
        },
        upcomingAppointments: [],
        recentAppointments: [],
        tags: ['vip', 'referral-source'],
        notes: [],
      },
      status: 'snoozed',
      channel: 'email',
      lastMessage: 'I have a question about aftercare instructions.',
      lastMessageTime: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      unreadCount: 1,
      starred: false,
      snoozedUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      tags: ['pending-response'],
      messages: [
        {
          id: 1007,
          conversationId: 4,
          sender: 'patient',
          text: 'I have a question about aftercare instructions.',
          time: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          status: 'delivered',
          channel: 'email',
          type: 'manual',
        },
      ],
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
  ];

  messageIdCounter = 1008;
  conversationIdCounter = 5;
  initialized = true;
}

/**
 * Get all conversations
 */
export function getAllConversations(): StoredConversation[] {
  initializeMockData();
  return conversations;
}

/**
 * Get conversation by ID
 */
export function getConversationById(id: number): StoredConversation | undefined {
  initializeMockData();
  return conversations.find(c => c.id === id);
}

/**
 * Get conversation by patient ID
 */
export function getConversationByPatientId(patientId: string): StoredConversation | undefined {
  initializeMockData();
  return conversations.find(c => c.patient.id === patientId);
}

/**
 * Update conversation
 */
export function updateConversation(
  id: number,
  updates: Partial<StoredConversation>
): StoredConversation | undefined {
  initializeMockData();
  const index = conversations.findIndex(c => c.id === id);
  if (index === -1) return undefined;

  conversations[index] = {
    ...conversations[index],
    ...updates,
    updatedAt: new Date(),
  };
  return conversations[index];
}

/**
 * Add message to conversation
 */
export function addMessageToConversation(
  conversationId: number,
  message: Message
): boolean {
  initializeMockData();
  const conversation = conversations.find(c => c.id === conversationId);
  if (!conversation) return false;

  conversation.messages.push(message);
  conversation.lastMessage = message.text;
  conversation.lastMessageTime = message.time;
  conversation.updatedAt = new Date();

  return true;
}

/**
 * Create new conversation
 */
export function createConversation(
  conversationData: Omit<StoredConversation, 'id' | 'createdAt' | 'updatedAt'>
): StoredConversation {
  initializeMockData();
  const id = conversationIdCounter++;
  const now = new Date();

  const conversation: StoredConversation = {
    ...conversationData,
    id,
    createdAt: now,
    updatedAt: now,
  };

  conversations.push(conversation);
  return conversation;
}

/**
 * Generate new message ID
 */
export function generateMessageId(): number {
  initializeMockData();
  return messageIdCounter++;
}

/**
 * Get next conversation ID
 */
export function getNextConversationId(): number {
  initializeMockData();
  return conversationIdCounter++;
}

/**
 * Clear all data (for testing)
 */
export function clearAll(): void {
  conversations = [];
  messageIdCounter = 1000;
  conversationIdCounter = 100;
  initialized = false;
}

/**
 * Reinitialize data (for testing)
 */
export function reinitialize(): void {
  clearAll();
  initializeMockData();
}
