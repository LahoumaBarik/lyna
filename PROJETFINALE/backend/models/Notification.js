const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Target user
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Notification type and content
  type: {
    type: String,
    required: true,
    enum: [
      'appointment_confirmed',
      'appointment_reminder',
      'appointment_cancelled',
      'appointment_rescheduled',
      'payment_received',
      'payment_failed',
      'review_request',
      'review_received',
      'promotion',
      'system_update',
      'waitlist_available'
    ],
    index: true
  },
  
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  
  // Related data
  relatedReservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Delivery channels
  channels: {
    email: {
      enabled: { type: Boolean, default: true },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      error: String
    },
    sms: {
      enabled: { type: Boolean, default: false },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      error: String
    },
    push: {
      enabled: { type: Boolean, default: true },
      sent: { type: Boolean, default: false },
      sentAt: Date,
      delivered: { type: Boolean, default: false },
      deliveredAt: Date,
      error: String
    },
    inApp: {
      enabled: { type: Boolean, default: true },
      read: { type: Boolean, default: false },
      readAt: Date
    }
  },
  
  // Scheduling
  scheduledFor: Date,
  
  // Action buttons/links
  actions: [{
    label: String,
    url: String,
    type: {
      type: String,
      enum: ['primary', 'secondary', 'danger']
    }
  }],
  
  // Priority and urgency
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'cancelled'],
    default: 'pending'
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
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, 'channels.inApp.read': 1, createdAt: -1 });
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ scheduledFor: 1, status: 1 });

// Methods
notificationSchema.methods.markAsRead = function() {
  this.channels.inApp.read = true;
  this.channels.inApp.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markChannelAsSent = function(channel) {
  if (this.channels[channel]) {
    this.channels[channel].sent = true;
    this.channels[channel].sentAt = new Date();
  }
  return this.save();
};

// Static methods
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    'channels.inApp.enabled': true,
    'channels.inApp.read': false
  });
};

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification; 