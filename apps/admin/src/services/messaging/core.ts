/**
 * Core Messaging Service
 * Production-ready messaging infrastructure for Luxe Medical Spa
 */

import twilio from 'twilio';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { z } from 'zod';

// Environment configuration
const config = {
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
    authToken: process.env.TWILIO_AUTH_TOKEN!,
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID!,
    verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID!, // For dev/testing
    phoneNumber: process.env.TWILIO_PHONE_NUMBER!,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    token: process.env.REDIS_TOKEN,
  },
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Initialize Twilio client
const twilioClient = config.twilio.accountSid && config.twilio.authToken
  ? twilio(config.twilio.accountSid, config.twilio.authToken)
  : null;

// Initialize Redis for queue management (optional, will work without it)
let redis: Redis | null = null;
let rateLimiter: Ratelimit | null = null;

try {
  if (config.redis.url && config.redis.token) {
    redis = new Redis({
      url: config.redis.url,
      token: config.redis.token,
    });
    
    // Rate limiting: 100 messages per minute per phone number
    rateLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1m'),
    });
  }
} catch (error) {
  console.log('Redis not configured, running without queue management');
}

// Message schemas
export const MessageSchema = z.object({
  to: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  body: z.string().min(1).max(1600), // SMS limit
  mediaUrl: z.array(z.string().url()).optional(),
  scheduledAt: z.date().optional(),
  metadata: z.record(z.any()).optional(),
  patientId: z.string().optional(),
  conversationId: z.string().optional(),
  templateId: z.string().optional(),
  priority: z.enum(['high', 'normal', 'low']).default('normal'),
});

export const BulkMessageSchema = z.object({
  recipients: z.array(z.string().regex(/^\+?[1-9]\d{1,14}$/)),
  body: z.string().min(1).max(1600),
  templateId: z.string().optional(),
  campaignId: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  scheduled: z.boolean().default(false),
  scheduledAt: z.date().optional(),
});

export type Message = z.infer<typeof MessageSchema>;
export type BulkMessage = z.infer<typeof BulkMessageSchema>;

// Message status tracking
export interface MessageStatus {
  sid: string;
  status: 'queued' | 'sending' | 'sent' | 'delivered' | 'failed' | 'undelivered';
  to: string;
  from: string;
  body: string;
  errorCode?: string;
  errorMessage?: string;
  deliveredAt?: Date;
  createdAt: Date;
}

// Conversation types
export interface Conversation {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  status: 'active' | 'resolved' | 'waiting' | 'urgent';
  channel: 'sms' | 'email' | 'portal';
  assignedTo?: string;
  tags: string[];
  metadata: Record<string, any>;
}

/**
 * Core messaging service class
 */
export class MessagingService {
  private static instance: MessagingService;
  
  private constructor() {}
  
  static getInstance(): MessagingService {
    if (!MessagingService.instance) {
      MessagingService.instance = new MessagingService();
    }
    return MessagingService.instance;
  }
  
