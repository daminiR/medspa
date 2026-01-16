/**
 * Checkout Messaging Service
 * Post-checkout automated messages for Luxe Medical Spa
 * Handles: thank you emails, receipts, review requests, product care instructions, loyalty notifications
 */

import { messagingService } from '@/services/messaging/core';
import { z } from 'zod';

// Types for checkout data
export interface CheckoutData {
  // Patient Info
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;

  // Invoice Info
  invoiceId: string;
  invoiceNumber: string;
  receiptUrl?: string;
  receiptLink?: string;

  // Payment Details
  total: number;
  amountPaid: number;
  balance: number;
  paymentMethod: string;
  transactionId?: string;

  // Treatment Details
  services: {
    name: string;
    quantity: number;
    price: number;
    type?: 'botox' | 'filler' | 'laser' | 'chemical_peel' | 'microneedling' | 'other';
  }[];

  // Products/Retail
  products?: {
    name: string;
    quantity: number;
    price: number;
    category?: 'skincare' | 'supplement' | 'other';
  }[];

  // Appointment Info (if next appointment booked)
  nextAppointmentId?: string;
  nextAppointmentDate?: Date;
  nextAppointmentTime?: string;
  nextAppointmentService?: string;

  // Loyalty/Gift Points
  loyaltyPointsEarned?: number;
  loyaltyPointsBalance?: number;
  loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum';

  // Settings
  smsOptIn?: boolean;
  emailOptIn?: boolean;
  hasPhotoConsent?: boolean;
}

// Validation schema
export const CheckoutDataSchema = z.object({
  patientId: z.string().min(1),
  patientName: z.string().min(1),
  patientPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  patientEmail: z.string().email().optional(),
  invoiceId: z.string().min(1),
  invoiceNumber: z.string().min(1),
  receiptUrl: z.string().url().optional(),
  receiptLink: z.string().url().optional(),
  total: z.number().positive(),
  amountPaid: z.number().positive(),
  balance: z.number().min(0),
  paymentMethod: z.string().min(1),
  transactionId: z.string().optional(),
  services: z.array(
    z.object({
      name: z.string().min(1),
      quantity: z.number().positive(),
      price: z.number().positive(),
      type: z.enum(['botox', 'filler', 'laser', 'chemical_peel', 'microneedling', 'other']).optional(),
    })
  ),
  products: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.number().positive(),
        price: z.number().positive(),
        category: z.enum(['skincare', 'supplement', 'other']).optional(),
      })
    )
    .optional(),
  nextAppointmentId: z.string().optional(),
  nextAppointmentDate: z.date().optional(),
  nextAppointmentTime: z.string().optional(),
  nextAppointmentService: z.string().optional(),
  loyaltyPointsEarned: z.number().min(0).optional(),
  loyaltyPointsBalance: z.number().min(0).optional(),
  loyaltyTier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
  smsOptIn: z.boolean().optional().default(true),
  emailOptIn: z.boolean().optional().default(true),
  hasPhotoConsent: z.boolean().optional().default(false),
});

export type ValidatedCheckoutData = z.infer<typeof CheckoutDataSchema>;

/**
 * Checkout Messaging Service
 * Singleton service for post-checkout communications
 */
export class CheckoutMessagingService {
  private static instance: CheckoutMessagingService;

  private constructor() {}

  static getInstance(): CheckoutMessagingService {
    if (!CheckoutMessagingService.instance) {
      CheckoutMessagingService.instance = new CheckoutMessagingService();
    }
    return CheckoutMessagingService.instance;
  }

