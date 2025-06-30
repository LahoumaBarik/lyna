const jwt = require('jsonwebtoken');
const { User } = require('../models');
// Optional Redis for session management
let redis = null;

const initializeRedis = () => {
  try {
    if (process.env.ENABLE_REDIS === 'true') {
      const Redis = require('ioredis');
      redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        enableOfflineQueue: false
      });

      // Handle Redis connection events
      redis.on('connect', () => {
        console.log('✅ Redis connected for session management');
      });

      redis.on('error', (error) => {
        console.log('⚠️  Redis connection failed, using in-memory storage:', error.message);
        redis = null; // Disable Redis if connection fails
      });

      redis.on('close', () => {
        console.log('⚠️  Redis connection closed, switching to in-memory storage');
        redis = null;
      });

    } else {
      console.log('⚠️  Redis not configured, using in-memory session storage');
    }
  } catch (error) {
    console.log('⚠️  Redis initialization failed, using in-memory storage:', error.message);
    redis = null;
  }
};

// Initialize Redis connection
initializeRedis();

// Token blacklist for logout functionality
const tokenBlacklist = new Set();

// Enhanced JWT token generation
const generateTokens = (userId, role) => {
  const payload = { userId, role, type: 'access' };
  
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
    issuer: 'salon-app',
    audience: 'salon-users'
  });
  
  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
      issuer: 'salon-app',
      audience: 'salon-users'
    }
  );
  
  return { accessToken, refreshToken };
};

// In-memory storage fallback (use Redis if available)
const inMemoryTokens = new Map();

// Store refresh token
const storeRefreshToken = async (userId, refreshToken) => {
  if (redis) {
    try {
      const key = `refresh_token:${userId}`;
      await redis.setex(key, 7 * 24 * 60 * 60, refreshToken); // 7 days
    } catch (error) {
      console.log('⚠️  Redis store failed, using in-memory storage:', error.message);
      inMemoryTokens.set(userId, refreshToken);
    }
  } else {
    // Fallback to in-memory storage
    inMemoryTokens.set(userId, refreshToken);
  }
};

// Validate refresh token
const validateRefreshToken = async (userId, refreshToken) => {
  if (redis) {
    try {
      const key = `refresh_token:${userId}`;
      const storedToken = await redis.get(key);
      return storedToken === refreshToken;
    } catch (error) {
      console.log('⚠️  Redis validation failed, checking in-memory storage:', error.message);
      return inMemoryTokens.get(userId) === refreshToken;
    }
  } else {
    // Fallback to in-memory storage
    return inMemoryTokens.get(userId) === refreshToken;
  }
};

// Remove refresh token
const removeRefreshToken = async (userId) => {
  if (redis) {
    try {
      const key = `refresh_token:${userId}`;
      await redis.del(key);
    } catch (error) {
      console.log('⚠️  Redis removal failed, removing from in-memory storage:', error.message);
      inMemoryTokens.delete(userId);
    }
  } else {
    // Fallback to in-memory storage
    inMemoryTokens.delete(userId);
  }
};

// Enhanced authentication middleware
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied',
        code: 'NO_TOKEN',
        message: 'Authentication token required' 
      });
    }

    const token = authHeader.slice(7);
    
    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ 
        error: 'Token invalidated',
        code: 'TOKEN_BLACKLISTED',
        message: 'Please login again' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'salon-app',
      audience: 'salon-users'
    });

    // Ensure it's an access token
    if (decoded.type !== 'access') {
      return res.status(401).json({ 
        error: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE',
        message: 'Access token required' 
      });
    }

    // Check if user still exists
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND',
        message: 'User account no longer exists' 
      });
    }

    // Check if user is active
    if (user.status === 'suspended' || user.status === 'deleted') {
      return res.status(401).json({ 
        error: 'Account suspended',
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your account has been suspended' 
      });
    }

    // Store user and token info in request
    req.user = user;
    req.token = token;
    req.tokenExp = decoded.exp;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED',
        message: 'Please refresh your token' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'INVALID_TOKEN',
        message: 'Please login again' 
      });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR',
      message: 'Internal authentication error' 
    });
  }
};

// Optional authentication (for routes that work with or without auth)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.status !== 'suspended') {
      req.user = user;
      req.token = token;
    }
  } catch (error) {
    // Silently fail for optional auth
  }
  
  next();
};

// Role-based access control
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'NO_AUTH',
        message: 'Please login to access this resource' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        message: `This action requires one of the following roles: ${roles.join(', ')}` 
      });
    }

    next();
  };
};

// Permission-based access control
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'NO_AUTH'
      });
    }

    // Check if user has the required permission
    const userPermissions = req.user.permissions || [];
    if (!userPermissions.includes(permission) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Permission denied',
        code: 'PERMISSION_DENIED',
        message: `Required permission: ${permission}` 
      });
    }

    next();
  };
};

// Resource ownership check
const requireOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    const resourceId = req.params[resourceField] || req.body[resourceField];
    
    if (req.user.role === 'admin') {
      return next();
    }
    
    if (resourceId !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'Access denied',
        code: 'NOT_OWNER',
        message: 'You can only access your own resources' 
      });
    }
    
    next();
  };
};

// Session management
const invalidateUserSessions = async (userId) => {
  if (redis) {
    const pattern = `refresh_token:${userId}`;
    await redis.del(pattern);
  } else {
    // Fallback to in-memory storage
    inMemoryTokens.delete(userId);
  }
};

module.exports = {
  auth,
  optionalAuth,
  requireRole,
  requirePermission,
  requireOwnership,
  generateTokens,
  storeRefreshToken,
  validateRefreshToken,
  removeRefreshToken,
  invalidateUserSessions,
  tokenBlacklist
}; 