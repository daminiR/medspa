#!/bin/bash

# Test Prisma Patient Endpoints
# Backend must be running at http://localhost:8080

BASE_URL="http://localhost:8080"

echo "========================================="
echo "Testing Prisma Patient Endpoints"
echo "========================================="
echo ""

# Step 1: Login to get access token
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/staff/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  echo "$LOGIN_RESPONSE" | jq '.'
  exit 1
fi

echo "✅ Login successful!"
echo "Access Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Test GET /api/patients - List all patients
echo "2. Testing GET /api/patients (List all patients)..."
PATIENTS_RESPONSE=$(curl -s "$BASE_URL/api/patients" \
  -H "Authorization: Bearer $TOKEN")

echo "$PATIENTS_RESPONSE" | jq '.'
PATIENT_COUNT=$(echo "$PATIENTS_RESPONSE" | jq -r '.total // "error"')

if [ "$PATIENT_COUNT" = "error" ]; then
  echo "❌ Failed to get patients list"
else
  echo "✅ Found $PATIENT_COUNT patients"
fi
echo ""

# Step 3: Get first patient ID for detailed tests
FIRST_PATIENT_ID=$(echo "$PATIENTS_RESPONSE" | jq -r '.items[0].id // "none"')

if [ "$FIRST_PATIENT_ID" = "none" ]; then
  echo "⚠️  No patients found in database. Skipping individual patient tests."
else
  echo "3. Testing GET /api/patients/:id (Get specific patient)"
  echo "   Using patient ID: $FIRST_PATIENT_ID"

  PATIENT_DETAIL=$(curl -s "$BASE_URL/api/patients/$FIRST_PATIENT_ID" \
    -H "Authorization: Bearer $TOKEN")

  echo "$PATIENT_DETAIL" | jq '.'
  PATIENT_NAME=$(echo "$PATIENT_DETAIL" | jq -r '.patient.firstName // "error"')

  if [ "$PATIENT_NAME" = "error" ]; then
    echo "❌ Failed to get patient details"
  else
    echo "✅ Successfully retrieved patient: $PATIENT_NAME"
  fi
  echo ""
fi

# Step 4: Test POST /api/patients - Create new patient
echo "4. Testing POST /api/patients (Create new patient)..."
NEW_PATIENT=$(curl -s -X POST "$BASE_URL/api/patients" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Doe",
    "dateOfBirth": "1990-05-15",
    "email": "jane.doe.test@example.com",
    "phone": "555-0199",
    "gender": "female",
    "address": {
      "street": "123 Test St",
      "city": "TestCity",
      "state": "CA",
      "zipCode": "90210"
    }
  }')

echo "$NEW_PATIENT" | jq '.'
NEW_PATIENT_ID=$(echo "$NEW_PATIENT" | jq -r '.patient.id // "error"')

if [ "$NEW_PATIENT_ID" = "error" ]; then
  echo "❌ Failed to create patient"
else
  echo "✅ Successfully created patient with ID: $NEW_PATIENT_ID"

  # Step 5: Test PUT /api/patients/:id - Update patient
  echo ""
  echo "5. Testing PUT /api/patients/:id (Update patient)..."

  UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/patients/$NEW_PATIENT_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "phone": "555-0200",
      "generalNotes": "Test patient - updated via API test"
    }')

  echo "$UPDATE_RESPONSE" | jq '.'
  UPDATED_PHONE=$(echo "$UPDATE_RESPONSE" | jq -r '.patient.phone // "error"')

  if [ "$UPDATED_PHONE" = "555-0200" ]; then
    echo "✅ Successfully updated patient"
  else
    echo "❌ Failed to update patient"
  fi
  echo ""

  # Step 6: Test patient notes endpoints
  echo "6. Testing POST /api/patients/:id/notes (Add patient note)..."

  NOTE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/patients/$NEW_PATIENT_ID/notes" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "content": "This is a test note added via API",
      "isImportant": true
    }')

  echo "$NOTE_RESPONSE" | jq '.'
  NOTE_ID=$(echo "$NOTE_RESPONSE" | jq -r '.note.id // "error"')

  if [ "$NOTE_ID" = "error" ]; then
    echo "❌ Failed to add patient note"
  else
    echo "✅ Successfully added patient note"
  fi
  echo ""

  echo "7. Testing GET /api/patients/:id/notes (Get patient notes)..."

  NOTES_LIST=$(curl -s "$BASE_URL/api/patients/$NEW_PATIENT_ID/notes" \
    -H "Authorization: Bearer $TOKEN")

  echo "$NOTES_LIST" | jq '.'
  NOTES_COUNT=$(echo "$NOTES_LIST" | jq -r '.total // "error"')

  if [ "$NOTES_COUNT" = "error" ]; then
    echo "❌ Failed to get patient notes"
  else
    echo "✅ Found $NOTES_COUNT note(s) for patient"
  fi
  echo ""

  echo "8. Testing GET /api/patients/:id/appointments (Get patient appointments)..."

  APPOINTMENTS_LIST=$(curl -s "$BASE_URL/api/patients/$NEW_PATIENT_ID/appointments" \
    -H "Authorization: Bearer $TOKEN")

  echo "$APPOINTMENTS_LIST" | jq '.'
  APPTS_COUNT=$(echo "$APPOINTMENTS_LIST" | jq -r '.total // "error"')

  if [ "$APPTS_COUNT" = "error" ]; then
    echo "❌ Failed to get patient appointments"
  else
    echo "✅ Found $APPTS_COUNT appointment(s) for patient"
  fi
  echo ""
fi

# Step 9: Test search endpoint
echo "9. Testing GET /api/patients/search (Search patients)..."

SEARCH_RESPONSE=$(curl -s "$BASE_URL/api/patients/search?query=Doe&limit=5" \
  -H "Authorization: Bearer $TOKEN")

echo "$SEARCH_RESPONSE" | jq '.'
SEARCH_COUNT=$(echo "$SEARCH_RESPONSE" | jq -r '.count // "error"')

if [ "$SEARCH_COUNT" = "error" ]; then
  echo "❌ Failed to search patients"
else
  echo "✅ Search returned $SEARCH_COUNT result(s)"
fi
echo ""

echo "========================================="
echo "Test Summary Complete!"
echo "========================================="
