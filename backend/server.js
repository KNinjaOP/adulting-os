const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Initialize DB
connectDB();

// Initialize cron jobs
require('./jobs/reminderJob');

const app = express();

// Security & logging middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// API Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/dashboard', require('./routes/dashboard'));
app.use('/api/v1/documents', require('./routes/documents'));
app.use('/api/v1/subscriptions', require('./routes/subscriptions'));
app.use('/api/v1/health', require('./routes/health'));
app.use('/api/v1/vehicles', require('./routes/vehicles'));
app.use('/api/v1/warranties', require('./routes/warranties'));
app.use('/api/v1/receipts', require('./routes/receipts'));
app.use('/api/v1/deliveries', require('./routes/deliveries'));
app.use('/api/v1/deadlines', require('./routes/deadlines'));
app.use('/api/v1/notifications', require('./routes/notifications'));
app.use('/api/v1/analytics', require('./routes/analytics'));

// Health check
app.get('/api/v1/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Adulting OS API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = app;
