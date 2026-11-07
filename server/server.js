const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB();

// Security headers
app.use(helmet());

// CORS configuration (allow only CLIENT_URL)
   const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
     .split(',')
     .map((s) => s.trim().replace(/\/$/, ''));
   app.use(
     cors({
       origin: allowedOrigins,
       credentials: true,
       methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
       allowedHeaders: ['Content-Type', 'Authorization'],
     })
   );

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files with specific Cross-Origin-Resource-Policy header
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(path.join(__dirname, 'uploads'))
);

// Routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.status(200).json({
    status: 'ok',
    service: 'Campus Complaint System API',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      readyState: dbState
    }
  });
});

// 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.originalUrl}`
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`[Server] Health check available at http://localhost:${PORT}/api/health`);
  console.log(`[Server] Allowed CORS origin:${allowedOrigins.join(', ')}`);
});

module.exports = { app, server };
