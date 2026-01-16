# Preview Modal Integration Guide

This document outlines how the PreviewModal component has been integrated and should be integrated into all automated message tabs.

## ✅ COMPLETED: AppointmentCanceledTab.tsx

Successfully integrated with:
- Import statements for PreviewModal and Eye icon
- Preview button state management
- Preview buttons next to Test Send buttons for both Email and SMS
- PreviewModal component at the end of the return statement

## Pattern to Apply to All Remaining Tabs

### Step 1: Add Imports
```typescript
import PreviewModal from '../components/PreviewModal';
import { Eye } from 'lucide-react';
```

### Step 2: Add State Variables (in component)
```typescript
// Preview modal state
const [previewModalOpen, setPreviewModalOpen] = useState(false);
const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);
const [previewType, setPreviewType] = useState<'sms' | 'email'>('email');
```

### Step 3: Add Preview Handler Function
```typescript
// Handle preview button click
const handlePreview = (template: MessageTemplate, type: 'sms' | 'email') => {
  setPreviewTemplate(template);
  setPreviewType(type);
  setPreviewModalOpen(true);
};
```

### Step 4: Add Preview Button(s) after MessageEditor
For each MessageEditor, add a Preview button:

```typescript
<button
  onClick={() => handlePreview(templateVariable, 'email' | 'sms')}
  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
>
  <Eye className="h-4 w-4" />
  Preview
</button>
```

### Step 5: Add PreviewModal Component (before closing return div)
```typescript
{/* Preview Modal */}
{previewTemplate && (
  <PreviewModal
    isOpen={previewModalOpen}
    onClose={() => setPreviewModalOpen(false)}
    template={{
      name: 'Message Name',
      type: previewType,
      subject: previewTemplate.subject,
      content: previewTemplate.body,
      timing: 'Description of when this sends'
    }}
    messageType={previewType}
  />
)}
```

## Files Requiring Integration

### ⏳ PENDING TABS

#### 1. CheckInTab.tsx
**Templates to add preview for:**
- Pre-Arrival Message (SMS) - Line ~94
- Provider Ready Notification (SMS) - Line ~229
- Check-in Confirmation (SMS) - Line ~298

**Special considerations:**
- Multiple MessageEditor instances
- Add preview button after each MessageEditor
- Use appropriate template names: "Pre-Arrival Message", "Provider Ready Notification", "Check-in Confirmation"

#### 2. SaleClosedTab.tsx
**Templates to add preview for:**
- Thank You Email - Line ~148
- Thank You SMS - Line ~183
- Review Request (SMS) - Line ~303
- Post-Care Instructions (SMS) - Line ~390

**Special considerations:**
- Multiple templates with different timing
- Set timing values appropriately:
  - "Immediately after checkout"
  - "24 hours after checkout" (review request)

#### 3. GiftCardsTab.tsx
**Templates to add preview for:**
- Buyer Receipt (Email) - Line ~154
- Recipient Notification (Email) - Line ~198
- Redemption Notification (Email) - Line ~251
- Expiration Reminder (Email) - Line ~323

**Special considerations:**
- All are email templates
- Different timing for each:
  - "Immediately after purchase"
  - "When recipient is notified"
  - "When gift card is redeemed"
  - "X days before expiration"

#### 4. MembershipsTab.tsx
**Templates to add preview for:**
- Membership Started (Email) - Line ~226
- Pre-Renewal Reminder (SMS) - Line ~292
- Renewal Success (SMS) - Line ~331
- Renewal Failed (SMS) - Line ~406
- Membership Canceled (Email) - Line ~486

**Special considerations:**
- Mix of Email and SMS templates
- Complex lifecycle messages
- Timing varies significantly

#### 5. WaitlistTab.tsx
**Templates to add preview for:**
- Added to Waitlist (both SMS and Email) - Lines ~194, ~210
- Opening Available (both SMS and Email) - Lines ~289, ~305

**Special considerations:**
- Each message type has BOTH SMS and Email versions
- Need to handle channel selection properly
- Two separate MessageEditor instances per message type

## Implementation Notes

