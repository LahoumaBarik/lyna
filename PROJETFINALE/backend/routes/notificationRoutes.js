const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const { Notification } = require('../models');
const { sendNotification, sendBatchNotifications, sendSMSNotification } = require('../utils/notifications');

const router = express.Router();

// Get user's notifications
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const query = { recipient: req.user._id };
    if (unreadOnly === 'true') {
      query['channels.inApp.read'] = false;
    }
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('relatedUser', 'firstName lastName')
      .populate('relatedReservation', 'date startTime');
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(req.user._id);
    
    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      {
        'channels.inApp.read': true,
        'channels.inApp.readAt': new Date()
      },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all notifications as read
router.patch('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, 'channels.inApp.read': false },
      {
        'channels.inApp.read': true,
        'channels.inApp.readAt': new Date()
      }
    );
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Send notification to user(s)
router.post('/send', auth, requireRole('admin', 'receptionist'), async (req, res) => {
  try {
    const { userIds, type, templateData, channels } = req.body;
    
    if (userIds.length === 1) {
      const result = await sendNotification(userIds[0], type, templateData, channels);
      res.json({ success: true, result });
    } else {
      const results = await sendBatchNotifications(userIds, type, templateData, channels);
      res.json({ success: true, results });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all notifications
router.get('/admin/all', auth, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50, type, status } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('recipient', 'firstName lastName email')
      .populate('relatedUser', 'firstName lastName')
      .populate('relatedReservation', 'date startTime');
    
    const total = await Notification.countDocuments(query);
    
    res.json({
      notifications,
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

// Admin: Send test SMS
router.post('/admin/test-sms', auth, requireRole('admin'), async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ 
        error: 'Phone number and message are required' 
      });
    }

    const result = await sendSMSNotification(
      { phone: phoneNumber }, 
      message
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Test SMS sent successfully',
        phoneNumber
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        message: 'Failed to send test SMS'
      });
    }

  } catch (error) {
    console.error('Test SMS error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 