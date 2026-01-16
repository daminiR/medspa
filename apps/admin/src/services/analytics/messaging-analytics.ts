/**
 * Messaging Analytics Service
 * Comprehensive analytics for SMS, Email, Web Chat, and Phone messaging
 *
 * Tracks:
 * - Delivery rates by channel
 * - Response rates and confirmation rates
 * - Average response times
 * - Cost per message analysis
 * - Daily/weekly/monthly aggregates
 * - Staff performance metrics
 */

import moment from 'moment';
import type { Message, MessageChannel, MessageDeliveryStatus, Conversation } from '@/types/messaging';

/**
 * Messaging analytics metrics interface
 */
export interface MessageAnalyticsMetrics {
  // Summary metrics
  summary: {
    dateRange: { from: Date; to: Date };
    totalMessagesSent: number;
    totalMessagesReceived: number;
    totalConversations: number;
    activeConversations: number;
    generatedAt: Date;
  };

  // Delivery metrics by channel
  deliveryByChannel: Record<MessageChannel, {
    sent: number;
    delivered: number;
    deliveryRate: number;
    failed: number;
    failureRate: number;
  }>;

  // Overall delivery statistics
  overallDelivery: {
    sent: number;
    delivered: number;
    deliveryRate: number;
    failed: number;
    failureRate: number;
    queued: number;
    sending: number;
  };

  // Response metrics
  responseMetrics: {
    totalReceived: number;
    responded: number;
    responseRate: number;
    avgResponseTimeMinutes: number;
    avgResponseTimeFormatted: string;
    medianResponseTimeMinutes: number;
    responseTimeDistribution: {
      within1Hour: number;
      within1to4Hours: number;
      within4to24Hours: number;
      moreThan24Hours: number;
    };
  };

  // Confirmation metrics
  confirmationMetrics: {
    confirmationRequestsSent: number;
    confirmationsReceived: number;
    confirmationRate: number;
    avgConfirmationTimeMinutes: number;
    unconfirmedCount: number;
  };

  // Cost analysis
  costAnalysis: {
    estimatedCostPerMessage: Record<MessageChannel, number>;
    estimatedTotalCost: number;
    estimatedCostByChannel: Record<MessageChannel, number>;
    messagesPerDollar: number;
  };

  // Time-based aggregates
  dailyStats: DailyStats[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];

  // Staff performance
  staffMetrics: StaffMetric[];

  // Channel breakdown
  channelBreakdown: {
    channel: MessageChannel;
    sent: number;
    delivered: number;
    failed: number;
    percentage: number;
  }[];

  // Message type breakdown
  messageTypeBreakdown: {
    type: 'manual' | 'automated' | 'system' | 'campaign';
    count: number;
    deliveryRate: number;
    responseRate: number;
  }[];

  // Status breakdown
  statusBreakdown: Record<MessageDeliveryStatus, number>;

  // Peak hours analysis
  peakHours: {
    hour: number;
    messageCount: number;
    avgResponseRate: number;
  }[];

  // Trends
  trends: {
    messageVolumeChange: number; // percentage
    deliveryRateChange: number; // percentage
    responseRateChange: number; // percentage
  };
}

export interface DailyStats {
  date: string;
  sent: number;
  delivered: number;
  deliveryRate: number;
  received: number;
  responded: number;
  avgResponseTimeMinutes: number;
  byChannel: Record<MessageChannel, number>;
  estimatedCost: number;
}

export interface WeeklyStats {
  weekStarting: string;
  weekEnding: string;
  sent: number;
  delivered: number;
  deliveryRate: number;
  received: number;
  responded: number;
  responseRate: number;
  avgResponseTimeMinutes: number;
  confirmations: number;
  estimatedCost: number;
}

export interface MonthlyStats {
  month: string;
  sent: number;
  delivered: number;
  deliveryRate: number;
  received: number;
  responded: number;
  responseRate: number;
  avgResponseTimeMinutes: number;
  confirmations: number;
  estimatedCost: number;
}

export interface StaffMetric {
  staffId: string;
  staffName: string;
  messagesSent: number;
  avgResponseTime: number;
  conversationsHandled: number;
  avgConfirmationTime: number;
  deliveryRate: number;
  responseRate: number;
}

/**
 * Cost configuration for different channels
 */
