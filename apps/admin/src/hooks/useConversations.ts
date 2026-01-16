import { useState, useMemo, useCallback, useEffect } from 'react'
import { subHours, subDays, subWeeks, differenceInDays, differenceInHours } from 'date-fns'

// Simplified types for the hook (compatible with full messaging types)
export type ConversationStatus = 'open' | 'snoozed' | 'closed'
export type MessageSender = 'clinic' | 'patient'
export type MessageChannel = 'sms' | 'email'
export type MessageStatus = 'queued' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
export type MessageType = 'manual' | 'automated' | 'system' | 'campaign'

export interface ConversationPatient {
  id: string
  name: string
  initials: string
  phone: string
  email: string
  lastAppointment?: string
  nextAppointment?: string
  smsOptIn: boolean
  preferredChannel: MessageChannel
}

export interface Message {
  id: number
  sender: MessageSender
  text: string
  time: Date
  status: MessageStatus
  channel: MessageChannel
  type: MessageType
}

export interface Conversation {
  id: number
  patient: ConversationPatient
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  starred: boolean
  status: ConversationStatus
  snoozedUntil?: Date
  messages: Message[]
}

export interface ConversationFilters {
  status?: ConversationStatus | 'all' | 'conversations' | 'automated' | 'unread'
  search?: string
  channel?: MessageChannel
  starred?: boolean
  hasUnread?: boolean
}

export interface ConversationCounts {
  open: number
  snoozed: number
  closed: number
  all: number
  unread: number
}

export interface AutoCloseSettings {
  days: number | 'never'
}

// Helper to get auto-close settings from localStorage
const getAutoCloseSettings = (): AutoCloseSettings => {
  if (typeof window === 'undefined') return { days: 7 }
  const stored = localStorage.getItem('autoCloseInactivity')
  if (stored === 'never') return { days: 'never' }
  return { days: stored ? parseInt(stored) : 7 }
}

// Helper to check if conversation is about to auto-close (within 24 hours)
export const isAboutToAutoClose = (conversation: Conversation, settings: AutoCloseSettings): boolean => {
  if (settings.days === 'never' || conversation.status !== 'open') return false

  const daysSinceLastMessage = differenceInDays(new Date(), conversation.lastMessageTime)
  const hoursSinceLastMessage = differenceInHours(new Date(), conversation.lastMessageTime)

  // If within 24 hours of auto-closing
  const daysUntilClose = settings.days - daysSinceLastMessage
  return daysUntilClose === 0 && hoursSinceLastMessage >= ((settings.days * 24) - 24)
}

// Helper to check if conversation should be auto-closed
export const shouldAutoClose = (conversation: Conversation, settings: AutoCloseSettings): boolean => {
  if (settings.days === 'never' || conversation.status !== 'open') return false

  const daysSinceLastMessage = differenceInDays(new Date(), conversation.lastMessageTime)
  return daysSinceLastMessage >= settings.days
}

/**
 * Generate realistic mock conversations for a medical spa
 */
