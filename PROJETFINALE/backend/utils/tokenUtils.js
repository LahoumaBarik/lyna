const jwt = require('jsonwebtoken');
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
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
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
  generateTokens,
  storeRefreshToken,
  validateRefreshToken,
  removeRefreshToken,
  invalidateUserSessions,
  tokenBlacklist
};
