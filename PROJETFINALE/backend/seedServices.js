require('dotenv').config({ path: './config.env' });
const { connectDB } = require('./config/database');
const { Service, User } = require('./models');

async function seedServices() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if services already exist
    const existingServices = await Service.countDocuments();
    if (existingServices > 0) {
      console.log('✅ Services already exist in database');
      process.exit(0);
    }

    // Find an admin or stylist to assign services to
    let stylist = await User.findOne({ role: 'admin' });
    if (!stylist) {
      stylist = await User.findOne({ role: 'stylist' });
    }
    if (!stylist) {
      console.log('❌ No admin or stylist found, cannot create services');
      process.exit(1);
    }

    const services = [
      {
        stylist: stylist._id,
        name: 'Coupe femme',
        description: 'Coupe de cheveux personnalisée pour femme avec consultation incluse',
        shortDescription: 'Coupe personnalisée femme',
        category: 'cut',
        subcategory: 'precision_cut',
        pricing: {
          basePrice: 45
        },
        duration: {
          base: 60
        },
        requirements: {
          consultationRequired: true,
          gender: 'female'
        },
        isActive: true
      },
      {
        stylist: stylist._id,
        name: 'Coupe homme',
        description: 'Coupe de cheveux moderne pour homme',
        shortDescription: 'Coupe moderne homme',
        category: 'mens',
        subcategory: 'basic_cut',
        pricing: {
          basePrice: 35
        },
        duration: {
          base: 45
        },
        requirements: {
          gender: 'male'
        },
        isActive: true
      },
      {
        stylist: stylist._id,
        name: 'Coloration complète',
        description: 'Coloration complète des cheveux avec produits professionnels',
        shortDescription: 'Coloration complète',
        category: 'color',
        subcategory: 'full_color',
        pricing: {
          basePrice: 80
        },
        duration: {
          base: 120
        },
        requirements: {
          consultationRequired: true,
          patchTestRequired: true
        },
        isActive: true
      },
      {
        stylist: stylist._id,
        name: 'Mèches et balayage',
        description: 'Technique de mèches et balayage pour un effet naturel',
        shortDescription: 'Mèches balayage',
        category: 'color',
        subcategory: 'balayage',
        pricing: {
          basePrice: 90
        },
        duration: {
          base: 150
        },
        requirements: {
          consultationRequired: true,
          patchTestRequired: true
        },
        isActive: true
      },
      {
        stylist: stylist._id,
        name: 'Brushing',
        description: 'Mise en plis et brushing professionnel',
        shortDescription: 'Brushing professionnel',
        category: 'styling',
        subcategory: 'blowout',
        pricing: {
          basePrice: 25
        },
        duration: {
          base: 30
        },
        isActive: true
      },
      {
        stylist: stylist._id,
        name: 'Soin capillaire',
        description: 'Soin profond pour cheveux abîmés et fragilisés',
        shortDescription: 'Soin capillaire profond',
        category: 'treatment',
        subcategory: 'deep_conditioning',
        pricing: {
          basePrice: 35
        },
        duration: {
          base: 45
        },
        isActive: true
      }
    ];

    for (const serviceData of services) {
      const service = new Service(serviceData);
      await service.save();
      console.log(`✅ Service created: ${service.name}`);
    }

    console.log('✅ All services created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    process.exit(1);
  }
}

seedServices(); 