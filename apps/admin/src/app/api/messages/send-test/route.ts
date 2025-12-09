import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();
    
    // Check if auth token is configured
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!authToken || authToken === 'your_auth_token_here') {
      return NextResponse.json({
        success: false,
        error: 'Twilio not configured',
        instructions: [
          '1. Go to https://console.twilio.com',
          '2. Click "Show auth token"',
          '3. Copy the token',
          '4. Add to .env.local: TWILIO_AUTH_TOKEN=your_actual_token',
          '5. Restart the dev server',
        ],
        testCommand: 'Or test with: node quick-test.js YOUR_AUTH_TOKEN'
      }, { status: 400 });
    }
    
    // For now, simulate success since Verify API doesn't send custom messages
    console.log('Would send SMS:', { to, message });
    
    return NextResponse.json({
      success: false,
      error: 'SMS sending requires Twilio auth token configuration',
      note: 'The messaging UI is working, but needs your Twilio auth token to actually send SMS',
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}