import { NextRequest, NextResponse } from 'next/server';
import { testSMSMethods, sendViaTextBelt } from '@/lib/twilio-real-sms';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone') || '+17652500332';
  const message = searchParams.get('message') || 'This is a REAL custom message from Luxe Medical Spa!';
  
  // Try TextBelt first (1 free SMS per day)
  console.log('Attempting to send via TextBelt (free)...');
  const textBeltResult = await sendViaTextBelt(phone, message);
  
  if (textBeltResult.success) {
    return NextResponse.json({
      success: true,
      method: 'TextBelt (Free)',
      message: 'SMS sent successfully!',
      details: textBeltResult,
      yourMessage: message
    });
  }
  
  // If TextBelt fails, try other methods
  const result = await testSMSMethods(phone, message);
  
  return NextResponse.json({
    ...result,
    yourMessage: message,
    alternatives: [
      {
        method: 'Toll-Free Number',
        cost: '$2/month',
        setup: '5 minutes',
        link: 'https://console.twilio.com/us1/develop/phone-numbers/manage/search'
      },
      {
        method: 'TextBelt',
        cost: 'Free (1/day) or $0.03/SMS',
        setup: 'Immediate',
        link: 'https://textbelt.com'
      },
      {
        method: 'Email-to-SMS',
        cost: 'Free',
        setup: 'Immediate',
        note: 'Use your carrier\'s email gateway'
      }
    ]
  });
}