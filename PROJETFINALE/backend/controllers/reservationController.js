const { Reservation, Service, Disponibilite, User, Analytics, WaitList, Notification } = require('../models');
const { sendNotification } = require('../utils/notifications');
const { sendNotificationToUser, sendToRole, sendToStylist, sendToUser } = require('../utils/socketIO');
const moment = require('moment-timezone');
const { validateReservationSlot, calculatePricing } = require('../utils/reservationHelpers');

// Enhanced reservation creation with comprehensive features
exports.creerReservation = async (req, res) => {
  try {
    // Handle both old frontend format and new enhanced format
    let { 
      services, 
      stylistId, 
      date, 
      startTime, 
      clientInfo,
      recurringInfo,
      source = 'web',
      referralCode,
      // Legacy format support
      serviceIds,
      coiffeuseId,
      montant
    } = req.body;

    // Convert legacy format to new format
    if (serviceIds && coiffeuseId && !services && !stylistId) {
      stylistId = coiffeuseId;
      
      // Convert serviceIds to services array
      services = [];
      for (const serviceId of serviceIds) {
        const service = await Service.findById(serviceId);
        if (service) {
          services.push({
            serviceId: service._id,
            addOns: []
          });
        }
      }
      
      // If no startTime provided, default to current time + 1 hour
      if (!startTime) {
        const futureTime = new Date(Date.now() + 60 * 60 * 1000);
        startTime = futureTime.toTimeString().slice(0, 5); // HH:mm format
      }
    }

    // Validate required fields
    if (!services || !Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ 
        error: 'Services are required',
        code: 'MISSING_SERVICES'
      });
    }

    if (!stylistId || !date || !startTime) {
      return res.status(400).json({ 
        error: 'Stylist, date and start time are required',
        code: 'MISSING_REQUIRED_FIELDS'
      });
    }

    // Validate stylist exists and is active
    const stylist = await User.findOne({ 
      _id: stylistId, 
      role: 'stylist', 
      status: 'active' 
    }).populate('stylistInfo');

    if (!stylist) {
      return res.status(404).json({ 
        error: 'Stylist not found or inactive',
        code: 'STYLIST_NOT_FOUND'
      });
    }

    // Validate services and calculate total duration/pricing
    const serviceDetails = [];
    let totalDuration = 0;
    let subtotal = 0;

    for (const serviceReq of services) {
      const service = await Service.findById(serviceReq.serviceId);
      if (!service) {
        return res.status(404).json({ 
          error: `Service ${serviceReq.serviceId} not found`,
          code: 'SERVICE_NOT_FOUND'
        });
      }

      const pricing = calculatePricing(service, stylist.stylistInfo?.level, date, startTime);
      const duration = service.duration.base + (serviceReq.addOns?.reduce((acc, addon) => acc + addon.duration, 0) || 0);

      serviceDetails.push({
        service: service._id,
        price: pricing.price,
        duration: duration,
        addOns: serviceReq.addOns || []
      });

      totalDuration += duration;
      subtotal += pricing.price;
    }

    // Calculate end time
    const startMoment = moment.tz(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm', process.env.TIMEZONE || 'America/New_York');
    const endMoment = startMoment.clone().add(totalDuration, 'minutes');
    const endTime = endMoment.format('HH:mm');

    // Validate time slot availability
    const slotValidation = await validateReservationSlot(stylistId, date, startTime, endTime);
    if (!slotValidation.isAvailable) {
      return res.status(409).json({
        error: 'Time slot not available',
        code: 'SLOT_UNAVAILABLE',
        message: slotValidation.reason
      });
    }

    // Calculate pricing with taxes and discounts
    const tax = subtotal * (process.env.TAX_RATE || 0.08);
    let discount = 0;

    // Apply referral discount if applicable
    if (referralCode) {
      // Implement referral code logic
      discount = subtotal * 0.1; // 10% referral discount
    }

    const total = subtotal + tax - discount;

    // Create reservation
    const reservation = new Reservation({
      client: req.user._id,
      stylist: stylistId,
      services: serviceDetails,
      date: startMoment.toDate(),
      startTime,
      endTime,
      timezone: process.env.TIMEZONE || 'America/New_York',
      
      pricing: {
        subtotal,
        tax,
        discount: { amount: discount, code: referralCode },
        total
      },
      
      clientInfo: {
        isFirstTime: !await Reservation.exists({ client: req.user._id }),
        allergies: clientInfo?.allergies || [],
        specialRequests: clientInfo?.specialRequests || ''
      },
      
      recurringInfo: recurringInfo || undefined,
      source,
      referralCode,
      
      // Audit trail
      createdBy: req.user._id,
      createdAt: new Date(),
      auditTrail: [{
        action: 'created',
        performedBy: req.user._id,
        timestamp: new Date(),
        details: { source, userAgent: req.get('User-Agent') }
      }]
    });

    await reservation.save();

    // Populate for response
    await reservation.populate([
      { path: 'client', select: 'firstName lastName email phone' },
      { path: 'stylist', select: 'firstName lastName stylistInfo' },
      { path: 'services.service', select: 'name description duration' }
    ]);

    // Send notifications - SMS and Email
    try {
      await sendNotification({
        type: 'reservation_created',
        recipient: req.user._id,
        title: 'Reservation Confirmed',
        message: `Your reservation has been confirmed for ${moment(date).format('MMMM Do, YYYY')} at ${startTime}.`,
        channels: ['email', 'sms']
      });
      console.log('✅ Notifications sent successfully');
    } catch (notificationError) {
      console.log('⚠️ Notification failed:', notificationError.message);
    }

    // Emit real-time updates to involved users and admins
    try {
      const eventPayload = { action: 'created', reservation };
      sendNotificationToUser(req.user._id.toString(), { type: 'reservation', title: 'Reservation created', data: { id: reservation._id } });
      sendToUser(req.user._id.toString(), 'reservations_changed', eventPayload);
      sendToStylist(stylistId.toString(), 'reservations_changed', eventPayload);
      sendToRole('admin', 'reservations_changed', eventPayload);
    } catch (e) {}

    // Update analytics
    await Analytics.findOneAndUpdate(
      { date: moment(date).format('YYYY-MM-DD') },
      {
        $inc: {
          'reservations.total': 1,
          'reservations.confirmed': 1,
          'revenue.total': total,
          [`stylists.${stylistId}.bookings`]: 1,
          [`stylists.${stylistId}.revenue`]: total
        }
      },
      { upsert: true }
    );

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation,
      analytics: {
        duration: totalDuration,
        pricing: { subtotal, tax, discount, total }
      }
    });

  } catch (error) {
    console.error('Reservation creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'RESERVATION_CREATE_ERROR',
      message: 'Unable to create reservation. Please try again.'
    });
  }
};

