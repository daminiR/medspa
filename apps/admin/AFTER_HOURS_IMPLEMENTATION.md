# After-Hours Auto-Responder Service - Implementation Guide

## Overview

The After-Hours Auto-Responder Service provides a production-ready system for automatically responding to patient messages outside of business hours. It includes support for:

- Business hours per day of week
- Holiday calendar management
- Custom auto-reply messages
- Out-of-office mode with date ranges
- Timezone handling (using Intl API)
- Quiet hours (late night/early morning no SMS)
- Response mode toggles (control which scenarios trigger auto-replies)

## Files Created

### 1. Service Layer
- **Location:** `/src/services/messaging/after-hours.ts`
- **Size:** ~550 lines
- **Exports:**
  - `AfterHoursResponderService` - Main service class
  - `afterHoursService` - Singleton instance
  - Type definitions: `BusinessHours`, `Holiday`, `AutoResponderConfig`, `AutoReplyContext`, `ResponderAssignment`

### 2. API Route
- **Location:** `/src/app/api/settings/business-hours/route.ts`
- **Size:** ~280 lines
- **Handlers:**
  - `GET` - Retrieve current configuration
  - `PUT` - Update configuration with various actions

### 3. React Hook
- **Location:** `/src/hooks/useAfterHours.ts`
- **Size:** ~120 lines
- **Features:**
  - Real-time status tracking
  - Auto-refresh every minute
  - All service methods exposed with state management

### 4. Tests
- **Location:** `/src/__tests__/after-hours.test.ts`
- **Size:** ~500 lines
- **Coverage:**
  - Business hours detection
  - Quiet hours detection
  - Holiday management
  - Out-of-office mode
  - Auto-reply logic
  - Configuration management

## API Routes

### GET /api/settings/business-hours

Retrieve the current business hours configuration.

```typescript
const response = await fetch('/api/settings/business-hours');
const { success, data } = await response.json();

// data is AutoResponderConfig
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "default-config",
    "enabled": true,
    "timezone": "America/New_York",
    "businessHours": [
      { "dayOfWeek": "sunday", "isOpen": false },
      { "dayOfWeek": "monday", "isOpen": true, "openTime": "09:00", "closeTime": "17:00" },
      ...
    ],
    "holidays": [],
    "autoReplyMessage": "...",
    "quietHours": { "enabled": true, "startTime": "21:00", "endTime": "09:00" },
    ...
  }
}
```

### PUT /api/settings/business-hours

Update the business hours configuration. The request body includes an `action` and `payload`.

#### Action: update-config

Update general configuration settings.

```typescript
const response = await fetch('/api/settings/business-hours', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'update-config',
    payload: {
      enabled: true,
      autoReplyMessage: 'Thanks for reaching out! We are currently closed.',
      timezone: 'America/New_York',
      responseModes: {
        respondOutsideHours: true,
        respondOnHolidays: true,
        respondInOutOfOfficeMode: true,
      },
      quietHours: {
        enabled: true,
        startTime: '21:00',
        endTime: '09:00',
      },
    },
  }),
});
```

#### Action: update-business-hours

Update business hours for a specific day.

```typescript
const response = await fetch('/api/settings/business-hours', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'update-business-hours',
    payload: {
      dayOfWeek: 'monday',
      isOpen: true,
      openTime: '08:00',
      closeTime: '18:00',
    },
  }),
});
```

#### Action: add-holiday

Add a new holiday to the calendar.

```typescript
const response = await fetch('/api/settings/business-hours', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'add-holiday',
    payload: {
      date: '2024-12-25',
      name: 'Christmas Day',
      allDayEvent: true,
      isClosed: true,
      customMessage: 'Happy Holidays! We will reopen on Dec 26.',
    },
  }),
});
```

#### Action: remove-holiday

Remove a holiday from the calendar.

```typescript
const response = await fetch('/api/settings/business-hours', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'remove-holiday',
    payload: {
      holidayId: 'christmas',
    },
  }),
});
```

#### Action: set-out-of-office

Enable/disable out-of-office mode.

```typescript
const response = await fetch('/api/settings/business-hours', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'set-out-of-office',
    payload: {
      enabled: true,
      startDate: '2024-01-15T00:00:00Z',
      endDate: '2024-01-20T23:59:59Z',
      message: 'We are out of the office and will return on Jan 21.',
    },
  }),
});
```

#### Action: update-auto-reply-message

Update the default auto-reply message.

```typescript
const response = await fetch('/api/settings/business-hours', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'update-auto-reply-message',
    payload: {
      message: 'Thanks for reaching out! We will get back to you during business hours.',
    },
  }),
});
```