const CHANNEL_COSTS: Record<MessageChannel, number> = {
  sms: 0.0075, // $0.0075 per SMS (Twilio standard)
  email: 0.001, // $0.001 per email (SendGrid standard)
  web_chat: 0.0001, // $0.0001 per message (platform cost)
  phone: 0.05, // $0.05 per minute (estimated)
};

/**
 * Mock message data storage (in production, would query database)
 */
const mockMessages: Message[] = [];
const mockConversations: Conversation[] = [];

/**
 * Initialize mock data for analytics (for demo purposes)
 */
function initializeMockData() {
  if (mockMessages.length > 0) return;

  const now = new Date();
  const channels: MessageChannel[] = ['sms', 'email', 'web_chat', 'phone'];
  const statuses: MessageDeliveryStatus[] = ['queued', 'sending', 'sent', 'delivered', 'read', 'failed'];
  const messageTypes: Array<'manual' | 'automated' | 'system' | 'campaign'> = ['manual', 'automated', 'system', 'campaign'];

  // Generate 30 days of mock messages
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const dayDate = new Date(now);
    dayDate.setDate(dayDate.getDate() - dayOffset);

    // Generate hourly messages throughout the day
    for (let hour = 0; hour < 24; hour++) {
      const messageCount = Math.floor(Math.random() * 10) + 5; // 5-15 messages per hour

      for (let i = 0; i < messageCount; i++) {
        const messageTime = new Date(dayDate);
        messageTime.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

        const channel = channels[Math.floor(Math.random() * channels.length)];
        const status = Math.random() > 0.1 ? 'delivered' : (Math.random() > 0.5 ? 'failed' : 'sent');

        mockMessages.push({
          id: mockMessages.length + 1,
          conversationId: Math.floor(Math.random() * 100) + 1,
          sender: Math.random() > 0.5 ? 'clinic' : 'patient',
          senderName: Math.random() > 0.5 ? 'Dr. Chen' : 'Admin',
          text: `Message ${mockMessages.length + 1}`,
          time: messageTime,
          status: status as MessageDeliveryStatus,
          channel,
          type: messageTypes[Math.floor(Math.random() * messageTypes.length)],
        });
      }
    }
  }

  // Generate conversations
  for (let i = 1; i <= 100; i++) {
    const convMessages = mockMessages
      .filter(m => m.conversationId === i)
      .sort((a, b) => a.time.getTime() - b.time.getTime());

    if (convMessages.length === 0) continue;

    mockConversations.push({
      id: i,
      patient: {
        id: `p${i}`,
        name: `Patient ${i}`,
        initials: `P${i}`,
        phone: `+1555${String(i).padStart(7, '0')}`,
        email: `patient${i}@example.com`,
        smsOptIn: true,
        emailOptIn: true,
        marketingOptIn: Math.random() > 0.5,
        preferredChannel: ['sms', 'email', 'web_chat', 'phone'][Math.floor(Math.random() * 4)] as MessageChannel,
        patientSince: new Date(2023, 0, 1),
        upcomingAppointments: [],
        recentAppointments: [],
        tags: [],
        notes: [],
      },
      status: Math.random() > 0.3 ? 'open' : (Math.random() > 0.5 ? 'closed' : 'snoozed'),
      channel: convMessages[0].channel,
      lastMessage: convMessages[convMessages.length - 1].text,
      lastMessageTime: convMessages[convMessages.length - 1].time,
      unreadCount: Math.floor(Math.random() * 3),
      starred: Math.random() > 0.8,
      tags: [],
      messages: convMessages,
    });
  }
}

/**
 * Calculate delivery metrics by channel
 */
function calculateDeliveryByChannel(): Record<MessageChannel, any> {
  const channels: MessageChannel[] = ['sms', 'email', 'web_chat', 'phone'];
  const result: Record<MessageChannel, any> = {} as any;

  channels.forEach(channel => {
    const channelMessages = mockMessages.filter(m => m.channel === channel);
    const delivered = channelMessages.filter(m => m.status === 'delivered' || m.status === 'read').length;
    const failed = channelMessages.filter(m => m.status === 'failed').length;

    result[channel] = {
      sent: channelMessages.length,
      delivered,
      deliveryRate: channelMessages.length > 0 ? Math.round((delivered / channelMessages.length) * 100) : 0,
      failed,
      failureRate: channelMessages.length > 0 ? Math.round((failed / channelMessages.length) * 100) : 0,
    };
  });

  return result;
}

/**
 * Calculate response metrics
 */