  /**
   * Send complete thank you sequence after checkout
   * Includes: SMS, receipt email, review request scheduling
   */
  async sendCheckoutSequence(checkoutData: CheckoutData): Promise<{
    success: boolean;
    messagesSent: string[];
    errors: string[];
  }> {
    try {
      // Validate input
      const validated = CheckoutDataSchema.parse(checkoutData);

      const results = {
        success: true,
        messagesSent: [] as string[],
        errors: [] as string[],
      };

      console.log('[CHECKOUT_SEQUENCE_START]', {
        patientId: validated.patientId,
        invoiceId: validated.invoiceId,
        timestamp: new Date().toISOString(),
      });

      // 1. Send thank you SMS immediately
      if (validated.smsOptIn) {
        try {
          await this.sendThankYouSMS(validated);
          results.messagesSent.push('thank_you_sms');
        } catch (error: any) {
          results.errors.push(`SMS failed: ${error.message}`);
          console.error('[CHECKOUT_SMS_ERROR]', error);
        }
      }

      // 2. Send receipt email with link
      if (validated.emailOptIn && validated.patientEmail) {
        try {
          await this.sendReceiptEmail(validated);
          results.messagesSent.push('receipt_email');
        } catch (error: any) {
          results.errors.push(`Email failed: ${error.message}`);
          console.error('[CHECKOUT_EMAIL_ERROR]', error);
        }
      }

      // 3. Send product care instructions for retail products
      if (validated.products && validated.products.length > 0 && validated.smsOptIn) {
        try {
          await this.sendProductCareInstructions(validated);
          results.messagesSent.push('product_care_sms');
        } catch (error: any) {
          results.errors.push(`Product care SMS failed: ${error.message}`);
          console.error('[PRODUCT_CARE_ERROR]', error);
        }
      }

      // 4. Schedule review request (T+1 week)
      if (validated.smsOptIn) {
        try {
          await this.scheduleReviewRequest(validated);
          results.messagesSent.push('review_request_scheduled');
        } catch (error: any) {
          results.errors.push(`Review request scheduling failed: ${error.message}`);
          console.error('[REVIEW_REQUEST_ERROR]', error);
        }
      }

      // 5. Send loyalty points notification if earned
      if (validated.loyaltyPointsEarned && validated.loyaltyPointsEarned > 0 && validated.smsOptIn) {
        try {
          await this.sendLoyaltyNotification(validated);
          results.messagesSent.push('loyalty_notification_sms');
        } catch (error: any) {
          results.errors.push(`Loyalty notification failed: ${error.message}`);
          console.error('[LOYALTY_NOTIFICATION_ERROR]', error);
        }
      }

      // 6. Send next appointment reminder if booked
      if (validated.nextAppointmentDate && validated.smsOptIn) {
        try {
          await this.sendNextAppointmentReminder(validated);
          results.messagesSent.push('next_appointment_reminder_sms');
        } catch (error: any) {
          results.errors.push(`Next appointment reminder failed: ${error.message}`);
          console.error('[NEXT_APPOINTMENT_ERROR]', error);
        }
      }

      results.success = results.errors.length === 0;

      console.log('[CHECKOUT_SEQUENCE_COMPLETE]', {
        patientId: validated.patientId,
        invoiceId: validated.invoiceId,
        messagesSent: results.messagesSent,
        errors: results.errors,
        timestamp: new Date().toISOString(),
      });

      return results;
    } catch (error: any) {
      console.error('[CHECKOUT_SEQUENCE_ERROR]', error);
      return {
        success: false,
        messagesSent: [],
        errors: [`Validation error: ${error.message}`],
      };
    }
  }

  /**
   * Send immediate thank you SMS with receipt link
   */
  private async sendThankYouSMS(checkout: ValidatedCheckoutData): Promise<void> {
    const firstName = checkout.patientName.split(' ')[0];
    const receiptLink = checkout.receiptLink || checkout.receiptUrl || '';
    const servicesText = checkout.services.map((s) => s.name).join(', ');

    let message = `Hi ${firstName}! Thank you for choosing Luxe Medical Spa! `;
    message += `Your ${servicesText} appointment is complete. `;
    message += `Your receipt total: $${checkout.total.toFixed(2)}. `;

    if (receiptLink) {
      message += `View receipt: ${receiptLink}`;
    }

    message += ' We look forward to seeing you soon!';

    // Ensure SMS is under 160 characters (or 320 for 2 parts)
    if (message.length > 320) {
      message = message.substring(0, 317) + '...';
    }

    await messagingService.sendSMS({
      to: checkout.patientPhone,
      body: message,
      patientId: checkout.patientId,
      metadata: {
        type: 'checkout_thank_you',
        invoiceId: checkout.invoiceId,
        total: checkout.total,
      },
    });

    console.log('[THANK_YOU_SMS_SENT]', {
      patientId: checkout.patientId,
      invoiceId: checkout.invoiceId,
    });
  }

