/**
 * Conversations API Route
 * GET /api/conversations - List conversations with filters, sorting, and pagination
 * POST /api/conversations - Create new conversation with a patient
 *
 * Supports:
 * - Filter by status (open, snoozed, closed, all)
 * - Filter by message type (automated, manual, all)
 * - Filter by channel (sms, email, web_chat, phone)
 * - Filter by assigned staff member
 * - Search by patient name or content
 * - Sort by lastMessageTime, unreadCount, or starred
 * - Pagination with limit and offset
 */

import { NextRequest, NextResponse } from 'next/server';
import type {
  Conversation,
  Message,
  ConversationStatus,
  MessageType,
  MessageChannel,
} from '@/types/messaging';
import { patients, practitioners } from '@/lib/data';

// In-memory store for conversations
interface StoredConversation extends Conversation {
  createdAt: Date;
  updatedAt: Date;
}

// Type assertion to allow proper TypeScript usage
let conversations: (Conversation & { createdAt: Date; updatedAt: Date })[] = [];
let messageIdCounter = 1000;

// Mock conversation data initialization
function initializeMockConversations() {
  if (conversations.length > 0) return; // Already initialized

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
      status: 'open' as ConversationStatus,
      channel: 'sms' as MessageChannel,
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
      status: 'open' as ConversationStatus,
      channel: 'sms' as MessageChannel,
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
      status: 'closed' as ConversationStatus,
      channel: 'sms' as MessageChannel,
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
      status: 'snoozed' as ConversationStatus,
      channel: 'email' as MessageChannel,
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
}

