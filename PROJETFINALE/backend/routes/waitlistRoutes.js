const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const { WaitList, Reservation, User, Service } = require('../models');
const { sendNotification } = require('../utils/notifications');
const { validateReservationSlot } = require('../utils/reservationHelpers');
const moment = require('moment-timezone');

const router = express.Router();

// POST /api/waitlist - Add client to waitlist
router.post('/', auth, async (req, res) => {
  try {
    const {
      stylistId,
      services, // Array of service objects with serviceId and addOns
      preferredDate,
      preferredTime,
      alternativePreferences = {},
      requirements = {},
      notificationPreferences = {},
      notes = ''
    } = req.body;

    // Validate required fields
    if (!stylistId || !services || !preferredDate || !preferredTime) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Stylist, services, preferred date and time are required'
      });
    }

    // Validate stylist exists
    const stylist = await User.findOne({ 
      _id: stylistId, 
      role: 'stylist', 
      status: 'active' 
    });

    if (!stylist) {
      return res.status(404).json({
        error: 'Stylist not found',
        message: 'The selected stylist is not available'
      });
    }

    // Validate services and calculate total duration and price
    let totalDuration = 0;
    let estimatedPrice = 0;
    const validatedServices = [];

    for (const serviceReq of services) {
      const service = await Service.findById(serviceReq.serviceId);
      if (!service) {
        return res.status(404).json({
          error: 'Service not found',
          message: `Service ${serviceReq.serviceId} not found`
        });
      }

      const serviceDuration = service.duration.base + 
        (serviceReq.addOns?.reduce((acc, addon) => acc + addon.duration, 0) || 0);
      const servicePrice = service.pricing.basePrice + 
        (serviceReq.addOns?.reduce((acc, addon) => acc + addon.price, 0) || 0);

      totalDuration += serviceDuration;
      estimatedPrice += servicePrice;

      validatedServices.push({
        service: service._id,
        addOns: serviceReq.addOns || []
      });
    }

    // Check if the preferred slot is actually unavailable
    const slotValidation = await validateReservationSlot(
      stylistId, 
      preferredDate, 
      preferredTime, 
      moment(`${preferredDate} ${preferredTime}`, 'YYYY-MM-DD HH:mm')
        .add(totalDuration, 'minutes')
        .format('HH:mm')
    );

    if (slotValidation.isAvailable) {
      return res.status(400).json({
        error: 'Slot is available',
        message: 'The requested time slot is available for booking',
        suggestion: 'Please book directly instead of joining the waitlist'
      });
    }

    // Check if client is already on waitlist for this stylist and time
    const existingWaitlist = await WaitList.findOne({
      client: req.user._id,
      stylist: stylistId,
      preferredDate: new Date(preferredDate),
      status: 'active'
    });

    if (existingWaitlist) {
      return res.status(409).json({
        error: 'Already on waitlist',
        message: 'You are already on the waitlist for this stylist',
        waitlistId: existingWaitlist._id
      });
    }

    // Calculate position in queue
    const queuePosition = await WaitList.countDocuments({
      stylist: stylistId,
      status: 'active',
      preferredDate: { $lte: new Date(preferredDate) }
    });

    // Create waitlist entry
    const waitlistEntry = new WaitList({
      client: req.user._id,
      stylist: stylistId,
      services: validatedServices,
      preferredDate: new Date(preferredDate),
      preferredTime,
      alternativePreferences,
      totalDuration,
      estimatedPrice,
      position: queuePosition,
      priority: req.user.role === 'vip' ? 'vip' : 'normal',
      requirements: {
        maxWaitTime: 14,
        ...requirements
      },
      notificationPreferences: {
        email: true,
        sms: true,
        push: true,
        immediateNotification: true,
        advanceNotice: 60,
        ...notificationPreferences
      },
      contactInfo: {
        phone: req.user.phone,
        email: req.user.email,
        preferredContactMethod: 'email'
      },
      notes
    });

    await waitlistEntry.save();

    // Populate for response
    await waitlistEntry.populate([
      { path: 'client', select: 'firstName lastName email phone' },
      { path: 'stylist', select: 'firstName lastName stylistInfo' },
      { path: 'services.service', select: 'name description duration pricing' }
    ]);

    // Send confirmation notification
    await sendNotification({
      type: 'waitlist_joined',
      recipients: [
        { userId: req.user._id, channel: ['email', 'push'] }
      ],
      data: {
        waitlistId: waitlistEntry._id,
        stylistName: stylist.firstName + ' ' + stylist.lastName,
        preferredDate: moment(preferredDate).format('MMMM Do, YYYY'),
        preferredTime,
        position: queuePosition + 1,
        estimatedPrice
      }
    });

    // Notify stylist about new waitlist entry
    await sendNotification({
      type: 'waitlist_new_entry',
      recipients: [
        { userId: stylistId, channel: ['email', 'push'] }
      ],
      data: {
        clientName: req.user.firstName + ' ' + req.user.lastName,
        preferredDate: moment(preferredDate).format('MMMM Do, YYYY'),
        preferredTime,
        services: validatedServices.length
      }
    });

    res.status(201).json({
      message: 'Successfully added to waitlist',
      waitlist: waitlistEntry,
      position: queuePosition + 1,
      estimatedWaitTime: `${Math.ceil(queuePosition / 2)} days` // Rough estimate
    });

  } catch (error) {
    console.error('Waitlist creation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to add to waitlist'
    });
  }
});

