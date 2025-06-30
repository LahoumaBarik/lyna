const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Core review data
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true,
    unique: true // One review per reservation
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  stylist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  
  // Rating system
  overallRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  detailedRatings: {
    quality: { type: Number, min: 1, max: 5 },
    timeliness: { type: Number, min: 1, max: 5 },
    cleanliness: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 }
  },
  
  // Review content
  title: {
    type: String,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Additional feedback
  wouldRecommend: {
    type: Boolean,
    required: true
  },
  wouldBookAgain: {
    type: Boolean,
    required: true
  },
  
  // Media attachments
  photos: [{
    url: String,
    publicId: String,
    caption: String
  }],
  
  // Stylist response
  response: {
    comment: String,
    respondedAt: Date,
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  
  // Moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'hidden'],
    default: 'pending'
  },
  moderationNotes: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  
  // Helpful votes
  helpfulVotes: {
    count: { type: Number, default: 0 },
    voters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  
  // Analytics
  verified: {
    type: Boolean,
    default: true // Verified through reservation
  },
  featured: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
reviewSchema.index({ stylist: 1, status: 1, createdAt: -1 });
reviewSchema.index({ service: 1, status: 1 });
reviewSchema.index({ overallRating: -1 });
reviewSchema.index({ featured: 1, status: 1 });

// Virtuals
reviewSchema.virtual('averageDetailedRating').get(function() {
  const ratings = this.detailedRatings;
  const values = Object.values(ratings).filter(rating => rating > 0);
  if (values.length === 0) return this.overallRating;
  return values.reduce((sum, rating) => sum + rating, 0) / values.length;
});

// Methods
reviewSchema.methods.markHelpful = function(userId) {
  if (!this.helpfulVotes.voters.includes(userId)) {
    this.helpfulVotes.voters.push(userId);
    this.helpfulVotes.count += 1;
  }
  return this.save();
};

reviewSchema.methods.addResponse = function(comment, isPublic = true) {
  this.response = {
    comment,
    respondedAt: new Date(),
    isPublic
  };
  return this.save();
};

// Static methods
reviewSchema.statics.getAverageRating = function(stylistId) {
  return this.aggregate([
    { $match: { stylist: stylistId, status: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$overallRating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$overallRating'
        }
      }
    }
  ]);
};

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review; 