function calculateResponseMetrics(): any {
  const patientMessages = mockMessages.filter(m => m.sender === 'patient');
  const clinicMessages = mockMessages.filter(m => m.sender === 'clinic');

  const responded = mockConversations.filter(conv => {
    const hasPatientResponse = conv.messages.some(m => m.sender === 'patient');
    const hasClinicMessage = conv.messages.some(m => m.sender === 'clinic');
    return hasPatientResponse && hasClinicMessage;
  }).length;

  // Calculate average response time
  let totalResponseTime = 0;
  let responseCount = 0;
  const responseTimes: number[] = [];

  mockConversations.forEach(conv => {
    const messages = conv.messages.sort((a, b) => a.time.getTime() - b.time.getTime());
    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].sender === 'clinic' && messages[i + 1].sender === 'patient') {
        const responseTime = (messages[i + 1].time.getTime() - messages[i].time.getTime()) / (1000 * 60);
        totalResponseTime += responseTime;
        responseTimes.push(responseTime);
        responseCount++;
      }
    }
  });

  const avgResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;
  const medianResponseTime = responseTimes.length > 0
    ? responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length / 2)]
    : 0;

  // Response time distribution
  const distribution = {
    within1Hour: responseTimes.filter(t => t <= 60).length,
    within1to4Hours: responseTimes.filter(t => t > 60 && t <= 240).length,
    within4to24Hours: responseTimes.filter(t => t > 240 && t <= 1440).length,
    moreThan24Hours: responseTimes.filter(t => t > 1440).length,
  };

  return {
    totalReceived: patientMessages.length,
    responded,
    responseRate: patientMessages.length > 0 ? Math.round((responded / patientMessages.length) * 100) : 0,
    avgResponseTimeMinutes: Math.round(avgResponseTime),
    avgResponseTimeFormatted: formatMinutesToHumanReadable(Math.round(avgResponseTime)),
    medianResponseTimeMinutes: Math.round(medianResponseTime),
    responseTimeDistribution: distribution,
  };
}

/**
 * Calculate daily statistics
 */
