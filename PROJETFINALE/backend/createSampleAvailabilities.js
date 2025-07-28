const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/salon-reservation-platform')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const Disponibilite = require('./models/Disponibilite');
const User = require('./models/User');

async function createSampleAvailabilities() {
  try {
    console.log('Creating sample availabilities for testing...');

    // Find yas stylist
    const yasStylist = await User.findOne({ firstName: 'yas', role: 'stylist' });
    if (!yasStylist) {
      console.log('Yas stylist not found, creating sample data for any stylist...');
      const stylists = await User.find({ role: 'stylist' });
      if (stylists.length === 0) {
        console.log('No stylists found');
        return;
      }
      const stylist = stylists[0];
      console.log(`Using stylist: ${stylist.firstName} ${stylist.lastName}`);
    }

    const stylist = yasStylist || (await User.find({ role: 'stylist' }))[0];
    
    // Get current week dates
    const getCurrentWeekDates = () => {
      const dates = {};
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
      
      const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      dayNames.forEach((day, index) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + index);
        dates[day] = date.toISOString().split('T')[0];
      });
      
      return dates;
    };

    const weekDates = getCurrentWeekDates();
    
    // Sample availabilities for different days
    const sampleAvailabilities = [
      { day: 'monday', start: '09:00', end: '17:00' },
      { day: 'tuesday', start: '09:00', end: '17:00' },
      { day: 'wednesday', start: '09:00', end: '17:00' },
      { day: 'thursday', start: '09:00', end: '17:00' },
      { day: 'friday', start: '09:00', end: '17:00' },
      { day: 'saturday', start: '10:00', end: '16:00' },
      // Sunday - no availability
    ];

    // Clear existing availabilities for this week
    await Disponibilite.deleteMany({
      stylist: stylist._id,
      jour: { $in: Object.values(weekDates) }
    });

    console.log('Creating sample availabilities...');

    for (const avail of sampleAvailabilities) {
      const availability = new Disponibilite({
        stylist: stylist._id,
        jour: new Date(weekDates[avail.day] + 'T00:00:00.000Z'),
        heureDebut: avail.start,
        heureFin: avail.end,
        isActive: true
      });

      await availability.save();
      console.log(`  - ${avail.day}: ${avail.start}-${avail.end}`);
    }

    console.log('Sample availabilities created successfully!');
    console.log(`Stylist: ${stylist.firstName} ${stylist.lastName}`);
    console.log('Week:', Object.values(weekDates));

  } catch (error) {
    console.error('Error creating sample availabilities:', error);
  } finally {
    mongoose.connection.close();
  }
}

createSampleAvailabilities(); 