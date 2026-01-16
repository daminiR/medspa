# Patient API - Quick Reference Guide

Base URL: `http://localhost:8080`

## Authentication

All patient endpoints require authentication. First, log in to get an access token:

```bash
curl -X POST http://localhost:8080/api/auth/staff/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "accessToken": "6ac38836735b5815d824810b5aaffc31...",
  "expiresIn": 28800
}
```

Use the access token in all subsequent requests:
```bash
Authorization: Bearer {accessToken}
```

---

## Endpoints

### 1. List Patients (Paginated)

```bash
GET /api/patients?page=1&limit=20&sortBy=lastName&sortOrder=asc
```

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 20, max: 100) - Items per page
- `query` - Search term (searches name, email, phone, patient number)
- `status` - Filter by status (active/inactive/deceased)
- `tags` - Comma-separated tags to filter by
- `providerId` - Filter by primary provider UUID
- `hasBalance` - Filter by balance (true/false)
- `lastVisitFrom` - Filter by last visit date (ISO 8601)
- `lastVisitTo` - Filter by last visit date (ISO 8601)
- `sortBy` - Sort field (firstName/lastName/createdAt/lastVisit)
- `sortOrder` - Sort direction (asc/desc)

**Example:**
```bash
curl "http://localhost:8080/api/patients?page=1&limit=10&status=active" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 2. Search Patients (Quick Search)

```bash
GET /api/patients/search?query=Smith&limit=10
```

**Query Parameters:**
- `query` (required) - Search term
- `limit` (default: 10, max: 50) - Max results

**Example:**
```bash
curl "http://localhost:8080/api/patients/search?query=555-1234" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 3. Get Patient Details

```bash
GET /api/patients/{id}
```

**Example:**
```bash
curl "http://localhost:8080/api/patients/3013b594-1c2f-4e2c-a722-1b32bf16bd17" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 4. Create Patient

```bash
POST /api/patients
```

**Required Fields:**
- `firstName` (string, max 100)
- `lastName` (string, max 100)
- `dateOfBirth` (ISO 8601 date string)
- `phone` (string, max 20)

**Optional Fields:**
- `middleName`, `preferredName`, `pronouns`
- `email` (must be unique)
- `gender` (male/female/other/prefer_not_to_say)
- `alternatePhone`, `workPhone`, `timezone`
- `address` (object with street, city, state, zipCode, country)
- `emergencyContact` (object with name, relationship, phone, alternatePhone)
- `allergies` (array of objects)
- `bloodType`, `primaryProviderId`
- `communicationPreferences`, `privacySettings`
- `photoConsent`, `marketingConsent`
- `generalNotes`, `importantNotes`
- `tags` (array of strings)

**Example:**
```bash
curl -X POST http://localhost:8080/api/patients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "dateOfBirth": "1990-05-15",
    "email": "jane.doe@example.com",
    "phone": "555-0123",
    "gender": "female",
    "address": {
      "street": "123 Main St",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90001"
    },
    "allergies": [
      {
        "allergen": "Penicillin",
        "reaction": "Rash",
        "severity": "medium",
        "notes": "Developed rash in 2020"
      }
    ],
    "tags": ["VIP"]
  }'
```

---

### 5. Update Patient

```bash
PUT /api/patients/{id}
```

All fields are optional. Only specified fields will be updated.

**Example:**
```bash
curl -X PUT http://localhost:8080/api/patients/3013b594-1c2f-4e2c-a722-1b32bf16bd17 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "555-9999",
    "generalNotes": "Updated contact information",
    "communicationPreferences": {
      "preferredMethod": "email",
      "appointmentReminders": true
    }
  }'
```

---

### 6. Delete Patient (Soft Delete)

```bash
DELETE /api/patients/{id}
```

**Example:**
```bash
curl -X DELETE http://localhost:8080/api/patients/3013b594-1c2f-4e2c-a722-1b32bf16bd17 \
  -H "Authorization: Bearer $TOKEN"
```

---

### 7. Get Patient Appointments

```bash
GET /api/patients/{id}/appointments
```

**Example:**
```bash
curl "http://localhost:8080/api/patients/3013b594-1c2f-4e2c-a722-1b32bf16bd17/appointments" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 8. Get Patient Notes

```bash
GET /api/patients/{id}/notes
```

**Example:**
```bash
curl "http://localhost:8080/api/patients/3013b594-1c2f-4e2c-a722-1b32bf16bd17/notes" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 9. Add Patient Note

```bash
POST /api/patients/{id}/notes
```

**Required Fields:**
- `content` (string, max 5000)

**Optional Fields:**
- `isImportant` (boolean, default: false)
- `appointmentId` (UUID)

**Example:**
```bash
curl -X POST http://localhost:8080/api/patients/3013b594-1c2f-4e2c-a722-1b32bf16bd17/notes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Patient expressed interest in Botox treatment",
    "isImportant": true
  }'
```

---

## Common Response Formats

### Success Responses

**List Response:**
```json
{
  "items": [...],
  "total": 5,
  "page": 1,
  "limit": 20,
  "hasMore": false
}
```

**Single Item Response:**
```json
{
  "patient": {...},
  "message": "Patient created successfully"
}
```

### Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "invalid_string",
        "message": "Invalid email",
        "path": ["email"]
      }
    ]
  }
}
```

**Unauthorized (401):**
```json
{
  "error": "Unauthorized",
  "message": "No authentication token provided"
}
```

**Not Found (404):**
```json
{
  "error": "NOT_FOUND",
  "message": "Patient not found"
}
```

**Conflict (409):**
```json
{
  "error": "CONFLICT",
  "message": "A patient with this email already exists"
}
```

---

## Tips

### Using with cURL

Set your token as a variable for easier testing:
```bash
TOKEN="your-access-token-here"

curl http://localhost:8080/api/patients \
  -H "Authorization: Bearer $TOKEN"
```

### Using with JavaScript/Fetch

```javascript
const response = await fetch('http://localhost:8080/api/patients', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### Common Queries

**Get all active patients:**
```bash
/api/patients?status=active
```

**Search by phone:**
```bash
/api/patients/search?query=555-1234
```

**Get VIP patients:**
```bash
/api/patients?tags=VIP
```

**Get patients with balance:**
```bash
/api/patients?hasBalance=true
```

**Get recently active patients:**
```bash
/api/patients?sortBy=lastVisit&sortOrder=desc&limit=10
```

---

## Sample Patient Object

```json
{
  "id": "3013b594-1c2f-4e2c-a722-1b32bf16bd17",
  "patientNumber": "P-2024-0005",
  "firstName": "Jessica",
  "lastName": "Brown",
  "email": "jessica.brown@email.com",
  "phone": "+15555678901",
  "dateOfBirth": "1988-09-12T00:00:00.000Z",
  "age": 37,
  "gender": "female",
  "status": "active",
  "balance": 0,
  "credits": 0,
  "totalVisits": 24,
  "tags": ["VIP", "Loyalty Member"],
  "address": {
    "street": "321 Luxury Ln",
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
  "allergies": [
    {
      "id": "allergy-id",
      "allergen": "Penicillin",
      "reaction": "Rash",
      "severity": "medium",
      "notes": "Developed in 2020"
    }
  ]
}
```