function calculateDailyStats(dateRange: { from: Date; to: Date }): DailyStats[] {
  const stats: DailyStats[] = [];
  const current = moment(dateRange.from);
  const end = moment(dateRange.to);

  while (current.isSameOrBefore(end)) {
    const dayStart = current.clone().startOf('day').toDate();
    const dayEnd = current.clone().endOf('day').toDate();

    const dayMessages = mockMessages.filter(m => m.time >= dayStart && m.time <= dayEnd);
    const dayConversations = mockConversations.filter(conv =>
      conv.messages.some(m => m.time >= dayStart && m.time <= dayEnd)
    );

    const delivered = dayMessages.filter(m => m.status === 'delivered' || m.status === 'read').length;
    const received = dayMessages.filter(m => m.sender === 'patient').length;
    const responded = dayConversations.filter(conv => conv.messages.some(m => m.sender === 'patient')).length;

    // Calculate avg response time for the day
    let totalResponseTime = 0;
    let responseCount = 0;
    dayConversations.forEach(conv => {
      const messages = conv.messages.sort((a, b) => a.time.getTime() - b.time.getTime());
      for (let i = 0; i < messages.length - 1; i++) {
        if (messages[i].sender === 'clinic' && messages[i + 1].sender === 'patient' &&
          messages[i + 1].time >= dayStart && messages[i + 1].time <= dayEnd) {
          const responseTime = (messages[i + 1].time.getTime() - messages[i].time.getTime()) / (1000 * 60);
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
    });

    // Cost calculation
    const costByChannel = Object.entries(CHANNEL_COSTS).reduce((acc, [channel, cost]) => {
      const channelMessages = dayMessages.filter(m => m.channel === channel as MessageChannel);
      acc[channel as MessageChannel] = channelMessages.length;
      return acc;
    }, {} as Record<MessageChannel, number>);

    const estimatedCost = (Object.entries(costByChannel) as any[]).reduce((sum, [channel, count]) => {
      return sum + (count * CHANNEL_COSTS[channel as MessageChannel]);
    }, 0);

    stats.push({
      date: current.format('YYYY-MM-DD'),
      sent: dayMessages.filter(m => m.sender === 'clinic').length,
      delivered,
      deliveryRate: dayMessages.filter(m => m.sender === 'clinic').length > 0
        ? Math.round((delivered / dayMessages.filter(m => m.sender === 'clinic').length) * 100)
        : 0,
      received,
      responded,
      avgResponseTimeMinutes: responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0,
      byChannel: costByChannel,
      estimatedCost: Math.round(estimatedCost * 100) / 100,
    });

    current.add(1, 'day');
  }

  return stats;
}

/**
 * Calculate weekly statistics
 */
function calculateWeeklyStats(dateRange: { from: Date; to: Date }): WeeklyStats[] {
  const stats: WeeklyStats[] = [];
  const current = moment(dateRange.from).startOf('week');
  const end = moment(dateRange.to);

  while (current.isSameOrBefore(end)) {
    const weekStart = current.clone().startOf('week').toDate();
    const weekEnd = current.clone().endOf('week').toDate();

    const weekMessages = mockMessages.filter(m => m.time >= weekStart && m.time <= weekEnd);
    const clinicMessages = weekMessages.filter(m => m.sender === 'clinic');
    const delivered = weekMessages.filter(m => (m.status === 'delivered' || m.status === 'read') && m.sender === 'clinic').length;
    const received = weekMessages.filter(m => m.sender === 'patient').length;
    const responded = mockConversations.filter(conv =>
      conv.messages.some(m => m.sender === 'patient' && m.time >= weekStart && m.time <= weekEnd)
    ).length;

    // Confirmations (messages with confirmation intent)
    const confirmations = weekMessages.filter(m => m.text.toLowerCase().includes('confirm')).length;

    const estimatedCost = (Object.entries(CHANNEL_COSTS) as any[]).reduce((sum, [channel, cost]) => {
      const channelCount = weekMessages.filter(m => m.channel === channel).length;
      return sum + (channelCount * cost);
    }, 0);

    stats.push({
      weekStarting: moment(weekStart).format('YYYY-MM-DD'),
      weekEnding: moment(weekEnd).format('YYYY-MM-DD'),
      sent: clinicMessages.length,
      delivered,
      deliveryRate: clinicMessages.length > 0 ? Math.round((delivered / clinicMessages.length) * 100) : 0,
      received,
      responded,
      responseRate: received > 0 ? Math.round((responded / received) * 100) : 0,
      avgResponseTimeMinutes: 45, // Mock value
      confirmations,
      estimatedCost: Math.round(estimatedCost * 100) / 100,
    });

    current.add(1, 'week');
  }

  return stats;
}

/**
 * Calculate monthly statistics
 */
function calculateMonthlyStats(dateRange: { from: Date; to: Date }): MonthlyStats[] {
  const stats: MonthlyStats[] = [];
  const current = moment(dateRange.from).startOf('month');
  const end = moment(dateRange.to);

  while (current.isSameOrBefore(end)) {
    const monthStart = current.clone().startOf('month').toDate();
    const monthEnd = current.clone().endOf('month').toDate();

    const monthMessages = mockMessages.filter(m => m.time >= monthStart && m.time <= monthEnd);
    const clinicMessages = monthMessages.filter(m => m.sender === 'clinic');
    const delivered = monthMessages.filter(m => (m.status === 'delivered' || m.status === 'read') && m.sender === 'clinic').length;
    const received = monthMessages.filter(m => m.sender === 'patient').length;
    const responded = mockConversations.filter(conv =>
      conv.messages.some(m => m.sender === 'patient' && m.time >= monthStart && m.time <= monthEnd)
    ).length;

    const confirmations = monthMessages.filter(m => m.text.toLowerCase().includes('confirm')).length;

    const estimatedCost = (Object.entries(CHANNEL_COSTS) as any[]).reduce((sum, [channel, cost]) => {
      const channelCount = monthMessages.filter(m => m.channel === channel).length;
      return sum + (channelCount * cost);
    }, 0);

    stats.push({
      month: current.format('YYYY-MM'),
      sent: clinicMessages.length,
      delivered,
      deliveryRate: clinicMessages.length > 0 ? Math.round((delivered / clinicMessages.length) * 100) : 0,
      received,
      responded,
      responseRate: received > 0 ? Math.round((responded / received) * 100) : 0,
      avgResponseTimeMinutes: 45, // Mock value
      confirmations,
      estimatedCost: Math.round(estimatedCost * 100) / 100,
    });

    current.add(1, 'month');
  }

  return stats;
}

/**
 * Calculate staff metrics
 */
function calculateStaffMetrics(): StaffMetric[] {
  const staffNames = ['Dr. Sarah Chen', 'Dr. Michael Lee', 'Emily Rodriguez', 'Jessica Park', 'Admin'];
  const metrics: StaffMetric[] = [];

  staffNames.forEach(staffName => {
    const staffMessages = mockMessages.filter(m => m.senderName === staffName && m.sender === 'clinic');
    const delivered = staffMessages.filter(m => m.status === 'delivered' || m.status === 'read').length;

    const staffConversations = mockConversations.filter(conv =>
      conv.messages.some(m => m.senderName === staffName && m.sender === 'clinic')
    );

    let totalResponseTime = 0;
    let responseCount = 0;

    staffConversations.forEach(conv => {
      const messages = conv.messages.sort((a, b) => a.time.getTime() - b.time.getTime());
      for (let i = 0; i < messages.length - 1; i++) {
        if (messages[i].senderName === staffName && messages[i].sender === 'clinic' && messages[i + 1].sender === 'patient') {
          const responseTime = (messages[i + 1].time.getTime() - messages[i].time.getTime()) / (1000 * 60);
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
    });

    metrics.push({
      staffId: `staff_${staffName.replace(/\s+/g, '_').toLowerCase()}`,
      staffName,
      messagesSent: staffMessages.length,
      avgResponseTime: responseCount > 0 ? Math.round(totalResponseTime / responseCount) : 0,
      conversationsHandled: staffConversations.length,
      avgConfirmationTime: 120, // Mock value
      deliveryRate: staffMessages.length > 0 ? Math.round((delivered / staffMessages.length) * 100) : 0,
      responseRate: staffConversations.length > 0 ? Math.round((responseCount / staffConversations.length) * 100) : 0,
    });
  });

  return metrics;
}

/**
 * Calculate peak hours
 */
function calculatePeakHours(): Array<{ hour: number; messageCount: number; avgResponseRate: number }> {
  const hourlyData: Record<number, number> = {};

  mockMessages.forEach(msg => {
    const hour = msg.time.getHours();
    hourlyData[hour] = (hourlyData[hour] || 0) + 1;
  });

  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    messageCount: hourlyData[i] || 0,
    avgResponseRate: Math.floor(Math.random() * 30) + 10,
  }));
}

/**
 * Format minutes to human-readable time
 */
function formatMinutesToHumanReadable(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  } else if (minutes < 1440) {
    return `${Math.round(minutes / 60)}h`;
  } else {
    return `${Math.round(minutes / 1440)}d`;
  }
}

