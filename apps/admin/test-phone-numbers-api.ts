/**
 * Simple test to verify phone numbers API logic
 * Run with: npx ts-node test-phone-numbers-api.ts
 */

import {
  searchAvailableNumbers,
  provisionPhoneNumber,
  getProvisionedNumbers,
  getLocationPhoneNumbers,
  updateProvisionedNumber,
  releasePhoneNumber,
  validatePhoneNumberFormat,
  validateAreaCode,
  seedMockData,
} from './src/lib/twilio-phone-numbers'

async function runTests() {
  console.log('=== Phone Numbers API Test Suite ===\n')

  // Test 1: Validation
  console.log('Test 1: Phone number validation')
  console.log('Valid E.164 (+14155551234):', validatePhoneNumberFormat('+14155551234'))
  console.log('Invalid format (415):', validatePhoneNumberFormat('415'))
  console.log('Valid area code (415):', validateAreaCode('415'))
  console.log('Invalid area code (0415):', validateAreaCode('0415'))
  console.log('')

  // Test 2: Search available numbers
  console.log('Test 2: Search available numbers for area code 415')
  const available = await searchAvailableNumbers('415', 3)
  console.log(`Found ${available.length} available numbers:`)
  available.forEach((num, idx) => {
    console.log(`  ${idx + 1}. ${num.friendlyName} - ${num.phoneNumber}`)
  })
  console.log('')

  // Test 3: Seed and get provisioned
  console.log('Test 3: Seed mock data and get all provisioned')
  seedMockData()
  const provisioned = await getProvisionedNumbers()
  console.log(`Found ${provisioned.length} provisioned numbers:`)
  provisioned.forEach((num, idx) => {
    console.log(
      `  ${idx + 1}. ${num.displayName} (${num.phoneNumber}) - Status: ${num.status}`
    )
  })
  console.log('')

  // Test 4: Get location-specific numbers
  console.log('Test 4: Get numbers for location')
  const locNumbers = await getLocationPhoneNumbers('loc-001')
  console.log(
    `Location 'loc-001' has ${locNumbers.length} phone numbers:`,
    locNumbers.map(n => n.friendlyName)
  )
  console.log('')

  // Test 5: Provision new number
  console.log('Test 5: Provision a new phone number')
  const newNumber = await provisionPhoneNumber(
    '+14155555555',
    'loc-003',
    'Northgate Clinic',
    'both',
    'Northgate Main Line'
  )
  console.log('Provisioned:', {
    id: newNumber.id,
    number: newNumber.phoneNumber,
    name: newNumber.displayName,
    status: newNumber.status,
  })
  console.log('')

  // Test 6: Update number
  console.log('Test 6: Update phone number')
  const updated = await updateProvisionedNumber(newNumber.id, {
    displayName: 'Northgate Premium Line',
    tags: ['vip', 'priority'],
  })
  console.log('Updated:', {
    displayName: updated?.displayName,
    tags: updated?.tags,
  })
  console.log('')

  // Test 7: Release number
  console.log('Test 7: Release phone number')
  const released = await releasePhoneNumber(newNumber.id, 'No longer needed')
  console.log('Released:', {
    id: released?.id,
    status: released?.status,
    releasedAt: released?.releasedAt,
  })
  console.log('')

  console.log('=== All tests completed successfully! ===')
}

runTests().catch(console.error)
