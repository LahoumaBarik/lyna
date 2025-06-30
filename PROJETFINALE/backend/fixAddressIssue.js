const mongoose = require('mongoose');

async function fixAddressIssue() {
  try {
    await mongoose.connect('mongodb://localhost:27017/salon_reservation', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Find users with problematic address fields
    const problematicUsers = await db.collection('users').find({
      $or: [
        { address: "" },
        { address: { $type: "string" } }
      ]
    }).toArray();

    console.log(`Found ${problematicUsers.length} users with problematic address fields`);

    // Fix each user
    for (const user of problematicUsers) {
      console.log(`Fixing user: ${user.email}`);
      
      // Update to proper address structure or remove the field
      await db.collection('users').updateOne(
        { _id: user._id },
        { 
          $unset: { address: "" }
        }
      );
    }

    console.log('✅ Address fields fixed successfully');
    
  } catch (error) {
    console.error('❌ Error fixing address fields:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixAddressIssue(); 