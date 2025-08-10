const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { sendNotification } = require('../utils/notifications');

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

// In-memory token storage (use Redis in production)
const refreshTokens = new Map();

// Store refresh token
const storeRefreshToken = async (userId, refreshToken) => {
  // In production, use Redis: await redis.setex(`refresh_token:${userId}`, 7 * 24 * 60 * 60, refreshToken);
  refreshTokens.set(userId.toString(), refreshToken);
};

// Remove refresh token
const removeRefreshToken = async (userId) => {
  // In production, use Redis: await redis.del(`refresh_token:${userId}`);
  refreshTokens.delete(userId.toString());
};

// Registration
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array() 
      });
    }

    const { email, password, firstName, lastName, phone, role = 'client', stylistInfo } = req.body;
    
    // Check if user already exists - handle optional phone
    const existingUserQuery = { email };
    if (phone && phone.trim()) {
      existingUserQuery.$or = [{ email }, { phone }];
      delete existingUserQuery.email;
    }
    
    const existingUser = await User.findOne(existingUserQuery);
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists',
        code: 'USER_EXISTS',
        message: 'A user with this email or phone number already exists' 
      });
    }

    // Create user data
    const userData = {
      email,
      password,
      firstName,
      lastName,
      role,
      status: 'active',
      emailVerified: false
    };

    // Only add phone if provided
    if (phone && phone.trim()) {
      userData.phone = phone;
    }

    // Add stylist info if role is stylist
    if (role === 'stylist' && stylistInfo) {
      userData.stylistInfo = stylistInfo;
    }

    const user = new User(userData);
    await user.save();

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send welcome notification (optional in development)
    try {
      await sendNotification({
        type: 'welcome',
        recipient: user._id,
        title: 'Welcome to Modern Salon!',
        message: `Welcome ${firstName}! Your account has been created successfully.`,
        channels: ['email']
      });
    } catch (emailError) {
      console.warn('⚠️ Email notification failed (registration still successful):', emailError.message);
    }

    res.status(201).json({ 
      message: 'Registration successful',
      code: 'REGISTRATION_SUCCESS',
      data: {
        message: process.env.NODE_ENV === 'development' ? 
          'Registration successful!' :
          'Please check your email to verify your account',
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      code: 'REGISTRATION_ERROR',
      message: 'Internal server error during registration'
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: errors.array() 
      });
    }

    const { email, password } = req.body;
    
    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Update failed login attempts - use proper object structure
      if (!user.loginAttempts) {
        user.loginAttempts = { count: 0 };
      }
      
      // Ensure loginAttempts is an object
      if (typeof user.loginAttempts !== 'object') {
        user.loginAttempts = { count: 0 };
      }
      
      user.loginAttempts.count = (user.loginAttempts.count || 0) + 1;
      user.loginAttempts.lastAttempt = new Date();
      
      if (user.loginAttempts.count >= 5) {
        user.loginAttempts.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await user.save();
        
        return res.status(423).json({ 
          error: 'Account locked',
          code: 'ACCOUNT_LOCKED',
          message: 'Account locked due to too many failed login attempts. Try again in 30 minutes.' 
        });
      }
      
      await user.save();
      return res.status(401).json({ 
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
        message: 'Email or password is incorrect' 
      });
    }

    // Check if account is locked
    if (user.loginAttempts?.lockedUntil && user.loginAttempts.lockedUntil > Date.now()) {
      return res.status(423).json({ 
        error: 'Account locked',
        code: 'ACCOUNT_LOCKED',
        message: 'Account is temporarily locked. Please try again later.' 
      });
    }

    // Check account status
    if (user.status === 'suspended') {
      return res.status(403).json({ 
        error: 'Account suspended',
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your account has been suspended. Contact support for assistance.' 
      });
    }

    if (user.status === 'deleted') {
      return res.status(403).json({ 
        error: 'Account deleted',
        code: 'ACCOUNT_DELETED',
        message: 'This account has been deleted.' 
      });
    }

    // Reset failed login attempts on successful login and update last login
    const updateFields = { lastLogin: new Date() };
    if (user.loginAttempts?.count > 0) {
      updateFields.loginAttempts = { 
        count: 0,
        lastAttempt: user.loginAttempts.lastAttempt // Keep the last attempt time
      };
    }
    
    // Use updateOne to avoid address field issues
    await User.updateOne({ _id: user._id }, updateFields);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    
    // Store refresh token
    await storeRefreshToken(user._id, refreshToken);

    // Send login notification for security (optional in development)
    try {
      await sendNotification({
        type: 'security',
        recipient: user._id,
        title: 'New Login Detected',
        message: 'A new login was detected on your account',
        channels: ['email'],
        metadata: {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          timestamp: new Date()
        }
      });
    } catch (emailError) {
      console.warn('⚠️ Email notification failed (login still successful):', emailError.message);
    }

    // Return user data without password
    const userData = user.toObject();
    delete userData.password;
    delete userData.emailVerificationToken;
    delete userData.passwordResetToken;

    res.json({ 
      message: 'Login successful',
      code: 'LOGIN_SUCCESS',
      data: {
        accessToken,
        refreshToken,
        user: userData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      code: 'LOGIN_ERROR',
      message: 'Internal server error during login'
    });
  }
};

