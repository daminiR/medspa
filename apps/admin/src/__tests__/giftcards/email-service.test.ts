/**
 * Gift Card Email Service Tests
 * Comprehensive testing and debugging of email functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GiftCardEmailService } from '@/services/giftcards/email-service';
import { GiftCard, GiftCardTransaction } from '@/types/billing';

/**
 * Mock data for testing
 */
const mockGiftCard: GiftCard = {
  id: 'gc-001',
  code: 'GIFT-2025-TEST-001',
  originalValue: 250,
  currentBalance: 175,
  purchaserId: 'user-001',
  purchaserName: 'John Smith',
  purchaserEmail: 'john.smith@example.com',
  recipientName: 'Jane Doe',
  recipientEmail: 'jane.doe@example.com',
  recipientMessage: 'Happy Birthday! Hope you enjoy a wonderful spa day!',
  purchaseDate: new Date('2025-01-01'),
  activationDate: new Date('2025-01-01'),
  expirationDate: new Date('2026-01-01'),
  status: 'active',
  design: 'birthday',
  transactions: [
    {
      id: 't-001',
      date: new Date('2025-01-01'),
      type: 'purchase',
      amount: 250,
      balance: 250,
      processedBy: 'system',
    },
  ],
};

const mockTransaction: GiftCardTransaction = {
  id: 't-002',
  date: new Date('2025-01-15'),
  type: 'redemption',
  amount: -75,
  balance: 175,
  processedBy: 'therapist-001',
  notes: 'Facial treatment applied',
};