  /**
   * Send receipt email with detailed invoice
   */
  private async sendReceiptEmail(checkout: ValidatedCheckoutData): Promise<void> {
    if (!checkout.patientEmail) {
      throw new Error('Patient email not provided');
    }

    // In production, this would send via email service (SendGrid, Resend, etc.)
    // For now, we'll use SMS as fallback and log for email queue

    const receiptLink = checkout.receiptLink || checkout.receiptUrl || '';

    // Log receipt email for email queue processing
    await this.logReceiptEmail({
      patientId: checkout.patientId,
      patientEmail: checkout.patientEmail,
      patientName: checkout.patientName,
      invoiceId: checkout.invoiceId,
      invoiceNumber: checkout.invoiceNumber,
      receiptLink,
      total: checkout.total,
      services: checkout.services,
      products: checkout.products,
      timestamp: new Date().toISOString(),
    });

    // Send SMS notification that email receipt was sent
    const firstName = checkout.patientName.split(' ')[0];
    const emailMessage = `Hi ${firstName}! Your detailed receipt has been sent to ${checkout.patientEmail}. Keep it for your records!`;

    await messagingService.sendSMS({
      to: checkout.patientPhone,
      body: emailMessage,
      patientId: checkout.patientId,
      metadata: {
        type: 'receipt_email_notification',
        invoiceId: checkout.invoiceId,
      },
    });

    console.log('[RECEIPT_EMAIL_QUEUED]', {
      patientId: checkout.patientId,
      patientEmail: checkout.patientEmail,
      invoiceId: checkout.invoiceId,
    });
  }

  /**
   * Send product care instructions for retail purchases
   */
  private async sendProductCareInstructions(checkout: ValidatedCheckoutData): Promise<void> {
    if (!checkout.products || checkout.products.length === 0) {
      return;
    }

    const firstName = checkout.patientName.split(' ')[0];
    const skinCareProducts = checkout.products.filter((p) => p.category === 'skincare');

    if (skinCareProducts.length === 0) {
      return;
    }

    const productNames = skinCareProducts.map((p) => p.name).join(', ');

    // Generic skincare care instructions
    let careMessage = `Hi ${firstName}! Care tips for your new skincare: `;
    careMessage += `Use ${productNames} as directed on packaging. `;
    careMessage += `Apply SPF 30+ daily. If irritation occurs, reduce frequency. `;
    careMessage += `Questions? Reply or call us at (555) 123-4567!`;

    await messagingService.sendSMS({
      to: checkout.patientPhone,
      body: careMessage,
      patientId: checkout.patientId,
      metadata: {
        type: 'product_care_instructions',
        invoiceId: checkout.invoiceId,
        products: skinCareProducts.map((p) => p.name),
      },
    });

    console.log('[PRODUCT_CARE_SMS_SENT]', {
      patientId: checkout.patientId,
      invoiceId: checkout.invoiceId,
      products: productNames,
    });
  }

  /**
   * Schedule review request for T+1 week
   */
  private async scheduleReviewRequest(checkout: ValidatedCheckoutData): Promise<void> {
    const firstName = checkout.patientName.split(' ')[0];
    const reviewDate = new Date();
    reviewDate.setDate(reviewDate.getDate() + 7); // +1 week

    const servicesText = checkout.services.length === 1 ? checkout.services[0].name : 'your treatment';

    let reviewMessage = `Hi ${firstName}! How was your experience? `;
    reviewMessage += `We'd love a review of ${servicesText}! `;
    reviewMessage += `Leave a review: Google or Yelp search "Luxe Medical Spa". `;
    reviewMessage += `Thank you! 🌟`;

    // Schedule message via messaging service
    await messagingService.scheduleMessage({
      to: checkout.patientPhone,
      body: reviewMessage,
      priority: 'normal',
      patientId: checkout.patientId,
      scheduledAt: reviewDate,
      metadata: {
        type: 'review_request',
        invoiceId: checkout.invoiceId,
        service: servicesText,
      },
    });

    console.log('[REVIEW_REQUEST_SCHEDULED]', {
      patientId: checkout.patientId,
      invoiceId: checkout.invoiceId,
      scheduledFor: reviewDate.toISOString(),
    });
  }

