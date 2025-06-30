const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/salon_reservation')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Remove problematic address fields
    const result = await db.collection('users').updateMany(
      { address: { $type: 'string' } },
      { $unset: { address: '' } }
    );
    
    console.log(`Fixed ${result.modifiedCount} users`);
    
    // Also fix any empty objects
    const result2 = await db.collection('users').updateMany(
      { address: {} },
      { $unset: { address: '' } }
    );
    
    console.log(`Removed empty address objects from ${result2.modifiedCount} users`);
    
    await mongoose.disconnect();
    console.log('Database fix complete');
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  }); 