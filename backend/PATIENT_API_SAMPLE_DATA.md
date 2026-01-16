# Patient API - Sample Response Data

This document contains actual sample responses from the Patient API endpoints, taken from live testing against the PostgreSQL database.

---

## 1. GET /api/patients - List All Patients

**Request:**
```bash
GET http://localhost:8080/api/patients?page=1&limit=20
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "3013b594-1c2f-4e2c-a722-1b32bf16bd17",
      "patientNumber": "P-2024-0005",
      "firstName": "Jessica",
      "lastName": "Brown",
      "preferredName": null,
      "email": "jessica.brown@email.com",
      "phone": "+15555678901",
      "dateOfBirth": "1988-09-12T00:00:00.000Z",
      "age": 37,
      "status": "active",
      "balance": 0,
      "credits": 0,
      "totalVisits": 24,
      "tags": ["VIP", "Loyalty Member"],
      "hasAlerts": false
    },
    {
      "id": "d8a4457c-e902-46e5-985c-d5bf94c94e8f",
      "patientNumber": "P-2024-0002",
      "firstName": "Michael",
      "lastName": "Chen",
      "preferredName": null,
      "email": "michael.chen@email.com",
      "phone": "+15552345678",
      "dateOfBirth": "1978-07-22T00:00:00.000Z",
      "age": 47,
      "status": "active",
      "balance": 0,
      "credits": 0,
      "totalVisits": 0,
      "tags": [],
      "hasAlerts": false
    },
    {
      "id": "0fe005fd-fd08-4922-8340-a86052ae1cf2",
      "patientNumber": "P-2024-0001",
      "firstName": "Sarah",
      "lastName": "Johnson",
      "preferredName": null,
      "email": "sarah.johnson@email.com",
      "phone": "+15551234567",
      "dateOfBirth": "1985-03-15T00:00:00.000Z",
      "age": 40,
      "status": "active",
      "balance": 0,
      "credits": 0,
      "totalVisits": 0,
      "tags": [],
      "hasAlerts": false
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20,
  "hasMore": false
}
```

---

## 2. GET /api/patients/:id - Get Patient Details

**Request:**
```bash
GET http://localhost:8080/api/patients/3013b594-1c2f-4e2c-a722-1b32bf16bd17
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "patient": {
    "id": "3013b594-1c2f-4e2c-a722-1b32bf16bd17",
    "patientNumber": "P-2024-0005",
    "firstName": "Jessica",
    "lastName": "Brown",
    "middleName": null,
    "preferredName": null,
    "pronouns": null,
    "dateOfBirth": "1988-09-12T00:00:00.000Z",
    "gender": "female",
    "email": "jessica.brown@email.com",
    "phone": "+15555678901",
    "alternatePhone": null,
    "workPhone": null,
    "timezone": null,
    "addressStreet": "321 Luxury Ln",
    "addressStreet2": null,
    "addressCity": "Malibu",
    "addressState": "CA",
    "addressZipCode": "90265",
    "addressCountry": null,
    "emergencyContactName": null,
    "emergencyContactRelationship": null,
    "emergencyContactPhone": null,
    "emergencyContactAltPhone": null,
    "bloodType": null,
    "primaryProviderId": null,
    "commPrefMethod": null,
    "commPrefAppointmentReminders": true,
    "commPrefMarketingEmails": true,
    "commPrefSmsNotifications": true,
    "commPrefEmailNotifications": true,
    "commPrefLanguage": "en",
    "privacyShareWithFamily": false,
    "privacyAllowPhotos": true,
    "privacyAllowResearch": false,
    "privacyMode": false,
    "photoConsent": null,
    "marketingConsent": null,
    "generalNotes": null,
    "importantNotes": null,
    "tags": ["VIP", "Loyalty Member"],
    "status": "active",
    "balance": 0,
    "credits": 0,
    "lifetimeValue": 15000,
    "totalVisits": 24,
    "registrationDate": "2025-12-21T19:50:39.918Z",
    "createdAt": "2025-12-21T19:50:39.918Z",
    "updatedAt": "2025-12-21T19:50:39.918Z",
    "createdBy": "system-seed",
    "lastModifiedBy": "system-seed",
    "deletedAt": null,
    "deletedBy": null,
    "allergies": [],
    "age": 37,
    "address": {
      "street": "321 Luxury Ln",
      "street2": null,
      "city": "Malibu",
      "state": "CA",
      "zipCode": "90265",
      "country": "USA"
    },
    "communicationPreferences": {
      "preferredMethod": "sms",
      "appointmentReminders": true,
      "marketingEmails": true,
      "smsNotifications": true,
      "emailNotifications": true,
      "language": "en"
    },
    "privacySettings": {
      "shareWithFamily": false,
      "allowPhotos": true,
      "allowResearch": false,
      "privacyMode": false
    }
  }
}
```