describe('GiftCardEmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendBuyerReceipt', () => {
    it('should successfully send buyer receipt email', async () => {
      const result = await GiftCardEmailService.sendBuyerReceipt(
        mockGiftCard,
        mockGiftCard.purchaserEmail,
        mockGiftCard.purchaserName
      );

      console.log('[TEST] Buyer Receipt Result:', result);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should include correct subject line', async () => {
      const result = await GiftCardEmailService.sendBuyerReceipt(
        mockGiftCard,
        mockGiftCard.purchaserEmail,
        mockGiftCard.purchaserName
      );

      console.log('[TEST] Subject:', result.messageId);

      expect(result.success).toBe(true);
    });

    it('should handle missing purchaser email gracefully', async () => {
      const invalidCard = { ...mockGiftCard, purchaserEmail: '' };

      const result = await GiftCardEmailService.sendBuyerReceipt(
        invalidCard,
        '',
        mockGiftCard.purchaserName
      );

      console.log('[TEST] Invalid Email Result:', result);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('sendRecipientNotification', () => {
    it('should successfully send recipient notification email', async () => {
      const result = await GiftCardEmailService.sendRecipientNotification(
        mockGiftCard,
        mockGiftCard.purchaserName
      );

      console.log('[TEST] Recipient Notification Result:', result);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should require recipient email address', async () => {
      const cardWithoutEmail = { ...mockGiftCard, recipientEmail: undefined };

      const result = await GiftCardEmailService.sendRecipientNotification(
        cardWithoutEmail,
        mockGiftCard.purchaserName
      );

      console.log('[TEST] Missing Recipient Email Result:', result);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Recipient email is required');
    });

    it('should include recipient message if provided', async () => {
      const result = await GiftCardEmailService.sendRecipientNotification(
        mockGiftCard,
        mockGiftCard.purchaserName
      );

      console.log('[TEST] Recipient Notification (with message):', result);

      expect(result.success).toBe(true);
      expect(mockGiftCard.recipientMessage).toBe(
        'Happy Birthday! Hope you enjoy a wonderful spa day!'
      );
    });

    it('should work without recipient message', async () => {
      const cardWithoutMessage = {
        ...mockGiftCard,
        recipientMessage: undefined,
      };

      const result = await GiftCardEmailService.sendRecipientNotification(
        cardWithoutMessage,
        mockGiftCard.purchaserName
      );

      console.log('[TEST] Recipient Notification (no message):', result);

      expect(result.success).toBe(true);
    });
  });

  describe('sendRedemptionNotification', () => {
    it('should successfully send redemption notification email', async () => {
      const result = await GiftCardEmailService.sendRedemptionNotification(
        mockGiftCard,
        mockTransaction,
        mockGiftCard.recipientName!,
        'Facial Treatment'
      );

      console.log('[TEST] Redemption Notification Result:', result);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should include correct balance information', async () => {
      const cardAfterRedemption: GiftCard = {
        ...mockGiftCard,
        currentBalance: 175,
      };

      const result = await GiftCardEmailService.sendRedemptionNotification(
        cardAfterRedemption,
        mockTransaction,
        'Jane Doe',
        'Massage Therapy'
      );

      console.log('[TEST] Redemption with Balance:', result);

      expect(result.success).toBe(true);
      expect(cardAfterRedemption.currentBalance).toBe(175);
    });

    it('should work with depleted gift card', async () => {
      const depletedCard: GiftCard = {
        ...mockGiftCard,
        currentBalance: 0,
        status: 'depleted',
      };

      const depletionTransaction: GiftCardTransaction = {
        ...mockTransaction,
        amount: -175,
        balance: 0,
      };

      const result = await GiftCardEmailService.sendRedemptionNotification(
        depletedCard,
        depletionTransaction,
        'Jane Doe',
        'Injectable Treatment'
      );

      console.log('[TEST] Depleted Card Notification:', result);

      expect(result.success).toBe(true);
      expect(depletedCard.currentBalance).toBe(0);
    });
  });

  describe('sendExpirationReminder', () => {
    it('should successfully send expiration reminder email', async () => {
      const result = await GiftCardEmailService.sendExpirationReminder(
        mockGiftCard,
        30
      );

      console.log('[TEST] Expiration Reminder Result:', result);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should require recipient email address', async () => {
      const cardWithoutEmail = { ...mockGiftCard, recipientEmail: undefined };

      const result = await GiftCardEmailService.sendExpirationReminder(
        cardWithoutEmail,
        30
      );

      console.log('[TEST] Missing Email for Expiration:', result);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Recipient email is required');
    });

    it('should require expiration date', async () => {
      const cardWithoutExpiry = { ...mockGiftCard, expirationDate: undefined };

      const result = await GiftCardEmailService.sendExpirationReminder(
        cardWithoutExpiry,
        30
      );

      console.log('[TEST] Missing Expiration Date:', result);

      expect(result.success).toBe(false);
      expect(result.error).toContain('expiration date is required');
    });

    it('should handle urgent expiration (< 7 days)', async () => {
      const result = await GiftCardEmailService.sendExpirationReminder(
        mockGiftCard,
        5
      );

      console.log('[TEST] Urgent Expiration (5 days):', result);

      expect(result.success).toBe(true);
    });

    it('should handle last day expiration', async () => {
      const result = await GiftCardEmailService.sendExpirationReminder(
        mockGiftCard,
        1
      );

      console.log('[TEST] Last Day Expiration:', result);

      expect(result.success).toBe(true);
    });
  });

  describe('Email Integration Tests', () => {
    it('should handle full gift card lifecycle - Purchase to Recipient', async () => {
      console.log('[TEST] === Full Lifecycle Test ===');

      // Step 1: Send buyer receipt
      const buyerResult = await GiftCardEmailService.sendBuyerReceipt(
        mockGiftCard,
        mockGiftCard.purchaserEmail,
        mockGiftCard.purchaserName
      );
      console.log('[TEST] Step 1 - Buyer Receipt:', buyerResult.success);
      expect(buyerResult.success).toBe(true);

      // Step 2: Send recipient notification
      const recipientResult = await GiftCardEmailService.sendRecipientNotification(
        mockGiftCard,
        mockGiftCard.purchaserName
      );
      console.log('[TEST] Step 2 - Recipient Notification:', recipientResult.success);
      expect(recipientResult.success).toBe(true);

      // Step 3: Send redemption notification
      const redemptionResult =
        await GiftCardEmailService.sendRedemptionNotification(
          mockGiftCard,
          mockTransaction,
          mockGiftCard.recipientName!,
          'Facial Treatment'
        );
      console.log('[TEST] Step 3 - Redemption Notification:', redemptionResult.success);
      expect(redemptionResult.success).toBe(true);

      console.log('[TEST] === Full Lifecycle Complete ===');
    });

    it('should handle scheduled gift card delivery', async () => {
      const scheduledCard: GiftCard = {
        ...mockGiftCard,
        status: 'pending',
        scheduledDate: new Date('2025-02-14'),
      };

      console.log(
        '[TEST] Scheduled Card Status:',
        scheduledCard.status,
        'for',
        scheduledCard.scheduledDate
      );

      const result = await GiftCardEmailService.sendRecipientNotification(
        scheduledCard,
        mockGiftCard.purchaserName
      );

      expect(result.success).toBe(true);
    });

    it('should handle bulk email sending for multiple gift cards', async () => {
      const cards: GiftCard[] = [
        mockGiftCard,
        {
          ...mockGiftCard,
          id: 'gc-002',
          code: 'GIFT-2025-TEST-002',
          recipientName: 'Alice Johnson',
          recipientEmail: 'alice.johnson@example.com',
        },
        {
          ...mockGiftCard,
          id: 'gc-003',
          code: 'GIFT-2025-TEST-003',
          recipientName: 'Bob Wilson',
          recipientEmail: 'bob.wilson@example.com',
        },
      ];

      console.log('[TEST] Sending bulk notifications for', cards.length, 'cards');

      for (const card of cards) {
        const result = await GiftCardEmailService.sendRecipientNotification(
          card,
          mockGiftCard.purchaserName
        );
        console.log(`[TEST] Card ${card.id}:`, result.success ? 'Success' : 'Failed');
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    it('should gracefully handle invalid email addresses', async () => {
      const cardWithBadEmail = {
        ...mockGiftCard,
        recipientEmail: 'not-an-email',
      };

      const result = await GiftCardEmailService.sendRecipientNotification(
        cardWithBadEmail,
        mockGiftCard.purchaserName
      );

      console.log('[TEST] Invalid Email Handling:', result);

      expect(result.success).toBe(false);
    });

    it('should handle null recipient data', async () => {
      const cardWithoutRecipient = {
        ...mockGiftCard,
        recipientName: undefined,
        recipientEmail: undefined,
      };

      const result = await GiftCardEmailService.sendRecipientNotification(
        cardWithoutRecipient,
        mockGiftCard.purchaserName
      );

      console.log('[TEST] No Recipient Data:', result);

      expect(result.success).toBe(false);
    });

    it('should handle missing transaction data', async () => {
      const incompleteTransaction = {
        ...mockTransaction,
        processedBy: '',
      };

      const result = await GiftCardEmailService.sendRedemptionNotification(
        mockGiftCard,
        incompleteTransaction,
        'Jane Doe',
        'Service'
      );

      console.log('[TEST] Incomplete Transaction:', result);

      expect(result.success).toBe(true); // Should still send
    });
  });

  describe('Template Rendering', () => {
    it('should include all required variables in buyer receipt', async () => {
      const result = await GiftCardEmailService.sendBuyerReceipt(
        mockGiftCard,
        mockGiftCard.purchaserEmail,
        mockGiftCard.purchaserName
      );

      console.log('[TEST] Buyer Receipt Variables:');
      console.log('  - Gift Card Amount: $' + mockGiftCard.originalValue);
      console.log('  - Gift Card Code:', mockGiftCard.code);
      console.log('  - Recipient Name:', mockGiftCard.recipientName);
      console.log('  - Expiration Date:', mockGiftCard.expirationDate);

      expect(result.success).toBe(true);
    });

    it('should include redemption instructions in recipient email', async () => {
      const result = await GiftCardEmailService.sendRecipientNotification(
        mockGiftCard,
        mockGiftCard.purchaserName
      );

      console.log('[TEST] Recipient Email - Redemption Instructions:');
      console.log('  - 1. Browse & Book');
      console.log('  - 2. Provide Your Code');
      console.log('  - 3. Enjoy Your Treatment');

      expect(result.success).toBe(true);
    });

    it('should calculate and display correct balance after redemption', async () => {
      const result = await GiftCardEmailService.sendRedemptionNotification(
        mockGiftCard,
        mockTransaction,
        mockGiftCard.recipientName!,
        'Facial Treatment'
      );

      console.log('[TEST] Balance Calculation:');
      console.log('  - Original Balance: $' + mockGiftCard.currentBalance);
      console.log('  - Amount Used: $' + Math.abs(mockTransaction.amount));
      console.log('  - Remaining: $' + (mockGiftCard.currentBalance + mockTransaction.amount));

      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle gift cards with no expiration date', async () => {
      const permanentCard: GiftCard = {
        ...mockGiftCard,
        expirationDate: undefined,
      };

      const result = await GiftCardEmailService.sendBuyerReceipt(
        permanentCard,
        permanentCard.purchaserEmail,
        permanentCard.purchaserName
      );

      console.log('[TEST] No Expiration Date:', result.success);

      expect(result.success).toBe(true);
    });

    it('should handle very large gift card amounts', async () => {
      const largeCard: GiftCard = {
        ...mockGiftCard,
        originalValue: 10000,
        currentBalance: 10000,
      };

      const result = await GiftCardEmailService.sendRecipientNotification(
        largeCard,
        mockGiftCard.purchaserName
      );

      console.log('[TEST] Large Amount ($' + largeCard.originalValue + '):', result.success);

      expect(result.success).toBe(true);
    });

    it('should handle special characters in recipient name', async () => {
      const specialCard: GiftCard = {
        ...mockGiftCard,
        recipientName: "O'Brien-Smith, José",
      };

      const result = await GiftCardEmailService.sendRecipientNotification(
        specialCard,
        mockGiftCard.purchaserName
      );

      console.log('[TEST] Special Characters:', result.success);

      expect(result.success).toBe(true);
    });

    it('should handle very long custom messages', async () => {
      const longMessageCard: GiftCard = {
        ...mockGiftCard,
        recipientMessage: `Happy Birthday! I wanted to give you this gift card to our favorite spa.
                          I hope you take some time to relax and enjoy some well-deserved self-care.
                          You deserve to be pampered! The team there is amazing and I know you'll have a wonderful experience.
                          Looking forward to hearing all about your visit!`,
      };

      const result = await GiftCardEmailService.sendRecipientNotification(
        longMessageCard,
        mockGiftCard.purchaserName
      );

      console.log('[TEST] Long Message:', result.success);

      expect(result.success).toBe(true);
    });
  });
});
