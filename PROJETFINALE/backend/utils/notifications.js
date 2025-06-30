const nodemailer = require('nodemailer');
const { Notification } = require('../models');
const { sendNotificationToUser } = require('./socketIO');

// Optional services (will be set up if configured)
let emailTransporter = null;
let twilioClient = null;

// Initialize email service
const initializeEmailService = () => {
  try {
    // Check if email notifications are enabled
    if (process.env.EMAIL_NOTIFICATIONS_ENABLED === 'false') {
      console.log('⚠️ Email notifications disabled - skipping email service initialization');
      return;
    }

    // Check if we have real credentials (not placeholders)
    const hasRealCredentials = process.env.SMTP_USER && 
                              process.env.SMTP_PASSWORD && 
                              !process.env.SMTP_USER.includes('YOUR_') &&
                              !process.env.SMTP_PASSWORD.includes('YOUR_');

    if (process.env.SMTP_HOST && hasRealCredentials) {
      emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      console.log('✅ Email service initialized');
    } else {
      console.log('⚠️ Email service not configured or using placeholder credentials - continuing without email notifications');
    }
  } catch (error) {
    console.log('⚠️ Email service failed to initialize:', error.message);
    emailTransporter = null;
  }
};

// Initialize SMS service (Twilio)
const initializeSMSService = () => {
  try {
    // Check if SMS notifications are enabled
    if (process.env.SMS_NOTIFICATIONS_ENABLED === 'false') {
      console.log('⚠️ SMS notifications disabled - skipping SMS service initialization');
      return;
    }

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        console.log('✅ SMS service initialized');
      } catch (error) {
        console.log('⚠️ SMS service failed to initialize:', error.message);
        twilioClient = null;
      }
    } else {
      console.log('⚠️ SMS service not configured - continuing without SMS notifications');
    }
  } catch (error) {
    console.log('⚠️ SMS service initialization error:', error.message);
    twilioClient = null;
  }
};

// Initialize services
initializeEmailService();
initializeSMSService();