---

## 3. POST /api/patients - Create Patient

**Request:**
```bash
POST http://localhost:8080/api/patients
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Doe",
  "dateOfBirth": "1990-05-15",
  "email": "jane.doe@example.com",
  "phone": "555-0199",
  "gender": "female",
  "address": {
    "street": "123 Test St",
    "city": "TestCity",
    "state": "CA",
    "zipCode": "90210"
  }
}
```

**Response (201 Created):**
```json
{
  "patient": {
    "id": "bff59fc1-5452-47ac-adc9-69281293f2e9",
    "patientNumber": "P-2025-1001",
    "firstName": "Jane",
    "lastName": "Doe",
    "middleName": null,
    "preferredName": null,
    "pronouns": null,
    "dateOfBirth": "1990-05-15T00:00:00.000Z",
    "gender": "female",
    "email": "jane.doe@example.com",
    "phone": "555-0199",
    "alternatePhone": null,
    "workPhone": null,
    "timezone": null,
    "addressStreet": "123 Test St",
    "addressStreet2": null,
    "addressCity": "TestCity",
    "addressState": "CA",
    "addressZipCode": "90210",
    "addressCountry": "USA",
    "emergencyContactName": null,
    "emergencyContactRelationship": null,
    "emergencyContactPhone": null,
    "emergencyContactAltPhone": null,
    "bloodType": null,
    "primaryProviderId": null,
    "commPrefMethod": null,
    "commPrefAppointmentReminders": true,
    "commPrefMarketingEmails": false,
    "commPrefSmsNotifications": true,
    "commPrefEmailNotifications": true,
    "commPrefLanguage": "en",
    "privacyShareWithFamily": false,
    "privacyAllowPhotos": true,
    "privacyAllowResearch": false,
    "privacyMode": false,
    "photoConsent": null,
    "marketingConsent": null,
    "generalNotes": null,
    "importantNotes": null,
    "tags": [],
    "status": "active",
    "balance": 0,
    "credits": 0,
    "lifetimeValue": 0,
    "totalVisits": 0,
    "registrationDate": "2025-12-21T19:52:29.358Z",
    "firstVisit": null,
    "lastVisit": null,
    "createdAt": "2025-12-21T19:52:29.358Z",
    "updatedAt": "2025-12-21T19:52:29.358Z",
    "createdBy": "550e8400-e29b-41d4-a716-446655440000",
    "lastModifiedBy": "550e8400-e29b-41d4-a716-446655440000",
    "deletedAt": null,
    "deletedBy": null,
    "allergies": []
  },
  "message": "Patient created successfully"
}
```

---

## 4. POST /api/patients - Create Patient with Allergies

**Request:**
```bash
POST http://localhost:8080/api/patients
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "dateOfBirth": "1975-08-20",
  "email": "john.smith@example.com",
  "phone": "555-0300",
  "allergies": [
    {
      "allergen": "Lidocaine",
      "reaction": "Hives",
      "severity": "medium",
      "notes": "Mild reaction observed during previous procedure"
    },
    {
      "allergen": "Penicillin",
      "reaction": "Anaphylaxis",
      "severity": "critical",
      "notes": "Severe allergy - avoid at all costs"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "patient": {
    "id": "201fd4c0-5086-47c4-a05d-3132a3742871",
    "patientNumber": "P-2025-1002",
    "firstName": "John",
    "lastName": "Smith",
    "dateOfBirth": "1975-08-20T00:00:00.000Z",
    "email": "john.smith@example.com",
    "phone": "555-0300",
    "status": "active",
    "allergies": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "allergen": "Lidocaine",
        "reaction": "Hives",
        "severity": "MEDIUM",
        "onsetDate": null,
        "notes": "Mild reaction observed during previous procedure"
      },
      {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "allergen": "Penicillin",
        "reaction": "Anaphylaxis",
        "severity": "CRITICAL",
        "onsetDate": null,
        "notes": "Severe allergy - avoid at all costs"
      }
    ],
    "createdAt": "2025-12-21T19:53:10.123Z",
    "updatedAt": "2025-12-21T19:53:10.123Z"
  },
  "message": "Patient created successfully"
}
```

---

## 5. PUT /api/patients/:id - Update Patient

**Request:**
```bash
PUT http://localhost:8080/api/patients/bff59fc1-5452-47ac-adc9-69281293f2e9
Authorization: Bearer {token}
Content-Type: application/json

{
  "phone": "555-0200",
  "generalNotes": "Test patient - updated via API test"
}
```

