const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
      }
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('📴 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        console.error('Error during MongoDB shutdown:', error);
        process.exit(1);
      }
    });

    console.log(`🚀 MongoDB connected: ${conn.connection.host}:${conn.connection.port}`);
    return conn;
  } catch (error) {
    console.error(`❌ Database connection failed: ${error.message}`);
    
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Health check function
const checkDatabaseHealth = async () => {
  try {
    await mongoose.connection.db.admin().ping();
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message, timestamp: new Date() };
  }
};

module.exports = { connectDB, checkDatabaseHealth }; 