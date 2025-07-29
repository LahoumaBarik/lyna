const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Rate limiting configurations
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.round(windowMs / 1000)
      });
    }
  });
};

// General rate limiter
const generalLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later'
);

// Strict rate limiter for auth endpoints (relaxed for development)
const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  process.env.NODE_ENV === 'development' ? 200 : 50, // 200 for dev, 50 for production
  'Too many authentication attempts, please try again later'
);

// Payment rate limiter
const paymentLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  10, // limit each IP to 10 payment attempts per hour
  'Too many payment attempts, please try again later'
);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://she-tgbi.onrender.com',
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Cache-Control',
    'Pragma',
    'Expires',
    'If-Modified-Since'
  ]
};

// Security headers configuration
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.paypal.com", "https://api.stripe.com"]
    }
  },
  crossOriginEmbedderPolicy: false
});

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any keys that start with '$' or contain '.'
  mongoSanitize()(req, res, () => {
    // Clean user input from malicious HTML
    xss()(req, res, () => {
      // Prevent HTTP Parameter Pollution
      hpp()(req, res, next);
    });
  });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    if (res.statusCode >= 400) {
      console.error('❌', JSON.stringify(logData));
    } else {
      console.log('✅', JSON.stringify(logData));
    }
  });
  
  next();
};

// API key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.header('X-API-Key');
  
  if (req.path.startsWith('/api/public/') || req.path === '/health') {
    return next();
  }
  
  // Check if API key is required based on environment variable
  const apiKeyRequired = process.env.API_KEY_REQUIRED === 'true';
  
  if (!apiKey && process.env.NODE_ENV === 'production' && apiKeyRequired) {
    return res.status(401).json({ error: 'API key required' });
  }
  
  next();
};

module.exports = {
  generalLimiter,
  authLimiter,
  paymentLimiter,
  corsOptions,
  helmetConfig,
  sanitizeInput,
  requestLogger,
  validateApiKey
}; 