/**
 * Calculate channel breakdown
 */
function calculateChannelBreakdown(): Array<any> {
  const channels: MessageChannel[] = ['sms', 'email', 'web_chat', 'phone'];
  const total = mockMessages.length;

  return channels.map(channel => {
    const channelMessages = mockMessages.filter(m => m.channel === channel);
    return {
      channel,
      sent: channelMessages.length,
      delivered: channelMessages.filter(m => m.status === 'delivered' || m.status === 'read').length,
      failed: channelMessages.filter(m => m.status === 'failed').length,
      percentage: total > 0 ? Math.round((channelMessages.length / total) * 100) : 0,
    };
  });
}

/**
 * Calculate cost analysis
 */
function calculateCostAnalysis(): any {
  const channels: MessageChannel[] = ['sms', 'email', 'web_chat', 'phone'];
  const costByChannel: Record<MessageChannel, number> = {} as any;
  let totalCost = 0;

  channels.forEach(channel => {
    const channelMessages = mockMessages.filter(m => m.channel === channel);
    costByChannel[channel] = Math.round(channelMessages.length * CHANNEL_COSTS[channel] * 100) / 100;
    totalCost += costByChannel[channel];
  });

  const totalMessages = mockMessages.length;

  return {
    estimatedCostPerMessage: CHANNEL_COSTS,
    estimatedTotalCost: Math.round(totalCost * 100) / 100,
    estimatedCostByChannel: costByChannel,
    messagesPerDollar: totalMessages > 0 ? Math.round((totalMessages / totalCost) * 100) / 100 : 0,
  };
}

/**
 * Calculate message type breakdown
 */