### Variable Replacement
The PreviewModal automatically replaces variables with sample data from:
```typescript
const SAMPLE_DATA = {
  firstName: 'Sarah',
  lastName: 'Johnson',
  fullName: 'Sarah Johnson',
  patient_name: 'Sarah',
  appointmentDate: 'Tuesday, Jan 14 at 2:00 PM',
  appointment_date: 'Tuesday, Jan 14',
  appointment_time: '2:00 PM',
  serviceName: 'Botox Treatment',
  service_name: 'Botox Treatment',
  providerName: 'Dr. Smith',
  provider_name: 'Dr. Smith',
  clinicName: 'Luxe Medical Spa',
  clinic_name: 'Luxe Medical Spa',
  clinicPhone: '(555) 123-4567',
  clinic_phone: '(555) 123-4567',
  confirmLink: 'https://luxespa.com/confirm',
  rescheduleLink: 'https://luxespa.com/reschedule',
  bookingLink: 'https://luxespa.com/book',
}
```

### Preview Modal Features
- SMS messages display in phone mockup with realistic styling
- Email messages display in email client mockup
- Variables are automatically replaced with sample data
- Shows template name and timing information
- Fully responsive and accessible

### UI Consistency
- Preview button always appears next to or near the MessageEditor
- Uses consistent styling: gray background, gray text, Eye icon
- Button positioning: usually in a flex container with gap-3
- If there's a Test Send button, Preview goes to its left

## Testing Checklist

For each tab after integration:
- [ ] Preview button appears for each message template
- [ ] Clicking Preview opens modal
- [ ] Modal displays correct message type (SMS/Email)
- [ ] Variables are replaced with sample data
- [ ] SMS shows in phone mockup
- [ ] Email shows in email client mockup
- [ ] Modal closes properly
- [ ] Template name and timing are correct
- [ ] No console errors
- [ ] UI looks clean and aligned

## Example: Complete Integration (CheckInTab)

```typescript
'use client';

import { useState } from 'react';
import { MessageCard } from '../components/MessageCard';
import { InternalNotificationConfig } from '../components/InternalNotificationConfig';
import MessageEditor, { MessageTemplate } from '../components/MessageEditor';
import PreviewModal from '../components/PreviewModal';
import { Clock, Link as LinkIcon, UserCheck, Users, Bell, Eye } from 'lucide-react';

export function CheckInTab() {
  // ... existing state ...

  // Preview modal state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<MessageTemplate | null>(null);
  const [previewType, setPreviewType] = useState<'sms' | 'email'>('sms');
  const [previewName, setPreviewName] = useState('');
  const [previewTiming, setPreviewTiming] = useState('');

  // Handle preview button click
  const handlePreview = (
    template: MessageTemplate,
    type: 'sms' | 'email',
    name: string,
    timing: string
  ) => {
    setPreviewTemplate(template);
    setPreviewType(type);
    setPreviewName(name);
    setPreviewTiming(timing);
    setPreviewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* ... existing content ... */}

      {/* Add preview button after MessageEditor like this: */}
      <MessageEditor
        template={preArrivalTemplate}
        onChange={setPreArrivalTemplate}
        messageType="sms"
      />
      <div className="mt-4">
        <button
          onClick={() => handlePreview(
            preArrivalTemplate,
            'sms',
            'Pre-Arrival Message',
            `${preArrivalMinutes} minutes before appointment`
          )}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Preview
        </button>
      </div>

      {/* ... more content ... */}

      {/* Preview Modal at end */}
      {previewTemplate && (
        <PreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          template={{
            name: previewName,
            type: previewType,
            subject: previewTemplate.subject,
            content: previewTemplate.body,
            timing: previewTiming
          }}
          messageType={previewType}
        />
      )}
    </div>
  );
}
```

## Benefits

1. **Better UX**: Users can see how messages will look before saving
2. **Fewer Errors**: Visual verification helps catch formatting issues
3. **Variable Testing**: Users can verify all variables are replaced correctly
4. **Professional Feel**: Phone and email mockups look realistic
5. **Consistency**: Same preview experience across all message types
