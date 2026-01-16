# Gift Card Email Service - Debug Guide

## Overview
Complete email service for gift card operations with 4 email types:
1. **Buyer Receipt** - Purchase confirmation sent to purchaser
2. **Recipient Notification** - Card details and redemption instructions
3. **Redemption Notification** - When recipient redeems the gift
4. **Expiration Reminder** - Before gift card expires

---

## Files Created

### Service Layer
**Location:** `/src/services/giftcards/email-service.ts`
- `GiftCardEmailService` - Main service class
- `GiftCardEmailTemplates` - Static template generator
- Full HTML and text email templates
- Complete validation with Zod schemas

**Key Functions:**
```typescript
// Send buyer receipt
await GiftCardEmailService.sendBuyerReceipt(giftCard, email, name)

// Send recipient notification
await GiftCardEmailService.sendRecipientNotification(giftCard, buyerName)

// Send redemption notification
await GiftCardEmailService.sendRedemptionNotification(giftCard, transaction, recipientName, serviceName)

// Send expiration reminder
await GiftCardEmailService.sendExpirationReminder(giftCard, daysUntilExpiration)
```

### API Route
**Location:** `/src/app/api/giftcards/send-email/route.ts`
- POST endpoint for sending emails
- Request validation with Zod schemas
- Comprehensive error handling
- Support for all 4 email types

**Request Format:**
```javascript
// Buyer Receipt
{
  type: 'buyer_receipt',
  giftCard: { /* GiftCard object */ },
  purchaserEmail: 'buyer@example.com',
  purchaserName: 'John Smith'
}

// Recipient Notification
{
  type: 'recipient_notification',
  giftCard: { /* GiftCard object */ },
  buyerName: 'John Smith'
}

// Redemption Notification
{
  type: 'redemption_notification',
  giftCard: { /* GiftCard object */ },
  transaction: { /* GiftCardTransaction object */ },
  recipientName: 'Jane Doe',
  serviceName: 'Facial Treatment'
}

// Expiration Reminder
{
  type: 'expiration_reminder',
  giftCard: { /* GiftCard object */ },
  daysUntilExpiration: 30
}
```

### Tests
**Location:** `/src/__tests__/giftcards/email-service.test.ts`
- 40+ test cases
- Full lifecycle testing
- Error handling scenarios
- Edge case coverage
- Bulk email testing

---

## Testing the Service

### Run All Tests
```bash
npm test -- src/__tests__/giftcards/email-service.test.ts
```

### Run Specific Test Suite
```bash
npm test -- src/__tests__/giftcards/email-service.test.ts -t "sendBuyerReceipt"
```

### Test Output Examples

#### Buyer Receipt Test
```
✓ should successfully send buyer receipt email
  [DEBUG] Received gift card email request
  [DEBUG] Request body: { type: 'buyer_receipt', giftCard: {...}, ... }
  [DEBUG] Request validation passed
  [DEBUG] Processing buyer_receipt email
  [DEBUG] Generating buyer receipt for john.smith@example.com
  [DEBUG] Email sent successfully. Message ID: dev-1736432400000
```

#### Recipient Notification Test
```
✓ should successfully send recipient notification email
  [DEBUG] Generating recipient notification for jane.doe@example.com
  [DEBUG] Recipient notification request validated
  [DEVELOPMENT MODE] Email would be sent with content:
  To: jane.doe@example.com
  Subject: You've Received a $250 Gift Card from John Smith!
  Text: Hi Jane,...
```

#### Error Handling Test
```
✓ should require recipient email address
  [ERROR] Failed to send recipient notification: Recipient email is required
  Result: { success: false, error: 'Recipient email is required' }
```

---

## Email Templates

### 1. Buyer Receipt
- **When:** Immediately after purchase
- **Recipient:** Purchaser
- **Includes:**
  - Purchase confirmation
  - Gift card code & amount
  - Recipient details
  - Personal message (if provided)
  - What happens next
  - Support contact info

**Email Design:**
- Purple gradient header: "Gift Card Purchase Confirmed"
- Gift code in prominent box
- Clear section layout
- Call-to-action button