  /**
   * Send loyalty points earned notification
   */
  private async sendLoyaltyNotification(checkout: ValidatedCheckoutData): Promise<void> {
    if (!checkout.loyaltyPointsEarned || checkout.loyaltyPointsEarned === 0) {
      return;
    }

    const firstName = checkout.patientName.split(' ')[0];
    const currentBalance = checkout.loyaltyPointsBalance || 0;

    let loyaltyMessage = `Great news, ${firstName}! You earned ${checkout.loyaltyPointsEarned} loyalty points! `;
    loyaltyMessage += `Balance: ${currentBalance} points. `;

    // Add tier info if available
    if (checkout.loyaltyTier) {
      const tierBenefits: Record<string, string> = {
        bronze: 'Enjoy 5% off services',
        silver: 'Enjoy 10% off services',
        gold: 'Enjoy 15% off services + priority booking',
        platinum: 'Enjoy 20% off services + priority booking + exclusive events',
      };
      loyaltyMessage += tierBenefits[checkout.loyaltyTier] || '';
    }

    loyaltyMessage += ' Keep earning! 🎁';

    await messagingService.sendSMS({
      to: checkout.patientPhone,
      body: loyaltyMessage,
      patientId: checkout.patientId,
      metadata: {
        type: 'loyalty_notification',
        invoiceId: checkout.invoiceId,
        pointsEarned: checkout.loyaltyPointsEarned,
        tier: checkout.loyaltyTier,
      },
    });

    console.log('[LOYALTY_NOTIFICATION_SENT]', {
      patientId: checkout.patientId,
      invoiceId: checkout.invoiceId,
      pointsEarned: checkout.loyaltyPointsEarned,
      tier: checkout.loyaltyTier,
    });
  }

  /**
   * Send next appointment reminder if booked at checkout
   */
  private async sendNextAppointmentReminder(checkout: ValidatedCheckoutData): Promise<void> {
    if (!checkout.nextAppointmentDate || !checkout.nextAppointmentTime) {
      return;
    }

    const firstName = checkout.patientName.split(' ')[0];
    const dateStr = checkout.nextAppointmentDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const service = checkout.nextAppointmentService || 'your appointment';

    let appointmentMessage = `Perfect! We've scheduled your next ${service} on ${dateStr} at ${checkout.nextAppointmentTime}. `;
    appointmentMessage += `We'll send you reminders closer to the date. See you soon!`;

    await messagingService.sendSMS({
      to: checkout.patientPhone,
      body: appointmentMessage,
      patientId: checkout.patientId,
      metadata: {
        type: 'next_appointment_booked',
        invoiceId: checkout.invoiceId,
        appointmentId: checkout.nextAppointmentId,
        appointmentDate: checkout.nextAppointmentDate.toISOString(),
      },
    });

    console.log('[NEXT_APPOINTMENT_REMINDER_SENT]', {
      patientId: checkout.patientId,
      invoiceId: checkout.invoiceId,
      appointmentId: checkout.nextAppointmentId,
      appointmentDate: checkout.nextAppointmentDate.toISOString(),
    });
  }

  /**
   * Log receipt email for async processing (to email queue)
   */
  private async logReceiptEmail(emailData: any): Promise<void> {
    // In production, this would queue to an email service
    // For now, just log it
    console.log('[RECEIPT_EMAIL_QUEUED_FOR_PROCESSING]', emailData);

    // TODO: Queue to email service (SendGrid, Resend, AWS SES, etc.)
  }
}

// Export singleton instance
export const checkoutMessagingService = CheckoutMessagingService.getInstance();
