const mongoose = require('mongoose');
const { Reservation } = require('./models');

async function fixReservationIssues() {
  try {
    await mongoose.connect(process.env.DATABASE_URI || 'mongodb://localhost:27017/salon_reservation');
    console.log('Connected to MongoDB');

    // Update all reservations that don't have auditTrail
    const result = await Reservation.updateMany(
      { auditTrail: { $exists: false } },
      { $set: { auditTrail: [] } }
    );

    console.log(`Updated ${result.modifiedCount} reservations to include auditTrail`);

    // Also update any reservations with null auditTrail
    const result2 = await Reservation.updateMany(
      { auditTrail: null },
      { $set: { auditTrail: [] } }
    );

    console.log(`Updated ${result2.modifiedCount} reservations with null auditTrail`);

    console.log('✅ Reservation audit trail fix complete');
    
  } catch (error) {
    console.error('❌ Error fixing reservation issues:', error);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  require('dotenv').config({ path: './config.env' });
  fixReservationIssues();
}

module.exports = fixReservationIssues; 