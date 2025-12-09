/**
 * REAL SMS Sending - Works without A2P registration
 * For testing and development
 */

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

/**
 * Send REAL custom SMS (not verification codes)
 * This uses the regular Messaging API, not Verify
 */
export async function sendRealSMS(to: string, message: string) {
  try {
    // Option 1: If you have a toll-free number
    if (process.env.TWILIO_TOLLFREE_NUMBER) {
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_TOLLFREE_NUMBER,
        to: to
      });
      
      return {
        success: true,
        sid: result.sid,
        message: 'Sent via toll-free number'
      };
    }
    
    // Option 2: Use Messaging Service (might work in trial)
    if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
      try {
        const result = await client.messages.create({
          body: message,
          messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
          to: to
        });
        
        return {
          success: true,
          sid: result.sid,
          message: 'Sent via messaging service'
        };
      } catch (error: any) {
        console.log('Messaging service failed:', error.message);
      }
    }
    
    // Option 3: Try with your regular number (might be blocked)
    if (process.env.TWILIO_PHONE_NUMBER) {
      const result = await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to
      });
      
      return {
        success: true,
        sid: result.sid,
        message: 'Sent via phone number'
      };
    }
    
    return {
      success: false,
      error: 'No valid sending method configured'
    };
    
  } catch (error: any) {
    console.error('SMS Error:', error);
    
    // If Twilio fails, provide alternatives
    if (error.code === 21211 || error.code === 21608) {
      return {
        success: false,
        error: 'Number not verified or A2P required',
        alternatives: [
          '1. Buy a toll-free number ($2) - works immediately',
          '2. Use TextBelt API - 1 free SMS/day',
          '3. Use email-to-SMS gateway',
          '4. Register for A2P 10DLC (requires business)'
        ]
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Alternative: Use TextBelt for testing (1 free SMS/day)
 */
export async function sendViaTextBelt(to: string, message: string) {
  try {
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: to.replace(/\D/g, ''), // Remove non-digits
        message: message,
        key: 'textbelt' // Use 'textbelt' for 1 free SMS/day
      })
    });
    
    const result = await response.json();
    
    return {
      success: result.success,
      textId: result.textId,
      quotaRemaining: result.quotaRemaining,
      error: result.error
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Alternative: Email-to-SMS Gateway
 */
export function getEmailToSMS(phoneNumber: string, carrier: string): string | null {
  const gateways: Record<string, string> = {
    'att': '@txt.att.net',
    'tmobile': '@tmomail.net',
    'verizon': '@vtext.com',
    'sprint': '@messaging.sprintpcs.com',
    'boost': '@sms.myboostmobile.com',
    'cricket': '@sms.cricketwireless.net',
    'uscellular': '@email.uscc.net'
  };
  
  const gateway = gateways[carrier.toLowerCase()];
  if (!gateway) return null;
  
  // Clean phone number (remove +1 and any formatting)
  const cleanNumber = phoneNumber.replace(/\D/g, '').replace(/^1/, '');
  
  return `${cleanNumber}${gateway}`;
}

/**
 * Test which method works
 */
export async function testSMSMethods(to: string, message: string) {
  console.log('Testing SMS methods...\n');
  
  const methods = [
    { name: 'Twilio Regular SMS', fn: () => sendRealSMS(to, message) },
    { name: 'TextBelt (Free)', fn: () => sendViaTextBelt(to, message) }
  ];
  
  for (const method of methods) {
    console.log(`Trying ${method.name}...`);
    const result = await method.fn();
    console.log('Result:', result);
    
    if (result.success) {
      console.log(`✅ SUCCESS with ${method.name}!`);
      return result;
    }
  }
  
  console.log('\n❌ All methods failed. Options:');
  console.log('1. Buy a Twilio toll-free number ($2)');
  console.log('2. Use your personal TextBelt API key');
  console.log('3. Set up email-to-SMS with your carrier');
  
  return { success: false, error: 'All methods failed' };
}