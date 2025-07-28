const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/salon-reservation-platform')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const User = require('./models/User');

async function fixStylistProfiles() {
  try {
    console.log('Starting stylist profile cleanup...');

    // Find all stylists with corrupted stylistInfo
    const stylists = await User.find({ role: 'stylist' });
    
    console.log(`Found ${stylists.length} stylists`);

    for (const stylist of stylists) {
      console.log(`Processing stylist: ${stylist.firstName} ${stylist.lastName} (${stylist._id})`);
      
      let needsUpdate = false;
      const updates = {};

      // Check if stylistInfo exists and is valid
      if (!stylist.stylistInfo) {
        console.log('  - Creating missing stylistInfo');
        updates.stylistInfo = {
          businessName: '',
          license: { number: '', expiryDate: null, issuingState: '' },
          specializations: [],
          certifications: [],
          experience: { years: 0, description: '' },
          description: '',
          level: 'Styliste / Expert',
          expertise: '',
          inspiration: '',
          expertTip: '',
          favoriteProducts: [],
          socialMedia: { instagram: '', facebook: '', tiktok: '', website: '' },
          workingHours: {
            monday: { start: '09:00', end: '17:00', available: true },
            tuesday: { start: '09:00', end: '17:00', available: true },
            wednesday: { start: '09:00', end: '17:00', available: true },
            thursday: { start: '09:00', end: '17:00', available: true },
            friday: { start: '09:00', end: '17:00', available: true },
            saturday: { start: '09:00', end: '17:00', available: true },
            sunday: { start: '09:00', end: '17:00', available: false }
          },
          commission: 50
        };
        needsUpdate = true;
      } else {
        // Check for corrupted description field
        if (stylist.stylistInfo.description && 
            stylist.stylistInfo.description.includes('Validation errors: availability.preferredSchedule')) {
          console.log('  - Fixing corrupted description');
          updates['stylistInfo.description'] = 'Styliste professionnel avec expertise en coiffure moderne.';
          needsUpdate = true;
        }

        // Ensure required fields exist
        if (!stylist.stylistInfo.experience) {
          console.log('  - Adding missing experience field');
          updates['stylistInfo.experience'] = { years: 0, description: '' };
          needsUpdate = true;
        }

        if (!stylist.stylistInfo.specializations) {
          console.log('  - Adding missing specializations field');
          updates['stylistInfo.specializations'] = [];
          needsUpdate = true;
        }

        if (!stylist.stylistInfo.level) {
          console.log('  - Adding missing level field');
          updates['stylistInfo.level'] = 'Styliste / Expert';
          needsUpdate = true;
        }
      }

      // Update if needed
      if (needsUpdate) {
        await User.findByIdAndUpdate(stylist._id, updates);
        console.log('  - Profile updated successfully');
      } else {
        console.log('  - Profile is clean, no updates needed');
      }
    }

    console.log('Stylist profile cleanup completed!');
    
    // Also check for any reservations
    const Reservation = require('./models/Reservation');
    const reservations = await Reservation.find().populate('client stylist');
    console.log(`\nFound ${reservations.length} total reservations:`);
    
    reservations.forEach(reservation => {
      console.log(`  - ${reservation.date}: ${reservation.client?.firstName} ${reservation.client?.lastName} with ${reservation.stylist?.firstName} ${reservation.stylist?.lastName} (Status: ${reservation.status})`);
    });

  } catch (error) {
    console.error('Error fixing stylist profiles:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixStylistProfiles(); 