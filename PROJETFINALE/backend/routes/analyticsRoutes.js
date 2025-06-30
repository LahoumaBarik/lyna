const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const { Analytics, Reservation, User, Service } = require('../models');
const moment = require('moment-timezone');

const router = express.Router();

// Middleware to check admin or stylist access
const requireAnalyticsAccess = (req, res, next) => {
  if (!['admin', 'stylist'].includes(req.user.role)) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Only admins and stylists can access analytics'
    });
  }
  next();
};

// GET /api/analytics/dashboard - Main dashboard metrics
router.get('/dashboard', auth, requireRole('admin', 'receptionist'), async (req, res) => {
  try {
    const {
      period = '30', // days
      groupBy = 'day'
    } = req.query;

    const startDate = moment().subtract(parseInt(period), 'days').format('YYYY-MM-DD');
    const endDate = moment().format('YYYY-MM-DD');

    // Get analytics for date range
    const analytics = await Analytics.getDateRange(startDate, endDate);

    // Calculate summary metrics
    const summary = analytics.reduce((acc, day) => {
      acc.totalRevenue += day.revenue.total || 0;
      acc.totalBookings += day.reservations.total || 0;
      acc.completedBookings += day.reservations.completed || 0;
      acc.cancelledBookings += day.reservations.cancelled || 0;
      acc.newClients += day.reservations.newClients || 0;
      return acc;
    }, {
      totalRevenue: 0,
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      newClients: 0
    });

    // Calculate derived metrics
    summary.averageBookingValue = summary.totalBookings > 0 
      ? summary.totalRevenue / summary.totalBookings 
      : 0;
    summary.completionRate = summary.totalBookings > 0 
      ? (summary.completedBookings / summary.totalBookings) * 100 
      : 0;
    summary.cancellationRate = summary.totalBookings > 0 
      ? (summary.cancelledBookings / summary.totalBookings) * 100 
      : 0;

    // Get top performers
    const topStylists = await Analytics.getTopStylists(startDate, endDate, 5);
    const topServices = await Analytics.getTopServices(startDate, endDate, 5);

    // Revenue by period
    const revenueByPeriod = await Analytics.getRevenueByPeriod(startDate, endDate, groupBy);

    // Recent activity (last 7 days for comparison)
    const recentStartDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
    const recentAnalytics = await Analytics.getDateRange(recentStartDate, endDate);
    const recentRevenue = recentAnalytics.reduce((sum, day) => sum + (day.revenue.total || 0), 0);
    
    // Previous period for comparison
    const prevStartDate = moment().subtract(parseInt(period) * 2, 'days').format('YYYY-MM-DD');
    const prevEndDate = moment().subtract(parseInt(period), 'days').format('YYYY-MM-DD');
    const prevAnalytics = await Analytics.getDateRange(prevStartDate, prevEndDate);
    const prevRevenue = prevAnalytics.reduce((sum, day) => sum + (day.revenue.total || 0), 0);
    
    const revenueGrowth = prevRevenue > 0 ? ((summary.totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    res.json({
      summary: {
        ...summary,
        revenueGrowth,
        period: `${period} days`
      },
      charts: {
        revenueByPeriod,
        topStylists,
        topServices
      },
      analytics,
      metadata: {
        generatedAt: new Date(),
        period: { startDate, endDate, days: parseInt(period) }
      }
    });

  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to fetch dashboard analytics'
    });
  }
});

