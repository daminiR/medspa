/**
 * Auto-Close Conversations Service
 * Automatically closes inactive conversations based on configurable time thresholds
 * Medical Spa Admin Platform
 */

import { notificationService } from '../notifications';

// Configuration for auto-close durations
export interface AutoCloseConfig {
  enabled: boolean;
  closureOptions: {
    oneDay: boolean;
    threeDays: boolean;
    sevenDays: boolean;
    fourteenDays: boolean;
  };
  skipIfPendingConfirmation: boolean;
  sendNotificationBeforeClose: boolean;
  notificationHoursBefore: number; // How many hours before closing to send notification
  logClosure: boolean;
}

// Conversation data structure for auto-close operations
export interface ConversationForAutoClose {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  lastActivityAt: Date;
  lastMessageAt?: Date;
  status: 'open' | 'snoozed' | 'closed';
  channel: 'sms' | 'email' | 'web_chat' | 'phone';
  pendingConfirmation?: boolean;
  hasPendingReplies?: boolean;
  assignedTo?: string;
  tags: string[];
  unreadCount: number;
}

// Closure result tracking
export interface ConversureClosure {
  conversationId: string;
  patientId: string;
  closedAt: Date;
  reason: string;
  daysSinceLastActivity: number;
  hadPendingConfirmation: boolean;
  notificationSentBefore?: boolean;
  metadata: Record<string, any>;
}

const defaultConfig: AutoCloseConfig = {
  enabled: true,
  closureOptions: {
    oneDay: false,
    threeDays: true,
    sevenDays: true,
    fourteenDays: true,
  },
  skipIfPendingConfirmation: true,
  sendNotificationBeforeClose: true,
  notificationHoursBefore: 24, // Notify 24 hours before closing
  logClosure: true,
};

/**
 * Auto-Close Conversations Service
 * Handles automatic closure of inactive conversations
 */
export class AutoCloseConversationsService {
  private static instance: AutoCloseConversationsService;
  private config: AutoCloseConfig;
  private closureLogs: ConversureClosure[] = [];

  private constructor(config: AutoCloseConfig = defaultConfig) {
    this.config = config;
  }

  static getInstance(config?: AutoCloseConfig): AutoCloseConversationsService {
    if (!AutoCloseConversationsService.instance) {
      AutoCloseConversationsService.instance = new AutoCloseConversationsService(config);
    }
    return AutoCloseConversationsService.instance;
  }

