const moment = require('moment-timezone');
const { Reservation, User, Disponibilite } = require('../models');

/**
 * Validate if a reservation slot is available for a stylist
 * @param {string} stylistId - The stylist's ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} startTime - Start time in HH:mm format
 * @param {string} endTime - End time in HH:mm format
 * @param {string} excludeReservationId - Reservation ID to exclude from conflict check
 * @returns {Object} Validation result with isAvailable and reason
 */
const validateReservationSlot = async (stylistId, date, startTime, endTime, excludeReservationId = null) => {
  try {
    const timezone = process.env.TIMEZONE || 'America/New_York';
    
    console.log('🔍 Validating slot:', { stylistId, date, startTime, endTime, excludeReservationId });
    
    // Parse the requested date and times with proper timezone handling
    const requestedDate = moment.tz(date, 'YYYY-MM-DD', timezone);
    const requestedStart = moment.tz(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm', timezone);
    const requestedEnd = moment.tz(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm', timezone);
    
    console.log('📅 Parsed times:', {
      requestedDate: requestedDate.format(),
      requestedStart: requestedStart.format(),
      requestedEnd: requestedEnd.format()
    });
    
    // Check if the time is in the past
    if (requestedStart.isBefore(moment())) {
      return {
        isAvailable: false,
        reason: 'Cannot book appointments in the past'
      };
    }
    
    // Check if it's too far in the future (e.g., more than 90 days)
    const maxAdvanceBooking = process.env.MAX_ADVANCE_BOOKING_DAYS || 90;
    if (requestedStart.isAfter(moment().add(maxAdvanceBooking, 'days'))) {
      return {
        isAvailable: false,
        reason: `Cannot book more than ${maxAdvanceBooking} days in advance`
      };
    }
    
    // Check for existing reservations that would conflict (this is the most important check)
    const startOfDay = requestedDate.clone().startOf('day').toDate();
    const endOfDay = requestedDate.clone().endOf('day').toDate();
    
    const conflictQuery = {
      stylist: stylistId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      status: { $nin: ['cancelled', 'no_show'] },
      $or: [
        {
          // Existing reservation starts during the requested time
          $and: [
            { startTime: { $gte: startTime } },
            { startTime: { $lt: endTime } }
          ]
        },
        {
          // Existing reservation ends during the requested time
          $and: [
            { endTime: { $gt: startTime } },
            { endTime: { $lte: endTime } }
          ]
        },
        {
          // Existing reservation completely encompasses the requested time
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gte: endTime } }
          ]
        },
        {
          // Requested time completely encompasses existing reservation
          $and: [
            { startTime: { $gte: startTime } },
            { endTime: { $lte: endTime } }
          ]
        }
      ]
    };
    
    // Exclude current reservation from conflict check if modifying
    if (excludeReservationId) {
      conflictQuery._id = { $ne: excludeReservationId };
      console.log('🚫 Excluding reservation from conflict check:', excludeReservationId);
    }
    
    console.log('🔍 Checking for conflicting reservations with query:', JSON.stringify(conflictQuery, null, 2));
    
    const conflictingReservations = await Reservation.find(conflictQuery);
    
    console.log('⚠️ Found conflicting reservations:', conflictingReservations.length);
    
    if (conflictingReservations.length > 0) {
      const conflicts = conflictingReservations.map(r => ({
        id: r._id,
        startTime: r.startTime,
        endTime: r.endTime,
        status: r.status
      }));
      
      console.log('❌ Conflicts:', conflicts);
      
      return {
        isAvailable: false,
        reason: 'Time slot conflicts with existing reservation',
        conflictingReservations: conflicts
      };
    }
    
    // FOR TESTING: Skip Disponibilite check temporarily and just check basic business hours
    const requestedHour = parseInt(startTime.split(':')[0]);
    const requestedMinute = parseInt(startTime.split(':')[1]);
    const endHour = parseInt(endTime.split(':')[0]);
    const endMinute = parseInt(endTime.split(':')[1]);
    
    // Basic business hours check (8 AM to 8 PM)
    if (requestedHour < 8 || endHour > 20 || (endHour === 20 && endMinute > 0)) {
      return {
        isAvailable: false,
        reason: 'Requested time is outside business hours (8:00 AM - 8:00 PM)'
      };
    }
    
    // Load stylist's availability from Disponibilite collection for the specific date
    try {
      const disponibilites = await Disponibilite.find({
        stylist: stylistId,
        jour: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        isActive: true
      });
      
      console.log('📋 Found disponibilites:', disponibilites.length);
      
      if (disponibilites && disponibilites.length > 0) {
        // Check if the requested time falls within any disponibilite
        let withinAvailableTime = false;
        
        for (const dispo of disponibilites) {
          const availStart = moment.tz(`${date} ${dispo.heureDebut}`, 'YYYY-MM-DD HH:mm', timezone);
          const availEnd = moment.tz(`${date} ${dispo.heureFin}`, 'YYYY-MM-DD HH:mm', timezone);
          
          console.log('⏰ Checking availability:', {
            disponibilite: dispo._id,
            availStart: availStart.format(),
            availEnd: availEnd.format(),
            requestedStart: requestedStart.format(),
            requestedEnd: requestedEnd.format()
          });
          
          // Check if the requested time slot fits within this availability window
          if (requestedStart.isSameOrAfter(availStart) && requestedEnd.isSameOrBefore(availEnd)) {
            withinAvailableTime = true;
            console.log('✅ Time slot fits within availability window');
            break;
          }
        }
        
        if (!withinAvailableTime) {
          const availableTimes = disponibilites.map(d => `${d.heureDebut}-${d.heureFin}`).join(', ');
          return {
            isAvailable: false,
            reason: `Requested time is outside available hours. Available: ${availableTimes}`
          };
        }
      } else {
        console.log('⚠️ No specific availability found, using default business hours');
      }
    } catch (dispError) {
      console.warn('⚠️ Error checking Disponibilite, falling back to business hours:', dispError.message);
    }
    
    // Check if it's within the minimum advance booking time
    const minAdvanceHours = process.env.MIN_ADVANCE_BOOKING_HOURS || 2;
    if (requestedStart.isBefore(moment().add(minAdvanceHours, 'hours'))) {
      return {
        isAvailable: false,
        reason: `Must book at least ${minAdvanceHours} hours in advance`
      };
    }
    
    console.log('✅ Slot validation successful');
    return {
      isAvailable: true,
      reason: 'Time slot is available'
    };
    
  } catch (error) {
    console.error('❌ Error validating reservation slot:', error);
    return {
      isAvailable: false,
      reason: 'Error validating time slot'
    };
  }
};

