require('dotenv').config();
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

// Validation middleware - Made more user-friendly
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .matches(/^[\+]?[\d\s\-\(\)]{8,20}$/)
    .withMessage('Please provide a valid phone number'),
  body('role').optional().isIn(['admin', 'client', 'stylist']).withMessage('Rôle invalide')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const passwordResetValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const passwordResetConfirmValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

// Auth routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', auth, authController.logout);

// Profile routes
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);

// Password reset routes
router.post('/reset-password', passwordResetValidation, authController.requestPasswordReset);
router.post('/reset-password/confirm', passwordResetConfirmValidation, authController.confirmPasswordReset);

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Enhanced Auth routes working correctly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    features: {
      refreshTokens: true,
      passwordReset: true,
      accountLocking: true,
      enhancedSecurity: true
    }
  });
});

// Route pour demander la réinitialisation
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      resetTokens[token] = { userId: user._id, expires: Date.now() + 3600 * 1000 };
      const resetLink = `http://localhost:3000/reset-password/confirm?token=${token}`;
      // Configure ton transporteur mail ici
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS
        }
      });
      await transporter.sendMail({
        from: 'She <no-reply@she.co>',
        to: user.email,
        subject: 'Réinitialisation de mot de passe',
        html: `<p>Pour réinitialiser votre mot de passe, cliquez ici : <a href="${resetLink}">${resetLink}</a></p>`
      });
    }
    res.json({ message: "Si ce compte existe, un email a été envoyé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de l'envoi de l'email de réinitialisation." });
  }
});

// Route pour confirmer la réinitialisation
router.post('/reset-password/confirm', async (req, res) => {
  const { token, password } = req.body;
  const data = resetTokens[token];
  if (!data || data.expires < Date.now()) {
    return res.status(400).json({ message: "Lien expiré ou invalide." });
  }
  const user = await User.findById(data.userId);
  if (!user) return res.status(400).json({ message: "Utilisateur introuvable." });
  user.password = password;
  await user.save();
  delete resetTokens[token];
  res.json({ message: "Mot de passe réinitialisé. Vous pouvez vous connecter." });
});

module.exports = router; 