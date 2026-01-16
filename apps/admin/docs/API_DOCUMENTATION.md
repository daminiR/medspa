# Patient Portal API Documentation

Production-ready REST API for the Medical Spa Patient Portal.

## Base URL

```
Development: http://localhost:3000/api/patient
Production: https://api.luxemedspa.com/api/patient
```

## Authentication

All endpoints (except registration, login, and public endpoints) require authentication via Bearer token.

```http
Authorization: Bearer <access_token>
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... },
    "validationErrors": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

---

## Authentication Endpoints

### POST /auth/register

Register a new patient account.

**Request Body:**
```json
{
  "email": "patient@example.com",
  "phone": "+15551234567",
  "password": "securePassword123",
  "firstName": "Jane",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-15",
  "gender": "FEMALE",
  "referralCode": "SARAH25",
  "marketingOptIn": true,
  "smsOptIn": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "patient@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "fullName": "Jane Doe",
      "emailVerified": false,
      "phoneVerified": false,
      "createdAt": "2024-12-11T10:00:00Z"
    },
    "patient": {
      "id": "patient-123",
      "referralCode": "JANE25",
      "availableCredits": 25
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresAt": "2024-12-11T10:15:00Z"
  }
}
```

### POST /auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "patient@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "patient": { ... },
    "accessToken": "...",
    "refreshToken": "...",
    "expiresAt": "..."
  }
}
```

### POST /auth/refresh

Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresAt": "..."
  }
}
```

### POST /auth/logout

Logout and invalidate session.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### GET /auth/me

Get current authenticated user.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "patient": { ... },
    "referralProgram": { ... },
    "notificationPreferences": { ... }
  }
}
```

---

## Appointments Endpoints

### GET /appointments

List patient's appointments.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |
| status | string | Filter by status (PENDING, CONFIRMED, etc.) |
| upcoming | boolean | Only show upcoming appointments |
| past | boolean | Only show past appointments |
| startDate | string | Filter from date (ISO 8601) |
| endDate | string | Filter to date (ISO 8601) |

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "apt-123",
      "serviceName": "Botox Consultation",
      "providerName": "Dr. Susan Lo",
      "locationName": "Beverly Hills",
      "startTime": "2024-12-15T14:00:00Z",
      "endTime": "2024-12-15T14:30:00Z",
      "duration": 30,
      "status": "CONFIRMED",
      "price": 200,
      "depositRequired": false,
      "depositPaid": false
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### GET /appointments/:id

Get appointment details.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "apt-123",
    "serviceName": "Botox Consultation",
    "serviceCategory": "aesthetics",
    "provider": {
      "id": "provider-1",
      "name": "Dr. Susan Lo",
      "title": "Aesthetic Specialist"
    },
    "location": {
      "id": "loc-1",
      "name": "Beverly Hills",
      "address": "123 Luxury Ave, Beverly Hills, CA 90210"
    },
    "startTime": "2024-12-15T14:00:00Z",
    "endTime": "2024-12-15T14:30:00Z",
    "duration": 30,
    "status": "CONFIRMED",
    "price": 200,
    "patientNotes": "First time visit",
    "remindersSent": [
      { "type": "sms", "sentAt": "2024-12-14T14:00:00Z" }
    ]
  }
}
```

### POST /appointments/book

Book a new appointment.

**Request Body:**
```json
{
  "serviceId": "s5",
  "providerId": "4",
  "locationId": "loc-1",
  "startTime": "2024-12-20T10:00:00Z",
  "patientNotes": "First time visit for Botox"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "message": "Appointment booked successfully",
    "appointment": { ... },
    "confirmationNumber": "APT-XYZ12345",
    "depositRequired": false
  }
}
```

### PATCH /appointments/:id/reschedule

Reschedule an appointment.

**Request Body:**
```json
{
  "newStartTime": "2024-12-22T14:00:00Z",
  "reason": "Schedule conflict"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Appointment rescheduled successfully",
    "appointment": {
      "originalStartTime": "2024-12-20T10:00:00Z",
      "newStartTime": "2024-12-22T14:00:00Z"
    },
    "rescheduleFee": null
  }
}
```

### DELETE /appointments/:id

Cancel an appointment.

**Request Body:**
```json
{
  "reason": "Unable to attend"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Appointment cancelled successfully",
    "appointment": {
      "id": "apt-123",
      "status": "CANCELLED",
      "cancelledAt": "2024-12-11T10:00:00Z"
    },
    "cancellationFee": null,
    "refundAmount": null
  }
}
```

### GET /appointments/available-slots

Get available appointment slots.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| serviceId | string | Yes | Service ID |
| locationId | string | Yes | Location ID |
| date | string | Yes | Date (YYYY-MM-DD) |
| providerId | string | No | Filter by provider |

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "date": "2024-12-20",
    "service": {
      "id": "s5",
      "name": "Botox Consultation",
      "duration": 30,
      "price": 200
    },
    "providers": [
      { "id": "4", "name": "Susan Lo", "title": "Aesthetics" }
    ],
    "slots": [
      {
        "startTime": "2024-12-20T10:00:00Z",
        "endTime": "2024-12-20T10:30:00Z",
        "providerId": "4",
        "providerName": "Susan Lo",
        "available": true
      }
    ],
    "availableCount": 12,
    "totalCount": 16
  }
}
```

---

## Profile Endpoints

### GET /profile

