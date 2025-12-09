// Quick test script for Twilio Verify
// Run with: node test-sms.js

const twilio = require('twilio');

// Your credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'YOUR_ACCOUNT_SID';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'YOUR_AUTH_TOKEN_HERE'; // Replace with your token
const verifyServiceSid = 'VA3f97504628aaa53c0a4fce503def8815';
const yourPhoneNumber = '+17652500332';

if (authToken === 'YOUR_AUTH_TOKEN_HERE') {
  console.log('\n⚠️  Please replace YOUR_AUTH_TOKEN_HERE with your actual Twilio Auth Token');
  console.log('Find it at: https://console.twilio.com');
  console.log('Click "Show auth token" button\n');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

async function sendTestSMS() {
  try {
    console.log('📱 Sending verification code to', yourPhoneNumber);
    console.log('Using Verify Service:', verifyServiceSid);
    
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications
      .create({
        to: yourPhoneNumber,
        channel: 'sms'
      });
    
    console.log('\n✅ SMS sent successfully!');
    console.log('Status:', verification.status);
    console.log('SID:', verification.sid);
    console.log('\n📲 Check your phone for the verification code!');
    console.log('Message format: "Your Luxe EMR verification code is: XXXXXX"\n');
    
  } catch (error) {
    console.error('\n❌ Error sending SMS:');
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    
    if (error.code === 20003) {
      console.log('\n⚠️  Authentication failed. Please check your auth token.');
    }
  }
}

sendTestSMS();