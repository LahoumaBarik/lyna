const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// Récupérer le profil du user connecté
router.get('/me', auth, userController.getMe);
// Modifier le profil du user connecté
router.put('/me', auth, userController.updateMe);

module.exports = router; 