#### Action: update-timezone

Update the timezone for business hours calculations.

```typescript
const response = await fetch('/api/settings/business-hours', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'update-timezone',
    payload: {
      timezone: 'America/Los_Angeles',
    },
  }),
});
```

## Service Integration

### Direct Service Usage

For server-side or non-React code:

```typescript
import { afterHoursService } from '@/services/messaging/after-hours';

// Check if currently within business hours
const isOpen = afterHoursService.isWithinBusinessHours();

// Check if within quiet hours (shouldn't send SMS)
const isQuiet = afterHoursService.isWithinQuietHours();

// Check if given date is a holiday
const holiday = afterHoursService.isHoliday(new Date('2024-12-25'));
if (holiday) {
  console.log(`Closed for: ${holiday.name}`);
}

// Check if in out-of-office mode
const isOOO = afterHoursService.isOutOfOffice();

// Determine if auto-reply should be sent
const shouldReply = afterHoursService.shouldSendAutoReply({
  patientPhone: '+15551234567',
  patientId: 'p1',
  messageText: 'Can I schedule an appointment?',
  receivedAt: new Date(),
});

// Get the appropriate auto-reply message
const message = afterHoursService.getAutoReplyMessage({
  patientPhone: '+15551234567',
  messageText: 'Can I schedule an appointment?',
  receivedAt: new Date(),
});

// Send auto-reply
const result = await afterHoursService.sendAutoReply({
  patientPhone: '+15551234567',
  patientId: 'p1',
  messageText: 'Can I schedule an appointment?',
  receivedAt: new Date(),
});

if (result.success) {
  console.log('Auto-reply sent:', result.messageId);
}
```

### React Component Usage

Use the `useAfterHours` hook in React components:

```typescript
import { useAfterHours } from '@/hooks/useAfterHours';

export function BusinessHoursStatus() {
  const { isOpen, isOutOfOffice, isOnHoliday, config } = useAfterHours();

  return (
    <div>
      {isOutOfOffice && (
        <div className="bg-yellow-100 border border-yellow-400 p-4 mb-4">
          Out of Office: {config.outOfOfficeMode.message}
        </div>
      )}

      {isOnHoliday && (
        <div className="bg-blue-100 border border-blue-400 p-4 mb-4">
          We're closed today for a holiday. Auto-replies are enabled.
        </div>
      )}

      <div className={`p-4 rounded ${isOpen ? 'bg-green-100' : 'bg-red-100'}`}>
        Status: {isOpen ? 'Open' : 'Closed'}
      </div>
    </div>
  );
}
```

### Integration with Incoming SMS Handler

In your SMS webhook handler, check before processing:

```typescript
import { afterHoursService } from '@/services/messaging/after-hours';

export async function handleIncomingSMS(message: IncomingMessage) {
  // Check if auto-reply should be sent
  const shouldAutoReply = afterHoursService.shouldSendAutoReply({
    patientPhone: message.from,
    patientId: message.patientId,
    messageText: message.body,
    receivedAt: new Date(),
  });

  if (shouldAutoReply) {
    // Send auto-reply and log it
    const result = await afterHoursService.sendAutoReply({
      patientPhone: message.from,
      patientId: message.patientId,
      messageText: message.body,
      receivedAt: new Date(),
    });

    console.log('Auto-reply sent:', result);
  }

  // Continue with normal message processing
  await processMessage(message);
}
```

## Configuration Examples

### Default Configuration

Out of the box, the service comes with:

- **Business Hours:** Monday-Friday 9 AM - 5 PM
- **Quiet Hours:** 9 PM - 9 AM (no SMS during these hours)
- **Timezone:** America/New_York
- **Auto-reply:** Generic out-of-hours message
- **Closed Days:** Sunday, Saturday
- **Response Modes:** All enabled (respond outside hours, holidays, out-of-office)

### Custom Configuration Example