/**
 * Calculate pricing for a service based on various factors
 * @param {Object} service - The service object
 * @param {string} stylistLevel - The stylist's level
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:mm format
 * @returns {Object} Pricing details
 */
const calculatePricing = (service, stylistLevel = 'junior', date, time) => {
  try {
    let basePrice = service.pricing.basePrice;
    
    // Apply stylist level pricing if available
    if (service.pricing.levelPricing && service.pricing.levelPricing[stylistLevel]) {
      basePrice = service.pricing.levelPricing[stylistLevel];
    }
    
    // Apply peak hour multiplier
    const appointmentTime = moment(`${date} ${time}`, 'YYYY-MM-DD HH:mm');
    const hour = appointmentTime.hour();
    const isWeekend = appointmentTime.day() === 0 || appointmentTime.day() === 6;
    
    let multiplier = 1;
    
    // Peak hours: evenings (5-8 PM) and weekends
    if ((hour >= 17 && hour <= 20) || isWeekend) {
      multiplier = service.pricing.peakHourMultiplier || 1.2;
    }
    
    // Special holiday pricing could be added here
    
    const finalPrice = Math.round(basePrice * multiplier * 100) / 100;
    
    return {
      price: finalPrice,
      basePrice,
      multiplier,
      breakdown: {
        base: basePrice,
        levelAdjustment: service.pricing.levelPricing?.[stylistLevel] ? 
          service.pricing.levelPricing[stylistLevel] - service.pricing.basePrice : 0,
        peakHourAdjustment: (finalPrice - basePrice),
        total: finalPrice
      }
    };
    
  } catch (error) {
    console.error('Error calculating pricing:', error);
    return {
      price: service.pricing.basePrice,
      basePrice: service.pricing.basePrice,
      multiplier: 1,
      breakdown: {
        base: service.pricing.basePrice,
        levelAdjustment: 0,
        peakHourAdjustment: 0,
        total: service.pricing.basePrice
      }
    };
  }
};

