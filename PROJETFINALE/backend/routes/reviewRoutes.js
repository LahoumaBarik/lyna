const express = require('express');
const { auth, requireRole, optionalAuth } = require('../middleware/auth');
const { Review, Reservation, User } = require('../models');

const router = express.Router();

// Get reviews for a stylist
router.get('/stylist/:stylistId', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, rating, verified } = req.query;
    
    const query = { 
      stylist: req.params.stylistId, 
      status: 'approved' 
    };
    
    if (rating) query.overallRating = parseInt(rating);
    if (verified) query.verified = verified === 'true';
    
    const reviews = await Review.find(query)
      .populate('client', 'firstName lastName')
      .populate('service', 'name')
      .sort({ featured: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Review.countDocuments(query);
    
    // Get rating statistics
    const ratingStats = await Review.getAverageRating(req.params.stylistId);
    
    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      stats: ratingStats[0] || {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: []
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a review
router.post('/', auth, async (req, res) => {
  try {
    const {
      reservationId,
      overallRating,
      detailedRatings,
      title,
      comment,
      wouldRecommend,
      wouldBookAgain,
      photos
    } = req.body;
    
    // Verify the reservation exists and belongs to the user
    const reservation = await Reservation.findOne({
      _id: reservationId,
      client: req.user._id,
      status: 'completed'
    }).populate('stylist services.service');
    
    if (!reservation) {
      return res.status(400).json({ 
        error: 'Reservation not found or not eligible for review' 
      });
    }
    
    // Check if review already exists
    const existingReview = await Review.findOne({ reservation: reservationId });
    if (existingReview) {
      return res.status(400).json({ error: 'Review already exists for this reservation' });
    }
    
    const review = new Review({
      reservation: reservationId,
      client: req.user._id,
      stylist: reservation.stylist._id,
      service: reservation.services[0].service._id,
      overallRating,
      detailedRatings: detailedRatings || {},
      title,
      comment,
      wouldRecommend,
      wouldBookAgain,
      photos: photos || [],
      verified: true,
      status: 'approved' // Auto-approve for now, can add moderation later
    });
    
    await review.save();
    
    // Update stylist rating
    const stylist = await User.findById(reservation.stylist._id);
    if (stylist.stylistInfo) {
      const currentRating = stylist.stylistInfo.rating || { average: 0, count: 0 };
      const newCount = currentRating.count + 1;
      const newAverage = ((currentRating.average * currentRating.count) + overallRating) / newCount;
      
      stylist.stylistInfo.rating = {
        average: newAverage,
        count: newCount
      };
      
      await stylist.save();
    }
    
    // Update service rating
    const service = reservation.services[0].service;
    await service.addRating(overallRating);
    
    await review.populate('client', 'firstName lastName');
    await review.populate('service', 'name');
    
    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a review
router.patch('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      client: req.user._id
    });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const allowedUpdates = [
      'overallRating', 'detailedRatings', 'title', 'comment', 
      'wouldRecommend', 'wouldBookAgain', 'photos'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        review[field] = req.body[field];
      }
    });
    
    await review.save();
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add stylist response
router.post('/:id/response', auth, requireRole('stylist', 'admin'), async (req, res) => {
  try {
    const { comment, isPublic = true } = req.body;
    
    const query = { _id: req.params.id };
    if (req.user.role === 'stylist') {
      query.stylist = req.user._id;
    }
    
    const review = await Review.findOne(query);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    await review.addResponse(comment, isPublic);
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark review as helpful
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    await review.markHelpful(req.user._id);
    res.json({ success: true, helpfulCount: review.helpfulVotes.count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all reviews for moderation
router.get('/admin/moderate', auth, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'pending' } = req.query;
    
    const reviews = await Review.find({ status })
      .populate('client', 'firstName lastName')
      .populate('stylist', 'firstName lastName')
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Review.countDocuments({ status });
    
    res.json({
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Moderate review
router.patch('/admin/:id/moderate', auth, requireRole('admin'), async (req, res) => {
  try {
    const { status, moderationNotes } = req.body;
    
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        status,
        moderationNotes,
        moderatedBy: req.user._id,
        moderatedAt: new Date()
      },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json({ success: true, review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get featured reviews
router.get('/featured', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const reviews = await Review.find({ 
      featured: true, 
      status: 'approved' 
    })
      .populate('client', 'firstName lastName')
      .populate('stylist', 'firstName lastName')
      .populate('service', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 