const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();
const { sendToRole } = require('../utils/socketIO');

// Validation middleware for coiffeuse creation
const validateCoiffeuse = [
  body('firstName')
    .notEmpty()
    .withMessage('Le prénom est requis')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères')
    .trim(),
  body('lastName')
    .notEmpty()
    .withMessage('Le nom de famille est requis')
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom de famille doit contenir entre 2 et 50 caractères')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Format d\'email invalide')
    .normalizeEmail(),
  body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]{8,}$/)
    .withMessage('Format de téléphone invalide'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères')
];

// Lister toutes les coiffeuses (public)
router.get('/', async (req, res) => {
  try {
    const coiffeuses = await User.find({ role: 'stylist' });
    res.json(coiffeuses);
  } catch (err) {
    // Log full error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Get coiffeuses error:', err.stack);
    }
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Récupérer une coiffeuse par son ID (public)
router.get('/:id', async (req, res) => {
  try {
    const coiffeuse = await User.findById(req.params.id);
    if (!coiffeuse || coiffeuse.role !== 'stylist') {
      return res.status(404).json({ message: 'Coiffeuse non trouvée' });
    }
    res.json(coiffeuse);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get coiffeuse by ID error:', err.stack);
    }
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// Ajouter une coiffeuse
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, stylistInfo } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName) {
      return res.status(400).json({ 
        message: 'Le prénom et le nom de famille sont requis',
        missing: {
          firstName: !firstName,
          lastName: !lastName
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ 
        message: 'Format d\'email invalide'
      });
    }

    // Validate phone format if provided
    if (phone && !/^\+?[\d\s\-\(\)]{8,}$/.test(phone)) {
      return res.status(400).json({ 
        message: 'Format de téléphone invalide'
      });
    }

    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: 'stylist'
    };

    // Add optional fields if provided
    if (email) userData.email = email.trim().toLowerCase();
    if (phone) userData.phone = phone.trim();
    if (password) userData.password = password;
    if (stylistInfo) userData.stylistInfo = stylistInfo;

    const user = new User(userData);
    await user.save();
    try {
      sendToRole('admin', 'stylists_changed', { action: 'created', stylist: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      }});
    } catch (e) {}
    res.status(201).json({ 
      message: 'Coiffeuse créée avec succès',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        stylistInfo: user.stylistInfo
      }
    });
  } catch (err) {
    // Log full error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Create coiffeuse error:', err.stack);
    }
    
    // Handle specific MongoDB errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ 
        message: 'Erreur de validation',
        errors: validationErrors
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Cet email est déjà utilisé'
      });
    }

    res.status(500).json({ 
      message: 'Erreur lors de la création de la coiffeuse', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne'
    });
  }
});

router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove empty password
    if (updates.password === '') delete updates.password;
    
    // Validate email format if being updated
    if (updates.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
      return res.status(400).json({ 
        message: 'Format d\'email invalide'
      });
    }

    // Validate phone format if being updated
    if (updates.phone && !/^\+?[\d\s\-\(\)]{8,}$/.test(updates.phone)) {
      return res.status(400).json({ 
        message: 'Format de téléphone invalide'
      });
    }

    const user = await User.findOneAndUpdate({ _id: id, role: 'stylist' }, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'Coiffeuse non trouvée' });
    try {
      sendToRole('admin', 'stylists_changed', { action: 'updated', stylist: user });
    } catch (e) {}
    res.json({ 
      message: 'Coiffeuse modifiée avec succès',
      user 
    });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Update coiffeuse error:', err.stack);
    }
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ 
        message: 'Erreur de validation',
        errors: validationErrors
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: 'Cet email est déjà utilisé'
      });
    }

    res.status(500).json({ 
      message: 'Erreur lors de la modification de la coiffeuse', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne'
    });
  }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOneAndDelete({ _id: id, role: 'stylist' });
    if (!user) return res.status(404).json({ message: 'Coiffeuse non trouvée' });
    try {
      sendToRole('admin', 'stylists_changed', { action: 'deleted', id });
    } catch (e) {}
    res.json({ message: 'Coiffeuse supprimée avec succès' });
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Delete coiffeuse error:', err.stack);
    }
    res.status(500).json({ 
      message: 'Erreur lors de la suppression de la coiffeuse', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Erreur interne'
    });
  }
});

module.exports = router; 