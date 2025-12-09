import twilio from 'twilio'

// For testing during development using Twilio Verify
// This bypasses A2P 10DLC requirements

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID

const client = accountSid && authToken ? twilio(accountSid, authToken) : null

/**
 * Send a verification code (for testing SMS functionality)
 */
export async function sendVerificationCode(phoneNumber: string) {
  if (!client || !verifyServiceSid) {
    console.error('Twilio Verify not configured')
    return null
  }

  try {
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms'
      })
    
    return {
      success: true,
      status: verification.status,
      sid: verification.sid
    }
  } catch (error: any) {
    console.error('Verify error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Check verification code
 */
export async function checkVerificationCode(phoneNumber: string, code: string) {
  if (!client || !verifyServiceSid) {
    console.error('Twilio Verify not configured')
    return null
  }

  try {
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: phoneNumber,
        code: code
      })
    
    return {
      success: true,
      status: verificationCheck.status,
      valid: verificationCheck.status === 'approved'
    }
  } catch (error: any) {
    console.error('Verify check error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Send custom notification using Verify (creative workaround for testing)
 * Note: This still sends "Your verification code is: XXX" format
 */
export async function sendTestNotification(phoneNumber: string) {
  // Verify always sends a code, but we can use this for testing
  return sendVerificationCode(phoneNumber)
}

/**
 * For Development: Test if SMS is working
 */
export async function testSMSConnection(yourPhoneNumber: string) {
  console.log('Testing SMS with Twilio Verify...')
  
  const result = await sendVerificationCode(yourPhoneNumber)
  
  if (result?.success) {
    console.log('✅ SMS sent successfully! Check your phone for a verification code.')
    console.log('This proves SMS is working. In production, we\'ll use regular Messaging API with A2P registration.')
  } else {
    console.log('❌ SMS failed:', result?.error)
  }
  
  return result
}