```typescript
import { afterHoursService } from '@/services/messaging/after-hours';

// Set custom business hours (8 AM - 7 PM, Monday-Friday)
afterHoursService.updateBusinessHours('monday', {
  isOpen: true,
  openTime: '08:00',
  closeTime: '19:00',
});

// Add Thanksgiving closure
afterHoursService.addHoliday({
  id: 'thanksgiving-2024',
  date: new Date('2024-11-28'),
  name: 'Thanksgiving Day',
  allDayEvent: true,
  isClosed: true,
  customMessage: 'Happy Thanksgiving! We will reopen on Nov 29.',
});

// Add New Year holiday with specific closure window
afterHoursService.addHoliday({
  id: 'new-year-2025',
  date: new Date('2025-01-01'),
  name: 'New Year Day',
  allDayEvent: false,
  startTime: '00:00',
  endTime: '18:00',
  isClosed: true,
  customMessage: 'Happy New Year! We reopen at 6 PM today.',
});

// Change timezone to Pacific Time
afterHoursService.updateTimezone('America/Los_Angeles');

// Update auto-reply message
afterHoursService.updateAutoReplyMessage(
  'Thanks for reaching out! We are currently closed. Our team will respond to your message during business hours (Monday-Friday, 9 AM - 5 PM EST).'
);

// Set up a 2-week out-of-office period
afterHoursService.setOutOfOfficeMode(
  true,
  new Date('2024-12-23T00:00:00'),
  new Date('2024-01-05T23:59:59'),
  'Happy Holidays! We are closed Dec 23 - Jan 5 and will return with fresh energy on Jan 6.'
);

// Disable auto-replies outside hours (but keep holidays/OOO enabled)
afterHoursService.updateConfig({
  responseModes: {
    respondOutsideHours: false, // Don't auto-reply after hours
    respondOnHolidays: true,    // But do on holidays
    respondInOutOfOfficeMode: true, // And in OOO mode
  },
});

// Change quiet hours to 10 PM - 8 AM
afterHoursService.updateConfig({
  quietHours: {
    enabled: true,
    startTime: '22:00',
    endTime: '08:00',
  },
});
```

## Timezone Support

The service uses the browser's `Intl.DateTimeFormat` API for timezone handling:

```typescript
import { afterHoursService } from '@/services/messaging/after-hours';

// Available timezones (IANA format)
const timezones = [
  'America/New_York',        // Eastern Time
  'America/Chicago',         // Central Time
  'America/Denver',          // Mountain Time
  'America/Los_Angeles',     // Pacific Time
  'America/Anchorage',       // Alaska Time
  'Pacific/Honolulu',        // Hawaii Time
  'Europe/London',           // GMT
  'Europe/Paris',            // Central European Time
  'Australia/Sydney',        // Australian Eastern Time
  'Asia/Tokyo',              // Japan Standard Time
];

// Update timezone
afterHoursService.updateTimezone('America/Los_Angeles');

// Service automatically converts Date objects to the configured timezone
// when checking business hours
```

## Testing

Run the comprehensive test suite:

```bash
npm test -- src/__tests__/after-hours.test.ts
```

Tests cover:
- Business hours detection across all days
- Quiet hours detection (including overnight hours)
- Holiday management (all-day and time-based)
- Out-of-office mode date range checking
- Auto-reply conditional logic
- Configuration management
- Message personalization

## Debug Logging

The service includes comprehensive debug logging prefixed with `[AfterHours]`:

```typescript
[AfterHours] Config updated: default-config
[AfterHours] Within quiet hours, no auto-reply
[AfterHours] Outside business hours, sending auto-reply
[AfterHours] Holiday detected, sending auto-reply
[AfterHours] Out of office mode active, sending auto-reply
[AfterHours] Business hours updated for monday
[AfterHours] Holiday added: Christmas Day
[AfterHours] Auto-reply message updated
```

Check browser console or server logs for detailed execution flow.

## Production Checklist

- [ ] Update default business hours to match your clinic
- [ ] Add all relevant holidays for the year
- [ ] Set appropriate timezone
- [ ] Customize auto-reply messages
- [ ] Test with incoming SMS webhook
- [ ] Integrate into message receiving handler
- [ ] Add admin UI for managing hours/holidays (in settings page)
- [ ] Monitor SMS spend (quiet hours reduce costs)
- [ ] Set up auto-responder metrics/analytics
- [ ] Document out-of-office procedures for staff

## Performance Considerations

- Service uses in-memory storage (suitable for small configuration sets)
- Timezone conversion happens once per check (lightweight)
- Holiday lookup is O(n) on config size (typically <50 holidays)
- For high-volume messaging, consider caching the "should reply" decision

## Future Enhancements

1. **Persistence:** Store config in database instead of memory
2. **Per-Staff Hours:** Different hours per provider
3. **Smart Scheduling:** Auto-send replies only during optimal times
4. **Analytics:** Track auto-reply metrics and patterns
5. **Admin UI:** Settings page for managing all configuration
6. **Template System:** Multiple auto-reply templates by context
7. **Escalation:** Route urgent messages even outside hours
8. **Integration:** Connect with calendar system to detect appointments

## Related Files

- Messaging Service: `/src/services/messaging/core.ts`
- Messaging Types: `/src/types/messaging.ts`
- Reminders Service: `/src/services/messaging/reminders.ts`
- SMS Templates: `/src/lib/twilio.ts`