// Enhanced reservation listing with advanced filtering and pagination
exports.listerReservations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      stylistId,
      serviceId,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    // Build filter based on user role
    let filter = {};
    
    if (req.user.role === 'client') {
      filter.client = req.user._id;
    } else if (req.user.role === 'stylist') {
      filter.stylist = req.user._id;
    } else if (req.user.role === 'admin') {
      // Admin can filter by stylist
      if (stylistId) filter.stylist = stylistId;
    }

    // Additional filters
    if (status) filter.status = status;
    if (serviceId) filter['services.service'] = serviceId;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with aggregation for better performance
    const pipeline = [
      { $match: filter },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: 'client',
          foreignField: '_id',
          as: 'clientInfo',
          pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1, phone: 1, avatar: 1 } }]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'stylist',
          foreignField: '_id',
          as: 'stylistInfo',
          pipeline: [{ 
            $project: { 
              firstName: 1, 
              lastName: 1, 
              'stylistInfo.level': 1,
              'stylistInfo.rating': 1,
              avatar: 1
            } 
          }]
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: 'services.service',
          foreignField: '_id',
          as: 'serviceDetails'
        }
      },
      {
        $addFields: {
          client: { $arrayElemAt: ['$clientInfo', 0] },
          stylist: { $arrayElemAt: ['$stylistInfo', 0] },
          // Backward compatibility fields
          heureDebut: '$startTime',
          heureFin: '$endTime',
          service: { $arrayElemAt: ['$serviceDetails', 0] }
        }
      },
      {
        $project: {
          clientInfo: 0,
          stylistInfo: 0
        }
      }
    ];

    const reservations = await Reservation.aggregate(pipeline);
    const total = await Reservation.countDocuments(filter);

    // Calculate analytics for the current filter
    const analytics = await Reservation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$pricing.total' },
          averageBookingValue: { $avg: '$pricing.total' },
          totalBookings: { $sum: 1 },
          statusBreakdown: {
            $push: '$status'
          }
        }
      }
    ]);

    // For backward compatibility, return simple array if no pagination requested
    if (!req.query.page && !req.query.limit) {
      return res.json(reservations);
    }

    res.json({
      reservations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      analytics: analytics[0] || {
        totalRevenue: 0,
        averageBookingValue: 0,
        totalBookings: 0,
        statusBreakdown: []
      }
    });

  } catch (error) {
    console.error('Reservation listing error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'RESERVATION_LIST_ERROR'
    });
  }
};

