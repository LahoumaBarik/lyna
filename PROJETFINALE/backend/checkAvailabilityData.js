const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/salon-reservation-platform')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const Disponibilite = require('./models/Disponibilite');
const User = require('./models/User');

async function checkAvailabilityData() {
  try {
    console.log('Checking availability data...');

    // Find all availabilities
    const availabilities = await Disponibilite.find().populate('stylist', 'firstName lastName');
    
    console.log(`Found ${availabilities.length} availabilities:`);
    
    availabilities.forEach(avail => {
      console.log(`  - ${avail.stylist?.firstName} ${avail.stylist?.lastName}: ${avail.jour} ${avail.heureDebut}-${avail.heureFin} (Active: ${avail.isActive})`);
    });

    // Check for unusual time slots (more than 8 hours)
    const unusualSlots = availabilities.filter(avail => {
      const [startHour, startMin] = avail.heureDebut.split(':').map(Number);
      const [endHour, endMin] = avail.heureFin.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const duration = endMinutes - startMinutes;
      return duration > 480; // More than 8 hours
    });

    if (unusualSlots.length > 0) {
      console.log(`\nFound ${unusualSlots.length} unusual time slots (more than 8 hours):`);
      unusualSlots.forEach(avail => {
        console.log(`  - ${avail.stylist?.firstName} ${avail.stylist?.lastName}: ${avail.jour} ${avail.heureDebut}-${avail.heureFin}`);
      });

      // Fix unusual slots
      console.log('\nFixing unusual time slots...');
      for (const avail of unusualSlots) {
        const [startHour, startMin] = avail.heureDebut.split(':').map(Number);
        const [endHour, endMin] = avail.heureFin.split(':').map(Number);
        
        // Set reasonable hours (9 AM to 5 PM)
        const newStartHour = Math.max(9, Math.min(startHour, 17));
        const newEndHour = Math.min(17, Math.max(newStartHour + 1, endHour));
        
        await Disponibilite.findByIdAndUpdate(avail._id, {
          heureDebut: `${newStartHour.toString().padStart(2, '0')}:00`,
          heureFin: `${newEndHour.toString().padStart(2, '0')}:00`
        });
        
        console.log(`  - Fixed: ${avail.heureDebut}-${avail.heureFin} → ${newStartHour.toString().padStart(2, '0')}:00-${newEndHour.toString().padStart(2, '0')}:00`);
      }
    }

    // Check for stylists without availabilities
    const stylists = await User.find({ role: 'stylist' });
    console.log(`\nChecking ${stylists.length} stylists for availabilities:`);
    
    for (const stylist of stylists) {
      const stylistAvailabilities = availabilities.filter(avail => avail.stylist._id.toString() === stylist._id.toString());
      console.log(`  - ${stylist.firstName} ${stylist.lastName}: ${stylistAvailabilities.length} availabilities`);
      
      if (stylistAvailabilities.length === 0) {
        console.log(`    Creating default availability for ${stylist.firstName} ${stylist.lastName}`);
        
        // Create a default availability for today
        const today = new Date();
        const defaultAvailability = new Disponibilite({
          stylist: stylist._id,
          jour: today,
          heureDebut: '09:00',
          heureFin: '17:00',
          isActive: true
        });
        
        await defaultAvailability.save();
        console.log(`    Created: ${today.toDateString()} 09:00-17:00`);
      }
    }

    console.log('\nAvailability data check completed!');

  } catch (error) {
    console.error('Error checking availability data:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkAvailabilityData(); 