// GET /api/analytics/revenue - Detailed revenue analytics
router.get('/revenue', auth, requireRole('admin'), async (req, res) => {
  try {
    const {
      startDate = moment().subtract(30, 'days').format('YYYY-MM-DD'),
      endDate = moment().format('YYYY-MM-DD'),
      groupBy = 'day',
      stylistId
    } = req.query;

    let matchFilter = {
      date: { $gte: startDate, $lte: endDate }
    };

    // If stylist is requesting their own data
    if (req.user.role === 'stylist') {
      stylistId = req.user._id.toString();
    }

    // Revenue by period
    const revenueData = await Analytics.getRevenueByPeriod(startDate, endDate, groupBy);

    // Revenue breakdown by service category
    const serviceRevenue = await Analytics.aggregate([
      { $match: matchFilter },
      { $project: { servicesArray: { $objectToArray: '$services' } } },
      { $unwind: '$servicesArray' },
      {
        $lookup: {
          from: 'services',
          localField: 'servicesArray.k',
          foreignField: '_id',
          as: 'serviceDetails'
        }
      },
      { $unwind: '$serviceDetails' },
      {
        $group: {
          _id: '$serviceDetails.category',
          totalRevenue: { $sum: '$servicesArray.v.revenue' },
          bookingCount: { $sum: '$servicesArray.v.bookings' },
          averagePrice: { $avg: '$servicesArray.v.averagePrice' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Revenue by stylist (admin only)
    let stylistRevenue = [];
    if (req.user.role === 'admin') {
      stylistRevenue = await Analytics.getTopStylists(startDate, endDate, 20);
    }

    // Payment method breakdown
    const paymentMethods = await Reservation.aggregate([
      {
        $match: {
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$payment.method',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({
      overview: {
        totalRevenue: revenueData.reduce((sum, item) => sum + item.totalRevenue, 0),
        totalBookings: revenueData.reduce((sum, item) => sum + item.totalBookings, 0),
        averageBookingValue: revenueData.length > 0 
          ? revenueData.reduce((sum, item) => sum + item.averageBookingValue, 0) / revenueData.length 
          : 0
      },
      timeSeries: revenueData,
      breakdowns: {
        byServiceCategory: serviceRevenue,
        byStylist: stylistRevenue,
        byPaymentMethod: paymentMethods
      },
      period: { startDate, endDate, groupBy }
    });

  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to fetch revenue analytics'
    });
  }
});

// GET /api/analytics/performance - Stylist and service performance
router.get('/performance', auth, requireRole('admin'), async (req, res) => {
  try {
    const {
      startDate = moment().subtract(30, 'days').format('YYYY-MM-DD'),
      endDate = moment().format('YYYY-MM-DD'),
      stylistId
    } = req.query;

    let filter = {
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };

    // If stylist is requesting their own data
    if (req.user.role === 'stylist') {
      filter.stylist = req.user._id;
    } else if (stylistId) {
      filter.stylist = stylistId;
    }

    // Stylist performance metrics
    const stylistPerformance = await Reservation.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'stylist',
          foreignField: '_id',
          as: 'stylistInfo'
        }
      },
      { $unwind: '$stylistInfo' },
      {
        $group: {
          _id: '$stylist',
          stylistName: { $first: { $concat: ['$stylistInfo.firstName', ' ', '$stylistInfo.lastName'] } },
          totalBookings: { $sum: 1 },
          completedBookings: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelledBookings: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          noShowBookings: { $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] } },
          totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$pricing.total', 0] } },
          averageRating: { $avg: '$review.rating' },
          totalServiceTime: { $sum: { $reduce: {
            input: '$services',
            initialValue: 0,
            in: { $add: ['$$value', '$$this.duration'] }
          }}}
        }
      },
      {
        $addFields: {
          completionRate: { $multiply: [{ $divide: ['$completedBookings', '$totalBookings'] }, 100] },
          cancellationRate: { $multiply: [{ $divide: ['$cancelledBookings', '$totalBookings'] }, 100] },
          averageBookingValue: { $divide: ['$totalRevenue', '$completedBookings'] },
          hoursWorked: { $divide: ['$totalServiceTime', 60] }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Service performance
    const servicePerformance = await Reservation.aggregate([
      { $match: filter },
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
          category: { $first: '$serviceDetails.category' },
          totalBookings: { $sum: 1 },
          completedBookings: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          totalRevenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$services.price', 0] } },
          averagePrice: { $avg: '$services.price' },
          averageRating: { $avg: '$review.rating' }
        }
      },
      {
        $addFields: {
          completionRate: { $multiply: [{ $divide: ['$completedBookings', '$totalBookings'] }, 100] }
        }
      },
      { $sort: { totalBookings: -1 } }
    ]);

    // Client retention metrics
    const clientMetrics = await Reservation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$client',
          bookingCount: { $sum: 1 },
          totalSpent: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$pricing.total', 0] } },
          firstBooking: { $min: '$date' },
          lastBooking: { $max: '$date' }
        }
      },
      {
        $addFields: {
          isNewClient: { $eq: ['$bookingCount', 1] },
          isReturningClient: { $gt: ['$bookingCount', 1] },
          customerLifetime: { $divide: [{ $subtract: ['$lastBooking', '$firstBooking'] }, 1000 * 60 * 60 * 24] }
        }
      },
      {
        $group: {
          _id: null,
          totalClients: { $sum: 1 },
          newClients: { $sum: { $cond: ['$isNewClient', 1, 0] } },
          returningClients: { $sum: { $cond: ['$isReturningClient', 1, 0] } },
          averageLifetimeValue: { $avg: '$totalSpent' },
          averageBookingsPerClient: { $avg: '$bookingCount' }
        }
      }
    ]);

    res.json({
      stylists: stylistPerformance,
      services: servicePerformance,
      clientMetrics: clientMetrics[0] || {
        totalClients: 0,
        newClients: 0,
        returningClients: 0,
        averageLifetimeValue: 0,
        averageBookingsPerClient: 0
      },
      period: { startDate, endDate }
    });

  } catch (error) {
    console.error('Performance analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to fetch performance analytics'
    });
  }
});

