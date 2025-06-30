require('dotenv').config({ path: './config.env' });
const { connectDB } = require('./config/database');
const { User, Service, Disponibilite } = require('./models');

async function createAdmin() {
  try {
    // Use centralized database connection
    await connectDB();
    
    console.log('Creating admin account...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@salon.com' });
    if (existingAdmin) {
      console.log('❌ Admin already exists with email: admin@salon.com');
      process.exit(1);
    }

    const adminData = {
      email: 'admin@salon.com',
      password: 'Admin123!', // You should change this
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+1234567890',
      role: 'admin',
      status: 'active',
      emailVerified: true,
      permissions: [
        'view_all_reservations',
        'edit_all_reservations',
        'manage_services',
        'manage_stylists',
        'view_analytics',
        'manage_payments',
        'send_notifications',
        'manage_settings'
      ]
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin created successfully!');
    console.log('📧 Email: admin@salon.com');
    console.log('🔐 Password: Admin123!');
    console.log('⚠️  Please change the password after first login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    if (error.code === 11000) {
      console.error('Admin already exists with this email or phone');
    }
    process.exit(1);
  }
}

async function createTestData() {
  try {
    await connectDB();
    console.log('Connecté à MongoDB');

    // Créer un admin
    const admin = new User({
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      phone: '0123456789',
      role: 'admin'
    });
    await admin.save();
    console.log('Admin créé');

    // Créer une coiffeuse
    const coiffeuse = new User({
      email: 'coiffeuse@example.com',
      password: 'coiffeuse123',
      firstName: 'Sarah',
      lastName: 'Style',
      phone: '0123456789',
      role: 'stylist',
      stylistInfo: {
        businessName: 'Sarah Style Coiffure',
        description: 'Experte en coloration et coupe moderne',
        isVerified: true
      }
    });
    await coiffeuse.save();
    console.log('Coiffeuse créée');

    // Créer des disponibilités pour la coiffeuse
    const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi'];
    const creneaux = [
      { debut: '09:00', fin: '12:00' },
      { debut: '14:00', fin: '18:00' }
    ];

    for (const jour of jours) {
      for (const creneau of creneaux) {
        const dispo = new Disponibilite({
          stylist: coiffeuse._id,
          jour: jour,
          heureDebut: creneau.debut,
          heureFin: creneau.fin,
          isActive: true
        });
        await dispo.save();
      }
    }
    console.log('Disponibilités créées');

    console.log('Données de test créées avec succès');
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️ Process interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️ Process terminated');
  process.exit(0);
});

createAdmin();
createTestData(); 