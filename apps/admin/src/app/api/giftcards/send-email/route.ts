/**
 * Gift Card Email API Route
 * POST /api/giftcards/send-email
 *
 * Handles sending all gift card related emails:
 * - Buyer receipt (purchase confirmation)
 * - Recipient notification (card details + redemption instructions)
 * - Redemption notification (when gift is redeemed)
 * - Expiration reminder (before card expires)
 */

import { NextRequest, NextResponse } from 'next/server';
import { GiftCardEmailService } from '@/services/giftcards/email-service';
import { GiftCard, GiftCardTransaction } from '@/types/billing';
import { z } from 'zod';

// Request validation schemas
const BuyerReceiptSchema = z.object({
  type: z.literal('buyer_receipt'),
  giftCard: z.object({
    id: z.string(),
    code: z.string(),
    originalValue: z.number(),
    currentBalance: z.number(),
    purchaseDate: z.coerce.date(),
    expirationDate: z.coerce.date().optional(),
    recipientName: z.string().optional(),
    recipientEmail: z.string().email().optional(),
    recipientMessage: z.string().optional(),
    purchaserName: z.string(),
    purchaserEmail: z.string().email(),
    status: z.enum(['active', 'depleted', 'expired', 'cancelled', 'pending']),
    transactions: z.array(z.any()),
    purchaserId: z.string().optional(),
    design: z.string().optional(),
    activationDate: z.coerce.date().optional(),
    scheduledDate: z.coerce.date().optional(),
  }),
  purchaserEmail: z.string().email(),
  purchaserName: z.string(),
});

const RecipientNotificationSchema = z.object({
  type: z.literal('recipient_notification'),
  giftCard: z.object({
    id: z.string(),
    code: z.string(),
    originalValue: z.number(),
    currentBalance: z.number(),
    purchaseDate: z.coerce.date(),
    expirationDate: z.coerce.date().optional(),
    recipientName: z.string(),
    recipientEmail: z.string().email(),
    recipientMessage: z.string().optional(),
    purchaserName: z.string(),
    purchaserEmail: z.string().email(),
    status: z.enum(['active', 'depleted', 'expired', 'cancelled', 'pending']),
    transactions: z.array(z.any()),
    purchaserId: z.string().optional(),
    design: z.string().optional(),
    activationDate: z.coerce.date().optional(),
    scheduledDate: z.coerce.date().optional(),
  }),
  buyerName: z.string(),
});

const RedemptionNotificationSchema = z.object({
  type: z.literal('redemption_notification'),
  giftCard: z.object({
    id: z.string(),
    code: z.string(),
    originalValue: z.number(),
    currentBalance: z.number(),
    purchaseDate: z.coerce.date(),
    expirationDate: z.coerce.date().optional(),
    recipientName: z.string().optional(),
    recipientEmail: z.string().email().optional(),
    purchaserName: z.string(),
    purchaserEmail: z.string().email(),
    status: z.enum(['active', 'depleted', 'expired', 'cancelled', 'pending']),
    transactions: z.array(z.any()),
    purchaserId: z.string().optional(),
    design: z.string().optional(),
    activationDate: z.coerce.date().optional(),
    scheduledDate: z.coerce.date().optional(),
  }),
  transaction: z.object({
    id: z.string(),
    date: z.coerce.date(),
    type: z.enum(['purchase', 'redemption', 'refund', 'adjustment']),
    amount: z.number(),
    balance: z.number(),
    invoiceId: z.string().optional(),
    notes: z.string().optional(),
    processedBy: z.string(),
  }),
  recipientName: z.string(),
  serviceName: z.string(),
});

const ExpirationReminderSchema = z.object({
  type: z.literal('expiration_reminder'),
  giftCard: z.object({
    id: z.string(),
    code: z.string(),
    originalValue: z.number(),
    currentBalance: z.number(),
    purchaseDate: z.coerce.date(),
    expirationDate: z.coerce.date(),
    recipientName: z.string(),
    recipientEmail: z.string().email(),
    purchaserName: z.string(),
    purchaserEmail: z.string().email(),
    status: z.enum(['active', 'depleted', 'expired', 'cancelled', 'pending']),
    transactions: z.array(z.any()),
    purchaserId: z.string().optional(),
    design: z.string().optional(),
    activationDate: z.coerce.date().optional(),
    scheduledDate: z.coerce.date().optional(),
  }),
  daysUntilExpiration: z.number().positive(),
});

const SendEmailSchema = z.union([
  BuyerReceiptSchema,
  RecipientNotificationSchema,
  RedemptionNotificationSchema,
  ExpirationReminderSchema,
]);

type SendEmailRequest = z.infer<typeof SendEmailSchema>;

/**
 * POST /api/giftcards/send-email
 * Send gift card emails
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[DEBUG] Received gift card email request');

    const body = await request.json();
    console.log('[DEBUG] Request body:', JSON.stringify(body, null, 2));

    // Validate request
    let validated: SendEmailRequest;
    try {
      validated = SendEmailSchema.parse(body);
      console.log('[DEBUG] Request validation passed');
    } catch (error: any) {
      console.error('[ERROR] Validation failed:', error.issues);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    let result;

    // Handle different email types
    switch (validated.type) {
      case 'buyer_receipt': {
        console.log('[DEBUG] Processing buyer_receipt email');
        const req = validated as z.infer<typeof BuyerReceiptSchema>;
        result = await GiftCardEmailService.sendBuyerReceipt(
          req.giftCard as GiftCard,
          req.purchaserEmail,
          req.purchaserName
        );
        break;
      }

      case 'recipient_notification': {
        console.log('[DEBUG] Processing recipient_notification email');
        const req = validated as z.infer<typeof RecipientNotificationSchema>;
        result = await GiftCardEmailService.sendRecipientNotification(
          req.giftCard as GiftCard,
          req.buyerName
        );
        break;
      }

      case 'redemption_notification': {
        console.log('[DEBUG] Processing redemption_notification email');
        const req = validated as z.infer<typeof RedemptionNotificationSchema>;
        result = await GiftCardEmailService.sendRedemptionNotification(
          req.giftCard as GiftCard,
          req.transaction as GiftCardTransaction,
          req.recipientName,
          req.serviceName
        );
        break;
      }

      case 'expiration_reminder': {
        console.log('[DEBUG] Processing expiration_reminder email');
        const req = validated as z.infer<typeof ExpirationReminderSchema>;
        result = await GiftCardEmailService.sendExpirationReminder(
          req.giftCard as GiftCard,
          req.daysUntilExpiration
        );
        break;
      }

      default: {
        const exhaustiveCheck: never = validated;
        return exhaustiveCheck;
      }
    }

    if (result.success) {
      console.log('[DEBUG] Email sent successfully:', result.messageId);
      return NextResponse.json(
        {
          success: true,
          messageId: result.messageId,
          type: validated.type,
        },
        { status: 200 }
      );
    } else {
      console.error('[ERROR] Email sending failed:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send email',
          type: validated.type,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[ERROR] Unexpected error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}