// GET /api/analytics/trends - Trend analysis and forecasting
router.get('/trends', auth, requireRole('admin'), async (req, res) => {
  try {
    const {
      metric = 'revenue', // revenue, bookings, clients
      period = '90' // days to analyze
    } = req.query;

    const endDate = moment().format('YYYY-MM-DD');
    const startDate = moment().subtract(parseInt(period), 'days').format('YYYY-MM-DD');

    // Get daily analytics
    const analytics = await Analytics.getDateRange(startDate, endDate);

    // Calculate trends
    const trendData = analytics.map(day => ({
      date: day.date,
      value: metric === 'revenue' ? day.revenue.total :
             metric === 'bookings' ? day.reservations.total :
             metric === 'clients' ? day.reservations.newClients + day.reservations.returningClients :
             0
    }));

    // Calculate moving averages
    const movingAverage7 = [];
    const movingAverage30 = [];
    
    for (let i = 0; i < trendData.length; i++) {
      // 7-day moving average
      if (i >= 6) {
        const avg7 = trendData.slice(i - 6, i + 1).reduce((sum, item) => sum + item.value, 0) / 7;
        movingAverage7.push({ date: trendData[i].date, value: avg7 });
      }
      
      // 30-day moving average
      if (i >= 29) {
        const avg30 = trendData.slice(i - 29, i + 1).reduce((sum, item) => sum + item.value, 0) / 30;
        movingAverage30.push({ date: trendData[i].date, value: avg30 });
      }
    }

    // Calculate growth rate
    const currentPeriod = trendData.slice(-30); // Last 30 days
    const previousPeriod = trendData.slice(-60, -30); // Previous 30 days
    
    const currentAvg = currentPeriod.reduce((sum, item) => sum + item.value, 0) / currentPeriod.length;
    const previousAvg = previousPeriod.reduce((sum, item) => sum + item.value, 0) / previousPeriod.length;
    
    const growthRate = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;

    // Day of week analysis
    const dayOfWeekAnalysis = await Reservation.aggregate([
      {
        $match: {
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
          status: 'completed'
        }
      },
      {
        $addFields: {
          dayOfWeek: { $dayOfWeek: '$date' }
        }
      },
      {
        $group: {
          _id: '$dayOfWeek',
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }
      },
      {
        $addFields: {
          dayName: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 1] }, then: 'Sunday' },
                { case: { $eq: ['$_id', 2] }, then: 'Monday' },
                { case: { $eq: ['$_id', 3] }, then: 'Tuesday' },
                { case: { $eq: ['$_id', 4] }, then: 'Wednesday' },
                { case: { $eq: ['$_id', 5] }, then: 'Thursday' },
                { case: { $eq: ['$_id', 6] }, then: 'Friday' },
                { case: { $eq: ['$_id', 7] }, then: 'Saturday' }
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Time of day analysis
    const timeOfDayAnalysis = await Reservation.aggregate([
      {
        $match: {
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
          status: 'completed'
        }
      },
      {
        $addFields: {
          hour: { $toInt: { $substr: ['$startTime', 0, 2] } }
        }
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      metric,
      period: parseInt(period),
      trends: {
        raw: trendData,
        movingAverage7,
        movingAverage30,
        growthRate,
        currentAverage: currentAvg,
        previousAverage: previousAvg
      },
      patterns: {
        dayOfWeek: dayOfWeekAnalysis,
        timeOfDay: timeOfDayAnalysis
      },
      insights: {
        bestDay: dayOfWeekAnalysis.reduce((best, day) => 
          day.revenue > (best?.revenue || 0) ? day : best, null),
        bestHour: timeOfDayAnalysis.reduce((best, hour) => 
          hour.count > (best?.count || 0) ? hour : best, null),
        trendDirection: growthRate > 5 ? 'growing' : growthRate < -5 ? 'declining' : 'stable'
      }
    });

  } catch (error) {
    console.error('Trends analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to fetch trend analytics'
    });
  }
});

// POST /api/analytics/goals - Set performance goals
router.post('/goals', auth, async (req, res) => {
  try {
    // Only admin can set goals
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only admins can set performance goals'
      });
    }

    const {
      dailyRevenueTarget,
      dailyBookingTarget,
      monthlyRevenueTarget,
      monthlyBookingTarget
    } = req.body;

    const today = moment().format('YYYY-MM-DD');
    
    await Analytics.findOneAndUpdate(
      { date: today },
      {
        $set: {
          'goals.dailyRevenueTarget': dailyRevenueTarget,
          'goals.dailyBookingTarget': dailyBookingTarget,
          'goals.monthlyRevenueTarget': monthlyRevenueTarget,
          'goals.monthlyBookingTarget': monthlyBookingTarget
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Goals updated successfully',
      goals: {
        dailyRevenueTarget,
        dailyBookingTarget,
        monthlyRevenueTarget,
        monthlyBookingTarget
      }
    });

  } catch (error) {
    console.error('Goals setting error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to set goals'
    });
  }
});

// GET /api/analytics/export - Export analytics data
router.get('/export', auth, async (req, res) => {
  try {
    const {
      startDate = moment().subtract(30, 'days').format('YYYY-MM-DD'),
      endDate = moment().format('YYYY-MM-DD'),
      format = 'json' // json, csv
    } = req.query;

    const analytics = await Analytics.getDateRange(startDate, endDate);

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Date,Total Revenue,Total Bookings,Completed,Cancelled,New Clients\n';
      const csvData = analytics.map(day => 
        `${day.date},${day.revenue.total || 0},${day.reservations.total || 0},${day.reservations.completed || 0},${day.reservations.cancelled || 0},${day.reservations.newClients || 0}`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=salon-analytics-${startDate}-to-${endDate}.csv`);
      res.send(csvHeader + csvData);
    } else {
      res.json({
        exportedAt: new Date(),
        period: { startDate, endDate },
        data: analytics
      });
    }

  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to export analytics'
    });
  }
});

module.exports = router; 