// Enhanced reservation cancellation with proper refund handling
exports.supprimerReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, refundRequested = false } = req.body;

    const reservation = await Reservation.findById(id)
      .populate('client', 'firstName lastName email')
      .populate('stylist', 'firstName lastName email');

    if (!reservation) {
      return res.status(404).json({ 
        error: 'Reservation not found',
        code: 'RESERVATION_NOT_FOUND'
      });
    }

    // Check permissions
    const canCancel = 
      req.user.role === 'admin' ||
      (req.user.role === 'client' && reservation.client._id.toString() === req.user._id.toString()) ||
      (req.user.role === 'stylist' && reservation.stylist._id.toString() === req.user._id.toString());

    if (!canCancel) {
      return res.status(403).json({ 
        error: 'Not authorized to cancel this reservation',
        code: 'UNAUTHORIZED_CANCELLATION'
      });
    }

    // Check cancellation policy
    const now = moment();
    const reservationTime = moment(`${reservation.date} ${reservation.startTime}`);
    const hoursUntilReservation = reservationTime.diff(now, 'hours');
    
    const cancellationPolicy = {
      withinPolicy: hoursUntilReservation >= 24,
      refundEligible: hoursUntilReservation >= 24 && reservation.payment.status === 'paid'
    };

    // Update reservation status
    reservation.status = 'cancelled';
    reservation.cancellation = {
      cancelledBy: req.user._id,
      cancelledAt: new Date(),
      reason: reason || 'No reason provided',
      withinPolicy: cancellationPolicy.withinPolicy,
      refundEligible: cancellationPolicy.refundEligible
    };

    // Ensure auditTrail is initialized
    if (!reservation.auditTrail) {
      reservation.auditTrail = [];
    }

    // Add to audit trail
    reservation.auditTrail.push({
      action: 'cancelled',
      performedBy: req.user._id,
      timestamp: new Date(),
      details: { reason, hoursUntilReservation }
    });

    await reservation.save();

    // Handle refund if eligible and requested
    if (cancellationPolicy.refundEligible && refundRequested) {
      // Implement refund logic based on payment method
      // This would integrate with PayPal/Stripe refund APIs
    }

    // Send cancellation notifications
    try {
      // Send notification to client
      await sendNotification({
        recipient: reservation.client._id.toString(),
        title: 'Reservation Cancelled',
        message: `Your reservation on ${moment(reservation.date).format('MMMM Do, YYYY')} at ${reservation.startTime} has been cancelled.`,
        type: 'reservation_cancelled',
        channels: ['email', 'push'],
        metadata: {
          reservationId: reservation._id,
          reason,
          refundEligible: cancellationPolicy.refundEligible,
          clientName: reservation.client.firstName + ' ' + reservation.client.lastName,
          stylistName: reservation.stylist.firstName + ' ' + reservation.stylist.lastName,
          date: moment(reservation.date).format('MMMM Do, YYYY'),
          time: reservation.startTime
        }
      });

      // Send notification to stylist
      await sendNotification({
        recipient: reservation.stylist._id.toString(),
        title: 'Reservation Cancelled',
        message: `Reservation with ${reservation.client.firstName} ${reservation.client.lastName} on ${moment(reservation.date).format('MMMM Do, YYYY')} at ${reservation.startTime} has been cancelled.`,
        type: 'reservation_cancelled',
        channels: ['email', 'push'],
        metadata: {
          reservationId: reservation._id,
          reason,
          refundEligible: cancellationPolicy.refundEligible,
          clientName: reservation.client.firstName + ' ' + reservation.client.lastName,
          stylistName: reservation.stylist.firstName + ' ' + reservation.stylist.lastName,
          date: moment(reservation.date).format('MMMM Do, YYYY'),
          time: reservation.startTime
        }
      });
    } catch (notificationError) {
      console.warn('Notification failed:', notificationError.message);
    }

    // Emit real-time updates
    try {
      const payload = { action: 'cancelled', reservationId: reservation._id };
      sendNotificationToUser(reservation.client._id.toString(), { type: 'reservation', title: 'Reservation cancelled', data: { id: reservation._id } });
      sendToUser(reservation.client._id.toString(), 'reservations_changed', payload);
      sendToStylist(reservation.stylist._id.toString(), 'reservations_changed', payload);
      sendToRole('admin', 'reservations_changed', payload);
    } catch (e) {}

    // Update analytics
    await Analytics.findOneAndUpdate(
      { date: moment(reservation.date).format('YYYY-MM-DD') },
      {
        $inc: {
          'reservations.cancelled': 1,
          'revenue.lost': reservation.pricing.total
        }
      }
    );

    res.json({
      message: 'Reservation cancelled successfully',
      cancellationPolicy,
      reservation: {
        id: reservation._id,
        status: reservation.status,
        cancellation: reservation.cancellation
      }
    });

  } catch (error) {
    console.error('Reservation cancellation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'RESERVATION_CANCEL_ERROR'
    });
  }
};