// GET - List conversations with filters
export async function GET(request: NextRequest) {
  try {
    initializeMockConversations();

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const status = searchParams.get('status') || 'all';
    const messageType = searchParams.get('messageType') || 'all';
    const channel = searchParams.get('channel');
    const assignedTo = searchParams.get('assignedTo');
    const search = searchParams.get('search');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const starredOnly = searchParams.get('starredOnly') === 'true';
    const sortBy = searchParams.get('sortBy') || 'lastMessageTime';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    let result = [...conversations];

    // Filter by status
    if (status !== 'all') {
      result = result.filter(c => c.status === status);
    }

    // Filter by message type (check if any message in conversation matches type)
    if (messageType !== 'all') {
      result = result.filter(c =>
        c.messages.some(m => m.type === messageType)
      );
    }

    // Filter by channel
    if (channel) {
      result = result.filter(c => c.channel === channel);
    }

    // Filter by assigned staff member
    if (assignedTo) {
      result = result.filter(c => c.assignedTo?.id === assignedTo);
    }

    // Search by patient name or message content
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(c =>
        c.patient.name.toLowerCase().includes(searchLower) ||
        c.lastMessage.toLowerCase().includes(searchLower) ||
        c.messages.some(m => m.text.toLowerCase().includes(searchLower))
      );
    }

    // Filter unread only
    if (unreadOnly) {
      result = result.filter(c => c.unreadCount > 0);
    }

    // Filter starred only
    if (starredOnly) {
      result = result.filter(c => c.starred);
    }

    // Auto-close logic: Close conversations snoozed past their time
    const now = new Date();
    result.forEach(c => {
      if (c.status === 'snoozed' && c.snoozedUntil && new Date(c.snoozedUntil) <= now) {
        c.status = 'open';
        c.snoozedUntil = undefined;
        c.updatedAt = now;
      }
    });

    // Calculate total before pagination
    const total = result.length;

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'unreadCount':
          comparison = a.unreadCount - b.unreadCount;
          break;
        case 'starred':
          comparison = (a.starred ? 1 : 0) - (b.starred ? 1 : 0);
          break;
        case 'lastMessageTime':
        default:
          comparison = new Date(a.lastMessageTime).getTime() - new Date(b.lastMessageTime).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Pagination
    const start = (page - 1) * limit;
    result = result.slice(start, start + limit);

    // Clean response: Convert dates to ISO strings for JSON serialization
    const cleanResult = result.map(c => ({
      ...c,
      lastMessageTime: c.lastMessageTime.toISOString(),
      snoozedUntil: c.snoozedUntil?.toISOString(),
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      messages: c.messages.map(m => ({
        ...m,
        time: m.time.toISOString(),
      })),
      patient: {
        ...c.patient,
        patientSince: c.patient.patientSince.toISOString(),
        lastAppointment: c.patient.lastAppointment ? {
          ...c.patient.lastAppointment,
          date: c.patient.lastAppointment.date.toISOString(),
        } : undefined,
        nextAppointment: c.patient.nextAppointment ? {
          ...c.patient.nextAppointment,
          date: c.patient.nextAppointment.date.toISOString(),
        } : undefined,
      },
    }));

    return NextResponse.json({
      success: true,
      data: cleanResult,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: start + limit < total,
      },
    });
  } catch (error) {
    console.error('Conversations GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST - Create new conversation
export async function POST(request: NextRequest) {
  try {
    initializeMockConversations();

    const body = await request.json();
    const { patientId, channel = 'sms', message } = body;

    // Validate required fields
    if (!patientId) {
      return NextResponse.json(
        { success: false, error: 'patientId is required' },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'message is required' },
        { status: 400 }
      );
    }

    // Check if conversation already exists
    let conversation = conversations.find(c => c.patient.id === patientId);

    if (conversation) {
      // Add message to existing conversation
      const newMessage: Message = {
        id: messageIdCounter++,
        conversationId: conversation.id,
        sender: 'clinic',
        senderName: 'Staff Member',
        text: message,
        time: new Date(),
        status: 'sent',
        channel: channel as MessageChannel,
        type: 'manual',
      };

      conversation.messages.push(newMessage);
      conversation.lastMessage = message;
      conversation.lastMessageTime = new Date();
      conversation.status = 'open';
      conversation.updatedAt = new Date();

      return NextResponse.json({
        success: true,
        data: {
          ...conversation,
          lastMessageTime: conversation.lastMessageTime.toISOString(),
          createdAt: conversation.createdAt.toISOString(),
          updatedAt: conversation.updatedAt.toISOString(),
          messages: conversation.messages.map(m => ({
            ...m,
            time: m.time.toISOString(),
          })),
        },
        message: 'Message added to existing conversation',
      }, { status: 201 });
    }

    // Create new conversation
    const patient = patients.find(p => p.id === patientId);
    if (!patient) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    const newConversationId = Math.max(...conversations.map(c => c.id), 0) + 1;
    const now = new Date();

    const newMessage: Message = {
      id: messageIdCounter++,
      conversationId: newConversationId,
      sender: 'clinic',
      senderName: 'Staff Member',
      text: message,
      time: now,
      status: 'sent',
      channel: channel as MessageChannel,
      type: 'manual',
    };

    const newConversation: Conversation & { createdAt: Date; updatedAt: Date } = {
      id: newConversationId,
      patient: {
        id: patient.id,
        name: patient.fullName,
        initials: patient.firstName.charAt(0) + patient.lastName.charAt(0),
        phone: patient.phone || '',
        email: patient.email || '',
        smsOptIn: true,
        emailOptIn: true,
        marketingOptIn: false,
        preferredChannel: 'sms',
        patientSince: patient.createdAt || new Date(),
        lastAppointment: undefined,
        nextAppointment: undefined,
        upcomingAppointments: [],
        recentAppointments: [],
        tags: [],
        notes: [],
      },
      status: 'open',
      channel: channel as MessageChannel,
      lastMessage: message,
      lastMessageTime: now,
      unreadCount: 0,
      starred: false,
      tags: [],
      messages: [newMessage],
      createdAt: now,
      updatedAt: now,
    };

    conversations.push(newConversation);

    return NextResponse.json({
      success: true,
      data: {
        ...newConversation,
        lastMessageTime: newConversation.lastMessageTime.toISOString(),
        createdAt: newConversation.createdAt.toISOString(),
        updatedAt: newConversation.updatedAt.toISOString(),
        messages: newConversation.messages.map(m => ({
          ...m,
          time: m.time.toISOString(),
        })),
      },
      message: 'Conversation created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Conversations POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
