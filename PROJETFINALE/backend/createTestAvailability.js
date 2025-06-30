require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const { Disponibilite, User } = require('./models');

async function createTestAvailability() {
  try {
    await mongoose.connect(process.env.DATABASE_URI || 'mongodb://localhost:27017/salon_reservation');
    console.log('✅ Connected to MongoDB');
    
    // Find a stylist
    const stylist = await User.findOne({ role: 'stylist' });
    if (!stylist) {
      console.log('❌ No stylist found');
      return;
    }
    
    console.log('👤 Found stylist:', stylist.firstName, stylist._id);
    
    // Create availability for the next few days
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);
    
    const dayAfterThat = new Date(today);
    dayAfterThat.setDate(today.getDate() + 3);
    
    const availability = [
      {
        stylist: stylist._id,
        jour: tomorrow,
        heureDebut: '09:00',
        heureFin: '17:00',
        isActive: true
      },
      {
        stylist: stylist._id,
        jour: dayAfter,
        heureDebut: '10:00',
        heureFin: '18:00',
        isActive: true
      },
      {
        stylist: stylist._id,
        jour: dayAfterThat,
        heureDebut: '08:00',
        heureFin: '16:00',
        isActive: true
      }
    ];
    
    // Remove existing availability for these days
    const deleteResult = await Disponibilite.deleteMany({
      stylist: stylist._id,
      jour: { $in: [tomorrow, dayAfter, dayAfterThat] }
    });
    
    console.log('🗑️ Removed', deleteResult.deletedCount, 'old availability entries');
    
    // Create new availability
    const created = await Disponibilite.insertMany(availability);
    console.log('📅 Created', created.length, 'new availability entries');
    
    // List all availability for this stylist
    const allAvail = await Disponibilite.find({ stylist: stylist._id }).sort({ jour: 1 });
    console.log('📋 All availability for stylist:');
    allAvail.forEach(a => {
      console.log(`  - ${a.jour.toISOString().split('T')[0]} from ${a.heureDebut} to ${a.heureFin}`);
    });
    
    console.log('✅ Test availability created successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

createTestAvailability(); 