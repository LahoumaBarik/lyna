const mongoose = require('mongoose');

const waitListSchema = new mongoose.Schema({
  // Client information
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Preferred stylist
  stylist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Services requested
  services: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    addOns: [{
      name: String,
      price: Number,
      duration: Number
    }]
  }],
  
  // Preferred appointment details
  preferredDate: {
    type: Date,
    required: true,
    index: true
  },
  
  preferredTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  
  // Alternative preferences
  alternativePreferences: {
    flexibleDates: [{
      type: Date
    }],
    flexibleTimes: [{
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    }],
    alternateStylist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    timeRange: {
      start: {
        type: String,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      end: {
        type: String,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      }
    }
  },
  
  // Duration and pricing
  totalDuration: {
    type: Number,
    required: true // in minutes
  },
  
  estimatedPrice: {
    type: Number,
    required: true
  },
  
  // Waitlist management
  status: {
    type: String,
    enum: ['active', 'offered', 'accepted', 'declined', 'expired', 'cancelled'],
    default: 'active',
    index: true
  },
  
  position: {
    type: Number,
    default: 0 // position in queue (0 = highest priority)
  },
  
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'vip'],
    default: 'normal',
    index: true
  },
  
  // Offer management
  currentOffer: {
    offeredAt: Date,
    offeredSlot: {
      date: Date,
      startTime: String,
      endTime: String,
      stylist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    expiresAt: Date,
    responseDeadline: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
      }
    }
  },
  
  // Communication preferences
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    },
    immediateNotification: {
      type: Boolean,
      default: true // notify immediately when slot becomes available
    },
    advanceNotice: {
      type: Number,
      default: 60 // minutes of advance notice required
    }
  },
  
  // Client requirements
  requirements: {
    maxWaitTime: {
      type: Number, // maximum days willing to wait
      default: 14
    },
    mustBeOriginalStylist: {
      type: Boolean,
      default: false
    },
    mustBeOriginalDate: {
      type: Boolean,
      default: false
    },
    mustBeOriginalTime: {
      type: Boolean,
      default: false
    }
  },
  
  // Tracking and history
  offers: [{
    date: Date,
    startTime: String,
    endTime: String,
    stylist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    offeredAt: {
      type: Date,
      default: Date.now
    },
    response: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'expired']
    },
    respondedAt: Date,
    declineReason: String
  }],
  
  // Contact information
  contactInfo: {
    phone: String,
    email: String,
    preferredContactMethod: {
      type: String,
      enum: ['phone', 'email', 'sms', 'app'],
      default: 'email'
    }
  },
  
  // Notes and special requests
  notes: String,
  internalNotes: String,
  
  // Automated management
  autoAccept: {
    type: Boolean,
    default: false // automatically accept first available offer
  },
  
  // Metrics
  addedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  lastNotificationSent: Date,
  notificationCount: {
    type: Number,
    default: 0
  },
  
  // Conversion tracking
  convertedToReservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation'
  },
  
  convertedAt: Date,
  
  // Cancellation/removal
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: String,
  
  // Auto-expiry
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    },
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
waitListSchema.index({ stylist: 1, preferredDate: 1, status: 1 });
waitListSchema.index({ client: 1, status: 1 });
waitListSchema.index({ status: 1, priority: -1, position: 1 });
waitListSchema.index({ expiresAt: 1 });
waitListSchema.index({ 'currentOffer.expiresAt': 1 });

// Virtual for days waiting
waitListSchema.virtual('daysWaiting').get(function() {
  return Math.floor((new Date() - this.addedAt) / (1000 * 60 * 60 * 24));
});

