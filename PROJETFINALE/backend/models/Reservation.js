const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  // Basic reservation info
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
  services: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    duration: {
      type: Number,
      required: true
    }
  }],
  
  // Date and time
  date: {
    type: Date,
    required: true,
    index: true
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  timezone: {
    type: String,
    default: process.env.TIMEZONE || 'America/New_York'
  },
  
  // Booking details
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending',
    index: true
  },
  bookingType: {
    type: String,
    enum: ['one_time', 'recurring'],
    default: 'one_time'
  },
  
  // Recurring booking details
  recurringInfo: {
    pattern: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'custom']
    },
    frequency: Number, // every X weeks/months
    endDate: Date,
    parentReservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation'
    },
    isParent: {
      type: Boolean,
      default: false
    }
  },
  
  // Pricing
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    tax: {
      type: Number,
      default: 0
    },
    tip: {
      type: Number,
      default: 0
    },
    discount: {
      amount: { type: Number, default: 0 },
      code: String,
      reason: String
    },
    total: {
      type: Number,
      required: true
    }
  },
  
  // Payment information
  payment: {
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded', 'failed'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['cash', 'card', 'paypal', 'stripe', 'apple_pay', 'google_pay']
    },
    transactionId: String,
    paypalOrderId: String,
    stripePaymentIntentId: String,
    refundId: String,
    refundAmount: Number,
    refundReason: String,
    refundDate: Date
  },
  
  // Client information
  clientInfo: {
    isFirstTime: {
      type: Boolean,
      default: false
    },
    allergies: [String],
    specialRequests: String,
    arrivalTime: Date,
    checkoutTime: Date
  },
  
  // Communication
  notifications: {
    confirmationSent: { type: Boolean, default: false },
    reminderSent: { type: Boolean, default: false },
    followUpSent: { type: Boolean, default: false }
  },
  
  // Notes and communication
  notes: {
    client: String,
    stylist: String,
    internal: String
  },
  
  // Cancellation details
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    reason: String,
    withinPolicy: Boolean,
    refundEligible: Boolean
  },
  
  // Review and rating
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    reviewDate: Date,
    recommended: Boolean,
    stylistResponse: String,
    stylistResponseDate: Date
  },
  
  // Waitlist information
  waitlist: {
    isWaitlisted: {
      type: Boolean,
      default: false
    },
    position: Number,
    addedToWaitlistAt: Date,
    notifiedAt: Date
  },
  
  // Tracking and analytics
  source: {
    type: String,
    enum: ['web', 'mobile', 'phone', 'walk_in', 'referral'],
    default: 'web'
  },
  referralCode: String,
  
  // Audit trail
  auditTrail: [{
    action: {
      type: String,
      enum: ['created', 'confirmed', 'modified', 'cancelled', 'completed', 'reviewed']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: mongoose.Schema.Types.Mixed
  }],
  
  // Legacy audit trail (keeping for backwards compatibility)
  history: [{
    action: {
      type: String,
      enum: ['created', 'confirmed', 'modified', 'cancelled', 'completed', 'reviewed']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    oldValues: mongoose.Schema.Types.Mixed,
    newValues: mongoose.Schema.Types.Mixed
  }],
  
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
reservationSchema.index({ date: 1, stylist: 1 });
reservationSchema.index({ client: 1, date: -1 });
reservationSchema.index({ status: 1, date: 1 });
reservationSchema.index({ 'payment.status': 1 });
reservationSchema.index({ 'recurringInfo.parentReservation': 1 });
reservationSchema.index({ createdAt: -1 });
reservationSchema.index({ 
  stylist: 1, 
  date: 1, 
  startTime: 1, 
  endTime: 1, 
  status: 1 
}, { 
  name: 'conflict_check_index' 
});

// Virtual for duration in minutes
reservationSchema.virtual('durationMinutes').get(function() {
  return this.services.reduce((total, service) => total + service.duration, 0);
});

// Virtual for total service price
reservationSchema.virtual('serviceTotal').get(function() {
  return this.services.reduce((total, service) => total + service.price, 0);
});

// Virtual for formatted date/time
reservationSchema.virtual('formattedDateTime').get(function() {
  const date = this.date.toLocaleDateString();
  return `${date} at ${this.startTime}`;
});

// Virtual for booking window
reservationSchema.virtual('timeSlot').get(function() {
  return `${this.startTime} - ${this.endTime}`;
});

// Pre-save middleware
reservationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate total if not set
  if (!this.pricing.total) {
    this.pricing.total = this.pricing.subtotal + this.pricing.tax + this.pricing.tip - this.pricing.discount.amount;
  }
  
  next();
});

// Methods
reservationSchema.methods.addToHistory = function(action, performedBy, details, oldValues, newValues) {
  this.history.push({
    action,
    performedBy,
    details,
    oldValues,
    newValues,
    timestamp: new Date()
  });
};

reservationSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const appointmentTime = new Date(this.date);
  appointmentTime.setHours(parseInt(this.startTime.split(':')[0]));
  appointmentTime.setMinutes(parseInt(this.startTime.split(':')[1]));
  
  // 24 hours cancellation policy
  const hoursDifference = (appointmentTime - now) / (1000 * 60 * 60);
  return hoursDifference >= 24 && ['pending', 'confirmed'].includes(this.status);
};

reservationSchema.methods.cancel = function(cancelledBy, reason) {
  this.status = 'cancelled';
  this.cancellation = {
    cancelledBy,
    cancelledAt: new Date(),
    reason,
    withinPolicy: this.canBeCancelled(),
    refundEligible: this.canBeCancelled() && this.payment.status === 'paid'
  };
  
  this.addToHistory('cancelled', cancelledBy, `Cancelled: ${reason}`);
  return this.save();
};

reservationSchema.methods.complete = function() {
  this.status = 'completed';
  this.clientInfo.checkoutTime = new Date();
  this.addToHistory('completed', null, 'Appointment completed');
  return this.save();
};

reservationSchema.methods.addReview = function(rating, comment, recommended = true) {
  this.review = {
    rating,
    comment,
    recommended,
    reviewDate: new Date()
  };
  
  this.addToHistory('reviewed', this.client, `Client left ${rating}-star review`);
  return this.save();
};

// Static methods
reservationSchema.statics.findConflicts = function(stylistId, date, startTime, endTime, excludeId) {
  const query = {
    stylist: stylistId,
    date: date,
    status: { $in: ['pending', 'confirmed', 'in_progress'] },
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.find(query);
};

reservationSchema.statics.getUpcomingForClient = function(clientId, limit = 10) {
  return this.find({
    client: clientId,
    date: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed'] }
  })
  .populate('stylist', 'firstName lastName')
  .populate('services.service', 'name')
  .sort({ date: 1, startTime: 1 })
  .limit(limit);
};

reservationSchema.statics.getUpcomingForStylist = function(stylistId, limit = 20) {
  return this.find({
    stylist: stylistId,
    date: { $gte: new Date() },
    status: { $in: ['pending', 'confirmed'] }
  })
  .populate('client', 'firstName lastName phone')
  .populate('services.service', 'name')
  .sort({ date: 1, startTime: 1 })
  .limit(limit);
};

reservationSchema.statics.getDailyRevenue = function(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return this.aggregate([
    {
      $match: {
        date: { $gte: startOfDay, $lte: endOfDay },
        status: 'completed',
        'payment.status': 'paid'
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$pricing.total' },
        totalAppointments: { $sum: 1 },
        averageTicket: { $avg: '$pricing.total' }
      }
    }
  ]);
};

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation; 