Get patient profile.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-123",
      "email": "patient@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "fullName": "Jane Doe",
      "dateOfBirth": "1990-01-15",
      "gender": "FEMALE"
    },
    "patient": {
      "allergies": ["Penicillin"],
      "medications": [],
      "conditions": [],
      "emergencyContact": {
        "name": "John Doe",
        "phone": "+15559876543",
        "relationship": "Spouse"
      },
      "address": {
        "street": "123 Main St",
        "city": "Los Angeles",
        "state": "CA",
        "zipCode": "90210"
      },
      "preferredLocationId": "loc-1",
      "marketingOptIn": true,
      "smsOptIn": true
    },
    "referralProgram": { ... },
    "notificationPreferences": { ... }
  }
}
```

### PATCH /profile

Update patient profile.

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+15551234567",
  "allergies": ["Penicillin", "Latex"],
  "emergencyContactName": "John Smith",
  "emergencyContactPhone": "+15559876543",
  "emergencyContactRelationship": "Spouse"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Profile updated successfully",
    "user": { ... },
    "patient": { ... }
  }
}
```

### POST /profile/photo

Upload profile photo.

**Request:** Multipart form data with `file` field.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Profile photo uploaded successfully",
    "avatarUrl": "https://storage.luxemedspa.com/avatars/..."
  }
}
```

---

## Payment Methods Endpoints

### GET /payment-methods

List payment methods.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "paymentMethods": [
      {
        "id": "pm-123",
        "type": "card",
        "cardBrand": "Visa",
        "cardLast4": "4242",
        "cardExpMonth": 12,
        "cardExpYear": 2026,
        "isDefault": true
      }
    ],
    "defaultMethodId": "pm-123"
  }
}
```

### POST /payment-methods

Add a payment method.

**Request Body:**
```json
{
  "type": "CARD",
  "stripePaymentMethodId": "pm_1234567890",
  "setDefault": true
}
```

### PATCH /payment-methods/:id

Update payment method.

**Request Body:**
```json
{
  "setDefault": true
}
```

### DELETE /payment-methods/:id

Remove payment method.

---

## Payments Endpoints

### POST /payments/process

Process a payment.

**Request Body:**
```json
{
  "appointmentId": "apt-123",
  "paymentMethodId": "pm-123",
  "amount": 200,
  "tip": 20,
  "isHsaFsa": false
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "message": "Payment processed successfully",
    "payment": {
      "id": "pay-123",
      "amount": 200,
      "tip": 20,
      "totalAmount": 220,
      "status": "SUCCEEDED",
      "receiptUrl": "https://receipt.luxemedspa.com/..."
    }
  }
}
```

---

## Referrals Endpoints

### GET /referrals/program

Get referral program details.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "rp-123",
    "referralCode": "JANE25",
    "shareUrl": "https://luxemedspa.com/ref/JANE25",
    "totalReferrals": 5,
    "pendingReferrals": 2,
    "successfulReferrals": 3,
    "totalEarnings": 75,
    "availableCredits": 50,
    "milestones": [
      {
        "count": 5,
        "title": "First 5 Referrals",
        "reward": 10,
        "achieved": true
      }
    ],
    "rewards": {
      "referrerReward": 25,
      "refereeReward": 25,
      "referralExpiration": 90
    }
  }
}
```

### GET /referrals/history

Get referral history.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "referrals": [
      {
        "id": "ref-123",
        "refereeName": "Emily Johnson",
        "status": "COMPLETED",
        "referrerReward": 25,
        "completedAt": "2024-12-05T10:00:00Z"
      }
    ],
    "stats": {
      "total": 5,
      "pending": 1,
      "signedUp": 1,
      "completed": 3
    }
  }
}
```

### POST /referrals/share

Track a share event.

**Request Body:**
```json
{
  "method": "SMS",
  "recipients": ["+15551234567", "+15559876543"],
  "message": "Check out Luxe MedSpa!"
}
```

### POST /referrals/apply

Apply a referral code.

**Request Body:**
```json
{
  "code": "SARAH25"
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| INVALID_CREDENTIALS | 401 | Wrong email/password |
| TOKEN_EXPIRED | 401 | Access token expired |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Invalid input data |
| ALREADY_EXISTS | 409 | Resource already exists |
| SLOT_NOT_AVAILABLE | 409 | Appointment slot taken |
| PAYMENT_FAILED | 402 | Payment processing failed |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## Rate Limiting

- **Authentication endpoints:** 5 requests per minute per IP
- **General endpoints:** 100 requests per minute per user
- **File uploads:** 10 requests per hour per user

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702300800
```

---

## HIPAA Compliance

All API endpoints follow HIPAA guidelines:
- All data is encrypted in transit (TLS 1.3)
- PHI is encrypted at rest (AES-256)
- All access is logged and auditable
- Automatic session timeout after 15 minutes
- IP-based access restrictions available

---

## SDK & Libraries

### React Native / Expo
```typescript
import { authService, appointmentsService, referralsService } from '@/services/api';

// Login
const response = await authService.login({ email, password });

// Get appointments
const appointments = await appointmentsService.getUpcoming();

// Get referral program
const program = await referralsService.getReferralProgram();
```

### Web (React)
```typescript
import { createPatientApiClient } from '@medical-spa/api-client/patient';

const api = createPatientApiClient({
  baseUrl: 'https://api.luxemedspa.com',
  getToken: async () => localStorage.getItem('token'),
});

const appointments = await api.appointments.list({ upcoming: true });
```
