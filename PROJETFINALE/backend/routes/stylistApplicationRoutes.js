const express = require('express');
const { body } = require('express-validator');
const stylistApplicationController = require('../controllers/stylistApplicationController');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Validation middleware for application submission
const applicationValidation = [
  body('motivation')
    .isLength({ min: 50, max: 1000 })
    .withMessage('Motivation must be between 50 and 1000 characters'),
  body('stylistInfo.businessName')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage('Business name must be between 2 and 100 characters'),
  body('stylistInfo.description')
    .optional({ checkFalsy: true })
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('stylistInfo.experience.years')
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience years must be between 0 and 50'),
  body('stylistInfo.specializations')
    .optional()
    .isArray()
    .withMessage('Specializations must be an array'),
  body('availability.preferredSchedule')
    .optional({ checkFalsy: true })
    .isIn(['full_time', 'part_time', 'flexible', 'weekends_only'])
    .withMessage('Invalid preferred schedule')
];

// Validation middleware for admin actions
const reviewValidation = [
  body('reviewNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Review notes must be less than 1000 characters'),
  body('rejectionMessage')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Rejection message must be less than 1000 characters'),
  body('interviewNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Interview notes must be less than 500 characters'),
  body('location')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Location must be less than 200 characters')
];

// Client routes (require authentication)
router.post('/', auth, applicationValidation, stylistApplicationController.submitApplication);
router.get('/my-application', auth, stylistApplicationController.getMyApplication);

// Admin routes (require admin role)
router.get('/', auth, requireRole('admin'), stylistApplicationController.getAllApplications);
router.get('/:id', auth, requireRole('admin'), stylistApplicationController.getApplication);
router.put('/:id/approve', auth, requireRole('admin'), reviewValidation, stylistApplicationController.approveApplication);
router.put('/:id/reject', auth, requireRole('admin'), reviewValidation, stylistApplicationController.rejectApplication);
router.put('/:id/interview', auth, requireRole('admin'), reviewValidation, stylistApplicationController.requestInterview);
router.put('/:id/update-interview', auth, requireRole('admin'), stylistApplicationController.updateInterview);

module.exports = router; 