// Enhanced reservation modification with conflict detection
exports.modifierReservation = async (req, res) => {
  try {
    console.log('=== MODIFICATION REQUEST RECEIVED ===');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('User:', req.user?.firstName, req.user?.role);
    
    const { id } = req.params;
    const updates = req.body;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      console.log('Reservation not found:', id);
      return res.status(404).json({ 
        error: 'Reservation not found',
        code: 'RESERVATION_NOT_FOUND'
      });
    }

    console.log('Found reservation:', {
      id: reservation._id,
      client: reservation.client,
      stylist: reservation.stylist,
      date: reservation.date,
      startTime: reservation.startTime
    });

    // Ensure auditTrail is initialized
    if (!reservation.auditTrail) {
      reservation.auditTrail = [];
    }

    // Check permissions
    const canModify = 
      req.user.role === 'admin' ||
      (req.user.role === 'client' && reservation.client.toString() === req.user._id.toString()) ||
      (req.user.role === 'stylist' && reservation.stylist.toString() === req.user._id.toString());

    if (!canModify) {
      return res.status(403).json({ 
        error: 'Not authorized to modify this reservation',
        code: 'UNAUTHORIZED_MODIFICATION'
      });
    }

    // Validate modification window (e.g., can't modify within 2 hours of appointment)
    const now = moment();
    const reservationDate = moment(reservation.date).format('YYYY-MM-DD');
    const reservationTime = moment(`${reservationDate} ${reservation.startTime}`, 'YYYY-MM-DD HH:mm');
    const hoursUntilReservation = reservationTime.diff(now, 'hours');
    
    if (hoursUntilReservation < 2) {
      return res.status(400).json({
        error: 'Cannot modify reservation within 2 hours of appointment time',
        code: 'MODIFICATION_WINDOW_EXPIRED'
      });
    }

    // If changing time/date, validate new slot
    if (updates.date || updates.startTime) {
      const newDate = updates.date || moment(reservation.date).format('YYYY-MM-DD');
      const newStartTime = updates.startTime || reservation.startTime;
      
      console.log('🔍 Backend time debugging:');
      console.log('Received startTime:', newStartTime);
      console.log('Received startTime type:', typeof newStartTime);
      console.log('Received date:', newDate);
      
      // Calculate duration from current services
      const totalDuration = reservation.services.reduce((acc, service) => acc + service.duration, 0);
      const newEndTime = moment(`${newDate} ${newStartTime}`, 'YYYY-MM-DD HH:mm')
        .add(totalDuration, 'minutes')
        .format('HH:mm');

      console.log('Validating new slot:', {
        stylist: reservation.stylist,
        newDate,
        newStartTime,
        newEndTime,
        excludeId: reservation._id
      });

      const slotValidation = await validateReservationSlot(
        reservation.stylist, 
        newDate, 
        newStartTime, 
        newEndTime,
        reservation._id // Exclude current reservation from conflict check
      );

      console.log('Slot validation result:', slotValidation);

      if (!slotValidation.isAvailable) {
        return res.status(409).json({
          error: 'New time slot not available',
          code: 'NEW_SLOT_UNAVAILABLE',
          message: slotValidation.reason
        });
      }
    }

    // Apply updates
    const allowedUpdates = ['date', 'startTime', 'notes', 'clientInfo'];
    const updateData = {};
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    });

    // Convert date string to Date object if updating date
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    // If startTime is being updated, recalculate endTime
    if (updateData.startTime) {
      const totalDuration = reservation.services.reduce((acc, service) => acc + service.duration, 0);
      
      // Ensure newDate is always a string in YYYY-MM-DD format
      let newDate;
      if (updateData.date) {
        // If updateData.date is a Date object, format it
        if (updateData.date instanceof Date) {
          newDate = moment(updateData.date).format('YYYY-MM-DD');
        } else {
          // If it's already a string, use it as is
          newDate = updateData.date;
        }
      } else {
        // Use the existing reservation date
        newDate = moment(reservation.date).format('YYYY-MM-DD');
      }
      
      console.log('🔍 Date debugging:');
      console.log('updateData.date:', updateData.date);
      console.log('updateData.date type:', typeof updateData.date);
      console.log('reservation.date:', reservation.date);
      console.log('newDate:', newDate);
      console.log('updateData.startTime:', updateData.startTime);
      console.log('totalDuration:', totalDuration);
      
      // Fix the endTime calculation
      const dateTimeString = `${newDate} ${updateData.startTime}`;
      console.log('dateTimeString for moment:', dateTimeString);
      
      const startMoment = moment(dateTimeString, 'YYYY-MM-DD HH:mm');
      console.log('startMoment.isValid():', startMoment.isValid());
      console.log('startMoment.format():', startMoment.format());
      
      const endMoment = startMoment.clone().add(totalDuration, 'minutes');
      const newEndTime = endMoment.format('HH:mm');
      
      updateData.endTime = newEndTime;
      console.log('Recalculated endTime:', { 
        startTime: updateData.startTime, 
        endTime: newEndTime, 
        duration: totalDuration,
        startMoment: startMoment.format(),
        endMoment: endMoment.format()
      });
    }

    console.log('Applying updates:', updateData);

    // Add to audit trail
    reservation.auditTrail.push({
      action: 'modified',
      performedBy: req.user._id,
      timestamp: new Date(),
      details: { changes: updateData }
    });

    Object.assign(reservation, updateData);
    await reservation.save();

    console.log('Reservation updated successfully');

    // Populate reservation for notifications and response
    await reservation.populate([
      { path: 'client', select: 'firstName lastName email' },
      { path: 'stylist', select: 'firstName lastName stylistInfo' },
      { path: 'services.service', select: 'name duration' }
    ]);

    // Send modification notifications
    try {
      // Send notification to client
      await sendNotification({
        recipient: reservation.client._id.toString(),
        title: 'Reservation Modified',
        message: `Your reservation has been updated. New date/time: ${moment(reservation.date).format('MMMM Do, YYYY')} at ${reservation.startTime}.`,
        type: 'reservation_modified',
        channels: ['email', 'push'],
        metadata: {
          reservationId: reservation._id,
          changes: updateData,
          clientName: reservation.client.firstName + ' ' + reservation.client.lastName,
          stylistName: reservation.stylist.firstName + ' ' + reservation.stylist.lastName,
          date: moment(reservation.date).format('MMMM Do, YYYY'),
          time: reservation.startTime
        }
      });

      // Send notification to stylist
      await sendNotification({
        recipient: reservation.stylist._id.toString(),
        title: 'Reservation Modified',
        message: `Reservation with ${reservation.client.firstName} ${reservation.client.lastName} has been updated. New date/time: ${moment(reservation.date).format('MMMM Do, YYYY')} at ${reservation.startTime}.`,
        type: 'reservation_modified',
        channels: ['email', 'push'],
        metadata: {
          reservationId: reservation._id,
          changes: updateData,
          clientName: reservation.client.firstName + ' ' + reservation.client.lastName,
          stylistName: reservation.stylist.firstName + ' ' + reservation.stylist.lastName,
          date: moment(reservation.date).format('MMMM Do, YYYY'),
          time: reservation.startTime
        }
      });
    } catch (notifyError) {
      console.warn('Notification failed:', notifyError.message);
    }

    // Real-time broadcast
    try {
      const eventPayload = { action: 'updated', reservation };
      sendNotificationToUser(reservation.client._id.toString(), { type: 'reservation', title: 'Reservation updated', data: { id: reservation._id } });
      sendToUser(reservation.client._id.toString(), 'reservations_changed', eventPayload);
      sendToStylist(reservation.stylist._id.toString(), 'reservations_changed', eventPayload);
      sendToRole('admin', 'reservations_changed', eventPayload);
    } catch (e) {}

    res.json({
      message: 'Reservation modified successfully',
      reservation
    });

  } catch (error) {
    console.error('Reservation modification error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'RESERVATION_MODIFY_ERROR',
      details: error.message
    });
  }
};

