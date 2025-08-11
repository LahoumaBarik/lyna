const { Service } = require('../models');
const { sendToRole } = require('../utils/socketIO');
const { validationResult } = require('express-validator');

// Ajouter un service (POST)
exports.ajouterService = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Données invalides', 
        errors: errors.array() 
      });
    }

    const { name, description, duration, price, category } = req.body;
    
    // Validate required fields
    if (!name || !description || !duration || !price || !category) {
      return res.status(400).json({ 
        message: 'Tous les champs sont requis',
        missing: {
          name: !name,
          description: !description,
          duration: !duration,
          price: !price,
          category: !category
        }
      });
    }

    // Cast and validate duration
    const durationNumber = Number(duration);
    if (isNaN(durationNumber) || durationNumber < 15) {
      return res.status(400).json({ 
        message: 'La durée doit être un nombre supérieur ou égal à 15 minutes'
      });
    }

    // Cast and validate price
    const priceNumber = Number(price);
    if (isNaN(priceNumber) || priceNumber < 0) {
      return res.status(400).json({ 
        message: 'Le prix doit être un nombre positif'
      });
    }

    // Validate category against allowed enum values
    const allowedCategories = ['cut', 'color', 'styling', 'treatment', 'extensions', 'bridal', 'mens', 'kids', 'package'];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ 
        message: 'Catégorie invalide',
        allowedCategories
      });
    }

    // Create service with proper schema structure
    const service = new Service({
      stylist: req.user._id,
      name: name.trim(),
      description: description.trim(),
      category,
      // Map simple fields to complex schema structure
      duration: {
        base: durationNumber
      },
      pricing: {
        basePrice: priceNumber
      }
    });

    await service.save();
    const payload = { 
      message: 'Service ajouté avec succès', 
      service: {
        _id: service._id,
        name: service.name,
        description: service.description,
        duration: service.duration.base,
        price: service.pricing.basePrice,
        category: service.category,
        stylist: service.stylist
      }
    };

    // Emit real-time update to admin dashboards
    try {
      sendToRole('admin', 'services_changed', { action: 'created', service: payload.service });
    } catch (e) {
      // non-blocking
    }

    res.status(201).json(payload);
  } catch (error) {
    // Log full error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Service creation error:', error.stack);
    }
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Erreur de validation',
        errors: validationErrors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Un service avec ce nom existe déjà pour ce styliste'
      });
    }

    res.status(500).json({ 
      message: 'Erreur serveur lors de la création du service', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
  }
};

// Lister les services (GET)
exports.listerServices = async (req, res) => {
  try {
    const services = await Service.find({}).populate('stylist', 'firstName lastName stylistInfo');
    
    // Transform services to match frontend expectations
    const transformedServices = services.map(service => ({
      _id: service._id,
      name: service.name,
      description: service.description,
      // Handle both simple and complex duration structures
      duration: service.duration?.base || service.duration || 60,
      // Handle both simple and complex pricing structures
      price: service.pricing?.basePrice || service.price || 50,
      category: service.category,
      stylist: service.stylist
    }));
    
    res.json(transformedServices);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Modifier un service (PUT)
exports.modifierService = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const service = await Service.findByIdAndUpdate(id, updates, { new: true });
    if (!service) return res.status(404).json({ message: 'Service non trouvé' });
    // Emit real-time update
    try {
      const formatted = {
        _id: service._id,
        name: service.name,
        description: service.description,
        duration: service.duration?.base || service.duration,
        price: service.pricing?.basePrice || service.price,
        category: service.category,
        stylist: service.stylist
      };
      sendToRole('admin', 'services_changed', { action: 'updated', service: formatted });
    } catch (e) {}
    res.json({ message: 'Service modifié avec succès', service });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer un service (DELETE)
exports.supprimerService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    if (!service) return res.status(404).json({ message: 'Service non trouvé' });
    try {
      sendToRole('admin', 'services_changed', { action: 'deleted', id });
    } catch (e) {}
    res.json({ message: 'Service supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}; 