// GET /api/waitlist - Get user's waitlist entries
router.get('/', auth, async (req, res) => {
  try {
    const { status = 'active' } = req.query;

    let filter = { client: req.user._id };
    if (status !== 'all') {
      filter.status = status;
    }

    const waitlistEntries = await WaitList.find(filter)
      .populate('stylist', 'firstName lastName stylistInfo avatar')
      .populate('services.service', 'name description category pricing')
      .sort({ addedAt: -1 });

    // Calculate current position for active entries
    for (const entry of waitlistEntries) {
      if (entry.status === 'active') {
        const currentPosition = await WaitList.countDocuments({
          stylist: entry.stylist._id,
          status: 'active',
          $or: [
            { priority: { $gt: entry.priority } },
            { 
              priority: entry.priority,
              addedAt: { $lt: entry.addedAt }
            }
          ]
        });
        entry.position = currentPosition;
      }
    }

    res.json({
      waitlistEntries,
      summary: {
        total: waitlistEntries.length,
        active: waitlistEntries.filter(entry => entry.status === 'active').length,
        offered: waitlistEntries.filter(entry => entry.status === 'offered').length
      }
    });

  } catch (error) {
    console.error('Waitlist fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to fetch waitlist entries'
    });
  }
});

// PUT /api/waitlist/:id - Update waitlist entry
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const waitlistEntry = await WaitList.findById(id);
    if (!waitlistEntry) {
      return res.status(404).json({
        error: 'Waitlist entry not found'
      });
    }

    // Check ownership
    if (waitlistEntry.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Not authorized to update this waitlist entry'
      });
    }

    // Only allow certain fields to be updated
    const allowedUpdates = [
      'alternativePreferences',
      'requirements',
      'notificationPreferences',
      'notes',
      'priority' // Only if admin
    ];

    const updateData = {};
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'priority' && req.user.role !== 'admin') {
          return; // Skip priority update for non-admin users
        }
        updateData[field] = updates[field];
      }
    });

    Object.assign(waitlistEntry, updateData);
    await waitlistEntry.save();

    await waitlistEntry.populate([
      { path: 'stylist', select: 'firstName lastName' },
      { path: 'services.service', select: 'name' }
    ]);

    res.json({
      message: 'Waitlist entry updated successfully',
      waitlist: waitlistEntry
    });

  } catch (error) {
    console.error('Waitlist update error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to update waitlist entry'
    });
  }
});

// DELETE /api/waitlist/:id - Remove from waitlist
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'User request' } = req.body;

    const waitlistEntry = await WaitList.findById(id);
    if (!waitlistEntry) {
      return res.status(404).json({
        error: 'Waitlist entry not found'
      });
    }

    // Check ownership or admin access
    const canDelete = 
      waitlistEntry.client.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!canDelete) {
      return res.status(403).json({
        error: 'Not authorized to remove this waitlist entry'
      });
    }

    // Update status instead of deleting
    waitlistEntry.status = 'cancelled';
    waitlistEntry.cancelledAt = new Date();
    waitlistEntry.cancelledBy = req.user._id;
    waitlistEntry.cancellationReason = reason;

    await waitlistEntry.save();

    // Update positions for remaining entries
    await WaitList.updateMany(
      {
        stylist: waitlistEntry.stylist,
        status: 'active',
        position: { $gt: waitlistEntry.position }
      },
      {
        $inc: { position: -1 }
      }
    );

    res.json({
      message: 'Successfully removed from waitlist'
    });

  } catch (error) {
    console.error('Waitlist removal error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to remove from waitlist'
    });
  }
});