// Get detailed reservation analytics
exports.getReservationAnalytics = async (req, res) => {
  try {
    const { 
      startDate = moment().subtract(30, 'days').format('YYYY-MM-DD'),
      endDate = moment().format('YYYY-MM-DD'),
      groupBy = 'day' // day, week, month
    } = req.query;

    // Only admin and stylists can access analytics
    if (!['admin', 'stylist'].includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    let matchFilter = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    // If stylist, filter to their reservations only
    if (req.user.role === 'stylist') {
      matchFilter.stylist = req.user._id;
    }

    // Aggregation pipeline for comprehensive analytics
    const pipeline = [
      { $match: matchFilter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupBy === 'month' ? '%Y-%m' : groupBy === 'week' ? '%Y-%U' : '%Y-%m-%d',
              date: '$date'
            }
          },
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' },
          averageBookingValue: { $avg: '$pricing.total' },
          statusBreakdown: {
            $push: '$status'
          },
          clientTypes: {
            $sum: {
              $cond: ['$clientInfo.isFirstTime', 1, 0]
            }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ];

    const analytics = await Reservation.aggregate(pipeline);

    // Get top performing services
    const topServices = await Reservation.aggregate([
      { $match: matchFilter },
      { $unwind: '$services' },
      {
        $lookup: {
          from: 'services',
          localField: 'services.service',
          foreignField: '_id',
          as: 'serviceDetails'
        }
      },
      { $unwind: '$serviceDetails' },
      {
        $group: {
          _id: '$services.service',
          serviceName: { $first: '$serviceDetails.name' },
          bookingCount: { $sum: 1 },
          totalRevenue: { $sum: '$services.price' }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 10 }
    ]);

    // Calculate summary statistics
    const summary = analytics.reduce((acc, period) => {
      acc.totalRevenue += period.totalRevenue;
      acc.totalBookings += period.totalBookings;
      return acc;
    }, { totalRevenue: 0, totalBookings: 0 });

    summary.averageBookingValue = summary.totalBookings > 0 
      ? summary.totalRevenue / summary.totalBookings 
      : 0;

    res.json({
      summary,
      timeSeries: analytics,
      topServices,
      period: {
        startDate,
        endDate,
        groupBy
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'ANALYTICS_ERROR'
    });
  }
}; 