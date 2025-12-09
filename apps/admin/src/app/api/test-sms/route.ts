import { NextRequest, NextResponse } from 'next/server'
import { testSMSConnection, sendVerificationCode } from '@/lib/twilio-verify'

// Test endpoint to verify Twilio is working
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const phone = searchParams.get('phone')
  
  if (!phone) {
    return NextResponse.json({
      error: 'Please provide phone parameter, e.g., /api/test-sms?phone=+15551234567'
    }, { status: 400 })
  }
  
  const result = await testSMSConnection(phone)
  
  return NextResponse.json({
    message: 'Test SMS sent using Twilio Verify',
    result,
    note: 'You should receive a verification code. This proves SMS works!',
    production: 'In production, we\'ll use regular SMS API with A2P registration'
  })
}

// Send verification code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone } = body
    
    if (!phone) {
      return NextResponse.json({
        error: 'Phone number required'
      }, { status: 400 })
    }
    
    const result = await sendVerificationCode(phone)
    
    if (result?.success) {
      return NextResponse.json({
        success: true,
        message: 'Verification code sent!',
        status: result.status,
        sid: result.sid
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result?.error || 'Failed to send'
      }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({
      error: 'Server error',
      details: error.message
    }, { status: 500 })
  }
}