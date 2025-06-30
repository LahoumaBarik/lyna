const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  stylist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    maxlength: 150
  },
  
  // Service categorization
  category: {
    type: String,
    required: true,
    enum: ['cut', 'color', 'styling', 'treatment', 'extensions', 'bridal', 'mens', 'kids', 'package'],
    index: true
  },
  subcategory: {
    type: String,
    enum: [
      // Cut subcategories
      'basic_cut', 'precision_cut', 'scissor_cut', 'razor_cut',
      // Color subcategories
      'full_color', 'highlights', 'lowlights', 'balayage', 'ombre', 'color_correction',
      // Styling subcategories
      'blowout', 'updo', 'braiding', 'curls', 'straightening',
      // Treatment subcategories
      'deep_conditioning', 'keratin', 'scalp_treatment', 'hair_mask'
    ]
  },
  
  // Pricing structure
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0
    },
    // Dynamic pricing based on stylist level
    levelPricing: {
      academy: Number,
      junior: Number,
      senior: Number,
      master: Number
    },
    // Time-based pricing
    peakHourMultiplier: {
      type: Number,
      default: 1.0,
      min: 1.0,
      max: 2.0
    },
    // Length-based pricing for cuts
    lengthPricing: {
      short: Number,
      medium: Number,
      long: Number,
      extraLong: Number
    }
  },
  
  // Service details
  duration: {
    base: {
      type: Number,
      required: true,
      min: 15
    },
    // Variable duration based on hair length/complexity
    variableDuration: {
      short: Number,
      medium: Number,
      long: Number,
      extraLong: Number
    }
  },
  
  // Service requirements
  requirements: {
    consultationRequired: {
      type: Boolean,
      default: false
    },
    patchTestRequired: {
      type: Boolean,
      default: false
    },
    minimumAge: {
      type: Number,
      default: 0
    },
    maximumAge: Number,
    gender: {
      type: String,
      enum: ['any', 'female', 'male']
    }
  },
  
  // Add-on services
  addOns: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    price: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    isOptional: {
      type: Boolean,
      default: true
    }
  }],
  
  // Package deals
  packageInfo: {
    isPackage: {
      type: Boolean,
      default: false
    },
    includedServices: [{
      service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service'
      },
      quantity: {
        type: Number,
        default: 1
      }
    }],
    validityPeriod: {
      type: Number, // days
      default: 365
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  
  // Media and presentation
  images: [{
    url: String,
    publicId: String, // Cloudinary ID
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // SEO and marketing
  tags: [String],
  seoTitle: String,
  seoDescription: String,
  
  // Booking settings
  bookingSettings: {
    advanceBookingDays: {
      type: Number,
      default: 90
    },
    lastMinuteBookingHours: {
      type: Number,
      default: 24
    },
    bufferTime: {
      before: {
        type: Number,
        default: 0 // minutes
      },
      after: {
        type: Number,
        default: 15 // minutes
      }
    },
    maxBookingsPerDay: Number,
    requiresDeposit: {
      type: Boolean,
      default: false
    },
    depositAmount: Number,
    depositPercentage: Number
  },
  
  // Availability
  availability: {
    daysOfWeek: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    timeSlots: [{
      start: String,
      end: String
    }],
    blackoutDates: [{
      start: Date,
      end: Date,
      reason: String
    }]
  },
  
  // Analytics and performance
  analytics: {
    totalBookings: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    ratingCount: {
      type: Number,
      default: 0
    },
    popularityScore: {
      type: Number,
      default: 0
    },
    lastBookedAt: Date
  },
  
  // Status and visibility
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isPromoted: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNewService: {
    type: Boolean,
    default: true
  },
  
  // Professional information
  products: [{
    brand: String,
    name: String,
    type: String
  }],
  aftercareInstructions: String,
  
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

// Indexes for performance
serviceSchema.index({ stylist: 1, isActive: 1 });
serviceSchema.index({ category: 1, subcategory: 1 });
serviceSchema.index({ 'pricing.basePrice': 1 });
serviceSchema.index({ tags: 1 });
serviceSchema.index({ isPromoted: 1, isFeatured: 1 });
serviceSchema.index({ 'analytics.popularityScore': -1 });
serviceSchema.index({ createdAt: -1 });

// Virtual for final price calculation
serviceSchema.virtual('finalPrice').get(function() {
  let price = this.pricing.basePrice;
  
  // Apply peak hour multiplier if needed
  if (this.pricing.peakHourMultiplier > 1) {
    price *= this.pricing.peakHourMultiplier;
  }
  
  return Math.round(price * 100) / 100; // Round to 2 decimal places
});

// Virtual for primary image
serviceSchema.virtual('primaryImage').get(function() {
  if (!this.images || !Array.isArray(this.images) || this.images.length === 0) {
    return null;
  }
  const primary = this.images.find(img => img.isPrimary);
  return primary || this.images[0] || null;
});

// Virtual for duration display
serviceSchema.virtual('durationDisplay').get(function() {
  const hours = Math.floor(this.duration.base / 60);
  const minutes = this.duration.base % 60;
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
});

// Virtual for popularity indicator
serviceSchema.virtual('popularityLevel').get(function() {
  const score = this.analytics.popularityScore;
  if (score >= 80) return 'very_popular';
  if (score >= 60) return 'popular';
  if (score >= 40) return 'moderate';
  if (score >= 20) return 'low';
  return 'new';
});

// Pre-save middleware
serviceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate popularity score based on bookings and ratings
  if (this.analytics.totalBookings > 0) {
    const bookingScore = Math.min(this.analytics.totalBookings / 10, 50); // Max 50 points for bookings
    const ratingScore = this.analytics.averageRating * 10; // Max 50 points for rating
    this.analytics.popularityScore = Math.round(bookingScore + ratingScore);
  }
  
  // Mark as not new after 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  if (this.createdAt < thirtyDaysAgo) {
    this.isNewService = false;
  }
  
  next();
});