const generateMockConversations = (): Conversation[] => {
  return [
    // Open - Urgent appointment tomorrow
    {
      id: 1,
      patient: {
        id: 'p1',
        name: 'Sarah Johnson',
        initials: 'SJ',
        phone: '+17652500332',
        email: 'sarah.j@email.com',
        lastAppointment: 'Botox - 2 weeks ago',
        nextAppointment: 'Filler - Tomorrow 2:00 PM',
        smsOptIn: true,
        preferredChannel: 'sms'
      },
      lastMessage: 'Can I arrive 15 minutes early to fill out the consent form?',
      lastMessageTime: subHours(new Date(), 1),
      unreadCount: 1,
      starred: true,
      status: 'open',
      messages: [
        {
          id: 1,
          sender: 'clinic',
          text: 'Hi Sarah! Your filler appointment is confirmed for tomorrow at 2:00 PM with Dr. Martinez.',
          time: subDays(new Date(), 1),
          status: 'delivered',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 2,
          sender: 'patient',
          text: 'Perfect! Will you be using Juvederm or Restylane?',
          time: subHours(new Date(), 5),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 3,
          sender: 'clinic',
          text: 'We\'ll be using Juvederm Voluma for the cheek enhancement. Please arrive with a clean face and avoid blood thinners for 24 hours.',
          time: subHours(new Date(), 4),
          status: 'delivered',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 4,
          sender: 'patient',
          text: 'Can I arrive 15 minutes early to fill out the consent form?',
          time: subHours(new Date(), 1),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        }
      ]
    },

    // Open - Post-treatment follow-up
    {
      id: 2,
      patient: {
        id: 'p2',
        name: 'Emily Rodriguez',
        initials: 'ER',
        phone: '+14155551234',
        email: 'emily.r@email.com',
        lastAppointment: 'Chemical Peel - Yesterday',
        nextAppointment: 'Follow-up - 2 weeks',
        smsOptIn: true,
        preferredChannel: 'sms'
      },
      lastMessage: 'Is it normal for my skin to feel tight and a bit red today?',
      lastMessageTime: subHours(new Date(), 3),
      unreadCount: 2,
      starred: false,
      status: 'open',
      messages: [
        {
          id: 1,
          sender: 'clinic',
          text: 'Hi Emily! Remember to keep your skin moisturized and use SPF 30+ daily. Avoid exfoliants for 1 week.',
          time: subHours(new Date(), 18),
          status: 'delivered',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 2,
          sender: 'patient',
          text: 'Hi! I had my chemical peel yesterday',
          time: subHours(new Date(), 4),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 3,
          sender: 'patient',
          text: 'Is it normal for my skin to feel tight and a bit red today?',
          time: subHours(new Date(), 3),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        }
      ]
    },

    // Open - New consultation inquiry
    {
      id: 3,
      patient: {
        id: 'p3',
        name: 'Michael Chen',
        initials: 'MC',
        phone: '+14155559876',
        email: 'mchen@email.com',
        smsOptIn: true,
        preferredChannel: 'sms'
      },
      lastMessage: 'I\'m interested in laser hair removal. Do you offer free consultations?',
      lastMessageTime: subHours(new Date(), 2),
      unreadCount: 1,
      starred: false,
      status: 'open',
      messages: [
        {
          id: 1,
          sender: 'patient',
          text: 'Hi, I found your spa online and I\'m interested in your services',
          time: subHours(new Date(), 2.5),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 2,
          sender: 'patient',
          text: 'I\'m interested in laser hair removal. Do you offer free consultations?',
          time: subHours(new Date(), 2),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        }
      ]
    },

    // Open - Reschedule request
    {
      id: 4,
      patient: {
        id: 'p4',
        name: 'Jessica Martinez',
        initials: 'JM',
        phone: '+14155552345',
        email: 'jessica.m@email.com',
        lastAppointment: 'Botox - 3 months ago',
        nextAppointment: 'Botox - Monday 10:00 AM',
        smsOptIn: true,
        preferredChannel: 'sms'
      },
      lastMessage: 'I need to reschedule Monday. Any Tuesday afternoon slots?',
      lastMessageTime: subHours(new Date(), 6),
      unreadCount: 1,
      starred: false,
      status: 'open',
      messages: [
        {
          id: 1,
          sender: 'clinic',
          text: 'Reminder: Botox appointment Monday at 10:00 AM. Reply CONFIRM or call to reschedule.',
          time: subDays(new Date(), 2),
          status: 'delivered',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 2,
          sender: 'patient',
          text: 'I need to reschedule Monday. Any Tuesday afternoon slots?',
          time: subHours(new Date(), 6),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        }
      ]
    },

    // Open - Product question
    {
      id: 5,
      patient: {
        id: 'p5',
        name: 'Amanda Williams',
        initials: 'AW',
        phone: '+14155553456',
        email: 'amanda.w@email.com',
        lastAppointment: 'Consultation - 1 week ago',
        nextAppointment: 'Microneedling - Friday 3:00 PM',
        smsOptIn: true,
        preferredChannel: 'sms'
      },
      lastMessage: 'Do you sell the SkinCeuticals serum you recommended?',
      lastMessageTime: subHours(new Date(), 8),
      unreadCount: 1,
      starred: false,
      status: 'open',
      messages: [
        {
          id: 1,
          sender: 'patient',
          text: 'Quick question about the products you recommended',
          time: subHours(new Date(), 8.5),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 2,
          sender: 'patient',
          text: 'Do you sell the SkinCeuticals serum you recommended?',
          time: subHours(new Date(), 8),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        }
      ]
    },

    // Snoozed - Waiting for response
    {
      id: 6,
      patient: {
        id: 'p6',
        name: 'David Thompson',
        initials: 'DT',
        phone: '+14155554567',
        email: 'david.t@email.com',
        lastAppointment: 'Consultation - 2 weeks ago',
        smsOptIn: true,
        preferredChannel: 'sms'
      },
      lastMessage: 'Let me check my schedule and I\'ll get back to you.',
      lastMessageTime: subDays(new Date(), 3),
      unreadCount: 0,
      starred: false,
      status: 'snoozed',
      snoozedUntil: subDays(new Date(), -2),
      messages: [
        {
          id: 1,
          sender: 'clinic',
          text: 'Hi David! We have openings this week for your first laser treatment. Would you like to schedule?',
          time: subDays(new Date(), 4),
          status: 'delivered',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 2,
          sender: 'patient',
          text: 'Let me check my schedule and I\'ll get back to you.',
          time: subDays(new Date(), 3),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        }
      ]
    },

    // Closed - Confirmed
    {
      id: 7,
      patient: {
        id: 'p7',
        name: 'Rachel Kim',
        initials: 'RK',
        phone: '+14155555678',
        email: 'rachel.k@email.com',
        lastAppointment: 'Hydrafacial - 1 week ago',
        nextAppointment: 'Hydrafacial - Next month',
        smsOptIn: true,
        preferredChannel: 'sms'
      },
      lastMessage: 'Perfect! See you then.',
      lastMessageTime: subDays(new Date(), 5),
      unreadCount: 0,
      starred: false,
      status: 'closed',
      messages: [
        {
          id: 1,
          sender: 'clinic',
          text: 'Hydrafacial scheduled for March 15th at 2:00 PM. See you soon!',
          time: subDays(new Date(), 5.5),
          status: 'delivered',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 2,
          sender: 'patient',
          text: 'Perfect! See you then.',
          time: subDays(new Date(), 5),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        }
      ]
    },

    // Open - Pricing inquiry
    {
      id: 8,
      patient: {
        id: 'p8',
        name: 'Lauren Davis',
        initials: 'LD',
        phone: '+14155556789',
        email: 'lauren.d@email.com',
        smsOptIn: true,
        preferredChannel: 'sms'
      },
      lastMessage: 'What\'s the cost for Botox? Interested in forehead and crow\'s feet.',
      lastMessageTime: subHours(new Date(), 12),
      unreadCount: 1,
      starred: false,
      status: 'open',
      messages: [
        {
          id: 1,
          sender: 'patient',
          text: 'Hi! I\'m interested in Botox treatments',
          time: subHours(new Date(), 13),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 2,
          sender: 'patient',
          text: 'What\'s the cost for Botox? Interested in forehead and crow\'s feet.',
          time: subHours(new Date(), 12),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        }
      ]
    },

    // Open - Post-treatment concern
    {
      id: 9,
      patient: {
        id: 'p9',
        name: 'Christina Lee',
        initials: 'CL',
        phone: '+14155557890',
        email: 'christina.l@email.com',
        lastAppointment: 'Lip Filler - 2 days ago',
        nextAppointment: 'Follow-up - 2 weeks',
        smsOptIn: true,
        preferredChannel: 'sms'
      },
      lastMessage: 'Some swelling on the left side. Is this normal?',
      lastMessageTime: subHours(new Date(), 4),
      unreadCount: 1,
      starred: true,
      status: 'open',
      messages: [
        {
          id: 1,
          sender: 'clinic',
          text: 'Your lip filler looks beautiful! Apply ice for swelling and sleep elevated. Some asymmetry is normal initially.',
          time: subDays(new Date(), 2),
          status: 'delivered',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 2,
          sender: 'patient',
          text: 'Thank you! Quick question',
          time: subHours(new Date(), 5),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 3,
          sender: 'patient',
          text: 'Some swelling on the left side. Is this normal?',
          time: subHours(new Date(), 4),
          status: 'read',
          channel: 'sms',
          type: 'manual'
        },
        {
          id: 4,
          sender: 'clinic',
          text: 'That\'s completely normal! The swelling should subside within 24-48 hours. Keep applying ice.',
          time: subHours(new Date(), 3.5),
          status: 'failed',
          channel: 'sms',
          type: 'manual'
        }
      ]
    },

    // Closed - Thank you
    {
      id: 10,
      patient: {
        id: 'p10',
        name: 'Nicole Anderson',
        initials: 'NA',
        phone: '+14155558901',
        email: 'nicole.a@email.com',
        lastAppointment: 'Botox - 1 week ago',
        nextAppointment: 'Botox - 3 months',
        smsOptIn: true,
        preferredChannel: 'sms'
      },
      lastMessage: 'You\'re welcome! Look forward to seeing you again.',
      lastMessageTime: subWeeks(new Date(), 1),
      unreadCount: 0,
      starred: false,
      status: 'closed',
      messages: [
        {
          id: 1,
          sender: 'patient',
          text: 'Thank you! Already seeing Botox results and I love it!',
          time: subWeeks(new Date(), 1),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 2,
          sender: 'clinic',
          text: 'You\'re welcome! Look forward to seeing you again.',
          time: subWeeks(new Date(), 1),
          status: 'delivered',
          channel: 'sms',
        type: 'manual'
        }
      ]
    },

    // Open - Package inquiry
    {
      id: 11,
      patient: {
        id: 'p11',
        name: 'Sophia Patel',
        initials: 'SP',
        phone: '+14155559012',
        email: 'sophia.p@email.com',
        lastAppointment: 'IPL Treatment - 1 month ago',
        smsOptIn: true,
        preferredChannel: 'sms'
      },
      lastMessage: 'Do you have package deals for multiple IPL sessions?',
      lastMessageTime: subHours(new Date(), 10),
      unreadCount: 1,
      starred: false,
      status: 'open',
      messages: [
        {
          id: 1,
          sender: 'patient',
          text: 'Hi! Really happy with my IPL results',
          time: subHours(new Date(), 11),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 2,
          sender: 'patient',
          text: 'Do you have package deals for multiple IPL sessions?',
          time: subHours(new Date(), 10),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        }
      ]
    },

    // Snoozed - Follow-up scheduled
    {
      id: 12,
      patient: {
        id: 'p12',
        name: 'Olivia Brown',
        initials: 'OB',
        phone: '+14155550123',
        email: 'olivia.b@email.com',
        lastAppointment: 'Botox - 2 months ago',
        smsOptIn: true,
        preferredChannel: 'sms'
      },
      lastMessage: 'Thanks! I\'ll reach out when ready to schedule.',
      lastMessageTime: subWeeks(new Date(), 2),
      unreadCount: 0,
      starred: false,
      status: 'snoozed',
      snoozedUntil: subWeeks(new Date(), -1),
      messages: [
        {
          id: 1,
          sender: 'clinic',
          text: 'It\'s been 2 months since your Botox. Ready to schedule your next appointment?',
          time: subWeeks(new Date(), 2),
          status: 'delivered',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 2,
          sender: 'patient',
          text: 'Thanks! I\'ll reach out when ready to schedule.',
          time: subWeeks(new Date(), 2),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        }
      ]
    },

    // Open - Referral
    {
      id: 13,
      patient: {
        id: 'p13',
        name: 'Victoria Moore',
        initials: 'VM',
        phone: '+14155551234',
        email: 'victoria.m@email.com',
        lastAppointment: 'Microneedling - 2 weeks ago',
        nextAppointment: 'Microneedling - 1 month',
        smsOptIn: true,
        preferredChannel: 'sms'
      },
      lastMessage: 'My friend wants a consultation. Do you have a referral program?',
      lastMessageTime: subHours(new Date(), 7),
      unreadCount: 1,
      starred: false,
      status: 'open',
      messages: [
        {
          id: 1,
          sender: 'patient',
          text: 'I\'ve been telling friends about your spa!',
          time: subHours(new Date(), 8),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 2,
          sender: 'patient',
          text: 'My friend wants a consultation. Do you have a referral program?',
          time: subHours(new Date(), 7),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        }
      ]
    },

    // Closed - Cancelled
    {
      id: 14,
      patient: {
        id: 'p14',
        name: 'Isabella Garcia',
        initials: 'IG',
        phone: '+14155552345',
        email: 'isabella.g@email.com',
        lastAppointment: 'Hydrafacial - 2 months ago',
        smsOptIn: true,
        preferredChannel: 'sms'
      },
      lastMessage: 'No problem! Reach out when ready to reschedule.',
      lastMessageTime: subDays(new Date(), 7),
      unreadCount: 0,
      starred: false,
      status: 'closed',
      messages: [
        {
          id: 1,
          sender: 'patient',
          text: 'Need to cancel Thursday. Something came up.',
          time: subDays(new Date(), 7),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 2,
          sender: 'clinic',
          text: 'No problem! Reach out when ready to reschedule.',
          time: subDays(new Date(), 7),
          status: 'delivered',
          channel: 'sms',
        type: 'manual'
        }
      ]
    },

    // Open - Birthday promo
    {
      id: 15,
      patient: {
        id: 'p15',
        name: 'Mia Taylor',
        initials: 'MT',
        phone: '+14155553456',
        email: 'mia.t@email.com',
        lastAppointment: 'Laser Hair Removal - 3 weeks ago',
        nextAppointment: 'Laser Hair Removal - 1 week',
        smsOptIn: true,
        preferredChannel: 'sms'
      },
      lastMessage: 'So sweet! I\'d love to use it for my next session.',
      lastMessageTime: subHours(new Date(), 24),
      unreadCount: 0,
      starred: false,
      status: 'open',
      messages: [
        {
          id: 1,
          sender: 'clinic',
          text: 'Happy Birthday Mia! Enjoy 20% off your next treatment. Valid 30 days!',
          time: subHours(new Date(), 25),
          status: 'delivered',
          channel: 'sms',
        type: 'manual'
        },
        {
          id: 2,
          sender: 'patient',
          text: 'So sweet! I\'d love to use it for my next session.',
          time: subHours(new Date(), 24),
          status: 'read',
          channel: 'sms',
        type: 'manual'
        }
      ]
    }
  ]
}

