const express = require('express');
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Simuler le paiement d'une réservation
router.post('/payment', auth, paymentController.payerReservation);

// Confirmer un paiement PayPal
router.post('/confirm', auth, paymentController.confirmPayment);

// Obtenir l'historique des paiements pour une coiffeuse
router.get('/history', auth, paymentController.getPaymentHistory);

module.exports = router; 