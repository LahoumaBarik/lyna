const express = require('express');
const { body, param } = require('express-validator');
const disponibiliteController = require('../controllers/disponibiliteController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Validation middleware for disponibilite creation
const validateDisponibilite = [
  body('stylist')
    .notEmpty()
    .withMessage('Le styliste est requis')
    .isMongoId()
    .withMessage('ID de styliste invalide'),
  body('jour')
    .notEmpty()
    .withMessage('La date est requise')
    .isDate({ format: 'YYYY-MM-DD' })
    .withMessage('Format de date invalide (YYYY-MM-DD)')
    .custom((value) => {
      const selectedDate = new Date(value + 'T00:00:00.000Z');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        throw new Error('Impossible de créer une disponibilité dans le passé');
      }
      return true;
    }),
  body('heureDebut')
    .notEmpty()
    .withMessage('L\'heure de début est requise')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Format d\'heure de début invalide (HH:mm)'),
  body('heureFin')
    .notEmpty()
    .withMessage('L\'heure de fin est requise')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Format d\'heure de fin invalide (HH:mm)')
    .custom((value, { req }) => {
      if (req.body.heureDebut) {
        const [startHour, startMin] = req.body.heureDebut.split(':').map(Number);
        const [endHour, endMin] = value.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        if (endMinutes <= startMinutes) {
          throw new Error('L\'heure de fin doit être après l\'heure de début');
        }
      }
      return true;
    })
];

// Route pour l'admin : lister TOUTES les disponibilités (protégée)
router.get('/', auth, requireRole('admin'), disponibiliteController.listerDisponibilites);

// Ajouter une disponibilité (auth admin requis)
router.post('/', auth, requireRole('admin'), validateDisponibilite, disponibiliteController.ajouterDisponibilite);

// Route publique pour les clients : lister les disponibilités par coiffeuse
router.get('/coiffeuse/:coiffeuseId', disponibiliteController.listerDisponibilites);

// Modifier une disponibilité (auth admin requis)
router.put('/:id', auth, requireRole('admin'), validateDisponibilite, disponibiliteController.modifierDisponibilite);

// Supprimer une disponibilité (auth admin requis)
router.delete('/:id', auth, requireRole('admin'), disponibiliteController.supprimerDisponibilite);

module.exports = router; 