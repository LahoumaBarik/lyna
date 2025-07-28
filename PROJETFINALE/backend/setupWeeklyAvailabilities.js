const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/salon-reservation-platform')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const Disponibilite = require('./models/Disponibilite');
const User = require('./models/User');

async function setupWeeklyAvailabilities() {
  try {
    console.log('Setting up weekly availabilities for stylists...');

    // Find all stylists
    const stylists = await User.find({ role: 'stylist' });
    console.log(`Found ${stylists.length} stylists`);

    // Get next week's dates
    const getNextWeekDates = () => {
      const dates = [];
      const today = new Date();
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + (8 - today.getDay()) % 7);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(nextMonday);
        date.setDate(nextMonday.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }
      
      return dates;
    };

    const weekDates = getNextWeekDates();
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    // Default working hours for each day
    const defaultHours = {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: { start: '09:00', end: '17:00' },
      sunday: { start: '09:00', end: '17:00' }
    };

    for (const stylist of stylists) {
      console.log(`Setting up availabilities for ${stylist.firstName} ${stylist.lastName}...`);
      
      // Check if stylist already has availabilities for next week
      const existingAvailabilities = await Disponibilite.find({
        stylist: stylist._id,
        jour: { $in: weekDates }
      });

      if (existingAvailabilities.length > 0) {
        console.log(`  - Already has ${existingAvailabilities.length} availabilities for next week`);
        continue;
      }

      // Create availabilities for each day
      for (let i = 0; i < 7; i++) {
        const dayName = dayNames[i];
        const date = weekDates[i];
        const hours = defaultHours[dayName];

        // Skip Sunday or create shorter hours
        if (dayName === 'sunday') {
          hours.start = '10:00';
          hours.end = '15:00';
        }

        const availability = new Disponibilite({
          stylist: stylist._id,
          jour: new Date(date + 'T00:00:00.000Z'),
          heureDebut: hours.start,
          heureFin: hours.end,
          isActive: true
        });

        await availability.save();
        console.log(`  - Created: ${date} ${hours.start}-${hours.end}`);
      }
    }

    console.log('Weekly availabilities setup completed!');

  } catch (error) {
    console.error('Error setting up weekly availabilities:', error);
  } finally {
    mongoose.connection.close();
  }
}

setupWeeklyAvailabilities(); 