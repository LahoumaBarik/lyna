require('dotenv').config({ path: './config.env' });
const { sendSMSNotification } = require('./utils/notifications');

async function testSMS() {
  console.log('🔬 Testing SMS functionality...');
  
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('❌ Twilio credentials not found in config.env');
    return;
  }

  console.log('✅ Twilio credentials found');
  console.log(`📱 From: ${process.env.TWILIO_PHONE_NUMBER}`);
  
  const testPhoneNumber = process.argv[2] || '+1234567890';
  
  if (testPhoneNumber === '+1234567890') {
    console.log('⚠️  Please provide your phone number as an argument:');
    console.log('   node testSMS.js +1234567890');
    return;
  }
  
  console.log(`📤 Sending test SMS to: ${testPhoneNumber}`);
  
  try {
    const result = await sendSMSNotification(
      { phone: testPhoneNumber },
      'Test SMS from your salon management system! 🎉 SMS notifications are working perfectly.'
    );
    
    if (result.success) {
      console.log('✅ SMS sent successfully!');
      console.log('📋 SMS details:', result);
    } else {
      console.log('❌ SMS failed:', result.error);
    }
    
  } catch (error) {
    console.log('❌ Error testing SMS:', error.message);
  }
}

testSMS(); 