// POST /api/waitlist/:id/offer - Make offer to waitlist client (Admin/Stylist only)
router.post('/:id/offer', auth, async (req, res) => {
  try {
    // Only stylist or admin can make offers
    if (!['admin', 'stylist'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only stylists and admins can make offers'
      });
    }

    const { id } = req.params;
    const { date, startTime, endTime, stylistId } = req.body;

    const waitlistEntry = await WaitList.findById(id)
      .populate('client', 'firstName lastName email phone notificationPreferences')
      .populate('stylist', 'firstName lastName');

    if (!waitlistEntry) {
      return res.status(404).json({
        error: 'Waitlist entry not found'
      });
    }

    if (waitlistEntry.status !== 'active') {
      return res.status(400).json({
        error: 'Waitlist entry is not active',
        message: 'Can only make offers to active waitlist entries'
      });
    }

    // Validate the offered slot is available
    const slotValidation = await validateReservationSlot(
      stylistId || waitlistEntry.stylist._id,
      date,
      startTime,
      endTime
    );

    if (!slotValidation.isAvailable) {
      return res.status(409).json({
        error: 'Offered slot not available',
        message: slotValidation.reason
      });
    }

    // Make the offer
    const offer = {
      date: new Date(date),
      startTime,
      endTime,
      stylist: stylistId || waitlistEntry.stylist._id
    };

    await waitlistEntry.makeOffer(offer);

    // Send offer notification
    await sendNotification({
      type: 'waitlist_offer',
      recipients: [
        { userId: waitlistEntry.client._id, channel: ['email', 'sms', 'push'] }
      ],
      data: {
        waitlistId: waitlistEntry._id,
        clientName: waitlistEntry.client.firstName,
        stylistName: waitlistEntry.stylist.firstName + ' ' + waitlistEntry.stylist.lastName,
        offerDate: moment(date).format('MMMM Do, YYYY'),
        offerTime: startTime,
        expiresAt: waitlistEntry.currentOffer.expiresAt,
        acceptUrl: `${process.env.FRONTEND_URL}/waitlist/offer/${waitlistEntry._id}/accept`
      }
    });

    res.json({
      message: 'Offer sent successfully',
      offer: waitlistEntry.currentOffer,
      expiresAt: waitlistEntry.currentOffer.expiresAt
    });

  } catch (error) {
    console.error('Waitlist offer error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to make offer'
    });
  }
});

// POST /api/waitlist/:id/accept - Accept waitlist offer
router.post('/:id/accept', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const waitlistEntry = await WaitList.findById(id)
      .populate('client', 'firstName lastName email phone')
      .populate('stylist', 'firstName lastName')
      .populate('services.service');

    if (!waitlistEntry) {
      return res.status(404).json({
        error: 'Waitlist entry not found'
      });
    }

    // Check ownership
    if (waitlistEntry.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Not authorized to accept this offer'
      });
    }

    if (waitlistEntry.status !== 'offered') {
      return res.status(400).json({
        error: 'No active offer',
        message: 'There is no active offer for this waitlist entry'
      });
    }

    // Check if offer hasn't expired
    if (new Date() > waitlistEntry.currentOffer.expiresAt) {
      waitlistEntry.status = 'active';
      waitlistEntry.currentOffer = undefined;
      await waitlistEntry.save();

      return res.status(410).json({
        error: 'Offer expired',
        message: 'The offer has expired. You have been moved back to active waitlist.'
      });
    }

    // Create the reservation
    const reservation = new Reservation({
      client: waitlistEntry.client._id,
      stylist: waitlistEntry.currentOffer.offeredSlot.stylist,
      services: waitlistEntry.services,
      date: waitlistEntry.currentOffer.offeredSlot.date,
      startTime: waitlistEntry.currentOffer.offeredSlot.startTime,
      endTime: waitlistEntry.currentOffer.offeredSlot.endTime,
      pricing: {
        subtotal: waitlistEntry.estimatedPrice,
        tax: waitlistEntry.estimatedPrice * 0.08,
        total: waitlistEntry.estimatedPrice * 1.08
      },
      source: 'waitlist',
      clientInfo: {
        isFirstTime: false, // They've been here before if they're on waitlist
        notes: waitlistEntry.notes
      }
    });

    await reservation.save();

    // Update waitlist entry
    await waitlistEntry.acceptOffer(reservation._id);

    // Send confirmation notifications
    await sendNotification({
      type: 'waitlist_offer_accepted',
      recipients: [
        { userId: waitlistEntry.client._id, channel: ['email', 'push'] },
        { userId: waitlistEntry.stylist._id, channel: ['email', 'push'] }
      ],
      data: {
        reservationId: reservation._id,
        clientName: waitlistEntry.client.firstName + ' ' + waitlistEntry.client.lastName,
        stylistName: waitlistEntry.stylist.firstName + ' ' + waitlistEntry.stylist.lastName,
        date: moment(reservation.date).format('MMMM Do, YYYY'),
        time: reservation.startTime
      }
    });

    await reservation.populate([
      { path: 'client', select: 'firstName lastName email' },
      { path: 'stylist', select: 'firstName lastName' },
      { path: 'services.service', select: 'name duration' }
    ]);

    res.json({
      message: 'Offer accepted successfully',
      reservation,
      waitlistStatus: 'accepted'
    });

  } catch (error) {
    console.error('Waitlist accept error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to accept offer'
    });
  }
});

