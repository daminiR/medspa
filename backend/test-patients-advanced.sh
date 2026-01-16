#!/bin/bash

# Advanced Tests for Prisma Patient Endpoints

BASE_URL="http://localhost:8080"

echo "========================================="
echo "Advanced Patient Endpoint Tests"
echo "========================================="
echo ""

# Login
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/staff/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
echo "✅ Login successful!"
echo ""

# Test pagination
echo "2. Testing pagination (page 1, limit 2)..."
curl -s "$BASE_URL/api/patients?page=1&limit=2" \
  -H "Authorization: Bearer $TOKEN" | jq '{total, page, limit, hasMore, itemCount: (.items | length)}'
echo ""

# Test filtering by status
echo "3. Testing filter by status (active)..."
curl -s "$BASE_URL/api/patients?status=active&limit=3" \
  -H "Authorization: Bearer $TOKEN" | jq '{total, items: (.items | map({patientNumber, firstName, lastName, status}))}'
echo ""

# Test sorting
echo "4. Testing sort by firstName ascending..."
curl -s "$BASE_URL/api/patients?sortBy=firstName&sortOrder=asc&limit=3" \
  -H "Authorization: Bearer $TOKEN" | jq '{items: (.items | map({firstName, lastName}))}'
echo ""

# Test search with phone number
echo "5. Testing search by phone number..."
curl -s "$BASE_URL/api/patients/search?query=555&limit=3" \
  -H "Authorization: Bearer $TOKEN" | jq '{count, items: (.items | map({firstName, lastName, phone}))}'
echo ""

# Test search with email
echo "6. Testing search by email..."
curl -s "$BASE_URL/api/patients/search?query=sarah.johnson&limit=3" \
  -H "Authorization: Bearer $TOKEN" | jq '{count, items: (.items | map({firstName, lastName, email}))}'
echo ""

# Test creating patient with allergies
echo "7. Testing create patient with allergies..."
PATIENT_WITH_ALLERGIES=$(curl -s -X POST "$BASE_URL/api/patients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Smith",
    "dateOfBirth": "1975-08-20",
    "email": "john.smith.test@example.com",
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
  }')

echo "$PATIENT_WITH_ALLERGIES" | jq '{
  patientId: .patient.id,
  name: (.patient.firstName + " " + .patient.lastName),
  allergies: (.patient.allergies | map({allergen, severity}))
}'
ALLERGY_PATIENT_ID=$(echo "$PATIENT_WITH_ALLERGIES" | jq -r '.patient.id')
echo ""

# Verify allergies were saved
echo "8. Verifying allergies were saved..."
curl -s "$BASE_URL/api/patients/$ALLERGY_PATIENT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '{
  patient: (.patient.firstName + " " + .patient.lastName),
  allergies: (.patient.allergies | map({allergen, severity, reaction}))
}'
echo ""

# Test updating patient with nested data
echo "9. Testing update with nested address and emergency contact..."
curl -s -X PUT "$BASE_URL/api/patients/$ALLERGY_PATIENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "address": {
      "street": "456 Oak Ave",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90001"
    },
    "emergencyContact": {
      "name": "Mary Smith",
      "relationship": "Spouse",
      "phone": "555-0301"
    },
    "communicationPreferences": {
      "preferredMethod": "email",
      "appointmentReminders": true,
      "marketingEmails": false
    }
  }' | jq '{
  message,
  patient: {
    name: (.patient.firstName + " " + .patient.lastName),
    address: .patient.address,
    emergencyContact: .patient.emergencyContact,
    communicationPreferences: .patient.communicationPreferences
  }
}'
echo ""

# Test query with multiple filters
echo "10. Testing complex query (VIP tag)..."
curl -s "$BASE_URL/api/patients?tags=VIP&sortBy=lastName&sortOrder=asc" \
  -H "Authorization: Bearer $TOKEN" | jq '{
  total,
  items: (.items | map({name: (.firstName + " " + .lastName), tags, totalVisits}))
}'
echo ""

# Test error handling - invalid patient ID
echo "11. Testing error handling (invalid patient ID)..."
curl -s "$BASE_URL/api/patients/00000000-0000-0000-0000-000000000000" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test error handling - duplicate email
echo "12. Testing error handling (duplicate email)..."
curl -s -X POST "$BASE_URL/api/patients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Duplicate",
    "lastName": "Test",
    "dateOfBirth": "1980-01-01",
    "email": "john.smith.test@example.com",
    "phone": "555-9999"
  }' | jq '.'
echo ""

# Test validation - invalid email format
echo "13. Testing validation (invalid email format)..."
curl -s -X POST "$BASE_URL/api/patients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Bad",
    "lastName": "Email",
    "dateOfBirth": "1980-01-01",
    "email": "not-an-email",
    "phone": "555-8888"
  }' | jq '.'
echo ""

echo "========================================="
echo "Advanced Tests Complete!"
echo "========================================="