// Refresh Token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        error: 'Refresh token required',
        code: 'NO_REFRESH_TOKEN',
        message: 'Refresh token is required' 
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ 
        error: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE',
        message: 'Refresh token required' 
      });
    }

    // Check if refresh token exists in storage
    const storedToken = refreshTokens.get(decoded.userId.toString());
    if (storedToken !== refreshToken) {
      return res.status(401).json({ 
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token is invalid or expired' 
      });
    }

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      await removeRefreshToken(decoded.userId);
      return res.status(401).json({ 
        error: 'User not found or inactive',
        code: 'USER_INACTIVE',
        message: 'User account is not active' 
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id, user.role);
    
    // Store new refresh token and remove old one
    await removeRefreshToken(user._id);
    await storeRefreshToken(user._id, newRefreshToken);

    res.json({ 
      message: 'Token refreshed successfully',
      code: 'TOKEN_REFRESHED',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ 
      error: 'Token refresh failed',
      code: 'TOKEN_REFRESH_ERROR',
      message: 'Failed to refresh token' 
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Remove refresh token
    await removeRefreshToken(userId);
    
    // In a production environment with Redis, you might also blacklist the access token
    // await redis.setex(`blacklist:${req.token}`, req.tokenExp - Math.floor(Date.now() / 1000), 'true');

    res.json({ 
      message: 'Logout successful',
      code: 'LOGOUT_SUCCESS'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Logout failed',
      code: 'LOGOUT_ERROR',
      message: 'Internal server error during logout'
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -emailVerificationToken -passwordResetToken')
      .populate('clientInfo.preferredStylists', 'firstName lastName stylistInfo.level');
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND',
        message: 'User account not found' 
      });
    }

    res.json({ 
      message: 'User data retrieved successfully',
      code: 'USER_DATA_SUCCESS',
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve user data',
      code: 'USER_DATA_ERROR',
      message: 'Internal server error' 
    });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender', 'address', 'clientInfo', 'stylistInfo'];
    const updates = {};

    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Handle address field transformation
    if (updates.address) {
      if (typeof updates.address === 'string') {
        // Transform string address into object format
        updates.address = {
          street: updates.address,
          city: '',
          state: '',
          zipCode: '',
          country: 'US'
        };
      } else if (typeof updates.address === 'object' && updates.address !== null) {
        // Ensure all address fields are strings and handle empty values
        updates.address = {
          street: updates.address.street || '',
          city: updates.address.city || '',
          state: updates.address.state || '',
          zipCode: updates.address.zipCode || '',
          country: updates.address.country || 'US'
        };
      } else {
        // Remove address if it's null, undefined, or invalid
        delete updates.address;
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND',
        message: 'User account not found' 
      });
    }

    res.json({ 
      message: 'Profile updated successfully',
      code: 'PROFILE_UPDATE_SUCCESS',
      data: user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      error: 'Profile update failed',
      code: 'PROFILE_UPDATE_ERROR',
      message: 'Failed to update profile' 
    });
  }
};

// Password reset request
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ 
        message: 'If an account with that email exists, a password reset link has been sent',
        code: 'RESET_EMAIL_SENT'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Development: Log reset link to console if email is disabled
    if (process.env.EMAIL_NOTIFICATIONS_ENABLED === 'false' || process.env.NODE_ENV === 'development') {
      console.log('\n🔐 PASSWORD RESET TOKEN (Development Only):');
      console.log(`👤 User: ${user.email}`);
      console.log(`🔑 Token: ${resetToken}`);
      console.log(`🌐 Reset URL: ${process.env.FRONTEND_URL}/reset-password/confirm?token=${resetToken}`);
      console.log('⏰ Expires in 1 hour\n');
    }

    // Send reset email (will skip if email disabled)
    try {
      await sendNotification({
        type: 'password_reset',
        recipient: user._id,
        title: 'Password Reset Request',
        message: 'A password reset was requested for your account',
        channels: ['email'],
        metadata: {
          resetToken,
          resetUrl: `${process.env.FRONTEND_URL}/reset-password/confirm?token=${resetToken}`
        }
      });
    } catch (emailError) {
      console.warn('⚠️ Email notification failed for password reset (token logged above)');
    }

    res.json({ 
      message: process.env.NODE_ENV === 'development' ? 
        'Password reset token generated (check console for development link)' :
        'If an account with that email exists, a password reset link has been sent',
      code: 'RESET_EMAIL_SENT'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ 
      error: 'Password reset request failed',
      code: 'RESET_REQUEST_ERROR',
      message: 'Internal server error' 
    });
  }
};

// Password reset confirmation
exports.confirmPasswordReset = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ 
        error: 'Token and new password are required',
        code: 'MISSING_REQUIRED_FIELDS',
        message: 'Reset token and new password are required' 
      });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        error: 'Invalid or expired reset token',
        code: 'INVALID_RESET_TOKEN',
        message: 'Password reset token is invalid or has expired' 
      });
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = new Date();
    await user.save();

    // Send confirmation email (will skip if email disabled)
    try {
      await sendNotification({
        type: 'password_changed',
        recipient: user._id,
        title: 'Password Changed Successfully',
        message: 'Your password has been changed successfully',
        channels: ['email']
      });
    } catch (emailError) {
      console.warn('⚠️ Email notification failed for password change confirmation');
    }

    res.json({ 
      message: 'Password reset successful',
      code: 'PASSWORD_RESET_SUCCESS'
    });
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    res.status(500).json({ 
      error: 'Password reset failed',
      code: 'PASSWORD_RESET_ERROR',
      message: 'Internal server error' 
    });
  }
}; 