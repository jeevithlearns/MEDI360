/**
 * MEDI-360: Personal Medical Assistance System
 * Main Server Entry Point
 * 
 * Architecture: Layered, modular, scalable
 * Security: JWT-based authentication, password hashing, rate limiting
 * Database: MongoDB with Mongoose ODM
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const chatRoutes = require('./routes/chat.routes');
const healthProfileRoutes = require('./routes/healthProfile.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// Import Error Handler
const errorHandler = require('./middleware/errorHandler');

// Initialize Express App
const app = express();

// ======================
// MIDDLEWARE CONFIGURATION
// ======================

// Security Headers
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// ======================
// DATABASE CONNECTION
// ======================

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// ======================
// ROUTES
// ======================

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MEDI-360 API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/health-profile', healthProfileRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Error Handler Middleware
app.use(errorHandler);

// ======================
// SERVER STARTUP
// ======================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('=================================');
  console.log('🏥 MEDI-360 Backend Server');
  console.log('=================================');
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
  console.log(`🌐 Listening on port ${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log('=================================');
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;