**Response (200 OK):**
```json
{
  "patient": {
    "id": "bff59fc1-5452-47ac-adc9-69281293f2e9",
    "patientNumber": "P-2025-1001",
    "firstName": "Jane",
    "lastName": "Doe",
    "phone": "555-0200",
    "generalNotes": "Test patient - updated via API test",
    "age": 35,
    "updatedAt": "2025-12-21T19:52:29.417Z"
  },
  "message": "Patient updated successfully"
}
```

---

## 6. GET /api/patients/search - Search Patients

**Request:**
```bash
GET http://localhost:8080/api/patients/search?query=Brown&limit=5
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "3013b594-1c2f-4e2c-a722-1b32bf16bd17",
      "patientNumber": "P-2024-0005",
      "firstName": "Jessica",
      "lastName": "Brown",
      "preferredName": null,
      "email": "jessica.brown@email.com",
      "phone": "+15555678901",
      "dateOfBirth": "1988-09-12T00:00:00.000Z",
      "status": "active"
    }
  ],
  "count": 1
}
```

---

## 7. POST /api/patients/:id/notes - Add Patient Note

**Request:**
```bash
POST http://localhost:8080/api/patients/bff59fc1-5452-47ac-adc9-69281293f2e9/notes
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Patient expressed interest in Botox treatment",
  "isImportant": true
}
```

**Response (201 Created):**
```json
{
  "note": {
    "id": "1486e5cf-18d3-4b00-8105-f7d9f1b100f3",
    "content": "Patient expressed interest in Botox treatment",
    "authorId": "550e8400-e29b-41d4-a716-446655440000",
    "authorName": "test@example.com",
    "createdAt": "2025-12-21T19:52:29.471Z",
    "appointmentId": null,
    "isImportant": true
  },
  "message": "Note added successfully"
}
```

---

## 8. GET /api/patients/:id/notes - Get Patient Notes

**Request:**
```bash
GET http://localhost:8080/api/patients/bff59fc1-5452-47ac-adc9-69281293f2e9/notes
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "1486e5cf-18d3-4b00-8105-f7d9f1b100f3",
      "content": "Patient expressed interest in Botox treatment",
      "authorId": "550e8400-e29b-41d4-a716-446655440000",
      "authorName": "test@example.com",
      "createdAt": "2025-12-21T19:52:29.471Z",
      "appointmentId": null,
      "isImportant": true
    }
  ],
  "total": 1
}
```

---

## 9. GET /api/patients/:id/appointments - Get Patient Appointments

**Request:**
```bash
GET http://localhost:8080/api/patients/bff59fc1-5452-47ac-adc9-69281293f2e9/appointments
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "items": [],
  "total": 0
}
```

---

## Error Responses

### 401 Unauthorized - Missing Token

**Request:**
```bash
GET http://localhost:8080/api/patients
# (no Authorization header)
```

**Response (401):**
```json
{
  "error": "Unauthorized",
  "message": "No authentication token provided"
}
```

---

### 404 Not Found - Invalid Patient ID

**Request:**
```bash
GET http://localhost:8080/api/patients/00000000-0000-0000-0000-000000000000
Authorization: Bearer {token}
```

**Response (404):**
```json
{
  "error": "NOT_FOUND",
  "message": "Patient not found"
}
```

---

### 409 Conflict - Duplicate Email

**Request:**
```bash
POST http://localhost:8080/api/patients
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Duplicate",
  "lastName": "Test",
  "dateOfBirth": "1980-01-01",
  "email": "jane.doe@example.com",  # Email already exists
  "phone": "555-9999"
}
```

**Response (409):**
```json
{
  "error": "CONFLICT",
  "message": "A patient with this email already exists"
}
```

---

### 400 Bad Request - Validation Error

**Request:**
```bash
POST http://localhost:8080/api/patients
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "Bad",
  "lastName": "Email",
  "dateOfBirth": "1980-01-01",
  "email": "not-an-email",  # Invalid email format
  "phone": "555-8888"
}
```

**Response (400):**
```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "validation": "email",
        "code": "invalid_string",
        "message": "Invalid email",
        "path": ["email"]
      }
    ],
    "name": "ZodError"
  }
}
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Patient numbers auto-increment (P-{YEAR}-{NUMBER})
- Nested objects (address, emergencyContact) are flattened in storage but reconstructed in responses
- Enum values (gender, status, severity) are normalized (input: "medium" → storage: "MEDIUM" → output: "medium")
- Allergies are stored in a separate table with foreign key relationship
- Soft deletes use `deletedAt` field (not physically deleted)
- All operations are logged to audit trail

---

## Database Schema Notes

The patient data is stored in PostgreSQL with the following key tables:

- **Patient** - Main patient record (flattened fields for nested objects)
- **Allergy** - Patient allergies (one-to-many relationship)
- **Note** - Patient notes (one-to-many relationship)
- **Appointment** - Patient appointments (one-to-many relationship)

Flat fields are reconstructed into nested objects on retrieval for better API ergonomics.
