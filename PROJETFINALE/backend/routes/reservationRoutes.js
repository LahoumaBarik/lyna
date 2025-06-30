const express = require('express');
const reservationController = require('../controllers/reservationController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Créer une réservation (auth requise)
router.post('/', auth, reservationController.creerReservation);

// Voir ses réservations (auth requise)
router.get('/', auth, reservationController.listerReservations);

// Supprimer une réservation (auth requise)
router.delete('/:id', auth, reservationController.supprimerReservation);

// Modifier une réservation (auth requise)
router.patch('/:id', auth, reservationController.modifierReservation);

// Annuler une réservation (auth requise) - alias for frontend compatibility
router.put('/:id/cancel', auth, reservationController.supprimerReservation);

module.exports = router; 