### 2. Recipient Notification
- **When:** When gift card is sent to recipient
- **Recipient:** Gift card recipient
- **Includes:**
  - Greeting from purchaser
  - Gift card amount (highlighted)
  - Redemption code
  - Step-by-step redemption instructions
  - Expiration date
  - Booking links

**Email Design:**
- Green gradient header: "You've Received a Gift Card!"
- Large amount display
- 3-step redemption guide with numbered steps
- Personal message box
- Call-to-action button

### 3. Redemption Notification
- **When:** When recipient uses the gift card
- **Recipient:** Purchaser
- **Includes:**
  - Recipient name
  - Service used
  - Amount redeemed
  - Remaining balance
  - Option to buy another gift card

**Email Design:**
- Blue gradient header: "Your Gift Card Was Redeemed!"
- Redemption details in grid
- Balance highlight section
- Upsell option for another gift card

### 4. Expiration Reminder
- **When:** Before gift card expires (configurable days)
- **Recipient:** Gift card recipient
- **Includes:**
  - Days remaining
  - Exact expiration date
  - Redemption code
  - Current balance
  - Urgency messaging (if < 7 days)
  - Quick booking links

**Email Design:**
- Orange gradient header: "Your Gift Card is Expiring Soon!"
- Prominent days remaining display
- Red urgency box (if <= 7 days)
- Gift card details in clear boxes
- Call-to-action button

---

## Debug Logging

All functions include comprehensive logging:

```typescript
// Service-level debugging
console.log(`[DEBUG] Generating buyer receipt for ${email}`)
console.log(`[DEBUG] Buyer receipt request validated`)
console.log(`[DEBUG] Sending email to ${recipient}`)
console.log(`[DEBUG] Subject: ${subject}`)

// Development mode logging
console.log('[DEVELOPMENT MODE] Email would be sent with content:')
console.log(`To: ${email}`)
console.log(`Subject: ${subject}`)

// Production logging
console.log(`[PRODUCTION] Email sent successfully. Message ID: ${messageId}`)

// Error logging
console.error('[ERROR] Email sending failed:', error)
```

### Enable Debug Output
1. Run tests: `npm test -- src/__tests__/giftcards/email-service.test.ts`
2. Look for `[DEBUG]`, `[ERROR]`, and `[TEST]` prefixed messages
3. In development, emails are logged to console instead of sending
4. In production, emails would be sent via SendGrid/similar service

---

## Testing Scenarios

### Scenario 1: Happy Path - New Gift Card
1. Create gift card with all data
2. Send buyer receipt to purchaser
3. Send recipient notification to recipient
4. Verify both emails generated successfully

**Expected Output:**
```
✓ Buyer receipt sent successfully
✓ Recipient notification sent successfully
✓ All required variables present
✓ Both emails use correct templates
```

### Scenario 2: Redemption Workflow
1. Create gift card
2. Record redemption transaction
3. Send redemption notification to buyer
4. Verify balance calculations are correct

**Expected Output:**
```
✓ Redemption notification sent
✓ Balance correctly calculated
✓ Service name included
✓ Redeemed amount displayed
```

### Scenario 3: Expiration Reminder
1. Create gift card with expiration date
2. Calculate days until expiration
3. Send reminder email
4. Verify urgency messaging for < 7 days

**Expected Output:**
```
✓ Reminder sent with correct days remaining
✓ Urgent messaging displayed (if needed)
✓ Expiration date formatted correctly
✓ Balance included in reminder
```

### Scenario 4: Bulk Corporate Gifts
1. Create 10 gift cards for employees
2. Send receipt to purchaser
3. Send notification to each recipient
4. Verify all emails sent successfully

**Expected Output:**
```
✓ 10 recipient notifications sent
✓ All emails contain correct gift card codes
✓ All personalization correct
✓ No duplicate sends
```

---

## API Usage Examples

### Using fetch() in browser
```javascript
// Send buyer receipt
const response = await fetch('/api/giftcards/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'buyer_receipt',
    giftCard: giftCardData,
    purchaserEmail: 'john@example.com',
    purchaserName: 'John Smith'
  })
});

const result = await response.json();
console.log('Email sent:', result.success, result.messageId);
```

