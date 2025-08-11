const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

let io;

const initializeSocketIO = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.firstName} connected:`, socket.id);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);
    
    // Join role-specific rooms
    socket.join(`role:${socket.user.role}`);
    
    // If stylist, join stylist-specific room
    if (socket.user.role === 'stylist') {
      socket.join(`stylist:${socket.userId}`);
    }

    // Handle real-time appointment updates
    socket.on('join_appointment', (appointmentId) => {
      socket.join(`appointment:${appointmentId}`);
    });

    socket.on('leave_appointment', (appointmentId) => {
      socket.leave(`appointment:${appointmentId}`);
    });

    // Handle notifications
    socket.on('mark_notification_read', async (notificationId) => {
      try {
        const Notification = require('../models/Notification');
        await Notification.findByIdAndUpdate(
          notificationId,
          { 'channels.inApp.read': true, 'channels.inApp.readAt': new Date() }
        );
        
        socket.emit('notification_updated', { id: notificationId, read: true });
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark notification as read' });
      }
    });

    // Handle appointment status updates
    socket.on('update_appointment_status', (data) => {
      // Broadcast to all users involved in the appointment
      io.to(`appointment:${data.appointmentId}`).emit('appointment_status_changed', {
        appointmentId: data.appointmentId,
        status: data.status,
        updatedBy: socket.user.firstName + ' ' + socket.user.lastName
      });
    });

    // Handle typing indicators for chat
    socket.on('typing', (data) => {
      socket.to(`appointment:${data.appointmentId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.firstName,
        isTyping: data.isTyping
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${socket.user.firstName} disconnected:`, socket.id);
    });
  });

  return io;
};

// Utility functions for sending real-time notifications
const sendNotificationToUser = (userId, notification) => {
  if (io) {
    io.to(`user:${userId}`).emit('new_notification', notification);
  }
};

const sendAppointmentUpdate = (appointmentId, update) => {
  if (io) {
    io.to(`appointment:${appointmentId}`).emit('appointment_updated', update);
  }
};

const sendToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

const sendToStylist = (stylistId, event, data) => {
  if (io) {
    io.to(`stylist:${stylistId}`).emit(event, data);
  }
};

// Send to a specific user room for custom events
const sendToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

// Broadcast system-wide announcements
const broadcastAnnouncement = (announcement) => {
  if (io) {
    io.emit('system_announcement', announcement);
  }
};

module.exports = {
  initializeSocketIO,
  sendNotificationToUser,
  sendAppointmentUpdate,
  sendToRole,
  sendToStylist,
  sendToUser,
  broadcastAnnouncement,
  getIO: () => io
}; 