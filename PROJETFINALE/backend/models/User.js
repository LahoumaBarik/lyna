const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: false,
    index: true
  },
  role: {
    type: String,
    enum: ['admin', 'client', 'stylist', 'receptionist'],
    required: true,
    default: 'client'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'pending', 'deleted'],
    default: 'active'
  },
  
  // Enhanced Authentication
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  passwordResetToken: String,
  passwordResetExpires: Date,
  passwordChangedAt: Date,
  
  // Two-Factor Authentication
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  twoFactorBackupCodes: [String],
  
  // Permissions (for fine-grained access control)
  permissions: [{
    type: String,
    enum: [
      'view_all_reservations',
      'edit_all_reservations',
      'manage_services',
      'manage_stylists',
      'view_analytics',
      'manage_payments',
      'send_notifications',
      'manage_settings'
    ]
  }],
  
  // Profile Information
  avatar: {
    url: String,
    publicId: String // for Cloudinary
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'US'
    }
  },
  
  // Enhanced stylist information
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
      enum: ['Senior / Master', 'Styliste / Expert', 'Nouveau Talent', 'Académie'],
    },
    expertise: String,
    inspiration: String,
    expertTip: String,
    favoriteProducts: [String],
    portfolio: [{
      url: String,
      publicId: String,
      caption: String,
      category: String
    }],
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
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Client preferences
  clientInfo: {
    allergies: [String],
    skinType: {
      type: String,
      enum: ['normal', 'dry', 'oily', 'sensitive', 'combination']
    },
    hairType: {
      type: String,
      enum: ['straight', 'wavy', 'curly', 'coily']
    },
    preferredStylists: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    notes: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  },
  
  // Notification preferences
  notifications: {
    email: {
      appointments: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
      newsletters: { type: Boolean, default: false }
    },
    sms: {
      appointments: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
      reminders: { type: Boolean, default: true }
    },
    push: {
      appointments: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
      reminders: { type: Boolean, default: true }
    }
  },
  
  // Privacy settings
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'clients_only', 'private'],
      default: 'public'
    },
    showInDirectory: {
      type: Boolean,
      default: true
    },
    allowReviews: {
      type: Boolean,
      default: true
    }
  },
  
  // System tracking
  lastLoginAt: Date,
  lastActiveAt: Date,
  loginAttempts: {
    count: { type: Number, default: 0 },
    lastAttempt: Date,
    lockedUntil: Date
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ email: 1, status: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ 'stylistInfo.specializations': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for stylist rating display
userSchema.virtual('stylistInfo.ratingDisplay').get(function() {
  if (!this.stylistInfo?.rating || this.stylistInfo.rating.count === 0) return 'No ratings yet';
  const average = this.stylistInfo.rating.average;
  if (typeof average !== 'number' || isNaN(average)) return 'No ratings yet';
  return `${average.toFixed(1)} (${this.stylistInfo.rating.count} reviews)`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's been modified
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    
    // Set password changed timestamp
    if (!this.isNew) {
      this.passwordChangedAt = new Date();
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isPasswordChanged = function(jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

userSchema.methods.incrementLoginAttempts = function() {
  // If we have a previous attempt and it's been more than 2 hours, reset attempts
  if (this.loginAttempts.lastAttempt && Date.now() - this.loginAttempts.lastAttempt > 2 * 60 * 60 * 1000) {
    this.loginAttempts.count = 0;
  }
  
  this.loginAttempts.count += 1;
  this.loginAttempts.lastAttempt = new Date();
  
  // Lock account if too many attempts
  if (this.loginAttempts.count >= 5) {
    this.loginAttempts.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }
  
  return this.save();
};

userSchema.methods.resetLoginAttempts = function() {
  this.loginAttempts = {
    count: 0,
    lastAttempt: undefined,
    lockedUntil: undefined
  };
  return this.save();
};

userSchema.methods.isLocked = function() {
  return !!(this.loginAttempts?.lockedUntil && this.loginAttempts.lockedUntil > Date.now());
};

// Static methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase(), status: { $ne: 'deleted' } });
};

userSchema.statics.findStylists = function(filters = {}) {
  const query = { role: 'stylist', status: 'active', ...filters };
  return this.find(query).select('-password -twoFactorSecret');
};

// Soft delete
userSchema.methods.softDelete = function() {
  this.status = 'deleted';
  this.deletedAt = new Date();
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User; 