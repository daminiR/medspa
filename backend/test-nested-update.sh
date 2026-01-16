#!/bin/bash

# Test nested data update verification

BASE_URL="http://localhost:8080"

echo "Testing nested data update..."
echo ""

# Login
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/staff/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')

# Create a fresh patient
echo "1. Creating test patient..."
NEW_PATIENT=$(curl -s -X POST "$BASE_URL/api/patients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Nested",
    "lastName": "Test",
    "dateOfBirth": "1985-01-01",
    "email": "nested.test@example.com",
    "phone": "555-9000"
  }')

PATIENT_ID=$(echo "$NEW_PATIENT" | jq -r '.patient.id')
echo "Created patient: $PATIENT_ID"
echo ""

# Update with nested data
echo "2. Updating patient with nested data..."
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/patients/$PATIENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "address": {
      "street": "789 Test Blvd",
      "city": "Beverly Hills",
      "state": "CA",
      "zipCode": "90210"
    },
    "emergencyContact": {
      "name": "Emergency Person",
      "relationship": "Friend",
      "phone": "555-9001"
    }
  }')

echo "Update response:"
echo "$UPDATE_RESPONSE" | jq '.'
echo ""

# Fetch the patient to verify
echo "3. Fetching updated patient to verify..."
VERIFY_RESPONSE=$(curl -s "$BASE_URL/api/patients/$PATIENT_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Patient details after update:"
echo "$VERIFY_RESPONSE" | jq '{
  id: .patient.id,
  name: (.patient.firstName + " " + .patient.lastName),
  addressStreet: .patient.addressStreet,
  addressCity: .patient.addressCity,
  addressState: .patient.addressState,
  addressZipCode: .patient.addressZipCode,
  emergencyContactName: .patient.emergencyContactName,
  emergencyContactRelationship: .patient.emergencyContactRelationship,
  emergencyContactPhone: .patient.emergencyContactPhone,
  address: .patient.address,
  emergencyContact: .patient.emergencyContact
}'
