# Automated Messages Implementation Spec

## Target: `/settings/automated-messages`

## Structure
```
/src/app/settings/automated-messages/
├── page.tsx                    # Main hub with 8 tabs
├── components/
│   ├── AutomatedMessagesHub.tsx
│   ├── TabNavigation.tsx
│   ├── TimelineConfigurator.tsx
│   ├── MessageEditor.tsx
│   ├── InternalNotificationConfig.tsx
│   ├── TestSendButton.tsx
│   └── PreviewModal.tsx
└── tabs/
    ├── AppointmentBookedTab.tsx
    ├── AppointmentCanceledTab.tsx
    ├── FormSubmittedTab.tsx
    ├── WaitlistTab.tsx
    ├── CheckInTab.tsx
    ├── SaleClosedTab.tsx
    ├── GiftCardsTab.tsx
    └── MembershipsTab.tsx
```

## Types (add to /src/types/messaging.ts)
```typescript
interface AutomatedMessageConfig {
  id: string;
  eventType: EventType;
  enabled: boolean;
  channels: ('sms' | 'email')[];
  timing: {
    type: 'immediate' | 'before_appointment' | 'after_event';
    value?: number;
    unit?: 'minutes' | 'hours' | 'days';
  };
  triggers: {
    onlineBookings: boolean;
    staffBookings: boolean;
    specificServices?: string[];
  };
  template: {
    subject?: string;
    body: string;
    variables: string[];
  };
  internalNotification?: {
    enabled: boolean;
    recipients: string[];
  };
  confirmationRequest?: {
    enabled: boolean;
    setStatusUnconfirmed: boolean;
  };
}

type EventType =
  | 'appointment_booked'
  | 'appointment_canceled'
  | 'appointment_rescheduled'
  | 'form_submitted'
  | 'waitlist_added'
  | 'waitlist_opening'
  | 'check_in_reminder'
  | 'patient_waiting'
  | 'provider_ready'
  | 'sale_closed'
  | 'gift_card_purchased'
  | 'gift_card_received'
  | 'membership_started'
  | 'membership_renewal_reminder'
  | 'membership_renewed'
  | 'membership_canceled';
```

## Tab 1: Appointment Booked
Messages:
1. Email confirmation (immediate)
2. Text confirmation (immediate)
3. Form request attachment
4. Internal notification - online bookings
5. Internal notification - staff bookings
6. Timeline reminders (1d, 2d, 3d, 7d configurable)
7. Confirmation REQUEST (reply C/R)
8. Same-day reminder

UI Features:
- Toggle for online vs staff bookings per message
- Timeline view showing message flow
- Test send button
- Preview modal

## Tab 2: Appointment Canceled
- Email notification
- Text notification

## Tab 3: Form Submitted
- Internal notification with email recipients

## Tab 4: Waitlist
- Added to waitlist confirmation
- Opening available notification
- Internal notification for openings

## Tab 5: Check-In
- 15-min pre-arrival with check-in link
- Custom instructions field
- Staff notification when waiting
- Provider ready notification

## Tab 6: Sale Closed
- Thank you email with receipt link

## Tab 7: Gift Cards
- Receipt to buyer
- Card details to recipient

## Tab 8: Memberships
- Started confirmation
- Pre-renewal reminder (days configurable)
- Renewed confirmation
- Canceled confirmation

## Styling
- Use existing Tailwind patterns from /src/app/settings/page.tsx
- Card-based layout
- Toggle switches for enable/disable
- Blue primary color for active states

## Mock Data
- Store in component state initially
- Use localStorage for persistence
- Follow patterns from existing settings pages
