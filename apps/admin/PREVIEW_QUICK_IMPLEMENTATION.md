# Preview Modal - Quick Implementation Guide

## ✅ COMPLETED

### AppointmentCanceledTab.tsx
- ✅ Imports added (PreviewModal, Eye icon)
- ✅ State management added
- ✅ Preview handler function added
- ✅ Preview button for Email template
- ✅ Preview button for SMS template
- ✅ PreviewModal component at end

**Status:** Fully functional. Users can preview email and SMS cancellation messages.

## 📋 COPY-PASTE CODE FOR REMAINING TABS

Use this code as a template for all remaining tabs. Just update the template variables and names.

### Step 1: Add to Imports (top of file)
```typescript
import PreviewModal from '../components/PreviewModal';
import { Eye } from 'lucide-react';
```

### Step 2: Add State (after existing state declarations)
```typescript
// Preview modal state
const [previewModalOpen, setPreviewModalOpen] = useState(false);
const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);
const [previewType, setPreviewType] = useState<'sms' | 'email'>('email');
```

### Step 3: Add Handler Function (after existing functions)
```typescript
// Handle preview button click
const handlePreview = (template: MessageTemplate, type: 'sms' | 'email') => {
  setPreviewTemplate(template);
  setPreviewType(type);
  setPreviewModalOpen(true);
};
```

### Step 4: Add Preview Button (after EACH MessageEditor)

**Pattern A: With Test Send Button**
```typescript
<div className="mt-4 flex justify-end gap-3">
  <button
    onClick={() => handlePreview(YOUR_TEMPLATE_VAR, 'sms' OR 'email')}
    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
  >
    <Eye className="h-4 w-4" />
    Preview
  </button>
  <TestSendButton ... />
</div>
```

**Pattern B: Without Test Send Button**
```typescript
<div className="mt-4">
  <button
    onClick={() => handlePreview(YOUR_TEMPLATE_VAR, 'sms' OR 'email')}
    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
  >
    <Eye className="h-4 w-4" />
    Preview
  </button>
</div>
```

### Step 5: Add Preview Modal (before final closing div of return)
```typescript
{/* Preview Modal */}
{previewTemplate && (
  <PreviewModal
    isOpen={previewModalOpen}
    onClose={() => setPreviewModalOpen(false)}
    template={{
      name: 'MESSAGE NAME HERE',
      type: previewType,
      subject: previewTemplate.subject,
      content: previewTemplate.body,
      timing: 'WHEN THIS SENDS'
    }}
    messageType={previewType}
  />
)}
```

## 🎯 SPECIFIC INSTRUCTIONS PER TAB

### CheckInTab.tsx

**Templates to add preview for:**

1. **Pre-Arrival Message** (line ~94)
```typescript
onClick={() => handlePreview(preArrivalTemplate, 'sms')}
// Modal name: 'Pre-Arrival Message'
// Modal timing: `${preArrivalMinutes} minutes before appointment`
```

2. **Provider Ready Notification** (line ~229)
```typescript
onClick={() => handlePreview(providerReadyTemplate, 'sms')}
// Modal name: 'Provider Ready Notification'
// Modal timing: 'When provider is ready'
```

3. **Check-in Confirmation** (line ~298)
```typescript
onClick={() => handlePreview(checkInConfirmationTemplate, 'sms')}
// Modal name: 'Check-in Confirmation'
// Modal timing: 'Immediately after check-in'
```

---

### SaleClosedTab.tsx

**Templates to add preview for:**

1. **Thank You Email** (line ~148)
```typescript
onClick={() => handlePreview(settings.thankYouEmail.template, 'email')}
// Modal name: 'Thank You Email'
// Modal timing: 'Immediately after checkout'
```

2. **Thank You SMS** (line ~183)
```typescript
onClick={() => handlePreview(settings.thankYouSMS.template, 'sms')}
// Modal name: 'Thank You SMS'
// Modal timing: 'Immediately after checkout'
```

3. **Review Request** (line ~303)
```typescript
onClick={() => handlePreview(settings.reviewRequest.template, 'sms')}
// Modal name: 'Review Request'
// Modal timing: `${settings.reviewRequest.delayAmount} ${settings.reviewRequest.delayUnit} after checkout`
```

4. **Post-Care Instructions** (line ~390)
```typescript
onClick={() => handlePreview(settings.postCareInstructions.template, 'sms')}
// Modal name: 'Post-Care Instructions'
// Modal timing: 'After treatment is performed'
```

---

### GiftCardsTab.tsx

**Templates to add preview for:**

1. **Buyer Receipt** (line ~154)
```typescript
onClick={() => handlePreview(configs.buyerReceipt.template, 'email')}
// Modal name: 'Gift Card Purchase Receipt'
// Modal timing: 'Immediately after purchase'
```

2. **Recipient Notification** (line ~198)
```typescript
onClick={() => handlePreview(configs.recipientNotification.template, 'email')}
// Modal name: 'Gift Card Received'
// Modal timing: 'When gift card is sent to recipient'
```