/**
 * Generate available time slots for a stylist on a given date
 * @param {string} stylistId - The stylist's ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} serviceDuration - Duration in minutes
 * @returns {Array} Array of available time slots
 */
const getAvailableTimeSlots = async (stylistId, date, serviceDuration = 60) => {
  try {
    const stylist = await User.findById(stylistId).select('stylistInfo.workingHours');
    if (!stylist || !stylist.stylistInfo?.workingHours) {
      return [];
    }
    
    const dayOfWeek = moment(date).format('dddd').toLowerCase();
    const workingDay = stylist.stylistInfo.workingHours[dayOfWeek];
    
    if (!workingDay || !workingDay.isWorking) {
      return [];
    }
    
    // Get existing reservations for the day
    const existingReservations = await Reservation.find({
      stylist: stylistId,
      date: new Date(date),
      status: { $nin: ['cancelled', 'no_show'] }
    }).select('startTime endTime').sort({ startTime: 1 });
    
    const timezone = process.env.TIMEZONE || 'America/New_York';
    const workStart = moment.tz(`${date} ${workingDay.start}`, 'YYYY-MM-DD HH:mm', timezone);
    const workEnd = moment.tz(`${date} ${workingDay.end}`, 'YYYY-MM-DD HH:mm', timezone);
    
    const slots = [];
    const slotInterval = 30; // 30-minute intervals
    
    let currentSlot = workStart.clone();
    
    while (currentSlot.clone().add(serviceDuration, 'minutes').isSameOrBefore(workEnd)) {
      const slotEnd = currentSlot.clone().add(serviceDuration, 'minutes');
      
      // Check if this slot conflicts with any existing reservation
      const hasConflict = existingReservations.some(reservation => {
        const resStart = moment.tz(`${date} ${reservation.startTime}`, 'YYYY-MM-DD HH:mm', timezone);
        const resEnd = moment.tz(`${date} ${reservation.endTime}`, 'YYYY-MM-DD HH:mm', timezone);
        
        return (currentSlot.isBefore(resEnd) && slotEnd.isAfter(resStart));
      });
      
      if (!hasConflict) {
        // Check if it's not in the past
        if (currentSlot.isAfter(moment())) {
          slots.push({
            startTime: currentSlot.format('HH:mm'),
            endTime: slotEnd.format('HH:mm'),
            available: true
          });
        }
      }
      
      currentSlot.add(slotInterval, 'minutes');
    }
    
    return slots;
    
  } catch (error) {
    console.error('Error getting available time slots:', error);
    return [];
  }
};

/**
 * Calculate optimal pricing recommendations
 * @param {Object} service - The service object
 * @param {Object} demand - Historical demand data
 * @returns {Object} Pricing recommendations
 */
const calculateDynamicPricing = (service, demand = {}) => {
  try {
    const basePrice = service.pricing.basePrice;
    let recommendedPrice = basePrice;
    
    // Increase price if high demand
    if (demand.averageBookingsPerDay > 5) {
      recommendedPrice *= 1.15; // 15% increase for high demand
    } else if (demand.averageBookingsPerDay < 2) {
      recommendedPrice *= 0.9; // 10% decrease for low demand
    }
    
    // Seasonal adjustments could be added here
    
    return {
      current: basePrice,
      recommended: Math.round(recommendedPrice * 100) / 100,
      change: Math.round((recommendedPrice - basePrice) * 100) / 100,
      changePercentage: Math.round(((recommendedPrice - basePrice) / basePrice) * 100),
      reason: demand.averageBookingsPerDay > 5 ? 'High demand' : 
              demand.averageBookingsPerDay < 2 ? 'Low demand' : 
              'Normal demand'
    };
    
  } catch (error) {
    console.error('Error calculating dynamic pricing:', error);
    return {
      current: service.pricing.basePrice,
      recommended: service.pricing.basePrice,
      change: 0,
      changePercentage: 0,
      reason: 'Error calculating'
    };
  }
};

module.exports = {
  validateReservationSlot,
  calculatePricing,
  getAvailableTimeSlots,
  calculateDynamicPricing
}; 