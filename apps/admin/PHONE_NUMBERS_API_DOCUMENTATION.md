# Phone Number Management API Documentation

## Overview

The Phone Number Management API provides endpoints for provisioning, managing, and releasing Twilio phone numbers for clinic locations. Currently uses mocked Twilio API responses for development and testing.

## Architecture

### Files Created

1. **`/src/types/phone-numbers.ts`** - TypeScript type definitions
   - `PhoneNumberStatus` - Status enum for phone numbers
   - `AvailablePhoneNumber` - Available numbers from search
   - `ProvisionedPhoneNumber` - Owned phone numbers
   - Request/Response types for all operations

2. **`/src/lib/twilio-phone-numbers.ts`** - Mock Twilio service layer
   - In-memory phone number database (mock)
   - Search, provision, update, and release operations
   - Validation functions for phone numbers and area codes
   - Mock data seeding for testing
   - Simulates Twilio API with realistic delays

3. **`/src/app/api/settings/phone-numbers/route.ts`** - Main endpoints
   - `GET /api/settings/phone-numbers` - List all provisioned numbers
   - `GET /api/settings/phone-numbers?action=search&areaCode=415` - Search available
   - `POST /api/settings/phone-numbers` - Provision new number

4. **`/src/app/api/settings/phone-numbers/[numberId]/route.ts`** - Individual number endpoints
   - `GET /api/settings/phone-numbers/{numberId}` - Get number details
   - `PUT /api/settings/phone-numbers/{numberId}` - Update number settings
   - `DELETE /api/settings/phone-numbers/{numberId}` - Release number

## API Endpoints

### 1. List Provisioned Phone Numbers

**GET** `/api/settings/phone-numbers`

Returns all active provisioned phone numbers.

**Response:**
```json
{
  "success": true,
  "data": {
    "numbers": [
      {
        "id": "PN123ABC",
        "phoneNumber": "+14155551111",
        "friendlyName": "(415) 555-1111",
        "areaCode": "415",
        "status": "active",
        "locationId": "loc-001",
        "locationName": "Downtown Clinic",
        "purpose": "sms",
        "sid": "PN123ABC",
        "smsEnabled": true,
        "voiceEnabled": false,
        "monthlyRate": "1.00",
        "provisionedAt": "2024-12-01T10:00:00Z",
        "displayName": "Downtown - SMS Line",
        "tags": ["appointments", "reminders"]
      }
    ],
    "total": 1
  }
}
```

---

### 2. Search Available Phone Numbers

**GET** `/api/settings/phone-numbers?action=search&areaCode=415&limit=5`

Search for available phone numbers in a specific area code.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | Yes | Must be `search` |
| `areaCode` | string | Yes | 3-digit area code (e.g., 415) |
| `limit` | number | No | Max results (default: 5, max: 50) |

**Response:**
```json
{
  "success": true,
  "data": {
    "numbers": [
      {
        "phoneNumber": "+14155551234",
        "friendlyName": "(415) 555-1234",
        "areaCode": "415",
        "countryCode": "US",
        "lata": "686",
        "rateCenter": "SFRNCSCO",
        "capabilities": {
          "sms": true,
          "voice": true,
          "mms": true
        },
        "cost": "1.00"
      }
    ],
    "areaCode": "415",
    "totalAvailable": 3,
    "searchTime": 312
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid area code format. Use 3-digit format (e.g., 415)"
  }
}
```

---

### 3. Provision Phone Number

**POST** `/api/settings/phone-numbers`

Provision a new phone number for a clinic location.

**Request Body:**
```json
{
  "phoneNumber": "+14155551234",
  "locationId": "loc-001",
  "locationName": "Downtown Clinic",
  "purpose": "both",
  "displayName": "Downtown - Main Line",
  "smsEnabled": true,
  "voiceEnabled": true,
  "webhookUrl": "https://clinic.example.com/webhook/sms",
  "tags": ["main", "customer_support"]
}
```