// Email templates
const getEmailTemplate = (type, data) => {
  const templates = {
    welcome: {
      subject: `Welcome to ${process.env.BUSINESS_NAME || 'Modern Salon'}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome ${data.firstName}!</h2>
          <p>Thank you for joining ${process.env.BUSINESS_NAME || 'Modern Salon'}. We're excited to have you!</p>
          <p>Your account has been created successfully.</p>
          ${data.verificationUrl ? `<a href="${data.verificationUrl}" style="background: #8B5FBF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>` : ''}
          <p>Best regards,<br>The ${process.env.BUSINESS_NAME || 'Modern Salon'} Team</p>
        </div>
      `
    },
    appointment_confirmation: {
      subject: 'Appointment Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Appointment Confirmed!</h2>
          <p>Hi ${data.clientName},</p>
          <p>Your appointment has been confirmed:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Service:</strong> ${data.serviceName}</p>
            <p><strong>Stylist:</strong> ${data.stylistName}</p>
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Time:</strong> ${data.time}</p>
            <p><strong>Duration:</strong> ${data.duration}</p>
            <p><strong>Price:</strong> $${data.price}</p>
          </div>
          <p>We look forward to seeing you!</p>
          <p>Best regards,<br>The ${process.env.BUSINESS_NAME || 'Modern Salon'} Team</p>
        </div>
      `
    },
    appointment_reminder: {
      subject: 'Appointment Reminder',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Appointment Reminder</h2>
          <p>Hi ${data.clientName},</p>
          <p>This is a friendly reminder about your upcoming appointment:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Tomorrow at ${data.time}</strong></p>
            <p><strong>Service:</strong> ${data.serviceName}</p>
            <p><strong>Stylist:</strong> ${data.stylistName}</p>
          </div>
          <p>If you need to reschedule, please contact us as soon as possible.</p>
          <p>See you soon!</p>
        </div>
      `
    },
    password_reset: {
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>Hi ${data.firstName},</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${data.resetUrl}" style="background: #8B5FBF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="margin-top: 20px;">This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>The ${process.env.BUSINESS_NAME || 'Modern Salon'} Team</p>
        </div>
      `
    },
    security: {
      subject: 'New Login Detected',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Security Alert</h2>
          <p>Hi ${data.firstName},</p>
          <p>A new login was detected on your account:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Time:</strong> ${data.timestamp}</p>
            <p><strong>Device:</strong> ${data.userAgent}</p>
            <p><strong>IP Address:</strong> ${data.ip}</p>
          </div>
          <p>If this wasn't you, please contact us immediately.</p>
          <p>Best regards,<br>The ${process.env.BUSINESS_NAME || 'Modern Salon'} Team</p>
        </div>
      `
    }
  };

  return templates[type] || {
    subject: data.title || 'Notification',
    html: `<div style="font-family: Arial, sans-serif;"><p>${data.message}</p></div>`
  };
};

// Send email notification
const sendEmailNotification = async (recipient, type, data) => {
  // Check if email notifications are disabled
  if (process.env.EMAIL_NOTIFICATIONS_ENABLED === 'false') {
    console.log('📧 Email notifications disabled, skipping email notification');
    return { success: false, error: 'Email notifications disabled' };
  }

  if (!emailTransporter) {
    console.log('📧 Email not configured, skipping email notification');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const template = getEmailTemplate(type, data);
    
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: recipient.email,
      subject: template.subject,
      html: template.html
    });

    console.log(`📧 Email sent to ${recipient.email}`);
    return { success: true };
  } catch (error) {
    console.error('📧 Email error:', error);
    return { success: false, error: error.message };
  }
};

// Send SMS notification
const sendSMSNotification = async (recipient, message) => {
  if (!twilioClient) {
    console.log('📱 SMS not configured, skipping SMS notification');
    return { success: false, error: 'SMS service not configured' };
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: recipient.phone
    });

    console.log(`📱 SMS sent to ${recipient.phone}`);
    return { success: true };
  } catch (error) {
    console.error('📱 SMS error:', error);
    return { success: false, error: error.message };
  }
};

// Send in-app notification
const sendInAppNotification = async (recipient, notificationData) => {
  try {
    // Create notification in database
    const notification = new Notification({
      recipient: recipient._id,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      channels: {
        inApp: {
          sent: true,
          sentAt: new Date()
        }
      },
      metadata: notificationData.metadata || {}
    });

    await notification.save();

    // Send real-time notification via Socket.IO
    sendNotificationToUser(recipient._id, {
      id: notification._id,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      createdAt: notification.createdAt
    });

    console.log(`🔔 In-app notification sent to user ${recipient._id}`);
    return { success: true, notificationId: notification._id };
  } catch (error) {
    console.error('🔔 In-app notification error:', error);
    return { success: false, error: error.message };
  }
};

// Main notification function
const sendNotification = async (notificationData) => {
  try {
    const {
      recipient,
      title,
      message,
      type = 'info',
      channels = ['inApp'],
      metadata = {}
    } = notificationData;

    // Get recipient user data
    const { User } = require('../models');
    const recipientUser = await User.findById(recipient);
    
    if (!recipientUser) {
      console.error('❌ Recipient user not found:', recipient);
      return { success: false, error: 'Recipient not found' };
    }

    const results = {
      email: null,
      sms: null,
      inApp: null
    };

    // Send notifications based on requested channels
    if (channels.includes('email') && recipientUser.email) {
      results.email = await sendEmailNotification(recipientUser, type, {
        ...metadata,
        firstName: recipientUser.firstName,
        title,
        message
      });
    }

    if (channels.includes('sms') && recipientUser.phone) {
      results.sms = await sendSMSNotification(recipientUser, message);
    }

    if (channels.includes('inApp')) {
      results.inApp = await sendInAppNotification(recipientUser, {
        title,
        message,
        type,
        metadata
      });
    }

    // Update notification in database with channel results
    if (results.inApp && results.inApp.notificationId) {
      await Notification.findByIdAndUpdate(results.inApp.notificationId, {
        $set: {
          'channels.email.sent': !!results.email?.success,
          'channels.email.sentAt': results.email?.success ? new Date() : null,
          'channels.email.error': results.email?.error || null,
          'channels.sms.sent': !!results.sms?.success,
          'channels.sms.sentAt': results.sms?.success ? new Date() : null,
          'channels.sms.error': results.sms?.error || null
        }
      });
    }

    console.log('✅ Notification processing completed');
    return { success: true, results };
  } catch (error) {
    console.error('❌ Notification error:', error);
    return { success: false, error: error.message };
  }
};

// Batch notification function
const sendBatchNotifications = async (notifications) => {
  const results = [];
  
  for (const notification of notifications) {
    const result = await sendNotification(notification);
    results.push(result);
  }
  
  return results;
};

// Simple email function for backward compatibility
const sendEmail = async (to, subject, text) => {
  if (!emailTransporter) {
    console.log('📧 Email not configured, skipping email');
    return false;
  }
  
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject,
      text
    });
    
    console.log('📧 Email sent to:', to);
    return true;
  } catch (error) {
    console.error('📧 Email error:', error);
    return false;
  }
};

module.exports = {
  sendNotification,
  sendBatchNotifications,
  sendEmail,
  sendEmailNotification,
  sendSMSNotification,
  sendInAppNotification
}; 