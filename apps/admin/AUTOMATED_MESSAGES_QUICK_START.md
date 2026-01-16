# Automated Messaging Settings API - Quick Start Guide

## What Was Built

Two backend API endpoints for managing automated messages in the medical spa platform:

1. **Main Endpoint:** `/api/settings/automated-messages`
2. **Event Type Endpoint:** `/api/settings/automated-messages/[eventType]`

## Quick Test

### Using curl

```bash
# Start the dev server
npm run dev

# In another terminal, test the API

# Get all configurations
curl http://localhost:3000/api/settings/automated-messages

# Get specific event type
curl http://localhost:3000/api/settings/automated-messages/appointment_booked

# Update a configuration
curl -X PUT http://localhost:3000/api/settings/automated-messages/appointment_booked \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": false,
    "channels": ["sms"]
  }'

# Delete a configuration
curl -X DELETE http://localhost:3000/api/settings/automated-messages/appointment_booked
```

## Using in React

```typescript
import { useEffect, useState } from 'react';
import { AutomatedMessageConfig } from '@/types/messaging';

export function AutomatedMessagesPage() {
  const [configs, setConfigs] = useState<AutomatedMessageConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all configurations
  useEffect(() => {
    fetch('/api/settings/automated-messages')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setConfigs(data.data);
        } else {
          setError(data.error);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Update a configuration
  const handleUpdate = async (eventType: string, updates: Partial<AutomatedMessageConfig>) => {
    const response = await fetch(`/api/settings/automated-messages/${eventType}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    const data = await response.json();
    return data;
  };

  // Toggle enabled/disabled
  const toggleEnabled = async (config: AutomatedMessageConfig) => {
    const result = await handleUpdate(config.eventType, { enabled: !config.enabled });
    if (result.success) {
      setConfigs(configs.map(c => c.eventType === config.eventType ? result.data : c));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Automated Messages</h1>

      {configs.map(config => (
        <div key={config.id} className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{config.eventType}</h3>
              <p className="text-sm text-gray-600">Channels: {config.channels.join(', ')}</p>
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={() => toggleEnabled(config)}
                className="mr-2"
              />
              Enabled
            </label>
          </div>

          {config.template && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-sm text-gray-700">{config.template.body}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Example: Creating a Custom Automated Message

```typescript
const newConfig = {
  eventType: 'birthday_greeting',
  enabled: true,
  channels: ['sms', 'email'],
  timing: {
    type: 'immediate'
  },
  triggers: {
    onlineBookings: true,
    staffBookings: true
  },
  template: {
    subject: 'Happy Birthday!',
    body: 'Hi {{firstName}}, happy birthday from {{businessName}}! Enjoy a special offer on us.',
    variables: ['firstName', 'businessName']
  }
};

// Create it
const response = await fetch('/api/settings/automated-messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newConfig)
});

const result = await response.json();
console.log(result.data);
```

## Example: Updating Reminder Timing

```typescript
// Update appointment reminder to send 2 days before instead of immediately
const updates = {
  timing: {
    type: 'before_appointment',
    value: 2,
    unit: 'days'
  }
};

const response = await fetch('/api/settings/automated-messages/appointment_booked', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updates)
});

const result = await response.json();
console.log('Updated:', result.data);
```

## Example: Conditional Messages by Service

```typescript
// Only send check-in reminders for Botox and Fillers services
const updates = {
  triggers: {
    onlineBookings: true,
    staffBookings: true,
    specificServices: ['service-botox', 'service-fillers']
  }
};

const response = await fetch('/api/settings/automated-messages/check_in_reminder', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updates)
});

const result = await response.json();
```

## Example: Internal Staff Notifications

```typescript
// Alert staff when new forms are submitted
const updates = {
  internalNotification: {
    enabled: true,
    recipients: ['admin@medspa.com', 'office@medspa.com']
  }
};

const response = await fetch('/api/settings/automated-messages/form_submitted', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updates)
});

const result = await response.json();
```

## Example: Appointment Confirmation Requests

```typescript
// Request confirmation for appointment reminders
const updates = {
  confirmationRequest: {
    enabled: true,
    setStatusUnconfirmed: true  // Mark appointment as unconfirmed until patient responds
  }
};

const response = await fetch('/api/settings/automated-messages/appointment_rescheduled', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updates)
});

const result = await response.json();
```

## Default Event Types

The API comes with 16 pre-configured event types:

| Event Type | Default Channel | When Sent |
|------------|-----------------|-----------|
| `appointment_booked` | SMS + Email | Immediately after booking |
| `appointment_canceled` | SMS + Email | When appointment cancelled |
| `appointment_rescheduled` | SMS + Email | When appointment date/time changes |
| `check_in_reminder` | SMS | 15 min before appointment |
| `patient_waiting` | SMS | When patient checks in |
| `provider_ready` | SMS | When provider ready to see patient |
| `sale_closed` | SMS + Email | After purchase/transaction |
| `gift_card_purchased` | SMS + Email | After gift card purchase |
| `gift_card_received` | SMS + Email | When patient receives gift card |
| `membership_started` | SMS + Email | When membership begins |
| `membership_renewal_reminder` | SMS + Email | 7 days before expiration |
| `membership_renewed` | SMS + Email | After renewal |
| `membership_canceled` | SMS + Email | When cancelled |
| `form_submitted` | SMS + Email | When form completed |
| `waitlist_added` | SMS + Email | When added to waitlist |
| `waitlist_opening` | SMS + Email | When slot becomes available |

## Files Created

1. `/src/app/api/settings/automated-messages/route.ts` - Main API endpoint
2. `/src/app/api/settings/automated-messages/[eventType]/route.ts` - Dynamic event type endpoint
3. `/src/app/api/settings/automated-messages/README.md` - Full API documentation
4. `/src/__tests__/api/automated-messages.test.ts` - Comprehensive test suite
5. `/AUTOMATED_MESSAGES_API_SUMMARY.md` - Implementation details
6. `/AUTOMATED_MESSAGES_QUICK_START.md` - This file

## API Response Format

All endpoints return consistent JSON responses:

```typescript
// Success response
{
  success: true,
  data: AutomatedMessageConfig | AutomatedMessageConfig[],
  message?: string,
  total?: number
}

// Error response
{
  success: false,
  error: string,
  details?: any[]
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success (GET, PUT) |
| `201` | Created (POST) |
| `400` | Bad Request (validation error) |
| `404` | Not Found |
| `409` | Conflict (already exists) |
| `500` | Server Error |

## Variable Substitution

Templates support variable substitution with `{{variableName}}` syntax:

```
Hi {{firstName}}, your {{serviceName}} appointment is {{appointmentDate}} at {{appointmentTime}}.
```

Variables are defined in the template configuration and will be replaced when the message is sent.

## Storage Location

Currently stores in-memory. Data files are located at:
- Route store: `/src/app/api/settings/automated-messages/route.ts` (lines 284-363)
- Exported variable: `automatedMessageConfigs`

To persist to a database, replace the in-memory store with database calls.

## Troubleshooting

### 400 Bad Request
- Check that all required fields are present
- Verify channels are 'sms' or 'email'
- Ensure timing type is one of: 'immediate', 'before_appointment', 'after_event'
- Confirm template.body is not empty

### 404 Not Found
- Event type may not exist in the predefined list
- Check spelling of event type
- Use GET to list all valid event types first

### 409 Conflict
- Configuration already exists for this event type
- Use PUT to update instead of POST

### Data Lost After Restart
- Data is stored in-memory
- It resets to defaults on server restart
- Migrate to database for persistence

## Next Steps

1. **Create UI Components**
   - Settings page for automated messages
   - Event type selector
   - Template editor
   - Channel selection
   - Timing configuration

2. **Connect to Message Sending**
   - Hook settings into actual message sending service
   - Implement variable substitution
   - Add message queue integration

3. **Add Database Persistence**
   - Choose database (Firebase, PostgreSQL, MongoDB)
   - Replace in-memory store with database queries
   - Add migrations

4. **Add Testing**
   - Unit tests for validation
   - Integration tests for endpoints
   - E2E tests for full workflows

5. **Add Monitoring**
   - Track message delivery
   - Monitor event triggers
   - Log configuration changes

## Support

For more detailed information, see:
- `/src/app/api/settings/automated-messages/README.md` - Full API documentation
- `/AUTOMATED_MESSAGES_API_SUMMARY.md` - Implementation details
- `/src/__tests__/api/automated-messages.test.ts` - Test examples
