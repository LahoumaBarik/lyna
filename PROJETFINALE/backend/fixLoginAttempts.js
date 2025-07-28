const mongoose = require('mongoose');
const { User } = require('./models');

async function fixLoginAttempts() {
  try {
    // Use the correct environment variable name
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/salon-reservation-platform';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Find users with problematic loginAttempts
    const problematicUsers = await User.find({
      $or: [
        { loginAttempts: { $type: 'string' } },
        { loginAttempts: { $type: 'number' } },
        { loginAttempts: { $exists: false } }
      ]
    });
    
    console.log(`Found ${problematicUsers.length} users with problematic loginAttempts`);
    
    let fixedCount = 0;
    
    for (const user of problematicUsers) {
      console.log(`Fixing user: ${user.email}`);
      
      // Reset loginAttempts to proper structure
      await User.updateOne(
        { _id: user._id },
        { 
          $set: { 
            loginAttempts: { count: 0 }
          },
          $unset: { 
            accountLocked: 1,
            lockUntil: 1,
            lastFailedLogin: 1
          }
        }
      );
      
      fixedCount++;
    }
    
    console.log(`✅ Fixed ${fixedCount} users`);
    console.log('🎉 Login attempts fix complete');
    
  } catch (error) {
    console.error('❌ Error fixing login attempts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixLoginAttempts(); 