3. **Redemption Notification** (line ~251)
```typescript
onClick={() => handlePreview(configs.redemptionNotification.template, 'email')}
// Modal name: 'Gift Card Redeemed'
// Modal timing: 'When recipient redeems gift card'
```

4. **Expiration Reminder** (line ~323)
```typescript
onClick={() => handlePreview(configs.expirationReminder.template, 'email')}
// Modal name: 'Gift Card Expiring Soon'
// Modal timing: `${configs.expirationReminder.daysBeforeExpiration} days before expiration`
```

---

### MembershipsTab.tsx

**Templates to add preview for:**

1. **Membership Started** (line ~226)
```typescript
onClick={() => handlePreview(settings.membershipStarted.template, 'email')}
// Modal name: 'Membership Welcome'
// Modal timing: 'When membership begins'
```

2. **Pre-Renewal Reminder** (line ~292)
```typescript
onClick={() => handlePreview(settings.preRenewalReminder.template, 'sms')}
// Modal name: 'Renewal Reminder'
// Modal timing: `${settings.preRenewalReminder.daysBeforeRenewal} days before renewal`
```

3. **Renewal Success** (line ~331)
```typescript
onClick={() => handlePreview(settings.renewalSuccess.template, 'sms')}
// Modal name: 'Renewal Successful'
// Modal timing: 'When renewal payment succeeds'
```

4. **Renewal Failed** (line ~406)
```typescript
onClick={() => handlePreview(settings.renewalFailed.template, 'sms')}
// Modal name: 'Renewal Payment Failed'
// Modal timing: 'When renewal payment fails'
```

5. **Membership Canceled** (line ~486)
```typescript
onClick={() => handlePreview(settings.membershipCanceled.template, 'email')}
// Modal name: 'Membership Canceled'
// Modal timing: 'When membership is canceled'
```

---

### WaitlistTab.tsx

**Special case:** This tab has SMS AND Email for each message type.

1. **Added to Waitlist - SMS** (line ~194)
```typescript
onClick={() => handlePreview(settings.addedToWaitlist.smsTemplate, 'sms')}
// Modal name: 'Added to Waitlist'
// Modal timing: 'When patient joins waitlist'
```

2. **Added to Waitlist - Email** (line ~210)
```typescript
onClick={() => handlePreview(settings.addedToWaitlist.emailTemplate, 'email')}
// Modal name: 'Added to Waitlist'
// Modal timing: 'When patient joins waitlist'
```

3. **Opening Available - SMS** (line ~289)
```typescript
onClick={() => handlePreview(settings.openingAvailable.smsTemplate, 'sms')}
// Modal name: 'Appointment Slot Available'
// Modal timing: 'When matching slot opens'
```

4. **Opening Available - Email** (line ~305)
```typescript
onClick={() => handlePreview(settings.openingAvailable.emailTemplate, 'email')}
// Modal name: 'Appointment Slot Available'
// Modal timing: 'When matching slot opens'
```

---

## ⚡ QUICK CHECKLIST

For each tab:
- [ ] Add imports (PreviewModal, Eye)
- [ ] Add state variables (3 lines)
- [ ] Add handler function (5 lines)
- [ ] Add preview button(s) after each MessageEditor
- [ ] Add PreviewModal component at end
- [ ] Test: Click preview, verify modal opens
- [ ] Test: Verify variables are replaced
- [ ] Test: Verify correct mockup (SMS/Email)
- [ ] Test: Close modal works

## 📊 PROGRESS TRACKER

- [x] AppointmentCanceledTab.tsx (2 buttons)
- [ ] CheckInTab.tsx (3 buttons)
- [ ] SaleClosedTab.tsx (4 buttons)
- [ ] GiftCardsTab.tsx (4 buttons)
- [ ] MembershipsTab.tsx (5 buttons)
- [ ] WaitlistTab.tsx (4 buttons)

**Total:** 1/6 tabs complete, 22 preview buttons (2 done, 20 remaining)

## 🎨 VISUAL RESULT

When complete, each message template will have:
```
┌─────────────────────────────────────┐
│ MessageEditor Component             │
│ [Text editing area]                 │
│                                     │
│ Character count, variables, etc.    │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│         [👁 Preview]  [📧 Test]    │ ← New buttons
└─────────────────────────────────────┘
```

Clicking Preview shows:
- SMS: Realistic iPhone message bubble
- Email: Professional email client view
- All variables replaced with sample data
- Template name and timing info

## 🔗 RELATED FILES

- `/src/app/settings/automated-messages/components/PreviewModal.tsx` - The modal component
- `/src/app/settings/automated-messages/components/MessageEditor.tsx` - Editor component
- All tab files in `/src/app/settings/automated-messages/tabs/`

---

**Ready to implement?** Just copy-paste the code blocks into each tab file following the specific instructions above.
