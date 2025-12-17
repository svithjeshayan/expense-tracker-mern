const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const mongoose = require('mongoose');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sanitizeMongoQuery, sanitizeXSS, validateContentType } = require('./middleware/sanitize');
const logger = require('./services/logger');

// Load env variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// ===== SECURITY MIDDLEWARE =====

// Helmet with Content Security Policy
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Required for React dev
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for dev
}));

// Rate Limiting - Global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.security('Rate limit exceeded', { ip: req.ip, path: req.path });
    res.status(429).json({ message: 'Too many requests, please try again later' });
  }
});
app.use(limiter);

// HTTP request logging
app.use(logger.http);

// CORS
app.use(cors());

// Body parsing with size limit
app.use(express.json({ limit: '10kb' }));

// Input Sanitization
app.use(sanitizeMongoQuery);
app.use(sanitizeXSS);
app.use(validateContentType);

// Rate Limiting - Auth & 2FA (Stricter in production)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 1000,
  message: { message: 'Too many login attempts, please try again later' },
  skip: (req) => req.path === '/me',
  handler: (req, res) => {
    logger.security('Auth rate limit exceeded', { ip: req.ip, email: req.body?.email });
    res.status(429).json({ message: 'Too many login attempts, please try again later' });
  }
});

// ===== ROUTES =====
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/recurring', require('./routes/recurring'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/2fa', authLimiter, require('./routes/2fa'));
app.use('/api/currency', require('./routes/currency'));

// ===== HEALTH CHECK ENDPOINTS =====

// Basic health check
app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API is running', status: 'healthy' });
});

// Liveness probe - is the server responding?
app.get('/health/live', (req, res) => {
  res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

// Readiness probe - is the server ready to accept requests?
app.get('/health/ready', async (req, res) => {
  const health = {
    status: 'ready',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };

  const isReady = mongoose.connection.readyState === 1;
  res.status(isReady ? 200 : 503).json(health);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`, { port: PORT, env: process.env.NODE_ENV });
});

// ===== GRACEFUL SHUTDOWN =====
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connection
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason: reason?.toString() });
});

// ===== BACKGROUND JOBS =====
const { startRecurringProcessor } = require('./jobs/processRecurring');
const { startBudgetAlertJob, clearOldAlerts } = require('./jobs/budgetAlertJob');

startRecurringProcessor();
startBudgetAlertJob();
clearOldAlerts();