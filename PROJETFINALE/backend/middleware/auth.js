const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { tokenBlacklist } = require('../utils/tokenUtils');

// Authentication middleware
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
    
    if (user && user.status === 'active') {
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

module.exports = {
  auth,
  optionalAuth,
  requireRole,
  requirePermission,
  requireOwnership
}; 