**Request Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phoneNumber` | string | Yes | E.164 format (e.g., +14155551234) |
| `locationId` | string | Yes | Clinic location ID |
| `locationName` | string | Yes | Clinic location display name |
| `purpose` | enum | Yes | `sms` \| `voice` \| `both` \| `customer_support` |
| `smsEnabled` | boolean | No | Enable SMS (default: true for sms/both) |
| `voiceEnabled` | boolean | No | Enable voice (default: true for voice/both) |
| `displayName` | string | No | Display name for UI |
| `webhookUrl` | string | No | Webhook for incoming messages |
| `tags` | array | No | Tags for organization |

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "PNXYZ789",
    "phoneNumber": "+14155551234",
    "friendlyName": "(415) 555-1234",
    "areaCode": "415",
    "status": "active",
    "locationId": "loc-001",
    "locationName": "Downtown Clinic",
    "purpose": "both",
    "sid": "PNXYZ789",
    "smsEnabled": true,
    "voiceEnabled": true,
    "monthlyRate": "1.00",
    "provisionedAt": "2024-12-09T14:30:00Z",
    "displayName": "Downtown - Main Line",
    "tags": ["main", "customer_support"]
  }
}
```

---

### 4. Get Phone Number Details

**GET** `/api/settings/phone-numbers/{numberId}`

Get detailed information about a specific phone number.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `numberId` | string | Phone number ID (SID) |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "PN123ABC",
    "phoneNumber": "+14155551111",
    "friendlyName": "(415) 555-1111",
    "areaCode": "415",
    "status": "active",
    "locationId": "loc-001",
    "locationName": "Downtown Clinic",
    "assignedTo": {
      "id": "staff-001",
      "name": "Alice Johnson"
    },
    "purpose": "sms",
    "sid": "PN123ABC",
    "smsEnabled": true,
    "voiceEnabled": false,
    "monthlyRate": "1.00",
    "provisionedAt": "2024-12-01T10:00:00Z",
    "displayName": "Downtown - SMS Line",
    "tags": ["appointments", "reminders"],
    "webhookUrl": "https://clinic.example.com/webhook/sms"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Phone number not found"
  }
}
```

---

### 5. Update Phone Number Settings

**PUT** `/api/settings/phone-numbers/{numberId}`

Update phone number configuration and assignment.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `numberId` | string | Phone number ID (SID) |

**Request Body:**
```json
{
  "displayName": "Downtown - Premium SMS",
  "smsEnabled": true,
  "voiceEnabled": false,
  "locationId": "loc-002",
  "locationName": "Westside Clinic",
  "assignedTo": {
    "id": "staff-002",
    "name": "Bob Smith"
  },
  "tags": ["vip", "priority"],
  "webhookUrl": "https://clinic.example.com/webhook/sms",
  "purpose": "sms"
}
```

**Update Schema:**
| Field | Type | Description |
|-------|------|-------------|
| `displayName` | string | New display name |
| `smsEnabled` | boolean | Enable/disable SMS |
| `voiceEnabled` | boolean | Enable/disable voice |
| `locationId` | string | Reassign to location |
| `locationName` | string | New location name |
| `assignedTo` | object | Assign to staff member |
| `tags` | array | Update tags |
| `webhookUrl` | string | Update webhook URL |
| `purpose` | enum | Update purpose |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "PN123ABC",
    "phoneNumber": "+14155551111",
    "displayName": "Downtown - Premium SMS",
    "locationId": "loc-002",
    "locationName": "Westside Clinic",
    "assignedTo": {
      "id": "staff-002",
      "name": "Bob Smith"
    },
    "tags": ["vip", "priority"],
    "status": "active"
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Phone number not found"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Cannot update a released phone number"
  }
}
```

---

### 6. Release Phone Number

**DELETE** `/api/settings/phone-numbers/{numberId}`

Release a phone number (cannot be undone).

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `numberId` | string | Phone number ID (SID) |

