const mongoose = require('mongoose');

const stylistApplicationSchema = new mongoose.Schema({
  // Applicant information
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Application status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'interview_requested'],
    default: 'pending'
  },
  
  // Application details (reusing stylist form structure)
  stylistInfo: {
    businessName: String,
    license: {
      number: String,
      expiryDate: Date,
      issuingState: String
    },
    specializations: [{
      type: String,
      enum: ['cutting', 'coloring', 'styling', 'extensions', 'treatments', 'bridal', 'mens', 'kids']
    }],
    certifications: [{
      name: String,
      issuedBy: String,
      issuedDate: Date,
      expiryDate: Date
    }],
    experience: {
      years: Number,
      description: String
    },
    description: String,
    level: {
      type: String,
      enum: ['Senior / Master', 'Styliste / Expert', 'Nouveau Talent', 'Académie']
    },
    expertise: String,
    inspiration: String,
    expertTip: String,
    favoriteProducts: [String],
    socialMedia: {
      instagram: String,
      facebook: String,
      tiktok: String,
      website: String
    },
    workingHours: {
      monday: { start: String, end: String, isWorking: Boolean },
      tuesday: { start: String, end: String, isWorking: Boolean },
      wednesday: { start: String, end: String, isWorking: Boolean },
      thursday: { start: String, end: String, isWorking: Boolean },
      friday: { start: String, end: String, isWorking: Boolean },
      saturday: { start: String, end: String, isWorking: Boolean },
      sunday: { start: String, end: String, isWorking: Boolean }
    },
    commission: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    }
  },
  
  // Additional application fields
  motivation: {
    type: String,
    required: true,
    minlength: 50,
    maxlength: 1000
  },
  
  availability: {
    immediate: {
      type: Boolean,
      default: false
    },
    startDate: Date,
    preferredSchedule: {
      type: String,
      enum: ['full_time', 'part_time', 'flexible', 'weekends_only']
    }
  },
  
  // Admin review information
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String,
  
  // Interview information
  interview: {
    requestedAt: Date,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    scheduledAt: Date,
    location: String,
    notes: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    feedback: String
  },
  
  // Communication history
  communications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'system']
    },
    subject: String,
    message: String,
    sentAt: {
      type: Date,
      default: Date.now
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed'],
      default: 'sent'
    }
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
  timestamps: true
});

// Indexes for performance
stylistApplicationSchema.index({ applicant: 1, status: 1 });
stylistApplicationSchema.index({ status: 1, createdAt: -1 });
stylistApplicationSchema.index({ reviewedBy: 1 });

// Virtual for application age
stylistApplicationSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update updatedAt
stylistApplicationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
stylistApplicationSchema.statics.findByStatus = function(status) {
  return this.find({ status }).populate('applicant', 'firstName lastName email phone');
};

stylistApplicationSchema.statics.findPending = function() {
  return this.find({ status: 'pending' }).populate('applicant', 'firstName lastName email phone');
};

stylistApplicationSchema.statics.findByApplicant = function(applicantId) {
  return this.findOne({ applicant: applicantId }).populate('applicant');
};

module.exports = mongoose.model('StylistApplication', stylistApplicationSchema); 