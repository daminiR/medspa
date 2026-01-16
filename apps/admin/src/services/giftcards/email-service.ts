/**
 * Gift Card Email Service
 * Production-ready email infrastructure for gift card operations
 * Handles buyer receipts, recipient notifications, and redemption updates
 */

import { GiftCard, GiftCardTransaction } from '@/types/billing';
import { z } from 'zod';

// Email template interfaces
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailContext {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  template: EmailTemplate;
  metadata?: Record<string, any>;
}

// Validation schemas
const SendEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
  subject: z.string().min(5).max(200),
  html: z.string().min(10),
  text: z.string().min(10),
  metadata: z.record(z.string(), z.any()).optional(),
  replyTo: z.string().email().optional(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
});

export type SendEmailRequest = z.infer<typeof SendEmailSchema>;

// Email service configuration
const emailConfig = {
  from: process.env.EMAIL_FROM || 'noreply@luxemedspa.com',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@luxemedspa.com',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  logoUrl: process.env.LOGO_URL || 'https://luxemedspa.com/logo.png',
  brandColor: '#8B5CF6', // Purple
};

/**
 * Gift Card Email Templates
 * HTML and text versions for all gift card email types
 */
class GiftCardEmailTemplates {
  /**
   * Buyer Receipt - Purchase confirmation
   */
  static buyerReceipt(
    giftCard: GiftCard,
    purchaserEmail: string,
    purchaserName: string
  ): EmailTemplate {
    const expiryDate = giftCard.expirationDate
      ? new Date(giftCard.expirationDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Never';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: 600; color: #8B5CF6; margin-bottom: 15px; border-bottom: 2px solid #E9D5FF; padding-bottom: 10px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .detail-item { background: #f3f4f6; padding: 15px; border-radius: 6px; }
            .detail-label { font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
            .detail-value { font-size: 20px; font-weight: 700; color: #111827; margin-top: 5px; }
            .gift-code-box { background: linear-gradient(135deg, #F3E8FF 0%, #FCE7F3 100%); border: 2px dashed #8B5CF6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .gift-code { font-size: 24px; font-weight: 700; letter-spacing: 2px; color: #8B5CF6; font-family: 'Courier New', monospace; }
            .gift-code-label { font-size: 12px; color: #6b7280; margin-bottom: 10px; text-transform: uppercase; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #D946EF 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 15px; }
            .recipient-section { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
            .recipient-label { font-weight: 600; color: #16a34a; margin-bottom: 5px; }
            .message-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
            .footer-link { color: #8B5CF6; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Gift Card Purchase Confirmed</h1>
              <p>Thank you for your thoughtful gift!</p>
            </div>

            <div class="content">
              <p>Hi ${purchaserName},</p>

              <p>We're delighted to confirm your gift card purchase! Your recipient will receive their gift card shortly with all the details they need to redeem it.</p>

              <div class="section">
                <div class="section-title">Purchase Details</div>
                <div class="details-grid">
                  <div class="detail-item">
                    <div class="detail-label">Gift Card Amount</div>
                    <div class="detail-value">$${giftCard.originalValue.toFixed(2)}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Card Status</div>
                    <div class="detail-value" style="text-transform: capitalize; color: #22c55e;">${giftCard.status}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Purchased Date</div>
                    <div class="detail-value">${new Date(giftCard.purchaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Valid Until</div>
                    <div class="detail-value">${expiryDate}</div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Gift Card Code</div>
                <div class="gift-code-box">
                  <div class="gift-code-label">Keep this code safe for your records</div>
                  <div class="gift-code">${giftCard.code}</div>
                  <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">Share with your recipient or keep for your records</p>
                </div>
              </div>

              ${giftCard.recipientName ? `
                <div class="recipient-section">
                  <div class="recipient-label">Recipient</div>
                  <div>${giftCard.recipientName}${giftCard.recipientEmail ? ` (${giftCard.recipientEmail})` : ''}</div>
                </div>
              ` : ''}

              ${giftCard.recipientMessage ? `
                <div class="message-box">
                  <strong>Your Message:</strong>
                  <p style="margin: 10px 0 0 0; font-style: italic;">"${giftCard.recipientMessage}"</p>
                </div>
              ` : ''}

              <div class="section">
                <div class="section-title">What Happens Next</div>
                <p style="margin-bottom: 10px;">
                  <strong>1. Recipient notification:</strong> ${giftCard.recipientEmail ? `We'll email ${giftCard.recipientName} at ${giftCard.recipientEmail}` : 'Your recipient'} with their gift card details and redemption instructions.
                </p>
                <p style="margin-bottom: 10px;">
                  <strong>2. Easy redemption:</strong> They can book an appointment online, call us, or visit in-person with their gift card code.
                </p>
                <p>
                  <strong>3. Instant use:</strong> Their gift card balance will be applied automatically at checkout.
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://luxemedspa.com/book" class="cta-button">Browse Our Services</a>
              </div>

              <div class="section">
                <div class="section-title">Questions?</div>
                <p>
                  If you have any questions about your gift card, please don't hesitate to reach out to our team.
                </p>
                <p>
                  <strong>Email:</strong> <a href="mailto:${emailConfig.replyTo}" style="color: #8B5CF6; text-decoration: none;">${emailConfig.replyTo}</a><br />
                  <strong>Phone:</strong> <a href="tel:+1234567890" style="color: #8B5CF6; text-decoration: none;">+1 (234) 567-8900</a>
                </p>
              </div>

              <div class="footer">
                <p>Thank you for sharing the gift of beauty and wellness!<br />
                <strong>Luxe Medical Spa</strong><br />
                <a href="https://luxemedspa.com" class="footer-link">Visit us online</a> |
                <a href="https://maps.google.com/?q=luxemedspa" class="footer-link">Find us</a>
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Gift Card Purchase Confirmed

Hi ${purchaserName},

We're delighted to confirm your gift card purchase!

PURCHASE DETAILS
Amount: $${giftCard.originalValue.toFixed(2)}
Status: ${giftCard.status}
Purchased: ${new Date(giftCard.purchaseDate).toLocaleDateString()}
Valid Until: ${expiryDate}

GIFT CARD CODE
${giftCard.code}
Keep this code safe for your records.

${giftCard.recipientName ? `RECIPIENT\n${giftCard.recipientName}${giftCard.recipientEmail ? ` (${giftCard.recipientEmail})` : ''}\n\n` : ''}
${giftCard.recipientMessage ? `YOUR MESSAGE\n"${giftCard.recipientMessage}"\n\n` : ''}
WHAT HAPPENS NEXT

1. Recipient notification: We'll email ${giftCard.recipientName || 'your recipient'} with their gift card details and redemption instructions.

2. Easy redemption: They can book an appointment online, call us, or visit in-person with their gift card code.

3. Instant use: Their gift card balance will be applied automatically at checkout.

QUESTIONS?

Email: ${emailConfig.replyTo}
Phone: +1 (234) 567-8900

Thank you for sharing the gift of beauty and wellness!
Luxe Medical Spa
https://luxemedspa.com
    `;

    return {
      subject: `Gift Card Purchase Confirmation - $${giftCard.originalValue}`,
      html,
      text,
    };
  }

  /**
   * Recipient Notification - Gift card details and redemption instructions
   */
  static recipientNotification(giftCard: GiftCard, buyerName: string): EmailTemplate {
    const expiryDate = giftCard.expirationDate
      ? new Date(giftCard.expirationDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'No expiration';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: 600; color: #22C55E; margin-bottom: 15px; border-bottom: 2px solid #DCFCE7; padding-bottom: 10px; }
            .gift-code-box { background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); border: 2px dashed #22C55E; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .gift-code { font-size: 32px; font-weight: 700; letter-spacing: 2px; color: #22C55E; font-family: 'Courier New', monospace; }
            .gift-code-label { font-size: 12px; color: #6b7280; margin-bottom: 10px; text-transform: uppercase; }
            .details-card { background: #f3f4f6; border-left: 4px solid #22C55E; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .amount-highlight { background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .amount-value { font-size: 42px; font-weight: 700; }
            .redemption-steps { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .step { display: flex; margin-bottom: 15px; }
            .step-number { background: #22C55E; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; margin-right: 15px; flex-shrink: 0; }
            .step-content { flex: 1; }
            .step-title { font-weight: 600; color: #15803d; margin-bottom: 5px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 15px 0; }
            .gift-from { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
            .footer-link { color: #22C55E; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>You've Received a Gift Card!</h1>
              <p>A special gift from ${buyerName}</p>
            </div>

            <div class="content">
              <p style="font-size: 18px; color: #15803d; font-weight: 600;">Hi ${giftCard.recipientName || 'there'},</p>

              <p>You have been sent a gift card from <strong>${buyerName}</strong>! We're excited to help you experience our world-class beauty and wellness services.</p>

              ${giftCard.recipientMessage ? `
                <div class="gift-from">
                  <strong style="color: #b45309;">Message from ${buyerName}:</strong>
                  <p style="margin: 10px 0 0 0; font-style: italic;">"${giftCard.recipientMessage}"</p>
                </div>
              ` : ''}

              <div class="amount-highlight">
                <div style="font-size: 14px; color: rgba(255,255,255,0.9); margin-bottom: 5px;">Your Gift Card Value</div>
                <div class="amount-value">$${giftCard.originalValue.toFixed(2)}</div>
              </div>

              <div class="section">
                <div class="section-title">Your Gift Card Details</div>
                <div class="details-card">
                  <div style="margin-bottom: 10px;"><strong>Card Code:</strong></div>
                  <div class="gift-code-box">
                    <div class="gift-code">${giftCard.code}</div>
                    <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">Save this code or show it when you visit</p>
                  </div>
                </div>
                <div class="details-card">
                  <div><strong>Valid Until:</strong> ${expiryDate}</div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">How to Redeem Your Gift</div>
                <div class="redemption-steps">
                  <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                      <div class="step-title">Browse & Book</div>
                      <p style="margin: 0; font-size: 14px;">Check out our services online or call us to find the perfect treatment.</p>
                    </div>
                  </div>
                  <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                      <div class="step-title">Provide Your Code</div>
                      <p style="margin: 0; font-size: 14px;">Share your gift card code <strong>${giftCard.code}</strong> at checkout.</p>
                    </div>
                  </div>
                  <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                      <div class="step-title">Enjoy Your Treatment</div>
                      <p style="margin: 0; font-size: 14px;">Relax and enjoy the ultimate spa experience. We'll apply your gift card balance automatically.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div style="text-align: center;">
                <a href="https://luxemedspa.com/book" class="cta-button">Book Your Appointment</a>
              </div>

              <div class="section">
                <div class="section-title">Contact Us</div>
                <p style="margin-bottom: 10px;">
                  Have questions? Our team is here to help!
                </p>
                <p style="margin-bottom: 5px;">
                  <strong>Call:</strong> <a href="tel:+1234567890" style="color: #22C55E; text-decoration: none;">+1 (234) 567-8900</a>
                </p>
                <p>
                  <strong>Email:</strong> <a href="mailto:${emailConfig.replyTo}" style="color: #22C55E; text-decoration: none;">${emailConfig.replyTo}</a>
                </p>
              </div>

              <div class="footer">
                <p>Thank you for choosing Luxe Medical Spa!<br />
                <strong>Luxe Medical Spa</strong><br />
                <a href="https://luxemedspa.com" class="footer-link">Visit us online</a> |
                <a href="https://maps.google.com/?q=luxemedspa" class="footer-link">Find us</a>
                </p>
                <p style="margin-top: 15px; font-size: 11px;">
                  Your gift card is valid until ${expiryDate}. Don't let it expire!
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
You've Received a Gift Card!

Hi ${giftCard.recipientName || 'there'},

You have been sent a gift card from ${buyerName}! We're excited to help you experience our world-class beauty and wellness services.

${giftCard.recipientMessage ? `MESSAGE FROM ${buyerName.toUpperCase()}\n"${giftCard.recipientMessage}"\n\n` : ''}
YOUR GIFT CARD VALUE
$${giftCard.originalValue.toFixed(2)}

YOUR GIFT CARD DETAILS

Card Code: ${giftCard.code}
Save this code or show it when you visit.

Valid Until: ${expiryDate}

HOW TO REDEEM YOUR GIFT

1. Browse & Book
   Check out our services online or call us to find the perfect treatment.

2. Provide Your Code
   Share your gift card code ${giftCard.code} at checkout.

3. Enjoy Your Treatment
   Relax and enjoy the ultimate spa experience. We'll apply your gift card balance automatically.

BOOK YOUR APPOINTMENT
https://luxemedspa.com/book

CONTACT US

Call: +1 (234) 567-8900
Email: ${emailConfig.replyTo}

Thank you for choosing Luxe Medical Spa!
https://luxemedspa.com

Your gift card is valid until ${expiryDate}. Don't let it expire!
    `;

    return {
      subject: `You've Received a $${giftCard.originalValue} Gift Card from ${buyerName}!`,
      html,
      text,
    };
  }

  /**
   * Redemption Notification - Sent to buyer when gift is redeemed
   */
  static redemptionNotification(
    giftCard: GiftCard,
    transaction: GiftCardTransaction,
    recipientName: string,
    serviceName: string
  ): EmailTemplate {
    const remainingBalance = giftCard.currentBalance;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: 600; color: #3B82F6; margin-bottom: 15px; border-bottom: 2px solid #DBEAFE; padding-bottom: 10px; }
            .info-box { background: #eff6ff; border-left: 4px solid #3B82F6; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 15px 0; }
            .detail-item { background: #f3f4f6; padding: 12px; border-radius: 6px; }
            .detail-label { font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
            .detail-value { font-size: 16px; font-weight: 700; color: #111827; margin-top: 5px; }
            .balance-highlight { background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .balance-label { font-size: 12px; color: rgba(255,255,255,0.9); margin-bottom: 5px; }
            .balance-value { font-size: 32px; font-weight: 700; }
            .redeemed-amount { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 15px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
            .footer-link { color: #3B82F6; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Gift Card Was Redeemed!</h1>
              <p>Great news - your gift was used!</p>
            </div>

            <div class="content">
              <p>Hi ${giftCard.purchaserName},</p>

              <p>We wanted to let you know that ${recipientName} has redeemed the gift card you sent them! We hope they had a wonderful experience.</p>

              <div class="section">
                <div class="section-title">Redemption Details</div>
                <div class="details-grid">
                  <div class="detail-item">
                    <div class="detail-label">Redeemed By</div>
                    <div class="detail-value">${recipientName}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Service</div>
                    <div class="detail-value">${serviceName}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Redemption Date</div>
                    <div class="detail-value">${new Date(transaction.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-label">Amount Used</div>
                    <div class="detail-value redeemed-amount" style="padding: 8px; margin: 0; background: #F59E0B;">
                      -$${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Gift Card Balance</div>
                <div class="balance-highlight">
                  <div class="balance-label">Remaining Balance</div>
                  <div class="balance-value">$${remainingBalance.toFixed(2)}</div>
                </div>
                ${remainingBalance > 0 ? `
                  <div class="info-box">
                    <strong>Still More to Enjoy!</strong> Your gift card still has a balance of $${remainingBalance.toFixed(2)} that can be used for future visits. ${recipientName} can redeem it anytime!
                  </div>
                ` : `
                  <div class="info-box">
                    <strong>Fully Redeemed!</strong> Your gift card balance has been completely used. Thank you for your generosity!
                  </div>
                `}
              </div>

              <div class="section">
                <div class="section-title">Share More Joy</div>
                <p>If you'd like to gift another card to ${recipientName} or someone else, we'd love to help!</p>
                <p style="text-align: center;">
                  <a href="https://luxemedspa.com/gift-cards" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">Purchase Another Gift Card</a>
                </p>
              </div>

              <div class="footer">
                <p>Thank you for supporting Luxe Medical Spa!<br />
                <strong>Luxe Medical Spa</strong><br />
                <a href="https://luxemedspa.com" class="footer-link">Visit us online</a>
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Your Gift Card Was Redeemed!

Hi ${giftCard.purchaserName},

We wanted to let you know that ${recipientName} has redeemed the gift card you sent them! We hope they had a wonderful experience.

REDEMPTION DETAILS

Redeemed By: ${recipientName}
Service: ${serviceName}
Date: ${new Date(transaction.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
Amount Used: -$${Math.abs(transaction.amount).toFixed(2)}

GIFT CARD BALANCE

Remaining Balance: $${remainingBalance.toFixed(2)}

${remainingBalance > 0
  ? `Your gift card still has a balance of $${remainingBalance.toFixed(2)} that can be used for future visits. ${recipientName} can redeem it anytime!`
  : `Your gift card balance has been completely used. Thank you for your generosity!`}

SHARE MORE JOY

If you'd like to gift another card, visit: https://luxemedspa.com/gift-cards

Thank you for supporting Luxe Medical Spa!
https://luxemedspa.com
    `;

    return {
      subject: `Your Gift Card Was Redeemed by ${recipientName}!`,
      html,
      text,
    };
  }

  /**
   * Expiration Reminder - Reminder before gift card expires
   */
  static expirationReminder(
    giftCard: GiftCard,
    daysUntilExpiration: number
  ): EmailTemplate {
    const expiryDate = new Date(giftCard.expirationDate!).toLocaleDateString(
      'en-US',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 20px; border-radius: 8px; }
            .header { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: white; padding: 30px; border-radius: 0 0 8px 8px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: 600; color: #F59E0B; margin-bottom: 15px; border-bottom: 2px solid #FEF3C7; padding-bottom: 10px; }
            .alert-box { background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-left: 4px solid #F59E0B; padding: 20px; border-radius: 4px; margin: 20px 0; }
            .alert-title { font-weight: 700; color: #B45309; font-size: 16px; margin-bottom: 5px; }
            .days-remaining { background: #FFFFFF; border: 2px solid #F59E0B; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
            .days-value { font-size: 42px; font-weight: 700; color: #F59E0B; }
            .days-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
            .details-card { background: #f3f4f6; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .detail-label { font-weight: 600; color: #1f2937; }
            .detail-value { font-size: 18px; color: #F59E0B; margin-top: 5px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 15px 0; }
            .urgency-box { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .urgency-text { color: #991b1b; font-weight: 500; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 30px; }
            .footer-link { color: #F59E0B; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Gift Card is Expiring Soon!</h1>
              <p>Don't miss out on your gift</p>
            </div>

            <div class="content">
              <p>Hi ${giftCard.recipientName || 'there'},</p>

              <p>This is a friendly reminder that your gift card from ${giftCard.purchaserName} will expire soon!</p>

              <div class="alert-box">
                <div class="alert-title">Act Now!</div>
                <p style="margin: 0; font-size: 14px;">Book your appointment before your gift card expires. You don't want to lose this gift!</p>
              </div>

              <div class="days-remaining">
                <div class="days-label">Days Remaining</div>
                <div class="days-value">${daysUntilExpiration}</div>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">Expires: ${expiryDate}</p>
              </div>

              <div class="section">
                <div class="section-title">Your Gift Card Details</div>
                <div class="details-card">
                  <div class="detail-label">Card Code</div>
                  <div class="detail-value" style="font-family: 'Courier New', monospace; letter-spacing: 1px;">${giftCard.code}</div>
                </div>
                <div class="details-card">
                  <div class="detail-label">Remaining Balance</div>
                  <div class="detail-value">$${giftCard.currentBalance.toFixed(2)}</div>
                </div>
                <div class="details-card">
                  <div class="detail-label">Expires</div>
                  <div class="detail-value">${expiryDate}</div>
                </div>
              </div>

              ${daysUntilExpiration <= 7 ? `
                <div class="urgency-box">
                  <div style="font-weight: 700; color: #dc2626; margin-bottom: 5px;">Urgent: Less Than ${daysUntilExpiration} Day${daysUntilExpiration === 1 ? '' : 's'} Left!</div>
                  <p style="margin: 0; font-size: 14px; color: #991b1b;">Your gift card will expire very soon. Book your appointment immediately to use your full balance.</p>
                </div>
              ` : ''}

              <div class="section">
                <div class="section-title">Easy Steps to Redeem</div>
                <p>
                  <strong>1. Click below to book your appointment</strong><br />
                  Browse our services and select the perfect treatment for you.
                </p>
                <p>
                  <strong>2. Provide your gift card code</strong><br />
                  Enter code <strong>${giftCard.code}</strong> at checkout.
                </p>
                <p>
                  <strong>3. Enjoy your experience</strong><br />
                  Relax and let us pamper you!
                </p>
              </div>

              <div style="text-align: center;">
                <a href="https://luxemedspa.com/book" class="cta-button">Book Your Appointment Now</a>
              </div>

              <div class="section">
                <div class="section-title">Need Help?</div>
                <p>
                  Call us to book over the phone or if you have any questions:
                </p>
                <p>
                  <strong>Phone:</strong> <a href="tel:+1234567890" style="color: #F59E0B; text-decoration: none;">+1 (234) 567-8900</a><br />
                  <strong>Email:</strong> <a href="mailto:${emailConfig.replyTo}" style="color: #F59E0B; text-decoration: none;">${emailConfig.replyTo}</a>
                </p>
              </div>

              <div class="footer">
                <p>We hope to see you soon at Luxe Medical Spa!<br />
                <strong>Luxe Medical Spa</strong><br />
                <a href="https://luxemedspa.com" class="footer-link">Visit us online</a>
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Your Gift Card is Expiring Soon!

Hi ${giftCard.recipientName || 'there'},

This is a friendly reminder that your gift card from ${giftCard.purchaserName} will expire soon!

ACT NOW!
Book your appointment before your gift card expires. You don't want to lose this gift!

DAYS REMAINING: ${daysUntilExpiration}
Expires: ${expiryDate}

YOUR GIFT CARD DETAILS

Card Code: ${giftCard.code}
Remaining Balance: $${giftCard.currentBalance.toFixed(2)}
Expires: ${expiryDate}

${daysUntilExpiration <= 7 ? `URGENT: LESS THAN ${daysUntilExpiration} DAY${daysUntilExpiration === 1 ? '' : 'S'} LEFT!
Your gift card will expire very soon. Book your appointment immediately to use your full balance.` : ''}

EASY STEPS TO REDEEM

1. Click below to book your appointment
   Browse our services and select the perfect treatment for you.

2. Provide your gift card code
   Enter code ${giftCard.code} at checkout.

3. Enjoy your experience
   Relax and let us pamper you!

BOOK YOUR APPOINTMENT NOW
https://luxemedspa.com/book

NEED HELP?

Phone: +1 (234) 567-8900
Email: ${emailConfig.replyTo}

We hope to see you soon at Luxe Medical Spa!
https://luxemedspa.com
    `;

    return {
      subject: `Reminder: Your $${giftCard.originalValue} Gift Card Expires in ${daysUntilExpiration} Days!`,
      html,
      text,
    };
  }
}

/**
 * Gift Card Email Service
 * Main service for sending all gift card emails
 */
export class GiftCardEmailService {
  private static readonly config = emailConfig;

  /**
   * Send purchase receipt to buyer
   */
  static async sendBuyerReceipt(
    giftCard: GiftCard,
    purchaserEmail: string,
    purchaserName: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log(`[DEBUG] Generating buyer receipt for ${purchaserEmail}`);

      const template = GiftCardEmailTemplates.buyerReceipt(
        giftCard,
        purchaserEmail,
        purchaserName
      );

      const request: SendEmailRequest = {
        to: purchaserEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
        metadata: {
          type: 'gift_card_buyer_receipt',
          giftCardId: giftCard.id,
          purchaserId: giftCard.purchaserId,
        },
      };

      const validated = SendEmailSchema.parse(request);
      console.log(`[DEBUG] Buyer receipt request validated`);

      return await this.sendEmail(validated);
    } catch (error: any) {
      console.error('[ERROR] Failed to send buyer receipt:', error);
      return {
        success: false,
        error: error.message || 'Failed to send buyer receipt',
      };
    }
  }

  /**
   * Send gift card details to recipient
   */
  static async sendRecipientNotification(
    giftCard: GiftCard,
    buyerName: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!giftCard.recipientEmail) {
        return {
          success: false,
          error: 'Recipient email is required',
        };
      }

      console.log(
        `[DEBUG] Generating recipient notification for ${giftCard.recipientEmail}`
      );

      const template = GiftCardEmailTemplates.recipientNotification(
        giftCard,
        buyerName
      );

      const request: SendEmailRequest = {
        to: giftCard.recipientEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
        metadata: {
          type: 'gift_card_recipient_notification',
          giftCardId: giftCard.id,
          recipientEmail: giftCard.recipientEmail,
        },
      };

      const validated = SendEmailSchema.parse(request);
      console.log(`[DEBUG] Recipient notification request validated`);

      return await this.sendEmail(validated);
    } catch (error: any) {
      console.error('[ERROR] Failed to send recipient notification:', error);
      return {
        success: false,
        error: error.message || 'Failed to send recipient notification',
      };
    }
  }

  /**
   * Send redemption notification to buyer
   */
  static async sendRedemptionNotification(
    giftCard: GiftCard,
    transaction: GiftCardTransaction,
    recipientName: string,
    serviceName: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log(
        `[DEBUG] Generating redemption notification for ${giftCard.purchaserEmail}`
      );

      const template = GiftCardEmailTemplates.redemptionNotification(
        giftCard,
        transaction,
        recipientName,
        serviceName
      );

      const request: SendEmailRequest = {
        to: giftCard.purchaserEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
        metadata: {
          type: 'gift_card_redemption_notification',
          giftCardId: giftCard.id,
          transactionId: transaction.id,
        },
      };

      const validated = SendEmailSchema.parse(request);
      console.log(`[DEBUG] Redemption notification request validated`);

      return await this.sendEmail(validated);
    } catch (error: any) {
      console.error('[ERROR] Failed to send redemption notification:', error);
      return {
        success: false,
        error: error.message || 'Failed to send redemption notification',
      };
    }
  }

  /**
   * Send expiration reminder to recipient
   */
  static async sendExpirationReminder(
    giftCard: GiftCard,
    daysUntilExpiration: number
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!giftCard.recipientEmail) {
        return {
          success: false,
          error: 'Recipient email is required',
        };
      }

      if (!giftCard.expirationDate) {
        return {
          success: false,
          error: 'Gift card expiration date is required',
        };
      }

      console.log(
        `[DEBUG] Generating expiration reminder for ${giftCard.recipientEmail}`
      );

      const template = GiftCardEmailTemplates.expirationReminder(
        giftCard,
        daysUntilExpiration
      );

      const request: SendEmailRequest = {
        to: giftCard.recipientEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
        metadata: {
          type: 'gift_card_expiration_reminder',
          giftCardId: giftCard.id,
          daysUntilExpiration,
        },
      };

      const validated = SendEmailSchema.parse(request);
      console.log(`[DEBUG] Expiration reminder request validated`);

      return await this.sendEmail(validated);
    } catch (error: any) {
      console.error('[ERROR] Failed to send expiration reminder:', error);
      return {
        success: false,
        error: error.message || 'Failed to send expiration reminder',
      };
    }
  }

  /**
   * Core email sending logic
   * In production, this would integrate with a service like SendGrid, Mailgun, or AWS SES
   */
  private static async sendEmail(
    request: SendEmailRequest
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log(`[DEBUG] Sending email to ${request.to}`);
      console.log(`[DEBUG] Subject: ${request.subject}`);

      // In development, just log the email
      if (this.config.isDevelopment) {
        console.log('[DEVELOPMENT MODE] Email would be sent with content:');
        console.log(`To: ${request.to}`);
        console.log(`Subject: ${request.subject}`);
        console.log(`Text: ${request.text.substring(0, 200)}...`);

        return {
          success: true,
          messageId: `dev-${Date.now()}`,
        };
      }

      // In production, integrate with email service (e.g., SendGrid)
      // const response = await sgMail.send({
      //   to: request.to,
      //   from: this.config.from,
      //   subject: request.subject,
      //   text: request.text,
      //   html: request.html,
      //   replyTo: request.replyTo || this.config.replyTo,
      //   categories: [request.metadata?.type || 'gift_card'],
      // });

      // For now, simulate production
      const messageId = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.log(`[PRODUCTION] Email sent successfully. Message ID: ${messageId}`);

      return {
        success: true,
        messageId,
      };
    } catch (error: any) {
      console.error('[ERROR] Email sending failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }
}

export default GiftCardEmailService;