// Static methods
waitListSchema.statics.findAvailableForSlot = function(date, startTime, endTime, stylistId = null) {
  const query = {
    status: 'active',
    preferredDate: { $lte: date },
    $or: [
      // Exact match on preferred time
      { preferredTime: startTime },
      // Flexible time range
      {
        'alternativePreferences.timeRange.start': { $lte: startTime },
        'alternativePreferences.timeRange.end': { $gte: endTime }
      },
      // Flexible times include this time
      { 'alternativePreferences.flexibleTimes': startTime }
    ]
  };
  
  // If specific stylist, include those who prefer this stylist or are flexible
  if (stylistId) {
    query.$or.push(
      { stylist: stylistId },
      { 'alternativePreferences.alternateStylist': stylistId }
    );
  }
  
  return this.find(query)
    .populate('client', 'firstName lastName email phone notificationPreferences')
    .populate('stylist', 'firstName lastName')
    .sort({ priority: -1, position: 1, addedAt: 1 });
};

waitListSchema.statics.getNextInQueue = function(stylistId, serviceIds = []) {
  const query = {
    status: 'active',
    stylist: stylistId
  };
  
  // If specific services, filter by those
  if (serviceIds.length > 0) {
    query['services.service'] = { $in: serviceIds };
  }
  
  return this.findOne(query)
    .populate('client', 'firstName lastName email phone')
    .sort({ priority: -1, position: 1, addedAt: 1 });
};

waitListSchema.statics.expireOldOffers = function() {
  return this.updateMany(
    {
      status: 'offered',
      'currentOffer.expiresAt': { $lt: new Date() }
    },
    {
      $set: { status: 'active' },
      $unset: { currentOffer: 1 }
    }
  );
};

waitListSchema.statics.expireOldEntries = function() {
  return this.updateMany(
    {
      status: { $in: ['active', 'offered'] },
      expiresAt: { $lt: new Date() }
    },
    {
      $set: { 
        status: 'expired',
        cancelledAt: new Date(),
        cancellationReason: 'Automatically expired after maximum wait time'
      }
    }
  );
};

// Instance methods
waitListSchema.methods.makeOffer = function(slot) {
  this.status = 'offered';
  this.currentOffer = {
    offeredAt: new Date(),
    offeredSlot: slot,
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    responseDeadline: new Date(Date.now() + 2 * 60 * 60 * 1000)
  };
  
  this.offers.push({
    ...slot,
    offeredAt: new Date(),
    response: 'pending'
  });
  
  return this.save();
};

waitListSchema.methods.acceptOffer = function(reservationId) {
  this.status = 'accepted';
  this.convertedToReservation = reservationId;
  this.convertedAt = new Date();
  
  // Update the latest offer
  if (this.offers.length > 0) {
    this.offers[this.offers.length - 1].response = 'accepted';
    this.offers[this.offers.length - 1].respondedAt = new Date();
  }
  
  return this.save();
};

waitListSchema.methods.declineOffer = function(reason) {
  this.status = 'active';
  this.currentOffer = undefined;
  
  // Update the latest offer
  if (this.offers.length > 0) {
    this.offers[this.offers.length - 1].response = 'declined';
    this.offers[this.offers.length - 1].respondedAt = new Date();
    this.offers[this.offers.length - 1].declineReason = reason;
  }
  
  return this.save();
};

waitListSchema.methods.updatePosition = function() {
  // Recalculate position based on priority and add date
  return this.constructor.countDocuments({
    stylist: this.stylist,
    status: 'active',
    $or: [
      { priority: { $gt: this.priority } },
      { 
        priority: this.priority, 
        addedAt: { $lt: this.addedAt } 
      }
    ]
  }).then(count => {
    this.position = count;
    return this.save();
  });
};

// Pre-save middleware
waitListSchema.pre('save', function(next) {
  // Update position if priority changes
  if (this.isModified('priority') && !this.isNew) {
    this.updatePosition().then(() => next()).catch(next);
  } else {
    next();
  }
});

// Auto-expiry job (would be called by cron)
waitListSchema.statics.cleanupExpiredEntries = async function() {
  // Expire old offers
  await this.expireOldOffers();
  
  // Expire old entries
  await this.expireOldEntries();
  
  // Log cleanup results
  const expiredCount = await this.countDocuments({ status: 'expired' });
  console.log(`Waitlist cleanup: ${expiredCount} expired entries`);
  
  return expiredCount;
};

module.exports = mongoose.model('WaitList', waitListSchema); 