/**
 * useConversations Hook
 * Manages conversation state and actions for messaging inbox
 */
export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(() => generateMockConversations())
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [filters, setFilters] = useState<ConversationFilters>({ status: 'open' })
  const [autoCloseSettings, setAutoCloseSettings] = useState<AutoCloseSettings>(() => getAutoCloseSettings())

  // Auto-close inactive conversations based on settings
  useEffect(() => {
    const checkAndAutoClose = () => {
      const settings = getAutoCloseSettings()
      setAutoCloseSettings(settings)

      if (settings.days === 'never') return

      setConversations(prev => prev.map(c => {
        if (shouldAutoClose(c, settings)) {
          console.log(`Auto-closing conversation ${c.id} (${c.patient.name}) after ${settings.days} days of inactivity`)
          return { ...c, status: 'closed' as ConversationStatus, unreadCount: 0 }
        }
        return c
      }))
    }

    // Check immediately
    checkAndAutoClose()

    // Check every minute for auto-close
    const interval = setInterval(checkAndAutoClose, 60000)

    return () => clearInterval(interval)
  }, [])

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      if (filters.status && filters.status !== 'all' && c.status !== filters.status) return false
      if (filters.search) {
        const search = filters.search.toLowerCase()
        if (!c.patient.name.toLowerCase().includes(search) &&
            !c.lastMessage.toLowerCase().includes(search) &&
            !c.patient.phone.includes(search)) return false
      }
      if (filters.starred && !c.starred) return false
      if (filters.hasUnread && c.unreadCount === 0) return false
      return true
    }).sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime())
  }, [conversations, filters])

  // Counts
  const counts = useMemo<ConversationCounts>(() => ({
    open: conversations.filter(c => c.status === 'open').length,
    snoozed: conversations.filter(c => c.status === 'snoozed').length,
    closed: conversations.filter(c => c.status === 'closed').length,
    all: conversations.length,
    unread: conversations.reduce((sum, c) => sum + c.unreadCount, 0)
  }), [conversations])

  // Selected conversation
  const selectedConversation = useMemo(() =>
    conversations.find(c => c.id === selectedId) || null
  , [conversations, selectedId])

  // Actions
  const closeConversation = useCallback((id: number) => {
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, status: 'closed' as ConversationStatus, unreadCount: 0 } : c
    ))
  }, [])

  const snoozeConversation = useCallback((id: number, until: Date) => {
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, status: 'snoozed' as ConversationStatus, snoozedUntil: until } : c
    ))
  }, [])

  const reopenConversation = useCallback((id: number) => {
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, status: 'open' as ConversationStatus, snoozedUntil: undefined } : c
    ))
  }, [])

  const sendMessage = useCallback((conversationId: number, text: string) => {
    const messageId = Date.now()

    // Add message in 'sending' state
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c
      const newMessage: Message = {
        id: messageId,
        sender: 'clinic',
        text,
        time: new Date(),
        status: 'sending',
        channel: 'sms',
        type: 'manual'
      }
      return {
        ...c,
        messages: [...c.messages, newMessage],
        lastMessage: text,
        lastMessageTime: new Date(),
        status: 'open' as ConversationStatus
      }
    }))

    // Simulate delivery: Update status after 2 seconds
    setTimeout(() => {
      setConversations(prev => prev.map(c => {
        if (c.id !== conversationId) return c
        return {
          ...c,
          messages: c.messages.map(m =>
            m.id === messageId ? { ...m, status: 'delivered' as MessageStatus } : m
          )
        }
      }))
    }, 2000)
  }, [])

  const toggleStar = useCallback((id: number) => {
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, starred: !c.starred } : c
    ))
  }, [])

  const markAsRead = useCallback((id: number) => {
    setConversations(prev => prev.map(c =>
      c.id === id ? { ...c, unreadCount: 0 } : c
    ))
  }, [])

  const retryMessage = useCallback((conversationId: number, messageId: number) => {
    // Update failed message to 'sending' state
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c
      return {
        ...c,
        messages: c.messages.map(m =>
          m.id === messageId ? { ...m, status: 'sending' as MessageStatus } : m
        )
      }
    }))

    // Simulate retry: Update status after 2 seconds
    setTimeout(() => {
      setConversations(prev => prev.map(c => {
        if (c.id !== conversationId) return c
        return {
          ...c,
          messages: c.messages.map(m =>
            m.id === messageId ? { ...m, status: 'delivered' as MessageStatus } : m
          )
        }
      }))
    }, 2000)
  }, [])

  return {
    conversations: filteredConversations,
    allConversations: conversations,
    selectedConversation,
    selectedId,
    setSelectedId,
    filters,
    setFilters,
    counts,
    autoCloseSettings,
    closeConversation,
    snoozeConversation,
    reopenConversation,
    sendMessage,
    toggleStar,
    markAsRead,
    retryMessage
  }
}