function calculateMessageTypeBreakdown(): Array<any> {
  const types: Array<'manual' | 'automated' | 'system' | 'campaign'> = ['manual', 'automated', 'system', 'campaign'];

  return types.map(type => {
    const typeMessages = mockMessages.filter(m => m.type === type);
    const delivered = typeMessages.filter(m => m.status === 'delivered' || m.status === 'read').length;
    const totalReceived = mockMessages.filter(m => m.sender === 'patient').length;

    return {
      type,
      count: typeMessages.length,
      deliveryRate: typeMessages.length > 0 ? Math.round((delivered / typeMessages.length) * 100) : 0,
      responseRate: totalReceived > 0 ? Math.floor(Math.random() * 30) + 10 : 0,
    };
  });
}

/**
 * Calculate status breakdown
 */
function calculateStatusBreakdown(): Record<MessageDeliveryStatus, number> {
  const statuses: MessageDeliveryStatus[] = ['queued', 'sending', 'sent', 'delivered', 'read', 'failed'];
  const breakdown: Record<MessageDeliveryStatus, number> = {} as any;

  statuses.forEach(status => {
    breakdown[status] = mockMessages.filter(m => m.status === status).length;
  });

  return breakdown;
}

/**
 * Main analytics calculation function
 */
export function calculateMessagingAnalytics(
  dateRange?: { from?: Date; to?: Date },
  conversationData?: Conversation[],
  messageData?: Message[]
): MessageAnalyticsMetrics {
  // Initialize mock data
  initializeMockData();

  // Set date range (default to last 30 days)
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (dateRange?.from ? 0 : 30));

  const finalDateRange = {
    from: dateRange?.from || from,
    to: dateRange?.to || to,
  };

  // Calculate all metrics
  const deliveryByChannel = calculateDeliveryByChannel();
  const responseMetrics = calculateResponseMetrics();
  const dailyStats = calculateDailyStats(finalDateRange);
  const weeklyStats = calculateWeeklyStats(finalDateRange);
  const monthlyStats = calculateMonthlyStats(finalDateRange);

  // Overall delivery stats
  const totalSent = mockMessages.filter(m => m.sender === 'clinic').length;
  const totalDelivered = mockMessages.filter(m => m.sender === 'clinic' && (m.status === 'delivered' || m.status === 'read')).length;
  const totalFailed = mockMessages.filter(m => m.sender === 'clinic' && m.status === 'failed').length;
  const totalQueued = mockMessages.filter(m => m.status === 'queued').length;
  const totalSending = mockMessages.filter(m => m.status === 'sending').length;

  // Confirmation metrics
  const confirmationRequests = mockMessages.filter(m => m.text.toLowerCase().includes('confirm')).length;
  const confirmationResponses = mockMessages.filter(m =>
    m.sender === 'patient' && m.text.toLowerCase().includes('confirm')
  ).length;

  return {
    summary: {
      dateRange: finalDateRange,
      totalMessagesSent: totalSent,
      totalMessagesReceived: mockMessages.filter(m => m.sender === 'patient').length,
      totalConversations: mockConversations.length,
      activeConversations: mockConversations.filter(c => c.status === 'open').length,
      generatedAt: new Date(),
    },

    deliveryByChannel,

    overallDelivery: {
      sent: totalSent,
      delivered: totalDelivered,
      deliveryRate: totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0,
      failed: totalFailed,
      failureRate: totalSent > 0 ? Math.round((totalFailed / totalSent) * 100) : 0,
      queued: totalQueued,
      sending: totalSending,
    },

    responseMetrics: {
      ...responseMetrics,
    },

    confirmationMetrics: {
      confirmationRequestsSent: confirmationRequests,
      confirmationsReceived: confirmationResponses,
      confirmationRate: confirmationRequests > 0 ? Math.round((confirmationResponses / confirmationRequests) * 100) : 0,
      avgConfirmationTimeMinutes: 120,
      unconfirmedCount: confirmationRequests - confirmationResponses,
    },

    costAnalysis: calculateCostAnalysis(),

    dailyStats,
    weeklyStats,
    monthlyStats,

    staffMetrics: calculateStaffMetrics(),

    channelBreakdown: calculateChannelBreakdown(),

    messageTypeBreakdown: calculateMessageTypeBreakdown(),

    statusBreakdown: calculateStatusBreakdown(),

    peakHours: calculatePeakHours(),

    trends: {
      messageVolumeChange: Math.floor(Math.random() * 20) - 10,
      deliveryRateChange: Math.floor(Math.random() * 10) - 5,
      responseRateChange: Math.floor(Math.random() * 15) - 7,
    },
  };
}

/**
 * Export singleton instance
 */
export const messagingAnalyticsService = {
  calculateAnalytics: calculateMessagingAnalytics,
};
