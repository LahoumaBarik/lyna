# 🚀 Salon Reservation App - Cyclic.sh Deployment Guide

## 📋 Prerequisites

- GitHub account with your code pushed
- MongoDB Atlas account (free)
- Cyclic.sh account (free)

## 🗄️ Step 1: Set Up MongoDB Atlas (Free Database)

### 1.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create account
3. **No credit card required** for free tier

### 1.2 Create Database Cluster
1. Choose "FREE" tier (M0)
2. Select cloud provider (AWS/Google Cloud/Azure)
3. Choose region (closest to you)
4. Click "Create Cluster"

### 1.3 Set Up Database Access
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Username: `salon-admin`
4. Password: Generate a strong password
5. Role: "Read and write to any database"
6. Click "Add User"

### 1.4 Set Up Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for deployment)
4. Click "Confirm"

### 1.5 Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `salon-reservation-platform`

**Example:**
```
mongodb+srv://salon-admin:yourpassword@cluster0.xxxxx.mongodb.net/salon-reservation-platform?retryWrites=true&w=majority
```

## 🌐 Step 2: Deploy on Cyclic.sh

### 2.1 Sign Up for Cyclic.sh
1. Go to [Cyclic.sh](https://www.cyclic.sh)
2. Click "Sign Up" and use GitHub account
3. **No credit card required** for free tier

### 2.2 Connect Your Repository
1. Click "Link Your Own"
2. Select your GitHub repository
3. Click "Connect"

### 2.3 Configure Environment Variables
Add these environment variables in Cyclic.sh dashboard:

```bash
# Database
MONGODB_URI=mongodb+srv://salon-admin:yourpassword@cluster0.xxxxx.mongodb.net/salon-reservation-platform?retryWrites=true&w=majority

# JWT Secrets (generate new ones)
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production-2024-salon
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-change-this-in-production-2024-salon

# Environment
NODE_ENV=production
PORT=3000

# Frontend URL (will be your Cyclic.sh domain)
FRONTEND_URL=https://your-app-name.cyclic.app
CLIENT_URL=https://your-app-name.cyclic.app

# Business Configuration
TIMEZONE=America/New_York
TAX_RATE=0.08
BUSINESS_NAME=Modern Salon & Spa

# Booking Rules
MAX_ADVANCE_BOOKING_DAYS=90
MIN_ADVANCE_BOOKING_HOURS=2

# Email Configuration (optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
EMAIL_NOTIFICATIONS_ENABLED=true

# SMS Configuration (optional - for notifications)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
SMS_NOTIFICATIONS_ENABLED=true

# Security
API_KEY_REQUIRED=false
RATE_LIMIT_ENABLED=true
CORS_ORIGIN=https://your-app-name.cyclic.app

# Other Settings
ENABLE_REDIS=false
ENABLE_REQUEST_LOGGING=true
LOG_LEVEL=info
```

### 2.4 Deploy
1. Click "Deploy" button
2. Wait for build to complete (2-3 minutes)
3. Your app will be live at: `https://your-app-name.cyclic.app`

## 🔧 Step 3: Post-Deployment Setup

### 3.1 Test Your App
1. Visit your deployed URL
2. Test registration/login
3. Test booking functionality
4. Test admin features

### 3.2 Create Admin User
1. Register a new user
2. Go to MongoDB Atlas
3. Find your user in the database
4. Change role from "client" to "admin"

### 3.3 Set Up Initial Data
1. Add services through admin dashboard
2. Add stylists through admin dashboard
3. Set up availability schedules

## 🔄 Step 4: Making Updates

### 4.1 Automatic Deployment
Every time you push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push origin main
# Cyclic.sh automatically redeploys
```

### 4.2 Manual Redeploy
1. Go to Cyclic.sh dashboard
2. Click "Redeploy" button
3. Wait for deployment to complete

## 🛠️ Troubleshooting

### Common Issues:

#### 1. Build Fails
- Check if all dependencies are in package.json
- Ensure Node.js version is compatible (>=18.0.0)

#### 2. Database Connection Error
- Verify MongoDB Atlas connection string
- Check network access settings
- Ensure database user has correct permissions

#### 3. Environment Variables Not Working
- Double-check variable names in Cyclic.sh
- Ensure no extra spaces or quotes
- Redeploy after adding new variables

#### 4. Frontend Not Loading
- Check if backend is serving static files correctly
- Verify API endpoints are working
- Check browser console for errors

## 📊 Monitoring

### Cyclic.sh Dashboard
- View logs in real-time
- Monitor resource usage
- Check deployment status

### MongoDB Atlas
- Monitor database performance
- View connection statistics
- Check storage usage

## 🔒 Security Notes

1. **Change default passwords** in production
2. **Use strong JWT secrets**
3. **Enable HTTPS** (automatic with Cyclic.sh)
4. **Regular backups** (MongoDB Atlas handles this)

## 🎉 Success!

Your salon reservation app is now:
- ✅ **Live on the internet**
- ✅ **Accessible from anywhere**
- ✅ **Automatically deploying** from GitHub
- ✅ **Database backed** with MongoDB Atlas
- ✅ **Free to host** (within limits)

## 📞 Support

- **Cyclic.sh Docs**: https://docs.cyclic.sh
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **GitHub Issues**: For code-related problems

---

**🎓 Perfect for School Projects!**
This deployment shows:
- Full-stack development skills
- Database management
- Cloud deployment
- Production environment setup
- Real-world application deployment 