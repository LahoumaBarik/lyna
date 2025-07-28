require('dotenv').config({ path: './config.env' });
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const { connectDB, checkDatabaseHealth } = require('./config/database');
const {
  generalLimiter,
  authLimiter,
  paymentLimiter,
  corsOptions,
  helmetConfig,
  sanitizeInput,
  requestLogger,
  validateApiKey
} = require('./middleware/security');

// Import routes
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const disponibiliteRoutes = require('./routes/disponibiliteRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const coiffeuseRoutes = require('./routes/coiffeuseRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const waitlistRoutes = require('./routes/waitlistRoutes');
const stylistApplicationRoutes = require('./routes/stylistApplicationRoutes');

// Import utilities
require('./utils/cron');
const { initializeSocketIO } = require('./utils/socketIO');
const { setupFileUpload } = require('./utils/fileUpload');

// Initialize Express app
const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware (apply early)
app.use(helmetConfig);
app.use(cors(corsOptions));

// Only validate API key in production
if (process.env.NODE_ENV === 'production') {
  app.use(validateApiKey);
}

// Performance middleware
app.use(compression());

// Request parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security and sanitization
app.use(sanitizeInput);

// Logging middleware
if (process.env.ENABLE_REQUEST_LOGGING === 'true') {
  app.use(requestLogger);
}

// Rate limiting (only if enabled)
if (process.env.RATE_LIMIT_ENABLED === 'true') {
  app.use('/api/auth', authLimiter);
  app.use('/api/payments', paymentLimiter);
  app.use('/api', generalLimiter);
}

// Connect to database
connectDB();

// Health check endpoints
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '2.0.0',
      database: dbHealth,
      services: {
        email: !!process.env.SMTP_USER,
        sms: !!process.env.TWILIO_ACCOUNT_SID,
        redis: process.env.ENABLE_REDIS === 'true',
        cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
        stripe: !!process.env.STRIPE_SECRET_KEY,
        paypal: !!process.env.PAYPAL_CLIENT_ID
      }
    };
    
    res.status(200).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

app.get('/api/status', (req, res) => {
  res.json({
    message: 'Modern Salon Reservation API is running',
    version: '2.0.0',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    features: {
      reviews: process.env.ENABLE_REVIEWS === 'true',
      analytics: process.env.ENABLE_ANALYTICS === 'true',
      waitlist: process.env.ENABLE_WAITLIST === 'true',
      twoFactorAuth: process.env.ENABLE_2FA === 'true',
      socialLogin: process.env.ENABLE_SOCIAL_LOGIN === 'true'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/disponibilites', disponibiliteRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coiffeuses', coiffeuseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/stylist-applications', stylistApplicationRoutes);

// File upload setup
setupFileUpload(app);

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  
  // Serve static files from the React build
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Catch-all route for API documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'Modern Salon Reservation API',
    version: '2.0.0',
    description: 'Professional salon reservation platform API with advanced features',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      services: '/api/services',
      reservations: '/api/reservations',
      payments: '/api/payments',
      users: '/api/users',
      stylists: '/api/coiffeuses',
      notifications: '/api/notifications',
      reviews: '/api/reviews',
      analytics: '/api/analytics',
      waitlist: '/api/waitlist',
      availability: '/api/disponibilites'
    },
    health: '/health',
    features: [
      'Multi-channel notifications (Email, SMS, In-app)',
      'Real-time updates via WebSocket',
      'Advanced booking management',
      'Review and rating system',
      'Business analytics and reporting',
      'Waitlist management',
      'Dynamic pricing',
      'File upload and media management',
      'Comprehensive security'
    ]
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      messages: errors,
      code: 'VALIDATION_ERROR'
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: 'Duplicate Entry',
      message: `${field} already exists`,
      code: 'DUPLICATE_ERROR'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Please login again',
      code: 'TOKEN_ERROR'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token Expired',
      message: 'Please refresh your token or login again',
      code: 'TOKEN_EXPIRED'
    });
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message;
  
  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err
    })
  });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route Not Found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    code: 'ROUTE_NOT_FOUND',
    availableEndpoints: '/api'
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n📴 Received ${signal}. Starting graceful shutdown...`);
  
  server.close(async () => {
    console.log('🔌 HTTP server closed');
    
    try {
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      console.log('📦 Database connection closed');
      
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forceful shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
🚀 Modern Salon Reservation API v2.0.0
📡 Server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV}
📊 Health check: http://localhost:${PORT}/health
📚 API docs: http://localhost:${PORT}/api
⏰ Started at: ${new Date().toISOString()}
  `);
});

// Initialize Socket.IO for real-time features
initializeSocketIO(server);

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = app; 