### Using axios
```javascript
import axios from 'axios';

const sendRecipientEmail = async (giftCard, buyerName) => {
  try {
    const response = await axios.post('/api/giftcards/send-email', {
      type: 'recipient_notification',
      giftCard,
      buyerName
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send email:', error.response?.data);
  }
};
```

### Using fetch() in component
```tsx
const handleSendGiftCard = async (giftCard: GiftCard) => {
  const response = await fetch('/api/giftcards/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'recipient_notification',
      giftCard,
      buyerName: giftCard.purchaserName
    })
  });

  if (response.ok) {
    const data = await response.json();
    toast.success(`Email sent! (${data.messageId})`);
  } else {
    toast.error('Failed to send email');
  }
};
```

---

## Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Recipient email is required` | Missing recipient email in gift card | Populate `recipientEmail` field before sending |
| `Gift card expiration date is required` | Missing expiration date for reminder | Set `expirationDate` on gift card object |
| `Invalid email address` | Malformed email in request | Validate email format before sending |
| `Invalid request data` | Missing required fields | Check all required fields per email type |

### Validation Errors
```javascript
{
  success: false,
  error: 'Invalid request data',
  details: [
    {
      code: 'invalid_type',
      expected: 'string',
      received: 'undefined',
      path: ['giftCard', 'code'],
      message: 'Required'
    }
  ]
}
```

---

## Integration Checklist

- [x] Service implementation with all 4 email types
- [x] API route with full request validation
- [x] Comprehensive test suite (40+ tests)
- [x] HTML and text email templates
- [x] Error handling and validation
- [x] Debug logging throughout
- [x] Documentation and examples
- [ ] SendGrid/Mailgun integration (production)
- [ ] Email scheduling/queue (production)
- [ ] Unsubscribe handling (production)
- [ ] Analytics tracking (production)

---

## Production Implementation

### Current State (Development)
- Emails are logged to console
- No actual sending occurs
- Perfect for testing and debugging

### Next Steps for Production

1. **Choose Email Service**
   - SendGrid: High reliability, good templates
   - Mailgun: Good API, flexible
   - AWS SES: Cost-effective, AWS integrated

2. **Update `sendEmail()` method**
   ```typescript
   private static async sendEmail(request: SendEmailRequest) {
     const response = await sgMail.send({
       to: request.to,
       from: this.config.from,
       subject: request.subject,
       text: request.text,
       html: request.html,
       replyTo: request.replyTo || this.config.replyTo,
       categories: [request.metadata?.type || 'gift_card'],
     });
     return { success: true, messageId: response[0].headers['x-message-id'] };
   }
   ```

3. **Add Email Queuing**
   - Use Bull/BullMQ for job queue
   - Retry failed sends
   - Track delivery status

4. **Add Unsubscribe Support**
   - Include unsubscribe headers
   - Track bounces and complaints
   - Update preferences in database

5. **Enable Analytics**
   - Track opens
   - Track clicks
   - Monitor delivery rates

---

## Next Features to Build

1. **Email Template Customization**
   - Allow spa to customize templates via admin UI
   - Support for logo, colors, footer text
   - Brand-specific messaging

2. **Scheduling**
   - Schedule gift cards for future delivery
   - Timezone-aware scheduling
   - Calendar integration

3. **Bulk Sending**
   - CSV import for bulk corporate gifts
   - Batch validation
   - Progress tracking

4. **Analytics**
   - Email delivery reports
   - Click tracking
   - Conversion tracking (booking from email)

5. **SMS Support**
   - Send gift card code via SMS
   - SMS reminders
   - SMS-to-book integration

---

## Support & Questions

For issues or questions:
1. Check debug logs in console (look for `[DEBUG]` prefix)
2. Review error messages in response
3. Validate request schema matches expected format
4. Test with the provided test cases
5. Check email template HTML for syntax errors

All templates use standard HTML and CSS with no external dependencies.