// Methods
serviceSchema.methods.calculatePrice = function(options = {}) {
  let price = this.pricing.basePrice;
  
  // Apply stylist level pricing
  if (options.stylistLevel && this.pricing.levelPricing[options.stylistLevel]) {
    price = this.pricing.levelPricing[options.stylistLevel];
  }
  
  // Apply length-based pricing
  if (options.hairLength && this.pricing.lengthPricing[options.hairLength]) {
    price = this.pricing.lengthPricing[options.hairLength];
  }
  
  // Apply peak hour multiplier
  if (options.isPeakHour) {
    price *= this.pricing.peakHourMultiplier;
  }
  
  return Math.round(price * 100) / 100;
};

serviceSchema.methods.calculateDuration = function(options = {}) {
  let duration = this.duration.base;
  
  // Apply variable duration based on hair length
  if (options.hairLength && this.duration.variableDuration[options.hairLength]) {
    duration = this.duration.variableDuration[options.hairLength];
  }
  
  // Add buffer times
  duration += this.bookingSettings.bufferTime.before + this.bookingSettings.bufferTime.after;
  
  return duration;
};

serviceSchema.methods.isAvailableOn = function(dayOfWeek) {
  return this.availability.daysOfWeek.includes(dayOfWeek.toLowerCase());
};

serviceSchema.methods.isInBlackoutPeriod = function(date) {
  return this.availability.blackoutDates.some(blackout => 
    date >= blackout.start && date <= blackout.end
  );
};

serviceSchema.methods.updateAnalytics = function(booking) {
  this.analytics.totalBookings += 1;
  this.analytics.totalRevenue += booking.pricing.total;
  this.analytics.lastBookedAt = new Date();
  
  return this.save();
};

serviceSchema.methods.addRating = function(rating) {
  const totalRating = (this.analytics.averageRating * this.analytics.ratingCount) + rating;
  this.analytics.ratingCount += 1;
  this.analytics.averageRating = totalRating / this.analytics.ratingCount;
  
  return this.save();
};

// Static methods
serviceSchema.statics.findByCategory = function(category, isActive = true) {
  return this.find({ category, isActive })
    .populate('stylist', 'firstName lastName stylistInfo.level')
    .sort({ 'analytics.popularityScore': -1 });
};

serviceSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    isActive: true,
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } }
    ]
  };
  
  // Apply filters
  if (filters.category) searchQuery.category = filters.category;
  if (filters.priceMin) searchQuery['pricing.basePrice'] = { $gte: filters.priceMin };
  if (filters.priceMax) {
    searchQuery['pricing.basePrice'] = { 
      ...searchQuery['pricing.basePrice'], 
      $lte: filters.priceMax 
    };
  }
  if (filters.duration) {
    searchQuery['duration.base'] = { $lte: filters.duration };
  }
  
  return this.find(searchQuery)
    .populate('stylist', 'firstName lastName stylistInfo.level')
    .sort({ 'analytics.popularityScore': -1 });
};

serviceSchema.statics.getFeatured = function(limit = 6) {
  return this.find({ isFeatured: true, isActive: true })
    .populate('stylist', 'firstName lastName stylistInfo.level')
    .sort({ 'analytics.popularityScore': -1 })
    .limit(limit);
};

serviceSchema.statics.getPopular = function(limit = 10) {
  return this.find({ isActive: true })
    .populate('stylist', 'firstName lastName stylistInfo.level')
    .sort({ 'analytics.popularityScore': -1 })
    .limit(limit);
};

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service; 