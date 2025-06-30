const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  // Date for this analytics record
  date: {
    type: String, // YYYY-MM-DD format
    required: true,
    unique: true,
    index: true
  },
  
  // Reservation metrics
  reservations: {
    total: {
      type: Number,
      default: 0
    },
    confirmed: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    },
    cancelled: {
      type: Number,
      default: 0
    },
    noShow: {
      type: Number,
      default: 0
    },
    // New vs returning clients
    newClients: {
      type: Number,
      default: 0
    },
    returningClients: {
      type: Number,
      default: 0
    }
  },
  
  // Revenue metrics
  revenue: {
    total: {
      type: Number,
      default: 0
    },
    services: {
      type: Number,
      default: 0
    },
    tips: {
      type: Number,
      default: 0
    },
    taxes: {
      type: Number,
      default: 0
    },
    refunded: {
      type: Number,
      default: 0
    },
    lost: {
      type: Number,
      default: 0 // from cancellations
    }
  },
  
  // Service performance
  services: {
    // Service ID -> metrics
    type: Map,
    of: {
      bookings: {
        type: Number,
        default: 0
      },
      revenue: {
        type: Number,
        default: 0
      },
      averagePrice: {
        type: Number,
        default: 0
      },
      cancellationRate: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Stylist performance
  stylists: {
    // Stylist ID -> metrics
    type: Map,
    of: {
      bookings: {
        type: Number,
        default: 0
      },
      revenue: {
        type: Number,
        default: 0
      },
      averageRating: {
        type: Number,
        default: 0
      },
      hoursWorked: {
        type: Number,
        default: 0
      },
      utilizationRate: {
        type: Number,
        default: 0 // percentage of available time booked
      },
      cancellationRate: {
        type: Number,
        default: 0
      },
      noShowRate: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Client analytics
  clients: {
    totalActive: {
      type: Number,
      default: 0
    },
    newRegistrations: {
      type: Number,
      default: 0
    },
    averageLifetimeValue: {
      type: Number,
      default: 0
    },
    retentionRate: {
      type: Number,
      default: 0
    }
  },
  
  // Time-based analytics
  timeSlots: {
    // Hour -> booking count
    type: Map,
    of: Number,
    default: {}
  },
  
  // Marketing metrics
  marketing: {
    // Source -> conversion metrics
    webBookings: {
      type: Number,
      default: 0
    },
    mobileBookings: {
      type: Number,
      default: 0
    },
    phoneBookings: {
      type: Number,
      default: 0
    },
    walkInBookings: {
      type: Number,
      default: 0
    },
    referralBookings: {
      type: Number,
      default: 0
    },
    socialMediaBookings: {
      type: Number,
      default: 0
    }
  },
  
  // Operational metrics
  operations: {
    averageBookingValue: {
      type: Number,
      default: 0
    },
    averageServiceDuration: {
      type: Number,
      default: 0
    },
    capacityUtilization: {
      type: Number,
      default: 0 // percentage of total available capacity used
    },
    waitlistConversions: {
      type: Number,
      default: 0
    }
  },
  
  // Review and rating metrics
  reviews: {
    totalReviews: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    ratingDistribution: {
      oneStar: { type: Number, default: 0 },
      twoStar: { type: Number, default: 0 },
      threeStar: { type: Number, default: 0 },
      fourStar: { type: Number, default: 0 },
      fiveStar: { type: Number, default: 0 }
    }
  },
  
  // Goal tracking
  goals: {
    dailyRevenueTarget: {
      type: Number,
      default: 0
    },
    dailyBookingTarget: {
      type: Number,
      default: 0
    },
    revenueProgress: {
      type: Number,
      default: 0 // percentage of target achieved
    },
    bookingProgress: {
      type: Number,
      default: 0 // percentage of target achieved
    }
  },
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Calculated fields (updated via aggregation)
  trends: {
    revenueChange: {
      type: Number,
      default: 0 // percentage change from previous period
    },
    bookingChange: {
      type: Number,
      default: 0
    },
    clientGrowth: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
analyticsSchema.index({ date: 1 });
analyticsSchema.index({ 'reservations.total': -1 });
analyticsSchema.index({ 'revenue.total': -1 });
analyticsSchema.index({ lastUpdated: -1 });

// Static methods for common analytics queries
analyticsSchema.statics.getDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: 1 });
};

analyticsSchema.statics.getTopStylists = function(startDate, endDate, limit = 10) {
  return this.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $project: {
        stylistsArray: { $objectToArray: '$stylists' }
      }
    },
    { $unwind: '$stylistsArray' },
    {
      $group: {
        _id: '$stylistsArray.k',
        totalRevenue: { $sum: '$stylistsArray.v.revenue' },
        totalBookings: { $sum: '$stylistsArray.v.bookings' },
        averageRating: { $avg: '$stylistsArray.v.averageRating' }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: limit }
  ]);
};

analyticsSchema.statics.getTopServices = function(startDate, endDate, limit = 10) {
  return this.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $project: {
        servicesArray: { $objectToArray: '$services' }
      }
    },
    { $unwind: '$servicesArray' },
    {
      $group: {
        _id: '$servicesArray.k',
        totalRevenue: { $sum: '$servicesArray.v.revenue' },
        totalBookings: { $sum: '$servicesArray.v.bookings' },
        averagePrice: { $avg: '$servicesArray.v.averagePrice' }
      }
    },
    { $sort: { totalBookings: -1 } },
    { $limit: limit }
  ]);
};

analyticsSchema.statics.getRevenueByPeriod = function(startDate, endDate, groupBy = 'day') {
  const dateFormat = groupBy === 'month' ? '%Y-%m' : 
                    groupBy === 'week' ? '%Y-%U' : '%Y-%m-%d';
  
  return this.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          $dateFromString: {
            dateString: '$date',
            format: '%Y-%m-%d'
          }
        },
        totalRevenue: { $sum: '$revenue.total' },
        totalBookings: { $sum: '$reservations.total' },
        averageBookingValue: { $avg: '$operations.averageBookingValue' }
      }
    },
    {
      $project: {
        period: {
          $dateToString: {
            format: dateFormat,
            date: '$_id'
          }
        },
        totalRevenue: 1,
        totalBookings: 1,
        averageBookingValue: 1
      }
    },
    { $sort: { period: 1 } }
  ]);
};

// Instance methods
analyticsSchema.methods.updateStylistMetrics = function(stylistId, metrics) {
  if (!this.stylists) {
    this.stylists = new Map();
  }
  
  const currentMetrics = this.stylists.get(stylistId) || {
    bookings: 0,
    revenue: 0,
    averageRating: 0,
    hoursWorked: 0,
    utilizationRate: 0,
    cancellationRate: 0,
    noShowRate: 0
  };
  
  // Merge metrics
  Object.keys(metrics).forEach(key => {
    currentMetrics[key] = metrics[key];
  });
  
  this.stylists.set(stylistId, currentMetrics);
  this.lastUpdated = new Date();
};

analyticsSchema.methods.updateServiceMetrics = function(serviceId, metrics) {
  if (!this.services) {
    this.services = new Map();
  }
  
  const currentMetrics = this.services.get(serviceId) || {
    bookings: 0,
    revenue: 0,
    averagePrice: 0,
    cancellationRate: 0
  };
  
  // Merge metrics
  Object.keys(metrics).forEach(key => {
    currentMetrics[key] = metrics[key];
  });
  
  this.services.set(serviceId, currentMetrics);
  this.lastUpdated = new Date();
};

module.exports = mongoose.model('Analytics', analyticsSchema); 