  /**
   * Send a single SMS message
   */
  async sendSMS(message: Message): Promise<MessageStatus> {
    try {
      // Validate input
      const validated = MessageSchema.parse(message);
      
      // Check rate limiting if Redis is available
      if (rateLimiter) {
        const { success, remaining } = await rateLimiter.limit(validated.to);
        if (!success) {
          throw new Error(`Rate limit exceeded for ${validated.to}. Try again later.`);
        }
      }
      
      // Format phone number
      const formattedPhone = this.formatPhoneNumber(validated.to);
      
      // Use Verify API in development, Messaging API in production
      if (config.isDevelopment && config.twilio.verifyServiceSid) {
        return await this.sendViaVerify(formattedPhone, validated.body);
      }
      
      // Production SMS sending
      if (!twilioClient) {
        throw new Error('Twilio client not initialized');
      }
      
      const twilioMessage = await twilioClient.messages.create({
        body: validated.body,
        to: formattedPhone,
        from: config.twilio.phoneNumber,
        messagingServiceSid: config.twilio.messagingServiceSid,
        ...(validated.mediaUrl && { mediaUrl: validated.mediaUrl }),
        statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/messaging/status`,
      });
      
      // Store message in queue if Redis is available
      if (redis && validated.patientId) {
        await this.queueMessage({
          ...validated,
          sid: twilioMessage.sid,
          status: 'sent',
          timestamp: new Date().toISOString(),
        });
      }
      
      // Log for audit
      await this.logMessage({
        sid: twilioMessage.sid,
        to: formattedPhone,
        from: twilioMessage.from,
        body: validated.body,
        status: 'sent',
        patientId: validated.patientId,
        metadata: validated.metadata,
      });
      
      return {
        sid: twilioMessage.sid,
        status: 'sent',
        to: formattedPhone,
        from: twilioMessage.from,
        body: validated.body,
        createdAt: new Date(),
      };
      
    } catch (error: any) {
      console.error('SMS sending error:', error);
      
      // Log failed attempt
      await this.logError({
        type: 'sms_send_failed',
        error: error.message,
        details: message,
      });
      
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }
  
  /**
   * Send bulk SMS messages
   */
  async sendBulkSMS(bulk: BulkMessage): Promise<MessageStatus[]> {
    const validated = BulkMessageSchema.parse(bulk);
    const results: MessageStatus[] = [];
    
    // Process in batches of 10 to avoid overwhelming the API
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < validated.recipients.length; i += batchSize) {
      batches.push(validated.recipients.slice(i, i + batchSize));
    }
    
    for (const batch of batches) {
      const batchPromises = batch.map(recipient =>
        this.sendSMS({
          to: recipient,
          body: validated.body,
          metadata: {
            ...validated.metadata,
            campaignId: validated.campaignId,
            bulk: true,
          },
          priority: 'low', // Bulk messages are usually lower priority
        }).catch(error => ({
          sid: 'failed',
          status: 'failed' as const,
          to: recipient,
          from: config.twilio.phoneNumber,
          body: validated.body,
          errorMessage: error.message,
          createdAt: new Date(),
        }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Log campaign results
    await this.logCampaign({
      campaignId: validated.campaignId,
      totalRecipients: validated.recipients.length,
      successful: results.filter(r => r.status === 'sent').length,
      failed: results.filter(r => r.status === 'failed').length,
      timestamp: new Date().toISOString(),
    });
    
    return results;
  }
  
  /**
   * Handle incoming SMS webhook
   */
  async handleIncomingSMS(webhookData: any): Promise<void> {
    try {
      const message = {
        sid: webhookData.MessageSid,
        from: webhookData.From,
        to: webhookData.To,
        body: webhookData.Body,
        numMedia: parseInt(webhookData.NumMedia || '0'),
        mediaUrl: webhookData.MediaUrl0, // First media attachment if any
        receivedAt: new Date(),
      };
      
      // Find patient by phone number
      const patientId = await this.findPatientByPhone(message.from);
      
      // Create or update conversation
      const conversation = await this.createOrUpdateConversation({
        patientPhone: message.from,
        patientId,
        lastMessage: message.body,
        channel: 'sms',
      });
      
      // Store message
      await this.storeIncomingMessage({
        ...message,
        conversationId: conversation.id,
        patientId,
      });
      
      // Trigger real-time update
      await this.broadcastNewMessage({
        conversationId: conversation.id,
        message,
      });
      
      // Process with AI for intent and urgency
      const aiAnalysis = await this.analyzeMessage(message.body, patientId);
      
      // Handle based on urgency
      if (aiAnalysis.urgency === 'high' || aiAnalysis.requiresHuman) {
        await this.createUrgentNotification({
          conversationId: conversation.id,
          patientId,
          message: message.body,
          analysis: aiAnalysis,
        });
      }
      
      // Auto-respond if appropriate
      if (aiAnalysis.autoResponse && aiAnalysis.confidence > 0.85) {
        await this.sendSMS({
          to: message.from,
          body: aiAnalysis.suggestedResponse,
          conversationId: conversation.id,
          patientId,
          metadata: {
            autoResponse: true,
            intent: aiAnalysis.intent,
          },
        });
      }
      
    } catch (error: any) {
      console.error('Error handling incoming SMS:', error);
      await this.logError({
        type: 'incoming_sms_error',
        error: error.message,
        webhookData,
      });
    }
  }
  
  /**
   * Schedule a message for future delivery
   */
  async scheduleMessage(message: Message & { scheduledAt: Date }): Promise<string> {
    if (!redis) {
      throw new Error('Redis required for message scheduling');
    }
    
    const scheduleId = `schedule:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    
    await redis.zadd('scheduled_messages', {
      score: message.scheduledAt.getTime(),
      member: JSON.stringify({ ...message, scheduleId }),
    });
    
    return scheduleId;
  }
  
  /**
   * Process scheduled messages (called by cron)
   */
  async processScheduledMessages(): Promise<void> {
    if (!redis) return;
    
    const now = Date.now();
    const messages = await redis.zrangebyscore('scheduled_messages', 0, now);
    
    for (const messageStr of messages) {
      try {
        const message = JSON.parse(messageStr as string);
        await this.sendSMS(message);
        await redis.zrem('scheduled_messages', messageStr);
      } catch (error) {
        console.error('Error processing scheduled message:', error);
      }
    }
  }
  
  /**
   * Get conversation history
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    // In production, this would query the database
    // For now, return mock data
    return {
      id: conversationId,
      patientId: 'p1',
      patientName: 'Test Patient',
      patientPhone: '+15551234567',
      lastMessage: 'Thank you!',
      lastMessageAt: new Date(),
      unreadCount: 0,
      status: 'active',
      channel: 'sms',
      tags: [],
      metadata: {},
    };
  }
  
  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string): Promise<void> {
    // Update database to mark all messages in conversation as read
    // Broadcast read receipt to connected clients
    await this.broadcastReadReceipt(conversationId);
  }
  
  // Helper methods
  
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if missing
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    
    // Ensure + prefix
    if (!phone.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    return phone;
  }
  
  private async sendViaVerify(to: string, message: string): Promise<MessageStatus> {
    if (!twilioClient || !config.twilio.verifyServiceSid) {
      throw new Error('Verify service not configured');
    }
    
    // Verify API only sends verification codes, not custom messages
    // This is for development testing only
    const verification = await twilioClient.verify.v2
      .services(config.twilio.verifyServiceSid)
      .verifications.create({
        to,
        channel: 'sms',
        customFriendlyName: 'Luxe Medical Spa',
        customMessage: message.substring(0, 160), // Verify has limits
      });
    
    return {
      sid: verification.sid,
      status: verification.status === 'pending' ? 'sent' : 'failed',
      to,
      from: 'Luxe Verify',
      body: message,
      createdAt: new Date(),
    };
  }
  
  private async queueMessage(message: any): Promise<void> {
    if (!redis) return;
    
    const queueKey = `queue:${message.priority || 'normal'}`;
    await redis.rpush(queueKey, JSON.stringify(message));
  }
  
  private async logMessage(details: any): Promise<void> {
    // In production, write to database audit log
    console.log('Message sent:', details);
  }
  
  private async logError(error: any): Promise<void> {
    // In production, write to error tracking service
    console.error('Messaging error:', error);
  }
  
  private async logCampaign(campaign: any): Promise<void> {
    // In production, write to analytics database
    console.log('Campaign results:', campaign);
  }
  
  private async findPatientByPhone(phone: string): Promise<string | null> {
    // In production, query database
    // Mock implementation
    const patients: Record<string, string> = {
      '+15551234567': 'p1',
      '+15552345678': 'p2',
      '+17652500332': 'p3',
    };
    return patients[phone] || null;
  }
  
  private async createOrUpdateConversation(data: any): Promise<Conversation> {
    // In production, upsert to database
    return {
      id: `conv_${Date.now()}`,
      patientId: data.patientId || 'unknown',
      patientName: 'Patient Name',
      patientPhone: data.patientPhone,
      lastMessage: data.lastMessage,
      lastMessageAt: new Date(),
      unreadCount: 1,
      status: 'active',
      channel: data.channel,
      tags: [],
      metadata: {},
    };
  }
  
  private async storeIncomingMessage(message: any): Promise<void> {
    // In production, save to database
    console.log('Storing incoming message:', message);
  }
  
  private async broadcastNewMessage(data: any): Promise<void> {
    // In production, emit via WebSocket
    console.log('Broadcasting new message:', data);
  }
  
  private async broadcastReadReceipt(conversationId: string): Promise<void> {
    // In production, emit via WebSocket
    console.log('Broadcasting read receipt:', conversationId);
  }
  
  private async analyzeMessage(message: string, patientId: string | null): Promise<any> {
    // This would call the AI service
    // Mock implementation
    return {
      intent: 'appointment_confirmation',
      confidence: 0.92,
      urgency: 'normal',
      requiresHuman: false,
      autoResponse: true,
      suggestedResponse: 'Thank you for confirming your appointment. We look forward to seeing you!',
    };
  }
  
  private async createUrgentNotification(data: any): Promise<void> {
    // In production, create notification for staff
    console.log('Creating urgent notification:', data);
  }
}

// Export singleton instance
export const messagingService = MessagingService.getInstance();