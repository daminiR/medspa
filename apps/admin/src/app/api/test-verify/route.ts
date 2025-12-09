import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Test endpoint for Twilio Verify
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone') || '+17652500332'; // Your number as default
  const authToken = searchParams.get('token');
  
  // Your Twilio credentials (use environment variables)
  const accountSid = process.env.TWILIO_ACCOUNT_SID || 'YOUR_ACCOUNT_SID';
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID || 'YOUR_VERIFY_SERVICE_SID';
  
  // Get auth token from environment or query param
  const token = authToken || process.env.TWILIO_AUTH_TOKEN;
  
  if (!token || token === 'your_auth_token_here') {
    return NextResponse.json({
      error: 'Auth token needed',
      instructions: [
        '1. Go to https://console.twilio.com',
        '2. Click "Show auth token"',
        '3. Copy the token',
        '4. Either:',
        '   a) Add to .env.local: TWILIO_AUTH_TOKEN=your_token',
        '   b) Or pass in URL: /api/test-verify?token=your_token'
      ]
    }, { status: 400 });
  }
  
  try {
    const client = twilio(accountSid, token);
    
    console.log('Sending verification to:', phone);
    
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications
      .create({
        to: phone,
        channel: 'sms'
      });
    
    return NextResponse.json({
      success: true,
      message: `✅ SMS sent to ${phone}!`,
      status: verification.status,
      sid: verification.sid,
      details: 'Check your phone for: "Your Luxe EMR verification code is: XXXXXX"'
    });
    
  } catch (error: any) {
    console.error('Verify error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      help: error.code === 20003 ? 'Invalid auth token. Please check your token.' : undefined
    }, { status: 500 });
  }
}

// POST endpoint to verify the code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code, token: authToken } = body;
    
    if (!phone || !code) {
      return NextResponse.json({
        error: 'Phone and code required'
      }, { status: 400 });
    }
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID || 'YOUR_ACCOUNT_SID';
    const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID || 'YOUR_VERIFY_SERVICE_SID';
    const token = authToken || process.env.TWILIO_AUTH_TOKEN;
    
    if (!token || token === 'your_auth_token_here') {
      return NextResponse.json({
        error: 'Auth token needed'
      }, { status: 400 });
    }
    
    const client = twilio(accountSid, token);
    
    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks
      .create({
        to: phone,
        code: code
      });
    
    return NextResponse.json({
      success: true,
      valid: verificationCheck.status === 'approved',
      status: verificationCheck.status
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}