**Query or Body Parameters (Optional):**
```json
{
  "reason": "Location closed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "PN123ABC",
    "phoneNumber": "+14155551111",
    "status": "released",
    "releasedAt": "2024-12-09T15:45:00Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "This phone number has already been released"
  }
}
```

---

## Mock Data

The system includes pre-seeded mock data for testing. Call `seedMockData()` to initialize:

```typescript
import { seedMockData } from '@/lib/twilio-phone-numbers'

seedMockData()
```

**Pre-loaded Numbers:**
- `+14155551111` - Downtown SMS line
- `+14155552222` - Downtown Main line (SMS + Voice)
- `+12125551111` - Westside SMS line
- More numbers available via search for area codes 415, 212, 323, 305

---

## Available Area Codes (Mock)

The mock Twilio service simulates availability for:
- **415** - San Francisco
- **212** - New York
- **323** - Los Angeles
- **305** - Miami

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `INVALID_INPUT` | 400 | Invalid phone number format or area code |
| `MISSING_REQUIRED_FIELD` | 400 | Missing required field |
| `NOT_FOUND` | 404 | Phone number not found |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Implementation Details

### Validation

**Phone Number Format:**
- Must be E.164 format: `+1NXXNXXXXXX` for US/Canada
- Example: `+14155551234`

**Area Code Format:**
- 3-digit US area codes
- First digit: 2-9
- Second digit: 0-9
- Third digit: 1-9
- Example: `415` (valid), `0415` (invalid)

### Phone Number Status Transitions

```
available → active → released
            ↓
        inactive
```

- **Available**: Found via search, not yet provisioned
- **Active**: Provisioned and in use
- **Inactive**: Provisioned but disabled
- **Released**: Permanently deprovisioned

### Capability Flags

Each phone number has individual capabilities:
- **smsEnabled**: Can receive/send SMS
- **voiceEnabled**: Can receive/make voice calls
- **purpose**: Primary use case (sms, voice, both, customer_support)

---

## Example Usage

### Search and Provision

```typescript
// Search for available numbers
const available = await fetch(
  '/api/settings/phone-numbers?action=search&areaCode=415&limit=5'
).then(r => r.json())

// Provision one
const provision = await fetch('/api/settings/phone-numbers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phoneNumber: available.data.numbers[0].phoneNumber,
    locationId: 'loc-001',
    locationName: 'Downtown Clinic',
    purpose: 'both',
    displayName: 'Downtown Main Line',
    tags: ['main', 'customer_support']
  })
}).then(r => r.json())

console.log(provision.data)
```

### Update Assignment

```typescript
await fetch('/api/settings/phone-numbers/PN123ABC', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    assignedTo: {
      id: 'staff-001',
      name: 'Alice Johnson'
    },
    displayName: 'Alice\'s Dedicated Line'
  })
}).then(r => r.json())
```

### Release Number

```typescript
await fetch('/api/settings/phone-numbers/PN123ABC', {
  method: 'DELETE',
  body: JSON.stringify({
    reason: 'No longer needed'
  })
}).then(r => r.json())
```

---

## Future Enhancements

When replacing mock data with real Twilio API:

1. Replace `getAvailableNumbers()` with `TwilioRestClient.availablePhoneNumbers.local.list()`
2. Replace provisioning with `TwilioRestClient.incomingPhoneNumbers.create()`
3. Add real webhook validation and signature verification
4. Implement proper error handling for Twilio API errors
5. Add rate limiting and caching
6. Store provisioned numbers in database instead of memory
7. Add audit logging for all operations
8. Implement number recycling/recovery workflows

---

## Testing

Run tests with:
```bash
npx ts-node test-phone-numbers-api.ts
```

Tests cover:
- Phone number validation
- Area code validation
- Search operations
- Provisioning
- Updates
- Release operations
- Location-based queries

---

## Notes

- All numbers are currently mocked with realistic API delays (100-500ms)
- Phone numbers persist in memory only (reset on server restart)
- In production, use real Twilio API with database persistence
- Webhook URLs are stored but not validated in mock mode
- SMS/Voice capabilities can be toggled independently