// POST /api/waitlist/:id/decline - Decline waitlist offer
router.post('/:id/decline', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'No reason provided' } = req.body;

    const waitlistEntry = await WaitList.findById(id);
    if (!waitlistEntry) {
      return res.status(404).json({
        error: 'Waitlist entry not found'
      });
    }

    // Check ownership
    if (waitlistEntry.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Not authorized to decline this offer'
      });
    }

    if (waitlistEntry.status !== 'offered') {
      return res.status(400).json({
        error: 'No active offer',
        message: 'There is no active offer to decline'
      });
    }

    await waitlistEntry.declineOffer(reason);

    res.json({
      message: 'Offer declined successfully',
      status: 'back_on_waitlist'
    });

  } catch (error) {
    console.error('Waitlist decline error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to decline offer'
    });
  }
});

// GET /api/waitlist/stylist/:stylistId - Get waitlist for specific stylist (Stylist/Admin only)
router.get('/stylist/:stylistId', auth, async (req, res) => {
  try {
    const { stylistId } = req.params;
    const { status = 'active', date } = req.query;

    // Check authorization
    if (req.user.role !== 'admin' && req.user._id.toString() !== stylistId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Can only view your own waitlist'
      });
    }

    let filter = { stylist: stylistId };
    if (status !== 'all') {
      filter.status = status;
    }
    if (date) {
      filter.preferredDate = { 
        $gte: new Date(date),
        $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
      };
    }

    const waitlistEntries = await WaitList.find(filter)
      .populate('client', 'firstName lastName email phone avatar')
      .populate('services.service', 'name category duration pricing')
      .sort({ priority: -1, position: 1, addedAt: 1 });

    // Get summary statistics
    const stats = await WaitList.aggregate([
      { $match: { stylist: stylistId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = stats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      waitlistEntries,
      summary: {
        total: waitlistEntries.length,
        ...summary
      }
    });

  } catch (error) {
    console.error('Stylist waitlist fetch error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to fetch stylist waitlist'
    });
  }
});

// POST /api/waitlist/auto-offer - Automatically offer available slots to waitlist
router.post('/auto-offer', auth, async (req, res) => {
  try {
    // Only admin can trigger auto-offers
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only admins can trigger auto-offers'
      });
    }

    const { date, startTime, endTime, stylistId } = req.body;

    // Find suitable waitlist entries
    const suitableEntries = await WaitList.findAvailableForSlot(
      new Date(date),
      startTime,
      endTime,
      stylistId
    );

    if (suitableEntries.length === 0) {
      return res.json({
        message: 'No suitable waitlist entries found',
        offers: 0
      });
    }

    // Make offer to the first suitable entry (highest priority)
    const waitlistEntry = suitableEntries[0];
    const offer = {
      date: new Date(date),
      startTime,
      endTime,
      stylist: stylistId
    };

    await waitlistEntry.makeOffer(offer);

    // Send notification
    await sendNotification({
      type: 'waitlist_offer',
      recipients: [
        { userId: waitlistEntry.client._id, channel: ['email', 'sms', 'push'] }
      ],
      data: {
        waitlistId: waitlistEntry._id,
        clientName: waitlistEntry.client.firstName,
        stylistName: waitlistEntry.stylist.firstName + ' ' + waitlistEntry.stylist.lastName,
        offerDate: moment(date).format('MMMM Do, YYYY'),
        offerTime: startTime,
        expiresAt: waitlistEntry.currentOffer.expiresAt
      }
    });

    res.json({
      message: 'Auto-offer sent successfully',
      clientName: waitlistEntry.client.firstName + ' ' + waitlistEntry.client.lastName,
      waitlistId: waitlistEntry._id,
      offers: 1
    });

  } catch (error) {
    console.error('Auto-offer error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to process auto-offer'
    });
  }
});

// Cleanup expired offers (cron job endpoint)
router.post('/cleanup', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    const cleanupResult = await WaitList.cleanupExpiredEntries();
    
    res.json({
      message: 'Cleanup completed successfully',
      expiredEntries: cleanupResult
    });

  } catch (error) {
    console.error('Waitlist cleanup error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to perform cleanup'
    });
  }
});

module.exports = router; 