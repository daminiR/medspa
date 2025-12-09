// SIMPLEST POSSIBLE TEST - Just run: node quick-test.js YOUR_AUTH_TOKEN

const authToken = process.argv[2];
if (!authToken) {
  console.log('Usage: node quick-test.js YOUR_AUTH_TOKEN');
  console.log('Get token from: https://console.twilio.com (click "Show auth token")');
  process.exit(1);
}

const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID || 'YOUR_ACCOUNT_SID', authToken);

client.verify.v2
  .services('VA3f97504628aaa53c0a4fce503def8815')
  .verifications
  .create({ to: '+17652500332', channel: 'sms' })
  .then(v => console.log('✅ SMS SENT! Check your phone for code'))
  .catch(e => console.log('❌ Error:', e.message));