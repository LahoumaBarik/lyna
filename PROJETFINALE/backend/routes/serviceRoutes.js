const express = require('express');
const { body, validationResult } = require('express-validator');
const serviceController = require('../controllers/serviceController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Validation middleware for service creation
const validateService = [
  body('name')
    .notEmpty()
    .withMessage('Le nom du service est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères')
    .trim(),
  body('description')
    .notEmpty()
    .withMessage('La description est requise')
    .isLength({ min: 10, max: 500 })
    .withMessage('La description doit contenir entre 10 et 500 caractères')
    .trim(),
  body('duration')
    .isNumeric()
    .withMessage('La durée doit être un nombre')
    .isFloat({ min: 15, max: 480 })
    .withMessage('La durée doit être entre 15 et 480 minutes'),
  body('price')
    .isNumeric()
    .withMessage('Le prix doit être un nombre')
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Le prix doit être entre 0 et 1000 euros'),
  body('category')
    .isIn(['cut', 'color', 'styling', 'treatment', 'extensions', 'bridal', 'mens', 'kids', 'package'])
    .withMessage('Catégorie invalide')
];

// Ajouter un service (auth admin requis)
router.post('/', auth, requireRole('admin'), validateService, serviceController.ajouterService);

// Lister les services (public)
router.get('/', serviceController.listerServices);

// Modifier un service (auth admin requis)
router.put('/:id', auth, requireRole('admin'), validateService, serviceController.modifierService);

// Supprimer un service (auth admin requis)
router.delete('/:id', auth, requireRole('admin'), serviceController.supprimerService);

module.exports = router; 