  /**
   * Get current configuration
   */
  getConfig(): AutoCloseConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AutoCloseConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[AUTO_CLOSE_CONFIG_UPDATED]', this.config);
  }

  /**
   * Process auto-closures (called by cron job)
   */
  async processAutoClosures(): Promise<{
    success: boolean;
    closuresCount: number;
    notificationsCount: number;
    errors: string[];
    summary: Record<string, number>;
  }> {
    if (!this.config.enabled) {
      console.log('[AUTO_CLOSE] Service disabled, skipping');
      return {
        success: false,
        closuresCount: 0,
        notificationsCount: 0,
        errors: ['Auto-close service is disabled'],
        summary: {},
      };
    }

    const now = new Date();
    const errors: string[] = [];
    const summary: Record<string, number> = {
      checked: 0,
      closed: 0,
      notificationsSent: 0,
      skipped: 0,
      pendingConfirmationSkipped: 0,
    };

    try {
      console.log('[AUTO_CLOSE_START]', { timestamp: now.toISOString() });

      // Get all conversations that may need closing
      const conversations = await this.getConversationsForClosureCheck();
      summary.checked = conversations.length;

      console.log(`[AUTO_CLOSE] Found ${conversations.length} conversations to check`);

      for (const conversation of conversations) {
        try {
          await this.processConversation(conversation, now, summary);
        } catch (error: any) {
          console.error(`[AUTO_CLOSE_ERROR] Failed to process conversation ${conversation.id}:`, error);
          errors.push(`Failed to process conversation ${conversation.id}: ${error.message}`);
          summary.skipped = (summary.skipped ?? 0) + 1;
        }
      }

      console.log('[AUTO_CLOSE_COMPLETE]', {
        timestamp: new Date().toISOString(),
        summary,
      });

      return {
        success: true,
        closuresCount: summary.closed,
        notificationsCount: summary.notificationsSent,
        errors,
        summary,
      };
    } catch (error: any) {
      console.error('[AUTO_CLOSE_FATAL_ERROR]', error);
      return {
        success: false,
        closuresCount: 0,
        notificationsCount: 0,
        errors: [error.message],
        summary,
      };
    }
  }

  /**
   * Process a single conversation for auto-closure
   */
  private async processConversation(
    conversation: ConversationForAutoClose,
    now: Date,
    summary: Record<string, number>
  ): Promise<void> {
    // Skip closed conversations
    if (conversation.status === 'closed') {
      summary.skipped = (summary.skipped ?? 0) + 1;
      return;
    }

    // Skip if pending confirmation and config says to skip
    if (this.config.skipIfPendingConfirmation && conversation.pendingConfirmation) {
      console.log(`[AUTO_CLOSE_SKIP] Conversation ${conversation.id} has pending confirmation`);
      summary.pendingConfirmationSkipped = (summary.pendingConfirmationSkipped ?? 0) + 1;
      return;
    }

    const lastActivity = new Date(conversation.lastActivityAt);
    const daysSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);

    console.log(
      `[AUTO_CLOSE_CHECK] Conv ${conversation.id}: ${daysSinceLastActivity.toFixed(2)} days inactive`
    );

    // Determine if conversation should be closed based on config
    let shouldClose = false;
    let closureReason = '';
    let closureDays = 0;

    if (this.config.closureOptions.oneDay && daysSinceLastActivity >= 1 && daysSinceLastActivity < 1.5) {
      shouldClose = true;
      closureDays = 1;
      closureReason = 'Automatic closure: No activity for 1 day';
    } else if (this.config.closureOptions.threeDays && daysSinceLastActivity >= 3 && daysSinceLastActivity < 3.5) {
      shouldClose = true;
      closureDays = 3;
      closureReason = 'Automatic closure: No activity for 3 days';
    } else if (this.config.closureOptions.sevenDays && daysSinceLastActivity >= 7 && daysSinceLastActivity < 7.5) {
      shouldClose = true;
      closureDays = 7;
      closureReason = 'Automatic closure: No activity for 7 days';
    } else if (this.config.closureOptions.fourteenDays && daysSinceLastActivity >= 14 && daysSinceLastActivity < 14.5) {
      shouldClose = true;
      closureDays = 14;
      closureReason = 'Automatic closure: No activity for 14 days';
    }

    // Check if notification should be sent (few hours before auto-close threshold)
    if (
      this.config.sendNotificationBeforeClose &&
      !shouldClose &&
      this.shouldSendPreClosureNotification(daysSinceLastActivity, closureDays)
    ) {
      await this.sendPreClosureNotification(conversation);
      summary.notificationsSent = (summary.notificationsSent ?? 0) + 1;
    }

    // Close conversation if criteria met
    if (shouldClose) {
      await this.closeConversation(conversation, closureReason, daysSinceLastActivity);
      summary.closed = (summary.closed ?? 0) + 1;
    }
  }

  /**
   * Check if pre-closure notification should be sent
   */
  private shouldSendPreClosureNotification(daysSinceActivity: number, closureDays: number): boolean {
    const hoursUntilClosurethreshold = (closureDays - daysSinceActivity) * 24;
    return hoursUntilClosurethreshold <= this.config.notificationHoursBefore &&
      hoursUntilClosurethreshold > this.config.notificationHoursBefore - 1;
  }

  /**
   * Send notification before conversation is auto-closed
   */
  private async sendPreClosureNotification(conversation: ConversationForAutoClose): Promise<void> {
    try {
      const message = `We haven't heard from you in a while. Your conversation with us will close automatically in ${this.config.notificationHoursBefore} hours if you don't reply.`;

      console.log(`[AUTO_CLOSE_NOTIFICATION] Sending pre-closure notification to conversation ${conversation.id}`);

      // Send notification via messaging service
      // In production, this would use the actual messaging service
      notificationService.notify({
        type: 'warning',
        title: 'Conversation Closing Soon',
        message: `Your conversation with the clinic about ${conversation.patientName} will be closed in ${this.config.notificationHoursBefore} hours.`,
        persistent: false,
      });

      // Log the notification
      await this.logNotification({
        conversationId: conversation.id,
        patientId: conversation.patientId,
        type: 'pre_closure',
        sentAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`[AUTO_CLOSE_NOTIFICATION_ERROR] Failed to send notification:`, error);
    }
  }

  /**
   * Close a conversation
   */
  private async closeConversation(
    conversation: ConversationForAutoClose,
    reason: string,
    daysSinceLastActivity: number
  ): Promise<void> {
    try {
      const closedAt = new Date();

      console.log(`[AUTO_CLOSE_CLOSE] Closing conversation ${conversation.id}: ${reason}`);

      // Update conversation status (in production, update database)
      await this.updateConversationStatus(conversation.id, 'closed');

      // Create closure log entry
      const closureEntry: ConversureClosure = {
        conversationId: conversation.id,
        patientId: conversation.patientId,
        closedAt,
        reason,
        daysSinceLastActivity: Math.round(daysSinceLastActivity * 100) / 100,
        hadPendingConfirmation: conversation.pendingConfirmation || false,
        metadata: {
          channel: conversation.channel,
          lastMessageAt: conversation.lastMessageAt,
          patientName: conversation.patientName,
          assignedTo: conversation.assignedTo,
          tags: conversation.tags,
          unreadCount: conversation.unreadCount,
        },
      };

      // Store closure log
      this.closureLogs.push(closureEntry);
      if (this.config.logClosure) {
        await this.logClosure(closureEntry);
      }

      // Notify staff (optional)
      notificationService.notify({
        type: 'info',
        title: 'Conversation Auto-Closed',
        message: `Conversation with ${conversation.patientName} (${conversation.patientPhone}) has been automatically closed. Reason: ${reason}`,
        persistent: false,
      });

      console.log(`[AUTO_CLOSE_CLOSED]`, {
        conversationId: conversation.id,
        timestamp: closedAt.toISOString(),
        daysSinceLastActivity,
      });
    } catch (error) {
      console.error(`[AUTO_CLOSE_CLOSE_ERROR] Failed to close conversation ${conversation.id}:`, error);
      throw error;
    }
  }

  /**
   * Get closure history/logs
   */
  getClosureHistory(limit: number = 100): ConversureClosure[] {
    return this.closureLogs.slice(-limit);
  }

  /**
   * Get statistics about auto-closures
   */
  getStatistics(): {
    totalClosed: number;
    lastClosure?: ConversureClosure;
    closuresByReason: Record<string, number>;
  } {
    const closuresByReason: Record<string, number> = {};

    for (const closure of this.closureLogs) {
      closuresByReason[closure.reason] = (closuresByReason[closure.reason] ?? 0) + 1;
    }

    return {
      totalClosed: this.closureLogs.length,
      lastClosure: this.closureLogs[this.closureLogs.length - 1],
      closuresByReason,
    };
  }

  /**
   * Reopen a closed conversation (for manual override)
   */
  async reopenConversation(conversationId: string): Promise<void> {
    try {
      console.log(`[AUTO_CLOSE_REOPEN] Reopening conversation ${conversationId}`);
      await this.updateConversationStatus(conversationId, 'open');
    } catch (error) {
      console.error(`[AUTO_CLOSE_REOPEN_ERROR] Failed to reopen conversation:`, error);
      throw error;
    }
  }

  // Helper/Database methods (mock implementations)

  /**
   * Get all conversations that may need closing
   * In production, query database for open/snoozed conversations
   */
  private async getConversationsForClosureCheck(): Promise<ConversationForAutoClose[]> {
    // Mock implementation - in production, query database
    console.log('[AUTO_CLOSE_FETCH] Fetching conversations from database');
    return [];
  }

  /**
   * Update conversation status
   * In production, update database
   */
  private async updateConversationStatus(conversationId: string, status: 'open' | 'closed'): Promise<void> {
    // Mock implementation
    console.log(`[AUTO_CLOSE_DB] Updated conversation ${conversationId} status to ${status}`);
  }

  /**
   * Log closure event
   * In production, write to audit log/database
   */
  private async logClosure(closure: ConversureClosure): Promise<void> {
    console.log('[AUTO_CLOSE_LOG_CLOSURE]', {
      conversationId: closure.conversationId,
      patientId: closure.patientId,
      closedAt: closure.closedAt.toISOString(),
      reason: closure.reason,
      daysSinceLastActivity: closure.daysSinceLastActivity,
    });
  }

  /**
   * Log notification event
   * In production, write to audit log
   */
  private async logNotification(data: any): Promise<void> {
    console.log('[AUTO_CLOSE_LOG_NOTIFICATION]', data);
  }
}

// Export singleton instance
export const autoCloseConversationsService = AutoCloseConversationsService.getInstance();
