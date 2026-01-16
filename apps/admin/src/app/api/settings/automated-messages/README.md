# Automated Messaging Settings API

## Overview

This API manages automated message configurations for various events in the medical spa platform. It supports SMS, email, and complex message templates with variable substitution.

## Endpoints

### GET /api/settings/automated-messages
Retrieve all automated message configurations.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "appointment_booked",
      "eventType": "appointment_booked",
      "enabled": true,
      "channels": ["sms", "email"],
      "timing": {
        "type": "immediate"
      },
      "triggers": {
        "onlineBookings": true,
        "staffBookings": true
      },
      "template": {
        "subject": "Appointment Confirmed",
        "body": "Hi {{firstName}}, your {{serviceName}} appointment...",
        "variables": ["firstName", "serviceName", "appointmentDate", "appointmentTime", "providerName"]
      },
      "internalNotification": {
        "enabled": true,
        "recipients": ["admin@medspa.com"]
      }
    }
  ],
  "total": 16
}
```

### POST /api/settings/automated-messages
Create a new automated message configuration.

**Request Body:**
```json
{
  "eventType": "custom_event",
  "enabled": true,
  "channels": ["sms", "email"],
  "timing": {
    "type": "before_appointment",
    "value": 24,
    "unit": "hours"
  },
  "triggers": {
    "onlineBookings": true,
    "staffBookings": false,
    "specificServices": ["service-1", "service-2"]
  },
  "template": {
    "subject": "Reminder",
    "body": "Hi {{firstName}}, reminder about {{serviceName}} tomorrow",
    "variables": ["firstName", "serviceName"]
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": { ...configuration },
  "message": "Automated message configuration created successfully"
}
```

### GET /api/settings/automated-messages/[eventType]
Get a specific event type configuration.

**Parameters:**
- `eventType` (string, required) - One of the valid EventType values

**Valid Event Types:**
- `appointment_booked`
- `appointment_canceled`
- `appointment_rescheduled`
- `check_in_reminder`
- `patient_waiting`
- `provider_ready`
- `sale_closed`
- `gift_card_purchased`
- `gift_card_received`
- `membership_started`
- `membership_renewal_reminder`
- `membership_renewed`
- `membership_canceled`
- `form_submitted`
- `waitlist_added`
- `waitlist_opening`

**Response:**
```json
{
  "success": true,
  "data": { ...configuration }
}
```

### PUT /api/settings/automated-messages/[eventType]
Update a specific event type configuration.

**Request Body (all fields optional):**
```json
{
  "enabled": false,
  "channels": ["sms"],
  "timing": {
    "type": "immediate"
  },
  "triggers": {
    "onlineBookings": true,
    "staffBookings": true
  },
  "template": {
    "body": "New message body with {{variables}}"
  },
  "internalNotification": {
    "enabled": true,
    "recipients": ["staff@medspa.com"]
  },
  "confirmationRequest": {
    "enabled": true,
    "setStatusUnconfirmed": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { ...updated_configuration },
  "message": "Configuration for event type \"appointment_booked\" updated successfully"
}
```

### DELETE /api/settings/automated-messages/[eventType]
Delete a specific event type configuration.

**Response:**
```json
{
  "success": true,
  "data": {
    "eventType": "appointment_booked",
    "deletedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Configuration for event type \"appointment_booked\" deleted successfully"
}
```

## Features

### Message Templates
- Support for variable substitution using `{{variableName}}` syntax
- Different templates per event type
- Separate subject line support for email
- Automatic variable tracking and validation

### Timing Options
- **immediate**: Send right away when event triggers
- **before_appointment**: Send N minutes/hours/days before appointment
- **after_event**: Send N minutes/hours/days after event

### Channels
- **sms**: Send via SMS/Twilio
- **email**: Send via email service

### Triggers
- **onlineBookings**: Send for appointments booked through online portal
- **staffBookings**: Send for appointments created by staff
- **specificServices**: Optional - limit to specific services (empty = all services)

### Advanced Features
- **Internal Notifications**: Alert staff via email when events occur
- **Confirmation Requests**: Request appointment confirmation with C/R reply codes
- **Timeline Reminders**: Multiple reminders at different times before events
- **Check-in Instructions**: Custom instructions for check-in messages

## Storage

Currently stores in memory using JavaScript object. In production, this would be replaced with a database (Firebase, PostgreSQL, MongoDB, etc.)

### Migration to Database

The in-memory store uses this pattern:
```typescript
let automatedMessageConfigs: Record<string, AutomatedMessageConfig> = { ...DEFAULT_AUTOMATED_MESSAGE_CONFIGS };
```

To migrate to a database:
1. Replace the in-memory object with database queries
2. Update GET to query the database
3. Update POST to insert into database
4. Update PUT to update database records
5. Update DELETE to soft/hard delete from database

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "details": [] // Optional: detailed validation errors
}
```

### Status Codes
- `200 OK` - Successful GET/PUT
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid input data
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists (POST)
- `500 Internal Server Error` - Server error

## Validation

Using Zod for schema validation:
- Event types must be from predefined list
- Channels must be 'sms' or 'email'
- Timing types must be valid
- Template body is required, subject optional
- Variables array must contain template variable names

## Usage Examples

### JavaScript/Fetch

```javascript
// Get all configurations
const configs = await fetch('/api/settings/automated-messages')
  .then(r => r.json());

// Get specific event configuration
const appointmentConfig = await fetch('/api/settings/automated-messages/appointment_booked')
  .then(r => r.json());

// Update configuration
const updated = await fetch('/api/settings/automated-messages/appointment_booked', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    enabled: true,
    channels: ['sms'],
    template: {
      body: 'Hi {{firstName}}, new message'
    }
  })
})
.then(r => r.json());

// Delete configuration
const deleted = await fetch('/api/settings/automated-messages/appointment_booked', {
  method: 'DELETE'
})
.then(r => r.json());
```

### React Hook Usage

```typescript
import { useEffect, useState } from 'react';

export function AutomatedMessagesSettings() {
  const [configs, setConfigs] = useState<AutomatedMessageConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings/automated-messages')
      .then(r => r.json())
      .then(data => {
        setConfigs(data.data);
        setLoading(false);
      });
  }, []);

  const handleUpdate = async (eventType: string, updates: Partial<AutomatedMessageConfig>) => {
    const response = await fetch(`/api/settings/automated-messages/${eventType}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return response.json();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {configs.map(config => (
        <div key={config.id}>
          <h3>{config.eventType}</h3>
          <label>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => handleUpdate(config.eventType, { enabled: e.target.checked })}
            />
            Enabled
          </label>
        </div>
      ))}
    </div>
  );
}
```

## Testing

Test the endpoints with curl:

```bash
# Get all configurations
curl http://localhost:3000/api/settings/automated-messages

# Get specific event type
curl http://localhost:3000/api/settings/automated-messages/appointment_booked

# Update configuration
curl -X PUT http://localhost:3000/api/settings/automated-messages/appointment_booked \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": false,
    "channels": ["sms"]
  }'

# Delete configuration
curl -X DELETE http://localhost:3000/api/settings/automated-messages/appointment_booked
```
